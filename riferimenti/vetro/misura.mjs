import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { apriBrowser } from '../../strumenti/browser.mjs'

/**
 * QUANTO COSTA IL VETRO TRASMISSIVO — misurato, non stimato.
 *
 * Uso:  CHROMIUM=1 node riferimenti/vetro/misura.mjs [sezioni]
 *       sezioni: costo · scala · formato · immagine · taratura · fresnel · pixel   (senza, tutte)
 *
 * ─── LA DOMANDA
 *
 * `MeshPhysicalMaterial` con `transmission` fa disegnare a three la scena una
 * seconda volta in un bersaglio fuori schermo. Su un telefono puo' essere caro,
 * e questo sito ha gia' due decodificatori video e un'acqua procedurale. Prima
 * di raccomandare, si misura.
 *
 * ─── IL LIMITE, DETTO PRIMA DEI NUMERI
 *
 * Questa macchina NON HA UNA GPU: Chromium disegna con SwiftShader, un
 * rasterizzatore software (e' anche il motivo per cui esiste
 * `strumenti/browser.mjs`). Quindi:
 *
 *   i millisecondi assoluti NON valgono niente;
 *   il RAPPORTO fra due casi vale — ma solo se si sa di che cosa e' fatto,
 *   ed e' per questo che c'e' la sezione `formato`.
 *
 * Un rasterizzatore software paga i PIXEL e le fusioni; una GPU paga
 * soprattutto la banda di memoria. Il pass di trasmissione e' pixel-bound e il
 * suo bersaglio e' half-float con MSAA 4x: qui e' misurato dalla parte in cui
 * pesa di piu'. Il vetro leggero, che e' `transparent`, e' misurato anche lui
 * dalla parte in cui pesa di piu' — la fusione per pixel. Nessuno dei due e'
 * favorito dal banco.
 */

const PORTA = 5197
const RADICE = normalize(join(fileURLToPath(new URL('.', import.meta.url)), '..', '..'))

const TIPI = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.css': 'text/css'
}

function servi () {
  const s = createServer(async (req, res) => {
    const percorso = normalize(join(RADICE, decodeURIComponent(req.url.split('?')[0])))
    if (!percorso.startsWith(RADICE)) { res.writeHead(403).end(); return }
    try {
      const corpo = await readFile(percorso)
      /**
       * `no-store`, e non e' scaramanzia: una correzione al provino e' stata
       * misurata DUE volte con gli stessi identici decimali — 43,6 / 34,5 /
       * 0,79 — perche' il browser stava rileggendo la pagina dalla cache. Un
       * banco che serve file di ieri non da' errore: da' i numeri di ieri.
       */
      res.writeHead(200, {
        'content-type': TIPI[extname(percorso)] || 'application/octet-stream',
        'cache-control': 'no-store, must-revalidate'
      })
      res.end(corpo)
    } catch {
      res.writeHead(404).end('no')
    }
  })
  return new Promise(r => s.listen(PORTA, '127.0.0.1', () => r(s)))
}

const url = (p) => `http://127.0.0.1:${PORTA}/riferimenti/vetro/provino.html?${new URLSearchParams(p)}`

async function apri (pagina, p) {
  await pagina.goto(url(p), { waitUntil: 'load' })
  await pagina.waitForFunction(() => window.__pronto === true, null, { timeout: 120000 })
}

const num = (x, d = 2) => (Number.isFinite(x) ? x.toFixed(d).replace('.', ',') : '—')
const mediana = (v) => v.slice().sort((a, b) => a - b)[Math.floor(v.length / 2)]

/** Il costo di una configurazione, ripetuto e mediano. */
async function costo (pagina, parametri, { volte = 2, secondi = 1.5 } = {}) {
  const v = []
  for (let i = 0; i < volte; i++) {
    await apri(pagina, parametri)
    v.push(await pagina.evaluate((s) => window.__provino.costo({ secondi: s }), secondi))
  }
  return { ms: mediana(v.map(x => x.msMediano)), campione: v[0] }
}

// ───────────────────────────────────────────────────────────── le sezioni

