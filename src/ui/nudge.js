/**
 * I NUDGE -- dire cosa si puo' fare, senza dire cosa fare.
 *
 * Chiesti dall'utente come passo di usabilita': "devi fare un grosso passo
 * mettendo dei nudge che suggeriscono cosa puoi fare". La Usability pesa il
 * 30% del voto Awwwards ed e' il criterio piu' debole dei vincitori, quindi
 * non e' un contorno.
 *
 * --- LE REGOLE CHE MI SONO DATO, e perche'
 *
 * 1. UNO ALLA VOLTA. Cinque etichette accese insieme sono un pannello di
 *    istruzioni, cioe' esattamente il registro che questo sito sta togliendo.
 *
 * 2. SOLO SU QUELLO CHE SI VEDE. Un suggerimento su un comando fuori campo e'
 *    rumore, e sposta l'occhio dove non c'e' niente.
 *
 * 3. DOPO UNA PAUSA, non subito. Chi sta gia' facendo qualcosa non ha bisogno
 *    di essere spinto; il nudge serve a chi si e' fermato.
 *
 * 4. SPARISCE QUANDO IL COMANDO E' STATO USATO, e non torna. E' l'opposto
 *    della regola del suggerimento di rotazione (`comandi.js`), che invece
 *    RITORNA -- e li' e' giusto, perche' il trascinamento non lascia traccia
 *    sullo schermo e si dimentica. Qui, se hai spento lo stabilizzatore, la
 *    pagina te lo mostra: ridirtelo sarebbe insistere.
 *
 * 5. NON SI ANIMA SE NON SI DEVE. `prefers-reduced-motion` si onora dentro
 *    l'esperienza, non spegnendola: il nudge compare comunque, senza
 *    dissolvenza. Chi ha chiesto meno movimento non perde un'informazione.
 *
 * 6. LO SENTE ANCHE CHI NON LO VEDE. `role="status"` e `aria-live="polite"`:
 *    un annuncio per volta, alla fine di cio' che il lettore sta gia' dicendo.
 */

/** Quanto sta fermo prima di suggerire, e quanto resta acceso. */
const PAUSA = 5200
const DURATA = 7000

/**
 * ─── LA DURATA DELL'ATTO DUE E' PIU' CORTA, e il conto e' vincolante
 *
 * Sette secondi vanno bene per un suggerimento che aspetta la noia: c'e' tutto
 * il tempo. Nella catena causale no, perche' i messaggi si mettono in FILA --
 * uno alla volta e' la prima regola di questo file, e resta giusta -- e la fila
 * non puo' essere piu' lunga della conseguenza che racconta.
 *
 * Misurato sulla simulazione, dopo lo spegnimento della propulsione: sotto i
 * 10 nodi a 4,3 s, sotto i 7 a 12,1. Con sette secondi a testa, la seconda
 * battuta occuperebbe lo schermo fino a 7 s e la terza fino a 14 -- e il
 * suggerimento del giroscopio, che la fisica merita a 12,1, arriverebbe a 14
 * scavalcato dalla coda. Quattro secondi lasciano ogni battuta scoperta prima
 * che la successiva la meriti, e il giroscopio arriva quando arriva la sua
 * causa.
 */
const DURATA_ATTO_DUE = 4000

