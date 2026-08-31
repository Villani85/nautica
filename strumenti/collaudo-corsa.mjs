import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'

/**
 * COLLAUDO DELLA CORSA — lo sweep di 101 pose del §10.2, quello che non c'era.
 *
 *     node strumenti/collaudo-corsa.mjs
 *     node strumenti/collaudo-corsa.mjs --rompi=nan|disco|camera|aliasing
 *
 * `docs/14-FOTOREALISMO.md` §10.2 prescrive:
 *
 *   > Campionare almeno 101 pose da −25° a +25°. Rosso se:
 *   >  - un nodo restituisce `NaN` o una matrice non finita;
 *   >  - pinna/albero/uscita divergono oltre la tolleranza numerica;
 *   >  - dischi o portante attraversano il carter fisso;
 *   >  - il carter removibile invade la traiettoria della camera.
 *
 * Nessuno dei quattro esisteva. `collaudo-cinematica.mjs` campiona tre punti di
 * scorrimento DAL VIVO e misura un'altra cosa — il rapporto 29:1, l'ampiezza
 * dell'orbita, l'escursione della pinna — e fa bene a farlo. Ma tre punti presi
 * mentre la simulazione passa di li' non sono una corsa: sono tre fotografie
 * dove capita, e non toccano mai gli estremi ±25°, che sono esattamente le pose
 * in cui un meccanismo si scassa.
 *
 * ═══ LA DIFFERENZA CHE CONTA: QUI LA POSA SI IMPONE
 *
 * La simulazione decide da sola dove sta la pinna. Aspettarla significa
 * misurare la drammaturgia invece della macchina. Qui l'angolo si IMPONE, tutti
 * e 101, e si impone **al sito**, non a una copia:
 *
 *     Object.defineProperty(S, 'pinna', { get: () => imposto })
 *
 * `S` e' l'oggetto di stato vero (`__nautica.stato`, cioe' `sim.S`). Con un
 * getter al posto del campo, cio' che la simulazione scrive viene ingoiato e
 * `impianto.js` legge il MIO angolo — e poi applica la SUA cinematica, la sola
 * che esista. Non c'e' una seconda implementazione del riduttore in questo
 * file: c'e' un angolo forzato e un fotogramma vero, disegnato dal sito.
 *
 * ═══ 1450 GRADI, E LA TRAPPOLA DELL'ALIASING
 *
 * Il rapporto e' 29:1. Cinquanta gradi di pinna sono **1450 gradi d'ingresso**:
 * quattro giri pieni. Uno sweep di 101 pose che li campionasse male leggerebbe
 * quattro volte quasi la stessa fase dei dischi, e darebbe un verde che non
 * prova niente — e' l'errore che questo repo ha gia' fatto una volta, quando
 * l'orbita si misurava su un sesto di giro e si concludeva che il meccanismo
 * era fermo.
 *
 * Il passo qui e' 0,5° di pinna = 14,5° d'ingresso. In mezzi gradi: passo 29,
 * modulo 720, e mcd(29, 720) = 1 — quindi le 101 pose cadono su 101 fasi
 * DISTINTE. Ma un conto non e' una misura: il cancello **misura il buco piu'
 * largo** fra le fasi d'ingresso ordinate e lo confronta con la spaziatura
 * ideale. E non si ferma li': rifa la corsa a densita' quadrupla e confronta i
 * minimi. Se le 101 pose stessero aliasando, la corsa fitta troverebbe un
 * franco molto piu' piccolo, e lo direbbe.
 *
 * ═══ LA COMPENETRAZIONE: COME SI MISURA DAVVERO
 *
 * «I dischi non attraversano il carter» non e' una distanza fra centri e non e'
 * un confronto di bounding box: due tubi concentrici hanno le scatole
 * sovrapposte e non si toccano mai. Serve il segno.
 *
 *   1. **contenimento per parita'** — da ogni punto campionato si spara un
 *      raggio lungo l'asse locale +x e si contano gli attraversamenti della
 *      superficie bersaglio. Dispari = il punto sta DENTRO la materia. Vale per
 *      qualunque insieme di superfici chiuse, anche disgiunte, e non si fa
 *      ingannare da una cavita';
 *   2. **profondita' e franco** — per ogni punto si calcola la distanza minima
 *      dalla superficie bersaglio (punto-triangolo vero, non punto-vertice),
 *      accelerata da una griglia uniforme costruita UNA VOLTA nel sistema
 *      locale del bersaglio. I corpi si muovono di moto rigido, quindi la
 *      griglia non va mai ricostruita: si trasformano i punti, non i triangoli.
 *
 * Dentro = penetrazione, e il numero e' la profondita'. Fuori = franco. La
 * prova si fa nei DUE VERSI (A dentro B e B dentro A), perche' un perno che
 * infila un foro troppo stretto puo' avere tutti i vertici fuori dall'altro e
 * intersecarlo lo stesso.
 *
 * ─── L'ASSE DEL RAGGIO NON E' UNA SCELTA ESTETICA
 *
 * Il raggio va lungo +x LOCALE perche' in questo modello x e' l'asse
 * dell'albero e quasi tutto e' un solido di rivoluzione intorno a lui. Un
 * raggio parallelo alla parete di un cilindro non la attraversa mai di
 * striscio: esce dal fondello, cioe' da una superficie che gli sta davanti per
 * bene. E' il caso meglio condizionato che questa geometria offra.
 *
 * Restano gli spigoli: un raggio che passa esattamente su uno spigolo condiviso
 * conta due volte. Quindi ogni punto si prova con TRE origini sfalsate di
 * qualche micron e vince la maggioranza. La direzione resta +x esatta, cosi'
 * il secchiello 2D su (y, z) resta valido.
 *
 * ═══ LA CAMERA
 *
 * L'ultima battuta porta la camera a `RAGGIO_MECCANISMO = 2,6` unita' di scena
 * (`src/scena/index.js`). La sua traiettoria non e' un punto: e' un ARCO, e
 * l'arco lo si misura invece di dedurlo — si preme ArrowLeft/ArrowRight sulla
 * tela finche' `azimut` non sbatte contro il suo fermo, e si leggono i due
 * estremi. Poi il modello «cerchio di raggio 2,6 intorno alla mira» viene
 * VERIFICATO contro le posizioni vere della camera ai due estremi: se il sito
 * cambia la legge della camera, questo cancello lo dice invece di continuare a
 * misurare un cerchio che non c'e' piu'.
 *
 * Con la traiettoria in mano, il franco di un punto e' in forma chiusa:
 *
 *     franco = sqrt( (raggio_orizzontale − 2,6)² + (quota − quota_camera)² )
 *
 * cioe' la distanza dal cerchio. Sotto il piano vicino della camera, il pezzo
 * viene tagliato dalla lente: **buca l'inquadratura**.
 *
 * ═══ COSA QUESTO METODO NON VEDE — e va detto prima dei risultati
 *
 *  1. **campiona punti, non superfici continue.** Con 700 punti su un disco di
 *     ~0,14 m² la spaziatura media e' circa 1,4 cm: una compenetrazione la cui
 *     impronta e' piu' piccola di cosi' puo' passare fra i punti. La prova nei
 *     due versi la rende improbabile, non impossibile. E i punti stanno dove
 *     stanno i vertici: su una mesh a tornio i fianchi lunghi dei triangoli
 *     hanno solo gli estremi, quindi la meta' di un cilindro liscio e'
 *     rappresentata dai suoi due bordi e da un baricentro in mezzo;
 *  2. **non fa intersezione triangolo-triangolo.** Due gusci che si tagliano
 *     lungo uno spigolo senza che nessun vertice dell'uno finisca dentro
 *     l'altro non vengono visti. E' il caso «lamina infilata in una fessura»;
 *  3. **la parita' si fida della chiusura delle superfici.** Il GLB e'
 *     quantizzato da meshopt: micro-fessure sotto il decimo di millimetro
 *     esistono per costruzione. E dove due solidi si compenetrano GIA' nel file
 *     (le nervature contro l'anello, a raggio 0,30) la parita' legge «fuori»
 *     dentro la zona comune. Nessuno dei due casi tocca il volume dove vivono i
 *     dischi, ma restano difetti del metodo, non zone sicure;
 *  4. **guarda una fiancata sola** per la compenetrazione. I due impianti sono
 *     lo stesso file, uno ruotato di π, e ricevono `S.pinna` col segno opposto:
 *     su una corsa simmetrica −25…+25 l'insieme delle pose del secondo E'
 *     l'insieme delle pose del primo. La compenetrazione e' invariante per
 *     rotazione rigida, quindi misurarla due volte misurerebbe la stessa cosa.
 *     L'invasione della camera NO: li' i due impianti stanno in due posti
 *     diversi, e infatti si controllano tutti e due;
 *  5. **misura la geometria sotto la posa, non la posa.** Che il sito applichi
 *     davvero 29:1 lo verifica `collaudo-cinematica.mjs`. Qui si verifica che
 *     la posa, quando c'e', non produca compenetrazioni — e la posa arriva dal
 *     sito, quindi se il sito sbaglia nodo questo cancello lo vede muovere il
 *     nodo sbagliato ma non gli dice «29 invece di 12». Sono due domande;
 *  6. **una sola inquadratura.** Lo sweep gira alla battuta piu' vicina, quella
 *     dove la camera e' a 2,6: e' il caso peggiore per la camera ed e' l'unico
 *     dove il carter e' aperto. Le pose intermedie del taglio non sono coperte;
 *  7. **alleggerisce la scena** (`ombre=0&senzaAcqua=1`) perche' in software
 *     rendering si sta a 1 fotogramma al secondo e 101 pose diventerebbero tre
 *     minuti di attesa. Ombre e acqua non entrano ne' nella cinematica ne'
 *     nella geometria: questo cancello non dice niente su di loro;
 *  8. **il franco si misura solo sotto i 2 cm.** Sopra, la tabella scrive
 *     «> 20 mm» e quella e' tutta l'informazione che c'e': il numero esatto
 *     costerebbe una ricerca in migliaia di celle vuote e direbbe la stessa
 *     cosa. Le penetrazioni invece si misurano per intero;
 *  9. **non misura millisecondi.**
 *
 * ═══ SI ROMPE APPOSTA
 *
 * Un cancello che non ha mai fallito non e' un cancello, e' una decorazione.
 * `--rompi=` sabota la scena viva (mai i sorgenti) in quattro modi e ognuno
 * deve far diventare rosso il controllo corrispondente:
 *
 *   nan       infila un NaN nella posizione di RIG_OUTPUT
 *   disco     sposta RIG_CYCLO_A di 20 cm in fuori, dentro la parete del carter
 *   camera    porta un impianto fin sopra il cerchio della camera
 *   aliasing  campiona 5 pose distanti un giro esatto d'ingresso: quattro
 *             fotogrammi identici che sembrano una corsa
 */

