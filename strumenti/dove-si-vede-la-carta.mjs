/**
 * DOVE SI VEDE CHE IL SALONE E' UNA CARTA.
 *
 *     node strumenti/dove-si-vede-la-carta.mjs
 *     DA=0.115 A=0.25 node strumenti/dove-si-vede-la-carta.mjs
 *
 * ─── NON E' UN CANCELLO, e la distinzione conta
 *
 * Non misura e non puo' fallire. Scorre un tratto della corsa, scrive un
 * fotogramma per campione e stampa battuta e nudge acceso. Serve a GUARDARE un
 * difetto che nessun numero di questo repo sa vedere.
 *
 * ─── Il difetto che l'ha fatto nascere
 *
 * Una revisione ha detto che fra il 36esimo e il 42esimo secondo «si vede
 * fisicamente che il salone e' un piano: ruotando compaiono zone bianche
 * intorno al rettangolo, il bordo destro appare come il margine di una
 * scheda». Verificato: a scorrimento 0,235 la stanza e' un rettangolo con
 * quattro bordi netti che galleggia contro lo scafo.
 *
 * Non e' una novita' architettonica -- `salone3d.js` dichiara da sempre che la
 * stanza e' una clip mascherata e non una stanza modellata. La novita' e' che
 * adesso il trucco si VEDE, e quando si vede lo spettatore smette di credere
 * allo spazio. Questo strumento serve a rivederlo dopo ogni tentativo di cura,
 * perche' la cura (guscio 3D e proiezione dalla camera sorgente) si giudica
 * guardando, non con una soglia.
 */
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { apriBrowser } from './browser.mjs'
const PORTA = Number(process.env.PORTA_COLLAUDO || 5351)
const DA = Number(process.env.DA || 0.115)
const A = Number(process.env.A || 0.25)
const BASE = `http://localhost:${PORTA}/nautica/`
async function serviteci () {
  try { const r = await fetch(BASE, { redirect: 'manual' }); if (r.status < 500) return null } catch {}
  const s = spawn('npm', ['run', 'preview', '--', '--port', String(PORTA)], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) { try { await fetch(BASE, { redirect: 'manual' }); return s } catch {} ; await new Promise(r => setTimeout(r, 500)) }
  s.kill(); process.exit(2)
}
mkdirSync('uscite/bordo', { recursive: true })
const srv = await serviteci()
const b = await apriBrowser({ conGpu: true })
const pg = await b.newPage()
await pg.setViewportSize({ width: 1440, height: 900 })
await pg.goto(BASE + '?ispeziona=1', { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
for (let i = 0; i <= 26; i++) {
  const q = DA + i * ((A - DA) / 26)
  await pg.evaluate((qq) => { const h = document.documentElement.scrollHeight - innerHeight; scrollTo(0, h * qq) }, q)
  await pg.waitForTimeout(700)
  const r = await pg.evaluate(() => ({
    battuta: document.querySelector('#dimostrazione .palco')?.dataset.battuta || document.querySelector('#salone .palco')?.dataset.battuta || '?',
    nudge: (() => { const n = document.querySelector('.nudge'); return n?.dataset.visibile === 'si' ? n.textContent.trim() : null })()
  }))
  await pg.screenshot({ path: `uscite/bordo/q${String(Math.round(q*1000)).padStart(4,'0')}.png` })
  console.log(`  q ${q.toFixed(3)}  battuta ${String(r.battuta).padEnd(12)} nudge: ${r.nudge ?? '-'}`)
}
await b.close(); srv?.kill()
