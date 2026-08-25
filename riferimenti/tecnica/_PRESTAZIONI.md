# Prestazioni, telefono e sequenze di fotogrammi — i numeri veri

Include **due correzioni a numeri molto citati e falsi**. Da leggere prima di
usare qualunque altra fonte sull'argomento.

---

## DUE NUMERI FALSI CHE CIRCOLANO OVUNQUE

**1. I "55,8 MB della pagina AirPods Pro" NON sono di Apple.** Il numero viene
da un articolo su CSS-Tricks ed e' il **demo dell'autore** con piu' istanze
della tecnica sulla stessa pagina (*«Let's say we have multiple instances of
this on the same page»*). E' una citazione errata ripetuta in decine di
articoli. Da non usare mai piu'.

**2. L'"80% di risparmio" del passaggio da sequenza a video e' falso.**
Misurato sul CDN Apple:

| pagina | animazioni | small_2x | large_2x | asset peggiore |
|---|---:|---:|---:|---|
| AirPods Pro 3 | 15 | 32,59 MB | **59,44 MB** | `hearing-health-halo` **18,46 MB** (WebM con alpha) |
| iPhone 17 Pro | 16 | 26,04 MB | 51,19 MB | `performance-hero` 7,27 MB |
| MacBook Pro | 13 | 24,57 MB | 43,78 MB | `mac-os-hero` 11,24 MB |

Contro i **15,2 MB** (65 PNG) della pagina AirPods Pro 2 a sequenza.
**Apple non ha alleggerito: ha speso il guadagno di efficienza per passare da
1-2 animazioni a 15**, alzando risoluzione e canale alpha. Un solo WebM con
alpha da 18,46 MB pesa **sette volte la mediana di una pagina web intera**.

Rapporto desktop/mobile **1,82x**. Sono tetti massimi (somma dei file sul CDN),
non byte trasferiti: `preload="none"` e caricamento in viewport fanno scaricare
solo il necessario.

---

## CORREZIONE FRA DUE RICERCHE: il GOP non e' 30, e' 4

Due agenti hanno misurato la stessa cosa e hanno dato risultati diversi. Vince
il secondo, perche' ha usato **ffprobe sui file veri**: su iPhone Air ci sono
**60 keyframe su 238 fotogrammi**, 33 su 131, 23 su 91 — cioe' **un keyframe
ogni quattro fotogrammi**, non ogni trenta.

Cambia la conclusione. Non e' vero che "nessuno paga il prezzo di un video
scrubbabile": **Apple lo paga**, e lo paga con una codifica quasi all-intra.
Quello che NON fa e' usare un formato all-intra puro: sta nel mezzo, GOP 4.

## Apple oggi scrubba il video, ma rinuncia alla precisione

Nel bundle `main.built.js` c'e' la costante **`FEATURE_VIDEO_SCRUB`**, e lo
scroll e' mappato sul progresso del video:

    data-video-progress-kf-1='{"start":"a0t - 100vh","end":"a0b - 168vh",
                               "progress":[0.0,1.0]}'

**E paga una codifica quasi all-intra: GOP 4** (60 keyframe su 238 fotogrammi,
misurati con ffprobe). Non arriva all'all-intra puro, che costerebbe il 3,24x,
ma non rinuncia affatto alla precisione del seek: sta esattamente nel mezzo.

**Come lo fa davvero** (misurato su 23 pagine prodotto vive):

- **zero `data-sequence-basepath`**: le sequenze di immagini sono sparite dalle
  pagine prodotto correnti;
- quattro video scrubbati su iPhone Air: **238 fotogrammi** (800x1600, 60 fps,
  3,97 s), 91 (1580x1696 con alfa), 93 (2900x1700), 131 (520x1096). In tutto
  **533 fotogrammi, 9,96 MB** in webm 2x — e **2,71 MB sul telefono**;
- **VP9/webm servito via MediaSource Extensions** (fetch a pezzi +
  `appendBuffer`) fuori da Safari; `.mp4`/`.mov` HEVC con alfa dentro Safari;
- lo scroll scrive `video.currentTime` **quantizzato a due decimali**, e il
  video e' tenuto in pausa a forza;
- **la decelerazione non e' un easing: e' una mappa spezzata in due tratti** —
  `0 -> 0,87 in 85vh` e `0,87 -> 1 in 90vh`. Il quasi-finale si dilata.

**Il motore a canvas esiste ancora**, ma sulla pagina Vision Pro: 200 JPEG per
fascia (large 1220x1172 = 28,35 MB, medium 15,49, small 12,27, **nessun 2x**),
precaricati per **suddivisione binaria** — centro, quarti, ottavi — e se un
fotogramma manca disegna il piu' vicino gia' caricato. La vecchia AirPods Pro
2019: **1.527 fotogrammi, 66,01 MB** desktop contro 26,61 MB telefono.

