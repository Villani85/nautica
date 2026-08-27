/**
 * ISOLARE I PIXEL DEL SOGGETTO, E MISURARE SOLO QUELLI.
 *
 *     node strumenti/maschera-soggetto.mjs
 *     QUOTA=0.375 MATERIALI=acciaio,lucido,carter node strumenti/maschera-soggetto.mjs
 *
 * --- PERCHE' ESISTE
 *
 * Cercando perche' il meccanismo e' illeggibile alla battuta della tesi, ho
 * misurato per un'ora dentro un rettangolo scelto a occhio, e ogni intervento
 * rispondeva «non fa niente»: l'ambiente moltiplicato per cinque, l'ombra
 * tolta, il velo dell'acqua azzerato, una luce di chiave. Tutto zero.
 *
 * Poi ho provato a mettere l'EMISSIVA sui materiali del meccanismo. L'emissiva
 * si somma al pixel a prescindere dalla luce: se accendendola non cambia
 * niente, quei pixel non sono del soggetto. Non cambiava niente.
 *
 * Il meccanismo e' il **3,18% del quadro**, una fascia alta un decimo di
 * schermo. Il mio rettangolo era per nove decimi acqua, e diluiva ogni effetto
 * sotto il rumore. Le quattro conclusioni erano tutte false.
 *
 * --- COME FUNZIONA
 *
 * 1. si disegna il fotogramma normale;
 * 2. si accende l'emissiva rossa sui materiali del soggetto e si ridisegna;
 * 3. i pixel in cui il rosso e' salito SONO il soggetto -- e' una maschera
 *    esatta, non una stima;
 * 4. si spegne l'emissiva e si misura solo dentro la maschera.
 *
 * Tutto dentro la stessa chiamata: la nave rolla e il mare si muove, e fra due
 * catture separate cambia il 24% dei pixel.
 *
 * Vale per qualunque soggetto: basta dargli i nomi dei suoi materiali. Ed e'
 * il motivo per cui `materiali.js` adesso da' un nome a tutti.
 */
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'

const QUOTA = Number(process.env.QUOTA || 0.375)
const MATERIALI = (process.env.MATERIALI ||
  'acciaio,lucido,carter,motore,tenuta,gomma,cavo,bronzo,sezione').split(',')
const PORTA = process.env.PORTA_COLLAUDO || 5210

const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
await new Promise(r => setTimeout(r, 4000))
const browser = await chromium.launch({ channel: 'chrome', headless: false })
const pg = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })
await pg.evaluate((q) => {
  const H = document.documentElement.scrollHeight - innerHeight
  scrollTo(0, Math.round(H * q))
}, QUOTA)
await pg.waitForTimeout(3000)

const r = await pg.evaluate((nomi) => {
  const n = window.__nautica
  const suoi = new Set(nomi)
  const mats = []
  n.nave.traverse(o => {
    if (!o.isMesh || !o.material) return
    for (const m of [].concat(o.material)) if (suoi.has(String(m.name)) && !mats.includes(m)) mats.push(m)
  })
  if (!mats.length) return { rotto: 'nessun materiale con quei nomi: sono cambiati?' }
  const t = n.render.domElement
  const c = document.createElement('canvas'); c.width = t.width; c.height = t.height
  const x = c.getContext('2d')
  const leggi = () => { n.render.render(n.scena, n.camera); x.drawImage(t, 0, 0); return x.getImageData(0, 0, c.width, c.height).data }
  const base = leggi()
  mats.forEach(m => m.emissive && m.emissive.setHex(0xff0000))
  const marc = leggi()
  mats.forEach(m => m.emissive && m.emissive.setHex(0x000000))
  const mask = []
  for (let i = 0; i < base.length; i += 4) if (marc[i] - base[i] > 10) mask.push(i)
  if (!mask.length) return { rotto: 'il soggetto non e in quadro a questa quota, o i suoi materiali non hanno emissiva' }
  const v = mask.map(i => 0.2126 * base[i] + 0.7152 * base[i + 1] + 0.0722 * base[i + 2]).sort((a, b) => a - b)
  const xs = mask.map(i => (i / 4) % c.width).sort((a, b) => a - b)
  const ys = mask.map(i => Math.floor((i / 4) / c.width)).sort((a, b) => a - b)
  const q = (a, p) => a[Math.floor(a.length * p)]
  return {
    materiali: mats.length, pixel: mask.length, quadro: c.width * c.height,
    media: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1),
    p05: Math.round(q(v, 0.05)), p50: Math.round(q(v, 0.5)), p95: Math.round(q(v, 0.95)),
    riquadro: [+(q(xs, .05) / c.width).toFixed(3), +(q(xs, .95) / c.width).toFixed(3),
               +(q(ys, .05) / c.height).toFixed(3), +(q(ys, .95) / c.height).toFixed(3)]
  }
}, MATERIALI)
await browser.close(); preview.kill()

if (r.rotto) { console.error('  ROTTO  ' + r.rotto); process.exit(1) }
console.log(`il soggetto a quota ${QUOTA}, isolato con l emissiva`)
console.log(`  materiali ${r.materiali}   pixel ${r.pixel} su ${r.quadro}  (${(100 * r.pixel / r.quadro).toFixed(2)}% del quadro)`)
console.log(`  riquadro  x ${r.riquadro[0]}..${r.riquadro[1]}   y ${r.riquadro[2]}..${r.riquadro[3]}`)
console.log(`  luminanza media ${r.media}   p05 ${r.p05}  p50 ${r.p50}  p95 ${r.p95}   gamma ${r.p95 - r.p05}`)
