import { LinearFilter, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, VideoTexture } from 'three'

/**
 * LA TRAVERSATA INTERNA — dal meccanismo alle persone, senza tagli.
 *
 * ─── COS'E', E PERCHE' E' UN FILMATO E NON GEOMETRIA
 *
 * `docs/13` §5 chiude il finale cosi': la camera risale attraverso lo stesso
 * taglio, attraversa gli spazi interni e arriva alle stesse due persone della
 * prima immagine. Corridoi, porte, passaggi verticali e illuminazione continua
 * modellati in Blender sono settimane di lavoro, e — questa e' la parte che
 * conta — a quella distanza il tempo reale non regge il confronto con una
 * fotografia. Il committente l'ha detto una volta e vale ancora: *«per evitare
 * che si veda quel modellino che sembra plastica»*.
 *
 * Quindi la traversata la fa un filmato fotorealistico, ed e' la stessa
 * decisione gia' presa per la discesa. `public/filmati/traversata.mp4`: dieci
 * secondi, meccanismo alla linea d'acqua, attraverso lo scafo, sala macchine,
 * scala, corridoio, salone con le due persone.
 *
 * ─── PERCHE' NON E' UN <video> SULLA PAGINA, ED E' IL VINCOLO PIU' DURO
 *
 * `collaudo-continuita` fallisce se trova anche UN solo elemento `<video>`
 * visibile a schermo, e non e' una pedanteria: e' il cancello che difende la
 * conquista piu' costosa di questo repo — una scena sola, un canvas, una
 * camera, dall'inizio alla fine. Il salone era fatto di video appoggiati sulla
 * pagina, e quella architettura e' stata smontata apposta.
 *
 * Quindi il filmato entra come TESSITURA dentro la stessa scena, su un piano
 * appeso alla camera. Il `<video>` esiste ma sta fuori dal flusso, largo un
 * pixel e trasparente — e' l'unico modo in cui un browser garantisce di
 * consegnare fotogrammi a una `VideoTexture`, ed e' gia' il pattern di
 * `salone3d.js`: qui non si inventa niente, si riusa.
 *
 * E per la stessa ragione **non deve leggersi come un film a schermo pieno**
 * (`docs/13` §10): non e' un'altra architettura che prende il posto della
 * scena, e' materiale visivo dentro la scena che c'era gia'.
 *
 * ─── LA CUCITURA E' L'UNICA COSA CHE PUO' ROMPERLO
 *
 * Il primo fotogramma del filmato e' una ricostruzione generativa del
 * fotogramma di consegna del sito. Se i due non combaciano, chi guarda vede uno
 * stacco e capisce che da li' in poi sta guardando un video — che e'
 * esattamente cio' che il sito non vuole dire.
 *
 * Non si giudica a occhio: la misura la fa `strumenti/consegna.mjs`, che
 * confronta le tre grandezze con cui l'occhio si accorge di uno stacco — la
 * riga della linea d'acqua, il riquadro della pinna, i tre toni. **Questo
 * modulo non dichiara che la cucitura tiene: la dichiara quello strumento.**
 */

/** Dove sta il piano rispetto alla camera. Non e' un gusto: vedi `posiziona`. */
const DISTANZA = 1.0