/**
 * `PORTA=5181` per puntare un'altra anteprima. Serve quando sulla 5180 c'e' gia'
 * `npm run dev` di qualcun altro: il cancello la troverebbe che risponde 200 e
 * la riuserebbe, misurando i sorgenti invece della build.
 */
const PORTA = Number(process.env.PORTA) || 5180
const BASE = `http://localhost:${PORTA}/nautica/`

/** §10.2 — «almeno 101 pose da −25° a +25°». */
const POSE = 101
const ANGOLO_MAX = 25                 // gradi, §1.5 e `finMaxAngleDeg` nel GLB

/**
 * Dove si ferma lo scorrimento. `avvicina: [0.82, 1.00]` in `regia.js`, ma oltre
 * il 93% la sezione esce di campo e `setAnimationLoop` si spegne: si legge un
 * meccanismo immobile e lo si scambia per un guasto. Misurato: a 0,85 la camera
 * e' gia' al suo raggio minimo (2,6) e il ciclo disegna ancora.
 */
const BATTUTA = 0.85

/** Il raggio dell'ultima battuta, `RAGGIO_MECCANISMO` di `src/scena/index.js`. */
const RAGGIO_MECCANISMO = 2.6

/**
 * Quanto puo' sbagliare il modello di traiettoria prima di essere dichiarato
 * non piu' valido. E' una verifica di IDENTITA', non una taratura: o il cerchio
 * ricostruito passa per le posizioni vere della camera, o non e' quel cerchio.
 */
const TRAIETTORIA_TOLLERANZA = 0.005  // unita' di scena

/**
 * ─── LA GUARDIA NUMERICA, e da dove viene il numero
 *
 * Il GLB viaggia quantizzato da meshopt: le posizioni stanno su una griglia
 * fissa, e l'errore di quantizzazione e' dell'ordine dell'ingombro diviso
 * 2^14 — su 2,6 m fanno 0,16 mm. Chiamare «compenetrazione» qualcosa di piu'
 * piccolo dell'errore con cui i vertici sono scritti nel file significherebbe
 * misurare la compressione, non la macchina.
 *
 * 0,3 mm e' il doppio di quell'errore. Non e' una tolleranza meccanica: e' il
 * pavimento sotto cui questo strumento non sa distinguere.
 */
const GUARDIA = 0.0003                // metri del modello

/** Quanti punti si campionano per corpo. Vedi la nota sui limiti, punto 1. */
const PUNTI_PER_CORPO = 700

/** Lato della cella nelle griglie di accelerazione, in metri del modello. */
const CELLA = 0.015

/**
 * ─── OLTRE I 2 CM IL FRANCO NON SI MISURA, E NON E' UNA PIGRIZIA
 *
 * La distanza esatta di un punto lontano costa: la ricerca a gusci deve
 * allargarsi finche' non incontra un triangolo, e per un disco che sta 14 cm
 * dentro l'alesaggio del carter sono migliaia di celle vuote — moltiplicate per
 * un milione di interrogazioni.
 *
 * Ma un franco di 14 cm e un franco di 40 cm dicono la stessa identica cosa:
 * «questi due pezzi non si sfiorano nemmeno». Cio' che un cancello deve sapere
 * e' se il franco si STRINGE, e sotto quale soglia. Quindi si misura sotto i
 * 2 cm e sopra si scrive «> 20 mm»: e' un limite dichiarato dello strumento,
 * non un numero che finge di essere una misura.
 */
const CAP_FRANCO = 0.020

/**
 * La corsa di controllo: stessa legge, quattro volte piu' fitta. Serve a una
 * cosa sola — dimostrare che le 101 pose non stanno aliasando.
 */
const POSE_FITTE = 401

/** Il buco piu' largo ammesso fra due fasi d'ingresso consecutive, in gradi. */
const BUCO_MASSIMO = 3 * (360 / POSE)

const ROMPI = (process.argv.find(a => a.startsWith('--rompi=')) || '').split('=')[1] || ''

/**
 * --- NON SI SPEGNE UN SERVER CHE STA SERVENDO QUALCUN ALTRO
 *
 * Stessa regola di `collaudo-cinematica.mjs`, e per lo stesso guasto: con piu'
 * collaudi in parallelo tutti riusano la preview gia' accesa, e il primo che
 * finisce la uccide sotto gli altri.
 */
const TIENI_SERVER = !!process.env.TIENI_SERVER

async function serviteci () {
  try {
    const r = await fetch(BASE, { redirect: 'manual' })
    if (r.status < 500) return null
  } catch {}
  // `preview`, non `dev`: si misura la BUILD, come tutti gli altri cancelli.
  const s = spawn('npm', ['run', 'preview'], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    try { await fetch(BASE, { redirect: 'manual' }); return s } catch {}
    await new Promise(r => setTimeout(r, 500))
  }
  s.kill()
  console.error('il server non si e\' alzato')
  process.exit(2)
}

const server = await serviteci()
const browser = await apriBrowser()
const pagina = await browser.newPage({
  /**
   * Piccolo apposta. In software rendering la scena costa, e questo cancello
   * chiede 500+ fotogrammi: a 1280x800 sarebbero nove minuti. Ne' la cinematica
   * ne' la geometria dipendono dai pixel — solo la distanza della camera dal
   * salone dipende dal rapporto della finestra, e il salone qui non c'e'.
   */
  viewport: { width: 480, height: 320 },
  /**
   * SENZA QUESTO SI MISURA UN'ALTRA COSA: un browser guidato dichiara
   * `prefers-reduced-motion: reduce`, e in movimento ridotto la pinna sta ferma
   * a zero per progetto.
   */
  reducedMotion: 'no-preference'
})
pagina.setDefaultTimeout(180000)

const errori = []
pagina.on('pageerror', e => errori.push(String(e)))

const guasti = []
const righe = []
const chiudi = async (codice) => {
  await browser.close()
  if (server && !TIENI_SERVER) server.kill()
  process.exit(codice)
}

/**
 * ─── NIENTE ATTESE CIECHE
 *
 * Qui c'era `waitForTimeout(1500)`, ed e' bastato che altri processi
 * occupassero la macchina perche' il modulo della dimostrazione arrivasse a
 * 1600 ms e il cancello dichiarasse sparito `?ispeziona=1`. Un cancello che
 * fallisce per il carico della macchina invece che per un difetto del prodotto
 * e' peggio di nessun cancello: lo si impara a rilanciare finche' non passa.
 *
 * Si aspetta una CONDIZIONE, con un tetto, e il tetto scaduto e' esso stesso un
 * risultato da riferire.
 */
async function finche (prova, tetto = 30000, passo = 250) {
  const scad = Date.now() + tetto
  for (;;) {
    if (await pagina.evaluate(prova)) return true
    if (Date.now() > scad) return false
    await pagina.waitForTimeout(passo)
  }
}

await pagina.goto(BASE + '?ispeziona=1&ombre=0&senzaAcqua=1', { waitUntil: 'load', timeout: 45000 })

if (!await finche(() => !!window.__nautica)) {
  console.error('COLLAUDO CORSA FALLITO')
  console.error('  · `window.__nautica` non c\'e\': o `?ispeziona=1` e\' sparito da index.js,')
  console.error('    o il modulo della dimostrazione non si e\' caricato.')
  if (errori.length) console.error('    errori di pagina: ' + errori.slice(0, 2).join(' | '))
  await chiudi(2)
}

// ── si va alla battuta ravvicinata, e si controlla che il ciclo DISEGNI ───────
await pagina.evaluate(q => {
  const d = document.querySelector('#dimostrazione')
  scrollTo({ top: scrollY + d.getBoundingClientRect().top + d.offsetHeight * q, behavior: 'instant' })
}, BATTUTA)
/**
 * La camera insegue il proprio bersaglio: si aspetta che sia ARRIVATA, non un
 * numero di millisecondi. Stessa regola di sopra.
 */
await pagina.evaluate(() => { window.__prec = null })
if (!await finche(() => {
  const c = window.__nautica.camera.position
  const ora = [c.x, c.y, c.z]
  const p = window.__prec
  window.__prec = ora
  return !!p && Math.hypot(ora[0] - p[0], ora[1] - p[1], ora[2] - p[2]) < 1e-4
}, 20000, 400)) {
  guasti.push('la camera non si e\' fermata in 20 s alla battuta ravvicinata: le pose ' +
              'sarebbero lette mentre l\'inquadratura si muove ancora.')
}

/**
 * IL TESTIMONE DI VITALITA' STA DALLA PARTE DELLA COSA MISURATA.
 *
 * Se il ciclo non disegna, la posa imposta non viene mai applicata e lo sweep
 * leggerebbe 101 volte lo stesso fotogramma — verde perfetto, zero informazione.
 * Il conteggio dei fotogrammi lo scrive il disegno, non la simulazione: e' la
 * lezione gia' pagata in `index.js`.
 */
const vitale = await pagina.evaluate(async () => {
  const f0 = window.__nautica.fotogrammi
  const t0 = performance.now()
  await new Promise(r => setTimeout(r, 2500))
  return { df: window.__nautica.fotogrammi - f0, ms: performance.now() - t0 }
})
if (vitale.df < 2) {
  guasti.push(`alla battuta ${BATTUTA} il ciclo ha disegnato ${vitale.df} fotogrammi in ` +
              `${vitale.ms.toFixed(0)} ms: la sezione e' fuori campo e la posa imposta non ` +
              'verrebbe mai applicata. Lo sweep leggerebbe 101 volte lo stesso fotogramma.')
  console.error('\nCOLLAUDO CORSA FALLITO')
  for (const g of guasti) console.error('  · ' + g)
  await chiudi(1)
}
const fps = vitale.df / (vitale.ms / 1000)
righe.push(`  ciclo vivo: ${fps.toFixed(1)} fotogrammi al secondo alla battuta ${BATTUTA}`)

