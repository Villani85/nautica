/**
 * LE MATERIE DEGLI AMBIENTI, generate invece che scaricate.
 *
 * ─── PERCHE' PROCEDURALI E NON IMMAGINI
 *
 * Il committente, guardando il provino: «e' bruttissima la traversata ancora».
 * Il file gli dava ragione senza ambiguita': 17 materiali, TRE immagini -- tutte
 * mappe d'ombra -- e NESSUNA texture di colore. Ogni superficie e' una tinta
 * piatta fra il grigio 0,20 e il grigio 0,62, quindi una paratia d'acciaio e un
 * cartongesso sono lo stesso grigio.
 *
 * Ma il peso e' gia' un vincolo misurato: i modelli stanno a 2,89 MB CHIESTI
 * ALL'APERTURA -- verificato col browser, non dichiarato. Tre ambienti con
 * colore, ruvidita' e normali sarebbero altri due o tre megabyte sulla stessa
 * soglia, e la traversata pagherebbe in attesa quello che guadagna in resa.
 *
 * Generarle qui costa ZERO BYTE di rete e qualche decina di millisecondi di
 * CPU una volta sola. Non sostituiscono una fotografia: danno alle superfici
 * quello che gli manca per non essere carta -- una ruvidita' che varia e un
 * rilievo che accroccia la luce delle plafoniere.
 *
 * ─── COSA FANNO, E COSA NO
 *
 * Fanno: lamiera mandorlata sul pagliolo, acciaio verniciato con la buccia
 * d'arancia sulle paratie, un legno appena venato sul corridoio, e su tutto una
 * ruvidita' che cambia da punto a punto -- che e' la ragione per cui una
 * superficie vera non e' mai uniforme.
 *
 * NON fanno: sporco, usura, saldature, targhette, cavi. Quelle sono contenuto e
 * vanno modellate; una texture procedurale che le imitasse si vedrebbe che si
 * ripete.
 */
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

/** Lato della tela di lavoro. 512 basta: si guarda da vicino ma in movimento. */
const LATO = 512

/**
 * ─── QUANTE VOLTE SI RIPETE, e perche' non lo so a priori
 *
 * Le UV di questi ambienti vengono dallo `smart_project` di Blender: un atlas,
 * cioe' una disposizione che impacchetta le facce senza garantire nessuna
 * proporzione fra spazio UV e metri veri. Una ripetizione che sul pavimento
 * fa mandorle da tre centimetri, sulla paratia accanto puo' farne da trenta.
 *
 * PRIMA STESURA: 5, e le mandorle uscivano grandi come foglie -- si vedeva
 * subito, e non c'era modo di calcolarlo dal file. Quindi si cerca guardando,
 * con `?materia=<n>` che moltiplica tutte le ripetizioni insieme, esattamente
 * come `?luce=`, `?quota=` e `?raggio=`.
 *
 * La cura definitiva sarebbe un UV proiettato in metri (box projection) invece
 * dell'atlas: allora una ripetizione varrebbe la stessa dimensione ovunque. E'
 * lavoro di Blender e di ricottura, ed e' scritto qui perche' qualcuno lo trovi.
 */
const SCALA = (() => {
  const v = typeof location !== 'undefined'
    ? Number(new URLSearchParams(location.search).get('materia'))
    : NaN
  return Number.isFinite(v) && v > 0 ? v : 32
})()

/**
 * ─── UN RUMORE CHE SI RIPETE SENZA GIUNZIONE
 *
 * Il rumore piu' semplice -- un valore a caso per pixel -- non serve: produce
 * grana televisiva, non materia. Serve un rumore CONTINUO, e per essere
 * ripetibile senza una riga visibile ai bordi va costruito su una griglia che
 * si richiude su se stessa.
 *
 * Interpolazione dolce (`t*t*(3-2t)`) invece che lineare: con la lineare i
 * bordi delle celle si vedono come un reticolo, ed e' il difetto classico di
 * chi scrive il primo rumore.
 */
function rumore (griglia, semi) {
  const g = new Float32Array(griglia * griglia)
  let s = semi
  const caso = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
  for (let i = 0; i < g.length; i++) g[i] = caso()
  return (x, y) => {
    const fx = x * griglia, fy = y * griglia
    const x0 = Math.floor(fx), y0 = Math.floor(fy)
    const tx = fx - x0, ty = fy - y0
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty)
    const q = (a, b) => g[((b % griglia) + griglia) % griglia * griglia + ((a % griglia) + griglia) % griglia]
    const a = q(x0, y0) * (1 - sx) + q(x0 + 1, y0) * sx
    const b = q(x0, y0 + 1) * (1 - sx) + q(x0 + 1, y0 + 1) * sx
    return a * (1 - sy) + b * sy
  }
}

