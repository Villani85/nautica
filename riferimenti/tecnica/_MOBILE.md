# Cosa spengono davvero i siti da premio sul telefono

Misurato il **13 agosto 2026** con `curl`, due user agent, sui siti gia'
schedati in questa cartella.

**Non duplica** `_PRESTAZIONI.md` (i numeri di Apple e i due dati falsi che
circolano) ne' `_TEMPI.md` (il telefono come **fase** di progetto, il decimo
mese su quattordici, le ore a preventivo). Qui c'e' una cosa sola: **la
differenza fra la versione da schermo grande e quella da telefono, misurata**.

Metodo, dichiarato una volta per tutte:

- **user agent desktop**: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)
  AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36`
- **user agent iPhone**: `Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)
  AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148
  Safari/604.1`
- `curl -sS -L --compressed` — quindi **byte trasferiti compressi**, come li
  vede la rete del telefono.
- Ogni coppia e' stata **ricontrollata con un terzo tiro allo stesso user agent
  del primo**, per separare la differenza vera dal rumore (nonce CSP, id di
  tracciamento, test A/B, ordine dei chunk). Senza questo controllo si scrivono
  quattro conclusioni sbagliate su quattro: vedi la sezione "Le quattro finte
  differenze".

> **MISURATO** = l'ho scaricato o letto nel bundle vivo oggi.
> **DEDOTTO** = ricavato dal codice ma non eseguito.
> **DA FONTE** = viene da una fonte esterna, con URL.

---

## IL DATO PIU' IMPORTANTE, IN UNA RIGA

Su **29 siti serviti con due user agent diversi, uno solo cambia davvero
l'HTML**: `obys.agency`.

Tutti gli altri **28 mandano lo stesso identico documento** — nella maggior
parte dei casi **byte per byte, hash MD5 identico**. Compresa `apple.com`, che
ha il sistema di degradazione piu' sofisticato del web (quindici validatori,
`_PRESTAZIONI.md`) e che comunque **non differenzia niente lato server**.

**Non e' una critica: e' l'architettura.** La decisione sul telefono non si
prende sul server, si prende nel browser. Ma cambia completamente cosa si puo'
misurare da fuori e cosa si deve andare a leggere nel codice — ed e' il motivo
per cui la seconda meta' di questo documento e' fatta di grep sui bundle e non
di tabelle di byte.

---

## 1. LA TABELLA — 29 siti, due user agent

Colonne: byte dell'HTML scaricato (compresso), differenza percentuale, se
l'hash MD5 e' identico, e i conteggi `desktop/telefono` dei tag che contano.

| sito | B desktop | B iPhone | diff % | MD5 uguale | `<script src>` | `<img>` | `<video>` | `<canvas>` | `<section>` | URL distinti | testo (char) |
|---|---:|---:|---:|:---:|---|---|---|---|---|---|---|
| **obys.agency** | 90.245 | **24.849** | **-72,5%** | **NO** | 1/1 | **38/19** | 0/0 | **1/0** | 0/1 | 47/46 | **12.451/2.987** |
| lusion.co | 58.598 | 58.598 | 0,0% | SI | 2/2 | 0/0 | 0/0 | 3/3 | 0/0 | 34/34 | 3.678/3.678 |
| igloo.inc | 1.410 | 1.410 | 0,0% | SI | 1/1 | 0/0 | 0/0 | 0/0 | 0/0 | 3/3 | 37/37 |
| basement.studio | 222.978 | 222.978 | 0,0% | SI | 31/31 | 64/64 | 0/0 | 0/0 | 3/3 | 120/120 | 138.346/138.346 |
| darkroom.engineering | 467.301 | 467.301 | 0,0% | SI | 16/16 | 0/0 | 4/4 | 0/0 | 10/10 | 79/79 | 94.136/94.136 |
| locomotive.ca | 65.822 | 65.822 | 0,0% | SI | 4/4 | 7/7 | 1/1 | 1/1 | 2/2 | 63/63 | 25.105/25.105 |
| immersive-g.com | 438.961 | 438.961 | 0,0% | SI | 1/1 | 39/39 | 0/0 | 2/2 | 18/18 | 89/89 | 372.542/372.542 |
| hellomonday.com | 226.058 | 226.058 | 0,0% | SI | 2/2 | 2/2 | 3/3 | 1/1 | 3/3 | 58/58 | 16.061/16.061 |
| cuberto.com | 153.553 | 153.553 | 0,0% | SI | 1/1 | 31/31 | 12/12 | 0/0 | 11/11 | 84/84 | 90.243/90.243 |
| zajno.com | 10.959 | 10.959 | 0,0% | SI | 1/1 | 1/1 | 0/0 | 0/0 | 0/0 | 10/10 | 7.239/7.239 |
| resn.co.nz | 4.292 | 4.292 | 0,0% | SI | 3/3 | 1/1 | 0/0 | 0/0 | 0/0 | 5/5 | 1.760/1.760 |
| revelatio.studio | 525.713 | 525.713 | 0,0% | SI | 30/30 | 94/94 | 0/0 | 1/1 | 0/0 | 130/130 | 23.638/23.638 |
| mosbyfiles.com | 283.999 | 283.999 | 0,0% | SI | 1/1 | 9/9 | 0/0 | 0/0 | 1/1 | 35/35 | 251.177/251.177 |
| 2xa.studio | 122.890 | 122.879 | -0,01% | no* | 2/2 | 2/2 | 8/8 | 0/0 | 0/0 | 27/27 | 13.421/13.421 |
| aristidebenoist.com | 4.453 | 4.453 | 0,0% | SI | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 8/8 | 2.163/2.163 |
| activetheory.net | 5.952 | 5.952 | 0,0% | SI | 1/1 | 0/0 | 0/0 | 0/0 | 0/0 | 8/8 | 3.300/3.300 |
| trionn.com | 152.463 | 152.463 | 0,0% | SI | 20/20 | 18/18 | 4/4 | 0/0 | 4/4 | 63/63 | 28.436/28.436 |
| dontboardme.com | 377.984 | 377.984 | 0,0% | SI | 1/1 | 30/30 | 0/0 | 0/0 | 7/7 | 55/55 | 82.573/82.573 |
| by-kin.com | 135.748 | 135.748 | 0,0% | SI | 14/14 | 22/22 | 0/0 | 0/0 | 1/1 | 56/56 | 74.874/74.874 |
| landonorris.com | 218.897 | 218.897 | 0,0% | SI | 12/12 | 133/133 | 0/0 | **21/21** | 12/12 | 130/130 | 30.038/30.038 |
| opalcamera.com/opal-tadpole | 46.023 | 46.023 | 0,0% | SI | 11/11 | 1/1 | 0/0 | 1/1 | 1/1 | 21/21 | 15.725/15.725 |
| verostudio.com | 188.563 | 188.521 | -0,02% | no* | 26/26 | 21/21 | 2/2 | 0/0 | 8/8 | 83/83 | 87.488/87.460 |
| apple.com/iphone-air | 792.832 | 792.848 | +0,002% | no* | 11/11 | 276/276 | 16/16 | 0/0 | 20/20 | 416/416 | 187.269/187.587 |
| dark.netflix.io | 5.315 | 5.315 | 0,0% | SI | 2/2 | 0/0 | 0/0 | 0/0 | 0/0 | 17/17 | 1.349/1.349 |
| kprverse.com | 618.160 | 618.160 | 0,0% | no* | 1/1 | 8/8 | 0/0 | 0/0 | 0/0 | 177/177 | 553.478/553.478 |
| noomoagency.com | 106.254 | 106.254 | 0,0% | SI | 1/1 | 42/42 | 0/0 | 0/0 | 0/0 | 74/74 | 80.630/80.630 |
| persepolis.getty.edu | 3.739 | 3.739 | 0,0% | SI | 3/3 | 0/0 | 0/0 | 0/0 | 0/0 | 11/11 | 1.497/1.497 |
| franshalsmuseum.nl/en | 911.473 | 911.473 | 0,0% | SI | 25/25 | 73/73 | 0/0 | 0/0 | 2/2 | 99/99 | 522.660/522.660 |
| staratlas.com | 41.449 | 41.449 | 0,0% | SI | 2/2 | 19/19 | 8/8 | 0/0 | 4/4 | 53/53 | 18.835/18.835 |

`no*` = hash diverso ma **differenza non dovuta al dispositivo**: vedi sotto.

Esclusi: `pangrampangram.com` e `manayerbamate.com`, entrambi **403 da
Cloudflare** su `curl` con tutti e due gli user agent (bot management). Non
misurabili con questo metodo.

### Le quattro finte differenze — il controllo che salva dall'errore

Quattro siti hanno restituito hash diversi fra desktop e iPhone. **Nessuna delle
quattro differenze dipende dal dispositivo.** L'ho verificato rifacendo la
richiesta **allo stesso user agent desktop** e confrontando con il primo tiro:

| sito | cosa cambiava | esito del controllo desktop-vs-desktop |
|---|---|---|
| **obys.agency** | 65 KB di HTML, 19 immagini, 745 `<div>` | **identico al primo tiro tranne il `nonce` della CSP** -> la differenza col telefono e' **vera** |
| **2xa.studio** | i `<source>` dei video puntano a file diversi (`dither.mp4` <-> `no-signal.mp4` <-> `tiles.mp4`) | **diverso anche fra due desktop** -> e' una **rotazione casuale** dei video a ogni richiesta, non un ramo mobile |
| **verostudio.com** | 42 byte: `<meta name="sentry-trace">` | id di tracciamento casuale |
| **apple.com** | `variationId: "A"` / `"B"` e una lista di tab di navigazione | **su 6 tiri: desktop B,A,A e iPhone A,A,B** -> **test A/B casuale**, non dispositivo |
| **kprverse.com** | un blocco `<style>` in piu' sul desktop | ordine dei chunk in streaming, diverso anche fra due desktop |

> **Regola di metodo, riusabile:** una differenza fra due user agent non vale
> niente finche' non l'hai riprodotta contro un terzo tiro allo stesso user
> agent. Qui il rumore avrebbe prodotto **4 falsi positivi su 5 differenze**.

### L'unico caso vero: obys.agency

Gia' schedato in `obys.md` come "non e' responsive: sono due siti". **Confermato
oggi, con i numeri**:

| | desktop | iPhone | diff |
|---|---:|---:|---:|
| HTML compresso | 90.245 B | 24.849 B | **-72,5%** |
| HTML senza `<script>`/`<style>` | 86.810 B | 21.473 B | **-75,3%** |
| `<div>` nel body | **758** | **13** | **-98,3%** |
| `<a>` nel body | 194 | 22 | **-88,7%** |
| `<img>` nel body | 38 | 19 | **-50,0%** |
| testo estratto | 12.451 char | 2.987 char | **-76,0%** |

Cosa manca sul telefono: **tutto il catalogo lavori**. Sul desktop i 19 progetti
(Makhno, Source Unknown, Autex, Odin's Crow, Olga Prudka, Yulia, Miro, Design
Education Series, Obys' Design Books, Eminente, Abetka, BlackSheep, Salience
Labs, AI Modernism of Kharkiv, Glyphic Biotechnologies, Porsche Taycan, Ayocin,
Grids, Peter Lindbergh) sono scritti **due volte** nell'HTML — perche' la
striscia scorrevole ha bisogno del duplicato — con titolo, disciplina e numero
d'ordine. Sul telefono nel testo restano **tre parole: `Work`, `About`,
`Contact`**. Le 19 immagini ci sono ancora (in una griglia, con `srcSet` a
`500w`/`660w`), il testo no.

**Il `<canvas>` sparisce dall'HTML servito al telefono.** MISURATO: 1 sul
desktop, 0 sull'iPhone.

---

## 2. LE DECISIONI RICORRENTI, CERCATE NEL CODICE

247 file JavaScript scaricati dai bundle vivi (~28 MB non compressi) di 19 siti.
Conteggio delle occorrenze per marcatore:

| sito | KB JS | `matchMedia` | `isMobile` | touch | `devicePixelRatio` | `setPixelRatio` | sniff UA | `prefers-reduced-motion` | `dvh/svh/lvh` | `100vh` | bloom | particle | postprocess | `syncTouch` | Lenis | giroscopio |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| basement | 2.928 | 12 | 10 | 6 | 8 | 5 | 15 | 5 | 13 | 4 | 0 | 0 | 0 | 0 | 0 | 0 |
| by-kin | 683 | 19 | 3 | 10 | 0 | 0 | 2 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 14 | 0 |
| cuberto | 278 | 21 | 0 | 17 | 0 | 0 | 5 | 0 | 0 | 1 | 0 | 0 | 0 | 8 | 37 | 0 |
| darkroom | 1.804 | 19 | 6 | 8 | 6 | 0 | 12 | 4 | 4 | 5 | 0 | 0 | 0 | 20 | 104 | 0 |
| dontboardme | 915 | 25 | 0 | 9 | 1 | 0 | 12 | 0 | 0 | 2 | 0 | 0 | 0 | 7 | 20 | 0 |
| hellomonday | 1.701 | 7 | 7 | 0 | 6 | 0 | 10 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| igloo | 16 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| immersive-g | 2.917 | 7 | 8 | 13 | 5 | 2 | 27 | 0 | 0 | 1 | **36** | 3 | 0 | 9 | 57 | **5** |
| landonorris | 1.670 | 20 | 0 | 13 | **20** | **9** | 14 | 1 | 0 | 1 | 0 | 0 | 0 | 9 | 72 | 0 |
| locomotive | 2.551 | 16 | 8 | 8 | 7 | **11** | 24 | 0 | 0 | 0 | 0 | 0 | 0 | 8 | 35 | 0 |
| lusion | 1.279 | **0** | **25** | 1 | 8 | 1 | 13 | 0 | 0 | 0 | 16 | **129** | 23 | 0 | 0 | **18** |
| mosby | 2.991 | 24 | 0 | 12 | 3 | 0 | 7 | 0 | 0 | 2 | 0 | 0 | 0 | 8 | 56 | 0 |
| opal | 1.209 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | **16** | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| resn | 153 | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| revelatio | 746 | 32 | 2 | 13 | 2 | 0 | 16 | 5 | 0 | 1 | 2 | 9 | 0 | 0 | 0 | 0 |
| trionn | 1.692 | **36** | 0 | 23 | 4 | 3 | 6 | 1 | 6 | 4 | 0 | 16 | 0 | 10 | 58 | 0 |
| vero | 1.832 | 7 | 0 | 3 | 5 | 0 | 21 | 2 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2xa | 735 | 19 | 0 | 10 | 1 | 5 | 5 | 1 | 0 | 1 | 0 | 0 | 0 | 8 | 17 | 0 |
| zajno | 1.280 | 0 | 6 | 0 | 2 | 0 | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

(`isMobile` di zajno e' **falso positivo**: viene dal pixel di Facebook, non dal
loro codice. `matchMedia` a 0 su lusion e zajno e' vero: usano lo sniffing.)

Quello che si legge in questa tabella prima ancora dei dettagli:

- **`hardwareConcurrency`: 0 occorrenze su 19 siti. `deviceMemory`: 0 su 19.**
  Nessuno guarda quanti core o quanta RAM ha il telefono. Il web premiato decide
  con lo user agent o con una media query, non con le capacita' reali.
- **Nessun `adaptiveDpr`/`PerformanceMonitor` di drei in nessuno dei 19.** Il
  degrado adattivo a frame rate — che `messenger-e-bruno-simon.md` documenta —
  e' l'eccezione, non la norma.

### 2.1 Chi spegne il WebGL del tutto

Solo due casi, e sono gli stessi due che hanno una versione alternativa vera.

**`aristidebenoist.com` — MISURATO oggi.** L'`index.html` (4.453 B) contiene
dodici righe che scelgono la build, ancora con il refuso `Andrdoid` nel sorgente:

    const n = /Mobi|Andrdoid|Tablet|iPad|iPhone/.test(e.userAgent)
              || "MacIntel" === e.platform && e.maxTouchPoints > 1 ? "m" : "d";
    s.href = "/static/css/" + n + ".css?" + _A.config.v;
    a.src  = "/static/js/"  + n + ".js?"  + _A.config.v;
    t.onreadystatechange = e => { "complete" === t.readyState && t.body.appendChild(a) }

Peso delle due build, scaricate tutte e quattro:

| file | compresso | non compresso |
|---|---:|---:|
| `d.js` | 22.660 B | 69.520 B |
| `m.js` | **5.776 B** | **14.662 B** |
| `d.css` | 2.218 B | 9.485 B |
| `m.css` | **706 B** | **2.712 B** |
| **totale** | 24.878 -> **6.482 B** | 79.005 -> **17.374 B** |
| **diff** | **-73,9%** | **-78,0%** |

E dentro `m.js`, contati uno per uno:

| marcatore | `d.js` | `m.js` |
|---|---:|---:|
| `getContext` | 3 | **0** |
| `webgl` | 2 | **0** |
| `createShader` | 1 | **0** |
| `gl_FragColor` | 1 | **0** |
| `uniform ` | 12 | **0** |
| `canvas` | 4 | **0** |
| `vec2`/`vec3`/`texture2D` | 1 | **0** |

**Sul telefono lo strato WebGL non e' spento: non e' proprio nel file
scaricato.** E' l'unico modo per cui il telefono non paga neanche il byte.

**`obys.agency`** — il `<canvas>` sparisce dall'HTML servito all'iPhone
(1 -> 0, MISURATO). Il sostituto e' un filtro CSS con lo stesso contrasto,
gia' documentato in `obys.md`.

**Tutti gli altri tengono il WebGL acceso sul telefono.** Nessuno dei 24 fogli
di stile analizzati ha una sola regola che nasconda un `canvas` dentro una media
query sotto i 1100 px: **0 occorrenze su 24 siti**. Chi ha un canvas lo fa
girare anche sull'iPhone.

### 2.2 Chi abbassa il DPR — e chi lo alza

Il caso piu' istruttivo e' `landonorris.com`, **Site of the Year 2025**. Il
codice vivo oggi:

    this.pixelRatio = this.width > 768
        ? Math.min(window.devicePixelRatio, 1.25)   // schermo grande
        : Math.min(window.devicePixelRatio, 2);      // telefono

**Il tetto sul telefono e' piu' alto che sul desktop: 2 contro 1,25.** Conferma
misurata di quello che `lando-norris.md` chiamava "DPR invertito". La ragione e'
sana: sullo schermo grande la scena occupa 2560x1440 pixel logici e il costo
cresce col quadrato; sul telefono occupa 390x844, e a 1,25 si vedrebbero i
gradini sui bordi. **Il numero di pixel da disegnare, non il dispositivo, e' la
variabile che conta.** Stesso principio in `umami-land.md` (1x desktop, >=1,5x
telefono).

`lusion.co` fa la stessa cosa con un tetto assoluto invece che con un ramo:

    DPR = Math.min(1.5, browser.devicePixelRatio) || 1;
    USE_PIXEL_LIMIT = true;
    MAX_PIXEL_COUNT = 2560 * 1440;      // 3.686.400 px
    MOBILE_WIDTH = 812;
    IS_SMALL_SCREEN = Math.min(window.screen.width, window.screen.height) <= 820;

Un solo numero — **3.686.400 pixel** — regola tutte le macchine. Niente `if
mobile`. E' la forma piu' pulita che ho trovato, ed e' anche la piu' facile da
copiare.

`immersive-g.com` non usa ne' l'uno ne' l'altro: usa **detect-gpu**, e legge una
tabella di prestazioni indicizzata su due assi:

    function Va(u) {
      const i = W.gpu.tierName.toLowerCase();
      const e = W.gpu.isMobile ? "mobile" : "desktop";
      return u.performances[i][e];
    }
    this._options = { shadows: W.gpu.tier > Hs.BAD };
    this._onlyOneRenderAtOnce = W.gpu.tier <= Hs.BAD || !W.device.desktop;

Cioe': **sul telefono si disegna un solo oggetto per fotogramma**, sempre,
qualunque sia la GPU. E le ombre si accendono solo sopra il tier `BAD`.

`resn`, `mosby`, `by-kin`, `revelatio`, `vero`, `dontboardme`, `cuberto`: zero
`setPixelRatio`. Non hanno un canvas principale da tarare.

### 2.3 Chi riduce le particelle e chi toglie la post-produzione

Qui la risposta e' scomoda: **quasi nessuno**.

- **`lusion.co` — il caso vero, MISURATO.** Non riduce le particelle: riduce
  **la geometria e le texture**, caricando file diversi.

      properties.loader.add(settings.MODEL_PATH + "home/" +
          (browser.isMobile ? "cross_ld" : "cross") + ".buf", ...)
      properties.loader.add(`${settings.TEXTURE_PATH}home/${
          browser.isMobile ? "matcap_ld" : "matcap"}.exr`, ...)

  `_ld` = *low detail*. Scaricati tutti e quattro:

  | file | desktop | telefono | diff |
  |---|---:|---:|---:|
  | `models/home/cross.buf` | 282.676 B | 123.984 B | **-56,1%** |
  | `textures/home/matcap.exr` | 602.702 B | 172.380 B | **-71,4%** |
  | **totale** | **885.378 B** | **296.364 B** | **-66,5%** |

  In piu' il reel della home cambia file — ma **non per dispositivo, per
  larghezza**, e viene riscambiato a caldo quando ruoti il telefono:

      this.isVerticalVideo = properties.viewportWidth <= 560;
      this.video.src = settings.TEXTURE_PATH +
          (this.isVerticalVideo ? "reel/mobile.mp4" : "reel/desktop.mp4");

  | | byte |
  |---|---:|
  | `textures/reel/desktop.mp4` | 4.980.580 |
  | `textures/reel/mobile.mp4` | **2.267.388** |
  | **diff** | **-54,5%** |

  E ancora, sempre in `lusion`: `USE_AUDIO = isSupportOgg && !browser.isMobile`
  (l'audio non parte proprio, vedi `_SUONO.md`), e un array di materiali che
  sul telefono **resta piu' corto**: `browser.isMobile || sphereData.push({...
  GLASS}, {... })` — le sfere di vetro e le bianco-e-nero non entrano nemmeno
  nella scena.

- **`immersive-g.com`** non spegne il bloom: **ritara lo shader**.

      uBrightnessFactor: { value: this._isMobile ? .5 : .6 }
      uBrightnessOffset: { value: this._isMobile ? .6 : .4 }

  E cambia il set di texture con un ternario che vale per **due condizioni
  insieme**: `const t = Je.fallbacks.mobile_or_lowTier ? "ultralow" : "low"`,
  che porta a `/webgl/about/model/textures/ktx2/{ultralow|low}/normal_0N.ktx2`.

  **Qui c'e' la sorpresa della ricerca.** Ho scaricato tutti e dodici i file:

  | file | `low` (desktop) | `ultralow` (telefono/GPU scarsa) | diff |
  |---|---:|---:|---:|
  | `normal_01.ktx2` | 1.010.443 | 1.126.477 | +11,5% |
  | `normal_02.ktx2` | 1.686.259 | 1.860.637 | +10,3% |
  | `normal_03.ktx2` | 1.479.271 | 1.683.043 | +13,8% |
  | `normal_04.ktx2` | 1.679.842 | 2.041.861 | +21,6% |
  | `normal_05.ktx2` | 2.078.893 | 2.301.978 | +10,7% |
  | `normal_06.ktx2` | 1.450.733 | 2.165.540 | +49,3% |
  | **totale** | **9.385.441 B** | **11.179.536 B** | **+19,1%** |

  I file sono davvero diversi (MD5 diversi sui primi 200 KB, verificato). **Il
  ramo "ultralow" pesa il 19% in piu' del ramo "low".** Probabile spiegazione
  (DEDOTTO, non verificato): `ultralow` significa meno pixel ma un formato di
  compressione GPU meno efficiente in transcodifica — UASTC invece di ETC1S —
  perche' i colori piatti reggono male ETC1S. **Se e' cosi', "meno dettaglio" ha
  fatto risparmiare memoria video al telefono e gli ha fatto pagare 1,8 MB di
  rete in piu'.** Va tenuto come avvertimento: *chiamare un asset "low" non lo
  rende leggero — pesarlo si.*

- **`basement.studio`** — il bloom sulla loro home gira **solo su meta' dei
  pixel** (scacchiera nel fragment shader, documentato in `basement.md`). Ma
  **non e' una decisione sul telefono**: e' cosi' ovunque. E nella cronologia
  git ci sono i commit `disable bloom on mobile`, `Disable mobile particles`,
  `don't display videos at all on mobile (#321)`, tutti del **giorno del
  lancio** (contati in `_TEMPI.md`).

