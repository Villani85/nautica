import {
  Scene, PerspectiveCamera, WebGLRenderer, HemisphereLight, DirectionalLight,
  PointLight, Clock, MathUtils, SRGBColorSpace, NoToneMapping, Plane, Vector3,
  PMREMGenerator, Raycaster, PCFSoftShadowMap
} from 'three'
import { costruisciNave, Z_PINNE } from './nave.js'
import { POPPA_Z } from '../scafo/ordinate.js'
import { costruisciAcqua } from './acqua.js'
import { creaImpianto } from './impianto.js'
import { creaSovrastruttura } from './sovrastruttura.js'
import { creaSalone3D } from './salone3d.js'
import { creaAmbiente } from './ambiente.js'
import { applicaAmbiente } from './materiali.js'
import { costruisciFuoribordo } from './fuoribordo.js'
import { avanza } from '../stato.js'

const RAGGIO = 19.5
const RAGGIO_SEZIONE = 7.2
/** L'ultima battuta: abbastanza vicino da leggere i bulloni della fondazione. */
const RAGGIO_MECCANISMO = 2.6
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

/**
 * `base` e' l'indirizzo da cui pendono gli asset. Arriva da fuori, come nel
 * salone: il sito vive sotto /nautica/ su GitHub Pages e alla radice in locale,
 * quindi un percorso assoluto scritto qui funzionerebbe in un posto solo.
 */