// ═══════════════════════════════════════════════════════════════════════════
// L'ARCO DELLA CAMERA, misurato spingendola contro i suoi due fermi
// ═══════════════════════════════════════════════════════════════════════════
async function spingiAzimut (tasto, colpi) {
  await pagina.evaluate(({ tasto, colpi }) => {
    const tela = window.__nautica.render.domElement
    tela.focus?.()
    for (let i = 0; i < colpi; i++) {
      tela.dispatchEvent(new KeyboardEvent('keydown', { key: tasto, bubbles: true, cancelable: true }))
    }
  }, { tasto, colpi })
  // l'azimut insegue il suo obiettivo con costante `dt*5`: gli si da' tempo di
  // arrivarci, e poi si controlla che sia FERMO invece di sperarlo
  let prec = null
  for (let i = 0; i < 30; i++) {
    await pagina.waitForTimeout(500)
    const a = await pagina.evaluate(() => window.__nautica.azimut)
    if (prec !== null && Math.abs(a - prec) < 1e-4) break
    prec = a
  }
  return await pagina.evaluate(() => {
    const n = window.__nautica
    n.camera.updateMatrixWorld(true)
    return {
      az: n.azimut,
      pos: [n.camera.position.x, n.camera.position.y, n.camera.position.z],
      m: Array.from(n.camera.matrixWorld.elements),
      near: n.camera.near
    }
  })
}

const estremoDx = await spingiAzimut('ArrowRight', 40)
const estremoSx = await spingiAzimut('ArrowLeft', 80)

/**
 * LA MIRA NON SI DEDUCE DALLA POSIZIONE DELLA CAMERA: si ricava dal suo ASSE
 * OTTICO piu' il raggio dichiarato. La camera orbita intorno a una mira che si
 * sposta col taglio, quindi ogni conto fatto sulla sola posizione mescola due
 * cose. Qui: mira = posizione + avanti · 2,6.
 */
function miraDa (c) {
  const m = c.m
  const L = Math.hypot(m[8], m[9], m[10])
  return [
    c.pos[0] - m[8] / L * RAGGIO_MECCANISMO,
    c.pos[1] - m[9] / L * RAGGIO_MECCANISMO,
    c.pos[2] - m[10] / L * RAGGIO_MECCANISMO
  ]
}
const miraDx = miraDa(estremoDx)
const miraSx = miraDa(estremoSx)
const mira = [0, 1, 2].map(i => (miraDx[i] + miraSx[i]) / 2)

/**
 * ─── IL MODELLO DELLA TRAIETTORIA SI VERIFICA, NON SI ASSUME
 *
 * L'ipotesi e' che la camera stia su `mira + 2,6·(sin az, 0, cos az)`. Se e'
 * vera, ricostruendo le posizioni ai due estremi dell'arco devono venire fuori
 * proprio le due posizioni misurate. Se `index.js` cambia la legge della
 * camera, questo confronto lo dice — invece di lasciar misurare per sempre un
 * cerchio che non esiste piu'.
 */
function posaAzimut (az) {
  return [mira[0] + Math.sin(az) * RAGGIO_MECCANISMO, mira[1], mira[2] + Math.cos(az) * RAGGIO_MECCANISMO]
}
let scartoTraiettoria = 0
for (const c of [estremoDx, estremoSx]) {
  const p = posaAzimut(c.az)
  scartoTraiettoria = Math.max(scartoTraiettoria, Math.hypot(p[0] - c.pos[0], p[1] - c.pos[1], p[2] - c.pos[2]))
}
righe.push(`  arco camera: azimut da ${estremoSx.az.toFixed(3)} a ${estremoDx.az.toFixed(3)} rad ` +
           `(${((estremoDx.az - estremoSx.az) * 180 / Math.PI).toFixed(1)}°), ` +
           `mira (${mira.map(v => v.toFixed(3)).join(', ')}), ` +
           `scarto del modello ${(scartoTraiettoria * 1000).toFixed(2)} mm`)
if (scartoTraiettoria > TRAIETTORIA_TOLLERANZA) {
  guasti.push(`la traiettoria ricostruita sbaglia di ${(scartoTraiettoria * 1000).toFixed(0)} mm ` +
              `sulle posizioni vere della camera: il cerchio di raggio ${RAGGIO_MECCANISMO} ` +
              'intorno alla mira non descrive piu\' la camera di `index.js`. ' +
              'Ogni conto sull\'invasione che segue sarebbe fatto su una traiettoria immaginaria.')
}
if (Math.abs(estremoDx.az - estremoSx.az) < 0.05) {
  guasti.push('l\'azimut non si muove: l\'arco della camera non e\' misurabile, ' +
              'e il controllo d\'invasione sarebbe fatto su un punto invece che su una traiettoria.')
}

