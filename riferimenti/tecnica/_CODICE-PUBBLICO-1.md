# Codice sorgente pubblicamente leggibile — gruppo 1

Otto studi: **Lusion, Active Theory, Obys, Resn, Immersive Garden, Hello Monday, Locomotive, Merci Michel**.

Per ognuno ho controllato quattro strade, in quest'ordine:

1. repository GitHub del sito stesso;
2. **sourcemap** (`.map` con `sourcesContent`);
3. bundle non minificati finiti in produzione;
4. repository di librerie pubblicate dallo studio.

Metodo: download diretto dei bundle con `curl --compressed`, decodifica delle sourcemap in Python, interrogazione di `api.github.com`. Solo asset serviti pubblicamente dai loro domini: nessun accesso autenticato, nessun bypass, nessuna prova su installazioni di terzi.

Data della verifica: **13 agosto 2026**. Gli hash dei bundle cambiano a ogni deploy — i percorsi restano, gli hash no.

---

## Il risultato in una riga

**Cinque studi su otto danno codice leggibile a livello di sorgente**, ognuno per una ragione tecnica diversa:

| Studio | Perche' e' leggibile |
|---|---|
| **Locomotive** | sourcemap pubblica da 10,6 MB |
| **Hello Monday** | sourcemap pubblica da 5,98 MB — **trovata indovinando l'URL, non c'era il commento** |
| **Resn** | bundle da 4 MB **mai minificato**: indentazione, 6.223 righe di commento, 236 `console.log` |
| **Active Theory** | niente sourcemap, ma il minificatore conserva **396 nomi di classe** + un JSON pubblico con 2.593 parametri tarati a mano |
| **Lusion** | niente sourcemap, ma `keep_names`: **229 classi** e **tutto il GLSL in chiaro** |

Gli altri tre (**Obys, Immersive Garden, Merci Michel**) danno solo l'architettura, non il codice.

E c'e' una lezione che vale piu' di tutte: **su Hello Monday il commento `//# sourceMappingURL=` nel bundle non c'e'.** La mappa esiste lo stesso, all'URL ovvio `<bundle>.js.map`. Chi cerca solo il commento non la trova. **Provare sempre `.map` a mano.**

---

# 1. Hello Monday — hellomonday.com

## Strada 2: sourcemap pubblica, completa, con `sourcesContent`

| | |
|---|---|
| **Bundle** | `https://hellomonday.com/build/js/main-e03077acdb.js` — **1.743.079 byte** |
| **Sourcemap** | `https://hellomonday.com/build/js/main-e03077acdb.js.map` — **5.979.218 byte (5,98 MB)**, HTTP 200, `content-type: text/javascript` |
| **Contenuto** | 415 sorgenti, **415 su 415 con `sourcesContent` pieno**. Di questi **77 sono codice loro** (`app/src/`, `app/lib/com/hellomonday/`), il resto sono dipendenze npm complete |

Il bundle **non contiene** il commento `//# sourceMappingURL=`. L'unica occorrenza di quella stringa dentro `main.js` e' un falso positivo: sta dentro il compilatore PaperScript di `paper.js`, che quel commento lo *genera*. Ho trovato la mappa tirando a indovinare l'URL.

### Il nome del progetto e' il primo regalo

Tutti i percorsi cominciano con `webpack://HM-Starter/`. Lo studio non parte da zero a ogni progetto: ha un **boilerplate interno che si chiama `HM-Starter`**, e il sito dello studio ne e' un'istanza. Si vede anche nella struttura, con una `app/lib/` (riusabile) separata da `app/src/` (questo progetto).

```
app/
├── lib/com/                       ← la libreria di studio, riusata ovunque
│   ├── hellomonday/
│   │   ├── signals/               Signal.ts, SignalBinding.ts
│   │   ├── templateManager/       TemplateManager.ts, AbstractModule.ts, ModuleFactory.ts
│   │   ├── loaders/               FontLoader.ts
│   │   ├── events/                MouseEvent.ts, TouchEvent.ts
│   │   └── utils/                 MathUtils.ts, LinkParser.ts, Resizer.ts
│   ├── akella/                    normalize-wheel.js
│   ├── greensock/gsap-bonus/      MorphSVGPlugin.js
│   └── polyk/                     PolyK.ts
└── src/                           ← il sito
    ├── Main.ts                    (15 KB, il regista)
    ├── scroll/                    ScrollController.ts, WheelController.ts
    ├── templates/                 Home / Work / About / Services / Innovation / Default
    ├── modules/                   16 moduli (CaseGrid, Hero, Quote, CodeOfHonor, ...)
    ├── ui/                        MainMenu, PageWipe, Footer, cursor/CursorBlob, grid/EdgeDetector
    ├── renderer/                  BackgroundRenderer.ts
    ├── video/                     VimeoPlayer.ts
    └── utils/                     Globals, WindowManager, PageTitleAnimator, CopyToClipboard
```

Il package rovesciato `com/hellomonday/` e le classi `Signal`/`SignalBinding` sono **eredita' diretta di ActionScript 3** (as3-signals di Robert Penner). Lo studio e' del 2005, e' passato per Flash, e la sua architettura di oggi e' ancora quella, tradotta in TypeScript.

### Tre cose che ci ho visto dentro

**1. Il motore grafico non e' three.js: e' PIXI.js v8, e il testo e' bitmap font dinamico.**
Nella mappa ci sono oltre 200 file `src/rendering/` e `src/scene/` di Pixi, compresi `text-bitmap/DynamicBitmapFont.ts`, `BitmapFontManager.ts`, `high-shader/compileHighShader.ts`. Il cursore (`ui/grid/cursor/CursorBlob.ts`, 13,6 KB) e le maschere della griglia dei case (`CaseEntryMask.ts` 14 KB, `MaskSegment.ts` 14,5 KB) sono disegnati in WebGL 2D, non in DOM. Accanto a Pixi ci sono **`paper.js`** (451 KB di sorgente nella mappa) e **`PolyK.ts`**, geometria di poligoni: le forme che si deformano non sono SVG animati, sono poligoni ricalcolati ogni frame.

**2. Lo scroll e' riscritto a mano, e c'e' un ramo apposta per Firefox.**
`app/src/scroll/WheelController.ts` intercetta `wheel` con `{ passive: false }` e scrive direttamente `element.parentNode.scrollTop`. La prima cosa che fa il costruttore e':

```ts
if (Globals.isFirefox) {
    let eventType = NormalizeWheel.getEventType();
    window.addEventListener(eventType, this.onWheel, { passive: false });
} else {
    window.addEventListener('wheel', this.onWheel, { passive: false });
}
```

Usano `normalize-wheel` (nella versione di **akella**, Yuri Artiukh) *solo* per Firefox. E dentro `update()` c'e' una riga **commentata**:

```ts
// TweenMax.set(this._element.parentNode, { scrollTo: { y: this._position } });
```

Hanno provato la strada GSAP e l'hanno abbandonata per la scrittura diretta di `scrollTop`. E' esattamente il tipo di decisione che da fuori non si deduce mai.

