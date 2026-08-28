/**
 * IL MENU PORTA ALLE SCENE, non ai capitoli.
 *
 * Le voci dell'intestazione erano quattro ancore a sezioni di testo, e due di
 * quelle sezioni non esistono piu'. Adesso ogni voce salta dentro la
 * dimostrazione, alla battuta che nomina.
 *
 * ─── DA DOVE VENGONO LE POSIZIONI
 *
 * Da `BATTUTE` di `regia.js`, non da una seconda lista di numeri. E' la stessa
 * regola per cui in quel file la sequenza si riallinea alle soglie di `S`
 * invece di portarsi dietro due copie: due liste divergono alla prima modifica,
 * una lista e una lettura no.
 *
 * La posizione di scorrimento si ricava con la formula INVERSA di quella che
 * `demo.js` usa per leggere il progresso -- `p = -r.top / (altezza - schermo)`
 * -- quindi non c'e' nessuna soglia in pixel da tenere allineata a mano, e il
 * menu continua a funzionare se la sezione cambia altezza.
 *
 * ─── E RESTANO ANCORE VERE
 *
 * Ogni voce e' un `<a href="#dimostrazione">` con un bersaglio che esiste:
 * senza JavaScript, o prima che questo modulo arrivi, il menu porta comunque
 * alla dimostrazione. Un menu che non fa niente e' peggio di un menu grezzo.
 */
import { BATTUTE } from '../regia.js'

/** Dove guardare dentro una battuta: un filo dentro, non sul bordo. */
const DENTRO = 0.35

export function creaMenu () {
  const sezione = document.querySelector('#dimostrazione')
  const voci = document.querySelectorAll('nav [data-scena]')
  if (!sezione || !voci.length) return

  const posizioneDi = (id) => {
    const b = BATTUTE.find((x) => x.id === id)
    if (!b) return null
    const r = sezione.getBoundingClientRect()
    const corsa = r.height - window.innerHeight
    if (corsa <= 0) return null
    const cima = window.scrollY + r.top
    const p = b.da + (b.a - b.da) * DENTRO
    return cima + Math.min(1, Math.max(0, p)) * corsa
  }

  for (const a of voci) {
    a.addEventListener('click', (e) => {
      const y = posizioneDi(a.dataset.scena)
      if (y === null) return           // senza posizione, l'ancora fa il suo lavoro
      e.preventDefault()
      /**
       * `prefers-reduced-motion` si onora DENTRO l'esperienza, non spegnendola:
       * chi lo ha chiesto arriva alla stessa scena, di colpo invece che
       * scorrendo. Nessuno perde una destinazione.
       */
      const scatto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: y, behavior: scatto ? 'auto' : 'smooth' })
    })
  }

  /**
   * QUALE SCENA E' ATTIVA. Si legge dal palco, che gia' porta `data-battuta`
   * scritto dalla regia: non si ricalcola qui una seconda volta quale battuta
   * sia in corso, che sarebbe di nuovo due implementazioni della stessa cosa.
   */
  /**
   * IL PALCO SI CERCA DENTRO LA SEZIONE, e non e' pedanteria: e' una trappola
   * gia' pagata e gia' scritta in `demo.js`. Nel documento ci sono DUE
   * elementi `.palco` -- quello del salone e quello della dimostrazione -- e il
   * salone viene prima, quindi `document.querySelector('.palco')` prende il
   * suo. Con la scena unica quel nodo viene poi rimosso: l'osservatore restava
   * appeso a un elemento staccato dal documento, che non cambia mai piu'.
   *
   * Il sintomo era muto: nessun errore, le voci giuste, e `aria-current` a
   * "false" su tutte -- perche' `palco.dataset.battuta` era `undefined` e non
   * corrispondeva a niente. L'ho visto solo leggendo l'attributo invece che la
   * classe.
   */
  const palco = sezione.querySelector('.palco')
  if (!palco) return
  const segna = () => {
    const b = palco.dataset.battuta
    for (const a of voci) {
      const suo = a.dataset.scena === b
      a.setAttribute('aria-current', suo ? 'true' : 'false')
      a.classList.toggle('nav--qui', suo)
    }
  }
  new MutationObserver(segna).observe(palco, { attributes: true, attributeFilter: ['data-battuta'] })
  segna()
}
