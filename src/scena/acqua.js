import {
  Mesh, PlaneGeometry, BoxGeometry, MeshStandardMaterial, MeshBasicMaterial,
  DoubleSide, Group, Color, Vector3
} from 'three'

const LARG = 46
const PROF = 46

/**
 * Il mare copre tutta la nave: 46 unita' di lato per uno scafo che ne misura
 * 16, cosi' l'orizzonte non finisce mai dentro l'inquadratura.
 *
 * (Prima era mezzo piano, spostato dietro la nave, perche' lo scafo era lungo
 * tre unita' e davanti veniva sezionato. Con il loft non e' piu' vero: il
 * commento diceva una cosa che il codice non faceva piu'.)
 */

/**
 * ═══ IL DETTAGLIO A CORTO RAGGIO — perche' esiste questo blocco
 *
 * `docs/15 §0-bis` e' stato abbandonato con un numero preciso: dentro il vano
 * del finestrone, il mare girato dava **3,07 livelli/pixel di dettaglio e
 * 18,1% di superficie piatta**, l'acqua 3D della scena **1,96 e 67,4%**. Due
 * terzi di finestrone morto.
 *
 * La causa NON era l'idea. Era l'ANGOLO. Da dentro il salone si guarda l'acqua
 * radente, da 3,6 m di quota: a quell'angolo un piano con 76x76 vertici e
 * un'onda alta 0,26 unita' non ha piu' niente da mostrare — fisicamente
 * giusto, visivamente niente.
 *
 * ─── PERCHE' NON BASTA UNA MAPPA DI NORMALI
 *
 * Perche' il difetto e' proprio la distanza radente. Una normalMap con i suoi
 * mipmap, vista di scorcio, viene mediata via: il filtro trilineare sceglie il
 * livello sul lato LUNGO dell'impronta del pixel, e a 80 gradi dall'incidenza
 * quel lato e' venti volte l'altro. Rimane una tinta. E' esattamente il 67,4%.
 *
 * ─── COSA SI FA INVECE, e sono tre cose distinte
 *
 *  1. **il campo d'onda si valuta per pixel**, con le derivate analitiche, e
 *     ogni ottava si spegne in base all'impronta del pixel invece che alla
 *     distanza. Cosi' il dettaglio non sfarfalla (sotto i due pixel l'ottava
 *     non c'e' proprio) e non si spegne prima del necessario;
 *  2. **l'impronta si misura ANISOTROPA.** `fwidth()` somma i due lati e
 *     butta via la parte buona: di scorcio l'impronta e' una scheggia lunga e
 *     sottile, e il dettaglio trasversale alla scheggia si vede ancora. E' lo
 *     stesso principio del filtraggio anisotropo, e senza questa riga il resto
 *     non serve a niente. Il rapporto e' limitato a `ANISO`, che e' il
 *     compromesso fra dettaglio e sfarfallio;
 *  3. **le ottave perdute non spariscono: diventano ruvidita'.** Quello che
 *     l'impronta si mangia e' varianza di normale, e la varianza di normale
 *     e' ruvidita' (Toksvig). Senza, la speculare resta stretta su una
 *     superficie che non ha piu' il micro-rilievo che la giustifica, e si
 *     accendono i puntini.
 *
 * ─── E IL GLITTER, che e' una cosa diversa dal dettaglio
 *
 * Da radente il mare non e' una tinta con sopra del rilievo: e' un tappeto di
 * scintille. Una scintilla e' un pezzo di superficie grande meno di un pixel
 * orientato per caso verso il sole — cioe' esattamente cio' che nessun mipmap
 * puo' rappresentare, perche' mediare significa spegnerla.
 *
 * Quindi le scintille NON stanno nel campo d'onda: hanno una griglia loro, il
 * cui lato in unita' di mondo e' legato all'impronta del pixel. La densita' a
 * schermo resta costante a qualunque distanza, e questo risolve i due guasti
 * insieme: non spariscono lontano (la cella cresce con l'impronta) e non
 * sfarfallano (la cella non scende mai sotto il pixel).
 *
 * ─── COSA NON CAMBIA
 *
 * `costruisciAcqua()` senza argomenti, `anima(t, mare, frame, camX, camZ)` e
 * `chiarisci(q)` sono identici a prima per chi li chiama. `dettaglio: false`
 * ridarebbe il materiale di prima, byte per byte: serve al banco di misura in
 * `riferimenti/acqua/`, che confronta il prima e il dopo nella stessa corsa.
 *
 * `envMapIntensity: 0` resta e resta vera la nota qui sotto: l'acqua non
 * riflette l'ambiente. Le scintille vengono dal sole, non dal cielo, e il sole
 * e' la stessa direzione che `index.js` da' alla `DirectionalLight` — se
 * cambia li', va cambiata l'opzione `sole` qui.
 */