**3. GSAP 2, e il plugin a pagamento e' servito in chiaro.**
`Main.ts` importa `TweenMax` da `gsap/TweenMax`, piu' `TimelineMax`/`TweenLite`: **GSAP 2, non GSAP 3**. Un sito premiato, ancora aggiornato, che gira sull'API vecchia — la retrocompatibilita' di GSAP e' il motivo per cui non hanno mai dovuto rifare. E `app/lib/com/greensock/gsap-bonus/MorphSVGPlugin.js` (36,5 KB) e' un **plugin Club GreenSock, a pagamento**, il cui sorgente integrale e' servito pubblicamente dentro la sourcemap. Hanno la licenza, quindi non e' un illecito: e' la dimostrazione che una sourcemap dimenticata pubblica **tutto**, incluso cio' che si e' pagato.

Quarta, fuori conto: `app/src/ui/Footer.ts` pesa **427.762 byte**. Un footer da 428 KB di sorgente vuol dire path vettoriali incollati dentro il codice. E in produzione restano `app/src/ui/DebugGrid.ts` (griglia di debug) e `@bugsnag/browser` (100 KB di error reporting).

### Strade 1, 3, 4

- **GitHub**: l'organizzazione `HelloMonday` esiste (`https://github.com/HelloMonday`, descrizione "Hello Monday is a creative studio in New York, Copenhagen, and Aarhus") ma ha **0 repository pubblici**. Niente da leggere li'.
- **Bundle non minificato**: no, e' minificato. Serve la mappa.
- **Librerie pubblicate**: nessuna.

**Da leggere per primo:** `app/src/scroll/ScrollController.ts` (8,4 KB) + `WheelController.ts` (3,6 KB), per capire uno scroll custom senza librerie; `app/lib/com/hellomonday/templateManager/TemplateManager.ts` (11 KB), il loro router/page-transition fatto in casa; `app/src/modules/CaseGridModule/CaseGridModule.ts` (17,4 KB) + `CaseEntry.ts` (22 KB), la griglia dei lavori, che e' il pezzo forte del sito.

---

# 2. Resn — resn.co.nz

## Strada 3: un bundle da 4 MB mai passato dal minificatore

Questa e' l'anomalia piu' grossa delle otto. Resn spedisce in produzione il **sorgente vero, con indentazione, commenti e codice commentato**, semplicemente perche' il passaggio di minificazione non c'e'.

| | |
|---|---|
| **Entry** | `https://resn.co.nz/20260721233115_1_0_a02666f/js/loader.js` — 245.606 byte |
| **Bundle principale** | `https://resn.co.nz/20260721233115_1_0_a02666f/js/main_desktop_extended.js` — **4.011.938 byte (4,0 MB)** |
| **Variante mobile** | `.../js/main_mobile.js` (HTTP 200) |
| **Config** | `.../js/config.js` (HTTP 200) |
| **Sourcemap** | **assente**, `.map` risponde 403 |

Il bundle e' una concatenazione r.js di **154 moduli AMD con i nomi originali**. Dentro ho contato **6.223 righe di commento `//`**, 2.604 aperture di blocco `/* */`, **236 `console.log`** e 115 fra `TODO`/`FIXME`/`HACK`. Non e' codice "quasi leggibile": e' il codice.

### La struttura, per intero

Backbone MVC classico, cartella per cartella:

```
config, loader
controller/   app_controller, scroll_controller, sound_controller,
              ambient_sound_controller, global_audio_fader_controller,
              keyboard_controller, scale_controller, tracking_controller
model/        app_model, project_model, projects_collection, awards_model,
              awards_collection, category_collection, interactive_model,
              interactive_collection, loader_collection, sound_model,
              tracking_collection
route/        router, route_object
events/       app_events, keyboard_events, sound_states, view_events
view/pages/   home_page, about_page, contact_page, menu_page, reel_page, privacy_page
view/modules/ background/ (gem/gem2_view, shards/shard_view, grain/grain,
                           background_drop_view, interactive/interactive_bar_view,
                           title_message_view)
              work/       menu/, overview/, project/ (30+ viste: carousel, mask,
                          archive, launch, awards, headline, videoloop, ...)
              shell/      shell_view, shell_button_view, shell_close_view, ...
              common/     transitioner/, effects/ (4 tipi di effetto testo),
                          video/ (player, timeline, play button)
util/         resn/animation, resn/math, math/clamp, math/map, in_viewport,
              anim_frame, loading/load_image, services/newsletter_subscribe,
              preloadjs/createjs_preload_plugin
shaders/      BlendShader, BlendPass, BasicBlurShader, ChokeShader,
              ColourOffsetShader, NoiseShader, PremultiplierShader
data/shaders/ gem_vertex.shader, gem_fragment.shader   ← GLSL in chiaro
```

I moduli veri e propri (esclusi i vendor) sono **126, per 2.268.648 byte di codice loro**.

### Tre cose che ci ho visto dentro

**1. Lo stack e' del 2016 ed e' ancora vivo nel 2026.**
RequireJS + Backbone + Underscore + Handlebars + jQuery 2.1.4 + **CreateJS** (EaselJS, PreloadJS, SoundJS, TweenJS) + Howler + video.js + GSAP TweenMax + three.js + `sylvester` (algebra lineare) + `cannon` (fisica). Il `require.config` elenca ancora `swfobject` e `es6-shim`, e l'HTML apre con `<!--[if lte IE 9]>`. Piu' che un sito, e' una capsula del tempo che gira. I commenti `TODO` loro lo dicono senza girarci intorno: `//todo come up with strategy for tablet`, `//todo update this if task location changes..`.

**2. Il GLSL della gemma in homepage e' pubblicato in chiaro, formattato.**
Il plugin `text!` di RequireJS inlina i file shader come stringhe **senza minificarli**. Quindi `data/shaders/gem_vertex.shader` e `gem_fragment.shader` si leggono riga per riga, con le uniform parlanti:

```glsl
uniform float ior;
uniform float colorAbberation;
uniform float externalReflectionBlend;
uniform float refractionBlend;
uniform float frenselPower;          // il refuso e' loro
uniform float reflectionBrightness;
uniform float refractionBrightness;
uniform float lightDiffuseBrightness;
uniform float lightSpecularPower;
uniform sampler2D relectionTexture;  // anche questo
```

Piu' Perlin noise 3D completo (`mod289`, `permute`, `taylorInvSqrt`, `fade`) nel vertex shader, e tre `varying vec3 vRefract / vRefractG / vRefractB` — cioe' l'aberrazione cromatica fatta rifrangendo **tre raggi separati**, uno per canale. Chi vuole capire come si fa un cristallo credibile in WebGL, qui ha la ricetta scritta.

**3. Un Web Worker che esiste solo per battere il tempo.**
`text!util/fader-worker.js` e' inlinato integrale e non minificato: 30 righe il cui unico compito e' fare `setInterval(() => postMessage('tick'), 50)`.

```js
onmessage = function (e) {
    switch (e.data) {
        case 'start':
            if (!fading) {
                fading = true;
                interval = setInterval(function () { self.postMessage('tick'); }, 50);
            }
            break;
        case 'stop':
            clearInterval(interval); fading = false; break;
    }
};
```

