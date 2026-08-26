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
