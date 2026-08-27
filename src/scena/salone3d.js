import {
  Group, Mesh, PlaneGeometry, MeshBasicMaterial, VideoTexture,
  TextureLoader, SRGBColorSpace, MathUtils, CanvasTexture
} from 'three'

/**
 * IL SALONE DENTRO LA SCENA — la stessa nave, senza montaggio.
 *
 * ─── IL RILIEVO CHE CURA, e non era una rifinitura
 *
 * Fino a qui il salone e la dimostrazione erano **due sistemi**: due moduli
 * caricati separatamente, due contenitori, e — con `?sagoma=1` — perfino due
 * `WebGLRenderer`. La continuita' costruita a colpi di CSS li cuciva bene, ma
 * cucire non e' unire: bastava un import lento, un rapporto d'aspetto diverso
 * o un fotogramma perso perche' il passaggio tornasse a leggersi come «nuova
 * scena». Il committente l'ha detto due volte — «non devono essere scene
 * separate», «la continuazione della stessa esperienza» — e una revisione
 * esterna l'ha chiamato difetto bloccante. Aveva ragione tutti e due.
 *
 * Qui il salone diventa geometria della scena della nave: stessi renderer,
 * stessa camera, stesse coordinate, stesso mare, stesso integratore. Non c'e'
 * piu' un passaggio da nascondere perche' non c'e' piu' un secondo posto.
 *
 * ─── E' ANCORA UNA FOTOGRAFIA, E VA DETTO
 *
 * Il salone resta il filmato girato: due piani con la stessa clip, uno
 * mascherato. Non e' una stanza modellata, e non deve esserlo — la regola del
 * sito e' che cio' che e' diagramma si costruisce e cio' che e' fotografia si
 * guarda. La differenza rispetto a prima non e' la natura del materiale: e'
 * che adesso quel materiale sta **dentro il volume della tuga**, alla sua
 * quota vera, e la camera ci passa davanti invece di essere teletrasportata.
 *
 * ─── PERCHE' DUE PIANI E NON UNO
 *
 * E' la forma a cui il capitolo e' arrivato buttando via tutto il resto, e la
 * ragione sta per esteso in `composito.js`. In breve: una clip sola, disegnata
 * due volte.
 *
 *   dietro  la clip INTERA, che ruota col rollio: e' il mare visto dal vetro;
 *   davanti la stessa clip con la maschera del finestrone, ferma: e' la
 *           stanza, e sta ferma perche' chi guarda e' seduto dentro.
 *
 * Ruota il mare, non la stanza. E' la correzione §5.1: da dentro una barca il
 * proprio salotto non si inclina, si inclina l'orizzonte. Se ruotasse la
 * stanza, si vedrebbe una fotografia storta.
 *
 * E il PIVOT sta sull'orizzonte, non al centro: ruotando attorno al centro
 * l'orizzonte si alzerebbe e abbasserebbe mentre gira, invece di limitarsi a
 * inclinarsi.
 *
 * ─── LE DUE SORGENTI SONO LO STESSO FILE
 *
 * Quindi al bordo del vetro grana, colore e artefatti di compressione
 * coincidono per costruzione, non per taratura. Le due decodifiche partono
 * pero' a istanti diversi, e vanno riallineate — non solo all'avvio: un video
 * in pausa e ripreso deriva.
 */

const CALMA = 'filmati/salone-largo.mp4'
const TESA = 'filmati/salone-teso.mp4'
const MASCHERA = 'salone/finestrone.png'

/** Quanto sta piu' indietro il mare rispetto alla stanza, in unita' di scena. */
const PROFONDITA = 0.45

/** Il mare copre gli angoli che l'inclinazione scopre. Vedi `composito.js`. */
const INGRANDIMENTO = 1.55
/** Quanto in alto sta l'orizzonte dentro la clip: 45,9% dall'alto. */
const ORIZZONTE = 0.459

/** Sopra questo rollio ci si irrigidisce; sotto CALMO si torna comodi. */
const ACCENDE = 5.0
const CALMO = 2.0
const CONVINCE = 1.6
const VELOCITA = 8

const RIALLINEA = 1 / 24
const OGNI_MS = 2000

function video (src) {
  const v = document.createElement('video')
  v.src = src
  v.muted = true
  v.loop = true
  v.playsInline = true
  v.preload = 'auto'
  v.crossOrigin = 'anonymous'
  // Fuori dal documento non basta in tutti i browser: un video staccato puo'
  // non ricevere fotogrammi. Sta nel documento, invisibile e fuori dal flusso.
  v.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px'
  document.body.appendChild(v)
  return v
}

function tex (v) {
  const t = new VideoTexture(v)
  t.colorSpace = SRGBColorSpace
  return t
}

