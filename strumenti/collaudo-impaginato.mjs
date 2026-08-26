import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

/**
 * COLLAUDO DELL'IMPAGINATO — i riquadri non si devono sovrapporre.
 *
 *     node strumenti/collaudo-impaginato.mjs
 *     URL=http://localhost:5180/nautica/ node strumenti/collaudo-impaginato.mjs
 *
 * PERCHE' ESISTE.
 *
 * A 1280x720, alla battuta "calma", il paragrafo della didascalia copriva le
 * etichette ROLL e PEAK per una sessantina di pixel — un centinaio con
 * l'avviso "il sistema e' spento" acceso, che e' proprio lo stato in cui quella
 * battuta si trova piu' spesso.
 *
 * La causa non era una regola sbagliata: era una regola ASSENTE. In `stile.css`
 * esistevano due sole media query, `max-width: 820px` e
 * `prefers-reduced-motion`. **Nessuna su viewport bassi.** A 1280x720 la
 * finestra e' larga — quindi valgono le regole desktop — ma bassa, e niente
 * compensava. Un portatile da 13 pollici cade esattamente li'.
 *
 * L'ho trovato guardando un fotogramma, per caso, dopo mesi. Questo cancello lo
 * avrebbe trovato il primo giorno, e trovera' i prossimi: ogni schermata nuova
 * ci passa attraverso.
 *
 * COSA CONTROLLA, e perche' proprio questo:
 *   1. nessuna coppia di riquadri VISIBILI si interseca, a ogni battuta e a
 *      ogni viewport. Si guarda l'opacita' calcolata, non la presenza nel DOM:
 *      il sito nasconde i pannelli in alcune battute, e li' sovrapporsi non e'
 *      un difetto;
 *   2. niente overflow orizzontale;
 *   3. si prova con il sistema ACCESO e SPENTO, perche' l'avviso di stato
 *      allunga la didascalia ed e' li' che il difetto era peggiore.
 */

/**
 * SI CHIAMA `INDIRIZZO` E NON `URL` PER UNA RAGIONE PAGATA.
 *
 * `const URL = ...` **oscura il costruttore globale `URL`**, e la riga che
 * ricava la porta — `new URL(INDIRIZZO).port` — moriva con «URL is not a
 * constructor». Il difetto stava proprio nel ramo che accende la preview da
 * solo, cioe' quello che non avevo mai eseguito perche' una preview c'era
 * sempre. Un revisore esterno mi ha detto che il cancello non gira su un clone
 * pulito: aveva ragione, e questa era una delle due ragioni.
 */
const INDIRIZZO = process.env.URL || 'http://localhost:4174/nautica/'

/**
 * HEADLESS PER DIFETTO. Misurare un impaginato non ha bisogno di una finestra,
 * e `headless: false` non parte su una macchina senza schermo — cioe' in
 * integrazione continua, che e' proprio dove questo cancello deve girare.
 * (Nota: in headless il 3D viene disegnato via software e quindi e' brutto. Per
 * i RIQUADRI non cambia niente; per guardare la scena si usa `TESTA=1`.)
 */
const VISIBILE = process.env.TESTA ? false : true

const VIEWPORT = [
  { nome: 'desktop grande', width: 1920, height: 1080 },
  { nome: 'portatile 15"', width: 1440, height: 900 },
  { nome: 'portatile 14"', width: 1366, height: 768 },
  { nome: 'portatile 13"', width: 1280, height: 720 },   // e' qui che si rompeva
  { nome: 'telefono', width: 390, height: 844 }
]

/** Le battute stanno in regia.js: qui bastano le loro posizioni centrali. */
const PUNTI = [0.05, 0.18, 0.31, 0.50, 0.70, 0.92]

const RIQUADRI = ['#battuta', '.pannello--letture', '.pannello--energia', '.comandi', '.richiamo']

let guasti = 0
const esito = (ok, testo) => {
  console.log('  ' + (ok ? 'OK   ' : 'ROTTO') + '  ' + testo)
  if (!ok) guasti++
}

/**
 * IL CANCELLO DEVE GIRARE DA SOLO, o non e' un cancello.
 *
 * La prima stesura dava per scontate due cose e non lo diceva: una preview
 * gia' accesa, e Chrome installato. Chi ha clonato il repo si e' trovato uno
 * stack trace di Playwright — `ERR_CONNECTION_REFUSED`, oppure «Executable
 * doesn't exist» — e nessuna indicazione su cosa fare.
 *
 * `playwright-core` **non include nessun browser**, di progetto: e' scelto
 * apposta per usare il Chrome di sistema invece di scaricarne 300 MB. Quindi
 * `npx playwright install` NON risolve — serve `npx playwright install chrome`.
 * Un messaggio che manda a fare la cosa sbagliata e' peggio di nessun
 * messaggio.
 */
