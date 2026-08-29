/**
 * L'ESPERIMENTO INCOMPIUTO — un promemoria, non un cancello.
 *
 * ─── IL PROBLEMA CHE RISOLVE, detto per intero
 *
 * L'atto due e' l'unica cosa che il sito CHIEDE. Tutto il resto si guarda; qui
 * si spegne qualcosa e si osserva cosa viene meno. Ma il sito e' guidato dallo
 * scorrimento, e lo scorrimento non aspetta: chi toglie la propulsione e poi
 * continua a scendere si porta dietro una nave che sta rallentando dentro un
 * capitolo che non la mostra piu'. Arriva al finale — le due persone che si
 * rilassano — senza aver mai visto la causa per cui si rilassano.
 *
 * ─── E LA SOLUZIONE SBAGLIATA, scartata per prima
 *
 * Bloccare lo scorrimento finche' l'esperimento non e' finito. E' la cosa che
 * viene in mente e che qualche sito premiato fa davvero, ed e' un errore:
 * trasforma una scoperta in un pedaggio, e la prima reazione di chi non ha
 * capito cosa gli si chiede e' cercare il modo di uscire. Un sito che
 * trattiene ha gia' perso l'argomento.
 *
 * Quindi: **niente blocco**. Si scorre come sempre. Cambia una cosa sola, e
 * sta tutta in questa frase — *la pagina si ricorda che hai cominciato*. Lo
 * stato non si azzera (e non si azzerava gia' prima: sopra e sotto la linea
 * d'acqua sono lo stesso integratore, `stato.js`), e un richiamo compatto in
 * un angolo dice che c'e' qualcosa di aperto e da che parte si torna.
 *
 * ─── LE TRE REGOLE CHE NON SI TOCCANO
 *
 * 1. NON PARTE DA SOLO. Compare solo se l'utente ha spento la propulsione con
 *    le proprie mani. Un richiamo che comparisse senza che nessuno abbia fatto
 *    niente starebbe annunciando un esperimento che non e' cominciato — cioe'
 *    sarebbe un'istruzione travestita.
 *
 * 2. NON COMPARE SUL MECCANISMO. Se la dimostrazione e' sullo schermo, la
 *    conseguenza si vede da sola e un'etichetta sarebbe rumore sopra la cosa
 *    che deve essere guardata.
 *
 * 3. SE NE VA QUANDO L'ESPERIMENTO SI CHIUDE, e ci sono due modi di chiuderlo:
 *    accendere il giroscopio (la soluzione) o riaccendere la propulsione (la
 *    rinuncia). Tutti e due sono decisioni dell'utente, e tutte e due valgono.
 *    Non c'e' un esito «giusto» che il sito aspetta.
 *
 * ─── PERCHE' NON STA IN `nudge.js`
 *
 * Un nudge dice cosa si PUO' fare e sparisce da solo dopo qualche secondo.
 * Questo dice cosa e' RIMASTO APERTO e resta finche' lo e'. Sono due contratti
 * diversi — uno effimero e uno persistente — e infilarli nello stesso ciclo
 * avrebbe voluto dire dare al nudge un'eccezione che ne rompe la prima regola
 * («uno alla volta, e poi sparisce»).
 */

/**
 * L'ultimo stato della simulazione, spinto da chi ce l'ha. Stessa architettura
 * di `nudge.js` e per la stessa ragione: questo modulo sta nel percorso critico
 * e non puo' importare ne' three ne' la simulazione. Finche' nessuno lo spinge
 * resta `null`, e il richiamo non compare mai — che e' il comportamento giusto,
 * perche' senza scena non c'e' nessun esperimento in corso.
 */
let ultimoStato = null
export const segnalaStato = (S) => { ultimoStato = S }

export function creaEsperimento () {
  const sezione = document.querySelector('#dimostrazione')
  if (!sezione) return

  const b = document.createElement('button')
  b.type = 'button'
  b.className = 'esperimento'
  b.dataset.visibile = 'no'
  /**
   * `hidden` all'inizio e non solo trasparente: finche' non e' cominciato
   * niente, questo bottone non deve esistere per la tastiera ne' per un lettore
   * di schermo. Un comando raggiungibile col tabulatore che parla di un
   * esperimento mai iniziato e' peggio di nessun comando.
   */
  b.hidden = true
  b.innerHTML = '<span class="esperimento__punto" aria-hidden="true"></span>' +
                '<span class="esperimento__testo">Experiment incomplete</span>' +
                '<span class="esperimento__torna">Back to the mechanism</span>'
  document.body.appendChild(b)

  /**
   * Il ritorno e' uno SCORRIMENTO, non un salto: la continuita' della scena e'
   * la conquista piu' costosa di questo repo e un `scrollTo` istantaneo la
   * romperebbe piu' di quanto la rompa un video. `behavior` lo decide la
   * preferenza dell'utente, non io.
   */
  const ridotto = matchMedia('(prefers-reduced-motion: reduce)')
  b.addEventListener('click', () => {
    sezione.scrollIntoView({
      behavior: ridotto.matches ? 'auto' : 'smooth',
      block: 'start'
    })
  })

  /**
   * ─── COMINCIATO significa «l'ha fatto lui», e si registra qui
   *
   * Non basta leggere `!S.propulsione`: il sito potrebbe arrivarci in altri
   * modi, e comunque uno stato non dice CHI l'ha prodotto. Si guarda il
   * passaggio da acceso a spento mentre la pagina e' viva, che e' il fatto
   * osservabile piu' vicino a «l'utente ha spento».
   */
  let cominciato = false
  let eraAccesa = true

  /** La dimostrazione e' sullo schermo? Se si', il richiamo tace (regola 2). */
  let inCampo = true
  new IntersectionObserver(([v]) => { inCampo = v.isIntersecting },
    { threshold: 0.05 }).observe(sezione)

  function giro () {
    const S = ultimoStato
    if (!S) return

    if (eraAccesa && !S.propulsione) cominciato = true
    eraAccesa = S.propulsione

    /* chiuso in tutti e due i modi: la soluzione e la rinuncia */
    if (S.giroscopio || (cominciato && S.propulsione)) cominciato = false

    const mostra = cominciato && !inCampo
    if (mostra === (b.dataset.visibile === 'si')) return
    b.dataset.visibile = mostra ? 'si' : 'no'
    /* `hidden` segue la visibilita' con un ritardo solo in uscita, cosi' la
       dissolvenza ha il tempo di finire prima che l'elemento sparisca */
    if (mostra) b.hidden = false
    else setTimeout(() => { if (b.dataset.visibile === 'no') b.hidden = true }, 400)
  }

  /**
   * Quattro volte al secondo, come i nudge e per la stessa ragione: e' un
   * confronto fra due booleani, non ha bisogno del ritmo del disegno.
   */
  setInterval(giro, 250)
}
