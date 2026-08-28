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
 * L'ordine E' la priorita'. Il primo non ancora soddisfatto e visibile vince.
 * Non e' alfabetico e non e' l'ordine sullo schermo: e' l'ordine in cui una
 * persona scopre il sito.
 *
 * Era stabilizzatore, velocita', mare, menu. Adesso il MARE viene prima della
 * velocita', e la ragione l'ha scritta una revisione esterna meglio di come
 * l'avevo pensata io: la decisione emotiva nasce dal mare -- alzarlo e vedere
 * la nave reagire -- mentre la velocita' e' l'approfondimento tecnico che
 * viene dopo, ed e' anche il piu' controintuitivo.
 */
const NUDGE = [
  {
    id: 'stab',
    bersaglio: '#stab',
    /**
     * «Turn it off» era ambiguo: dice il gesto e non il motivo, e su un sito
     * che non vuole essere un manuale il motivo e' tutto. Questa versione
     * promette una conseguenza, che e' esattamente cio' che il sito dimostra.
     */
    testo: 'See what happens without it',
    /**
     * SOLO `click`, e non piu' anche `keydown`. Un bottone emette `click`
     * anche da tastiera con Invio o barra, quindi non si perde niente --
     * mentre `keydown` scattava su QUALUNQUE tasto, `Tab` e `Shift`
     * compresi: bastava tabulare sopra il comando perche' il suggerimento
     * si considerasse gia' seguito. Un nudge che sparisce senza che tu abbia
     * fatto la cosa e' peggio di nessun nudge.
     */
    eventi: ['click']
  },
  {
    id: 'mare',
    bersaglio: '#mare',
    testo: 'Change the sea',
    eventi: ['click']
  },
  {
    id: 'velocita',
    bersaglio: '#velocita',
    /* La cosa piu' controintuitiva del sito, e stava in un paragrafo tolto:
       sotto lo stallo il rapporto e' una proprieta' del sistema, non del mare.
       Qui torna addosso al comando che la dimostra. `input` scatta anche con
       le frecce, quindi la tastiera e' coperta senza `keydown`. */
    testo: 'Drag the speed - the number moves',
    eventi: ['input']
  },
  {
    id: 'menu',
    bersaglio: 'nav [data-scena]',
    testo: 'Jump to any scene',
    eventi: ['click']
  }
]

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
        const el = document.querySelector(n.bersaglio)
        if (!visibile(el)) continue
        mostra(n, el)
        break
      }
    }
    /* se il comando esce di scena mentre il nudge e' acceso, il nudge se ne va
       con lui invece di restare appeso a un punto vuoto */
    if (acceso) {
      const n = NUDGE.find((x) => x.id === acceso)
      if (!visibile(document.querySelector(n.bersaglio))) nascondi()
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
