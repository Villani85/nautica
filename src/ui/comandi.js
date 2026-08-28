import { AMPIEZZA_MARE } from '../scena/simulazione.js'

/**
 * DIFETTO CORRETTO — nel prototipo i selettori dello stato del mare erano
 * larghi 20px e alti dal 20% al 100% di 34px: il bersaglio piu' piccolo era
 * circa 20x7px. WCAG 2.2 chiede almeno 24x24 al livello AA, e 44x44 al livello
 * AAA (che e' anche il minimo delle linee guida Apple). 20x7 falliva entrambi.
 *
 * Ora ogni pulsante ha un'area sensibile di 44x44 garantita, mentre la barra
 * colorata che si vede resta sottile: il bersaglio e' piu' grande del segno,
 * che e' esattamente cio' che WCAG intende.
 */
export function collegaComandi ({ contenitore, toggle, sim, alCambio }) {
  /**
   * QUALUNQUE comando toccato annulla la dimostrazione automatica, non solo
   * l'interruttore. Chi sta gia' provando i comandi non va interrotto -- e
   * misurato, la dimostrazione che scattava mentre il cancello della manopola
   * cliccava il mare veniva letta come un salto temporale sul clic: 0,12 gradi
   * in un fotogramma, 14 volte il naturale. Il cancello aveva ragione: dal suo
   * punto di vista la nave ERA saltata.
   */
  let toccato = false
  const pulsanti = []

  for (let n = 0; n < AMPIEZZA_MARE.length; n++) {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'mare__tacca'
    b.style.setProperty('--altezza', `${16 + n * 16}%`)
    b.setAttribute('aria-pressed', String(n === sim.S.mare))
    b.setAttribute('aria-label', `Sea state ${n}, nominal roll amplitude ${AMPIEZZA_MARE[n]} degrees`)
    b.innerHTML = '<span class="mare__barra" aria-hidden="true"></span>'
    b.addEventListener('click', () => {
      toccato = true
      /**
       * NON `sim.S.mare = n` seguito da `sim.scalda()`. Quella coppia -- che e'
       * stata qui per tre ore -- faceva saltare la nave di 6,27 gradi in un
       * fotogramma, dove un fotogramma normale ne fa 0,043: centoquarantasei
       * volte. `cambiaMare` fa la stessa cosa preservando la fase, spalmata su
       * 0,8 secondi. La ragione lunga sta in `simulazione.js`.
       */
      sim.cambiaMare(n)
      sim.azzeraPicchi()
      pulsanti.forEach((x, j) => x.setAttribute('aria-pressed', String(j === n)))
      alCambio?.()
    })
    contenitore.appendChild(b)
    pulsanti.push(b)
  }

  /**
   * --- L'INTERRUTTORE DICHIARAVA IL CONTRARIO DI QUELLO CHE FACEVA
   *
   * `index.html` scriveva `aria-pressed="false"` a mano; `stato.js` apre con
   * `stab = true`, perche' il sito comincia stabilizzato -- *"si entra da dove
   * si sta bene"*. E l'allineamento avveniva SOLO dentro il gestore del clic.
   *
   * Quindi a pagina appena aperta l'attributo diceva "spento" mentre lo stato
   * era acceso e la riduzione leggeva 91%. Costava tre volte:
   *
   *   - un lettore di schermo annunciava "not pressed" prima E dopo la prima
   *     pressione;
   *   - chi guarda premeva per ACCENDERE e in realta' spegneva;
   *   - e la regola `[data-battuta="invito"] .interruttore:not([aria-pressed=
   *     "true"])` faceva PULSARE l'interruttore per invitare ad accendere una
   *     cosa gia' accesa -- una pulsazione che ho aggiunto io stamattina, e che
   *     ha reso il difetto piu' evidente invece che piu' innocuo.
   *
   * Trovato da un percorso di sola tastiera, che e' il modo in cui questo
   * difetto era visibile: da mouse si vede il colore, e il colore veniva dallo
   * stesso attributo sbagliato, quindi era coerente con se stesso.
   *
   * La causa vera e' strutturale e vale oltre questo bottone: **lo stato
   * iniziale era scritto in due posti**, il markup e `stato.js`, e nessuno dei
   * due sapeva dell'altro. Adesso il markup non lo dichiara piu': lo legge da
   * chi lo possiede, all'accensione.
   */
  toggle.setAttribute('aria-pressed', String(sim.S.stab))

  toggle.addEventListener('click', () => {
    toccato = true
    // passa da `cambiaStab` e non da `S.stab` diretto: e' li' che vive la
    // riscalatura d'ampiezza, senza la quale premere non fa vedere niente
    sim.cambiaStab(!sim.S.stab)
    toggle.setAttribute('aria-pressed', String(sim.S.stab))
    sim.azzeraPicchi()
    alCambio?.()
  })

  /**
   * --- IL SITO SPEGNE PER PRIMO, UNA VOLTA SOLA
   *
   * Alla battuta del meccanismo non si capiva cosa dovesse fare chi guarda: la
   * macchina si muove, quattro numeri cambiano in fondo allo schermo, e niente
   * dice che le due cose siano la stessa. E la differenza -- l'unica cosa che
   * questo sito ha da mostrare -- si vede SOLO spegnendo, cioe' facendo una
   * cosa che nessuno ti ha detto di fare.
   *
   * Il fantasma era la risposta tecnica alla stessa domanda, ed e' stato
   * bocciato con una riga giusta: «non porta emozioni». Un confronto disegnato
   * accanto parla alla testa. Ma il confronto esiste gia' nella scena: basta
   * spegnere, e la nave rolla davvero.
   *
   * Quindi lo fa il sito, come gia' fa per la rotazione: **il primo movimento
   * lo fa lui**. Spegne, la nave prende il mare per due secondi e mezzo, e
   * riaccende. Poi l'interruttore resta li' con l'invito, e a quel punto si sa
   * cosa succede a premerlo.
   *
   * Le condizioni sono tre, e ognuna evita un modo di essere fastidiosi:
   *   - UNA VOLTA SOLA per visita: una dimostrazione che si ripete e' un
   *     cartellone;
   *   - MAI se la mano ha gia' toccato l'interruttore: chi ha capito non va
   *     interrotto, ed e' la stessa regola di `mostraCheSiGira`;
   *   - MAI con `prefers-reduced-motion`: li' si sta chiedendo di non essere
   *     mossi, e questa e' esattamente una mossa non richiesta.
   *
   * E se durante la dimostrazione la mano tocca l'interruttore, la
   * dimostrazione LASCIA: non riaccende, perche' riaccendere sopra la mano di
   * qualcuno sarebbe il contrario di quello che sta insegnando.
   */
  let dimostrato = false
  function mostraCheSiSpegne ({ durata = 2600 } = {}) {
    if (dimostrato || toccato || !sim.S.stab) return false
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    dimostrato = true
    const cambia = (v) => {
      sim.cambiaStab(v)
      toggle.setAttribute('aria-pressed', String(v))
      sim.azzeraPicchi()
      alCambio?.()
    }
    document.documentElement.dataset.dimostra = 'spento'
    cambia(false)
    setTimeout(() => {
      delete document.documentElement.dataset.dimostra
      if (!toccato) cambia(true)
    }, durata)
    return true
  }
  collegaComandi.mostraCheSiSpegne = mostraCheSiSpegne
  return { mostraCheSiSpegne }
}

