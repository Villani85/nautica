/**
 * DI CHI SONO QUESTI PIXEL, E QUEL MATERIALE RICEVE DAVVERO L'AMBIENTE.
 *
 * Guardando un fotogramma si vede *che* qualcosa non va e non *di chi* e'. Una
 * banda scura su una sovrastruttura puo' essere il vetro, la sua cornice,
 * l'interno visto attraverso, o l'ombra della coperta -- sono quattro cure
 * diverse, e a occhio si scelgono a caso.
 *
 * Questo strumento non deduce: **dipinge**. Un materiale per volta viene reso
 * emissivo rosso, si ri-disegna, e i pixel che cambiano SONO i suoi. La
 * maschera e' esatta, non stimata.
 *
 * ─── LA TRAPPOLA CHE HA FATTO SBAGLIARE LA PRIMA STESURA
 *
 * La prima versione era piu' furba e per questo rotta: codificava l'indice del
 * materiale nel canale rosso — l'i-esimo materiale usciva a `(i+1)*8` — e
 * leggeva l'istogramma della regione in UN SOLO disegno, invece di uno per
 * materiale.
 *
 * Fra la scrittura e la lettura pero' ci sono **ACES e la codifica sRGB**, che
 * non sono lineari: l'indice esce da quel tubo cambiato, e la decodifica e'
 * un sorteggio. Rispondeva che la banda scura sotto le finestre era la
 * **coperta**, cioe' il teak, che li' non c'e' proprio. Un risultato assurdo,
 * ed e' stata la sua assurdita' a salvarlo — se avesse detto «lo scafo» ci
 * avrei creduto.
 *
 * La regola: **un canale colore non e' un canale dati** finche' non si e'
 * verificato che fra scrittura e lettura non ci sia una curva. Un disegno per
 * materiale costa 45 fotogrammi e non ha questo problema.
 *
 * ─── E L'ALTRA, CHE E' COSTATA DI PIU'
 *
 * Prima ancora avevo misurato una regione scelta A OCCHIO sul ritaglio
 * ingrandito, convertendola a mano in percentuali della tela. Sbagliata: la
 * banda che credevo vetro stava dieci punti piu' in alto. Ho misurato che il
 * vetro «non risponde all'ambiente» — luminanza 34,64 identica a quattro
 * decimali moltiplicando l'ambiente per sei — e ho concluso che il
 * collegamento fosse morto. Non lo era: stavo misurando la coperta.
 *
 * Sui pixel giusti, trovati dalla maschera, l'ambiente arriva eccome:
 * **28,96 -> 53,29** con lo stesso moltiplicatore. Da qui il fatto che lo
 * strumento **non accetti una regione**: la trova.
 *
 * USO
 *   node strumenti/proprietari.mjs
 *   AMBIENTE=sovra_vetro node strumenti/proprietari.mjs   # e verifica l'ambiente
 *   SOGLIA=60 CAMERA_SITO="px py pz mx my mz fuoco" ...
 */
import { apriBrowser } from './browser.mjs'
import { spawn } from 'node:child_process'

const [px, py, pz, mx, my, mz, fuoco] = (process.env.CAMERA_SITO ||
  '24.3634 3.0000 37.3310 0 1.7209 0 85').split(/\s+/).map(Number)
const L_SCURO = Number(process.env.SOGLIA || 60)
const QUALE = process.env.AMBIENTE || null
const PORTA = process.env.PORTA_COLLAUDO || 5189
const LARGO = 1000, ALTO = 620

