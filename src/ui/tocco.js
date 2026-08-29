/**
 * L'ATTO DUE COL DITO — dodici celle, uno scatto per volta.
 *
 * ═════════════════════════════════════════════════════════════════════════
 * ─── LA REGOLA CHE GOVERNA TUTTO IL FILE
 * ═════════════════════════════════════════════════════════════════════════
 *
 * `docs/13` §8: «ogni cosa che si puo' scoprire da desktop si deve poter
 * scoprire da telefono. Non con lo stesso gesto -- con lo stesso esito.»
 *
 * La parita' e' di RISULTATO. Da qui discende tutto quello che segue, e in
 * particolare la cosa che sembra una rinuncia e non lo e': **su telefono non
 * c'e' una camera libera.** Il documento lo sospettava e chiedeva di provarlo
 * invece di assumerlo, quindi va detto cosa e' stato provato e cosa no.
 *
 * ─── COSA E' STATO MISURATO PRIMA DI SCRIVERE UNA RIGA
 *
 * L'impaginato del telefono, alle tre finestre del collaudo, alla battuta del
 * meccanismo. Non e' un dettaglio di contorno: e' il vincolo che ha deciso la
 * forma di questa interfaccia.
 *
 *   360x640 -- linea a 320; `.patto` 344-357; `.pila` 356-410; `.nota` a 406;
 *              `.comandi` 441-624.
 *   390x844 -- linea a 422; `.patto` 446-459; `.pila` 458-614; `.comandi`
 *              645-828.
 *   768x1024 -- linea a 512; `.pila` 548-794; `.comandi` 825-1008.
 *
 * Sul telefono piccolo, fra la dichiarazione e i comandi restano **ottantatre
 * pixel liberi**. Ottantatre. Non e' un'opinione sull'affollamento: e' la
 * ragione per cui un'esplorazione non poteva essere AGGIUNTA all'impaginato
 * esistente, e per cui questa e' una MODALITA' -- si entra, la meta' bassa
 * diventa lo strumento, si esce e il sito e' quello di prima.
 *
 * A modalita' chiusa questo modulo non cambia un pixel della pagina, ed e' il
 * motivo per cui tutti i cancelli esistenti continuano a misurare cio' che
 * misuravano.
 *
 * ─── PERCHE' A SCATTI, E NON UNA CAMERA CON DUE DITA
 *
 * Tre ragioni, in ordine di peso.
 *
 * 1. **Nessun controllo a due dita e' ammesso** (vincolo dichiarato). Una
 *    camera libera su tattile ne chiede due per lo zoom, e chi ha una mano
 *    sola resta fuori.
 * 2. **La tela ha gia' un padrone.** `comandi.js` mette il trascinamento della
 *    scena sulla rotazione del punto di vista, e con `SPOSTAMENTO_VERO` ci ha
 *    gia' pagato un difetto. Mettere un secondo significato sullo stesso nodo
 *    vorrebbe dire due padroni per un nodo -- che e' la regola di casa scritta
 *    in D29 e violarla qui costerebbe un difetto intermittente, non un errore.
 *    Quindi il gesto sta su una superficie SUA.
 * 3. **Dodici posizioni note si percorrono; un continuo si perde.** Su un
 *    telefono non c'e' un puntatore che passa sopra le cose: se la posizione e'
 *    libera, l'unico modo di sapere dove si e' e' guardare, e cio' che si
 *    guarda su 360 px e' piccolo. Una posizione discreta si puo' ANNUNCIARE, e
 *    un annuncio arriva anche a chi non vede lo schermo.
 *
 * **Cosa NON e' stato provato, e va detto:** che gli scatti siano piu'
 * leggibili di un movimento libero non e' misurato qui. Non e' misurabile da
 * questa parte: si guarda addosso a cinque persone che non conoscono il sito,
 * ed e' la stessa strada con cui si chiudono le ipotesi di `soglie.js`.
 * `?studio=1` registra gia' cio' che serve -- tempo al primo gesto efficace e
 * tentativi a vuoto -- e questo modulo lo alimenta.
 *
 * ─── COSA QUESTO MODULO NON FA ANCORA, DETTO QUI E NON NASCOSTO
 *
 * **Non muove la lama, perche' la lama come strumento non esiste.** `docs/13`
 * §7 la elenca fra le cose che mancano, insieme alla navigazione a due assi del
 * desktop: oggi il taglio e' una conseguenza dello scorrimento e non c'e' una
 * funzione a cui chiedere «vai alla stazione tre, quota macchine».
 *
 * Quindi la posizione qui e' vera, dichiarata, annunciata e navigabile -- e la
 * scena non la segue. Inventare un movimento qualsiasi per non lasciare la
 * sensazione di un comando morto sarebbe stata la bugia peggiore possibile in
 * questo repo, quindi non c'e'. C'e' invece l'evento `nautica:cella` sul
 * documento: quando la lama diventera' uno strumento, chi la scrive si iscrive
 * li' e il telefono la guida senza che questa interfaccia cambi di una riga.
 *
 * **Oggi nessuno ascolta quell'evento.** E' scritto anche nel referto del
 * collaudo, perche' un lettore ha diritto di sapere quale meta' e' finita.
 */