- **`trionn.com`** — 16 occorrenze di `particle`, ma sono particelle **DOM**, non
  WebGL: un `<div style="position:fixed;inset:0;mix-blend-mode:difference">` che
  ospita elementi HTML. **Nessun ramo che ne riduca il numero sul telefono.**

- **`revelatio.studio`** — 9 occorrenze di `particle`, nessun ramo mobile.

**Conclusione della sezione: su 19 bundle, uno solo (lusion) riduce davvero il
carico grafico sul telefono cambiando file. Uno (immersive-g) ritara i
parametri. Gli altri diciassette disegnano la stessa scena.**

### 2.4 Lo scorrimento fluido: chi lo sincronizza col tocco e chi no

`syncTouch` di Lenis e' l'opzione che fa *finta* che lo scorrimento inerziale
nativo di iOS non esista, e lo ridisegna in JavaScript. Il README di Lenis la
dichiara `false` di default e ci mette un avvertimento:

> `syncTouch` — *"Mimic touch device scroll while allowing scroll sync (**can be
> unstable on iOS<16**)"*.
> Limitazioni note: *"touch events may behave unexpectedly when `syncTouch` is
> enabled on iOS < 16"*.
> (fonte: `README.md` del repo `darkroomengineering/lenis`, letto oggi)

