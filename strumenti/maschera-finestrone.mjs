import { execFileSync } from 'node:child_process'
import { readFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * RICAVA LA MASCHERA DEL FINESTRONE DAL MOVIMENTO, non dal colore.
 *
 *     node strumenti/maschera-finestrone.mjs <salone.mp4> <maschera.png>
 *
 * ─── L'IDEA, ed e' la piu' semplice che abbiamo trovato in tutto il capitolo
 *
 * **Il vetro e' dove l'immagine cambia nel tempo.** Fuori c'e' il mare, che si
 * muove a ogni fotogramma; dentro c'e' una stanza ferma, dove si muovono solo
 * due persone. Confrontando i fotogrammi fra loro, il finestrone si disegna da
 * solo.
 *
 * Le versioni precedenti cercavano i vetri dal COLORE — il mare e' freddo, il
 * legno e' caldo — e funzionava finche' l'interno era grigio e piatto. In un
 * salone vero, con noce lucido e lampade accese, quel discriminante si e'
 * sbriciolato: misurato su questa immagine, la regione "fredda" copriva il 50%
 * del fotogramma e includeva mezza stanza. Il movimento invece non si confonde
 * con niente: nessuna parete si muove.
 *
 * ─── PERCHE' SERVE
 *
 * Il capitolo disegna la STESSA clip due volte: una ferma, che si vede
 * attraverso il vetro ed e' il mare che non si inclina mai; una che ruota col
 * rollio vero, ed e' la stanza. Questa maschera dice dove finisce l'una e
 * comincia l'altra.
 *
 * Ed e' l'unica maschera rimasta. Prima ce n'erano tre — finestrini, persone,
 * complemento — e si combattevano fra loro: la maschera dei finestrini bucava
 * anche il ritaglio delle persone, e da li' nascevano le quattro persone a
 * schermo e l'alone attorno ai volti. Con un finestrone solo, e nessuno davanti
 * al vetro, quei difetti non possono piu' esistere per costruzione.
 *
 * ─── IL VERSO
 *
 * Con `mask-mode: luminance` il BIANCO mostra. Lo strato della stanza deve
 * essere bucato dove c'e' il vetro, quindi **il vetro esce NERO** e la stanza
 * bianca. E' il verso opposto a quello intuitivo, ed e' gia' costato una volta:
 * scritta al contrario, la stanza compariva solo dentro il finestrino.
 */

const [filmato, uscita] = process.argv.slice(2)
if (!filmato || !uscita) {
  console.error('  uso: node strumenti/maschera-finestrone.mjs <salone.mp4> <maschera.png>')
  process.exit(2)
}

const [W, H] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', filmato]).toString().trim().split('x').map(Number)

const grezzo = join(tmpdir(), 'mf-' + Date.now() + '.gray')
execFileSync('ffmpeg', ['-loglevel', 'error', '-i', filmato, '-vf', 'fps=3', '-vsync', '0',
  '-f', 'rawvideo', '-pix_fmt', 'gray', '-y', grezzo])
const d = readFileSync(grezzo)
unlinkSync(grezzo)
const N = Math.floor(d.length / (W * H))
console.log(`  ${W}x${H} · ${N} fotogrammi campionati`)
if (N < 6) { console.error('  ROTTO  troppo pochi fotogrammi per misurare il movimento.'); process.exit(1) }

/**
 * Il movimento di ogni pixel: lo scarto massimo fra due fotogrammi qualsiasi.
 * Il massimo e non la media, perche' un'onda passa e torna — e la media di una
 * cosa che va e viene la sottostima.
 */
const min = new Uint8Array(W * H).fill(255)
const max = new Uint8Array(W * H)
for (let k = 0; k < N; k++) {
  const g = d.subarray(k * W * H, (k + 1) * W * H)
  for (let p = 0; p < W * H; p++) {
    if (g[p] < min[p]) min[p] = g[p]
    if (g[p] > max[p]) max[p] = g[p]
  }
}
const moto = new Uint8Array(W * H)
for (let p = 0; p < W * H; p++) moto[p] = max[p] - min[p]

/** La soglia si sceglie dai dati: fra il mare e la stanza c'e' un abisso. */
const ord = [...moto].sort((a, b) => a - b)
const q = (f) => ord[Math.floor(f * ord.length)]
console.log(`  movimento: mediana ${q(0.5)} · 75% ${q(0.75)} · 90% ${q(0.9)} · massimo ${ord[ord.length - 1]}`)
const SOGLIA = Math.max(18, Math.round(q(0.55) + (q(0.95) - q(0.55)) * 0.25))
console.log(`  soglia scelta: ${SOGLIA}`)

const vivo = new Uint8Array(W * H)
for (let p = 0; p < W * H; p++) vivo[p] = moto[p] > SOGLIA ? 1 : 0

/** La macchia piu' grande e' il finestrone; il resto e' gente che si muove. */
const coda = new Int32Array(W * H)
const visto = new Uint8Array(W * H)
let miglior = null
for (let s = 0; s < W * H; s++) {
  if (!vivo[s] || visto[s]) continue
  let t = 0, f = 0
  const gruppo = []
  coda[f++] = s; visto[s] = 1
  while (t < f) {
    const p = coda[t++]; gruppo.push(p)
    const x = p % W, y = (p / W) | 0
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const r = ny * W + nx
      if (!visto[r] && vivo[r]) { visto[r] = 1; coda[f++] = r }
    }
  }
  if (!miglior || gruppo.length > miglior.length) miglior = gruppo
}
if (!miglior || miglior.length < W * H * 0.05) {
  console.error('  ROTTO  non trovo un finestrone: la regione che si muove e\' troppo piccola.')
  process.exit(1)
}
console.log(`  finestrone: ${(100 * miglior.length / (W * H)).toFixed(1)}% dell'immagine`)

