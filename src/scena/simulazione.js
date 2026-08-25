import { MathUtils } from 'three'

/** Ampiezza nominale di rollio per stato del mare, in gradi. */
export const AMPIEZZA_MARE = [0, 2.4, 5.1, 8.3, 12.0, 16.2]

/** Quanto resta del rollio a sistema acceso. Autorale, dichiarato tale. */
export const SMORZAMENTO = 0.11

const FINESTRA_PICCO = 10        // secondi
const MAX_CAMPIONI = 1200        // tetto rigido: vedi nota sotto

export function creaSimulazione ({ ridotto = false } = {}) {
  const S = {
    mare: 3,
    stab: false,
    ampiezza: 0,
    rollio: 0,
    rollioPrec: 0,
    pinna: 0,
    pinnaVel: 0,
    pinnaVelPrec: 0,
    carico: 0,
    recupero: 0,
    picco: 0,
    ridotto
  }

  /**
   * Finestra mobile dei picchi.
   *
   * DIFETTO CORRETTO — nel prototipo la pulizia era `t - picchi[0].t > 10`,
   * dove `t` con movimento ridotto restava fermo a zero: la condizione non
   * diventava mai vera, l'array cresceva a ogni fotogramma e `reduce` lo
   * scorreva tutto. Non era solo memoria: era un rallentamento che peggiorava
   * col tempo di permanenza, e colpiva proprio chi aveva chiesto meno movimento.
   *
   * Ora la potatura usa un orologio che avanza SEMPRE (`vissuto`), scollegato
   * dal tempo dell'animazione, e in piu' c'e' un tetto rigido sul numero di
   * campioni. Due difese indipendenti, perche' una sola non si accorge di essere
   * rotta.
   */
  const picchi = []
  let vissuto = 0

  function registraPicco (valore, dt) {
    vissuto += dt
    picchi.push({ v: valore, t: vissuto })
    while (picchi.length && vissuto - picchi[0].t > FINESTRA_PICCO) picchi.shift()
    while (picchi.length > MAX_CAMPIONI) picchi.shift()
    let max = 0
    for (let i = 0; i < picchi.length; i++) if (picchi[i].v > max) max = picchi[i].v
    S.picco = max
  }

  function azzeraPicchi () {
    picchi.length = 0
    S.picco = 0
  }

  /**
   * Un passo di simulazione.
   *
   * Con movimento ridotto NON congeliamo la scena: togliamo l'oscillazione
   * autonoma e mostriamo gli stessi due stati fermi — la nave inclinata al
   * suo angolo di picco, e lo stesso angolo a sistema acceso. La tesi del sito
   * resta dimostrabile senza che niente si muova da solo.
   */
  function passo (dt, t) {
    const nominale = AMPIEZZA_MARE[S.mare]
    const bersaglio = nominale * (S.stab ? SMORZAMENTO : 1)
    S.ampiezza += (bersaglio - S.ampiezza) * Math.min(1, dt * 1.15)

    S.rollioPrec = S.rollio

    if (S.ridotto) {
      // stato fermo: l'angolo di picco, col segno costante
      S.rollio = S.ampiezza
      S.picco = Math.abs(S.ampiezza)
      S.pinna = 0
      S.pinnaVel = 0
      S.carico = 0
      S.recupero = 0
      return
    }

    const w = 0.62
    S.rollio = S.ampiezza * (
      0.74 * Math.sin(t * w * 2 * Math.PI * 0.34) +
      0.26 * Math.sin(t * w * 2 * Math.PI * 0.58 + 1.1)
    )
    const velRollio = dt > 0 ? (S.rollio - S.rollioPrec) / dt : 0

    // Le pinne contrastano la VELOCITA' di rollio, non l'angolo: e' la
    // differenza fra un sistema che stabilizza e uno che raddrizza.
    const bersaglioPinna = S.stab
      ? MathUtils.clamp(-velRollio * 0.055, -0.52, 0.52)
      : 0
    S.pinnaVelPrec = S.pinnaVel
    const pinnaPrec = S.pinna
    S.pinna += (bersaglioPinna - S.pinna) * Math.min(1, dt * 7.5)
    S.pinnaVel = dt > 0 ? (S.pinna - pinnaPrec) / dt : 0

    // Modello energetico: indice 0-100, non kW. I moltiplicatori sono
    // autorali e una unita' fisica mentirebbe. Dichiarato in pagina.
    const accPinna = dt > 0 ? (S.pinnaVel - S.pinnaVelPrec) / dt : 0
    const accelera = (accPinna * S.pinnaVel) > 0
    const sforzo = Math.abs(S.pinnaVel) * (0.6 + Math.abs(S.pinna) * 2.4)
    const cT = S.stab && accelera ? Math.min(100, sforzo * 48) : 0
    const rT = S.stab && !accelera ? Math.min(100, sforzo * 18) : 0
    S.carico += (cT - S.carico) * Math.min(1, dt * 6)
    S.recupero += (rT - S.recupero) * Math.min(1, dt * 6)

    registraPicco(Math.abs(S.rollio), dt)
  }

  return { S, passo, azzeraPicchi }
}