Chi la accende comunque, MISURATO nei bundle vivi:

| sito | `syncTouch` | altri valori sul tocco |
|---|:---:|---|
| **darkroom.engineering** | **acceso** | `lerp: .125`, `syncTouchLerp: .075`, `anchors: true`, `autoToggle: true` |
| **landonorris.com** | **acceso** | `lerp: 0.1`, `touchMultiplier: 2` |
| **trionn.com** | **acceso** | ramo iPhone: `touchMultiplier: 1.2`; ramo desktop: `1.1` |
| **immersive-g.com** | **acceso** | motore proprio: `touchMultiplier: .5` contro `wheelMultiplier: 1` |
| cuberto, mosby, 2xa, locomotive, dontboardme, by-kin | lasciato a `false` | — |

`trionn.com` e' l'unico dei diciannove che scrive un ramo esplicito per iPhone:

    const m = /iPhone|iPad|iPod/.test(navigator.platform);
    const x = m
      ? { easing:..., duration:1.05, smoothWheel:true, smoothTouch:false,
          wheelMultiplier:.6, touchMultiplier:1.2, syncTouch:true, lerp:.105 }
      : { easing:..., duration:1.05, smoothWheel:true, smoothTouch:false,
          wheelMultiplier: D ? .6 : .85, touchMultiplier:1.1, syncTouch:true, lerp:.105 };

