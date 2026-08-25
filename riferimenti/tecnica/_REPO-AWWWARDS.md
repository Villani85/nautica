# Caccia ai repository pubblici dei siti premiati Awwwards (2019-2026)

Obiettivo: trovare **codice sorgente pubblico** di siti che hanno **vinto** un premio
Awwwards - Site of the Year, Developer Award, Site of the Month, Site of the Day -
nel periodo 2019-2026.

Sono esclusi i siti gia' coperti da `_CODICE-PUBBLICO-1.md`, `-2.md`, `-3.md`
(Basement, Darkroom/Studio Freight, Cuberto, Hello Monday, Resn, Revelatio, Zajno,
Lusion, Active Theory, Trionn, 2xA, Noomo, by-kin, Mosby, Lando Norris, Messenger,
Igloo, Dark, Persepolis, Vero, Kode, Don't Board Me, Locomotive, Immersive Garden,
Merci Michel, Obys). Qui ci sono **solo nomi nuovi**.

---

## REGOLA NON NEGOZIABILE

> **Senza licenza il codice si studia, NON si copia.**
>
> "Pubblicamente leggibile" non vuol dire "riutilizzabile". Un repository GitHub senza
> file `LICENSE` resta **coperto dal diritto d'autore per intero**: il proprietario ti
> concede solo di vederlo e di forkarlo dentro GitHub, niente di piu'. Copiare due
> funzioni in un progetto commerciale e' violazione, anche se il repo ha 5000 stelle.
> Lo stesso, a maggior ragione, per i sorgenti ricostruiti da una **sourcemap**:
> quelli non sono nemmeno stati pubblicati apposta, sono usciti per disattenzione.
>
> Cosa si puo' fare **sempre**, con qualunque licenza (o senza):
> - leggere, capire, prendere appunti
> - imparare la **tecnica** (un'idea, un algoritmo, un'architettura non sono coperti
>   dal diritto d'autore: lo e' la loro espressione, cioe' le righe scritte)
> - riscrivere da zero, con parole proprie, una soluzione che si e' capita
>
> Cosa si puo' fare **solo** con MIT / Apache-2.0 / BSD / ISC / Zlib / CC0:
> - copiare righe di codice dentro un progetto tuo, anche a pagamento
> - MIT / BSD / ISC: mantenendo il testo della licenza e il copyright dell'autore
> - Apache-2.0: idem, piu' l'obbligo di segnalare le modifiche
> - CC0: nessun obbligo, e' rinuncia al diritto d'autore
>
> Attenzione a **GPL / AGPL**: obbligano ad aprire anche il tuo codice - per un lavoro
> su commissione sono di fatto inutilizzabili.
> Attenzione a **NOASSERTION**: e' l'etichetta che GitHub mette quando trova un file
> di licenza che non riesce a classificare. Spesso e' una licenza **custom piu'
> restrittiva** di MIT. Il caso vero incontrato in questa ricerca: `particlesGL`,
> `glitchGL`, `spectraGL` di NaughtyDuk sono **gratis solo per uso personale e non
> monetizzato, a pagamento per qualsiasi progetto commerciale**. Sono esattamente il
> tipo di libreria che uno prende al volo pensando "tanto e' su GitHub". Non lo e'.
>
> Attenzione anche al caso opposto: **licenza dichiarata solo nel `package.json` o nel
> README, senza file `LICENSE`**. E' una concessione valida ma debole (nessuna
> formalita', nessun testo completo). Nella colonna USO l'ho marcata
> `COPIABILE CON CAUTELA`.

Nelle tabelle la colonna **USO** riassume in una parola:

| USO | Significato |
|---|---|
| `COPIABILE` | MIT / Apache-2.0 / BSD / ISC / Zlib / CC0 con file di licenza vero |
| `COPIABILE CON CAUTELA` | licenza dichiarata solo in `package.json` o nel README |
| `SOLO STUDIO` | nessuna licenza: si legge e si impara, non si copia una riga |
| `DA LEGGERE` | licenza custom / NOASSERTION: leggere il testo PRIMA di toccarlo |

---

## L'albo d'oro Awwwards, verificato alla fonte

Prima di cercare il codice serviva la lista giusta. La pagina `/annual-awards/` e' una
SPA che ignora `?year=`, ma le pagine `/annual-awards/hall-of-fame/ANNO` sono
renderizzate lato server e si leggono con `curl`. Da li' esce questa tabella.

| Anno | Site of the Year | Developer Site of the Year | E-commerce | Agency | Studio | Independent | Users' Choice |
|---|---|---|---|---|---|---|---|
| 2020 | Pioneer - Corn Revolutionized | Kode Sports Club | Mammut Expedition Baikal | Locomotive | Immersive Garden | Zhenya Rynzhuk | Dark: Netflix Guide |
| 2021 | Prometheus Fuels | Umami Land | Pangram Pangram Foundry | Locomotive | **Unseen Studio** | **Luis Bizarro** | Star Atlas |
| 2022 | KPR | Persepolis Reimagined | Mr. Pops | Locomotive | **Synchronized Studio** | **Jesper Landberg** | The Other Side of Truth |
| 2023 | Lusion v3 | Lusion v3 | Mana Yerba Mate | Locomotive | Obys | Aristide Benoist | Noomo Agency |
| 2024 | Igloo Inc | Igloo Inc | Opal Tadpole | Locomotive | Immersive Garden | **Jesper Landberg** | Don't Board Me |
| 2025 | Lando Norris | Messenger | **Scout Motors** | Immersive Garden | **Malvah** | **Louis Paquet** | Lando Norris |

In grassetto i nomi non ancora studiati nei file precedenti: sono stati il punto di
partenza della caccia.

Il comando che tira fuori la tabella (utile per rifarlo il prossimo anno):

```bash
for y in 2020 2021 2022 2023 2024 2025; do
  curl -sL -A "Mozilla/5.0 Chrome/126" \
    "https://www.awwwards.com/annual-awards/hall-of-fame/$y" \
  | grep -oE 'data-category="[^"]*" data-title="[^"]*" data-link="[^"]*"'
done
```

Nota sul 2019: la hall of fame online parte dal 2020 e `/annual-awards-2019/` risponde
404. Per quell'anno si lavora sui Site of the Day e sui Site of the Month del periodo -
ed e' esattamente li' che sta la preda numero uno, il portfolio di Bruno Simon.

Per i Site of the Day e i Site of the Month le liste si prendono cosi' (il JSON e'
gia' dentro l'HTML, dentro l'attributo `data-collectable-model-value`):

```bash
curl -sL -A "Mozilla/5.0 Chrome/126" \
  "https://www.awwwards.com/websites/sites_of_the_month/" \
| grep -oE '&quot;slug&quot;:&quot;[a-z0-9-]+&quot;' | sort -u
```

---

# LA TABELLA - il bottino

## A. Sorgente del sito premiato (il bottino vero)

Qui il repository **e' il sito che ha vinto**, non una libreria di contorno.

| # | Sito | Premio e anno | Studio / autore | Repository | Stelle | Ultimo push | LICENZA | USO | Dim. | Ling. |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | bruno-simon.com v2 (l'auto guidabile) | SOTD + Site of the Month, 2019-2020; il sito che ha aperto il genere | Bruno Simon | `github.com/brunosimon/folio-2019` | 4728 | 2024-05-25 | **MIT** (`license.md`) | COPIABILE | 63 MB | JavaScript |
| 2 | bruno-simon.com v3 | **Site of the Month** (scheda "Bruno's Portfolio", SOTD dic. 2025) | Bruno Simon | `github.com/brunosimon/folio-2025` | 1689 | 2026-04-07 | **MIT** (`license.md`) | COPIABILE | 768 MB | JavaScript |
| 3 | Kaizen (sito makemepulse 2024) | studio pluripremiato Awwwards, progetto 2024 | makemepulse | `github.com/makemepulse/2024-kaizen-public` | 54 | 2024-08-29 | **nessuna** | SOLO STUDIO | 172 MB | TypeScript/Vue |
| 4 | neuroprod.be | **SOTD** - scheda "Stuff by Kris Temmerman" | Kris Temmerman | `github.com/neuroprod/website` | 12 | 2026-05-24 | **nessuna** | SOLO STUDIO | 1.0 GB | TypeScript |
| 5 | 2018.craftedbygc.com | SOTD - il "year in review" di Unseen Studio | Ash Thornton / Unseen Studio (**Studio of the Year 2021**) | `github.com/craftedbygc/2018-in-review` | 78 | 2020-06-11 | ISC solo in `package.json` | COPIABILE CON CAUTELA | 115 MB | JavaScript |
| 6 | 14islands.com v2 | studio con SOTD multipli | 14islands | `github.com/14islands/14islands-com-v2` | 14 | 2024-04-11 | **MIT** | COPIABILE | 370 MB | HTML/JS/Jekyll |
| 7 | juliangarnier.com | portfolio dell'autore di anime.js (anime.js e' **Site of the Month**) | Julian Garnier | `github.com/juliangarnier/juliangarnier.com` | 240 | 2025-01-21 | **nessuna** | SOLO STUDIO | 202 KB | JavaScript |
| 8 | my-room-in-3d | esperimento SOTD/Honorable dello stesso autore | Bruno Simon | `github.com/brunosimon/my-room-in-3d` | 4476 | 2023-09-12 | **nessuna** | SOLO STUDIO | 49 MB | JavaScript |
| 9 | alethia.earth | **SOTD** | (sito Framer con code components custom) | sourcemap: `script_main.CPsdJQ5r.mjs.map` | - | live | nessuna (uscita per errore) | SOLO STUDIO | 537 KB di map | JS/React |
| 10 | Componenti Vue di Synchronized Studio | **Studio of the Year 2022**, Mobile SOTY 2020 | Synchronized Studio | `github.com/SynchronizedStudio/components` | 0 | 2021-10-06 | **MIT** | COPIABILE | 270 KB | Vue |

