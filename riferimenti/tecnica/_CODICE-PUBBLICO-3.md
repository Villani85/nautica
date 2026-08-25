# Codice pubblicamente leggibile dei siti-progetto (blocco 3)

Ricerca su 13 siti-progetto (lavori per clienti, non studi). Obiettivo: capire **quanto del
sorgente vero e' leggibile da fuori**, senza login, senza reverse engineering pesante.

Metodo, nell'ordine in cui rende:

1. **Sourcemap** (`//# sourceMappingURL=`) — se la lasciano, con `sourcesContent` si ricostruisce
   il repo com'era sul disco dello sviluppatore. E' la strada regina sui siti commerciali.
2. **Repository GitHub** — nome progetto + nome studio via API di ricerca.
3. **Bundle non minificati** o con commenti sopravvissuti (soprattutto GLSL: i commenti dentro
   le stringhe degli shader **non vengono mai rimossi dal minificatore JS**).
4. **Cartelle e file esposti** — `/assets/`, `/models/`, JSON di configurazione, endpoint CMS.

Riferimento noto: **brunosimon/folio-2025**, pubblico, licenza MIT, file Blender inclusi.
E' l'eccezione, non la regola: **uno solo dei 13 siti sotto pubblica il proprio repo**
(Star Atlas, e solo nella versione attuale, senza licenza).

Data della verifica: 13 agosto 2026. Tutti gli URL sono stati richiesti davvero e il codice
di risposta e' quello riportato.

---

## Risultato in una riga

**Una sourcemap su 13 siti, e un repository pubblico su 13.** La sourcemap e' quella di
**Mana Yerba Mate** (sezione 10): completa, con `sourcesContent` pieno, 2,6 MB di sorgente
ricostruibile — ed e' arrivata da una **richiesta alla cieca**, perche' il commento
`sourceMappingURL` dal bundle era stato tolto. Il repository e' **`staratlasmeta/sa-landing-page`**
(sezione 11), che non e' una copia del sito attuale di Star Atlas: e' il sito, verificato con md5.

Per gli altri undici la regola tiene: i siti di fascia alta escono da build
Vite/webpack/esbuild configurate con `sourcemap: false`, e le agenzie in questione lo
sanno fare. Il valore sta altrove: **shader GLSL con i commenti dentro** (e le varianti
scartate lasciate commentate), **cartelle di asset completamente aperte** (modelli GLB,
texture KTX2, HDRI, file Rive, audio OGG), **JSON di CMS serviti in chiaro** e — sui
bundle fino al ~2019 — **la mappa delle dipendenze relative di Browserify**, che
ricostruisce l'albero dei sorgenti senza bisogno di alcuna sourcemap.

---

## 1. Lando Norris — landonorris.com (studio: OFF+BRAND)

### Sourcemap
**Assente.** Nessun `//# sourceMappingURL=` in nessuno dei bundle. Provata anche la richiesta
alla cieca:

| URL | esito |
|---|---|
| `https://assets.itsoffbrand.io/lando/dev-js/lando-by-OFF+BRAND.js.map` | 404 |
| `https://assets.itsoffbrand.io/lando/dev-js/transitions-rive-isolate.js.map` | 404 |

### Cosa si scarica invece

Il sito e' **Webflow** con sopra un bundle custom enorme servito da CDN dello studio.

| URL | HTTP | Dimensione |
|---|---|---|
| `https://assets.itsoffbrand.io/lando/dev-js/lando-by-OFF+BRAND.js` | 200 | **1 457 237 byte** (5 652 righe) |
| `https://assets.itsoffbrand.io/lando/dev-js/transitions-rive-isolate.js` | 200 | 106 783 byte |
| `https://cdn.prod.website-files.com/67b5a02dc5d338960b17a7e9/js/lando-offbrand.schunk.7321a5097fb66f41.js` | 200 | 35 992 byte (interactions Webflow) |
| `https://lando.itsoffbrand.io/dev-js/lando.OFF+BRAND.js` | **403** | (secondo host, chiuso) |

Il bundle grosso e' un output **Bun/esbuild**: identificatori mangled ma **a capo conservati**
(5 652 righe) e **116 righe di commento sopravvissute**. Si legge.

### Tre cose interessanti

**a) Nell'HTML di produzione c'e' un `<script src="http://localhost:6645/app.js">`.**
Riga 42 di `https://landonorris.com/`. E' il dev server dello sviluppatore rimasto dentro il
sito pubblicato di un pilota di Formula 1. Non da' accesso a nulla (punta al localhost di chi
visita) ma dice esattamente com'e' fatto il loro flusso: bundle locale su porta fissa,
iniettato in Webflow via custom code, e in produzione si commuta sul CDN.

**b) Gli shader GLSL sono in chiaro, commenti compresi.** Il minificatore JS non tocca le
stringhe. Si leggono i parametri con cui hanno tarato l'effetto, comprese le versioni scartate
lasciate commentate:

```glsl
const float DISTORT_INTENSITY = 0.006; // 0.0075
const float DISTORT_SCALE = 50.0;
const float NOISE_SIZE = 50.0;
const float OUTLINE_SCALE = 0.125;
const float OUTLINE_THICKNESS = 0.2;
const float TIME_SPEED = 0.1;
float hoverEffect = smoothstep(textureNoise.r, textureNoise.r + 0.05, uHelmetHover);
float darkEdges = clamp(1.0 - abs(vLocalPosition.x) * 30., 0.2, 1.0);
```

Ci sono anche gli attributi per il testo 3D MSDF, che raccontano da soli come e' costruita
l'animazione tipografica lettera per lettera:

```glsl
attribute float letterIndex;
attribute float lineIndex;
attribute float lineLetterIndex;
attribute float lineLettersTotal;
attribute float lineWordIndex;
attribute float lineWordsTotal;
attribute float aRandom;
attribute vec3 aTargetPositions;   // morph verso una forma bersaglio
```

**c) La cartella asset e' completamente aperta.** Base: `https://assets.itsoffbrand.io/lando/gl/`.
Il listing di directory e' chiuso (404), ma i path esatti stanno nel bundle e rispondono tutti:

| Asset | HTTP | Dimensione |
|---|---|---|
| `.../lando/gl/models/helmet-21.glb` | 200 | 139 492 byte |
| `.../lando/gl/models/tracks/tracks.glb` | 200 | 463 904 byte |
| `.../lando/gl/hdri/studio_small_08_1k--dark.hdr` | 200 | 392 675 byte |
| `.../lando/gl/fonts/Brier-Bold-msdf.json` | 200 | 89 744 byte (atlante MSDF) |
| `.../lando/rive/ln4.riv` | 200 | 3 770 byte |

Lista completa ricavata dal bundle (tutti sotto `/lando/gl/`):
`models/disco-02.glb`, `models/helmet-21.glb`, `models/tracks/tracks.glb`;
`hdri/studio_small_08_1k--{dark,faded,light}.hdr`;
`textures/helmet/webp/{dark,disco,grid,lime}/Norris_Helmet_mat_BaseColor.webp` piu' Metallic /
Normal / Roughness; `textures/head/webp/{diffuse,normal,roughness,alpha,depth,shadow}.webp`;
`textures/glass/webp/Norris_Glass_mat_*.webp`; `textures/noise/noise-03.webp`;
`textures/plastic/plastic__matcap-02.webp`; `textures/tracks/lando__matcap-02.webp`;
`fonts/{Brier-Bold,MonaSans-Bold}-msdf.json` + `-02.webp`.
E sotto `/lando/rive/`: `ln4.riv`, `circuits.riv`, `phrases.riv`, `signature.riv`, `reef.riv`,
`page-transition.riv`, `btn-ui.riv`, `mob-landscape.riv`.

### Bonus: l'architettura si legge dai selettori

Il bundle interroga il DOM Webflow via `data-*`. La lista e' l'indice dei componenti del sito:

`data-taxi` / `data-taxi-view` (router **@unseenco/taxi**), `data-gl`, `data-gl-hover`,
`data-gl-switcher`, `data-gl-change-track`, `data-helmet-grid`, `data-hero-anim`,
`data-horizontal-section`, `data-marquee-scroll-target`, `data-marquee-scroll-direction-target`,
`data-countdown-{wrap,digit,date-target}`, `data-cal-{wrap,item,target,track-wrap}`,
`data-stat-{list,item,hover-img}`, `data-nav-theme` / `data-nav-theme-target`,
`data-text-hover-chars`, `data-text-highlight`, `data-img-highlight`, `data-list-reveal`,
`data-video-stream` + `-placeholder` + `-wrap`, `data-rive-circuit-hover-target`,
`data-podium-media`, `data-oval-scroll`, `data-mouse-track`, `data-exe-section` / `-visor`,
`data-otot-section` / `-bottom`.

Stack confermato dalle occorrenze nel bundle: **THREE.js** (188), **GSAP** (179) con
**ScrollTrigger** (~200 tra maiuscole e minuscole), **Flip**, **DrawSVG**, **CustomEase**,
**Rive** (217), **Lenis** (72).

### Repository GitHub
**Nessun repo ufficiale.** OFF+BRAND non pubblica. Ci sono pero' 40 repo di terzi, e due sono
utili come lettura:

| Repo | ★ | Cosa e' |
|---|---|---|
| `OtanoStudio/Lando-Demo` | 23 | demo in React Three Fiber della home, senza la scia del mouse — GPL-3.0 |
| `xing0325/landonorris-teardown` | 0 | smontaggio dichiarato di OFF+BRAND: 11 demo + 17 blocchi |
| `xing0325/web-anim-cookbook` | 0 | 65 demo autoconsistenti ricavate da landonorris.com |
| `boyang-hu/landonorris-rebuild` | 0 | ricostruzione 1:1 a scopo di studio, aggiornata all'11 ago 2026 |

Sono **ricostruzioni**, non il sorgente. Valgono come scorciatoia per capire un effetto, non
come prova di come l'hanno fatto davvero.

---

## 2. Messenger — messenger.abeto.co (studio: Abeto)

### Sourcemap
**Assente.** L'HTML e i due bundle non contengono `sourceMappingURL`. Richiesta alla cieca a
`https://messenger.abeto.co/assets/App3D-DwM1eiaC.js.map`: risponde 200 ma **1 699 byte di
`text/html`**, cioe' il fallback SPA (la stessa `index.html`). Non e' una mappa.

