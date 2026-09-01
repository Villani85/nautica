/**
 * COSA C'E' DENTRO IL MONDO -- l'inventario dell'arredo e delle plafoniere,
 * in metri nel frame del mondo (x lungo il percorso, y in alto, z di lato).
 *
 *     node strumenti/inventario-mondo.mjs
 *
 * Nel provino l'ambiente si vedeva grigio e vuoto, e non si poteva dire se i
 * tubi mancassero o fossero fuori quadro. Un fotogramma non risponde; una
 * tabella si'. Legge `__nautica.inventarioMondo()` dal sito servito.
 */
import { apriBrowser } from './browser.mjs'
import { anteprima } from './anteprima.mjs'

const a = await anteprima()
const browser = await apriBrowser()
try {
  const pg = await browser.newPage()
  await pg.setViewportSize({ width: 1440, height: 900 })
  await pg.goto(a.indirizzo + '?ispeziona=1', { waitUntil: 'load' })
  await pg.waitForFunction(() => window.__nautica?.mondo()?.ancorato === true, null, { timeout: 120000 })
  const inv = await pg.evaluate(() => window.__nautica.inventarioMondo())
  if (!inv) { console.log('  nessun inventario: il mondo non espone niente'); process.exit(2) }
  const perTipo = {}
  for (const o of inv) {
    const k = `${o.in}/${o.tipo}`
    perTipo[k] ??= { n: 0, xMin: Infinity, xMax: -Infinity, yMin: Infinity, yMax: -Infinity, zMin: Infinity, zMax: -Infinity }
    const t = perTipo[k]; t.n++
    t.xMin = Math.min(t.xMin, o.min[0]); t.xMax = Math.max(t.xMax, o.max[0])
    t.yMin = Math.min(t.yMin, o.min[1]); t.yMax = Math.max(t.yMax, o.max[1])
    t.zMin = Math.min(t.zMin, o.min[2]); t.zMax = Math.max(t.zMax, o.max[2])
  }
  console.log(`  ${inv.length} pezzi`)
  for (const [k, t] of Object.entries(perTipo)) {
    console.log(`  ${k.padEnd(36)} ${String(t.n).padStart(4)}  x ${t.xMin.toFixed(2)}..${t.xMax.toFixed(2)}  y ${t.yMin.toFixed(2)}..${t.yMax.toFixed(2)}  z ${t.zMin.toFixed(2)}..${t.zMax.toFixed(2)}`)
  }
  if (process.env.TUTTO) for (const o of inv) console.log(`    ${o.in}/${o.tipo}  ${o.min.join(',')} .. ${o.max.join(',')}`)
} finally {
  await browser.close()
  a.chiudi?.()
}
