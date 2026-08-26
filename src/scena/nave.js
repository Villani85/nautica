import {
  Group, Mesh, Shape, ShapeGeometry, ExtrudeGeometry, BoxGeometry, CylinderGeometry,
  EdgesGeometry, LineSegments, LineBasicMaterial, MeshBasicMaterial, DoubleSide
} from 'three'
import { materiali } from './materiali.js'
import { costruisciGuscio, costruisciPonte, tappoA, sezioneA, tDaZ, PRUA_Z, POPPA_Z } from '../scafo/ordinate.js'
import { costruisciAllestimento } from './allestimento.js'

/** L'opacita' dello spigolo dello scafo: dice dove finisce il pezzo. */
const OPACITA_SPIGOLO = 0.22

/** Sezione maestra dello scafo, estrusa lungo Z — che e' l'asse di rollio. */
function sezioneScafo () {
  const p = new Shape()
  p.moveTo(0, -0.86)
  p.bezierCurveTo(0.72, -0.84, 1.24, -0.66, 1.52, -0.24)
  p.lineTo(1.62, 0.06); p.lineTo(1.50, 0.92); p.lineTo(-1.50, 0.92)
  p.lineTo(-1.62, 0.06); p.lineTo(-1.52, -0.24)
  p.bezierCurveTo(-1.24, -0.66, -0.72, -0.84, 0, -0.86)
  return p
}

/** Profilo della pinna: un'ala, non una lastra. */
function profiloPinna () {
  const p = new Shape()
  p.moveTo(-0.44, 0)
  p.bezierCurveTo(-0.28, 0.105, 0.18, 0.075, 0.54, 0)
  p.bezierCurveTo(0.18, -0.075, -0.28, -0.105, -0.44, 0)
  return p
}

/* ────────────────────────────────────────────────────────────────
   IL QUADRILATERO ARTICOLATO

   DIFETTO CORRETTO — prima la pinna ruotava con `perno.rotation.z`, cioe'
   attorno all'asse longitudinale: sbatteva su e giu' come un'ala invece di
   cambiare incidenza. E ruotava l'intero gruppo, corpo dell'attuatore
   compreso, che nella realta' e' imbullonato alla culla e sta fermo. La
   biella era decorativa: un braccio che girava di un fattore inventato (2,1)
   senza toccare niente.

   Sono i due errori che l'unico pubblico capace di accorgersene — un tecnico
   di un produttore di stabilizzatori — vede in due secondi.

   Ora: rotazione attorno all'asse di APERTURA, corpo fisso separato dalla
   parte rotante, e manovella risolta per intersezione di cerchi cosi' che la
   biella resti rigida su tutta la corsa invece di allungarsi.
   ──────────────────────────────────────────────────────────────── */

const RL = 0.22   // leva calettata sull'albero
const RC = 0.11   // manovella in uscita dal riduttore
const LB = 0.30   // biella, lunghezza fissa
const CY = 0.36   // centro manovella, nel piano YZ del gruppo
const CZ = -0.24

/**
 * Dato il punto della leva, trova il perno di manovella come intersezione fra
 * il cerchio della manovella (raggio RC attorno a C) e quello della biella
 * (raggio LB attorno a P). Il clamp sulla distanza e' una cintura: con questi
 * parametri non scatta mai — verificato su tutta la corsa — ma se domani
 * qualcuno cambia RL o CY senza rifare i conti, il meccanismo si deforma
 * invece di produrre NaN e sparire dalla scena.
 */
function risolviManovella (py, pz) {
  const dy = py - CY
  const dz = pz - CZ
  let d = Math.sqrt(dy * dy + dz * dz)
  d = Math.max(Math.abs(RC - LB) + 1e-4, Math.min(RC + LB - 1e-4, d))
  const a = (RC * RC - LB * LB + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(0, RC * RC - a * a))
  const uy = dy / d
  const uz = dz / d
  return { y: CY + a * uy - h * uz, z: CZ + a * uz + h * uy }
}

/** Asta col perno nell'origine e il corpo verso +Y, per scalarla in lunghezza. */
function asta (spessore, materiale) {
  const g = new BoxGeometry(spessore, 1, spessore * 0.86)
  g.translate(0, 0.5, 0)
  return new Mesh(g, materiale)
}

/** Ruotando (0,1,0) attorno a X di φ si ottiene (0, cos φ, sin φ):
 *  quindi per collegare due punti del piano YZ basta φ = atan2(dz, dy). */
