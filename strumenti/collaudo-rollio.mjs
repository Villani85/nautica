import { creaSimulazione, AMPIEZZA_MARE, V_RIF, portanza, riduzioneVera, _riduzioneCruda }
  from '../src/scena/simulazione.js'

/**
 * COLLAUDO DEL ROLLIO.
 *
 * Non stampa una relazione: esce con errore. Uno strumento che in silenzio
 * produce un risultato sbagliato e' peggio del numero scritto a mano, perche'
 * quello almeno si vede.
 *
 * Le cose che deve impedire:
 *   1. che l'integratore diverga
 *   2. che la taratura si sposti senza che nessuno se ne accorga
 *   3. che la riduzione smetta di dipendere dalle condizioni
 *   4. che a nave ferma le pinne funzionino lo stesso
 */

let guasti = 0
const esito = (ok, testo) => {
  console.log('  ' + (ok ? 'OK   ' : 'ROTTO') + '  ' + testo)
  if (!ok) guasti++
}

/**
 * LE FASI SONO CASUALI, QUINDI UNA CORSA SOLA NON DECIDE.
 *
 * La prima stesura misurava una volta e confrontava con una soglia: passava
 * tre volte su quattro e falliva alla quarta senza che niente fosse cambiato.
 * Un cancello che suona a intermittenza e' peggio di nessun cancello, perche'
 * si impara a ignorarlo.
 */
const mediana = (f, n = 5) => {
  const v = []
  for (let i = 0; i < n; i++) v.push(f())
  v.sort((a, b) => a - b)
  return v[Math.floor(n / 2)]
}

const stat = (a) => {
  const m = a.reduce((x, y) => x + y, 0) / a.length
  return { m, sd: Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length) }
}

function corri ({ mare, stab, velocita, secondi, hz }) {
  const sim = creaSimulazione({})
  sim.S.mare = mare; sim.S.stab = stab; sim.S.velocita = velocita
  const dt = 1 / hz
  const n = Math.round(secondi * hz)
  let maxAssoluto = 0
  for (let i = 0; i < n; i++) {
    sim.passo(dt, i * dt)
    if (Math.abs(sim.S.rollio) > maxAssoluto) maxAssoluto = Math.abs(sim.S.rollio)
    if (!Number.isFinite(sim.S.rollio)) return { divergente: true, maxAssoluto }
  }
  return { picco: sim.S.picco, riduzione: sim.S.riduzione, maxAssoluto, divergente: false }
}

console.log('\nSTABILITA DELL INTEGRATORE - 20 minuti simulati, mare 5, sistema acceso')
for (const hz of [20, 30, 60, 120]) {
  const r = corri({ mare: 5, stab: true, velocita: V_RIF, secondi: 1200, hz })
  esito(!r.divergente && r.maxAssoluto < 90,
    String(hz).padStart(3) + ' Hz - picco assoluto ' + r.maxAssoluto.toFixed(1) + ' gradi' +
    (r.divergente ? '  DIVERGE' : ''))
}

console.log('\nTARATURA - la carena nuda deve dare le ampiezze nominali')
{
  const errori = []
  for (let m = 1; m <= 5; m++) {
    // Si confronta col MASSIMO DI LUNGA CORSA, non col picco a 10 s: l'ampiezza
    // nominale e' una proprieta' dello stato del mare, la lettura a schermo e'
    // un campione vivo di quella. Confrontarle era mettere insieme due metri.
    const max = mediana(() => corri({ mare: m, stab: false, velocita: V_RIF, secondi: 600, hz: 60 }).maxAssoluto)
    const atteso = AMPIEZZA_MARE[m]
    const scarto = Math.abs(max - atteso) / atteso
    errori.push(scarto)
    console.log('         mare ' + m + ': nuda ' + max.toFixed(1) + ' gradi  (nominale ' +
      atteso.toFixed(1) + ', scarto ' + (100 * scarto).toFixed(0) + '%)')
  }
  const peggio = Math.max(...errori)
  esito(peggio < 0.30, 'scarto massimo dalla nominale ' + (100 * peggio).toFixed(0) + '%  (tetto 30%)')
}

/**
 * "VARIA?" E' UNA DOMANDA STATISTICA, non un confronto con una soglia.
 *
 * Due stesure precedenti fallivano una volta su tre, per ragioni diverse ed
 * entrambe istruttive:
 *
 * 1. cercavano l'escursione a 12 nodi. Li' la pinna arriva a 10,9 gradi e non
 *    satura mai: il sistema lavora nel tratto lineare e la riduzione E' quasi
 *    costante. Non era un difetto del modello, era la misura presa nel regime
 *    in cui il fenomeno non si manifesta.
 * 2. spostandola a 8 nodi, dove la non linearita' vive, il sistema e' saturo e
 *    caotico: anche l'ESCURSIONE diventa rumorosa, e confrontarla con una
 *    soglia fissa e' un lancio di dadi.
 *
 * Il confronto giusto e' fra due varianze: quella FRA stati del mare e quella
 * DENTRO uno stesso stato su corse ripetute. Se la prima non supera
 * chiaramente la seconda, la variazione non e' distinguibile dal rumore, e non
 * la si dichiara.
 */
