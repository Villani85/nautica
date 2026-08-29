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
/**
 * ─── LA SCENA E' UNA SOLA, e le battute lo dicono
 *
 * Prima il sito aveva due atti in due sezioni: un salone in DOM e una
 * dimostrazione in WebGL. Ora e' un atto solo, e comincia SEDUTI nel salone.
 * `?doppia=1` riporta alla vecchia architettura — resta finche' la nuova non
 * ha girato su un telefono vero.
 */
/**
 * --- SI LEGGE IL VALORE, NON LA PRESENZA DELLA PAROLA
 *
 * Qui c'era `!location.search.includes('doppia')`: un confronto di
 * SOTTOSTRINGA. Conseguenza, e non e' teorica -- **`?doppia=0` accendeva
 * l'architettura doppia**, cioe' l'opposto di quello che zero significa
 * ovunque. E lo stesso valeva per qualunque parametro che contenesse quelle
 * sei lettere.
 *
 * Un interruttore che si accende quando gli dici di spegnersi non e' un
 * interruttore: e' una trappola per chi verra' dopo, incluso me fra un mese.
 * `URLSearchParams` legge il VALORE, e solo '1', 'si' e 'true' accendono.
 */
export const LA_SCENA_E_UNA = (() => {
  if (typeof location === 'undefined') return true
  const v = new URLSearchParams(location.search).get('doppia')
  return !(v !== null && ['1', 'si', 'true', ''].includes(v))
})()

/**
 * La prima battuta del vecchio ordine era «la nave emerge»: serviva perche'
 * altrimenti lo schermo era vuoto. Adesso il capitolo apre dentro la nave, e
 * quella battuta diventa cio' che e' sempre stata nella testa di chi guarda —
 * il momento in cui si esce e la si vede da fuori.
 */
const SALOTTO = {
  id: 'salotto',
  da: 0.00, a: 0.15,
  titolo: 'Sea state four. Nobody in here is thinking about it.',
  /**
   * Accorciato di due righe: a 1440x900 il riquadro traboccava di 33 px, cioe'
   * 1,2 righe, e `collaudo-impaginato` l'ha preso subito. Non si allarga il
   * riquadro — si dice la stessa cosa in meno parole, che qui e' anche meglio:
   * questa battuta va guardata, non letta.
   */
  /**
   * Accorciata due volte, e la seconda ha migliorato il testo invece di
   * limitarsi a farlo stare. La frase sul costo — «e' costato una frazione
   * della barca» — vive gia' nella battuta del meccanismo, che e' il posto
   * dove significa qualcosa: li' si sta guardando il pezzo. Qui era una
   * promessa fatta prima di aver mostrato di cosa si parla.
   *
   * A 1280x720 con la pila abbassata di 18 px traboccava di 1,4 righe:
   * l'ha detto `collaudo-impaginato` nello stesso minuto in cui avevo
   * corretto la collisione che quello spazio serviva a togliere.
   */
  testo: 'Outside, the swell is running two metres. In here the glasses are ' +
         'standing up. Somebody decided that.'
}

/** Le soglie della corsa, spostate per far posto al salone. */
export const S = LA_SCENA_E_UNA
  /**
   * L'uscita non comincia al primo pixel: la prima battuta e' il salone, e un
   * salone che si allontana appena si tocca la rotella non lo si guarda mai.
   * Misurato: a p = 0,02 con la corsa che partiva da zero la camera era gia'
   * a tre unita' e la fotografia occupava un quarto dello schermo.
   */
  ? { uscita: [0.05, 0.20], emerge: [0.15, 0.26], mare: [0.26, 0.38],
      invito: [0.38, 0.50], calma: [0.50, 0.64], taglio: [0.64, 1.00],
      avvicina: [0.84, 0.93], verticale: [0.74, 0.86], traversata: [0.93, 1.00] }
  : { uscita: [0.00, 0.00], emerge: [0.00, 0.13], mare: [0.13, 0.30],
      invito: [0.30, 0.44], calma: [0.44, 0.60], taglio: [0.60, 1.00],
      avvicina: [0.82, 0.93], verticale: [0.72, 0.86], traversata: [0.93, 1.00] }