async function sezioneCosto (pagina) {
  const CASI = ['fondo', 'oggi', 'leggero', 'fisico']
  const ROUND = Number(process.env.ROUND || 3)

  /**
   * I CASI SI ALTERNANO, non si misura tutto un caso e poi tutto l'altro.
   * Su una macchina condivisa il carico deriva, e in blocco la deriva finisce
   * dentro il rapporto. Alternandoli colpisce entrambi allo stesso modo — e il
   * caso `fondo`, che non cambia mai, dice quanto ha derivato: e' la sentinella.
   */
  const misure = Object.fromEntries(CASI.map(c => [c, []]))
  for (let r = 0; r < ROUND; r++) {
    for (const caso of CASI) {
      await apri(pagina, { caso, n: 12 })
      misure[caso].push(await pagina.evaluate(() => window.__provino.costo({})))
    }
  }

  console.log(`\n1 · COSTO PER FOTOGRAMMA — 12 pannelli, 720x450, ${ROUND} round alternati`)
  console.log('   RASTERIZZATORE SOFTWARE: i millisecondi assoluti non valgono niente.\n')
  console.log('   caso        ms/fotogr.   min-max         x oggi   chiamate   triangoli')
  const ms = {}
  for (const caso of CASI) ms[caso] = mediana(misure[caso].map(m => m.msMediano))
  for (const caso of CASI) {
    const v = misure[caso].map(m => m.msMediano)
    const u = misure[caso][0]
    const arco = `${num(Math.min(...v), 1)}-${num(Math.max(...v), 1)}`
    console.log(`   ${caso.padEnd(10)}  ${num(ms[caso], 1).padStart(9)}   ${arco.padStart(13)}   ${num(ms[caso] / ms.oggi).padStart(6)}   ${String(u.chiamate).padStart(8)}   ${String(u.triangoli).padStart(9)}`)
  }
  const vf = misure.fondo.map(m => m.msMediano)
  console.log(`\n   sentinella: "fondo" e' identico in ogni round e ha oscillato ${num(Math.max(...vf) / Math.min(...vf))}x.`)
  console.log('   E\' il rumore della macchina: sotto quel rapporto, due casi sono indistinguibili.')

  console.log('\n   e il pass e\' uno per fotogramma o uno per pannello?\n')
  console.log('   n     oggi ms   fisico ms   rapporto   chiamate oggi/fisico')
  for (const n of [1, 12, 48]) {
    const a = await costo(pagina, { caso: 'oggi', n })
    const b = await costo(pagina, { caso: 'fisico', n })
    console.log(`   ${String(n).padStart(2)}   ${num(a.ms, 1).padStart(8)}   ${num(b.ms, 1).padStart(9)}   ${num(b.ms / a.ms).padStart(8)}   ${a.campione.chiamate}/${b.campione.chiamate}`)
  }
  return ms
}

async function sezioneScala (pagina, ms) {
  console.log('\n2 · transmissionResolutionScale — quanto se ne recupera\n')
  console.log('   scala   ms/fotogr.   x oggi')
  for (const scala of [1, 0.5, 0.25]) {
    const c = await costo(pagina, { caso: 'fisico', n: 12, scala })
    console.log(`   ${num(scala).padStart(5)}   ${num(c.ms, 1).padStart(9)}   ${ms ? num(c.ms / ms.oggi).padStart(6) : ''}`)
  }
}

/**
 * DA DOVE VIENE IL COSTO — la sezione che impedisce di riportare un rapporto
 * senza sapere di cosa e' fatto.
 *
 * Si disegna la stessa scena due volte, cambiando solo il tipo di bersaglio in
 * cui finisce la prima. Il salto fra `semplice` e `trasmissione` non ha niente
 * a che vedere col vetro: e' il prezzo del formato che three impone al suo
 * bersaglio (half-float, MSAA 4x, mipmap ogni fotogramma).
 */
async function sezioneFormato (pagina) {
  console.log('\n3 · DA DOVE VIENE IL COSTO — il bersaglio, non il vetro\n')
  console.log('   la stessa scena (senza vetro), disegnata due volte:\n')
  console.log('   bersaglio        ms/fotogr.   x un solo passaggio')
  const solo = await costo(pagina, { caso: 'fondo', n: 12 })
  console.log(`   nessuno (1 pass)  ${num(solo.ms, 1).padStart(9)}   ${num(1).padStart(6)}`)
  for (const b of ['semplice', 'trasmissione']) {
    const c = await costo(pagina, { caso: 'fondo', n: 12, bersaglio: b })
    console.log(`   ${b.padEnd(16)}  ${num(c.ms, 1).padStart(9)}   ${num(c.ms / solo.ms).padStart(6)}`)
  }
}

/** Le finestre di campionamento le decide la maschera del pannello, non io. */
function fasce (maschera, LX, LY) {
  const y0 = Math.round(LY * 0.35), y1 = Math.round(LY * 0.65)
  let min = LX, max = -1
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < LX; x++) {
      if (maschera[y * LX + x] > 40) { if (x < min) min = x; if (x > max) max = x }
    }
  }
  const larg = max - min
  return {
    y0, y1, min, max, larg, LX,
    centro: [Math.round(min + larg * 0.45), Math.round(min + larg * 0.55)],
    sinistra: [min, Math.round(min + larg * 0.06)],
    destra: [Math.round(max - larg * 0.06), max]
  }
}