> **Conseguenza per noi: 533 fotogrammi in 9,96 MB come video contro i nostri
> 720 in WebP. Con GOP 4 il seek e' abbastanza preciso per lo scrub. Vale la
> prova: potremmo dimezzare il peso.**

Il codice di Apple: **2,49 MB non compressi e nessuna libreria di terzi** —
niente GSAP, niente Lenis, niente Framer Motion. Il 3D e' un `lotus.min.js` da
1,56 MB con Three + DRACO + KTX2.

---

## IL SISTEMA DI DEGRADAZIONE DI APPLE — la cosa piu' rubabile

Apple espone **quindici validatori**. Se **uno solo** scatta, toglie la classe
`enhanced` da `<html>` e serve la versione **base, senza animazioni**:

`ReducedMotion` · `LowPowerMode` · `SmallBreakpoint` · `SmallDesktop` ·
`InvalidViewport` · `TextZoom` · `AlphaVideoUnsupported` · **`Android`** ·
**`iOS`** · **`iPad`** · `BreakpointChange` · `AOW` · `NoArQuickLook` ·
`RTViewer` · `Tweens`

> **`iOS`, `iPad` e `Android` sono validatori a se'. Il telefono non e' un caso
> da ottimizzare: e' una condizione di degradazione.**

### Come Apple rileva il Risparmio energetico, che nessuna API espone
Il trucco migliore di tutta la ricerca:

    this.name = "LowPowerMode";
    t.innerHTML = '<video playsinline preload autoplay muted
                    src="data:video/mp4;base64,…"></video>';
    try   { await i.play(); this._isInLowePowerMode = false }
    catch (e) { if (e.name === "NotAllowedError") this._isInLowePowerMode = true }

iOS in Risparmio energetico blocca l'autoplay -> `play()` rigetta con
`NotAllowedError` -> Apple deduce la modalita' e **degrada l'intera pagina**.

### `prefers-reduced-motion`: spegne, non attenua
**97 occorrenze** di `ReducedMotion` nel JavaScript contro **una sola** `@media`
nel CSS. Non attenua le animazioni: **le elimina**. Verificato sul campo — con
il movimento ridotto attivo, `<html>` riceve `no-enhanced`.

### Guardia di caricamento
`data-load-timeout="3000"`: se l'animazione non e' pronta in **tre secondi**, si
ripiega sul fotogramma statico. Piu' sorgente assegnata solo entrando nel
viewport, e un `<picture class="fallback-frame">` per **ogni** video.

### Breakpoint
`xsmall` ≤480 · `small` ≤734 · `medium` ≤1068 · `large` ≤1440 · `xlarge` ≥1441
Mappa video: `{xsmall→small, small→small, medium→medium, large→large,
xlarge→large}`.

**L'HTML e' identico byte per byte fra desktop e iPhone (521.428 B).** Zero
differenziazione lato server: tutto si decide nel browser.

---

## La sequenza di fotogrammi: i numeri che contano

- **1.182 fotogrammi desktop / 880 mobile**, file separati per dispositivo;
- precarico 10 + 5/5, buffer scorrevole di 3-6 fotogrammi;
- **canvas ≤ 16.777.216 px su iOS** (limite duro);
- il vincolo che decide e' la **memoria**: ~500 MB decodificati contro i ~100 MB
  del crash su iPhone SE 3;
- gia' nel 2019-2020 **Apple su rete lenta non serviva affatto la sequenza**, ma
  «a single fallback image». Su 3G lento: 8 richieste su 111, 347 KB su 2,6 MB,
  caricamento in **1 minuto e 1 secondo**;
- la sequenza `01-hero-lightpass` storica: **147 fotogrammi** JPG.

---

## LA REGOLA

**La degradazione va progettata come un sistema, non come un `if`.**
Quindici condizioni di spegnimento, timeout a 3.000 ms, `preload="none"`,
sorgente solo in viewport, fallback statico per ogni elemento animato, e il
movimento ridotto che **spegne invece di attenuare**. Tre di quelle condizioni
significano che sul telefono la versione ricca **non parte proprio**.

## Non verificato / non ottenibile
CrUX e Core Web Vitals di campo per apple.com (BigQuery non disponibile).
Lighthouse/PSI (quota API esaurita). Il "punteggio 58 fra i primi 100 retailer"
che circola in rete: **fonte primaria irrintracciabile, da non usare**. Il
transfer reale della versione ricca: `transferSize` dei `<video>` e' 0 per le
richieste Range opache.
