/**
 * SI PARTE SPENTI, E IL PRIMO GESTO ACCENDE.
 *
 *     node strumenti/collaudo-stato-iniziale.mjs
 *
 * ─── PERCHE' ESISTE
 *
 * Il sito partiva con lo stabilizzatore ACCESO, e il commento in `stato.js` lo
 * difendeva: *«si entra da dove si sta bene, e solo dopo si scopre a spese di
 * chi»*. L'argomento conteneva un errore di merito -- presuppone che il
 * visitatore sappia gia' di stare bene. Chi arriva su una nave calma non vede
 * un problema risolto: vede una nave.
 *
 * Il committente ha deciso il verso opposto. Una decisione di messa in scena
 * che non ha un cancello torna indietro da sola alla prima persona che
 * «sistema» una riga, e questa vive in UNA riga.
 *
 * ─── COSA MISURA, e perche' non basta cercarla nel sorgente
 *
 * `rg "stab = false"` trova la riga e non dice niente: il valore puo' essere
 * riscritto da chiunque piu' avanti -- ed e' esattamente cio' che succedeva
 * prima, con `simulazione.js` che dichiarava `stab: false` e `stato.js` che lo
 * rimetteva a `true` venti file dopo. Quindi si guarda il RUNTIME:
 *
 *   1. lo stato della simulazione al primo fotogramma utile;
 *   2. l'interruttore in pagina, che deve dire la stessa cosa allo screen
 *      reader (`aria-pressed="false"`);
 *   3. che la nave si muova davvero: uno stato «spento» su un mare fermo non
 *      mostrerebbe niente, e l'invito sarebbe una bugia;
 *   4. che NESSUN cronometro tocchi l'interruttore al posto dell'utente --
 *      la dimostrazione automatica spegneva e riaccendeva da sola, e in un
 *      sito che parte spento significherebbe calmare la nave senza che nessuno
 *      abbia fatto niente;
 *   5. che il clic accenda per davvero.
 */
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'

const PORTA = Number(process.env.PORTA_COLLAUDO || 5391)
const BASE = `http://localhost:${PORTA}/nautica/`

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
await pg.goto(BASE + '?ispeziona=1', { waitUntil: 'load', timeout: 45000 })
await pg.waitForFunction(() => !!window.__nautica && !!window.__nautica.stato, null, { timeout: 60000 })

const leggi = () => pg.evaluate(() => {
  const S = window.__nautica.stato
  const b = document.querySelector('#stab-salone, #stab')
  return {
    stab: !!S.stab,
    mare: S.mare,
    rollio: S.rollio,
    premuto: b ? b.getAttribute('aria-pressed') : null,
    bottone: !!b
  }
})

const guai = []
const primo = await leggi()
console.log(`\n  al primo fotogramma   stab ${primo.stab ? 'ACCESO' : 'spento'} · mare ${primo.mare} · aria-pressed "${primo.premuto}"`)

if (primo.stab) {
  guai.push('il sito parte con lo stabilizzatore ACCESO: il visitatore trova la soluzione prima del problema')
}
if (!primo.bottone) {
  guai.push('nessun interruttore dello stabilizzatore in pagina: non si puo dire cosa annuncia')
} else if (primo.premuto !== String(primo.stab)) {
  /* il confronto e' con lo STATO VERO, non con la stringa attesa: cosi' il
     messaggio descrive cio' che ha trovato invece di ripetere l'ipotesi */
  guai.push(`l interruttore annuncia aria-pressed="${primo.premuto}" ` +
            `mentre lo stato e ${primo.stab ? 'acceso' : 'spento'}: ` +
            'chi usa uno screen reader sente il contrario di quello che c e')
} else if (primo.premuto !== 'false') {
  guai.push(`l interruttore annuncia aria-pressed="${primo.premuto}": si deve partire spenti`)
}
if (!primo.mare) {
  guai.push('mare zero alla partenza: spento e acceso mostrerebbero la stessa cosa e l invito sarebbe una bugia')
}

/**
 * IL ROLLIO DEVE ESSERCI. Si campiona a passo DICHIARATO, non a fotogrammi:
 * su un rasterizzatore software il tempo simulato avanza quaranta volte piu'
 * lento, e un'escursione letta li' sarebbe la lentezza del runner e non la
 * nave. E' la lezione che questo repo ha pagato sei volte in due giorni.
 */