## B. L'officina degli autori premiati (le librerie che fanno girare quei siti)

Non sono il sito premiato, ma sono il codice **con cui** quei siti sono stati fatti,
scritto dalle stesse mani. Spesso valgono piu' del sito, perche' sono documentati.

| # | Repository | Chi e' e cosa ha vinto | Stelle | Ultimo push | LICENZA | USO | Dim. | Ling. |
|---|---|---|---|---|---|---|---|---|
| 11 | `craftedbygc/taxi` | Ash Thornton - Unseen Studio, **Studio of the Year 2021** | 639 | 2025-11-01 | **BSD-3-Clause** | COPIABILE | 2 MB | JavaScript |
| 12 | `ashthornton/asscroll` | stesso autore, lo smooth-scroll dei loro siti premiati | 927 | 2023-03-11 | **MIT** | COPIABILE | 1.7 MB | JavaScript |
| 13 | `craftedbygc/e` | stesso autore, micro event-emitter | 59 | 2025-06-02 | **BSD-3-Clause** | COPIABILE | 424 KB | JavaScript |
| 14 | `craftedbygc/kikk-24-generator` | generatore d'identita' per il festival KIKK 2024 | 1 | 2024-08-13 | **nessuna** | SOLO STUDIO | 4.5 MB | GLSL |
| 15 | `jesperlandberg/JScroll` | Jesper Landberg, **Independent of the Year 2022 e 2024** | 87 | 2020-09-24 | **MIT** | COPIABILE | 188 KB | JavaScript |
| 16 | `14islands/r3f-scroll-rig` | 14islands: WebGL agganciato al DOM in scroll | 961 | 2025-12-17 | **MIT** | COPIABILE | 14 MB | TypeScript |
| 17 | `14islands/react-page-transitions` | transizioni di pagina framework-agnostiche | 31 | 2023-03-01 | **MIT** | COPIABILE | 1.6 MB | TypeScript |
| 18 | `MONOGRID/gainmap-js` | MONOGRID (studio Awwwards): HDR con gain map su web | 161 | 2026-07-06 | **MIT** | COPIABILE | 78 MB | TypeScript |
| 19 | `naughtyduk/liquidGL` | NaughtyDuk, **SOTD**: l'effetto "liquid glass" | 822 | 2026-08-01 | MIT **solo nel README** | COPIABILE CON CAUTELA | 99 MB | JavaScript |
| 20 | `naughtyduk/particlesGL` | stesso studio | 97 | 2026-07-07 | **custom** - a pagamento se commerciale | DA LEGGERE | 68 MB | JavaScript |
| 21 | `naughtyduk/glitchGL` | stesso studio | 89 | 2026-07-07 | **custom** - idem | DA LEGGERE | 87 MB | JavaScript |
| 22 | `naughtyduk/spectraGL` | stesso studio | 26 | 2026-07-07 | **custom** - idem | DA LEGGERE | 33 MB | JavaScript |
| 23 | `ueno-llc/gsap-tools` | Ueno, studio pluripremiato Awwwards | 302 | 2020-09-04 | **MIT** | COPIABILE | 8 MB | JavaScript |
| 24 | `ueno-llc/starter-kit-universally` | lo scheletro SSR con cui costruivano | 183 | 2019-01-22 | **MIT** | COPIABILE | 3.2 MB | JavaScript |
| 25 | `buildinamsterdam/use-keydown` | Build in Amsterdam, SOTD multipli | 1 | 2023-10-18 | **MIT** | COPIABILE | 1.5 MB | TypeScript |
| 26 | `buildinamsterdam/use-match-media` | idem | 0 | 2024-01-31 | **MIT** | COPIABILE | 1.4 MB | TypeScript |
| 27 | `buildinamsterdam/contentful-rest` | idem, il loro strato CMS | 1 | 2026-02-18 | **MIT** | COPIABILE | 196 KB | TypeScript |
| 28 | `juliangarnier/anime` | **anime.js e' Site of the Month**; qui c'e' la libreria e la cartella `examples/` con le demo del sito | 72122 | 2026-08-09 | **MIT** | COPIABILE | 184 MB | JavaScript |
| 29 | `thegetty/quire` | Getty: e' l'editore di **Persepolis Reimagined** (Dev SOTY 2022) e di **Tracing Art** (SOTM) | 148 | 2026-08-12 | **BSD-3-Clause** | COPIABILE | 320 MB | JavaScript |
| 30 | `googlecreativelab/chrome-music-lab` | Google Creative Lab, laboratorio pluripremiato | 2419 | 2024-02-28 | **Apache-2.0** | COPIABILE | 16 MB | JavaScript |
| 31 | `googlecreativelab/anypixel` | idem | 6439 | 2025-08-18 | **Apache-2.0** | COPIABILE | 90 MB | JavaScript |
| 32 | `spite/THREE.MeshLine` | Jaume Sanchez: linee spesse in Three.js, usate ovunque nei siti premiati | 2339 | 2024-03-22 | **MIT** | COPIABILE | 6.7 MB | JavaScript |
| 33 | `spite/ccapture.js` | cattura video di canvas a frame rate fisso (per i case study) | 3761 | 2026-07-27 | **MIT** | COPIABILE | 50 MB | JavaScript |
| 34 | `akella/webgl-mouseover-effects` | Yuri Artiukh, effetti WebGL da SOTD | 399 | 2023-05-18 | **MIT** | COPIABILE | 3.4 MB | JavaScript |
| 35 | `akella/DistortedPixels` | idem | 287 | 2022-01-12 | **MIT** | COPIABILE | 3.4 MB | HTML/GLSL |
| 36 | `akella/fake3d` | l'effetto parallasse 3D da foto singola | 546 | 2020-01-05 | **nessuna** | SOLO STUDIO | 2.9 MB | HTML/GLSL |
| 37 | `ektogamat/threejs-andy-boilerplate` | Anderson Mancini, R3F | 759 | 2022-05-01 | **MIT** | COPIABILE | 3.2 MB | JavaScript |
| 38 | `ektogamat/fake-glow-material-r3f` | il bagliore finto che costa 1/10 di un bloom | 173 | 2024-10-27 | **MIT** | COPIABILE | 4.7 MB | JavaScript |
| 39 | `ektogamat/R3F-Ultimate-Lens-Flare` | flare da lente | 264 | 2023-06-01 | **CC0-1.0** | COPIABILE | 12 MB | JavaScript |
| 40 | `luruke/browser-2020` | Luigi De Rosa (Lusion/Vasava): cosa sa fare il browser oggi | 7974 | 2021-10-28 | **nessuna** | SOLO STUDIO | 2.3 MB | Markdown |
| 41 | `luruke/awesome-casestudy` | la raccolta dei case study degli studi premiati | 2621 | 2022-09-28 | **nessuna** | SOLO STUDIO | 258 KB | Markdown |
| 42 | `luruke/magicshader` | debug degli shader dentro il browser | 248 | 2021-03-16 | **nessuna** | SOLO STUDIO | 9.2 MB | JavaScript |
| 43 | `pmndrs/react-three-fiber` | lo strato React che regge meta' dei siti WebGL premiati | 31703 | 2026-08-11 | **MIT** | COPIABILE | 28 MB | TypeScript |
| 44 | `pmndrs/postprocessing` | il post-processing usato da Lusion, Igloo, Basement | 2823 | 2026-08-13 | **Zlib** | COPIABILE | 261 MB | JavaScript |
| 45 | `greensock/GSAP` | GSAP: **madewithgsap.com e' SOTD**, e GSAP e' nel 90% dei premiati | 27666 | 2026-04-13 | nessun file LICENSE nel repo (vale la licenza GreenSock, oggi gratuita) | DA LEGGERE | 14 MB | JavaScript |

