import { Group, Matrix4, Quaternion, Vector3, MeshBasicMaterial, DoubleSide, PerspectiveCamera } from 'three'
import { innestaProiezione } from './proiezione.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

/**
 * IL GUSCIO DEL SALONE — la fotografia smette di essere una carta.
 *
 * ─── IL DIFETTO, e perche' nessun cancello lo vedeva
 *
 * A scorrimento 0,235 il salone si rivelava per quello che era: un rettangolo
 * con quattro bordi netti incastrato nello scafo, col taglio verticale destro
 * che attraversava il salotto a meta'. La prova sta in
 * `feedback/prove/2026-08-29-salone-e-una-carta.png`.
 *
 * `collaudo-filmato` passava, e aveva ragione: misura che la camera della clip
 * sta ferma (0,18% di carrellata) e che la maschera non scivola oltre il vano
 * (1,9 px su 24). Guarda DENTRO l'inquadratura. Il difetto stava sul suo BORDO,
 * dove nessuna misura andava.
 *
 * ─── PERCHE' UN GUSCIO 2,5D E NON UNA PROIEZIONE DELLA STANZA INTERA
 *
 * La strada e' quella indicata da una revisione esterna, e la ragione e' che
 * la clip **e' generata**: puo' contenere piu' prospettive localmente
 * plausibili ma incompatibili con una sola camera pinhole. Proiettare l'intera
 * stanza su una camera inventata significa costruire su un numero che non si
 * puo' misurare.
 *
 * Quindi: la fotografia resta il fondale di pregio, e diventa geometria solo
 * cio' che PRODUCE PARALLASSE -- pavimento, soffitto, imbotti del vano,
 * montante, pareti. Otto pezzi, 122 KB compressi.
 *
 * ─── LA POSA NON E' INVENTATA, E LA FOCALE NEMMENO
 *
 * `riferimenti/salone/posa.json` porta la posa risolta con errore medio
 * **1,175 px** sulle rette del vano e **1,56 px** contro la maschera gia'
 * spedita. La focale non e' misurata e il file lo dichiara: e' DICHIARATA dal
 * sito stesso -- `new PerspectiveCamera(34, ...)` in `index.js` -- perche' la
 * fotografia e' montata per riempire quel campo. Il file porta anche la
 * sensibilita': focale +/-20% sposta il fondo del +/-20% e lascia il vano
 * fermo allo 0,05%.
 *
 * ─── LE UV NON SONO COTTE, e qui c'era scritto di si'
 *
 * CORREZIONE DEL 2 SETTEMBRE 2026. Questo paragrafo diceva che la proiezione e'
 * un DATO del modello -- UV cotte da `guscio-esporta.py` -- e che rifarla in uno
 * shader sarebbe stata la stessa aritmetica in un secondo posto. L'argomento
 * regge; il fatto no. `public/modelli/guscio-salone.glb` porta otto maglie con
 * `POSITION` e `NORMAL` **e nient'altro**: nessun `TEXCOORD_0`. Letto nel glTF,
 * non nel commento.
 *
 * La conseguenza spiega perche' `?guscio=1` non ha mai mostrato la stanza: con
 * `map` assegnata e senza attributo `uv`, WebGL da' zero a ogni vertice e tutto
 * il guscio prende il colore di UN texel. Non era da guardare e da tarare: era
 * rotto, e il commento diceva il contrario.
 *
 * Adesso la proiezione si fa nello shader, e da un file solo -- `proiezione.js`
 * -- usato anche dalla traversata. Non e' la stessa aritmetica in due posti: e'
 * la stessa aritmetica in UN posto, chiamata da due. E nella traversata una UV
 * cotta non potrebbe nemmeno esistere, perche' la posa d'arrivo la decide
 * `ancoraA` a runtime.
 *
 * ─── COSA FUNZIONA ADESSO E COSA NO, guardato il 2 settembre
 *
 * FUNZIONA: il guscio porta la fotografia invece di una tinta piatta. Nella
 * traversata la stessa proiezione regge fino a combaciare con la lastra
 * all'arrivo (`mondo.js`).
 *
 * NON FUNZIONA ANCORA: **il guscio copre solo una fascia del quadro**, e il
 * resto di cio' che si vede non e' lui. Provato dipingendo la uv proiettata
 * come colore invece della fotografia: le tinte del diagnostico compaiono in
 * una striscia verticale al centro-destra e sul bordo destro, e basta. Tutto il
 * resto -- il mare, le nuvole, il montante -- e' altra roba della scena.
 *
 * Il che spiega anche perche' `registro-guscio.mjs` non scendeva sotto i 17
 * livelli per quanto si spostasse il bersaglio: **confrontava la lastra con
 * qualcosa che non era il guscio**. Un metro che non controlla di avere in
 * quadro la cosa che misura da' sempre un numero, e il numero e' sempre
 * sbagliato.
 *
 * Cio' che si SA adesso, e da cui ripartire:
 *
 *   · il proiettore combacia con la camera del sito quando il bersaglio e'
 *     quello MISURATO -- [0,1188 0,0043 1,3089] nel sistema del salone, non
 *     [-0,01 0 1,3089] come dichiarato qui sotto. Verificato: uv del proiettore
 *     e ndc della camera coincidono a tre decimali;
 *   · con proiettore e camera coincidenti la proiezione DEVE dare la
 *     fotografia, e infatti dove il guscio c'e' la da';
 *   · quindi non e' un problema di proiezione ne' di posa del proiettore: e'
 *     che il guscio, in coordinate camera, sta fra x -0,6 e +2,49 -- tutto
 *     spostato a destra -- e la sua scatola alta 1,2 unita' sta a 3,5 unita'
 *     di distanza. Occupa una fetta del quadro, non il quadro.
 *
 * Per questo `?guscio=1` resta un interruttore e non il percorso predefinito.
 *
 * ─── DOVE VA MESSO: aritmetica, non tentativi
 *
 * Misurato sul sito (`strumenti/posa-sito.mjs`): alla battuta del salone la
 * camera sta a `(0.0065, 1.4528, 1.9089)` unita' con rotazione **zero**, cioe'
 * 1,309 unita' davanti al gruppo, in asse. La camera sorgente della fotografia
 * sta invece a 0,84 m dalla parete con 19 gradi di imbardata.
 *
 * Sono pose diverse, e perche' la proiezione regga devono COINCIDERE. Il guscio
 * si piazza quindi con la trasformazione che porta l'una sull'altra:
 *
 *     q = q_sito * q_sorgente⁻¹          p = C − q · (S · scala)
 *
 * Non c'e' niente da regolare a occhio: se i due numeri sono giusti, il guscio
 * cade dove deve. Se sono sbagliati, si vede subito e di quanto.
 */

