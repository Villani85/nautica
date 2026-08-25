/**
 * LA REGIA — sette battute guidate dallo scorrimento.
 *
 * LE REGOLE CHE NON SI TOCCANO, tutte gia' decise e pagate:
 *
 * - **niente gesto obbligatorio per avanzare** (D27). Lo scorrimento resta
 *   quello del browser: nessun gesto intercettato, nessuna sezione incatenata,
 *   e si puo' tornare indietro. Le battute descrivono cosa si vede, non cosa si
 *   e' costretti a fare;
 * - **un nodo, un padrone** (D29). La posizione ha un solo proprietario, lo
 *   scorrimento. Tutto il resto la legge;
 * - la posizione si legge dal `getBoundingClientRect` VERO a ogni fotogramma,
 *   mai da una soglia in pixel calcolata una volta: con lo scorrimento
 *   inerziale la pagina si sposta anche dopo il calcolo.
 *
 * LA BATTUTA 4 E' L'UNICO GESTO CHIESTO, e non blocca niente.
 *
 * Se l'utente non accende il sistema, la sequenza **prosegue lo stesso** e
 * mostra una nave che continua a rollare. Non e' una punizione: e' la
 * dimostrazione. Un sito che si ferma finche' non clicchi sta chiedendo
 * obbedienza; questo mostra cosa succede se non fai niente, che e' esattamente
 * la tesi.
 */
export const BATTUTE = [
  {
    id: 'emerge',
    da: 0.00, a: 0.13,
    titolo: 'La superficie si apre',
    testo: 'Quaranta metri di scafo. Sopra la linea sta il prodotto che si compra; sotto, quello che lo fa funzionare.'
  },
  {
    id: 'mare',
    da: 0.13, a: 0.30,
    titolo: 'Il mare sale',
    testo: 'Stato del mare 4. Una carena nuda ha uno smorzamento bassissimo: e’ il motivo per cui gli stabilizzatori esistono.'
  },
  {
    id: 'invito',
    da: 0.30, a: 0.44,
    titolo: 'Il sistema è spento',
    testo: 'Accendilo. È l’unica cosa che ti viene chiesta — e se non lo fai, la nave continua a rollare.'
  },
  {
    id: 'calma',
    da: 0.44, a: 0.60,
    titolo: 'La nave si calma',
    testo: 'La riduzione non è dichiarata: girano due simulazioni in parallelo, una con le pinne e una senza, e il numero è il rapporto fra i due picchi.'
  },
  {
    id: 'taglio',
    da: 0.60, a: 0.80,
    titolo: 'Il taglio entra nello scafo',
    testo: 'Il piano di sezione corre lungo la nave. La faccia del taglio non è approssimata: è la stessa curva che genera la carena.'
  },
  {
    id: 'meccanismo',
    da: 0.80, a: 1.01,
    titolo: 'Il pezzo che non vedi mai',
    testo: 'Albero passante, flangia di attraversamento carena, collare di tenuta, riduttore, biella. Costa una frazione della barca e decide se ci si sta comodi.'
  }
]

/** In quale battuta siamo, e quanto siamo avanti dentro di essa. */
export function battutaA (p) {
  for (let i = 0; i < BATTUTE.length; i++) {
    const b = BATTUTE[i]
    if (p < b.a || i === BATTUTE.length - 1) {
      return { indice: i, b, dentro: Math.max(0, Math.min(1, (p - b.da) / (b.a - b.da))) }
    }
  }
  return { indice: 0, b: BATTUTE[0], dentro: 0 }
}

const fra = (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)))
/** Addolcimento: parte e arriva senza spigolo. */
const dolce = (x) => x * x * (3 - 2 * x)

export function creaRegia ({ scena, sim, palco, didascalia, alCambio }) {
  let ultima = -1
  const tit = didascalia.querySelector('[data-ruolo="titolo"]')
  const txt = didascalia.querySelector('[data-ruolo="testo"]')
  const num = didascalia.querySelector('[data-ruolo="numero"]')

  /**
   * Il mare sale con lo scorrimento, ma **solo in salita**: tornando indietro
   * resta dov'e'. Uno stato del mare che si abbassa da solo mentre si risale
   * contraddirebbe il comando che l'utente ha in mano — e la manopola deve
   * restare sua.
   */
  let mareRaggiunto = 0
  let ultimaP = 0

  function aggiorna (p) {
    ultimaP = p
    // 1 - 2 · la nave emerge, poi il mare sale
    scena.impostaEmersione(dolce(fra(p, 0.00, 0.13)))

    const salita = Math.round(fra(p, 0.13, 0.30) * 4)
    if (salita > mareRaggiunto) {
      mareRaggiunto = salita
      if (sim.S.mare !== salita) { sim.S.mare = salita; sim.azzeraPicchi(); alCambio?.() }
    }

    // 6 - 7 · il taglio entra e il meccanismo si scopre
    scena.impostaSpaccato(dolce(fra(p, 0.60, 1.00)))

    const { indice, b } = battutaA(p)

    /**
     * DIFETTO CORRETTO — questo controllo stava DENTRO il ramo "la battuta e'
     * cambiata", quindi accendendo il sistema mentre si restava nella stessa
     * battuta l'avviso "il sistema e' spento" non spariva: la nave si calmava
     * a schermo e il testo continuava a dire il contrario.
     *
     * Va valutato a ogni giro, perche' non dipende dalla battuta: dipende
     * dallo stato, e lo stato lo cambia l'utente quando vuole.
     */
    didascalia.dataset.spento = (b.id === 'calma' && !sim.S.stab) ? 'si' : 'no'

    if (indice === ultima) return
    ultima = indice
    palco.dataset.battuta = b.id
    num.textContent = String(indice + 1).padStart(2, '0')
    tit.textContent = b.titolo
    txt.textContent = b.testo
  }

  /**
   * Rivaluta senza che lo scorrimento si sia mosso.
   *
   * Serve perche' lo stato lo cambia anche l'utente: accendendo il sistema
   * fermo, la regia non veniva richiamata e il testo restava indietro. La
   * posizione resta di UN solo padrone — lo scorrimento — e questa funzione
   * non la tocca: rilegge l'ultima.
   */
  aggiorna.rivaluta = () => aggiorna(ultimaP)
  return aggiorna
}
