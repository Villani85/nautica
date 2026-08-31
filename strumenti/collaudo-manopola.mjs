import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'

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
/* se sulla porta risponde gia' qualcuno, questo referto puo' essere
   la misura del `dist` di un altro processo: si dice, non si tace */
await avvisaSePortaAltrui(PORTA)
const BASE = `http://localhost:${PORTA}/nautica/`

/**
 * ~1,5 s a 60 Hz.
 *
 * Qui c'era scritto "abbastanza per due periodi di rollio", ed era falso: il
 * periodo di rollio dichiarato e' 7 secondi, quindi 1,5 s ne sono un quinto.
 * Segnalato da una revisione che ha confrontato il commento col numero.
 *
 * E anche la ragione che l'aveva salvata era sbagliata. Diceva: non si misura
 * il rollio, si misura l'albero, che gira 29 volte piu' in fretta -- quindi in
 * un quinto di periodo fa quasi sei giri. **Il riduttore moltiplica
 * l'ampiezza, non la frequenza.** `impianto.js:454` scrive
 * `ingresso = -rapporto * S.pinna`: l'albero non gira di suo, e' PROPORZIONALE
 * all'angolo di pinna, quindi il suo periodo e' quello del rollio. In un
 * quinto di periodo si vede un quinto dell'escursione, moltiplicata per 29.
 *
 * E c'e' un caso in cui in quel quinto non si vede NIENTE, che e' come il
 * difetto e' saltato fuori. `simulazione.js:187` da'
 * `alfa = clamp(-K·omega, ±A_MAX)`: a nave lanciata la pinna sta al FINE CORSA
 * finche' `omega` non cambia segno, e `omega` cambia segno ogni mezzo periodo,
 * cioe' **3,5 s**. Una finestra da 1,5 s che cade dentro un tratto saturo
 * legge `alfa` costante, quindi albero p-p **0,0000 rad** -- e il cancello
 * accusava la catena di essere scollegata mentre la pinna era semplicemente
 * a fondo corsa, che e' cio' che fa una pinna vera col mare grosso.
 *
 * Misurato: un rosso su otto, sempre a mare 5 acceso, con mare 2 che nello
 * stesso giro dava 19,2 rad. Un guasto che compare solo dove il moto e' PIU'
 * forte e' il ritratto di una saturazione, non di una catena rotta.
 *
 * Quindi la finestra e' **un tempo, e non un numero di fotogrammi**: piu' di
 * mezzo periodo di rollio, o l'escursione non puo' esserci per costruzione.
 * Un conteggio di fotogrammi misurerebbe anche la velocita' della macchina --
 * 90 fotogrammi sono 1,5 s qui e 75 s in CI, dove si disegna in software.
 */
const FINESTRA = 8000        // ms: un periodo di rollio INTERO (7 s) piu' margine
const CAMPIONI_MIN = 12      // sotto, un picco-picco non significa niente
const ATTESA_MAX = 30000     // ms: oltre, non e' una scena lenta, e' una scena ferma

