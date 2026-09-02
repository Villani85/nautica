/**
 * QUANTO COSTA LA GIUNZIONE FRA LA TRAVERSATA E IL SALONE, la prima volta.
 *
 *     node strumenti/misura-giunzione.mjs
 *     LARGO=390 ALTO=844 node strumenti/misura-giunzione.mjs
 *
 * ─── PERCHE' ESISTE
 *
 * `collaudo-fluidita` misura la scorrevolezza di tutto il racconto e, arrivato
 * al punto piu' caro, stampa: «traversata->salone NON MISURABILE (la corsa non
 * attraversa p = 1,0319)». Cioe' il cancello dichiara di non guardare proprio
 * la giunzione -- ed e' li' che il sito si ferma.
 *
 * Misurato il 2 settembre 2026, scorrendo dalla fine della traversata dentro la
 * coda, a 1440x900 e a 390x844:
 *
 *     primo passaggio    5478 ms nel fotogramma a pCoda 0,0074
 *     secondo passaggio    24 ms
 *     terzo passaggio      23 ms
 *
 * Cioe' e' un costo che si paga UNA VOLTA -- e a pagarlo e' il visitatore, che
 * la giunzione la attraversa una volta sola, sul climax del sito.
 *
 * ─── DA COSA VIENE, misurato e non supposto
 *
 * Profilo della CPU su quel fotogramma: 5.725 ms campionati, di cui 5.370 in
 * `getProgramInfoLog` -- e, spegnendo i controlli degli shader, gli stessi
 * 5.495 in `getProgramParameter`. Sono letture SINCRONE che aspettano il link
 * di programmi nuovi: il tempo e' la compilazione, non la lettura.
 *
 * Chiesto al renderer quali programmi nascano li' (`render.info.programs`,
 * confrontando le chiavi prima e dopo): DICIANNOVE programmi nuovi, tutti
 * `physical,STANDARD` -- i materiali della nave.
 *
 * E il perche' e' il conteggio delle luci, che in three fa parte della chiave
 * del programma. Contate le luci che la camera vede:
 *
 *     prima della traversata   2 direzionali, 1 emisferica, 0 punti
 *     meta' traversata         9 punti, 1 ambiente (la nave non si disegna:
 *                              `soloDentro` spegne lo strato di fuori)
 *     inizio della coda        2 direzionali, 1 emisferica, 9 punti,
 *                              1 ambiente, 2 ombre di punto
 *
 * La nave torna in quadro con una configurazione di luci che non ha mai visto,
 * e si ricompila tutta.
 *
 * ─── COSA E' STATO PROVATO E NON HA FUNZIONATO
 *
 * · `compileAsync` della lastra del salone: 5203 ms. Non era lei -- disegnarla
 *   a mano per sei fotogrammi con opacita' 0,002 costa 18 ms.
 * · `compileAsync` della NAVE durante la traversata: 5832 ms.
 * · lo stesso, riaccendendo lo strato zero sulla camera per la durata della
 *   compilazione (cosi' le luci raccolte sono quelle della giunzione): 5925 ms.
 * · `debug.checkShaderErrors = false`: il tempo si sposta da
 *   `getProgramInfoLog` a `getProgramParameter`, 5491 ms.
 * · tenere il mondo acceso per tutta la coda (cosi' le luci non spariscono):
 *   4966 ms.
 * · misura di controllo, `?mondo=0` (il mondo non si accende mai): 1737 ms.
 *
 * ─── COME E' STATO CHIUSO (per tre quarti), il 2 settembre
 *
 *     5.340 ms   com'era
 *     2.100 ms   le luci del mondo nascono con la scena, spente, e stanno
 *                NELLA SCENA invece che dentro il gruppo: il conteggio e'
 *                quello definitivo dal primo fotogramma e non cambia mai
 *     1.660 ms   spente di serie le ombre delle plafoniere, che non si vedono
 *                (6 livelli contro 6 di rumore) e alla giunzione costano i
 *                programmi `distance` della nave
 *     1.440 ms   `compileAsync` del MONDO appena e' pronto: le stanze fuori dal
 *                tronco di visione non si disegnano, quindi i programmi del
 *                guscio del salone nascevano proprio alla giunzione
 *     1.377 ms   e con lui la nave, compilata con lo strato zero riacceso per
 *                un istante, cosi' le luci raccolte sono quelle della giunzione
 *
 * GLI ULTIMI DUE PASSI SONO STATI TOLTI, e vale la pena dire perche': in CI la
 * GPU e' software (SwiftShader), e compilare tutti quei programmi in un colpo
 * ha fatto scadere lo screenshot di `collaudo-finale-vivo` -- trenta secondi.
 * Un anticipo che su una macchina veloce guadagna 280 ms e su una lenta blocca
 * il fotogramma non e' un anticipo: e' un rischio spostato addosso a chi ha la
 * macchina peggiore. Il valore di serie resta 1.660 ms.
 *
 * Restano sei programmi. Chi riprende: sono `physical` e `basic` che nascono
 * quando lo strato di fuori torna acceso, e la strada non provata e' disegnare
 * la nave per un fotogramma mentre il mondo e' acceso, invece di compilarla in
 * anticipo.
 *
 * ─── E GLI ALTRI DUE BLOCCHI DEL RACCONTO, misurati e NON chiusi
 *
 * Scorrendo la pagina intera la prima volta (200 passi, 1440x900):
 *
 *     1.148 ms a p 0,099   quattro programmi nuovi. Le maglie che compaiono li'
 *                          sono `coperta` x3 e `acciaio` x10: pezzi della nave
 *                          che diventano visibili quando emerge.
 *       642 ms a p 0,936   l'ingresso della traversata, quattro programmi.
 *
 * Provate due strade, tutte e due SENZA effetto e quindi tolte dal codice:
 * compilare l'intera scena a orologio (1,5 s e 6 s dal primo fotogramma), e
 * compilarla ogni volta che il numero di maglie cresce -- cioe' quando un
 * modello arriva. In tutti e due i casi restavano esattamente quei quattro
 * programmi: dipendono da qualcosa che cambia in quell'istante, non dalla
 * presenza dell'oggetto nella scena. Chi riprende parta da li'.
 */
