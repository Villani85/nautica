# Dogstudio

> **Nota sull'assegnazione.** Il dominio `https://dogstudio.co` **esiste ancora** e
> serve il sito dello studio (HTTP 200, tema WordPress `portfolio-2018`). Quindi
> NON e' stato sostituito con Merci Michel.
> **Correzione al brief**: Dogstudio non fa parte di Deloitte Digital. E' stata
> acquisita da **DEPT** nel maggio 2022. Verificato dentro il sito stesso: la
> "Privacy Policy" nel piede e il banner cookie puntano a
> `https://www.deptagency.com/en-nl/privacy-policy/`. Fonte esterna:
> https://www.prweek.com/article/1766627/dept-acquires-dogstudio-shop-behind-tomorrowlands-virtual-festival

- **URL**: https://dogstudio.co/
- **Premio**: Awwwards **Site of the Day 23/04/2019** — voto 8.17/10 (Design 8.19, Usability 7.75, Creativity 8.8, Content 8.04) — https://www.awwwards.com/sites/dogstudio-1 ; poi **Site of the Month aprile 2019** — https://www.awwwards.com/dogstudio-by-dogstudio-wins-site-of-the-month-april.html
- **Studio**: Dogstudio (Namur, Belgio + Chicago; oggi Dogstudio/DEPT). Profilo Awwwards: 43 SOTD, 5 SOTM, 2 SOTY — https://www.awwwards.com/dogstudio/
- **Anno**: tema `portfolio-2018`, JS datato `v=23082019-2`, CSS ricompilato `v=07022024`. Quindi: **impianto 2018-2019, contenuti aggiornati fino al 2024**.
- **Letto il**: 13/08/2026

---

## Cosa vende

Il lavoro di un'agenzia creativa che fa esperienze digitali su misura (siti,
installazioni, eventi virtuali) per marchi grossi: Tomorrowland, Panasonic,
Adobe, Museum of Science and Industry di Chicago, Kennedy Center, Navy Pier.
Il sito e' un portfolio-manifesto: la merce e' la capacita' tecnica, e il sito
stesso e' la dimostrazione.

## A chi

Direttori marketing e responsabili di progetti "evento" con budget alto, e
— altrettanto — la giuria di Awwwards e i creativi che assumono. Chi esce dal
sito deve pensare: *questi sanno far girare un modello 3D pesante dentro una
pagina web senza che si inceppi, e sanno anche scrivere.*

## Idea regista

**Un cane 3D vive dentro la pagina, cambia pelle e posa a seconda di dove sei e
di cosa stai guardando** — e' l'unico elemento che attraversa tutto il sito.

## Il momento

C'e', ed e' un **hover, non uno scroll**: sulla home, passando il mouse sopra il
nome di un progetto nella lista (es. "Tomorrowland"), succedono tre cose insieme
in ~0,5 s:

1. il cane 3D cambia **matcap** (materiale) prendendo i colori di quel progetto —
   `Dog.GL.setMatcap(...)` letto da `data-matcap="18, 18"` sul link;
2. il fondo dell'intera pagina vira al colore del progetto — `body:before`
   `background-color` in transizione `.5s cubic-bezier(.25,.46,.45,.94)`
   (Tomorrowland `#000b25`, Royal Opera `#680000`, KIKK18 `#00117c`);
3. la scena a schermo pieno del progetto (immagine + occhiello + tre righe di
   testo) entra da sotto: immagine `scale(1.1) -> scale(1)` + opacita' in 0,6 s,
   testi `translateY(50px) -> 0` in 0,4 s, entrambi `cubic-bezier(.215,.61,.355,1)`.

C'e' un debounce di **100 ms** (`setTimeout` in `onTitleEnter`) apposta per non
far sfarfallare la scena quando il mouse attraversa la lista di corsa. Se arrivi
da un'altra scena, i testi della nuova partono con **0,40-0,52 s di ritardo**
(classe `has-delay`) per lasciar uscire la vecchia.

**Questo momento sul telefono non esiste.** Vedi "Mobile".

## Struttura, sezione per sezione

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |
|---|---|---|---|
| Loader (`.site-loader`) | fondo `#0e101a`, sprite di un cane animato (16 fotogrammi, foglio da 2080px) dentro un anello SVG di progresso r=67 | aspetta; lo scroll e' bloccato (`body.lock-scroll`) | ~3 s, non e' scroll |
| Hero (`.home-hero`) | titolo "We Make Good Shit" su 4 righe, colonna destra con sommario, due righe diagonali rosse, cane 3D a destra | legge; il cane segue il mouse | ~1 schermata |
| Cases (`.home-cases`) | 7 progetti in lista gigante; il palco delle scene e' `position:fixed` finche' la sezione e' a schermo | passa il mouse sui nomi -> cambia tutto | **~1,9 schermate** (7x140px di lista + `padding-top:calc(50vh - 45px)` + `padding-bottom:calc(50vh - 85px)`) |
| About (`.home-about`) | "We're crafting emotional experiences aimed at improving results" + due colonne di testo + link ai valori | legge | ~1 schermata + `padding-bottom:61vh` |
| Footer (`.site-footer`) | Chicago / Amsterdam / Paris, social, mail, privacy, lingua | contatta | ~0,7 schermate |

