/**
 * UNA VARIANTE PER VOLTA, MISURATA SULLA MASCHERA DEL MATERIALE STESSO.
 *
 *     node strumenti/varianti.mjs
 *
 * Serve a rispondere a «da dove viene questa differenza» senza sceglierla a
 * occhio. Il materiale viene dipinto di emissivo per sapere ESATTAMENTE quali
 * pixel sono suoi, e ogni variante si misura solo su quelli.
 *
 * ─── LE DUE TRAPPOLE CHE QUESTO FILE ESISTE PER NON RIPETERE
 *
 * **1. La regione scelta a occhio.** La prima stesura campionava quattro
 * riquadri decisi guardando l'immagine -- «fiancata alta», «prua», «poppa» --
 * e dava un ammanco di +38 livelli. Sulla maschera vera sono **+26,6**: quei
 * riquadri prendevano in parte la coperta e la murata. E' il terzo errore
 * identico della stessa notte, dopo il vetro e la banda della coperta.
 *
 * **2. La tela letta col 2D.** La seconda stesura leggeva i pixel disegnando
 * la tela WebGL su un canvas 2D. Senza `preserveDrawingBuffer` quella strada
 * restituisce un fotogramma vecchio: **sei varianti diverse davano sei valori
 * IDENTICI**, compreso dipingere lo scafo di rosso. Qui si legge con
 * `gl.readPixels`, e c'e' una variante `PROVA_ROSSO` che DEVE spostare il
 * numero: se non lo sposta, lo strumento e' rotto e il resto non vale niente.
 *
 * ─── COSA HA TROVATO
 *
 * Con camera, cielo, curva tonale e luci allineati fra sito e Blender, lo
 * scafo del sito era **2,51 volte** piu' luminoso del path tracer. La causa e'
 * `side: DoubleSide` in `materiali.js:63`: lo scafo e' un GUSCIO aperto -- un
 * loft, non un solido -- quindi three ne disegna anche la parete interna
 * lontana, che si somma alla vicina. Con `FrontSide` il sito va a **1,02
 * volte**, cioe' combacia entro il 2%.
 *
 * Ma il DoubleSide non si puo' togliere e basta: portando il piano di sezione
 * DENTRO lo scafo, `FrontSide` apre **9.786 pixel di buco**. Regge il taglio.
 */
