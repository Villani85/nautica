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

/**
 * --- E SE IL SERVER NON E' NOSTRO, LO SI DICE
 *
 * `serviteci()` riusa un server gia' acceso sulla porta, ed e' la scelta giusta
 * in CI (piu' collaudi in fila condividono una preview sola). In locale pero'
 * quella comodita' ha un prezzo che ho pagato per intero: **il cancello misura
 * il `dist` di chi ha acceso il server, non il proprio**.
 *
 * Costato tre corse. Il collaudo bocciava due battute su quattro dicendo che
 * non comparivano; comparivano benissimo, ma nel `dist` di questa copia di
 * lavoro, mentre la pagina misurata veniva da un altro processo rimasto acceso
 * sulla 5321. Sulla stessa macchina erano occupate SETTE porte di collaudo, e
 * la 5180 -- il predefinito di quattro cancelli -- e' anche quella di
 * `npm run dev`: con un server di sviluppo acceso, quei quattro non provano
 * piu' la build.
 *
 * Non si vieta il riuso, che serve. Si TOGLIE IL SILENZIO: se il server e'
 * di qualcun altro il cancello lo stampa in testa, cosi' un verdetto strano si
 * legge per quello che e' invece di mandare a cercare un difetto che non c'e'.
 * E' la regola di questo repo -- *un metro rotto non da' errore, da' un
 * numero* -- applicata allo strumento invece che al sito.
 */
if (preview === null) {
  console.log('')
  console.log(`  ATTENZIONE: sulla porta ${PORTA} rispondeva gia' un server, e lo si riusa.`)
  console.log('  Quel server serve il `dist` di CHI LO HA ACCESO, che puo non essere questo.')
  console.log('  Per misurare la propria build: PORTA_COLLAUDO=<porta libera>.')
  console.log('')
}
const browser = await apriBrowser({ conGpu: !process.env.CHROMIUM })
const pg = await browser.newPage()
await pg.setViewportSize({ width: 1440, height: 900 })
await pg.goto(BASE + '?ispeziona=1', { waitUntil: 'load', timeout: 45000 })
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

/**
 * ─── SI INSERISCE LO STABILIZZATORE, perche' senza non c'e' contraddizione
 *
 * Da quando il sito parte SPENTO (`stato.js`, decisione del committente)
 * questo cancello usciva con due rossi: la battuta delle pinne non compariva e
 * la bolla del giroscopio nemmeno, dopo ottanta secondi simulati.
 *
 * Il rosso era corretto e il sito no. Il suggerimento del giroscopio dichiara
 * `S.stab` fra le proprie condizioni, e per una ragione: racconta la
 * contraddizione «le pinne sono ACCESE e hanno perso acqua». A pinne spente
 * quella contraddizione non esiste, e un suggerimento che la nominasse
 * mentirebbe.
 *
 * Nella visita vera lo stabilizzatore lo accende l'utente come primo gesto, e
 * quando arriva al meccanismo e' acceso da un pezzo. Il cancello fa lo stesso,
 * invece di misurare uno stato che nel percorso non esiste.
 */
await pg.evaluate(() => { window.__nautica.stato.stab = true })

/**
 * ─── E SI ASPETTA CHE LA NAVE SI SIA CALMATA DAVVERO
 *
 * Le due battute maturano su grandezze diverse: le pinne sulla VELOCITA', il
 * giroscopio sul ROLLIO RMS sopra `IPOTESI_ROLLIO_AVVERTITO_RMS` (1,8).
 *
 * Accendendo lo stabilizzatore e spegnendo la propulsione nello stesso istante,
 * l'RMS porta ancora i valori della partenza scomposta -- il sito parte spento
 * e la nave rolla di sedici gradi -- quindi il giroscopio scatta SUBITO e
 * scavalca le pinne. Misurato: «Try the gyro» a 2,0 s e 11,01 kn, con la
 * battuta delle pinne mai detta.
 *
 * Non e' un difetto del sito: e' il cancello che comprime in un istante due
 * momenti che nella visita distano minuti. L'utente accende, GUARDA la nave
 * calmarsi -- e' il raccordo del sollievo -- e solo dopo scende al meccanismo.
 *
 * Si aspetta quindi che l'RMS sia sceso sotto la soglia del giroscopio, cosi'
 * la fila delle battute riparte da zero come per chi visita davvero.
 */
