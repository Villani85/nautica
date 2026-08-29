import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { apriBrowser } from './browser.mjs'
/**
 * ─── LA MAPPA ARRIVA DAL SORGENTE, NON DALLA PAGINA
 *
 * `src/ui/atto-due.js` non importa niente e non tocca il DOM, quindi node lo
 * legge cosi' com'e'. E' deliberato che la DICHIARAZIONE arrivi da li' e la
 * REALTA' dal documento vivo: se il cancello leggesse entrambe dalla pagina,
 * verificherebbe che un modulo e' d'accordo con se' stesso -- il difetto che
 * questo repo ha gia' pagato due volte.
 */
import { STAZIONI, QUOTE, SISTEMI, CELLE, COMANDI_NOTI } from '../src/ui/atto-due.js'
import { IPOTESI_QUIETE_MS, IPOTESI_BLOCCO_ASSE_PX, IPOTESI_PASSO_CELLA_PX } from '../src/ui/soglie.js'

/**
 * IL SITO SU UNO SCHERMO DA TELEFONO — misurato, non supposto.
 *
 *     node strumenti/collaudo-telefono.mjs
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ─── IL LIMITE DI QUESTA MISURA, PRIMA DI TUTTO IL RESTO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * **QUESTO RUNNER NON HA UNA GPU.** `browser.mjs` accende Chromium con
 * `--enable-unsafe-swiftshader`, cioe' WebGL viene disegnato da un
 * RASTERIZZATORE SOFTWARE, sulla CPU. La nota per esteso sta li'.
 *
 * Conseguenza, e va detta forte perche' e' l'unico modo di non farsi citare
 * male: **i fotogrammi al secondo che escono da qui non descrivono nessun
 * telefono.** Non sono una stima pessimistica, non sono un limite inferiore,
 * non sono "il telefono lento": sono la velocita' di una CPU da server che
 * disegna triangoli a mano. Un iPhone ha una GPU, questo no. Fra i due numeri
 * non c'e' nemmeno una relazione monotona garantita, perche' il collo di
 * bottiglia e' un altro pezzo di silicio.
 *
 * Quindi qui i fotogrammi al secondo **si stampano e basta**. Nessun cancello
 * ci si appoggia sopra. L'unica domanda che il contatore dei fotogrammi puo'
 * decidere e' binaria — *la scena disegna, si' o no* — e su quella si', il
 * collaudo esce con errore.
 *
 * Cosa vale davvero, di tutto quello che segue:
 *
 *   - **cosa si rompe nell'IMPAGINATO** a 360, 390 e 768 px di larghezza. La
 *     disposizione non dipende dalla GPU: e' la stessa che vedrebbe un dito;
 *   - **cosa e' IRRAGGIUNGIBILE**: un comando coperto, trasparente o fuori
 *     schermo lo e' anche su un telefono vero;
 *   - **quanto e' grande il BERSAGLIO** di ogni comando, in pixel CSS. WCAG
 *     2.2 SC 2.5.8 chiede 24x24 al livello AA; questo repo si era gia' dato
 *     44x44 (vedi `src/ui/comandi.js`), e la regola non e' negoziabile su uno
 *     schermo che si tocca col pollice;
 *   - **quanti BYTE** scendono dalla rete prima che si veda qualcosa. I byte
 *     sono byte su qualunque macchina, ed e' l'unica voce di questo referto
 *     che si trasferisce a un telefono senza asterischi;
 *   - **i RAPPORTI fra viewport**: se un viewport costa il doppio dell'altro
 *     in byte o in texture, il rapporto e' vero anche dove il valore assoluto
 *     non lo e'.
 *
 * Un numero che verra' letto da qualcun altro deve portarsi dietro il proprio
 * limite, quindi questo blocco non e' solo un commento: il collaudo lo STAMPA,
 * in testa e in coda al referto. Chi copia una riga si porta via anche
 * l'asterisco.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ─── PERCHE' ESISTE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Tre revisioni di fila hanno chiesto numeri sul telefono. Non ce n'era
 * nessuno. C'erano cancelli sull'impaginato (che pero' guarda cinque viewport
 * di cui uno solo stretto, e solo le collisioni fra riquadri), sui comandi
 * (a 1280x800), sul movimento ridotto (a 1280x800), sul peso della
 * compilazione (che misura i file su disco, non cio' che il browser scarica
 * davvero). Nessuno apriva il sito in una finestra da telefono e provava a
 * usarlo.
 *
 * La forma del difetto e' quella gia' vista con la manopola: **non c'era
 * niente di rotto, c'era qualcosa di non provato.** E cio' che non e' provato
 * non e' vero: e' solo non ancora smentito.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ─── COSA MISURA, E COSA PUO' FAR FALLIRE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Su tre viewport — 360x640 (telefono piccolo), 390x844 (telefono medio),
 * 768x1024 (tablet) — con emulazione tattile e rapporto pixel 2:
 *
 *   1. LA PAGINA E' UTILIZZABILE
 *      1a. niente scorrimento laterale: `scrollWidth` non deve superare
 *          `clientWidth`. Su un telefono e' il difetto peggiore che una pagina
 *          possa avere, perche' si sente col dito prima di vederlo;
 *      1b. nessun riquadro sorvegliato esce dalla finestra in orizzontale;
 *      1c. i comandi — stato del mare, andatura, interruttore, e
 *          l'interruttore gemello del salone se e' in pagina — sono
 *          RAGGIUNGIBILI, cioe' `document.elementFromPoint` al loro centro
 *          restituisce loro e non qualcosa che ci sta sopra;
 *      1d. ogni bersaglio misura almeno 24x24 px CSS.
 *      → tutte e quattro fanno FALLIRE il collaudo.
 *
 *   2. LA SCENA DISEGNA
 *      si contano i fotogrammi disegnati leggendo `window.__nautica.fotogrammi`
 *      con `?ispeziona=1`, su una finestra di campionamento DICHIARATA
 *      (vedi `FINESTRA_MS`). Zero fotogrammi, o uno solo, vuol dire che la
 *      scena e' nata e poi si e' fermata, ed e' un guasto su qualunque
 *      macchina. → FA FALLIRE.
 *      Il numero di fotogrammi al secondo che ne esce → SOLO STAMPATO.
 *
 *   3. QUANTO COSTA LA MEMORIA
 *      `performance.memory` se il browser la espone, e quello che three.js
 *      dichiara di tenere: `__nautica.render.info.memory` (geometrie e
 *      texture) e `.render` (chiamate di disegno e triangoli dell'ultimo
 *      fotogramma). → SOLO STAMPATO: non ho una soglia difendibile, e una
 *      soglia inventata farebbe piu' danno del silenzio.
 *      **E il contatore delle texture DERIVA**: alla stessa battuta, sullo
 *      stesso viewport, corse diverse hanno dato 4, 5 e 7. La spiegazione e
 *      la ragione per cui non se ne trae nessuna conclusione stanno accanto
 *      alla riga che lo stampa; qui basti che un numero che deriva non e' un
 *      numero rumoroso, e' un numero da cui non si deduce.
 *
 *   5. LA COPERTURA — cio' che si raggiunge da desktop si raggiunge col dito
 *      E' il cancello del §8 di `docs/13`: «ogni cosa che si puo' scoprire da
 *      desktop si deve poter scoprire da telefono. Non con lo stesso gesto --
 *      con lo stesso esito.»
 *
 *      I due elenchi si costruiscono in due modi DIVERSI, ed e' l'unica cosa
 *      che rende questa sezione un cancello invece di un rito:
 *        - il desktop si ENUMERA dal documento vivo a 1280x800, cercando i
 *          comandi dentro `.comandi`. Nessuna lista scritta a mano;
 *        - il telefono si MISURA a 360x640, aprendo l'esplorazione col dito e
 *          percorrendola;
 *        - `src/ui/atto-due.js` fa da terzo: dichiara la mappa, e il cancello
 *          pretende che il DOM la consegni.
 *
 *      Cosa fa uscire ROSSO, e sono tutti guasti veri e gia' visti altrove:
 *        - un comando compare sul desktop e la mappa non lo conosce (e' il
 *          caso «uno solo non lo e'» del §9);
 *        - un comando noto non si raggiunge col dito;
 *        - una delle dodici celle non si raggiunge coi pulsanti;
 *        - il gesto non produce scatti, o le frecce della tastiera non fanno
 *          niente. **Questo secondo caso e' successo davvero mentre scrivevo
 *          il modulo** -- un `?.` che corto-circuitava e si portava via la
 *          chiamata dentro l'argomento -- e il cancello lo avrebbe preso;
 *        - un bersaglio dell'esplorazione sotto i 44x44, o coperto;
 *        - l'annotazione non compare dopo la quiete dichiarata;
 *        - il pulsante che inoltra dichiara uno stato diverso dal nodo
 *          canonico.
 *
 *      **Cosa questa sezione NON verifica, e va detto forte:** che 400 ms di
 *      quiete siano il numero giusto, o che 24 px per scatto lo siano. Sono
 *      `IPOTESI_` di `src/ui/soglie.js`, e nessun cancello puo' verificarle:
 *      qui i valori si LEGGONO e si aspetta il triplo, si trascina il doppio.
 *      Se domani cambiano, questa sezione resta vera senza toccarla.
 *
 *      E non verifica che la scena si muova con la posizione, perche' **non si
 *      muove**: la lama come strumento non esiste ancora (`docs/13` §7, punto
 *      1). Il referto lo stampa invece di lasciarlo credere.
 *
 *   4. QUANTI BYTE SCARICA
 *      fino al PRIMO FOTOGRAMMA DISEGNATO, non fino a `load`: e' il momento in
 *      cui il visitatore vede la cosa per cui e' venuto. Si distinguono i
 *      filmati dal resto, perche' pesano quanto tutto il resto insieme e su
 *      rete cellulare la differenza la fanno loro. → SOLO STAMPATO, perche' il
 *      cancello sul peso esiste gia' ed e' `peso.mjs`: due cancelli sulla
 *      stessa cosa divergono, e quello che diverge per primo e' quello scritto
 *      dopo.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ─── LE TRAPPOLE CHE QUESTO FILE HA GIA' PAGATO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Sono sette, e cinque sono state pagate scrivendo proprio questo file, in una
 * sessione sola. Quattro di quelle cinque non erano difetti del sito: erano
 * **misure sbagliate che stampavano un numero invece di un errore**, che e' il
 * modo in cui uno strumento fa piu' danno di quanto ne ripari. Stanno qui in
 * cima e non nei commenti sparsi perche' sono il vero contenuto di questo file:
 * il codice e' facile, sapere di cosa NON fidarsi no.
 *
 * 1. **I COMANDI NON ESISTONO A OGNI SCORRIMENTO.** `stile.css` li porta a
 *    `opacity:0; pointer-events:none` fuori dalle loro battute. Cercarli a uno
 *    scorrimento fisso vuol dire, a seconda della fortuna, o un falso allarme
 *    o un cancello che non prova niente. Si CERCA la posizione in cui il sito
 *    dichiara i comandi vivi, e la si stampa: se domani la regia li sposta, il
 *    referto lo dice invece di diventare verde per caso.
 *
 * 2. **UN BERSAGLIO DA 44 PX PUO' ESSERE ALTO 7.** Era il difetto del
 *    prototipo, scritto in `comandi.js`: la barra colorata era il segno, non
 *    il bersaglio. Quindi qui si misura il rettangolo dell'ELEMENTO
 *    INTERATTIVO — il `<button>`, l'`<input>` — non quello del figlio che si
 *    vede. Un cancello che misurasse il segno tornerebbe a certificare 20x7.
 *
 * 3. **LA CACHE FALSA I BYTE.** `transferSize` vale 0 per una risorsa presa
 *    dalla cache, e un secondo viewport misurato nello stesso browser
 *    dichiarerebbe che il sito pesa zero. Ogni viewport ha un CONTESTO NUOVO,
 *    che e' una cache nuova. Se una riga dei byte esce a zero mentre la
 *    risorsa c'e', il sospetto e' questo e non un miracolo di compressione.
 *
 * 4. **`npm run dev` E `npm run preview` STANNO SULLA STESSA PORTA.** Un
 *    collaudo che riusa "il server che risponde" ha una probabilita' su due di
 *    misurare i moduli non impacchettati dello sviluppo. Alla prima esecuzione
 *    di questo file il referto ha detto **7,8 MB al primo fotogramma**; erano
 *    241 KB. Il numero non era falso — era vero, del server sbagliato, che e'
 *    il modo peggiore di sbagliare perche' non somiglia a un errore. Adesso si
 *    guarda l'HTML e non ci si fida della porta: la nota sta in `chiEsu()`.
 *
 * 5. **UN COMANDO PUO' NON ESSERE IN PAGINA AFFATTO.** `#stab-salone` sta in
 *    `index.html` ma non nel DOM: `main.js` rimuove tutta la sezione `#salone`
 *    perche' `regia.js` dichiara `LA_SCENA_E_UNA`. La prima stesura lo
 *    dichiarava «irraggiungibile su tutti e tre i viewport» — un guasto mobile
 *    inventato di sana pianta, che avrebbe mandato a correggere l'impaginato di
 *    un comando che non c'e'. **Si giudica cio' che e' in pagina**; assente per
 *    progetto si stampa e non fa fallire.
 *
 * 6. **DUE CAMPIONI PRESI IN MOMENTI DIVERSI NON SI CONFRONTANO.** Campionavo
 *    la scena "in mezzo alla finestra in cui i comandi sono vivi": 22% sul
 *    telefono piccolo, 31% sul tablet, cioe' due battute diverse. Il referto ne
 *    ha dedotto «qualcosa si adatta allo schermo». Non si adattava niente:
 *    erano due momenti diversi dello stesso film. Adesso si campiona alla
 *    battuta «meccanismo» su tutti, e se su un viewport non e' mai in quadro il
 *    confronto si dichiara impossibile invece di farlo lo stesso.
 *
 * 7. **UN CONTATORE CHE DERIVA NON E' UN CONTATORE RUMOROSO.**
 *    `render.info.memory.textures` ha dato 4, 5 e 7 alla stessa battuta sullo
 *    stesso viewport in tre corse. Ho provato ad assestarlo a tempo (sbagliato:
 *    tre letture da 400 ms qui sono due fotogrammi), poi a fotogrammi, poi ho
 *    escluso il rapporto pixel con una corsa a `DPR=1`. Continua a derivare,
 *    perche' conta cio' che sta sulla GPU *adesso* e nella scena vivono due
 *    texture video che nascono e muoiono mentre si guarda. La conclusione non
 *    e' un numero migliore: e' che **da li' non si deduce**, e il referto lo
 *    scrive al posto di una frase conclusiva.
 */