/** Quanto puo' essere sbilanciata l'impronta prima di rinunciare al dettaglio
 *  trasversale. 12 e' la stessa scala dei filtri anisotropi delle schede; piu'
 *  in alto il mare radente comincia a formicolare. */
const ANISO = 12.0

/** La direzione del sole di `index.js`. Non e' un gusto: se la meta' vettore
 *  fra sole e sguardo non e' quella vera, le scintille si accendono dove le
 *  ombre dicono che non c'e' sole. */
const SOLE = [4.5, 7, 6]

const PREAMBOLO = /* glsl */`
uniform float uTempo;
uniform float uMare;
uniform vec3  uSole;
uniform float uRipido;
uniform float uScint;
uniform float uCielo;
uniform vec3  uColSchiuma;
uniform vec3  uColScint;
uniform vec3  uColCielo;
uniform vec3  uColMare;
varying vec3 vMondo;

/* Niente sin() qui dentro: la precisione di fract(sin(x)*k) crolla quando x
   cresce, e le coordinate crescono col tempo. Questo regge. */
float acqCaso (vec2 i) {
  vec3 p3 = fract(vec3(i.x, i.y, i.x) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

/* Valore E derivate analitiche in un colpo: la normale non si ricava
   campionando tre volte, che a questa frequenza costerebbe il triplo. */
vec3 acqCella (vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  vec2 du = 6.0 * f * (1.0 - f);
  float a = acqCaso(i);
  float b = acqCaso(i + vec2(1.0, 0.0));
  float c = acqCaso(i + vec2(0.0, 1.0));
  float d = acqCaso(i + vec2(1.0, 1.0));
  float k1 = b - a, k2 = c - a, k3 = a - b - c + d;
  return vec3(a + k1 * u.x + k2 * u.y + k3 * u.x * u.y,
              (k1 + k3 * u.y) * du.x,
              (k2 + k3 * u.x) * du.y);
}

/* L'IMPRONTA DEL PIXEL SUL MARE, in unita' di mondo, misurata anisotropa.
   length(fwidth(p)) darebbe il lato lungo della scheggia e cancellerebbe il
   dettaglio radente, che e' il difetto da cui nasce tutto questo file. */
float acqPasso (vec2 p) {
  float lx = length(dFdx(p));
  float ly = length(dFdy(p));
  float corto = max(min(lx, ly), 1e-5);
  float lungo = max(lx, ly);
  return min(lungo, corto * ${ANISO.toFixed(1)});
}

/* Ritorna: xy = pendenza, z = quota, w = pendenza PERDUTA (quella che
   l'impronta si e' mangiata, e che va restituita come ruvidita'). */
vec4 acqCampo (vec2 p, float fp) {
  vec2 pend = vec2(0.0);
  float h = 0.0, persa = 0.0, amp = 1.0, fr = 0.62;
  vec2 dir = vec2(0.87, 0.49);
  for (int i = 0; i < 6; i++) {
    /* l'ottava vive finche' la sua lunghezza d'onda copre piu' di due
       impronte: sotto, non si vedrebbe — si alieserebbe */
    float vis = smoothstep(2.0 * fp, 4.5 * fp, 1.0 / fr);
    if (vis > 0.003) {
      /* LE ONDE CORTE VANNO PIANO, e non e' un vezzo: e' la relazione di
         dispersione dell'acqua profonda, c = sqrt(g/k). La prima stesura dava
         alle ottave una velocita' CRESCENTE, e l'ottava di testa finiva a 37
         cicli al secondo — cioe' si rimescolava tutta fra un fotogramma e
         l'altro. Misurato: 2,57 di sfarfallio contro 1,35 di un mare vero.
         Formicolava, e formicolava per la ragione piu' banale possibile. */
      float vel = 0.55 * sqrt(0.62 / fr);
      vec2 q = p * fr + dir * mod(uTempo * vel, 512.0);
      vec3 n = acqCella(q);
      pend += vis * amp * fr * n.yz;
      h += vis * amp * (n.x - 0.5);
    }
    persa += (1.0 - vis) * amp * fr;
    amp *= 0.60; fr *= 2.17;
    /* le direzioni ruotano: ottave che scorrono tutte nello stesso verso
       danno righe di moquette, non mare */
    dir = vec2(dir.y, -dir.x);
  }
  return vec4(pend, h, persa);
}
`