## C. Ricostruzioni (non sono il sorgente originale - dirlo sempre)

Un'intera industria di cloni didattici. **Non sono il codice dei vincitori**, sono
riscritture. Valgono come esercizio e come conferma di quali siti fanno scuola, mai
come prova di "come l'hanno fatto davvero".

| Repository | Sito premiato imitato | Stelle | LICENZA | USO |
|---|---|---|---|---|
| `adrianhajdin/award-winning-website` | Zentry (**Site of the Month**) | 1049 | nessuna | SOLO STUDIO |
| `Fullstack-Empire/GSAP-Awwwards-Website` | Spylt (SOTD) | 275 | nessuna | SOLO STUDIO |
| `rodrigogama/awwwards-rebuilt-furrow` | Furrow (SOTD) | 164 | **MIT** | COPIABILE |
| `poojahooda22/obys-clone` | Obys (**Studio of the Year 2023**) | 51 | nessuna | SOLO STUDIO |
| `whizzbbig/floema_` | Floema, il corso di Luis Bizarro (**Independent of the Year 2021**) | 85 | nessuna | SOLO STUDIO |
| `Pi-sulaiman/floema-awwwards` | idem | 0 | **MIT** | COPIABILE |
| `Madewill/R3F-AWWARDS-website` | Atmos (SOTD) | 51 | nessuna | SOLO STUDIO |
| `ShowravKormokar/capsule` | capsule.moyra.co (SOTD) | 88 | nessuna | SOLO STUDIO |
| `wrongakram/ar-episode2` | serie "Awwwards rebuilt" | 75 | **MIT** | COPIABILE |