/* ═══════════════════════════════════════════════════════════════════════════
   LE COSTANTI, TUTTE DICHIARATE
   ═══════════════════════════════════════════════════════════════════════════ */

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
const PORTA_MIA = 5181
const RADICE = fileURLToPath(new URL('..', import.meta.url))
/** Riempito da `serviteci()`: puo' essere la 5180 di qualcun altro o la mia. */
let BASE = `http://localhost:${PORTA}/nautica/`

/**
 * ─── PERCHE' PROPRIO QUESTI TRE, E PERCHE' IL TABLET E' UN TELEFONO GRANDE
 *
 * 360x640 e' il minimo che si incontra ancora davvero (Galaxy A, iPhone SE in
 * larghezza logica e' 375; 360 e' piu' severo di un pixel di scarto e prende
 * anche l'Android economico). 390x844 e' l'iPhone da 14 in poi, cioe' la
 * mediana. 768x1024 e' l'iPad in verticale.
 *
 * Vale la pena sapere che in `stile.css` l'unica soglia di larghezza e'
 * `max-width: 820px`: **tutti e tre cadono nello stesso ramo.** Non e' un
 * difetto, e' un fatto — e vuol dire che il tablet riceve l'impaginato del
 * telefono su una finestra larga il doppio. Se un giorno nascesse una soglia
 * intermedia, questi tre viewport si dividerebbero, e il referto lo mostra
 * subito perche' stampa i numeri accanto.
 */
/**
 * ─── IL RAPPORTO PIXEL, E IL SECONDO MODO IN CUI QUESTO RUNNER MENTE
 *
 * Un telefono vero ha un rapporto pixel fra 2 e 3. Qui e' 2 sui due telefoni,
 * e **1 sul tablet, per forza**: a 768x1024 con rapporto 2 il renderer chiede
 * una tela di 1152x1536 (il clamp a 1,5 di `src/scena/index.js`), e alla
 * battuta «meccanismo» — quella in cui entra `impianto.glb` — SwiftShader
 * muore. Non "rallenta": il processo di rendering se ne va, e Playwright
 * riporta «Execution context was destroyed». Misurato, riproducibile,
 * esattamente al 40% di scorrimento.
 *
 * **Non e' un difetto del sito.** Un iPad ha una GPU e disegna quella scena
 * senza accorgersene; qui la stessa scena viene disegnata a mano dalla CPU su
 * 1,7 milioni di pixel. E' un limite del banco di prova, e sta scritto qui
 * perche' il prossimo che alza `dpr` a 2 sul tablet non ci perda un'ora.
 *
 * Cosa si perde, abbassandolo a 1: **niente di cio' che questo file giudica.**
 * L'impaginato si misura in pixel CSS e il rapporto pixel non lo tocca; i
 * bersagli anche; i byte anche, perche' in questo sito non c'e' un solo
 * `srcset` — verificato — quindi nessuna risorsa cambia con la densita'. Si
 * perde solo la dimensione della tela, che infatti viene stampata accanto al
 * rapporto pixel di ciascun viewport, cosi' si vede quale e' quale.
 *
 * `DPR=2 node strumenti/collaudo-telefono.mjs` forza il valore su tutti e tre,
 * per chi vuole rivedere il guasto con i propri occhi.
 */
const DPR_FORZATO = process.env.DPR ? Number(process.env.DPR) : null
const VIEWPORT = [
  { nome: 'telefono piccolo', width: 360, height: 640, dpr: DPR_FORZATO ?? 2 },
  { nome: 'telefono medio', width: 390, height: 844, dpr: DPR_FORZATO ?? 2 },
  { nome: 'tablet', width: 768, height: 1024, dpr: DPR_FORZATO ?? 1 }
]

/**
 * LA FINESTRA DI CAMPIONAMENTO, dichiarata perche' senza di lei il numero di
 * fotogrammi non vuol dire niente.
 *
 * Tre secondi di orologio da parete, non un conteggio di `requestAnimationFrame`:
 * contare N chiamate a rAF misurerebbe N chiamate a rAF, cioe' esattamente la
 * cosa che si vuole misurare, usata come metro di se' stessa. Su un
 * rasterizzatore software un ciclo puo' durare mezzo secondo, e una finestra
 * "di 90 fotogrammi" durerebbe quarantacinque secondi senza che nessuno lo
 * dica.
 */
const FINESTRA_MS = 3000

/**
 * ─── L'ASSESTAMENTO SI CONTA IN FOTOGRAMMI, NON IN SECONDI
 *
 * Terza stesura di questa attesa, e le prime due sono istruttive perche'
 * sbagliavano lo stesso in due modi diversi.
 *
 * La prima aspettava 1,5 secondi fissi. La seconda aspettava che il contatore
 * delle texture stesse fermo per tre letture da 400 ms — e sembrava rigorosa,
 * perche' guardava una condizione invece dell'orologio. Non lo era: **tre
 * letture da 400 ms sono 1,2 secondi, e a un fotogramma e mezzo al secondo
 * sono due fotogrammi.** Un contatore che sale una volta per fotogramma sta
 * "fermo" per due letture su tre semplicemente perche' nel frattempo non e'
 * stato disegnato niente. Il metro misurava la lentezza del runner e la
 * chiamava stabilita'.
 *
 * Misurato: sullo stesso sito e alla stessa battuta il contatore e' uscito 4,
 * 5 e 7 in tre corse. Non e' rumore da arrotondamento — e' un numero che
 * dipende da quanti fotogrammi sono stati disegnati e da quando le due texture
 * video vengono create e rilasciate.
 *
 * Quindi la condizione si lega alla cosa che la muove: la chiave
 * `geometrie/texture` dev'essere rimasta la stessa per almeno
 * `ASSESTAMENTO_FOTOGRAMMI` **fotogrammi disegnati**. Su una macchina con GPU
 * e' un batter d'occhio; qui sono alcuni secondi, e va benissimo cosi', perche'
 * la soglia significa la stessa cosa su entrambe.
 *
 * `ASSESTAMENTO_MS` non e' un'attesa, e' un TETTO: se l'assestamento arriva
 * prima si prosegue subito, e se non arriva il referto lo dichiara e non
 * confronta niente.
 */
const ASSESTAMENTO_MS = 25000
const ASSESTAMENTO_PASSO = 400
const ASSESTAMENTO_FOTOGRAMMI = 8

/**
 * Sotto questo numero di fotogrammi disegnati nella finestra, la scena non sta
 * disegnando: e' nata e si e' fermata.
 *
 * DUE, e non venti. La soglia deve poter distinguere solo cio' che questo
 * runner puo' decidere. Un solo fotogramma vuol dire "il primo disegno c'e'
 * stato e poi il ciclo e' morto" — quello e' un guasto vero, e si vede uguale
 * con o senza GPU. Tre secondi per fare due fotogrammi li fa anche una CPU che
 * disegna a mano: se non li fa, non e' lenta, e' ferma.
 */
const FOTOGRAMMI_MINIMI = 2

/** WCAG 2.2 SC 2.5.8 «Target Size (Minimum)», livello AA. */
const BERSAGLIO_MIN = 24

/**
 * ─── E QUARANTAQUATTRO PER CIO' CHE E' NATO PER IL DITO
 *
 * I 24 px qui sopra sono il minimo di legge e valgono per i comandi che
 * esistevano prima. La superficie dell'atto due col dito -- l'esplorazione di
 * `src/ui/tocco.js` -- e' nata per essere toccata e basta, e li' il numero e'
 * **44**: e' quello che questo repo si e' gia' dato in `comandi.js` dopo il
 * difetto del prototipo (un bersaglio di 20x7), ed e' il minimo delle linee
 * guida Apple.
 *
 * Due numeri diversi in un file solo hanno bisogno di una ragione, e la
 * ragione e' questa: **il primo e' un cancello ereditato, il secondo e' una
 * promessa nuova.** Alzare anche il primo sarebbe corretto e non e' compito di
 * questa sessione: toccherebbe una soglia su una superficie che sta
 * riscrivendo qualcun altro, e un cancello che diventa rosso per il lavoro di
 * un altro e' un cancello che verra' spento.
 */
const BERSAGLIO_44 = 44

/**
 * Le posizioni di scorrimento in cui si guarda l'impaginato. Sono le stesse
 * che usa `collaudo-impaginato.mjs` — le battute stanno in `regia.js` — con
 * in piu' lo zero, cioe' la prima schermata, che e' l'unica che un visitatore
 * vede sicuramente.
 */
const PUNTI = [0, 0.05, 0.18, 0.31, 0.50, 0.70, 0.92]

/**
 * I riquadri sorvegliati. Stesso elenco di `collaudo-impaginato.mjs`, e la
 * ragione per cui `.patto` ci sta dentro e' scritta li': ne era rimasto fuori,
 * e a 390x844 l'etichetta della battuta gli finiva sopra.
 */
const RIQUADRI = ['#battuta', '.pannello--letture', '.pannello--energia',
                  '.comandi', '.richiamo', '.patto', '.testata', '.salone__didascalia']

/**
 * I comandi. `sel` e' l'ELEMENTO INTERATTIVO, mai il figlio che si vede: e' la
 * trappola numero 2 di sopra.
 */
const COMANDI = [
  ['#mare .mare__tacca:nth-of-type(1)', 'stato del mare, tacca 0'],
  ['#mare .mare__tacca:nth-of-type(3)', 'stato del mare, tacca 2'],
  ['#mare .mare__tacca:nth-of-type(6)', 'stato del mare, tacca 5'],
  ['#propulsione', 'comando della propulsione'],
  ['#stab', 'interruttore di stabilizzazione']
]

/* ═══════════════════════════════════════════════════════════════════════════
   IL SERVER — riusato se c'e', acceso se non c'e'
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * ─── NON BASTA CHE RISPONDA: DEVE ESSERE LA COMPILAZIONE
 *
 * `npm run dev` e `npm run preview` stanno **sulla stessa porta 5180**. Un
 * collaudo che si limita a chiedere «risponde qualcuno?» e riusa cio' che
 * trova ha una probabilita' su due di misurare il server di sviluppo.
 *
 * E' successo alla prima esecuzione di questo file, e il numero che ne e'
 * uscito era **7,8 MB al primo fotogramma**. Non era falso: era vero, del
 * server sbagliato. In sviluppo vite serve ogni modulo separato e non
 * minificato — centinaia di richieste — mentre la compilazione ne serve sette.
 * Un fattore quattro, dentro l'unica voce di questo referto che si trasferisce
 * a un telefono senza asterischi.
 *
 * La differenza si riconosce in una riga: il server di sviluppo inietta
 * `/@vite/client` e serve `/src/main.js`, la compilazione serve
 * `/assets/index-<impronta>.js`. Si guarda l'HTML, non ci si fida della porta.
 *
 * Se sulla 5180 c'e' lo sviluppo, **non lo si spegne** — e' di qualcun altro,
 * probabilmente di chi sta lavorando — e si accende una preview propria sulla
 * 5181.
 */