/** Il campo, la schiuma. Va dopo `map_fragment`: da li' in giu' le variabili
 *  restano visibili a tutti gli innesti successivi. */
const INNESTO_CAMPO = /* glsl */`
  vec2  acqP   = vMondo.xz;
  float acqFp  = acqPasso(acqP);
  float acqDist = length(vMondo - cameraPosition);

  /**
   * ─── IL VARCO — la riga che tiene in piedi la giunzione a zero pixel
   *
   * Misurato: senza questa riga, la vista DA FUORI passava da 0,47 a 14,32
   * livelli di dettaglio e la tinta sotto la linea si spostava di 27,5
   * livelli. Cioe' il pass curava il salone e rompeva l'unica idea meccanica
   * del sito.
   *
   * La causa e' geometrica e vale la pena scriverla. La camera del sito sta a
   * QUOTA ZERO: da li' il mare non e' una superficie, e' una riga — ogni
   * pixel guarda l'acqua a meno di un grado d'incidenza. Il micro-rilievo li'
   * non ha niente da mostrare, e tutto quello che aggiunge finisce a un pelo
   * dalla giunzione col fondo CSS.
   *
   * Quindi il pass si apre con l'ALZO DELL'OCCHIO SUL PELO, non con la
   * distanza: 'quota / distanza' e' il seno dell'incidenza del piano medio.
   * Sotto 0,030 (1,7 gradi) non si aggiunge niente; sopra 0,090 (5,2 gradi)
   * si aggiunge tutto. Dal finestrone, a 3,6 m e fra 12 e 30 unita', il seno
   * sta fra 0,12 e 0,29: il varco e' spalancato. Da fuori, a quota zero, e'
   * chiuso.
   *
   * Si usa il piano MEDIO e non la normale vera apposta: la normale vera
   * contiene gia' il rilievo che si sta decidendo se accendere — sarebbe un
   * cane che si morde la coda, e per giunta ballerino.
   */
  float acqSeno = abs(cameraPosition.y - vMondo.y) / max(acqDist, 1e-3);
  /**
   * E LA SECONDA META' DEL VARCO: L'ALZO DELL'OCCHIO SUL PELO.
   *
   * L'incidenza da sola non bastava, ed e' stato misurato guardando: dalla
   * posa di FUORI il basso del fotogramma diventava una distesa argentata,
   * perche' a quota zero l'acqua a due unita' dall'obiettivo ha un'incidenza
   * alta pur essendo, a schermo, il mare che il sito vuole piatto. Il
   * dettaglio saliva da 0,29 a 8,91 in una vista che gia' funzionava.
   *
   * Il criterio giusto e' piu' semplice e non ha casi limite: questo pass
   * serve a chi guarda il mare DA UNA QUOTA. A pelo d'acqua — che e'
   * l'invariante di tutto il sito, la camera a zero — non si accende niente e
   * l'inquadratura resta identica a com'era. Dal salone, a 3,6 m, e'
   * spalancato. E fra i due si apre da solo: la camera del sito attraversa
   * quelle quote, e non c'e' nessuna riga altrove che debba saperlo.
   */
  float acqAlzo = smoothstep(0.35, 1.60, cameraPosition.y);
  float acqTaglio = smoothstep(0.030, 0.090, acqSeno) * acqAlzo;

  /**
   * QUANDO IL VARCO E' CHIUSO NON SI CALCOLA NIENTE, e non e' micro-ottimismo:
   * a quota zero il varco e' chiuso su TUTTO il fotogramma, quindi il ramo e'
   * coerente su tutta l'onda di calcolo e il salto si paga davvero. Misurato:
   * senza questo salto la vista da fuori — che non cambia di un pixel — costava
   * comunque 1,28 volte quella di prima. Un pass che non si vede non deve
   * nemmeno farsi sentire.
   */
  vec4  acqC = vec4(0.0);
  float acqRip = 0.0;
  vec2  acqPend = vec2(0.0);
  float acqSchiuma = 0.0;
  if (acqTaglio > 0.002) {
    acqC = acqCampo(acqP, acqFp);
    /* la ripidita' e' la manopola del mare: a mare 0 il mare e' vetro, e deve
       restare vetro, o lo stato del mare smette di leggersi */
    acqRip = uRipido * (0.20 + 0.11 * uMare) * acqTaglio;
    acqPend = acqC.xy * acqRip;
    /* La schiuma DA' LA SCALA, e la scala si legge solo vicino. Lontano
       diventerebbe una velatura chiara sulla riga d'orizzonte, cioe' proprio
       sulla giunzione a zero pixel col fondo CSS: li' non deve arrivare. */
    float acqVicino = 1.0 - smoothstep(26.0, 44.0, acqDist);
    float acqCreste = smoothstep(0.30, 1.05, length(acqPend) + acqC.z * 0.55);
    float acqGrana  = acqCella(acqP * 2.6 + vec2(mod(uTempo * 0.11, 512.0))).x;
    acqSchiuma = acqCreste * smoothstep(0.26, 0.74, acqGrana)
               * smoothstep(1.2, 4.0, uMare) * acqVicino * acqTaglio;
    diffuseColor.rgb = mix(diffuseColor.rgb, uColSchiuma, acqSchiuma * 0.90);
  }
`