const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
await new Promise(r => setTimeout(r, 4500))
const browser = await apriBrowser({ conGpu: true })
const pg = await (await browser.newContext({ viewport: { width: LARGO, height: ALTO } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })
const y = await pg.evaluate(() => {
  const r = document.querySelector('#dimostrazione').getBoundingClientRect()
  return Math.round(r.top + scrollY + r.height * 0.30)
})
await pg.evaluate((y) => scrollTo(0, y), y)
await pg.waitForTimeout(2500)

const out = await pg.evaluate(([px, py, pz, mx, my, mz, fuoco, LARGO, ALTO, L_SCURO, QUALE]) => {
  const n = window.__nautica
  n.camera.position.set(px, py, pz); n.camera.lookAt(mx, my, mz)
  n.camera.fov = 2 * Math.atan(12 / fuoco) * 180 / Math.PI
  n.camera.aspect = LARGO / ALTO; n.camera.updateProjectionMatrix()

  const mats = []; const visti = new Set()
  n.scena.traverse((o) => {
    const ms = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : [])
    for (const m of ms) if (!visti.has(m.uuid)) { visti.add(m.uuid); mats.push({ m, o: o.name || o.type }) }
  })

  const pixel = () => {
    n.render.render(n.scena, n.camera)
    const c = n.render.domElement
    const g = document.createElement('canvas'); g.width = c.width; g.height = c.height
    g.getContext('2d').drawImage(c, 0, 0)
    return { d: g.getContext('2d').getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height }
  }
  const L = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]
  /** un pixel e' "suo" se dipingendolo di rosso e' cambiato E ora e' rosso:
   *  il secondo test scarta i pixel che cambiano per il riflesso altrui */
  const suo = (r, b, i) => r.d[i] - b.d[i] > 24 && r.d[i] > r.d[i + 1] + 24

  const base = pixel()
  const scuri = []
  for (let i = 0; i < base.d.length; i += 4) if (L(base.d, i) < L_SCURO) scuri.push(i)

  const proprietari = []
  let scelto = null
  for (const { m, o } of mats) {
    if (!m.emissive) continue
    const e = m.emissive.getHex(), op = m.opacity
    m.emissive.setRGB(1, 0, 0); m.opacity = 1
    const r = pixel()
    m.emissive.setHex(e); m.opacity = op
    let q = 0
    for (const i of scuri) if (suo(r, base, i)) q++
    if (q > 20) proprietari.push({ nome: m.name || '(senza nome)', tipo: m.type, nodo: o, px: q })
    if (QUALE && m.name === QUALE) {
      const miei = []
      for (let i = 0; i < base.d.length; i += 4) if (suo(r, base, i)) miei.push(i)
      scelto = { m, miei }
    }
  }
  proprietari.sort((a, b) => b.px - a.px)

  let ambiente = null
  if (scelto && scelto.miei.length) {
    const med = (im) => scelto.miei.reduce((a, i) => a + L(im.d, i), 0) / scelto.miei.length
    const prima = med(base)
    const s = scelto.m.envMapIntensity
    scelto.m.envMapIntensity = (s || 1) * 6
    const dopo = med(pixel())
    scelto.m.envMapIntensity = s
    ambiente = { nome: QUALE, px: scelto.miei.length, prima, dopo, envMap: !!scelto.m.envMap }
  }
  return { scuri: scuri.length, proprietari, ambiente, materiali: mats.length }
}, [px, py, pz, mx, my, mz, fuoco, LARGO, ALTO, L_SCURO, QUALE])

console.log(`  ${out.materiali} materiali - ${out.scuri} pixel sotto luminanza ${L_SCURO}`)
console.log('  DI CHI SONO (solo chi ne possiede piu di 20):')
for (const p of out.proprietari) {
  console.log(`    ${String(p.px).padStart(6)} px   ${p.nome.padEnd(16)} [${p.tipo}]`)
}
const noti = out.proprietari.reduce((a, p) => a + p.px, 0)
console.log(`    ${String(out.scuri - noti).padStart(6)} px   nessun materiale (sfondo: qui la tela e senza il cielo CSS)`)

if (out.ambiente) {
  const a = out.ambiente
  const arriva = a.dopo > a.prima + 0.5
  console.log(`\n  AMBIENTE su "${a.nome}" (${a.px} px, envMap ${a.envMap ? 'collegata' : 'ASSENTE'}):`)
  console.log(`    luminanza ${a.prima.toFixed(2)} -> ${a.dopo.toFixed(2)} moltiplicando l ambiente per 6`)
  console.log(`    -> ${arriva ? "l ambiente ARRIVA" : "l ambiente NON arriva: il collegamento e morto"}`)
  if (!arriva) { await browser.close(); preview.kill(); process.exit(1) }
}
await browser.close(); preview.kill(); process.exit(0)
