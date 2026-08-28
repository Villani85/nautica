/**
 * IL FOTOGRAMMA IN CUI IL FILMATO PASSA IL COMANDO AL 3D.
 *
 *     node strumenti/consegna.mjs <filmato-discesa.mp4> [cartella-uscita]
 *
 * ─── PERCHE' ESISTE
 *
 * La discesa dal salone al meccanismo la fa un filmato: a trenta metri la nave
 * in tempo reale non regge il confronto con una fotografia, e il committente
 * l'ha detto senza giri -- «per evitare che si veda quel modellino che sembra
 * plastica». Il 3D riprende il comando sul primo piano del meccanismo.
 *
 * Quel passaggio vive o muore su UN fotogramma: l'ultimo del filmato e il primo
 * del 3D. Se non coincidono, chi guarda vede uno stacco e capisce che finora
 * stava guardando un video -- che e' esattamente cio' che il sito non vuole
 * dire, perche' da li' in poi il 3D e' vero e si comanda.
 *
 * ─── COSA MISURA, E PERCHE' NON UN SOLO NUMERO
 *
 * Un PSNR fra i due fotogrammi non serve: il filmato e' una ricostruzione
 * generativa del mio fotogramma, quindi differisce ovunque di poco e da
 * nessuna parte in modo utile. Un numero solo direbbe «diverso» senza dire in
 * che cosa, e si finirebbe a inseguirlo.
 *
 * Servono le grandezze che l'occhio usa per accorgersi di uno stacco, e sono
 * poche:
 *
 *   1. **la linea d'acqua** -- a quale riga sta, nei due. Se salta, e' la cosa
 *      piu' visibile che esista: l'orizzonte non si sposta mai;
 *   2. **il riquadro della pinna** -- dove sta e quanto e' grande. E' il
 *      soggetto: se cambia scala o posizione, lo stacco e' uno stacco;
 *   3. **i tre toni** -- acqua sotto la linea, cielo sopra, scafo. Un salto di
 *      colore si vede anche quando la geometria combacia.
 *
 * Ognuna si legge nei due fotogrammi con lo stesso codice, e si stampa la
 * differenza. Cosi' quello che va corretto si sa gia' cos'e'.
 */
