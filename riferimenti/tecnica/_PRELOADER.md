# Il preloader e i primi tre secondi

Ricerca sul codice reale di **nove siti premiati**. Letto il 13 agosto 2026.

Metodo: nessun browser. Solo `curl` sull'HTML, poi discesa nei bundle JS
e lettura del sorgente minificato. Ogni numero in questo documento viene da
una costante che ho letto nel codice, non da un cronometro. Dove ho misurato
i byte, li ho misurati con `curl -w '%{size_download}'` a compressione attiva.

**Come e' fatto questo documento.**

- **Parte I** — Lusion e Obys, i due studiati per primi e piu' a fondo.
- **Parte II** — gli altri sette: Igloo, Active Theory, Immersive Garden,
  Bruno Simon, Lando Norris, don't board me, basement.studio.
- **Parte III** — le sette risposte, incrociate su tutti e nove. **Se hai poco
  tempo leggi solo quella**, e torna nelle parti I e II per il codice.

I file scaricati stanno in
`C:\Users\Giuseppe\AppData\Local\Temp\claude\C--Users-Giuseppe\af92aa1b-5684-478e-851f-ed41dfd5b5b6\scratchpad\pl`
e `...\scratchpad\pl2`.

---

## 0. Il riassunto, se hai trenta secondi

Su nove siti, **nessuno mostra una percentuale che corrisponda ai byte
scaricati**. Nemmeno uno. Chi mostra un progresso conta **file** (Active
Theory, Immersive Garden, Bruno Simon, la barra di Obys) oppure usa **pesi
scritti a mano** (Lusion). Chi mostra un numero che sale liscio lo sta
inventando: il finto `0->100%` in tre secondi con `ease: none` e'
`dontboardme.com` su mobile, ed e' un `gsap.to` su un oggetto vuoto.

**Quattro dei nove non mostrano nessun numero. Due non mostrano nessuna
copertura.** Il contatore percentuale, che nella testa di tutti *e'* il
preloader, e' minoranza.

Le due regole che invece valgono ovunque:

1. **La copertura non si toglie: si trasforma.** Su Lusion la barra di
   caricamento e' lo stesso rettangolo che poi ruota e diventa la lama che
   apre lo schermo. Su Bruno Simon l'anello implode e da li' parte l'onda che
   accende il mondo. Su Immersive Garden il preloader **diventa** la hero.
2. **La pagina parte prima che la copertura sia via.** Misurato su sette siti:
   Obys 150 ms, Lusion ~384 ms, don't board me 400 ms, Lando Norris 450 ms,
   Igloo 750 ms, Active Theory 1,2 s, Immersive Garden 4,2 s. Mediana **~450
   ms**. Su don't board me la variabile si chiama, nel codice sorgente,
   `animate-page-while-preloader`.

E il controesempio che vale piu' di tutti: **basement.studio, che ha piu'
premi da sviluppatore di chiunque altro qui dentro, sul proprio sito non ha
nessun preloader.** HTML servito dal server, 34 KB, titolo nella prima
risposta, 64 immagini pigre. Il preloader non e' un segno di qualita': e' il
prezzo di una tecnica, e chi puo' non pagarlo non lo paga.

---

# Parte I — Lusion e Obys, letti riga per riga

Le sezioni numerate 1-7 che seguono riguardano **solo questi due siti**. Le
stesse sette domande, incrociate su tutti e nove, stanno nella Parte III in
fondo.

## 1. Le forme ricorrenti (Lusion e Obys)