export function creaScena (contenitore, base = import.meta.env.BASE_URL) {
  /** L'ultimo stato passato a `disegna`, per `?ispeziona=1`. */
  let ultimoStato = null
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

  /**
   * ─── L'AMBIENTE, e perche' non c'era
   *
   * In tutta la scena non esisteva nessun `scene.environment`, mentre
   * `materiali.js` arriva a `metalness: 0.85`. **Un metallo senza ambiente non
   * ha niente da riflettere**: viene fuori plastica grigia, e nessuna taratura
   * delle luci lo salva. E' il salto visivo piu' grande disponibile su questa
   * scena, ed era li' da prendere: `ambiente.js` esisteva gia' e completo, ma
   * era collegato solo alla scena del salone — che nel frattempo ha cambiato
   * mestiere ed e' diventata la sorgente delle sagome. Il capitolo che si vede
   * ne era rimasto scoperto.
   *
   * Non e' un HDRI scaricato, e la ragione e' scritta per esteso in
   * `ambiente.js`: pesa 1-2 MB contro un budget di 500 KB, e porterebbe con se'
   * i colori di un cielo vero — lo scafo comincerebbe a riflettere un azzurro
   * che nel sito non esiste. L'ambiente qui e' disegnato coi colori del foglio
   * di stile, carta sopra la linea e acqua sotto: **lo scafo riflette la linea
   * del sito su se stesso**, che non e' un ripiego ma la tesi applicata alla
   * luce.
   */
  // La mappa serve DUE VOLTE: ai materiali del sito per nome, e ai materiali
  // che arrivano dentro il GLB, che nessun elenco per nome puo' conoscere.
  let ambiente = null
  if (!location.search.includes('senzaAmbiente')) {
    ambiente = creaAmbiente(render, PMREMGenerator, 1.0)
    applicaAmbiente(ambiente)
  }

  scena.add(new HemisphereLight(0xe9e5dd, 0x071a1d, LUCI.emisfero))
  const sole = new DirectionalLight(0xfff6e4, LUCI.sole)
  sole.position.set(4.5, 7, 6); scena.add(sole)

  /**
   * ─── LE OMBRE, e perche' non c'erano
   *
   * In tutta la scena non esisteva un `castShadow`. Con tre ponti sovrapposti
   * il risultato si legge come **carta ritagliata**: il ponte superiore non si
   * posa su quello sotto, la murata non lascia niente sulla coperta, e il
   * cervello non riceve l'unico segnale che dice «questi volumi stanno uno
   * davanti all'altro». Nessun materiale e nessun riflesso lo sostituisce.
   *
   * Una sola luce le proietta — il sole. Il controluce e la luce di fondale
   * no: due sorgenti che proiettano danno due ombre, e due ombre su una barca
   * ferma al sole sono il primo indizio che la scena e' finta.
   *
   * IL TRONCO E' STRETTO INTORNO ALLA NAVE, e non e' un'ottimizzazione: una
   * mappa d'ombra copre il suo tronco con la stessa risoluzione qualunque sia
   * la sua estensione. Coprire tutta la scena vorrebbe dire sprecare quasi
   * tutti i texel sull'acqua vuota e lasciarne pochissimi alla sovrastruttura,
   * che e' l'unico posto dove l'ombra ha qualcosa da dire.
   *
   * `normalBias` invece di `bias`: su superfici quasi parallele alla luce —
   * il fianco dello scafo, quando il sole e' basso — un bias costante o
   * produce righe (acne) o stacca l'ombra dal piede dell'oggetto. Il bias
   * lungo la normale non ha quel compromesso.
   */
  render.shadowMap.enabled = true
  render.shadowMap.type = PCFSoftShadowMap
  sole.castShadow = true
  sole.shadow.mapSize.set(2048, 2048)
  const c = sole.shadow.camera
  c.left = -11; c.right = 11; c.top = 8; c.bottom = -8
  c.near = 0.5; c.far = 34
  c.updateProjectionMatrix()
  sole.shadow.normalBias = 0.03
  const controluce = new DirectionalLight(0x9fd8cc, LUCI.controluce)
  controluce.position.set(-6, 2.5, -4); scena.add(controluce)
  const fondale = new PointLight(0x3fbfa8, LUCI.fondale, 14, 1.6)
  fondale.position.set(0, -9.5, 2.5); scena.add(fondale)

  const { nave, agganci, guscio, tappo, spostaTappo, tuga } = costruisciNave()
  scena.add(nave)

  /**
   * ─── L'IMPIANTO ARRIVA DA UN FILE, non si costruisce qui
   *
   * `docs/14` §2: una sola fonte geometrica. Questo codice carica, scala,
   * aggancia e comanda — non ricostruisce niente.
   *
   * Il caricamento e' ASINCRONO e non blocca: la scena parte senza, e i due
   * gruppi compaiono quando il file arriva. Il §9 lo richiede — «nessun modello
   * nel percorso critico della prima schermata» — e ha una conseguenza che vale
   * la pena dire: chi guarda il capitolo nei primi istanti vede lo scafo senza
   * pinne. E' preferibile a una schermata che aspetta.
   */
  const impianti = agganci.map(a => {
    const i = creaImpianto(base, ambiente)
    i.gruppo.position.set(...a.posizione)
    // la fiancata opposta NON si ottiene con una scala negativa: rovescerebbe
    // le normali e la pinna di sinistra si illuminerebbe al contrario
    if (a.lato < 0) i.gruppo.rotation.y = Math.PI
    i.lato = a.lato
    nave.add(i.gruppo)
    i.caricato.catch(e => console.error('[impianto]', e.message))
    return i
  })

  /**
   * Il piano tiene i punti con `normale · p + costante > 0`. Con normale
   * (0,0,-1) tiene `z < costante`: abbassando la costante si toglie la meta'
   * vicina alla camera. Lo scafo va da z = -1,5 a z = +1,5.
   */
  const pianoSezione = new Plane(new Vector3(0, 0, -1), Z_FUORI)
  for (const m of guscio) m.material.clippingPlanes = [pianoSezione]

  /**
   * Chi proietta e chi riceve. Lo scafo e la coperta fanno tutti e due: la
   * murata deve lasciare la sua striscia sul teak, ed e' quella striscia a dire
   * che la murata e' alta. Le LINEE no — uno spigolo disegnato non ha volume, e
   * chiedergli un'ombra produce sfarfallio sul filo del ponte.
   */
  for (const m of guscio) {
    if (!m.isMesh) continue
    m.castShadow = true
    m.receiveShadow = true
  }

  /**
   * I DUE PONTI SOPRA LA TUGA arrivano da Blender, e arrivano DOPO — come
   * l'impianto, per la stessa ragione: 58 KB non stanno nel percorso critico
   * della prima schermata. Chi guarda i primi istanti vede la nave a un solo
   * livello, che e' preferibile a una schermata che aspetta.
   *
   * Il piano di sezione e l'ambiente si passano al caricatore invece di essere
   * applicati qui: i materiali del GLB non stanno nell'elenco per nome di
   * `materiali.js`, e senza il piano la sovrastruttura resterebbe intera mentre
   * lo scafo si apre — una nave tagliata a meta' con la tuga intatta sopra.
   */
  /**
   * ─── IL SALONE, DENTRO QUESTA SCENA
   *
   * Dietro `?unica=1` finche' non regge da solo. Il capitolo che oggi vive in
   * DOM diventa geometria di questa nave: stesso renderer, stessa camera,
   * stesso mare, stesso integratore. Non e' un effetto in piu' — e' la
   * risposta al rilievo che le due meta' del sito erano due sistemi diversi.
   *
   * Sta DENTRO la tuga, alla quota che `nave.js` ha calcolato sul cavallino:
   * nessun numero riscritto, nessuna posa scelta a occhio.
   */
  const salone = location.search.includes('unica')
    ? creaSalone3D(base, tuga)
    : null
  if (salone) { nave.add(salone.gruppo); salone.riproduci() }

  const sovra = creaSovrastruttura(base, { ambiente, pianoSezione })
  nave.add(sovra.gruppo)
  sovra.caricato
    .then(({ parti }) => {
      for (const m of parti) { m.castShadow = true; m.receiveShadow = true }
    })
    .catch(e => console.error('[nautica] sovrastruttura non caricata', e))
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
  let avvicinamento = 0

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
  /** §L'ultima battuta porta la camera sul pezzo. Vedi `regia.js`. */
  function impostaAvvicinamento (v) {
    avvicinamento = MathUtils.clamp(v, 0, 1)
  }

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

  function disegna (sim, marca) {
    ultimoStato = sim.S
    const dt = Math.min(orologio.getDelta(), 0.05)
    frame++
    if (!sim.S.ridotto) t += dt

    // Il passo della simulazione non lo fa piu' questa scena: lo fa `stato.js`,
    // che e' l'unico a sapere se qualcun altro l'ha gia' fatto in questo
    // fotogramma. Il `t` locale resta per le onde, che sono roba di scena.
    avanza(dt, marca)

    // Non si seziona un oggetto in movimento: mentre il piano entra, il
    // rollio si acquieta. Non e' un vezzo — un disegno tecnico e' fermo, ed e'
    // il registro in cui il taglio riporta il pezzo.
    nave.rotation.z = MathUtils.degToRad(sim.S.rollio) * (1 - spaccato)

    // L'angolo e' opposto fra dritta e sinistra: due pinne con la stessa
    // incidenza spingerebbero dalla stessa parte invece di raddrizzare.
    if (salone) {
      salone.aggiorna(sim.S.rollio, dt)
      // si vede solo finche' la camera e' dentro la tuga
      salone.mostra(1 - MathUtils.clamp(emersione * 1.6, 0, 1))
    }

    for (const i of impianti) {
      i.aggiorna({ pinna: sim.S.pinna * i.lato })
      // §4.2 · il coperchio si stacca quando il taglio arriva al carter
      i.apri(MathUtils.clamp((spaccato - 0.55) / 0.35, 0, 1))
    }

    // L'onda si spegne DOVE STA L'OBIETTIVO, quindi la posizione della camera
    // le va passata: e' calcolata poche righe piu' sotto, per questo si anima
    // il mare con quella del fotogramma precedente. Uno sfasamento di un
    // fotogramma su un raggio di 5,5 unita' non si vede — la camera si sposta
    // di millesimi per giro.
    if (!sim.S.ridotto) acqua.anima(t, sim.S.mare, frame, camera.position.x, camera.position.z)
    // e nel taglio si schiarisce, altrimenti copre proprio il pezzo che il
    // taglio serve a mostrare: la nota sta in acqua.js
    acqua.chiarisci(spaccato)
    // Il fuoribordo E' la manopola dello stato del mare, non un commento su di
    // essa: non puo' contraddire cio' che l'utente controlla.
    fuoribordo.impostaMare(sim.S.mare)

    azimut += (azimutTarget - azimut) * Math.min(1, dt * 5)
    /**
     * Due avvicinamenti in fila, e non uno solo piu' lungo: il primo serve a
     * mostrare che il taglio corre lungo TUTTO lo scafo, e per quello ci vuole
     * distanza; il secondo porta sul pezzo. Interpolare in una volta sola da
     * 19,5 a 2,6 farebbe passare la fase del taglio troppo vicino per
     * leggerla.
     */
    const raggio = MathUtils.lerp(
      MathUtils.lerp(RAGGIO, RAGGIO_SEZIONE, spaccato),
      RAGGIO_MECCANISMO, avvicinamento)
    const miraX = MathUtils.lerp(0, MIRA_MECCANISMO, spaccato)
    // La camera insegue la sezione anche IN LUNGHEZZA: da mezzanave al
    // meccanismo. La quota resta zero — e' quello che tiene la linea a meta'
    // schermo, e quindi la giunzione col fondo CSS a zero pixel.
    const miraZ = MathUtils.lerp(0, Z_PINNE, spaccato)
    camera.position.x = miraX + Math.sin(azimut) * raggio
    camera.position.z = miraZ + Math.cos(azimut) * raggio
    camera.position.y = 0
    camera.lookAt(miraX, 0, miraZ)

    /**
     * Lo stato della scena esce nel DOM: i cancelli e le diagnosi lo leggono
     * senza dover entrare nel modulo. E' la stessa cosa che fa il salone con
     * dataset.rollio, ed e' costata due ore di deduzioni sbagliate prima di
     * esistere: guardando una schermata non si distingue una sezione aperta a
     * meta' da un materiale scuro.
     */
    contenitore.dataset.spaccato = spaccato.toFixed(3)
    contenitore.dataset.emersione = emersione.toFixed(3)

    render.render(scena, camera)
  }

  /**
   * ─── UNA FINESTRA SULLA SCENA, e non e' un vezzo da sviluppatore
   *
   * Con `?ispeziona=1` la scena, la camera e il renderer finiscono su
   * `window.__nautica`. Serve a puntare un raggio contro un pixel e farsi dire
   * QUALE oggetto c'e' li'.
   *
   * L'ho aggiunta dopo aver bruciato mezza sessione a dedurre l'identita' di una
   * macchia scura sul fianco della nave: normali invertite (misurate: no), buco
   * nella geometria (misurato: no), piano di sezione (misurato: no), materiale
   * sbagliato (colorato: no). Quattro ipotesi, quattro misure, e la risposta
   * l'avrebbe data un raggio in due secondi.
   *
   * *Quando si guarda un'immagine e ci si chiede COSA sia una cosa, la domanda
   * non e' visiva: e' di identita', e va fatta alla scena.*
   */
  if (location.search.includes('ispeziona')) {
    const raggio = new Raycaster()
    window.__nautica = {
      scena, camera, render, nave,
      // Lo STATO, non solo la geometria. Senza, davanti a un meccanismo fermo
      // si finisce a indovinare perche': ridotto? stabilizzatore spento? mare
      // zero? Sono tre cause diverse e si distinguono solo leggendole.
      // La simulazione arriva a `disegna` come parametro, quindi qui si legge
      // l'ultima vista — scritta ogni fotogramma, non catturata alla nascita.
      get stato () { return ultimoStato },
      // I numeri dichiarati dal modello, per il collaudo cinematico.
      get impiantoRapporto () { return impianti[0]?.rapporto ?? null },
      get impiantoEccentricita () { return impianti[0]?.eccentricita ?? null },
      get impiantoDati () { return impianti[0]?.dati ?? null },
      tugaPareti: tuga.pareti,
      /** Chi c'e' a questo punto dello schermo? Coordinate 0-1. */
      chi (u, v) {
        raggio.setFromCamera({ x: u * 2 - 1, y: -(v * 2 - 1) }, camera)
        return raggio.intersectObjects(scena.children, true).slice(0, 4).map(i => ({
          nome: i.object.nome || i.object.name || '(senza nome)',
          tipo: i.object.type,
          colore: i.object.material && i.object.material.color ? '#' + i.object.material.color.getHexString() : '?',
          lato: i.object.material ? i.object.material.side : '?',
          distanza: +i.distance.toFixed(2),
          punto: [i.point.x, i.point.y, i.point.z].map(x => +x.toFixed(2))
        }))
      }
    }
  }

  impostaEmersione(1)

  return {
    render, camera, ridimensiona, ruota, disegna,
    impostaSpaccato, impostaEmersione, impostaAvvicinamento,
    tela: render.domElement
  }
}