/** La ruvidita' restituita. Va dopo `roughnessmap_fragment`, che e' dove
 *  `roughnessFactor` nasce. */
const INNESTO_RUVIDO = /* glsl */`
  roughnessFactor = clamp(roughnessFactor + acqC.w * acqRip * 0.42
                          + acqSchiuma * 0.50, 0.04, 1.0);
`

/** La normale perturbata. Va dopo `normal_fragment_maps`.
 *  Si lavora in MONDO e si torna in vista: il piano e' orizzontale e
 *  immobile, quindi la pendenza e' gia' espressa nel sistema giusto e non
 *  serve nessuna tangente. */
const INNESTO_NORMALE = /* glsl */`
  vec3 acqNGeo = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
  vec3 acqNMondo = normalize(acqNGeo + vec3(-acqPend.x, 0.0, -acqPend.y));
  normal = normalize((viewMatrix * vec4(acqNMondo, 0.0)).xyz);
`

/** Le scintille. Vanno dopo `emissivemap_fragment`, dove
 *  `totalEmissiveRadiance` esiste gia'. */
const INNESTO_SCINTILLE = /* glsl */`
  if (acqTaglio > 0.002) {
  /* IL LATO DELLA CELLA E' LEGATO ALL'IMPRONTA: la densita' a schermo resta
     costante a ogni distanza. E' l'unica forma di glitter che non sparisce
     lontano e non formicola vicino. */
  float acqLato = max(acqFp * 4.5, 1e-4);
  vec2  acqG  = acqP / acqLato;
  vec2  acqCi = floor(acqG);
  float acqR1 = acqCaso(acqCi + 3.70);
  float acqR2 = acqCaso(acqCi + 11.3);
  float acqR3 = acqCaso(acqCi + 27.1);
  /* dentro la cella la scintilla e' un punto, non un quadrato */
  vec2  acqF = fract(acqG) - vec2(0.25 + 0.5 * acqR1, 0.25 + 0.5 * acqR2);
  float acqPunto = smoothstep(0.30, 0.02, length(acqF));
  vec3  acqV = normalize((vec4(normalize(vViewPosition), 0.0) * viewMatrix).xyz);
  vec3  acqH = normalize(uSole + acqV);
  /* la faccetta e' inclinata a caso attorno alla normale vera: si accende
     quella che per caso punta il sole, che e' come funziona un mare */
  vec3  acqNs = normalize(acqNMondo + vec3(acqR1 - 0.5, 0.0, acqR2 - 0.5) * 0.55);
  float acqSp = pow(max(dot(acqNs, acqH), 0.0), 260.0) * acqPunto;
  /* e si accende e si spegne: una scintilla che resta accesa e' una lampadina */
  acqSp *= 0.35 + 0.65 * (0.5 + 0.5 * sin(mod(uTempo, 512.0) * (1.6 + 2.8 * acqR3) + acqR1 * 25.0));
  totalEmissiveRadiance += uColScint * (acqSp * uScint * (0.35 + 0.13 * uMare) * acqTaglio);

  /**
   * ─── IL CIELO RIFLESSO, e perche' senza non c'era niente da vedere di
   *     spalle al sole
   *
   * Misurato: con le sole scintille, la posa radente CONTRO sole dava 4,66 di
   * dettaglio e quella DI SPALLE 3,60. Girato il viso dall'altra parte, il
   * mare tornava una tinta — e per una ragione precisa: quest'acqua ha
   * 'envMapIntensity: 0', quindi una normale perturbata non ha proprio niente
   * da riflettere fuori dal lobo del sole. Perturbare per perturbare non
   * produce immagine.
   *
   * Un mare vero, di scorcio, e' soprattutto uno SPECCHIO DEL CIELO, e lo e'
   * tanto piu' quanto piu' lo si guarda radente: e' Fresnel. Quindi qui non si
   * accende l'ambiente — resta vera per intero la nota di 'materiali.js', e il
   * pelo dell'acqua non prende nessuna envMap. Si CALCOLA il colore del cielo
   * dalla direzione riflessa, con gli stessi due colori del foglio di stile,
   * che e' esattamente il principio di 'ambiente.js': costa zero byte e non
   * introduce un azzurro che nel sito non esiste.
   *
   * E' anche la parte che porta piu' dettaglio, perche' Fresnel a 80 gradi e'
   * ripidissimo: due pixel con normali appena diverse riflettono uno il cielo
   * e l'altro l'acqua. E' quello che rende un mare un'immagine invece di una
   * campitura.
   */
  float acqCos = clamp(dot(acqNMondo, acqV), 0.0, 1.0);
  float acqFres = 0.02 + 0.98 * pow(1.0 - acqCos, 5.0);
  /* la direzione riflessa dice se si sta guardando la carta o l'acqua: sopra
     l'orizzonte c'e' la meta' chiara della pagina, sotto la meta' scura */
  vec3 acqRif = reflect(-acqV, acqNMondo);
  vec3 acqCielo = mix(uColMare, uColCielo, smoothstep(-0.06, 0.16, acqRif.y));
  totalEmissiveRadiance += acqCielo * (acqFres * uCielo * acqTaglio);
  }
`

