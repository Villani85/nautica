import { apriBrowser } from './browser.mjs'
const b = await apriBrowser({ conGpu: true })
const pg = await b.newPage()
await pg.setViewportSize({ width: 1280, height: 720 })
await pg.goto('http://localhost:4173/?ispeziona=1&mondo=1&senzaFilmato=1', { waitUntil: 'load', timeout: 45000 })
await pg.waitForFunction(() => window.__nautica?.mondo, null, { timeout: 30000 })
await pg.waitForFunction(() => window.__nautica.mondo()?.pronto === true, null, { timeout: 30000 }).catch(() => {})
console.log('  stato:', JSON.stringify(await pg.evaluate(() => window.__nautica.mondo())))
console.log('  bbox in unita di scena:', await pg.evaluate(() => {
  const g = window.__nautica.scena.getObjectByName('MONDO_TRAVERSATA')
  if (!g) return 'gruppo assente'
  g.visible = true
  g.updateWorldMatrix(true, true)
  const b = new (Object.getPrototypeOf(g).constructor.prototype.constructor === undefined ? null : window.THREE?.Box3 || function(){})()
  let mn = [1e9,1e9,1e9], mx = [-1e9,-1e9,-1e9]
  g.traverse(o => { if (!o.isMesh) return
    const p = o.geometry.attributes.position
    for (let i = 0; i < p.count; i++) {
      const v = { x: p.getX(i), y: p.getY(i), z: p.getZ(i) }
      const w = o.localToWorld(new o.position.constructor(v.x, v.y, v.z))
      mn = [Math.min(mn[0],w.x), Math.min(mn[1],w.y), Math.min(mn[2],w.z)]
      mx = [Math.max(mx[0],w.x), Math.max(mx[1],w.y), Math.max(mx[2],w.z)]
    }})
  return { min: mn.map(v=>+v.toFixed(3)), max: mx.map(v=>+v.toFixed(3)) }
}))
await b.close()
