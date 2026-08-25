# 2xA Studio

- **URL**: https://2xa.studio
- **Premio**: Awwwards **Site of the Day** del 31/07/2026 + **Developer Award** (fonte: https://www.awwwards.com/sites/2xa-studio). Punteggi: SOTD 7,22/10 (Design 7,32 · Usability 6,92 · Creativity 7,45 · Content 7,28). Developer Award 7,53/10, scomposto in Semantics/SEO 7,40 · **Animations/Transitions 8,20** · Accessibility 6,60 · WPO 8,00 · Responsive 7,40 · Markup/Meta-data 7,20.
- **Studio**: 2xA Studio (Amsterdam + Atene). Crediti Awwwards: 2xA Studio (PRO), Loonatiks Design Crew, yannickgregoire (PRO). Quattro co-fondatori dichiarati nella pagina About: Yannick (web developer / creative coder, Amsterdam), Maria (graphic + type designer, Atene), Eveleen (web developer / project manager, Amsterdam), Dimitris (graphic designer / art director, Atene).
- **Anno**: sito pubblicato/aggiornato 2026 (`<meta name="date" content="2026-06-23">`; `lastmod` in sitemap fra 30/04/2026 e 12/06/2026).
- **Letto il**: 13/08/2026

Metodo: tutto letto da `curl` sull'HTML servito, sul CSS (`style-TyInWDPO.css`, 98,9 KB non compresso) e sul bundle JavaScript (`main-CzlVfecv.js`, 735 KB non compresso) piu' i 26 chunk dinamici. **Nessuna sessione di browser aperta**, quindi nessuna misura runtime: tempi, FPS e ampiezze reali degli effetti di scroll NON sono stati campionati.

---

## Cosa vende

Servizi di studio: brand strategy, brand identity, tipografia su misura, web design e web development "code-first", motion e sistemi generativi. Il prodotto vero che il sito vende e' **la capacita' di scrivere codice**: ogni sezione della pagina e' una dimostrazione di un algoritmo diverso (quadtree, curl noise, dithering di Bayer, campo di rumore simplex su griglia di caratteri).

## A chi

Committenti culturali e brand che comprano identita' complete (festival, piattaforme editoriali, studi di gaming) e che decidono anche in base al portfolio dello studio davanti a una giuria. Uscendo dal sito il compratore deve pensare: *questi non montano template, scrivono il motore.* La pagina About mette il manifesto sulla "computational design" prima dei servizi: il posizionamento e' intellettuale prima che commerciale.

## Idea regista

**La griglia monospaziata come materia unica**: tutto — testo, immagini, transizione fra pagine, logo — viene ridotto a una griglia di celle quadrate e poi spostato, rimescolato o quantizzato da un algoritmo.

## Il momento

Non c'e' un unico momento-firma; ce ne sono tre, e sono tutti algoritmici. Il piu' forte e' il **manifesto** (home, secondo blocco, fondo chiaro): i paragrafi di testo mono vengono ridisegnati carattere per carattere su un canvas 2D e spostati da un campo di *curl noise*, con l'ampiezza dello spostamento pilotata dal progresso di scroll. Il testo si liquefa scendendo e si ricompone risalendo. Il secondo e' la **transizione fra pagine** (vedi sotto): una tendina che sale con un bordo a retino Bayer 8x8 deformato dal rumore simplex. Il terzo e' il **quadtree** sulle miniature dei progetti: l'immagine appare come una suddivisione ricorsiva in rettangoli di colore medio, poi si dissolve nella foto vera.

## Struttura, sezione per sezione

Home (`/`, `body.theme--dark.template--home`):

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |
|---|---|---|---|
| Intro (overlay `.intro`, solo primo caricamento) | Logo SVG a strisce + 7 parole "Code-Driven / Design / Studio / Between / Amsterdam / & / Athens" con effetto scramble | Aspetta | ~4 s a tempo, non a scroll |
| Reel (`.welcome .reel`, `data-hero`) | Video 2xA a tutto schermo + logo a strisce che si compone sotto | Scrolla | `.reel` alto **150vh** → ~0,5 schermate di progresso utile |
| Generative Code Explorations (`.experiments`) | 6 video in loop su griglia 12 colonne (posizioni 1/7/4/10 su span 3) | Scrolla | ~1-1,5 schermate |
| Footer intermedio (`.welcome .footer`) | Instagram / Behance / hello@2xa.studio / Privacy / Studio Sounds | Clicca | in flusso |
| Manifesto (`.manifesto.theme--light`) | Titolo gigante "Code-Driven Design Studio Between Amsterdam & Athens" + 4 colonne di testo mono liquefatto su canvas | Scrolla | `padding: 25vh` sopra e sotto → ~2 schermate |
| Selected Projects intro (`.projects-intro.theme--light`) | Titolo "Selected Projects" + link "View All (5)" + due paragrafi mono | Scrolla | ~1 schermata |
| Projects (`.projects.theme--light`) | 3 progetti (01 ABR Festival, 02 Buna Tetu, 03 Miao World) con miniatura quadtree, descrizione e etichetta "View project details" che segue il mouse | Passa sopra / clicca | ~2-3 schermate |
| Awards & Achievements (`.awards`) | Tabella su subgrid 12 colonne: progetto / organizzazione / premio / anno, 2022-2026 | Passa sopra le righe (riempimento a barra) | ~1,5 schermate |
| Footer finale (`footer[data-footer]`) | Logo a strisce che si ricompone + link | — | `min-height: 100dvh` → 1 schermata piena |

Altre pagine: `/about` (manifesto a scroll orizzontale di lettura + Fields of Expertise, 7 servizi + **Team Members in 3D** + Awards), `/projects` (5 progetti), `/projects/<slug>` (hero video con quadtree, meta in griglia, blocchi immagine/video a colonne), `/contact` (una sola schermata: **canvas a schermo intero** con testi trascinabili).

Sotto ogni sezione c'e' una riga in monospace maiuscolo in `position: sticky; bottom: 0; mix-blend-mode: difference` — `.subtitle` — che fa da didascalia: `ON COMPUTATION AS A WAY OF THINKING`, `MADE WITH CARE AND A LOT OF CODE`, `GOOD WORK TENDS TO GET NOTICED`, `PRACTICE SHAPED BY CODE DATA AND FORM`, `TEAM MEMBERS ( IN NO PARTICULAR ORDER )`.

## L'esperienza in ordine di tempo

Primi dieci secondi, dal codice di `intro-CeG7wvj2.js` (tempi dichiarati nel sorgente, **non cronometrati**):

- **0 s** — L'HTML arriva gia' completo (rendering server-side, PHP/Kirby). Sopra tutto c'e' `.intro` (`position: fixed; z-index: 500`) con fondo `--black`. Il bundle chiama subito `getShader().showInstant()`: il canvas WebGL della transizione si mette a `uProgress = 1`, cioe' **coperto**, senza animazione. Non si vede niente della pagina.
- **0-1,5 s** — Le strisce del logo SVG (`.line`) partono da `translateX(-100%)`. Ogni striscia parte con ritardo `|indice - centro| * 0,125 s`, tween `x: "0%"`, `duration: 2`, `ease: "expo.in"`: il logo entra dai lati verso il centro, **dal fuori verso dentro**.
- **1,5 s** — `setTimeout(1500)` fa partire i sette `data-typer`: "Code-Driven", "Design", "Studio", "Between", "Amsterdam", "&", "Athens" con ritardi scalati da 0,15 s a 0,95 s. Ogni carattere passa per 3 cicli di classi casuali (`charFill`, `charInverse`, `charAccent`, `charAccentInverse`, `charAccentFill`, `charBorder`) a 20 fps prima di stabilizzarsi: effetto "decodifica", non tipografia.
- **2-4 s** — Le stesse strisce del logo escono: secondo tween `x: "100%"`, `delay: ritardo + 2`, `duration: 2`, `ease: "expo.out"`.
- **4 s** — `gsap.delayedCall(4)`: `.intro` diventa `pointer-events: none`, i typer vanno in `typer:out`, `.background` va a `display: none` e parte `shader.hide()` — tween di `uProgress` da 1 a 0, `duration: 3`, `ease: "expo.out"`, `delay: 1`. La tendina a retino si scioglie dall'alto verso il basso. Finita, `.intro` viene rimosso dal DOM.
- **~5 s in poi** — Si vede il reel. L'header e' `position: fixed`, `mix-blend-mode: difference`, e contiene due orologi live (`ATH(GR)` e `AMS(NL)`) con i due punti che lampeggiano ogni secondo, sfalsati di 100 ms l'uno dall'altro.

Poi, a scroll:

1. **Reel** — `hero-345nhrs9.js` crea uno ScrollTrigger su `.reel` (`start: "top top"`, `end: "bottom bottom"`). Da `progress` ricava due valori: `--linear-progress` (grezzo) e `--bezier-progress` (passato per una cubica personalizzata `(0,5 · 0 · 1 · 0,5)`). Entrambi entrano in un `gsap.quickTo` con `duration: 1, ease: "expo.out"`, quindi lo scroll non muove direttamente: **alimenta un inseguitore**. Il video si alza di `-50vh * --bezier-progress`, il logo scende di `+10vh * --linear-progress`.
2. Insieme, il `Printer` (`printer-DsuDC34r.js`) prende ogni striscia `.line` del logo SVG e la trasla in X di una frazione della propria larghezza: ogni striscia ha una finestra di attivazione `[i/n, (i+1)/n]` sul progresso, e il valore viene arrotondato a `0,05` — cioe' **quantizzato a 20 gradini**, perche' il logo si "stampi" a scatti e non fluidamente.
3. **Experiments** — ogni video ha `--experiment-progress` da un proprio ScrollTrigger (`top bottom` → `bottom top`) con progresso invertito, e si muove di `translate3d(0, -200vh * p + 100dvh, 0)`. Ritardi CSS scalati `--delay` da 0,05 s a 0,3 s.
4. **Manifesto** — vedi sotto, e' l'effetto principale.
5. **Projects / Services / Awards** — stessa meccanica dei progetti: `--project-progress` / `--service-progress` da ScrollTrigger, inseguito da `quickTo(duration: 1, ease: "expo.out")`, applicato a `translateY(-200vh * p + 100dvh)` sull'`.inner`. All'`onEnter` la card manda `typer:in` al titolo, che si decodifica.
6. **Card che segue il mouse** — `card--ezkPMCY.js`: l'etichetta "View project details" (`mix-blend-mode: difference`) segue **solo la Y** del cursore, con `quickTo(duration: 0.6, ease: "expo.out")`, e la Y viene rimappata perche' resti dentro i bordi della miniatura. Sul `mouseenter` parte anche `typer:in` sull'etichetta.

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| Tendina di transizione (`[data-fade]`) | `uProgress` di uno shader GLSL a schermo intero | stato (visita Swup) | `expo.out`, 1 s in copertura / 3 s in scoperta con `delay: 1` | **Three.js r184**, `ShaderMaterial`, quad ortogonale 2x2. Retino Bayer 8x8 + rumore simplex 2D. Vedi il codice sotto |
| Manifesto (`data-manifesto`) | Ogni cella di carattere ridisegnata con offset da *curl noise* | scroll (`ScrollTrigger` su `.manifesto`) | `quickTo` su `threshold`, `duration: 2` (gradiente "sine") o `1` ("linear"), `power3.out` | Canvas **2D**, non WebGL. `simplex-noise` npm |
| Miniature progetti (`data-quadtree`) | Rivelazione e dissolvenza di N foglie di un quadtree | tempo, innescato da `IntersectionObserver` (`rootMargin: "-15% 0px 0px 0px"`) | `power2.inOut`, `duration: 0.8` (default) | Canvas **2D**. Profondita' 5, soglia 128 sulle pagine reali |
| Contatto (`data-contact-canvas`) | Caratteri di 6 paragrafi spinti su una griglia, con collisione contro le parole-ostacolo | trascinamento (**GSAP Observer**, `type: "pointer,touch"`) oppure campo di rumore simplex 3D | attrito esponenziale `0,85` per frame a 60 Hz, velocita' clampata a ±1000 | Canvas **2D**. Cliccando su "hello"/"@2xa"/".studio" → `mailto:hello@2xa.studio` |
| Logo (`data-printer`) | 12 strisce SVG traslate in X | scroll (hero e footer) | `quickTo(duration: 1, ease: "expo.out")` + quantizzazione a 0,05 | Effetto "stampante a testina" |
| Testo `data-typer` | Ogni carattere cambia classe fra 6 varianti a caso | tempo (`setInterval` a 20 fps di default) | ritardo per carattere `smoothstep(indice/(n-1), 0…0,75 → 0,75…0)` | Non e' uno scramble di lettere: e' uno **scramble di stili** (riempito / invertito / accento / bordo) |
| Titoli di sezione (`.section-title`) | `translateY` di ±30-60dvh sui blocchi del titolo | scroll (`--progress` da `in-D6omnzjw.js`) | CSS `transition: transform .1s var(--ease-out)`, valore arrotondato con `round(nearest, …, 3vh)` | Titoli **dietro** il contenuto, in `--foreground-dim` |
| Team 3D (`data-team-glb`) | Modello GLB in rotazione automatica | tempo (`OrbitControls.autoRotate`, `autoRotateSpeed: 1.5`) | `enableDamping: true`, `dampingFactor: 0.05` | Three.js + **DRACOLoader** (`/static/draco/`), `team-compressed.glb` di 2,0 MB. Zoom e pan disattivati, angolo polare bloccato a 90° |
| Voci Awards / membri team | Barra di riempimento che scorre da sinistra | hover (CSS puro) | `@keyframes hover-fill-in/out`, `cubic-bezier(0,1,0,1)`, durate scalate 0,3/0,4/0,5/0,6 s per colonna | Nessun JS. La colonna piu' a destra si riempie per ultima |
| Marquee (`marquee-BufYXjYH.js`) | `translate3d` percentuale continuo | tempo **+ velocita' e direzione dello scroll Lenis** | integrazione manuale: `progress -= dir*0.0085*dt/ratio` e `-= velocity*dt*0.005/ratio` | Presente nel bundle ma **nessuna pagina pubblica lo usa** |
| Grana (`.noise`) | Un PNG di rumore che salta in 10 posizioni | tempo | `animation: noise 2s steps(1) infinite` | `opacity: .3`, `mix-blend-mode: hard-light`, `z-index: 1000` sopra tutto |
| Spinner nel footer | Il carattere ciclato fra `/ - \ |` | velocita' di scroll Lenis (accumulatore, soglia 40) | nessuna | Un indicatore di scroll da terminale |

**Il rAF e' uno solo.** `xv` (classe `initScroll`) crea Lenis con `autoRaf: false`, poi fa `gsap.ticker.remove(gsap.updateRoot)` e `gsap.ticker.lagSmoothing(0)`, e registra un unico callback su **Tempus** (la libreria rAF di darkroom.engineering, con priorita' e budget `idle`): dentro chiama `lenis.raf(t)` e `gsap.updateRoot(t/1000)`. Ogni componente animato si aggancia allo stesso Tempus con `Tempus.add(cb, priorita)` e si stacca quando esce dal viewport. **Un solo `requestAnimationFrame` in tutto il sito.**

