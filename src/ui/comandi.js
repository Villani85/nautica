import { AMPIEZZA_MARE } from '../scena/simulazione.js'

/**
 * DIFETTO CORRETTO — nel prototipo i selettori dello stato del mare erano
 * larghi 20px e alti dal 20% al 100% di 34px: il bersaglio piu' piccolo era
 * circa 20x7px. WCAG 2.2 chiede almeno 24x24 al livello AA, e 44x44 al livello
 * AAA (che e' anche il minimo delle linee guida Apple). 20x7 falliva entrambi.
 *
 * Ora ogni pulsante ha un'area sensibile di 44x44 garantita, mentre la barra
 * colorata che si vede resta sottile: il bersaglio e' piu' grande del segno,
 * che e' esattamente cio' che WCAG intende.
 */
export function collegaComandi ({ contenitore, toggle, sim, alCambio }) {
  const pulsanti = []

  for (let n = 0; n < AMPIEZZA_MARE.length; n++) {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'mare__tacca'
    b.style.setProperty('--altezza', `${16 + n * 16}%`)
    b.setAttribute('aria-pressed', String(n === sim.S.mare))
    b.setAttribute('aria-label', `Sea state ${n}, nominal roll amplitude ${AMPIEZZA_MARE[n]} degrees`)
    b.innerHTML = '<span class="mare__barra" aria-hidden="true"></span>'
    b.addEventListener('click', () => {
      /**
       * NON `sim.S.mare = n` seguito da `sim.scalda()`. Quella coppia -- che e'
       * stata qui per tre ore -- faceva saltare la nave di 6,27 gradi in un
       * fotogramma, dove un fotogramma normale ne fa 0,043: centoquarantasei
       * volte. `cambiaMare` fa la stessa cosa preservando la fase, spalmata su
       * 0,8 secondi. La ragione lunga sta in `simulazione.js`.
       */
      sim.cambiaMare(n)
      sim.azzeraPicchi()
      pulsanti.forEach((x, j) => x.setAttribute('aria-pressed', String(j === n)))
      alCambio?.()
    })
    contenitore.appendChild(b)
    pulsanti.push(b)
  }

  toggle.addEventListener('click', () => {
    sim.S.stab = !sim.S.stab
    toggle.setAttribute('aria-pressed', String(sim.S.stab))
    sim.azzeraPicchi()
    alCambio?.()
  })
}

/**
 * DIFETTO CORRETTO — il punto di vista si poteva cambiare solo trascinando
 * col puntatore: da tastiera non esisteva alcun modo. Ora la tela e' un
 * gruppo focalizzabile e le frecce ruotano; il trascinamento resta per chi usa
 * mouse o dito.
 */
export function collegaPuntoDiVista ({ tela, ruota, suggerimento }) {
  let trascina = false
  let xPrec = 0

  const nascondiSuggerimento = () => { if (suggerimento) suggerimento.dataset.visto = 'si' }

  tela.addEventListener('pointerdown', (e) => {
    trascina = true
    xPrec = e.clientX
    tela.setPointerCapture?.(e.pointerId)
    nascondiSuggerimento()
  })
  tela.addEventListener('pointermove', (e) => {
    if (!trascina) return
    ruota((e.clientX - xPrec) * 0.006)
    xPrec = e.clientX
  })
  const finisci = () => { trascina = false }
  tela.addEventListener('pointerup', finisci)
  tela.addEventListener('pointercancel', finisci)

  tela.tabIndex = 0
  tela.setAttribute('role', 'application')
  tela.setAttribute('aria-label', 'Section view. Left and right arrow keys rotate the point of view.')
  tela.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { ruota(-0.12); nascondiSuggerimento(); e.preventDefault() }
    if (e.key === 'ArrowRight') { ruota(0.12); nascondiSuggerimento(); e.preventDefault() }
  })
}
