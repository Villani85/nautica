/**
 * I TRE INTERRUTTORI FANNO QUELLO CHE PROMETTONO? — misurato, non guardato.
 *
 *     node strumenti/_conseguenze.mjs
 *
 * Nasce da due numeri del provino dei comandi che non tornavano:
 *
 *   riaccendendo lo stabilizzatore, dopo 8 s la rms scendeva 11 -> 7,72
 *   accendendo il giroscopio, la rms SALIVA 3,53 -> 5,41
 *
 * Tutti e due erano letti su un transitorio, con la velocita' che cambiava
 * sotto: un confronto fra due istanti non dice se un sistema funziona. Qui si
 * misura il REGIME: si mette una configurazione, si lascia assestare, poi si
 * misura l'escursione del rollio su una finestra lunga, a passo dichiarato --
 * cosi' il numero non dipende dalla macchina.
 *
 * Le quattro configurazioni si confrontano a MARE UGUALE e VELOCITA' UGUALE,
 * che e' l'unico modo perche' il confronto sia fra i sistemi e non fra
 * condizioni diverse: le pinne perdono autorita' col calare della velocita',
 * e senza fissarla si finisce a misurare la decelerazione.
 */
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'

const PORTA = Number(process.env.PORTA_COLLAUDO || 6558)
const MARE = Number(process.env.MARE || 5)
const DT = 1 / 60
const ASSESTA = Number(process.env.ASSESTA || 30)   // secondi simulati
const MISURA = Number(process.env.MISURA || 30)

await avvisaSePortaAltrui(PORTA)
const pv = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
for (let i = 0; i < 60; i++) {
  try { await fetch(`http://localhost:${PORTA}/`, { redirect: 'manual' }); break } catch {}
  await new Promise(r => setTimeout(r, 500))
}

const b = await apriBrowser({ conGpu: true })
const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1&senzaFilmato=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica && !!window.__nautica.stato, null, { timeout: 30000 })
await pg.waitForTimeout(2000)

/**
 * Una configurazione, e il numero che ne esce.
 *
 * `passoDichiarato` fa avanzare la simulazione senza disegnare: la stessa
 * regola dei cancelli — non si misura la velocita' della macchina.
 */
/**
 * LA VELOCITA' SI TIENE FERMA A MANO, ed e' un artificio dichiarato.
 *
 * `S.velocita` e' uno stato che il modello della propulsione fa evolvere: a
 * propulsione spenta cala e non si ferma mai, quindi non esiste un regime da
 * misurare. Per confrontare i SISTEMI e non le CONDIZIONI la si riscrive a
 * ogni passo. Non e' come si comporta il sito: e' il banco di prova.
 */
const prova = (cfg) => pg.evaluate(async ({ c, dt, assesta, misura, mare, vel }) => {
  const n = window.__nautica
  const S = n.stato
  S.mare = mare
  S.stab = c.stab
  S.giroscopio = c.gyro
  const tieni = () => { S.velocita = vel }
  tieni()
  const passiA = Math.round(assesta / dt)
  for (let i = 0; i < passiA; i++) { tieni(); n.passoDichiarato(dt, 1) }
  let min = Infinity, max = -Infinity, somma = 0, quanti = 0
  const passi = Math.round(misura / dt)
  for (let i = 0; i < passi; i++) {
    tieni()
    n.passoDichiarato(dt, 1)
    const r = S.rollio
    if (r < min) min = r
    if (r > max) max = r
    somma += r * r
    quanti++
  }
  return {
    escursione: max - min,
    picco: Math.max(Math.abs(min), Math.abs(max)),
    rms: Math.sqrt(somma / quanti),
    giriGyro: +(S.giriGiroscopio ?? 0).toFixed(3),
    velocita: S.velocita
  }
}, { c: cfg, dt: DT, assesta: ASSESTA, misura: MISURA, mare: MARE, vel: cfg.vel })

const COMBI = [
  { nome: 'niente acceso', stab: false, gyro: false },
  { nome: 'solo pinne', stab: true, gyro: false },
  { nome: 'solo giroscopio', stab: false, gyro: true },
  { nome: 'pinne + giroscopio', stab: true, gyro: true }
]
const VELOCITA = (process.env.VELOCITA || '12,4').split(',').map(Number)