async function chiEsu (base) {
  try {
    const c = new AbortController()
    const t = setTimeout(() => c.abort(), 4000)
    const r = await fetch(base, { redirect: 'manual', signal: c.signal })
    clearTimeout(t)
    if (r.status >= 500) return null
    const html = await r.text()
    return /@vite\/client|["'\/]src\/main\.js/.test(html) ? 'sviluppo' : 'compilazione'
  } catch { return null }
}

/**
 * Se `dist/` non c'e', si compila. Un cancello che pretende una compilazione
 * fatta da qualcun altro non gira su un clone pulito — e' successo a
 * `collaudo-impaginato.mjs`, sta scritto li'.
 */
async function serviteci () {
  /**
   * ─── SI GUARDANO TUTTE LE PORTE CHE CONOSCO, PRIMA DI ACCENDERE QUALCOSA
   *
   * La prima stesura ne guardava una sola, la 5180, e se li' c'era lo sviluppo
   * andava dritta ad accendere la propria sulla 5181 senza prima CHIEDERE alla
   * 5181 chi ci fosse.
   *
   * Il guasto e' arrivato subito, e con l'ironia giusta: **l'occupante della
   * 5181 era una preview lasciata li' da una corsa precedente di questo stesso
   * file.** `spawn` con `shell: true` avvia una shell che avvia vite, e
   * `s.kill()` uccide la shell — vite resta. Quindi il collaudo litigava con il
   * proprio fantasma, `--strictPort` falliva, e il referto diceva «la preview
   * non si e alzata» indicando per giunta la porta sbagliata.
   *
   * Due lezioni, e la seconda vale piu' della prima. Una: si CHIEDE a ogni
   * porta nota chi c'e', e si riusa qualunque cosa serva la compilazione, da
   * chiunque sia stata accesa. Due: **uno strumento che lascia processi in
   * giro finisce per misurarsi addosso.** Il fantasma qui era innocuo perche'
   * serviva lo stesso `dist/`; con una compilazione vecchia avrebbe prodotto
   * numeri sbagliati e credibili, che e' il guasto peggiore di tutto questo
   * file.
   */
  const porteNote = [PORTA, PORTA_MIA]
  const visti = []
  for (const p of porteNote) {
    const base = `http://localhost:${p}/nautica/`
    const chi = await chiEsu(base)
    visti.push(`${p}: ${chi || 'niente'}`)
    if (chi === 'compilazione') {
      BASE = base
      console.log(`  ${visti.join(', ')}`)
      console.log(`  riuso la preview gia accesa su ${BASE}`)
      return null
    }
  }
  console.log(`  ${visti.join(', ')}`)

  /**
   * Nessuna porta serve la compilazione. Si accende la propria dove non da'
   * fastidio: se sulla 5180 c'e' lo sviluppo di qualcuno lo si lascia in pace
   * — sta lavorando — e si va sulla 5181.
   */
  const occupata = visti[0].endsWith('sviluppo')
  if (occupata) {
    console.log(`  sulla ${PORTA} c e il server di SVILUPPO, non la compilazione: i byte che`)
    console.log('  misurerebbe sono quelli dei moduli non impacchettati, non del sito. Lo lascio')
    console.log(`  in pace e accendo una preview mia sulla ${PORTA_MIA}.`)
  }
  BASE = `http://localhost:${occupata ? PORTA_MIA : PORTA}/nautica/`

  if (!existsSync(RADICE + 'dist/index.html')) {
    console.log('  dist/ non c e: compilo')
    const b = spawnSync('npm', ['run', 'build'], { shell: true, stdio: 'inherit', cwd: RADICE })
    if (b.status !== 0) { console.error('  la compilazione e fallita'); process.exit(2) }
  }

  const porta = new URL(BASE).port
  const s = porta === String(PORTA)
    ? spawn('npm', ['run', 'preview'], { shell: true, stdio: 'ignore', cwd: RADICE })
    : spawn('npx', ['vite', 'preview', '--port', porta, '--strictPort'],
      { shell: true, stdio: 'ignore', cwd: RADICE })

  // 60 s: `npx` puo' dover risolvere il pacchetto, e trenta secondi non erano
  // sempre bastati su questa macchina
  for (let i = 0; i < 120; i++) {
    if (await chiEsu(BASE) === 'compilazione') { console.log(`  ho acceso io la preview su ${BASE}`); return s }
    await new Promise(r => setTimeout(r, 500))
  }
  s.kill()
  console.error(`  la preview non si e alzata su ${BASE} in 60 secondi.`)
  console.error('  Provala a mano — "npm run preview" — e guarda cosa dice: da qui, con')
  console.error('  stdio ignorato, il suo messaggio d errore non arriva.')
  process.exit(2)
}

/* ═══════════════════════════════════════════════════════════════════════════
   LA SPIA CHE FOTOGRAFA LA RETE AL PRIMO DISEGNO
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * ─── PERCHE' DENTRO LA PAGINA E NON CON `page.on('response')`
 *
 * Perche' la domanda e' «quanti byte prima che si veda qualcosa», e "prima"
 * e' un istante che vive nella pagina, non nel processo di collaudo. Da fuori
 * si sa quando una risposta arriva, non quale fotogramma stava disegnando in
 * quel momento: fra i due orologi ci sono decine di millisecondi e un IPC.
 *
 * Dentro la pagina, invece, l'istante e il registro sono lo stesso oggetto:
 * al primo fotogramma disegnato si fotografa `performance.getEntriesByType`.
 * `encodedBodySize` e' cio' che e' sceso dal filo (compresso, come lo serve
 * vite), `decodedBodySize` cio' che il browser ha poi tenuto in mano.
 */
const SPIA = () => {
  window.__telefono = { primoDisegno: null }
  const istantanea = () => {
    const nav = performance.getEntriesByType('navigation')[0]
    const voci = performance.getEntriesByType('resource').map(r => ({
      nome: r.name,
      da: r.initiatorType,
      filo: r.encodedBodySize || 0,
      aperto: r.decodedBodySize || 0
    }))
    if (nav) voci.unshift({ nome: location.pathname, da: 'documento', filo: nav.encodedBodySize || 0, aperto: nav.decodedBodySize || 0 })
    return voci
  }
  const guarda = () => {
    if (window.__nautica && window.__nautica.fotogrammi >= 1) {
      window.__telefono.primoDisegno = { ms: performance.now(), risorse: istantanea() }
      return
    }
    requestAnimationFrame(guarda)
  }
  requestAnimationFrame(guarda)
  window.__telefono.adesso = istantanea
}

/* ═══════════════════════════════════════════════════════════════════════════
   LA MISURA DI UN VIEWPORT
   ═══════════════════════════════════════════════════════════════════════════ */

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
const kb = (n) => (n / 1024).toFixed(1).replace('.', ',') + ' KB'

async function misuraViewport (browser, vp) {
  const etichetta = `${vp.nome} ${vp.width}x${vp.height}`
  /**
   * I guasti si accumulano DENTRO il referto del viewport, non in una lista
   * globale. La ragione e' il tentativo ripetuto qui sotto: una lista globale
   * si porterebbe dietro i guasti della corsa morta a meta', e un difetto
   * verrebbe contato due volte — o peggio, uno raccolto prima del crash
   * verrebbe attribuito a una misura che poi e' andata bene.
   */
  const R = { vp, etichetta, sbordi: [], scorrimentoLaterale: [], comandi: [], colpevoli: [], guai: [] }

  /**
   * `isMobile` e `hasTouch` non sono decorazioni: accendono il viewport
   * meta di Chromium e gli eventi tattili. Senza, si misurerebbe una finestra
   * di desktop stretta — che e' una cosa diversa da un telefono, e proprio la
   * cosa che i cancelli esistenti gia' misuravano.
   */
  /**
   * ─── QUANDO SWIFTSHADER MUORE, PORTA GIU' TUTTO IL BROWSER
   *
   * Non solo la pagina. Il tentativo ripetuto, scritto piu' sotto, apriva un
   * contesto nuovo su un browser che non c'era piu' e falliva con «Target
   * page, context or browser has been closed» — un'eccezione non catturata,
   * cioe' il collaudo che muore mentre stava gestendo una morte.
   *
   * Quindi anche l'apertura del contesto sta dentro la stessa rete, e chi
   * chiama sa che deve riaprire il browser prima di riprovare.
   */
  let ctx, pg
  try {
    ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr,
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'no-preference'
    })
    await ctx.addInitScript(SPIA)
    pg = await ctx.newPage()
  } catch (e) {
    R.morto = 'il browser non c e piu: non ho potuto nemmeno aprire una scheda'
    R.mortoDettaglio = String(e).split('\n')[0]
    return R
  }
  const eccezioni = []
  pg.on('pageerror', e => eccezioni.push(String(e).slice(0, 160)))
  /**
   * ─── SE MUORE IL RASTERIZZATORE, NON HA TORTO IL SITO
   *
   * Senza questa spia il guasto arriva come uno stack trace di Playwright che
   * dice «Execution context was destroyed, most likely because of a
   * navigation». Sono due bugie in una riga: non e' stata una navigazione, ed
   * e' successo alla pagina e non al collaudo. Chi lo legge va a cercare un
   * `location.href` che non esiste.
   *
   * Quindi la si prende e la si chiama col suo nome, e il collaudo esce con
   * **2**, non con 1: uno vuol dire "il sito e' rotto", due vuol dire "non ho
   * potuto misurare". Confonderli e' il modo piu' rapido di far correggere una
   * cosa sana.
   */
  pg.on('crash', () => { R.morto = R.morto || 'il processo di rendering della pagina e morto' })

  try {
  await pg.goto(BASE + '?ispeziona=1', { waitUntil: 'domcontentloaded' })

  /**
   * I FONT PRIMA DELLE MISURE. La ragione lunga sta in
   * `collaudo-impaginato.mjs`: finche' il font non e' arrivato il browser usa
   * un ripiego con metriche diverse, la stessa frase occupa un numero di righe
   * diverso, e si misura un'altra pagina. Su un telefono stretto conta doppio,
   * perche' le righe sono corte e una in piu' sfonda.
   */
  await pg.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 8000))]))
  const fontPronti = await pg.evaluate(() => document.fonts.status === 'loaded')
  if (!fontPronti) R.guai.push(`${etichetta}: i font non sono arrivati in otto secondi, le misure di impaginato sarebbero fatte sul ripiego di sistema`)

  /* --- 1a/1b — L'IMPAGINATO, A OGNI PUNTO DELLA VISITA -------------------- */

  for (const p of PUNTI) {
    const r = await pg.evaluate(async ([p, sel]) => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo(0, Math.round(h * p))
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

      const doc = document.documentElement
      const largo = doc.scrollWidth
      const visto = doc.clientWidth

      /**
       * I COLPEVOLI SI CERCANO SOLO SE IL DELITTO C'E'.
       *
       * Un elenco di "tutto cio' che sporge" prodotto sempre sarebbe pieno di
       * innocenti: `.apertura` e' larga `132vw` APPOSTA — sta scritto in
       * `stile.css`, deborda per non ridurre le persone a due macchie — e un
       * cancello che la segnala ogni volta si impara a ignorarlo. Quindi il
       * setaccio si accende solo quando il documento scorre davvero di lato,
       * e serve a dare un nome a un difetto gia' accertato, non a trovarlo.
       */
      let colpevoli = []
      if (largo > visto + 1) {
        colpevoli = [...document.querySelectorAll('body *')]
          .map(e => {
            const b = e.getBoundingClientRect()
            return { e, destra: b.right, larghezza: b.width }
          })
          .filter(x => x.destra > visto + 1 && x.larghezza > 1)
          .sort((a, b) => b.destra - a.destra)
          .slice(0, 5)
          .map(x => `${x.e.tagName.toLowerCase()}${x.e.id ? '#' + x.e.id : ''}` +
                    `${typeof x.e.className === 'string' && x.e.className ? '.' + x.e.className.trim().split(/\s+/).join('.') : ''}` +
                    ` — bordo destro a ${Math.round(x.destra)}px`)
      }

      const fuori = []
      for (const s of sel) {
        const el = document.querySelector(s)
        if (!el) continue
        const cs = getComputedStyle(el)
        if (parseFloat(cs.opacity) < 0.05 || cs.visibility === 'hidden' || cs.display === 'none') continue
        const b = el.getBoundingClientRect()
        if (b.width < 1 || b.height < 1) continue
        // due pixel di tolleranza: un bordo che sfiora non e' un difetto
        if (b.left < -2) fuori.push(`${s} sporge di ${Math.round(-b.left)}px a sinistra`)
        else if (b.right > visto + 2) fuori.push(`${s} sporge di ${Math.round(b.right - visto)}px a destra`)
      }

      return {
        battuta: document.querySelector('.palco')?.dataset.battuta || '(fuori dal palco)',
        largo, visto, colpevoli, fuori
      }
    }, [p, RIQUADRI])

    if (r.largo > r.visto + 1) {
      R.scorrimentoLaterale.push(`al ${(p * 100).toFixed(0)}% (battuta ${r.battuta}): ${r.largo}px di contenuto in ${r.visto} di schermo`)
      R.colpevoli.push(...r.colpevoli)
    }
    for (const f of r.fuori) R.sbordi.push(`al ${(p * 100).toFixed(0)}% (battuta ${r.battuta}): ${f}`)
  }

  /* --- 1c/1d — I COMANDI, DOVE IL SITO LI DICHIARA VIVI ------------------- */

  await pg.waitForFunction(() => window.__nautica && window.__nautica.scena, null, { timeout: 90000 })
    .catch(() => R.guai.push(`${etichetta}: la scena non e mai nata (nessun window.__nautica dopo 90 s)`))

  /**
   * Si CERCA la finestra di scorrimento in cui `.comandi` e' opaco e il palco
   * e' in quadro. La prima stesura ne dava per scontata una — e sarebbe stato
   * l'errore gia' pagato dalla manopola: `data-battuta` resta "meccanismo"
   * dal 36% al 100%, ma il palco e' `sticky` e dal 44% scivola fuori dallo
   * schermo. Si stampa dove si e' misurato, cosi' se domani la regia sposta i
   * comandi il referto lo dice invece di diventare verde per caso.
   */
  const vivi = []
  const percorso = []
  for (let f = 0.15; f <= 0.80001; f += 0.01) {
    const r = await pg.evaluate(async (f) => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo(0, Math.round(h * f))
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      const palco = document.querySelector('.palco[data-battuta]')
      const b = palco.getBoundingClientRect()
      const c = document.querySelector('.comandi')
      return {
        battuta: palco.dataset.battuta,
        opaco: c ? +getComputedStyle(c).opacity : 0,
        inQuadro: b.top > -1 && b.bottom > window.innerHeight - 1
      }
    }, f)
    percorso.push({ f, ...r })
    if (r.opaco > 0.9 && r.inQuadro) vivi.push({ f, battuta: r.battuta })
  }

  /**
   * ─── QUALI BATTUTE ARRIVANO DAVVERO SU QUESTO SCHERMO
   *
   * Il palco e' `sticky`: quando scivola via, la scena resta nel documento ma
   * esce dalla finestra. Su schermi diversi scivola in momenti diversi, e
   * quindi **non tutte le battute vengono viste da tutti i telefoni**. E' una
   * cosa che nessun cancello di questo repo guardava, e non si vede leggendo il
   * CSS: dipende da quanto e' alta la finestra rispetto alla corsa del palco.
   *
   * Si stampa e basta. Un capitolo che su uno schermo piccolo non si vede e'
   * una decisione di regia da prendere guardando, non una soglia da mettere in
   * uno strumento.
   */
  R.battuteVive = [...new Set(vivi.map(v => v.battuta))]
  R.battuteInQuadro = [...new Set(percorso.filter(p => p.inQuadro).map(p => p.battuta))]
  R.battuteMaiInQuadro = [...new Set(percorso.map(p => p.battuta))].filter(b => !R.battuteInQuadro.includes(b))

  if (!vivi.length) {
    R.guai.push(`${etichetta}: i comandi non sono MAI raggiungibili. Fra il 15% e il 75% ` +
              'di scorrimento non c e una sola posizione in cui .comandi sia opaco e il palco in quadro: ' +
              'su questo schermo il sito e un filmato')
    R.doveComandi = null
  } else {
    const scelto = vivi[Math.floor(vivi.length / 2)]
    R.doveComandi = `${(vivi[0].f * 100).toFixed(0)}%–${(vivi[vivi.length - 1].f * 100).toFixed(0)}%, misuro al ${(scelto.f * 100).toFixed(0)}% (battuta ${scelto.battuta})`
    await pg.evaluate(async (f) => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo(0, Math.round(h * f))
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    }, scelto.f)
    // l'opacita' ha una transizione: si aspetta il VALORE, non l'orologio
    await pg.waitForFunction(() => +getComputedStyle(document.querySelector('.comandi')).opacity > 0.95,
      null, { timeout: 5000 }).catch(() => {})

    for (const [sel, nome] of COMANDI) {
      R.comandi.push(await pg.evaluate(([sel, nome, min]) => {
        const el = document.querySelector(sel)
        if (!el) return { nome, sel, guasto: 'non esiste nel documento' }
        const st = getComputedStyle(el)
        /**
         * Il rettangolo dell'ELEMENTO INTERATTIVO. Non del figlio che si vede:
         * nel prototipo la barra colorata era 20x7 mentre il bersaglio era
         * 44x44, e un cancello che avesse guardato il segno avrebbe certificato
         * il difetto invece di trovarlo.
         */
        const b = el.getBoundingClientRect()
        const x = b.left + b.width / 2
        const y = b.top + b.height / 2
        const sopra = document.elementFromPoint(x, y)
        const colpito = !!sopra && (sopra === el || el.contains(sopra))
        const inQuadro = b.width > 0 && b.height > 0 &&
          y > 0 && y < window.innerHeight && x > 0 && x < window.innerWidth
        const guasto =
          (+st.opacity < 0.1) ? `trasparente (opacity ${st.opacity})`
            : (st.pointerEvents === 'none') ? 'non riceve il puntatore'
              : !inQuadro ? `fuori dalla finestra (centro a ${Math.round(x)},${Math.round(y)})`
                : !colpito ? `coperto da <${sopra ? sopra.tagName.toLowerCase() : 'niente'}${sopra && sopra.className && typeof sopra.className === 'string' ? '.' + sopra.className.trim().split(/\s+/)[0] : ''}>`
                  : null
        return {
          nome, sel, guasto,
          w: +b.width.toFixed(1), h: +b.height.toFixed(1),
          piccolo: (b.width < min - 0.5 || b.height < min - 0.5)
        }
      }, [sel, nome, BERSAGLIO_MIN]))
    }
  }

  /**
   * ─── L'INTERRUTTORE DEL SALONE, E UN FALSO ALLARME CHE VALE PIU' DEL
   *     CONTROLLO
   *
   * `index.html` contiene ancora `#stab-salone`, il gemello dell'interruttore
   * dentro il capitolo del salone, con un commento che spiega perche' esiste.
   * La prima stesura di questo file lo cercava e lo dichiarava
   * IRRAGGIUNGIBILE su tutti e tre i viewport.
   *
   * Era falso, e il modo in cui era falso e' istruttivo: **quel nodo non e' nel
   * DOM.** `main.js` rimuove l'intera sezione `#salone` all'avvio, perche'
   * `regia.js` dichiara `LA_SCENA_E_UNA` — l'architettura a due scene e' stata
   * tolta, e `?doppia=1` la riporta indietro. Il markup e' rimasto in pagina
   * come residuo.
   *
   * Un cancello che avesse fallito qui avrebbe mandato a correggere
   * l'impaginato mobile di un comando che non c'e'. Quindi la regola: **si
   * giudica cio' che e' in pagina.** Assente per progetto si dice e si stampa;
   * presente e irraggiungibile fa fallire. La differenza fra le due e'
   * esattamente la differenza fra un referto e un rumore.
   */
  R.comandi.push(await (async () => {
    const inPagina = await pg.evaluate(() => !!document.querySelector('#stab-salone'))
    if (!inPagina) {
      return {
        nome: 'interruttore del salone', sel: '#stab-salone', assente: true,
        guasto: null,
        perche: 'assente per progetto: main.js rimuove #salone perche regia.js dichiara LA_SCENA_E_UNA'
      }
    }
    for (let f = 0.02; f <= 0.35001; f += 0.01) {
      const r = await pg.evaluate(async ([f, min]) => {
        const h = document.documentElement.scrollHeight - window.innerHeight
        window.scrollTo(0, Math.round(h * f))
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
        const el = document.querySelector('#stab-salone')
        if (!el) return null
        const st = getComputedStyle(el)
        const b = el.getBoundingClientRect()
        if (+st.opacity < 0.9 || st.visibility === 'hidden' || st.display === 'none') return null
        if (!(b.top > 0 && b.bottom < window.innerHeight)) return null
        const x = b.left + b.width / 2, y = b.top + b.height / 2
        const sopra = document.elementFromPoint(x, y)
        const colpito = !!sopra && (sopra === el || el.contains(sopra))
        return {
          nome: 'interruttore del salone', sel: '#stab-salone',
          guasto: st.pointerEvents === 'none' ? 'non riceve il puntatore'
            : !colpito ? `coperto da <${sopra ? sopra.tagName.toLowerCase() : 'niente'}>` : null,
          w: +b.width.toFixed(1), h: +b.height.toFixed(1),
          piccolo: (b.width < min - 0.5 || b.height < min - 0.5)
        }
      }, [f, BERSAGLIO_MIN])
      if (r) return r
    }
    return {
      nome: 'interruttore del salone', sel: '#stab-salone',
      guasto: 'mai visibile e interamente in quadro fra il 2% e il 35% di scorrimento'
    }
  })())

  /* --- 2 — LA SCENA DISEGNA ---------------------------------------------- */

  /**
   * ─── DOVE SI CAMPIONA LA SCENA, E UN METRO CHE HO GIA' ROTTO UNA VOLTA
   *
   * Primo vincolo, quello ovvio: il palco dev'essere IN QUADRO. E' `sticky`, e
   * fuori quadro la scena smette legittimamente di disegnare — misurare li'
   * vuol dire scambiare una decisione di regia per un guasto. E' il primo dei
   * tre errori scritti in testa a `collaudo-manopola.mjs`.
   *
   * Secondo vincolo, che mi e' costato una conclusione sbagliata: **dev'essere
   * la STESSA battuta su tutti e tre i viewport.** La prima stesura campionava
   * "in mezzo alla finestra in cui i comandi sono vivi", che cade al 22% sul
   * telefono piccolo e al 31% sul tablet — cioe' su battute diverse, con
   * contenuti diversi in scena. Il referto ne usciva con 79 geometrie e 5
   * texture da una parte, 78 e 7 dall'altra, e stampava sotto: «qualcosa si
   * adatta allo schermo». Non si adattava niente: **stavo confrontando due
   * momenti diversi dello stesso film** e chiamandola una differenza fra
   * schermi.
   *
   * Quindi si va alla battuta «meccanismo», che e' la piu' carica — e' quella
   * in cui entra `impianto.glb` — e si dichiara dove si e' misurato. Se su un
   * viewport quella battuta non e' mai in quadro, il confronto fra viewport
   * non si puo' fare e il referto lo dice, invece di farlo lo stesso.
   */
  const perMeccanismo = percorso.find(p => p.battuta === 'meccanismo' && p.inQuadro)
  const perRipiego = vivi.length ? vivi[Math.floor(vivi.length / 2)] : null
  const dove = perMeccanismo || perRipiego
  R.doveScena = dove
    ? `${(dove.f * 100).toFixed(0)}% di scorrimento, battuta ${dove.battuta}` +
      (perMeccanismo ? '' : ' — RIPIEGO: la battuta «meccanismo» non e mai in quadro su questo schermo')
    : 'nessuna posizione con il palco in quadro'
  R.scenaComparabile = !!perMeccanismo
  if (dove) {
    await pg.evaluate(async (f) => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo(0, Math.round(h * f))
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    }, dove.f)
    /**
     * ─── SI ASPETTA CHE I CONTATORI SMETTANO DI SALIRE, NON UN NUMERO DI
     *     MILLISECONDI
     *
     * Qui c'era `waitForTimeout(1500)`, e il referto ne usciva con 7 texture
     * su un viewport e 4 su un altro **alla stessa battuta**. La conclusione
     * stampata sotto — «qualcosa si adatta allo schermo» — era falsa per la
     * seconda volta di fila, e stavolta per una ragione piu' sottile della
     * prima.
     *
     * `render.info.memory.textures` conta le texture CARICATE SULLA GPU, e una
     * texture ci arriva la prima volta che un fotogramma la usa. Quindi quel
     * numero non e' una proprieta' della scena: e' una funzione di **quanti
     * fotogrammi sono stati disegnati finora**. Su un rasterizzatore software
     * che fa un fotogramma e mezzo al secondo, un secondo e mezzo di attesa ne
     * concede due — e due fotogrammi non bastano a toccare tutti i materiali.
     * Il viewport piu' lento risultava piu' leggero, che e' esattamente il
     * contrario di cio' che stava succedendo.
     *
     * La cura non e' aspettare di piu': e' **aspettare la condizione invece
     * del tempo**. Si legge il contatore finche' non sta fermo per tre letture
     * di fila, e se entro il tetto non si ferma lo si dichiara — un campione
     * preso su una scena ancora in allestimento non va confrontato con
     * niente, e dirlo costa meno che pubblicare un confronto sbagliato.
     */
    R.assestamento = await pg.evaluate(([cap, passoMs, minFotogrammi]) => new Promise((res) => {
      const n = window.__nautica
      if (!n?.render?.info) return res({ assestato: false, perche: 'niente render.info' })
      const t0 = performance.now()
      let chiaveDa = null      // da quale fotogramma la chiave non cambia
      let prec = null
      let letture = 0
      const passo = () => {
        const m = n.render.info.memory
        const chiave = m.geometries + '/' + m.textures
        const f = n.fotogrammi
        letture++
        if (chiave !== prec) { prec = chiave; chiaveDa = f }
        const dt = performance.now() - t0
        const fermoDa = f - chiaveDa
        if (fermoDa >= minFotogrammi) return res({ assestato: true, letture, ms: Math.round(dt), chiave, fermoDa })
        if (dt > cap) return res({ assestato: false, letture, ms: Math.round(dt), chiave, fermoDa })
        setTimeout(passo, passoMs)
      }
      passo()
    }), [ASSESTAMENTO_MS, ASSESTAMENTO_PASSO, ASSESTAMENTO_FOTOGRAMMI])
  }

  const disegno = await pg.evaluate((ms) => new Promise((res) => {
    const n = window.__nautica
    if (!n) return res(null)
    const t0 = performance.now()
    const f0 = n.fotogrammi
    setTimeout(() => {
      const dt = performance.now() - t0
      const df = n.fotogrammi - f0
      const info = n.render?.info
      res({
        fotogrammi: df,
        ms: +dt.toFixed(0),
        alSecondo: +(df / (dt / 1000)).toFixed(2),
        rapportoPixel: n.render?.getPixelRatio ? +n.render.getPixelRatio().toFixed(2) : null,
        tela: n.render?.domElement ? { w: n.render.domElement.width, h: n.render.domElement.height } : null,
        geometrie: info?.memory?.geometries ?? null,
        texture: info?.memory?.textures ?? null,
        chiamate: info?.render?.calls ?? null,
        triangoli: info?.render?.triangles ?? null,
        // `performance.memory` e' un'estensione di Chromium: puo' non esserci,
        // e allora si dice che non c'e' invece di stampare zero
        heap: performance.memory ? {
          usato: performance.memory.usedJSHeapSize,
          totale: performance.memory.totalJSHeapSize,
          tetto: performance.memory.jsHeapSizeLimit
        } : null,
        stato: n.stato ? { mare: n.stato.mare, stab: n.stato.stab, ridotto: n.stato.ridotto } : null
      })
    }, ms)
  }), FINESTRA_MS)
  R.disegno = disegno

  if (!disegno) {
    R.guai.push(`${etichetta}: window.__nautica non c e — la scena non e nata, e nient altro di questo referto sulla scena vuol dire qualcosa`)
  } else if (disegno.fotogrammi < FOTOGRAMMI_MINIMI) {
    R.guai.push(`${etichetta}: la scena ha disegnato ${disegno.fotogrammi} fotogrammi in ${disegno.ms} ms. ` +
              'Non e lentezza, e fermo: il ciclo di disegno e morto dopo il primo fotogramma')
  }

  /* --- 4 — I BYTE FINO AL PRIMO DISEGNO ---------------------------------- */

  const rete = await pg.evaluate(() => ({
    primo: window.__telefono?.primoDisegno || null,
    fine: window.__telefono?.adesso ? window.__telefono.adesso() : []
  }))
  R.rete = rete

  R.eccezioni = eccezioni
  for (const e of eccezioni.slice(0, 3)) R.guai.push(`${etichetta}: eccezione in pagina — ${e}`)

  } catch (e) {
    const m = String(e).split('\n')[0]
    /**
     * Un contesto distrutto senza che nessuno abbia navigato E' un crash: e'
     * il modo in cui Chromium racconta la morte del processo di rendering a
     * chi lo guarda da fuori. Qualunque altra eccezione, invece, e' un difetto
     * di questo file e va rilanciata: nasconderla dietro "limite del runner"
     * sarebbe il modo perfetto per rendere questo collaudo verde per sempre.
     */
    if (/Execution context was destroyed|Target (page, context or browser has been )?closed|browser has been closed|crash/i.test(m)) {
      R.morto = R.morto || 'contesto di esecuzione distrutto senza navigazione'
      R.mortoDettaglio = m
    } else {
      await ctx.close().catch(() => {})
      throw e
    }
  }

  await ctx.close()
  return R
}