| Forma | Chi | Dettaglio |
|---|---|---|
| Contatore percentuale gigante | **Lusion** | tre cifre, `font-size:13vw`, in basso a sinistra, con effetto tamburo (ogni cifra e' due `div` che scorrono in verticale) |
| Contatore a due cifre | **Obys** | `00` -> `100`, in alto a destra, `mix-blend-mode:difference` |
| Barra sottile in cima alla pagina | **Obys** | `#prg`, alta `2.5px`, oltre al contatore; e' l'unico progresso reale del sito |
| Barra che diventa la transizione | **Lusion** | rettangolo `5x1` disegnato su canvas 2D che poi ruota e scala |
| Logo che si disegna (stroke) e poi si morfa | **Obys** | globo -> logo, con interpolazione punto a punto di 200 campioni per path |
| Parola "LOADING" a bitmap | **Lusion** | solo nei passaggi *tra* pagine, mai al primo caricamento |

Nota sul dettaglio che nessuno copia mai: il contatore di Lusion e'
**un odometro**, non un numero che cambia. Il markup e':

```html
<div id="preloader-percent-digits">
  <div class="preloader-percent-digit">
    <div class="preloader-percent-digit-num">0</div>
    <div class="preloader-percent-digit-num">0</div>
  </div>
  ... (tre volte)
</div>
```

Fonte: `https://lusion.co/` (HTML della home).

Ogni cifra ha due celle. Il codice mette la cifra corrente nella prima,
quella successiva nella seconda, e trasla il contenitore della frazione
intermedia. Il risultato e' che le cifre **rotolano** invece di scattare,
e la parte decimale del valore interpolato diventa movimento invece di
essere buttata via:

```js
let u = l._easedVal % 10,
    f = Math.floor(u),
    p = Math.ceil(u) % 10,
    g = u - f;
l._domNums[0].innerHTML = f;
l._domNums[1].innerHTML = p;
l.style.transform = "translateY(" + -(g - ease.expoInOut(...)) * 50 + "%) translateY(-0.05em)";
```

Fonte: `https://lusion.co/_astro/hoisted.CUO_IjfL.js`, classe `Preloader`.

---

## 2. Come misurano il progresso davvero

### Lusion: progresso reale, ma su una lista scelta a mano, e con due fasi

Lusion usa `QuickLoader` (`VERSION = "0.1.17"`, incluso nel bundle). Il
progresso e' **peso caricato / peso totale**:

```js
function _onLoading$1(o, e, t, r, n) {
  ... n = this.loadedWeight / this.totalWeight;
  t.dispatch(n, o);
}
function add(o, e) {
  ... this.itemList.push(t), this.totalWeight += t.weight;
}
```

Due cose importanti.

**Il peso e' dichiarato a mano, non e' il `Content-Length`.** Nel bundle si
trovano item registrati con un peso arbitrario:

```js
properties.loader.add(settings.TEXTURE_PATH + "LDR_RGB1_0.png", { weight: 55, onLoad: ... })
properties.smaa.setTextures(properties.loader.add(settings.TEXTURE_PATH + "smaa-area.png", { weight: 32, ... }))
```

Quindi la percentuale e' una **stima calibrata dallo studio**: hanno guardato
quanto ci mette ogni asset e hanno scritto il numero a mano. E' il compromesso
onesto: piu' vero di un finto, piu' economico di misurare i byte.

**Esiste `add` e esiste `load`.** Solo `add` entra nel totale. Gli asset
caricati con `properties.loader.load(...)` (per esempio le anteprime dei
progetti, `home.webp` e `home_depth.webp` di ogni progetto) partono subito
ma **non contano nella percentuale**. Cioe': la barra arriva a 100 mentre
altre cose stanno ancora scendendo. E' voluto.

**La seconda fase e' la GPU, non la rete.** Il numero che vedi non e' il
progresso del download. E':

```js
let t = this.percentToStart * this.PERCENT_BETWEEN_INIT_AND_START
      + this.percent      * (1 - this.PERCENT_BETWEEN_INIT_AND_START);
// PERCENT_BETWEEN_INIT_AND_START = .3
```

Cioe' **70% download + 30% compilazione**. `percentToStart` segue
`taskManager.percent`, e il `TaskManager` fa avanzare una coda di lavori
che non sono file: sono compile di shader e upload di texture in GPU.

```js
class TaskManager {
  percent = 1; taskList = []; _activeTaskList = []; _activeTaskIndex = 0;
  update() {
    ...
    this.percent = this._activeTaskIndex / this._activeTaskList.length;
    e.run();
  }
}
// e i task sono cose come:
createInitTextureFunc(e) { return function() { properties.renderer.initTexture(e); this._onComplete(); } }
```

Questo e' il pezzo che quasi nessuno copia ed e' il piu' utile: **su un sito
WebGL l'attesa vera non finisce quando i file sono arrivati**. Finisce quando
gli shader sono compilati. Se togli la seconda fase, il tuo 100% e' seguito
da mezzo secondo di scatto. Lusion gli ha dedicato l'ultimo 30% della barra.

### Obys: il numero e' finto, ma non e' una bugia

Il contatore di Obys non guarda la rete. Mai. Il metodo che riceve il
progresso reale e':

```js
progress(h) {}
```

Una funzione **vuota**. Il numero e' scritto da tre animazioni a durata fissa:

```js
// fase 1 - il logo si disegna, 1300 ms
new n({ d: 1300, e: "io5", u: (I) => { ...; this.updateCounter(I.pr[0] * 30) }, cb: ... }).play()

// fase 2 - il globo si morfa nel logo, 1400 ms
new n({ d: 1400, e: "io6", u: (O) => { ...; this.updateCounter(30 + O.pr[0] * 20) }, cb: ... }).play()

// fase 3 - il resto, 800 ms (percorso non-home) oppure 3700 ms (home)
new n({ d: 800, u: (H) => { K.textContent = Wh(Math.round(50 + H.pr[0] * 50)) }, cb: () => { K.textContent = "100"; ... } }).play()
```

Fonte: `https://obys.agency/js/d.js`, classe `ah` e classe `eh`.

Il dettaglio che vale la pena vedere: `pr` e' la coppia
`[progresso lineare, progresso con ease]`. L'animazione grafica usa `pr[1]`
(con la curva). **Il contatore usa `pr[0]`, cioe' lineare.** E' esattamente
il "finto 0->100 con `ease: none`" che avevi visto: qui e' spezzato in
0->30, 30->50, 50->100, ma la natura e' quella.

E allora perche' non e' una bugia? Perche' **Obys non promette niente col
numero, e chiude il cancello sul dato vero**:

```js
tryFinish() { if (this.loaded && this.animDone && this.cb) this.cb(), this.cb = null }
complete()  { if (this.loaded) return; this.loaded = !0, this.tryFinish() }
```

Il sito si apre solo quando **sia** l'animazione e' finita **sia** gli asset
sono arrivati. Il numero e' scenografia; la porta e' vera. Se la rete e'
lenta, il numero si ferma a 50 e aspetta.

Il progresso vero esiste, ma finisce in un altro posto: la barra da 2.5px
in cima alla pagina (`#prg`), e conta **file, non byte**:

```js
crt(h, _, T, U) {
  new ih({ tex: E, layer: U.i, src: T.s, cb: () => { if (this.loaded++, this.loaded === this.len) this.cb() } })
}
tick() {
  if (this.loaded !== this.prev) { this.prev = this.loaded; let h = this.loaded / this.len; this.norm = this.isTr ? Z0(0.3, 1, h) : h }
  ...
}
```

Con due trucchi da rubare:

```js
this.cssTr(U, 1000, ".76,0,.2,1");        // contenitore
this.cssTr(this.bar, 3500, ".16,1,.3,1"); // la barra
if (this.isTr) m0(this.bar, -70, 0);      // sulle navigazioni parte gia' al 30%
```

La barra ha una **transizione CSS di 3500 ms con curva quasi-expo**. Quindi
anche se il valore reale salta da 0 a 1 in un frame, la barra ci mette
secondi ad arrivare, morbida. E sulle navigazioni interne parte **gia' al 30%**
(`Z0(0.3, 1, h)`, barra a `-70%`): il classico regalo psicologico, la barra
non parte mai da zero.

### La forma che quasi tutti usano e che quasi sempre e' sbagliata

`THREE.LoadingManager` (incluso anche nel bundle di Lusion, che pero' non lo
usa per il preloader) conta **item, non byte**:

```js
this.itemEnd = function(p) { l++; n.onProgress !== void 0 && n.onProgress(p, l, c); ... }
```

`l/c` = file finiti su file totali. Con un GLB da 8 MB e sei icone SVG,
la barra fa 0-14-28-42-57-71-85 in duecento millisecondi e poi **sta ferma
all'85% per otto secondi**. E' il modo piu' comune di rovinare un preloader,
ed e' il default di quasi ogni tutorial.

---

## 3. Quanto durano

Numeri presi dalle costanti, non dal cronometro.

### Lusion: minimo 3,25 secondi, anche con tutto in cache

```js
class Preloader {
  DELAY = 1.5;
  MIN_PRELOAD_DURATION = 1;
  PERCENT_BETWEEN_INIT_AND_START = .3;
  MIN_DURATION_BETWEEN_INIT_AND_START = .25;
  HIDE_DURATION = .5;
  ...
  update(e) {
    this.percent = Math.min(this.percentTarget,
      this.percent + (settings.SKIP_ANIMATION ? 1 : (this.percentTarget > this.percent ? e : 0)) / this.MIN_PRELOAD_DURATION);
```

Il conto:

| Tappa | Durata minima | Da dove |
|---|---|---|
| il contatore sale a 100 | 1,00 s | `MIN_PRELOAD_DURATION = 1` (avanza al massimo di 1 al secondo) |
| l'ultimo 30% (shader) | 0,25 s | `MIN_DURATION_BETWEEN_INIT_AND_START = .25` |
| la barra si trasforma in linea | 1,00 s | `lineTransformTime` saturato a 1, con `expoInOut` |
| l'apertura sulla pagina | 1,00 s | `contentShowRatio = saturate(properties.startTime)` |
| **totale pavimento** | **3,25 s** | |

Cioe': **anche a banda infinita, con la cache calda, aspetti tre secondi e
un quarto.** E' una scelta, non un incidente. `DELAY = 1.5` e
`HIDE_DURATION = .5` sono dichiarate ma non usate nel loop: residui.

Cosa c'e' dietro l'attesa, misurato: bundle JS **305 KB** trasferiti
(1,25 MB non compressi) + gli asset della home:

| File | Byte |
|---|---|
| `/assets/models/home/cross.buf` | 282.676 |
| `/assets/textures/home/matcap.exr` | 602.702 |
| `/assets/textures/LDR_RGB1_0.png` | 48.759 |
| `/assets/textures/smaa-area.png` | 33.203 |
| `/assets/textures/smaa-search.png` | 113 |

Circa **970 KB di asset + 305 KB di JS = 1,27 MB** prima di vedere qualcosa.
Su una 4G media italiana (~12 Mbps reali) sono circa 0,9 s di solo transito,
piu' parsing, piu' compile shader. I 3,25 s di pavimento sono tarati bene:
coprono il caso medio senza far aspettare a vuoto chi ha la fibra... se non
fosse che chi ha la fibra aspetta comunque 3,25 s.

### Obys: circa 2,7 s prima di vedere le immagini, circa 8,3 s di intro completa

Sequenza sulla home, dal codice:

```js
// il caricamento vero parte 900 ms DOPO il boot
new g(() => { new hh(() => T.complete(), (U) => T.progress(U)) }, 900).run()
```

| Tappa | ms | Da dove |
|---|---|---|
| logo che si disegna (contatore 0->30) | 1300 | `new n({d:1300, e:"io5"})` |
| morph globo->logo (30->50) | 1400 | `new n({d:1400, e:"io6"})` |
| *cancello*: aspetta anche gli asset | var. | `tryFinish()` |
| le immagini entrano impilate al centro | 1600 + 5x180 = 2500 | `Z=1600, K=180, H=1600+(J-1)*180`, `J=min(n,6)` |
| il contatore 50->100 | 3700 | `f = X + 1200` con `X = H` |
| le immagini scendono sotto il logo | 1200 | `new n({_, d:1200, e:"io6"})` |
| il contatore esce, il fondo svanisce | 300 + 300 | `L_()` e `tBg()` |
| le immagini si sparpagliano nella home | 1600 | `spread()`, `new n({_:h, d:1600, e:"io6"})` |

Totale intro: **circa 8,3 secondi**. Ma solo i primi **2,7 s** sono schermo
nero con un logo. Dal secondo 2,7 stai gia' guardando le immagini del sito.
E' la differenza che conta.

Peso: bundle desktop `https://obys.agency/js/d.js` = **38 KB trasferiti**
(120 KB non compressi). Un ottavo di Lusion. Obys si e' scritta il motore
WebGL da sola invece di importare three.js, e si vede.

---

## 4. Cosa succede se il caricamento e' lento

Questa e' la sezione in cui quasi tutti perdono.

**Nessuno dei due siti ha un timeout.** Non esiste un `setTimeout` che dica
"dopo N secondi entra comunque". Su Lusion, se un asset non arriva,
`percentTarget` non raggiunge mai 1 e il contatore resta bloccato per sempre
sul numero raggiunto. Su Obys, il contatore si ferma a 50 e resta li'.

Quello che invece hanno, e che va copiato:

**Obys - l'errore conta come successo.** Un'immagine rotta non blocca il sito:

```js
class ih {
  load(h) {
    let T = new Image;
    T.onload  = () => { ...; if (this.ini) this.ini = !1, this.cb() };
    T.onerror = () => { if (this.ini) this.ini = !1, this.cb() };
    T.src = h;
  }
}
```

`onerror` chiama la stessa callback di `onload`. Un 404 non e' un blocco,
e' un frame in meno. Tre righe, e ti salvano il sito.

**Obys - se i dati di routing non arrivano, ricarica.**

```js
QT({ url: "/d.json?d=" + this.d, success: (T) => {...}, error: () => { location.reload() } })
```

Ripiego brutale (e con un rischio di ciclo infinito se il server e' giu'),
ma esiste.

**Lusion - due qualita' di asset.** Il dispositivo debole non aspetta gli
stessi file:

```js
properties.loader.add(settings.MODEL_PATH + "home/" + (browser$1.isMobile ? "cross_ld" : "cross") + ".buf", {...})
properties.loader.add(`${settings.TEXTURE_PATH}home/${browser$1.isMobile ? "matcap_ld" : "matcap"}.exr`, {...})
```

`_ld` = low detail. E `DPR = Math.min(1.5, devicePixelRatio)`,
`MAX_PIXEL_COUNT = 2560*1440`: il numero di pixel da riempire e' tappato.

**Lusion - la scorciatoia per te stesso.** Ogni impostazione e' sovrascrivibile
dalla query string:

```js
constructor() {
  if (window.URLSearchParams) {
    const t = (r => [...r].reduce((n, [a, l]) => (n[a] = l === "" ? !0 : l, n), {}))(new URLSearchParams(window.location.search));
    this.override(t);
  }
}
```

Quindi `?SKIP_ANIMATION=1` salta tutta l'intro, `?WEBGL_OFF=1` spegne il 3D,
`?JUMP_SECTION=...` atterra su una sezione. Se stai costruendo un sito con
un'intro di otto secondi e devi lavorare sulla sezione in fondo, questa
riga ti restituisce settimane di vita.

**Quello che nessuno dei due fa: saltare il preloader alla seconda visita.**
Ho cercato `sessionStorage` e `localStorage` in entrambi i bundle:
zero occorrenze. **L'intro parte identica alla decima visita.** Per uno
studio che vive di portfolio guardato una volta ha senso. Per un sito che
vende, no.

---

## 5. La transizione dal preloader alla pagina

E' la parte che decide tutto, e i due siti la risolvono con lo stesso
principio: **non c'e' un preloader che finisce e una pagina che inizia.
C'e' un unico movimento continuo.**

### Lusion: la barra di caricamento diventa il taglio

La copertura non e' un `<div>` che sfuma. E' un canvas 2D (`#transition-overlay`)
su cui viene disegnato **un rettangolo di 5 x 1 unita'**, che e' la barra di
caricamento. Poi lo stesso rettangolo viene ruotato e scalato:

```js
let f = ease.expoInOut(1 - this.activeRatio),
    p = (1 + f * c) * n;                       // c = diagonale schermo / larghezza pixel
u.translate(t * .5, r * .5);
u.rotate(f * (this.contentShowRatio == 0 ? -1 : 1));
u.translate(n * f * c, -n * .5 * f * c);
u.scale(p, p);
if (l == 0) {                                  // fase barra
  u.fillStyle = "#333"; u.fillRect(-2.5, -.5, 5, 1);
  u.fillStyle = "#fff"; u.fillRect(-2.5, -.5, 5 * a, 1);   // a = loadBarRatio
}
```

La barra riempita al 40% e la lama bianca che spazza via lo schermo sono
**lo stesso oggetto in due momenti della stessa scala**. Ruota di 1 radiante
(circa 57 gradi) e si ingrandisce fino a superare la diagonale.

### E qui c'e' il numero che cercavi: la home parte ~380 ms prima

Il conto e' esatto e si legge nel codice.

```js
function start() {
  ui.start(), pagesManager.start(), app.start(),
  properties.hasStarted = !0, ...
}
function loop() {
  ...
  properties.hasStarted && (properties.startTime += e);
  ...
}
```

`pagesManager.start()` **avvia l'animazione della home**. Nello stesso frame
parte l'orologio `properties.startTime`. E l'apertura della copertura e':

```js
let n = math.saturate(properties.startTime);   // 0 -> 1 in un secondo
transitionOverlay.contentShowRatio = n;
// dentro l'overlay:
let f = ease.expoInOut(1 - this.activeRatio);  // activeRatio = 1 - n, quindi f = expoInOut(n)
```

`expoInOut` e' **lentissima all'inizio**. Risolvendo `expoInOut(t) = 0.1`
(cioe' il momento in cui l'apertura diventa percepibile) si ottiene
`2^(20t-10) = 0.2` -> `t = 0.384`.

**Per i primi ~384 ms la home sta gia' animando sotto uno schermo che e'
ancora, visivamente, nero.** Quando la lama si apre, dietro non trova una
pagina ferma: trova una pagina gia' in movimento da quattro decimi di
secondo. E' per questo che l'ingresso sembra un'unica cosa e non due.

Stesso principio sulle cifre: escono con anticipo e in sfalsamento.

```js
l.style.transform = "translateY(" + -(g - ease.expoInOut(math.saturate(n * 1.2 - .2 * a / (this.domDigits.length - 1)))) * 50 + "%) ..."
```

`n * 1.2` -> la prima cifra ha finito di uscire a `n = 0.833`, cioe' **167 ms
prima** che l'apertura sia completa; il termine `- .2*a/(len-1)` sfalsa le
tre cifre di circa **83 ms** l'una dall'altra.

### Obys: 150 ms di anticipo, dichiarati

Nel percorso non-home l'anticipo e' scritto in chiaro come ritardo del
secondo elemento:

```js
function L_() {                                        // il contatore se ne va
  let h = Y.i("preloader-prg");
  if (h) new n({ _: x(h), d: 300, e: "i3", p: { y: [0, -110] } }).play()
}
function aT(h, _) {
  L_();                                                // parte subito
  new n({ _: h, d: N0, e: "o3", p: { o: [1, 0] }, de: 150, cb: () => { ... } }).play()
}                                                      // il fondo sfuma 150 ms DOPO
```

`de: 150`. Il contatore inizia a salire via **150 ms prima** che il fondo
nero cominci a sfumare. Non vedi mai "il contatore sparisce, poi la pagina
appare": le due cose si accavallano.

Sulla home l'accavallamento e' totale: le immagini WebGL della home sono
**gia' visibili e in animazione** mentre il fondo del preloader svanisce, e
il fondo svanisce in 300 ms mentre le immagini stanno gia' facendo il loro
movimento di discesa:

```js
tBg(h) {
  let { preloader: _, bg: T } = this;
  if (_) _.style.backgroundColor = "white";
  new n({ _: T, d: 300, p: { o: [1, 0] }, cb: h }).play()
}
```

E il canvas viene alzato sopra tutto **durante** il preloader, non dopo:
`_.style.zIndex = "9999"` dentro `eh.run()`.

### Il dettaglio CSS che rende possibile tutto questo su Lusion

```css
#preloader { position:fixed; ...; z-index:200; background-color: var(--color-black) }
html.is-ready #preloader { background-color: transparent }
```

Appena il WebGL e' pronto (`is-ready`), il `<div>` nero diventa **trasparente**:
il nero da quel momento lo disegna il canvas. Cosi' il colore di fondo non
cambia mai per l'occhio, ma il controllo passa dal DOM al motore grafico.
Senza questo, avresti un frame di sfarfallio.

---

## 6. Il preloader come schermo di vendita

Risposta secca su questi due: **no, non ci mettono niente.**

- **Lusion**: solo tre cifre. Nessuna parola. Nessun claim, nessun cliente,
  nessun logo. Il markup del preloader e' otto `<div>` e basta.
- **Obys**: due cifre e il logo che si disegna. Nessun testo.
- L'unica parola in tutto il sistema di Lusion e' `LOADING`, disegnata a
  rettangoli:
  ```js
  let LOADING_RECTS = [1,1,1,3, 2,4,2,1, 6,2,1,2, 7,1,1,1, 7,4,1,1, 8,2,1,2, 11,2,1,3, ...];
  ```
  ventidue rettangoli in un font bitmap, e **compare solo nei passaggi tra
  pagine**, mai al primo caricamento. Cioe': la parola "LOADING" viene
  mostrata solo quando l'utente ha gia' deciso di restare.

**La lettura.** Questi studi non usano il preloader per vendere, e non e'
una svista: e' che l'unica cosa che vendono in quei tre secondi e' **la
qualita' del movimento**. Un contatore da 13vw che rotola con l'inerzia
giusta e una lama che apre lo schermo dicono "sappiamo fare questo mestiere"
meglio di qualunque frase.

Il che significa due cose per noi:

1. Se il tuo preloader **non e' bello**, il tempo e' buttato: non stai
   vendendo niente, stai solo trattenendo.
2. Se il tuo cliente non e' uno studio di motion design, il "sappiamo fare
   questo mestiere" non e' il messaggio giusto, e allora il preloader dovrebbe
   dire qualcos'altro o non esserci.

L'ipotesi da testare sul nostro lavoro (Monza e Brianza, aziende che vendono
prodotti, non animazioni): il preloader come **prima frase**, non come
contatore. Una riga sola, grande, che resta impressa, mentre dietro carica.
Nessuno dei siti premiati lo fa, e questo e' esattamente il motivo per cui
potrebbe funzionare per noi: e' spazio non occupato.

---

## 7. La regola operativa

### Quando un preloader e' giustificato

Uno solo di questi tre casi. Se non ne hai nessuno, non ti serve.

1. **Il primo fotogramma e' una tela.** Canvas WebGL, scena 3D, shader. Senza
   copertura il visitatore vede un rettangolo vuoto o, peggio, un frame di
   geometria non ancora al posto giusto. Lusion e Obys sono entrambi qui.
2. **La prima cosa che mostri e' pesante e non degradabile.** Un video che
   deve partire al frame giusto, una tipografia variabile su cui e' costruito
   il layout. Se puo' degradare (immagini progressive, testo con font di
   sistema), non ti serve un preloader: ti serve un fallback.
3. **Il caricamento e' il primo tempo dell'animazione.** Non "aspetta e poi
   ti mostro": il logo che si disegna E' l'apertura. Se togliendo l'attesa
   perdi anche un pezzo di regia, allora l'attesa sta lavorando.

