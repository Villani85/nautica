import { chromium } from 'playwright-core'
/* la finestra si legge dal sito, non da regia.js: qui si chiede s, non p */
/* la porta e l'indirizzo si possono dare da fuori: qui c'e' l'anteprima che
   tengo aperta mentre lavoro, ma un cancello ne accende una sua */
const PORTA = Number(process.env.PORTA || 5287)
const INDIRIZZO = process.env.INDIRIZZO || `http://localhost:${PORTA}/nautica/`
const S_VOLUTI = (process.env.S || '0.02,0.15,0.30,0.45,0.60,0.75,0.90').split(',').map(Number)
const FUORI = process.env.FUORI
const browser = await chromium.launch({ channel: 'chromium', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] })
/* `LARGO`/`ALTO`: la traversata va guardata anche su un telefono, dove il
   rapporto del quadro cambia tutto -- la lente, la proiezione sul guscio e
   quanto locale ci sta dentro */
const pg = await browser.newPage({
  viewport: { width: Number(process.env.LARGO || 1440), height: Number(process.env.ALTO || 900) }
})
await pg.goto(`${INDIRIZZO}?ispeziona=1${process.env.PARAMETRI ? '&' + process.env.PARAMETRI : ''}`, { waitUntil: 'load' })
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
  /**
   * ─── E SE SI CHIEDE, I FILMATI SI INCHIODANO
   *
   * `FERMA_VIDEO=1` mette in pausa ogni `<video>` e lo porta allo stesso
   * istante. Serve ai cancelli che confrontano due scatti: senza, fra una
   * presa e l'altra il filmato del salone avanza e il fondo di rumore sale da
   * 2 a 26 livelli -- cioe' il metro comincia a misurare il film invece della
   * cosa che gli si e' chiesta. Con il fermo, i due scatti mostrano lo stesso
   * fotogramma.
   */
  if (process.env.FERMA_VIDEO === '1') {
    await pg.evaluate(async () => {
      for (const v of document.querySelectorAll('video')) {
        try {
          v.pause()
          if (v.readyState >= 1 && Number.isFinite(v.duration)) v.currentTime = Math.min(0.5, v.duration * 0.1)
        } catch { /* un video che non si lascia fermare non ferma lo scatto */ }
      }
      await new Promise(r => setTimeout(r, 500))
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    })
  }
  await pg.waitForTimeout(900)
  const nome = `${FUORI}/s-${s.toFixed(2)}.jpg`
  await pg.screenshot({ path: nome, type: 'jpeg', quality: 85 })
  console.log(nome, JSON.stringify(info))
}
await browser.close()