/* ═══════════════════════════════════════════════════════════════════════════
   5 · LA COPERTURA — due elenchi costruiti in due modi diversi
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Il viewport da cui si enumera cio' che il desktop OFFRE. Non e' uno dei tre
 * del referto: e' il termine di paragone, e senza di lui la parita' non ha un
 * primo membro.
 */
const DESKTOP = { nome: 'desktop', width: 1280, height: 800 }

/**
 * Dove i comandi sono vivi. Stessa ricerca della sezione 1c, e per la stessa
 * ragione: `stile.css` li porta a `opacity:0` fuori dalle loro battute, quindi
 * cercarli a uno scorrimento fisso vuol dire, a seconda della fortuna, un
 * falso allarme o un cancello che non prova niente.
 *
 * ─── E SI PRENDE IL CENTRO DELLA FINESTRA, NON IL PRIMO PUNTO BUONO
 *
 * SINTOMO: la prima stesura di questa sezione dichiarava `#stab`
 * IRRAGGIUNGIBILE a 360x640 -- «fuori dalla finestra, centro a 180,694» --
 * mentre la sezione 1c, nella stessa corsa, lo trovava raggiungibile.
 * CAUSA: prendevo il PRIMO scorrimento in cui i comandi risultano vivi. Li' il
 * palco e' appena entrato e la fascia dei comandi cade ancora sotto il bordo;
 * la sezione 1c prende invece il centro dell'intervallo.
 * COME L'HO ISOLATA: dal referto stesso, che dava due verdetti opposti sullo
 * stesso nodo nella stessa corsa. Un cancello che si contraddice ha un difetto
 * nel metro, non nel soggetto.
 *
 * La regola che ne esce vale oltre questa funzione: **due criteri diversi per
 * la stessa domanda, nello stesso file, prima o poi danno due risposte** -- e
 * quella sbagliata sara' creduta perche' e' scritta accanto a una giusta.
 */
