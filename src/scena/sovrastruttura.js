import { Group } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

/**
 * LA SOVRASTRUTTURA — i due ponti sopra la tuga, la coperta e la battagliola.
 *
 * ─── COSA CURA
 *
 * La nave aveva **un livello solo**: due `BoxGeometry` alte in tutto 1,8 m su
 * 15,5 m di lunghezza. Per questo leggeva come un pontone con una scatola
 * sopra invece che come uno yacht, ed e' la prima cosa che si vede del sito —
 * prima di qualunque materiale, di qualunque luce, di qualunque riflesso.
 *
 * ─── COSA NON TOCCA, E PERCHE'
 *
 * La tuga del ponte principale resta costruita in `nave.js`. Non e' un
 * compromesso: dentro ha un'**apertura vera** — fra la fascia bassa e quella
 * alta non c'e' niente — ed e' attraverso quel buco che si vedono il salone che
 * rolla e l'orizzonte che non rolla. E' la regola del sito: cio' che e'
 * diagramma si costruisce, cio' che e' fotografia si guarda attraverso
 * un'apertura. Modellarla in Blender con un vetro scuro la chiuderebbe, e
 * chiuderebbe la tesi con lei.
 *
 * Blender costruisce quindi cio' che sta SOPRA, e sa dove appoggiarsi perche'
 * `strumenti/esporta-coperta.mjs` gli passa la quota vera del tetto — inclinata
 * col cavallino, alle sue due estremita'. Nessun numero riscritto due volte.
 *
 * ─── IL TAGLIO LA ATTRAVERSA COME ATTRAVERSA IL RESTO
 *
 * I materiali che arrivano dal GLB non passano dall'elenco per nome di
 * `materiali.js`, quindi ne' il piano di sezione ne' l'ambiente li
 * raggiungerebbero. Vanno serviti qui, uno per uno, scendendo nell'albero:
 * senza il piano, la sovrastruttura resterebbe intera mentre lo scafo si apre —
 * una nave tagliata a meta' con la tuga intatta sopra.
 */

const UNITA_PER_METRO = 1 / 2.5

export function creaSovrastruttura (base, { ambiente = null, pianoSezione = null } = {}) {
  const gruppo = new Group()
  const parti = []

  const caricato = new Promise((risolvi, rifiuta) => {
    new GLTFLoader()
      .setMeshoptDecoder(MeshoptDecoder)
      .load(base + 'modelli/sovrastruttura.glb', (glb) => {
        const radice = glb.scene
        radice.scale.setScalar(UNITA_PER_METRO)
        radice.traverse(o => {
          if (!o.isMesh) return
          parti.push(o)
          for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
            if (!m) continue
            if (m.name === 'sovra_teak') fughe(m)
            if (pianoSezione) m.clippingPlanes = [pianoSezione]
            if (ambiente && 'envMap' in m) {
              m.envMap = ambiente
              // Piena, al contrario dell'impianto: questa roba sta in coperta e
              // il cielo lo vede tutto. E' anche cio' che fa leggere il vetro
              // scuro come vetro invece che come vernice nera.
              m.envMapIntensity = 1.0
            }
            m.needsUpdate = true
          }
        })
        gruppo.add(radice)
        risolvi({ parti })
      }, undefined, rifiuta)
  })

  return { gruppo, caricato, parti }
}


/**
 * ─── LE FUGHE DEL TEAK
 *
 * Una coperta in teak senza fughe e' una tavola marrone, e il generatore
 * Blender lo dichiarava come debito: «servirebbe una texture, e la texture
 * arriva dalla cottura». Una revisione l'ha rilevato come uno dei punti che
 * fanno leggere il risultato come «CG pulita».
 *
 * Le fughe pero' non hanno bisogno di una texture, e nemmeno delle UV: sono
 * righe parallele a intervallo costante, e la coordinata che serve — la
 * posizione lungo lo scafo — ce l'ha gia' ogni vertice. E' la stessa strada
 * gia' presa per le finestre di murata, per le stesse ragioni: nessuna UV da
 * cuocere, nessuna geometria parallela che possa scollarsi.
 *
 * LE QUOTE VENGONO DALLA PRATICA, non dallo schermo: un corso di teak su uno
 * yacht sta fra 50 e 70 mm e la fuga nera fra 4 e 6. In unita' di scena, dove
 * 1 = 2,5 m, sono 0,024 e 0,002.
 *
 * I corsi corrono LUNGO la barca, quindi si contano lungo x — la larghezza —
 * ed e' il verso giusto: su una coperta vera i corsi seguono il fianco.
 */
const CORSO = 0.024      // 60 mm
const FUGA = 0.0022      // 5,5 mm

function fughe (m) {
  m.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader
      .replace('#include <common>', ['#include <common>', 'varying vec3 vTeak;'].join('\n'))
      .replace('#include <begin_vertex>', ['#include <begin_vertex>', '  vTeak = transformed;'].join('\n'))
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', ['#include <common>', 'varying vec3 vTeak;'].join('\n'))
      .replace('#include <color_fragment>', `#include <color_fragment>
{
  // dove cade il pixel dentro il proprio corso, da 0 a 1
  float u = fract(vTeak.x / ${CORSO.toFixed(4)});
  float mezza = ${(FUGA / CORSO / 2).toFixed(4)};
  // la fuga sta a cavallo del confine: si guarda la distanza dal bordo
  float d = min(u, 1.0 - u);
  // la derivata tiene la fuga larga un pixel quando la coperta e' lontana:
  // senza, da lontano il motivo diventa un tremolio (aliasing) invece che
  // una superficie
  float sfuma = max(fwidth(u) * 0.9, 0.0008);
  float nera = 1.0 - smoothstep(mezza - sfuma, mezza + sfuma, d);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.045, 0.038, 0.032), nera * 0.85);

  // e il legno non e' tutto dello stesso colore: ogni corso ha il suo,
  // leggermente. E' quello che distingue una coperta da una stampa
  float corso = floor(vTeak.x / ${CORSO.toFixed(4)});
  float tinta = fract(sin(corso * 12.9898) * 43758.5453);
  diffuseColor.rgb *= 0.92 + 0.16 * tinta;
}`)
  }
  m.customProgramCacheKey = () => 'teak-fughe-1'
  m.needsUpdate = true
}
