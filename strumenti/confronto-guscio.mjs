/**
 * LA LASTRA E IL GUSCIO, NEGLI STESSI PUNTI.
 *
 *     node strumenti/confronto-guscio.mjs
 *
 * Non e' un cancello: scrive sei fotogrammi in `uscite/guscio/` -- tre con la
 * lastra e tre con `?guscio=1` -- ai tre scorrimenti che contano, compreso lo
 * 0,235 dove la lastra mostra i propri quattro bordi.
 *
 * Stampa anche la scatola di ingombro del guscio in coordinate MONDO accanto
 * alla posizione del gruppo: e' il numero che dice se il guscio e' dove deve,
 * invece di farlo dedurre da uno screenshot.
 */
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { apriBrowser } from './browser.mjs'

/**
 * ─── SI VA A UN `p` DEL RACCONTO, NON A UNA FRAZIONE DI PAGINA
 *
 * Qui c'era `scrollTo(0, (scrollHeight - innerHeight) * q)`. E' la misura che
 * questo repo ha gia' vietato tre volte -- `varco`, `manopola`, `cinematica` --
 * e che io ho reintrodotto scrivendo due strumenti nuovi: una frazione di
 * PAGINA cambia quando cambiano antefatto, coda o contatto, mentre la corsa del
 * RACCONTO e' un'altra cosa e la conosce solo `demo.js`.
 *
 * La conosce e la pubblica: `p`, `corsaRacconto` e `cimaSezione` stanno su
 * `__nautica` da quando un cancello si e' rotto per questo esatto motivo. Io
 * le ho cercate in `index.js` invece che in `demo.js` e ho concluso che non
 * esistessero.
 *
 * E dopo lo spostamento si ASPETTA che `p` sia arrivato: assegnare lo
 * scorrimento non e' averlo.
 */
async function vaiA (pg, p) {
  await pg.evaluate((pp) => {
    const n = window.__nautica
    scrollTo(0, n.cimaSezione + pp * n.corsaRacconto)
  }, p)
  return pg.waitForFunction(
    (pp) => Math.abs((window.__nautica.p ?? -1) - pp) < 0.003,
    p, { timeout: 8000 }
  ).then(() => true).catch(() => false)
}

const P = 5381, BASE = `http://localhost:${P}/nautica/`
async function serviteci () {
  try { const r = await fetch(BASE, { redirect: 'manual' }); if (r.status < 500) return null } catch {}
  const s = spawn('npm', ['run', 'preview', '--', '--port', String(P)], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) { try { await fetch(BASE, { redirect: 'manual' }); return s } catch {} ; await new Promise(r => setTimeout(r, 500)) }
  s.kill(); process.exit(2)
}
mkdirSync('uscite/guscio', { recursive: true })
const srv = await serviteci()
const b = await apriBrowser({ conGpu: true })
for (const [nome, extra] of [['lastra', ''], ['guscio', '&guscio=1']]) {
  const pg = await b.newPage()
  await pg.setViewportSize({ width: 1440, height: 900 })
  await pg.goto(BASE + '?ispeziona=1' + extra, { waitUntil: 'load' })
  await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 45000 })
  await pg.waitForTimeout(2500)
  for (const q of [0.10, 0.20, 0.235]) {
    await vaiA(pg, q)
    await pg.waitForTimeout(1200)
    await pg.screenshot({ path: `uscite/guscio/${nome}-${String(Math.round(q*1000)).padStart(4,'0')}.png` })
  }
  const c = await pg.evaluate(() => {
    const g = window.__nautica.scena.getObjectByName('GUSCIO_SALONE')
    const gr = window.__nautica.scena.getObjectByName('SALONE3D')
    if (!g) return 'nessun guscio'
    g.updateWorldMatrix(true, true)
    let n = 0, min = null, max = null
    g.traverse(o => {
      if (!o.isMesh) return
      n++
      o.geometry.computeBoundingBox()
      const bb = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)
      min = min ? min.map((v, k) => Math.min(v, bb.min.toArray()[k])) : bb.min.toArray()
      max = max ? max.map((v, k) => Math.max(v, bb.max.toArray()[k])) : bb.max.toArray()
    })
    const f = (a) => a ? a.map(v => v.toFixed(2)).join(' ') : '--'
    const gp = gr ? gr.getWorldPosition(gr.position.clone()) : null
    return `${n} mesh · scatola mondo  min ${f(min)}  max ${f(max)}  ·  gruppo mondo ${gp ? f(gp.toArray()) : '--'}`
  })
  console.log(`  ${nome}: ${c}`)
  await pg.close()
}
await b.close(); srv?.kill()
