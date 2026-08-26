import { execFileSync } from 'node:child_process'
import { readFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * COLLAUDO DI UN FILMATO DELLA STANZA — la camera deve stare ferma.
 *
 *     node strumenti/collaudo-filmato.mjs <file.mp4>
 *
 * PERCHE' ESISTE, e nasce da un filmato che sembrava perfetto.
 *
 * Il capitolo del salone e' ibrido: **il filmato da' la vita** (respiro,
 * capelli, il vino che trema, la mano che va a puntellarsi) e **la simulazione
 * da' l'inclinazione**. Se si muove anche il filmato i due movimenti si sommano
 * a caso, e soprattutto l'orizzonte dentro i vetri si inclina insieme alla
 * stanza — che e' esattamente cio' che succede quando lo stabilizzatore NON
 * c'e'. Il capitolo direbbe il contrario di quello che dimostra.
 *
 * Il primo filmato generato aveva la stanza diritta, l'orizzonte piatto, le
 * persone giuste — e **una lentissima carrellata in avanti**, che il prompt
 * negativo vietava e che a occhio non si nota. La maschera dei finestrini e'
 * fissa: se i vetri si ingrandiscono escono da sotto i loro buchi e il mare
 * compare sul divano. E la carrellata non si toglie dopo: `vidstab` corregge
 * traslazione e rotazione, **non la scala**.
 *
 * ─── DUE STRUMENTI SBAGLIATI PRIMA DI QUESTO, e vale la pena saperlo
 *
 * **Primo.** Cercare l'orizzonte come il salto di luminanza piu' forte dentro
 * la fascia dei vetri. Nel primo secondo il mare e' annegato nella foschia,
 * quindi il salto piu' forte non era l'orizzonte, **era il davanzale**: ne
 * usciva 2,43 gradi di inclinazione, un numero che descriveva un pezzo di
 * arredamento. Stavo per far rigenerare un filmato per un difetto che non
 * aveva.
 *
 * **Secondo.** Adattare il profilo per righe — la luminanza media di ogni riga
 * — fra un fotogramma e il primo, cercando scala e spostamento. Sembra solido e
 * non lo e': su un mare, che ha un profilo a rampa liscia, ingrandire e
 * spostare producono quasi la stessa cosa, quindi il conto si appoggia dove
 * capita e il residuo resta bassissimo perche' una rampa combacia sempre con se
 * stessa. Stampava **10,6% di carrellata su un filmato che sta fermo**.
 *
 * E il guasto non era solo del mare. Misurando quanto si puo' sbagliare la
 * scala prima che il residuo peggiori del 5%, anche sulla stanza veniva fuori
 * **1,6%**: tre volte piu' largo del tetto da verificare. Non era tarato male,
 * era proprio cieco a quella grandezza.
 *
 * ─── LO STRUMENTO GIUSTO: DUE BORDI E LA LORO DISTANZA
 *
 * Nel salone ci sono due bordi orizzontali netti e lunghi — il taglio in alto
 * della fascia dei vetri e la linea in basso dove il divano incontra il
 * pavimento. La loro **distanza** e' l'ingrandimento, il loro **punto medio** e'
 * la traslazione, e la differenza fra meta' sinistra e meta' destra e' la
 * rotazione.
 *
 * Ha la leva che al profilo mancava: i due bordi distano centinaia di righe,
 * quindi lo 0,5% di scala li allontana di qualche pixel — e un bordo netto si
 * localizza a una frazione di pixel interpolando la parabola sul massimo del
 * gradiente. La misura che prima era rumore diventa molto piu' fine del tetto
 * da verificare, e il programma **stampa la propria risolvenza** prima dei
 * numeri, cosi' chi legge vede subito se il metro e' adatto.
 *
 * E si controlla da solo: se un bordo sbiadisce, o se la ricerca finisce contro
 * il suo limite, il fotogramma viene scartato e il cancello dice quanti ne ha
 * persi invece di far finta di aver misurato.
 */

const file = process.argv[2]
if (!file) {
  console.error('  uso: node strumenti/collaudo-filmato.mjs <file.mp4>')
  process.exit(2)
}

const SCALA = 0.005     // 0,5%: sotto questo la maschera dei finestrini regge
const DERIVA = 6        // px a 720
const ROTAZIONE = 0.3   // gradi

const W = 1280, H = 720
const grezzo = join(tmpdir(), 'cf-' + Date.now() + '.gray')
execFileSync('ffmpeg', ['-loglevel', 'error', '-i', file, '-vf', `scale=${W}:${H}`,
  '-f', 'rawvideo', '-pix_fmt', 'gray', '-y', grezzo])
const d = readFileSync(grezzo)
unlinkSync(grezzo)
const N = Math.floor(d.length / (W * H))
if (N < 8) {
  console.error(`  ROTTO  solo ${N} fotogrammi: non c'e' niente da misurare.`)
  process.exit(1)
}
const fotogramma = (n) => d.subarray(n * W * H, (n + 1) * W * H)

/** Il gradiente verticale del profilo per righe, su una fascia di colonne. */
function gradiente (g, xa, xb) {
  const p = new Float64Array(H)
  for (let y = 0; y < H; y++) {
    let s = 0
    for (let x = xa; x < xb; x++) s += g[y * W + x]
    p[y] = s / (xb - xa)
  }
  const q = new Float64Array(H)
  for (let y = 2; y < H - 2; y++) q[y] = (p[y + 2] + p[y + 1]) / 2 - (p[y - 1] + p[y - 2]) / 2
  return q
}

/**
 * Il massimo di |gradiente| attorno a `y0`, raffinato al sotto-pixel con la
 * parabola sui tre campioni attorno al picco. Senza il sotto-pixel la misura si
 * quantizzerebbe a una riga intera, che su questa base e' gia' una frazione
 * sensibile del tetto: sarebbe precisione spesa in arrotondamento.
 */
function bordo (q, y0, raggio) {
  const da = Math.max(3, y0 - raggio), a2 = Math.min(H - 3, y0 + raggio)
  let best = 0, dove = -1
  for (let y = da; y < a2; y++) if (Math.abs(q[y]) > best) { best = Math.abs(q[y]); dove = y }
  if (dove < 0) return null
  if (dove <= da + 1 || dove >= a2 - 2) return null   // contro il limite della ricerca: non fidarsi
  const a = Math.abs(q[dove - 1]), b = Math.abs(q[dove]), c = Math.abs(q[dove + 1])
  const den = a - 2 * b + c
  const sub = den ? 0.5 * (a - c) / den : 0
  return { y: dove + Math.max(-1, Math.min(1, sub)), forza: b }
}

/** I due bordi orizzontali piu' forti del primo fotogramma, ben distanti fra loro. */
const q0 = gradiente(fotogramma(0), 0, W)
const candidati = []
for (let y = 20; y < H - 20; y++) candidati.push({ y, f: Math.abs(q0[y]) })
candidati.sort((a, b) => b.f - a.f)
const primo = candidati[0]
const secondo = candidati.find(c => Math.abs(c.y - primo.y) > H * 0.25)
if (!secondo) {
  console.error(`
  NON MISURABILE  non trovo due bordi orizzontali abbastanza distanti fra loro.

         Questo cancello e' per i filmati della STANZA, che hanno il taglio dei
         vetri in alto e la linea del pavimento in basso. Per il mare la domanda
         giusta e' un'altra — che l'orizzonte resti orizzontale e alla stessa
         altezza — e non si misura sui bordi dell'arredamento.`)
  process.exit(2)
}
const yA = Math.min(primo.y, secondo.y), yB = Math.max(primo.y, secondo.y)
const base = yB - yA
console.log(`  bordi di riferimento alle righe ${yA} e ${yB} — distanza ${base} su ${H}`)
console.log(`  RISOLVENZA  mezzo pixel su ${base} righe = ${(100 * 0.5 / base).toFixed(3)}% di scala, contro un tetto di ${(100 * SCALA).toFixed(1)}%`)

const RAGGIO = 26
const misure = []
let persi = 0
for (let n = 0; n < N; n++) {
  const g = fotogramma(n)
  const tot = gradiente(g, 0, W)
  const a = bordo(tot, yA, RAGGIO), b = bordo(tot, yB, RAGGIO)
  const aSx = bordo(gradiente(g, 0, W / 2), yA, RAGGIO)
  const aDx = bordo(gradiente(g, W / 2, W), yA, RAGGIO)
  if (!a || !b || !aSx || !aDx) { persi++; continue }
  misure.push({
    n,
    s: (b.y - a.y) / base,
    t: (a.y + b.y) / 2 - (yA + yB) / 2,
    gradi: Math.atan2(aDx.y - aSx.y, W / 2) * 180 / Math.PI
  })
}
if (misure.length < N * 0.6) {
  console.error(`
  NON MISURABILE  i bordi si perdono in ${persi} fotogrammi su ${N}.
         O il filmato cambia inquadratura, o quei bordi non sono stabili: in
         entrambi i casi i numeri sarebbero un campione scelto dal caso.`)
  process.exit(2)
}

const scala = Math.max(...misure.map(m => Math.abs(m.s - 1)))
const deriva = Math.max(...misure.map(m => Math.abs(m.t)))
/**
 * LA ROTAZIONE SI MISURA RISPETTO AL PRIMO FOTOGRAMMA, NON IN ASSOLUTO.
 *
 * Un altro metro rotto, e questo stava per bocciare la clip buona. Il conto
 * dava 0,47 gradi costanti per dieci secondi, con una variazione di 0,03: non
 * era la stanza che ruotava, era un valore fisso. Misurato sulla fotografia di
 * riferimento,  da sola da' 0,43 gradi — la fascia dei vetri non e'
 * simmetrica rispetto all asse della camera, e quel mezzo grado e' una
 * proprieta della SCENA.
 *
 * La domanda giusta non e mai stata «quanto e storta la stanza»: quella
 * inclinazione e cotta anche nella fotografia da cui viene la maschera, quindi
 * combacia. La domanda e **di quanto ruota durante la clip**, perche e li che
 * si sommerebbe all angolo della simulazione.
 */
const rot = Math.max(...misure.map(m => m.gradi)) - Math.min(...misure.map(m => m.gradi))

console.log(`  ${file}`)
console.log(`  ${misure.length} fotogrammi misurati su ${N}${persi ? ` — ${persi} scartati` : ''}`)
console.log(`  CARRELLATA  ${(100 * scala).toFixed(2)}%   tetto ${(100 * SCALA).toFixed(1)}%`)
console.log(`  DERIVA      ${deriva.toFixed(1)} px   tetto ${DERIVA}`)
console.log(`  ROTAZIONE   ${rot.toFixed(2)} gradi di escursione   tetto ${ROTAZIONE}`)

let rotto = false
if (scala > SCALA) {
  console.error(`  ROTTO  la camera carrella. I finestrini escono da sotto la maschera, e non
         si corregge dopo: vidstab non tocca la scala. Va rigenerato, e il come
         sta in riferimenti/prompt/salone-filmati.md`)
  rotto = true
}
if (deriva > DERIVA) {
  console.error('  ROTTO  la camera sale o scende: la maschera dei finestrini non la segue.')
  rotto = true
}
if (rot > ROTAZIONE) {
  console.error(`  ROTTO  la stanza ruota da sola. L'inclinazione la deve dare la simulazione,
         altrimenti i due angoli si sommano a caso e l'orizzonte dentro i vetri
         si inclina insieme alla stanza — cioe' il contrario della tesi.`)
  rotto = true
}
if (rotto) process.exit(1)
console.log('  filmato in ordine: la camera sta ferma.')
