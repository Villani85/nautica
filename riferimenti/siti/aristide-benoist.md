# Aristide Benoist

- **URL**: https://aristidebenoist.com
- **Premio**: Awwwards Site of the Day 24/06/2021 (voto 8.01/10 — design 8.37, usability 7.37, creativity 8.18, content 8.17) + Developer Award 7.86, e **Site of the Month giugno 2021**. Tag dichiarati da Awwwards: WebGL, GLSL, Javascript. Fonti: https://www.awwwards.com/sites/aristide-portfolio-2021 e https://www.awwwards.com/aristide-benoist-portfolio-2021-wins-site-of-the-month-june-2021.html
- **Studio**: design **Jon Way Studio** (https://www.jonway.studio, credito in pagina: `DESIGN BY JW.S (JON WAY STUDIO)`), sviluppo e motion **Aristide Benoist** (indipendente)
- **Anno**: design 2021; la versione online oggi e' la stessa impaginazione aggiornata con lavori fino ad **aprile 2022** (`config.v = 2`)
- **Letto il**: 13/08/2026

> **Metodo, da dichiarare subito.** Non ho aperto il sito in un browser (vincolo del task: browser condiviso vietato). Tutto quello che segue e' letto **dal codice sorgente scaricato con `curl`**: `index.html`, `d.css`, `m.css`, `d.js`, `m.js`, il payload XHR di contenuto, i font `.woff2` e le immagini. E' un sito interamente client-side: il guscio HTML e' vuoto e l'app si monta in JS. Le cose che si possono affermare (geometrie, tempi, easing, colori, testi, pesi) sono lette letteralmente nel codice; quelle che si possono solo dedurre sono marcate.

---

## Cosa vende

Vende **Aristide Benoist come sviluppatore front-end/creative-dev freelance**: non un servizio, non un prodotto, ma la prova che chi ha scritto il sito sa scrivere quel tipo di sito. Il portfolio e' l'oggetto in vendita e la demo tecnica allo stesso tempo.

## A chi

A **direttori creativi, studi di design e agenzie** che devono affidare a qualcuno l'implementazione di un sito premiato (i clienti elencati in pagina sono Netflix, Google, Instagram, MGM Studios, Obama Foundation, Twitch, Dribbble, Jacques Marie Mage, Rappi, Bear Grylls, Fuse Project, Hims & Hers, Super Friendly, Watson DG).

Deve pensare uscendo: *"questo qui il WebGL se lo scrive a mano, e il sito non pesa niente"*. Il messaggio secondario e' la disponibilita': il nav dice `INDEPENDENT DEVELOPER / AVAILABLE APR. 2023` ed e' un link `mailto:`.

## Idea regista

**Trenta lavori sono trenta lamelle verticali su una fila orizzontale infinita: ne apri una e diventa lo schermo, e tutto il sito prende il suo colore.**

## Il momento

Il momento e' **il click su una lamella in modalita' "out"**.

Nel codice succedono cinque cose contemporaneamente, tutte con inseguimento esponenziale (`R.Damp`, coefficiente 0.07 per frame a 60fps):

1. il piano WebGL passa da `100 x 370` a `1054 x 602` unita' di progetto (misure a `psd` 1600x1200, riscalate a schermo);
2. il colore di fondo dell'intera pagina insegue il colore del progetto a 0.05/frame (es. da `#141414` a `#de4c3f` per *Canals*);
3. il titolo gigantesco (fino a `37.5vh` di corpo) si scrive **lettera per lettera**, ognuna che scivola da `translate3d(-101%,0,0)` dentro la sua maschera, con stagger per-lettera di **0.022–0.04** e durata **1600 ms** su easing `o6` (esponenziale in uscita);
4. le schede meta (`COMPLETED / TYPE / ROLE / CLIENT`) salgono da `y:101%` con **400 ms di ritardo**;
5. il bottone `EXPLORE` sale con **600 ms di ritardo**, seguito 200 ms dopo dalla lineetta verticale che si disegna e dall'icona `+` che si morfa.

Chiudendo, tutto rientra in **500 ms** su `o3` (cubica). Aperture lente e generose, chiusure secche: e' questa asimmetria che fa il ritmo.

## Struttura, sezione per sezione

Non e' un sito che scorre in verticale: e' una **macchina a quattro stati** su una sola schermata (`#app` e' `position:fixed; overflow:hidden`). "Durata in schermate di scroll" non si applica; al suo posto do l'ampiezza orizzontale.

| sezione (stato) | cosa mostra | cosa fa l'utente | ampiezza |
|---|---|---|---|
| `out` — indice | 30 lamelle verticali 100x370 con gap 20, tutte in grigio smorzato, fondo `#141414` | trascina col mouse o rotella (entrambi gli assi mappati su X); passa sopra una lamella e quella si accende | ~30 x 120 unita' = ~10 schermate orizzontali |
| `in` — progetto | 1 immagine 16:9 grande al centro, titolo enorme sopra/sotto, meta a sinistra, descrizione a destra, `EXPLORE` in basso al centro, `VISIT SITE` se il sito e' online | scorre lateralmente da progetto a progetto (i vicini restano lamelle), clicca `EXPLORE` | 30 posizioni, gap 152 |
| `w` — caso studio | l'immagine di copertina esce dall'alto, appaiono fino a 10 slot immagine 1600x900 + una colonna di 10 miniature 160x90 a destra con un riquadro bordato che segue l'attiva | clicca le miniature, frecce, `PROJECTS` per tornare | pagina piena, nessuno scroll |
| `a` — about | codice gigante `ESY68 / 33098L`, bio 4 righe, 7 link social, 4 colonne premi (CLIENTS, AWWWARDS, FWA, BEHANCE), credito design, copyright | legge, clicca `CLOSE` | pagina piena |

Le lamelle restano vive **anche in about**: in modalita' `a` la fila si allarga del 20% (`(gapX+w)*i*0.2`) e i piani si rimpiccioliscono di `scale:0.15` restando sullo sfondo.

## L'esperienza in ordine di tempo

**Primi dieci secondi (ricostruiti dal codice, non cronometrati).**

- **0 s** — arriva `index.html`: 4.453 byte, `<html style="background-color:#141414">`, `#app` vuoto con dentro solo tre `<span>` che contengono `0 0 1`. Uno script inline di 12 righe fa il *device sniffing* sull'user agent (`/Mobi|Andrdoid|Tablet|iPad|iPhone/` — con il refuso "Andrdoid" nel sorgente, piu' `MacIntel && maxTouchPoints>1` per l'iPad) e inietta **un solo** CSS e **un solo** JS: `/static/css/d.css` o `m.css`, `/static/js/d.js` o `m.js`. Non c'e' un bundle unico responsive: **sono due siti diversi decisi lato client**.
- **0.1 s** — i due font `.woff2` (7 KB in tutto) partono con `font-display:swap`.
- **0.3 s** — `d.js` (23 KB gzip) parte e fa **una sola chiamata dati**: `GET /?xhr=true&device=d&webp=1` → 100 KB di JSON con dentro *tutto*: l'HTML dell'intera app, il dizionario delle rotte, i titoli `<title>` di tutte e 32 le pagine e i parametri di animazione dei 30 progetti.
- **0.5 s → fine caricamento** — il contatore in alto a sinistra (corpo 50px, font Timmons NY) va da `001` a `100`. Non e' un progresso finto: e' `Math.round(99/30*immaginiCaricate)+1`. **Il sito non parte finche' non sono decodificate tutte e 30 le copertine**, cioe' **3,88 MB di WebP**. Su ADSL sono decine di secondi.
- **fine + 0 s** — le tre cifre del contatore escono verso `x:110%`, con stagger 0.03 ed easing `o6`.
- **fine + ~0.2 s** — le lamelle entrano: partono da `winW + (gap+w)*i*3` (cioe' fuori a destra, ognuna tre volte piu' lontana della precedente) e si assestano sulla griglia. Contemporaneamente le otto lettere di `ARISTIDE` scivolano dentro da `-110%` e i piedini (`EMAIL / INSTAGRAM / TWITTER`, `INDEPENDENT DEVELOPER / AVAILABLE APR. 2023`) salgono da `y:101%`.
- **da qui in poi** — nessun timer: tutto e' guidato dal puntatore. Passare sopra una lamella la illumina (`light` da 0 a 1, inseguimento 0.1/frame). Trascinare muove la fila; il ritardo tra posizione target e posizione reale viene misurato e trasformato in **schiacciamento** (`latency.x`, max 1) e **rotazione** (`latency.rotate`, ±1.7° in indice, ±2° in progetto). Rilasciare senza aver trascinato piu' di 6 px conta come click.

**Il resto, a blocchi.**

- **out → in**: descritto in "Il momento".
- **in → in (progetto successivo)**: il titolo esce nella direzione del movimento (`reverse` calcolato da `nuovoIndice > vecchioIndice`), quindi le lettere sembrano "spinte" dallo scorrimento invece che semplicemente sostituite. Dettaglio piccolo, costo zero, differenza enorme.
- **in → w**: la copertina vola in alto (`y = -0.8*(altezza+gap)`, con `pY:-0.1` di parallasse interna alla texture) e lascia il posto alla galleria. La prima immagine grande entra dopo 100 ms; le miniature entrano a cascata **80 ms per posizione**; tutte in `opacity 0→1` su `cubic-bezier(.39,.575,.565,1)` in 1000 ms. Le immagini si caricano con `img.decode()` prima di essere mostrate: mai un frame a meta'.
- **navigazione**: `history.pushState` + XHR. Nessun ricaricamento. Il server pero' **serve davvero** ogni URL profondo con il suo `<title>` e la sua `<meta description>` (verificato su `/house-of-gucci`), quindi la SEO regge.
- **tastiera**: gestite `ArrowLeft/Right/Up/Down`, `Enter`, `Escape`, `Tab`. `Tab` ha una gestione dedicata (`R.Tab`) e c'e' `history.scrollRestoration='manual'`.

## Animazioni

Tutto passa da **quattro primitive**: `R.Damp` (inseguimento esponenziale normalizzato sul delta-time), `R.M`/`R.TL` (tween + timeline con 19 easing scritti a mano), una classe di stagger su maschere `overflow:hidden`, e **una sola coppia di shader**.

| elemento | cosa si muove | legato a | curva / inerzia | note |
|---|---|---|---|---|
| fila di 30 piani | posizione X | trascinamento + rotella | `R.Damp` 0.08 (`out`/`a`), 0.07 (`in`/`w`) | rotella: si prende l'asse con delta maggiore, moltiplicato 0.556 (0.75 su Firefox in `deltaMode 1`) |
| ogni piano | curvatura in Z | distanza dal centro schermo, ampiezza = velocita' di trascinamento | `io2` **dentro il vertex shader** | uniforme `h` = raggio 500 px scalati, uniforme `g` = `latency.x` |
| ogni piano | rotazione | velocita' di trascinamento | lineare clampata | ±1.7° / ±2° |
| ogni piano | scala X/Y | velocita' di trascinamento | `Damp` | massimo 1.0 in `out`, 0.6 in `in` |
| ogni piano | grigio → colore | curvatura Z + `light` di hover | mix nel **fragment shader** | un piano piatto e non toccato e' grigio al 40% di alpha; curvarsi o essere puntato lo riporta a colore pieno |
| ogni piano | tinta moltiplicata sul colore del progetto | stato (attivo/non attivo) | `Damp` | uniforme `q`, valore per progetto 0.75 o 1 |
| fondo pagina | colore | progetto corrente | `Damp` 0.05/frame | e' un quad WebGL a schermo pieno, non un `background-color` CSS |
| titolo | lettere da `x:-101%` a `x:101%` | stato | `o6` 1600 ms (mostra) / `o3` 500 ms (nasconde) | stagger per-lettera 0.022–0.04 **definito progetto per progetto**; direzione invertita in base al verso del movimento |
| meta A/B/C/D e descrizione | `y:101% → 0 → -101%` | stato | `o6` 1600 ms, delay 400 ms, stagger 0.04 | maschere `overflow:hidden` |
| `EXPLORE` / `PROJECTS` | testo + lineetta verticale che si disegna + icona SVG | stato | `o6`, delay 600 ms, poi +200 ms | il testo dura 1400 ms, la lineetta 1200 ms: sfalsati apposta |
| icone `+` / `↓` / `×` / `↑` | **morphing dei `points` del `<polygon>`** | stato | `o5` | due stringhe di 12 punti interpolate a mano (`R.M` con `svg:'polygon'`) |
| sottolineature dei link | due `<div>` alti 2px che scorrono | hover | `cubic-bezier(.25,.46,.45,.94)` 500 ms in CSS | l'unica animazione dichiarata in CSS invece che in JS |
| freccia `↗` accanto ai link | opacita' + `translateX(±100%)` | hover | `cubic-bezier(.25,.46,.45,.94)` 200 ms entrando, 400 ms uscendo | asimmetria voluta |
| paginazione in alto | 30 trattini, quello attivo si allarga a 24.9x14 px, i numeri `01`/`30` entrano da `x:-100%` | indice corrente | `io2` + `Damp` | disegnata su **canvas 2D a dpr 2**, non in DOM |
| galleria del caso studio | opacita' immagini + riquadro bordato che scorre | click sulle miniature | `cubic-bezier(.39,.575,.565,1)` 1000 ms, cascata 80 ms | ogni immagine passa da `img.decode()` |
| contatore di caricamento | 3 cifre da `x:-110%` a `x:110%` | avanzamento del preload | `o6`, stagger 0.03 | |
| about | lettere `ESY68 / 33098L` da `x:-101%`, righe bio e liste da `y:110%` | ingresso/uscita | `o6` / `o3` | |

**Libreria dietro: nessuna.** Zero GSAP, zero Three.js, zero Lenis, zero React. Grep su `d.js`: `THREE` 0 occorrenze, `gsap` 0, `TweenMax` 0, `lenis` 0. WebGL 1 chiamato a mano (`getContext('webgl')`, `OES_vertex_array_object`), matematica delle matrici 4x4 copiata inline da gl-matrix, easing e bezier-solver scritti a mano.

**Manca:** nessun `prefers-reduced-motion` da nessuna parte (0 occorrenze in HTML, CSS e JS). Chi ha impostato "riduci movimento" nel sistema riceve comunque tutto.

## Colori

Colori di sistema (letti da `window._A` e dal CSS inline):

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo di partenza | `#141414` | `<html>` inline + colore iniziale del quad WebGL |
| testo di partenza | `#bac4b8` | nav, about, piedini (verde-grigio freddo, non bianco) |
| theme-color browser | `#171717` | barra del browser mobile |
| mask-icon Safari | `#0b0c0c` | icona pinnata |
| overlay "no JS" | fondo `#fff`, testo `#000` | solo nel `<noscript>` e nel fallback `nomodule` |

Poi **ogni progetto porta la sua palette** e la impone all'intero sito. Ognuno dichiara tre valori: `bg` (fondo pagina), `txt` (titolo, meta, linee, icone) e `work` (fondo della pagina caso studio, sempre una versione piu' scura o piu' chiara del `bg`).

| # | progetto | bg | txt | work |
|---|---|---|---|---|
| 01 | House of Gucci | `#ffffff` | `#cc9933` | `rgb(240,240,240)` |
| 02 | Paul et Henriette | `#bebebe` | `#1e1e1e` | `rgb(168,168,168)` |
| 03 | Canals | `#de4c3f` | `#fff1ce` | `rgb(203,69,57)` |
| 04 | Jacques Marie Mage | `#e7e6e3` | `#1e1e1e` | `rgb(214,213,210)` |
| 05 | Mank | `#0a0a0a` | `#d9d9d9` | `rgb(23,23,23)` |
| 06 | Waka Waka №1 | `#d5d5d5` | `#2a2a2a` | `rgb(189,189,189)` |
| 07 | Capsulin | `#080911` | `#f0f0f0` | `rgb(1,1,3)` |
| 08 | Design Embraced | `#595e63` | `#d99299` | `rgb(76,81,86)` |
| 09 | New Company | `#898270` | `#e0c8a4` | `rgb(119,113,97)` |
| 10 | TM | `#0c0c0c` | `#da452f` | `rgb(15,11,8)` |
| 11 | Waka Waka N°2 | `#85817d` | `#f6f0e2` | `rgb(116,112,108)` |
| 12 | stuuudio | `#fef8f6` | `#bd998f` | `rgb(251,240,236)` |

Il testo secondario non usa mai un grigio: usa lo **stesso colore del testo con `opacity: 0.7`** (o 0.8 su alcuni progetti). Un colore solo per stato, mai due.

## Tipografia

Due famiglie, punto.

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| titolo progetto | **Timmons NY 2.0 Regular** (Matt Willey) | 400 | `37.5vh` se schermo largo, `26.5vw` se stretto | `28.125vh` / `19.88vw` | interlinea **inferiore al corpo**: le righe si compenetrano |
| wordmark `ARISTIDE` / contatore | Timmons NY | 400 | 50 px | 44 px | letter-spacing `-0.02em` |
| codice about `ESY68 / 33098L` | Timmons NY | 400 | `calc(17.5vh + 100px)` | `calc(13.07vh + 74.7px)` | tre scaglioni per altezza finestra (>850, 750–850, <750) |
| meta e descrizioni | **JWStudio Sans Bold** | 700 | 10–12 px | 10–14 px | letter-spacing `+0.02em` |
| bio about | JWStudio Sans Bold | 700 | 11 px | 10 px | |
| paginazione (canvas) | JWStudio Sans Bold | 700 | 12 px | 14 px | disegnata su canvas |

**Come sono serviti.** Due `@font-face` dentro il `<style>` inline dell'HTML, quindi **zero richieste bloccanti**, `font-display:swap`, file locali, nessun servizio esterno. Sono **sottoinsiemi tagliati a mano**:

- `t.woff2` = **2.760 byte**, 67 glifi: `&0-9 A-Z a-z Ø`. Nient'altro. Niente punteggiatura, niente accenti.
- `jw.woff2` = **4.228 byte**, 59 glifi: `&()+,-.0-9:@ A-Z © ® ™ – — ↖ ↗`. **Nessuna minuscola**: tutta l'interfaccia e' maiuscola per costruzione, non per `text-transform`.

Sette kilobyte di tipografia per l'intero sito. La `Ø` esiste solo per scrivere `nØ8` e `nØ6` nei titoli Epicurrence.

Nessuna variabile, nessun peso intermedio, nessun corsivo. Il font di interfaccia e' **di proprieta' dello studio** (JWStudio Sans, Jon Way Studio, licenza non rivendibile), quello display e' comprato (Timmons NY, buyfontssavelives.com).

## Testi veri

**Meta / condivisione**
- `<title>`: `Aristide Benoist — Independent developer`
- description: `Aristide Benoist is a developer who specializes in motion and interaction. As an independent, he works with companies, agencies, startups and individuals all over the world.`
- twitter: `@AristideBenoist`

**Navigazione (desktop)**
- wordmark: `ARISTIDE` (link a `/`)
- alto a destra: `ABOUT` / `CLOSE`
- basso a sinistra: `INDEPENDENT DEVELOPER` / `AVAILABLE APR. 2023` (entrambe dentro un `mailto:`)
- basso a destra: `EMAIL` `INSTAGRAM` `TWITTER`
- basso al centro (in progetto): `EXPLORE`
- alto al centro (in caso studio): `PROJECTS`
- basso al centro (in caso studio): `↗` / `VISIT SITE`

**Scheda progetto — schema fisso, quattro voci etichettate A B C D**
```
A  COMPLETED   FEBRUARY 2022
B  TYPE        PROMOTIONAL
C  ROLE        FULLSTACK DEV & MOTION
D  CLIENT      MGM STUDIOS - WATSON DG
```
e a destra, due righe secche spezzate a mano:
```
EXPLORE BEHIND-THE-SCENES THE MAKING OF
RIDLEY SCOTT'S HOUSE OF GUCCI..
```
Altre, testuali:
- `PERSONAL PROJECT MADE WITH MARCUS BROWN / ABOUT THE HISTORY OF THE AMSTERDAM CANALS.`
- `THE DIGITAL ART BOOK OF MANK, A NETFLIX / MOVIE DIRECTED BY DAVID FINCHER.`
- `CAPSULIN ALUMINIUM, A ONE PAGE WEBSITE / MADE WITH INDEX STUDIO IN NATIVE WEBGL.`
- `ECOMMERCE FOR JACQUES MARIE MAGE, / EYEWEAR DESIGNER AND MANUFACTURER..`

I valori di `ROLE` sono solo tre in tutto il sito: `FULLSTACK DEV & MOTION`, `FRONT-END DEV & MOTION`, `CREATIVE DEV`.

**I 30 titoli, con il maiuscolo/minuscolo esatto** (e' texture tipografica, non un errore):
`houseof GuccI` · `p&h` · `CanaLS` · `Jmm` · `ManK` · `WaKa WaKa` · `CapsulIn` · `desIGn eMbRaced` · `nEW COMPanY` · `TM` · `WaKa WaKa` · `stuuudIo` · `DRIBBBLE` · `folIo v4` · `CRsa` · `maRRy mondAy` · `RappI pay` · `monfRInI` · `aLLYOUR Days` · `BEnJamIn Guedj` · `eveRest` · `maKe ReIGn` · `GuIllauMe` · `epIcuRRence nØ8` · `folIo v1` · `Ben mInGo` · `dIGItal asset` · `jenny johannesson` · `BEaR GRylls` · `epIcuRRence nØ6`

**About**
- titolo gigante: `ESY68` / `33098L` (codice, mai spiegato)
- bio: `ARISTIDE BENOIST IS A DEVELOPER WHO SPECIALIZES IN / MOTION AND INTERACTION. AS AN INDEPENDENT, HE WORKS / WITH COMPANIES, AGENCIES, STARTUPS AND INDIVIDUALS / ALL OVER THE WORLD.`
- colonna `CLIENTS`: `BEAR GRYLLS, DRIBBBLE, FUSE PROJECT, GOOGLE, HIMS & HERS, INSTAGRAM, JACQUES MARIE MAGE, MGM STUDIOS, NETFLIX, OBAMA FOUNDATION, RAPPI, SUPER FRIENDLY, TWITCH, WATSON DG` (impaginata come un indice, con le iniziali `A` e `Z` come segnaposto agli estremi)
- colonna `AWWWARDS`: `2 INDEPENDENT OF THE YEAR`, `3 SITE OF THE MONTH`, `30 SITE OF THE DAY`, `27 DEVELOPER AWARD`, `6 MOBILE OF THE WEEK`, `22 MOBILE EXCELLENCE`
- colonna `FWA`: `1 FWA OF THE MONTH`, `2 FWAWWWARD`, `22 FWA OF THE DAY`
- colonna `BEHANCE`: `1 GRAPHIC DESIGN`, `7 GALLERY`, `11 INTERACTION`
- piede: `DESIGN BY JW.S (JON WAY STUDIO) ↗` — `ALL RIGHTS RESERVED` / `ARISTIDE BENOIST 2026®` (l'anno e' generato lato server: oggi dice 2026)

**Fallback**
- `<noscript>`: `Please enable JavaScript to view this website.`
- browser vecchio (`<script nomodule>`): `Please update your browser to view this website.`

## Mobile

**E' la sezione decisiva, ed e' il caso limite: sul telefono il portfolio non esiste.**

Non c'e' una versione ridotta, non ci sono breakpoint condivisi. Lo script inline nell'`<head>` sniffa l'user agent e carica **un altro CSS e un altro JS**. Sul telefono arrivano `m.css` (2.712 byte) e `m.js` (14.662 byte, di cui **12.497 sono la stessa libreria condivisa**: il codice specifico del sito mobile e' **2.165 byte**).

**Cosa SPARISCE** — praticamente tutto:
- il canvas WebGL, i 30 piani, gli shader, il trascinamento, la rotella, l'hover, la curvatura, la desaturazione, la rotazione da inerzia;
- il canvas 2D della paginazione;
- **i 30 progetti**: nessuna immagine, nessun titolo di progetto, nessuna scheda, nessuna pagina caso studio, nessun link a `/house-of-gucci` & co.;
- **tutte le animazioni**: nel `m.js` non c'e' una sola chiamata di animazione, solo la libreria condivisa e il router;
- il contatore di caricamento (`#load{display:none}`).

**Cosa viene SOSTITUITO**:
- l'esperienza a stati diventa **una singola pagina statica che scorre**, con `<header> <section> <footer>` veri;
- al posto del portfolio c'e' una riga, in chiaro: **`(VISIT ON A DESKTOP FOR A FULL PORTFOLIO)`**, resa in `opacity:.5`;
- l'elenco premi diventa due righe di testo: `AWWWARDS (90), BEHANCE (19), FWA (25)`;
- la scala non e' piu' in `vh` ma tutta in `vw`, con tre fasce (`>900`, `500–900`, `<500`) e valori decimali calcolati (`h1` a `65vw` con interlinea `48.555vw` sotto i 500px);
- il routing resta SPA (stesso `?xhr=true&device=m`), ma serve solo per `/` e `/about`.

**Cosa RESTA**: il codice `ESY68 / 33098L` come `<h1>`, la bio identica, `ARISTIDE` / `INDEPENDENT DEVELOPER — AVAILABLE APR. 2023 ↗`, i 7 link di contatto, l'elenco clienti, il credito Jon Way Studio, il copyright. Cioe' **il biglietto da visita**, e nient'altro.

Da notare l'ironia produttiva: nella colonna premi in about ci sono `6 MOBILE OF THE WEEK` e `22 MOBILE EXCELLENCE`. I premi mobile li ha vinti sui siti dei clienti; sul proprio ha deciso che sul telefono non vale la pena.

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| framework JS | **nessuno**. Micro-libreria personale `window.R`, 12.497 byte minificati, 43 helper (`Damp`, `Lerp`, `Ease`, `Ease4`, `M`, `TL`, `RafR`, `ROR`, `Fetch`, `Select`, `Snif`, `Tab`…) | **VERIFICATO** | letta nel sorgente; identica nei primi 12.497 byte di `d.js` e `m.js` |
| animazione | scritta a mano: 19 easing + risolutore cubic-bezier a 4 punti + timeline + stagger su maschere | **VERIFICATO** | `R.Ease` e `R.Ease4` nel sorgente |
| GSAP / Motion / anime.js | **nessuno** | **VERIFICATO** | 0 occorrenze di `gsap`, `TweenMax`, `motion` in `d.js` |
| smooth scroll (Lenis/Locomotive) | **nessuno**: non c'e' scroll. `#app` e' `fixed/overflow:hidden`, il movimento e' `R.Damp` sulla posizione X | **VERIFICATO** | CSS + gestore `wheel` |
| 3D | **WebGL 1 a mano**, nessuna libreria. Matematica mat4 inline (stile gl-matrix), `OES_vertex_array_object`, `TRIANGLE_STRIP`, `CULL_FACE FRONT`, `blendFuncSeparate` | **VERIFICATO** | `getContext('webgl')`, `createShader`, 0 occorrenze di `THREE` |
| shader | **una sola coppia**: vertex 362 caratteri, fragment 409. Totale **771 caratteri di GLSL** per tutto il sito | **VERIFICATO** | estratti dal sorgente |
| canvas 2D | uno, `#c2d`, a dpr 2, solo per la paginazione a trattini | **VERIFICATO** | `getContext('2d')` |
| immagini | WebP con fallback JPG, deciso da un flag `webp` che il **server** mette in `window._A` e che il client rimanda indietro nella query (`&webp=1`) | **VERIFICATO** | `_A.webp` + costruzione URL `'.'+(webp?'webp':'jpg')` |
| backend / CMS | **PHP 8.2.1**. Nessun CMS riconoscibile; contenuti probabilmente in file di configurazione | VERIFICATO per PHP (header `X-Powered-By: PHP/8.2.1`), **SUPPOSTO** per l'assenza di CMS |
| hosting | **AWS**: Lambda/PHP dietro **API Gateway**, davanti **CloudFront** | **VERIFICATO** | header `Apigw-Requestid`, `Via: … cloudfront.net`, `X-Amz-Cf-Pop: FCO50-P2` |
| rendering | SPA client-side, ma con **rotte reali lato server**: ogni URL profondo risponde 200 con `<title>` e `<meta description>` propri e con `_A.is.work=true` | **VERIFICATO** | confronto tra `/` e `/house-of-gucci` |
| build | il codice e' minificato e i nomi delle uniform GLSL sono compressi a una lettera (`a,b,c,d,e,f,g,h,m,n,o,p,q,r,y`): c'e' una pipeline. Quale, non si vede | **SUPPOSTO** | |
| analytics / tag manager | **nessuno** | **VERIFICATO** | nessuno script di terze parti in HTML o JS |
| cookie banner | **nessuno** | **VERIFICATO** | |

## Peso e prestazioni

**Righe di codice** (misurate sul minificato scaricato; "righe logiche" = dopo aver spezzato su `;` e `{}`):

| file | byte serviti | byte reali | righe logiche | istruzioni (`;`) |
|---|---|---|---|---|
| `index.html` | 4.453 (non compresso) | 4.453 | 1 | — |
| `css/d.css` | **2.218** (gzip) | 9.481 | 183 regole, **25 media query** | 222 dichiarazioni |
| `css/m.css` | **706** (gzip) | 2.712 | 62 regole, 3 media query | 56 dichiarazioni |
| `js/d.js` | **23.419** (gzip) | 69.520 | **2.342** | 864 |
| `js/m.js` | **5.928** (gzip) | 14.662 | 544 | 194 |
| — di cui libreria `R` condivisa | — | 12.497 | ~470 | — |
| — di cui app **desktop** | — | **57.023** | ~1.870 | — |
| — di cui app **mobile** | — | **2.165** | ~74 | — |
| GLSL | incluso in `d.js` | **771** | 2 shader | — |

Quindi: **l'intera esperienza desktop premiata sta in 57 KB di JavaScript minificato piu' 771 caratteri di GLSL.** Compresso, tutto il codice (HTML + CSS + JS) arriva a **~34 KB**.

**Peso della prima schermata, desktop** (misurato con `curl`, home):

| risorsa | richieste | byte |
|---|---|---|
| `index.html` | 1 | 4.453 |
| `d.css` (gzip) | 1 | 2.218 |
| `d.js` (gzip) | 1 | 23.419 |
| `t.woff2` + `jw.woff2` | 2 | 6.988 |
| payload XHR (JSON, **non compresso**) | 1 | 100.329 |
| 30 copertine WebP 1219x696 | 30 | **3.880.022** |
| **totale prima di poter interagire** | **36** | **~4,02 MB** |

Senza immagini: **137 KB e 6 richieste**. Con le immagini: **3,94 MB**, e sono tutte bloccanti perche' il preloader aspetta l'ultima. La copertina piu' pesante e' `jmm` (256 KB), la piu' leggera `digital-asset` (10,9 KB); media 129 KB.

**Peso di una pagina caso studio** (esempio House of Gucci, 7 immagini): 7 x WebP 1600x900 da 46–111 KB = **553 KB** + 7 miniature 160x90 da 1,6–4,6 KB = **22 KB**. Caricate progressivamente, non in blocco.

**Peso totale mobile**: `index.html` 4.453 + `m.css` 706 + `m.js` 5.928 + payload 18.594 + font 6.988 = **36.669 byte, 6 richieste, zero immagini.** Il sito mobile pesa **lo 0,9%** del sito desktop.

**Numero di effetti distinti**: **16** (contati nella tabella Animazioni), prodotti da **1 coppia di shader + 1 funzione di damping + 1 sistema di tween con 19 easing**. Nessun effetto ha un file suo: sono tutti riusi degli stessi tre attrezzi con parametri diversi.

**Carico GPU**: 30 piani a 20x2 vertici = 1.200 vertici in tutto, 31 draw call per frame, un solo programma shader, una texture per piano. E' niente. Il loop inoltre si **spegne da solo**: `needGL` confronta i valori arrotondati corrente/target e se nessuno e' cambiato non ridisegna.

**Cose non ottimizzate** (le dico perche' sono istruttive: anche un sito premiato le lascia):
- il payload da 100 KB **non e' compresso** (nessun `Content-Encoding` sulla risposta PHP; solo gli asset statici passano dal gzip di CloudFront). Sarebbero ~15 KB gzippati.
- `index.html` non e' compresso (4,4 KB).
- il preload di **tutte** le 30 copertine prima del primo frame e' una scelta di regia, non di prestazioni: garantisce che il trascinamento sia perfetto da subito, al prezzo di 3,9 MB e di un'attesa reale.
- nessun `prefers-reduced-motion`.
- nessun `sitemap.xml` (404). `robots.txt` esiste e vieta solo `/php/`.

Punteggi Lighthouse: **non misurati** (niente browser). Awwwards, che valuta anche l'usabilita', ha dato **7.37/10 su usability** contro 8.37 su design: e' coerente con un sito che su mobile non mostra i lavori e che fa aspettare 4 MB.

## Tre cose da rubare

**1. Il device switch nell'`<head>`, 12 righe, prima di ogni altra cosa.**
Un solo `<script>` inline che decide *quale* CSS e *quale* JS scaricare, e inietta solo quelli:
```js
const n = /Mobi|Android|Tablet|iPad|iPhone/.test(navigator.userAgent)
       || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ? "m" : "d";
```
Il risultato non e' "un sito responsive": sono **due siti**, che condividono solo 12 KB di libreria e i contenuti testuali. Il telefono non scarica una riga di WebGL. Non e' la soluzione giusta per un e-commerce, ma per un sito-esperienza e' il modo piu' onesto ed economico di risolvere il mobile: invece di degradare l'effetto, si taglia. Costo: due fogli di stile e due entry point, non due codebase.

**2. Un colore per stato, e lo stato lo porta il contenuto.**
Ogni progetto e' un oggetto dati con `{ bg, txt, work, multiply, inOverLight, title.delay, title.x[] }`. Il sito non ha temi: **ha un colore corrente**, e quel colore insegue il progetto sotto il puntatore con `Damp(0.05)`. Da li' derivano fondo, testo, bordi, riempimento delle icone SVG, sfondo delle sottolineature. Aggiungere un progetto = aggiungere sei numeri. Rubabile senza WebGL: basta una variabile CSS `--accent` interpolata in JS su `requestAnimationFrame`.

**3. Misurare il ritardo e trasformarlo in deformazione.**
Il trucco che fa sembrare "pesanti" le lamelle non e' una fisica: sono due inseguitori sulla stessa posizione, uno veloce (`0.08`) e uno lento (`0.08` su un altro accumulatore). La **differenza** tra i due e' la velocita' percepita, e viene mappata su due sole cose:
```
latency.x      = min(|delta|/500, 1)      -> ampiezza della curvatura (uniform g)
latency.rotate = clamp(delta/294, -1.7, 1.7) -> rotazione in gradi
```
Due righe, e ogni elemento della fila reagisce al trascinamento con la stessa legge. Funziona identico su elementi DOM: `transform: rotate(var(--lat)deg) scaleY(calc(1 - var(--lat)*0.05))`. E' la meccanica piu' riusabile di tutto il sito.

*(Bonus, quasi gratis: aperture a 1600 ms su easing esponenziale, chiusure a 500 ms su cubica. L'asimmetria costa zero e fa piu' della meta' della sensazione di qualita'.)*

## Non verificato

- **Non ho visto il sito.** Nessuna schermata, nessun video. Geometrie, tempi, curve, colori e testi sono letti nel codice; l'**effetto percepito** e' una ricostruzione. In particolare non ho potuto verificare l'aspetto della curvatura, la leggibilita' del titolo sopra l'immagine, e se ci sia un cursore personalizzato (nel codice non ce n'e' uno, ma potrebbe esserci un effetto visivo che mi sfugge).
- **Frame rate, Lighthouse, Core Web Vitals**: non misurati. Servirebbe un browser.
- **Tempo reale di caricamento**: non misurato. So che il preloader aspetta 3,88 MB, non so quanto duri sulla connessione di un utente.
- **Il valore delle uniform `m` (scala texture) e `y` (offset verticale texture)** l'ho dedotto dal contesto: servono a fare il "cover fit" dell'immagine dentro un piano che cambia proporzioni. Non l'ho confermato visivamente.
- **Il significato di `ESY68 / 33098L`**: non spiegato da nessuna parte nel codice. Possibile riferimento a coordinate o a un numero di serie. Non verificato.
- **La pipeline di build** (bundler, minificatore, chi comprime i nomi delle uniform GLSL): non deducibile dagli artefatti.
- **Se il server usi un CMS**: l'unico indizio e' `X-Powered-By: PHP/8.2.1` e `Disallow: /php/` nel robots.txt. Nessuna firma di CMS noto.
- **Le pagine caso studio dei singoli progetti** (`/house-of-gucci` ecc.): ne ho letto i dati e le immagini, ma non l'impaginazione reale a schermo.
- **Le immagini della galleria oltre le prime**: `curl` sulle cartelle `w/l/` e `w/s/` funziona solo con l'indice giusto; ho campionato House of Gucci (7+7) e non tutti e 30 i progetti.
- **Se esista una versione tablet distinta**: lo sniff manda gli iPad sul percorso mobile, ma le media query di `m.css` prevedono anche `min-width:900px`. Non ho verificato cosa succeda su un tablet in orizzontale.

---

*Nessuna scheda del browser e' stata aperta per produrre questa scheda: solo `curl`, `WebFetch` e `WebSearch`.*
