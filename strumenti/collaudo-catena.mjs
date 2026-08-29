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

if (guai.length) {
  console.error(`\n${guai.length} proprieta causali rotte.`)
  process.exit(1)
}
console.log('\nLa catena e causale: nessun ramo spegne le pinne al posto della velocita.\n')
