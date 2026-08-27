import {
  Scene, PerspectiveCamera, WebGLRenderer, HemisphereLight, DirectionalLight,
  SRGBColorSpace, NoToneMapping, Vector3
} from 'three'
import { costruisciAcqua } from '../../src/scena/acqua.js'

/**
 * ═══ IL BANCO DELL'ACQUA — e perche' non e' il sito
 *
 * Il metro che ha bocciato `docs/15 §0-bis` misurava DUE cose dentro una
 * regione dichiarata: il **dettaglio** (differenza media fra pixel vicini, in
 * livelli) e la **superficie piatta** (quanti pixel hanno gradiente sotto un
 * livello). Il verdetto fu: mare girato 3,07 e 18,1%, acqua 3D 1,96 e 67,4%.
 *
 * Qui il metro e' ricostruito, e il banco isola l'acqua dal resto della scena
 * per una ragione precisa: **nel sito il vano del finestrone oggi mostra il
 * filmato**, non l'acqua 3D. Misurare sul sito misurerebbe la clip. Il banco
 * ricrea invece le condizioni di illuminazione di `src/scena/index.js` — le
 * stesse due luci, la stessa direzione del sole, `NoToneMapping`, lo stesso
 * spacco CSS sotto un canvas con `alpha:true` — e mette davanti all'acqua le
 * inquadrature che contano.
 *
 * ─── E IL TERMINE DI PARAGONE NON E' UN NUMERO SCRITTO A MANO
 *
 * Il banco misura anche un fotogramma di `public/filmati/salone-mare.mp4`,
 * che E' il mare girato del confronto originale. Cosi' la classe «18,1%» non
 * e' un numero ereditato da uno strumento che non esiste piu': e' un valore
 * che questa stessa funzione ricalcola nella stessa corsa, con la stessa
 * definizione di gradiente. Se la mia definizione fosse diversa da quella di
 * allora, si vedrebbe subito — perche' il riferimento si sposterebbe anche lui.
 */

const L = 1098
const H = 616

/** Le stesse di `index.js`. Se cambiano li', il banco mente. */
const LUCI = { emisfero: 2.7, sole: 3.6 }
const SOLE = new Vector3(4.5, 7, 6)

/**
 * ─── LE INQUADRATURE, e la regione dichiarata per ciascuna
 *
 * `regione` e' in frazioni del fotogramma: [x0, y0, x1, y1]. Va dichiarata e
 * non dedotta, perche' una regione scelta dopo aver visto il risultato non e'
 * una misura, e' una selezione.
 */
/**
 * ─── LA REGIONE RADENTE SI DERIVA, NON SI SCEGLIE
 *
 * La prima stesura dichiarava «dal 52% al 98% dell'altezza» e sbagliava: da
 * 3,6 m di quota, con un piano d'acqua largo 46 unita', un quinto di quella
 * fascia cade OLTRE il bordo del piano — cioe' e' fondo CSS, piatto per
 * definizione. Misurando li' si misurava soprattutto il vuoto (62,8% di
 * piatto, di cui venti punti erano cielo).
 *
 * Quindi la fascia si calcola: e' la porzione di fotogramma occupata
 * dall'acqua fra `VICINO` e `LONTANO` unita' dall'occhio. La camera non
 * becchaggia — l'invariante del sito — quindi la riga d'orizzonte cade a
 * meta' esatta e la quota a schermo di un punto a distanza d e'
 * `H/2 * tan(atan(quota/d)) / tan(FOV/2)`.
 *
 * 12 e 30 unita' non sono scelte a occhio: 12 e' dove l'acqua esce dal bordo
 * basso del fotogramma, 30 e' la distanza oltre la quale il piano di 46
 * unita' non copre piu' tutta la larghezza inquadrata. Fra quelle due la
 * regione e' acqua e basta.
 */
const QUOTA = 3.6
const VICINO = 12
const LONTANO = 30
const FOV = 34
const riga = (d) => 0.5 + 0.5 * Math.tan(Math.atan(QUOTA / d)) / Math.tan(FOV / 2 * Math.PI / 180)
/** e in larghezza si sta nel 60% centrale, per la stessa ragione: ai bordi,
 *  a 30 unita', il piano finisce. */