async function apriBrowser () {
  try {
  /**
   * QUALE BROWSER, e si puo' forzare.
 *
   * Di norma si usa il Chrome di sistema, perche' `playwright-core` non scarica
   * browser. Ma chi clona il progetto puo' avere solo il chromium di Playwright,
   * e un cancello che e' verde su un browser e rosso sull'altro non vale niente.
   * `CHROMIUM=1` forza quello interno, cosi' la differenza si puo' riprodurre
   * invece che discutere.
   */
    if (process.env.CHROMIUM) return await chromium.launch({ headless: VISIBILE })
    return await chromium.launch({ channel: 'chrome', headless: VISIBILE })
  } catch (e) {
    try {
      return await chromium.launch({ headless: VISIBILE })
    } catch (e2) {
      console.error(`
  ROTTO  nessun browser disponibile.

         Questo collaudo usa playwright-core, che di proposito NON scarica
         browser: si appoggia al Chrome di sistema. Una delle due:

             npx playwright install chrome      (lo installa Playwright)
             oppure installa Google Chrome

         Attenzione: "npx playwright install" da solo NON basta.
`)
      process.exit(1)
    }
  }
}

/** C'e' gia' qualcosa che risponde su quell'indirizzo? */
async function risponde (url) {
  try {
    const c = new AbortController()
    const t = setTimeout(() => c.abort(), 3000)
    const r = await fetch(url, { signal: c.signal })
    clearTimeout(t)
    return r.ok
  } catch { return false }
}

/**
 * Se la preview non c'e', la si accende — e la si spegne alla fine. Cosi'
 * `npm run collaudo:impaginato` funziona da un clone appena fatto, con un
 * comando solo, invece di richiedere un secondo terminale che nessuno ha
 * documentato.
 */
let preview = null
if (!(await risponde(INDIRIZZO))) {
  const porta = new URL(INDIRIZZO).port || '4173'
  console.log(`  la preview non risponde su ${INDIRIZZO} — la accendo io sulla ${porta}`)
  preview = spawn('npx', ['vite', 'preview', '--port', porta, '--strictPort'],
    { shell: true, stdio: 'ignore', cwd: fileURLToPath(new URL('..', import.meta.url)) })
  for (let i = 0; i < 40 && !(await risponde(INDIRIZZO)); i++) await new Promise(r => setTimeout(r, 500))
  if (!(await risponde(INDIRIZZO))) {
    console.error(`
  ROTTO  non riesco ad accendere la preview su ${INDIRIZZO}.
         Compila prima con "npm run build", oppure accendila a mano:
             npm run preview
`)
    preview.kill()
    process.exit(1)
  }
}

const b = await apriBrowser()
const collisioni = []
const traboccamenti = []
let overflow = []