Guardali bene: **fra i due rami cambia `touchMultiplier` di 0,1.** Il ramo
esiste, il progetto no.

`immersive-g.com` e' l'unico che ha capito da che parte sta il problema: il suo
`ScrollManager` proprio ha `defaultConfig = { wheelMultiplier: 1,
deltaMultiplier: .1, **touchMultiplier: .5**, speedMultiplier: .1, smoothAmount:
.035 }`. **Dimezza il tocco** — perche' una passata di dito produce un delta
molto piu' grande di una rotellina, e senza dimezzarlo lo scroll fluido sul
telefono "scappa".

---

## 3. IL DATO CHE CONTA: quanti hanno una versione alternativa vera

**Definizione operativa**, per non barare:

- **versione alternativa** = il telefono riceve **codice o markup diverso**,
  oppure **file di contenuto diversi** (video, texture, modelli);
- **rimpicciolimento** = stessi file, stesso codice, cambia solo l'impaginato
  via media query.

Su **29 siti misurati**, di cui **19 anche a livello di bundle**:

| classe | quanti | chi |
|---|---:|---|
| **A. Markup o build diversi** | **2** | `obys.agency` (HTML -72,5% dal server), `aristidebenoist.com` (due build, -73,9%) |
| **B. Sistema di degradazione dichiarato** | **1** | `apple.com` (15 validatori, classe `enhanced` tolta da `<html>`, 275 `<picture class="fallback-frame">`) |
| **C. Asset di contenuto diversi** | **4** | `darkroom.engineering` (-80,5% sui video), `lusion.co` (-66,5% geometria+texture, -54,5% reel), `cuberto.com` (-65,5% hero), `immersive-g.com` (texture diverse — **ma +19,1% di peso**) |
| **D. Meccanismo presente, rami identici** | **2** | `landonorris.com`, `locomotive.ca` — vedi sotto |
| **E. Solo rimpicciolimento** | **20** | tutti gli altri |

**Sette siti su ventinove — il 24% — fanno qualcosa di piu' che rimpicciolire.
Venti su ventinove — il 69% — mandano al telefono esattamente gli stessi
byte di contenuto.**

### I due rami morti — la parte piu' utile di tutta la ricerca

**`landonorris.com`**, Site of the Year 2025. Nel bundle vivo:

    createLenisInstance() {
      let J = { infinite:!1, lerp:0.1, smoothWheel:!0, touchMultiplier:2,
                autoResize:!0, syncTouch:!0 };
      if (this.isDesktop)
        return new sL({ ...J, wrapper: document.documentElement, content: document.body });
      else
        return new sL({ ...J, wrapper: document.documentElement, content: document.body });
    }

**I due rami sono identici carattere per carattere.** C'e' un `if` sul
dispositivo, c'e' un `handleResize` che lo ricontrolla, e non fa niente.

**`locomotive.ca`**, cioe' gli autori di `locomotive-scroll`. Il video della
home ha un meccanismo completo: due chiavi `desktop`/`mobile`, media query a
`699px`, poster separati. Ecco il dato reale nell'attributo, letto oggi:

    "desktop": { "src": "https://player.vimeo.com/.../792718372/rendition/1080p/file.mp4?...
                          signature=978abf9e4b33e3e143901fbcbf68e159d90d5eeb95ed25f8378d341514009cf8",
                 "poster": "uploads/home/poster_desktop.png" },
    "mobile":  { "src": "https://player.vimeo.com/.../792718372/rendition/1080p/file.mp4?...
                          signature=978abf9e4b33e3e143901fbcbf68e159d90d5eeb95ed25f8378d341514009cf8",
                 "poster": "uploads/home/poster_mobile.png" }

**Stesso id Vimeo, stessa resa 1080p, stessa firma: e' lo stesso file.** Cambia
solo il poster. Misurato:

| | desktop | telefono | diff |
|---|---:|---:|---:|
| poster | 553.895 B | 131.129 B | **-76,3%** |
| video | 8.230.862 B | 8.230.862 B | **0,0%** |
| **totale** | **8.784.757 B** | **8.361.991 B** | **-4,8%** |

Hanno ottimizzato il file da mezzo mega e lasciato intatto quello da otto.
**Il risparmio complessivo e' il 4,8%.**

> **La lezione: il meccanismo non e' il lavoro.** Costruire il ramo mobile e'
> mezza giornata. Produrre il contenuto alternativo — ricodificare il video,
> ridecimare il modello, rifare il montaggio verticale — sono i giorni veri. Due
> studi da premio su ventinove hanno costruito il meccanismo e non hanno mai
> prodotto il contenuto. Se in un preventivo la riga "telefono" e' una riga
> tecnica, finisce cosi'.

### L'onesta' di chi rimpicciolisce e basta: `kprverse.com`

