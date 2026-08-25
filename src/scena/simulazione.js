import { MathUtils } from 'three'

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
 * tranne che una ha `C = 0`. Il numero della riduzione a schermo e'
 * `1 − picco_stabilizzata / picco_nuda`, cioe' **misurato**, non dichiarato.
 *
 * Il modello precedente aveva `SMORZAMENTO = 0.11` scritto a mano e mostrava
 * "89%" senza averlo mai calcolato. Costa quindici righe eseguite due volte, e
 * rende il dato onesto per costruzione invece che per buona volonta'.
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
function creaMare () {
  const fasi = [Math.random(), Math.random(), Math.random()].map(x => x * Math.PI * 2)
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

export function creaSimulazione ({ ridotto = false } = {}) {
  const momento = creaMare()
  const viva = creaCorsa()    // con le pinne
  const nuda = creaCorsa()    // identica, ma autorita' zero: e' il metro

  const S = {
    mare: 3,
    stab: false,
    velocita: V_RIF,
    rollio: 0,
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
      S.picco = Math.abs(S.rollio)
      S.riduzione = rid
      S.pinna = 0; S.carico = 0; S.recupero = 0
      return
    }

    t += dt
    viva.passo(dt, t, S.mare, aut, momento)
    nuda.passo(dt, t, S.mare, 0, momento)

    S.rollio = MathUtils.radToDeg(viva.c.theta)
    S.picco = MathUtils.radToDeg(viva.c.picco)
    S.pinna = viva.c.alfa
    S.pinnaVel = dt > 0 ? (viva.c.alfa - viva.c.alfaPrec) / dt : 0

    // IL NUMERO SI GUADAGNA: rapporto fra i due picchi, non una costante.
    S.riduzione = nuda.c.picco > 1e-6
      ? MathUtils.clamp(1 - viva.c.picco / nuda.c.picco, 0, 1)
      : 0

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

  return { S, passo, azzeraPicchi }
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
 */
const cacheRid = new Map()
export function riduzioneVera (mare, velocita) {
  const chiave = `${mare}|${velocita.toFixed(2)}`
  if (cacheRid.has(chiave)) return cacheRid.get(chiave)
  const momento = creaMare()
  const viva = creaCorsa(); const nuda = creaCorsa()
  const aut = autorita(velocita)
  const dt = 1 / 60
  for (let i = 0; i < 60 * 90; i++) {
    const t = i * dt
    viva.passo(dt, t, mare, aut, momento)
    nuda.passo(dt, t, mare, 0, momento)
  }
  const r = nuda.c.picco > 1e-6
    ? MathUtils.clamp(1 - viva.c.picco / nuda.c.picco, 0, 1) : 0
  cacheRid.set(chiave, r)
  return r
}

export const _costanti = { W, ZETA, A1, K, C0, A_STALLO, A_MAX, RESIDUO }