console.log(`\n  REGIME — mare ${MARE}, ${ASSESTA}s di assestamento + ${MISURA}s di misura, passo dichiarato`)
console.log('  la velocita e tenuta ferma a mano: si confrontano i sistemi, non le condizioni\n')

for (const vel of VELOCITA) {
  console.log(`   ── a ${vel} kn`)
  console.log('     configurazione        escursione p-p    picco      rms   giri gyro   riduzione')
  console.log('     ' + '-'.repeat(76))
  const esiti = []
  for (const c of COMBI) {
    const r = await prova({ ...c, vel })
    esiti.push({ ...c, ...r })
  }
  const base = esiti[0].rms
  for (const e of esiti) {
    const rid = base > 0 ? (1 - e.rms / base) * 100 : NaN
    console.log(`     ${e.nome.padEnd(20)}${e.escursione.toFixed(2).padStart(9)}°${e.picco.toFixed(2).padStart(10)}°` +
      `${e.rms.toFixed(2).padStart(9)}°${String(e.giriGyro).padStart(10)}` +
      `${(e.nome === 'niente acceso' ? '   —' : rid.toFixed(1) + '%').padStart(12)}`)
  }
  const soloGyro = esiti[2]
  const soloPinne = esiti[1]
  const tutti = esiti[3]
  if (soloGyro.rms >= base) console.log(`     ⚠ a ${vel} kn il giroscopio da solo NON riduce il rollio`)
  if (tutti.rms > soloPinne.rms) console.log(`     ⚠ a ${vel} kn accendere il giroscopio PEGGIORA rispetto alle sole pinne`)
  console.log('')
}

/**
 * ─── E QUANTO CI METTE A TORNARE CALMA
 *
 * E' il gesto centrale del sito: si spegne, la nave rolla, si riaccende. Se il
 * ritorno alla calma e' piu' lento della pazienza di chi guarda, la
 * dimostrazione si vede a meta' -- e nel provino dei comandi, otto secondi dopo
 * aver riacceso, la rms era ancora a 7,72 su un regime di 0,59.
 *
 * Qui si misura il TEMPO, in secondi simulati, perche' l'angolo scenda sotto
 * una soglia dichiarata e ci resti.
 */
const SOGLIA = Number(process.env.SOGLIA || 1.5)
const ripresa = await pg.evaluate(async ({ dt, mare, vel, soglia }) => {
  const n = window.__nautica
  const S = n.stato
  S.mare = mare
  S.stab = false
  S.giroscopio = false
  const tieni = () => { S.velocita = vel }
  for (let i = 0; i < Math.round(40 / dt); i++) { tieni(); n.passoDichiarato(dt, 1) }
  /* si riaccende, e da qui si conta */
  S.stab = true
  let t = 0
  let sotto = 0
  const tappe = []
  const limite = 60
  while (t < limite) {
    tieni()
    n.passoDichiarato(dt, 1)
    t += dt
    const a = Math.abs(S.rollio)
    if (tappe.length < 6 && t >= tappe.length * 2 + 2) tappe.push([+t.toFixed(1), +a.toFixed(2)])
    if (a < soglia) sotto += dt; else sotto = 0
    if (sotto > 3) return { secondi: +(t - sotto).toFixed(1), tappe, finito: true }
  }
  return { secondi: null, tappe, finito: false }
}, { dt: DT, mare: MARE, vel: 12, soglia: SOGLIA })

console.log(`   ── il ritorno alla calma (mare ${MARE}, 12 kn, soglia ${SOGLIA}°)`)
console.log('     picco assoluto del rollio dopo aver riacceso:')
ripresa.tappe.forEach(([t, a]) => console.log(`       ${String(t).padStart(5)} s   ${a.toFixed(2)}°`))
console.log(ripresa.finito
  ? `     sotto ${SOGLIA}° e ci resta dopo ${ripresa.secondi} s`
  : `     NON scende sotto ${SOGLIA}° entro 60 s`)
console.log('')

await b.close(); pv.kill()
