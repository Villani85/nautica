import { BufferGeometry, BufferAttribute, Shape, Path, ShapeGeometry } from 'three'

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
 *
 * DUE DIFETTI CORRETTI nella prima stesura, trovati misurando la tabella
 * invece di guardarla:
 *
 * 1. A t=0 la semilarghezza era 0,26. Chiudendo il loft con `tappoA` quello
 *    diventava una PIASTRA PIATTA larga 1,30 m e alta 4,05 — quasi quattro
 *    metri quadri di lamiera verticale al posto del dritto di prua. Ora la
 *    prima ordinata e' un dritto vero: 0,04 di semilarghezza, 20 cm.
 *
 * 2. Il cavallino era 30 cm su 40 m, con rapporto di bordo libero
 *    prua/mezzanave a 1,10. Un quaranta metri sta fra 1,35 e 1,55: sotto quel
 *    valore lo scafo legge come una chiatta, ed e' esattamente il rilievo
 *    arrivato guardando la scena. La quota del ponte segue ora una curva
 *    (1-t)^2,5 fra 0,890 a poppa e 1,360 a prua, non una spezzata: una
 *    spezzata produce grinze visibili sul trincarino.
 */
const ORDINATE = [
  // t     semilarg  chiglia  spigoloY  spigoloX  ponteY
  [0.00,   0.04,    -0.30,   -0.22,    0.03,     1.360],   // dritto di prua
  [0.06,   0.34,    -0.62,   -0.28,    0.26,     1.293],
  [0.16,   0.82,    -0.86,   -0.30,    0.66,     1.194],
  [0.30,   1.20,    -0.94,   -0.28,    1.06,     1.083],
  [0.44,   1.48,    -0.94,   -0.26,    1.38,     1.000],
  [0.58,   1.62,    -0.90,   -0.24,    1.56,     0.944],
  [0.72,   1.66,    -0.82,   -0.22,    1.63,     0.910],
  [0.86,   1.62,    -0.72,   -0.20,    1.60,     0.893],
  [1.00,   1.55,    -0.60,   -0.18,    1.54,     0.890]
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

const GIRO = 16   // 8 sul ginocchio + lo spigolo sdoppiato + 7 sulla murata

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
  /**
   * ─── LO SPIGOLO DI CARENA VA SDOPPIATO, O NON ESISTE
   *
   * Il commento qui sotto dice «smoothstep: parte dallo spigolo senza
   * spigolo», e dichiara un raccordo continuo. La matematica fa l'opposto:
   * `smoothstep'(0) = 0`, quindi la murata lascia lo spigolo VERTICALE mentre
   * il ginocchio ci arriva inclinato. Lo smoothstep non toglie lo spigolo, lo
   * CREA. Misurato sulle nove ordinate, angolo fra le due tangenti:
   *
   *     t=0,00   9,0°      t=0,44  40,4°      t=0,86  52,3°
   *     t=0,16  26,3°      t=0,58  44,8°      t=1,00  57,0°
   *     t=0,30  34,0°      t=0,72  48,8°      medio   36,7°
   *
   * Uno spigolo vero, fino a 57 gradi a poppa. E `computeVertexNormals()` lo
   * mediava via, perche' il punto era UNO SOLO e condiviso fra le due
   * superfici: la normale usciva a meta' strada e lo scafo si leggeva come un
   * gradiente lungo e continuo -- la lettura da «estrusione liscia».
   *
   * Su un motoryacht quello spigolo e' la linea piu' leggibile a distanza: e'
   * quella che prende una lama di luce da prua a poppa e dice all'occhio dove
   * sta la carena.
   *
   * Il punto si emette DUE VOLTE, alla stessa posizione. Il quad fra i due e'
   * degenere e viene saltato in `costruisciGuscio`; ognuno dei due riceve
   * cosi' le facce di una superficie sola, e la normale non si media piu'.
   * Costa due vertici per anello e zero byte di trasferimento -- la geometria
   * nasce nel browser.
   */
  dritta.push([s.spigoloX, s.spigoloY])
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
  return punti   // 1 + GIRO + GIRO = 33 punti, chiuso implicitamente sulla chiglia
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
 * SPESSORE DELLA PARETE nella faccia di sezione.
 *
 * Non e' lo spessore vero di un fasciame — quello sarebbe 3 cm, cioe' 0,012
 * unita', e a schermo non si vedrebbe. E' lo spessore del DISEGNO: in una
 * tavola tecnica la parete tagliata si annerisce perche' si veda, non perche'
 * sia in scala. 11 cm e' la quota che legge da spaccato senza diventare assurda.
 */
const PARETE = 0.045

/**
 * Il contorno interno: lo stesso profilo, spostato verso l'interno di
 * `PARETE` lungo la normale in ogni punto.
 *
 * Non una seconda tabella e non una scalatura verso il centro — che
 * assottiglierebbe la parete dove la sezione e' larga e la ingrosserebbe dove
 * e' stretta. La normale si ricava dai due segmenti adiacenti, e il verso dal
 * segno dell'area: cosi' funziona comunque, anche se un giorno il contorno
 * viene percorso al contrario.
 */
export function contornoInternoA (t, parete = PARETE) {
  const p = contornoA(t)
  const n = p.length

  let area = 0
  for (let i = 0; i < n; i++) {
    const a = p[i], b = p[(i + 1) % n]
    area += a[0] * b[1] - b[0] * a[1]
  }
  const verso = area > 0 ? 1 : -1

  const dentro = []
  for (let i = 0; i < n; i++) {
    const a = p[(i - 1 + n) % n], b = p[i], c = p[(i + 1) % n]
    let nx = 0, ny = 0
    for (const [q, r] of [[a, b], [b, c]]) {
      const dx = r[0] - q[0], dy = r[1] - q[1]
      const L = Math.hypot(dx, dy) || 1
      nx += -dy / L; ny += dx / L
    }
    const L = Math.hypot(nx, ny) || 1
    // La normale sinistra di un poligono percorso in senso antiorario punta
    // gia' DENTRO: si somma, non si sottrae. Sbagliando il segno l'anello
    // veniva piu' grande dell'esterno, e il controllo lo bocciava — che e'
    // esattamente il suo mestiere.
    dentro.push([b[0] + verso * (nx / L) * parete, b[1] + verso * (ny / L) * parete])
  }
  return dentro
}

/**
 * Il contorno interno regge? A prua la sezione e' larga 10 cm: una parete da
 * 11 la farebbe collassare su se stessa, e il triangolatore produrrebbe una
 * figura rovesciata **senza dare errore**. Si controlla che l'area interna sia
 * ancora positiva e sensibilmente piu' piccola di quella esterna.
 */
function areaSegnata (p) {
  let a = 0
  for (let i = 0; i < p.length; i++) {
    const u = p[i], v = p[(i + 1) % p.length]
    a += u[0] * v[1] - v[0] * u[1]
  }
  return a / 2
}

function internoValido (esterno, interno) {
  const ae = areaSegnata(esterno)
  const ai = areaSegnata(interno)
  // Il VERSO deve restare lo stesso. Con il valore assoluto un contorno
  // rovesciato — quello che succede quando la parete e' piu' spessa della
  // meta' della sezione — passerebbe il controllo e il triangolatore
  // produrrebbe una figura sbagliata senza dare errore.
  if (Math.sign(ae) !== Math.sign(ai)) return false
  const r = Math.abs(ai) / Math.abs(ae)
  return r > 0.02 && r < 0.94
}

/**
 * IL TAPPO a una quota qualsiasi, come ANELLO fra profilo esterno e interno.
 *
 * Non approssimato, non ricavato con lo stencil: e' `profiloA` della stessa t
 * che genera la superficie. Dove la sezione e' troppo piccola perche' una
 * parete ci stia — la prua — il tappo torna pieno invece di rovesciarsi.
 */
export function tappoA (z) {
  const t = tDaZ(z)
  const esterno = contornoA(t)
  const interno = contornoInternoA(t)
  const sh = profiloA(t)
  if (internoValido(esterno, interno)) {
    const buco = new Path()
    buco.moveTo(interno[0][0], interno[0][1])
    for (let i = 1; i < interno.length; i++) buco.lineTo(interno[i][0], interno[i][1])
    buco.closePath()
    sh.holes.push(buco)
  }
  const g = new ShapeGeometry(sh)
  g.translate(0, 0, z)
  return g
}

/** Il guscio: anelli di `contornoA` cuciti a quad. */
export function costruisciGuscio (anelli = 64) {
  const pos = []
  const uv = []
  const anello = []
  for (let a = 0; a <= anelli; a++) {
    const t = a / anelli
    const z = zDaT(t)
    const c = contornoA(t)
    anello.push(c)
    for (const [x, y] of c) pos.push(x, y, z)
    /**
     * --- LE UV ESISTONO GIA' NELLA COSTRUZIONE, BASTA SCRIVERLE
     *
     * Questa superficie e' un loft su una griglia regolare: `a` corre lungo la
     * nave, `i` lungo il giro dell'ordinata. Sono gia' due coordinate fra 0 e
     * 1, e srotolarla con un algoritmo sarebbe rifare peggio un lavoro che la
     * geometria fa da se'.
     *
     * Servono per cuocere l'occlusione ambientale, che sullo scafo non c'era:
     * misurata dalla stessa camera del render Cycles, la coperta AL RIPARO
     * sotto la tuga era luminosa quanto quella scoperta -- rapporto 1,02 dove
     * il render da' 0,83.
     *
     * E qui non costano un byte di trasferimento: la geometria si costruisce
     * nel browser, quindi le UV nascono con lei.
     */
    // DUE SUPERFICI IN UN ATLANTE SOLO. Il guscio sta nella meta' bassa delle
    // v, il ponte in quella alta: una texture invece di due richieste, e in
    // mezzo resta un margine perche' la cottura non sanguini dall'una
    // all'altra. I margini non sono decorativi -- a 512 px, quattro centesimi
    // sono venti pixel, cioe' piu' del raggio del filtro bilineare a mip 1.
    for (let i = 0; i < c.length; i++) uv.push(a / anelli, 0.02 + (i / c.length) * 0.44)
  }

  /* dove il contorno emette due volte lo stesso punto: si calcola una volta
     sola, sull'anello di mezzanave, perche' la topologia non cambia con `t` */
  const rif = contornoA(0.5)
  const coincidenti = rif.map((p, i) => {
    const q = rif[(i + 1) % rif.length]
    return Math.abs(p[0] - q[0]) < 1e-9 && Math.abs(p[1] - q[1]) < 1e-9
  })

  const idx = []
  for (let a = 0; a < anelli; a++) {
    const base = a * PER_ANELLO
    const succ = (a + 1) * PER_ANELLO
    for (let i = 0; i < PER_ANELLO; i++) {
      const j = (i + 1) % PER_ANELLO
      /* il quad fra i due punti coincidenti dello spigolo e' degenere: si
         salta, cosi' le due superfici non si passano normali attraverso una
         faccia di area nulla */
      if (coincidenti[i]) continue
      // AVVOLGIMENTO: le normali devono puntare FUORI.
      // La prima stesura le faceva puntare dentro — tutte e 544 quelle di
      // murata. Con un materiale a doppia faccia non si vedeva: three rovescia
      // la normale sulle facce posteriori e l'illuminazione tornava. Il difetto
      // e' emerso solo separando esterno e interno in due materiali, quando le
      // due facce si sono scambiate e la murata e' diventata nera.
      idx.push(base + i, succ + j, succ + i)
      idx.push(base + i, base + j, succ + j)
    }
  }

  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  const attrUv = new BufferAttribute(new Float32Array(uv), 2)
  g.setAttribute('uv', attrUv)
  /**
   * ─── E LO STESSO SET COME `uv1`, O LE MAPPE COTTE NON ESISTONO
   *
   * DIFETTO TROVATO MISURANDO, e vecchio quanto la mappa. Da three r152
   * `aoMap` e `lightMap` leggono `uv1`, non `uv`. Questa geometria dichiarava
   * solo `uv`, quindi il secondo canale non c'era e le due mappe non venivano
   * campionate affatto.
   *
   * Non dava errore e non si vedeva: dava un sito che spediva
   * `scafo-ao.webp` -- 12.786 byte a ogni visita -- senza che quei byte
   * arrivassero a un pixel. La prova e' netta: portando `lightMapIntensity` a
   * DIECI il fotogramma restava identico al bit, media 214,8 e scarto tipo
   * 25,0 / 22,4 / 21,6 in tutte e due le corse. Una mappa che a intensita'
   * dieci non cambia niente non e' debole: non c'e'.
   *
   * Le UV sono le stesse -- il bake nasce da questa parametrizzazione, non da
   * uno srotolamento diverso -- quindi il secondo canale e' l'attributo
   * stesso, senza copiare un byte di memoria.
   */
  g.setAttribute('uv1', attrUv)
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/**
 * IL PONTE — la striscia fra trincarino di dritta e trincarino di sinistra.
 *
 * Senza, il guscio e' un trogolo aperto: la camera vede dentro lo scafo
 * ovunque la sovrastruttura non copra, e l'interno — illuminato dalle sole
 * luci fredde — legge come una macchia verde. E' lo stesso difetto gia'
 * trovato agli estremi, in una terza forma.
 *
 * Anche qui nessuna geometria nuova: i bordi sono gli ultimi punti di
 * `contornoA`, cioe' la superficie stessa. Se il cavallino cambia, il ponte
 * lo segue senza che nessuno lo aggiorni.
 */
export function costruisciPonte (anelli = 72) {
  const pos = []
  const uv = []
  for (let a = 0; a <= anelli; a++) {
    const t = a / anelli
    const z = zDaT(t)
    const c = contornoA(t)
    const dritta = c[GIRO]                 // ultimo punto del lato dritto: il trincarino
    const sinistra = c[c.length - GIRO]    // il suo speculare a sinistra
    pos.push(dritta[0], dritta[1], z, sinistra[0], sinistra[1], z)
    // il ponte e' una striscia: u lungo la nave, v da un trincarino all'altro
    uv.push(a / anelli, 0.54, a / anelli, 0.98)
  }
  const idx = []
  for (let a = 0; a < anelli; a++) {
    const b = a * 2, n = (a + 1) * 2
    // Stesso difetto del guscio, trovato dallo stesso controllo: le normali
    // del ponte puntavano in giu'. Un ponte illuminato da sotto non da' errore,
    // da' una superficie che sembra sbagliata e non si sa perche'.
    idx.push(b, n + 1, n, b, b + 1, n + 1)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  const attrUv = new BufferAttribute(new Float32Array(uv), 2)
  g.setAttribute('uv', attrUv)
  /**
   * ─── E LO STESSO SET COME `uv1`, O LE MAPPE COTTE NON ESISTONO
   *
   * DIFETTO TROVATO MISURANDO, e vecchio quanto la mappa. Da three r152
   * `aoMap` e `lightMap` leggono `uv1`, non `uv`. Questa geometria dichiarava
   * solo `uv`, quindi il secondo canale non c'era e le due mappe non venivano
   * campionate affatto.
   *
   * Non dava errore e non si vedeva: dava un sito che spediva
   * `scafo-ao.webp` -- 12.786 byte a ogni visita -- senza che quei byte
   * arrivassero a un pixel. La prova e' netta: portando `lightMapIntensity` a
   * DIECI il fotogramma restava identico al bit, media 214,8 e scarto tipo
   * 25,0 / 22,4 / 21,6 in tutte e due le corse. Una mappa che a intensita'
   * dieci non cambia niente non e' debole: non c'e'.
   *
   * Le UV sono le stesse -- il bake nasce da questa parametrizzazione, non da
   * uno srotolamento diverso -- quindi il secondo canale e' l'attributo
   * stesso, senza copiare un byte di memoria.
   */
  g.setAttribute('uv1', attrUv)
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

export const _interno = { ORDINATE, PER_ANELLO, GIRO }