/**
 * @param {object} opzioni
 * @param {boolean} opzioni.dettaglio  il pass a corto raggio. `false` ridarebbe
 *   esattamente il materiale di prima: serve al banco di misura.
 * @param {number}  opzioni.ripidita   quanto e' mosso il micro-rilievo.
 * @param {number}  opzioni.scintille  quanto brillano le faccette al sole.
 * @param {number}  opzioni.cielo      quanto pesa il cielo riflesso (Fresnel).
 * @param {boolean} opzioni.coperchio  rimette la faccia superiore della scatola
 *   sommersa, com'era prima di questo pass. Serve SOLO al banco, per misurare
 *   che toglierla non abbia spostato niente nella vista da fuori: e' l'unica
 *   modifica di questo lavoro che il confronto prima/dopo non coprirebbe,
 *   perche' vale per tutti e due i rami.
 * @param {number[]} opzioni.sole      la direzione del sole della scena.
 */
export function costruisciAcqua (opzioni = {}) {
  const {
    dettaglio = true,
    ripidita = 1.0,
    scintille = 1.0,
    cielo = 0.30,
    coperchio = false,
    sole = SOLE
  } = opzioni

  const gruppo = new Group()

  const superficie = new PlaneGeometry(LARG, PROF, 76, 76)
  superficie.rotateX(-Math.PI / 2)

/**
 * ─── L'ACQUA NON PRENDE L'AMBIENTE, e non e' un dettaglio di resa.
 *
 * Collegando `scene.environment` alla scena della nave, il pelo dell'acqua —
 * che e' un materiale metallico a 0,32 — ha cominciato a riflettere il cielo
 * chiaro dell'ambiente, e la meta' sotto la linea e' diventata **grigio
 * pallido** invece del verde scuro del foglio di stile. Il fondo CSS si ferma
 * netto al 50% e incontra il canvas: se il canvas cambia colore li', la
 * giunzione si vede, e la giunzione a zero pixel e' l'unica idea meccanica del
 * sito.
 *
 * Quindi l'ambiente vale per i metalli della nave — che senza non hanno niente
 * da riflettere ed escono plastica — e **non** per l'acqua, che non e' una
 * superficie da rendere: e' il fondo della pagina, prolungato dentro il canvas.
 */
  const materialePelo = new MeshStandardMaterial({
    color: 0x14454a, metalness: 0.32, roughness: 0.14,
    transparent: true, opacity: 0.88, side: DoubleSide,
    envMapIntensity: 0
  })

  /**
   * Le uniformi vivono qui e non dentro `onBeforeCompile`: `anima` le aggiorna
   * a ogni fotogramma, e in Node — dove `collaudo-mare.mjs` importa questo
   * file senza nessun WebGL — `onBeforeCompile` non viene mai chiamato. Se lo
   * stato stesse dentro la chiusura dello shader, il collaudo esploderebbe.
   */
  const uni = {
    uTempo: { value: 0 },
    uMare: { value: 4 },
    uSole: { value: new Vector3(sole[0], sole[1], sole[2]).normalize() },
    uRipido: { value: ripidita },
    uScint: { value: scintille },
    uCielo: { value: cielo },
    /* la schiuma non e' bianca: bianco puro dentro una tavolozza di carta e
       acqua verde e' una macchia estranea, e si vede subito */
    uColSchiuma: { value: new Color(0xc7d4ce) },
    uColScint: { value: new Color(0xfff6e4) },
    /* --aria e --acqua-viva del foglio di stile, cioe' i due colori che il
       sito ha gia': il mare riflette la pagina, non un cielo estraneo */
    uColCielo: { value: new Color(0xe9e5dd) },
    uColMare: { value: new Color(0x0f3438) }
  }

  if (dettaglio) {
    materialePelo.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uni)
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vMondo;')
        .replace('#include <begin_vertex>',
          '#include <begin_vertex>\n  vMondo = (modelMatrix * vec4(transformed, 1.0)).xyz;')
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\n' + PREAMBOLO)
        .replace('#include <map_fragment>', '#include <map_fragment>\n' + INNESTO_CAMPO)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n' + INNESTO_RUVIDO)
        .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n' + INNESTO_NORMALE)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' + INNESTO_SCINTILLE)
    }
  }

  const pelo = new Mesh(superficie, materialePelo)
  gruppo.add(pelo)

