import { creaScena } from './scena/index.js'
import { sim, statoCambiato } from './stato.js'
import { collegaComandi, collegaPuntoDiVista } from './ui/comandi.js'
import { creaLetture } from './ui/letture.js'
import { creaRegia } from './regia.js'

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
  /**
   * LA SIMULAZIONE ARRIVA DA `stato.js`, e non si crea piu' qui.
   *
   * DIFETTO PRESO GUARDANDO, appena il capitolo del salone e' esistito: si
   * accendeva l'interruttore nella dimostrazione, si scendeva al salone, e la
   * stanza continuava a rollare. Due capitoli, due simulazioni, due traversate
   * diverse — e il sito che si smentiva da solo a due schermate di distanza.
   *
   * E' la bugia peggiore possibile qui, perche' l'argomento del sito e' proprio
   * che sopra e sotto la linea sono **lo stesso integratore**. L'avevo scritto
   * nel commento di `stato.js` e poi non avevo collegato il file.
   *
   * (`?ridotto=1` vive li' adesso, insieme alla preferenza di sistema: e' una
   * proprieta' della visita, non di un capitolo.)
   */

  const aggiornaLetture = creaLetture({
    rollio: $('#v-rollio'),
    picco: $('#v-picco'),
    riduzione: $('#v-riduzione'),
    dRiduzione: $('#d-riduzione'),
    carico: $('#v-carico'),
    recupero: $('#v-recupero'),
    fCarico: $('#b-carico .riempi'),
    fRecupero: $('#b-recupero .riempi'),
    velocita: $('#v-velocita')
  })

  let inCorso = false
  const passo = (marca) => { scena.disegna(sim, marca); aggiornaLetture(sim.S) }

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
    const uno = (marca) => { passo(marca); if (++n < 45) requestAnimationFrame(uno) }
    requestAnimationFrame(uno)
  }
  const risveglia = () => { if (sim.S.ridotto) sveglia(); else avviaCiclo() }

  const palco = document.querySelector('.palco')
  const regia = creaRegia({
    scena, sim, palco,
    didascalia: $('#battuta'),
    alCambio: risveglia
  })

  collegaComandi({
    contenitore: $('#mare'), toggle: $('#stab'), sim,
    // La regia va rivalutata anche quando cambia lo STATO, non solo la
    // posizione: accendendo il sistema da fermi il testo restava indietro.
    // Avvisa anche gli altri capitoli: il salone dorme mentre sei qui, e al
    // risveglio deve trovare lo stato giusto invece di quello di prima.
    alCambio: () => { risveglia(); regia?.rivaluta?.(); statoCambiato() }
  })
  /**
   * L'ANDATURA. E' la seconda cosa che si scopre: le pinne producono portanza
   * solo in moto, quindi sotto una certa velocita' l'interruttore si accende e
   * non succede niente. Un <input type=range> vero, non un div con listener:
   * arriva gia' accessibile da tastiera e annunciato.
   */
  const cursore = $('#velocita')
  cursore.addEventListener('input', () => {
    sim.S.velocita = Number(cursore.value)
    sim.azzeraPicchi()
    risveglia()
  })

  collegaPuntoDiVista({
    tela: scena.tela, ruota: scena.ruota, suggerimento: $('#nota')
  })

  preferenza.addEventListener('change', (e) => {
    sim.S.ridotto = e.matches
    sim.azzeraPicchi()
    if (e.matches) { fermaCiclo(); sveglia() } else avviaCiclo()
    statoCambiato()   // vale per tutti i capitoli, non solo per questo
  })

  window.addEventListener('resize', () => { scena.ridimensiona(); if (sim.S.ridotto) sveglia() })
  scena.ridimensiona()

  /**
   * Si disegna solo mentre la dimostrazione e' sullo schermo. Fuori non si
   * disegna affatto: e' meta' della batteria di un telefono, e non costa
   * niente in leggibilita'.
   */
  const sezione = $('#dimostrazione')
  const osservatore = new IntersectionObserver((voci) => {
    for (const v of voci) v.isIntersecting ? risveglia() : fermaCiclo()
  }, { threshold: 0.05 })
  osservatore.observe(sezione)

  /**
   * MOMENTO 3 — il taglio entra nello scafo, guidato dallo scorrimento.
   *
   * La sezione e' alta piu' di uno schermo e il palco resta fisso: la corsa
   * disponibile e' `altezza sezione - altezza finestra`. La prima meta' resta
   * dedicata alla dimostrazione; nella seconda il piano di sezione entra.
   *
   * Lo scorrimento NON viene intercettato: nessun gesto rubato, nessuna
   * sezione incatenata, la rotellina e la barra restano quelle del browser.
   * E' l'utente a decidere quanto aprire, e puo' tornare indietro.
   *
   * La posizione si legge a ogni fotogramma dal `getBoundingClientRect` vero,
   * non da una soglia in pixel calcolata una volta: con uno scorrimento
   * inerziale la pagina si sposta anche DOPO il calcolo, e una soglia fissa
   * sbaglia proprio mentre l'utente guarda.
   */
  /**
   * La posizione si legge dal rect VERO a ogni evento, non da una soglia in
   * pixel calcolata una volta: con lo scorrimento inerziale la pagina si
   * sposta anche DOPO il calcolo, e una soglia fissa sbaglia proprio mentre
   * l'utente guarda.
   *
   * Lo scorrimento non viene intercettato: nessun gesto rubato, nessuna
   * sezione incatenata, e si puo' tornare indietro (D27).
   */
  function leggiScorrimento () {
    const r = sezione.getBoundingClientRect()
    const corsa = r.height - window.innerHeight
    if (corsa <= 0) return
    const p = Math.min(1, Math.max(0, -r.top / corsa))
    regia(p)
    if (sim.S.ridotto) sveglia()
  }

  addEventListener('scroll', leggiScorrimento, { passive: true })
  addEventListener('resize', leggiScorrimento)
  leggiScorrimento()

  risveglia()
}