/**
 * SI RIEMPIE PER RIGHE, e serve.
 *
 * Il mare non si muove ovunque allo stesso modo: vicino all'orizzonte l'acqua
 * e' quasi ferma, quindi la macchia esce bucata proprio dove passa la linea che
 * tutto il capitolo esiste per mostrare. Riempiendo fra il primo e l'ultimo
 * pixel vivo di ogni riga, il vetro torna una superficie sola.
 */
const dentro = new Uint8Array(W * H)
for (const p of miglior) dentro[p] = 1
for (let y = 0; y < H; y++) {
  let a = -1, b = -1
  for (let x = 0; x < W; x++) if (dentro[y * W + x]) { if (a < 0) a = x; b = x }
  if (a >= 0) for (let x = a; x <= b; x++) dentro[y * W + x] = 1
}
let area = 0
for (let p = 0; p < W * H; p++) area += dentro[p]
console.log(`  dopo il riempimento per righe: ${(100 * area / (W * H)).toFixed(1)}%`)

/**
 * ─── E POI SI SALE VERSO IL CIELO, che non si muove abbastanza
 *
 * Il mare si muove, le nuvole quasi no: misurato, la parte alta del vetro
 * restava FUORI dalla maschera e sarebbe ruotata insieme alla stanza — cioe' si
 * sarebbe visto inclinare il cielo mentre il mare restava fermo, che e' peggio
 * di non fare niente.
 *
 * Il movimento da' il mare; da li' si sale colonna per colonna finche' il pixel
 * e' **freddo**, e ci si ferma sul legno. Il discriminante di colore, che da
 * solo non reggeva — su questa immagine la regione fredda copriva mezza stanza —
 * qui funziona benissimo, perche' non deve trovare il vetro: deve solo dire
 * dove finisce. Un metro debole usato per la domanda giusta vale piu' di un
 * metro forte usato per quella sbagliata.
 */
