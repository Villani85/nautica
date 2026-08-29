/**
 * IL NUDGE DEL GIROSCOPIO ARRIVA DAVVERO?
 *
 * ─── Perche' questo cancello esiste
 *
 * Una revisione esterna ha guardato un filmato di novantun secondi e ha
 * trovato che a 48 s compare «See what happens without propulsion» e **non
 * viene seguito**: la velocita' resta a 12,0 kn e la regia procede verso il
 * finale. L'atto due esisteva nel codice senza essere vissuto. E fra i cinque
 * testi dei nudge non ce n'era nessuno che nominasse il GIROSCOPIO, che e' la
 * scoperta conclusiva.
 *
 * Il nudge nuovo dipende dallo STATO CAUSALE e non dall'inattivita'. Ma un
 * suggerimento condizionato e' esattamente il genere di cosa che si scrive,
 * sembra giusta, e non compare mai -- perche' una delle quattro condizioni non
 * si verifica insieme alle altre. `nudge.js` lo dice di se stesso: *«un
 * suggerimento che si spegne da solo e non si riaccende e' peggio di nessun
 * suggerimento, perche' fa credere di aver informato»*. Un suggerimento che non
 * compare mai e' la stessa cosa, peggio.
 *
 * Quindi qui non si controlla che il codice ci sia: si SPEGNE la propulsione,
 * si aspetta che la nave rallenti sul serio, e si guarda se la bolla c'e'.
 *
 * ─── E la controprova, che vale quanto la prova
 *
 * Se comparisse comunque -- a nave veloce, a propulsione accesa -- non sarebbe
 * un nudge di stato, sarebbe una bolla a tempo con una condizione decorativa.
 * Quindi si misura anche PRIMA di spegnere, e li' deve essere assente.
 */
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'

const PORTA = process.env.PORTA_COLLAUDO || 5321
const BASE = `http://localhost:${PORTA}/nautica/`

/**
 * ─── SI ASPETTA CHE IL SERVER RISPONDA, e non e' una precauzione teorica
 *
 * La prima corsa in CI di questo cancello e' morta con
 * `net::ERR_CONNECTION_REFUSED`: lanciava `vite preview` e ci navigava
 * subito. In locale il server si alza in tempo, sul runner no -- ed e' un
 * modo di fallire che dice «rotto» su un sito che sta benissimo.
 *
 * Il modo giusto era gia' nel repo, in `collaudo-manopola`: prima si prova a
 * RIUSARE un server gia' acceso (piu' collaudi in fila condividono la
 * preview), e solo se non c'e' se ne alza uno e si aspetta che risponda,
 * interrogandolo invece di dormire un tempo scelto a caso.
 */
async function serviteci () {
  try {
    const r = await fetch(BASE, { redirect: 'manual' })
    if (r.status < 500) return null
  } catch {}
  const s = spawn('npm', ['run', 'preview', '--', '--port', String(PORTA)], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    try { await fetch(BASE, { redirect: 'manual' }); return s } catch {}
    await new Promise(r => setTimeout(r, 500))
  }
  s.kill()
  console.error('  il server non si e alzato')
  process.exit(2)
}

const preview = await serviteci()
const browser = await apriBrowser({ conGpu: !process.env.CHROMIUM })
const pg = await browser.newPage()
await pg.setViewportSize({ width: 1440, height: 900 })
await pg.goto(BASE + '?ispeziona=1', { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })

/** porta la pagina alla battuta del meccanismo, dove il nudge dichiara di vivere */
async function vaiAlMeccanismo () {
  for (let i = 0; i <= 40; i++) {
    await pg.evaluate((q) => {
      const h = document.documentElement.scrollHeight - innerHeight
      scrollTo(0, h * q)
    }, i / 40)
    await pg.waitForTimeout(120)
    const b = await pg.evaluate(() =>
      document.querySelector('#dimostrazione .palco')?.dataset.battuta || '')
    if (b === 'meccanismo' || b === 'taglio') return b
  }
  return null
}

const battuta = await vaiAlMeccanismo()
if (!battuta) {
  console.log('\n  NON MISURABILE: non ho raggiunto ne "taglio" ne "meccanismo".')
  console.log('  Non e un difetto del nudge: e la regia che non passa di li in questa corsa.\n')
  await browser.close(); preview?.kill(); process.exit(0)
}
console.log(`\n  battuta raggiunta: ${battuta}`)