function media (quadro, [xa, xb], f, maschera) {
  let s = 0, n = 0
  for (let y = f.y0; y < f.y1; y++) {
    for (let x = xa; x <= xb; x++) {
      if (maschera[y * f.LX + x] <= 40) continue
      s += quadro[y * f.LX + x]; n++
    }
  }
  return n ? s / n : NaN
}

/** contrasto fra il bordo radente e il centro: e' la curva di Fresnel, in un numero */
function contrasto (quadro, f, maschera) {
  const c = media(quadro, f.centro, f, maschera)
  const b = (media(quadro, f.sinistra, f, maschera) + media(quadro, f.destra, f, maschera)) / 2
  return { centro: c, bordo: b, rapporto: b / c }
}

function rms (a, b, maschera) {
  let s = 0, n = 0
  for (let i = 0; i < a.length; i++) {
    if (maschera[i] <= 40) continue
    const d = a[i] - b[i]; s += d * d; n++
  }
  return Math.sqrt(s / n)
}

async function quadroDi (pagina, parametri, { salva = null } = {}) {
  await apri(pagina, { ...parametri, n: 1, posa: 'primopiano', immagine: 1 })
  const q = await pagina.evaluate(() => window.__provino.quadro())
  if (salva) {
    await pagina.screenshot({
      path: fileURLToPath(new URL(`${salva}.png`, import.meta.url)),
      clip: { x: 0, y: 0, width: 720, height: 450 }
    })
  }
  return q
}

async function sezioneImmagine (pagina, opzioniLeggero = {}) {
  console.log('\n4 · IL PRIMO PIANO — il contrasto di Fresnel, e la distanza dal vetro fisico\n')
  const quadri = {}
  quadri.oggi = await quadroDi(pagina, { caso: 'oggi' }, { salva: 'primopiano-oggi' })
  const maschera = await pagina.evaluate(() => window.__provino.maschera())
  const { larghezza: LX, altezza: LY } = await pagina.evaluate(() => ({
    larghezza: window.__provino.larghezza, altezza: window.__provino.altezza
  }))
  const f = fasce(maschera, LX, LY)

  /**
   * UN CANCELLO CHE PARLA. La prima corsa ha stampato NaN su tutta la tabella:
   * il pannello era ruotato di 90 gradi e si vedeva di taglio, la maschera era
   * vuota, e nessuno lo diceva. Anche le prestazioni di quella corsa erano
   * false, perche' il vetro copriva quattro pixel.
   */
  if (!(f.larg > 10)) {
    console.error(`\n  MASCHERA VUOTA: il pannello non e' in quadro (colonne ${f.min}-${f.max}).`)
    console.error('  Nessuna misura d\'immagine ha senso finche\' non si sistema la posa.\n')
    process.exit(2)
  }

  quadri.leggero = await quadroDi(pagina, { caso: 'leggero', ...opzioniLeggero }, { salva: 'primopiano-leggero' })
  quadri.fisico = await quadroDi(pagina, { caso: 'fisico' }, { salva: 'primopiano-fisico' })

  console.log(`   il pannello occupa le colonne ${f.min}-${f.max} di ${LX}\n`)
  console.log('   caso       centro   bordo   bordo/centro   scarto dal fisico')
  for (const caso of ['oggi', 'leggero', 'fisico']) {
    const c = contrasto(quadri[caso], f, maschera)
    const d = caso === 'fisico' ? '—' : num(rms(quadri[caso], quadri.fisico, maschera), 1)
    console.log(`   ${caso.padEnd(9)}  ${num(c.centro, 1).padStart(6)}  ${num(c.bordo, 1).padStart(6)}   ${num(c.rapporto).padStart(12)}   ${String(d).padStart(17)}`)
  }
  console.log('\n   lo scarto e\' lo scarto quadratico medio di luminanza (0-255) sui soli')
  console.log('   pixel del pannello. Immagini: riferimenti/vetro/primopiano-*.png')
  return { quadri, maschera, f }
}

/**
 * LA TARATURA DEL VETRO LEGGERO.
 *
 * Il vetro leggero ha due manopole che il vetro fisico non ha, perche' non ha
 * un volume: quanto e' velato in faccia, e quanto e' opaco il retro. Invece di
 * sceglierle a occhio si scandiscono, prendendo come riferimento il vetro
 * fisico — che il volume ce l'ha.
 *
 * NON si sceglie il minimo dello scarto e basta: uno scarto piccolo con un
 * contrasto sbagliato vuol dire una lastra piatta della tinta giusta, che e'
 * esattamente il difetto da cui si parte. Si guardano i due numeri insieme.
 */