### Cosa si scarica

| URL | HTTP | Dimensione |
|---|---|---|
| `https://messenger.abeto.co/assets/App3D-DwM1eiaC.js` | 200 | **1 926 191 byte** (12 652 righe) |
| `https://messenger.abeto.co/assets/webgl-CS4l6lxD.js` | 200 | 3 817 byte (entry) |
| `https://messenger.abeto.co/assets/style-BgpnrCnL.css` | 200 | 1 493 byte |

L'HTML e' 1 699 byte in tutto, `<body>` vuoto: **tutto il sito e' WebGL**, non c'e' un solo
elemento di contenuto nel markup. Build **Vite** (hash a 8 caratteri stile rollup).

### Tre cose interessanti

**a) Il CSS totale del sito e' 1 493 byte.** Un gioco 3D completo con personaggio, dialoghi e
sette ambienti sonori sta in un foglio di stile piu' piccolo di un bottone di Bootstrap.

**b) L'elenco degli asset e' il documento di design del gioco.** Dal bundle, con nomi parlanti:

- Geometrie compresse **Draco**: `planets/present/{beachfoam,waterfall,waterfall_inlet,waterfallsplash}_vfx.drc`,
  `planets/intro/points.drc`, `birds/{1,2,curve-1,curve-2}.drc`,
  `deliveries/{clothes,letterwet,note,offering,postcard,samplebox}.drc`
- Texture **KTX2**: `butterfly-highq.ktx2`, `butterfly-front-highq.ktx2`, `eye-highq.ktx2`,
  `grass-blades-highq.ktx2`, `clouds_noise_{64,512}.ktx2`, `galaxy.ktx2`, `atlas.png`
- Audio **OGG** diviso per funzione: `ambiances/{base,beach,city,factory,forest,temple,waterfalls}.ogg`,
  `character/{footsteps4,footsteps-water,jump-start,jump-land,clothes,bubble-starts,bubble-ends,emoji-starts1..3,emoji-ends1..3}.ogg`,
  `camera/{whoosh2,zoom-in-5,zoom-off-5}.ogg`,
  `dialogues/{male1..3,female1..3,quest,wtf}.ogg`,
  `intro/{letters,button-turn,button-out,rune1..3}.ogg`

I nomi dicono le scelte: sette ambienti sonori distinti che si incrociano (`base` sempre
sotto), i passi separati per superficie (`footsteps-water`), tre varianti casuali per
l'apertura e la chiusura di ogni emoji, e un file che si chiama `wtf.ogg`.

**c) Nessuna dipendenza UI.** Le occorrenze nel bundle sono `THREE` (216), `KTX2` (118 tra
maiuscole e minuscole), `Draco` (~25), `postprocessing` (12), `meshopt` (10). Nessun React,
nessun Vue, nessun GSAP: l'animazione e' tutta scritta a mano dentro il loop di render.

### Repository GitHub
**Nessun repo di Abeto.** Esiste `arafays/messenger-copy` — "Unofficial AI-assisted learning
rebuild of messenger.abeto.co (SvelteKit + Three.js)". Ricostruzione, non sorgente.

---

## 3. Igloo — igloo.inc (studio: Abeto)

Stesso studio di Messenger, e **si vede dalla build**: identica struttura Vite, identico schema
di nomi (`index-<hash>.js` che importa `App3D-<hash>.js`).

### Sourcemap
**Assente.** Nessun riferimento nei bundle. Alla cieca,
`https://www.igloo.inc/assets/App3D-f554a111.js.map` risponde 200 ma con 1 410 byte di
`text/html` (fallback SPA). Non e' una mappa.

### Cosa si scarica

| URL | HTTP | Dimensione |
|---|---|---|
| `https://www.igloo.inc/assets/index-2eb69c09.js` | 200 | 16 546 byte (loader) |
| `https://www.igloo.inc/assets/App3D-f554a111.js` | 200 | **1 487 415 byte** (9 665 righe) |

L'HTML della home e' **1 410 byte**: come Messenger, il sito e' interamente WebGL.

### Tre cose interessanti

**a) Gli asset hanno nomi che raccontano l'intera coreografia.** Dal bundle:
`igloo.drc`, `igloo/igloo_cage.drc`, `igloo/ground_color.ktx2`, `igloo/ground_glow.ktx2`,
`igloo/ground_sansigloo_color.ktx2` (il terreno **senza** l'igloo: una seconda versione della
mappa per quando l'igloo sparisce), `ceilingsmoke.drc`, `floor.drc` + `floor_color.ktx2`,
`caustics.ktx2`, `frost-datatexture.ktx2`, `bokeh.ktx2`, `cubes_env.exr`.

**b) La sezione "cubi" e' un mini-motore a se'.** `cubes/advect.png` (campo di avvezione per
una simulazione di fluido su GPU), `cubes/cube_scene.ktx2`, `cubes/dot_pattern.ktx2`,
`cubes/blurrytext_atlas.ktx2`, `cubes/background_shapes.drc`, piu' `blurrytext.drc` e
`blurrytext_cylinder.drc` — il testo sfocato e' **geometria**, non tipografia, ed esiste anche
nella variante avvolta su un cilindro.

**c) Il font e' caricato due volte, in due formati diversi.** `IBMPlexMono-Regular/Medium`
come `.woff`/`.woff2` per il DOM e `../fonts/IBMPlexMono-Medium-datatexture.ktx2` come
**data texture** per il testo dentro il WebGL. E l'audio e' minimale e funzionale:
`beeps.ogg`, `beeps2.ogg`, `beeps3.ogg`, `circles.ogg`, `igloo.ogg`, `click-project.ogg`,
`enter-project.ogg`.

Occorrenze: `THREE` (213), `ktx2` (124), `gsap` (59), `draco` (38), `meshopt` (6). Qui, a
differenza di Messenger, **GSAP c'e'**: la parte narrativa e' animata con timeline.

### Repository GitHub
**Nessun repo di Abeto.** 15 risultati, tutti cloni e studi:
`LAYTAT/igloo-reverse-engineering` ("Reverse engineering study of igloo.inc — immersive 3D
WebGL experience by Abeto"), `Vishagautam/igloo` ("Igloo.inc local clone with full 3D asset
downloader"), `Jada-Q/igloo-mirror` (studio GPGPU su 65k particelle), `SamGomes1984/igloo-website-clone`.
Nessuno con licenza e nessuno che sia il codice vero.

---

## 4. Dark — dark.netflix.io

### Sourcemap
**Assente.** Nessun riferimento in `app.js`, `vendors.js`, `app.css`. Alla cieca i `.map`
rispondono 200 con 5 278 byte di `text/html` (fallback: il server rende `index.html` per
qualsiasi path sconosciuto).

### Attenzione al `<base href>`

I `<script src>` nell'HTML sono relativi (`js/app.js`) e **non funzionano** se presi alla
lettera: c'e' un `<base href="https://dark.netflix.io//version/1653376168543/"/>` che li
riscrive. I file veri sono:

| URL | HTTP | Dimensione |
|---|---|---|
| `https://dark.netflix.io/version/1653376168543/js/app.js` | 200 | 853 921 byte |
| `https://dark.netflix.io/version/1653376168543/js/vendors.js` | 200 | 985 767 byte |
| `https://dark.netflix.io/version/1653376168543/css/app.css` | 200 | 45 023 byte |

### Tre cose interessanti

**a) Il backend e' PHP e risponde in JSON su `/index.php/<rotta>`.**
`https://dark.netflix.io/index.php/api` -> **HTTP 200, `application/json`, 5 762 byte**, forma
`{"data":"<!doctype html>..."}`. E' un CMS in PHP (impianto tipo Kirby) che restituisce il
markup della rotta dentro un involucro JSON: e' cosi' che la SPA cambia pagina senza ricaricare.
Le rotte trovate nel bundle: `/family-tree`, `/event-timeline/`, `/event-timeline/:id`,
`/imprint`, `/privacy-policy`.

**b) C'e' un file `data/spoiler_filter.txt`.** Il riferimento e' nel bundle. Il file non e'
piu' raggiungibile (il server rende il fallback HTML), ma il nome dice una scelta di prodotto
notevole: un **filtro anti-spoiler lato client** su una guida ufficiale a una serie il cui
intero senso e' l'ordine in cui scopri le cose.

**c) Contenuto interamente data-driven, con 8 lingue.** Il bundle carica
`{ar,de,en,es,nl,pl,pt,tr}.json` come chunk asincroni, e referenzia un centinaio di immagini
personaggio numerate (`C01.jpg` ... `C115.jpg`): l'albero genealogico e la timeline sono
generati da dati, non scritti a mano. `vue` compare 38 volte: e' un'app **Vue** con
`THREE` e `gsap` usati solo per gli accenti.

### Repository GitHub
**Nessun repo.** Ne' Netflix ne' lo studio hanno pubblicato.

---

## 5. Persepolis — persepolis.getty.edu

### Sourcemap
**Assente.** Nessun riferimento. Alla cieca i `.map` rispondono **403 `application/xml`**:
il sito sta su un bucket S3/CloudFront che nega esplicitamente le chiavi che non esistono —
piu' pulito del fallback HTML di Dark, e conferma che il file non c'e'.

### Cosa si scarica

| URL | HTTP | Dimensione |
|---|---|---|
| `https://persepolis.getty.edu/version/1659513005297/js/app.js` | 200 | 802 482 byte |
| `https://persepolis.getty.edu/version/1659513005297/js/vendors.js` | 200 | 747 302 byte |
| `https://persepolis.getty.edu/version/1659513005297/css/app.css` | 200 | 76 417 byte |

### Tre cose interessanti

**a) E' lo stesso impianto di Dark, dello stesso studio.** Identico schema di URL
(`/version/<timestamp-ms>/js/app.js` + `vendors.js`), identica separazione app/vendors,
stesso stack Vue + gsap + THREE, stessa strategia i18n a chunk JSON. Il timestamp e' la data
di build: `1659513005297` = **3 agosto 2022**, contro `1653376168543` = **24 maggio 2022** di
Dark. Due progetti diversi, due clienti diversi, **la stessa base di partenza riusata a
distanza di dieci settimane**. E' esattamente il modello che rende sostenibile un'agenzia:
un impianto proprio, riusato, non un framework nuovo per ogni cliente.

