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
const NUDGE = [
  {
    id: 'stab',
    bersaglio: '#stab-salone, #stab',
    testo: 'See what happens without it',
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
  {
    id: 'propulsione',
    bersaglio: '#propulsione',
    testo: 'See what happens without propulsion',
    eventi: ['click'],
    /* al MECCANISMO: il gesto non anticipa la spiegazione sulla prima vista.
       Qui albero, velocita' e pinna possono diventare una sola conseguenza. */
    battute: ['taglio', 'meccanismo']
  },
  {
    id: 'menu',
    bersaglio: 'nav [data-scena]',
    testo: 'Jump to any scene',
    eventi: ['click'],
    /* dopo che almeno due scene sono state viste. Compariva sull'apertura, a
       otto secondi, sopra la frase principale: invitava a saltare una storia
       non ancora cominciata */
    scene: 2
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
const primoVisibile = (sel) => {
  for (const el of document.querySelectorAll(sel)) if (visibile(el)) return el
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
  for (const n of NUDGE) {
    for (const el of document.querySelectorAll(n.bersaglio)) {
      for (const ev of n.eventi) el.addEventListener(ev, () => segnaFatto(n), { passive: true })
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

  const suoTurno = (n) => {
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
    spegni = setTimeout(nascondi, DURATA)
  }

  function giro () {
    if (!acceso && performance.now() - ultimoGesto > PAUSA) {
      for (const n of NUDGE) {
        if (fatti.has(n.id) || giaMostrati.has(n.id)) continue
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
