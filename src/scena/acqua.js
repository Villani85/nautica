import {
  Mesh, PlaneGeometry, BoxGeometry, MeshStandardMaterial, MeshBasicMaterial,
  DoubleSide, Group
} from 'three'

const LARG = 46
const PROF = 46

/**
 * Il mare copre tutta la nave: 46 unita' di lato per uno scafo che ne misura
 * 16, cosi' l'orizzonte non finisce mai dentro l'inquadratura.
 *
 * (Prima era mezzo piano, spostato dietro la nave, perche' lo scafo era lungo
 * tre unita' e davanti veniva sezionato. Con il loft non e' piu' vero: il
 * commento diceva una cosa che il codice non faceva piu'.)
 */
export function costruisciAcqua () {
  const gruppo = new Group()

  const superficie = new PlaneGeometry(LARG, PROF, 76, 76)
  superficie.rotateX(-Math.PI / 2)

  const pelo = new Mesh(superficie, new MeshStandardMaterial({
    color: 0x14454a, metalness: 0.32, roughness: 0.14,
    transparent: true, opacity: 0.88, side: DoubleSide
  }))
  gruppo.add(pelo)

  const volume = new Mesh(
    new BoxGeometry(LARG, 13, PROF),
    new MeshBasicMaterial({ color: 0x061518, transparent: true, opacity: 0.72, depthWrite: false })
  )
  volume.position.set(0, -6.5, 0)
  gruppo.add(volume)

  // il filo del taglio, alla quota zero esatta
  const taglio = new Mesh(
    new BoxGeometry(LARG, 0.02, 0.02),
    new MeshBasicMaterial({ color: 0xe9e5dd })
  )
  gruppo.add(taglio)

  const posBase = superficie.attributes.position.array.slice()

  /** Onde: tre seni sfasati. Le normali si ricalcolano a fotogrammi alterni. */
  function anima (t, mare, frame) {
    const pos = superficie.attributes.position.array
    const onda = mare * 0.052
    for (let k = 0; k < pos.length; k += 3) {
      const x = posBase[k]
      const z = posBase[k + 2]
      pos[k + 1] = onda * (
        Math.sin(x * 0.42 + t * 1.15) * 0.6 +
        Math.sin(z * 0.63 - t * 0.86) * 0.3 +
        Math.sin((x + z) * 0.29 + t * 1.6) * 0.24
      )
    }
    superficie.attributes.position.needsUpdate = true
    if (frame % 2 === 0) superficie.computeVertexNormals()
  }

  return { gruppo, anima }
}
