/**
 * DIFETTO CORRETTO — nel prototipo la chiusura commerciale era un div con
 * `opacity:0; pointer-events:none`. Quello nasconde alla vista e al puntatore,
 * ma NON toglie dall'ordine di tabulazione: il pulsante interno restava
 * raggiungibile da tastiera a finestra chiusa, e `aria-modal="true"` restava
 * dichiarato, cosi' alcuni lettori di schermo nascondevano il resto della
 * pagina senza motivo. Mancavano inoltre la trappola del focus e la
 * restituzione del focus a chi aveva aperto.
 *
 * Qui si usa <dialog> nativo con showModal(): trappola del focus, Escape,
 * inertizzazione del resto della pagina e ritorno del focus all'elemento che
 * ha aperto sono comportamenti del browser. Meno codice nostro, e nessuno dei
 * quattro difetti puo' ripresentarsi.
 */
export function collegaModale ({ apri, dialogo, chiudi }) {
  if (!apri || !dialogo) return

  apri.addEventListener('click', () => {
    if (!dialogo.open) dialogo.showModal()
  })

  chiudi?.addEventListener('click', () => dialogo.close())

  // clic sullo sfondo: chiude. Il target e' il dialogo stesso solo quando
  // il clic cade fuori dal riquadro del contenuto.
  dialogo.addEventListener('click', (e) => {
    if (e.target === dialogo) dialogo.close()
  })
}
