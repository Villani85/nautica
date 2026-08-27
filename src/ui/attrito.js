/**
 * L'ATTRITO ALL'INIZIO, E L'INVITO A SCENDERE.
 *
 * --- DUE RICHIESTE DEL COMMITTENTE, E SONO LA STESSA COSA
 *
 * *"quando parte la clip devi bloccare un attimo lo scroll, altrimenti l utente
 * non se ne accorge che c e' una clip"* e *"dopo 3 secondi devi far apparire un
 * messaggio scroll, un invito a vedere cosa e' sotto"*.
 *
 * Sono i due tempi dello stesso momento. Il sito si apre su una fotografia che
 * si muove: due persone comode mentre fuori c e' mare forza quattro. Chi arriva
 * scorrendo la attraversa in mezzo secondo e non si accorge di averla vista.
 *
 * Quindi: un istante in cui la pagina non cede, perche' ci si fermi a guardare;
 * e poi, quando lo sguardo ha finito, un invito a scendere.
 *
 * --- L ATTRITO DURA MEZZO SECONDO, NON TRE
 *
 * Il piano se l era gia' scritto: *"un istante di attrito voluto -- mezzo
 * secondo, non tre"*. Una pagina che non risponde e' rotta; una pagina che
 * risponde un attimo dopo e' una pagina che ti sta dicendo qualcosa. La
 * differenza fra le due sta tutta nella durata, e va tenuta corta.
 *
 * E succede UNA VOLTA SOLA, all apertura. Un attrito che si ripete a ogni
 * passaggio smette di essere un segno e diventa un difetto.
 *
 * --- COSA NON FA, E PERCHE'
 *
 * Non blocca la tastiera e non blocca chi ha gia' scorso: chi arriva alla
 * pagina con una posizione ripristinata dal browser non ha niente da scoprire,
 * e trattenerlo sarebbe solo fastidio. E non tocca niente se l utente ha
 * chiesto movimento ridotto: li' l attrito e' esattamente il genere di sorpresa
 * che la preferenza chiede di non fare.
 */

const ATTRITO_MS = 550
const INVITO_DOPO_MS = 3000

/**
 * @param {object} opzioni
 * @param {HTMLElement} opzioni.invito  l'elemento da accendere dopo l'attesa
 * @param {boolean} opzioni.ridotto     con movimento ridotto non si trattiene
 */
export function attritoDiApertura ({ invito, ridotto = false }) {
  if (scrollY > 4) {
    // la visita non comincia dall alto: niente da presentare
    if (invito) invito.dataset.visibile = 'no'
    return
  }

  let trattiene = !ridotto
  const y0 = scrollY

  /**
   * `passive: false` e' obbligatorio: un ascoltatore passivo non puo' chiamare
   * `preventDefault`, e il browser lo ignora in silenzio -- cioe' l attrito non
   * ci sarebbe e nessun errore lo direbbe.
   */
  const trattieni = (e) => {
    if (!trattiene) return
    e.preventDefault()
    if (scrollY !== y0) scrollTo(0, y0)
  }
  const opz = { passive: false }
  addEventListener('wheel', trattieni, opz)
  addEventListener('touchmove', trattieni, opz)

  const molla = () => {
    trattiene = false
    removeEventListener('wheel', trattieni, opz)
    removeEventListener('touchmove', trattieni, opz)
  }
  setTimeout(molla, ATTRITO_MS)

  /**
   * L invito arriva dopo, e sparisce al primo gesto: ha fatto il suo lavoro nel
   * momento in cui viene capito, e restare sarebbe rimproverare.
   */
  if (!invito) return
  invito.dataset.visibile = 'no'
  const acceso = setTimeout(() => { invito.dataset.visibile = 'si' }, INVITO_DOPO_MS)
  const via = () => {
    clearTimeout(acceso)
    invito.dataset.visibile = 'no'
    removeEventListener('scroll', via)
    removeEventListener('keydown', via)
  }
  addEventListener('scroll', via, { passive: true })
  addEventListener('keydown', via)
}
