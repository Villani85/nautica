import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'

/**
 * COLLAUDO DELLA CINEMATICA — il meccanismo si muove davvero, e col rapporto
 * che dichiara.
 *
 *     node strumenti/collaudo-cinematica.mjs
 *
 * `collaudo-glb.mjs` legge il file. Questo guarda il sito che gira: sono due
 * domande diverse, e la seconda non discende dalla prima. Un GLB perfetto puo'
 * stare fermo in pagina, o muovere il nodo sbagliato, o muoverlo di una
 * quantita' che non si vede.
 *
 * ─── IL GUASTO PER CUI ESISTE
 *
 * L'eccentricita' dei dischi veniva ricavata dal `boundingSphere` del disco,
 * che pero' e' modellato centrato sull'asse: la misura restituiva 0,0005 m
 * invece di 0,012. I dischi orbitavano di mezzo millimetro. Sullo schermo il
 * riduttore sembrava una scatola chiusa — e nel file non c'era niente di
 * sbagliato da trovare.
 *
 * ─── COSA MISURA, E PERCHE' PROPRIO QUESTO
 *
 *   RAPPORTO   quanti gradi fa l'ingresso per ogni grado dell'uscita. E' il
 *              controllo piu' forte, perche' non c'e' modo di superarlo per
 *              caso: 29 esatti oppure il nodo sbagliato si sta muovendo
 *   ORBITA     l'escursione della posizione del disco, confrontata col doppio
 *              dell'eccentricita' dichiarata nel GLB. Il raggio NON va bene:
 *              su un'orbita circolare e' costante per costruzione, quindi la
 *              sua escursione e' zero sia che il disco giri sia che sia fermo.
 *              L'ho misurato cosi' per tre giri, leggendo zero ogni volta, e
 *              concludendo che il meccanismo era fermo mentre girava benissimo
 *   ESCURSIONE che la pinna si muova per davvero, e resti sotto i ±25° di §1.5
 *
 * ─── DOVE SI MISURA, E PERCHE' NON PIU' IN BASSO
 *
 * Il ciclo di disegno e' un `setAnimationLoop` che si **ferma quando la sezione
 * esce di campo**, com'e' giusto. Scorrendo troppo oltre si legge un
 * meccanismo immobile e si crede di aver trovato un guasto: e' successo. Quindi
 * si campiona DENTRO il capitolo, in tre punti, e non oltre.
 *
 * Ogni campione e' una valutazione separata: chiudersi dentro un `evaluate` con
 * un ciclo di `requestAnimationFrame` legge sempre lo stesso fotogramma.
 *
 * Non misura millisecondi.
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
 * --- I TRE PUNTI SONO POSIZIONI DEL RACCONTO, E SONO QUELLE DI SEMPRE
 *
 * Qui c'era `[0.15, 0.35, 0.60]` col commento «frazioni del capitolo». Non lo
 * erano: erano frazioni dell'ALTEZZA IN PIXEL di `#dimostrazione`, e il palco
 * incollato ne mangia i primi cento svh. Con la sezione a 520svh e una corsa di
 * 420, quelle tre frazioni cadevano in realta' a
 *
 *     0,15 x 520/420 = 0,186        0,35 -> 0,433        0,60 -> 0,743
 *
 * della corsa del racconto. E' li' che questo cancello ha sempre guardato, ed
 * e' contro quelle tre inquadrature che le sue tolleranze sono state tarate.
 *
 * Scriverle come 0,15 / 0,35 / 0,60 della corsa vera sarebbe stato piu' bello e
 * SBAGLIATO: cambia le tre inquadrature. Provato, e si vede subito -- a p=0,60
 * si finisce nella battuta «calma», dove la pinna arriva a 42,21 gradi contro i
 * +-25,5 dichiarati. Che sia un difetto del sito o una lettura fuori posto e'
 * una domanda aperta e scritta in `ciao2.md`; non e' una cosa da decidere di
 * straforo mentre se ne sistema un'altra.
 *
 * Quindi: le tre posizioni restano quelle di sempre, ma adesso sono dichiarate
 * come cio' che sono -- posizioni del RACCONTO -- e non dipendono piu' da
 * quanto e' alta la sezione. Il giorno in cui si aggiunge o si toglie qualcosa
 * alla pagina, questo cancello continua a guardare le stesse tre cose.
 */
