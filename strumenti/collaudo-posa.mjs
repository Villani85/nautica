import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

/**
 * COLLAUDO DELLA POSA — quanto a lungo le due pose convivono a schermo.
 *
 *     node strumenti/collaudo-posa.mjs
 *
 * PERCHE' ESISTE, ed e' costato tre tentativi sbagliati sulla cosa sbagliata.
 *
 * Nel salone le persone sono DUE FOTOGRAFIE: a riposo, e puntellate. La posa
 * tesa e' ritagliata sulle sole figure e compare in dissolvenza sopra quella
 * calma. Durante la dissolvenza le due pose sono **entrambe visibili** — e a
 * schermo non si legge come qualcuno che si irrigidisce, si legge come
 * **quattro persone**.
 *
 * L'ho attribuito alla maschera per tre giri: tenevo le due macchie piu'
 * grandi, poi tutte quelle sopra una soglia, poi due riquadri. Ogni volta
 * quattro persone. La diagnosi e' arrivata componendo la stessa maschera FUORI
 * dal sito, con la posa tesa piena: due persone pulite. La maschera era gia'
 * giusta. **Sbagliato era il tempo**: 0,88 s per completare la dissolvenza.
 *
 * Morale, e vale oltre questo file: quando un difetto non si sposta pur
 * cambiando la cosa che lo causa, la cosa che lo causa e' un'altra. Isolarlo
 * fuori dal contesto costa dieci minuti e li ripaga tutti.
 *
 * COSA MISURA, e nessuna delle due e' una soglia in millisecondi:
 *
 *   1. **la finestra ambigua** — la frazione di tempo in cui la posa sta fra
 *      0,2 e 0,8, cioe' in cui si vedono quattro figure. Non e' il tempo di
 *      calcolo di niente: e' una grandezza della simulazione, quindi la stessa
 *      su qualunque macchina;
 *   2. **i ritorni alla calma** — quante volte le persone si rilassano
 *      completamente mentre la stanza rolla. Con la scelta fatta sull'angolo
 *      istantaneo erano CINQUE in ventidue secondi, e a schermo lampeggiavano.
 *      L'isteresi le ha portate a zero; questo cancello impedisce che tornino.
 */

const INDIRIZZO = process.env.URL || 'http://localhost:4174/nautica/'
const VISIBILE = process.env.TESTA ? false : true

const SECONDI = 24          // quanto si osserva
const PASSO = 100           // ogni quanto si campiona, in millisecondi
const AMBIGUA = 0.12        // frazione di tempo tollerata con le due pose sovrapposte
const RITORNI = 1           // ritorni alla calma tollerati mentre la stanza rolla

async function apriBrowser () {
/**
 * QUALE BROWSER, e si puo' forzare.
 *
 * Di norma si usa il Chrome di sistema, perche' `playwright-core` non scarica
 * browser. Ma chi clona il progetto puo' avere solo il chromium di Playwright,
 * e un cancello che e' verde su un browser e rosso sull'altro non vale niente.
 * `CHROMIUM=1` forza quello interno, cosi' la differenza si puo' riprodurre
 * invece che discutere.
 */
  if (process.env.CHROMIUM) return await chromium.launch({ headless: VISIBILE })
  try { return await chromium.launch({ channel: 'chrome', headless: VISIBILE }) }
  catch {
    try { return await chromium.launch({ headless: VISIBILE }) }
    catch {
      console.error(`
  ROTTO  nessun browser disponibile.
         Questo collaudo usa playwright-core, che di proposito NON scarica
         browser. Serve:
             npx playwright install chrome
         Attenzione: "npx playwright install" da solo NON basta.
`)
      process.exit(1)
    }
  }
}

async function risponde (url) {
  try {
    const c = new AbortController()
    const t = setTimeout(() => c.abort(), 3000)
    const r = await fetch(url, { signal: c.signal })
    clearTimeout(t)
    return r.ok
  } catch { return false }
}

let preview = null
if (!(await risponde(INDIRIZZO))) {
  const porta = new URL(INDIRIZZO).port || '4173'
  console.log(`  la preview non risponde su ${INDIRIZZO} — la accendo io sulla ${porta}`)
  preview = spawn('npx', ['vite', 'preview', '--port', porta, '--strictPort'],
    { shell: true, stdio: 'ignore', cwd: fileURLToPath(new URL('..', import.meta.url)) })
  for (let i = 0; i < 40 && !(await risponde(INDIRIZZO)); i++) await new Promise(r => setTimeout(r, 500))
  if (!(await risponde(INDIRIZZO))) {
    console.error(`
  ROTTO  non riesco ad accendere la preview su ${INDIRIZZO}.
         Compila prima con "npm run build", oppure accendila a mano:
             npm run preview
`)
    preview.kill()
    process.exit(1)
  }
}

