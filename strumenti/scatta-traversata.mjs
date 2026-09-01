import { chromium } from 'playwright-core'
/* la finestra si legge dal sito, non da regia.js: qui si chiede s, non p */
const PORTA = 5287
const S_VOLUTI = (process.env.S || '0.02,0.15,0.30,0.45,0.60,0.75,0.90').split(',').map(Number)
const FUORI = process.env.FUORI
const browser = await chromium.launch({ channel: 'chromium', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] })
const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await pg.goto(`http://localhost:${PORTA}/nautica/?ispeziona=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => window.__nautica?.mondo()?.ancorato === true, null, { timeout: 120000 })
for (const s of S_VOLUTI) {
  const info = await pg.evaluate(async (s) => {
    const n = window.__nautica
    let lo = n.cimaSezione + n.corsaRacconto * 0.90, hi = n.cimaSezione + n.corsaRacconto + n.coda * 0.2
    const leggi = async (y) => { scrollTo(0, Math.round(y)); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return n.corsaTraversata() }
    for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; const v = await leggi(m); if (v < s) lo = m; else hi = m }
    const v = await leggi((lo + hi) / 2)
    return { s: v, p: n.p, pCoda: n.pCoda, y: Math.round((lo + hi) / 2) }
  }, s)
  await pg.waitForTimeout(900)
  const nome = `${FUORI}/s-${s.toFixed(2)}.jpg`
  await pg.screenshot({ path: nome, type: 'jpeg', quality: 85 })
  console.log(nome, JSON.stringify(info))
}
await browser.close()
