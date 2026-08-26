import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * RICAVA LA MASCHERA DELLE PERSONE dal confronto fra le due pose.
 *
 *     node strumenti/maschera-persone.mjs calma.jpg tesa.jpg persone-maschera.png
 *
 * PERCHE' SERVE, ed e' un difetto che ha visto il committente prima di me.
 *
 * Le due fotografie sono generate una dall'altra, quindi in teoria differiscono
 * solo per la posa. **In pratica no.** Confrontandole pixel per pixel, oltre
 * alle due figure cambiano anche i cuscini e il bordo del tavolo: il modello
 * non ricopia, rigenera, e quello che rigenera non torna mai identico.
 *
 * Dissolvendo le due immagini INTERE, durante la transizione i cuscini si
 * trasformano — e a transizione finita la stanza ha mobili leggermente diversi.
 * Non e' un difetto della dissolvenza: e' che si stava dissolvendo troppo.
 *
 * Quindi la stanza viene SEMPRE dalla posa calma, e solo le persone si
 * scambiano. La maschera che dice dove sono le persone si ricava dalla
 * **differenza** fra le due immagini: dove sono uguali non c'e' niente da
 * sostituire, dove differiscono c'e' un corpo che si e' mosso.
 *
 * Si tengono solo le due macchie piu' grandi. Le differenze sparse — un cuscino
 * che cambia grana, un bordo che si sposta di due pixel — sono proprio quelle
 * che vanno buttate.
 */

const [aFile, bFile, uscita] = process.argv.slice(2)
if (!aFile || !bFile || !uscita) {
  console.error('  uso: node strumenti/maschera-persone.mjs <calma.jpg> <tesa.jpg> <maschera.png>')
  process.exit(2)
}

const dim = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', aFile]).toString().trim()
const [W, H] = dim.split('x').map(Number)

const grezzo = (f) => {
  const o = join(tmpdir(), 'mp-' + Math.abs(f.length * 7919) + '-' + Date.now() + '.rgb')
  execFileSync('ffmpeg', ['-loglevel', 'error', '-i', f, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-y', o])
  const d = readFileSync(o); unlinkSync(o); return d
}
const A = grezzo(aFile), B = grezzo(bFile)

const SOGLIA = 34   // differenza media per canale sopra cui si considera "cambiato"

const cambiato = new Uint8Array(W * H)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3
    const d = (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2])) / 3
    cambiato[y * W + x] = d > SOGLIA ? 1 : 0
  }
}

/**
 * NON LA DIFFERENZA PIXEL PER PIXEL: DUE REGIONI.
 *
 * DUE TENTATIVI SBAGLIATI PRIMA DI CAPIRE, e il secondo era istruttivo.
 *
 * Primo: tenere le due macchie di differenza piu' grandi. A schermo comparivano
 * **quattro persone** — si prendevano le figure della posa tesa e si lasciavano
 * scoperte quelle della calma, che nella differenza sono macchie separate.
 *
 * Secondo: tenere tutte le macchie sopra una soglia. Ancora quattro persone. E
 * qui sta il motivo vero, che una soglia piu' bassa non risolve: dove la donna
 * calma siede, la sua **camicia bianca sta su un divano crema**. La differenza
 * fra i due e' di pochi punti — sotto qualunque soglia che non raccolga anche
 * il rumore di rigenerazione di tutta la stanza. Un ritaglio basato sulla
 * differenza **fallisce proprio dove chiaro sta su chiaro**, che nel salone di
 * uno yacht e' quasi ovunque.
 *
 * Quindi non si insegue la sagoma: si prendono DUE REGIONI generose attorno
 * alle figure, coi bordi sfumati. Il divano dentro quelle regioni viene dalla
 * posa tesa invece che dalla calma, e va benissimo — e' lo stesso divano
 * fotografato due volte, e le piccole differenze di grana stanno dove c'e'
 * comunque una persona sopra. Fuori da li' la stanza non cambia mai di un
 * pixel, ed e' quello che il committente aveva chiesto vedendo i cuscini
 * diversi.
 */
/**
 * IL RIQUADRO SI PRENDE DALLA MACCHIA PIU' GRANDE DI OGNI LATO, non da tutti i
 * pixel cambiati. Prendendo tutti, il rumore sparso sui cuscini allargava i
 * riquadri fino a coprire il **71,5%** dell'immagine: cioe' si tornava a
 * scambiare quasi tutta la stanza, che e' il difetto da cui si era partiti.
 */
const etichetta = new Int32Array(W * H).fill(-1)
const aree = []
const coda = new Int32Array(W * H)
for (let p = 0; p < W * H; p++) {
  if (!cambiato[p] || etichetta[p] >= 0) continue
  const e = aree.length
  let testa = 0, fine = 0
  coda[fine++] = p; etichetta[p] = e
  let n = 0, x0 = W, x1 = 0, y0 = H, y1 = 0
  while (testa < fine) {
    const q = coda[testa++]; n++
    const qx = q % W, qy = (q / W) | 0
    if (qx < x0) x0 = qx; if (qx > x1) x1 = qx
    if (qy < y0) y0 = qy; if (qy > y1) y1 = qy
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = qx + dx, ny = qy + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const r = ny * W + nx
      if (cambiato[r] && etichetta[r] < 0) { etichetta[r] = e; coda[fine++] = r }
    }
  }
  aree.push({ e, n, x0, x1, y0, y1, cx: (x0 + x1) / 2 })
}