**b) Otto lingue, e la scelta dice il pubblico.** `en_US`, `es`, `fr`, `hi`, `ar`, `fa`,
`zh_Hans`, `zh_Hant`. **`fa` e' il persiano** — un museo americano che pubblica su Persepoli
localizza per l'Iran, e distingue cinese semplificato da tradizionale. Il costo tecnico e'
nullo (sono chunk JSON), il segnale culturale e' enorme.

**c) La directory e' chiusa ma il versionamento e' prevedibile.**
`/version/1659513005297/js/` -> 403, `/version/1659513005297/static/` -> 403. Nessun listing.
Ma il timestamp e' nell'HTML in chiaro, quindi qualunque path noto dentro `static/` si
raggiunge. Il bundle referenzia `p.mp4`.

### Repository GitHub
**Nessun repo.** Il Getty ha un'organizzazione GitHub attiva (dataset e strumenti), ma il
sito Persepolis non c'e'.

---

## 6. Vero — verostudio.com

Il ritrovamento piu' ricco dei tredici. Non per la sourcemap, ma per il CMS.

### Sourcemap
**Referenziata ma non pubblicata.** Questo e' il caso interessante: **25 dei 32 chunk
contengono davvero il commento** `//# sourceMappingURL=...`. Esempi:

```
//# sourceMappingURL=0-nktl7x.k8q2.js.map
//# sourceMappingURL=03rkjywxv_m-5.js.map
//# sourceMappingURL=0n3v0aitc~ywi.js.map
//# sourceMappingURL=turbopack-... (idem)
```

Ma i file **non sono stati caricati**: `https://www.verostudio.com/_next/static/chunks/0-nktl7x.k8q2.js.map`
-> **404**, 9 byte di `text/plain`. Provato anche con il parametro di deploy
(`?dpl=dpl_5DJLEfML6Tahb8bYNMHiKG68mpNy`): 404 lo stesso.

E' il caso da tenere d'occhio in generale: **il commento resta anche quando la mappa non
viene deployata**. Su un sito con una configurazione un po' diversa quella stessa build
avrebbe consegnato i sorgenti. Vale sempre la pena provare.

Da notare anche che **il nome della mappa non corrisponde al nome del chunk**
(`02unrdx1lxkac.js` referenzia `0-nktl7x.k8q2.js.map`): e' l'offuscamento dei nomi di Vercel,
che rimescola i filename in output. Nemmeno indovinando si arriva alla mappa.

### CMS Sanity completamente pubblico

Nell'HTML compare `xei5vqg0.api.sanity.io`. Il project id e' `xei5vqg0` e il dataset
`production` e' **leggibile senza token**:

| URL | HTTP | Risposta |
|---|---|---|
| `https://xei5vqg0.apicdn.sanity.io/v2021-10-21/data/query/production?query=count(*)` | 200 | `{"result":237}` |
| `.../production?query=array::unique(*._type)` | 200 | elenco dei tipi |
| `.../production?query=*[_id=="16e7e25e-..."][0]` | 200 | **21 726 byte**: la homepage intera |

**237 documenti**, di cui 214 `sanity.imageAsset`, 8 `sanity.fileAsset` e 15 di contenuto.
Nessuna bozza (`count(*[_id in path("drafts.**")])` = 0). L'endpoint di amministrazione
(`api.sanity.io/v1/projects`) e' invece chiuso: 401.

L'indice completo dei contenuti:

| `_id` | `_type` | titolo |
|---|---|---|
| `16e7e25e-…` | default-page | Homepage |
| `e09687a2-…` | default.page | Homepage (versione vecchia, tipo col punto) |
| `613b34c8-…` | default-page | About |
| `3cd3efbb-…` | default-page | Process |
| `3773ba56-…` | default-page | Featured Designers |
| `7ac6a234-…` | default-page | Add to Registry |
| `ab5f0d67-…` | default-page | FAQ |
| `42927c19-…` | default-page | Privacy Policy |
| `ff010a24-…` | default-page | Terms & Conditions |
| `8d1b95d2-…` | default.page | Terms & conditions (doppione, tipo vecchio) |
| `checkout-page` | checkout-page | Checkout |
| `gallery-page` | gallery-page | Gallery |
| `product-page` | product-page | Product |
| `layout` / `root-layout` | layout / root-layout | Root Layout (due volte) |

### Tre cose interessanti

**a) La libreria di sezioni e' l'indice del design system.** Una sola query
(`array::unique(*[].sections[]._type)`) restituisce i dodici componenti con cui e' montato
tutto il sito:

`main-hero`, `secondary-hero`, `cover-media`, `dress-discover`,
`full-size-scroller-stepper`, `diptych`, `triptych`, `media-grid-push`, `media-quote`,
`large-quote`, `large-accordions-edito`, `reassurance`.

Dodici blocchi per un intero sito e-commerce di lusso. `reassurance` (la fascia
resi/garanzia/spedizione) e `large-accordions-edito` sono i nomi che si usano in Francia:
lo studio e' francofono.

**b) Il documento della homepage e' leggibile per intero, con testi, alt e temi.**
Estratto vero:

```json
"metadata": { "title": "Vero",
  "description": "Vero is a luxury fine-art studio creating museum-quality
                  sculptures that capture every detail." },
"sections": [{ "_type": "main-hero",
  "container": { "theme": "ultra-light" },
  "fallback": { "alt": "Wedding dress", "asset": {...-1728x1001-jpg} },
  "media": { "type": "video",
             "video":         { "aria_label": "Vero dress video introduction" },
             "video_desktop": { "aria_label": "Vero dress video introduction" } },
  "title": [{ "style": "h1", "children": [
      { "text": "Custom",        "marks": ["em"] },
      { "text": "sculpture",     "marks": ["uppercase"] },
      { "text": "of your",       "marks": ["em"] },
      { "text": "wedding dress", "marks": ["uppercase"] } ] }] }]
```

Due cose da rubare: il titolo H1 non e' una stringa ma **rich text con marks tipografici**
(`em` corsivo / `uppercase`) decisi dal redattore parola per parola — cosi' l'alternanza
corsivo/maiuscolo del titolone e' modificabile dal cliente senza toccare il codice. E il
video ha **due asset separati** (`video` e `video_desktop`) piu' un `fallback` immagine e un
`aria_label` per ognuno. L'immagine di OpenGraph e' un file **20604x11590** px.

**c) La struttura di cartelle del WebGL e' trapelata dai chunk.** Non c'e' la sourcemap, ma
un import dinamico a glob ha lasciato dentro i path relativi veri, con estensione:

```
./scenes/CoinScene/CoinScene.ts          ./scenes/CoinScene/CoinPane.ts
./scenes/DressesScene/DressesScene.ts    ./scenes/DressesScene/DressesPane.ts
./scenes/DressDiscoverScene/DressDiscoverScene.ts
./scenes/DressDiscoverScene/DressDiscoverPane.ts
./scenes/LogoScene/LogoScene.ts          ./scenes/DemoScene/DemoScene.ts
```

Cinque scene, e ogni scena importante ha il suo file `*Pane.ts`: sono i **pannelli di debug
Tweakpane**, uno per scena, spediti in produzione insieme al resto. C'e' anche una
`DemoScene` — la scena di prova rimasta nel bundle finale.

In piu', un path di `node_modules` sfuggito in una stringa rivela le versioni esatte:

```
/ROOT/node_modules/.pnpm/next@16.2.6_@babel+core@7.28.5_@opentelemetry+api@1.9.0
_react-dom@19.2.6_react@19.2.6__react@19.2.6_sass@1.94.2/node_modules/next/dist/...
```

Next 16.2.6, React 19.2.6, Sass 1.94.2, gestore pacchetti **pnpm**, deploy su Vercel.

### Repository GitHub
**Nessuno.** `Verostudio/Verostudio` e' solo un profilo GitHub vuoto; `DavidMichaelNaim/VeroStudio`
non c'entra.

---

## 7. Kode — kodeclubs.com (studio: Merci-Michel)

### Sourcemap
**Assente.** Nessun commento nei bundle. Alla cieca, i `.map` rispondono **403** (il bucket
nega gli oggetti inesistenti). Confermato: non ci sono.

### Un bucket Google Cloud Storage aperto in lettura

Tutto il sito e' servito da `storage.googleapis.com/mm-kode.appspot.com/assets/20250516_134806/`.
`mm` sta per **Merci-Michel**, e `20250516_134806` e' il timestamp della build (16 maggio 2025,
13:48:06).

Il **listing e' negato** (`storage.objects.list` -> 401/403 sia via API JSON che XML), ma
**ogni singolo oggetto e' leggibile in anonimo**:

| URL (prefisso comune omesso) | HTTP | Dimensione |
|---|---|---|
| `js/App.bundle.js` | 200 | 321 062 byte |
| `js/vendors~App.bundle.js` | 200 | 721 143 byte |
| `js/Home.bundle.js` | 200 | 5 186 byte |
| `js/runtime.bundle.js` | 200 | 3 911 byte |
| `packs/canvas.pack` | 200 | **> 2,5 MB** (`application/octet-stream`) |
| `css/Home.bundle.css` | 200 | **0 byte** (!) |
| `static/app/Kode_Terms_and_Conditions.pdf` | 200 | — |
| `fonts/AntiqueOlive.woff2`, `AntiqueOlive-Compact.woff2` | 200 | — |

### Tre cose interessanti

**a) `canvas.pack`: un archivio unico con dentro tutta la scena.** Non caricano venti file:
ne caricano uno. I nomi delle voci interne stanno nel bundle e si leggono come un indice:

```
canvas.pack/Characters.json          canvas.pack/Character.svg
canvas.pack/MatCap.jpg               canvas.pack/Minimap.png
canvas.pack/AntiqueOlive-Compact.json + .png   (atlante del font)
canvas.pack/ao_maps/Blocks_${n}.png  canvas.pack/ao_maps/Other.png
canvas.pack/env_map/{...}.jpg        canvas.pack/Audio/${nome}.m4a
canvas.pack/{Arrow,Butterfly,Colors,Exclamation,Gradient,Hover,Icons,Target}.svg
```

Le ambient occlusion sono **precotte in texture** (`ao_maps/Blocks_0..4.png`) invece che
calcolate: e' il trucco che tiene il sito fluido su macchine deboli. L'audio e' `.m4a`, non
`.ogg` — scelta da target Apple/mobile.