### Quando e' solo un modo elegante di perdere gente

- Il contenuto sotto e' DOM e immagini. Il browser le dipinge progressivamente
  meglio di quanto tu possa orchestrare: coprirle e' un peggioramento pagato
  con lavoro.
- Il preloader riparte a ogni visita e a ogni pagina. Vedi sopra: nemmeno
  Lusion e Obys usano `sessionStorage`. Noi dobbiamo.
- La percentuale conta i file. E' il caso peggiore di tutti: prometti
  precisione e consegni una barra che si blocca all'85%.
- Il preloader e' piu' lungo del caricamento vero. Se sulla tua connessione
  di sviluppo il sito e' pronto in 400 ms e l'intro dura 3 secondi, hai
  costruito un dazio.

### Le sette regole, in ordine di importanza

1. **Il numero e' un contratto. Se non hai un denominatore vero, non mostrare
   un numero.** Mostra una forma che si completa (un tratto, un cerchio, un
   logo che si disegna): nessuno la puo' smentire. Obys fa esattamente questo
   e il numero e' solo un ornamento.
2. **Chiudi il cancello sul dato vero, anche se il numero e' finto.**
   `if (this.loaded && this.animDone) this.cb()`. Puoi mentire
   sull'andamento; non puoi mentire sulla fine.
3. **Metti un tetto.** Nessuno dei due l'ha, ed e' il loro difetto. Regola:
   `setTimeout(forceEnter, 6000)` e vai avanti comunque, degradando quello
   che manca. Meglio una texture in ritardo che un visitatore in meno.
4. **`onerror` conta come `onload`.** Tre righe, e un 404 non ti blocca mai
   il sito.
5. **Sovrapponi sempre. Mai in sequenza.** Avvia l'animazione della pagina
   *prima* che la copertura sia aperta. I numeri misurati sui premiati:
   **~380 ms** di anticipo su Lusion (per costruzione della curva `expoInOut`),
   **150 ms** dichiarati su Obys (`de: 150`). Sotto i 100 ms non si nota,
   sopra i 600 ms si vede lo strappo. **Tara tra 200 e 400 ms.**
6. **La copertura non deve sfumare: deve trasformarsi in qualcosa.** La barra
   che diventa la lama (Lusion), il logo che diventa il logo dell'header
   (Obys). Il fade to black e' la confessione che non avevi un'idea.
7. **Budget: 2 secondi di pavimento, non 3,25.** Lusion impone 3,25 s a tutti,
   fibra compresa, e se lo puo' permettere perche' e' il suo portfolio. Per
   un cliente che vende: **il tempo minimo di intro deve essere inferiore al
   tempo di caricamento mediano**, mai superiore. Se il sito e' pronto prima,
   l'intro deve poter finire prima.

### Le due righe da rubare subito

```js
// 1. la scorciatoia per te, da Lusion: ogni impostazione via query string
this.override([...new URLSearchParams(location.search)].reduce((n,[a,l]) => (n[a] = l === "" ? true : l, n), {}));
// -> ?SKIP_ANIMATION=1 salta l'intro mentre lavori sulla sezione in fondo

// 2. il progresso in due fasi, da Lusion: 70% rete + 30% GPU
let t = taskPercent * 0.3 + loadPercent * 0.7;
// -> il 100% arriva quando gli shader sono compilati, non quando i file sono scesi
```

---

# Parte II — gli altri sette siti

Aggiunta successiva, stesso giorno. Stesso metodo: `curl` sull'HTML, poi
discesa nei bundle. I file stanno in `...\scratchpad\pl2`.

---

## II.1 Igloo Inc — il preloader che non conta niente, e lo dichiara

`igloo.inc` serve un `<body>` **vuoto**: 427 byte compressi, 1,4 KB di HTML.
Tutto sta in un modulo Vite, `assets/index-2eb69c09.js` (16 KB, 6 KB in
transito), che e' un'app Svelte minuscola il cui unico compito e' mettere in
scena il preloader e poi importare l'app 3D vera.

L'entry point completo, deminificato quel tanto che basta:

```js
(async t => {
  const n = document.createElement("div"); n.id = "app"; document.body.prepend(n);

  const e = new Loader({ target: n });        // Ht: il componente Svelte del preloader
  e?.show();

  const App3D = (await import("./App3D-f554a111.js")).default;

  const i = await new App3D({
    target: n,
    props: { interactionNode: ..., relativePath: ... },
    anchor: e.getEl()                         // <-- monta PRIMA del loader nel DOM
  }).ready;                                   // <-- attende la promise "ready" dell'app

  await new Promise(c => {
    e.$on("hidden", () => { e.$destroy(); c(); });
    e.hide();
  });
  return i?.();                               // solo ora parte davvero l'esperienza
})();
```

**La forma.** Nessuna percentuale, nessuna barra, nessun logo. Un solo
`div#loader` a tutto schermo con `background-color: var(--bgColor)` — che e'
`#A0A5B1`, **lo stesso grigio-azzurro della scena** — e al centro dieci
caratteri ASCII che ondeggiano. E' fatto con `content` animato in CSS, cento
keyframe scritti a mano:

```css
.ascii:before {
  color: #ffffff; content: '----------';
  font-size: 17px; font-family: monospace; font-weight: bold;
  animation-name: head; animation-duration: 5s; animation-iteration-count: infinite;
  text-shadow: 0 0 5px rgba(255,255,255,.4);
}
@keyframes head {
  0%  {content: '---===+++='}
  1%  {content: '----===+++'}
  2%  {content: '-----===++'}
  3%  {content: '------===+'}
  4%  {content: '=------==='}
  ...
  99% {content: '===+++===-'}
}
```

Cento step, `5s` di ciclo, `infinite`: un'onda di `-` `=` `+` che scorre da
destra a sinistra a 50 ms per fotogramma, cioe' **20 fps voluti**. Costa zero
JavaScript e continua a girare mentre il main thread e' bloccato a compilare
shader — che e' esattamente il momento in cui un contatore scritto in JS si
inchioda. Questo e' l'argomento tecnico a favore dell'animazione CSS pura nel
preloader, e nessun altro dei nove siti lo sfrutta.

**Il progresso e' reale?** Non esiste progresso. Zero. E' un segnale di vita,
non una misura. Ed e' una scelta onesta: quello che Igloo aspetta non e' un
download, e' `App3D.ready`, cioe' compilazione shader e primo frame. Un numero
li' sarebbe stato per forza inventato.

**Quanto dura.** Non c'e' una durata. Dura quanto `import()` + `ready`.
L'unica costante di tempo dichiarata e' l'uscita.

**Se il caricamento e' lento.** Nessun timeout, nessun ripiego, nessun
messaggio, nessun `catch`. Se `App3D.ready` non si risolve, l'onda ASCII
ondeggia per sempre. E' il difetto della soluzione: e' elegante finche' la
rete tiene.

**La transizione.** Qui c'e' il dettaglio che vale il viaggio: l'app 3D e'
montata con `anchor: e.getEl()`, cioe' **inserita nel DOM prima del nodo del
loader**. Il canvas sta gia' vivendo, dietro, mentre il loader e' ancora opaco
al 100%. Poi:

```js
o = W(ascii,  fade, { duration: 250, easing: cubicInOut });  // il testo sparisce
c = W(loader, fade, { duration: 750, easing: cubicInOut });  // il fondo sparisce
// l'easing usato per entrambi:
function cubicInOut(t){ return t < .5 ? 4*t*t*t : .5*Math.pow(2*t-2,3)+1 }
```

I due `fade` partono **nello stesso frame**. L'ASCII se ne va in 250 ms; il
velo impiega 750 ms. Quindi **mezzo secondo di scena viva vista attraverso un
velo che si dissolve**, e il `return i?.()` — la vera partenza
dell'esperienza — arriva *dopo* l'evento `hidden`, a velo gia' tolto.

Nota sul fondo: il velo e' `var(--bgColor)`, identico al fondo della scena. Un
velo che dissolve verso il proprio stesso colore non si vede sparire: si vede
solo comparire il contenuto. E' il trucco piu' economico di tutto il documento,
e si copia in una riga.

**Vendita.** Nessuna. Niente logo, niente claim, niente clienti. Dieci
trattini.

---

## II.2 Active Theory — il contatore piu' costruito che abbia letto

`activetheory.net` e' l'opposto di Igloo. L'HTML e' uno shell con il CSS
critico inline e uno script che inietta `assets/js/app.<cache>.js` (1,8 MB non
compressi, 348 KB in transito). Dentro c'e' il loro framework, Hydra, e due
componenti: `LoaderView` (il DOM) e `LoaderGLUI` (un piano WebGL con shader).

### Il conteggio: file **e** traguardi, nello stesso denominatore

Il motore e' `AssetLoader`:

```js
function increment() {
  let percent = Math.max(_lastFiredPercent, Math.min(1, ++_loaded / _total));
  _this.events.fire(Events.PROGRESS, { percent });
  _lastFiredPercent = percent;
  _loaded >= _total && defer(complete);
}
this.add     = function(num){ _total += num || 1 };
this.trigger = function(num){ for (let i = 0; i < (num || 1); i++) increment() };

AssetLoader.SPLIT   = 2;      // solo 2 richieste in parallelo
AssetLoader.TIMEOUT = 5e3;    // 5 secondi per asset
```

Tre cose da rubare:

1. **`++_loaded / _total` e' un conteggio di file.** Un `.glsl` da 800 byte e
   un `.mp4` da 12 MB pesano identico. Nemmeno loro pesano i byte.
2. **`Math.max(_lastFiredPercent, ...)` rende la percentuale monotona.** Non
   puo' tornare indietro nemmeno quando `_total` cresce a meta' strada — e
   cresce, per via di `add()`.
3. **`add()`/`trigger()` mettono i traguardi non-file nello stesso conto.** E'
   il pezzo intelligente, e si vede in `LoaderView`:

```js
_this.text.percent = 0;
_this.params.loader.add(2);
_this.bind("FXScroll/firstScene", _ => _this.params.loader.trigger(1));
_this.params.loader.add(1);
_this.bind("ContactUI/ready",     _ => _this.params.loader.trigger(1));
_this.params.loader.add(1);
_this.bind("NavUI/ready",         _ => _this.params.loader.trigger(1));

_this.onInit = async _ => {
  await GPU.ready();
  await World.instance().ready();
  _this.gluiLoader = _this.createFragment(LoaderGLUI);
  await _this.gluiLoader.ready();
  _this.params.loader.trigger(1);
};
```

Il 100% di Active Theory non e' "i file sono scesi". E' "i file sono scesi
**e** la prima scena esiste **e** la UI dei contatti e' pronta **e** la nav e'
pronta **e** la GPU ha finito". Cinque unita' aggiunte a mano al denominatore
dei file. E' l'unica implementazione, fra i nove siti, in cui il 100% significa
davvero "puoi interagire".

### La forma: un blocco di `/` che si riempie, e un numero a tre caratteri

```js
_this.startRender(_ => {
  let text = "";
  for (var i = 0; i < 16; i++) { for (var j = 0; j < 30; j++) text += "/"; text += "\n"; }
  tick++;
  text = text.slice(0, Math.round(_this.text.percent * text.length));   // <-- il riempimento
  text.length > 0
    ? _this.behind.html(replaceRandomLetters(text, tick % 2 == 0 ? 30 : 0))
    : _this.behind.html(text);
}, 12);   // 12 fps
```

Una griglia 30x16 di barre oblique, tagliata in proporzione al progresso: e'
**una barra di caricamento fatta di testo**, che si riempie riga per riga.
Sopra ha una maschera circolare:

```js
_this.behind.size(220,220).center().css({ textAlign: "left", opacity: .4 });
_this.behind.css({ maskImage: "radial-gradient(black 49%, transparent 50%)" });
```

quindi all'occhio e' un disco che si riempie. Ogni due tick, 30 caratteri a
caso vengono sostituiti — e vengono sostituiti **con le cifre della percentuale
corrente** (`replacementChars = Math.round(100*percent).toString()`): il
glitch e' generato dal dato, non dal caso.

Il numero al centro, a 24 fps, con il colore che cambia a ogni fotogramma:

```js
let colors = ["#86cfd1", "#ace6e8", "#77c4d9"];
_this.startRender(_ => {
  _this.text.div.style.color = colors.random();
  let percent = Math.round(100 * _this.text.percent);
  percent < 10   && (percent = "//" + percent);
  percent < 100  && (percent = "/"  + percent);
  percent == 100 && (percent = ">>>");
  _this.text.text(`${percent}`);
}, 24);
```

Larghezza fissa a tre caratteri riempiendo con `/` invece che con `0` (`//7`,
`/42`), e al 100% il numero non e' `100`: diventa `>>>`. Font `nbarchitekt`,
16 px, `letterSpacing: .1em`, colori `#81ecfe` e `#e0fff6`.

### Il tetto al 90% e le due frenate

```js
_this.bind(_this.params.loader, Events.PROGRESS, ({ percent }) => {
  tween(_this.text, { percent: .9 * percent }, 500, "linear");
});
```

**Il contatore visibile non passa mai il 90%** durante il caricamento: il valore
reale e' moltiplicato per `0.9`. L'ultimo 10% e' riservato al segnale di
completamento — cosi' il salto finale c'e' sempre, anche quando l'ultimo file
arriva di colpo. E ogni aggiornamento e' un tween di 500 ms lineare: il numero
non salta mai, insegue.

Sotto, lo shader riceve lo stesso valore ancora piu' smorzato:

```js
bgShader.uniforms.uProgress.value = Math.lerp(_this.progress, bgShader.uniforms.uProgress.value, .02);
```

