/**
 * QUALE CURVA TONALE, E QUANTO COSTA ALLA GIUNZIONE — misurato sullo stesso
 * fotogramma, cambiando UNA COSA SOLA.
 *
 *     node strumenti/curva-tonale.mjs
 *     ESPOSIZIONI=1.0,0.9,0.85,0.8 node strumenti/curva-tonale.mjs
 *
 * ─── IL DIFETTO PER CUI ESISTE
 *
 * (STORICO, ed e' il difetto per cui lo strumento e' nato: allora il sito
 * spediva ACES@1,0 e il banco lo forzava ad AgX@0,5. Oggi spedisce AgX@0,7 --
 * lo ha deciso questa tabella. Lo strumento resta, perche' la prossima volta
 * che qualcuno vorra' toccare la curva deve poter rifare la misura.)
 *
 * Il sito SPEDIVA `ACESFilmicToneMapping` a esposizione 1,0 (index.js e
 * salone.js), ma il banco che lo valida contro il path tracer di Cycles lo
 * FORZA ad AgX a 0,5 (`confronto-cotto.mjs`, per allinearsi a `cuoci.py` che
 * rende in AgX a -1EV). Cioe': la curva con cui si giudica il fotorealismo non
 * e' la curva che vede chi apre la pagina. Ogni referto di somiglianza col
 * render parla di un'immagine che nessuno ha mai visto.
 *
 * E ACES ha un tetto: `RRTAndODTFit` non arriva a 1,0, si ferma attorno a 242
 * livelli. Una sovrastruttura bianca grande — la massa piu' estesa
 * dell'inquadratura — che sta a mediana 228 vive addossata a quel tetto, dove
 * la curva non ha piu' pendenza: due radianze diverse escono allo stesso
 * livello, la forma si perde e resta una campitura. E' esattamente il modo in
 * cui un render legge come «plastica» o «modellino».
 *
 * ─── PERCHE' NON BASTA CAMBIARE LA RIGA
 *
 * Sopra l'orizzonte la tela WebGL e' trasparente e si vede il fondo CSS; sotto
 * c'e' l'acqua disegnata. La giunzione a zero pixel fra i due e' l'unica idea
 * meccanica del sito, e `--acqua` / `--acqua-viva` sono stati RICALCOLATI su
 * ACES (lo dichiara il commento a index.js). Cambiare curva senza riderivarli
 * apre una cucitura sulla linea d'acqua.
 *
 * ─── COME MISURA, E COSA HA IL DIRITTO DI CAMBIARE
 *
 * Un fotogramma solo, inchiodato (`?fermo=12`) alla battuta della nave, e per
 * ogni curva SOLO `render.toneMapping` / `toneMappingExposure`, poi un
 * `render.render` esplicito. Il ciclo di disegno del sito e' A RICHIESTA
 * (demo.js sveglia 45 fotogrammi e si ferma): senza quel render esplicito la
 * tela resterebbe quella di prima e la tabella direbbe quattro volte lo stesso
 * numero senza annunciarlo.
 *
 * E c'e' un CONTROLLO che rende la misura falsificabile: la fascia SOPRA la
 * mezzeria e' fondo CSS puro, la tela li' ha alpha 0 (verificato in stile.css
 * a tutte e sette le battute). Se cambia fra le curve, non sto misurando la
 * curva: sto misurando qualcos'altro, e lo strumento si ferma invece di
 * stampare una tabella.
 *
 * ─── LE COLONNE DEL MARE NON SI SCELGONO A OCCHIO
 *
 * `collaudo-orizzonte.mjs` ha gia' verificato per colonne, a 1400 px di
 * larghezza, che x 900-1200 e' mare aperto (struttura 17,6 contro i 65,8 della
 * nave e i 52,7 della scia). Si riusa quella regione perche' e' gia'
 * geometricamente definita, invece di ritagliare un riquadro guardando
 * l'immagine.
 *
 * ─── E LE RIGHE NEMMENO, PERCHE' IL CSS CI DIPINGE SOPRA DUE VOLTE
 *
 * Subito sotto la linea non c'e' solo acqua. `.linea::after` e' un bagliore
 * alto 22 px a `rgba(79,224,196,.16)`, e `.palco .scena::after` e' un velo che
 * parte a zero sulla linea e arriva a `rgba(7,26,29,.62)` in fondo. Sono due
 * strati CSS costanti — non cambiano con la curva — ma sporcano il valore
 * assoluto. Quindi si stampano QUATTRO bande separate invece di una media:
 * chi legge deve poter vedere dove il numero e' pulito e dove no.
 *
 * ─── LA SOVRASTRUTTURA SI ISOLA CON TRE RENDER, NON CON UN RIQUADRO
 *
 * Un riquadro disegnato a mano sulla sovrastruttura sarebbe una scelta mia, e
 * si sposterebbe col trascinamento della nave. Qui la maschera e'
 * l'INTERSEZIONE di due prove indipendenti:
 *
 *   1. la SAGOMA: si rende la sola sovrastruttura (i mesh il cui materiale si
 *      chiama `sovra_*`, che e' come li nomina il GLB) e si tiene l'alpha;
 *   2. la VISIBILITA': si rende la scena intera e poi la scena SENZA
 *      sovrastruttura, e si tengono i pixel che cambiano.
 *
 * La prima da sola conterebbe anche i pixel dove la sovrastruttura e' coperta
 * da qualcos'altro. La seconda da sola conterebbe le OMBRE che la
 * sovrastruttura toglie alla coperta quando sparisce — pixel che cambiano ma
 * non sono lei. L'intersezione non ha ne' l'uno ne' l'altro difetto, e non
 * passa da nessuna soglia di colore: e' la stessa lezione di
 * `collaudo-orizzonte.mjs`, spegnere un oggetto e guardare cosa cambia non ha
 * niente da sbagliare, qui incrociata con la sagoma per togliere le ombre.
 */
