/**
 * L'OMBRA DELLA NAVE SUL MARE, provata prima di costruirla.
 *
 * Un oggetto che non fa ombra sul piano su cui sta e' l'altro grande segnale
 * di "incollato". Il pelo dell'acqua non e' nell'elenco di chi riceve ombre --
 * quell'elenco lo scorre `guscio`, e l'acqua nasce ottanta righe dopo.
 *
 * Come per l'occlusione, le due varianti si disegnano DENTRO la stessa
 * chiamata: la nave rolla e il mare si muove, e con due catture separate la
 * differenza cercata affogherebbe nel movimento.
 */
import { apriBrowser } from './browser.mjs'
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const [px, py, pz, mx, my, mz, fuoco] = (process.env.CAMERA_SITO ||
  '24.3634 3.0000 37.3310 0 1.7209 0 85').split(/\s+/).map(Number)
const PORTA = process.env.PORTA_COLLAUDO || 5192
const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
await new Promise(r => setTimeout(r, 4000))
const browser = await apriBrowser({ conGpu: true })
const pg = await (await browser.newContext({ viewport: { width: 1000, height: 620 } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })
await pg.evaluate(() => {
  const r = document.querySelector('#dimostrazione').getBoundingClientRect()
  scrollTo(0, Math.round(r.top + scrollY + r.height * 0.30))
})
await pg.waitForTimeout(2500)
await pg.evaluate((v) => { window.__sua = v }, process.env.SUA === '1')
const out = await pg.evaluate(([px, py, pz, mx, my, mz, fuoco]) => {
  const n = window.__nautica
  // SUA = si misura dalla camera del SITO, quella che l'utente ha davvero.
  // La camera del ritratto serve a confrontarsi col render cotto; per decidere
  // se una cosa vale il suo costo conta il punto di vista vero.
  if (!window.__sua) {
    n.camera.position.set(px, py, pz); n.camera.lookAt(mx, my, mz)
    n.camera.fov = 2 * Math.atan(12 / fuoco) * 180 / Math.PI
    n.camera.aspect = 1000 / 620; n.camera.updateProjectionMatrix()
  }
  const pelo = []
  n.scena.traverse(o => { if (o.isMesh && o.material && o.material.name === 'pelo') pelo.push(o) })
  const png = {}
  for (const v of [false, true]) {
    pelo.forEach(o => { o.receiveShadow = v; o.material.needsUpdate = true })
    n.render.render(n.scena, n.camera)
    png[v] = n.render.domElement.toDataURL('image/png')
  }
  pelo.forEach(o => { o.receiveShadow = false; o.material.needsUpdate = true })
  return { png, quanti: pelo.length, ombre: n.render.shadowMap.enabled }
}, [px, py, pz, mx, my, mz, fuoco])
console.log(`  mesh del pelo: ${out.quanti} - mappa d ombra accesa: ${out.ombre}`)
for (const [k, url] of Object.entries(out.png)) {
  writeFileSync(`${process.env.FUORI}/ombra-${k}.png`, Buffer.from(url.split(',')[1], 'base64'))
}
await browser.close(); preview.kill(); process.exit(0)