E' la soluzione al problema che il browser strozza `requestAnimationFrame` e i timer quando la tab passa in secondo piano: le dissolvenze audio smetterebbero a meta'. Un worker non viene strozzato allo stesso modo, quindi il fade arriva in fondo anche se guardi un'altra scheda. Nel `sound_controller` che lo usa si vedono pure le righe abbandonate:

```js
//this plays a little clip when the button shows..
//this.listenTo(Backbone, AppEvents.Shell.ShowButton, this.onShellShowButton);
```

Bonus: **il percorso degli asset e' il changelog**. `/20260721233115_1_0_a02666f/` = build del **21 luglio 2026 alle 23:31:15**, versione 1.0, **hash git corto `a02666f`**. E in fondo all'HTML c'e' il commento `version: 1.0.a02666f`. Con quello si datano i deploy senza chiedere niente a nessuno.

### Strade 1, 2, 4

- **GitHub**: organizzazione `Resn` (`https://github.com/Resn`), 8 repository, **tutti a 0 stelle**, quasi tutti task Grunt di deploy (`grunt-alibabacloud-cdn`, `grunt-alibabacloud-oss`, `ftpUploadTask`, `grunt-cloudfiles`, `grunt-ftp`), piu' `Tuio.js` (GPL-2.0) e un fork di `timesnap`. Ultimo movimento vero: 2019. Il repo `hurt-feelings` (2025) e' vuoto di descrizione. Interessanti solo come indizio: **deployavano su Alibaba Cloud**, cioe' lavoravano per il mercato cinese.
- **Sourcemap**: assente (403).
- **Librerie pubblicate**: niente di rilevante.

**Da leggere per primo:** `controller/scroll_controller`, `view/common/transitioner/transitioner` (il loro sistema di transizioni con `types/`), `view/modules/background/gem/gem2_view` (44,7 KB) insieme ai due shader, e `util/resn/animation` — che e' la loro libreria di easing interna.

---

# 3. Active Theory — activetheory.net

Niente sourcemap, ma due cose lo rendono comunque il bundle piu' informativo del gruppo: il minificatore **conserva tutti i nomi di classe**, e accanto al bundle c'e' un JSON pubblico che contiene la taratura visiva dell'intero sito.

| | |
|---|---|
| **Bundle** | `https://activetheory.net/assets/js/app.1780406240914.js` — **1.817.616 byte** |
| **Sourcemap** | **assente**. `app.js.map` risponde 200 ma con `content-type: text/html` e 5.952 byte: e' il fallback SPA, non una mappa |
| **Dati UIL** | `https://activetheory.net/assets/data/uil.1780406240914.json` — **223.372 byte**, HTTP 200, `application/json` |

Il bundle si chiude con `window._MINIFIED_=true; window._BUILT_=true;`, e il codice e' scritto in un dialetto tutto loro:

```js
Class(function WorkUI(_params) {
    Inherit(_this, XComponent);
    _this.fragName = "WorkUI";
    _this.contexts = "GLUIElement,FXScrollUI";
    ...
})
```

Il pattern `Class((function Nome(){...}))` sopravvive alla minificazione perche' il nome della funzione **e' un dato**, non un identificatore: viene letto a runtime per registrare la classe. Risultato: **396 nomi di classe leggibili**, cioe' l'indice completo del loro framework interno, **Hydra**.

### Cosa c'e' dentro Hydra (i gruppi principali)

| Gruppo | Classi |
|---|---|
| **Core** | `Hydra`, `Main`, `App`, `Container`, `Component`, `XComponent`, `Element`, `Render`, `RenderManager`, `Events`, `Router`, `Storage`, `Utils`, `Device` |
| **GLUI** — interfaccia in WebGL | `GLUI`, `GLUIStage`, `GLUIStage3D`, `GLUIElement`, `GLUIBatch`, `GLUIBatchText`, `GLUITexture`, `GLUICornerPin`, `GLText`, `GLTextGeometry`, `GLTextThread`, `GLScreenProjection`, `GLA11y` |
| **Antimatter** — particelle GPGPU | `Antimatter`, `AntimatterAttribute`, `AntimatterFBO`, `AntimatterPass`, `AntimatterSpawn`, `AntimatterUtil` |
| **UIL** — editor visuale, ~60 classi | `UIL`, `UILPanel`, `UILGraph`, `UILGraphNode`, `UILGraphLayout`, `UILTimeline`, `UILHistoryRecord`, `UILGateLogin`, `UILControlColor/Range/Vector/File/Image/Textarea`, `UILPerformance`, `UILMemory` |
| **XR / VR** | `VRCamera`, `VRInputHand`, `VRInputControllerBeam`, `VRHandFingerTip`, `XRDeviceManager`, `GazeCamera`, `UserInputGazeSelector`, `ARCamera`, `ARRenderer` |
| **Multiplayer** | `GameCenter`, `GameCenterRTC`, `GameCenterRoom`, `GameCenterSocket`, `Multiplayer`, `MultiplayerEnvironment`, `PhysicalSync`, `PhysicalLink`, `SynchronizedObjects`, `MobileSync`, `QRGen` |
| **Audio 3D** | `Audio3D`, `Audio3DResonance`, `Audio3DWA`, `Audio3DWAStream`, `Audio3DFallback`, `GlobalAudio3D` (cinque backend diversi con fallback a catena) |
| **Post-processing** | `Nuke`, `NukePass`, `HydraBloom`, `UnrealBloom`, `HydraLensStreak`, `FXAA`, `FXSceneCompositor`, `Fluid`, `FluidFBO`, `MouseFluid`, `VolumetricLight`, `Mirror`, `CubemapToEquirectangular` |
| **AI** (nuovo) | `GPT`, `InteractAI`, `Assistant`, `Speech`, `SpeechRecognition`, `ChatUI`, `ChatDOM`, `ChatUIInput`, `ChatUIResponse`, **`WebMCPManager`** |
| **Performance** | `OptimizationProfiler`, `PerformanceAnalyzer`, `RenderMonitor`, `RenderStats`, `RenderTimeQuery`, `RenderCount`, `GPU` |

Le "fragment" della pagina si leggono dall'attributo `fragName`: `Home`, `HomeLogoShader`, `HomeColumnShader`, `Work`, `WorkItems`, `WorkDetail`, `WorkDetailParticles`, `WorkPaneUI`, `About`, `AboutLogoShader`, `Contact`, `CleanRoom`, `CleanRoomGlass`, `CleanRoomRefractionScene`, `TreeScene`, `TreeWaterShader`, `TreeFBR`, `TreeMirror`, `JellyInstancer`, `JellyShader`, `HexagonGrid`, `TubeController`, `TubePlayer`, `SpineInstancer`, `LogoParticle`, `LoaderGLUI`, `MusicPlayerDOM`.

### Tre cose che ci ho visto dentro

**1. `uil.1780406240914.json`: 2.593 parametri, cioe' la direzione artistica come dato.**
Il file e' il salvataggio del loro editor interno, ed e' pubblico. Ogni chiave e' un controllo tarato a mano da un art director:

```
CAMERA_Element_3_home_scenefov                          = 30
CAMERA_Element_3_home_scenegroupPos                     = [0, 1.95, 8.02]
CAMERA_Element_3_home_scenedeltaRotate                  = 3
CAMERA_Element_3_home_scenewobbleStrength               = ...
UnrealBloomComposite/.../home/bloomStrength             = 3.82
UnrealBloomComposite/.../globalbloom/bloomStrength      = 0.3
UnrealBloomComposite_shaderVariants_homebloomStrength   = 0.6
UnrealBloomComposite_shaderVariants_contactbloomRadius  = 0.5
UnrealBloomLuminosity/.../cleanroom/luminosityThreshold = 0.2
```

I gruppi: 1.266 chiavi `INPUT_*` (uniform degli shader), 333 `MESH_*`, 126 `TreeFBR`, 104 `PBR`, 66 `CAMERA`, piu' i blocchi per `HomeLogoShader`, `FloorShader`, `JellyShader`, `WallShader`, `WorkItemShader`, `GlassCubeShader`, `TreeWaterShader`. **Ogni pagina ha la sua variante di bloom.** Non e' un effetto acceso una volta: e' un'illuminazione ritarata scena per scena, e i numeri sono li' da leggere. Per uno studio che vuole capire *quanto* si spinge un bloom prima che diventi volgare, questo file vale piu' del codice.

**2. Il sito dello studio si porta dietro l'intero stack VR, AR e multiplayer che non usa.**
`VRInputControllerHand`, `GameCenterRTC`, `MultiplayerEnvironment`, `PhysicalSync`, `ARRenderer`: niente di tutto questo serve a `activetheory.net`. Sono nel bundle perche' **il sito e' costruito con lo stesso Hydra dei loro progetti**, e non fanno tree-shaking per pagina. E' il costo che accettano per avere una base sola. Con `WebMCPManager` e `GPT` accanto a `ChatUI`, si vede anche la direzione nuova: un assistente conversazionale dentro l'esperienza WebGL.

**3. Il modo di sviluppo e' scritto nel bundle.**

```js
if (window._PROJECT_NAME_) {
    Dev.pathName  = `/${window._PROJECT_NAME_}/HTML/`;
    Dev.filesPath = Dev.pathName;
}
```

In sviluppo Hydra carica **i file singoli non impacchettati** da una cartella `/NOME_PROGETTO/HTML/`. Zero build step mentre si lavora: si salva, si ricarica, i file sono quelli. Il bundle e' solo l'ultimo passo. E' una scelta che spiega la loro velocita' — e che si puo' copiare. (Su `activetheory.net` quella cartella non e' esposta: risponde con il fallback HTML.)

### Strada 4: le librerie, e sono buone

L'organizzazione `activetheory` ha 11 repository pubblici, quasi tutti MIT, e non sono giocattoli:

| Repo | Stelle | Ultimo push | Licenza | Cosa fa |
|---|---:|---|---|---|
| **`activeframe`** | **398** | 2026-04-30 | MIT | formato video `.af` su WebCodecs: riproduzione **frame-accurate senza tag `<video>`**. E' la risposta al problema che tutti hanno con lo scrubbing video da scroll |
| `split-text` | 69 | 2025-06-05 | MIT | spezza il testo in righe/parole/caratteri (l'alternativa gratuita a SplitText di GSAP) |
| `fit-text` | 36 | 2025-01-30 | MIT | adatta il testo al contenitore |
| `balance-text` | 19 | 2025-01-30 | MIT | distribuisce il testo sulle righe |
| `svg2msdf` | 28 | 2025-04-12 | — | genera campi di distanza multicanale da SVG (per il testo nitido in WebGL) |
| `ios-silent-bypass` | 26 | 2025-01-30 | MIT | fa suonare l'audio su iPhone **anche con l'interruttore su silenzioso** |
| `GaussianSplats3D` | 4 | 2023-11-13 | MIT | gaussian splatting in three.js |
| `Paper-Planes-Android-Experiment` | 277 | 2016 | — | il progetto Google del 2016 |
| `Finding-Love-Shaders` | 52 | 2017 | — | shader di un loro caso |

`activeframe` + `svg2msdf` + `split-text` + `ios-silent-bypass` messi insieme sono, di fatto, **quattro pezzi del loro toolset regalati**. Chi vuole imitarli parte da li'.

---

# 4. Lusion — lusion.co

Niente sourcemap, ma il build Astro/esbuild conserva i nomi delle classi e **non tocca le stringhe GLSL**. Risultato: si legge l'architettura completa e tutti gli shader.

| | |
|---|---|
| **Bundle** | `https://lusion.co/_astro/hoisted.CUO_IjfL.js` — **1.251.728 byte**. E' l'unico: anche `/about` carica lo stesso file |
| **Sourcemap** | **assente**. `.map` risponde 200 ma e' l'HTML di fallback di Netlify. Zero occorrenze di `sourceMappingURL` nel bundle |
| **Classi leggibili** | **229** |

### Le classi loro, per sezione

```
Pagine / router     Page, PageManager, PageExtraSections, ProjectsPage, ProjectPage,
                    AboutPage, PlaygroundPage, Route, RouteManager, TransitionOverlay,
                    HttpError, Header, Links, NewletterForm  (il refuso e' loro)
Home                HomePage, HomeHeroSection, HomeFeaturedSection, HomeReelSection,
                    HomeBalloons, HomeBalloonsBody, HomeBalloonsBackground,
                    HomeBalloonsPhysics, HomeGoalSectionTunnelTitle
Sezione "Goal"      GoalSection, GoalSectionRanges, GoalTunnels, GoalBlackTunnel,
                    GoalWhiteTunnel, GoalWhiteTunnelParticles, GoalWhiteTunnelStickers,
                    GoalTunnelAstronauts, GoalTunnelGlass, GoalTunnelEfx,
                    GoalTunnelsBackground
About               AboutHero + Faces, Fog, Ground, Halo, Letters, Light, LightField,
                    Lines, Particles, ParticlesSimulation, Rocks, Scatter;
                    AboutWhoLogo, AboutWhoSection, WhoSubsectionWeAre,
                    WhoSubsectionTeam, WhoSubsectionDetails, AboutAwardSection,
                    AboutCapabilitySection, AboutClientSection,
                    AboutPageHeroEfx, AboutPageHeroEfxPrepass
Progetti            ProjectItem, ProjectItemList, ProjectsMainSection,
                    ProjectDetailsSection, ProjectDetailsScreen, ProjectDetailsItem(s),
                    ProjectDetailsData
Scroll              ScrollManager, ScrollPane, ScrollDomRange, ScrollNavSection
Animazione          Tween, Ease, FlipAnimation, FlipSim, SecondOrderDynamics,
                    BrownianMotion, Simple1DNoise, TextAnimationHelper
Post-processing     Postprocessing, PostEffect, PostUfx, PreUfx, Bloom, Blur, Smaa,
                    BlueNoise, ScreenPaint, ScreenPaintDistortion, Final,
                    UfxMesh, UfxTextMesh, FboHelper, GlPositionOffset
Audio               Audios, AudioGroup, AudioItem, GlobalAudios, HomePageAudios,
                    AboutPageAudios, ProjectPageAudios, Player
Caricamento         Preloader, LoadingManager, Task, TaskManager, BufItem, FontItem,
                    EXRItem, EXRLoader, TextureItem, TextureHelper, ThreeLoaderItem
Infrastruttura      Stage3D, Visuals, Settings, Support, Browser, DomHelper, Input,
                    MathUtils, Properties
```

### Tre cose che ci ho visto dentro

**1. Non usano GSAP. Non usano Lenis. Non usano nessuna libreria di animazione.**
Ho cercato nel bundle: `gsap` → **0 occorrenze**, `GreenSock` → 0, `lenis`/`Lenis` → 0, `Tweakpane` → 0, `howler` → 0, `ammo`/`Rapier` → 0, `wasm` → 0. C'e' three.js (`REVISION = "158"`) e basta. Tutto il resto e' loro: `Tween`, `Ease`, `ScrollManager`, `TaskManager`, `HomeBalloonsPhysics` (fisica dei palloncini scritta a mano invece di importare un motore).

In mezzo c'e' una classe che vale il viaggio: **`SecondOrderDynamics`**. E' il sistema del secondo ordine reso popolare per l'animazione procedurale: invece di interpolare fra A e B con una curva, si simula una molla con inerzia. La firma e' quella canonica:

```js
class SecondOrderDynamics {
    constructor(x0, f = 1.5, z = 0.8, r = 2, robust = true) { ... }
}
```

`f` = frequenza, `z` = smorzamento, `r` = risposta iniziale (con `r > 1` il movimento **anticipa**, sfora e rientra). Due cose fatte bene:

- funziona **sia su numeri sia su vettori**, e sceglie il ramo una volta sola nel costruttore (`this.update = isVector ? this._updateVector : this._updateNumber`) invece di ramificare a ogni frame;
- ha `_computeRobustStableCoefficients` accanto a `_computeStableCoefficients`, cioe' la variante che resta stabile quando il `deltaTime` si allunga — il caso in cui una molla scritta male esplode: cambio di scheda, frame perso, portatile che va in throttling.

E' *il* motivo per cui il movimento su Lusion sembra materia e non transizione CSS, ed e' un file solo.

**2. Il GLSL e' tutto in chiaro, e la convenzione di nomi rivela come pensano.**
Nel bundle si contano 83 `varying vec2 v_uv;`, 28 `varying vec3 v_worldPosition;`, 23 `uniform float u_time;`, 16 `varying vec3 v_viewNormal;`, 14 `varying float v_depth;`. Prefissi `u_` per le uniform e `v_` per le varying, rigorosi. Ma due nomi dicono la cosa importante:

```glsl
uniform vec2  u_domWH;              // 8 occorrenze
uniform float u_showRatio;          // 9
uniform float u_activeRatio;        // 7
uniform float u_noiseStableFactor;  // 8
```

`u_domWH` e' **la larghezza e altezza del box DOM passate dentro lo shader**. Vuol dire che il layout resta HTML/CSS e la WebGL ci si allinea sopra, non il contrario: si scrive il sito normalmente e poi si "veste" ogni elemento con il suo materiale. `u_showRatio` e `u_activeRatio` sono i due assi con cui pilotano ogni effetto — quanto e' entrato, quanto e' attivo. Due numeri fra 0 e 1 per tutto il sito.

**3. L'audio e' progettato per pagina, non per sito.**
`GlobalAudios`, poi `HomePageAudios`, `AboutPageAudios`, `ProjectPageAudios`, sopra `AudioGroup` / `AudioItem` / `PositionalAudio`. Non c'e' una colonna sonora sola: ogni pagina ha il suo banco di suoni, raggruppati, e alcuni sono posizionali nello spazio 3D. E' costruito come il sonoro di un gioco, non come il jingle di un sito.

### Strade 1, 3, 4

- **GitHub**: **niente**. L'organizzazione `github.com/lusion` esiste ma non e' loro (6 repository PHP fermi al 2013: fork di `dompdf`, `ajaxplorer`). `lusionltd` non esiste. Cercando "lusion" si trovano solo **cloni e ricostruzioni di terzi**, che sono comunque interessanti come materiale didattico: `canxerian/lusion-reverse-engineered` (15 stelle, "A recreation of lusion.co, for fun and education", aggiornato gennaio 2026), `high-haseeb/lusion-clone` (14), `antonbobrov/r3f-lusion-portal` (7). **Non e' il loro codice** e va detto ogni volta che si cita.
- **Bundle non minificato**: no.
- **Librerie pubblicate**: nessuna.

---

# 5. Locomotive — locomotive.ca

Gia' documentato per esteso in `locomotive.md`. **Riconfermato oggi**: `https://locomotive.ca/assets/scripts/app.js.map` risponde HTTP 200, **10.626.128 byte (10,6 MB)**, `last-modified: 23 luglio 2026`, `content-type: application/octet-stream`. 642 sorgenti con `sourcesContent` completo.

In sintesi, per non ripetere: sistema a moduli proprietario **modujs**, **locomotive-scroll v5** che gira su **Lenis 1.1.9**, **@barba/core** per le transizioni, **three.js r165** con DRACO, Vue 3 solo per i form, Swiper, hls.js. E la cartella `assets/scripts/sixty/` con il motore 3D del personaggio "Lisa" (materiali `PBR`, `Skin`, `Eye`, `Lashes`, `Cloth`, file `.fs`/`.vs`).

## Strada 4: qui Locomotive stacca tutti

L'organizzazione `locomotivemtl` ha **99 repository pubblici**, ed e' l'unico caso in cui lo studio ha reso pubblico non un pezzo, ma **il proprio modo di lavorare per intero**.

| Repo | Stelle | Ultimo push | Licenza | Cosa e' |
|---|---:|---|---|---|
| **`locomotive-scroll`** | **8.837** | 2026-06-30 | MIT | la libreria che ha definito il genere |
| **`locomotive-boilerplate`** | **482** | 2025-07-24 | MIT | il loro starter front-end: e' **lo scheletro del sito che ho appena letto nella sourcemap** |
| `astro-boilerplate` | 65 | 2026-07-06 | MIT | starter Astro |
| `webgl-images` | 52 | 2024-07-05 | MIT | modulo per rendere le immagini in WebGL senza scrivere shader |
| `charcoal-cms` | 52 | 2025-11-04 | MIT | il loro CMS PHP (e ~50 moduli `charcoal-*` attorno) |
| `locomotive-react-boilerplate` | 30 | 2024-06-25 | — | variante React |
| `front-end-helpers` | 16 | 2026-05-20 | — | utility di flusso di lavoro |
| `wordpress-boilerplate` | 16 | 2026-04-09 | — | starter WordPress |
| `smooth-scrollbar` | 12 | 2018 | MIT | il predecessore |
| `locomotive-modularload` | 5 | 2021 | MIT | transizioni di pagina + lazy loading |
| `craft-boilerplate` | 2 | 2026-05-27 | — | starter Craft CMS |
| `locomotive-nuxt` | 4 | 2022 | — | starter Nuxt |

La cosa da capire: **`locomotive-boilerplate` e la sourcemap di `locomotive.ca` sono la stessa cosa vista da due lati.** Il repository ti da' la struttura pulita e le istruzioni; la sourcemap ti mostra come diventa quella struttura dopo tre anni di sito vero. Leggerli in parallelo e' il modo piu' veloce che conosco per capire come uno studio serio organizza un progetto.

---

# 6. Immersive Garden — immersive-g.com

Niente sorgenti, ma l'architettura si legge dai nomi dei file, e c'e' una libreria loro che vale il tempo.

| | |
|---|---|
| **Entry** | `https://immersive-g.com/assets/entry.nmlBdY4S.js` — **2.019.596 byte** |
| **Chunk per rotta** | `HomePage.BJ24Kf7s.js`, `AboutPage.*`, `Page.BdwCS1VQ.js`, `IntroLoader.D9qttrK0.js`, `Preloader.CCgyJU7b.js`, `HeroBlock.DUCPflPV.js`, `AllProjectsButton.Bx43zUpN.js`, `BasicButton.CR_WlI1j.js`, `asyncData.DiVkeOqy.js`, `cremap.CU3cgCQg.js`, `mergeDeep.wrZMLiVW.js`, `proto.mddEFhu4.js`, `preview.DzD8FdCf.js` |
| **Dati** | `https://immersive-g.com/_payload.json` — il payload Nuxt con i contenuti della pagina |
| **Sourcemap** | **assente**: tutti i `.map` danno 404 su Vercel |

Stack: **Nuxt 3 + Vite**, **three.js**, **lenis**, e la micro-libreria **`bidello`** (`class Bidello`, `class Component`, `class ComponentContainer`) usata come scheletro a componenti/eventi.

### Tre cose che ci ho visto dentro

**1. C'e' Firebase per intero dentro il bundle di un sito vetrina.**
Ho trovato i marcatori di: `@firebase/app`, `analytics`, `app-check`, `auth`, `database`, `firestore`, `functions`, `installations`, `messaging`, `performance`, `remote-config`, `storage` — **piu' tutte le rispettive varianti `-compat`**. E' una quantita' di codice sproporzionata per un portfolio, e spiega da sola una fetta del peso. La presenza di `AppCheckToken` e' il dettaglio piu' rivelatore: **Firebase App Check e' un antiscraping**, serve a dimostrare che le chiamate arrivano dalla loro app vera. Uno studio che protegge il proprio portfolio dai bot.

**2. Il code splitting per rotta rende pubblica la mappa del sito.**
I nomi dei chunk sono parlanti (`IntroLoader`, `Preloader`, `HeroBlock`, `AllProjectsButton`) perche' Vite li deriva dal nome del componente Vue. Sommati a `/_payload.json`, danno l'ossatura del progetto senza aprire una riga di codice: quali pagine esistono, quali componenti hanno un peso proprio, dove sta il confine fra intro e contenuto. Questo vale come promemoria anche per noi: **i nomi dei file di build sono documentazione pubblica.**

**3. Il loro `igpu` e' su WebGPU, il sito no.**
L'organizzazione `immersive-garden` ha 2 repository: **`igpu`** ("Minimal WebGPU Library", licenza Unlicense — cioe' pubblico dominio — ultimo push **6 luglio 2026**) e `glsl-easings` (le easing di Robert Penner in GLSL per glslify, 2 stelle). Nel bundle del sito **non c'e' traccia di WebGPU**: zero occorrenze di `navigator.gpu`, `requestAdapter`, `createShaderModule`. Quindi `igpu` e' dove stanno andando, non dove sono. Un repository aggiornato il mese scorso, in pubblico dominio, di uno studio di quel livello, e' esattamente il posto da cui partire per WebGPU.

