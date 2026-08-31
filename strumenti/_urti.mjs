import { apriBrowser } from './browser.mjs'
const b = await apriBrowser({ conGpu: true })
const pg = await b.newPage()
await pg.setViewportSize({ width: 1440, height: 900 })
await pg.goto('http://localhost:4173/?ispeziona=1', { waitUntil: 'load' })
await pg.waitForFunction(() => window.__nautica?.corsaRacconto > 0, null, { timeout: 30000 })
await pg.evaluate(() => scrollTo(0, window.__nautica.cimaSezione + window.__nautica.corsaRacconto * 0.93))
await pg.waitForTimeout(2500)
console.log(await pg.evaluate(() => {
  const box = (e) => { const r = e.getBoundingClientRect(); return { s: e.className || e.id, x: r.left, y: r.top, x2: r.right, y2: r.bottom, op: +getComputedStyle(e).opacity } }
  const voci = [...document.querySelectorAll('.richiami__voce')].map(box)
  const altri = ['#patto', '.pannello--letture', '.pannello--energia', '.comandi', '#battuta'].map(s => document.querySelector(s)).filter(Boolean).map(box)
  const out = []
  for (const v of voci) for (const a of altri) {
    if (a.op < 0.06) continue
    const dx = Math.min(v.x2, a.x2) - Math.max(v.x, a.x), dy = Math.min(v.y2, a.y2) - Math.max(v.y, a.y)
    if (dx > 0 && dy > 0) out.push(`URTO ${Math.round(dx)}x${Math.round(dy)} px fra un richiamo e ${a.s}`)
  }
  return out.length ? out.join('\n') : 'nessun urto fra i richiami e il resto dell\'interfaccia'
}))
await pg.screenshot({ path: 'uscite/richiami-finale.png' })
await b.close()