/**
 * @param {string} base   `import.meta.env.BASE_URL`
 * @param {object} tuga   dove sta la tuga: `{ z, quota, largh, alt }` in unita'
 *                        di scena, calcolate da `nave.js` sulle ordinate vere.
 */
export function creaSalone3D (base, tuga) {
  const gruppo = new Group()
  gruppo.name = 'SALONE3D'

  /**
   * LA MISURA VIENE DALLA TUGA, non da un numero scelto guardando lo schermo.
   * L'altezza utile e' quella del ponte meno il parapetto e la fascia alta;
   * la larghezza discende dal rapporto della clip. Se domani la tuga cambia,
   * il salone la segue invece di scollarsi.
   */
  const alt = tuga.alt * 0.86
  const larg = alt * 16 / 10
  if (larg > tuga.largh * 0.96) {
    // Non si taglia in silenzio: se non ci sta, il capitolo va ripensato.
    console.warn('[nautica] il salone non sta nella tuga: ' +
                 `servono ${larg.toFixed(2)} su ${tuga.largh.toFixed(2)} disponibili`)
  }

  const vCalma = video(base + CALMA)
  const vTesa = video(base + TESA)
  const maschera = new TextureLoader().load(base + MASCHERA)

  const geo = new PlaneGeometry(larg, alt)

  /** 1 · IL MARE — la clip intera, ingrandita, che ruota sull'orizzonte. */
  const perno = new Group()
  /**
   * IL MARE INGRANDITO VA RITAGLIATO AL RIQUADRO DELLA STANZA.
   *
   * E' grande 1,55 volte perche' ruotando di dodici gradi un rettangolo
   * scopre gli angoli. Ma quel di piu' non deve VEDERSI: fuori dal riquadro
   * della fotografia comparivano una seconda volta il divano e la donna, come
   * un fotogramma incollato accanto a se stesso.
   *
   * Nel DOM lo risolveva `overflow:hidden` sull'apertura. Qui non c'e' nessun
   * riquadro che ritagli, quindi il ritaglio si mette nel materiale: una
   * maschera bianca al centro esattamente quanto la stanza, nera intorno.
   * Ruotando, e' la MASCHERA a girare col piano — che e' giusto: e' la finestra
   * a essere ferma rispetto alla stanza, non rispetto al mondo.
   */
  const LATO_MASCHERA = 256
  const tela = document.createElement('canvas')
  tela.width = tela.height = LATO_MASCHERA
  const cx = tela.getContext('2d')
  cx.fillStyle = '#000'
  cx.fillRect(0, 0, LATO_MASCHERA, LATO_MASCHERA)
  const dentro = LATO_MASCHERA / INGRANDIMENTO
  cx.fillStyle = '#fff'
  cx.fillRect((LATO_MASCHERA - dentro) / 2, (LATO_MASCHERA - dentro) / 2, dentro, dentro)
  const ritaglio = new CanvasTexture(tela)

  const mare = new Mesh(
    new PlaneGeometry(larg * INGRANDIMENTO, alt * INGRANDIMENTO),
    new MeshBasicMaterial({
      map: tex(vCalma), alphaMap: ritaglio, transparent: true, toneMapped: false
    })
  )
  // il piano nasce centrato: lo si sposta perche' il PERNO cada sull'orizzonte
  mare.position.y = (ORIZZONTE - 0.5) * alt * INGRANDIMENTO
  perno.add(mare)
  perno.position.y = (0.5 - ORIZZONTE) * alt
  /**
   * ─── IL MARE STA PIU' INDIETRO, E QUESTO E' L'UNICO MODO DI NON LEGGERE
   *     COME UNO SCHERMO
   *
   * Rilievo di una revisione, ed e' il piu' difficile da smentire: due piani
   * alla stessa quota sono una fotografia, non una stanza. Quando la camera si
   * muove, tutto si muove insieme — ed e' esattamente cio' che il cervello usa
   * per riconoscere una superficie piatta.
   *
   * Una finestra vera ha una profondita': il vetro e' a mezzo metro, il mare a
   * chilometri. Basta pochissimo perche' la differenza si veda — e' la
   * parallasse, non la distanza, a raccontarla. Qui il mare arretra di 0,45
   * unita' rispetto alla stanza: muovendosi, la cornice del finestrino scorre
   * sopra l'orizzonte invece di restarci incollata.
   *
   * PIU' INDIETRO NON SI PUO'. La tuga e' larga 1,83 unita', e un piano
   * arretrato deve crescere in proporzione per riempire lo stesso finestrino:
   * a 0,45 la parte visibile misura 1,73 e ci sta, a 0,6 sfonda le murate e si
   * vedrebbe spuntare dai fianchi della nave.
   *
   * La CRESCITA si calcola a ogni fotogramma sulla distanza vera della camera,
   * perche' quella distanza cambia col rapporto dello schermo: fissarla
   * andrebbe bene sulla scrivania e sbaglierebbe del 15% sul telefono.
   */
  perno.position.z = -PROFONDITA
  gruppo.add(perno)

  /** 2 · LA STANZA — stessa clip, il vetro bucato dalla maschera, ferma. */
  const stanza = new Mesh(geo, new MeshBasicMaterial({
    map: tex(vCalma), alphaMap: maschera, transparent: true, toneMapped: false
  }))
  stanza.position.z = 0.004
  gruppo.add(stanza)

  /** 3 · LA POSA PUNTELLATA, sopra la calma quando la stanza rolla davvero. */
  const tesa = new Mesh(geo, new MeshBasicMaterial({
    map: tex(vTesa), alphaMap: maschera, transparent: true, opacity: 0, toneMapped: false
  }))
  tesa.position.z = 0.008
  gruppo.add(tesa)

  gruppo.position.set(0, tuga.quota, tuga.z)
  // guarda verso poppa: e' da li' che la camera arriva e da li' se ne va
  gruppo.rotation.y = 0

  let q = 0            // quanto e' puntellata la posa
  let calmoDa = 0
  let ultimo = 0

  /**
   * Il riallineamento non e' solo all'avvio: due decodifiche indipendenti
   * derivano, e una pausa le sfasa. Attraverso il vetro si vedrebbe un mare
   * di qualche fotogramma diverso da quello della clip.
   */
  let sincro = 0

  function riproduci () {
    vCalma.play().catch(() => {})
    vTesa.play().catch(() => {})
    if (!sincro) {
      sincro = setInterval(() => {
        if (vCalma.readyState > 1 &&
            Math.abs(vCalma.currentTime - vTesa.currentTime % (vTesa.duration || 1)) > RIALLINEA) {
          try { vTesa.currentTime = vCalma.currentTime % (vTesa.duration || 1) } catch {}
        }
      }, OGNI_MS)
    }
  }

  /**
   * ─── FERMARE IL CICLO DI DISEGNO NON FERMA I DECODIFICATORI
   *
   * Segnalato da una revisione, ed e' vero e concreto: due video 1280x720 che
   * continuano a decodificare fuori schermo costano batteria, memoria e
   * temperatura su un telefono — e il ciclo di disegno che si spegne quando la
   * sezione esce di campo non li tocca. `riproduci` c'era e `ferma` non veniva
   * chiamato da nessuno; l'intervallo di riallineamento non veniva mai fermato.
   *
   * Anche l'intervallo va spento: un `setInterval` su un video in pausa scrive
   * `currentTime` all'infinito su qualcosa che non avanza.
   */
  function ferma () {
    vCalma.pause()
    vTesa.pause()
    if (sincro) { clearInterval(sincro); sincro = 0 }
  }

  /** Rilascia tutto: texture, video, sorgenti. Per chi smonta la scena. */
  function smonta () {
    ferma()
    for (const m of [mare, stanza, tesa]) {
      m.material.map?.dispose()
      m.material.alphaMap?.dispose()
      m.material.dispose()
      m.geometry.dispose()
    }
    for (const v of [vCalma, vTesa]) { v.removeAttribute('src'); v.load(); v.remove() }
  }

  /**
   * @param {number} gradi  il rollio VERO, dallo stesso integratore della nave
   * @param {number} dt     secondi
   */
  /**
   * Il mare arretrato deve riempire lo stesso finestrino: cresce di quanto e'
   * piu' lontano. La distanza vera la sa solo chi muove la camera.
   */
  function profondita (distanzaCamera) {
    const k = (distanzaCamera + PROFONDITA) / Math.max(0.01, distanzaCamera)
    perno.scale.setScalar(k)
  }

  function aggiorna (gradi, dt) {
    const a = Math.abs(gradi)
    if (a > ACCENDE) calmoDa = 0
    else if (a < CALMO) calmoDa += dt
    const vuole = calmoDa > CONVINCE ? 0 : (a > ACCENDE ? 1 : q)
    q += (vuole - q) * Math.min(1, dt * VELOCITA)
    tesa.material.opacity = q

    // il mare si inclina, la stanza no: da dentro, il proprio salotto sta fermo
    perno.rotation.z = MathUtils.degToRad(-gradi)
    ultimo = gradi
  }

  /** Quanto e' visibile il capitolo. A zero non si disegna affatto. */
  function mostra (v) {
    const o = MathUtils.clamp(v, 0, 1)
    gruppo.visible = o > 0.002
    mare.material.opacity = o
    stanza.material.opacity = o
    mare.material.transparent = o < 0.999
    tesa.material.opacity = q * o
  }

  return {
    gruppo, aggiorna, mostra, riproduci, ferma, smonta, profondita,
    /** La larghezza vera del piano: la camera ci calcola la propria distanza. */
    largo: larg,
    alto: alt,
    get rollio () { return ultimo }
  }
}