const SEQUENZA = [
  {
    id: 'emerge',
    da: 0.00, a: 0.13,
  },
  {
    id: 'mare',
    da: 0.13, a: 0.30,
    /**
     * QUI C'ERA UNA FRASE CHE IL CODICE NON SOSTIENE PIU'.
     *
     * Diceva "this is the water that was running past the window a minute
     * ago". Lo e' stato per un commit: il vetro era bucato sull'acqua della
     * scena. Poi quella strada e' stata abbandonata -- il vano diventava vuoto,
     * 67,4% di superficie piatta contro 18,1% -- e dentro e' tornato il
     * filmato. La battuta e' rimasta, ed e' diventata una bugia sul proprio
     * prodotto: dentro c'e' una clip, fuori c'e' geometria procedurale.
     *
     * Segnalato da una revisione. Adesso dice cio' che e' vero e verificabile:
     * lo STATO del mare e l'integratore sono gli stessi. La superficie no, e
     * finche' non lo sara' il sito non lo afferma.
     */
  },
  {
    id: 'invito',
    da: 0.30, a: 0.44,
  },
  {
    id: 'calma',
    da: 0.44, a: 0.60,
  },
  {
    id: 'taglio',
    da: 0.60, a: 0.80,
  },
  {
    id: 'meccanismo',
    da: 0.80, a: 1.01,
    titolo: 'The part you never see',
    testo: 'Servomotor, cycloidal reduction, output carrier, shaft, gland, fin. It costs a fraction of the boat, and it decides whether anyone is comfortable on board.'
  }
]

/**
 * Le battute della sequenza si riallineano alle soglie di `S`, invece di
 * portarsi dietro due copie della stessa lista con numeri diversi. Due liste
 * divergono; una lista e una tabella di soglie no.
 */
const CHIAVI = ['emerge', 'mare', 'invito', 'calma', 'taglio', 'meccanismo']
const riallineata = SEQUENZA.map((b, i) => {
  const k = CHIAVI[i]
  const soglia = S[k]
  if (!soglia) return b
  return { ...b, da: soglia[0], a: soglia[1] }
})
// il taglio e il meccanismo si dividono l'ultimo tratto, come prima
const inizioMecc = S.taglio[0] + (S.taglio[1] - S.taglio[0]) * 0.5
riallineata[4] = { ...riallineata[4], da: S.taglio[0], a: inizioMecc }
riallineata[5] = { ...riallineata[5], da: inizioMecc, a: 1.01 }

export const BATTUTE = LA_SCENA_E_UNA ? [SALOTTO, ...riallineata] : SEQUENZA

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