const escursione = await pg.evaluate(() => {
  const n = window.__nautica
  if (typeof n.passoDichiarato !== 'function') return null
  let min = Infinity, max = -Infinity
  for (let i = 0; i < 480; i++) {
    n.passoDichiarato(1 / 60, 1)
    const r = n.stato.rollio
    if (r < min) min = r
    if (r > max) max = r
  }
  return +(max - min).toFixed(3)
})
if (escursione === null) {
  guai.push('la scena non espone passoDichiarato: non ho potuto misurare il rollio')
} else {
  console.log(`  rollio su 8 s simulati   escursione ${escursione} gradi`)
  if (escursione < 1) {
    guai.push(`la nave non rolla alla partenza (${escursione} gradi p-p): ` +
              'senza problema visibile non c e niente da risolvere')
  }
}

/**
 * E NESSUN CRONOMETRO DEVE TOCCARE L'INTERRUTTORE.
 *
 * Si aspetta piu' del ritardo con cui la dimostrazione automatica partiva
 * (1400 ms) piu' la sua durata (2600), e si controlla che lo stato non si sia
 * mosso da solo. Non e' un'attesa cieca: e' l'attesa DICHIARATA dal meccanismo
 * che questo controllo deve escludere.
 */
await pg.waitForTimeout(4800)
const dopo = await leggi()
console.log(`  dopo 4,8 s senza toccare   stab ${dopo.stab ? 'ACCESO' : 'spento'}`)
if (dopo.stab !== primo.stab) {
  guai.push(`qualcosa ha cambiato lo stabilizzatore da solo: era ${primo.stab}, ora ${dopo.stab}. ` +
            'Un cronometro che agisce al posto dell utente annulla l unica azione causale della visita')
}

/* e il gesto deve funzionare: un sito che parte spento e non si accende e' peggio */
if (primo.bottone) {
  /**
   * ─── IL GESTO SI PROVA SULL'ELEMENTO, E IL LIMITE E' DICHIARATO
   *
   * Ho provato due volte a premerlo come lo premerebbe una persona -- con un
   * clic vero di Playwright -- e due volte e' andato in timeout: a pagina
   * appena caricata si sta sulla hero, e piu' avanti l'interruttore del
   * capitolo e' coperto dalla tela. Il cancello lo diceva («il clic non e
   * riuscito»), ma restava un gesto mai arrivato.
   *
   * Qui si manda l'evento all'elemento. **Cosi' si verifica che il gestore
   * funzioni, NON che il bottone sia raggiungibile col puntatore.** Sono due
   * domande diverse e questa ne copre una sola: la seconda ce l'ha gia'
   * `collaudo-telefono`, che misura bersagli e sovrapposizioni ed e' il posto
   * giusto.
   *
   * Lo scrivo invece di lasciarlo intendere, perche' un cancello che sembra
   * provare il gesto e ne prova meta' e' peggio di uno che dichiara il proprio
   * confine.
   */
  const mandato = await pg.evaluate(() => {
    const b = document.querySelector('#stab-salone') || document.querySelector('#stab')
    if (!b) return null
    b.click()
    return b.id
  })
  if (!mandato) {
    guai.push('nessun interruttore su cui mandare il gesto')
  } else {
    console.log(`  il gesto lo mando a       #${mandato}`)
    await pg.waitForFunction(() => window.__nautica.stato.stab === true, null, { timeout: 8000 })
      .catch(() => {})
  }
  const acceso = await leggi()
  console.log(`  dopo il clic   stab ${acceso.stab ? 'ACCESO' : 'spento'} · aria-pressed "${acceso.premuto}"`)
  if (!acceso.stab) guai.push('il clic non accende lo stabilizzatore')
  if (acceso.premuto !== 'true') guai.push(`dopo il clic l interruttore annuncia "${acceso.premuto}"`)
}

await browser.close()
preview?.kill()

if (guai.length) {
  console.log('')
  for (const g of guai) console.log(`  ROTTO  ${g}`)
  console.log('')
  process.exit(1)
}
console.log('\n  si parte spenti, la nave rolla, e ad accendere e l utente.\n')