Un `lerp` a `0.02` per frame: a 60 fps il velo copre il 63% della distanza in
circa 50 frame, cioe' **quasi un secondo di ritardo permanente** sul numero.
Voluto: il grafico non deve mai scattare, il numero si'.

Lo shader di fondo, per i parametri:

```js
Shader("LoaderBGShader", {
  uColor:    { value: new Color("#111111") },
  uBars:     { value: Device.mobile.phone ? 24 : 20 },   // 20 barre su desktop
  uHeight:   { value: .14 },
  uProgress: { value: 0 }, uVisible: { value: 1 }, uAlpha: { value: 0 },
  transparent: true
});
```

### L'uscita: 1,2 secondi che partono prima della fine

```js
_this.bind(_this.params.loader, Events.COMPLETE, async _ => {
  _this.behind.tween({ opacity: 0 }, 2e3, "easeOutSine");     // parte SUBITO, niente await
  _this.text.tween({ opacity: 0 },   2e3, "easeInOutSine");   // parte SUBITO, niente await
  await tween(_this.text, { percent: 1 }, 300, "easeOutSine").promise();
  await _this.gluiLoader.animateOut();                        // altri 500 ms
  _this.fire("Global/loadFinished");                          // <-- il sito parte QUI
  animateInScrollbar();
  _this.destroy();
});

// animateOut di LoaderGLUI:
bgShader.tween("uVisible", 0, 500, "easeInCubic");
await _this.ui.tween({ alpha: 0 }, 500, "easeInCubic").promise();
```

Leggilo al contrario e vedi il trucco: le due dissolvenze da **2000 ms** non
sono attese, partono e basta. Poi il codice aspetta 300 ms (la corsa da 90 a
100) e altri 500 ms (`animateOut`). Quindi quando viene sparato
`Global/loadFinished` le dissolvenze sono in corso da 800 ms e ne hanno ancora
**1200 ms davanti**: il sito parte con il vecchio schermo ancora visibile a
circa il 40% di opacita'. Stessa idea di Lusion, numeri piu' grossi:
**1,2 s di sovrapposizione contro ~380 ms.**

Ultimo tocco, e va rubato: **la scrollbar non esiste finche' non hai finito.**
Il CSS critico nell'HTML dichiara `:root{--baropacity:0.0}` e la thumb la usa
(`background: rgba(255,255,255,var(--baropacity,.9))`). Poi:

```js
function animateInScrollbar() {
  let obj = { opacity: 0 }, root = document.documentElement;
  tween(obj, { opacity: .9 }, 2e3, "easeOutSine", 500)
    .onUpdate(() => root.style.setProperty("--baropacity", obj.opacity));
}
```

Due secondi di dissolvenza con 500 ms di ritardo. La barra di scorrimento
compare **dopo**, come ultimo elemento dell'ingresso, e ti dice "adesso puoi
scorrere" senza scriverlo.

### Se il caricamento e' lento

C'e' un timeout, ed e' **decorativo**:

```js
let timeout = Timer.create(timedOut, AssetLoader.TIMEOUT, path);   // 5000 ms
...
function timedOut(path) { console.warn("Asset timed out", path); }
```

Cinque secondi per asset e allo scadere **scrive in console, punto**. Non
incrementa, non salta, non degrada. L'unica rete di sicurezza vera e' che gli
errori contano come successi:

```js
.catch(e => { console.warn(e); loaded() })
image.onload = loaded;  image.onerror = loaded;
```

Un 404 non blocca il sito; una richiesta appesa lo blocca per sempre. E con
`SPLIT = 2` — due download in parallelo — un asset appeso si mangia meta' della
banda del caricatore.

**Vendita.** Nessun claim, nessun cliente. Active Theory vende con l'estetica:
monospazio, ciano su nero, `>>>` al posto di `100`. Dice "siamo ingegneri"
senza scriverlo.

---

## II.3 Immersive Garden — l'unico che ci scrive il claim, e l'unico che parte da un numero a caso

`immersive-g.com` e' un Nuxt 3 con SSR. Il componente sta tutto in un chunk
di 5,8 KB, `assets/IntroLoader.D9qttrK0.js`, e la roba pesante in
`assets/Preloader.CCgyJU7b.js` (61 KB in transito, 183 KB espansi: three.js,
draco, ktx2, exr).

### Il claim: si', qualcuno ci scrive cosa fa

E' l'unico dei nove. Le props del componente:

```js
props: {
  main:        { type: Boolean, default: false },
  baseline:    { type: String,  default: "Innovative digital experiences studio" },
  scrollDown:  { type: String,  default: "Scroll down" },
  forceDarkBg: { type: Boolean, default: null }
}
```

Il markup SSR che arriva nella prima risposta HTML, gia' scritto, gia'
indicizzabile:

```html
<div class="introLoader hidden">
  <div class="introLoader__bg"></div>
  <div class="gridWrapper padding rowGap introLoader__wrapper">
    <div class="introLoader__logo"><svg ...>...</svg></div>
    <div class="introLoader__progressWrapper">
      <div class="introLoader__progressBar"></div>
      <div class="introLoader__baseline">
        <div>Innovative  </div><div>digital  </div>
        <div>experiences  </div><div>studio  </div>
      </div>
    </div>
    <div class="introLoader__scrollDown"><div><div>Scroll down</div></div></div>
  </div>
</div>
```

Tre cose in quello schermo: il logo, **quattro parole che dicono che mestiere
fanno**, e **l'istruzione su cosa fare dopo** ("Scroll down"). Non e' un
preloader: e' una copertina. E la frase e' spezzata in una `<div>` per parola
perche' le parole entrano in sfalsamento:

```js
const e1 = computed(() => props.baseline.split(" "));
...
n.to([].slice.call($baselineWords), { opacity: 1, duration: 1.25, ease: "sine.inOut", stagger: .1 }, .25);
```

`stagger: .1` — cento millisecondi fra una parola e l'altra, `1.25 s` di
dissolvenza ciascuna, partendo a `+0.25 s`. La frase si compone mentre carica.

Tipografia, dal CSS: `font-family: PSTimes, serif; font-size: 1.9444vw`
(tappata a 37,24 px sopra 1915 px e a 28 px sotto 1440 px). Un **serif**, non
un monospazio: non stanno dicendo "siamo tecnici", stanno dicendo "siamo uno
studio".

### Il progresso: file contati, ma con un regalo iniziale casuale

Il conteggio, in `Preloader.CCgyJU7b.js`:

```js
_preloadProgressHandler(e) {
  this._preloadedResources++;
  this._progress = this._preloadedResources / this._resourcesToPreload.length;
  this.dispatchEvent("progress", this._progress);
}
_preloadErrorHandler() {}          // <-- vuoto. vedi sotto.
```

Ancora **conteggio di file**. Ma sopra ci mettono due cose che nessun altro ha:

```js
const y = .05 + .05 * Math.random();       // <-- il pavimento, casuale fra 5% e 10%
...
function N(e) {                            // handler del "progress"
  _.value = e;
  !f.value && (L.value = Math.max(y, _.value));
}
```

**La barra non parte mai da zero, e il punto di partenza e' diverso a ogni
caricamento**: un numero casuale fra 5% e 10%. Obys fa lo stesso regalo ma
fisso al 30% e solo nelle navigazioni interne; qui e' al primo caricamento ed
e' randomizzato, cosi' non sembra una costante. E' una bugia da un ventesimo di
barra, e serve a non mostrare mai una barra vuota.

Poi lo smorzamento, nel tick:

```js
u.value += (L.value - u.value) * .1;                      // insegue al 10% per frame
const e = Math.abs(u.value - L.value);
if (C.value && e < .001 && L.value >= 1) {                // convergenza, non uguaglianza
  C.value = false; u.value = 1; progressComplete();
} else if (C.value) I.value = u.value;
S.globals.$loaderLine.progressLoad(u.value);
```

Il completamento non scatta quando il progresso reale tocca 1: scatta quando il
**valore smorzato** e' arrivato entro `0.001` dall'1. Con un lerp a `0.1` la
distanza si riduce del 10% a fotogramma, quindi da 1 a 0,001 servono
`log(0.001)/log(0.9) ≈ 66 fotogrammi`, cioe' **circa 1,1 secondi di coda a
60 fps dopo che l'ultimo file e' arrivato**. Quel secondo di coda e' il prezzo
dell'inseguimento morbido, ed e' pagato con gli occhi aperti.

### La forma: un logo che si scopre, e una linea che e' uno shader

Due indicatori, e **solo uno dei due e' vero**.

*Falso*: il logo si scopre da sinistra a destra grazie a una maschera SVG con
gradiente, e la maschera si muove con **una durata fissa**:

```js
// dentro l'SVG del logo:
// <linearGradient id="..._gradient">
//   <stop offset="0"   stop-color="white" stop-opacity="1"/>
//   <stop offset=".33" stop-color="white" stop-opacity="1"/>
//   <stop offset=".66" stop-color="white" stop-opacity="0"/>
//   <stop offset="1"   stop-color="white" stop-opacity="0"/>
// </linearGradient>
// <mask ...><rect x="0" y="0" width="510" height="22" fill="url(#..._gradient)"/></mask>

const rect = logoSvg.querySelector("defs > mask > rect");
d.fromTo(rect, { x: "-66%" }, { x: 0, duration: 2.5, ease: "quart.out" }, 0);
```

Il rettangolo della maschera e' largo **510** contro i **170** del logo (tre
volte), e trasla da `-66%` a `0` in **2,5 secondi fissi con `quart.out`**. Non
guarda la rete. E' l'equivalente del finto `0->100%` che avevi trovato, solo
che invece di essere un numero e' una carezza di luce sul logo — e siccome non
e' un numero, **nessuno la puo' smentire**.

*Vero*: la linea sotto la frase. E' un `<div class="introLoader__progressBar">`
alto 1px con `opacity:.2`... che pero' **non disegna niente**. Serve solo a
misurare la posizione: la linea vera e' un mesh WebGL a schermo intero il cui
shader legge il rettangolo del div.

```js
onWindowResize({ innerWidth: e, innerHeight: t }) {
  const s = this._getAbsoluteRect(this._element);
  uniforms.uPosition.value.set(s.left / e, 1 - s.top / t);
  uniforms.uWidth.value = s.width / e;
}
progressLoad(e) { uniforms.uLoadProgress.value = e }
fadeAnimation(e = 1, t = "power2.inOut") { return gsap.to(uniforms.uFadeProgress, { value: 1, duration: e, ease: t }) }
```

e nel fragment shader:

```glsl
float width = uWidth * lineProgress;                 // <-- la lunghezza E' il progresso
vec2 leftPoint  = vec2(left, top);
vec2 rightPoint = leftPoint + vec2(width, 0.);
float distOnLine = cremap(length(uv.x - rightPoint.x) + (fadeProgress - 0.5) * 2. * width, 0., width, 0., 1.);
...
void main() {
  float alpha = .2;
  float blurredLine = 0.;
  blurredLine += drawBlurryLine(uv, (OSCILLATION_STRENGTH + 0.0) * 0.1) * (2./8.);
  blurredLine += drawBlurryLine(uv, (OSCILLATION_STRENGTH + 0.1) * 0.1) * (4./8.);
  blurredLine += drawBlurryLine(uv, (OSCILLATION_STRENGTH + 0.3) * 0.1) * (2./8.);
  gl_FragColor = vec4(uColor.rgb, blurredLine * alpha);
}
```

Tre passate della stessa linea con oscillazioni sfalsate, pesate `2/8`, `4/8`,
`2/8`, piu' un rumore "fumo" animato nel tempo. Il risultato e' una linea di
1px che **respira e sfrigola** invece di stare ferma. E `uFadeProgress` non
sfuma la linea: la **cancella da destra verso sinistra**, perche' entra nel
calcolo della distanza lungo la linea.

Sintesi della coppia: la cosa piu' visibile (il logo) e' finta e ha una durata
comoda; la cosa piu' discreta (la linea) e' vera. Cosi' non c'e' mai una
barra piantata all'85%, ma c'e' comunque un'informazione onesta per chi la
guarda.

### L'uscita: due finali diversi, e il piu' interessante e' il secondo

```js
// A) hideOnComplete = true (pagine interne): il loader se ne va
function l1() {
  const e = gsap.timeline({ delay: 0 });
  updateMainLoader({ hideStart: true });
  e.add($loaderLine.fadeAnimation(3.5, "quart.inOut"), 0);          // 0 -> 3.5 s
  e.to($bg, { opacity: 0, duration: 1.2, ease: "sine.inOut" }, ">-.5");  // 3.0 -> 4.2 s
  const rect = logoSvg.querySelector("defs > mask > rect");
  e.to(rect, { x: "-66%", duration: 2, ease: "quart.inOut" }, 0);   // il logo si ri-copre
  e.add(() => { updateMainLoader({ hideComplete: true }) }, "<");   // <-- al tempo ZERO
  return e;
}
```

Guarda l'ultima riga. `hideComplete` — il segnale con cui il resto del sito sa
che puo' partire — viene sparato a `"<"`, cioe' **all'istante zero della
sequenza di uscita**, mentre la linea ha ancora 3,5 secondi di dissolvenza
davanti e il fondo non ha nemmeno cominciato a sfumare (parte a 3,0 s e finisce
a 4,2 s). **La pagina parte quattro secondi prima che la copertura sia via.**
E' il caso piu' estremo del documento: qui l'anticipo non e' un ritocco di
qualche decimo, e' quasi tutta la transizione.

