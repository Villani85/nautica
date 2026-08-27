/**
 * L'A/B DELL'OCCLUSIONE, NELLO STESSO ISTANTE.
 *
 * Il primo banco catturava le due varianti con due chiamate separate, e fra
 * l'una e l'altra la nave ROLLA e il mare si muove: ogni differenza misurata
 * conteneva anche un cambio di posa, e i numeri ballavano di due o tre livelli
 * in tutte e due le direzioni. Con un effetto atteso dello stesso ordine, il
 * banco non poteva rispondere.
 *
 * Qui le due immagini si disegnano DENTRO LA STESSA chiamata: nessun
 * requestAnimationFrame in mezzo, quindi stessa posa, stessa onda, stesso
 * tutto. L'unica differenza che resta e' quella che si vuole misurare.
 */
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const [px, py, pz, mx, my, mz, fuoco] = (process.env.CAMERA_SITO ||
  '24.3634 3.0000 37.3310 0 1.7209 0 85').split(/\s+/).map(Number)
const PORTA = process.env.PORTA_COLLAUDO || 5191
const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
await new Promise(r => setTimeout(r, 4000))
const browser = await chromium.launch({ channel: 'chrome', headless: false })
const pg = await (await browser.newContext({ viewport: { width: 1000, height: 620 } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })
await pg.evaluate(() => {
  const r = document.querySelector('#dimostrazione').getBoundingClientRect()
  scrollTo(0, Math.round(r.top + scrollY + r.height * 0.30))
})
await pg.waitForTimeout(2500)

const out = await pg.evaluate(([px, py, pz, mx, my, mz, fuoco, forze]) => {
  const n = window.__nautica
  n.camera.position.set(px, py, pz)
  n.camera.lookAt(mx, my, mz)
  n.camera.fov = 2 * Math.atan(12 / fuoco) * 180 / Math.PI
  n.camera.aspect = 1000 / 620
  n.camera.updateProjectionMatrix()
  const mat = []
  n.nave.traverse(o => {
    if (!o.isMesh || !o.material) return
    for (const m of [].concat(o.material)) if (m.aoMap && !mat.includes(m)) mat.push(m)
  })
  const salvate = mat.map(m => m.aoMap)
  const png = {}
  for (const f of forze) {
    mat.forEach((m, i) => {
      if (f < 0) { m.aoMap = null } else { m.aoMap = salvate[i]; m.aoMapIntensity = f }
      m.needsUpdate = true
    })
    n.render.render(n.scena, n.camera)
    png[f] = n.render.domElement.toDataURL('image/png')
  }
  mat.forEach((m, i) => { m.aoMap = salvate[i]; m.aoMapIntensity = 1; m.needsUpdate = true })
  return { png, quanti: mat.length }
}, [px, py, pz, mx, my, mz, fuoco, (process.env.FORZE || '-1 1 4').split(/\s+/).map(Number)])

console.log(`  materiali con aoMap: ${out.quanti}`)
for (const [f, url] of Object.entries(out.png)) {
  writeFileSync(`${process.env.FUORI}/ab-${f}.png`, Buffer.from(url.split(',')[1], 'base64'))
}
await browser.close(); preview.kill(); process.exit(0)
