# Le tecniche WebGL che tornano nei siti da premio

Dieci effetti che ricompaiono su quasi tutti i siti schedati in questa cartella,
spiegati **dal codice vero** dove il codice vero c'era.

---

## Come e' fatta questa scheda

Base di partenza: `_CODICE-PUBBLICO-1.md`, `-2.md`, `-3.md`, la sottocartella
`_codice/`, `_PATTERN.md`, `_PRESTAZIONI.md`, `_LIBRERIE-DEGLI-STUDI.md` e le
schede dei singoli siti.

In piu', per scrivere questa, ho **riscaricato e riaperto tre bundle** (13
agosto 2026, solo `curl --compressed`, nessun browser):

| bundle | byte | perche' e' leggibile |
|---|---:|---|
| `resn.co.nz/.../js/main_desktop_extended.js` | 4.011.938 | **mai minificato** |
| `lusion.co/_astro/hoisted.CUO_IjfL.js` | 1.251.728 | minificato, ma **il GLSL nelle stringhe e' intatto** |
| `assets.itsoffbrand.io/lando/dev-js/lando-by-OFF+BRAND.js` | 1.457.237 | build Bun/esbuild, **a capo e commenti GLSL conservati** |

Il motivo per cui il terzo punto funziona sempre vale la pena ripeterlo: **il
minificatore JavaScript non tocca il contenuto delle stringhe.** Uno shader
scritto in un template literal arriva in produzione con indentazione, commenti
e righe morte. E' la falla piu' produttiva di tutta la ricerca.

### Legenda degli snippet

- **[REALE]** - copiato alla lettera da un bundle servito pubblicamente. Sotto
  c'e' scritto da dove.
- **[CANONICO]** - l'ho scritto io: e' la forma minima e corretta della tecnica,
  non il codice di nessuno.

### La regola sulla licenza, che vale per tutto il documento

**Nessuno dei tre bundle ha una licenza.** Nemmeno il repository di Basement,
nemmeno le demo di Cuberto, nemmeno gli script di Revelatio. Assenza di licenza
non vuol dire pubblico dominio: vuol dire **diritto d'autore pieno**.

Quindi, operativamente: gli snippet **[REALE]** stanno qui come *prova* e come
*documentazione*, cioe' per far vedere che la tecnica e' quella e con che numeri
la tarano. **Si leggono, si capiscono, si riscrivono.** Non si incollano in un
progetto di un cliente.

Fanno eccezione due cose che sono legalmente copiabili e che ricorrono ovunque:
la funzione `snoise` di **webgl-noise** (Ashima Arts / Stefan Gustavson, **MIT**)
e le easing di Penner. Su quelle basta l'attribuzione nel sorgente. Il resto no.

---

## Le dieci tecniche in una tabella

Costo espresso in **passate a schermo intero equivalenti** (il numero che conta
davvero: vedi la sezione 11).

| # | tecnica | dove costa | passate equivalenti | chi la usa fra i siti schedati |
|---|---|---|---:|---|
| 1 | distorsione griglia su velocita' di scroll | vertex + CPU (misura DOM) | ~0,1 | Immersive Garden, Prometheus, Darkroom, 2xA, KPR |
| 2 | transizione fra texture con mappa di rumore | 1 texture fetch in piu' | ~0,05 | Lando Norris, Prometheus, Resn, Cuberto (SVG) |
| 3 | Perlin/Simplex/curl noise | ALU, **dipende da dove lo metti** | 0,1 -> 4 | Resn, Lusion, Lando, 2xA, Immersive Garden |
| 4 | particelle GPGPU (FBO ping-pong) | buffer piccolo + disegno grande | 0,3 -> 2 | Active Theory, Lusion, Igloo, Star Atlas |
| 5 | instancing | draw call: quasi zero | ~0,2 | Lusion, Basement, Messenger, Lando, Dark |
| 6 | bloom / aberrazione / grana / vignetta | **numero di passate**, non di effetti | 0,1 -> 3,5 | Active Theory, Immersive Garden, Prometheus, Lusion, Igloo |
| 7 | vetro con rifrazione e dispersione | 3 fetch, o **una seconda scena** | 0,2 -> 3 | Resn, Lusion, Active Theory, Messenger |
| 8 | mesh al posto di elementi DOM | **CPU, non GPU** (layout) | ~0 GPU | 13 siti su 16 (`_PATTERN.md`, P1) |
| 9 | testo MSDF | 1 quad per glifo | ~0,05 | Igloo, Zajno, Lando, Messenger, Active Theory |
| 10 | fluidi 2D | **da 1 a 25 passate**, a scelta tua | 0,5 -> 25 | Lando, Lusion, Active Theory, 2xA (in 2D) |

---
# 1. Distorsione della griglia su scorrimento e velocita'

## Cosa fa

Il piano che porta un'immagine smette di essere piatto mentre scorri: si allunga
in verticale, si incurva a barile ai bordi, o ondeggia. Quando ti fermi torna
piatto. E' l'effetto che fa dire "questo sito e' fluido" a chi non sa dire
perche'.

Il punto non e' la deformazione: e' che **la deformazione e' legata alla
velocita', non alla posizione**. Se la leghi alla posizione ottieni una
parallasse, che e' un'altra cosa e si nota molto meno.

## Come si implementa

Quattro pezzi, e tre su quattro si sbagliano.

**a) La sorgente della velocita'.** Con Lenis e' `lenis.velocity` (px/frame
smussati). Senza Lenis, la differenza fra `scrollY` corrente e uno `scrollY`
inseguito con lerp. Con GSAP ScrollSmoother, `scroller.getVelocity()`.

**b) Lo smorzamento asimmetrico.** La velocita' grezza e' rumorosa e va a zero
di colpo. Quello che serve e' *sale in fretta, scende piano*: attacco veloce,
rilascio lento. Immersive Garden usa due easing diverse per i due versi,
scritte nel bundle: `fast = cubic-bezier(.2, 0, 0, 1)` per l'accelerazione,
`slow = cubic-bezier(.4, 0, 0, 1)` per il ritorno, con due soglie separate
(`fastTrigger: 0.99`, `slowTrigger: 0.75`). Non e' un lerp solo.

**c) La geometria deve avere suddivisioni.** E' l'errore numero uno:
`new PlaneGeometry(1, 1)` ha quattro vertici e **non si puo' piegare**. Serve
almeno `PlaneGeometry(1, 1, 24, 24)`.

**d) Il clamp.** Senza limite, uno swipe violento su telefono manda il piano
fuori scena. Prometheus lo scrive nel modo piu' corto possibile (dal GLSL vero
del bundle):

```glsl
uScrollDelta = 1 + clamp(-.2, .2, delta * 10);
```

Cioe' la distorsione non esce mai dal 20%.

## Quanto costa

**Poco sulla GPU, e il costo vero e' sulla CPU.** Un piano 24x24 sono 1.152
triangoli: venti piani in pagina fanno 23.000 triangoli, che e' niente anche su
un telefono. La deformazione e' aritmetica nel vertex shader, quindi si paga una
volta per vertice, non per pixel.

Il costo e' altrove: se allunghi il piano di verticale devi **disegnare piu'
pixel** (overdraw), e soprattutto **la misura del rettangolo DOM** che alimenta
il piano (vedi tecnica 8) e' una lettura di layout. Farla ogni frame per venti
elementi e' il modo piu' comune di perdere 5 ms di CPU per un effetto che sulla
GPU ne costa 0,2.

## Chi la usa

| sito | cosa fa esattamente | numeri veri dal bundle |
|---|---|---|
| **Immersive Garden** | allungamento verticale + incurvatura a barile ai bordi | `uStretchFactor`, `uDeformationProgress`, soglie `fastTrigger .99` / `slowTrigger .75` |
| **Prometheus Fuels** | lo shader di transizione si deforma scorrendo veloce | `uScrollDelta = 1 + clamp(-.2, .2, delta*10)` |
| **Darkroom** | il marquee accelera con lo scroll | `r = 0.1 * speed * (1 + abs(lenis.velocity) / 5) * deltaTime` |
| **2xA** | marquee integrato manualmente | `progress -= velocity * dt * 0.005 / ratio` |
| **KPR** | soglia binaria "sto scorrendo" | `Math.abs(scroller.getVelocity()) > 20` |
| **Zajno** | scala allo scroll `0,12`, velocita' mouse `0,3` | lerp separati per sorgente |

Nota su Darkroom e 2xA: **non e' WebGL**, e' un `translate3d` su un nastro. La
stessa idea (velocita' -> deformazione) funziona anche senza canvas, e costa
zero. Vale la pena provarla li' prima di aprire three.js.

## Snippet

**[CANONICO]** - il vertex shader minimo. `u_vel` e' gia' normalizzato e
clampato dal lato JS.

```glsl
uniform float u_vel;      // -1 .. 1, gia' smussato e clampato
uniform vec2  u_domWH;    // dimensioni del box DOM in pixel
varying vec2  v_uv;

void main() {
  v_uv = uv;
  vec3 pos = position;

  // 1) barile: i bordi restano indietro rispetto al centro.
  //    pos.x va da -0.5 a 0.5, quindi (1 - 4*x*x) vale 1 al centro e 0 ai bordi
  float edge = 1.0 - 4.0 * pos.x * pos.x;
  pos.y += u_vel * 0.18 * edge;

  // 2) allungamento: il piano si stira nella direzione del moto.
  //    abs() perche' si stira sia andando su sia andando giu'
  pos.y *= 1.0 + abs(u_vel) * 0.12;

  // 3) l'onda, se serve. Frequenza sull'altezza reale del box, non su uv:
  //    cosi' un box alto e uno basso si deformano allo stesso modo
  pos.y += sin(pos.x * 6.2831) * u_vel * 0.04 * (u_domWH.y / 600.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

**[CANONICO]** - il lato JS, con lo smorzamento asimmetrico che e' la parte che
decide se l'effetto sembra materia o sembra un bug.

```js
const MAX_VEL = 45;      // px/frame oltre i quali si satura
const ATTACK  = 0.35;    // sale in fretta
const RELEASE = 0.06;    // torna piano

let vel = 0;

lenis.on('scroll', ({ velocity }) => { rawVel = velocity; });

function tick() {
  const target = Math.max(-1, Math.min(1, rawVel / MAX_VEL));
  // asimmetrico: se il target e' piu' grande in modulo, attacco; altrimenti rilascio
  const k = Math.abs(target) > Math.abs(vel) ? ATTACK : RELEASE;
  vel += (target - vel) * k;

  if (Math.abs(vel) < 0.001) vel = 0;   // aggancio a zero: evita il tremolio a riposo
  material.uniforms.u_vel.value = vel;
}
```

Le tre righe che fanno la differenza: il clamp, l'asimmetria, e l'aggancio a
zero. Senza l'ultima il piano non torna mai davvero piatto e a schermo si vede
un'increspatura permanente.

---

# 2. Transizione fra due texture con mappa di rumore

## Cosa fa

Al posto di una dissolvenza uniforme fra due immagini, la seconda **emerge a
macchie**, seguendo il disegno di una texture di rumore. Con la soglia stretta
sembra un bordo che avanza; con la soglia larga sembra fumo.

E' la tecnica con il rapporto resa/costo piu' alto di tutte e dieci. E' anche
quella che si scrive in una riga.

## Come si implementa

Il cuore e' uno `smoothstep` fra il valore del rumore e il progresso:

```glsl
float mask = smoothstep(n - w, n + w, p);
```

dove `n` e' il rumore letto nel punto, `p` il progresso 0..1 e `w` la larghezza
del bordo. Con `w = 0` hai un taglio netto; con `w = 0.4` una dissolvenza morbida.

Tre dettagli che decidono la resa:

**a) Il rumore va letto da una texture, non calcolato.** Una `noise.webp` da
256x256 tileabile costa un fetch; calcolare `snoise` a schermo intero costa
cinquanta volte tanto (vedi tecnica 3). Lando ha in produzione
`textures/noise/noise-03.webp` proprio per questo.

**b) `p` va rimappato per compensare i bordi.** Con `p` che va da 0 a 1 e la
maschera che sfuma di `w`, agli estremi resta sempre un residuo. Serve
`p * (1 + 2*w) - w`.

**c) Il rumore deve avere due scale.** Un solo ottava sembra una macchia di
Rorschach. Due frequenze sommate (una grande per la forma, una piccola per il
bordo frastagliato) sembrano un materiale.

## Quanto costa

**Un fetch di texture in piu' rispetto a una dissolvenza normale.** In pratica
zero, ed e' la stessa cifra su desktop e su telefono. Se la texture di rumore e'
condivisa fra tutti gli elementi che la usano, e' un solo binding.

E' l'unica delle dieci tecniche per cui **non serve nessuna degradazione mobile**.

## Chi la usa

- **Lando Norris** - e' scritta in una riga nel bundle, con il rumore letto da
  texture e il progresso preso da un valore di hover:
  `float hoverEffect = smoothstep(textureNoise.r, textureNoise.r + 0.05, uHelmetHover);`
  (soglia larga `0.05`: bordo quasi netto).
- **Prometheus Fuels** - `WaveSceneTransition` con `uTransition` e `uColor0`; il
  colore di transizione globale e' `#e74832`. Non si dissolve nel vuoto: passa
  **attraverso un colore**, che e' il trucco che tiene insieme le scene.
- **Resn** - ha moduli dedicati: `shaders/BlendShader`, `BlendPass`,
  `NoiseShader`, `ChokeShader` ("choke" e' esattamente il termine da compositing
  per stringere una maschera).
- **Cuberto** - `svg-distortion-effect-demo`: la stessa idea in **filtri SVG**
  (`feTurbulence` + `feDisplacementMap`), senza WebGL. Utile per capire che
  l'effetto non richiede un canvas.
- **2xA** - la tendina di transizione fra pagine e' l'unico canvas WebGL del
  sito, ed e' un singleton che vive fuori da `<main>` per non essere mai
  smontato da Swup.

## Snippet

**[REALE]** - Lando Norris, `lando-by-OFF+BRAND.js`. Non e' la transizione in
se': e' la **fabbrica di rumore**. Un piano a schermo intero che scrive in un
render target riusato da tutte le scene come `tBackgroundNoise`.

```glsl
uniform float SCALE;
uniform float SPEED;
uniform float DISTORT_SCALE;
uniform float DISTORT_INTENSITY;
uniform float NOISE_DETAIL;
uniform float CURSOR_INTENSITY;
uniform float CURSOR_SCALE;
uniform float CURSOR_BOUNCE;
uniform float REVEAL_SIZE;

void main() {
  vec2 uv = vUv;
  uv.x *= uAspect;
  uv.y += (REVEAL_SIZE + REVEAL_SIZE / 3.) * (1.0 - uReveal);
  uv.y /= 1.0 + (REVEAL_SIZE) * (1.0 - uReveal);

  vec2 mouse = uMouseCoords;
  mouse *= vec2(0.5);
  mouse += vec2(0.5);
  mouse.x *= uAspect;

  float cursor = 1.0 - distance(mouse, uv) * CURSOR_SCALE;
  cursor *= uMousePace;
  cursor = clamp(cursor, CURSOR_BOUNCE, 1.0);

  // primo rumore: serve solo a spostare le UV del secondo
  float noiseDistort = 0.5 + snoise(vec3(uv.x * DISTORT_SCALE,
                                         uv.y * DISTORT_SCALE,
                                         uTime * SPEED * 0.1)) * 0.5;

  // secondo rumore: le UV sono deviate dal cursore E dal primo rumore
  float noiseFinal = 0.5 + snoise(
    vec3(
      (uv.x + (cursor * CURSOR_INTENSITY) + (noiseDistort * DISTORT_INTENSITY)) * SCALE,
      (uv.y + (cursor * CURSOR_INTENSITY) + (noiseDistort * DISTORT_INTENSITY)) * SCALE,
      uTime * SPEED
    )
  ) * 0.5;
  noiseFinal *= NOISE_DETAIL;
  noiseFinal = fract(noiseFinal);

  float noiseBase = step(0.5, noiseFinal);

  gl_FragColor = vec4(vec3(noiseBase, noiseFinal, 0.0), 1.0);
}
```

Tre cose da rubare qui, e sono tutte e tre decisioni, non codice:

1. **Rumore che deforma rumore.** `noiseDistort` non si vede mai: serve solo a
   piegare le UV del secondo. E' il salto di qualita' fra "rumore" e "materia".
2. **Un canale duro e uno morbido.** Il rosso e' `step(0.5, ...)` - soglia
   netta; il verde e' il valore continuo. La stessa passata produce **due
   maschere**, e ogni scena a valle sceglie quale usare. Una passata, due usi.
3. **`fract()` dopo la moltiplicazione.** `noiseFinal *= NOISE_DETAIL` seguito da
   `fract()` produce delle **fasce ripetute** dentro il rumore: e' cosi' che si
   ottengono le venature invece di una nuvola.

Nel bundle, subito accanto, ci sono le stesse righe **commentate** in un altro
punto: hanno provato lo stesso rumore direttamente dentro lo shader della scena,
poi hanno deciso di calcolarlo una volta sola in un render target condiviso.

**[CANONICO]** - la transizione vera e propria, che e' la parte breve.

```glsl
uniform sampler2D u_from, u_to, u_noise;
uniform float u_progress;    // 0 .. 1
uniform float u_edge;        // 0.02 = taglio netto, 0.4 = fumo
varying vec2 v_uv;

void main() {
  // due ottave: la grande fa la forma, la piccola frastaglia il bordo
  float n = texture2D(u_noise, v_uv * 1.0).r * 0.75
          + texture2D(u_noise, v_uv * 4.3).r * 0.25;

  // rimappa il progresso perche' agli estremi la maschera arrivi davvero a 0 e a 1
  float p = u_progress * (1.0 + 2.0 * u_edge) - u_edge;

  float mask = smoothstep(n - u_edge, n + u_edge, p);

  gl_FragColor = mix(texture2D(u_from, v_uv), texture2D(u_to, v_uv), mask);
}
```

Variante che vale l'aggiunta di due righe: colorare il bordo della maschera.
`float rim = mask * (1.0 - mask) * 4.0;` da' una fascia sottile che vale 1 solo
sul fronte d'onda. Sommandoci un colore si ottiene il bordo incandescente che si
vede su meta' dei siti premiati, e costa una moltiplicazione.

---

# 3. Rumore Perlin, Simplex e curl per i movimenti organici

## Cosa fa

Da' a un movimento un andamento che sembra naturale invece che matematico. Un
seno oscilla; il rumore **vaga**. Il *curl noise* in piu' garantisce che il campo
di velocita' sia a divergenza nulla: le particelle **ruotano in vortici invece di
esplodere verso l'esterno**, che e' esattamente la differenza fra "fumo" e
"fuochi d'artificio".

## Come si implementa

Tre livelli, in ordine di costo crescente.

**a) Rumore da texture.** Precalcolato, letto con un fetch. Basta per il 70% dei
casi.