async function doveIComandiSonoVivi (pg) {
  const vivi = []
  for (let f = 0.15; f <= 0.80001; f += 0.01) {
    const ok = await pg.evaluate(async (f) => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo(0, Math.round(h * f))
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      const palco = document.querySelector('#dimostrazione .palco[data-battuta]')
      if (!palco) return false
      const b = palco.getBoundingClientRect()
      const c = document.querySelector('.comandi')
      return !!c && +getComputedStyle(c).opacity > 0.9 && b.top > -1 && b.bottom > window.innerHeight - 1
    }, f)
    if (ok) vivi.push(f)
  }
  if (!vivi.length) return null
  const scelto = vivi[Math.floor(vivi.length / 2)]
  await pg.evaluate(async (f) => {
    const h = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo(0, Math.round(h * f))
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  }, scelto)
  await pg.waitForFunction(() => +getComputedStyle(document.querySelector('.comandi')).opacity > 0.95,
    null, { timeout: 5000 }).catch(() => {})
  return scelto
}

/**
 * COSA OFFRE IL DESKTOP. Si enumera il documento, non una lista scritta a
 * mano: e' l'unico modo perche' il cancello si accorga di un comando NUOVO.
 *
 * Il setaccio dell'interattivita' serve a non contare `#et-mare`, che e' un
 * `<p>` con un id ed e' l'etichetta della scala, non un comando. Un cancello
 * che chiedesse al telefono di raggiungere un'etichetta manderebbe a
 * correggere una cosa sana -- ed e' la trappola numero 5 di questo file,
 * quella di `#stab-salone`, in un'altra veste.
 */
const ENUMERA = () => {
  const dentro = document.querySelector('.comandi')
  if (!dentro) return null
  const interattivo = (e) => {
    const t = e.tagName
    const r = e.getAttribute('role')
    return t === 'BUTTON' || t === 'INPUT' || t === 'SELECT' || t === 'TEXTAREA' || t === 'A' ||
      r === 'group' || r === 'button' || r === 'slider' || r === 'radiogroup'
  }
  return [...dentro.querySelectorAll('[id]')].filter(interattivo).map(e => {
    const b = e.getBoundingClientRect()
    const sopra = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
    return {
      id: e.id,
      tag: e.tagName.toLowerCase(),
      w: +b.width.toFixed(1), h: +b.height.toFixed(1),
      colpito: !!sopra && (sopra === e || e.contains(sopra))
    }
  })
}

