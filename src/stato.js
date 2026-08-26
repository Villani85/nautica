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

export const sim = creaSimulazione({ ridotto: preferenza.matches || forzato })

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
  if (marca !== undefined && marca === ultimaMarca) return tempo
  ultimaMarca = marca
  tempo += dt
  sim.passo(dt, tempo)
  return tempo
}

const ascoltatori = new Set()
export const alCambioDiStato = (f) => { ascoltatori.add(f); return () => ascoltatori.delete(f) }
export const statoCambiato = () => { for (const f of ascoltatori) f() }
