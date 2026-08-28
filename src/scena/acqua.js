import {
  Mesh, PlaneGeometry, BoxGeometry, MeshStandardMaterial, MeshBasicMaterial, BackSide, Vector2,
  DoubleSide, Group, Color, Vector3, Vector4, Matrix4, Box3
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
/* La sagoma della nave dentro il riflesso. Le uniformi non basta metterle in
   shader.uniforms: vanno DICHIARATE qui, o il programma non compila e il mare
   SPARISCE -- che e' esattamente come si e' manifestato il difetto, e senza
   leggere la console sembrava un problema di acqua e non di shader.
   (E niente apici inversi in questi commenti: siamo dentro un template
   literal, e un apice inverso lo chiude. Costata una compilazione.) */
uniform mat4  uNaveInv;
uniform vec3  uNaveSemi;
uniform vec3  uNaveCol;
uniform vec3  uNaveSopra;
uniform float uNaveForza;
uniform float uNaveVel;
uniform float uNaveOmbra;
uniform vec2  uNaveOmbraRampa;
uniform float uSpaccato;
/* I VARCHI: dove il pelo si apre. Ognuno e' centro (xyz) e raggio (w) in
   coordinate del mondo. Sono i meccanismi, non la nave: aprire su tutta la
   pianta dello scafo schiariva mezzo fotogramma e rendeva illeggibile la
   didascalia -- il rimedio diventava un difetto piu' grande. */
uniform vec4 uVarchi[2];
uniform float uQuantiVarchi;
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
  /* --- IL VARCO NEL PELO, SOPRA LA NAVE
     Misurato con la maschera del soggetto: un materiale che emette BIANCO
     PURO legge 68 su 255 nei pixel del meccanismo, e 212 abbassando
     l'opacita' del pelo a 0,1. La superficie del mare assorbe il 70% di cio'
     che sta sotto, e ne comprime il contrasto nella stessa proporzione: ecco
     perche' nessuna luce cambiava niente -- gamma 16 qualunque cosa facessi,
     perche' la gamma vera arrivava attenuata a un terzo.
     E' fisica giusta: la camera sta a quota ZERO, sul pelo, e da li' l'acqua
     riflette quasi tutto. Ma la tesi del sito e' «la parte che non vedi mai»,
     e l'invariante della camera la rendeva letteralmente invisibile.
     La funzione chiarisci gia' apriva il VOLUME col taglio e non il pelo.
     Adesso apre anche questo, e solo SOPRA LA NAVE: un mare che diventa
     trasparente dappertutto non e' una sezione, e' un vetro.
     STA QUI E NON PIU' IN BASSO: il primo tentativo era dentro
     INNESTO_SCINTILLE, che comincia con `+'`'+`if (acqTaglio > 0.002)` +'`'+` --
     e acqTaglio vale ZERO proprio quando la camera e' a quota zero, cioe'
     esattamente alla battuta che dovevo curare. Il codice non veniva mai
     eseguito, e la misura diceva 68,1 identico a prima. */
  if (uSpaccato > 0.001) {
    /* IL VARCO STA DOVE SI GUARDA ATTRAVERSO, NON SOPRA IL PEZZO.
       Primo tentativo: apertura centrata sulla verticale del meccanismo.
       Sbagliato di geometria -- la camera del sito sta quasi a filo d'acqua,
       quindi il raggio che raggiunge il meccanismo attraversa il pelo molto
       piu' vicino all'osservatore, e apriva dove non serviva. Misurato: gamma
       16, cioe' come non averlo.
       Qui si prende il raggio DALLA CAMERA a questo punto d'acqua, lo si
       prolunga, e si chiede se incontra la sfera del meccanismo. Se la
       incontra, e' un pixel attraverso cui si guarda il pezzo, e si apre. */
    vec3 acqDir = normalize(vMondo - cameraPosition);
    float acqApri = 0.0;
    for (int k = 0; k < 2; k++) {
      if (float(k) >= uQuantiVarchi) break;
      vec3 oc = vMondo - uVarchi[k].xyz;
      float bq = dot(oc, acqDir);
      float cq = dot(oc, oc) - uVarchi[k].w * uVarchi[k].w;
      float disc = bq * bq - cq;
      if (disc > 0.0) {
        /* quanto il raggio passa VICINO al centro: al centro pieno, al bordo
           sfumato. Senza sfumatura il varco disegna un cerchio netto sul mare,
           che si legge come un buco e non come acqua chiara. */
        float vicino = sqrt(disc) / uVarchi[k].w;
        acqApri = max(acqApri, clamp(vicino * 1.3, 0.0, 1.0));
      }
    }
    /* A TAGLIO APERTO IL VARCO E' UN BUCO, non una finestra appannata.
       Restava il 15% di superficie davanti al pezzo, ed e' proprio quella a
       spegnerlo: misurata a 34,8 livelli su una media di 107,9. */
    diffuseColor.a *= mix(1.0, 0.0, acqApri * uSpaccato);
  }

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

    /* --- LA SCIA ALLO SCAFO
       Il sito dichiara dodici nodi e lo scafo tocca l'acqua con una linea
       netta: e' il segnale piu' forte di sintetico alla galleggiamento. Una
       carena che avanza spinge l'acqua e la ARIA, e quella schiuma sta
       attaccata allo scafo -- nel sistema della nave, che e' anche quello
       della camera.
       La distanza dalla sagoma e' gia' pagata: lo stesso ellissoide del
       riflesso, valutato sul punto invece che sul raggio. Fuori
       dall'ellissoide length(p/semi) e' maggiore di 1, e quanto vale in piu'
       dice quanto si e' lontani.
       Si spegne a nave ferma, perche' a zero nodi la scia non c'e' e il
       cursore della velocita' deve continuare a dire la verita'. */
    if (uNaveForza > 0.0 && uNaveVel > 0.0) {
      /* IN PIANTA, non nello spazio. Il primo tentativo usava lo stesso
         ellissoide del riflesso, che comprende anche l'altezza della
         sovrastruttura: la sua superficie non passa nemmeno vicino alla linea
         di galleggiamento, e la scia non compariva. La scia e' un fatto della
         PIANTA -- si guarda da quanto e' lontano il punto dal profilo dello
         scafo visto dall'alto, e l'altezza non c'entra. */
      vec3 q3 = (uNaveInv * vec4(vMondo, 1.0)).xyz / uNaveSemi;
      float fuori = length(q3.xz) - 1.0;
      float vicino = 1.0 - smoothstep(0.0, 0.42, max(fuori, 0.0));
      float grana = acqCella(acqP * 5.2 + vec2(mod(uTempo * 0.37, 512.0))).x;
      /* La grana rompe la fascia: una banda pulita legge come un contorno
         disegnato, non come acqua aerata. E' la stessa cella della schiuma
         delle creste, piu' fitta e piu' veloce. */
      float baffo = vicino * smoothstep(0.10, 0.70, grana) * uNaveVel * acqTaglio;
      diffuseColor.rgb = mix(diffuseColor.rgb, uColSchiuma, baffo * 0.85);
      /* il baffo entra nella schiuma totale: serve piu' sotto, dove l'opacita'
         della superficie viene rialzata dove c'e' aria */
      acqSchiuma = max(acqSchiuma, baffo);
    }
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

  /**
   * ─── LA NAVE FA OMBRA SULL'ACQUA, e senza non ha peso
   *
   * SINTOMO, misurato sullo scatto della battuta principale: l'acqua sotto la
   * carena sta a 64,4/255 e quella lontana a 60,7 -- e' PIU' CHIARA di cinque
   * livelli. In una fotografia e' il contrario e di molto: uno scafo bianco
   * copre il cielo all'acqua che gli sta sotto. Senza quella fascia la nave
   * galleggia SOPRA il mare invece che dentro, ed e' uno dei segni con cui
   * l'occhio riconosce un montaggio.
   *
   * Il riflesso della nave c'era gia' -- ed e' lui a spiegare i +5 -- ma dice
   * cosa si VEDE nell'acqua, non quanta luce le ARRIVA.
   *
   * DOVE VA, ed e' il punto: qui, sul cielo, PRIMA che il riflesso della nave
   * lo sostituisca. Messo in coda smorzava anche il riflesso, cioe' cancellava
   * l'immagine della nave insieme alla sua ombra -- che e' il contrario di una
   * fotografia, dove sotto la murata bianca si vede la murata bianca dentro una
   * fascia scura.
   *
   * COME. La stessa geometria del riflesso, per un'altra domanda: quanto cielo
   * vede questo punto d'acqua. Il punto si porta nel sistema della nave diviso
   * per i semiassi -- dove l'ellissoide e' una sfera di raggio uno -- e conta
   * quanto e' lontano dall'asse.
   *
   * E' un'approssimazione DICHIARATA: l'occlusione vera dipende dall'altezza
   * della murata e dall'angolo, questa solo dalla distanza. E' monotona nel
   * verso giusto e costa una radice, mentre quella esatta costerebbe un
   * secondo tracciamento per fotogramma.
   */
  if (uNaveForza > 0.0 && uNaveOmbra > 0.0) {
    vec3 op = (uNaveInv * vec4(vMondo, 1.0)).xyz / uNaveSemi;
    float occ = smoothstep(uNaveOmbraRampa.x, uNaveOmbraRampa.y, length(op.xz)) * uNaveOmbra;
    acqCielo *= (1.0 - occ);
    diffuseColor.rgb *= (1.0 - occ * 0.55);
  }

  /* --- LA NAVE COPRE IL CIELO DOVE IL RAGGIO RIFLESSO LA INCONTRA.
     Punto e direzione si portano nel sistema della nave e si dividono per i
     semiassi: l'ellissoide diventa una sfera di raggio 1, e il test e' la
     stessa quadratica di sempre. Si tiene solo l'intersezione DAVANTI al
     punto (t > 0): un raggio che se ne va dalla parte opposta non incontra
     niente, e senza questo controllo la nave si specchierebbe anche
     dall'altro lato. */
  if (uNaveForza > 0.0) {
    vec3 o = (uNaveInv * vec4(vMondo, 1.0)).xyz / uNaveSemi;
    vec3 d = (uNaveInv * vec4(acqRif, 0.0)).xyz / uNaveSemi;
    float a = dot(d, d);
    float b = 2.0 * dot(o, d);
    float c = dot(o, o) - 1.0;
    float disc = b * b - 4.0 * a * c;
    if (disc > 0.0) {
      float sq = sqrt(disc);
      float t0 = (-b - sq) / (2.0 * a);
      float t1 = (-b + sq) / (2.0 * a);
      float t = t0 > 0.0 ? t0 : t1;
      if (t > 0.0) {
        /* il bordo non e' netto: piu' il raggio passa vicino al centro
           dell'ellissoide, piu' e' sicuro che stia guardando lo scafo. Senza
           sfumatura la sagoma disegna la propria silhouette invece della nave. */
        float dentro = clamp(sq / (2.0 * sqrt(a)) * 1.6, 0.0, 1.0);

        /**
         * ─── UNA MURATA BIANCA SI SPECCHIA CHIARA
         *
         * Qui il riflesso era un colore solo, uNaveCol = 0x2a3338, luminanza
         * 51: una sagoma grigio scura. Una revisione esterna l'ha usato per
         * smentire una mia frase -- avevo scritto che il chiarore sotto la
         * carena veniva dal «riflesso di una murata bianca», e non era vero
         * perche' quel riflesso SCURISCE -- ed e' corretto. Ma la conseguenza
         * vera e' un'altra: **una murata bianca dovrebbe specchiarsi chiara, e
         * qui non lo faceva.** In una fotografia sotto uno yacht bianco c'e'
         * una macchia chiara verticale, non un'ombra.
         *
         * Il colore giusto dipende da COSA incontra il raggio, e l'ellissoide
         * non ha materiali. Ma ha una quota, e quella basta per la sola
         * distinzione che conta: sopra la linea d'acqua la nave e' murata e
         * sovrastruttura, cioe' vernice chiara; sotto e' opera viva scura.
         *
         * Si prende la quota del punto colpito nel sistema della nave --
         * o + t*d e' gia' normalizzato sui semiassi, quindi la sua y va da
         * -1 a +1 -- e si passa da un colore all'altro attorno allo zero.
         *
         * E' un'approssimazione dichiarata: non sa dove finisce la murata e
         * comincia la tuga, e di un ponte in teak non sa niente. Ma distingue
         * le due meta' che l'occhio distingue da trenta metri, ed e' l'unica
         * cosa che a quella distanza si legge davvero.
         */
        float quota = (o + d * t).y;
        vec3 colNave = mix(uNaveCol, uNaveSopra, smoothstep(-0.10, 0.22, quota));
        acqCielo = mix(acqCielo, colNave, dentro * uNaveForza);
      }
    }
  }
  totalEmissiveRadiance += acqCielo * (acqFres * uCielo * acqTaglio);

  /**
   * ─── E LA SUPERFICIE NASCONDE SOLO QUANTO RIFLETTE
   *
   * Il pelo era opaco all'88% da ogni angolo, quindi lo scafo finiva netto
   * sulla linea d'acqua e sotto non c'era piu' nave. In una fotografia
   * marina non succede: lo scafo continua sott'acqua e si spegne piano.
   *
   * La ragione fisica e' la stessa Fresnel gia' calcolata qui sopra. Una
   * superficie d'acqua nasconde cio' che sta sotto **nella misura in cui
   * riflette**: di scorcio riflette quasi tutto e fa da specchio, guardata
   * ripida riflette il 2% e si vede attraverso. Quindi l'opacita' non e' una
   * costante: e' acqFres.
   *
   * Non si va fino in fondo (alfa = acqFres) perche' l'acqua non e' solo
   * un'interfaccia, e' anche un corpo che diffonde: resta un fondo del 30%
   * anche a picco. Sotto la linea l'assorbimento vero lo fa gia' nebbiaAcqua
   * sulla geometria, con Beer-Lambert e sigma in metri.
   *
   * Alla nave, che alla battuta principale sta a una trentina di metri con la
   * camera a 3,6, l'incidenza e' 6,8 gradi: acqFres 0,54, quindi passa circa
   * il 40%. E' esattamente il regime in cui uno scafo si vede e si spegne.
   */
  diffuseColor.a *= mix(1.0, 0.30, (1.0 - acqFres) * acqTaglio);

  /**
   * ─── MA LA SCHIUMA NON E' UN'INTERFACCIA: E' ARIA DENTRO L'ACQUA
   *
   * Rendere il pelo trasmissivo ha rotto la scia, e il cancello l'ha visto
   * mentre io no. Misurato commit per commit:
   *
   *     1c7d4c5  prima della camera alzata   +0,68%   (gia' rosso)
   *     96d2294  camera alzata               +2,83%   GUARITO
   *     734be68  pelo trasmissivo            +0,16%   ROTTO di nuovo
   *
   * La causa e' esattamente il pezzo che avevo appena scritto: schiuma e baffo
   * si disegnano DENTRO il colore della superficie, e abbassandone l'opacita'
   * si diluiscono con quello che c'e' dietro. Alla camera del cancello --
   * bassa, che guarda l'acqua di scorcio ma non radente -- l'alfa scende
   * abbastanza da lavare via proprio la fascia sottile che la scia produce.
   *
   * La correzione non e' rialzare l'opacita' e basta: sarebbe rimettere il
   * difetto vecchio. E' che la schiuma **non e' l'interfaccia**. La Fresnel
   * governa una superficie liscia che riflette e trasmette; la schiuma e' un
   * volume di bolle d'aria che DIFFONDE, ed e' opaco. Dove c'e' schiuma la
   * superficie torna a nascondere cio' che sta sotto, perche' fisicamente lo
   * nasconde.
   */
  diffuseColor.a = mix(diffuseColor.a, 1.0, clamp(acqSchiuma * 4.0, 0.0, 1.0));
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
/**
 * ─── SOTTO LA LINEA NON C'ERA ACQUA: C'ERA UNA TINTA
 *
 * Il volume sommerso era una scatola con un `MeshBasicMaterial` opaco al 72%
 * messa DAVANTI a tutto. Da qualunque angolo, quindi, la meta' bassa era un
 * campo verde uniforme con una sagoma dietro: la stessa quantita' di verde su
 * un pezzo a due metri e su uno a venti.
 *
 * L'acqua vera non fa cosi'. Assorbe, e assorbe in proporzione a QUANTA se ne
 * attraversa: `L = L0 * exp(-sigma * d)`. E' la legge di Beer-Lambert, ed e'
 * il motivo per cui in una foto subacquea la prua a due metri si legge e la
 * poppa a venti e' gia' quasi solo acqua.
 *
 * Qui la si applica alla GEOMETRIA sommersa invece che con un velo davanti.
 *
 * ─── IL CAMMINO NELL'ACQUA NON E' LA DISTANZA DALLA CAMERA
 *
 * Qui c'era scritto che coincidono, «perche' la camera sta a quota zero». La
 * premessa e' vera solo per una parte del racconto: in uscita dal salone la
 * camera scende **da dentro la tuga** fino al pelo, e in quel tratto una parte
 * del segmento sta in ARIA, dove non si assorbe niente.
 *
 * Quanto contava, misurato con `strumenti/misura-acqua.mjs` sui vertici veri
 * dello scafo: **all'apertura si attraversavano 9,3 m d'acqua dove ce ne sono
 * 1,4 -- l'84,6% di troppo**, e proprio nel primo fotogramma che si vede. Dalla
 * seconda battuta in poi la camera e' davvero sul pelo e l'errore e' zero:
 * ecco perche' guardando il sito da fermo non si notava.
 *
 * La correzione e' geometria esatta, non un'approssimazione migliore. Per un
 * frammento a quota h < 0 e una camera a quota c >= 0 il segmento taglia il
 * pelo a t = c/(c-h), quindi la parte bagnata vale
 *
 *     d * |h| / (c + |h|)
 *
 * che a c = 0 da' esattamente d, cioe' quello che il sito calcolava prima. La
 * vecchia formula era il caso particolare, e adesso e' contenuta nel generale.
 *
 * ─── E SIGMA ERA IN UNITA' DI SCENA MENTRE IL COMMENTO DICEVA METRI
 *
 * Secondo difetto, stesso blocco, ed e' quello che il sito rimprovera agli
 * altri: `sigma` moltiplicava `length(vViewPosition)`, che e' in unita' di
 * scena, mentre il commento prometteva metri. Una unita' vale 2,5 m -- lo
 * dicono gia' `impianto.js`, `sovrastruttura.js` e `vetro.js` -- quindi 0,085
 * non spegneva a 11,8 m ma a **29,4**, due volte e mezzo piu' in la'. Su uno
 * scafo che pesca 2,35 m questo vuol dire quasi nessun degradare: sotto la
 * linea si vedeva acqua piatta invece di uno scafo che si spegne.
 *
 * Adesso il numero e' in metri e la conversione e' scritta una volta sola.
 *
 * Quattro uniformi, nessuna texture, nessun passaggio in piu'.
 */
const NEBBIA_GLSL = `
uniform vec3  acquaColore;
uniform float acquaSigma;
uniform float acquaAttiva;
uniform float acquaQuotaCamera;
varying float vQuotaMondo;
`

/** Metri per unita' di scena. Stesso numero di `impianto.js` e `vetro.js`. */
export const METRI_PER_UNITA = 2.5

/**
 * QUANTO ASSORBE, e da dove viene il numero.
 *
 * Non e' scelto a occhio: si ricava da una grandezza che si misura davvero in
 * mare, la **profondita' del disco di Secchi**, con la relazione classica
 *
 *     z_Secchi ~ 8,7 / (c + Kd)
 *
 * dove `c` e' il coefficiente di attenuazione del fascio -- quello che conta
 * per il contrasto di un oggetto guardato lungo una linea di vista, che e'
 * esattamente cio' che fa questo shader -- e `Kd` quello diffuso.
 *
 * Acqua mediterranea limpida d'estate: Secchi ~30 m, Kd ~0,06 /m. Quindi
 *
 *     c = 8,7 / 30 - 0,06 = 0,23 al metro     ->  1/e a 4,3 m
 *
 * Il valore precedente, riportato in metri, era 0,034 /m: acqua sette volte
 * piu' limpida di qualunque mare in cui si naviga.
 */
export const ACQUA_SECCHI_M = 30
export const ACQUA_KD = 0.06
export const ACQUA_SIGMA_PER_METRO = 8.7 / ACQUA_SECCHI_M - ACQUA_KD
/** Lo stesso numero nelle unita' in cui lo shader misura le distanze. */
export const ACQUA_SIGMA = ACQUA_SIGMA_PER_METRO * METRI_PER_UNITA
export const ACQUA_COLORE = [0.031, 0.145, 0.157]

/**
 * Applica l'estinzione a un materiale, COMPONENDOSI con la patch che ha gia'.
 * Scavalcare `onBeforeCompile` invece di comporlo e' un difetto gia' pagato in
 * questo repo, con lo scafo rimasto senza buccia d'arancia per mezza giornata.
 */
export function nebbiaAcqua (m, uni) {
  const prima = m.onBeforeCompile
  const chiave = m.customProgramCacheKey
  m.onBeforeCompile = function (s, r) {
    if (prima) prima.call(this, s, r)
    // lo shader d'ombra non ha `<dithering_fragment>`: li' non si applica, ed
    // e' giusto -- una mappa di profondita' non si tinge
    // lo shader d'ombra non ha il pezzo di uscita, e uno shader senza luci non
    // ha `vViewPosition`: in tutti e due i casi non si applica, e non e' un
    // errore -- una mappa di profondita' non si tinge, e una linea non ha
    // spessore d'acqua
    if (!s.fragmentShader.includes('#include <dithering_fragment>')) return
    if (!s.fragmentShader.includes('vViewPosition')) return
    s.uniforms.acquaColore = uni.colore
    s.uniforms.acquaSigma = uni.sigma
    s.uniforms.acquaAttiva = uni.attiva
    s.uniforms.acquaQuotaCamera = uni.quotaCamera
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>
varying float vQuotaMondo;`)
      .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
{ vec4 qm = modelMatrix * vec4( transformed, 1.0 ); vQuotaMondo = qm.y; }`)
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', '#include <common>' + NEBBIA_GLSL)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
{
  // sotto la linea, e solo sotto
  float sotto = smoothstep( 0.02, -0.08, vQuotaMondo ) * acquaAttiva;
  if ( sotto > 0.0 ) {
    // solo il tratto BAGNATO del segmento: con la camera in aria una parte
    // sta sopra il pelo e li' non si assorbe. A camera sul pelo vale d.
    float h = max( -vQuotaMondo, 0.0 );
    float c = max( acquaQuotaCamera, 0.0 );
    float bagnato = length( vViewPosition ) * h / max( c + h, 1e-4 );
    float resta = exp( -acquaSigma * bagnato );
    gl_FragColor.rgb = mix( acquaColore, gl_FragColor.rgb, mix( 1.0, resta, sotto ) );
  }
}`)
  }
  m.customProgramCacheKey = () => 'nebbia-acqua|' + (chiave ? chiave.call(m) : '')
  m.needsUpdate = true
  return m
}


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
  // Un materiale senza nome non si puo' interrogare da fuori: e' la stessa
  // lezione dei ventiquattro materiali anonimi di materiali.js.
  materialePelo.name = 'pelo'

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
    uColMare: { value: new Color(0x0f3438) },
    /**
     * --- LA NAVE DENTRO IL RIFLESSO
     *
     * Misurato sulla stessa camera del render Cycles, l'acqua SOTTO lo scafo:
     *
     *     Cycles   78,3 contro 131,8 di acqua libera    -40,6%
     *     sito     99,8 contro 100,2                     -0,4%
     *
     * Nel render lo scafo si specchia e soprattutto BLOCCA il cielo; nel sito
     * il mare sotto la nave e' identico a quello aperto. E' il divario piu'
     * grande rimasto, ed e' anche il piu' facile da riconoscere: una nave
     * senza riflesso non e' su un mare, e' davanti a un mare.
     *
     * La cura NON e' un passaggio di specchio -- rifare la scena in un
     * bersaglio costa un secondo disegno della nave a ogni fotogramma, e qui
     * il quadro e' quasi tutto acqua. Si CALCOLA: dal punto d'acqua parte il
     * raggio riflesso, e si chiede se incontra la nave. Se la incontra, quel
     * pixel non vede il cielo.
     *
     * La sagoma e' un ELLISSOIDE nel sistema della nave: e' una quadratica,
     * dieci istruzioni, e di uno scafo approssima la forma affusolata molto
     * meglio di una scatola -- che sarebbe larga di baglio da prua a poppa e
     * darebbe un riflesso rettangolare. E' una sagoma, e come tutte le sagome
     * sbaglia: quanto, sta scritto nel commit, misurato contro il render.
     */
    uNaveInv: { value: new Matrix4() },
    uNaveSemi: { value: new Vector3(1, 1, 1) },
    uNaveCol: { value: new Color(0x2a3338) },
    /* la parte FUORI dall'acqua: murata e sovrastruttura, cioe' vernice chiara.
       Non e' bianco puro -- un riflesso e' sempre piu' scuro dell'originale,
       perche' la superficie ne restituisce solo una parte e il resto lo
       trasmette. */
    uNaveSopra: { value: new Color(0xb9bfbe) },
    uNaveForza: { value: 0 },
    uNaveVel: { value: 0 },
    /**
     * Quanto la nave scurisce l'acqua che le sta vicino. Scelto guardando il
     * confronto affiancato a 0,45 / 0,85 / 2,0 sulla stessa inquadratura: sotto
     * 0,5 non si legge, sopra 1 la fascia diventa una macchia. A 0,85 lo scafo
     * smette di stare SOPRA il mare e comincia a starci dentro.
     *
     * Non e' un numero derivato da una grandezza fisica, ed e' giusto dirlo:
     * l'occlusione vera dipende dall'altezza della murata e dall'angolo del
     * sole. Questa e' una scelta di messa in scena su un termine che ha il
     * verso giusto.
     */
    uNaveOmbra: { value: 0.85 },
    /**
     * LA FORMA DELL'IMPRONTA, e qui una revisione esterna ha trovato il
     * difetto vero: non l'intensita' ma la PORTATA.
     *
     * La rampa finiva a 1,9 semiassi dall'asse della nave. L'acqua che a
     * schermo si legge "sotto la carena" -- il primo piano fra la camera e la
     * linea d'acqua -- in quel sistema sta a **2,17**, cioe' gia' oltre il
     * bordo, dove l'occlusione e' zero. Misurato da loro: occlusione media
     * 0,082 su un massimo di 0,85, e solo il 28% della fascia sopra 0,05.
     * L'ombra c'era e cadeva accanto al posto giusto.
     *
     * Il numero nuovo non e' un gusto ed e' l'unico che sapevo derivare:
     * l'ombra di uno scafo si estende all'incirca quanto lo scafo e' ALTO.
     * L'altezza d'aria dichiarata e' 10,96 m, cioe' 4,4 unita' di scena, e su
     * un semiasse trasversale di 1,41 fanno 3,1 semiassi -- piu' il raggio
     * stesso, 3,5 sta li'. A 6 la fascia diventa una macchia che invade il
     * mare aperto, misurato: il mare lontano scende da 91 a 85.
     */
    uNaveOmbraRampa: { value: new Vector2(3.5, 0.9) },
    uSpaccato: { value: 0 },
    uVarchi: { value: [new Vector4(), new Vector4()] },
    uQuantiVarchi: { value: 0 }
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
/* dentro il taglio l'acqua sparisce: il sito sta mostrando un pezzo, e fra chi
   guarda e il pezzo non deve restare niente. Era 0,12, cioe' quasi niente ma
   non niente, e quel quasi si vedeva. */
const CHIARA = 0.0      // dentro il taglio: l'acqua non c'e'

  /**
   * ─── LA SCATOLA E' IL FONDO, NON UN VELO DAVANTI
   *
   * Era `FrontSide` e trasparente al 72%: da qualunque angolo la sua faccia
   * vicina passava DAVANTI a tutto cio' che sta sott'acqua, e tingeva della
   * stessa quantita' di verde un pezzo a due metri e uno a venti. Il risultato
   * era un campo uniforme con delle sagome dentro -- il contrario di una
   * fotografia subacquea, dove la distanza si legge proprio dal verde.
   *
   * Adesso l'assorbimento lo fa ANCHE `nebbiaAcqua` sulla geometria, con la
   * legge di Beer-Lambert. Il velo pero' resta `FrontSide`, e non e' un
   * ripiego: e' lui che NASCONDE il meccanismo quando il varco e' chiuso.
   * Provato a metterlo `BackSide` -- il fondale invece del filtro -- e
   * `collaudo-varco` e' diventato rosso subito: «col taglio chiuso il
   * meccanismo ha gia' gamma 114, il varco resta aperto». Il velo e'
   * un'occlusione, non solo una tinta.
   */
  const materialeVolume = new MeshBasicMaterial({
    color: 0x061518, transparent: true, opacity: FONDA,
    depthWrite: false
  })
  // Terzo materiale anonimo che mi fa perdere tempo stanotte: senza nome,
  // una sonda che cerca 'il velo' pesca il primo trasparente che passa.
  materialeVolume.name = 'velo'
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
  function anima (t, mare, frame, camX = 0, camZ = 0, nodi = 0) {
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
    /* La sagoma segue la nave che ROLLA: la matrice si riprende a ogni
       fotogramma, o il riflesso resterebbe dritto mentre la nave si inclina --
       che e' peggio di non averlo, perche' si vede che e' finto. */
    if (nave) {
      uni.uNaveInv.value.copy(nave.matrixWorld).invert()
      uni.uNaveForza.value = forzaNave
      /* La scia cresce con l'andatura e si SATURA: fra dodici e venti nodi un
         baffo non raddoppia. A zero nodi vale zero, cosi' il cursore della
         velocita' continua a dire la verita' anche sull'acqua. */
      uni.uNaveVel.value = Math.min(1, Math.max(0, nodi) / 9)
    }
  }

  /**
   * --- CHI SI SPECCHIA, E CON CHE SAGOMA
   *
   * I semiassi si MISURANO sull'ingombro vero dell'oggetto, non si scrivono:
   * se lo scafo cambia, la sagoma lo segue. Si stringe di un fattore perche'
   * un ellissoide circoscritto a una nave e' molto piu' grosso della nave --
   * il riflesso uscirebbe largo di baglio da prua a poppa.
   */
  let nave = null
  let forzaNave = 0
  function seguiNave (oggetto, { forza = 0.85, stretta = 0.62 } = {}) {
    nave = oggetto
    forzaNave = forza
    if (!oggetto) { uni.uNaveForza.value = 0; return null }
    const b = new Box3().setFromObject(oggetto)
    const d = b.getSize(new Vector3())
    uni.uNaveSemi.value.set(
      Math.max(d.x / 2 * stretta, 0.05),
      Math.max(d.y / 2 * stretta, 0.05),
      Math.max(d.z / 2 * stretta, 0.05)
    )
    return uni.uNaveSemi.value.clone()
  }

  /** Il taglio schiarisce l'acqua: q va da 0 (nave intera) a 1 (sezione). */
  function chiarisci (q) {
    const v = Math.max(0, Math.min(1, q))
    materialeVolume.opacity = FONDA + (CHIARA - FONDA) * v
    /* Il taglio apre anche il PELO, sopra la nave: senza, la sezione mostra
       l'interno dello scafo attraverso una superficie che ne assorbe il 70%. */
    uni.uSpaccato.value = v
  }

  /**
   * `uni` esce anche fuori, e serve a una cosa sola: misurare. Il mare si
   * muove e la nave rolla, quindi due catture separate non si possono
   * confrontare -- il rumore vale il 24% dei pixel, il segnale cercato molto
   * meno. Con le uniformi in mano un banco cambia SOLO la grandezza che sta
   * studiando e disegna due volte lo stesso istante.
   */
  /**
   * Dove il pelo si apre quando il taglio e' aperto. Si passano gli oggetti --
   * i due impianti -- e il centro e il raggio si MISURANO sul loro ingombro:
   * se il meccanismo cambia, il varco lo segue.
   */
  function seguiVarchi (oggetti) {
    const v = uni.uVarchi.value
    let n = 0
    for (const o of oggetti) {
      if (!o || n >= v.length) continue
      const b = new Box3().setFromObject(o)
      const c = b.getCenter(new Vector3())
      const d = b.getSize(new Vector3())
      // centro e raggio della SFERA del pezzo: il varco e' un test di raggio,
      // quindi serve il centro vero in tre dimensioni, non la sua pianta
      v[n].set(c.x, c.y, c.z, Math.max(d.x, d.y, d.z) * 0.62)
      n++
    }
    uni.uQuantiVarchi.value = n
    return n
  }

  return { gruppo, anima, chiarisci, seguiNave, seguiVarchi, uni }
}
