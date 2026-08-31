import { apriBrowser } from './browser.mjs'
const BASE = 'http://localhost:4173/nautica/'
const browser = await apriBrowser({ conGpu: true })
const pg = await browser.newPage()
await pg.setViewportSize({ width: 1280, height: 800 })
await pg.goto(BASE + '?ispeziona=1', { waitUntil: 'load', timeout: 45000 })
await pg.waitForFunction(() => window.__nautica?.stato, null, { timeout: 30000 })
await pg.waitForTimeout(500)
console.log('senza scroll:', await pg.evaluate(() => ({ p: window.__nautica.p, mare: window.__nautica.stato.mare })))

for (const p of [0.005, 0.30, 0.32, 0.34, 0.36]) {
  await pg.evaluate((pp) => { const n = window.__nautica; scrollTo(0, n.cimaSezione + pp * n.corsaRacconto) }, p)
  await pg.waitForFunction((pp) => Math.abs((window.__nautica.p ?? -1) - pp) < 0.003, p, { timeout: 8000 }).catch(() => {})
  await pg.waitForTimeout(1200)
  console.log(p, '->', await pg.evaluate(() => ({ p: +window.__nautica.p.toFixed(3), mare: window.__nautica.stato.mare })))
}
await browser.close()
