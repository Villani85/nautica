import {
  Group, Mesh, Shape, ShapeGeometry, ExtrudeGeometry, BoxGeometry, CylinderGeometry,
  EdgesGeometry, LineSegments, LineBasicMaterial, MeshBasicMaterial, DoubleSide
} from 'three'
import { materiali } from './materiali.js'

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

function costruisciGruppoPinna (lato, geoPinna) {
  const gruppo = new Group()
  gruppo.position.set(lato * 1.44, -0.34, 0)
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
  const calotta = new Mesh(new CylinderGeometry(0.10, 0.135, 0.09, 22), materiali.bronzo)
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

  // manovella e biella: ricalcolate a ogni fotogramma
  const manovella = asta(0.05, materiali.acciaio)
  manovella.position.x = X(-0.34); gruppo.add(manovella)
  const biella = asta(0.042, materiali.bronzo)
  biella.position.x = X(-0.30); gruppo.add(biella)
  const pernoBiella = new Mesh(new CylinderGeometry(0.032, 0.032, 0.13, 14), materiali.bronzo)
  pernoBiella.rotation.z = Math.PI / 2; pernoBiella.position.x = X(-0.32); gruppo.add(pernoBiella)
  const pernoLeva = new Mesh(new CylinderGeometry(0.032, 0.032, 0.13, 14), materiali.bronzo)
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

  const geoScafo = new ExtrudeGeometry(sezioneScafo(), {
    depth: 3.0, bevelEnabled: true, bevelThickness: 0.02,
    bevelSize: 0.02, bevelSegments: 2, curveSegments: 26
  })
  geoScafo.translate(0, 0, -1.5)
  const scafo = new Mesh(geoScafo, materiali.scafo)
  nave.add(scafo); guscio.push(scafo)

  // Lo spigolo chiaro e' la stessa idea del taglio applicata al volume:
  // dice dove finisce il pezzo senza aggiungere una luce.
  const spigoli = new LineSegments(
    new EdgesGeometry(geoScafo, 28),
    new LineBasicMaterial({ color: 0xe9e5dd, transparent: true, opacity: 0.22 })
  )
  nave.add(spigoli); guscio.push(spigoli)

  const coperta = new Mesh(new BoxGeometry(3.06, 0.09, 3.02), materiali.coperta)
  coperta.position.set(0, 0.94, 0); nave.add(coperta); guscio.push(coperta)
  const tuga = new Mesh(new BoxGeometry(2.15, 0.66, 1.85), materiali.coperta)
  tuga.position.set(0, 1.31, -0.35); nave.add(tuga); guscio.push(tuga)
  const vetri = new Mesh(new BoxGeometry(2.17, 0.20, 1.87), materiali.vetro)
  vetri.position.set(0, 1.40, -0.35); nave.add(vetri); guscio.push(vetri)

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
   * LA FACCIA DI SEZIONE.
   *
   * Lo scafo e' l'estrusione di una Shape piana lungo Z: la sua sezione a
   * qualunque quota **e' quella stessa Shape**. Quindi il tappo non va
   * approssimato ne' ricavato con lo stencil — si genera esatto dalla curva
   * che ha prodotto il volume, e resta esatto anche se domani lo scafo cambia
   * forma. E' il colore della carta da disegno: il taglio riporta il pezzo al
   * disegno tecnico da cui viene.
   */
  const tappo = new Mesh(
    new ShapeGeometry(sezioneScafo(), 26),
    new MeshBasicMaterial({ color: 0xe9e5dd, side: DoubleSide, transparent: true, opacity: 0 })
  )
  tappo.visible = false
  nave.add(tappo)

  return { nave, pinne, guscio, tappo }
}