/**
 * --- LA SOGLIA ERA GIUSTA, ERA LA MISURA CHE NON POTEVA REGGERLA
 *
 * Questo numero e' stato rosso per una giornata, e ho cambiato il criterio
 * due volte prima di accorgermi che il criterio non c'entrava. Vale la pena
 * scrivere tutta la catena, perche' l'errore e' ripetibile.
 *
 * **Sintomo.** «L'escursione dell'albero cresce solo 1,22 volte (minimo
 * 1,30)», intermittente, e ogni tanto invece «l'albero non si muove, 0,0000
 * rad p-p: la catena e' scollegata».
 *
 * **Prima spiegazione, sbagliata.** A mare 5 l'albero misurava 25,307 rad che,
 * diviso il rapporto 29, fa 50,00 gradi esatti: la corsa piena fra i due
 * arresti di `A_MAX = 25` gradi. Sembrava una dimostrazione -- il fine corsa
 * taglia l'escursione, quindi il rapporto non puo' superare 1,22 ed e'
 * irraggiungibile per costruzione. Ho riscritto il cancello per misurare la
 * VELOCITA' dell'albero, che il fine corsa non tocca.
 *
 * **Perche' era sbagliata.** La velocita' ha peggiorato le cose: col massimo
 * su singolo fotogramma leggeva il rumore di temporizzazione, e col
 * novantacinquesimo percentile leggeva **zero** -- perche' con la pinna a
 * fondo corsa nel 96% dei fotogrammi il 95% dei campioni di velocita' e' nullo.
 * Due statistiche opposte, tutte e due rotte: il segno che il guasto stava a
 * monte di quale statistica si prendeva.
 *
 * **Causa vera, due difetti nello stesso posto.**
 *
 *   - la finestra era 90 fotogrammi, cioe' 1,5 s, contro un periodo di rollio
 *     di **7 s**. Si campionava un quinto di ciclo, e ogni statistica
 *     dipendeva da QUALE quinto: da qui sia l'1,22 sia lo 0,0000, che e'
 *     semplicemente una finestra caduta dentro un tratto in cui la pinna
 *     stava ferma a fondo corsa;
 *   - si misurava SUBITO dopo il clic, mentre la rampa dichiarata da 1,6 s
 *     stava ancora riscalando: a mare 2 si leggeva una nave che rollava
 *     ancora da mare 5.
 *
 * **La prova.** Con la finestra a un periodo intero e 2,2 s di assestamento,
 * su cinque giri:
 *
 *                    albero p-p        strada        pinna a fondo corsa
 *     mare 2      5,0 - 6,3 rad    8,4 - 11,7 rad          **0%**
 *     mare 5     25,307 (corsa piena)  43 - 61 rad        53 - 83%
 *
 * A mare 2 la pinna **non satura affatto**: il 46% che avevo misurato prima
 * era il transitorio. E l'escursione cresce di **4,6 volte**, non di 1,22.
 * Il criterio originale andava benissimo; non poteva reggere una misura presa
 * su un quinto di ciclo, a transitorio aperto.
 *
 * La regola che ne esce, e che vale oltre questo file: **prima di cambiare il
 * criterio, guarda se la finestra puo' contenere la cosa che misuri.** Un
 * periodo non entra in un quinto di periodo, per nessuna statistica.
 *
 * La soglia resta 1,30: sta molto sotto il 4,6 misurato ma ben sopra 1,
 * quindi puo' ancora fallire se qualcuno ricongela i comandi o scollega la
 * catena. Velocita', strada e frazione satura restano STAMPATE ma non
 * giudicano: sono i tre numeri che hanno spiegato il difetto, e la prossima
 * volta lo spiegheranno di nuovo senza doverli riscrivere.
 */
const CRESCITA_MIN = 1.30

/** Il fine corsa dell'attuatore, come lo dichiara `simulazione.js:62`. E'
 *  duplicato qui perche' il cancello ne ha bisogno per dire quanto la pinna
 *  sta al fondo -- e ogni misura verifica che il sito non l'abbia superato,
 *  cosi' una costante cambiata di la' non passa inosservata di qua. */
const A_MAX_DICHIARATO = 25 * Math.PI / 180

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

/**
 * --- `senzaDimostra=1`, E NON E' UNA COMODITA'
 *
 * Il sito, entrando nella battuta del meccanismo, SPEGNE da solo lo
 * stabilizzatore per due secondi e mezzo: e' la dimostrazione che fa vedere la
 * differenza a chi non sa cosa premere. Ma questo cancello misura proprio i
 * clic sull'interruttore, e le due cose si accavallano: misurato, due giri
 * rossi su sei con «acceso l interruttore, l albero d ingresso non si muove
 * (0,0000 rad p-p)» -- perche' il sito lo aveva rispento sotto la misura.
 *
 * Un cancello che fallisce una volta su tre e' peggio di nessun cancello, e la
 * causa non era ne' il sito ne' il cancello: erano due cose giuste che si
 * pestavano i piedi. Qui la dimostrazione si spegne, e cosi' il cancello
 * misura la mano invece del sito.
 */
await pagina.goto(BASE + '?ispeziona=1&senzaDimostra=1', { waitUntil: 'load', timeout: 45000 })
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
    inQuadro: b.top > -1 && b.bottom > window.innerHeight - 1,
    /**
     * -- E SE IL FILMATO HA GIA' PRESO IL COMANDO, LI' NON SI TOCCA
     *
     * Lo dice questo cancello stesso, nel suo verdetto: «da questa battuta in
     * giu il sito e un filmato: si guarda e non si tocca». E' vero, ed e'
     * voluto: quando la traversata copre il quadro i comandi spariscono,
     * perche' non ci sarebbe niente da comandare.
     *
     * Finche' la battuta del meccanismo finiva insieme alla sezione la
     * distinzione non serviva: il centro dell'intervallo cadeva sempre prima
     * del filmato. Poi e' arrivata la coda -- 120svh in cui il palco resta
     * intero e il filmato tiene l'ultimo fotogramma (vedi `collaudo-finale`) --
     * e la battuta del meccanismo si e' allungata di 836 px in fondo, dove il
     * film copre tutto. Il centro dell'intervallo e' scivolato dentro il film,
     * e il cancello ha bocciato dei comandi nascosti di proposito.
     *
     * Non e' una soglia che si allarga: e' l'INTERVALLO che era descritto male.
     * Il primo piano in cui i comandi devono rispondere e' quello in cui il
     * sito e' ancora interattivo, e la copertura della traversata lo dice --
     * si legge dalla regia, non si deduce.
     */
    copre: (window.__nautica && window.__nautica.coperturaTraversata
      ? (window.__nautica.coperturaTraversata() || 0) : 0)
  }
}, f)