```js
// B) hideOnComplete = false (la home): il loader DIVENTA la prima schermata
function s1() {
  const e = gsap.timeline({ delay: 0 });
  e.add($loaderLine.fadeAnimation(3.5, "quart.inOut"), 0);
  e.to($bg, { opacity: 0, duration: 1.2, ease: "sine.inOut" }, 0);   // il fondo se ne va subito
  const n = 1.9;
  // e ora tutto RIENTRA, sopra il WebGL scoperto:
  e.to(logoSvg, { opacity: 1, duration: .5, ease: "sine.inOut" }, n);
  e.fromTo($baselineWords, { opacity: 0 }, { opacity: 1, duration: 1, ease: "sine.inOut", stagger: .1 }, n);
  e.fromTo($scrollDown,    { opacity: 0 }, { opacity: 1, duration: .8, ease: "sine.inOut" }, ">-.5");
  return e;
}
```

Sulla home il preloader **non se ne va affatto**. Il fondo grigio `#e8e8e8`
diventa trasparente in 1,2 s scoprendo la scena WebGL, e a `1.9 s` il logo, la
frase e "Scroll down" **rientrano sopra la scena**: il preloader si e'
trasformato nella hero. E resta agganciato allo scroll con una parallasse:

```js
a.introLoaderVisible = Scroll.scrollY > -30;
k.value = Scroll.scrollY * .2;
$scrollDownText.style.transform = `translateY(${k.value}px)`;
$logoWrapper.style.transform   = `translateY(${k.value}px)`;
$baseline.style.transform      = `translateY(${k.value}px)`;
```

Coefficiente `0.2`: scorre a un quinto della velocita' della pagina. E'
letteralmente la regola "la copertura non si toglie, si trasforma", portata
all'estremo: qui la copertura **e'** il contenuto.

### Se il caricamento e' lento

Nessun timeout, come tutti. Ma due cose sole valgono la lettura.

**Male:** `_preloadErrorHandler() {}` e' vuoto e **non incrementa il
contatore**. Un asset che fallisce fa restare `_progress` sotto 1 per sempre,
e siccome il cancello e' `L.value >= 1`, il sito non si apre. E' il caso
peggiore fra i nove: Obys e Active Theory contano l'errore come successo, qui
no.

**Bene:** hanno un sistema di ripieghi dichiarativo per formato, per
dispositivo:

```js
_updateFallbacks(e) {
  const A = [], t = [];
  e.forEach(r => {
    if (r.fallback) {
      const n = Object.keys(r.fallback);
      for (let s = 0; s < n.length; s++) {
        const c = n[s];
        if (this._fallbacks[c] === true) { t.push(r); A.push(r.fallback[c]); break }
      }
    }
  });
  e = e.filter(r => !t.includes(r));
  e.push(...A);
  return e;
}
```

Ogni risorsa puo' dichiarare `fallback: { noKtx2: <altra risorsa>, noWebp: ... }`
e in fase di costruzione della lista viene **sostituita** in base alle
capacita' rilevate. Non e' un ripiego a caricamento fallito: e' un ripiego
*prima* di caricare. Piu' utile, perche' non paghi due download.

E c'e' il partizionamento per vista, cosi' il preloader aspetta solo cio' che
serve alla prima schermata:

```js
const s = production || development || e.name === this._firstView;
A.add({ resources: e.resources.items, namespace: e.name, preload: s }, true);
```

Solo la vista corrente (`_firstView`) e quelle marcate `preload: production`
entrano nel conto. Il resto scende dopo. **Questa e' la leva che accorcia
davvero un preloader**, molto piu' che ottimizzare le texture.

---

## II.4 Bruno Simon — il caso in cui il preloader non copre niente

Il portfolio nuovo (three.js/WebGPU, `assets/index-ORr3L4no.js`: **1,03 MB in
transito, 4,86 MB espansi**) e' l'esempio migliore di una cosa che nessun altro
fa: **non c'e' nessuna copertura**. Nel `<body>` non esiste un
`div.loading-screen`, non esiste una classe `preloader`. C'e' il canvas e
basta:

```html
<body>
  <div class="js-fonts-loader fonts-loader">
    <div class="font nunito"    data-font="400 20px Nunito"> </div>
    <div class="font amatic-sc" data-font="700 20px 'Amatic SC'"> </div>
    <div class="font pally"     data-font="500 20px Pally-Medium"> </div>
  </div>
  <div class="game">
    <canvas class="js-canvas"></canvas>
    ...
```

(Quei tre `div` non sono un preloader: sono la sonda per sapere quando i font
sono pronti — un `<div>` per font con la `data-font` da passare a
`document.fonts.check`.)

### L'ordine di avvio: il motore parte prima dei contenuti

In `Game.start()`, semplificando ma senza cambiare l'ordine:

```js
await this.rendering.setRenderer();
await this.resourcesLoader.load([               // 1) tre texture minuscole
  ["starsTexture",   "behindTheScene/stars.ktx?cb=1", "textureKtx", ...],
  ["soundTexture",   "intro/sound.ktx?cb=1",          "textureKtx", ...],
  ["paletteTexture", "palette.ktx?cb=1",              "textureKtx", ...]
]);                                              // nessuna callback di progresso: dura un lampo
this.respawns = new Respawns("landing"); this.view = new View();
this.rendering.setPostprocessing();
this.rendering.start();                          // 2) IL LOOP DI RENDER PARTE QUI
this.reveal = new Reveal(); ... this.world = new World();

const a = import("./rapier-BmPn8Tpt.js");        // 3) la fisica, in parallelo
const h = this.resourcesLoader.load([ /* ~60 fra glb e ktx */ ],
  (f, p) => { this.world.intro.updateProgress(1 - f / p) });   // <-- progresso
const [c, d] = await Promise.all([h, a]);
```

Le tre texture del punto 1 sono **precaricate dall'HTML** (`<link rel="preload"
as="fetch" crossorigin>` per `stars.ktx`, `intro/sound.ktx`, `palette.ktx` e
`respawnsReferences-compressed.glb`): quando il JS le chiede sono gia' in
cache. Quindi il render loop parte quasi subito e il resto scende **mentre la
scena e' gia' viva**.

### La forma: un anello, per terra, dentro il mondo

Il progresso e' un `RingGeometry(3.5 - 0.04, 3.5, 128, 1)` appoggiato sul
terreno a `y = 0.001`, nel punto esatto in cui comparira' il giocatore. Il
riempimento e' fatto scartando i frammenti oltre l'angolo:

```js
o.outputNode = Fn(() => {
  const c = atan(positionGeometry.y, positionGeometry.x).div(PI2).add(0.5).oneMinus();
  this.circle.smoothedProgress.lessThan(c).discard();
  return vec4(this.game.reveal.color.mul(this.game.reveal.intensity), 1);
})();
// reveal.color = "#e88eff", reveal.intensity = 5.5  -> colore fuori gamma, lo prende il bloom
```

Colore `#e88eff` moltiplicato per 5,5: e' volutamente fuori scala, cosi' il
post-processing lo trasforma in un anello che **brucia**. Non e' un elemento
di interfaccia sopra la pagina: e' un oggetto illuminato nel mondo.

Lo smorzamento, e questo e' scritto meglio di tutti gli altri:

```js
updateProgress(e) { this.circle.progress = e }
update() {
  this.circle.smoothedProgress.value +=
    (this.circle.progress - this.circle.smoothedProgress.value) * this.game.ticker.delta * 10;
}
```

Nota `* this.game.ticker.delta * 10` invece di `* 0.1`: e' **corretto sul
tempo**, non sul fotogramma. A 30 fps insegue alla stessa velocita' reale che a
144 fps. Immersive Garden e Active Theory usano un coefficiente per frame e su
un portatile lento la loro barra e' piu' lenta. Questa e' la versione giusta.

E il conteggio, ancora una volta:

```js
load(e, r = null) {
  return new Promise((s, o) => {
    let a = e.length;
    const c = () => { a--; typeof r == "function" && r(a, e.length); a === 0 && s(h) };
    const f = (p) => { console.log(`Resources > Couldn't load file ${p[1]}`); o(p[1]) };   // <-- reject
    ...
  });
}
```

`1 - rimanenti/totale`: **file, non byte**, per la sesta volta su sei siti. E
attenzione all'`f`: un errore fa `reject` **dell'intera Promise**, quindi
`await Promise.all([...])` esplode e il gioco non parte. E' la gestione errori
piu' fragile del gruppo — piu' fragile persino di Immersive Garden, che almeno
non lancia.

### L'uscita: nessuna dissolvenza, una porta che l'utente apre

Quando il caricamento finisce:

```js
this.game.world.intro.circle.hide(() => {
  this.game.world.grid.show();
  this.distance.value = 0;
  gsap.to(this.distance, { value: 3.5, ease: "back.out(1.7)", duration: 2 / r, overwrite: true });
  this.game.view.zoom.smoothedRatio = 0.6; this.game.view.zoom.baseRatio = 0.6;
  gsap.to(this.game.view.zoom, { baseRatio: 0.3, ease: "power1.inOut", duration: 1.25 / r });
  this.game.world.intro.setText(); this.game.world.intro.setSoundButton();
  this.game.ticker.wait(1, () => { this.game.world.intro.showLabel() });
  ...
});

// circle.hide:
gsap.to(c, { scale: 0, duration: 1.5 / d, ease: "power4.in",
             onUpdate: () => a.scale.setScalar(c.scale),
             onComplete: () => { h(); a.removeFromParent() } });
```

L'anello **si contrae fino a sparire in 1,5 s con `power4.in`** (quindi quasi
tutto il movimento nell'ultimo terzo: sta fermo, poi collassa), e dal punto in
cui e' collassato parte l'onda di rivelazione del mondo (`distance` da 0 a 3,5
con `back.out(1.7)` in 2 s — la curva `back` fa **superare il bersaglio e
tornare**). Il preloader non si toglie: **implode e diventa l'esplosione da cui
nasce la scena.**

L'etichetta con i comandi arriva dopo, e con l'ease piu' allegro del
documento:

```js
showLabel() {
  gsap.to(e, { scale: 1, duration: 2 / r, delay: 1 / r, ease: "elastic.out(0.5)", ... });
}
```

Un secondo di ritardo, due secondi di durata, `elastic.out(0.5)`: rimbalza.

**E poi si ferma.** Finito il caricamento, il sito **non entra da solo**:
aspetta un gesto dell'utente.

```js
const h = this.game.rayCursor.addIntersect({
  active: true, shape: new Sphere(a, 3.5), onClick: s,
  onEnter: () => gsap.to(this, { intensityMultiplier: 1.22, duration: .2 }),
  onLeave: () => gsap.to(this, { intensityMultiplier: 1,    duration: .2 })
});
this.game.inputs.addActions([{
  name: "introStart", categories: ["intro"],
  keys: ["Gamepad.cross","Keyboard.Enter","Keyboard.ArrowUp","Keyboard.ArrowDown","Keyboard.KeyW","Keyboard.KeyD"]
}]);
```

Il cerchio a terra e' cliccabile (e si illumina del 22% al passaggio del
puntatore), oppure va bene Invio, una freccia, W, D, o il tasto croce del
gamepad. E' l'unico dei nove che chiude il preloader **con un'azione**, non con
un timer — e ha ragione: senza un gesto il browser non fa partire l'audio, e
senza il gesto non sai nemmeno se la persona sta ancora guardando.

### Le scorciatoie e i ripieghi

```js
const r = location.hash.match(/skip/i) ? 4 : 1;   // #skip -> tutte le durate diviso 4
...
if (location.hash.match(/skip/i)) this.updateStep(1);
```

`#skip` nell'URL: l'intro va a velocita' quadrupla e salta l'attesa del clic.
Stessa idea del `?SKIP_ANIMATION=1` di Lusion, versione minimale.

E la qualita' e' decisa su una riga sola, senza test prestazionali:

```js
const e = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
this.level = e ? 1 : 0;
```

**Vendita.** Zero testo. Il claim di Bruno Simon e' che stai gia' guidando.

---

## II.5 Lando Norris — il gate piu' pigro e la battuta migliore

`landonorris.com` e' un Webflow vestito da OFF+BRAND. Il preloader/transizione
e' un **file Rive**, non codice di animazione:

```js
const RIVE_BASE = "https://assets.itsoffbrand.io/lando/rive/";
const src = RIVE_BASE + "page-transition.riv";
const $wrap   = document.querySelector(".transition-w");
const $canvas = $wrap?.querySelector("canvas[data-rive-primary]");
const $btn    = $wrap?.querySelector(".transition-btn");
$btn.style.transition = "opacity 300ms";
```

Il markup:

```html
<div class="transition-w">
  <div class="transition-rive w-embed"><canvas data-rive-primary></canvas></div>
  <div class="transition-btn">
    <a data-btn-rive-hover data-theme="lime" href="#" class="btn-w w-inline-block">
      <div class="btn-inner"><div class="btn-inner-text-w">
        <div split-text="chars" class="btn-text">Load Norris</div>
      </div></div>
    </a>
  </div>
</div>
```

**"Load Norris".** E' l'unica cosa scritta sul preloader ed e' una battuta sul
nome del cliente (Chuck Norris). Il bottone ha `href="#"` e nel bundle non
esiste nessun gestore di clic su `.transition-btn`: **non e' un pulsante, e'
una didascalia a forma di pulsante.** Serve a far ridere per un secondo.

### Il meccanismo: tre booleani in una macchina a stati

```js
new Rive({
  src, canvas: $canvas,
  artboard: "page-transition", stateMachines: "page-transition",
  autoplay: true,
  layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
  onLoad: () => {
    riveInstance.resizeDrawingSurfaceToCanvas();
    const inputs = riveInstance.stateMachineInputs("page-transition");
    const initial = inputs.find(i => i.name === "initial");
    const out     = inputs.find(i => i.name === "transition-out");
    const inp     = inputs.find(i => i.name === "transition-in");
    initial.value = true; out.value = false; inp.value = false;
    $wrap.style.backgroundColor = "transparent";   // <-- il DOM molla, disegna Rive
  },
  onLoadError: (e) => { console.error("Failed to load Page Transition Rive file:", e) }
});
```