// ═══════════════════════════════════════════════════════════════════════════
// L'IMPIANTO DELLA MISURA, dentro la pagina
// ═══════════════════════════════════════════════════════════════════════════
await pagina.evaluate(([PUNTI_PER_CORPO, CELLA, CAP_FRANCO]) => {
  const n = window.__nautica
  const M4 = n.scena.matrixWorld.constructor
  const C = (window.__corsa = { M4 })

  C.radici = []
  n.scena.traverse(o => { if (o.name === 'IMPIANTO') C.radici.push(o) })

  /**
   * ─── SI CUOCE UNA VOLTA SOLA, NEL SISTEMA LOCALE DEL NODO
   *
   * I corpi si muovono di moto RIGIDO. Se i vertici stanno nel sistema del
   * nodo che li porta, quel sistema non cambia mai — quindi la griglia di
   * accelerazione si costruisce una volta e non si tocca piu'. Per ogni posa si
   * trasformano i PUNTI (poche centinaia), mai i triangoli (migliaia).
   *
   * `inv(nodo.matrixWorld) · mesh.matrixWorld` e' costante anche per un nodo
   * che si muove: e' la posa relativa della mesh dentro il proprio nodo.
   */
  function cuoci (nodo, filtro) {
    nodo.updateMatrixWorld(true)
    const inv = new M4().copy(nodo.matrixWorld).invert()
    const vs = []; const is = []
    nodo.traverse((o) => {
      if (!o.isMesh || (filtro && !filtro(o))) return
      const g = o.geometry; const pos = g.attributes.position
      const e = new M4().multiplyMatrices(inv, o.matrixWorld).elements
      const base = vs.length / 3
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i); const y = pos.getY(i); const z = pos.getZ(i)
        vs.push(e[0] * x + e[4] * y + e[8] * z + e[12],
                e[1] * x + e[5] * y + e[9] * z + e[13],
                e[2] * x + e[6] * y + e[10] * z + e[14])
      }
      const ix = g.index
      if (ix) for (let i = 0; i < ix.count; i++) is.push(base + ix.getX(i))
      else for (let i = 0; i < pos.count; i++) is.push(base + i)
    })
    return { vert: new Float64Array(vs), idx: new Uint32Array(is) }
  }

  /**
   * I PUNTI DI PROVA: vertici piu' baricentri, decimati con passo fisso.
   *
   * Solo i vertici non bastano — su un triangolo grande il centro resterebbe
   * scoperto. Solo i baricentri nemmeno: le punte dei lobi, che sono la cosa
   * che compenetra, stanno nei vertici. Servono tutti e due, e il passo e'
   * fisso perche' due esecuzioni diano lo stesso risultato.
   */
  function campiona (corpo, quanti) {
    const { vert, idx } = corpo
    const nV = vert.length / 3; const nT = idx.length / 3
    const out = []
    const pv = Math.max(1, Math.ceil(nV / (quanti / 2)))
    for (let i = 0; i < nV; i += pv) out.push(vert[i * 3], vert[i * 3 + 1], vert[i * 3 + 2])
    const pt = Math.max(1, Math.ceil(nT / (quanti / 2)))
    for (let t = 0; t < nT; t += pt) {
      const a = idx[t * 3] * 3; const b = idx[t * 3 + 1] * 3; const c = idx[t * 3 + 2] * 3
      out.push((vert[a] + vert[b] + vert[c]) / 3,
               (vert[a + 1] + vert[b + 1] + vert[c + 1]) / 3,
               (vert[a + 2] + vert[b + 2] + vert[c + 2]) / 3)
    }
    return new Float64Array(out)
  }

  /** Griglia uniforme 3D: per la distanza. Griglia 2D su (y,z): per la parita'. */
  function griglie (corpo, h, cap) {
    const { vert, idx } = corpo
    const nT = idx.length / 3
    const lo = [Infinity, Infinity, Infinity]; const hi = [-Infinity, -Infinity, -Infinity]
    for (let i = 0; i < vert.length; i += 3) {
      for (let k = 0; k < 3; k++) {
        if (vert[i + k] < lo[k]) lo[k] = vert[i + k]
        if (vert[i + k] > hi[k]) hi[k] = vert[i + k]
      }
    }
    const n3 = [0, 1, 2].map(k => Math.max(1, Math.ceil((hi[k] - lo[k]) / h) + 1))
    const celle3 = n3[0] * n3[1] * n3[2]
    const cel = (x, y, z) => x + n3[0] * (y + n3[1] * z)
    const ind = (v, k) => Math.min(n3[k] - 1, Math.max(0, Math.floor((v - lo[k]) / h)))

    // conteggio, prefisso, riempimento — due passate, zero array di array
    const conta = new Int32Array(celle3 + 1)
    const conta2 = new Int32Array(n3[1] * n3[2] + 1)
    const passa = (fn3, fn2) => {
      for (let t = 0; t < nT; t++) {
        const a = idx[t * 3] * 3; const b = idx[t * 3 + 1] * 3; const c = idx[t * 3 + 2] * 3
        const t0 = []; const t1 = []
        for (let k = 0; k < 3; k++) {
          t0[k] = ind(Math.min(vert[a + k], vert[b + k], vert[c + k]), k)
          t1[k] = ind(Math.max(vert[a + k], vert[b + k], vert[c + k]), k)
        }
        for (let z = t0[2]; z <= t1[2]; z++) {
          for (let y = t0[1]; y <= t1[1]; y++) {
            fn2(y + n3[1] * z, t)
            for (let x = t0[0]; x <= t1[0]; x++) fn3(cel(x, y, z), t)
          }
        }
      }
    }
    // la 2D va contata una volta sola per (y,z): il ciclo sopra la visiterebbe
    // una volta per ogni x, quindi si tiene traccia dell'ultimo triangolo visto
    const visto2 = new Int32Array(n3[1] * n3[2]).fill(-1)
    passa((c) => { conta[c + 1]++ }, (c, t) => { if (visto2[c] !== t) { visto2[c] = t; conta2[c + 1]++ } })
    for (let i = 0; i < celle3; i++) conta[i + 1] += conta[i]
    for (let i = 0; i < n3[1] * n3[2]; i++) conta2[i + 1] += conta2[i]
    const dati = new Int32Array(conta[celle3])
    const dati2 = new Int32Array(conta2[n3[1] * n3[2]])
    const cur = Int32Array.from(conta.subarray(0, celle3))
    const cur2 = Int32Array.from(conta2.subarray(0, n3[1] * n3[2]))
    visto2.fill(-1)
    passa((c, t) => { dati[cur[c]++] = t },
          (c, t) => { if (visto2[c] !== t) { visto2[c] = t; dati2[cur2[c]++] = t } })

    /**
     * ─── LA MASCHERA GROSSOLANA: un colpo solo per scartare i punti lontani
     *
     * Celle larghe quanto il tetto del franco, marcate dove passa un triangolo
     * e poi DILATATE di una cella. Se la cella di un punto e' spenta, allora
     * nessun triangolo tocca ne' lei ne' le 26 vicine: il triangolo piu' vicino
     * sta almeno una cella intera piu' in la', quindi la distanza e' >= al lato
     * della cella. Un `if` invece di una ricerca a gusci.
     */
    const H = cap
    const nc = [0, 1, 2].map(k => Math.max(1, Math.ceil((hi[k] - lo[k]) / H) + 1))
    const grezza = new Uint8Array(nc[0] * nc[1] * nc[2])
    const ic = (v, k) => Math.min(nc[k] - 1, Math.max(0, Math.floor((v - lo[k]) / H)))
    for (let t = 0; t < nT; t++) {
      const a = idx[t * 3] * 3; const b = idx[t * 3 + 1] * 3; const c = idx[t * 3 + 2] * 3
      const t0 = []; const t1 = []
      for (let k = 0; k < 3; k++) {
        t0[k] = ic(Math.min(vert[a + k], vert[b + k], vert[c + k]), k)
        t1[k] = ic(Math.max(vert[a + k], vert[b + k], vert[c + k]), k)
      }
      for (let z = t0[2]; z <= t1[2]; z++) {
        for (let y = t0[1]; y <= t1[1]; y++) {
          for (let x = t0[0]; x <= t1[0]; x++) grezza[x + nc[0] * (y + nc[1] * z)] = 1
        }
      }
    }
    const dil = new Uint8Array(grezza.length)
    for (let z = 0; z < nc[2]; z++) {
      for (let y = 0; y < nc[1]; y++) {
        for (let x = 0; x < nc[0]; x++) {
          if (!grezza[x + nc[0] * (y + nc[1] * z)]) continue
          for (let dz = -1; dz <= 1; dz++) {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const X = x + dx; const Y = y + dy; const Z = z + dz
                if (X < 0 || Y < 0 || Z < 0 || X >= nc[0] || Y >= nc[1] || Z >= nc[2]) continue
                dil[X + nc[0] * (Y + nc[1] * Z)] = 1
              }
            }
          }
        }
      }
    }
    return { lo, hi, n3, h, conta, dati, conta2, dati2, nc, H, dil }
  }

  /** Distanza punto-triangolo, quella vera. */
  function distTri (px, py, pz, ax, ay, az, bx, by, bz, cx, cy, cz) {
    const abx = bx - ax; const aby = by - ay; const abz = bz - az
    const acx = cx - ax; const acy = cy - ay; const acz = cz - az
    const apx = px - ax; const apy = py - ay; const apz = pz - az
    const d1 = abx * apx + aby * apy + abz * apz
    const d2 = acx * apx + acy * apy + acz * apz
    if (d1 <= 0 && d2 <= 0) return apx * apx + apy * apy + apz * apz
    const bpx = px - bx; const bpy = py - by; const bpz = pz - bz
    const d3 = abx * bpx + aby * bpy + abz * bpz
    const d4 = acx * bpx + acy * bpy + acz * bpz
    if (d3 >= 0 && d4 <= d3) return bpx * bpx + bpy * bpy + bpz * bpz
    const vc = d1 * d4 - d3 * d2
    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
      const v = d1 / (d1 - d3)
      const qx = ax + abx * v - px; const qy = ay + aby * v - py; const qz = az + abz * v - pz
      return qx * qx + qy * qy + qz * qz
    }
    const cpx = px - cx; const cpy = py - cy; const cpz = pz - cz
    const d5 = abx * cpx + aby * cpy + abz * cpz
    const d6 = acx * cpx + acy * cpy + acz * cpz
    if (d6 >= 0 && d5 <= d6) return cpx * cpx + cpy * cpy + cpz * cpz
    const vb = d5 * d2 - d1 * d6
    if (vb <= 0 && d2 >= 0 && d6 <= 0) {
      const w = d2 / (d2 - d6)
      const qx = ax + acx * w - px; const qy = ay + acy * w - py; const qz = az + acz * w - pz
      return qx * qx + qy * qy + qz * qz
    }
    const va = d3 * d6 - d5 * d4
    if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
      const w = (d4 - d3) / ((d4 - d3) + (d5 - d6))
      const qx = bx + (cx - bx) * w - px; const qy = by + (cy - by) * w - py; const qz = bz + (cz - bz) * w - pz
      return qx * qx + qy * qy + qz * qz
    }
    const den = 1 / (va + vb + vc)
    const v = vb * den; const w = vc * den
    const qx = ax + abx * v + acx * w - px
    const qy = ay + aby * v + acy * w - py
    const qz = az + abz * v + acz * w - pz
    return qx * qx + qy * qy + qz * qz
  }

  /**
   * Distanza minima dalla superficie, a gusci di celle che si allargano.
   * `limite` ferma la ricerca: oltre, la risposta e' `Infinity` e vuol dire
   * «piu' lontano di cosi'», non «non trovato».
   */
  function distanza (g, corpo, px, py, pz, limite) {
    const { vert, idx } = corpo
    const { lo, n3, h, conta, dati } = g
    const ci = [0, 1, 2].map(k => Math.min(n3[k] - 1, Math.max(0, Math.floor(([px, py, pz][k] - lo[k]) / h))))
    let best = Infinity
    const maxR = Math.max(n3[0], n3[1], n3[2])
    for (let r = 0; r <= maxR; r++) {
      // se il guscio precedente ha gia' dato una distanza piu' corta del bordo
      // interno di questo, non c'e' piu' niente da guardare
      if (best < Infinity && Math.sqrt(best) <= (r - 1) * h) break
      if ((r - 1) * h > limite) return Infinity
      let toccato = false
      for (let z = ci[2] - r; z <= ci[2] + r; z++) {
        if (z < 0 || z >= n3[2]) continue
        for (let y = ci[1] - r; y <= ci[1] + r; y++) {
          if (y < 0 || y >= n3[1]) continue
          const bordoYZ = Math.abs(z - ci[2]) === r || Math.abs(y - ci[1]) === r
          for (let x = ci[0] - r; x <= ci[0] + r; x++) {
            if (x < 0 || x >= n3[0]) continue
            if (!bordoYZ && Math.abs(x - ci[0]) !== r) continue
            const c = x + n3[0] * (y + n3[1] * z)
            for (let i = conta[c]; i < conta[c + 1]; i++) {
              toccato = true
              const t = dati[i] * 3
              const a = idx[t] * 3; const b = idx[t + 1] * 3; const cc = idx[t + 2] * 3
              const d = distTri(px, py, pz,
                vert[a], vert[a + 1], vert[a + 2],
                vert[b], vert[b + 1], vert[b + 2],
                vert[cc], vert[cc + 1], vert[cc + 2])
              if (d < best) best = d
            }
          }
        }
      }
      if (!toccato && best === Infinity && r > maxR) break
    }
    return Math.sqrt(best)
  }

  /**
   * CONTENIMENTO PER PARITA'. Raggio lungo +x locale, tre origini sfalsate di
   * qualche micron, vince la maggioranza. Lo sfalsamento e' sull'ORIGINE e non
   * sulla direzione, cosi' il secchiello su (y,z) resta esatto.
   */
  const SFALSA = [[0, 0], [1.7e-5, 0.9e-5], [-1.3e-5, 1.9e-5]]
  const ORLO = 1e-6
  /** Un solo raggio, e le tre origini solo quando serve davvero. */
  function tira (g, corpo, px, py, pz, dy, dz, stato) {
    const { vert, idx } = corpo
    const { lo, n3, h, conta2, dati2 } = g
    const qy = py + dy; const qz = pz + dz
    const iy = Math.floor((qy - lo[1]) / h); const iz = Math.floor((qz - lo[2]) / h)
    if (iy < 0 || iy >= n3[1] || iz < 0 || iz >= n3[2]) return 0
    const c = iy + n3[1] * iz
    let colpi = 0
    for (let i = conta2[c]; i < conta2[c + 1]; i++) {
      const t = dati2[i] * 3
      const a = idx[t] * 3; const b = idx[t + 1] * 3; const cc = idx[t + 2] * 3
      // Moller-Trumbore con direzione (1,0,0)
      const e1x = vert[b] - vert[a]
      const e1y = vert[b + 1] - vert[a + 1]; const e1z = vert[b + 2] - vert[a + 2]
      const e2x = vert[cc] - vert[a]; const e2y = vert[cc + 1] - vert[a + 1]; const e2z = vert[cc + 2] - vert[a + 2]
      // p = dir x e2 = (1,0,0) x e2 = (0, -e2z, e2y)
      const det = e1y * -e2z + e1z * e2y
      if (det > -1e-14 && det < 1e-14) continue
      const inv = 1 / det
      const tx = px - vert[a]; const ty = qy - vert[a + 1]; const tz = qz - vert[a + 2]
      const u = (ty * -e2z + tz * e2y) * inv
      if (u < -ORLO || u > 1 + ORLO) continue
      const qx2 = ty * e1z - tz * e1y
      const qy2 = tz * e1x - tx * e1z
      const qz2 = tx * e1y - ty * e1x
      const v = qx2 * inv   // dir·q = qx2
      if (v < -ORLO || u + v > 1 + ORLO) continue
      const tt = (e2x * qx2 + e2y * qy2 + e2z * qz2) * inv
      if (tt <= 0) continue
      colpi++
      // colpo troppo vicino a uno spigolo: da qui in poi la parita' non e' fidata
      if (u < ORLO || v < ORLO || u + v > 1 - ORLO) stato.sospetto = true
    }
    return colpi
  }
  function dentro (g, corpo, px, py, pz) {
    const stato = { sospetto: false }
    const c0 = tira(g, corpo, px, py, pz, 0, 0, stato)
    if (!stato.sospetto) return (c0 & 1) === 1
    /**
     * SOLO QUI SI PAGANO TRE RAGGI. Un raggio che passa esattamente su uno
     * spigolo condiviso conta due volte e ribalta la parita'; ma succede a
     * pochi punti su un milione, e provarli tutti tre volte costerebbe il
     * triplo per curare l'uno per mille. Si sfalsa l'ORIGINE di qualche micron,
     * non la direzione, cosi' il secchiello su (y,z) resta esatto.
     */
    let si = (c0 & 1) === 1 ? 1 : 0
    for (let k = 1; k < 3; k++) {
      const s = { sospetto: false }
      if (tira(g, corpo, px, py, pz, SFALSA[k][0], SFALSA[k][1], s) & 1) si++
    }
    return si >= 2
  }

  C.cuoci = cuoci; C.campiona = campiona; C.griglie = griglie
  C.distanza = distanza; C.dentro = dentro

  // ── i corpi ────────────────────────────────────────────────────────────────
  const r0 = C.radici[0]
  const q = (s) => { let t = null; r0.traverse(o => { if (o.name === s) t = o }); return t }
  /**
   * ─── LA CORONA DI PERNI NON E' IL CARTER, ANCHE SE STA NELLO STESSO NODO
   *
   * `HOUSING_FIXED` porta due cose che vanno tenute separate: il GUSCIO (anelli,
   * nervature, piede, flangia, coperchio d'ispezione) e la CORONA DEI 30 PERNI
   * FISSI, che e' il pezzo contro cui i lobi dei dischi ingranano. Il §10.2 dice
   * «i dischi non attraversano il carter fisso»: se si mette tutto insieme, il
   * cancello e' rosso a ogni posa per il motivo per cui il riduttore funziona,
   * e un cancello sempre rosso si impara a ignorare.
   *
   * La separazione si fa per NOME DEL MATERIALE — nel GLB i perni sono `lucido`,
   * il guscio `carter` e `acciaio` — e poi si VERIFICA: la corona deve stare
   * intorno a un raggio solo. Se un giorno i materiali cambiano, il controllo
   * qui sotto lo dice invece di misurare in silenzio il pezzo sbagliato.
   */
  const eLucido = (o) => {
    const m = Array.isArray(o.material) ? o.material[0] : o.material
    return !!m && m.name === 'lucido'
  }
  const corpi = C.corpi = {}
  corpi.discoA = { nodo: 'RIG_CYCLO_A', ...cuoci(q('RIG_CYCLO_A')) }
  corpi.discoB = { nodo: 'RIG_CYCLO_B', ...cuoci(q('RIG_CYCLO_B')) }
  corpi.portante = { nodo: 'RIG_OUTPUT', ...cuoci(q('RIG_OUTPUT')) }
  corpi.guscio = { nodo: 'HOUSING_FIXED', ...cuoci(q('HOUSING_FIXED'), o => !eLucido(o)) }
  corpi.perni = { nodo: 'HOUSING_FIXED', ...cuoci(q('HOUSING_FIXED'), eLucido) }
  corpi.coperchio = { nodo: 'HOUSING_REMOVABLE', ...cuoci(q('HOUSING_REMOVABLE')) }
  corpi.sezione = { nodo: 'HOUSING_SECTION', ...cuoci(q('HOUSING_SECTION')) }

  for (const k of Object.keys(corpi)) {
    const c = corpi[k]
    if (!c.idx.length) { c.vuoto = true; continue }
    c.punti = campiona(c, PUNTI_PER_CORPO)
    c.g = griglie(c, CELLA, CAP_FRANCO)
  }

  /**
   * ─── SI CONTROLLA CHE LA CORONA SIA UNA CORONA
   *
   * La separazione per nome del materiale funziona finche' i nomi restano
   * quelli. Se un giorno cambiano, `perni` conterrebbe mezzo carter e il
   * cancello misurerebbe in silenzio il pezzo sbagliato — che e' il modo in cui
   * uno strumento rotto restituisce un numero invece di un errore.
   *
   * Quindi si guarda la FORMA di cio' che si e' selezionato: una corona di
   * perni sta quasi tutta su un raggio solo, e quel raggio deve cadere vicino
   * alla cresta dei lobi, perche' e' li' che i due pezzi ingranano. Due
   * proprieta' misurabili, nessuna delle due dipendente dal nome.
   */
  const raggiDi = (c) => {
    const r = []
    for (let i = 0; i < c.vert.length; i += 3) r.push(Math.hypot(c.vert[i + 1], c.vert[i + 2]))
    return r.sort((a, b) => a - b)
  }
  const rp = raggiDi(corpi.perni)
  const rd = raggiDi(corpi.discoA)
  const med = rp[rp.length >> 1]
  C.corona = {
    n: rp.length,
    min: rp[0],
    mediana: med,
    max: rp[rp.length - 1],
    // quanta parte sta davvero su un raggio solo. Non un percentile: la
    // targhetta del carter e' anche lei `lucido` e vive a 240 mm — pochi
    // vertici, del tutto innocui (non arrivano mai vicino ai dischi), ma
    // abbastanza da spostare un novantacinquesimo percentile.
    concentrazione: rp.filter(r => Math.abs(r - med) < 0.020).length / rp.length,
    crestaDisco: rd[rd.length - 1]
  }

  // tutti i nodi, per il NaN e per la camera
  C.nomiNodi = ['STATIC_FOUNDATION', 'STATIC_HULL_PLATE', 'STATIC_SEAL', 'STATIC_MOTOR',
    'HOUSING_FIXED', 'HOUSING_REMOVABLE', 'HOUSING_SECTION',
    'RIG_INPUT', 'RIG_ECCENTRIC', 'RIG_CYCLO_A', 'RIG_CYCLO_B',
    'RIG_OUTPUT', 'RIG_SHAFT', 'RIG_FIN']
  C.nuvole = {}
  for (const nm of C.nomiNodi) {
    const nodo = q(nm)
    if (!nodo) continue
    const c = cuoci(nodo)
    if (!c.idx.length) continue
    C.nuvole[nm] = campiona(c, 300)
  }

  return true
}, [PUNTI_PER_CORPO, CELLA, CAP_FRANCO])

