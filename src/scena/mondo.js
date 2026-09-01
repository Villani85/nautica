import { Group, MathUtils, Quaternion, Vector3, PointLight, Mesh, PlaneGeometry, MeshBasicMaterial, Color, DoubleSide } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { vestiMondo } from './materie-mondo.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { METRI_PER_UNITA } from './acqua.js'
import { sezioneA, PRUA_Z, POPPA_Z } from '../scafo/ordinate.js'

/**
 * IL MONDO DELLA TRAVERSATA — gli spazi veri, attraversati davvero.
 *
 * ─── COS'E', E COSA SOSTITUISCE
 *
 * `traversata.js` porta la traversata come FILMATO su un piano appeso alla
 * camera. Funziona, e per mesi e' stata la scelta giusta: modellare corridoi,
 * scale e locali tecnici erano settimane, e a quella distanza il tempo reale
 * non reggeva il confronto con una fotografia.
 *
 * Ma il criterio che il progetto si e' dato lo condanna, e lo dice in una riga:
 * *«un piano appeso alla camera che copre il 100% del quadro e' un nuovo film
 * anche se vive dentro lo stesso renderer»*. Chi guarda non attraversa la nave:
 * guarda un video di qualcuno che l'attraversa.
 *
 * Questo modulo carica `traversata-world.glb`, che contiene i quattro ambienti
 * assemblati nel frame comune -- locale tecnico, sala macchine, corridoio,
 * guscio del salone -- e li mette NELLA STESSA SCENA in cui gira tutto il
 * resto. Stessa camera, stesso mare, stesso rollio, stesso integratore.
 *
 * ─── ENTRA SPENTO, ED E' LA REGOLA PIU' IMPORTANTE DI QUESTO FILE
 *
 * Fra il caricamento del mondo e la rimozione dei due piani c'e' una finestra
 * in cui il climax puo' restare NERO: se il mondo non si vede e il filmato non
 * c'e' piu', il sito perde il proprio finale. L'ordine e' AGGIUNGERE,
 * VERIFICARE, POI TOGLIERE -- e finche' la verifica non e' fatta questo modulo
 * vive dietro `?mondo=1` e non tocca niente.
 *
 * Non e' prudenza generica: e' la stessa cautela che il guscio del salone
 * rispetta da giorni dietro `?guscio=1`, per la stessa ragione, e che ha gia'
 * evitato una volta di spedire una cosa non certificata.
 *
 * ─── LA SCALA, che e' la trappola numero uno
 *
 * Il GLB e' in METRI, come tutti i modelli del progetto. La scena vive in unita'
 * dove 1 = 2,5 m. La conversione si applica UNA VOLTA SOLA, qui, al nodo radice
 * -- mai sui sottoalberi, mai due volte. E' l'articolo 3 del contratto
 * world-space, ed e' scritto perche' un guscio costruito in unita' sbagliate
 * non da' errore: da' un modello che non combacia, e si perdono tre tentativi a
 * cercare la causa altrove.
 */

/**
 * Il mondo e' ACCESO di serie. `?mondo=0` (o `no`, o `false`) lo spegne.
 *
 * Era il contrario -- «entra spento e non tocca niente finche' la prova
 * verticale non e' verde». Quella prova adesso e' verde, la giunzione con il
 * filmato del salone combacia entro 0,097 gradi, e il committente ha deciso il
 * 1 settembre 2026 che la traversata diventa 3D.
 *
 * L'interruttore resta perche' serve a MISURARE il sito senza il mondo, non
 * perche' il visitatore debba sceglierlo.
 */
export function vuoleMondo (ricerca = (typeof location === 'undefined' ? '' : location.search)) {
  const v = new URLSearchParams(ricerca).get('mondo')
  if (v === '0' || v === 'no' || v === 'false') return false
  return true
}

/**
 * ─── DOVE STA IL MONDO RISPETTO ALLA NAVE
 *
 * Il frame del mondo ha l'origine sul nodo `CAMERA_SORGENTE_SALONE`, cioe'
 * dentro il salone. La nave del sito ha la propria origine altrove, e l'asse
 * della lunghezza si chiama `z` invece di `x`.
 *
 * Il ponte fra i due lo dichiara il contratto (`world_root.py`, §2-quater):
 *
 *     z_unita_scena = 1,9089 - X_metri_mondo / 2,5
 *
 * cioe' l'asse X del mondo (verso prua, in metri) diventa l'asse z della scena
 * (verso poppa, in unita'), con il segno invertito e l'offset misurato.
 *
 * QUEL PONTE E' `DERIVATO` E NON CONFERMATO, e va detto qui perche' e' qui che
 * si paga: la prova verticale (`strumenti/collaudo-verticale.mjs`) esce ROSSA
 * di 0,609 m -- il soffitto del salone risulterebbe sopra il trincarino. Tre
 * candidati, nessuno ancora escluso: la risalita del corridoio (dichiarata
 * inventata dal file che la porta), l'offset, o l'ipotesi che il pagliolo
 * poggi sulla chiglia.
 *
 * Finche' quella prova e' rossa il mondo NON puo' sostituire il filmato, e
 * questo modulo resta dietro l'interruttore. Caricarlo serve a MISURARLO in
 * scena, che e' l'unico modo di scegliere fra i tre candidati.
 */
