import { creaSimulazione } from './scena/simulazione.js'

/**
 * LO STATO, UNO SOLO.
 *
 * Il sito ha due capitoli che guardano la stessa nave da due punti di vista —
 * la dimostrazione da fuori, il salone da dentro — e devono raccontare **la
 * stessa traversata**. Se ognuno tenesse la propria simulazione, si potrebbe
 * arrivare al salone con la stanza ferma mentre due schermate sopra la nave
 * rolla: il sito si smentirebbe da solo, e sarebbe la bugia peggiore possibile
 * qui, perche' l'argomento e' proprio che sopra e sotto la linea sono lo stesso
 * integratore.
 *
 * I moduli ES sono singleton: chi importa questo file riceve la STESSA
 * istanza. E' D29 — *un nodo, un padrone* — applicata allo stato invece che
 * alla posizione di scorrimento.
 *
 * IL MOVIMENTO RIDOTTO SI DECIDE QUI, una volta, perche' e' una proprieta'
 * della visita e non di un capitolo. `?ridotto=1` resta l'interruttore di prova
 * che lo forza: la preferenza di sistema non si puo' cambiare da una scheda
 * automatizzata, e un requisito che non si puo' provare e' un requisito
 * dichiarato e basta.
 */
const preferenza = window.matchMedia('(prefers-reduced-motion: reduce)')
const forzato = location.search.includes('ridotto=1')

/**
 * ─── FERMARE LA SCENA SU UN ISTANTE PRECISO, e perche' non se ne poteva piu'
 * fare a meno
 *
 *     ?fermo=12.5
 *
 * La scena e' viva: la nave rolla, la pinna oscilla, e due fotogrammi presi
 * allo stesso scorrimento a venti minuti di distanza mostrano pose diverse.
 * Finche' e' cosi', **nessuna misura fatta su un fotogramma si puo' rifare**.
 * L'ho pagata: lo stesso identico programma mi ha dato 8,50 e 1,96 misurando
 * la grana della pinna, e da quei numeri avevo gia' tirato due conclusioni.
 * Un metro che risponde due cose diverse alla stessa domanda non e' un metro.
 *
 * ─── E NON E' UNA POSA FINTA
 *
 * La strada facile sarebbe scrivere a mano un angolo di rollio e uno di pinna.
 * Sarebbe una bugia della stessa famiglia di quelle che questo sito rifiuta: si
 * misurerebbe una posa che la fisica non produce.
 *
 * Qui invece si INTEGRA davvero, da zero fino all'istante chiesto, a passo
 * fisso. Lo stato che si ottiene e' uno stato vero della simulazione -- solo,
 * sempre lo stesso. Poi il tempo smette di avanzare.
 *
 * Il passo e' 1/120 e non il dt del disegno perche' il dt del disegno dipende
 * da quanto e' carica la macchina, ed e' proprio quello che rende la posa
 * irripetibile.
 */
const FERMO = Number(new URLSearchParams(
  typeof location === 'undefined' ? '' : location.search).get('fermo'))
/**
 * L'istante a cui la scena e' inchiodata, o `null` se il tempo scorre. Lo
 * legge anche `scena/index.js` per le onde, che hanno un orologio loro: se ne
 * fermasse uno solo il fotogramma resterebbe irripetibile e non si capirebbe
 * perche'. Un parametro letto in due posti diverge; letto qui e importato, no.
 */
export const FERMO_A = (Number.isFinite(FERMO) && FERMO > 0) ? FERMO : null
const PASSO_FERMO = 1 / 120
let inchiodata = false

/**
 * ─── E CON `?fermo` ANCHE IL MARE HA UN SEME
 *
 * Senza seme le fasi delle onde sono casuali a ogni visita, ed e' voluto: due
 * persone non incontrano la stessa onda. Ma allora due fotogrammi presi allo
 * stesso istante in due caricamenti diversi mostrano DUE MARI DIVERSI, e
 * fermare il tempo non basta -- l'ho scoperto cosi': avevo inchiodato la
 * simulazione, l'orologio delle onde e la dimostrazione automatica, e lo stato
 * continuava a uscire diverso. Non era un terzo cronometro: era il caso, che
 * sta nella COSTRUZIONE e non nel passo.
 *
 * Il seme esisteva gia', per il cancello del fantasma. Qui si riusa.
 */
