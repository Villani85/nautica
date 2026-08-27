import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'

/**
 * LA MANOPOLA COMANDA IL MECCANISMO, E SI PROVA NEL PRIMO PIANO.
 *
 * --- IL DIFETTO PER CUI ESISTE
 *
 * `stile.css` mandava `.comandi` a `opacity:0;pointer-events:none` sulle due
 * battute del primo piano. La catena fisica era intatta -- manopola -> stato
 * del mare -> integratore -> rollio -> angolo di pinna -> albero, riduttore,
 * dischi -- ma nel momento in cui la camera arrivava sul meccanismo, la mano
 * spariva. Il sito diventava un filmato esattamente dove aveva piu' da
 * dimostrare.
 *
 * Il committente l'ha detto meglio di qualunque referto:
 *
 *   "questi devono avere la possibilita' di muoversi, altrimenti avrei fatto
 *    un filmato"
 *   "cioe' sono io che regolo il mare -- il meccanismo sotto in base alla
 *    manopola si muove"
 *   "deve in sostanza far vedere qualcosa che non vedrebbe mai, come il
 *    funzionamento"
 *
 * L'ultima e' la tesi del sito in una riga: la cosa che nessuno vede mai e' un
 * meccanismo che LAVORA dentro uno scafo, e non serve a niente mostrarla se
 * non risponde a chi guarda.
 *
 * --- PERCHE' NESSUN CANCELLO L'AVEVA PRESO
 *
 * Perche' non c'era niente di rotto. Nessuna eccezione, nessun errore di
 * shader, nessun numero fuori tolleranza, e un'inquadratura anzi piu' pulita.
 * E' la classe di difetto peggiore che questo repo abbia incontrato: una
 * DECISIONE DI REGIA CHE CANCELLA L'INTERATTIVITA' SENZA ROMPERE NIENTE.
 * Si trova in un modo solo -- provando a usare il sito da dentro la battuta.
 *
 * --- COSA MISURA
 *
 *   1. che i comandi siano RAGGIUNGIBILI sul meccanismo: non solo visibili,
 *      ma colpiti davvero da `elementFromPoint`;
 *   2. che l'interruttore accenda il meccanismo: da fermo a in moto;
 *   3. che la manopola del mare lo faccia LAVORARE DI PIU': si confronta
 *      l'escursione dell'albero d'ingresso fra mare 2 e mare 5.
 *
 * Non misura millisecondi: misura ampiezze angolari e rapporti fra ampiezze.
 *
 * --- TRE ERRORI DELLA PRIMA STESURA, TUTTI ISTRUTTIVI
 *
 * La prima versione di questo file era rossa, e per le ragioni sbagliate.
 * Restano scritti perche' sono modi di sbagliare, non incidenti.
 *
 * 1. CERCAVA LA BATTUTA E TROVAVA IL NOME DELLA BATTUTA. `data-battuta` resta
 *    a "meccanismo" dal 36% di scorrimento fino al 100%, ma il palco e'
 *    `sticky` e dal 44% scivola via: al 60% stava a `top=-2028`, cioe' fuori
 *    dallo schermo. Il cancello misurava una scena che non era in pagina.
 *    Adesso la battuta si cerca chiedendo ANCHE dove sta il palco.
 *
 * 2. IL TESTIMONE DI VITALITA' STAVA DALLA PARTE SBAGLIATA. Sapevo gia' che
 *    "fermo" e "non disegnato" si leggono identici, e avevo messo il controllo:
 *    solo, guardava il ROLLIO. Ma la simulazione continua a girare anche
 *    quando la scena non viene aggiornata, quindi giurava che tutto fosse vivo
 *    mentre l'albero stava a zero perche' nessuno lo muoveva piu'.
 *    **Il testimone deve stare dalla parte della cosa misurata**: si misura
 *    cio' che viene disegnato, quindi a dire che si disegna dev'essere il
 *    contatore dei fotogrammi.
 *
 * 3. CLICCAVA CON `pagina.click`, CHE PORTA L'ELEMENTO IN VISTA. Un clic di
 *    Playwright ha spostato lo scorrimento da 9798 a 4505: il cancello si
 *    muoveva da solo fra un campione e l'altro. Adesso si verifica a mano che
 *    il bersaglio sia in quadro e colpibile, e poi si clicca col mouse alle
 *    sue coordinate -- che e' anche piu' onesto, perche' e' quello che fa una
 *    mano.
 */

