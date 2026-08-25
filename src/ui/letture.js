import { AMPIEZZA_MARE, SMORZAMENTO } from '../scena/simulazione.js'

const grad = (v) => v.toFixed(1).replace('.', ',')

/**
 * Le letture si aggiornano a fotogrammi alterni: sessanta scritture al secondo
 * nel DOM non le legge nessuno e costano layout. Trenta bastano, e la cifra
 * resta stabile abbastanza da poterla leggere davvero.
 */
export function creaLetture (el) {
  let frame = 0
  let ultimoStato = null

  return function aggiorna (S) {
    frame++
    if (frame % 2) return

    el.rollio.textContent = grad(Math.abs(S.rollio))
    el.picco.textContent = grad(S.picco)
    el.carico.textContent = Math.round(S.carico)
    el.recupero.textContent = Math.round(S.recupero)
    el.fCarico.style.right = `${100 - S.carico}%`
    el.fRecupero.style.right = `${100 - S.recupero}%`

    const attivo = S.stab && AMPIEZZA_MARE[S.mare] > 0
    const stato = `${attivo}`
    if (stato !== ultimoStato) {
      ultimoStato = stato
      el.riduzione.textContent = String(Math.round((1 - SMORZAMENTO) * 100))
      el.dRiduzione.dataset.attiva = attivo ? 'si' : 'no'
    }
  }
}
