import { creaScena } from './scena/index.js'
import { sim, statoCambiato, FERMO_A } from './stato.js'
import { collegaComandi, collegaPuntoDiVista } from './ui/comandi.js'
import { creaLetture } from './ui/letture.js'
import { segnalaStato } from './ui/nudge.js'
import { creaRegia } from './regia.js'
import { attritoDiApertura } from './ui/attrito.js'
import { STAZIONI, QUOTE } from './ui/atto-due.js'

const $ = (s) => document.querySelector(s)

/**
 * Tutto cio' che dipende da three sta qui dentro, e questo modulo viene
 * importato in modo dinamico solo quando la dimostrazione si avvicina allo
 * schermo. E' la ragione vera per cui il porto a moduli ES valeva la pena:
 * non il peso complessivo — misurato, il guadagno era sotto il chilobyte —
 * ma il fatto che 144 KB gzipped di motore 3D escono dal percorso critico e
 * non stanno piu' fra l'utente e il primo disegno.
 */
export function avviaDimostrazione () {
  const sezione = document.querySelector('#dimostrazione')
  const contenitore = $('#scena')
  const scena = creaScena(contenitore)

  if (!scena) {
    $('#ripiego').hidden = false
    contenitore.hidden = true
    return
  }

  const preferenza = window.matchMedia('(prefers-reduced-motion: reduce)')
  /**
   * LA SIMULAZIONE ARRIVA DA `stato.js`, e non si crea piu' qui.
   *
   * DIFETTO PRESO GUARDANDO, appena il capitolo del salone e' esistito: si
   * accendeva l'interruttore nella dimostrazione, si scendeva al salone, e la
   * stanza continuava a rollare. Due capitoli, due simulazioni, due traversate
   * diverse — e il sito che si smentiva da solo a due schermate di distanza.
   *
   * E' la bugia peggiore possibile qui, perche' l'argomento del sito e' proprio
   * che sopra e sotto la linea sono **lo stesso integratore**. L'avevo scritto
   * nel commento di `stato.js` e poi non avevo collegato il file.
   *
   * (`?ridotto=1` vive li' adesso, insieme alla preferenza di sistema: e' una
   * proprieta' della visita, non di un capitolo.)
   */

  const aggiornaLetture = creaLetture({
    rollio: $('#v-rollio'),
    picco: $('#v-picco'),
    riduzione: $('#v-riduzione'),
    dRiduzione: $('#d-riduzione'),
    carico: $('#v-carico'),
    recupero: $('#v-recupero'),
    fCarico: $('#b-carico .riempi'),
    fRecupero: $('#b-recupero .riempi'),
    velocita: $('#v-velocita'),
    pinna: $('#v-pinna'),
    nudo: $('#v-nudo'),
    rollio2: $('#v-rollio2')
  })

  let inCorso = false
  /* la stessa mandata alimenta i nudge di STATO: il suggerimento del
     giroscopio deve arrivare quando la catena causale lo merita, non dopo
     cinque secondi in cui nessuno tocca niente */
  const passo = (marca) => { scena.disegna(sim, marca); aggiornaLetture(sim.S); segnalaStato(sim.S) }

  function avviaCiclo () {
    // il ciclo parte SEMPRE: con movimento ridotto la scena e' piu' piccola,
    // non ferma. Un ciclo spento ferma anche il video del salone.
    if (inCorso) return
    inCorso = true
    scena.render.setAnimationLoop(passo)
    scena.accendi?.()
  }
  function fermaCiclo () {
    inCorso = false
    scena.render.setAnimationLoop(null)
    /**
     * FERMARE IL CICLO DI DISEGNO NON FERMA I DECODIFICATORI. Sono due cose
     * diverse, e la seconda costa batteria e temperatura su un telefono anche
     * quando la sezione e' uscita di campo da un pezzo. Segnalato da una
     * revisione, e misurabile: due sorgenti 1280x720.
     */
    scena.spegni?.()
  }
  /** Con movimento ridotto si disegna solo quando qualcosa cambia. */
  function sveglia () {
    let n = 0
    const uno = (marca) => { passo(marca); if (++n < 45) requestAnimationFrame(uno) }
    requestAnimationFrame(uno)
  }
  const risveglia = () => avviaCiclo()

  /**
   * ─── IL PALCO E' QUELLO DELLA DIMOSTRAZIONE, NON IL PRIMO CHE CAPITA
   *
   * Qui c'era `document.querySelector('.palco')`. Nel documento il salone viene
   * PRIMA della dimostrazione, e il suo contenitore porta `class="palco
   * palco--salone"`: il selettore restituiva quello. Da allora la regia della
   * dimostrazione scriveva `data-battuta` sul palco del salone.
   *
   * Il guasto non si vedeva come un errore, si vedeva come una cosa che non
   * succedeva mai. Tutte le regole `·palco[data-battuta="taglio"] .comandi`,
   * `[data-battuta="emerge"] .pannello--letture` e compagnia puntano a
   * discendenti di un palco che quei discendenti non li ha: nessun selettore
   * corrispondeva, nessun errore veniva sollevato, e i pannelli restavano
   * accesi in ogni battuta — compresa quella in cui coprono il meccanismo che
   * il taglio serve a mostrare.
   *
   * Trovato interrogando il DOM invece di leggere il codice: elencando i due
   * `.palco` e chiedendo a ciascuno la propria `data-battuta`, uno rispondeva
   * «calma» e l'altro niente. Il codice, letto, sembrava giusto.
   */
  const palco = sezione.querySelector('.palco')
  /* La regia nasce prima dei comandi, quindi la dimostrazione automatica si
     raggiunge attraverso un contenitore invece che passandola: e' il prezzo
     dell'ordine di costruzione, e costa una riga. */
  let comandi = null
  const vivo = $('#battuta-vivo')

  const regia = creaRegia({
    scena, sim, palco,
    didascalia: $('#battuta'),
    alCambio: risveglia,
    /**
     * ENTRANDO NEL MECCANISMO succedono due cose, e sono la risposta a
     * «non si capisce cosa deve fare l'utente»:
     *   1. compare la riga viva, che dice cosa sta succedendo ADESSO -- angolo
     *      della pinna e rollio che la nave avrebbe senza;
     *   2. il sito SPEGNE da solo per due secondi e mezzo, cosi' la differenza
     *      si vede invece di doverla immaginare. Poi riaccende e lascia
     *      l'interruttore a chi guarda.
     */
    allaBattuta: (id) => {
      const acceso = id === 'meccanismo'
      if (vivo) {
        vivo.dataset.visibile = acceso ? 'si' : 'no'
        // il paragrafo si accorcia quando la riga viva prende il suo posto
        vivo.closest('.battuta')?.setAttribute('data-vivo', acceso ? 'si' : 'no')
      }
      /* `?senzaDimostra=1` la spegne: serve ai cancelli che misurano i salti
         al clic, dove una dimostrazione che parte da sola e' rumore.
         E la spegne anche `?fermo`, che e' la stessa esigenza portata fino in
         fondo: una scena inchiodata a un istante non puo' avere un cronometro
         che le cambia l'interruttore sotto. E' il pezzo che mancava -- avevo
         fermato la simulazione e l'orologio delle onde, e due fotogrammi
         restavano diversi perche' in uno lo stabilizzatore era acceso e
         nell'altro no. */
      if (acceso && FERMO_A === null && !new URLSearchParams(location.search).has('senzaDimostra')) {
        setTimeout(() => comandi?.mostraCheSiSpegne?.(), 1400)
      }
    }
  })

  comandi = collegaComandi({
    contenitore: $('#mare'), toggle: $('#stab'), propulsione: $('#propulsione'),
    giroscopio: $('#giroscopio'), sim,
    // La regia va rivalutata anche quando cambia lo STATO, non solo la
    // posizione: accendendo il sistema da fermi il testo restava indietro.
    // Avvisa anche gli altri capitoli: il salone dorme mentre sei qui, e al
    // risveglio deve trovare lo stato giusto invece di quello di prima.
    alCambio: () => { risveglia(); regia?.rivaluta?.(); statoCambiato() }
  })

  /**
   * ─── QUI LA LAMA CAMBIA PADRONE, e l'aggancio e' una riga sola
   *
   * `src/ui/tocco.js` emette `nautica:cella` a ogni scatto e dichiarava nel
   * proprio referto che «oggi non lo ascolta nessuno». Adesso lo ascolta la
   * scena: la stazione muove il piano di taglio lungo lo scafo, la quota
   * dice a che altezza si sta guardando.
   *
   * L'ascolto sta sul DOCUMENTO e non sul modulo del tocco, di proposito: il
   * giorno in cui l'esplorazione arrivera' anche da desktop -- con la lama
   * trascinata invece che con lo swipe -- bastera' che emetta lo stesso evento,
   * e qui non si tocca niente. E' il contratto che tocco.js aveva gia' scelto
   * bene: «altrimenti il desktop finirebbe per dipendere dal telefono invece
   * che dalla mappa».
   */
  document.addEventListener('nautica:cella', (e) => {
    const st = STAZIONI[e.detail.is]
    const qt = QUOTE[e.detail.iq]
    if (!st || !qt) return
    scena.vaiACella?.(st.x, qt.y)
    risveglia()
  })
  /* Uscendo dall'esplorazione lo scorrimento si riprende il taglio: il padrone
     cambia una volta sola per VOLTA, non una volta per sempre. */
  document.addEventListener('nautica:esplorazione', (e) => {
    if (e.detail?.aperta === false) { scena.esciDallEsplorazione?.(); risveglia() }
  })

  collegaPuntoDiVista({
    tela: scena.tela, ruota: scena.ruota, suggerimento: $('#nota')
  })

  /**
   * IL PRIMO MOVIMENTO LO FA IL SITO, e lo fa quando la nave entra in campo --
   * non al caricamento, che sarebbe una dimostrazione data a nessuno. Una volta
   * sola per visita: ripeterla diventerebbe un tic.
   */
  let giaMostrato = false
  const dimostraLaRotazione = () => {
    if (giaMostrato) return
    giaMostrato = true
    collegaPuntoDiVista.mostra?.()
  }

  preferenza.addEventListener('change', (e) => {
    sim.S.ridotto = e.matches
    sim.azzeraPicchi()
    /**
     * NON si ferma piu' niente. Qui c'era `if (e.matches) { fermaCiclo();
     * sveglia() }`, cioe' la vecchia scorciatoia: attivare la preferenza a
     * sito aperto lo faceva diventare una fotografia -- e con lui si fermava
     * il VIDEO del salone, che vive dentro quel ciclo e che nessuno aveva
     * deciso di spegnere.
     *
     * Adesso il ciclo gira sempre e a cambiare e' l'ampiezza, dentro
     * `simulazione.js`. Il ramo resta per un motivo solo: assicurarsi che il
     * ciclo sia acceso anche se la preferenza cambia mentre la sezione e'
     * ferma.
     */
    avviaCiclo()
    statoCambiato()   // vale per tutti i capitoli, non solo per questo
  })

  window.addEventListener('resize', () => { scena.ridimensiona(); if (sim.S.ridotto) sveglia() })
  scena.ridimensiona()

  /**
   * Si disegna solo mentre la dimostrazione e' sullo schermo. Fuori non si
   * disegna affatto: e' meta' della batteria di un telefono, e non costa
   * niente in leggibilita'.
   */
  const osservatore = new IntersectionObserver((voci) => {
    for (const v of voci) {
      if (v.isIntersecting) { risveglia(); dimostraLaRotazione() } else fermaCiclo()
    }
  }, { threshold: 0.05 })
  osservatore.observe(sezione)

  /**
   * MOMENTO 3 — il taglio entra nello scafo, guidato dallo scorrimento.
   *
   * La sezione e' alta piu' di uno schermo e il palco resta fisso: la corsa
   * disponibile e' `altezza sezione - altezza finestra`. La prima meta' resta
   * dedicata alla dimostrazione; nella seconda il piano di sezione entra.
   *
   * Lo scorrimento NON viene intercettato: nessun gesto rubato, nessuna
   * sezione incatenata, la rotellina e la barra restano quelle del browser.
   * E' l'utente a decidere quanto aprire, e puo' tornare indietro.
   *
   * La posizione si legge a ogni fotogramma dal `getBoundingClientRect` vero,
   * non da una soglia in pixel calcolata una volta: con uno scorrimento
   * inerziale la pagina si sposta anche DOPO il calcolo, e una soglia fissa
   * sbaglia proprio mentre l'utente guarda.
   */
  /**
   * La posizione si legge dal rect VERO a ogni evento, non da una soglia in
   * pixel calcolata una volta: con lo scorrimento inerziale la pagina si
   * sposta anche DOPO il calcolo, e una soglia fissa sbaglia proprio mentre
   * l'utente guarda.
   *
   * Lo scorrimento non viene intercettato: nessun gesto rubato, nessuna
   * sezione incatenata, e si puo' tornare indietro (D27).
   */
  function leggiScorrimento () {
    const r = sezione.getBoundingClientRect()
    const corsa = r.height - window.innerHeight
    if (corsa <= 0) return
    const p = Math.min(1, Math.max(0, -r.top / corsa))
    regia(p)

    /**
     * ─── IL CAPITOLO NON SE NE VA CON I PANNELLI ACCESI
     *
     * Oltre `p = 1` il palco si stacca e sale per un altro schermo. In quel
     * tratto le letture, i comandi e la didascalia salivano **accese** e
     * finivano sotto l'intestazione, che e' fissa e non ha fondo: due testi
     * sovrapposti, illeggibili tutti e due. Si vedeva nel provino a cavallo
     * del bordo — «fraction of the boat» stampato sopra «TECHNICAL STUDY».
     *
     * `--uscita` va da 0 (ancora incollato) a 1 (uno schermo oltre). Non e'
     * una soglia in pixel: e' quanto manca alla sezione per uscire, misurata
     * sul rect vero come tutto il resto qui.
     */
    const oltre = corsa > 0 ? Math.max(0, -r.top - corsa) : 0
    palco.style.setProperty('--uscita',
      Math.min(1, oltre / (window.innerHeight * 0.45)).toFixed(3))

    if (sim.S.ridotto) sveglia()
  }

  addEventListener('scroll', leggiScorrimento, { passive: true })

  /**
   * L'apertura chiede mezzo secondo prima di cedere, e dopo tre offre di
   * scendere. Sta qui e non dentro la regia perche' e' una proprieta' della
   * VISITA -- succede una volta -- non della battuta, che si puo' riattraversare.
   */
  attritoDiApertura({
    invito: document.getElementById('invito-scorri'),
    ridotto: sim.S.ridotto
  })
  addEventListener('resize', leggiScorrimento)
  leggiScorrimento()

  risveglia()
}
