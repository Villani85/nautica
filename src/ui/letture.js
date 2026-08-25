import { AMPIEZZA_MARE } from '../scena/simulazione.js'

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
    if (el.velocita) el.velocita.textContent = Math.round(S.velocita)

    /**
     * LA RIDUZIONE E' MISURATA, non stampata.
     *
     * Prima qui c'era `Math.round((1 - SMORZAMENTO) * 100)`, cioe' una costante
     * scritta a mano che diceva sempre 89. Ora arriva da `S.riduzione`, che e'
     * il rapporto fra i picchi di due simulazioni parallele — una con le pinne
     * e una senza. Il numero se lo guadagna, e cambia con il mare e con la
     * velocita' perche' nella realta' cambia.
     */
    const attiva = S.stab && AMPIEZZA_MARE[S.mare] > 0 && S.riduzione > 0.005
    el.riduzione.textContent = attiva ? String(Math.round(S.riduzione * 100)) : '0'

    const stato = `${attiva}`
    if (stato !== ultimoStato) {
      ultimoStato = stato
      el.dRiduzione.dataset.attiva = attiva ? 'si' : 'no'
    }
  }
}
