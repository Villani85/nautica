import { apriBrowser } from './browser.mjs'
import { anteprima } from './anteprima.mjs'
const a = await anteprima()
const b = await apriBrowser({ conGpu: true })
async function misura (query, etichetta) {
  const pg = await b.newPage()
  const visti = new Map()
  pg.on('response', async (r) => {
    const u = r.url()
    if (!/\/modelli\/|\.glb|\.webp|\.json/.test(u)) return
    try { const buf = await r.body(); visti.set(u.split('/').pop().split('?')[0], buf.length) } catch {}
  })
  await pg.goto(`${a.indirizzo}${query}`, { waitUntil: 'load', timeout: 45000 })
  await pg.waitForTimeout(6000)
  await pg.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
  await pg.waitForTimeout(6000)
  await pg.close()
  const tot = [...visti.values()].reduce((s, v) => s + v, 0)
  console.log(`\n  ${etichetta}`)
  for (const [k, v] of [...visti].sort((x, y) => y[1] - x[1])) console.log(`    ${k.padEnd(28)} ${String(v).padStart(9)} byte`)
  console.log(`    ${'TOTALE'.padEnd(28)} ${String(tot).padStart(9)} byte = ${(tot / 1e6).toFixed(3)} MB`)
  return tot
}
const base = await misura('?ispeziona=1', 'PERCORSO PREDEFINITO')
const mondo = await misura('?ispeziona=1&mondo=1', 'CON ?mondo=1')
console.log(`\n  differenza: ${((mondo - base) / 1e6).toFixed(3)} MB`)
await b.close(); a.ferma()
