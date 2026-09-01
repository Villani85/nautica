/**
 * COSA IL VISITATORE SCARICA DAVVERO, chiesto al browser invece che dichiarato.
 *
 * ─── PERCHE' ESISTE
 *
 * `peso.mjs` aveva un dizionario scritto a mano, `DIETRO_INTERRUTTORE`, che
 * DICHIARAVA quali modelli il visitatore non scarica -- e sottraeva quei file
 * dal totale sorvegliato. Fra di essi `traversata-world.glb`, «?mondo=1, non
 * ancora promosso».
 *
 * Era vero quando l'ho scritto. E' diventato falso NELLO STESSO LOTTO in cui ho
 * promosso il mondo, e niente ha protestato: una dichiarazione non si accorge di
 * essere smentita. Risultato: 1,67 MB contati fra «cio' che nessuno scarica»
 * mentre ogni visitatore lo scaricava. Il cancello nato per impedire al peso di
 * crescere di nascosto ha nascosto lo spostamento piu' grande della giornata.
 *
 * E' la stessa specie di `ATTESI = []` e dei tetti addormentati: un pezzo di
 * strumento che DICE invece di MISURARE. Solo che questa volta la conseguenza
 * non era cosmetica.
 *
 * ─── LA CURA NON E' AGGIORNARE LA LISTA: E' NON AVERLA
 *
 * Il modo di sapere quali risorse il visitatore prende non e' dichiararlo: e'
 * chiederlo al browser. Un file che oggi sta dietro un interruttore risultera'
 * dietro un interruttore PERCHE' IL BROWSER NON LO CHIEDE, non perche' una riga
 * lo afferma. Nessuna promozione futura potra' piu' spostare un megabyte sotto
 * la soglia di attenzione di un cancello.
 *
 * ─── COSA COSTA, e va detto
 *
 * `peso.mjs` era istantaneo e adesso apre un browser. E' il prezzo di una
 * misura al posto di un'affermazione, e chi legge il referto lo vede scritto.
 */
import { apriBrowser } from './browser.mjs'
import { anteprima } from './anteprima.mjs'

/** Quanto si aspetta fermi in cima prima di dire «questo non lo chiede». */
const FOTOGRAMMI_DI_QUIETE = 300

/**
 * Percorre il sito come un visitatore e registra QUANDO ogni risorsa viene
 * chiesta: all'apertura, restando fermi in cima, o scorrendo.
 *
 * @returns {Promise<{
 *   apertura: Set<string>, fermi: Set<string>, fine: Set<string>,
 *   byte: Map<string, number>, quando: Map<string, number>
 * }>}
 */
export async function misuraPrecarico () {
  const a = await anteprima()
  let browser
  try {
    browser = await apriBrowser()
    const pag = await browser.newPage()

    const quando = new Map()   // nome -> ms dall'avvio
    const byte = new Map()
    const t0 = Date.now()
    pag.on('request', (r) => {
      const u = r.url().split('/').pop().split('?')[0]
      if (u && !quando.has(u)) quando.set(u, Date.now() - t0)
    })
    pag.on('requestfinished', async (r) => {
      const u = r.url().split('/').pop().split('?')[0]
      if (!u) return
      try {
        const s = await r.sizes()
        byte.set(u, (byte.get(u) || 0) + (s.responseBodySize || 0))
      } catch { /* richiesta annullata: non e' un errore */ }
    })

    await pag.goto(a.indirizzo + '?ispeziona=1', { waitUntil: 'domcontentloaded' })
    await pag.waitForFunction(() => window.__nautica?.fotogrammi >= 1, null, { timeout: 60000 })
    const apertura = new Set(quando.keys())

    /* fermi in cima: e' il visitatore che apre e non fa niente */
    await pag.waitForFunction((n) => window.__nautica.fotogrammi > n, FOTOGRAMMI_DI_QUIETE,
      { timeout: 30000 }).catch(() => {})
    const fermi = new Set(quando.keys())

    /* poi tutto il racconto. Si guarda `p`, non frazioni di pagina: l'altezza
       del documento non e' una costante, e' un risultato. */
    const corsa = await pag.evaluate(() => document.documentElement.scrollHeight - innerHeight)
    for (let i = 1; i <= 40; i++) {
      await pag.evaluate((y) => scrollTo(0, y), Math.round(corsa * i / 40))
      await pag.waitForFunction(() => window.__nautica.fotogrammi > 0, null, { timeout: 2000 }).catch(() => {})
      await new Promise((r) => setTimeout(r, 120))
    }
    const fine = new Set(quando.keys())

    return { apertura, fermi, fine, byte, quando }
  } finally {
    a.ferma()
    await browser?.close()
  }
}
