import { apriBrowser } from './browser.mjs'
const BASE = 'http://localhost:4173/nautica/'
const browser = await apriBrowser({ conGpu: true })
const pg = await browser.newPage()
await pg.setViewportSize({ width: 1280, height: 800 })
await pg.goto(BASE + '?ispeziona=1', { waitUntil: 'load', timeout: 45000 })
await pg.waitForFunction(() => window.__nautica?.stato, null, { timeout: 30000 })

for (const p of [0.20, 0.30, 0.45, 0.55]) {
  await pg.evaluate((pp) => { const n = window.__nautica; scrollTo(0, n.cimaSezione + pp * n.corsaRacconto) }, p)
  await pg.waitForFunction((pp) => Math.abs((window.__nautica.p ?? -1) - pp) < 0.003, p, { timeout: 8000 }).catch(() => {})
  await pg.waitForTimeout(500)
  const info = await pg.evaluate(() => ({ p: window.__nautica.p, mare: window.__nautica.stato.mare, frame: window.__nautica.fotogrammi }))
  console.log('p target', p, '->', info)
  for (const v of [0.2, 0.35, 0.5, 0.65, 0.8]) {
    const row = []
    for (const u of [0.06, 0.2, 0.35, 0.5, 0.65, 0.8, 0.94]) {
      const r = await pg.evaluate(([u, v]) => {
        const res = window.__nautica.chi(u, v, { quante: 1 })
        if (!res.length) return 'cielo'
        return res[0].materiale + '/' + res[0].nome
      }, [u, v])
      row.push(`u${u}:${r}`)
    }
    console.log('  v', v, row.join('  '))
  }
}
await browser.close()
