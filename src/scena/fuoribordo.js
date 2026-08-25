import {
  Mesh, CylinderGeometry, MeshBasicMaterial, CanvasTexture, VideoTexture,
  SRGBColorSpace, Group, LinearFilter, BackSide
} from 'three'

/**
 * IL MARE FUORI DAL FINESTRINO.
 *
 * LA REGOLA (doc 09 §9):
 *   tutto cio' che e' diagramma si costruisce;
 *   tutto cio' che e' fotografia si vede ATTRAVERSO UN'APERTURA.
 *
 * Il mare **sotto** la linea resta campo grafico piatto: e' diagramma. Il mare
 * **fuori dal finestrino** e' fotografia. Due mari nella stessa inquadratura
 * non e' un errore: e' la stessa divisione che governa tutto il sito,
 * applicata all'acqua.
 *
 * PERCHE' FUNZIONA, e perche' non e' un trucco:
 *
 * 1. Un piano perpendicolare allo sguardo e' una bugia per una persona e un
 *    FATTO per un orizzonte. A cinque chilometri l'orizzonte *e'* un piano:
 *    la geometria coincide con la fisica.
 *
 * 2. **Il rollio arriva gratis.** Questo piano sta in coordinate MONDO, la
 *    stanza no. Quando lo scafo ruota, l'orizzonte resta piatto da solo — e'
 *    la conseguenza di dove metti il piano, non una riga di codice. Ed e'
 *    precisamente l'effetto che il modello video generativo non e' riuscito a
 *    produrre in dieci secondi.
 *
 * 3. **Non mente sullo stato: lo E'.** Girando la manopola del mare cambia il
 *    mare. Non puo' contraddire cio' che l'utente controlla.
 *
 * IL VINCOLO CHE NESSUNO AVEVA NOMINATO: la camera sta a quota zero e guarda
 * l'orizzonte, quindi l'orizzonte della scena cade al CENTRO ESATTO del
 * canvas. Se il filmato ha il proprio orizzonte altrove, nell'inquadratura ce
 * ne sono due e non combaciano. Qui il piano e' centrato su y = 0 per
 * costruzione, e la stessa cosa dovra' valere per il filmato vero: girato con
 * l'orizzonte a meta' fotogramma esatta, non da drone ne' a pelo d'acqua.
 */

/**
 * ERRORE COMMESSO E CORRETTO, vale la pena lasciarlo scritto.
 *
 * La prima stesura metteva l'orizzonte su una fascia cilindrica di raggio 34
 * attorno a tutta la scena. Guardando il provino: copriva l'intero fondo e
 * **cancellava il taglio al 50%** — cioe' l'unica idea meccanica del sito.
 * Non era un'apertura, era un fondale, che e' esattamente cio' che la regola
 * vieta: *la fotografia si vede ATTRAVERSO un'apertura*.
 *
 * Ora la fascia sta DENTRO la tuga, piu' stretta della sovrastruttura. Si vede
 * solo dove c'e' il finestrino, e non puo' invadere il resto del fotogramma
 * perche' le pareti la nascondono. Il fondo CSS torna a spaccarsi a meta'.
 */
const RAGGIO = 0.62    // meno della semilarghezza della tuga: non puo' uscire
const ALT = 3.0        // abbastanza da coprire lo sbandamento della finestra

/**
 * Il ripiego procedurale: cielo, orizzonte, mare — disegnati su tela.
 *
 * Non e' un segnaposto grigio in attesa del filmato: e' un fuoribordo che
 * funziona, con l'orizzonte esattamente a meta' e i colori delle due palette.
 * Il giorno che arriva il filmato si sostituisce la texture e basta; se non
 * arriva mai, il sito non ha un buco.
 */
function telaOrizzonte (mare) {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 512
  const x = c.getContext('2d')

  // cielo: dalla carta in alto a un grigio piu' caldo verso l'orizzonte
  const cielo = x.createLinearGradient(0, 0, 0, 256)
  cielo.addColorStop(0, '#efeade')
  cielo.addColorStop(1, '#d8d4c8')
  x.fillStyle = cielo; x.fillRect(0, 0, 512, 256)

  // mare: piu' scuro e piu' mosso man mano che lo stato del mare sale
  const cupo = 0.20 + mare * 0.055
  const acq = x.createLinearGradient(0, 256, 0, 512)
  acq.addColorStop(0, `rgba(${Math.round(70 - 40*cupo)},${Math.round(120 - 50*cupo)},${Math.round(120 - 45*cupo)},1)`)
  acq.addColorStop(1, '#0b2a2e')
  x.fillStyle = acq; x.fillRect(0, 256, 512, 256)

  // creste: piu' numerose e piu' lunghe col mare grosso
  const creste = Math.round(6 + mare * 14)
  x.globalAlpha = 0.16 + mare * 0.03
  x.strokeStyle = '#e9e5dd'
  for (let i = 0; i < creste; i++) {
    const y = 258 + Math.pow(Math.random(), 1.7) * 240
    const l = (6 + Math.random() * 70) * (0.4 + mare * 0.16)
    const px = Math.random() * 512
    x.lineWidth = 0.6 + Math.random() * 1.2
    x.beginPath(); x.moveTo(px, y); x.lineTo(px + l, y + (Math.random() - 0.5) * 2); x.stroke()
  }
  x.globalAlpha = 1

  // la riga dell'orizzonte, netta: e' l'unica cosa che non deve sfumare
  x.fillStyle = 'rgba(21,24,27,.34)'
  x.fillRect(0, 255, 512, 1.5)

  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  t.minFilter = LinearFilter
  return t
}

export function costruisciFuoribordo () {
  const gruppo = new Group()
  const mat = new MeshBasicMaterial({ toneMapped: false, side: BackSide })
  const fascia = new Mesh(new CylinderGeometry(RAGGIO, RAGGIO, ALT, 64, 1, true), mat)
  fascia.position.set(0, 0, 0)     // centrata su y = 0: UN orizzonte solo
  gruppo.add(fascia)

  const cache = new Map()
  let mareCorrente = -1

  /** Cambia il mare: il fuoribordo E' la manopola, non un commento su di essa. */
  function impostaMare (mare) {
    if (mare === mareCorrente) return
    mareCorrente = mare
    if (!cache.has(mare)) cache.set(mare, telaOrizzonte(mare))
    mat.map = cache.get(mare)
    mat.needsUpdate = true
  }

  /**
   * Quando ci sara' il filmato vero: una clip per stato del mare, UNA alla
   * volta caricata su richiesta, e taglio netto fra gli stati invece di
   * dissolvenza incrociata — il limite su iOS e' la decodifica simultanea, non
   * la riproduzione.
   */
  function usaFilmato (video) {
    const t = new VideoTexture(video)
    t.colorSpace = SRGBColorSpace
    mat.map = t
    mat.needsUpdate = true
  }

  impostaMare(3)
  return { gruppo, impostaMare, usaFilmato }
}
