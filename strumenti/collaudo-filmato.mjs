import { execFileSync, spawnSync } from 'node:child_process'

/**
 * ─── SERVE ffmpeg, E VA DETTO PRIMA DI FALLIRE
 *
 * Questo cancello estrae i fotogrammi con ffmpeg. Se non c'e', `execFileSync`
 * muore con un ENOENT che parla di «file o cartella inesistente» — e quel file
 * inesistente e' il PROGRAMMA, non il filmato. Su un runner di CI, dove ffmpeg
 * non e' piu' incluso da qualche versione, il messaggio manda a cercare il
 * difetto negli asset.
 *
 * Tre esecuzioni rosse per questo. Costa due righe dirlo prima.
 */
try {
  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' })
} catch {
  console.error(`
  ROTTO  manca ffmpeg.

         Questo cancello estrae i fotogrammi dai filmati e ha bisogno di
         ffmpeg nel PATH. Non e' incluso nelle immagini di CI recenti:

             sudo apt-get install -y ffmpeg     (Linux)
             winget install Gyan.FFmpeg         (Windows)
`)
  process.exit(1)
}
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
import { readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const RADICE = fileURLToPath(new URL('..', import.meta.url))
/**
 * ─── PRIMA DI TUTTO: OGNI FILMATO NOMINATO NEL CODICE DEVE ESISTERE
 *
 * Segnalato da una revisione esterna, che ha guardato la RETE invece del
 * codice. `composito.js` chiedeva `filmati/salone-teso.mp4` e `salone.js`
 * chiedeva `filmati/mare-fuoribordo.mp4`: tolti dal repo mesi prima, con i
 * riferimenti rimasti indietro.
 *
 * E il guasto era MUTO, che e' la ragione per cui questo controllo esiste.
 * Sotto il base `/nautica/` un file mancante non da' 404: il server torna
 * **200 con dentro `index.html`**. Il `<video>` riceve HTML, `loadeddata` non
 * scatta mai, e lo strato resta vuoto senza che niente si lamenti. I due rami
 * colpiti erano `?doppia=1` -- il paracadute da aprire se il salone 3D non
 * reggesse su un telefono -- e `?sagoma=1`, la sorgente delle sagome. Un
 * paracadute che non si apre e' peggio di nessun paracadute.
 *
 * Il controllo e' due righe di grep e sarebbe scattato il giorno stesso in cui
 * il file e' stato cancellato.
 *
 * ─── E AL CONTRARIO: un filmato spedito che nessuno nomina
 *
 * Non e' un errore -- `discesa.mp4` sta nel repo apposta, in attesa del
 * montaggio -- ma e' peso che viaggia. Si stampa col suo costo, cosi' non puo'
 * restare li' dimenticato.
 */
function riferimentiIncrociati (dir) {
  const nominati = new Set()
  const cerca = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = d + '/' + e.name
      if (e.isDirectory()) { cerca(p); continue }
      if (!/\.(js|mjs|html|css)$/.test(e.name)) continue
      for (const m of readFileSync(p, 'utf8').matchAll(/filmati\/([a-z0-9-]+\.mp4)/g)) nominati.add(m[1])
    }
  }
  cerca(RADICE + 'src')
  let presenti = []
  try { presenti = readdirSync(dir).filter((f) => f.endsWith('.mp4')) } catch { /* assente */ }
  const mancanti = [...nominati].filter((f) => !presenti.includes(f))
  const orfani = presenti.filter((f) => !nominati.has(f))
  for (const f of orfani) {
    let kb = 0
    try { kb = statSync(dir + '/' + f).size / 1024 } catch { /* sparito */ }
    console.log(`  spedito ma non nominato da nessuna riga: ${f} (${kb.toFixed(0)} KB)`)
  }
  if (mancanti.length) {
    console.error(`  ROTTO  il codice chiede ${mancanti.length} filmato/i che non esistono: ${mancanti.join(', ')}`)
    console.error('         Non danno 404: sotto il base il server torna 200 con index.html,')
    console.error('         il <video> riceve HTML e `loadeddata` non scatta mai. Lo strato')
    console.error('         resta vuoto in silenzio.')
    process.exit(1)
  }
}

