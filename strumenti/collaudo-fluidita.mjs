import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'

/**
 * COLLAUDO FLUIDITA' — misura il frame pacing dello scorrimento, non lo cura.
 *
 *     node strumenti/collaudo-fluidita.mjs
 *
 * ─── COSA REGISTRA
 *
 *   · gli intervalli fra due `requestAnimationFrame` consecutivi, su tutta la
 *     corsa: p50, p95, p99, massimo
 *   · quanti fotogrammi superano 25 ms, 33,4 ms (due fotogrammi a 60 Hz), 50 ms
 *   · i long task del thread principale, via `PerformanceObserver('longtask')`
 *     — SE il browser lo supporta: dove non e' disponibile si stampa
 *     NON MISURABILE per quella sola riga, non un errore dell'intero collaudo
 *   · posizione e quaternione della camera a ogni fotogramma
 *   · velocita', accelerazione e jerk del PROGRESSO (`__nautica.p`), per
 *     derivate successive rispetto al tempo reale fra i fotogrammi
 *   · il salto peggiore (fotogramma piu' lungo, in ms, e spostamento massimo
 *     della camera, in unita' di scena) in una finestra intorno a ciascuna
 *     delle quattro giunzioni della storia: salone->scafo, scafo->meccanismo,
 *     meccanismo->traversata, traversata->salone
 *
 * ─── PERCHE' TRE OROLOGI FANNO ASPETTARE UNO SCATTO
 *
 * Non e' una supposizione, e' la mappa di CHI comanda cosa a ogni evento di
 * scorrimento: `src/ui/attrito.js` annulla il gesto per 550 ms, `src/demo.js`
 * calcola `p` sull'evento e chiama SUBITO la regia (niente rAF di mezzo), e
 * `src/salone-atto.js:151-153` fa un `getBoundingClientRect` -- quindi un
 * reflow -- a ogni evento, per conto suo. Tre orologi che non si conoscono fra
 * loro, sullo stesso scorrimento. Questo file li MISURA: non li allinea, non
 * li debounce, non decide quale ha ragione. Se lo scatto e' li', il numero lo
 * deve dire; il resto e' un altro lavoro.
 *
 * ─── LA GPU, O QUESTI NUMERI NON DESCRIVONO NESSUN VISITATORE
 *
 * Questo strumento misura PROPRIO il tempo di fotogramma, quindi il problema
 * di `browser.mjs` lo riguarda in pieno: `chromium.launch({headless:true})`
 * lancia `chrome-headless-shell`, che non ha stack GPU, e su un
 * rasterizzatore software 50 ms di fotogramma sono il costo della CPU che
 * disegna in software, non un utente che scatta. Si chiede il binario
 * completo (`apriBrowser({conGpu:true})`) e si legge comunque
 * `WEBGL_debug_renderer_info`: se il renderer non e' una GPU vera si stampa un
 * riquadro grosso, come fa `collaudo-telefono.mjs`, e i numeri restano in
 * output ma etichettati come NON PRESTAZIONE — buoni al piu' per vedere un
 * salto di posizione, mai per giudicare millisecondi.
 *
 * ─── LA TRAIETTORIA E' RIPETIBILE, e si costruisce come dice la regola
 *
 * Ci si muove SOLO con `window.__nautica.cimaSezione` e `corsaRacconto`, mai
 * con una frazione dell'altezza della pagina — vietato, e gia' pagato tre
 * volte da `collaudo-cinematica`, `collaudo-manopola` e `collaudo-varco`. La
 * corsa e' lineare in pixel dentro quell'intervallo (`demo.js`: `p = -top /
 * corsa`), quindi uno scorrimento lineare in pixel fra
 * `cimaSezione - 0,05*corsa` e `cimaSezione + 1,05*corsa`, a passo fisso e a
 * durata fissa, E' uno scorrimento lineare in `p` — riproducibile a ogni
 * corsa, sulla stessa build.
 *
 * ─── I BERSAGLI SONO UN PUNTO DI PARTENZA, non una verita'
 *
 *   p95 <= 20 ms · p99 <= 33,4 ms · nessun fotogramma oltre 50 ms alle
 *   giunzioni, su desktop 60 Hz con GPU vera.
 *
 * Sono i numeri con cui si comincia a discutere, non quelli con cui si
 * chiude una discussione. Il giorno in cui si misura su un'altra macchina, un
 * altro pannello, un'altra build del sito, questi vanno ridiscussi con dati
 * nuovi — non ricopiati.
 *
 * ─── COSA NON COPRE
 *
 *   · il telefono: questo gira su Chromium desktop. Per un telefono vero c'e'
 *     `collaudo-telefono.mjs` (e il Note 20 via adb, dove serve la verita');
 *   · l'input reale (wheel/trackpad/touch): lo scorrimento e' guidato da
 *     `scrollTo`, che innesca lo stesso evento `scroll` che ascolta il sito,
 *     ma non passa dal driver di input del sistema operativo;
 *   · `prefers-reduced-motion: reduce` — qui si misura la modalita' piena,
 *     apposta (`reducedMotion:'no-preference'`), perche' altrimenti la pinna e
 *     buona parte della fisica restano ferme per progetto e i numeri
 *     misurerebbero un sito diverso;
 *   · le quattro giunzioni sono scoperte leggendo la regia dal vivo
 *     (`data-battuta`, `data-traversata`, `coperturaTraversata()`), non
 *     calcolate da soglie copiate qui: se `regia.js` sposta un confine, questo
 *     file lo segue da solo. Ma la quarta -- traversata->salone -- non ha un
 *     attributo dedicato: si usa il punto in cui `coperturaTraversata()`
 *     arriva a 1,00, cioe' quando il filmato copre per intero il fotogramma e
 *     lo si legge come "si e tornati dalle persone". E' una lettura, non un
 *     nome che il sito usa: va detto, non nascosto.
 */

