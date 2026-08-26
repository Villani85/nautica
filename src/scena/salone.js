import {
  Scene, PerspectiveCamera, WebGLRenderer, Group, Mesh, BoxGeometry, PlaneGeometry,
  MeshStandardMaterial, MeshBasicMaterial, VideoTexture, HemisphereLight,
  DirectionalLight, RectAreaLight, Clock, MathUtils, SRGBColorSpace,
  ACESFilmicToneMapping, PMREMGenerator
} from 'three'
import { creaAmbiente } from './ambiente.js'
import { avanza } from '../stato.js'

/**
 * IL SALONE — la meta' emotiva, e il capitolo che mancava.
 *
 * *Sopra la gente sta comoda; sotto, venti macchine lavorano perche' ci stia.*
 * Il sito ha costruito benissimo la seconda meta' e non ha mai mostrato la
 * prima: senza questa, e' un ottimo disegno tecnico.
 *
 * ─── L'INVERSIONE CHE E' TUTTO L'ARGOMENTO
 *
 * Tre strati, e la differenza fra il primo e il secondo E' la tesi:
 *
 *   1. **la stanza** — divani, tavolo, due persone. Ruota col rollio vivo.
 *   2. **l'orizzonte** fuori dal finestrino — sta in coordinate MONDO, e NON
 *      ruota. Non e' un effetto: e' la conseguenza di dove sta il gruppo.
 *   3. **la cornice** dell'apertura — e' la pagina, non si muove mai.
 *
 * Accendendo il sistema la stanza si raddrizza e l'orizzonte resta dov'era.
 * Spegnendolo, la stanza si inclina CONTRO un orizzonte immobile, e i bicchieri
 * scivolano. E' questo che un filmato generativo non sa fare — non ha nessun
 * posto dove mettere quella differenza — ed e' la ragione per cui questa scena
 * esiste in tempo reale invece che come video.
 *
 * ─── PERCHE' UNA SCENA A PARTE, E NON LA CAMERA DELLA NAVE
 *
 * Provato e misurato, e la conclusione e' stata dura: portare la camera della
 * dimostrazione al finestrino **non funziona**. A 19,5 unita' il finestrino e'
 * una fessura alta pochi pixel; avvicinandosi, l'inquadratura diventa un panino
 * di fasce orizzontali e la meta' bassa smette di leggersi come acqua. Tre
 * rendering, due parametri battuti su tre valori: sempre da buttare.
 *
 * Non era taratura, era la premessa. La grammatica di quel capitolo e' *un
 * oggetto contro un orizzonte netto*, e ogni avvicinamento la distrugge. Il
 * salone ha bisogno di una scena sua, dentro un'apertura sua — che e' anche la
 * regola che il progetto si e' gia' dato: **cio' che e' fotografia si vede
 * attraverso un'apertura**.
 */

/** Le proporzioni della stanza, in metri: e' un salone da 40 m, non una stanza. */
const LARG = 4.6      // da murata a murata
const PROF = 3.4      // avanti-indietro
const ALT = 2.15      // cielo del salone

/** Il finestrino: una fascia continua, come su uno yacht vero. */
const FIN_BASSO = 0.95
const FIN_ALTO = 1.72

