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
 * Un pezzo tornito porta i segni dell'utensile **attorno** all'asse, non lungo:
 * le striature girano. Sull'impianto l'asse è la X — è l'asse dell'albero, del
 * riduttore, del motore. Quindi il disturbo va allungato lungo X e stretto sul
 * piano YZ, che è esattamente la ricetta `(0.06, 9, 9)` di `docs/14 §7`.
 *
 * Sbagliare verso non dà errore: dà un metallo che sembra sabbiato invece che
 * tornito, e nessuno sa dire perché non convince.
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
 * @param {number} opzioni.direzione  quanto è allungata lungo l'asse
 */
export function lavorazione (m, { scala = 9, forza = 0.10, direzione = 150 } = {}) {
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
  // stretto sul piano YZ, lunghissimo lungo X: le striature GIRANO attorno
  // all'asse, come le lascia un utensile, invece di correre lungo il pezzo
  vec3 p = vec3(vPezzo.x * ${(scala / direzione).toFixed(5)},
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
  acciaio: { scala: 11, forza: 0.11, direzione: 150 },   // albero, bulloni: tornito
  lucido:  { scala: 14, forza: 0.06, direzione: 150 },   // rettificato: più fine, meno profondo
  sezione: { scala: 13, forza: 0.09, direzione: 150 },   // il taglio: fresato
  tenuta:  { scala: 10, forza: 0.10, direzione: 120 },
  // verniciati: nessuna direzione, e una variazione piccolissima — è la
  // buccia d'arancia dello spruzzo, non una lavorazione
  carter:  { scala: 26, forza: 0.045, direzione: 1 },
  motore:  { scala: 26, forza: 0.045, direzione: 1 },
  carena:  { scala: 20, forza: 0.05, direzione: 1 }
}
