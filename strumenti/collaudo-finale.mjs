/**
 * L'ULTIMA IMMAGINE DEL SITO SONO LE DUE PERSONE, E DEVE AVERE UN QUADRO INTERO.
 *
 * ─── IL DIFETTO CHE QUESTO CANCELLO IMPEDISCE DI FAR TORNARE
 *
 * Il filmato della traversata non si dissolve quando finisce: resta sul suo
 * ultimo fotogramma, che e' la coppia. E' una decisione scritta in
 * `traversata.js`, ed e' giusta. Ma quel fotogramma veniva **tagliato mentre lo
 * teneva**.
 *
 * `p`, la corsa del capitolo, arrivava a 1 esattamente quando il fondo della
 * sezione tocca il fondo della finestra -- cioe' nello stesso istante in cui il
 * palco incollato comincia a farsi spingere fuori. L'ultima battuta finiva nel
 * momento preciso in cui il quadro cominciava a stringersi.
 *
 * Misurato a 1280x720, prima della cura: il filmato copre tutto da y = 3581 e
 * il palco resta intero fino a y = 3741. **160 pixel**, cioe' 0,22 schermate.
 * Sul cronometro: il filmato finiva al 99% dello scorrimento e il palco
 * cominciava a uscire al 91%, lasciando 348 px su 720 al ritorno alle persone.
 * Una revisione esterna l'aveva detta cosi': *«delle persone restano quasi solo
 * le gambe»*.
 *
 * Con la coda -- 120svh in fondo alla sezione, esclusi dalla corsa che genera
 * `p` -- il tratto passa a **1030 px, 1,43 schermate**. Sei volte e mezza.
 *
 * ─── COSA QUESTO CANCELLO NON PROMETTE
 *
 * Non promette i «sei-otto secondi» che la revisione chiedeva. **Nessuna
 * lunghezza di pagina compra secondi di orologio**: chi scorre veloce supera
 * qualunque coda, e l'unico modo di garantire un tempo sarebbe fermare lo
 * scorrimento, che questo repo si e' vietato (D27) e che sarebbe peggio del
 * difetto.
 *
 * Promette la cosa misurabile: che chi si ferma li' -- e al climax ci si ferma
 * -- guardi un quadro intero invece di una striscia. Un cancello che dichiara
 * di garantire il tempo mentirebbe, e mentirebbe con un numero verde.
 *
 * La soglia e' in SCHERMATE e non in pixel apposta: in pixel varierebbe con la
 * finestra e il cancello direbbe cose diverse su due macchine identiche.
 */
import { apriBrowser } from './browser.mjs'
import { spawn } from 'node:child_process'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'

/* misurato 1,43 schermate: il minimo sta un terzo sotto */
const SCHERMATE_MINIME = 1.0
const PORTA = process.env.PORTA_COLLAUDO || 5221
/* se sulla porta risponde gia' qualcuno, questo referto puo' essere
   la misura del `dist` di un altro processo: si dice, non si tace */
await avvisaSePortaAltrui(PORTA)

const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
for (let i = 0; i < 60; i++) {
  try { await fetch(`http://localhost:${PORTA}/`, { redirect: 'manual' }); break } catch {}
  await new Promise(r => setTimeout(r, 500))
}

const browser = await apriBrowser({ conGpu: true })
const pg = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })
await pg.waitForTimeout(2500)

/**
 * Si salta da una quota all'altra senza far girare il filmato: qui interessa
 * la GEOMETRIA della pagina, non il tempo del video. Misurare il tratto
 * lasciando scorrere il filmato darebbe un numero che dipende da quanto e'
 * lento il runner, ed e' la cosa che questo repo si e' ripromesso di non fare.
 */
const r = await pg.evaluate(async () => {
  const H = document.documentElement.scrollHeight - innerHeight
  const palco = document.querySelector('.palco')
  if (!palco) return { rotto: 'nessun .palco in pagina' }
  const fermati = async (y) => {
    scrollTo(0, y)
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  }

  let intero = null
  for (let y = Math.round(H * 0.6); y <= H; y += 10) {
    await fermati(y)
    const b = palco.getBoundingClientRect()
    const vis = Math.max(0, Math.min(b.bottom, innerHeight) - Math.max(b.top, 0))
    if (vis >= innerHeight - 1) intero = y; else break
  }

  /* la copertura si legge dalla REGIA, non dal `<video>`: un video che non e'
     ancora partito non dice niente sulla geometria della pagina */
  let inizio = null
  for (let y = Math.round(H * 0.6); y <= H; y += 10) {
    await fermati(y)
    if ((window.__nautica.coperturaTraversata() ?? 0) > 0.99) { inizio = y; break }
  }
  return { H, intero, inizio, vh: innerHeight }
})

await browser.close(); preview.kill()

console.log('il finale: le due persone hanno un quadro intero?')
if (r.rotto) { console.error('  ROTTO  ' + r.rotto); process.exit(2) }
if (r.inizio === null) {
  console.error('  ROTTO  la traversata non copre mai del tutto: o non si carica, ' +
                'o `coperturaTraversata` non e piu esposta su __nautica')
  process.exit(2)
}
if (r.intero === null) {
  console.error('  ROTTO  il palco non e mai intero oltre il 60% della corsa')
  process.exit(2)
}

const tratto = r.intero - r.inizio
const schermate = tratto / r.vh
console.log(`  il filmato copre del tutto da   y = ${r.inizio}`)
console.log(`  il palco resta intero fino a    y = ${r.intero}`)
console.log(`  tratto a piena inquadratura     ${tratto} px = ${schermate.toFixed(2)} schermate ` +
            `(minimo ${SCHERMATE_MINIME})`)

if (schermate < SCHERMATE_MINIME) {
  console.error('\nCOLLAUDO FINALE FALLITO')
  console.error(`  - l'ultimo fotogramma -- le due persone -- ha solo ${schermate.toFixed(2)} schermate ` +
                `di quadro intero, sotto il minimo di ${SCHERMATE_MINIME}. ` +
                'Chi si ferma sul finale vede una striscia, non una stanza.')
  console.error('  - la coda vive in `.atto--demo` (altezza) e in `CODA_SVH` dentro `src/demo.js`: ' +
                'le due devono crescere insieme, perche una coda tolta dalla corsa ma non aggiunta ' +
                'alla sezione accorcia il capitolo invece di allungarne la fine.')
  process.exit(1)
}
console.log('\n  il finale ha il suo quadro.')
process.exit(0)