---

## La transizione fra pagine — nel dettaglio

E' l'unico sito del gruppo con una libreria di transizione vera: **Swup 4.8.2**, letta nel bundle (`this.version="4.8.2"`).

### Come la configurano

Dal fondo di `main-CzlVfecv.js` (deminificato nei nomi, il resto e' testuale):

```js
this.typer      = document.querySelector("[data-typer-transition]");
this.typerWords = this.typer ? JSON.parse(this.typer.dataset.typerWords || "[]") : [];
this.shader     = getShader();          // singleton su [data-fade]

this.swup = new Swup({
  containers: ["main"],
  animateHistoryBrowsing: false,
  animationSelector: "[data-transition]",
  plugins: [
    new SwupA11yPlugin,
    new SwupPreloadPlugin,
    new SwupHeadPlugin,
    new SwupBodyClassPlugin,
    new SwupScrollPlugin({ animateScroll: false })
  ]
});

// USCITA: sostituisce del tutto il meccanismo a classi CSS di Swup
this.swup.hooks.replace("animation:out:await", async (visit) => {
  const word = this.typerWords.length
    ? this.typerWords[Math.floor(Math.random() * this.typerWords.length)]
    : "";
  this.updateTransitionTyper(word);      // typer:reset + typer:inout
  document.querySelector("[data-transition]").querySelector("article");
  await this.shader.show();              // <-- ATTESO
});

// ENTRATA: NON attende
this.swup.hooks.replace("animation:in:await", async () => {
  document.querySelector("[data-transition]").querySelector("article");
  this.shader.hide();                    // <-- NON atteso
});

this.swup.hooks.on("animation:out:end", () => this.destroyComponents());
this.swup.hooks.on("page:view",        () => {
  this.trackPageview();
  this.initComponents();
  this.refreshScrollTriggers();          // setTimeout 500 → ScrollTrigger.refresh(true)
});
```

I cinque plugin ufficiali sono identificati per la loro proprieta' `name` nel bundle: `SwupA11yPlugin`, `SwupPreloadPlugin`, `SwupHeadPlugin`, `SwupBodyClassPlugin`, `SwupScrollPlugin`. Il `BodyClassPlugin` e' quello che fa funzionare i temi: la classe `template--home` / `template--about` / `template--contact` sul `<body>` viene aggiornata a ogni visita anche se il `<body>` non e' il contenitore sostituito.

Tre dettagli che decidono la sensazione:

1. **`containers: ["main"]`** — Swup sostituisce solo `<main>`. Header, `.page-transition`, `.noise` e `.intro` stanno **fuori** da `<main>` nell'HTML e quindi non vengono mai smontati: il canvas della tendina vive per tutta la sessione (e' un singleton, `let instance = null; function getShader(){ return instance ||= new Shader(document.querySelector("[data-fade]")) }`).
2. **L'entrata non e' attesa.** `animation:out:await` fa `await this.shader.show()` (1 s), quindi Swup rimpiazza il DOM **solo a schermo coperto**. Ma `animation:in:await` chiama `this.shader.hide()` senza `await`: il hook si risolve subito, `page:view` scatta, i componenti si inizializzano e la pagina e' gia' interattiva **mentre** la tendina si sta ancora sciogliendo (tween da 3 s con 1 s di ritardo). La percezione e' "istantaneo in entrata, deciso in uscita".
3. **Zero CSS di transizione.** Nel foglio di stile non compare nessuna delle classi che Swup aggiunge da solo: `is-changing`, `is-animating`, `is-leaving`, `is-rendering`, `swup-enabled`, `swup-native` → **0 occorrenze**. Tutta la transizione e' nello shader.

