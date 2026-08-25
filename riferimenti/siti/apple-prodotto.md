# Apple — pagina prodotto iPhone Air (con l'appendice sul motore a fotogrammi)

- **URL**: https://www.apple.com/iphone-air/
- **Premio**: nessuno. Non e' un sito da concorso: e' lo standard industriale che i
  siti da concorso copiano. Nel 2019 la stessa tecnica su AirPods Pro fu anche
  attaccata pubblicamente (Daring Fireball, "Scrolljacking Hell",
  https://daringfireball.net/linked/2019/10/28/airpods-pro-scrolljacking-hell).
- **Studio**: Apple Marcom, interno. I moduli nel bundle hanno namespace
  `@marcom/bubble-gum`, `@marcom/anim-system`, `@marcom/ac-analytics`,
  `@marcom/useragent-detect`. Nessuna agenzia esterna e' rilevabile nel codice.
- **Anno**: pagina viva al 13/08/2026. Asset video datati `2025/` e `2026/` nei
  percorsi; `last-modified` dei video di scrub: **Fri, 05 Sep 2025 02:26:34 GMT**.
- **Letto il**: 13/08/2026

**Metodo, dichiarato subito.** Tutto qui sotto viene da HTML, CSS, JavaScript e
`HEAD` HTTP scaricati con `curl`, piu' `ffprobe` sui video veri. **Non ho aperto
un browser**, quindi non ho misurato nessun tempo di rendering, nessun FPS e
nessuna posizione di scroll reale: le mappe scroll→fotogramma qui sotto sono
lette dagli attributi `data-*` e dal codice che li consuma, non campionate.

---

## Cosa vende

Un telefono da 999 $ che pesa e misura meno di tutti gli altri iPhone. La pagina
vende **una sola proprieta' fisica — lo spessore** — e la vende facendo ruotare
l'oggetto sotto il dito di chi scorre, cosi' che il profilo sottile passi
davanti agli occhi decine di volte.

## A chi

A chi ha gia' un iPhone di due o tre anni fa e sta valutando l'upgrade. Deve
uscire dalla pagina con due frasi in testa: "e' assurdamente sottile" e "dentro
c'e' lo stesso chip del Pro". Non deve uscirne con una lista di specifiche: le
specifiche stanno in una pagina separata (`/iphone-air/specs/`).

## Idea regista

**Il prodotto e' fermo e sei tu che gli giri intorno**: ogni sezione e' un
oggetto immobile al centro dello schermo, e lo scroll e' la manopola che ne
cambia il punto di vista.

## Il momento

La rotazione della fotocamera in cima alla sezione **Cameras**. Il telefono
ruota su se stesso per 238 fotogrammi, ma la mappatura scroll→fotogramma e'
spezzata in due deliberatamente: **l'87% dell'animazione scorre in 85vh di
scroll, il 13% finale in 90vh**. Cioe' l'ultimo ottavo del giro dura piu' spazio
di tutto il resto. La rotazione decelera fino a fermarsi mentre il titolo entra.

Testuale dal DOM (`#cameras-video-scrub`):

```
data-video-progress-kf-1='{"start": "a0t - 100vh", "end": "a0t - 15vh",
                           "progress": [0.0, 0.87], "anchors": [".subsection-intro"]}'
data-video-progress-kf-2='{"start": "a0t - 15vh",  "end": "a0t + 75vh",
                           "progress": [0.87, 1.0], "anchors": [".subsection-intro"]}'
```

**Non c'e' nessuna funzione di easing.** La decelerazione e' fatta spezzando la
mappatura lineare in due segmenti con pendenze diverse. E' la cosa piu'
rifacibile di tutta la pagina.

---

## Struttura, sezione per sezione

Sezioni lette dagli `id` e dalle `class` di `<section>` nell'HTML.

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |
|---|---|---|---|
| welcome (hero, senza id) | video `#welcome-video`: il telefono fluttua e viene afferrato da due dita | guarda, non scorre | ~1 schermata; il video parte da solo entrando in vista |
| `#highlights` | galleria di 6 video corti (`media-gallery-item-1..6`) | scorre orizzontalmente / con paddle | ~1,5 schermate |
| `#design` | "Take a closer look." + **visore 3D reale** (`.product-viewer-component`, `data-mode="3d"`) | trascina per ruotare il modello, cambia colore, apre AR (`.usdz`) | ~2 schermate |
| `#cameras` — `.subsection-intro` | **scrub 1**: telefono che ruota (`#cameras-video-scrub`) | scorre; la rotazione e' legata allo scroll | ~1,85 schermate (85vh + 90vh) |
| `#cameras` — `.subsection-fusion-camera` | **scrub 2**: il modulo fotocamera dal basso, con canale alfa (`#fusion-camera-video-scrub`) | scorre | large: da `a0t - 80vh` a `a1t - 100vh + 130px`; small: 75vh |
| `#cameras` — resto | 9 blocchi di feature (Portraits, Photographic Styles, Night mode, Pro video, 2x Telephoto, Clean Up, Camera Control) | scorre, apre modali | ~4 schermate |
| `#performance` — `.subsection-intro` | **scrub 3**: interno del telefono che si illumina (`#performance-battery-hero`) | scorre | large: 65vh + 90vh; small: 200vh in un pezzo solo |
| `#performance` — `.subsection-chip` | video del chip A19 Pro che cade dentro il telefono (autoplay allo scroll) | guarda | ~1 schermata |
| `#performance` — `.subsection-battery` | **scrub 4**: batteria (`#performance-battery-battery-life`) | scorre | 85vh + 95vh |
| `#shared-features` | iOS 26, Liquid Glass, Apple Intelligence, Connectivity — griglia di card | scorre, apre modali | ~5 schermate |
| upgrade / compare | "Worth the upgrade? Absolutely." + confronto con il proprio modello | sceglie il modello posseduto | ~2 schermate |
| `#accessories` | custodie, MagSafe, batteria | galleria | ~1,5 schermate |
| ways to buy / trade in / FAQ / footer | commercio e assistenza | accordion, link | ~5 schermate |

**Il conto che conta**: su una pagina di circa 25 schermate, i pezzi guidati
dallo scroll sono **quattro**, tutti nella prima meta'. Da "shared-features" in
poi e' un catalogo statico. Apple non anima tutto: anima i primi due terzi e poi
smette.

---

## L'esperienza in ordine di tempo

**Secondo 0.** Arriva l'HTML (107 KB compressi, 792 KB veri). `head.built.js`
(77 KB) gira **prima** del body e decide una cosa sola ma decisiva: se questa
pagina sara' `enhanced` o `base`. Aggiunge o toglie la classe `enhanced`
su `<html>`. Nel frattempo il CSS (101 KB compressi, 1,13 MB veri) tiene
`.video-scrub-container{display:none}`: senza la classe `enhanced` i quattro
video di scrub **non esistono nel layout**.

**Secondo 0–1.** Il video hero (`#welcome-video`) ha `preload="none"` e
`data-load-timeout="3000"`. Non e' un `<video>` con `src`: e' un elemento vuoto
che un modulo riempie con `{basepath}{breakpoint}{_2x}.mp4`. A xlarge 2x sono
**4,56 MB**; a small 1x sono **869 KB**. Sotto c'e' un `<picture>` "startframe"
gia' scaricato che copre il buco.

**Secondo 1–3.** `main.built.js` (180 KB compressi, 692 KB veri) monta 103
componenti dichiarati in `data-component-list`. I piu' frequenti:
`StaggeredFadeIn` (23), `Card WillChange` (23), `Modal` (16),
**`VideoScrubLoader` (4)**.

**Poi, e solo poi, lo scroll.** Ogni media pesante ha due finestre di scroll
distinte, dichiarate nel DOM:

- una **finestra di scarico** (`data-video-load-kf`) che inizia **2–2,5
  schermate prima** che l'elemento entri in vista: `a0t - 200vh` per la
  fotocamera e la batteria, `a0t - 230vh` per le prestazioni, `a0t - 250vh` per
  la fusion camera;
- una o piu' **finestre di avanzamento** (`data-video-progress-kf-*`) che legano
  la posizione di scroll al fotogramma.

Anche le immagini hanno la loro: `data-download-area-keyframe` compare **76
volte** e `data-lazy` **133 volte**. Nessuna immagine sotto la piega viene
scaricata finche' lo scroll non entra nella sua area.

---

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| `#cameras-video-scrub` | telefono che ruota, 238 fotogrammi | scroll, 2 keyframe | nessun easing: due segmenti lineari 0→0,87 e 0,87→1 | il "momento" della pagina |
| `#fusion-camera-video-scrub` | modulo fotocamera dal basso, 91 fotogrammi, **con alfa** | scroll, 1 keyframe per fascia (`breakpointMask`) | lineare | `data-alpha="true"` |
| `#performance-battery-hero` | interno che si illumina, 93 fotogrammi (desktop) / **75 (telefono)** | scroll, 2 keyframe su desktop, 1 su telefono | due segmenti 0→0,55 e 0,55→1 | animazione **diversa** sul telefono, non solo piu' piccola |
| `#performance-battery-battery-life` | batteria, 131 fotogrammi | scroll, 2 keyframe | 0→0,5 e 0,5→1 | |
| `#welcome-video`, `#performance-chip-media`, 6 video di `highlights`, `#ncf-gallery-video*` | animazioni a tempo | **entrata in vista**, non scroll | riproduzione normale | e' il modulo `InlineMedia`, non lo scrub |
| `.product-viewer-component` | modello 3D navigabile | **puntatore/dito**, non scroll | inerzia del renderer | WebGL2, libreria `lotus.min.js` |
| `StaggeredFadeIn` (23 occorrenze) | testi che entrano a cascata | entrata in vista | non verificato | `data-staggered-item` sui figli |
| `WillChange` (26 occorrenze) | nessuna: mette e toglie `will-change` | entrata in vista | — | componente di sola igiene GPU |

**Non ho trovato GSAP, ScrollTrigger, Lenis, Framer Motion, Locomotive, ne'
`animation-timeline` CSS.** Apple ha un motore proprio, `@marcom/anim-system`,
con un linguaggio di ancoraggio testuale (vedi sotto). Coerente con il pattern
P2 del file `_PATTERN.md`: lo scroll non si sequestra — qui non si interpola
neanche, si legge e basta.

### Il linguaggio degli ancoraggi (da rubare)

Ogni keyframe e' un JSON dentro un attributo. La grammatica, dedotta dagli usi:

- `a0t`, `a0b`, `a1t` = **top/bottom dell'ancora 0, 1…** elencata in `anchors`;
- `t`, `b` = top/bottom dell'elemento stesso;
- offset in `vh` o `px`, sommabili: `"a0t - 100px - 75vh"`;
- `progress: [0.0, 0.87]` = a che porzione dell'animazione corrisponde quel tratto;
- `breakpointMask: ["small","xsmall"]` = questo keyframe vale solo su quelle fasce;
- `disabledWhen: ["no-inline-media","reduced-motion"]` = e questo si spegne in
  quegli stati di pagina.

Il pregio e' che **la coreografia sta nel markup, non nel JavaScript**. Si puo'
cambiare il ritmo di una sezione senza toccare una riga di codice.

---

### MOTORE A — lo scrub video (quello vivo, 2026)

Modulo `VideoScrub` + `VideoScrubLoader`, in `main.built.js`. Ricostruito dal
codice minificato, riscritto in chiaro:

```js
get videoExtension() {
  return this.isSafari ? (this._hasAlpha ? "mov" : "mp4") : "webm";
}
get videoURL() {
  return `${base}/${viewportName}${devicePixelRatio > 1 && retina ? "_2x" : ""}.${ext}`;
}
set progress(p) {
  this._progress = p;
  this.videoEl.currentTime = this.floorDecimal(this.duration * p); // 2 decimali
}
```

Fatti verificati, uno per uno:

1. **Un `<video>`, non un canvas, non `<img>`.** Lo scroll scrive
   `video.currentTime`. Niente `drawImage`, niente `requestVideoFrameCallback`.
2. **Il tempo e' quantizzato a 2 decimali** (`_fractionDigits = 2`,
   `Math.floor(t * 100) / 100`). A 60 fps un centesimo di secondo e' 0,6
   fotogrammi: la quantizzazione serve a non chiedere al decoder due seek
   diversi per lo stesso fotogramma.