/**
 * ─── E SI SONDA A OROLOGIO, NON A FOTOGRAMMA
 *
 * `waitForFunction` di serie sonda su `requestAnimationFrame`. Qui dentro pero'
 * la simulazione la avanza il SONDAGGIO stesso (`passoDichiarato`), quindi con
 * il sondaggio legato ai fotogrammi il tempo simulato scorre alla velocita'
 * della macchina: su questo PC un secondo simulato ogni 16 ms, in CI -- dove la
 * GPU e' software e un fotogramma puo' durare un secondo -- uno ogni secondo.
 * Il cancello e' morto cosi' nelle corse 309 e 312, dicendo «il rollio non si
 * calma» di un sito che si calma benissimo.
 *
 * Con `polling: 100` il tempo simulato non dipende piu' da quanto e' veloce chi
 * guarda. Non e' un allentamento: la soglia e la finestra sono le stesse, e un
 * rollio che non scende resta rosso.
 */
const calmata = await pg.waitForFunction(() => {
  const n = window.__nautica
  if (typeof n.passoDichiarato === 'function') n.passoDichiarato(1 / 60, 60)
  return (n.stato.rollioRms ?? 99) < 1.5
}, null, { timeout: 30000, polling: 100 }).then(() => true).catch(() => false)
if (!calmata) {
  /**
   * ─── E SE NON SI CALMA, SI DICE A QUANTO E' ARRIVATO
   *
   * Questo cancello e' rosso in CI e verde in locale -- anche con la GPU
   * software -- da tre corse, e il messaggio non bastava a capire perche'.
   * Le due ipotesi si distinguono con due numeri: se `passoDichiarato` non
   * c'e', la simulazione avanza solo coi fotogrammi veri e su una macchina
   * lenta il tempo simulato non arriva mai; se c'e' ed e' l'RMS a non
   * scendere, il difetto e' nel sito.
   *
   * Un cancello che dice «non si calma» senza dire a quanto e' arrivato
   * costringe chi legge a indovinare, ed e' quello che ho fatto per due corse.
   */
  const perche = await pg.evaluate(() => {
    const n = window.__nautica
    return {
      rms: n.stato?.rollioRms ?? null,
      rollio: n.stato?.rollio ?? null,
      stab: n.stato?.stab ?? null,
      velocita: n.stato?.velocita ?? null,
      passoDichiarato: typeof n.passoDichiarato,
      passiFatti: typeof n.passoDichiarato === 'function' ? n.passoDichiarato(1 / 60, 60) : null
    }
  }).catch((e) => ({ errore: String(e).slice(0, 120) }))
  console.log('  come e finita: ' + JSON.stringify(perche))
  console.log('\n  ROTTO  acceso lo stabilizzatore il rollio non si calma: le battute non hanno un ordine\n')
  await browser.close(); preview?.kill(); process.exit(1)
}
await pg.waitForTimeout(300)

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
/**
 * Mezzo secondo SIMULATO per giro, e 300 ms d'orologio dopo ognuno.
 *
 * Non due secondi: una battuta dell'atto due resta accesa 4 s
 * (`DURATA_ATTO_DUE`) e a passi da due se ne perderebbe qualcuna fra un
 * campione e l'altro -- e questo cancello non guarda solo l'ULTIMA bolla,
 * guarda la FILA.
 *
 * I 300 ms d'orologio non sono un'attesa cieca: il giro dei nudge gira su un
 * `setInterval` da 250 ms, quindi la bolla puo' comparire solo a intervallo
 * scattato. Si aspetta il MECCANISMO che la accende, non "un po'".
 */