---

# COSA SI IMPARA, riga per riga

**1. `brunosimon/folio-2019`** - il portfolio-videogioco, l'auto guidabile.
Dipendenze scarne e vecchia scuola: `three` + `cannon` (fisica) + `howler` (audio) +
`gsap` + `dat.gui`, servito da Vite. La lezione non e' la fisica: e' che tutto il
mondo 3D e' costruito da **matrici di dati** e non da un file di scena, e che il
"gioco" e' in realta' un menu di navigazione. Da qui si impara come si fa a rendere
esplorabile un portfolio senza costruire un motore.

**2. `brunosimon/folio-2025`** - la versione moderna dello stesso mestiere, ed e'
un'altra classe di ingegneria. `@dimforge/rapier3d` (fisica WASM al posto di cannon),
`camera-controls`, `@gltf-transform/*` per **comprimere le mesh in pipeline** invece
che a mano, `msgpack-lite` (stato binario, non JSON), `stats-gl`, `tweakpane`,
`vite-plugin-wasm` + `vite-plugin-top-level-await`. Il `readme.md` documenta
esplicitamente il **game loop**. Se dovessimo costruire un'esperienza 3D pesante e
volessimo copiare la struttura di build, e' questo il modello - ed e' MIT, quindi si
puo' davvero.