Nel CSS servito c'e' il sistema di scala, in chiaro:

    site_scale: 1;  scale_mode: width;  breakpoints: mobile, desktop;
    breakpoint_mobile_width: 320;   breakpoint_mobile_design_width: 375;
    breakpoint_mobile_design_height: 667;
    breakpoint_mobile_scale_min: .8533333333;  breakpoint_mobile_scale_max: 2.728;
    breakpoint_desktop_width: 768;  breakpoint_desktop_design_width: 1600;
    breakpoint_desktop_design_height: 850;
    breakpoint_desktop_scale_min: .64;  breakpoint_desktop_scale_max: 1.2;

`scale_mode: width` — **tutto il disegno viene scalato sulla larghezza**. Due
impaginati (375x667 e 1600x850), stessi asset, e un fattore di scala che sul
telefono puo' arrivare a **2,728x**. E' rimpicciolire — ma dichiarato, con due
tavole di disegno vere e i limiti scritti. E' il modo giusto di rimpicciolire.

### E quello che nessuno guarda

**`navigator.hardwareConcurrency`: 0 occorrenze su 19 bundle.
`navigator.deviceMemory`: 0 su 19.**

Su ventinove siti da premio, **nessuno chiede al telefono quanti core e quanta
memoria ha.** Si guarda lo user agent, la larghezza, al massimo il tier della
GPU (solo immersive-g). Un iPhone 17 Pro e un Android da 120 euro ricevono la
stessa identica scena.

---

## 4. I DIFETTI CHE SI VEDONO SOLO SUL TELEFONO

### 4.1 `100vh` e la barra degli indirizzi — MISURATO, ed e' messo male

`100vh` su iOS Safari vale l'altezza dello schermo **con la barra nascosta**
(`lvh`). Con la barra visibile — cioe' quando la pagina si apre — la sezione e'
piu' alta della finestra: il fondo e' tagliato, e se dentro c'e' un pulsante,
quel pulsante non si vede. Poi scorri, la barra si ritira, la finestra cresce e
**tutto il layout salta**. Le unita' che risolvono sono `dvh` (dinamica), `svh`
(piccola, barra visibile), `lvh` (grande, barra nascosta).

Conteggio su 24 fogli di stile scaricati oggi (CSS esterno + `<style>` inline):

| sito | KB CSS | `100vh` | `100dvh` | `100svh` | `100lvh` |
|---|---:|---:|---:|---:|---:|
| **immersive-g** | 476 | **98** | 4 | 0 | 0 |
| **kprverse** | 158 | **30** | 0 | 0 | 0 |
| **landonorris** | 389 | **30** | 0 | 12 | 0 |
| apple | 1.634 | 20 | 5 | 1 | 0 |
| by-kin | 121 | 18 | 6 | 3 | 5 |
| locomotive | 201 | 17 | 2 | 1 | 0 |
| revelatio | 151 | 17 | 0 | 3 | 0 |
| dontboardme | 108 | 12 | 2 | 6 | 0 |
| **hellomonday** | 149 | **12** | 0 | 0 | 0 |
| noomo | 84 | 9 | 0 | 3 | 0 |
| basement | 111 | 4 | 6 | 5 | 0 |
| darkroom | 65 | 4 | 2 | 4 | 0 |
| cuberto | 77 | 4 | 0 | 3 | 5 |
| vero | 241 | 4 | 1 | 7 | **11** |
| persepolis | 77 | 4 | 0 | 0 | 0 |
| mosby | 70 | 3 | 0 | 0 | 0 |
| franshals | 171 | 2 | 0 | 0 | 0 |
| trionn | 99 | 2 | **13** | 3 | 0 |
| **2xa** | 98 | **0** | **20** | 0 | 0 |
| **lusion**, opal, obys, zajno, resn, dark.netflix | | **0** | 0 | 0 | 0 |
| activetheory | 2 | 2 | 0 | 0 | 0 |

- **`2xa.studio` e' l'unico che ha `100vh` a zero e usa solo `100dvh`.**
- `verostudio.com` e' l'unico che usa tutte e tre le unita' nuove, con `lvh` in
  maggioranza (11) — coerente con la sua barra d'acquisto `sticky bottom:50lvh`
  documentata in `vero.md`.
- `immersive-g.com` ha **98 `100vh`** in 476 KB di CSS. Il suo `active-theory.md`
  gemello risolve invece a mano: *"se `HYDRA_MOBILE_SCROLL` e' attivo il palco
  passa a `height: 100vh` con un `ResizeObserver`"* — cioe' ricalcola in
  JavaScript quello che `dvh` fa gratis.
- **`-webkit-fill-available`, il vecchio rimedio: 1 occorrenza su 24 siti**
  (noomo). E' morto, giustamente.

La libreria che serviva per questo — **`next-real-viewport`, 124 stelle, ferma a
ottobre 2023** — e' gia' segnata come obsoleta in `_LIBRERIE-DEGLI-STUDI.md`.
Confermato: **il problema si risolve con tre lettere di CSS, e meta' del web
premiato non le ha ancora scritte.**

### 4.2 Lo scorrimento fluido che litiga con quello nativo di iOS

Non e' un aneddoto: e' un elenco di segnalazioni con numero e data sul
repository di Lenis (`darkroomengineering/lenis`), letto oggi via API GitHub.
**DA FONTE**, tutte verificabili.

| # | titolo | aperta | commenti |
|---|---|---|---:|
| **200** | *Browser UI auto-hide with smooth touch enabled* | 2023-07-06 | 6 |
| **499** | *Mobile Safari `position: sticky` jitter (1px jump when stuck)* | 2026-02-08 | **15** |
| **454** | *Horizontal loop on mobile devices* | 2025-04-16 | 12 |
| **288** | *Scroll top problem only on IOS* | 2024-01-31 | 10 |
| **122** | *iOS Safari, Content Jumps on Scroll* | 2023-02-16 | **12** |
| **341** | *Scrolling stops/stutters on mobile* | 2024-05-27 | 8 |
| **433** | *Lazy loading images making scroll stop on mobile* | 2025-02-07 | 8 |
| **106** | *Scroll direction set to 0 on touch devices* | 2023-01-25 | 8 |
| **293** | *`data-lenis-prevent-touch` made the toolbar minimised on iOS* | 2024-02-08 | 2 |
| **203** | *pull-to-refresh on mobile jumps* | 2023-07-10 | 1 |
| **119** | *Prevent interface resize on mobile devices* | 2023-02-08 | 2 |
| **523** | *Text selection scrolls the page on iOS touch devices* | 2026-06-24 | 1 |
| **500** | *Framer: Horizontal Scrolling Triggers Links in Mobile Safari* | **aperta** 2026-02-12 | 5 |
| **315** | *`scrollTo` with `lock: true` does not stop ongoing touch move* | **aperta** 2024-03-12 | 4 |
| **487** | *Android `syncTouch` slow scrolling causes jitter* | 2025-11-05 | 1 |
| **301** | *Smooth scroll lagging on Safari **low power mode*** | 2024-02-15 | 1 |
| **33** | *Disable on mobile* | 2022-09-28 | 0 |

Da leggere in fila, questa tabella dice tre cose:

1. **La #33 e' la trentatreesima segnalazione della storia della libreria e si
   chiama "Disable on mobile".** La domanda "come lo spengo sul telefono" e'
   arrivata prima di quasi tutto il resto.
2. **Il gruppo piu' numeroso riguarda la barra del browser** (#200, #293, #119):
   lo scroll fluido in JavaScript **impedisce a iOS di nascondere la barra**,
   perche' iOS la nasconde solo su uno scroll nativo. Chi accende `syncTouch`
   regala allo schermo del telefono ~110 px in meno, per sempre.
3. **La #301 lega lo scroll fluido al Risparmio energetico.** E' la stessa
   condizione che Apple rileva col trucco del video base64 (`_PRESTAZIONI.md`) e
   che nessuno degli altri ventotto siti controlla.

Aggiornamento recente da segnalare, **DA FONTE**: la **#534** (*"Please respect
`prefers-reduced-motion`"*, 2026-07-31) ha prodotto in tre giorni la **#537**
(*"feat(core): respect `prefers-reduced-motion` by default"*, chiusa
2026-08-03). Fino a dieci giorni fa la libreria di scroll fluido piu' usata del
web **ignorava la preferenza di sistema per default** — il che spiega parecchio
dei punteggi di `_ACCESSIBILITA.md`.

### 4.3 Il calo di frame rate al primo tocco, e il surriscaldamento