import './tocco.css'
import { STAZIONI, QUOTE, SISTEMI, sistemiIn, nomeCella } from './atto-due.js'
import {
  IPOTESI_QUIETE_MS, IPOTESI_BLOCCO_ASSE_PX,
  IPOTESI_PASSO_CELLA_PX, IPOTESI_GESTO_VERO_PX
} from './soglie.js'
import { creaSchema } from './schema.js'

/**
 * ─── LE SOGLIE ESCONO ANCHE VERSO L'ESTERNO, e non e' una comodita'
 *
 * Il cancello della copertura deve trascinare un dito abbastanza da produrre
 * uno scatto. Se il numero lo scrivesse lui, il giorno in cui il passo cambia
 * il cancello mentirebbe -- verde su un'interfaccia che non risponde piu'.
 * Leggendolo da qui, misura sempre la cosa giusta e **non sostiene mai che il
 * numero sia quello giusto**: e' un'ipotesi, e resta tale.
 */
const soglie = { IPOTESI_QUIETE_MS, IPOTESI_BLOCCO_ASSE_PX, IPOTESI_PASSO_CELLA_PX, IPOTESI_GESTO_VERO_PX }

/**
 * @param {object} o
 * @param {HTMLElement} o.contenitore  il riquadro vuoto gia' in pagina
 * @param {HTMLElement} [o.entrata]    il pulsante che ha aperto, per restituirgli il fuoco
 */