const corona = await pagina.evaluate(() => window.__corsa.corona)
righe.push(`  corona dei perni fissi: ${corona.n} vertici, raggio mediano ` +
           `${(corona.mediana * 1000).toFixed(0)} mm, ` +
           `${(corona.concentrazione * 100).toFixed(0)}% entro ±20 mm da li' ` +
           `(estremi ${(corona.min * 1000).toFixed(0)}–${(corona.max * 1000).toFixed(0)}); ` +
           `cresta dei lobi ${(corona.crestaDisco * 1000).toFixed(0)} mm`)
if (corona.concentrazione < 0.80) {
  guasti.push(`solo il ${(corona.concentrazione * 100).toFixed(0)}% di cio' che e' stato preso per ` +
              '«corona di perni» sta su un raggio solo: non e\' una corona. La separazione per nome ' +
              'del materiale dentro HOUSING_FIXED non regge piu\', e i due controlli «contro il ' +
              'carter» e «contro i perni» stanno misurando pezzi sbagliati.')
}
if (Math.abs(corona.mediana - corona.crestaDisco) > 0.030) {
  guasti.push(`la corona sta a ${(corona.mediana * 1000).toFixed(0)} mm e la cresta dei lobi a ` +
              `${(corona.crestaDisco * 1000).toFixed(0)} mm: piu' di 30 mm di distanza vuol dire che ` +
              'i due pezzi non ingranano affatto, o che non e\' la corona quella che e\' stata isolata.')
}

// ═══════════════════════════════════════════════════════════════════════════
// LO SWEEP: 101 pose imposte al sito, un fotogramma vero ciascuna
// ═══════════════════════════════════════════════════════════════════════════
const angoli = Array.from({ length: POSE }, (_, k) =>
  (-ANGOLO_MAX + 2 * ANGOLO_MAX * k / (POSE - 1)) * Math.PI / 180)

/**
 * --- L'ALIASING SI PUO' ANCHE FABBRICARE, PER VEDERE SE IL CANCELLO SE NE
 *     ACCORGE
 *
 * Con `--rompi=aliasing` le pose diventano cinque, distanti un giro esatto
 * d'ingresso l'una dall'altra (360/29 gradi di pinna): la macchina si ritrova
 * nella stessa identica posa cinque volte, e uno sweep ingenuo direbbe che ha
 * spazzato tutto.
 */
const angoliVeri = ROMPI === 'aliasing'
  ? Array.from({ length: 5 }, (_, k) => (-12.4137931 + k * 360 / 29) * Math.PI / 180)
  : angoli

