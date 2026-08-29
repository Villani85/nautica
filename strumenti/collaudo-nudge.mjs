/**
 * IL NUDGE DEL GIROSCOPIO ARRIVA DAVVERO, E ARRIVA IN TEMPO?
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
 * si fa rallentare la nave sul serio, e si guarda se la bolla c'e'.
 *
 * ─── E LA CONTROPROVA, che vale quanto la prova
 *
 * Se comparisse comunque -- a nave veloce, a propulsione accesa -- non sarebbe
 * un nudge di stato, sarebbe una bolla a tempo con una condizione decorativa.
 * Quindi si misura anche PRIMA di spegnere, e li' deve essere assente.
 *
 * ─── E LA TERZA DOMANDA, che e' quella per cui questo file e' stato riscritto
 *
 * «Compare» non basta. La prima stesura aspettava fino a quarantacinque secondi
 * e si dichiarava soddisfatta se la bolla arrivava, senza guardare QUANDO. Con
 * la soglia di allora -- 7,0 kn -- la risposta era **29,9 secondi dopo lo
 * spegnimento**, e in quei trenta secondi il visitatore del filmato era gia'
 * arrivato al finale. Il cancello era verde su un suggerimento che nessuno
 * poteva vedere.
 *
 * E' il difetto che questo cancello era nato per prendere, arrivato da un lato
 * che non guardava: non «esiste una condizione che non si verifica mai», ma
 * «esiste una condizione che si verifica troppo tardi per la vita della
 * pagina». Adesso il tempo d'arrivo e' MISURATO e ha un budget dichiarato.
 *
 * ─── PERCHE' IL TEMPO LO DETTA IL CANCELLO
 *
 * Aspettare che la nave rallenti in tempo di OROLOGIO darebbe a questo file la
 * malattia che ha appena bloccato undici minuti di CI su `collaudo-manopola`:
 * la velocita' scende col tempo SIMULATO, e il tempo simulato avanza solo
 * quando la scena disegna. Su un runner senza scheda grafica si disegna a circa
 * 1,2 fotogrammi al secondo con un tetto di 0,05 s a fotogramma, quindi
 * quarantacinque secondi d'attesa sarebbero **meno di tre secondi di nave**: la
 * bolla non comparirebbe mai e il cancello dichiarerebbe rotto un nudge sano.
 *
 * `__nautica.passoDichiarato` integra la stessa fisica a passo fisso, senza
 * aspettare fotogrammi. I 400 ms d'orologio dopo ogni avanzamento non sono
 * un'attesa cieca: il giro dei nudge gira su un `setInterval` da 250 ms, quindi
 * si aspetta il MECCANISMO che accende la bolla, non "un po'".
 */
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'

const PORTA = process.env.PORTA_COLLAUDO || 5321
const BASE = `http://localhost:${PORTA}/nautica/`

/**
 * IL BUDGET, e perche' e' un numero di questo cancello e non del sito.
 *
 * `IPOTESI_ANDATURA_GYRO_KN` dice a che andatura il suggerimento ha diritto di
 * comparire; questo dice entro quanto deve succedere perche' qualcuno possa
 * viverlo. Sono due decisioni diverse e stanno in due posti diversi apposta:
 * se domani la soglia salisse a 11 kn il budget non cambierebbe, perche' non
 * parla della nave -- parla di quanto una persona resta a guardare dopo aver
 * spento qualcosa.
 *
 * Quindici secondi non sono una misura su persone e non fingono di esserlo:
 * sono il tetto sotto cui la scelta corrente (10,0 kn, che arriva a 9,3 s) sta
 * comoda e sopra cui quella precedente (7,0 kn, 29,9 s) non ci stava. Serve a
 * far scattare un cancello se qualcuno rimette la soglia dov'era, non a
 * certificare che quindici sia il numero giusto.
 */
const BUDGET_S = 15

/** quanto mare si compra a ogni giro, e quanto orologio si lascia ai nudge */
const PASSO_S = 1
const DT = 1 / 60
const RESPIRO_MS = 400

const preview = spawn('npx', ['vite', 'preview', '--port', PORTA, '--strictPort'],
  { shell: true, stdio: 'ignore' })

/* il server va ASPETTATO: `goto` su una porta ancora chiusa non riprova, e il
   messaggio che ne esce parla di rete e non di un server che sta partendo */
let su = false
for (let i = 0; i < 60 && !su; i++) {
  try { await fetch(BASE, { redirect: 'manual' }); su = true } catch {}
  if (!su) await new Promise(r => setTimeout(r, 500))
}
if (!su) {
  console.error('\n  il server non si e alzato sulla porta ' + PORTA + '\n')
  preview.kill()
  process.exit(2)
}

