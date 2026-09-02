/**
 * FILMA L'ATTO DUE — la corsa in cui qualcuno ACCETTA l'invito.
 *
 *     node strumenti/filma-atto-due.mjs
 *     PORTA_COLLAUDO=6377 node strumenti/filma-atto-due.mjs
 *     URL_SITO=https://villani85.github.io/nautica/ node strumenti/filma-atto-due.mjs
 *
 * ─── PERCHE' ESISTE ACCANTO A `filma-sito.mjs`, E NON AL SUO POSTO
 *
 * `filma-sito` scorre a velocita' costante e non tocca niente, e ha ragione a
 * farlo: *«riprodurre il gesto di una persona vera sarebbe inventare una
 * cinematica che non e' di nessuno»*. Quel filmato dice «questo c'e' dentro, in
 * quest'ordine», che e' l'unica cosa che un provino puo' dire onestamente.
 *
 * Ma su questo sito quella onesta' ha un buco, e una revisione esterna l'ha
 * trovato guardando proprio uno di quei filmati: a 48 secondi compariva «Switch
 * propulsion off» e **non veniva seguito**, la velocita' restava a 12,0 kn, e la
 * regia proseguiva verso il finale. Conclusione della revisione: *«l'atto due
 * esisteva nel codice senza essere vissuto»*.
 *
 * Il punto e' che l'atto due **non e' una cosa che accade: e' una cosa che si
 * fa**. Un filmato che non tocca niente non lo mostra perche' non c'e', non
 * perche' sia rotto. Filmare solo cosi' vuol dire consegnare a chi giudica un
 * sito che non dimostra la cosa per cui esiste.
 *
 * ─── QUESTO FILMATO INVENTA UN GESTO, E LO DICHIARA
 *
 * Due clic: propulsione, poi giroscopio. Non sono «come si usa il sito» -- sono
 * il percorso che la direzione descrive, eseguito perche' si possa guardare.
 * Chi lo mostra deve dirlo, come si dice «tempo dimostrativo accelerato».
 *
 * ─── E LE ATTESE SONO IN SECONDI DI OROLOGIO, non a passo dichiarato
 *
 * Al contrario dei cancelli, qui l'orologio E' la cosa da misurare: un filmato
 * serve a vedere quanto ci mette. Per questo gira sul browser con la GPU vera
 * (`--enable-gpu`), dove il tempo simulato scorre come quello reale; su un
 * rasterizzatore software mostrerebbe una nave che rallenta al ralenti e
 * sarebbe un provino di un sito che non esiste.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, renameSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const PORTA = process.env.PORTA_COLLAUDO || 5282
const L = Number(process.env.LARGHEZZA || 1440)
const A = Number(process.env.ALTEZZA || 900)
const FUORI = process.env.FUORI || 'uscite/filmato-atto-due'
const URL_SITO = process.env.URL_SITO || null

mkdirSync(FUORI, { recursive: true })
const preview = URL_SITO
  ? null
  : spawn('npx', ['vite', 'preview', '--port', PORTA, '--strictPort'], { shell: true, stdio: 'ignore' })

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
await pg.waitForFunction(() => document.querySelector('#scena canvas'), null, { timeout: 60000 }).catch(() => {})
await pg.waitForTimeout(4000)

const dice = (m) => { console.log(m); }
const leggi = () => pg.evaluate(() => {
  const b = document.querySelector('.nudge')
  const S = window.__nautica?.stato
  return {
    bolla: b?.dataset.visibile === 'si' ? (b.textContent || '').trim() : null,
    v: S ? +S.velocita.toFixed(2) : null,
    rms: S && Number.isFinite(S.rollioRms) ? +S.rollioRms.toFixed(2) : null,
    battuta: document.querySelector('#dimostrazione .palco')?.dataset.battuta || ''
  }
})

/** Porta la corsa a una frazione, dolcemente: uno scatto secco stacca. */
async function scorriA (meta, secondi) {
  const da = await pg.evaluate(() => scrollY / (document.documentElement.scrollHeight - innerHeight))
  const passi = Math.max(1, Math.round(secondi * 1000 / 60))
  for (let i = 1; i <= passi; i++) {
    const u = i / passi
    /* addolcimento: parte e arriva senza spigolo, come `dolce()` in regia.js */
    const e = u * u * (3 - 2 * u)
    await pg.evaluate((q) => {
      const h = document.documentElement.scrollHeight - innerHeight
      scrollTo(0, h * q)
    }, da + (meta - da) * e)
    await pg.waitForTimeout(60)
  }
}

/** Guarda per N secondi stampando cosa succede: e' il referto del filmato. */
async function guarda (secondi, etichetta) {
  const t0 = Date.now()
  let ultima = null
  while (Date.now() - t0 < secondi * 1000) {
    await pg.waitForTimeout(400)
    const s = await leggi()
    if (s.bolla && s.bolla !== ultima) {
      dice(`  ${((Date.now() - t0) / 1000).toFixed(1).padStart(5)} s  ${String(s.v).padStart(5)} kn  ` +
           `rms ${String(s.rms).padStart(5)}  "${s.bolla}"`)
      ultima = s.bolla
    }
    if (!s.bolla) ultima = null
  }
  const f = await leggi()
  dice(`  [${etichetta}] alla fine: ${f.v} kn, rms ${f.rms}, battuta ${f.battuta}`)
}

dice('\n1 · l\'apertura e il salone')
await scorriA(0.26, 14)

dice('\n2 · la nave emerge, il mare sale, la sezione si apre')
await scorriA(0.80, 22)

dice('\n3 · il primo piano del meccanismo')
await scorriA(0.86, 6)
await pg.waitForTimeout(3000)

dice('\n4 · SI SPEGNE LA PROPULSIONE — da qui il gesto e\' inventato, e si dichiara')
await pg.click('#propulsione', { noWaitAfter: true }).catch(() => {})
await guarda(20, 'dopo lo spegnimento')

dice('\n5 · SI ACCENDE IL GIROSCOPIO')
await pg.click('#giroscopio', { noWaitAfter: true }).catch(() => {})
await guarda(14, 'col rotore che sale')

dice('\n6 · il finale, e il ritorno alle persone')
await scorriA(1.0, 16)
await pg.waitForTimeout(7000)

await contesto.close()
await browser.close()
preview?.kill()

/* il PIU' RECENTE, non l'ultimo in alfabeto: stessa trappola gia' pagata in
   `filma-sito.mjs`, dove un provino vecchio gia' rinominato veniva riconsegnato */
const nato = readdirSync(FUORI).filter(f => f.endsWith('.webm'))
  .map(f => ({ f, t: statSync(join(FUORI, f)).mtimeMs }))
  .sort((a, b) => b.t - a.t)[0]?.f
if (nato) {
  const finale = join(FUORI, `atto-due-${L}x${A}.webm`)
  renameSync(join(FUORI, nato), finale)
  console.log(`\n  scritto ${finale}`)
} else {
  console.error('  nessun filmato prodotto: il contesto non ha registrato niente')
  process.exit(1)
}
