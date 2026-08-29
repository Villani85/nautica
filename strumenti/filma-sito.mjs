/**
 * FILMA IL SITO — una corsa intera, per guardarla invece di descriverla.
 *
 *     node strumenti/filma-sito.mjs
 *     SECONDI=90 LARGHEZZA=1440 ALTEZZA=900 node strumenti/filma-sito.mjs
 *
 * ─── NON E' UN CANCELLO, ed e' importante che si sappia
 *
 * Non misura niente e non puo' fallire: serve a mettere la corsa davanti agli
 * occhi di qualcuno. `docs/13` §5 dice che il finale «si sceglie guardando», e
 * per guardare serve un filmato, non quattro fotogrammi presi dove ho deciso
 * io -- che e' esattamente il modo di non vedere quello che non mi aspetto.
 *
 * ─── LO SCORRIMENTO E' A VELOCITA' COSTANTE, e non e' pigrizia
 *
 * Una persona vera scorre a scatti, si ferma, torna indietro. Riprodurre quel
 * gesto qui sarebbe inventare una cinematica che non e' di nessuno. A velocita'
 * costante il filmato non dice «cosi' si usa il sito»: dice «questo c'e' dentro,
 * in quest'ordine», che e' l'unica cosa che un provino puo' dire onestamente.
 *
 * L'ultimo tratto pero' RALLENTA, e quello ha una ragione misurata: la
 * traversata dura dieci secondi e ha un suo tempo -- passarci sopra a velocita'
 * piena la taglierebbe a meta' e il filmato mostrerebbe uno stacco che nel sito
 * non c'e'.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, renameSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const PORTA = process.env.PORTA_COLLAUDO || 5281
const L = Number(process.env.LARGHEZZA || 1440)
const A = Number(process.env.ALTEZZA || 900)
const SECONDI = Number(process.env.SECONDI || 80)
const FUORI = process.env.FUORI || 'uscite/filmato'

/**
 * `URL_SITO` filma un indirizzo gia' online invece della build locale.
 *
 * Serve per la ragione detta piu' volte oggi: un video della build locale
 * mostra qualcosa che nessuno puo' aprire. Quando il sito e' pubblicato, il
 * provino va girato SU QUELLO -- e' l'unica versione che un giurato vedrebbe.
 *
 *     URL_SITO=https://villani85.github.io/nautica/ node strumenti/filma-sito.mjs
 */
const URL_SITO = process.env.URL_SITO || null

mkdirSync(FUORI, { recursive: true })
const preview = URL_SITO
  ? null
  : spawn('npx', ['vite', 'preview', '--port', PORTA, '--strictPort'], { shell: true, stdio: 'ignore' })

/**
 * Il browser e' quello COMPLETO con la GPU, non `chrome-headless-shell`: quello
 * non ha lo stack grafico e disegnerebbe la scena in software, cioe' un altro
 * sito. La ragione per esteso sta in `strumenti/browser.mjs`, e qui va ripetuta
 * perche' un filmato girato in software sembra vero e non lo e'.
 */
const browser = await chromium.launch({
  channel: 'chromium',
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars']
})
const contesto = await browser.newContext({
  viewport: { width: L, height: A },
  recordVideo: { dir: FUORI, size: { width: L, height: A } }
})
const pg = await contesto.newPage()
await pg.goto(URL_SITO || `http://localhost:${PORTA}/nautica/`, { waitUntil: 'load' })

/* si aspetta che la scena esista davvero prima di partire: filmare il
   caricamento vorrebbe dire consegnare un provino in cui il sito e' vuoto */
await pg.waitForFunction(() => document.querySelector('#scena canvas'), null, { timeout: 60000 }).catch(() => {})
await pg.waitForTimeout(4000)

const t0 = Date.now()
const durata = SECONDI * 1000
/**
 * La curva della corsa: lineare fino all'88%, poi molto piu' lenta. L'ultimo
 * tratto contiene la sezione verticale e la traversata, che insieme durano piu'
 * di quanto duri scorrerli.
 */
while (Date.now() - t0 < durata) {
  const u = (Date.now() - t0) / durata
  const p = u < 0.72 ? u * 1.22 : 0.88 + (u - 0.72) * 0.43
  await pg.evaluate((q) => {
    const h = document.documentElement.scrollHeight - innerHeight
    scrollTo(0, h * Math.min(1, q))
  }, p)
  await pg.waitForTimeout(60)
}
/* qualche secondo fermi sul finale: e' li' che il filmato consegna alle persone */
await pg.waitForTimeout(6000)

await contesto.close()
await browser.close()
preview?.kill()

const nato = readdirSync(FUORI).filter(f => f.endsWith('.webm')).sort().pop()
if (nato) {
  const finale = join(FUORI, `sito-${L}x${A}.webm`)
  renameSync(join(FUORI, nato), finale)
  console.log(`  scritto ${finale}`)
} else {
  console.error('  nessun filmato prodotto: il contesto non ha registrato niente')
  process.exit(1)
}