Tre input booleani (`initial`, `transition-out`, `transition-in`) e tutta la
coreografia sta **dentro il `.riv`**, disegnata dal motion designer, non
scritta dallo sviluppatore. Il codice si limita ad alzare bandierine.

Da rubare la riga `$wrap.style.backgroundColor = "transparent"`: il contenitore
ha un colore di fondo CSS finche' Rive non e' pronto a dipingere, e nel
momento esatto in cui lo e' il DOM lo cede al canvas. E' la stessa idea di
`html.is-ready #preloader { background-color: transparent }` di Lusion, con
un'altra tecnologia. Chiunque metta un canvas sopra una copertura deve fare
questo passaggio, altrimenti si becca un fotogramma di sfarfallio.

L'apertura:

```js
function pageTransitionIn({ initialInput, transitionInInput, transitionOutInput }) {
  initialInput.value = false; transitionOutInput.value = false; transitionInInput.value = true;
  setTimeout(() => { $btn.style.opacity = "0" }, 100);       // "Load Norris" sfuma (300 ms)
  setTimeout(() => {
    $wrap.style.visibility = "hidden";
    $wrap.style.pointerEvents = "none";
    $btn.style.display = "none";
  }, 500);                                                   // dopo mezzo secondo, via
}
```

### Il gate: `document.readyState === "complete"`. E qui casca l'asino.

```js
function wP() {
  const el = document.querySelector("[data-page]");
  const page = el.dataset.page;
  function isReady() { return document.readyState === "complete" }
  const K = () => {
    if (isReady()) {
      /* ... init della pagina ... */
      setTimeout(() => { XP(); SL() }, 500);
      gw(); W(); wL();
      setTimeout(() => { pageTransitionIn() }, 1000);     // <-- apre dopo 1000 ms fissi
    } else requestAnimationFrame(K);
  };
  K();
}
```

Nessun contatore, nessun conteggio, nessun peso: il preloader di Lando Norris
aspetta **l'evento `load` della finestra**. `readyState === "complete"` vuol
dire *tutte* le sottorisorse: ogni immagine della pagina, anche quelle in
fondo, gli iframe, i font, gli script di terze parti. Su una home Webflow con
video, canvas WebGL, Klaviyo e Iubenda, e' il criterio piu' lento e meno
controllabile che esista, ed e' anche l'unico che nessuno degli studi WebGL
usa. Sopra ci mette poi **un secondo pieno** di attesa aggiuntiva
(`setTimeout(..., 1000)`), piu' i 500 ms dell'apertura Rive.

**Nessun timeout, nessun ripiego.** Se una richiesta di terze parti resta
appesa, `readyState` non diventa mai `complete` e la copertura non si apre mai.
Il `requestAnimationFrame(K)` gira all'infinito. E' l'unico dei nove in cui il
preloader puo' essere bloccato da uno script pubblicitario.

### La transizione fra pagine, e l'anticipo

Il sito usa Taxi.js (`data-taxi`, `data-taxi-view`). In uscita:

```js
const lL = 1000;
function TP(page) {
  window.closeNavigation();
  qP(); pageTransitionOut();            // la copertura si chiude
  setTimeout(() => { uw(); /* cleanup della pagina */ }, lL);   // 1000 ms dopo
}
```

In entrata:

```js
function PP(page) {
  setTimeout(() => { pageTransitionIn() }, 500);      // <-- la copertura si apre a 500 ms
  window.scrollTo(0, 0);
  XR(); UK.reinit(); IF = new jL; SL(); TL(); nH(); wL(); YR();   // init IMMEDIATO
  switch (page) {
    case PAGES.HOME: _L(); setTimeout(() => { l9(); X7() }, 50); h5(); break;
    ...
  }
}
```

Confronta i due numeri: le animazioni della pagina partono a **50 ms**, la
copertura comincia ad aprirsi a **500 ms**. **450 ms di anticipo** nelle
navigazioni interne. E nota che al primo caricamento gli stessi `setTimeout`
sono a **750 ms** contro l'apertura a 1000 ms: **250 ms** di anticipo. Sono le
stesse tre righe di codice con due tarature diverse — piu' generosa quando la
persona ha gia' visto il sito.

Sintesi: Lando Norris ha la coreografia piu' curata (un file Rive fatto a mano)
appesa al criterio di completamento piu' scadente del gruppo.

---

## II.6 don't board me — il finto 0->100% in tre secondi, trovato e datato

`dontboardme.com` (di *the first the last*) e' un Nuxt 3. Il componente
`CommonPreloader` sta in `_nuxt/entry.66570678.js`. E' il piu' interessante di
tutti perche' **ha due preloader diversi**, uno per desktop e uno per mobile, e
quello per mobile e' esattamente la bugia che cercavi.

### Il testo: qui si vende, e si vende bene

```html
<div class="preloader">
  <svg class="preloader__svg" width="100%" height="100vh">
    <rect width="100%" height="100%" fill="#F3C3CB" mask="url(#mask-1)"/>
    <defs><mask id="mask-1">
      <rect width="103%" height="100%" fill="#fff"/>
      <circle id="circle-mask" cx="50%" cy="50%" r="0" fill="#000"/>
    </mask></defs>
  </svg>
  <button class="preloader__ball-wrap"><svg><!-- pallina da tennis --></svg></button>
  <div class="preloader__content-wrap">
    <p class="preloader__title">bounce a ball to get to the site</p>
    <p class="preloader__title-mob">loading 0%</p>
    <p class="preloader__description">
      You've landed on a dog walking site. Follow our rules to keep your dog happy
    </p>
  </div>
</div>
```

