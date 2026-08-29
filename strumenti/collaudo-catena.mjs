/**
 * COLLAUDO DELLA CATENA CAUSALE DELL'ATTO DUE.
 *
 * Non verifica che quattro numeri cambino insieme: sarebbe facile ottenere lo
 * stesso effetto scrivendoli nel gestore del clic. Verifica invece i confini
 * fra le cause:
 *
 *   comando propulsione -> inerzia albero -> velocita' -> autorita' V^2
 *                         -> risposta delle pinne -> rollio
 *
 * Spegnere il comando non puo' toccare istantaneamente nessuna grandezza a
 * valle. E, a velocita' uguale, il booleano della propulsione non puo' cambiare
 * direttamente l'autorita' delle pinne.
 */
import { autorita, creaSimulazione, V_RIF } from '../src/scena/simulazione.js'

const guai = []
const prova = (ok, messaggio) => {
  if (!ok) guai.push(messaggio)
  console.log(`${ok ? '  OK ' : '  NO '} ${messaggio}`)
}
const vicino = (a, b, e = 1e-10) => Math.abs(a - b) <= e
const rms = (a) => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length)

function avanza (sim, secondi, hz = 60, campiona) {
  const dt = 1 / hz
  for (let k = 0; k < Math.round(secondi * hz); k++) {
    sim.passo(dt, k * dt)
    campiona?.(sim.S, k * dt)
  }
}

console.log('\ncatena causale dell atto due')

const sim = creaSimulazione({ seme: 20260829, velocitaDinamica: true })
sim.S.mare = 5
sim.S.stab = true
sim.scalda()

const prima = { ...sim.S }
sim.cambiaPropulsione(false)

prova(sim.S.stab === true, 'togliere propulsione non spegne lo stabilizzatore')
prova(vicino(sim.S.velocita, prima.velocita), 'il clic non riscrive la velocita')
prova(vicino(sim.S.rollio, prima.rollio), 'il clic non teletrasporta il rollio')
prova(vicino(sim.S.autoritaPinna, prima.autoritaPinna), 'il clic non azzera direttamente l autorita delle pinne')

let aUnSecondo
const rollioFinale = []
const pinnaFinale = []
avanza(sim, 40, 60, (S, t) => {
  if (t >= 1 && !aUnSecondo) aUnSecondo = { ...S }
  if (t >= 30) {
    rollioFinale.push(S.rollio)
    pinnaFinale.push(Math.abs(S.pinna))
  }
})

prova(aUnSecondo.giriPropulsione > 0.6, 'l albero conserva inerzia un secondo dopo lo stop')
prova(aUnSecondo.velocita > 11.5, 'la nave non perde abbrivio in un fotogramma')
prova(sim.S.velocita < 6.3 && sim.S.velocita > 5.8,
  `dopo 40 s l andatura e decaduta fisicamente (${sim.S.velocita.toFixed(2)} kn)`)
prova(vicino(sim.S.autoritaPinna, autorita(sim.S.velocita), 1e-12),
  'l autorita runtime e ancora esattamente C(V), non una posa narrativa')
prova(sim.S.autoritaPinna < prima.autoritaPinna * 0.30,
  'perdendo velocita le pinne perdono almeno il 70% dell autorita')
prova(Math.max(...pinnaFinale) > 0.30,
  'le pinne continuano a tentare la correzione a bassa velocita')
prova(rms(rollioFinale) > 4,
  `il rollio torna come conseguenza (${rms(rollioFinale).toFixed(2)} gradi RMS)`)

/* Stessa velocita', stesso mare, stesso stabilizzatore: il booleano della
   propulsione deve essere invisibile all'equazione delle pinne. La dinamica
   dell'andatura e' disattivata apposta per isolare questa dipendenza. */
const acceso = creaSimulazione({ seme: 9 })
const spento = creaSimulazione({ seme: 9 })
for (const s of [acceso, spento]) {
  s.S.mare = 4
  s.S.stab = true
  s.S.velocita = 8
}
spento.cambiaPropulsione(false)
acceso.passo(1 / 60, 0)
spento.passo(1 / 60, 0)
prova(vicino(acceso.S.autoritaPinna, spento.S.autoritaPinna),
  'a velocita uguale ON/OFF propulsione non altera direttamente le pinne')

/* Il risultato non deve dipendere dal refresh del dispositivo. */
const velocitaPerHz = []
for (const hz of [30, 60, 120]) {
  const s = creaSimulazione({ seme: 11, velocitaDinamica: true })
  s.S.mare = 5
  s.S.stab = true
  s.scalda()
  s.cambiaPropulsione(false)
  avanza(s, 40, hz)
  velocitaPerHz.push(s.S.velocita)
}
prova(Math.max(...velocitaPerHz) - Math.min(...velocitaPerHz) < 0.01,
  `la deriva fra 30/60/120 Hz resta sotto 0,01 kn (${velocitaPerHz.map(v => v.toFixed(3)).join(' / ')})`)

