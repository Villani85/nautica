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

/**
 * ─── I NUMERI IN PAGINA SI VERIFICANO TUTTI, NON SOLO QUELLO CHE E' GIA'
 *     RISULTATO FALSO
 *
 * Il sito pubblica una tabella intitolata «measured on the production build».
 * Per una notte una di quelle righe ha dichiarato zero byte di modelli 3D
 * mentre ne scaricava 280, ed e' stata chiusa con un cancello suo. Ma una
 * revisione ha fatto notare la cosa giusta: erano scivolate anche le altre —
 * 10,2 KB dichiarati contro 11,8 misurati, 1,6 di JavaScript contro 1,8 — e
 * una sezione che si intitola «misurato» deve esserlo per ogni riga, non per
 * quella su cui e' stato acceso un faro.
 *
 * Non e' pedanteria: e' l'unica parte del sito che un giurato puo' verificare
 * in dieci secondi. Se una riga e' falsa, non c'e' ragione di credere alle
 * altre — ed e' il contrario di cio' che il progetto vende.
 *
 * La tolleranza e' di tre decimi di KB, cioe' l'arrotondamento della riga
 * stessa. Piu' stretta vorrebbe dire aggiornare la pagina a ogni virgola del
 * pacchettizzatore; piu' larga vorrebbe dire non misurare.
 */
const pagina = readFileSync('index.html', 'utf8')
const senzaFont = critico.filter(v => !/\.woff2$/.test(v.p))
const jsCritico = senzaFont.filter(v => v.p.endsWith('.js'))
const font = critico.filter(v => /\.woff2$/.test(v.p))
const jsDopo = dopo.filter(v => v.p.endsWith('.js'))

const ATTESI = [
  ['Critical path, fonts excluded (gzip)', somma(senzaFont, 'gz')],
  ['— of which JavaScript', somma(jsCritico, 'gz')],
  ['Fonts, self-hosted and subset', somma(font, 'gz')],
  ['3D engine, loaded only on demand (gzip)', somma(jsDopo, 'gz')]
]

const TOLLERANZA = 0.3
const scarti = []
console.log('\nI NUMERI IN PAGINA')
for (const [etichetta, byte] of ATTESI) {
  /**
   * Si cerca con una ricerca testuale, non con un'espressione regolare: le
   * etichette contengono parentesi e trattini lunghi, e sfuggirle a mano e'
   * un'altra occasione per sbagliare. Qui non serve nessuna espressione.
   */
  const ancora = etichetta + '</dt><dd>'
  const i = pagina.indexOf(ancora)
  const m = i < 0 ? null : [null, pagina.slice(i + ancora.length, pagina.indexOf('</dd>', i))]
  const misurato = byte / 1024
  if (!m) {
    scarti.push(`in index.html non trovo la riga «${etichetta}»: se e' stata rinominata, ` +
                'questo controllo va aggiornato invece che perso')
    continue
  }
  const dichiarato = parseFloat(m[1].replace(',', '.'))
  const ok = Math.abs(dichiarato - misurato) <= TOLLERANZA
  console.log(`  ${ok ? 'OK   ' : 'FALSO'}  ${etichetta.padEnd(42)} ` +
              `dichiara ${m[1].trim().padStart(9)}, misura ${kb(byte).padStart(9)}`)
  if (!ok) {
    scarti.push(`«${etichetta}» dichiara ${m[1].trim()} ma la build ne misura ${kb(byte)}`)
  }
}

if (scarti.length) {
  console.error('\nI NUMERI PUBBLICATI NON DESCRIVONO PIU\' LA BUILD')
  for (const s of scarti) console.error('  · ' + s)
  process.exit(1)
}