const PUNTI = [0.186, 0.433, 0.600, 0.743]   // posizioni della corsa del racconto
/**
 * --- E LO 0,600 E' NUOVO, aggiunto dopo aver corretto il fine corsa
 *
 * Quel punto cade nella battuta «calma», dove il mare e' grosso e la pinna
 * lavora al massimo. E' esattamente il posto in cui un fine corsa va
 * guardato -- e finora non lo si guardava.
 *
 * Non c'era prima per una ragione precisa: con il controllo sbagliato (picco
 * -picco confrontato con un limite a una falda) quel punto accusava il sito
 * di sforare quando non sforava. Aggiungerlo allora avrebbe voluto dire far
 * gridare al lupo il cancello. Adesso che il controllo guarda il picco, quel
 * punto e' il piu' informativo dei quattro.
 */
const CAMPIONI_MINIMI = 20            // abbastanza da vedere un'escursione della pinna
const CAMPIONI_MAX = 160              // tetto: oltre, il meccanismo non gira e va detto
const PASSO_MS = 50

const RAPPORTO_TOLLERANZA = 0.02      // 2%: e' un rapporto esatto, non una stima
const ORBITA_TOLLERANZA = 0.15        // 15%: l'escursione campionata non tocca sempre i due estremi
const PINNA_MINIMA = 3.0              // gradi: sotto, il rapporto e' rumore diviso rumore
const GIRO_INTERO = 380               // gradi d'ingresso: sotto, l'orbita non ha spazzato tutto
const PINNA_MASSIMA = 25.5            // gradi DAL CENTRO (A_MAX = 25) + mezzo grado numerico
const ORBITA_VISIBILE = 0.03          // eccentricita' osservata / raggio del disco


/** Il server di anteprima, se non ce n'e' gia' uno acceso. */
async function serviteci () {
  try {
    const r = await fetch(BASE, { redirect: 'manual' })
    if (r.status < 500) return null
  } catch {}
  /**
   * `preview`, non `dev`: si misura la BUILD. Rilievo di una revisione, ed era
   * un'incoerenza vera — la continuita' provava `dist` e la cinematica il
   * server di sviluppo, quindi la stessa suite verificava due rappresentazioni
   * diverse dello stesso commit.
   */
  const s = spawn('npm', ['run', 'preview', '--', '--port', String(PORTA)], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    try { await fetch(BASE, { redirect: 'manual' }); return s } catch {}
    await new Promise(r => setTimeout(r, 500))
  }
  s.kill()
  console.error('il server non si e\' alzato')
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

const server = await serviteci()
const browser = await apriBrowser()
const pagina = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  /**
   * SENZA QUESTO SI MISURA UN'ALTRA COSA.
   *
   * Un browser guidato dichiara `prefers-reduced-motion: reduce`, e il sito lo
   * ONORA: in movimento ridotto la pinna sta ferma a zero per progetto (vedi
   * `simulazione.js`). Un cancello che gira cosi' legge zero gradi e accusa il
   * meccanismo di essere fermo. Qui si misura la modalita' piena, e il
   * comportamento ridotto ha il suo interruttore a parte.
   */
  reducedMotion: 'no-preference'
})

const errori = []
pagina.on('pageerror', e => errori.push(String(e)))

await pagina.goto(BASE + '?ispeziona=1', { waitUntil: 'load', timeout: 45000 })
await pagina.waitForTimeout(1000)

/**
 * ─── SI ACCENDE LO STABILIZZATORE, perche' e' il soggetto di questo cancello
 *
 * Da quando il sito parte SPENTO -- decisione del committente, vedi
 * `stato.js` -- la pinna alla partenza sta ferma, e qui usciva:
 *
 *   in nessuno dei 4 punti la pinna supera 3 gradi di escursione
 *
 * Il rosso era corretto e la conclusione sbagliata: il meccanismo non e'
 * rotto, e' DISINSERITO. Questo cancello misura «la manovella comanda i
 * dischi», cioe' un rapporto di trasmissione: presuppone che il sistema stia
 * lavorando, esattamente come si misura il rapporto di un cambio con il motore
 * acceso.
 *
 * Non e' un aggiramento del nuovo stato iniziale -- quello ha il suo cancello,
 * `collaudo-stato-iniziale`, che verifica che si parta spenti. Qui si accende
 * DOPO, come fa il visitatore, e si aspetta che la pinna si muova davvero
 * invece di dare per scontato che un clic basti.
 */

