/**
 * IL GUASTO CHE SI VEDE — l'annotazione di un pezzo che manca.
 *
 * Specifica: `docs/14-FOTOREALISMO.md` §2.1, ultima riga delle regole — «i nomi
 * sono API: se uno manca, il caricamento fallisce **in modo visibile**». Oggi
 * non fallisce: `impianto.js` respinge correttamente la promessa (righe
 * 115-121), e chi la riceve la ingoia in un `console.error`. Il sito continua,
 * il carter resta vuoto, e **la cosa che il sito serve a mostrare non c'e'
 * senza che niente lo dica.** Questo file e' la parte mancante, e le ragioni
 * per esteso stanno in `docs/21-GUASTO.md`.
 *
 * ─── DUE DESTINATARI, UN SOLO OGGETTO, DUE REGISTRI
 *
 * «Fallire in modo visibile» non e' una schermata rossa: e' due bisogni
 * diversi in due lingue diverse.
 *
 *   chi GUARDA    deve capire che sta vedendo qualcosa di incompleto, e dove
 *                 andare a leggere la cosa che non vede. Una riga, nella
 *                 lingua del sito.
 *   chi SVILUPPA  deve sapere COSA manca — quali nodi, quale file, quale
 *                 messaggio. Tre righe di diagnosi, che al visitatore non
 *                 servono e sporcherebbero l'inquadratura.
 *
 * La tentazione e' fare due cose. Qui e' UNA SOLA, che cambia registro su un
 * interruttore che il sito ha gia': `?ispeziona=1`. Senza, l'annotazione dice
 * la frase; con, sotto la frase compare il messaggio d'errore per intero. Non
 * c'e' un secondo componente da tenere allineato, e nessuno dei due
 * destinatari legge la posta dell'altro.
 *
 * ─── E PARLA LA LINGUA DEL SITO, O SEMBRA UN ERRORE DEL BROWSER
 *
 * Il sito e' un disegno tecnico: carta sopra la linea, acqua sotto, etichette
 * monospaziate in maiuscoletto spaziato. Un disegno tecnico ha gia' una
 * convenzione per il pezzo che non c'e': **la nota a margine** — `DETAIL NOT
 * SHOWN` — filo sottile sopra, etichetta, una frase. Non se ne inventa una
 * nuova.
 *
 * Sta SOPRA la linea, appoggiata alla linea, a destra. Sotto la linea il sito
 * MOSTRA; sopra PARLA — e' li' che vivono il titolo e le etichette. Ed e' la
 * simmetria di `#patto`, che sta appoggiato alla linea a sinistra e dichiara
 * cosa il modello e': questa dichiara cosa il modello non ha.
 *
 * Il colore e' `--inchiostro-tenue`, cioe' 4,82:1 sulla carta. NON e' il
 * `--tenue` che il nodo erediterebbe: la dimostrazione e' `data-lato="misto"`
 * e in quel ramo `--tenue` vale `--acqua-tenue`, che sulla carta fa 1,9:1. E'
 * esattamente il difetto D7 di `docs/18` — un colore calcolato contro un fondo
 * che a schermo non c'e' — e si evita ridefinendo il token sul nodo invece di
 * scrivere un colore a mano.
 *
 * ─── IL CASO PEGGIORE NON E' L'ERRORE: E' L'ATTESA
 *
 * Un `.glb` che non arriva mai produce un `reject`. Un `.glb` che arriva fra
 * dodici secondi non produce NIENTE — e sullo schermo i due casi sono lo
 * stesso identico carter vuoto. Se la visibilita' del guasto si aggancia solo
 * al `reject`, la rete lenta — il caso peggiore concreto — resta muta.
 *
 * Quindi `sorveglia()` guarda anche l'orologio: scaduta la pazienza dice «sta
 * ancora arrivando», e se poi arriva **si toglie di mezzo da sola**. Dire una
 * cosa provvisoria e ritirarla e' onesto; tacere e far fissare un buco no.
 *
 * ─── E SI VEDE DOVE LA COSA MANCA, NON QUANDO IL FILE FALLISCE
 *
 * Il caricamento parte quando la dimostrazione si avvicina allo schermo, cioe'
 * mentre chi guarda e' ancora nel salone. Un'annotazione su un dettaglio che
 * in quella battuta non e' inquadrato e' rumore: parla di una cosa che non si
 * vede. L'annotazione aspetta la battuta in cui il taglio si apre — la legge
 * da `.palco[data-battuta]`, che `regia.js` scrive gia' — e compare li'.
 *
 * ─── QUESTO FILE NON E' COLLEGATO A NIENTE
 *
 * Nessuno lo importa: `docs/21-GUASTO.md` §3 elenca le righe esatte da
 * cambiare in `src/scena/index.js`, che appartiene a un'altra sessione. Per
 * provarlo intanto senza collegarlo:
 *
 *     // la base e' /nautica/, non la radice: lo dice `vite.config.js`
 *     const g = await import('/nautica/src/scena/guasto.js')
 *     g.provaGuasto()                   // il guasto finto, annotazione inclusa
 *     g.provaGuasto({ stato: 'attesa' })
 *     g.guasti()
 *
 * Non importa niente — niente three, niente moduli del sito — apposta: un
 * annunciatore di guasti che dipende da cio' che si e' rotto e' l'ultima cosa
 * che si vuole in mano quando qualcosa si rompe.
 */