3. **Il video non deve mai partire**: `videoEl.addEventListener("play", () =>
   videoEl.pause())`. Al `durationchange` fa `play().then(pause)` — un avvio
   forzato e immediatamente annullato, per costringere il decoder a preparare il
   primo fotogramma — e poi nasconde e rimostra l'elemento
   (`style.display = "none"` seguito da `requestAnimationFrame(() => style.display = null)`)
   per forzare un ridisegno.
4. **Due strade di caricamento, a seconda del browser.** Safari:
   `video.src = url`, e basta. **Chrome/Firefox: Media Source Extensions.**
   ```js
   const ms = new MediaSource();
   ms.addEventListener("sourceopen", async () => {
     const sb = ms.addSourceBuffer('video/webm;codecs="vp9"');
     const reader = (await fetch(url)).body.getReader();
     // appendBuffer chunk per chunk, aspettando onupdateend
   });
   video.src = URL.createObjectURL(ms);
   ```
   Cioe' **il file viene infilato nel decoder pezzo per pezzo mentre arriva**, e
   diventa scrubbabile prima di essere completo.
5. **C'e' un budget di tempo, e se scade la pagina si arrende.**
   `videoLoadTimeoutDuration = data-load-timeout || 6000` ms. Se scade:
   ```js
   this.fullPageFallback
     ? pem.trigger(Events.STATE_CHANGE_INITIATED, "video scrub timed out")  // tutta la pagina torna statica
     : super.onUnenhance();                                                 // solo questo componente
   ```
   I quattro scrub di iPhone Air hanno `data-page-fallback=true`: **se uno dei
   quattro video non arriva in 6 secondi, l'intera pagina smette di essere
   animata** e mostra le `<picture>` di riserva. Non degrada il singolo pezzo:
   degrada tutto, per non lasciare una pagina meta' viva e meta' morta.
