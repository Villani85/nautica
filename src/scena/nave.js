import {
  Group, Mesh, Shape, ExtrudeGeometry, BoxGeometry, CylinderGeometry,
  EdgesGeometry, LineSegments, LineBasicMaterial
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
  p.moveTo(-0.46, 0)
  p.bezierCurveTo(-0.30, 0.115, 0.16, 0.085, 0.52, 0)
  p.bezierCurveTo(0.16, -0.085, -0.30, -0.115, -0.46, 0)
  return p
}

export function costruisciNave () {
  const nave = new Group()

  const geoScafo = new ExtrudeGeometry(sezioneScafo(), {
    depth: 3.0, bevelEnabled: true, bevelThickness: 0.02,
    bevelSize: 0.02, bevelSegments: 2, curveSegments: 26
  })
  geoScafo.translate(0, 0, -1.5)
  nave.add(new Mesh(geoScafo, materiali.scafo))

  // Lo spigolo chiaro e' la stessa idea del taglio applicata al volume:
  // dice dove finisce il pezzo senza aggiungere una luce.
  nave.add(new LineSegments(
    new EdgesGeometry(geoScafo, 28),
    new LineBasicMaterial({ color: 0xe9e5dd, transparent: true, opacity: 0.22 })
  ))

  const coperta = new Mesh(new BoxGeometry(3.06, 0.09, 3.02), materiali.coperta)
  coperta.position.set(0, 0.94, 0); nave.add(coperta)
  const tuga = new Mesh(new BoxGeometry(2.15, 0.66, 1.85), materiali.coperta)
  tuga.position.set(0, 1.31, -0.35); nave.add(tuga)
  const vetri = new Mesh(new BoxGeometry(2.17, 0.20, 1.87), materiali.vetro)
  vetri.position.set(0, 1.40, -0.35); nave.add(vetri)

  const geoPinna = new ExtrudeGeometry(profiloPinna(), {
    depth: 1.05, bevelEnabled: true, bevelThickness: 0.015,
    bevelSize: 0.02, bevelSegments: 2, curveSegments: 18
  })

  const pinne = []
  for (const lato of [-1, 1]) {
    const perno = new Group()
    perno.position.set(lato * 1.50, -0.34, 0)
    nave.add(perno)

    // albero passante
    const albero = new Mesh(new CylinderGeometry(0.075, 0.075, 0.70, 20), materiali.acciaio)
    albero.rotation.z = Math.PI / 2; albero.position.x = lato * 0.18; perno.add(albero)

    // flangia di attraversamento carena e collare di tenuta
    const flangia = new Mesh(new CylinderGeometry(0.185, 0.185, 0.05, 24), materiali.bronzo)
    flangia.rotation.z = Math.PI / 2; flangia.position.x = lato * 0.075; perno.add(flangia)
    const collare = new Mesh(new CylinderGeometry(0.125, 0.125, 0.10, 20), materiali.bronzo)
    collare.rotation.z = Math.PI / 2; collare.position.x = lato * 0.16; perno.add(collare)

    // riduttore: corpo esagonale, non un cilindro liscio
    const riduttore = new Mesh(new CylinderGeometry(0.21, 0.21, 0.44, 6), materiali.acciaio)
    riduttore.rotation.z = Math.PI / 2; riduttore.position.x = lato * -0.20; perno.add(riduttore)
    const testata = new Mesh(new CylinderGeometry(0.155, 0.155, 0.07, 20), materiali.bronzo)
    testata.rotation.z = Math.PI / 2; testata.position.x = lato * -0.435; perno.add(testata)

    // biella: la parte che si muove, e che dice che qualcosa lavora
    const biella = new Group()
    biella.position.x = lato * -0.20
    const braccio = new Mesh(new BoxGeometry(0.05, 0.30, 0.05), materiali.acciaio)
    braccio.position.y = 0.15; biella.add(braccio)
    const occhio = new Mesh(new CylinderGeometry(0.045, 0.045, 0.07, 14), materiali.bronzo)
    occhio.rotation.z = Math.PI / 2; occhio.position.y = 0.30; biella.add(occhio)
    perno.add(biella)

    const pinna = new Mesh(geoPinna, materiali.acciaio)
    pinna.rotation.y = lato > 0 ? -Math.PI / 2 : Math.PI / 2
    pinna.position.x = lato * 0.48
    pinna.position.z = lato > 0 ? 0.52 : -0.52
    perno.add(pinna)

    pinne.push({ perno, biella, lato })
  }

  return { nave, pinne }
}