const PORTA = Number(process.env.PORTA_COLLAUDO) || 5180
await avvisaSePortaAltrui(PORTA)
const BASE = `http://localhost:${PORTA}/nautica/`

async function serviteci () {
  try {
    const r = await fetch(BASE, { redirect: 'manual' })
    if (r.status < 500) return null
  } catch {}
  const s = spawn('npm', ['run', 'preview', '--', '--port', String(PORTA)], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    try { await fetch(BASE, { redirect: 'manual' }); return s } catch {}
    await new Promise(r => setTimeout(r, 500))
  }
  s.kill()
  console.error('il server non si e alzato')
  process.exit(2)
}

/** Vedi `collaudo-cinematica.mjs`: con piu' collaudi in parallelo non si
 *  spegne un server che sta servendo qualcun altro. */
const TIENI_SERVER = !!process.env.TIENI_SERVER

/* soglie del frame time, in millisecondi */
const SOGLIA_25 = 25
const SOGLIA_334 = 33.4   // due fotogrammi a 60 Hz
const SOGLIA_50 = 50

/* bersagli di partenza — vedi il commento in testa: si ridiscutono coi dati,
   non si ricopiano */
const BERSAGLIO_P95 = 20
const BERSAGLIO_P99 = 33.4
const BERSAGLIO_GIUNZIONE_MS = 50

const DURATA_MS = Number(process.env.COLLAUDO_DURATA_MS) || 6000
const MARGINE = 0.05   // corsa in piu' prima dell'inizio e dopo la fine
const FINESTRA_GIUNZIONE_MS = 400   // quanto guardare intorno a ogni giunzione

const server = await serviteci()
const browser = await apriBrowser({ conGpu: true })
const pagina = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  /* SENZA QUESTO SI MISURA UN'ALTRA COSA. Con "reduce" la pinna e buona parte
     della fisica restano ferme per progetto (vedi `stato.js`), e i numeri
     misurerebbero un sito che non e' quello che il visitatore vede. */
  reducedMotion: 'no-preference'
})
const eccezioni = []
pagina.on('pageerror', e => eccezioni.push(String(e).slice(0, 200)))

const finisci = async (codice) => {
  await browser.close()
  if (!TIENI_SERVER) server?.kill()
  process.exit(codice)
}

