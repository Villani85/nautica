import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { apriBrowser } from '../../strumenti/browser.mjs'

/**
 * ═══ LA MISURA DELL'ACQUA
 *
 * Guida `riferimenti/acqua/banco.html` e stampa, per ogni inquadratura, il
 * dettaglio e la superficie piatta PRIMA e DOPO il pass a corto raggio, piu'
 * il costo in millisecondi per fotogramma.
 *
 *   node riferimenti/acqua/misura.mjs               (browser nascosto)
 *   node riferimenti/acqua/misura.mjs --visibile    (con la finestra, per guardare)
 *   node riferimenti/acqua/misura.mjs --scatti      (salva i PNG di confronto)
 *
 * ─── PERCHE' UN SERVER TUTTO SUO
 *
 * Perche' il banco importa `src/scena/acqua.js` col suo `import 'three'`, che
 * solo vite risolve. E su una porta diversa da quella di sviluppo, cosi' la
 * misura non litiga con la sessione aperta di chi sta lavorando.
 *
 * ─── E PERCHE' HEADLESS NON BASTA A DIRE IL COSTO
 *
 * Chrome senza finestra disegna in software (SwiftShader), e un rasterizzatore
 * software paga il costo del frammento molto piu' caro di una GPU. Il numero
 * assoluto che esce da li' non e' il costo sul sito: e' un limite superiore.
 * Il RAPPORTO prima/dopo resta indicativo, ma se serve il costo vero va usato
 * `--visibile`, che apre una finestra e quindi usa la scheda.
 */

const QUI = dirname(fileURLToPath(import.meta.url))
const RADICE = resolve(QUI, '..', '..')
const PORTA = 5199
const VISIBILE = process.argv.includes('--visibile')
const SCATTI = process.argv.includes('--scatti')

/** L'obiettivo dichiarato: da radente, superficie piatta sotto il 25%. */
const TETTO_PIATTA = 25.0

/**
 * ─── SI ASPETTA LA PORTA, NON UNA RIGA DI TESTO
 *
 * La prima stesura aspettava «Local: http…» sullo stdout di `npx`. Su Windows
 * `npx` gira dentro una shell che non ripropaga lo stdout del figlio, e il
 * banco moriva in timeout dicendo «vite non ha risposto» mentre vite era vivo
 * e serviva 200. Il testimone stava dalla parte sbagliata: si misura il
 * SERVIZIO, non il messaggio che il servizio dice di aver dato.
 *
 * E se la porta risponde gia', non si avvia niente: chi sta lavorando puo'
 * tenere il suo server acceso.
 */
const rispondeGia = async () => {
  try { return (await fetch(`http://localhost:${PORTA}/`)).ok } catch { return false }
}

async function avviaVite () {
  if (await rispondeGia()) { console.log('  (la porta ' + PORTA + ' risponde gia: riuso quel server)'); return null }
  const p = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['vite', '--port', String(PORTA), '--strictPort'],
    { cwd: RADICE, env: { ...process.env, BASE: '/' }, shell: process.platform === 'win32', stdio: 'ignore' })
  for (let i = 0; i < 240; i++) {
    await new Promise(r => setTimeout(r, 500))
    if (await rispondeGia()) return p
  }
  p.kill()
  throw new Error('vite non ha aperto la porta ' + PORTA + ' in 120 s')
}

const n3 = (v) => String(v).padStart(6)
const n1 = (v) => String(v.toFixed ? v.toFixed(1) : v).padStart(5)

let guasti = 0
const esito = (ok, testo) => {
  console.log('  ' + (ok ? 'OK   ' : 'ROTTO') + '  ' + testo)
  if (!ok) guasti++
}

const vite = await avviaVite()
const browser = await apriBrowser({ visibile: VISIBILE })
let codice = 1
/**
 * GLI ERRORI DELLA PAGINA VIVONO FUORI DAL `try`, e non e' pignoleria.
 *
 * Tenendoli dentro, la prima corsa rotta ha stampato «Timeout 30000ms
 * exceeded» e nascosto la causa vera, che stava nella consolle a una riga di
 * distanza: un apostrofo inverso dentro un letterale di shader spezzava il
 * modulo. Il referto diceva la conseguenza e taceva il motivo — lo stesso
 * difetto di forma che `strumenti/browser.mjs` racconta per l'avvio.
 */
