import { creaScena } from './scena/index.js'
import { creaSimulazione } from './scena/simulazione.js'
import { collegaComandi, collegaPuntoDiVista } from './ui/comandi.js'
import { creaLetture } from './ui/letture.js'

const $ = (s) => document.querySelector(s)

/**
 * Tutto cio' che dipende da three sta qui dentro, e questo modulo viene
 * importato in modo dinamico solo quando la dimostrazione si avvicina allo
 * schermo. E' la ragione vera per cui il porto a moduli ES valeva la pena:
 * non il peso complessivo — misurato, il guadagno era sotto il chilobyte —
 * ma il fatto che 144 KB gzipped di motore 3D escono dal percorso critico e
 * non stanno piu' fra l'utente e il primo disegno.
 */
export function avviaDimostrazione () {
  const contenitore = $('#scena')
  const scena = creaScena(contenitore)

  if (!scena) {
    $('#ripiego').hidden = false
    contenitore.hidden = true
    return
  }

  const preferenza = window.matchMedia('(prefers-reduced-motion: reduce)')
  const sim = creaSimulazione({ ridotto: preferenza.matches })

  const aggiornaLetture = creaLetture({
    rollio: $('#v-rollio'),
    picco: $('#v-picco'),
    riduzione: $('#v-riduzione'),
    dRiduzione: $('#d-riduzione'),
    carico: $('#v-carico'),
    recupero: $('#v-recupero'),
    fCarico: $('#b-carico .riempi'),
    fRecupero: $('#b-recupero .riempi')
  })

  let inCorso = false
  const passo = () => { scena.disegna(sim); aggiornaLetture(sim.S) }

  function avviaCiclo () {
    if (inCorso || sim.S.ridotto) return
    inCorso = true
    scena.render.setAnimationLoop(passo)
  }
  function fermaCiclo () {
    inCorso = false
    scena.render.setAnimationLoop(null)
  }
  /** Con movimento ridotto si disegna solo quando qualcosa cambia. */
  function sveglia () {
    let n = 0
    const uno = () => { passo(); if (++n < 45) requestAnimationFrame(uno) }
    requestAnimationFrame(uno)
  }
  const risveglia = () => { if (sim.S.ridotto) sveglia(); else avviaCiclo() }

  collegaComandi({
    contenitore: $('#mare'), toggle: $('#stab'), sim, alCambio: risveglia
  })
  collegaPuntoDiVista({
    tela: scena.tela, ruota: scena.ruota, suggerimento: $('#nota')
  })

  preferenza.addEventListener('change', (e) => {
    sim.S.ridotto = e.matches
    sim.azzeraPicchi()
    if (e.matches) { fermaCiclo(); sveglia() } else avviaCiclo()
  })

  window.addEventListener('resize', () => { scena.ridimensiona(); if (sim.S.ridotto) sveglia() })
  scena.ridimensiona()

  /**
   * Si disegna solo mentre la dimostrazione e' sullo schermo. Fuori non si
   * disegna affatto: e' meta' della batteria di un telefono, e non costa
   * niente in leggibilita'.
   */
  const osservatore = new IntersectionObserver((voci) => {
    for (const v of voci) v.isIntersecting ? risveglia() : fermaCiclo()
  }, { threshold: 0.05 })
  osservatore.observe($('#dimostrazione'))

  risveglia()
}
