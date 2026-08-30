/* DIAGNOSI (sola lettura): quali <video> ci sono, e quali avanzano davvero. */
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'

const PORTA = Number(process.env.PORTA_COLLAUDO || 6555)
const BASE = `http://localhost:${PORTA}/nautica/`

async function serviteci () {
  try { const r = await fetch(BASE, { redirect: 'manual' }); if (r.status < 500) return null } catch {}
  const s = spawn('npm', ['run', 'preview', '--', '--port', String(PORTA)], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    try { await fetch(BASE, { redirect: 'manual' }); return s } catch {}
    await new Promise(r => setTimeout(r, 500))
  }
  s.kill(); process.exit(2)
}

const pv = await serviteci()
const b = await apriBrowser({ conGpu: true })
const pg = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage()
await pg.goto(BASE, { waitUntil: 'load' })
await pg.waitForTimeout(2500)
await pg.evaluate(() => {
  const h = document.documentElement.scrollHeight - innerHeight
  scrollTo(0, h * 0.215)
})
await pg.waitForTimeout(4000)

const uno = await pg.evaluate(() => [...document.querySelectorAll('video')].map(v => ({
  src: (v.currentSrc || v.src || '').split('/').pop(),
  t: +v.currentTime.toFixed(3), pausa: v.paused, pronto: v.readyState, durata: +(v.duration || 0).toFixed(2)
})))
await pg.waitForTimeout(2000)
const due = await pg.evaluate(() => [...document.querySelectorAll('video')].map(v => +v.currentTime.toFixed(3)))

console.log('\n  ordine nel DOM · sorgente · avanzamento in 2 s · in pausa · readyState')
uno.forEach((v, i) => {
  const d = (due[i] - v.t + (v.durata || 1)) % (v.durata || 1)
  console.log(`  ${i}  ${String(v.src).padEnd(24)} +${d.toFixed(3)}s  pausa=${v.pausa}  ready=${v.pronto}  durata=${v.durata}`)
})
await b.close(); pv?.kill(); process.exit(0)
