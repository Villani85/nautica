/**
 * DIAGNOSI (sola lettura): lo spigolo di carena ha due normali o una sola?
 *
 * `contornoA` emette il punto dello spigolo DUE VOLTE, alla stessa posizione,
 * perche' il ginocchio e la murata non se ne passino la normale attraverso un
 * vertice condiviso. Se lo sdoppiamento funziona, i due vertici coincidenti
 * hanno normali che divergono di un angolo vicino a quello misurato sulle
 * ordinate -- da 9 gradi a prua a 57 a poppa.
 *
 * Se divergono di ZERO, il vertice e' ancora uno solo o il quad degenere non
 * e' stato saltato: la mediazione e' tornata e lo spigolo non esiste.
 *
 *   node strumenti/_spigolo-vivo.mjs
 */
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'

const PORTA = Number(process.env.PORTA_COLLAUDO || 6566)

await avvisaSePortaAltrui(PORTA)
const pv = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
for (let i = 0; i < 60; i++) {
  try { await fetch(`http://localhost:${PORTA}/`, { redirect: 'manual' }); break } catch {}
  await new Promise(r => setTimeout(r, 500))
}

const b = await apriBrowser({ conGpu: true })
const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1&senzaFilmato=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
await pg.waitForTimeout(2500)

const esito = await pg.evaluate(() => {
  const n = window.__nautica
  /* IL GUSCIO SI RICONOSCE DA CIO' CHE LO DISTINGUE, non dal nome: e' l'unica
     mesh costruita con punti EMESSI DUE VOLTE. Cercarlo per nome ha gia'
     fallito una volta -- in questa scena i nomi quasi non ci sono. */
  let g = null
  let quale = ''
  let meglio = -1
  n.scena.traverse(o => {
    if (!o.isMesh) return
    const p = o.geometry?.attributes?.position
    if (!p || !o.geometry.attributes.normal || p.count < 200) return
    let doppi = 0
    for (let i = 0; i + 1 < p.count; i++) {
      if (Math.hypot(p.getX(i) - p.getX(i + 1), p.getY(i) - p.getY(i + 1),
                     p.getZ(i) - p.getZ(i + 1)) < 1e-7) doppi++
    }
    /* E NON BASTA «QUELLA CON PIU' COPPIE»: al primo tentativo ha agganciato
       un GLB da 56.598 vertici con 16.164 coppie, che non e' lo scafo. Il
       guscio si dichiara con cio' che lo definisce: vive fra z=-8 e z=+8
       (PRUA_Z e POPPA_Z) e ha DUE coppie per anello, non migliaia. */
    let zmin = Infinity, zmax = -Infinity
    for (let i = 0; i < p.count; i++) {
      const z = p.getZ(i)
      if (z < zmin) zmin = z
      if (z > zmax) zmax = z
    }
    const nave = zmin > -9 && zmin < -6 && zmax > 6 && zmax < 9
    if (!nave || doppi < 32 || doppi > 1000) return
    if (doppi > meglio) { meglio = doppi; g = o.geometry; quale = (o.name || '(senza nome)') + ` [${doppi} coppie, z ${zmin.toFixed(1)}..${zmax.toFixed(1)}]` }
  })
  if (meglio <= 0) return { trovato: false }
  if (!g) return { trovato: false }
  const P = g.attributes.position
  const N = g.attributes.normal
  /* le coppie coincidenti: stesso punto, indici consecutivi */
  const coppie = []
  for (let i = 0; i + 1 < P.count; i++) {
    const dx = P.getX(i) - P.getX(i + 1)
    const dy = P.getY(i) - P.getY(i + 1)
    const dz = P.getZ(i) - P.getZ(i + 1)
    if (Math.hypot(dx, dy, dz) < 1e-7) {
      const a = [N.getX(i), N.getY(i), N.getZ(i)]
      const c = [N.getX(i + 1), N.getY(i + 1), N.getZ(i + 1)]
      const na = Math.hypot(...a), nc = Math.hypot(...c)
      if (na < 1e-6 || nc < 1e-6) { coppie.push({ i, ang: null }); continue }
      let d = (a[0] * c[0] + a[1] * c[1] + a[2] * c[2]) / (na * nc)
      d = Math.max(-1, Math.min(1, d))
      coppie.push({ i, z: +P.getZ(i).toFixed(2), ang: +(Math.acos(d) * 180 / Math.PI).toFixed(1) })
    }
  }
  return { trovato: true, quale, vertici: P.count, coppie }
})

if (!esito.trovato) {
  console.log('\n  guscio non trovato in scena\n')
} else {
  const buone = esito.coppie.filter(c => c.ang !== null)
  console.log(`\n  guscio: ${esito.quale}, ${esito.vertici} vertici`)
  console.log(`  coppie coincidenti trovate: ${esito.coppie.length}`)
  if (!buone.length) {
    console.log('  NESSUNA coppia con due normali: lo spigolo non e sdoppiato')
  } else {
    const a = buone.map(c => c.ang)
    console.log(`  angolo fra le due normali:  min ${Math.min(...a).toFixed(1)}°   ` +
      `medio ${(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1)}°   max ${Math.max(...a).toFixed(1)}°`)
    console.log('  qualche campione lungo la nave (z, angolo):')
    for (let k = 0; k < buone.length; k += Math.max(1, Math.floor(buone.length / 8))) {
      console.log(`     z ${String(buone[k].z).padStart(6)}   ${buone[k].ang}°`)
    }
    console.log(a.every(v => v < 1)
      ? '\n  LE NORMALI COINCIDONO: la mediazione e tornata, lo spigolo non si vede'
      : '\n  lo spigolo ha due normali distinte: la lama di luce puo esistere')
  }
}
console.log('')
await b.close(); pv.kill()