**b) `snoise` in GLSL.** La funzione di webgl-noise (Ashima Arts / Stefan
Gustavson, **MIT** - questa si puo' copiare, con attribuzione). Presente alla
lettera nel bundle di Lando:

```glsl
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){ ... }
```

Se in un bundle trovi `permute` e `taylorInvSqrt`, hai trovato webgl-noise. E'
la firma piu' riconoscibile del settore.

**c) Curl noise.** Si ricava dal rumore **derivandolo**. Ci sono due strade:
per differenze finite (sei valutazioni di rumore per asse, approssimato) o
**analitica**, con una variante di simplex che restituisce anche le derivate.
Lusion usa la seconda, che e' quella giusta.

## Quanto costa

**Dipende interamente da dove lo metti, e la differenza e' di due ordini di
grandezza.**

| dove | quante valutazioni per frame | costo |
|---|---:|---|
| vertex shader, piano 24x24 | 625 | trascurabile |
| vertex shader, mesh da 20k vertici | 20.000 | ancora poco |
| fragment shader su un buffer 128x192 (particelle) | 24.576 | ok, anche su telefono |
| **fragment shader a schermo intero, telefono a DPR 2** | **1.316.000** | **la cosa piu' cara che puoi fare per distrazione** |

Una `snoise` 3D costa circa 40-60 operazioni. A schermo intero su un telefono
medio sono decine di milioni di operazioni per frame, per un effetto che una
texture da 256x256 avrebbe dato con un fetch.

Il curl analitico costa **3 valutazioni di rumore-con-derivate per ottava**
(una per asse). Lusion usa 2 ottave: 6 valutazioni per particella per frame. Su
24.576 particelle e' sostenibile solo perche' il buffer e' minuscolo.

**La regola operativa:** rumore nel vertex = gratis. Rumore su buffer piccolo =
accettabile. Rumore a schermo intero = calcolalo **una volta** in un render
target e condividilo, come fa Lando con `tBackgroundNoise`.

## Chi la usa

- **Resn** - Perlin 3D completo (`mod289`, `permute`, `taylorInvSqrt`, `fade`)
  **nel vertex shader** della gemma di homepage, per deformarne la superficie.
  Il codice e' formattato e leggibile perche' il plugin `text!` di RequireJS
  inlina i file `.shader` senza minificarli.
- **Lusion** - curl analitico su 2 ottave dentro la simulazione delle particelle
  della hero About. Piu' `Simple1DNoise` e `BrownianMotion` come classi JS per i
  movimenti lenti di camera.
- **Lando Norris** - `snoise` di webgl-noise, calcolato una volta per frame in un
  render target e riusato da tutte le scene.
- **2xA** - **curl noise povero e geniale**, in canvas 2D, senza WebGL: prendono
  un solo valore di simplex 3D e lo interpretano come **direzione** invece che
  come intensita'. Dal bundle: `dx = cos(2*PI*n)`, `dy = sin(2*PI*n)`. Il
  risultato ruota in vortici e costa una `sin` e una `cos`. Su npm usano
  `simplex-noise` (MIT).
- **Immersive Garden** - rumore per ramo nel vertex shader del giardino del
  footer (`branchSwayPowerA/B`, `branchNoise`, `windPower`, `facingWind`), con
  la massa di ogni fiore calcolata dal suo bounding box.

## Snippet

**[REALE]** - Resn, `data/shaders/gem_vertex.shader`. Rumore che deforma una
superficie, con due frequenze: `turbulence` per il dettaglio e `pnoise` per
l'onda lenta.

```glsl
float noise = 20.0 * .90 * turbulence( .5 * normal + time );
float displacement = - weight * noise;
displacement += periodPn * pnoise( 0.06 * position + vec3( 2.0 * time ), vec3( 1.5 ) );

vec3 newPosition = position + normal * vec3( displacement );
gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
```

Da notare: la turbolenza e' campionata su `normal` (quindi il dettaglio e'
solidale alla forma e non scivola), l'onda lenta su `position` (quindi si muove
nello spazio). Due rumori, due spazi diversi, due scopi diversi.

**[REALE]** - Lusion, `hoisted.CUO_IjfL.js`. Il curl analitico. Questa e' la
versione corretta, quella che quasi nessun tutorial mostra.

```glsl
vec3 curl(vec3 p, float noiseTime, float persistence) {
  vec4 xNoisePotentialDerivatives = vec4(0.0);
  vec4 yNoisePotentialDerivatives = vec4(0.0);
  vec4 zNoisePotentialDerivatives = vec4(0.0);

  for (int i = 0; i < 2; ++i) {                       // due sole ottave
    float twoPowI = pow(2.0, float(i));
    float scale = 0.5 * twoPowI * pow(persistence, float(i));
    xNoisePotentialDerivatives += simplexNoiseDerivatives(vec4(p * twoPowI, noiseTime)) * scale;
    yNoisePotentialDerivatives += simplexNoiseDerivatives(vec4((p + vec3(123.4, 129845.6, -1239.1)) * twoPowI, noiseTime)) * scale;
    zNoisePotentialDerivatives += simplexNoiseDerivatives(vec4((p + vec3(-9519.0, 9051.0, -123.0)) * twoPowI, noiseTime)) * scale;
  }

  // il rotore: differenze incrociate delle derivate dei tre potenziali
  return vec3(
    xNoisePotentialDerivatives[3] - zNoisePotentialDerivatives[1],
    zNoisePotentialDerivatives[2] - yNoisePotentialDerivatives[3],
    yNoisePotentialDerivatives[1] - xNoisePotentialDerivatives[2]
  );
}
```

I tre offset costanti (`123.4, 129845.6, -1239.1` e compagni) non sono decorativi:
servono a **scorrelare i tre potenziali**. Se li togli, i tre campi coincidono e
il rotore va a zero - le particelle si fermano. E' l'errore piu' comune nel
riscrivere questa funzione.

Nota di costo: `simplexNoiseDerivatives` prende un `vec4` (rumore 4D), quindi il
tempo e' la quarta dimensione invece di uno scorrimento del campo. E' piu' caro
del 3D ma non ha la deriva direzionale che si vede quando si anima traslando un
rumore 3D.

**[CANONICO]** - la versione economica per chi non ha bisogno del 3D. E' quella
di 2xA tradotta in GLSL: costa **una** valutazione di rumore invece di sei.

```glsl
// campo rotazionale a buon mercato: il rumore da' l'ANGOLO, non la magnitudine
vec2 cheapCurl(vec2 p, float t) {
  float n = snoise(vec3(p, t));      // una sola valutazione
  float a = n * 6.2831853;
  return vec2(cos(a), sin(a));       // vettore unitario che ruota
}
```

Non e' a divergenza nulla in senso stretto, ma a occhio ruota e non esplode, che
e' tutto quello che serve a un sito.

---

# 4. Particellari da texture di posizione (GPGPU / FBO ping-pong)

## Cosa fa

Muove decine o centinaia di migliaia di particelle **senza mai toccarle dalla
CPU**. Le posizioni stanno in una texture a virgola mobile: ogni pixel e' una
particella (`rgb` = posizione, `a` = vita residua). Ogni frame uno shader legge
la texture precedente, applica le forze e scrive quella nuova. Poi la geometria
disegna N punti che leggono la propria posizione dalla texture.

Il nome "ping-pong" viene dal fatto che servono **due** render target e si
scambiano a ogni frame: non si puo' leggere e scrivere la stessa texture.

## Come si implementa

Cinque pezzi:

1. **Due render target `WxH` in `FloatType`** (o `HalfFloatType`, vedi sotto),
   `minFilter`/`magFilter` = `NearestFilter`, niente mipmap. Il numero di
   particelle e' `W * H`.
2. **Una terza texture con le posizioni iniziali**, per far rinascere le
   particelle quando la vita finisce. Lusion la chiama
   `u_simDefaultPosLifeTexture`.
3. **Lo shader di simulazione**: un quad a schermo intero sul render target
   piccolo, che legge `prev` e scrive `curr`.
4. **La geometria di disegno**: N vertici, ognuno con un attributo `simUv` che
   dice *dove nella texture* sta la sua posizione. E' l'unico dato per
   particella che la CPU manda alla GPU, e lo manda **una volta sola**.
5. **Lo scambio**: `[curr, prev] = [prev, curr]` a fine frame.

## Quanto costa

Due costi separati, e quasi sempre si guarda quello sbagliato.

**Il costo della simulazione** e' `W * H` fragment. A 128x192 sono 24.576
fragment: meno dell'1% di uno schermo di telefono. Anche con del curl noise
dentro, e' poco.

