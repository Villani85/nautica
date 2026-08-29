import { MathUtils } from 'three'
/**
 * L'ATTRIBUTO `with { type: 'json' }` NON E' DECORATIVO.
 *
 * Vite lo digerisce anche senza; **Node no**, e da Node 22 in poi rifiuta
 * l'import con «needs an import attribute of type: json». Siccome i collaudi
 * importano questo stesso modulo girando in Node, senza l'attributo il sito
 * compila e i cancelli muoiono — cioe' esattamente il modo peggiore di
 * rompersi, perche' la cosa che avvisa e' la prima a tacere.
 */
import tabella from './riduzioni.json' with { type: 'json' }

/** La tabella precalcolata: vedi `riduzioneVera` piu' sotto per il perche'. */
const TABELLA = tabella.riduzione

/**
 * IL ROLLIO — un sistema del secondo ordine integrato in tempo reale.
 *
 * Non e' un'animazione preparata: e' una equazione differenziale, con le fasi
 * del mare estratte a caso a ogni caricamento. Due visite non danno lo stesso
 * numero.
 *
 *   θ'' + 2ζω·θ' + ω²·θ = M(t) + C(V)·portanza(α)
 *   α = −K·θ'   limitato meccanicamente, e in stallo oltre i 20°
 *
 * E LA COSA CHE CONTA PIU' DI TUTTE: girano DUE corse in parallelo, identiche
 * tranne che una ha `C = 0`. Il numero della riduzione e'
 * `1 − RMS_stabilizzata / RMS_nuda` **a regime**, cioe' misurato, non
 * dichiarato.
 *
 * ATTENZIONE, QUESTA INTESTAZIONE DICEVA IL FALSO. Per giorni ha scritto
 * "rapporto fra i due PICCHI", mentre duecentottanta righe piu' sotto lo stesso
 * file spiegava perche' il picco non converge. Un commento non e' un decoro: e'
 * la cosa che un'altra persona legge per prima, e mentiva.
 *
 * Il picco su finestra finita NON converge — le tre armoniche della forzante
 * hanno periodi incommensurabili e non tornano mai in fase, quindi il massimo
 * dipende da dove capiti dentro il battimento. Misurato: 5,60 punti di
 * escursione fra caricamenti col picco, 0,19 con la RMS. Il ragionamento per
 * esteso sta sopra `_riduzioneCruda`.
 *
 * Il modello precedente aveva `SMORZAMENTO = 0.11` scritto a mano e mostrava
 * "89%" senza averlo mai calcolato.
 */

/** Ampiezza nominale di rollio a carena nuda, in gradi, per stato del mare. */
export const AMPIEZZA_MARE = [0, 3.0, 6.0, 9.0, 12.0, 15.0]

/** Velocita' in nodi: 0 = all'ancora, 12 = andatura di servizio. */
export const V_RIF = 12
export const V_MAX = 20

/**
 * LA PROPULSIONE NON E' UN SECONDO SPETTACOLO.
 *
 * L'atto due comincia quando l'andatura smette di essere un cursore e diventa
 * una conseguenza. Il modello e' volutamente piccolo ma fisico:
 *
 *   - l'albero raggiunge il comando con una costante di tempo, quindi non si
 *     ferma in un fotogramma;
 *   - la spinta va con i giri al quadrato;
 *   - la resistenza va con la velocita' al quadrato;
 *   - a comando pieno le due si equilibrano a V_RIF.
 *
 * Non sono cavalli, tonnellate o kilowatt: senza il CAD propulsivo sarebbero
 * unita' inventate. Il risultato osservabile, invece, e' onesto e sufficiente
 * alla catena causale: tolta propulsione, la nave perde abbrivio; perdendo
 * abbrivio, l'autorita' idrodinamica delle pinne cala da sola tramite
 * `autorita(v)`. `propulsione` non compare mai nell'equazione del rollio.
 */
/**
 * ─── IL GIROSCOPIO CHIUDE IL RAGIONAMENTO invece di aggiungere un pezzo
 *
 * Le pinne producono portanza SOLO in moto e la loro autorita' va col quadrato
 * della velocita': e' la riga da cui discende tutto l'atto due. Un giroscopio
 * no -- la sua coppia viene dalla precessione di una massa che gira, e quella
 * massa gira anche a nave ferma.
 *
 * Non e' «migliore»: e' un ALTRO REGIME. Pinne efficienti in navigazione,
 * giroscopio utile a bassa velocita' o all'ancora. E' il motivo per cui una
 * barca puo' avere tutti e due, e il sito lo fa PROVARE invece di dirlo.
 *
 * IL MODELLO, e cosa non pretende di essere: a valle, sul rollio, un
 * giroscopio si comporta come smorzamento in piu'. Qui e' `-C_GYRO * giri^2 *
 * omega`, col quadrato che viene dal momento angolare che cresce coi giri e
 * dalla coppia che cresce con esso. Non sono newton-metro: senza il CAD di un
 * giroscopio vero sarebbero unita' inventate. Cio' che e' onesto e sufficiente
 * e' il COMPORTAMENTO -- una coppia che non dipende dall'abbrivio.
 *
 * TAU_GYRO e' 20 secondi e NON e' realistico: un rotore vero ci mette
 * mezz'ora. Venti secondi sono il tempo in cui l'attesa si SENTE -- i giri
 * salgono, il rollio scende poco a poco -- senza che chi guarda se ne vada.
 * Scelta di messa in scena, scritta qui perche' nessuno la scambi per una
 * misura.
 */
const C_GYRO = 0.62
const TAU_GYRO = 20.0

const TAU_GIRI = 2.6             // s: inerzia di albero, riduttore e motore
const ACCEL_RIF = 0.30           // kn/s: scala autorale, non una misura di cantiere

export function dinamicaPropulsione ({ velocita, giri }, comando, dt) {
  const passo = Math.max(0, Math.min(dt, 0.1))
  const bersaglio = comando ? 1 : 0
  const nuoviGiri = giri + (bersaglio - giri) * (1 - Math.exp(-passo / TAU_GIRI))
  const rapporto = Math.max(0, velocita / V_RIF)
  const spinta = nuoviGiri * nuoviGiri
  const resistenza = rapporto * rapporto
  const nuovaVelocita = MathUtils.clamp(
    velocita + ACCEL_RIF * (spinta - resistenza) * passo,
    0,
    V_MAX
  )
  return { velocita: nuovaVelocita, giri: nuoviGiri, spinta, resistenza }
}

