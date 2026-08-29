/**
 * DOVE SALTA LA CAMERA — trova la discontinuita' invece di indovinarla.
 *
 * `collaudo-continuita` dice CHE la camera fa un passo 22,9 volte i suoi
 * vicini, e in quale campione. Non dice da dove a dove, ne' quale manopola si
 * e' mossa. Due ipotesi sbagliate di fila (il rientro istantaneo, poi il
 * rientro rapido) sono costate due corse della CI: questo stampa i numeri.
 */
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'

const P = process.env.PORTA_COLLAUDO || 5291
const N = Number(process.env.CAMPIONI || 48)
const s = spawn('npx', ['vite', 'preview', '--port', P, '--strictPort'], { shell: true, stdio: 'ignore' })
const b = await apriBrowser({ conGpu: !process.env.CHROMIUM })
const pg = await b.newPage()
await pg.setViewportSize({ width: 1400, height: 900 })
await pg.goto(`http://localhost:${P}/nautica/?ispeziona=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })

const righe = []
for (let i = 0; i <= N; i++) {
  const q = i / N
  await pg.evaluate((qq) => {
    const h = document.documentElement.scrollHeight - innerHeight
    scrollTo(0, h * qq)
  }, q)
  righe.push(await pg.evaluate(async () => {
    const n = window.__nautica
    /* si aspettano i FOTOGRAMMI e non i millisecondi: una lettura presa mentre
       il ciclo e' fermo esce vecchia, e un campione vecchio si legge come salto */
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    const c = n.camera
    const tela = document.querySelector('#scena')
    const palco = document.querySelector('#dimostrazione .palco')
    return {
      pos: c.position.toArray().map(x => +x.toFixed(3)),
      spaccato: tela?.dataset.spaccato ?? '?',
      battuta: palco?.dataset.battuta ?? '?',
      traversata: palco?.dataset.traversata ?? '?',
      copertura: n.coperturaTraversata ? +n.coperturaTraversata().toFixed(2) : null
    }
  }))
}

let peggio = 0
let dove = -1
const passi = []
for (let i = 1; i < righe.length; i++) {
  const a = righe[i - 1].pos
  const c = righe[i].pos
  passi.push(Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]))
}
for (let i = 1; i < passi.length - 1; i++) {
  const vic = Math.max(passi[i - 1], passi[i + 1], 0.05)
  const r = passi[i] / vic
  if (passi[i] > 0.05 && r > peggio) { peggio = r; dove = i }
}
console.log(`\n  il passo peggiore e' ${peggio.toFixed(1)}x, fra il campione ${dove} e il ${dove + 1}\n`)
for (let i = Math.max(0, dove - 3); i <= Math.min(righe.length - 1, dove + 4); i++) {
  const r = righe[i]
  const salto = i > 0 ? passi[i - 1].toFixed(3) : '   -'
  console.log(`  ${String(i).padStart(2)}  passo ${String(salto).padStart(7)}  pos ${r.pos.join(' ').padEnd(24)} ` +
              `spaccato ${r.spaccato}  battuta ${r.battuta.padEnd(11)} trav ${r.traversata}  cop ${r.copertura}`)
}
await b.close()
s.kill()
