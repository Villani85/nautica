import { creaSimulazione } from '../src/scena/simulazione.js'

/**
 * COLLAUDO DEL FANTASMA — la nave che si divide in due destini.
 *
 *     node strumenti/collaudo-fantasma.mjs
 *
 * ATTENZIONE A COSA PROTEGGE, e la prima stesura lo diceva male.
 *
 * Il fantasma era una seconda nave disegnata in scena all'angolo che avrebbe
 * senza stabilizzatore. **Non c'e' piu'**: e' stata tolta perche' non emoziona
 * (commit ab605f1), e questo cancello ha continuato a passare verde su un
 * disegno che nessuno fa piu'. Un revisore l'ha visto, e aveva ragione: lasciare
 * verde un cancello che non guarda piu' niente insegna che verde non significa
 * niente.
 *
 * Quello che protegge OGGI e' il NUMERO, non il disegno: `S.rollioNudo`, il
 * rollio che la nave avrebbe senza pinne nello stesso istante e sullo stesso
 * mare. Si calcolava gia' — la corsa nuda gira comunque, e' il metro della
 * riduzione — e serve al finale dell'atto due, dove spegnere lo stabilizzatore
 * fa inclinare il salone sopra di te.
 *
 * E puo' fallire, che e' la condizione perche' sia un cancello: fallisce se
 * qualcuno scrive `rollioNudo` come una scalatura del rollio vivo invece che
 * come la sua fisica. E' proprio la bugia che la prova 2 va a cercare.
 *
 * ─── COSA VERIFICA, e perche' la prima domanda non e' quella ovvia
 *
 * La domanda ovvia sarebbe «il fantasma si vede». Non serve: se non si vedesse
 * lo direbbe chiunque guardi lo schermo. Le domande che uno schermo NON risponde
 * sono altre tre, e sono quelle che rendono il fantasma un argomento invece che
 * un effetto.
 *
 * **1 · A sistema spento devono coincidere ESATTAMENTE.** Non «quasi»: a zero.
 * Se li' si vedessero due navi appena sfalsate, la divisione perderebbe tutto
 * il suo significato — direbbe che le due corse sono due modelli diversi, non
 * la stessa nave con e senza pinne. E' anche il caso in cui un difetto
 * passerebbe inosservato piu' a lungo, perche' due gradi di scarto su uno
 * spigolo sottile si leggono come un'ombra.
 *
 * **2 · Il fantasma dev'essere la corsa nuda VERA.** Si fa girare una seconda
 * simulazione, da sola, a stabilizzatore spento, con lo stesso seme del mare —
 * e la sua traiettoria deve coincidere con `rollioNudo` della prima. Se
 * qualcuno un domani scrivesse il fantasma come «il rollio vivo moltiplicato
 * per un fattore», questo cancello lo prenderebbe: sarebbe una conseguenza
 * cablata a mano, che in questo sito e' la bugia peggiore possibile.
 *
 * **3 · Acceso, devono divergere davvero.** Un fantasma che resta incollato
 * alla nave non e' un fantasma: e' un artefatto di disegno, e andrebbe tolto.
 */

const MARE = 4
/**
 * SESSANTA SECONDI, e la prima stesura ne faceva venti.
 *
 * Con 1200 passi a 1/60 il conto e' 20 s, ma la divergenza si misura solo dopo
 * il transitorio di 30 — quindi la finestra non si apriva mai e il cancello
 * stampava una divergenza di **zero gradi** su una simulazione che diverge di
 * dieci. Non era il fantasma a non funzionare: era il cancello a non guardare.
 * Un massimo calcolato su un insieme vuoto vale zero e non lo dice.
 */
const PASSI = 3600
const DT = 1 / 60
const SEME = 20260826

const gradi = (n) => `${n.toFixed(4)}°`

let rotto = false
const esito = (ok, testo) => {
  if (!ok) rotto = true
  console.log(`  ${ok ? 'OK    ' : 'ROTTO '} ${testo}`)
}

/* ── 1 · a sistema spento, coincidenza esatta ────────────────────────────── */

console.log('\nA SISTEMA SPENTO LE DUE NAVI DEVONO ESSERE LA STESSA NAVE')
{
  const sim = creaSimulazione({ seme: SEME })
  sim.S.mare = MARE
  sim.S.stab = false
  let peggio = 0
  for (let i = 0; i < PASSI; i++) {
    sim.passo(DT, i * DT)
    peggio = Math.max(peggio, Math.abs(sim.S.rollio - sim.S.rollioNudo))
  }
  console.log(`         scarto massimo su ${PASSI} passi: ${gradi(peggio)}`)
  esito(peggio === 0, `le due corse coincidono esattamente (richiesto: zero, non "quasi")`)
}

/* ── 2 · il fantasma e' la corsa nuda vera, non una scalatura di quella viva ─ */

console.log('\nE IL FANTASMA DEV ESSERE LA CORSA NUDA VERA, NON UNA SCALATURA')
{
  const acceso = creaSimulazione({ seme: SEME })
  acceso.S.mare = MARE; acceso.S.stab = true

  const solo = creaSimulazione({ seme: SEME })
  solo.S.mare = MARE; solo.S.stab = false

  let peggio = 0, dove = 0
  for (let i = 0; i < PASSI; i++) {
    acceso.passo(DT, i * DT)
    solo.passo(DT, i * DT)
    const d = Math.abs(acceso.S.rollioNudo - solo.S.rollio)
    if (d > peggio) { peggio = d; dove = i * DT }
  }
  console.log(`         confronto con una simulazione spenta a se stante, stesso seme del mare`)
  console.log(`         scarto massimo: ${gradi(peggio)} al secondo ${dove.toFixed(1)}`)
  esito(peggio < 1e-9, 'il fantasma segue la fisica della nave nuda, non un fattore applicato a quella viva')
}

/* ── 3 · acceso, la divisione dev'essere visibile ─────────────────────────── */

console.log('\nE ACCESO LE DUE NAVI DEVONO DIVIDERSI DAVVERO')
{
  const sim = creaSimulazione({ seme: SEME })
  sim.S.mare = MARE; sim.S.stab = true
  let massima = 0
  // si scarta il transitorio: all'istante zero sono per forza sovrapposte
  for (let i = 0; i < PASSI; i++) {
    sim.passo(DT, i * DT)
    if (i * DT > 30) massima = Math.max(massima, Math.abs(sim.S.rollio - sim.S.rollioNudo))
  }
  console.log(`         divergenza massima a regime: ${gradi(massima)}`)
  esito(massima > 3, 'la divisione e visibile (minimo 3°)')
}

console.log()
if (rotto) {
  console.error('  IL FANTASMA NON REGGE — vedi sopra.\n')
  process.exit(1)
}
console.log('  TUTTO A POSTO\n')