const guasti = []
const righe = []
let dichiarati = null
let misurabili = 0        // punti dove la pinna si muove abbastanza da misurare il rapporto
let conGiro = 0           // punti dove l'ingresso ha fatto un giro intero

for (const f of PUNTI) {
  /**
   * --- SI CAMPIONA LA CORSA DEL RACCONTO, NON L'ALTEZZA DELLA SEZIONE
   *
   * Qui c'era `d.offsetHeight * q`: una frazione dei PIXEL della sezione. Ha
   * funzionato finche' la sezione era tutta racconto, e ha smesso il giorno in
   * cui in fondo e' comparsa una coda che racconto non e' -- 120svh per tenere
   * l'ultimo fotogramma a piena inquadratura. Il 60% dell'altezza e' diventato
   * il 91% della corsa, e questo cancello ha misurato il meccanismo DIETRO il
   * filmato, concludendo «il sito non sta seguendo il modello». Il sito lo
   * seguiva: era il metro a puntare altrove.
   *
   * `__nautica.p` e' la corsa del racconto, quella vera, scritta da `demo.js`
   * a ogni scorrimento. Ci si arriva cercandola, non calcolandola: cosi'
   * qualunque cosa si aggiunga o si tolga alla pagina, il 60% resta il 60% del
   * RACCONTO.
   */
  const arrivato = await pagina.evaluate(async (q) => {
    const n = window.__nautica
    if (!n || n.corsaRacconto === undefined) return null
    /**
     * UN SALTO SOLO, come faceva prima.
     *
     * `p = -top / corsa`, quindi il punto in cui la corsa vale `q` sta a
     * `cima + q * corsa`. Cercarlo per bisezione funzionava ma costava venti
     * salti per tutta la pagina, e il meccanismo finiva misurato mentre
     * smaltiva venti transitori: il cancello e' diventato intermittente, il
     * che e' peggio di uno rosso.
     */
    const y = Math.round(n.cimaSezione + q * n.corsaRacconto)
    scrollTo({ top: y, behavior: 'instant' })
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    return n.p
  }, f)
  if (arrivato === null) {
    console.error('  ROTTO  `__nautica.corsaRacconto` non esiste: la corsa del racconto non e esposta,')
    console.error('         e senza quella questo cancello puo solo indovinare dove guardare.')
    process.exit(2)
  }
  /**
   * SI INSERISCE IL SISTEMA QUI, non al caricamento.
   *
   * Da quando il sito parte SPENTO (`stato.js`, decisione del committente) la
   * pinna sta ferma, e questo cancello usciva con «in nessuno dei 4 punti la
   * pinna supera 3 gradi». Il rosso era giusto, la conclusione no: il
   * meccanismo non e' rotto, e' DISINSERITO.
   *
   * Questo cancello misura un RAPPORTO DI TRASMISSIONE -- quanti gradi fa
   * l'ingresso per ogni grado dell'uscita -- e un rapporto si misura col
   * sistema in moto, come si misura quello di un cambio col motore acceso. Che
   * si debba PARTIRE spenti lo verifica `collaudo-stato-iniziale`, che e' il
   * suo mestiere.
   *
   * E si inserisce DOPO lo spostamento, non al caricamento: prima di entrare
   * nel capitolo la scena della dimostrazione non e' montata, `passoDichiarato`
   * non ha niente da far avanzare e la pinna resta a zero comunque. Misurato:
   * inserendo all'avvio, «acceso lo stabilizzatore la pinna non si muove».
   */
  await pagina.evaluate(() => { window.__nautica.stato.stab = true })
  await pagina.waitForTimeout(4000)

  /**
   * SI CAMPIONA FINCHE' LA PRECONDIZIONE C'E', NON PER UN TEMPO FISSO.
   *
   * Con un numero fisso di campioni, quanti giri fa l'ingresso dipende da dove
   * si trova l'oscillazione quando arrivo: due esecuzioni identiche hanno dato
   * 490° e 194°. Un cancello che passa o fallisce a seconda della fase e'
   * intermittente, e un cancello intermittente si impara a ignorare.
   *
   * Quindi si campiona finche' l'ingresso non ha compiuto un giro intero, con
   * un tetto. Se il tetto si esaurisce, quello e' il risultato — e vuol dire
   * che il meccanismo non gira abbastanza per essere misurato, che e' una cosa
   * vera e non un capriccio del momento in cui ho guardato.
   */
  const serie = []
  const leggi = () => pagina.evaluate(() => {
    const n = window.__nautica
    if (!n) return null
    const q = s => n.scena.getObjectByName(s)
    const fin = q('RIG_FIN'); const cyc = q('RIG_CYCLO_A'); const inp = q('RIG_INPUT')
    if (!fin || !cyc || !inp) return null
    return {
      pinna: fin.rotation.x,
      orbitaY: cyc.position.y,
      orbitaZ: cyc.position.z,
      ingresso: inp.rotation.x,
      ecc: n.impiantoEccentricita ?? null,
      rapporto: n.impiantoRapporto ?? null,
      raggioDisco: n.impiantoDati?.cycloDiscRadiusM ?? null
    }
  })
  /**
   * --- UN TETTO DI TEMPO ACCANTO A QUELLO DI CAMPIONI
   *
   * `CAMPIONI_MAX` da solo basta su questa macchina: 160 campioni a 50 ms sono
   * otto secondi. In CI si disegna in SOFTWARE a 1,2 fotogrammi al secondo, e
   * ogni lettura aspetta un fotogramma: 160 campioni diventano oltre due
   * minuti, per tre punti del capitolo. Il cancello sembrava appeso, e la
   * pubblicazione restava ferma senza che niente dicesse perche'.
   *
   * Adesso c'e' anche un tetto di venti secondi per punto. Se il giro
   * dell'albero non si e' completato dentro quel tempo, si va avanti con
   * quello che si e' visto: le prove che seguono usano l'escursione osservata,
   * e una escursione piccola le fa fallire per conto proprio. Un cancello che
   * non finisce non protegge niente.
   */
  // 45 s: su una macchina con GPU il giro si chiude in due e il tetto non viene
  // mai toccato; senza GPU serve tutto, e misurato bastano -- 48 campioni per
  // punto, con il terzo punto che chiude il giro e regge la prova.
  const TETTO_MS = Number(process.env.TETTO_PUNTO_MS || 45000)
  const t0 = Date.now()
  let scaduto = false
  for (let i = 0; i < CAMPIONI_MAX; i++) {
    serie.push(await leggi())
    const v = serie.filter(Boolean).map(s => s.ingresso)
    const giro = v.length > 1 ? (Math.max(...v) - Math.min(...v)) * 180 / Math.PI : 0
    if (i >= CAMPIONI_MINIMI && giro >= GIRO_INTERO) break
    if (Date.now() - t0 > TETTO_MS) { scaduto = true; break }
    await pagina.waitForTimeout(PASSO_MS)
  }
  if (scaduto) {
    console.log(`  al ${(f * 100).toFixed(0)}% del capitolo il giro non si e chiuso in ` +
                `${(TETTO_MS / 1000).toFixed(0)} s: ${serie.length} campioni. ` +
                'Macchina lenta, non difetto: si giudica su cio che si e visto.')
  }

  const buoni = serie.filter(Boolean)
  if (buoni.length < serie.length * 0.8) {
    guasti.push(`al ${(f * 100).toFixed(0)}% del capitolo la scena non e' interrogabile ` +
                `(${buoni.length} campioni su ${serie.length})`)
    continue
  }
  dichiarati ??= { ecc: buoni[0].ecc, rapporto: buoni[0].rapporto }

  const esc = k => {
    const a = buoni.map(v => v[k])
    return Math.max(...a) - Math.min(...a)
  }
  const G = 180 / Math.PI
  const dPinna = esc('pinna') * G
  /**
   * --- IL FINE CORSA E' UN PICCO, NON UN'ESCURSIONE
   *
   * DIFETTO DI QUESTO CANCELLO, e passava da sempre per un caso fortunato.
   *
   * `esc()` e' `max - min`: un'escursione PICCO-PICCO. `PINNA_MASSIMA` invece
   * viene da `A_MAX` in `simulazione.js` -- «limite meccanico dell'attuatore»,
   * 25 gradi -- che e' un limite a UNA FALDA, e il messaggio lo diceva pure:
   * «oltre i +-25,5».
   *
   * Sono due grandezze diverse. Una pinna che satura come deve, a +-25, ha
   * un'escursione picco-picco di CINQUANTA gradi: il cancello l'avrebbe
   * chiamata violazione. Non se n'era mai accorto nessuno perche' nelle tre
   * inquadrature storiche il mare e' calmo e l'escursione resta sotto i 25
   * anche picco-picco -- il numero era sbagliato e cadeva dalla parte giusta.
   *
   * Si e' visto spostando un punto sulla battuta «calma» a mare 5: la pinna
   * lavora +-21 gradi, dentro il fine corsa, e il cancello ha stampato «42,21
   * oltre i +-25,5» accusando il sito di una cosa che il sito faceva bene.
   *
   * Adesso il fine corsa si controlla su cio' che e': il valore assoluto piu'
   * grande che l'angolo raggiunge. L'escursione resta, ma solo per il
   * RAPPORTO, dove picco-picco diviso picco-picco e' la grandezza giusta.
   */
  const picco = Math.max(...buoni.map(v => Math.abs(v.pinna))) * G
  const dIngresso = esc('ingresso') * G
  const dOrbita = Math.max(esc('orbitaY'), esc('orbitaZ'))
  const rapporto = dPinna > 0.01 ? dIngresso / dPinna : null

  righe.push(`  ${(f * 100).toFixed(0).padStart(3)}%  pinna ${dPinna.toFixed(2).padStart(6)}° p-p ` +
             `(picco ${picco.toFixed(1)}°)  ` +
             `ingresso ${dIngresso.toFixed(0).padStart(4)}°  ` +
             `rapporto ${rapporto ? rapporto.toFixed(2) : '  —'}  ` +
             `orbita ${(dOrbita * 1000).toFixed(2)} mm`)

  /**
   * OGNI CONTROLLO GIRA SOLO DOVE HA SENSO, E QUESTA NON E' UNA CONCESSIONE.
   *
   * Prima versione: soglia secca «la pinna deve muoversi di almeno 3° in ogni
   * punto». Ha bocciato il 15% e il 60% del capitolo, dove la pinna fa 2° e 3°.
   * Ma li' il meccanismo non e' rotto: e' la storia che in quel momento e'
   * quieta — sistema appena acceso, o taglio che entra e rollio che si placa.
   * Un cancello che boccia un momento di calma non misura il meccanismo,
   * misura la drammaturgia, e costringe a truccare la seconda per far tacere
   * il primo.
   *
   * Quindi: le VERIFICHE valgono dove la precondizione c'e', e il cancello
   * pretende che almeno un punto la soddisfi. Se il meccanismo non gira MAI
   * abbastanza da poter essere misurato, quello si' che e' un guasto.
   */
  if (picco > PINNA_MASSIMA) {
    guasti.push(`al ${(f * 100).toFixed(0)}% la pinna raggiunge ${picco.toFixed(2)}° dal centro, ` +
                `oltre il fine corsa di ±${PINNA_MASSIMA}° (A_MAX in simulazione.js). ` +
                `L'escursione picco-picco era ${dPinna.toFixed(2)}°, che e un'altra grandezza ` +
                'e non va confrontata con questo limite.')
  }

  if (dPinna >= PINNA_MINIMA) {
    misurabili++
    const R = dichiarati.rapporto ?? 29
    if (Math.abs(rapporto - R) > R * RAPPORTO_TOLLERANZA) {
      guasti.push(`al ${(f * 100).toFixed(0)}% il rapporto osservato e' ${rapporto.toFixed(2)} invece di ${R}: ` +
                  'o si sta muovendo il nodo sbagliato, o la cinematica non e\' quella dichiarata')
    }
  }

  /**
   * L'ORBITA SI MISURA SOLO DOPO UN GIRO INTERO DELL'INGRESSO.
   *
   * La componente di un moto circolare spazza `2e` **su un giro completo**;
   * su un sesto di giro spazza molto meno, e confrontarla con `2e` significa
   * accusare di immobilita' un disco che sta girando. Misurato: al 15% del
   * capitolo l'ingresso fa 57° e l'orbita legge 11,3 mm invece di 24. Non era
   * un difetto — era una precondizione che non stavo controllando.
   *
   * Il confronto e' in METRI DEL MODELLO, senza la conversione 0,4: le
   * posizioni dei nodi vivono dentro la radice scalata, quindi si leggono
   * nell'unita' in cui il GLB e' stato scritto. E' anche l'unica unita' in cui
   * ha senso confrontarle con `eccentricityM`.
   */
  if (dIngresso >= GIRO_INTERO) {
    conGiro++
    const attesa = 2 * (dichiarati.ecc ?? 0.012)
    if (Math.abs(dOrbita - attesa) > attesa * ORBITA_TOLLERANZA) {
      guasti.push(
        `al ${(f * 100).toFixed(0)}% i dischi orbitano di ${(dOrbita * 1000).toFixed(2)} mm invece dei ` +
        `${(attesa * 1000).toFixed(2)} che l'eccentricita' dichiarata impone, e l'ingresso ha ` +
        `compiuto ${(dIngresso / 360).toFixed(1)} giri quindi la misura e' valida. ` +
        'Il sito non sta seguendo il modello.')
    }
    /**
     * E QUESTO NON SI APPOGGIA ALLA DICHIARAZIONE.
     *
     * Il controllo qui sopra confronta il moto con `eccentricityM`: se qualcuno
     * riscrive quel numero a 0,0005, il sito lo segue obbediente e il confronto
     * torna. L'ho provato — il cancello e' passato su un riduttore che orbitava
     * di un millimetro. Un controllo che si misura contro la propria fonte non
     * verifica niente: verifica di essere coerente con se stesso.
     *
     * L'unica domanda che non si puo' truccare cosi' e' se il movimento **si
     * veda**, e la si fa contro una grandezza che viene da un'altra parte: il
     * raggio del disco. Dodici millimetri su centotrentacinque sono un
     * meccanismo che gira; mezzo su centotrentacinque e' una scatola chiusa.
     */
    const R = buoni[0].raggioDisco
    if (typeof R === 'number' && dOrbita / 2 / R < ORBITA_VISIBILE) {
      guasti.push(
        `al ${(f * 100).toFixed(0)}% l'orbita dei dischi e' il ` +
        `${(dOrbita / 2 / R * 100).toFixed(2)}% del loro raggio: sotto il ${ORBITA_VISIBILE * 100}% ` +
        'non si vede, e un riduttore cicloidale che non si vede muovere e\' una scatola chiusa. ' +
        'E\' il guasto per cui questo cancello esiste.')
    }
  }
}