Tre messaggi in tre secondi: **cosa fare** ("bounce a ball to get to the
site"), **dove sei finito** ("You've landed on a dog walking site"), e **il
tono di voce** (una pallina da tennis gialla che rimbalza). E' l'unico dei
nove che usa il preloader per dire al visitatore in che negozio e' entrato.
Immersive Garden ci mette un claim; questo ci mette una spiegazione e un
gioco.

Tipografia del titolo: `font-family: Bayon` (un display condensato), colore
`var(--c-red)` = `#e33529`. Fondo `#F3C3CB`, rosa.

### Desktop: nessun progresso, un clic e la palla insegue il puntatore

```js
onMounted(() => {
  isMobile.value = matchDevice("mobile");
  intro();                                        // p()
  if (!isMobile.value) window.addEventListener("mousemove", onMove);
});
// e nel template:
// <div class="preloader" onClickOnce="exitDesktop"> ...
```

`onClickOnce`. Non c'e' nessun contatore, nessuna soglia: **il preloader
desktop finisce quando clicchi.** Prima del clic la pallina insegue il
puntatore con mezzo secondo di ritardo e la maschera lo segue in tempo reale:

```js
function onMove({ clientX, clientY }) { pos.x = clientX; pos.y = clientY; follow() }
function follow() {
  const isMob = matchDevice("mobile");
  gsap.to(".preloader__ball-wrap", { x: pos.x + 20, y: pos.y + 20, duration: .5 });
  gsap.to("#circle-mask", { attr: { cx: pos.x - (isMob ? 0 : 27), cy: pos.y } });
}
```

Cioe': **il buco si aprira' esattamente dove hai il puntatore.** Non al centro
dello schermo: dove hai deciso tu di cliccare.

### E qui c'e' il numero che cercavi: 400 ms

```js
function exitDesktop() {
  if (isMobile.value) return;
  window.removeEventListener("mousemove", onMove);
  if (!pos.x && !pos.y) { pos.x = innerWidth / 2; pos.y = innerHeight / 2 }   // se non hai mai mosso il mouse

  const tl = gsap.timeline({ defaults: { duration: .6 } });
  tl.to(".preloader__content-wrap", { xPercent: -30, opacity: 0, duration: .4 });
  tl.to(".preloader__ball-wrap", { scale: 1, duration: 1.2,
        x: pos.x - 27 * 2, y: pos.y - 27, ease: "bounce.out" }, "<");
  tl.to(".preloader__ball-wrap", { duration: .3, opacity: 0, delay: .05, scale: 0 }, "<+=0.9");
  tl.to("#circle-mask", { attr: { r: 1800 }, duration: 1.3, ease: "power2.inOut",
    onStart()    { setTimeout(() => { animatePageWhilePreloader.value = true }, 400) },
    onComplete() { preloaderState.value = true; lockScroll(false) }
  });
}
```

Leggi l'`onStart`. Il buco comincia ad aprirsi, e **400 millisecondi dopo**
viene alzata una bandierina che si chiama, letteralmente,
`animate-page-while-preloader`. La bandierina e' consumata da un composable
dedicato, `useShowPageAnimFirst`, che e' il file piu' piccolo del sito e il
piu' istruttivo:

```js
// _nuxt/useShowPageAnimFirst.9f0c167c.js
function useShowPageAnimFirst(callback) {
  const preloaderState = useState("preloader-state");
  const animateWhilePreloader = useState("animate-page-while-preloader");
  preloaderState.value
    ? onMounted(() => { setTimeout(() => { callback() }, 300) })   // preloader gia' finito
    : watch(() => animateWhilePreloader.value, v => { v && callback() });
}
```

Quindi: **le animazioni di entrata della home partono a 400 ms dall'inizio di
un'apertura che dura 1300 ms.** Restano 900 ms in cui la pagina si anima
dietro una maschera ancora quasi chiusa. Con `power2.inOut` a `t = 400/1300 =
0.31` il raggio e' a `2 * 0.31² ≈ 19%` di 1800, cioe' circa 340 px: uno
spiraglio. La home sta gia' recitando dentro quel buco.

E il secondo ramo del composable e' la finezza: se il preloader e' **gia'**
finito (navigazione interna), le animazioni partono comunque con **300 ms** di
ritardo, cosi' il ritmo di entrata di una pagina e' lo stesso in tutti e due i
casi.

### Mobile: il finto 0->100% in tre secondi, con `ease: "none"`

```js
function intro() {
  const mm = gsap.matchMedia();
  const tl = gsap.timeline();

  mm.add("(min-width: 1024px)", () => {
    tl.fromTo(".preloader__title", { x: "-150%", transform: "translate(-50%, -50%)", opacity: 0 },
                                   { duration: .7, opacity: 1, transform: "translate(-50%, -50%)", x: "-50%" });
    tl.fromTo(".preloader__description", { opacity: 0, xPercent: -150 },
                                         { duration: .7, opacity: 1, xPercent: 0 }, "<+=0.25");
  });

  mm.add("(max-width: 1024px)", () => {
    tl.fromTo(".preloader__title-mob", { x: "-150%", transform: "translate(-50%, -50%)", opacity: 0 },
                                       { duration: .7, opacity: 1, transform: "translate(-50%, -50%)", x: "-50%" });
    tl.to(".preloader__description", { duration: .7, opacity: 1, x: 0 }, "<+=0.15");
    tl.to(counter, {                       // <-- ECCOLO
      roundProps: "value", value: 100,
      ease: "none", duration: 3,
      onComplete() { setTimeout(() => { exitMobile() }, 500) }
    });
  });
}
// e nel template:  "loading " + counter.value + "%"
```

`counter` e' `reactive({ value: 0 })`: **un oggetto JavaScript vuoto**. Non e'
collegato a niente. Nessun `fetch`, nessun `LoadingManager`, nessun evento.
E' un `gsap.to` su un numero, `ease: "none"`, `duration: 3`, e alla fine mezzo
secondo di pausa prima di uscire.

**Su mobile, "loading 42%" significa "sono passati 1,26 secondi".** Ne'
piu' ne' meno. Il tempo di caricamento non entra nel conto in nessun punto.
Durata totale garantita del preloader mobile: `0.7 + 0.15 + 3 + 0.5 = 4,35 s`
di sequenza (il contatore parte dopo il titolo), piu' `1.3 s` di apertura, e
poi la pagina.

E l'uscita mobile e' la stessa struttura, con lo stesso anticipo di 400 ms:

```js
function exitMobile() {
  const tl = gsap.timeline({ defaults: { duration: .6 } });
  tl.to(".preloader__content-wrap", { xPercent: -30, opacity: 0, duration: .4 });
  tl.to("#circle-mask", { attr: { r: 1000 }, duration: 1.3, ease: "power2.inOut",
    onStart()    { setTimeout(() => { animatePageWhilePreloader.value = true }, 400) },
    onComplete() { preloaderState.value = true; lockScroll(false) }
  });
}
```

Unica differenza: raggio finale `1000` invece di `1800`, perche' lo schermo e'
piu' piccolo.

### Il blocco dello scorrimento, fatto bene

```js
function useLockScroll(initial = true) {
  const locked = ref(initial);
  const lenis = useState("lenis");
  function lockScroll(v) {
    locked.value = v;
    v ? (document.body.style.overflow = "hidden",
         document.body.style.touchAction = "none",
         lenis.value.stop())
      : (document.body.style.overflow = "auto",
         document.body.style.touchAction = "unset",
         lenis.value.start());
  }
  return { lockScroll };
}
```

Tre cose insieme: `overflow`, `touchAction` (senza cui su iOS scrolli lo
stesso) e lo stop di Lenis (senza cui lo scorrimento smorzato continua per
conto suo). Chi ne dimentica uno si ritrova la pagina che scivola sotto il
preloader.

E il preloader **non torna mai piu'**, perche' e' un `v-if` sullo stato
globale:

```js
useState("preloader-state", () => false);
useState("navigation-state", () => true);
useState("animate-page-while-preloader", () => false);
...
return () => h("div", null, [ h(NuxtPage), preloaderState.value ? null : h(CommonPreloader) ]);
```

E' un'app a pagina singola: dopo il primo ingresso il componente e' rimosso
dall'albero e le navigazioni successive non lo rivedono. E' la cosa che manca
a Lusion e Obys — anche se qui e' un effetto collaterale dell'architettura,
non una decisione: **al ricaricamento della pagina il preloader riparte
identico**, perche' `preloader-state` vive in memoria e non in
`sessionStorage`.

---

## II.7 basement.studio — il controesempio, e vale piu' degli altri sei

Ho cercato un preloader su `basement.studio`. **Non c'e'.** Non sulla home,
non su `/lab`, non sulle pagine di caso studio. Ho controllato tre pagine e in
nessuna esiste un `<canvas>`, un `div.loader`, una classe `preloader` o un
gate in JavaScript. L'unico simbolo che assomiglia a un caricatore e'
`next-loader`, che e' un pezzo interno di Next.js.

Quello che c'e' invece:

```html
<main class="relative flex scroll-m-9 flex-col bg-brand-k pb-12 pt-4 ...">
  <h1 class="text-pretty text-f-h0-mobile lg:text-[5.4375rem] ...">
    A digital studio &amp; branding powerhouse making cool shit that performs
  </h1>
  ...
```

Il titolo e' nell'HTML della prima risposta. 34 KB compressi, arrivati in
0,84 s — **il tempo di risposta piu' basso dei nove**, meno di Igloo (2,98 s
per 427 byte, perche' li' devi comunque aspettare il modulo prima di vedere
alcunche').

E sessantaquattro immagini nella pagina, **sessantaquattro con
`loading="lazy"`**:

```html
<img alt="" loading="lazy" width="160" height="88" decoding="async"
     data-nimg="1" class="max-w-full object-contain"
     style="color:transparent" src="https://cdn.sanity.io/images/9syto90m/..."/>
```

`width`/`height` sempre dichiarati (niente salti di layout), `decoding="async"`,
CSS in due fogli con `data-precedence="next"`, e un solo `<link rel="preload"
as="script" fetchPriority="low">`.

Perche' conta. Basement e' lo studio con il piu' alto numero di premi da
**sviluppatore** del gruppo — nel loro stesso JSON-LD si elencano "Awwwards
Developer Award 2025", "Awwwards Developer Award — Next.js Conf 2024", "FWA
Site of the Day 2025" — e sanno costruire esperienze 3D pesanti quanto
chiunque altro. Sul **proprio** sito, che e' il sito che deve far arrivare le
richieste di preventivo, hanno scelto: niente 3D in home, niente copertura,
HTML servito dal server, immagini pigre.

**Questa e' la risposta alla domanda 7, scritta da qualcuno che sa fare
entrambe le cose.** Il preloader non e' un segno di qualita': e' il prezzo di
una tecnica. Chi puo' non pagarlo, non lo paga.

---

# Parte III — le sette risposte, su tutti e nove i siti

## 1. Le forme ricorrenti

| Forma | Chi | Dettaglio |
|---|---|---|
| **Contatore percentuale** | Lusion, Obys, Active Theory, don't board me (solo mobile) | 4 su 9. Lusion a `13vw` con effetto odometro; Obys due cifre in `mix-blend-mode:difference`; AT tre caratteri con riempimento `/`; dbm un `<p>` con "loading 0%" |
| **Barra / linea** | Obys (`#prg`, 2,5px), Immersive Garden (linea shader), Lusion (rettangolo 5x1 su canvas) | 3 su 9, e in due casi su tre la barra e' **secondaria** rispetto a un'altra forma |
| **Forma che si scopre o si disegna** | Obys (logo a tratto + morphing), Immersive Garden (logo con maschera a gradiente), Bruno Simon (anello a terra), Active Theory (griglia di `/` mascherata a cerchio) | 4 su 9. E' la forma **piu' frequente**, piu' del contatore |
| **Buco che si apre** | don't board me (`<circle r="0" -> 1800>` in una maschera SVG), Lusion (lama rotante), Lando Norris (artboard Rive) | 3 su 9 per l'uscita |
| **Nessuna misura, solo un segnale di vita** | Igloo (dieci caratteri ASCII in loop CSS) | 1 su 9 |
| **Niente del tutto** | basement.studio, e Bruno Simon per la parte di copertura | 2 su 9 |
| **Testo che vende** | Immersive Garden ("Innovative digital experiences studio" + "Scroll down"), don't board me (istruzione + spiegazione), Lando Norris ("Load Norris") | 3 su 9 |

Il conto vero: su nove siti premiati, **quattro non mostrano nessun numero** e
**due non mostrano nessuna copertura**. Il contatore percentuale, che nella
testa di tutti *e'* il preloader, e' minoranza.

## 2. Il progresso e' reale o finto? Contano i file o i byte?

**Nessuno conta i byte. Nessuno. Zero su nove.**

| Sito | Cosa misura davvero |
|---|---|
| **Lusion** | peso **dichiarato a mano** per ogni asset (`{ weight: 55 }`, `{ weight: 32 }`), diviso il peso totale. Piu' un 30% finale che e' compilazione shader, non rete. L'unico progresso pesato del gruppo, e i pesi sono stime umane |
| **Active Theory** | `++_loaded / _total` = **file**, con dentro anche cinque traguardi non-file (`add`/`trigger`: GPU pronta, prima scena, nav, contatti) |
| **Immersive Garden** | `_preloadedResources / _resourcesToPreload.length` = **file** |
| **Bruno Simon** | `1 - rimanenti / totale` = **file** |
| **Obys** (barra) | `this.loaded / this.len` = **file** |
| **Obys** (contatore) | **finto**: tre animazioni a durata fissa, 0->30 in 1300 ms, 30->50 in 1400 ms, 50->100 in 3700 ms, tutte con `pr[0]` cioe' lineare |
| **Immersive Garden** (logo) | **finto**: la maschera del logo trasla in `2.5 s` con `quart.out`, fissi |
| **don't board me** (mobile) | **finto**: `gsap.to(counter, { value: 100, ease: "none", duration: 3 })` su un oggetto vuoto |
| **Lando Norris** | nessuna misura: aspetta `document.readyState === "complete"` |
| **Igloo** | nessuna misura |
| **basement.studio** | non pertinente |

Il finto `0->100%` in tre secondi con `ease: none` che avevi visto **e'
`dontboardme.com` su mobile**, ed e' letteralmente questo:

```js
tl.to(counter, { roundProps: "value", value: 100, ease: "none", duration: 3,
                 onComplete() { setTimeout(() => { exitMobile() }, 500) } });
```

Ma il dato piu' utile e' un altro: **quasi tutti i finti sono *forme*, non
numeri**. Obys e Immersive Garden mettono la bugia sul logo (che nessuno puo'
smentire) e la verita' sulla barra sottile (che nessuno guarda). don't board me
mette la bugia sul numero, ed e' l'unico caso in cui la si puo' chiamare
bugia.

E tre trucchi ricorrenti sul dato vero:

- **il pavimento**: Immersive Garden parte da `0.05 + 0.05 * Math.random()`
  (5-10%, casuale a ogni caricamento); Obys parte dal 30% nelle navigazioni
  interne (`Z0(0.3, 1, h)`). Nessuno mostra mai una barra vuota.
- **il tetto**: Active Theory moltiplica per `0.9` — il numero non passa il
  90% finche' non arriva il segnale di fine.
- **la monotonia**: `Math.max(_lastFiredPercent, ...)` in Active Theory. La
  percentuale non torna mai indietro anche se il denominatore cresce.

E tre modi diversi di smorzare, in ordine di qualita':

```js
// Bruno Simon — corretto sul tempo. GIUSTO.
smoothed += (target - smoothed) * ticker.delta * 10;
// Immersive Garden — per fotogramma: su un portatile a 30 fps e' meta' veloce
u += (L - u) * .1;
// Active Theory — per fotogramma, e molto piu' lento (~1 s di ritardo permanente)
uProgress = Math.lerp(progress, uProgress, .02);
```

## 3. Quanto durano

Secondi, presi dalle costanti del codice.

| Sito | Pavimento garantito | Note |
|---|---|---|
| **Lusion** | **3,25 s** | 1,00 contatore + 0,25 shader + 1,00 lama + 1,00 apertura. Anche con la cache calda |
| **Obys** | **2,7 s** al nero, **8,3 s** di intro completa | ma dai 2,7 s stai gia' guardando le immagini del sito |
| **don't board me** (mobile) | **~4,35 s** + 1,3 s di apertura | 0,7 titolo + 0,15 + 3,0 contatore finto + 0,5 pausa |
| **don't board me** (desktop) | **finche' non clicchi** | poi 1,3 s di apertura |
| **Lando Norris** | **1,0 s** dopo `readyState complete` + 0,5 s di apertura | ma `complete` puo' arrivare tardissimo |
| **Active Theory** | nessun minimo; **~2,0 s** di uscita | le due dissolvenze durano 2 s, il segnale di fine arriva a 0,8 s |
| **Immersive Garden** | **~2,5 s** (l'animazione del logo) + ~1,1 s di coda dello smorzamento | l'uscita dura 4,2 s |
| **Bruno Simon** | nessun minimo; **finche' non clicchi**, poi 1,5 s | |
| **Igloo** | nessun minimo; **0,75 s** di uscita | |
| **basement.studio** | **0 s** | |

Mediana del pavimento fra chi ne ha uno: **circa 2,5-3 secondi**. E i due che
lo impongono piu' rigidamente (Lusion 3,25 s, don't board me mobile 4,35 s)
sono anche i due in cui il tempo **non ha nessun rapporto** con il caricamento
vero.

## 4. Cosa succede se il caricamento e' lento

**Nessuno dei nove ha un tempo massimo che faccia entrare comunque.** Non uno.
E' il buco piu' grosso e piu' unanime della ricerca.

L'unico timeout che ho trovato in tutto il corpus e' quello di Active Theory,
e non fa niente:

```js
AssetLoader.TIMEOUT = 5e3;
let timeout = Timer.create(timedOut, AssetLoader.TIMEOUT, path);
function timedOut(path) { console.warn("Asset timed out", path); }   // solo console
```

Quello che hanno al posto del timeout, in ordine di utilita':

**1. L'errore conta come successo** (Obys, Active Theory):

```js
// Obys
T.onload  = () => { if (this.ini) this.ini = false, this.cb() };
T.onerror = () => { if (this.ini) this.ini = false, this.cb() };
// Active Theory
image.onload = loaded; image.onerror = loaded;
.catch(e => { console.warn(e); loaded() })
```

Chi **non** lo fa: Immersive Garden (`_preloadErrorHandler() {}` vuoto: un
asset fallito congela il sito) e Bruno Simon (l'errore fa `reject` della
Promise, quindi `Promise.all` esplode e il gioco non parte). Due su nove hanno
un sito che si rompe per un 404.

**2. Ripieghi decisi prima di caricare, non dopo** (Immersive Garden):

```js
if (r.fallback) { /* sostituisce la risorsa in base a this._fallbacks[capacita'] */ }
```

**3. Meno roba nel conto** (Immersive Garden): solo la vista corrente entra
nel preload, il resto scende dopo.

```js
const s = production || development || e.name === this._firstView;
```

**4. Due qualita' di asset** (Lusion: `cross_ld` / `matcap_ld` su mobile;
Bruno Simon: `quality.level = /Mobi|Android|iPhone/.test(userAgent) ? 1 : 0`).

**5. Ricarica brutale** (Obys): `error: () => { location.reload() }`.

**6. Una scorciatoia per chi costruisce il sito** — e questa serve a te,
non all'utente:

```js
// Lusion: qualunque impostazione via query string  ->  ?SKIP_ANIMATION=1
this.override([...new URLSearchParams(location.search)].reduce((n,[a,l]) => (n[a]=l===""?true:l,n),{}));
// Bruno Simon: #skip  ->  durate divise per 4 e nessuna attesa del clic
const r = location.hash.match(/skip/i) ? 4 : 1;
```

**E nessuno dei nove salta il preloader alla seconda visita.** Ho cercato
`sessionStorage` e `localStorage` nei bundle: niente. don't board me sembra
farlo, ma e' solo perche' e' un'app a pagina singola: al ricaricamento riparte
identico.

## 5. La transizione dal preloader alla pagina

E' il punto dove tutti e nove sono d'accordo, ed e' l'unica regola veramente
universale del documento: **la pagina comincia a muoversi prima che la
copertura sia via.**

| Sito | Anticipo | Da dove |
|---|---|---|
| **Immersive Garden** | **~4,2 s** | `hideComplete` sparato a `"<"` (tempo zero) di un'uscita da 4,2 s |
| **Active Theory** | **1,2 s** | due dissolvenze da 2 s partite senza `await`, poi 0,3 + 0,5 s prima di `Global/loadFinished` |
| **Igloo** | **~750 ms** | l'app 3D montata con `anchor: loader.getEl()`, cioe' dietro; velo che dissolve in 750 ms |
| **Lando Norris** | **450 ms** (navigazioni) / 250 ms (primo caricamento) | init a 50 ms contro apertura a 500 ms; 750 contro 1000 |
| **don't board me** | **400 ms** | `onStart() { setTimeout(() => animatePageWhilePreloader = true, 400) }` su un'apertura da 1300 ms |
| **Lusion** | **~384 ms** | risolvendo `expoInOut(t) = 0.1` sulla curva di apertura |
| **Obys** | **150 ms** | `de: 150` sulla dissolvenza del fondo |
| **Bruno Simon** | non pertinente | la scena e' visibile dall'inizio: l'anello implode e da li' parte l'onda di rivelazione |