import { anteprima } from './anteprima.mjs'
import { apriBrowser } from './browser.mjs'

const LARGO = Number(process.env.LARGO || 1440)
const ALTO = Number(process.env.ALTO || 900)

const servito = await anteprima()
const browser = await apriBrowser({ conGpu: true })
const pg = await (await browser.newContext({ viewport: { width: LARGO, height: ALTO } })).newPage()
await pg.goto(servito.indirizzo + '?ispeziona=1' + (process.env.PARAMETRI ? '&' + process.env.PARAMETRI : ''), { waitUntil: 'load' })
await pg.waitForFunction(() => window.__nautica?.mondo()?.ancorato === true, null, { timeout: 120000 })
await pg.waitForTimeout(3000)

const esito = await pg.evaluate(async () => {
  const n = window.__nautica
  const r = n.render
  const chiavi = () => new Set((r.info.programs || []).map(p => p.cacheKey))
  const giro = async () => {
    const da = n.cimaSezione + n.corsaRacconto * 0.97
    const a = n.cimaSezione + n.corsaRacconto + n.coda * 0.1
    let peggio = 0
    let dove = null
    let nuovi = 0
    let prima = performance.now()
    let chiaviPrima = chiavi()
    for (let i = 0; i <= 40; i++) {
      scrollTo(0, Math.round(da + (a - da) * (i / 40)))
      await new Promise(res => requestAnimationFrame(res))
      const ora = performance.now()
      const dt = ora - prima
      prima = ora
      const adesso = chiavi()
      if (dt > peggio) {
        peggio = dt
        dove = +n.pCoda.toFixed(4)
        nuovi = [...adesso].filter(k => !chiaviPrima.has(k)).length
      }
      chiaviPrima = adesso
    }
    return { ms: Math.round(peggio), pCoda: dove, programmiNuovi: nuovi }
  }
  const torna = async () => {
    scrollTo(0, Math.round(n.cimaSezione + n.corsaRacconto * 0.5))
    await new Promise(res => setTimeout(res, 1500))
  }
  const uno = await giro(); await torna()
  const due = await giro(); await torna()
  const tre = await giro()
  return { uno, due, tre, programmi: (r.info.programs || []).length }
})

console.log(`\n  LA GIUNZIONE, ${LARGO}x${ALTO}`)
console.log('  ' + '-'.repeat(58))
for (const [nome, g] of [['primo passaggio', esito.uno], ['secondo', esito.due], ['terzo', esito.tre]]) {
  console.log(`  ${nome.padEnd(16)} ${String(g.ms).padStart(5)} ms  a pCoda ${g.pCoda}` +
              (g.programmiNuovi ? `  (${g.programmiNuovi} programmi nuovi)` : ''))
}
console.log(`\n  programmi in tutto: ${esito.programmi}`)
console.log('  Il primo passaggio e quello del visitatore. Vedi la testa di questo file.\n')

await browser.close()
servito.ferma()