/** Il prefisso dei messaggi in console. Uno solo, cercabile. */
const TARGA = '[guasto]'

/**
 * Quanto si aspetta prima di dire che si sta aspettando.
 *
 * `impianto.glb` pesa 161 KB sul filo (brotli; 247 grezzi, meshopt). Su una
 * rete lenta vera — 400 kbit/s effettivi, il famigerato «3G lento» degli
 * strumenti — sono 3,2 s di solo trasferimento. Sei secondi e' quasi il doppio:
 * abbastanza da non accendersi su una connessione mediocre che sta comunque per
 * farcela, abbastanza poco da non lasciare fissare un carter vuoto in silenzio.
 *
 * QUESTO NUMERO E' UN VINCOLO, NON UNA NOTA. Il commento diceva 223 KB, ed e'
 * rimasto indietro quando il modello e' passato alla bassa con la normale
 * cotta: per qualche ora il file ne pesava 343 sul filo, cioe' 6,9 s, e questa
 * spia si sarebbe accesa esattamente sulla connessione per cui e' scritta per
 * NON accendersi. Segnalato da una revisione esterna, verificato, e curato
 * spedendo la normale a 512 invece che a 2048. Se il modello ricresce, o
 * risale questa soglia o si rimpicciolisce la mappa.
 *
 * NON e' una soglia di prestazione e non va usata come tale: non misura la
 * macchina, misura la pazienza di chi guarda.
 */
const ATTESA = 6000

/**
 * Le battute in cui il meccanismo E' l'inquadratura. Prima del taglio lo scafo
 * e' chiuso: manca lo stesso, ma non si vede che manca, e annotare una cosa
 * invisibile insegna solo che le annotazioni di questo sito parlano a vuoto.
 *
 * Gli identificativi vengono da `regia.js` (`salotto, emerge, mare, invito,
 * calma, taglio, meccanismo`). Se un giorno cambiano, questa lista non trova
 * piu' nessuna corrispondenza e l'annotazione non compare: e' il motivo per
 * cui `docs/21` chiede di leggerli da li' quando il modulo verra' collegato.
 */
const BATTUTE_RIVELATRICI = ['taglio', 'meccanismo']

/**
 * I TESTI. Inglese, come tutto il sito.
 *
 * Sono deliberatamente privi di parole d'errore — «error», «failed»,
 * «problem». Non per addolcire: perche' l'informazione utile a chi guarda non
 * e' che un programma e' andato storto, e' che **sullo schermo manca un
 * pezzo** e che il pezzo e' descritto altrove. Il collegamento e' lo stesso
 * ripiego che `index.html` usa quando manca WebGL: un solo posto dove il sito
 * dice il meccanismo a parole.
 */