Totale: circa **4,5-5 schermate**. Sopra i 815px il footer e' `position:absolute;
bottom:0`, cioe' incollato in fondo al documento, non un blocco in flusso.

## L'esperienza in ordine di tempo

Ricostruita dal codice di `views/manager.js`, `views/partials/common/loader.js`,
`utils/transition.js` e `dog/index.js` (le promesse hanno timeout espliciti).

**Primi dieci secondi (desktop, prima visita)**

- **0,0 s** — HTML servito (~11 KB gzip). `detectizr.js` e `modernizr.js` girano
  subito e scrivono `window.disable_dog` / `window.disable_motion` sull'`<html>`.
  Solo se il browser supporta **WebAssembly** e non e' un telefono viene
  appeso `dog.js`; `main.js` parte solo dopo il suo `onload`. Se WebAssembly
  manca, il sito fa un `alert('Your browser does not support WebAssembly')` e
  serve la versione senza cane.
- **0,1-0,3 s** — in console appare `Made with ♥ by Dogstudio` (rosso `#e43333`).
  Partono i polyfill (`svg4everybody`, `object-fit-images`, `@babel/polyfill`).
  `history.scrollRestoration = 'manual'`.
- **0,3 s** — il loader prende `is-visible`: lo sprite del cane sfuma in
  (`opacity 1s cubic-bezier(.165,.84,.44,1)` con 0,2 s di ritardo), l'anello
  bianco al 20% si chiude in 0,7 s.
- **0,3-1,5 s** — attesa fissa di **1200 ms** (`Loader.show()`), poi parte il
  caricamento vero: `Dog.GL.load()` scarica il modello Draco e le texture.
  Nel frattempo un intervallo ogni **100 ms** avanza la barra di **0,1** ma si
  **ferma a 0,9**: e' una percentuale finta, il gate reale e' il modello.
- **~2,5-4 s** (dipende dalla rete: ~1,85 MB fra modello, matcap e normali) —
  `Loader.loaded()`: percentuale a 1, l'anello rosso `#ff4940` si chiude in 1 s.
- **+0 s** — evento `completed`. Nasce il **SoundPlayer**: `ambience.mp3` in loop
  via Web Audio, ma l'`AudioContext` resta sospeso finche' non clicchi.
  Parte l'`IntersectionObserver` (soglie `[0, 0.15, 1]`) dopo 500 ms.
- **+0,7 s** — il pannello del loader esce scorrendo a sinistra
  (`translateX(-100%)`, `.7s cubic-bezier(.895,.03,.685,.22)`).
- **in parallelo, +0,1 s** — `Dog.init()`: il cane parte dal matcap **[19,19]**
  (opaco: `diffuseWeight 0, specularWeight 0`) e passa al **[1,0]** in **3 s
  `Quad.easeOut`**; la posa passa da 0 a **0,16** in **1,8 s `Quart.easeOut`**.
  Alla fine di questo tween lo scroll si sblocca (`lock-scroll` rimosso).
- **stesso istante** — l'hero entra: le 14 lettere di "We Make Good Shit" si
  raddrizzano una a una da `translate3d(150px,50px,-400px) scaleY(.01)
  rotateX(-90deg) rotate(-35deg)` a zero, `all 1.2s cubic-bezier(.245,.495,0,.99)`,
  **25 ms di ritardo per lettera** (0 s -> 0,325 s). Il sommario a destra entra a
  0,40 / 0,43 / 0,46 s (righe del lead) e 0,50 / 0,53 / 0,56 s (paragrafo).
  Le righe diagonali rosse si disegnano con `scaleX(0)->1` in 0,75 s con 0,3 s
  di ritardo.