await pagina.goto(BASE + '?ispeziona=1', { waitUntil: 'load' })
await pagina.waitForFunction(
  () => !!(window.__nautica && window.__nautica.scena && window.__nautica.camera),
  null, { timeout: 60000 }
)

/* ─── LA GPU, VERIFICATA PER DAVVERO ────────────────────────────────────── */

const info = await pagina.evaluate(() => {
  const render = window.__nautica.render
  const gl = render && typeof render.getContext === 'function' ? render.getContext() : null
  if (!gl) return { ok: false, motivo: 'nessun contesto WebGL leggibile da render.getContext()' }
  const ext = gl.getExtension('WEBGL_debug_renderer_info')
  if (!ext) return { ok: false, motivo: "WEBGL_debug_renderer_info non disponibile" }
  return {
    ok: true,
    vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL),
    renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
  }
})

const RENDERER_TESTO = info.ok ? `${info.vendor} — ${info.renderer}` : `(non leggibile: ${info.motivo})`
const SOFTWARE = !info.ok ||
  /swiftshader|llvmpipe|software|basic render|d3d11 warp|microsoft basic render/i.test(info.renderer || '')

if (SOFTWARE) {
  console.log('')
  console.log([
    '  ┌───────────────────────────────────────────────────────────────────────┐',
    '  │  QUESTO RENDERER NON E UNA GPU VERA.                                   │',
    '  │                                                                       │',
    '  │  I MILLISECONDI STAMPATI QUI SOTTO NON DESCRIVONO NESSUN VISITATORE.   │',
    '  │  Un rasterizzatore software mette in coda il proprio costo di disegno  │',
    '  │  dentro lo stesso numero che dovrebbe misurare lo scatto dello         │',
    '  │  scorrimento: i due si sommano e non si separano piu.                 │',
    '  │                                                                       │',
    '  │  I numeri restano stampati per debug, ma NON vanno letti come          │',
    '  │  prestazione, e un p95/p99 sopra soglia qui non e un difetto del sito. │',
    '  └───────────────────────────────────────────────────────────────────────┘'
  ].join('\n'))
  console.log(`  renderer: ${RENDERER_TESTO}`)
  console.log('')
} else {
  console.log(`\n  renderer: ${RENDERER_TESTO}\n`)
}

/* ─── SI POPOLA `corsaRacconto`, che vive solo dentro l'evento di scroll ── */

await pagina.evaluate(() => { scrollTo({ top: 1, behavior: 'instant' }) })
try {
  await pagina.waitForFunction(
    () => window.__nautica && window.__nautica.corsaRacconto !== undefined,
    null, { timeout: 15000 }
  )
} catch {
  console.error('  NON MISURABILE  `__nautica.corsaRacconto` non compare: la corsa del racconto')
  console.error('                  non e esposta, e senza quella questo collaudo non sa dove andare.')
  await finisci(2)
}

const corsa = await pagina.evaluate(() => ({ cima: window.__nautica.cimaSezione, corsaRacconto: window.__nautica.corsaRacconto }))
if (corsa.cima === undefined || corsa.corsaRacconto === undefined || !(corsa.corsaRacconto > 0)) {
  console.error('  NON MISURABILE  `cimaSezione`/`corsaRacconto` non sono numeri utilizzabili.')
  await finisci(2)
}

/* ─── LE QUATTRO GIUNZIONI, SCOPERTE DAL VIVO ───────────────────────────── */