function orienta (mesh, ay, az, by, bz) {
  const dy = by - ay
  const dz = bz - az
  mesh.position.y = ay
  mesh.position.z = az
  mesh.rotation.x = Math.atan2(dz, dy)
  mesh.scale.y = Math.sqrt(dy * dy + dz * dz)
}

/** Dove stanno gli stabilizzatori lungo la nave: poco a proravia di mezzo. */
export const Z_PINNE = -1.2

function costruisciGruppoPinna (lato, geoPinna) {
  const gruppo = new Group()
  // Il gruppo si monta sul GINOCCHIO DI CARENA, che e' dove sta nella realta'
  // e dove la sezione dice che sta: si interroga lo scafo invece di scegliere
  // due coordinate a occhio. Se domani le ordinate cambiano, si sposta da solo.
  const sez = sezioneA(tDaZ(Z_PINNE))
  gruppo.position.set(lato * sez.spigoloX, sez.spigoloY, Z_PINNE)
  const X = v => lato * v

  // fondazione: il macchinario poggia su qualcosa
  const culla = new Mesh(new BoxGeometry(1.02, 0.055, 0.36), materiali.acciaio)
  culla.position.set(X(-0.50), 0.335, 0); gruppo.add(culla)
  for (const x of [-0.88, -0.14]) {
    const montante = new Mesh(new BoxGeometry(0.06, 0.34, 0.28), materiali.acciaio)
    montante.position.set(X(x), 0.165, 0); gruppo.add(montante)
  }

  // motore elettrico con alette di raffreddamento
  const motore = new Mesh(new CylinderGeometry(0.135, 0.135, 0.34, 22), materiali.acciaio)
  motore.rotation.z = Math.PI / 2; motore.position.set(X(-0.86), 0.03, 0); gruppo.add(motore)
  for (let a = 0; a < 7; a++) {
    const aletta = new Mesh(new CylinderGeometry(0.163, 0.163, 0.011, 22), materiali.acciaio)
    aletta.rotation.z = Math.PI / 2
    aletta.position.set(X(-0.99 + a * 0.043), 0.03, 0); gruppo.add(aletta)
  }
  const calotta = new Mesh(new CylinderGeometry(0.10, 0.135, 0.09, 22), materiali.accento)
  calotta.rotation.z = Math.PI / 2; calotta.position.set(X(-1.07), 0.03, 0); gruppo.add(calotta)

  // riduttore e giunto
  const riduttore = new Mesh(new BoxGeometry(0.30, 0.34, 0.28), materiali.acciaio)
  riduttore.position.set(X(-0.55), 0.06, 0); gruppo.add(riduttore)
  const giunto = new Mesh(new CylinderGeometry(0.085, 0.085, 0.20, 18), materiali.bronzo)
  giunto.rotation.z = Math.PI / 2; giunto.position.set(X(-0.72), 0.03, 0); gruppo.add(giunto)
  const mozzo = new Mesh(new CylinderGeometry(0.075, 0.075, 0.16, 18), materiali.bronzo)
  mozzo.rotation.z = Math.PI / 2; mozzo.position.set(X(-0.34), CY, CZ); gruppo.add(mozzo)

  // attraversamento carena: flangia imbullonata e premistoppa
  const flangia = new Mesh(new CylinderGeometry(0.20, 0.20, 0.045, 26), materiali.bronzo)
  flangia.rotation.z = Math.PI / 2; flangia.position.set(X(0.06), 0, 0); gruppo.add(flangia)
  for (let b = 0; b < 8; b++) {
    const ang = b / 8 * Math.PI * 2
    const bullone = new Mesh(new CylinderGeometry(0.017, 0.017, 0.07, 6), materiali.acciaio)
    bullone.rotation.z = Math.PI / 2
    bullone.position.set(X(0.06), Math.cos(ang) * 0.155, Math.sin(ang) * 0.155)
    gruppo.add(bullone)
  }
  const premistoppa = new Mesh(new CylinderGeometry(0.115, 0.135, 0.12, 22), materiali.bronzo)
  premistoppa.rotation.z = Math.PI / 2; premistoppa.position.set(X(0.15), 0, 0); gruppo.add(premistoppa)

  // parte rotante: albero, leva, radice, pinna
  const rotante = new Group()
  gruppo.add(rotante)

  const albero = new Mesh(new CylinderGeometry(0.062, 0.062, 0.62, 20), materiali.acciaio)
  albero.rotation.z = Math.PI / 2; rotante.add(albero)

  const leva = asta(0.055, materiali.acciaio)
  leva.scale.y = RL; leva.position.x = X(-0.22); rotante.add(leva)
  const calettatura = new Mesh(new CylinderGeometry(0.072, 0.072, 0.09, 16), materiali.bronzo)
  calettatura.rotation.z = Math.PI / 2; calettatura.position.x = X(-0.22); rotante.add(calettatura)

  const radice = new Mesh(new CylinderGeometry(0.115, 0.145, 0.14, 22), materiali.acciaio)
  radice.rotation.z = Math.PI / 2; radice.position.x = X(0.23); rotante.add(radice)

  const pinna = new Mesh(geoPinna, materiali.acciaio)
  pinna.position.x = X(0.28)
  // Specchiata con una rotazione, non con una scala negativa: una scala
  // negativa rovescia le normali e la pinna di sinistra si illuminerebbe
  // al contrario di quella di destra.
  if (lato < 0) pinna.rotation.y = Math.PI
  rotante.add(pinna)

  // Manovella e biella: ricalcolate a ogni fotogramma.
  // ACCENTO SOLO SU CIO' CHE SI MUOVE (D31): biella e i due perni. La
  // manovella resta acciaio perche' e' un braccio, non un'articolazione.
  const manovella = asta(0.05, materiali.acciaio)
  manovella.position.x = X(-0.34); gruppo.add(manovella)
  const biella = asta(0.042, materiali.accento)
  biella.position.x = X(-0.30); gruppo.add(biella)
  const pernoBiella = new Mesh(new CylinderGeometry(0.036, 0.036, 0.14, 14), materiali.accento)
  pernoBiella.rotation.z = Math.PI / 2; pernoBiella.position.x = X(-0.32); gruppo.add(pernoBiella)
  const pernoLeva = new Mesh(new CylinderGeometry(0.036, 0.036, 0.14, 14), materiali.accento)
  pernoLeva.rotation.z = Math.PI / 2; pernoLeva.position.x = X(-0.26); gruppo.add(pernoLeva)

  function aggiorna (theta) {
    rotante.rotation.x = theta
    const py = RL * Math.cos(theta)
    const pz = RL * Math.sin(theta)
    const q = risolviManovella(py, pz)
    orienta(manovella, CY, CZ, q.y, q.z)
    orienta(biella, q.y, q.z, py, pz)
    pernoBiella.position.y = q.y; pernoBiella.position.z = q.z
    pernoLeva.position.y = py; pernoLeva.position.z = pz
  }

  aggiorna(0)
  return { gruppo, lato, aggiorna }
}

