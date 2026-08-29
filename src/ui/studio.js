/**
 * `?studio=1` — LO STRUMENTO CHE CHIUDE LE IPOTESI.
 *
 * ─── COSA MISURA, E PERCHE' PROPRIO QUESTE CINQUE COSE
 *
 * `src/ui/soglie.js` tiene due numeri provvisori che non si possono chiudere
 * ragionando: si chiudono guardando cinque persone che non conoscono il sito.
 * Ma «guardare» a occhio produce impressioni, e le impressioni in questo repo
 * non valgono. Questo modulo registra invece cinque grandezze, e ognuna
 * risponde a una domanda che il progetto ha davvero:
 *
 *   1. **quanto ci mette a fare il primo gesto efficace** -- e' l'attrito del
 *      passaggio di consegne, il numero che `docs/13` §2 dice di scrivere
 *      «dopo averlo visto succedere a una persona vera». Se e' lungo, la gente
 *      non ha capito di avere in mano il taglio;
 *   2. **quanti tentativi non producono niente** -- trascinamenti che non
 *      muovono la lama, clic nel vuoto. Sono le volte in cui ha capito che
 *      c'e' qualcosa da fare e ha sbagliato bersaglio: e' un difetto di
 *      affordance, non di comprensione, e si cura diversamente;
 *   3. **quanto resta su ogni macchina** -- distingue chi guarda da chi passa;
 *   4. **le annotazioni aperte e lasciate subito** -- e' la prova diretta
 *      contro `IPOTESI_QUIETE_MS`: se molte annotazioni compaiono e spariscono
 *      entro mezzo secondo, la soglia sta interrompendo chi si stava ancora
 *      muovendo, ed e' troppo bassa;
 *   5. **se torna al salone** -- e' l'unica domanda sul RACCONTO invece che
 *      sull'interfaccia. Chi non torna non ha chiuso il cerchio, e il finale
 *      non ha funzionato.
 *
 * ─── COSA NON FA, E VA DETTO
 *
 * Non manda niente da nessuna parte. Nessuna rete, nessun identificatore,
 * nessuna memoria fra una visita e l'altra: i dati restano nella pagina e si
 * leggono da `window.__studio` o col riassunto in console. E' uno strumento da
 * banco, da usare con una persona seduta accanto -- non analitica.
 *
 * E **non esiste se non lo si chiede**: senza `?studio=1` questo modulo non
 * viene nemmeno importato, quindi non costa un byte nel percorso critico. E'
 * la stessa regola con cui `demo.js` tiene fuori three.
 */
import { IPOTESI_QUIETE_MS, IPOTESI_RAGGIO_SISTEMA } from './soglie.js'

export function attivo () {
  return new URLSearchParams(location.search).get('studio') === '1'
}

export function creaStudio () {
  const nascita = performance.now()
  const dato = {
    nato: new Date().toISOString(),
    ipotesi: { IPOTESI_QUIETE_MS, IPOTESI_RAGGIO_SISTEMA },
    primoGestoEfficace: null,   // ms dall'ingresso
    tentativiAVuoto: 0,
    permanenza: {},             // per sistema, in ms
    annotazioni: [],            // { sistema, apertaA, durata }
    tornatoAlSalone: false,
    gesti: 0
  }

  let sistemaCorrente = null
  let entratoAlle = 0
  let annotazioneAperta = null

  /**
   * Un gesto e' EFFICACE se ha cambiato qualcosa nel mondo: la lama si e'
   * mossa, un comando e' stato toccato. Trascinare su una zona morta non lo e'.
   *
   * La distinzione non e' pedanteria: senza, il «tempo al primo gesto» misura
   * quando la persona ha toccato lo schermo, non quando ha capito. Sono due
   * numeri diversi e il secondo e' l'unico che serve.
   */
  function gesto (efficace) {
    dato.gesti++
    if (!efficace) { dato.tentativiAVuoto++; return }
    if (dato.primoGestoEfficace === null) {
      dato.primoGestoEfficace = Math.round(performance.now() - nascita)
    }
  }

  function entraIn (sistema) {
    const ora = performance.now()
    if (sistemaCorrente && sistemaCorrente !== sistema) {
      dato.permanenza[sistemaCorrente] =
        (dato.permanenza[sistemaCorrente] || 0) + Math.round(ora - entratoAlle)
    }
    if (sistemaCorrente !== sistema) { sistemaCorrente = sistema; entratoAlle = ora }
  }

  function esce () {
    if (!sistemaCorrente) return
    dato.permanenza[sistemaCorrente] =
      (dato.permanenza[sistemaCorrente] || 0) + Math.round(performance.now() - entratoAlle)
    sistemaCorrente = null
  }

  function annotazioneCompare (sistema) {
    annotazioneAperta = { sistema, apertaA: performance.now() }
  }

  function annotazioneSparisce () {
    if (!annotazioneAperta) return
    const durata = Math.round(performance.now() - annotazioneAperta.apertaA)
    dato.annotazioni.push({ sistema: annotazioneAperta.sistema, durata })
    annotazioneAperta = null
  }

  function tornatoAlSalone () { dato.tornatoAlSalone = true }

  /**
   * Il riassunto stampa anche la QUOTA di annotazioni abbandonate entro mezzo
   * secondo, perche' e' il numero che decide `IPOTESI_QUIETE_MS` e nessuno
   * dovrebbe doverselo calcolare a mano guardando una lista.
   */
  function riassunto () {
    const brevi = dato.annotazioni.filter(a => a.durata < 500).length
    const quota = dato.annotazioni.length ? brevi / dato.annotazioni.length : null
    return {
      ...dato,
      annotazioniAbbandonate: brevi,
      quotaAbbandonate: quota,
      /* Il verdetto NON e' automatico: e' una lettura suggerita, e con una
         persona sola non vale niente. Serve la quinta. */
      letturaSuggerita: quota === null
        ? 'nessuna annotazione: non si puo' + " dire niente su IPOTESI_QUIETE_MS"
        : quota > 0.4
          ? 'oltre il 40% delle annotazioni dura meno di mezzo secondo: IPOTESI_QUIETE_MS sembra TROPPO BASSA'
          : 'le annotazioni restano aperte: nessun indizio contro IPOTESI_QUIETE_MS'
    }
  }

  const api = { gesto, entraIn, esce, annotazioneCompare, annotazioneSparisce, tornatoAlSalone, riassunto, dato }
  window.__studio = api
  window.addEventListener('pagehide', () => { esce(); console.log('[studio]', riassunto()) })
  console.log('[studio] modalita\' di misura attiva. A fine sessione: __studio.riassunto()')
  return api
}
