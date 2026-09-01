/**
 * FILMA SOLO LA TRAVERSATA — dal meccanismo all'arrivo nel salone.
 *
 *     node strumenti/filma-traversata.mjs
 *     SECONDI=30 LARGHEZZA=1920 ALTEZZA=1080 node strumenti/filma-traversata.mjs
 *
 * ─── PERCHE' NON BASTA `filma-sito`
 *
 * Quella percorre tutto il racconto a velocita' costante: la traversata sono
 * sette centesimi di pagina, cioe' cinque o sei secondi su un filmato di due
 * minuti, e per guardarli bisogna cercarli. Chi vuole giudicare la traversata
 * deve vederla sola e lenta.
 *
 * ─── LA FINESTRA SI LEGGE, NON SI SCEGLIE
 *
 * `regia.js` la dichiara: `traversata: [0.93, 1.00]`. Ricopiarla qui sarebbe la
 * copia che un giorno diverge -- il difetto che questo repo ha gia' pagato piu'
 * volte. Si legge da li'.
 *
 * E si comincia POCO PRIMA e si finisce DENTRO LA CODA, perche' una traversata
 * si giudica anche da come ci si entra e da come si arriva: partire al 93%
 * esatto vorrebbe dire cominciare a camera gia' in moto, e fermarsi a p=1
 * taglierebbe via il salone, che e' l'arrivo.
 *
 * ─── LA VELOCITA' E' COSTANTE, e non e' pigrizia
 *
 * Una persona vera scorre a scatti. Riprodurre quel gesto sarebbe inventare una
 * cinematica che non e' di nessuno. A velocita' costante il filmato non dice
 * «cosi' si usa», dice «questo c'e' dentro, in quest'ordine» -- che e' l'unica
 * cosa che un provino puo' dire onestamente.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { S } from '../src/regia.js'

const PORTA = process.env.PORTA_COLLAUDO || 5287
const L = Number(process.env.LARGHEZZA || 1440)
const A = Number(process.env.ALTEZZA || 900)
const SECONDI = Number(process.env.SECONDI || 26)
const FUORI = process.env.FUORI || 'uscite/traversata'

/** Quanto si parte prima della finestra, in unita' di `p`. */
const ANTICIPO = 0.012
/** Quanta coda si filma dopo l'arrivo, in unita' di `pCoda`. */
const CODA = 0.45

mkdirSync(FUORI, { recursive: true })
const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
for (let i = 0; i < 60; i++) {
  try { await fetch(`http://localhost:${PORTA}/`, { redirect: 'manual' }); break } catch { /* non ancora */ }
  await new Promise((r) => setTimeout(r, 500))
}

/* il video comincia quando nasce il contesto, non quando comincia la corsa:
   i primi secondi sono caricamento e assestamento. Si segna quando nasce, e
   alla fine si scrive lo SCARTO fino all'inizio della corsa, cosi' chi taglia
   il provino taglia un numero misurato e non a occhio. */
const nascita = Date.now()
const browser = await chromium.launch({
  channel: 'chromium',
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars']
})
const contesto = await browser.newContext({
  viewport: { width: L, height: A },
  recordVideo: { dir: FUORI, size: { width: L, height: A } }
})
const pg = await contesto.newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1`, { waitUntil: 'load' })

/* si aspetta un FATTO: il mondo ancorato, non un tempo. Filmare prima
   vorrebbe dire riprendere la traversata senza la traversata. */
await pg.waitForFunction(() => window.__nautica?.mondo()?.ancorato === true, null, { timeout: 120000 })
  .catch(() => { console.log('  ATTENZIONE: il mondo non si e ancorato — filmo lo stesso, ma non e la traversata 3D') })

const da = Math.max(0, S.traversata[0] - ANTICIPO)
console.log(`  finestra letta da regia.js: p da ${da.toFixed(3)} a 1, piu ${CODA} di coda`)
console.log(`  ${SECONDI} s a velocita costante, ${L}x${A}`)

/* ci si porta all'inizio e si aspetta che la scena si sia assestata: la prima
   inquadratura del provino non deve mostrare un transitorio */
await pg.evaluate((q) => {
  const n = window.__nautica
  scrollTo(0, Math.round(n.cimaSezione + n.corsaRacconto * q))
}, da)
await pg.waitForTimeout(2500)

const t0 = Date.now()
const durata = SECONDI * 1000
while (Date.now() - t0 < durata) {
  const f = (Date.now() - t0) / durata
  await pg.evaluate(([qDa, frazione, coda]) => {
    const n = window.__nautica
    const fineRacconto = n.cimaSezione + n.corsaRacconto
    const inizio = n.cimaSezione + n.corsaRacconto * qDa
    /* la corsa filmata: dall'inizio della finestra fino dentro la coda */
    const fine = fineRacconto + n.coda * coda
    scrollTo(0, Math.round(inizio + (fine - inizio) * frazione))
  }, [da, f, CODA])
  await pg.waitForTimeout(16)
}
await pg.waitForTimeout(1200)

/* IL FILE VERO, non «l'ultimo in ordine alfabetico». La prima versione
   prendeva l'ultimo `.webm` della cartella ordinata per nome: Playwright
   scrive `page@<hex>.webm`, e `traversata-1440x900.webm` -- il provino
   PRECEDENTE -- viene dopo, perche' 't' > 'p'. Il vecchio veniva rinominato su
   se stesso e il nuovo restava li' col nome casuale: ho giudicato due volte il
   provino di prima credendo di guardare il nuovo. Il percorso lo sa la pagina. */
const percorsoVideo = await pg.video()?.path()
await contesto.close()
await browser.close()
try { preview.kill() } catch { /* gia' morto */ }

if (percorsoVideo) {
  const nome = `traversata-${L}x${A}.webm`
  renameSync(percorsoVideo, join(FUORI, nome))
  const scarto = +((t0 - nascita) / 1000).toFixed(2)
  writeFileSync(join(FUORI, `traversata-${L}x${A}.json`), JSON.stringify({ scarto_s: scarto, corsa_s: SECONDI, da, coda: CODA }, null, 1))
  console.log(`  scritto ${join(FUORI, nome)}  (la corsa comincia a ${scarto} s: tagliare da li')`)
}
