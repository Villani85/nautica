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

/**
 * ─── IL SERVER DEVE ESSERE IL PROPRIO, E QUESTA E' LA TRAPPOLA PIU' CARA DEL
 *     FILE
 *
 * Con `--strictPort` vite ESCE se la porta e' gia' occupata, e con
 * `stdio: 'ignore'` non lo dice a nessuno. Il cancello poi apriva
 * `localhost:5321` e lo trovava che rispondeva -- perche' rispondeva **il
 * server di qualcun altro**, con un altro `dist` dentro.
 *
 * Costato tre corse. Il collaudo bocciava due battute su quattro dicendo che
 * non comparivano; comparivano benissimo, ma nel `dist` di questa copia di
 * lavoro, mentre la pagina misurata veniva da un'altra. E' la forma esatta del
 * difetto che questo repo si ripete addosso da settimane -- *un metro rotto non
 * da' errore, da' un numero* -- applicata allo strumento invece che al sito.
 *
 * Bastano tre righe: se il figlio muore prima che si cominci a misurare, non e'
 * il nostro server quello che risponde, e allora non si misura affatto. Meglio
 * NON MISURABILE di un verdetto su un artefatto sconosciuto.
 */
let previewMorto = null
preview.on('exit', (codice) => { previewMorto = codice })
await new Promise(r => setTimeout(r, 2500))
if (previewMorto !== null) {
  console.log('')
  console.log(`  NON MISURABILE: il server di anteprima e uscito (codice ${previewMorto}).`)
  console.log(`  Quasi certamente la porta ${PORTA} e gia' occupata: con --strictPort vite esce,`)
  console.log('  e senza questo controllo il cancello misurerebbe il dist di un altro processo.')
  console.log('  Si riprova con PORTA_COLLAUDO=<porta libera>.')
  console.log('')
  process.exit(1)
}
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
    gyro: S ? !!S.giroscopio : null,
    rms: S && Number.isFinite(S.rollioRms) ? +S.rollioRms.toFixed(2) : null,
    /* ─── LA BATTUTA E LA VISIBILITA' DEI BERSAGLI, o un'assenza non si spiega
     *
     * Una battuta che non compare ha tre cause possibili e indistinguibili
     * senza questi tre campi: la condizione fisica non e' matura, la regia sta
     * su un'altra battuta, o il bersaglio non e' in campo (`nudge.js` non
     * mostra mai un suggerimento appeso a un comando che non si vede). La
     * prima stesura di questo cancello ne stampava una sola, e ho passato una
     * corsa a indovinare quale delle tre fosse. */
    battuta: document.querySelector('#dimostrazione .palco')?.dataset.battuta || '',
    visti: ['#v-velocita', '#propulsione', '#stab', '#giroscopio'].filter((sel) => {
      const e = document.querySelector(sel)
      if (!e) return false
      const r = e.getBoundingClientRect()
      return r.width >= 4 && r.height >= 4 && r.bottom >= 0 && r.top <= innerHeight &&
             Number(getComputedStyle(e).opacity) > 0.15
    }).join(' ')
  }
})

/**
 * ─── SI GUARDA TUTTA LA SEQUENZA, non solo l'ultima battuta
 *
 * Fino a stanotte questo cancello controllava una cosa sola: che la bolla del
 * giroscopio comparisse. Era gia' molto -- prima non lo controllava nessuno --
 * ma lasciava scoperto il pezzo in mezzo, che e' dove l'atto due si capisce o
 * non si capisce. Le battute adesso sono quattro e hanno un ORDINE:
 *
 *     «Switch propulsion off»                    prima del gesto
 *     «The shaft slows. Speed follows.»          subito dopo
 *     «The fins are still on. They are losing water.»   quando l'autorita' cala
 *     «Try the gyro»                             quando il rollio e' tornato
 *
 * Un ordine e' esattamente il genere di cosa che si scrive, sembra giusta, e in
 * pagina esce mescolata -- perche' due condizioni sono vere insieme e vince
 * quella scritta prima nell'elenco, o perche' una battuta occupa lo schermo
 * quando la successiva l'avrebbe gia' meritato. Non e' un'ipotesi: e' il conto
 * per cui `DURATA_ATTO_DUE` esiste. Quindi si osserva la fila vera.
 *
 * ─── E NON SI MISURANO I SECONDI. Deliberatamente.
 *
 * Le battute maturano su grandezze della SIMULAZIONE, e la simulazione avanza
 * a fotogrammi: su un rasterizzatore software il tempo simulato scorre molto
 * piu' lento di quello dell'orologio. Un tetto in secondi qui misurerebbe la
 * velocita' del runner -- la regola che questo repo si e' dato dopo undici
 * commit di CI rossa, e che ha gia' fatto rovesciare un verdetto in
 * `collaudo-manopola`.
 *
 * Il budget di tempo dell'atto due (albero entro 1 s, andatura sotto i 10 kn
 * entro 10, rollio avvertibile entro 14) e' misurato dove la misura vale:
 * `collaudo-catena.mjs`, a passo dichiarato, in tempo SIMULATO. Qui si
 * verifica l'altra meta', che quel cancello non puo' vedere -- che le battute
 * arrivino davvero in pagina, nell'ordine giusto, e che dopo il giroscopio
 * arrivi il silenzio.
 *
 * L'orologio si stampa lo stesso, e serve: dice se la corsa e' stata lenta,
 * cosi' un'assenza si legge come «non e' comparsa» e non come «non ho
 * aspettato abbastanza».
 */
const TETTO_MS = 90000        // quanto si aspetta prima di dire «non e comparsa»
const PASSO_MS = 250

