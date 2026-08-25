import {
  Scene, PerspectiveCamera, WebGLRenderer, HemisphereLight, DirectionalLight,
  PointLight, Clock, MathUtils, SRGBColorSpace, NoToneMapping, Plane, Vector3
} from 'three'
import { costruisciNave, Z_PINNE } from './nave.js'
import { POPPA_Z } from '../scafo/ordinate.js'
import { costruisciAcqua } from './acqua.js'
import { costruisciFuoribordo } from './fuoribordo.js'

const RAGGIO = 19.5
const RAGGIO_SEZIONE = 7.2
const AZIMUT_MAX = 0.92

/** Dove sta il meccanismo: e' li' che la camera va a finire. */
const MIRA_MECCANISMO = 1.15

/**
 * Quota del piano di sezione LUNGO la nave. Parte da poppa, cioe' fuori da
 * tutto, e arriva poco a poppavia degli stabilizzatori: la fetta che si toglie
 * scopre il locale macchine.
 */
const Z_FUORI = POPPA_Z + 0.4
const Z_DENTRO = Z_PINNE + 0.55

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
  /**
   * DIFETTO TROVATO GUARDANDO, E ISOLATO CON UNA PROVA.
   *
   * Questa luce serviva a dare fondo all'acqua profonda. Con lo scafo
   * sezionato pero' si e' trovata DENTRO la carena, e a intensita' 12 con
   * portata 22 ne illuminava l'interno di verde: una cavita' accesa dove
   * doveva esserci buio.
   *
   * Isolata togliendo l'acqua (`?senzaAcqua=1`): il verde restava, quindi non
   * era il mare. Ora e' piu' debole e piu' in basso, e la portata non arriva
   * piu' all'interno dello scafo.
   */
  fondale: 3.2
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
  const fondale = new PointLight(0x3fbfa8, LUCI.fondale, 14, 1.6)
  fondale.position.set(0, -9.5, 2.5); scena.add(fondale)

  const { nave, pinne, guscio, tappo, spostaTappo } = costruisciNave()
  scena.add(nave)

  /**
   * Il piano tiene i punti con `normale · p + costante > 0`. Con normale
   * (0,0,-1) tiene `z < costante`: abbassando la costante si toglie la meta'
   * vicina alla camera. Lo scafo va da z = -1,5 a z = +1,5.
   */
  const pianoSezione = new Plane(new Vector3(0, 0, -1), Z_FUORI)
  for (const m of guscio) m.material.clippingPlanes = [pianoSezione]
  /**
   * IL FUORIBORDO sta in coordinate MONDO — non e' figlio della nave — ma
   * fisicamente dentro la tuga, cosi' si vede solo attraverso il finestrino.
   * E' quello che fa arrivare il rollio gratis: la stanza ruota, l'orizzonte
   * no, e la finestra gli passa davanti.
   */
  const fuoribordo = costruisciFuoribordo()
  fuoribordo.gruppo.position.set(0, 1.28, 0.6)   // dentro la sovrastruttura
  scena.add(fuoribordo.gruppo)

  const acqua = costruisciAcqua()
  /**
   * Interruttore di prova: `?senzaAcqua=1` toglie il mare.
   * Resta in produzione apposta — e' costato un ciclo di compilazione e ha
   * isolato in un colpo un difetto che stavo per attribuire all'acqua.
   * Uno strumento che si puo' rifare quando serve vale piu' di una deduzione.
   */
  if (!location.search.includes('senzaAcqua')) scena.add(acqua.gruppo)

  const orologio = new Clock()
  let t = 0
  let frame = 0
  // Di fronte l'estrusione si legge come una lastra piatta: si parte gia'
  // ruotati, cosi' il volume e' leggibile prima di qualunque interazione.
  let azimut = 0.34
  let azimutTarget = 0.34
  let spaccato = 0
  let emersione = 0

  /**
   * L'EMERSIONE — il principio che regge tutta la sequenza (D39).
   *
   * **Non e' la camera a scendere: e' la nave a emergere.** La differenza non
   * e' di gusto. La camera a quota zero e' cio' che tiene la linea di
   * galleggiamento a meta' schermo esatta, e quindi la giunzione fra fondo CSS
   * e canvas a **zero pixel** — l'unica idea meccanica del sito. Muovendo la
   * camera quella giunzione si perde; muovendo la nave, no.
   *
   * A 0 lo scafo e' sotto: si vede solo il mare. A 1 galleggia alla sua quota.
   */
  function impostaEmersione (v) {
    emersione = MathUtils.clamp(v, 0, 1)
    nave.position.y = MathUtils.lerp(-4.2, 0, emersione)
  }

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
    spostaTappo(pianoSezione.constant)
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

    // L'onda si spegne DOVE STA L'OBIETTIVO, quindi la posizione della camera
    // le va passata: e' calcolata poche righe piu' sotto, per questo si anima
    // il mare con quella del fotogramma precedente. Uno sfasamento di un
    // fotogramma su un raggio di 5,5 unita' non si vede — la camera si sposta
    // di millesimi per giro.
    if (!sim.S.ridotto) acqua.anima(t, sim.S.mare, frame, camera.position.x, camera.position.z)
    // Il fuoribordo E' la manopola dello stato del mare, non un commento su di
    // essa: non puo' contraddire cio' che l'utente controlla.
    fuoribordo.impostaMare(sim.S.mare)

    azimut += (azimutTarget - azimut) * Math.min(1, dt * 5)
    const raggio = MathUtils.lerp(RAGGIO, RAGGIO_SEZIONE, spaccato)
    const miraX = MathUtils.lerp(0, MIRA_MECCANISMO, spaccato)
    // La camera insegue la sezione anche IN LUNGHEZZA: da mezzanave al
    // meccanismo. La quota resta zero — e' quello che tiene la linea a meta'
    // schermo, e quindi la giunzione col fondo CSS a zero pixel.
    const miraZ = MathUtils.lerp(0, Z_PINNE, spaccato)
    camera.position.x = miraX + Math.sin(azimut) * raggio
    camera.position.z = miraZ + Math.cos(azimut) * raggio
    camera.position.y = 0
    camera.lookAt(miraX, 0, miraZ)

    render.render(scena, camera)
  }

  impostaEmersione(1)

  return { render, camera, ridimensiona, ruota, disegna, impostaSpaccato, impostaEmersione, tela: render.domElement }
}