const PONTE_OFFSET_Z = 1.9089

/** Riusato dal conto dell'appoggio: allocare un Vector3 per vertice sarebbe
    decine di migliaia di oggetti per un conto che si fa una volta sola. */
const _v = new Vector3()

export function creaMondo (base, scena) {
  const gruppo = new Group()
  gruppo.name = 'MONDO_TRAVERSATA'
  gruppo.visible = false

  /**
   * Metri -> unita' di scena, una volta sola, sul nodo radice.
   * `METRI_PER_UNITA` vale 2,5 e vive in `acqua.js`: si importa invece di
   * riscrivere 0,4, perche' due copie di una costante sono due costanti che un
   * giorno divergono.
   */
  gruppo.scale.setScalar(1 / METRI_PER_UNITA)

  /**
   * L'asse X del mondo (metri, verso prua) deve diventare l'asse z della scena
   * (unita', che cresce verso poppa: `PRUA_Z = -8`, `POPPA_Z = +8`).
   *
   * PRIMO TENTATIVO SBAGLIATO, e la misura l'ha detto subito: avevo messo 180
   * gradi. Una rotazione di 180 attorno a Y INVERTE X e Z, non li SCAMBIA -- il
   * mondo restava lungo l'asse X della scena, e il bbox lo diceva: si estendeva
   * da -3,6 a +6,0 in X invece che in z.
   *
   * Servono 90 gradi: (1,0,0) -> (0,0,-1), cioe' il +X del mondo diventa il -z
   * della scena, che e' verso prua. E il +Z del mondo (dritta) diventa il +X
   * della scena.
   *
   * Una rotazione e non uno specchio, perche' uno specchio rovescerebbe le
   * normali e il guscio si illuminerebbe al contrario -- difetto che in questo
   * repo e' gia' costato una giornata ed e' scritto in `index.js:550`.
   */
  gruppo.rotation.y = Math.PI / 2
  gruppo.position.z = PONTE_OFFSET_Z

  /**
   * ─── IL PONTE VERTICALE NON ESISTEVA, e il mondo galleggiava sotto la chiglia
   *
   * Il contratto dichiara il ponte per l'asse della LUNGHEZZA e basta:
   * `z = 1,9089 - X/2,5`. Nessuno aveva mai scritto a che ALTEZZA vada il mondo,
   * e la conseguenza si e' vista alla prima misura in scena: il fondo del
   * pagliolo cadeva a -1,340 unita' mentre la chiglia, alla stessa stazione,
   * sta a -0,6048. Un metro e ottantatre sotto lo scafo.
   *
   * Non era un numero sbagliato: era un numero MANCANTE, e valeva zero perche'
   * nessuno l'aveva messo.
   *
   * Si deriva invece di scriverlo, e la regola e' quella fisica: IL PAVIMENTO
   * POGGIA SU QUALCOSA. Si prende il punto piu' basso del mondo, si guarda dove
   * sta la chiglia a quella stazione -- `sezioneA` di `ordinate.js`, la stessa
   * funzione che disegna lo scafo che il visitatore vede -- e si alza il mondo
   * della differenza. Se il modello cambia, l'offset lo segue da solo.
   *
   * ─── E DICHIARA IL PROPRIO DIFETTO, invece di nasconderlo
   *
   * Appoggiato cosi', il soffitto del salone SFONDA IL PONTE di circa 0,76 m.
   * Non e' una sorpresa: `strumenti/collaudo-verticale.mjs` lo prevedeva a
   * 0,609 m partendo dall'aritmetica delle ordinate, per una strada
   * completamente diversa da questa. Due misure indipendenti che concordano sul
   * SEGNO e sull'ordine di grandezza: il difetto e' reale.
   *
   * I tre candidati restano quelli, e nessuno e' ancora escluso: la risalita del
   * corridoio (2,10 m, che `corridor.py:54` dichiara «nessuna misura»),
   * l'offset longitudinale (DERIVATO, non confermato), o l'ipotesi che il
   * pagliolo poggi sulla chiglia -- che e' proprio quella usata qui, ed e' la
   * piu' generosa possibile: sotto un pagliolo vero ci sono sentina e
   * strutture.
   *
   * Finche' non e' deciso, il mondo resta dietro l'interruttore.
   */
  let sfondamento = null

  /**
   * ─── L'APPOGGIO SULLA CHIGLIA ERA UN CRITERIO, E DOVEVA ESSERE UNA VERIFICA
   *
   * Questa funzione trovava il punto piu' basso del mondo e ce lo appoggiava:
   * `gruppo.position.y = chiglia - piuBasso`. In astratto e' ragionevole. Ma
   * NON E' LA REGOLA DEL CONTRATTO, e la sovrascriveva in silenzio.
   *
   * Il mondo e' ancorato al nodo `CAMERA_SORGENTE_SALONE`, e nell'asset
   * l'ultima posa e' esattamente [0, 0, 0]: verificato, non supposto.
   * L'arrivo doveva essere l'origine PER COSTRUZIONE. Collocando il gruppo per
   * il suo punto piu' basso, la quota la decideva il pavimento del locale
   * tecnico e l'origine finiva dove capitava.
   *
   * Ed e' la causa UNICA di tre misure che sembravano tre difetti:
   *   - l'ultima posa a 3,14 m contro un soffitto del salone a 2,233
   *   - diciotto pose su novantasei sopra il ponte
   *   - margine peggiore -0,337 unita'
   * Sono lo stesso spostamento rigido applicato a tutto il mondo. Non la curva,
   * non i pezzi: la regola di appoggio.
   *
   * Misurato: la camera del sito alla battuta «salotto» sta a
   * (0,0065 · 1,4528 · 1,778); l'origine del mondo stava a (0 · 1,2546 ·
   * 1,9089). Mezzo metro piu' in basso e trentatre centimetri piu' a poppa.
   *
   * Adesso la chiglia NON colloca piu' niente: MISURA. Se dopo l'ancoraggio
   * giusto il pavimento del locale tecnico sfonda la chiglia, quello e' un
   * difetto di geometria vero e va saputo -- prima veniva assorbito in silenzio.
   */
  function misuraFrancoChiglia () {
    let piuBasso = Infinity
    let zDelPiuBasso = 0
    let piuAlto = -Infinity
    let zDelPiuAlto = 0
    gruppo.updateWorldMatrix(true, true)
    gruppo.traverse((o) => {
      if (!o.isMesh || !o.geometry?.attributes?.position) return
      const p = o.geometry.attributes.position
      for (let i = 0; i < p.count; i++) {
        _v.set(p.getX(i), p.getY(i), p.getZ(i))
        o.localToWorld(_v)
        if (_v.y < piuBasso) { piuBasso = _v.y; zDelPiuBasso = _v.z }
        if (_v.y > piuAlto) { piuAlto = _v.y; zDelPiuAlto = _v.z }
      }
    })
    if (!Number.isFinite(piuBasso)) return

    const t = (z) => MathUtils.clamp((z - PRUA_Z) / (POPPA_Z - PRUA_Z), 0, 1)
    /* positivo = il pavimento sta SOPRA la chiglia, cioe' dentro lo scafo */
    francoChiglia = piuBasso - sezioneA(t(zDelPiuBasso)).chiglia
    sfondamento = piuAlto - sezioneA(t(zDelPiuAlto)).ponteY
  }

  /**
   * ─── DOVE VA L'ORIGINE: gliela dice la regia, non la chiglia
   *
   * L'ultima posa e' [0,0,0], quindi collocare l'origine e' collocare
   * l'ARRIVO. E l'arrivo e' la posa da cui il sito guarda il salone --
   * `dentroY`, `tugaZ + dist`, `scarto` in `index.js:1423-1471`. Quei valori
   * arrivano da li', dallo stesso ambito che li usa per la camera, cosi' non
   * esistono due copie che un giorno divergono.
   */
  /**
   * ─── E ANCHE L'ORIENTAMENTO ARRIVA DALLA REGIA
   *
   * L'ancoraggio in posizione non basta, e si vede in un fotogramma. Misurato
   * all'istante della giunzione, con la camera nello stesso punto:
   *
   *   sito, battuta salotto   guarda ( 0,0000 ·  0,0000 · -1,0000)
   *   mondo, ultima posa      guarda (-0,3248 · -0,0493 · -0,9445)
   *   scarto                  19,2 gradi
   *
   * Diciannove gradi bastano a far vedere il ponte al posto della stanza: il
   * filmato del salone e' girato guardando la finestra e le due persone, la
   * camera del mondo arriva guardando altrove. La giunzione che il contratto
   * garantisce e' quella del PUNTO, non della direzione -- l'ultima posa e'
   * [0,0,0], cioe' l'origine, e sull'origine non c'e' scritto dove si guarda.
   *
   * La correzione NON si applica a tutta la curva: ruotare ogni posa di 19
   * gradi vorrebbe dire attraversare il corridoio guardando le pareti. Si
   * innesta sull'ultimo tratto, cosi' la camera converge sulla posa del
   * filmato mentre arriva, e all'istante del taglio le due inquadrature
   * coincidono.
   */
  const INNESTO = 0.15
  let correzione = null
  let diag = null

/**
 * ─── LE LUCI PRATICHE, e perche' sono il primo passo
 *
 * DECISIONE DEL COMMITTENTE, 1 settembre 2026, guardando il provino: «e'
 * bruttissima la traversata ancora». Ha ragione, e il file lo conferma senza
 * ambiguita': 45 maglie, 17 materiali, TRE immagini -- tutte mappe d'ombra --
 * NESSUNA texture di colore, e ZERO LUCI.
 *
 * Un locale tecnico illuminato dal cielo del sito, cioe' dalla stessa luce che
 * illumina il mare, e dipinto di grigio uniforme fra 0,20 e 0,62, non puo' che
 * sembrare una scatola. In un ambiente chiuso e' la LUCE a dire dove sei: prima
 * delle materie, prima dei contenuti.
 *
 * Si parte da qui perche' costa mezz'ora e risponde alla domanda che conta --
 * questa traversata puo' funzionare? Se no, si sono risparmiate le materie e i
 * contenuti.
 *
 * ─── E LE POSIZIONI SI DERIVANO DALLA CURVA, non si scrivono
 *
 * Scrivere coordinate a mano vorrebbe dire ricopiare i numeri del contratto in
 * un terzo posto -- ed e' il difetto che questo repo ha pagato quattro volte in
 * tre giorni. La curva della camera passa DENTRO gli ambienti per costruzione:
 * mettere una plafoniera sopra ogni tratto la mette dove serve, e se domani il
 * percorso cambia le luci lo seguono senza che nessuno se ne ricordi.
 *
 * L'altezza e' l'unico numero libero: 1,55 m sopra la posa, cioe' poco sotto un
 * soffitto che sta a 2,00. Sopra si incassano nel solaio, sotto si vedono in
 * faccia.
 */
const QUANTE_LUCI = 7
const ALTEZZA_LUCE_M = 1.55
/** Portata: due terzi di corridoio, cosi' due plafoniere si sovrappongono
 *  appena e restano i tratti in ombra fra l'una e l'altra. */
const PORTATA_M = 3.6
const COLORE_LUCE = 0xffe6c4     // lampada da lavoro, non luce di giorno
/**
 * Intensita' di serie, e `?luce=<n>` la cambia per cercarla guardando -- come
 * `?quota=` e `?raggio=` fanno gia' per l'inquadratura.
 *
 * SEI ERA TROPPO, e non di poco: dentro un corridoio le pareti stanno a mezzo
 * metro da una plafoniera, e col decadimento quadratico l'illuminamento va a
 * quattro volte l'intensita'. Il provino usciva PIU' CHIARO che senza mondo --
 * luminanza media 187 contro 136 -- cioe' le lampade bruciavano la stanza
 * invece di illuminarla. Un ambiente sotto coperta deve essere piu' scuro del
 * mare, non piu' chiaro.
 */
const INTENSITA = (() => {
  const v = typeof location !== 'undefined'
    ? Number(new URLSearchParams(location.search).get('luce'))
    : NaN
  return Number.isFinite(v) && v > 0 ? v : 0.35
})()

let luci = null
/* la camera del sito: serve a toglierle lo strato di fuori mentre si e' dentro.
   La riceve `ancoraA`, che e' l'unico posto in cui il sito si presenta. */
let cameraDelSito = null
/* quante superfici hanno ricevuto una materia: un numero si guarda */
let vestite = 0

/**
 * ─── PRIMA DI ACCENDERE, BISOGNA SPEGNERE
 *
 * Messe le sette plafoniere, il provino non e' cambiato di niente: gli ambienti
 * restavano bianchi. La causa non erano le luci, era che NON SERVIVANO -- la
 * scena del sito ha un `HemisphereLight` piu' due direzionali, tarati per una
 * nave vista al largo, e dentro un corridoio quella luce entra da tutte le
 * pareti insieme. Una stanza gia' illuminata a giorno non si illumina.
 *
 * Aggiungere senza togliere e' il modo di lavorare mezz'ora e non vedere
 * differenza, e sarebbe stato facile concludere «le luci non bastano» invece di
 * «le luci non arrivano».
 *
 * Lo strato lo risolve alla radice: three.js accende una maglia solo con le
 * luci il cui strato interseca il suo. Il mondo va su uno strato tutto suo, le
 * plafoniere pure, e le luci del sito -- che restano sullo strato zero -- non lo
 * toccano piu'. La camera abilita entrambi, cosi' continua a vedere tutto.
 *
 * E la nebbia si toglie con `material.fog = false`: e' l'aria fra la camera e
 * la nave, e dentro lo scafo non c'e' aria da attraversare.
 */
const STRATO_MONDO = 1

function isolaDallaLuceDiFuori (camera) {
  gruppo.traverse((o) => {
    if (!o.isMesh) return
    /* SOLO lo strato del mondo: restando anche sullo zero, le luci del sito
       continuerebbero ad arrivare e non sarebbe cambiato niente */
    o.layers.set(STRATO_MONDO)
    const mm = Array.isArray(o.material) ? o.material : [o.material]
    for (const m of mm) {
      if (!m) continue
      m.fog = false
      /**
       * ─── E L'AMBIENTE, che gli strati NON fermano
       *
       * Messi gli strati, il provino era ancora identico. Non e' che non
       * funzionassero: `camera.layers.mask` era 3 e le maglie erano sullo
       * strato 1 -- verificato leggendo le maschere, non guardando l'immagine.
       *
       * La luce arrivava da un'altra parte. `scena.environment` illumina OGNI
       * materiale standard e non guarda gli strati: e' una mappa, non una
       * lampada. Il mare e il cielo del sito stavano dentro il corridoio da
       * tutte le pareti insieme, e nessuna plafoniera poteva competere.
       *
       * Zero e' voluto e non e' timidezza: sotto coperta non c'e' cielo. Se un
       * riflesso servira', tornera' da una mappa SUA -- non da quella di fuori.
       */
      m.envMapIntensity = 0
      /**
       * ─── E SI VEDONO ANCHE DA DENTRO
       *
       * Con la luce giusta la scala si leggeva, ma ai lati si vedeva IL MARE:
       * le pareti del corridoio non c'erano. Non mancavano -- sono nel file, 45
       * maglie -- erano scartate. Gli ambienti sono modellati come volumi visti
       * da FUORI, con le normali in fuori, e la traversata li attraversa da
       * DENTRO: il taglio delle facce posteriori le fa sparire tutte insieme.
       *
       * `DoubleSide` costa un po' di riempimento e risolve la classe intera. La
       * cura «giusta» sarebbe rivoltare le normali in Blender e ricuocere, che
       * e' mezza giornata per la stessa immagine.
       */
      m.side = DoubleSide
      m.needsUpdate = true
    }
  })
  camera?.layers?.enable(STRATO_MONDO)
}

function accendiLuci () {
  if (luci || !grezze || !grezze.length) return
  luci = new Group()
  luci.name = 'luciPratiche'
  const n = QUANTE_LUCI
  for (let i = 0; i < n; i++) {
    /* si salta il primo e l'ultimo estremo: agli estremi ci sono le soglie, e
       una plafoniera sulla soglia acceca invece di illuminare */
    const t = (i + 0.5) / n
    const v = grezze[Math.round(t * (grezze.length - 1))]
    const x = v.p[0]
    const y = v.p[1] + ALTEZZA_LUCE_M
    const z = v.p[2]

    const l = new PointLight(COLORE_LUCE, INTENSITA, PORTATA_M, 2)
    l.layers.set(STRATO_MONDO)
    l.position.set(x, y, z)
    luci.add(l)

    /* e il corpo illuminante si VEDE: una luce senza sorgente visibile e' una
       stanza illuminata da niente, che l'occhio legge come finta */
    const piastra = new Mesh(
      new PlaneGeometry(0.5, 0.12),
      new MeshBasicMaterial({ color: new Color(COLORE_LUCE), toneMapped: false })
    )
    piastra.position.set(x, y + 0.06, z)
    piastra.layers.set(STRATO_MONDO)
    piastra.rotation.x = Math.PI / 2
    luci.add(piastra)
  }
  gruppo.add(luci)
}

  let ancorato = false
  function ancoraA (x, y, z, guardaCome, camera) {
    gruppo.position.set(x, y, z)
    gruppo.updateWorldMatrix(true, true)
    componiPose()            // dipendono da matrixWorld: vanno rifatte
    misuraFrancoChiglia()
    contaPoseSopraPonte()
    /* la correzione porta l'ULTIMA posa esattamente sull'orientamento del sito:
       delta = voluto * attuale^-1, applicato a sinistra */
    if (guardaCome && pose && pose.length) {
      const ultima = pose[pose.length - 1].q
      correzione = guardaCome.clone().multiply(ultima.clone().invert())
      diag = { voluto: [guardaCome.x, guardaCome.y, guardaCome.z, guardaCome.w].map(n=>+n.toFixed(4)), ultima: [ultima.x, ultima.y, ultima.z, ultima.w].map(n=>+n.toFixed(4)) }
    }
    cameraDelSito = camera || null
    isolaDallaLuceDiFuori(camera)
    /* le materie DOPO l'isolamento: `isolaDallaLuceDiFuori` chiama
       `needsUpdate`, e vestire prima significherebbe farlo due volte */
    vestite = vestiMondo(gruppo)
    ancorato = true
  }

  let pronto = false
  let errore = null
  let maglie = 0

  const caricato = new Promise((risolvi) => {
    new GLTFLoader()
      .setMeshoptDecoder(MeshoptDecoder)
      .load(
        base + 'modelli/traversata-world.glb',
        (glb) => {
          glb.scene.traverse((o) => { if (o.isMesh) maglie++ })
          gruppo.add(glb.scene)
          misuraFrancoChiglia()
          pronto = true
          risolvi(true)
        },
        undefined,
        (e) => {
          /**
           * Un modello che non arriva NON deve spegnere il sito: il filmato e'
           * ancora li' e il finale funziona. Si registra l'errore e si dichiara
           * `pronto` falso -- chi legge decide, e nessuno resta con lo schermo
           * nero perche' una richiesta di rete e' andata storta.
           */
          errore = String(e?.message || e)
          risolvi(false)
        }
      )
  })

  /**
   * ─── LA CURVA, e perche' arriva come tabella e non come animazione
   *
   * `traversata-camera.json` porta 96 pose a passo costante di lunghezza
   * d'arco, in metri, nel frame del mondo. NON e' un'animazione: non contiene
   * nessun tempo. E' l'articolo 4 del contratto -- «la durata non si cuoce
   * nello spazio: il sito deve poter rimappare il progresso di scroll sulla
   * curva senza cambiarne la traiettoria» -- ed e' la ragione per cui la camera
   * NON e' stata messa dentro il GLB, dove si sarebbe portata dietro una legge
   * oraria.
   *
   * Le pose vengono trasformate una volta sola, al caricamento, dallo spazio
   * del mondo a quello della scena: sono poche decine di punti, e farlo a ogni
   * fotogramma sarebbe lavoro ripetuto per un dato che non cambia mai.
   */
  let pose = null
  let lunghezza = 0

  /**
   * ─── LE POSE SI COMPONGONO DOPO, NON APPENA ARRIVANO
   *
   * DIFETTO GRAVE, e mascherato bene. Qui le pose venivano portate nello spazio
   * della scena con `gruppo.matrixWorld` NEL MOMENTO IN CUI ARRIVAVA IL JSON.
   * Ma l'offset verticale del gruppo lo scrive `appoggiaSullaChiglia()`, che
   * gira quando arriva il GLB. Il JSON pesa 16 KB e il GLB 1,67 MB: il piccolo
   * vince sempre, quindi le pose venivano composte con `position.y = 0` e la
   * camera restava UN METRO E VENTICINQUE SOTTO -- fuori dallo scafo,
   * sott'acqua, davanti a lastre grigie.
   *
   * Nessun errore da nessuna parte: due `Promise` che si risolvono, ognuna
   * corretta per conto suo, e in mezzo una dipendenza che il codice non
   * dichiarava. L'ho visto solo guardando un fotogramma, dopo aver acceso la
   * geometria -- finche' il mondo era invisibile, la camera sbagliata non si
   * vedeva.
   *
   * Adesso il JSON si tiene GREZZO, e la composizione avviene una volta sola
   * quando ENTRAMBI sono arrivati. Una dipendenza fra due caricamenti si
   * scrive, non si spera nell'ordine di arrivo.
   */
  let grezze = null

  function componiPose () {
    if (!grezze) return
    gruppo.updateWorldMatrix(true, false)
    pose = grezze.map((v) => {
      const p = new Vector3(v.p[0], v.p[1], v.p[2]).applyMatrix4(gruppo.matrixWorld)
      /* il quaternione arriva in ordine glTF (x,y,z,w), che e' anche quello
         del costruttore di three: si passa diretto. Poi si compone con la
         rotazione del gruppo, o la camera guarderebbe dove guardava nel
         frame del mondo invece che in quello della scena. */
      const q = new Quaternion(v.q_gltf[0], v.q_gltf[1], v.q_gltf[2], v.q_gltf[3])
      return { s: v.s, p, q: gruppo.quaternion.clone().multiply(q) }
    })
  }

  const curva = fetch(base + 'modelli/traversata-camera.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
    .then((d) => {
      lunghezza = d.lunghezza_m || 0
      grezze = d.pose
      return true
    })
    .catch((e) => { errore = errore || ('curva: ' + e.message); return false })

  /**
   * La posa a `s` (0..1 sulla lunghezza d'arco), gia' nello spazio della scena.
   * Interpola linearmente fra i due campioni piu' vicini per la posizione e
   * `slerp` per l'orientamento -- che e' l'unico modo di interpolare una
   * rotazione senza passare per pose che nessuno ha chiesto.
   */
  /**
   * ─── QUANTE POSE STANNO SOPRA IL PONTE, misurato QUI e non altrove
   *
   * Una revisione aveva risposto «zero pose sopra il ponte» contando su
   * `traversata-camera.json`. Il conto era giusto e la risposta non valeva: il
   * JSON e' l'ASSET, e le pose che il sito usa passano per una scala 1/2,5, una
   * rotazione di 90 gradi, un offset in z e -- soprattutto -- un `position.y`
   * calcolato a runtime da `appoggiaSullaChiglia()`. Misurare sull'asset
   * significa rispondere in un sistema di coordinate in cui la domanda non vive.
   *
   * E' la stessa famiglia del difetto che questo file ha appena pagato, dove le
   * pose venivano composte prima che quell'offset esistesse.
   *
   * Quindi il conto si fa dove le due cose sono nello stesso spazio: qui, dopo
   * `componiPose()`, con `sezioneA` a portata di mano. Chi guarda da fuori
   * legge un numero invece di rifare una trasformazione -- e rifarla e'
   * esattamente il modo in cui si sbaglia.
   *
   * ─── MA ATTENZIONE A COSA VUOL DIRE, che me lo sono chiarito dopo
   *
   * `ponteY` e' il PONTE PRINCIPALE. Il salone non ci sta sopra per errore: ci
   * sta sopra per costruzione, perche' e' dentro la TUGA. La regia stessa mette
   * la camera del salotto a `nave.position.y + tugaQuota` = 1,4528, mentre il
   * ponte a quella stazione e' a 0,936: mezzo metro piu' in basso.
   *
   * Quindi «pose sopra il ponte» NON e' un elenco di difetti. E' un numero
   * onesto su una domanda che, per l'ultimo tratto, e' quella sbagliata: la
   * traversata FINISCE nella tuga, e li' stare sopra il ponte principale e'
   * giusto. Il numero serve per il tratto BASSO -- locale tecnico e corridoio,
   * che sotto coperta ci devono stare -- e li' va guardato.
   *
   * Lo si tiene perche' misura qualcosa di vero, non perche' giudichi. Il
   * giudizio richiederebbe la superficie visibile di scafo e tuga, che questo
   * modulo non ha.
   */
  let francoChiglia = null
  let poseSopraPonte = null
  let campionePonte = null
  let margineMinimoPonte = null

  function contaPoseSopraPonte () {
    if (!pose || !pose.length) return
    let sopra = 0
    let peggiore = Infinity
    for (const v of pose) {
      const t = MathUtils.clamp((v.p.z - PRUA_Z) / (POPPA_Z - PRUA_Z), 0, 1)
      const margine = sezioneA(t).ponteY - v.p.y   // positivo = la camera sta SOTTO
      if (margine < 0) sopra++
      if (margine < peggiore) peggiore = margine
    }
    poseSopraPonte = sopra
    margineMinimoPonte = peggiore
    /* per chi deve capire se il numero e' plausibile: qualche riga in chiaro */
    campionePonte = [0, 24, 48, 72, 95].map((i) => {
      const v = pose[Math.min(i, pose.length - 1)]
      const t = MathUtils.clamp((v.p.z - PRUA_Z) / (POPPA_Z - PRUA_Z), 0, 1)
      const sez = sezioneA(t)
      return { i, z: +v.p.z.toFixed(3), camY: +v.p.y.toFixed(3),
               ponteY: +sez.ponteY.toFixed(3), chiglia: +sez.chiglia.toFixed(3) }
    })
  }

  const _pa = new Vector3()
  const _qa = new Quaternion()
  const _qc = new Quaternion()
  function posaA (s) {
    if (!pose || pose.length < 2) return null
    const x = MathUtils.clamp(s, 0, 1) * (pose.length - 1)
    const i = Math.min(pose.length - 2, Math.floor(x))
    const f = x - i
    _pa.copy(pose[i].p).lerp(pose[i + 1].p, f)
    _qa.copy(pose[i].q).slerp(pose[i + 1].q, f)
    if (correzione) {
      /* si innesta solo sull'ultimo tratto, e in modo continuo: a s = 1-INNESTO
         la correzione e' nulla, a s = 1 e' intera */
      const t = Math.max(0, (MathUtils.clamp(s, 0, 1) - (1 - INNESTO)) / INNESTO)
      if (t > 0) {
        _qc.identity().slerp(correzione, t)
        _qa.premultiply(_qc)
      }
    }
    return { p: _pa, q: _qa }
  }

  scena.add(gruppo)

  return {
    gruppo,
    caricato: Promise.all([caricato, curva]).then((v) => {
      /* qui, e solo qui, il gruppo e' appoggiato sulla chiglia E le pose
         esistono: e' l'unico istante in cui comporle e' corretto */
      if (v[0] && v[1]) { componiPose(); misuraFrancoChiglia(); contaPoseSopraPonte(); accendiLuci() }
      return v[0] && v[1]
    }),
    posaA,
    ancoraA,
    get ancorato () { return ancorato },
    get lunghezza () { return lunghezza },
    get pose () { return pose ? pose.length : 0 },
    /* «pronto» vuol dire USABILE, non «il GLB e' arrivato». Senza le pose
       composte la camera non viene spostata, e accendere la geometria vista
       dalla camera del sito mostrerebbe le stanze da fuori per qualche
       fotogramma. Una sola condizione, cosi' chi la legge non deve saperne due. */
    get pronto () { return pronto && !!pose },
    get errore () { return errore },
    get maglie () { return maglie },
    /** `q` da 0 a 1: quanto il mondo e' in campo. Per ora acceso/spento. */
    /**
     * ─── E DENTRO LO SCAFO NON SI VEDE IL MARE
     *
     * Con la luce giusta la scala si leggeva, ma ai lati compariva il mare e
     * una riga orizzontale tagliava il quadro a meta' -- la stessa che si vede
     * nel provino, anche sopra le due persone del finale.
     *
     * NON ERANO LE NORMALI. L'ipotesi ovvia -- volumi modellati da fuori, facce
     * posteriori scartate -- l'ho provata con `DoubleSide` e non e' cambiato
     * niente. Misurato invece di indovinato: le pareti ci sono e sono visibili,
     * x da -0,21 a +0,22 e y da 0,11 a 1,82, e la camera sta a
     * (0,01 · 0,52 · 3,93), cioe' DENTRO in tutte e tre le direzioni.
     *
     * Quello che si vedeva era il MARE DEL SITO disegnato sopra: la camera
     * durante la traversata sta sulla linea d'acqua, e il piano del mare
     * attraversa il corridoio.
     *
     * Gli strati risolvono anche questo, e in una riga: mentre si e' dentro, la
     * camera smette di guardare lo strato zero -- mare, cielo, scafo, tutto
     * cio' che sta fuori. Restano solo gli ambienti e le loro plafoniere, che
     * e' esattamente cio' che si vede stando sotto coperta.
     *
     * Si riaccende uscendo, perche' il resto del racconto e' tutto la' fuori.
     */
    mostra (q) {
      const dentro = pronto && q > 0.002
      gruppo.visible = dentro
      if (cameraDelSito) {
        if (dentro) cameraDelSito.layers.disable(0)
        else cameraDelSito.layers.enable(0)
      }
    },
    /** Lo stato, per i cancelli: cosi' misurano invece di fidarsi. */
    get stato () {
      return {
        pronto,
        errore,
        maglie,
        visibile: gruppo.visible,
        scala: gruppo.scale.x,
        offsetZ: gruppo.position.z,
        offsetY: gruppo.position.y,
        sfondamentoPonte: sfondamento,
        francoChiglia,
        ancorato,
        luci: luci ? luci.children.filter((c) => c.isLight).length : 0,
        vestite,
        diag,
        correzioneGradi: correzione ? +(2 * Math.acos(Math.min(1, Math.abs(correzione.w))) * 180 / Math.PI).toFixed(2) : null,
        /* misurati nello spazio della scena, non sull'asset -- vedi
           contaPoseSopraPonte() e la nota che la accompagna */
        poseSopraPonte,
        margineMinimoPonte,
        campionePonte,
        pose: pose ? pose.length : 0,
        lunghezzaCurva: lunghezza,
        ponte: 'DERIVATO, non confermato — vedi collaudo-verticale.mjs'
      }
    }
  }
}
