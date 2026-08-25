import { readdirSync, readFileSync, statSync } from 'node:fs'
import { gzipSync, brotliCompressSync } from 'node:zlib'
import { join } from 'node:path'

/**
 * Misura il peso della compilazione, separando cio' che sta sul percorso
 * critico da cio' che arriva dopo.
 *
 * Un guasto deve gridare: se la cartella non c'e', esce con errore invece di
 * stampare zero. Uno strumento che in silenzio produce un numero sbagliato e'
 * peggio del numero scritto a mano, perche' quello almeno si vede.
 */
const dist = 'dist'
try { statSync(dist) } catch { console.error('manca dist/: compila prima'); process.exit(1) }

const voci = []
const cammina = (d) => {
  for (const n of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, n.name)
    if (n.isDirectory()) cammina(p)
    else {
      const b = readFileSync(p)
      voci.push({
        p: p.split('\\').join('/'),
        raw: b.length,
        gz: gzipSync(b, { level: 9 }).length,
        br: brotliCompressSync(b).length
      })
    }
  }
}
cammina(dist)
if (!voci.length) { console.error('dist/ e\' vuota'); process.exit(1) }

const kb = (n) => (n / 1024).toFixed(1).replace('.', ',') + ' KB'
const eCritico = (v) => /index\.html$/.test(v.p) || /\/index-[^/]*\.(js|css)$/.test(v.p) || /\.woff2$/.test(v.p)
const critico = voci.filter(eCritico)
const dopo = voci.filter(v => !eCritico(v))
const somma = (a, k) => a.reduce((s, v) => s + v[k], 0)

const riga = (etichetta, v) =>
  `  ${etichetta.padEnd(46)} ${kb(v.raw).padStart(10)}  gzip ${kb(v.gz).padStart(10)}  br ${kb(v.br).padStart(10)}`

console.log('PERCORSO CRITICO — cio\' che serve al primo disegno')
for (const v of critico) console.log(riga(v.p, v))
console.log(riga('TOTALE', { raw: somma(critico, 'raw'), gz: somma(critico, 'gz'), br: somma(critico, 'br') }))

console.log('\nDOPO — caricato solo quando la dimostrazione si avvicina')
for (const v of dopo) console.log(riga(v.p, v))

const js = voci.filter(v => v.p.endsWith('.js'))
console.log(`\nJS TOTALE gzip: ${kb(somma(js, 'gz'))}   (cancello del brief: 250,0 KB)`)