**Il costo del disegno e' quello vero**, ed e' fatto di overdraw. Se disegni
100.000 punti da 8 pixel in additivo, stai scrivendo 6,4 milioni di fragment,
cioe' **cinque schermate di telefono per frame**, e per giunta senza depth test
(l'additivo non scarta niente). E' li' che il telefono muore, non nella
simulazione.

**La trappola del formato.** `FloatType` (32 bit per canale) richiede
`EXT_color_buffer_float` per essere renderizzabile: su parecchi telefoni non c'e'
o e' lento. `HalfFloatType` (16 bit) e' quasi sempre disponibile, occupa meta'
memoria e meta' banda. Per posizioni entro qualche decina di unita' la precisione
del mezzo-float basta. **Parti da half, sali a full solo se vedi lo scatto.**

Memoria: una texture 512x512 float RGBA e' 4 MB. Due (ping-pong) fanno 8 MB. E'
tanto sul budget di ~100 MB oltre il quale un iPhone SE 3 chiude la scheda
(numero da `_PRESTAZIONI.md`).

## Chi la usa

| sito | sistema | numeri veri |
|---|---|---|
| **Active Theory** | framework proprio **Antimatter** (`AntimatterFBO`, `AntimatterPass`, `AntimatterSpawn`, `AntimatterAttribute`, `AntimatterUtil`) con `tPos`/`tPrevPos` in float texture | **100.000** particelle sulla home, **150.000** nella pagina work - valori letti in `uil.json` |
| **Lusion** | `AboutHeroParticlesSimulation` | `SIM_TEXTURE_WIDTH = 128`, `SIM_TEXTURE_HEIGHT = 192` su desktop, **128 su mobile**: da 24.576 a 16.384 particelle |
| **Igloo** | nuvole di punti da **volumi VDB** convertiti con esportatore proprio, in `.ktx2` | `peachesbody_64.ktx2`, `x_64.ktx2`, `medium_32.ktx2`; il colore dipende dalla **velocita'** del punto |
| **Star Atlas** | occhio umano di particelle | `particles/eye.drc` |
| **Messenger** | 8 web worker, fra cui `geometry` e `charactergeo` | `InstancedMesh` 25 occorrenze |

Il dato piu' istruttivo e' quello di Lusion: **sul telefono non spengono le
particelle, ne tolgono un terzo.** E' la filosofia opposta a quella di Apple, che
sul telefono spegne del tutto (vedi sezione 11).

## Snippet

**[REALE]** - Lusion, lo shader di simulazione della hero About. Legge la
posizione precedente, consuma la vita, fa rinascere, applica una rotazione
attorno a un asse che varia nel tempo, poi il curl.

```glsl
void main() {
  vec4 posLife = texture2D(u_simPrevPosLifeTexture, v_uv);
  vec3 posLifeOrigin = posLife.xyz - u_lightPosition;

  // la vita cala; quando finisce, la particella rinasce alla posizione di default
  posLife.w -= (0.5 + u_noiseStableFactor) * u_introDeltaTime;
  if (posLife.w < 0.0) {
    vec3 defPosOrigin = texture2D(u_simDefaultPosLifeTexture, v_uv).xyz;
    vec3 defPos = defPosOrigin * (1.25 + sin(u_noiseTime * 2.5 + v_uv.x * 21.) * 0.25)
                + u_lightPosition;
    posLife.w += 1.;
    posLife.xyz = defPos;
  }

  // vortice attorno alla luce: asse che ruota nel tempo, verso invertito
  // per la meta' inferiore della texture (v_uv.y < 0.5)
  vec3 toLight = posLife.xyz - u_lightPosition;
  vec3 axis    = vec3(sin(u_noiseTime), cos(u_noiseTime * 2. + v_uv.y * 6.283185), 0.0);
  vec3 spinDir = cross(axis, toLight);
  float dist   = length(toLight);
  if (dist > 0.01) {
    float spinStrength = u_introDeltaTime
      * (0.1 + smoothstep(0.5, 2.0, dist - v_uv.x * 0.5)
             * (v_uv.y < 0.5 ? 1. : -1.)
             * mix(2., 4., v_uv.x))
      * mix(0.75, 1.5, u_noiseStableFactor);
    posLife.xyz += spinDir * spinStrength;
  }

  // il curl, pesato sulla vita al quadrato: le particelle giovani vagano di piu'
  posLife.xyz += (1.25 + 0.5 * u_noiseScale)
    * curl((posLife.xyz - u_lightPosition) * (0.4 + 0.3 * u_noiseStableFactor), u_noiseTime, 0.2)
    * u_introDeltaTime
    * mix(0.4, 1.5, posLife.w * posLife.w)
    * mix(0.75, 1.25, v_uv.x);

  gl_FragColor = posLife;
}
```

**La cosa da imparare non e' il curl: e' l'uso di `v_uv` come parametro.** In
questo shader `v_uv.x` e `v_uv.y` non sono coordinate: sono **identita' della
particella**. `v_uv.y < 0.5` decide il verso di rotazione, `v_uv.x` modula
forza, scala e ampiezza. Con due numeri gratuiti (la posizione nella texture)
ottengono un intero sistema di variazioni per particella, senza un solo attributo
in piu' e senza un `random()`. E' il trucco piu' riusabile di tutta questa scheda.

Da notare anche: `mix(0.4, 1.5, posLife.w * posLife.w)`. La vita entra al
quadrato, quindi l'agitazione svanisce in fretta verso la fine - le particelle
"si calmano" prima di morire, invece di sparire mentre corrono.

**[CANONICO]** - l'impianto minimo attorno.

```js
const W = 128, H = 128;                 // 16.384 particelle

const opts = {
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter,
  format: THREE.RGBAFormat,
  type: THREE.HalfFloatType,            // half, non float: vedi sopra
  depthBuffer: false, stencilBuffer: false
};
let curr = new THREE.WebGLRenderTarget(W, H, opts);
let prev = curr.clone();

// posizioni iniziali: una DataTexture che resta immutata e serve alla rinascita
const data = new Float32Array(W * H * 4);
for (let i = 0; i < W * H; i++) {
  data[i*4+0] = (Math.random() - 0.5) * 10;
  data[i*4+1] = (Math.random() - 0.5) * 10;
  data[i*4+2] = (Math.random() - 0.5) * 10;
  data[i*4+3] = Math.random();          // vita iniziale sfasata: niente pulsazione
}
const defaultTex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.FloatType);
defaultTex.needsUpdate = true;

// la geometria di disegno: un attributo, mandato UNA volta
const geo = new THREE.BufferGeometry();
const simUv = new Float32Array(W * H * 2);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x;
  simUv[i*2+0] = (x + 0.5) / W;
  simUv[i*2+1] = (y + 0.5) / H;
}
geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(W*H*3), 3));
geo.setAttribute('simUv',    new THREE.BufferAttribute(simUv, 2));

function step() {
  simMaterial.uniforms.u_simPrevPosLifeTexture.value = prev.texture;
  renderer.setRenderTarget(curr);
  renderer.render(simQuadScene, simCamera);
  renderer.setRenderTarget(null);

  drawMaterial.uniforms.u_simCurrPosLifeTexture.value = curr.texture;
  [curr, prev] = [prev, curr];          // lo scambio
}
```

E il vertex shader del disegno, che e' due righe:

```glsl
attribute vec2 simUv;
uniform sampler2D u_simCurrPosLifeTexture;

void main() {
  vec4 posLife = texture2D(u_simCurrPosLifeTexture, simUv);
  vec4 mv = modelViewMatrix * vec4(posLife.xyz, 1.0);
  gl_PointSize = 4.0 * (1.0 - posLife.w) * (300.0 / -mv.z);  // prospettiva
  gl_Position = projectionMatrix * mv;
}
```

Attenzione a `gl_PointSize`: su parecchie GPU mobili il massimo e' 64 o anche
solo 32 pixel, e sopra quel limite viene **clampato in silenzio**. Se le
particelle vicine "smettono di crescere", e' quello.

---
# 5. Instancing per migliaia di oggetti

## Cosa fa

Disegna N copie della stessa geometria con **una sola chiamata di disegno**. Il
guadagno non e' sulla GPU (che i triangoli li disegna comunque): e' sul dialogo
CPU-GPU. Mille `mesh.draw()` sono mille cambi di stato, mille validazioni,
mille attraversamenti del driver. Un `InstancedMesh` con `count = 1000` e' uno.

## Come si implementa

Tre livelli, e la scelta fra il secondo e il terzo e' quella che conta.

**a) `InstancedMesh` con `setMatrixAt`.** La via facile. Ogni istanza ha una
matrice 4x4 nell'attributo `instanceMatrix`. Va bene per oggetti che si muovono
poco o si aggiornano di rado.

**b) Attributi per istanza.** Invece della matrice completa, mandi solo cio' che
cambia: `InstancedBufferAttribute` con posizione, scala, seme casuale, e il
vertex shader compone la trasformazione. Meno banda (3 float invece di 16),
piu' controllo.

**c) Trasformazione letta da texture.** Gli attributi non si toccano mai: la
posizione e l'orientamento di ogni istanza stanno in una texture, indicizzata da
un attributo intero. E' la strada di Lusion, ed e' l'unica che scala oltre le
decine di migliaia.

## Quanto costa

**Le draw call sono quasi gratis; il problema si sposta altrove.**

- **Aggiornare `instanceMatrix` dalla CPU** significa riscrivere `16 * N` float e
  ricaricarli sul bus ogni frame. A 10.000 istanze sono 640 KB per frame, cioe'
  38 MB/s: su un telefono e' un carico serio. **Sopra le 5.000 istanze aggiornate
  ogni frame, passa alla strada (c).**
- **Il frustum culling smette di funzionare.** three.js calcola una sola
  bounding sphere per l'intero `InstancedMesh`: o e' tutto dentro o e' tutto
  fuori. Se le istanze sono sparse su tutta la scena, disegni sempre tutto.
- **Le ombre si moltiplicano.** N istanze che proiettano ombra sono N istanze
  disegnate una seconda volta nella shadow map.
- **Non esiste lo skinning istanziato in three.js.** Basement se l'e' dovuto
  scrivere (`components/characters/instanced-skinned-mesh`): personaggi
  scansionati, una mesh sola con morph target e un'implementazione custom.

## Chi la usa

- **Lusion** - `GoalWhiteTunnel` e `JellyInstancer`. Il tunnel e' fatto di pezzi
  istanziati la cui posizione e orientamento vengono letti da **due texture di
  animazione precotta** e interpolati fra due fotogrammi.
