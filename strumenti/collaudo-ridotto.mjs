import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'

/**
 * CON `prefers-reduced-motion` IL SITO SI RIDUCE. NON SI SPEGNE.
 *
 * --- IL DIFETTO PER CUI ESISTE
 *
 * Chi aveva la preferenza attiva non riceveva un sito piu' calmo: ne riceveva
 * una FOTOGRAFIA. Tre cose si spegnevano insieme, e la terza per sbaglio:
 *
 *   - `simulazione.js` aveva un ramo che congelava la nave al proprio angolo
 *     di picco, senza oscillazione;
 *   - `index.js` non faceva avanzare ne' l orologio della scena ne' le onde;
 *   - `demo.js` non avviava proprio il ciclo di disegno -- e dentro quel ciclo
 *     vive il VIDEO del salone. Nessuno aveva deciso di fermare il video: si
 *     e' fermato perche' era attaccato a qualcosa che qualcun altro spegneva.
 *
 * Il committente l ha detto due volte, l ultima cosi': *"deve partire su tutti
 * gli schermi anche su chi disattiva le animazioni"*.
 *
 * --- E LA RAGIONE NON E' SOLO DI GUSTO
 *
 * Il difetto vestibolare non e' il movimento, e' l AMPIEZZA del movimento.
 * Quindici gradi di rollio a tutto schermo sono un problema; cinque no.
 * Togliere tutto e' la scorciatoia di chi non vuole progettare la versione
 * ridotta -- ed e' anche l unico modo di rendere il requisito invisibile,
 * perche' una pagina ferma non fallisce nessun controllo.
 *
 * --- COSA MISURA
 *
 *   1. che la scena DISEGNI: il contatore dei fotogrammi deve avanzare;
 *   2. che il video del salone AVANZI: `currentTime` deve crescere;
 *   3. che la nave OSCILLI: il rollio deve cambiare segno, non stare fermo a
 *      un valore di picco;
 *   4. che l ampiezza sia davvero RIDOTTA rispetto alla visita normale --
 *      altrimenti la preferenza non e' onorata affatto, che e' il difetto
 *      opposto e altrettanto vero.
 */

/**
 * --- LA PORTA SI PUO' CAMBIARE, E SERVE PIU' DI QUANTO SEMBRI
 *
 * Tutti i collaudi che aprono un browser usavano la 5180 e la cercavano gia'
 * accesa. Con un solo collaudo alla volta -- in CI, sempre -- e' giusto cosi'.
 * In locale, con piu' processi che misurano insieme, diventa una risorsa
 * contesa: il primo che finisce spegne il server sotto chi sta ancora
 * campionando, e Playwright riferisce `Execution context was destroyed, most
 * likely because of a navigation`. E' successo tre volte, e nessuna delle tre
 * il messaggio nominava la causa.
 *
 * `PORTA_COLLAUDO=5181 npm run collaudo` da' a questa corsa un server suo.
 */
const PORTA = Number(process.env.PORTA_COLLAUDO) || 5180
const BASE = `http://localhost:${PORTA}/nautica/`
/**
 * --- LA FINESTRA E' UN TEMPO, NON UN CONTEGGIO DI FOTOGRAMMI
 *
 * Era `90` fotogrammi, «1,5 s a 60 Hz». In CI si disegna in SOFTWARE a 1,2
 * fotogrammi al secondo, e gli stessi 90 diventano **settantacinque secondi**:
 * molti periodi di rollio, in cui sia la nave ridotta sia quella piena
 * arrivano al proprio massimo. Il picco-picco satura, il rapporto tende a 1, e
 * il cancello dichiarava «la preferenza non riduce niente» -- misurando la
 * velocita' della macchina invece della preferenza. E' il difetto che ha
 * tenuto la CI rossa e il sito non pubblicato.
 *
 * Adesso la finestra e' DIECI SECONDI su qualunque macchina, con un tetto di
 * fotogrammi che serve solo a non sprecarne su una veloce. Su una macchina
 * lenta i campioni sono pochi ma coprono lo stesso tempo simulato, che e' cio'
 * che conta per una media quadratica.
 */
const FOTOGRAMMI = Number(process.env.FOTOGRAMMI || 600)
const DURATA_MS = Number(process.env.DURATA_MS || 10000)
const CAMPIONI_MIN = 12

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