/**
 * --- LA PORTA SI PUO' CAMBIARE, E SERVE PIU' DI QUANTO SEMBRI
 *
 * Tutti i collaudi che aprono un browser usavano la 5180 e la cercavano gia'
 * accesa. Con un solo collaudo alla volta -- in CI, sempre -- e' giusto cosi'.
 * In locale, con piu' processi che misurano insieme, diventa una risorsa
 * contesa: il primo che finisce spegne il server sotto chi sta ancora
 * campionando, e Playwright riferisce `Execution context was destroyed, most
 * likely because of a navigation`. E' successo tre volte, e nessuna delle tre
 * il messaggio nominava la causa.
 *
 * `PORTA_COLLAUDO=5181 npm run collaudo` da' a questa corsa un server suo.
 */
const PORTA = Number(process.env.PORTA_COLLAUDO) || 5180
const BASE = `http://localhost:${PORTA}/nautica/`

/**
 * ~1,5 s a 60 Hz.
 *
 * Qui c'era scritto "abbastanza per due periodi di rollio", ed era falso: il
 * periodo di rollio dichiarato e' 7 secondi, quindi 1,5 s ne sono un quinto.
 * Segnalato da una revisione che ha confrontato il commento col numero.
 *
 * La finestra va bene lo stesso, ma per un'altra ragione, e vale la pena
 * scriverla giusta: non si misura il rollio, si misura L'ALBERO D'INGRESSO,
 * che gira 29 volte piu' in fretta per via del riduttore. In un quinto di
 * periodo di rollio l'albero fa quasi sei giri -- piu' che abbastanza per
 * un'escursione picco-picco che significhi qualcosa.
 */
const FOTOGRAMMI = 90

/**
 * Da mare 2 (6 gradi nominali) a mare 5 (15) il rollio nudo cresce di 2,5
 * volte. L'escursione della pinna cresce meno, perche' il controllore satura.
 * La soglia sta sotto il valore misurato ma ben sopra 1: deve poter fallire
 * se qualcuno ricongela i comandi o scollega la catena.
 */
const CRESCITA_MIN = 1.30

/** Sotto questa escursione (radianti sull'albero veloce) il meccanismo e' fermo. */
const FERMO = 0.02

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
  console.error('il server non si e alzato')
  process.exit(2)
}

/**
 * --- NON SI SPEGNE UN SERVER CHE STA SERVENDO QUALCUN ALTRO
 *
 * Con piu' collaudi in parallelo -- e in questa sessione ce n'erano quindici,
 * fra agenti e sessione principale -- tutti trovano `npm run preview` gia'
 * acceso sulla 5180 e lo riusano, come e' giusto. Poi il primo che finisce lo
 * UCCIDE, e chi sta ancora campionando muore con
 * `page.evaluate: Execution context was destroyed`.
 *
 * E' successo davvero, due volte, e il messaggio parla di navigazione: la
 * causa vera -- un altro processo che ha spento il server -- non compare da
 * nessuna parte. Un guasto che nomina la conseguenza e non la causa.
 *
 * `TIENI_SERVER=1` lo lascia acceso. Serve in locale quando si lancia piu' di
 * un collaudo insieme; in CI non si mette, e il server muore con la corsa.
 */
const TIENI_SERVER = !!process.env.TIENI_SERVER

const guai = []
const nota = (t) => { console.log('   ' + t) }

const server = await serviteci()
const browser = await apriBrowser()
const pagina = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  reducedMotion: 'no-preference'
})
pagina.on('pageerror', e => guai.push('eccezione: ' + String(e).slice(0, 200)))

const finisci = async (codice) => {
  await browser.close()
  if (!TIENI_SERVER) server?.kill()
  process.exit(codice)
}

