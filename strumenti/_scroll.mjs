/* QUANTO CAMBIA IL FOTOGRAMMA PER OGNI PASSO DI SCORRIMENTO.
   Uno scorrimento e' "a vuoto" quando la mano lavora e l'immagine no. */
import { spawn, execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { apriBrowser } from './browser.mjs'
const PORTA = 5250
const prev = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
const b = await apriBrowser({ conGpu: true })
const pg = await b.newPage()
await pg.setViewportSize({ width: 1000, height: 700 })
await pg.goto('http://localhost:' + PORTA + '/?ispeziona=1', { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
const T = 'C:/Users/Giuseppe/AppData/Local/Temp/'
const raw = async (nome) => {
  writeFileSync(T + nome, await pg.screenshot())
  return execFileSync('ffmpeg', ['-v', 'error', '-i', T + nome, '-vf', 'scale=200:140',
    '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1e9 })
}
let prec = null
console.log('')
console.log('  scorr  battuta       cambiamento rispetto al passo prima')
for (let f = 0; f <= 0.62; f += 0.01) {
  await pg.evaluate((f) => {
    const h = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo(0, Math.round(h * f))
  }, f)
  await pg.waitForTimeout(700)
  const g = await raw('s.png')
  const batt = await pg.evaluate(() => document.querySelector('#dimostrazione .palco')?.dataset?.battuta || '-')
  if (prec) {
    let s = 0
    for (let i = 0; i < g.length; i++) s += Math.abs(g[i] - prec[i])
    const d = s / g.length
    const barra = '#'.repeat(Math.min(50, Math.round(d)))
    console.log('  ' + f.toFixed(2) + '   ' + batt.padEnd(12) + ' ' + d.toFixed(1).padStart(5) + '  ' + barra)
  }
  prec = g
}
await b.close(); prev.kill()