import { spawn, execFileSync } from 'node:child_process'
import { writeFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apriBrowser } from './browser.mjs'

/**
 * PORTA PROPRIA. `collaudo-cielo.mjs` sta su 5231 di suo e le altre corse
 * usano 5223 e dintorni: due `vite preview` sulla stessa porta non danno
 * errore, la seconda serve i file della prima, e la misura esce plausibile e
 * sbagliata. Si sovrascrive con PORTA_COLLAUDO.
 */
const PORTA = process.env.PORTA_COLLAUDO || 5231
const BATTUTA = 0.3
const L = 1400
const H = 900

/** Le costanti di three. Si verificano contro il valore che il sito ha
 *  davvero, invece di fidarsene: se cambiassero, questo strumento userebbe
 *  una curva a caso e non se ne accorgerebbe nessuno. */
const ACES = 4
const AGX = 6

const ESPOSIZIONI = (process.env.ESPOSIZIONI || '1.0,0.9,0.8')
  .split(',').map(Number).filter(v => v > 0)

/** Mare aperto verificato per colonne da `collaudo-orizzonte.mjs`. */
const MARE_X0 = 900
const MARE_X1 = 1200

/**
 * La mezzeria sta a 450 su un viewport alto 900 (`--pelo:50%`, e lo strato e'
 * `position:fixed` sulla FINESTRA, non sulla sezione).
 */
/**
 * ─── LE BANDE SONO CAMBIATE DOPO LA PRIMA CORSA, e il motivo va scritto
 *
 * La prima versione misurava 476-536 e la chiamava «acqua». Non lo era: meta'
 * di quelle righe sono FONDO CSS. Il profilo riga per riga (stampato piu'
 * sotto) dice che la tela comincia a dipingere a y=498, cioe' QUARANTOTTO
 * pixel sotto la mezzeria. Sopra quella riga il tone mapping non puo' cambiare
 * niente, perche' li' non c'e' niente di disegnato.
 *
 * Mescolare le due popolazioni faceva sembrare che sotto ACES l'acqua
 * disegnata cadesse esattamente su `--acqua-viva`: era la meta' CSS della
 * banda a farla cadere li'. E' la trappola di sempre in questo repo -- un
 * numero vero che risponde a un'altra domanda.
 */
const BANDE = [
  { nome: 'sopra   400-444  CONTROLLO: fondo CSS, NON deve cambiare', y0: 400, y1: 444 },
  { nome: 'CSS     452-497  sotto la linea ma sopra l acqua disegnata', y0: 452, y1: 497 },
  { nome: 'ACQUA   500-560  la prima acqua DISEGNATA', y0: 500, y1: 560 },
  { nome: 'ACQUA   700-760  a meta strada', y0: 700, y1: 760 },
  { nome: 'fondo   840-896  acqua sotto il velo pieno (.62)', y0: 840, y1: 896 }
]

