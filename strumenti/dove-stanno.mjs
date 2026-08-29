/**
 * DOVE STANNO DAVVERO I PEZZI, in coordinate del mondo.
 *
 * Nasce da un dubbio ragionevole: un commento in `index.js` dice che lo scafo
 * va da z = -1,5 a z = +1,5, e le due macchine dell'atto due sono state messe a
 * z = 2,6 e 0,2 fidandosi delle unita' del GLB. Se il commento e' vero, la
 * propulsione sta FUORI dalla nave -- e sarebbe il genere di difetto che non
 * solleva nessun errore e si vede solo guardando dal lato giusto.
 *
 * Si misura invece di dedurlo: il raggio di `?ispeziona=1` non serve, basta
 * chiedere alla scena viva l'ingombro dei gruppi e la posizione dei nodi.
 */
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'

const P = process.env.PORTA_COLLAUDO || 5271
const s = spawn('npx', ['vite', 'preview', '--port', P], { shell: true, stdio: 'ignore' })
const b = await apriBrowser({ conGpu: true })
const pg = await b.newPage()
await pg.setViewportSize({ width: 1400, height: 900 })
await pg.goto(`http://localhost:${P}/nautica/?ispeziona=1&fermo=12`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
await pg.waitForTimeout(3500)

const r = await pg.evaluate(() => {
  const n = window.__nautica
  const fmt = (v) => [+v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(2)]
  const out = { nodi: {}, ingombri: {} }
  const Box3 = n.scena.constructor === undefined ? null : null
  n.scena.traverse((o) => {
    if (['prop_albero', 'prop_elica', 'gyro_rotore', 'IMPIANTO'].includes(o.name)) {
      const p = o.getWorldPosition(new o.position.constructor())
      out.nodi[o.name] = fmt(p)
    }
  })
  /* l'ingombro della nave: si chiede alla geometria, non a un commento */
  const nave = n.scena.children.find(c => c.type === 'Group' && c.children.length > 3)
  if (nave) {
    const b = new (Object.getPrototypeOf(n.scena).constructor === Object ? Object : Object)()
    // Box3 non e' esposto: si somma a mano sui vertici dei figli
    let minZ = Infinity, maxZ = -Infinity, minY = Infinity, maxY = -Infinity, maxX = -Infinity
    nave.traverse((o) => {
      if (!o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return
      o.updateWorldMatrix(true, false)
      const a = o.geometry.attributes.position
      const v = new o.position.constructor()
      for (let i = 0; i < a.count; i += Math.max(1, Math.floor(a.count / 400))) {
        v.fromBufferAttribute(a, i).applyMatrix4(o.matrixWorld)
        if (v.z < minZ) minZ = v.z; if (v.z > maxZ) maxZ = v.z
        if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y
        if (Math.abs(v.x) > maxX) maxX = Math.abs(v.x)
      }
    })
    out.ingombri.nave = { z: [+minZ.toFixed(2), +maxZ.toFixed(2)], y: [+minY.toFixed(2), +maxY.toFixed(2)], semiLarghezza: +maxX.toFixed(2) }
  }
  return out
})
console.log(JSON.stringify(r, null, 1))
await b.close()
s.kill()