export const sim = creaSimulazione({
  ridotto: preferenza.matches || forzato,
  seme: FERMO_A !== null ? 20260829 : undefined
})

/**
 * LA CONDIZIONE DI PARTENZA DELLA VISITA — mare quattro, sistema ACCESO.
 *
 * Il sito si apre sul salone, e si apre **calmo**: due persone comode, i
 * bicchieri dritti, e fuori dal finestrino il mare che corre. Se si partisse
 * col sistema spento non ci sarebbe niente da spegnere, e la prima cosa che si
 * vede sarebbe una stanza che sbatte — cioe' il problema invece della sua
 * soluzione. Si entra da dove si sta bene, e solo dopo si scopre a spese di chi.
 *
 * E mare quattro perche' e' quello che la didascalia dichiara: se lo stato
 * fosse zero, spegnere non produrrebbe niente e l'invito sarebbe una bugia.
 */
sim.S.mare = 4
sim.S.stab = true

/**
 * --- E LA TRAVERSATA E' GIA' COMINCIATA
 *
 * Le due righe qui sopra dicono in che mare siamo. Questa dice DA QUANTO.
 *
 * Il committente ha scritto "l immagine non si muove", e misurando aveva
 * ragione: a stabilizzatore spento e mare 5, sei secondi dopo il caricamento
 * il rollio era 2,3 gradi su 15 nominali. Non un guasto -- l oscillatore
 * partiva da fermo, e con smorzamento 0,045 l ampiezza ci mette piu' di un
 * minuto a montare.
 *
 * Accelerare la salita avrebbe voluto dire falsificare lo smorzamento, cioe'
 * il numero su cui poggia tutta la tesi. Invece si corregge l ipotesi
 * sbagliata: il mare non comincia quando apri la pagina. La nave e' in mare da
 * prima, e si integra in avanti a porte chiuse prima del primo fotogramma.
 *
 * E' esattamente cio' che il banco di misura fa da sempre con TRANSITORIO.
 */
sim.scalda()

/**
 * Chi vuole sapere quando lo stato cambia si iscrive qui. Serve perche' i due
 * capitoli hanno cicli di disegno separati — quello del salone dorme mentre sei
 * nella dimostrazione — e chi dorme deve poter ridisegnare una volta quando
 * l'utente tocca l'interruttore, invece di svegliarsi con la stanza sbagliata.
 */
/**
 * ─── E ANCHE IL TEMPO HA UN PADRONE SOLO.
 *
 * DIFETTO PRESO GUARDANDO. Il salone leggeva `sim.S.rollio` ma non faceva
 * avanzare niente: la simulazione la muoveva solo il ciclo della dimostrazione,
 * che si ferma quando esce di schermo. Risultato: si arrivava al salone col
 * sistema spento e la stanza **perfettamente immobile** — cioe' il capitolo
 * mostrava esattamente il contrario di quello che dice.
 *
 * Adesso avanza chi sta disegnando, chiunque sia. La marca del fotogramma —
 * quella che `setAnimationLoop` passa — impedisce il doppio passo nell'istante
 * in cui i due capitoli sono a schermo insieme: senza, al confine fra i due la
 * nave rollerebbe al doppio della velocita' per qualche fotogramma. Un difetto
 * che si vede appena e non si sa spiegare.
 */
let ultimaMarca = -1
let tempo = 0


export function avanza (dt, marca) {
  if (FERMO_A !== null) {
    if (!inchiodata) {
      inchiodata = true
      for (let t = 0; t < FERMO_A; t += PASSO_FERMO) {
        tempo = Math.min(t + PASSO_FERMO, FERMO_A)
        sim.passo(PASSO_FERMO, tempo)
      }
    }
    return tempo
  }
  if (marca !== undefined && marca === ultimaMarca) return tempo
  ultimaMarca = marca
  tempo += dt
  sim.passo(dt, tempo)
  return tempo
}

const ascoltatori = new Set()
export const alCambioDiStato = (f) => { ascoltatori.add(f); return () => ascoltatori.delete(f) }
export const statoCambiato = () => { for (const f of ascoltatori) f() }