/**
 * --- NON SI SPEGNE UN SERVER CHE STA SERVENDO QUALCUN ALTRO
 *
 * Con piu' collaudi in parallelo -- e in questa sessione ce n'erano quindici,
 * fra agenti e sessione principale -- tutti trovano `npm run preview` gia'
 * acceso sulla 5180 e lo riusano, come e' giusto. Poi il primo che finisce lo
 * UCCIDE, e chi sta ancora campionando muore con
 * `page.evaluate: Execution context was destroyed`.
 *
 * E' successo davvero, due volte, e il messaggio parla di navigazione: la
 * causa vera -- un altro processo che ha spento il server -- non compare da
 * nessuna parte. Un guasto che nomina la conseguenza e non la causa.
 *
 * `TIENI_SERVER=1` lo lascia acceso. Serve in locale quando si lancia piu' di
 * un collaudo insieme; in CI non si mette, e il server muore con la corsa.
 */
const TIENI_SERVER = !!process.env.TIENI_SERVER

const guai = []
const server = await serviteci()
const browser = await apriBrowser()

/**
 * Si misura DUE VOLTE: una con la preferenza attiva e una senza, sulla stessa
 * pagina e con lo stesso stato. Un solo campione direbbe se la scena si muove,
 * non se si muove MENO -- e sono due requisiti diversi, che si contraddicono
 * se uno solo viene controllato.
 */
async function misura (ridotto) {
  const pagina = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    reducedMotion: ridotto ? 'reduce' : 'no-preference'
  })
  const errori = []
  pagina.on('pageerror', e => errori.push(String(e).slice(0, 160)))
  // se la pagina naviga durante il campionamento il contesto muore, e il
  // messaggio di Playwright parla di navigazione senza dire QUALE
  let caricata = false
  pagina.on('framenavigated', f => {
    if (f !== pagina.mainFrame()) return
    if (caricata) errori.push('la pagina ha navigato durante la misura: ' + f.url())
  })
  await pagina.goto(BASE + '?ispeziona=1', { waitUntil: 'load' })
  await pagina.waitForFunction(() => window.__nautica && window.__nautica.scena, null, { timeout: 60000 })
  caricata = true

  // al salone, dove sta il video
  for (let f = 0; f <= 1.0001; f += 0.02) {
    const r = await pagina.evaluate(async (f) => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo(0, Math.round(h * f))
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      const el = document.querySelector('.palco[data-battuta]')
      const b = el.getBoundingClientRect()
      return { b: el.dataset.battuta, ok: b.top > -1 && b.top < 2 }
    }, f)
    if (r.b === 'salotto' && r.ok) break
  }
  await new Promise(r => setTimeout(r, 2500))

  const r = await pagina.evaluate(([n, durata]) => new Promise((res) => {
    const t0 = performance.now()
    const v = document.querySelector('video')
    const primoF = window.__nautica.fotogrammi
    const primoV = v ? v.currentTime : null
    /**
     * --- SI MISURA LA RMS, NON IL PICCO-PICCO
     *
     * Il picco-picco SATURA. Su questa macchina 90 fotogrammi sono un secondo
     * e mezzo, un quinto del periodo di rollio, e la differenza fra ampiezza
     * piena e ampiezza ridotta si legge. In CI, dove si disegna in software a
     * 1,2 fotogrammi al secondo, gli stessi 90 fotogrammi sono
     * **settantacinque secondi**: molti periodi, e sia la nave ridotta sia
     * quella piena arrivano al proprio massimo. Il rapporto tende a 1 e il
     * cancello dichiara «la preferenza non riduce niente» misurando la
     * velocita' della macchina invece della preferenza.
     *
     * La RMS non satura: e' l'ampiezza media, e resta proporzionale
     * all'ampiezza vera per quanti periodi si guardino. Il picco-picco resta
     * come SECONDO numero, perche' serve a distinguere «si muove poco» da
     * «e' ferma al proprio picco» -- che era la vecchia scorciatoia e da'
     * esattamente zero.
     */
    let i = 0, min = Infinity, max = -Infinity, somma = 0, quadri = 0
    let prec = null, maxPasso = 0
    const passo = () => {
      const x = window.__nautica.stato.rollio
      if (x < min) min = x
      if (x > max) max = x
      somma += x; quadri += x * x
      /* Il PASSO fra due campioni consecutivi. Serve a distinguere «si muove
         poco» da «e' ferma al proprio angolo di picco» -- che era la vecchia
         scorciatoia e da' ZERO ESATTO. Il picco-picco non lo distingue in
         modo affidabile: su un secondo e mezzo di rollio a fase casuale
         capita di cadere in un momento quieto, e fra due esecuzioni della
         stessa build ho misurato 0,01 e 0,04 gradi contro una soglia di 0,02.
         Un cancello che da' un esito a caso e' peggio di nessun cancello. */
      if (prec !== null) maxPasso = Math.max(maxPasso, Math.abs(x - prec))
      prec = x
      const scaduto = performance.now() - t0 > durata
      if (++i < n && !scaduto) requestAnimationFrame(passo)
      else res({
        disegnati: window.__nautica.fotogrammi - primoF,
        /**
         * Il video CICLA: campionando a cavallo della fine, la differenza
         * grezza esce NEGATIVA -- misurato, -11,884 s su una clip di 30. Un
         * numero negativo di secondi trascorsi non e' un difetto del sito, e'
         * un difetto del metro, e lo dichiara da solo essendo impossibile.
         */
        video: v ? +(((v.currentTime - primoV) + v.duration) % v.duration).toFixed(3) : null,
        escursione: max - min,
        maxPasso,
        rms: Math.sqrt(Math.max(0, quadri / i - (somma / i) * (somma / i))),
        campioni: i,
        ridotto: window.__nautica.stato.ridotto,
        mare: window.__nautica.stato.mare
      })
    }
    requestAnimationFrame(passo)
  }), [FOTOGRAMMI, DURATA_MS])
  r.errori = errori
  await pagina.close()
  return r
}