**b) I numeri della fisica sono in chiaro.** Il bundle usa **cannon.js** e i materiali di
contatto sono leggibili con i valori esatti:

```js
new ContactMaterial(CollisionBox, Ball,      { friction: 0,    restitution: 0.5 })
new ContactMaterial(Ground,       Ball,      { friction: 0.35, restitution: 0.5 })
new ContactMaterial(Ground,       Character, { friction: 0,    restitution: 1   })
// defaultContactMaterial: { friction: 0, restitution: 0 }
// gruppi di collisione: Default:1, Ball:2, OnlyBall:4
```

La palla rimbalza a meta' (0.5) e frena sul terreno (0.35) ma non sulle pareti (0); il
personaggio **non ha attrito col terreno e rimbalza a 1**, cioe' non e' fisica realistica, e'
un personaggio che scivola. Sono le tre righe che decidono come "si sente" il gioco, e sono
pubbliche.

**c) Il pannello di regolazione della luce e' rimasto dentro.** `applySettings()` legge da un
albero `settings.lighting` fatto di `{ intensity: {value}, color: {value}, position:
{x,y,z:{value}}, castShadow: {value}, shadowMapSize: {value} }` per `ambientLight`,
`hemisphereLight` e `keyLight`. La forma `{value:...}` e' quella di una GUI di debug
(dat.GUI/Tweakpane) lasciata come sorgente di verita' anche in produzione. E si legge che la
`shadowMapSize` viene riletta a ogni frame e la shadow map ricreata quando cambia.

Stack: THREE + GSAP/ScrollTrigger + cannon.js, webpack (non Vite: `runtime.bundle.js` +
`vendors~App.bundle.js` e' la firma di webpack 4).

### Repository GitHub
**Nessuno.** Merci-Michel non pubblica.

---

## 8. Don't Board Me — dontboardme.com (studio: The First The Last)

Il caso piu' clamoroso di dati esposti, e non per il codice.

### Sourcemap
**Assente.** Nessun commento in `entry.66570678.js` ne' negli altri chunk `_nuxt`.

### Il CMS Strapi e' pubblico e non autenticato

`https://api.dontboardme.com/` risponde **200** con la pagina "Welcome to your Strapi app".
E' un'istanza Strapi con permessi pubblici sui content type:

| URL | HTTP | Contenuto |
|---|---|---|
| `https://api.dontboardme.com/api/footer` | 200 | 281 byte, JSON |
| `https://api.dontboardme.com/api/footer?populate=*` | 200 | JSON completo con social e media |
| `https://api.dontboardme.com/api/home` | **404** | il content type non esiste piu' |
| `https://api.dontboardme.com/admin` | 200 | pannello di amministrazione (login) |

Risposta integrale di `/api/footer`:

```json
{"data":{"id":1,"attributes":{
  "Address":"San Diego-Carlsbad, CA Metropolitan Area",
  "createdAt":"2023-12-01T11:35:17.605Z",
  "updatedAt":"2024-02-29T09:14:24.431Z",
  "publishedAt":"2023-12-01T11:35:18.721Z",
  "Instagram_hashtag":"@don’tboardme",
  "Email":"ayvamail@gmail.com"}},"meta":{}}
```

### Tre cose interessanti

**a) L'email personale del cliente e' servita in chiaro da un endpoint pubblico.**
`ayvamail@gmail.com`. Non e' un indirizzo aziendale: e' la Gmail della titolare, esposta da
un'API senza autenticazione su un sito premiato. Chiunque la raccoglie con una riga di curl.

**b) Con `?populate=*` esce anche il resto**, compreso un errore mai corretto:

```json
"Social_Block":[
 {"Social_name":"Instagram","Social_link":"https://www.instagram.com/dontboardme/"},
 {"Social_name":"Tik-tok",  "Social_link":"https://tik-tok.com/dontboardme/"},
 {"Social_name":"Facebook", "Social_link":"https://Facebook.com/dontboardme/"},
 {"Social_name":"WhatsApp", "Social_link":"+18584492691"}]
```

`https://tik-tok.com/...` **non e' TikTok** (il dominio giusto e' `tiktok.com`): il link social
del sito e' rotto da quando e' stato pubblicato, e nessuno se n'e' accorto. Compare anche il
numero WhatsApp. Escono poi i metadati completi della media library, con le quattro varianti
generate da Strapi per ogni immagine (`thumbnail_` 218px, `small_` 500px, `medium_` 750px,
`large_` 1000px) e le dimensioni originali — una foto e' **5039x3599**.

**c) I nomi dei chunk Nuxt non sono offuscati: c'e' l'intera mappa del progetto.**
Diciannove file sotto `/_nuxt/`, con i nomi dei componenti Vue e dei composable veri:

- **Rotte**: `index`, `about-us`, `services`, `pricing`, `book-now`, `contacts`, `faq`,
  `privacy-policy`, `terms-of-use`, `_slug_` (rotta dinamica, blog)
- **Componenti**: `Footer`, `InstagramBlock`, `CostWalking`, `CarePetRightBall`, `ArrowDown`
- **Composable**: `usePageMeta`, `useShowPageAnim`, `useShowPageAnimFirst`
- **Utility**: `validateEmail`, `formattingDateToUS`
- **Vendor**: `lottie`, `swiper-vue`

`useShowPageAnim` **e** `useShowPageAnimFirst` sono due composable separati: la prima
animazione di ingresso e' un caso a parte rispetto a tutte le altre. E `formattingDateToUS`
ha un refuso nel nome (`formatting` invece di `format`) rimasto in produzione.

Le immagini caricate su Strapi hanno nomi traslitterati dal russo
(`1618027531_13_p_sobaka_i_chelovek_sobaki_krasivo_fo...` — "sobaka i chelovek", cane e uomo):
foto stock scaricate da un banco immagini russo dal team che ha popolato il CMS.

### Repository GitHub
**Nessuno.**

---

## 9. Opal Tadpole — opalcamera.com (design: Claudio Guglieri, sviluppo: Ingamana)

Sito premiato morto: `opalcamera.com` fa 301 su `https://op.al/`. Quindi due verifiche
distinte, la versione premiata dagli archivi e il sito di oggi dal vivo.

### Sourcemap — versione premiata (2023)

**Assente.** Scaricato dalla Wayback il bundle vero della versione premiata:

| URL | HTTP | Dimensione |
|---|---|---|
| `https://opalcamera.com/static/app.0d8bddea.js` (snapshot `20231218024727`) | 200 | **2 730 944 byte** |

Zero occorrenze di `//# sourceMappingURL=`. E l'indice CDX della Wayback interrogato su
tutto il dominio con filtro `original:.*\.map.*` restituisce **zero righe**: in dieci anni
di catture nessun `.map` e' mai stato servito da `opalcamera.com`.

Il bundle e' pero' minificato **senza offuscare le stringhe** — e' quello che ha permesso
la lettura della scheda (testi, parametri ScrollTrigger, path dei media). Vale la
distinzione: *leggibile* non e' *ricostruibile*.

### Sourcemap — sito di oggi (op.al)

**Assente.** Next.js con **Turbopack** su Vercel. Undici chunk nell'HTML, tutti scaricati
e controllati uno per uno:

| chunk | byte | `sourceMappingURL` |
|---|---|---|
| `0_.w4gas~pai9.js` | 1 106 669 | 0 |
| `0v9c2uadhpd-i.js` | 226 355 | 0 |
| `0hhy4_~8_qz4j.js` | 146 039 | 0 |
| `03~yq9q893hmn.js` | 112 594 | 0 |
| altri 7 (da 3 377 a 96 201 byte) | — | 0 |

Nomi rimescolati alla maniera di Vercel, come su Vero. Richiesta alla cieca di
`0-d~ftm-m0wca.js.map` -> **403, 1 byte, `text/plain`**. Il 403 e' informativo: e' la
stessa firma di Persepolis (l'origine nega la chiave inesistente invece di rendere il
fallback HTML), quindi il file **non c'e'**, non e' un problema di rotta.

`https://op.al/.git/config` e `https://op.al/package.json` -> **404** (30 739 byte di
pagina d'errore HTML: e' il 404 dell'app Next, non un file).

### Repository GitHub: l'unico caso di codice ufficiale, ma non e' il sito

Esiste davvero un'organizzazione dell'azienda: **`Opal-Camera`** ("Opal Electronics",
creata il 07/12/2020, sito dichiarato `op.al`), **6 repo pubblici**.

| Repo | ★ | Licenza | Cosa e' |
|---|---|---|---|
| `Opal-Camera/tadpole-gpl2` | 9 | **GPL-2.0** | **~499 MB**: l'albero SDK/kernel della Tadpole (`amboot/`, `kernel/`, `boards/`, `packages/`, `external/`, `opal/`, `prebuild oss/`). Descrizione: *"GPLv2 licensed code for the Tadpole line of cameras"* |
| `Opal-Camera/MetalPetal` | 0 | MIT | fork del framework di image processing su Metal |
| `Opal-Camera/TBStateMachine` | 1 | MIT | fork, macchina a stati in Objective-C |
| `Opal-Camera/depthai-shared` | 1 | MIT | fork |
| `Opal-Camera/PyOgg` | 0 | Unlicense | fork |
| `Opal-Camera/AS5047P` | 0 | GPL-3.0 | fork, sensore di posizione rotativo |

E' il **firmware della telecamera**, pubblicato per obbligo di licenza (la GPLv2 del kernel
Linux costringe chi spedisce hardware a rilasciare i sorgenti), non il sito. Il repo e'
stato creato l'08/08/2025, quindi molto dopo il premio.

Dello studio di sviluppo: l'organizzazione **`Ingamana`** su GitHub **esiste** (creata il
04/06/2021) ma ha **0 repo pubblici**. Esattamente come `Verostudio`: un profilo prenotato
e vuoto. Cercando "guglieri" non esce nulla di attinente.

L'unica ricostruzione seria e' `frontendfyi/opal-tadpole-rebuild` (Vite + React +
TypeScript + Tailwind, ultimo push 24/04/2024), fatta per un video didattico.

### Licenza