- **~5 s in poi** — pagina viva. Il cane insegue il puntatore con un `lerp` a
  **0,1** su un vettore normalizzato `[-1,1]`, con influenza per posa
  (`MOUSE_INFLUENCE` 0,03 nell'hero, 0,09 nel mezzo).

**Poi, a blocchi**

- **Scroll dentro l'hero** — il filtro biquad dell'audio si apre: `frequency` da
  **400 Hz a 4000 Hz** e `Q` da **2 a 0,5**, mappati sulla prima meta' di
  schermata; oltre il 50% si fa una rampa esponenziale di 0,5 s e non si tocca piu'.
- **Ingresso nei cases** — quando il bordo alto della sezione tocca il viewport,
  `.home-cases-scenes` prende `is-sticky` (`position:fixed`) + `on-top`; il palco
  resta fisso per tutta la sezione, poi passa a `on-bottom`.
- **Dentro i cases** — hover sui nomi: vedi "Il momento". Uscendo dalla lista
  (`mouseleave`) il matcap torna a `[1,0]` in **1 s `Cubic.easeOut`**, il
  `data-theme` viene tolto dal `<body>` e la scena esce. **Se scrolli mentre una
  scena e' aperta, `onCaseScroll` chiama `onListLeave()`: la scena si chiude da sola.**
- **Fondo pagina** — l'immagine di sfondo della home sfuma a 0 fra il **40%** e
  il 40%+300px dell'altezza del documento (`onBackScroll`).
- **Cambio pagina** — non c'e' ricarica: Highway.js. Il pannello del loader entra
  (1000 ms), il cane viene resettato, il vecchio `<main>` viene rimosso, scroll a
  0, il nuovo entra e il pannello esce.
- **Menu** — apre in 1,6 s `cubic-bezier(.86,0,.07,1)`, le 5 voci salgono a
  scaglioni di 50 ms (0,30 / 0,35 / 0,40 / 0,45 / 0,50 s). Il cane passa allo
  stato `MENU_STATE` e l'audio si "chiude" (filtro a 400 Hz, Q 2, volume 0,8 -> 0,6
  in 1,2 s); alla chiusura si riapre.

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| cane 3D (posa) | interpolazione fra **6 pose** (`DEPTH`, `H_ROTATION`, `V_ROTATION`, `X_OFFSET`, `Y_OFFSET`) | **scroll**, per keypoint DOM | lerp a 0,2 verso il valore target, ogni frame | keypoint home: `0.16` su `.ruler--top`, `0.44` su `.home-cases-list`, `0.66` (offset -300px) su `.home-about`, `1` su `.ruler--bottom` — file `dog/data-desktop.js` |
| cane 3D (materiale) | crossfade fra due matcap dell'atlante | **stato** (hover / pagina) | `Cubic.easeOut` 1 s (hover), `Quad.easeOut` 3 s (ingresso) | atlante a griglia, `MATCAP_PER_ROW: 10`, 20 matcap definiti |
| cane 3D (sguardo) | offset dalla posizione del mouse | **mouse** | lerp 0,1 su x e y | disattivato se `Modernizr.touchevents` |
| lettere del titolo | `translate3d + rotateX + rotate + scaleY` -> identita' | **in-view** (IntersectionObserver) | `1.2s cubic-bezier(.245,.495,0,.99)`, stagger 25 ms | markup gia' esploso in `<span class="fx-letter">` lato PHP, non a runtime |
| righe diagonali rosse | `scaleX(0) -> 1`, origine sinistra o destra | **in-view** | `.75s cubic-bezier(.165,.84,.44,1)` +0,3 s | colore `#e43333`, ruotate -45deg |
| blocchi di testo | `translateY(50px)` + opacita' | **in-view** | `.8s cubic-bezier(.215,.61,.355,1)` +0,1 s | classi `appear-fade-up` / `appear-delay--N` |
| scena progetto (immagine) | `scale(1.1) -> 1` + opacita' | **hover** sul nome | `.6s cubic-bezier(.215,.61,.355,1)` | keyframe CSS, non GSAP |
| scena progetto (testi) | `translateY(50px) -> 0`, uscita `0 -> -50px` | **hover** | in `.4s cubic-bezier(.215,.61,.355,1)`, out `.4s cubic-bezier(.645,.045,.355,1)` | ritardi 0,40-0,52 s con `has-delay` |
| fondo pagina | `background-color` di `body:before` | **hover** | `.5s cubic-bezier(.25,.46,.45,.94)` | 70+ temi definiti in CSS |
| palco delle scene | da `absolute` a `fixed` | **scroll** | nessuna, e' uno switch di classe | classi `is-sticky` / `on-top` / `on-bottom` |
| sfondo home | opacita' 1 -> 0 | **scroll** | lineare su 300px, dal 40% del documento | |
| ambiente sonoro | cutoff del filtro 400 Hz -> 4000 Hz, Q 2 -> 0,5 | **scroll** (prima mezza schermata) | `setValueAtTime` poi rampa esponenziale 0,5 s | Web Audio API a mano, niente Howler |
| pannello del menu | `translateX(-100%) -> 0` | **stato** | `1.6s cubic-bezier(.86,0,.07,1)` | |
| voci del menu | `translateY(40px)` + opacita' | **stato** | `.5s cubic-bezier(.165,.84,.44,1)`, stagger 50 ms | |
| anello del loader | `stroke-dashoffset` 420,97 -> 0 | **tempo** (finto) + fine caricamento | `TweenMax.to` 1 s | +0,1 ogni 100 ms, tappo a 0,9 |
| sprite del loader | `background-position` 0 -> -2080px | **tempo** | `steps(16)` in loop | foglio di 16 fotogrammi da 130px |
| pallino audio | due anelli da 30px che pulsano | **stato** | `1.6s linear infinite`, sfasati di 0,5 s | in basso a destra |

Librerie riconosciute: **GSAP 2** (`TweenMax`/`TweenLite` — 308 occorrenze di
`TweenLite` nel bundle), **Three.js** con **DRACOLoader**, **Highway.js**
(il router SPA scritto da Dogstudio stesso), **Plyr** (video Vimeo dello
showreel), **vanilla-lazyload**, **tiny-emitter**, **IntersectionObserver polyfill**.
Nessuna traccia di Locomotive Scroll, Barba, Lottie, PIXI o Howler.