export function costruisciNave () {
  const nave = new Group()
  // Il guscio e' cio' che il piano di sezione taglia via; il meccanismo no —
  // e' quello che resta, ed e' la tesi del sito resa visibile.
  const guscio = []

  /**
   * LO SCAFO E' UN LOFT FRA ORDINATE, non piu' una sezione estrusa.
   * Prua stretta e a V, poppa larga e quasi piatta: una carena vera.
   *
   * Il trucco del tappo esatto sopravvive, e anzi si rafforza: la sezione a
   * una quota qualsiasi e' l'interpolazione fra le due ordinate adiacenti, e
   * `tappoA` la calcola con LA STESSA funzione che genera la superficie.
   * `strumenti/collaudo-scafo.mjs` lo prova a otto quote.
   */
  const geoScafo = costruisciGuscio(72)
  const scafo = new Mesh(geoScafo, materiali.scafo)
  nave.add(scafo); guscio.push(scafo)
  // La faccia interna, disegnata a parte e scura: vedi materiali.interno
  const dentro = new Mesh(geoScafo, materiali.interno)
  nave.add(dentro); guscio.push(dentro)

  /**
   * DIFETTO TROVATO GUARDANDO IL PROVINO: il loft e' un tubo, aperto ai due
   * estremi. Con la camera a +z si guardava dentro lo scafo attraverso lo
   * specchio di poppa e si vedeva l'interno della prua, illuminato dalle sole
   * luci fredde: una macchia verde dove doveva esserci una murata.
   *
   * Le chiusure si generano con la STESSA `tappoA` del piano di sezione. Non
   * e' un espediente: la prua e lo specchio SONO due sezioni, agli estremi.
   */
  for (const z of [PRUA_Z + 0.005, POPPA_Z - 0.005]) {
    const chiusura = new Mesh(tappoA(z), materiali.scafo)
    nave.add(chiusura); guscio.push(chiusura)
  }

  // E il terzo lato aperto: il ponte.
  const ponte = new Mesh(costruisciPonte(72), materiali.coperta)
  nave.add(ponte); guscio.push(ponte)

  // Lo spigolo chiaro e' la stessa idea del taglio applicata al volume:
  // dice dove finisce il pezzo senza aggiungere una luce.
  const geoSpigoli = new EdgesGeometry(geoScafo, 42)
  const spigoli = new LineSegments(
    geoSpigoli,
    new LineBasicMaterial({ color: 0xe9e5dd, transparent: true, opacity: OPACITA_SPIGOLO })
  )
  nave.add(spigoli); guscio.push(spigoli)

  /**
   * ─── QUI C'ERA IL FANTASMA, e l'ha bocciato il committente in una riga:
   * «non mi piace perche' non porta emozioni». Aveva ragione.
   *
   * Era la stessa nave disegnata una seconda volta all'angolo che avrebbe senza
   * pinne: tecnicamente giusto, verificato a zero esatto quando le due corse
   * coincidono, e completamente freddo. **Un fantasma e' un CONFRONTO, e un
   * confronto parla alla testa.** Si guarda una nave da fuori, piccola nel
   * fotogramma: nessuno ha mai avuto il mal di mare guardando una barca dalla
   * riva.
   *
   * E l'errore vero e' stato nella scelta, non nell'esecuzione: ho preso la
   * mossa successiva per ordine del piano invece che per la priorita' dichiarata
   * — prima emozionare, il tecnico dopo.
   *
   * Cosa resta, perche' non era tutto da buttare: S.rollioNudo e
   * strumenti/collaudo-fantasma.mjs. Il numero e' quello che serve al finale
   * dell'atto due, e costa zero perche' la corsa nuda gira comunque.
   *
   * E la versione EMOTIVA della stessa idea esiste, ma non puo' stare qui: e'
   * portare la camera A BORDO, cosi' che a rollare sia il mondo di chi guarda e
   * non un oggetto davanti a lui. Qui e' vietata dalla giunzione — l'orizzonte
   * del canvas deve restare a meta' schermo e orizzontale, altrimenti si stacca
   * dallo sfondo CSS, che e' l'unica idea meccanica del sito. Va sotto la linea,
   * dove D28 dice che il vincolo decade perche' non c'e' piu' giunzione da
   * proteggere.
   */

  /**
   * SOVRASTRUTTURA — appoggiata al ponte, non a una quota scelta a occhio.
   *
   * Col cavallino vero il trincarino sale verso prua di 118 cm su 40 m. Una
   * tuga a quota fissa finisce interrata di 34 cm all'estremita' prodiera e
   * sollevata di 3 a poppa: un difetto misurato, non temuto.
   *
   * Quindi la quota e l'inclinazione si RICAVANO dal ponte alle sue due
   * estremita'. Se domani le ordinate cambiano, o la tuga si allunga verso
   * prua, si riappoggia da sola invece di scollarsi in silenzio.
   */
  const TUGA_Z = 0.6, TUGA_LUNG = 6.2, TUGA_ALT = 0.72
  const zProra = TUGA_Z - TUGA_LUNG / 2
  const zPoppa = TUGA_Z + TUGA_LUNG / 2
  const pontePro = sezioneA(tDaZ(zProra)).ponteY
  const pontePop = sezioneA(tDaZ(zPoppa)).ponteY
  const inclinaz = Math.atan2(pontePro - pontePop, TUGA_LUNG)   // il cavallino sotto la tuga
  const quotaTuga = (pontePro + pontePop) / 2 + TUGA_ALT / 2

  const larghTuga = sezioneA(tDaZ(TUGA_Z)).semilarg * 1.16

  /**
   * IL FINESTRINO E' UN'APERTURA VERA, non una fascia scura dipinta.
   *
   * La regola: cio' che e' diagramma si costruisce, cio' che e' fotografia si
   * vede ATTRAVERSO un'apertura. Perche' la seconda meta' valga, l'apertura
   * deve essere un buco: la tuga si divide in fascia bassa e fascia alta, e
   * fra le due non c'e' niente. Guardando la nave di traverso si passa da un
   * finestrino all'altro e si finisce sull'orizzonte, che sta in coordinate
   * mondo e quindi non rolla con la stanza.
   */
  const H_FIN = 0.26                      // altezza dell'apertura
  const H_BAS = (TUGA_ALT - H_FIN) * 0.42 // parapetto
  const H_ALT = TUGA_ALT - H_FIN - H_BAS  // fascia sopra e tetto

  const basso = new Mesh(new BoxGeometry(larghTuga, H_BAS, TUGA_LUNG), materiali.coperta)
  basso.position.set(0, quotaTuga - TUGA_ALT / 2 + H_BAS / 2, TUGA_Z)
  basso.rotation.x = -inclinaz; nave.add(basso); guscio.push(basso)

  const alto = new Mesh(new BoxGeometry(larghTuga, H_ALT, TUGA_LUNG), materiali.coperta)
  alto.position.set(0, quotaTuga + TUGA_ALT / 2 - H_ALT / 2, TUGA_Z)
  alto.rotation.x = -inclinaz; nave.add(alto); guscio.push(alto)

  /**
   * L'ALLESTIMENTO sta DENTRO la tuga ed e' figlio della nave: rolla con la
   * stanza. L'orizzonte no. Guardando dal finestrino si vedono insieme, ed e'
   * quella differenza la tesi.
   *
   * NON entra nel guscio: il piano di sezione non lo taglia. Se il taglio
   * passasse di li' si vedrebbero due persone sezionate a meta', che e' una
   * cosa che non si fa.
   */
  const allest = costruisciAllestimento(TUGA_Z, quotaTuga - TUGA_ALT / 2, larghTuga)
  allest.gruppo.rotation.x = -inclinaz
  nave.add(allest.gruppo)

  // I montanti: senza, l'apertura legge come una fessura invece che come una
  // vetrata. Sono anche cio' che da' la scala alla sovrastruttura.
  for (let i = -2; i <= 2; i++) {
    const m = new Mesh(new BoxGeometry(larghTuga + 0.01, H_FIN, 0.05), materiali.acciaio)
    m.position.set(0, quotaTuga - TUGA_ALT / 2 + H_BAS + H_FIN / 2, TUGA_Z + i * (TUGA_LUNG / 5.2))
    m.rotation.x = -inclinaz; nave.add(m); guscio.push(m)
  }

  // Nasce con corda in X e apertura in Z; la ruoto una volta sola alla
  // creazione, cosi' l'apertura va fuoribordo e la corda resta longitudinale.
  // Da qui in poi l'unica rotazione che la pinna subisce e' l'incidenza.
  const geoPinna = new ExtrudeGeometry(profiloPinna(), {
    depth: 1.04, bevelEnabled: true, bevelThickness: 0.012,
    bevelSize: 0.016, bevelSegments: 2, curveSegments: 20
  })
  geoPinna.rotateY(Math.PI / 2)

  const pinne = []
  for (const lato of [-1, 1]) {
    const p = costruisciGruppoPinna(lato, geoPinna)
    nave.add(p.gruppo)
    pinne.push(p)
  }

  /**
   * LA FACCIA DI SEZIONE, ricalcolata alla quota del piano.
   *
   * Prima era una `Shape` fissa, perche' lo scafo era un'estrusione e la
   * sezione era sempre la stessa. Ora la sezione cambia lungo la nave, quindi
   * il tappo va rigenerato quando il piano si sposta — ma **con la stessa
   * funzione che genera la superficie**, mai con una seconda implementazione.
   *
   * Si rigenera solo oltre una soglia: lo scorrimento arriva decine di volte
   * al secondo e costruire una geometria a ogni evento sarebbe spazzatura.
   */
  const tappo = new Mesh(
    tappoA(POPPA_Z),
    new MeshBasicMaterial({ color: 0xe9e5dd, side: DoubleSide, transparent: true, opacity: 0 })
  )
  tappo.visible = false
  nave.add(tappo)

  let quotaTappo = POPPA_Z
  function spostaTappo (z) {
    const dentro = Math.max(PRUA_Z + 0.01, Math.min(POPPA_Z - 0.01, z))
    if (Math.abs(dentro - quotaTappo) < 0.02) return
    quotaTappo = dentro
    tappo.geometry.dispose()
    tappo.geometry = tappoA(dentro)
  }

  return { nave, pinne, guscio, tappo, spostaTappo }
}
