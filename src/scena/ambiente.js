import { CanvasTexture, EquirectangularReflectionMapping, SRGBColorSpace, Vector3 } from 'three'

/**
 * L'AMBIENTE — e perche' non e' un HDRI scaricato.
 *
 * IL DIFETTO CHE CURA. In tutto `src/` non esisteva **nessun**
 * `scene.environment`, e `materiali.js` arriva a `metalness: 0.85`. Un metallo
 * senza ambiente non ha niente da riflettere: viene fuori plastica grigia, e
 * nessuna taratura delle luci lo salva. Era il singolo salto visivo piu' grande
 * disponibile, e nessuno lo aveva fatto.
 *
 * LA STRADA SCARTATA, e perche'. La ricetta di casa dice HDRI da Poly Haven →
 * PMREM. Qui sarebbe stata sbagliata per due ragioni misurabili:
 *
 *   1. **il peso.** Un `.hdr` a 1k pesa 1-2 MB contro un budget di 500 KB per
 *      gli asset 3D (`docs/04-MISURE`), e smentirebbe la riga che il sito porta
 *      in pagina. Quella riga oggi dice 280 KB — l'impianto e la
 *      sovrastruttura sono file — ma il rapporto non cambia: un HDRI da solo
 *      peserebbe quanto tutta la geometria del sito, per riflettere colori che
 *      nel sito non esistono;
 *   2. **la tavolozza.** Una fotografia di un cielo vero porta con se' i SUOI
 *      colori. Lo scafo comincerebbe a riflettere un azzurro che nel sito non
 *      esiste, e la giunzione col fondo CSS — che e' l'unica idea meccanica del
 *      progetto — perderebbe la sua ragione.
 *
 * QUELLO CHE SI FA INVECE. L'ambiente si disegna con i colori del foglio di
 * stile: **carta sopra la linea, acqua sotto**, esattamente come la pagina.
 * Costa zero byte di rete, e lo scafo riflette la linea del sito su se stesso —
 * che non e' un ripiego, e' la tesi applicata alla luce.
 *
 * PERCHE' UNA TELA E NON UNO SHADER. Serve una equirettangolare da dare in
 * pasto a `PMREMGenerator`, che la prefiltra una volta sola alla partenza.
 * Dopo, a ogni fotogramma, non costa niente.
 */

/** Gli stessi valori di `stile.css`. Se cambiano li', cambiano qui. */
const ARIA = [233, 229, 221]
const ACQUA_VIVA = [15, 52, 56]
const ACQUA = [7, 26, 29]

/**
 * La direzione del sole della scena — `index.js` lo mette in (4.5, 7, 6).
 * Il disco luminoso dell'ambiente va MESSO LI', o i riflessi speculari
 * puntano da una parte e le ombre dall'altra: e' il genere di incoerenza che
 * non si sa nominare guardando, ma si vede.
 */
const SOLE = new Vector3(4.5, 7, 6).normalize()

