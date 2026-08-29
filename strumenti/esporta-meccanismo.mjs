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
 *
 * ─── DUE USI, DUE INVOCAZIONI, e da oggi non si sbagliano in silenzio
 *
 *   il MECCANISMO (il tetto serve, la carena non c'entra):
 *       SCARTA_LA_NAVE=1 node strumenti/esporta-meccanismo.mjs meccanismo.json
 *
 *   la NAVE INTERA (per il ritratto in Cycles: la carena E' il soggetto):
 *       TETTO_TRI=999999 node strumenti/esporta-meccanismo.mjs nave-scena.json
 *
 * Senza nessuna delle due esce con errore e dice quale pezzo della nave il
 * tetto sta buttando via. Vedi il blocco sul TETTO piu' sotto per la ragione:
 * il ritratto della nave e' stato cotto per settimane senza carena.
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
/**
 * --- DOVE SI FERMA LA PAGINA, E PERCHE' NON PUO' ESSERE UN NUMERO
 *
 * Qui c'era `scrollTo(0, 6600)`. Misurando le sezioni, 6600 sta dentro
 * `fattura`, non dentro `dimostrazione` -- che va da 720 a 4464. E la scena 3D
 * si disegna solo mentre la dimostrazione e' sullo schermo: un
 * IntersectionObserver la spegne quando esce, per non bruciare la batteria di
 * un telefono.
 *
 * Quindi a 6600 la scena non era ferma per caso: era **spenta**, e cio' che
 * l'esportatore prendeva era la posa CONGELATA in cui il meccanismo era
 * rimasto uscendo dal campo. Per un fotogramma solo funzionava per caso; per
 * una sequenza no -- ventiquattro pose identiche.
 *
 * Isolato scorrendo la pagina a passi e guardando crescere
 * `__nautica.fotogrammi`: cresce fra y=3024 e y=4032, si ferma da 4536 in poi.
 *
 * Adesso la posizione si MISURA: il fondo della dimostrazione meno una
 * finestra. Li' la sezione riempie lo schermo -- quindi si disegna -- e il
 * taglio e' alla sua corsa piena, che e' la battuta del meccanismo.
 */
const dove = await pg.evaluate(() => {
  const s = document.querySelector('#dimostrazione') || document.querySelector('.dimostrazione')
  if (!s) return null
  const r = s.getBoundingClientRect()
  return Math.round(r.top + scrollY + r.height - innerHeight)
})
if (dove === null) {
  console.error('  ROTTO  la sezione #dimostrazione non esiste piu: lo esportatore non sa dove fermarsi.')
  process.exit(1)
}
await pg.evaluate((y) => scrollTo(0, y), dove)
await pg.waitForTimeout(3000)

// IL CICLO DEVE ESSERE ACCESO. Se la scena non disegna, ogni posa e' la stessa
// posa, e una sequenza di fotogrammi identici sembra un video corto invece di
// un guasto.
const vivo = await pg.evaluate(() => new Promise((res) => {
  const a = window.__nautica.fotogrammi
  let i = 0
  const passo = () => { if (++i < 40) requestAnimationFrame(passo); else res(window.__nautica.fotogrammi - a) }
  requestAnimationFrame(passo)
}))
console.log(`  posa a y=${dove} - ${vivo} fotogrammi disegnati in 40 rAF`)
if (vivo < 5) {
  console.error('  ROTTO  la scena non sta disegnando: lo osservatore la ha spenta.')
  process.exit(1)
}

const TETTO_TRI = Number(process.env.TETTO_TRI || 3000)
const raccolto = await pg.evaluate((TETTO_TRI) => {
  if (!window.__nautica) return null
  const out = []
  const scartati = []
  window.__nautica.nave.updateMatrixWorld(true)
  window.__nautica.nave.traverse(o => {
    if (!o.isMesh) return
    const g = o.geometry
    const tri = g.index ? g.index.count / 3 : g.attributes.position.count / 3
    /**
     * IL TETTO DEI TRIANGOLI SCARTAVA IN SILENZIO, e i bulloni restavano soli.
     *
     * Questa riga diceva `if (tri > 3000) return`. Serviva a tenere fuori la
     * carena quando l'esportatore girava sull'intera nave; adesso la scelta
     * la fa il NOME del materiale, e il tetto e' rimasto a scartare pezzi del
     * meccanismo senza dirlo. Non si toglie e basta: si REGISTRA cio' che
     * scarta, perche' un filtro muto e' il modo in cui si perde un pezzo per
     * settimane.
     */
    if (tri > TETTO_TRI) { scartati.push({ nodo: o.name || '', nome: o.material.name || '', tri }); return }
    out.push({
      /**
       * IL NOME DEL MATERIALE, e non solo il colore.
       *
       * `cuoci.py` sceglieva i pezzi da cuocere con una tabella di COLORI --
       * tre voci, ereditate da quando il meccanismo era costruito a mano nel
       * codice. Adesso arriva da un GLB con i suoi materiali, e di quei tre
       * colori ne sopravvive uno: il render fotorealistico teneva **10 pezzi
       * su 73**, cioe' 240 vertici su 45.000, e produceva un PNG lo stesso.
       *
       * Il colore e' una chiave sbagliata due volte: cambia quando cambia la
       * tinta, e due materiali diversi possono averlo uguale. Il nome no.
       */
      nome: o.material.name || '',
      nodo: o.name || '',
      col: o.material.color ? o.material.color.getHexString() : '888888',
      met: o.material.metalness ?? 0.5,
      rug: o.material.roughness ?? 0.5,
      m: Array.from(o.matrixWorld.elements),
      /**
       * --- SI LEGGE DALL'ATTRIBUTO, NON DALL'ARRAY
       *
       * Qui c'era `Array.from(g.attributes.position.array)`. Per una geometria
       * NON interlacciata e' giusto; per una interlacciata quell'array e' il
       * buffer CONDIVISO -- posizioni, normali e UV mescolate -- e leggerlo a
       * tre a tre da' coordinate prese da tre attributi diversi.
       *
       * Misurato sulla scena viva: **59 geometrie su 85 sono interlacciate**,
       * perche' e' cio' che produce la compressione meshopt con cui viaggiano
       * i modelli. Il render offline usciva un ammasso di schegge, e ci ho
       * messo tempo a sospettarlo perche' un PNG lo produceva lo stesso.
       *
       * `getX/getY/getZ` conoscono `stride` e `offset` e restituiscono il
       * vertice vero in tutti e due i casi. Costa qualche millisecondo su
       * quarantamila vertici, una volta.
       */
      pos: (() => {
        const a = g.attributes.position
        const v = new Array(a.count * 3)
        for (let i = 0; i < a.count; i++) {
          v[i * 3] = a.getX(i); v[i * 3 + 1] = a.getY(i); v[i * 3 + 2] = a.getZ(i)
        }
        return v
      })(),
      interlacciata: !!g.attributes.position.isInterleavedBufferAttribute,
      /**
       * LE UV, quando ci sono. Servono a cuocere l'occlusione ambientale sui
       * pezzi che le hanno gia' -- lo scafo e il ponte le prendono dal loft --
       * e vanno lette con `getX/getY` per la stessa ragione delle posizioni:
       * su una geometria interlacciata l'array e' il buffer condiviso.
       */
      uv: (() => {
        const a = g.attributes.uv
        if (!a) return null
        const v = new Array(a.count * 2)
        for (let i = 0; i < a.count; i++) { v[i * 2] = a.getX(i); v[i * 2 + 1] = a.getY(i) }
        return v
      })(),
      idx: g.index ? Array.from(g.index.array) : null
    })
  })
  return { out, scartati, sezione: window.__nautica.sezione }
}, TETTO_TRI)
const pezzi = raccolto && raccolto.out
const scartati = (raccolto && raccolto.scartati) || []
const sezione = raccolto && raccolto.sezione

if (!pezzi) {
  console.error('  ROTTO  window.__nautica non c\'e\': la diagnostica ?ispeziona=1 e\' sparita da index.js.')
  process.exit(1)
}
if (!pezzi.length) {
  console.error('  ROTTO  nessun pezzo esportato: la scena non si e\' costruita, o il filtro dei triangoli e\' sbagliato.')
  process.exit(1)
}

/**
 * --- LE POSE: LA FORMA UNA VOLTA, LE MATRICI TANTE
 *
 * Per cuocere una sequenza servono N pose del meccanismo. Esportare N volte
 * tutto farebbe 2,9 MB per posa -- settanta megabyte per due secondi di
 * movimento, e novantanove centesimi sarebbero la stessa identica forma
 * copiata.
 *
 * Fra un fotogramma e l'altro la geometria NON cambia: cambiano solo le
 * matrici. Quindi si scrive la forma una volta e, per ogni posa, sedici numeri
 * per pezzo. Ottantacinque pezzi per ventiquattro pose fanno trentamila
 * numeri: trecento kilobyte contro settanta megabyte.
 *
 * E il campionamento e' nel TEMPO, non su un angolo inventato. La pinna passa
 * dagli angoli a cui la porta il mare, non da quelli che ho scelto io: e' la
 * stessa regola per cui il fotogramma lo sceglie la fisica.
 */
const POSE = Number(process.env.POSE || 0)
const pose = []
const angoli = []
if (POSE > 0) {
  /**
   * --- SI CAMPIONA PER ANGOLO, NON PER OROLOGIO
   *
   * Il primo tentativo prendeva una posa ogni 150 ms. Ventiquattro pose in
   * tre secondi, e il render le trovava quasi identiche: 1,18% dei pixel
   * diverso oltre gli 8 livelli fra la prima e l ultima. Un filmato fermo.
   *
   * Il difetto non era il passo scelto male: era aver scelto un passo. In tre
   * secondi il mare non porta la pinna da nessuna parte, e cuocere a tempo
   * significa sperare che ci vada.
   *
   * `cuoci.py` lo dichiara dalla prima riga -- e lo angolo della pinna a
   * scegliere il fotogramma -- e campionare a orologio lo contraddiceva.
   *
   * Adesso si dichiarano N angoli fra due estremi, si guarda passare la pinna
   * e ogni posa va nella casella piu vicina ancora vuota. La sequenza esce
   * ORDINATA PER ANGOLO: una spazzata pulita da un estremo all altro, che si
   * legge avanti e indietro e chiude in ciclo senza tagli. Le caselle che
   * restano vuote si DICONO, invece di essere riempite con la vicina.
   */
  const ESTREMO = Number(process.env.ESTREMO_GRADI || 9)
  const LIMITE_MS = Number(process.env.LIMITE_MS || 300000)
  const bersagli = Array.from({ length: POSE }, (_, i) => -ESTREMO + (2 * ESTREMO * i) / (POSE - 1))
  const larghezza = (2 * ESTREMO) / (POSE - 1) / 2
  const preso = new Array(POSE).fill(null)
  const t0 = Date.now()
  let giri = 0
  while (preso.some(x => x === null) && Date.now() - t0 < LIMITE_MS) {
    const r = await pg.evaluate(() => new Promise((res) => {
      requestAnimationFrame(() => {
        window.__nautica.nave.updateMatrixWorld(true)
        const v = []
        window.__nautica.nave.traverse(o => { if (o.isMesh) v.push(Array.from(o.matrixWorld.elements)) })
        res({ ang: window.__nautica.stato.pinna * 180 / Math.PI, m: v })
      })
    }))
    giri++
    if (r.m.length !== pezzi.length) {
      console.error(`  ROTTO  ${r.m.length} matrici per ${pezzi.length} pezzi: la traversata e cambiata.`)
      process.exit(1)
    }
    let k = 0
    for (let i = 1; i < POSE; i++) {
      if (Math.abs(bersagli[i] - r.ang) < Math.abs(bersagli[k] - r.ang)) k = i
    }
    // La casella si riempie solo se la pinna e VICINA al suo angolo. Senza
    // questo, il primo fotogramma qualunque finirebbe nella casella meno
    // sbagliata e la spazzata uscirebbe storta.
    if (!preso[k] && Math.abs(bersagli[k] - r.ang) <= larghezza) preso[k] = { ang: r.ang, m: r.m }
  }
  const vuote = preso.filter(x => !x).length
  const visti = preso.filter(Boolean).map(x => x.ang)
  console.log(`  ${giri} fotogrammi guardati in ${((Date.now() - t0) / 1000).toFixed(0)} s`)
  console.log(`  caselle piene ${POSE - vuote} su ${POSE} - da ${Math.min(...visti).toFixed(2)} a ${Math.max(...visti).toFixed(2)} gradi`)
  if (vuote) console.log(`  ${vuote} caselle VUOTE: la sequenza salta quegli angoli invece di inventarli.`)
  for (const x of preso) if (x) { pose.push(x.m); angoli.push(Number(x.ang.toFixed(3))) }
  if (pose.length < 2) { console.error('  ROTTO  meno di due pose.'); process.exit(1) }
  let mosso = 0
  for (let k = 0; k < pezzi.length; k++) {
    for (let j = 0; j < 16; j++) {
      if (Math.abs(pose[0][k][j] - pose[pose.length - 1][k][j]) > 1e-6) { mosso++; break }
    }
  }
  console.log(`  ${mosso} pezzi su ${pezzi.length} si sono mossi fra il primo e l ultimo angolo`)
  if (!mosso) { console.error('  ROTTO  nessun pezzo si muove.'); process.exit(1) }
}

await browser.close()
preview?.kill()

writeFileSync(FUORI, JSON.stringify(pose.length ? { sezione, pezzi, pose, angoli } : { sezione, pezzi }))
const tri = pezzi.reduce((s, p) => s + (p.idx ? p.idx.length / 3 : p.pos.length / 9), 0)
const colori = [...new Set(pezzi.map(p => p.col))]
console.log(`  ${pezzi.length} pezzi · ${tri} triangoli · ${(JSON.stringify(pezzi).length / 1048576).toFixed(1)} MB`)
console.log(`  materiali: ${colori.join(' ')}`)
/**
 * ─── E SE IL TETTO BUTTA VIA IL SOGGETTO, NON E' UN TETTO: E' UN GUASTO
 *
 * Il filtro registrava gia' quello che scartava, e lo stampava. Non e' bastato:
 * il ritratto della nave in Cycles e' stato cotto per settimane **senza la
 * carena**, perche' `TETTO_TRI = 3000` la lasciava fuori e la riga che lo
 * diceva scorreva via in mezzo al resto. Verificato: nel vecchio
 * `nave-scena.json` il materiale `scafo` compare solo con 31 e 62 vertici --
 * i due tappi di prua e poppa -- e il guscio da 2263 non c'e'. Ogni conclusione
 * tratta da quel ritratto parlava di coperta e sovrastruttura.
 *
 * Un tetto che toglie un bullone fa il suo mestiere. Un tetto che toglie lo
 * SCAFO da un ritratto della nave sta cancellando il soggetto, e la differenza
 * si puo' dire in una riga: quali materiali sono la nave. Se ne cade uno, si
 * esce con errore invece di stampare e proseguire.
 *
 * Il commento qui sopra diceva gia' «un filtro muto e' il modo in cui si perde
 * un pezzo per settimane». Era muto abbastanza: stampava, e nessuno leggeva.
 * Stampare non e' fallire.
 */
const NAVE = ['scafo', 'coperta', 'carena', 'interno']
const persi = scartati.filter((x) => NAVE.includes(x.nome))
if (persi.length && !process.env.SCARTA_LA_NAVE) {
  console.error(`
  ROTTO  il tetto di ${TETTO_TRI} triangoli ha buttato via ${persi.length} pezzo/i
         della NAVE, non del contorno:`)
  for (const x of persi) console.error(`           ${String(x.tri).padStart(6)} triangoli  ${x.nome}  ${x.nodo}`)
  console.error(`
         Per un ritratto della nave questo cancella il soggetto. Rilancia con
         TETTO_TRI=999999, oppure con SCARTA_LA_NAVE=1 se davvero vuoi solo il
         meccanismo e sai che la carena non ci sara'.`)
  process.exit(1)
}

if (scartati.length) {
  const t = scartati.reduce((s, x) => s + x.tri, 0)
  console.log(`
  SCARTATI DAL TETTO (${TETTO_TRI} triangoli): ${scartati.length} pezzi, ${t} triangoli`)
  for (const x of scartati.slice(0, 20)) console.log(`    ${x.tri.toString().padStart(6)}  ${x.nome || '(senza materiale)'}  ${x.nodo}`)
  console.log("  se uno di questi e' meccanismo, alza TETTO_TRI: i pezzi avvitati restano senza cio' a cui sono avvitati.")
}
console.log(`  sezione: normale ${sezione.nx},${sezione.ny},${sezione.nz} costante ${sezione.costante.toFixed(3)}`)
console.log(`  scritto ${FUORI}`)
console.log('\n  poi si cuoce:')
console.log(`  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" -b -P riferimenti/blender/cuoci.py -- ${FUORI} <cartella>`)