await pagina.goto(BASE + '?ispeziona=1', { waitUntil: 'load' })
await pagina.waitForFunction(() => window.__nautica && window.__nautica.scena, null, { timeout: 60000 })
await pagina.waitForFunction(
  () => !!window.__nautica.scena.getObjectByName('RIG_INPUT'),
  null, { timeout: 60000 })

/* --- 1 - IL PRIMO PIANO E' DOVE LA BATTUTA E IL PALCO SONO D'ACCORDO ----- */

const vaiA = (f) => pagina.evaluate(async (f) => {
  const h = document.documentElement.scrollHeight - window.innerHeight
  window.scrollTo(0, Math.round(h * f))
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  const palco = document.querySelector('.palco[data-battuta]')
  const b = palco.getBoundingClientRect()
  return {
    battuta: palco.dataset.battuta,
    // "in quadro" per davvero: il palco e' alto quanto la finestra, quindi
    // sopra lo zero vuol dire che sta gia' uscendo dal bordo alto
    inQuadro: b.top > -1 && b.bottom > window.innerHeight - 1
  }
}, f)

const dentro = []
for (let f = 0.20; f <= 0.70001; f += 0.01) {
  const r = await vaiA(f)
  if (r.battuta === 'meccanismo' && r.inQuadro) dentro.push(f)
}
if (!dentro.length) {
  console.error('')
  console.error('  IL PRIMO PIANO DEL MECCANISMO NON ESISTE.')
  console.error('  Nessuna posizione di scorrimento fra il 20% e il 70% ha insieme')
  console.error('  la battuta "meccanismo" e il palco dentro la finestra.')
  console.error('')
  await finisci(2)
}
const posto = dentro[Math.floor(dentro.length / 2)]
nota(`il primo piano vive fra ${(dentro[0] * 100).toFixed(0)}% e ${(dentro[dentro.length - 1] * 100).toFixed(0)}% ` +
     `di scorrimento; misuro al ${(posto * 100).toFixed(0)}%`)
await vaiA(posto)

// i comandi hanno una transizione di opacita': si aspetta che finisca
// guardando il valore, non l'orologio
await pagina.waitForFunction(
  () => +getComputedStyle(document.querySelector('.comandi')).opacity > 0.95,
  null, { timeout: 5000 }
).catch(() => {})

/* --- 2 - I COMANDI DEVONO ESSERE RAGGIUNGIBILI, NON SOLO PRESENTI ------- */

const bersaglio = (sel, nome) => pagina.evaluate(([sel, nome]) => {
  const el = document.querySelector(sel)
  if (!el) return { nome, c: 'non esiste nel documento' }
  const st = getComputedStyle(el)
  const b = el.getBoundingClientRect()
  const x = b.left + b.width / 2
  const y = b.top + b.height / 2
  const sopra = document.elementFromPoint(x, y)
  const colpito = !!sopra && (sopra === el || el.contains(sopra))
  const inQuadro = b.width > 0 && b.height > 0 &&
    y > 0 && y < window.innerHeight && x > 0 && x < window.innerWidth
  return {
    nome,
    x,
    y,
    c: (+st.opacity < 0.1) ? `trasparente (opacity ${st.opacity})`
      : (st.pointerEvents === 'none') ? 'non riceve il puntatore'
        : !inQuadro ? `fuori dalla finestra (centro a y=${Math.round(y)})`
          : !colpito ? `coperto da "${sopra ? (sopra.className || sopra.tagName) : 'niente'}"` : null
  }
}, [sel, nome])

const MARE_ALTO = '.mare__tacca:nth-of-type(6)'   // stato 5
const MARE_BASSO = '.mare__tacca:nth-of-type(3)'  // stato 2

const mani = {}
for (const [sel, nome] of [
  [MARE_ALTO, 'manopola del mare, stato 5'],
  [MARE_BASSO, 'manopola del mare, stato 2'],
  ['#stab', 'interruttore di stabilizzazione'],
  ['#velocita', 'andatura']
]) {
  const r = await bersaglio(sel, nome)
  mani[sel] = r
  if (r.c) guai.push(`sul meccanismo, "${nome}": ${r.c}`)
  else nota(`raggiungibile: ${nome}`)
}