/**
 * ─── E NON BASTA L'ORDINE: CONTA DOVE E QUANDO
 *
 * La prima versione sceglieva solo per priorita' e visibilita' del comando.
 * Guardando un video del sito, una revisione esterna ha trovato tre errori di
 * REGIA che nessuna misura di contrasto poteva vedere:
 *
 *   · «Jump to any scene» compariva sull'apertura, a otto secondi, sopra la
 *     frase principale: invitava a saltare una storia non ancora cominciata;
 *   · «Change the sea» arrivava mentre le persone stavano ancora reagendo allo
 *     spegnimento dello stabilizzatore -- cioe' nel momento in cui chi guarda
 *     deve guardare loro;
 *   · «Drag the speed» trasformava una conseguenza in un parametro. L'atto
 *     due comincia invece togliendo propulsione e osservando cosa viene meno.
 *
 * Quindi ogni nudge dichiara adesso DOVE ha senso (`battute`), COSA deve essere
 * gia' successo (`dopo`) e quante scene servono prima (`scene`). La sequenza
 * che ne esce: apertura niente, salone lo stabilizzatore, dopo l'esperimento il
 * mare, al meccanismo la propulsione, il menu buon ultimo.
 *
 * L'ordine E' la priorita'. Il primo non ancora soddisfatto e visibile vince.
 * Non e' alfabetico e non e' l'ordine sullo schermo: e' l'ordine in cui una
 * persona scopre il sito.
 *
 * Era stabilizzatore, velocita', mare, menu. Adesso il MARE viene prima della
 * propulsione, e la ragione l'ha scritta una revisione esterna meglio di come
 * l'avevo pensata io: la decisione emotiva nasce dal mare -- alzarlo e vedere
 * la nave reagire -- mentre la dipendenza dalla propulsione viene dopo, ed e'
 * anche il passaggio piu' controintuitivo.
 */
import { IPOTESI_ROLLIO_AVVERTITO_RMS, IPOTESI_ANDATURA_PINNE_KN } from './soglie.js'