const TESTI = {
  attesa: {
    etichetta: 'Detail not drawn yet',
    frase: 'The stabiliser assembly is still on its way. Until it arrives the housing on screen is empty.',
    invito: null
  },
  assente: {
    etichetta: 'Detail not shown',
    frase: 'The stabiliser assembly did not load, so the housing on screen is empty — and it is the part this page is about.',
    invito: { testo: 'How it is made', ancora: '#fattura', coda: ' describes it in full.' }
  }
}

/** Il registro. Chiave: il nome di cio' che manca. */
const registro = new Map()

let nodo = null           // l'annotazione, una sola
let stileMesso = false
let osservatore = null    // sorveglia `data-battuta` finche' non e' il momento

const ispeziona = () => {
  try { return location.search.includes('ispeziona') } catch { return false }
}

/**
 * TUTTO QUI DENTRO E' A PROVA DI SE STESSO.
 *
 * Un annunciatore di guasti che lancia un'eccezione dentro un `catch` non
 * rompe se stesso: rompe **anche la gestione del guasto vero**, e il referto
 * che arriva in console parla di lui invece che del difetto. Quindi ogni
 * incursione nel DOM passa di qui, e se fallisce resta almeno la riga in
 * console — che e' il minimo sindacale e non dipende da niente.
 */
function alRiparo (che, fn) {
  try { return fn() } catch (e) {
    console.error(`${TARGA} l'annuncio stesso e' fallito (${che})`, e)
    return null
  }
}

/* ═══════════════════ IL REGISTRO, e la parte leggibile a macchina ═══════ */

/**
 * `document.documentElement.dataset.guasti` porta i nomi di cio' che manca,
 * separati da virgola, e sparisce quando non manca piu' niente.
 *
 * Sta sull'elemento radice e non sul palco perche' un cancello deve poterlo
 * leggere con un selettore solo, senza sapere com'e' fatto l'impaginato e
 * senza che l'esistenza della dimostrazione sia una precondizione. E' la
 * stessa abitudine di `contenitore.dataset.spaccato` in `index.js`: lo stato
 * esce nel DOM, cosi' le diagnosi non devono entrare nel modulo.
 *
 * E' l'unico canale sempre acceso. `window.__nautica.guasti` esiste solo con
 * `?ispeziona=1`, e si AGGANCIA alla sonda che c'e' invece di crearne una: se
 * questo file creasse `window.__nautica`, `esporta-meccanismo.mjs` — che ne
 * verifica l'esistenza per decidere se la diagnostica e' sparita — leggerebbe
 * una sonda finta e direbbe che va tutto bene.
 */
function pubblica () {
  alRiparo('dataset', () => {
    const nomi = [...registro.entries()].filter(([, v]) => v.stato !== 'ok').map(([k]) => k)
    const radice = document.documentElement
    if (nomi.length) radice.dataset.guasti = nomi.join(',')
    else delete radice.dataset.guasti
  })
  alRiparo('sonda', () => {
    if (!ispeziona() || !window.__nautica) return
    window.__nautica.guasti = guasti()
  })
}

/** Fotografia del registro. Array semplice: si legge da un `evaluate()`. */
export function guasti () {
  return [...registro.entries()].map(([nome, v]) => ({
    nome, stato: v.stato, quanti: v.quanti, messaggio: v.messaggio, gravita: v.gravita
  }))
}

/* ═══════════════════ L'ANNOTAZIONE ═══════════════════════════════════════ */

