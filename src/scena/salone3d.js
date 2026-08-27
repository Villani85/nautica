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

  /**
   * ─── QUI C'ERA IL MARE, ED ERA UN FILMATO
   *
   * Dietro la stanza stava la stessa clip, ingrandita, che ruotava sul proprio
   * orizzonte. Funzionava, e non serviva a niente: era un mare GIRATO, e un
   * mare girato non risponde a chi guarda.
   *
   * Il committente l'ha detto in tre frasi, e la terza e' la tesi del sito:
   * *«questi devono avere la possibilita' di muoversi, altrimenti avrei fatto
   * un filmato»* · *«cioe' sono io che regolo il mare»* · *«deve far vedere
   * qualcosa che non vedrebbe mai, come il funzionamento»*.
   *
   * Adesso il vetro e' un BUCO -- lo apre `alphaMap` -- e dietro c'e' l'acqua
   * vera della scena: la stessa superficie che si vede da fuori, mossa dallo
   * stesso stato del mare, con lo stesso orizzonte. Girando la manopola,
   * cambia anche cio' che si vede dal finestrone.
   *
   * ─── E LA ROTAZIONE LA FA LA FISICA, NON PIU' IL CODICE
   *
   * La regola resta quella di `docs/09`: **la stanza rolla, l'orizzonte no.**
   * Ma non serve piu' ottenerla ruotando delle immagini, e non serve piu' la
   * contro-rotazione che teneva il gruppo livellato:
   *
   *   la camera del sito e' LIVELLATA -- e' l'invariante di tutto il sito --
   *   quindi il mare del mondo, che e' orizzontale, disegna un orizzonte
   *   orizzontale nel quadro, sempre;
   *
   *   il gruppo del salone e' figlio della nave, quindi se lo si lascia stare
   *   rolla insieme a lei.
   *
   * Stanza inclinata, orizzonte piatto, senza una riga che lo imponga. Il
   * codice che c'era qui non descriveva la scena: la simulava a mano.
   *
   * ─── COSA SI PERDE, E VA DETTO
   *
   * L'acqua procedurale e' piu' povera del mare girato. E' un baratto
   * consapevole: un mare piu' brutto che risponde batte un mare piu' bello che
   * non risponde, su un sito la cui tesi e' che il gesto dell'utente cambia le
   * cose. E chiude anche il rilievo che il sito avesse due mari diversi, uno
   * dentro e uno fuori.
   */

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
    for (const m of [stanza, tesa]) {
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
  function aggiorna (gradi, dt) {
    const a = Math.abs(gradi)
    if (a > ACCENDE) calmoDa = 0
    else if (a < CALMO) calmoDa += dt
    const vuole = calmoDa > CONVINCE ? 0 : (a > ACCENDE ? 1 : q)
    q += (vuole - q) * Math.min(1, dt * VELOCITA)
    tesa.material.opacity = q

    // La stanza non ha piu' bisogno che qualcuno la inclini: rolla perche' e'
    // figlia della nave, e l'orizzonte resta piatto perche' la camera e'
    // livellata e il mare e' quello del mondo. Vedi la nota in testa.
    ultimo = gradi
  }

  /** Quanto e' visibile il capitolo. A zero non si disegna affatto. */
  function mostra (v) {
    const o = MathUtils.clamp(v, 0, 1)
    gruppo.visible = o > 0.002
    stanza.material.opacity = o
    tesa.material.opacity = q * o
  }

  return {
    gruppo, aggiorna, mostra, riproduci, ferma, smonta,
    /** La larghezza vera del piano: la camera ci calcola la propria distanza. */
    largo: larg,
    alto: alt,
    get rollio () { return ultimo }
  }
}