Il **400 ms** che avevi visto e' `dontboardme.com`, e nel codice sorgente si
chiama, senza mezzi termini, `animate-page-while-preloader`. Hanno dato un nome
alla tecnica.

Sette valori misurati, mediana **~450 ms**, e il grosso fra 150 e 1200 ms.
**Tara fra 300 e 500 ms** e sei dentro il consenso.

E l'altra regola, che vale quanto la prima: **la copertura non sfuma, si
trasforma.**

- Lusion: la barra di caricamento **e'** la lama che apre lo schermo (stesso
  rettangolo, ruotato e scalato).
- Bruno Simon: l'anello **implode** e dal punto in cui e' collassato parte
  l'onda che accende il mondo (`back.out(1.7)`).
- Immersive Garden sulla home: il preloader **non se ne va**, il fondo diventa
  trasparente e logo + claim + "Scroll down" **rientrano** sopra la scena a
  1,9 s. Il preloader era la hero.
- don't board me: il buco si apre **dove hai il puntatore**, non al centro.
- Igloo: il velo dissolve verso un fondo del **suo stesso colore**.

Il `fade to black` che si toglie non lo fa nessuno.

E il dettaglio tecnico che rende possibile tutto questo, in tre tecnologie
diverse ma sempre la stessa idea — **il DOM cede il colore al motore grafico
nell'istante in cui il motore e' pronto**:

```css
/* Lusion */
#preloader { position: fixed; z-index: 200; background-color: var(--color-black) }
html.is-ready #preloader { background-color: transparent }
```
```js
/* Lando Norris, dentro onLoad di Rive */    $wrap.style.backgroundColor = "transparent";
/* Obys, durante il preloader, non dopo */   canvas.style.zIndex = "9999";
/* Igloo */                                  /* il velo E' gia' del colore della scena */
```

## 6. Il preloader come schermo di vendita

Tre su nove ci scrivono qualcosa. Ed e' molto piu' di quanto immaginassi
prima di leggere il codice.

**Immersive Garden — il claim.** Prop `baseline`, valore predefinito
`"Innovative digital experiences studio"`, spezzata in una `<div>` per parola,
che entrano con `stagger: .1` e `1.25 s` di dissolvenza. In serif (PSTimes) a
`1.94vw`. Piu' `scrollDown: "Scroll down"`, che e' istruzione, non claim. Ed e'
tutto nell'HTML servito dal server: **quel testo lo legge anche Google.**

**don't board me — l'istruzione e la spiegazione.**

```html
<p class="preloader__title">bounce a ball to get to the site</p>
<p class="preloader__description">
  You've landed on a dog walking site. Follow our rules to keep your dog happy
</p>
```

Tre secondi per dire cosa fare, dove sei finito e con che tono. E' il migliore
uso commerciale del preloader dei nove, ed e' l'unico che non e' un portfolio
di studio: e' un sito che vende un servizio.

**Lando Norris — la battuta.** `Load Norris`, in un finto pulsante con
`href="#"` e nessun gestore di clic. Non vende, ma marchia.

**Gli altri sei non ci mettono niente.** Lusion tre cifre; Obys due cifre e il
logo; Active Theory un numero e caratteri monospazio; Igloo dieci trattini;
Bruno Simon un anello; basement.studio non ha un preloader.

**Nessuno dei nove ci mette i nomi dei clienti.** Ho cercato: nessun logo di
cliente, nessuna riga di premi, nessun "as seen in" sul preloader. Chi ha
clienti famosi (Immersive Garden ha Louis Vuitton nella pagina) li tiene per il
sito, non per l'attesa.

La lettura: **gli studi non vendono nel preloader perche' quello che vendono
e' il preloader stesso** — la qualita' del movimento e' la referenza. Per un
cliente che vende infissi a Monza, quel messaggio non esiste, e lo spazio
resta vuoto. Immersive Garden e don't board me dimostrano che riempirlo si
puo': una frase sola, grande, che dice che mestiere fai o in che negozio sei
entrato. E' spazio poco occupato, e nel nostro mercato e' probabilmente
inoccupato.

## 7. La regola operativa

### Quando un preloader e' giustificato

Uno di questi tre. Se non ne hai nessuno, non ti serve.

1. **Il primo fotogramma e' una tela**: canvas WebGL, scena 3D, shader da
   compilare. Senza copertura si vede un rettangolo vuoto o geometria fuori
   posto. Sette dei nove sono qui.
2. **L'attesa e' il primo tempo dell'animazione**: il logo che si disegna
   (Obys), la frase che si compone (Immersive Garden), l'anello che si riempie
   e poi esplode (Bruno Simon). Se togliendo l'attesa perdi un pezzo di regia,
   l'attesa sta lavorando.
3. **Serve un gesto dell'utente prima di partire**: audio, controlli di gioco,
   permessi. Bruno Simon e don't board me desktop finiscono con un clic, non
   con un timer, e hanno ragione.

### Quando e' solo un modo elegante di perdere gente

- **Il contenuto sotto e' DOM e immagini.** Vedi basement.studio: 34 KB di
  HTML, titolo nella prima risposta, 64 immagini pigre, nessuna copertura, e
  premi da sviluppatore a ripetizione. Coprire una pagina che il browser sa
  dipingere progressivamente e' un peggioramento pagato con lavoro.
- **Il tuo criterio di fine e' `document.readyState === "complete"`.** Lando
  Norris. Basta un tag di terze parti appeso e non entra piu' nessuno.
- **La percentuale conta i file.** Un GLB da 8 MB e sei SVG: fai 0-14-28-42-57
  in duecento millisecondi e poi stai fermo all'85% per otto secondi. E'
  il caso peggiore: prometti precisione e consegni un blocco.
- **Il preloader e' piu' lungo del caricamento vero.** Se in sviluppo il sito
  e' pronto in 400 ms e l'intro dura 3 s, hai costruito un dazio.
- **Riparte a ogni visita.** Nessuno dei nove lo evita. E' l'errore che
  possiamo non commettere gratis.

### Le nove regole, in ordine di importanza

1. **Il numero e' un contratto: se non hai un denominatore vero, non mostrare
   un numero.** Mostra una forma che si completa — un tratto, un cerchio, un
   logo che si scopre. Nessuno la puo' smentire. Quattro dei nove hanno scelto
   cosi', e sono i quattro che sembrano piu' sicuri di se'.
2. **Se proprio vuoi il numero, metti la bugia sulla forma e la verita' sul
   numero, non il contrario.** Immersive Garden e Obys fanno esattamente
   questo: logo a durata fissa, linea sul dato reale.
3. **Chiudi il cancello sul dato vero, anche se l'andamento e' finto.**
   `if (this.loaded && this.animDone) this.cb()`. Puoi mentire sul come, mai
   sul quando.
4. **Metti un tetto.** Nessuno dei nove ce l'ha, ed e' il difetto comune.
   `setTimeout(forceEnter, 6000)` e avanti comunque, degradando quello che
   manca.
5. **`onerror` conta come `onload`.** Tre righe. Due dei nove non le hanno
   scritte e hanno un sito che muore per un 404.
6. **Sovrapponi sempre, mai in sequenza.** Avvia le animazioni della pagina
   *prima* che la copertura sia via. Mediana misurata sui premiati: **~450 ms**.
   Tara fra 300 e 500. Sotto i 150 ms non si nota; sopra i 1500 e' un'altra
   cosa (e Immersive Garden, a 4 secondi, di fatto non ha piu' una
   transizione: ha due schermate sovrapposte).
7. **La copertura si trasforma, non si toglie.** La barra che diventa la lama,
   l'anello che implode, il velo che dissolve verso il proprio stesso colore.
   Il fade to black e' la confessione che non avevi un'idea.
8. **Smorza col tempo, non col fotogramma.** `+= (target - v) * delta * 10`,
   come Bruno Simon. Il `* 0.1` per frame degli altri e' meta' velocita' su un
   portatile a 30 fps — cioe' proprio sulla macchina che sta gia' soffrendo.
9. **Il pavimento sotto il tempo di caricamento mediano, mai sopra.** Lusion
   impone 3,25 s a tutti, fibra compresa, e se lo puo' permettere perche' e' il
   suo portfolio. Per un cliente che vende, se il sito e' pronto prima l'intro
   deve poter finire prima.

### Le righe da rubare subito

```js
// 1. la scorciatoia per te (Lusion) — ?SKIP_ANIMATION=1 mentre lavori sulla sezione in fondo
this.override([...new URLSearchParams(location.search)].reduce((n,[a,l]) => (n[a] = l === "" ? true : l, n), {}));

// 2. il progresso in due fasi (Lusion): il 100% arriva a shader compilati, non a file scesi
let t = taskPercent * 0.3 + loadPercent * 0.7;

// 3. i traguardi non-file nello stesso denominatore (Active Theory)
loader.add(1); bind("NavUI/ready", () => loader.trigger(1));

// 4. il pavimento casuale (Immersive Garden): non parti mai da zero, e non sembra una costante
const floor = 0.05 + 0.05 * Math.random();
shown = Math.max(floor, real);

// 5. il tetto al 90% (Active Theory): l'ultimo 10% e' del segnale di fine
tween(text, { percent: .9 * percent }, 500, "linear");

// 6. lo smorzamento corretto sul tempo (Bruno Simon)
smoothed += (target - smoothed) * delta * 10;

// 7. l'anticipo, con il nome giusto (don't board me)
onStart() { setTimeout(() => { animatePageWhilePreloader.value = true }, 400) }

// 8. il blocco dello scorrimento fatto per intero (don't board me)
document.body.style.overflow = "hidden";
document.body.style.touchAction = "none";   // senza questo, su iOS scrolli lo stesso
lenis.stop();                               // senza questo, lo smorzato va per conto suo
```

---

## Fonti primarie

Tutto il codice citato e' stato scaricato e letto il 13 agosto 2026.

| Cosa | URL |
|---|---|
| Lusion, HTML della home (markup del preloader) | https://lusion.co/ |
| Lusion, bundle unico (classe `Preloader`, `TransitionOverlay`, `TaskManager`, `QuickLoader`) | https://lusion.co/_astro/hoisted.CUO_IjfL.js |
| Lusion, CSS (`#preloader`, `html.is-ready`) | https://lusion.co/_astro/about.CNa9RfUh.css |
| Lusion, asset della home misurati | https://lusion.co/assets/models/home/cross.buf, https://lusion.co/assets/textures/home/matcap.exr |
| Obys, HTML della home (`#preloader`, `#prg`, caricamento condizionale `d.js`/`m.js`) | https://obys.agency/ |
| Obys, bundle desktop (classi `ah`, `eh`, `hh`, `ih`, funzioni `L_`, `aT`) | https://obys.agency/js/d.js |
| Igloo, HTML (427 byte, `<body>` vuoto) | https://www.igloo.inc/ |
| Igloo, entry Vite/Svelte (componente `loader`, keyframe `head`, `anchor: e.getEl()`) | https://www.igloo.inc/assets/index-2eb69c09.js |
| Active Theory, HTML (CSS critico, `--baropacity`, iniezione dell'app) | https://activetheory.net/ |
| Active Theory, bundle Hydra (`AssetLoader`, `LoaderView`, `LoaderGLUI`) | https://activetheory.net/assets/js/app.1780406240914.js |
| Immersive Garden, HTML SSR (markup `introLoader`, baseline, CSS scoped `data-v-6b7470de`) | https://immersive-g.com/ |
| Immersive Garden, componente IntroLoader (props `baseline`/`scrollDown`, timeline di uscita) | https://immersive-g.com/assets/IntroLoader.D9qttrK0.js |
| Immersive Garden, Preloader/ResourceLoader (`_preloadProgressHandler`, `_updateFallbacks`) | https://immersive-g.com/assets/Preloader.CCgyJU7b.js |
| Immersive Garden, `LoaderLine` (mesh WebGL, shader `uLoadProgress`/`uFadeProgress`) | https://immersive-g.com/assets/default.BZYNaK9D.js |
| Bruno Simon, HTML (nessuna copertura, `js-fonts-loader`, `<link rel=preload as=fetch>`) | https://bruno-simon.com/ |
| Bruno Simon, bundle (`ResourcesLoader`, `Intro.setCircle`, `Reveal.updateStep`, `Quality`) | https://bruno-simon.com/assets/index-ORr3L4no.js |
| Lando Norris, HTML (markup `.transition-w`, "Load Norris", Rive canvas) | https://landonorris.com/ |
| Lando Norris, bundle OFF+BRAND (gate `readyState`, `pageTransitionIn/Out`, Taxi) | https://assets.itsoffbrand.io/lando/dev-js/lando-by-OFF+BRAND.js |
| Lando Norris, script Rive isolato (stessi tre input della macchina a stati) | https://assets.itsoffbrand.io/lando/dev-js/transitions-rive-isolate.js |
| Lando Norris, file di animazione | https://assets.itsoffbrand.io/lando/rive/page-transition.riv |
| don't board me, HTML SSR (markup del preloader, maschera SVG, testi) | https://dontboardme.com/ |
| don't board me, `CommonPreloader` (contatore finto, `onClickOnce`, `useLockScroll`) | https://dontboardme.com/_nuxt/entry.66570678.js |
| don't board me, `useShowPageAnimFirst` (il consumo di `animate-page-while-preloader`) | https://dontboardme.com/_nuxt/useShowPageAnimFirst.9f0c167c.js |
| basement.studio, home, `/lab`, un caso studio: nessun preloader, nessun canvas | https://basement.studio/ |
