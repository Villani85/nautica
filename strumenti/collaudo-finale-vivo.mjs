/**
 * IL FINALE DEVE RESPIRARE, e questo strumento lo misura sui pixel.
 *
 * ─── IL DIFETTO CHE HA FATTO NASCERE IL CANCELLO
 *
 * Il committente, guardando il sito pubblicato: *«alla fine dovrebbe essere un
 * video in loop dopo la traversata dove sono tranquille le persone»*. Aveva
 * ragione, e la misura sul sito vivo diceva:
 *
 *     traversata.mp4    t 8.04 -> 8.04   fermo: true   finito: true
 *     salone-largo.mp4  t 3.75 -> 1.22   fermo: false
 *
 * il filmato congelato sull'ultimo fotogramma copriva tutto, e il loop con le
 * due persone tranquille suonava sotto, invisibile. L'ultima immagine del sito
 * era una fotografia.
 *
 * ─── PERCHE' IL METRO E' PULITO
 *
 * Alla fine della corsa in quadro c'e' SOLO un piano appeso alla camera. Un
 * piano appeso alla camera non si muove col rollio: se sopra ci sta un
 * fotogramma congelato la differenza fra due tele consecutive e' esattamente
 * zero, e non «quasi zero». Non serve una soglia scelta a tavolino per
 * distinguere i due casi: si distinguono da soli.
 *
 * ─── PERCHE' NON MISURA IL FLAG
 *
 * `consegnaCalma` lo si legge, ma solo per DIRE a che punto e'. Il verdetto lo
 * danno i pixel. Un finale in cui la consegna e' arrivata a 1 e la tela resta
 * identica sarebbe verde su un flag e nero in pagina, ed e' il difetto che
 * questo repo chiama «un metro rotto non da' errore, da' un numero».
 *
 *   node strumenti/collaudo-finale-vivo.mjs [--url https://...]
 */
import { apriBrowser } from './browser.mjs'
import { anteprima } from './anteprima.mjs'
import { mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const FUORI = 'uscite/finale-vivo'

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d }
/**
 * `?ispeziona=1` non cambia la pagina: accende `window.__nautica`, la maniglia
 * con cui i cancelli leggono lo stato invece di indovinarlo dai pixel. Senza,
 * `traversataFinita` non esiste e questo strumento aspetterebbe un fatto che
 * nessuno dichiara mai -- che e' come e' fallito la prima volta.
 */
const _ant = await anteprima()
const BASE = arg('--url', _ant.indirizzo)
const URL = BASE + (BASE.includes('?') ? '&' : '?') + 'ispeziona=1'
/** Quanti fotogrammi di tela, e a che passo. Due secondi coprono il loop. */
const CAMPIONI = 12
const PASSO_MS = 170
/**
 * La soglia non separa vivo da fermo -- quelli si separano da soli, uno e'
 * zero. Separa vivo da «rumore di codifica»: un mp4 fermo ma ridecodificato
 * puo' sfarfallare di un livello. Un decimo di livello medio e' sotto qualunque
 * movimento umano e sopra qualunque sfarfallio.
 */
const SOGLIA = 0.10

const b = await apriBrowser({ conGpu: process.env.SENZA_GPU ? false : true })
const pg = await b.newPage()
await pg.setViewportSize({ width: 1280, height: 800 })
await pg.goto(URL, { waitUntil: 'load', timeout: 45000 })

/** Non si aspetta un tempo, si aspetta un fatto: la scena c'e'. */
await pg.waitForFunction(() => !!document.querySelector('canvas'), null, { timeout: 30000 })
await pg.waitForFunction(() => window.__nautica && typeof window.__nautica.p === 'number', null, { timeout: 30000 })

// in fondo alla corsa, dove il filmato comanda
await pg.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))

/** Il fatto atteso e' che il filmato sia finito, non che siano passati 10 s. */
let finita = false
try {
  await pg.waitForFunction(() => window.__nautica?.traversataFinita?.() === true, null, { timeout: 45000 })
  finita = true
} catch { /* non e' finito: lo si dice, non si finge */ }

const consegna = await pg.evaluate(() => window.__nautica?.consegnaCalma?.() ?? null)
// la dissolvenza dura 1,2 s sull'orologio del video: le si lascia finire
if (consegna !== null) {
  try { await pg.waitForFunction(() => (window.__nautica?.consegnaCalma?.() ?? 0) > 0.99, null, { timeout: 15000 }) } catch {}
}

/** La finestra dei pixel: la parte bassa centrale, dove stanno le persone. */
/** Lo stato della consegna DOPO l'attesa, prima che il browser chiuda. */
const consegnaLetta = consegna === null ? null
  : (await pg.evaluate(() => window.__nautica?.consegnaCalma?.() ?? null))?.toFixed(3)

const RIT = { x: 320, y: 300, width: 640, height: 380 }
/**
 * Si salvano schermate e si decodificano con ffmpeg, che e' la ricetta gia'
 * collaudata da `registro-guscio.mjs`. Rileggere la tela WebGL con `drawImage`
 * torna NERO senza `preserveDrawingBuffer`, e il nero passa per «immobile»:
 * sarebbe un metro che conferma il difetto invece di trovarlo. La schermata di
 * Playwright passa dal compositore e contiene i pixel veri.
 */