const W = 2 * Math.PI / 7        // pulsazione: periodo di rollio 7 s per uno scafo da 40 m
const ZETA = 0.045               // carena nuda: smorzamento bassissimo. E' il motivo per cui
                                 // gli stabilizzatori esistono. Guadagno di risonanza 1/(2ζ) = 11,1
const A1 = 0.002851               // forzante, TARATA numericamente (vedi collaudo-rollio.mjs).
                                 // Scelta a occhio dava 162 gradi, cioe' una nave capovolta
/**
 * Guadagno sulla velocita' di rollio. Il controllore e' proporzionale puro:
 * niente integrale, quindi niente anti-windup da progettare.
 *
 * --- E NON SATURA, AL PUNTO DI LAVORO. Misurato nel sito, a regime:
 *
 *     come si apre (mare 4, 12 nodi)   fondo corsa 0,0%   picco pinna  9,1 gradi
 *     mare 5, 12 nodi                  fondo corsa 0,0%   picco pinna 16,0
 *
 * su un fine corsa di 25. Il conto torna: con una riduzione del 90,8% a mare 5
 * il rollio residuo e' circa 1,4 gradi, la velocita' angolare di picco 1,24
 * gradi/s, e la soglia di saturazione e' A_MAX/K = 25/17 = 1,47 gradi/s.
 *
 * La saturazione esiste solo sotto i ~10 nodi, dove pero' l'autorita' della
 * pinna va gia' col QUADRATO della velocita' ed e' comunque piccola: il
 * controllore tenta tutto senza destabilizzare, perche' con zeta = 0,045 il
 * sistema resta dissipativo anche a fondo corsa. E K costante non e' una
 * mancanza di gain scheduling: l'autorita' scala gia' con v², quindi il
 * prodotto scala con v² lo stesso.
 *
 * Questo commento nasce da un feedback esterno che ha attaccato un mio numero
 * -- «la pinna sta a fondo corsa nel 94% dei fotogrammi» -- e aveva ragione.
 * Quel 94% lo stampa `collaudo-manopola`, che misura SUBITO DOPO aver spento e
 * riacceso l'interruttore, cioe' dentro la rampa che gonfia l'ampiezza al
 * livello della carena nuda. Era un transitorio dentro una prova, e l'avevo
 * riportato come il comportamento del sito.
 */
const K = 17.0
const C0 = 0.2422                // autorita' delle pinne alla velocita' di riferimento

const A_STALLO = MathUtils.degToRad(20)   // oltre questa incidenza la portanza CALA
const A_MAX = MathUtils.degToRad(25)      // limite meccanico dell'attuatore
const RESIDUO = 0.45                      // quanta portanza resta a fondo corsa, in stallo

/**
 * Quanto scende l ampiezza con `prefers-reduced-motion`. Un terzo: a mare 5 il
 * rollio nudo passa da 15 a 5 gradi -- si vede benissimo che la nave si muove e
 * che le pinne la raddrizzano, senza il campo visivo che oscilla di quindici.
 * Il numero e' una scelta di progetto e sta scritto in un posto solo.
 */
const RIDOTTO = 1 / 3

const FINESTRA_PICCO = 10        // secondi
const MAX_CAMPIONI = 1200        // tetto rigido: due difese indipendenti, vedi sotto

/**
 * LA PORTANZA DELLA PINNA.
 *
 * Sotto lo stallo vale esattamente l'incidenza — cosi' la taratura di `K` e
 * `C0` resta valida. Oltre, **cala**: non e' un taglio netto, ed e' la
 * differenza che conta.
 *
 * Con un semplice `clamp` il sistema resta lineare, e allora la riduzione esce
 * IDENTICA a ogni stato del mare — cinque numeri uguali, che a schermo leggono
 * come un dato inventato anche essendo veri. Lo stallo e' cio' che rompe la
 * linearita' e fa variare il risultato con le condizioni, come nella realta'.
 *
 * ─── E QUESTA GIUSTIFICAZIONE E' FALSA AL PUNTO DI LAVORO. Misurata.
 *
 * Trovata da una revisione esterna che ha preso alla lettera il segnale del §3.1
 * -- «un parametro che e' scritto e non arriva dove serve» -- e ha azzerato lo
 * stallo per vedere se la misura si muoveva. Non si muove: a 12 nodi, l'andatura
 * di servizio che il sito MOSTRA, togliere del tutto lo stallo cambia la
 * riduzione di 0,00000 su tutti e cinque gli stati del mare.
 *
 *     picco della pinna a 12 nodi, misurato su 300 s
 *       mare 1    3,6 gradi     in stallo 0,00%     (soglia 20)
 *       mare 3   10,9 gradi     in stallo 0,00%
 *       mare 5   17,7 gradi     in stallo 0,00%
 *
 * Al mare piu' grosso che il sito mostra la pinna sta 2,3 gradi SOTTO la soglia:
 * la nonlinearita' e' tarata per stare appena fuori portata. Quindi la riduzione
 * che il visitatore legge e' il numero che darebbe un modello lineare, e i
 * «cinque numeri uguali» che questo commento diceva di voler evitare sono
 * esattamente cio' che il sito mostra -- spread 0,025 punti fra mare 1 e mare 5.
 *
 * ─── MA LO STALLO NON E' CODICE MORTO, ed e' l'atto due a cambiarlo
 *
 * Lo stallo lavora sotto i 10 nodi, e fino a ieri quel regime era irraggiungibile
 * perche' la velocita' era un cursore che nessuno abbassava. Adesso e' una
 * conseguenza: spegnendo la propulsione la nave scende a 2,19 kn in quaranta
 * secondi, e li' la pinna satura davvero.
 *
 *     riduzione a mare 5, lungo la velocita'
 *       12 kn 90,8%   10 kn 38,9%   8 kn 17,2%   6 kn 8,2%   2 kn 0,7%
 *     spread fra gli stati del mare, a 6 nodi:  59,96 punti  (a 12: 0,025)
 *
 * Quindi il modello e' lineare nel punto di PARTENZA e nonlineare nel punto di
 * ARRIVO della scoperta. Il commento sopra resta falso dove il sito si apre, ed
 * e' per questo che sta qui invece di essere cancellato: dice cosa fa lo stallo,
 * e queste righe dicono DOVE.
 */
export function portanza (a) {
  const A = Math.abs(a)
  const s = Math.sign(a)
  if (A <= A_STALLO) return a
  if (A >= A_MAX) return s * A_STALLO * RESIDUO
  const oltre = (A - A_STALLO) / (A_MAX - A_STALLO)
  return s * A_STALLO * (1 - (1 - RESIDUO) * oltre)
}

