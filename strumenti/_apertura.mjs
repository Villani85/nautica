import { apriBrowser } from './browser.mjs'
const b = await apriBrowser({ conGpu: true })
const pg = await b.newPage()
await pg.setViewportSize({ width: 1440, height: 900 })
await pg.goto('http://localhost:4173/?ispeziona=1', { waitUntil: 'load' })
await pg.waitForFunction(() => window.__nautica?.corsaRacconto > 0, null, { timeout: 30000 })
for (let P = 0.60; P <= 0.97; P += 0.03) {
  await pg.evaluate((p) => scrollTo(0, window.__nautica.cimaSezione + window.__nautica.corsaRacconto * p), P)
  await pg.waitForTimeout(900)
  const a = await pg.evaluate(() => {
    const r = document.getElementById('richiami'); return { ap: +r.dataset.apertura, batt: document.querySelector('.palco').dataset.battuta, on: r.dataset.attivi || document.querySelector('.palco').dataset.richiami }
  })
  console.log(`p=${P.toFixed(2)}  ${a.batt.padEnd(11)}  apertura ${(a.ap * 100).toFixed(1)}%   accesi:${a.on}`)
}
await b.close()