- **Basement** - instanced skinned mesh scritto a mano (three.js non ce l'ha).
- **Messenger** - 25 occorrenze di `InstancedMesh`; il sito e' un gioco 3D
  completo con `<body>` vuoto e 1.493 byte di CSS totali.
- **Lando Norris** - `InstancedMesh` fra le firme confermate nel bundle, insieme
  a GLTFLoader, DRACOLoader ed EffectComposer.
- **Active Theory** - `JellyInstancer`, `SpineInstancer`; e in piu' l'instancing
  e' un **requisito d'ingresso**: senza WebGL2 e senza l'estensione instancing il
  sito reindirizza a `/unsupported`.
- **Dark (Netflix)** - motore WebGL1 scritto in casa, con **una** chiamata
  `drawArraysInstanced` in tutto il bundle: l'albero genealogico.

## Snippet

**[REALE]** - Lusion, il vertex shader del tunnel. Ogni istanza e' un "pezzo",
la sua posizione e il suo quaternione stanno in due texture, e fra due fotogrammi
si interpola. Nessun dato per istanza viaggia mai dalla CPU.

```glsl
attribute float piece;                  // l'unico attributo per istanza: un indice
uniform sampler2D u_positionTexture;
uniform sampler2D u_orientTexture;
uniform vec2  u_textureSize;
uniform float u_frameFrom;
uniform float u_frameTo;
uniform float u_frameRatio;
uniform float u_fragmentScale;

vec3 qrotate(vec4 q, vec3 v){ return v + 2.*cross(q.xyz, cross(q.xyz, v) + q.w*v); }

void main() {
  // una sola vec4 legge le UV di ENTRAMBI i fotogrammi: .xy = from, .zw = to
  vec4 animationUvs = (vec4(piece, u_frameFrom, piece, u_frameTo) + .5) / u_textureSize.xyxy;

  vec3 piecePosFrom    = texture2D(u_positionTexture, animationUvs.xy).xyz;
  vec4 pieceOrientFrom = texture2D(u_orientTexture,   animationUvs.xy);
  vec3 piecePosTo      = texture2D(u_positionTexture, animationUvs.zw).xyz;
  vec4 pieceOrientTo   = texture2D(u_orientTexture,   animationUvs.zw);

  float radius = length(position) * u_fragmentScale;
  vec3  dir    = position / radius;

  vec3 posFrom = qrotate(pieceOrientFrom, dir);
  vec3 posTo   = qrotate(pieceOrientTo,   dir);
  v_localDir   = normalize(mix(posFrom, posTo, u_frameRatio));
  // ...
}
```

Tre decisioni da rubare:

1. **Il `+ .5` prima della divisione.** Serve a centrare la lettura sul texel.
   Senza, con `NearestFilter` prendi il texel sbagliato a bordo di riga: e' il
   bug piu' insidioso delle texture-dato.
2. **`.xyxy` in un colpo solo.** Costruiscono le quattro coordinate con una sola
   operazione vettoriale invece di due.
3. **Interpolano le direzioni ruotate, non i quaternioni.** `qrotate` due volte e
   poi `mix` sul risultato normalizzato: e' piu' economico di uno `slerp` e per
   fotogrammi vicini e' indistinguibile.

**[CANONICO]** - il caso normale, con attributi per istanza. Da preferire a
`setMatrixAt` appena le istanze superano il migliaio.

```js
const geo = new THREE.InstancedBufferGeometry();
geo.copy(new THREE.BoxGeometry(1, 1, 1));
geo.instanceCount = N;

const offsets = new Float32Array(N * 3);
const scales  = new Float32Array(N);
const seeds   = new Float32Array(N);
for (let i = 0; i < N; i++) {
  offsets[i*3+0] = (Math.random() - .5) * 40;
  offsets[i*3+1] = (Math.random() - .5) * 40;
  offsets[i*3+2] = (Math.random() - .5) * 40;
  scales[i] = 0.2 + Math.random() * 0.8;
  seeds[i]  = Math.random();
}
geo.setAttribute('a_offset', new THREE.InstancedBufferAttribute(offsets, 3));
geo.setAttribute('a_scale',  new THREE.InstancedBufferAttribute(scales, 1));
geo.setAttribute('a_seed',   new THREE.InstancedBufferAttribute(seeds, 1));

// obbligatorio se le istanze sono sparse: altrimenti three.js le culla tutte insieme
mesh.frustumCulled = false;
```

```glsl
attribute vec3  a_offset;
attribute float a_scale;
attribute float a_seed;
uniform   float u_time;

void main() {
  vec3 p = position * a_scale;

  // il seme sfasa il movimento: senza, mille cubi respirano all'unisono
  // e l'occhio legge una griglia invece di una folla
  float t = u_time + a_seed * 6.2831853;
  p.y += sin(t) * 0.3;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p + a_offset, 1.0);
}
```

`a_seed` e' l'attributo piu' importante dei tre. Un migliaio di oggetti che si
muovono in fase sembrano un errore; sfasati sembrano vivi. Costa 4 byte per
istanza.

---

# 6. Post-produzione: bloom, aberrazione cromatica, grana, vignettatura

## La regola che viene prima di tutto

**Il costo non e' il numero di effetti: e' il numero di passate.**

Ogni passata a schermo intero vuol dire: cambiare render target, leggere una
texture grande quanto lo schermo, scrivere una texture grande quanto lo schermo.
Su una GPU mobile a piastrelle (tutte quelle dei telefoni) ogni cambio di render
target costa anche uno **store** e un **load** dell'intera piastrella: e' il
costo nascosto che non si vede sui benchmark desktop.

Quindi: **aberrazione, grana, vignetta, saturazione, tone mapping e dithering
vanno fusi tutti nell'ultima passata.** Sono cinque effetti e una passata. Farne
cinque passate costa cinque volte tanto e si vede identico.

Lusion fa esattamente cosi': nel loro shader di composizione finale ci sono
insieme la somma del bloom, la saturazione e il dithering. Una passata.

## 6.1 Bloom

**Cosa fa.** Le zone piu' luminose sbordano. E' l'effetto che fa sembrare che ci
sia luce vera invece che colori.

**Come si implementa.** Quattro fasi:

1. **High pass**: si tiene solo cio' che supera una soglia di luminanza.
2. **Downsample**: si scende di mipmap in mipmap (1/2, 1/4, 1/8...).
3. **Blur**: sfocatura separabile (orizzontale + verticale) a ogni livello.
4. **Composite**: si risommano i livelli con pesi diversi.

**Quanto costa.** E' di gran lunga il piu' caro dei quattro. Il conto:

| livelli (ITERATION) | passate totali | costo in schermi pieni |
|---:|---:|---:|
| 3 | 1 + 3 + 6 + 1 = 11 | ~1,4 |
| 5 | 1 + 5 + 10 + 1 = 17 | ~1,7 |

I "1,4 schermi" ingannano: i livelli piccoli costano pochissimi pixel ma
**ognuno e' un cambio di render target**. Su un telefono le 17 transizioni
pesano piu' dei pixel. E' per questo che Lusion, su mobile, non abbassa la
risoluzione del bloom: **ne toglie la convoluzione** (`USE_CONVOLUTION` e
`USE_HD` valgono entrambi `!isMobile`).

**Chi lo usa, con i numeri veri.**

| sito | parametri letti nel codice |
|---|---|
| **Active Theory** | `bloomStrength` **per pagina**, dentro `uil.json`: home `3.82`, globalbloom `0.3`, variante home `0.6`, contact `bloomRadius 0.5`, cleanroom `luminosityThreshold 0.2` |
| **Immersive Garden** | `strength: 2.2`, `radius: 0.15`, `threshold: 0.38`, `smoothWidth: 0.5` |
| **Prometheus Fuels** | valore **per scena**, da `0` a `1.5` |
| **Lusion** | `HydraBloom`-equivalente proprio, con `ITERATION` variabile e pesi per livello |
| **Igloo** | presente, insieme a displacement e dissolvenza a brina nelle transizioni |

Il dato piu' istruttivo di tutta la ricerca sul bloom e' quello di Active Theory:
**non e' un effetto acceso una volta, e' una taratura per scena**. Tre pagine
diverse hanno `bloomStrength` 3.82, 0.6 e 0.3 - un fattore dodici. Chi mette un
bloom globale e lo lascia li' ottiene sempre o troppo o troppo poco.

**[REALE]** - Lusion, lo shader di composizione. Notare che nella stessa passata
ci sono bloom, saturazione **e** dithering.

```glsl
uniform sampler2D u_texture;
uniform float u_saturation;
uniform sampler2D u_blurTexture0;
#if ITERATION > 1
uniform sampler2D u_blurTexture1;
#endif
/* ... fino a u_blurTexture4 ... */
uniform float u_bloomWeights[ITERATION];
#include <common>

vec3 dithering(vec3 color){
  float grid_position = rand(gl_FragCoord.xy);
  vec3 dither_shift_RGB = vec3(0.25/255.0, -0.25/255.0, 0.25/255.0);
  dither_shift_RGB = mix(2.0*dither_shift_RGB, -2.0*dither_shift_RGB, grid_position);
  return color + dither_shift_RGB;
}

void main() {
  vec4 c = texture2D(u_texture, v_uv);
  gl_FragColor = c + (u_bloomWeights[0] * texture2D(u_blurTexture0, v_uv)
#if ITERATION > 1
    + u_bloomWeights[1] * texture2D(u_blurTexture1, v_uv)
#endif
    /* ... */
  );
  gl_FragColor.rgb = mix(vec3(dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114))),
                         gl_FragColor.rgb, u_saturation);
  gl_FragColor.rgb = dithering(gl_FragColor.rgb);
  gl_FragColor.a = 1.0;
}
```

Il `dithering()` e' la riga che quasi nessuno scrive e che si vede subito: su un
gradiente scuro a 8 bit senza dither compaiono le fasce. Costa una `rand` e
un'addizione, e toglie il difetto piu' visibile di un sito buio.

**[REALE]** - Lusion, l'high pass, con una cosa in piu': l'alone (`USE_HALO`) e
la sporcizia di lente (`USE_LENS_DIRT`) attaccati alla stessa passata invece che
in una loro.

```glsl
uniform sampler2D u_texture;
uniform float u_luminosityThreshold;
uniform float u_smoothWidth;
uniform float u_amount;
#ifdef USE_HALO
uniform vec2 u_texelSize; uniform vec2 u_aspect;
uniform float u_haloWidth; uniform float u_haloRGBShift; uniform float u_haloStrength;
uniform float u_haloMaskInner; uniform float u_haloMaskOuter;
#ifdef USE_LENS_DIRT
uniform sampler2D u_dirtTexture; uniform vec2 u_dirtAspect;
#endif
#endif
#ifdef USE_CONVOLUTION
uniform float u_convolutionBuffer;
#endif

void main() {
  vec2 uv = v_uv;
#ifdef USE_CONVOLUTION
  uv = (uv - 0.5) * (1.0 + u_convolutionBuffer) + 0.5;
#endif
  vec4 texel = texture2D(u_texture, uv);
  vec3 luma = vec3(0.299, 0.587, 0.114);
  float v = dot(texel.xyz, luma);
  float alpha = texel.a * u_amount;
  gl_FragColor = vec4(texel.rgb * alpha, 1.0);
  /* ... halo ... */
}
```

L'uso dei `#ifdef` e' la lezione strutturale: **non hanno un bloom con degli
`if`, hanno cinque varianti compilate**. Su mobile compilano la variante senza
convoluzione e senza HD. Un `if` in un fragment shader lo paghi a ogni pixel; un
`#ifdef` non esiste proprio nel programma compilato.

## 6.2 Aberrazione cromatica

**Cosa fa.** I tre canali vengono campionati in punti leggermente diversi:
compaiono frange rosse e ciano ai bordi. Simula un obiettivo imperfetto.

**Come si implementa.** Tre `texture2D` invece di una, con offset crescenti verso
i bordi:

```glsl
vec2 dir = v_uv - 0.5;
float amt = u_aberration * dot(dir, dir);   // zero al centro, massimo agli angoli
col.r = texture2D(u_tex, v_uv - dir * amt).r;
col.g = texture2D(u_tex, v_uv).g;
col.b = texture2D(u_tex, v_uv + dir * amt).b;
```

**Quanto costa.** **Due fetch in piu' per pixel, se e' dentro una passata che
c'era gia'.** Praticamente nulla. **Una passata intera, se gliela dedichi.** E'
la differenza fra 0,05 e 1,0 schermi pieni, per lo stesso identico risultato.

Attenzione a un dettaglio non ovvio: i tre fetch sono in punti diversi, quindi la
GPU non puo' riusare la stessa lettura di cache. Su un telefono limitato dalla
banda l'aberrazione a schermo intero costa piu' di quanto suggerisca il conto
delle istruzioni.

**Chi la usa.** **Igloo** (frange rosso/ciano sugli anelli durante le
transizioni - e sono l'unico "colore" di un sito interamente in grigi freddi:
il colore arriva dall'errore ottico, non dalla tavolozza). **Lusion**
(`distortionRGBShift: .5` dentro `ScreenPaintDistortion`, piu' l'aberrazione ad
arcobaleno sui bordi dell'inquadratura nel tunnel). **Prometheus** (`uRGBShift`,
sempre acceso). **Resn** (ma la fa nel modo giusto e diverso: vedi tecnica 7,
non e' post-produzione, e' rifrazione a tre raggi).

## 6.3 Grana

**Cosa fa.** Aggiunge rumore per pixel. Serve a due cose: rompere le fasce dei
gradienti e dare texture a superfici troppo pulite. E' il modo piu' economico che
esista di far sembrare "fotografico" un rendering.

**Come si implementa.** Due strade:

```glsl
// (a) hash: gratis, ma il rumore bianco "brulica"
float g = fract(sin(dot(gl_FragCoord.xy + u_time, vec2(12.9898, 78.233))) * 43758.5453);

// (b) blue noise da texture: un fetch, ma distribuito molto meglio all'occhio
vec3 g = texture2D(u_blueNoise, gl_FragCoord.xy / 128.0).rgb;
```

**Quanto costa.** La (a) e' letteralmente gratis. La (b) costa un fetch su una
texture piccolissima, quasi sempre in cache.

**Chi la usa.** **Lusion** usa blue noise, e lo usa *dentro* i materiali, non
solo in post: nel fragment shader del vetro ci sono
`vec3 blueNoise = getBlueNoise(gl_FragCoord.xy + vec2(3., 9.));` e un secondo
campionamento sfasato `+ vec2(56., 39.)`. Serve a dithering-are il campionamento
dell'illuminazione, non solo l'immagine finale. **Prometheus** usa `uNoise: 1` e
in piu' un `uGrunge: 0.35` che e' **due campionamenti della stessa texture**
(`vUv*2.0` e `vUv*2.2+0.5`) fusi con `blendScreen` e `blendMultiply` - e' cosi'
che ottengono la sporcizia da stampa senza che si veda la ripetizione. **Resn**
ha un modulo `background/grain/grain` dedicato.

Il campionamento doppio sfalsato di Prometheus e' la ricetta: una texture sola,
due scale non multiple fra loro (2.0 e 2.2), due modi di fusione. Il periodo
apparente diventa lunghissimo e la ripetizione sparisce.

## 6.4 Vignettatura

**Cosa fa.** Scurisce i bordi. Guida l'occhio al centro e nasconde il fatto che
la scena finisce.

**Come si implementa.** Una riga:

```glsl
float vig = smoothstep(u_vigOuter, u_vigInner, length(v_uv - 0.5));
col.rgb *= mix(1.0 - u_vigStrength, 1.0, vig);
```

**Quanto costa.** Una `length` e uno `smoothstep`. E' l'effetto piu' economico
dei quattro, e uno dei tre o quattro piu' efficaci in assoluto sul risultato
percepito.

**Chi la usa.** **Prometheus**, `uVignette: 0.3` sempre acceso, insieme a grana e
a un bordo (`uBorderColor #fcefe0`, `uBorderWidth 0.008`). Il fatto che sia
*sempre* acceso e' il punto: non e' un effetto di transizione, e' parte della
resa base.

## 6.5 Il conto totale, e come tenerlo basso

| effetto | passate proprie | passate se fuso nella finale | costo residuo |
|---|---:|---:|---|
| bloom | 11-17 | 11-17 (non e' fondibile) | **alto** |
| aberrazione | 1 | 0 | 2 fetch |
| grana | 1 | 0 | 1 fetch o 1 hash |
| vignetta | 1 | 0 | 2 istruzioni |
| saturazione / tone map | 1 | 0 | 3 istruzioni |
| dithering | 1 | 0 | 1 hash |
| **totale** | **16-22** | **11-17** | |

Cioe': **facendo la cosa ovvia (una passata per effetto) paghi il 30-40% in piu'
per un risultato identico**, e su un tiler mobile il costo reale e' peggiore del
30% perche' ogni passata in piu' e' uno store/load di piastrella.

E se togli il bloom, tutto il resto insieme costa **una passata**.

---

# 7. Sfere e vetro con rifrazione e dispersione

## Cosa fa

Un oggetto trasparente che piega quello che c'e' dietro, riflette quello che c'e'
davanti, e scompone la luce nei tre canali cosi' che i bordi si tingano. E' il
cliche' visivo piu' riconoscibile del settore - la sfera di vetro nell'hero - ed
e' anche quello con la forbice di costo piu' larga.

## Le tre strade, e la differenza di costo e' 1 a 15

**a) Rifrazione finta su cubemap o matcap.** Si calcola `refract()` sulla normale
e si usa il vettore risultante per leggere una texture d'ambiente. Non sa niente
di cosa c'e' davvero dietro l'oggetto, ma a occhio non si distingue. **Costo: 3
fetch (uno per canale) e qualche istruzione.**

**b) Rifrazione in spazio schermo.** Si copia il framebuffer, si campiona quella
copia con le UV spostate dalla normale. Sa cosa c'e' dietro davvero. **Costo: una
copia del framebuffer** (una passata) piu' i fetch.

**c) `MeshPhysicalMaterial` con `transmission`.** three.js renderizza la scena una
seconda volta in un buffer, ne costruisce la catena di mipmap per simulare la
ruvidezza, e poi la campiona. **Costo: una seconda scena intera, ogni frame.**

**Il 90% dei siti premiati fa la (a).** E il motivo per cui i loro siti girano
mentre i cloni no e' quasi sempre questo.

## Come si implementa la dispersione

Non serve un modello fisico. Serve **cambiare l'indice di rifrazione per canale**
e rifrangere tre volte. La formula reale di Resn:

```
ior_R = ior
ior_G = ior * (1 - colorAbberation)
ior_B = ior * (1 - colorAbberation * 2)
```

Un solo parametro (`colorAbberation`) controlla quanto si aprono i tre raggi.
Nota che i tre `refract()` vanno fatti **nel vertex shader**, non nel fragment:
sono tre vettori per vertice, interpolati gratis dalla rasterizzazione. Farli per
pixel costa 30 volte tanto e non si vede.

## Quanto costa

| strada | passate in piu' | fetch per pixel | telefono medio |
|---|---:|---:|---|
| (a) cubemap/matcap + dispersione a 3 raggi | 0 | 3-4 | **regge** |
| (b) spazio schermo | 1 copia | 3-4 | al limite |
| (c) `transmission` di three.js | **una scena intera** | 3-4 + mipmap | **no** |

Piu' due costi che non si vedono nel conto: il vetro e' quasi sempre in
**blending**, quindi niente depth write e **niente early-z**: ogni pixel coperto
si paga per intero. E se hai piu' oggetti di vetro sovrapposti, l'overdraw si
moltiplica. Se il vetro copre mezzo schermo, hai gia' speso mezza passata prima
di aver calcolato niente.

## Chi la usa

- **Resn** - la gemma della homepage, strada (a) con dispersione a tre raggi. Il
  GLSL e' pubblicato in chiaro perche' il plugin `text!` di RequireJS non
  minifica i file `.shader`.
