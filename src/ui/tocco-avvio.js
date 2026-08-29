/**
 * L'ACCENSIONE DELL'ATTO DUE COL DITO — quattro righe di percorso critico.
 *
 * ─── PERCHE' UN FILE A PARTE, E PERCHE' UN SECONDO `<script>`
 *
 * `src/main.js` porta il percorso critico della prima schermata e non lo tocca
 * nessuno in queste ore: sta scritto in testa a quel file che non deve tirarsi
 * dietro il motore 3D, e questa sessione ha il divieto esplicito di riscrivere
 * cio' che c'e' gia'. Un secondo modulo dichiarato in `index.html` e' additivo:
 * se domani lo si toglie, si toglie una riga e il sito e' quello di prima.
 *
 * ─── COSA COSTA, e la regola che questo repo si e' data
 *
 * Qui dentro non entra niente di pesante. Il foglio di stile arriva subito --
 * serve al pulsante, che si vede prima che qualcuno lo prema, e un pulsante
 * senza stile che si aggiusta un istante dopo e' peggio di nessun pulsante --
 * mentre l'interfaccia vera (`tocco.js`, con lo schema e la mappa) arriva **al
 * primo tocco**. E' la stessa regola con cui `main.js` tiene fuori three
 * finche' la dimostrazione non si avvicina.
 */
import './tocco.css'

const contenitore = document.querySelector('#esplorazione')
const nav = document.querySelector('.testata nav')

if (contenitore && nav) {
  const entrata = document.createElement('button')
  entrata.type = 'button'
  entrata.id = 'entra-esplorazione'
  entrata.className = 'espl-entra'
  entrata.textContent = 'Below'
  /**
   * Il nome corto sta nella riga della navigazione insieme a Saloon, Ship,
   * Cut e Mechanism; quello lungo lo sente chi non vede la riga. Sono la stessa
   * cosa detta a due lettori diversi, non due nomi.
   */
  entrata.setAttribute('aria-label', 'Explore below deck')
  entrata.setAttribute('aria-expanded', 'false')
  nav.appendChild(entrata)

  let esplorazione = null
  entrata.addEventListener('click', async () => {
    if (!esplorazione) {
      /**
       * I due modi di fallire sono diversi e vanno detti in modo diverso -- e'
       * la lezione di `main.js`, dove un solo `catch` dichiarava all'utente che
       * il suo browser non supporta WebGL ogni volta che qualunque cosa andava
       * storta. Qui, se il modulo non arriva, il pulsante non deve fingere di
       * aver aperto qualcosa: si spegne, e la ragione finisce in console.
       */
      try {
        const m = await import('./tocco.js')
        esplorazione = m.creaEsplorazione({ contenitore, entrata })
      } catch (e) {
        console.error("[nautica] l'esplorazione col dito non e' arrivata", e)
        entrata.remove()
        return
      }
    }
    if (!esplorazione) { entrata.remove(); return }
    entrata.setAttribute('aria-expanded', 'true')
    esplorazione.apri()
  })

  /**
   * Il pulsante racconta lo stato vero, e lo legge dal riquadro invece di
   * tenerne una copia: chiudere si puo' anche con Escape o col pulsante
   * dentro il riquadro, e un `aria-expanded` aggiornato solo qui direbbe
   * «aperto» a chi ha appena chiuso. E' lo stesso difetto che `comandi.js`
   * ha pagato con `aria-pressed` scritto in due posti.
   */
  new MutationObserver(() => {
    entrata.setAttribute('aria-expanded', String(contenitore.dataset.stato === 'aperta'))
  }).observe(contenitore, { attributes: true, attributeFilter: ['data-stato'] })
}
