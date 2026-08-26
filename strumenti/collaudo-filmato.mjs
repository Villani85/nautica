import { execFileSync, spawnSync } from 'node:child_process'
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

/**
 * SENZA ARGOMENTO COLLAUDA I FILMATI DEL SITO, invece di stampare l'uso.
 *
 * Chiedendo un argomento obbligatorio, questo cancello restava fuori dal giro
 * automatico — e la regola «tutti i collaudi prima di ogni commit» diventava
 * impossibile da rispettare alla lettera. Una regola che non si puo' rispettare
 * si comincia a saltare, e poi si saltano anche le altre.
 *
 * Quindi senza argomento gira su tutto cio' che sta in `public/filmati/`: e'
 * quello che il sito pubblica davvero. Con un argomento collauda quel file, e
 * serve a provare una clip PRIMA di montarla.
 */
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const RADICE = fileURLToPath(new URL('..', import.meta.url))
let file = process.argv[2]
if (!file) {
  const dir = RADICE + 'public/filmati'
  let elenco = []
  try { elenco = readdirSync(dir).filter(f => f.endsWith('.mp4')) } catch { /* cartella assente */ }
  if (!elenco.length) {
    console.error('  ROTTO  nessun filmato in public/filmati: il capitolo del salone non ha i suoi asset.')
    process.exit(1)
  }
  let rotti = 0
  for (const f of elenco) {
    console.log(`  ──── ${f}`)
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), dir + '/' + f], { stdio: 'inherit' })
    if (r.status !== 0) rotti++
  }
  console.log()
  if (rotti) { console.error(`  ${rotti} filmato/i non passano.`); process.exit(1) }
  console.log('  TUTTO A POSTO')
  process.exit(0)
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

/**
 * ─── I BORDI DI RIFERIMENTO SI SCELGONO STABILI, NON SOLO FORTI
 *
 * La prima versione prendeva i due bordi piu' forti del PRIMO fotogramma. Va
 * bene finche' l'inquadratura e' tutta arredamento. Con un salone che ha meta'
 * schermo di finestrone, i bordi piu' forti sono **l'orizzonte e le creste
 * delle onde** — e quelli si spostano a ogni fotogramma. Il cancello li
 * inseguiva, li perdeva in 130 fotogrammi su 240, e si fermava dicendo «non
 * misurabile». Non era il filmato a essere sbagliato: era il riferimento.
 *
 * La cura: si guarda il gradiente su piu' fotogrammi e si tiene, per ogni riga,
 * il **minimo**. Un bordo di falegnameria c'e' in tutti i fotogrammi, quindi il
 * suo minimo resta alto; un'onda c'e' in uno e non nell'altro, quindi il suo
 * minimo crolla. Sceglie da solo l'arredamento e scarta il mare, senza che
 * nessuno debba dirgli dove guardare.
 */
/**
 * ─── E PRIMA ANCORA: SI SCEGLIE LA META' DEL FOTOGRAMMA CHE NON CAMBIA DA SOLA
 *
 * Scegliere i bordi stabili non bastava, e il motivo e' che il profilo per
 * righe si calcola sulla LARGHEZZA INTERA: con meta' schermo di finestrone il
 * mare domina la media e cancella le righe della falegnameria. Il cancello
 * continuava a puntare l'orizzonte.
 *
 * Quindi si misura quanto ogni meta' del fotogramma cambia nel tempo, e si
 * lavora su quella piu' ferma. In un salone col finestrone e' l'interno; in una
 * stanza chiusa sono equivalenti e la scelta non cambia niente. La regola e'
 * generale, non una toppa per questa inquadratura: **la camera si misura su
 * cio' che non si muove da solo**.
 */
/**
 * ─── L'AGITAZIONE SI MISURA FRA FOTOGRAMMI VICINI, e la prima stesura li
 * prendeva lontani.
 *
 * La regola e' giusta — la camera si misura su cio' che non si muove da solo —
 * ma il confronto era sulla scala di tempo sbagliata. Una carrellata e' LENTA:
 * su dieci secondi sposta l'interno piu' di quanto il mare sposti se stesso, e
 * il conto sceglieva la meta' del MARE, prendendo l'orizzonte come riferimento
 * di camera. Su una clip con carrellata forte l'ho visto stampare 15,8% di
 * scala dopo la correzione, cioe' peggio di prima.
 *
 * Fra fotogrammi vicini le due cose si separano da sole: il mare cambia in un
 * ventesimo di secondo, la camera no. Stessa regola, scala di tempo giusta.
 */
