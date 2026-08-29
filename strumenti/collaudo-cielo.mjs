/**
 * QUANTA STRUTTURA HA IL CIELO, RIGA PER RIGA — e soprattutto DOVE.
 *
 *     node strumenti/collaudo-cielo.mjs
 *
 * ─── LA DOMANDA, e perche' non e' quella di prima
 *
 * Il cielo ha gia' avuto due metri, e tutti e due rispondevano a una domanda
 * diversa da quella posta:
 *
 *   1. lo scarto tipo di COLONNA (0,23 -> 8,4). Dice «c'e' un gradiente»,
 *      non «c'e' un cielo»: una rampa liscia lo supera senza avere niente;
 *   2. l'R2 della retta sulla colonna (0,854 -> 0,827). Dice «la colonna non
 *      e' piu' una retta», ed e' vero -- ma e' ancora uniformita' VERTICALE.
 *
 * La domanda vera e' orizzontale e locale: **a quota fissa, il cielo cambia da
 * sinistra a destra?** E cambia *li' dove serve*, cioe' nella striscia che
 * incornicia la nave, non solo nel terzo alto del fotogramma.
 *
 * Una revisione esterna ha misurato che le cinque bande aggiunte per questo
 * cambiano lo scarto orizzontale di **esattamente 0,00 da y=0,35 in giu'**, su
 * desktop e su telefono. Questo strumento e' il modo di verificarlo e di non
 * ripetere l'errore: misura la riga, non la colonna, e la misura a molte quote.
 *
 * ─── COME ISOLA IL CIELO SENZA FALSIFICARLO
 *
 * Si nasconde ogni FIGLIO di `body`, non il suo sfondo: `body::before` e
 * `body::after` non sono figli e sopravvivono. Restano esattamente gli strati
 * CSS del cielo, sulla pagina VERA -- stesso foglio, stesso viewport, stessa
 * composizione. Non e' una ricostruzione in una pagina finta, che sarebbe da
 * verificare a sua volta.
 *
 * E si misura a scorrimento zero, dove nella striscia non c'e' ancora la nave:
 * misurare lo scarto orizzontale con lo scafo dentro darebbe un numero grande
 * che parla della nave, non del cielo. E' la stessa trappola di sempre qui --
 * un numero vero che risponde a un'altra domanda.
 */
import { spawn } from 'node:child_process'
import { execFileSync } from 'node:child_process'
import { writeFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apriBrowser } from './browser.mjs'

const PORTA = process.env.PORTA_COLLAUDO || 5231
const QUOTE = [0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.38, 0.40, 0.42, 0.43]
const VISTE = [
  { nome: 'DESKTOP 1440x900', w: 1440, h: 900 },
  { nome: 'MOBILE   390x844', w: 390, h: 844 }
]

const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
const browser = await apriBrowser({})
const pg = await browser.newPage()

/**
 * ─── IL FILE TEMPORANEO HA UN NOME UNICO, e non e' pedanteria
 *
 * Era `orizzonte.png` / `cielo.png` fissi dentro la cartella temporanea di
 * sistema. Basta che due corse si sovrappongano -- e stanotte ne giravano
 * quattro, fra collaudi e misure -- perche' una scriva mentre l'altra legge:
 * ffmpeg riceve mezzo PNG e muore con «Invalid PNG signature», il cancello
 * esce 1, e sembra un difetto del sito.
 *
 * E' successo davvero: la suite e' uscita rossa su un file corrotto, non su
 * una regressione, e rieseguita subito dopo era verde. Un cancello che fallisce
 * per una ragione sua insegna a rieseguire finche' passa, che e' il modo piu'
 * rapido di rendere inutile una suite.
 *
 * Nome col pid e col millisecondo -- e si cancella dopo. Il resto degli
 * strumenti qui lo faceva gia': queste due erano rimaste indietro.
 */
const T = tmpdir()
const UNICO = `cielo-${process.pid}-${Date.now()}.png`

/**
 * ─── SI DECODIFICA UNA VOLTA SOLA, non una volta per riga
 *
 * Qui c'era un `ffmpeg` per ogni quota: dieci righe per due viewport, VENTI
 * processi, ognuno che decodifica l'intero PNG per tenerne una riga. Funziona
 * finche' la macchina e' scarica; stanotte, con Blender e quattro Chromium in
 * giro, Windows ha smesso di concedere processi e la chiamata e' morta con
 * `spawnSync ffmpeg UNKNOWN` (errno -4094). Il cancello e' uscito rosso senza
 * che il sito avesse niente che non andasse.
 *
 * Un cancello che dipende dal carico della macchina non misura il sito: e' la
 * stessa regola per cui in questo repo nessuna soglia e' in millisecondi. Qui
 * la causa era piu' banale -- consumavo venti processi per leggere venti righe.
 *
 * Adesso: una decodifica per viewport, e le righe si leggono dal buffer.
 */