/**
 * L'AUTORITA' DELLE PINNE DIPENDE DALLA VELOCITA'.
 *
 * Una pinna attiva produce portanza solo in moto — Wartsila: *"require ship
 * forward motion in order to develop lift"* — e la portanza va con `v²`.
 *
 * Da questa riga sola discende che a nave ferma la riduzione vale **zero**,
 * come nella realta', e che a bassa andatura serve piu' incidenza per la stessa
 * correzione, quindi si va in stallo prima. Non c'e' nessuna soglia artificiale
 * a 6 nodi: il quadrato la produce da solo.
 */
export function autorita (v) {
  const r = v / V_RIF
  return C0 * r * r
}

/** Il momento del mare: tre sinusoidi sfasate, fasi estratte a ogni partenza. */
/**
 * GENERATORE CON SEME — mulberry32, quattro righe.
 *
 * Serve perche' la tabella delle riduzioni dev'essere un ARTEFATTO
 * RIPRODUCIBILE: rigenerandola con lo stesso seme devono uscire gli stessi
 * byte, altrimenti il cancello che la confronta non puo' esistere e si torna a
 * misurare millisecondi.
 *
 * Non e' crittografia e non deve esserlo: deve solo dare sempre la stessa
 * sequenza a partire dallo stesso numero.
 */