/**
 * DIFETTO CORRETTO — il punto di vista si poteva cambiare solo trascinando
 * col puntatore: da tastiera non esisteva alcun modo. Ora la tela e' un
 * gruppo focalizzabile e le frecce ruotano; il trascinamento resta per chi usa
 * mouse o dito.
 */
/**
 * --- IL SUGGERIMENTO SPARIVA A UN CLIC FERMO
 *
 * Una revisione l'ha PREVISTO senza vederlo, dalla sola forma del difetto:
 * *"sparisce al primo trascinamento -- ma anche a un trascinamento
 * involontario. Da verificare: se la condizione e' il `pointerdown` invece di
 * uno spostamento oltre soglia, e' quella."* Era quella.
 *
 * `nascondiSuggerimento()` stava su `pointerdown`: un clic sulla tela, senza
 * muovere di un pixel, spegneva per sempre l'unico posto in cui il sito dice
 * che la nave si gira. E non tornava piu'.
 *
 * Adesso sparisce solo dopo uno spostamento vero, e se non succede niente
 * TORNA -- un suggerimento che si spegne da solo e non si riaccende e' peggio
 * di nessun suggerimento, perche' fa credere di aver informato.
 */
const SPOSTAMENTO_VERO = 8      // px: sotto, e' un clic, non un gesto
const RIPROPONI_DOPO = 10000    // ms senza trascinare, e l'invito torna

