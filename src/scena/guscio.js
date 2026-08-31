import { Group, Matrix4, Quaternion, Vector3, MeshBasicMaterial, DoubleSide } from 'three'
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
 * ─── LE UV SONO COTTE, e non e' pigrizia
 *
 * La proiezione potrebbe rifarsi in uno shader a ogni fotogramma. Sarebbe la
 * stessa aritmetica in un secondo posto, e questo repo ha gia' pagato due volte
 * il prezzo di due implementazioni della stessa cosa. La camera sorgente non si
 * muove mai: la proiezione e' un DATO del modello, non un calcolo. Cotta nel
 * GLB da `riferimenti/blender/guscio-esporta.py`, il browser applica una
 * texture video e basta.
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

export function creaGuscio (base, texturaStanza, bersaglio) {
  const gruppo = new Group()
  gruppo.name = 'GUSCIO_SALONE'

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
        o.material = new MeshBasicMaterial({
          map: texturaStanza, toneMapped: false, side: DoubleSide
        })
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

      /* la camera sorgente ha fatto il suo lavoro: non deve restare nella scena
         come oggetto, o `collaudo-continuita` conterebbe una camera in piu' */
      sorgente.parent?.remove(sorgente)
      gruppo.add(glb.scene)
    },
    undefined,
    (e) => console.warn('[nautica] il guscio del salone non si carica:', e?.message || e)
  )

  return gruppo
}