**3. `makemepulse/2024-kaizen-public`** - il pezzo piu' istruttivo per capire come
lavora uno studio francese di alto livello. Non usano Three.js: usano **nanogl**, il
loro motore (`nanogl-pbr`, `nanogl-gltf`, `nanogl-camera`, `nanogl-state`,
`nanogl-post`). Sopra ci mettono **Vue 3 + XState** (le macchine a stati per il flusso
delle scene) e **Theatre.js** per l'animazione. Il README spiega il trucco piu'
copiabile di tutti: il codice di debug e' racchiuso in blocchi `/// #if DEBUG` che
`ifdef-loader` **cancella dal bundle di produzione**, mentre `Gui` e `DebugDraw`
restano chiamabili ovunque perche' in produzione diventano funzioni vuote. Cosi' non
si sporca il codice di `if (dev)` e non si spedisce Tweakpane al cliente.

**4. `neuroprod/website`** - un gigabyte di repository per un sito personale, ed e'
il punto. E' scritto in **WebGPU nativo** (`@webgpu/types`), con `physx-js-webidl`
(PhysX compilato in WASM), `earcut` per la triangolazione, `@math.gl/core`, e ha
perfino una cartella `server/`. Zero framework. E' la dimostrazione che un SOTD si
puo' vincere andando *sotto* Three.js invece che sopra.

**5. `craftedbygc/2018-in-review`** - Unseen Studio nel 2019: webpack + Babel + Sass,
`three` 0.101, `glslify-loader` per gli shader, `load-bmfont` per la tipografia in
canvas, `critters-webpack-plugin` per il CSS critico inline, e - dettaglio che dice
tutto sulla cura - la dipendenza `konami` per l'easter egg. La lezione e' la
**tipografia bitmap in WebGL**: prima che esistesse troika-three-text, il testo
nitido in 3D si faceva cosi'.

**6. `14islands/14islands-com-v2`** - MIT, e sotto c'e' Jekyll con Grunt e Bower.
Serve per una cosa sola ma importante: e' la prova che un sito da studio premiato puo'
essere **statico e banale nella build**, e giocarsi tutto sul livello sopra. Il
livello sopra e' `r3f-scroll-rig` (riga 16), che e' la vera idea dello studio: il DOM
resta il padrone del layout e dello scroll, il WebGL disegna **sopra** i buchi
lasciati dagli elementi HTML. E' l'architettura piu' riusabile che ho trovato in
questa ricerca, ed e' MIT.

**7. `juliangarnier/juliangarnier.com`** - 202 KB in tutto. Il portfolio dell'autore
di anime.js e' minuscolo. Da leggere subito dopo aver visto folio-2025, come
contrappeso: due modi opposti di essere memorabili.