const leggi = () => pg.evaluate(() => {
  const b = document.querySelector('.nudge')
  /* `__nautica.stato` E' GIA' `sim.S` (`index.js:927`), non un involucro che
     lo contiene. L'ho sbagliato due volte -- `sim.S` e poi `stato.S` -- e tutte
     e due le volte il cancello ha stampato `velocita null` continuando a dire
     "a posto": un campo che non si sa leggere stampa un numero finto, non un
     errore. E' la regola di questo repo vista da dentro uno strumento. */
  const S = window.__nautica?.stato || null
  return {
    bolla: b?.dataset.visibile === 'si' ? (b.textContent || '').trim() : null,
    velocita: S ? +S.velocita.toFixed(2) : null,
    propulsione: S ? !!S.propulsione : null,
    stab: S ? !!S.stab : null,
    gyro: S ? !!S.giroscopio : null
  }
})

/* ─── controprova: a propulsione ACCESA non deve esserci */
await pg.waitForTimeout(6500)                       /* piu' della pausa di 5,2 s */
const prima = await leggi()
console.log(`  a propulsione accesa   velocita ${prima.velocita} kn   bolla: ${prima.bolla ?? 'nessuna'}`)

/**
 * ─── SI SPEGNE LA PROPULSIONE E SI AVANZA A PASSO DICHIARATO
 *
 * Aspettare che la nave rallenti in tempo di OROLOGIO avrebbe dato a questo
 * cancello la stessa malattia di `collaudo-manopola`: la velocita' scende col
 * tempo SIMULATO, che su un rasterizzatore software avanza quaranta volte piu'
 * lento. In CI, quarantacinque secondi d'attesa sarebbero stati meno di un
 * secondo di nave, la bolla non sarebbe mai comparsa, e il cancello avrebbe
 * dichiarato rotto un nudge che funziona.
 *
 * Quindi il tempo lo detta il cancello. Restano 600 ms d'orologio dopo ogni
 * avanzamento, e non sono un'attesa cieca: il giro dei nudge gira su un
 * `setInterval` da 250 ms, quindi la bolla puo' comparire solo a intervallo
 * scattato. Si aspetta il MECCANISMO che la accende, non "un po'".
 */
await pg.click('#propulsione').catch(() => {})
let dopo = null
let simulati = 0
const PASSO_S = 2
for (let i = 0; i < 30; i++) {
  const fatti = await pg.evaluate((sec) => {
    const DT = 1 / 60
    return window.__nautica.passoDichiarato?.(DT, Math.round(sec / DT)) ?? 0
  }, PASSO_S)
  if (!fatti) {
    console.log('\n  ROTTO  la scena non espone passoDichiarato: non ho potuto far scendere la velocita\n')
    await browser.close(); preview?.kill(); process.exit(1)
  }
  simulati += PASSO_S
  await pg.waitForTimeout(600)
  dopo = await leggi()
  if (dopo.bolla && /gyro/i.test(dopo.bolla)) break
}
const atteso = simulati
console.log(`  dopo ${atteso.toFixed(1)} s SIMULATI senza propulsione   velocita ${dopo.velocita} kn   bolla: ${dopo.bolla ?? 'nessuna'}`)

await browser.close()
preview?.kill()

const rossi = []
if (prima.velocita === null || dopo.velocita === null) {
  rossi.push('lo stato della simulazione non si legge: il cancello non ha misurato niente')
}
if (prima.bolla && /gyro/i.test(prima.bolla)) {
  rossi.push('la bolla del giroscopio c era gia a propulsione accesa: non e un nudge di stato')
}
if (!dopo.bolla || !/gyro/i.test(dopo.bolla)) {
  rossi.push(`la bolla del giroscopio non e mai comparsa in ${atteso.toFixed(0)} s simulati, ` +
             `con velocita scesa a ${dopo.velocita} kn`)
}
if (rossi.length) {
  console.log('')
  for (const r of rossi) console.log(`  ROTTO  ${r}`)
  console.log('')
  process.exit(1)
}
console.log('\n  il suggerimento del giroscopio arriva quando la catena causale lo merita.\n')
