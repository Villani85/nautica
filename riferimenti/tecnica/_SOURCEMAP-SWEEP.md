# Battuta di caccia alle sourcemap in produzione

Scansione sistematica di **151 domini** presi dagli albi pubblici dei premi (Awwwards Site of
the Day, FWA of the Day, piu' un blocco di studi e prodotti gia' premiati), per rispondere a
una domanda che nessuno ha mai misurato con un numero:

> **Quanti siti da premio dimenticano la sourcemap in produzione?**

Data della scansione: 13 agosto 2026. Tutte le richieste sono state fatte davvero.

---

## LA REGOLA ETICA, prima di tutto

> **Si legge solo cio' che il server offre pubblicamente.**

Questa non e' una clausola di stile: e' il confine operativo di tutto il documento.

1. **Solo GET pubbliche, senza credenziali.** Nessun login, nessun cookie rubato, nessun
   header falsificato per superare un controllo. Se il server risponde 403 o 401, la risposta
   e' "no" e la si scrive nella tabella come "no".
2. **Nessuna forzatura.** L'unica richiesta "a indovinare" e' `NOMEBUNDLE.js.map`: e' lo
   stesso URL che il browser chiederebbe da solo se il commento `sourceMappingURL` ci fosse.
   Non e' fuzzing di directory, non e' un dizionario di path, non e' scansione di porte.
   Un solo tentativo per bundle, sull'URL canonico previsto dallo standard Source Map v3.
3. **Nessun dato personale.** Se un bundle o una sourcemap contiene indirizzi, e-mail, chiavi
   o dati di persone, si chiude il file e non si trascrive niente. Qui si guarda **come e'
   fatto il codice**, non chi c'e' dentro.
4. **Nessuna chiave usata.** Se salta fuori un token o una chiave API, non la si prova, non la
   si scrive in chiaro, non la si conserva. Al massimo si annota "presente" e la si segnala.
5. **Senza licenza si studia, non si copia.** Un sorgente ricostruito da sourcemap **non e'**
   codice libero. Non c'e' LICENSE, quindi resta protetto dal diritto d'autore dell'autore.
   Si legge, si capisce la tecnica, si riscrive con parole proprie. **Non si incolla nel
   progetto di un cliente.** Questo vale al 100% e senza eccezioni per tutto cio' che segue.
6. **Carico gentile.** Poche richieste per dominio (una pagina HTML, al massimo otto bundle
   letti a spizzichi con `Range`), timeout stretti, niente ripetizioni a raffica. La caccia
   non deve pesare sul server di nessuno.

Chi legge questo documento per capire come si costruisce un sito e' nel giusto. Chi lo legge
per copiare un sito e' fuori strada, e per giunta si prende il rischio legale da solo.

---

## IL NUMERO, subito

Su **149 siti premiati raggiunti** (123 dall'albo Awwwards Site of the Day, 20 dall'albo FWA
of the Day, 6 fra studi e prodotti gia' premiati altrove):

| Cosa | Siti | Percentuale |
|---|---|---|
| Servono almeno un file `.map` (di chiunque sia) | **24** | **16,1%** |
| **Lasciano leggibile il codice applicativo PROPRIO** | **7** | **4,7%** |
| Espongono componenti scritti dall'autore dentro il runtime di una piattaforma (Framer) | 4 | 2,7% |
| Totale "da questo sito si legge codice scritto da chi l'ha fatto" | **11** | **7,4%** |
| Servono un `.map` **senza** `sourcesContent` (inutile: nomi ma niente sorgente) | 7 | 4,7% |
| Servono solo `.map` di **librerie di terzi** (gsap, swiper, lenis...) | 6 | 4,0% |
| Lasciano almeno un bundle **non minificato** | **41** | **27,5%** |
| Espongono `/.env`, `/package.json` o `/.git/config` sulla radice | **0** | **0%** |

**La risposta breve: circa un sito da premio su venti (4,7%) lascia in produzione la sourcemap
del proprio codice.** Non uno su tre, non uno su dieci. Uno su venti.

Ma il numero che sorprende di piu' e' l'altro: **il 27,5% lascia un bundle non minificato**.
Leggere un bundle non minificato e' meno comodo che avere la sourcemap, ma spesso basta: nomi
di variabile veri, struttura dei moduli, commenti sopravvissuti. **La strada larga non e' la
sourcemap, e' la minificazione dimenticata.**

E lo zero secco sui file esposti (`/.env`, `/package.json`, `/.git/config`) e' un dato pulito:
su 149 siti di fascia alta, **nessuno** aveva quel tipo di buco. Quella e' una leggenda del
2015; gli hosting moderni (Vercel, Netlify, Cloudflare Pages) non servono i dotfile e basta.

---

## LE QUATTRO TRAPPOLE DEL CONTEGGIO (leggere prima di fidarsi di qualunque statistica)

Questo e' il pezzo piu' utile del documento, perche' e' la parte che chiunque rifaccia questa
misura sbaglia. La mia **prima** passata dava **29,8%** di siti "con sourcemap". Era falso.
Quattro filtri l'hanno riportato a 4,7%, e ognuno e' costato una scoperta.

**Trappola 1 -- le sourcemap delle librerie.** `gsap.min.js.map`, `swiper-bundle.min.js.map`,
`lenis.min.js.map`, `barba.umd.js.map`, `ScrollTrigger.min.js.map` sono servite **dal CDN
insieme alla libreria**, per scelta dell'autore della libreria. Uno scanner ingenuo trova
`swiper-bundle.min.js.map` con **100 file sorgente** e segna "bottino enorme". E' il sorgente
di Swiper, pubblico su GitHub da anni, con licenza MIT. Non e' il sito. Il 40% dei miei primi
"hit" erano questo.

**Trappola 2 -- la libreria auto-ospitata.** Peggio: la map sta **sul dominio del sito**, quindi
il controllo "stesso host" la promuove a codice proprio. `i-move-u.alexandrajugovic.com`
(FWA of the Day) serve `/ruffle/ruffle.js.map` con 51 sorgenti: e' **Ruffle**, l'emulatore
Flash open source, copiato nella cartella del sito. Stesso caso per `houseofyellow.nl`, che
tiene GSAP in `/wp-content/themes/hoy/libjs/gsap/`. **L'host non basta: bisogna aprire il file
e guardare che codice c'e' dentro.**

**Trappola 3 -- il runtime del framework.** Next.js pubblica in produzione i `.map` dei **propri**
chunk di runtime (`main-*.js.map`, `framework-*.js.map`) anche quando
`productionBrowserSourceMaps` e' `false`. Il primo `.map` che si trova su un sito Next.js e'
quasi sempre il sorgente di Next.js, non del sito. Il marcatore che distingue e' preciso:

| Percorso dentro la map | Di chi e' |
|---|---|
| `webpack://_N_E/../../src/client/...` | **Next.js stesso** (i `../` risalgono al repo di Next) |
| `webpack://_N_E/./src/components/...` | **l'applicazione** (il `./` e' la radice del progetto) |

E' un solo carattere di differenza -- `./` contro `../` -- e decide se hai trovato niente o se
hai trovato tutto. **Su racing.porsche.com mi aveva quasi fatto scartare il bottino piu' grosso
della battuta**: il chunk `main-*` era Next.js, ma il chunk `pages/_app-*` conteneva
`./src/pages/_app.tsx`.

**Trappola 4 -- l'asset host diverso dal sito.** `steven.com` e' un sito Webflow, ma il bundle
custom sta su `steven-henna.vercel.app`. Regola "stesso dominio" -> scartato come terza parte.
Aprendolo: 70 file sorgente del sito, con dentro un motore WebGL completo. **La regola
automatica sul dominio produce falsi negativi tanto quanto falsi positivi.**

**Conclusione metodologica:** il conteggio automatico serve solo a fare la lista dei candidati.
**Ogni singola map con `sourcesContent` va aperta e letta a mano.** Erano 24 in questa battuta:
un'ora di lavoro, ed e' la differenza fra un numero vero e un numero inventato.

---