- **Lusion** - materiale `GLASS`, `GoalTunnelGlass`, la pila di croci. **Il dato
  che vale piu' del codice: sul telefono le due croci di vetro su ventiquattro
  non vengono create.** `browser.isMobile || sphereData.push(...)`. Il vetro e' la
  prima cosa che spengono.
- **Active Theory** - `CleanRoomGlass`, `CleanRoomRefractionScene`,
  `GlassCubeShader`; e nel loro `uil.json` c'e' un blocco di parametri dedicato.
- **Messenger** - un vero **pass di rifrazione, non un blend**, con `uDepthRange`.
- **Igloo** - la brina (`frost-datatexture.ktx2`) e le caustiche
  (`caustics.ktx2`) sono texture precotte: non simulano niente, campionano.

## Snippet

**[REALE]** - Resn, `data/shaders/gem_vertex.shader`. I tre raggi rifratti, uno
per canale, calcolati per vertice.

```glsl
uniform float ior;
uniform float colorAbberation;
varying vec3 vReflect;
varying vec3 vRefract;
varying vec3 vRefractG;
varying vec3 vRefractB;

void main() {
  vViewDirection = normalize(cameraPosition - mPosition.xyz);

  vModelNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
  vViewNormal  = normalize( mat3( modelViewMatrix[0].xyz, modelViewMatrix[1].xyz, modelViewMatrix[2].xyz ) * normal );

  vReflect  = normalize( reflect( normalize( mPosition.xyz - cameraPosition ), vModelNormal ) );

  vRefract  = normalize( refract( normalize( mPosition.xyz - cameraPosition ), vModelNormal, ior ) );
  vRefractG = normalize( refract( normalize( mPosition.xyz - cameraPosition ), vModelNormal, ior * (1.0 - colorAbberation) ) );
  vRefractB = normalize( refract( normalize( mPosition.xyz - cameraPosition ), vModelNormal, ior * (1.0 - colorAbberation * 2.0) ) );
  /* ... */
}
```

**[REALE]** - Resn, `gem_fragment.shader`. Ogni canale legge la **stessa**
texture di riflessione in un punto diverso. Poi il Fresnel decide quanto conta il
riflesso rispetto alla rifrazione.

```glsl
uniform vec2 refractionTiling;
uniform float addReflection;
uniform float refractionBlend;
uniform float frenselPower;             // il refuso e' loro
uniform sampler2D relectionTexture;     // anche questo

void main() {
  vec2 reflectionCoord = vec2((vReflect.x * 0.25 + 0.5) * refractionTiling.x,
                              (1.0 - vReflect.y * 0.25 + 0.5) * refractionTiling.y);
  reflectionCoord.xy = vec2(fract(reflectionCoord.x), fract(reflectionCoord.y));
  vec3 reflectionColor = texture2D( relectionTexture, reflectionCoord.xy ).rgb;
  reflectionColor *= reflectionBrightness;

  vec3 refractionColor = vec3(0.0);

  vec2 refractionCoord = vec2((vRefract.x * 0.25 + 0.5) * refractionTiling.x,
                              (vRefract.y * 0.25 + 0.5) * refractionTiling.y);
  refractionCoord.xy = vec2(fract(refractionCoord.x), fract(refractionCoord.y));
  refractionColor.r = texture2D( relectionTexture, refractionCoord.xy ).r;

  refractionCoord = vec2((vRefractG.x * 0.25 + 0.5) * refractionTiling.x,
                         (vRefractG.y * 0.25 + 0.5) * refractionTiling.y);
  refractionCoord.xy = vec2(fract(refractionCoord.x), fract(refractionCoord.y));
  refractionColor.g = texture2D( relectionTexture, refractionCoord.xy ).g;

  refractionCoord = vec2((vRefractB.x * 0.25 + 0.5) * refractionTiling.x,
                         (vRefractB.y * 0.25 + 0.5) * refractionTiling.y);
  refractionCoord.xy = vec2(fract(refractionCoord.x), fract(refractionCoord.y));
  refractionColor.b = texture2D( relectionTexture, refractionCoord.xy ).b;

  refractionColor *= refractionBrightness;

  // Fresnel: quanto la superficie e' di taglio rispetto alla camera
  float fresnelAmount = 1.0 - dot(vViewNormal, vec3(0.0, 0.0, 1.0));
  fresnelAmount = pow(fresnelAmount, frenselPower);
  fresnelAmount = 1.0 - (1.0 - fresnelAmount) * refractionBlend;

  refractionColor = mix(vec3(0.0), refractionColor, refraction);

  vec3 blendedColor;
  if (addReflection == 1.0) {
    blendedColor = refractionColor + reflectionColor * fresnelAmount;   // additivo
  } else {
    blendedColor = mix(refractionColor, reflectionColor, fresnelAmount); // sostitutivo
  }
  /* + una luce diffusa e una speculare a mano, poi opacita' globale */
}
```

Quattro cose da portarsi via, e nessuna e' il `refract()`:

1. **Una sola texture per tutto.** `relectionTexture` fa da ambiente per il
   riflesso *e* per le tre rifrazioni. Quattro fetch sulla stessa texture stanno
   in cache; quattro texture diverse no.
2. **`fract()` sulle coordinate.** Le UV derivate da un vettore possono uscire
   da 0..1; il `fract()` le ripiega invece di lasciare che si aggrappino al
   bordo. E' due istruzioni che tolgono un artefatto molto visibile.
3. **`frenselPower` e' un parametro, non una costante.** Il Fresnel fisico ha
   esponente 5. Loro lo espongono come uniform, cioe' hanno deciso che qui conta
   piu' come sembra che come e'.
4. **`addReflection` e' un `if` su una uniform booleana.** Vale la nota della
   sezione 6: qui e' un `if` per pixel. Su un oggetto piccolo passa; su una
   superficie a schermo intero sarebbe un `#ifdef`.

**Il costo totale di questa gemma:** zero passate aggiuntive, quattro fetch, un
po' di aritmetica. Gira dal 2016 e gira ancora. Confrontalo con una
`MeshPhysicalMaterial` con `transmission: 1` e capisci perche' molti cloni di
questi siti scattano mentre gli originali no.

---
# 8. Mesh trasportate al posto di elementi DOM

## Cosa fa

Il sito resta un sito: HTML, CSS, testo selezionabile, link veri, layout
responsive. Sopra (o sotto) c'e' **un solo canvas fisso a tutto schermo**, e ogni
immagine, video o titolo che deve avere un effetto viene **misurato con
`getBoundingClientRect()`** e replicato da un piano WebGL messo esattamente li'.
L'elemento HTML originale diventa invisibile o resta come segnaposto.

E' **il pattern piu' diffuso della categoria**: `_PATTERN.md` lo trova su **13
siti su 16**.

Il motivo per cui vince non e' estetico, e' organizzativo: **il layout lo fa il
CSS**. Non devi reimplementare la griglia, i breakpoint, il flusso del testo,
l'accessibilita'. Scrivi il sito normalmente e poi "vesti" gli elementi che
vuoi.

## Come si implementa

**a) Un canvas solo, `position: fixed; inset: 0`, mai smontato.** Se lo distruggi
e ricrei a ogni cambio pagina perdi le texture, ricompili gli shader e vedi un
lampo bianco.

**b) La camera va resa equivalente ai pixel CSS.** Due strade: ortografica con
unita' = pixel, oppure prospettica con la distanza calcolata perche' un'unita' a
z=0 valga un pixel:

```js
camera.fov = 2 * Math.atan((height / 2) / distance) * (180 / Math.PI);
```

Lusion sceglie una terza via, piu' pulita: **passa il rettangolo DOM come uniform
al vertex shader** e costruisce la posizione a schermo direttamente li'.

**c) La misura NON va fatta ogni frame.** E' il punto critico. `getBoundingClientRect()`
forza un ricalcolo del layout. Farlo per venti elementi a 60 fps significa 1.200
ricalcoli al secondo, e su un telefono e' il primo motivo di scatti.

La soluzione, che e' anche quella di Lusion: **misurare una volta e poi correggere
con l'offset di scroll a mano.** Il rettangolo cambia solo su resize, su cambio
di contenuto o su transizione; lo scroll lo sai gia', e' un numero.

**d) La trappola dichiarata in `_PATTERN.md`:** durante una transizione di pagina
i piani devono **staccarsi** dal tracking del DOM. Altrimenti il loop di render
riscrive la posizione sessanta volte al secondo e il tween non si vede.

## Quanto costa

**Sulla GPU: niente.** Sono quad. Il costo e' interamente CPU, ed e' tutto nella
gestione della misura.

| approccio | costo per 20 elementi a 60 fps |
|---|---|
| `getBoundingClientRect()` ogni frame per ogni elemento | 1.200 reflow/s - **inaccettabile** |
| misura in blocco a inizio frame, prima di ogni scrittura | 60 reflow/s - accettabile |
| **misura solo su resize + offset di scroll a mano** | ~0 - **giusto** |

Se proprio devi rimisurare spesso, la regola e': **tutte le letture prima, tutte
le scritture dopo**, mai alternate. Leggere-scrivere-leggere-scrivere e' il
layout thrashing, e costa un ordine di grandezza in piu' della stessa quantita' di
lavoro raggruppata.

## Chi la usa

- **Lusion** - il caso di riferimento, e il codice si legge. Uniform
  `u_domXY`, `u_domWH`, `u_domPivot`, `u_domPadding`, piu' `u_showRatio` e
  `u_activeRatio` (quanto e' entrato, quanto e' attivo - **due soli numeri fra 0
  e 1 pilotano tutti gli effetti del sito**).
- **Lando Norris** - Webflow fa il layout, un bundle da 1,46 MB "trucca" gli
  elementi cercandoli per `data-gl`, `data-gl-hover`, `data-gl-switcher`. Venti
  canvas in pagina.
- **Immersive Garden**, **Locomotive**, **Obys**, **TRIONN**, **Noomo**,
  **Merci Michel**, **NOTHIN'**, **Hearst** - stesso impianto.
- **Casi limite opposti:** **Active Theory** e **Messenger** mettono *tutto*
  dentro il canvas (l'HTML di Messenger e' 1.699 byte con `<body>` vuoto), ma
  hanno un framework proprio e dieci anni di manutenzione dietro.
- **Il controesempio che conta:** **Mosby's Files** ha vinto il Site of the Day
  del 13/08/2026 **senza nessun WebGL**.

## Snippet

**[REALE]** - Lusion, la sincronizzazione. Notare che `syncDom()` legge il
rettangolo, ma `update()` - quella che gira ogni frame - **non legge niente dal
DOM**: aggiorna solo delle uniform.

```js
syncDom(e = 0, t = 0) {
  if (this.refDom) {
    let r = this.refDom.getBoundingClientRect();
    this.syncRect(r.left, r.top, Math.ceil(r.width), Math.ceil(r.height), e, t);
  } else console.warn("refDom is missing");
}

syncRect(e, t, r, n, a = 0, l = 0) {
  this._domX = e;
  this._domY = t;
  this._domWidth  = Math.ceil(r);
  this._domHeight = Math.ceil(n);
  this.material.uniforms.u_domWH.value.set(this._domWidth, this._domHeight);
  this._capturedOffsetY = a;
  this._capturedOffsetX = l;
}

testViewport(e = 0, t = 0) {
  let r = this._domX - this._capturedOffsetX + t, n = r + this._domWidth;
  let a = this._domY - this._capturedOffsetY + e, l = a + this._domHeight;
  return a < properties.viewportHeight && l > 0
      && r < properties.viewportWidth  && n > 0;
}

update(e = 0, t = 0) {                       // gira ogni frame: zero letture DOM
  let r = this.material.uniforms;
  r.u_domXY.value.set(this._domX - this._capturedOffsetX + t,
                      this._domY - this._capturedOffsetY + e);
  r.u_domPivot.value.set(this._domWidth * this.pivot.x,
                         this._domHeight * this.pivot.y);
  r.u_domPadding.value.set(this.paddingL, this.paddingR, this.paddingT, this.paddingB);
  this.tick++;
}
```

`Math.ceil()` su larghezza e altezza non e' pignoleria: un rettangolo DOM ha
misure frazionarie, e un piano largo 340,33 px campiona una texture fra due
texel producendo una riga sfocata sul bordo. Arrotondare per eccesso e' la
differenza fra un'immagine nitida e una quasi nitida.

**[REALE]** - Lusion, il vertex shader che riceve quel rettangolo. Qui si vede
che la geometria e' un piano unitario (`pos.xy` in 0..1) moltiplicato per le
dimensioni reali del box.

```glsl
uniform vec3 u_position;
uniform vec4 u_quaternion;
uniform vec3 u_scale;
uniform vec2 u_domXY;
uniform vec2 u_domWH;
uniform vec2 u_domPivot;
uniform vec4 u_domPadding;
uniform float u_showRatio;

vec3 qrotate(vec4 q, vec3 v){ return v + 2.*cross(q.xyz, cross(q.xyz, v) + q.w*v); }

vec3 getBasePosition(in vec3 pos, in vec2 domWH) {
  vec3 basePos = vec3((pos.xy) * domWH - u_domPivot, pos.z);
  basePos.xy += mix(-u_domPadding.xz, u_domPadding.yw, pos.xy);
  return basePos;
}

vec3 getScreenPosition(in vec3 basePos, in vec2 domXY) {
  vec3 screenPos = qrotate(u_quaternion, basePos * u_scale) + vec3(u_domPivot.xy, 0.);
  screenPos = (screenPos + vec3(domXY, 0.) + u_position) * vec3(1., -1., 1.);
  return screenPos;
}
```

Il `* vec3(1., -1., 1.)` alla fine e' l'inversione dell'asse Y: il DOM cresce
verso il basso, lo spazio 3D verso l'alto. E' una moltiplicazione, non una
matrice.

E il fatto che ci sia `u_domPadding` come `vec4` (sinistra, destra, sopra, sotto)
dice una cosa sul metodo: **il piano puo' essere piu' grande del box DOM**. Serve
quando l'effetto sborda - un bagliore, una deformazione, un'ombra - e non vuoi
che venga tagliato dal bordo della geometria.

**[CANONICO]** - la struttura minima, con la gestione della misura fatta bene.

