import { misuraPrecarico } from './precarico-comune.mjs'
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

/**
 * I FILMATI, che il sito serve da `public/` e non da `dist/assets`.
 *
 * ─── E SI DISTINGUE CHI E' REFERENZIATO DA CHI NON LO E'
 *
 * DIFETTO SEGNALATO DA UNA REVISIONE, e aveva ragione: qui si sommava la
 * CARTELLA, non il codice. `discesa.mp4` pesa 0,98 MB, non e' nominato da
 * nessuna riga di `src/` -- la «discesa» in pagina e' un effetto CSS, non un
 * video -- e finiva nel totale come se fosse in uso, sotto un'etichetta
 * («Filmati del salone») che per giunta mentiva sul soggetto. Un cancello nato
 * per scovare il gonfiore dei filmati lo avallava.
 *
 * Adesso i due totali si stampano separati. **Il tetto resta sul totale**, e
 * non e' una svista: un file nel repo e' peso che viaggia comunque -- sta in
 * `dist/`, sta su git, e nascondere gli orfani dal conto sarebbe il difetto
 * opposto, cioe' un cancello che non vede quello che spedisce. Cambia che
 * adesso la riga dice **quale parte del budget e' in uso**, e un orfano non
 * puo' piu' passare inosservato.
 */
let byteFilmati = 0
let byteOrfani = 0
const orfani = []
try {
  /* i nomi che il codice nomina davvero: si leggono dal sorgente, non da una
     lista scritta a mano -- una lista a mano diverge, un grep no */
  const nominati = new Set()
  const cerca = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const q = d + '/' + e.name
      if (e.isDirectory()) { cerca(q); continue }
      if (!/\.(js|mjs|html|css)$/.test(e.name)) continue
      for (const m of readFileSync(q, 'utf8').matchAll(/filmati\/([a-z0-9-]+\.mp4)/g)) nominati.add(m[1])
    }
  }
  cerca('src')
  for (const m of readFileSync('index.html', 'utf8').matchAll(/filmati\/([a-z0-9-]+\.mp4)/g)) nominati.add(m[1])
  for (const f of readdirSync('public/filmati')) {
    if (!f.endsWith('.mp4')) continue
    const n = statSync('public/filmati/' + f).size
    byteFilmati += n
    if (!nominati.has(f)) { byteOrfani += n; orfani.push(f) }
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

/**
 * ─── LA TABELLA DEI NUMERI NON E' PIU' IN PAGINA
 *
 * `index.html` pubblicava «The numbers, measured» e questo elenco verificava
 * riga per riga che ogni cifra descrivesse ancora la build. La sezione e'
 * stata tolta su richiesta dell'utente insieme a tutta la prosa di §04 e §05.
 *
 * Il controllo e' stato tolto INSIEME AL SUO SOGGETTO, non aggirato: non c'e'
 * nessuna riga commentata via per far tornare verde un cancello. Se un numero
 * torna in pagina, torna anche la sua riga qui -- la macchina che li confronta
 * e' rimasta intatta sotto, compreso `npm run numeri`.
 *
 * Quello che resta e' cio' che non dipende dalla pagina: i TETTI. Il budget
 * del JavaScript e quello dei filmati non erano dichiarazioni pubbliche, erano
 * vincoli del progetto, e valgono ancora.
 *
 * Va detto chiaro perche' e' una perdita vera: «measured, not declared» era
 * la prova di onesta' del sito, e adesso vive solo nel repository.
 */
/**
 * ─── DORMIENTE, E ADESSO LO DICE
 *
 * Questo elenco e' VUOTO, e il ciclo che lo percorre (poco sotto) gira su zero
 * elementi. Da fuori sembrava un confronto attivo fra i numeri stampati in
 * pagina e quelli misurati dalla build; in realta' non confronta niente da
 * quando le dichiarazioni sono uscite dalla pagina.
 *
 * Un cancello che non puo' fallire non e' un cancello. Lasciarlo sembrare
 * attivo costa la fiducia in tutto il resto della suite; segnarlo dormiente
 * costa una riga.
 *
 * Si risveglia da solo: basta rimettere le coppie [etichetta, byte] quando le
 * dichiarazioni tornano in pagina. Finche' e' vuoto, il referto lo dice.
 */
const ATTESI = []

const TOLLERANZA = 0.3
const SCRIVI = process.argv.includes('--scrivi')
let paginaNuova = pagina
const scarti = []

/**
 * ─── I TETTI DORMONO FINCHE' IL SITO NON E' COMPLETO
 *
 * DECISIONE DEL COMMITTENTE, 1 settembre 2026, con la ragione detta per esteso:
 * «non voglio tetti per il momento, i tetti li mettiamo a sito completo ...
 * altrimenti mi impedisce di completare il sito inutilmente».
 *
 * Ha ragione, e il motivo e' strutturale. Un tetto di peso e' un budget, e un
 * budget si scrive quando si sa cosa ci deve stare dentro. Qui non si sa ancora:
 * il mondo deve essere promosso (e allora `traversata.mp4` sparisce, -1,59 MB),
 * la posa tesa e' appena entrata, il mare dietro il vetro non c'e' ancora. Ogni
 * pezzo che arriva sfonda un tetto tarato su cio' che c'era prima, e il lavoro
 * si ferma per un numero che nessuno aveva ancora deciso.
 *
 * MA NON SI SPENGONO IN SILENZIO. Un cancello che smette di bocciare senza dirlo
 * e' peggio di un cancello che non c'e': nessuno se ne accorge finche' non e'
 * tardi, ed e' esattamente il difetto che questo repo chiama «uno strumento
 * verde non vuol dire pulito». Quindi da qui in avanti il peso si MISURA e si
 * STAMPA a ogni corsa come prima, ma non ferma piu' nessuno, e ogni riga dice
 * a voce alta che il tetto e' addormentato e da quanto lo sfora.
 *
 * PER RIARMARLI: `TETTI_ARMATI = true`. Va fatto a sito completo, quando
 * l'elenco di cio' che viaggia e' definitivo -- e allora i tetti vanno tarati
 * su quelle misure, non su queste.
 */
const TETTI_ARMATI = false
console.log('\nI NUMERI IN PAGINA')
if (!ATTESI.length) {
  console.log('  dorme  ' + 'Confronto pagina/build'.padEnd(42) +
              ' nessuna coppia dichiarata: questo controllo non puo fallire, ' +
              'e non e un verde')
}
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
/**
 * ─── E UN TETTO SUI MODELLI, che non c'era
 *
 * DIFETTO SEGNALATO DALLA REVISIONE nell'unico momento in cui serviva: prima
 * della promozione del mondo, non dopo. Qui c'era il tetto sui filmati e quello
 * sul JavaScript, e per i modelli NIENTE. Sono passati da 1,3 a 3,02 MB in una
 * notte, `traversata-world.glb` da solo pesa piu' di tutti gli altri sommati, e
 * nessun cancello se n'e' accorto perche' nessun cancello li guardava.
 *
 * MISURATO col browser, non letto dal codice -- quello che il visitatore
 * scarica davvero:
 *
 *   percorso predefinito   1.204.334 byte   interni, propulsione, impianto,
 *                                           giroscopio, sovrastruttura, scafo-ao
 *   con ?mondo=1           2.891.207 byte
 *   differenza             1.686.873 byte
 *
 * Il tetto vale su cio' che si scarica SEMPRE. Quello che sta dietro un
 * interruttore non lo paga nessuno, e va dichiarato -- non dedotto dal nome.
 *
 * 1,6 MB e' il tetto: un terzo sopra il peso di oggi. Non e' generoso, e' la
 * misura piu' il margine per un modello in piu'. E QUANDO IL MONDO USCIRA' DAL
 * FLAG questo cancello diventera' ROSSO, ed e' esattamente quello che deve
 * fare: costringere a guardare il peso invece di scoprirlo dopo.
 *
 * La via d'uscita c'e' gia' ed e' misurata: promuovendo il mondo si toglie
 * `traversata.mp4`, che pesa 1.587.637 byte contro i 1.670.304 del mondo. Lo
 * scambio e' quasi pari -- ottantatremila byte netti -- e non tocca ne'
 * qualita' ne' risoluzione. Ma va FATTO, non sperato: il tetto e' li' per
 * ricordarlo.
 */
const TETTO_MODELLI = 1.6 * 1e6

/**
 * Modelli che vivono dietro un interruttore e che nessun visitatore scarica.
 * Si DICHIARANO: dedurlo dal nome sarebbe indovinare, e il giorno in cui uno
 * esce dal flag nessuno se ne accorgerebbe.
 */
/**
 * ─── CHI SCARICA COSA LO DICE IL BROWSER, non un dizionario
 *
 * Qui c'era `DIETRO_INTERRUTTORE`, una mappa scritta a mano che DICHIARAVA
 * quali modelli il visitatore non scarica, e li sottraeva dal totale
 * sorvegliato. Fra di essi `traversata-world.glb`, «?mondo=1, non ancora
 * promosso».
 *
 * Vero quando l'ho scritto. Falso NELLO STESSO LOTTO in cui ho promosso il
 * mondo, e niente ha protestato: una dichiarazione non si accorge di essere
 * smentita. 1,67 MB contati fra «cio' che nessuno scarica» mentre ogni
 * visitatore lo scaricava -- e questo cancello esiste proprio per impedire al
 * peso di crescere di nascosto.
 *
 * L'ha trovato una revisione contando i file del repo: 3,02 MB in
 * `public/modelli/` contro 1,22 dichiarati.
 *
 * LA CURA NON E' AGGIORNARE LA LISTA: E' NON AVERLA. Un file sta dietro un
 * interruttore quando IL BROWSER NON LO CHIEDE, non quando una riga lo afferma.
 * `precarico-comune.mjs` percorre il sito e registra chi viene chiesto e
 * quando; qui si legge quel risultato.
 *
 * COSTA: questo cancello era istantaneo e adesso apre un browser. E' il prezzo
 * di una misura al posto di un'affermazione, e sta scritto nel referto.
 */
/**
 * ─── E SE IL BROWSER NON PARTE, QUESTA RIGA DICE «NON MISURABILE»
 *
 * Aprendo un browser questo cancello ha cambiato specie. Era deterministico --
 * leggeva dimensioni di file, non poteva fallire per ragioni esterne, ed era
 * istantaneo. Adesso eredita l'intera classe di guasti che ha ucciso venti
 * corse: Chromium che non parte, SwiftShader lento, un timeout.
 *
 * Il rischio non e' la lentezza: e' che il cancello del PESO diventi rosso per
 * un motivo che col peso non c'entra. Un rosso che tre volte su cinque e'
 * Chromium insegna a guardare quel cancello con sufficienza, ed e' cosi' che
 * qui hanno perso credibilita' la manopola (misurava la macchina) e il finale
 * (misurava la CI).
 *
 * La forma che tiene entrambe le proprieta' e' gia' in uso in
 * `collaudo-filmato`, `collaudo-finale-vivo` e `collaudo-fluidita`: quando una
 * misura non si puo' fare, QUELLA RIGA dice NON MISURABILE invece di inventare
 * un numero o bocciare tutto. Il resto del peso -- filmati, JS, tetti -- resta
 * deterministico e continua a giudicare, e il cancello fallisce solo se un
 * numero MISURATO sfora.
 */
let scaricatiDavvero = null
let perche = null
try {
  scaricatiDavvero = (await misuraPrecarico()).fine
  console.log('  (elenco chiesto al browser, non dichiarato: ' +
              `${scaricatiDavvero.size} risorse viste in una visita intera)`)
} catch (e) {
  perche = String(e).split(String.fromCharCode(10))[0]
  console.log(`  NON MISURABILE  l elenco di cio che il browser chiede: ${perche}`)
  console.log('                  la riga dei modelli non dara un verdetto; il resto si.')
}

let pesoModelli = 0
let pesoDietro = 0
const modelli = []
const dietro = []
try {
  for (const f of readdirSync('public/modelli')) {
    const b = statSync('public/modelli/' + f).size
    /* il browser lo chiede in una visita intera? allora il visitatore lo
       scarica, e conta. Se non lo chiede, sta dietro un interruttore -- e lo
       sappiamo perche' l'abbiamo guardato, non perche' l'abbiamo scritto. */
    if (scaricatiDavvero && !scaricatiDavvero.has(f)) { pesoDietro += b; dietro.push(f); continue }
    pesoModelli += b
    modelli.push(`${f} ${(b / 1e6).toFixed(2)} MB`)
  }
} catch { /* nessuna cartella */ }
if (modelli.length && !scaricatiDavvero) {
  /* senza la misura il totale sarebbe la somma di TUTTA la cartella, che non e'
     cio' che il visitatore scarica: si stampa e non si giudica */
  console.log(`  NON MIS  ${'Modelli sempre scaricati'.padEnd(42)} ` +
              `${(pesoModelli / 1e6).toFixed(2)} MB sulla CARTELLA INTERA, non su cio che il ` +
              'browser chiede — nessun verdetto')
} else if (modelli.length) {
  const ok = pesoModelli <= TETTO_MODELLI
  const etich = TETTI_ARMATI ? (ok ? 'OK   ' : 'FALSO') : (ok ? 'peso ' : 'SFORA')
  console.log(`  ${etich}  ${'Modelli sempre scaricati'.padEnd(42)} ` +
              `${(pesoModelli / 1e6).toFixed(2)} MB su un tetto di ${(TETTO_MODELLI / 1e6).toFixed(1)}` +
              `   (${modelli.join(', ')})`)
  if (pesoDietro) {
    console.log(`         piu' ${(pesoDietro / 1e6).toFixed(2)} MB che il browser NON CHIEDE ` +
                'in una visita intera:')
    for (const f of dietro) console.log(`           ${f}`)
  }
  if (!ok && !TETTI_ARMATI) {
    console.log(`         TETTO ADDORMENTATO: sforerebbe di ` +
                `${((pesoModelli - TETTO_MODELLI) / 1e6).toFixed(2)} MB. Non ferma nessuno per ` +
                'decisione del committente (vedi TETTI_ARMATI); si riarma a sito completo.')
  }
  if (!ok && TETTI_ARMATI) {
    scarti.push(`i modelli sempre scaricati pesano ${(pesoModelli / 1e6).toFixed(2)} MB contro un ` +
                `tetto di ${(TETTO_MODELLI / 1e6).toFixed(1)}. Se e' appena stato promosso il mondo, ` +
                "la via d uscita misurata e togliere traversata.mp4: libera 1.587.637 byte " +
                "contro i 1.670.304 che il mondo aggiunge.")
  }
}

/**
 * ─── IL TETTO DEI FILMATI: ALZATO A 5,0 MB, E DETTO PERCHE'
 *
 * Stava a `4 * 1024 * 1024` senza una riga di ragione accanto, ed e' l'unico
 * numero di questo file che non poggiava su niente. Peggio: era dichiarato in
 * MiB e stampato diviso 1e6, quindi il cancello scriveva «tetto di 4.2» per un
 * tetto di 4.194.304 byte. Chi leggeva il referto e chi leggeva il codice
 * vedevano due numeri diversi, ed e' la trappola MiB/MB che questo repo ha gia'
 * pagato. Adesso e' in byte decimali: cio' che si dichiara e' cio' che si
 * stampa.
 *
 * ALZATO SU DECISIONE DEL COMMITTENTE ("aumenta il tetto"), dopo che la posa
 * tesa validata ha portato i filmati a 4,69 MB: la clip nuova pesa 641 KB piu'
 * di quella che sostituisce, ed e' un peso pagato per una ripresa che passa
 * entrambi i cancelli invece di una che non li passava.
 *
 * PERCHE' 5,0 E NON DI PIU': questo tetto NON e' il percorso critico. I filmati
 * si scaricano per sezione, non all'apertura -- il percorso critico e' il tetto
 * dei modelli (1,6 MB, sopra), che quello si' arriva prima del primo fotogramma.
 * Qui si sorveglia il totale che viaggia in una visita intera. Cinque megabyte
 * di video per un sito che vive di riprese sono modesti; il doppio non lo
 * sarebbero, e un tetto che si alza ogni volta che si tocca non sorveglia piu'
 * niente.
 *
 * SI ASPETTA DI SCENDERE: quando il mondo viene promosso, `traversata.mp4`
 * (1,59 MB) sparisce e i filmati tornano a ~3,1 MB. Se fra un mese siamo ancora
 * a ridosso di 5,0 vuol dire che quella promozione non e' avvenuta, e il numero
 * lo dira'.
 */
const TETTO_FILMATI = 5.0 * 1e6
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
  const etichF = TETTI_ARMATI ? (ok ? 'OK   ' : 'FALSO') : (ok ? 'peso ' : 'SFORA')
  /* «Filmati del salone» era gia' falso da un pezzo: dentro ci sono la discesa
     e la traversata, che il salone non c'entra. Adesso l'etichetta dice il vero
     e il conto separa cio' che il codice nomina da cio' che nessuno scarica. */
  console.log(`  ${etichF}  ${'Filmati'.padEnd(42)} ` +
              `${(pesoFilmati / 1e6).toFixed(2)} MB su un tetto di ${(TETTO_FILMATI / 1e6).toFixed(1)}` +
              `   (${filmati.join(', ')})`)
  if (orfani.length) {
    console.log(`         di cui ${(byteOrfani / 1e6).toFixed(2)} MB che NESSUNA riga di src/ nomina: ` +
                `${orfani.join(', ')}`)
    console.log('         non e un guasto: e peso che viaggia e che nessuno scarica. ' +
                'Si chiude montandoli o togliendoli, ed e una decisione di messa in scena.')
  }
  if (!ok && !TETTI_ARMATI) {
    console.log(`         TETTO ADDORMENTATO: sforerebbe di ` +
                `${((pesoFilmati - TETTO_FILMATI) / 1e6).toFixed(2)} MB. Non ferma nessuno per ` +
                'decisione del committente (vedi TETTI_ARMATI); si riarma a sito completo.')
  }
  if (!ok && TETTI_ARMATI) {
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