/**
 * Il foglio di stile del sito non si tocca — `stile.css` non e' mio, e un
 * modulo che ha bisogno di due file per funzionare e' un modulo che qualcuno
 * collegherà a metà. Le regole entrano da qui, UNA VOLTA, e sono scritte con
 * i token del sito (`--u`, `--etichetta`, `--t-dato`, `--inchiostro-tenue`):
 * se la palette cambia, l'annotazione la segue invece di restare indietro con
 * dei colori copiati.
 *
 * ─── L'OPACITA' DEI FIGLI DEL PALCO NON E' LORO: E' DEL PALCO
 *
 * Trovato misurando, non leggendo. L'annotazione nasceva con
 * `data-visibile="no"` e a schermo si vedeva lo stesso: opacita' calcolata 1
 * invece di 0. La causa e' una riga di `stile.css`:
 *
 *     .palco > :not(.scena){opacity:calc(1 - var(--uscita, 0))}
 *
 * TUTTO cio' che sta sopra la scena si spegne mentre il capitolo esce di
 * campo — `--uscita` la scrive `demo.js` — e quella regola pesa (0,2,0),
 * esattamente quanto `.guasto[data-visibile="si"]`. A parita' vince l'ultima
 * scritta, cioe' una vittoria decisa dall'ordine di inserimento dei fogli: il
 * primo riordino la ribalta senza dare errore.
 *
 * Non si aggira, si RISPETTA: lo stato acceso vale `1 - uscita`, la stessa
 * espressione dei fratelli, cosi' l'annotazione esce di scena insieme al
 * capitolo invece di restare accesa sopra una nave che se ne va. Il selettore
 * sale a (0,3,0) perche' la precedenza sia decisa e non ereditata dall'ordine.
 *
 * E' anche il primo motivo per cui questo modulo doveva essere PROVATO e non
 * solo scritto: leggendolo, il difetto non c'era.
 */
function mettiStile () {
  if (stileMesso) return
  stileMesso = true
  alRiparo('stile', () => {
    const s = document.createElement('style')
    s.id = 'stile-guasto'
    s.textContent = `
.guasto{
  position:absolute;right:var(--u4,32px);bottom:calc(50% + var(--u3,24px));z-index:8;
  width:min(34ch,38vw);
  /* il filo della nota a margine: lo stesso grigio dei filetti di .numeri */
  border-top:1px solid rgba(95,99,103,.32);padding-top:var(--u,8px);
  /* il token del ramo "sopra", perche' qui il fondo e' carta.
     Ereditarlo da [data-lato="misto"] darebbe --acqua-tenue: 1,9:1. */
  --tenue:var(--inchiostro-tenue,#5F6367);
  color:var(--inchiostro-tenue,#5F6367);
  opacity:0;transition:opacity .45s;pointer-events:none;
}
.guasto[data-visibile="si"]{opacity:1}
/* l'opacita' dei figli del palco e' del palco: vedi il commento qui sopra */
.palco > .guasto[data-visibile="no"]{opacity:0}
.palco > .guasto[data-visibile="si"]{opacity:calc(1 - var(--uscita, 0))}
.guasto p{margin-top:var(--u,8px);font-size:14px;line-height:1.45;max-width:none}
.guasto a{
  pointer-events:auto;color:var(--inchiostro,#15181B);
  text-decoration-thickness:1px;text-underline-offset:3px;
}
/* D3 di docs/18: la dimostrazione e' data-lato="misto" e non entra mai nel
   ramo "sopra", quindi l'anello del fuoco resterebbe verde su carta (1,31:1).
   Qui il fondo e' carta per costruzione, e l'anello diventa inchiostro. */
.guasto a:focus-visible{outline-color:var(--inchiostro,#15181B)}
.guasto .diagnosi{
  margin-top:var(--u2,16px);font-family:var(--t-dato,ui-monospace,monospace);
  font-variation-settings:'MONO' 1,'CASL' 0,'slnt' 0,'CRSV' 0;
  font-size:11px;line-height:1.5;white-space:pre-wrap;word-break:break-word;
  color:var(--inchiostro,#15181B);opacity:.72;
}
@media (max-width:820px){
  .guasto{left:var(--u2,16px);right:var(--u2,16px);width:auto;
    bottom:calc(50% + var(--u2,16px))}
  .guasto p{font-size:13px}
}
/* Il movimento ridotto toglie la dissolvenza, non l'annotazione: e' la regola
   del repo — la preferenza si onora DENTRO l'esperienza, non spegnendola. */
@media (prefers-reduced-motion:reduce){ .guasto{transition:none} }
`
    document.head.appendChild(s)
  })
}