const scoperta = await pagina.evaluate(async ({ cima, corsaRacconto }) => {
  const n = window.__nautica
  const doppioRaf = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  const vai = async (q) => {
    scrollTo({ top: Math.max(0, Math.round(cima + corsaRacconto * q)), behavior: 'instant' })
    await doppioRaf()
    const palco = document.querySelector('.palco[data-battuta]')
    return {
      battuta: palco ? palco.dataset.battuta : null,
      traversata: palco ? palco.dataset.traversata : null,
      copertura: n.coperturaTraversata ? (n.coperturaTraversata() ?? null) : null
    }
  }

  /* bisezione: trova il piu' piccolo q in [lo, hi] per cui condizione(vai(q)) e' vera,
     sapendo che condizione(vai(hi)) e' vera e condizione(vai(lo)) e' falsa */
  const bisezione = async (lo, hi, condizione, passi = 16) => {
    let a = lo, b = hi
    for (let i = 0; i < passi; i++) {
      const m = (a + b) / 2
      const v = await vai(m)
      if (await condizione(v)) b = m; else a = m
    }
    return b
  }

  const partenza = await vai(0)
  const finaleBattuta = await vai(1.0)
  const inizioBattuta = partenza.battuta

  const rSaloneScafo = (inizioBattuta && finaleBattuta.battuta !== inizioBattuta)
    ? await bisezione(0, 1.0, v => v.battuta !== inizioBattuta)
    : null

  const arrivaMeccanismo = finaleBattuta.battuta === 'meccanismo'
  const rScafoMeccanismo = arrivaMeccanismo
    ? await bisezione(rSaloneScafo ?? 0, 1.0, v => v.battuta === 'meccanismo')
    : null

  const alFondo = await vai(1.05)
  const trovaTraversata = alFondo.traversata === 'si'
  const rMeccanismoTraversata = trovaTraversata
    ? await bisezione(rScafoMeccanismo ?? 0, 1.05, v => v.traversata === 'si')
    : null

  const coperturaPiena = alFondo.copertura !== null && alFondo.copertura >= 0.999
  const rTraversataSalone = coperturaPiena
    ? await bisezione(rMeccanismoTraversata ?? 0, 1.05, v => v.copertura !== null && v.copertura >= 0.999)
    : null

  return {
    inizioBattuta,
    finaleBattuta: finaleBattuta.battuta,
    coperturaAlFondo: alFondo.copertura,
    rSaloneScafo, rScafoMeccanismo, rMeccanismoTraversata, rTraversataSalone
  }
}, corsa)

const guai = []
const GIUNZIONI = [
  ['salone->scafo', scoperta.rSaloneScafo],
  ['scafo->meccanismo', scoperta.rScafoMeccanismo],
  ['meccanismo->traversata', scoperta.rMeccanismoTraversata],
  ['traversata->salone', scoperta.rTraversataSalone]
]
for (const [nome, q] of GIUNZIONI) {
  if (q === null || q === undefined || !Number.isFinite(q)) {
    console.error(`  NON MISURABILE  la giunzione "${nome}" non e stata trovata nella corsa del racconto`)
    console.error(`                  (battuta iniziale: "${scoperta.inizioBattuta}", finale: "${scoperta.finaleBattuta}", ` +
                  `copertura al fondo: ${scoperta.coperturaAlFondo})`)
    guai.push(nome)
  }
}
if (guai.length) await finisci(2)

console.log('  giunzioni trovate (frazione della corsa del racconto):')
for (const [nome, q] of GIUNZIONI) console.log(`    ${nome.padEnd(24)} p = ${q.toFixed(4)}`)

/* ─── LA CORSA MISURATA — un solo `evaluate`, il rAF gira in pagina ─────── */

const qIniziale = -MARGINE
const qFinale = 1 + MARGINE

const misura = await pagina.evaluate(async ({ cima, corsaRacconto, qIniziale, qFinale, durataMs }) => {
  const n = window.__nautica
  const cam = n.camera
  const yDi = (q) => Math.max(0, Math.round(cima + corsaRacconto * q))
  const yStart = yDi(qIniziale)
  const yEnd = yDi(qFinale)

  /* long task del thread principale, se il browser li supporta */
  const supportaLongtask = typeof PerformanceObserver !== 'undefined' &&
    Array.isArray(PerformanceObserver.supportedEntryTypes) &&
    PerformanceObserver.supportedEntryTypes.includes('longtask')
  const longtask = []
  let osservatore = null
  if (supportaLongtask) {
    osservatore = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) longtask.push({ inizio: e.startTime, durata: e.duration, nome: e.name })
    })
    /**
     * SENZA `buffered:true`, e apposta. Con il buffer, l'osservatore riporta
     * anche i long task registrati PRIMA di questa chiamata — la scoperta
     * delle giunzioni, appena fatta, e' fatta di decine di salti che possono
     * costare shader e texture. Un long task da 9 secondi comparso qui era
     * quello: nato prima della corsa misurata, non durante. Si osserva solo
     * cio' che succede da questo momento in poi.
     */
    try { osservatore.observe({ type: 'longtask' }) } catch { /* resta senza */ }
  }

  scrollTo({ top: yStart, behavior: 'instant' })
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

  const frames = []
  const t0 = performance.now()
  let prev = t0
  await new Promise((risolvi) => {
    function tick (t) {
      const dt = t - prev
      prev = t
      frames.push({
        t, dt,
        p: n.p,
        pos: cam.position.toArray(),
        quat: cam.quaternion.toArray()
      })
      const frazione = Math.min(1, (t - t0) / durataMs)
      scrollTo({ top: Math.round(yStart + (yEnd - yStart) * frazione), behavior: 'instant' })
      if (frazione < 1) requestAnimationFrame(tick)
      else risolvi()
    }
    requestAnimationFrame(tick)
  })

  if (osservatore) osservatore.disconnect()

  return { frames, longtask, supportaLongtask, yStart, yEnd }
}, { ...corsa, qIniziale, qFinale, durataMs: DURATA_MS })