function agitazione (xa, xb) {
  let s = 0, n = 0
  const passo = Math.max(1, Math.round(N / 40))
  for (let k = passo; k < N; k += passo) {
    const a = fotogramma(k - passo), b = fotogramma(k)
    for (let y = 0; y < H; y += 3) for (let x = xa; x < xb; x += 3) { s += Math.abs(a[y * W + x] - b[y * W + x]); n++ }
  }
  return s / n
}
const sx = agitazione(0, W / 2), dx = agitazione(W / 2, W)

/**
 * ─── E DEVE ANCHE AVERE QUALCOSA DA MISURARE
 *
 * «La meta' meno agitata» non basta, e l'ha scoperto il cancello da solo su una
 * clip nuova. Nella posa puntellata il vetro viene ANNERITO prima di comprimere
 * — quei pixel non si vedono mai, perche' la maschera li buca, e neri costano
 * il 60% in meno. Una regione nera e' perfettamente immobile: vince come meno
 * agitata, e non ha un solo bordo da inseguire. Il cancello si e' fermato
 * dicendo «bordi persi in 120 fotogrammi su 120», che e' vero e inutile.
 *
 * La regola completa e': fra le meta' che hanno STRUTTURA, si prende la meno
 * agitata. La struttura si misura come il bordo stabile piu' forte che quella
 * meta' offre; sotto una soglia bassa, quella meta' non e' un riferimento, e'
 * una parete.
 */
function struttura (xa, xb) {
  const s = new Float64Array(H).fill(Infinity)
  for (let k = 0; k < 5; k++) {
    const q = gradiente(fotogramma(Math.floor(k * (N - 1) / 4)), xa, xb)
    for (let y = 10; y < H - 10; y++) s[y] = Math.min(s[y], Math.abs(q[y]))
  }
  let m = 0
  for (let y = 10; y < H - 10; y++) if (Number.isFinite(s[y]) && s[y] > m) m = s[y]
  return m
}
/**
 * Il punteggio pesa le due cose insieme: quanta struttura offre quella meta',
 * diviso quanto si agita. Una soglia secca non bastava — il vetro annerito ha
 * un bordo fortissimo al confine col legno, quindi passava qualunque soglia pur
 * essendo **un bordo solo**, e un riferimento ne vuole due distanti.
 */
const strSx = struttura(0, W / 2), strDx = struttura(W / 2, W)
const pSx = strSx / (1 + sx), pDx = strDx / (1 + dx)
const [XA, XB] = pSx >= pDx ? [0, W / 2] : [W / 2, W]
console.log(`  agitazione: sinistra ${sx.toFixed(1)} · destra ${dx.toFixed(1)} · punteggio ${pSx.toFixed(1)} e ${pDx.toFixed(1)} → misuro sulla ${XA === 0 ? 'SINISTRA' : 'DESTRA'}`)

const CAMPIONI_STABILI = 8
const stabile = new Float64Array(H).fill(Infinity)
for (let k = 0; k < CAMPIONI_STABILI; k++) {
  const q = gradiente(fotogramma(Math.floor(k * (N - 1) / (CAMPIONI_STABILI - 1))), XA, XB)
  for (let y = 0; y < H; y++) stabile[y] = Math.min(stabile[y], Math.abs(q[y]))
}
const candidati = []
for (let y = 20; y < H - 20; y++) candidati.push({ y, f: stabile[y] })
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
console.log(`  bordi di riferimento alle righe ${yA} e ${yB} — distanza ${base} su ${H}, scelti fra i piu' stabili su ${CAMPIONI_STABILI} fotogrammi`)
console.log(`  RISOLVENZA  mezzo pixel su ${base} righe = ${(100 * 0.5 / base).toFixed(3)}% di scala, contro un tetto di ${(100 * SCALA).toFixed(1)}%`)

const RAGGIO = 26
const misure = []
let persi = 0
for (let n = 0; n < N; n++) {
  const g = fotogramma(n)
  const tot = gradiente(g, XA, XB)
  const a = bordo(tot, yA, RAGGIO), b = bordo(tot, yB, RAGGIO)
  const aSx = bordo(gradiente(g, XA, (XA + XB) / 2), yA, RAGGIO)
  const aDx = bordo(gradiente(g, (XA + XB) / 2, XB), yA, RAGGIO)
  if (!a || !b || !aSx || !aDx) { persi++; continue }
  misure.push({
    n,
    s: (b.y - a.y) / base,
    t: (a.y + b.y) / 2 - (yA + yB) / 2,
    gradi: Math.atan2(aDx.y - aSx.y, (XB - XA) / 2) * 180 / Math.PI
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
