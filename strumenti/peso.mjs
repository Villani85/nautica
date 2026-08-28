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
/**
 * --- IL CANCELLO MISURA dist/, CHE NON E' VERSIONATA
 *
 * Quindi il suo verdetto dipende da quando si e' compilato l'ultima volta, e
 * non lo diceva. Successo davvero, su due macchine nello stesso quarto d'ora:
 * qui verde, su un clone con una dist/ vecchia di decine di commit CINQUE
 * RIGHE FALSO -- dentro c'erano ancora i font da 67 KB di due famiglie fa.
 * Il cancello confrontava la pagina di oggi con la build di ieri, senza dire
 * che stava misurando il passato.
 *
 * Un rosso falso insegna a ignorare i rossi, che e' il modo in cui un
 * cancello muore. Percio': se una sorgente e' piu' nuova della build, questo
 * strumento NON emette un verdetto -- dice cosa manca e quanto costa.
 * Rifiutarsi e' piu' onesto che compilare di nascosto.
 */
function piuRecente (cartella) {
  let m = 0
  for (const f of readdirSync(cartella, { recursive: true })) {
    const q = join(cartella, String(f))
    let st
    try { st = statSync(q) } catch { continue }
    if (st.isFile() && st.mtimeMs > m) m = st.mtimeMs
  }
  return m
}
const sorgenti = Math.max(piuRecente('src'), statSync('index.html').mtimeMs)
if (sorgenti > piuRecente(dist)) {
  console.error('')
  console.error('STANTIO: dist/ e piu vecchia di src/ o di index.html.')
  console.error('Questo cancello misurerebbe una build che non corrisponde alla pagina,')
  console.error('e un verdetto sul passato non e un verdetto. Esegui `npm run build`.')
  process.exit(2)
}

cammina(dist)
if (!voci.length) { console.error('dist/ e\' vuota'); process.exit(1) }

const kb = (n) => (n / 1024).toFixed(1).replace('.', ',') + ' KB'
/**
 * Oltre il megabyte si scrive in MB, perche' "1440,0 KB" e' un numero che
 * nessuno legge come "un megabyte e mezzo" -- e questa tabella esiste per
 * essere letta in dieci secondi da qualcuno che non si fida.
 */
const misura = (n) => n >= 1024 * 1024
  ? (n / 1048576).toFixed(2).replace('.', ',') + ' MB'
  : kb(n)

/** I filmati del salone, che il sito serve da `public/` e non da `dist/assets`. */
let byteFilmati = 0
try {
  for (const f of readdirSync('public/filmati')) {
    if (f.endsWith('.mp4')) byteFilmati += statSync('public/filmati/' + f).size
  }
} catch { /* nessuna cartella */ }
/** I modelli, stessa ragione. */
let byteModelli = 0
let byteImpianto = 0
try {
  for (const f of readdirSync('public/modelli')) {
    if (!f.endsWith('.glb')) continue
    const n = statSync('public/modelli/' + f).size
    byteModelli += n
    if (f === 'impianto.glb') byteImpianto = n
  }
} catch { /* nessuna cartella */ }
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
  ['Critical path to first text, fonts excluded (gzip)', somma(senzaFont, 'gz')],
  ['— of which JavaScript', somma(jsCritico, 'gz')],
  ['Fonts, self-hosted and subset', somma(font, 'gz')],
  ['3D engine, loaded on approach (gzip)', somma(jsDopo, 'gz')],
  /**
   * --- LE DUE RIGHE CHE MANCAVANO, ED ERANO IL 70% DEL CONTO
   *
   * Un collaudo ha misurato i byte veri sul filo fino al primo fotogramma
   * DISEGNATO: 2,03 MiB, di cui 1,44 di filmati. La tabella si intitolava
   * "the numbers, measured" e i filmati non comparivano da nessuna parte --
   * la parola "video" non era in tutto il documento.
   *
   * Il numero pubblicato non era falso: descriveva un'altra cosa, cioe' il
   * percorso fino al primo TESTO dipinto. Ma un sito che pubblica il proprio
   * peso come prova di onesta' non puo' lasciare fuori la voce piu' pesante e
   * chiamare "critical path" il 0,7% del conto.
   *
   * Il totale si somma da cio' che gia' si misura: percorso critico, font,
   * motore, modelli, filmati. Non e' il numero del browser -- che dipende
   * anche dalla compressione del server -- ed e' per questo che la riga dice
   * "before the first rendered frame" e non "measured in Chrome".
   */
  ['Saloon footage, two clips', byteFilmati],
  /**
   * --- DUE RIGHE CHE STAVANO FUORI DAL CANCELLO
   *
   * «3D models downloaded» e «of which the mechanism» erano pubblicate ma non
   * controllate, e la seconda era invecchiata in silenzio: diceva 310 KB, che
   * e' il meccanismo di PRIMA dello scambio fra smussi geometrici e mappa
   * normale -- un modello che il sito non spedisce piu' da parecchi commit.
   * Nessuno se n'e' accorto perche' l'unico a controllare era questo file, e
   * qui non c'erano. Una cifra pubblicata che nessun cancello legge non e'
   * "misurata": e' dichiarata, cioe' esattamente cio' che il sito rimprovera
   * agli altri.
   */
  ['3D models downloaded', byteModelli],
  ['— of which the mechanism', byteImpianto],
  ['Total before the first rendered frame',
    somma(critico, 'gz') + somma(jsDopo, 'gz') + byteModelli + byteFilmati]
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
  const grezzo = m[1].trim()
  /**
   * La virgola decimale: la pagina scrive "1,38 MB" perche' cosi' scrive
   * tutta la tabella, e `parseFloat("1,38")` restituisce 1 -- senza errore.
   * Il cancello diceva falso su una riga identica alla misura. Un lettore che
   * legge cio' che il proprio scrittore scrive deve parlarne la lingua.
   */
  const dichiarato = parseFloat(grezzo.replace(',', '.')) * (/MB/i.test(grezzo) ? 1024 : 1)
  // per le righe in MB la tolleranza da 0,3 KB sarebbe piu' fine
  // dell'arrotondamento a due decimali della riga stessa (0,01 MB = 10,5 KB)
  const toll = /MB/i.test(grezzo) ? 10.5 : TOLLERANZA
  const ok = Math.abs(dichiarato - misurato) <= toll
  /**
   * Con `--scrivi` si riscrive SEMPRE, non solo quando il cancello e' rosso.
   * Riscrivere solo fuori tolleranza lascerebbe accumulare lo scarto fin
   * sotto il pelo: ogni volta dentro di un soffio, e dopo cinque modifiche la
   * riga e' falsa senza che nessun passaggio l'abbia mai fatta diventare tale.
   */
  if (SCRIVI) {
    const nuovo = misura(byte)
    if (nuovo !== m[1].trim()) {
      paginaNuova = paginaNuova.replace(ancora + m[1] + '</dd>', ancora + nuovo + '</dd>')
    }
  }
  console.log(`  ${ok ? 'OK   ' : 'FALSO'}  ${etichetta.padEnd(42)} ` +
              `dichiara ${m[1].trim().padStart(9)}, misura ${misura(byte).padStart(9)}`)

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
      const nuovo = misura(byte)
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
      scarti.push(`«${etichetta}» dichiara ${m[1].trim()} ma la build ne misura ${misura(byte)}`)
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