/** Dove si appende: il palco della dimostrazione, o niente. */
function palco () {
  return document.querySelector('#dimostrazione .palco') || document.querySelector('.palco')
}

function costruisci (stato) {
  const el = document.createElement('aside')
  el.className = 'guasto'
  el.dataset.guasto = stato
  el.dataset.visibile = 'no'
  /**
   * `role="note"` piu' `aria-live="polite"`. La lezione D6 di `docs/18` e' che
   * le regioni vive che parlano a ogni fotogramma sono peggio del silenzio —
   * ma questa cambia due volte in tutta la visita, come `#battuta`, che e'
   * l'unica regione dichiarata a mano ed e' l'unica che non urla. Un pezzo che
   * sparisce dal disegno e' esattamente la cosa che va annunciata.
   */
  el.setAttribute('role', 'note')
  el.setAttribute('aria-live', 'polite')
  scrivi(el, stato)
  return el
}

function scrivi (el, stato) {
  const t = TESTI[stato] || TESTI.assente
  el.textContent = ''
  const et = document.createElement('p')
  et.className = 'et'
  et.textContent = t.etichetta
  el.appendChild(et)

  const p = document.createElement('p')
  p.textContent = t.frase
  if (t.invito) {
    p.append(' ')
    const a = document.createElement('a')
    a.href = t.invito.ancora
    a.textContent = t.invito.testo
    p.appendChild(a)
    p.append(t.invito.coda)
  }
  el.appendChild(p)

  /**
   * IL SECONDO REGISTRO. Sotto `?ispeziona=1` la stessa annotazione porta il
   * messaggio d'errore per intero — quello che `impianto.js` ha scritto, con
   * l'elenco dei nodi mancanti. Chi sviluppa non deve andarselo a cercare in
   * console fra le altre righe, ed e' attaccato alla cosa che descrive.
   */
  if (ispeziona()) {
    const d = document.createElement('pre')
    d.className = 'diagnosi'
    d.textContent = guasti().map(g =>
      `${g.nome} — ${g.stato}${g.quanti > 1 ? ` ×${g.quanti}` : ''}\n${g.messaggio || '(nessun messaggio)'}`
    ).join('\n\n')
    el.appendChild(d)
  }
}

/**
 * Mostra, ma non prima che la cosa mancante sia quella che si sta guardando.
 *
 * Se il palco non ha ancora una battuta — la scena non e' partita, oppure
 * `regia.js` non ha ancora scritto niente — si aspetta con un osservatore
 * invece di indovinare un ritardo. Se il palco non c'e' proprio (pagina di
 * prova, dimostrazione rimossa), resta la riga in console: annotare uno
 * schermo che non contiene la scena non informa nessuno.
 */
function mostra (stato) {
  alRiparo('annotazione', () => {
    const p = palco()
    if (!p) return
    mettiStile()
    if (!nodo || !nodo.isConnected) { nodo = costruisci(stato); p.appendChild(nodo) }
    else { nodo.dataset.guasto = stato; scrivi(nodo, stato) }

    const questo = nodo
    const adesso = () => BATTUTE_RIVELATRICI.includes(p.dataset.battuta)
    // nessuna battuta scritta da nessuno: non c'e' regia da aspettare
    const senzaRegia = !p.dataset.battuta
    if (adesso() || senzaRegia) { accendi(questo); return }
    if (osservatore) return
    osservatore = new MutationObserver(() => { if (adesso()) { accendi(questo); stacca() } })
    osservatore.observe(p, { attributes: true, attributeFilter: ['data-battuta'] })
  })
}