### Strade 1, 3

- **GitHub del sito**: no.
- **Bundle non minificato**: no.

---

# 7. Merci Michel — merci-michel.com

| | |
|---|---|
| **Bundle** | `https://www.merci-michel.com/static/20260528_090036/js/build.js` — **214.667 byte** (61.261 compressi) |
| **Vendor** | `.../js/vendors.js` — **1.561.026 byte** (456.190 compressi) |
| **Sourcemap** | **assente**: `.map` risponde 404 su entrambi |

Il codice e' minificato, ma abbastanza nomi sopravvivono da ricostruire l'impianto: `ModulesManager`, `ModulesLoader`, `AbstractModule`, `TemplateRenderer`, `ManifestLoader`, `ContextManager`, `VideoPlayer`, e i moduli di pagina `ProjectsModule`, `ProjectModule`, `AboutModule`, `ContactModule`. La forma del codice (`t.prototype.x = function(){}` racchiuso in `(function(){ ... return t })()`) e' quella tipica di **CoffeeScript compilato** — altro pezzo di eredita' che non hanno buttato.

### Tre cose che ci ho visto dentro

**1. Nell'HTML di produzione ci sono commenti scritti da una persona, che spiegano le scelte di rete.**

```html
<!-- Image origin loads on every view: preconnect early so the handshake overlaps head parsing -->
<link rel="preconnect" href="https://storage.googleapis.com" crossorigin />
<!-- Video origin is only hit on project video pages: dns-prefetch (cheap) avoids a site-wide handshake -->
<link rel="dns-prefetch" href="..." />
```

Non e' codice, e' **motivazione**. Qualcuno ha deciso `preconnect` per le immagini (che servono sempre) e `dns-prefetch` per i video (che servono solo su alcune pagine), e ha scritto perche', nel file che va in produzione. E' una pratica che vale la pena rubare: il commento costa 120 byte e sopravvive al passaggio di consegne.

**2. In produzione ci sono gli helper di debug di three.js e la fisica.**
Nel bundle: `CannonDebugRenderer`, `DirectionalLightHelper`, `CameraHelper`, `BufferGeometryLoader`, `WebGLRenderer`. Cioe' **three.js + cannon.js**, con il renderer di debug della fisica ancora dentro. E' lo stesso segno che si vede su Hello Monday (`DebugGrid`): gli strumenti di sviluppo restano nel bundle spedito, sempre.

**3. Le animazioni sono guidate da un vocabolario di classi CSS con prefissi di stato.**
Le stringhe nel bundle disegnano il sistema: `animation-in`, `animation-out`, `animation-in-next`, `animation-in-prev`, `animation-in-next-delay`, `animation-fade-out`, piu' i prefissi di ambiente `device-desktop` / `device-tablet` / `device-phone`, `browser-chrome-` / `browser-firefox-` / `browser-safari-` / `browser-ie-`, e i selettori `css-renderer`, `css-renderer--show`. Non animano da JavaScript: **mettono e tolgono classi, e il CSS fa il resto**, con varianti per direzione di navigazione (next/prev) e per browser. Un `css-renderer` accanto al WebGL dice anche che hanno due percorsi di rendering, e scelgono.

### Strada 4: la libreria e' pubblica, ma e' un reperto

L'utente GitHub **`MM56`** e' ufficialmente Merci-Michel (nome "Merci-Michel", bio "Merci-Michel is a digital production house", sito `merci-michel.com`). 31 repository:

| Repo | Stelle | Anno | Cosa e' |
|---|---:|---|---|
| `MM.Loader` | 26 | 2015 | preloader su Web Worker |
| `mm-packer` | 20 | 2017 | impacchetta piu' asset in un file per **ridurre le richieste HTTP** |
| `mm-utils-math` | 17 | 2017 | le utility matematiche usate sui loro progetti |
| `labase` | 9 | 2016 | "la base quoi" — il loro starter |
| `mm-unpacker` | 7 | 2017 | il lato client di `mm-packer` |
| `Magipack.js` | 5 | 2015 | antenato di `mm-packer` |
| `MM.SVGPath` | 4 | 2015 | manipolazione di path SVG |
| `mm-render`, `mm-signal`, `mm-movieclip`, `mm-agent`, `mm-sharer` | 0-1 | 2017-2018 | i pacchetti del loro framework |
| `speedrun`, `speedrun-threejs` | 1-2 | 2015 | starter HTML e three.js |

Tutto fermo fra il 2014 e il 2018. Ma i nomi raccontano una cosa che conta: **`mm-signal`, `mm-movieclip`, `mm-render`**. Signal e MovieClip. E' la stessa architettura Flash che ho trovato in Hello Monday (`com/hellomonday/signals/Signal.ts`). Due studi europei di quella generazione, senza rapporti fra loro, hanno portato in JavaScript **lo stesso identico modello mentale**. Se si vuole capire perche' i siti di quella scuola si muovono in un certo modo, e' qui che sta la radice.

`mm-packer` merita una nota a parte: e' un pezzo di ingegneria nato per un problema (troppe richieste HTTP) che HTTP/2 ha in gran parte risolto. Leggere un repo del genere e' anche un promemoria su quali ottimizzazioni invecchiano.

---

# 8. Obys — obys.agency

Il piu' chiuso degli otto, e l'unico che si nasconde di proposito. Ma quel che si ricava e' interessante lo stesso — e in parte sorprendente.

## Il bundle e' dietro un piccolo cifrario

Nell'HTML non c'e' **nessun** `<script src>` che punti a un bundle. Ci sono solo tre script: gtag, un blocco `<script id="__SEED__" type="application/octet-stream">` (che quindi non viene eseguito) e un bootstrap inline. Il seed e' base64 di un testo messo in XOR con la chiave presa dall'attributo `data-v` — che nel mio scarico era `?msh4f1r6`. Decifrato:

```json
{"cfg":{"v":"?msh4f1r6"},
 "rt":{"cur":{"url":"/","pg":"ho"},"prv":{"url":false,"pg":false}},
 "is":{"ho":true},"was":{}}
```

Cioe' lo **stato iniziale del router** passato dal server (pagina corrente `ho` = home, pagina precedente nessuna). Poi il bootstrap fa il resto:

```js
let I = /Mobi|Android|Tablet|iPad|iPhone/i.test(navigator.userAgent) || isIPadOS ? "m" : "d";
link.href   = `/css/${I}.css${H}`;
script.src  = `/js/${I}.js${H}`;
document.onreadystatechange = () => { if (readyState === "complete") body.appendChild(script); };
```

Quindi i file veri sono:

| File | Dimensione (compressa) | Dimensione reale |
|---|---:|---:|
| `https://obys.agency/js/d.js?msh4f1r6` (desktop) | 37.776 | **119.748** |
| `https://obys.agency/js/m.js?msh4f1r6` (mobile) | 20.334 | **59.566** |

Sourcemap: **404** su tutte le varianti. Il codice e' minificato stretto, nomi a una lettera. **Non e' leggibile come sorgente.** Quello che si legge e' il vocabolario delle classi CSS, che e' comunque parlante: `ho-wo-0-ti` (home-work-0-title), `ho-wo-2-hv`, `ab-fo-hover` (about-founder), `ab-co-ga-i` (about-contact-gallery-item), `header-contact`, `header-time`, `fix-de`.

### Tre cose che ci ho visto dentro

**1. Il sito piu' "da Awwwards" del gruppo gira su 120 KB di JavaScript senza nessuna libreria di animazione.**
Ho cercato: `gsap` → **0**, `lenis` → 0, `three`/`THREE` → 0, `barba` → 0, `swiper` → 0, `pixi` → 0. Nel bundle mobile (`m.js`), zero anche quelle. Al posto di GSAP c'e' **la Web Animations API nativa**, avvolta in un mini-DSL loro. In superficie il codice chiama cose cosi':

```js
this.fxTitle[h]?.animate({ a: "show", d: 1200, e: "o6"        })?.play();
this.fxMeta[h] ?.animate({ a: "show", d: 1200, e: "o6", de: 60 })?.play();
this.meFx[i]   ?.animate({ a: "hide", d:  300, e: "o2"        })?.play();
```

`a` = azione (show/hide), `d` = durata, `e` = easing, `de` = ritardo. Sotto, quel wrapper costruisce due keyframe e chiama il browser:

```js
const [Z, K] = this.keyframes();
for (const H of this.els) {
    const q = H.animate([Z, K], { duration: E, delay: $, easing: Q, fill: "forwards" });
    this.anims.push(q);
}
this.anims[this.anims.length - 1].onfinish = () => { /* commit dei valori finali */ };
```

Tre dettagli che meritano attenzione perche' sono le cose che di solito si sbagliano:

- **committano e poi cancellano.** Dopo `onfinish` scrivono lo stato finale nello stile inline e chiamano `.cancel()` sull'animazione (`U.onfinish = () => { T.style.transform = "translateY(0)"; U.cancel(); }`). E' il modo corretto di usare `fill: "forwards"` senza lasciare in giro animazioni che restano attaccate all'elemento.
- **un solo ticker.** C'e' una classe con `tk() { requestAnimationFrame(this.tick) }` e una lista di callback: un `requestAnimationFrame` per tutto il sito, non uno per componente.
- **`willChange` messo e tolto.** Dopo la fase di disegno dei tracciati SVG chiamano una funzione che **rimuove** `will-change`. Igiene che quasi nessuno fa.

Le easing hanno nomi corti (`o2`, `o3`, `o6` — presumibilmente potenze crescenti di ease-out), e dove servono esplicite usano `cubic-bezier(0.16, 1, 0.3, 1)` e `cubic-bezier(0.22, 1, 0.36, 1)`. Il resto e' `IntersectionObserver`, `clipPath: inset(...)`, `transform` e `getComputedStyle`. Fra le stringhe piu' frequenti: `opacity` (49), `transform` (47), `offsetTop` (31), `offsetHeight` (24).

Questo, per un'agenzia italiana che deve decidere che stack adottare, e' il dato piu' utile di tutta la ricerca: **si puo' vincere premi con 120 KB e la piattaforma nuda** — a patto di scrivere le tre righe di igiene che GSAP di solito scrive al posto tuo.

**2. Eppure la WebGL c'e', ed e' scritta a mano.**

```js
let _ = Y.i("gl").getContext("webgl2", { antialias: true, alpha: true });
this.gl = _;
```

Contesto **WebGL2 grezzo** preso su un elemento con id `gl`, senza three.js e senza OGL. Hanno scritto il proprio strato minimo. Non e' una scelta comoda, e' una scelta di peso: three.js minificato costa piu' dell'intero loro bundle.