**9. `alethia.earth` (sourcemap)** - unica sourcemap con sorgenti veri trovata in 46
siti premiati. E' un sito **Framer**, e la map espone i suoi *code component* custom,
con nomi parlanti: `StopScroll_Prod.js`, `WithNavReveal.js`. Lezione pratica: quando
un cliente vuole "un sito da premio" ma il budget e' da no-code, questa e' la strada
- Framer per il layout, quattro componenti React scritti a mano per i momenti forti.

**11-13. Taxi + ASScroll + e (Unseen Studio)** - il trio con cui Unseen ha vinto lo
Studio of the Year 2021, e sono **BSD-3 e MIT**, cioe' utilizzabili. `taxi` gestisce
le transizioni di pagina in un sito multipagina senza diventare una SPA;
`asscroll` e' lo smooth scroll che sincronizza il DOM con il canvas. Insieme risolvono
il problema numero uno dei siti immersivi: **navigare fra pagine senza che il canvas
WebGL si ricarichi**.

**15. `jesperlandberg/JScroll`** - 188 KB dell'unico developer che ha vinto
l'Independent of the Year **due volte**. Vale come lettura di stile: quanto poco
codice serve, se e' quello giusto.

**18. `MONOGRID/gainmap-js`** - MIT, e risolve un problema vero e attuale: mostrare
immagini HDR sul web senza spedire un EXR. Se un cliente vende superfici lucide
(divani in pelle, auto, gioielli) questa libreria e' la differenza fra un riflesso
piatto e uno che sembra vero.

**19-22. NaughtyDuk** - `liquidGL` e' il "liquid glass" che tutti hanno rifatto male
nel 2025-2026, ed e' **MIT (dichiarata nel README, senza file LICENSE)**. Gli altri
tre - `particlesGL`, `glitchGL`, `spectraGL` - hanno una licenza custom che li rende
**a pagamento per qualsiasi uso commerciale**. Sono nella stessa organizzazione, con
lo stesso stile di README: e' la trappola perfetta. Leggere `LICENCE.md` (con la C,
non la S) prima di aprire il file.

**28. `juliangarnier/anime`** - la libreria del sito che ha vinto il Site of the Month.
Il sito `animejs.com` non e' su GitHub e il suo bundle e' minificato, ma la cartella
`examples/` del repo contiene le demo che si vedono sulla home. E' MIT: le animazioni
della home di un Site of the Month sono legalmente riusabili.

**29. `thegetty/quire`** - il Getty pubblica il proprio motore editoriale. Hanno vinto
il Developer Site of the Year 2022 (Persepolis) e un Site of the Month (Tracing Art).
Se arriva un cliente museo o fondazione, questo e' il precedente da mostrare e la base
da cui partire, BSD-3.

**40-42. luruke** - `browser-2020` e `awesome-casestudy` non sono codice, sono
**mappe del territorio** scritte da uno degli sviluppatori di Lusion (Site of the Year
2023). `awesome-casestudy` in particolare e' la scorciatoia per leggere come gli studi
premiati raccontano il proprio lavoro: e' il modello per i nostri case study.

**44. `pmndrs/postprocessing`** - licenza **Zlib**, che e' permissiva come MIT ma
quasi nessuno la conosce. E' il pacchetto di effetti (bloom, DOF, god rays) dietro
buona parte dei siti premiati in React.

