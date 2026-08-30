/**
 * FILMA LO SCAFO — il tratto in cui la nave e' il soggetto, lento.
 *
 *     node strumenti/filma-scafo.mjs
 *
 * E' la parte di cui si sta discutendo la resa: murata, coperta, sovrastruttura
 * e la luce che ci cade sopra. `filma-sito` ci passa dentro a velocita'
 * costante e non basta per giudicare una superficie; qui si va piano e ci si
 * FERMA, perche' una carena si giudica guardando come le corre addosso un
 * riflesso, non attraversandola.
 *
 * Gira intorno alla nave col trascinamento vero, come farebbe una persona: e'
 * l'unico modo di far correre la luce lungo la fiancata.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, renameSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const PORTA = process.env.PORTA_COLLAUDO || 5285
const L = Number(process.env.LARGHEZZA || 1280)
const A = Number(process.env.ALTEZZA || 720)
const FUORI = process.env.FUORI || 'uscite/filmato-scafo'

mkdirSync(FUORI, { recursive: true })
const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
for (let i = 0; i < 60; i++) {
  try { await fetch(`http://localhost:${PORTA}/`, { redirect: 'manual' }); break } catch {}
  await new Promise(r => setTimeout(r, 500))
}

const browser = await chromium.launch({
  channel: 'chromium',
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars']
})
const contesto = await browser.newContext({
  viewport: { width: L, height: A },
  recordVideo: { dir: FUORI, size: { width: L, height: A } }
})
const pg = await contesto.newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1&senzaFilmato=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
await pg.waitForTimeout(3500)

const dice = (m) => console.log(m)
async function vaiA (q, secondi) {
  const da = await pg.evaluate(() => window.scrollY)
  const a = await pg.evaluate((qq) => {
    const n = window.__nautica
    return n.cimaSezione + qq * n.corsaRacconto
  }, q)
  const passi = Math.max(1, Math.round(secondi * 1000 / 60))
  for (let i = 1; i <= passi; i++) {
    const u = i / passi
    const e = u * u * (3 - 2 * u)
    await pg.evaluate((y) => window.scrollTo(0, y), da + (a - da) * e)
    await pg.waitForTimeout(60)
  }
  await pg.waitForTimeout(600)
}

/** Un giro col trascinamento vero: e' la luce che deve correre, non la nave. */
async function gira (gradi, secondi) {
  const c = await pg.evaluate(() => {
    const r = document.querySelector('#scena canvas').getBoundingClientRect()
    return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height * 0.58)]
  })
  const passi = Math.max(1, Math.round(secondi * 1000 / 55))
  const dx = gradi / passi
  await pg.mouse.move(c[0], c[1])
  await pg.mouse.down()
  for (let i = 1; i <= passi; i++) {
    await pg.mouse.move(c[0] + dx * i, c[1])
    await pg.waitForTimeout(55)
  }
  await pg.mouse.up()
  await pg.waitForTimeout(700)
}

dice('\n1 · la nave esce dall\'acqua')
await vaiA(0.16, 7)
await pg.waitForTimeout(2500)

dice('2 · la si guarda ferma, poi le si gira intorno')
await vaiA(0.30, 6)
await pg.waitForTimeout(2000)
await gira(-260, 6)
await pg.waitForTimeout(1500)
await gira(320, 7)
await pg.waitForTimeout(2000)

dice('3 · il mare cresce sotto lo scafo')
await pg.evaluate(() => { window.__nautica.stato.mare = 5 })
await pg.waitForTimeout(6000)

dice('4 · e il taglio entra: si vede la coperta dall\'alto e la murata in sezione')
await vaiA(0.55, 8)
await pg.waitForTimeout(2500)
await vaiA(0.72, 8)
await pg.waitForTimeout(3000)

dice('5 · fin sotto, dove la carena incontra l\'acqua')
await vaiA(0.86, 8)
await pg.waitForTimeout(3500)

await pg.waitForTimeout(1200)
await contesto.close()
await browser.close()
preview.kill()

const vid = readdirSync(FUORI).filter(f => f.endsWith('.webm'))
if (vid.length) {
  const dest = join(FUORI, `scafo-${L}x${A}.webm`)
  renameSync(join(FUORI, vid[0]), dest)
  dice(`\n  scritto ${dest}`)
}