for (const vp of VIEWPORT) {
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height } })
  const pg = await ctx.newPage()
  /**
   * `domcontentloaded` e non `networkidle`. La rete non si calma mai davvero
   * su una pagina che carica un motore 3D, e sotto carico l'attesa scadeva
   * dopo trenta secondi facendo fallire il collaudo per un motivo che non
   * c'entrava niente con l'impaginato. Si aspetta una CONDIZIONE VERA — la tela
   * che esiste — non un tempo morto.
   */
  await pg.goto(INDIRIZZO, { waitUntil: 'domcontentloaded' })
  await pg.evaluate(() => document.querySelector('#dimostrazione').scrollIntoView())
  await pg.waitForFunction(() => !!document.querySelector('#scena canvas'), null, { timeout: 20000 })
  await pg.waitForTimeout(1800)

  const g = await pg.evaluate(() => {
    const r = document.querySelector('#dimostrazione').getBoundingClientRect()
    return { top: r.top + scrollY, corsa: r.height - innerHeight }
  })

  for (const acceso of [false, true]) {
    if (acceso) {
      /**
       * Si torna a una battuta in cui il comando E' VIVO prima di premerlo.
       * La prima stesura cliccava dove capitava, cioe' dall'ultima posizione
       * del giro precedente — e all'ultima battuta il sito ritira i comandi
       * apposta (`opacity: 0; pointer-events: none`). Playwright li vedeva
       * ancora "visibili" e aspettava sessanta secondi che la tela smettesse di
       * intercettare il clic. Non era un difetto del sito: era il collaudo che
       * premeva un pulsante che il sito aveva gia' messo via.
       */
      await pg.evaluate(([t, c]) => scrollTo(0, t + 0.31 * c), [g.top, g.corsa])
      await pg.waitForTimeout(700)
      await pg.click('#stab')
      await pg.waitForTimeout(600)
    }
    for (const p of PUNTI) {
      await pg.evaluate(([t, c, q]) => scrollTo(0, t + q * c), [g.top, g.corsa, p])
      await pg.waitForTimeout(500)

      const esiti = await pg.evaluate((sel) => {
        const visibili = []
        for (const s of sel) {
          const e = document.querySelector(s)
          if (!e) continue
          const cs = getComputedStyle(e)
          // opacita' zero o nascosto = non e' a schermo, quindi non collide
          if (parseFloat(cs.opacity) < 0.05 || cs.visibility === 'hidden' || cs.display === 'none') continue
          const r = e.getBoundingClientRect()
          if (r.width < 1 || r.height < 1) continue
          /**
           * IL RIQUADRO NON E' L'INCHIOSTRO, e questo controllo esiste perche'
           * mi ci sono cascato. Con `min-height:0` dentro un flex la didascalia
           * si stringeva sotto la sua altezza naturale e il TESTO usciva fuori,
           * disegnandosi sopra le letture. I riquadri non si toccavano, il
           * collaudo diceva "zero sovrapposizioni", e lo schermo era
           * illeggibile. Un cancello che misura le scatole mente appena
           * qualcosa trabocca dalla sua.
           */
          const fuoriY = e.scrollHeight - e.clientHeight
          const fuoriX = e.scrollWidth - e.clientWidth
          /**
           * LA SOGLIA E' UNA RIGA DI TESTO, non un numero scelto a mano.
           *
           * La prima stesura segnalava qualunque sbordo sopra i 2 px e dava 70
           * falsi allarmi: erano tutti `.pannello--letture`, **5 px in
           * verticale e 0 in orizzontale**, cioe' le cifre con `line-height:
           * .94`. L'inchiostro esce dal riquadro per SCELTA tipografica, e un
           * cancello che grida per quello si impara a ignorarlo.
           *
           * Il difetto vero e' un altro: un elemento schiacciato sotto la sua
           * altezza naturale, con il testo che si disegna FUORI e sopra il
           * vicino. Quello sborda di righe intere — nel mio caso un centinaio
           * di pixel. Quindi la domanda giusta e' «e' uscita almeno una riga?»,
           * e la risposta si chiede al foglio di stile invece di indovinarla.
           */
          const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2 || 16
          visibili.push({ s, x: r.x, y: r.y, w: r.width, h: r.height, fuoriY, fuoriX, lh })
        }
        const urti = []
        for (let i = 0; i < visibili.length; i++) {
          for (let j = i + 1; j < visibili.length; j++) {
            const a = visibili[i], c = visibili[j]
            const dx = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x)
            const dy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y)
            // due pixel di tolleranza: i bordi che si sfiorano non sono un difetto
            // si riportano ENTRAMBE le dimensioni: la prima stesura stampava solo
            // quella verticale, e leggendo "68px" si andava a cercare un difetto
            // di altezza quando il difetto era di larghezza
            if (dx > 2 && dy > 2) urti.push({ a: a.s, b: c.s, dx: Math.round(dx), dy: Math.round(dy) })
          }
        }
        return {
          urti,
          traboccati: visibili.filter(v => v.fuoriY > v.lh * 0.9 || v.fuoriX > 8)
            .map(v => `${v.s} — ${v.fuoriY}px fuori, cioe' ${(v.fuoriY / v.lh).toFixed(1)} righe`),
          battuta: document.querySelector('.palco').dataset.battuta,
          largo: document.documentElement.scrollWidth,
          visto: document.documentElement.clientWidth
        }
      }, RIQUADRI)

      for (const u of esiti.urti) {
        collisioni.push(`${vp.nome} ${vp.width}x${vp.height} · battuta ${esiti.battuta} · sistema ${acceso ? 'acceso' : 'spento'} · ${u.a} ⨯ ${u.b} — sovrapposti ${u.dx}px in orizzontale e ${u.dy}px in verticale`)
      }
      for (const t of esiti.traboccati) {
        traboccamenti.push(`${vp.nome} ${vp.width}x${vp.height} · battuta ${esiti.battuta} · sistema ${acceso ? 'acceso' : 'spento'} · ${t}`)
      }
      if (esiti.largo > esiti.visto + 1) {
        overflow.push(`${vp.nome} · battuta ${esiti.battuta} · ${esiti.largo}px contro ${esiti.visto}`)
      }
    }
  }
  await ctx.close()
  console.log(`  provato ${vp.nome.padEnd(16)} ${String(vp.width).padStart(4)}x${vp.height}`)
}
await b.close()

console.log('\nI RIQUADRI NON SI DEVONO SOVRAPPORRE')
if (collisioni.length) collisioni.slice(0, 12).forEach(c => console.log('         ' + c))
if (collisioni.length > 12) console.log(`         ...e altre ${collisioni.length - 12}`)
esito(collisioni.length === 0, `${collisioni.length} sovrapposizioni su ${VIEWPORT.length} viewport x ${PUNTI.length} battute x 2 stati`)

console.log('\nE IL CONTENUTO NON DEVE USCIRE DAL SUO RIQUADRO')
if (traboccamenti.length) [...new Set(traboccamenti)].slice(0, 8).forEach(t => console.log('         ' + t))
esito(traboccamenti.length === 0, `${traboccamenti.length} elementi con contenuto che trabocca`)

console.log('\nNIENTE OVERFLOW ORIZZONTALE')
overflow.forEach(o => console.log('         ' + o))
esito(overflow.length === 0, `${overflow.length} viewport con scorrimento laterale`)

preview?.kill()

console.log('\n' + (guasti === 0 ? 'TUTTO A POSTO' : guasti + ' CONTROLLI ROTTI') + '\n')
process.exit(guasti === 0 ? 0 : 1)