## I CINQUE BOTTINI MIGLIORI

### 1. `racing.porsche.com` -- Porsche Motorsport Hub (FWA of the Day)

**195 file sorgente applicativi**, raccolti da **20 chunk su 23** della sola homepage. E' il
bottino piu' grosso in assoluto e viene da un sito corporate, non da uno studio.

Causa: `productionBrowserSourceMaps: true` in `next.config.js`. Il `.map` e' dichiarato col
commento in coda a ogni chunk, quindi il browser lo scarica da solo aprendo i DevTools.

Cosa contiene:

- `src/pages/_app.tsx`, `src/store/app-store.tsx`, l'intero albero `src/components/contentful/`
- il **generato di Contentful**: `*.contentful.generated.ts` per ogni content type (car,
  dashboard, calendar, event, footer, live-ticker, main-navigation...). E' lo **schema del CMS**
  in TypeScript: si legge la struttura dei contenuti di Porsche Motorsport come se si avesse
  accesso allo space.
- il calendario animato completo (`calendar-grid.tsx`, `calendar-date-details.tsx`,
  `motion-primitives.tsx`, `motion-configs.ts`)
- l'inventario delle dipendenze, che vale da solo la lettura:
  `@porsche-design-system/components-react`, `@chakra-ui/react`, `@emotion/*`, `framer-motion`,
  `@tanstack/react-query`, `@contentful/live-preview`, `next-cloudinary`,
  `@cloudinary-util/url-loader`, `next-seo`, `zod`, `@vercel/speed-insights`.

**Cosa si impara che non si trova nei tutorial:** come un'azienda di quella dimensione tiene
insieme un design system proprietario (Porsche Design System) e uno generico (Chakra) sullo
stesso progetto, e come genera i tipi dal CMS invece di scriverli a mano.

### 2. `depoluxe.xyz` -- Depo Luxe (Awwwards Site of the Day)

**103 file**, e non sono i file di un sito: sono i file di un **framework interno completo**.
Il bundle si chiama `eleventy-webpack` e dentro c'e' `src/assets/scripts/_app/cuchillo/`, la
libreria di casa dello studio, riusata su tutti i loro lavori.

Struttura, che e' una lezione di architettura da sola:

```
cuchillo/core/       Sizes, Metrics, Basics, Element, EventDispatcher, Accessibility, Keyboard
cuchillo/scroll/     Scroll, VScroll, VScroll_Item, MrScroll, Scrollbar, WheelControls,
                     insiders/VInsider
cuchillo/pages/      Page, ControllerPage          <- il router SPA fatto in casa
cuchillo/windows/    Window, ControllerWindow
cuchillo/display/    MediaObject, ImageObject, VideoObject
cuchillo/layout/     Wrap, Background
cuchillo/components/ Videos, LazyImages, Shffl      <- Shffl e' l'effetto scramble del testo
cuchillo/loaders/    LoaderController
cuchillo/utils/      Maths, Functions, CSS, Cookies, Language
```

Dipendenze: `gsap`, `three`, `howler`, `bezier-easing`. Quattro. Tutto il resto e' scritto a mano.

**Perche' vale piu' di un tutorial:** e' la risposta scritta a "cosa serve davvero per fare un
sito da premio". Non ventotto pacchetti: quattro, piu' uno scroll virtuale, un controller di
pagina e un dispatcher di eventi propri. `VScroll_Item` + `VInsider` sono il pattern
"ogni elemento si aggiorna da solo quando entra nel viewport" implementato senza
IntersectionObserver, con i conti a mano -- che e' esattamente il motivo per cui questi siti
scorrono lisci e quelli fatti con dieci librerie no.

### 3. `locomotive.ca` -- Locomotive (Awwwards + FWA) -- **IL BOTTINO DEGLI SHADER**

**100 file propri su 642 totali**, 41 dipendenze, e soprattutto **19 file shader veri**
(`.fs` e `.vs`, non stringhe). Trovato **per ipotesi diretta**: nessun commento
`sourceMappingURL` nel bundle, ma `https://locomotive.ca/assets/scripts/app.js.map` risponde
200. E' il caso da manuale del `hidden-source-map` (vedi l'ultima sezione).

Dentro c'e' `assets/scripts/sixty/`: un **motore di rendering proprio** costruito sopra
three.js, con un sistema di materiali a moduli. Non e' un esempio: e' il codice che gira sul
sito.

```
sixty/Renderer.js  MainCamera.js  MainScene.js  State.js  Character.js  Lisa.js
sixty/Materials/PBR/            fragment.fs (16 921 byte!)  vertex.vs (8 949)  PBR.js
sixty/Materials/Skin/           replaces.fs  replaces.vs  Skin.js
sixty/Materials/Eye/            replaces.fs  replaces.vs  Eye.js
sixty/Materials/Lashes/         replaces.fs  Lashes.js
sixty/Materials/Cloth/          replaces.fs  replaces.vs  Cloth.js
sixty/Materials/Lights/         replaces.fs  replaces.vs  Lights.js
sixty/Materials/Screen/         replaces.fs (8 550)  replaces.vs  Screen.js
sixty/Materials/ScreenGlow/     fragment.fs  vertex.vs  ScreenGlow.js
sixty/Materials/Background/     fragment.fs  vertex.vs  Background.js
sixty/Materials/MouseComputation/ fragment.fs  vertex.vs  MouseComputation.js
sixty/utils/     uniforms.js  materialsUtils.js  misc.js  modifiers.js  Raycaster.js
                 Noise.js  DeviceMotion.js  MouseComputation.js
```

Il `PBR/fragment.fs` da 16 KB e' una **implementazione PBR completa scritta a mano**, non
`MeshStandardMaterial` preso e basta. Le funzioni che contiene:

`BRDF_Lambert`, `DFGApprox`, `computeMultiscattering`, `computeSpecularOcclusion`,
`RE_IndirectDiffuse`, `RE_IndirectSpecular`, `getIBLIrradiance`, `getIBLRadiance`,
`roughnessToMip`, `textureCubeUV`, `bilinearCubeUV`, `getFace`, `getTangentFrame`,
`inverseTransformDirection`, `getAmbientLightIrradiance`.

Piu' un sistema di `#define` a zone (`SIXTY_MAP_AREA`, `SIXTY_ARMMAP_AREA`,
`SIXTY_NORMALMAP_AREA`, `SIXTY_PBR_AREA`, `SIXTY_ENVMAP_AREA`, `SIXTY_START_AREA`,
`SIXTY_END_AREA`) che permette di **iniettare pezzi di GLSL in punti nominati dello shader**:
e' il meccanismo dei `replaces.fs` degli altri materiali, che non riscrivono il PBR ma ci
innestano dentro la pelle, l'occhio, le ciglia, il tessuto.

**Questo e' il pezzo piu' prezioso di tutta la battuta.** Un PBR con IBL e multiscattering, con
sopra un sistema di override per pelle e occhi, e' esattamente la cosa che non si impara da
soli e che nessun tutorial spiega per intero. Da leggere per capire *come si organizza* uno
shader grosso; da **non** copiare (vedi la regola etica: nessuna licenza).

### 4. `steven.com` -- Steven (Awwwards Site of the Day) -- **IL SECONDO BOTTINO DI SHADER**

**70 file**, di cui **14 con GLSL scritto dentro**. Anche questo trovato **per ipotesi diretta**,
e per giunta su un host diverso dal sito: il bundle sta su `steven-henna.vercel.app/app.js`,
la map su `.../app.js.map`.

E' l'architettura piu' istruttiva per chi lavora davvero coi clienti, perche' e' **Webflow +
un bundle custom**: il contenuto lo gestisce il cliente, il WebGL lo mette lo studio.