```js
class DomPlane {
  constructor(el, mesh) {
    this.el = el; this.mesh = mesh;
    this.rect = null;
    this.dirty = true;
  }
  measure(scrollY) {                 // SOLO su resize / fine transizione / cambio contenuto
    const r = this.el.getBoundingClientRect();
    this.rect = {
      x: r.left,
      y: r.top + scrollY,            // in coordinate di documento, non di viewport
      w: Math.ceil(r.width),
      h: Math.ceil(r.height)
    };
    this.mesh.material.uniforms.u_domWH.value.set(this.rect.w, this.rect.h);
    this.dirty = false;
  }
  update(scrollY) {                  // ogni frame: aritmetica, zero DOM
    const u = this.mesh.material.uniforms;
    u.u_domXY.value.set(this.rect.x, this.rect.y - scrollY);
  }
}

// il ciclo: prima TUTTE le misure, poi TUTTI gli aggiornamenti
function frame(scrollY) {
  for (const p of planes) if (p.dirty) p.measure(scrollY);
  for (const p of planes) p.update(scrollY);
}

const ro = new ResizeObserver(() => { for (const p of planes) p.dirty = true; });
```

Due avvertenze pagate da altri e scritte nelle schede:

- **Su `resize` non basta rimisurare: se cambi breakpoint puo' cambiare tutto.**
  Lando Norris risolve nel modo brutale e onesto: attraversare i 991/992 px
  **ricarica la pagina** (`window.location.reload()`, debounce 150 ms).
- **`100vh` mente su iOS.** Il rimedio usato ovunque, Lusion compreso: il JS
  scrive `--vh` a ogni resize e il CSS usa `calc(var(--vh, 1vh) * 100)`.

---

# 9. Trasformazioni su testo MSDF

## Cosa fa

Mette il testo **dentro** il canvas, nitido a qualunque ingrandimento, e lo rende
deformabile lettera per lettera come qualunque altra geometria.

MSDF (*multi-channel signed distance field*) e' un'evoluzione dell'SDF: al posto
di una distanza sola in un canale, tre canali codificano tre distanze. La
mediana dei tre ricostruisce **gli angoli vivi**, che un SDF a canale singolo
arrotonda sempre.

## Come si implementa

**a) L'atlante.** Un PNG/WebP con i glifi codificati come MSDF, piu' un JSON con
le metriche (posizione, avanzamento, kerning). Si generano con
`msdf-bmfont-xml`, oppure - se parti da un SVG invece che da un font - con
**`svg2msdf` di Active Theory**, che hanno pubblicato.

**b) La geometria.** Un quad per glifo, posizionato secondo le metriche del JSON.
Il layout del testo (a capo, allineamento) lo fai tu o te lo fa la libreria.

**c) Il fragment shader.** Sono tre righe, ed e' sempre la stessa formula:

```glsl
float median(float r, float g, float b) { return max(min(r,g), min(max(r,g), b)); }
float sd = median(msdf.r, msdf.g, msdf.b) - 0.5;
float alpha = clamp(sd / fwidth(sd) + 0.5, 0.0, 1.0);
```

Zajno la ha esattamente cosi' nel bundle: `max(min(r,g),min(max(r,g),b)) - .5`
poi `fwidth` + `smoothstep`.

**d) Gli attributi per lettera.** E' qui che la tecnica diventa interessante. Non
basta disegnare il testo: serve poterlo animare per lettera, per parola, per
riga. Lando Norris manda **otto attributi** per vertice:

```glsl
attribute float letterIndex;
attribute float lineIndex;
attribute float lineLetterIndex;
attribute float lineLettersTotal;
attribute float lineWordIndex;
attribute float lineWordsTotal;
attribute float aRandom;
attribute vec3  aTargetPositions;   // morph verso una forma bersaglio
```

Con questi si scrive qualunque cascata: per lettera, per parola, per riga,
dall'inizio, dalla fine, dal centro, a caso. I `*Total` servono a normalizzare:
`lineLetterIndex / lineLettersTotal` da' un progresso 0..1 dentro la riga
indipendentemente da quanto e' lunga.

## Quanto costa

**Sulla GPU: pochissimo.** Un quad per glifo, una texture condivisa, `fwidth`
(due istruzioni). Un titolo di 40 caratteri sono 40 quad.

**Sulla rete: pochissimo.** Zajno serve la scritta `ZAJNO(R)` come sei texture da
1920x728, e il PNG piu' grande e' **25.510 byte**. L'intera scritta gigante costa
8-25 KB per texture. L'atlante di Lando (`Brier-Bold-02.webp`) e' 117 KB piu' 89
KB di JSON.