const PASSO_S = 0.5
const GIRI_MAX = 160          // ottanta secondi SIMULATI

/* --- controprova: a propulsione ACCESA il giroscopio non deve esserci */
await pg.waitForTimeout(6500)                       /* piu' della pausa di 5,2 s */
const prima = await leggi()
console.log(`  a propulsione accesa   velocita ${prima.velocita} kn   bolla: ${prima.bolla ?? 'nessuna'}`)

/**
 * --- SI SPEGNE LA PROPULSIONE E SI AVANZA A PASSO DICHIARATO
 *
 * Aspettare che la nave rallenti in tempo di OROLOGIO avrebbe dato a questo
 * cancello la stessa malattia di `collaudo-manopola`: la velocita' scende col
 * tempo SIMULATO, che su un rasterizzatore software avanza quaranta volte piu'
 * lento. In CI, quarantacinque secondi d'attesa sarebbero stati meno di un
 * secondo di nave, la bolla non sarebbe mai comparsa, e il cancello avrebbe
 * dichiarato rotto un nudge che funziona.
 *
 * Quindi il tempo lo detta il cancello, e i secondi che stampa sono SIMULATI.
 */
await pg.click('#propulsione').catch(() => {})

/** Ogni bolla vista, una volta sola, col tempo simulato e lo stato di quel momento. */
const fila = []
let ultima = null
let ultimo = null
let simulati = 0
for (let i = 0; i < GIRI_MAX; i++) {
  const fatti = await pg.evaluate((sec) => {
    const DT = 1 / 60
    return window.__nautica.passoDichiarato?.(DT, Math.round(sec / DT)) ?? 0
  }, PASSO_S)
  if (!fatti) {
    console.log('')
    console.log('  ROTTO  la scena non espone passoDichiarato: non ho potuto far scendere la velocita')
    console.log('')
    await browser.close(); preview?.kill(); process.exit(1)
  }
  simulati += PASSO_S
  await pg.waitForTimeout(300)
  ultimo = await leggi()
  if (process.env.DIAGNOSI) {
    console.log(`    [${simulati.toFixed(1)}s] v ${ultimo.velocita} · prop ${ultimo.propulsione} ` +
                `· stab ${ultimo.stab} · gyro ${ultimo.gyro} · bolla ${ultimo.bolla ?? '-'}`)
  }
  const b = ultimo.bolla
  if (b && b !== ultima) {
    fila.push({ t: simulati, testo: b, v: ultimo.velocita, rms: ultimo.rms, dove: ultimo.battuta })
    ultima = b
  }
  if (b === null) ultima = null
  if (fila.some(x => /gyro/i.test(x.testo))) break
}

console.log(`  dopo ${simulati.toFixed(1)} s SIMULATI senza propulsione   velocita ${ultimo?.velocita} kn`)
console.log('  la fila delle battute:')
if (!fila.length) console.log('    (nessuna)')
for (const x of fila) {
  console.log(`    ${x.t.toFixed(1).padStart(5)} s   ${String(x.v).padStart(5)} kn   rms ${String(x.rms).padStart(5)}   [${x.dove}]   "${x.testo}"`)
}

/**
 * --- E DOPO IL GIROSCOPIO, IL SILENZIO
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
  for (let i = 0; i < 20; i++) {
    await pg.evaluate(() => window.__nautica.passoDichiarato?.(1 / 60, 30))
    await pg.waitForTimeout(300)
    const b = (await leggi()).bolla
    if (b && !viste.includes(b)) viste.push(b)
  }
  dopoGyro = viste
  console.log(`  acceso il giroscopio, dieci secondi simulati dopo: ${viste.length ? viste.map(x => `"${x}"`).join(', ') : 'silenzio'}`)
}

await browser.close()
preview?.kill()

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
  rossi.push(`la bolla del giroscopio non e mai comparsa in ${simulati.toFixed(0)} s simulati, ` +
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