```
src/webgl/Gl.js  Renderer.js  Assets/Assets.js  Utils/{Time,Sizes,Mouse,Debug,ShaderChunks}.js
src/webgl/World/World.js  Materials/Materials.js  Geometry/CursorLine.js
src/webgl/World/Scenes/SceneHero.js
src/webgl/World/Scenes/LightHero/  LightHero.js (84 KB!)
    Subscenes/  L_HeroSystem.js (45 KB)  _L_HeroRoom.js  L_HeroRoomCommunities.js
                L_HeroRoomMedia.js  L_HeroRoomTech.js  L_HeroRoomProducts.js
    Geometry/   L_TechParticles.js  L_WandParticles.js  L_LinesParticles.js
src/webgl/World/Scenes/DarkHero/   (lo stesso albero, prefisso D_)
src/modules/     nav, preloader, slider, split, theme, webgl, rive, cookies, dropdown,
                 hero-content, home-intro, press, sub-gallery, sub-intro, sub-scroll,
                 sub-transition, mobile-arm-links, join-links, legal, callout, form
src/modules/_/   runner.ts  create.ts  observe.ts  track.ts   <- il mini-framework a moduli
src/webflow/     detect-editor.ts  reset-webflow.ts           <- come si convive con Webflow
src/lib/         gsap.ts  scroll.ts  pages.ts  page-transitions.ts  hey.ts  subs.ts
```

`Utils/ShaderChunks.js` (10 KB) registra chunk GLSL riusabili dentro `THREE.ShaderChunk`,
a partire dal **Simplex 4D Noise di Ian McEwan e Stefan Gustavson** (attribuito nel commento,
che il minificatore non ha toccato perche' sta dentro una stringa). E' il pattern giusto:
si estende la libreria di chunk di three.js invece di incollare il rumore in ogni shader.

Le tre `*Particles.js` (Tech, Wand, Lines) da ~11 KB l'una sono tre sistemi di particelle
distinti con i loro shader inline; `LightHero.js` da 84 KB e `L_HeroSystem.js` da 45 KB sono
la coreografia completa della scena. **Il tema chiaro/scuro e' implementato duplicando l'intero
albero della scena** (`LightHero` / `DarkHero` con prefissi `L_` e `D_`): una scelta discutibile
ma vera, e vederla fatta da chi ha vinto un premio vale piu' di dieci opinioni.

### 5. `gsap.com` e `threejs-journey.com` -- i due siti "di casa"

Piu' piccoli ma di lettura immediata, ed entrambi hanno la sourcemap **dichiarata col commento**.

- **`gsap.com`** (Awwwards SOTD): 23 file su due bundle, sito **11ty**. Interessa perche' e' il
  sito ufficiale di GSAP e mostra come GSAP usa GSAP: `_includes/components/scroll/smooth.js`,
  `components/plugins/plugin/svgMorph/`, `components/hoverVideo/`, `components/demos/`,
  `utils/helpers/watchPreferredMotion/` -- cioe' **il rispetto di `prefers-reduced-motion` e'
  un helper dedicato**, non un `if` sparso. Dipendenze: `gsap`, `@vimeo/player`, `micromodal`.
- **`threejs-journey.com`** (Awwwards SOTD, Bruno Simon): 15 file,
  `front/public/scripts/` con `Utils/{EventEmitter,Sizes,Time}.js` -- **le stesse tre classi
  base che insegna nel corso**, usate sul suo sito di produzione. E poi
  `Components/AsyncNavigation.js`, `LazyLoader.js`, `Popins.js`, `QuizzesIndex.js`, `Form.js`.

**Menzione a parte: `lafamigliamysteryunfolds.gucci.com`** (Awwwards SOTD). Solo 2 file, ma
sono `PreloaderComponent.vue` e `preload.ts`: Gucci ha lasciato mappato **solo il chunk del
preloader**, il resto no. E' la prova che il leak spesso non e' totale, e' un chunk dimenticato.

---

## GLI SHADER: dove sono, e perche' contano

Domanda specifica, risposta specifica. Su 149 siti premiati, il GLSL leggibile sta in **tre**
posti, e uno solo lo espone come file veri.

| Sito | Forma | Quanto | Cosa c'e' |
|---|---|---|---|
| **`locomotive.ca`** | **19 file `.fs` / `.vs` separati** | PBR 16,9 KB + 8,9 KB vertex; Screen 8,5 KB; Skin, Eye, Lashes, Cloth, Lights, ScreenGlow, Background, MouseComputation | PBR completo con IBL, multiscattering, occlusione speculare; sistema di innesto a `#define ..._AREA` |
| **`steven.com`** | 14 sorgenti `.js` con GLSL in stringa | `ShaderChunks.js` 10 KB + 3 sistemi di particelle + 2 scene grandi | Simplex 4D noise registrato in `THREE.ShaderChunk`, particelle Tech/Wand/Lines, GPGPU sul mouse |
| **`depoluxe.xyz`** | 2 sorgenti con GLSL in stringa | dentro i moduli three.js del sito | shader di scena, molto piu' piccoli |

Tre osservazioni che valgono piu' dei file:

1. **Solo Locomotive tiene gli shader in file separati.** Gli altri li scrivono in template
   literal dentro il `.js`. Questo ha una conseguenza pratica enorme: **il GLSL dentro una
   stringa sopravvive alla minificazione**. Il minificatore JS non tocca il contenuto delle
   stringhe, quindi indentazione, nomi di uniform e **commenti** restano leggibili anche
   **senza** sourcemap. Su `steven.com` l'attribuzione a McEwan e Gustavson e' ancora li' in
   chiaro nel bundle di produzione.
2. **Da qui la strada laterale**: per gli shader non serve la sourcemap. Serve `curl` sul
   bundle e una ricerca di `gl_FragColor`, `varying vec`, `uniform sampler2D`, `void main`.
   Questa strada funziona sul **27,5%** dei siti che lasciano bundle non minificati, non sul
   4,7% che lascia le map. **E' sei volte piu' larga.**
3. **Il valore non e' il codice, e' l'organizzazione.** Un `snoise` si trova su Shadertoy in
   dieci secondi. Quello che non si trova e' *come tenere insieme* venti shader in un progetto:
   il sistema `_AREA` di Locomotive e il registro `ShaderChunk` di Steven sono due risposte
   diverse alla stessa domanda, e sono la cosa da imparare.

---

## LA STATISTICA COMPLETA

### Per albo di provenienza

| Albo | Siti raggiunti | Con codice proprio leggibile | % |
|---|---|---|---|
| Awwwards Site of the Day | 123 | 5 | 4,1% |
| FWA of the Day | 20 | 1 (Porsche) | 5,0% |
| Studi e prodotti gia' premiati | 6 | 1 (Locomotive) | 16,7% |
| **Totale** | **149** | **7** | **4,7%** |

Il campione FWA e' piccolo (l'API pubblica ne restituisce 20 per volta e non pagina), quindi il
5,0% e' indicativo. Il dato solido e' quello Awwwards: **4,1%**.

### Come e' stata trovata la map, quando c'era

| Modo | Casi |
|---|---|
| Commento `//# sourceMappingURL=` in coda al bundle | **20** |
| **Ipotesi diretta `NOMEBUNDLE.js.map`, senza commento** | **3** |

I 3 dell'ipotesi diretta sono i piu' interessanti: **`locomotive.ca` e `steven.com`, cioe' due
dei tre bottini piu' grossi, si trovano SOLO cosi'.** Chi ha configurato quei build ha tolto il
commento (`hidden-source-map` / `sourcemap: 'hidden'`) credendo di aver chiuso il buco, e ha
lasciato il file sul server. **Togliere il commento non nasconde niente: nasconde solo il
cartello.** Chi cerca prova comunque l'URL.

### I framework, e chi perde di piu'

Composizione del campione (149 siti):

| Framework/piattaforma | Siti |
|---|---|
| Webflow | 33 |
| build custom, non identificabile dall'HTML (Vite/esbuild/11ty) | 27 |
| Next.js (in tutte le combinazioni) | 32 |
| Nuxt (in tutte le combinazioni) | 20 |
| WordPress | 15 |
| Astro | 9 |
| SvelteKit | 4 |
| Shopify | 3 |
| Framer | 2 |

Chi ha perso il codice, per stack:

| Stack | Leak | Commento |
|---|---|---|
| build custom (Vite/webpack/11ty) | 3 | locomotive, depoluxe, threejs-journey |
| Webflow + bundle custom | 2 | steven.com, gsap.com |
| Next.js | 1 | racing.porsche.com (`productionBrowserSourceMaps: true`) |
| Vue/Vite su dominio corporate | 1 | gucci |
| Framer (componenti dell'autore) | 4 | per progetto della piattaforma, non e' un errore |

**Zero leak su Nuxt (20 siti), zero su Astro (9), zero su SvelteKit (4), zero su Shopify (3).**
Il motivo e' nella sezione finale: quei tre hanno il default giusto e nessuno lo cambia.

**Il pattern piu' pericoloso e' "Webflow + bundle custom"**: lo sviluppatore fa un progettino
Vite a parte per lo scroll e il WebGL, lo mette su Vercel o Netlify, e quel mini-progetto non
ha mai avuto una vera configurazione di produzione. Due dei sette leak sono questo. E' anche
lo schema che uso io, quindi vale come avvertimento personale.

### Le sourcemap "vuote": 7 siti che hanno fatto la cosa giusta a meta'

`enerblock.net`, `faunarobotics.com`, `studionamma.com`, `madewithgsap.com`, `oddritualgolf.com`,
`noho.ink`, `segerman.dev` servono un `.map` **senza `sourcesContent`**. Si ottiene la mappa
delle posizioni e i **nomi** dei file sorgente, ma non una riga del loro contenuto.

E' l'impostazione `nosources-source-map` di webpack, e per chi la usa e' la scelta giusta: gli
errori in produzione arrivano con lo stack trace leggibile, il codice resta chiuso. Da qui in
avanti la considero la configurazione consigliata per chi vuole entrambe le cose.

### I bundle non minificati: 41 siti, il vero filone

Non tutti in ugual misura. I piu' aperti:

| Sito | Bundle non minificati sui primi 8 controllati |
|---|---|
| `sidewave.it` | 6 |
| `raviklaassens.com` | 6 |
| `revelatio.studio` | 6 |
| `hashgraphvc.com` | 5 |
| `gethapply.com` | 5 |
| `simonholm.studio` | 5 |

Attenzione a non esagerare nel leggere questo dato: un file "non minificato" puo' anche essere
un frammento di configurazione di dieci righe. Il criterio usato qui e' meccanico (piu' di 60
a capo e indentazione vera nei primi 6 KB) e va verificato caso per caso. Ma la direzione e'
chiara: **quattro volte piu' comune della sourcemap.**

---

## LA TABELLA COMPLETA -- 151 domini, uno per riga

Anche i "no" sono qui: **un'assenza verificata vale, un'assenza presunta no.** Ogni riga
corrisponde a richieste HTTP fatte davvero il 13 agosto 2026.

Legenda della colonna Sourcemap:

- **SI (commento)** = il bundle dichiara `//# sourceMappingURL=` e il file c'e'.
- **SI (ipotesi diretta)** = nessun commento, ma `NOMEBUNDLE.js.map` risponde 200. E' il caso
  del `hidden-source-map`: il cartello e' stato tolto, il file no.
- **SI, ma vuota** = il `.map` c'e' ma senza `sourcesContent`: nomi si', sorgente no.
- **no (non del sito)** = una map c'e', ma e' di una libreria di terzi (gsap, swiper, lenis,
  usercentrics, banner Shopify...). **Non conta**, ed e' l'errore in cui cade chiunque
  automatizzi questa misura senza aprire i file.
- **no** = nessun `.map` raggiunto sui bundle controllati.
- **n/d** = il sito non ha risposto al momento della scansione.

La colonna "File ricostruibili" conta **solo i sorgenti applicativi**, esclusi i
`node_modules` e le librerie.

