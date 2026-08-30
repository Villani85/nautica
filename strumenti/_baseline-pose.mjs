/**
 * DIAGNOSI (sola lettura): la BASELINE prima di toccare la regia.
 *
 * NON e' un cancello e non entra nella suite. Esiste per obbedire al punto 1
 * di «Metodo e prove obbligatorie» in `ciao.md`:
 *
 *   «Prima registrare la baseline su cinque campioni della battuta:
 *    percentuale di frame occupata dal gruppo, percentuale occlusa, posizione e
 *    mira della camera. Poi modificare la regia. Nessuna nuova soglia prima dei
 *    nuovi fotogrammi.»
 *
 * `collaudo-inquadrature` dava gia' le prime due, ma non la terza -- e senza
 * posizione e mira una traiettoria nuova non si puo' confrontare con quella
 * vecchia, si puo' solo giudicare a occhio.
 *
 * ─── E LA MISURA SI RIPETE, perche' una corsa sola non e' una baseline
 *
 * La battuta del meccanismo ha letto 7,87% in una corsa e 9,95% in un'altra: la
 * forbice e' vera e dipende da dove cade il campione dentro l'avvicinamento.
 * Prendere la corsa fortunata e chiamarla baseline vorrebbe dire tarare le pose
 * nuove contro un numero migliore del vero.
 *
 * Quindi si gira N volte (`GIRI`, di serie 3) e si stampano minimo, mediana e
 * massimo. **Il numero da portarsi dietro e' il minimo**, non la media: e' il
 * peggiore che un visitatore possa vedere.
 *
 * Le coordinate sono in UNITA' di scena e in METRI (1 unita' = 2,5 m), mai in
 * frazioni di pagina -- e' la regola che questo repo ha pagato tre volte.
 */
import { apriBrowser } from './browser.mjs'
import { spawn } from 'node:child_process'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'
import { SOGGETTI, misuraInPagina, trovaArco, vaiA, attendiCameraFerma } from './inquadratura-comune.mjs'

const PORTA = process.env.PORTA_COLLAUDO || 6970
const BATTUTE = (process.env.BATTUTE || 'taglio,meccanismo').split(',')
const QUANTI = Number(process.env.CAMPIONI || 5)
const GIRI = Number(process.env.GIRI || 3)
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
 * DOVE STA LA CAMERA E DOVE GUARDA.
 *
 * La mira non e' un dato che la scena conserva -- `lookAt` la consuma e tiene
 * solo l'orientamento. Si ricostruisce proiettando la direzione di vista fino
 * al soggetto: e' la mira che conta per una traiettoria, non un punto astratto.
 */