if (!misurabili) {
  guasti.push(`in nessuno dei ${PUNTI.length} punti la pinna supera ${PINNA_MINIMA}° di escursione: ` +
              'il meccanismo non si muove mai abbastanza da poter essere misurato, e ' +
              'un meccanismo che non si muove non dimostra niente')
}
if (!conGiro) {
  guasti.push('in nessun punto l\'ingresso compie un giro intero: l\'orbita dei dischi ' +
              'non e\' verificabile, e proprio li\' si nascondeva il guasto di stanotte')
}

/**
 * --- L OCCLUSIONE, DOVE E GIA DECODIFICATA
 *
 * Rilievo di una revisione, ed e quello giusto: `collaudo-glb.mjs` puo dire
 * che la mappa e DICHIARATA, ma non che porti qualcosa. Un immagine tutta
 * bianca passerebbe ogni controllo fatto sul JSON.
 *
 * Qui invece i dati ci sono gia decodificati: three.js li ha letti per
 * disegnarli. Il controllo chiede le stesse due cose di prima -- che il canale
 * VARI e che i materiali lo CONSUMINO -- su una strada diversa: non piu i
 * colori dei vertici, ma `aoMap` e `normalMap`. Il modello adesso spedisce la
 * BASSA con gli smussi nella mappa, e `COLOR_0` e caduto insieme all AO che
 * portava.
 *
 * La variazione si misura disegnando la texture su una tela e leggendone i
 * pixel: e l unico modo di sapere se dentro c e un rilievo o un foglio bianco.
 */