## Colori

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo pagina | `#131419` | `body`, pannello del menu |
| fondo loader / cookie | `#0e101a` | `.site-loader`, `.site-cookie` |
| testo principale | `#ffffff` | titoli, corpo, logo |
| testo secondario | `rgba(160,168,220,.7)` | sommario dell'hero, testo about, mail nel piede |
| testo terziario | `rgba(187,194,229,.4)` | occhiello "This is how we do it" |
| nomi dei progetti a riposo | `rgba(187,194,229,.3)` | `.home-cases-list li` |
| nome progetto in hover | `#ffffff` | transizione `.6s cubic-bezier(.165,.84,.44,1)` |
| occhiello "Featured projects" | `#646d9e` | `.home-cases-title` |
| accento rosso (grafico) | `#e43333` | righe diagonali, firma in console |
| accento rosso (interfaccia) | `#ff4940` | anello del loader, freccia "Our Showreel" |
| traccia dell'anello | `rgba(255,255,255,.2)` | dietro il progresso |
| filetto del piede | `rgba(187,194,229,.3)` | trattino prima della mail |

**Colori per progetto** (fondo del `body` in hover / fondo della scheda su mobile
+ colore dell'occhiello):

| progetto | fondo | accento |
|---|---|---|
| Tomorrowland | `#000b25` | `#d79a21` |
| Navy Pier | `#030828` | `#5fc4aa` |
| MSI Chicago | `#000e31` | `#58a5c4` |
| This Was Louise's Phone | `#001628` | `#ff2ebf` |
| KIKK Festival 2018 | `#00117c` | `#ff66a0` |
| The Kennedy Center | `#0b2633` | `#5bb27a` |
| Royal Opera Of Wallonia | `#680000` | `#857551` |

Il CSS ne contiene 70+ (Panasonic `#12222e`/`#3fa1db`, Virgin Galactic
`#1c1229`/`#c80afb`, Meebits `#00012b`/`#6366f1`, HAPE `#80030c`/`#131418`...):
la palette e' **una per cliente**, non una del sito.

## Tipografia

Radice a `font-size: 87.5%` = **14px**. Tutti i `rem` qui sotto sono convertiti.

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| titolo hero | GT Sectra Display | 700 | **120px** (80px sotto 815px) | 107px (`.8916`) | `letter-spacing: -.04em`; crenatura a mano per parola: -23px sulla prima, -8px sulla seconda, -6px sull'ultima |
| titolo about | GT Sectra Display | 400 | 50px (45px sotto 768px) | 50px | i `<br>` spariscono sotto 768px |
| nomi progetti (lista) | Heebo | 200 | **84px** (80px sotto 1460px, 70px sotto 1030px) | 60px | riga alta 140px |
| nome progetto (scheda) | GT Sectra Display | 700 | 40px (30px su piccolo) | 40px | **nascosto sopra 1030px non-touch** |
| descrizione progetto | Heebo | 300 | 22px (20px su piccolo) | 30px (27px) | tre righe in `<span>` separati per animarle |
| occhiello progetto | Gilroy | 700 | 8px | 8px | maiuscolo, `letter-spacing: .6em` |
| occhiello "Featured projects" | GT Sectra Display | 700 | 8px (10px sotto 1030px) | 8px | maiuscolo, `letter-spacing: .5em` |
| anni ("2020 - Ongoing") | Gilroy | 700 | 10px (9px sotto 1460px) | 10px | maiuscolo, `.36em`, spinto a sinistra fuori dalla riga con `translateX(calc(-100% - 70px))` |
| occhiello "This is how we do it" | Gilroy | 700 | 9px | 9px | maiuscolo, `.4em` |
| sommario hero (lead) | Heebo | 300 | 23px | 35px | |
| corpo | Heebo | 400 | 14px | 29px (`2.1`) | |
| voci di menu | Heebo | 200 | 60px -> 45px -> 40px -> 30px | 55px | `letter-spacing: -.02em` |
| citta' nel piede | Heebo | 300 | 22px (20px sotto 768px) | 18px | |
| "We'd love to hear from you" | Heebo | 500 | 11px | 11px | |

**Come sono serviti**: tutti **auto-ospitati** in `woff2` + fallback `woff` sotto
`/static/assets/fonts/`, niente `font-display`, niente font variabili, 11
`@font-face` in tutto (Heebo 200/300/400/500/700, GT Sectra Display 400/500/700,
Gilroy 400/500/700). L'`<head>` ha un `preconnect` a `use.typekit.net` e
`fonts.gstatic.com` ma **non li usa**: residuo morto.
GT Sectra Display e Gilroy sono font commerciali; Heebo e' Google Fonts (SIL OFL).

## Testi veri

**Titolo (`<title>`)**
> Dogstudio. Multidisciplinary Creative Studio.

**Meta description / og:description**
> We are at the intersection of art, design and technology. Our goal is to deliver amazing experiences.

**Titolo hero** (su quattro righe)
> We / Make / Good / Shit

**Sommario hero**
> Dogstudio is a multidisciplinary creative studio at the intersection of art, design and technology.
>
> Our goal is to deliver amazing experiences that make people talk, and build strategic value for brands, tech, entertainment, arts & culture.

**Titolo della sezione progetti**
> Featured projects

**I sette progetti** (anno / nome / occhiello / descrizione)
> 2020 - Ongoing — **Tomorrowland** — Web — "Building a new kind of immersive experience for the famous music festival"
>
> 2018 - Today — **Navy Pier** — Strategy — "\"Enchanted Waters\" is an immersive and uplifting reflection on Chicago's relationship with Lake Michigan"
>
> 2015 - Today — **MSI Chicago** — Strategy — "Rethinking, redesigning and improving [...]"
>
> 2016 — **This Was Louise's Phone** — [...]
>
> 2012 - Today — **KIKK Festival 2018** — [...]
>
> 2017 — **The Kennedy Center** — Design — "Building an immersive website to celebrate the memory of the unforgettable John F. Kennedy"
>
> 2016 - Ongoing — **Royal Opera Of Wallonia** — Design — "Imagining and designing an oniric universe to promote the upcoming season of a renown Belgian opera house"

**Sezione about**
> This is how we do it
>
> We're crafting emotional experiences aimed at improving results
>
> Dogstudio is a design & technology firm working globally from our offices based in Belgium and Chicago. Our strong focus on producing high quality & emotional brandings, digital products and experiences became a signature.
>
> We're passionate about moving people and solving problems for the likes of Microsoft, The Museum of Science And Industry Of Chicago, The Kennedy Center of Washington, Dragone, Quanta Magazine, and many more.

**Voci di menu**
> The Studio · Our Cases · Careers · Our Values · Contact

**Chiamate all'azione**
> Our Showreel · Watch our Showreel · Discover · Discover our values · All our news · All our cases

**Immagine-firma nel menu** (attributo `alt`)
> We Make Good Shit

**Piede**
> Chicago **.** — Amsterdam **.** — Paris **.**
>
> We'd love to hear from you — biz@dogstudio.be
>
> Privacy Policy · Language: English / Español
>
> Fb · Ins · Dri · Tw (sul desktop; su mobile diventano icone)

**Banner cookie**
> We use functional cookies to make the website work properly and analytical cookies to measure your behavior. We collect data on how you use our website to make our website easier to use. By clicking accept you agree to this. More information? Read our cookie policy.
>
> Accept / Deny

**Console**
> Made with ♥ by Dogstudio — http://www.dogstudio.co/

**Se il browser non ha WebAssembly**
> Your browser does not support WebAssembly

## Mobile

Questa e' la parte che conta: **sul telefono e' un altro sito**, e la decisione
e' presa nell'HTML stesso, prima di caricare il bundle, con Detectizr:

```js
if (Detectizr.device.type === 'mobile')  { html.classList.add('disable-dog');    window.disable_dog = true;  }
if (Detectizr.device.type === 'tablet'
 || Detectizr.device.type === 'mobile')  { html.classList.add('disable-motion'); window.disable_motion = true; }
```

### SPARISCE

- **Il cane 3D.** Su `mobile` lo script `dog.js` **non viene nemmeno appeso al
  DOM**: niente Three.js, niente `dog.drc.glb` (860 KB), niente atlante matcap
  (543 KB), niente mappa normali (450 KB). Si risparmiano ~2 MB.
- **Tutte le animazioni d'ingresso** (`disable-motion`, quindi anche su tablet):
  le regole sono tutte sotto `html:not(.disable-motion)`, quindi lettere, righe
  diagonali e fade-up **non partono e non servono**: gli elementi sono gia' a
  posto. L'`IntersectionObserver` non viene neppure istanziato.
- **La lista gigante dei progetti** (`.home-cases-list`): `display:none` di base,
  torna `flex` solo con `min-width: 1030px` **e** `.no-touchevents`. Su un tablet
  largo 1200px in landscape resta comunque nascosta, perche' e' touch.
- **Il palco fisso**: `is-sticky` / `on-top` / `on-bottom` sono dentro
  `@media (min-width:64.375em)` + `.no-touchevents`. Niente pinning.
- **Il viraggio del fondo pagina** in hover (non c'e' hover).
- **La seconda riga diagonale** dell'hero (`.home-hero .line--2`) sotto 815px, e
  la diagonale dei cases sotto 1030px.
- **Il link "Newsletter"** nell'hero sotto 600px (`li:last-child{display:none}`).
- **Le etichette testuali dei social** nel piede ("Fb", "Ins", "Dri", "Tw") sotto
  815px: restano solo le icone SVG.

### VIENE SOSTITUITO

- **Il cane 3D -> un PNG.** `.disable-dog [data-router-view=home]:before` mette
  `images/home/dog.png` (117 KB) a 600x674px in alto a destra; sotto 815px
  diventa 500x562 e sotto 450px va al centro. Stessa cosa per il menu
  (`images/menu/dog.png`, 122 KB, `background-position: 25% 50%`) e per la pagina
  Careers (`images/careers/dog.png`, 800x570). **Il cane resta come idea, ma e'
  una fotografia.**
- **Hover -> scorrimento.** Le sette scene, invece di essere sette strati
  sovrapposti su un palco fisso, diventano **sette schede in colonna**, ognuna
  alta 100vh con il proprio colore di fondo (`.touchevents
  .home-cases-scene--tomorrowland{background-color:#000b25}`) e il proprio
  accento. Sopra i 768px la scheda e' una riga flex **a zigzag**: immagine a
  sinistra sulle dispari, a destra sulle pari
  (`:nth-child(2n) .inner{flex-direction: row-reverse}`), immagine al 50% di
  larghezza. Sotto i 768px si impila.
- **Il nome del progetto**: sul desktop sta nella lista, quindi dentro la scena
  e' `display:none`; su touch **riappare** dentro la scheda, 40px GT Sectra
  Display Bold.
- **Immagini**: `<picture>` con quattro tagli veri — 450 / 815 / 1015 / 1440.
  Lo sfondo dell'hero passa da 353 KB a **40 KB**; le sette immagini dei
  progetti da 2,92 MB a **328 KB** in totale.
- **Il banner cookie**: da riquadro flottante 360px con `border-radius: 20px` in
  basso a sinistra, a barra piena a filo del bordo inferiore, `border-radius: 0`.
- **Il piede**: da `position:absolute; bottom:0` a blocco in flusso con
  `margin-top: 140px` (75px sotto 768px).

### RESTA

- **L'audio.** Il `SoundPlayer` non e' condizionato da `disable_dog`: `ambience.mp3`
  (329 KB) si scarica e si avvia anche sul telefono, filtro sullo scroll compreso.
  Il pulsante volume resta in basso a destra (a 15/25px dal bordo invece di 45/35px).
- **Il router Highway.js** e le transizioni di pagina col pannello che scorre.
- **`main.js` intero** (337 KB gzip): non c'e' code splitting per dispositivo.
- Il loader col cane a sprite e l'anello di progresso — anche se non c'e' piu' un
  modello 3D da aspettare.
- Tutto il testo, in ordine identico.

**Punti di rottura** (in `em`, quindi sul 16px di default del browser, non sul 14px
della radice): 350 / 450 / 600 / 768 / 815 / 1030 / 1460 / 1600 px. Il salto che
cambia il sito e' **1030px** unito a `.no-touchevents`.

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| CMS | WordPress (struttura Bedrock: `/app/themes/`, `/app/plugins/`, `/cms/wp-includes/`) | **VERIFICATO** | header `link: <https://dogstudio.co/wp-json/>`, `xmlrpc.php`, `wp-embed.min.js?ver=4.8.2` |
| tema | tema su misura `portfolio-2018` | **VERIFICATO** | tutti i percorsi degli asset |
| plugin | Yoast SEO 10.0.1, Polylang (cookie `pll_language`), Mailchimp for WP 4.5.0 | **VERIFICATO** | commento Yoast nell'HTML, `form-basic.min.css`, `document.cookie = "pll_language=en"` |
| build front-end | **webpack** + Babel per `main.js`; **browserify** per `dog.js` | **VERIFICATO** | `sourceURL=webpack:///./src/js/...` in uno, il prologo `function t(e,i,n){...}` di browserify nell'altro. Sono due catene di build diverse, il motore 3D e' un progetto a parte |
| routing SPA | **Highway.js** (libreria di Dogstudio stesso) | **VERIFICATO** | `data-router-wrapper` / `data-router-view` nell'HTML, `./src/js/vendors/highway/index.js`, `Highway.Core` con 12 renderer |
| animazione | **GSAP 2** (`TweenMax` / `TweenLite`) + keyframe CSS | **VERIFICATO** | `gsap__WEBPACK_IMPORTED_MODULE_*["TweenMax"]`, `Quad.easeOut`, `Quart.easeOut`, `Cubic.easeOut` |
| scroll | **`window.addEventListener('scroll')` nudo + `requestAnimationFrame`** | **VERIFICATO** | `Manager.onUpdate` fa un solo RAF globale; nessuna traccia di Locomotive/Lenis/ScrollTrigger |
| rivelazione | IntersectionObserver (soglie `[0, 0.15, 1]`) + polyfill | **VERIFICATO** | `./src/js/utils/in-view.js` |
| 3D | **Three.js** + `DRACOLoader` (decoder WebAssembly), matcap con atlante, SSAA su 2 livelli, FBO | **VERIFICATO** | 34 occorrenze di `THREE` in `dog.js`, `draco_decoder.wasm`, `SET_SSAA_QUALITY`, `matcap-combined-resized.jpg` |
| modello | `dog.drc.glb` (Draco) 860 KB; esiste anche `dog.glb` non compresso da 1,92 MB come fallback | **VERIFICATO** | scaricati entrambi, 200 OK |
| audio | **Web Audio API a mano** (`AudioContext` + `BiquadFilterNode` + due `GainNode` per il crossfade) | **VERIFICATO** | `./src/js/utils/audio.js`; nessuna libreria |
| video | **Plyr** con provider Vimeo (showreel `836218697`) | **VERIFICATO** | `data-plyr-provider="vimeo"`, 111 occorrenze di `plyr` |
| immagini | `<picture>` con 4 sorgenti + **vanilla-lazyload** (`.js-lazy`, `data-src`) | **VERIFICATO** | markup e `new LazyLoad({elements_selector:'.js-lazy'})` |
| formato immagini | **PNG**, nessun WebP/AVIF, nessun `srcset` a densita' | **VERIFICATO** | `Content-Type: image/png` su tutte |
| icone | un solo `spritesheet.svg` (2,9 KB) con `<use xlink:href>` + polyfill svg4everybody | **VERIFICATO** | markup |
| rilevamento dispositivo | **Detectizr** + **Modernizr** (touchevents), lato client | **VERIFICATO** | i due `<script>` in fondo al `<body>` |
| hosting / CDN | **Cloudflare** davanti a nginx, con **WP Rocket** | **VERIFICATO** | `Server: cloudflare`, `CF-RAY: ...-MXP`, `x-rocket-nginx-serving-static`, `cf-cache-status: DYNAMIC` |
| analytics | Google Tag Manager `GTM-KHP4LGL` | **VERIFICATO** | nell'`<head>` |
| accessibilita' | `.u-visually-hidden` su tutti gli `h1`/`h2`/`h3` decorativi, `user-is-tabbing` sul primo Tab | **VERIFICATO** | CSS + `handleFirstTab` |

Il sito **non e' una single page application opaca**: l'HTML arriva completo dal
server (titoli, testi, link, immagini in `<picture>`), Highway lo scambia dopo.
Tutto quello che c'e' scritto sopra e' letto dal codice sorgente vero, non dedotto.

## Peso e prestazioni

Misurato con `curl` il 13/08/2026 da Milano (`CF-RAY ...-MXP`), con
`Accept-Encoding: gzip, br` — cioe' **byte veri sul filo**.

**Rete**

| | 1a prova | 2a | 3a |
|---|---|---|---|
| TTFB | 2,58 s | 1,73 s | 1,97 s |
| totale HTML | 2,58 s | 1,74 s | 1,98 s |

`cf-cache-status: DYNAMIC` su tutte: **l'HTML non e' in cache al bordo**, ogni
richiesta arriva a WordPress. Per un sito con 4 pagine di contenuto e' il costo
piu' stupido che si paga: quasi 2 secondi buttati prima del primo byte utile.

**Peso degli asset** (trasferiti / non compressi)

| file | sul filo | sorgente |
|---|---|---|
| HTML | 11,2 KB | 58,2 KB |
| `main.css` | 52,5 KB | 506,1 KB |
| `main.js` | 336,9 KB | 1 693,7 KB |
| `dog.js` | 174,1 KB | 687,0 KB |
| `detectizr.js` + `modernizr.js` | 6,1 KB | |
| `dog.drc.glb` | 860,2 KB | (Draco) |
| `matcap-combined-resized.jpg` | 543,3 KB | |
| `dog_normals.jpg` | 450,4 KB | |
| `ambience.mp3` | 329,2 KB | |
| `home/background-xl.png` | 352,8 KB | |
| font (7 `woff2` usati in home) | ~150 KB | stimato: GT Sectra Bold 26,6 KB, Heebo Regular 19,4 KB misurati |
| `spritesheet.svg` | 2,9 KB | |

**Primo caricamento desktop ≈ 3,3 MB**, di cui **1,85 MB solo per il cane**
(modello + matcap + normali) e **511 KB di JavaScript**.

Le sette immagini dei progetti sono lazy ma pesantissime: `tomorrowland
background-1440.png` da sola fa **915 KB**, Royal Opera **722 KB**; le sette a
1440px fanno **2,92 MB**. Una visita desktop che passa il mouse su tutti i
progetti scarica **~6,2 MB**. Sono **PNG**: in WebP o AVIF costerebbero un quinto.

**Primo caricamento mobile ≈ 900 KB** (niente `dog.js` ne' asset 3D; sfondo da
40 KB; ma `main.js` intero da 337 KB e `ambience.mp3` da 329 KB restano).

**Punteggi Lighthouse: non ottenuti.** L'API PageSpeed Insights ha risposto
`Quota exceeded for quota metric 'Queries' ... per day` (quota condivisa della
macchina, gia' esaurita). Non ho aperto un browser per non violare la regola sul
browser condiviso.

## Tre cose da rubare

1. **Un unico oggetto 3D pilotato da un file di dati, non da codice.** Tutto il
   comportamento del cane sta in un JSON per famiglia di dispositivi
   (`data-desktop.js`, `data-tablet-portrait.js`, ...): per ogni stato di pagina
   ci sono N pose descritte come array paralleli (`DEPTH`, `H_ROTATION`,
   `V_ROTATION`, `X_OFFSET`, `Y_OFFSET`, `MOUSE_INFLUENCE`) e una lista di
   **keypoint agganciati a selettori CSS reali** (`{value: 0.66, offset: -300,
   element: '.home-about'}`). Il JS fa solo tre cose: al resize converte i
   selettori in coordinate `getBoundingClientRect().top + pageYOffset -
   innerHeight/2 + offset`, allo scroll trova in quale intervallo sei e
   interpola, e ogni frame fa un lerp a 0,2 verso quel valore. Risultato: si
   ricoreografa l'animazione **cambiando numeri in un JSON**, e il sito con
   sezioni diverse (o in un'altra lingua, con altezze diverse) non si rompe
   perche' i keypoint sono ancorati al DOM e non a pixel fissi. Vale anche senza
   3D: la stessa struttura pilota un canvas 2D, uno shader o un SVG.

2. **Il tema per cliente come attributo sul `<body>`, non come pagina.** Un solo
   `data-theme` sul `<body>` e una regola `body:before {position:fixed;
   inset:0; z-index:-2; transition: background-color .5s}` bastano a far virare
   l'intera pagina al colore del progetto sotto il puntatore. Ogni cliente e'
   due righe di CSS (`[data-theme=x]:before{background-color:...}` +
   `.home-cases-scene--x .home-cases-headline{color:...}`), aggiungerne uno non
   tocca il JavaScript. Al cambio pagina Highway copia `data-theme` dal
   documento nuovo (`root.dataset.theme = to.page.body.dataset.theme`) e il
   viraggio funziona anche fra pagine. Da rubare tale e quale: costa niente e
   fa sembrare il sito "vestito" per ogni cliente.

3. **L'ambiente sonoro filtrato dallo scroll.** Un solo mp3 in loop (329 KB)
   dentro un `AudioContext`, con un `BiquadFilterNode` in mezzo: nella prima
   mezza schermata di scroll il `frequency` va da **400 Hz a 4000 Hz** e il `Q`
   da **2 a 0,5**, cioe' il suono passa da "sotto una coperta" ad aperto man mano
   che entri nel sito; all'apertura del menu si richiude (400 Hz, Q 2, guadagno
   0,8 -> 0,6 in 1,2 s) e alla chiusura si riapre. Il cambio traccia e' un
   crossfade fra **due `GainNode`** con rampe lineari di 2 s, e i buffer sono
   messi in cache per URL. Niente librerie: ~200 righe. Da copiare anche la
   disciplina attorno: `AudioContext` sospeso finche' non c'e' un click,
   `visibilitychange` che sospende quando la scheda va in secondo piano, e un
   flag `videoPlaying` che impedisce all'ambiente di ripartire sopra un video.

## Non verificato

- **Punteggi Lighthouse / Core Web Vitals**: quota giornaliera dell'API
  PageSpeed Insights gia' esaurita, e non potevo aprire il browser condiviso.
  Restano validi i pesi e i TTFB misurati con `curl`.
- **Il rendering vero.** Non ho visto la pagina. Le pose del cane, il suo aspetto
  in ogni matcap e l'effetto complessivo dello scroll sono **ricostruiti dai
  numeri nel codice**, non guardati. La sequenza temporale invece e' esatta
  perche' i tempi sono espliciti (`setTimeout`, durate GSAP, `transition`).
- **I colori sono tutti letti dal CSS**, nessuno stimato da screenshot. Ma non ho
  potuto verificare *quale* colore vince dove ci sono sovrapposizioni con
  opacita' (es. le immagini dei progetti sono a `opacity: .5` sopra il fondo del
  tema: il colore percepito e' una miscela che non ho calcolato).
- **Il testo di 3 progetti su 7** (MSI Chicago, This Was Louise's Phone, KIKK
  Festival 2018) l'ho troncato: sta nell'HTML ma non l'ho estratto per intero.
- **`ambience.mp3`**: so che dura in loop e quanto pesa, non **cosa si sente**.
- **Le pagine interne** (`/studio/`, `/cases/`, `/careers/`, `/values/`,
  `/contact/`, le schede caso) non le ho aperte. So dai renderer registrati in
  Highway che esistono 12 template e dai `data-theme` che ci sono **~38 schede
  caso**, e dai moduli che esistono componenti `gallery`, `image-slider`,
  `medias-slider`, `facts`, `filters`, `advantages` che qui non ho descritto.
- **Il sorgente del motore 3D** (`dog.js`, 687 KB minificati con browserify) l'ho
  letto solo per stringhe e nomi di modulo: la logica di shading, la struttura
  dell'atlante matcap e il post-processing (FBO/SSAA) non li ho ricostruiti.
- **Se il sito e' ancora mantenuto**: il CSS e' stato ricompilato il **07/02/2024**
  (`?v=07022024`) mentre il JS e' fermo al **23/08/2019**. Le schede caso arrivano
  al 2024 (BOSS Dubai, UNKJD). Nel 2026 e' plausibile che il sito sia in
  manutenzione ridotta sotto DEPT, ma **non l'ho verificato**.
- **`wp-embed.min.js?ver=4.8.2`** suggerirebbe WordPress 4.8.2 (2017). E' quasi
  certamente solo la stringa di versione congelata nel tema, non la versione
  reale di WordPress: **non verificabile dall'esterno**.