await pagina.evaluate(() => {
  const n = window.__nautica
  const C = window.__corsa
  const S = n.stato
  C.descrittore = Object.getOwnPropertyDescriptor(S, 'pinna')
  C.imposto = 0
  /**
   * IL DIROTTAMENTO. Un getter al posto del campo: cio' che `simulazione.js`
   * scrive viene ingoiato, e `impianto.js` legge questo. La posa la applica il
   * SITO, con la sua cinematica — qui non c'e' una seconda copia del riduttore.
   */
  Object.defineProperty(S, 'pinna', {
    get: () => C.imposto, set: () => {}, configurable: true
  })
  C.pose = []
})

async function registra (angolo, rompi) {
  return await pagina.evaluate(async ([a, rompi]) => {
    const n = window.__nautica
    const C = window.__corsa
    C.imposto = a
    // due fotogrammi: il primo puo' essere quello gia' in coda quando ho scritto
    const f0 = n.fotogrammi
    const scad = performance.now() + 8000
    while (n.fotogrammi < f0 + 2 && performance.now() < scad) {
      await new Promise(r => requestAnimationFrame(r))
    }
    const disegnati = n.fotogrammi - f0

    const out = { a, disegnati, imp: [] }
    for (const r of C.radici) {
      const q = (s) => { let t = null; r.traverse(o => { if (o.name === s) t = o }); return t }

      // ─── SABOTAGGIO, sulla scena viva e mai sui sorgenti
      const salvaY = rompi === 'nan' ? q('RIG_OUTPUT').position.y : 0
      if (rompi === 'nan') q('RIG_OUTPUT').position.y = NaN
      if (rompi === 'disco') q('RIG_CYCLO_A').position.y += 0.20
      /**
       * L'IMPIANTO VA MESSO ADDOSSO ALLA CAMERA, non «piu' in la'».
       *
       * Prima qui c'era una gonfiatura ×12, con l'argomento che un pezzo grande
       * copre ogni raggio e quindi taglia il cerchio per forza. MISURATO: il
       * franco scendeva da 1,259 a 0,196 unita' e il cancello restava verde,
       * perche' 0,196 e' ancora fuori dal piano vicino. Un sabotaggio che
       * «quasi» rompe non dimostra niente, e stavo per prenderlo per buono.
       *
       * Cosi' invece non c'e' niente da sperare: l'origine dell'impianto si
       * porta ESATTAMENTE dove sta l'obiettivo, che e' per definizione un punto
       * della traiettoria e dentro l'arco. Franco atteso: zero.
       */
      let salvaPos = null
      if (rompi === 'camera') {
        const V3 = n.camera.position.constructor
        r.parent.updateMatrixWorld(true)
        salvaPos = [r.position.x, r.position.y, r.position.z]
        const p = new V3().copy(n.camera.position)
          .applyMatrix4(new C.M4().copy(r.parent.matrixWorld).invert())
        r.position.copy(p)
      }
      if (rompi) r.updateMatrixWorld(true)

      r.updateMatrixWorld(true)
      const inv = new C.M4().copy(r.matrixWorld).invert()
      const nodi = {}
      const mondo = {}
      const vis = {}
      const nan = []
      for (const nm of C.nomiNodi) {
        const o = q(nm)
        if (!o) { nan.push(nm + ' assente'); continue }
        const M = new C.M4().multiplyMatrices(inv, o.matrixWorld)
        nodi[nm] = Array.from(M.elements)
        mondo[nm] = Array.from(o.matrixWorld.elements)
        /**
         * UN PEZZO SPENTO NON BUCA NIENTE. `STATIC_HULL_PLATE` e' nascosto dal
         * sito (lo scafo vero c'e' gia'), e `HOUSING_REMOVABLE` sparisce a
         * corsa finita. Contarli come invasori vorrebbe dire accusare la scena
         * di mostrare qualcosa che non mostra. La visibilita' si legge risalendo
         * tutta la catena, perche' basta un antenato spento.
         */
        let acceso = true
        for (let a = o; a && a !== r.parent; a = a.parent) if (!a.visible) acceso = false
        vis[nm] = acceso
        const campi = [o.position.x, o.position.y, o.position.z,
          o.quaternion.x, o.quaternion.y, o.quaternion.z, o.quaternion.w,
          o.scale.x, o.scale.y, o.scale.z, ...o.matrixWorld.elements]
        if (campi.some(v => !Number.isFinite(v))) nan.push(nm)
      }
      out.imp.push({
        nodi,
        mondo,
        vis,
        nan,
        radice: Array.from(r.matrixWorld.elements),
        pinna: q('RIG_FIN').rotation.x,
        albero: q('RIG_SHAFT').rotation.x,
        uscita: q('RIG_OUTPUT').rotation.x,
        ingresso: q('RIG_INPUT').rotation.x,
        coperchio: [q('HOUSING_REMOVABLE').position.x, q('HOUSING_REMOVABLE').position.y, q('HOUSING_REMOVABLE').position.z]
      })

      // si rimette a posto, se no il sabotaggio si accumula posa dopo posa
      if (rompi === 'nan') q('RIG_OUTPUT').position.y = salvaY
      if (rompi === 'disco') q('RIG_CYCLO_A').position.y -= 0.20
      if (rompi === 'camera') r.position.set(...salvaPos)
    }
    C.pose.push(out)
    return { disegnati, nan: out.imp.flatMap(i => i.nan) }
  }, [angolo, rompi])
}

process.stdout.write('  corsa: ')
let fermi = 0
const nanTrovati = []
for (let k = 0; k < angoliVeri.length; k++) {
  const r = await registra(angoliVeri[k], ROMPI)
  if (r.disegnati < 2) fermi++
  if (r.nan.length) nanTrovati.push(`${(angoliVeri[k] * 180 / Math.PI).toFixed(1)}°: ${r.nan.join(', ')}`)
  if (k % 10 === 0) process.stdout.write('.')
}
process.stdout.write(` ${angoliVeri.length} pose\n`)

await pagina.evaluate(() => {
  const S = window.__nautica.stato
  Object.defineProperty(S, 'pinna', window.__corsa.descrittore)
})

if (fermi) {
  guasti.push(`${fermi} pose su ${angoliVeri.length} sono state lette senza che il sito ` +
              'disegnasse un fotogramma nuovo: quelle pose non sono state applicate, ' +
              'e il verde che ne uscirebbe sarebbe lo stesso fotogramma contato piu\' volte.')
}

// ── §10.2 · NaN e matrici non finite ─────────────────────────────────────────
if (nanTrovati.length) {
  guasti.push(`NaN o matrice non finita in ${nanTrovati.length} pose. Primi casi: ` +
              nanTrovati.slice(0, 3).join(' | ') + '. ' +
              'Un nodo non finito propaga a tutti i figli e la mesh sparisce senza un errore.')
}

// ── §10.2 · pinna, albero e uscita non devono divergere ──────────────────────
const catena = await pagina.evaluate(() => {
  let peggio = 0; let dove = null; const R = []
  for (const p of window.__corsa.pose) {
    const i = p.imp[0]
    const d = Math.max(Math.abs(i.pinna - i.albero), Math.abs(i.pinna - i.uscita))
    if (d > peggio) { peggio = d; dove = p.a }
    R.push({ a: p.a, pinna: i.pinna, ingresso: i.ingresso })
  }
  return { peggio, dove, R, lato: Math.sign(window.__corsa.pose[0].imp[0].pinna / window.__corsa.pose[0].a || 1) }
})
righe.push(`  pinna/albero/uscita: scarto massimo ${catena.peggio.toExponential(1)} rad`)
if (catena.peggio > 1e-9) {
  guasti.push(`pinna, albero e uscita divergono di ${catena.peggio.toExponential(2)} rad: ` +
              '§3.2 li vuole sullo stesso angolo, e tre valori diversi vogliono dire ' +
              'che qualcuno sta scrivendo su un nodo per conto suo.')
}

// ── l'angolo imposto e' arrivato davvero? ────────────────────────────────────
let scartoImposto = 0
for (const r of catena.R) {
  if (Math.abs(r.a) < 1e-6) continue
  scartoImposto = Math.max(scartoImposto, Math.abs(Math.abs(r.pinna) - Math.abs(r.a)))
}
if (scartoImposto > 1e-9) {
  guasti.push(`l'angolo letto su RIG_FIN sbaglia fino a ${scartoImposto.toExponential(2)} rad ` +
              'rispetto a quello imposto: il dirottamento di `S.pinna` non sta comandando il ' +
              'meccanismo, e tutto quello che segue misurerebbe pose che nessuno ha chiesto.')
}

// ── L'ALIASING: quanto e' fitta la corsa sull'albero d'ingresso? ─────────────
const fasi = catena.R.map(r => ((r.ingresso * 180 / Math.PI) % 360 + 360) % 360).sort((a, b) => a - b)
let buco = 0
for (let i = 0; i < fasi.length; i++) {
  const d = i === 0 ? fasi[0] + 360 - fasi[fasi.length - 1] : fasi[i] - fasi[i - 1]
  if (d > buco) buco = d
}
const giri = (Math.max(...catena.R.map(r => r.ingresso)) - Math.min(...catena.R.map(r => r.ingresso))) * 180 / Math.PI / 360
righe.push(`  ingresso: ${(giri * 360).toFixed(0)}° = ${giri.toFixed(2)} giri; ` +
           `${fasi.length} fasi distinte, buco massimo ${buco.toFixed(2)}° ` +
           `(ideale ${(360 / fasi.length).toFixed(2)}°, tetto ${BUCO_MASSIMO.toFixed(2)}°)`)
if (giri < 3.9) {
  guasti.push(`l'ingresso ha compiuto ${giri.toFixed(2)} giri invece dei 4 che il rapporto 29:1 ` +
              'impone su 50 gradi di pinna: la corsa non copre il ciclo del riduttore.')
}
if (buco > BUCO_MASSIMO) {
  guasti.push(`le ${fasi.length} pose lasciano un buco di ${buco.toFixed(1)}° sull'albero ` +
              `d'ingresso, oltre il tetto di ${BUCO_MASSIMO.toFixed(1)}°: lo sweep sta ALIASANDO. ` +
              'Quattro giri campionati in fase quasi identica sono quattro volte lo stesso ' +
              'fotogramma, e il verde che ne esce non prova niente.')
}