mkdirSync(FUORI, { recursive: true })
/**
 * ─── FRA UNA SCHERMATA E L'ALTRA SI ASPETTA IL VIDEO, NON L'OROLOGIO
 *
 * DIFETTO DEL CANCELLO STESSO, preso dalla CI. Con un passo a orologio fisso
 * questo strumento misurava anche la velocita' della macchina: su una macchina
 * lenta due schermate consecutive pescano lo STESSO fotogramma del video, la
 * differenza va a zero, e il cancello accusa il sito di non respirare mentre
 * respira benissimo.
 *
 * Misurato: con la GPU vera il movimento medio era 0,983; sullo stesso sito
 * col rasterizzatore software 0,385, cioe' due volte e mezzo meno. Nessuna
 * delle due dice qualcosa del sito -- dicono quanto e' carica la macchina. Sul
 * runner, piu' lento ancora, il numero e' finito sotto la soglia e la corsa e'
 * uscita rossa.
 *
 * La cura e' la regola che questo repo applica ovunque tranne, fino a ora, qui:
 * non si aspetta un tempo, si aspetta un FATTO. Fra due schermate si aspetta
 * che il video della calma abbia avanzato di almeno tre fotogrammi suoi. Cosi'
 * ogni coppia confrontata contiene movimento vero, su qualunque macchina.
 */
const AVANZO_VIDEO_S = 0.125

const vie = []
let saltate = 0
for (let i = 0; i < CAMPIONI; i++) {
  const via = FUORI + '/finale-' + String(i).padStart(2, '0') + '.png'
  await pg.screenshot({ path: via, clip: RIT })
  vie.push(via)
  if (i === CAMPIONI - 1) break
  const prima = await pg.evaluate(() => {
    const v = [...document.querySelectorAll('video')].find((x) => /salone-largo/.test(x.currentSrc || x.src))
    return v ? v.currentTime : null
  })
  if (prima === null) { saltate++; await pg.waitForTimeout(PASSO_MS); continue }
  try {
    await pg.waitForFunction(([t, d]) => {
      const v = [...document.querySelectorAll('video')].find((x) => /salone-largo/.test(x.currentSrc || x.src))
      if (!v) return true
      /* il ciclo puo' riavvolgersi: anche il salto all'indietro e' avanzamento */
      return v.currentTime < t || v.currentTime - t >= d
    }, [prima, AVANZO_VIDEO_S], { timeout: 6000 })
  } catch { saltate++ }
}
await b.close()
_ant.ferma()

const grezze = vie.map((via) => spawnSync('ffmpeg', ['-v', 'error', '-i', via,
  '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1 << 26 }).stdout)
if (grezze.some((g) => !g || !g.length)) {
  console.log('ROSSO — ffmpeg non ha decodificato le schermate: nessuna misura, nessun verdetto.')
  process.exit(1)
}

let somma = 0
let picco = 0
for (let i = 1; i < grezze.length; i++) {
  let s = 0
  for (let k = 0; k < grezze[i].length; k++) s += Math.abs(grezze[i][k] - grezze[i - 1][k])
  const m = s / grezze[i].length
  somma += m
  picco = Math.max(picco, m)
}
const medio = somma / (grezze.length - 1)

/**
 * Riletta ADESSO, non prima dell'attesa: la prima lettura vale 0 per
 * costruzione, perche' la si prende nell'istante in cui il filmato finisce.
 * Stamparla sarebbe stato un numero giusto messo dove dice una cosa falsa.
 */
const consegnaFine = consegna === null ? 'assente (build senza consegna)' : String(consegnaLetta)
console.log('COLLAUDO FINALE VIVO —', URL)
console.log('  filmato finito:      ', finita ? 'si' : 'NO (non e\' arrivato in fondo)')
console.log('  consegna alla calma: ', consegnaFine)
console.log('  attese scadute:      ', saltate, saltate ? '(il video della calma non avanzava)' : '')
console.log('  movimento medio:      ' + medio.toFixed(3) + ' livelli   (soglia ' + SOGLIA.toFixed(2) + ')')
console.log('  picco:                ' + picco.toFixed(3))

if (!finita) { console.log('\nROSSO — il filmato non finisce: il finale non e\' stato raggiunto.'); process.exit(1) }
if (saltate > CAMPIONI / 2) {
  console.log("")
  console.log("NON MISURABILE — il video della calma non ha avanzato fra le schermate.")
  console.log("        Non e un verdetto sul sito: e l assenza delle condizioni per darne uno.")
  process.exit(1)
}
if (medio < SOGLIA) {
  console.log('\nROSSO — il finale e\' una fotografia: ' + medio.toFixed(3) + ' livelli di movimento.')
  console.log('        Le persone tranquille devono essere un loop vivo, non l\'ultimo fotogramma del filmato.')
  process.exit(1)
}
console.log('\nVERDE — il finale respira.')
