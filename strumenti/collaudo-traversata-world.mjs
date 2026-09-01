import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'
import { S } from '../src/regia.js'

/**
 * COLLAUDO DELLA LASTRA — nessun piano appeso alla camera copre l'intero canvas.
 *
 *     node strumenti/collaudo-traversata-world.mjs
 *
 * ─── PERCHE' ESISTE, E PERCHE' NON E' `collaudo-continuita`
 *
 * Una revisione esterna ha dato al difetto un nome preciso, e il nome e' il
 * criterio: *«Un piano appeso alla camera che copre il 100% del quadro e' un
 * nuovo film anche se vive dentro lo stesso renderer.»* E' la descrizione
 * esatta di `src/scena/traversata.js`: un `Mesh` figlio della camera
 * (`camera.add(piano)`), scalato apposta perche' — commento dell'autore, non
 * mio — «IL PIANO COPRE ESATTAMENTE IL CAMPO», con l'opacita' che sale fino a
 * 1 nell'ultimo tratto del racconto (`regia.js` mappa la traversata su
 * `p ∈ [0.93, 1.00]`). Un canvas, un renderer, una scena, una camera — ma nel
 * fotogramma in cui quel piano e' opaco non e' piu' la SCENA a essere in
 * campo, e' una tessitura che vive dentro lo stesso renderer per anagrafica
 * soltanto.
 *
 * `collaudo-continuita.mjs` gia' MISURA questa cosa: la sua sezione «LASTRA»
 * stampa la copertura massima a ogni corsa. Ma non ci fallisce sopra, e lo
 * dice da sola nel proprio commento — «un cancello che nasce rosso e viene
 * tenuto disattivato non e' un cancello ... la misura si STAMPA col suo
 * obiettivo ... il giorno in cui la shell esiste, questa riga diventa un
 * `guasti.push`». Quel giorno non e' oggi, e questo file non e' un duplicato:
 * e' quella riga, promossa a cancello proprio, che nasce rosso perche' il
 * difetto e' vero — non perche' qualcuno lo abbia dimenticato acceso.
 * Riusa il canale che gia' esiste (`__nautica.coperturaTraversata()`): non lo
 * si reimplementa, lo si porta a un verdetto.
 *
 * ─── LE CINQUE COSE CHE IL CRITERIO CHIEDE
 *
 *   COPERTURA     in nessun fotogramma campionato lungo TUTTO il racconto la
 *                 lastra della traversata deve coprire il quadro per intero;
 *   TELA          un solo <canvas> in tutta la pagina;
 *   RENDERER      lo stesso `WebGLRenderer` in ogni campione — identita' con
 *                 `===`, non un conteggio (un renderer distrutto e
 *                 ricreato identico continuerebbe a contarne uno);
 *   SCENA         la stessa `THREE.Scene` in ogni campione;
 *   CAMERA        la stessa camera in ogni campione, E nessun oggetto NUOVO
 *                 diventa suo figlio durante l'atto. La lastra della
 *                 traversata e' GIA' figlia della camera fin dalla
 *                 costruzione della scena — e' esattamente il difetto che
 *                 questo file esiste per bocciare tramite COPERTURA — quindi
 *                 il confronto qui e' contro l'insieme dei figli letto SUBITO
 *                 DOPO che la scena esiste, non contro zero: cio' che
 *                 sarebbe un guasto IN PIU' e' un SECONDO oggetto che si
 *                 aggiungesse durante il racconto, un secondo mondo appeso
 *                 allo stesso gancio.
 *
 * Non misura millisecondi.
 */

/**
 * --- LA PORTA SI PUO' CAMBIARE, E SERVE PIU' DI QUANTO SEMBRI
 * (stesso motivo e stesso testo di `collaudo-continuita.mjs`: un solo collaudo
 * alla volta in CI puo' riusare la porta di sempre; piu' collaudi in locale se
 * ne litigherebbero uno solo e si spegnerebbero a vicenda.)
 */
const PORTA = Number(process.env.PORTA_COLLAUDO) || 5180
await avvisaSePortaAltrui(PORTA)
const BASE = `http://localhost:${PORTA}/nautica/`

/**
 * ─── PERCHE' 50 CAMPIONI E NON DI MENO
 *
 * La traversata prende il comando solo nell'ultimo 7% del racconto
 * (`regia.js:92`, `traversata: [0.93, 1.00]`). Con un passo di p = 1/PASSI,
 * bisogna restare abbastanza fitti da non scavalcare quella fascia: a
 * PASSI=50 il passo e' 0,02, quindi almeno tre campioni cadono dentro
 * [0.93, 1.00] anche nel caso peggiore di allineamento della griglia.
 */
