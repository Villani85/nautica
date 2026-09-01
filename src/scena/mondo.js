import { Group, MathUtils, Quaternion, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
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

/** `?mondo=1` (o `si`, o `true`) accende il mondo. Assente = spento. */
export function vuoleMondo (ricerca = (typeof location === 'undefined' ? '' : location.search)) {
  const v = new URLSearchParams(ricerca).get('mondo')
  return v === '1' || v === 'si' || v === 'true'
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

  function appoggiaSullaChiglia () {
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
    const chiglia = sezioneA(t(zDelPiuBasso)).chiglia
    gruppo.position.y = chiglia - piuBasso

    /* e si misura subito cosa costa: il tetto contro il ponte, alla stazione
       del punto piu' alto del mondo */
    const ponte = sezioneA(t(zDelPiuAlto)).ponteY
    sfondamento = (piuAlto + gruppo.position.y) - ponte
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
          appoggiaSullaChiglia()
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
  const _pa = new Vector3()
  const _qa = new Quaternion()
  function posaA (s) {
    if (!pose || pose.length < 2) return null
    const x = MathUtils.clamp(s, 0, 1) * (pose.length - 1)
    const i = Math.min(pose.length - 2, Math.floor(x))
    const f = x - i
    _pa.copy(pose[i].p).lerp(pose[i + 1].p, f)
    _qa.copy(pose[i].q).slerp(pose[i + 1].q, f)
    return { p: _pa, q: _qa }
  }

  scena.add(gruppo)

  return {
    gruppo,
    caricato: Promise.all([caricato, curva]).then((v) => {
      /* qui, e solo qui, il gruppo e' appoggiato sulla chiglia E le pose
         esistono: e' l'unico istante in cui comporle e' corretto */
      if (v[0] && v[1]) componiPose()
      return v[0] && v[1]
    }),
    posaA,
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
    mostra (q) { gruppo.visible = pronto && q > 0.002 },
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
        pose: pose ? pose.length : 0,
        lunghezzaCurva: lunghezza,
        ponte: 'DERIVATO, non confermato — vedi collaudo-verticale.mjs'
      }
    }
  }
}
