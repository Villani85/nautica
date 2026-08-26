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

export function creaComposito (contenitore, base) {
  const nuovo = (classe, tag = 'div') => {
    const e = document.createElement(tag)
    e.className = classe
    contenitore.appendChild(e)
    return e
  }

  /**
   * 1 · IL MARE. Sta in fondo e non ruota mai. Non c'e' una riga che lo tenga
   * fermo: e' fermo perche' nessuno lo tocca, ed e' esattamente il punto.
   */
  const mare = nuovo('composito__mare', 'video')
  mare.src = base + 'filmati/mare-fuoribordo.mp4'
  mare.loop = true; mare.muted = true; mare.playsInline = true
  mare.setAttribute('aria-hidden', 'true')
  mare.addEventListener('loadeddata', () => {
    mare.play().catch(() => { /* rifiutata: resta il fondo chiaro, e si vede il cielo */ })
  }, { once: true })

  /**
   * 2 · LE DUE POSE. Ogni fotografia porta la propria maschera, ricavata da
   * lei stessa — non dalla sagoma, che dopo la generazione non combacia piu'.
   * `mask-mode: luminance`: il bianco della maschera lascia passare il mare.
   */
  /**
   * ─── UNO STRATO PUO' ESSERE UNA FOTOGRAFIA O UN FILMATO, E IL RESTO NON CAMBIA
   *
   * E' la forma ibrida decisa col committente: **il filmato da' la vita**
   * — respiro, capelli, il vino che trema, la mano che va a puntellarsi — e
   * **la simulazione da' l'inclinazione**. Sono due mestieri separati e non si
   * devono sovrapporre: se il filmato sbandasse per conto suo, il suo
   * sbandamento e quello calcolato si sommerebbero a caso, e soprattutto
   * l'orizzonte dentro i vetri si inclinerebbe insieme alla stanza — che e'
   * esattamente cio' che succede quando lo stabilizzatore NON c'e'.
   *
   * Quindi al filmato si chiede una cosa sola e severa: **camera bloccata,
   * stanza diritta**. Le richieste e le misure stanno in
   * `riferimenti/prompt/salone-filmati.md`, e il cancello che le verifica e'
   * `strumenti/collaudo-filmato.mjs`.
   *
   * Finche' una clip non passa il cancello lo strato resta una fotografia:
   * cambiare `video: false` in `video: true` e' tutto quello che serve, perche'
   * maschera, rotazione e dissolvenza non sanno e non devono sapere che cosa
   * stanno mostrando.
   */
  const SORGENTE = {
    calma: { file: 'filmati/salone-calma.mp4', video: true },
    tesa: { file: 'salone/tesa.jpg', video: false }
  }

  const posa = (nome, maschere) => {
    const src = SORGENTE[nome]
    const e = nuovo('composito__stanza', src.video ? 'video' : 'div')
    if (src.video) {
      e.src = base + src.file
      e.loop = true; e.muted = true; e.playsInline = true
      e.setAttribute('aria-hidden', 'true')
      e.addEventListener('loadeddata', () => {
        e.play().catch(() => { /* rifiutata: resta il primo fotogramma, che e' la posa giusta */ })
      }, { once: true })
    } else {
      e.style.backgroundImage = `url(${base}${src.file})`
    }
    const m = maschere.map(x => `url(${base}salone/${x}.png)`).join(', ')
    e.style.webkitMaskImage = m
    e.style.maskImage = m
    if (maschere.length > 1) {
      // due maschere si INTERSECANO: passa solo cio' che e' bianco in entrambe
      e.style.webkitMaskComposite = 'source-in'
      e.style.maskComposite = 'intersect'
    }
    return e
  }

  /**
   * ─── TRE STRATI DI STANZA, E IL TERZO E' NATO DA UN DIFETTO PRECISO.
   *
   * Il difetto lo ha visto il committente: **i cuscini sono diversi**.
   * Dissolvendo le due fotografie INTERE, durante la transizione i mobili si
   * trasformavano, e a transizione finita la stanza aveva cuscini diversi. Il
   * modello non ricopia, rigenera: oltre alle due figure cambiano i cuscini e
   * il bordo del tavolo. Non era un difetto della dissolvenza — si stava
   * dissolvendo troppo.
   *
   * ─── LA CURA SBAGLIATA, e mi e' costata quattro giri
   *
   * Ritagliare la posa tesa sulle sole persone e sovrapporla alla calma. A
   * schermo comparivano **quattro persone**, e ho dato la colpa al ritaglio: le
   * due macchie piu' grandi, poi tutte quelle sopra una soglia, poi due
   * riquadri, poi le macchie dilatate. Quattro volte, quattro persone.
   *
   * La causa era altrove, e si vede solo scrivendola: **le due maschere si
   * combattono.** Le figure calme siedono con la testa appoggiata ai vetri. Li'
   * `tesa-maschera` e' NERA — deve esserlo, e' il buco del finestrino — quindi
   * buca anche il ritaglio delle persone, e la posa tesa **non puo' disegnare
   * sopra la testa calma**. Il ritaglio era gia' giusto dal terzo tentativo:
   * componendo la stessa maschera fuori dal sito, con la posa tesa piena,
   * uscivano due persone pulite. Aggiungendo l'intersezione col finestrino ne
   * uscivano quattro — cioe' esattamente quello che si vedeva.
   *
   * *Quando un difetto non si sposta pur cambiando la cosa che lo causa, la
   * cosa che lo causa e' un'altra.*
   *
   * ─── LA FORMA CHE REGGE
   *
   *   stanza la stanza FUORI dalla regione delle persone. Non si dissolve mai,
   *          quindi i cuscini non cambiano: e' la richiesta del committente,
   *          ed e' soddisfatta per costruzione e non per taratura;
   *   A      la posa calma DENTRO la regione, opacita' 1-q;
   *   B      la posa tesa DENTRO la regione, opacita' q.
   *
   * Dentro la regione si dissolvono solo le persone, e dove la posa tesa ha un
   * finestrino al posto di una testa compare il mare — che e' cio' che c'e'
   * davvero dietro quella testa quando la persona si e' spostata.
   */
  const stanza = posa('calma', ['calma-maschera', 'persone-maschera-fuori'])
  const calma = posa('calma', ['calma-maschera', 'persone-maschera'])
  const tesa = posa('tesa', ['tesa-maschera', 'persone-maschera'])
  tesa.style.opacity = '0'

  /**
   * Chi naviga con lo schermo non deve trovare tre riquadri vuoti. La
   * descrizione cambia con lo stato, perche' e' lo stato la cosa da raccontare.
   */
  contenitore.setAttribute('role', 'img')

  let ultimo = null
  let allerta = false      // lo STATO: ci si sente al sicuro o no
  let calmaDa = 0          // da quanti secondi la stanza sta ferma
  let q = 0                // la posa a schermo, che insegue lo stato

  function aggiorna (gradi, dt = 1 / 60) {
    const g = Math.abs(gradi)

    if (g > ACCENDE) { allerta = true; calmaDa = 0 }
    else if (g < CALMO) {
      calmaDa += dt
      if (calmaDa > CONVINCE) allerta = false
    } else {
      // nella terra di mezzo non si decide niente, ma il conto della calma si
      // azzera: un'oscillazione a quattro gradi non e' calma
      calmaDa = 0
    }

    const bersaglio = allerta ? 1 : 0
    q += (bersaglio - q) * Math.min(1, dt * VELOCITA)
    const r = `rotate(${gradi.toFixed(2)}deg)`
    stanza.style.transform = calma.style.transform = tesa.style.transform = r
    /**
     * Dentro la regione delle persone le due pose si scambiano. Lo strato della
     * stanza non si tocca: la stanza non cambia mai.
     */
    calma.style.opacity = String(1 - q)
    tesa.style.opacity = String(q)

    const teso = q > 0.5
    if (teso !== ultimo) {
      ultimo = teso
      contenitore.setAttribute('aria-label', teso
        ? 'The saloon of a yacht, heeled over. The two people are bracing themselves against the table and the backrest. The wine glasses are still upright, and through the window the sea horizon stays level.'
        : 'The saloon of a yacht, level and calm. Two people sit talking, two glasses of wine stand on the table between them. Through the window the open sea is rough.')
    }
  }

  aggiorna(0)
  return { aggiorna, mare, posa: () => q }
}