if (guai.length) {
  console.error('')
  console.error('  I COMANDI NON SI RAGGIUNGONO NEL PRIMO PIANO:')
  console.error('')
  for (const g of guai) console.error('   - ' + g)
  console.error('')
  console.error('  Da questa battuta in giu il sito e un filmato: si guarda e non si tocca.')
  console.error('')
  await finisci(1)
}

/** Un clic che NON porta l'elemento in vista: e' gia' in vista, si e' misurato. */
const tocca = async (sel) => {
  const b = mani[sel] || await bersaglio(sel, sel)
  await pagina.mouse.click(b.x, b.y)
}

/* --- 3 - CAMPIONARE IL LAVORO DEL MECCANISMO ---------------------------- */

/**
 * Escursione picco-picco dell'albero d'ingresso su N fotogrammi, insieme al
 * numero di fotogrammi DISEGNATI nello stesso intervallo: senza quello,
 * "meccanismo fermo" e "scena non aggiornata" sono lo stesso numero.
 */
const campiona = (n) => pagina.evaluate((n) => new Promise((res) => {
  const nodo = window.__nautica.scena.getObjectByName('RIG_INPUT')
  const primo = window.__nautica.fotogrammi
  let aMin = Infinity, aMax = -Infinity, i = 0
  const passo = () => {
    const a = nodo.rotation.x
    if (a < aMin) aMin = a
    if (a > aMax) aMax = a
    if (++i < n) requestAnimationFrame(passo)
    else res({
      albero: aMax - aMin,
      disegnati: window.__nautica.fotogrammi - primo,
      rollio: window.__nautica.stato.rollio,
      stab: window.__nautica.stato.stab,
      mare: window.__nautica.stato.mare
    })
  }
  requestAnimationFrame(passo)
}), n)

const misura = async (dove) => {
  const c = await campiona(FOTOGRAMMI)
  if (c.disegnati < FOTOGRAMMI / 2) {
    guai.push(`campione "${dove}": la scena ha disegnato ${c.disegnati} fotogrammi su ${FOTOGRAMMI}. ` +
              'Non si sta misurando il meccanismo, si sta misurando una scena ferma')
  }
  nota(`${dove}: albero p-p ${c.albero.toFixed(3)} rad ` +
       `[mare ${c.mare}, stab ${c.stab ? 'acceso' : 'spento'}, ${c.disegnati} fotogrammi disegnati]`)
  return c
}

/**
 * Lo stato non si suppone, si legge. Il sito si APRE stabilizzato e a mare 4
 * -- `stato.js` lo dichiara e lo argomenta: "si entra da dove si sta bene, e
 * solo dopo si scopre a spese di chi". La prima stesura di questo cancello
 * dava per scontato che l'interruttore fosse spento, l'ha cliccato, e lo ha
 * SPENTO: poi si e' lamentata che il meccanismo non si muoveva.
 *
 * E' lo stesso errore delle altre tre volte, in un vestito nuovo: dedurre uno
 * stato invece di chiederlo.
 */
const metti = async (acceso) => {
  const ora = await pagina.evaluate(() => window.__nautica.stato.stab)
  if (ora !== acceso) await tocca('#stab')
  const dopo = await pagina.evaluate(() => window.__nautica.stato.stab)
  if (dopo !== acceso) {
    guai.push(`l'interruttore non risponde al clic: chiesto ${acceso ? 'acceso' : 'spento'}, ` +
              `resta ${dopo ? 'acceso' : 'spento'}`)
    return false
  }
  return true
}

// mare 5, stabilizzatore spento: il meccanismo deve essere fermo
await tocca(MARE_ALTO)
await metti(false)
const spento = await misura('stab. spento, mare 5')

// la mano accende, DENTRO il primo piano
await metti(true)
const acceso5 = await misura('stab. acceso, mare 5')