function estrattore (seme) {
  let a = seme >>> 0
  return function () {
    a = (a + 0x6D2B79F5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * @param {number} [seme] senza seme le fasi sono davvero casuali — e' quello
 *   che vuole il sito vivo, dove ogni visita e' una traversata diversa. Col
 *   seme sono riproducibili, ed e' quello che vuole la tabella.
 */
function creaMare (seme) {
  const dado = seme === undefined ? Math.random : estrattore(seme)
  const fasi = [dado(), dado(), dado()].map(x => x * Math.PI * 2)
  return (t, mare) => AMPIEZZA_MARE[mare] * A1 * (
    1.00 * Math.sin(0.83 * W * t + fasi[0]) +
    0.55 * Math.sin(1.37 * W * t + fasi[1]) +
    0.30 * Math.sin(0.51 * W * t + fasi[2])
  )
}

/**
 * Una corsa: stato, integratore, finestra dei picchi.
 * Se ne creano DUE identiche, e la seconda ha autorita' zero.
 */
function creaCorsa () {
  const c = { theta: 0, omega: 0, alfa: 0, alfaPrec: 0, picco: 0 }
  const picchi = []
  let vissuto = 0

  /**
   * DIFETTO CORRETTO nel modello precedente: la potatura usava il tempo
   * dell'animazione, che con movimento ridotto restava fermo a zero. La
   * condizione non diventava mai vera, l'array cresceva a ogni fotogramma e
   * `reduce` lo scorreva tutto: non una perdita di memoria, un rallentamento
   * che peggiorava col tempo di permanenza.
   *
   * Ora l'orologio della finestra avanza SEMPRE, ed e' scollegato dal tempo
   * della scena. Piu' un tetto rigido: due difese indipendenti, perche' una
   * sola non si accorge di essere rotta.
   */
  function registra (valore, dt) {
    vissuto += dt
    picchi.push({ v: valore, t: vissuto })
    while (picchi.length && vissuto - picchi[0].t > FINESTRA_PICCO) picchi.shift()
    while (picchi.length > MAX_CAMPIONI) picchi.shift()
    let max = 0
    for (let i = 0; i < picchi.length; i++) if (picchi[i].v > max) max = picchi[i].v
    c.picco = max
  }

  /**
   * Un passo di integrazione, EULERO SEMI-IMPLICITO: prima la velocita', poi
   * l'angolo con la velocita' nuova. E' simplettico, e regge venti minuti
   * simulati da 20 a 120 Hz senza divergere — verificato in collaudo-rollio.
   */
  function passo (dt, t, mare, aut, momento, gyro = 0) {
    c.alfaPrec = c.alfa
    c.alfa = aut > 0 ? MathUtils.clamp(-K * c.omega, -A_MAX, A_MAX) : 0
    const correzione = aut * portanza(c.alfa)
    /* Il giroscopio somma con le pinne invece di sostituirle: accesi tutti e
       due la nave riceve tutte e due le coppie, come in mare. Ed e' anche cio'
       che rende leggibile il confronto -- si accendono separatamente. */
    const acc = momento(t, mare) + correzione - gyro * c.omega - 2 * ZETA * W * c.omega - W * W * c.theta
    c.omega += acc * dt
    c.theta += c.omega * dt
    registra(Math.abs(c.theta), dt)
  }

  function azzera () { picchi.length = 0; c.picco = 0; vissuto = 0 }
  return { c, passo, azzera }
}

export function creaSimulazione ({ ridotto = false, seme, velocitaDinamica = false } = {}) {
  /**
   * IL SEME E' OPZIONALE, e in pagina non si passa: le fasi del mare sono
   * casuali, cosi' due visite non danno la stessa onda. Ma un cancello non puo'
   * verificare che il fantasma sia davvero l'altra nave se le due simulazioni
   * incontrano due mari diversi — quindi il seme esiste, ed e' il modo in cui
   *  fa girare la corsa nuda una seconda volta, da sola,
   * e confronta.
   */
  const momento = creaMare(seme)
  const viva = creaCorsa()    // con le pinne
  const nuda = creaCorsa()    // identica, ma autorita' zero: e' il metro

  const S = {
    mare: 3,
    stab: false,
    propulsione: true,
    giriPropulsione: 1,
    spinta: 1,
    resistenza: 1,
    /** Il giroscopio parte SPENTO: e' la scoperta, non il punto di partenza. */
    giroscopio: false,
    giriGiroscopio: 0,
    autoritaGiroscopio: 0,
    velocita: V_RIF,
    autoritaPinna: 0,
    rollio: 0,
    /**
     * IL ROLLIO CHE LA NAVE AVREBBE SENZA PINNE, nello stesso istante e sullo
     * stesso mare. Si calcolava gia' — `nuda` gira a ogni passo perche' e' il
     * metro della riduzione — e finiva nel cestino.
     *
     * Esposto, diventa la cosa che si vede: a sistema spento le due corse sono
     * IDENTICHE, quindi il fantasma sta li' dall'inizio perfettamente
     * sovrapposto e non si nota. Quando si accende, la nave **si divide in due
     * destini**. Nessun evento di interfaccia: solo la fisica che diverge.
     */
    rollioNudo: 0,
    pinna: 0,
    pinnaVel: 0,
    picco: 0,
    /* il picco della corsa NUDA, sulla stessa finestra: vedi la nota in `passo` */
    piccoNudo: 0,
    riduzione: 0,       // MISURATA, non dichiarata
    carico: 0,
    recupero: 0,
    ridotto
  }

  let t = 0

  function passo (dt, tempoScena) {
    if (velocitaDinamica) {
      const p = dinamicaPropulsione(
        { velocita: S.velocita, giri: S.giriPropulsione },
        S.propulsione,
        dt
      )
      S.velocita = p.velocita
      S.giriPropulsione = p.giri
      S.spinta = p.spinta
      S.resistenza = p.resistenza
    }
    const aut = S.stab ? autorita(S.velocita) : 0
    S.autoritaPinna = aut

    /**
     * IL ROTORE SALE E SCENDE CON LA SUA INERZIA, e l'inerzia e' il punto: un
     * giroscopio che si accende di colpo sarebbe un interruttore, non una
     * macchina. Salendo, il rollio cala poco a poco -- ed e' quel «poco a poco»
     * a dire che dentro c'e' una massa che deve prendere velocita'.
     *
     * `autoritaGiroscopio` NON dipende da `S.velocita`, e non deve: e' la
     * differenza che l'atto due esiste per mostrare.
     */
    const volutoGyro = S.giroscopio ? 1 : 0
    S.giriGiroscopio += (volutoGyro - S.giriGiroscopio) * Math.min(1, dt / TAU_GYRO)
    S.autoritaGiroscopio = C_GYRO * S.giriGiroscopio * S.giriGiroscopio

    /**
     * --- IL MOVIMENTO RIDOTTO RIDUCE, NON SPEGNE
     *
     * Qui c era un ramo che congelava tutto: niente oscillazione, la nave
     * ferma al proprio angolo di picco, e il commento diceva "la tesi resta
     * dimostrabile senza che niente si muova da solo".
     *
     * Era una decisione sbagliata e il committente l ha corretta due volte,
     * l ultima cosi: "deve partire su tutti gli schermi anche su chi disattiva
     * le animazioni". Ha ragione, e la ragione non e' solo di gusto:
     *
     *   - il ciclo di disegno spento non ferma solo il rollio, ferma anche il
     *     VIDEO del salone, che vive dentro quel ciclo. Chi ha la preferenza
     *     attiva non vedeva un sito piu' calmo: ne vedeva una fotografia;
     *   - e il difetto vestibolare non e' il movimento, e' l AMPIEZZA del
     *     movimento. Quindici gradi di rollio a tutto schermo sono un problema;
     *     cinque no. Togliere tutto e' la scorciatoia di chi non vuole
     *     progettare la versione ridotta.
     *
     * Quindi si riduce: la forzante scende a un terzo, tutto il resto gira
     * identico -- pinne, riduzione misurata, letture, video. La tesi non e'
     * piu' "dimostrabile lo stesso": e' dimostrata dalla stessa scena, in
     * piccolo.
     */
    riscala(dt)
    t += dt
    const onda = S.ridotto ? (tt, m) => momento(tt, m) * RIDOTTO : momento
    /* La corsa NUDA non riceve il giroscopio, come non riceve le pinne: e' il
       metro, cioe' la stessa nave senza NIENTE. Se lo ricevesse, la riduzione
       misurata smetterebbe di misurare quello che dichiara. */
    viva.passo(dt, t, S.mare, aut, onda, S.autoritaGiroscopio)
    nuda.passo(dt, t, S.mare, 0, onda, 0)

    S.rollio = MathUtils.radToDeg(viva.c.theta)
    S.rollioNudo = MathUtils.radToDeg(nuda.c.theta)
    S.picco = MathUtils.radToDeg(viva.c.picco)
    /**
     * ─── IL PICCO ANCHE DELLA NAVE NUDA, e serve a non contraddirsi
     *
     * In pagina la frase e' «fin 0,0 gradi -- without it, X gradi of roll»,
     * accanto alla lettura «ROLL Y». Erano tutti e due ISTANTANEI, e due
     * grandezze che oscillano campionate nello stesso momento stanno a fasi
     * diverse: si vedeva «ROLL 16,4» accanto a «without it, 2,8», che a chi
     * guarda sembra un errore -- il controfattuale piu' piccolo del fatto.
     *
     * Non era un errore. Verificato misurando le ESCURSIONI su nove secondi
     * invece dei valori istantanei: impianto acceso, viva 1,34 gradi contro
     * 14,60 della nuda; spento, 16,48 contro 16,97, cioe' coincidono. Il
     * modello e' giusto e lo era gia'.
     *
     * Ma la frase «senza, X gradi di rollio» e' un'affermazione di GRANDEZZA,
     * non un'istantanea, e va detta con una grandezza: il picco sulla stessa
     * finestra con cui il sito misura gia' quello della nave viva. Cosi' le due
     * letture diventano confrontabili e smettono di sembrare in contraddizione
     * senza che nessun numero venga addolcito.
     */
    S.piccoNudo = MathUtils.radToDeg(nuda.c.picco)
    S.pinna = viva.c.alfa
    S.pinnaVel = dt > 0 ? (viva.c.alfa - viva.c.alfaPrec) / dt : 0

    /**
     * IL NUMERO SI GUADAGNA — ma non si legge troppo presto.
     *
     * Qui c'era il rapporto fra le due finestre di 10 secondi VIVE, e ogni
     * gesto dell'utente le azzera entrambe. Misurato: due secondi dopo aver
     * acceso il sistema il sito dichiarava **52%** invece di 90. Sottovendeva
     * il prodotto esattamente nell'istante della rivelazione, e poi ballava di
     * tre punti per sempre.
     *
     * Non e' un ripiego su una costante: `riduzioneVera` fa girare le STESSE
     * due simulazioni, con lo stesso modello e lo stesso passo, fino a regime.
     * Cambia solo quando si smette di leggere, non cosa si misura.
     *
     * Le letture ROLL e PEAK restano vive, perche' sono cio' che dimostra che
     * la simulazione sta davvero girando: sono ancorate al fotogramma che si
     * guarda. Il rapporto no — un rapporto ha senso a regime.
     */
    S.riduzione = aut > 0 ? riduzioneVera(S.mare, S.velocita) : 0

    // Energia: indice 0-100, non kW. I moltiplicatori sono autorali e
    // un'unita' fisica mentirebbe. Dichiarato in pagina.
    const accelera = (S.pinnaVel * S.pinna) > 0
    const sforzo = Math.abs(S.pinnaVel) * (0.6 + Math.abs(S.pinna) * 2.4)
    const cT = aut > 0 && accelera ? Math.min(100, sforzo * 26) : 0
    const rT = aut > 0 && !accelera ? Math.min(100, sforzo * 10) : 0
    S.carico += (cT - S.carico) * Math.min(1, dt * 6)
    S.recupero += (rT - S.recupero) * Math.min(1, dt * 6)
  }

  function azzeraPicchi () { viva.azzera(); nuda.azzera(); S.picco = 0; S.riduzione = 0 }

  /**
   * --- CAMBIARE MARE SENZA TELETRASPORTARE LA NAVE
   *
   * Tre ore fa qui si chiamava `scalda()` a ogni clic sulla manopola: la
   * risposta diventava immediata, e la nave saltava. Misurato dopo che una
   * revisione l ha segnalato:
   *
   *     mare 4 -> 5   6,27 gradi in UN fotogramma
   *     mare 2 -> 5   1,94
   *     un fotogramma normale                0,043
   *
   * Centoquarantasei volte il moto di un fotogramma. Ed e' esattamente la
   * violazione che questo sito si e' vietato -- nessun salto temporale --
   * commessa da me mentre curavo il difetto opposto.
   *
   * --- PERCHE' SCALDARE ERA LO STRUMENTO SBAGLIATO
   *
   * `scalda()` integra 150 secondi: il sistema arriva a regime, ma in una FASE
   * qualunque. La posa dopo il clic non ha nessun rapporto con quella prima, e
   * l occhio legge un taglio di montaggio.
   *
   * --- LA CURA E' UNA PROPRIETA' DELL EQUAZIONE, NON UN ESPEDIENTE
   *
   * L equazione del rollio nudo e' LINEARE nella forzante, e la forzante e'
   * proporzionale ad AMPIEZZA_MARE. Quindi il regime nel mare b e' il regime
   * nel mare a **moltiplicato** per il rapporto delle ampiezze: stessa orbita,
   * stessa fase, scala diversa.
   *
   * Basta moltiplicare lo stato -- angolo e velocita' -- per quel rapporto. E
   * per non farlo in un fotogramma solo, lo si spalma su una finestra breve:
   * a ogni passo si applica la radice `dt`-esima, cosi' il prodotto totale e'
   * esatto e il singolo fotogramma non salta. Con k = 2,5 su 0,8 secondi, un
   * fotogramma moltiplica per 1,019: due per cento, invisibile.
   *
   * La pinna non va toccata: il controllore la ricalcola dalla velocita' di
   * rollio, quindi segue da sola.
   *
   * --- L UNICO CASO CHE RESTA LENTO, E VA DETTO
   *
   * Da mare ZERO il rapporto non esiste: zero moltiplicato per qualunque cosa
   * resta zero, e non c e' nessuna orbita da riscalare. Li' l ampiezza deve
   * montare davvero, con la sua costante di 25 secondi. E' onesto: da una calma
   * piatta il mare ci mette del tempo ad arrivare. Non lo nascondo dietro un
   * salto.
   */
  function cambiaMare (n) {
    const prima = AMPIEZZA_MARE[S.mare]
    S.mare = n
    const dopo = AMPIEZZA_MARE[n]
    if (prima <= 0 || dopo <= 0) return
    avvia(MARE, dopo / prima, [viva.c, nuda.c])   // il mare e' cambiato per tutte e due
  }

  /**
   * --- L'INTERRUTTORE NON FACEVA VEDERE NIENTE, E ORA SI SA DI QUANTO
   *
   * `cambiaMare` riscala l'ampiezza perche' altrimenti la transizione naturale
   * dura piu' di un minuto -- e' scritto qui sopra, col numero. **All'
   * interruttore non era mai stata applicata**, e all'interruttore serve di
   * piu': e' il gesto centrale del sito.
   *
   * Misurato spegnendo e campionando il rollio picco-picco:
   *
   *     prima di spegnere    1,70 gradi
   *     2 s dopo             0,16      <- SCENDE
   *     4 s dopo             1,18
   *     6 s dopo             4,32
   *     10 s dopo            8,56
   *     16 s dopo           10,12
   *
   * Chi preme vede la nave CALMARSI, poi niente per qualche secondo, e
   * conclude che il bottone non funziona. La cosa piu' importante che questo
   * sito ha da mostrare era invisibile a chi la chiedeva.
   *
   * Non e' un salto: e' la stessa riscalatura di `cambiaMare`, che moltiplica
   * theta e omega insieme e quindi **conserva la fase** -- l'orbita si allarga,
   * non si sposta. Il rapporto e' quello di regime, cioe' quello che la fisica
   * darebbe da sola aspettando: si accorcia l'attesa, non si cambia il
   * risultato.
   */
  function cambiaStab (v) {
    if (v === S.stab) return
    /**
     * IL BERSAGLIO NON SI CALCOLA: SI LEGGE DALLA NAVE NUDA.
     *
     * Primo tentativo: fattore `1/(1 - riduzione)`. A venti nodi la riduzione
     * vale 0,97, quindi 33 volte -- e la nave usciva a **79 gradi picco-picco**,
     * cioe' rovesciata. Il rapporto fra le RMS a regime non e' il rapporto fra
     * le orbite in questo istante, e usarlo come tale e' un errore di
     * grandezza.
     *
     * Ma la corsa NUDA gira gia' accanto a quella viva -- e' il metro della
     * riduzione, e costa zero. Il bersaglio e' la sua orbita, e l'orbita di un
     * oscillatore si misura: `sqrt(theta^2 + (omega/W)^2)` e' il raggio, ed e'
     * costante lungo il giro mentre theta e omega da soli oscillano. Prendere
     * il raggio invece di theta evita di riscalare a caso a seconda di dove ci
     * si trova nel ciclo.
     */
    const raggio = (r) => Math.hypot(r.theta, r.omega / W)
    const rNuda = raggio(nuda.c)
    const rViva = raggio(viva.c)
    S.stab = v
    if (rViva < 1e-6 || rNuda < 1e-6) return
    // spegnendo si va all'orbita della nave nuda; accendendo si torna a cio'
    // che il sistema lascia, cioe' la stessa orbita ridotta
    /**
     * --- SI RISCALA SOLO SPEGNENDO, E LA RAGIONE E' FISICA
     *
     * Spegnendo, la nave deve ARRIVARE all'ampiezza nuda, e ci mette venticinque
     * secondi di costante di tempo: e' li' che serve accorciare l'attesa.
     *
     * Accendendo no. Con le pinne attive lo smorzamento e' alto e la nave si
     * calma da sola in pochi secondi -- quello e' il lavoro del sistema, ed e'
     * esattamente la cosa che il sito ha da mostrare. Riscalare anche in quel
     * verso la spegneva di colpo: misurato, il cancello della manopola trovava
     * l'albero d'ingresso FERMO subito dopo l'accensione, perche' senza rollio
     * la pinna non ha piu' niente da correggere. Guardare una nave calmarsi e'
     * il punto; vederla gia' calma non lo e'.
     */
    // Riaccendendo la rampa dello spegnimento DECADE: non si applica il suo
    // residuo, si ferma dov'e'. Vedi la nota sull'albero piantato a 0,0000 rad.
    if (v) { annulla(STAB, [viva.c]); return }
    const k = rNuda / rViva
    if (!Number.isFinite(k) || k <= 0) return
    // un tetto: se qualcosa va storto nei rapporti, meglio una transizione
    // lenta che una nave rovesciata
    // lo stabilizzatore non esiste per la nave nuda
    avvia(STAB, Math.min(Math.max(k, 0.05), 20), [viva.c])
  }

  /**
   * Spegnere la propulsione cambia UN solo comando. Non spegne le pinne, non
   * cambia il mare, non riscrive la velocita' e non azzera il rollio. Tutto
   * cio' che si vede dopo deve essere prodotto dai passi successivi dello
   * stesso integratore, altrimenti l'atto due sarebbe un filmato travestito da
   * simulazione.
   */
  function cambiaPropulsione (v) {
    S.propulsione = Boolean(v)
  }


  /**
   * --- IL TETTO AL SALTO E' UN GOVERNATORE, NON UNA DURATA INDOVINATA
   *
   * `cambiaMare` e `cambiaStab` scrivevano tutte e due sullo stesso slot: la
   * seconda ABBANDONAVA la prima a meta', e la nave restava a un'ampiezza che
   * non e' ne' quella di prima ne' quella di dopo. `collaudo-manopola` --
   * cinque rossi su otto, con tre sintomi diversi.
   *
   * Tre tentativi, tutti misurati, e i primi due sbagliati:
   *
   * 1. **Chi arriva chiude la precedente applicandone il residuo in un colpo.**
   *    Sei rossi su sei, salti da 2,75 a 4,35 gradi per fotogramma -- fino a
   *    319 volte il naturale. Applicare un residuo in un colpo E' il
   *    teletrasporto che il sito vieta: avevo scritto il difetto come cura.
   *
   * 2. **Due slot indipendenti.** Salti giu' a 0,21-0,41 gradi, ancora rosso:
   *    due rampe sulla stessa corsa **si moltiplicano**, e la variazione per
   *    fotogramma raddoppia.
   *
   * Il conto che nessuno dei due aveva fatto: da mare 5 (circa 6 gradi) a mare
   * 2 in 1,6 s a 60 fps sono 96 fotogrammi, fattore (1/6)^(1/96) = 0,9815, cioe'
   * 1,85% -- su 6 gradi fa **0,11 gradi per fotogramma**, contro una soglia di
   * 0,10. **La rampa del mare era gia' fuori da sola**, prima ancora che
   * l'interruttore ne aggiungesse una seconda. Una durata scelta a occhio non
   * puo' garantire un tetto che dipende dall'ampiezza: quindi non si sceglie
   * la durata, **si impone il tetto** e la durata viene di conseguenza.
   *
   * `riscala` somma i logaritmi di tutte le rampe attive su una corsa, taglia
   * la somma a quello che tiene il passo sotto SALTO_CIECO, e **allunga le
   * rampe della stessa frazione** che ha tagliato. Nessuna combinazione di
   * cause puo' produrre un salto: non perche' le si sia previste, ma perche' il
   * tetto sta a valle di tutte.
   *
   * --- E IL VERO GUASTO ERA UN ALTRO, PIU' IN BASSO
   *
   * Sistemati i salti, restava un rosso su tre: «l'albero d'ingresso non si
   * muove (0,0000 rad p-p)». Il numero che l'ha spiegato non era lo zero ma il
   * suo vicino -- **15,249 rad a mare 2**, che non e' un guasto: l'albero fa
   * quasi sei giri per periodo di rollio, quindi su 90 fotogrammi quella e'
   * la rotazione giusta. Lo zero e' invece un meccanismo **fermo**.
   *
   * Causa: spegnendo, la rampa gonfia il rollio fino a venti volte per
   * riportarlo a carena nuda. Se si RIACCENDE mentre sale, il regolatore chiede
   * una pinna oltre il fine corsa, la pinna ci sbatte e l'albero si pianta a un
   * angolo costante. Da qui l'intermittenza: dipende da dove cade la misura
   * dentro la rampa.
   *
   * Cura: riaccendere **annulla** la rampa dello spegnimento. Non ne applica il
   * residuo -- si ferma e basta, che e' quello che fa un transitorio
   * interrotto. La rampa del mare, che ha un'altra causa, resta dov'e'.
   */
  const MARE = 'mare', STAB = 'stab'

  /** Il salto che nessuno vede, in gradi per fotogramma. Il cancello taglia a
   *  0,10: si sta a meta' strada, perche' il fondo naturale ci si somma. */
  const SALTO_CIECO = 0.05

  const rampe = new Map()          // corsa -> Map(causa -> { k, t })

  const ampiezza = (r) => Math.hypot(r.theta, r.omega / W)

  function avvia (causa, k, chi) {
    if (!Number.isFinite(k) || k <= 0) return
    for (const r of chi) {
      let m = rampe.get(r)
      if (!m) rampe.set(r, m = new Map())
      m.set(causa, { k, t: 1.6 })
    }
  }

  /** Ferma una rampa senza applicarne il residuo: l'ampiezza resta dov'e'
   *  arrivata, che e' esattamente cio' che e' un transitorio interrotto. */
  function annulla (causa, chi) {
    for (const r of chi) rampe.get(r)?.delete(causa)
  }

  /** Applica un pezzo del riscalamento, proporzionale al passo. */
  /**
   * --- CHI SI RISCALA NON E' SEMPRE TUTTI E DUE
   *
   * Questa funzione nasce per `cambiaMare`, e li' e' giusto che scali
   * entrambe le corse: il mare e' cambiato per tutte e due le navi.
   *
   * Per l'interruttore no. Lo stabilizzatore non tocca la nave NUDA -- e'
   * proprio la sua definizione: e' la corsa che non ce l'ha. Scalando anche
   * lei, il bersaglio si allontanava mentre lo inseguivo, ed e' un anello che
   * si chiude su se stesso: misurato, il rollio nudo e' passato da 9 gradi a
   * **520** in pochi secondi, e la nave viva a 320 picco-picco.
   *
   * Adesso chi si riscala si dichiara.
   */
  function riscala (dt) {
    for (const [r, m] of rampe) {
      if (!m.size) { rampe.delete(r); continue }

      // quanto vorrebbero fare, tutte insieme, in logaritmo
      let L = 0
      for (const p of m.values()) L += Math.log(p.k) * (Math.min(dt, p.t) / p.t)
      if (!Number.isFinite(L)) { m.clear(); continue }

      // il tetto: |ampiezza · (e^L − 1)| <= SALTO_CIECO
      const a = Math.max(ampiezza(r), 1e-6)
      const Lmax = Math.log1p(SALTO_CIECO / a)
      const s = Math.abs(L) > Lmax ? Lmax / Math.abs(L) : 1

      const f = Math.exp(L * s)
      r.theta *= f; r.omega *= f

      // si consuma solo la frazione applicata, e le rampe si allungano
      for (const [causa, p] of m) {
        const speso = Math.log(p.k) * (Math.min(dt, p.t) / p.t) * s
        p.k /= Math.exp(speso)
        p.t -= dt * s
        if (p.t <= 1e-6) m.delete(causa)
      }
    }
  }

  /**
   * --- IL MARE NON COMINCIA QUANDO APRI LA PAGINA
   *
   * Difetto trovato dal committente con tre parole -- "l immagine non si
   * muove" -- e poi misurato: a stabilizzatore spento e mare 5, dopo sei
   * secondi dal caricamento il rollio era 2,3 gradi su 15 nominali, e saliva
   * piano. Chi apriva il sito vedeva una nave quasi immobile.
   *
   * Non era un guasto: era la CONDIZIONE INIZIALE. L oscillatore parte da
   * theta = 0, omega = 0, e con smorzamento 0,045 la costante di tempo con cui
   * l ampiezza monta e' 1/(ZETA*W) = 25 secondi. Per arrivare al 95% del
   * regime servono tre costanti, cioe' **piu' di un minuto** -- un tempo che
   * nessun visitatore concede.
   *
   * La cura non e' accelerare la salita, che sarebbe falsificare lo
   * smorzamento -- cioe' proprio il numero su cui poggia tutta la tesi del
   * sito. E' correggere l ipotesi implicita: **il mare esisteva anche prima
   * che tu arrivassi.** Una barca in mare sta gia' rollando; partire da ferma
   * e' l artefatto, non il regime.
   *
   * Quindi si integra in avanti prima del primo fotogramma. E' la stessa cosa
   * che il banco di misura fa gia' da sempre con TRANSITORIO: butta i primi
   * 45 secondi perche' l inviluppo deve montare. Qui non si buttano -- si
   * vivono a porte chiuse, e il sito si apre a traversata avviata.
   *
   * Costa qualche millesimo: 150 secondi simulati a 50 Hz sono 7500 passi di
   * un integratore che fa quattro moltiplicazioni.
   *
   * @param {number} secondi  quanto mare e' gia' passato. Il valore di
   *   riferimento e' sei costanti di tempo: oltre, non cambia piu' niente.
   */
  function scalda (secondi = 150) {
    const dt = 1 / 50
    for (let k = 0; k < Math.round(secondi / dt); k++) passo(dt, t + dt)
  }

  return {
    S, passo, azzeraPicchi, scalda, cambiaMare, cambiaStab,
    cambiaPropulsione
  }
}

/**
 * LA RIDUZIONE A MOVIMENTO RIDOTTO, senza una seconda verita'.
 *
 * La prima stesura usava la formula chiusa del sistema linearizzato,
 * `1 - zeta/zeta_eq`. Il collaudo l'ha bocciata: dava 98,1% contro 89,1%
 * misurati, nove punti di scarto.
 *
 * Il motivo e' istruttivo. Quella formula e' il rapporto fra i picchi **in
 * risonanza**, ma la forzante del mare sta a 0,83ω, 1,37ω e 0,51ω, cioe' FUORI
 * risonanza: li' aggiungere smorzamento aiuta meno di quanto la formula
 * prometta. Non era una approssimazione grossolana: era la formula sbagliata.
 *
 * Quindi non si stima: **si integra davvero**, con lo stesso passo e lo stesso
 * modello, per una manciata di secondi simulati. Costa una frazione di
 * millisecondo e toglie di mezzo la seconda implementazione — che e' la stessa
 * regola per cui superficie e tappo di sezione passano da una funzione sola.
 *
 * Il risultato si mette in cache: cambia solo quando cambiano mare o velocita'.
 *
 * ─── DIFETTO CORRETTO, e la prima stesura di QUESTA funzione ne era complice.
 *
 * Leggeva `c.picco`, cioe' la finestra scorrevole di 10 secondi, all'istante
 * 90. Ma quella finestra non converge: la forzante e' somma di tre armoniche
 * di periodi diversi, e il massimo su dieci secondi continua a respirare per
 * sempre. Misurato: a 20/40/80/120 secondi il rapporto dava 92/89/89/92 per
 * mare 3, 93/87/90/91 per mare 4. **Un numero riproducibile non e' per forza
 * un numero giusto** — era deterministico, e prendeva un punto a caso di
 * un'oscillazione.
 *
 * Adesso si butta via il transitorio e si prende il massimo VERO su una
 * finestra lunga. Con smorzamento 0,045 l'inviluppo della corsa nuda ha
 * costante di tempo 1/(zeta*omega) = 24,8 s: sessanta secondi di scarto sono
 * due costanti e mezza, poi centoventi di misura.
 */
const TRANSITORIO = 45          // secondi buttati: l'inviluppo deve montare
const MISURA = 90               // secondi su cui si misura a regime
const PASSO = 1 / 25            // il modello regge da 20 a 120 Hz (collaudo)

/**
 * ─── E UNA REALIZZAZIONE SOLA DEL MARE NON BASTA.
 *
 * Con la RMS il numero smette di dipendere dalle fasi quasi ovunque — sotto
 * 0,4 punti — ma non in stallo: a mare 3 e 8 nodi restavano 5,6 punti di
 * escursione fra un caricamento e l'altro. Li' non e' rumore dello stimatore,
 * e' fisica: il sistema e' fortemente non lineare, e quanto le pinne vengano
 * spinte in stallo dipende davvero da come cadono le fasi.
 *
 * E se e' fisica, la risposta non e' alzare la soglia: e' MEDIARE PIU' MARI,
 * che e' cio' che si fa per quotare una riduzione invece di raccontare una
 * traversata.
 *
 * La media adesso la fa il GENERATORE (`strumenti/genera-riduzioni.mjs`), con
 * otto realizzazioni invece di cinque, perche' li' il costo non si paga a
 * schermo. Qui resta solo lo stimatore singolo, che serve ai collaudi.
 */
/**
 * ─── E IL PICCO NON ANDAVA BENE NEMMENO A REGIME.
 *
 * Buttato il transitorio, il rapporto fra i due picchi restava diverso a ogni
 * caricamento della pagina: su dodici estrazioni di fase, 5,6 punti di
 * escursione a mare 3 e 8 nodi. Non e' un difetto da tarare — e' strutturale.
 * La forzante e' somma di tre armoniche a 0,51w, 0,83w e 1,37w: periodi
 * incommensurabili, che non tornano MAI in fase. Il massimo su una finestra
 * finita dipende da dove capiti dentro il battimento, e non converge per
 * nessuna durata.
 *
 * La RMS converge. Sulle stesse dodici estrazioni: da 5,60 punti a **0,19**.
 * E non e' un ripiego statistico — e' la grandezza con cui il settore navale
 * quota davvero la riduzione di rollio. Il picco resta a schermo come lettura
 * viva (PEAK, 10 S), dove il suo essere istantaneo e' il pregio.
 *
 * Costo: 5,6 ms a combinazione, entro un fotogramma, con 0,61 punti di scarto
 * dal riferimento caro (passo 1/120, 90+180 s). Misurato su 15 combinazioni di
 * mare e velocita', 8 estrazioni ciascuna.
 */

/**
 * Senza cache e con la griglia scoperchiata: e' cosi' che il collaudo puo'
 * chiedere DUE cose che la versione in cache nasconderebbe — che il numero non
 * dipenda dall'estrazione delle fasi, e che non dipenda dal passo scelto.
 */
export function _riduzioneCruda (mare, velocita, opz = {}) {
  const dt = opz.dt ?? PASSO
  const trans = opz.transitorio ?? TRANSITORIO
  const mis = opz.misura ?? MISURA
  const rms = opz.rms ?? true

  /**
   * DIFETTO PRESO DAL SUO STESSO CANCELLO, ed e' della famiglia peggiore.
   *
   * Il collaudo ricavava il passo dai metadati della tabella. Con un metadato
   * di formato diverso `dt` diventava NaN, `passi` diventava NaN, il ciclo non
   * girava nemmeno una volta e questa funzione restituiva **zero, in
   * silenzio**: nessun errore, un numero plausibile, e un cancello che accusava
   * il file invece del proprio calcolo.
   *
   * Uno strumento che non sa di essere rotto e' peggio del difetto che cerca.
   */
  if (!Number.isFinite(dt) || dt <= 0 || !Number.isFinite(trans) || !Number.isFinite(mis)) {
    throw new Error(`_riduzioneCruda: parametri non validi (dt=${dt}, transitorio=${trans}, misura=${mis})`)
  }

  const momento = creaMare(opz.seme)
  const viva = creaCorsa(); const nuda = creaCorsa()
  const aut = autorita(velocita)
  let piccoViva = 0, piccoNuda = 0
  let quadViva = 0, quadNuda = 0, n = 0
  const passi = Math.round((trans + mis) / dt)
  for (let i = 0; i < passi; i++) {
    const t = i * dt
    viva.passo(dt, t, mare, aut, momento)
    nuda.passo(dt, t, mare, 0, momento)
    if (t < trans) continue
    const a = Math.abs(viva.c.theta); if (a > piccoViva) piccoViva = a
    const b = Math.abs(nuda.c.theta); if (b > piccoNuda) piccoNuda = b
    quadViva += a * a; quadNuda += b * b; n++
  }
  if (rms) {
    const rv = Math.sqrt(quadViva / n), rn = Math.sqrt(quadNuda / n)
    return rn > 1e-6 ? MathUtils.clamp(1 - rv / rn, 0, 1) : 0
  }
  return piccoNuda > 1e-6
    ? MathUtils.clamp(1 - piccoViva / piccoNuda, 0, 1) : 0
}

/**
 * LA RIDUZIONE SI LEGGE, NON SI CALCOLA. E il calcolo non e' sparito: si e'
 * spostato dove non fa male.
 *
 * Prima si integrava a runtime, in cache per (mare, velocita'). Sono 6 x 21 =
 * 126 combinazioni, e ognuna costava una integrazione la prima volta che
 * l'utente ci arrivava: **uno scatto di 20-50 ms ogni nodo che trascinava**.
 * Venti scatti per attraversare il cursore dell'andatura.
 *
 * E il cancello che doveva impedirlo misurava millisecondi, quindi misurava il
 * carico della macchina: lo stesso codice dava 11,4 ms a riposo e 52 sotto
 * carico. Un tetto in millisecondi non e' un cancello, e' un bollettino meteo.
 *
 * Adesso `strumenti/genera-riduzioni.mjs` fa lo stesso calcolo una volta sola,
 * offline, con lo stimatore CARO — passo 1/120 contro 1/25, finestre doppie,
 * otto realizzazioni del mare invece di cinque — e scrive `riduzioni.json`.
 * Il numero non e' meno misurato: e' misurato meglio.
 *
 * E ha guadagnato una cosa che non avevo previsto: **e' ispezionabile.** Prima
 * era un numero che il visitatore doveva credere; adesso e' un file nel
 * repository che chiunque puo' rigenerare con un comando e confrontare. Il sito
 * dice "measured, not declared" — questa e' la versione forte di quella frase.
 */
export function riduzioneVera (mare, velocita) {
  const riga = TABELLA[mare]
  const v = Math.round(velocita)
  /**
   * Nessun ripiego silenzioso. La tabella copre tutti i valori che i comandi
   * possono produrre (mare 0-5 dalla scala, andatura 0-20 intera dal cursore);
   * se manca qualcosa e' cambiato un comando senza rigenerarla, e un calcolo di
   * riserva nasconderebbe proprio il difetto che si vuole vedere.
   */
  if (!riga || riga[v] === undefined) {
    throw new Error(`riduzioni.json non copre mare ${mare} a ${velocita} nodi: rigenera con "node strumenti/genera-riduzioni.mjs"`)
  }
  return riga[v]
}

export const _costanti = { W, ZETA, A1, K, C0, A_STALLO, A_MAX, RESIDUO }