function decodifica (png, w, h) {
  const f = join(T, UNICO)
  writeFileSync(f, png)
  return execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-vf', `scale=${w}:${h}`,
    '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1e9 })
}
/** una riga di pixel, in luminanza, dal buffer gia' decodificato */
function riga (b, y, w) {
  const l = []
  for (let i = 0; i < w; i++) {
    const o = (y * w + i) * 3
    l.push(0.2126 * b[o] + 0.7152 * b[o + 1] + 0.0722 * b[o + 2])
  }
  return l
}
const scarto = (v) => {
  const m = v.reduce((a, b) => a + b, 0) / v.length
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length)
}

const esiti = {}
for (const v of VISTE) {
  await pg.setViewportSize({ width: v.w, height: v.h })
  await pg.goto(`http://localhost:${PORTA}/?ispeziona=1`, { waitUntil: 'load' })
  await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
  await pg.evaluate(() => window.scrollTo(0, 0))
  /* solo gli strati CSS del cielo: i pseudo-elementi di body non sono figli */
  await pg.addStyleTag({ content: 'body > *{visibility:hidden !important}' })
  await pg.waitForTimeout(400)
  const scatto = decodifica(await pg.screenshot(), v.w, v.h)

  console.log('')
  console.log(v.nome)
  console.log('   y      scarto orizzontale')
  esiti[v.nome] = {}
  for (const q of QUOTE) {
    const s = scarto(riga(scatto, Math.round(q * v.h), v.w))
    esiti[v.nome][q] = s
    const dove = q >= 0.35 ? '   <- la striscia dietro la nave' : ''
    console.log(`  ${q.toFixed(2)}    ${s.toFixed(2)}${dove}`)
  }
}

await browser.close()
preview.kill()
try { unlinkSync(join(T, UNICO)) } catch { /* gia' sparito */ }

/**
 * IL CANCELLO, e la prima versione misurava la cosa sbagliata.
 *
 * La striscia 0,35-0,43 e' quella che incornicia la nave: sopra la maschera
 * (opaca fino al 44%) e sotto le bande alte. Se li' il cielo e' piatto, la
 * nave sta su un fondo senza direzione -- il difetto riportato da due
 * revisioni indipendenti, e misurato qui: 1,17 su desktop, 1,07 sul telefono.
 *
 * --- PERCHE' LA MEDIA E NON IL MINIMO
 *
 * Avevo scritto `Math.min` su tutte le righe: ogni scanline sopra la soglia.
 * E' un cancello che spinge verso un progetto PEGGIORE. Le righe estreme della
 * striscia devono essere le piu' deboli -- quella in alto perche' confina con
 * le bande alte, quella in basso perche' e' a due punti dalla cucitura, e
 * questo sito ha una regola piu' importante delle altre: niente colore che si
 * avvicini alla giunzione. Un minimo su TUTTE le righe mi avrebbe fatto
 * spingere contrasto verso il 44%, cioe' contro l'invariante che il sito
 * protegge da sempre. Un cancello puo' fare questo: sembrare severo e chiedere
 * la cosa sbagliata.
 *
 * Quello che si vuole e' che la striscia NON SIA PIATTA nel suo insieme. Media
 * sulle righe, quindi, e la soglia sta fra il difetto misurato (1,1) e quello
 * che le quattro bande producono: il doppio del difetto.
 */
const MINIMO = 2.2
let rotto = false
for (const [nome, righe] of Object.entries(esiti)) {
  const basse = QUOTE.filter((q) => q >= 0.35)
  const media = basse.reduce((a, q) => a + righe[q], 0) / basse.length
  console.log(`
${nome}: la striscia dietro la nave ha struttura media ${media.toFixed(2)} (minimo ${MINIMO})`)
  if (media < MINIMO) rotto = true
}
if (rotto) {
  console.error('\n  IL CIELO E PIATTO DIETRO LA NAVE.')
  console.error('  Le bande dipingono nel terzo alto e non arrivano alla striscia')
  console.error('  che incornicia lo scafo. Servono bande centrate fra 0,36 e 0,42.')
  process.exit(1)
}
console.log('\nCIELO ok')
