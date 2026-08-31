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
 * `rotazione_stanza_verso_camera` da `riferimenti/salone/posa.json`.
 *
 * La convenzione -- se usarla dritta o trasposta, e se la sorgente guardasse
 * lungo +Z o -Z -- non e' stata indovinata: l'ha DETERMINATA
 * `guscio-camera-prova.py` provando le quattro combinazioni contro la maschera
 * gia' spedita, e vince `trasposta` piu' una rotazione di pi greco attorno a X.
 * Le altre tre sbagliano il montante di centinaia di pixel.
 */
const R = [
  [0.325471, 0.005043, 0.945539],
  [-0.045003, -0.99877, 0.020818],
  [0.944481, -0.049328, -0.324844]
]

/** posizione della camera sorgente nel sistema del guscio, in metri */
const CAM_SORGENTE_M = new Vector3(-2.9322, 0.6072, 0.8436)

export function creaGuscio (base, texturaStanza, origineGruppo) {
  const gruppo = new Group()
  gruppo.name = 'GUSCIO_SALONE'

  /* la matrice trasposta, poi il mezzo giro attorno a X: la convenzione
     determinata per misura, non scelta */
  const m = new Matrix4().set(
    R[0][0], R[1][0], R[2][0], 0,
    R[0][1], R[1][1], R[2][1], 0,
    R[0][2], R[1][2], R[2][2], 0,
    0, 0, 0, 1
  ).multiply(new Matrix4().makeRotationX(Math.PI))

  const qSorgente = new Quaternion().setFromRotationMatrix(m)

  /**
   * La posa del sito alla battuta del salone, misurata e non supposta. La
   * rotazione e' zero: la camera guarda il salone in asse.
   */
  const C = new Vector3(0.0065, 1.4528, 1.9089)
  /* il guscio e' FIGLIO del gruppo del salone, che sta gia' a
     `(0, 1.4528, 0.6)`: la posa misurata e' in coordinate di scena, quindi si
     toglie l'origine del gruppo o la si applicherebbe due volte */
  if (origineGruppo) C.sub(origineGruppo)
  const qSito = new Quaternion()          // identita': rotazione 0, misurata

  const scala = 1 / METRI_PER_UNITA
  gruppo.quaternion.copy(qSito).multiply(qSorgente.clone().invert())
  gruppo.position.copy(C).sub(
    CAM_SORGENTE_M.clone().multiplyScalar(scala).applyQuaternion(gruppo.quaternion)
  )
  gruppo.scale.setScalar(scala)

  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
    base + 'modelli/guscio-salone.glb',
    (glb) => {
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
         * schiarirebbe due volte. E' lo stesso motivo per cui il salone attuale
         * lo dichiara.
         */
        o.material = new MeshBasicMaterial({
          map: texturaStanza, toneMapped: false, side: DoubleSide
        })
      })
      gruppo.add(glb.scene)
    },
    undefined,
    (e) => console.warn('[nautica] il guscio del salone non si carica:', e?.message || e)
  )

  return gruppo
}