const FASCIA = [0.20, riga(LONTANO), 0.80, Math.min(0.99, riga(VICINO))]

const POSE = {
  /**
   * DA FUORI — l'inquadratura che oggi funziona e che non va rovinata.
   * Camera a quota zero, raggio 19,5, azimut 0,34: e' esattamente lo stato di
   * partenza di `index.js`. A quota zero il mare e' di taglio e occupa una
   * fascia sottile attorno alla riga: la regione e' quella fascia, subito
   * SOTTO la giunzione, dove il pelo dell'acqua si vede davvero.
   */
  fuori: {
    da: [Math.sin(0.34) * 19.5, 0, Math.cos(0.34) * 19.5],
    a: [0, 0, 0],
    /* A quota zero il mare e' di taglio: sta tutto in una fascia sottile
       sotto la riga. Si prende fino al 75% perche' li' dentro c'e' anche
       l'acqua che sta SOTTO l'obiettivo, che e' dove un pass fatto male va a
       sporcare per primo. */
    regione: [0.0, 0.50, 1.0, 0.75]
  },
  /**
   * RADENTE, VERSO IL SOLE — quello che si vede dal finestrone del salone.
   * Quota 3,6 m, sguardo ORIZZONTALE (la camera non becchaggia mai: e'
   * l'invariante del sito), azimut puntato dove sta il sole. Da qui il mare
   * dovrebbe essere un tappeto di scintille.
   */
  'radente-sole': {
    da: [-13.2, QUOTA, -17.6],
    a: [-13.2 + 0.6 * 10, QUOTA, -17.6 + 0.8 * 10],
    regione: FASCIA
  },
  /**
   * RADENTE, DI SPALLE AL SOLE — lo stesso angolo senza il regalo del
   * controluce. E' il caso peggiore, ed e' quello su cui va letto l'obiettivo
   * del 25%: dichiarare vittoria sulla sola posa favorevole sarebbe scegliere
   * la misura dopo aver visto il risultato.
   */
  'radente-spalle': {
    da: [13.2, QUOTA, 17.6],
    a: [13.2 - 0.6 * 10, QUOTA, 17.6 - 0.8 * 10],
    regione: FASCIA
  }
}

const palco = document.getElementById('palco')
const scena = new Scene()
const camera = new PerspectiveCamera(34, L / H, 0.1, 120)

const render = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
render.setPixelRatio(1)
render.setSize(L, H)
render.outputColorSpace = SRGBColorSpace
render.toneMapping = NoToneMapping
palco.appendChild(render.domElement)

scena.add(new HemisphereLight(0xe9e5dd, 0x071a1d, LUCI.emisfero))
const sole = new DirectionalLight(0xfff6e4, LUCI.sole)
sole.position.copy(SOLE)
scena.add(sole)

/**
 * DUE ACQUE, NON DUE PAGINE. Il prima e il dopo stanno nella stessa corsa e
 * nello stesso contesto WebGL: due caricamenti separati misurerebbero anche la
 * differenza fra due compilazioni di shader e due stati del driver.
 */
const acque = {
  /* `originale` e' l'acqua com'era PRIMA di tutto il pass, coperchio della
     scatola sommersa compreso. Serve perche' togliere quel coperchio vale per
     tutti e due i rami del confronto, e quindi il confronto da solo non se ne
     accorgerebbe: una modifica condivisa e' invisibile a un A/B. */
  originale: costruisciAcqua({ dettaglio: false, coperchio: true }),
  prima: costruisciAcqua({ dettaglio: false }),
  dopo: costruisciAcqua({ dettaglio: true })
}
for (const a of Object.values(acque)) { a.gruppo.visible = false; scena.add(a.gruppo) }

/** La tela 2D su cui si leggono i pixel COMPOSITATI: canvas sopra lo spacco. */
const tela = document.createElement('canvas')
tela.width = L; tela.height = H
const t2 = tela.getContext('2d', { willReadFrequently: true })

function componi () {
  // lo stesso gradiente del foglio di stile, sotto il canvas
  const g = t2.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0.0, '#E9E5DD')
  g.addColorStop(0.4999, '#E9E5DD')
  g.addColorStop(0.5, '#0F3438')
  g.addColorStop(1.0, '#071A1D')
  t2.globalCompositeOperation = 'source-over'
  t2.fillStyle = g
  t2.fillRect(0, 0, L, H)
  t2.drawImage(render.domElement, 0, 0)
}

