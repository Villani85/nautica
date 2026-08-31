import { creaScena } from './scena/index.js'
import { sim, statoCambiato, FERMO_A } from './stato.js'
import { collegaComandi, collegaPuntoDiVista } from './ui/comandi.js'
import { creaLetture } from './ui/letture.js'
import { segnalaStato } from './ui/nudge.js'
import { segnalaStato as segnalaEsperimento } from './ui/esperimento.js'
import { segnalaStato as segnalaSuono } from './ui/suono.js'
import { creaRegia } from './regia.js'
import { creaRichiami, RICHIAMI } from './ui/richiami.js'
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
  const passo = (marca) => {
    scena.disegna(sim, marca)
    aggiornaLetture(sim.S)
    segnalaStato(sim.S)
    segnalaEsperimento(sim.S)
    segnalaSuono(sim.S)
  }

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

  /**
   * I richiami tecnici del meccanismo. Ricevono le ancore proiettate a ogni
   * fotogramma dalla scena, perche' la nave si gira col dito: vedi
   * `proiettaAncore` in `scena/index.js`.
   */
  const richiami = creaRichiami($('#richiami'))
  if (richiami && scena.collegaRichiami) {
    const alFotogramma = (punti, larg, alt) => richiami.aggiorna(punti, larg, alt)
    alFotogramma.nomi = RICHIAMI.map(r => r.nodo)
    scena.collegaRichiami(alFotogramma)
  }

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
      /**
       * ─── LA DIMOSTRAZIONE AUTOMATICA NON PARTE PIU', ED E' IL PUNTO
       *
       * Qui c'era `setTimeout(() => comandi.mostraCheSiSpegne(), 1400)`: la
       * scena spegneva lo stabilizzatore da sola per 2,6 s e lo riaccendeva,
       * per far vedere cosa succede senza.
       *
       * Aveva senso finche' il sito partiva ACCESO. Adesso parte spento
       * (`stato.js`), e il primo gesto dell'utente e' accendere: un timer che
       * tocca quell'interruttore al posto suo annullerebbe l'unica azione
       * causale della visita. Il visitatore vedrebbe la nave calmarsi senza
       * aver fatto niente, che e' esattamente il difetto che spostare lo stato
       * iniziale doveva togliere.
       *
       * La funzione resta in `comandi.js` -- e' scritta e collaudata -- ma non
       * la chiama piu' nessuno. Se un giorno il verso torna quello di prima,
       * si riattacca qui una riga.
       */
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
    /**
     * ─── LA CORSA ESCLUDE LA CODA, e la coda e' l'ultima immagine del sito
     *
     * `p` arriva a 1 quando il fondo della sezione tocca il fondo della
     * finestra -- che e' esattamente l'istante in cui il palco incollato
     * comincia a farsi spingere fuori. Cioe': l'ultima battuta finiva nello
     * stesso momento in cui il quadro cominciava a essere tagliato.
     *
     * Misurato a 1280x720: il filmato della traversata finisce al 99% dello
     * scorrimento, il palco comincia a uscire al 91%, e al ritorno alle
     * persone restavano 348 px su 720. La coppia -- che e' il soggetto di
     * tutto il sito -- si vedeva a meta'.
     *
     * Togliendo la coda dalla corsa, `p` raggiunge 1 con 120svh ancora da
     * scorrere: in quel tratto tutte le battute sono chiuse, il filmato tiene
     * il suo ultimo fotogramma, e il palco e' ancora INTERO.
     *
     * Non e' scorrimento rubato: la pagina scorre come prima, nessun gesto
     * viene intercettato (D27). E' solo che l'ultima cosa da guardare ha
     * finalmente un pezzo di pagina tutto suo.
     */
    /**
     * ─── E L'ANTEFATTO: 100svh in cima, ed e' la coda allo specchio
     *
     * DIFETTO PRESO GUARDANDO UN PROVINO, segnalato dall'utente con cinque
     * parole: «la prima immagine non e' un video». Aveva ragione, e la misura
     * gli ha dato ragione due volte:
     *
     *   la prima schermata (0-720 px) e' `#apertura`, DOM e CSS
     *   la tela sta a top=720 su una finestra da 720  ->  inVista=false
     *   differenza fra fotogrammi consecutivi: 0,00-0,05 livelli su 3 secondi
     *
     * Cioe' la prima schermata intera del sito non conteneva la scena. Tutto
     * quello che questo sito sa fare cominciava UNO SCHERMO piu' in basso, e
     * chi giudica nei primi due secondi non vedeva WebGL.
     *
     * La cura non e' spostare il racconto: e' dare alla tela un tratto di
     * pagina in cui e' gia' incollata e viva mentre il titolo le sta davanti.
     * E' esattamente la coda, dall'altro capo — e come la coda, `corsa` la
     * esclude, cosi' `p` resta 0 per tutta l'apertura e le battute cominciano
     * quando il titolo se ne va.
     *
     * `corsa` NON cambia di un pixel: 640svh - 100 - 120 faceva 420svh, e
     * 740svh - 100 - 120 - 100 fa ancora 420. Ogni finestra della regia resta
     * dov'era. E' il motivo per cui questa modifica non tocca nessun cancello
     * agganciato alla corsa.
     */
    const CODA_SVH = 1.2
    /**
     * ─── MEZZO SCHERMO DI ANTEFATTO, NON UNO INTERO
     *
     * DIFETTO SEGNALATO DAL COMMITTENTE con la barra laterale in mano: *"guarda
     * la barra laterale da qui a qui, lo scroll non fa niente"*. Misurato: su
     * 5520 px di pagina, **il 35% non muove il racconto** -- dal 3% al 14% `p`
     * resta 0,0000, dal 78% al 100% resta 1,0000.
     *
     * La coda quel diritto ce l'ha: e' dove il filmato finisce e torna la
     * coppia viva, che e' il finale chiesto. La testa no: era uno schermo
     * intero in cui si girava la rotella e la nave stava ferma.
     *
     * Mezzo schermo lascia al titolo il suo tempo -- si legge dal primo pixel,
     * non serve scorrere per vederlo -- e restituisce al racconto i 400 px che
     * gli venivano tolti. La sezione resta alta uguale: quello che la testa
     * lascia, la corsa se lo prende.
     *
     * IL NUMERO E' TUO. Quanto debba durare un titolo prima che la nave si
     * muova e' messa in scena, non misura: se 0,5 e' poco, si cambia qui.
     */
    const ANTE_SVH = 0.5
    const coda = window.innerHeight * CODA_SVH
    const ante = window.innerHeight * ANTE_SVH
    const corsa = r.height - window.innerHeight - coda - ante
    if (corsa <= 0) return
    const p = Math.min(1, Math.max(0, (-r.top - ante) / corsa))
    /* durante l'antefatto la tela si vede e il cruscotto no: dietro un titolo
       i pannelli sarebbero rumore, non informazione */
    palco.dataset.antefatto = (-r.top < ante) ? 'si' : 'no'
    regia(p)

    /**
     * --- LA CORSA DEL RACCONTO SI PUO' LEGGERE DA FUORI
     *
     * Aggiunto perche' un cancello si e' rotto, e per il motivo giusto.
     *
     * `collaudo-cinematica` campionava «al 15, 35 e 60 per cento», e quelle
     * erano frazioni dell'ALTEZZA della sezione. Ha funzionato finche' la
     * sezione era tutta racconto. Poi e' arrivata la coda -- 120svh in fondo
     * che servono a tenere l'ultimo fotogramma a piena inquadratura e che
     * racconto non sono -- e il 60% dell'altezza e' diventato il 91% della
     * corsa: il cancello misurava il meccanismo dietro il filmato e diceva
     * «il sito non segue il modello» su un sito che lo seguiva.
     *
     * E' la terza volta che questo repo paga la stessa lezione (`varco`,
     * `manopola`, e adesso `cinematica`): **nessuna soglia in frazioni di
     * pagina**. Ma finora la cura era stata locale, ogni cancello che si
     * arrangiava col proprio rettangolo. La corsa del racconto e' UNA, la
     * conosce solo questo punto, e tenerla per se' costringeva tutti a
     * ricostruirla per approssimazione.
     *
     * Costa una scrittura per evento di scorrimento e solo con `?ispeziona=1`,
     * dove `__nautica` esiste. In pagina non cambia niente.
     */
    if (window.__nautica) {
      window.__nautica.p = p
      /**
       * E anche la CORSA, in pixel. Con la sola posizione un cancello puo'
       * solo cercare il punto per bisezione -- e cercare vuol dire SALTARE
       * per tutta la pagina, venti volte, trascinandosi dietro la fisica.
       * Costava a `collaudo-cinematica` una lettura intermittente: il
       * meccanismo veniva misurato mentre smaltiva venti transitori.
       *
       * Con la corsa il punto si calcola e ci si va con UN salto, che e'
       * esattamente quello che il cancello faceva prima di essere agganciato
       * qui. La comodita' non deve cambiare cio' che si misura.
       */
      window.__nautica.corsaRacconto = corsa
      /* la cima del RACCONTO, non della sezione: da quando c'e' l'antefatto le
         due cose differiscono di uno schermo, e chi salta vuole la prima */
      window.__nautica.cimaSezione = window.scrollY + r.top + ante
    }

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
    /**
     * ─── MA `--uscita` MISURA LA SEZIONE INTERA, CODA COMPRESA
     *
     * REGRESSIONE INTRODOTTA DALLA CODA E PRESA DALLA SUITE, non da me.
     * Sottraendo la coda a `corsa` avevo spostato anche questo: `oltre`
     * diventava positivo 120svh troppo presto, e `--uscita` -- che dissolve
     * i comandi, le letture e la didascalia -- cominciava a spegnerli mentre
     * il palco era ancora tutto in vista.
     *
     * `collaudo-manopola` l'ha detto con le parole giuste: «i comandi non si
     * raggiungono nel primo piano». Erano li', ma trasparenti.
     *
     * `--uscita` ha una definizione sua, ed e' scritta qui sopra: *quanto manca
     * alla sezione per uscire*. Quella non e' cambiata con la coda -- la
     * sezione esce quando esce. Solo `p`, la corsa del RACCONTO, finisce prima.
     * Due grandezze diverse che per un commit avevano condiviso un
     * denominatore.
     */
    const corsaPiena = r.height - window.innerHeight
    const oltre = corsaPiena > 0 ? Math.max(0, -r.top - corsaPiena) : 0
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
