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

const W = 2 * Math.PI / 7        // pulsazione: periodo di rollio 7 s per uno scafo da 40 m
const ZETA = 0.045               // carena nuda: smorzamento bassissimo. E' il motivo per cui
                                 // gli stabilizzatori esistono. Guadagno di risonanza 1/(2ζ) = 11,1
const A1 = 0.002851               // forzante, TARATA numericamente (vedi collaudo-rollio.mjs).
                                 // Scelta a occhio dava 162 gradi, cioe' una nave capovolta
const K = 17.0                   // guadagno sulla velocita' di rollio
const C0 = 0.2422                // autorita' delle pinne alla velocita' di riferimento

const A_STALLO = MathUtils.degToRad(20)   // oltre questa incidenza la portanza CALA
const A_MAX = MathUtils.degToRad(25)      // limite meccanico dell'attuatore
const RESIDUO = 0.45                      // quanta portanza resta a fondo corsa, in stallo

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
  function passo (dt, t, mare, aut, momento) {
    c.alfaPrec = c.alfa
    c.alfa = aut > 0 ? MathUtils.clamp(-K * c.omega, -A_MAX, A_MAX) : 0
    const correzione = aut * portanza(c.alfa)
    const acc = momento(t, mare) + correzione - 2 * ZETA * W * c.omega - W * W * c.theta
    c.omega += acc * dt
    c.theta += c.omega * dt
    registra(Math.abs(c.theta), dt)
  }

  function azzera () { picchi.length = 0; c.picco = 0; vissuto = 0 }
  return { c, passo, azzera }
}

export function creaSimulazione ({ ridotto = false, seme } = {}) {
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
    velocita: V_RIF,
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
    riduzione: 0,       // MISURATA, non dichiarata
    carico: 0,
    recupero: 0,
    ridotto
  }

  let t = 0

  function passo (dt, tempoScena) {
    const aut = S.stab ? autorita(S.velocita) : 0

    if (S.ridotto) {
      /**
       * Movimento ridotto: niente oscillazione autonoma, ma i due stati
       * restano confrontabili. Si mostra il PICCO — la nave inclinata al suo
       * angolo massimo, ferma — a sistema spento e acceso. La tesi resta
       * dimostrabile senza che niente si muova da solo.
       */
      const nudo = AMPIEZZA_MARE[S.mare]
      const rid = aut > 0 ? riduzioneVera(S.mare, S.velocita) : 0
      S.rollio = nudo * (1 - rid)
      S.rollioNudo = nudo
      S.picco = Math.abs(S.rollio)
      S.riduzione = rid
      S.pinna = 0; S.carico = 0; S.recupero = 0
      return
    }

    t += dt
    viva.passo(dt, t, S.mare, aut, momento)
    nuda.passo(dt, t, S.mare, 0, momento)

    S.rollio = MathUtils.radToDeg(viva.c.theta)
    S.rollioNudo = MathUtils.radToDeg(nuda.c.theta)
    S.picco = MathUtils.radToDeg(viva.c.picco)
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
    if (S.ridotto) return
    const dt = 1 / 50
    for (let k = 0; k < Math.round(secondi / dt); k++) passo(dt, t + dt)
  }

  return { S, passo, azzeraPicchi, scalda }
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