/**
 * ─── IL METRO
 *
 * Su ogni pixel della regione: il gradiente e' la differenza di luminanza col
 * vicino a destra e con quello sotto, presa la maggiore delle due. In livelli
 * 0-255, non normalizzata: «sotto 1 livello» dev'essere letteralmente un
 * livello di quantizzazione, o la soglia non vuol dire niente.
 *
 * `dettaglio` e' la media del gradiente. `piatta` e' la frazione di pixel il
 * cui gradiente sta sotto 1.
 */
function metro (dati, x0, y0, x1, y1) {
  const { data, width } = dati
  const L_ = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
  let somma = 0, piatti = 0, n = 0
  for (let y = y0; y < y1 - 1; y++) {
    for (let x = x0; x < x1 - 1; x++) {
      const i = (y * width + x) * 4
      const l = L_(i)
      const gx = Math.abs(L_(i + 4) - l)
      const gy = Math.abs(L_(i + width * 4) - l)
      const g = Math.max(gx, gy)
      somma += g
      if (g < 1) piatti++
      n++
    }
  }
  return { dettaglio: somma / n, piatta: (piatti / n) * 100, pixel: n }
}

/** Il colore medio di una fascia: serve a dire se la giunzione col fondo CSS
 *  si e' spostata. Un dettaglio in piu' che sposta il colore medio sotto la
 *  linea rovinerebbe l'unica idea meccanica del sito. */
function tinta (dati, y0, y1) {
  const { data, width } = dati
  let r = 0, g = 0, b = 0, n = 0
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++
    }
  }
  return [r / n, g / n, b / n].map(v => Math.round(v * 10) / 10)
}

function disegna (quale, posa, t, mare) {
  for (const [k, a] of Object.entries(acque)) a.gruppo.visible = (k === quale)
  const p = POSE[posa]
  camera.position.set(p.da[0], p.da[1], p.da[2])
  camera.lookAt(p.a[0], p.a[1], p.a[2])
  const a = acque[quale]
  a.chiarisci(0)
  // la stessa chiamata di `index.js`: la posizione della camera in pianta
  a.anima(t, mare, Math.round(t * 60), camera.position.x, camera.position.z)
  render.render(scena, camera)
}

/**
 * Una misura = N fotogrammi consecutivi, mediati. Uno scatto solo su un mare
 * in movimento e' una monetina lanciata — la lezione di `collaudo-mare.mjs`,
 * dove un difetto andava e veniva col periodo dell'onda.
 */
function campiona (quale, posa, { mare = 4, quanti = 8, passo = 0.21, t0 = 12, regione = null } = {}) {
  const p = POSE[posa]
  const r = regione || p.regione
  const x0 = Math.round(r[0] * L), y0 = Math.round(r[1] * H)
  const x1 = Math.round(r[2] * L), y1 = Math.round(r[3] * H)
  let det = 0, pia = 0, pix = 0
  const tinte = [0, 0, 0]
  for (let i = 0; i < quanti; i++) {
    disegna(quale, posa, t0 + i * passo, mare)
    componi()
    const dati = t2.getImageData(0, 0, L, H)
    const m = metro(dati, x0, y0, x1, y1)
    det += m.dettaglio; pia += m.piatta; pix = m.pixel
    const c = tinta(dati, Math.round(H * 0.502), Math.round(H * 0.512))
    for (let k = 0; k < 3; k++) tinte[k] += c[k]
  }
  return {
    dettaglio: +(det / quanti).toFixed(3),
    piatta: +(pia / quanti).toFixed(1),
    pixel: pix,
    sottoLaLinea: tinte.map(v => +(v / quanti).toFixed(1))
  }
}