const PASSI = 50

/**
 * ─── LA SOGLIA E' IL CRITERIO STESSO, non una taratura
 *
 * Il criterio dice «copre il 100% del quadro», non «copre piu' di una certa
 * frazione»: qui non c'e' un obiettivo di direzione da avvicinare come nella
 * nota TETTO_LASTRA di `collaudo-continuita` (quella e' un'ambizione futura,
 * 10%; questa e' il divieto assoluto della revisione, 100%). La soglia sta
 * a 0,99 e non a 1,00 per un solo motivo, di virgola mobile: `traversata.js`
 * scrive `mat.opacity = Math.max(0, Math.min(1, q * 5))`, quindi il valore
 * VERO che il criterio vieta e' esattamente 1 — ma un campionamento a passi
 * discreti puo' cadere un fotogramma prima che l'opacita' finisca di salire,
 * leggendo 0,997 invece di 1,000 nello stesso istante in cui il quadro e' gia'
 * indistinguibile da coperto per intero. 0,99 e' "praticamente cento", non
 * "abbastanza".
 */
const SOGLIA_COPERTURA_TOTALE = 0.99

/** Tolleranza per dire che lo scorrimento ha raggiunto il p richiesto. */
const EPSILON_P = 0.01
/** Oltre, non e' lo scorrimento che e' lento: e' che p non converge affatto. */
const ATTESA_P_MS = 5000

/**
 * ─── SI PROVA LA BUILD, NON IL SERVER DI SVILUPPO
 * (stesso motivo di `collaudo-continuita.mjs`: import differiti e chunk
 * mancanti — le cose che possono rompere l'invariante della lastra — non
 * esistono nel server di sviluppo.)
 */
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
  console.error('il server non si e\' alzato')
  process.exit(2)
}

/** Stesso motivo di `collaudo-continuita.mjs`: non si spegne un server che
 *  sta servendo qualcun altro. `TIENI_SERVER=1` lo lascia acceso. */
const TIENI_SERVER = !!process.env.TIENI_SERVER

const server = await serviteci()
const browser = await apriBrowser()
const pagina = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  reducedMotion: 'no-preference' // senza, si onora prefers-reduced-motion e si misura un'altra cosa
})

const errori = []
pagina.on('pageerror', e => errori.push('eccezione: ' + String(e).slice(0, 200)))
pagina.on('console', m => {
  if (m.type() !== 'error') return
  const t = m.text()
  if (/Failed to load resource/i.test(t)) return
  errori.push(t.slice(0, 200))
})

const finisci = async (codice) => {
  await browser.close()
  if (!TIENI_SERVER) server?.kill()
  process.exit(codice)
}

/**
 * `?ispeziona=1`: e' l'unico modo in cui `window.__nautica` — e con lui
 * `coperturaTraversata`, `cimaSezione`, `corsaRacconto` e `p` — arrivano ad
 * esistere (vedi `src/scena/index.js:1520` e `src/demo.js:377`).
 */
await pagina.goto(BASE + '?ispeziona=1', { waitUntil: 'load', timeout: 45000 })
// il motore e' a import differito: si scrolla vicino alla dimostrazione per
// farlo caricare, esattamente come fa `collaudo-continuita`
await pagina.evaluate(() => {
  const d = document.querySelector('#dimostrazione')
  scrollTo({ top: scrollY + d.getBoundingClientRect().top + 10, behavior: 'instant' })
})
try {
  await pagina.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
} catch {
  const webgl = await pagina.evaluate(() => {
    try { return !!document.createElement('canvas').getContext('webgl2') } catch { return false }
  })
  console.error(webgl
    ? '\n  La scena non si e avviata entro un minuto, ma un contesto WebGL c e:\n  la causa sta negli errori qui sopra, non nel tempo.\n'
    : '\n  NESSUN CONTESTO WEBGL. Senza scheda grafica serve --enable-unsafe-swiftshader,\n  che strumenti/browser.mjs passa gia: se manca, e quel file a essere stato aggirato.\n')
  await finisci(1)
}
// lascia che l'auto-dimostrazione della rotazione (demo.js: dimostraLaRotazione)
// finisca il suo giro, o il primo campione la misurerebbe a meta'
await pagina.waitForTimeout(1500)

