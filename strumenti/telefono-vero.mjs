/**
 * IL TELEFONO VERO — l'unica misura che nessuna emulazione sostituisce.
 *
 *     adb reverse tcp:5199 tcp:5199
 *     adb forward tcp:9222 localabstract:chrome_devtools_remote
 *     npx vite preview --port 5199 &
 *     node strumenti/telefono-vero.mjs
 *
 * ─── PERCHE' ESISTE, E PERCHE' NON POTEVA ESISTERE PRIMA
 *
 * `browser.mjs` lo dice gia' e va ripetuto qui, perche' e' il posto dove
 * qualcuno verra' a cercare il numero: **la iGPU di questa macchina serve come
 * misura di regressione, non descrive cosa fa un telefono.** Per mesi ogni
 * referto su fotogrammi, memoria e temperatura ha dovuto scriverci accanto un
 * asterisco, e `CANTIERE.md` teneva «aprire il sito da un telefono vero» nella
 * lista delle cose bloccate sull'umano.
 *
 * Il telefono adesso c'e', collegato in debug: Note 20 (SM-N981N), Android 13,
 * Chrome 151. Questo strumento gli parla via CDP e misura sul suo silicio.
 *
 * ─── COSA MISURA, E PERCHE' PROPRIO QUESTE
 *
 * `docs/13` §8 dice che la Usability vale il 30% e che il telefono da solo vale
 * quanto tutto il resto. Le quattro grandezze che decidono:
 *
 *   1. **fotogrammi al secondo durante lo scorrimento** -- non a riposo. Un
 *      sito 3D fermo va a 60 ovunque; il costo si vede quando la pagina si
 *      muove e la scena cambia stato;
 *   2. **memoria del mucchio JS**, campionata a inizio e fine. Cresce? Allora
 *      dopo dieci minuti la scheda muore, ed e' un cancello dichiarato;
 *   3. **temperatura della batteria**, presa da `adb` e non dalla pagina --
 *      il browser non la sa. E' l'unica che dice se il telefono sta soffrendo:
 *      un dispositivo che scalda scala la frequenza e i fotogrammi crollano
 *      dieci minuti dopo, cioe' quando nessuno sta piu' guardando;
 *   4. **LCP e CLS** dal campo, con `PerformanceObserver`, invece che stimati
 *      in laboratorio con la CPU rallentata a mano.
 *
 * ─── LA TRAPPOLA CHE HO EVITATO, e vale piu' del codice
 *
 * Misurare i fotogrammi contando `requestAnimationFrame` e' il modo classico di
 * misurare la cosa sbagliata: rAF non viene chiamato quando la scheda non
 * dipinge, quindi un sito che salta i fotogrammi puo' stampare 60. Qui si conta
 * il tempo VERO fra chiamate e si riporta anche il **peggior intervallo**: e'
 * quello che si sente come scatto, non la media. Una media di 55 con un picco a
 * 400 ms e' peggio di una media di 40 stabile, e la media da sola lo nasconde.
 */
import { chromium } from 'playwright-core'
import { execFileSync } from 'node:child_process'

const URL_SITO = process.env.URL_TELEFONO || 'http://localhost:5199/'
const SECONDI = Number(process.env.SECONDI || 12)

function adb (...a) {
  try { return execFileSync('adb', a, { encoding: 'utf8' }).trim() } catch { return null }
}

/** La temperatura la sa il sistema operativo, non la pagina. */
function temperatura () {
  const d = adb('shell', 'dumpsys', 'battery')
  if (!d) return null
  const m = d.match(/temperature:\s*(\d+)/)
  return m ? Number(m[1]) / 10 : null
}

const modello = adb('shell', 'getprop', 'ro.product.model') || 'sconosciuto'
const android = adb('shell', 'getprop', 'ro.build.version.release') || '?'
const tPrima = temperatura()

console.log(`\nIL TELEFONO VERO — ${modello}, Android ${android}`)
console.log(`  ${URL_SITO}\n`)

const browser = await chromium.connectOverCDP('http://localhost:9222')
const contesti = browser.contexts()
let pagina = null
for (const c of contesti) {
  for (const p of c.pages()) {
    if (p.url().startsWith(URL_SITO.replace(/\/$/, ''))) { pagina = p; break }
  }
  if (pagina) break
}
if (!pagina) {
  console.error(`  ROTTO  nessuna scheda aperta su ${URL_SITO}.`)
  console.error('         apri il sito sul telefono, poi rilancia:')
  console.error(`         adb shell am start -a android.intent.action.VIEW -d "${URL_SITO}" com.android.chrome`)
  process.exit(1)
}

/* --- 1 · LE COSE CHE SI SANNO SOLO DAL CAMPO -------------------------------- */
const campo = await pagina.evaluate(() => new Promise((risolvi) => {
  const out = { lcp: null, cls: 0, memoria: null, schermo: null, dpr: null, cuori: null, ram: null }
  out.schermo = `${innerWidth}x${innerHeight}`
  out.dpr = devicePixelRatio
  out.cuori = navigator.hardwareConcurrency || null
  out.ram = navigator.deviceMemory || null
  if (performance.memory) out.memoria = Math.round(performance.memory.usedJSHeapSize / 1048576)
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) out.lcp = Math.round(e.startTime) })
      .observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) out.cls += e.value
    }).observe({ type: 'layout-shift', buffered: true })
  } catch { /* non supportati: restano null, e null non e' zero */ }
  setTimeout(() => risolvi(out), 400)
}))