### Il ramo View Transitions API dentro Swup

Nel bundle c'e' `document.startViewTransition`, ed e' esattamente il ramo nativo di Swup 4. Il codice testuale, dentro `performNavigation`:

```js
await this.hooks.call("visit:transition", visit, undefined, async () => {
  if (!visit.animation.animate) {
    await this.hooks.call("animation:skip", undefined);
    return void await this.renderPage(visit, await pageRequest);
  }
  visit.advance(4);
  await this.animatePageOut(visit);

  visit.animation.native && document.startViewTransition
    ? await document.startViewTransition(
        async () => await this.renderPage(visit, await pageRequest)
      ).finished
    : await this.renderPage(visit, await pageRequest);

  await this.animatePageIn(visit);
});
```

Il punto interessante e' **dove sta la bandiera**. Non e' una scelta globale: e' un campo dell'oggetto *Visit*, inizializzato da quello globale ma sovrascrivibile per singola navigazione. Dal costruttore della classe `Visit`:

```js
this.containers = swup.options.containers;
this.animation  = {
  animate:  true,
  wait:     false,
  name:     undefined,
  native:   swup.options.native,          // <-- copia per-visita
  scope:    swup.options.animationScope,
  selector: swup.options.animationSelector
};
```

Quindi qualunque hook `visit:start` puo' fare `visit.animation.native = true` per una sola pagina e lasciare le altre sul fallback JavaScript. E in `enable()` Swup fa il *feature detection* una volta sola e lo espone come classe sul documento:

```js
this.options.native = this.options.native && !!document.startViewTransition;
...
const html = document.documentElement;
html.classList.add("swup-enabled");
html.classList.toggle("swup-native", this.options.native);
```