/* ─── controprova: a propulsione ACCESA il giroscopio non deve esserci */
await pg.waitForTimeout(6500)                       /* piu' della pausa di 5,2 s */
const prima = await leggi()
console.log(`  a propulsione accesa   velocita ${prima.velocita} kn   bolla: ${prima.bolla ?? 'nessuna'}`)

/* ─── si spegne la propulsione e si guarda la fila che ne esce */
await pg.click('#propulsione').catch(() => {})
const t0 = Date.now()

/** Ogni bolla vista, una volta sola, con l'orologio e lo stato di quel momento. */
const fila = []
const traccia = []
let ultima = null
let ultimo = null
while (Date.now() - t0 < TETTO_MS) {
  await pg.waitForTimeout(PASSO_MS)
  ultimo = await leggi()
  const b = ultimo.bolla
  if (b && b !== ultima) {
    fila.push({ t: (Date.now() - t0) / 1000, testo: b, v: ultimo.velocita, b: ultimo.battuta })
    ultima = b
  }
  /* si registra anche il PRIMO campione utile di ogni condizione, cosi' un
     nudge mancato si legge accanto allo stato che avrebbe dovuto produrlo */
  if (traccia.length < 40) traccia.push({
    t: +((Date.now() - t0) / 1000).toFixed(1), v: ultimo.velocita, rms: ultimo.rms,
    battuta: ultimo.battuta, visti: ultimo.visti, bolla: b
  })
  if (b === null) ultima = null
  if (fila.some(x => /gyro/i.test(x.testo))) break
}

console.log(`  dopo ${((Date.now() - t0) / 1000).toFixed(1)} s senza propulsione   velocita ${ultimo?.velocita} kn`)
console.log('  la fila delle battute:')
if (!fila.length) console.log('    (nessuna)')
for (const x of fila) console.log(`    ${x.t.toFixed(1).padStart(5)} s   ${x.v} kn   [${x.b}]   "${x.testo}"`)
console.log('  la traccia dello stato:')
for (const x of traccia) {
  console.log(`    ${String(x.t).padStart(5)} s  v ${String(x.v).padStart(5)}  rms ${String(x.rms).padStart(5)}  ` +
              `battuta ${(x.battuta || '(nessuna)').padEnd(11)} in campo: ${x.visti || '(niente)'}`)
}

/**
 * ─── E DOPO IL GIROSCOPIO, IL SILENZIO
 *
 * E' una decisione di regia, non una dimenticanza: dopo la soluzione la nave si
 * calma da sola e le due persone si rilassano, e un'etichetta sopra quel
 * momento lo trasformerebbe in una conferma di sistema. Nessun altro cancello
 * puo' accorgersi di un suggerimento di troppo proprio li'.
 */
let dopoGyro = null
if (fila.some(x => /gyro/i.test(x.testo))) {
  await pg.click('#giroscopio').catch(() => {})
  await pg.waitForTimeout(1500)                    /* la bolla in corso si spegne */
  const viste = []
  for (let i = 0; i < 32; i++) {                   /* otto secondi */
    await pg.waitForTimeout(PASSO_MS)
    const b = (await leggi()).bolla
    if (b && !viste.includes(b)) viste.push(b)
  }
  dopoGyro = viste
  console.log(`  acceso il giroscopio, otto secondi dopo: ${viste.length ? viste.map(x => `"${x}"`).join(', ') : 'silenzio'}`)
}

await browser.close()
preview.kill()

const rossi = []
const trova = (re) => fila.findIndex(x => re.test(x.testo))

if (prima.velocita === null || (ultimo && ultimo.velocita === null)) {
  rossi.push('lo stato della simulazione non si legge: il cancello non ha misurato niente')
}
if (prima.bolla && /gyro/i.test(prima.bolla)) {
  rossi.push('la bolla del giroscopio c era gia a propulsione accesa: non e un nudge di stato')
}

const iAlbero = trova(/shaft/i)
const iPinne = trova(/fins/i)
const iGyro = trova(/gyro/i)

if (iAlbero < 0) rossi.push('manca la battuta dell albero: spegnere la propulsione non viene nominato')
if (iPinne < 0) rossi.push('manca la battuta delle pinne: la contraddizione che regge l atto due non viene detta')
if (iGyro < 0) {
  rossi.push(`la bolla del giroscopio non e mai comparsa in ${(TETTO_MS / 1000).toFixed(0)} s, ` +
             `con velocita scesa a ${ultimo?.velocita} kn`)
}

/* L'ORDINE, e non e' pedanteria: «le pinne stanno perdendo acqua» detto DOPO
   «prova il giroscopio» sarebbe la spiegazione dopo la soluzione, cioe' la
   catena causale raccontata al contrario. */
if (iAlbero >= 0 && iPinne >= 0 && iPinne < iAlbero) {
  rossi.push('le pinne vengono nominate prima dell albero: la catena e raccontata al contrario')
}
if (iPinne >= 0 && iGyro >= 0 && iGyro < iPinne) {
  rossi.push('il giroscopio arriva prima che le pinne siano state nominate: la soluzione precede il problema')
}

if (dopoGyro && dopoGyro.length) {
  rossi.push(`dopo il giroscopio compare ancora ${dopoGyro.map(x => `"${x}"`).join(', ')}: ` +
             'il finale deve essere silenzioso')
}

if (rossi.length) {
  console.log('')
  for (const r of rossi) console.log(`  ROTTO  ${r}`)
  console.log('')
  process.exit(1)
}
console.log('\n  la catena causale si racconta da sola, nell ordine, e finisce in silenzio.\n')
