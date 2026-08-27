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

const PORTA = 5180
const BASE = `http://localhost:${PORTA}/nautica/`
const FOTOGRAMMI = 90    // 1,5 s a 60 Hz. Basta: si guarda se si MUOVE, non un periodo intero

async function serviteci () {
  try {
    const r = await fetch(BASE, { redirect: 'manual' })
    if (r.status < 500) return null
  } catch {}
  const s = spawn('npm', ['run', 'preview'], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    try { await fetch(BASE, { redirect: 'manual' }); return s } catch {}
    await new Promise(r => setTimeout(r, 500))
  }
  s.kill()
  console.error('il server non si e alzato')
  process.exit(2)
}

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

  const r = await pagina.evaluate((n) => new Promise((res) => {
    const v = document.querySelector('video')
    const primoF = window.__nautica.fotogrammi
    const primoV = v ? v.currentTime : null
    let i = 0, min = Infinity, max = -Infinity
    const passo = () => {
      const x = window.__nautica.stato.rollio
      if (x < min) min = x
      if (x > max) max = x
      if (++i < n) requestAnimationFrame(passo)
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
        ridotto: window.__nautica.stato.ridotto,
        mare: window.__nautica.stato.mare
      })
    }
    requestAnimationFrame(passo)
  }), FOTOGRAMMI)
  r.errori = errori
  await pagina.close()
  return r
}

const con = await misura(true)
const senza = await misura(false)

console.log('  con "reduce":   ' +
  `${con.disegnati} fotogrammi disegnati, video +${con.video}s, rollio p-p ${con.escursione.toFixed(2)} gradi` +
  `  [ridotto=${con.ridotto}, mare ${con.mare}]`)
console.log('  senza:          ' +
  `${senza.disegnati} fotogrammi disegnati, video +${senza.video}s, rollio p-p ${senza.escursione.toFixed(2)} gradi` +
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
 * La soglia distingue "si muove" da "e' ferma a un valore di picco", e la
 * seconda da' esattamente zero. Non serve un numero grande: 1,5 secondi sono
 * un quinto del periodo di rollio, e a un terzo di ampiezza l'escursione
 * attesa e' di pochi decimi di grado. Chiedere 0,3 avrebbe bocciato una scena
 * che si muove benissimo.
 */
if (con.escursione < 0.02) {
  guai.push(`con la preferenza attiva la nave non oscilla (rollio p-p ${con.escursione.toFixed(2)} gradi): ` +
            'e ferma al proprio angolo di picco, che era la vecchia scorciatoia')
}
if (con.escursione >= senza.escursione * 0.85) {
  guai.push(`la preferenza non riduce niente: ${con.escursione.toFixed(2)} gradi contro ` +
            `${senza.escursione.toFixed(2)}. Ridurre non e opzionale piu di quanto lo sia non spegnere`)
}
for (const e of [...con.errori, ...senza.errori].slice(0, 3)) guai.push('eccezione in pagina: ' + e)

await browser.close()
server?.kill()

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