export function collegaPuntoDiVista ({ tela, ruota, suggerimento }) {
  let trascina = false
  let xPrec = 0
  let xGiu = 0
  let haTrascinato = false
  let riproponi = 0

  const nascondiSuggerimento = () => {
    if (!suggerimento) return
    suggerimento.dataset.visto = 'si'
    clearTimeout(riproponi)
    if (!haTrascinato) {
      riproponi = setTimeout(() => { suggerimento.dataset.visto = 'no' }, RIPROPONI_DOPO)
    }
  }

  tela.addEventListener('pointerdown', (e) => {
    trascina = true
    xPrec = e.clientX
    xGiu = e.clientX
    tela.setPointerCapture?.(e.pointerId)
  })
  tela.addEventListener('pointermove', (e) => {
    if (!trascina) return
    /**
     * IL SEGNO E' NEGATIVO, e non e' una preferenza.
     *
     * Trascinando la mano a destra la nave andava a SINISTRA. Misurato invece
     * che discusso: si proietta la punta di prua sullo schermo prima e dopo un
     * trascinamento di 260 px verso destra, e la x passava da 314 a 41.
     *
     * La convenzione che tutti si aspettano e' che l'oggetto SEGUA la mano,
     * come se lo si spingesse. Qui la camera orbita attorno alla nave, e far
     * seguire l'oggetto vuol dire far girare la camera dalla parte opposta:
     * quindi il delta del puntatore entra in `ruota` col segno cambiato.
     */
    ruota(-(e.clientX - xPrec) * 0.006)
    xPrec = e.clientX
    // il gesto conta come tale solo dopo che la mano si e' mossa davvero
    if (Math.abs(e.clientX - xGiu) > SPOSTAMENTO_VERO) {
      haTrascinato = true
      nascondiSuggerimento()
    }
  })
  const finisci = () => { trascina = false }
  tela.addEventListener('pointerup', finisci)
  tela.addEventListener('pointercancel', finisci)

  /**
   * --- IL PRIMO MOVIMENTO LO FA IL SITO
   *
   * "Nessuno legge «drag to rotate»; tutti vedono una cosa muoversi e capiscono
   * che si puo' muovere." E' lo stesso principio che `docs/13` si era gia' dato
   * per il passaggio di consegne, applicato all'unica affordance che non ha un
   * comando: la rotazione chiede di toccare una TELA, e perde il confronto con
   * quattro oggetti che hanno dei bordi.
   *
   * Non e' un'animazione decorativa: e' una dimostrazione. Pochi gradi in la' e
   * indietro, una volta sola, e solo se non si e' gia' trascinato -- chi ha gia'
   * capito non va istruito. E si interrompe al primo gesto, perche' contendere
   * il controllo a chi lo ha appena preso e' il difetto opposto.
   */
  function mostraCheSiGira (gradi = 12, secondi = 2.4) {
    if (haTrascinato) return
    const A = gradi * Math.PI / 180
    let t0 = null
    const passo = (ora) => {
      if (haTrascinato) return                 // la mano ha preso il comando
      if (t0 === null) t0 = ora
      const u = Math.min(1, (ora - t0) / (secondi * 1000))
      // un giro d'andata e ritorno: seno intero, quindi finisce dove ha iniziato
      const voluto = Math.sin(u * Math.PI * 2) * A
      ruota(voluto - mostraCheSiGira.fatto)
      mostraCheSiGira.fatto = voluto
      if (u < 1) requestAnimationFrame(passo)
    }
    mostraCheSiGira.fatto = 0
    requestAnimationFrame(passo)
  }
  collegaPuntoDiVista.mostra = mostraCheSiGira

  tela.tabIndex = 0
  tela.setAttribute('role', 'application')
  tela.setAttribute('aria-label', 'Section view. Left and right arrow keys rotate the point of view.')
  tela.addEventListener('keydown', (e) => {
    // scambiate insieme al segno del trascinamento: la freccia destra deve
    // mandare la nave a destra, come la mano. Lasciarle com'erano avrebbe
    // dato due comandi che girano in verso opposto, che e' peggio di uno
    // sbagliato.
    if (e.key === 'ArrowLeft') { ruota(0.12); haTrascinato = true; nascondiSuggerimento(); e.preventDefault() }
    if (e.key === 'ArrowRight') { ruota(-0.12); haTrascinato = true; nascondiSuggerimento(); e.preventDefault() }
  })
}
