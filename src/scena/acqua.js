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

/**
 * ─── L'ACQUA NON PRENDE L'AMBIENTE, e non e' un dettaglio di resa.
 *
 * Collegando `scene.environment` alla scena della nave, il pelo dell'acqua —
 * che e' un materiale metallico a 0,32 — ha cominciato a riflettere il cielo
 * chiaro dell'ambiente, e la meta' sotto la linea e' diventata **grigio
 * pallido** invece del verde scuro del foglio di stile. Il fondo CSS si ferma
 * netto al 50% e incontra il canvas: se il canvas cambia colore li', la
 * giunzione si vede, e la giunzione a zero pixel e' l'unica idea meccanica del
 * sito.
 *
 * Quindi l'ambiente vale per i metalli della nave — che senza non hanno niente
 * da riflettere ed escono plastica — e **non** per l'acqua, che non e' una
 * superficie da rendere: e' il fondo della pagina, prolungato dentro il canvas.
 */
  const pelo = new Mesh(superficie, new MeshStandardMaterial({
    color: 0x14454a, metalness: 0.32, roughness: 0.14,
    transparent: true, opacity: 0.88, side: DoubleSide,
    envMapIntensity: 0
  }))
  gruppo.add(pelo)

/**
 * ─── QUANTO E' FONDA L'ACQUA, e perche' durante la sezione si fa da parte
 *
 * Il volume sommerso e' una scatola scura sopra tutto cio' che sta sotto la
 * linea. Al 72% di opacita' l'acqua **si mangiava il soggetto**: nella battuta
 * del meccanismo si vedeva una macchia scura dentro una macchia scura, mentre
 * la didascalia diceva «the part you never see... it decides whether anyone is
 * comfortable on board». Il capitolo nascondeva davvero la cosa che dichiarava
 * di mostrare, ed e' il difetto peggiore che possa avere: non un errore di
 * resa, una contraddizione fra quello che dice e quello che fa vedere.
 *
 * Isolato in un colpo con la diagnostica senzaAcqua: senza, si leggono
 * attuatore, soffietti, flangia, albero e pinna; con, spariscono.
 *
 * Quindi durante la sezione l'acqua si schiarisce. Non e' un espediente: e' la
 * stessa regola che ferma il rollio quando il piano entra — un disegno tecnico
 * e' fermo — applicata al mezzo invece che al moto. Dentro il taglio si e' in
 * registro tecnico, e li' l'acqua e' una quota, non un oceano.
 *
 * Resta acqua: colore, pelo e riflessi non cambiano. Cambia solo quanto pesa.
 */
const FONDA = 0.72      // a nave intera: il sotto e' un altro mondo
/* Dentro il taglio l'acqua e' una QUOTA, non un ambiente: piu' si entra, meno
   deve pesare. A 0,25 il meccanismo restava sotto una patina verde e i suoi
   materiali — che ora hanno un ambiente vero da riflettere — non arrivavano.
   Misurato guardando il provino a 2,3 unita': il motore leggeva come una
   sagoma, non come un pezzo. */
const CHIARA = 0.12     // dentro il taglio: l'acqua e' una quota

  const materialeVolume = new MeshBasicMaterial({
    color: 0x061518, transparent: true, opacity: FONDA, depthWrite: false
  })
  const volume = new Mesh(new BoxGeometry(LARG, 13, PROF), materialeVolume)
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

  /** Il taglio schiarisce l'acqua: q va da 0 (nave intera) a 1 (sezione). */
  function chiarisci (q) {
    materialeVolume.opacity = FONDA + (CHIARA - FONDA) * Math.max(0, Math.min(1, q))
  }

  return { gruppo, anima, chiarisci }
}
