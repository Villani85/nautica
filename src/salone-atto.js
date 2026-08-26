import { creaComposito } from './scena/composito.js'
import { sim, alCambioDiStato, statoCambiato, avanza } from './stato.js'

/**
 * IL CAPITOLO DEL SALONE — il controllore, tenuto volutamente magro.
 *
 * Non ha una regia a battute come la dimostrazione, e non e' una svista: qui
 * non c'e' una sequenza da raccontare. C'e' **una cosa sola da guardare**, e
 * l'unica variabile e' se il sistema e' acceso. Aggiungere battute qui
 * diluirebbe l'unico momento che il sito ha per far sentire qualcosa invece che
 * spiegarlo.
 *
 * LO STATO ARRIVA DA `stato.js`, condiviso con la dimostrazione. Chi accende
 * l'interruttore due schermate sopra trova la stanza gia' calma quando arriva
 * qui — ed e' obbligatorio che sia cosi': sopra e sotto la linea sono lo stesso
 * integratore, e se i due capitoli si contraddicessero cadrebbe l'argomento.
 */
export async function avviaSalone () {
  const contenitore = document.querySelector('#scena-salone')
  const palco = document.querySelector('.palco--salone')
  if (!contenitore) return

  /**
   * `?sagoma=1` apre la SCENA 3D invece del composito.
   *
   * Serve a `npm run sagome`: le fotografie si generano a partire da un
   * fotogramma renderizzato, e quel fotogramma lo produce la scena. Resta in
   * produzione come gli altri interruttori — il giorno che i mobili cambiano,
   * si rigenera la sagoma e si rifanno le foto con la stessa struttura.
   *
   * E' anche la ragione per cui `scena/salone.js` non e' codice morto: e' la
   * sorgente degli asset, non un capitolo abbandonato.
   */
  const scena = location.search.includes('sagoma=1')
    ? (await import('./scena/salone.js')).creaSalone(contenitore)
    : creaComposito(contenitore, import.meta.env.BASE_URL)

  if (!scena) { document.querySelector('#salone')?.remove(); return }
  scena.ridimensiona?.()

  /**
   * L'INTERRUTTORE DI QUESTO CAPITOLO — lo stesso stato, un secondo comando.
   *
   * Provando il capitolo e' saltato fuori un difetto di progetto, non di
   * codice: per spegnere il sistema bisognava risalire alla dimostrazione e
   * tornare giu'. Il momento che questo capitolo esiste per mostrare — la
   * stanza che si inclina **mentre la guardi** — non poteva proprio accadere.
   * Un comando che c'e' ma sta due schermate piu' su e' un comando che non c'e'.
   */
  const tasto = document.querySelector('#stab-salone')
  const rifletti = () => {
    tasto?.setAttribute('aria-pressed', String(sim.S.stab))
    palco.dataset.spento = sim.S.stab ? 'no' : 'si'
    tasto?.setAttribute('aria-pressed', String(sim.S.stab))
  }
  tasto?.addEventListener('click', () => {
    sim.S.stab = !sim.S.stab
    sim.azzeraPicchi()
    rifletti()
    statoCambiato()
    sveglia()
  })
  rifletti()

  let inCorso = false
  /**
   * IL TEMPO LO FA AVANZARE CHI DISEGNA, e vale anche qui.
   *
   * La riga stava dentro la scena 3D. Sostituendola col composito e' sparita, e
   * il capitolo e' tornato immobile: la fotografia mostrava una stanza dritta
   * mentre la didascalia diceva che rollava. **E' la seconda volta che questo
   * difetto ricompare in un posto nuovo**, ed e' sempre lo stesso: chi legge
   * uno stato deve anche farlo avanzare, se e' l'unico sveglio.
   *
   * La marca del fotogramma impedisce il doppio passo quando i due capitoli
   * sono a schermo insieme.
   */
  let precedente = 0
  const passo = (marca) => {
    const dt = precedente ? Math.min((marca - precedente) / 1000, 0.05) : 1 / 60
    precedente = marca
    avanza(dt, marca)

    if (scena.disegna) scena.disegna(sim, marca)
    else scena.aggiorna(sim.S.rollio)
    palco.dataset.spento = sim.S.stab ? 'no' : 'si'
    tasto?.setAttribute('aria-pressed', String(sim.S.stab))
    /**
     * L'ANGOLO VERO, ESPOSTO SUL PALCO. Non e' per l'utente — non si vede — e'
     * per chi misura.
     *
     * Provando il capitolo leggevo l'angolo dalla lettura della dimostrazione e
     * ottenevo 0,6 gradi col sistema spento, che e' assurdo. Quella lettura era
     * **ferma**: il ciclo della dimostrazione dorme mentre si guarda qui, e il
     * numero nel DOM era quello dell'ultimo fotogramma disegnato mezz'ora
     * prima. Un metro fermo che restituisce un numero plausibile.
     *
     * Il cancello del capitolo si appoggia a questo: la stanza deve inclinarsi
     * da spento, restare ferma da acceso, e l'orizzonte non deve ruotare mai.
     */
    palco.dataset.rollio = sim.S.rollio.toFixed(2)
  }

  /**
   * Il ciclo dorme quando il capitolo non e' a schermo. Due contesti WebGL
   * accesi insieme sono due volte il lavoro per la scheda grafica, e uno dei
   * due sta disegnando qualcosa che nessuno guarda.
   */
  const oss = new IntersectionObserver(([v]) => {
    /**
     * Il composito non ha un renderer: si muove con un ciclo di fotogrammi
     * normale. Il ciclo dorme quando il capitolo non e' a schermo — un video e
     * due immagini che si dissolvono per nessuno costano comunque lavoro alla
     * scheda grafica, e il mare continuerebbe a scorrere.
     */
    if (v.isIntersecting && !inCorso) {
      inCorso = true
      if (scena.render) scena.render.setAnimationLoop(passo)
      else { const giro = (m) => { if (!inCorso) return; passo(m); requestAnimationFrame(giro) }; requestAnimationFrame(giro) }
      scena.mare?.play?.().catch(() => {})
    } else if (!v.isIntersecting && inCorso) {
      inCorso = false
      scena.render?.setAnimationLoop?.(null)
      scena.mare?.pause?.()
    }
  }, { rootMargin: '10% 0px' })
  oss.observe(document.querySelector('#salone'))

  /**
   * A movimento ridotto non gira nessun ciclo: si ridisegna quando qualcosa
   * cambia davvero. Ma serve comunque un fotogramma all'apertura, o resta nero.
   */
  const sveglia = () => {
    let n = 0
    const uno = (marca) => { passo(marca); if (++n < 30) requestAnimationFrame(uno) }
    requestAnimationFrame(uno)
  }
  sveglia()

  // Se l'interruttore viene toccato mentre questo capitolo dorme, al risveglio
  // deve trovare lo stato giusto invece di quello di prima.
  alCambioDiStato(() => { if (sim.S.ridotto || !inCorso) sveglia() })

  addEventListener('resize', () => { scena.ridimensiona?.(); if (sim.S.ridotto) sveglia() })
}