export function creaEsplorazione ({ contenitore, entrata }) {
  if (!contenitore) return null

  let is = 0
  let iq = 0
  let aperta = false
  let quiete = 0

  /* ─────────────────────────────────────────────────────────────────────────
     IL DOCUMENTO, costruito una volta sola
     ───────────────────────────────────────────────────────────────────────── */

  contenitore.innerHTML = ''
  contenitore.classList.add('espl')

  /**
   * IL CAMPO E' UN GRUPPO CON UN FUOCO SUO.
   *
   * `role="group"` e non `application`: `application` spegne i comandi rapidi
   * del lettore di schermo, e qui non serve -- dentro ci sono pulsanti veri,
   * che funzionano gia'. Le frecce sono un'AGGIUNTA al percorso normale, non
   * un percorso alternativo che lo sostituisce.
   */
  const campo = document.createElement('div')
  campo.className = 'espl__campo'
  campo.setAttribute('role', 'group')
  campo.tabIndex = 0
  campo.setAttribute('aria-label',
    'Position below deck. Swipe sideways to move along the ship, up and down to change level. ' +
    'Arrow keys do the same.')

  const { svg, muovi } = creaSchema()

  const passo = (verso, asse, etichetta) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'espl__passo'
    /* Il selettore su cui si appoggia il cancello: cambiarlo e' cambiare un
       contratto, non un dettaglio di stile. */
    b.dataset.passo = `${asse}:${verso}`
    b.setAttribute('aria-label', etichetta)
    /**
     * ─── LA FRECCIA E' UN TRATTO CENTRATO, NON DUE BORDI RUOTATI
     *
     * SINTOMO: in una schermata di prova la freccia in su e quella in giu',
     * affiancate, stavano a dieci pixel di quota diversa.
     * CAUSA: erano un quadrato con due soli bordi, ruotato. L'inchiostro di
     * una L non ha il baricentro al centro del suo riquadro, e due rotazioni a
     * 180 gradi lo mandano da parti opposte: il riquadro era centrato, il
     * segno no. Qui invece il tratto e' simmetrico dentro il `viewBox` (x da 3
     * a 6,5, y da 1,5 a 8,5), quindi ruotarlo di novanta gradi in qualunque
     * verso lo lascia dov'e'.
     */
    b.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true" focusable="false">' +
                  '<polyline points="6.5,1.5 3,5 6.5,8.5"/></svg>'
    b.addEventListener('click', () => {
      const fatto = asse === 'stazione' ? vaA(is + verso, iq, 'passo') : vaA(is, iq + verso, 'passo')
      /* Un pulsante che non ha mosso niente E' un tentativo a vuoto, e va
         contato: e' meta' del segnale con cui si chiudono le ipotesi. */
      window.__studio?.gesto?.(fatto)
    })
    return b
  }

  /**
   * ─── PERCHE' I PULSANTI DI ESTREMITA' NON SONO `disabled`
   *
   * `disabled` toglie il nodo dall'ordine di tabulazione: arrivato a prua, il
   * fuoco che stava sul pulsante «forward» **sparisce** e riparte da capo. E'
   * il difetto classico dei carousel accessibili, e si vede solo provando da
   * tastiera. `aria-disabled` dice la stessa cosa a chi ascolta e lascia il
   * fuoco dov'e'; il clic viene ignorato da `vaA`, che gia' limita gli indici.
   */
  const prima = passo(-1, 'stazione', 'Move forward, towards the bow')
  const dopo = passo(1, 'stazione', 'Move aft, towards the stern')
  const su = passo(-1, 'quota', 'Up one level')
  const giu = passo(1, 'quota', 'Down one level')

  const riga = document.createElement('div')
  riga.className = 'espl__riga'
  riga.append(prima, svg, dopo)

  /**
   * DOVE SEI, a voce. `role="status"` implica gia' `aria-live="polite"`:
   * scriverli entrambi e' la ripetizione che fa annunciare due volte su alcuni
   * lettori.
   *
   * ─── E STA SULLA RIGA DELLE QUOTE, dopo un difetto visto in una schermata
   *
   * Prima erano due cose: un'etichetta «BILGE» accanto alle frecce e, sotto,
   * la riga «MIDSHIP, BILGE — STATION 3 OF 4, LEVEL 3». Su 360x640 dicevano la
   * stessa parola a otto pixel di distanza e costavano una riga intera in un
   * riquadro che ne ha quattro. Adesso e' una lettura sola, accanto ai comandi
   * che la cambiano.
   *
   * Il dettaglio numerico resta, ma solo per chi ascolta: `.via` e' la classe
   * che questo sito usa gia' per il testo che sta nell'albero di
   * accessibilita' e non nel quadro. Chi vede lo schema conta le tacche; chi
   * non lo vede ha bisogno del numero, ed e' l'unico che ne ha bisogno.
   */
  const dove = document.createElement('p')
  dove.className = 'espl__dove'
  dove.setAttribute('role', 'status')
  const doveVisibile = document.createElement('span')
  const doveDetto = document.createElement('span')
  doveDetto.className = 'via'
  dove.append(doveVisibile, doveDetto)

  const rigaQuota = document.createElement('div')
  rigaQuota.className = 'espl__riga espl__riga--quota'
  rigaQuota.append(su, giu, dove)

  campo.append(riga, rigaQuota)

  /**
   * L'ANNOTAZIONE COMPARE PER QUIETE, MAI PER CLIC.
   *
   * `docs/13` §9 ha un cancello che dice esattamente questo: «esce con errore
   * se esiste un gestore di clic sui sistemi». Qui non c'e', e non e' una
   * dimenticanza da riempire dopo: i pulsanti di questo riquadro cambiano
   * POSIZIONE, e il solo modo di far comparire un'annotazione e' smettere di
   * muoversi. E' la stessa promessa del desktop mantenuta con un altro gesto.
   */
  const nota = document.createElement('p')
  nota.className = 'espl__nota'
  nota.setAttribute('role', 'status')
  /**
   * ─── IL TESTO STA IN UN FIGLIO, E NON E' UN VEZZO DI MARCATURA
   *
   * SINTOMO: con `-webkit-line-clamp: 2` i puntini comparivano alla seconda
   * riga e la TERZA si vedeva lo stesso, mezza tagliata. Cioe' il taglio
   * dichiarato e il taglio vero cadevano in due posti diversi.
   * CAUSA: il riquadro e' dentro una colonna flessibile e prende l'altezza
   * dallo spazio avanzato, non dal numero di righe. `-webkit-line-clamp` mette
   * l'ellissi dove gli si dice, ma dentro un riquadro piu' alto le righe
   * successive vengono comunque disegnate.
   * COME L'HO ISOLATA: da una schermata di prova a 360x640 -- si legge
   * «...propulsion...» e sotto una riga in piu' che i puntini avevano gia'
   * dichiarato assente.
   * La cura: chi si stira (il paragrafo) e chi si taglia (il figlio) sono due
   * elementi diversi.
   */
  const notaTesto = document.createElement('span')
  nota.appendChild(notaTesto)

  /**
   * IL COMANDO DELLA COSA CHE STAI GUARDANDO -- e non ne possiede lo stato.
   *
   * Inoltra il clic al nodo canonico (`#stab`, `#propulsione`) e rilegge da
   * quello `aria-pressed`. La ragione sta scritta per esteso in `comandi.js`:
   * lo stato iniziale dell'interruttore e' vissuto per un po' in due posti --
   * il markup e `stato.js` -- e diceva il contrario di quello che faceva. Un
   * secondo interruttore con uno stato suo ripeterebbe quel difetto, e su
   * telefono nessuno se ne accorgerebbe perche' i due non si vedono insieme.
   */
  const comando = document.createElement('button')
  comando.type = 'button'
  comando.className = 'espl__comando'
  comando.hidden = true
  let canonico = null
  const spiaStato = new MutationObserver(() => rileggiCanonico())
  comando.addEventListener('click', () => {
    if (!canonico) return
    canonico.click()
    window.__studio?.gesto?.(true)
  })

  const esci = document.createElement('button')
  esci.type = 'button'
  esci.className = 'espl__esci'
  esci.textContent = 'Close'
  esci.setAttribute('aria-label', 'Leave the below-deck exploration')
  esci.addEventListener('click', () => chiudi())

  /**
   * ─── `dove` NON SI RIELENCA QUI, e la prima stesura lo faceva
   *
   * SINTOMO: la riga della posizione compariva SOTTO le frecce delle quote
   * invece che accanto, e il riquadro perdeva ventidue pixel -- abbastanza da
   * tagliare l'annotazione a meta' della seconda riga su 360x640.
   * CAUSA: `append` non copia, SPOSTA. Nominando `dove` sia dentro la riga
   * delle quote sia in questo elenco, il secondo `append` lo tirava fuori
   * dalla riga. COME L'HO ISOLATA: da una schermata di prova -- il testo era
   * al posto sbagliato e il difetto non si vedeva leggendo il codice, perche'
   * entrambe le righe sono corrette da sole.
   */
  contenitore.append(campo, nota, comando, esci)

  /* ─────────────────────────────────────────────────────────────────────────
     LO STATO — una cella, e chi la legge
     ───────────────────────────────────────────────────────────────────────── */

  function rileggiCanonico () {
    if (!canonico) return
    const acceso = canonico.getAttribute('aria-pressed')
    if (acceso === null) comando.removeAttribute('aria-pressed')
    else comando.setAttribute('aria-pressed', acceso)
  }

  function aggiornaComando () {
    const sist = sistemiIn(is, iq).find(s => s.comando && document.querySelector(s.comando))
    spiaStato.disconnect()
    canonico = sist ? document.querySelector(sist.comando) : null
    if (!canonico) {
      comando.hidden = true
      comando.removeAttribute('data-comanda')
      return
    }
    comando.hidden = false
    comando.dataset.comanda = sist.comando
    comando.innerHTML = '<span class="espl__spia" aria-hidden="true"></span>'
    comando.append(document.createTextNode(sist.nome))
    rileggiCanonico()
    spiaStato.observe(canonico, { attributes: true, attributeFilter: ['aria-pressed'] })
  }

  /**
   * L'annotazione arriva DOPO la quiete, e sparisce al primo movimento.
   *
   * Il ritardo non e' un'attesa prima che il comando risponda -- quella
   * `soglie.js` la vieta esplicitamente, e la posizione infatti cambia subito.
   * E' il tempo che separa «sto passando di qui» da «mi sono fermato a
   * guardare», e vale 400 ms per ipotesi, non per misura.
   */
  function fermaQuiete () {
    clearTimeout(quiete)
    if (notaTesto.textContent) notaTesto.textContent = ''
  }

  function armaQuiete () {
    clearTimeout(quiete)
    quiete = setTimeout(() => {
      const sist = sistemiIn(is, iq)
      if (!sist.length) return
      notaTesto.textContent = sist.map(s => `${s.nome}. ${s.annotazione}`).join(' ')
      window.__studio?.annotazioneCompare?.(sist[0].id)
    }, IPOTESI_QUIETE_MS)
  }

  /**
   * @param {number} nuovaS
   * @param {number} nuovaQ
   * @param {'dito'|'passo'|'tastiera'|'avvio'} da
   * @returns {boolean} vero se la cella e' cambiata davvero
   */
  function vaA (nuovaS, nuovaQ, da) {
    const s = Math.max(0, Math.min(STAZIONI.length - 1, nuovaS))
    const q = Math.max(0, Math.min(QUOTE.length - 1, nuovaQ))
    const cambiata = (s !== is || q !== iq)
    if (!cambiata && da !== 'avvio') return false

    if (notaTesto.textContent) window.__studio?.annotazioneSparisce?.()
    is = s; iq = q
    fermaQuiete()

    muovi(is, iq)
    doveVisibile.textContent = nomeCella(is, iq)
    doveDetto.textContent = ` — station ${is + 1} of ${STAZIONI.length}, level ${iq + 1} of ${QUOTE.length}`

    /* Lo stato esce nel DOM, non in una variabile globale: cosi' lo legge il
       foglio di stile, lo legge un lettore di schermo attraverso gli attributi
       dei pulsanti, e lo legge il cancello senza dover interrogare
       JavaScript. */
    contenitore.dataset.stazione = STAZIONI[is].id
    contenitore.dataset.quota = QUOTE[iq].id
    contenitore.dataset.cella = `${is},${iq}`

    prima.setAttribute('aria-disabled', String(is === 0))
    dopo.setAttribute('aria-disabled', String(is === STAZIONI.length - 1))
    su.setAttribute('aria-disabled', String(iq === 0))
    giu.setAttribute('aria-disabled', String(iq === QUOTE.length - 1))

    aggiornaComando()
    armaQuiete()

    const sist = sistemiIn(is, iq)
    if (sist.length) window.__studio?.entraIn?.(sist[0].id)

    /**
     * L'AGGANCIO PER LA LAMA, che oggi non ascolta nessuno.
     *
     * Un evento sul documento e non una richiamata passata da fuori: chi
     * costruira' la lama come strumento non deve importare l'interfaccia del
     * telefono per esserne guidato, altrimenti il desktop finirebbe per
     * dipendere dal telefono invece che dalla mappa.
     */
    document.dispatchEvent(new CustomEvent('nautica:cella', {
      detail: {
        stazione: STAZIONI[is].id, quota: QUOTE[iq].id, is, iq,
        sistemi: sist.map(x => x.id), da
      }
    }))
    return cambiata
  }

  /* ─────────────────────────────────────────────────────────────────────────
     IL DITO — blocco d'asse, poi uno scatto ogni passo
     ───────────────────────────────────────────────────────────────────────── */

  /**
   * ─── UNO SCATTO E' UNA DISTANZA, NON UNO SLANCIO
   *
   * La strada facile sarebbe stata: alla fine del trascinamento si guarda la
   * velocita' e si decide di quante celle spostarsi. E' come si fa un
   * carousel, e su dodici posizioni note e' sbagliato per una ragione precisa:
   * lo slancio porta DOVE NON SI E' DECISO DI ANDARE, e qui ogni cella e' una
   * decisione. Un mondo che scorre via da solo e' esattamente la sensazione
   * che `docs/13` §8 vuole togliere.
   *
   * Quindi e' una cricca: ogni `IPOTESI_PASSO_CELLA_PX` di viaggio sull'asse
   * bloccato vale uno scatto, subito, mentre il dito e' ancora giu'. Il
   * riscontro arriva durante il gesto e non alla fine, e non c'e' niente da
   * assestare al rilascio -- la posizione e' sempre stata su una cella.
   *
   * ─── E QUI MI SCOSTO DALLA DIREZIONE SCRITTA, quindi lo dichiaro
   *
   * `feedback/direzione-atto-due-2026-08-29.md` chiede «rilascio vicino a una
   * stazione: assestamento morbido», cioe' movimento libero durante il gesto e
   * assestamento alla fine. Ho scelto il contrario -- discreto durante,
   * niente da assestare dopo -- perche' con una cricca **non esiste** una
   * posizione intermedia da cui assestarsi, e quindi non esiste il fotogramma
   * in cui il mondo si muove senza che il dito lo abbia chiesto.
   *
   * Le due strade si distinguono guardando, non ragionando, e nessuna delle
   * due e' misurata qui: e' materia da cinque persone. Se la prova dice che il
   * morbido si legge meglio, cambia questa funzione e non il resto del file --
   * lo stato e' gia' discreto, e l'assestamento sarebbe soltanto un modo
   * diverso di arrivarci.
   */
  let ditoAttivo = null
  let asse = null
  let baseX = 0
  let baseY = 0
  let viaggio = 0
  let scattato = false

  campo.addEventListener('pointerdown', (e) => {
    /**
     * ─── LA SECONDA DITA ANNULLA, E NON COMANDA
     *
     * Vincolo dichiarato: niente controlli a due dita. Il modo di rispettarlo
     * non e' non scriverne uno -- e' fare in modo che un secondo contatto non
     * possa produrre un comando strano. Chi appoggia il pollice mentre
     * trascina con l'indice non deve vedere la nave saltare di tre stazioni.
     */
    if (ditoAttivo !== null) { fine(); return }
    /* I pulsanti sono dentro il campo e hanno il loro mestiere: un dito che
       parte da li' non e' un trascinamento. */
    if (e.target.closest('.espl__passo')) return
    ditoAttivo = e.pointerId
    asse = null
    baseX = e.clientX; baseY = e.clientY
    viaggio = 0
    scattato = false
    fermaQuiete()
    campo.setPointerCapture?.(e.pointerId)
  })

  campo.addEventListener('pointermove', (e) => {
    if (e.pointerId !== ditoAttivo) return
    const dx = e.clientX - baseX
    const dy = e.clientY - baseY
    viaggio = Math.max(viaggio, Math.abs(dx), Math.abs(dy))

    if (asse === null) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < IPOTESI_BLOCCO_ASSE_PX) return
      /**
       * L'asse si decide UNA volta e non si ripensa fino al rilascio. Un
       * blocco che si potesse riaprire a meta' gesto darebbe una diagonale
       * ambigua: due assi che si contendono lo stesso dito, cioe' di nuovo due
       * padroni per un nodo.
       */
      asse = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
      campo.dataset.asse = asse
      /* Il conteggio del passo riparte da QUI: i pixel spesi per decidere
         l'asse non sono ancora viaggio verso una cella. */
      baseX = e.clientX; baseY = e.clientY
      return
    }

    const d = asse === 'x' ? e.clientX - baseX : e.clientY - baseY
    const verso = d < 0 ? -1 : 1
    let n = Math.floor(Math.abs(d) / IPOTESI_PASSO_CELLA_PX)
    while (n-- > 0) {
      /**
       * IL SEGNO, e la stessa convenzione che `comandi.js` ha dovuto misurare
       * per la rotazione: **l'oggetto segue la mano.** Il dito che va a
       * sinistra spinge lo scafo a sinistra, quindi l'occhio si sposta verso
       * poppa e l'indice di stazione cresce. Il dito che va in su spinge la
       * nave in su, e si scende di quota.
       */
      const mosso = asse === 'x' ? vaA(is - verso, iq, 'dito') : vaA(is, iq - verso, 'dito')
      scattato = scattato || mosso
      if (asse === 'x') baseX += verso * IPOTESI_PASSO_CELLA_PX
      else baseY += verso * IPOTESI_PASSO_CELLA_PX
    }
  })

  function fine () {
    if (ditoAttivo === null) return
    /* Un contatto che non ha viaggiato abbastanza non e' un gesto: non conta
       ne' come riuscito ne' come tentativo a vuoto. Un dito appoggiato mentre
       si legge non deve finire nelle statistiche come «non ha capito». */
    if (viaggio >= IPOTESI_GESTO_VERO_PX) window.__studio?.gesto?.(scattato)
    ditoAttivo = null
    asse = null
    delete campo.dataset.asse
    armaQuiete()
  }
  campo.addEventListener('pointerup', fine)
  campo.addEventListener('pointercancel', fine)

  /* ─────────────────────────────────────────────────────────────────────────
     LA TASTIERA — la stessa cosa, senza dito
     ───────────────────────────────────────────────────────────────────────── */

  campo.addEventListener('keydown', (e) => {
    const m = {
      ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
      Home: [-STAZIONI.length, 0], End: [STAZIONI.length, 0],
      PageUp: [0, -QUOTE.length], PageDown: [0, QUOTE.length]
    }[e.key]
    if (!m) return
    e.preventDefault()
    /**
     * ─── QUI LA TASTIERA NON FUNZIONAVA, E IL COLPEVOLE ERA `?.`
     *
     * SINTOMO: con le frecce non si muoveva niente. Nessun errore in console,
     * nessuna eccezione in pagina, l'evento arrivava al campo (verificato con
     * un ascoltatore in fase di cattura: `campo:ArrowRight`), e lo STESSO
     * `vaA` chiamato dal dito funzionava benissimo -- il trascinamento portava
     * la cella da 0,0 a 3,0.
     *
     * CAUSA: la riga era
     *
     *     window.__studio?.gesto?.(vaA(is + m[0], iq + m[1], 'tastiera'))
     *
     * e **l'optional chaining non valuta gli argomenti** quando corto-circuita.
     * Senza `?studio=1` `window.__studio` non esiste, quindi l'intera chiamata
     * -- `vaA` compreso -- veniva saltata. La navigazione da tastiera esisteva
     * soltanto in modalita' di misura, cioe' esattamente dove nessun utente sta.
     *
     * COME L'HO ISOLATA: escludendo una alla volta. L'evento arriva (spia in
     * cattura); nessuno chiama `stopPropagation` (cercato in tutto `src/`);
     * nessuna eccezione (`pageerror` e `window.onerror` muti); e `vaA` funziona
     * dall'altra strada. Restava una sola differenza fra le due strade: il
     * dito chiama `vaA` in una riga sua e passa il risultato dopo. Era quella.
     *
     * LA REGOLA CHE NE ESCE, e vale oltre questo file: **mai mettere una
     * chiamata che fa qualcosa dentro l'argomento di una chiamata opzionale.**
     * Una misura che sparisce quando non si misura e' un fastidio; un'azione
     * che sparisce quando non si misura e' un difetto invisibile.
     */
    const mosso = vaA(is + m[0], iq + m[1], 'tastiera')
    window.__studio?.gesto?.(mosso)
  })

  /* ─────────────────────────────────────────────────────────────────────────
     APRIRE E CHIUDERE
     ───────────────────────────────────────────────────────────────────────── */

  const suEsc = (e) => { if (e.key === 'Escape' && aperta) chiudi() }

  function apri () {
    if (aperta) return
    aperta = true
    contenitore.hidden = false
    contenitore.dataset.stato = 'aperta'
    /**
     * L'attributo sta sulla RADICE perche' `tocco.css` deve poter spegnere la
     * pila e i comandi, che stanno in un altro ramo del documento. E' la
     * stessa meccanica con cui `main.js` scrive `data-unica`.
     */
    document.documentElement.dataset.attoDue = 'si'

    /**
     * ─── SI ARRIVA AL MECCANISMO RIUSANDO IL MENU, non ricopiandone la formula
     *
     * `menu.js` sa gia' tradurre il nome di una battuta in una posizione di
     * scorrimento, con la formula inversa di `demo.js`. Riscriverla qui
     * significherebbe **due copie della stessa aritmetica**, e la nota in testa
     * a `menu.js` dice cosa succede alle copie: divergono alla prima modifica.
     *
     * Quindi si preme la voce che c'e' gia'. Se domani il menu cambia forma
     * questa riga smette di funzionare in modo VISIBILE -- la modalita' si
     * apre e la scena non si sposta -- invece di continuare a calcolare una
     * posizione sbagliata in silenzio.
     */
    document.querySelector('nav [data-scena="meccanismo"]')?.click()

    vaA(is, iq, 'avvio')
    campo.focus()
    document.addEventListener('keydown', suEsc)
  }

  function chiudi () {
    if (!aperta) return
    aperta = false
    fermaQuiete()
    spiaStato.disconnect()
    canonico = null
    contenitore.dataset.stato = 'chiusa'
    contenitore.hidden = true
    delete document.documentElement.dataset.attoDue
    document.removeEventListener('keydown', suEsc)
    window.__studio?.esce?.()
    entrata?.focus()
  }

  contenitore.dataset.stato = 'chiusa'
  contenitore.hidden = true

  return { apri, chiudi, vaA, soglie, dove: () => ({ is, iq }), aperta: () => aperta }
}