async function sezioneTaratura (pagina) {
  console.log('\n5 · TARATURA DEL VETRO LEGGERO — contro il vetro fisico\n')
  const fisico = await quadroDi(pagina, { caso: 'fisico' })
  const maschera = await pagina.evaluate(() => window.__provino.maschera())
  const { larghezza: LX, altezza: LY } = await pagina.evaluate(() => ({
    larghezza: window.__provino.larghezza, altezza: window.__provino.altezza
  }))
  const f = fasce(maschera, LX, LY)
  const rifFisico = contrasto(fisico, f, maschera)
  console.log(`   riferimento fisico: centro ${num(rifFisico.centro, 1)}  bordo ${num(rifFisico.bordo, 1)}  contrasto ${num(rifFisico.rapporto)}\n`)
  console.log('   velo   retro   durezza   centro   bordo   bordo/centro   scarto')
  for (const velo of [0.5, 0.6, 0.7]) {
    for (const retro of [0.55, 0.8, 1]) {
      for (const durezza of [5]) {
        const q = await quadroDi(pagina, { caso: 'leggero', velo, retro, durezza })
        const c = contrasto(q, f, maschera)
        console.log(`   ${num(velo).padStart(4)}   ${num(retro).padStart(5)}   ${String(durezza).padStart(7)}   ${num(c.centro, 1).padStart(6)}  ${num(c.bordo, 1).padStart(6)}   ${num(c.rapporto).padStart(12)}   ${num(rms(q, fisico, maschera), 1).padStart(6)}`)
      }
    }
  }
}

/**
 * sRGB -> lineare. Serve perche' il rapporto fra due luminanze CODIFICATE non
 * e' il rapporto fra le due luminanze: la codifica sRGB comprime, e un
 * contrasto vero di 10 si legge come 2,5. Un rapporto di riflettanze si fa in
 * lineare, o non e' un rapporto di riflettanze.
 */
function lineare (v) {
  const u = v / 255
  return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4)
}

/**
 * IL PROFILO DI FRESNEL — sul banco a tinta unita.
 *
 * Nove fasce verticali dal centro del pannello verso il bordo, mediate in
 * lineare. Su un dielettrico la curva deve SALIRE verso il bordo (0,04 in
 * faccia, verso 1 di taglio); su un metallo deve restare piatta, perche' un
 * conduttore riflette quasi lo stesso a ogni angolo.
 */
async function sezioneFresnel (pagina) {
  console.log('\n6 · IL FRESNEL, sul banco a tinta unita (nessuna luce diretta, nero dietro)\n')
  const quadri = {}
  // VELO e SENZARETRO sono manopole di diagnosi: servono a isolare da dove
  // viene la riflettanza del vetro leggero, non a tarare niente.
  const extra = {}
  if (process.env.VELO) extra.velo = process.env.VELO
  if (process.env.SENZARETRO) extra.retro = 0
  for (const caso of ['oggi', 'leggero', 'fisico']) {
    quadri[caso] = await quadroDi(pagina, { caso, uniforme: 1, ...(caso === 'leggero' ? extra : {}) }, { salva: `fresnel-${caso}` })
  }
  const maschera = await pagina.evaluate(() => window.__provino.maschera())
  const { larghezza: LX, altezza: LY } = await pagina.evaluate(() => ({
    larghezza: window.__provino.larghezza, altezza: window.__provino.altezza
  }))
  const f = fasce(maschera, LX, LY)
  if (!(f.larg > 10)) { console.error('  MASCHERA VUOTA sul banco Fresnel.'); return }

  const FASCE = 9
  const bande = []
  for (let i = 0; i < FASCE; i++) {
    const a = f.min + Math.round(f.larg * i / FASCE)
    const b = f.min + Math.round(f.larg * (i + 1) / FASCE) - 1
    bande.push([a, Math.max(a, b)])
  }

  const mediaLin = (quadro, [xa, xb]) => {
    let s = 0, n = 0
    for (let y = f.y0; y < f.y1; y++) {
      for (let x = xa; x <= xb; x++) {
        if (maschera[y * LX + x] <= 40) continue
        s += lineare(quadro[y * LX + x]); n++
      }
    }
    return n ? s / n : NaN
  }

  console.log('   caso       profilo dal bordo sinistro al bordo destro (luminanza lineare x1000)')
  const profili = {}
  for (const caso of ['oggi', 'leggero', 'fisico']) {
    const p = bande.map(b => mediaLin(quadri[caso], b))
    profili[caso] = p
    console.log(`   ${caso.padEnd(9)}  ${p.map(v => num(v * 1000, 1).padStart(6)).join('')}`)
  }
  /**
   * LA RIFLETTANZA IN FACCIA, ed e' IL numero di questa pagina.
   *
   * L'ambiente del banco e' una tinta unita #808080, cioe' 0,2159 in lineare.
   * La luminanza al centro del pannello divisa per quella E' la riflettanza a
   * incidenza normale: un numero che si confronta con la fisica e non con
   * un'opinione — **su un vetro vale 0,04**, e su questo non si discute.
   *
   * E' anche la taratura del banco: se il vetro fisico non stampa ~4%, non e'
   * il vetro a essere sbagliato, e' il banco, e il resto della tabella si
   * butta.
   */
  const AMBIENTE_LINEARE = 0.2159
  console.log('\n   caso       riflettanza in faccia   bordo/centro')
  for (const caso of ['oggi', 'leggero', 'fisico']) {
    const p = profili[caso]
    const centro = p[Math.floor(FASCE / 2)]
    const bordo = (p[0] + p[FASCE - 1]) / 2
    const r = `${num(100 * centro / AMBIENTE_LINEARE)}%`
    console.log(`   ${caso.padEnd(9)}  ${r.padStart(21)}   ${num(bordo / centro).padStart(12)}`)
  }
  console.log('   una faccia sola       4,00%   (la fisica: vetro, ior 1,5, incidenza normale)')
  console.log('   una lastra vera       7,69%   (due facce: 2R/(1+R), ed e la somma che si vede da fuori)')
}

