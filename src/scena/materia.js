/**
 * LA MATERIA — variazione di rugosità, direzionale, senza texture.
 *
 * ─── IL RILIEVO
 *
 * `docs/14 §7` mette in cima alle regole di resa una frase sola: **variazione
 * di roughness prima dello sporco**, e subito sotto **lavorazione direzionale
 * su acciaio tornito**. Il generatore Blender assegna invece un valore
 * costante per materiale, e lo dichiara come debito in testa al file: la
 * variazione «non è esprimibile in glTF senza una texture, e la texture arriva
 * dalla cottura».
 *
 * Due revisioni di fila hanno indicato la stessa cosa con parole diverse: il
 * risultato «rischia l'aspetto CG pulita/procedurale», e non regge un primo
 * piano. Ed è un primo piano che il capitolo adesso fa davvero — la camera
 * arriva a 2,6 unità dal meccanismo, dove si leggono i bulloni della
 * fondazione.
 *
 * ─── PERCHÉ NON ASPETTARE LA COTTURA
 *
 * Perché la cottura è un altro pezzo di lavoro — UV, bake, KTX2 — e nel
 * frattempo il primo piano c'è già. E perché una variazione **direzionale** non
 * ha bisogno di UV: la direzione di lavorazione è una direzione dello spazio
 * oggetto, e ogni vertice ce l'ha.
 *
 * Questo non sostituisce la cottura: sostituisce il niente. Quando arrivano le
 * mappe, questo modulo esce — e il commento in `glb-impianto.py` resta il posto
 * dove il debito è scritto.
 *
 * ─── LA DIREZIONE È QUELLA DELL'ASSE, E NON È UN DETTAGLIO
 *
 * Un pezzo tornito porta i segni dell'utensile **attorno** all'asse: sono
 * solchi elicoidali che girano intorno al pezzo, ripetuti **lungo** l'asse.
 * Quindi camminando LUNGO l'asse se ne attraversano tanti — variazione rapida —
 * e girando intorno alla circonferenza si resta dentro lo stesso — variazione
 * lenta.
 *
 * ─── L'AVEVO SCRITTO GIUSTO E FATTO AL CONTRARIO
 *
 * La prima stesura moltiplicava X per 0,073 e Y/Z per 11: lento lungo l'asse,
 * rapido intorno. Cioe' striature LONGITUDINALI, che sono la firma di un pezzo
 * spazzolato o estruso, non tornito. L'ho scritto in questo stesso commento —
 * «sbagliare verso da' un metallo che sembra sabbiato» — e l'ho sbagliato lo
 * stesso, copiando una terna di numeri invece di ragionare sulla forma dei
 * solchi. L'ha vista una revisione esterna leggendo il codice contro la frase.
 *
 * Adesso e' rapido lungo X e lento sul piano YZ. Resta una modulazione della
 * sola rugosita' scalare: **non e' anisotropia vera**, che vorrebbe una BRDF
 * con una direzione. Regge la media distanza e il primo piano di questo
 * capitolo; il passo successivo e' la cottura delle mappe, non un altro
 * disturbo.
 */

/**
 * Un disturbo a valore singolo, senza texture e senza derivate: tre seni
 * incrociati. Non è rumore vero — è periodico — e su una superficie curva la
 * periodicità non si legge, perché la superficie non è mai allineata al
 * reticolo. Su un piano grande si vedrebbe, e infatti qui non ci sono piani
 * grandi: sono cilindri, flange e bulloni.
 */
const DISTURBO = `
float disturbo (vec3 p) {
  float a = sin(p.x * 1.7 + sin(p.y * 3.1) * 1.3);
  float b = sin(p.y * 2.3 + sin(p.z * 2.9) * 1.1);
  float c = sin(p.z * 2.1 + sin(p.x * 3.7) * 0.9);
  return (a + b + c) / 3.0;
}
`

/**
 * @param {THREE.Material} m
 * @param {object} opzioni
 * @param {number} opzioni.scala      quanto è fitta la lavorazione
 * @param {number} opzioni.forza      di quanto oscilla la rugosità
 * @param {number} opzioni.direzione  quanto e' piu' fitta LUNGO l'asse che
 *                                  attorno. 1 = nessuna direzione (verniciato)
 */
export function lavorazione (m, { scala = 9, forza = 0.10, direzione = 15 } = {}) {
  if (!m || !('roughness' in m)) return m

  m.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader
      .replace('#include <common>', ['#include <common>', 'varying vec3 vPezzo;'].join('\n'))
      .replace('#include <begin_vertex>', ['#include <begin_vertex>', '  vPezzo = transformed;'].join('\n'))

    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', ['#include <common>', 'varying vec3 vPezzo;', DISTURBO].join('\n'))
      /**
       * Dopo `roughnessmap_fragment`, perché è li' che la variabile nasce:
       * scriverla prima dà «undeclared identifier», ed è dove si era fermato
       * il primo tentativo sullo scafo.
       */
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
{
  // FITTO lungo X e largo sul piano YZ: i solchi girano attorno all'asse e si
  // ripetono lungo di esso, quindi e' camminando lungo l'asse che se ne
  // attraversano tanti
  vec3 p = vec3(vPezzo.x * ${(scala * direzione / 10).toFixed(3)},
                vPezzo.y * ${scala.toFixed(2)},
                vPezzo.z * ${scala.toFixed(2)});
  float d = disturbo(p);
  // una seconda scala, più larga: la lavorazione non è uniforme sul pezzo,
  // e senza questo il motivo si legge come un reticolo
  d = mix(d, disturbo(p * 0.23), 0.45);
  roughnessFactor = clamp(roughnessFactor + d * ${forza.toFixed(3)}, 0.03, 1.0);
}`)
  }
  // La chiave dipende dai parametri: due materiali con lavorazioni diverse
  // devono compilare due programmi, non condividerne uno.
  const chiave = `lavorazione-${scala}-${forza}-${direzione}`
  m.customProgramCacheKey = () => chiave
  m.needsUpdate = true
  return m
}

/**
 * Quale lavorazione per quale materiale. I nomi arrivano dal builder Blender.
 *
 * Non tutti i pezzi sono torniti: il carter è **verniciato** — la vernice non
 * ha direzione — e la gomma degli antivibranti non ha nessuna delle due cose.
 * Dare a tutti la stessa striatura sarebbe il difetto opposto a quello che si
 * sta curando: un pezzo unico invece di un assieme di pezzi diversi.
 */
export const LAVORAZIONI = {
  acciaio: { scala: 11, forza: 0.11, direzione: 15 },   // albero, bulloni: tornito
  lucido:  { scala: 14, forza: 0.06, direzione: 15 },   // rettificato: più fine, meno profondo
  sezione: { scala: 13, forza: 0.09, direzione: 15 },   // il taglio: fresato
  tenuta:  { scala: 10, forza: 0.10, direzione: 12 },
  // verniciati: nessuna direzione, e una variazione piccolissima — è la
  // buccia d'arancia dello spruzzo, non una lavorazione
  carter:  { scala: 26, forza: 0.045, direzione: 1 },
  motore:  { scala: 26, forza: 0.045, direzione: 1 },
  carena:  { scala: 20, forza: 0.05, direzione: 1 }
}
