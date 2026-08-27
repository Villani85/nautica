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
      sim.S.mare = n
      /**
       * --- CAMBIARE STATO DEL MARE E' IMMAGINARE UN ALTRO MARE
       *
       * Senza questa riga la manopola cambiava le LETTURE all istante e la
       * nave no: con smorzamento 0,045 l ampiezza monta con una costante di
       * tempo di 25 secondi, quindi passando da mare 2 a mare 5 i numeri
       * saltavano subito e lo scafo ci metteva un minuto. Chi gira una
       * manopola e non vede muoversi niente conclude che non funziona -- ed e'
       * esattamente cio' che e' successo.
       *
       * La distinzione che regge, e non e' un espediente: lo STATO DEL MARE
       * non e' un evento della traversata, e' la traversata che si sceglie di
       * guardare. "Facciamo che il mare sia cinque" vuol dire una nave che sta
       * in mare cinque **da un pezzo**, non una a cui il mare cambia sotto in
       * due secondi.
       *
       * L INTERRUTTORE invece resta un evento vero, e non si scalda: spegnere
       * le pinne e guardare il rollio che ricresce lentamente E' l argomento.
       * Il tempo che ci mette e' il numero che il sito vende.
       */
      sim.scalda()
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
