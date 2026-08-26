import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * ESPORTA LA GEOMETRIA DEL MECCANISMO DALLA PAGINA VIVA.
 *
 *     node strumenti/esporta-meccanismo.mjs [fuori.json]
 *
 * ─── PERCHE' ESISTE
 *
 * Il meccanismo va cotto in Blender: il tempo reale non arriva al fotorealismo
 * — misurato, non supposto — e cotto offline lo stesso pezzo diventa una
 * fotografia, restando guidato dalla fisica perche' e' l'angolo della pinna a
 * scegliere il fotogramma.
 *
 * La prima stesura RISCRIVEVA il meccanismo in Python dalle quote di `nave.js`.
 * Funzionava, e creava **due sorgenti di verita' per la stessa geometria**: in
 * un progetto dove superficie e tappo di sezione passano dalla stessa funzione
 * apposta, e' esattamente la cosa da non fare. Alla prima modifica delle
 * ordinate le due sarebbero divergute in silenzio.
 *
 * Quindi la geometria si prende **dalla pagina**, dopo che il sito l'ha
 * costruita: gli stessi vertici, le stesse matrici, gli stessi materiali. Si
 * riesporta e si ricuoce, e non c'e' niente da tenere allineato a mano.
 *
 * ─── PERCHE' NON GLTF
 *
 * `GLTFExporter` sta in `three/examples` e importa `three` con un nome nudo;
 * nel bundle del sito three e' inglobato nei chunk, quindi non c'e' un modulo da
 * riusare e l'import fallisce. Provato. Serializzare a mano costa venti righe e
 * non dipende da niente.
 *
 * ─── COSA ESPORTA
 *
 * Solo i pezzi sotto i 3000 triangoli: lo scafo e' fuori, qui serve il
 * meccanismo. Per ognuno: vertici, indici, matrice mondo e colore del
 * materiale — il colore e' anche l'etichetta con cui `cuoci.py` decide se e'
 * acciaio, bronzo o accento della cinematica.
 */

const INDIRIZZO = process.env.URL || 'http://localhost:4174/nautica/'
const FUORI = process.argv[2] || 'meccanismo.json'
const RADICE = fileURLToPath(new URL('..', import.meta.url))

async function risponde (u) {
  try {
    const c = new AbortController(); const t = setTimeout(() => c.abort(), 3000)
    const r = await fetch(u, { signal: c.signal }); clearTimeout(t); return r.ok
  } catch { return false }
}

let preview = null
if (!(await risponde(INDIRIZZO))) {
  const porta = new URL(INDIRIZZO).port || '4173'
  console.log(`  accendo la preview sulla ${porta}`)
  preview = spawn('npx', ['vite', 'preview', '--port', porta, '--strictPort'],
    { shell: true, stdio: 'ignore', cwd: RADICE })
  for (let i = 0; i < 40 && !(await risponde(INDIRIZZO)); i++) await new Promise(r => setTimeout(r, 500))
  if (!(await risponde(INDIRIZZO))) {
    console.error('  ROTTO  la preview non parte. Compila prima con "npm run build".')
    preview.kill(); process.exit(1)
  }
}

let browser
try { browser = await chromium.launch({ channel: 'chrome', headless: false }) }
catch { browser = await chromium.launch({ headless: false }) }
const pg = await (await browser.newContext({ viewport: { width: 1200, height: 800 } })).newPage()

/**
 * `?ispeziona=1` mette scena e camera su `window.__nautica`. Non e' un vezzo:
 * senza, questa esportazione dovrebbe indovinare la struttura invece di
 * chiederla.
 */
await pg.goto(INDIRIZZO + (INDIRIZZO.includes('?') ? '&' : '?') + 'ispeziona=1',
  { waitUntil: 'domcontentloaded' })
await pg.waitForTimeout(1500)
// la battuta del meccanismo: la sezione e' aperta e la cinematica e' nella sua posa
await pg.evaluate(() => scrollTo(0, 6600))
await pg.waitForTimeout(3000)

const pezzi = await pg.evaluate(() => {
  if (!window.__nautica) return null
  const out = []
  window.__nautica.nave.updateMatrixWorld(true)
  window.__nautica.nave.traverse(o => {
    if (!o.isMesh) return
    const g = o.geometry
    const tri = g.index ? g.index.count / 3 : g.attributes.position.count / 3
    if (tri > 3000) return
    out.push({
      col: o.material.color ? o.material.color.getHexString() : '888888',
      met: o.material.metalness ?? 0.5,
      rug: o.material.roughness ?? 0.5,
      m: Array.from(o.matrixWorld.elements),
      pos: Array.from(g.attributes.position.array),
      idx: g.index ? Array.from(g.index.array) : null
    })
  })
  return out
})
await browser.close()
preview?.kill()

if (!pezzi) {
  console.error('  ROTTO  window.__nautica non c\'e\': la diagnostica ?ispeziona=1 e\' sparita da index.js.')
  process.exit(1)
}
if (!pezzi.length) {
  console.error('  ROTTO  nessun pezzo esportato: la scena non si e\' costruita, o il filtro dei triangoli e\' sbagliato.')
  process.exit(1)
}

writeFileSync(FUORI, JSON.stringify(pezzi))
const tri = pezzi.reduce((s, p) => s + (p.idx ? p.idx.length / 3 : p.pos.length / 9), 0)
const colori = [...new Set(pezzi.map(p => p.col))]
console.log(`  ${pezzi.length} pezzi · ${tri} triangoli · ${(JSON.stringify(pezzi).length / 1048576).toFixed(1)} MB`)
console.log(`  materiali: ${colori.join(' ')}`)
console.log(`  scritto ${FUORI}`)
console.log('\n  poi si cuoce:')
console.log(`  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" -b -P riferimenti/blender/cuoci.py -- ${FUORI} <cartella>`)