/** Somma di ottave: una sola frequenza e' una nuvola, tre sono una superficie. */
function grana (semi, ottave = 3) {
  const strati = []
  for (let o = 0; o < ottave; o++) strati.push({ n: rumore(4 << o, semi + o * 7919), peso: 1 / (1 << o) })
  const tot = strati.reduce((s, x) => s + x.peso, 0)
  return (x, y) => strati.reduce((s, x2) => s + x2.n(x, y) * x2.peso, 0) / tot
}

function tela () {
  const c = document.createElement('canvas')
  c.width = c.height = LATO
  return { c, x: c.getContext('2d', { willReadFrequently: true }) }
}

function daDati (dati, srgb) {
  const { c, x } = tela()
  x.putImageData(dati, 0, 0)
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  if (srgb) t.colorSpace = SRGBColorSpace
  return t
}

/**
 * Da un campo di altezza a una mappa di normali, per differenze finite.
 * `forza` e' quanto il rilievo piega la luce: sopra 3 la superficie sembra
 * stampata a rilievo, sotto 0,5 non si vede.
 */
function normaliDa (altezza, forza) {
  const { x } = tela()
  const d = x.createImageData(LATO, LATO)
  const a = (i, j) => altezza(((i % LATO) + LATO) % LATO / LATO, ((j % LATO) + LATO) % LATO / LATO)
  for (let j = 0; j < LATO; j++) {
    for (let i = 0; i < LATO; i++) {
      const dx = (a(i + 1, j) - a(i - 1, j)) * forza
      const dy = (a(i, j + 1) - a(i, j - 1)) * forza
      const l = Math.hypot(dx, dy, 1)
      const k = (j * LATO + i) * 4
      d.data[k] = Math.round((-dx / l * 0.5 + 0.5) * 255)
      d.data[k + 1] = Math.round((-dy / l * 0.5 + 0.5) * 255)
      d.data[k + 2] = Math.round((1 / l * 0.5 + 0.5) * 255)
      d.data[k + 3] = 255
    }
  }
  return daDati(d, false)
}

/** Un canale solo, replicato su rgb: three legge la ruvidita' dal verde. */
function scalaDa (f) {
  const { x } = tela()
  const d = x.createImageData(LATO, LATO)
  for (let j = 0; j < LATO; j++) {
    for (let i = 0; i < LATO; i++) {
      const v = Math.max(0, Math.min(1, f(i / LATO, j / LATO)))
      const k = (j * LATO + i) * 4
      d.data[k] = d.data[k + 1] = d.data[k + 2] = Math.round(v * 255)
      d.data[k + 3] = 255
    }
  }
  return daDati(d, false)
}

/* ─── I TRE CAMPI DI ALTEZZA ──────────────────────────────────────────────── */

/**
 * LAMIERA MANDORLATA. I rilievi a mandorla non sono decorazione: sono
 * antisdrucciolo, ed e' il pavimento di ogni locale macchine. Due file
 * incrociate, sfalsate, perche' una sola griglia si legge come piastrelle.
 */
function mandorlata (g) {
  return (u, v) => {
    const P = 8
    let h = 0
    for (const [ang, sf] of [[0.6, 0], [-0.6, 0.5]]) {
      const c = Math.cos(ang), s = Math.sin(ang)
      const x = (u * c - v * s) * P + sf
      const y = (u * s + v * c) * P + sf
      const fx = x - Math.floor(x) - 0.5
      const fy = y - Math.floor(y) - 0.5
      const d = Math.hypot(fx * 1.0, fy * 3.2)
      if (d < 0.42) h = Math.max(h, Math.cos(d / 0.42 * Math.PI / 2))
    }
    return h * 0.85 + g(u, v) * 0.15
  }
}

/**
 * BUCCIA D'ARANCIA. Una paratia verniciata a spruzzo non e' liscia: la vernice
 * si rapprende in una grana fitta e irregolare, ed e' quella che fa correre il
 * riflesso di una plafoniera invece di farlo stare fermo.
 */
function buccia (g, g2) {
  return (u, v) => g(u * 3, v * 3) * 0.6 + g2(u * 11, v * 11) * 0.4
}