const browser = await apriBrowser()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const pg = await ctx.newPage()
await pg.goto(INDIRIZZO, { waitUntil: 'domcontentloaded' })
await pg.waitForTimeout(1200)
await pg.evaluate(() => document.querySelector('#salone')?.scrollIntoView())
await pg.waitForTimeout(1500)

/**
 * SI SPEGNE LO STABILIZZATORE. E' l'unico stato in cui la domanda ha senso: a
 * sistema acceso la stanza sta quasi ferma e la posa non cambia mai, quindi il
 * cancello passerebbe sempre — cioe' non sarebbe un cancello.
 */
const spento = await pg.evaluate(() => {
  const b = document.querySelector('#stab-salone')
  if (!b) return false
  b.click()
  return true
})
if (!spento) {
  console.error('  ROTTO  non trovo #stab-salone: il capitolo non ha piu\' il suo interruttore')
  await browser.close(); preview?.kill(); process.exit(1)
}
await pg.waitForTimeout(2000)

const traccia = []
for (let i = 0; i < Math.round(SECONDI * 1000 / PASSO); i++) {
  traccia.push(await pg.evaluate(() => {
    const p = document.querySelector('.palco--salone')
    return { q: parseFloat(p?.dataset.posa ?? 'NaN'), r: parseFloat(p?.dataset.rollio ?? 'NaN') }
  }))
  await pg.waitForTimeout(PASSO)
}
await browser.close()
preview?.kill()

/** Un campione non letto e' un cancello che passa per sbaglio: si controlla. */
if (traccia.some(c => !Number.isFinite(c.r))) {
  console.error('  ROTTO  il rollio non arriva nel dataset del palco.')
  process.exit(1)
}

/**
 * ─── LA SECONDA POSA PUO' NON ESSERCI ANCORA, e va detto invece di far finta
 *
 * Il capitolo e' passato a UNA clip sola, disegnata due volte: il mare fermo e
 * la stanza che ruota. Finche' la clip della posa puntellata non esiste non c'e'
 * nessuna dissolvenza da misurare — quindi il pezzo che conta i fotogrammi
 * ambigui resta fermo, e il cancello lo DICHIARA.
 *
 * Quello che continua a verificare, e che deve valere comunque: che la stanza
 * rolli davvero. Un capitolo che dichiara di inclinarsi e sta fermo e' il
 * difetto peggiore, ed e' gia' successo due volte.
 */
const conPosa = traccia.every(c => Number.isFinite(c.q))
const ampiezza = Math.max(...traccia.map(c => Math.abs(c.r)))
if (ampiezza < 4) {
  console.error(`  ROTTO  la stanza non rolla (massimo ${ampiezza.toFixed(1)}°): non c'e' niente da misurare.`)
  process.exit(1)
}

if (!conPosa) {
  console.log('  la seconda posa non e ancora montata: niente dissolvenza da misurare.')
  console.log('  (il conto dei fotogrammi ambigui torna vivo da solo quando ci sara.)')
  console.log('  rollio in ordine.')
  process.exit(0)
}

const ambigui = traccia.filter(c => c.q > 0.2 && c.q < 0.8).length
const frazione = ambigui / traccia.length

/** Un ritorno alla calma e' un fronte di discesa sotto 0,1 dopo essere stati sopra 0,9. */
let alta = false, ritorni = 0
for (const c of traccia) {
  if (c.q > 0.9) alta = true
  else if (alta && c.q < 0.1) { alta = false; ritorni++ }
}

const disegno = traccia.map(c => c.q > 0.8 ? 'T' : c.q < 0.2 ? '.' : '-').join('')
console.log(`  ampiezza ${ampiezza.toFixed(1)}° · ${SECONDI}s campionati ogni ${PASSO}ms`)
console.log(`  ${disegno}`)
console.log(`  finestra ambigua ${(100 * frazione).toFixed(1)}% (tetto ${(100 * AMBIGUA).toFixed(0)}%) · ritorni alla calma ${ritorni} (tetto ${RITORNI})`)

let rotto = false
if (frazione > AMBIGUA) {
  console.error(`  ROTTO  le due pose convivono per il ${(100 * frazione).toFixed(1)}% del tempo: a schermo sono quattro persone.`)
  rotto = true
}
if (ritorni > RITORNI) {
  console.error(`  ROTTO  ${ritorni} ritorni alla calma mentre la stanza rolla: le pose lampeggiano.`)
  rotto = true
}
if (rotto) process.exit(1)
console.log('  posa in ordine.')
