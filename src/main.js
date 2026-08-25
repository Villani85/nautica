import './stile.css'
import { collegaModale } from './ui/modale.js'

/**
 * Questo modulo non importa three. Deve restare cosi'.
 *
 * Il primo disegno della pagina non ha bisogno del motore 3D: le sezioni
 * 1, 3, 4 e 5 sono testo e composizione. Il motore arriva quando serve —
 * vedi in fondo — e finche' non serve non sta fra l'utente e il contenuto.
 */

collegaModale({
  apri: document.querySelector('#apri-chiusura'),
  dialogo: document.querySelector('#chiusura'),
  chiudi: document.querySelector('#chiudi')
})

/**
 * IL TAGLIO DEL TITOLO.
 *
 * DIFETTO CORRETTO — nel prototipo l'effetto era dichiarato nei commenti e non
 * esisteva: due copie sovrapposte senza alcun ritaglio, e la chiara copriva
 * l'altra per intero. In tutto il file non compariva un solo `clip-path`.
 *
 * Il meccanismo vero e' questo: le due copie vengono ritagliate sulla quota
 * REALE della linea, misurata sui nodi e non fissata in pixel. La quota si
 * ricalcola al ridimensionamento e a font caricati, perche' il titolo puo'
 * andare a capo e la misura di prima non varrebbe piu'.
 */
function tagliaTitoli () {
  for (const nodo of document.querySelectorAll('[data-taglio]')) {
    const linea = document.querySelector(nodo.dataset.taglio)
    if (!linea) continue
    const r = nodo.getBoundingClientRect()
    const q = linea.getBoundingClientRect()
    if (!r.height) continue
    const quota = ((q.top + q.height / 2) - r.top) / r.height * 100
    nodo.style.setProperty('--quota', `${Math.max(0, Math.min(100, quota)).toFixed(3)}%`)
  }
}

tagliaTitoli()
addEventListener('resize', tagliaTitoli)
document.fonts?.ready.then(tagliaTitoli)

/**
 * Il motore 3D si carica quando la dimostrazione si avvicina, non prima.
 * `rootMargin` generoso perche' arrivi gia' pronto invece di comparire a scatto.
 */
function mostraRipiego (testo) {
  const r = document.querySelector('#ripiego')
  if (testo) r.textContent = testo
  r.hidden = false
  document.querySelector('#scena').hidden = true
}

/**
 * LA TESTATA SEGUE IL LATO DELLA SEZIONE CHE LE STA SOTTO.
 *
 * E' `position:fixed`, quindi non sta dentro nessuna sezione e non eredita
 * mai il `--tenue` del sistema `[data-lato]` che governa tutto il resto.
 * Misurato: 2,95:1 sopra le sezioni scure, contro una soglia di 4,5 — sopra
 * l'offerta il testo era inchiostro su acqua profonda.
 *
 * Si riusa il sistema che esiste invece di aggiungerne uno: alla testata viene
 * assegnato il `data-lato` della sezione che le passa sotto.
 */
const testata = document.querySelector('.testata')
if (testata) {
  const sezioni = [...document.querySelectorAll('[data-lato]')].filter(e => e !== testata)
  const quota = () => testata.getBoundingClientRect().bottom
  let ultimo = null
  const segui = () => {
    const y = quota()
    let lato = 'sopra'
    for (const s of sezioni) {
      const r = s.getBoundingClientRect()
      if (r.top <= y && r.bottom > y) lato = s.dataset.lato
    }
    // "misto" e' la dimostrazione: sopra la linea e' carta, e la testata sta
    // in alto, quindi si comporta come "sopra".
    const eff = lato === 'misto' ? 'sopra' : lato
    if (eff !== ultimo) { ultimo = eff; testata.dataset.lato = eff }
  }
  addEventListener('scroll', segui, { passive: true })
  addEventListener('resize', segui)
  segui()
}

const demo = document.querySelector('#dimostrazione')
if (demo) {
  const carica = new IntersectionObserver(async (voci, oss) => {
    if (!voci.some(v => v.isIntersecting)) return
    oss.disconnect()
    /**
     * I due modi di fallire sono diversi e vanno detti in modo diverso.
     *
     * Prima versione di questo blocco: un solo `catch` che mostrava «serve
     * WebGL» qualunque cosa fosse andata storta. Durante il collaudo il modulo
     * non si e' caricato — cache vecchia dopo una ricompilazione — e la pagina
     * ha dichiarato all'utente che il suo browser non supporta WebGL. Era
     * falso, e soprattutto nascondeva a me il guasto vero.
     *
     * Un errore che si traveste da diagnosi e' peggio di un errore che si
     * vede: ora il caso «non e' arrivato il codice» si distingue da «non c'e'
     * WebGL», e in entrambi i casi l'eccezione finisce in console invece di
     * essere ingoiata.
     */
    let modulo
    try {
      modulo = await import('./demo.js')
    } catch (e) {
      console.error('[nautica] il modulo della dimostrazione non e\' arrivato', e)
      mostraRipiego('Il codice della dimostrazione non è stato caricato. Ricaricando la pagina di solito si risolve.')
      return
    }
    try {
      modulo.avviaDimostrazione()
    } catch (e) {
      console.error('[nautica] la dimostrazione non e\' partita', e)
      mostraRipiego()
    }
  }, { rootMargin: '200% 0px' })
  carica.observe(demo)
}