**Qui devo essere netto: non ho misurato ne' il frame rate ne' la temperatura.**
Servono un telefono vero e un profiler, e questa ricerca e' fatta con `curl`.
Quello che ho sono le tracce nel codice e nelle segnalazioni, e le riporto per
quello che sono.

**Il primo tocco.** La causa strutturale e' documentata: la #433 di Lenis
(*"Lazy loading images making scroll stop on mobile"*, 8 commenti) e la #341
(*"Scrolling stops/stutters on mobile"*, 8 commenti). Il meccanismo (**DEDOTTO**
dal codice, non profilato): al primo `touchstart` partono insieme la
decodifica delle immagini entrate in viewport, la compilazione degli shader
rimasti indietro e il primo `appendBuffer` del video — su un thread solo. Il
contrappeso che i siti misurati **non hanno**: nessuno dei 19 bundle usa
`requestIdleCallback` per spalmare il lavoro, e nessuno precompila gli shader
prima del primo gesto tranne `immersive-g.com`, che ha un metodo `compile()`
esplicito:

    compile() { this._preCompiled || (this._preCompiled = !0,
                this.scene && this.$renderer.instance.compile(this.scene, ...)) }

**Il surriscaldamento.** Non l'ho misurato e **non esiste un'API che lo
esponga** — e' esattamente il motivo per cui Apple ha dovuto inventarsi la
rilevazione del Risparmio energetico dal rigetto di `play()` (`_PRESTAZIONI.md`).
Quello che si puo' dire con i numeri di questa ricerca:

- venti siti su ventinove mandano al telefono **gli stessi byte** del desktop;
- diciassette bundle su diciannove disegnano **la stessa scena** del desktop;
- **zero** su diciannove guardano `hardwareConcurrency` o `deviceMemory`;
- **zero** su diciannove hanno un degrado a frame rate.

Se il telefono scalda, non c'e' niente in nessuno di questi siti che se ne
accorga e riduca. **L'unico che si difende e' Apple, e lo fa perche' ha capito
che il Risparmio energetico e' l'unico segnale di surriscaldamento leggibile da
una pagina web.**

### 4.4 Il difetto che nessuno nomina: `hover` e `pointer`

Un effetto costruito sul passaggio del mouse, sul telefono, o non parte mai o —
peggio — resta acceso dopo il tocco. Il rimedio e' `@media (hover: hover)` e
`@media (pointer: coarse)`. Conteggio su 24 fogli di stile:

| sito | `hover: hover` | `pointer: coarse` |
|---|---:|---:|
| locomotive | 20 | 0 |
| lusion | 19 | 0 |
| dontboardme | 16 | 0 |
| apple | 10 | 0 |
| **cuberto** | 0 | **6** |
| darkroom | 6 | 0 |
| trionn | 4 | 0 |
| vero | 4 | 0 |
| franshals | 3 | 0 |
| mosby, revelatio, 2xa | 2 | revelatio 1 |
| **gli altri 13** | **0** | **0** |

**Meta' dei siti misurati non ha una sola regola che distingua un puntatore da
un dito.** E `cuberto.com` e' l'unico che usa `pointer: coarse` in modo
sistematico. Vedi anche `_ACCESSIBILITA.md` per il resto del quadro.

### 4.5 Quanto si spegne davvero, contato

Regole `display: none` dentro media query sotto i 1100 px, per sito:

| sito | blocchi `@media` mobile | `display:none` dentro |
|---|---:|---:|
| **landonorris** | 36 | **43** |
| apple | 1.352 | 28 |
| **dontboardme** | 155 | **27** |
| revelatio | 16 | 22 |
| locomotive | 186 | 21 |
| noomo | 114 | 20 |
| lusion | 175 | 16 |
| 2xa | 67 | 14 |
| kprverse | 174 | 9 |
| mosby | 154 | 6 |
| cuberto, vero | 13 / 14 | 4 |
| immersive-g | 136 | 2 |
| by-kin | 22 | 1 |
| basement, darkroom, hellomonday, opal, franshals, trionn | 0-6 | **0** |