/**
 * ─── SE NON SI PUO' MISURARE, LO SI DICE — non si finge uno zero
 *
 * `coperturaTraversata`, `cimaSezione`, `corsaRacconto` sono tre accessori
 * distinti, e nessuno dei tre e' garantito da `!!window.__nautica`. Un
 * accessore assente qui non deve diventare "?? 0" ne' "p = 0": deve fermare
 * il cancello e dirlo, perche' un cancello che misura il nulla e lo dichiara
 * verde e' il difetto peggiore di questo repo.
 */
const accessori = await pagina.evaluate(() => {
  const n = window.__nautica
  return {
    coperturaTraversata: typeof n.coperturaTraversata === 'function',
    cimaSezione: typeof n.cimaSezione === 'number',
    corsaRacconto: typeof n.corsaRacconto === 'number' && n.corsaRacconto > 0,
    p: typeof n.p === 'number'
  }
})
const mancanti = Object.entries(accessori).filter(([, ok]) => !ok).map(([k]) => k)
if (mancanti.length) {
  console.error('')
  console.error('  NON MISURABILE: window.__nautica non espone ' + mancanti.join(', ') + '.')
  console.error('  Senza questi accessori non si puo\' collocare la pagina in un punto')
  console.error('  del racconto: muoversi a una frazione di scrollHeight sarebbe la')
  console.error('  cosa vietata tre volte in questo repo, e fingere p=0 sarebbe la stessa')
  console.error('  bugia con un altro nome.')
  console.error('')
  await finisci(2)
}

/**
 * ─── L'IDENTITA' SI FISSA QUI, UNA VOLTA — e i figli della camera con lei
 *
 * Stesso principio di `collaudo-continuita`: contare non basta, si confronta
 * l'OGGETTO. In piu' qui si registra anche l'insieme dei figli della camera:
 * la traversata ne e' gia' uno (per costruzione — e' il difetto che COPERTURA
 * boccia), quindi il controllo di re-parenting non e' "zero figli sempre" ma
 * "nessun figlio IN PIU' rispetto a questo istante".
 */
await pagina.evaluate(() => {
  const n = window.__nautica
  window.__rif = {
    tela: n.render.domElement,
    scena: n.scena,
    camera: n.camera,
    render: n.render,
    figliCamera: n.camera.children.map(c => c.uuid).sort()
  }
})

/** Sposta la pagina a un `p` del RACCONTO — mai a una frazione di pagina. */
async function vaiAP (p) {
  await pagina.evaluate((p) => {
    const n = window.__nautica
    scrollTo({ top: n.cimaSezione + p * n.corsaRacconto, behavior: 'instant' })
  }, p)
  // leggiScorrimento gira dentro l'handler di 'scroll': un fotogramma basta
  // perche' il browser l'abbia gia' dispacciato
  await pagina.evaluate(() => new Promise(r => requestAnimationFrame(r)))
  try {
    await pagina.waitForFunction(
      ([p, eps]) => window.__nautica && Math.abs(window.__nautica.p - p) < eps,
      [p, EPSILON_P], { timeout: ATTESA_P_MS }
    )
    return null
  } catch {
    const letto = await pagina.evaluate(() => window.__nautica.p)
    return `p richiesto ${p.toFixed(2)}, __nautica.p resta a ${letto?.toFixed(3)}: lo scorrimento non converge`
  }
}

const campioni = []
const guasti = []
for (let i = 0; i <= PASSI; i++) {
  const p = i / PASSI
  const problema = await vaiAP(p)
  if (problema) { guasti.push(`campione ${i}: ${problema}`); continue }
  campioni.push(await pagina.evaluate(() => {
    const n = window.__nautica
    const r = window.__rif
    return {
      p: n.p,
      copertura: n.coperturaTraversata(),
      stessaTela: n.render.domElement === r.tela,
      stessaScena: n.scena === r.scena,
      stessaCamera: n.camera === r.camera,
      stessoRender: n.render === r.render,
      tele: document.querySelectorAll('canvas').length,
      figliCamera: n.camera.children.map(c => c.uuid).sort()
    }
  }))
}

/* --- REFERTO ---------------------------------------------------------- */

const note = []

// ─── copertura ──────────────────────────────────────────────────────────
/**
 * ─── SI GIUDICA DENTRO LA FINESTRA DELLA TRAVERSATA, non su tutta la pagina
 *
 * DECISIONE DEL COMMITTENTE, 1 settembre 2026: il sito finisce col FILMATO DEL
 * SALONE, che e' dove stanno le due persone. Si toglie solo `traversata.mp4`.
 *
 * Quindi nella CODA una lastra a copertura totale non solo e' ammessa: e'
 * l'ultima immagine del sito, ed e' voluta. Questo cancello la vietava ovunque
 * e falliva su di essa -- «copre il quadro per intero fra p=0.96 e p=1.00» --
 * accusando il montaggio di un difetto che e' il finale.
 *
 * NON E' UNA DEROGA, e la differenza conta: la regola «la traversata non e' un
 * filmato» resta vera dove la traversata AVVIENE. Fuori di li' la lastra non
 * sta mostrando la traversata: sta mostrando il salone.
 *
 * La finestra si LEGGE da regia.js invece di essere ricopiata qui: due copie di
 * un intervallo sono due intervalli che un giorno divergono.
 */