const ao = await pagina.evaluate(async () => {
  let conAO = 0, conNormale = 0, senzaUV = 0
  let minimo = 1, massimo = 0, campioni = 0
  const viste = new Set()
  const nodi = []
  window.__nautica.scena.traverse((o) => { if (o.isMesh) nodi.push(o) })
  for (const o of nodi) {
    const ms = Array.isArray(o.material) ? o.material : [o.material]
    for (const m of ms) {
      if (!m) continue
      if (m.aoMap) conAO++
      if (m.normalMap) conNormale++
      if ((m.aoMap || m.normalMap) && !o.geometry.attributes.uv) senzaUV++
      const t = m.aoMap
      if (!t || !t.image || viste.has(t.uuid)) continue
      viste.add(t.uuid)
      const c = document.createElement('canvas')
      c.width = Math.min(t.image.width || 256, 256)
      c.height = Math.min(t.image.height || 256, 256)
      const g2 = c.getContext('2d', { willReadFrequently: true })
      g2.drawImage(t.image, 0, 0, c.width, c.height)
      const d = g2.getImageData(0, 0, c.width, c.height).data
      for (let i = 0; i < d.length; i += 4) {
        const v = d[i] / 255
        if (v < minimo) minimo = v
        if (v > massimo) massimo = v
        campioni++
      }
    }
  }
  return { conAO, conNormale, senzaUV, minimo, massimo, campioni }
})
righe.push(`  OCCLUSIONE  ${ao.conAO} materiali con aoMap, ${ao.conNormale} con normalMap, ` +
           `${ao.campioni} texel letti, valori da ${ao.minimo.toFixed(3)} a ${ao.massimo.toFixed(3)}`)