const colori = join(tmpdir(), 'mf-rgb-' + Date.now() + '.rgb')
execFileSync('ffmpeg', ['-loglevel', 'error', '-i', filmato, '-frames:v', '1',
  '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-y', colori])
const rgb = readFileSync(colori)
unlinkSync(colori)
const freddo = (p) => rgb[p * 3 + 2] - rgb[p * 3]     // blu meno rosso
const chiaro = (p) => (rgb[p * 3] + rgb[p * 3 + 1] + rgb[p * 3 + 2]) / 3

let saliti = 0
for (let x = 0; x < W; x++) {
  // la riga piu' alta gia' dentro, in questa colonna
  let cima = -1
  for (let y = 0; y < H; y++) if (dentro[y * W + x]) { cima = y; break }
  if (cima < 0) continue
  for (let y = cima - 1; y >= 0; y--) {
    const p = y * W + x
    if (freddo(p) < 2 || chiaro(p) < 40) break   // legno caldo, o buio: e' la cornice
    dentro[p] = 1; saliti++
  }
}
console.log(`  saliti nel cielo: ${saliti} px`)
let area2 = 0
for (let p = 0; p < W * H; p++) area2 += dentro[p]
console.log(`  finestrone completo: ${(100 * area2 / (W * H)).toFixed(1)}%`)

/**
 * ─── E SI TAPPANO I BUCHI, che stanno tutti sull'orizzonte
 *
 * Dentro il vetro restavano isole bianche: sono i punti in cui l'acqua e' quasi
 * ferma, e stanno **proprio sulla linea dell'orizzonte** — cioe' sulla cosa che
 * tutto il capitolo esiste per mostrare. Ruotando la stanza, quelle isole
 * avrebbero girato dentro un mare fermo.
 *
 * Si riempiono per definizione, non per soglia: si allaga il fuori partendo dai
 * bordi dell'immagine, e ogni bianco che l'allagamento non raggiunge e' un buco
 * dentro il vetro.
 */
{
  const fuori = new Uint8Array(W * H)
  let t = 0, f = 0
  const spingi = (p) => { if (!fuori[p] && !dentro[p]) { fuori[p] = 1; coda[f++] = p } }
  for (let x = 0; x < W; x++) { spingi(x); spingi((H - 1) * W + x) }
  for (let y = 0; y < H; y++) { spingi(y * W); spingi(y * W + W - 1) }
  while (t < f) {
    const p = coda[t++]
    const x = p % W, y = (p / W) | 0
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      spingi(ny * W + nx)
    }
  }
  let tappati = 0
  for (let p = 0; p < W * H; p++) if (!dentro[p] && !fuori[p]) { dentro[p] = 1; tappati++ }
  console.log(`  buchi tappati dentro il vetro: ${tappati} px`)
}

/**
 * E si ritira di qualche pixel invece di allargarsi: meglio un filo di vetro
 * che resta nella stanza — e li' le due sorgenti sono la stessa clip, quindi
 * non si vede — che un filo di stanza che finisce nel mare, dove si vedrebbe
 * ruotare.
 */
const RITIRO = 3
const finale = Buffer.alloc(W * H, 255)
let buco = 0
for (let y = RITIRO; y < H - RITIRO; y++) {
  for (let x = RITIRO; x < W - RITIRO; x++) {
    let tutti = 1
    for (let dy = -RITIRO; dy <= RITIRO && tutti; dy++) {
      for (let dx = -RITIRO; dx <= RITIRO; dx++) {
        if (!dentro[(y + dy) * W + x + dx]) { tutti = 0; break }
      }
    }
    if (tutti) { finale[y * W + x] = 0; buco++ }
  }
}
console.log(`  buco finale: ${(100 * buco / (W * H)).toFixed(1)}% (nero = vetro, bianco = stanza)`)

execFileSync('ffmpeg', ['-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'gray',
  '-s', `${W}x${H}`, '-i', 'pipe:0', '-y', uscita], { input: finale })
console.log(`  scritta ${uscita}`)
