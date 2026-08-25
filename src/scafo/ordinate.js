import { BufferGeometry, BufferAttribute, Shape, ShapeGeometry } from 'three'

/**
 * LO SCAFO — loft fra ordinate.
 *
 * LA REGOLA CHE TIENE IN PIEDI TUTTO IL RESTO:
 * la superficie e il tappo di sezione passano dalla STESSA funzione,
 * `sezioneA(t)`. Non due implementazioni che "fanno la stessa cosa".
 *
 * Il motivo e' che il difetto, se divergono, non da' errore: la formula del
 * tappo continua a restituire un poligono valido, ma non e' piu' la sezione
 * della superficie disegnata. Si vede come una scheggia di carta che sporge
 * dallo scafo, e si da' la colpa al materiale.
 *
 * Chi addolcisce il loft in futuro deve cambiare `sezioneA` e basta.
 * Se ti trovi a scrivere una seconda interpolazione, ti sei gia' sbagliato.
 */

// Unita' di scena: 1 = 2,5 m. Scafo z in [-8, +8] = 40 m.
export const PRUA_Z = -8
export const POPPA_Z = 8
const LUNG = POPPA_Z - PRUA_Z

/**
 * Ordinate: mezza sezione, lato dritto. t = 0 prua, t = 1 specchio.
 * Verificate: 40,0 m x 8,30 m, L/B 4,82, pescaggio 2,35 m,
 * deadrise da 58,0 gradi a prua a 15,3 allo specchio.
 */
const ORDINATE = [
  // t     semilarg  chiglia  spigoloY  spigoloX  ponteY
  [0.00,   0.26,    -0.60,   -0.28,    0.20,     1.02],
  [0.14,   0.76,    -0.86,   -0.30,    0.62,     0.99],
  [0.28,   1.16,    -0.94,   -0.28,    1.02,     0.96],
  [0.42,   1.46,    -0.94,   -0.26,    1.36,     0.94],
  [0.56,   1.62,    -0.90,   -0.24,    1.56,     0.92],
  [0.70,   1.66,    -0.82,   -0.22,    1.63,     0.91],
  [0.85,   1.62,    -0.72,   -0.20,    1.60,     0.90],
  [1.00,   1.55,    -0.60,   -0.18,    1.54,     0.90]
]

/** L'UNICA interpolazione. Tutto il resto del file la chiama. */
export function sezioneA (t) {
  t = Math.max(0, Math.min(1, t))
  let i = 0
  while (i < ORDINATE.length - 2 && ORDINATE[i + 1][0] < t) i++
  const a = ORDINATE[i]
  const b = ORDINATE[i + 1]
  const u = (t - a[0]) / (b[0] - a[0])
  return {
    semilarg: a[1] + (b[1] - a[1]) * u,
    chiglia:  a[2] + (b[2] - a[2]) * u,
    spigoloY: a[3] + (b[3] - a[3]) * u,
    spigoloX: a[4] + (b[4] - a[4]) * u,
    ponteY:   a[5] + (b[5] - a[5]) * u
  }
}

export const tDaZ = z => (z - PRUA_Z) / LUNG
export const zDaT = t => PRUA_Z + t * LUNG

const GIRO = 15   // campioni per mezza sezione: 8 sul ginocchio, 7 sulla murata

/**
 * Il contorno chiuso di una sezione, come lista di punti [x, y].
 * Parte dalla chiglia, sale a dritta fino al ponte, traversa a sinistra,
 * ridiscende. Chiuso.
 */
export function contornoA (t) {
  const s = sezioneA(t)
  const dritta = []

  // ginocchio di carena: quadratica dalla chiglia allo spigolo.
  // Il punto di controllo tiene la V a prua e appiattisce verso poppa.
  const cx = s.spigoloX * 0.58
  const cy = s.chiglia
  for (let i = 1; i <= 8; i++) {
    const u = i / 8
    const w = (1 - u) * (1 - u)
    const m = 2 * (1 - u) * u
    const v = u * u
    dritta.push([
      w * 0 + m * cx + v * s.spigoloX,
      w * s.chiglia + m * cy + v * s.spigoloY
    ])
  }
  // Murata: dallo spigolo al trincarino.
  // DIFETTO CORRETTO — la prima stesura aggiungeva una "pancia"
  // sin(u*PI)*0.045 alla murata. Effetto: il punto piu' largo dello scafo
  // finiva a meta' murata invece che al trincarino, cioe' un rientro
  // rovesciato che sui motoryacht non esiste, e il baglio saliva a 8,45 m
  // contro gli 8,30 dichiarati e verificati. La svasatura deve venire dalla
  // tabella delle ordinate (spigoloX -> semilarg), non da un termine aggiunto.
  for (let i = 1; i <= 7; i++) {
    const u = i / 7
    const e = u * u * (3 - 2 * u)   // smoothstep: parte dallo spigolo senza spigolo
    dritta.push([
      s.spigoloX + (s.semilarg - s.spigoloX) * e,
      s.spigoloY + (s.ponteY - s.spigoloY) * u
    ])
  }

  const punti = [[0, s.chiglia]]
  for (const p of dritta) punti.push(p)
  for (let i = dritta.length - 1; i >= 0; i--) punti.push([-dritta[i][0], dritta[i][1]])
  return punti   // 1 + GIRO + GIRO = 31 punti, chiuso implicitamente sulla chiglia
}

const PER_ANELLO = 1 + GIRO * 2

/** La stessa cosa, come Shape di three — per i tappi. */
export function profiloA (t) {
  const p = contornoA(t)
  const sh = new Shape()
  sh.moveTo(p[0][0], p[0][1])
  for (let i = 1; i < p.length; i++) sh.lineTo(p[i][0], p[i][1])
  sh.closePath()
  return sh
}

/**
 * IL TAPPO a una quota qualsiasi. Non approssimato, non ricavato con lo
 * stencil: e' `profiloA` della stessa t che genera la superficie.
 */
export function tappoA (z) {
  const g = new ShapeGeometry(profiloA(tDaZ(z)))
  g.translate(0, 0, z)
  return g
}

/** Il guscio: anelli di `contornoA` cuciti a quad. */
export function costruisciGuscio (anelli = 64) {
  const pos = []
  const anello = []
  for (let a = 0; a <= anelli; a++) {
    const t = a / anelli
    const z = zDaT(t)
    const c = contornoA(t)
    anello.push(c)
    for (const [x, y] of c) pos.push(x, y, z)
  }

  const idx = []
  for (let a = 0; a < anelli; a++) {
    const base = a * PER_ANELLO
    const succ = (a + 1) * PER_ANELLO
    for (let i = 0; i < PER_ANELLO; i++) {
      const j = (i + 1) % PER_ANELLO
      idx.push(base + i, succ + i, succ + j)
      idx.push(base + i, succ + j, base + j)
    }
  }

  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

export const _interno = { ORDINATE, PER_ANELLO, GIRO }
