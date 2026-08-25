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

  /**
   * ─── IL MARE SOMMERGEVA L'OBIETTIVO, E LO FACEVA DA SEMPRE.
   *
   * La camera sta a quota zero — e' l'invariante da cui discende tutto il
   * sito — e questa superficie oscilla ATTORNO a zero. Le creste le passavano
   * sopra: `mare * 0.052` per coefficienti che sommano 1,14 fa **+0,30** a
   * mare 5, e la camera finiva sott'acqua.
   *
   * Effetto a schermo: la meta' chiara diventava (28,29,29) invece di
   * (233,229,221). Il cielo si spegneva, la giunzione al 50% spariva, e con
   * essa l'unica idea meccanica del sito.
   *
   * COME MI E' SFUGGITO. Va e viene col periodo dell'onda — da fermo, venti
   * campioni a un secondo: `##...###..##..##...#`. Uno scatto solo lo prende
   * mezza volta su due, e io leggevo i fotogrammi neri come "quella battuta e'
   * scura". Due revisori esterni non l'hanno visto per lo stesso motivo.
   *
   * LA CURA, e perche' non tocca l'invariante. Non si alza la camera e non si
   * abbassa il mare: si SPEGNE L'ONDA attorno all'obiettivo. Quella zona si
   * vede di striscio, a quota zero guardando in orizzontale, e non occupa
   * quasi pixel — misurato che sparisca, non supposto. La camera resta a zero,
   * la linea resta a meta' schermo, il fondo CSS resta attaccato.
   *
   * E la quota va sotto zero, non a zero: una superficie ESATTAMENTE
   * all'altezza dell'obiettivo e' una monetina lanciata a ogni fotogramma.
   */
  const CALMA = 5.5        // raggio in cui l'onda si spegne, attorno alla camera
  const AFFONDO = 0.10     // e quanto la superficie sta sotto l'obiettivo

  /** Onde: tre seni sfasati. Le normali si ricalcolano a fotogrammi alterni. */
  function anima (t, mare, frame, camX = 0, camZ = 0) {
    const pos = superficie.attributes.position.array
    const onda = mare * 0.052
    for (let k = 0; k < pos.length; k += 3) {
      const x = posBase[k]
      const z = posBase[k + 2]
      const alta = onda * (
        Math.sin(x * 0.42 + t * 1.15) * 0.6 +
        Math.sin(z * 0.63 - t * 0.86) * 0.3 +
        Math.sin((x + z) * 0.29 + t * 1.6) * 0.24
      )
      // quanto siamo lontani dall'obiettivo, in pianta
      const dx = x - camX, dz = z - camZ
      const d = Math.sqrt(dx * dx + dz * dz)
      if (d >= CALMA) { pos[k + 1] = alta; continue }
      const q = d / CALMA
      const dolce = q * q * (3 - 2 * q)          // parte e arriva senza spigolo
      pos[k + 1] = alta * dolce - AFFONDO * (1 - dolce)
    }
    superficie.attributes.position.needsUpdate = true
    if (frame % 2 === 0) superficie.computeVertexNormals()
  }

  return { gruppo, anima }
}