if (acceso5.albero < FERMO) {
  guai.push('acceso l interruttore sul meccanismo, l albero d ingresso non si muove ' +
            `(${acceso5.albero.toFixed(4)} rad p-p): la catena e scollegata`)
} else if (spento.albero > acceso5.albero * 0.5) {
  guai.push(`l interruttore non cambia niente: spento ${spento.albero.toFixed(3)} rad, ` +
            `acceso ${acceso5.albero.toFixed(3)} rad`)
}

// e adesso la manopola: mare 2 contro mare 5, a stabilizzatore acceso
await tocca(MARE_BASSO)
const acceso2 = await misura('stab. acceso, mare 2')
if (acceso2.mare !== 2) guai.push(`il clic sulla manopola non ha cambiato lo stato del mare (e ${acceso2.mare})`)

const crescita = acceso2.albero > 1e-6 ? acceso5.albero / acceso2.albero : Infinity
nota(`girando la manopola da 2 a 5 il meccanismo lavora ${crescita.toFixed(2)} volte di piu`)

if (!(crescita >= CRESCITA_MIN)) {
  guai.push('la manopola non comanda il meccanismo: da mare 2 a mare 5 l escursione ' +
            `dell albero cresce solo ${crescita.toFixed(2)} volte (minimo ${CRESCITA_MIN})`)
}

/* --- 4 - E IL CLIC NON DEVE TELETRASPORTARE LA NAVE ---------------------- */

/**
 * --- IL DIFETTO CHE QUESTO CANCELLO NON SAPEVA VEDERE
 *
 * Per tre ore il clic sulla manopola ha chiamato `sim.scalda()`, che integra
 * 150 secondi in un colpo. La risposta era immediata e la nave SALTAVA: 6,27
 * gradi nel fotogramma del clic, dove un fotogramma normale ne fa 0,043.
 * Centoquarantasei volte.
 *
 * E questo file era verde. Misura l'escursione picco-picco su 90 fotogrammi e
 * confronta mare 2 con mare 5: due stati, entrambi corretti, e in mezzo un
 * taglio di montaggio che nessuna delle due misure poteva contenere.
 *
 * **Una misura fra due stati non vede cosa succede nel passaggio.** Il
 * campionamento va messo A CAVALLO del gesto, non prima e dopo.
 *
 * Il metro non e' un numero assoluto: e' la velocita' angolare che la nave fa
 * da sola. Un fotogramma della transizione puo' essere piu' veloce del moto
 * normale -- sta cambiando ampiezza -- ma non di un ordine di grandezza, o si
 * legge come un salto.
 */
const VOLTE_MAX = 6

/**
 * --- E UN PAVIMENTO ASSOLUTO, PERCHE' UN RAPPORTO CON UN DENOMINATORE
 *     PICCOLO NON SIGNIFICA NIENTE
 *
 * La prima stesura prendeva la velocita' naturale PRIMA del clic. Passando da
 * mare 2 a mare 5 quel riferimento e' la nave quasi ferma -- 0,006 gradi per
 * fotogramma -- quindi una transizione da 0,04 usciva "sette volte" e il
 * cancello diventava rosso per un movimento di 2,4 gradi al secondo, cioe'
 * invisibile.
 *
 * Due correzioni, e la seconda e' quella che vale:
 *
 *   - il riferimento si prende DOPO che la transizione si e' assestata: e' la
 *     velocita' che la nave ha nello stato in cui si trova, non in quello da
 *     cui viene;
 *   - e un salto deve essere veloce IN ASSOLUTO prima ancora che fuori
 *     carattere. Sotto un decimo di grado per fotogramma -- sei gradi al
 *     secondo -- l'occhio non legge un taglio, qualunque cosa dica il rapporto.
 *
 * E' la terza volta in questa sessione che un rapporto mi inganna perche' il
 * denominatore era piccolo. La regola che ne esce: **un rapporto ha bisogno di
 * un pavimento**, o misura il rumore del proprio denominatore.
 */
const SALTO_INVISIBILE = 0.10   // gradi per fotogramma