/** LA CUCITURA VERA: le ultime righe di CSS e le prime di acqua disegnata.
 *  Il salto fra queste due e' cio' che si vedrebbe come una riga sullo
 *  schermo, ed e' l'unico posto in cui la curva puo' rompere la giunzione. */
const CUCITURA_CSS = [488, 497]
const CUCITURA_ACQUA = [498, 507]

const T = tmpdir()
const UNICO = `curva-${process.pid}-${Date.now()}.png`
const scratch = join(T, UNICO)

/** PNG -> pixel grezzi. Un solo ffmpeg per immagine: decodificare lo stesso
 *  file una volta per banda vuol dire otto processi per niente. */
const decodifica = (png, formato) => {
  writeFileSync(scratch, png)
  return execFileSync('ffmpeg', ['-v', 'error', '-i', scratch,
    '-f', 'rawvideo', '-pix_fmt', formato, '-'], { maxBuffer: 1e9 })
}
const daDataUrl = (url) => Buffer.from(url.slice(url.indexOf(',') + 1), 'base64')

const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
const browser = await apriBrowser({ conGpu: true })
const pg = await browser.newPage()
await pg.setViewportSize({ width: L, height: H })
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1&fermo=12`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
await pg.evaluate((q) => {
  const h = document.documentElement.scrollHeight - window.innerHeight
  window.scrollTo(0, h * q)
}, BATTUTA)
await pg.waitForTimeout(2500)

/**
 * LA SOVRASTRUTTURA ARRIVA DA UN GLB, cioe' TARDI. Aspettarla con un timeout
 * fisso e' il modo di misurare, una volta su dieci, una nave senza i due ponti
 * alti — e il numero uscirebbe plausibile. Si aspetta il fatto: che i mesh
 * `sovra_*` esistano.
 */
await pg.waitForFunction(() => {
  let n = 0
  window.__nautica.scena.traverse((o) => {
    if (!o.isMesh) return
    const ms = Array.isArray(o.material) ? o.material : [o.material]
    if (ms.some(m => m && typeof m.name === 'string' && m.name.startsWith('sovra_'))) n++
  })
  return n > 0
}, null, { timeout: 60000 })
await pg.waitForTimeout(500)

const curvaSpedita = await pg.evaluate(() => ({
  tm: window.__nautica.render.toneMapping,
  exp: window.__nautica.render.toneMappingExposure
}))
/**
 * ─── LA CURVA SPEDITA SI LEGGE, NON SI DA' PER SCONTATA
 *
 * Questo strumento e' nato quando il sito spediva ACES@1,0 e la prima versione
 * si fermava se non trovava ACES. Ma poi il sito e' passato ad AgX@0,7 --
 * proprio per via di quello che questo strumento ha misurato -- e la guardia
 * si sarebbe messa a bocciare la scena sana. Un cancello che fallisce per una
 * ragione sua insegna a rieseguirlo finche' passa, che e' il modo piu' rapido
 * di rendere inutile una suite.
 *
 * Quindi non si pretende una curva: si LEGGE quella spedita e la si mette in
 * prima riga della tabella come termine di paragone, qualunque sia. L'unica
 * cosa che resta obbligatoria e' che sia una delle due che questo strumento sa
 * nominare, o la tabella avrebbe un'etichetta falsa.
 */
if (curvaSpedita.tm !== ACES && curvaSpedita.tm !== AGX) {
  console.error(`\n  Il sito spedisce toneMapping ${curvaSpedita.tm}, che non e ne ACES (${ACES})`)
  console.error(`  ne AgX (${AGX}). La tabella metterebbe un nome sbagliato su una curva:`)
  console.error('  si ferma.\n')
  await browser.close(); preview.kill(); process.exit(2)
}

/* ═══ 1 · LA MASCHERA DELLA SOVRASTRUTTURA, tre render a curva ferma ═══ */
const tre = await pg.evaluate((prefisso) => {
  const n = window.__nautica
  const tela = n.render.domElement
  const foto = () => {
    n.render.render(n.scena, n.camera)
    return tela.toDataURL('image/png')
  }
  const suoi = []
  n.scena.traverse((o) => {
    if (!o.isMesh || !o.visible) return
    const ms = Array.isArray(o.material) ? o.material : [o.material]
    if (ms.some(m => m && typeof m.name === 'string' && m.name.startsWith(prefisso))) suoi.push(o)
  })
  const intera = foto()
  for (const o of suoi) o.visible = false
  const senza = foto()
  for (const o of suoi) o.visible = true
  const altri = []
  n.scena.traverse((o) => {
    if (!o.isMesh || !o.visible || suoi.includes(o)) return
    altri.push(o); o.visible = false
  })
  const sola = foto()
  for (const o of altri) o.visible = true
  n.render.render(n.scena, n.camera)
  const r = tela.getBoundingClientRect()
  return {
    intera, senza, sola, quanti: suoi.length,
    bw: tela.width, bh: tela.height, x: r.left, y: r.top, w: r.width, h: r.height
  }
}, 'sovra_')

/**
 * LE DUE GRIGLIE DEVONO COMBACIARE, e non e' scontato: la tela ha un suo
 * `setPixelRatio(min(dpr,1.5))` e la fotografia di Playwright e' in pixel CSS.
 * Se il rapporto non e' 1 la maschera scivolerebbe sulla fotografia e la
 * mediana parlerebbe di pixel vicini alla sovrastruttura invece che suoi.
 */
if (tre.bw !== Math.round(tre.w) || tre.bh !== Math.round(tre.h)) {
  console.error(`\n  La tela ha ${tre.bw}x${tre.bh} pixel di disegno su ${tre.w}x${tre.h} CSS.`)
  console.error('  La maschera non combacerebbe con la fotografia: si ferma.\n')
  await browser.close(); preview.kill(); process.exit(2)
}
const OX = Math.round(tre.x)
const OY = Math.round(tre.y)

const pxSola = decodifica(daDataUrl(tre.sola), 'rgba')
const pxIntera = decodifica(daDataUrl(tre.intera), 'rgba')
const pxSenza = decodifica(daDataUrl(tre.senza), 'rgba')

/** L'intersezione: sagoma E visibilita'. Le due soglie sono grossolane apposta
 *  — 16 su 255 di alpha e 6 livelli di differenza — perche' servono a
 *  distinguere «disegnato» da «non disegnato», non a decidere un bordo. */
const maschera = new Uint8Array(tre.bw * tre.bh)
let quantiPixel = 0
for (let i = 0; i < tre.bw * tre.bh; i++) {
  const a = pxSola[i * 4 + 3]
  if (a <= 16) continue
  const d = Math.max(
    Math.abs(pxIntera[i * 4] - pxSenza[i * 4]),
    Math.abs(pxIntera[i * 4 + 1] - pxSenza[i * 4 + 1]),
    Math.abs(pxIntera[i * 4 + 2] - pxSenza[i * 4 + 2])
  )
  if (d <= 6) continue
  maschera[i] = 1; quantiPixel++
}
if (quantiPixel < 2000) {
  console.error(`\n  La maschera della sovrastruttura ha ${quantiPixel} pixel: troppo pochi.`)
  console.error('  O il GLB non e arrivato, o la nave e fuori campo a questa battuta.')
  console.error('  Una mediana su cosi pochi pixel non dice niente: si ferma.\n')
  await browser.close(); preview.kill(); process.exit(2)
}

/* ═══ 2 · LA TABELLA, una curva per riga ═══ */
const mediana = (a) => { const c = Float64Array.from(a).sort(); return c[c.length >> 1] }

const referti = []
for (const c of [curvaSpedita, ...ESPOSIZIONI.map(e => ({ tm: AGX, exp: e }))]) {
  await pg.evaluate(([tm, exp]) => {
    const n = window.__nautica
    n.render.toneMapping = tm
    n.render.toneMappingExposure = exp
    /* IL RENDER ESPLICITO: il ciclo del sito e a richiesta e a questo punto
       dorme gia da un pezzo. Senza, si fotografa la tela di prima. */
    n.render.render(n.scena, n.camera)
  }, [c.tm, c.exp])
  const foto = decodifica(await pg.screenshot(), 'rgb24')

  const bande = BANDE.map((b) => {
    let r = 0; let g = 0; let bl = 0; let n = 0
    for (let y = b.y0; y <= b.y1; y++) {
      for (let x = MARE_X0; x < MARE_X1; x++) {
        const i = (y * L + x) * 3
        r += foto[i]; g += foto[i + 1]; bl += foto[i + 2]; n++
      }
    }
    return { nome: b.nome, r: r / n, g: g / n, b: bl / n }
  })

  /**
   * IL PROFILO RIGA PER RIGA, e serve a rispondere alla domanda che la
   * tabella per bande non pone: DOVE comincia davvero l'acqua disegnata.
   *
   * La prima tabella ha risposto una cosa che non mi aspettavo — la banda
   * 452-470 non si muove di un livello fra le quattro curve — e l'unica
   * lettura possibile e' che li' la tela non dipinge: e' fondo CSS. Il numero
   * che lo dice si trova solo guardando la riga singola, non la media di
   * diciannove.
   */
  const striscia = (y0, y1) => {
    let r = 0; let g = 0; let bl = 0; let n = 0
    for (let y = y0; y <= y1; y++) {
      for (let x = MARE_X0; x < MARE_X1; x++) {
        const i = (y * L + x) * 3
        r += foto[i]; g += foto[i + 1]; bl += foto[i + 2]; n++
      }
    }
    return [r / n, g / n, bl / n]
  }
  const cssSopra = striscia(CUCITURA_CSS[0], CUCITURA_CSS[1])
  const acquaSotto = striscia(CUCITURA_ACQUA[0], CUCITURA_ACQUA[1])

  const profilo = []
  for (let y = 440; y < 560; y++) {
    let r = 0; let g = 0; let bl = 0
    for (let x = MARE_X0; x < MARE_X1; x++) {
      const i = (y * L + x) * 3
      r += foto[i]; g += foto[i + 1]; bl += foto[i + 2]
    }
    const n = MARE_X1 - MARE_X0
    profilo.push([r / n, g / n, bl / n])
  }

  const luci = []
  for (let y = 0; y < tre.bh; y++) {
    for (let x = 0; x < tre.bw; x++) {
      if (!maschera[y * tre.bw + x]) continue
      const sy = y + OY; const sx = x + OX
      if (sy < 0 || sy >= H || sx < 0 || sx >= L) continue
      const i = (sy * L + sx) * 3
      luci.push((foto[i] + foto[i + 1] + foto[i + 2]) / 3)
    }
  }
  const med = mediana(luci)
  const media = luci.reduce((s, v) => s + v, 0) / luci.length
  let max = 0
  for (const v of luci) if (v > max) max = v
  /* Quanti pixel stanno ADDOSSATO al tetto della curva. E' il numero che
     descrive il difetto meglio della media: una massa bianca senza forma non
     e' «chiara», e' SATURA, cioe accumulata dove la curva non ha piu
     pendenza. Il tetto di ACES misurato sullo scafo e 242. */
  const alTetto = 100 * luci.filter(v => v >= 235).length / luci.length

  referti.push({ ...c, bande, profilo, cssSopra, acquaSotto, med, media, max, alTetto, n: luci.length })
}

await browser.close()
preview.kill()
try { unlinkSync(scratch) } catch { /* gia sparito */ }

const nome = (c) => (c.tm === ACES ? 'ACES' : 'AgX ') + ' @' + c.exp.toFixed(2)

const rgb = (b) => `${b.r.toFixed(1).padStart(6)},${b.g.toFixed(1).padStart(6)},${b.b.toFixed(1).padStart(6)}`
const esa = (b) => '#' + [b.r, b.g, b.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')

console.log('\nLA CURVA TONALE, MISURATA SULLO STESSO FOTOGRAMMA')
console.log(`  battuta ${BATTUTA}, viewport ${L}x${H}, mare aperto x ${MARE_X0}-${MARE_X1}`)
console.log(`  la tela sta a ${tre.x},${tre.y} ed e ${tre.w}x${tre.h}: se non e 0,0 e 1400x900,`)
console.log('  lo scarto fra mezzeria CSS e orizzonte 3D che si legge sotto e in parte suo')
console.log(`  sovrastruttura: ${tre.quanti} mesh, ${quantiPixel} pixel di maschera`)

for (const b of BANDE) {
  console.log(`\n  ${b.nome}`)
  console.log('    curva          R      G      B    esadecimale')
  for (const r of referti) {
    const v = r.bande.find(x => x.nome === b.nome)
    console.log(`    ${nome(r)}  ${rgb(v)}   ${esa(v)}`)
  }
}

console.log('\n  LA CUCITURA VERA: ultime righe CSS (488-497) contro prima acqua disegnata (498-507)')
console.log('    curva          CSS sopra            acqua sotto          salto R,G,B')
for (const r of referti) {
  const d = r.acquaSotto.map((v, i) => v - r.cssSopra[i])
  console.log(`    ${nome(r)}  ${r.cssSopra.map(v => v.toFixed(1).padStart(6)).join(',')}   ` +
              `${r.acquaSotto.map(v => v.toFixed(1).padStart(6)).join(',')}   ` +
              `${d.map(v => (v >= 0 ? '+' : '') + v.toFixed(1)).join(', ').padStart(22)}`)
}

console.log('\n  LA SOVRASTRUTTURA (luce = media dei tre canali)')
console.log('    curva        mediana    media      max   >=235')
for (const r of referti) {
  console.log(`    ${nome(r)}  ${r.med.toFixed(1).padStart(9)}${r.media.toFixed(1).padStart(9)}` +
              `${r.max.toFixed(0).padStart(9)}${(r.alTetto.toFixed(1) + '%').padStart(8)}`)
}

/**
 * ═══ 3 · DOVE COMINCIA L'ACQUA DISEGNATA ═══
 *
 * Si stampa lo scarto, riga per riga, fra la curva spedita e la prima
 * alternativa. Dove vale zero la tela non ha dipinto niente e quello che si
 * vede e' fondo CSS; dove diventa diverso da zero comincia il mare disegnato.
 * E' la QUOTA VERA della giunzione, che non e' detto sia la mezzeria: la
 * mezzeria e' dove il CSS cambia colore, non dove la tela comincia a coprirlo.
 */
{
  const a = referti[0].profilo
  const b = referti[1].profilo
  let prima = null
  const righe = []
  for (let k = 0; k < a.length; k++) {
    const d = Math.max(Math.abs(a[k][0] - b[k][0]), Math.abs(a[k][1] - b[k][1]), Math.abs(a[k][2] - b[k][2]))
    if (prima === null && d > 0.5) prima = 440 + k
    if ((440 + k) % 4 === 0) righe.push(`    y ${440 + k}   ACES ${a[k].map(v => v.toFixed(1).padStart(6)).join(',')}` +
      `   AgX ${b[k].map(v => v.toFixed(1).padStart(6)).join(',')}   scarto ${d.toFixed(2).padStart(6)}`)
  }
  console.log('\n  DOVE COMINCIA L ACQUA DISEGNATA (ACES@1.0 contro AgX@' + referti[1].exp.toFixed(2) + ')')
  for (const r of righe) console.log(r)
  console.log(`\n  prima riga in cui la tela cambia col tone mapping: y = ${prima === null ? '(nessuna)' : prima}`)
  console.log(`  la mezzeria CSS sta a y = ${H / 2}: fra le due c e ${prima === null ? '?' : prima - H / 2} px di fondo CSS puro`)

  /**
   * ─── E LA CUCITURA SI GUARDA RIGA PER RIGA, non a media di dieci
   *
   * Un salto di dodici livelli spalmato su dieci righe non si vede; lo stesso
   * salto fra due righe adiacenti e' una RIGA sullo schermo. Sono due difetti
   * diversi e la media li confonde, quindi qui si stampa il canale verde --
   * quello su cui il salto misurato e' piu' grande -- riga per riga attorno
   * alla cucitura, una colonna per curva.
   */
  console.log('\n  IL VERDE RIGA PER RIGA ATTORNO ALLA CUCITURA (y=498)')
  console.log('    riga  ' + referti.map(r => nome(r).padStart(9)).join(''))
  for (let y = 490; y <= 512; y++) {
    const k = y - 440
    console.log(`    ${y}  ` + referti.map(r => r.profilo[k][1].toFixed(1).padStart(9)).join('') +
                (y === 498 ? '   <- prima riga disegnata' : ''))
  }
}

/* ═══ 4 · IL CONTROLLO, ed e' il motivo per cui questa tabella si puo' leggere ═══ */
const base = referti[0].bande[0]
let scartoControllo = 0
for (const r of referti) {
  const v = r.bande[0]
  scartoControllo = Math.max(scartoControllo,
    Math.abs(v.r - base.r), Math.abs(v.g - base.g), Math.abs(v.b - base.b))
}
console.log(`\n  CONTROLLO: la fascia sopra la mezzeria si muove al massimo di ${scartoControllo.toFixed(2)} livelli`)
if (scartoControllo > 1) {
  console.log('\n  ROSSO  sopra la mezzeria c e fondo CSS e la tela ha alpha 0: quella fascia')
  console.log('         NON puo cambiare col tone mapping. Se cambia, questa misura sta')
  console.log('         leggendo qualcosa d altro (la tela copre la mezzeria? il palco si')
  console.log('         e spostato? la fotografia e di un altro istante?). La tabella qui')
  console.log('         sopra NON vale.')
  process.exit(1)
}
console.log('  il controllo tiene: fra le curve cambia solo cio che la tela disegna\n')
