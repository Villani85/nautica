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
    // stessa strada dell'altro interruttore: la riscalatura sta li'
    sim.cambiaStab(!sim.S.stab)
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
    else scena.aggiorna(sim.S.rollio, dt)
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
    if (scena.posa) palco.dataset.posa = scena.posa().toFixed(3)
  }

  /**
   * ─── LA DISCESA: FRA I DUE CAPITOLI NON CI SONO DUE SCENE
   *
   * Richiesta esplicita del committente, e ha ragione: «da qui quando faro'
   * scroll e' come se andassi giu' nella barca», «deve essere come se fosse la
   * continuazione della stessa esperienza».
   *
   * Prima non lo era. Il salone e' un palco appiccicato che non segue lo
   * scorrimento: finiva di colpo, e la dimostrazione cominciava altrove. Due
   * scene, e il taglio si sentiva tutto.
   *
   * Cosa lo cuce, e costa una riga di trasformazione:
   *
   *   1. negli ultimi metri della sezione l'apertura **sale e si avvicina**.
   *      Non e' la stanza che se ne va: e' chi guarda che sprofonda, e la
   *      differenza si legge perche' la finestra passa SOPRA LA TESTA invece di
   *      dissolversi;
   *   2. la dimostrazione apre con lo scafo che **emerge dal basso** (D39, ed
   *      era gia' cosi'). Vista da fuori, e' esattamente la stessa discesa:
   *      la nave che sale e' chi guarda che scende;
   *   3. la linea dell'orizzonte resta a meta' schermo in tutti e due, perche'
   *      e' l'unica idea meccanica del sito. E' lei il perno attorno a cui la
   *      continuita' regge: due inquadrature diverse sullo stesso posto.
   *
   * PERCHE' NON PORTARE LA CAMERA AL FINESTRINO: gia' provato, e sta scritto
   * in `stile.css` — a 19,5 unita' il finestrino e' una fessura, e
   * avvicinandosi l'inquadratura diventa un panino di fasce orizzontali. Tre
   * rendering buttati. Non era taratura, era la premessa.
   *
   * La soglia e' una FRAZIONE della sezione, non un numero di pixel: sotto
   * `soglie-scroll-mai-in-pixel` sta scritto perche', e vale anche qui — la
   * sezione e' alta 220svh e su un telefono quello e' un altro numero.
   */
  const sezione = document.querySelector('#salone')
  const apertura = document.querySelector('.apertura')
  const didascalia = document.querySelector('.salone__didascalia')
  const INIZIO_DISCESA = 0.70      // frazione della sezione: prima non succede niente
  const AFFONDO = 96               // vh di risalita a fine corsa: si sta ancora
                                 // muovendo quando la sezione si stacca, cosi' non
                                 // resta uno schermo vuoto fra i due capitoli
  const AVVICINA = 1.16            // quanto cresce mentre le si passa sotto

  function seguiDiscesa () {
    if (!sezione || !apertura) return
    const r = sezione.getBoundingClientRect()
    // quanto e' scorsa la sezione: 0 quando il palco si incolla, 1 quando si
    // stacca. `r.height - innerHeight` e' la corsa utile dello sticky.
    const corsa = r.height - innerHeight
    const p = corsa > 0 ? Math.min(1, Math.max(0, -r.top / corsa)) : 0
    const q = Math.max(0, (p - INIZIO_DISCESA) / (1 - INIZIO_DISCESA))
    // accelera: sprofondare e' una caduta, non una traslazione uniforme
    const e = q * q
    apertura.style.setProperty('--discesa', (e * AFFONDO).toFixed(2) + 'vh')
    apertura.style.setProperty('--avvicina', (1 + (AVVICINA - 1) * e).toFixed(4))
    // la didascalia scende con la stanza e si spegne prima: se restasse,
    // finirebbe sopra la carta coi colori pensati per l'acqua
    if (didascalia) {
      didascalia.style.setProperty('--discesa', (e * AFFONDO).toFixed(2) + 'vh')
      didascalia.style.setProperty('--resta', Math.max(0, 1 - q * 2.2).toFixed(3))
    }
  }

  addEventListener('scroll', seguiDiscesa, { passive: true })
  addEventListener('resize', seguiDiscesa)
  seguiDiscesa()

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