const FINESTRA = S.traversata
const dentroFinestra = (c) => c.p >= FINESTRA[0] && c.p <= FINESTRA[1]
const inFinestra = campioni.filter(dentroFinestra)
const cop = inFinestra.map(c => c.copertura)
const massima = cop.length ? Math.max(...cop) : null
const dovePicco = cop.length ? inFinestra[cop.indexOf(massima)].p : null
if (massima === null) {
  guasti.push('nessun campione valido: la copertura non e stata misurata da nessuna parte')
} else {
  const coperti = inFinestra.filter(c => c.copertura >= SOGLIA_COPERTURA_TOTALE)
  note.push(`FINESTRA    p in [${FINESTRA[0]}, ${FINESTRA[1]}], letta da regia.js — ` +
            `${inFinestra.length} campioni su ${campioni.length} ci cadono dentro`)
  note.push(`COPERTURA   massima ${(massima * 100).toFixed(1)}% (a p=${dovePicco.toFixed(2)}), ` +
            `tetto non negoziabile ${(SOGLIA_COPERTURA_TOTALE * 100).toFixed(0)}%; ` +
            `${coperti.length} campioni su ${campioni.length} coprono il quadro per intero`)
  if (coperti.length) {
    const pMin = Math.min(...coperti.map(c => c.p))
    const pMax = Math.max(...coperti.map(c => c.p))
    guasti.push(
      `la lastra della traversata copre il quadro per intero (fino al ${(massima * 100).toFixed(1)}%) ` +
      `fra p=${pMin.toFixed(2)} e p=${pMax.toFixed(2)}: e' un piano camera-space a copertura totale, ` +
      'un nuovo film anche se vive dentro lo stesso renderer.')
  }
}

// ─── identita' ──────────────────────────────────────────────────────────
const cambiati = []
for (const [k, etichetta] of [['stessaTela', 'la tela'], ['stessaScena', 'la scena'],
                              ['stessaCamera', 'la camera'], ['stessoRender', 'il renderer']]) {
  if (campioni.some(c => !c[k])) cambiati.push(etichetta)
}
note.push(`IDENTITA'   ${cambiati.length ? 'CAMBIA: ' + cambiati.join(', ') : 'tela, scena, camera e renderer restano sempre gli stessi oggetti'}`)
if (cambiati.length) {
  guasti.push(`durante il racconto cambia ${cambiati.join(' e ')}: l'atto viene rimontato.`)
}

const teleMax = campioni.length ? Math.max(...campioni.map(c => c.tele)) : 0
note.push(`TELA        ${[...new Set(campioni.map(c => c.tele))].join('/')} canvas nella pagina`)
if (teleMax > 1) {
  guasti.push(`ci sono ${teleMax} canvas nella pagina invece di uno: due tele sono due mondi.`)
}

// ─── re-parenting sulla camera ────────────────────────────────────────────
const baseFigli = JSON.stringify((await pagina.evaluate(() => window.__rif.figliCamera)))
const reparenting = campioni.filter(c => JSON.stringify(c.figliCamera) !== baseFigli)
note.push(`CAMERA      ${reparenting.length ? reparenting.length + ' campioni con figli diversi dal riferimento iniziale' : 'nessun oggetto nuovo appeso alla camera durante il racconto'}`)
if (reparenting.length) {
  guasti.push(
    `la camera acquista/perde figli durante il racconto (${reparenting.length} campioni diversi ` +
    `dal riferimento preso a inizio corsa): un secondo piano appeso alla camera e' un secondo mondo.`)
}

if (errori.length) {
  guasti.push(`la pagina ha sollevato ${errori.length} errori: ${errori.slice(0, 2).join(' | ')}`)
}

console.log('collaudo continuita\' del mondo — la lastra della traversata')
for (const n of note) console.log('  ' + n)

if (guasti.length) {
  console.error('\nCOLLAUDO LASTRA/MONDO FALLITO')
  for (const g of guasti) console.error('  · ' + g)
  await finisci(1)
}
console.log('\ncollaudo lastra/mondo: passato')
await finisci(0)