**Su 2xa.studio quel ramo e' spento.** Il default di Swup e' `native: !1` (letto nell'oggetto `defaults`: `{ animateHistoryBrowsing:!1, animationSelector:'[class*="transition-"]', animationScope:"html", cache:!0, containers:["#swup"], …, linkToSelf:"scroll", native:!1, plugins:[], … }`) e la configurazione dello studio non lo tocca. Nessun `data-swup-native` nell'HTML, nessuna regola `::view-transition*` o `view-transition-name` nel CSS (0 occorrenze). Il fallback JavaScript — lo shader — e' **sempre** la strada percorsa.

Conferma quindi la regola generale della ricerca, ma la conferma dal lato piu' interessante: **il ramo nativo c'e', e' scritto bene, ha il feature detection e la scelta per singola visita — e nessuno lo accende.** Il motivo e' visibile nello shader stesso: la View Transitions API sa fare cross-fade e morphing di elementi condivisi, non sa fare un bordo a retino Bayer deformato dal rumore. La transizione qui non e' un passaggio, e' un contenuto.

### Lo shader della tendina (testuale, commenti dell'autore inclusi)

Vertex — un quad in clip-space, niente matrici:

```glsl
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4( position, 1.0 );
}
```

Fragment — le parti che contano (il `snoise` e' il simplex 2D canonico di Ashima/Gustavson, riportato intero nel bundle):

```glsl
uniform float uProgress;
uniform vec2  uOffset;
uniform float uNoiseScale;
uniform float uNoiseStrength;
uniform float uEdgeSmooth;
uniform float uDirection;
uniform float uAspect;
uniform vec2  uResolution;
uniform float uPixelSize;
uniform float uDitherSize;
uniform vec3  uColor;

varying vec2 vUv;

// 8x8 Bayer ordered dither matrix, built recursively from the 2x2 base.
// Returns a threshold in [0,1). GLSL ES 1.00 friendly (no integer bit ops).
float bayer2( vec2 a ) {
    a = floor( a );
    return fract( a.x * 0.5 + a.y * a.y * 0.75 );
}
float bayer4( vec2 a ) { return bayer2( a * 0.5 ) * 0.25 + bayer2( a ); }
float bayer8( vec2 a ) { return bayer4( a * 0.5 ) * 0.25 + bayer2( a ); }

/* … float snoise( vec2 v ) { … simplex 2D canonico … } … */

void main() {
    // Optional pixelation — snap UVs to a square pixel grid
    vec2 uv = vUv;
    if ( uPixelSize > 0.0 ) {
        vec2 cells = floor( uResolution / uPixelSize );
        uv = ( floor( uv * cells ) + 0.5 ) / cells;
    }

    // Correct UVs for aspect ratio so noise cells are always square
    vec2 noiseUv = vec2( uv.x * uAspect, uv.y );
    float noise = snoise( noiseUv * uNoiseScale + uOffset );

    // Remap uProgress (0..1) so the wipe band is guaranteed to sit entirely
    // below vUv.y=0 at progress=0 and entirely above vUv.y=1 at progress=1.
    // Without this, noise offsets cause premature alpha at the start and
    // incomplete coverage at the end.
    float margin = uNoiseStrength + uEdgeSmooth;
    float p      = mix( -margin, 1.0 + margin, uProgress );

    float threshold = p + noise * uNoiseStrength;

    // uDirection = 1.0 -> show  (fill  bottom->top as progress rises)
    // uDirection = 0.0 -> hide  (clear bottom->top as progress falls)
    float y = mix( 1.0 - uv.y, uv.y, uDirection );

    // Fill fraction across the soft edge band (0 = clear, 1 = solid)
    float fill = clamp( ( threshold - y ) / ( 2.0 * uEdgeSmooth ) + 0.5, 0.0, 1.0 );

    // Quantise the fill into a hard on/off using an 8x8 Bayer matrix sampled
    // per block of uDitherSize screen pixels. This replaces the smooth gradient
    // edge with an ordered dither pattern.
    // Strict fill > bayer: at fill=0 no cell lights (the matrix contains a 0
    // threshold), at fill=1 every cell lights.
    float bayer = bayer8( gl_FragCoord.xy / max( uDitherSize, 1.0 ) );
    float alpha = 1.0 - step( fill, bayer );

    gl_FragColor = vec4( uColor, alpha );
}
```

Configurazione JavaScript e ciclo di vita:

```js
this.config = Object.assign({
  showDuration: 1, hideDuration: 3,
  noiseFrequency: .5, noiseStrength: .8,
  edgeSmoothness: 1, pixelSize: 0, ditherSize: 3
}, options);

// il colore arriva dal CSS, non e' hardcoded:
uColor: { value: hexToVec3(
  getComputedStyle(document.documentElement).getPropertyValue("--black").trim() || "#0f0f0f"
) }

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearAlpha(0);            // alpha:true, il canvas e' trasparente

show() {                              // uProgress 0 -> 1
  this.material.uniforms.uOffset.value.set(random(0,100), random(0,100));  // seme nuovo ogni volta
  this.material.uniforms.uDirection.value = 1;
  this._startTicker();                // Tempus/gsap.ticker.add
  return gsap.to(uProgress, { value: 1, duration: 1, ease: "expo.out" });
}

hide() {                              // uProgress 1 -> 0
  this.material.uniforms.uDirection.value = 0;
  this.material.uniforms.uOffset.value.set(random(0,100), random(0,100));
  return gsap.to(uProgress, {
    value: 0, duration: 3, ease: "expo.out", delay: 1,
    onComplete: () => this._stopTicker()   // ticker rimosso + renderer.clear()
  });
}
```

Tre scelte da notare: `uOffset` randomizzato a ogni chiamata (nessuna transizione e' identica alla precedente); il ticker **acceso solo durante la transizione** e spento con `renderer.clear()` a fine tween (zero costo GPU a riposo, che spiega il WPO 8,00); e il colore preso da `--black` via `getComputedStyle`, cosi' la tendina resta agganciata al design system e non a una costante nel JS.

Sopra il canvas, in `.page-transition` (fuori da `<main>`), c'e' uno `span[data-typer-persist][data-typer-transition]` che porta le cinque frasi in un attributo dati, e ne mostra una a caso, decodificata, per la durata della copertura:

```
The Process Defines The Work
Each State Emerges From Previous Conditions
Meaning Arises Through Execution And Comparison
The Process Remains Accountable To Its Design
Constraints Are Integral To Its Structure
```

L'attributo `data-typer-persist` fa si' che `destroy()` restituisca `false` e il componente **non** venga distrutto al cambio pagina: e' l'unico componente che sopravvive alla sostituzione del contenitore.

---

## Gli otto canvas

Sulla home ci sono **8 elementi `<canvas>` attaccati al DOM**: 1 in WebGL (la tendina) e **7 in contesto 2D** — 4 del manifesto (uno per `[data-fluid]`) e 3 dei quadtree sulle miniature progetto. A questi vanno aggiunti i canvas fuori DOM usati come buffer (4 `sourceCanvas` del manifesto, 3 `off` dei quadtree, piu' i contesti usa-e-getta per `measureText`), che portano il conteggio dei contesti 2D a una quindicina.

**Precisazione rispetto al riassunto della ricerca**: non e' "canvas 2D *invece del* WebGL". 2xA usa Three.js in due punti — la tendina di transizione (su tutte le pagine) e il modello del team sulla pagina About — ma **non ha nessun canvas WebGL persistente sotto il DOM**, che e' il pattern degli altri quindici siti. Il WebGL qui e' un utensile puntuale; il lavoro visivo lo fa la CPU sul contesto 2D.

### 1. Manifesto — testo liquefatto (`manifesto-canvas-Bcpx_sVg.js`, canvas 2D)

Il pezzo piu' ingegnoso del sito. La pipeline:

- Il paragrafo vero (`[data-fluid-input]`) e' in `visibility: hidden; position: absolute`: resta nel DOM per SEO, screen reader e selezione, ma non si vede.
- Con un `Range` si iterano i caratteri e si trova dove il browser **manda a capo davvero** (`range.getClientRects().length > 1`): si ricostruiscono le righe cosi' come le ha spezzate il layout engine, non con un wrap fatto a mano. Un doppio `<br>` diventa una riga vuota.
- Le righe si allineano a lunghezza fissa con `padEnd(maxLen, " ")` → **matrice rettangolare di caratteri**. La larghezza di cella e' `measureText("M").width` (funziona solo perche' il font e' monospaziato), l'altezza e' la `line-height` calcolata.
- Si disegnano tutti i caratteri **uno per uno alla loro coordinata di griglia** su un canvas sorgente fuori schermo (`u.fillText(char, col*charW, row*charH)`), a `devicePixelRatio`, con `textRendering: "geometricPrecision"`.
- A ogni frame, il canvas visibile viene ripulito e ricomposto **cella per cella** con `drawImage(sourceCanvas, srcX, srcY, charW, charH, dstX, dstY, charW, charH)`, dove `srcX`/`srcY` sono la cella *sbagliata di proposito*: l'offset arriva dal rumore.

```js
render(time, delta) {
  const scrollBias = (window.scroller?.animatedScroll || 0) * .05;   // lo scroll entra nel campo
  paragraphs.forEach((p, idx) => {
    const nz = time * 1e-4;              // deriva temporale
    const a  = .001 * this.freq;         // freq = 10
    const colBias = idx * cols;          // ogni paragrafo campiona una zona diversa del rumore
    for (let r = 0; r < rows; r++) {
      const rowNorm = rows > 1 ? r / (rows - 1) : 0;
      let g = 0;
      switch (this.gradient) {
        case "sine":   g = Math.abs(this.threshold - rowNorm) ** 1.5; break;   // massimo ai bordi
        case "linear": g = clamp((this.threshold - rowNorm), 0, 1);   break;   // massimo in alto
      }
      const ampX = this.step * g, ampY = this.step * g;               // step = 15 celle
      const ny = (r + scrollBias) * a;
      for (let c = 0; c < cols; c++) {
        const nx = (c + colBias) * a;
        const n  = simplex3D(nx, ny, nz);
        this.getCurlNoise(n);                                        // dx=cos(2*PI*n), dy=sin(2*PI*n)
        const sc = wrap(c + round(this._curl.dx * ampX), 0, cols);   // wrap: il testo e' toroidale
        const sr = wrap(r + round(this._curl.dy * ampY), 0, rows);
        ctx.drawImage(src, sc*charW*dpr, sr*charH*dpr, charW*dpr, charH*dpr,
                            c*charW,      r*charH,     charW,     charH);
      }
    }
  });
}
```

`this.threshold` e' un `gsap.quickTo(duration: 2, ease: "power3.out")` alimentato dal progresso di uno ScrollTrigger (`top center` → `bottom center` sulla home; `top top` → `bottom center` con gradiente `linear` sulla About). Sulla home il progresso viene prima rimappato `mapRange(p, .25, .75, 0, 1)` e clampato, cioe' **il quarto iniziale e finale dello scroll non producono effetto**: l'onda vive nel 50% centrale. Il `Tempus.add` si aggancia in `onToggle` di un secondo ScrollTrigger (`top bottom` → `bottom top`) e si stacca fuori viewport: **fuori dallo schermo il ciclo non gira**.

Il campo e' un *curl noise* povero ma efficace: un solo valore di simplex 3D viene convertito in una direzione (`cos`, `sin` di `2π·n`) invece che in una magnitudine, quindi gli spostamenti sono rotazionali e non radiali — e' per questo che il testo sembra ruotare in vortici invece di esplodere.

### 2. Contatto — griglia di caratteri con collisioni (`contact-canvas-DcMUy_BV.js`, canvas 2D)

Un unico canvas `position: absolute; inset: 0` a tutta la viewport (`cursor: grab`).

- Sei paragrafi di testo, wrappati a **36 colonne**, vengono piazzati su una griglia di celle (`gridCols = round(innerWidth / charW)`, `gridRows = round(innerHeight / charH)`) con 80 tentativi casuali di posizionamento non sovrapposto.
- Tre parole-ostacolo — di default `["hello", "@2xa", ".studio"]` — vengono distribuite in fasce orizzontali, con la Y decisa da una sinusoide di fase casuale (`sinPhase = random(0, 2π)`): la disposizione cambia a ogni caricamento ma non e' del tutto casuale.
- Gli ostacoli non hanno un rettangolo di collisione: hanno una **maschera per pixel**. Il testo viene ridisegnato su un canvas temporaneo con un contorno (`strokeText` con `lineWidth = 0.5 * sqrt(charW*charH) * 2`), poi per ogni cella si contano i pixel con `alpha > 32` e la cella diventa solida se ne ha almeno il **2%**. Cioe': i caratteri di testo rimbalzano sulla **sagoma delle lettere**, non sul loro riquadro.
- Il trascinamento e' un **GSAP Observer** (`type: "pointer,touch"`, `preventDefault: true`). `onDrag` accumula `velX/velY += delta * 0.3` clampati a ±1000; un callback Tempus consuma la velocita' con attrito `0.85^(dt/16.667)` per frame, e a ogni superamento di `charW`/`charH` di spostamento accumulato sposta **tutti** i caratteri di una cella. I caratteri vengono ordinati per colonna/riga nella direzione del moto, cosi' quello davanti si muove per primo e non si scavalcano.
- `onClick` sull'ostacolo → `window.location.href = "mailto:hello@2xa.studio"`. Un `mousemove` alza `is-over-obstacle` (`cursor: pointer`).
- Esiste anche una modalita' `data-contact-noise="true"` (non usata sulla pagina contatto pubblica) in cui i caratteri sono spinti da un campo simplex 3D: un rumore globale (ampiezza 5) piu' uno per-carattere (ampiezza 10, frequenza 0,01), con `gsap.to(this, {velScale: 1, duration: 5, delay: 5, ease: "sine.inOut"})` — parte fermo, prende vita dopo 5 s.

**Il trucco delle sonde.** Nell'HTML ci sono due span invisibili:

```html
<span class="contact-canvas__obs-probe"  aria-hidden="true"></span>
<span class="contact-canvas__para-probe" aria-hidden="true"></span>
```

Il JavaScript non ha nessun valore tipografico scritto dentro: legge `getComputedStyle(probe)` e ne ricava `fontFamily`, `fontSize`, `fontWeight`, `fontStyle` e `color`, poi ricompone la stringa `font` di Canvas. Il CSS puo' quindi far crescere il testo del canvas da `10vw` a `12vw` a `15vw` per breakpoint **senza toccare una riga di JavaScript**. Tutta la costruzione e' dentro `document.fonts.ready.then(...)`, altrimenti `measureText` misurerebbe il font di ripiego.

### 3. Quadtree sulle miniature (`quadtree-COINQ5Zj.js`, canvas 2D)

- Immagine o video ridisegnati **a 1/8 di risoluzione** su un canvas fuori schermo con `willReadFrequently: true`, un solo `getImageData`.
- Suddivisione ricorsiva: per ogni nodo si calcola il colore medio RGB e la deviazione massima; se supera `threshold` (128 sulle pagine reali) e non si e' raggiunto `maxDepth` (5), si divide in 4 e si ricorre.
- Le foglie si ordinano **per area decrescente** — cosi' i blocchi grandi si accendono prima e la figura emerge dal generale al particolare.
- Innesco: `IntersectionObserver` con `rootMargin: "-15% 0px 0px 0px"` (parte quando l'elemento e' entrato per bene, non appena tocca il bordo).
- Tre fasi: `reveal` (foglie 0→N, `power2.inOut`, 0,8 s) → `hold` (l'immagine vera torna a `opacity: 1`) → `dissolve` (foglie N→0) → `destroy()`: il canvas viene **rimosso dal DOM**. E' un effetto usa-e-getta, non un layer permanente.

### 4. Pixelate (`pixelate-Dfa8e9vA.js`, canvas 2D) — presente ma non usato

Ricampiona un video in una griglia 50x5 a 30 fps con soglia di differenza colore 50 (celle contigue simili collassano in una barra). Nessuna pagina pubblica ha `data-pixelate`. Stesso discorso per `swipe` (Swiper, 77 KB), `accordion`, `marquee`, `columns` su alcune pagine: sono chunk a caricamento dinamico che **non vengono mai richiesti**, quindi non pesano.

---

## Colori

Tutti letti dal CSS (`style-TyInWDPO.css`), nessuno stimato.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| `--white` | `#fdfdfd` | testo nei blocchi scuri, header, footer |
| `--grey` | `#cecece` | `--foreground-dim` nel tema scuro: titoli di sezione giganti, strisce del logo |
| `--ash` | `#858585` | `--foreground-dimmed`: descrizioni mono dei progetti, `.subtitle` |
| `--coal` | `#1a1a1a` | `--foreground-dimmed` nel tema chiaro |
| `--black` | `#0f0f0f` | fondo del tema scuro **e colore della tendina di transizione** (`uColor`) |
| `--vanta` | `#000000` | dichiarato, non usato nelle regole trovate |
| `--blue` | `#0000ff` | `--accent`: sfondo dei badge `.specs`, variante `charAccent` del typer |
| `--red` | `#d4373a` | fondo del tema `.theme--red` |

Temi come classi, applicati per blocco (`.manifesto.theme--light`, `.card.theme--dark`, `footer.theme--dark`), non per pagina:

```css
.theme--dark     { --foreground: var(--white); --foreground-dim: var(--grey); --foreground-dimmed: var(--ash);  --background: var(--black); }
.theme--light    { --foreground: var(--black); --foreground-dim: var(--coal); --foreground-dimmed: var(--ash);  --background: var(--white); }
.theme--inverted { --foreground: var(--black); --foreground-dim: var(--coal); --foreground-dimmed: var(--ash);  --background: var(--white); }
.theme--red      { --foreground: var(--white); --foreground-dim: var(--grey); --foreground-dimmed: var(--grey); --background: var(--red); }
```

Curve dichiarate come variabili:

```css
--ease-out:        cubic-bezier(0, 1, 1, 1);
--ease-out-expo:   cubic-bezier(0, 1, 0, 1);
--ease-in:         cubic-bezier(1, 0, 1, 1);
--ease-in-expo:    cubic-bezier(1, 0, 1, 0);
--ease-in-out:     cubic-bezier(.785, .135, .15, .86);
--border-radius:      .1rem;   /* ridichiarato: la prima dichiarazione .25rem viene sovrascritta */
--border-radius-text: .15rem;
--box-shadow: none;            /* stessa cosa: l'ombra a 5 livelli sopra viene annullata */
```

`mix-blend-mode: difference` compare **6 volte**: header, `.subtitle`, footer, `.card`. La grana usa `hard-light`.

## Tipografia

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| Titolo di sezione (`.section-title h2`) | HelveticaProRoman | 400 (`wght` 85) | `10vw` (→ `15vw` sotto 584 px) | `1em` | Su griglia 12 colonne, blocchi `span 4` posizionati a mano per riga/colonna, colore `--foreground-dim`. Sta **dietro** al contenuto |
| Titolo progetto (`.project-item .title`) | HelveticaProRoman | 400 | `--font-md` = `1.5625rem` (25 px) | 1 | `data-typer`, larghezza 65% |
| Card / intro (`.card__label`, `.intro .text`) | HelveticaProRoman | 400 | `--font-lg` = `1.875rem` (30 px) | 1 | `text-align-last: justify` sulla card |
| Navigazione, bottoni, footer, awards | **2XAMONOVF** | `wght` 85 ereditato | `--font-md` (25 px) | 1 | `text-transform: uppercase` |
| Corpo mono (descrizioni, servizi, manifesto) | **2XAMONOVF** | `wght` **50** (manifesto, sonde contatto) o **150** (descrizioni, `.subtitle`, servizi) | `--font-sd` = `1.25rem` (20 px) | 1,2 | I due valori dell'asse fanno tutta la gerarchia del testo secondario |
| Base | HelveticaProRoman | 400 | `--font-sm` = `1rem` (16 px) | 1 | `-webkit-font-smoothing: antialiased` |

Scala: **4 gradini** (`--font-sm` 16 · `--font-sd` 20 · `--font-md` 25 · `--font-lg` 30 px) piu' un display **fluido** a `10vw`. A 1512 px il rapporto display/base e' `151,2 / 16 = 9,45x`; a 584 px e' `87,6 / 12,8 = 6,84x`. Rientra nella forbice 6x-14x del pattern P4, ma la costruisce diversamente: quattro gradini ravvicinati per il testo, e il salto grande e' l'unica cosa che scala con la viewport.

Sotto 768 px: `:root { --font-scale: .8 }` — un solo numero riscala tutti e quattro i gradini. Sotto 584 px: `--pad: .5rem; --gap: .5rem`.

### Come sono serviti i font

Tutti auto-ospitati, **zero richieste a `fonts.googleapis.com`**.

```css
@font-face{font-family:"2XAMONOVF";
  src:url(/public/dist/assets/2XAMONOVF-D3wu236a.woff) format("woff");
  font-style:normal; font-weight:100 900; font-display:swap}

@font-face{font-family:HelveticaProRoman;
  src:url(/public/dist/assets/HelveticaProRoman-CPlYd_WS.woff2) format("woff2");
  font-style:normal; font-weight:400; font-display:swap;
  ascent-override:95%; descent-override:22%; line-gap-override:0%}

@font-face{font-family:Geist;     src:url(/src/css/fonts/Geist.ttf) format("truetype");     font-weight:100 900}
@font-face{font-family:GeistMono; src:url(/src/css/fonts/GeistMono.ttf) format("truetype"); font-weight:100 900}
```

**`2XAMONOVF`** — il monospace variabile su misura. `VF` = variable font, `2XA` = lo studio (Maria e' type designer). Pesa **15,0 KB** ed e' l'unica famiglia usata per navigazione, bottoni, footer, tabella premi, descrizioni progetti, manifesto e testi su canvas: **portare tutta l'interfaccia mono con 15 KB** e' quello che rende sostenibile il resto.

Il file e' servito in **`.woff` e non `.woff2`** — l'unico spreco di rete evidente sul sito (woff2 renderebbe 20-30% in meno).

L'asse `wght` viene pilotato con `font-variation-settings` a valori **fuori dalla scala CSS standard** — `50`, `85`, `150` — mentre `@font-face` dichiara `100 900`. Il `@font-face` e' quindi solo una dichiarazione di comodo: l'asse reale del font ha un dominio proprio, e lo studio lo usa scavalcando `font-weight`. **SUPPOSTO** (non ho ispezionato la tabella `fvar` del binario).

`HelveticaProRoman` e' un `.woff2` statico da 35,3 KB con **metric override** (`ascent-override: 95%; descent-override: 22%; line-gap-override: 0%`): serve a far coincidere la scatola di riga del font di ripiego (`Helvetica`, poi `sans-serif`) con quella reale, cosi' che lo `swap` non faccia saltare il layout.

`Geist` e `GeistMono` sono dichiarate su percorsi **di sviluppo** (`/src/css/fonts/...`) che in produzione rispondono **404**: due `@font-face` morte finite nel build. Nessuna regola CSS le richiama, quindi il browser non le scarica mai — ma restano una svista.

## Testi veri

**Titolo pagina**: `2xA — Home` · `2xA — About` · `2xA — Projects` · `2xA — Contact`

**Descrizione (meta)**:
> Award-winning computational design studio crafting digital experiences, visual systems, and research-driven projects through code, technology, and creative experimentation. Located in Amsterdam and Athens.

**og:description**: `Code-driven design studio between Amsterdam and Athens`

**Menu**: `2xA STUDIO` (logo) · `ATH(GR) HH:MM` · `AMS(NL) HH:MM` · `About` · `Projects` · `Contact`

**Intro / claim (7 parole in cascata)**:
> Code-Driven / Design / Studio / Between / Amsterdam / & / Athens

**Titoli di sezione (home)**:
> `Generative Code Explorations` · `Code- Driven Design Studio Between Amsterdam & Athens` `(Read More)` · `Selected Projects` `View All (5)` · `Awards & Achievements`

**Didascalie sticky (`.subtitle`)**:
> `ON COMPUTATION AS A WAY OF THINKING` · `MADE WITH CARE AND A LOT OF CODE` · `GOOD WORK TENDS TO GET NOTICED` · `PRACTICE SHAPED BY CODE DATA AND FORM` · `TEAM MEMBERS ( IN NO PARTICULAR ORDER )`

**Apertura del manifesto** (primo dei quattro paragrafi liquefatti):
> Digital systems shape perception, labor, communication, and power. Computation is no longer a tool applied at the end of a process, but a condition that structures how reality is sensed, modeled, and acted upon. Design operates inside systems defined by code, data, networks, and feedback. Computational design acknowledges this condition and works from within it.

**Testo commerciale** (Selected Projects intro — l'unico pezzo di vendita esplicita della home):
> 2xA is a code-driven design studio based between Amsterdam and Athens, specializing in digital product design, brand identity, UX/UI design, and custom web development.
> We work at the intersection of design and computation, building websites, digital platforms, and interactive systems where code is part of the creative process. Our approach combines strategy, design systems, and generative methods to create clear, scalable, and functional digital experiences.
>
> Form follows process. Every project is a set of conditions released into motion.Code tracing the edge between structure and surprise, between what was specified and what emerged.

(il `motion.Code` senza spazio e' testuale nel sorgente)

**Chiamate all'azione**: `View project details` (card sul cursore) · `View All (5)` · `(Read More)` · `Visit Project` · `All Projects` · `hello@2xa.studio`

**Piede** (identico su tutte le pagine): `Instagram` · `Behance` · `hello@2xa.studio` · `Privacy` · *(vuoto)* · `Studio Sounds /` (il `/` e' lo spinner che ruota con lo scroll; il link va alla playlist Spotify `79y9ia7Lp13Dkw0qrULt9P`)

**Frasi della transizione** (una a caso per ogni cambio pagina):
> The Process Defines The Work · Each State Emerges From Previous Conditions · Meaning Arises Through Execution And Comparison · The Process Remains Accountable To Its Design · Constraints Are Integral To Its Structure

**Testi sulla pagina contatto** (dentro l'attributo `data-contact-paragraphs`, quindi sono contenuto che diventa materia fisica):
> Every collaboration starts with a conversation. Sometimes it's an email. Sometimes it's a weird DM. Let's see what you got.
>
> We're either designing something, coding something, or arguing about typefaces. But we do read everything.
>
> We're not for everyone. And we like it that way. The right projects find us, the ones with tension, weight, and guts. The ones that demand something new.
>
> Drop us a line at hello@2xa.studio. Or find us wherever the internet is most uncomfortable.
>
> AMSTERDAM HQ: NDSM plein 127, 1033 WC Amsterdam, The Netherlands
>
> ATHENS HQ: 25th Martiou Ave. 79 Petroupoli, Athens Greece - 13231

**Servizi (About)**: `Motion` · `Creative Direction` · `Brand Strategy` · `Branding` · `Web Development` · `Web Design` · `Generative Systems`

**Progetti**: `(01) ABR Festival` · `(02) Buna Tetu` · `(03) Miao World` · `(04) Climate Journalism` · `(05) Who Owns The Media`

## Mobile

La sezione piu' utile. Breakpoint: 1512 / 1280 / 1024 / **768** / 584 px — 49 regole su 768 px, 11 su 1024, 5 su 584. Il salto vero e' a 768.

**SPARISCE:**

- **I due orologi** ATH/AMS nell'header (`header .nav .time { display: none }`). Sul telefono l'intestazione diventa un flex a tre voci.
- **La card che segue il cursore** (`.card { display: none }`). Giusta: non c'e' cursore. Ma con lei sparisce anche la chiamata all'azione "View project details", che non viene rimpiazzata da nulla.
- **Tre dei quattro paragrafi del manifesto**: a 1024 px cade il quarto, a 768 px cadono terzo e quarto, sotto ancora restano solo il primo. Regola testuale:
  ```css
  @media (max-width:768px){
    .manifesto .texts [data-fluid]:nth-child(2),
    .manifesto .texts [data-fluid]:nth-child(3),
    .manifesto .texts [data-fluid]:nth-child(4){ display:none }
  }
  ```
  Sono **tre quarti del testo del manifesto** e tre canvas su quattro. Il che significa che il costo dell'effetto sul telefono e' un quarto — ma il testo tagliato non ricompare da nessun'altra parte.
- **Quattro voci su sei del footer**: `.footer ul li:not(:nth-child(3)):not(:nth-child(6)) { display:none }` — restano solo `hello@2xa.studio` e `Studio Sounds`. Instagram, Behance e Privacy scompaiono.
- **La colonna "Awards"** della tabella premi (`.awards__description { display: none }`) e l'intera riga di intestazione (`.awards__list--header { display: none }`). Resta progetto / organizzazione / anno.
- **I galleggianti `.thumbnails`** nella lista progetti (`display: none`) — l'anteprima multipla a hover.
- Nella tabella team: `member-title` e `member-location` spariscono; restano nome e ruolo su due colonne.

**VIENE SOSTITUITO:**

- **Il logo**: due SVG diversi nell'HTML, `svg--big` (1832x403, molto largo) e `svg--small` (560x403, piu' compatto). Sotto 768 px si scambiano (`.svg--big { display:none }` / `.svg--small { display:block }`). Non e' un ridimensionamento: **e' un secondo disegno**.
- **Tutta la scala tipografica** con un solo valore: `--font-scale: .8`.
- **Il display** passa da `10vw` a `15vw` sotto 584 px — in proporzione al viewport **cresce** invece di calare.
- **La griglia dei "Generative Code Explorations"** passa da 4 posizioni sfalsate su 12 colonne (1/7/4/10 su span 3) a `span 6` uniforme: da composizione a griglia semplice a due colonne.
- **I progetti** passano da 5 posizioni sfalsate su 12 colonne a `grid-column: 1 / -1` — pila verticale.
- **Il video del reel** da `height: 100%` a `width: 100%; height: auto`.
- **Il testo delle sonde canvas** sulla pagina contatto: `10vw` → `12vw` (1024) → `15vw` (768). Solo CSS: il JavaScript non sa nulla del breakpoint, rilegge la sonda al resize.
- **La descrizione dei progetti** usa container query (`container-type: inline-size`): `max-width: calc(25cqi - .75*var(--gap))` → `calc(100cqi/3 - 2/3*var(--gap))` → `calc(50cqi - .5*var(--gap))` → `100%`.

**RESTA:**

- **Tutti gli effetti canvas** — quadtree, contatto, manifesto (il primo paragrafo), tendina WebGL. Nessun ramo mobile che li spenga, nessuna soglia su `devicePixelRatio` oltre a `Math.min(dpr, 2)`.
- **Il modello 3D del team** sulla About: resta e continua a ruotare, ma `pointer-events: none` disattiva OrbitControls e il contenitore diventa quadrato (`height: 100vw`). Restano i **2,0 MB** di GLB e i decoder DRACO.
- **La transizione fra pagine** intatta.
- **La grana animata** in `hard-light` a `z-index: 1000`.
- **Il trascinamento sul canvas contatto**: l'Observer e' su `"pointer,touch"`, quindi funziona a dito.
- **Il video del reel da 28 MB.** Nessuna sorgente alternativa, nessun `<source media="...">`, nessun poster. **Il telefono scarica lo stesso file del desktop.**

**`prefers-reduced-motion`**: nel CSS c'e' **una sola** regola, e riguarda la libreria dei cookie (`@media(prefers-reduced-motion){#cc-main{--cc-modal-transition-duration:0s}}`). Il sito **non rispetta la preferenza**: nessun controllo in JavaScript (nessuna `matchMedia("(prefers-reduced-motion")`), nessun `gsap.matchMedia()`. Chi ha disturbi vestibolari riceve intro, tendina, testo liquefatto e quadtree per intero. E' probabilmente la parte del punteggio Accessibility 6,60 che pesa di piu'.

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| Rendering | Server-side, HTML completo | **VERIFICATO** | `curl` senza JavaScript restituisce l'intero contenuto (122,9 KB): niente guscio SPA |
| CMS | **Kirby** (flat-file PHP) | **VERIFICATO** | `robots.txt`: `Disallow: /kirby`, `/panel`, `/content`. Struttura `/media/pages/<slug>/<hash>-<timestamp>/` e derivate `-800x-q100.jpg` sono la firma del `Kirby\Filesystem`. `/panel` risponde 500 |
| Server | PHP 8.3.33 + Plesk dietro **Cloudflare** | **VERIFICATO** | Header `x-powered-by: PHP/8.3.33`, `x-powered-by: PleskLin`, `Server: cloudflare`, `CF-RAY: …-FCO` |
| Build | **Vite** | **VERIFICATO** | `__vite__mapDeps`, `vite:preloadError`, nomi `main-CzlVfecv.js`, `type="module"`, code splitting per componente |
| Transizione pagine | **Swup 4.8.2** + 5 plugin ufficiali | **VERIFICATO** | `this.version="4.8.2"`, `name:"SwupA11yPlugin"` ecc. |
| View Transitions API | Ramo presente in Swup, **disattivato** | **VERIFICATO** | `native:!1` nei default, non sovrascritto; `startViewTransition` presente solo nel codice di libreria; 0 regole `::view-transition*` nel CSS |
| Animazione | **GSAP 3.13.0** + ScrollTrigger 3.13.0 + Observer | **VERIFICATO** | `version="3.13.0"` x3, `nt.version="3.13.0"`, `console.warn("Please gsap.registerPlugin(Observer)")` |
| GSAP Flip / ScrollSmoother / SplitText | **assenti** | **VERIFICATO** | Nessuna definizione di plugin; le occorrenze di `Flip` sono `_isFlipped` interno e `tFlip` di Three; quelle di `ScrollSmoother` sono i soli controlli difensivi dentro ScrollTrigger |
| Scroll | **Lenis 1.3.15** con `autoRaf: false` | **VERIFICATO** | `var rv="1.3.15"`, `window.lenisVersion=rv`, `new Lenis({autoRaf:!1})`, esposto come `window.scroller` |
| rAF | **Tempus** (darkroom.engineering) | **VERIFICATO** | Classe con `framerates`, `usage`, `add({callback, priority, fps, label, idle})`, `patch()/unpatch()` di `window.requestAnimationFrame` |
| Split del testo | **Splitting.js** | **VERIFICATO** | Chunk `splitting-BCPD88_F.js`, sorgente UMD riconoscibile. Usato in `in.js` e `split.js` con `by: "lines"/"words"/"chars"` e `--delay` casuale 0-0,5 s per parola |
| Rumore | **`simplex-noise`** npm (`createNoise3D`) | **VERIFICATO** | Chunk dedicato `simplex-noise-CDaaleer.js` (1,4 KB), importato da `manifesto-canvas` e `contact-canvas` |
| 3D | **Three.js r184** | **VERIFICATO** | `const REVISION="184"`. Usato per la tendina e per `team-glb` |
| Compressione GPU | **DRACO** (loader + decoder su `/static/draco/`) | **VERIFICATO** | `setDecoderPath("/static/draco/")` in `team-glb`. Nessun KTX2, nessuna texture: il modello e' `MeshStandardMaterial` bianco tinta unita |
| Locomotive Scroll / Framer Motion / jQuery | **assenti** | **VERIFICATO** | Zero occorrenze |
| Swiper | nel codice, **mai istanziato** | **VERIFICATO** | Chunk `swipe-DIRGvFgQ.js` (77 KB) + `@font-face swiper-icons` inline nel CSS, ma `data-swipe` non compare su nessuna pagina pubblica |
| Cookie | **vanilla-cookieconsent** (tema `cc--elegant-black`) | **VERIFICATO** | Chunk `privacy-CzyzE8_1.js` (25 KB), classi `cc--*`, `window.cc.showPreferences()` |
| Analytics | Google Analytics `G-9V0NZV2FR8`, **bloccato fino al consenso** | **VERIFICATO** | `<script type="text/plain" data-category="analytics">` — il tipo `text/plain` impedisce l'esecuzione finche' cookieconsent non lo riscrive |
| Immagini | Kirby thumbs, `srcset` 800/1024/1440/2048 + `loading="lazy"` + `width`/`height` | **VERIFICATO** | Nell'HTML. **Solo JPEG**, nessun WebP/AVIF |
| Video | MP4 H.264 diretti, `autoplay playsinline muted loop` | **VERIFICATO** | Nessun HLS/DASH, nessun WebM, nessun poster |

## Peso e prestazioni

Misurato con `curl` (transfer size con `Accept-Encoding: br, gzip`; il "raw" e' la dimensione a disco).

| risorsa | trasferito | non compresso |
|---|---|---|
| HTML `/` | **13,2 KB** | 122,9 KB |
| `main-CzlVfecv.js` | **192,3 KB** | 735,3 KB |
| `style-TyInWDPO.css` | **16,3 KB** | 98,9 KB |
| `2XAMONOVF-D3wu236a.woff` | 15,0 KB | 15,0 KB (woff, non compresso ulteriormente) |
| `HelveticaProRoman-CPlYd_WS.woff2` | 35,3 KB | 35,3 KB |
| `noise-B0hWBEVg.png` | 16,1 KB | 16,1 KB |
| **Totale "sito" (codice + font + grana)** | **≈ 288 KB** | ≈ 1,02 MB |

Il codice e' magro. I media no:

| media (home) | peso |
|---|---|
| `2xa_reel.mp4` (hero, autoplay) | **28,07 MB** |
| `video-1-c39yc4lthee.mp4` (experiment) | 10,40 MB |
| `tiles.mp4` | 6,05 MB |
| `2xa_studio_abr_festival_monitor.mp4` (thumb progetto 01) | 4,96 MB |
| `video-1-c7mgiz8g8ek.mp4` | 3,92 MB |
| `dither.mp4` | 2,34 MB |
| `video-by-loonatiks…mp4` | 1,94 MB |
| `rect_glitch.mp4` | 0,81 MB |
| 10 JPEG (varianti srcset dei progetti 02/03) | 5,62 MB complessivi |
| **Totale media referenziato in home** | **64,15 MB** su 19 file |

I sei video "experiment" hanno `preload="metadata"`, quindi la prima ondata e' contenuta; ma hanno anche `autoplay`, e `video-BKWpV8u0.js` chiama `video.play()` appena il video interseca la viewport (e `pause()` quando esce). Il reel dell'hero non ha attributo `preload`: **28 MB partono subito**, identici su telefono. Il caricamento e' mascherato dall'intro di 4 secondi.

Altrove: `/static/gltf/team-compressed.glb` = **2,0 MB** (pagina About) piu' i decoder DRACO da `/static/draco/`.

Cache: `Cache-Control: max-age=14400` (4 ore) su tutti gli asset con hash nel nome — un valore basso per file immutabili (l'idiomatico sarebbe `max-age=31536000, immutable`). L'HTML e' `cf-cache-status: DYNAMIC` (non messo in cache all'edge, coerente con un CMS PHP).

Punteggi Awwwards (giudizio della giuria, non Lighthouse): **WPO 8,00** e **Animations/Transitions 8,20** sono i due voti piu' alti del Developer Award; Accessibility 6,60 il piu' basso. **Non ho eseguito Lighthouse ne' misurato LCP/CLS/INP** (nessun browser aperto).

Ottimizzazioni presenti che vale la pena registrare: il ticker dello shader e' rimosso a transizione finita con `renderer.clear()`; ogni componente si stacca da Tempus con `ScrollTrigger.onToggle` o `IntersectionObserver` fuori viewport; i quadtree si auto-distruggono dopo l'animazione; `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` ovunque; `getImageData` chiamato una volta sola per quadtree su un buffer a 1/8 di risoluzione con `willReadFrequently: true`.

## Tre cose da rubare

**1. Il testo che vive due volte: DOM per il significato, griglia di canvas per l'effetto.**
Il `<p>` vero resta nel DOM in `visibility: hidden; position: absolute` — indicizzabile, leggibile da screen reader, selezionabile in linea di principio. L'effetto si costruisce *leggendo dal browser* dove le righe vanno a capo con `Range.getClientRects().length > 1`, invece di rifare il wrapping a mano. Poi si disegna carattere per carattere su un canvas sorgente fuori schermo, e a ogni frame si ricompone il canvas visibile con `drawImage` cella per cella, campionando la cella sbagliata secondo un campo di rumore. Costo per frame: `righe x colonne` `drawImage` su una texture gia' pronta, **nessun `fillText` a runtime**. La ricetta funziona con qualunque monospace; l'unico vincolo e' che `measureText("M").width` sia la larghezza di tutte le celle.

**2. Le sonde CSS: elementi vuoti che portano il design system dentro il canvas.**
```html
<span class="contact-canvas__obs-probe"  aria-hidden="true"></span>
<span class="contact-canvas__para-probe" aria-hidden="true"></span>
```
```js
const cs = window.getComputedStyle(this.paraProbe);
this.paraFont  = `${cs.fontStyle} ${cs.fontWeight} ${parseFloat(cs.fontSize)}px ${cs.fontFamily}`;
this.paraColor = cs.color;
this.charW     = measureCtx.measureText("M").width;
this.charH     = parseFloat(cs.fontSize) * 1.2;
// anche le spaziature vengono dal CSS:
const root = getComputedStyle(document.documentElement);
this.padCols = ceil(parseFloat(root.getPropertyValue("--pad"))        / this.charW);
this.padRows = ceil(parseFloat(root.getPropertyValue("--nav-height")) / this.charH);
```
Nessun valore tipografico e' scritto nel JavaScript. Il CSS puo' cambiare corpo, peso, colore e margini per breakpoint e per tema, e il canvas si riallinea al `resize` senza che nessuno tocchi il codice. Vale anche per il colore della tendina, che legge `--black` da `getComputedStyle(document.documentElement)`. Da rifare pari pari in qualunque progetto dove un canvas deve stare in un design system.

**3. Un solo `requestAnimationFrame` per tutta la pagina, con priorita' e ingaggio a viewport.**
```js
gsap.registerPlugin(ScrollTrigger);
this.scroller = new Lenis({ autoRaf: false });   // Lenis NON gira da solo
gsap.ticker.remove(gsap.updateRoot);             // GSAP NON gira da solo
gsap.ticker.lagSmoothing(0);
Tempus.add((time, delta) => {                    // un unico loop, priorita' 1
  this.scroller.raf(time);
  gsap.updateRoot(time / 1000);
}, 1);
window.scroller = this.scroller;
```
Ogni componente pesante si aggancia poi con `Tempus.add(cb, 0)` **dentro l'`onToggle` di uno ScrollTrigger** (`start:"top bottom"`, `end:"bottom top"`) e chiama la funzione di rimozione restituita quando esce. Effetto: otto canvas sulla pagina, ma girano solo quelli visibili, tutti dentro lo stesso frame, in ordine deterministico, senza contesa fra i rAF di Lenis, GSAP e i componenti. E' il motivo per cui un sito con questa densita' di calcolo prende WPO 8,00. Quarta cosa, gratis: `window.scroller.velocity` e `window.scroller.direction` diventano una sorgente di animazione riusabile — il marquee e lo spinner del footer sono guidati da quelli e da nient'altro.

## Non verificato

- **Le ampiezze reali degli effetti di scroll.** Ho letto il codice, non ho campionato i `transform` a due altezze di scroll. Le durate (0,5 / 1 / 2 / 3 schermate) sono dedotte da `height`, `padding` e configurazione ScrollTrigger, non misurate.
- **Tempi reali di caricamento, LCP, CLS, INP, FPS.** Nessun browser aperto: nessun Lighthouse, nessun trace.
- **Il dominio dell'asse `wght` di 2XAMONOVF.** I valori `50`/`85`/`150` sono nel CSS, ma non ho ispezionato la tabella `fvar` del `.woff`. Se il dominio reale fosse `100 900` come dichiarato, i valori 50 e 85 verrebbero clampati a 100 e la gerarchia mono si appiattirebbe — comportamento che non ho potuto osservare.
- **Il comportamento reale della tendina su un cambio pagina.** Ho ricostruito la sequenza dagli hook e dai tween; non l'ho vista.
- **Se il ramo View Transitions venga acceso da qualche parte a runtime.** Ho verificato che la configurazione iniziale non lo accende e che nessun hook nel codice dello studio tocca `visit.animation.native`; non posso escludere una riscrittura da un plugin, ma i cinque plugin sono quelli ufficiali e nessuno tocca quel campo.
- **Le altre pagine progetto** (`climate-journalism`, `who-owns-the-media`): ho ispezionato solo `abr-festival` nel dettaglio.
- **La resa a 375-390 px di larghezza reale.** Ho letto le media query, non ho renderizzato: non so se i titoli a `15vw` vadano in overflow, ne' come si comporti il canvas contatto quando le tre parole-ostacolo a `15vw` occupano quasi tutta la griglia.
- **La versione precisa di Tempus e di `simplex-noise`.** Le librerie sono identificate per struttura del codice, non da una stringa di versione nel bundle.
- **Se il video del reel abbia varianti servite da Cloudflare Stream o negoziate lato server.** L'HTML ne serve una sola e la richiesta diretta restituisce 28,07 MB.
