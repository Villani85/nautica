/**
 * PROIETTARE UNA FOTOGRAFIA SU UNA GEOMETRIA, dal punto in cui e' stata scattata.
 *
 * ─── A COSA SERVE, E DOVE E' GIA' SERVITO DUE VOLTE
 *
 * Il salone di questo sito e' una fotografia. Da sola e' una carta: appena la
 * camera si sposta, il suo rettangolo si vede. La cura e' un guscio essenziale
 * -- pavimento, soffitto, imbotti del vano, montante, pareti -- su cui la
 * fotografia viene PROIETTATA dal punto in cui e' stata scattata: dove la
 * camera del sito coincide con quel punto l'immagine e' esatta, e allontanandosi
 * sbaglia in modo continuo invece di rivelare un bordo.
 *
 * Due posti la usano, e sono lo stesso problema:
 *
 *   `mondo.js`    la traversata FINISCE sulla camera sorgente, quindi la stanza
 *                 si materializza mentre ci si avvicina e all'arrivo e' esatta.
 *   `guscio.js`   il salone visto da fuori, dove la lastra si rivelava.
 *
 * ─── PERCHE' NELLO SHADER E NON NELLE UV, come diceva `guscio.js`
 *
 * Il commento in testa a `guscio.js` sosteneva che la proiezione e' un DATO del
 * modello -- UV cotte in Blender -- e non un calcolo da rifare a ogni
 * fotogramma. L'argomento e' buono e il file era sincero. Ma il modello quelle
 * UV NON LE PORTA: `public/modelli/guscio-salone.glb` ha otto maglie con
 * `POSITION` e `NORMAL` e nient'altro (verificato leggendo il glTF, non il
 * commento). Con `map` e senza `uv`, WebGL da' zero a ogni vertice e l'intero
 * guscio prende il colore di UN texel: e' per questo che `?guscio=1` non ha mai
 * mostrato la stanza.
 *
 * Fra rifare la cottura e fare l'aritmetica qui, questa e' la volta in cui il
 * calcolo vince -- e non per pigrizia: nella traversata il proiettore NON puo'
 * stare in una UV, perche' la posa d'arrivo la decide `ancoraA` a runtime
 * (`correzione`, fino a diciannove gradi). Una UV cotta descriverebbe una posa
 * che il sito non usa. Un file solo, usato da due posti, invece di due
 * implementazioni della stessa aritmetica: e' la regola del repo, applicata
 * dove porta.
 */
import { Matrix4 } from 'three'

/**
 * Innesta la proiezione nel materiale dato.
 *
 * L'innesto sta DOPO `colorspace_fragment`, non prima: la lastra del filmato si
 * monta con `toneMapped: false` perche' la fotografia porta gia' la propria
 * curva, e mescolare dopo la conversione di spazio fa esattamente la stessa
 * cosa. Cosi' guscio e lastra restano confrontabili invece di stare uno una
 * curva piu' in la' dell'altro.
 *
 * @param {import('three').Material} materiale
 * @param {import('three').Texture} tessitura  la fotografia (o il filmato)
 * @returns {{uniformi: object|null}} un riferimento alle uniformi, quando lo
 *   shader e' stato compilato: e' li' che si scrivono matrice e miscela.
 */
export function innestaProiezione (materiale, tessitura) {
  if (!materiale || materiale.__proiezione) return materiale.__proiezione || null
  const riferimento = { uniformi: null }
  materiale.__proiezione = riferimento
  materiale.onBeforeCompile = (sh) => {
    sh.uniforms.uFoto = { value: tessitura }
    sh.uniforms.uProiezione = { value: new Matrix4() }
    sh.uniforms.uMiscela = { value: 0 }
    riferimento.uniformi = sh.uniforms
    sh.vertexShader = `varying vec3 vPuntoMondo;
` + sh.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
  vPuntoMondo = (modelMatrix * vec4(position, 1.0)).xyz;`)
    sh.fragmentShader = `uniform sampler2D uFoto;
uniform mat4 uProiezione;
uniform float uMiscela;
varying vec3 vPuntoMondo;
` + sh.fragmentShader.replace('#include <colorspace_fragment>', `#include <colorspace_fragment>
  if (uMiscela > 0.001) {
    vec4 pp = uProiezione * vec4(vPuntoMondo, 1.0);
    if (pp.w > 0.0) {
      vec2 uvp = pp.xy / pp.w * 0.5 + 0.5;
      /**
       * ─── FUORI DAL FOTOGRAMMA, LA STESSA CURA DEL SITO: una copia ingrandita
       *
       * La prima stesura spegneva la proiezione fuori dal quadro della
       * fotografia. Su uno schermo largo si notava appena; su un telefono
       * (390x844) no: la stanza usciva come un rettangolo sospeso in mezzo al
       * guscio color crema -- cioe' la «carta» che il guscio esiste per non far
       * vedere. Preso guardando i provini a 390x844, che nessuno aveva ancora
       * guardato.
       *
       * La seconda stesura allungava il bordo (clamp): peggio, strisce lunghe e
       * evidenti su tutta la parete.
       *
       * Questa e' la cura che il sito usa gia' per lo stesso problema: il
       * fondo di salone3d.js e' una copia INGRANDITA quattro volte dello
       * stesso filmato, messa dietro la lastra per non lasciare bordi. Qui si
       * fa lo stesso dentro lo shader -- fuori dal fotogramma si campiona la
       * stessa immagine rimpicciolita attorno al centro -- e la transizione si
       * sfuma. Non e' stanza inventata: e' la stessa fotografia, e chi guarda
       * legge una continuazione fuori fuoco invece di un taglio.
       */
      vec2 stretta = clamp(uvp, 0.0, 1.0);
      float fuori = smoothstep(0.0, 0.06, length(uvp - stretta));
      vec2 larga = clamp((uvp - 0.5) / 4.0 + 0.5, 0.0, 1.0);
      vec3 foto = mix(texture2D(uFoto, stretta).rgb, texture2D(uFoto, larga).rgb, fuori);
      gl_FragColor.rgb = mix(gl_FragColor.rgb, foto, uMiscela);
    }
  }`)
  }
  materiale.needsUpdate = true
  return riferimento
}

/**
 * La matrice del proiettore: proiezione per l'inversa del mondo, cioe' «dove
 * finisce questo punto dentro il fotogramma».
 *
 * La camera va aggiornata dal chiamante (posizione, orientamento, apertura):
 * qui si compone soltanto, perche' chi proietta sa dove sta e questo file no.
 */
export function matriceProiettore (proiettore, dentro = new Matrix4()) {
  proiettore.updateMatrixWorld(true)
  return dentro.copy(proiettore.projectionMatrix).multiply(proiettore.matrixWorldInverse)
}