export function creaSalone (contenitore) {
  const scena = new Scene()

  let render
  try {
    render = new WebGLRenderer({ antialias: true, alpha: true })
  } catch (e) { return null }
  if (!render.getContext()) return null

  render.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  render.outputColorSpace = SRGBColorSpace
  /**
   * QUI IL TONE MAPPING CI VA, e nella dimostrazione no.
   *
   * Non e' un'incoerenza: e' D33, **due registri di resa**. Il capitolo della
   * dimostrazione e' un disegno tecnico e i suoi colori devono combaciare al
   * pixel col fondo CSS — li' una curva tonale spezzerebbe la giunzione, che e'
   * l'unica idea meccanica del sito. Questo capitolo e' una FOTOGRAFIA vista
   * attraverso un'apertura: qui la curva serve, perche' senza rolloff delle
   * alte luci una superficie lucida sembra un disegno colorato.
   *
   * La cornice dell'apertura e' cio' che rende legittime le due scelte insieme:
   * dentro la cornice vale un registro, fuori l'altro, e il bordo lo dichiara.
   */
  render.toneMapping = ACESFilmicToneMapping
  render.toneMappingExposure = 1.0
  contenitore.appendChild(render.domElement)

  /**
   * NON SI GUARDA DA DENTRO: SI GUARDA UN TAGLIO. Due tentativi buttati prima
   * di capirlo.
   *
   * Con la camera dentro la stanza si vedeva una parete e un po' di mare: a un
   * metro e mezzo dai divani, larghi quattro metri e sessanta, quelli finivano
   * fuori inquadratura ai due lati. Alzare il campo visivo non aiuta — deforma
   * e basta. E il riferimento, guardato bene, non e' affatto una camera dentro
   * una stanza: e' un **taglio**, con la quarta paratia tolta, visto da fuori in
   * prospetto. Per questo si vedono tutti e due i divani di profilo.
   *
   * Che e' poi la regola generativa di questo sito, applicata a un interno
   * invece che a uno scafo. Ci ho messo due prove a riconoscerla.
   */
  const camera = new PerspectiveCamera(38, 1, 0.05, 60)

  scena.environment = creaAmbiente(render, PMREMGenerator, 1.0)

  /**
   * LA STANZA — figlia di un gruppo che rolla. Tutto quello che appartiene alla
   * nave sta qui dentro; tutto quello che appartiene al mondo, fuori.
   */
  const stanza = new Group()
  scena.add(stanza)

  const tessuto = new MeshStandardMaterial({ color: 0xd8d1c2, roughness: 0.92, metalness: 0.0 })
  const legno = new MeshStandardMaterial({ color: 0xb9ae9a, roughness: 0.55, metalness: 0.05 })
  const guscio = new MeshStandardMaterial({ color: 0xe3ddd0, roughness: 0.78, metalness: 0.02 })
  const scuro = new MeshStandardMaterial({ color: 0x1b1f21, roughness: 0.42, metalness: 0.6 })

  const scatola = (w, h, d, m, x, y, z) => {
    const e = new Mesh(new BoxGeometry(w, h, d), m)
    e.position.set(x, y, z)
    stanza.add(e)
    return e
  }

  /**
   * IL GUSCIO E' PIU' GRANDE DELL'INQUADRATURA, ed e' una necessita' non
   * un'abbondanza.
   *
   * Ruotando di dieci gradi gli spigoli della stanza spazzano fuori dal
   * fotogramma e, se il guscio finisse dove finisce la vista, si aprirebbero
   * spicchi di fondo ai quattro angoli dell'apertura. Visto succedere: la
   * stanza inclinata scopriva il bordo sinistro e l'illusione della finestra
   * cadeva di colpo.
   *
   * Si allarga il guscio invece di stringere l'inquadratura, perche' stringere
   * costerebbe i divani — e sono loro il soggetto.
   */
  const OLTRE = 1.9   // quanto il guscio sborda oltre cio' che si vede
  scatola(LARG * OLTRE, 0.06, PROF * 1.4, legno, 0, -0.03, 0)
  scatola(LARG * OLTRE, 0.06, PROF * 1.4, guscio, 0, ALT, 0)
  scatola(0.08, ALT * 2.4, PROF * 1.4, guscio, -LARG / 2 * OLTRE, ALT / 2, 0)
  scatola(0.08, ALT * 2.4, PROF * 1.4, guscio, LARG / 2 * OLTRE, ALT / 2, 0)
  // la murata davanti, spezzata dal finestrino: parapetto sotto, fascia sopra
  scatola(LARG * OLTRE, FIN_BASSO, 0.08, guscio, 0, FIN_BASSO / 2, -PROF / 2)
  scatola(LARG * OLTRE, ALT * 1.6 - FIN_ALTO, 0.08, guscio, 0, (ALT * 1.6 + FIN_ALTO) / 2, -PROF / 2)
  // i montanti: senza, l'apertura legge come una fessura invece che come vetrata
  for (const x of [-LARG / 2 + 0.05, -0.75, 0.75, LARG / 2 - 0.05]) {
    scatola(0.07, FIN_ALTO - FIN_BASSO, 0.09, scuro, x, (FIN_ALTO + FIN_BASSO) / 2, -PROF / 2)
  }

  // i due divani, di profilo, uno di fronte all'altro — come nel riferimento
  for (const s of [-1, 1]) {
    scatola(1.05, 0.42, 2.0, tessuto, s * (LARG / 2 - 0.62), 0.21, 0.1)
    scatola(1.05, 0.55, 0.22, tessuto, s * (LARG / 2 - 0.16), 0.62, 0.1)
  }
  const tavolo = scatola(1.15, 0.05, 0.72, legno, 0, 0.52, 0.1)
  scatola(0.12, 0.5, 0.12, scuro, 0, 0.27, 0.1)

  /**
   * I BICCHIERI — il dettaglio che porta l'argomento.
   *
   * Nel riferimento sono due calici pieni, dritti, mentre fuori c'e' mare forza
   * cinque. **E' quella l'immagine**: non un numero, due bicchieri che non si
   * rovesciano. Qui non sono decorazione — sono l'unico elemento che REAGISCE
   * al rollio invece di subirlo, e li si vede scivolare quando il sistema e'
   * spento.
   */
  const bicchieri = []
  for (const dx of [-0.26, 0.26]) {
    const g = new Group()
    g.position.set(dx, 0.545, 0.1)
    const coppa = new Mesh(new BoxGeometry(0.07, 0.11, 0.07),
      new MeshStandardMaterial({ color: 0xe9e5dd, roughness: 0.05, metalness: 0.0 }))
    coppa.position.y = 0.09
    g.add(coppa)
    g.add(new Mesh(new BoxGeometry(0.02, 0.07, 0.02), new MeshStandardMaterial({ color: 0xe9e5dd, roughness: 0.05 })))
    stanza.add(g)
    bicchieri.push({ g, x0: dx, scivolo: 0 })
  }

  /**
   * LE DUE PERSONE — sedute una di fronte all'altra, di profilo.
   *
   * SONO UN SEGNAPOSTO E VA DETTO. Sono volumi, non figure: testa, busto,
   * gambe. Da questa distanza e a questa scala reggono la lettura — «qui ci
   * sono due persone sedute» — e non reggeranno un fotogramma ravvicinato.
   * Vanno sostituite con figure vere; il posto e la scala sono gia' questi, e
   * cambia solo cosa ci si mette dentro.
   *
   * Non sono decorazione: sono il soggetto. Senza di loro questo capitolo e'
   * un salotto vuoto che si inclina, e non c'e' nessuno per cui valga la pena
   * che una macchina lavori.
   */
  const pelle = new MeshStandardMaterial({ color: 0x8a7a6c, roughness: 0.86 })
  const stoffa = new MeshStandardMaterial({ color: 0x2f3a40, roughness: 0.9 })
  const camicia = new MeshStandardMaterial({ color: 0xe6e1d6, roughness: 0.88 })

  const persone = []
  for (const s of [-1, 1]) {
    const px = s * (LARG / 2 - 0.86)
    const p = new Group()
    p.position.set(px, 0, 0)
    stanza.add(p)

    const dentro = (w, h, d, m, x, y, z) => {
      const e = new Mesh(new BoxGeometry(w, h, d), m)
      e.position.set(x, y, z); p.add(e); return e
    }
    const abito = s < 0 ? camicia : stoffa
    /**
     * Busto e testa vanno ALTI abbastanza da staccare dallo schienale: seduti
     * troppo bassi diventavano un monolito scuro con un cubo sopra, e non si
     * leggeva ne' una persona ne' una posa. Il collo — un pezzo di due
     * centimetri — e' quello che separa la testa dalle spalle: senza, il
     * profilo e' quello di un armadio.
     */
    const busto = dentro(0.36, 0.52, 0.28, abito, 0, 0.80, 0.04)
    busto.rotation.x = 0.12
    dentro(0.13, 0.09, 0.13, pelle, 0, 1.09, 0.01)          // collo
    const testa = dentro(0.19, 0.23, 0.21, pelle, 0, 1.23, -0.01)
    testa.rotation.y = s * 0.35                              // si guardano
    const gambe = dentro(0.32, 0.20, 0.66, stoffa, -s * 0.26, 0.52, 0.20)
    gambe.rotation.z = s * 0.12

    /**
     * IL BRACCIO CHE CERCA APPOGGIO — il gesto, ed e' l'unico che serve.
     *
     * A riposo sta sullo schienale: e' la posa di chi sta comodo. Quando la
     * stanza si inclina abbastanza, scende verso il tavolo e ci si appoggia.
     * Un solo gesto leggibile basta a far sentire il disagio; senza, due
     * persone servono solo a dare la scala.
     *
     * Il perno sta alla spalla, non al centro del braccio: ruotando attorno al
     * proprio centro il braccio si stacca dal corpo, e la cosa si nota subito
     * anche senza saperla nominare.
     */
    const spalla = new Group()
    spalla.position.set(s * 0.18, 1.00, 0.08)
    p.add(spalla)
    const braccio = new Mesh(new BoxGeometry(0.11, 0.10, 0.42), abito)
    braccio.position.set(0, 0, -0.19)   // si estende IN AVANTI dal perno
    spalla.add(braccio)
    spalla.rotation.x = -0.24            // a riposo: appoggiato allo schienale

    persone.push({ p, spalla, lato: s, appoggio: 0, ritardo: 0 })
  }

  /**
   * IL FUORIBORDO — fuori dalla stanza, in coordinate MONDO.
   *
   * E' l'unica riga che conta di tutto il file: sta in `scena`, non in
   * `stanza`. Da questo, e solo da questo, discende che l'orizzonte non ruota
   * quando la nave rolla. Non c'e' codice che lo mantiene fermo: e' fermo
   * perche' non e' figlio di niente che si muova.
   */
  /**
   * IL MARE FUORI DAL FINESTRINO — un piano, non il cilindro della nave.
   *
   * `costruisciFuoribordo` avvolge la sua tessitura attorno a un CILINDRO,
   * perche' nella dimostrazione si guarda fuori da finestrini diversi mentre la
   * nave gira. Qui la finestra e' una fascia dritta e la camera e' ferma:
   * riusarlo stirava il filmato in una sbavatura grigia — 7,3:1 di fascia
   * schiacciati su un cilindro da 1,3:1. Visto, non previsto.
   *
   * E QUESTA RIGA E' TUTTO L'ARGOMENTO: il piano sta in `scena`, non in
   * `stanza`. Non ruota quando la nave rolla, e non perche' qualcuno lo tenga
   * fermo — perche' non e' figlio di niente che si muova. La stanza si inclina
   * contro un orizzonte che non si inclina con lei.
   *
   * IL FILMATO, e perche' proprio qui. Dentro l'apertura vale il registro
   * fotografico, e questo strato **non deve reagire a niente**: il mare non sa
   * se lo stabilizzatore e' acceso. E' l'unico posto del sito dove un filmato
   * non toglie interattivita', perche' non ce n'era.
   * Dove invece sarebbe sbagliato e' la STANZA: quella deve inclinarsi quando
   * spegni, ed e' la ragione per cui il sito esiste.
   *
   * IL VINCOLO DI RIPRESA (`docs/09`): orizzonte a META' FOTOGRAMMA ESATTA, o
   * nell'inquadratura ce ne sono due. Nel clip generato cadeva alla riga 353 di
   * 720 — misurato col gradiente verticale, non a occhio: il mio occhio diceva
   * 33% e sbagliava, perche' il gradiente piu' forte era il bordo di una PRUA
   * che il modello aveva aggiunto nonostante il prompt negativo la escludesse.
   * Ritagliato in una fascia centrata sull'orizzonte: 64 KB, e l'orizzonte
   * cade al **50,0%** della fascia, verificato rimisurandolo dopo il ritaglio.
   *
   * E IL PRIMO CLIP ERA SBAGLIATO, anche se sembrava bello. Frangeva come
   * un'onda su un fondale — shore break — invece di essere mare lungo che
   * incontra una barca, e aveva una prua in basso che il negativo escludeva.
   * Due cose che il prompt aveva chiesto di NON avere. La cura non e' stata
   * insistere sul negativo ma nominare la FISICA: «deep open ocean, hundreds of
   * miles from any coast, long-period swell that lifts and passes, never
   * curling, whitecaps torn sideways by wind». Chiedere la causa invece
   * dell'effetto.
   */
  const mare = new Mesh(
    new PlaneGeometry(LARG * 2.6, (LARG * 2.6) * 142 / 1024),
    new MeshBasicMaterial({ color: 0xffffff, toneMapped: false })
  )
  /**
   * L'ORIZZONTE STA IN ALTO NEL FINESTRINO, non a meta'.
   *
   * Con il piano centrato all'altezza dell'occhio si vedeva meta' cielo e meta'
   * acqua, che e' geometricamente corretto per uno sguardo perfettamente
   * orizzontale — ma da un salone che guarda un mare forza quattro **l'acqua
   * domina**, e il cielo e' una striscia. Alzando l'orizzonte il finestrino si
   * riempie di mare, che e' cio' che si deve sentire: fuori sta succedendo
   * qualcosa, qui dentro no.
   */
  mare.position.set(0, 1.62, -PROF / 2 - 2.6)
  scena.add(mare)

  const filmato = document.createElement('video')
  filmato.src = import.meta.env.BASE_URL + 'filmati/mare-fuoribordo.mp4'
  filmato.loop = true; filmato.muted = true; filmato.playsInline = true
  filmato.addEventListener('loadeddata', () => {
    const t = new VideoTexture(filmato)
    t.colorSpace = SRGBColorSpace
    mare.material.map = t
    mare.material.needsUpdate = true
    filmato.play().catch(() => {
      /* Riproduzione automatica rifiutata: resta il piano chiaro, che legge
         come cielo. Il capitolo perde in resa e non si rompe. */
    })
  }, { once: true })
  filmato.load()

  scena.add(new HemisphereLight(0xf3eee2, 0x2a2622, 1.5))
  const finestra = new DirectionalLight(0xfff4e2, 2.1)
  finestra.position.set(0.4, 1.8, -4); stanza.add(finestra)
  /**
   * Una sorgente LARGA e BASSA davanti al finestrino: e' quella che disegna il
   * riflesso lungo sul tavolo e sui bicchieri. Una puntiforme darebbe una
   * specularita' grande come un pixel, cioe' invisibile.
   */
  const fascia = new RectAreaLight(0xfff8ec, 3.2, LARG * 0.9, FIN_ALTO - FIN_BASSO)
  fascia.position.set(0, (FIN_ALTO + FIN_BASSO) / 2, -PROF / 2 + 0.12)
  fascia.lookAt(0, 0.6, 1)
  stanza.add(fascia)

  /**
   * DUE INTERRUTTORI DI PRODUZIONE, e restano in produzione come gli altri.
   *
   * Servono a far produrre alla scena stessa i due ingressi della pipeline
   * fotografica, invece di ritagliarli a mano:
   *
   *   `?maschera=1`  — tutto nero tranne il mare: e' la maschera dei
   *                    finestrini, e siccome esce dalla STESSA scena combacia
   *                    al pixel con la sagoma. Ritagliata a mano non
   *                    combacerebbe mai, e lo scarto si vedrebbe come un alone
   *                    attorno ai montanti.
   *   `?rollio=N`    — inchioda l'inclinazione a N gradi. La sagoma inclinata
   *                    va catturata a un angolo SCELTO: aspettando un picco
   *                    della simulazione si ottiene ogni volta un angolo
   *                    diverso, e due foto da dissolvere devono venire da
   *                    angoli noti.
   *
   * Costano cinque righe e tolgono di mezzo due lavori a mano che si
   * sbaglierebbero in silenzio.
   */
  const parametri = new URLSearchParams(location.search)
  const MASCHERA = parametri.has('maschera')
  const ROLLIO_FISSO = parametri.has('rollio') ? Number(parametri.get('rollio')) : null

  if (MASCHERA) {
    scena.environment = null
    stanza.traverse(o => {
      if (o.isMesh) o.material = new MeshBasicMaterial({ color: 0x000000 })
    })
    mare.material = new MeshBasicMaterial({ color: 0xffffff })
    for (const l of [...scena.children].filter(o => o.isLight)) scena.remove(l)
  }

  const orologio = new Clock()
  let t = 0
  let frame = 0

  function ridimensiona () {
    const w = contenitore.clientWidth
    const h = contenitore.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    render.setSize(w, h, false)
  }
  new ResizeObserver(ridimensiona).observe(contenitore)

  function disegna (sim, marca) {
    const dt = Math.min(orologio.getDelta(), 0.05)
    frame++
    if (!sim.S.ridotto) t += dt

    // Avanza la simulazione se non l'ha gia' fatto la dimostrazione in questo
    // fotogramma: quando si e' qui, quella dorme, e senza questa riga la stanza
    // resterebbe immobile mentre la didascalia dice che rolla.
    avanza(dt, marca)

    /**
     * LA STANZA RUOTA, e ruota **attorno alla linea di galleggiamento**, non
     * attorno al pavimento del salone. Il centro di rollio di una nave sta sotto
     * la coperta: far ruotare la stanza attorno a se stessa la farebbe
     * ondeggiare come una scatola su un perno, invece che salire e scendere da
     * un lato come fa un ponte vero. Sono due movimenti diversi e si vede.
     */
    const rad = MathUtils.degToRad(ROLLIO_FISSO ?? sim.S.rollio)
    stanza.rotation.z = rad
    /**
     * LA TRASLAZIONE E' PICCOLA, e la prima versione era sbagliata di molto.
     *
     * Il centro di rollio di una nave sta sotto la coperta, quindi il salone
     * non ruota su se stesso: si sposta anche di lato. Vero — ma tradotto in
     * numeri l'avevo fatto valere mezzo metro a dodici gradi, e la stanza
     * **usciva dall'apertura** lasciando vedere il nero ai bordi. Visto nel
     * provino, non previsto.
     *
     * Il difetto vero e' che l'apertura e' una cornice FISSA: quello che ci
     * scivola dentro esce di scena. Un accenno basta a dire che il perno sta
     * altrove; il resto lo dice gia' la rotazione contro un bordo che non si
     * muove.
     */
    stanza.position.y = -Math.abs(rad) * 0.10
    stanza.position.x = -rad * 0.55

    /**
     * ─── QUI STA LA DIFFERENZA FRA CORRETTO E SENTITO.
     *
     * Far ruotare stanza, mobili e persone come un blocco unico e'
     * geometricamente giusto e **emotivamente nullo**: cambia solo l'angolo
     * rispetto all'orizzonte, e dentro la stanza non succede niente. Le persone
     * sembrano avvitate ai divani e nessuno pare accorgersi di niente.
     *
     * Il rollio si sente dalle CONSEGUENZE. Tre, e bastano:
     *   1. i bicchieri restano verticali mentre il tavolo ruota sotto di loro;
     *   2. i corpi si inclinano IN RITARDO rispetto alla stanza;
     *   3. un braccio cerca appoggio sul tavolo.
     */

    /**
     * 1 · I BICCHIERI RESTANO DRITTI. La gravita' non ruota con la nave, e un
     * bicchiere pieno lo dice meglio di qualunque numero: contro-ruotano
     * dell'angolo esatto della stanza, quindi in coordinate mondo sono
     * verticali. Ed e' anche l'immagine del riferimento — mare forza cinque
     * fuori, e i calici dritti.
     */
    for (const b of bicchieri) {
      const spinta = Math.sin(rad) * 0.42
      b.scivolo += (spinta - b.scivolo) * Math.min(1, dt * 2.4)
      b.g.position.x = b.x0 + b.scivolo
      b.g.rotation.z = -rad
    }

    for (const u of persone) {
      /**
       * 2 · IL CORPO ARRIVA DOPO. Un corpo seduto non e' avvitato al ponte: si
       * inclina con un ritardo e di meno. Si contro-ruota di una frazione
       * dell'angolo, inseguendo con ritardo — la differenza fra i due valori e'
       * cio' che si legge come "sta subendo il movimento", invece che
       * "appartiene alla stanza".
       */
      u.ritardo += (rad - u.ritardo) * Math.min(1, dt * 3.2)
      u.p.rotation.z = -(rad - u.ritardo) * 0.55

      /**
       * 3 · LA MANO CERCA IL TAVOLO. Sopra i tre gradi comincia a scendere; a
       * sei e' appoggiata. Sotto, torna sullo schienale — e ci mette piu' tempo
       * a tornare che ad andare, come fa una persona che non si fida ancora.
       */
      const gradi = Math.abs(ROLLIO_FISSO ?? sim.S.rollio)
      const serve = Math.min(1, Math.max(0, (gradi - 3) / 3))
      const vel = ROLLIO_FISSO !== null ? 60 : (serve > u.appoggio ? 3.0 : 0.9)
      u.appoggio += (serve - u.appoggio) * Math.min(1, dt * vel)
      u.spalla.rotation.x = -0.24 + u.appoggio * 0.62
      u.spalla.rotation.y = u.lato * u.appoggio * 0.42
    }


    // La camera e' seduta: leggerissimo respiro, e nient'altro. Una camera che
    // si muove molto in una stanza chiusa da la nausea e ruba l'attenzione
    // proprio a cio' che deve essere guardato.
    /**
     * L'INQUADRATURA, e il difetto che ha imposto questa forma.
     *
     * Prima la camera guardava in ORIZZONTALE, e sembrava giusto: e' cosi' che
     * si guarda un finestrino. Ma dentro l'apertura il velo sommerso copre il
     * 28% piu' basso — e con lo sguardo orizzontale tavolo, divani e bicchieri
     * cadevano tutti li' sotto. Il capitolo mostrava una parete e un po' di
     * mare: **il velo si mangiava esattamente il contenuto che deve reggere il
     * capitolo**.
     *
     * Quindi la camera guarda leggermente in BASSO. Le persone e il tavolo
     * salgono nel settantadue per cento alto, il finestrino resta sopra di
     * loro, e sotto la linea passa il pavimento — che e' anche giusto cosi':
     * la parte sommersa deve mostrare quello che sta sotto, non nascondere
     * quello che sta sopra.
     */
    const respiro = sim.S.ridotto ? 0 : Math.sin(t * 0.45) * 0.008
    camera.position.set(0, 1.18 + respiro, PROF / 2 + 3.1)
    camera.lookAt(0, 0.98, 0)

    render.render(scena, camera)
  }

  return { render, disegna, ridimensiona, tela: render.domElement }
}