import { spawn, execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { apriBrowser } from './browser.mjs'

const [filmato, cartella = 'consegna'] = process.argv.slice(2)
/**
 * ─── L'ISTANTE DELLA CONSEGNA E' UNA LEVA, ed e' l'unica onesta
 *
 * La pinna nel filmato e' alta il doppio della mia. Ho provato ad alzare la
 * camera: non si puo', con beccheggio zero alzarsi vuol dire guardare un altro
 * pezzo di nave (misurato, sta scritto in `scena/index.js`). E inclinare la
 * pinna a mano sarebbe una posa che la fisica non produce -- la bugia che
 * questo sito rifiuta.
 *
 * Ma la posa della pinna cambia da sola nel tempo, perche' e' l'uscita di un
 * integratore. Allora la leva e' QUALE ISTANTE si consegna: si spazzolano gli
 * istanti, si misura la pinna in ciascuno, e si prende quello che somiglia al
 * filmato. Nessuna geometria toccata, nessun numero inventato.
 *
 * Serve pero' che il fotogramma sia ripetibile, o si misura il caso: da qui
 * `?fermo=`, che inchioda simulazione, onde, dimostrazione automatica e seme
 * del mare. Vedi `stato.js`.
 */
const ISTANTI = process.env.ISTANTI
  ? process.env.ISTANTI.split(',').map(Number)
  : [12]
/**
 * E LA SECONDA LEVA E' LA DISTANZA, che l'invariante non tocca. Avvicinarsi
 * non inclina niente: il beccheggio resta zero e la linea d'acqua resta sulla
 * mezzeria. Si spazzola con `?raggio=`, di serie il valore spedito.
 */
const RAGGI = process.env.RAGGI ? process.env.RAGGI.split(',').map(Number) : [null]
if (!filmato) { console.error('uso: consegna.mjs <filmato.mp4> [cartella]'); process.exit(2) }
mkdirSync(cartella, { recursive: true })

const L = 1280
const A = 720

/* --- l'ULTIMO fotogramma del filmato, non uno vicino alla fine.
 * `-sseof -0.05` prende gli ultimi 50 ms; senza, con `-ss` si atterra su un
 * fotogramma qualunque e si confronta con qualcosa che non e' la consegna. */
const daFilmato = join(cartella, 'filmato-ultimo.png')
execFileSync('ffmpeg', ['-v', 'error', '-y', '-sseof', '-0.05', '-i', filmato,
  '-update', '1', '-frames:v', '1', '-vf', `scale=${L}:${A}`, daFilmato])

/* --- il fotogramma del sito alla battuta del meccanismo */
const PORTA = process.env.PORTA_COLLAUDO || 5233
const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
const browser = await apriBrowser({ conGpu: true })
const pg = await browser.newPage()
await pg.setViewportSize({ width: L, height: A })
async function allaConsegna (t, raggio) {
  const r = raggio === null ? '' : `&raggio=${raggio}`
  await pg.goto(`http://localhost:${PORTA}/?ispeziona=1&fermo=${t}${r}`, { waitUntil: 'load' })
  await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
  return cerca()
}

/* la battuta si CERCA, non si indovina: la pagina ha gia' cambiato altezza una
 * volta e ogni frazione fissa scritta a mano e' finita su un'altra scena */
const cerca = () => pg.evaluate(async () => {
  const sez = document.querySelector('#dimostrazione')
  const H = document.documentElement.scrollHeight - innerHeight
  const r = sez.getBoundingClientRect()
  const cima = (scrollY + r.top) / H
  const fondo = (scrollY + r.bottom - innerHeight) / H
  for (let f = fondo; f >= cima; f -= 0.005) {
    scrollTo(0, Math.round(H * f))
    await new Promise((y) => requestAnimationFrame(() => requestAnimationFrame(y)))
    const p = sez.querySelector('.palco[data-battuta]')
    const b = p.getBoundingClientRect()
    if (p.dataset.battuta === 'meccanismo' && b.top > -1 && b.bottom > innerHeight - 1) return f
  }
  return null
})

/* ─── LE LETTURE */
const pixel = (f) => execFileSync('ffmpeg', ['-v', 'error', '-i', f,
  '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1e9 })
const lum = (b, x, y) => (0.2126 * b[(y * L + x) * 3] + 0.7152 * b[(y * L + x) * 3 + 1] +
                          0.0722 * b[(y * L + x) * 3 + 2])

/**
 * LA LINEA D'ACQUA: la riga dove la luminanza media crolla di piu'.
 * Non si cerca un colore -- il cielo e' crema in uno e grigio nell'altro --
 * si cerca il SALTO, che c'e' in tutti e due perche' l'acqua e' scura.
 */
function linea (b) {
  const media = []
  for (let y = 0; y < A; y++) {
    let s = 0
    for (let x = 0; x < L; x += 4) s += lum(b, x, y)
    media.push(s / (L / 4))
  }
  let peggio = 0
  let riga = 0
  for (let y = 8; y < A - 8; y++) {
    const d = media[y - 6] - media[y + 6]
    if (d > peggio) { peggio = d; riga = y }
  }
  return { y: riga, salto: peggio, sopra: media[riga - 20] || 0, sotto: media[riga + 40] || 0 }
}

/**
 * LA PINNA: quanto e' ALTA a schermo, e si misura per colonne.
 *
 * Il rettangolo che contiene tutti i pixel chiari non serve: sott'acqua ci sono
 * anche il martinetto, le staffe, il bordo dello scafo -- e nel fotogramma del
 * sito anche i riquadri dell'interfaccia. Su quattro colonne che cadono in
 * mezzo alla pinna in entrambi i fotogrammi si contano invece i pixel chiari
 * sotto la linea: e' l'altezza proiettata, che e' proprio la grandezza in cui i
 * due fotogrammi differiscono.
 */
const COLONNE = [800, 850, 900, 950]
const X1 = 660
const X2 = 1160
function altezzaPinna (b, y0) {
  const acqua = []
  for (let y = y0 + 12; y < A; y += 3) for (let x = X1; x < X2; x += 3) acqua.push(lum(b, x, y))
  acqua.sort((p, q) => p - q)
  const soglia = acqua[Math.floor(acqua.length / 2)] + 25
  const alt = COLONNE.map((x) => {
    let n = 0
    for (let y = y0 + 8; y < A; y++) if (lum(b, x, y) > soglia) n++
    return n
  })
  return { alt, media: alt.reduce((p, q) => p + q, 0) / alt.length }
}

const bf = pixel(daFilmato)
const lf = linea(bf)
const pf = altezzaPinna(bf, lf.y)

console.log('')
console.log('IL BERSAGLIO — l ultimo fotogramma del filmato')
console.log(`  linea d acqua      riga ${lf.y}   tono sopra ${lf.sopra.toFixed(1)}  sotto ${lf.sotto.toFixed(1)}`)
console.log(`  pinna              altezza per colonna ${pf.alt.join(' ')}   media ${pf.media.toFixed(1)} px`)
console.log('')
console.log('E GLI ISTANTI DEL SITO')
console.log('  istante  raggio   linea   pinna              media    scarto sul bersaglio')

let migliore = null
for (const raggio of RAGGI) for (const t of ISTANTI) {
  const dove = await allaConsegna(t, raggio)
  if (dove === null) { console.error(`  ${t}s: non trovo la battuta del meccanismo`); continue }
  await pg.waitForTimeout(2200)
  const f = join(cartella, `sito-${t}s-r${raggio ?? 'x'}.png`)
  writeFileSync(f, await pg.screenshot())
  const b = pixel(f)
  const ls = linea(b)
  const ps = altezzaPinna(b, ls.y)
  const scarto = Math.abs(ps.media - pf.media)
  console.log(`  ${String(t).padStart(6)}s  ${String(raggio ?? 'spedito').padStart(7)}   ${String(ls.y).padStart(5)}   ${ps.alt.join(' ').padEnd(18)} ${ps.media.toFixed(1).padStart(6)}   ${(ps.media - pf.media).toFixed(1).padStart(8)} px`)
  if (!migliore || scarto < migliore.scarto) migliore = { t, raggio, scarto, f, dove }
}
await browser.close()
preview.kill()

if (migliore) {
  console.log('')
  console.log(`  il piu' vicino e ${migliore.t}s a raggio ${migliore.raggio ?? 'spedito'}, a ${migliore.scarto.toFixed(1)} px dal bersaglio`)
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', daFilmato, '-i', migliore.f,
    '-lavfi', 'vstack', join(cartella, 'affiancati.png')])
  console.log(`  scritti: ${daFilmato}`)
  console.log(`           ${migliore.f}`)
  console.log(`           ${join(cartella, 'affiancati.png')}   (filmato sopra, sito sotto)`)
}