import { apriBrowser } from './browser.mjs'
import { spawn } from 'node:child_process'
const P = 5197
const pv = spawn('npx', ['vite', 'preview', '--port', P], { shell: true, stdio: 'ignore' })
await new Promise(r => setTimeout(r, 4500))
const br = await apriBrowser({ conGpu: true })
const pg = await (await br.newContext({ viewport: { width: 1000, height: 620 } })).newPage()
await pg.goto(`http://localhost:${P}/?ispeziona=1&senzaDimostra=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })
await pg.evaluate(() => { const d = document.documentElement
  scrollTo(0, Math.round((d.scrollHeight - innerHeight) * 0.36)) })
await pg.waitForTimeout(3000)
const out = await pg.evaluate(() => {
  const n = window.__nautica
  n.nave.rotation.z = 0
  n.camera.position.set(24.3634, 3.0, 37.3310); n.camera.lookAt(0, 1.7209, 0)
  n.camera.fov = 2 * Math.atan((18 / 85) * (620 / 1000)) * 180 / Math.PI
  n.camera.aspect = 1000 / 620; n.camera.updateProjectionMatrix()
  n.render.toneMapping = 6; n.render.toneMappingExposure = 0.5
  n.scena.traverse(o => { if (o.isLight) o.intensity = 0 })
  const acqua = []
  n.scena.traverse(o => { const ms = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : [])
    if (o.visible && ms.some(m => m.name === 'pelo' || m.name === 'velo')) { o.visible = false; acqua.push(o) } })

  const scafi = [], interni = []
  n.scena.traverse(o => { const ms = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : [])
    for (const m of ms) {
      if (m.name === 'scafo' && !scafi.includes(m)) scafi.push(m)
      if (m.name === 'interno' && !interni.includes(o)) interni.push(o)
    } })

  // Si leggono i pixel DIRETTAMENTE dal contesto WebGL. Il primo tentativo
  // disegnava la tela su un canvas 2D e leggeva di li': senza
  // `preserveDrawingBuffer` quella strada restituisce un fotogramma vecchio, e
  // sei varianti diverse davano SEI VALORI IDENTICI -- compreso dipingere lo
  // scafo di rosso. E' la prova che va fatta sempre: se il rosso non si vede,
  // lo strumento e' rotto, non il soggetto.
  const gl = n.render.getContext()
  const misura = () => {
    n.render.render(n.scena, n.camera)
    const c = n.render.domElement
    const k = c.width / 1000
    const x = Math.round(520 * k), w = Math.round(60 * k), h = Math.round(15 * k)
    // readPixels ha l'origine in basso a sinistra
    const y = c.height - Math.round(330 * k)
    const buf = new Uint8Array(w * h * 4)
    gl.readPixels(x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf)
    let r = 0, v = 0, b = 0, q = 0
    for (let i = 0; i < buf.length; i += 4) { r += buf[i]; v += buf[i + 1]; b += buf[i + 2]; q++ }
    return [r / q, v / q, b / q]
  }

  /* DOVE STA LO SCAFO: si dipinge di emissivo e si guarda cosa cambia. Le
   * regioni scelte a occhio mi hanno gia' ingannato due volte stanotte. */
  const tela = () => {
    n.render.render(n.scena, n.camera)
    const c = n.render.domElement
    const buf = new Uint8Array(c.width * c.height * 4)
    gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, buf)
    return { buf, w: c.width, h: c.height }
  }
  const base = tela()
  const em = scafi.map(m => m.emissive.getHex())
  scafi.forEach(m => { m.emissive.setRGB(1, 0, 0) })
  const rosso = tela()
  scafi.forEach((m, i) => { m.emissive.setHex(em[i]) })
  let xmin = 1e9, xmax = -1, ymin = 1e9, ymax = -1, quanti = 0
  for (let i = 0; i < base.buf.length; i += 4) {
    if (!(rosso.buf[i] - base.buf[i] > 24 && rosso.buf[i] > rosso.buf[i + 1] + 24)) continue
    const p = i / 4, x = p % base.w, yy = base.h - 1 - ((p / base.w) | 0)
    if (x < xmin) xmin = x; if (x > xmax) xmax = x
    if (yy < ymin) ymin = yy; if (yy > ymax) ymax = yy
    quanti++
  }
  const k = base.w / 1000
  // la maschera, ridotta a 1000x620 e serializzata: 1 dove c'e' lo scafo
  const m = new Uint8Array(1000 * 620)
  for (let i = 0; i < base.buf.length; i += 4) {
    if (!(rosso.buf[i] - base.buf[i] > 24 && rosso.buf[i] > rosso.buf[i + 1] + 24)) continue
    const p = i / 4
    const x = Math.round((p % base.w) / k)
    const y = Math.round((base.h - 1 - ((p / base.w) | 0)) / k)
    if (x >= 0 && x < 1000 && y >= 0 && y < 620) m[y * 1000 + x] = 1
  }
  // media sulla maschera, non su un riquadro scelto a occhio
  const mask = []
  for (let i = 0; i < base.buf.length; i += 4) {
    if (rosso.buf[i] - base.buf[i] > 24 && rosso.buf[i] > rosso.buf[i + 1] + 24) mask.push(i)
  }
  const misuraMask = () => {
    n.render.render(n.scena, n.camera)
    const c = n.render.domElement
    const buf = new Uint8Array(c.width * c.height * 4)
    gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, buf)
    let l = 0
    for (const i of mask) l += 0.2126 * buf[i] + 0.7152 * buf[i + 1] + 0.0722 * buf[i + 2]
    return l / mask.length
  }
  const res = { quanti, riquadro: `x ${(xmin / k).toFixed(0)}-${(xmax / k).toFixed(0)}`, v: {} }
  res.v.comeSta = misuraMask()
  const col = scafi.map(m => m.color.getHex())
  scafi.forEach(m => { m.color.setHex(0xff0000) })
  res.v.PROVA_ROSSO = misuraMask()
  scafi.forEach((m, i) => { m.color.setHex(col[i]) })
  const lat = scafi.map(m => m.side)
  scafi.forEach(m => { m.side = 0; m.needsUpdate = true })
  res.v.frontSide = misuraMask()
  scafi.forEach((m, i) => { m.side = lat[i]; m.needsUpdate = true })
  interni.forEach(o => { o.visible = false })
  res.v.senzaInterno = misuraMask()
  interni.forEach(o => { o.visible = true })
  const ei = scafi.map(m => m.envMapIntensity)
  scafi.forEach(m => { m.envMapIntensity = 0 })
  res.v.senzaAmbiente = misuraMask()
  scafi.forEach((m, i) => { m.envMapIntensity = ei[i] })
  const ru = scafi.map(m => m.roughness)
  scafi.forEach(m => { m.roughness = 1; m.needsUpdate = true })
  res.v.rugosita1 = misuraMask()
  scafi.forEach((m, i) => { m.roughness = ru[i]; m.needsUpdate = true })
  const pa = scafi.map(m => m.onBeforeCompile)
  scafi.forEach(m => { m.onBeforeCompile = () => {}; m.customProgramCacheKey = () => 'liscio'; m.needsUpdate = true })
  res.v.senzaBuccia = misuraMask()
  scafi.forEach((m, i) => { m.onBeforeCompile = pa[i]; m.needsUpdate = true })

  /* E LA SEZIONE? Il DoubleSide potrebbe servire a chiudere il taglio. Si
   * porta il piano DENTRO lo scafo e si guarda quanti pixel di sfondo
   * compaiono con FrontSide che con DoubleSide non c'erano. */
  const sez = n.sezione.costante
  n.sezione.costante = 0
  const dueLati = tela()
  scafi.forEach(m => { m.side = 0; m.needsUpdate = true })
  const unLato = tela()
  scafi.forEach((m, i) => { m.side = lat[i]; m.needsUpdate = true })
  n.sezione.costante = sez
  let buchi = 0
  for (let i = 0; i < dueLati.buf.length; i += 4) {
    const pieno = dueLati.buf[i] + dueLati.buf[i+1] + dueLati.buf[i+2] > 12
    const vuoto = unLato.buf[i] + unLato.buf[i+1] + unLato.buf[i+2] <= 12
    if (pieno && vuoto) buchi++
  }
  res.buchi = buchi

  acqua.forEach(o => { o.visible = true })
  return { res, scafi: scafi.length, interni: interni.length }
})
console.log(`${out.scafi} materiali scafo, ${out.interni} nodi "interno"`)
console.log(`lo scafo copre ${out.res.quanti} pixel  ${out.res.riquadro}`)
console.log('  Cycles sulla stessa maschera: 26,5 di luminanza')
console.log(`  col taglio DENTRO lo scafo, FrontSide apre ${out.res.buchi} pixel di buco`)
for (const [n2, v] of Object.entries(out.res.v)) {
  console.log(`  ${n2.padEnd(14)} ${v.toFixed(1).padStart(6)}   ${(v / 26.5).toFixed(2)}x Cycles`)
}
await br.close(); pv.kill(); process.exit(0)