const con = await misura(true)
const senza = await misura(false)

console.log('  con "reduce":   ' +
  `${con.disegnati} fotogrammi disegnati, video +${con.video}s, rollio RMS ${con.rms.toFixed(3)} (p-p ${con.escursione.toFixed(2)}, passo max ${con.maxPasso.toFixed(4)}) gradi` +
  `  [ridotto=${con.ridotto}, mare ${con.mare}]`)
console.log('  senza:          ' +
  `${senza.disegnati} fotogrammi disegnati, video +${senza.video}s, rollio RMS ${senza.rms.toFixed(3)} (p-p ${senza.escursione.toFixed(2)}, passo max ${senza.maxPasso.toFixed(4)}) gradi` +
  `  [ridotto=${senza.ridotto}, mare ${senza.mare}]`)

if (!con.ridotto) {
  guai.push('con reducedMotion=reduce la pagina non si accorge della preferenza: ' +
            'il resto di questo collaudo non prova niente')
}
if (con.disegnati < FOTOGRAMMI / 3) {
  guai.push(`con la preferenza attiva la scena ha disegnato ${con.disegnati} fotogrammi su ${FOTOGRAMMI}: ` +
            'e una fotografia, non un sito piu calmo')
}
if (con.video !== null && con.video < 0.4) {
  guai.push(`con la preferenza attiva il video del salone e avanzato di ${con.video}s in un secondo e mezzo: ` +
            'sta fermo. Il video non era stato spento da nessuno -- si e fermato perche era ' +
            'attaccato al ciclo di disegno che qualcun altro spegneva')
}
/**
 * «Si muove» contro «e' ferma al valore di picco»: la seconda da' passo ZERO
 * ESATTO fra due campioni, quindi non serve una soglia di ampiezza -- e una
 * soglia di ampiezza era proprio il difetto, perche' su una finestra corta il
 * rollio ha fase casuale e a volte ci si casca dentro un momento quieto.
 */
if (!(con.maxPasso > 1e-5)) {
  guai.push(`con la preferenza attiva il rollio non cambia mai fra un campione e l altro ` +
            `(passo massimo ${con.maxPasso}): e ferma al proprio angolo di picco, ` +
            'che era la vecchia scorciatoia')
}
if (Math.min(con.campioni, senza.campioni) < CAMPIONI_MIN) {
  console.log(`  NON MISURATO  il confronto delle ampiezze vuole almeno ${CAMPIONI_MIN} campioni ` +
              `e questa macchina ne ha dati ${Math.min(con.campioni, senza.campioni)} in ${DURATA_MS / 1000} s. ` +
              'Si dice invece di dare un verdetto che non si puo sostenere.')
} else if (con.rms >= senza.rms * 0.85) {
  guai.push(`la preferenza non riduce niente: RMS ${con.rms.toFixed(3)} contro ` +
            `${senza.rms.toFixed(3)} gradi. Ridurre non e opzionale piu di quanto lo sia non spegnere`)
}
for (const e of [...con.errori, ...senza.errori].slice(0, 3)) guai.push('eccezione in pagina: ' + e)

await browser.close()
if (!TIENI_SERVER) server?.kill()

if (guai.length) {
  console.error('')
  console.error('  IL MOVIMENTO RIDOTTO NON E UNA VERSIONE RIDOTTA:')
  console.error('')
  for (const g of guai) console.error('   - ' + g)
  console.error('')
  process.exit(1)
}
console.log('')
console.log('  con movimento ridotto il sito parte, il video gira, la nave si muove di meno.')
console.log('')
