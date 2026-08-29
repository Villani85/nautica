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
const preview = spawn('npx', ['vite', 'preview', '--port', PORTA, '--strictPort'], { shell: true, stdio: 'ignore' })
const browser = await apriBrowser({ conGpu: !process.env.CHROMIUM })
const pg = await browser.newPage()
await pg.setViewportSize({ width: 1440, height: 900 })
await pg.goto(`http://localhost:${PORTA}/nautica/?ispeziona=1`, { waitUntil: 'load' })
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
  await browser.close(); preview.kill(); process.exit(0)
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

/* ─── si spegne la propulsione e si aspetta che la nave rallenti DAVVERO */
await pg.click('#propulsione').catch(() => {})
let dopo = null
let atteso = 0
for (let i = 0; i < 90; i++) {
  await pg.waitForTimeout(500)
  atteso += 0.5
  dopo = await leggi()
  if (dopo.bolla && /gyro/i.test(dopo.bolla)) break
}
console.log(`  dopo ${atteso.toFixed(1)} s senza propulsione   velocita ${dopo.velocita} kn   bolla: ${dopo.bolla ?? 'nessuna'}`)

await browser.close()
preview.kill()

const rossi = []
if (prima.velocita === null || dopo.velocita === null) {
  rossi.push('lo stato della simulazione non si legge: il cancello non ha misurato niente')
}
if (prima.bolla && /gyro/i.test(prima.bolla)) {
  rossi.push('la bolla del giroscopio c era gia a propulsione accesa: non e un nudge di stato')
}
if (!dopo.bolla || !/gyro/i.test(dopo.bolla)) {
  rossi.push(`la bolla del giroscopio non e mai comparsa in ${atteso.toFixed(0)} s, ` +
             `con velocita scesa a ${dopo.velocita} kn`)
}
if (rossi.length) {
  console.log('')
  for (const r of rossi) console.log(`  ROTTO  ${r}`)
  console.log('')
  process.exit(1)
}
console.log('\n  il suggerimento del giroscopio arriva quando la catena causale lo merita.\n')