**3. Due siti diversi, scelti in base allo user agent, e una CSP con nonce.**
Non c'e' un layout responsive unico: ci sono **due build separate** — `d.js` + `d.css` contro `m.js` + `m.css` — e la scelta si fa a runtime sniffando lo user agent (con il caso iPadOS gestito a parte via `platform === "MacIntel" && maxTouchPoints > 2`). E' l'opposto della dottrina corrente, e ha un prezzo evidente: il mobile riceve meta' codice, ma il primo byte di JS parte **solo a `readyState === "complete"`**. Tutto viaggia sotto una CSP con `nonce`, e il sito e' su nginx con `Cross-Origin-Embedder-Policy: credentialless`.

### Strade 1, 2, 4

- **GitHub**: **niente di ufficiale**. La ricerca restituisce 1.593 risultati, tutti **cloni di terzi**: `poojahooda22/obys-clone` (51 stelle), `sheryislive/obys-agency` (33), `Mausam5055/Obys-Clone-Gsap` (11), `peyush-nuwal/Obys` (12). Vale la pena notare l'ironia: **i cloni sono quasi tutti fatti in GSAP, mentre l'originale GSAP non lo usa.** Chi impara da quei repo impara a imitare l'effetto, non il metodo.
- **Sourcemap**: assente.
- **Librerie pubblicate**: nessuna.

---

# Tabella riassuntiva

| Sito | Git pubblico | Sourcemap | Bundle leggibile | Cosa vale la pena leggere |
|---|---|---|---|---|
| **Hello Monday** | org `HelloMonday`, **0 repo** | **SI** — `build/js/main-*.js.map`, **5,98 MB**, 415/415 `sourcesContent`. Nessun commento nel bundle: **URL indovinato** | via mappa: 77 file `.ts` loro, boilerplate `HM-Starter` | `scroll/ScrollController.ts` + `WheelController.ts` (scroll a mano, ramo Firefox, riga GSAP commentata); `templateManager/TemplateManager.ts`; `CaseGridModule/` |
| **Locomotive** | **99 repo**, `locomotive-scroll` 8.837★, `locomotive-boilerplate` 482★ | **SI** — `assets/scripts/app.js.map`, **10,6 MB**, 642 sorgenti | via mappa: modujs, 34 moduli, cartella `sixty/` | il repo `locomotive-boilerplate` **letto in parallelo alla sourcemap**: la stessa struttura pulita e poi vissuta |
| **Resn** | org `Resn`, 8 repo, tutti 0★, fermi al 2019 | no (403) | **SI, il piu' completo** — `main_desktop_extended.js` **4,0 MB mai minificato**, 154 moduli, 6.223 commenti, 236 `console.log` | `data/shaders/gem_*.shader` (GLSL formattato, aberrazione a 3 raggi); `util/fader-worker.js`; `view/common/transitioner/`; `controller/sound_controller` |
| **Active Theory** | org `activetheory`, 11 repo MIT: **`activeframe` 398★**, `split-text` 69★, `ios-silent-bypass` 26★, `svg2msdf` 28★ | no (fallback HTML) | **SI a livello di nomi** — `app.*.js` 1,82 MB, **396 classi** del framework Hydra | **`assets/data/uil.*.json`, 223 KB, 2.593 parametri tarati** (fov, bloom per pagina, uniform); poi i repo `activeframe` e `svg2msdf` |
| **Lusion** | **nessuno** (l'org `lusion` non e' loro) | no (fallback Netlify) | **SI a livello di nomi + GLSL** — `_astro/hoisted.*.js` 1,25 MB, **229 classi**, shader in chiaro | `SecondOrderDynamics` (il motivo per cui il movimento sembra materia); la convenzione `u_domWH`/`u_showRatio`/`u_activeRatio`; il banco audio per pagina |
| **Immersive Garden** | org `immersive-garden`, 2 repo: **`igpu`** (WebGPU, Unlicense, luglio 2026), `glsl-easings` | no (404) | solo architettura — Nuxt 3 + Vite, chunk parlanti, `/_payload.json` | il repo **`igpu`**; e come lezione: Firebase completo + App Check dentro un portfolio |
| **Merci Michel** | utente **`MM56`**, 31 repo, tutti 2014-2018: `MM.Loader` 26★, `mm-packer` 20★, `mm-utils-math` 17★ | no (404) | parziale — `build.js` 215 KB, nomi `ModulesManager`/`TemplateRenderer` sopravvissuti, forma CoffeeScript | i **commenti sui resource hint nell'HTML di produzione**; i pacchetti `mm-signal`/`mm-movieclip` (la stessa radice Flash di Hello Monday) |
| **Obys** | **nessuno** — solo cloni di terzi (in GSAP, che loro non usano) | no (404) | no — minificato stretto, bundle nascosto dietro XOR | il fatto in se': **120 KB, zero librerie, Web Animations API + WebGL2 a mano, due build separate desktop/mobile**; e le tre righe di igiene (commit+`cancel()`, ticker unico, `will-change` rimosso) |

---

# Cosa mi porto via, per il nostro lavoro

**Sul metodo di ricerca.** La sourcemap resta la strada piu' redditizia e la piu' trascurata, ma va cercata bene: su Hello Monday **il commento nel bundle non c'era** e la mappa c'era lo stesso. La regola operativa e': scaricare il bundle, poi chiedere comunque `<bundle>.js.map`, e **controllare il `content-type`** — un 200 con `text/html` e' il fallback della SPA, non una mappa. Su Netlify e sui `_astro/` questo inganna sempre.

**Sulle strade laterali.** Due volte su otto il pezzo migliore non era ne' git ne' sourcemap: era **un JSON di configurazione** (Active Theory, 2.593 parametri) e **un bundle che nessuno aveva minificato** (Resn, 4 MB). Vale la pena guardare anche gli asset che non sono `.js`.

**Sullo stack.** Il dato che ribalta le aspettative: **tre studi su otto non usano GSAP** (Lusion, Obys, Active Theory), e due non usano nemmeno three.js (Obys, Hello Monday che sta su Pixi). Obys vince premi con 120 KB e la piattaforma nuda; Lusion sostituisce l'easing con un sistema del secondo ordine. La libreria non e' il livello di qualita': lo e' il controllo su cosa succede a ogni frame.

**Sull'eredita' Flash.** Hello Monday (`com/hellomonday/signals/Signal.ts`) e Merci Michel (`mm-signal`, `mm-movieclip`) hanno, indipendentemente, portato in JavaScript la stessa architettura ActionScript 3. Non e' nostalgia: e' un modello a eventi tipizzati e a timeline che regge meglio del modello a componenti quando l'animazione e' il prodotto.

**Sull'igiene.** In produzione, su siti da premio, restano: griglie di debug (`DebugGrid`), renderer di debug della fisica (`CannonDebugRenderer`), 236 `console.log`, plugin a pagamento in chiaro, l'intero SDK Firebase, e stack VR/multiplayer mai usati. Non e' un invito a essere sciatti — e' la misura di quanto poco quel peso conti rispetto al resto, e di quanto poco senso abbia rimandare un lancio per ripulire il bundle.