let file = process.argv[2]
if (!file) {
  const dir = RADICE + 'public/filmati'
  riferimentiIncrociati(dir)
  let elenco = []
  /**
   * --- UNA CLIP CHE NON HA NIENTE DI FERMO NON SI PUO' MISURARE QUI
   *
   * `salone-mare.mp4` e' solo mare e cielo: non contiene un solo spigolo che
   * stia fermo, e questo cancello misura proprio lo spostamento di due bordi
   * di riferimento. Su acqua che scorre trova bordi ovunque e da nessuna parte,
   * e produrrebbe un numero che non descrive niente -- il modo peggiore di
   * fallire, perche' sembra una misura.
   *
   * Escluderla non e' un buco: la sua stabilita' e' quella della sorgente da
   * cui viene ritagliata, che e' `salone-largo.mp4`, ed E' misurata qui sopra.
   * Se la camera si muove, si muove in tutte e due.
   */
  const SENZA_GEOMETRIA = ['salone-mare.mp4']
  /**
   * --- E UNA CLIP CHE SI MUOVE APPOSTA NON VA STABILIZZATA
   *
   * Questo cancello nasce per il salone, e il salone ha una regola sola: la
   * camera non si muove, perche' il finestrone e' bucato da una maschera fissa
   * e se il vano scivola sotto la maschera si apre un foro nel legno e ci si
   * vede il mare. Misurato su `discesa.mp4`: scivola di 321,8 px contro i 24
   * che la maschera perdona.
   *
   * Ma `discesa.mp4` NON sta sotto nessuna maschera. E' la discesa dal salone
   * al meccanismo, e la camera si muove perche' e' quello il suo mestiere:
   * esce dal finestrone, scende, arriva sul pezzo. Chiedergli di stare ferma
   * vorrebbe dire non averla capita.
   *
   * Il cancello che le tocca e' un altro, e c'e': `strumenti/consegna.mjs`,
   * che verifica che il suo ULTIMO fotogramma combaci col PRIMO del 3D. Per
   * una clip di transizione l'unica cosa che deve stare ferma e' il punto in
   * cui consegna.
   */
  /**
   * ─── E LA TRAVERSATA STA NELLA STESSA LISTA, per la stessa ragione
   *
   * Aggiunta dopo che questo cancello l'ha bocciata in CI: «i bordi si perdono
   * in 117 fotogrammi su 240». Il referto e' CORRETTO e il verdetto no --
   * `traversata.mp4` fa meccanismo, scafo, sala macchine, scala, corridoio,
   * salone: cambia inquadratura undici volte perche' e' un viaggio.
   *
   * Chiederle di tenere i bordi fermi e' chiederle di non essere una
   * traversata, ed e' lo stesso errore gia' fatto con la discesa. Il cancello
   * che le tocca e' `strumenti/consegna.mjs`: per una clip di transizione
   * l'unica cosa che deve stare ferma e' il punto in cui consegna, e quello e'
   * misurato -- linea d'acqua a 10 px, pinna corta del 10%, toni entro 5,5
   * livelli.
   *
   * La lista si allunga solo cosi': un filmato ci entra quando esiste un ALTRO
   * cancello che lo misura. Senza, sarebbe un condono.
   */
  const CAMERA_CHE_SI_MUOVE = ['discesa.mp4', 'traversata.mp4']
  try {
    elenco = readdirSync(dir)
      .filter(f => f.endsWith('.mp4'))
      .filter(f => !SENZA_GEOMETRIA.includes(f))
      .filter(f => !CAMERA_CHE_SI_MUOVE.includes(f))
  } catch { /* cartella assente */ }
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

/**
 * --- I TRE MOVIMENTI FANNO UN SOLO DANNO, E SI SOMMANO IN PIXEL
 *
 * I tre tetti qui sopra erano numeri scelti a mano, e uno di loro dichiarava
 * gia' da dove veniva: "0,5%: sotto questo la maschera dei finestrini regge".
 * Cioe' la soglia e' sempre stata la CONSEGUENZA di un margine -- solo,
 * congelata in una costante che nessuno poteva ricalcolare.
 *
 * Il danno e' uno solo: il vano del finestrone, dentro il filmato, si sposta
 * rispetto alla maschera, che sta ferma. Carrellata, deriva e rotazione ci
 * contribuiscono tutte e tre, e in pixel si sommano:
 *
 *     scivolamento = deriva + (scala + rotazione_in_radianti) * raggio
 *
 * dove il raggio e' la distanza dal centro del quadro all angolo piu' lontano
 * del vano -- il punto che si sposta di piu'.
 *
 * --- E IL DANNO E' ASIMMETRICO, che e' la parte che sblocca tutto
 *
 * Da un lato la maschera buca oltre il vano: si apre un foro NEL LEGNO e ci si
 * vede il mare. Si nota subito, ed e' il difetto che il tetto proteggeva.
 * Dall altro lato la maschera resta corta: sopra il mare rimane una scheggia
 * del vano filmato, che contiene... mare. Non si vede.
 *
 * Quindi basta che la maschera RIENTRI del massimo scivolamento, e il difetto
 * visibile non puo' piu' accadere. Il rientro non e' un numero che invento
 * qui: lo scrive `salone-da-filmato.py` in `public/salone/vano.json` quando
 * genera la maschera, e questo cancello lo LEGGE. Due strumenti, un contratto.
 *
 * Senza quel file si resta ai tetti vecchi: un filmato di cui non si sa con
 * quale margine e' stata fatta la maschera non ha diritto a nessuna
 * concessione.
 */
let rientro = null
try {
  rientro = JSON.parse(readFileSync('public/salone/vano.json', 'utf8')).rientro_px
} catch {}

const raggio = Math.hypot(W, H) / 2
const scivola = deriva + (scala + rot * Math.PI / 180) * raggio
console.log(`  SCIVOLAMENTO ${scivola.toFixed(1)} px al bordo del vano` +
            (rientro === null ? '   (nessun rientro dichiarato)' : `   rientro della maschera ${rientro} px`))

let rotto = false
if (rientro !== null) {
  if (scivola > rientro) {
    console.error(`  ROTTO  il vano scivola di ${scivola.toFixed(1)} px sotto una maschera che
         ne perdona ${rientro}. Dove la maschera buca oltre il vano si apre un foro
         nel legno e ci si vede il mare. O si stabilizza il filmato, o si
         rigenera la maschera con un rientro maggiore.`)
    rotto = true
  }
} else if (scala > SCALA) {
  console.error(`  ROTTO  la camera carrella. I finestrini escono da sotto la maschera, e non
         si corregge dopo: vidstab non tocca la scala. Va rigenerato, e il come
         sta in riferimenti/prompt/salone-filmati.md`)
  rotto = true
}
if (rientro === null && deriva > DERIVA) {
  console.error('  ROTTO  la camera sale o scende: la maschera dei finestrini non la segue.')
  rotto = true
}
if (rientro === null && rot > ROTAZIONE) {
  console.error(`  ROTTO  la stanza ruota da sola. L'inclinazione la deve dare la simulazione,
         altrimenti i due angoli si sommano a caso e l'orizzonte dentro i vetri
         si inclina insieme alla stanza — cioe' il contrario della tesi.`)
  rotto = true
}
if (rotto) process.exit(1)
console.log('  filmato in ordine: la camera sta ferma.')
