/**
 * QUANTO VALE L'OMBRA DELLE PLAFONIERE, in livelli su 255.
 *
 *     node strumenti/misura-ombra.mjs
 *     S=0.20 PARAMETRI=portata=1.44 node strumenti/misura-ombra.mjs
 *
 * Scatta lo STESSO fotogramma della traversata due volte -- ombre accese e
 * `?ombre=0` -- e dice di quanto cambia. Non decide niente: la luce della
 * traversata e' messa in scena, e questo serve perche' la si scelga su numeri.
 *
 * ─── PERCHE' NON SI MISURA LA MEDIA DEL QUADRO
 *
 * La prima versione faceva la media di TUTTO il fotogramma e stampava «0» per
 * ogni configurazione: un'ombra vera che copre il 5% del quadro con trenta
 * livelli di scarto fa una media di 1,5 su 255, e la media arrotondata a intero
 * la mangia. Ho passato un'ora a cercare un difetto nelle ombre perche' lo
 * strumento diceva «zero» dove la risposta era «poco»: uno strumento che non
 * distingue «niente» da «poco» non misura, tranquillizza.
 *
 * Adesso il fotogramma si riduce a una griglia 32x32 di MEDIE LOCALI e si
 * guarda il blocco che cambia di piu': un'ombra e' una cosa locale, e si misura
 * dove sta.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'

const FUORI = process.env.FUORI || 'uscite/ombra'
const S = process.env.S || '0.20'
const EXTRA = process.env.PARAMETRI ? process.env.PARAMETRI + '&' : ''
mkdirSync(FUORI, { recursive: true })

function scatta (dove, parametri) {
  execFileSync(process.execPath, ['strumenti/scatta-traversata.mjs'], {
    env: { ...process.env, S, FUORI: dove, PARAMETRI: parametri },
    stdio: 'ignore'
  })
  return `${dove}/s-${S}.jpg`
}

const conOmbre = scatta(`${FUORI}/con`, `${EXTRA}ombre=2048`)
const senzaOmbre = scatta(`${FUORI}/senza`, `${EXTRA}ombre=0`)
/**
 * E IL RUMORE SI MISURA, o il numero non vuol dire niente: due scatti con la
 * STESSA configurazione non tornano identici -- il JPEG, e la scena che vive.
 * Senza questa terza presa, «4 livelli» sembra un'ombra e puo' essere il fondo.
 */
const conOmbreDiNuovo = scatta(`${FUORI}/con-2`, `${EXTRA}ombre=2048`)

function scarto (a, b) {
  const griglia = execFileSync('ffmpeg', [
    '-loglevel', 'error', '-i', a, '-i', b,
    '-lavfi', 'blend=all_mode=difference,format=gray,scale=32:32:flags=area',
    '-f', 'rawvideo', '-'
  ], { encoding: 'buffer' })
  let somma = 0
  let massimo = 0
  for (const v of griglia) { somma += v; if (v > massimo) massimo = v }
  return { massimo, media: somma / griglia.length }
}

const ombra = scarto(conOmbre, senzaOmbre)
const rumore = scarto(conOmbre, conOmbreDiNuovo)
const { massimo, media } = ombra

console.log(`  s = ${S}${EXTRA ? ' · ' + EXTRA.replace(/&$/, '') : ''}`)
console.log(`  l'ombra cambia al massimo ${massimo} livelli su 255 in un blocco,`)
console.log(`  ${media.toFixed(2)} in media sul quadro`)
console.log(`  fondo di rumore, due scatti identici: ${rumore.massimo} al massimo, ${rumore.media.toFixed(2)} in media`)
console.log(massimo > rumore.massimo * 2
  ? "  -> l'ombra si distingue dal rumore"
  : "  -> l'ombra NON si distingue dal rumore: a questa luce non si vede")
console.log(`  (i due fotogrammi restano in ${FUORI})`)
