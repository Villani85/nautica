/**
 * DOVE STA LA CAMERA, E DOVE STA IL TAGLIO — lungo tutta la corsa.
 *
 * Serve a scrivere la legge nuova del piano di sezione, e serve PRIMA di
 * scriverla. Oggi `spaccato` fa due mestieri: comanda la camera (raggio, mira,
 * quota) e comanda il taglio, tutti e due sullo stesso orologio, `p`. Finche'
 * e' cosi', spostare una finestra della regia sposta la camera ma non il
 * taglio — ed e' la ragione MISURATA per cui la configurazione B di
 * `_baseline-pose` portava la camera vicino a una macchina ancora coperta:
 * occlusione dal 36,4% al 70,8%.
 *
 * Questo strumento non giudica niente e non ha soglie. Stampa, campione per
 * campione, le grandezze in COORDINATE MONDO con cui la legge nuova va
 * scritta: dove sta la camera, quanto dista dal meccanismo, dove sta il piano
 * di sezione. Senza questi numeri la legge sarebbe indovinata.
 *
 *   node strumenti/_taglio-camera.mjs
 */
import { apriBrowser } from './browser.mjs'
import { spawn } from 'node:child_process'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'

const PORTA = process.env.PORTA_COLLAUDO || 6975
const QUANTI = Number(process.env.CAMPIONI || 26)
const M_PER_UNITA = 2.5

await avvisaSePortaAltrui(PORTA)
const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
for (let i = 0; i < 60; i++) {
  try { await fetch(`http://localhost:${PORTA}/`, { redirect: 'manual' }); break } catch {}
  await new Promise(r => setTimeout(r, 500))
}

const browser = await apriBrowser({ conGpu: true })
const pg = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1&senzaFilmato=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })
await pg.waitForTimeout(2500)

/**
 * IL BERSAGLIO SI DICHIARA UNA VOLTA, e si prende dalla scena, non a occhio.
 *
 * `MIRA_MECCANISMO` e' positiva: il bersaglio narrativo e' l'impianto di
 * DRITTA. Il fianco si decide nel sistema dello SCAFO e non nel mondo, per la
 * ragione gia' pagata: col rollio la X di mondo cambia fianco a un pezzo che
 * non si e' mosso.
 */
const bersaglio = await pg.evaluate(() => {
  const n = window.__nautica
  let nave = null
  n.scena.traverse(o => { if (!nave && o.name === 'NAVE') nave = o })
  nave = nave || n.scena
  nave.updateMatrixWorld(true)
  const inv = nave.matrixWorld.clone().invert()
  const centri = []
  n.scena.traverse(o => {
    if (!o.isMesh) return
    let dentro = false
    for (let q = o; q; q = q.parent) if (q.name === 'IMPIANTO') { dentro = true; break }
    if (!dentro) return
    o.updateMatrixWorld(true)
    const g = o.geometry
    if (!g.boundingBox) g.computeBoundingBox()
    const b = g.boundingBox
    const c = { x: (b.min.x + b.max.x) / 2, y: (b.min.y + b.max.y) / 2, z: (b.min.z + b.max.z) / 2 }
    const e = o.matrixWorld.elements
    const w = {
      x: e[0] * c.x + e[4] * c.y + e[8] * c.z + e[12],
      y: e[1] * c.x + e[5] * c.y + e[9] * c.z + e[13],
      z: e[2] * c.x + e[6] * c.y + e[10] * c.z + e[14]
    }
    const f = inv.elements
    const s = {
      x: f[0] * w.x + f[4] * w.y + f[8] * w.z + f[12],
      y: f[1] * w.x + f[5] * w.y + f[9] * w.z + f[13],
      z: f[2] * w.x + f[6] * w.y + f[10] * w.z + f[14]
    }
    centri.push({ w, s })
  })
  const dritta = centri.filter(c => c.s.x > 0)
  const usa = dritta.length ? dritta : centri
  const m = usa.reduce((a, c) => ({ x: a.x + c.w.x, y: a.y + c.w.y, z: a.z + c.w.z }), { x: 0, y: 0, z: 0 })
  return {
    punto: [m.x / usa.length, m.y / usa.length, m.z / usa.length],
    mesh: usa.length,
    totali: centri.length
  }
})
console.log(`\n  bersaglio IMPIANTO dritta: ${bersaglio.mesh} mesh su ${bersaglio.totali}` +
  `  ·  centro (mondo) ${bersaglio.punto.map(v => v.toFixed(3)).join(' ')}`)

