/**
 * QUANTI BYTE ARRIVANO DAVVERO PRIMA CHE SI VEDA QUALCOSA.
 *
 * ─── PERCHE'
 *
 * Promuovendo il mondo si scambia `traversata.mp4` (1,59 MB) con
 * `traversata-world.glb` (1,67 MB), e sulla carta e' +0,08 MB. Una revisione ha
 * fatto notare che quel conto vale solo se i due carichi si somigliano: un mp4
 * puo' arrivare a pezzi e in ritardo, un GLB di norma arriva intero prima di
 * poter mostrare qualcosa. Se il filmato oggi e' pigro, lo scambio e' peggiore
 * di +0,08; se e' precaricato, e' quasi neutro.
 *
 * Nel codice `traversata.js:60` dice `v.preload = 'auto'`. Ma `auto` e' un
 * SUGGERIMENTO: il browser decide, e su rete lenta o su telefono spesso scarica
 * solo l'inizio. Quindi la riga di codice non risponde alla domanda. Risponde
 * il browser, e solo misurando.
 *
 * ─── COSA MISURA, E COSA NO
 *
 * ─── E LA DOMANDA GIUSTA NON E' «PRIMA DEL PRIMO FOTOGRAMMA»
 *
 * Ci ho sbattuto contro due volte. Misurando le RISPOSTE vedevo i GLB e non il
 * JS; misurando le RICHIESTE FINITE vedevo il JS e non i GLB. Nessuno dei due
 * metri era rotto: il primo fotogramma viene disegnato PRIMA che i modelli
 * arrivino, quindi al primo fotogramma i GLB hanno risposto ma non sono finiti.
 * Due istanti diversi, due elenchi diversi, e io che credevo di misurare una
 * cosa sola.
 *
 * Cio' che decide lo scambio mp4 <-> GLB non e' un istante, e' QUANDO una
 * risorsa viene CHIESTA. Se il filmato non viene chiesto finche' il visitatore
 * non si avvicina alla traversata, non pesa sull'apertura -- e allora il mondo,
 * per essere uno scambio onesto, deve essere chiesto nello stesso momento.
 *
 * Quindi si guardano tre momenti, e per ognuno si dice cosa e' stato CHIESTO:
 *   1. al primo fotogramma disegnato
 *   2. dopo cinque secondi fermi in cima, senza toccare niente
 *   3. alla fine del racconto, avendolo percorso tutto
 *
 * NON misura una rete lenta ne' un telefono: gira sulla connessione di questa
 * macchina, dove tutto arriva presto. Quindi il numero e' un LIMITE SUPERIORE
 * di cio' che il browser sceglie di prendere quando puo' permetterselo -- utile
 * per dire se il filmato e' pigro (arriverebbero pochi byte anche potendo) o
 * avido (arrivano tutti). Su 3G il confronto puo' cambiare, e questo strumento
 * non lo sa.
 */
import { apriBrowser } from './browser.mjs'
import { anteprima } from './anteprima.mjs'

const a = await anteprima()
let browser
try {
  browser = await apriBrowser()
  const pag = await browser.newPage()

  const chiesto = new Map()          // nome -> ms dall'avvio
  const byte = new Map()
  const t0 = Date.now()
  pag.on('request', (r) => {
    const u = r.url().split('/').pop().split('?')[0]
    if (u && !chiesto.has(u)) chiesto.set(u, Date.now() - t0)
  })
  pag.on('requestfinished', async (r) => {
    const u = r.url().split('/').pop().split('?')[0]
    if (!u) return
    try { const s = await r.sizes(); byte.set(u, (byte.get(u) || 0) + (s.responseBodySize || 0)) } catch { /* annullata */ }
  })

  await pag.goto(a.indirizzo + '?ispeziona=1', { waitUntil: 'domcontentloaded' })
  await pag.waitForFunction(() => window.__nautica?.fotogrammi >= 1, null, { timeout: 60000 })
  const alPrimoFotogramma = new Set(chiesto.keys())

  /* fermi in cima: e' il visitatore che apre e non fa niente */
  await pag.waitForFunction(() => window.__nautica.fotogrammi > 300, null, { timeout: 30000 }).catch(() => {})
  const dopoLAttesa = new Set(chiesto.keys())

  /* poi si percorre tutto il racconto, senza frazioni di pagina: si guarda `p` */
  const corsa = await pag.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  for (let i = 1; i <= 40; i++) {
    await pag.evaluate((y) => scrollTo(0, y), Math.round(corsa * i / 40))
    await pag.waitForFunction(() => window.__nautica.fotogrammi > 0, null, { timeout: 2000 }).catch(() => {})
    await new Promise((r) => setTimeout(r, 120))
  }
  const allaFine = new Set(chiesto.keys())

  const pesanti = [...chiesto.keys()]
    .filter((u) => /\.(mp4|glb|webp|png|woff2)$/.test(u))
    .sort((x, y) => chiesto.get(x) - chiesto.get(y))

  const quando = (u) => alPrimoFotogramma.has(u) ? 'APERTURA'
    : dopoLAttesa.has(u) ? 'fermi in cima' : 'scorrendo'

  console.log('')
  console.log('QUANDO OGNI RISORSA PESANTE VIENE CHIESTA')
  console.log('')
  for (const u of pesanti) {
    console.log(`  ${u.padEnd(30)} ${quando(u).padEnd(14)} ` +
                `+${String(chiesto.get(u)).padStart(6)} ms   ${((byte.get(u) || 0) / 1e6).toFixed(3)} MB`)
  }

  const somma = (insieme) => [...insieme]
    .filter((u) => /\.(mp4|glb|webp|png|woff2|js|css)$/.test(u))
    .reduce((s, u) => s + (byte.get(u) || 0), 0)

  console.log('')
  console.log(`  chiesto all APERTURA        ${(somma(alPrimoFotogramma) / 1e6).toFixed(2)} MB`)
  console.log(`  ...piu fermi in cima        ${(somma(dopoLAttesa) / 1e6).toFixed(2)} MB`)
  console.log(`  ...piu tutto il racconto    ${(somma(allaFine) / 1e6).toFixed(2)} MB`)

  const tv = 'traversata.mp4'
  console.log('')
  if (!allaFine.has(tv)) console.log(`  ${tv}: MAI CHIESTO, nemmeno percorrendo tutto.`)
  else console.log(`  ${tv}: chiesto ${quando(tv)}, +${chiesto.get(tv)} ms, ` +
                   `${((byte.get(tv) || 0) / 1e6).toFixed(2)} MB scaricati.`)
  console.log('')
  console.log('  LETTO IL 1 SETTEMBRE 2026: tutti e cinque i filmati vengono chiesti')
  console.log('  ALL APERTURA e arrivano interi, comprese le quattro pose del salone che')
  console.log('  servono molto piu avanti. Percorrere tutto il racconto non chiede un byte')
  console.log('  in piu. Quindi lo scambio traversata.mp4 -> traversata-world.glb e')
  console.log('  davvero quasi neutro (+0,08 MB), purche il mondo si carichi li dove oggi')
  console.log('  si carica il filmato.')
  console.log('')
  console.log('  MA IL NUMERO CHE CONTA E UN ALTRO: sono 6,16 MB chiesti prima che il')
  console.log('  visitatore faccia qualcosa. Non e questo strumento a decidere se vada')
  console.log('  bene: e un numero sul tavolo.')
} finally {
  a.ferma()
  await browser?.close()
}