/** 1 unita' di scena = 2,5 m (`src/scafo/ordinate.js:19`). */
const METRI_PER_UNITA = 2.5

/**
 * ─── LA POSA SORGENTE ARRIVA DAL GLB, non piu' ricostruita qui
 *
 * Qui c'era la matrice di `posa.json` riscritta a mano, trasposta, e
 * moltiplicata per mezzo giro attorno a X. Tre passaggi, e in tutti e tre si
 * puo' sbagliare in silenzio: il guscio finiva sopra la tuga e nessun errore lo
 * diceva.
 *
 * Adesso `guscio-esporta.py` esporta la camera come nodo
 * `CAMERA_SORGENTE_SALONE`, e **la conversione degli assi viaggia dentro il
 * file** insieme alla geometria. Qui si legge un nodo e si compongono due
 * trasformazioni.
 *
 * E' la stessa regola che questo repo applica ai numeri: chi ha la misura la
 * pubblica, invece di lasciare che chi la usa la ricostruisca per
 * approssimazione.
 */

/**
 * @param {number} aspetto  il rapporto del fotogramma su cui la fotografia e'
 *   montata: la lastra e' larga `larg` e alta `alt`, e riempie il quadro, quindi
 *   il proiettore deve avere lo stesso rapporto o la stanza esce stirata.
 */