/**
 * SI TENGONO LE MACCHIE DI TAGLIA UMANA E SI DILATANO FINO A SALDARSI.
 *
 * Il riquadro rettangolare era il tentativo precedente e prendeva sempre troppo:
 * basta che una macchia sia il bordo del tavolo perche' il rettangolo scenda
 * fino al pavimento — **50,9% dell'immagine**, cioe' di nuovo mezza stanza
 * scambiata. Un rettangolo non conosce la forma di quello che contiene.
 *
 * La dilatazione la conosce. Ogni macchia si allarga di un raggio ampio: le due
 * posizioni della stessa persona — quella calma piu' indietro, quella tesa piu'
 * avanti — si toccano e diventano una sola regione, e il resto della stanza non
 * viene toccato perche' li' non c'e' niente da dilatare.
 *
 * IL RAGGIO DEV'ESSERE AMPIO, e la ragione non e' cosmetica. Con raggio 22 si
 * vedevano ancora quattro persone: dove la camicia bianca della donna calma sta
 * sul divano crema **non c'e' differenza da dilatare**, quindi restava un buco
 * dentro la sua sagoma e attraverso quel buco la si vedeva. Il raggio serve a
 * scavalcare i buchi che la differenza non ha visto, non ad ammorbidire il bordo.
 *
 * La soglia di taglia separa due popolazioni misurate: le persone stanno fra
 * 2343 e 14111 px, il rumore di rigenerazione dei cuscini sotto 1200.
 */
const UMANA = 2000
const RAGGIO = 46
const tenute = aree.filter(a => a.n >= UMANA)
if (!tenute.length) { console.error('  ROTTO: nessuna macchia di taglia umana'); process.exit(1) }
console.log(`  ${aree.length} macchie; tenute le ${tenute.length} sopra ${UMANA} px: ${tenute.map(a => a.n).sort((x, y) => y - x).join(', ')}`)

const m = new Float32Array(W * H)
for (let p = 0; p < W * H; p++) if (cambiato[p] && tenute.some(a => a.e === etichetta[p])) m[p] = 1

const sfoca = (src, r) => {
  const t = new Float32Array(W * H), o = new Float32Array(W * H)
  for (let y = 0; y < H; y++) {
    let s = 0
    for (let x = 0; x < W; x++) {
      s += src[y * W + x]
      if (x > r * 2) s -= src[y * W + x - r * 2 - 1]
      t[y * W + Math.max(0, x - r)] = s / (r * 2 + 1)
    }
  }
  for (let x = 0; x < W; x++) {
    let s = 0
    for (let y = 0; y < H; y++) {
      s += t[y * W + x]
      if (y > r * 2) s -= t[(y - r * 2 - 1) * W + x]
      o[Math.max(0, y - r) * W + x] = s / (r * 2 + 1)
    }
  }
  return o
}
/**
 * Dilatare = sfocare ampio e tagliare basso. Il taglio a 0,015 fa si' che
 * bastino pochi pixel di macchia nel raggio perche' il punto entri nella
 * regione: e' quello che scavalca i buchi.
 */
const largo = sfoca(m, RAGGIO)
const pieno = new Float32Array(W * H)
for (let p = 0; p < W * H; p++) pieno[p] = largo[p] > 0.015 ? 1 : 0
/** Poi il bordo si ammorbidisce: un contorno netto attorno a una persona si vede come un adesivo. */
const morbido = sfoca(pieno, 14)

const fuori = Buffer.alloc(W * H)
let area = 0
for (let p = 0; p < W * H; p++) {
  const v = Math.max(0, Math.min(1, morbido[p]))
  fuori[p] = Math.round(v * 255)
  area += v
}
console.log(`  la maschera copre il ${(100 * area / (W * H)).toFixed(1)}% dell'immagine`)

/**
 * SI SCRIVE ANCHE IL COMPLEMENTO, e serve a un terzo strato.
 *
 * La stanza fuori dalla regione delle persone dev'essere sempre visibile e non
 * dissolversi mai. La si ottiene con la maschera girata, e la si genera qui
 * invece che nel CSS perche' `mask-composite: subtract` ha una sintassi diversa
 * fra standard e prefisso webkit: un file in piu' da 3 KB costa meno di un
 * ramo che funziona su un motore solo.
 */
const scrivi = (dati, dove) => {
  const tmp = join(tmpdir(), 'mp-out-' + Math.abs(dove.length * 7919) + '-' + Date.now() + '.gray')
  writeFileSync(tmp, dati)
  execFileSync('ffmpeg', ['-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'gray',
    '-s', `${W}x${H}`, '-i', tmp, '-y', dove])
  unlinkSync(tmp)
  console.log(`  scritta ${dove}`)
}
scrivi(fuori, uscita)

const dentro = Buffer.alloc(W * H)
for (let p = 0; p < W * H; p++) dentro[p] = 255 - fuori[p]
scrivi(dentro, uscita.replace(/\.png$/, '-fuori.png'))
