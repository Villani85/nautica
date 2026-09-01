/**
 * IL SUONO NON PARTE DA SOLO, NON SI SDOPPIA, NON SATURA.
 *
 * ─── PERCHE' NON C'ERA
 *
 * Una revisione ha elencato cio' che nessun cancello guardava, e l'audio era in
 * cima: trentanove cancelli e nessuno verificava che il suono partisse solo
 * dopo un gesto, che ci fosse UN solo `AudioContext`, che il guadagno non
 * saturasse. Tre difetti possibili, zero cancelli.
 *
 * E non e' teoria. Il committente l'aveva gia' detto guardando il sito: «il
 * suono e' un suono fastidiosissimo continuo, non e' coerente con nessun
 * movimento». Quel difetto e' stato chiuso legando la voce dello scafo alla
 * VELOCITA' di rollio, ma niente impediva che tornasse.
 *
 * ─── COME SI GUARDA UNA COSA CHE IL SITO NON ESPONE
 *
 * `suono.js` non mette niente su `__nautica`, e non lo si tocca per farsi
 * misurare: si strumenta il BROWSER prima che la pagina parta. `addInitScript`
 * avvolge `AudioContext` e `createGain` e tiene il conto. Il sito non sa di
 * essere guardato, e quello che si misura e' cio' che fa davvero -- non cio'
 * che dichiara.
 *
 * ─── COSA NON COPRE
 *
 * Non ascolta. Non dice se il suono e' bello, se le voci si impastano, se il
 * mare somiglia al mare. Dice solo che nessuna nota suona prima del consenso,
 * che i contesti sono uno, e che nessun guadagno esce dai limiti dichiarati.
 * Il resto si giudica con le orecchie, e non e' compito di un cancello.
 */
import { apriBrowser } from './browser.mjs'
import { anteprima } from './anteprima.mjs'

const SONDA = () => {
  const w = window
  w.__audio = { contesti: 0, guadagni: [], stati: [] }
  const Vero = w.AudioContext || w.webkitAudioContext
  if (!Vero) return
  const Finto = function (...a) {
    const c = new Vero(...a)
    w.__audio.contesti++
    const creaG = c.createGain.bind(c)
    c.createGain = () => { const g = creaG(); w.__audio.guadagni.push(g); return g }
    w.__audio.ultimo = c
    return c
  }
  Finto.prototype = Vero.prototype
  w.AudioContext = Finto
  w.webkitAudioContext = Finto
  w.__audio.leggi = () => ({
    contesti: w.__audio.contesti,
    stato: w.__audio.ultimo ? w.__audio.ultimo.state : null,
    guadagni: w.__audio.guadagni.map((g) => g.gain.value),
    massimo: w.__audio.guadagni.reduce((m, g) => Math.max(m, g.gain.value), 0)
  })
}

const guai = []
const a = await anteprima()
let b
try {
  b = await apriBrowser()
  const pg = await b.newPage()
  await pg.addInitScript(SONDA)
  await pg.goto(a.indirizzo + '?ispeziona=1', { waitUntil: 'domcontentloaded' })
  await pg.waitForFunction(() => window.__nautica?.fotogrammi > 3, null, { timeout: 90000 })

  /* --- A. PRIMA DEL GESTO non deve esistere nessun contesto ---------------
     Un `AudioContext` costruito all'apertura e' gia' un difetto anche se muto:
     i browser lo bloccano, la console si riempie, e su un telefono e' batteria
     spesa per niente. */
  const prima = await pg.evaluate(() => window.__audio.leggi())
  console.log(`  prima del gesto   contesti ${prima.contesti}`)
  if (prima.contesti > 0) guai.push(`nasce un AudioContext senza che nessuno lo chieda (${prima.contesti})`)

  /* --- B. IL PULSANTE ESISTE e si annuncia spento ------------------------- */
  const bott = await pg.evaluate(() => {
    const e = document.querySelector('button.suono')
    return e ? { c: true, premuto: e.getAttribute('aria-pressed'), testo: e.textContent.trim() } : { c: false }
  })
  if (!bott.c) guai.push('non esiste nessun button.suono')
  else {
    console.log(`  pulsante          «${bott.testo}» aria-pressed=${bott.premuto}`)
    if (bott.premuto !== 'false') guai.push(`il pulsante si annuncia gia acceso (aria-pressed=${bott.premuto})`)
  }

  /* --- C. DOPO IL GESTO: un contesto solo, e vivo ------------------------- */
  if (bott.c) {
    await pg.click('button.suono')
    await pg.waitForFunction(() => window.__audio.leggi().contesti > 0, null, { timeout: 8000 })
      .catch(() => guai.push('dopo il gesto non nasce nessun AudioContext'))
    const dopo = await pg.evaluate(() => window.__audio.leggi())
    console.log(`  dopo il gesto     contesti ${dopo.contesti} · stato ${dopo.stato} · ` +
                `${dopo.guadagni.length} guadagni · massimo ${dopo.massimo.toFixed(3)}`)
    if (dopo.contesti > 1) guai.push(`${dopo.contesti} AudioContext invece di uno`)
    if (dopo.stato !== 'running') guai.push(`il contesto resta «${dopo.stato}» dopo il consenso`)

    /* --- D. SI PREME ANCORA e non se ne costruisce un altro --------------- */
    await pg.click('button.suono')
    await pg.click('button.suono')
    const terzo = await pg.evaluate(() => window.__audio.leggi())
    console.log(`  spento e riacceso contesti ${terzo.contesti}`)
    if (terzo.contesti > 1) guai.push(`accendere e spegnere costruisce contesti nuovi (${terzo.contesti})`)

    /* --- E. IL MARE CATTIVO NON FA SATURARE -------------------------------
       Si spinge la nave dove le voci sono piu' alte -- rollio grande, che e'
       cio' che comanda la voce dello scafo -- e si guarda il guadagno peggiore.
       Sopra 1 un guadagno somma piu' potenza di quanta ne entri: e' il punto in
       cui un suono diventa quello che il committente ha chiamato
       «fastidiosissimo». */
    await pg.evaluate(async () => {
      for (let i = 0; i < 90; i++) { window.__nautica.provaSollievo?.(12, 1 / 24) }
      await new Promise((r) => setTimeout(r, 1200))
    })
    const teso = await pg.evaluate(() => window.__audio.leggi())
    console.log(`  con mare grosso   massimo ${teso.massimo.toFixed(3)} su un limite di 1,000`)
    if (teso.massimo > 1.0001) guai.push(`un guadagno arriva a ${teso.massimo.toFixed(3)}: sopra 1 si satura`)
  }
} finally {
  a.ferma()
  await b?.close()
}

console.log('')
if (guai.length) {
  for (const g of guai) console.log('  ROTTO  ' + g)
  console.log('')
  console.log('  NON VERIFICATO: se il suono sia BELLO. Questo cancello conta contesti e')
  console.log('  guadagni, non ascolta.')
  process.exit(1)
}
console.log('  SUONO IN ORDINE — nessuna nota prima del consenso, un contesto solo,')
console.log('  nessun guadagno sopra 1.')
console.log('')
console.log('  NON VERIFICATO: la resa. Un cancello conta, non ascolta.')
