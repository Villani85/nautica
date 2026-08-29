/**
 * IL COMPOSITO DEL SALONE — tre strati, e la differenza fra due di essi e' la tesi.
 *
 * Il capitolo non e' piu' una scena in tempo reale: e' una **fotografia che
 * reagisce**. La scena 3D resta e continua a servire, ma cambia mestiere —
 * diventa la SAGOMA da cui le fotografie sono generate (`npm run sagome`), e si
 * puo' ancora aprire con `?sagoma=1`.
 *
 * ─── PERCHE' UNA FOTOGRAFIA
 *
 * La stanza in tempo reale era corretta e fredda: volumi, materiali piatti,
 * persone fatte di scatole. Abbastanza per capire, non abbastanza per sentire.
 * E inseguire il fotorealismo in tempo reale con figure umane generate e' la
 * zona peggiore — abbastanza realistiche da far notare mani e volti sbagliati,
 * non abbastanza da sembrare vere.
 *
 * ─── PERCHE' UNA FOTOGRAFIA NON BASTA
 *
 * Perche' una foto non sa spegnere lo stabilizzatore, ed e' la sola cosa che
 * questo sito rivendica di saper fare. Quindi tre strati:
 *
 *   1. **il mare** — filmato, in fondo, e **NON ruota**;
 *   2. **la stanza** — fotografia coi finestrini bucati dalla maschera, e
 *      **ruota con il rollio vero della simulazione**;
 *   3. **la cornice** — l'apertura sulla pagina, e non si muove mai.
 *
 * Fra il primo e il secondo strato c'e' tutto l'argomento: la stanza si inclina
 * contro un orizzonte che non si inclina con lei. Non e' un effetto — e' dove
 * stanno i due strati.
 *
 * ─── LE DUE POSE
 *
 * Una fotografia sola, ruotata, mostrerebbe due persone **serene mentre la
 * stanza sbanda**: geometricamente giusto ed emotivamente falso. Le pose sono
 * due — a riposo, e con la mano piatta sul tavolo — e si dissolvono seguendo
 * l'angolo.
 *
 * Sono **entrambe diritte**, e questo semplifica tutto: la seconda e' stata
 * generata a partire dalla prima, quindi ha la stessa inquadratura, le stesse
 * facce, gli stessi materiali. Ruotano insieme dello stesso angolo e si
 * sovrappongono senza scavallare. Un primo tentativo aveva l'inclinazione
 * IMPRESSA nella fotografia: era piu' bella e inservibile, perche' il modello
 * aveva riquadrato e le due immagini non si allineavano piu'.
 */

/**
 * LA POSA HA MEMORIA, e senza sarebbe una bugia psicologica.
 *
 * La prima stesura sceglieva la posa dall'angolo ISTANTANEO: sotto 2,5 gradi
 * sereni, sopra 6 tesi. Sembra ragionevole e non lo e', perche' una nave che
 * rolla **attraversa lo zero due volte per ciclo**. Misurato con il sistema
 * spento, ventidue secondi a dieci gradi di ampiezza:
 *
 *     ---.....-TTTT-..TTTTT..TTTTT..TTTTT-..TTTTTT.
 *
 * **Cinque volte** le due persone tornavano completamente serene mentre la
 * stanza sbandava, per irrigidirsi un secondo dopo. Nessuno si rilassa a meta'
 * di un'onda: si resta all'erta finche' non si e' convinti che sia finita. E
 * a schermo non si legge come sollievo, si legge come **due fotografie che
 * lampeggiano**.
 *
 * Quindi la tensione si accende al primo rollio serio e si spegne solo quando
 * la calma DURA. Non e' un ritardo cosmetico: e' la differenza fra un
 * interruttore e una persona.
 */
const ACCENDE = 5.0     // gradi: sopra questo, ci si irrigidisce
const CALMO = 2.0       // gradi: sotto questo si comincia a contare la calma
const CONVINCE = 1.6    // secondi di calma prima di rilassarsi davvero
/**
 * QUANTO IN FRETTA LA POSA INSEGUE LO STATO, e 2,6 era troppo lento.
 *
 * Con 2,6 la dissolvenza impiega **0,88 s** ad arrivare al 90% (ln 10 / V), e
 * per quasi tutto quel tratto le due pose convivono a schermo sovrapposte: a
 * 850 px di larghezza non si legge come una persona che si irrigidisce, si
 * legge come **quattro persone**. E' stato scambiato per un difetto della
 * maschera per tre tentativi, finche' il composito fatto fuori dal sito — stessa
 * maschera, posa tesa piena — ha dato due persone pulite. La maschera era giusta
 * dal terzo tentativo: era il TEMPO a essere sbagliato.
 *
 * Con 8 il passaggio dura 0,29 s, che e' quanto ci mette davvero un braccio ad
 * andare a puntellarsi. La finestra ambigua si misura invece di sperarci:
 * `palco.dataset.posa` porta fuori q, e `collaudo-posa.mjs` conta quanti
 * secondi al minuto la posa sta fra 0,2 e 0,8.
 */