6. **Cosa si vede intanto.** Un `<picture>` "startframe" in
   `position:absolute` sopra il video. Il CSS:
   ```css
   .video-scrub-container .startframe-container { position: absolute }
   .video-scrub-container.loaded .startframe-container { opacity: 0 }
   ```
   La classe `loaded` la mette il JS (`_updateControllerState`) sul contenitore
   e su ogni `[data-video-scroll-controller="<id>"]`. Le classi possibili sono
   `loading`, `loaded`, `loading-error`.
7. **`clip-path: inset(1px)` sul `<video>`.** Taglia un pixel per lato: elimina
   la frangia sul bordo dei video ridimensionati e di quelli con alfa.

### I numeri veri dei quattro scrub (misurati con ffprobe)

| scrub | fascia | risoluzione | fps | durata | **fotogrammi** | keyframe | GOP | webm | mp4/mov |
|---|---|---|---|---|---|---|---|---|---|
| camera-hero | large_2x | 800×1600 | 60 | 3,967 s | **238** | 60 | **~4** | 3,58 MB | 3,03 MB (mp4) |
| camera-hero | large | 400×800 | 60 | 3,967 s | 238 | 60 | ~4 | 1,25 MB | 1,51 MB |
| camera-hero | medium_2x | — | 60 | 3,967 s | 238 | — | — | 2,69 MB | 2,43 MB |
| camera-hero | small_2x | 600×1200 | 60 | 3,967 s | 238 | 60 | ~4 | 1,74 MB | 1,52 MB |
| camera-hero | small | 300×600 | 60 | 3,967 s | 238 | 60 | ~4 | 682 KB | 775 KB |
| camera-bottom (alfa) | large_2x | 1580×1696 | 30 | 3,033 s | **91** | 23 | ~4 | 1,95 MB | 3,16 MB (**mov**) |
| camera-bottom (alfa) | small | 670×418 | 30 | 3,033 s | 91 | — | — | 552 KB | 956 KB |
| performance | large_2x | 2900×1700 | 30 | 3,100 s | **93** | 24 | ~3,9 | 2,25 MB | 3,17 MB (mov) |
| performance | small | 950×600 | 30 | **2,500 s** | **75** | 19 | ~3,9 | 751 KB | 742 KB |
| battery | large_2x | 520×1096 | 60 | 2,184 s | **131** | 33 | ~4 | 2,18 MB | 1,79 MB (mov) |
| battery | large | 346×730 | 60 | 2,184 s | 131 | 33 | ~4 | 1,17 MB | 961 KB |
| battery | small | 234×490 | 60 | 2,184 s | 131 | 33 | ~4 | 732 KB | 592 KB |

