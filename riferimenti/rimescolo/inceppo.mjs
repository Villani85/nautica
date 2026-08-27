/**
 * QUANTO SI VEDE IL SALTO A RUNTIME — misurato in un browser vero.
 *
 *   node riferimenti/rimescolo/inceppo.mjs [file.mp4]
 *
 * ─── COSA MISURA, E PERCHE' NON MISURA LA SEEK
 *
 * `video.currentTime = x` scatena una ricerca. Cronometrare `seeked` dice
 * quanto ci ha messo il LETTORE, non quanto e' rimasta ferma l'IMMAGINE — e
 * l'immagine e' l'unica cosa che il visitatore guarda. Quindi il banco
 * cronometra l'intervallo fra due fotogrammi PRESENTATI, con
 * `requestVideoFrameCallback`.
 *
 * A 24 fotogrammi al secondo il passo normale e' 41,7 ms. Il numero che conta
 * e' quanti fotogrammi in piu' di uno passano fra l'ultimo prima del salto e
 * il primo dopo: zero vuol dire che non si vede.
 *
 * ─── IL TESTIMONE STA DALLA PARTE DELLA COSA MISURATA
 *
 * Prima del primo salto si aspetta che l'intervallo bufferizzato copra TUTTO
 * il filmato. Un salto dentro il buffer e uno fuori sono due misure diverse, e
 * confonderle vuol dire pubblicare il numero di una rete che quel giorno era
 * lenta. Se il buffer non copre tutto, questo strumento lo DICHIARA invece di
 * misurare lo stesso.
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { apriBrowser } from '../../strumenti/browser.mjs'

const RADICE = fileURLToPath(new URL('../..', import.meta.url))
const FILM = process.argv[2] || 'public/filmati/salone-largo.mp4'

/* Un server statico che sa fare le RICHIESTE PARZIALI. Senza `Range`, Chrome
 * scarica il filmato una volta sola e in blocco: la ricerca funziona lo
 * stesso, ma non e' quello che fa un sito vero, e il numero misurato sarebbe
 * di un altro caso. */
const TIPI = { '.html': 'text/html', '.mp4': 'video/mp4', '.json': 'application/json' }
const server = createServer(async (req, res) => {
  const percorso = join(RADICE, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, ''))
  let info
  try { info = await stat(percorso) } catch { res.writeHead(404); return res.end('no') }
  const tipo = TIPI[extname(percorso)] || 'application/octet-stream'
  const range = req.headers.range
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range)
    const da = m[1] ? parseInt(m[1]) : 0
    const a = m[2] ? parseInt(m[2]) : info.size - 1
    res.writeHead(206, {
      'Content-Type': tipo, 'Accept-Ranges': 'bytes',
      'Content-Range': `bytes ${da}-${a}/${info.size}`, 'Content-Length': a - da + 1
    })
    return createReadStream(percorso, { start: da, end: a }).pipe(res)
  }
  res.writeHead(200, { 'Content-Type': tipo, 'Accept-Ranges': 'bytes', 'Content-Length': info.size })
  res.end(await readFile(percorso))
})
await new Promise(r => server.listen(0, '127.0.0.1', r))
const porta = server.address().port

const browser = await apriBrowser({ visibile: !!process.env.VISIBILE })
const pagina = await browser.newPage()
const url = `http://127.0.0.1:${porta}/riferimenti/rimescolo/banco.html?v=/${FILM}`
console.log(`  banco: ${url}`)
await pagina.goto(url)
await pagina.waitForFunction('window.__banco && window.__banco.pronto()', null, { timeout: 20000 })

const durata = await pagina.evaluate('window.__banco.durata()')

/* Si aspetta che il buffer copra tutto: fino ad allora, un salto misurerebbe
 * la rete e non il lettore. */
let coperto = 0
for (let i = 0; i < 80; i++) {
  const b = await pagina.evaluate('window.__banco.bufferizzato()')
  coperto = b.length ? b[b.length - 1][1] : 0
  if (coperto >= durata - 0.3) break
  await pagina.waitForTimeout(250)
}
const tuttoInBuffer = coperto >= durata - 0.3
console.log(`  durata ${durata.toFixed(2)} s, bufferizzati ${coperto.toFixed(2)} s` +
  (tuttoInBuffer ? '  (tutto in memoria: si misura il lettore, non la rete)'
                 : '  ATTENZIONE: il buffer NON copre tutto, il numero include la rete'))

/* I salti si leggono dalla tabella prodotta da `strumenti/rimescola.py`: si
 * misura QUELLO CHE IL SITO FAREBBE, non salti inventati qui. */
let salti
try {
  const t = JSON.parse(await readFile(join(RADICE, 'riferimenti/rimescolo/salti.json'), 'utf8'))
  salti = t.salti
  if (t.filmato && !FILM.endsWith(t.filmato)) {
    console.log(`  ATTENZIONE: la tabella e di ${t.filmato}, il banco riproduce ${FILM}`)
  }
} catch {
  console.log('  nessuna tabella: si misurano salti a caso, che e una misura piu debole')
  salti = Array.from({ length: 24 }, () => ({
    da: Math.random() * durata, a: Math.random() * durata, costo_x: null
  }))
}
/* Un campione sparso: i primi venti della tabella sono tutti vicini fra loro e
 * misurerebbero lo stesso salto venti volte. */
const passo = Math.max(1, Math.floor(salti.length / 30))
const campione = salti.filter((_s, i) => i % passo === 0).slice(0, 30)

for (const s of campione) {
  await pagina.evaluate(`window.__banco.salta(${s.da}, ${s.a})`)
  await pagina.waitForTimeout(500)
}
const esiti = await pagina.evaluate('window.__banco.esiti()')
await browser.close()
server.close()

const buchi = esiti.map(e => e.buco_ms).filter(x => x != null).sort((a, b) => a - b)
const persi = esiti.map(e => e.fotogrammi_persi).filter(x => x != null)
const mediana = a => a.length ? a[Math.floor(a.length / 2)] : NaN
console.log(`\n  ${esiti.length} salti misurati su ${campione.length} chiesti`)
if (!esiti.length) {
  console.log('  nessun salto e stato osservato: il banco non ha misurato niente')
  process.exit(1)
}
console.log(`  buco fra due fotogrammi presentati: mediana ${mediana(buchi).toFixed(0)} ms, ` +
  `peggiore ${buchi[buchi.length - 1].toFixed(0)} ms   (un fotogramma normale = 41,7 ms)`)
console.log(`  fotogrammi persi: mediana ${mediana(persi.slice().sort((a, b) => a - b))}, ` +
  `peggiore ${Math.max(...persi)}`)
console.log(`  salti che hanno perso piu di 2 fotogrammi: ` +
  `${persi.filter(x => x > 2).length} su ${persi.length}`)