/**
 * --- IL METRO E' UN PERCENTILE, L'EVENTO E' UN MASSIMO
 *
 * Questo cancello era **instabile**: stessa build, verde poi rosso, rapporti
 * 0,84 · 1,07 · 3,76 contro una soglia di 1,3. E' segnato in
 * docs/15-PASS-PBR.md come «un cancello che da' un esito a caso e' peggio di
 * nessun cancello».
 *
 * La causa: sia il metro sia l'evento usavano il MASSIMO su sessanta
 * fotogrammi. Per l'evento e' giusto -- un salto temporale e' per definizione
 * un singolo fotogramma anomalo, e il massimo e' esattamente cio' che lo
 * trova. Per il METRO no: il massimo di sessanta campioni di un processo a
 * fase casuale e' la statistica piu' rumorosa che esista, e finiva al
 * denominatore di un rapporto.
 *
 * Adesso il fondo naturale e' il **novantacinquesimo percentile** su una
 * finestra di TRE SECONDI -- non di N fotogrammi, perche' in CI si disegna a
 * 1,2 fotogrammi al secondo e un conteggio diventa un tempo diverso su ogni
 * macchina. E' lo stesso difetto che teneva rossa la CI su collaudo-ridotto.
 */
const naturale = (n, durata = 3000) => pagina.evaluate(([n, durata]) => new Promise((res) => {
  const t0 = performance.now()
  let i = 0, prec = window.__nautica.stato.rollio
  const passi = []
  const passo = () => {
    const v = window.__nautica.stato.rollio
    passi.push(Math.abs(v - prec)); prec = v
    if (++i < n && performance.now() - t0 < durata) requestAnimationFrame(passo)
    else {
      passi.sort((a, b) => a - b)
      res(passi.length ? passi[Math.floor(passi.length * 0.95)] : 0)
    }
  }
  requestAnimationFrame(passo)
}), [n, durata])

const attraverso = async (sel, etichetta) => {
  // si campiona SENZA INTERRUZIONE mentre il clic arriva
  const promessa = pagina.evaluate((n) => new Promise((res) => {
    let i = 0, prec = window.__nautica.stato.rollio, max = 0, quando = 0
    const passo = () => {
      const v = window.__nautica.stato.rollio
      const d = Math.abs(v - prec)
      if (d > max) { max = d; quando = i }
      prec = v
      if (++i < n) requestAnimationFrame(passo); else res({ max, quando })
    }
    requestAnimationFrame(passo)
  }), 150)
  await new Promise(r => setTimeout(r, 250))
  await tocca(sel)
  const { max, quando } = await promessa

  // il metro si prende DOPO, quando la nave e' nello stato nuovo
  const nat = await naturale(600)
  const volte = max / Math.max(1e-6, nat)
  nota(`${etichetta}: salto massimo ${max.toFixed(3)} gradi/fotogramma (al ${quando}esimo), ` +
       `naturale ${nat.toFixed(3)} — ${volte.toFixed(1)} volte`)
  if (max > SALTO_INVISIBILE && volte > VOLTE_MAX) {
    guai.push(`${etichetta}: il clic sposta la nave di ${max.toFixed(2)} gradi in un fotogramma, ` +
              `${volte.toFixed(0)} volte quello che fa da sola. E un salto temporale, e questo sito ` +
              'se lo e vietato')
  }
}

await metti(true)
await tocca(MARE_ALTO)
await new Promise(r => setTimeout(r, 800))
await attraverso(MARE_BASSO, 'clic da mare 5 a mare 2')
await new Promise(r => setTimeout(r, 800))
await attraverso(MARE_ALTO, 'clic da mare 2 a mare 5')

/* --- REFERTO ------------------------------------------------------------ */

if (guai.length) {
  console.error('')
  console.error('  LA MANOPOLA NON COMANDA IL MECCANISMO NEL PRIMO PIANO:')
  console.error('')
  for (const g of guai) console.error('   - ' + g)
  console.error('')
  await finisci(1)
}

console.log('')
console.log('  la manopola comanda il meccanismo, e si puo girare guardandolo.')
console.log('')
await finisci(0)