/**
 * ─── LO SFARFALLIO — la meta' della richiesta che il dettaglio non copre
 *
 * «normali che non si spengono con la distanza NE SFARFALLANO». Le due cose si
 * misurano in modo opposto: il dettaglio guarda due pixel vicini nello stesso
 * fotogramma, lo sfarfallio guarda lo stesso pixel in due fotogrammi vicini.
 * Un'acqua che vince sul primo numero e perde sul secondo e' peggio di prima,
 * perche' formicola — ed e' il modo tipico in cui il micro-rilievo aliasato si
 * presenta.
 *
 * Il passo e' 1/60 di secondo, cioe' un fotogramma vero. E il termine di
 * paragone e' di nuovo il mare girato: un mare vero, fra un fotogramma e
 * l'altro, cambia parecchio. Il numero da temere non e' «alto», e' «molto piu'
 * alto del girato».
 */
function sfarfallio (quale, posa, { mare = 4, quanti = 6, t0 = 12, dt = 1 / 60 } = {}) {
  const p = POSE[posa]
  const x0 = Math.round(p.regione[0] * L), y0 = Math.round(p.regione[1] * H)
  const x1 = Math.round(p.regione[2] * L), y1 = Math.round(p.regione[3] * H)
  const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]
  let somma = 0, n = 0
  for (let i = 0; i < quanti; i++) {
    const t = t0 + i * 0.37
    disegna(quale, posa, t, mare); componi()
    const a = t2.getImageData(0, 0, L, H).data
    disegna(quale, posa, t + dt, mare); componi()
    const b = t2.getImageData(0, 0, L, H).data
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const k = (y * L + x) * 4
        somma += Math.abs(lum(b, k) - lum(a, k)); n++
      }
    }
  }
  return +(somma / n).toFixed(3)
}

/**
 * ─── IL COSTO
 *
 * Non si misura col contatore dei fotogrammi del browser, che qui sarebbe
 * dominato dal `getImageData`. Si misura il tempo di N `render()` con una
 * lettura di un pixel dopo ciascuno: la lettura forza la sincronizzazione con
 * la GPU, senza la quale si cronometrerebbe solo l'accodamento dei comandi.
 */
function costo (posa, { mare = 4, giri = 240, scalda = 40 } = {}) {
  const gl = render.getContext()
  const buf = new Uint8Array(4)
  const giro = (quale, i) => {
    const a = performance.now()
    disegna(quale, posa, 20 + i * 0.016, mare)
    gl.readPixels(1, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf)
    return performance.now() - a
  }
  for (let i = 0; i < scalda; i++) { giro('prima', i); giro('dopo', i) }
  /**
   * ─── SI ALTERNA A OGNI FOTOGRAMMA, E SI PRENDE IL DECIMO PERCENTILE
   *
   * Tre stesure di questo pezzo, e le prime due misuravano la macchina.
   *
   *   - un tratto lungo per 'prima' e uno per 'dopo': 4,2 ms in una corsa e
   *     16,4 nella successiva, per la stessa acqua;
   *   - cinque tornate alternate e mediana: 0,97 volte, cioe' una riga di
   *     shader in piu' che costa meno di zero. Su una macchina occupata anche
   *     meta' delle tornate e' sporca, quindi la mediana e' sporca.
   *
   * Quello che regge e' alternare a ogni SINGOLO fotogramma — cosi' un
   * inciampo dello scheduler colpisce un campione solo invece di un tratto
   * intero — e leggere il decimo percentile. Il rumore aggiunge sempre tempo e
   * non lo toglie mai: la coda bassa e' la tornata in cui nessun altro stava
   * usando la GPU, ed e' l'unica che parla dello shader.
   */
  const a = [], b = []
  for (let i = 0; i < giri; i++) { a.push(giro('prima', i)); b.push(giro('dopo', i)) }
  const coda = (v) => { const w = v.slice().sort((x, y) => x - y); return w[Math.floor(w.length * 0.10)] }
  return { prima: +coda(a).toFixed(3), dopo: +coda(b).toFixed(3) }
}

/**
 * ─── `seeked` NON VUOL DIRE «IL FOTOGRAMMA E' PRONTO»
 *
 * Misurato: due corse consecutive davano al mare girato 10,73 e 3,2% la prima
 * volta e 8,17 e 27,3% la seconda, senza che fosse cambiato niente. La causa
 * e' che `seeked` scatta quando la posizione e' stata raggiunta, non quando il
 * fotogramma e' stato decodificato e presentato: `drawImage` prendeva a volte
 * il fotogramma vecchio, a volte uno mezzo pronto.
 *
 * Un termine di paragone che oscilla di venti punti non e' un termine di
 * paragone. `requestVideoFrameCallback` dice l'unica cosa che serve: che un
 * fotogramma nuovo e' stato presentato.
 */
