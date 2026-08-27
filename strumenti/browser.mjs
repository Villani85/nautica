import { chromium } from 'playwright-core'

/**
 * APRIRE UN BROWSER PER I COLLAUDI — in un posto solo.
 *
 * ─── IL GUASTO PER CUI ESISTE
 *
 * La pipeline e' rimasta rossa dopo che l'ordine degli step era gia' stato
 * corretto: il browser si installava, e i collaudi fallivano lo stesso. In
 * locale passavano tutti.
 *
 * La differenza fra le due macchine e' una sola: **il runner non ha una GPU**.
 * Da Chrome 138 il ripiego software per WebGL — SwiftShader — non si accende
 * piu' da solo: va chiesto con `--enable-unsafe-swiftshader`. Senza, il
 * contesto WebGL non nasce, la scena non parte, e il collaudo muore aspettando
 * `window.__nautica` con un messaggio che parla di timeout invece che di GPU.
 *
 * E' la forma peggiore di guasto: **l'ambiente di sviluppo lo nasconde a chi
 * lo ha creato**, e il messaggio d'errore indica la conseguenza, non la causa.
 *
 * ─── PERCHE' UN FILE SOLO
 *
 * Perche' i collaudi che aprono un browser sono quattro, e la stessa
 * correzione copiata quattro volte diverge la prima volta che uno dei quattro
 * viene toccato. E' la stessa regola per cui in questo repo esiste una sola
 * `sezioneA` e una sola tabella delle soglie.
 */

/**
 * Argomenti che servono SOLO dove non c'e' una scheda grafica. Su una macchina
 * con GPU non cambiano niente: il ripiego software non viene usato.
 */
const SENZA_GPU = [
  // il ripiego software per WebGL, che da Chrome 138 va chiesto
  '--enable-unsafe-swiftshader',
  // su runner senza /dev/shm capiente il processo grafico muore a meta'
  '--disable-dev-shm-usage'
]

/**
 * @param {object} opzioni
 * @param {boolean} opzioni.visibile  apre una finestra vera, per guardare
 * @returns {Promise<import('playwright-core').Browser>}
 */
export async function apriBrowser ({ visibile = false } = {}) {
  const headless = !visibile
  const args = SENZA_GPU

  /**
   * `CHROMIUM=1` forza quello di Playwright anche dove c'e' un Chrome di
   * sistema, cosi' una differenza fra le due macchine si puo' riprodurre
   * invece di discuterla. In CI e' l'unico disponibile.
   */
  /**
   * ─── UNA DIAGNOSI INTENZIONALE, NON VENTICINQUE RIGHE DI STACK
   *
   * Quando l'avvio fallisce, Playwright stampa una traccia lunga e la prima
   * riga — quella che dice davvero cosa manca, per esempio l'assenza di uno
   * schermo — sta in CIMA. In CI il referto arriva come annotazioni, e le
   * annotazioni le prendo dalla CODA: la riga che serve viene tagliata via.
   *
   * E' successo: la corsa diceva `browser.mjs:54` e niente altro. Quindi qui
   * l'errore si riassume da soli, con i tre fatti che distinguono i casi
   * possibili — headless, quale browser, e se c'e' uno schermo.
   */
  let primo = null
  const prova = async (opzioni) => {
    try { return await chromium.launch(opzioni) } catch (e) {
      primo = primo || String(e).split('\n')[0]
      return null
    }
  }

  if (process.env.CHROMIUM) {
    const b = await prova({ headless, args })
    if (b) return b
  } else {
    const b = await prova({ channel: 'chrome', headless, args }) ||
              await prova({ headless, args })
    if (b) return b
  }

  console.error([
    '',
    '  NESSUN BROWSER AVVIATO.',
    `    headless: ${headless}`,
    `    CHROMIUM: ${process.env.CHROMIUM ? 'si (solo quello di Playwright)' : 'no (prima il Chrome di sistema)'}`,
    `    DISPLAY:  ${process.env.DISPLAY || '(nessuno)'}`,
    `    primo errore: ${primo || '(nessuno)'}`,
    '',
    '  Se headless e false e non c e DISPLAY, la causa e quella: si sta',
    '  chiedendo una finestra a una macchina senza schermo.',
    ''
  ].join('\n'))
  process.exit(2)
}