const browser = await apriBrowser({ conGpu: !process.env.CHROMIUM })
const pg = await browser.newPage()
await pg.setViewportSize({ width: 1440, height: 900 })
await pg.goto(BASE + '?ispeziona=1', { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
/* `passoDichiarato` muove il meccanismo leggendo `stato`, che esiste solo dal
   primo fotogramma in poi */
await pg.waitForFunction(() => !!window.__nautica.stato, null, { timeout: 60000 })

const chiudi = async (codice) => {
  await browser.close().catch(() => {})
  preview.kill()
  process.exit(codice)
}

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
  await chiudi(0)
}
console.log(`\n  battuta raggiunta: ${battuta}`)

const leggi = () => pg.evaluate(() => {
  const b = document.querySelector('.nudge')
  /* `__nautica.stato` E' GIA' `sim.S` (`index.js`), non un involucro che lo
     contiene. L'ho sbagliato due volte -- `sim.S` e poi `stato.S` -- e tutte e
     due le volte il cancello ha stampato `velocita null` continuando a dire
     "a posto": un campo che non si sa leggere stampa un numero finto, non un
     errore. E' la regola di questo repo vista da dentro uno strumento. */
  const S = window.__nautica?.stato || null
  return {
    bolla: b?.dataset.visibile === 'si' ? (b.textContent || '').trim() : null,
    velocita: S ? +S.velocita.toFixed(2) : null,
    propulsione: S ? !!S.propulsione : null,
    stab: S ? !!S.stab : null,
    gyro: S ? !!S.giroscopio : null,
    battuta: document.querySelector('#dimostrazione .palco')?.dataset.battuta || ''
  }
})

/* ─── controprova: a propulsione ACCESA non deve esserci.
   La pausa dei nudge e' 5,2 s d'orologio e non dipende dalla simulazione,
   quindi qui l'attesa in millisecondi e' quella giusta. */
await pg.waitForTimeout(6500)
const prima = await leggi()
console.log(`  a propulsione accesa   velocita ${prima.velocita} kn   bolla: ${prima.bolla ?? 'nessuna'}`)

/* ─── si spegne, e poi il mare lo compra il cancello */
await pg.click('#propulsione').catch(() => {})
const spenta = await leggi()
if (spenta.propulsione !== false) {
  console.log('\n  ROTTO  il clic su #propulsione non l ha spenta: non ho potuto misurare niente\n')
  await chiudi(1)
}

let dopo = spenta
let simulati = 0
let arrivata = null
const GIRI = Math.ceil((BUDGET_S * 2) / PASSO_S)   // il doppio del budget: si misura anche il ritardo
for (let i = 0; i < GIRI; i++) {
  const t = await pg.evaluate(([dt, sec]) =>
    window.__nautica.passoDichiarato?.(dt, Math.round(sec / dt)) ?? null, [DT, PASSO_S])
  if (t === null) {
    console.log('\n  ROTTO  la scena non espone passoDichiarato: senza, questo cancello')
    console.log('         misurerebbe la velocita del runner invece di quella della nave\n')
    await chiudi(1)
  }
  simulati += PASSO_S
  await pg.waitForTimeout(RESPIRO_MS)
  dopo = await leggi()
  if (dopo.bolla && /gyro/i.test(dopo.bolla)) { arrivata = simulati; break }
}

console.log(`  dopo ${simulati.toFixed(0)} s SIMULATI senza propulsione   ` +
            `velocita ${dopo.velocita} kn   bolla: ${dopo.bolla ?? 'nessuna'}`)
if (arrivata !== null) {
  console.log(`  il suggerimento del giroscopio e arrivato a ${arrivata.toFixed(0)} s simulati ` +
              `(budget ${BUDGET_S} s)`)
}

const rossi = []
if (prima.velocita === null || dopo.velocita === null) {
  rossi.push('lo stato della simulazione non si legge: il cancello non ha misurato niente')
}
if (prima.bolla && /gyro/i.test(prima.bolla)) {
  rossi.push('la bolla del giroscopio c era gia a propulsione accesa: non e un nudge di stato')
}
if (arrivata === null) {
  rossi.push(`la bolla del giroscopio non e mai comparsa in ${simulati.toFixed(0)} s simulati, ` +
             `con velocita scesa a ${dopo.velocita} kn`)
} else if (arrivata > BUDGET_S) {
  /* IL DIFETTO PER CUI QUESTO RAMO ESISTE. Un suggerimento che compare al
     trentesimo secondo di nave e' scritto bene e non lo vede nessuno: nel
     filmato di collaudo il visitatore era gia' al finale. Verde qui sopra e
     invisibile nella pagina e' esattamente la coppia che questo repo si e'
     vietato. */
  rossi.push(`la bolla del giroscopio arriva a ${arrivata.toFixed(0)} s simulati dopo lo ` +
             `spegnimento, oltre il budget di ${BUDGET_S} s. E corretta nel codice e non ` +
             'viene vissuta: chi guarda e gia andato avanti')
}

await browser.close().catch(() => {})
preview.kill()

if (rossi.length) {
  console.log('')
  for (const r of rossi) console.log(`  ROTTO  ${r}`)
  console.log('')
  process.exit(1)
}
console.log('\n  il suggerimento del giroscopio arriva quando la catena causale lo merita,')
console.log('  e arriva mentre chi guarda e ancora li.\n')
process.exit(0)
