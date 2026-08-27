/**
 * LA STESSA NAVE DALLA STESSA CAMERA, cotta e disegnata.
 *
 * E' l'unico confronto che dice dove il tempo reale perde. Con due
 * inquadrature diverse ogni differenza si puo' attribuire alla posa; con la
 * stessa, quello che resta e' il render.
 *
 * La posizione arriva da `cuoci.py`, che la stampa in coordinate del sito
 * (riga CAMERA_SITO): non si trascrive a mano, si passa da qui.
 */
import { apriBrowser } from './browser.mjs'
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const [px, py, pz, mx, my, mz, fuoco] = (process.env.CAMERA_SITO ||
  '24.3634 3.0000 37.3310 0 1.7209 0 85').split(/\s+/).map(Number)
const L = Number(process.env.LARGO || 1000)
const H = Number(process.env.ALTO || 620)
const PORTA = process.env.PORTA_COLLAUDO || 5188

const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
await new Promise(r => setTimeout(r, 4000))
const browser = await apriBrowser({ conGpu: true })
const pg = await (await browser.newContext({ viewport: { width: L, height: H } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1${process.env.EXTRA || ''}`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })

// dentro la dimostrazione, dove il ciclo di disegno e' acceso
const QUOTA = Number(process.env.QUOTA || 0.30)
await pg.evaluate((q) => { window.__quota = q }, QUOTA)
const y = await pg.evaluate(() => {
  const r = document.querySelector('#dimostrazione').getBoundingClientRect()
  return Math.round(r.top + scrollY + r.height * Number(window.__quota || 0.30))
})
await pg.evaluate((y) => scrollTo(0, y), y)
await pg.waitForTimeout(2500)

const dati = await pg.evaluate(([px, py, pz, mx, my, mz, fuoco, L, H, forza]) => {
  const n = window.__nautica
  // Il ciclo del sito riscrive la camera a ogni fotogramma: si disegna UNA
  // volta a mano, subito dopo averla messa, e si legge la tela prima che il
  // fotogramma successivo la sovrascriva.
  n.camera.position.set(px, py, pz)
  n.camera.lookAt(mx, my, mz)
  if (n.camera.isPerspectiveCamera) {
    // 85 mm su sensore 36: l'angolo verticale dipende dal rapporto della tela
    n.camera.fov = 2 * Math.atan(12 / fuoco) * 180 / Math.PI
    n.camera.aspect = L / H
    n.camera.updateProjectionMatrix()
  }
  n.render.render(n.scena, n.camera)
  return { url: n.render.domElement.toDataURL('image/png'), fov: n.camera.fov,
           sezione: n.sezione.costante }
}, [px, py, pz, mx, my, mz, fuoco, L, H, process.env.AO === undefined ? null : Number(process.env.AO)])

writeFileSync(`${process.env.FUORI}/sito-${process.env.ETICHETTA || 'stessa-camera'}.png`,
  Buffer.from(dati.url.split(',')[1], 'base64'))
console.log(`  taglio a ${dati.sezione.toFixed(3)} - fov ${dati.fov.toFixed(2)} gradi -> ${process.env.FUORI}/sito-stessa-camera.png`)
await browser.close(); preview.kill(); process.exit(0)