const NUDGE = [
  {
    id: 'stab',
    bersaglio: '#stab-salone, #stab',
    /**
     * ERA «See what happens without it», e adesso dice il contrario.
     *
     * Il sito parte SPENTO (`stato.js`): il primo gesto e' accendere, quindi
     * un invito a spegnere parlerebbe di un interruttore gia' spento.
     *
     * La forma pero' resta quella che una revisione aveva promosso: **promette
     * una scoperta invece di dare un ordine**. «Turn it on» dice cosa fare,
     * «See what it does» dice cosa ci guadagni — ed e' la stessa ragione per
     * cui il nudge della propulsione, dove la conseguenza NON e' visibile sul
     * momento, usa invece un verbo esplicito.
     */
    testo: 'See what it does',
    eventi: ['click'],
    /* dove ha senso: dove l'interruttore e' in scena e la conseguenza si vede */
    battute: ['salotto', 'emerge', 'mare', 'invito', 'calma']
  },
  {
    id: 'mare',
    bersaglio: '#mare',
    testo: 'Change the sea',
    eventi: ['click'],
    battute: ['emerge', 'mare', 'invito', 'calma'],
    /* NON prima che l'esperimento dello stabilizzatore sia finito: arrivava
       mentre le persone stavano ancora reagendo allo spegnimento, e in quel
       momento chi guarda deve guardare loro, non ricevere un'altra istruzione */
    dopo: 'stab'
  },
  /**
   * ─── LE QUATTRO BATTUTE DELL'ATTO DUE, e nessuna aspetta che ci si annoi
   *
   * Fino a ieri l'atto due aveva UN suggerimento a inattivita' («Switch
   * propulsion off») e uno di stato («Try the gyro»), e in mezzo il silenzio.
   * Una revisione esterna ha guardato il filmato e ha trovato il buco: il
   * primo compariva a 48 s e non veniva seguito, il secondo dipendeva
   * dall'andatura sotto i 7 nodi che con la vecchia scala del tempo arrivava a
   * **trenta secondi** dal clic. Il ragionamento era corretto e nasceva morto.
   *
   * Adesso sono quattro, e la regola e' una sola: **ogni messaggio dell'atto
   * due dipende dallo stato fisico**, mai dalla sola inattivita'. Chi scorre
   * non azzera la catena, e chi si ferma non riceve un messaggio che la fisica
   * non ha ancora meritato.
   *
   * La fila, coi tempi MISURATI sulla simulazione (spegnimento a t = 0):
   *
   *     t ~ 0      la propulsione e' ancora accesa   «Switch propulsion off»
   *     t ~ 0,2    albero al 68% dei giri            «The shaft slows...»
   *     t ~ 4,3    autorita' pinne sotto il 70%      «The fins are still on...»
   *     t ~ 12,8   rollio avvertibile (1,8 RMS)      «Try the gyro»
   *     dopo       niente. Si guarda.
   *
   * Fra la terza e la quarta ci sono circa quattro secondi di silenzio, e sono
   * voluti: e' il tratto in cui la nave rallenta e non c'e' niente da dire che
   * non sia gia' scritto sulla lettura della velocita'. Un quinto messaggio li'
   * in mezzo riempirebbe un vuoto che serve.
   *
   * L'ULTIMO SILENZIO E' UNA DECISIONE, non una dimenticanza. Dopo il
   * giroscopio la nave si calma da sola e le due persone si rilassano: e' il
   * momento emotivo del sito, e un'etichetta sopra lo trasformerebbe in una
   * conferma di sistema. Lo garantisce `quando`, che su tutte e quattro
   * pretende `!S.giroscopio`.
   */
  {
    id: 'propulsione',
    bersaglio: '#propulsione',
    testo: 'Switch propulsion off',
    eventi: ['click'],
    /* al MECCANISMO: il gesto non anticipa la spiegazione sulla prima vista.
       Qui albero, velocita' e pinna possono diventare una sola conseguenza. */
    battute: ['taglio', 'meccanismo'],
    /**
     * ERA UN NUDGE DI NOIA, ADESSO E' DI STATO. La condizione dice cosa deve
     * essere vero perche' la frase abbia senso: c'e' una propulsione accesa da
     * togliere, e ci sono delle pinne accese che ne dipendono. Se qualcuno
     * arriva qui con la propulsione gia' spenta, il suggerimento non compare --
     * prima invece compariva lo stesso, dopo 5,2 s di quiete, suggerendo un
     * gesto gia' fatto.
     */
    quando: (S) => S.propulsione && S.stab && !S.giroscopio
  },
  {
    /**
     * LA SECONDA BATTUTA — nomina cio' che sta gia' succedendo.
     *
     * Non chiede niente: dice dove guardare. L'albero rallenta subito (68% dei
     * giri a un secondo) ma la velocita' scende dopo, ed e' quel RITARDO la
     * cosa da capire -- una nave non si ferma quando si spegne il motore.
     *
     * Il bersaglio e' la lettura della velocita', non un comando: e' l'unico
     * nudge del sito che punta a un numero invece che a un bottone, e lo fa
     * perche' quel numero e' cio' che sta per muoversi.
     */
    id: 'albero',
    bersaglio: '#v-velocita, #propulsione',
    testo: 'The shaft slows. Speed follows.',
    battute: ['taglio', 'meccanismo'],
    durata: DURATA_ATTO_DUE,
    quando: (S) => !S.propulsione && !S.giroscopio && S.velocita > IPOTESI_ANDATURA_PINNE_KN
  },
  {
    /**
     * LA TERZA — la contraddizione, detta mentre e' vera.
     *
     * Le pinne sono ANCORA ACCESE. `aria-pressed` sul comando lo conferma, la
     * scena le mostra muoversi. Eppure la nave ricomincia a rollare, e questa
     * e' la riga per cui esiste tutto l'atto due: non e' stato spento niente
     * che le riguardi, hanno solo perso l'acqua che le faceva funzionare.
     *
     * «They are losing water» e' letterale, non una metafora: l'autorita' va
     * col quadrato della velocita' (`autorita()` in `simulazione.js`) perche'
     * una pinna produce portanza solo in moto.
     */
    id: 'pinne',
    bersaglio: '#stab',
    testo: 'The fins are still on. They are losing water.',
    battute: ['taglio', 'meccanismo'],
    durata: DURATA_ATTO_DUE,
    quando: (S) => !S.propulsione && S.stab && !S.giroscopio &&
                   S.velocita < IPOTESI_ANDATURA_PINNE_KN
  },
  {
    /**
     * LA QUARTA — l'unico nudge che NON aspetta che ci si annoi (e adesso non
     * e' piu' l'unico: lo sono tutti e quattro).
     *
     * Una revisione esterna ha trovato il buco e l'ha detto meglio di come
     * l'avevo pensato: in un sito guidato dallo scorrimento un suggerimento
     * che dipende da 5,2 s di inattivita' e' strutturalmente troppo timido —
     * ogni rotella azzera il timer, e l'atto due esisteva nel codice senza
     * essere vissuto. E fra i cinque testi non ce n'era **nessuno** che
     * nominasse il giroscopio, che e' la scoperta conclusiva.
     *
     * Arriva quando la CATENA CAUSALE lo merita: propulsione spenta, pinne
     * ancora accese, e l'andatura scesa sotto l'ipotesi. Cioe' nel momento in
     * cui la nave ha ricominciato a rollare **con gli stabilizzatori
     * inseriti** — la contraddizione che il giroscopio esiste per sciogliere.
     *
     * Prima ci metteva 29,9 secondi ad arrivare, perche' `ACCEL_RIF` valeva
     * 0,30. Adesso 12,8 a mare 4, misurati. Non e' cambiata la forma della
     * condizione: e' cambiato l'orologio, ed e' la ragione per cui la
     * condizione sta scritta in FISICA e non in secondi.
     *
     * ─── E LA CONDIZIONE GUARDA IL ROLLIO, non piu' l'andatura
     *
     * Diceva «andatura sotto i 7 nodi», che era un SURROGATO del rollio.
     * Misurato, sbagliava in tutti e due i versi: a mare 3 il rollio diventa
     * avvertibile a 24,7 s e l'andatura passa i 7 nodi a 12,1 -- dodici secondi
     * in cui il sito avrebbe suggerito una cura per un male invisibile. A mare
     * 5 arrivava tardi.
     *
     * Adesso legge `S.rollioRms`, cioe' la cosa stessa, con la soglia a cui le
     * due persone del salone si irrigidiscono. Il suggerimento e la reazione
     * umana scattano sullo stesso numero: `IPOTESI_ROLLIO_AVVERTITO_RMS`.
     */
    id: 'giroscopio',
    bersaglio: '#giroscopio',
    testo: 'Try the gyro',
    eventi: ['click'],
    battute: ['taglio', 'meccanismo'],
    durata: DURATA_ATTO_DUE,
    quando: (S) => !S.propulsione && S.stab && !S.giroscopio &&
                   S.rollioRms > IPOTESI_ROLLIO_AVVERTITO_RMS
  },
  {
    id: 'menu',
    bersaglio: 'nav [data-scena]',
    testo: 'Jump to any scene',
    eventi: ['click'],
    /* dopo che almeno due scene sono state viste. Compariva sull'apertura, a
       otto secondi, sopra la frase principale: invitava a saltare una storia
       non ancora cominciata */
    scene: 2,
    /**
     * E NON DURANTE L'ATTO DUE, che e' il buco aperto dalle quattro battute
     * nuove.
     *
     * Fra la terza e la quarta c'e' un tratto di silenzio di circa quattro
     * secondi. Senza questa riga, in quel tratto il nudge del menu era
     * ammissibile -- nessuna battuta lo escludeva e la pausa d'inattivita' era
     * scaduta da un pezzo -- e compariva «Jump to any scene» **nel mezzo
     * dell'esperimento**: un invito ad andarsene proprio nell'istante in cui il
     * sito sta dimostrando l'unica cosa che ha da dimostrare.
     *
     * E' lo stesso errore di regia che una revisione esterna aveva gia' trovato
     * una volta su questo identico nudge, quando compariva sull'apertura sopra
     * la frase principale. Allora si era curato con `scene`, che dice QUANDO e'
     * troppo presto. Serviva anche il dire DOVE e' fuori posto.
     */
    battute: ['emerge', 'mare', 'invito', 'calma']
  }
]