| # | Dominio | Premio | Bundle interrogato | Sourcemap | sourcesContent | File ricostruibili | Framework | Nota |
|---|---|---|---|---|---|---|---|---|
| 1 | `197historiasilustradas.com` | FWA FWA of the Day | `www.197historiasilustradas.com/_ne...Z8YixodC8` | no | - | - | Next.js |  |
| 2 | `21hrs.space` | Awwwards SOTD | `(nessuno script esterno)` | no | - | - | SvelteKit |  |
| 3 | `2xa.studio` | Awwwards SOTD | `2xa.studio/public/dist/assets/main-CzlVfecv.js` | no | - | - | build custom | 1 bundle non minificati |
| 4 | `375.studio` | Awwwards SOTD | `375.studio/_next/static/chunks/mai...be6682.js` | no | - | - | Next.js |  |
| 5 | `activetheory.net` | FWA + Awwwards | `(nessuno script esterno)` | no | - | - | build custom | studio premiato |
| 6 | `adcker.com` | Awwwards SOTD | `adcker.com/wp-content/cache/autopt...295611.js` | no | - | - | WordPress |  |
| 7 | `aimees-papercraft-world.com` | Awwwards SOTD | `aimees-papercraft-world.com/assets...MpGhxc.js` | no | - | - | build custom |  |
| 8 | `aino.agency` | Awwwards SOTD | `(nessuno script esterno)` | no | - | - | build custom |  |
| 9 | `aircenter.space` | Awwwards SOTD | `aircenter.space/assets/javascripts...781014343` | no | - | - | build custom |  |
| 10 | `alethia.earth` | Awwwards SOTD | `framerusercontent.com/sites/6AN2yD...dJQ5r.mjs` | **SI** (commento) | **SI** | **26** | Framer | runtime di piattaforma; code component dell'autore (Framer) |
| 11 | `antinomy.studio` | Awwwards SOTD | `www.antinomy.studio/_next/static/c...dL2ze9Pta` | no | - | - | Next.js+WordPress | studio premiato |
| 12 | `apechain.com` | Awwwards SOTD | `apechain.com/_next/static/chunks/m...fb8bfc.js` | no | - | - | Next.js+Sanity |  |
| 13 | `aristidebenoist.com` | Awwwards SOTD | `(nessuno script esterno)` | no | - | - | build custom | portfolio premiato |
| 14 | `artemartemartem.com` | Awwwards SOTD | `artemartemartem.com/_next/static/c...d86f0c.js` | no | - | - | Next.js |  |
| 15 | `ashleybrookecs.com` | Awwwards SOTD | `4pf9nv.csb.app/script.js` | no | - | - | Webflow | 1 bundle non minificati |
| 16 | `aspensearch.com` | FWA FWA of the Day | `www.aspensearch.com/_next/static/i..._x8otc.js` | no | - | - | Next.js+Sanity |  |
| 17 | `astrodither.robertborghesi.is` | Awwwards SOTD | `astrodither.robertborghesi.is/_ast...YiZ7Wx.js` | no | - | - | Astro |  |
| 18 | `awwwards.com` | meta: il giudice stesso | `assets.awwwards.com/dist/js/runtim...71a965.js` | no | - | - | Webflow |  |
| 19 | `balmoralrunning.com` | Awwwards SOTD | `www.balmoralrunning.com/cdn/shop/t...776784331` | no | - | - | Shopify | 1 bundle non minificati |
| 20 | `belgradearbor.rs` | FWA FWA of the Day | `belgradearbor.rs/_next/static/chun...nYd5CW6A4` | no | - | - | Next.js |  |
| 21 | `brand.ivress.co.jp` | Awwwards SOTD | `brand.ivress.co.jp/_astro/CommonSc...E5Pcs2.js` | no | - | - | Astro |  |
| 22 | `bruno-simon.com` | Awwwards SOTY 2019 | `bruno-simon.com/assets/index-ORr3L4no.js` | no | - | - | build custom | portfolio premiato |
| 23 | `buckssauce.com` | Awwwards SOTD | `buckssauce.com/_next/static/chunks...dFm9FYQT1` | no | - | - | Next.js+Shopify |  |
| 24 | `buildinamsterdam.com` | Awwwards + FWA | `www.buildinamsterdam.com/_next/sta...94a4e7.js` | no | - | - | Next.js | studio premiato |
| 25 | `business.nrg.com` | Awwwards SOTD | `cdn.cookielaw.org/scripttemplates/otSDKStub.js` | no | - | - | build custom |  |
| 26 | `bymonolog.com` | Awwwards SOTD | `bymonolog.com/v2645sy3qzdjNjhiNjUy...D8lfyivfQ` | no (non del sito) | - | - | Webflow | map di libreria terza (cdn.jsdelivr.net); 1 bundle non minificati |
| 27 | `cartier.com` | Awwwards SOTD | `(nessuno script esterno)` | no | - | - | build custom |  |
| 28 | `ciaoenergy.com` | Awwwards SOTD | `sibforms.com/forms/end-form/build/main.js` | no | - | - | Webflow |  |
| 29 | `coffee-tech.com` | Awwwards SOTD | `coffee-tech.netlify.app/head-init.js` | no | - | - | Webflow | 2 bundle non minificati |
| 30 | `collabcapitolium.fr` | Awwwards SOTD | `www.collabcapitolium.fr/_nuxt/CkorH0Sk.js` | no | - | - | Nuxt |  |
| 31 | `cravburgers.shop` | Awwwards SOTD | `www.cravburgers.shop/_next/static/...l3ukh4.js` | no | - | - | Next.js |  |
| 32 | `cuberto.com` | Awwwards multiplo | `cuberto.com/assets/js/bundle.js?v=5.6.0b5` | no | - | - | Webflow | studio premiato |
| 33 | `daoism.systems` | FWA FWA of the Day | `(nessuno script esterno)` | no | - | - | SvelteKit |  |
| 34 | `db-longbow.webflow.io` | Awwwards SOTD | `cdn.prod.website-files.com/689c67b...6177c8.js` | no | - | - | WordPress+Webflow |  |
| 35 | `depoluxe.xyz` | Awwwards SOTD | `depoluxe.xyz/assets/main.d4f10deae...57225e.js` | **SI** (commento) | **SI** | **103** | WordPress | framework interno 'cuchillo' completo, 2 sorgenti con GLSL |
| 36 | `detroit.paris` | Awwwards SOTD | `detroit-talents.netlify.app/main.js` | no | - | - | Webflow | 1 bundle non minificati |
| 37 | `digitalists.at` | Awwwards SOTD | `digitalists.at/wp-content/themes/d...?ver=2.54` | no | - | - | WordPress |  |
| 38 | `dogstudio.co` | FWA Site of the Year | `dogstudio.co/app/themes/portfolio-...ectizr.js` | no | - | - | WordPress | studio premiato |
| 39 | `donmolinico.es` | Awwwards SOTD | `www.donmolinico.es/_nuxt/adcfff9.js` | no | - | - | Nuxt |  |
| 40 | `dragonfly.xyz` | Awwwards SOTD | `www.dragonfly.xyz/_nuxt/y4llvBa3.js` | no | - | - | Nuxt+Sanity | 2 bundle non minificati |
| 41 | `edolus.com` | FWA FWA of the Day | `edolus.com/playcanvas-stable.min.js` | no | - | - | build custom | 3 bundle non minificati |
| 42 | `elva-labs.com` | Awwwards SOTD | `elva-labs.com/assets/main-BsPFrdmj.js` | no | - | - | build custom |  |
| 43 | `enerblock.net` | Awwwards SOTD | `enerblock.net/_astro/Layout.astro_...UXMpcf.js` | SI, ma vuota | no | 0 | Astro+Sanity | map senza `sourcesContent`; 2 bundle non minificati |
| 44 | `everswap.com` | Awwwards SOTD | `everswap.com/_astro/hoisted.D5QinsOB.js` | no | - | - | Astro | 1 bundle non minificati |
| 45 | `exoape.com` | Awwwards SOTY | `exoape.com/_nuxt/static/1779347953/state.js` | no | - | - | Nuxt | studio premiato |
| 46 | `experiment.obys.agency` | Awwwards SOTD | `cdn.prod.website-files.com/6a144ba...21006a.js` | no | - | - | Webflow |  |
| 47 | `faunarobotics.com` | Awwwards SOTD | `unpkg.com/@rive-app/canvas` | SI, ma vuota | no | 0 | Webflow | map senza `sourcesContent`; 2 bundle non minificati |
| 48 | `figma.com` | Webby Award | `www.figma.com/_netlify/_next/stati...62aa39.js` | no | - | - | Next.js+Sanity |  |
| 49 | `floema.com` | Awwwards SOTD | `www.floema.com/_nuxt/Dtt4RV-S.js` | no | - | - | Nuxt+Sanity |  |
| 50 | `fourmula.ai` | Awwwards SOTD | `cdn.prod.website-files.com/6936c73...a60d8e.js` | no | - | - | Webflow |  |
| 51 | `framer.com` | Awwwards | `framerusercontent.com/sites/3BJ9zI...7VX8Q.mjs` | **SI** (commento) | **SI** | **55** | Shopify+Webflow+Framer | runtime di piattaforma; code component dell'autore dentro il runtime Framer |
| 52 | `fromanother.love` | Awwwards SOTD | `www.fromanother.love/_next/static/...d7R8rQZT5` | no | - | - | Next.js | 3 bundle non minificati |
| 53 | `gabrielbeaugonin.com` | FWA FWA of the Day | `www.gabrielbeaugonin.com/assets/in...8AfsRE.js` | no | - | - | build custom |  |
| 54 | `gethapply.com` | Awwwards SOTD | `cdn.shopify.com/extensions/019ff3b...-embed.js` | no | - | - | Shopify | 5 bundle non minificati |
| 55 | `gilhuybrecht.com` | FWA FWA of the Day | `gilhuybrecht.com/_nuxt/D5R78ZMm.js` | no | - | - | Nuxt |  |
| 56 | `glitchandgrit.com` | Awwwards SOTD | `cdn.prod.website-files.com/69a07da...a60d8e.js` | no | - | - | Webflow |  |
| 57 | `gsap.com` | Awwwards SOTD | `gsap.com/tf-assets/index-05fd8a4c.js` | **SI** (commento) | **SI** | **23** | Webflow | sito 11ty di GSAP, 2 bundle mappati; 2 bundle non minificati; libreria premiata |
| 58 | `hashgraphvc.com` | Awwwards SOTD | `hashgraphvc.com/_nuxt/CEHeSSSx.js` | no | - | - | Nuxt+Sanity | 5 bundle non minificati |
| 59 | `hildenkaira.fi` | Awwwards SOTD | `assets.slater.app/slater/19381/57443.js` | no | - | - | Webflow |  |
| 60 | `hirotos.com` | Awwwards SOTD | `www.hirotos.com/_next/static/chunk....aky3l.js` | no | - | - | Next.js |  |
| 61 | `hollywoodexhibit2026.com` | Awwwards SOTD | `www.hollywoodexhibit2026.com/_next...f71f31.js` | no | - | - | Next.js |  |
| 62 | `houseofhoney.com` | Awwwards SOTD | `www.houseofhoney.com/_next/static/..._x8otc.js` | no | - | - | Next.js+Sanity |  |
| 63 | `houseofyellow.nl` | FWA FWA of the Day | `houseofyellow.nl/wp-content/themes...up.min.js` | no (non del sito) | - | - | WordPress | map di libreria terza (houseofyellow.nl) |
| 64 | `hubtown.co.in` | Awwwards SOTD | `hubtown.co.in/_nuxt/u1ipQrxM.js` | no | - | - | Nuxt |  |
| 65 | `i-move-u.alexandrajugovic.com` | FWA FWA of the Day | `i-move-u.alexandrajugovic.com/ruffle/ruffle.js` | no (non del sito) | - | - | build custom | map di libreria terza (i-move-u.alexandrajugovic.com); e' Ruffle, emulatore Flash auto-ospitato |
| 66 | `igloo.inc` | Awwwards SOTY 2024 | `www.igloo.inc/assets/index-2eb69c09.js` | no | - | - | build custom | 1 bundle non minificati; sito prodotto premiato |
| 67 | `ilcapoproduction.com` | Awwwards SOTD | `(nessuno script esterno)` | no | - | - | build custom |  |
| 68 | `illoca.unseen.co` | FWA FWA of the Day | `illoca.unseen.co/_nuxt/nqiEMr6S.js` | no | - | - | Nuxt |  |
| 69 | `immersive-g.com` | Awwwards SOTY | `www.immersive-g.com/assets/index.DRXpoX1T.js` | no | - | - | Nuxt | studio premiato |
| 70 | `indigo-laboratory.it` | Awwwards SOTD | `indigo-laboratory.it/_nuxt/BLgmL7wi.js` | no | - | - | Nuxt | 1 bundle non minificati |
| 71 | `inspiring.nk.studio` | Awwwards SOTD | `inspiring.nk.studio/_next/static/c...TQxPz9CX5` | no | - | - | Next.js+Webflow |  |
| 72 | `izanami-official.com` | Awwwards SOTD | `izanami-official.com/assets/js/ind...Juwueo.js` | no | - | - | build custom |  |
| 73 | `jasminegunarto.com` | Awwwards SOTD | `jasminegunarto.com/cdn-cgi/scripts...de.min.js` | no | - | - | WordPress |  |
| 74 | `juanmora.co` | Awwwards SOTD | `juanmora.co/js/webflow.js` | no (non del sito) | - | - | Webflow | map di libreria terza (cdn.jsdelivr.net) |
| 75 | `juliencalot.com` | Awwwards SOTD | `cdn.prod.website-files.com/687ff0e...827346.js` | no | - | - | Webflow |  |
| 76 | `jumpingmax.cdiscount.com` | Awwwards SOTD | `jumpingmax.cdiscount.com/assets/ap...cb45e1.js` | no | - | - | WordPress |  |
| 77 | `k95.it` | Awwwards SOTD | `k95.it/_nuxt/BAt6UgCr.js` | no | - | - | Nuxt | 1 bundle non minificati |
| 78 | `kod.studio` | Awwwards SOTD | `kod.studio/nav.js` | no | - | - | build custom | 1 bundle non minificati; studio premiato |
| 79 | `kononenkogroup.com` | FWA FWA of the Day | `kononenkogroup.com/_nuxt/XWVwl4_g.js` | no | - | - | Nuxt | 1 bundle non minificati |
| 80 | `kpr.studio` | Awwwards SOTD | - | **n/d** | - | - | - | HTML non recuperabile |
| 81 | `kvs.services` | Awwwards SOTD | `www.kvs.services/assets/index-BxXKCyO8.js` | no | - | - | build custom |  |
| 82 | `lafamigliamysteryunfolds.gucci.com` | Awwwards SOTD | `lafamigliamysteryunfolds.gucci.com...7RREMb.js` | **SI** (commento) | **SI** | **2** | build custom | solo il preloader Vue |
| 83 | `lamalama.com` | Awwwards SOTD | `lamalama.com/wp-content/themes/lam...WgAreT.js` | no | - | - | WordPress |  |
| 84 | `larevoltosa.es` | Awwwards SOTD | `larevoltosa.es/wp-content/plugins/...ver=6.1.6` | no | - | - | WordPress | 1 bundle non minificati |
| 85 | `linear.app` | Webby-class | `static.linear.app/web/_next/static...xsQabR.js` | no (non del sito) | - | - | Next.js+Sanity | map di libreria terza (static.linear.app); chunk Next.js senza sorgenti applicativi |
| 86 | `locomotive.ca` | Awwwards + FWA | `locomotive.ca/assets/scripts/app.js` | **SI** (**ipotesi diretta**) | **SI** | **100** | build custom | motore WebGL proprio 'sixty', **19 file shader .fs/.vs**; studio premiato |
| 87 | `loloagency.com` | Awwwards SOTD | `loloagency.com/_astro/Layout.astro...YSV5hK.js` | no | - | - | Astro+Sanity |  |
| 88 | `lusion.co` | Awwwards SOTY | `lusion.co/_astro/hoisted.CUO_IjfL.js` | no | - | - | Astro | studio premiato |
| 89 | `madeinevolve.com` | Awwwards SOTD | `assets.slater.app/slater/18382/56925.js` | no | - | - | Webflow |  |
| 90 | `madewithgsap.com` | Awwwards SOTD | `madewithgsap.com/assets/landing/app2.js` | SI, ma vuota | no | 0 | Webflow | map senza `sourcesContent` |
| 91 | `makemepulse.com` | FWA + Awwwards | `makemepulse.com/_nuxt/pages/index.dcccef5.js` | no | - | - | Nuxt | studio premiato |
| 92 | `marvellco.com.au` | Awwwards SOTD | `www.marvellco.com.au/_next/static/...nQAQePamh` | no | - | - | Next.js |  |
| 93 | `mathis-biabiany.fr` | FWA FWA of the Day | `www.mathis-biabiany.fr/_nuxt/draco...JM36Ib.js` | no | - | - | Nuxt | 1 bundle non minificati |
| 94 | `meech213.com` | Awwwards SOTD | `cdn.prod.website-files.com/69bc4d3...b66f41.js` | no | - | - | Webflow |  |
| 95 | `members-play.lacoste.com` | Awwwards SOTD | `members-play.lacoste.com/polo-fact...bbc020.js` | no | - | - | WordPress |  |
| 96 | `mosby.no` | Awwwards SOTD | `(nessuno script esterno)` | no | - | - | Astro | studio premiato |
| 97 | `mosbyfiles.com` | Awwwards SOTD | `www.mosbyfiles.com/_nuxt/DwAQhwlc.js` | no | - | - | Nuxt |  |
| 98 | `naughtyduk.com` | Awwwards SOTD | `naughtyduk.com/assets/index-ClJY1XEA.js` | no | - | - | build custom |  |
| 99 | `neuemontreal.com` | Awwwards SOTD | `framerusercontent.com/sites/45hQNN...FFBsh.mjs` | **SI** (commento) | **SI** | **11** | Framer | runtime di piattaforma; code component dell'autore (Framer) |
| 100 | `noartmusic.com` | Awwwards SOTD | `cdn.prod.website-files.com/6a22969...-1.0.2.js` | no | - | - | Webflow |  |
| 101 | `noho.ink` | FWA FWA of the Day | `noho.ink/assets/js/noho.bundle.min.js` | SI, ma vuota | no | 0 | Webflow | map senza `sourcesContent` |
| 102 | `normalisboring.es` | Awwwards SOTD | `normalisboring.es/wp-content/plugi...s?ver=6.1` | no (non del sito) | - | - | WordPress | map di libreria terza (cdnjs.cloudflare.com, normalisboring.es); 1 bundle non minificati |
| 103 | `noth.in` | Awwwards SOTD | `ajax.googleapis.com/ajax/libs/webf...ebfont.js` | no | - | - | Webflow |  |
| 104 | `obys.agency` | Awwwards SOTD | `(nessuno script esterno)` | no | - | - | build custom |  |
| 105 | `oddritualgolf.com` | Awwwards SOTD | `cty38f.csb.app/scripts-2026.js` | SI, ma vuota | no | 0 | Shopify+Webflow | map senza `sourcesContent`; 2 bundle non minificati |
| 106 | `offmenu.design` | Awwwards SOTD | `offmenu.design/_next/static/chunks...eXpoPG8eG` | no | - | - | Next.js |  |
| 107 | `oio.studio` | Awwwards | `oio.studio/cdn-cgi/scripts/5c5dd72...de.min.js` | no | - | - | SvelteKit | studio premiato |
| 108 | `opaltadpole.com` | Awwwards SOTD | - | **n/d** | - | - | - | HTML non recuperabile |
| 109 | `oryzo.ai` | Awwwards SOTD | `oryzo.ai/_astro/hoisted.CRsATKbF.js` | no | - | - | Astro | 1 bundle non minificati |
| 110 | `outfit.hellohello.is` | Awwwards SOTD | `outfit.hellohello.is/_next/static/...QhYPVmSDS` | no | - | - | Next.js+Shopify |  |
| 111 | `pacomepertant.com` | Awwwards SOTD | `pacomepertant.com/_nuxt/rgzkqdZW.js` | no | - | - | Nuxt |  |
| 112 | `pangrampangram.com` | Awwwards SOTD | `pangrampangram.com/cdn/shop/t/52/a...3E6oxz.js` | no | - | - | Shopify | 1 bundle non minificati; foundry premiata |
| 113 | `partizan.com` | Awwwards SOTD | `partizan.com/wp-content/themes/bea...c275b0.js` | no | - | - | WordPress | 1 bundle non minificati |
| 114 | `pieterkoopt.nl` | Awwwards SOTD | `pieterkoopt.nl/g0lnomhfn3mgNjc4OTB...3ecPPzNfY` | no | - | - | Webflow | 2 bundle non minificati |
| 115 | `podium.global` | Awwwards SOTD | `podium.global/_next/static/chunks/...grctHCKoA` | no | - | - | Next.js |  |
| 116 | `produx.design` | Awwwards SOTD | `www.produx.design/_next/static/chu...6UBazuqUw` | no | - | - | Next.js |  |
| 117 | `pxpush.com` | FWA FWA of the Day | `pxpush.com/_nuxt/OS4hgONa.js` | no | - | - | Nuxt+Webflow | 2 bundle non minificati |
| 118 | `racing.porsche.com` | FWA FWA of the Day | `racing.porsche.com/_next/static/ch...778083.js` | **SI** (commento) | **SI** | **195** | Next.js | 195 file su 20 chunk: app Next.js intera |
| 119 | `raviklaassens.com` | Awwwards SOTD | `slater.app/19011/57998.js` | no | - | - | Webflow | 6 bundle non minificati |
| 120 | `razorpay.com` | Awwwards SOTD | `razorpay.com/nvhc9u4gxsagNjk2NWU2N...m_bOkNK9A` | no | - | - | Webflow | 1 bundle non minificati |
| 121 | `ref.digital` | Awwwards SOTD | `ref.digital/_nuxt/Di1k8qmP.js` | no | - | - | Nuxt | 1 bundle non minificati |
| 122 | `revelatio.studio` | Awwwards SOTD | `revelatio.vercel.app/scripts/drag-marquee.js` | no | - | - | Webflow | 6 bundle non minificati |
| 123 | `rideradian.com` | Awwwards SOTD | `slater.app/19565/58244.js` | no | - | - | Webflow | 2 bundle non minificati |
| 124 | `rive.app` | Awwwards SOTD | `framerusercontent.com/sites/3Hh1Sx...Mxvx0.mjs` | **SI** (commento) | **SI** | **1** | Webflow+Framer | runtime di piattaforma; solo il modulo toplevel (Framer); prodotto premiato |
| 125 | `sakazuki.io` | Awwwards SOTD | `sakazuki.io/_next/static/chunks/fa...ca72HG7Q9` | no | - | - | Next.js |  |
| 126 | `schemeengine.com` | FWA FWA of the Day | `scheme-engine.pages.dev/main.js` | no | - | - | Shopify+Webflow | 1 bundle non minificati |
| 127 | `segerman.dev` | FWA FWA of the Day | `segerman.dev/_astro/Layout.astro_a...GFA18R.js` | SI, ma vuota | no | 0 | Astro | map senza `sourcesContent` |
| 128 | `shop.brunellocucinelli.com` | Awwwards SOTD | `(nessuno script esterno)` | no | - | - | build custom |  |
| 129 | `showcase.noomoagency.com` | Awwwards SOTD | `showcase.noomoagency.com/_nuxt/BeQtrGYw.js` | no | - | - | Nuxt |  |
| 130 | `sidewave.it` | Awwwards SOTD | `sidewave.it/cdn-cgi/scripts/5c5dd7...de.min.js` | no | - | - | build custom | 6 bundle non minificati |
| 131 | `silent-house.com` | Awwwards SOTD | `(nessuno script esterno)` | no | - | - | SvelteKit |  |
| 132 | `simonholm.studio` | Awwwards SOTD | `cdn.prod.website-files.com/6649cbd...6177c8.js` | no | - | - | Webflow | 5 bundle non minificati |
| 133 | `sohub.digital` | Awwwards SOTD | `sohub.digital/_next/static/chunks/...vo9tlp.js` | no | - | - | Next.js+Sanity |  |
| 134 | `spline.design` | Awwwards SOTD | `www.spline.design/_next/static/chu...KyFhTByvz` | no | - | - | Next.js+Webflow | prodotto premiato |
| 135 | `steven.com` | Awwwards SOTD | `steven-henna.vercel.app/app.js` | **SI** (**ipotesi diretta**) | **SI** | **70** | Webflow | bundle su Vercel, **14 sorgenti con GLSL dentro** |
| 136 | `storytelling.noomoagency.com` | Awwwards SOTD | `storytelling.noomoagency.com/_nuxt/CbdjwYMp.js` | no | - | - | Nuxt |  |
| 137 | `stripe.com` | Webby Award | `b.stripecdn.com/mkt-ssr-statics/as...256517.js` | no | - | - | Next.js |  |
| 138 | `studionamma.com` | Awwwards SOTD | `cdn.prod.website-files.com/679cb9c...216e46.js` | SI, ma vuota | no | 0 | Webflow | map senza `sourcesContent` |
| 139 | `sui.io` | Awwwards SOTD | `cdn.prod.website-files.com/68e8e01...6177c8.js` | no | - | - | Webflow |  |
| 140 | `ten.375.studio` | Awwwards SOTD | `ten.375.studio/_next/static/chunks...2YHH5abq5` | no | - | - | Next.js+WordPress |  |
| 141 | `thejacketcirclegame.maxmara.com` | Awwwards SOTD | `thejacketcirclegame.maxmara.com/as...STirow.js` | no | - | - | build custom |  |
| 142 | `thisisstudiox.com` | Awwwards SOTD | `cdn.odyn.dev/auto/dktf/bundle.js` | no | - | - | Webflow | 1 bundle non minificati |
| 143 | `threejs-journey.com` | Awwwards SOTD | `threejs-journey.com/bundles/public/index.js` | **SI** (commento) | **SI** | **15** | build custom | front del corso di Bruno Simon; prodotto premiato |
| 144 | `trionn.com` | Awwwards SOTD | `www.trionn.com/_next/static/chunks...tx~or~.js` | no | - | - | Next.js | studio premiato |
| 145 | `tympanus.net` | Codrops | `codrops-1f606.kxcdn.com/codrops/wp...fc215fd81` | no | - | - | WordPress+Webflow | 2 bundle non minificati |
| 146 | `unitedcarriers.com` | FWA FWA of the Day | `united-carriers.netlify.app/main.js` | no | - | - | Webflow | 1 bundle non minificati |
| 147 | `unseen.co` | FWA | `unseen.co/wp-content/themes/unseen...a518fa84d` | no | - | - | WordPress | studio premiato |
| 148 | `vercel.com` | Webby-class | `vercel.com/vc-ap-vercel-marketing/..._x3lk6.js` | no | - | - | Next.js | 1 bundle non minificati |
| 149 | `web.meetcleo.com` | Awwwards SOTD | `web.meetcleo.com/_next/static/chun...Hpvkzy8pc` | no | - | - | Next.js |  |
| 150 | `wrapped-party.activetheory.dev` | Awwwards SOTD | `(nessuno script esterno)` | no | - | - | build custom |  |
| 151 | `zajno.com` | Awwwards SOTD | `(nessuno script esterno)` | no | - | - | Webflow | studio premiato |