const misto = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t))
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`

/**
 * @param {number} intensitaSole quanto e' luminoso il disco del sole.
 *   E' la manopola che decide se servira' il tone mapping: oltre 1 le
 *   speculari escono dal bianco e senza una curva **tagliano di netto**.
 *   Va misurata, non scelta a occhio — vedi `strumenti/collaudo-ambiente.mjs`.
 */
/**
 * @param {number} intensitaSole quanto e' luminoso il disco del sole.
 * @param {number} sotto  0 = la tavolozza della pagina. Sopra 0, la META'
 *   BASSA si schiarisce verso la carta di quel tanto.
 *
 * --- PERCHE' ESISTE `sotto`, E PERCHE' NON E' UN CAPRICCIO
 *
 * Isolando i pixel del meccanismo con `strumenti/maschera-soggetto.mjs`, alla
 * battuta della tesi il pezzo misura media 53,6 e gamma 19 su 255: scuro e
 * piatto. Provate e scartate col numero l'ombra dello scafo (0,02% dei pixel),
 * il velo dell'acqua (-1 livello) e tre forme di luce di chiave. **L'unica
 * leva che lo muove e' l'ambiente**: a intensita' 10 la media sale a 65,2.
 *
 * E ha senso fisico. `--acqua` e' il colore dell'acqua PROFONDA, scelto per il
 * fondo della pagina; ma la pinna sta un metro sotto la linea, dove l'acqua e'
 * chiara e piena di luce. Riflettere l'abisso su un pezzo che sta appena sotto
 * il pelo e' l'errore, non la correzione.
 *
 * La pagina non cambia: questa tela serve a un ambiente SEPARATO, dato per
 * materiale solo all'impianto. In three l'ambiente per materiale esiste --
 * a differenza della luce per oggetto, che non esiste e mi e' costata un'ora.
 */
export function telaAmbiente (intensitaSole = 1.0, sotto = 0) {
  const L = 512, H = 256
  const c = document.createElement('canvas')
  c.width = L; c.height = H
  const x = c.getContext('2d')

  /**
   * LA META' ALTA — la carta.
   *
   * Non e' piatta: schiarisce verso lo zenit e si scalda vicino all'orizzonte,
   * che e' come si comporta un cielo vero e come e' fatta la nostra pagina.
   * Una tinta unita darebbe riflessi morti, senza gradiente lungo la fiancata —
   * ed e' proprio il gradiente lungo che fa leggere una superficie curva.
   */
  const cielo = x.createLinearGradient(0, 0, 0, H / 2)
  cielo.addColorStop(0.00, rgb(misto(ARIA, [255, 255, 255], 0.35)))
  cielo.addColorStop(0.70, rgb(ARIA))
  cielo.addColorStop(1.00, rgb(misto(ARIA, [255, 246, 228], 0.55)))
  x.fillStyle = cielo
  x.fillRect(0, 0, L, H / 2)

  /**
   * LA META' BASSA — l'acqua.
   *
   * Scura, e piu' viva vicino all'orizzonte. E' la stessa coppia
   * `--acqua-viva` / `--acqua` del fondo CSS, nello stesso ordine.
   */
  const s = Math.max(0, Math.min(1, sotto))
  const viva = misto(ACQUA_VIVA, ARIA, s * 0.75)
  const fonda = misto(ACQUA, ARIA, s * 0.55)
  const mare = x.createLinearGradient(0, H / 2, 0, H)
  mare.addColorStop(0.00, rgb(viva))
  mare.addColorStop(0.35, rgb(misto(viva, fonda, 0.7)))
  mare.addColorStop(1.00, rgb(fonda))
  x.fillStyle = mare
  x.fillRect(0, H / 2, L, H / 2)

  /**
   * IL SOLE — un disco morbido, non un punto.
   *
   * Un punto duro da una specularita' grande come un pixel, cioe' invisibile
   * su una superficie ruvida. Il disco largo con l'alone e' cio' che disegna il
   * riflesso lungo sulla fiancata, ed e' quello che fa leggere una carena come
   * metallo verniciato invece che come plastica.
   */
  const u = Math.atan2(SOLE.x, -SOLE.z) / (2 * Math.PI) + 0.5
  const v = Math.acos(Math.max(-1, Math.min(1, SOLE.y))) / Math.PI
  const cx = u * L, cy = v * H
  const r = L * 0.085
  const alone = x.createRadialGradient(cx, cy, 0, cx, cy, r)
  alone.addColorStop(0.00, rgb([255, 250, 238], 0.95 * intensitaSole))
  alone.addColorStop(0.30, rgb([255, 246, 228], 0.45 * intensitaSole))
  alone.addColorStop(1.00, rgb([255, 246, 228], 0))
  x.fillStyle = alone
  // si ripete a destra e a sinistra: l'equirettangolare si richiude, e un
  // disco vicino al bordo altrimenti si taglia a meta'
  for (const dx of [-L, 0, L]) {
    x.save(); x.translate(dx, 0); x.fillRect(cx - r - 2, cy - r - 2, r * 2 + 4, r * 2 + 4); x.restore()
  }

  const t = new CanvasTexture(c)
  t.mapping = EquirectangularReflectionMapping
  t.colorSpace = SRGBColorSpace
  return t
}

/**
 * Prefiltra la tela e restituisce la mappa d'ambiente.
 *
 * Il `PMREMGenerator` va costruito col renderer VERO e liberato subito dopo:
 * tiene una catena di render target e non serve piu' una volta prodotta la
 * mappa. La tela sorgente si smaltisce anche lei.
 */
export function creaAmbiente (render, PMREMGenerator, intensitaSole, sotto = 0) {
  const tela = telaAmbiente(intensitaSole, sotto)
  const pmrem = new PMREMGenerator(render)
  pmrem.compileEquirectangularShader()
  const bersaglio = pmrem.fromEquirectangular(tela)
  tela.dispose()
  pmrem.dispose()
  return bersaglio.texture
}

/**
 * ─── E SOTTO COPERTA SERVE UN AMBIENTE SUO, non il cielo e non il buio
 *
 * `mondo.js` porta le maglie della traversata su uno strato proprio e mette
 * `envMapIntensity = 0`, con una ragione giusta: dentro lo scafo non c'e'
 * cielo, e il mare che entrava da tutte le paratie era il difetto peggiore che
 * quelle stanze avessero. Ma zero e' l'altro estremo, e si vede nel provino: i
 * tubi, il corrimano e i carter delle macchine sono `metalness` alto, e un
 * metallo che non riflette NIENTE non e' metallo, e' plastica opaca. Anche la
 * ruvidita' variabile e le normali di `materie-mondo.js` restano invisibili:
 * senza una sorgente larga da accrocciare, un rilievo non si legge.
 *
 * Quindi una mappa d'ambiente SUA, che descrive la stanza in cui si trova:
 * un cielino chiaro e caldo (le plafoniere), pareti a meta' tono, un pagliolo
 * scuro. Costa una tela 128x64 e una prefiltratura, cioe' zero byte di rete --
 * la stessa scelta, e le stesse ragioni, dell'ambiente di fuori.
 *
 * Non e' un HDRI e non pretende di esserlo: e' il gradiente giusto perche' un
 * tubo abbia un alto e un basso.
 */
export function creaAmbienteInterno (render, PMREMGenerator) {
  const L = 128
  const H = 64
  const c = typeof document !== 'undefined' ? document.createElement('canvas') : null
  if (!c) return null
  c.width = L; c.height = H
  const x = c.getContext('2d')

  /* dall'alto in basso: cielino caldo, paratie a meta' tono, pagliolo scuro.
     I numeri sono quelli dei materiali del mondo, non colori nuovi */
  const g = x.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0.00, 'rgb(255,238,214)')   // il cielino sotto le plafoniere
  g.addColorStop(0.22, 'rgb(150,140,126)')
  g.addColorStop(0.55, 'rgb(96,92,86)')      // le paratie
  g.addColorStop(0.80, 'rgb(46,45,43)')
  g.addColorStop(1.00, 'rgb(24,24,23)')      // il pagliolo
  x.fillStyle = g
  x.fillRect(0, 0, L, H)

  /* e due strisce piu' chiare in alto: le plafoniere sono lunghe e strette, e
     un tubo cilindrico riflette la LORO forma -- una riga, non una macchia */
  x.fillStyle = 'rgba(255,244,224,0.85)'
  x.fillRect(0, Math.round(H * 0.06), L, Math.max(1, Math.round(H * 0.05)))

  const tela = new CanvasTexture(c)
  tela.mapping = EquirectangularReflectionMapping
  tela.colorSpace = SRGBColorSpace
  const pmrem = new PMREMGenerator(render)
  pmrem.compileEquirectangularShader()
  const bersaglio = pmrem.fromEquirectangular(tela)
  tela.dispose()
  pmrem.dispose()
  return bersaglio.texture
}