/* ─── ANALISI, IN NODE ───────────────────────────────────────────────────── */

const F = misura.frames
if (!F || F.length < 10) {
  console.error(`  NON MISURABILE  solo ${F ? F.length : 0} fotogrammi registrati: la corsa non e stata campionata`)
  await finisci(2)
}

/* il primo dt e' contro `performance.now()` di partenza, non contro un
   fotogramma vero: si scarta, o ogni corsa avrebbe un primo campione fasullo */
const dt = F.slice(1).map(f => f.dt)
const ordinati = [...dt].sort((a, b) => a - b)
const percentile = (p) => ordinati[Math.min(ordinati.length - 1, Math.floor(p * ordinati.length))]
const p50 = percentile(0.50)
const p95 = percentile(0.95)
const p99 = percentile(0.99)
const massimo = Math.max(...dt)
const oltre = (soglia) => dt.filter(v => v > soglia).length

console.log('')
console.log(`  fotogrammi registrati: ${F.length} in ${DURATA_MS} ms (attesi ~${Math.round(1000 * F.length / DURATA_MS)} fps medi)`)
console.log(`  intervallo rAF — p50 ${p50.toFixed(1)} ms · p95 ${p95.toFixed(1)} ms · p99 ${p99.toFixed(1)} ms · massimo ${massimo.toFixed(1)} ms`)
console.log(`  oltre soglia — >25 ms: ${oltre(SOGLIA_25)}  ·  >33,4 ms: ${oltre(SOGLIA_334)}  ·  >50 ms: ${oltre(SOGLIA_50)}  (su ${dt.length} intervalli)`)

if (misura.supportaLongtask) {
  console.log(`  long task (thread principale): ${misura.longtask.length}`)
  for (const lt of misura.longtask.slice(0, 10)) {
    console.log(`    a ${lt.inizio.toFixed(0)} ms, durata ${lt.durata.toFixed(1)} ms — ${lt.nome}`)
  }
} else {
  console.log('  long task: NON MISURABILE (PerformanceObserver non supporta "longtask" in questo browser)')
}

/* velocita', accelerazione, jerk del progresso `p` — derivate successive nel
   tempo REALE fra i fotogrammi, non a passo fisso: e' esattamente cio' che
   fa oscillare questi numeri quando il frame pacing e' irregolare */
const vel = []
for (let i = 1; i < F.length; i++) {
  const ddt = (F[i].t - F[i - 1].t) / 1000
  if (ddt > 0) vel.push({ t: F[i].t, v: (F[i].p - F[i - 1].p) / ddt })
}
const acc = []
for (let i = 1; i < vel.length; i++) {
  const ddt = (vel[i].t - vel[i - 1].t) / 1000
  if (ddt > 0) acc.push({ t: vel[i].t, a: (vel[i].v - vel[i - 1].v) / ddt })
}
const jerk = []
for (let i = 1; i < acc.length; i++) {
  const ddt = (acc[i].t - acc[i - 1].t) / 1000
  if (ddt > 0) jerk.push((acc[i].a - acc[i - 1].a) / ddt)
}
const massimoAssoluto = (arr) => arr.length ? Math.max(...arr.map(v => Math.abs(v))) : null
console.log('')
console.log('  progresso p — derivate rispetto al tempo reale fra i fotogrammi:')
console.log(`    velocita'      picco assoluto ${massimoAssoluto(vel.map(v => v.v))?.toFixed(3) ?? 'NON MISURABILE'} p/s`)
console.log(`    accelerazione  picco assoluto ${massimoAssoluto(acc.map(a => a.a))?.toFixed(3) ?? 'NON MISURABILE'} p/s^2`)
console.log(`    jerk           picco assoluto ${massimoAssoluto(jerk)?.toFixed(3) ?? 'NON MISURABILE'} p/s^3`)