/**
 * Accende QUEL nodo, non «il nodo».
 *
 * Prima leggeva la variabile di modulo dentro un doppio `requestAnimationFrame`
 * — e nel collaudo si e' presentata la conseguenza: fra la richiesta e il
 * fotogramma il nodo era gia' cambiato, e l'accensione finiva su un elemento
 * diverso da quello che l'aveva chiesta. Uno stato condiviso letto in
 * differita e' un guasto in attesa; il riferimento si passa.
 */
function accendi (quale) {
  const el = quale || nodo
  if (!el) return
  /**
   * ─── E NON ASPETTA I FOTOGRAMMI
   *
   * Prima erano due `requestAnimationFrame` annidati — l'abitudine per far
   * partire una transizione su un nodo appena creato. Misurato nel collaudo,
   * su un browser senza GPU che disegna a ~1 fps, quei due fotogrammi sono
   * **un secondo e mezzo** prima che l'avviso cominci anche solo a comparire.
   * E' esattamente la macchina su cui l'avviso serve di piu': quella lenta.
   *
   * Leggere una proprieta' di layout forza il ricalcolo dello stile, cioe'
   * fissa lo stato iniziale `opacity:0`; da li' il cambio di attributo e' una
   * transizione vera. Il tempo non dipende piu' da quanto in fretta la scheda
   * grafica disegna la nave.
   */
  void el.offsetHeight
  el.dataset.visibile = 'si'
}

function stacca () {
  if (!osservatore) return
  osservatore.disconnect()
  osservatore = null
}

/**
 * Ritira l'annotazione: il pezzo e' arrivato, e quello che si diceva non vale
 * piu'.
 *
 * Toglie di mezzo TUTTI i nodi `.guasto` del documento, non quello che la
 * variabile di modulo crede di avere in mano. Nel collaudo la variabile e il
 * DOM si sono trovati in disaccordo — il nodo restava a schermo con lo stato
 * gia' rientrato — e per una funzione che serve a NON lasciare a schermo una
 * cosa falsa, fidarsi del proprio stato interno e' la scelta sbagliata: si
 * guarda il documento, che e' la cosa che il visitatore vede davvero.
 */
function ritira () {
  stacca()
  alRiparo('ritiro', () => {
    nodo = null
    for (const via of document.querySelectorAll('.guasto')) {
      via.dataset.visibile = 'no'
      setTimeout(() => via.remove(), 500)
    }
  })
}

/* ═══════════════════ L'API ══════════════════════════════════════════════ */

/**
 * GRAVITA — non tutto quello che manca merita di essere annotato.
 *
 *   'tesi'      senza questo il sito mostra una cosa diversa da quella che
 *               dichiara. L'impianto e' la tesi: un carter vuoto in primo
 *               piano e' una bugia in faccia a chi e' arrivato fin li'.
 *               -> annotazione + console + dataset.
 *   'contorno'  manca qualcosa e la scena e' piu' povera, ma cio' che resta
 *               non mente. La sovrastruttura senza i due ponti e' una barca a
 *               un livello: incompleta, non falsa.
 *               -> console + dataset, nessuna annotazione.
 *
 * La riga di confine e' una domanda sola: **cio' che resta a schermo dice il
 * falso?** Se si, si annota. Se no, si registra e si va avanti — perche' un
 * sito che avvisa di tutto insegna a non leggere gli avvisi.
 */
export const GRAVITA = { TESI: 'tesi', CONTORNO: 'contorno' }

/**
 * Dichiara un guasto gia' accaduto.
 *
 * @param {string} nome      cosa manca — 'impianto', 'sovrastruttura'…
 * @param {Error|string} errore
 * @param {object} [opzioni]
 * @param {string} [opzioni.gravita]  vedi GRAVITA
 * @param {string} [opzioni.stato]    'assente' (predefinito) o 'attesa'
 */
