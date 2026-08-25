import {
  Scene, PerspectiveCamera, WebGLRenderer, HemisphereLight, DirectionalLight,
  PointLight, Clock, MathUtils, SRGBColorSpace, NoToneMapping, Plane, Vector3
} from 'three'
import { costruisciNave } from './nave.js'
import { costruisciAcqua } from './acqua.js'

const RAGGIO = 11.5
const RAGGIO_SEZIONE = 7.4
const AZIMUT_MAX = 0.92

/** Dove sta il meccanismo: e' li' che la camera va a finire. */
const MIRA_MECCANISMO = 1.15

/** Quota del piano di sezione: fuori dallo scafo, poi dentro. */
const Z_FUORI = 1.62
const Z_DENTRO = 0.18

/**
 * Taratura delle luci dopo il porto a three 0.185.
 *
 * Il prototipo girava su r12x, prima che l'illuminazione fisica diventasse
 * l'unica modalita' e prima della gestione del colore. Gli stessi numeri, qui,
 * darebbero una scena piu' scura: i valori sono stati rimoltiplicati e poi
 * corretti GUARDANDO il provino, non ricopiati.
 */
const LUCI = {
  emisfero: 2.7,
  sole: 3.6,
  controluce: 1.4,
  fondale: 12
}

export function creaScena (contenitore) {
  const scena = new Scene()

  /**
   * Il fulcro di tutto il sito: la camera sta a quota zero e guarda
   * l'orizzonte. Cosi' la linea di galleggiamento cade SEMPRE a meta'
   * schermo esatta, e il fondo CSS puo' spaccarsi al 50% combaciando col
   * disegno senza che niente vada sincronizzato.
   */
  const camera = new PerspectiveCamera(34, 1, 0.1, 120)
  camera.position.set(0, 0, RAGGIO)
  camera.lookAt(0, 0, 0)

  let render
  try {
    render = new WebGLRenderer({ antialias: true, alpha: true })
  } catch (e) {
    return null
  }
  if (!render.getContext()) return null

  render.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  // Il piano di sezione taglia solo i materiali del guscio: quello che resta
  // e' il meccanismo, cioe' la tesi del sito.
  render.localClippingEnabled = true
  render.outputColorSpace = SRGBColorSpace
  // Nessun tone mapping: i colori devono restare gli stessi del foglio di
  // stile, o la giunzione fra fondo CSS e canvas si vede.
  render.toneMapping = NoToneMapping
  contenitore.appendChild(render.domElement)

  scena.add(new HemisphereLight(0xe9e5dd, 0x071a1d, LUCI.emisfero))
  const sole = new DirectionalLight(0xfff6e4, LUCI.sole)
  sole.position.set(4.5, 7, 6); scena.add(sole)
  const controluce = new DirectionalLight(0x9fd8cc, LUCI.controluce)
  controluce.position.set(-6, 2.5, -4); scena.add(controluce)
  const fondale = new PointLight(0x3fbfa8, LUCI.fondale, 22, 1.2)
  fondale.position.set(0, -5.5, 2.5); scena.add(fondale)

  const { nave, pinne, guscio, tappo } = costruisciNave()
  scena.add(nave)

  /**
   * Il piano tiene i punti con `normale · p + costante > 0`. Con normale
   * (0,0,-1) tiene `z < costante`: abbassando la costante si toglie la meta'
   * vicina alla camera. Lo scafo va da z = -1,5 a z = +1,5.
   */
  const pianoSezione = new Plane(new Vector3(0, 0, -1), Z_FUORI)
  for (const m of guscio) m.material.clippingPlanes = [pianoSezione]
  const acqua = costruisciAcqua()
  scena.add(acqua.gruppo)

  const orologio = new Clock()
  let t = 0
  let frame = 0
  // Di fronte l'estrusione si legge come una lastra piatta: si parte gia'
  // ruotati, cosi' il volume e' leggibile prima di qualunque interazione.
  let azimut = 0.34
  let azimutTarget = 0.34
  let spaccato = 0

  /**
   * MOMENTO 3 — il taglio entra nel prodotto.
   *
   * `p` va da 0 (scafo intero) a 1 (sezione aperta sul meccanismo). Guidato
   * dallo scorrimento, quindi dall'utente: non parte da solo, e con movimento
   * ridotto resta comunque disponibile perche' e' una risposta a un gesto, non
   * un'animazione autonoma.
   *
   * La camera **resta a quota zero** anche mentre si avvicina: e' il vincolo
   * che tiene la linea di galleggiamento sempre a meta' schermo, e quindi la
   * giunzione col fondo CSS. Cambia solo dove guarda, in orizzontale. Il
   * meccanismo sta a y = -0,34, cioe' compare appena SOTTO la linea — che e'
   * esattamente la tesi: la parte che vale sta sotto.
   */
  function impostaSpaccato (p) {
    spaccato = MathUtils.clamp(p, 0, 1)
    pianoSezione.constant = MathUtils.lerp(Z_FUORI, Z_DENTRO, spaccato)
    tappo.position.z = pianoSezione.constant
    tappo.visible = spaccato > 0.002
    tappo.material.opacity = Math.min(1, spaccato * 5)
  }

  /**
   * DIFETTO CORRETTO — misurato, non dedotto.
   *
   * `setSize(w, h)` scrive anche lo stile in linea del canvas, e lo stile in
   * linea batte il foglio di stile: bastava che la misura arrivasse un
   * fotogramma prima che `100svh` si assestasse e il canvas restava alto 730
   * dentro un contenitore da 678. Il centro del canvas finiva 26px sotto il
   * centro della sezione, e siccome la linea di galleggiamento cade sempre
   * al centro del canvas, **il taglio 3D non combaciava piu' con lo stacco
   * del fondo CSS**. Si vedeva come una cucitura, ed e' esattamente il difetto
   * che rovina l'unica idea del sito.
   *
   * Il terzo argomento `false` dice a three di non toccare lo stile: la
   * dimensione visibile resta del CSS, quella del buffer resta di three.
   * E si osserva il CONTENITORE, non la finestra: la sezione puo' cambiare
   * altezza senza che la finestra si ridimensioni (barra dell'indirizzo dei
   * telefoni, comparsa di una barra di scorrimento).
   */
  function ridimensiona () {
    const w = contenitore.clientWidth
    const h = contenitore.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    render.setSize(w, h, false)
  }

  new ResizeObserver(ridimensiona).observe(contenitore)

  function ruota (delta) {
    azimutTarget = MathUtils.clamp(azimutTarget + delta, -AZIMUT_MAX, AZIMUT_MAX)
  }

  function disegna (sim) {
    const dt = Math.min(orologio.getDelta(), 0.05)
    frame++
    if (!sim.S.ridotto) t += dt

    sim.passo(dt, t)

    // Non si seziona un oggetto in movimento: mentre il piano entra, il
    // rollio si acquieta. Non e' un vezzo — un disegno tecnico e' fermo, ed e'
    // il registro in cui il taglio riporta il pezzo.
    nave.rotation.z = MathUtils.degToRad(sim.S.rollio) * (1 - spaccato)
    // L'angolo e' opposto fra dritta e sinistra: due pinne con la stessa
    // incidenza spingerebbero dalla stessa parte invece di raddrizzare.
    for (const p of pinne) p.aggiorna(sim.S.pinna * p.lato)

    if (!sim.S.ridotto) acqua.anima(t, sim.S.mare, frame)

    azimut += (azimutTarget - azimut) * Math.min(1, dt * 5)
    const raggio = MathUtils.lerp(RAGGIO, RAGGIO_SEZIONE, spaccato)
    const mira = MathUtils.lerp(0, MIRA_MECCANISMO, spaccato)
    camera.position.x = mira + Math.sin(azimut) * raggio
    camera.position.z = Math.cos(azimut) * raggio
    camera.position.y = 0
    camera.lookAt(mira, 0, 0)

    render.render(scena, camera)
  }

  return { render, camera, ridimensiona, ruota, disegna, impostaSpaccato, tela: render.domElement }
}
