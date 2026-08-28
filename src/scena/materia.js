import { ClampToEdgeWrapping } from 'three'
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
export function lavorazione (m, { scala = 9, forza = 0.10, direzione = 15,
  rilievo = 0, fasciame = 0, assefasciame = 'y' } = {}) {
  if (!m || !('roughness' in m)) return m

  /**
   * SI COMPONE, NON SI SOVRASCRIVE.
   *
   * Qui c'era `m.onBeforeCompile = (s) => {...}`, che funzionava finche' le
   * lavorazioni toccavano solo i materiali del meccanismo, dove nessun altro
   * scriveva. Dandola allo SCAFO diventa un difetto grosso e muto: lo scafo ha
   * gia' `nebbiaAcqua`, e assegnare qui cancellerebbe l'assorbimento
   * dell'acqua senza un errore -- si vedrebbe solo che sotto la linea lo scafo
   * non si spegne piu'.
   *
   * E' la stessa regola gia' scritta in `acqua.js`, dove e' costata mezza
   * giornata di scafo senza buccia d'arancia.
   */
  const prima = m.onBeforeCompile
  const chiavePrima = m.customProgramCacheKey
  m.onBeforeCompile = function (s, r) {
    if (prima) prima.call(this, s, r)
    s.vertexShader = s.vertexShader
      .replace('#include <common>', s.vertexShader.includes('varying vec3 vPezzo;')
        ? '#include <common>'
        : `#include <common>
varying vec3 vPezzo;`)
      .replace('#include <begin_vertex>', ['#include <begin_vertex>', '  vPezzo = transformed;'].join('\n'))

    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', s.fragmentShader.includes('varying vec3 vPezzo;')
        ? '#include <common>'
        : `#include <common>
varying vec3 vPezzo;
` + DISTURBO)
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
${fasciame > 0 ? `
  /**
   * ─── IL GIUNTO SI VEDE PERCHE' E' PIU' SCURO, non perche' e' inclinato
   *
   * Prima il fasciame perturbava solo la NORMALE. Provato e misurato: a questa
   * distanza non produce niente. Una inclinazione di 0,06 su una vernice bianca
   * quasi diffusa, sotto un cielo a due tinte, cambia l'ombreggiatura di
   * qualche percento -- cioe' sotto il rumore. Ingrandito a contrasto 14 il
   * fianco mostrava la buccia della vernice ma nessuna riga.
   *
   * Un giunto vero non si legge per la sua geometria: si legge perche' e' una
   * riga PIU' SCURA. Ci si ferma lo sporco, ci si raccoglie l'ombra, e il
   * sigillante non ha la stessa vernice sopra. E' un fatto di albedo, e un
   * albedo si vede a qualunque distanza e con qualunque cielo.
   *
   * Il passo e' in unita' di scena: 0,68 sono 1,7 metri, la fasciatura vera.
   */
  {
    float qq = fract(vPezzo.${assefasciame} / ${fasciame.toFixed(4)}) - 0.5;
    float riga = smoothstep(0.038, 0.006, abs(qq));
    diffuseColor.rgb *= 1.0 - riga * 0.22;
    roughnessFactor = clamp(roughnessFactor + riga * 0.10, 0.03, 1.0);
  }` : ''}
}`)

    /**
     * ─── LA RUGOSITA' DA SOLA NON SI VEDE, E QUESTO E' IL PUNTO
     *
     * Una variazione di rugosita' cambia COME una superficie riflette. Se non
     * c'e' niente da riflettere non cambia niente: l'ambiente di questo sito e'
     * due tinte -- carta sopra la linea, acqua sotto -- e su una vernice bianca
     * quasi diffusa il risultato e' invisibile.
     *
     * Misurato, ed e' il numero che ha aperto questo lavoro: ingrandito a
     * contrasto sette volte, il fianco della sovrastruttura e' **bianco
     * assoluto**. Zero variazione. I 42,85 di "struttura" che avevo letto
     * prima erano il bordo di un finestrino dentro il ritaglio, non la
     * superficie -- un numero che misura i contorni e non la materia.
     *
     * La normale invece cambia l'ANGOLO con cui la superficie prende la luce,
     * e quello si vede anche con un cielo povero, perche' non ha bisogno di
     * riflettere niente: basta la diffusa.
     *
     * ─── E IL FASCIAME, che e' l'unica cosa che si legge a trenta metri
     *
     * Un raccordo da dodici millimetri su uno scafo di quaranta metri guardato
     * da trenta e' sotto il pixel: la normale cotta in Blender conta da vicino
     * e alla luce radente, non qui. Quello che si vede a quella distanza sono
     * i GIUNTI DEI PANNELLI -- righe lunghe, dritte, a basso contrasto, ogni
     * paio di metri -- perche' sono grandi quanto la nave, non quanto il
     * dettaglio.
     *
     * Il passo e' in unita' di scena e va dichiarato in metri da chi chiama:
     * una fasciatura vera sta fra 1,5 e 2 m, cioe' 0,6-0,8 unita'.
     */
    if (rilievo > 0 || fasciame > 0) {
      s.fragmentShader = s.fragmentShader
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
{
  vec3 pr = vPezzo * ${(scala * 0.55).toFixed(3)};
  float e = 0.35;
  /* la pendenza del disturbo per differenze finite: tre campioni, non una
     derivata analitica, perche' il disturbo e' una somma di seni annidati e
     la sua derivata a mano sarebbe una seconda implementazione da tenere
     allineata */
  float d0 = disturbo(pr);
  vec3 grad = vec3(disturbo(pr + vec3(e, 0.0, 0.0)) - d0,
                   disturbo(pr + vec3(0.0, e, 0.0)) - d0,
                   disturbo(pr + vec3(0.0, 0.0, e)) - d0);

  normal = normalize(normal - grad * ${rilievo.toFixed(4)});
}`)
    }
  }
  // La chiave dipende dai parametri: due materiali con lavorazioni diverse
  // devono compilare due programmi, non condividerne uno.
  const chiave = `lavorazione-${scala}-${forza}-${direzione}-${rilievo}-${fasciame}-${assefasciame}`
  /* anche la chiave si compone: due patch diverse sullo stesso materiale devono
     dare due programmi diversi, e scartare la chiave di chi c'era prima
     rimetterebbe insieme cose che non lo sono */
  m.customProgramCacheKey = function () {
    return chiave + '|' + (chiavePrima ? chiavePrima.call(this) : '')
  }
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
  carena:  { scala: 20, forza: 0.05, direzione: 1 },

  /**
   * ─── LE RICETTE DELLA NAVE, che prima non esistevano
   *
   * `carena` era definita qui e non veniva applicata da nessuno: le
   * lavorazioni erano collegate solo ai materiali del meccanismo. La nave --
   * cioe' la cosa piu' grande dell'inquadratura -- non aveva nessun
   * trattamento di superficie.
   *
   * `fasciame` e' in unita' di scena: 0,68 sono 1,7 metri, il passo di una
   * fasciatura vera. Sullo SCAFO i corsi corrono lungo la nave e si ripetono
   * in ALTEZZA, quindi l'asse e' y; sulla sovrastruttura i pannelli sono
   * verticali e si ripetono in LUNGHEZZA, quindi z.
   */
  scafo:          { scala: 16, forza: 0.05, direzione: 1, rilievo: 0.10, fasciame: 0.68, assefasciame: 'y' },
  sovra_guscio:   { scala: 22, forza: 0.04, direzione: 1, rilievo: 0.07, fasciame: 0.80, assefasciame: 'z' },
  sovra_montante: { scala: 22, forza: 0.04, direzione: 1, rilievo: 0.06 },
  /* la coperta in teak: i corsi ci sono gia' come geometria, qui serve solo
     che il legno non sia una lastra uniforme */
  coperta:        { scala: 30, forza: 0.06, direzione: 3, rilievo: 0.04 }
}