**Il numero piu' importante di tutta la scheda: GOP ≈ 4.** Un keyframe ogni
quattro fotogrammi (60 keyframe su 238; 33 su 131; 23 su 91). Quasi
intra-only. **Questo, e non altro, e' cio' che rende scrubbabile un video.** La
codifica normale (GOP 250) obbliga il decoder a ricostruire fino a 249
fotogrammi a ogni seek all'indietro; con GOP 4 ne ricostruisce al massimo tre.
Il prezzo e' il peso: un articolo di terzi che ha misurato la stessa cosa
(https://muffinman.io/blog/scrubbing-videos-using-javascript/) trova che
passando da un keyframe ogni 100 a uno ogni 5 il file cresce di **circa cinque
volte** (146 KB → 845 KB in mp4, 195 KB → 1038 KB in webm).

**Formato per browser, verificato nel codice**: Safari `.mp4` (o `.mov` HEVC con
alfa, tag `hvc1`); tutti gli altri `.webm` VP9 (`alpha_mode=1` quando serve
l'alfa). Nessun AV1, nessun HLS, nessun DASH.

**Peso totale dei quattro scrub, alla fascia peggiore (large_2x, Chrome/webm):**
3,58 + 1,95 + 2,25 + 2,18 = **9,96 MB**. Su Safari (mp4/mov): 3,03 + 3,16 +
3,17 + 1,79 = **11,15 MB**. Su telefono (small, webm): 0,68 + 0,55 + 0,75 +
0,73 = **2,71 MB**.

---

### MOTORE B — la sequenza di fotogrammi su canvas (quello storico)

**Nessuna pagina prodotto Apple viva oggi usa piu' una sequenza di immagini.**
Verificato: ho cercato `data-sequence-basepath` e `<canvas>` in 23 pagine
prodotto attuali (iphone-17, iphone-17-pro, iphone-air, airpods-pro,
airpods-max, apple-vision-pro, apple-watch-ultra-3, apple-watch-series-11,
macbook-pro, macbook-air, ipad-pro, ipad-air, ipad-mini, imac, mac-studio,
mac-mini, mac, watch, apple-tv-4k, airtag, homepod, iphone-16e). **Zero
occorrenze di `data-sequence-basepath`.**

Ma **il motore e' ancora nel bundle** della pagina Vision Pro
(`/v/apple-vision-pro/k/built/scripts/main.built.js`, 262 KB), registrato nella
mappa dei componenti come `Sequence`. Ed e' il codice piu' utile di tutta questa
ricerca, perche' e' esattamente la tecnica che usiamo noi. Riscritto in chiaro:

```js
// 1. manifesto per fascia di viewport
//    {basePath}/{large|medium|small}/sequence_manifest.json  ->  { "numFrames": "200" }
// 2. un solo <canvas>, contesto 2D, dimensionato sul primo fotogramma
this.ctx = canvas.getContext("2d");
this.once(FIRST_IMAGE_LOADED, img => this.setSize(img.naturalWidth, img.naturalHeight));

// 3. i file: {basePath}/{viewport}/{indice a 4 cifre}.jpg   ->  0000.jpg … 0199.jpg
img.src = `${this.baseUrl}/${String(i).padStart(4, "0")}.jpg`;

// 4. ORDINE DI CARICAMENTO: suddivisione binaria ricorsiva
splitArray(arr, idx, depth) {           // prende SEMPRE l'elemento centrale
  const mid = Math.floor(idx.length / 2);
  arr[idx[mid]] = { value: arr[idx[mid]], bucket: depth };
  splitArray(arr, idx.slice(0, mid), depth + 1);
  splitArray(arr, idx.slice(mid + 1), depth + 1);
}
// bucket 0 = 1 fotogramma (il centro)
// bucket 1 = 2 fotogrammi (i quarti)
// bucket 2 = 4 fotogrammi (gli ottavi) … e cosi' via
// si carica un bucket alla volta, con Promise.all, e solo se inLoadArea === true

// 5. prima ancora dei bucket: primo, ultimo, e i "priorityFrames" scelti a mano
loadImage(0); loadImage(numImages - 1); await loadPriorityFrames();

// 6. se il fotogramma richiesto non c'e' ancora, NON si lascia il buco:
renderIndex(i) {
  if (this.images[i]) return this.drawImage(i);
  // cerca all'indietro il piu' vicino caricato; se non c'e', in avanti
}

// 7. il colore di sfondo insegue il fotogramma
updateFillColor() {
  const px = this.ctx.getImageData(0, 0, 1, 1).data;   // pixel in alto a sinistra
  this.fillCtx.fillStyle = `rgb(${px[0]}, ${px[1]}, ${px[2]})`;
  this.fillCtx.fill();                                  // su un secondo canvas [data-sequence-fill]
}

// 8. progresso
set progress(p) { this.desiredIndex = Math.round(p * this.images.length); this.renderIndex(...); }

// 9. al cambio di fascia (tranne X<->L) distrugge tutto e riscarica il manifesto
```

**Perche' la suddivisione binaria e' la cosa da rubare.** Caricare i fotogrammi
in ordine 0,1,2,3… vuol dire che finche' non sei all'80% del download hai solo
l'80% iniziale dell'animazione. Con i bucket, dopo **7 fotogrammi su 200** hai
gia' un campione uniforme dell'intera sequenza (inizio, fine, meta', quarti,
ottavi): l'animazione e' gia' scrubbabile per tutta la sua lunghezza, solo a
scatti, e si infittisce mentre scorri. Unita al punto 6 (mostra il piu' vicino
caricato) non si vede **mai** un fotogramma vuoto.

### I numeri veri della sequenza Vision Pro (2024) — asset ancora online

Markup recuperato dall'archivio
(https://web.archive.org/web/20240210120000/https://www.apple.com/apple-vision-pro/):

```html
<canvas class="image-sequence" data-component-list="Sequence"
  data-sequence-basepath="/105/media/us/apple-vision-pro/2024/6e1432b2-fe09-4113-a1af-f20987bcfeee/anim/360/"
  data-sequence-progress-kf='{"start":"a1b - 20vh","end":"a0b - 100vh",
      "anchors":[".section-design .anchor-highlight",".section-design .hero-headline"]}'
  data-sequence-load-kf='{"start":"a0t - 350vh","end":"a1t", ...}'
  data-loading-indicators aria-label="360-degree view of person wearing Apple Vision Pro"></canvas>
```

I file rispondono ancora sul CDN Apple. Misurati oggi, uno per uno:

| fascia | manifesto `numFrames` | risoluzione (fotogramma 0100) | peso totale | medio | min–max |
|---|---|---|---|---|---|
| large | **200** | **1220×1172** | **28,35 MB** | 149 KB | 56,5 – 187 KB |
| medium | 200 | 894×860 | **15,49 MB** | 78 KB | 34 – 103 KB |
| small | 200 | 768×736 | **12,27 MB** | 61 KB | 29 – 81 KB |

Formato: **JPEG**, nomi `0000.jpg`…`0199.jpg`, padding 4. **Nessuna variante
`_2x`**: una sola risoluzione per fascia, il canvas ci si adatta. La finestra di
scarico e' `a0t - 350vh`: **tre schermate e mezzo di anticipo** per 28 MB.

### I numeri veri della sequenza AirPods Pro (2019) — la piu' grossa mai fatta

Il bundle del 2019
(https://web.archive.org/web/20191101032025js_/https://www.apple.com/v/airpods-pro/a/built/scripts/main.built.js)
contiene un **manifesto dei pesi inline**, `{ viewport: { sequenza: { assets: { "0000.jpg": KB, … } } } }`.
L'ho estratto e sommato:

| sotto-sequenza | fotogrammi | large | medium | small |
|---|---|---|---|---|
| 01-hero-lightpass | 150 | 8.072 KB | 4.539 KB | 2.257 KB |
| 02-head-bob-turn | 132 | 10.061 KB | 5.105 KB | 3.243 KB |
| 03-flip-for-guts | 90 | 3.030 KB | 1.503 KB | 851 KB |
| 04-explode-tips | 142 | 5.234 KB | 2.608 KB | 1.497 KB |
| 05-flip-for-nc | 144 | 4.469 KB | 2.009 KB | 1.134 KB |
| 06-transparency-head | 177 | 13.501 KB | 7.064 KB | 6.397 KB |
| 07-flip-reveal-guts | 72 (**98 su small**) | 3.193 KB | 1.745 KB | 1.890 KB |
| 08-turn-for-chip | 92 | 3.574 KB | 1.900 KB | 2.171 KB |
| 09-scoop-turn | 236 | 8.359 KB | 4.479 KB | 3.990 KB |
| 10-fall-into-case | 292 | 8.098 KB | 4.322 KB | 3.823 KB |
| **TOTALE** | **1.527** (1.553 su small) | **66,01 MB** | **34,45 MB** | **26,61 MB** |

Configurazione dal codice (`components/ScrollSequence`):

- `numPadding = 4`, percorso
  `/105/media/us/airpods-pro/2019/1299e2f5_9206_4470_b28e_08307a42f19b/anim/sequence/{viewport}`;
- **`retinaEnabled = false`** — Apple ha deliberatamente rinunciato al 2x su una
  pagina fatta di 1.527 JPEG. A 66 MB il retina non era pagabile;
- `priorityFrames` scelti a mano per ogni sotto-sequenza (es. hero:
  `[0, 80, 120, 137]`; fall-into-case: `[0, 26, 52, 96, 194, 231, 244]`) — sono
  le pose "buone", quelle che devono esserci prima delle altre;
- una sonda sulla GPU: legge `WEBGL_debug_renderer_info` e, se il renderer
  contiene `iris` o `intel`, crea il contesto con
  `powerPreference: "high-performance"`. Cioe' su Mac con grafica integrata
  chiede esplicitamente la scheda discreta.

**Confronto che vale tutta la ricerca.** Stessa idea, stessa casa, sette anni di
distanza:

| | AirPods Pro 2019 | iPhone Air 2025-26 |
|---|---|---|
| tecnica | 1.527 JPEG su canvas | 4 video VP9/HEVC scrubbati |
| fotogrammi | 1.527 | 533 in tutto (238+91+93+131) |
| peso desktop | **66 MB** | **~10 MB** |
| peso telefono | 26,6 MB | 2,7 MB |
| richieste | ~1.527 | 4 |
| retina | no | si' (`_2x`) |

**Un sesto del peso, un terzo dei fotogrammi, quattro richieste invece di
millecinquecento, e in piu' il retina.** Se rifate questa tecnica nel 2026,
questa riga e' la risposta alla domanda "canvas o video".

---

## Colori

Letti dalle variabili CSS in `/v/iphone-air/h/built/styles/overview.built.css`.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo chiaro | `#ffffff` (`rgb(255,255,255)`) | `--sk-body-background-color`, fondo del `body` |
| fondo alternato | `#f5f5f7` (`rgb(245,245,247)`) | `--global-section-background-color-alt`, sezioni "background-alt" |
| testo | `#1d1d1f` (`rgb(29,29,31)`) | `--sk-body-text-color`, `--sk-headline-text-color` |
| testo su scuro | `#f5f5f7` (`rgb(245,245,247)`) | `.theme-dark` |
| fondo scuro | `#000000` | `.theme-dark` body; `--global-section-background-color-alt-dark: rgb(29,29,31)` |
| **testo delle sezioni prodotto** | **`#606f7f`** | `.section-product-story{--sk-body-text-color:#606f7f}` — grigio-azzurro, non nero |
| link | `#0066cc` (`rgb(0,102,204)`) | `--sk-body-link-color` |
| accento / focus | `#0071e3` | `--sk-focus-color`, `--aap-accent-color: rgb(0,113,227)` |
| grigio di servizio | `#86868b` | intestazioni di colonna, testo disabilitato |
| bordi / superfici chiare | `#d2d2d7` | `--localnav-pricing`, keyline |
| localnav scuro | `#121212`, bordo `#282828`, sfondo sfocato `rgba(0,0,0,0.8)` | barra di navigazione locale in tema scuro |
| vetro (Liquid Glass) | `rgba(232,232,237,0.72)` chiaro / `rgba(51,51,54,0.7)` scuro, `blur 7px` | `--aap-background-color`, `--aap-blur` |

**Colori del prodotto**, dichiarati come variabili (utili perche' sono i colori
esatti delle finiture):

```css
--finish-air-sky-blue:  #e3f1fa;
--finish-air-light-gold:#faf2e3;
--finish-air-white:     #fcfcfc;
--finish-air-space-black:#000;
```

Il fondo delle sezioni non e' piatto: `gradient-fill-tertiary-to-bottom` /
`-to-top` sulle sezioni `#highlights`, `#design`, `#performance`,
`#shared-features`. E i titoli grossi hanno `gradient-text gradient-text-60`.

---

## Tipografia

**Un solo carattere per tutta la pagina**: SF Pro, in due tagli
(`SF Pro Display` per i titoli, `SF Pro Text` per il corpo), piu' `SF Pro Icons`.
Servito da Apple stessa: `<link rel="stylesheet" href="/wss/fonts?families=SF+Pro,v3|SF+Pro+Icons,v3">`.
**Zero richieste a Google Fonts** — coerente con P9 del file `_PATTERN.md`, dove
lo stesso vale per 15 siti premiati su 16.

Fallback dichiarato ovunque: `Helvetica Neue, Helvetica, Arial, sans-serif`.

| livello | famiglia | peso | corpo | interlinea | crenatura | note |
|---|---|---|---|---|---|---|
| titolo di sezione (`typography-ps-headline-super`) | SF Pro Display | 400 | **48 px** ≥1069px · **40 px** ≤1068px · **32 px** ≤734px | 1,083 · 1,10 · 1,125 | −0,003em · 0 · +0,004em | il titolone della pagina |
| occhiello (`typography-ps-headline-eyebrow`) | SF Pro Display | 400 | 21 px · 19 px · **17 px** (passa a **SF Pro Text**) | 1,190 · 1,211 · 1,235 | +0,011em · +0,012em · −0,022em | "Cameras", "Design" |
| corpo di sezione (`typography-ps-body`) | SF Pro Display | 400 | 21 px | 1,381 | +0,011em | |
| dato/statistica (`typography-ps-stat`) | SF Pro Display | 400 | 19 px | 1,211 | +0,012em | |
| corpo (`body`) | SF Pro Text | 400 | 17 px | 1,471 | −0,022em | |

**Il rapporto tipografico e' 48/17 = 2,8x.** Nel file `_PATTERN.md` i siti
premiati stanno fra 6x e 14x (Mosby 14,6x, Vero 12x, NOTHIN' 6,7x). **Apple sta
a un quinto di quel salto.** E' una scelta opposta e consapevole: qui non deve
stupire la tipografia, deve stupire l'oggetto. Chi copia "il look Apple" mettendo
titoli da 160 px sta copiando gli altri, non Apple.

Dettaglio da rubare: **al passaggio sotto i 734 px l'occhiello cambia famiglia**,
da SF Pro Display a SF Pro Text, e la crenatura passa da +0,011em a −0,022em.
Non e' solo un corpo ridotto: e' un altro carattere, tagliato per i corpi
piccoli.

---

## Testi veri

Titoli, testuali dall'HTML.

- `<h1>` — **iPhone Air**
- Sommario hero — **The thinnest iPhone ever. With the power of pro inside.**
- **Get the highlights.**
- **So this is what the future feels like.**
- Sezione **Design** → *Take a closer look.*
- Sezione **Cameras** → **New front. New rear. New cam-era.**
  - *18MP Center Stage front camera. It's a total frame changer.*
  - *Smile. It's the world's favorite camera.*
  - *Brilliant photos and pro-style video? Yes, please.*
  - *Next-generation portraits.* · *Latest-generation Photographic Styles.* ·
    *Low-light and Night mode photography.* · *Pro videos.* · *2x Telephoto.* ·
    *Clean Up.* · *Camera Control.*
- Sezione **Performance and battery life** → **Power in a new light.**
  - *A19 Pro chip and C1X modem. Hyperspeed. Hyperefficient.*
  - *All-day battery life is just the beginning.*
- Sezione **All in the family** → **All the must-haves. All on iPhone.**
  - *iOS 26. New look. Even more magic.* · *Liquid Glass.* ·
    *A more vibrant Lock Screen.* · *Call Screening.* · *Hold Assist.* ·
    *Polls in Messages.*
  - *Apple Intelligence. Effortlessly helpful every day.* ·
    *Visual intelligence.* · *Live Translation.* · *Genmoji.* · *Writing Tools.*
  - *Connectivity. Stay connected. On and off the grid.* · *eSIM.* ·
    *Messages via satellite.* · *Roadside Assistance via satellite.* ·
    *Emergency SOS via satellite.* · *Crash Detection.* · *Find My.*
- **Worth the upgrade? Absolutely.**
- Sezione **Accessories** → **All dressed up and everywhere to go.**
  - *Bump up the beauty.* · *Get carried away.* · *Go all out without plugging in.*
- **Upgrade to iPhone.** · **Switching from Android to iPhone is simple.**
- **Why Apple is the best place to shop iPhone.**
- **iPhone Air and the environment.**
  - *Made with 35% recycled material by weight.*
  - *Manufactured with 45% renewable electricity.*
  - *Ships in compact packaging for 10% more units per trip.*
- **Our values lead the way.** · *Privacy. That's Apple.*
- **Questions? Answers.** (14 domande in accordion)
- **Keep exploring iPhone.** · **Compare latest iPhone models.**
- `<title>` — **iPhone Air - Apple**

Chiamate all'azione: *Buy*, *View in your space* (link `rel="ar"` a un `.usdz`),
*Watch the film*, *Learn more*.

Menu locale (localnav): **iPhone Air** / *Overview* / *Tech Specs* / *Buy*.

**Le etichette di accessibilita' sono descrizioni registiche complete.** Vale la
pena copiarle come metodo, perche' dicono esattamente cosa succede in ogni
animazione:

> `aria-label="iPhone Air, side exterior, floating up and is caught by a person's thumb and forefinger"`
> `aria-label="Animation of iPhone Air rotating, Sky Blue color, front exterior, side exterior, back exterior, Fusion camera system in plateau at top"`
> `aria-label="A19 Pro chip rotating and falling smoothly onto glowing interior iPhone components"`

I `<video>` di scrub hanno invece `aria-hidden="true"` e l'etichetta sta sul
contenitore, che ha `role="img"`. **Un'animazione decorativa e' un'immagine, non
un video**: lo screen reader legge una descrizione e non trova controlli.

---

## Mobile

**E' la sezione piu' importante, e la risposta e' brutale: sul telefono, molto
spesso, questa pagina non e' animata affatto.**

### Il cancello: `enhanced` contro `base`

`head.built.js` esegue in testa una lista di validatori. **Se anche uno solo
risponde "vero", la classe `enhanced` non viene messa su `<html>` e la pagina
diventa statica**: i `VideoScrub` hanno
`IS_SUPPORTED() { return document.documentElement.classList.contains("enhanced") }`,
e il CSS tiene `.video-scrub-container{display:none}` senza quella classe.

La lista, testuale dal bundle:

```js
const u = [ AlphaVideoUnsupported, Android, AOW, InvalidViewport,
            LowPowerMode, ReducedMotion, RTViewer, SmallDesktop ];
(new PageExperienceManagerHead).featureDetect({ [ClassNames.ENHANCED]: [...u], ... });
```

Cosa fa scattare ciascuno, dal codice:

| validatore | condizione | causa registrata |
|---|---|---|
| **Android** | `uaDetect.os.android` | `"android"` |
| **ReducedMotion** | `matchMedia("(prefers-reduced-motion)").matches` | `"reduced motion"` |
| **InvalidViewport** | cinque media query (sotto) | `"invalid viewport"` |
| **SmallDesktop** | `!touchAvailable && matchMedia("(max-width: 734px)")` | `"small on desktop"` |
| **LowPowerMode** | inietta un `<video autoplay muted>` base64 nascosto e guarda se parte | — |
| **AlphaVideoUnsupported** | inietta un `.mov` alfa base64 (Safari) o webm e aspetta `loadeddata` | — |
| **RTViewer** | `!canvas.getContext("webgl2")`; su touch+Safari anche iOS < 16.5 | `"browser or device not supported - webgl2 not supported"` |
| **AOW** | `<html class="aow">` | `"aow"` |

E le cinque `InvalidViewport`, testuali:

```js
smallWide:   "(min-width: 481px) and (max-width: 734px)",
smallShort:  "(max-width: 734px) and (max-height: 500px)",
smallTall:   "(max-width: 734px) and (min-height: 927px)",
mediumShort: "(min-width: 735px) and (max-width: 1068px) and (max-height: 520px)",
largeShort:  "(min-width: 1069px) and (max-height: 620px)"
```

**Conseguenze concrete, e sono grosse.**

1. **Ogni telefono Android riceve la pagina statica.** Non una versione ridotta:
   nessun scrub, nessuna animazione legata allo scroll, solo `<picture>`. Una
   riga di codice.
2. **Su iPhone la finestra utile e' strettissima.** Perche' l'esperienza animata
   parta servono, insieme: larghezza ≤ 480 px (altrimenti `smallWide`), altezza
   fra 501 e 926 px (altrimenti `smallShort` o `smallTall`). Un iPhone con
   viewport 393×852 passa. **Un iPhone con viewport 430×932 non passa**: 932 ≥
   927, scatta `smallTall`. I modelli Max e Plus piu' recenti finiscono in base.
3. **Ruotare il telefono in orizzontale spegne tutto** (`smallShort`,
   altezza ≤ 500 px).
4. **Modalita' risparmio energetico attiva = pagina statica.**
5. **Restringere la finestra del browser sul desktop sotto 734 px = pagina
   statica** (`SmallDesktop`, perche' non c'e' touch).
6. **La pagina richiede WebGL2** anche solo per le animazioni video, perche'
   `RTViewer` sta nella lista dell'`enhanced` (serve al visore 3D della sezione
   Design).

### Cosa cambia quando invece l'esperienza animata parte sul telefono

Tre livelli di adattamento, tutti dichiarati nel markup:

**Livello 1 — sostituzione di fascia.** Ogni video porta una mappa:
`data-video-breakpoint-substitution-map='{"xlarge":"large","xsmall":"small"}'`.
Le fasce sono cinque (`xlarge, large, medium, small, xsmall`) ma i file
esistono per tre (`large, medium, small`): il resto e' rimappato. Verificato:
`.../camera-hero/xlarge.webm` risponde **404**, `large.webm` risponde 200.

**Livello 2 — altra scatola, altra inquadratura.** Le dimensioni sono variabili
CSS per fascia:

| scrub | large | medium | small |
|---|---|---|---|
| camera-hero | 400×800 (ritratto 1:2) | 400×800 | 300×600 |
| fusion-camera | 790×848 (quasi quadrato, 0,93) | 668×696 | **670×418 (orizzontale, 1,60)** |
| performance | 1450×850 | 1100×600 | 950×600 |
| battery | 346×730 | 344×724 | 234×490 |

La fusion camera **cambia proporzione**, da quasi quadrata a francamente
orizzontale. Non e' lo stesso filmato ridimensionato: e' **un'altra
inquadratura**, ritagliata piu' larga e piu' bassa perche' sul telefono
l'altezza e' la risorsa scarsa.

**Livello 3 — altra animazione e altra coreografia.** Il caso `performance`:

- large_2x: 2900×1700, **93 fotogrammi**, 3,10 s
- small: 950×600, **75 fotogrammi**, 2,50 s

**Diciotto fotogrammi in meno e sei decimi in meno di durata.** Sul telefono
girano un montaggio piu' corto. E la mappatura scroll→fotogramma e' un'altra:

```
desktop:  kf1  a0t - 65vh  ->  a0t + 100px   progress 0    -> 0.55
          kf2  a0t + 100px ->  a0t + 90vh    progress 0.55 -> 1.0
telefono: kf1  a0t - 100vh ->  a0t + 100vh   progress 0    -> 1.0     breakpointMask ["small","xsmall"]
```

Su desktop due segmenti con una pausa a meta'; sul telefono **un solo segmento
lineare su due schermate**. Stessa cosa per la fusion camera: su desktop lo
scrub e' agganciato a due ancore diverse (`.subsection-fusion-camera` e
`.garage-container`), sul telefono a una sola, su 75vh.

**Livello 4 — il retina non e' sempre 2x.** Il video `battery` ha scatola CSS
346×730 e asset `large_2x` da **520×1096**, cioe' 1,5× e non 2×. Apple taglia
la risoluzione dove il contenuto lo permette invece di rispettare il rapporto.

### Cosa resta comunque

Testi, immagini `<picture>` con quattro fasce e variante 2x, accordion, galleria,
prezzi, confronto modelli, footer. La pagina base **e' una pagina completa e
vendibile**: non e' un ripiego, e' il progetto di partenza su cui l'animazione e'
un'aggiunta. E' questo che rende sostenibile spegnerla a cuor leggero.

---

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| framework | **nessuno**. HTML servito dal server, JavaScript a componenti dichiarati con `data-component-list` | VERIFICATO | nessuna traccia di React/Vue/Next/Nuxt nei bundle; l'HTML contiene gia' tutti i testi |
| motore componenti | `@marcom/bubble-gum` + `ComponentMap` | VERIFICATO | nomi di modulo nel bundle 2019 non offuscato; mappa dei componenti in `main.built.js` |
| motore di animazione | `@marcom/anim-system` — proprietario. `createScrollGroup`, `addKeyframe`, `addDiscreteEvent` | VERIFICATO | firme dei metodi nel bundle |
| **GSAP / ScrollTrigger** | **assenti** | VERIFICATO | zero occorrenze in `main.built.js` (692 KB) e `head.built.js` |
| **Lenis / smooth scroll** | **assente** | VERIFICATO | nessuna libreria di interpolazione; si legge la posizione nativa |
| **CSS scroll-driven** (`animation-timeline`) | **assente** | VERIFICATO | zero occorrenze in `overview.built.css` (1,13 MB) |
| scrub video | modulo proprio `VideoScrub` / `VideoScrubLoader`; **MediaSource Extensions + VP9** fuori da Safari | VERIFICATO | codice riportato sopra |
| sequenza a fotogrammi | modulo proprio `Sequence` + `ImageSequencePlayer`, canvas 2D | VERIFICATO ma **non attivo** su nessuna pagina viva | presente nel bundle Vision Pro, nessun `data-sequence-basepath` in 23 pagine |
| 3D in tempo reale | `lotus.min.js`, **1,56 MB** — contiene `THREE` (228 occorrenze), **DRACO** (16+13), **KTX2/basis** (17+22+14), `GLTF` (60), `webgl2`, `WebGPU` (2) | VERIFICATO | scaricato e cercato per firma |
| AR | Quick Look nativo, file `.usdz` | VERIFICATO | `<a rel="ar" href="....usdz">` |
| immagini | `<picture>` con 4 fasce + `2x`, sorgente iniziale una GIF trasparente 1×1 in base64, scambiata da `data-lazy` + `data-download-area-keyframe` | VERIFICATO | 631 URL immagine unici nell'HTML |
| font | SF Pro auto-ospitato via `/wss/fonts?families=SF+Pro,v3` | VERIFICATO | tag `<link>` |
| analytics | Adobe (`ac-analytics` 2.30.0, `eVar70`, `eVar153`) — traccia **anche se la pagina e' finita in base e perche'** | VERIFICATO | `trackPageState()` invia `"{PAGE_NAME} | base"` + `causeForBase` |
| CMS | non verificato | — | l'HTML e' generato ma la sorgente non e' esposta |
| hosting | Apple, `server: Apple`; media su `/105/media/...` con `accept-ranges: bytes` e `access-control-allow-origin: *` | VERIFICATO | intestazioni HTTP |

---

## Peso e prestazioni

Misure vere, prese oggi con `curl` (dimensione compressa = quello che passa in
rete; dimensione vera = quello che il browser deve elaborare).

| risorsa | compresso | vero |
|---|---|---|
| HTML `/iphone-air/` | **107,5 KB** | 792,8 KB |
| CSS `overview.built.css` | **100,9 KB** | 1.131,1 KB |
| JS `main.built.js` | **180,1 KB** | 691,9 KB |
| JS `head.built.js` | non misurato | 77,6 KB |
| JS `globalheader.umd.js` | non misurato | 166,3 KB |
| JS `lotus.min.js` (3D, caricato a richiesta) | non misurato | **1.560,3 KB** |

**Somma dei quattro bundle principali, non compressi: ~2,49 MB** (3D escluso:
1,03 MB). Confronto con il file `_PATTERN.md`, dove i siti premiati stanno fra
735 KB e 2,98 MB: Apple e' esattamente nella stessa fascia, ma con **zero
librerie di terze parti**.

Media, tutte a caricamento differito legato allo scroll:

| gruppo | desktop | telefono |
|---|---|---|
| immagini `<picture>` (124 file `_large`) | **5,72 MB** · con `_2x`: **13,93 MB** | 102 file `_small`: **2,56 MB** · `_small_2x`: **6,17 MB** |
| 4 video di scrub | webm 2x: **9,96 MB** · mp4/mov 2x: **11,15 MB** | small webm: **2,71 MB** |
| video hero (`welcome`) | xlarge_2x **4,56 MB** · large_2x 3,03 MB | small 869 KB · small_2x 1,76 MB |
| ~12 video "inline media" (highlights, chip, selfie, dual capture, ecc.) | non sommati singolarmente | — |

**Stima onesta del caso peggiore desktop** (retina, Chrome, scroll completo,
senza il visore 3D e senza i video inline): 2,49 MB di codice + 13,93 MB di
immagini + 9,96 MB di scrub + 4,56 MB di hero ≈ **31 MB**. Con il visore 3D e i
video inline si supera comodamente i 40 MB.

**Su telefono, quando l'esperienza animata parte**: 1,03 MB di codice + 2,56 MB
di immagini + 2,71 MB di scrub + 0,87 MB di hero ≈ **7,2 MB**.

**In stato base (Android, reduced-motion, low power, viewport fuori intervallo):**
solo codice + immagini, **nessun byte di video**. ≈ 3,6 MB.

Cache: i video hanno `cache-control: max-age` fra 180 e 3600 s — bassissimo, e
`accept-ranges: bytes`. Le immagini e i bundle non li ho misurati.

**Quello che non ho**: nessun Lighthouse, nessun LCP/CLS/INP, nessun FPS durante
lo scrub. Servirebbe un browser e in questa ricerca non ne ho aperto uno.

---

## Tre cose da rubare

**1. Il keyframe ogni quattro fotogrammi, e i due segmenti al posto dell'easing.**
Un video scrubbabile non e' un video normale: e' un video codificato quasi
intra-only. In pratica:
```bash
# webm per tutti tranne Safari
ffmpeg -i in.mov -c:v libvpx-vp9 -g 4 -crf 28 -b:v 0 -an out.webm
# mp4 per Safari
ffmpeg -i in.mov -c:v libx264 -x264-params keyint=4:min-keyint=4 -crf 20 -an out.mp4
```
E la decelerazione non si fa con una curva: si fa spezzando la mappa
scroll→tempo in due tratti con pendenze diverse (0→0,87 in 85vh, poi 0,87→1 in
90vh). Piu' facile da regolare a occhio e piu' facile da spiegare a un cliente.

**2. La suddivisione binaria dei fotogrammi, se davvero servono immagini.**
Se il canvas e' obbligatorio (alfa complessa, interattivita' sul singolo
fotogramma), non caricate 0,1,2,3… Ordinate gli indici prendendo sempre il
centro dell'intervallo residuo, caricate un livello alla volta, e quando il
fotogramma richiesto manca disegnate **il piu' vicino gia' caricato** cercando
prima all'indietro e poi in avanti. Dopo sette immagini l'animazione e' gia'
percorribile da capo a fondo. Aggiungete `updateFillColor()`: leggete il pixel
(0,0) con `getImageData` e riempite lo sfondo di quel colore, cosi' il
fotogramma non ha mai un bordo visibile.

**3. Il cancello unico `enhanced` con la causa registrata, e il timeout che
spegne tutto.** Una sola classe su `<html>` decide se la pagina e' animata. Il
CSS nasconde i contenitori animati in sua assenza; i componenti si rifiutano di
montarsi. Poi due difese: un budget di 6 secondi per il caricamento di ogni
media pesante, scaduto il quale la **pagina intera** torna statica invece di
restare meta' viva; e l'invio ad analytics della **causa** del declassamento
(`"reduced motion"`, `"android"`, `"invalid viewport"`, `"small on desktop"`),
cosi' si sa quanti utenti hanno visto l'animazione e perche' gli altri no. Questa
terza parte e' quella che nessuno copia mai, ed e' quella che rende la tecnica
sostenibile.

---

## Non verificato

- **Nessuna misura di rendering.** Non ho aperto un browser: niente FPS durante
  lo scrub, niente LCP/CLS/INP, niente Lighthouse, nessun profilo di memoria.
  Le mappe scroll→fotogramma sono lette dagli attributi, non campionate. Chi le
  rifa' deve misurarle, come dice l'avvertenza in `_PATTERN.md`.
- **La semantica esatta di `ease: 1`** nel keyframe di default
  (`{start:"a0t - 100vh", end:"a0b", progress:[0,1], ease:1}`) del modulo
  `VideoScrub`. Nessuno dei quattro scrub di iPhone Air lo usa — tutti passano
  keyframe espliciti senza `ease` — quindi non l'ho inseguito nel motore.
- **Il comportamento reale in stato base.** So cosa il codice spegne, non ho
  visto come appare la pagina risultante.
- **Il visore 3D (`lotus.min.js`, 1,56 MB).** Ho verificato le firme (THREE,
  DRACO, KTX2, GLTF, WebGL2, WebGPU) ma non ho aperto i modelli, non so quante
  mesh, che texture, che peso hanno gli asset 3D.
- **I ~12 video "inline media"** (highlights, chip, selfie, dual capture): ho
  letto il modulo e i basepath, non ho sommato i pesi di tutte le fasce.
- **Il campo `AOW`** fra i validatori: causa `"aow"`, dipende da una classe
  `aow` messa da qualcun altro. Non so cosa sia.
- **Il totale reale della pagina.** Le stime di peso qui sopra sono somme di
  `content-length` per gruppi, non un log di rete: non tengono conto di cio' che
  il browser scarica davvero in un dato percorso di scroll ne' delle risorse di
  terze parti (analytics, header/footer globali, pricing).
- **La sequenza a fotogrammi di Vision Pro 2024**: il markup e' dall'archivio e
  i file rispondono ancora, ma **non ho la certezza che quella pagina, quel
  giorno, li usasse davvero** con quei parametri. Il manifesto e i 200 JPEG per
  fascia invece sono misurati oggi, uno per uno (199 su 200 hanno risposto in
  `large`, uno ha dato errore transitorio).
- **Le pagine escluse.** Ho confermato l'assenza di sequenze a fotogrammi su 23
  pagine prodotto `apple.com` in inglese-USA. Non ho controllato le pagine
  locali (it, jp, cn), ne' le pagine campagna, ne' `apple.com/newsroom`.