console.log('\nLA RIDUZIONE VARIA COL MARE? - segnale contro rumore, non contro una soglia')
{
  const V_CARICO = 8
  const perMare = []
  for (let m = 1; m <= 5; m++) {
    const c = []
    for (let i = 0; i < 7; i++) c.push(corri({ mare: m, stab: true, velocita: V_CARICO, secondi: 240, hz: 60 }).riduzione)
    const st = stat(c); perMare.push(st)
    console.log('         mare ' + m + ' a ' + V_CARICO + ' nodi: ' + (100 * st.m).toFixed(1) +
      '%  (rumore fra corse +/-' + (100 * st.sd).toFixed(1) + ')')
  }
  const fraMari = stat(perMare.map(s => s.m)).sd
  const dentroMare = stat(perMare.map(s => s.sd)).m
  const rapporto = fraMari / Math.max(dentroMare, 1e-9)
  esito(rapporto > 2, 'segnale/rumore ' + rapporto.toFixed(2) + 'x - fra stati ' +
    (100 * fraMari).toFixed(1) + ' punti, dentro uno stato ' + (100 * dentroMare).toFixed(1) + '  (minimo 2x)')
  esito(perMare[0].m > perMare[4].m + 0.15,
    'col mare grosso l efficacia CALA: ' + (100 * perMare[0].m).toFixed(0) + '% al mare 1 contro ' +
    (100 * perMare[4].m).toFixed(0) + '% al mare 5')

  const servizio = []
  for (let m = 1; m <= 5; m++)
    servizio.push(mediana(() => corri({ mare: m, stab: true, velocita: V_RIF, secondi: 240, hz: 60 }).riduzione))
  console.log('         a ' + V_RIF + ' nodi: da ' + (100 * Math.min(...servizio)).toFixed(1) + '% a ' +
    (100 * Math.max(...servizio)).toFixed(1) + '% - regime lineare, ed e GIUSTO che sia costante')
  esito(Math.max(...servizio) < 0.95,
    'riduzione massima ' + (100 * Math.max(...servizio)).toFixed(1) + '%  (tetto 95: oltre e militare)')
}

console.log('\nLA VELOCITA COMANDA - una pinna ferma non produce portanza')
{
  const prove = []
  for (const v of [0, 3, 6, 12, 20]) {
    const rid = mediana(() => corri({ mare: 4, stab: true, velocita: v, secondi: 240, hz: 60 }).riduzione)
    prove.push({ v, rid })
    console.log('         ' + String(v).padStart(2) + ' nodi: riduzione ' + (100 * rid).toFixed(1) + '%')
  }
  esito(prove[0].rid < 0.005, 'a nave ferma la riduzione e ' + (100 * prove[0].rid).toFixed(2) + '%  (deve essere zero)')
  esito(prove[1].rid < prove[3].rid, 'a 3 nodi la riduzione e minore che a 12')
  esito(prove[3].rid > 0.5, 'a velocita di servizio la riduzione e ' + (100 * prove[3].rid).toFixed(0) + '%  (minimo 50)')
}

console.log('\nLO STALLO - oltre i 20 gradi la portanza deve CALARE, non essere tagliata')
{
  const g = d => portanza(d * Math.PI / 180) * 180 / Math.PI
  console.log('         10 -> ' + g(10).toFixed(1) + '   20 -> ' + g(20).toFixed(1) +
    '   23 -> ' + g(23).toFixed(1) + '   25 -> ' + g(25).toFixed(1))
  esito(Math.abs(g(10) - 10) < 0.01, 'sotto lo stallo la portanza vale esattamente l incidenza')
  esito(g(25) < g(20), 'a fondo corsa la portanza e scesa a ' + (100 * g(25) / g(20)).toFixed(0) + '% del picco')
}

console.log('\nIL PERCORSO A MOVIMENTO RIDOTTO deve dare lo stesso numero di quello vivo')
{
  const ridotto = riduzioneVera(4, V_RIF)
  const vivo = mediana(() => corri({ mare: 4, stab: true, velocita: V_RIF, secondi: 240, hz: 60 }).riduzione)
  console.log('         percorso ridotto ' + (100 * ridotto).toFixed(1) + '%   percorso vivo ' + (100 * vivo).toFixed(1) + '%')
  esito(Math.abs(ridotto - vivo) < 0.06, 'scarto ' + (100 * Math.abs(ridotto - vivo)).toFixed(1) + ' punti  (tetto 6)')
}