function vaiA (v, tempo) {
  return new Promise(ok => {
    let fatto = false
    const chiudi = () => { if (!fatto) { fatto = true; ok() } }
    if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(chiudi)
    v.onseeked = () => { if (!v.requestVideoFrameCallback) chiudi() }
    v.currentTime = tempo
    // rete di sicurezza: meglio un campione dubbio che una misura appesa
    setTimeout(chiudi, 800)
  })
}

/**
 * IL MARE GIRATO — il termine di paragone, misurato con lo stesso metro.
 * La clip e' 16:9 come il vano; si disegna a tutto fotogramma e si misura la
 * stessa regione della posa radente, che e' il caso che il confronto originale
 * riguardava.
 */
async function girato (regione = POSE['radente-sole'].regione, quanti = 8) {
  const v = document.getElementById('girato')
  /* In sviluppo `public/` e' servita alla radice; ma il file esiste anche
     sotto `/public/`, perche' vite serve la cartella di progetto. Si provano
     tutte e due invece di indovinare quale. */
  /* In sviluppo `public/` e' servita alla radice, ma il file esiste anche
     sotto `/public/`. Si CHIEDE quale delle due c'e' prima di assegnarla al
     video: un `src` sbagliato lascia un 404 nella consolle, e un 404 in
     consolle e' indistinguibile da un guasto vero per chi legge il referto. */
  const vie = ['/filmati/salone-mare.mp4', '/public/filmati/salone-mare.mp4']
  let buona = null
  for (const via of vie) {
    try { if ((await fetch(via, { method: 'HEAD' })).ok) { buona = via; break } } catch (e) { /* si prova la prossima */ }
  }
  if (!buona) throw new Error('clip non trovata in nessuna delle vie: ' + vie.join(' '))
  v.src = buona
  const caricata = await new Promise(ok => {
    v.onloadeddata = () => ok(true)
    v.onerror = () => ok(false)
  })
  if (!caricata) throw new Error('clip non decodificata: ' + buona)
  const x0 = Math.round(regione[0] * L), y0 = Math.round(regione[1] * H)
  const x1 = Math.round(regione[2] * L), y1 = Math.round(regione[3] * H)
  let det = 0, pia = 0
  for (let i = 0; i < quanti; i++) {
    await vaiA(v, 1.5 + i * 0.4)
    t2.globalCompositeOperation = 'source-over'
    t2.drawImage(v, 0, 0, L, H)
    const m = metro(t2.getImageData(0, 0, L, H), x0, y0, x1, y1)
    det += m.dettaglio; pia += m.piatta
  }
  return { dettaglio: +(det / quanti).toFixed(3), piatta: +(pia / quanti).toFixed(1) }
}

/** Lo stesso numero sul mare girato, per avere la classe invece di un'opinione. */
async function sfarfallioGirato (regione = FASCIA, quanti = 6) {
  const v = document.getElementById('girato')
  if (!v.src) await girato(regione, 1)
  const x0 = Math.round(regione[0] * L), y0 = Math.round(regione[1] * H)
  const x1 = Math.round(regione[2] * L), y1 = Math.round(regione[3] * H)
  const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]
  const prendi = async (tempo) => {
    await vaiA(v, tempo)
    t2.globalCompositeOperation = 'source-over'
    t2.drawImage(v, 0, 0, L, H)
    return t2.getImageData(0, 0, L, H).data
  }
  let somma = 0, n = 0
  for (let i = 0; i < quanti; i++) {
    const t = 1.5 + i * 0.4
    const a = await prendi(t)
    const b = await prendi(t + 1 / 30)
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const k = (y * L + x) * 4
        somma += Math.abs(lum(b, k) - lum(a, k)); n++
      }
    }
  }
  return +(somma / n).toFixed(3)
}

window.__banco = { campiona, costo, sfarfallio, girato, sfarfallioGirato, disegna, componi, POSE, L, H, pronto: true }