export function creaTraversata (base, camera, scena, videoCalma) {
  const v = document.createElement('video')
  v.src = base + 'filmati/traversata.mp4'
  v.muted = true
  v.playsInline = true
  v.preload = 'auto'
  v.crossOrigin = 'anonymous'
  /**
   * NON in loop, e non e' una dimenticanza. La discesa e il salone girano in
   * ciclo perche' sono ambienti; questa e' una TRAVERSATA, e una traversata che
   * ricomincia da capo dice che non si e' arrivati da nessuna parte. Finisce
   * sulle persone e resta li'.
   */
  v.loop = false
  v.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px'
  document.body.appendChild(v)

  const tes = new VideoTexture(v)
  tes.colorSpace = SRGBColorSpace
  /**
   * `LinearFilter` esplicito e nessuna mipmap: la tessitura cambia a ogni
   * fotogramma e generare le mipmap costerebbe una ricostruzione al fotogramma
   * su un telefono. E' lo stesso motivo per cui `salone3d.js` non le chiede.
   */
  tes.minFilter = LinearFilter
  tes.magFilter = LinearFilter
  tes.generateMipmaps = false

  const mat = new MeshBasicMaterial({ map: tes, transparent: true, opacity: 0, depthTest: false, depthWrite: false })
  const piano = new Mesh(new PlaneGeometry(1, 1), mat)
  /**
   * Disegnato per ultimo e senza test di profondita': quando la traversata
   * prende il comando, e' lei il fotogramma. Con il test di profondita' acceso
   * lo scafo le passerebbe davanti, ed e' successo — sembrava che il filmato
   * fosse DENTRO la nave invece di sostituirla.
   */
  piano.renderOrder = 999
  piano.frustumCulled = false
  piano.visible = false
  camera.add(piano)
  /**
   * ─── E LA CAMERA VA MESSA NELLA SCENA, o questo piano non esiste
   *
   * DIFETTO PRESO GUARDANDO, non leggendo. Il primo provino mostrava il
   * meccanismo in 3D dove doveva esserci la traversata; il `<video>` era
   * `readyState 4`, arrivato a 10 secondi su 10, quindi decodificava
   * davvero -- semplicemente il suo piano non veniva disegnato.
   *
   * La causa e' una regola di three che non da' nessun errore: `WebGLRenderer`
   * attraversa il grafo a partire dalla SCENA, e la camera di questo sito non
   * ci era mai stata aggiunta -- non serviva, perche' nessuno le aveva mai
   * appeso niente. Un figlio della camera fuori dal grafo viene aggiornato
   * (la sua matrice e' giusta, `visible` e' vero, l'opacita' e' 1) e **non
   * viene mai disegnato**. Nessuna eccezione, nessun avviso: solo un
   * fotogramma in cui manca una cosa.
   *
   * Aggiungere la camera alla scena non cambia niente per il resto: una camera
   * nel grafo non si disegna, si limita a portarsi dietro i propri figli.
   */
  if (scena && camera.parent !== scena) scena.add(camera)

  /**
   * ─── IL PIANO DELLA CALMA, DIETRO AL FILMATO
   *
   * DIFETTO PRESO GUARDANDO IL SITO PUBBLICATO, non leggendo il codice. Alla
   * fine della corsa la misura diceva:
   *
   *     traversata.mp4    t 8.04 -> 8.04   fermo: true   finito: true
   *     salone-largo.mp4  t 3.75 -> 1.22   fermo: false
   *
   * cioe' il filmato era congelato sull'ultimo fotogramma e copriva tutto,
   * mentre il loop con le due persone tranquille **stava suonando sotto,
   * invisibile**. L'ultima immagine del sito era una fotografia.
   *
   * Il commento qui sopra prometteva che a filmato finito il comando torna al
   * 3D. Non poteva mantenerlo: dietro la lastra, a quel punto della corsa, c'e'
   * ancora il meccanismo -- ed e' scritto poco piu' giu' perche' il filmato non
   * si dissolve da solo. Le due decisioni insieme lasciavano l'unica uscita
   * peggiore: restare fermi.
   *
   * La terza via e' consegnare la lastra invece di toglierla. Questo piano sta
   * a `renderOrder` 998, cioe' **dietro il filmato e davanti a tutto il resto**:
   * quando il filmato sfuma, sotto non ricompare il meccanismo, compare la
   * stanza viva. La coppia continua a respirare e il rollio del sito la trova
   * di nuovo -- che e' la frase su cui sta in piedi il progetto.
   *
   * `videoCalma` e' l'elemento del salone, prestato: una seconda
   * `VideoTexture` sullo stesso `<video>` non apre un secondo decodificatore.
   */
  let pianoCalma = null
  let matCalma = null
  if (videoCalma) {
    const tesCalma = new VideoTexture(videoCalma)
    tesCalma.colorSpace = SRGBColorSpace
    tesCalma.minFilter = LinearFilter
    tesCalma.magFilter = LinearFilter
    tesCalma.generateMipmaps = false
    matCalma = new MeshBasicMaterial({ map: tesCalma, transparent: true, opacity: 0, depthTest: false, depthWrite: false })
    pianoCalma = new Mesh(new PlaneGeometry(1, 1), matCalma)
    pianoCalma.renderOrder = 998
    pianoCalma.frustumCulled = false
    pianoCalma.visible = false
    camera.add(pianoCalma)
  }

  /**
   * IL PIANO COPRE ESATTAMENTE IL CAMPO, e la misura non e' negoziabile.
   *
   * Un piano largo "quanto basta" lascia una riga di scena lungo un bordo su
   * qualche formato, e quella riga si vede come un difetto di montaggio. Le due
   * dimensioni si ricavano dal campo verticale e dal rapporto della tela:
   *
   *     alt  = 2 * DISTANZA * tan(fov/2)
   *     larg = alt * aspect
   *
   * Il filmato e' 16:9 e la tela quasi mai: si sceglie di RIEMPIRE — meglio
   * perdere gli estremi del fotogramma che mostrare due bande. Gli estremi
   * della traversata sono sacrificabili, il centro porta il soggetto.
   */
  function posiziona () {
    const alt = 2 * DISTANZA * Math.tan(camera.fov * Math.PI / 360)
    const larg = alt * camera.aspect
    const scalaVideo = 16 / 9
    const scalaTela = camera.aspect
    const riempi = scalaTela > scalaVideo ? larg / (alt * scalaVideo) : 1
    piano.scale.set(larg * Math.max(1, riempi), alt * Math.max(1, 1 / riempi), 1)
    piano.position.set(0, 0, -DISTANZA)
    if (pianoCalma) {
      /**
       * Identico al filmato, e deve restarlo: se i due piani avessero
       * inquadrature diverse la consegna si vedrebbe come uno scarto di scala,
       * cioe' esattamente il difetto che sta chiudendo.
       */
      pianoCalma.scale.copy(piano.scale)
      pianoCalma.position.copy(piano.position)
    }
  }

  let avviata = false
  /**
   * ─── QUANDO IL FILMATO FINISCE, IL COMANDO TORNA AL 3D
   *
   * E' la terza strada di `docs/13` §5, e non costa settimane come sembrava: il
   * salone 3D **esiste gia'**, e' la prima battuta del sito. Il filmato fa la
   * traversata -- corridoi, scale, spazi tecnici, dove non c'e' niente da
   * inclinare -- e l'ultimo tratto lo riprende la scena, dove il rollio e'
   * vero.
   *
   * Cosi' la frase che regge tutto il progetto torna vera: *le due persone
   * viste tranquille nella prima schermata adesso non lo sono, e la causa e'
   * chi guarda*. Con un filmato non lo era piu': un filmato non risponde al
   * rollio, e il finale sarebbe stato un effetto proprio nel punto in cui il
   * sito rivendica di non mentire.
   *
   * L'evento e' `ended` e non lo scorrimento, e la ragione e' gia' scritta
   * sopra: il filmato ha un suo tempo. Legarlo alla corsa vorrebbe dire o
   * troncarlo o lasciarlo fermo sull'ultimo fotogramma -- cioe' una fotografia.
   */
  let finita = false
  /**
   * Da 0 (comanda ancora l'ultimo fotogramma del filmato) a 1 (comanda il loop
   * della calma). L'avanzamento lo detta **l'orologio del video calmo**, non un
   * orologio da parete: e' la stessa scelta della consegna del sollievo, e ha
   * due proprieta' che un `performance.now()` non ha. Se il browser rifiuta di
   * suonare, `currentTime` resta 0, la consegna non parte e in campo rimane
   * l'ultimo fotogramma -- brutto ma intero, mai un buco. E sotto
   * `passoDichiarato` la dissolvenza non dipende da quanto e' carica la
   * macchina.
   */
  let consegna = 0
  let inConsegna = false
  /** 1,2 s: piu' corto sembra uno stacco, piu' lungo un'esitazione. */
  const DURATA_CONSEGNA = 1.2
  v.addEventListener('ended', () => {
    finita = true
    if (!videoCalma) return
    inConsegna = true
    /**
     * Riavvolta a 0 perche' l'ultimo fotogramma del filmato e' una
     * ricostruzione della posa di apertura del salone: e' li' che i due
     * combaciano. Prenderla a meta' ciclo vorrebbe dire consegnare a una posa a
     * caso, ed e' il momento in cui si vede il taglio.
     */
    try { videoCalma.currentTime = 0 } catch { /* seek rifiutato: si consegna dalla posa corrente */ }
    videoCalma.play().catch(() => { /* rifiutata: resta il filmato, mai il vuoto */ })
  })

  /**
   * `q` va da 0 a 1: 0 il 3D comanda, 1 comanda la traversata.
   *
   * La dissolvenza e' corta apposta — un quinto della corsa — perche' una
   * dissolvenza lunga fra due immagini che dovrebbero essere LA STESSA e' il
   * modo piu' rapido di dire che non lo sono. Se la cucitura e' buona non serve
   * quasi niente; se e' cattiva, allungarla non la ripara, la spalma.
   */
  /**
   * L'ultimo comando ricevuto dalla regia. Serve perche' la consegna deve poter
   * avanzare **anche a dito fermo**, e la regia non gira a fotogrammi.
   *
   * ─── IL DIFETTO, E VALE PIU' DELLA RIGA CHE LO CHIUDE
   *
   * La dissolvenza scritta qui sotto non partiva mai: il cancello leggeva
   * `consegna 0.000` mentre il video della calma girava a 2,43 s. Il codice era
   * giusto e non veniva eseguito. `regia(p)` sta dentro `leggiScorrimento`
   * (`demo.js:435`), agganciata a `scroll` e `resize`: chi arriva in fondo e
   * si ferma smette di chiamarla. Ogni transizione che deve continuare da sola
   * -- e questa e' l'unica del sito -- va guidata dal ciclo di disegno, non
   * dalla mano.
   */
  let ultimaCorsa = 0

  /** Applica opacita' e visibilita' dei due piani per la corsa `a`. */
  /**
   * ─── LA CALMA STA PIENA DIETRO, E SFUMA SOLO IL FILMATO
   *
   * DIFETTO PRESO DALLA CI, e sono due difetti in uno.
   *
   * Il primo si vede: con le due lastre incrociate a meta' opacita' -- 0,5
   * sopra 0,5 -- il fondo trasparisce per il 25%, e dietro c'e' ancora il
   * meccanismo. Nel mezzo secondo centrale della consegna il pezzo si
   * intravedeva attraverso le persone. Una dissolvenza incrociata fra due
   * strati va bene quando dietro non c'e' niente; qui dietro c'e' tutto.
   *
   * Il secondo non si vede e ha fatto uscire rossa la corsa 283.
   * `collaudo-finale` chiede alla regia `coperturaTraversata()` per trovare
   * dove il filmato copre il quadro -- e legge l'opacita' della sola lastra del
   * FILMATO, che con la consegna scende. Su una macchina lenta il cancello
   * arriva in fondo quando la consegna e' gia' partita, non trova mai copertura
   * piena, e accusa il sito di tagliare le persone. Passava in locale e falliva
   * la', che e' la firma di una misura che dipende dalla velocita'.
   *
   * Con la calma PIENA dietro, la copertura dello stack e' `a` in ogni istante
   * della consegna: il fondo non trasparisce mai e il numero non dipende piu'
   * da quando lo si legge.
   */
  function componi (a) {
    mat.opacity = a * (1 - consegna)
    piano.visible = a > 0.002 && consegna < 0.999
    if (matCalma) matCalma.opacity = a
    if (pianoCalma) pianoCalma.visible = a > 0.002 && consegna > 0.001
    if (piano.visible || pianoCalma?.visible) posiziona()
  }

  /**
   * Chiamata a ogni fotogramma da `disegna`. Non tocca niente finche' il
   * filmato non e' finito: prima del finale la regia comanda da sola.
   */
  function avanza () {
    if (!inConsegna || !videoCalma) return
    const prima = consegna
    consegna = Math.max(0, Math.min(1, videoCalma.currentTime / DURATA_CONSEGNA))
    if (consegna !== prima) componi(ultimaCorsa)
  }

  function mostra (q) {
    const a = Math.max(0, Math.min(1, q * 5))
    ultimaCorsa = a
    if (inConsegna && videoCalma) {
      consegna = Math.max(0, Math.min(1, videoCalma.currentTime / DURATA_CONSEGNA))
    }
    componi(a)
    if (a > 0.002 && !avviata) {
      avviata = true
      v.play().catch(() => { /* rifiutata: resta il primo fotogramma, che e' la posa di consegna */ })
    }
    if (a <= 0.002 && avviata) {
      avviata = false
      v.pause()
      v.currentTime = 0
      /**
       * E si riavvolge anche la consegna, `finita` compresa. Senza questa riga
       * chi risale e poi ridiscende trova il filmato che riparte da capo ma la
       * scena che lo crede gia' finito: il cruscotto rientrava in campo sopra
       * la traversata in corso. Difetto vecchio, scoperto mentre si chiudeva
       * questo.
       */
      finita = false
      inConsegna = false
      consegna = 0
    }
  }

  /** Il ciclo di disegno spento non deve lasciare un decodificatore acceso. */
  function spegni () { v.pause() }

  /**
   * `0` il filmato comanda ancora, `1` ha finito da un pezzo. Il ritorno dura
   * 1,2 secondi: piu' corto sembra uno stacco, piu' lungo sembra un'esitazione
   * -- e in mezzo c'e' un fotogramma in cui si vedono tutti e due i saloni, che
   * e' il momento in cui la cucitura si giudica.
   */
  /**
   * Il filmato NON si dissolve da solo quando finisce: resta sull'ultimo
   * fotogramma, cioe' sulle due persone. La ragione sta in `index.js`, sopra il
   * rientro che non c'e' piu' -- una dissolvenza automatica riporterebbe in
   * campo il meccanismo, che dietro e' ancora li', e l'ultima immagine del sito
   * diventerebbe il pezzo invece della coppia.
   *
   * Si apre risalendo: `mostra()` segue la corsa, quindi scorrendo indietro
   * l'opacita' cala e si rientra nella scena viva. Il cerchio lo chiude la mano.
   */
  return {
    mostra,
    avanza,
    spegni,
    piano,
    video: v,
    get finita () { return finita },
    /**
     * Da 0 a 1: quanto il finale e' passato dal fotogramma congelato del
     * filmato al loop vivo della calma. Esposto perche' un cancello possa
     * MISURARE che il finale respira, invece di fidarsi di questo commento.
     */
    get consegnaCalma () { return consegna },
    /**
     * Quanto copre il fotogramma adesso: 1 = il 3D dietro non si vede.
     *
     * E' la copertura dello STACK, non di una lastra sola. Prima tornava
     * `mat.opacity`, cioe' il solo filmato: durante la consegna quel numero
     * scende mentre lo schermo resta coperto dalla calma, e chi lo legge
     * conclude che il quadro si sia aperto. La corsa 283 e' uscita rossa
     * proprio cosi'.
     */
    get copertura () {
      if (pianoCalma && pianoCalma.visible) return matCalma.opacity
      return piano.visible ? mat.opacity : 0
    }
  }
}