/* --- 2 · I FOTOGRAMMI, MENTRE LA PAGINA SI MUOVE ---------------------------- */
/**
 * Lo scorrimento e' guidato dalla pagina e non dal dito, ed e' voluto: un dito
 * simulato via CDP produce una cinematica che non e' quella di nessuno. Qui la
 * domanda non e' «com'e' il gesto», e' «quanto costa disegnare mentre la scena
 * cambia stato». Il gesto lo misureranno le persone, con `?studio=1`.
 */
const fps = await pagina.evaluate((secondi) => new Promise((risolvi) => {
  const salti = []
  const quando = []
  const nascita = performance.now()
  let prima = nascita
  const fine = prima + secondi * 1000
  const alto = document.documentElement.scrollHeight - innerHeight
  let n = 0
  function giro (ora) {
    salti.push(ora - prima)
    /**
     * ─── QUANDO succede lo stallo, non solo QUANTO dura
     *
     * La prima stesura riportava solo il peggior intervallo, e non bastava: un
     * blocco di due secondi al PRIMO fotogramma e' il motore 3D che compila, ed
     * e' un difetto di avvio; lo stesso blocco a meta' scorrimento e' un difetto
     * di regia, e si cura in un altro punto. Senza l'istante, il numero non dice
     * quale dei due sia -- e mandava a cercare nel posto sbagliato.
     */
    quando.push(ora - nascita)
    prima = ora
    n++
    scrollTo(0, alto * (0.05 + 0.9 * ((ora % 9000) / 9000)))
    if (ora < fine) requestAnimationFrame(giro)
    else {
      const utili = salti.slice(2)
      const istanti = quando.slice(2)
      const somma = utili.reduce((s, v) => s + v, 0)
      const ordinati = [...utili].sort((a, b) => a - b)
      let iPeggio = 0
      for (let k = 1; k < utili.length; k++) if (utili[k] > utili[iPeggio]) iPeggio = k
      risolvi({
        quandoIlPeggiore: Math.round(istanti[iPeggio]),
        stalli: utili.map((v, k) => [Math.round(istanti[k]), Math.round(v)]).filter(x => x[1] > 50),
        fotogrammi: n,
        medio: somma / utili.length,
        mediano: ordinati[Math.floor(ordinati.length / 2)],
        peggiore: ordinati[ordinati.length - 1],
        p95: ordinati[Math.floor(ordinati.length * 0.95)],
        oltre50ms: utili.filter(v => v > 50).length,
        memoriaFine: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null
      })
    }
  }
  requestAnimationFrame(giro)
}), SECONDI)

const tDopo = temperatura()

/* --- 3 · IL REFERTO --------------------------------------------------------- */
console.log('  IL DISPOSITIVO')
console.log(`    schermo ${campo.schermo} css, dpr ${campo.dpr}, ${campo.cuori || '?'} cuori, RAM dichiarata ${campo.ram || '?'} GB`)
console.log('\n  I FOTOGRAMMI, mentre la pagina scorre')
console.log(`    ${(1000 / fps.medio).toFixed(1)} al secondo in media   (${fps.fotogrammi} fotogrammi in ${SECONDI} s)`)
console.log(`    intervallo mediano  ${fps.mediano.toFixed(1)} ms`)
console.log(`    95o percentile      ${fps.p95.toFixed(1)} ms`)
console.log(`    PEGGIORE            ${fps.peggiore.toFixed(1)} ms   <- e' questo che si sente`)
console.log(`    intervalli oltre 50 ms: ${fps.oltre50ms}`)
if (fps.stalli.length) {
  console.log('    dove cadono, in ms dall inizio della misura:')
  for (const [t, d] of fps.stalli) console.log(`      a ${t} ms  ->  ${d} ms di blocco`)
}
console.log('\n  MEMORIA E CALORE')
console.log(`    mucchio JS  ${campo.memoria ?? '?'} -> ${fps.memoriaFine ?? '?'} MB`)
console.log(`    batteria    ${tPrima ?? '?'} -> ${tDopo ?? '?'} gradi`)
console.log('\n  DAL CAMPO, non dal laboratorio')
console.log(`    LCP  ${campo.lcp ?? 'non osservato'} ms      (soglia buona: 2500)`)
console.log(`    CLS  ${campo.cls.toFixed(4)}          (soglia buona: 0,1)`)

/**
 * NESSUN VERDETTO AUTOMATICO, ed e' deliberato. Questo strumento e' una MISURA,
 * non un cancello: una sola corsa su un solo telefono, con quello che il
 * dispositivo aveva aperto in quel momento, non e' una soglia da far fallire in
 * CI. Diventera' un cancello quando ci saranno piu' corse e un dispositivo
 * dedicato -- e allora la soglia si scrivera' con la data e la prova, come
 * vuole `src/ui/soglie.js`.
 */
console.log('\n  (misura, non cancello: una corsa su un telefono non e\' una soglia)\n')
await browser.close()