Il codice del sito **non ha licenza e non e' pubblicato**: si studia dal bundle
archiviato, non si copia. Il firmware `tadpole-gpl2` e' **GPL-2.0** — riusabile, ma
contagioso: chi ne prende un pezzo deve rilasciare GPL-2.0 a sua volta. Interessante il
`LICENSE.md` della ricostruzione di frontend.fyi, che e' il modello giusto per pubblicare
uno studio senza rubare: permessi MIT sul **codice**, piu' una clausola esplicita —
*"Parts of the design that are a direct copy of the platform or website rebuild as part of
this tutorial, REMAIN COPYRIGHTED BY THEIR ORIGINAL OWNER."*

### Cosa si impara

Poco dal codice, molto dal metodo. Due cose concrete:

**a) Il 403 vale piu' del 404.** Provando i `.map` alla cieca, tre risposte diverse
significano tre cose diverse: **200 con `text/html`** = fallback SPA, non sai niente (e' il
caso di Messenger, Igloo, Dark); **404** = la rotta esiste ma il file no (Vero); **403 con
1 byte** = l'origine (S3/Vercel) nega esplicitamente una chiave che non esiste, ed e' la
conferma piu' pulita che la mappa non e' mai stata caricata. Vale la pena guardare
`content-type` e dimensione, non solo il codice.

**b) Se il cliente vende hardware, cerca l'obbligo di licenza prima del portfolio.** Il
solo codice ufficiale di Opal e' online perche' la GPL glielo impone, non perche'
abbiano voluto condividere. E' una regola generale: telecamere, router, TV, stampanti —
c'e' quasi sempre un repo `-gpl` da qualche parte, e dentro ci sono le scelte di sistema
vere (driver, board file, toolchain).

---

## 10. Mana Yerba Mate — manayerbamate.com (Louis Paquet + Michael Garcia)

**Il ritrovamento migliore di tutta la ricerca.** E' l'unico dei tredici siti da cui si
ricostruisce il **sorgente originale dello sviluppatore**, file per file, con i commenti
in francese dentro.

### Sourcemap: c'e', ed e' completa

Il sito e' **Shopify**, tema `/t/18/`, con un solo file JavaScript custom:

| URL | HTTP | Dimensione |
|---|---|---|
| `https://manayerbamate.com/cdn/shop/t/18/assets/global.js` | 200 | **1 160 125 byte** (94 righe) |

**Dentro `global.js` non c'e' nessun commento `//# sourceMappingURL=`**: e' stato tolto.
Ma il file della mappa e' stato caricato lo stesso nella cartella degli asset, al nome
prevedibile. Richiesta alla cieca:

| URL | HTTP | Dimensione | Content-Type |
|---|---|---|---|
| `https://manayerbamate.com/cdn/shop/t/18/assets/global.js.map` | **200** | **4 228 346 byte** | `application/octet-stream` |

E' una sourcemap **v3 vera, con `sourcesContent` pieno**: 94 sorgenti, 94 contenuti,
nessuno vuoto. **2 609 020 byte di codice ricostruibile.**

### Che cosa esce

**Dodici file scritti a mano dagli sviluppatori**, sotto `../dev/`:

| file | byte | righe | cosa contiene |
|---|---|---|---|
| `dev/main.js` | 17 146 | 519 | entry: registra i plugin, monta le pagine, router AJAX |
| `dev/modules/Home.js` | 32 066 | 947 | la home: lattina 3D, ruota delle carte, hero a 400vh |
| `dev/modules/Product.js` | 21 115 | 556 | pagina prodotto |
| `dev/modules/PointsSale.js` | 13 378 | 348 | la mappa dei punti vendita (Mapbox) |
| `dev/modules/Footer.js` | 11 762 | 388 | **il mini-gioco del piede** |
| `dev/modules/Transition.js` | 10 521 | 333 | le transizioni fra pagine |
| `dev/modules/Abonnement.js` | 9 337 | 271 | abbonamento |
| `dev/modules/constants.js` | 8 682 | 329 | caricamento del modello 3D, texture, timeline dei menu |
| `dev/modules/t404.js` | 7 076 | 215 | la 404 |
| `dev/modules/Global.js` | 6 188 | 174 | comportamenti comuni a tutte le pagine |
| `dev/modules/utils.js` | 1 608 | 66 | helper |
| `dev/modules/Faq.js` | 1 524 | 51 | fisarmonica FAQ |

**Totale: 140 403 byte, circa 4 200 righe di sorgente originale**, indentato, con i
commenti dell'autore intatti. Esempio letterale da `main.js`:

```js
// A REMETTRE POUR AJAX
history.scrollRestoration = "manual";
// window.onbeforeunload = function () {
//     window.scrollTo(0, 0);
// }
```

E gli import con gli alias di percorso, che dicono come era configurato il bundler:

```js
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import MorphSVGPlugin from "gsap/MorphSVGPlugin"
import {mod} from 'modules/utils'
import Swiper, { Navigation } from 'swiper';
import {chargementModele, canGeometry, textureMure, texturePamp, textureTrop,
        tlMenu, tlBoutique, tlApprendre, tlCart, tlMenuMob, tlCredits,
        varsHome, varsProduct, firstC} from "modules/constants"
import Lottie from 'lottie-web'
```

**Piu' 82 file da `node_modules`**, anch'essi con sorgente completo. La lista e' la
distinta base esatta del sito: `@studio-freight/lenis`, `gsap` (`gsap-core`, `CSSPlugin`,
`Observer`, `ScrollTrigger`, `utils/paths`, **`MorphSVGPlugin`**), `three` (`build` +
`examples`), `lottie-web`, `swiper` (`core`, `modules`, `shared`) con `dom7` e
`ssr-window`, `virtual-scroll`, `tiny-emitter`.

**Nota sgradevole per lo studio:** fra questi c'e' `gsap/MorphSVGPlugin.js`, **30 180 byte
/ 792 righe di sorgente completo**, con l'intestazione *"Subject to the terms at
greensock.com/standard-license or for Club GreenSock members, the agreement issued with
that membership"*. E' un plugin **a pagamento**, e la sua sorgente non minificata e'
pubblicamente scaricabile dal CDN di un negozio Shopify. Non e' un bene: e' esattamente
quello che la licenza di GreenSock chiede di non fare.

### Il CSS invece non da' niente

`app.css` (65 467 byte) **ha** il commento: `sourceMappingURL=/cdn/shop/t/18/assets/app.css.map`.
Il file risponde 200 con 146 974 byte, ma dentro ha **una sola `sources`**, che e'
`/cdn/shop/t/18/assets/app.css` — cioe' il CSS gia' minificato mappato su se stesso. E'
una mappa generata a valle dalla minificazione, non dal Sass. Inutile. Da ricordare: la
presenza di un `.map` non garantisce niente, va aperto e contato.

### Perche' e' successo

Su Shopify **tutto quello che sta nella cartella `assets/` del tema viene pubblicato**.
Il build locale ha scritto `global.js` e `global.js.map` fianco a fianco, il tema e' stato
caricato per intero, e la mappa e' andata in produzione insieme al resto. Togliere il
commento dal bundle non serve a niente se il file resta sul server: **il nome e'
prevedibile**.

### Repository GitHub

**Nessuno.** Cercando `manayerbamate` escono 3 repo di terzi, tutti vuoti e senza
descrizione; cercando `mana yerba mate` esce un solo
`imrankhn806-bit/mana-yerba-mate-3d-ecommerce`. Niente di ufficiale: il collettivo
(Louis Paquet design, Michael Garcia front-end) non pubblica. Provati anche
`/cdn/shop/t/18/assets/main.js`, `Home.js`, `package.json`, `theme.liquid`,
`global.js.LICENSE.txt`: **404** — la mappa e' l'unica falla.

### Licenza

**Nessuna.** Non c'e' un file di licenza, non c'e' un repo, non c'e' una dichiarazione. E'
codice proprietario di un cliente commerciale, finito in chiaro per un incidente di
build. **Si studia, non si copia**, e in particolare non si ridistribuisce il
`MorphSVGPlugin.js` che ci sta dentro.

### Cosa si impara

**a) La regola operativa, prima di tutto: prova sempre `<bundle>.js.map` alla cieca, anche
quando il commento non c'e'.** Su tredici siti questo e' l'unico che consegna i sorgenti,
e li consegna a un sito che aveva gia' fatto il lavoro di togliere il riferimento. Costa
una richiesta.

**b) L'architettura, che e' semplice e copiabile.** Un solo bundle per tutto il negozio,
nessun framework, nessun router: ogni pagina e' una **classe montata solo se il suo
selettore esiste nel DOM**. Da `Global.js`:

```js
if(document.querySelector('.innerSlider')){
    this.swiper = new Swiper(".c-Collection__products", { ... });
}
if(document.querySelector('.productThumb')) { ... }
```

Sopra ci sta un router AJAX fatto a mano in `main.js`: intercetta il click su qualunque
`a:not([target="_blank"])`, chiama `transition.start(href)` e fa `history.pushState`.
Cioe': **il tema Shopify resta un sito multipagina lato server, e le transizioni sono
un'aggiunta di 333 righe** (`Transition.js`). Non c'e' nessuna SPA da mantenere.

**c) Il mini-gioco del piede e' cinque Lottie e uno ScrollTrigger.** `Footer.js` carica
`walk`, `jump`, `sad`, `happy`, `paysage` come animazioni Lottie SVG con
`autoplay: false`, e le accende con un solo trigger:

```js
ScrollTrigger.create({ trigger:'footer', start:'top bottom',
  onEnter: ()    => { this.animWalk.play(); this.animPaysage.play(); this.playNuage() },
  onLeaveBack:() => { this.animWalk.pause(); ... this.gameRunning = false;
                      gsap.set('.denree, .startGame, .startGameMobile', {clearProps:"all"}) }
})
```

Il pezzo piu' citato del sito non e' un motore di gioco: sono cinque file JSON e una
manciata di righe che li mettono in pausa quando nessuno guarda.

**d) Il 3D e' altrettanto sobrio.** In `constants.js`: `GLTFLoader` per la lattina,
`RGBELoader` per l'HDR con `EquirectangularReflectionMapping`, e le texture dei gusti
caricate a parte con `minFilter = THREE.LinearFilter` e `encoding = THREE.sRGBEncoding`
(*"color textures must be marked as sRGB"*, commento originale). Un modello, quattro
texture: e' tutto il "configuratore".

---