`landonorris.com` **spegne 43 cose** sul telefono. Sugli asset si ferma allo
`srcset` automatico di Webflow (95 immagini, varianti `-p-500.webp 500w` e
`736w`): nessun video, nessun modello, nessuna texture alternativa.
`dontboardme.com` ne spegne 27 (`dont-board-me.md` ne contava 18 sotto 1024 px:
la differenza e' la soglia, io ho contato fino a 1100). **Sono i due che
"progettano il telefono" nel modo piu' economico possibile: nascondendo.**

All'estremo opposto, `darkroom.engineering` ha **zero** `@media` con `max-width`
nel suo CSS: il layout e' interamente a griglia fluida, e la decisione sul
dispositivo la prende in JavaScript con `useDeviceDetection()`:

    let l = breakpoints.dt;
    let c = useMediaQuery(`(max-width: ${l-1}px)`);   // isMobile
    let f = useMediaQuery(`(min-width: ${l}px)`);     // isDesktop
    ...
    return { isMobile, isDesktop, isReducedMotion, isWebGL, isTouchOnly, dpr, isSafari }

**Sette proprieta', una sola fonte di verita', ed e' una media query — non lo
user agent.** E' il modello migliore che ho trovato in tutta la ricerca, e vale
la pena copiarlo cosi' com'e'. Da li' esce anche la sostituzione dei video:

    M.current.src = H.asset.replace(/\.mp4$/, "-mobile.mp4")

Misurata (`darkroom.engineering`, tre video di progetto):

| video | desktop | `-mobile` | diff |
|---|---:|---:|---:|
| `ibicash-video-cinematic-01.mp4` | 6.172.647 B | 1.215.159 B | **-80,3%** |
| `_polyai-case-video-01-nocursor.mp4` | 1.043.109 B | 186.093 B | **-82,2%** |
| `oreo-video-01.mp4` | 720.154 B | 147.899 B | **-79,4%** |
| **totale** | **7.935.910 B** | **1.549.151 B** | **-80,5%** |
| `videos/SATUS.mp4` | 144.620 B | **404 — non esiste** | **0%** |

Anche il migliore ne dimentica uno: il video `SATUS` non ha il gemello mobile e
il telefono se lo scarica intero.

### 4.6 Chi sostituisce davvero il video con un'immagine

Conteggio dei tag nell'HTML servito, 29 siti:

| | apple | cuberto | darkroom | 2xa | staratlas | trionn | hellomonday | locomotive | vero | opal | tutti gli altri |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `<video>` | 16 | 12 | 4 | 8 | 8 | 4 | 3 | 1 | 2 | 0 | 0 |
| `poster=` | 0 | 0 | **4/4** | **8/8** | 7/8 | 0 | 0 | 0 | 0 | 0 | 0 |
| `preload="none"` | 12 | 11 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `<source media=...>` | **495** | 2 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | **0** |
| `<picture>` | **275** | 19 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | **0** |

**Fuori da Apple, il `<source media>` esiste su tre siti in tutto**, e uno dei
tre (locomotive) lo punta allo stesso file.

Le tre media query di Apple, contate: `(min-width:0px)` 275 volte,
`(max-width:734px)` 116, `(max-width:1068px)` 98, `(max-width:1440px)` 6. I
numeri e i 15 validatori stanno in `_PRESTAZIONI.md`: non li ripeto.

`cuberto.com` e' l'unico non-Apple che lo fa sul serio, e vale la pena leggerlo
per intero perche' e' due righe di HTML:

    <video preload="auto" autoplay playsinline loop muted>
      <source src="/assets/showreel/short.mp4" media="(min-width:768px)">
      <source src="/assets/showreel/short-sm.mp4">
    </video>

    <video preload="none" loop playsinline>
      <source src="/assets/showreel/full-1440-60.mp4" media="(min-width:1200px)">
      <source src="/assets/showreel/full-1080-60.mp4">
    </video>

| file | byte |
|---|---:|
| `short.mp4` (>=768 px) | 6.003.109 |
| **`short-sm.mp4` (telefono)** | **2.068.309** — **-65,5%** |
| `full-1440-60.mp4` (>=1200 px) | **85.160.081** |
| `full-1080-60.mp4` (telefono) | 57.223.916 — **-32,8%** |

Da notare due cose. La prima: **il ripiego e' l'ultimo `<source>` senza
`media`**, cioe' non serve nessun `if`, lo fa il browser, e funziona anche senza
JavaScript. La seconda: **il telefono che tocca "guarda lo showreel" si scarica
comunque 57 MB.** Li salva solo il `preload="none"`.

---

## 5. QUANTO TRAFFICO DA TELEFONO RICEVONO DAVVERO

**Non e' deducibile per questi siti, e lo dichiaro.** Ho controllato: solo tre
dei ventinove usano analitiche con dashboard potenzialmente pubbliche
(`hellomonday.com` e `persepolis.getty.edu` su Plausible, `verostudio.com` su
Cabin). **Tutte e tre le dashboard sono private** (HTTP 404 sull'URL pubblico di
Plausible, verificato oggi). Similarweb non espone la ripartizione per
dispositivo senza registrazione. Nessuno degli studi pubblica dati di traffico.

Quindi resta il dato di settore. L'unico che ho potuto **verificare oggi alla
fonte**:

> **StatCounter GlobalStats, Italia, luglio 2026:
> Desktop 56,41% · Mobile 42,55% · Tablet 1,04%.**
> (fonte: `gs.statcounter.com/platform-market-share/desktop-mobile-tablet/italy`)

**Come si legge, e come NON si legge.** StatCounter conta **pagine viste**
tracciate dal suo codice, non sessioni ne' utenti, e il suo campione italiano e'
storicamente sbilanciato verso i siti editoriali. Quel 42,55% non e' "la quota
di mobile del sito di un mobilificio brianzolo". E' il numero piu' difendibile
che abbia potuto verificare, e va usato come **ordine di grandezza: fra il 40% e
il 60%**, non come misura.

Per l'arredamento e il lusso in Italia **non ho una fonte primaria che abbia
potuto aprire e verificare** (la ricerca web era esaurita, i report di settore
sono dietro registrazione). **Non invento una percentuale.** Quello che si puo'
dire onestamente e' un ragionamento, marcato **DEDOTTO**:

1. `_BERSAGLI-BRIANZA.md` osserva che sul settore tecnico *"il traffico e' per
   definizione mobile"*;
2. l'arredo di fascia alta ha un percorso lungo: **si scopre sul telefono, si
   decide sul desktop**. Il primo contatto — Instagram, una ricerca in fiera, un
   link mandato dall'architetto — arriva quasi sempre da uno schermo piccolo;
3. **quindi la domanda giusta non e' "quanta parte del traffico e' mobile" ma
   "quanta parte del PRIMO contatto e' mobile"** — e quella e' molto piu' alta
   della quota di sessioni.

**La regola commerciale che ne discende, e che si puo' dire a un cliente senza
citare nessun numero inventato:** il telefono non e' dove si chiude, e' dove si
viene scartati. Il desktop lo vede chi ti ha gia' scelto.

**Cosa fare invece di dedurre**, e va messo nel preventivo: **chiedere al cliente
la ripartizione per dispositivo dei suoi ultimi dodici mesi, prima di
progettare**. Sono trenta secondi in Google Analytics 4 (Rapporti > Tecnologia >
Dettagli tecnologia > Categoria dispositivo). Attenzione: `_BERSAGLI-BRIANZA.md`
ha trovato **12 aziende su 68 con il tag Universal Analytics morto nel
sorgente** — per quelle il dato non esiste piu' e nessuno lo sa.

---

## 6. LA REGOLA OPERATIVA — cosa si decide all'inizio

`_TEMPI.md` ha gia' stabilito **quando**: il telefono e' una fase, misurata in
ore, che nei due repository analizzati non esiste nella prima meta' del progetto
e arriva al decimo mese su quattordici. Qui c'e' il **cosa**: le decisioni che,
se non si prendono al primo incontro, poi non si prendono piu'.

**Le sei decisioni, in ordine.** Vanno prese prima di aprire Figma, e vanno
scritte nel preventivo perche' ognuna ha un costo diverso.

**1. Quale delle tre strade.** Non e' una scelta tecnica, e' una voce di costo.

| strada | cosa significa | il conto in ore | chi l'ha fatta |
|---|---|---|---|
| **A. Rimpicciolire** | un impaginato, media query, niente asset nuovi | +0 | 20 su 29 |
| **B. Asset alternativi** | stesso codice, contenuti ricodificati | **+10-16 h** (la riga "telefono" di `_TEMPI.md`) | 4 su 29 |
| **C. Versione alternativa** | build o markup separati | **+14-24 h**, e ogni modifica successiva costa il doppio | 2 su 29 |

Il default onesto e' **B**. **A** e' legittimo solo se il sito non ha un video o
un canvas pesante. **C** si sceglie se — e solo se — l'effetto principale e'
WebGL e il telefono non deve pagarne un byte (e' il caso di Aristide Benoist).

**2. Qual e' l'effetto principale, e cosa lo sostituisce.** La domanda va fatta
al cliente in questa forma: *"la cosa che sul computer fa dire wow, sul telefono
cosa diventa?"*. Le tre risposte accettabili, tutte viste nella ricerca:
**un'altra cosa** (obys: il canvas diventa un filtro CSS con lo stesso
contrasto), **la stessa cosa piu' leggera** (lusion: `_ld`), **niente** (Apple:
il fotogramma statico). La risposta non accettabile e' *"si vedra' dopo"*,
perche' dopo diventa il ramo morto di Locomotive.

**3. Chi produce i contenuti verticali, e quando.** Se il sito ha un video di
apertura, va deciso **al brief** se esiste un montaggio verticale e chi lo fa.
Lusion ha `reel/mobile.mp4` perche' l'ha girato. Locomotive no, e infatti il suo
ramo mobile punta al file orizzontale. **Non e' un problema di codice: e' un
problema di consegna del materiale.** Va nella riga "cosa fornisce il cliente"
del preventivo, con la data.

**4. Il numero di pixel, non il dispositivo.** Si decide subito un tetto:
`MAX_PIXEL_COUNT` come lusion (3.686.400), oppure la regola invertita di Lando
Norris (`width > 768 ? min(dpr, 1.25) : min(dpr, 2)`). Scriverlo in una
costante, in un file, all'inizio. Se invece si comincia con `setPixelRatio(2)`
si scopre il problema quando la scena e' finita e si e' fuori tempo.

**5. Le unita' di viewport, scelte il primo giorno.** `dvh`/`svh`/`lvh` **da
subito, mai `100vh`**. Costa zero adesso e diventa una caccia al bug quando ci
sono 98 occorrenze in 476 KB di CSS (immersive-g). Regola in una riga: **`svh`
per quello che deve essere visibile all'apertura, `lvh` per quello che deve
riempire, `dvh` solo dove il salto e' voluto.**

