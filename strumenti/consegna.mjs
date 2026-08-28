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
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })

/* la battuta si CERCA, non si indovina: la pagina ha gia' cambiato altezza una
 * volta e ogni frazione fissa scritta a mano e' finita su un'altra scena */
const dove = await pg.evaluate(async () => {
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
if (dove === null) { console.error('  non trovo la battuta del meccanismo'); process.exit(2) }
await pg.waitForTimeout(2500)
const daSito = join(cartella, 'sito-consegna.png')
writeFileSync(daSito, await pg.screenshot())
await browser.close()
preview.kill()

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
 * IL RIQUADRO DELLA PINNA: sott'acqua e' l'unica cosa CHIARA. Si prende tutto
 * cio' che sta sotto la linea ed e' piu' chiaro della mediana dell'acqua piu'
 * un margine, e se ne legge il rettangolo.
 */
function pinna (b, y0) {
  const acqua = []
  for (let y = y0 + 10; y < A; y += 3) for (let x = 0; x < L; x += 3) acqua.push(lum(b, x, y))
  acqua.sort((p, q) => p - q)
  const soglia = acqua[Math.floor(acqua.length / 2)] + 25
  let x1 = L
  let x2 = 0
  let a1 = A
  let a2 = 0
  let n = 0
  for (let y = y0 + 6; y < A; y++) {
    for (let x = 0; x < L; x++) {
      if (lum(b, x, y) > soglia) {
        n++
        if (x < x1) x1 = x
        if (x > x2) x2 = x
        if (y < a1) a1 = y
        if (y > a2) a2 = y
      }
    }
  }
  return { x1, x2, y1: a1, y2: a2, larg: x2 - x1, alt: a2 - a1, pixel: n, soglia }
}

const bf = pixel(daFilmato)
const bs = pixel(daSito)
const lf = linea(bf)
const ls = linea(bs)
const pf = pinna(bf, lf.y)
const ps = pinna(bs, ls.y)

const mostra = (n, a, b, u = '') => {
  const d = (Number(b) - Number(a)).toFixed(1)
  console.log(`  ${n.padEnd(20)} filmato ${String(a).padStart(8)}   sito ${String(b).padStart(8)}   scarto ${String(d).padStart(8)}${u}`)
}

console.log('')
console.log(`IL FOTOGRAMMA DELLA CONSEGNA — battuta del meccanismo a scorrimento ${(dove * 100).toFixed(1)}%`)
console.log('')
console.log('LA LINEA D ACQUA')
mostra('riga', lf.y, ls.y, ' px')
mostra('quanto e netta', lf.salto.toFixed(1), ls.salto.toFixed(1))
mostra('tono sopra', lf.sopra.toFixed(1), ls.sopra.toFixed(1))
mostra('tono sotto', lf.sotto.toFixed(1), ls.sotto.toFixed(1))
console.log('')
console.log('IL RIQUADRO DELLA PINNA')
mostra('sinistra', pf.x1, ps.x1, ' px')
mostra('destra', pf.x2, ps.x2, ' px')
mostra('cima', pf.y1, ps.y1, ' px')
mostra('fondo', pf.y2, ps.y2, ' px')
mostra('larghezza', pf.larg, ps.larg, ' px')
mostra('altezza', pf.alt, ps.alt, ' px')
mostra('pixel chiari', pf.pixel, ps.pixel)
console.log('')

/* affiancati, da guardare */
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', daFilmato, '-i', daSito,
  '-lavfi', 'hstack', join(cartella, 'affiancati.png')])
console.log(`  scritti: ${daFilmato}`)
console.log(`           ${daSito}`)
console.log(`           ${join(cartella, 'affiancati.png')}`)