export function dichiara (nome, errore, { gravita = GRAVITA.TESI, stato = 'assente' } = {}) {
  const messaggio = errore && errore.message ? errore.message : String(errore ?? '')
  const gia = registro.get(nome)
  /**
   * DUE PINNE, UN FILE, UN GUASTO SOLO.
   *
   * `index.js` costruisce un impianto per aggancio: se il GLB non arriva,
   * respingono TUTTE E DUE le promesse con lo stesso messaggio. Due
   * annotazioni identiche una sopra l'altra sarebbero il modo piu' rapido di
   * far sembrare rotto il sito invece del modello. Si conta e si annota una
   * volta: il numero finisce nella diagnosi, dove serve.
   */
  registro.set(nome, {
    stato, messaggio, gravita,
    quanti: gia && gia.stato === stato ? gia.quanti + 1 : 1
  })
  pubblica()

  if (gia && gia.stato === stato) return
  if (stato === 'assente') console.error(`${TARGA} ${nome}: ${messaggio}`)
  else console.warn(`${TARGA} ${nome}: non e' ancora arrivato dopo ${ATTESA} ms`)

  if (gravita === GRAVITA.TESI) mostra(stato)
}

/** Il guasto e' rientrato: il pezzo e' arrivato. */
export function risolto (nome) {
  const v = registro.get(nome)
  registro.set(nome, { stato: 'ok', messaggio: '', gravita: v?.gravita ?? GRAVITA.TESI, quanti: 0 })
  pubblica()
  if (v && v.stato !== 'ok') ritira()
}

/**
 * SORVEGLIA una promessa di caricamento: il modo previsto di usare questo file.
 *
 *     sorveglia(i.caricato, { nome: 'impianto' })
 *
 * Restituisce una promessa che **non respinge mai** — si e' gia' occupata lei
 * del rifiuto — e che vale `true` se il pezzo e' arrivato. Cosi' chi la
 * collega non ha bisogno di un `catch` proprio, e non puo' ingoiare due volte
 * lo stesso guasto.
 *
 * @param {Promise} promessa
 * @param {object} opzioni
 * @param {string} opzioni.nome
 * @param {string} [opzioni.gravita]
 * @param {number} [opzioni.attesa]  ms prima di dire che si sta aspettando
 */
export function sorveglia (promessa, { nome, gravita = GRAVITA.TESI, attesa = ATTESA } = {}) {
  let finita = false
  const orologio = attesa > 0
    ? setTimeout(() => { if (!finita) dichiara(nome, 'in transito', { gravita, stato: 'attesa' }) }, attesa)
    : null

  return Promise.resolve(promessa).then(
    () => { finita = true; clearTimeout(orologio); risolto(nome); return true },
    (e) => { finita = true; clearTimeout(orologio); dichiara(nome, e, { gravita }); return false }
  )
}

/**
 * LA PROVA A MANO, perche' un avviso che non si e' mai visto non e' un avviso.
 *
 *     const g = await import('/src/scena/guasto.js'); g.provaGuasto()
 *
 * Fabbrica il guasto vero — lo stesso messaggio che `impianto.js` scrive
 * quando mancano i nodi — senza toccare il modello ne' la rete. Per la prova
 * end-to-end con un `.glb` troncato vedi `docs/21-GUASTO.md` §4.
 */
export function provaGuasto ({ nome = 'impianto', stato = 'assente' } = {}) {
  const finto = new Error(
    'impianto.glb: mancano i nodi RIG_CYCLO_A, RIG_CYCLO_B. ' +
    'I nomi sono il contratto di docs/14 §2.1 e non si rinominano.')
  dichiara(nome, stato === 'attesa' ? 'in transito' : finto, { stato })
  return guasti()
}

/** Toglie tutto: utile fra due prove nella stessa pagina. */
export function azzera () {
  registro.clear()
  stacca()
  nodo = null
  for (const n of document.querySelectorAll('.guasto')) n.remove()
  pubblica()
}

