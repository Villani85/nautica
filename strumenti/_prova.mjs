import { apriBrowser } from './browser.mjs'
const b = await apriBrowser({ conGpu: true })
const pg = await b.newPage()
await pg.setViewportSize({ width: 1440, height: 900 })
await pg.goto('http://localhost:4173/?ispeziona=1', { waitUntil: 'load' })
await pg.waitForFunction(() => window.__nautica?.corsaRacconto > 0, null, { timeout: 30000 })
for (const P of [0.90, 0.93, 0.96]) {
  await pg.evaluate((p) => scrollTo(0, window.__nautica.cimaSezione + window.__nautica.corsaRacconto * p), P)
  await pg.waitForTimeout(2200)
  const st = await pg.evaluate(() => {
    const v = [...document.querySelectorAll('.richiami__voce')].map(e =>
      e.dataset.acceso + ':' + e.querySelector('b').textContent)
    return { battuta: document.querySelector('.palco').dataset.battuta,
             op: getComputedStyle(document.getElementById('richiami')).opacity, voci: v.join(' | ') }
  })
  console.log(`p=${P}  battuta=${st.battuta}  opacita=${st.op}  ${st.voci}`)
  await pg.screenshot({ path: `uscite/richiami-p${Math.round(P*100)}.png` })
}
await b.close()