/**
 * ─── QUANTO E' FONDA L'ACQUA, e perche' durante la sezione si fa da parte
 *
 * Il volume sommerso e' una scatola scura sopra tutto cio' che sta sotto la
 * linea. Al 72% di opacita' l'acqua **si mangiava il soggetto**: nella battuta
 * del meccanismo si vedeva una macchia scura dentro una macchia scura, mentre
 * la didascalia diceva «the part you never see... it decides whether anyone is
 * comfortable on board». Il capitolo nascondeva davvero la cosa che dichiarava
 * di mostrare, ed e' il difetto peggiore che possa avere: non un errore di
 * resa, una contraddizione fra quello che dice e quello che fa vedere.
 *
 * Isolato in un colpo con la diagnostica senzaAcqua: senza, si leggono
 * attuatore, soffietti, flangia, albero e pinna; con, spariscono.
 *
 * Quindi durante la sezione l'acqua si schiarisce. Non e' un espediente: e' la
 * stessa regola che ferma il rollio quando il piano entra — un disegno tecnico
 * e' fermo — applicata al mezzo invece che al moto. Dentro il taglio si e' in
 * registro tecnico, e li' l'acqua e' una quota, non un oceano.
 *
 * Resta acqua: colore, pelo e riflessi non cambiano. Cambia solo quanto pesa.
 */
