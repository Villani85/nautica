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
     * --- LA RIGA VIVA: COSA STA SUCCEDENDO, ADESSO
     *
     * Guardando la battuta del meccanismo non si capiva cosa stesse facendo il
     * pezzo: c'erano quattro numeri in fondo allo schermo e una macchina che
     * si muoveva, e niente diceva che le due cose fossero la stessa.
     *
     * Questi due numeri lo dicono, e sono gia' nella simulazione: l'angolo
     * della PINNA in questo istante, e il rollio della nave NUDA -- cioe'
     * quanto rollerebbe senza. Il secondo e' il controfattuale, ed e' la tesi
     * del sito detta con i suoi stessi numeri nel momento in cui la si guarda.
     *
     * Niente e' scritto a mano: se la fisica cambia, cambia la frase.
     */
    if (el.pinna) el.pinna.textContent = grad(S.pinna * 180 / Math.PI)
    if (el.nudo) el.nudo.textContent = grad(Math.abs(S.rollioNudo))
    if (el.rollio2) el.rollio2.textContent = grad(Math.abs(S.rollio))

    /**
     * LA RIDUZIONE E' MISURATA, non stampata.
     *
     * Prima qui c'era `Math.round((1 - SMORZAMENTO) * 100)`, cioe' una costante
     * scritta a mano che diceva sempre 89. Ora arriva da `S.riduzione`: il
     * rapporto fra le RMS a regime di due simulazioni parallele — una con le
     * pinne e una senza — mediate su piu' realizzazioni del mare. Il numero se
     * lo guadagna.
     *
     * --- E QUI C'ERA UNA PROMESSA CHE AL PUNTO DI LAVORO NON E' MANTENUTA
     *
     * Diceva: «cambia con il mare e con la velocita' perche' nella realta'
     * cambia». Con la velocita' si', col mare NO -- non all'andatura da cui il
     * sito si apre. Misurato sulla tabella spedita, scarto fra mare 1 e mare 5:
     *
     *      4 nodi   40,6 punti   [43,8  10,9  5,8  4,1  3,2]
     *      8 nodi   63,3         [80,4  80,5  72,9 25,2 17,2]
     *     12 nodi    0,02        [90,8  90,8  90,8 90,8 90,8]   <- il default
     *     20 nodi    0,01        [96,6  96,6  96,6 96,6 96,6]
     *
     * Non e' un difetto del modello: e' cio' che fa un sistema LINEARE. Sotto
     * lo stallo `portanza(a) = a`, l'angolo di pinna e' proporzionale alla
     * velocita' di rollio, quindi raddoppiando il mare raddoppiano sia il
     * rollio sia la correzione e il rapporto resta. Il mare torna a contare
     * solo quando la pinna finisce la corsa, cioe' sotto gli ~11 nodi.
     *
     * Trovato da una revisione esterna, che ha notato la cosa giusta: lo
     * stallo era stato introdotto APPOSTA per rompere quei cinque numeri
     * uguali, e non arriva dove il sito si apre. Curato dicendolo in pagina,
     * non cambiando il modello -- il modello ha ragione.
     *
     * (Questo commento diceva "il rapporto fra i picchi". Era vero per una
     * settimana e poi non piu': il picco su finestra finita non converge.)
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