**45. `greensock/GSAP`** - nel repository **non c'e' un file LICENSE**. GSAP e' oggi
gratuito anche per uso commerciale (dal 2025, dopo l'acquisizione Webflow), ma la
concessione sta sul sito di GreenSock, non nel repo. Da citare in offerta con il
link, non con "e' MIT" - perche' non lo e'.

---

# IL CONTEGGIO

| Strada | Provati | Aperti | Resa |
|---|---|---|---|
| **1. Organizzazione GitHub per nome** (studio/autore, con piu' capitalizzazioni e `/users/`) | 39 account | **20 con codice utile** | **51%** - la strada migliore |
| **2. Ricerca per nome del sito** su `search/repositories` | ~8 query | 3 (soprattutto cloni didattici) | bassa: trova ricostruzioni, non originali |
| **3. Sourcemap in produzione** | 46 siti premiati | **1** (alethia.earth) | **2%** - crollata rispetto al passato |
| **4. Bundle non minificato** | 46 siti | 5 "sospetti" (k95.it, 2xa.studio, ponpon-mania, akaru.fr, floema.com), nessuno leggibile davvero | quasi zero |
| **5. `/.git/config`, `/package.json`, `/.env`, `/composer.json`** | **98 domini** | **1** (`composer.json` di davidwhyte.com: due righe, Stripe e Guzzle) | ~1% |
| **5-bis. npm registry per nome dello studio** | 8 studi | 6 con pacchetti pubblicati | **75%** - sottovalutata, vedi sotto |

**Totale: 45 repository aperti e schedati**, su circa 150 fra siti e account provati.
Di questi, **25 sono legalmente copiabili** (MIT / Apache-2.0 / BSD / ISC / Zlib /
CC0), **14 sono solo da studiare** (nessuna licenza) e **6 vanno letti prima**
(licenza custom o dichiarata solo nel README).

## Le tre prede migliori

**1. `brunosimon/folio-2025` - MIT, 768 MB, aggiornato ad aprile 2026.**
E' l'unico caso in questa ricerca in cui il sorgente **completo e aggiornato** di un
sito che ha vinto un Site of the Month e' pubblicato con licenza MIT dall'autore
stesso. Non e' un reperto del 2019: usa Rapier in WASM, la pipeline gltf-transform,
lo stato in msgpack. E' contemporaneamente il caso studio, il boilerplate e il
permesso legale di copiarlo. Se in questo momento dovessimo costruire un'esperienza
3D esplorabile per un cliente, si parte da qui e non si discute.

**2. `makemepulse/2024-kaizen-public` - nessuna licenza, 172 MB.**
Vale il secondo posto pur non essendo copiabile, perche' e' l'unica finestra su
**come e' organizzato dentro** un progetto di uno studio di primissima fascia:
macchine a stati per il flusso delle scene, motore proprio invece di Three.js,
Theatre.js per l'animazione, e il trucco dei blocchi `/// #if DEBUG` che spariscono
in produzione. Quel trucco lo possiamo adottare domani: e' un'idea, non una riga di
codice, e le idee non hanno licenza.

**3. `14islands/r3f-scroll-rig` + `craftedbygc/taxi` + `ashthornton/asscroll` - MIT e
BSD-3, dagli autori di uno Studio of the Year.**
Li metto insieme perche' risolvono lo stesso problema, che e' il problema vero dei
siti che vogliamo vendere: **tenere insieme DOM e WebGL senza che l'uno rovini
l'altro**, e passare da una pagina all'altra senza ricaricare il canvas. Sono
mantenuti, documentati e permissivi. E' la parte che di solito costa tre settimane di
tentativi, gia' fatta, gia' premiata e gia' concessa.

## Il metodo che ha funzionato meglio

**Cercare l'account GitHub dello studio, non il sito.** Ha una resa del 51% contro il
2% delle sourcemap. Il ragionamento e': un sito premiato viene chiuso, ma lo studio che
lo ha fatto pubblica quasi sempre gli **attrezzi** con cui lo ha fatto - e li pubblica
con licenza vera, perche' vuole essere citato. Il codice del sito e' marketing chiuso;
gli attrezzi sono marketing aperto.

Due cose pratiche imparate sul campo:

- **La trappola delle maiuscole e' reale ma si aggira.** `api.github.com/orgs/NOME` e'
  sensibile alle maiuscole (`Zajno`, `Cuberto`, `MONOGRID`, `Jam3` rispondono 404 in
  minuscolo) e distingue `/orgs/` da `/users/`. La soluzione e' non usarli affatto:
  **`api.github.com/search/repositories?q=user:NOME`** e' **insensibile alle
  maiuscole**, non distingue utenti da organizzazioni, e restituisce in **una sola
  chiamata** fino a 100 repository **con licenza, stelle, dimensione, linguaggio e
  data dell'ultimo push**. E pesca da un contatore separato (10 al minuto) invece che
  dai 60 all'ora delle chiamate normali. E' il comando giusto:

  ```bash
  curl -s "https://api.github.com/search/repositories?q=user:NOME&per_page=100&sort=stars"
  ```

  Se risponde `Validation Failed`, l'account **non esiste** (non e' un problema di
  maiuscole): allora si passa a `search/users?q=nome+cognome`, che trova l'handle
  vero. Cosi' e' saltato fuori `jesperlandberg` (non `jesper-landberg`) e
  `craftedbygc` (Unseen Studio non ha un account "unseen").

- **Il registro npm e' la seconda porta, e nessuno la prova.** Una ricerca su
  `registry.npmjs.org/-/v1/search?text=NOME` ha resa del 75% e trova pacchetti che su
  GitHub non compaiono in cima: `@basementstudio/shader-lab`, `bsmnt` (la CLI interna
  di Basement), `@darkroomengineering/fitbox`, `@14islands/scroll-parallax`, tutti gli
  `@buildinams/*`, `@monogrid/vue-lib`. Sono i pezzi piccoli e riusabili, quelli che
  servono davvero.

E una nota che vale come avvertimento per il futuro: **la strada delle sourcemap si
sta chiudendo.** Su 46 siti premiati del 2025-2026 ne ha resa una sola, e per giunta
di un sito Framer. Next.js e Nuxt oggi non spediscono piu' le map per default, e i
CDN che restano (jsdelivr, unpkg, cdnjs) restituiscono solo i sorgenti di GSAP, Lenis
e Swiper - che sono gia' pubblici. Chi cerca oggi deve partire dal nome dello studio.

## Vicoli ciechi, per non rifarli

- **`studiomalvah`** (Malvah, **Studio of the Year 2025**): 7 repository, tutti pieni
  **solo di file `.mp4`**. Usano GitHub come CDN video per i loro case study. Zero
  codice. Curioso come trucco (video pesanti serviti gratis da `raw.githubusercontent`),
  inutile come sorgente.
- **`Jam3`, `dogstudio`, `Unseen-Studio`, `akaru-studio`**: account esistenti o
  omonimi, zero repository pubblici accessibili.
- **`rezo-zero`, `phantomlandnyc`, `rallyinteractive`, `instrument-hq`, `chungiyoo`,
  `unseenco`**: `Validation Failed`, cioe' l'handle non esiste con quel nome.
- **`aristidebenoist`** (Independent of the Year 2023): un solo repository, quello del
  profilo, 12 KB.
- **`luisbizarro`**: omonimo. Il Luis Bizarro premiato pubblica il suo materiale nel
  corso Floema, non su un account con quel nome.
- **scoutmotors.com** (E-commerce of the Year 2025), **zentry.com** (Site of the
  Month), **cornrevolution.resn.global** (Site of the Year 2020), **mrpops.ua**,
  **theothersideoftruth.com**: nessuna sourcemap, nessun bundle leggibile, niente.
- La sourcemap che si trova su decine di siti e' sempre la stessa: `gsap.min.js.map`,
  `lenis.min.js.map`, `swiper-bundle.min.js.map` serviti da CDN. **Non e' una
  scoperta**, e' la libreria che gia' conosciamo. Vanno filtrate via subito, altrimenti
  gonfiano il conteggio e fanno sembrare produttiva una strada che non lo e'.

---

## Appendice - gli script usati

Tutti in `curl` + Python, nessun browser.

```bash
# 1. albo d'oro annuale (2020-2025)
for y in 2020 2021 2022 2023 2024 2025; do
  curl -sL -A "Mozilla/5.0 Chrome/126" \
    "https://www.awwwards.com/annual-awards/hall-of-fame/$y" \
  | grep -oE 'data-category="[^"]*" data-title="[^"]*" data-link="[^"]*"'
done

# 2. elenco Site of the Day / of the Month (il JSON e' dentro l'HTML)
curl -sL -A "Mozilla/5.0 Chrome/126" \
  "https://www.awwwards.com/websites/sites_of_the_day/?page=1" \
| grep -oE '&quot;slug&quot;:&quot;[a-z0-9-]+&quot;' | sort -u
# NOTA: la pagina /sites/SLUG contiene l'URL vero del sito; va presa una alla volta,
# con ~1 secondo di pausa, altrimenti le richieste iniziano a fallire in blocco.

# 3. repository di un account (insensibile alle maiuscole, utenti E organizzazioni)
curl -s "https://api.github.com/search/repositories?q=user:NOME&per_page=100&sort=stars"

# 4. handle vero, quando il nome tirato a indovinare non esiste
curl -s "https://api.github.com/search/users?q=nome+cognome"

# 5. pacchetti npm pubblicati dallo studio
curl -s "https://registry.npmjs.org/-/v1/search?text=NOME&size=20"

# 6. licenza vera di un repo, senza consumare le 60 chiamate/ora
curl -s "https://raw.githubusercontent.com/UTENTE/REPO/BRANCH/LICENSE"
curl -s "https://raw.githubusercontent.com/UTENTE/REPO/BRANCH/package.json"
# (attenzione al branch: molti repo vecchi sono ancora su 'master', non 'main';
#  e ai nomi: LICENSE, license.md, LICENCE.md sono tutti in uso)

# 7. caccia alla sourcemap: prendi gli <script src>, scarica ogni chunk, leggi la coda
#    in cerca di //# sourceMappingURL=, scarica la .map e verifica sourcesContent.
#    Se la map non e' dichiarata, prova comunque <chunk>.js.map: 404/307 = assente.
```

**Il contatore da tenere d'occhio**, perche' e' quello che ferma la ricerca:

```bash
curl -s https://api.github.com/rate_limit
# core: 60/ora  (le chiamate /repos/, /orgs/, /users/ - si esauriscono subito)
# search: 10/minuto  (search/repositories, search/users - si rigenerano, usare queste)
```