/**
 * ─── LA FINESTRA DI RICERCA SI RICAVA DALLA SEZIONE, non e' 20%-70%
 *
 * Erano due frazioni fisse del documento, e hanno smesso di funzionare il
 * giorno in cui il documento e' cambiato: togliendo §04 e §05 la pagina si e'
 * accorciata di meta', la dimostrazione e' scivolata piu' in basso in
 * proporzione, e la battuta del meccanismo e' finita OLTRE il 70%. Il cancello
 * ha detto «il primo piano non esiste» su un primo piano che c'era.
 *
 * E' lo stesso difetto che questo repo si e' gia' dato per regola due volte:
 * nessuna soglia in frazioni di pagina. La dimostrazione sa dove sta -- ha un
 * rettangolo -- e da quello si ricava l'intervallo di scorrimento in cui vive,
 * con un margine. Se domani si aggiunge o si toglie una sezione, questo
 * continua a funzionare senza che nessuno se ne ricordi.
 */
const finestra = await pagina.evaluate(() => {
  const sez = document.querySelector('#dimostrazione')
  const h = document.documentElement.scrollHeight - window.innerHeight
  const r = sez.getBoundingClientRect()
  const cima = (window.scrollY + r.top) / h
  const fondo = (window.scrollY + r.bottom - window.innerHeight) / h
  return { da: Math.max(0, cima - 0.02), a: Math.min(1, fondo + 0.02) }
})
const dentro = []
for (let f = finestra.da; f <= finestra.a + 1e-9; f += 0.01) {
  const r = await vaiA(f)
  if (r.battuta === 'meccanismo' && r.inQuadro && r.copre < 0.02) dentro.push(f)
}
if (!dentro.length) {
  console.error('')
  console.error('  IL PRIMO PIANO DEL MECCANISMO NON ESISTE.')
  console.error(`  Nessuna posizione di scorrimento fra il ${(finestra.da * 100).toFixed(0)}% e il ` +
                `${(finestra.a * 100).toFixed(0)}% -- cioe' in tutta la dimostrazione -- ha insieme`)
  console.error('  la battuta "meccanismo", il palco dentro la finestra e il filmato ancora fermo.')
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
  ['#propulsione', 'comando della propulsione']
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
const campiona = () => pagina.evaluate(([finestra, fondo]) => {
  /**
   * ─── SI AVANZA A PASSO DICHIARATO, non a fotogrammi. E' la cura, non un
   *     ripiego.
   *
   * Prima questa funzione campionava dentro `requestAnimationFrame` per un
   * TEMPO di orologio. Sulla macchina vera faceva 480 fotogrammi in 20 s e
   * misurava 3,63 volte di escursione fra mare 2 e mare 5, nel verso giusto.
   * Sul runner della CI, senza GPU, faceva **12 fotogrammi** negli stessi
   * 20 s -- mezzo campione al secondo su un rollio da 7 s di periodo -- e il
   * verdetto usciva ROVESCIATO: 0,71 volte, cioe' mare 5 che agita il
   * meccanismo MENO di mare 2. Non e' un difetto del sito: e' aliasing.
   *
   * Adesso il tempo simulato lo detta il cancello. `passoDichiarato(dt, n)`
   * avanza la simulazione e aggiorna i nodi del meccanismo senza disegnare --
   * i pixel qui non servono, serve che il tempo passi. La misura vale uguale
   * su questa macchina e su un runner senza scheda video.
   *
   * `dt` e' 1/60: lo stesso passo che l'integratore riceve quando la macchina
   * va bene, e sotto il tetto di 0,05 s che `index.js` impone per stabilita'.
   */
  const n = window.__nautica.passoDichiarato
  if (typeof n !== 'function') {
    return { nonMisurabile: 'la scena non espone passoDichiarato: non e stato possibile far avanzare il meccanismo' }
  }
  const nodo = window.__nautica.scena.getObjectByName('RIG_INPUT')
  const DT = 1 / 60
  const passi = Math.round((finestra / 1000) / DT)

  let aMin = Infinity, aMax = -Infinity
  let prec = nodo.rotation.x, saturi = 0, pinnaMax = 0, strada = 0
  const vel = []
  for (let i = 0; i < passi; i++) {
    window.__nautica.passoDichiarato(DT, 1)
    const a = nodo.rotation.x
    strada += Math.abs(a - prec)
    vel.push(Math.abs(a - prec) / DT)
    const pinna = Math.abs(window.__nautica.stato.pinna)
    if (pinna > pinnaMax) pinnaMax = pinna
    if (pinna >= fondo - 1e-4) saturi++
    prec = a
    if (a < aMin) aMin = a
    if (a > aMax) aMax = a
  }
  vel.sort((x, y) => x - y)
  return {
    albero: aMax - aMin,
    strada,
    /* la durata e' quella SIMULATA, dichiarata: non l'orologio del runner */
    durata: passi * DT * 1000,
    /* il novantacinquesimo percentile e non il massimo: un massimo su singolo
       passo legge il rumore. Con dt dichiarato il rumore di temporizzazione
       non c'e' piu', ma il criterio resta quello gia' scelto e validato. */
    vMax: vel.length ? vel[Math.min(vel.length - 1, Math.floor(vel.length * 0.95))] : 0,
    satura: saturi / Math.max(passi, 1),
    pinnaMax,
    passi,
    rollio: window.__nautica.stato.rollio,
    stab: window.__nautica.stato.stab,
    mare: window.__nautica.stato.mare
  }
}, [FINESTRA, A_MAX_DICHIARATO])

/**
 * Prima di misurare si aspetta che il transitorio finisca. `simulazione.js`
 * riscala l'ampiezza su una rampa dichiarata di 1,6 s: misurando subito dopo
 * un clic si legge la nave a meta' strada fra i due stati. Misurato, a mare 2
 * la velocita' dell'albero usciva 126,9 rad/s invece di 62 perche' la nave
 * rollava ancora da mare 5.
 *
 * Non e' un cancello che misura millisecondi: e' un'attesa pari alla durata
 * che il sito dichiara per la propria transizione.
 */
const ASSESTAMENTO = 2200

const misura = async (dove) => {
  /**
   * ─── ANCHE L'ASSESTAMENTO E' A PASSO DICHIARATO, e non e' pedanteria
   *
   * Portata la MISURA al passo dichiarato restava una dipendenza dalla
   * macchina: l'attesa del transitorio era di orologio, quindi su un
   * rasterizzatore lento la nave arrivava al campione in un'altra FASE.
   * Misurato, stesso codice e stessi 480 passi: a mare 2 l'escursione usciva
   * 3,8 rad con la GPU e 16,8 senza -- la nave stava ancora scendendo da mare
   * 5 -- e il rapporto scendeva da 6,62 a 1,51 contro un minimo di 1,30.
   * Passava, ma per un soffio e per caso: un runner ancora piu' lento lo
   * avrebbe fatto cadere.
   *
   * Una condizione iniziale che dipende dalla macchina rende la misura
   * irriproducibile anche quando la misura in se' non lo e' piu'.
   */
  await pagina.evaluate((ms) => {
    const DT = 1 / 60
    window.__nautica.passoDichiarato?.(DT, Math.round((ms / 1000) / DT))
  }, ASSESTAMENTO)
  const c = await campiona()
  if (c.nonMisurabile) {
    guai.push(`campione "${dove}": ${c.nonMisurabile}`)
    return c
  }
  /* non si guarda piu' quanti fotogrammi ha disegnato la macchina -- e' cio'
     che rendeva questo cancello un misuratore di runner. Si guarda che i passi
     dichiarati siano stati fatti davvero: `passoDichiarato` torna quanti ne ha
     eseguiti, cosi' un mancato avanzamento e' un guasto e non uno zero muto. */
  if (c.passi < 60) {
    guai.push(`campione "${dove}": eseguiti solo ${c.passi} passi dichiarati`)
  }
  nota(`      strada ${c.strada.toFixed(1)} rad in ${(c.durata / 1000).toFixed(1)} s = ` +
       `${(c.strada / (c.durata / 1000)).toFixed(1)} rad/s medi`)
  nota(`${dove}: albero p-p ${c.albero.toFixed(3)} rad, velocita p95 ${c.vMax.toFixed(1)} rad/s, ` +
       `pinna a fondo corsa il ${(c.satura * 100).toFixed(0)}% del transitorio ` +
       `[mare ${c.mare}, stab ${c.stab ? 'acceso' : 'spento'}, ${c.passi} passi dichiarati da 1/60 s]`)
  if (c.pinnaMax > A_MAX_DICHIARATO + 1e-3) {
    guai.push(`la pinna supera il fine corsa dichiarato: ${(c.pinnaMax * 180 / Math.PI).toFixed(1)} gradi ` +
              `contro ${(A_MAX_DICHIARATO * 180 / Math.PI).toFixed(0)}. O il sito e cambiato, o questo ` +
              'cancello sta leggendo una costante che non e piu vera')
  }
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
nota(`girando la manopola da 2 a 5 il meccanismo lavora ${crescita.toFixed(2)} volte di piu ` +
     `(albero p-p ${acceso2.albero.toFixed(1)} -> ${acceso5.albero.toFixed(1)} rad)`)

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
 *
 * --- E POI IL METRO ERA SBAGLIATO LO STESSO, NELL'ALTRO VERSO
 *
 * Spostare il riferimento da PRIMA a DOPO non ha curato il difetto: l'ha
 * girato. Da mare 5 a mare 2 il denominatore torna a essere quello piccolo --
 * la nave calma -- e ogni transizione verso un mare tranquillo esce rossa per
 * costruzione, perche' nei fotogrammi subito dopo il clic la nave si muove
 * ancora alla velocita' del mare grosso.
 *
 * Misurato, campionando il fondo naturale su TUTTI E DUE i lati del clic:
 *
 *     naturale prima (mare 5)    0,216 gradi/fotogramma
 *     salto misurato al clic     0,102          <- META' del naturale di prima
 *     naturale dopo  (mare 2)    0,015
 *     verdetto del cancello      "6,8 volte", rosso
 *
 * La nave al clic si muove **meno della meta'** di quanto facesse da sola un
 * attimo prima, e il cancello la accusava di un salto temporale. E il dt di
 * quel fotogramma era 16,0 ms contro 16,9 mediani: nemmeno un fotogramma
 * lungo, che era l'altra spiegazione plausibile ed e' stata esclusa misurando.
 *
 * Il fondo giusto e' **il maggiore dei due**. Durante una transizione la nave
 * ha diritto di muoversi come lo stato piu' mosso fra quello da cui viene e
 * quello in cui va; un salto temporale e' cio' che supera **entrambi**. Preso
 * uno solo dei due, il cancello e' rosso per costruzione in un verso -- e
 * quale dei due verso dipende solo da quale si e' scelto.
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
  /**
   * --- ANCHE QUI LA FINESTRA E' UN TEMPO
   *
   * Erano 150 fotogrammi. Su questa macchina sono due secchi e mezzo; in CI,
   * dove si disegna in software a 1,2 fotogrammi al secondo, sono **due
   * minuti** -- per quattro prove, otto minuti su un solo cancello. E' la
   * stessa ragione per cui `collaudo-ridotto` e `collaudo-cinematica` erano
   * gia' stati curati: nessun cancello deve misurare la velocita' della
   * macchina, nemmeno nel proprio tempo di esecuzione.
   *
   * Il salto che si cerca arriva subito dopo il clic, quindi tre secondi
   * bastano e avanzano: quello che si perde e' solo la coda in cui non
   * succede niente.
   */
  const natPrima = await naturale(600)
  const promessa = pagina.evaluate(([n, durata]) => new Promise((res) => {
    const t0 = performance.now()
    let i = 0, prec = window.__nautica.stato.rollio, max = 0, quando = 0
    const passo = () => {
      const v = window.__nautica.stato.rollio
      const d = Math.abs(v - prec)
      if (d > max) { max = d; quando = i }
      prec = v
      if (++i < n && performance.now() - t0 < durata) requestAnimationFrame(passo)
      else res({ max, quando })
    }
    requestAnimationFrame(passo)
  }), [150, 3000])
  await new Promise(r => setTimeout(r, 250))
  await tocca(sel)
  const { max, quando } = await promessa

  // il metro si prende DOPO, quando la nave e' nello stato nuovo
  /* Il fondo si prende sui DUE lati del clic e si tiene il maggiore: preso da
   * un lato solo, il cancello e' rosso per costruzione nell'altro verso. */
  const nat = Math.max(natPrima, await naturale(600))
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