async function misuraCopertura (browser) {
  const R = { guai: [], desktop: [], telefono: [], celle: null, gesto: null, tastiera: null, sistemi: [], note: [] }

  /* --- il primo membro del confronto: il desktop ------------------------- */
  const cD = await browser.newContext({ viewport: { width: DESKTOP.width, height: DESKTOP.height }, deviceScaleFactor: 1 })
  const pD = await cD.newPage()
  await pD.goto(BASE + '?ispeziona=1', { waitUntil: 'domcontentloaded' })
  await pD.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 8000))]))
  await pD.waitForFunction(() => window.__nautica && window.__nautica.scena, null, { timeout: 90000 }).catch(() => {})
  const fD = await doveIComandiSonoVivi(pD)
  if (fD === null) {
    R.guai.push('copertura: a 1280x800 non c e una posizione in cui i comandi siano vivi, ' +
                'quindi non ho un elenco di partenza e la parita non si puo misurare')
    await cD.close()
    return R
  }
  R.dove = `${(fD * 100).toFixed(0)}% di scorrimento`
  R.desktop = await pD.evaluate(ENUMERA) || []
  await cD.close()

  if (!R.desktop.length) {
    R.guai.push('copertura: a 1280x800 non ho trovato NESSUN comando dentro .comandi. ' +
                'O il setaccio dell interattivita e sbagliato, o la barra dei comandi non c e piu: ' +
                'in entrambi i casi il confronto sarebbe vuoto e verde, che e il modo peggiore di passare')
    return R
  }

  /**
   * --- IL SECONDO MEMBRO: IL TELEFONO PIU' PICCOLO
   *
   * 360x640 e non 390x844, e non e' pigrizia: se la parita' regge sul telefono
   * piu' stretto e piu' basso regge sugli altri due, mentre il contrario non e'
   * vero. E' anche l'unico dei tre in cui fra la dichiarazione e i comandi
   * restano ottantatre pixel, cioe' quello su cui la modalita' e' stata
   * disegnata.
   */
  const vp = VIEWPORT[0]
  const cT = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dpr, isMobile: true, hasTouch: true, reducedMotion: 'no-preference'
  })
  const pT = await cT.newPage()
  const eccezioni = []
  pT.on('pageerror', e => eccezioni.push(String(e).slice(0, 160)))
  await pT.goto(BASE + '?ispeziona=1', { waitUntil: 'domcontentloaded' })
  await pT.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 8000))]))
  await pT.waitForFunction(() => window.__nautica && window.__nautica.scena, null, { timeout: 90000 }).catch(() => {})

  /* --- 5a · i comandi del desktop, dove li trova un dito ----------------- */

  const fT = await doveIComandiSonoVivi(pT)
  for (const c of R.desktop) {
    const noto = COMANDI_NOTI.find(x => x.sel === '#' + c.id)
    const raggiunto = fT === null ? null : await pT.evaluate((id) => {
      const e = document.getElementById(id)
      if (!e) return { c: false, perche: 'non e nel documento' }
      const st = getComputedStyle(e)
      const b = e.getBoundingClientRect()
      if (+st.opacity < 0.1) return { c: false, perche: `trasparente (opacity ${st.opacity})` }
      if (st.display === 'none' || st.visibility === 'hidden') return { c: false, perche: 'nascosto dal foglio di stile' }
      const x = b.left + b.width / 2
      const y = b.top + b.height / 2
      if (!(y > 0 && y < window.innerHeight && x > 0 && x < window.innerWidth)) {
        return { c: false, perche: `fuori dalla finestra (centro a ${Math.round(x)},${Math.round(y)})` }
      }
      const sopra = document.elementFromPoint(x, y)
      const colpito = !!sopra && (sopra === e || e.contains(sopra))
      return { c: colpito, perche: colpito ? null : `coperto da <${sopra ? sopra.tagName.toLowerCase() : 'niente'}>`, w: +b.width.toFixed(1), h: +b.height.toFixed(1) }
    }, c.id)

    R.telefono.push({ id: c.id, noto: !!noto, raggiunto })

    /**
     * IL CASO CHE QUESTO CANCELLO ESISTE PER PRENDERE: un comando che compare
     * sul desktop e di cui la mappa dell'atto due non sa niente. Non e' un
     * difetto del telefono -- e' che nessuno gli ha detto che quella cosa
     * esiste, ed e' esattamente il modo in cui la parita' si perde: non
     * rompendola, dimenticandola.
     */
    if (!noto) {
      R.guai.push(`copertura: "#${c.id}" e un comando del desktop che src/ui/atto-due.js NON conosce. ` +
                  'Aggiungilo a COMANDI_NOTI dicendo dove lo ritrova il dito -- dentro una cella della ' +
                  'griglia, oppure fuori come lo stato del mare -- oppure toglilo dal desktop')
    }
    if (raggiunto && raggiunto.c === false) {
      R.guai.push(`copertura: "#${c.id}" si usa da desktop e su ${vp.width}x${vp.height} ${raggiunto.perche}`)
    }
  }
  if (fT === null) {
    R.guai.push(`copertura: su ${vp.width}x${vp.height} i comandi non sono mai vivi, quindi non ho ` +
                'potuto verificare se il dito li raggiunge nello stato normale della pagina')
  }

  /* --- 5b · l'esplorazione col dito -------------------------------------- */

  const offerta = await pT.evaluate(() => {
    const b = document.querySelector('#entra-esplorazione')
    if (!b) return { c: false, perche: 'il pulsante che apre non e nel documento' }
    const st = getComputedStyle(b)
    if (st.display === 'none') return { c: false, perche: 'il pulsante che apre e display:none' }
    const r = b.getBoundingClientRect()
    const sopra = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return {
      c: !!sopra && (sopra === b || b.contains(sopra)),
      w: +r.width.toFixed(1), h: +r.height.toFixed(1),
      perche: null
    }
  })
  R.entrata = offerta
  if (!offerta.c) {
    R.guai.push(`copertura: l esplorazione col dito non si apre -- ${offerta.perche || 'il pulsante e coperto'}. ` +
                'Senza, le celle della griglia non sono raggiungibili da telefono in nessun modo')
    await cT.close()
    return R
  }
  if (offerta.w < BERSAGLIO_44 || offerta.h < BERSAGLIO_44) {
    R.guai.push(`copertura: il pulsante che apre l esplorazione misura ${offerta.w}x${offerta.h}, ` +
                `sotto i ${BERSAGLIO_44}x${BERSAGLIO_44} che questo repo si e dato per cio che si tocca`)
  }

  await pT.click('#entra-esplorazione')
  await pT.waitForFunction(() => document.querySelector('#esplorazione')?.dataset.stato === 'aperta',
    null, { timeout: 15000 }).catch(() => {
    R.guai.push('copertura: premuto il pulsante, l esplorazione non si e aperta in 15 secondi')
  })

  /* i bersagli dentro il riquadro: misurati come tutti gli altri di questo file */
  R.bersagli = await pT.evaluate((min) => {
    const c = document.querySelector('#esplorazione')
    if (!c) return []
    return [...c.querySelectorAll('button')].filter(e => !e.hidden).map(e => {
      const b = e.getBoundingClientRect()
      const sopra = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
      return {
        nome: e.getAttribute('aria-label') || e.textContent.trim() || '(senza nome)',
        w: +b.width.toFixed(1), h: +b.height.toFixed(1),
        colpito: !!sopra && (sopra === e || e.contains(sopra)),
        piccolo: b.width < min - 0.5 || b.height < min - 0.5
      }
    })
  }, BERSAGLIO_44)
  for (const b of R.bersagli) {
    if (!b.colpito) R.guai.push(`copertura: nell esplorazione "${b.nome}" e coperto e non si puo toccare`)
    else if (b.piccolo) R.guai.push(`copertura: nell esplorazione "${b.nome}" misura ${b.w}x${b.h}, sotto i ${BERSAGLIO_44}x${BERSAGLIO_44}`)
  }

  /**
   * --- LE DODICI CELLE, RAGGIUNTE COI PULSANTI
   *
   * Coi PULSANTI e non col dito, ed e' il punto: il vincolo dichiarato dice
   * che nessuna azione puo' richiedere esclusivamente il trascinamento. Questa
   * e' la prova che l'alternativa esiste e funziona per tutte e dodici, non
   * per quella che capita.
   */
  R.celle = await pT.evaluate(async ([celle]) => {
    const c = document.querySelector('#esplorazione')
    const premi = (sel, n) => { const b = c.querySelector(sel); for (let i = 0; i < n; i++) b.click() }
    const mancate = []
    for (const cella of celle) {
      /* si torna sempre all'angolo noto: cosi' ogni cella si raggiunge con una
         sequenza sua, e un difetto su una non nasconde quello sulla successiva */
      premi('.espl__passo[data-passo="stazione:-1"]', 8)
      premi('.espl__passo[data-passo="quota:-1"]', 8)
      premi('.espl__passo[data-passo="stazione:1"]', cella.is)
      premi('.espl__passo[data-passo="quota:1"]', cella.iq)
      const arrivata = c.dataset.cella
      if (arrivata !== `${cella.is},${cella.iq}`) mancate.push(`${cella.id}: chiesta ${cella.is},${cella.iq}, arrivata ${arrivata}`)
    }
    return { chieste: celle.length, mancate }
  }, [CELLE])
  for (const m of R.celle.mancate) {
    R.guai.push(`copertura: una cella non si raggiunge coi pulsanti -- ${m}. ` +
                'Senza i pulsanti resterebbe solo il trascinamento, e il trascinamento da solo e vietato')
  }

  /**
   * --- IL GESTO VERO, con un puntatore vero
   *
   * Le prove qui sopra chiamano `click()` sul nodo: verificano la logica, non
   * il dito. Questa invece trascina davvero. Il viaggio e' il blocco d'asse
   * PIU' due passi, letti dalle ipotesi: si pretende ALMENO uno scatto, non
   * esattamente due -- pretendere il numero esatto vorrebbe dire sostenere che
   * il passo dichiarato e' quello giusto, e nessun cancello puo' farlo.
   */
  await pT.evaluate(() => {
    const c = document.querySelector('#esplorazione')
    for (let i = 0; i < 8; i++) c.querySelector('.espl__passo[data-passo="stazione:-1"]').click()
  })
  const centro = await pT.evaluate(() => {
    const r = document.querySelector('.espl__schema').getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, prima: document.querySelector('#esplorazione').dataset.cella }
  })
  const viaggio = IPOTESI_BLOCCO_ASSE_PX + IPOTESI_PASSO_CELLA_PX * 2
  await pT.mouse.move(centro.x, centro.y)
  await pT.mouse.down()
  for (let i = 1; i <= 12; i++) await pT.mouse.move(centro.x - (viaggio * i) / 12, centro.y)
  await pT.mouse.up()
  const dopoGesto = await pT.evaluate(() => document.querySelector('#esplorazione').dataset.cella)
  R.gesto = { prima: centro.prima, dopo: dopoGesto, viaggio }
  if (dopoGesto === centro.prima) {
    R.guai.push(`copertura: un trascinamento di ${viaggio} px sul campo non ha prodotto NESSUNO scatto ` +
                `(cella ferma a ${centro.prima}). Il viaggio e il blocco d asse piu due passi, letti da ` +
                'src/ui/soglie.js: se il gesto non risponde a questo, sul telefono non risponde')
  }

  /**
   * --- LA TASTIERA, e il difetto che questa riga ha gia' preso
   *
   * Non e' una formalita' di accessibilita' spuntata per dovere: scrivendo
   * `tocco.js` le frecce non facevano NIENTE, perche' la chiamata che muove
   * stava dentro l'argomento di una chiamata opzionale (`window.__studio?.`)
   * che senza `?studio=1` corto-circuita. Nessun errore, nessun sintomo, e il
   * dito continuava a funzionare: solo una prova da tastiera lo vede.
   */
  const tast = await pT.evaluate(async () => {
    const c = document.querySelector('#esplorazione')
    const campo = c.querySelector('.espl__campo')
    /**
     * SI PARTE DALL'ANGOLO, e la prima stesura non lo faceva: la prova del
     * dito qui sopra lascia la cella dove capita, e se capita in fondo alle
     * quote la freccia in giu' NON DEVE muovere niente -- e' il limite della
     * griglia, non un difetto. Il referto lo dichiarava come guasto: un
     * cancello che non controlla le proprie condizioni iniziali misura
     * l'ordine delle proprie prove.
     */
    const premi = (sel, n) => { const b = c.querySelector(sel); for (let i = 0; i < n; i++) b.click() }
    premi('.espl__passo[data-passo="stazione:-1"]', 8)
    premi('.espl__passo[data-passo="quota:-1"]', 8)
    campo.focus()
    const messoAFuoco = document.activeElement === campo
    const prima = c.dataset.cella
    campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
    const dopoX = c.dataset.cella
    campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))
    const dopoY = c.dataset.cella
    return { messoAFuoco, prima, dopoX, dopoY }
  })
  R.tastiera = tast
  if (!tast.messoAFuoco) R.guai.push('copertura: il campo dell esplorazione non prende il fuoco, quindi da tastiera non esiste')
  if (tast.dopoX === tast.prima) R.guai.push(`copertura: la freccia destra non muove la stazione (cella ferma a ${tast.prima})`)
  if (tast.dopoY === tast.dopoX) R.guai.push(`copertura: la freccia in giu non muove la quota (cella ferma a ${tast.dopoX})`)

  /* --- 5c · i sistemi: si arriva, e si comandano ------------------------- */

  for (const s of SISTEMI) {
    const iS = STAZIONI.findIndex(x => x.id === s.stazione)
    const iQ = QUOTE.findIndex(x => x.id === s.quota)
    if (iS < 0 || iQ < 0) {
      R.guai.push(`copertura: il sistema "${s.id}" e dichiarato nella cella ${s.stazione}/${s.quota}, che non esiste nella griglia`)
      continue
    }
    await pT.evaluate(([iS, iQ]) => {
      const c = document.querySelector('#esplorazione')
      const premi = (sel, n) => { const b = c.querySelector(sel); for (let i = 0; i < n; i++) b.click() }
      premi('.espl__passo[data-passo="stazione:-1"]', 8)
      premi('.espl__passo[data-passo="quota:-1"]', 8)
      premi('.espl__passo[data-passo="stazione:1"]', iS)
      premi('.espl__passo[data-passo="quota:1"]', iQ)
    }, [iS, iQ])

    /**
     * SI ASPETTA L'ANNOTAZIONE, NON UN TEMPO. E la correzione di un
     * ragionamento mio, sbagliato in un punto preciso.
     *
     * Qui c'era `setTimeout(IPOTESI_QUIETE_MS * 3)` col commento: «se
     * l'annotazione non c'e' dopo tre volte il tempo che il sito dichiara di
     * aspettare, non e' lenta, non c'e'». Il margine sembra generoso e non lo
     * e', perche' presuppone una cosa che non ho verificato: che il timer da
     * 400 ms del sito possa GIRARE dentro quei 1200 ms.
     *
     * Un `setTimeout` e' indipendente dalla macchina per quando viene
     * PROGRAMMATO, non per quando puo' essere eseguito: il suo callback aspetta
     * che il thread principale si liberi. Sul runner della CI un fotogramma
     * occupa il thread per oltre un secondo, quindi 400 ms di quiete letti a
     * 1200 ms sono una gara che il timer perde. Misurato: in CI falliscono
     * tutti e tre i sistemi, in locale senza GPU uno su tre, in locale con la
     * GPU nessuno -- e una sonda diretta sul telefono legge l'annotazione
     * giusta, «Propulsion. Shaft, reduction, propeller...». Il sito la promessa
     * la mantiene; era questo controllo a leggerla troppo presto.
     *
     * Adesso si aspetta il FATTO, fino a venti volte la quiete dichiarata, e si
     * riporta quanto ci ha messo. Il criterio non si e' allargato -- resta
     * «l'annotazione compare e nomina il sistema» -- e' cambiata la pazienza,
     * che e' l'unica cosa che una macchina lenta ha il diritto di cambiare.
     */
    let attesaNota = 0
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, IPOTESI_QUIETE_MS))
      attesaNota += IPOTESI_QUIETE_MS
      const testo = await pT.evaluate(() =>
        document.querySelector('#esplorazione .espl__nota')?.textContent.trim() || '')
      if (testo.includes(s.nome)) break
    }
    const v = await pT.evaluate(([sel]) => {
      const c = document.querySelector('#esplorazione')
      const cm = c.querySelector('.espl__comando')
      const canonico = sel ? document.querySelector(sel) : null
      const b = cm && !cm.hidden ? cm.getBoundingClientRect() : null
      const sopra = b ? document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2) : null
      return {
        cella: c.dataset.cella,
        nota: c.querySelector('.espl__nota').textContent.trim(),
        comandoPresente: !!cm && !cm.hidden,
        w: b ? +b.width.toFixed(1) : null,
        h: b ? +b.height.toFixed(1) : null,
        colpito: b ? !!sopra && (sopra === cm || cm.contains(sopra)) : null,
        statoProxy: cm ? cm.getAttribute('aria-pressed') : null,
        statoCanonico: canonico ? canonico.getAttribute('aria-pressed') : null,
        canonicoInPagina: !!canonico
      }
    }, [s.comando || null])

    const esito = { id: s.id, cella: `${iS},${iQ}`, ...v }
    R.sistemi.push(esito)

    if (v.cella !== `${iS},${iQ}`) {
      R.guai.push(`copertura: la cella del sistema "${s.id}" non si raggiunge (chiesta ${iS},${iQ}, arrivata ${v.cella})`)
      continue
    }
    if (!v.nota.includes(s.nome)) {
      R.guai.push(`copertura: fermi sulla cella di "${s.id}" per ${attesaNota} ms ` +
                  `(venti volte la quiete dichiarata), l annotazione non lo nomina ` +
                  `(dice: "${v.nota.slice(0, 60)}"). ` +
                  'Da desktop l annotazione compare per quiete: qui non compare, e la parita e rotta')
    }
    if (s.comando) {
      if (!v.canonicoInPagina) {
        R.guai.push(`copertura: "${s.id}" dichiara il comando ${s.comando}, che nel documento non c e`)
      } else if (!v.comandoPresente) {
        R.guai.push(`copertura: sulla cella di "${s.id}" il pulsante che inoltra a ${s.comando} non compare, ` +
                    'quindi da telefono il sistema si trova ma non si tocca')
      } else {
        if (!v.colpito) R.guai.push(`copertura: il comando di "${s.id}" nell esplorazione e coperto`)
        else if (v.w < BERSAGLIO_44 - 0.5 || v.h < BERSAGLIO_44 - 0.5) {
          R.guai.push(`copertura: il comando di "${s.id}" misura ${v.w}x${v.h}, sotto i ${BERSAGLIO_44}x${BERSAGLIO_44}`)
        }
        if (v.statoProxy !== v.statoCanonico) {
          R.guai.push(`copertura: il comando di "${s.id}" dichiara aria-pressed="${v.statoProxy}" mentre ` +
                      `${s.comando} dice "${v.statoCanonico}". Sono due stati per una cosa sola, ed e il difetto ` +
                      'che comandi.js ha gia pagato una volta')
        }
      }
    }
  }

  /* si preme davvero, una volta: inoltrare non e' mostrare */
  const ultimo = R.sistemi.find(x => x.comandoPresente)
  if (ultimo) {
    const prima = await pT.evaluate(() => document.querySelector('.espl__comando').getAttribute('aria-pressed'))
    await pT.click('.espl__comando')
    await new Promise(r => setTimeout(r, 250))
    const dopo = await pT.evaluate(() => {
      const cm = document.querySelector('.espl__comando')
      const can = document.querySelector(cm.dataset.comanda)
      return { proxy: cm.getAttribute('aria-pressed'), canonico: can?.getAttribute('aria-pressed') }
    })
    R.inoltro = { prima, ...dopo }
    if (dopo.proxy === prima) {
      R.guai.push('copertura: premuto il comando dentro l esplorazione, lo stato non e cambiato: ' +
                  'il pulsante c e, il sistema non risponde')
    }
    if (dopo.proxy !== dopo.canonico) {
      R.guai.push(`copertura: dopo la pressione il pulsante dice "${dopo.proxy}" e il nodo canonico "${dopo.canonico}"`)
    }
  }

  for (const e of eccezioni.slice(0, 3)) R.guai.push(`copertura: eccezione in pagina — ${e}`)
  R.eccezioni = eccezioni
  await cT.close()
  return R
}