// ═══════════════════════════════════════════════════════════════════════════
// LA COMPENETRAZIONE
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Le coppie. Le prime tre sono il §10.2 alla lettera. Le altre esistono perche'
 * la domanda vera — «questa macchina si compenetra?» — non si ferma al guscio:
 * il §3.2 pretende che i perni del portante attraversino DAVVERO i fori dei
 * dischi, e «attraversare un foro» e «attraversare la materia» sono la stessa
 * frase con due significati opposti. Se il foro e' troppo stretto, il perno non
 * ci passa dentro: ci passa ATTRAVERSO.
 */
const COPPIE = [
  ['discoA', 'guscio', 'disco A contro il carter fisso'],
  ['discoB', 'guscio', 'disco B contro il carter fisso'],
  ['portante', 'guscio', 'portante contro il carter fisso'],
  ['discoA', 'perni', 'lobi del disco A contro la corona di perni'],
  ['discoB', 'perni', 'lobi del disco B contro la corona di perni'],
  ['discoA', 'portante', 'perni del portante nei fori del disco A'],
  ['discoB', 'portante', 'perni del portante nei fori del disco B'],
  ['discoA', 'discoB', 'disco A contro disco B'],
  ['portante', 'coperchio', 'portante contro il carter removibile'],
  ['discoA', 'sezione', 'disco A contro l\'anello di sezione']
]

await pagina.evaluate((COPPIE) => { window.__corsa.COPPIE = COPPIE }, COPPIE)

/**
 * ─── PRIMA SI SPEGNE IL CICLO DI DISEGNO
 *
 * L'analisi e' pesante e sincrona. Lasciata a competere con `setAnimationLoop`
 * su una macchina che gia' fatica a fare un fotogramma al secondo, ci mette il
 * triplo. Il ciclo si ferma da solo quando la sezione esce di campo: basta
 * risalire, e verificare che si sia fermato davvero invece di sperarlo.
 */
await pagina.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
await pagina.waitForTimeout(1500)
const spento = await pagina.evaluate(async () => {
  const f0 = window.__nautica.fotogrammi
  await new Promise(r => setTimeout(r, 800))
  return window.__nautica.fotogrammi - f0
})
righe.push(`  ciclo di disegno spento per l'analisi: ${spento} fotogrammi in 800 ms`)

await pagina.evaluate(() => {
  const C = window.__corsa
  const M4 = C.M4
  C.esiti = {}
  for (const [, , eti] of C.COPPIE) C.esiti[eti] = { pen: 0, penA: null, franco: Infinity, francoA: null, coppie: 0 }

  /**
   * Una coppia, una posa. Si prova nei DUE VERSI: i punti di X dentro Y e i
   * punti di Y dentro X. Un perno che infila un foro troppo stretto puo' avere
   * tutti i propri vertici fuori dal disco e intersecarlo lo stesso — o
   * viceversa. Un verso solo e' mezza misura.
   */
  C.provaCoppia = function (posa, iImp, nomeX, nomeY, eti) {
    const corpi = C.corpi
    const X = corpi[nomeX]; const Y = corpi[nomeY]
    if (X.vuoto || Y.vuoto) return
    const p = posa.imp[iImp]
    const MX = new M4().fromArray(p.nodi[X.nodo])
    const MY = new M4().fromArray(p.nodi[Y.nodo])
    const e = C.esiti[eti]
    e.coppie++
    for (const [A, B, gA, gB] of [[X, Y, MX, MY], [Y, X, MY, MX]]) {
      // dai punti di A (locali ad A) al sistema locale di B
      const T = new M4().multiplyMatrices(new M4().copy(gB).invert(), gA).elements
      const pts = A.punti
      for (let i = 0; i < pts.length; i += 3) {
        const x = pts[i]; const y = pts[i + 1]; const z = pts[i + 2]
        const bx = T[0] * x + T[4] * y + T[8] * z + T[12]
        const by = T[1] * x + T[5] * y + T[9] * z + T[13]
        const bz = T[2] * x + T[6] * y + T[10] * z + T[14]
        if (bx < B.g.lo[0] || bx > B.g.hi[0] ||
            by < B.g.lo[1] || by > B.g.hi[1] ||
            bz < B.g.lo[2] || bz > B.g.hi[2]) {
          // fuori dalla scatola del bersaglio: non puo' essere dentro il solido.
          // Il franco, se e' dentro il tetto, lo trova il ramo grossolano qui
          // sotto tramite la maschera; qui si esce e basta.
          continue
        }
        /**
         * PRIMA IL SEGNO, POI LA DISTANZA. La parita' costa una cella di
         * secchiello; la distanza costa una ricerca. E il segno cambia cosa
         * significa il numero — profondita' o franco — quindi cercare la
         * distanza senza sapere da che parte si sta e' lavoro fatto due volte.
         */
        if (C.dentro(B.g, B, bx, by, bz)) {
          const d = C.distanza(B.g, B, bx, by, bz, 0.25)
          if (d > e.pen) { e.pen = d; e.penA = posa.a }
        } else {
          const g = B.g
          const cx = Math.floor((bx - g.lo[0]) / g.H)
          const cy = Math.floor((by - g.lo[1]) / g.H)
          const cz = Math.floor((bz - g.lo[2]) / g.H)
          if (cx < 0 || cy < 0 || cz < 0 || cx >= g.nc[0] || cy >= g.nc[1] || cz >= g.nc[2]) continue
          if (!g.dil[cx + g.nc[0] * (cy + g.nc[1] * cz)]) continue   // > CAP_FRANCO
          const d = C.distanza(g, B, bx, by, bz, e.franco < Infinity ? e.franco : g.H)
          if (d < e.franco) { e.franco = d; e.francoA = posa.a }
        }
      }
    }
  }

  C.analizza = function (da, a) {
    for (let k = da; k < a && k < C.pose.length; k++) {
      for (const [x, y, eti] of C.COPPIE) C.provaCoppia(C.pose[k], 0, x, y, eti)
    }
  }
})

process.stdout.write('  compenetrazione: ')
for (let k = 0; k < angoliVeri.length; k += 5) {
  await pagina.evaluate(([da, a]) => window.__corsa.analizza(da, a), [k, k + 5])
  process.stdout.write('.')
}
process.stdout.write('\n')

const esiti = await pagina.evaluate(() => window.__corsa.esiti)

