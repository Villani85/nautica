import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
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
const SCRIVI = process.argv.includes('--scrivi')
let paginaNuova = pagina
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
  /**
   * Con `--scrivi` si riscrive SEMPRE, non solo quando il cancello e' rosso.
   * Riscrivere solo fuori tolleranza lascerebbe accumulare lo scarto fin
   * sotto il pelo: ogni volta dentro di un soffio, e dopo cinque modifiche la
   * riga e' falsa senza che nessun passaggio l'abbia mai fatta diventare tale.
   */
  if (SCRIVI) {
    const nuovo = misurato.toFixed(1) + ' KB'
    if (nuovo !== m[1].trim()) {
      paginaNuova = paginaNuova.replace(ancora + m[1] + '</dd>', ancora + nuovo + '</dd>')
    }
  }
  console.log(`  ${ok ? 'OK   ' : 'FALSO'}  ${etichetta.padEnd(42)} ` +
              `dichiara ${m[1].trim().padStart(9)}, misura ${kb(byte).padStart(9)}`)

  /**
   * ─── E LO STESSO NUMERO DETTO IN PROSA
   *
   * Una revisione ha trovato la tabella che dichiarava 181,4 KB e, nove righe
   * piu' sotto, un paragrafo che diceva ancora 180,6. Il cancello non se n'era
   * accorto perche' guardava la tabella: la prosa non era sorvegliata da
   * nessuno, e quindi si era fermata a una misura vecchia.
   *
   * La correzione non e' cambiare 180,6 in 181,4 -- sarebbe di nuovo un numero
   * scritto a mano, che ricomincerebbe a scivolare al primo commit. E' legare
   * anche la frase alla misura: in pagina il numero sta dentro un
   * `<b data-peso="...">` la cui chiave e' L'ETICHETTA STESSA della riga di
   * tabella. Una lista sola, due posti che la leggono -- che e' la regola che
   * questo repo si e' gia' dato per le soglie e per la sezione A.
   */
  const marca = `<b data-peso="${etichetta}">`
  const j = pagina.indexOf(marca)
  if (j >= 0) {
    const vecchio = pagina.slice(j + marca.length, pagina.indexOf('</b>', j))
    const prosa = parseFloat(vecchio.replace(',', '.'))
    const okProsa = Math.abs(prosa - misurato) <= TOLLERANZA
    if (SCRIVI) {
      const nuovo = misurato.toFixed(1) + ' KB'
      if (nuovo !== vecchio.trim()) {
        paginaNuova = paginaNuova.replace(marca + vecchio + '</b>', marca + nuovo + '</b>')
      }
    }
    console.log(`  ${okProsa ? 'OK   ' : 'FALSO'}  ${('— e la stessa cifra in prosa').padEnd(42)} ` +
                `dichiara ${vecchio.trim().padStart(9)}, misura ${kb(byte).padStart(9)}`)
    if (!okProsa && !SCRIVI) {
      scarti.push(`il paragrafo dice ${vecchio.trim()} dove la tabella e la build dicono ${kb(byte)}`)
    }
  }
  if (!ok) {
    /**
     * `--scrivi` riporta i numeri misurati dentro la pagina.
     *
     * Non e' una scorciatoia per far tacere il cancello: e' il verso giusto in
     * cui deve scorrere l'informazione. Una riga che dice «measured on the
     * production build» non ha ragione di essere scritta a mano — la scrive la
     * build. A mano restano solo le righe che una misura non puo' produrre:
     * l'LCP su rete vera e i fotogrammi su un telefono vero, che infatti sono
     * ancora due trattini.
     *
     * Il cancello resta, e serve a chi si dimentica di rigenerare.
     */
    if (!SCRIVI) {
      scarti.push(`«${etichetta}» dichiara ${m[1].trim()} ma la build ne misura ${kb(byte)}`)
    }
  }
}

/**
 * --- E I FILMATI, CHE NESSUNO PESAVA
 *
 * Rilievo di una revisione, e vero: il peso dei filmati veniva stampato ma non
 * poteva far fallire niente. "Un futuro asset da 8-10 MB risulterebbe ancora
 * verde" -- e sarebbe successo davvero: nell'arco di una mattina questo file e'
 * passato da 1,1 a 3,7 MB senza che nessun cancello dicesse una parola, ed e'
 * tornato giu' solo perche' me ne sono accorto io.
 *
 * Il tetto e' una DECISIONE, non una misura, e va detto: 4 MB per tutti i
 * filmati messi insieme. La ragione e' che a circa 600 kbit/s sono una
 * cinquantina di secondi di materiale, e oltre quella soglia il telefono paga
 * due volte -- il trasferimento, e due decodificatori 720p accesi insieme
 * mentre la scena 3D disegna.
 *
 * Non e' differito quanto sembra: il salone e' la PRIMA battuta, quindi il
 * filmato della stanza sta nel percorso di chi apre la pagina.
 */
const TETTO_FILMATI = 4 * 1024 * 1024
let pesoFilmati = 0
const filmati = []
try {
  for (const f of readdirSync('public/filmati')) {
    if (!f.endsWith('.mp4')) continue
    const b = statSync('public/filmati/' + f).size
    pesoFilmati += b
    filmati.push(`${f} ${(b / 1e6).toFixed(2)} MB`)
  }
} catch { /* nessuna cartella: niente da pesare */ }
if (filmati.length) {
  const ok = pesoFilmati <= TETTO_FILMATI
  console.log(`  ${ok ? 'OK   ' : 'FALSO'}  ${'Filmati del salone'.padEnd(42)} ` +
              `${(pesoFilmati / 1e6).toFixed(2)} MB su un tetto di ${(TETTO_FILMATI / 1e6).toFixed(1)}` +
              `   (${filmati.join(', ')})`)
  if (!ok) {
    scarti.push(`i filmati pesano ${(pesoFilmati / 1e6).toFixed(2)} MB contro un tetto di ` +
                `${(TETTO_FILMATI / 1e6).toFixed(1)}. Il tetto e' una decisione, non una misura: ` +
                'se va alzato, va alzato scrivendo perche in strumenti/peso.mjs')
  }
}

if (SCRIVI && paginaNuova !== pagina) {
  writeFileSync('index.html', paginaNuova)
  console.log('\n  index.html riscritto coi numeri misurati')
}

if (scarti.length) {
  console.error('\nI NUMERI PUBBLICATI NON DESCRIVONO PIU\' LA BUILD')
  for (const s of scarti) console.error('  · ' + s)
  console.error('\n  npm run numeri li riporta dentro la pagina.')
  process.exit(1)
}