const FONDA = 0.72      // a nave intera: il sotto e' un altro mondo
/* Dentro il taglio l'acqua e' una QUOTA, non un ambiente: piu' si entra, meno
   deve pesare. A 0,25 il meccanismo restava sotto una patina verde e i suoi
   materiali — che ora hanno un ambiente vero da riflettere — non arrivavano.
   Misurato guardando il provino a 2,3 unita': il motore leggeva come una
   sagoma, non come un pezzo. */
const CHIARA = 0.12     // dentro il taglio: l'acqua e' una quota

  const materialeVolume = new MeshBasicMaterial({
    color: 0x061518, transparent: true, opacity: FONDA, depthWrite: false
  })
  /**
   * ─── LA SCATOLA NON HA COPERCHIO, e per mesi non si e' visto perche'
   *     nessuno guardava il mare dall'alto.
   *
   * La faccia superiore stava a quota zero esatta, cioe' NELLO STESSO PIANO
   * attorno a cui oscilla il pelo dell'acqua. Da quota zero e' invisibile —
   * si vede di taglio. Da 3,6 m diventa la cosa piu' evidente
   * dell'inquadratura: dove l'onda scende sotto lo zero il coperchio le passa
   * davanti, e il mare si spezza in chiazze scure dai bordi dritti. Nello
   * scatto di collaudo sembravano lastre di ghiaccio.
   *
   * Non e' un difetto di trasparenza da ordinare meglio: quella faccia non
   * deve esistere. La scatola serve a dare fondo a cio' che sta SOTTO la
   * linea, e il suo coperchio e' un doppione del pelo dell'acqua.
   */
  const suGiu = coperchio ? materialeVolume : new MeshBasicMaterial({ visible: false })
  const volume = new Mesh(new BoxGeometry(LARG, 13, PROF), [
    materialeVolume, materialeVolume,   // +X, -X
    suGiu, materialeVolume,             // +Y (via, salvo al banco), -Y
    materialeVolume, materialeVolume    // +Z, -Z
  ])
  volume.position.set(0, -6.5, 0)
  gruppo.add(volume)

  // il filo del taglio, alla quota zero esatta
  const taglio = new Mesh(
    new BoxGeometry(LARG, 0.02, 0.02),
    new MeshBasicMaterial({ color: 0xe9e5dd })
  )
  gruppo.add(taglio)

  const posBase = superficie.attributes.position.array.slice()

  /**
   * ─── IL MARE SOMMERGEVA L'OBIETTIVO, E LO FACEVA DA SEMPRE.
   *
   * La camera sta a quota zero — e' l'invariante da cui discende tutto il
   * sito — e questa superficie oscilla ATTORNO a zero. Le creste le passavano
   * sopra: `mare * 0.052` per coefficienti che sommano 1,14 fa **+0,30** a
   * mare 5, e la camera finiva sott'acqua.
   *
   * Effetto a schermo: la meta' chiara diventava (28,29,29) invece di
   * (233,229,221). Il cielo si spegneva, la giunzione al 50% spariva, e con
   * essa l'unica idea meccanica del sito.
   *
   * COME MI E' SFUGGITO. Va e viene col periodo dell'onda — da fermo, venti
   * campioni a un secondo: `##...###..##..##...#`. Uno scatto solo lo prende
   * mezza volta su due, e io leggevo i fotogrammi neri come "quella battuta e'
   * scura". Due revisori esterni non l'hanno visto per lo stesso motivo.
   *
   * LA CURA, e perche' non tocca l'invariante. Non si alza la camera e non si
   * abbassa il mare: si SPEGNE L'ONDA attorno all'obiettivo. Quella zona si
   * vede di striscio, a quota zero guardando in orizzontale, e non occupa
   * quasi pixel — misurato che sparisca, non supposto. La camera resta a zero,
   * la linea resta a meta' schermo, il fondo CSS resta attaccato.
   *
   * E la quota va sotto zero, non a zero: una superficie ESATTAMENTE
   * all'altezza dell'obiettivo e' una monetina lanciata a ogni fotogramma.
   *
   * ─── E PERCHE' LA ZONA CALMA NON E' PIU' UN BUCO DI DETTAGLIO
   *
   * Questa e' geometria: appiattisce i VERTICI attorno all'obiettivo, che e'
   * cio' che serve a non affogare la lente. Il micro-rilievo pero' sta nel
   * frammento, non nei vertici, e quindi **dentro la zona calma continua a
   * esserci**. E' la ragione per cui si poteva curare il vano del finestrone
   * senza toccare l'invariante della quota zero: le due cose non si parlano.
   */
  const CALMA = 5.5        // raggio in cui l'onda si spegne, attorno alla camera
  const AFFONDO = 0.10     // e quanto la superficie sta sotto l'obiettivo

  /** Onde: tre seni sfasati. Le normali si ricalcolano a fotogrammi alterni. */
  function anima (t, mare, frame, camX = 0, camZ = 0) {
    uni.uTempo.value = t
    uni.uMare.value = mare
    const pos = superficie.attributes.position.array
    const onda = mare * 0.052
    for (let k = 0; k < pos.length; k += 3) {
      const x = posBase[k]
      const z = posBase[k + 2]
      const alta = onda * (
        Math.sin(x * 0.42 + t * 1.15) * 0.6 +
        Math.sin(z * 0.63 - t * 0.86) * 0.3 +
        Math.sin((x + z) * 0.29 + t * 1.6) * 0.24
      )
      // quanto siamo lontani dall'obiettivo, in pianta
      const dx = x - camX, dz = z - camZ
      const d = Math.sqrt(dx * dx + dz * dz)
      if (d >= CALMA) { pos[k + 1] = alta; continue }
      const q = d / CALMA
      const dolce = q * q * (3 - 2 * q)          // parte e arriva senza spigolo
      pos[k + 1] = alta * dolce - AFFONDO * (1 - dolce)
    }
    superficie.attributes.position.needsUpdate = true
    if (frame % 2 === 0) superficie.computeVertexNormals()
  }

  /** Il taglio schiarisce l'acqua: q va da 0 (nave intera) a 1 (sezione). */
  function chiarisci (q) {
    materialeVolume.opacity = FONDA + (CHIARA - FONDA) * Math.max(0, Math.min(1, q))
  }

  return { gruppo, anima, chiarisci }
}
