/**
 * IL COMPOSITO DEL SALONE — tre strati, e la differenza fra due di essi e' la tesi.
 *
 * Il capitolo non e' piu' una scena in tempo reale: e' una **fotografia che
 * reagisce**. La scena 3D resta e continua a servire, ma cambia mestiere —
 * diventa la SAGOMA da cui le fotografie sono generate (`npm run sagome`), e si
 * puo' ancora aprire con `?sagoma=1`.
 *
 * ─── PERCHE' UNA FOTOGRAFIA
 *
 * La stanza in tempo reale era corretta e fredda: volumi, materiali piatti,
 * persone fatte di scatole. Abbastanza per capire, non abbastanza per sentire.
 * E inseguire il fotorealismo in tempo reale con figure umane generate e' la
 * zona peggiore — abbastanza realistiche da far notare mani e volti sbagliati,
 * non abbastanza da sembrare vere.
 *
 * ─── PERCHE' UNA FOTOGRAFIA NON BASTA
 *
 * Perche' una foto non sa spegnere lo stabilizzatore, ed e' la sola cosa che
 * questo sito rivendica di saper fare. Quindi tre strati:
 *
 *   1. **il mare** — filmato, in fondo, e **NON ruota**;
 *   2. **la stanza** — fotografia coi finestrini bucati dalla maschera, e
 *      **ruota con il rollio vero della simulazione**;
 *   3. **la cornice** — l'apertura sulla pagina, e non si muove mai.
 *
 * Fra il primo e il secondo strato c'e' tutto l'argomento: la stanza si inclina
 * contro un orizzonte che non si inclina con lei. Non e' un effetto — e' dove
 * stanno i due strati.
 *
 * ─── LE DUE POSE
 *
 * Una fotografia sola, ruotata, mostrerebbe due persone **serene mentre la
 * stanza sbanda**: geometricamente giusto ed emotivamente falso. Le pose sono
 * due — a riposo, e con la mano piatta sul tavolo — e si dissolvono seguendo
 * l'angolo.
 *
 * Sono **entrambe diritte**, e questo semplifica tutto: la seconda e' stata
 * generata a partire dalla prima, quindi ha la stessa inquadratura, le stesse
 * facce, gli stessi materiali. Ruotano insieme dello stesso angolo e si
 * sovrappongono senza scavallare. Un primo tentativo aveva l'inclinazione
 * IMPRESSA nella fotografia: era piu' bella e inservibile, perche' il modello
 * aveva riquadrato e le due immagini non si allineavano piu'.
 */

/**
 * LA DISSOLVENZA E' STRETTA, e la prima non lo era.
 *
 * Con una rampa lineare da zero a nove gradi, a sette gradi restava ancora un
 * sesto della posa calma sopra quella tesa: si vedeva un **fantasma** — due
 * teste sovrapposte, due braccia in due punti. Visto guardando, e per un
 * istante sembrava un difetto di allineamento fra le due fotografie.
 *
 * Adesso sotto i 2,5 gradi la posa e' calma, sopra i 6 e' tesa, e in mezzo c'e'
 * una banda stretta che il rollio attraversa in fretta. Il fantasma esiste
 * ancora ma dura poche decine di fotogrammi, e in quel tratto le due immagini
 * differiscono solo per un braccio.
 */
const SOGLIA_BASSA = 2.5
const SOGLIA_ALTA = 6.0
const dolce = (x) => x * x * (3 - 2 * x)

export function creaComposito (contenitore, base) {
  const nuovo = (classe, tag = 'div') => {
    const e = document.createElement(tag)
    e.className = classe
    contenitore.appendChild(e)
    return e
  }

  /**
   * 1 · IL MARE. Sta in fondo e non ruota mai. Non c'e' una riga che lo tenga
   * fermo: e' fermo perche' nessuno lo tocca, ed e' esattamente il punto.
   */
  const mare = nuovo('composito__mare', 'video')
  mare.src = base + 'filmati/mare-fuoribordo.mp4'
  mare.loop = true; mare.muted = true; mare.playsInline = true
  mare.setAttribute('aria-hidden', 'true')
  mare.addEventListener('loadeddata', () => {
    mare.play().catch(() => { /* rifiutata: resta il fondo chiaro, e si vede il cielo */ })
  }, { once: true })

  /**
   * 2 · LE DUE POSE. Ogni fotografia porta la propria maschera, ricavata da
   * lei stessa — non dalla sagoma, che dopo la generazione non combacia piu'.
   * `mask-mode: luminance`: il bianco della maschera lascia passare il mare.
   */
  const posa = (nome) => {
    const e = nuovo('composito__stanza')
    e.style.backgroundImage = `url(${base}salone/${nome}.jpg)`
    const m = `url(${base}salone/${nome}-maschera.png)`
    e.style.webkitMaskImage = m
    e.style.maskImage = m
    return e
  }
  const calma = posa('calma')
  const tesa = posa('tesa')
  tesa.style.opacity = '0'

  /**
   * Chi naviga con lo schermo non deve trovare tre riquadri vuoti. La
   * descrizione cambia con lo stato, perche' e' lo stato la cosa da raccontare.
   */
  contenitore.setAttribute('role', 'img')

  let ultimo = null
  function aggiorna (gradi) {
    const g = Math.abs(gradi)
    const q = dolce(Math.min(1, Math.max(0, (g - SOGLIA_BASSA) / (SOGLIA_ALTA - SOGLIA_BASSA))))
    const r = `rotate(${gradi.toFixed(2)}deg)`
    calma.style.transform = r
    tesa.style.transform = r
    calma.style.opacity = String(1 - q)
    tesa.style.opacity = String(q)

    const teso = q > 0.5
    if (teso !== ultimo) {
      ultimo = teso
      contenitore.setAttribute('aria-label', teso
        ? 'The saloon of a yacht, heeled over. The two people are bracing themselves against the table and the backrest. The wine glasses are still upright, and through the window the sea horizon stays level.'
        : 'The saloon of a yacht, level and calm. Two people sit talking, two glasses of wine stand on the table between them. Through the window the open sea is rough.')
    }
  }

  aggiorna(0)
  return { aggiorna, mare }
}