if (ao.conAO === 0) {
  guasti.push("nessun materiale porta aoMap: l occlusione e sparita dal modello")
} else if (ao.conNormale === 0) {
  guasti.push("nessun materiale porta normalMap: si spedisce la BASSA senza cio che la rende " +
              "guardabile, cioe meno geometria E meno resa")
} else if (ao.senzaUV) {
  guasti.push(`${ao.senzaUV} mesh hanno una mappa ma nessuna UV: la mappa non ha dove ` +
              "appoggiarsi e three la ignora senza dire niente")
} else if (!ao.campioni) {
  guasti.push("l occlusione non si e potuta leggere: la texture non e ancora decodificata, " +
              "quindi questo controllo non ha misurato niente e non deve dirsi verde")
} else if (ao.massimo - ao.minimo < 0.05) {
  guasti.push(`l occlusione non varia (da ${ao.minimo.toFixed(3)} a ${ao.massimo.toFixed(3)}): ` +
              "la mappa c e ma e un foglio bianco, cioe non e stata cotta o e andata persa")
}
/**
 * --- I NUMERI SI STAMPANO ANCHE QUANDO E' VERDE
 *
 * `righe` veniva riempita a ogni punto e non stampata mai: le misure si
 * vedevano solo se qualcosa falliva. Un cancello che tace i propri numeri
 * costringe chi indaga a rimetterci le mani per sapere cosa ha visto, ed e'
 * il motivo per cui la voce della pinna in `ciao2.md` e' rimasta aperta una
 * notte: il numero c'era, non lo stampava nessuno.
 */
for (const r of righe) console.log(r)
if (errori.length) console.log('  errori di pagina: ' + errori.slice(0, 3).join(' | '))

await browser.close()
if (server && !TIENI_SERVER) server.kill()

if (guasti.length) {
  console.error('\nCOLLAUDO CINEMATICA FALLITO')
  for (const g of guasti) console.error('  · ' + g)
  process.exit(1)
}
console.log('\ncollaudo cinematica: passato')