export function creaGuscio (base, texturaStanza, bersaglio, aspetto = 1.6) {
  const gruppo = new Group()
  gruppo.name = 'GUSCIO_SALONE'
  /* la lente della fotografia: 34 gradi verticali, dichiarati da posa.json */
  const proiettore = new PerspectiveCamera(34, aspetto, 0.05, 60)
  const matriceLocaleSorgente = new Matrix4()
  const _proiezione = new Matrix4()
  const _dove = new Vector3()
  const _verso = new Quaternion()
  const _scala = new Vector3()
  const UNO = new Vector3(1, 1, 1)
  const proiezioni = []
  let dentroIlGruppo = null
  let pronto = false

  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
    base + 'modelli/guscio-salone.glb',
    (glb) => {
      const sorgente = glb.scene.getObjectByName('CAMERA_SORGENTE_SALONE')
      if (!sorgente) {
        console.warn('[nautica] il guscio non porta CAMERA_SORGENTE_SALONE: non so dove metterlo')
        return
      }

      glb.scene.traverse((o) => {
        if (!o.isMesh) return
        /**
         * `DoubleSide` perche' la camera del sito entra e esce dalla stanza:
         * da fuori si guardano le facce interne dei piani. Non e' un rimedio a
         * normali sbagliate -- le scatole sono chiuse -- e' che il guscio va
         * guardato da tutte e due le parti.
         *
         * `toneMapped: false` come la lastra che sostituisce: la fotografia
         * porta gia' la propria curva, e passarla una seconda volta la
         * schiarirebbe due volte.
         */
        /**
         * Niente `map`: il guscio non ha UV (vedi la testa del file). Il
         * materiale porta il colore di fondo del guscio e la fotografia gli
         * arriva PROIETTATA, da `proiezione.js`.
         */
        o.material = new MeshBasicMaterial({
          color: 0xb4b0a8, toneMapped: false, side: DoubleSide
        })
        const r = innestaProiezione(o.material, texturaStanza)
        if (r) proiezioni.push(r)
      })

      /**
       * ─── LA COMPOSIZIONE, e adesso non c'e' piu' niente da indovinare
       *
       * Si vuole che la camera sorgente -- quella da cui la fotografia e' stata
       * proiettata sulle UV -- finisca esattamente dove sta la camera del sito
       * alla battuta del salone. Se ci finisce, la proiezione combacia con la
       * geometria e la stanza smette di essere una carta.
       *
       * Chiamando `T` la trasformazione del guscio, `S` la posa della sorgente
       * dentro il GLB e `B` il bersaglio nel sistema del gruppo:
       *
       *     T.q = B.q · S.q⁻¹            T.p = B.p − T.q · (S.p · scala)
       *
       * `scala` porta dai metri del rilievo alle unita' di scena, 1 = 2,5 m.
       *
       * Il bersaglio arriva MISURATO da `strumenti/posa-sito.mjs`, nel sistema
       * del gruppo e non della scena: il salone e' figlio di `nave`, la cui Y e'
       * animata dall'emersione, e una posa giusta in coordinate di scena e'
       * sbagliata come posizione locale. E' la trappola in cui sono caduto per
       * primo.
       */
      const scala = 1 / METRI_PER_UNITA
      sorgente.updateWorldMatrix(true, false)
      const sPos = new Vector3()
      const sQuat = new Quaternion()
      sorgente.matrixWorld.decompose(sPos, sQuat, new Vector3())

      /**
       * ─── LA CONVENZIONE SI CERCA, NON SI INDOVINA (`?conv=N`)
       *
       * Fra Blender, l'esportatore glTF e three.js ci sono piu' convenzioni
       * possibili, e ne ho gia' sbagliate due indovinando. Adesso che il
       * registro e' un NUMERO (`strumenti/registro-guscio.mjs`) la convenzione
       * si puo' cercare: si provano le varianti e vince quella che minimizza
       * lo scarto in pixel.
       *
       * E' lo stesso metodo con cui `guscio-camera-prova.py` ha risolto la posa
       * in Blender -- quattro combinazioni provate contro la maschera spedita,
       * non una scelta. Qui il banco e' il sito.
       *
       * Il default e' 0. Il giorno in cui la ricerca ha un vincitore, quel
       * valore diventa l'unico e questo interruttore sparisce.
       */
      const conv = Number(new URLSearchParams(location.search).get('conv') || 0)
      const RADDRIZZA = [
        new Quaternion(),                                                    // 0 · com'e'
        new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2),
        new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2),
        new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI),
        new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI),
        new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI)
      ]
      sQuat.multiply(RADDRIZZA[conv] || RADDRIZZA[0])

      gruppo.quaternion.copy(bersaglio.quaternione).multiply(sQuat.clone().invert())
      gruppo.position.copy(bersaglio.posizione).sub(
        sPos.clone().multiplyScalar(scala).applyQuaternion(gruppo.quaternion)
      )
      /* `?ds=` moltiplica la scala: e' l'ultima incognita del piazzamento, e
         come le altre si CERCA col registro in pixel invece di sceglierla */
      const ds = Number(new URLSearchParams(location.search).get('ds') || 1)
      gruppo.scale.setScalar(scala * ds)

      /**
       * ─── IL PROIETTORE E' LA CAMERA SORGENTE, ma non entra in scena
       *
       * La sua posa serve a ogni fotogramma (il gruppo si muove col salone, che
       * rolla), e un nodo camera in piu' lo conterebbe `collaudo-continuita`.
       * Quindi si tiene la sua matrice LOCALE e si compone a mano: il
       * proiettore vive fuori dal grafo e la sua `matrixWorld` la scrivo io.
       */
      /* relativa alla RADICE del GLB, non al genitore: se un giorno la camera
         sorgente finisse annidata sotto un altro nodo, `sorgente.matrix` da
         sola descriverebbe un'altra cosa */
      sorgente.updateWorldMatrix(true, false)
      glb.scene.updateWorldMatrix(true, false)
      matriceLocaleSorgente.copy(glb.scene.matrixWorld).invert().multiply(sorgente.matrixWorld)
      sorgente.parent?.remove(sorgente)
      gruppo.add(glb.scene)
      dentroIlGruppo = glb.scene
      proiettore.aspect = aspetto
      proiettore.updateProjectionMatrix()
      pronto = true
    },
    undefined,
    (e) => console.warn('[nautica] il guscio del salone non si carica:', e?.message || e)
  )

  /**
   * Da chiamare a ogni fotogramma finche' il guscio si vede: la posa del
   * proiettore segue il gruppo, che segue il salone, che rolla.
   */
  gruppo.aggiornaProiezione = (miscela = 1) => {
    if (!pronto || !proiezioni.length) return
    dentroIlGruppo.updateWorldMatrix(true, false)
    proiettore.matrixWorld.multiplyMatrices(dentroIlGruppo.matrixWorld, matriceLocaleSorgente)
    /**
     * ─── LA SCALA DEL GRUPPO SI TOGLIE, MA NON ERA LEI
     *
     * Il gruppo del guscio e' scalato 1/2,5 (metri -> unita' di scena), e
     * componendo la matrice del proiettore col gruppo quella scala ci finisce
     * dentro: il verso di vista usciva lungo 0,4 invece di 1. L'avevo presa per
     * la causa dell'immagine ingrandita e ho scritto qui che «era tutta la
     * storia»: NON LO ERA, e la misura l'ha detto subito -- tolta la scala, il
     * registro restava 23,9. Una scala UNIFORME si semplifica nella divisione
     * prospettica: x/z non cambia, quindi l'immagine nemmeno.
     *
     * La riga resta perche' una camera con la scala dentro e' comunque una
     * camera che dichiara il falso -- e il giorno in cui la scala non fosse
     * uniforme si semplificherebbe niente. Ma la ragione dell'ingrandimento e'
     * un'altra, ed e' scritta in testa al file: il guscio copre solo una fascia
     * del quadro.
     */
    proiettore.matrixWorld.decompose(_dove, _verso, _scala)
    proiettore.matrixWorld.compose(_dove, _verso, UNO)
    proiettore.matrixWorldInverse.copy(proiettore.matrixWorld).invert()
    _proiezione.copy(proiettore.projectionMatrix).multiply(proiettore.matrixWorldInverse)
    gruppo.userData.proiettore = {
      p: [+proiettore.matrixWorld.elements[12].toFixed(3), +proiettore.matrixWorld.elements[13].toFixed(3), +proiettore.matrixWorld.elements[14].toFixed(3)],
      /* la terza colonna della matrice e' l'asse Z del proiettore: una camera
         guarda lungo -Z, quindi il verso di vista e' il suo opposto */
      avanti: [-(+proiettore.matrixWorld.elements[8].toFixed(3)), -(+proiettore.matrixWorld.elements[9].toFixed(3)), -(+proiettore.matrixWorld.elements[10].toFixed(3))]
    }
    for (const r of proiezioni) {
      if (!r.uniformi) continue
      r.uniformi.uMiscela.value = miscela
      r.uniformi.uProiezione.value.copy(_proiezione)
    }
  }

  return gruppo
}