const dovEra = (def) => pg.evaluate((d) => {
  const n = window.__nautica
  const c = n.camera
  c.updateMatrixWorld(true)
  const e = c.matrixWorld.elements
  /* -Z della matrice: la direzione in cui la camera guarda */
  const dir = { x: -e[8], y: -e[9], z: -e[10] }

  /* il centro del soggetto, dal suo ingombro in coordinate mondo */
  const mesh = []
  const agg = (o) => { if (o.isMesh && o.material) mesh.push(o) }
  if (d.come === 'materiali') {
    const suoi = new Set(d.nomi)
    n.nave.traverse(o => {
      if (!o.isMesh || !o.material) return
      if ([].concat(o.material).some(m => suoi.has(String(m.name)))) agg(o)
    })
  } else if (d.come === 'nave') n.nave.traverse(agg)
  else {
    let r = null
    n.scena.traverse(o => { if (!r && (o.name === d.chiave || o.nome === d.chiave)) r = o })
    if (r) r.traverse(agg)
  }
  /**
   * --- IL SOGGETTO PUO' ESSERE DOPPIO, E ALLORA IL SUO CENTRO NON ESISTE
   *
   * QUINTO DIFETTO DI IDENTITA' DELLA SERATA, e l'ho preso prima di scriverlo
   * in `ciao2.md` solo perche' il numero era assurdo.
   *
   * La prima versione calcolava il centro dell'ingombro di TUTTO il soggetto e
   * misurava lo scarto fra la direzione di vista e quel punto. Sulla battuta
   * del meccanismo dava **86,5 gradi**: la camera non guarderebbe affatto la
   * macchina. Ma la macchina occupa il 6-9% del quadro, quindi era impossibile.
   *
   * Misurato: il meccanismo e' **doppio** -- 29 mesh a sinistra, 30 a destra,
   * 15 sulla mezzeria, da -4,18 a +4,16 metri. Un impianto per fianco. Il
   * centro del suo ingombro cade sulla MEZZERIA, dove non c'e' niente da
   * guardare, e la camera che inquadra un impianto risulta puntata "di fianco"
   * a un punto immaginario fra i due.
   *
   * Quindi il soggetto si divide per fianco, e lo scarto si misura verso il
   * lato PIU' VICINO -- quello che la camera sta effettivamente guardando. Il
   * referto dice anche quale, perche' con la sezione aperta se ne vede uno solo
   * e sapere quale conta per la traiettoria.
   */
  const lato = (m) => {
    if (!m.geometry) return 'mezzeria'
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox()
    m.updateWorldMatrix(true, false)
    const q = m.matrixWorld.elements
    const bb = m.geometry.boundingBox
    let a = Infinity, b = -Infinity
    for (const vx of [bb.min.x, bb.max.x]) for (const vy of [bb.min.y, bb.max.y]) for (const vz of [bb.min.z, bb.max.z]) {
      const wx = q[0] * vx + q[4] * vy + q[8] * vz + q[12]
      if (wx < a) a = wx; if (wx > b) b = wx
    }
    const cx = (a + b) / 2
    return cx > 0.05 ? 'dritta' : (cx < -0.05 ? 'sinistra' : 'mezzeria')
  }
  const perLato = { dritta: [], sinistra: [], mezzeria: [] }
  for (const m of mesh) perLato[lato(m)].push(m)

  let mnx = Infinity, mny = Infinity, mnz = Infinity, mxx = -Infinity, mxy = -Infinity, mxz = -Infinity
  for (const m of mesh) {
    const g = m.geometry
    if (!g || !g.attributes || !g.attributes.position) continue
    m.updateWorldMatrix(true, false)
    const q = m.matrixWorld.elements
    const pos = g.attributes.position
    /* gli otto vertici del bounding box locale bastano: qui serve il CENTRO,
       non la sagoma, e girare tutti i vertici di 75 mesh costa senza aggiungere */
    if (!g.boundingBox) g.computeBoundingBox()
    const b = g.boundingBox
    for (const vx of [b.min.x, b.max.x]) for (const vy of [b.min.y, b.max.y]) for (const vz of [b.min.z, b.max.z]) {
      const wx = q[0] * vx + q[4] * vy + q[8] * vz + q[12]
      const wy = q[1] * vx + q[5] * vy + q[9] * vz + q[13]
      const wz = q[2] * vx + q[6] * vy + q[10] * vz + q[14]
      if (wx < mnx) mnx = wx; if (wx > mxx) mxx = wx
      if (wy < mny) mny = wy; if (wy > mxy) mxy = wy
      if (wz < mnz) mnz = wz; if (wz > mxz) mxz = wz
    }
  }
  const cen = { x: (mnx + mxx) / 2, y: (mny + mxy) / 2, z: (mnz + mxz) / 2 }

  /* il centro di ciascun fianco, e quello piu' vicino alla camera */
  const centroDi = (lista) => {
    if (!lista.length) return null
    let a = Infinity, b = Infinity, c = Infinity, d = -Infinity, e2 = -Infinity, f = -Infinity
    for (const m of lista) {
      if (!m.geometry) continue
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox()
      m.updateWorldMatrix(true, false)
      const q = m.matrixWorld.elements
      const bb = m.geometry.boundingBox
      for (const vx of [bb.min.x, bb.max.x]) for (const vy of [bb.min.y, bb.max.y]) for (const vz of [bb.min.z, bb.max.z]) {
        const wx = q[0] * vx + q[4] * vy + q[8] * vz + q[12]
        const wy = q[1] * vx + q[5] * vy + q[9] * vz + q[13]
        const wz = q[2] * vx + q[6] * vy + q[10] * vz + q[14]
        if (wx < a) a = wx; if (wx > d) d = wx
        if (wy < b) b = wy; if (wy > e2) e2 = wy
        if (wz < c) c = wz; if (wz > f) f = wz
      }
    }
    return { x: (a + d) / 2, y: (b + e2) / 2, z: (c + f) / 2 }
  }
  const lati = {}
  for (const k of ['dritta', 'sinistra']) {
    const q = centroDi(perLato[k])
    if (q) lati[k] = { centro: q, dist: Math.hypot(q.x - c.position.x, q.y - c.position.y, q.z - c.position.z) }
  }
  let vicino = null
  for (const k of Object.keys(lati)) if (!vicino || lati[k].dist < lati[vicino].dist) vicino = k
  const bers = vicino ? lati[vicino].centro : cen
  const dx = bers.x - c.position.x, dy = bers.y - c.position.y, dz = bers.z - c.position.z
  const dist = Math.hypot(dx, dy, dz)
  /* quanto la camera guarda ACCANTO al soggetto invece che addosso: l'angolo
     fra la direzione di vista e la congiungente */
  const cos = dist > 0 ? (dir.x * dx + dir.y * dy + dir.z * dz) / dist : 1
  return {
    camera: [c.position.x, c.position.y, c.position.z],
    direzione: [dir.x, dir.y, dir.z],
    centro: [cen.x, cen.y, cen.z],
    bersaglio: [bers.x, bers.y, bers.z],
    lato: vicino,
    doppio: Object.keys(lati).length > 1,
    quanti: { dritta: perLato.dritta.length, sinistra: perLato.sinistra.length, mezzeria: perLato.mezzeria.length },
    distanza: dist,
    scarto: Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI,
    fov: c.fov,
    p: n.p ?? null
  }
}, def)

