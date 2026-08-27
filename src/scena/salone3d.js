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
  /**
   * 1 · IL MARE — la stessa clip, dietro, e a ruotare e' l'IMMAGINE.
   *
   * ─── PERCHE' NON RUOTA IL PIANO
   *
   * Prima ruotava la mesh, ingrandita 1,55 volte per coprire gli angoli che
   * l'inclinazione scopre, e una maschera le ritagliava il riquadro della
   * stanza. Funziona finche' la maschera e' ferma — ma la maschera e' una
   * texture del piano, e **ruota col piano**. Inclinandosi, il rettangolo
   * visibile si inclina con lui e i suoi angoli escono dal riquadro della
   * fotografia: oltre il bordo destro comparivano il divano e la donna una
   * seconda volta.
   *
   * L'ho corretto due volte dalla parte sbagliata — prima accorciando la
   * maschera, poi facendola seguire alla scala — e tutte e due le volte e'
   * tornato appena la camera si muoveva. La domanda giusta non era «quanto
   * grande dev'essere il ritaglio», era **chi deve ruotare**.
   *
   * Nel DOM a ritagliare era l'apertura, che sta ferma. Qui l'equivalente e'
   * far ruotare la TEXTURE dentro un piano fermo: `map.rotation` con il centro
   * sull'orizzonte. Il piano ha esattamente la misura della stanza, non ha
   * bisogno di nessuna maschera, e non puo' uscire dal riquadro perche' il
   * riquadro E' il piano.
   *
   * L'ingrandimento di 1,55 resta, ma nello spazio della texture: `repeat`
   * minore di uno mostra una porzione piu' piccola della clip, ingrandita.
   * E' quello che copre gli angoli quando l'immagine gira.
   */
  const mareTex = tex(vCalma)
  mareTex.center.set(0.5, 1 - ORIZZONTE)   // il PIVOT E' L'ORIZZONTE
  mareTex.repeat.set(1 / INGRANDIMENTO, 1 / INGRANDIMENTO)

  const mare = new Mesh(geo, new MeshBasicMaterial({ map: mareTex, toneMapped: false }))
  mare.position.z = -PROFONDITA
  gruppo.add(mare)

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
   * piu' lontano. La distanza VERA la sa solo chi muove la camera — passargli
   * quella d'inquadratura, che cambia solo al ridimensionamento, lasciava il
   * fondale ingrandito com'era da seduti anche dopo essere usciti.
   *
   * E crescendo non puo' piu' uscire dal riquadro, perche' il riquadro e' il
   * piano stesso: e' il guadagno vero di aver tolto la maschera.
   */
  function profondita (distanzaCamera) {
    const k = (distanzaCamera + PROFONDITA) / Math.max(0.01, distanzaCamera)
    mare.scale.setScalar(k)
  }

  function aggiorna (gradi, dt) {
    const a = Math.abs(gradi)
    if (a > ACCENDE) calmoDa = 0
    else if (a < CALMO) calmoDa += dt
    const vuole = calmoDa > CONVINCE ? 0 : (a > ACCENDE ? 1 : q)
    q += (vuole - q) * Math.min(1, dt * VELOCITA)
    tesa.material.opacity = q

    // Il mare si inclina, la stanza no: da dentro, il proprio salotto sta
    // fermo. E a inclinarsi e' l'IMMAGINE dentro il piano, non il piano —
    // altrimenti gli angoli escono dal riquadro. Vedi la nota sopra.
    mareTex.rotation = MathUtils.degToRad(-gradi)
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