---

## LA LEZIONE AL CONTRARIO: non lasciarle sul proprio sito

Il punto non e' "non generare le sourcemap". Le sourcemap servono: senza, un errore in
produzione e' una riga illeggibile. Il punto e' **generarle e non pubblicarle**.

Tre configurazioni sensate, in ordine crescente di paranoia:

| Obiettivo | Come |
|---|---|
| Non voglio proprio sourcemap in produzione | disattivarle nel build (sotto, per ogni tool) |
| Voglio gli stack trace leggibili, non il sorgente | `nosources-source-map`: map senza `sourcesContent` |
| Voglio il debug completo ma solo per me | generare le map, **caricarle su Sentry**, e **cancellarle dalla cartella pubblicata** |

**La regola d'oro, che vale piu' di tutti i comandi:** `hidden` non e' `off`. Le opzioni
`hidden-source-map` (webpack) e `sourcemap: 'hidden'` (Vite, Nuxt) **scrivono il file `.map`
nella cartella di build** e tolgono solo il commento che lo indica. Se pubblichi la cartella,
pubblichi le map. **Due dei tre bottini piu' grossi di questa battuta sono esattamente
questo errore.**

### Next.js

Il default e' gia' sicuro: `productionBrowserSourceMaps` e' `false`. Il rischio e' averlo acceso.