/**
 * COME SCALA COL NUMERO DI PIXEL — la sezione che parla del telefono.
 *
 * Un telefono non ha meno lavoro da fare: ha MENO GPU e spesso PIU' PIXEL. Se
 * il sovraccosto della trasmissione cresce coi pixel (e non e' un costo fisso),
 * allora sul telefono peggiora, e la manopola giusta e' la risoluzione del
 * pass, non il numero di vetri.
 */
async function sezionePixel (pagina) {
  console.log('\n7 · COME SCALA COI PIXEL\n')
  /**
   * OGNI MISURA E' DIVISA PER LA STESSA SCENA SENZA VETRO, presa nella stessa
   * finestra e alla stessa risoluzione.
   *
   * Non e' un vezzo statistico: questa macchina e' condivisa, e una corsa ha
   * stampato il vetro di oggi a 2854 ms su 360x226 e a 1526 ms su 720x450 —
   * cioe' piu' lento con meno della meta' dei pixel. Quel numero non parlava
   * del vetro, parlava di chi altro stava lavorando sulla macchina in quel
   * momento. Diviso per il fondo, quella deriva se ne va quasi tutta.
   */
  console.log('   quadro       fondo ms   oggi / fondo   fisico / fondo')
  for (const [l, h] of [[360, 226], [720, 450], [1080, 676]]) {
    const f = await costo(pagina, { caso: 'fondo', n: 12, l, h })
    const a = await costo(pagina, { caso: 'oggi', n: 12, l, h })
    const b = await costo(pagina, { caso: 'fisico', n: 12, l, h })
    console.log(`   ${String(l + 'x' + h).padEnd(10)}   ${num(f.ms, 1).padStart(8)}   ${num(a.ms / f.ms).padStart(12)}   ${num(b.ms / f.ms).padStart(14)}`)
  }
}

async function principale () {
  const chieste = process.argv.slice(2).filter(a => !a.startsWith('-'))
  const fai = (nome) => chieste.length === 0 || chieste.includes(nome)

  const server = await servi()
  const browser = await apriBrowser()
  const pagina = await browser.newPage({ viewport: { width: 900, height: 620 } })
  pagina.on('pageerror', e => {
    console.error('  errore in pagina:', String(e).split(/\r?\n/)[0])
    process.exitCode = 1
  })

  let ms = null
  if (fai('costo')) ms = await sezioneCosto(pagina)
  if (fai('scala')) await sezioneScala(pagina, ms)
  if (fai('formato')) await sezioneFormato(pagina)
  if (fai('immagine')) await sezioneImmagine(pagina)
  if (fai('taratura')) await sezioneTaratura(pagina)
  if (fai('fresnel')) await sezioneFresnel(pagina)
  if (fai('pixel')) await sezionePixel(pagina)
  console.log('')

  await browser.close()
  server.close()
}

principale().catch(e => { console.error(e); process.exit(1) })