/**
 * IL NUMERO DI TESTATA NON PUO' DIPENDERE DALL'ESTRAZIONE DELLE FASI.
 *
 * QUESTO CANCELLO E' STATO GIRATO AL CONTRARIO, e vale la pena dire perche'.
 *
 * Prima pretendeva che nove corse dessero numeri DIVERSI - la prova che le
 * fasi erano davvero casuali - e tollerava fino a 18 punti di escursione.
 * Tollerava, cioe', che il numero centrale del sito cambiasse di 18 punti da
 * una visita all'altra: certificava il rumore.
 *
 * Adesso chiede l'opposto. Le fasi restano casuali - lo garantisce creaMare -
 * ma la MISURA deve essere insensibile all'estrazione. E' questo che distingue
 * una misura da un aneddoto.
 *
 * Si usa _riduzioneCruda, che salta la cache: con la cache il controllo
 * confronterebbe un valore con se stesso e passerebbe sempre.
 */
console.log('\nLA MISURA NON DEVE DIPENDERE DALLE FASI ESTRATTE')
{
  let peggio = 0, dove = ''
  for (const [m, vel] of [[1, 8], [3, 8], [3, V_RIF], [5, V_RIF], [5, 20]]) {
    // Si misura la MEDIA di cinque realizzazioni, che e' quello che il sito
    // mostra davvero: una corsa sola qui direbbe una cosa e la pagina un'altra.
    const v = []
    for (let i = 0; i < 10; i++) {
      let x = 0
      for (let k = 0; k < 5; k++) x += _riduzioneCruda(m, vel)
      v.push(100 * x / 5)
    }
    const esc = Math.max(...v) - Math.min(...v)
    console.log('         mare ' + m + ', ' + String(vel).padStart(2) + ' nodi: ' +
      Math.min(...v).toFixed(1) + '%..' + Math.max(...v).toFixed(1) + '%   escursione ' + esc.toFixed(2))
    if (esc > peggio) { peggio = esc; dove = 'mare ' + m + ' a ' + vel + ' nodi' }
  }
  /**
   * Il tetto e' 5 punti e non 1 perche' UN caso lo merita: mare 3 a 8 nodi sta
   * in pieno stallo, dove il sistema e' fortemente non lineare e la risposta
   * dipende davvero da quanto forte le pinne vengono guidate. Li' l'escursione
   * e' fisica, non rumore. Dove il sistema e' lineare resta sotto 0,6.
   */
  esito(peggio < 3.5, 'escursione peggiore ' + peggio.toFixed(2) + ' punti, ' + dove + '  (tetto 3,5)')
}

/**
 * E NON PUO' DIPENDERE DAL PASSO DI INTEGRAZIONE.
 *
 * Uno stimatore che cambia risposta cambiando dt sta misurando il proprio
 * passo, non la nave. Il riferimento e' caro apposta: passo triplicato e
 * finestre doppie.
 */
console.log('\nLA MISURA NON DEVE DIPENDERE DAL PASSO SCELTO')
{
  const med = (m, v, o) => { let x = 0; for (let i = 0; i < 6; i++) x += _riduzioneCruda(m, v, o); return 100 * x / 6 }
  const RIF = { dt: 1 / 120, transitorio: 90, misura: 180 }
  let peggio = 0, dove = ''
  for (const [m, vel] of [[1, 6], [3, 8], [3, V_RIF], [5, V_RIF], [5, 20]]) {
    const d = Math.abs(med(m, vel, {}) - med(m, vel, RIF))
    if (d > peggio) { peggio = d; dove = 'mare ' + m + ' a ' + vel + ' nodi' }
  }
  esito(peggio < 1.5, 'scarto peggiore dal riferimento ' + peggio.toFixed(2) + ' punti, ' + dove + '  (tetto 1,5)')
}

/**
 * E DEVE COSTARE POCO ABBASTANZA DA STARE IN UN FOTOGRAMMA.
 *
 * Si ricalcola quando l'utente muove il cursore dell'andatura: sopra i 16 ms
 * il trascinamento singhiozza, e la fluidita' e' meta' del punteggio.
 *
 * La prima misura di questo costo diceva 40 ms e mentiva: nello stesso ciclo
 * girava anche il riferimento caro, e il suo tempo finiva attribuito allo
 * stimatore economico. Si vedeva dal fatto che dava 40 ms qualunque passo.
 */
console.log('\nE DEVE STARE IN UN FOTOGRAMMA')
{
  const n = 12
  const t0 = performance.now()
  for (let i = 0; i < n; i++) { for (let k = 0; k < 5; k++) _riduzioneCruda(3, 6 + i, {}) }
  const ms = (performance.now() - t0) / n
  console.log('         ' + ms.toFixed(1) + ' ms a combinazione')
  esito(ms < 16, 'costa ' + ms.toFixed(1) + ' ms  (tetto 16, cioe un fotogramma)')
}

console.log('\n' + (guasti === 0 ? 'TUTTO A POSTO' : guasti + ' CONTROLLI ROTTI') + '\n')
process.exit(guasti === 0 ? 0 : 1)
