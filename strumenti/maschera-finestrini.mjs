import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * RICAVA LA MASCHERA DEI FINESTRINI DALLA FOTOGRAFIA STESSA.
 *
 *     node strumenti/maschera-finestrini.mjs public/salone/calma.jpg public/salone/calma-maschera.png
 *
 * PERCHE' NON DALLA SAGOMA, che sarebbe stato l'ovvio.
 *
 * La maschera nasceva dalla scena 3D — stessa geometria, quindi in teoria
 * combaciante al pixel. **Non combacia.** Il modello generativo che veste la
 * sagoma riquadra: nella fotografia la fascia dei finestrini e' piu' alta e i
 * montanti sono in altri punti. Sovrapposte, la maschera della sagoma scopre un
 * bordo di finestrino da un lato e ne copre un altro — cioe' esattamente
 * l'alone che tutto questo metodo esisteva per evitare. Verificato guardando le
 * due immagini sovrapposte al 55%, non dedotto.
 *
 * Quindi la maschera si ricava dalla FOTO. E c'e' un discriminante netto,
 * misurato campionando i pixel:
 *
 *   dentro la finestra   cielo  rgb(244,245,247)   R-B =  -3
 *                        mare   rgb(213,218,221)   R-B =  -8
 *   dentro la stanza     parete rgb(132,114, 94)   R-B = +38
 *                        divano rgb(169,152,132)   R-B = +37
 *                        pavim. rgb(105, 78, 57)   R-B = +48
 *   i montanti                  rgb( 34, 34, 34)   R-B =   0  ma SCURI
 *
 * Il mare e il cielo sono **neutri o freddi e chiari**; tutto l'interno e'
 * **caldo**; i montanti sono neutri ma scuri. Due soglie separano i tre casi, e
 * nessuna e' al limite: il margine piu' stretto e' di quindici punti.
 *
 * E le persone dentro la fascia restano fuori da sole: la testa dell'uomo, che
 * si sovrappone a un finestrino, da' R-B = +66. La pelle e' calda.
 */

const [sorgente, destinazione] = process.argv.slice(2)
if (!sorgente || !destinazione) {
  console.error('  uso: node strumenti/maschera-finestrini.mjs <foto.jpg> <maschera.png>')
  process.exit(2)
}

const grezzo = join(tmpdir(), 'maschera-' + Date.now() + '.rgb')

/** Le dimensioni si chiedono a ffprobe: indovinarle e' come non misurare. */
const info = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', sorgente]).toString().trim()
const [W, H] = info.split('x').map(Number)

execFileSync('ffmpeg', ['-loglevel', 'error', '-i', sorgente,
  '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-y', grezzo])
const d = readFileSync(grezzo)
unlinkSync(grezzo)

const FREDDO = 12     // R-B sotto questo = neutro o freddo, cioe' fuori
const CHIARO = 170    // e abbastanza luminoso da non essere un montante

const dentroFinestra = (x, y) => {
  const i = (y * W + x) * 3
  const r = d[i], g = d[i + 1], b = d[i + 2]
  return (r - b) < FREDDO && (r + g + b) / 3 > CHIARO
}

/**
 * PRIMA SI TROVA LA FASCIA, poi si guarda dentro. Senza questo passo, ogni
 * riflesso chiaro sul pavimento o una camicia bianca in piena luce
 * diventerebbero un buco nel mezzo del salone — e il mare comparirebbe sotto un
 * divano.
 */
const perRiga = []
for (let y = 0; y < H; y++) {
  let n = 0
  for (let x = 0; x < W; x += 2) if (dentroFinestra(x, y)) n++
  perRiga.push(n * 2)
}
const soglia = Math.max(...perRiga) * 0.35
let alto = perRiga.findIndex(n => n > soglia)
let basso = perRiga.length - 1 - [...perRiga].reverse().findIndex(n => n > soglia)
console.log(`  fascia dei finestrini: righe ${alto}-${basso} di ${H}`)

/**
 * LA MASCHERA ESCE INVERTITA, ed e' il verso giusto.
 *
 * Con `mask-mode: luminance` il BIANCO mostra e il nero nasconde. Qui il buco
 * va fatto dove c'e' la finestra, quindi la finestra dev'essere NERA e tutto il
 * resto bianco. Scritta nel verso intuitivo — bianco dove c'e' il vetro — si
 * ottiene l'opposto esatto: la stanza compare solo dentro i finestrini e il
 * mare copre tutto il salone. Visto succedere, e per un istante sembrava un
 * problema di allineamento invece che di segno.
 */
const m = Buffer.alloc(W * H, 255)
let buchi = 0
for (let y = alto; y <= basso; y++) {
  for (let x = 0; x < W; x++) {
    if (dentroFinestra(x, y)) { m[y * W + x] = 0; buchi++ }
  }
}
console.log(`  ${(100 * buchi / (W * H)).toFixed(1)}% dell'immagine e' finestra`)

/**
 * Una passata di chiusura: si riempiono i buchi di uno o due pixel dentro la
 * finestra (rumore della compressione jpeg sulle creste bianche delle onde) e
 * si tolgono i punti isolati fuori. Una maschera crivellata di puntini fa
 * lampeggiare il mare attraverso, ed e' un difetto che si vede solo in
 * movimento.
 */
const pulita = Buffer.from(m)
for (let y = alto + 1; y < basso; y++) {
  for (let x = 1; x < W - 1; x++) {
    let n = 0
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (dx || dy) n += m[(y + dy) * W + (x + dx)] ? 0 : 1
    }
    // si contano i vicini BUCATI, coerentemente col verso invertito
    if (n >= 6) pulita[y * W + x] = 0
    else if (n <= 2) pulita[y * W + x] = 255
  }
}

const grezzo2 = join(tmpdir(), 'maschera-out-' + Date.now() + '.gray')
writeFileSync(grezzo2, pulita)
execFileSync('ffmpeg', ['-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'gray',
  '-s', `${W}x${H}`, '-i', grezzo2, '-y', destinazione])
unlinkSync(grezzo2)
console.log(`  scritta ${destinazione}`)
