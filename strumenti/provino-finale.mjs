/**
 * IL PROVINO DEL FINALE — perche' il §5 dice di sceglierlo GUARDANDO.
 *
 *     PORTA_COLLAUDO=5261 node strumenti/provino-finale.mjs
 *
 * Prende quattro fotogrammi lungo l'ultimo tratto della corsa, dove la
 * traversata prende il comando dal 3D, e li scrive in `uscite/finale/`.
 *
 * NON e' un cancello e non prova niente: `docs/13` §5 chiude la scelta del
 * finale dicendo che si sceglie guardando, non ragionando, e questo strumento
 * serve a poter guardare — a me e al committente, con lo stesso fotogramma
 * invece che con due impressioni diverse. La cucitura, quella, la misura
 * `strumenti/consegna.mjs`.
 *
 * `?fermo=` inchioda la scena a un istante: senza, due corse danno due
 * fotogrammi diversi e il confronto non e' un confronto.
 */
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { apriBrowser } from './browser.mjs'

const PORTA = process.env.PORTA_COLLAUDO || 5261
const FUORI = process.env.FUORI || 'uscite/finale'
const QUOTE = (process.env.QUOTE || '0.88,0.94,0.965,0.99').split(',').map(Number)

mkdirSync(FUORI, { recursive: true })
const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
const browser = await apriBrowser({ conGpu: true })
const pg = await browser.newPage()
await pg.setViewportSize({ width: 1400, height: 900 })
await pg.goto(`http://localhost:${PORTA}/nautica/?ispeziona=1&fermo=12`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })

for (const q of QUOTE) {
  await pg.evaluate((qq) => {
    const h = document.documentElement.scrollHeight - innerHeight
    scrollTo(0, h * qq)
  }, q)
  /**
   * Due secondi e mezzo, e non e' un'attesa cieca: il ciclo di disegno di
   * questo sito si sveglia per 45 fotogrammi e si riaddormenta, e la
   * `VideoTexture` ha bisogno che il `<video>` consegni almeno un fotogramma
   * dopo il `play()`. Meno, e si fotografa un piano ancora vuoto — che si
   * leggerebbe come «la traversata non parte» invece che «non l'ho aspettata».
   */
  await pg.waitForTimeout(2500)
  const nome = `${FUORI}/q${String(q).replace('.', '')}.png`
  await pg.screenshot({ path: nome })
  /**
   * Si stampa anche la BATTUTA e lo spaccato, perche' la frazione di PAGINA non
   * e' la `p` della regia -- la dimostrazione e' una sezione dentro un
   * documento piu' lungo. Senza questi due numeri si tarano le soglie a
   * tentativi, e il primo giro l'ho perso cosi': a pagina 0,90 il filmato era
   * gia' al secondo 2,78.
   */
  const stato = await pg.evaluate(() => {
    const v = document.querySelector('video[src*="traversata"]')
    const palco = document.querySelector('#dimostrazione .palco')
    const tela = document.querySelector('#scena')
    return {
      video: v ? { pronto: v.readyState, istante: Number(v.currentTime.toFixed(2)), fermo: v.paused } : null,
      battuta: palco?.dataset.battuta ?? '?',
      spaccato: tela?.dataset.spaccato ?? '?',
      traversata: palco?.dataset.traversata ?? '?'
    }
  })
  console.log(`  ${nome}  battuta ${stato.battuta}  spaccato ${stato.spaccato}  traversata ${stato.traversata}` +
    (stato.video ? `  video a ${stato.video.istante}s` : ''))
}

await browser.close()
preview.kill()