/** VENA DI LEGNO: stesso rumore, ma stirato in una direzione sola. */
function vena (g) {
  return (u, v) => {
    const t = g(u * 0.6, v * 9) * 6
    return (t - Math.floor(t)) * 0.35 + g(u, v) * 0.65
  }
}

/* ─── E COME SI VESTONO I MATERIALI ───────────────────────────────────────── */

let cache = null

function costruisci () {
  if (cache) return cache
  const g1 = grana(20260901)
  const g2 = grana(77712345)

  const hMand = mandorlata(g1)
  const hBuccia = buccia(g1, g2)
  const hVena = vena(g1)

  cache = {
    pagliolo: {
      normal: normaliDa(hMand, 2.2),
      rough: scalaDa((u, v) => 0.62 + hMand(u, v) * 0.22),
      ripeti: 5
    },
    paratia: {
      normal: normaliDa(hBuccia, 0.9),
      rough: scalaDa((u, v) => 0.48 + hBuccia(u, v) * 0.3),
      ripeti: 3
    },
    legno: {
      normal: normaliDa(hVena, 0.7),
      rough: scalaDa((u, v) => 0.5 + hVena(u, v) * 0.28),
      ripeti: 2
    }
  }
  return cache
}

/**
 * Quale materia va su quale materiale. Si decide dal NOME, che e' quello che il
 * contratto Blender assegna e che nessuno cambia per caso -- e se domani un nome
 * cambia, questa mappa non trova piu' niente e la superficie torna piatta, che
 * e' un degrado visibile e non un errore silenzioso.
 */
function materiaPer (nome) {
  if (/pagliolo|pavimento|gradino/i.test(nome)) return 'pagliolo'
  if (/paratia|parete|soffitto|fondazione/i.test(nome)) return 'paratia'
  if (/GUSCIO/i.test(nome)) return 'legno'
  return null
}

/**
 * Veste le maglie di un gruppo. Ritorna quante ne ha vestite, perche' un numero
 * si guarda e una promessa no.
 */
/**
 * ─── E SI POSSONO PREPARARE PRIMA, perche' non dipendono da niente
 *
 * MISURATO: l'ancoraggio del mondo -- il fotogramma in cui il GLB arriva, si
 * isola dalla luce di fuori, si veste e si arreda -- costa 756 ms, e sono
 * TUTTI qui: generare le tele procedurali (mandorlata, buccia, vena, e le
 * normali che ne derivano) e' l'unica parte pesante. Isolamento 0 ms, arredo 4,
 * luci 1.
 *
 * Ma queste tele non dipendono dal GLB: sono rumore e aritmetica. Chiamando
 * `preparaMaterie()` presto -- alla creazione del mondo, mentre il file da 1,6
 * MB e' ancora in volo -- l'ancoraggio scende da 761 a 7 ms.
 *
 * E VA DETTO COSA NON CAMBIA: il totale dei fotogrammi lunghi all'avvio resta
 * lo stesso (8,3 s su questa macchina, misurati sommando ogni fotogramma sopra
 * i 150 ms). Il lavoro non sparisce, si sposta: esce dal fotogramma in cui il
 * mondo si aggancia -- che e' quello piu' carico, perche' li' arrivano anche il
 * parsing del GLB e le prime compilazioni -- e entra in uno in cui non sta
 * arrivando nient'altro. E' un guadagno di distribuzione, non di lavoro, e
 * chiamarlo diversamente sarebbe raccontare una cosa che la misura non dice.
 */
export function preparaMaterie () { costruisci() }

export function vestiMondo (gruppo) {
  if (typeof document === 'undefined') return 0
  const m = costruisci()
  let n = 0
  const fatti = new Set()
  gruppo.traverse((o) => {
    if (!o.isMesh || !o.material) return
    const mm = Array.isArray(o.material) ? o.material : [o.material]
    for (const mat of mm) {
      if (!mat || fatti.has(mat.uuid)) continue
      const q = materiaPer(mat.name || o.name || '')
      if (!q) continue
      const s = m[q]
      mat.normalMap = s.normal
      mat.roughnessMap = s.rough
      mat.normalScale?.set(1, 1)
      for (const t of [s.normal, s.rough]) t.repeat.set(s.ripeti * SCALA, s.ripeti * SCALA)
      mat.needsUpdate = true
      fatti.add(mat.uuid)
      n++
    }
  })
  return n
}