const n3 = (a) => a.map(v => +v.toFixed(3))
const mediana = (a) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)] }

console.log(`\n  BASELINE  ${GIRI} giri x ${QUANTI} campioni  ·  1 unita = ${M_PER_UNITA} m`)

for (const battuta of BATTUTE) {
  const def = SOGGETTI[battuta]
  if (!def) { console.log(`  ${battuta}: soggetto non dichiarato in SOGGETTI`); continue }
  const arco = await trovaArco(pg, battuta)
  if (!arco) { console.log(`  ${battuta}: battuta non trovata`); continue }

  console.log(`\n  ── ${battuta} — ${def.cosa}   (arco ${(arco.da * 100).toFixed(0)}-${(arco.a * 100).toFixed(0)}%)`)
  console.log('     k   p        presenza  occlusa   camera (unita)              dist    scarto')

  const perCampione = Array.from({ length: QUANTI }, () => ({ pres: [], occ: [] }))
  let ultimaPosa = []

  for (let g = 0; g < GIRI; g++) {
    for (let k = 0; k < QUANTI; k++) {
      await vaiA(pg, arco.da + (arco.a - arco.da) * (k / (QUANTI - 1)))
      await attendiCameraFerma(pg)
      const m = await pg.evaluate(misuraInPagina, { def, conColpevoli: false })
      if (m.rotto) continue
      const d = await dovEra(def)
      const pres = 100 * m.visibili / m.quadro
      const occ = m.nudi > 0 ? 100 * (1 - m.visibili / m.nudi) : null
      perCampione[k].pres.push(pres)
      if (occ !== null) perCampione[k].occ.push(occ)
      if (g === GIRI - 1) ultimaPosa[k] = d
    }
  }

  for (let k = 0; k < QUANTI; k++) {
    const c = perCampione[k]
    if (!c.pres.length) { console.log(`     ${k}   nessuna misura riuscita`); continue }
    const d = ultimaPosa[k] || {}
    const cam = d.camera ? n3(d.camera).join(' ') : '?'
    console.log(`     ${k}   ${(d.p ?? 0).toFixed(3)}   ` +
      `${Math.min(...c.pres).toFixed(2)}%` +
      `${c.pres.length > 1 ? '–' + Math.max(...c.pres).toFixed(2) + '%' : '      '}  ` +
      `${c.occ.length ? Math.max(...c.occ).toFixed(1) + '%' : '  n/d'}   ` +
      `${cam.padEnd(26)}  ${(d.distanza ?? 0).toFixed(2)}  ${(d.scarto ?? 0).toFixed(1)}° ${d.lato || ''}`)
  }

  const tutte = perCampione.flatMap(c => c.pres)
  const occTutte = perCampione.flatMap(c => c.occ)
  console.log(`     ---- su ${tutte.length} misure: presenza min ${Math.min(...tutte).toFixed(2)}%, ` +
    `mediana ${mediana(tutte).toFixed(2)}%, max ${Math.max(...tutte).toFixed(2)}%`)
  if (occTutte.length) {
    console.log(`          occlusione min ${Math.min(...occTutte).toFixed(1)}%, ` +
      `mediana ${mediana(occTutte).toFixed(1)}%, max ${Math.max(...occTutte).toFixed(1)}%`)
  }
  const migliore = ultimaPosa.find(Boolean)
  if (migliore) {
    if (migliore.doppio) {
      console.log(`          SOGGETTO DOPPIO: ${migliore.quanti.sinistra} mesh a sinistra, ` +
        `${migliore.quanti.dritta} a dritta, ${migliore.quanti.mezzeria} sulla mezzeria.`)
      console.log('          Lo scarto e misurato verso il fianco PIU VICINO, non verso il centro')
      console.log('          dei due -- che cadrebbe sulla mezzeria, dove non c e niente da guardare.')
    }
    console.log(`          bersaglio (${migliore.lato || 'centro'}) a ${n3(migliore.bersaglio).join(', ')} unita ` +
      `= ${migliore.bersaglio.map(v => (v * M_PER_UNITA).toFixed(2)).join(', ')} m`)
  }
  console.log('\n     IL NUMERO DA PORTARSI DIETRO E IL MINIMO, non la mediana:')
  console.log(`     presenza ${Math.min(...tutte).toFixed(2)}%` +
    (occTutte.length ? `, occlusione ${Math.max(...occTutte).toFixed(1)}%` : ''))
}

await browser.close(); preview.kill(); process.exit(0)
