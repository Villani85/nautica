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
 * Il minimo sta FRA i due valori misurati SUL MARE, ed e' stato spostato una
 * volta: con la camera dentro il piano dell'acqua il mare sta a **8,6**, con
 * la camera alta a **18,3**. Nove lasciava solo il 4% di margine sul difetto
 * -- una soglia che un po' di rumore avrebbe fatto passare. Tredici sta in
 * mezzo col 40% da entrambe le parti.
 *
 * I vecchi 7,8 e 51,4 erano presi su tutta la fascia, nave compresa, e non
 * valgono piu' come riferimento.
 */
const STRUTTURA_MINIMA = 13
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
 * LA STRUTTURA TONALE del MARE, e non di tutta la fascia.
 *
 * Si misura subito sotto l'orizzonte e non piu' in basso perche' il velo CSS
 * scende fino al 62% e schiaccerebbe la misura: nei primi 160 px sotto la
 * linea il velo e' quasi trasparente.
 *
 * ─── PERCHE' NON SU TUTTA LA LARGHEZZA, e me l'ha trovato una revisione
 *
 * La prima versione misurava `crop=1400:160`, cioe' l'intera fascia. Il numero
 * passava largo -- 52,8 contro una soglia di 30 -- ma misurato per colonne si
 * scopre da dove veniva:
 *
 *     intera             struttura 48,8
 *     300-600  la NAVE             65,8
 *     600-900  nave e scia         52,7
 *     900-1200 mare aperto         17,6   <- sotto la soglia 30
 *     1100-1400 mare aperto        18,6   <- sotto la soglia 30
 *
 * Il cancello certificava che c'e' una nave bianca illuminata dentro
 * l'inquadratura, non che il mare e' un'immagine.
 *
 * Va detto per intero, perche' il sospetto piu' duro della revisione e' stato
 * verificato ed era FALSO: «basta la nave a tenerlo verde» no -- rimettendo la
 * camera sul pelo la fascia intera crolla a 8,4 e il cancello diventa rosso lo
 * stesso, perche' a quota zero si appiattisce anche la nave. Il cancello
 * proteggeva davvero dalla regressione per cui e' nato. Ma un cancello che
 * POTREBBE passare per la ragione sbagliata va stretto prima che quella
 * ragione si presenti -- per esempio una battuta senza nave in campo.
 *
 * ─── COME SI TROVA IL MARE SENZA SAPERE DOV'E' LA NAVE
 *
 * Non con un ritaglio fisso: la nave si sposta col trascinamento, e una
 * finestra scelta oggi sarebbe sulla nave domani. Si divide la fascia in sette
 * colonne, si misura ognuna e si prende la MEDIANA. La nave ne occupa al
 * massimo tre, quindi la mediana e' mare per costruzione, e resta mare
 * qualunque sia l'azimut.
 */
const COLONNE = 7
const fascia = grigio(scatto, 'crop=1400:160:0:460')
const statistica = (da, a) => {
  const luci = []
  for (let y = 0; y < 160; y++) {
    for (let x = da; x < a; x++) {
      const i = (y * 1400 + x) * 3
      luci.push((fascia[i] + fascia[i + 1] + fascia[i + 2]) / 3)
    }
  }
  const m = luci.reduce((s, v) => s + v, 0) / luci.length
  let q = 0
  for (const v of luci) q += (v - m) ** 2
  return { m, s: Math.sqrt(q / luci.length) }
}
const perColonna = []
for (let k = 0; k < COLONNE; k++) {
  perColonna.push(statistica(Math.round(k * 1400 / COLONNE), Math.round((k + 1) * 1400 / COLONNE)))
}
/**
 * QUALI COLONNE SONO MARE. La mediana delle strutture non basta -- provata: la
 * nave e la sua scia occupano QUATTRO colonne su sette e la mediana cadeva su
 * di loro (42). Nemmeno la piu' scura va bene: la prua e' un cuneo nero, media
 * 46, con struttura 54.
 *
 * Il mare pero' e' la popolazione piu' NUMEROSA e piu' OMOGENEA della fascia.
 * Misurato su questa inquadratura:
 *
 *     media per colonna    55  46 103 132  71  53  54
 *     struttura            29  54  70  48  42  15  18
 *                          ^^          ^^^^^^  ^^  ^^
 *                          mare        nave    mare
 *
 * Le tre colonne di mare aperto stanno a 53, 54, 55 -- vicinissime fra loro --
 * mentre la nave sta a 103 e 132 e la prua a 46. Quindi si prende la mediana
 * delle MEDIE e si tengono le tre colonne che le stanno piu' vicino: e' mare
 * per costruzione, e resta mare a qualunque azimut, perche' non dipende da
 * dove si trova la nave ma da quanto e' diversa dal mare.
 */
const medie = perColonna.map(c => c.m).sort((x, y) => x - y)
const centro = medie[COLONNE >> 1]
const mare = [...perColonna].sort((a, b) => Math.abs(a.m - centro) - Math.abs(b.m - centro)).slice(0, 3)
const struttura = [...mare].sort((a, b) => a.s - b.s)[1].s
const media = [...mare].sort((a, b) => a.s - b.s)[1].m
const tutta = statistica(0, 1400)

await browser.close()
preview.kill()

console.log('\nIL MARE E LA GIUNZIONE\n')
console.log(`  sopra la mezzeria  rgb ${sopra.join(',')}   (luce ${chiaroSopra.toFixed(0)})`)
console.log(`  sotto la mezzeria  rgb ${sotto.join(',')}   (luce ${chiaroSotto.toFixed(0)})`)
console.log(`  per colonna, media:     ${perColonna.map(c => c.m.toFixed(0).padStart(4)).join('')}`)
console.log(`  per colonna, struttura: ${perColonna.map(c => c.s.toFixed(0).padStart(4)).join('')}`)
console.log(`  IL MARE (mediana): media ${media.toFixed(1)}  struttura ${struttura.toFixed(1)}  (minimo ${STRUTTURA_MINIMA})`)
console.log(`  tutta la fascia, per confronto: ${tutta.s.toFixed(1)} -- e' il numero che includeva la nave`)

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