righe.push('')
righe.push('  COPPIA                                            penetrazione      franco')
for (const [, , eti] of COPPIE) {
  const e = esiti[eti]
  const pen = e.pen > 0 ? `${(e.pen * 1000).toFixed(2)} mm @ ${(e.penA * 180 / Math.PI).toFixed(1)}°` : '—'
  const fr = e.franco < 1e9 ? `${(e.franco * 1000).toFixed(2)} mm` : `> ${(CAP_FRANCO * 1000).toFixed(0)} mm`
  righe.push(`  ${eti.padEnd(48)} ${pen.padStart(16)} ${fr.padStart(11)}`)
  if (e.pen > GUARDIA) {
    guasti.push(`${eti}: compenetrazione di ${(e.pen * 1000).toFixed(2)} mm a ` +
                `${(e.penA * 180 / Math.PI).toFixed(1)}° di pinna. ` +
                'Punti di un corpo si trovano DENTRO la materia dell\'altro, non vicino.')
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LA CORSA FITTA: la prova che le 101 pose non stanno aliasando
// ═══════════════════════════════════════════════════════════════════════════
/**
 * ─── LA LEGGE SI RICOSTRUISCE E POI SI DIMOSTRA UGUALE
 *
 * La corsa fitta non puo' passare dal browser: sarebbero altri 400 fotogrammi,
 * cioe' altri due minuti. Quindi le pose si SINTETIZZANO col §3.2 — rotazione
 * `uscita` su fin/albero/uscita/dischi, `−29·uscita` sull'ingresso, dischi in
 * orbita a `e` sfasati di π.
 *
 * Che sia lecito non e' un'opinione: la legge sintetizzata viene ricostruita
 * anche sui 101 angoli GIA' REGISTRATI dal sito e confrontata con le matrici
 * vere. Se combacia su 101 pose sparse su quattro giri, non e' una seconda
 * fonte di verita': e' la stessa, verificata. Se non combacia, il confronto
 * sull'aliasing non si fa e lo si dice.
 */
const fitta = await pagina.evaluate(([POSE_FITTE, ANGOLO_MAX]) => {
  const C = window.__corsa
  const M4 = C.M4
  const p0 = C.pose[0]
  const lato = Math.sign(p0.imp[0].pinna / p0.a) || 1
  const R = Math.abs(p0.imp[0].ingresso / p0.imp[0].pinna)

  // il "riposo" di ogni nodo: la sua matrice locale al netto della rotazione
  // che il §3.2 gli impone. Si ricava da una posa registrata.
  const NODI = ['RIG_CYCLO_A', 'RIG_CYCLO_B', 'RIG_OUTPUT', 'HOUSING_FIXED',
    'HOUSING_REMOVABLE', 'HOUSING_SECTION']
  const rotX = (ang) => new M4().set(
    1, 0, 0, 0,
    0, Math.cos(ang), -Math.sin(ang), 0,
    0, Math.sin(ang), Math.cos(ang), 0,
    0, 0, 0, 1)
  const tra = (x, y, z) => new M4().set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1)

  // eccentricita' letta dalla posa registrata, non dichiarata
  const mA = new M4().fromArray(p0.imp[0].nodi.RIG_CYCLO_A)
  const ecc = Math.hypot(mA.elements[13], mA.elements[14])

  // base = matrice del nodo con la sua parte comandata rimossa
  const basi = {}
  const u0 = p0.imp[0].pinna
  const i0 = p0.imp[0].ingresso
  basi.RIG_OUTPUT = new M4().multiplyMatrices(new M4().fromArray(p0.imp[0].nodi.RIG_OUTPUT), rotX(-u0))
  basi.RIG_CYCLO_A = new M4().multiplyMatrices(
    new M4().multiplyMatrices(tra(0, -ecc * Math.cos(i0), -ecc * Math.sin(i0)),
      new M4().fromArray(p0.imp[0].nodi.RIG_CYCLO_A)), rotX(-u0))
  basi.RIG_CYCLO_B = new M4().multiplyMatrices(
    new M4().multiplyMatrices(tra(0, ecc * Math.cos(i0), ecc * Math.sin(i0)),
      new M4().fromArray(p0.imp[0].nodi.RIG_CYCLO_B)), rotX(-u0))
  for (const nm of ['HOUSING_FIXED', 'HOUSING_REMOVABLE', 'HOUSING_SECTION']) {
    basi[nm] = new M4().fromArray(p0.imp[0].nodi[nm])
  }

  function sintetizza (a) {
    const u = a * lato
    const i = -R * u
    const nodi = {}
    nodi.RIG_OUTPUT = new M4().multiplyMatrices(basi.RIG_OUTPUT, rotX(u)).toArray()
    nodi.RIG_CYCLO_A = new M4().multiplyMatrices(
      tra(0, ecc * Math.cos(i), ecc * Math.sin(i)),
      new M4().multiplyMatrices(basi.RIG_CYCLO_A, rotX(u))).toArray()
    nodi.RIG_CYCLO_B = new M4().multiplyMatrices(
      tra(0, -ecc * Math.cos(i), -ecc * Math.sin(i)),
      new M4().multiplyMatrices(basi.RIG_CYCLO_B, rotX(u))).toArray()
    for (const nm of ['HOUSING_FIXED', 'HOUSING_REMOVABLE', 'HOUSING_SECTION']) {
      nodi[nm] = basi[nm].toArray()
    }
    return { a, imp: [{ nodi }] }
  }

  // LA PROVA: la legge sintetizzata deve riprodurre le 101 pose vere
  let scarto = 0
  for (const p of C.pose) {
    const s = sintetizza(p.a)
    for (const nm of NODI) {
      const v = p.imp[0].nodi[nm]; const w = s.imp[0].nodi[nm]
      for (let k = 0; k < 16; k++) scarto = Math.max(scarto, Math.abs(v[k] - w[k]))
    }
  }

  // la coppia piu' stretta, quella che vale la pena ricampionare fitto
  let peggiore = null; let val = -1
  for (const [x, y, eti] of C.COPPIE) {
    const e = C.esiti[eti]
    const s = e.pen > 0 ? 1000 + e.pen : -e.franco
    if (s > val) { val = s; peggiore = [x, y, eti] }
  }

  let fittoPen = 0; let fittoFranco = Infinity
  if (scarto < 1e-6) {
    const salva = C.esiti[peggiore[2]]
    C.esiti[peggiore[2]] = { pen: 0, penA: null, franco: Infinity, francoA: null, coppie: 0 }
    for (let k = 0; k < POSE_FITTE; k++) {
      const a = (-ANGOLO_MAX + 2 * ANGOLO_MAX * k / (POSE_FITTE - 1)) * Math.PI / 180
      C.provaCoppia(sintetizza(a), 0, peggiore[0], peggiore[1], peggiore[2])
    }
    fittoPen = C.esiti[peggiore[2]].pen
    fittoFranco = C.esiti[peggiore[2]].franco
    C.esiti[peggiore[2]] = salva
  }
  return { scarto, coppia: peggiore[2], ecc, R, lato, fittoPen, fittoFranco, rada: C.esiti[peggiore[2]] }
}, [POSE_FITTE, ANGOLO_MAX])

righe.push('')
righe.push(`  legge del §3.2 ricostruita: rapporto ${fitta.R.toFixed(4)}, ` +
           `eccentricita' ${(fitta.ecc * 1000).toFixed(2)} mm, ` +
           `scarto sulle ${angoliVeri.length} pose vere ${fitta.scarto.toExponential(1)}`)
if (fitta.scarto >= 1e-6) {
  guasti.push(`la legge del §3.2 ricostruita non riproduce le pose vere (scarto ` +
              `${fitta.scarto.toExponential(2)}): la corsa di controllo sull'aliasing ` +
              'non e\' stata fatta, quindi la fittezza delle 101 pose resta un conto e non una misura.')
} else {
  const dRada = fitta.rada.pen > 0 ? fitta.rada.pen : fitta.rada.franco
  const dFitta = fitta.fittoPen > 0 ? fitta.fittoPen : fitta.fittoFranco
  righe.push(`  controllo aliasing su «${fitta.coppia}»: ` +
             `${angoliVeri.length} pose ${(dRada * 1000).toFixed(3)} mm · ` +
             `${POSE_FITTE} pose ${(dFitta * 1000).toFixed(3)} mm`)
  // il caso che conta: la corsa fitta trova un guaio che quella rada non vede
  if (fitta.fittoPen > GUARDIA && fitta.rada.pen <= GUARDIA) {
    guasti.push(`la corsa a ${POSE_FITTE} pose trova ${(fitta.fittoPen * 1000).toFixed(2)} mm di ` +
                `compenetrazione su «${fitta.coppia}» dove quella a ${angoliVeri.length} non ne ` +
                'trovava: le 101 pose stanno saltando proprio la fase che rompe. E\' ALIASING.')
  } else if (fitta.rada.pen > 0 && fitta.fittoPen > fitta.rada.pen * 1.5) {
    guasti.push(`la corsa fitta trova una compenetrazione ${(fitta.fittoPen / fitta.rada.pen).toFixed(1)} ` +
                'volte piu\' profonda: le 101 pose non stanno campionando il caso peggiore.')
  } else if (fitta.rada.pen === 0 && fitta.fittoFranco < fitta.rada.franco * 0.5) {
    guasti.push(`la corsa fitta trova un franco di ${(fitta.fittoFranco * 1000).toFixed(2)} mm contro i ` +
                `${(fitta.rada.franco * 1000).toFixed(2)} delle ${angoliVeri.length} pose: ` +
                'meno della meta\'. Le pose prescritte non vedono la fase piu\' stretta.')
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// L'INVASIONE DELLA TRAIETTORIA DELLA CAMERA
// ═══════════════════════════════════════════════════════════════════════════
const cam = await pagina.evaluate(([mira, RAGGIO, azMin, azMax]) => {
  const C = window.__corsa
  const M4 = C.M4
  let peggio = Infinity; let dove = null
  for (const p of C.pose) {
    for (let ii = 0; ii < p.imp.length; ii++) {
      const imp = p.imp[ii]
      for (const nm of Object.keys(C.nuvole)) {
        if (imp.vis && imp.vis[nm] === false) continue
        const M = new M4().fromArray(imp.mondo[nm]).elements
        const pts = C.nuvole[nm]
        for (let i = 0; i < pts.length; i += 3) {
          const x = pts[i]; const y = pts[i + 1]; const z = pts[i + 2]
          const wx = M[0] * x + M[4] * y + M[8] * z + M[12]
          const wy = M[1] * x + M[5] * y + M[9] * z + M[13]
          const wz = M[2] * x + M[6] * y + M[10] * z + M[14]
          const dx = wx - mira[0]; const dz = wz - mira[2]
          const rh = Math.hypot(dx, dz)
          /**
           * L'ARCO, NON IL CERCHIO INTERO. La camera arriva solo dove l'azimut
           * la porta: dichiarare invaso un settore che la camera non visita mai
           * sarebbe un rosso inventato. L'azimut di un punto e' `atan2(dx, dz)`
           * — stessa convenzione con cui il modello e' stato verificato sui due
           * estremi misurati.
           */
          let az = Math.atan2(dx, dz)
          const azC = Math.min(azMax, Math.max(azMin, az))
          const cx = mira[0] + Math.sin(azC) * RAGGIO
          const cz = mira[2] + Math.cos(azC) * RAGGIO
          const d = Math.hypot(wx - cx, wy - mira[1], wz - cz)
          if (d < peggio) { peggio = d; dove = { a: p.a, lato: ii, nodo: nm, rh, az: azC, y: wy } }
        }
      }
    }
  }
  return { peggio, dove }
}, [mira, RAGGIO_MECCANISMO, estremoSx.az, estremoDx.az])

const margine = estremoDx.near
righe.push('')
if (!cam.dove) {
  guasti.push('nessun punto del meccanismo e\' stato confrontato con la traiettoria della camera: ' +
              'le nuvole di punti sono vuote, e il controllo d\'invasione non e\' stato fatto.')
} else {
  righe.push(`  camera: franco minimo ${cam.peggio.toFixed(3)} unita' di scena ` +
             `(${(cam.peggio * 2.5).toFixed(2)} m), su ${cam.dove.nodo} della fiancata ${cam.dove.lato} ` +
             `a ${(cam.dove.a * 180 / Math.PI).toFixed(1)}° di pinna; piano vicino ${margine}`)
  if (cam.peggio < margine) {
    guasti.push(`${cam.dove.nodo} arriva a ${cam.peggio.toFixed(3)} unita' dalla traiettoria della ` +
                `camera, dentro il piano vicino (${margine}): a quell'azimut il pezzo viene tagliato ` +
                'dalla lente e buca l\'inquadratura.')
  }
}

// ── il coperchio, che e' il pezzo che il §10.2 nomina per primo ──────────────
const cop = await pagina.evaluate(() => {
  const p = window.__corsa.pose[window.__corsa.pose.length - 1]
  return p.imp.map(i => i.coperchio)
})
righe.push(`  carter removibile alla battuta: ${cop.map(c => '(' + c.map(v => v.toFixed(3)).join(', ') + ')').join('  ')}`)

// ═══════════════════════════════════════════════════════════════════════════
console.log('')
console.log(`corsa del meccanismo — ${angoliVeri.length} pose da ${-ANGOLO_MAX}° a +${ANGOLO_MAX}°` +
            (ROMPI ? `   [SABOTAGGIO: ${ROMPI}]` : ''))
for (const r of righe) console.log(r)
if (errori.length) console.log('  errori di pagina: ' + errori.slice(0, 3).join(' | '))

if (guasti.length) {
  console.error('\nCOLLAUDO CORSA FALLITO')
  for (const g of guasti) console.error('  · ' + g)
  await chiudi(1)
}
console.log('\ncollaudo corsa: passato')
await chiudi(0)