**Il requisito tecnico:** `fwidth` richiede `GL_OES_standard_derivatives` in
WebGL 1 (in WebGL 2 e' nel linguaggio). Va dichiarata l'estensione, o su qualche
dispositivo il testo esce come una macchia.

**Il costo vero e' l'accessibilita', e non e' un dettaglio.** Testo dentro il
canvas vuol dire: non selezionabile, non cercabile con Ctrl+F, non tradotto dal
browser, non letto dagli screen reader, non indicizzato. **Igloo ha zero testo
HTML** in home. Zajno fa la cosa giusta: tiene nel DOM un **SVG inline del
logotipo** (`#ho-he-ba-h1`) accanto alle sei texture MSDF, cosi' il logotipo
esiste anche per chi non vede il canvas.

La regola, presa da `_PATTERN.md` e dalla correzione che gli e' arrivata da
Zajno: **il display type puo' essere una texture; il testo di lettura no.**

## Chi la usa

| sito | come |
|---|---|
| **Igloo** | tutto il testo e' MSDF, in atlante `IBMPlexMono-Medium-datatexture.ktx2`, con un `msdfworker-*.js` dedicato. Corpo espresso in unita' di scena (`size: .13`), non in pixel: scala con la camera. `lineHeight: 0.8` |
| **Zajno** | sei texture 1920x728 per `ZAJNO(R)`, con displacement in spazio schermo prima della lettura, colore fisso `#1a1a1a` |
| **Lando Norris** | atlanti `Brier-Bold-msdf.json` (89 KB) + `Brier-Bold-02.webp` (117 KB) e `MonaSans-Bold`; otto attributi per lettera |
| **Messenger** | worker dedicati `glyph` e `msdf` fra gli otto |
| **Active Theory** | `GLText`, `GLTextGeometry`, `GLTextThread` (il layout del testo su un thread separato), `GLUIBatchText`; e hanno pubblicato **`svg2msdf`** |

Il caso `GLTextThread` di Active Theory merita una nota: il **layout** del testo
(dove va a capo, dove sta ogni glifo) e' l'unica parte cara, ed e' CPU. Metterlo
su un worker e' la mossa che permette di rifare il layout a ogni resize senza
bloccare il frame.

## Snippet

**[CANONICO]** - il fragment shader completo, con l'estensione dichiarata e i due
miglioramenti che quasi tutti dimenticano.

```glsl
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform sampler2D u_atlas;
uniform vec3  u_color;
uniform float u_opacity;
varying vec2  v_uv;

float median(float r, float g, float b) { return max(min(r, g), min(max(r, g), b)); }

void main() {
  vec3 s = texture2D(u_atlas, v_uv).rgb;
  float sd = median(s.r, s.g, s.b) - 0.5;

  // fwidth misura quanto varia sd fra due pixel adiacenti: e' l'antialias
  // esatto per QUALSIASI scala, ed e' il motivo per cui MSDF non sfoca mai
  float w = fwidth(sd);
  float alpha = clamp(sd / max(w, 1e-5) + 0.5, 0.0, 1.0);

  if (alpha < 0.01) discard;      // niente pixel trasparenti nel depth buffer
  gl_FragColor = vec4(u_color, alpha * u_opacity);
}
```

Due dettagli: `max(w, 1e-5)` evita la divisione per zero quando il testo e'
esattamente parallelo allo schermo e fermo (succede, e produce pixel neri); il
`discard` evita di scrivere migliaia di frammenti totalmente trasparenti - su un
tiler mobile e' un guadagno reale.

**[CANONICO]** - il vertex shader con la cascata per lettera, nello stile degli
attributi di Lando.

```glsl
attribute float letterIndex;
attribute float lineIndex;
attribute float lineLetterIndex;
attribute float lineLettersTotal;
attribute float aRandom;

uniform float u_progress;     // 0 .. 1, pilotato da ScrollTrigger o da una timeline
uniform float u_stagger;      // 0 = tutte insieme, 1 = una alla volta

varying vec2 v_uv;
varying float v_alpha;

void main() {
  v_uv = uv;

  // progresso dentro la riga, indipendente da quanto e' lunga la riga
  float t = lineLetterIndex / max(lineLettersTotal - 1.0, 1.0);

  // finestra scorrevole: ogni lettera ha il suo intervallo di attivazione
  float from  = t * u_stagger;
  float to    = from + (1.0 - u_stagger);
  float local = clamp((u_progress - from) / max(to - from, 1e-4), 0.0, 1.0);

  // ease out cubica, a mano
  local = 1.0 - pow(1.0 - local, 3.0);

  vec3 p = position;
  p.y += (1.0 - local) * 40.0;                        // sale da sotto
  p.x += (1.0 - local) * (aRandom - 0.5) * 12.0;      // e sbanda un po', a caso
  v_alpha = local;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
```

Il trucco della "finestra scorrevole" (`from`/`to` derivati da `u_stagger`) e' il
modo giusto di fare uno stagger dentro uno shader: un solo uniform `u_progress`
da 0 a 1 pilota tutta la cascata, e `u_stagger` ne cambia il carattere senza
toccare niente altro. E' l'equivalente GLSL dello `stagger` di GSAP.

---

# 10. Fluidi 2D leggeri

## Cosa fa

Il puntatore lascia una scia che si diffonde, si deforma e svanisce, e quella
scia viene usata come **texture di disturbo** da tutto il resto: distorce le
immagini, muove le particelle, tinge lo sfondo.

## Le due strade, e costano 1 a 25

Questa e' la tecnica in cui la differenza fra farla bene e farla "giusta" e'
piu' grande di tutte.

**Strada A - il solutore vero (Stable Fluids).** Le equazioni di Navier-Stokes
risolte a passi: avvezione, forza esterna, viscosita' (iterativa), divergenza,
pressione (iterativa, di solito 20-60 passi Jacobi), proiezione. **Ogni passo e'
una passata.** Con 20 iterazioni di pressione sei gia' a 25-30 passate per frame.

**Strada B - il campo che si dissipa.** Nessuna equazione: un buffer di velocita'
in cui si "spruzza" dove passa il puntatore, che a ogni frame viene traslato
verso se stesso, moltiplicato per un fattore di dissipazione, e opzionalmente
spinto da un curl noise. **Una passata.** Non e' fisica, ma sullo schermo si
distingue solo se lo cerchi.

**Sui siti premiati si trovano tutte e due**, e la cosa istruttiva e' che i due
studi che le usano hanno fatto scelte opposte in modo consapevole.

## Quanto costa

| | strada A (solutore) | strada B (dissipazione) |
|---|---:|---:|
| passate per frame | **25-30** | **1-2** |
| risoluzione tipica | 128x128 o 256x256 | 1/4 e 1/8 dello schermo |
| costo su desktop | accettabile | trascurabile |
| costo su telefono medio | **al limite o oltre** | trascurabile |
| cosa lo limita | i **cambi di render target**, non i pixel | niente |

Il punto che sfugge sempre: a 128x128 il solutore tocca 16.384 pixel per passo,
cioe' un'inezia. Il problema e' che lo fa **trenta volte**, e ogni volta la GPU
mobile deve chiudere e riaprire il lavoro sulla piastrella. **E' il numero di
passate a uccidere, non l'area.**

Lando ha misurato il costo e ha risposto in un modo controintuitivo che vale la
pena riportare per intero (dalla scheda `lando-norris.md`):

> desktop 1440x900 con DPR 2 -> buffer 1800x1125 (**1,25x**); iPhone DPR 3 ->
> buffer 780x1688 (**2x**). Il desktop viene sotto-campionato apposta perche' la
> simulazione di fluido e' limitata dal riempimento su canvas grandi; il telefono
> ha un canvas piccolo e puo' permettersi densita'.

Cioe': **sul desktop rendono a meno del nativo, sul telefono a piu'.** E' il
contrario di quello che fanno tutti, ed e' corretto, perche' il vincolo non e' la
potenza del dispositivo ma **l'area da riempire**.

## Chi la usa

- **Lando Norris - strada A, un solutore completo.** Nel bundle ci sono, con i
  nomi in chiaro: avvezione, `divergence`, `poisson` (pressione), `viscous` con
  iterazioni, uniform `boundarySpace`, `cellScale`, `px`, `dt`. E' un port
  riconoscibile di Stable Fluids in three.js. Il risultato e' un'unica texture
  `tFluid` **condivisa da tutte le scene**: casco, testa, tipografia e fondali
  sembrano immersi nello stesso liquido perche' letteralmente lo sono.
- **Lusion - strada B, e non la chiamano nemmeno fluido.** La classe si chiama
  `ScreenPaint`, con accanto `ScreenPaintDistortion`. Nessuna pressione, nessuna
  divergenza: un buffer di "vernice" che si dissipa, spinto da curl noise. Gira a
  **un quarto e un ottavo** della risoluzione (`e >> 2` e `e >> 3` nel codice del
  resize).
- **Active Theory** - `Fluid`, `FluidFBO`, `MouseFluid` dentro il gruppo
  post-processing di Hydra. Il passo di `splat` ha un `SPLAT_RADIUS` ed e'
  **limitato a un evento ogni 50 ms**: non spruzzano a ogni movimento del mouse.
- **2xA** - la versione piu' economica di tutte: `[data-fluid]` su **canvas 2D**,
  non WebGL. Quattro celle di testo ridisegnate con offset da curl noise. Ha
  vinto lo stesso.
- **Igloo** - `cubes/advect.png`: un **campo di avvezione precotto in una
  texture**. Nessuna simulazione, il moto e' disegnato una volta in un file PNG.
  E' la strada C, quella che nessuno considera e che spesso e' la giusta.

## Snippet

**[REALE]** - Lando Norris, due passi del solutore. Li riporto perche' fanno
capire il costo meglio di qualunque spiegazione: sono due shader banali, ma sono
due passate su venticinque.

```glsl
// --- divergenza: quanto il campo di velocita' "crea" o "distrugge" fluido
precision highp float;
uniform sampler2D velocity;
uniform float dt;
uniform vec2 px;                 // dimensione di un texel
varying vec2 uv;

void main(){
    float x0 = texture2D(velocity, uv - vec2(px.x, 0)).x;
    float x1 = texture2D(velocity, uv + vec2(px.x, 0)).x;
    float y0 = texture2D(velocity, uv - vec2(0, px.y)).y;
    float y1 = texture2D(velocity, uv + vec2(0, px.y)).y;
    float divergence = (x1 - x0 + y1 - y0) / 2.0;
    gl_FragColor = vec4(divergence / dt);
}
```

```glsl
// --- pressione: UN passo di Jacobi. Ne servono venti o piu'.
precision highp float;
uniform sampler2D pressure;
uniform sampler2D divergence;
uniform float straightness;
uniform vec2 px;
varying vec2 uv;

void main(){
    float p0 = texture2D(pressure, uv + vec2(px.x * 2.0, 0)).r;
    float p1 = texture2D(pressure, uv - vec2(px.x * 2.0, 0)).r;
    float p2 = texture2D(pressure, uv + vec2(0, px.y * 2.0)).r;
    float p3 = texture2D(pressure, uv - vec2(0, px.y * 2.0)).r;
    float div = texture2D(divergence, uv).r;

    float newP = (p0 + p1 + p2 + p3) / (4.0 + straightness) - div;
    gl_FragColor = vec4(newP);
}
```

Il `straightness` al denominatore non e' nella formula fisica: e' un parametro
che hanno aggiunto per rendere il moto **piu' rettilineo** di quanto sarebbe.
Alzandolo, la pressione si diffonde meno e le scie restano dritte invece di
arricciarsi. E' un esempio pulito di "modifico l'equazione perche' mi piace di
piu' cosi'".

E il ciclo, sempre dal bundle, che mostra il ping-pong esplicito fra due target:

```js
update({ viscous, iterations, dt }) {
  this.uniforms.v.value = viscous;
  let a, b;
  for (var i = 0; i < iterations; i++) {
    if (i % 2 == 0) { a = this.props.output0; b = this.props.output1; }
    else            { a = this.props.output1; b = this.props.output0; }
    this.uniforms.velocity_new.value = a.texture;
    this.props.output = b;
    this.uniforms.dt.value = dt;
    super.update();
  }
  return b;
}
```

**[REALE]** - Lusion, la strada B. Una passata sola: dissipazione, spinta e curl.

```glsl
vec4 lowData = texture2D(u_lowPaintTexture, v_uv - u_scrollOffset);
vec2 velInv  = (0.5 - lowData.xy) * u_pushStrength;

#ifdef USE_NOISE
  vec3 noise3 = noised(gl_FragCoord.xy * u_curlScale * (1.0 - lowData.xy));
  vec2 noise  = noised(gl_FragCoord.xy * u_curlScale
                       * (2.0 - lowData.xy * (0.5 + noise3.x) + noise3.yz * 0.1)).yz;
  velInv += noise * (lowData.z + lowData.w) * u_curlStrength;
#endif

vec4 data  = texture2D(u_prevPaintTexture, v_uv - u_scrollOffset + velInv * u_paintTexelSize);
data.xy   -= 0.5;
vec4 delta = (u_dissipations.xxyz - 1.0) * data;   // la dissipazione, tutta qui
vec2 newVel = u_vel * d;
delta += vec4(newVel, radiusWeight.yy * d);
```

E i parametri, letti nella classe:

```js
pushStrength = 25;
accelerationDissipation = 0.8;
velocityDissipation = 0.985;
weight1Dissipation = 0.985;
weight2Dissipation = 0.5;
curlScale = 0.1;
curlStrength = 5;
```

Da leggere cosi': la velocita' perde l'1,5% per frame (`0.985`), cioe' a 60 fps
sopravvive circa un secondo; il "peso 2" perde meta' per frame, quindi e' un
lampo. **Due canali con due vite diverse dentro lo stesso buffer**: uno per la
scia lunga, uno per il tocco istantaneo. E' un buffer RGBA usato per intero,
non tre buffer.

Da notare anche `- u_scrollOffset` ripetuto due volte: il buffer di vernice e'
**agganciato al documento, non al viewport**. Scorrendo, la scia resta dov'era
sulla pagina invece di scorrere con lo schermo. E' un dettaglio di due caratteri
che cambia completamente la sensazione.

**[CANONICO]** - la strada B ridotta all'osso, per chi vuole partire.

```glsl
uniform sampler2D u_prev;
uniform vec2  u_texel;
uniform vec2  u_mouse;      // 0..1
uniform vec2  u_mouseVel;   // spostamento del frame, normalizzato
uniform float u_radius;     // ~0.06
uniform float u_dissipation;// ~0.97
varying vec2  v_uv;

void main() {
  // 1) avvezione a un passo: leggo dove il fluido "veniva da"
  vec2 vel = texture2D(u_prev, v_uv).xy - 0.5;
  vec2 src = v_uv - vel * u_texel * 30.0;
  vec2 next = (texture2D(u_prev, src).xy - 0.5) * u_dissipation;

  // 2) spruzzo: gaussiana attorno al puntatore
  float d = distance(v_uv, u_mouse);
  next += u_mouseVel * exp(-d * d / (u_radius * u_radius));

  gl_FragColor = vec4(next + 0.5, 0.0, 1.0);
}
```

Il `+ 0.5` / `- 0.5` serve a tenere valori con segno dentro una texture a 8 bit
non firmata. Se puoi permetterti un render target `HalfFloatType` non ti serve, e
guadagni molta precisione: e' la prima cosa da provare se la scia "gradona".

Ultima nota, e vale come regola generale: **su un sito nessuno ha bisogno di
Navier-Stokes. Serve qualcosa che sembri bagnato.** La strada B costa un
venticinquesimo e passa il confronto a occhio nudo.

---
# 11. Quanto costa ciascuna su un telefono di fascia media

## Il modello, dichiarato

Questa e' la sezione piu' utile e anche quella dove e' piu' facile raccontare
balle. Quindi metto in chiaro come sono arrivato ai numeri.

**Non ho un telefono strumentato in questa sessione.** I numeri sotto sono
**stime per ordine di grandezza**, calcolate su un modello esplicito, e vanno
misurate prima di essere citate a un cliente. Quello che **e' verificato** sono i
comportamenti reali dei siti (cosa spengono, in che ordine, con che parametri):
quelli vengono dai bundle e dalle schede, e sono la parte solida.

**Il dispositivo di riferimento**: telefono Android o iPhone di fascia media
2023-2026 (classe Adreno 6xx / Mali-G5x / Apple A13). Viewport CSS 390x844,
`devicePixelRatio` 3, banda di memoria condivisa con la CPU intorno ai 20 GB/s.

**L'aritmetica**: una passata a schermo intero legge e scrive 8 byte per pixel.
A DPR 2 sono 780x1688 = **1,32 Mpx**, cioe' ~10,5 MB di traffico per passata,
cioe' **circa 0,5-1,2 ms** su questo hardware - piu' il costo fisso di
store/load della piastrella a ogni cambio di render target.

Il budget: 16,6 ms per stare a 60 fps, di cui la GPU ne puo' usare
realisticamente 10-11 (il resto e' CPU, scroll, layout, GC).

**Quindi, la conclusione operativa: a DPR 2 hai spazio per 8-12 passate a
schermo intero. A DPR 3 ne hai 4-6. A DPR 1.5 ne hai 18-25.**

Ecco perche' la risoluzione e' la leva grossa e tutto il resto e' contorno.

## La tabella

Costo stimato per frame sul dispositivo di riferimento, a DPR 2.

| # | tecnica | costo GPU | costo CPU | memoria | verdetto |
|---|---|---|---|---|---|
| 1 | griglia su velocita' | **< 0,1 ms** | rischio reflow | - | **sempre accesa** |
| 2 | transizione con rumore | **< 0,1 ms** | - | 64-256 KB (texture) | **sempre accesa** |
| 3 | noise nel vertex | **< 0,2 ms** | - | - | **sempre acceso** |
| 3b | noise a schermo intero nel fragment | **2-6 ms** | - | - | **una volta sola in un RT condiviso, o mai** |
| 4 | GPGPU 16k particelle | sim 0,1 ms + disegno **1,5-5 ms** | - | 1-8 MB | **si', ma conta l'overdraw** |
| 4b | GPGPU 100k particelle | disegno **8-20 ms** | - | 8-30 MB | **no su fascia media** |
| 5 | instancing (< 5k, statiche) | **0,2-0,8 ms** | ~0 | - | **si'** |
| 5b | instancing con `setMatrixAt` ogni frame, 10k | vedi sopra | **3-8 ms** | 640 KB/frame di upload | **no** |
| 6 | bloom 5 livelli | **4-8 ms** | - | 3-6 MB di RT | **primo a essere degradato** |
| 6b | grana + vignetta + aberrazione + dither, fusi | **0,6-1,2 ms** (una passata) | - | - | **si', sempre** |
| 6c | gli stessi, in quattro passate separate | **2,5-5 ms** | - | - | **errore, non scelta** |
| 7 | vetro strada (a), cubemap + 3 raggi | **0,5-2 ms** (dipende dall'area) | - | 0,5-2 MB | **si', se e' piccolo** |
| 7b | vetro `transmission` di three.js | **8-25 ms** | - | + una scena | **no** |
| 8 | piani sincronizzati al DOM | **~0** | 0,3 ms se fatto bene, **5-15 ms se rimisuri ogni frame** | - | **sempre acceso** |
| 9 | testo MSDF | **< 0,2 ms** | layout, meglio su worker | 100-300 KB | **si'** |
| 10 | fluido, solutore 25 passate a 128x128 | **6-14 ms** (dominato dai cambi di RT) | - | 1-2 MB | **al limite** |
| 10b | fluido, dissipazione a 1/4 di risoluzione | **0,3-0,8 ms** | - | 300 KB | **si'** |

## Chi si spegne per prima - l'ordine, con le prove

Questo non e' opinabile: si legge nei bundle. L'ordine sotto e' quello di
**Lusion**, che e' il caso meglio documentato, incrociato con Apple.

**0. La risoluzione, prima di ogni altra cosa.**
`DPR = Math.min(1.5, window.devicePixelRatio)`. Misurato su iPhone 13 (390x664
CSS, DPR 3): il buffer e' **585x996**. Sono 583.000 pixel invece di 2.330.000:
**un quarto**. Piu' un tetto assoluto `MAX_PIXEL_COUNT = 2560*1440`, applicato
anche su desktop.
**Questa singola riga vale piu' di tutte le altre degradazioni messe insieme.**
Quadruplica il numero di passate che ti puoi permettere.

**1. Il vetro.** E' la prima cosa *rimossa*, non ridotta:
`browser.isMobile || sphereData.push(...)`. Su telefono la pila di croci e' 22
oggetti invece di 24, e **nessuna rifrazione**.

**2. La qualita' del bloom.** `USE_CONVOLUTION` e `USE_HD` valgono entrambi
`!isMobile`. Il bloom resta, ma nella variante compilata economica.

**3. Il conteggio delle particelle.** `SIM_TEXTURE_HEIGHT` da 192 a 128: da
24.576 a 16.384, **meno un terzo**. Non zero: un terzo.

**4. La geometria decorativa che non racconta niente.** Il nastro 3D della
sezione capability **non viene istanziato affatto** (`browser.isMobile ||
(this.lineVisual = new Line(2), ...)`). Non nascosto: assente.

**5. L'audio, tutto.** `USE_AUDIO = browser.isSupportOgg && !browser.isMobile`.
Zero `.ogg` scaricati.

**6. Gli asset, per sostituzione di stringa.** `cross.buf` -> `cross_ld.buf`
(-56%), `matcap.exr` -> `matcap_ld.exr` (-71%), e per i media una `replace`
sul percorso: `/video` -> `/mobile_video`, `/image` -> `/mobile_image`. Il video
del reel passa da 4,98 MB a 2,27 MB.

**Cosa NON tocca, ed e' altrettanto istruttivo:** la sequenza del tunnel,
l'astronauta, la rottura del vetro, la fisica della pila, SMAA, lo screen paint,
il blue noise. E la lunghezza dello scroll: **56,8 schermate su telefono contro
55,8 su desktop.** Non hanno accorciato niente.

Risultato: **24,1 MB su desktop, 10,5 MB su telefono (-56%)**, stessa esperienza.

## I due modelli opposti, e vale la pena vederli affiancati

| | **Lusion** | **Apple** | **Igloo** |
|---|---|---|---|
| filosofia | ridimensiona | **spegne** | non fa niente |
| leva principale | DPR 1.5 + rimozioni chirurgiche | 15 validatori: se **uno** scatta, va alla versione base | - |
| il telefono e' | un dispositivo con meno pixel | **una condizione di degradazione** (`iOS`, `iPad`, `Android` sono tre validatori a se') | uguale al desktop |
| peso mobile | 10,5 MB (-56%) | fallback statico | **18,39 MB, identici** |

Apple ha anche il trucco che nessuno copia e tutti dovrebbero: **rileva il
Risparmio energetico**, che nessuna API espone, provando a far partire un video
base64 di un fotogramma. Se `play()` rigetta con `NotAllowedError`, e' in
risparmio energetico, e degrada l'intera pagina.

E la guardia che costa dieci righe: `data-load-timeout="3000"`. Se
l'animazione non e' pronta in tre secondi, si ripiega sul fotogramma statico.

## I due vincoli duri che non sono fps

**Memoria.** Il numero da `_PRESTAZIONI.md`: su un iPhone SE 3 si va in crash
intorno ai **100 MB** di roba decodificata. Una texture 2048x2048 RGBA non
compressa e' 16 MB. Quattro texture del genere e sei fuori. **E' per questo che
KTX2/Basis non e' ottimizzazione di rete ma di memoria video**: una texture
compressa per la GPU resta compressa *in memoria*, una PNG no.

**Il limite del canvas su iOS: 16.777.216 pixel.** Superato, il canvas smette di
disegnare senza errori. A DPR 3 su un tablet ci si arriva.

## Come misurare invece di stimare

```js
// numero di passate reali: contale, non indovinarle
console.log(renderer.info.render);
// { calls, triangles, points, lines, frame }

// il conteggio dei programmi compilati: se cresce durante lo scroll,
// stai compilando shader a runtime ed e' quello che fa lo scatto
console.log(renderer.info.programs.length);

// il tempo GPU vero, non quello di rAF
const ext = renderer.getContext().getExtension('EXT_disjoint_timer_query_webgl2');
```

E la misura piu' onesta di tutte, che costa zero: **abbassa `DPR` a 1 e vedi se
gli scatti spariscono.** Se spariscono, sei limitato dal riempimento e nessuna
ottimizzazione di geometria ti servira'. Se restano, il problema e' CPU e la
prima cosa da guardare e' `getBoundingClientRect()`.

---

# 12. Da cosa si comincia: le quattro tecniche che coprono il 90%

Se dovessi insegnare questo mestiere a qualcuno partendo da zero, questo e'
l'ordine, e le ragioni non sono di gusto.

## Prima - il piano WebGL sincronizzato al DOM (tecnica 8)

**Perche' e' la prima.** E' su 13 siti su 16. E' l'unica che cambia
l'*architettura* invece che l'aspetto: una volta che sai mettere un piano dove sta
un `<img>`, tutte le altre nove tecniche diventano "cosa scrivo nel fragment
shader di quel piano". Senza questa, ognuna delle altre e' un esperimento isolato.

E ha un beneficio commerciale diretto: il sito **resta un sito**. Il testo e'
selezionabile, i link sono link, il CMS e' quello che il cliente gia' ha, il
layout lo fa il CSS. Puoi vendere un sito WebGL a un cliente che ha bisogno di
SEO.

**Cosa impari facendola:** camera ortografica in unita' pixel, ciclo di render
unico, gestione delle misure senza layout thrashing, ciclo di vita del canvas
attraverso le transizioni di pagina.

**Come sai di averla finita:** apri il sito, fai `img { visibility: hidden }` in
console, e i piani WebGL sono *esattamente* dove erano le immagini, anche dopo un
resize e dopo un cambio pagina.

## Seconda - la rivelazione con mappa di rumore (tecnica 2)

**Perche' e' la seconda.** Ha il rapporto resa/costo piu' alto delle dieci. E' una
riga di `smoothstep`. Costa un fetch. Funziona identica su qualunque telefono.
E copre un ventaglio enorme di casi con lo stesso codice: entrata di un'immagine,
transizione fra due immagini, hover, rivelazione di un titolo, tendina fra
pagine.

**Cosa impari facendola:** che la maschera e' l'unita' di base di tutta la grafica
WebGL da sito. Il resto sono maschere piu' complicate.

## Terza - la velocita' di scroll dentro lo shader (tecnica 1)

**Perche' e' la terza.** E' quella che fa dire "questo sito e' fluido". E'
l'unica delle prime tre che richiede lavoro sul *tempo* e non sullo spazio, e
insegna la cosa piu' difficile del mestiere: **lo smorzamento**. Attacco veloce,
rilascio lento, clamp, aggancio a zero.

**Cosa impari facendola:** che i valori vanno smussati prima di entrare nello
shader, non dentro. E che ogni effetto ha bisogno di un numero fra 0 e 1 che lo
piloti - la convenzione `u_showRatio` / `u_activeRatio` di Lusion e' la forma
matura di questa idea, e vale la pena adottarla subito.

## Quarta - una sola passata finale di post-produzione (tecnica 6, senza bloom)

**Perche' e' la quarta.** Grana, vignetta, aberrazione ai bordi, saturazione e
dithering, tutti nello stesso shader. **Una passata, meno di un millisecondo.**
Cambia il registro di tutta la pagina: e' la differenza fra "un canvas dentro un
sito" e "un'immagine".

**Perche' il bloom non e' qui.** Costa dieci volte le altre quattro messe insieme
ed e' la prima cosa che dovrai spegnere sul telefono. Impararlo quinto, non
quarto.

## Dopo, in ordine di utilita' decrescente

5. **Instancing** (tecnica 5) - quando ti serve, ti serve, e non e' difficile.
6. **MSDF** (tecnica 9) - se e solo se il titolo deve stare dentro la scena. Con
   la regola: display type si', testo di lettura mai.
7. **GPGPU** (tecnica 4) - il primo scalino davvero ripido. Bellissimo,
   spendibile, e usato da meno siti di quanto sembri.
8. **Vetro** (tecnica 7) - impara la strada (a), la cubemap. La (c) e' una trappola.
9. **Bloom** (tecnica 6.1) - con la disciplina della taratura per scena.
10. **Fluidi** (tecnica 10) - e impara la strada B. La A e' un esercizio, non un
    prodotto.

## L'avvertenza che vale piu' di tutto l'elenco

Delle dieci tecniche, **nessuna ha fatto vincere un premio da sola**. Nella
tabella dei sedici siti c'e' **Mosby's Files**, Site of the Day del 13/08/2026,
**senza un solo canvas WebGL attivo**. E c'e' **Obys**, che vince premi con
**120 KB di JavaScript, zero librerie di animazione, Web Animations API nativa**
e un contesto WebGL2 scritto a mano.

Il ritorno per ora di studio, secondo i dati di questa cartella, e' in
quest'ordine: **la tipografia** (due gradini, rapporto fra 6x e 14x), **il ritmo
dello scroll**, **il preloader**, **il suono**, e *poi* il WebGL. Le dieci
tecniche qui dentro servono a dare la superficie; non sostituiscono il progetto.

---

# 13. Le librerie che le regalano gia' fatte, con licenza

## Il quadro

| libreria | licenza | quali tecniche copre | stato |
|---|---|---|---|
| **three.js** | **MIT** | base di tutto; `InstancedMesh` (5), `MeshPhysicalMaterial.transmission` (7, ma vedi avvertenza) | vivo, ~54 M download/mese |
| **OGL** | **MIT** | alternativa leggera a three.js; usata da Basement (`ogl-starter`) | vivo |
| **@react-three/fiber** | **MIT** | tutto, in React | 31,7k stelle, push agosto 2026 |
| **@react-three/drei** | **MIT** | `Instances` (5), `MeshTransmissionMaterial` (7), `Text` (9), `useFBO` (4), `shaderMaterial` | 9,8k stelle, vivo |
| **postprocessing** (vanruesc) | **Zlib** | **tutta la tecnica 6**: bloom, `ChromaticAberrationEffect`, `NoiseEffect`, `VignetteEffect`, e soprattutto **`EffectPass`** | 3,5 M download/mese, push agosto 2026 |
| **@react-three/postprocessing** | **MIT** | la stessa, in React | vivo |
| **troika-three-text** | **MIT** | **tecnica 9** chiavi in mano: genera l'atlante SDF a runtime, layout su worker, niente build step | vivo |
| **webgl-noise** (Ashima / Gustavson) | **MIT** | **tecnica 3**: `snoise` 2D/3D/4D, `cnoise`, `pnoise` | fermo ma definitivo |
| **glsl-noise** (npm, glslify) | **MIT** | lo stesso, impacchettato | fermo |
| **simplex-noise** (npm) | **MIT** | tecnica 3 lato CPU. Usata da 2xA | vivo |
| **lenis** | **MIT** | la sorgente di velocita' per la **tecnica 1** | 15,4k stelle, push agosto 2026 |
| **tempus** | **MIT** | un solo `requestAnimationFrame` per tutta l'app | vivo |
| **GSAP 3.15** | **non open source**, ma **gratis anche in commerciale** dal 30/04/2025 | il tempo, il pilotaggio delle uniform, ScrollTrigger, SplitText | vivo |
| **detect-gpu** | **MIT** | la decisione della sezione 11: che qualita' servire | vivo |
| **maath** | **NESSUNA** | utilita' matematiche | arriva come dipendenza di `drei`: **non aggiungerla a mano** |
| **draco** (Google) | **Apache-2.0** | compressione geometria (tecniche 4, 5) | vivo |
| **basis/KTX2** (Binomial/Khronos) | **Apache-2.0** | texture compresse per la GPU - **il rimedio al vincolo di memoria** | vivo |
| **meshoptimizer** | **MIT** | alternativa/complemento a Draco | vivo |
| **basementstudio/shader-lab** | **Apache-2.0** | comporre e impilare shader | 663 stelle in 5 mesi, giovane |
| **darkroomengineering/aniso** | **MIT** | ASCII da immagine in WebGL | vivo |
| **Cuberto/mouse-follower** | **MIT** | cursori (fuori dalle dieci, ma ricorre ovunque) | fermo al 2023, funziona |
| **activetheory/svg2msdf** | **licenza non dichiarata** | genera MSDF da SVG (tecnica 9) | usare con cautela: senza licenza |
| **activetheory/split-text** | **MIT** | alternativa gratuita a SplitText | vivo |
| **PavelDoGreat/WebGL-Fluid-Simulation** | **MIT** | **tecnica 10**, strada A, chiavi in mano | il riferimento del settore |

## Le tre cose da sapere prima di installare

**1. `postprocessing` e' la piu' importante di tutte, e non e' MIT ma Zlib.**
Zlib e' permissiva quanto MIT (uso commerciale libero, nessun obbligo di
attribuzione visibile), ma **e' una licenza diversa e va scritta giusta nel
registro delle dipendenze** se un cliente enterprise fa la revisione legale.

Il motivo per cui e' la piu' importante: la classe `EffectPass` **fonde piu'
effetti in un solo shader e una sola passata**. E' esattamente la regola della
sezione 6, automatizzata. Grana + vignetta + aberrazione + tone mapping dentro
un `EffectPass` = una passata. Farlo a mano richiede disciplina; farlo con
`EffectPass` e' il default.

**2. GSAP e' gratis ma non e' open source, ed e' una distinzione che conta.**
Dal 30/04/2025 (versione 3.13.0) **tutti i plugin Club sono gratuiti anche in
uso commerciale**: SplitText, MorphSVG, ScrollSmoother, DrawSVG, Inertia,
ScrambleText. Ma il repository non ha una licenza open: e' una licenza
proprietaria che concede l'uso gratuito. In pratica: si usa senza pagare, non si
puo' fare un fork e ridistribuirlo. Per un preventivo va bene; per un prodotto
che rivendi come libreria, leggila.

**3. `maath` non ha licenza.** Arriva comunque installata come dipendenza di
`drei`, quindi la usi di riflesso. Non metterla fra le dipendenze dirette.

## Cosa NON esiste come libreria, e va scritto

Vale la pena dirlo esplicitamente, perche' e' dove finiscono le ore:

- **La sincronizzazione DOM-WebGL (tecnica 8).** Non c'e' una libreria buona.
  `drei/Html` fa il contrario (DOM sopra il 3D). `locomotivemtl/webgl-images`
  (MIT, 52 stelle) e' la cosa piu' vicina, ma e' del 2024 e fa solo immagini.
  **Ogni studio se l'e' scritta.** E' anche il motivo per cui e' la prima cosa da
  imparare: e' il pezzo che non puoi comprare.
- **Lo smorzamento asimmetrico della velocita' di scroll (tecnica 1).** Trenta
  righe, nessuna libreria.
- **La dispersione a tre raggi (tecnica 7).** `MeshPhysicalMaterial` ha
  `dispersion` dalla r163, ma passa da `transmission`, che e' la strada cara. La
  versione economica di Resn e' venti righe e non ha un pacchetto.
- **Il sistema del secondo ordine** (`SecondOrderDynamics` di Lusion: frequenza,
  smorzamento, risposta iniziale, piu' la variante robusta ai `deltaTime`
  lunghi). E' un file solo, non c'e' su npm in una forma decente, ed e' il motivo
  per cui il movimento di Lusion sembra materia invece che transizione CSS.

## Lo stack che consiglierei, in una riga

Per un sito nuovo, oggi:

```
three + postprocessing + lenis + gsap
```

piu' `troika-three-text` se il testo deve entrare nella scena, `draco` e `ktx2`
appena ci sono modelli o texture pesanti, e `@react-three/fiber` + `drei`
**solo** se il progetto e' gia' React per altri motivi. Tre studi su sedici non
usano GSAP e due non usano nemmeno three.js: **la libreria non e' il livello di
qualita'**. Il livello e' il controllo su cosa succede a ogni frame.

---

# Appendice - come rifare la verifica

Gli hash dei bundle cambiano a ogni deploy. Il metodo no.

```bash
# 1. prendi l'HTML e trova gli script
curl -s --compressed https://<sito>/ | grep -oE 'src="[^"]+\.js"'

# 2. scarica il bundle (SEMPRE --compressed: alcuni CDN servono solo brotli)
curl -s --compressed -o bundle.js "https://<sito>/<percorso>.js"

# 3. il GLSL e' dentro le stringhe e il minificatore non lo tocca: cercalo
grep -oE 'uniform (float|vec[234]|sampler2D) [a-zA-Z_]+' bundle.js | sort -u

# 4. le firme che identificano una tecnica in un colpo solo
grep -c 'taylorInvSqrt'   bundle.js   # webgl-noise -> tecnica 3
grep -c 'divergence'      bundle.js   # solutore Navier-Stokes -> tecnica 10, strada A
grep -c 'getBoundingClientRect' bundle.js  # tecnica 8
grep -c 'InstancedMesh'   bundle.js   # tecnica 5
grep -c 'median\|fwidth'  bundle.js   # MSDF -> tecnica 9
grep -c 'luminosityThreshold' bundle.js    # bloom -> tecnica 6

# 5. e prova SEMPRE la sourcemap a mano, anche se il commento non c'e'
curl -sI "https://<sito>/<percorso>.js.map" | head -3
#    200 con content-type: text/html = fallback SPA, NON una mappa
```

Le tre firme piu' redditizie, in ordine: `taylorInvSqrt` (ti dice subito se il
rumore e' webgl-noise o roba loro), `divergence`/`pressure` insieme (ti dice se
c'e' un solutore vero o un finto fluido), e `u_dom` o `domWH` (ti dice se il
canvas insegue il DOM o se il DOM non c'e').

