/**
 * LO SCHEMA: DOVE SEI E A CHE QUOTA. Nient'altro.
 *
 * ─── LA REGOLA CHE LO DISEGNA, ed e' una sottrazione
 *
 * `docs/13` §3 vieta i punti caldi: «ogni sito industriale in WebGL ha i punti
 * caldi da cliccare, ed e' la morte: dice al visitatore che il mondo e' finto e
 * che le cose interessanti sono state marcate». La tentazione, su telefono, e'
 * di aggirare il divieto spostandolo -- niente marchi nel mondo, ma una
 * mappina con i pallini accesi dove c'e' qualcosa. Sarebbe lo stesso peccato in
 * scala ridotta, e per giunta con l'aggravante di essere comodo.
 *
 * Quindi questo schema dice **due cose e due sole**: a che stazione sei, e a
 * che quota. Non dice dove sono le macchine. Le macchine si scoprono
 * arrivandoci e fermandosi, che e' la stessa regola del desktop -- lo stesso
 * esito, un gesto diverso.
 *
 * Conseguenza da mettere in conto: chi apre lo schema NON sa dove andare. E'
 * voluto, ed e' anche il motivo per cui le celle sono dodici e non cento: uno
 * spazio che si percorre tutto in dodici scatti si esplora, uno da cento si
 * abbandona.
 *
 * ─── PERCHE' SVG E NON UNA TELA
 *
 * Perche' e' inchiostro, non una scena: quattro segni e un profilo. Un canvas
 * qui vorrebbe dire ridisegnarlo a ogni cambio di dimensione, gestire il
 * rapporto pixel, e perdere la nitidezza che un vettore ha gratis. E perche'
 * lo schema deve poter sparire dall'albero di accessibilita' senza portarsi
 * via l'informazione: e' `aria-hidden`, e cio' che dice lo dice a voce la
 * regione viva di `tocco.js`. Un lettore di schermo che descrivesse un
 * disegnino invece di leggere «Midship, machinery» starebbe peggio, non
 * meglio.
 */
import { STAZIONI, QUOTE } from './atto-due.js'

const NS = 'http://www.w3.org/2000/svg'
const el = (nome, attributi) => {
  const n = document.createElementNS(NS, nome)
  for (const [k, v] of Object.entries(attributi)) n.setAttribute(k, String(v))
  return n
}

/**
 * Il riquadro del disegno. Le coordinate sono quelle del `viewBox`, quindi
 * indipendenti da quanto e' grande sullo schermo: lo schema si stira e i
 * segni restano dove sono.
 */
const LARGO = 200
const ALTO = 72
const PRUA = 8          // x della punta di prua
const POPPA = 192       // x dello specchio di poppa
const PONTE = 12        // y del ponte
const CHIGLIA = 60      // y della chiglia

const ascissa = (x) => PRUA + (POPPA - PRUA) * x
const ordinata = (y) => PONTE + (CHIGLIA - PONTE) * y

export function creaSchema () {
  const svg = el('svg', {
    class: 'espl__schema',
    viewBox: `0 0 ${LARGO} ${ALTO}`,
    preserveAspectRatio: 'xMidYMid meet',
    /* Lo dice la voce, non il disegno: vedi la nota in testa. */
    'aria-hidden': 'true',
    focusable: 'false'
  })

  /**
   * IL PROFILO. Non e' la carena vera di `src/scafo/ordinate.js` e non finge
   * di esserlo: e' un segno che dice «nave», con la prua a sinistra e lo
   * specchio a destra. Prendere la sagoma vera dallo scafo lofted sarebbe
   * stato possibile e sbagliato -- costringerebbe questo modulo a caricare la
   * geometria, cioe' a mettere il motore 3D nel percorso di un disegnino da
   * duecento byte.
   */
  svg.appendChild(el('path', {
    class: 'espl__scafo',
    d: `M ${PRUA} ${PONTE} L ${POPPA} ${PONTE} L ${POPPA} ${CHIGLIA - 6} ` +
       `L ${PRUA + 40} ${CHIGLIA} Q ${PRUA + 6} ${CHIGLIA - 2} ${PRUA} ${PONTE} Z`
  }))

  /** Le tre quote: righe sottili, senza etichetta. La quota si sente, non si legge qui. */
  for (const q of QUOTE) {
    svg.appendChild(el('line', {
      class: 'espl__quota-riga',
      x1: PRUA + 2, x2: POPPA - 2, y1: ordinata(q.y), y2: ordinata(q.y)
    }))
  }

  /** Le quattro stazioni: tacche corte sul ponte. */
  for (const s of STAZIONI) {
    svg.appendChild(el('line', {
      class: 'espl__stazione-tacca',
      x1: ascissa(s.x), x2: ascissa(s.x), y1: PONTE - 3, y2: PONTE + 3
    }))
  }

  /**
   * IL SEGNO DI DOVE SEI. Un anello, non un pallino pieno: un pieno luminoso
   * su una mappa e' esattamente il punto caldo che il §3 vieta, anche se
   * indica te e non una macchina.
   */
  const qui = el('circle', { class: 'espl__qui', cx: ascissa(STAZIONI[0].x), cy: ordinata(QUOTE[0].y), r: 5 })
  svg.appendChild(qui)

  /**
   * Le due guide che scendono e attraversano: servono a leggere la posizione
   * senza contare le tacche, e sono la ragione per cui questo schema regge
   * anche largo 100 px su un telefono piccolo.
   */
  const guidaV = el('line', { class: 'espl__guida', x1: 0, x2: 0, y1: PONTE - 4, y2: CHIGLIA + 4 })
  const guidaO = el('line', { class: 'espl__guida', x1: PRUA, x2: POPPA, y1: 0, y2: 0 })
  svg.insertBefore(guidaO, qui)
  svg.insertBefore(guidaV, qui)

  /**
   * @param {number} is indice di stazione
   * @param {number} iq indice di quota
   */
  function muovi (is, iq) {
    const s = STAZIONI[is]
    const q = QUOTE[iq]
    if (!s || !q) return
    const x = ascissa(s.x)
    const y = ordinata(q.y)
    qui.setAttribute('cx', String(x))
    qui.setAttribute('cy', String(y))
    guidaV.setAttribute('x1', String(x)); guidaV.setAttribute('x2', String(x))
    guidaO.setAttribute('y1', String(y)); guidaO.setAttribute('y2', String(y))
  }

  return { svg, muovi }
}