```js
// next.config.js
module.exports = {
  productionBrowserSourceMaps: false,   // default: e' il valore giusto, NON toccarlo
  experimental: {
    serverSourceMaps: false,            // le map del lato server non servono al browser
  },
}
```

Verifica dopo il build (deve stampare `0`):

```bash
next build && find .next/static -name "*.js.map" | wc -l
```

**Il caso Sentry, che e' come si perde il codice senza accorgersene.** Il plugin di Sentry
accende le sourcemap per poterle caricare, e **se non gli dici di cancellarle le lascia in
`.next/static`**:

```js
// next.config.js  -- con @sentry/nextjs
const { withSentryConfig } = require("@sentry/nextjs");
module.exports = withSentryConfig(nextConfig, {
  sourcemaps: {
    disable: false,                    // servono per caricarle...
    deleteSourcemapsAfterUpload: true, // ...ma vanno CANCELLATE dopo il caricamento
  },
});
```

Rete di sicurezza a prescindere dal plugin, da mettere nello script di deploy:

```bash
next build && find .next/static -name "*.js.map" -delete
```

Nota su Porsche: il loro `main-*.js.map` (runtime di Next) c'e' comunque, ed e' normale. Quello
che si poteva evitare erano i `.map` dei chunk applicativi, ed e' esattamente
`productionBrowserSourceMaps`.