/**
 * COME SI CAMPIONANO LE MAPPE COTTE, e due cose erano sbagliate.
 *
 * Sta qui e non nei due caricatori perche' l'atlante cotto e' lo stesso
 * problema per il meccanismo e per la sovrastruttura, e in questo repo la
 * stessa correzione copiata due volte diverge il giorno in cui si tocca una
 * delle due copie. E' la regola per cui esiste `browser.mjs`.
 *
 * 1 · L'ATLANTE NON SI RIPETE. `GLTFLoader` porta `wrapS/wrapT` da quello che
 *     dice il file, e il file dice RIPETI perche' l'esportatore mette quello
 *     di serie. Ma un atlante cotto NON e' una texture piastrellabile: ogni
 *     isola e' un pezzo diverso, e una UV che esce di un texel dal proprio
 *     bordo non deve pescare dal LATO OPPOSTO dell'atlante -- dove, in questo
 *     file, c'e' la fascia fittissima delle bullonerie. Misurata: scarto tipo
 *     91-105 su 255, con minimi a 0 e massimi a 255. Ripetere qui non e' un
 *     dettaglio di filtro, e' pescare i texel di un altro pezzo.
 *
 *     E c'e' un moltiplicatore: `gltfpack` quantizza le UV e compensa con una
 *     trasformazione della texture, quindi questi materiali arrivano con
 *     `repeat` fra 8 e 16. Il prodotto e' corretto, ma il margine per uscire
 *     dal proprio riquadro e' sedici volte piu' stretto.
 *
 * 2 · L'ANISOTROPIA ERA A UNO, e la macchina ne offre sedici. Su una superficie
 *     guardata quasi di taglio -- e la pinna, dalla camera del primo piano,
 *     lo e' -- il filtro isotropo sceglie il livello di mipmap sulla derivata
 *     PIU' GRANDE: o sfoca lungo la corda, o campiona sotto e alias. E'
 *     esattamente il caso in cui l'anisotropia esiste.
 *
 * ─── E VA DETTO COSA NON SO
 *
 * Queste due sono giuste di per se': un atlante non si piastrella, e una
 * superficie di taglio vuole l'anisotropia. NON ho la prova che curino la
 * grana della pinna. Ho provato a misurarla e il metro non regge: lo stesso
 * identico programma ha dato 8,50 e 1,96 in due corse a venti minuti di
 * distanza, perche' la scena e' viva -- la nave rolla, la pinna oscilla, e la
 * finestra di pixel su cui misuravo non inquadra sempre la stessa cosa. Un
 * numero che cambia di quattro volte a parita' di codice non e' una misura, e
 * ogni conclusione tirata da quella tabella andava buttata: ne avevo gia'
 * tirate due.
 *
 * Quindi qui si spedisce la correzione che si difende da sola, e la grana
 * resta aperta finche' non c'e' un metro che si possa rifare.
 */
export function campionamento (mat) {
  for (const chiave of ['map', 'aoMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap']) {
    const t = mat[chiave]
    if (!t) continue
    t.wrapS = t.wrapT = ClampToEdgeWrapping
    /* three lo taglia gia' al massimo della macchina: sedici e' un tetto, non
       una richiesta che possa fallire */
    t.anisotropy = 16
    t.needsUpdate = true
  }
}