/* il salto peggiore intorno a ciascuna giunzione: il fotogramma piu' lungo
   (ms) e lo spostamento massimo della camera fra due fotogrammi consecutivi
   (unita' di scena — non metri: la conversione non e' esposta su __nautica),
   in una finestra di tempo intorno all'istante in cui la corsa attraversa
   quella giunzione */
console.log('')
console.log(`  salto alle giunzioni (finestra +-${FINESTRA_GIUNZIONE_MS} ms):`)
const risultatoGiunzioni = []
for (const [nome, q] of GIUNZIONI) {
  const yGiunzione = Math.max(0, Math.round(corsa.cima + corsa.corsaRacconto * q))
  const pGiunzione = corsa.corsaRacconto > 0 ? (yGiunzione - corsa.cima) / corsa.corsaRacconto : q
  /* si cerca il fotogramma la cui p attraversa per prima quella soglia */
  const idx = F.findIndex(f => f.p >= pGiunzione)
  if (idx <= 0) {
    console.log(`    ${nome.padEnd(24)} NON MISURABILE (la corsa non attraversa p = ${pGiunzione.toFixed(4)})`)
    risultatoGiunzioni.push({ nome, misurabile: false })
    continue
  }
  const tCentro = F[idx].t
  let maxDt = 0
  let maxSpostamento = 0
  for (let i = 1; i < F.length; i++) {
    if (Math.abs(F[i].t - tCentro) > FINESTRA_GIUNZIONE_MS) continue
    if (F[i].dt > maxDt) maxDt = F[i].dt
    const a = F[i - 1].pos, b = F[i].pos
    const d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])
    if (d > maxSpostamento) maxSpostamento = d
  }
  console.log(`    ${nome.padEnd(24)} fotogramma piu' lungo ${maxDt.toFixed(1)} ms · spostamento camera ${maxSpostamento.toFixed(4)} unita'`)
  risultatoGiunzioni.push({ nome, misurabile: true, maxDt, maxSpostamento })
}

/* ─── VERDETTO ───────────────────────────────────────────────────────────── */

console.log('')
if (SOFTWARE) {
  console.log('  RENDERER SOFTWARE: nessun verdetto di prestazione. I numeri sopra sono per debug.')
  await finisci(0)
}

const problemi = []
if (p95 > BERSAGLIO_P95) problemi.push(`p95 = ${p95.toFixed(1)} ms, sopra il bersaglio di ${BERSAGLIO_P95} ms`)
if (p99 > BERSAGLIO_P99) problemi.push(`p99 = ${p99.toFixed(1)} ms, sopra il bersaglio di ${BERSAGLIO_P99} ms`)
for (const r of risultatoGiunzioni) {
  if (r.misurabile && r.maxDt > BERSAGLIO_GIUNZIONE_MS) {
    problemi.push(`giunzione "${r.nome}": fotogramma di ${r.maxDt.toFixed(1)} ms, sopra i ${BERSAGLIO_GIUNZIONE_MS} ms`)
  }
}
if (eccezioni.length) console.log('  eccezioni di pagina: ' + eccezioni.slice(0, 3).join(' | '))

if (problemi.length) {
  console.log('  SOPRA I BERSAGLI DI PARTENZA (non e detto che siano un difetto — vedi il commento in testa):')
  for (const p of problemi) console.log('    · ' + p)
} else {
  console.log('  dentro i bersagli di partenza.')
}

await finisci(0)