const VELOCITA = 8

const TRASF_MARE = 'scale(1.55)'

/* L'unica dipendenza di questo modulo, e sta qui e non in testa al file perche'
   la testa e' occupata dal ragionamento che spiega cos'e' un composito. Il
   ritardo della reazione umana e' un'IPOTESI, e le ipotesi di questo repo
   stanno tutte in un posto solo: `src/ui/soglie.js` dice perche'. */
import { IPOTESI_RITARDO_UMANO_S, IPOTESI_ROLLIO_AVVERTITO_RMS } from '../ui/soglie.js'

export function creaComposito (contenitore, base) {
  const nuovo = (classe, tag = 'div') => {
    const e = document.createElement(tag)
    e.className = classe
    contenitore.appendChild(e)
    return e
  }

  /**
   * ─── UNA CLIP SOLA, DISEGNATA DUE VOLTE
   *
   * E' la forma piu' semplice che questo capitolo abbia mai avuto, e ci siamo
   * arrivati buttando via tutto il resto.
   *
   *   sotto   la stessa clip, FERMA: e' il mare, e non si inclina mai;
   *   sopra   la stessa clip, RUOTATA col rollio vero e col vetro bucato:
   *           e' la stanza.
   *
   * L'apertura scorre e si inclina sopra un orizzonte che non si muove. Non c'e'
   * nessuna riga che tenga fermo il mare: e' fermo perche' nessuno lo tocca.
   *
   * E siccome le due sorgenti sono LO STESSO FILE, al bordo del vetro grana,
   * colore e compressione sono gli stessi. Non e' una taratura riuscita: e' una
   * proprieta' di costruzione.
   *
   * ATTENZIONE A COSA SI PUO' DIRE, e nel commit precedente l'avevo scritto
   * troppo forte. «Combacia al pixel» **non e' vero**: la copia del mare e'
   * ingrandita del 35% per coprire quel che l'apertura scopre inclinandosi,
   * quindi la geometria delle onde e' diversa. Cio' che combacia e' la
   * TAVOLOZZA — grana, colore, contrasto, artefatti di compressione — che e'
   * esattamente cio' che tradisce un fotomontaggio. La geometria non serve che
   * combaci, perche' attraverso il vetro si vede solo il mare: non c'e' niente
   * accanto con cui confrontarlo.
   *
   * ─── COSA E' SPARITO, e vale la pena saperlo
   *
   * Prima c'erano tre maschere — finestrini, persone, complemento — piu' due
   * fotografie e un filmato di mare a parte. Le tre maschere si combattevano:
   * quella dei finestrini bucava anche il ritaglio delle persone, perche' le
   * teste erano appoggiate ai vetri. Da li' nascevano **le quattro persone a
   * schermo** e **l'alone attorno ai volti**, e nessuna taratura li chiudeva.
   *
   * La cura non e' stata tarare meglio: e' stata cambiare la fotografia. Una
   * stanza con UN finestrone solo e **nessuno davanti al vetro** rende quei
   * difetti impossibili invece che rari.
   */
  const CALMA = 'filmati/salone-largo.mp4'
  /**
   * ─── LA POSA PUNTELLATA E' SPENTA ANCHE QUI, e prima puntava nel vuoto
   *
   * `salone-teso.mp4` e' stato tolto dal repo in 23a15ee, con una ragione buona
   * -- viene da un'altra generazione, e' una ripresa NOTTURNA col finestrone
   * nero e un'inquadratura diversa, 72 livelli su 255 di differenza media dalla
   * clip calma. `salone3d.js` l'ha spenta di conseguenza. **Questo file no**, e
   * il riferimento e' rimasto a puntare un file che non c'e' piu'.
   *
   * E non dava errore, che e' il punto. Sotto il base `/nautica/` un file
   * mancante torna **200 con dentro `index.html`**: il `<video>` riceve HTML,
   * `loadeddata` non scatta mai, e lo strato resta vuoto in silenzio. Trovato
   * da una revisione esterna che ha guardato la RETE invece del codice.
   *
   * Questo e' il ramo `?doppia=1`, cioe' il paracadute da aprire se il salone
   * 3D non reggesse su un telefono vero. Un paracadute che non si apre e' peggio
   * di nessun paracadute, perche' ci si conta sopra.
   */
  const TESA = null

  const filmato = (classe, sorgente) => {
    const v = nuovo(classe, 'video')
    v.src = base + sorgente
    v.loop = true; v.muted = true; v.playsInline = true; v.preload = 'auto'
    v.setAttribute('aria-hidden', 'true')
    v.addEventListener('loadeddata', () => {
      v.play().catch(() => { /* rifiutata: resta il primo fotogramma, che e' la posa giusta */ })
    }, { once: true })
    return v
  }

  /**
   * 1 · IL MARE. Ingrandito, perche' quando la stanza si inclina l'apertura
   * scorre e dietro deve trovare acqua anche dove nella clip c'e' la paratia.
   * L'ingrandimento sposterebbe l'orizzonte in su': lo si riporta giu' con una
   * traslazione calcolata, non a occhio — l'orizzonte sta al 45,9% dell'altezza,
   * quindi scalando di 1,35 attorno al centro sale dell'1,4%.
   */
  /**
   * IL MARE SI INGRANDISCE DI PIU' DI PRIMA, perche' adesso RUOTA.
   *
   * A 1,35 copriva lo scorrimento dell'apertura mentre la stanza si inclinava.
   * Ora e' il mare a girare, e ruotando di 12 gradi un rettangolo scopre gli
   * angoli: serve 1,55 perche' la diagonale resti coperta. Il conto, non una
   * taratura — mezza diagonale su mezza larghezza, per un palco 2:1, fa 1,52.
   *
   * E il PIVOT sta sull'orizzonte, non al centro del video: se il mare ruotasse
   * attorno al proprio centro, l'orizzonte si alzerebbe e abbasserebbe mentre
   * gira. Attorno all'orizzonte, invece, la linea resta dov'e' e si limita a
   * inclinarsi — che e' esattamente cio' che vede chi sta dentro.
   */
  const mare = filmato('composito__mare', CALMA)

  /**
   * 2 · LA STANZA. Ruota col rollio vero, e la maschera le buca il vetro.
   * `mask-mode: luminance`: il bianco mostra, quindi il vetro nella maschera e'
   * NERO. Scritta nel verso intuitivo la stanza comparirebbe solo dentro il
   * finestrino — gia' successo una volta.
   */
  const stanza = filmato('composito__stanza', CALMA)
  const m = `url(${base}salone/finestrone.png)`
  stanza.style.webkitMaskImage = m
  stanza.style.maskImage = m

  /**
   * 3 · LA POSA PUNTELLATA. Stessa inquadratura, stessa maschera, e compare
   * sopra la calma quando la stanza rolla davvero.
   *
   * E' l'ultimo pezzo che mancava al capitolo. Senza, le persone bevevano
   * tranquille mentre la stanza sbandava: geometricamente corretto ed
   * emotivamente falso, e per un SOTY e' il difetto che uccide — proprio quando
   * dovrebbe crescere il disagio, la gente smette di reagire.
   *
   * DUE DIFETTI NOTI, scritti invece che sperati:
   *
   *   1. nella clip calma la donna tiene un TUMBLER, in questa un CALICE.
   *      Alla dissolvenza il bicchiere cambia tipo. E' piccolo in campo e la
   *      dissolvenza dura tre decimi, ma c'e'. Su sei generazioni nessuna ha
   *      tenuto lo stesso bicchiere per dieci secondi;
   *   2. la clip dura sei secondi contro i nove della calma. Si e' presa la
   *      CODA dell'originale, perche' nei primi tre secondi il bicchiere si
   *      trasformava. La posa puntellata deve TENERE, non trasformarsi: la coda
   *      e' anche la parte giusta, non solo quella pulita.
   */
  const tesa = TESA ? filmato('composito__stanza composito__stanza--tesa', TESA) : null
  if (tesa) {
    tesa.style.webkitMaskImage = m
    tesa.style.maskImage = m
    tesa.style.opacity = '0'
  }

  /**
   * I due elementi puntano allo STESSO file: il browser lo scarica una volta
   * sola. Ma sono due decodifiche indipendenti, che partono a istanti diversi —
   * e attraverso il vetro si vedrebbe un mare sfasato di qualche fotogramma
   * rispetto a quello della clip. Sul mare non si nota, ma allinearli costa una
   * riga e toglie il dubbio.
   */
  /**
   * E SI RIALLINEANO OGNI TANTO, non solo all'avvio.
   *
   * Allinearli una volta sola non basta: sono due decodifiche indipendenti e
   * derivano. Misurato mentre il capitolo gira, lo sfasamento cresce da 0,041 a
   * **0,100 secondi** in una quindicina di secondi, cioe' due fotogrammi e
   * mezzo. Sul mare non si vede — l'onda attraverso il vetro e' semplicemente
   * l'onda di un istante vicino — ma e' un numero che cresce, e i numeri che
   * crescono vanno fermati prima di scoprire dove arrivano.
   *
   * Si corregge solo quando lo scarto supera un fotogramma pieno: riscrivere
   * `currentTime` a ogni giro farebbe scattare la decodifica invece di lasciarla
   * scorrere.
   */
  const RIALLINEA = 1 / 24
  const sincronizza = () => {
    if (mare.readyState < 2 || stanza.readyState < 2) return
    if (Math.abs(mare.currentTime - stanza.currentTime) > RIALLINEA) {
      try { mare.currentTime = stanza.currentTime } catch { /* non ancora pronto */ }
    }
  }
  stanza.addEventListener('loadeddata', sincronizza, { once: true })
  const orologio = setInterval(sincronizza, 2000)
  contenitore.addEventListener('nautica:chiudi', () => clearInterval(orologio), { once: true })

  contenitore.setAttribute('role', 'img')
  contenitore.setAttribute('aria-label',
    'The saloon of a large yacht in a force four sea. Through a single wide window the ocean is running with whitecaps under heavy cloud, and the horizon stays level. Inside, two people sit talking over drinks in warm lamplight.')

  /**
   * ─── LA POSA HA MEMORIA, e senza sarebbe una bugia psicologica.
   *
   * Scegliere la posa dall'angolo ISTANTANEO sembra ragionevole e non lo e',
   * perche' una nave che rolla **attraversa lo zero due volte per ciclo**.
   * Misurato sul capitolo vecchio, ventidue secondi a dieci gradi di ampiezza:
   *
   *     ---.....-TTTT-..TTTTT..TTTTT..TTTTT-..TTTTTT.
   *
   * Cinque volte le due persone tornavano completamente serene mentre la stanza
   * sbandava, per irrigidirsi un secondo dopo. Nessuno si rilassa a meta' di
   * un'onda: si resta all'erta finche' non si e' convinti che sia finita. E a
   * schermo non si legge come sollievo, si legge come due clip che lampeggiano.
   */
  /**
   * ─── E LA GRANDEZZA NON E' PIU' L'ANGOLO ISTANTANEO, MA LA SUA RMS
   *
   * L'isteresi qui sopra curava il sintomo giusto con la grandezza sbagliata.
   * Un angolo istantaneo attraversa lo zero due volte per ciclo, quindi
   * serviva una memoria (`CONVINCE`) per non farlo lampeggiare -- cioe' un
   * secondo meccanismo per compensare il primo.
   *
   * `S.rollioRms` -- valore efficace su quattro secondi, calcolato una volta
   * sola in `simulazione.js` -- non attraversa lo zero. La memoria resta
   * perche' serve comunque (nessuno si rilassa a meta' di un'onda), ma adesso
   * lavora su una grandezza che dice davvero **quanto la nave e' agitata**, che
   * e' cio' a cui un corpo reagisce.
   *
   * LE SOGLIE SONO MISURATE, non scelte. Sullo stesso mare e alla stessa
   * andatura, `rollioRms` a regime:
   *
   *     stabilizzatore ACCESO    mare 2  0,14-0,35    mare 5  0,35-0,89 gradi
   *     stabilizzatore SPENTO    mare 2  2,07-3,70    mare 5  5,17-9,24
   *
   * Fra 0,89 e 2,07 c'e' un vuoto largo piu' del doppio, e le due soglie ci
   * stanno dentro con margine da tutte e due le parti. Non e' una taratura a
   * occhio: e' una separazione che la fisica produce da sola, perche' fra le
   * due condizioni ci sono undici punti di guadagno di risonanza.
   *
   * ─── IL RITARDO E' BIOLOGICO, E NON E' UN RITARDO DI SISTEMA
   *
   * La reazione non parte nel fotogramma in cui la soglia viene superata.
   * Nessuno si irrigidisce nell'istante in cui la nave si muove: si registra il
   * movimento, poi il corpo risponde. Senza questo ritardo la coppia si
   * muoveva **insieme al clic**, e a schermo si leggeva come un'animazione
   * innescata da un bottone -- che e' esattamente cio' che il sito sostiene di
   * non essere.
   *
   * `IPOTESI_RITARDO_UMANO_S` porta il suo grado di verita' nel nome, come
   * tutte le altre soglie non validate su persone.
   *
   * ─── E LA PRESA E' PIU' RAPIDA DEL RILASCIO, che e' come funziona un corpo
   *
   * Afferrare un bicchiere che scivola e' un riflesso; lasciarlo andare e'
   * una decisione, e arriva quando si e' convinti. Due costanti diverse, e la
   * differenza si vede: la coppia si irrigidisce in circa un terzo di secondo e
   * si scioglie in poco piu' di uno. Con una costante sola il ritorno alla
   * calma sembrava uno stacco di montaggio invece di due spalle che scendono.
   */
  /* La soglia della TENSIONE non e' locale, e non deve esserlo: la legge anche
     `src/ui/nudge.js` per far comparire «Try the gyro». Il suggerimento arriva
     nell'istante in cui questa coppia si irrigidisce, ed e' la tesi del sito --
     due numeri separati prima o poi divergono, e allora il sito suggerirebbe
     una cura per un male che nessuno sta vedendo. */
  const ACCENDE_RMS = IPOTESI_ROLLIO_AVVERTITO_RMS
  /* Il RILASCIO invece e' solo di chi sta seduto qui: non c'e' nessun altro che
     debba sapere quando queste due persone si convincono che sia finita. */
  const CALMO_RMS = 1.1     // gradi RMS: sotto questo si comincia a contare la calma
  const CONVINCE = 1.6      // secondi di calma prima di rilassarsi davvero
  const PRENDE = 3.4        // 1/s: circa 0,29 s per irrigidirsi -- un riflesso
  const LASCIA = 0.9        // 1/s: circa 1,1 s per sciogliersi -- una decisione

  let allerta = false
  let calmaDa = 0
  let daQuando = 0          // secondi da quando la soglia e' stata superata
  let q = 0

  /**
   * @param {number} gradi il rollio istantaneo: serve alla STANZA, che deve
   *   inclinarsi adesso e non fra quattro secondi.
   * @param {number} [dt] il passo, in secondi.
   * @param {number} [rms] il valore efficace su quattro secondi: serve alle
   *   PERSONE. Se manca si ripiega sull'angolo istantaneo -- e' cio' che serve
   *   a `?sagoma=1`, che genera le fotografie da una posa e non da una storia.
   */
  function aggiorna (gradi, dt = 1 / 60, rms) {
    const agitata = Number.isFinite(rms) ? rms : Math.abs(gradi)

    if (agitata > ACCENDE_RMS) {
      calmaDa = 0
      /* il ritardo si conta da quando la soglia e' stata superata: finche' non
         e' passato, la persona ha visto il movimento e non ha ancora risposto */
      daQuando += dt
      if (daQuando > IPOTESI_RITARDO_UMANO_S) allerta = true
    } else {
      daQuando = 0
      if (agitata < CALMO_RMS) { calmaDa += dt; if (calmaDa > CONVINCE) allerta = false }
      else calmaDa = 0
    }

    q += ((allerta ? 1 : 0) - q) * Math.min(1, dt * (allerta ? PRENDE : LASCIA))

    /**
     * ─── LA STANZA STA FERMA E IL MARE ROLLA, ed e' il contrario di prima.
     *
     * `docs/14` §5.1. Le due scene del sito hanno due riferimenti diversi, e non
     * per gusto: per punto di vista.
     *
     *   **Scafo esterno** — camera solidale al MONDO. L'orizzonte resta
     *   orizzontale e la nave rolla. E' osservazione: si guarda una nave.
     *
     *   **Salone** — camera solidale allo YACHT. La stanza resta ferma
     *   nell'inquadratura e il mare ruota nel finestrino, in verso opposto. E'
     *   esperienza: si e' dentro.
     *
     * Prima ruotavo la stanza e tenevo fermo il mare, che e' il riferimento
     * dell'osservatore esterno applicato a chi sta dentro. Chi e' seduto in quel
     * salone non vede la stanza inclinarsi: vede **l'orizzonte inclinarsi**, e
     * il proprio corpo che corregge. La stanza, per lui, e' l'unica cosa ferma.
     *
     * Il verso e' OPPOSTO al rollio, e non e' un dettaglio: se la nave sbanda a
     * dritta di 10 gradi, rispetto alla stanza l'orizzonte sale a sinistra.
     */
    const r = `rotate(${(-gradi).toFixed(2)}deg)`
    mare.style.transform = `${TRASF_MARE} ${r}`
    if (tesa) tesa.style.opacity = String(q)
    contenitore.dataset.posa = q.toFixed(3)
  }

  aggiorna(0)
  return { aggiorna, mare, posa: () => q }
}
