import { chromium } from 'playwright-core'

/**
 * APRIRE UN BROWSER PER I COLLAUDI — in un posto solo.
 *
 * --- IL GUASTO PER CUI ESISTE, E LA DIAGNOSI ERA SBAGLIATA
 *
 * Qui c'era scritto: da Chrome 138 il ripiego software per WebGL non si
 * accende piu' da solo, va chiesto con `--enable-unsafe-swiftshader`. La cura
 * funzionava e la causa era falsa -- ed e' l'errore che il commento stesso
 * denunciava tre righe piu' sotto, commesso da chi lo scriveva.
 *
 * La causa vera: `chromium.launch({ headless: true })` **non lancia
 * Chromium**. Lancia `chrome-headless-shell`, un binario separato che lo
 * stack GPU non ce l'ha proprio. Non e' un ripiego che si spegne: e' un
 * programma diverso, che non ha mai avuto una GPU da usare.
 *
 * Quindi chiedere SwiftShader era chiedere al binario sbagliato di fingere
 * meglio. E costava caro: tutte le misure di prestazione fatte finora --
 * fotogrammi al secondo, costo del vetro trasmissivo, tempi dell'acqua --
 * descrivono un rasterizzatore software, e ogni referto ha dovuto scriverci
 * accanto un asterisco.
 *
 * La cura e' una riga: `channel: 'chromium'` prende il binario completo, che
 * ha la GPU. Verificato leggendo `WEBGL_debug_renderer_info`: ANGLE su
 * Intel(R) Graphics via D3D11, invece di SwiftShader.
 *
 * --- E UNA GPU NON E' UN TELEFONO
 *
 * Va detto qui perche' e' il posto dove qualcuno andra' a cercare il numero:
 * la iGPU di questa macchina serve come **misura di regressione** -- veloce,
 * riproducibile, buona per accorgersi che qualcosa e' peggiorato. NON dice
 * cosa fa un telefono. Per quello c'e' un solo strumento onesto, ed e' un
 * telefono: il Note 20 via `adb`, gia' installato.
 *
 * Due misure con due nomi diversi, cosi' nessuna delle due finge di essere
 * l'altra.
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
  /**
   * SENZA GPU VERA, e SOLO li'. In CI il runner non ha scheda grafica e
   * `--enable-unsafe-swiftshader` e' l'unico modo di avere un contesto WebGL:
   * meglio un contesto software di nessun contesto, perche' i cancelli di
   * layout, raggiungibilita' e continuita' non hanno bisogno della GPU.
   *
   * In locale NON si passa, perche' e' esattamente il ripiego che rende finti
   * i numeri di prestazione.
   */
  '--enable-unsafe-swiftshader',
  // su runner senza /dev/shm capiente il processo grafico muore a meta'
  '--disable-dev-shm-usage'
]

/** Con GPU vera: il binario completo, non `chrome-headless-shell`. */
const CON_GPU = ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11']

/**
 * @param {object} opzioni
 * @param {boolean} opzioni.visibile  apre una finestra vera, per guardare
 * @returns {Promise<import('playwright-core').Browser>}
 */
/**
 * @param {object} opzioni
 * @param {boolean} opzioni.visibile  apre una finestra vera, per guardare
 * @param {boolean} opzioni.conGpu    chiede il binario completo e la GPU vera.
 *   Serve SOLO a chi misura prestazioni; per layout, raggiungibilita' e
 *   continuita' non cambia niente e costa avvio. Si accende anche con
 *   `CON_GPU=1` nell'ambiente, cosi' una corsa intera si puo' rifare con la
 *   GPU senza toccare i collaudi.
 */
export async function apriBrowser ({ visibile = false, conGpu = false } = {}) {
  const headless = !visibile
  const vuoleGpu = conGpu || !!process.env.CON_GPU
  const args = vuoleGpu ? CON_GPU : SENZA_GPU

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

  /**
   * `channel: 'chromium'` e' la riga che cambia tutto quando servono numeri di
   * prestazione: senza, Playwright lancia `chrome-headless-shell`, che non ha
   * lo stack GPU. Con, arriva il binario completo e WebGL gira su ANGLE.
   *
   * Chi misura prestazioni DEVE comunque leggere `WEBGL_debug_renderer_info` e
   * fallire se non compare una GPU: questa riga rende possibile la misura
   * giusta, non la garantisce.
   */
  if (vuoleGpu) {
    const b = await prova({ channel: 'chromium', headless, args }) ||
              await prova({ channel: 'chrome', headless, args })
    if (b) return b
  } else if (process.env.CHROMIUM) {
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
