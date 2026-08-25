# Cosa gira DAVVERO sotto i siti da premio

Framework e CMS di **37 siti** gia' schedati in questa cartella, dedotti uno per
uno con `curl` il **13/08/2026**: intestazioni HTTP, HTML della home, e — dove
serviva — il **bundle JavaScript scaricato e ispezionato**.

Niente e' preso da BuiltWith o da Wappalyzer. Ogni riga ha accanto **il metodo**
con cui e' stata ricavata, cosi' e' rifacibile.

**Come leggere le marcature:**
- **V** = verificato (l'ho visto in una intestazione, nell'HTML o dentro il bundle)
- **D** = dedotto (indizio forte ma indiretto)
- **opaco** = da fuori non si legge, e lo scrivo invece di inventarlo

---

## 1. La tabella

| sito | framework | versione | CMS | come l'ho capito |
|---|---|---|---|---|
| **basement.studio** | **Next.js** App Router **V** | Next 15+ (`x-nextjs-stale-time`), React 19 (`data-precedence`) **D** | **Sanity V** | `X-Nextjs-Prerender: 1`, `X-Nextjs-Stale-Time: 300`, `Server: Vercel`; 635 occorrenze di `/_next/`, 36 di `self.__next_f` (payload RSC); nell'HTML `9syto90m.api.sanity.io` + 140 URL `cdn.sanity.io` |
| **darkroom.engineering** | **Next.js** App Router **V** | Next 15+ (`x-nextjs-stale-time: 180`) **D** | **Sanity V** | stesse intestazioni Vercel + `X-Nextjs-Prerender: 1`; 270 `/_next/`, 28 `self.__next_f`, `cdn.sanity.io`. **Attenzione**: le due occorrenze di "Contentful" nell'HTML sono la lista tecnologie **di un caso studio cliente**, non il loro stack |
| **verostudio.com** | **Next.js** App Router **V** | — | **Sanity V** | `X-Powered-By: Next.js`, `Server: Vercel`; 437 `/_next/`, 26 `self.__next_f`; `xei5vqg0.api.sanity.io` + 378 URL `cdn.sanity.io` |
| **franshalsmuseum.nl** | **Next.js** App Router **V** | Next 15+ (`x-nextjs-stale-time: 300`) **D** | **Sanity V** (+ Micrio per le immagini IIIF) | 2 redirect 307 poi `X-Nextjs-Prerender: 1` + `X-Powered-By: Next.js` su Vercel; 235 `self.__next_f`; media su `museumplatform.b-cdn.net` (BunnyCDN) e `iiif.micr.io`. Il nome del CDN dice che e' **una piattaforma condivisa fra musei**, non un sito su misura |
| **by-kin.com** | **Next.js** App Router **V** | — | **Strapi V** — e **e' spento** | `X-Powered-By: Next.js` + `x-nextjs-cache: STALE` su **nginx/1.24.0 auto-ospitato** (non Vercel); 372 `/_next/`; immagini `cms.by-kin.com/uploads/...` passate per `/_next/image`. `cms.by-kin.com` risponde **502 Bad Gateway** — vedi sezione 6 |
| **trionn.com** | **Next.js** + **Turbopack** **V** | Next 15/16 (chunk `turbopack-*` in produzione) **D** | opaco | `x-nextjs-prerender: 1`, `x-nextjs-stale-time: 300`, `X-Powered-By: Next.js` — ma **`Server: Apache/2.4.52 (Ubuntu)`**: Next dietro un Apache proprio. 311 `/_next/`; nomi dei chunk offuscati (`0y3~cortx~or~.js`) tranne `turbopack-0nz662b_cli3l.js` |
| **opalcamera.com** | **Next.js** + **Turbopack** **V** | Next 15/16 **D** | opaco (video su **Mux**) | `X-Nextjs-Prerender: 1` su Vercel, chunk con `?dpl=dpl_Ffg2MJNTDHeuVDoU46KyjnqvwYBF` (deployment id Vercel), `turbopack-0.~~w~j2.65_i.js`; unico host esterno `stream.mux.com` |
| **kprverse.com** | **Nuxt 3** **V** | 3.0/3.1 (payload `window.__NUXT__=(function(a,b,...))`, cioe' `renderJsonPayloads` ancora falso) **D** | **Storyblok V** | `X-Powered-By: Nuxt`, 165 `/_nuxt/` con nomi `entry.9cfb39b7.js`; 148 URL `a.storyblok.com` |
| **mosbyfiles.com** | **Nuxt 3** **V** | — | **Storyblok V** | `X-Powered-By: Nuxt` su `Server: Vercel`; nell'HTML `window.__NUXT__.config={public:{storyblokVersion:"published", storyblok:{accessToken:"WdeDlX0eomdlf8mnDLcSYQtt" ...` — **il token e' in chiaro nella pagina**; 124 URL `a.storyblok.com`; `siteURL:"https://mosby-files.vercel.app/"` |
| **noomoagency.com** | **Nuxt 3** **V** | — | **Prismic V** | `Server: Vercel`, 35 `/_nuxt/`; `window.__NUXT__.config` contiene `prismic:{endpoint:"noomo-website"}`; immagini da `noomo-website.cdn.prismic.io` |
| **dontboardme.com** | **Nuxt 3** **V** | ~3.0-3.4 (`/_nuxt/entry.66570678.js`) **D** | **API propria** (`api.dontboardme.com`) **V** | `x-powered-by: Nuxt` su `nginx/1.24.0`; `window.__NUXT__.config={public:{apiUrl:"https://api.dontboardme.com"} ...}`. La scheda del sito riporta l'intestazione `X-Powered-By: Strapi` su quell'API |
| **immersive-g.com** | **Nuxt 3** **V** | — | **CMS GraphQL proprio** su DigitalOcean **V** | `Server: Vercel`; `buildAssetsDir:"/assets/"` (per questo `/_nuxt/` non compare); `API_CMS_URL:"https://ig-cms-prod-xu4tl.ondigitalocean.app/graphql"` e **`API_CMS_KEY` di 256 caratteri stampata in chiaro nell'HTML**; 39 media da `ig-medias-prod.ams3.digitaloceanspaces.com` |
| **lusion.co** | **Astro** **V** | Astro 2/3 (`hoisted.<hash>.js`) **D**; three.js **r158 V** | nessuno **D** | `Server: Netlify`; `/_astro/about.CNa9RfUh.css` e `<script type="module" src="/_astro/hoisted.CUO_IjfL.js">`. Nel bundle (1,25 MB): `REVISION="158`, 147 riferimenti `THREE.`, `WebGLRenderer` — **zero React, zero Vue** |
| **igloo.inc** | **Svelte** + **Vite** **V** | — | nessuno **D** | HTML di 1,4 KB con `<body>` **vuoto** e un solo `<script type="module" crossorigin src="/assets/index-2eb69c09.js">` (naming Vite/Rollup). Dentro l'entry: `i.indexOf("__svelte")` — marcatore interno del runtime Svelte. `x-vercel-cache: HIT` dietro Cloudflare |
| **messenger.abeto.co** (Bruno Simon) | **Vite** vanilla **V** | — | nessuno **V** | `<body>` vuoto, `assets/webgl-CS4l6lxD.js` + `modulepreload` di `App3D-DwM1eiaC.js` (hash base64 = Vite 5). Cloudflare. Nessuna chiamata a nessun CMS |
| **bruno-simon.com** | **Vite** vanilla **V** | three.js **r183 V**, GSAP **3.12.5 V** | nessuno **V** | `./assets/index-ORr3L4no.js` (4,86 MB!) su `nginx/1.24.0`. Nel bundle: `REVISION = "183`, `"3.12.5"`, 60 occorrenze `howler`, `ogl`, `barba` |
| **2xa.studio** | **vanilla + Vite** **V** | GSAP **3.13.0 V**, Swup **4.8.2 V** | **Kirby CMS V** | `x-powered-by: PHP/8.3.33` + `PleskLin`; asset `/public/dist/assets/main-CzlVfecv.js`. **La prova del CMS**: `/panel/login` risponde **200** e le immagini stanno su `/media/site/3677d4a2a6-1780488903/...` — il pattern `media/<tipo>/<hash>-<timestamp>/` e' esattamente Kirby |
| **cuberto.com** | **vanilla**, un solo bundle a mano **V** | GSAP **3.15.0 V** + Lenis **V** | opaco (HTML gia' composto dal server) | `<script src="/assets/js/bundle.js?v=5.6.0b5" async>` — un unico file da 283 KB, numero di versione scritto a mano. Nessun `/_next/`, nessun `_nuxt`, nessun `_astro`. Dentro: `version="3.15.0` e 41 occorrenze di `lenis`. Dietro Cloudflare, backend non identificabile. **Le parole "Strapi" e "Webflow" nell'HTML sono il testo della loro FAQ, non il loro stack** |
| **obys.agency** | **vanilla puro** **V** | nessuna libreria trovata **V** | opaco | Nessun `<script src>` nell'HTML. C'e' un `<script id="__SEED__" type="application/octet-stream">` base64 **XOR-ato** con `data-v`. Decodificato da' `{"cfg":{"v":"?msh4f1r6"},"rt":{"cur":{"url":"/","pg":"ho"}}}`; il loader sceglie `/js/d.js` o `/js/m.js` dallo user-agent. Nel bundle (120 KB): **zero** React/Vue/GSAP/three.js — solo `createShader` e **45 occorrenze di `lerp` scritte a mano** |
| **zajno.com** | **vanilla puro** **V** | nessuna libreria trovata **V** | **Prismic V** | `X-Powered-By: PHP/8.2.6` dietro CloudFront. Loader inline identico per struttura a Obys: `_A={"config":{"v":"?1"},"route":{"new":{"page":"ho"}}}` e `/static/js/d.js` o `m.js`. Bundle 97 KB, **zero librerie**, **95 `lerp`**. Immagini da `images.prismic.io` |
| **aristidebenoist.com** | **vanilla puro** **V** | nessuna libreria trovata **V** | nessuno **D** | `X-Powered-By: PHP/8.2.1` su S3+CloudFront. Loader `window._A={...}` + `/static/js/d.js` (69,5 KB, `Last-Modified: 05/01/2023`) o `m.js`. Bundle: **zero** librerie, `createShader`, 22 `lerp` |
| **activetheory.net** | **motore proprio** (Hydra) **V** | — | **CMS proprio**, sostituito a build **V** | HTML di 6 KB, `<body>` con solo un `<noscript>`. Loader inline: `window._CMS_="%CMS%"` — **un segnaposto non sostituito**, cioe' il CMS viene iniettato in fase di deploy; `window._CACHE_="1780406240914"` e `assets/js/app.1780406240914.js`. Bundle 1,82 MB: `createProgram`/`useProgram` (WebGL grezzo), **niente three.js**. Media su `storage.googleapis.com/activetheory-v6.appspot.com`; cache Fastly (`X-Served-By: cache-bgy-...`) |
| **locomotive.ca** | **Vue 3** in un bundle a mano **V** | three.js **r165 V**, GSAP **3.14.2 V**, Lenis **V** | opaco | `assets/scripts/vendors.js` + `app.js?v=1784828585344` (cache-busting a timestamp, non a hash). Nel bundle da 2,55 MB: `__v_isRef`, `__vue_app__`, `__VUE_DEVTOOLS_HOOK_REPLAY__` (= Vue 3), `three@0.165.0`, `version="3.14.2`, `lenis`, `barba`. HTML gia' composto dal server dietro Cloudflare: **il CMS da fuori non si legge**; `/actions/...` restituisce `{"message":"Not Found"}` in JSON, quindi **non e' Craft** come si potrebbe supporre |
| **dark.netflix.io** | **Vue 2** + webpack **V** | Vue **2.6.11 V**, GSAP 3.1.6/3.2.6 **V** | nessuno visibile (dati in JSON precalcolati) | `<base href="https://dark.netflix.io/version/1653376168543/">`, `js/vendors.js` + `js/app.js`, `<div id="app">` e il commento `<!-- built files will be auto injected -->` (template vue-cli/webpack). Nel `vendors.js`: `version="2.6.11`. `nginx/1.18.0` dietro CloudFront |
| **persepolis.getty.edu** | **Vue 2** + webpack **V** — *stesso boilerplate di dark.netflix.io* | Vue **2.6.11 V**, GSAP 3.4.3 **V** | nessuno visibile | `version/1659513005297/js/vendors.js` + `app.js`, `<div id="app">`, lo **stesso commento** `// enable to override webpacks publicPath` byte per byte presente anche su dark.netflix.io. `Server: CloudFront`. Analytics: Plausible + GTM |
| **kodeclubs.com** | opaco (SPA con `id="app"`) | — | opaco | `server: Google Frontend` (App Engine). CSS e JS su `storage.googleapis.com/mm-kode.appspot.com/assets/20250516_134806/css/Home.bundle.css`. Il prefisso **`mm-`** e il bucket `.appspot.com` sono la firma dell'infrastruttura **Media.Monks** — la stessa famiglia di dark.netflix.io |
| **resn.co.nz** | **RequireJS (AMD)**, nessun bundler **V** | Modernizr 2.5.3, es6-shim **V** | opaco | `<script data-main="./20260721233115_1_0_a02666f/js/loader" src="./.../libs/require.js">` iniettato a runtime; cartella con timestamp+commit `20260721233115_1_0_a02666f`; commento finale `version: 1.0.a02666f`. Su `AmazonS3` + CloudFront. Sopravvivono i condizionali `<!--[if lte IE 9]>` |
| **staratlas.com** | **vanilla** **V** | — | nessuno **D** | `<link href="styles.css">` e `<script src="src/main.js">` — percorsi relativi crudi, nessun hash, nessun bundler. `server: UploadServer` + `via: 1.1 google` (Google Cloud Storage statico). **Non e' il sito premiato**: quello e' morto, questo e' un guscio |
| **hellomonday.com** | build webpack/Laravel-Mix, **nessun framework SPA** **V** | — | **Contentful V** | `<link href="/build/css/bundle-2bdea8b598.css">` + `/build/js/main-e03077acdb.js` (1,74 MB). `via: 2.0 heroku-router` dietro Cloudflare: **backend applicativo su Heroku**, non un hosting statico. 68 URL `images.ctfassets.net/9uhkiji6mhey/` = space Contentful. Analytics Plausible |
| **landonorris.com** | **Webflow V** | — | **Webflow CMS V** | `cdn.prod.website-files.com/67b5a02dc5d338960b17a7e9/css/lando-offbrand.shared.4f53262f0.css` e la regola CSS `.w-webflow-badge { display: none !important; }` (nascondono il badge, il che richiede un piano a pagamento). Cloudflare davanti |
| **revelatio.studio** | **Webflow V** + script propri su Vercel | GSAP **3.15.0 V** | **Webflow CMS V** | `<meta name="generator" content="Webflow">`; 112 asset da `cdn.prod.website-files.com`, foglio `revelatio-studio.webflow.shared.8b102201f.css`. **Il dettaglio che vale**: GSAP + ScrollTrigger + SplitText + ScrambleText + Observer arrivano da `cdn.prod.website-files.com/gsap/3.15.0/` — cioe' **serviti da Webflow stesso**; gli script su misura (`drag-marquee.js`) stanno su un dominio a parte, `revelatio.vercel.app` |
| **dogstudio.co** | **WordPress** (Roots **Bedrock**) **V** | WordPress **4.8.2** (2017) **V** | **WordPress V** | `https://dogstudio.co/cms/wp-includes/js/wp-embed.min.js?ver=4.8.2`, `wp-json/oembed/1.0/`, tema in `/app/themes/portfolio-2018/static/` (struttura Bedrock). Front-end a mano: `modernizr.js`, `detectizr.js`, `main.css?v=07022024` |
| **prometheusfuels.ai** | **WordPress** **V** | WordPress **7.0.4** + Elementor **3.35.8 V** | **WordPress V** | `<meta name="generator" content="WordPress 7.0.4">` e `<meta name="generator" content="Elementor 3.35.8; ...">`; 98 `wp-content`, `Server: Apache`. **Non e' il sito premiato**: e' il WordPress che ha preso il posto dell'esperienza Active Theory |
| **manayerbamate.com** | **Shopify** (tema Liquid) **V** | — | **Shopify V** | `cdn.shopify.com`, `Shopify.theme` nell'inline JS, `monorail-edge.shopifysvc.com` (telemetria Shopify), `extensions.shopifycdn.com`. Cloudflare davanti |
| **pangrampangram.com** | **Shopify** **V** | — | **Shopify V** | stessi tre marcatori (`cdn.shopify.com`, `Shopify.theme`, `monorail-edge`) |
| **simplychocolate.dk** | **Shopify** **V** | — | **Shopify V** | 36 URL `cdn.shopify.com`, `Shopify.theme`. **Non e' il sito premiato del 2017**: quello e' stato sostituito |
| **apple.com/iphone-air** | proprietario Apple | — | proprietario | `Server: Apple` e basta. Nessun marcatore pubblico: **opaco per scelta**. L'unica occorrenza di "prepr" nell'HTML e' la parola "preproduction" |

---

## 2. Il conteggio: quanti vanilla, quanti React, quanti altro

### 2.1 I numeri

Su **37 siti** (conto per *framework dell'interfaccia*, non per bundler):

| famiglia | quanti | % | quali |
|---|---|---|---|
| **Nessun framework** (vanilla JS, con o senza bundler) | **13** | 35% | obys, zajno, aristide-benoist, 2xa, cuberto, active-theory, resn, star-atlas, hello-monday, messenger/abeto, bruno-simon, apple, kode (opaco ma senza marcatori) |
| **React** (tutti via Next.js) | **7** | 19% | basement, darkroom, vero, frans-hals, by-kin, trionn, opal |
| **Vue** | **8** | 22% | **5 su Nuxt 3**: kpr, mosby, noomo, dont-board-me, immersive-garden · **3 in Vue "nudo"** con bundle a mano: locomotive (Vue 3), dark.netflix (Vue 2.6.11), persepolis (Vue 2.6.11) |
| **Svelte** | **1** | 3% | igloo |
| **Astro** | **1** | 3% | lusion |
| **Costruttori / piattaforme chiuse** (Webflow, Shopify, WordPress) | **7** | 19% | lando-norris, revelatio (Webflow) · mana, pangram, simply-chocolate (Shopify) · dogstudio, prometheus (WordPress) |

Riordinato per quello che conta davvero:

- **Vanilla: 13 su 37 = 35%.**
- **Vue (8) batte React (7).** In un settore dove tutto il discorso pubblico e'
  React, il web premiato dice il contrario. E i cinque Nuxt 3 sono tutti recenti.
- **Astro e Svelte: uno a testa.** Sono le scelte di cui si parla di piu' e che
  si trovano di meno.
- **Nessun SvelteKit, nessun Remix, nessun Qwik, nessun SolidStart.** Zero.
- **Nessun WordPress headless.** WordPress compare due volte e in entrambi i casi
  e' un WordPress **normale**, con il tema che genera l'HTML.

### 2.2 L'ipotesi da testare: piu' 3D = meno framework?

L'ipotesi era: **gli studi piu' premiati sul 3D usano MENO framework degli
altri.** Verificata separando i siti in due gruppi.

**Gruppo A — il 3D e' l'esperienza** (canvas WebGL a tutto schermo, motore
proprio o quasi):

| sito | framework | JS del sito |
|---|---|---|
| obys.agency | **nessuno** | 120 KB |
| zajno.com | **nessuno** | 97 KB |
| aristidebenoist.com | **nessuno** | 70 KB |
| activetheory.net | **motore proprio**, WebGL grezzo | 1,82 MB |
| lusion.co | **Astro** (isole, zero React) | 1,25 MB |
| igloo.inc | **Svelte** | entry 16 KB + chunk |
| messenger.abeto.co | **nessuno** (Vite) | — |
| bruno-simon.com | **nessuno** (Vite) | 4,86 MB |
| resn.co.nz | **nessuno** (RequireJS) | — |
| immersive-g.com | Nuxt 3 | — |
| dogstudio.co | **nessuno** (il front-end e' JS a mano; WordPress fa solo da contenuto) | — |
| 2xa.studio | **nessuno** (Vite + Swup) | 753 KB |

→ **10 su 12 senza framework dell'interfaccia.** Gli unici due che ne hanno uno
sono **Svelte** (che si compila via e non spedisce un runtime a componenti) e
**Astro** (che di default **non spedisce JavaScript**). Nuxt su Immersive Garden
e' l'unica vera eccezione del gruppo.

**Gruppo B — sito di contenuto, animato ma non guidato dal 3D:**

| sito | framework |
|---|---|
| basement, darkroom, vero, frans-hals, by-kin, trionn, opal | **React/Next.js** |
| kpr, mosby, noomo, dont-board-me | **Nuxt** |
| locomotive, dark.netflix, persepolis | **Vue** |
| lando-norris, revelatio | Webflow |
| mana, pangram, simply-chocolate | Shopify |
| cuberto, hello-monday | vanilla |

→ **2 su 21 senza framework.**

*(Restano fuori dai due gruppi quattro casi che non sono confrontabili:
`apple.com` — opaco per scelta; `star-atlas` e `prometheus` — gusci che hanno
preso il posto dei siti premiati; `kodeclubs` — opaco.)*

### 2.3 Il verdetto

**L'ipotesi regge, e regge forte: 83% contro 10%.**

E la spiegazione tecnica sta nel codice, non nelle opinioni: in un sito guidato
dal WebGL **il DOM non e' la fonte di verita'**. Lo stato vive dentro il loop di
rendering, in un `requestAnimationFrame` che gira 60 volte al secondo. Un
framework a componenti serve a **sincronizzare il DOM con lo stato** — un lavoro
che li' semplicemente non c'e'. Diventa peso morto: un runtime da spedire, un
ciclo di vita da combattere, un ostacolo tra te e il `<canvas>`.

La prova piu' netta e' l'assenza di `lerp`: in Obys, Zajno e Aristide Benoist
**non c'e' nemmeno GSAP**. Ci sono 45, 95 e 22 occorrenze di interpolazione
scritte a mano. Chi lavora sul canvas si scrive anche l'animazione.

> **La riga da tenere:** *piu' l'esperienza sta nel canvas, meno serve il
> framework.* Se il progetto e' un sito di contenuto con animazioni, Next o Nuxt
> ti fanno risparmiare settimane. Se il progetto **e'** il canvas, il framework
> e' un costo che paghi due volte: in byte e in attrito.

### 2.4 Il boilerplate condiviso che nessuno ha notato

Tre siti premiati — **obys.agency**, **zajno.com** e **aristidebenoist.com** —
girano sullo **stesso identico impianto**, e non e' un caso:

- lo stato iniziale in un oggetto globale nel `<head>` (`_A` su Zajno e Aristide,
  `__` su Obys) con la stessa forma: `config.v` (versione per il cache-busting) e
  una `route` con `page: "ho"` per la home;
- **due bundle distinti**, `d.js` e `m.js`, scelti da una riga di user-agent — non
  media query, **due siti diversi**;
- lo stesso `<script nomodule>` che scrive "Please update your browser";
- PHP dietro (8.2.1, 8.2.6, 8.3.x) con CloudFront o nginx davanti;
- **zero dipendenze** nel bundle.

Obys ha aggiunto uno strato: la configurazione e' base64 XOR-ata con la chiave
messa nell'attributo `data-v` accanto — offuscamento cosmetico (l'ho decodificata
in tre righe di Python), ma dice che qualcuno **non vuole che gli copino
l'impianto**.

Analogo secondo caso: **dark.netflix.io** e **persepolis.getty.edu** condividono
il boilerplate webpack di **Media.Monks** — stessa cartella `version/<timestamp>/`,
stessi `vendors.js`+`app.js`, stesso Vue 2.6.11, **e lo stesso commento morto**
`// enable to override webpacks publicPath` copiato byte per byte. E kodeclubs.com
serve gli asset da `mm-kode.appspot.com`: **stessa casa**.

> Due studi con quattro Site of the Day non ricominciano da zero ogni volta.
> **Hanno un impianto e lo riusano.** E' esattamente la cosa che chi apre adesso
> dovrebbe costruirsi per prima.

---

## 3. I CMS: chi usa cosa, e quanto costa davvero nel 2026

### 3.1 Il censimento

| CMS | quanti | chi |
|---|---|---|
| **Nessun CMS** (contenuti nel codice o in JSON) | **12** | igloo, messenger, bruno-simon, lusion, aristide-benoist, active-theory (proprio), star-atlas, resn, dark.netflix, persepolis, apple, kode |
| **Sanity** | **4** | basement, darkroom, vero, frans-hals |
| **Shopify** | **3** | mana, pangram, simply-chocolate |
| **Storyblok** | **2** | kpr, mosby |
| **Webflow** | **2** | lando-norris, revelatio |
| **WordPress** | **2** | dogstudio, prometheus |
| **Prismic** | **2** | noomo, zajno |
| **Strapi** | **2** | by-kin, dont-board-me |
| **Contentful** | **1** | hello-monday |
| **Kirby** | **1** | 2xa |
| **Proprio** (GraphQL/REST scritto in casa) | **2** | immersive-garden, dont-board-me |
| **Opaco** | **3** | cuberto, locomotive, trionn |

**Craft CMS: zero.** L'ho cercato attivamente (`/cpresources/`, `/actions/`,
la stringa `craftcms`) su tutti i siti candidati. Le occorrenze della parola
"craft" nell'HTML di Locomotive, Obys e 2xA sono **il verbo inglese nei testi di
vendita** ("we craft bespoke digital experiences"), non il CMS.

**Il dato piu' importante della sezione: il CMS piu' usato dai siti da premio e'
"nessuno" — 12 su 37, un terzo.** Su un sito che vive dentro un canvas, i
contenuti sono venti stringhe e un file JSON. Un CMS non serve, e chi lo mette
ci aggiunge un punto di rottura (vedi sezione 6).

### 3.2 I costi reali 2026 — cliente tipo: 5 utenti, 500 documenti

Listini ufficiali **riletti uno per uno il 13/08/2026** (non ripresi da
`_RICORRENTE.md`: due sono cambiati). Il cliente tipo e' un'azienda della Brianza
con un sito vetrina: **5 persone che entrano nel CMS** (marketing, commerciale,
titolare, noi, un esterno) e **500 documenti** (pagine, prodotti, articoli,
immagini con scheda).

| CMS | piano che serve per 5 utenti + 500 doc | costo/mese | costo/anno | note |
|---|---|---|---|---|
| **Sanity** | **Free** | **$0** | **$0** | 20 posti e 10.000 documenti inclusi: **avanza 4x su entrambi** |
| **Contentful** | **Free** | **$0** | **$0** | **10 utenti** e 10.000 record inclusi: ci sta — ma vedi lo scalino, §3.3 |
| **Craft CMS** | **Team** (licenza perpetua) | — | **$279 una tantum + $99/anno** | Solo e' gratis ma ha **1 solo utente**. Gratis se ospitato su Craft Cloud |
| **Kirby** | **Basic**, licenza perpetua per sito | — | **€99 una tantum**, 3 anni di aggiornamenti | prezzo valido sotto **€1 M di fatturato** del cliente; sopra: €349 |
| **Prismic** | **Small** (il Free ha **1 solo utente**) | **$25** | **$300** | Starter $10 arriva a 3 utenti: non basta |
| **Webflow** | **Premium** (il CMS parte da li') | **$25** | **~$300** | il piano gratuito non ha dominio proprio |
| **WordPress** (anche headless) | software gratis + hosting + manutenzione | €10-30 | €120-360 **+ ore** | le ore sono la voce vera |
| **Shopify** | **Basic** | €27 (€19 annuale) | **~€230** + commissioni | mercato diverso: solo se vende online |
| **Strapi auto-ospitato** | VPS + il tuo tempo | €5-20 **+ ore** | €60-240 **+ ore** | e' quello che ha fatto by-kin. Vedi §6 |
| **Strapi Cloud** | **Pro** (lo Starter regge 100k chiamate) | **$90** | **$1.080** | **nessun piano gratuito** |
| **Storyblok** | **Growth** (lo Starter ha **1 posto**, max 2) | **$99** ($90,75 annuale) | **$1.188** | il salto peggiore del gruppo |

> **Verifica prima di mettere una cifra in un preventivo.** Due numeri di
> `_RICORRENTE.md` §4.1 sono **superati** da questa lettura: il piano gratuito di
> Contentful oggi da' **10 utenti, 10.000 record e 25 tipi di contenuto** (non i
> ~2.000 record delle vecchie tabelle), e Craft ha oggi un'edizione **Solo
> gratuita**. **Riapri la pagina il giorno che firmi.**

### 3.3 Chi ha il livello gratuito piu' generoso

**Sanity — ma per una ragione diversa da quella che si pensa.**

| | **Sanity** Free | **Contentful** Free | **Craft** Solo | **Prismic** Free | **Storyblok** Starter |
|---|---|---|---|---|---|
| **posti/utenti** | **20** | **10** | **1** | **1** | **1** (max 2, +$15) |
| **documenti** | **10.000** | **10.000 record** | illimitati | illimitati | limitati dalle chiamate |
| **tipi di contenuto** | **illimitati** | **25** | illimitati | illimitati | illimitati |
| **lingue** | illimitate | **2** | 1 (multi-sito e' a pagamento) | — | **2** |
| **ruoli** | 2 | 2 (Admin, Editor) | — | — | — |
| **chiamate API** | 250k + **1 M da CDN** | **100k/mese** (nessuno sforamento) | n/a (e' sul tuo server) | — | **100k/mese** |
| **altri limiti** | 2 dataset, **solo pubblici** | 50 GB/mese di banda CDN, asset max 50 MB | 1 utente = inutilizzabile per un cliente | 1 utente | 1 posto |
| **quanto costa il gradino dopo** | **$15 per posto/mese** (5 posti = $75) | **$300/mese** (Lite) | $279 una tantum | $25/mese | **$99/mese** |

Le tre cose che decidono:

1. **Sul cliente tipo, Sanity e Contentful vanno entrambi a costo zero.** Sono i
   due gratuiti veri: 20 posti contro 10, 10.000 documenti contro 10.000 record.
   La differenza non e' nei limiti, e' **nel muro che ci trovi dietro**.
2. **Il gradino successivo e' l'informazione che vale.** Sanity passa a **$15 per
   posto/mese** — con 5 utenti sono $75/mese, e ci arrivi **solo se superi i
   10.000 documenti**. Contentful passa direttamente a **$300/mese**: se il
   cliente cresce, o resta bloccato o **ti chiede perche' il sito e' diventato
   ventennale in una notte**. Storyblok e' peggio: gratuito inutilizzabile (1
   posto) e primo scalino a **$99/mese, cioe' il 20% annuo di un sito da €6.000**.
3. **La trappola nascosta di Sanity Free: i dataset sono solo pubblici.** Chiunque
   conosca il project id legge il contenuto via API. Per un sito vetrina non
   cambia niente (e' contenuto pubblico comunque), **ma non ci si mettono bozze
   riservate, listini o dati di persone**. Se servono, e' $15 per posto.

**Il caso italiano che nessuno considera: Kirby a €99 una tantum.** Per la PMI
brianzola — 30-60 pagine, due persone che aggiornano, nessun bisogno di API —
una licenza perpetua da €99 con tre anni di aggiornamenti **batte qualunque
abbonamento**: dopo 12 mesi ha gia' pagato meno di Webflow, dopo 3 anni costa
un ventesimo di Storyblok. Ed e' esattamente la scelta di **2xA**, che con
quello stack ha vinto un Developer Award. Il prezzo che paghi e' che ti serve un
PHP da tenere aggiornato (`_RICORRENTE.md` §5).

Coerente con quello che gia' dice `_RICORRENTE.md` §4.3, e ora anche col
censimento: **i quattro Sanity del gruppo sono quattro studi che vivono di
questo** (basement, darkroom, vero, frans-hals). I due Storyblok sono uno studio
piccolo (mosby) e un progetto finanziato (kpr).

---

## 4. Il rendering: statico, ISR, server o tutto client — e come si vede da fuori

### 4.1 Il metodo, che e' la parte riutilizzabile

Non serve entrare nel repository. Bastano quattro controlli con `curl`:

| cosa guardo | comando | cosa mi dice |
|---|---|---|
| **le intestazioni Next** | `curl -I <url>` | `X-Nextjs-Prerender: 1` = pagina **pregenerata**. `X-Nextjs-Stale-Time: 300` = **ISR con revalidate a 300 s**. `x-nextjs-cache: HIT/STALE/MISS` = stato della cache |
| **`Cache-Control`** | idem | `s-maxage=<n>, stale-while-revalidate` = **ISR**. `no-store` = **server a ogni richiesta**. `max-age` lungo e immutabile = **statico** |
| **il corpo senza JS** | `curl <url>` e togli `<script>`/`<style>` | se il testo **c'e'**: pregenerato o server. Se c'e' solo "Loading..." o `<body>` vuoto: **tutto client** |
| **la stessa richiesta due volte** | `curl -I` a distanza | `MISS` poi `HIT` = cache al bordo. Sempre `DYNAMIC`/`MISS` = niente cache |

### 4.2 I risultati

| modalita' | siti | prova |
|---|---|---|
| **ISR** (statico rigenerato a scadenza) | **basement, darkroom, frans-hals, trionn, opal, by-kin** | `X-Nextjs-Prerender: 1` **+** `X-Nextjs-Stale-Time` (300 s; darkroom 180 s). Su by-kin: `Cache-Control: s-maxage=3, stale-while-revalidate` |
| **SSR** (server a ogni richiesta) | **kpr, mosby, noomo, dont-board-me, immersive-garden, vero** | `X-Powered-By: Nuxt`/`Next.js` **senza** intestazione di prerender; `cf-cache-status: DYNAMIC` o `X-Vercel-Cache: MISS`; HTML completo nel corpo |
| **Statico puro** (file su un CDN) | **lusion, resn, star-atlas, dark.netflix, persepolis, aristide, obys, zajno** | `Server: Netlify` / `AmazonS3` / `UploadServer` / `CloudFront`; nessuna intestazione applicativa; asset con hash o cartella versionata |
| **Tutto client** (guscio + JS) | **igloo, messenger, active-theory** | `<body>` **vuoto** o con solo `<noscript>`. HTML di 1,4 KB (igloo), 1,7 KB (messenger), 6 KB (active-theory) contro i 220-620 KB degli altri |
| **Server applicativo classico** | **hello-monday** (Heroku), **cuberto**, **locomotive**, **2xa** (PHP), **dogstudio**, **prometheus** (PHP/WordPress) | `via: 2.0 heroku-router`, `x-powered-by: PHP/8.x`, `Server: Apache`; HTML gia' composto, nessun marcatore SPA |

### 4.3 Le due cose che questa griglia insegna

1. **La dimensione dell'HTML e' un rilevatore di rendering.** Igloo, che ha vinto
   **Site of the Year 2024**, consegna **1.410 byte** di HTML: titolo, favicon,
   Open Graph e un `<script type="module">`. Per Google e per un LLM quel sito
   **non ha contenuto**. Confronta con basement: 223 KB di HTML gia' scritto.
2. **ISR e' la modalita' che nessuno annuncia ma quasi tutti i Next usano.** Sei
   siti su sette. Non e' una moda: e' l'unico modo per avere un CMS *e* la
   velocita' di un file statico. E — come si vede alla sezione 6 — e' anche
   l'unico che sopravvive quando il CMS muore.

---

## 5. Cosa significa per chi apre adesso: la scelta che tiene basso il ricorrente

Questa sezione si aggancia direttamente a **`_RICORRENTE.md`** (§4 per i listini
CMS, §3 per l'hosting, §7 per i tre pacchetti a canone).

### 5.1 Il costo ricorrente e' una scelta di architettura, non di listino

Lo stesso sito vetrina, tre architetture, tre costi che il cliente paga **ogni
anno per sempre**:

| architettura | il cliente paga (anno) | chi lo fa fra i premiati |
|---|---|---|
| **Astro o Next statico/ISR + Cloudflare o Vercel Hobby + Sanity Free** | **~€15** (solo dominio) | basement, darkroom, vero, frans-hals — con Sanity Free per un cliente piccolo |
| **statico + Kirby** (licenza perpetua) | **~€15/anno**, €99 una tantum al primo | 2xa |
| **Webflow Premium + workspace** | **~€490** | lando-norris, revelatio |
| **Nuxt SSR + Strapi Cloud Pro** | **~€1.080 + hosting** | by-kin, dont-board-me |
| **Nuxt SSR + Storyblok Growth** | **~€1.100 + hosting** | mosby, kpr |

**Da €15 a €1.100 l'anno per la stessa cosa vista dal cliente.** Su un contratto
di manutenzione da €190/mese (il pacchetto PRESIDIO di `_RICORRENTE.md` §7), la
scelta Storyblok si mangia **quasi meta'** di quello che incassi — oppure e' una
voce in piu' in fattura che ti rende piu' caro del concorrente a parita' di
lavoro.

### 5.2 Le cinque regole che escono dai dati

1. **Statico o ISR, mai SSR per default.** L'SSR obbliga a un server acceso
   sempre. Statico/ISR sta nel gratuito o quasi di Vercel, Netlify e Cloudflare,
   e regge un picco senza toccare niente. Sei Next su sette qui usano ISR.
2. **Sanity Free e basta**, finche' il cliente non supera 20 persone o 10.000
   documenti — cioe' quasi mai. Aggiunge **zero** al ricorrente. Se il cliente e'
   davvero minimo (una vetrina di dieci pagine), **niente CMS**: file Markdown nel
   repository, come fanno 12 siti su 37.
3. **Un solo impianto, riusato.** Obys/Zajno/Aristide su un lato, Media.Monks
   sull'altro: gli studi che vincono spesso **hanno un boilerplate**. Il secondo
   progetto costa la meta' del primo e il margine sta li'.
4. **Se il progetto e' guidato dal canvas, salta il framework.** 10 su 12 nel
   gruppo 3D. Meno dipendenze = meno aggiornamenti = meno ore non fatturabili nel
   canone (`_RICORRENTE.md` §2.4, "il costo che sta sotto un canone").
5. **Webflow non e' una sconfitta.** Lando Norris ha vinto **Site of the Year
   2025** in Webflow, e Revelatio ci fa un sito da premio caricando GSAP dal CDN
   di Webflow. Per il cliente che vuole editare da solo e' il ricorrente piu'
   naturale che esista: **~$25/mese che paga lui, e tu vendi solo il lavoro**.
   Il prezzo e' la gabbia sul design.

---

## 6. Il rischio del CMS in mezzo alla conversione: il caso by-kin, riverificato

`_COME-SI-VENDE.md` §6 riporta: *«by-kin: il CMS risponde 502, e di conseguenza
`/contact` reindirizza alla home. Oggi la pagina contatti non esiste.»*

**Riverificato il 13/08/2026. La situazione e' cambiata, ed e' peggiorata in un
modo che vale la pena capire.**

### 6.1 Cosa risponde oggi, misurato

| richiesta | esito |
|---|---|
| `https://cms.by-kin.com/` | **502 Bad Gateway** — `nginx/1.24.0 (Ubuntu)` |
| `https://cms.by-kin.com/api` | **502** |
| `https://cms.by-kin.com/admin` | **502** |
| `https://by-kin.com/` | **200** — `x-nextjs-cache: STALE` |
| `https://by-kin.com/contact` | **200** — `x-nextjs-cache: STALE`, `Cache-Control: s-maxage=3, stale-while-revalidate` |
| `/work`, `/about`, `/journal` | **200**, tutte `x-nextjs-cache: STALE` |

Quindi: **il CMS e' morto da tempo** (l'upstream di nginx non risponde piu'), e
`/contact` **non reindirizza piu'**: risponde 200.

### 6.2 Ma la pagina e' vuota — ed e' il punto

Tolti `<script>` e `<style>`, il testo visibile di `/contact` e' **269
caratteri**:

```
Contact | 'kin Creative Interior Design & Branding Studio  Loading . . .
About Work Journal  Close  About Work Journal Contact  Subscribe
contact  Menu  sayhi@by-kin.com  address  social  Instagram linkedin
This site is only viewable in portrait mode. Please rotate your device.
```

Le parole **`contact`**, **`address`**, **`social`** in minuscolo non sono
contenuti: sono **le chiavi dei campi rimaste scoperte** perche' i valori non
sono mai arrivati. E `Loading . . .` non finisce mai.

La pagina contatti di uno studio con un **Developer Award** risponde `200 OK` e
non contiene ne' un indirizzo, ne' un modulo, ne' una mappa. Sopravvive solo la
`mailto:sayhi@by-kin.com` — perche' e' scritta **nel markup statico del piede**,
esattamente come diceva la scheda originale.

### 6.3 Perche' il resto del sito invece funziona

Due meccanismi di Next.js lo tengono in piedi da solo:

1. **ISR con `stale-while-revalidate`.** Ogni pagina e' stata generata quando il
   CMS era vivo. Con `s-maxage=3` Next prova a rigenerarla ogni 3 secondi; la
   rigenerazione **fallisce** (502) e Next fa la cosa giusta: **serve la copia
   vecchia** invece di dare errore. Da qui `x-nextjs-cache: STALE` su ogni rotta.
2. **La cache su disco dell'ottimizzatore di immagini.** Le foto della home
   puntano a `cms.by-kin.com/uploads/...` attraverso `/_next/image`. Ho provato:
   ```
   /_next/image?url=https%3A%2F%2Fcms.by-kin.com%2Fuploads%2FDentons_13_9dc4515e40.jpg&w=640&q=75
     -> 200, 45.944 byte, image/jpeg
   la stessa immagine presa diretta dal CMS
     -> 502, 166 byte
   ```
   **L'immagine e' viva perche' Next ne ha una copia ottimizzata sul disco.**

Il sito quindi *sembra* perfetto. Cio' che si rompe e' solo quello che non era
mai stato messo in cache — e per una sfortuna esatta, e' **la pagina che
converte**.

### 6.4 Le regole che ne escono

1. **Un `200 OK` non e' un sito che funziona.** Qualunque controllo automatico
   basato sul codice di stato vede by-kin verde. Il monitoraggio deve cercare
   **una stringa che deve esserci** (l'indirizzo, il testo del pulsante), non il
   200. Da mettere nel pacchetto PRESIDIO di `_RICORRENTE.md` §7 come voce a se':
   *controllo del contenuto, non della risposta*.
2. **La conversione non si mette nel CMS.** Email, telefono, indirizzo, P.IVA e
   la CTA principale vanno **scritti nel codice**, non recuperati da un servizio.
   Costano zero flessibilita' (cambiano una volta ogni tre anni) e sono l'unica
   parte del sito che deve funzionare anche quando tutto il resto e' spento.
   By-kin ha salvato la propria email esattamente cosi', **per caso**.
3. **ISR e' una polizza assicurativa, l'SSR no.** By-kin sopravvive perche' e'
   ISR. Gli stessi contenuti in SSR puro avrebbero dato **502 o pagina bianca su
   tutto il sito** dal primo minuto. Sono i sei Nuxt/Next in SSR della tabella
   §4.2 a correre questo rischio.
4. **Il CMS auto-ospitato e' un servizio che qualcuno deve tenere acceso.**
   By-kin ha Strapi su una VPS con nginx: nessuno se n'e' accorto, e il sito e'
   di uno studio che vive di web. E' l'argomento di vendita piu' onesto per il
   canone di manutenzione — e la ragione tecnica per preferire **Sanity Free**
   (che sta acceso perche' e' il mestiere di qualcun altro) a **Strapi
   auto-ospitato** (che sta acceso perche' lo tieni acceso tu).
5. **Se il CMS ci va comunque**, il piano B va deciso in fase di progetto: dati
   scritti su file a ogni build (cosi' l'ultima build valida resta sul disco),
   `revalidate` lungo, e la pagina contatti **completamente statica**.

---

## 7. Le otto righe da tenere

1. **Vanilla 35%, Vue 8, React 7.** Il web premiato non e' React-first: e' molto
   piu' vario del discorso pubblico. **Zero SvelteKit, zero Remix, zero Qwik.**
2. **L'ipotesi era giusta: 83% dei siti guidati dal 3D non ha un framework**
   (10 su 12), contro il **10%** degli altri (2 su 21). Quando lo stato vive nel
   `requestAnimationFrame`, il framework e' peso morto.
3. **Il CMS piu' diffuso e' "nessuno": 12 su 37.** Un terzo dei siti da premio
   tiene i contenuti nel repository.
4. **Sanity ha il gratuito piu' generoso** (20 posti, 10.000 documenti, tipi e
   lingue illimitati) — ma il motivo per sceglierlo e' **il gradino dopo**: $15
   per posto contro i **$300/mese** di Contentful e i **$99/mese** di Storyblok,
   che di gratuito ha **un posto solo**.
5. **Da €15 a €1.100 l'anno per lo stesso sito**, a seconda della sola scelta di
   CMS. E' la voce che decide se il canone e' margine o pareggio.
6. **ISR e' la modalita' vera del web moderno** (6 Next su 7), e da fuori si
   riconosce in una riga: `X-Nextjs-Prerender: 1` + `X-Nextjs-Stale-Time`.
7. **by-kin oggi risponde 200 e la pagina contatti e' vuota.** ISR e cache
   immagini lo tengono in piedi da un anno con il CMS morto: il sito sembra
   perfetto, ma non c'e' piu' modo di contattarli se non per l'email nel piede.
8. **Gli studi che vincono spesso hanno un impianto e lo riusano.**
   Obys/Zajno/Aristide condividono lo stesso boilerplate PHP+vanilla;
   dark.netflix/persepolis/kode lo stesso di Media.Monks. Il secondo progetto
   costa meta' del primo.

---

## 8. Cosa NON ho verificato, e va detto

- **CMS di cuberto, locomotive e trionn**: HTML gia' composto dal server dietro
  Cloudflare, nessun marcatore. Non ho provato a forzare percorsi di
  amministrazione oltre `/admin` (404 su tutti e tre) perche' non e' educato.
- **Versioni esatte di Next.js e Nuxt**: nessuna delle due le pubblica in
  chiaro. Ho dedotto le fasce da marcatori indiretti (`x-nextjs-stale-time`,
  `data-precedence`, chunk `turbopack-*`, forma del payload `__NUXT__`).
  Sono **fasce**, non numeri di versione.
- **kodeclubs.com**: HTML statico su App Engine, nessun marcatore di framework.
  Non ho scaricato il bundle: e' opaco e l'ho lasciato tale.
- **apple.com**: opaco per scelta di Apple. `Server: Apple` e nient'altro.
- **La tabella dei prezzi** e' presa dai listini pubblici del 13/08/2026 senza
  aprire un account. **Non ho verificato i limiti reali provandoli**: alcuni
  fornitori sono piu' permissivi del listino, altri meno.
- **Craft CMS**: cercato e non trovato su nessuno dei 37. Non escludo che stia
  dietro uno dei tre opachi.
- **I bundle** li ho letti con `grep` su codice minificato. Un nome di libreria
  puo' sparire nella minificazione: **l'assenza di un marcatore non e' prova
  assoluta di assenza della libreria**, mentre la presenza lo e'. Nel caso di
  Obys/Zajno/Aristide l'assenza e' pero' confermata da un secondo indizio — le
  decine di `lerp` scritte a mano, che con GSAP a bordo non avrebbero senso.

---

## 9. Appendice: il metodo, in quattro comandi

E' la parte davvero riutilizzabile. Funziona su qualsiasi sito, in meno di un
minuto, senza aprire il browser.

```bash
# 1) intestazioni: framework, hosting, modalita' di rendering
curl -sIL -A "Mozilla/5.0" https://esempio.com/ | grep -iE \
  'HTTP|server|x-powered-by|x-nextjs|x-vercel|x-nf-|via|cache-control|cf-cache'

# 2) HTML: marcatori di framework e di CMS
curl -sL -A "Mozilla/5.0" https://esempio.com/ -o pagina.html
grep -oiE '/_next/|self\.__next_f|__NUXT__|/_nuxt/|/_astro/|astro-island|__svelte|\
__remixContext|wp-content|cdn\.shopify\.com|website-files\.com|cdn\.sanity\.io|\
ctfassets\.net|a\.storyblok\.com|prismic\.io|datocms-assets' pagina.html \
  | sort | uniq -c | sort -rn

# 3) quanto contenuto c'e' davvero senza JavaScript
python -c "import re,sys; h=open('pagina.html',encoding='utf8',errors='ignore').read(); \
b=re.sub(r'<(script|style).*?</\1>','',h,flags=re.S); \
print(len(re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',b))))"
# < 500 caratteri = tutto client. > 5.000 = pregenerato o server.

# 4) le librerie vere: si leggono solo nel bundle
curl -sL -A "Mozilla/5.0" https://esempio.com/percorso/al/bundle.js -o b.js
grep -oE 'REVISION *= *"[0-9]+|"3\.1[0-9]\.[0-9]+"|__vue_app__|__v_isRef|__svelte|\
three@[0-9.]+|lenis|swup|barba|howler' b.js | sort | uniq -c | sort -rn
```

**Le quattro impronte che risolvono il 90% dei casi:**

| se vedi | e' |
|---|---|
| `X-Nextjs-Prerender: 1` + `X-Nextjs-Stale-Time: <n>` | Next.js in **ISR**, revalidate ogni `<n>` secondi |
| `X-Powered-By: Nuxt` **senza** intestazione di prerender | Nuxt in **SSR** |
| `/_astro/` nei fogli di stile | **Astro** |
| `<body>` vuoto + un solo `<script type="module" src="/assets/<nome>-<hash>.js">` | **Vite**, applicazione **tutta client** |

---

## 10. Fonti dei listini (tutte lette il 13/08/2026)

- [sanity.io/pricing](https://www.sanity.io/pricing) — Free $0, **20 posti**,
  10k documenti, 2 dataset solo pubblici, 2 ruoli; Growth **$15/posto/mese**,
  50 posti, 25k documenti
- [contentful.com/pricing](https://www.contentful.com/pricing/) — Free $0,
  **10 utenti**, **10.000 record**, **25 tipi di contenuto**, 2 ambienti,
  2 lingue, 2 ruoli, 100k chiamate/mese, 50 GB/mese di banda; **Lite $300/mese**,
  20 utenti, 50.000 record
- [prismic.io/pricing](https://prismic.io/pricing) — Free **1 utente**;
  Starter $10 (3 utenti); **Small $25 (7 utenti)**; Medium $150 (25);
  Platinum $675 (illimitati)
- [storyblok.com/pricing](https://www.storyblok.com/pricing) — Starter gratuito
  **1 posto** (max 2, +$15), 100k chiamate/mese, 2 lingue; **Growth $99/mese**
  ($90,75 annuale), 5 posti, 1 M di chiamate; Growth Plus $349/mese, 15 posti
- [strapi.io/pricing-cloud](https://strapi.io/pricing-cloud) — **nessun piano
  gratuito**; Starter $35, Pro $90, Business $450 al mese
- [craftcms.com/pricing](https://craftcms.com/pricing) — Solo **gratuito, 1
  utente**; Team **$279 a progetto + $99/anno** di aggiornamenti, 5 utenti;
  Pro $399 + $99/anno, utenti illimitati; gratuiti se ospitati su Craft Cloud
- [getkirby.com/buy](https://getkirby.com/buy) — Basic **€99 per sito una
  tantum** (sotto €1 M di fatturato), Enterprise €349; **nessun abbonamento**,
  3 anni di aggiornamenti inclusi
- Webflow e Shopify: numeri ripresi da `_RICORRENTE.md` §4.1, **non riverificati
  qui** — la pagina prezzi di Webflow blocca il recupero automatico