**6. Lo scorrimento fluido sul tocco: acceso o spento, deciso subito.** Il
default di Lenis e' `syncTouch: false` — cioe' **spento**, cioe' iOS scorre come
sa fare lui. Accenderlo e' una decisione che costa: fa perdere il nascondimento
automatico della barra (Lenis #200, #293, #119), e apre la lista di segnalazioni
della sezione 4.2. **La si accende solo se serve a un effetto specifico** (uno
scorrimento infinito, che la documentazione dichiara richiederlo) **e la si
prova su un iPhone vero prima di tenerla.**

**La riga che riassume tutto:** su ventinove siti da premio, **il meccanismo
mobile lo hanno costruito quasi tutti; il contenuto mobile quasi nessuno**. Il
meccanismo non e' il progetto. Il progetto e' decidere, al brief, **quali file
diversi esisteranno** — e chi li produce.

---

## 7. LE VERIFICHE DA FARE PRIMA DI CONSEGNARE

Eseguibili, in ordine, tutte in un terminale o su un telefono vero. Il blocco
`curl` gira su Git Bash. Sostituire `SITO`.

### 7.1 Le sei prove con `curl` (dieci minuti, zero browser)

    UAD='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    UAM='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
    U=https://SITO/

**V1 — l'HTML e' lo stesso?** (e il controllo che evita i falsi positivi)

    curl -sS -L --compressed -A "$UAD" "$U" -o d1.html
    curl -sS -L --compressed -A "$UAM" "$U" -o m1.html
    curl -sS -L --compressed -A "$UAD" "$U" -o d2.html
    wc -c d1.html m1.html
    cmp -s d1.html d2.html && echo "desktop stabile" || echo "ATTENZIONE: rumore, diffa d1 vs d2 prima di concludere"
    cmp -s d1.html m1.html && echo "HTML identico: la decisione e' tutta nel browser"

*Esito atteso:* identico va benissimo. **Quello che non va bene e' non saperlo.**

**V2 — nessun asset pesante e' identico per sbaglio.** Estrae i media e li pesa:

    grep -o -E 'https?://[^"]+\.(mp4|webm|ktx2|buf|glb|exr|png|jpg|webp|avif)' d1.html \
      | sort -u | while read a; do
          printf "%10s  %s\n" "$(curl -sSI -L "$a" | grep -i '^content-length' | tr -d '\r' | awk '{print $2}')" "$a"
        done | sort -rn | head -20

*Regola:* **nessun file sopra 2 MB deve arrivare al telefono senza un gemello
piu' leggero.** Se il gemello c'e' nel codice, verifica che non sia lo stesso
file (l'errore di Locomotive):

    grep -o -E '"(desktop|mobile)":\{[^}]*\}' d1.html   # e confronta gli src a occhio

**V3 — `100vh` non deve esistere.**

    for c in $(grep -o -E 'href="[^"]+\.css[^"]*"' d1.html | sed 's/href="//;s/"//'); do
      curl -sS -L --compressed "$U$c" ; done > all.css
    grep -c '100vh' all.css      # deve dare 0
    grep -c -E '100(dvh|svh|lvh)' all.css

**V4 — hover e puntatore.**

    grep -c -E 'hover:\s*hover' all.css      # > 0 se ci sono effetti al passaggio
    grep -c -E 'pointer:\s*coarse' all.css

*Regola:* se il sito ha un effetto al passaggio del mouse e questi due danno 0,
sul telefono quell'effetto o non parte o resta incastrato.

**V5 — che cosa nascondi, e ti sei ricordato di non caricarlo.**

    awk 'BEGIN{RS="@media"} /max-width:\s*(4|5|6|7|8|9|10)[0-9][0-9]px/' all.css \
      | grep -c 'display:\s*none'

*Regola:* ogni `display:none` su un elemento che scarica qualcosa (`<img>`,
`<video>`, `<canvas>`) e' **peso pagato e buttato**. Vanno rimossi dal DOM o mai
inseriti, non nascosti.

**V6 — i rami morti.** Nel bundle, cerca gli `if` sul dispositivo e leggi i due
rami:

    curl -sS -L --compressed "$U/percorso/bundle.js" \
      | grep -o -E '.{0,120}(isMobile|isDesktop|matchMedia|maxTouchPoints).{0,200}' | sort -u

*Regola:* **se i due rami producono lo stesso oggetto, cancellali.** Un `if` che
non fa niente e' peggio di niente: fa credere che il lavoro sia fatto.

### 7.2 Le otto prove sul telefono vero (venti minuti, un iPhone e un Android)

Non sono sostituibili con l'emulatore del browser: **l'emulatore non ha la barra
degli indirizzi che si muove, non ha il Risparmio energetico, non scalda e non
ha lo scorrimento inerziale di iOS.**

| # | prova | come | esito atteso |
|---|---|---|---|
| **P1** | **La barra e la prima schermata** | apri il sito da zero (senza scorrere): il pulsante o il testo in fondo alla prima schermata si vede? | si, tutto visibile **con la barra ancora aperta** |
| **P2** | **Il salto della barra** | scorri di 200 px e torna su | niente deve saltare, ridimensionarsi o riposizionarsi |
| **P3** | **La barra si nasconde** | scorri in giu' per due schermate | la barra di Safari **deve** ritirarsi. Se non lo fa, hai `syncTouch` acceso |
| **P4** | **Il primo tocco** | carica, aspetta che sia fermo, poi **scorri di colpo** | nessuna esitazione al primo gesto. Se c'e', sposta il lavoro prima o dopo, non sul gesto |
| **P5** | **Il Risparmio energetico** | Impostazioni > Batteria > Risparmio energetico ON, ricarica | il sito **deve restare usabile**. Se gli autoplay muoiono e la pagina resta bianca, hai il difetto che Apple risolve con il video base64 |
| **P6** | **Il calore** | tieni la pagina aperta e ferma **tre minuti** sulla scena piu' pesante | il telefono non deve diventare caldo al tatto. Se lo diventa, hai un `requestAnimationFrame` che gira su una scena che non cambia: fermalo |
| **P7** | **La rotazione** | ruota in orizzontale e torna | niente deve rompersi. Se hai uno scambio di sorgente su `viewportWidth` (come lusion a 560 px) verifica che riparta senza sfarfallio |
| **P8** | **Movimento ridotto** | Impostazioni > Accessibilita' > Movimento > Riduci movimento ON | le animazioni si fermano. Vedi `_ACCESSIBILITA.md`. Nota: la libreria Lenis lo rispetta **solo dal 03/08/2026** |

Piu' due che non richiedono il telefono ma vanno fatte:

| # | prova | come |
|---|---|---|
| **P9** | **Rete lenta vera** | DevTools > Network > **Slow 4G** *e* CPU 4x slowdown insieme. Solo la rete non basta: sul telefono il collo di bottiglia e' spesso il processore |
| **P10** | **Il conto finale** | somma i byte trasferiti al primo caricamento sull'emulatore iPhone. **Se non e' almeno il 40% piu' basso del desktop, la fase telefono non l'hai fatta: l'hai dichiarata** |

### 7.3 La soglia da scrivere nel preventivo

Dai numeri di questa ricerca, i risparmi veri misurati sui siti che il lavoro
l'hanno fatto:

| chi | cosa | diff |
|---|---|---:|
| darkroom.engineering | video di progetto | **-80,5%** |
| aristidebenoist.com | codice servito | **-73,9%** |
| obys.agency | HTML | **-72,5%** |
| lusion.co | geometria + texture | **-66,5%** |
| cuberto.com | video di apertura | **-65,5%** |
| lusion.co | reel | **-54,5%** |
| locomotive.ca | totale (poster ottimizzato, video no) | **-4,8%** |

**La mediana di chi ha fatto il lavoro sta fra il 65% e il 75%.** Quindi la
soglia che ha senso mettere nero su bianco e': **il telefono scarica almeno il
50% in meno del desktop, misurato al primo caricamento.** E' sotto la mediana
dei bravi, e' sopra il 4,8% di chi ha fatto finta, ed e' verificabile dal
cliente in due minuti con il pannello di rete.

---

## COSA NON HO MISURATO, E VA DETTO

- **Frame rate e temperatura**: nessun telefono fisico, nessun profiler. Le
  sezioni 4.3 sono **DEDOTTE dal codice** e dalle segnalazioni, e sono marcate.
- **`pangrampangram.com` e `manayerbamate.com`**: **HTTP 403 da Cloudflare** con
  entrambi gli user agent. Fuori dal campione.
- **I byte veri del primo caricamento**: `curl` misura l'HTML e i singoli asset,
  non l'esecuzione. La colonna "URL distinti" della tabella 1 e' **il numero di
  risorse dichiarate nell'HTML**, non le richieste effettive — che su una SPA
  come `activetheory.net` (5.952 B di HTML) sono centinaia di volte di piu'.
- **La quota di traffico da telefono di questi siti**: non pubblica, dashboard
  private, verificato oggi. Sezione 5.
- **Una fonte primaria italiana su arredo/lusso**: non aperta, budget di ricerca
  web esaurito. Non ho inventato la percentuale.
- **`kprverse.com`, `noomoagency.com`, `franshalsmuseum.nl`, `apple.com`,
  `staratlas.com`, `persepolis.getty.edu`, `dark.netflix.io`**: misurati
  sull'HTML e sul CSS, **non sul bundle JavaScript** (scaricamento interrotto per
  tempo). Le sezioni 2.1-2.4 non li includono.
