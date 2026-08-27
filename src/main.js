import './stile.css'
import { collegaModale } from './ui/modale.js'
/**
 * `regia.js` non importa three — verificato, e va tenuto cosi': questo modulo
 * sta nel percorso critico della prima schermata e non deve tirarsi dietro il
 * motore 3D. Da li' arriva solo la decisione «una scena o due», che deve
 * stare in un posto solo.
 */
import { LA_SCENA_E_UNA } from './regia.js'

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
 * ─── L'ENTRATA: IL CARICAMENTO E' IL TAGLIO CHE SI FORMA
 *
 * L'apertura era un fermo immagine: il titolo gia' tagliato, in attesa che
 * qualcuno scorresse. Ma il taglio e' l'unica idea meccanica del sito, e
 * mostrarlo gia' fatto e' come cominciare un film dall'ultima inquadratura.
 *
 * Qui la pagina comincia TUTTA CARTA — pelo al 100%, cioe' il mare fuori dallo
 * schermo — e l'acqua sale fino a fermarsi a meta'. Il titolo si sommerge da
 * solo: `tagliaTitoli` misura la quota della linea VERA a ogni fotogramma,
 * quindi la seconda riga passa da inchiostro su carta a chiaro sull'acqua
 * mentre il livello la supera. Non c'e' una seconda animazione da tenere
 * allineata alla prima: ce n'e' una sola, ed e' il pelo.
 *
 * ─── LA FINE E' LA REGOLA, NON L'ULTIMO FOTOGRAMMA
 *
 * Alla fine la variabile si TOGLIE invece di essere posata su «50%». Cosi'
 * l'invariante torna a essere quello dichiarato nel foglio di stile, e non il
 * risultato di un'interpolazione arrotondata a tre decimali. Un'entrata che
 * finisce a 49,998% romperebbe la giunzione a zero pixel — cioe' proprio la
 * cosa che sta mostrando.
 *
 * ─── E NON E' UNA BARRA DI CARICAMENTO
 *
 * Il percorso critico di questo sito pesa 7,6 KB: quando il primo fotogramma
 * esiste, non c'e' piu' niente da aspettare, e il motore 3D arriva molto dopo,
 * all'avvicinamento. Una barra che finge di misurare un caricamento che non
 * c'e' sarebbe una bugia — e questo sito ne ha vietate di piu' piccole. Questa
 * e' un'ENTRATA: dura un tempo dichiarato e non finge di sapere niente.
 */
const ENTRATA_MS = 1100

function entrata () {
  const R = document.documentElement
  // Con la preferenza attiva non si anima l'apertura: chi la chiede sta
  // chiedendo di non essere mosso mentre legge, e qui c'e' un titolo da
  // leggere. Il resto del sito RIDUCE invece di spegnere, perche' li' il
  // movimento e' l'informazione; qui non lo e'.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const t0 = performance.now()
  R.dataset.entrata = 'in corso'
  const passo = (t) => {
    const k = Math.min(1, (t - t0) / ENTRATA_MS)
    /* Parte decisa e si posa: e' come si assesta un livello, non come si
       muove un cursore. Cubica in uscita, niente rimbalzo — un pelo d'acqua
       che rimbalza e' un'animazione, non un mare. */
    const e = 1 - Math.pow(1 - k, 3)
    R.style.setProperty('--pelo', `${(100 - 50 * e).toFixed(3)}%`)
    tagliaTitoli()
    if (k < 1) requestAnimationFrame(passo)
    else {
      R.style.removeProperty('--pelo')
      R.dataset.entrata = 'fatta'
      tagliaTitoli()
    }
  }
  R.style.setProperty('--pelo', '100%')
  tagliaTitoli()
  requestAnimationFrame(passo)
}

// Si aspettano i font: il titolo va a capo diversamente prima e dopo, e la
// quota del taglio si misura sui nodi. Partire prima farebbe saltare la
// seconda riga a meta' entrata. Con un tetto, perche' un font che non arriva
// non deve togliere l'apertura a nessuno.
Promise.race([
  document.fonts?.ready ?? Promise.resolve(),
  new Promise(r => setTimeout(r, 1200))
]).then(entrata)

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
      mostraRipiego('The demonstration code did not load. Reloading the page usually fixes it.')
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

/**
 * IL CAPITOLO DEL SALONE, caricato con lo stesso schema.
 *
 * Un osservatore separato, e non un elenco generico di sezioni: i due capitoli
 * falliscono in modi diversi e vanno trattati in modo diverso. Se il salone non
 * parte, il salone sparisce e il resto del sito continua a funzionare — mentre
 * se non parte la dimostrazione il sito ha bisogno di dirlo, perche' li' c'e' un
 * ripiego da mostrare.
 *
 * Il margine e' piu' stretto di quello della dimostrazione (50% contro 200%):
 * quella va precaricata presto perche' e' il primo impatto, questo puo'
 * aspettare di essere vicino, e nel frattempo non contende la scheda grafica.
 */
const salone = document.querySelector('#salone')

/**
 * ─── IL CAPITOLO IN DOM SPARISCE QUANDO LA SCENA E' UNA
 *
 * Il salone non e' piu' una sezione a parte: e' la prima battuta della
 * dimostrazione, dentro la stessa scena 3D, con la stessa camera. Tenerlo
 * anche qui vorrebbe dire mostrarlo due volte di fila — ed e' esattamente
 * l'architettura a due scene che stiamo togliendo.
 *
 * Si RIMUOVE invece di nasconderlo: un `display:none` lascerebbe in piedi il
 * suo osservatore, i suoi video e il suo ciclo di fotogrammi, cioe' il costo
 * senza il beneficio. E la sezione portava anche la sovrapposizione di uno
 * schermo con la dimostrazione, che senza di lei diventerebbe un buco: la
 * toglie il foglio di stile leggendo `data-unica`.
 *
 * `?doppia=1` riporta indietro, finche' la nuova non ha girato su un telefono
 * vero.
 */
if (salone && LA_SCENA_E_UNA) {
  salone.remove()
  document.documentElement.dataset.unica = 'si'
} else if (salone) {
  const caricaSalone = new IntersectionObserver(async (voci, oss) => {
    if (!voci.some(v => v.isIntersecting)) return
    oss.disconnect()
    try {
      const m = await import('./salone-atto.js')
      m.avviaSalone()
    } catch (e) {
      console.error("[nautica] il salone non e' partito", e)
      salone.remove()
    }
  }, { rootMargin: '50% 0px' })
  caricaSalone.observe(salone)
}
