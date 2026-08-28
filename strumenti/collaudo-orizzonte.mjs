/**
 * IL MARE DEVE ESSERE DAVVERO DISEGNATO, E LA GIUNZIONE DEVE RESTARE A ZERO.
 *
 *     node strumenti/collaudo-orizzonte.mjs
 *
 * ─── IL DIFETTO PER CUI ESISTE, che nessuno vedeva
 *
 * Sotto la linea d'acqua c'era una campitura piatta -- misurata riga per riga
 * alla battuta della nave: 28/255, senza gradiente. Sembrava un mare fatto
 * male. Non lo era: **il mare non veniva disegnato affatto.**
 *
 * La camera stava a quota zero, cioe' DENTRO il piano dell'acqua, e un piano
 * che contiene il punto di vista proietta su una riga, non su un'area. Tutto
 * lo shader del pelo -- Fresnel, scintille, schiuma, riflesso della nave,
 * scia -- disegnava in un'area nulla. Quello che si vedeva era il fondo.
 *
 * Nessun cancello poteva accorgersene, perche' tutti quelli sull'acqua
 * misurano lo SHADER (giustamente verde: il codice era sano) o la fisica.
 * Nessuno chiedeva la cosa banale: quei pixel li' sono acqua o no?
 *
 * ─── COME LO CHIEDE
 *
 * Si SPEGNE il solo `pelo` e si contano i pixel che cambiano: quelli che
 * cambiano erano suoi. Non si passa da una tinta, e la ragione e' un errore
 * gia' fatto qui due volte di fila.
 *
 * Prima versione: pelo dipinto di rosso pieno e conta dei pixel rossi sopra
 * 140. Ha risposto 11,9% su una scena che ne ha molti di piu'. Sopra la tela
 * c'e' un velo CSS a rgba(7,26,29,.62) che porta un rosso pieno a 101, sotto
 * la soglia: lo strumento misurava il velo.
 *
 * Seconda versione: stessa vernice ma contando la DIFFERENZA dal fotogramma
 * base, che risolve il velo. Ha risposto 6,8%, cioe' peggio -- perche' il
 * `pelo` ha uno shader suo che si calcola il colore e di `m.color` non sa che
 * farsene. La vernice non arrivava proprio.
 *
 * Lezione, ed e' la stessa di sempre in questo repo: uno strumento rotto non
 * da' errore, da' un numero. Due numeri diversi, tutti e due plausibili, tutti
 * e due sbagliati, e nessuno dei due si annunciava. Spegnere un oggetto e
 * guardare cosa cambia non passa da nessun materiale e non ha niente da
 * sbagliare.
 *
 * E la seconda meta' e' l'unica idea meccanica del sito: sopra la linea la
 * carta, sotto il mare, senza un pixel di giunzione. Si leggono le righe
 * attorno alla mezzeria su una colonna libera dalla nave.
 */
import { spawn } from 'node:child_process'
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apriBrowser } from './browser.mjs'

const PORTA = process.env.PORTA_COLLAUDO || 5223
/**
 * Il minimo sta FRA i due valori misurati, non e' un gusto: col difetto la
 * fascia ha struttura 7,8, senza ha 51,4. Serve a
 * distinguere una campitura da un'immagine, non a decidere quanto e' bello.
 */
const STRUTTURA_MINIMA = 30
const BATTUTA = 0.3

const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
const browser = await apriBrowser({ conGpu: true })
const pg = await browser.newPage()
await pg.setViewportSize({ width: 1400, height: 900 })
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
await pg.evaluate((q) => {
  const h = document.documentElement.scrollHeight - window.innerHeight
  window.scrollTo(0, h * q)
}, BATTUTA)
await pg.waitForTimeout(2500)

const T = tmpdir()
const grigio = (png, filtro) => {
  const f = join(T, 'orizzonte.png')
  writeFileSync(f, png)
  return execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-vf', filtro,
    '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1e9 })
}

/* --- 1. la giunzione, PRIMA di sporcare la scena col rosso */
const scatto = await pg.screenshot()
const colonna = grigio(scatto, 'crop=60:8:60:446')   // 4 righe sopra e 4 sotto la mezzeria
const riga = (i) => [colonna[i * 60 * 3], colonna[i * 60 * 3 + 1], colonna[i * 60 * 3 + 2]]
const sopra = riga(2)
const sotto = riga(6)
const chiaroSopra = (sopra[0] + sopra[1] + sopra[2]) / 3
const chiaroSotto = (sotto[0] + sotto[1] + sotto[2]) / 3

/* --- 2. quanto pelo c'e' davvero sotto la linea */
/**
 * LA STRUTTURA TONALE della fascia subito sotto l'orizzonte. Si misura li' e
 * non piu' in basso perche' il velo CSS scende fino al 62% e schiaccerebbe la
 * misura: nei primi 160 px sotto la linea il velo e' quasi trasparente.
 */
const fascia = grigio(scatto, 'crop=1400:160:0:460')
let somma = 0, quanti = 0
const luci = []
for (let i = 0; i < fascia.length; i += 3) {
  const l = (fascia[i] + fascia[i + 1] + fascia[i + 2]) / 3
  luci.push(l); somma += l; quanti++
}
const media = somma / quanti
let vv = 0
for (const l of luci) vv += (l - media) ** 2
const struttura = Math.sqrt(vv / quanti)

await browser.close()
preview.kill()

console.log('\nIL MARE E LA GIUNZIONE\n')
console.log(`  sopra la mezzeria  rgb ${sopra.join(',')}   (luce ${chiaroSopra.toFixed(0)})`)
console.log(`  sotto la mezzeria  rgb ${sotto.join(',')}   (luce ${chiaroSotto.toFixed(0)})`)
console.log(`  fascia sotto l'orizzonte: media ${media.toFixed(1)}  struttura ${struttura.toFixed(1)}  (minimo ${STRUTTURA_MINIMA})`)

const guai = []
if (struttura < STRUTTURA_MINIMA) {
  guai.push(`la fascia sotto l'orizzonte ha struttura ${struttura.toFixed(1)}, sotto il minimo di ${STRUTTURA_MINIMA}: ` +
            "e' una campitura, non un mare. Il sospetto numero uno e' la quota della camera tornata al pelo, " +
            "dove l'acqua si vede cosi' radente da appiattirsi in un tono solo.")
}
if (chiaroSopra < chiaroSotto) {
  guai.push(`sopra la mezzeria (${chiaroSopra.toFixed(0)}) e' piu' scuro di sotto (${chiaroSotto.toFixed(0)}): ` +
            'la carta e il mare si sono scambiati di posto, cioe\' l\'orizzonte non e\' piu\' a meta\' schermo')
}
if (guai.length) { console.log(''); for (const g of guai) console.log('  ROSSO  ' + g); process.exit(1) }
console.log('\n  mare disegnato e giunzione al posto giusto')