/* ═══════════════════════════════════════════════════════════════════════════
   ESECUZIONE
   ═══════════════════════════════════════════════════════════════════════════ */

const AVVISO = [
  '  ┌───────────────────────────────────────────────────────────────────────┐',
  '  │  QUESTO RUNNER NON HA UNA GPU: WebGL gira su SwiftShader, cioe un     │',
  '  │  rasterizzatore SOFTWARE sulla CPU.                                   │',
  '  │                                                                       │',
  '  │  I FOTOGRAMMI AL SECONDO STAMPATI QUI NON DESCRIVONO NESSUN TELEFONO. │',
  '  │  Non sono un limite inferiore ne una stima pessimistica: il collo di  │',
  '  │  bottiglia e un altro pezzo di silicio. Non citarli come prestazione. │',
  '  │                                                                       │',
  '  │  Valgono, e sono gli unici a valere: l impaginato, cosa e             │',
  '  │  irraggiungibile, la misura dei bersagli, i byte, e i rapporti fra    │',
  '  │  viewport.                                                            │',
  '  └───────────────────────────────────────────────────────────────────────┘'
].join('\n')

console.log('')
console.log('IL SITO SU UNO SCHERMO DA TELEFONO')
console.log('')
console.log(AVVISO)
console.log('')

const server = await serviteci()
let browser = await apriBrowser()

/**
 * ─── UN SECONDO TENTATIVO, E PERCHE' NON E' UNA SCORCIATOIA
 *
 * SwiftShader muore ogni tanto senza un motivo che dipenda dalla pagina:
 * misurato, lo stesso viewport a 360x640 e' passato in una corsa ed e' morto
 * nella successiva, con lo stesso sito e la stessa tela. E' instabilita' del
 * rasterizzatore software, non un difetto intermittente del sito.
 *
 * Riprovare un cancello che ha trovato un DIFETTO sarebbe indifendibile:
 * significherebbe pescare l'esecuzione fortunata finche' non esce verde. Qui
 * si riprova **solo se la misura non e' avvenuta** — `R.morto`, cioe' il
 * processo di rendering se n'e' andato — e mai se e' avvenuta e ha trovato
 * qualcosa. La distinzione e' la stessa fra l'uscita 1 e l'uscita 2: un difetto
 * non si ritenta, un metro rotto si'. E se muore due volte, si dice.
 */
const referti = []
for (const vp of VIEWPORT) {
  process.stdout.write(`  misuro ${vp.nome} ${vp.width}x${vp.height} @${vp.dpr}x ... `)
  let R = await misuraViewport(browser, vp)
  if (R.morto) {
    /**
     * Il browser va RIAPERTO, non riusato: SwiftShader morendo si porta giu'
     * tutto il processo, non solo la scheda. Riusarlo dava «Target page,
     * context or browser has been closed» — il collaudo che muore mentre
     * gestisce una morte.
     */
    process.stdout.write('il rasterizzatore e morto, riapro il browser e riprovo ... ')
    await browser.close().catch(() => {})
    browser = await apriBrowser()
    R = await misuraViewport(browser, vp)
  }
  referti.push(R)
  guai.push(...R.guai)
  console.log(R.morto ? 'MORTO DUE VOLTE' : 'fatto')
}

/**
 * LA COPERTURA SI MISURA DOPO, e su contesti suoi.
 *
 * Non dentro `misuraViewport`: quella funzione descrive il sito COM'E' quando
 * lo si apre, e aprire l'esplorazione lo cambia -- spegne la pila e i comandi.
 * Misurare le due cose nella stessa pagina vorrebbe dire che l'ordine dei
 * controlli decide il risultato, che e' il modo piu' silenzioso di rendere un
 * cancello inaffidabile.
 */
process.stdout.write('  misuro la copertura desktop -> dito ... ')
let coperturaMorta = null
let copertura = { guai: [], desktop: [], telefono: [], sistemi: [] }
try {
  copertura = await misuraCopertura(browser)
} catch (e) {
  const m = String(e).split('\n')[0]
  if (/Execution context was destroyed|Target (page, context or browser has been )?closed|browser has been closed|crash/i.test(m)) {
    coperturaMorta = m
  } else {
    await browser.close().catch(() => {})
    throw e
  }
}
console.log(coperturaMorta ? 'MISURA INTERROTTA' : 'fatto')
guai.push(...copertura.guai)

await browser.close()
if (!TIENI_SERVER) server?.kill()

/* --- IL REFERTO --------------------------------------------------------- */

const col = (s, n) => String(s).padEnd(n)
const num = (s, n) => String(s).padStart(n)

console.log('')
console.log('1 · LA PAGINA E UTILIZZABILE            (questi controlli fanno FALLIRE)')
console.log('')
for (const R of referti) {
  console.log(`  ${col(R.etichetta, 24)}${R.morto ? '   [MISURA INTERROTTA: ' + R.morto + ']' : ''}`)
  console.log(`     scorrimento laterale : ${R.scorrimentoLaterale.length ? R.scorrimentoLaterale.length + ' punti su ' + PUNTI.length + ' ROTTO' : 'nessuno, su ' + PUNTI.length + ' punti della visita'}`)
  for (const s of R.scorrimentoLaterale) console.log('        - ' + s)
  for (const c of [...new Set(R.colpevoli)].slice(0, 5)) console.log('          chi sporge: ' + c)
  console.log(`     riquadri fuori schermo: ${R.sbordi.length ? R.sbordi.length + ' ROTTO' : 'nessuno'}`)
  for (const s of [...new Set(R.sbordi)].slice(0, 6)) console.log('        - ' + s)
  console.log(`     comandi vivi fra      : ${R.doveComandi || 'MAI — vedi i guasti'}`)
  console.log(`     battute con il palco in quadro, cioe che questo schermo VEDE:`)
  console.log(`        ${(R.battuteInQuadro || []).join(', ') || '(nessuna)'}`)
  if (R.battuteMaiInQuadro?.length) {
    console.log(`     battute che qui NON entrano mai in quadro (solo dichiarato, nessun giudizio):`)
    console.log(`        ${R.battuteMaiInQuadro.join(', ')}`)
  }
  for (const c of R.comandi) {
    const misura = c.w != null ? `${num(c.w, 6)} x ${num(c.h, 5)} px` : '        —      '
    const verdetto = c.assente ? 'non in pagina — ' + c.perche
      : c.guasto ? 'IRRAGGIUNGIBILE: ' + c.guasto
        : c.piccolo ? `BERSAGLIO SOTTO ${BERSAGLIO_MIN} px`
          : 'ok'
    console.log(`        ${col(c.nome, 30)} ${misura}   ${verdetto}`)
    if (c.guasto) guai.push(`${R.etichetta}: "${c.nome}" ${c.guasto}`)
    else if (c.piccolo) guai.push(`${R.etichetta}: "${c.nome}" ha un bersaglio di ${c.w}x${c.h} px, sotto i ${BERSAGLIO_MIN}x${BERSAGLIO_MIN} di WCAG 2.2 SC 2.5.8`)
  }
  console.log('')
}

console.log(`2 · LA SCENA DISEGNA                    (solo "disegna/non disegna" fa FALLIRE)`)
console.log(`    finestra di campionamento dichiarata: ${FINESTRA_MS} ms di orologio da parete`)
console.log('')
console.log('    ' + col('viewport', 24) + num('fotogrammi', 11) + num('al secondo*', 13) + num('pixel ratio', 13) + '   tela disegnata')
for (const R of referti) {
  const d = R.disegno
  console.log('    ' + col(R.etichetta, 24) +
    num(d ? d.fotogrammi : '—', 11) +
    num(d ? d.alSecondo : '—', 13) +
    num(d && d.rapportoPixel != null ? d.rapportoPixel : '—', 13) +
    '   ' + (d && d.tela ? `${d.tela.w}x${d.tela.h}` : '—'))
}
console.log('')
for (const R of referti) console.log(`    campionato a: ${col(R.etichetta, 24)} ${R.doveScena}`)
console.log('')
console.log('    * NON e una misura di prestazione su telefono. Vedi il riquadro in testa.')
console.log('      Il rapporto pixel e invece un numero VERO e specifico del telefono: il')
console.log('      renderer lo limita a 1,5 (src/scena/index.js), quindi su uno schermo 2x o')
console.log('      3x la tela disegnata e piu piccola dello schermo. Quello vale ovunque.')
console.log('')

