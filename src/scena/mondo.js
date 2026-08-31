import { Group, MathUtils, Vector3 } from 'three'
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

  scena.add(gruppo)

  return {
    gruppo,
    caricato,
    get pronto () { return pronto },
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
        ponte: 'DERIVATO, non confermato — vedi collaudo-verticale.mjs'
      }
    }
  }
}