const leggi = (b) => pg.evaluate((bb) => {
  const n = window.__nautica
  const c = n.camera
  c.updateMatrixWorld(true)
  const e = c.matrixWorld.elements
  const dir = { x: -e[8], y: -e[9], z: -e[10] }
  const dx = bb[0] - c.position.x, dy = bb[1] - c.position.y, dz = bb[2] - c.position.z
  const dist = Math.hypot(dx, dy, dz)
  /*
   * Il piano di sezione si legge dal MATERIALE, non dal renderer: il sito usa
   * il clipping locale, e leggere `render.clippingPlanes` e' un errore gia'
   * pagato quattro volte in `_rientro-possibile`.
   */
  let sez = null
  let vert = null
  n.scena.traverse(o => {
    if (sez !== null) return
    const mm = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []
    for (const m of mm) {
      const pl = m && m.clippingPlanes
      if (pl && pl.length >= 2) { sez = pl[0].constant; vert = pl[1].constant; return }
    }
  })
  const el = document.querySelector('[data-spaccato]')
  return {
    p: n.p ?? null,
    spaccato: el ? Number(el.dataset.spaccato) : null,
    camera: [c.position.x, c.position.y, c.position.z],
    direzione: [dir.x, dir.y, dir.z],
    distanza: dist,
    sezione: sez,
    verticale: vert
  }
}, b)

/* un salto solo: cercare il punto trascina la fisica, ed e' gia' costato un
   cancello intermittente */
const vaiAQ = async (q) => {
  await pg.evaluate((qq) => {
    const n = window.__nautica
    window.scrollTo(0, n.cimaSezione + qq * n.corsaRacconto)
  }, q)
  await pg.waitForTimeout(450)
}

console.log(`\n  1 unita = ${M_PER_UNITA} m  ·  ${QUANTI} campioni su tutta la corsa del racconto\n`)
console.log('     q      p     spaccato   pianoZ   pianoX    camera (x  y  z)             dist   dist_m')
console.log('   ' + '-'.repeat(92))

const righe = []
const f = (v, k = 3) => (v === null || v === undefined || Number.isNaN(v)) ? '  --  ' : v.toFixed(k)
for (let i = 0; i < QUANTI; i++) {
  const q = i / (QUANTI - 1)
  await vaiAQ(q)
  const d = await leggi(bersaglio.punto)
  righe.push({ q, ...d })
  console.log(`   ${q.toFixed(2)}  ${f(d.p)}    ${f(d.spaccato)}   ${f(d.sezione, 2).padStart(7)}  ${f(d.verticale, 2).padStart(7)}   ` +
    d.camera.map(v => v.toFixed(2).padStart(7)).join(' ') +
    `  ${d.distanza.toFixed(2).padStart(6)}  ${(d.distanza * M_PER_UNITA).toFixed(1).padStart(6)}`)
}

console.log('')
const conSp = righe.filter(r => r.spaccato !== null && !Number.isNaN(r.spaccato))
const apre = conSp.find(r => r.spaccato > 0.002)
const pieno = conSp.find(r => r.spaccato > 0.998)
if (apre) {
  console.log(`  il taglio comincia ad aprirsi a q=${apre.q.toFixed(2)} (p=${f(apre.p)}), ` +
    `camera a ${apre.distanza.toFixed(2)} unita = ${(apre.distanza * M_PER_UNITA).toFixed(1)} m dal meccanismo`)
}
if (pieno) {
  console.log(`  il taglio e' completo a       q=${pieno.q.toFixed(2)} (p=${f(pieno.p)}), ` +
    `camera a ${pieno.distanza.toFixed(2)} unita = ${(pieno.distanza * M_PER_UNITA).toFixed(1)} m`)
}
const dd = conSp.map(r => r.distanza)
console.log(`  distanza camera-meccanismo lungo la corsa: da ${Math.max(...dd).toFixed(2)} a ${Math.min(...dd).toFixed(2)} unita ` +
  `(${(Math.max(...dd) * M_PER_UNITA).toFixed(1)} - ${(Math.min(...dd) * M_PER_UNITA).toFixed(1)} m)`)
console.log('')

await browser.close()
preview.kill()