const errori = []
try {
  const pagina = await browser.newPage({ viewport: { width: 1200, height: 800 } })
  pagina.on('pageerror', (e) => errori.push(String(e)))
  pagina.on('console', (m) => { if (m.type() === 'error') errori.push(m.text()) })

  await pagina.goto(`http://localhost:${PORTA}/riferimenti/acqua/banco.html`, { waitUntil: 'load' })
  await pagina.waitForFunction('window.__banco && window.__banco.pronto', null, { timeout: 30000 })

  /**
   * IL RIFERIMENTO PRIMA DI TUTTO. Se la clip non si carica, i due numeri
   * dell'acqua restano leggibili ma perdono la loro classe: si dice, non si
   * finge che ci sia.
   */
  let rif = null
  try { rif = await pagina.evaluate('window.__banco.girato()') } catch (e) {
    console.log('\n  (il mare girato non si e caricato: ' + String(e).split('\n')[0] + ')')
  }

  const pose = ['fuori', 'radente-sole', 'radente-spalle']
  const tab = {}
  for (const posa of pose) {
    tab[posa] = {
      originale: await pagina.evaluate(`window.__banco.campiona('originale','${posa}')`),
      prima: await pagina.evaluate(`window.__banco.campiona('prima','${posa}')`),
      dopo: await pagina.evaluate(`window.__banco.campiona('dopo','${posa}')`)
    }
  }

  const sfar = {}
  for (const posa of pose) {
    sfar[posa] = {
      prima: await pagina.evaluate(`window.__banco.sfarfallio('prima','${posa}')`),
      dopo: await pagina.evaluate(`window.__banco.sfarfallio('dopo','${posa}')`)
    }
  }
  let sfarRif = null
  if (rif) {
    try { sfarRif = await pagina.evaluate('window.__banco.sfarfallioGirato()') } catch (e) { /* gia detto sopra */ }
  }

  const costi = {
    radente: await pagina.evaluate("window.__banco.costo('radente-sole')"),
    fuori: await pagina.evaluate("window.__banco.costo('fuori')")
  }

  /**
   * ─── E LA MEZZA IMMAGINE CHE LA FASCIA DICHIARATA NON GUARDA
   *
   * La fascia 12-30 e' acqua per costruzione, ed e' li' che l'obiettivo del
   * 25% va letto. Ma da 3,6 m il piano d'acqua e' largo 46 unita' e FINISCE
   * prima dell'orizzonte: fra la riga e il bordo del piano resta una fascia di
   * fondo CSS, piatta per definizione, che nel sito sarebbe la parte alta del
   * finestrone. Misurarla insieme al resto confonderebbe due difetti diversi;
   * non misurarla affatto sarebbe scegliere l'inquadratura.
   */
  const meta = {}
  for (const posa of ['radente-sole', 'radente-spalle']) {
    meta[posa] = await pagina.evaluate(
      `window.__banco.campiona('dopo','${posa}',{regione:[0,0.5,1,1]})`)
  }

  if (SCATTI) {
    mkdirSync(resolve(QUI, 'scatti'), { recursive: true })
    for (const posa of pose) {
      for (const quale of ['prima', 'dopo']) {
        await pagina.evaluate(`(()=>{window.__banco.disegna('${quale}','${posa}',12,4);})()`)
        const el = await pagina.$('#palco')
        await el.screenshot({ path: resolve(QUI, 'scatti', `${posa}-${quale}.png`) })
      }
    }
    console.log('\n  scatti in riferimenti/acqua/scatti/')
  }

  console.log('\nDENTRO LA REGIONE DICHIARATA — dettaglio (livelli/pixel) e superficie piatta')
  console.log('                          dettaglio                 superficie piatta')
  console.log('                    orig.   prima    dopo      orig.   prima    dopo')
  for (const posa of pose) {
    const o = tab[posa].originale, a = tab[posa].prima, b = tab[posa].dopo
    console.log('  ' + posa.padEnd(16) +
      n3(o.dettaglio.toFixed(2)) + '  ' + n3(a.dettaglio.toFixed(2)) + '  ' + n3(b.dettaglio.toFixed(2)) +
      '   ' + n1(o.piatta) + '%  ' + n1(a.piatta) + '%  ' + n1(b.piatta) + '%')
  }
  if (rif) {
    console.log('  ' + 'mare girato'.padEnd(16) + n3(rif.dettaglio.toFixed(2)) + '       -       -   ' +
      n1(rif.piatta) + '%      -       -')
  }
  console.log('  orig. = l acqua di partenza; prima = quella senza il pass ma col coperchio')
  console.log('  della scatola gia tolto; dopo = con il pass. Le prime due devono coincidere')
  console.log('  da fuori: se non lo fanno, il coperchio contava.')

  console.log("\nE TUTTA LA META' BASSA DEL FOTOGRAMMA, fascia dichiarata compresa")
  for (const posa of ['radente-sole', 'radente-spalle']) {
    console.log('  ' + posa.padEnd(18) + 'dettaglio ' + meta[posa].dettaglio.toFixed(2) +
      '   piatta ' + meta[posa].piatta.toFixed(1) + '%')
  }
  console.log('  la differenza col numero qui sopra e la fascia fra la riga e il bordo del')
  console.log('  piano d acqua, che a 46 unita di lato finisce prima dell orizzonte.')

  console.log('\nLO SFARFALLIO — quanto cambia lo stesso pixel in 1/60 di secondo')
  for (const posa of pose) {
    console.log('  ' + posa.padEnd(18) + 'prima ' + n1(sfar[posa].prima) + '   dopo ' + n1(sfar[posa].dopo))
  }
  if (sfarRif !== null) {
    console.log('  ' + 'mare girato'.padEnd(18) + '           ' + n1(sfarRif) + '   (a 1/30, il suo passo)')
    console.log('  il girato NON e un tetto: inquadra un mare lontano, a una scala diversa')
    console.log('  dalla fascia 12-30 di questo banco. Sta qui come ordine di grandezza.')
  }

  console.log('\nLA TINTA SOTTO LA LINEA — la giunzione col fondo CSS non si deve spostare')
  for (const posa of pose) {
    console.log('  ' + posa.padEnd(18) + 'prima ' + JSON.stringify(tab[posa].prima.sottoLaLinea) +
      '   dopo ' + JSON.stringify(tab[posa].dopo.sottoLaLinea))
  }

  console.log('\nIL COSTO — millisecondi per fotogramma, sincronizzati con la GPU')
  console.log('  radente   prima ' + costi.radente.prima + ' ms   dopo ' + costi.radente.dopo + ' ms   ' +
    '(' + (costi.radente.dopo / costi.radente.prima).toFixed(2) + '×)')
  console.log('  da fuori  prima ' + costi.fuori.prima + ' ms   dopo ' + costi.fuori.dopo + ' ms   ' +
    '(' + (costi.fuori.dopo / costi.fuori.prima).toFixed(2) + '×)')
  console.log('  prima e dopo si alternano a ogni fotogramma e si legge il decimo percentile:')
  console.log('  a tratti lunghi, questa macchina ha dato 4,2 e 16,4 ms per la stessa acqua.')
  /**
   * ─── CON LA FINESTRA IL NUMERO NON E' DELLO SHADER, E' DELLO SCHERMO
   *
   * Misurato: con `--visibile` sono usciti 21,5 ms prima e 16,5 dopo, cioe' un
   * pass in piu' che costa MENO di zero. Non e' un miracolo: e' il compositore
   * che consegna i fotogrammi al ritmo del monitor, e a quel punto si sta
   * cronometrando il monitor. Sedici millisecondi e mezzo sono un ritmo, non
   * un costo.
   *
   * Quindi la finestra serve a GUARDARE, non a misurare, e il cancello sul
   * costo si legge solo senza finestra — dove il rasterizzatore software
   * esagera il costo del frammento e quindi da' un limite superiore, che e' il
   * verso giusto in cui sbagliare.
   */
  const APPESO_AL_MONITOR = VISIBILE
  console.log('  ' + (APPESO_AL_MONITOR
    ? 'CON finestra: questi millisecondi sono il ritmo del monitor, non il costo. Non contano.'
    : 'SENZA finestra: e SwiftShader, cioe un LIMITE SUPERIORE. E il numero che conta.'))

  console.log('\nI CANCELLI')
  const peggiore = Math.max(tab['radente-sole'].dopo.piatta, tab['radente-spalle'].dopo.piatta)
  esito(peggiore < TETTO_PIATTA,
    'da radente la superficie piatta sta sotto il ' + TETTO_PIATTA + '% (peggiore delle due pose: ' +
    peggiore.toFixed(1) + '%)')
  esito(tab['radente-spalle'].dopo.dettaglio > tab['radente-spalle'].prima.dettaglio * 1.4,
    'e il dettaglio da radente e cresciuto di almeno il 40% (da ' +
    tab['radente-spalle'].prima.dettaglio.toFixed(2) + ' a ' +
    tab['radente-spalle'].dopo.dettaglio.toFixed(2) + ')')
  /* La vista da fuori non deve peggiorare: si chiede che non perda dettaglio.
     Non che ne guadagni — non e' il suo compito, e guadagnarne li' vorrebbe
     dire aver sporcato la fascia dell'orizzonte. */
  esito(tab.fuori.dopo.dettaglio >= tab.fuori.prima.dettaglio * 0.95,
    'da fuori il dettaglio non e calato (' + tab.fuori.prima.dettaglio.toFixed(2) + ' -> ' +
    tab.fuori.dopo.dettaglio.toFixed(2) + ')')
  const dTinta = Math.max(...tab.fuori.dopo.sottoLaLinea.map((v, i) =>
    Math.abs(v - tab.fuori.originale.sottoLaLinea[i])))
  esito(dTinta < 6,
    'e la tinta sotto la linea non si e spostata di piu di 6 livelli (' + dTinta.toFixed(1) + ')')
  /* Il confronto che conta per la vista da fuori e' contro l'ORIGINALE, non
     contro il ramo `dettaglio:false`: il coperchio tolto alla scatola sommersa
     vale per tutti e due i rami, e un A/B non vede cio' che ha in comune. */
  const dFuori = Math.abs(tab.fuori.dopo.dettaglio - tab.fuori.originale.dettaglio)
  const dFuoriPiatta = Math.abs(tab.fuori.dopo.piatta - tab.fuori.originale.piatta)
  esito(dFuori < 0.15 && dFuoriPiatta < 2.0,
    'e contro l ACQUA ORIGINALE — coperchio compreso — la vista da fuori non si e mossa (' +
    tab.fuori.originale.dettaglio.toFixed(2) + ' -> ' + tab.fuori.dopo.dettaglio.toFixed(2) +
    ', ' + tab.fuori.originale.piatta.toFixed(1) + '% -> ' + tab.fuori.dopo.piatta.toFixed(1) + '%)')
  /**
   * ─── COME SI DISTINGUE IL MOTO DAL FORMICOLIO, senza un'opinione
   *
   * Il primo tentativo di cancello confrontava il nostro sfarfallio con quello
   * del mare girato e lo bocciava (2,47 contro 1,35). Il confronto pero' non
   * regge: la clip inquadra un mare LONTANO attraverso un vetro, a una scala
   * diversa dalla fascia 12-30 di questo banco. Stavo usando come tetto un
   * numero che misura un'altra cosa — ed e' lo stesso errore che ha ucciso
   * 0-bis, un numero giusto letto come se rispondesse a un'altra domanda.
   *
   * Il criterio che distingue davvero e' interno alla misura: **il moto
   * coerente cresce col tempo, il formicolio no.** Raddoppiando il passo, una
   * superficie che si muove raddoppia la sua differenza; una che aliasa e'
   * gia' scorrelata a un fotogramma e resta li'. Quindi si chiede che il
   * rapporto fra 2/60 e 1/60 stia vicino a 2, e non serve nessun mare di
   * riferimento per leggerlo.
   */
  const sfarDoppio = {}
  for (const posa of ['radente-sole', 'radente-spalle']) {
    sfarDoppio[posa] = await pagina.evaluate(
      `window.__banco.sfarfallio('dopo','${posa}',{dt:${2 / 60}})`)
  }
  const rapporti = ['radente-sole', 'radente-spalle'].map(p => sfarDoppio[p] / sfar[p].dopo)
  esito(Math.min(...rapporti) > 1.6,
    'e cio che si muove e MOTO, non formicolio: raddoppiando il passo la ' +
    'differenza cresce di ' + rapporti.map(r => r.toFixed(2)).join(' e ') + ' volte (minimo 1,6)')
  if (APPESO_AL_MONITOR) {
    console.log('  --     il costo non si giudica con la finestra aperta: rileggilo senza --visibile')
  } else {
    esito(costi.radente.dopo < costi.radente.prima * 2.0,
      'il costo per fotogramma non raddoppia (' + (costi.radente.dopo / costi.radente.prima).toFixed(2) + '×)')
  }

  if (errori.length) {
    console.log('\nERRORI DALLA PAGINA')
    for (const e of errori.slice(0, 8)) console.log('  ' + e)
    guasti++
  }

  writeFileSync(resolve(QUI, 'misura.json'),
    JSON.stringify({
      quando: new Date().toISOString(), visibile: VISIBILE,
      riferimento: rif, sfarfallioGirato: sfarRif, pose: tab, metaBassa: meta,
      sfarfallio: sfar, costi
    }, null, 2) + '\n')

  console.log('\n' + (guasti === 0 ? 'TUTTO A POSTO' : guasti + ' CONTROLLI ROTTI') + '\n')
  codice = guasti === 0 ? 0 : 1
} catch (e) {
  console.error('\n  LA MISURA NON E ARRIVATA IN FONDO:\n  ' + String(e).split('\n').slice(0, 4).join('\n  '))
  for (const x of errori.slice(0, 6)) console.error('  dalla pagina: ' + x.split('\n').slice(0, 4).join('\n    '))
  console.error('')
  codice = 2
} finally {
  await browser.close().catch(() => {})
  if (vite) {
    vite.kill()
    // su Windows npx lascia il figlio: si chiude l'albero
    if (process.platform === 'win32' && vite.pid) {
      spawn('taskkill', ['/pid', String(vite.pid), '/t', '/f'], { stdio: 'ignore' })
    }
  }
}
process.exit(codice)