sim.cambiaPropulsione(true)
avanza(sim, 60)
prova(sim.S.giriPropulsione > 0.99, 'riaccendere riporta l albero a regime senza salto')
prova(sim.S.velocita > 11.4 && sim.S.velocita <= V_RIF,
  `l andatura recupera verso il punto di servizio (${sim.S.velocita.toFixed(2)} kn)`)
prova(sim.S.autoritaPinna > prima.autoritaPinna * 0.90,
  'recuperando andatura torna anche l autorita delle pinne')

/* --- IL CONTROESEMPIO: il giroscopio lavora dove le pinne non possono ------ */
/**
 * E' la voce per cui esiste l'atto due, e va verificata come PROPRIETA' e non
 * come numero: a nave quasi ferma l'autorita' delle pinne e' crollata col
 * quadrato della velocita', e quella del giroscopio NO. Se un giorno qualcuno
 * legasse il giroscopio alla velocita' -- per errore o per far tornare un
 * numero -- questa riga diventa rossa, ed e' l'unico modo in cui puo'.
 */
console.log('')
console.log('il controesempio')
const g = creaSimulazione({ seme: 31, velocitaDinamica: true })
g.S.mare = 5
g.S.stab = true
g.scalda()
const autPiena = autorita(g.S.velocita)
g.cambiaPropulsione(false)

const rollioSenzaGyro = []
avanza(g, 60, 60, (S, t) => { if (t >= 40) rollioSenzaGyro.push(S.rollio) })
const vLenta = g.S.velocita
/**
 * LE DUE SOGLIE VENGONO DALLA FORMA CHIUSA, non dall'occhio -- e la prima
 * stesura le aveva indovinate, uscendo rossa su un sito sano.
 *
 * In caduta libera la resistenza quadratica da' 1/V lineare nel tempo:
 *
 *     1/V = 1/12 + ACCEL_RIF/V_RIF^2 * t   ->   a 60 s, V = 4,8 kn
 *
 * e l'autorita' segue il quadrato: (4,8/12)^2 = 16%. Avevo scritto «< 4 kn» e
 * «< 12%», cioe' numeri piu' stretti di quelli che la fisica produce: il
 * cancello bocciava il modello per non essere piu' veloce di se stesso.
 *
 * I margini qui sotto stanno SOPRA il valore atteso e sotto quello di
 * servizio: bocciano una decelerazione che non avviene, non una che avviene
 * come prevista.
 */
prova(vLenta < 5.5, `la nave ha perso l'abbrivio (${vLenta.toFixed(2)} kn, atteso ~4,8)`)
prova(g.S.autoritaPinna < autPiena * 0.20,
  `li' le pinne hanno perso quasi tutto (${(100 * g.S.autoritaPinna / autPiena).toFixed(1)}% di quella di servizio, atteso ~16%)`)
prova(g.S.autoritaGiroscopio === 0, 'e il giroscopio e spento, quindi non contribuisce')

g.S.giroscopio = true
/* venti secondi non bastano: il rotore ha una costante di tempo di venti, e a
   una costante di tempo e' al 63%. Se ne aspettano cento, cioe' cinque. */
const rollioConGyro = []
avanza(g, 130, 60, (S, t) => { if (t >= 100) rollioConGyro.push(S.rollio) })

prova(g.S.giriGiroscopio > 0.99, `il rotore e a regime (${g.S.giriGiroscopio.toFixed(3)})`)
prova(g.S.autoritaGiroscopio > 0.5,
  `e produce autorita a ${g.S.velocita.toFixed(2)} kn, dove le pinne non possono`)
prova(rms(rollioConGyro) < rms(rollioSenzaGyro) * 0.6,
  `il rollio scende da ${rms(rollioSenzaGyro).toFixed(2)} a ${rms(rollioConGyro).toFixed(2)} gradi RMS a nave quasi ferma`)

/* E la prova che non e' la velocita' a farlo: due corse a velocita' IMPOSTA
   diverse devono dare la stessa autorita' del giroscopio. Se il giroscopio
   dipendesse da V -- la scorciatoia -- questa riga cadrebbe. */
const lento = creaSimulazione({ seme: 5 })
const veloce = creaSimulazione({ seme: 5 })
lento.S.velocita = 2; veloce.S.velocita = 16
for (const x of [lento, veloce]) { x.S.mare = 4; x.S.giroscopio = true; for (let k = 0; k < 3000; k++) x.passo(1 / 60, k / 60) }
prova(vicino(lento.S.autoritaGiroscopio, veloce.S.autoritaGiroscopio, 1e-12),
  'a 2 e a 16 nodi il giroscopio produce ESATTAMENTE la stessa autorita')

if (guai.length) {
  console.error(`\n${guai.length} proprieta causali rotte.`)
  process.exit(1)
}
console.log('\nLa catena e causale: nessun ramo spegne le pinne al posto della velocita.\n')
