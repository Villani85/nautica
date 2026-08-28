/**
 * IL VARCO NEL PELO SI APRE COL TAGLIO, E SOLO DOVE SI GUARDA ATTRAVERSO.
 *
 * Il pelo dell'acqua ha `opacity: 0.88` e assorbe il 70% di cio' che sta
 * sotto: misurato dando ai materiali del meccanismo un'emissiva BIANCO PURO,
 * che leggeva 68 su 255 invece di 255. E' la ragione per cui alla battuta
 * della tesi -- «The part you never see» -- il pezzo era una sagoma da gamma
 * 16.
 *
 * Adesso il taglio apre anche la superficie, dove il raggio di vista incontra
 * il meccanismo. Questo cancello tiene ferme due cose:
 *
 *   1. **col taglio aperto il pezzo si legge**: gamma sopra la soglia;
 *   2. **col taglio chiuso il mare torna intero**: se il varco restasse
 *      aperto, il sito avrebbe una finestra permanente nell'acqua e la
 *      sezione smetterebbe di essere un gesto.
 *
 * I pixel del soggetto si isolano con l'emissiva, come in
 * `strumenti/maschera-soggetto.mjs`: un rettangolo a occhio non funziona --
 * il meccanismo e' il 3% del quadro e in un rettangolo diluisce sotto il
 * rumore. Ci ho perso un'ora per impararlo.
 */
import { apriBrowser } from './browser.mjs'
import { spawn } from 'node:child_process'

const GAMMA_MIN = 60      // col taglio aperto
const GAMMA_MAX_CHIUSO = 35   // col taglio chiuso
const PORTA = process.env.PORTA_COLLAUDO || 5216

const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
await new Promise(r => setTimeout(r, 4000))
const browser = await apriBrowser({ conGpu: true })
const pg = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1${process.env.EXTRA || ''}`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })
/**
 * ─── LA POSIZIONE SI RICAVA DALLA SEZIONE, non e' una frazione del documento
 *
 * Qui c'era `scrollTo(H * 0.375)`. Ha smesso di funzionare il giorno in cui il
 * documento e' cambiato: togliendo le due sezioni di prosa la pagina si e'
 * dimezzata, e il 37,5% e' finito su un'altra battuta. Il sintomo non era
 * «cancello rosso per il motivo giusto»: era **soggetto 772 pixel su 921.600**
 * -- lo 0,08% -- cioe' una statistica calcolata sul rumore. Il cancello
 * gridava «il varco resta aperto» guardando un fotogramma in cui il meccanismo
 * non c'era.
 *
 * E' la stessa trappola di `collaudo-manopola`, curata ieri nello stesso modo,
 * e la regola che questo repo si e' gia' dato due volte: nessuna soglia in
 * frazioni di pagina. La dimostrazione sa dove sta -- ha un rettangolo -- e la
 * battuta del meccanismo si trova cercandola, non indovinandola.
 */
const trovata = await pg.evaluate(async () => {
  const sez = document.querySelector('#dimostrazione')
  const H = document.documentElement.scrollHeight - innerHeight
  const r = sez.getBoundingClientRect()
  const cima = (scrollY + r.top) / H
  const fondo = (scrollY + r.bottom - innerHeight) / H
  for (let f = fondo; f >= cima; f -= 0.01) {
    scrollTo(0, Math.round(H * f))
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    const palco = sez.querySelector('.palco[data-battuta]')
    const b = palco.getBoundingClientRect()
    if (palco.dataset.battuta === 'meccanismo' && b.top > -1 && b.bottom > innerHeight - 1) return f
  }
  return null
})
if (trovata === null) {
  console.error('  ROTTO  non trovo nessuna posizione con la battuta "meccanismo" in quadro')
  process.exit(2)
}
console.log(`  inquadratura trovata al ${(trovata * 100).toFixed(0)}% dello scorrimento`)
await pg.waitForTimeout(3000)

const r = await pg.evaluate(() => {
  const n = window.__nautica
  if (!n.acqua || !n.acqua.uni.uSpaccato) return { rotto: 'le uniformi dell acqua non sono esposte' }
  const suoi = new Set(['acciaio', 'lucido', 'carter', 'motore', 'tenuta', 'gomma', 'cavo', 'bronzo', 'sezione'])
  const mats = []
  n.nave.traverse(o => {
    if (!o.isMesh || !o.material) return
    for (const m of [].concat(o.material)) if (suoi.has(String(m.name)) && !mats.includes(m)) mats.push(m)
  })
  if (!mats.length) return { rotto: 'nessun materiale del meccanismo: i nomi sono cambiati' }
  const t = n.render.domElement
  const c = document.createElement('canvas'); c.width = t.width; c.height = t.height
  const x = c.getContext('2d')
  const leggi = () => { n.render.render(n.scena, n.camera); x.drawImage(t, 0, 0); return x.getImageData(0, 0, c.width, c.height).data }
  const base = leggi()
  mats.forEach(m => m.emissive && m.emissive.setHex(0xff0000))
  const marc = leggi()
  mats.forEach(m => m.emissive && m.emissive.setHex(0x000000))
  const mask = []
  for (let i = 0; i < base.length; i += 4) if (marc[i] - base[i] > 10) mask.push(i)
  if (!mask.length) return { rotto: 'il meccanismo non e in quadro a questa quota' }
  const stat = (d) => {
    const v = mask.map(i => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]).sort((a, b) => a - b)
    return { m: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1),
             g: Math.round(v[Math.floor(v.length * 0.95)] - v[Math.floor(v.length * 0.05)]) }
  }
  const sp = n.acqua.uni.uSpaccato
  const prima = sp.value
  sp.value = 1; const aperto = stat(leggi())
  sp.value = 0; const chiuso = stat(leggi())
  sp.value = prima
  return { pixel: mask.length, quadro: c.width * c.height, aperto, chiuso, varchi: n.acqua.uni.uQuantiVarchi.value }
})
await browser.close(); preview.kill()

if (r.rotto) { console.error('  ROTTO  ' + r.rotto); process.exit(1) }

console.log('il varco nel pelo')
console.log(`  soggetto  ${r.pixel} pixel su ${r.quadro} (${(100 * r.pixel / r.quadro).toFixed(2)}%) · ${r.varchi} varchi`)
console.log(`  APERTO    media ${r.aperto.m}  gamma ${r.aperto.g}   (minimo ${GAMMA_MIN})`)
console.log(`  CHIUSO    media ${r.chiuso.m}  gamma ${r.chiuso.g}   (tetto ${GAMMA_MAX_CHIUSO})`)

const guai = []
if (!r.varchi) guai.push('nessun varco impostato: seguiVarchi non e stato chiamato, o gli impianti non si sono caricati.')
if (r.aperto.g < GAMMA_MIN) guai.push(`col taglio aperto il meccanismo ha gamma ${r.aperto.g}: resta una sagoma.`)
if (r.chiuso.g > GAMMA_MAX_CHIUSO) guai.push(`col taglio CHIUSO il meccanismo ha gia gamma ${r.chiuso.g}: il varco resta aperto e il mare ha una finestra permanente.`)
if (guai.length) {
  console.error('\nCOLLAUDO VARCO FALLITO')
  for (const g of guai) console.error('  · ' + g)
  process.exit(1)
}
console.log('\ncollaudo varco: passato')