## 11. Star Atlas — staratlas.com (studio: Hello Monday)

Caso doppio e opposto: **il sito premiato e' chiuso, il sito di oggi e' un repository
GitHub pubblico**. Non una copia, non una ricostruzione: il repo *e'* il sito.

### Sourcemap — versione premiata (2021)

**Assente.** Scaricati dallo snapshot `20211108211419` i file veri:

| URL (prefisso `staratlas.com/` omesso) | HTTP | Dimensione |
|---|---|---|
| `build/js/main.js` | 200 | 71 536 byte |
| `build/js/MainScene.6f065ea0.js` | 200 | 19 376 byte |
| `build/css/bundle.css` | 200 | 194 657 byte |

Zero `//# sourceMappingURL=`. L'indice CDX interrogato su tutto il dominio con filtro
`original:.*\.map$` non restituisce **nessuna riga**: nessun `.map` e' mai stato archiviato
in nove anni di catture.

### Il sito di oggi e' un repo pubblico: `staratlasmeta/sa-landing-page`

Cercando l'organizzazione dell'azienda si trova **`staratlasmeta`** (creata il 13/02/2021,
**43 repo pubblici**, sito dichiarato `https://staratlas.com`). Fra i 43 c'e'
`sa-landing-page`, senza descrizione, linguaggio HTML, creato il **25/07/2025** e con
ultimo push il **02/07/2026**.

**E' il sito servito oggi da staratlas.com, byte per byte.** Verificato con md5:

| file | dal repo (`raw.githubusercontent.com`) | da `staratlas.com` | md5 |
|---|---|---|---|
| `index.html` | 41 449 byte | 41 449 byte | `9a476d45836d43059ca52842903e3067` (identico) |
| `src/main.js` | 50 045 byte | 50 045 byte | `6a4ee93924f6413c17bd6ae5e8e5ec36` (identico) |

E il repo contiene un `CNAME` con dentro una riga sola: `staratlas.com`.

### Bundle non minificato in produzione

`src/main.js` **non e' minificato e non e' offuscato**: 50 045 byte di JavaScript
indentato, con un commento d'intestazione che spiega perche' e' fatto cosi'.

```js
/**
 * Star Atlas landing (static) - extracted from inline <script> for:
 * - Better caching/performance (defer + browser cache)
 * - Maintainability (single file, grouped concerns)
 *
 * IMPORTANT: This file intentionally attaches functions to `window`
 * because the HTML uses inline `onclick="..."` handlers.
 */
```

Insieme a `styles.css` (102 160 byte, anch'esso in chiaro), e' tutto il front-end del
sito: **nessun build, nessun bundler, nessuna dipendenza**. Il `package.json` e' di sei
righe e non ha `dependencies`:

```json
{ "name": "sa-landingv2", "private": true, "type": "module",
  "scripts": { "generate": "node site/generate.mjs" } }
```

### Cosa c'e' dentro il repo (84 voci, ~186 MB)

- **Generatore statico proprio**: `site/generate.mjs` (10 759 byte, **346 righe**, importa
  solo `node:fs/promises` e `node:path` — zero pacchetti), `site/pages.json` (21 721 byte,
  il contenuto di tutte le sotto-pagine) e `site/site.config.json` (533 byte). Genera
  `game/<path>/index.html` per sette sotto-pagine (`galia`, `holosim`, `fleet-command`,
  `game-modes`, `life-in-galia`, `sage-labs`, `your-fleet-your-way`) piu' `sitemap.xml` e
  `robots.txt`. **La home no: e' scritta a mano.**
- **Documentazione**: `docs/ARCHITECTURE.md` (6 437 byte) e `docs/CONTRIBUTING.md`
  (4 418 byte). L'architettura del sito e' spiegata dagli autori, non dedotta.
- **Pipeline completa**: `.github/workflows/main.yml` fa build e deploy su bucket Google
  Cloud Storage, prima `www.dev.staratlas.cloud` poi `www.staratlas.com`, con
  autenticazione OIDC (`id-token: write`) e segreti `GCP_AUTH_KEY` / `GALAXY_URL`. Il
  runner e' `warp-ubuntu-latest-x64-4x`. C'e' anche un `deploy.yml` con l'opzione
  `use-dummy-landing`, che sostituisce l'`index.html` con una pagina nera "Coming soon..."
  — il pulsante d'emergenza per staccare il sito senza toccare il codice. Questo spiega
  l'header `server: UploadServer` osservato sul dominio: e' un bucket GCS.
- **I master video sono dentro Git**: `src/Reduced/Slide 2 Gamemodes.mp4` **26 288 097
  byte**, `src/herosection_loop_7-21-hb3.mp4` **19 394 803 byte**, PNG da 8 MB, per
  ~186 MB di repository. Il controllo di versione usato come magazzino di media, senza LFS.
- **`.claude/settings.local.json`** committato: `{"permissions":{"allow":["Bash(npm run
  generate:*)"]}}`. Il sito e' stato costruito con Claude Code, e la configurazione locale
  e' finita nel repo.

L'`action` di build spiega anche l'unica sostituzione a build time: un `sed` che rimpiazza
`https://galaxy.staratlas.com` con il valore del segreto `GALAXY_URL`.

### Il resto dell'organizzazione

Gli altri 42 repo sono la parte blockchain, non il web: `star_frame` (80 ★, Apache-2.0,
framework Solana in Rust), `FoundationKit` (49 ★, C), `factory` (38 ★, Apache-2.0,
TypeScript), `star-atlas-cookbook` (MIT), `star-atlas-decoders` (Apache-2.0), piu' una
ventina di fork dell'ecosistema Solana. Del sito premiato del 2021 non c'e' traccia:
Hello Monday non ha pubblicato niente, e la scheda del caso e' sparita anche dal loro
portfolio.

### Licenza

`sa-landing-page` **non ha licenza**: nessun file `LICENSE`, campo `license` vuoto
nell'API. Pubblico da leggere, **non concesso da riusare** — senza licenza il diritto
d'autore resta intero. Si studia, non si copia. Diverso per gli altri repo
dell'organizzazione, che sono Apache-2.0 o MIT e quelli si possono usare davvero.

### Cosa si impara

**a) Il generatore statico in 346 righe di Node senza dipendenze.** `pages.json` e' un
array di oggetti con `path`, `title`, `description`, `h1`, `intro`; `generate.mjs` li
trasforma in HTML, calcola il `depthPrefix` per rendere tutti i percorsi relativi (cosi'
il sito funziona su GitHub Pages a qualunque base path), fa l'escape dell'HTML a mano e
scrive sitemap e robots. **Per un sito di dieci pagine questo sostituisce Astro, Eleventy
e Next messi insieme**, e non invecchia: fra cinque anni `node site/generate.mjs` girera'
ancora.

**b) La regola "un file, niente build" scritta come commento.** L'intestazione di
`main.js` dichiara la scelta e la ragione (`onclick` inline nell'HTML, quindi le funzioni
devono stare su `window`). E' una scelta che qualunque revisore chiamerebbe sbagliata,
motivata in cinque righe. Vale piu' di un README.

**c) Il pulsante "Coming soon" nel workflow di deploy.** Un input booleano
(`use-dummy-landing`) che al momento del deploy sovrascrive l'`index.html` con una pagina
nera di undici righe di CSS inline. Costa venti righe di YAML e risolve il problema di
"dobbiamo staccare il sito adesso" senza rilasciare codice, senza toccare il DNS e senza
svegliare nessuno.

**d) E il promemoria scomodo**: prima di pubblicare un repo, guardare cosa c'e' dentro.
Qui sono usciti il nome dei bucket di dev e di produzione, il nome del runner
self-hosted, la lista dei segreti e la configurazione personale di uno strumento di
sviluppo. Nessuno di questi e' una credenziale, ma insieme disegnano l'infrastruttura.

---

## 12. Frans Hals Museum — franshalsmuseum.nl (studio: Build in Amsterdam)

Nessuna sourcemap, ne' nel 2018 ne' oggi. Ma il bundle del 2018 lascia uscire **l'intero
albero dei sorgenti** per un'altra strada, e lo studio pubblica codice proprio su npm.

### Sourcemap — versione premiata (2018)

**Assente, e attenzione a un falso positivo.** Scaricati tre bundle diversi dall'archivio
(il sito era WordPress, tema `franshals`):

| snapshot | URL | byte |
|---|---|---|
| `20180429214716` | `.../themes/franshals/build/app.min.js?t=2137c538e8f3…` | 2 641 319 |
| `20180712085642` | `.../themes/franshals/build/app.min.js?t=d836a386d643…` | 2 639 123 |
| `20210901091639` | `.../themes/franshals/build/app.min.js` | 2 693 902 |

In tutti e tre `sourceMappingURL` compare **una volta sola**, e non e' una mappa:

```js
sourceMappingURL=data:application/json;base64,"+i.btoa(unescape(encodeURIComponent(
    JSON.stringify(d))))),t+="\n//# sourceURL="+(g||"paperscript")
```

E' una **stringa dentro Paper.js**, il compilatore PaperScript che genera una mappa *a
runtime*. Chi cerca con un `grep` e si ferma al conteggio, qui si convince di aver trovato
una sourcemap inline e non ha trovato niente. **La stringa va sempre guardata in
contesto.**

Richieste alla cieca di `app.min.js.map`, `app.min.css.map`, `video.min.js.map`: **404**.
Nell'indice CDX, sotto il tema, nessun `.map`.

### Il colpo vero: e' Browserify, e i percorsi relativi restano nel bundle

Il bundle e' un **Browserify**, e Browserify scrive in chiaro, accanto a ogni modulo, la
mappa `{"percorso/relativo": numero}` delle sue dipendenze. Estratto letterale:

```js
w=t("./lazy-parallax.js"),C=n(w),T=c.Marionette.View.extend(...)
… },{"../../models/pageData":55,"./lazy-parallax.js":68,
     "babel-runtime/helpers/extends":104,"babel-runtime/helpers/slicedToArray":…
```

Contati: **843 percorsi relativi unici**. La maggior parte sono interni di librerie
(core-js, mapbox-gl, video.js), ma sfrondando resta **l'albero dei sorgenti del progetto**:

- **Viste, una per rotta**: `./views/home`, `./views/page`, `./views/calendar`,
  `./views/collection`, `./views/artpiece`, `./views/artist`, `./views/archive`,
  `./views/news-article`, `./views/search-results`, `./views/faq`, **`./views/my-trip`**,
  `./views/base/app`
- **Impianto**: `./router`, `./setup`, `./polyfills`, `./preloader`, `./header`,
  `./footer`, `./defaultSubView`, `./base/defaultWithRegion`,
  `./regions/TransitionRegion`, `../../models/pageData`, `components-factory`
- **Comportamenti riusabili**: `./behaviors/localization-switch`, `./behaviors/modal`,
  `./modal-dialog`
- **Effetti**: `./lazy-parallax.js`, `./lazyload`, `./spline.js`, `raf-scroll`
- **Carosello**: `./flickity`, `./slider/slider.js`, `./slide`, `./cell`, `./drag`,
  `./page-dots`, `./add-remove-cell`, `./animate`

Da qui lo stack si legge senza dubbi: **Backbone + Marionette** (`Marionette.View.extend`,
12 occorrenze), Browserify + Babel, **core-js** completo come polyfill, **mapbox-gl**
(15), **video.js** (7), **Flickity** (7), **Paper.js** (8), **TweenLite** di GSAP (10).
E' l'architettura del 2018 fotografata: una SPA a viste, non a componenti.

Nota di metodo: quei percorsi relativi hanno anche prodotto **93 URL fantasma** dentro
l'indice CDX della Wayback (`build/button.js`, `build/lazy-parallax.js`,
`build/time-controls/remaining-time-display.js`… tutti **404**). Il crawler li ha presi
per link e ha provato a scaricarli. Anche quando il sito e' morto, **l'indice CDX conserva
la lista dei moduli**.

### Sourcemap — sito di oggi

**Assente.** Oggi il dominio serve un **Next.js su Vercel** (307 da `www.`, `Server:
Vercel`, `x-vercel-id: fra1`). Scaricati e controllati **tutti e 25** i chunk dell'HTML,
da 1 936 a 544 168 byte: **zero `sourceMappingURL`**. Alla cieca,
`3434-51287e3fa6f633f7.js.map` -> **404**, 9 byte `text/plain`.
`/.git/config` e `/package.json` -> 404 (pagina d'errore dell'app).

### Il CMS c'e' ma, a differenza di Vero, non parla

Dalle URL delle immagini (`cdn.sanity.io/images/r35o2ddl/production`) si ricava che il CMS
e' **Sanity**, project id `r35o2ddl`, dataset `production`. L'endpoint risponde **senza
token**, ma a vuoto:

| Query | HTTP | Risposta |
|---|---|---|
| `https://r35o2ddl.apicdn.sanity.io/v2021-10-21/data/query/production?query=count(*)` | 200 | `{"result":0}` |
| `…?query=array::unique(*._type)` | 200 | `{"result":[]}` |
| stessa query su `staging` / `development` / `dev` / `master` / `default` | 404 | `Dataset not found` |
| `api.sanity.io/v2021-10-21/projects/r35o2ddl` | 401 | `Unauthorized` |

Il dataset esiste e l'API non chiede autenticazione, ma **non restituisce un solo
documento**. Configurato bene: le immagini sono pubbliche (lo sono sempre, sul CDN degli
asset), il contenuto no.

### Repository e pacchetti pubblici dello studio

Qui, per la prima volta fra i tredici, **lo studio pubblica davvero**.

Organizzazione GitHub **`buildinamsterdam`**, 6 repo:

| Repo | ★ | Licenza | Ultimo aggiornamento |
|---|---|---|---|
| `contentful-rest` | 1 | **MIT** | 18/02/2026 |
| `use-keydown` | 1 | **MIT** | 06/05/2024 |
| `lint` | 0 | **MIT** | 04/03/2026 |
| `use-match-media` | 0 | **MIT** | 18/07/2023 |
| `contentful-graphql` | 0 | **MIT** | 16/08/2023 |
| `storyblok-scripts` | 0 | **nessuna** | 25/06/2026 |

E su npm, **11 pacchetti `@buildinams/*`**: `core`, `react`, `react-storyblok`, `lint`,
`contentful-rest`, `contentful-graphql`, `use-keydown`, `use-keyup`, `use-match-media`,
`use-window-size`, `use-is-mounted`.

**Attenzione alla licenza sui pacchetti npm**: `@buildinams/react` 0.5.0 dichiara
`"license": null` nel `package.json`, e non ha ne' repository ne' homepage dichiarati. Sei
di quegli undici hanno il gemello su GitHub con licenza MIT; gli altri (`core`, `react`,
`react-storyblok`, `use-window-size`, `use-is-mounted`) sono **su npm senza licenza**:
installabili, non riusabili in senso legale.

### Licenza

Il sito, in entrambe le versioni: **nessuna licenza, nessun repo**. Si studia dal bundle
archiviato, non si copia. La libreria dello studio: **MIT su GitHub** (usabile davvero,
basta tenere l'avviso di copyright), **niente licenza su meta' dei pacchetti npm**.

### Cosa si impara

**a) La tecnica, che vale su qualunque sito vecchio: se il bundle e' Browserify o webpack
1-2, l'albero dei sorgenti e' gia' li'.** Basta un'espressione regolare per
`"(\./|\.\./)percorso":numero` e si ottiene la struttura di cartelle del progetto senza
sourcemap. Su un sito morto da otto anni ha restituito dodici viste, tre comportamenti,
il router e il nome degli effetti. Le build moderne (esbuild, Rollup, Turbopack) non lo
fanno piu': i moduli diventano funzioni numerate senza percorso. E' un regalo che vale
solo sui progetti fino al ~2019 — e i siti premiati di quegli anni sono tanti.

**b) La libreria di studio come prodotto.** Build in Amsterdam ha estratto dai propri
progetti sei hook e due client CMS, li ha messi su npm sotto uno scope, e li reinstalla su
ogni cliente: `use-match-media`, `use-window-size`, `use-keydown`, `use-keyup`,
`use-is-mounted`, piu' `contentful-rest`/`contentful-graphql`/`react-storyblok` e un
`lint` condiviso. E' il minimo indispensabile — non un design system, otto file — ed e'
esattamente cio' che rende un'agenzia piu' veloce al secondo cliente. Il pezzo da copiare
non e' il codice: e' la **decisione su cosa estrarre** (le tre-quattro cose che riscrivi
ogni volta) e su cosa no.

**c) E il promemoria sulla licenza, dalla parte di chi pubblica**: se metti un pacchetto
su npm senza campo `license`, chi lo trova non puo' usarlo legalmente. Costa una riga.

---

## 13. Prometheus Fuels — prometheusfuels.com (studio: Active Theory)

Nessuna sourcemap, ma il caso piu' istruttivo sul **valore degli shader in chiaro**: qui
il livello di dettaglio leggibile e' molto piu' alto sulla GPU che sulla CPU. E lo studio
ha un'organizzazione GitHub vera, con MIT.

### Sourcemap

**Assente.** Scaricato dall'archivio il bundle vero della versione premiata:

| URL | HTTP | Byte (decompressi) |
|---|---|---|
| `.../assets/js/app.js?1618519756467` (snapshot `20210415204916`) | 200 | **1 129 989** (145 righe) |
| `.../assets/shaders/compiled.vs` | 200 | **157 913** (5 675 righe) |
| `.../assets/data/uil.json` | 200 | **736 947** |

Zero `//# sourceMappingURL=` in tutti e tre. L'indice CDX interrogato su tutto il dominio
con filtro `original:.*\.map.*` restituisce **zero righe**.

In compenso, in cima al bundle di produzione c'e' la firma dello studio in ASCII art e
**la data e l'ora di build**, in chiaro:

```
// --------------------------------------
//    _  _ _/ .  _  _/ /_ _  _  _
//   /_|/_ / /|//_  / / //_ /_// /_/
//   https://activetheory.net    _/
// --------------------------------------
//   4/15/21 11:43a
// --------------------------------------
```

### Il bundle e' minificato, il motore no

Il JavaScript e' compresso in 145 righe, ma **i nomi delle classi del motore
sopravvivono**: `Base3D`, `CameraBase3D`, `PerspectiveCamera`, `OrthographicCamera`,
`CubeCamera`, `RenderTarget`, `MultiRenderTarget`, `CubeRenderTarget`, `DataTexture`,
`Geometry` con la sua famiglia (`BoxGeometry`, `SphereGeometry`, `CylinderGeometry`,
`ConeGeometry`, `PolyhedronGeometry`, `IcosahedronGeometry`, `TorusKnotGeometry`,
`RingGeometry`, `CircleGeometry`, `PlaneGeometry`), `Mesh`, `Points`, `Line`, `Group`,
`Scene`, `BaseLight`, piu' `TemplateHTML` / `TemplateCSS` che estendono `TemplateRoot`.

Sono i nomi del **motore proprio di Active Theory** — non three.js, che non ha
`CameraBase3D` ne' `MultiRenderTarget`. Il codice dell'applicazione, invece, e' mangled:
si vede l'ossatura, non la logica del sito.

### Gli shader: 142 file, 5 675 righe, 115 commenti

`assets/shaders/compiled.vs` e' **tutti gli shader del sito in un file solo**, con un
delimitatore proprio `{@}nome-del-file{@}`:

```glsl
{@}contrast.glsl{@}vec3 adjustContrast(vec3 color, float c, float m) {
	float t = 0.5 - c * 0.5;
	color.rgb = color.rgb * c + t;
	return color * m;
}{@}aastep.glsl{@}float aastep(float threshold, float value, float padding) {
    return smoothstep(threshold - padding, threshold + padding, value);
}{@}AntimatterCopy.fs{@}uniform sampler2D tDiffuse;
…
```

**142 nomi distinti, 182 `void main`.** I nomi sono l'indice del progetto, e si dividono
in quattro famiglie:

- **La scena del racconto**: `PBRCarShader.glsl` (l'automobile), `StylizedRoadShader`,
  `StylizedBuildingShader`, `StylizedFieldShader`, `StylizedCloudShader`,
  `StylizedDustShader`, `StylizedSmokeShader`, `SpeedlineShader`, `TilingSkyShader`,
  `SkyGradientShader`, `CloudCover`, `CloudDistanceShader`, `WaterShader`, `BonfireShader`
- **L'impianto**: `AnimatedFuelForgeShader.glsl` (il Titan Fuel Forge),
  `SpinningFanShader`, `ElectricityShader`, `MoleculeShader`, `GlassShader` +
  `ModifiedGlassShader`, `TechnologyBGShader`, `TechnologyGraphicShader`
- **`Antimatter*` — il sistema GPGPU di particelle**: `AntimatterSpawn.fs`,
  `AntimatterPosition.vs`, `AntimatterCopy.fs/.vs`, `AntimatterPass.vs`,
  `AntimatterBasicFrag.fs`, `antimatter.glsl`, piu' `ProtonAntimatter.fs`,
  `ProtonAntimatterLifecycle.fs`, `ProtonNeutrino.fs`. Le posizioni delle particelle sono
  scritte in texture e rilette: `vec4 decodedPos = texture2D(tPos, position.xy);`
- **`GLUI*` — l'interfaccia disegnata dentro il WebGL**: `GLUIObject.glsl`,
  `GLUIColor.glsl`, `GLUIBatch.glsl`, `GLUIBatchText.glsl`, `gluimask.fs`. Il menu, il
  testo e gli indicatori (`MenuBG`, `MenuItemShader`, `MenuCarouselItemShader`,
  `MenuCarouselItemTextShader`, `MenuCarouselIndicatorShader`, `MenuStackBackground`,
  `ScrollProgressShader`, `ScrollHintItemShader`) **non sono DOM: sono geometria**.

Piu' una **simulazione di fluido completa**, riga per riga: `advectionShader.fs`,
`divergenceShader.fs`, `pressureShader.fs`, `vorticityShader.fs`, `curlShader.fs`,
`splatShader.fs`, `gradientSubtractShader.fs`, `clearShader.fs`, `displayShader.fs`,
`mousefluid.fs`, `fluidBase.vs`. E la libreria di utilita' che ci si porta dietro da un
progetto all'altro: `blendmodes.glsl` (colorDodge, colorBurn, vividLight, hardMix…),
`eases.glsl`, `simplenoise.glsl`, `curl.glsl`, `fresnel.glsl`, `rgb2hsv.fs`, `msdf.glsl`,
`conditionals.glsl`, `roundedBorder.glsl`, `transformUV.glsl`, `uvgrid.glsl`,
`range.glsl`, `rotation.glsl`, `desaturate.fs`, `luma.fs`, `rgbshift.fs`, `aastep.glsl`,
`contrast.glsl`, `waveDissolve.glsl`, `featheredSlider.glsl`, `glscreenprojection.glsl`,
`shadows.fs`, `lights.fs/.vs`, `pbr.fs/.vs`, `phong.fs`, `refl.fs/.vs`, `matcap.vs`,
`instance.vs`, `FXAA.glsl` e l'`UnrealBloom` in quattro pezzi (`Luminosity`, `Gaussian`,
`Composite`, `Pass`).

**115 righe di commento sono sopravvissute**, perche' nessun minificatore JavaScript tocca
il contenuto di una stringa. Fra queste ci sono un `// TODO: fallback for fwidth for
webgl1 (need to enable ext)`, spiegazioni di metodo (*"Sample 2 levels and mix between to
get smoother degradation"*, *"A value to be able to push the strength and mimic HDR"*,
*"Sample the specular env map atlas depending on the roughness"*) e **una decina di righe
di varianti scartate lasciate commentate**:

```glsl
// float grad1 = smoothstep(uGradient1.x, uGradient1.y, vGradient);
// grad1 += noise;
// grad1 = step(uGradient1.z, grad1);
// color = mix(uColor3, color, grad1);
// mask = mix(1.0, mask, 0.4);
```

Sono i tentativi intermedi di chi ha tarato l'effetto, rimasti nel file di produzione.

### Repository GitHub: lo studio pubblica, il sito no

Organizzazione **`activetheory`** su GitHub (creata l'11/10/2011), **11 repo pubblici**:

| Repo | ★ | Licenza | Cosa e' |
|---|---|---|---|
| `activeframe` | 398 | **MIT** | formato video proprio `.af` per **WebCodecs**: riproduzione accurata al fotogramma. Ultimo push 30/04/2026 |
| `Paper-Planes-Android-Experiment` | 277 | **nessuna** | l'esperimento Google del 2016 |
| `split-text` | 69 | **MIT** | divide il testo in righe/parole/caratteri (l'alternativa libera a SplitText di GSAP) |
| `Finding-Love-Shaders` | 52 | **nessuna** | GLSL di un progetto vero, pubblicati grezzi |
| `fit-text` | 36 | **MIT** | adatta il testo al contenitore |
| `svg2msdf` | 28 | **nessuna** | genera atlanti MSDF partendo da SVG |
| `ios-silent-bypass` | 26 | **MIT** | fa suonare l'audio su iPhone anche con l'interruttore su silenzioso |
| `balance-text` | 19 | **MIT** | distribuisce il testo sulle righe in modo uniforme |
| `GaussianSplats3D`, `modern-screenshot`, `at-html2canvas` | 6 o meno | MIT | fork |

**Nessuno di questi e' il sito Prometheus**, e il motore (Hydra) non e' pubblico. Ma sono
gli attrezzi veri con cui lo studio lavora, non demo.

### Il sito di oggi, e una porta lasciata aperta

`prometheusfuels.com` fa 301 su `prometheusfuels.ai`, un **WordPress con tema
`hello-elementor`** (150 727 byte di HTML). `/.git/config` -> 404. Ma:

| URL | HTTP | Risposta |
|---|---|---|
| `https://prometheusfuels.ai/wp-json/wp/v2/users` | **200** | 8 648 byte, **un solo utente** |

```json
[{"id":1,"name":"admin","slug":"admin",
  "url":"http:\/\/prometheusfuels.dreamhosters.com", … }]
```

Enumerazione utenti aperta (il difetto standard di WordPress non irrigidito): si ricava
che l'account amministratore si chiama letteralmente `admin`, e nel campo `url` c'e'
**l'host di staging**, `prometheusfuels.dreamhosters.com` — che risponde **200 e serve lo
stesso identico sito** (150 727 byte, gli stessi del dominio pubblico). Il sito di
sviluppo e' online, indicizzabile e uguale a quello di produzione.

### Licenza

Il sito: **nessuna licenza, nessun repo, nessuna sourcemap**. Shader e bundle si leggono
dall'archivio — si studia, non si copia. I pacchetti dello studio: **MIT** (usabili
davvero) tranne `Paper-Planes-Android-Experiment`, `Finding-Love-Shaders` e `svg2msdf`,
che sono **pubblici senza licenza**: leggibili, non riusabili.

### Cosa si impara

**a) Un solo file per tutti gli shader, con un delimitatore banale.** `{@}nome{@}` e
`compiled.vs`: in sviluppo ogni shader resta un file separato (`.glsl`, `.vs`, `.fs`), un
passo di build li concatena, e in produzione si scarica **un GET solo per 142 shader**.
Nessuna richiesta per pezzo, nessun bundler che li tratti da asset, e il parsing e' uno
`split`. Costa venti righe di script e sostituisce qualunque plugin.

**b) La libreria GLSL di studio conta piu' degli effetti.** Meta' dei 142 file non c'entra
niente con Prometheus: `blendmodes`, `eases`, `simplenoise`, `curl`, `fresnel`, `msdf`,
`FXAA`, `UnrealBloom`, la simulazione di fluido. Sono la cassetta degli attrezzi che
Active Theory si porta da un cliente all'altro, ed e' la ragione per cui possono
consegnare un mondo 3D in poche settimane. **Il primo investimento di uno studio non e' un
sito bello: e' la libreria che rende veloce il secondo sito.**

**c) I commenti negli shader non li rimuove nessuno.** Sono dentro stringhe JavaScript, e
i minificatori le lasciano stare. Su un sito WebGL di fascia alta questo significa che la
parte piu' difficile — la taratura degli effetti, con i valori scartati commentati accanto
a quelli buoni — e' **l'unica parte pubblicamente leggibile**. Chi vuole imparare da un
sito Active Theory, Abeto o OFF+BRAND deve cercare li', non nel JavaScript.

**d) E, dall'altra parte del banco:** se apri un WordPress, chiudi `/wp-json/wp/v2/users`
e non mettere il dominio di staging nel profilo dell'amministratore.

---

## Conclusione sul gruppo

Cinque siti, cinque esiti diversi, e i due estremi stanno qui dentro. **Mana Yerba Mate e'
l'unico dei tredici da cui si ricostruisce il sorgente originale**: il commento
`sourceMappingURL` era stato tolto dal bundle, ma il file `global.js.map` era rimasto
nella cartella `assets/` del tema Shopify e risponde 200 — 4,2 MB di mappa, 2,6 MB di
codice con `sourcesContent` pieno, i dodici moduli scritti a mano con i commenti in
francese dentro. **Star Atlas e' l'opposto simmetrico**: il sito premiato e' chiuso, ma
quello di oggi *e'* un repository pubblico, `staratlasmeta/sa-landing-page`, con
`index.html` e `src/main.js` byte per byte identici a quelli serviti dal dominio,
non minificati, workflow di deploy e documentazione compresi.

Gli altri tre confermano la regola: Opal, Frans Hals e Prometheus non hanno una sola
sourcemap, ne' allora ne' oggi. Ma nessuno dei tre e' un buco nell'acqua, perche' **il
codice esce lo stesso da una porta laterale diversa per ciascuno**: gli shader GLSL con i
commenti e le varianti scartate (142 file in un `compiled.vs` per Prometheus), la mappa
delle dipendenze relative di Browserify che ricostruisce l'albero dei sorgenti senza
sourcemap (Frans Hals), e i repo pubblicati per obbligo di licenza GPL o come libreria di
studio su npm (Opal, Build in Amsterdam, Active Theory).

**Licenza: nessuno dei cinque siti ne ha una.** Il codice di Star Atlas e' pubblico ma non
concesso, quello di Mana e' esposto per incidente. Tutto quanto sopra si studia, si
smonta, si impara — **non si copia**. Le uniche cose davvero riusabili sono le librerie
di contorno: MIT su `activetheory/*` e `buildinamsterdam/*`, Apache-2.0 sui repo Solana di
`staratlasmeta`, GPL-2.0 (contagiosa) sul firmware `Opal-Camera/tadpole-gpl2`.