/**
 * IL PRIMO BERSAGLIO VISIBILE, non il primo del documento.
 *
 * `document.querySelector` restituisce il primo in ordine di documento, e per
 * lo stabilizzatore ce ne sono DUE -- quello del salone e quello della
 * dimostrazione -- di cui uno solo e' in scena alla volta. Prendendo il primo
 * si finiva a giudicare la visibilita' di un bottone che non c'entrava, e il
 * suggerimento non compariva mai.
 */
/**
 * E L'ORDINE E' QUELLO DEL SELETTORE, non quello del documento.
 *
 * `document.querySelectorAll('a, b')` restituisce in ordine di DOCUMENTO, non
 * nell'ordine in cui i due selettori sono scritti. Finche' la virgola serviva
 * solo a scegliere fra due copie dello stesso comando -- `#stab-salone, #stab`,
 * di cui una sola e' mai in scena -- non faceva differenza. Serve adesso, che
 * la seconda battuta dell'atto due dichiara un RIPIEGO: punta alla lettura
 * della velocita' e, se quella non e' in campo, al comando che l'ha mossa. In
 * ordine di documento il comando viene prima, e il ripiego avrebbe vinto
 * sempre -- cioe' non sarebbe stato un ripiego.
 */
const primoVisibile = (sel) => {
  for (const parte of sel.split(',')) {
    for (const el of document.querySelectorAll(parte.trim())) if (visibile(el)) return el
  }
  return null
}

