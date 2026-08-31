/**
 * DOVE STA LA CAMERA DEL SITO, e in quale sistema.
 *
 *     node strumenti/posa-sito.mjs
 *
 * Non e' un cancello. Serve a piazzare per ARITMETICA cio' che altrimenti si
 * piazza per tentativi -- e questo repo i tentativi a occhio li paga sempre.
 *
 * Stampa due cose, e la differenza fra le due e' il punto: la posa in
 * coordinate di SCENA e quella LOCALE al gruppo del salone. Servono tutte e
 * due perche' `nave.add(salone.gruppo)` e `nave.position.y` e' animata
 * dall'emersione: una posa giusta in coordinate di scena e' sbagliata come
 * posizione locale, e non lo dice nessuno.
 *
 * Misurato: alla battuta del salone la camera sta a `(-0.01, 0, 1.3089)` nel
 * sistema del gruppo -- in asse, 1,31 unita' davanti alla lastra, rotazione
 * zero -- e da q 0,2 in poi ruota fino a 19 gradi allontanandosi.
 */
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'
const P = 5371, BASE = `http://localhost:${P}/nautica/`
async function serviteci () {
  try { const r = await fetch(BASE, { redirect: 'manual' }); if (r.status < 500) return null } catch {}
  const s = spawn('npm', ['run', 'preview', '--', '--port', String(P)], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) { try { await fetch(BASE, { redirect: 'manual' }); return s } catch {} ; await new Promise(r => setTimeout(r, 500)) }
  s.kill(); process.exit(2)
}
const srv = await serviteci()
const b = await apriBrowser({ conGpu: true })
const pg = await b.newPage()
await pg.setViewportSize({ width: 1440, height: 900 })
await pg.goto(BASE + '?ispeziona=1', { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 45000 })
console.log('  q      camera (unita)                 -> metri                        salone (gruppo)')
for (const q of [0.02, 0.06, 0.10, 0.16, 0.20, 0.235, 0.26]) {
  await pg.evaluate((qq) => { const h = document.documentElement.scrollHeight - innerHeight; scrollTo(0, h * qq) }, q)
  await pg.waitForTimeout(700)
  const r = await pg.evaluate(() => {
    const n = window.__nautica
    const g = n.scena.getObjectByName('SALONE3D')
    const c = n.camera
    const p = c.position
    const e = c.rotation
    /* la posa della camera NEL SISTEMA DEL GRUPPO del salone: il gruppo e'
       figlio di `nave`, la cui posizione e' animata dall'emersione, quindi le
       coordinate di scena non bastano */
    const loc = g ? g.worldToLocal(p.clone()) : null
    const qg = g ? g.getWorldQuaternion(c.quaternion.clone()) : null
    return {
      locale: loc ? [loc.x, loc.y, loc.z].map(v => +v.toFixed(4)) : null,
      naveY: n.scena.getObjectByName('NAVE')?.position.y ?? null,
      cam: [p.x, p.y, p.z].map(v => +v.toFixed(4)),
      rot: [e.x, e.y, e.z].map(v => +(v * 180 / Math.PI).toFixed(3)),
      fov: c.fov,
      grp: g ? [g.position.x, g.position.y, g.position.z].map(v => +v.toFixed(4)) : null
    }
  })
  const m = r.cam.map(v => +(v * 2.5).toFixed(3))
  console.log(`  ${q.toFixed(3)}  scena ${JSON.stringify(r.cam).padEnd(26)} LOCALE AL GRUPPO ${JSON.stringify(r.locale).padEnd(26)} naveY ${r.naveY}`)
}
await b.close(); srv?.kill()