---

## Cosa NON e' verificato in questa scheda

- **I costi in millisecondi della sezione 11.** Sono stime su un modello
  dichiarato, non misure. Il modello e' riproducibile; i numeri vanno rifatti su
  hardware vero prima di finire in un preventivo.
- **La resa visiva degli snippet.** Non ho eseguito niente: non e' stato aperto
  nessun browser per scrivere questa scheda. Gli snippet **[REALE]** sono
  fedeli al byte; quelli **[CANONICO]** sono corretti come struttura ma vanno
  provati.
- **Quale libreria di fluido usi davvero Lando.** I nomi degli uniform
  (`boundarySpace`, `cellScale`, `px`, `dt`, `viscous`) combaciano con i port
  three.js di Stable Fluids che circolano, ma **non ho la conferma dello studio**
  e non ho confrontato riga per riga con un repository specifico.
- **I conteggi di particelle di Active Theory** (100k home / 150k work) vengono
  da `uil.json`, che e' la loro configurazione: e' un dato dichiarato da loro,
  non da me contato a schermo.
- **Il comportamento con `prefers-reduced-motion`** su questi siti: ispezionato
  solo su Apple (dove **spegne, non attenua**: 97 occorrenze nel JS contro una
  sola `@media` nel CSS). Sugli altri non l'ho verificato.

