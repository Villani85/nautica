import {
  Group, Mesh, PlaneGeometry, BoxGeometry, MeshBasicMaterial, MeshStandardMaterial,
  CanvasTexture, SRGBColorSpace, DoubleSide, LinearFilter
} from 'three'

/**
 * L'ALLESTIMENTO — la metà emotiva della tesi.
 *
 * *Sopra la gente sta comoda; sotto, venti macchine lavorano perché ci stia.*
 * Senza questa metà il sito è un disegno tecnico; con questa, è una nave.
 *
 * LA REGOLA (doc 09 §9): ciò che è diagramma si costruisce, ciò che è
 * fotografia si vede attraverso un'apertura. I divani e il tavolo sono
 * diagramma: geometria. Le persone sono fotografia: piani ritagliati, visti
 * attraverso il finestrino.
 *
 * E QUI STA L'INVERSIONE CHE E' LA TESI.
 *
 * L'orizzonte (`fuoribordo.js`) sta in coordinate MONDO e non rolla.
 * Queste figure sono FIGLIE DELLA NAVE e rollano con la stanza.
 *
 * Guardando dal finestrino si vedono insieme: la stanza che si inclina e
 * l'orizzonte che resta piatto. È la stessa immagine che il modello video
 * generativo non è riuscito a produrre in dieci secondi — perché tratta il
 * fotogramma come un'immagine sola e non ha nessun posto dove mettere questa
 * differenza. Qui non è un effetto: è dove si attacca la geometria.
 *
 * NON SI VEDE ANCORA, E VA DETTO.
 *
 * Alla distanza di camera della dimostrazione — 19,5 unita' per una nave che
 * ne misura 16 — il finestrino e' una fessura alta pochi pixel, e di queste
 * figure non si distingue niente. Il meccanismo e' corretto e costruito; il
 * ritorno arriva solo con una camera vicina, e quella battuta non esiste
 * ancora.
 *
 * E' costruito adesso perche' la regola vada scritta nel codice mentre e'
 * chiara, non perche' renda oggi. Il giorno che si aggiunge il momento dentro
 * al salone, e' gia' li'.
 *
 * UN LIMITE DICHIARATO. Un piano è una bugia per una persona, mentre è un
 * fatto per un orizzonte a cinque chilometri. Regge solo perché le figure si
 * vedono piccole, di traverso, attraverso una fessura, e perché la camera ha
 * un'escursione di ±0,9 rad — non gira intorno. Fuori da quelle condizioni
 * questa scelta va rifatta, non difesa.
 */

/** Silhouette procedurale: due figure sedute, di profilo. */
function telaFigure () {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 256
  const x = c.getContext('2d')
  x.clearRect(0, 0, 512, 256)

  /**
   * SEGNAPOSTO, e dichiarato tale.
   *
   * Non è la fotografia che il concetto chiede: è una silhouette piena, nel
   * colore della carta, coerente col registro del disegno tecnico. Se il
   * ritaglio fotografico non arriva mai, il sito non ha un buco — ha una
   * scelta diversa, che si vede ed è difendibile. Il giorno che arriva si
   * sostituisce questa tela e basta.
   */
  const figura = (cx, verso) => {
    x.save(); x.translate(cx, 0); x.scale(verso, 1)
    x.fillStyle = 'rgba(28,32,34,.82)'
    // testa
    x.beginPath(); x.arc(0, 74, 21, 0, Math.PI * 2); x.fill()
    // busto seduto, leggermente inclinato all'indietro
    x.beginPath()
    x.moveTo(-16, 96); x.quadraticCurveTo(-26, 132, -22, 168)
    x.lineTo(26, 168); x.quadraticCurveTo(30, 128, 18, 96)
    x.closePath(); x.fill()
    // gambe verso il tavolo
    x.beginPath()
    x.moveTo(-20, 168); x.lineTo(-64, 176); x.lineTo(-64, 196); x.lineTo(24, 196)
    x.lineTo(26, 168); x.closePath(); x.fill()
    x.restore()
  }
  figura(150, 1)
  figura(362, -1)

  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  t.minFilter = LinearFilter
  return t
}

/**
 * @param {number} z  la stessa quota della sovrastruttura
 * @param {number} y  la quota del piano di calpestio del salone
 */
export function costruisciAllestimento (z, y, larghezza) {
  const gruppo = new Group()
  gruppo.position.set(0, y, z)

  // DIAGRAMMA: i divani e il tavolo sono geometria, come tutto il resto.
  const tessuto = new MeshStandardMaterial({ color: 0xd6cfc0, roughness: 0.94, metalness: 0.0 })
  for (const dz of [-1.15, 1.15]) {
    const divano = new Mesh(new BoxGeometry(larghezza * 0.78, 0.17, 0.62), tessuto)
    divano.position.set(0, 0.09, dz); gruppo.add(divano)
    const schienale = new Mesh(new BoxGeometry(larghezza * 0.78, 0.26, 0.11), tessuto)
    schienale.position.set(0, 0.30, dz + (dz > 0 ? 0.26 : -0.26)); gruppo.add(schienale)
  }
  const tavolo = new Mesh(new BoxGeometry(larghezza * 0.42, 0.035, 0.66),
    new MeshStandardMaterial({ color: 0xbdb4a3, roughness: 0.6 }))
  tavolo.position.set(0, 0.30, 0); gruppo.add(tavolo)

  /**
   * FOTOGRAFIA: un piano solo, orientato verso il finestrino.
   *
   * Non e' un cartellone che insegue la camera: le persone stanno sedute in un
   * verso, e una figura che ruota per guardarti e' proprio il genere di cosa
   * che tradisce il trucco. L'escursione limitata della camera e' cio' che
   * rende accettabile il piano fisso.
   */
  const piano = new Mesh(
    new PlaneGeometry(larghezza * 1.02, larghezza * 0.51),
    new MeshBasicMaterial({
      map: telaFigure(), transparent: true, side: DoubleSide,
      toneMapped: false, depthWrite: false
    })
  )
  piano.position.set(0, 0.40, 0)
  piano.rotation.y = Math.PI / 2      // di traverso: si guardano fra loro
  gruppo.add(piano)

  return { gruppo }
}