const visibile = (el) => {
  if (!el) return false
  const r = el.getBoundingClientRect()
  if (r.width < 4 || r.height < 4) return false
  if (r.bottom < 0 || r.top > window.innerHeight) return false
  /* un comando a opacita' zero occupa spazio ma non c'e': il palco spegne i
     pannelli con `--uscita`, e senza questo controllo il nudge parlava di
     bottoni invisibili */
  return Number(getComputedStyle(el).opacity) > 0.15
}

/**
 * L'ULTIMO STATO DELLA SIMULAZIONE, spinto da chi ce l'ha.
 *
 * Sta a livello di modulo e non dentro `creaNudge` perche' chi lo scrive
 * (`demo.js`, che carica il motore) e chi lo legge (il giro dei nudge, gia'
 * partito con la pagina) non si conoscono e non devono conoscersi: `nudge.js`
 * e' nel percorso critico e non puo' importare ne' three ne' la simulazione.
 *
 * Finche' nessuno lo spinge resta `null`, e un nudge che dipende da `quando`
 * non compare. E' il comportamento giusto: senza scena non c'e' conseguenza
 * causale da nominare.
 */
let ultimoStato = null
export const segnalaStato = (S) => { ultimoStato = S }

export function creaNudge () {
  const bolla = document.createElement('div')
  bolla.className = 'nudge'
  bolla.setAttribute('role', 'status')
  bolla.setAttribute('aria-live', 'polite')
  bolla.dataset.visibile = 'no'
  document.body.appendChild(bolla)

  const fatti = new Set()
  let acceso = null
  let ultimoGesto = performance.now()
  let spegni = null

  /**
   * `giaMostrati` non e' `fatti`: un nudge puo' essere stato MOSTRATO senza
   * essere stato SEGUITO. Senza questa distinzione, appena il timer lo
   * spegneva il giro successivo lo riaccendeva -- perche' `ultimoGesto` era
   * vecchio e la condizione d'inattivita' era ancora vera. Il risultato era
   * la stessa bolla che lampeggia all'infinito su chi non tocca niente.
   */
  const giaMostrati = new Set()

  function nascondi () {
    bolla.dataset.visibile = 'no'
    if (acceso) giaMostrati.add(acceso)
    acceso = null
    clearTimeout(spegni)
    /* e il prossimo aspetta una pausa intera, non riparte subito */
    ultimoGesto = performance.now()
  }

  const segnaFatto = (n) => {
    fatti.add(n.id)
    if (acceso === n.id) nascondi()
  }
  /* `eventi` e' FACOLTATIVO: due battute dell'atto due non nominano un gesto,
     nominano una conseguenza. Non c'e' niente da cliccare che le soddisfi, e
     a spegnerle basta `giaMostrati` -- una battuta detta e' detta. */
  for (const n of NUDGE) {
    for (const el of document.querySelectorAll(n.bersaglio)) {
      for (const ev of (n.eventi || [])) el.addEventListener(ev, () => segnaFatto(n), { passive: true })
    }
  }
  /* qualunque gesto rimanda il prossimo suggerimento: chi e' attivo non va spinto */
  for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) {
    window.addEventListener(ev, () => { ultimoGesto = performance.now() }, { passive: true })
  }

  /**
   * QUANTE SCENE SONO STATE VISTE. Si legge dal palco della dimostrazione, che
   * porta gia' `data-battuta` scritto dalla regia: non si ricalcola qui una
   * seconda volta quale battuta sia in corso.
   *
   * Il palco si cerca DENTRO la sezione: nel documento ce ne sono due -- salone
   * e dimostrazione -- e `document.querySelector` prende il primo, che con la
   * scena unica viene poi rimosso. E' la stessa trappola gia' pagata in
   * `menu.js`.
   */
  const sezione = document.querySelector('#dimostrazione')
  const palco = sezione ? sezione.querySelector('.palco') : null
  const sceneViste = new Set()
  const battutaOra = () => (palco && palco.dataset.battuta) || ''
  if (palco) {
    const segnaScena = () => { const b = battutaOra(); if (b) sceneViste.add(b) }
    new MutationObserver(segnaScena).observe(palco, { attributes: true, attributeFilter: ['data-battuta'] })
    segnaScena()
  }

  /**
   * LO STATO CAUSALE, spinto dalla scena.
   *
   * `nudge.js` sta nel percorso critico e non deve importare ne' three ne' la
   * simulazione: riceve l'ultimo stato da `demo.js`, dallo stesso punto in cui
   * la HUD riceve il suo. Finche' nessuno lo spinge resta `null`, e i nudge
   * che dipendono da `quando` semplicemente non compaiono.
   */
  const suoTurno = (n) => {
    if (n.quando && !(ultimoStato && n.quando(ultimoStato))) return false
    if (n.dopo && !fatti.has(n.dopo)) return false
    if (n.scene && sceneViste.size < n.scene) return false
    if (n.battute && !n.battute.includes(battutaOra())) return false
    return true
  }

  function mostra (n, el) {
    const r = el.getBoundingClientRect()
    bolla.textContent = n.testo
    bolla.dataset.visibile = 'si'
    acceso = n.id
    /* si misura DOPO aver scritto il testo, o la larghezza e' quella di prima */
    const l = bolla.getBoundingClientRect()
    const x = Math.min(window.innerWidth - l.width - 12,
      Math.max(12, r.left + r.width / 2 - l.width / 2))
    /* sopra il comando se c'e' posto, sotto se no: un suggerimento che esce
       dallo schermo non e' un suggerimento */
    const sopra = r.top > l.height + 18
    bolla.style.left = Math.round(x) + 'px'
    bolla.style.top = Math.round(sopra ? r.top - l.height - 10 : r.bottom + 10) + 'px'
    clearTimeout(spegni)
    spegni = setTimeout(nascondi, n.durata || DURATA)
  }

  function giro () {
    if (!acceso) {
      const fermo = performance.now() - ultimoGesto > PAUSA
      for (const n of NUDGE) {
        if (fatti.has(n.id) || giaMostrati.has(n.id)) continue
        /* un nudge di STATO non aspetta la noia: la conseguenza e' appena
           accaduta e il momento per nominarla e' adesso. Tutti gli altri
           continuano a rispettare la pausa. */
        if (!n.quando && !fermo) continue
        if (!suoTurno(n)) continue
        const el = primoVisibile(n.bersaglio)
        if (!el) continue
        mostra(n, el)
        break
      }
    }
    /* se il comando esce di scena mentre il nudge e' acceso, il nudge se ne va
       con lui invece di restare appeso a un punto vuoto */
    if (acceso) {
      const n = NUDGE.find((x) => x.id === acceso)
      if (!primoVisibile(n.bersaglio)) nascondi()
    }
  }
  /**
   * QUATTRO VOLTE AL SECONDO, non sessanta. Un controllo d'inattivita' non ha
   * bisogno del ritmo del disegno: `requestAnimationFrame` girava a ogni
   * fotogramma per confrontare due numeri e leggere un rettangolo, cioe'
   * lavoro dentro il ciclo di rendering per niente. Duecentocinquanta
   * millisecondi sono invisibili per un suggerimento che aspetta cinque
   * secondi.
   */
  setInterval(giro, 250)
}