export function creaRegia ({ scena, sim, palco, didascalia, alCambio, allaBattuta }) {
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
    /**
     * 1 - 2 · la nave emerge, poi il mare sale.
     *
     * ─── NON SI PARTE DA ZERO, E NON E' UN VEZZO
     *
     * Con `emersione = 0` alla prima riga della sezione la nave e' sott'acqua e
     * lo schermo e' **vuoto**: carta sopra la linea, acqua sotto, niente in
     * mezzo. Il capitolo prima finisce con il finestrino del salone che esce
     * dall'alto — anche quello, alla fine, uno schermo vuoto. Due schermate
     * vuote di fila nel punto di giunzione, ed e' esattamente li' che il
     * committente ha detto che si sentono due scene invece di una.
     *
     * Partendo da 0,42 la sovrastruttura e' gia' sopra la linea quando la
     * sezione comincia: il finestrino sale, e cio' che resta al suo posto e'
     * la barca vista da fuori, che continua a salire. La discesa non si
     * interrompe mai — cambia solo il punto di vista, e il perno e' la linea
     * dell'orizzonte, che nei due capitoli sta nello stesso posto.
     *
     * `SOTT_ACQUA` non e' zero anche per una ragione piu' semplice: uno schermo
     * vuoto non e' un momento di respiro se dura piu' di un istante, e' un
     * momento in cui si chiude la scheda.
     */
    const SOTT_ACQUA = 0.42
    scena.impostaEmersione(SOTT_ACQUA + (1 - SOTT_ACQUA) * dolce(fra(p, S.emerge[0], S.emerge[1])))

    const salita = Math.round(fra(p, S.mare[0], S.mare[1]) * 4)
    if (salita > mareRaggiunto) {
      mareRaggiunto = salita
      if (sim.S.mare !== salita) { sim.S.mare = salita; sim.azzeraPicchi(); alCambio?.() }
    }

    // 6 - 7 · il taglio entra e il meccanismo si scopre
    scena.impostaSpaccato(dolce(fra(p, S.taglio[0], S.taglio[1])))

    /**
     * 8 · LA TRAVERSATA, e il sito torna alle persone.
     *
     * ─── PERCHE' QUI E NON PRIMA
     *
     * `docs/13` §5: il finale e' la camera che risale attraverso lo stesso
     * taglio, attraversa gli spazi interni e arriva alle stesse due persone
     * della prima immagine. Non e' un capitolo nuovo: e' il cerchio che si
     * chiude, e chiuderlo prima del primo piano del meccanismo vorrebbe dire
     * tornare alle persone senza aver visto la macchina che le tiene comode --
     * cioe' togliere la ragione per cui il ritorno commuove.
     *
     * ─── PERCHE' SOLO L'ULTIMO 7% DELLA CORSA
     *
     * Non e' una tacca scelta a occhio: la traversata dura DIECI SECONDI, e su
     * una corsa che si percorre in circa un minuto e mezzo il 7% e' il tratto
     * che le corrisponde. Piu' larga e il filmato finirebbe a meta' e
     * resterebbe fermo sull'ultimo fotogramma mentre si scorre ancora -- una
     * fotografia, cioe' proprio la cosa che questo finale ha scartato. Piu'
     * stretta e la si attraverserebbe di corsa senza vederla.
     *
     * ─── E IL FILMATO NON E' SCRUBBATO, ed e' una decisione
     *
     * Lo scorrimento decide QUANDO comincia, non a che punto sta. Un video
     * scrubbato dallo scorrimento singhiozza su iOS (e' scritto nella skill
     * dello stack, ed e' gia' costato una volta), e soprattutto: la traversata
     * ha un suo tempo: e' un movimento di camera girato, non una linea da
     * spazzolare. Chi si ferma a meta' la vede continuare -- ed e' giusto,
     * perche' a quel punto non e' piu' lui a guidare, e' arrivato.
     */
    /**
     * 7bis · LA SEZIONE VERTICALE — il climax razionale, prima di quello
     * emotivo.
     *
     * Sta FRA il primo piano del meccanismo e la traversata, e l'ordine e' la
     * decisione del committente: prima si vede il perche' (una nave intera in
     * sezione, con le macchine sotto e le persone sopra), poi si torna dalle
     * persone. Invertirli darebbe il finale prima della ragione.
     *
     * Finisce dove comincia la traversata, non prima: la camera non deve
     * trovarsi con lo scafo richiuso addosso mentre il filmato entra.
     */
    /**
     * ─── L'AVVICINAMENTO DEVE FINIRE PRIMA CHE IL FILMATO COMINCI
     *
     * DIFETTO MISURATO, non sospettato. `avvicina` arrivava a 1,00 e
     * `traversata` partiva a 0,93: le due fasce si sovrapponevano per il 7%, e
     * il filmato prendeva il comando MENTRE la camera stava ancora arrivando.
     *
     * Misurato spegnendo il piano del filmato: nell'istante dello scambio la
     * camera sta a (2,30 0,09 2,35), distanza 3,29; il fotogramma che il primo
     * fotogramma del filmato ricostruisce sta a distanza 1,95. UNA VOLTA E
     * SETTE piu' lontano, e li' la pinna misura una cinquantina di pixel
     * contro i 168,5 del filmato: uno stacco di scala di oltre tre volte. Non
     * i sedici pixel del primo piano -- quello era il confronto giusto fatto
     * nel punto sbagliato.
     *
     * Ne' l'istante ne' il raggio lo chiudono: spazzolati sedici istanti, il
     * migliore resta a -10,5 px e la linea d'acqua non si muove di una riga.
     * L'istante cambia la posa, non sposta la camera lungo la corsa. La leva
     * era una terza, ed e' questa riga.
     *
     * E la sezione verticale si sposta PRIMA dell'avvicinamento invece che
     * dopo: si vede la nave intera in sezione -- macchine sotto, persone sopra
     * -- poi la camera scende sul meccanismo, poi il filmato riparte da li'.
     * Il climax razionale prima di quello emotivo, come vuole la decisione, ma
     * senza che l'uno rompa la cucitura dell'altro.
     */
    scena.impostaVerticale?.(dolce(fra(p, S.verticale[0], S.verticale[1])))

    scena.impostaTraversata?.(fra(p, S.traversata[0], S.traversata[1]))
    /**
     * ─── E L'INTERFACCIA SI RITIRA, o il finale non e' un finale
     *
     * DIFETTO PRESO GUARDANDO IL PRIMO PROVINO. La traversata partiva e
     * funzionava, ma sopra restavano accesi il cruscotto, le due letture, la
     * scala del mare, i due interruttori, la didascalia e il nudge. Il
     * fotogramma non si leggeva come «sono tornato dalle persone»: si leggeva
     * come **un video che gira dietro un pannello di controllo**.
     *
     * Non e' una questione di gusto. Per tutta la corsa quei comandi sono la
     * ragione per cui il sito non e' un filmato -- si tocca e la fisica
     * risponde. Nel finale la fisica ha gia' risposto: quello che resta da
     * fare e' guardare due persone. Un comando li' non invita, distrae.
     *
     * Si spegne con un attributo e una regola di stile, non nascondendo i nodi:
     * cosi' restano nel documento, raggiungibili da tastiera e annunciati,
     * mentre l'occhio ha il fotogramma pulito. Nascondere i comandi davvero
     * significherebbe togliere il controllo a chi non usa il mouse.
     */
    /**
     * Il cruscotto torna quando il filmato ha finito, non quando lo scorrimento
     * finisce: dopo il rientro la scena e' di nuovo viva e comandabile, e senza
     * i comandi il sito si chiuderebbe su una cartolina. E' anche il momento in
     * cui la tesi si puo' RIFARE dall'interno -- si spegne lo stabilizzatore e
     * il salone si inclina, con la stessa corsa che ha inclinato lo scafo.
     */
    const finito = scena.traversataFinita?.() === true
    const inTraversata = !finito && fra(p, S.traversata[0], S.traversata[1]) > 0.02 ? 'si' : 'no'
    palco.dataset.traversata = inTraversata
    /**
     * Il nudge NON e' figlio del palco -- e' appeso al corpo del documento,
     * perche' deve poter puntare comandi che stanno in capitoli diversi. Quindi
     * l'attributo va anche sulla radice, o nel finale resta acceso da solo
     * sopra il fotogramma pulito. Preso guardando il secondo provino: il
     * cruscotto era sparito e restava una sola bolla nera in mezzo al niente,
     * che era peggio di quando c'erano tutti.
     */
    document.documentElement.dataset.traversata = inTraversata

    /**
     * ─── L'AVVICINAMENTO, ed e' la richiesta piu' esplicita che il sito abbia
     *
     * «voglio il modello 3d che e' possibile far muovere dal sito», «devi far
     * vedere come si muove tutto, come e' fatto». Fino a qui il capitolo si
     * fermava a 7,2 unita': su una nave lunga 16 unita', il meccanismo occupa
     * meno di mezza unita'. Si sapeva che c'era, non lo si vedeva.
     *
     * L'ultima battuta ci porta dentro. E' una fase a se' e non un
     * allungamento della precedente: prima si vede la nave APRIRSI — e serve
     * distanza, o non si capisce che il taglio corre lungo tutto lo scafo —
     * poi si va sul pezzo. Due cose diverse chiedono due inquadrature diverse.
     *
     * La quota della camera resta zero anche qui: e' quello che tiene la linea
     * di galleggiamento a meta' schermo. Il meccanismo sta a y = -0,34, quindi
     * entrando si abbassa da solo nella meta' d'acqua — che e' esattamente la
     * tesi, non un ripiego di inquadratura.
     */
    scena.impostaAvvicinamento(dolce(fra(p, S.avvicina[0], S.avvicina[1])))

    /**
     * L'USCITA DAL SALONE occupa la prima battuta. Con la scena unica non c'e'
     * piu' un capitolo che finisce e uno che comincia: c'e' una camera che si
     * alza dalla poltrona e esce dallo scafo. Con `?doppia=1` questa chiamata
     * non fa niente e la corsa resta quella di prima.
     */
    scena.impostaUscita(dolce(fra(p, S.uscita[0], Math.max(S.uscita[1], 1e-6))))

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
    /* Chi entra in una battuta lo deve sapere UNA VOLTA, non a ogni
       fotogramma: la dimostrazione automatica dell'interruttore parte
       entrando nel meccanismo, e ripartire a ogni scorrimento la
       trasformerebbe in un cartellone. */
    if (palco.dataset.battuta !== b.id) allaBattuta?.(b.id, b)
    palco.dataset.battuta = b.id
    /**
     * --- LE BATTUTE 2-6 NON PARLANO PIU'
     *
     * Il committente: *"dalla sequenza 2 alla 6 va cancellata, non serve a
     * nulla, non legge nessuno quelle cose"*. Ha ragione, e la ragione e' la
     * stessa che il progetto si e' gia' dato scegliendo il bersaglio: i siti
     * che vincono sono cose con cui si gioca, non cose che spiegano. Cinque
     * schermate di didascalia fra l apertura e il meccanismo erano cinque
     * inviti a leggere invece che a toccare.
     *
     * Le battute restano come STATI -- la camera, il taglio, le regole di
     * stile dipendono da `data-battuta` -- ma smettono di parlare. Chi non ha
     * niente da dire non lascia un riquadro vuoto: si spegne.
     *
     * L unica perdita vera e' "Turn it on", che era la sola istruzione del
     * sito. Non si compensa con altro testo: si compensa con l interruttore,
     * che in quella battuta si accende da solo -- e che adesso lo fa in modo
     * piu' netto. Un comando che si fa notare batte una frase che lo descrive.
     */
    const muta = !b.titolo && !b.testo
    didascalia.dataset.muta = muta ? 'si' : 'no'
    num.textContent = muta ? '' : String(indice + 1).padStart(2, '0')
    tit.textContent = b.titolo || ''
    txt.textContent = b.testo || ''
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