### Nuxt

Il default e' gia' sicuro (`server: true`, `client: false`). Il rischio e' aver messo
`sourcemap: true` per un debug e non averlo tolto.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  sourcemap: {
    server: true,    // utile: il server non e' pubblico
    client: false,   // DEVE restare false. 'hidden' NON basta: il file resta in .output/public
  },
})
```

Verifica (deve stampare `0`):

```bash
nuxt build && find .output/public -name "*.map" | wc -l
```

Zero leak su 20 siti Nuxt in questa battuta: il default regge.

### Vite (e SvelteKit, Astro, SolidStart, Qwik, che ci stanno sopra)

Il default e' gia' sicuro: `build.sourcemap` e' `false`.

```js
// vite.config.js
export default defineConfig({
  build: {
    sourcemap: false,   // default. 'hidden' scrive comunque il .map in dist/: NON usarlo
  },
})
```

Se ti servono per un servizio di error tracking, l'unico schema sicuro e' generare, caricare,
cancellare:

```bash
vite build --sourcemap          # oppure sourcemap: true nel config
sentry-cli sourcemaps upload ./dist
find dist -name "*.map" -delete # <- il passo che tutti dimenticano
```

Controllo finale prima di ogni deploy, da mettere in CI:

```bash
find dist -name "*.map" | grep . && { echo "SOURCEMAP IN DIST: DEPLOY BLOCCATO"; exit 1; }
```

### webpack (5)

Qui il default **non** e' sicuro se si scrive `mode: 'development'` per sbaglio, ed e' il tool
dove `hidden` inganna di piu'.

```js
// webpack.config.js
module.exports = {
  mode: "production",
  devtool: false,                 // nessuna sourcemap, nessun file .map
};
```

Le tre alternative, con la verita' su ognuna:

| `devtool` | File `.map` scritto? | Commento nel bundle? | Contiene il sorgente? | Giudizio |
|---|---|---|---|---|
| `false` | no | no | - | il piu' sicuro |
| `'nosources-source-map'` | **si'** | si' | **NO** | **il migliore se vuoi gli stack trace** |
| `'hidden-source-map'` | **si'** | no | **SI'** | **trappola**: il file resta e si indovina |
| `'source-map'` | si' | si' | si' | solo per lo sviluppo |

```js
// La configurazione che consiglio: errori leggibili, sorgente chiuso
module.exports = {
  mode: "production",
  devtool: "nosources-source-map",
};
```

### Il controllo che vale per tutti, in 20 secondi

Sul proprio sito gia' in linea, esattamente il metodo di questa battuta:

```bash
SITO="https://ilmiosito.it"
# 1) i bundle dichiarati nell'HTML
curl -s "$SITO" | grep -oE 'src="[^"]+\.m?js[^"]*"' | sed 's/src="//;s/"//'

# 2) per ognuno: il commento in coda (solo gli ultimi 3 KB, non tutto il file)
curl -s -r -3000 "$SITO/assets/app.js" | grep -o 'sourceMappingURL=.*'

# 3) l'ipotesi diretta, quella che frega tutti
curl -s -o /dev/null -w "%{http_code}\n" "$SITO/assets/app.js.map"
```

Se il punto 3 risponde `200`, hai il problema anche se il punto 2 non dice niente.

E il controllo definitivo, quello che dice se c'e' davvero il sorgente dentro:

```bash
curl -s "$SITO/assets/app.js.map" | head -c 300 | grep -o 'sourcesContent'
```

Se stampa `sourcesContent`, chiunque puo' ricostruire il tuo repository.

---

## COME E' STATA FATTA, per chi vuole rifarla

1. **Lista dai due albi pubblici.** Le pagine `awwwards.com/websites/sites_of_the_day/?page=N`
   danno 31 slug per pagina; ogni pagina `/sites/SLUG` contiene l'URL vero del sito. L'API
   pubblica `thefwa.com/api/cases` restituisce 20 casi con il campo `url` (non pagina: e' il
   suo limite). Nessuna autenticazione, nessuna API di GitHub -- qui non serve.
2. **Per ogni dominio**: HTML, estrazione di `<script src>` piu' i `modulepreload` e i percorsi
   `/_next/` e `/_nuxt/` scritti in chiaro; scarto dei domini di sole librerie e di analitica;
   ordinamento dei candidati mettendo davanti quelli sullo stesso host e con `index`/`main`/`app`
   nel nome; **massimo 8 bundle per sito**.
3. **Su ogni bundle, solo la coda**: `curl -r -3000` per cercare il commento. Non si scarica
   mai un bundle intero per questo controllo.
4. **Quando il commento manca**, un solo tentativo su `NOMEBUNDLE.js.map`, verificato leggendo
   i primi 400 byte (deve contenere `"version"` / `"mappings"` / `"sources"`).
5. **Analisi del `.map`**: conteggio di `sources`, presenza vera di `sourcesContent`,
   estensioni, separazione fra sorgenti propri e `node_modules`, estrazione dell'elenco delle
   dipendenze, ricerca dei file shader e del GLSL dentro le stringhe.
6. **Verifica a mano di ogni singolo risultato positivo.** Non e' un passaggio facoltativo: e'
   il passaggio che ha ridotto il numero da 29,8% a 4,7% (vedi le quattro trappole).
7. Cinque processi in parallelo, timeout stretti, salvataggio incrementale su JSONL.

Tempo: circa 50 minuti di scansione, piu' un'ora di verifica manuale.

**Il limite onesto di questo lavoro:** si guarda solo la **homepage** e solo i primi 8 bundle.
Un sito che lascia la map su una pagina interna, o sul nono chunk, qui risulta pulito. Il 4,7%
e' quindi un **limite inferiore**: il numero vero e' un po' piu' alto, non piu' basso. Su
Porsche, per esempio, i 195 file sono venuti da 20 chunk della sola homepage; controllando
tutto il sito sarebbero stati di piu'.