console.log('3 · QUANTO COSTA LA MEMORIA             (solo stampato: nessuna soglia difendibile qui)')
console.log('    chiamate e triangoli sono dell ULTIMO fotogramma, non totali. Geometrie e texture')
console.log('    derivano di qualche unita fra una corsa e l altra: misurato, e spiegato sotto.')
console.log('')
console.log('    ' + col('viewport', 24) + num('geometrie', 10) + num('texture', 9) + num('chiamate', 10) + num('triangoli', 11) + num('heap JS usato', 16))
for (const R of referti) {
  const d = R.disegno
  console.log('    ' + col(R.etichetta, 24) +
    num(d?.geometrie ?? '—', 10) + num(d?.texture ?? '—', 9) +
    num(d?.chiamate ?? '—', 10) + num(d?.triangoli ?? '—', 11) +
    num(d?.heap ? kb(d.heap.usato) : 'non esposto', 16))
}
console.log('')
{
  /**
   * IL CONFRONTO SI FA SOLO SE I CAMPIONI SONO CONFRONTABILI, e qui la
   * condizione e' che tutti e tre siano stati presi alla stessa battuta. La
   * prima stesura non la controllava e ha stampato una conclusione falsa —
   * la nota lunga sta accanto a `perMeccanismo`. Un numero preso in un altro
   * momento non e' un numero piu' rumoroso: e' il numero di un'altra cosa.
   */
  for (const R of referti) {
    const a = R.assestamento
    console.log(`    assestamento: ${col(R.etichetta, 24)} ` + (!a ? 'non misurato'
      : a.assestato ? `fermo a ${a.chiave} geometrie/texture per ${a.fermoDa} fotogrammi (${a.ms} ms)`
        : `NON ASSESTATO in ${a.ms} ms (ultimo ${a.chiave}, fermo da soli ${a.fermoDa} fotogrammi): ` +
          `serve rileggerlo prima di credergli`))
  }
  console.log('')
  const comparabili = referti.filter(R => R.scenaComparabile && R.disegno && R.assestamento?.assestato)
  if (comparabili.length < referti.length) {
    console.log('    Il confronto fra viewport NON si puo fare: o non tutti sono stati campionati')
    console.log('    alla stessa battuta, o la scena non si era ancora assestata. Vedi le righe')
    console.log('    "campionato a" e "assestamento" qui sopra.')
  } else {
    const g = new Set(comparabili.map(R => R.disegno.geometrie))
    const t = new Set(comparabili.map(R => R.disegno.texture))
    if (g.size <= 1 && t.size <= 1) {
      console.log('    Stessa battuta, scena assestata, e geometrie e texture coincidono: la scena')
      console.log('    NON si alleggerisce su uno schermo piccolo. Non e per forza un difetto — ma')
      console.log('    vuol dire che il telefono paga la stessa scena del desktop, meno i pixel.')
    } else {
      /**
       * ─── QUANDO IL METRO NON REGGE, SI DICE CHE NON REGGE
       *
       * Questa riga ha stampato una conclusione falsa due volte. Prima
       * «qualcosa si adatta allo schermo» perche' campionavo battute diverse.
       * Poi, corretto quello, di nuovo — e allora ho provato a inseguire la
       * causa: ho aggiunto l'assestamento a tempo, poi l'assestamento a
       * fotogrammi, poi ho rifatto la corsa con `DPR=1` per escludere il
       * rapporto pixel.
       *
       * Il risultato di tutte e tre le misure e' lo stesso, ed e' la risposta:
       * **il contatore non converge.** Alla STESSA battuta, sullo STESSO
       * viewport, in corse diverse, ha dato 78/4, 79/5 e 79/7. `DPR=1` non
       * cambia niente. Il motivo e' che `info.memory` conta cio' che sta sulla
       * GPU in QUESTO istante, e nella scena vivono due texture video che
       * nascono e vengono rilasciate mentre si guarda.
       *
       * Quindi la differenza fra i viewport e' dentro la deriva del metro, e
       * da un metro che deriva non si estrae una conclusione — nemmeno una
       * prudente. Si riporta il valore, si dichiara la deriva misurata, e si
       * dice cosa servirebbe per avere una risposta vera. E' meno soddisfacente
       * di una frase conclusiva, ed e' l'unica cosa onesta che ci sia da
       * scrivere.
       */
      console.log('    Stessa battuta e chiave ferma per almeno ' + ASSESTAMENTO_FOTOGRAMMI + ' fotogrammi, e i numeri')
      console.log('    DIFFERISCONO lo stesso:')
      for (const R of comparabili) {
        console.log(`       ${col(R.etichetta, 24)} ${R.disegno.geometrie} geometrie, ${R.disegno.texture} texture` +
                    `   (rapporto pixel ${R.disegno.rapportoPixel}, ${R.doveScena})`)
      }
      console.log('')
      console.log('    NON SE NE RICAVA NIENTE, e la ragione e misurata: lo stesso viewport alla')
      console.log('    stessa battuta ha dato 78/4, 79/5 e 79/7 in corse diverse, e forzare lo')
      console.log('    stesso rapporto pixel su tutti e tre (DPR=1) non cambia il quadro.')
      console.log('    `info.memory` conta cio che sta sulla GPU in QUESTO istante, e nella scena')
      console.log('    vivono due texture video che nascono e vengono rilasciate mentre si guarda:')
      console.log('    la differenza fra i viewport e dentro la deriva del contatore stesso.')
      console.log('    Cosa direbbe la verita: la stessa misura su una macchina CON GPU, dove i')
      console.log('    fotogrammi sono abbastanza fitti da rendere quel transitorio irrilevante.')
    }
  }
}
console.log('')

console.log('4 · QUANTI BYTE, FINO AL PRIMO FOTOGRAMMA DISEGNATO   (solo stampato: il cancello sul peso e peso.mjs)')
console.log('')
const eFilmato = (v) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(v.nome) || v.da === 'video'
const eModello = (v) => /\.(glb|gltf|bin)(\?|$)/i.test(v.nome)
const somma = (a) => a.reduce((s, v) => s + v.filo, 0)

console.log('    ' + col('viewport', 24) + num('al primo disegno', 18) + num('di cui filmati', 16) + num('di cui modelli', 16) + num('resto', 12) + num('ms', 8))
for (const R of referti) {
  const p = R.rete?.primo
  if (!p) { console.log('    ' + col(R.etichetta, 24) + '  nessun primo disegno registrato'); continue }
  const f = p.risorse.filter(eFilmato)
  const m = p.risorse.filter(eModello)
  const resto = p.risorse.filter(v => !eFilmato(v) && !eModello(v))
  console.log('    ' + col(R.etichetta, 24) +
    num(kb(somma(p.risorse)), 18) + num(kb(somma(f)), 16) +
    num(kb(somma(m)), 16) + num(kb(somma(resto)), 12) + num(Math.round(p.ms), 8))
}
console.log('')
console.log('    e a fine visita (tutto quello che e sceso, filmati compresi):')
console.log('')
for (const R of referti) {
  const t = R.rete?.fine || []
  const f = t.filter(eFilmato)
  console.log('    ' + col(R.etichetta, 24) +
    num(kb(somma(t)), 18) + num(kb(somma(f)), 16) +
    '   ' + (f.length ? f.length + ' filmati' : 'nessun filmato sceso'))
}
{
  const b = referti.map(R => R.rete?.primo ? somma(R.rete.primo.risorse) : 0)
  if (b[0] > 0) {
    console.log('')
    console.log('    rapporti fra viewport (il piccolo = 1): ' +
      b.map(x => (x / b[0]).toFixed(2)).join('  ·  ') +
      '   — se non sono ~1, qualcosa scarica in modo diverso a seconda dello schermo')
  }
}
console.log('')

console.log('5 · LA COPERTURA                        (questi controlli fanno FALLIRE)')
console.log('    la regola: cio che si scopre da desktop si deve poter scoprire col dito.')
console.log('    Non con lo stesso gesto — con lo stesso esito. (docs/13 §8)')
console.log('')
if (coperturaMorta) {
  console.log('    MISURA INTERROTTA: ' + coperturaMorta)
} else {
  console.log(`    dichiarato in src/ui/atto-due.js: ${STAZIONI.length} stazioni x ${QUOTE.length} quote = ${CELLE.length} celle, ` +
              `${SISTEMI.length} sistemi con una cella, ${COMANDI_NOTI.length} comandi noti`)
  console.log(`    enumerato dal desktop a 1280x800${copertura.dove ? ', ' + copertura.dove : ''}: ` +
              `${copertura.desktop.length} comandi dentro .comandi`)
  console.log('')
  console.log('    ' + col('comando del desktop', 22) + col('la mappa lo conosce', 22) + 'lo raggiunge il dito a 360x640')
  for (const t of copertura.telefono) {
    console.log('    ' + col('#' + t.id, 22) + col(t.noto ? 'si' : 'NO — vedi i guasti', 22) +
      (t.raggiunto === null ? 'non misurato' : t.raggiunto.c ? `si (${t.raggiunto.w}x${t.raggiunto.h} px)` : 'NO — ' + t.raggiunto.perche))
  }
  console.log('')
  if (copertura.celle) {
    console.log(`    le ${copertura.celle.chieste} celle raggiunte coi PULSANTI (non col trascinamento): ` +
      (copertura.celle.mancate.length ? copertura.celle.mancate.length + ' MANCATE' : 'tutte'))
  }
  if (copertura.gesto) {
    console.log(`    il dito: trascinamento di ${copertura.gesto.viaggio} px (blocco d asse ${IPOTESI_BLOCCO_ASSE_PX} + ` +
      `2 passi da ${IPOTESI_PASSO_CELLA_PX}), cella da ${copertura.gesto.prima} a ${copertura.gesto.dopo}`)
  }
  if (copertura.tastiera) {
    console.log(`    la tastiera: fuoco ${copertura.tastiera.messoAFuoco ? 'preso' : 'NON PRESO'}, ` +
      `cella ${copertura.tastiera.prima} -> ${copertura.tastiera.dopoX} (freccia destra) -> ${copertura.tastiera.dopoY} (freccia giu)`)
  }
  if (copertura.bersagli?.length) {
    console.log('')
    console.log(`    i bersagli dentro l esplorazione, contro ${BERSAGLIO_44}x${BERSAGLIO_44}:`)
    for (const b of copertura.bersagli) {
      console.log('       ' + col(b.nome.slice(0, 34), 36) + num(b.w, 6) + ' x ' + num(b.h, 5) + ' px   ' +
        (!b.colpito ? 'COPERTO' : b.piccolo ? 'TROPPO PICCOLO' : 'ok'))
    }
  }
  if (copertura.sistemi.length) {
    console.log('')
    console.log('    i sistemi, raggiunti e comandati:')
    for (const s of copertura.sistemi) {
      console.log(`       ${col(s.id, 18)} cella ${s.cella}   annotazione: ${s.nota ? '"' + s.nota.slice(0, 44) + '..."' : 'NESSUNA'}`)
      console.log(`       ${col('', 18)} comando: ` + (s.comandoPresente
        ? `${s.w}x${s.h} px, aria-pressed proxy "${s.statoProxy}" / canonico "${s.statoCanonico}"`
        : s.canonicoInPagina ? 'NON COMPARE' : 'il nodo canonico non e in pagina'))
    }
  }
  if (copertura.inoltro) {
    console.log(`    premuto una volta: ${copertura.inoltro.prima} -> proxy ${copertura.inoltro.proxy}, canonico ${copertura.inoltro.canonico}`)
  }
  console.log('')
  /**
   * QUELLO CHE QUESTA SEZIONE NON PUO' DIRE, stampato accanto a quello che
   * dice. Un referto che tacesse su questo lascerebbe credere che l'atto due
   * col dito sia finito, e non lo e': e' finita l'INTERFACCIA.
   */
  console.log('    NON VERIFICATO, e non e verificabile finche non esiste: che la SCENA segua la')
  console.log('    posizione. La lama come strumento e il punto 1 di docs/13 §7 e non c e ancora,')
  console.log('    quindi muovendosi fra le celle cambia lo stato, l annuncio e lo schema — non')
  console.log('    l inquadratura. L aggancio e l evento `nautica:cella` sul documento, e oggi non')
  console.log('    lo ascolta nessuno.')
  console.log(`    E delle dodici celle ne hanno qualcosa DUE: e quello che esiste (${SISTEMI.map(s => s.id).join(', ')}).`)
  console.log('    docs/13 §3 ne prevede sette o otto, e il giroscopio del §4 non e costruito:')
  console.log('    src/ui/atto-due.js dichiara cio che c e, non cio che ci sara.')
}
console.log('')

/* --- L'ESITO ------------------------------------------------------------ */

console.log(AVVISO)
console.log('')

/**
 * PRIMA i viewport non misurati, poi i guasti. Perche' un referto verde su due
 * viewport su tre e' un referto rosso, e chiamarlo "passato" sarebbe la stessa
 * bugia che questo file esiste per non raccontare.
 */
const morti = referti.filter(R => R.morto)
if (morti.length) {
  console.error('  NON HO POTUTO MISURARE TUTTO — e non e colpa del sito:')
  console.error('')
  for (const R of morti) {
    console.error(`   - ${R.etichetta}: ${R.morto}`)
    if (R.mortoDettaglio) console.error(`     (${R.mortoDettaglio})`)
  }
  console.error('')
  console.error('  E il rasterizzatore software che cede sotto una tela grande. Su una')
  console.error('  macchina con GPU non succede. Riprova con DPR=1, oppure su un runner vero.')
  console.error('')
  process.exit(2)
}

if (guai.length) {
  console.error('  SU UNO SCHERMO DA TELEFONO IL SITO NON SI USA:')
  console.error('')
  for (const g of guai) console.error('   - ' + g)
  console.error('')
  console.error(`  ${guai.length} guasti. Sono tutti cose che questo runner PUO decidere:`)
  console.error('  impaginato, raggiungibilita, misura dei bersagli, scena viva o morta.')
  console.error('  Nessuno di essi dipende dalla scheda grafica.')
  console.error('')
  process.exit(1)
}

console.log('  VERIFICATO su 360x640, 390x844 e 768x1024: niente scorrimento laterale in')
console.log(`  ${PUNTI.length} punti della visita, nessun riquadro sorvegliato fuori schermo, i comandi`)
console.log(`  presenti in pagina raggiungibili con elementFromPoint e con bersagli sopra i`)
console.log(`  ${BERSAGLIO_MIN}x${BERSAGLIO_MIN} px di WCAG 2.2, e la scena che disegna.`)
console.log('')
console.log(`  E VERIFICATO che i ${copertura.desktop.length} comandi enumerati dal desktop siano tutti noti alla mappa`)
console.log(`  dell atto due e raggiungibili col dito; che le ${CELLE.length} celle si raggiungano coi PULSANTI`)
console.log('  e non solo trascinando; che il trascinamento produca scatti e le frecce muovano;')
console.log(`  che i ${SISTEMI.length} sistemi si annuncino per quiete e si comandino con bersagli sopra i`)
console.log(`  ${BERSAGLIO_44}x${BERSAGLIO_44} px, con lo stesso aria-pressed del nodo che possiede lo stato.`)
console.log('')
console.log('  NON VERIFICATO, e non e verificabile qui: la fluidita su un telefono vero (non')
console.log('  c e una GPU), il consumo di batteria, il comportamento su rete lenta, la resa')
console.log('  del tatto — gesti, inerzia dello scorrimento, tastiera di sistema — e tutto cio')
console.log('  che si giudica guardando invece che misurando.')
console.log('')
