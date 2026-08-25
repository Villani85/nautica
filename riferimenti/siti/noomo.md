# Noomo Agency

- **URL**: https://noomoagency.com
  - satelliti: https://showcase.noomoagency.com · https://labs.noomoagency.com · https://storytelling.noomoagency.com
- **Premio**: Awwwards — **Site of the Day 21/09/2023** + **Developer Award 2023**; poi **"Website of the year"**, che lo studio stesso data **2024** (l'annuale del 2023 si vota a inizio 2024). Punteggi SOTD: design 7.93 · usability 7.41 · creativity 7.73 · content 7.79 · **totale 7.72**. Developer award 7.47 (semantics/SEO 7.80 · animations 7.80 · accessibility 7.20 · WPO 7.20 · responsive 7.20 · markup 7.60). Fonte: https://www.awwwards.com/sites/noomo-agency
- **Studio**: Noomo Agency — Los Angeles. Agenzia **fondata da una famiglia ucraina**, si dichiara **woman owned**; co-fondatrice e Design Director **Olha Uzhykova**
- **Anno**: 2023 la versione premiata; quello online oggi e' un rifacimento successivo
- **Letto il**: 13/08/2026

---

## Avvertenza: due siti diversi con lo stesso indirizzo

La scheda Awwwards premia il sito di settembre 2023, descritto li' come *"Noomo Agency -
a boutique interactive design agency. Headquartered in Los Angeles, we craft interactive
and immersive experiences with a user-centered approach"*, con **un solo colore
dichiarato, `#DEE7F1`**.

Quello che ho scaricato il 13/08/2026 e' **una versione successiva**: posizionamento
riscritto da "boutique interactive agency" a **"3D storytelling websites"**, tabella premi
aggiornata fino al 2026, e una rete di quattro sottodomini che nel 2023 non esisteva.

Il `#DEE7F1` premiato sopravvive: oggi e' il fondo del **preloader** e della **tendina di
transizione** fra pagine. Il resto del sito e' passato a `#c9d2e7`.

Tutto quello che segue e' misurato sulla **versione di oggi**, salvo dove scrivo [2023].
La versione 2023 non l'ho potuta ricostruire (vedi *Non verificato*).

---

## Cosa tratta il sito

Il sito di un'agenzia interattiva. Dentro, in concreto:

1. Una **scena 3D WebGL a schermo pieno** che occupa da sola i primi ~10 schermi di scroll
   e dentro cui scorrono i casi studio. Non e' un ornamento sopra la pagina: **e' la prima
   meta' della pagina**.
2. Un blocco di testo che spiega cosa fanno, con l'elenco dei **servizi** e dei **clienti**.
3. Tre **testimonianze** firmate con nome e ruolo.
4. Una **tabella dei premi** enorme: 7 enti (FWA, Webby, Red Dot, SF Design Week, Awwwards,
   CSS Design Award, ADC Europe), 53 righe visibili + `+ 50 more awards`.
5. **Insights**, gli articoli.
6. Un **modulo di contatto con selettore di budget**.

Il portfolio vero sta su `/work`: 22 casi, quasi tutti marcati `Case Study`, con i tag
tecnici accanto (`Web3, 3D, Microsite, Brand Activation`, `Website, Storytelling,
Enterprise`, `3D, WebGPU, Three.js, Immersive`...).

## Cosa vende, e qual e' l'obiettivo finale

Vende **siti 3D/WebGL su misura, a partire da 50.000 dollari**. Il prezzo non e' scritto da
nessuna parte come prezzo, ma il modulo lo dichiara: il primo scaglione di budget
selezionabile e' `50K–100K`, e non c'e' niente sotto.

L'obiettivo dichiarato e' far compilare il modulo. L'obiettivo vero e' doppio, e le due
cose non coincidono:

- **Qualificare pochissimi clienti molto grandi.** Il selettore di budget e' un filtro
  d'ingresso: chi ha 15.000 dollari capisce da solo che non e' il posto.
- **Restare nel giro dei premi.** Un'agenzia che dedica al muro dei premi ~4 schermi di
  scroll e che mantiene quattro sottodomini sperimentali (Labs, Showcase, Storytelling,
  Playground) sta usando i premi come canale commerciale. I clienti di quel calibro
  scelgono guardando chi ha vinto.

Segnale netto: il sito **non vende un servizio, vende una capacita' tecnica**. La prova non
e' un caso studio con dei numeri, e' la pagina stessa che gira a 60fps.

## A chi

Creative director e marketing director di aziende tecnologiche grandi. I clienti citati:
**Salesforce, AMD, Coinbase, Red Bull, Intel, Samsung, Vogue Business, Cadence Design
Systems, Space Needle**, piu' sanita' (Percipio Health, OneLine Health, Vibrant Wellness) e
finanza (Middle Finance, Yolo Federal Credit Union, Battalion).

- **Cosa sa gia'**: cos'e' WebGL, e che costa. Ha gia' un brand e delle linee guida.
- **Cosa teme**: di pagare 200.000 dollari una cosa bella che non regge il traffico, che il
  reparto legale blocchi, che l'agenzia sparisca a meta' progetto. Il sito risponde a
  quest'ultima paura esplicitamente: *"you get the value of working with founders"*.
- **Cosa deve pensare uscendo**: "questi sono i migliori al mondo a fare questa cosa
  specifica, e me lo hanno dimostrato mentre scorrevo, non raccontato".

## L'esperienza progettata

E' una **dimostrazione**, non un racconto e non una vetrina. La struttura e' quella del
"show, don't tell" portata all'estremo: la pagina non dice *sappiamo fare 3D*, ti mette
dentro un 3D per dieci schermi prima di dirti una sola parola su di se'.

Il ritmo e' spezzato in due tempi nettissimi:

**Tempo 1 — la dimostrazione (schermate 0 → ~10).** Scena WebGL a schermo pieno. Zero HTML:
fra l'apertura di `.home-page` e il primo blocco di testo il sorgente e' **vuoto**, ci sono
solo un `<div id="main-scene">` da riempire e un'immagine di fondo di riserva. Lo scroll
non fa scorrere una pagina, **fa avanzare una scena**: e' la barra di avanzamento di un
filmato. I casi studio compaiono dentro la scena, ognuno con un titolo che occupa `28vh`.

**Tempo 2 — le credenziali (schermate ~10 → ~21).** La scena si spegne e il sito diventa un
documento normale: chi siamo, servizi, clienti, testimonianze, muro dei premi, articoli,
modulo. Tipografia grossa, fondo chiaro, niente 3D.

Il visitatore deve fare **una cosa sola: scorrere**. Non ci sono scelte, rami, menu da
aprire per capire. L'unica interazione facoltativa e' passare il mouse sulle righe dei
premi: appare un'anteprima 160x170px del progetto che segue il cursore.

**L'immagine che resta in testa**: la lettera **O** che si compone in 3D. Nella cartella dei
modelli ci sono esattamente due file: `/newModels/O.glb` (33 KB) e `/newModels/4.glb`
(2,8 KB). Il marchio *Noomo* ridotto alla sua lettera, materializzata.

## Come e' organizzata la persuasione

L'ordine e' **rovesciato** rispetto a un sito d'agenzia normale, ed e' la scelta piu'
interessante del progetto:

| | dove sta | a che schermata |
|---|---|---|
| **prova** (la scena 3D che gira) | primissima cosa | 0 |
| **promessa** ("we create 3D storytelling websites... where craft and narrative become one") | dopo la prova | ~10 |
| **prova sociale** (clienti, testimonianze) | subito dopo | ~11-13 |
| **autorita'** (muro dei premi) | il blocco piu' lungo | ~14-18 |
| **prezzo** (scaglioni di budget) | dentro il modulo | ~19 |
| **chiamata all'azione** (`Send`) | fondo pagina | ~20 |

Ci vogliono **circa venti schermate** per arrivare al modulo. E' pochissimo efficiente in
senso classico, e qui e' voluto: il filtro fa parte del prodotto.

Le tre testimonianze non parlano di risultati ma di **modo di lavorare**, che e' il vero
oggetto della vendita a questi importi:

> *"Noomo does such incredible and thoughtful work. I have been at this almost 25 years and
> have never been more impressed with an agency."* — Wallis Mills, Director of Marketing

> *"I've been very impressed with how the Noomo team has worked quickly to immerse
> themselves in the narrative of our often complicated suite of products and solutions."*
> — Jonny Fruits, Sr. Creative Director [Salesforce]

**Cosa arriva a chi non scorre fino in fondo — cioe' quasi tutti.** Qui c'e' il rischio piu'
grosso del progetto. Nei primi dieci schermi **non c'e' scritto chi sono, cosa fanno e
quanto costano**: c'e' solo una scena 3D. Chi si ferma prima della schermata 10 esce con
un'impressione ("sanno fare cose difficili") e **zero informazioni**. Non c'e' una CTA
sopra la piega, non c'e' un sommario, non c'e' un elenco di servizi.

Il paracadute e' uno solo, e sta in alto a destra fisso: il pulsante **`Let's work
together`** nell'intestazione. E' l'unica cosa che tiene insieme la pagina per chi non
scorre. Il resto della scommessa e' che la scena 3D sia abbastanza buona da far scorrere.

Sospetto (non verificato) che sia anche il motivo dei **7.41 di usability** contro i 7.93
di design nella scheda Awwwards: lo squilibrio e' esattamente quello.

## Idea regista

**Non dirgli che sai fare siti 3D: fagli scorrere dieci schermi dentro uno, e solo dopo
presentati.**

## Il momento

Cade **intorno alla schermata 18**, ed e' un momento freddo, non spettacolare: passi il
mouse sulla riga di un premio nella tabella e **una miniatura del progetto compare
attaccata al cursore**. `.slide-wrapper`: 160x170px, `opacity:0`, `transform:scale(.8)` a
riposo, `pointer-events:none`. La fascia sensibile e' alta `360vh` e comincia a `1800vh`:
gli hanno dedicato **3,6 schermate di pagina**.

E' il momento che si ricorda perche' e' l'unica volta in cui il sito **risponde a te** invece
di srotolarsi. Tutto il resto e' guidato dallo scroll, cioe' e' un film; qui per due secondi
diventa uno strumento.

Il "wow" tecnico (la O che si compone) e' invece l'apertura — e vale come biglietto da
visita, non come momento: chi entra non ha ancora nessun motivo per essere colpito.

## Struttura, sezione per sezione

Altezze **misurate nel CSS**, non stimate. `.home-page{min-height:2090vh}` = la pagina e'
alta **20,9 schermi**; lo scroll utile e' ~19,9 schermate.

| sezione | cosa mostra | cosa fa l'utente | durata (schermate) |
|---|---|---|---|
| Preloader | fondo `#dee7f1`, logo SVG animato a sprite (`steps(2)`, 3s in ciclo) | aspetta | — |
| Scena WebGL (`#main-scene`) | 3D a schermo pieno, casi studio che scorrono dentro (`.cases-texts`, 28vh a testa). **Nessun HTML** | scorre; indicatore `Scroll` con freccia che rimbalza | **0 → 10,2** (`padding-top:1020vh`) |
| `.home-info-block` | manifesto + `Services` (10 voci) + `Clients` (19 nomi, a nastro scorrevole) | legge | 10,2 → ~14 |
| testimonianze | 3 citazioni con nome, ruolo, azienda | legge | dentro il blocco sopra |
| `.home-awards-list` | 7 tabelle premi (`Project / Nomination / Year`), 53 righe + `+ 50 more awards` | **passa il mouse** → miniatura al cursore | ~14 → 18 (`padding-top:380vh`) |
| `.awards-hover` | fascia sensibile dell'effetto sopra | hover | `top:1800vh`, `height:360vh` → 18 → 21,6 |
| `.home-news` | `Our Insights` + `View All` | clicca o passa | ~19 |
| `.home-contact-form` | modulo con selettore di budget | **compila** | ~20 |
| `.home-footer` | menu, social, email, `Let's grab some coffee.` | clicca | ~21 |

Dettaglio da rubare: **la pagina si allunga quando lo schermo si accorcia.**

```css
.home-page                        { min-height: 2090vh }
@media (max-height:900px) .home-page { min-height: 2310vh }
@media (max-height:820px) .home-page { min-height: 2280vh }
@media (max-height:680px) .home-page { min-height: 2330vh }
@media (max-height:620px) .home-page { min-height: 2345vh }
```

Perche': la coreografia ha un numero fisso di "battute", e `vh` scala con l'altezza dello
schermo. Su un portatile basso ogni `vh` vale meno pixel, quindi servono piu' `vh` per dare
alla scena **lo stesso numero di pixel di scroll**. Cosi' il ritmo resta identico su un
monitor 27" e su un MacBook Air. E' calibrato a mano, a scaglioni: non e' una formula.

## Il modulo di contatto, per intero

Quattro domande in una schermata, sotto il titolo in maiuscolo:

> **BUT WE'RE HERE NOT TO TALK ABOUT OURSELVES - WE'RE HERE TO TALK ABOUT YOU, YOUR COMPANY,
> YOUR PRODUCT, AND YOUR GOALS.**
> With us it happens. We would love to hear from you.

| campo | tipo | testo segnaposto / valore |
|---|---|---|
| nome | `input[type=text]` | `Your name` |
| email | `input[type=email]` | `Your email` |
| progetto | `input[type=text]` | `Your project is about` |
| budget | 3 `input[type=radio]` | `Project budget (USD)` → `50K–100K` · `100K–300K` · `300K+` |
| invio | `button.its-mac.submit` | `Send` |

Note:
- Il campo progetto e' un **`input`, non una `textarea`**: chiede una riga, non un briefing.
  Abbassa l'attrito, e per un contatto da 50K+ va benissimo — il briefing si fa in chiamata.
- **Nessun campo obbligatorio per azienda, telefono, tempi, come ci hai trovato.** Quattro
  domande in tutto.
- Il budget e' a **pulsanti radio, non a menu a tendina**: i tre importi sono **tutti
  visibili contemporaneamente**. E' li' che il prezzo viene comunicato.
- Validazione con **vee-validate**. Stato di conferma: `Thank you`.
- Il modulo e' **ripetuto identico** in fondo a home, `/our-story` e nella pagina dedicata
  `/connect`. Una sola CTA in tutto il sito, ovunque.

## L'esperienza in ordine di tempo

**Primi dieci secondi** (ricostruiti da CSS e sorgente; i tempi esatti dello script GSAP
sono nel bundle minificato e non li ho decompilati — vedi *Non verificato*):

- **0,0 s** — schermo pieno `#dee7f1`. Al centro il logo Noomo, un SVG che si anima a
  scatti: `animation: preloaderSeq 3s steps(2) infinite`, salti da `translateY(-77px)` a
  `-154px`. Non e' una barra di caricamento con percentuale, e' un marchio che pulsa.
- **~1-3 s** — si caricano i modelli. Sono piccoli: `O.glb` 33 KB, `4.glb` 2,8 KB. Il costo
  vero e' il bundle: **840 KB di JS** (253 KB compressi) con Three.js dentro.
- **fine caricamento** — il preloader ha `clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
  cioe' un rettangolo pieno pronto a essere richiuso: **esce con una tendina ritagliata**,
  non in dissolvenza.
- **subito dopo** — `#main-scene` passa da `opacity:0` a visibile. L'intestazione entra:
  `header .logo` ha `@keyframes showLogo{0%{opacity:0} to{opacity:1}}`.
- **~4 s** — in basso al centro compare `.bottom-fix .scroll-down`: la parola **`Scroll`** in
  NeueRoman 12px maiuscolo, e sotto `arrowpixel.svg` con
  `animation: scrollMove 1s infinite alternate`. In basso a sinistra la riga di copyright.
- **da qui in poi il tempo non scorre piu' da solo: scorre lo scroll.** Se non tocchi la
  rotella, la scena resta ferma sul primo fotogramma. E' la scelta piu' rischiosa del sito
  ed e' deliberata: la freccia che rimbalza e' l'unica cosa che si muove.

**Poi, a blocchi:**

- **0 → 10 schermate** — la scena. I casi passano uno dopo l'altro, ogni titolo in una
  fascia da `28vh`. Il fondo resta chiaro. Fra un caso e l'altro non ci sono stacchi netti:
  `ease:"sine.inOut"` (l'attenuazione piu' usata nel bundle, 6 occorrenze) impasta tutto.
- **10 schermate** — primo testo vero. Cambio di registro totale: dalla scena 3D a un blocco
  di testo statico. Poi il nastro dei clienti, che si ripete due volte (`Vogue Business,
  Samsung, Cadence...` compare due volte nel sorgente: e' un ticker continuo).
- **~13 schermate** — testimonianze.
- **14 → 18 schermate** — il muro dei premi. Sette tabelle, ordinate per ente. E' il blocco
  piu' lungo del sito dopo la scena, e non e' un caso.
- **18 → 21,6** — la fascia con l'anteprima al cursore.
- **~20** — modulo. **~21** — piede.

## Animazioni

| elemento | cosa si muove | legato a | curva / inerzia | note |
|---|---|---|---|---|
| scena 3D `#main-scene` | camera + geometrie | **scroll**, per ~1020vh | `sine.inOut` prevalente | `position:fixed; z-index:0`, **fuori da `#smooth-content`**: non scorre, viene guidata |
| tutto il corpo pagina | scorrimento con inerzia | scroll | GSAP **ScrollSmoother** | `#smooth-wrapper` / `#smooth-content` |
| miniatura premio | opacita' 0→1, `scale(.8)`→1, segue il cursore | **hover** su riga | `.3s ease-in-out` | `pointer-events:none` |
| riga premio | stato al passaggio | hover | `transition:.3s ease-in-out` | |
| logo preloader | sprite verticale a scatti | **tempo** | `steps(2)`, 3s in ciclo | non e' un caricamento reale |
| tendina `#transition` | `clip-path` sale dal basso | **cambio pagina** | — | `polygon(0 100%,100% 100%,100% 100%,0 100%)` → si apre in su, `#dee7f1`, `z-index:900` |
| logo nella tendina | sprite orizzontale | tempo | `steps(4)`, 3s, ritardo `.4s` | `tLogoMove`, `translate(calc(-100% - 4px))` |
| testo nella tendina | `.transition-text` | cambio pagina | — | NeueMachina 40px maiuscolo |
| intestazione | fondo di vetro che appare | scroll | `.5s ease-in-out` | `rgba(202,214,236,.5)` + `backdrop-filter: blur(15px)` |
| freccia `Scroll` | su e giu' | **tempo** | `1s infinite alternate` | unica animazione a tempo sopra la piega |
| sottolineature link | due barre che entrano/escono | hover | — | `hoverLine` `translate(-100%)`→`0`, `hoverLine2` `0`→`100%` |
| logo intestazione | scambio di due immagini | hover | opacita' | `.for-logo:hover .logo:first-child{opacity:0}` |
| nastro clienti | scorrimento continuo | tempo | — | Swiper |

Librerie riconosciute: **GSAP** (ScrollTrigger, ScrollSmoother, ScrollToPlugin, CustomEase),
**Three.js**, **Swiper**.

## Colori

Dal CSS, **VERIFICATO**. Il sito e' **chiaro**, non scuro: `#181520` compare 21 volte come
`color` e solo 4 come `background`.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo pagina | `#c9d2e7` | `body{background-color:#c9d2e7}` — azzurro-grigio pallido |
| testo principale | `#181520` | quasi nero con virata viola; 21 usi come `color` |
| testo/superficie scura | `#231b35` | testo secondario, 4 usi come fondo di blocchi scuri |
| fondo preloader e transizione | `#dee7f1` | l'unico colore dichiarato su Awwwards nel 2023 |
| azzurri chiari | `#dbe0ef`, `#dae2f2` | superfici, bordi |
| grigi | `#a5a5ae`, `#7e7f8f`, `#6d6d76`, `#c3c4d2` | testo attenuato, righe delle tabelle |
| vetro intestazione | `rgba(202,214,236,.5)` + `blur(15px)` | barra in alto dopo lo scroll |
| ombre | `rgba(0,0,0,.5)` (5 usi), `.25`, `.15`, `.1` | |

Palette da **cinque colori in croce**, tutti nella stessa famiglia azzurro-lilla, piu' un
quasi-nero. Nessun accento caldo, nessun colore di richiamo sulla CTA. Il colore lo mette la
scena 3D, non il CSS.

`#007aff` compare una volta sola come `--swiper-theme-color`: e' il valore di fabbrica di
Swiper, **non un colore del marchio**. Non copiarlo.

## Tipografia

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| titolo grande | **NeueMachina** | 400 | **80px** | `100%` | `text-transform:uppercase`, `max-width:500px`, `padding:240px 20px 0` |
| titolo ridotto | NeueMachina | 400 | 62px | `100%` | stessa regola, respiro dimezzato (`padding-top:120px`) |
| titolo tendina | NeueMachina | — | 42px / 40px | — | maiuscolo, centrato |
| etichette | NeueMachina | 400 | 16px | `100%` | maiuscolo, allineato a destra |
| testo corrente | **NeueRoman** (Neue Haas Display Roman) | — | 16px base | — | 19 usi |
| micro-testo | NeueRoman | 450 | 12px | `1` | maiuscolo, `letter-spacing:.02em` — `Scroll`, copyright |
| riga premio | — | — | 18px (mobile) | — | tabelle |

**Come sono serviti**: **in locale**, da `/_nuxt/`, con `font-display:swap`. Due file:

- `NeueMachina-Regular.e896c98c.otf` — 59 KB grezzo, 40 KB compresso
- `NeueHaasDisplayRoman.d8850e5c.ttf` — 100 KB grezzo, 36 KB compresso

Due cose da notare, ed e' materiale da rubare al contrario:

1. **`.otf` e `.ttf`, non `.woff2`.** Convertiti in WOFF2 quei due file starebbero
   intorno ai 30-40 KB totali invece di 160 KB grezzi. E' una svista, non una scelta.
2. **`NeueRoman` e `NeueLight` sono `@font-face` diversi che puntano allo stesso file.**
   Chiamare `font-family:NeueLight` non da' un peso piu' leggero: da' lo stesso Roman.
   Sono tre nomi per due file, e uno dei tre non fa niente.

Nessun font variabile, nessun servizio esterno, zero richieste a Google Fonts o Adobe.

## Testi veri

**Meta**
- `Digital Storytelling & 3D Website Design Agency | Noomo`
- `We create 3D storytelling websites and immersive digital experiences that make people stop scrolling. Los Angeles creative agency where story dictates the medium—whether that's WebGL, cinematic video, or interactive design.`
- `/work`: `Noomo Agency | Immersive | Interactive | Bespoke`
- `/our-story`: `Noomo Agency | Digital creative agency`

**Menu**: `Work` · `Our Story` · `Labs` · `Insights` · `Connect` — CTA fissa `Let's work together`

**Manifesto (home, ~schermata 10)**
> At Noomo, we create 3D storytelling websites and immersive digital experiences where craft and narrative become one.

> From immersive 3D websites to cinematic brand videos, we let the story dictate the medium—whether that's real-time rendering, editorial design, or interactive experiences.

> We partner with brands like Salesforce, AMD, Red Bull and Vogue Business who believe craft makes the difference.

> Companies that value innovation, obsess over details, and understand great digital work requires time, trust, and true collaboration.

**Servizi** (10, testuali)
`3D websites` · `Storytelling websites` · `3D storytelling videos` · `Immersive web experiences` · `WebGL development` · `Brand activation microsites` · `Digital event experiences` · `Interactive website design` · `AI-driven experiences` · `Digital branding`

**Clienti** (nastro, 19 nomi)
`Salesforce` · `AMD` · `Coinbase` · `Red Bull` · `Intel | ai.io` · `Samsung` · `Vogue Business` · `Cadence Design Systems` · `Space Needle` · `Yolo Federal Credit Union` · `Percipio Health` · `Dandy Vision` · `Vibrant Wellness` · `OneLine Health` · `Middle Finance` · `The Art of Living` · `Life House` · `Battalion` — e in mezzo, come separatore, l'emoticon **`♥‿♥`**

**Squadra**
> Great work can't happen without team a.

> When working with us, you get the value of working with founders. Building strong relationships with our clients is at the heart of our approach.

**Premi**
> Recognition for innovative work that pushes what's possible in digital design.

Intestazioni di tabella: `Project` · `Nomination` · `Year`. Contatori per ente: `FWA / 12`,
`The Webby Awards / 08`, `Red Dot Design Award / 01`, `San Francisco Design Week / 01`,
`Awwwards / 23`, `CSS Design Award / 07`, `ADC Europe / 01`. Chiusura: `+ 50 more awards`.

**Chiamata all'azione**
> BUT WE'RE HERE NOT TO TALK ABOUT OURSELVES - WE'RE HERE TO TALK ABOUT YOU, YOUR COMPANY, YOUR PRODUCT, AND YOUR GOALS.

> With us it happens. / We would love to hear from you.

`Project budget (USD)` — `50K–100K` `100K–300K` `300K+` — `Send` — `Thank you`

**Piede**
`Menu.` `Work` `Our story` `Insights` `Connect` `Privacy policy` — `Social.` `LinkedIn`
`Instagram` `Dribbble` `X` — `Email.` `hello@noomoagency.com`
> Let's grab some coffee.
> We are based in Los Angeles but often come to San Francisco ☕

**Da `/our-story`**
> Creating an impact requires a team with sharp minds and strategic thinking.

> Noomo is a boutique, award-winning digital design agency specializing in creating interactive digital experiences, storytelling websites, applications, and immersive experiences.

> We are a woman owned design agency. Noomo Agency was founded by a Ukrainian family based in Los Angeles.

> "Storytelling is how we connect as humans. It's how we share experiences, emotions, and values. In the digital world, storytelling isn't just about words. It's about creating multi-dimensional experiences combining visuals, animations, 3D, and interactivity. It's about bringing the audience into the story so they feel like a part of it." — Olha Uzhykova, Co-founder, Design Director.

Titoli di sezione: `Technology shaped by empathy, powered by design` · `Storytelling that
cuts through the noise` · `Design that drives real engagement` · `Built together, built to
last`

**Da `/connect`**
> Let's TALK ABOUT YOU, YOUR COMPANY, YOUR PRODUCT, AND YOUR GOALS. / WITH US IT HAPPENS. / WE WOULD LOVE TO HEAR FROM YOU.

## Mobile

**La sezione piu' importante di questa scheda: sul telefono e' letteralmente un altro sito.**

Il punto di rottura e' **1024px** (quindi anche gli iPad in verticale prendono la versione
ridotta).

**Cosa SPARISCE**

```css
@media (max-width:1024px){
  .home-page         { height:auto; min-height:auto; overflow:hidden }
  .home-page-wrapper { height:auto; overflow:auto; position:relative }
  .index-page        { height:100vh; overflow:hidden }
}
```

Con `min-height:auto` **l'intera coreografia da 2090vh viene cancellata**. Non accorciata:
cancellata. Non esiste piu' la pista di scroll su cui e' costruita la scena, e
`.home-page-wrapper` torna `position:relative` — cioe' **ScrollSmoother viene staccato** e si
scorre normale.

Spariscono anche:
- `.bottom-fix .scroll-down` → `display:none` — via l'indicatore `Scroll` e la freccia
- `.bottom-fix .copy` → `display:none` — via il copyright
- `.home-awards-list .slide-wrapper` → `display:none` — **via l'anteprima al cursore**, cioe'
  il momento migliore del sito. Coerente: non c'e' un cursore da seguire
- `.home-info-block .bottom .hide-m` → un pezzo del blocco informativo
- sotto **767px**: la colonna `Year` e la numerazione (`.s-n`, `.s-no`) escono dalle tabelle
  premi, che diventano due colonne invece di quattro
- `.cases-texts .tags .year` e i ritorni a capo nei tag

**Cosa viene SOSTITUITO**

Il pezzo forte, ed e' il trucco che vale la lettura:

```css
.custom-l-back-image { display:none; position:fixed; inset:0 auto auto 0;
                       width:100%; height:100vh; z-index:-1 }
@media (max-width:1024px){ .custom-l-back-image { display:block } }
```

Sotto i 1024px **entra un PNG statico a schermo pieno** (`/backgrounds/background_min.png`,
**174 KB**) al posto della scena. E' un fotogramma della scena 3D congelato in immagine.
Non e' un video, non e' una sequenza: **una foto**.

`#main-scene` non viene messo a `display:none` (resta `width/height:100%`), quindi il canvas
tecnicamente sopravvive — ma senza i 2090vh di pista non ha piu' niente che lo guidi. Non ho
potuto verificare da fuori se il renderer parta comunque o venga spento via JS (`isMobile`
compare 2 volte nel bundle): vedi *Non verificato*.

Anche l'intestazione cambia: `.right` va a `display:none`, resta il menu a panino
(`.burger` → `.mobile-menu` → `.mobile-links`), e le altezze scendono `96px → 80px → 60px`
con il margine laterale da `40px` a `20px`.

**Cosa RESTA**: tutto il Tempo 2. Manifesto, servizi, clienti, testimonianze, muro dei premi
(ridotto a due colonne), Insights, modulo con gli scaglioni di budget, piede.

**Come leggerla.** Su telefono il sito perde esattamente la cosa per cui ha vinto il premio,
e diventa un sito d'agenzia normale e corretto. Non e' pigrizia: e' la scelta di **non
provarci**. Meglio un PNG da 174 KB che una scena WebGL a 15fps che scalda il telefono. Da
notare pero' che il costo non e' evitato del tutto — **il bundle da 253 KB con Three.js
dentro viene scaricato lo stesso**, perche' e' `entry.js`, non un pezzo caricato a parte.

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| framework | **Nuxt 3** (Vue 3), reso lato server | VERIFICATO | `/_nuxt/entry.*.js`, attributi `data-v-*`, `__NUXT_DATA__` (15,9 KB), HTML gia' pieno |
| 3D | **Three.js** ≥ r155 | VERIFICATO | 193 occorrenze di `THREE.`, `WebGLRenderer`, `PerspectiveCamera`, 16 `ShaderMaterial` in `entry.js`; dentro c'e' il link `discourse.threejs.org/t/updates-to-lighting-in-three-js-r155` |
| modelli 3D | glTF binario | VERIFICATO | `/newModels/O.glb` (33 KB), `/newModels/4.glb` (2,8 KB) |
| animazione | **GSAP** + CustomEase | VERIFICATO | `ScrollTrigger.039d4140.js`, `ScrollToPlugin.e2ef7d76.js`, `custom.b917e3ab.js`; nel bundle `gsap.com/standard-license` (licenza commerciale) |
| scroll | **GSAP ScrollSmoother** | VERIFICATO | `/_nuxt/ScrollSmoother.1af0903c.js` + `#smooth-wrapper`/`#smooth-content` nel DOM |
| attenuazioni | `sine.inOut` (6), `power2.out`, `none` | VERIFICATO | stringhe nel bundle |
| caroselli | **Swiper** (swiper-vue) | VERIFICATO | `swiper-vue.41e8332a.js` (155 KB grezzi), `--swiper-theme-color` |
| moduli | **vee-validate** | VERIFICATO | `vee-validate.esm.58fb5311.js` |
| immagini | **@nuxt/image** (`<nuxt-img>`) | VERIFICATO | `nuxt-img.c75521af.js` |
| CMS | **Prismic** | VERIFICATO | `static.cdn.prismic.io/prismic.min.js?repo=...` nel bundle |
| analitica | **Google Tag Manager** / gtag | VERIFICATO | `googletagmanager.com/gtm.js`, regex `^GTM-[0-9A-Z]+$` |
| hosting | **Vercel** (edge `fra1`) | VERIFICATO | header `Server: Vercel`, `X-Vercel-Cache: HIT`, `X-Vercel-Id: fra1::...` |
| font | Neue Machina + Neue Haas Display, in locale | VERIFICATO | `@font-face` con `src:url(/_nuxt/...)` |
| Lenis / Locomotive | **non usati** | VERIFICATO | nessuna occorrenza; lo scroll e' tutto GSAP |
| CSS | scritto a mano, non a utility | SUPPOSTO | selettori semantici annidati (`.home-awards-list .wrapper .items-list .item`), niente Tailwind sul dominio principale |

**Nota:** il satellite `showcase.noomoagency.com` usa uno stack **diverso e piu' recente** —
vedi sotto.

## Peso e prestazioni

Numeri veri, misurati con `curl` il 13/08/2026 (dimensioni compresse e grezze):

| risorsa | compressa | grezza |
|---|---|---|
| HTML della home | — | **106 KB** |
| `entry.1995ac01.js` (Nuxt + Three.js + GSAP) | **253 KB** | **840 KB** |
| `swiper-vue.41e8332a.js` | 55 KB | 155 KB |
| `ScrollTrigger.039d4140.js` | 19 KB | 44 KB |
| `ScrollSmoother.1af0903c.js` | 5,8 KB | 13 KB |
| `entry.ef5ab1c2.css` | 1,6 KB | 5,4 KB |
| CSS in linea nell'HTML | — | **47 KB** |
| `NeueHaasDisplayRoman.ttf` | 36 KB | 100 KB |
| `NeueMachina-Regular.otf` | 40 KB | 59 KB |
| `O.glb` + `4.glb` | — | 36 KB |
| `background_min.png` (solo ≤1024px) | — | **174 KB** |

**Base di partenza ~410 KB compressi** solo per JS + font, prima di qualunque texture o
immagine della scena. Non ho misurato il totale a pagina caricata: la scena tira le sue
risorse via JS e da fuori non le ho enumerate.

Osservazioni:
- `Cache-Control: public, max-age=0, must-revalidate` sull'HTML, con `X-Vercel-Cache: HIT`:
  documento sempre rivalidato, risorse `/_nuxt/` con impronta nel nome quindi
  memorizzabili per sempre.
- **47 KB di CSS in linea nell'HTML.** Sono quasi tutti gli stili del sito messi dentro il
  documento invece che in un foglio esterno: zero richieste bloccanti, ma 47 KB
  non memorizzabili ricaricati a ogni pagina.
- I font in OTF/TTF costano ~65 KB compressi evitabili (vedi *Tipografia*).
- Punteggi Awwwards, che sono giudizi umani e non misure: **WPO 7.20**, **responsive 7.20**,
  **accessibility 7.20** — i tre piu' bassi della scheda, e sono esattamente i tre che
  paghi quando costruisci una pagina da 2090vh guidata da WebGL.

## I quattro satelliti

Noomo non ha un sito: ha una **costellazione**. Tutti si linkano fra loro
nell'intestazione (`Agency` · `Labs` · `Storytelling`).

| sottodominio | titolo | cosa e' | note tecniche |
|---|---|---|---|
| `noomoagency.com` | `Digital Storytelling & 3D Website Design Agency` | il sito commerciale | Nuxt 3 + Three.js WebGL |
| `showcase.` | `Noomo Showcase — Immersive 3D & WebGL Work` | vetrina dei lavori recenti | **Three.js WebGPURenderer + TSL**, Tailwind, `1700vh` |
| `labs.` | `Noomo Labs` | il laboratorio: `AR`, `3D`, `AI`, `XR` | ha vinto 2 Webby 2025 |
| `storytelling.` | `Noomo \| The power of digital Storytelling` | saggio interattivo sullo storytelling, con dentro i lavori veri | `Tap to explore` / `Scroll to explore` |

**`showcase.noomoagency.com` merita una riga a parte** perche' e' dove sta la tecnica del
2026, non del 2023:

- **Server: nessun contenuto.** L'HTML scaricato e' **8,3 KB** e contiene solo intestazione,
  piede e `0%`. Tutto il resto e' costruito dal browser. **E' una applicazione a pagina
  singola e da fuori si legge solo il guscio**: non ho potuto leggerne i testi, le sezioni
  ne' i colori.
- **`.home-page { height: 1700vh }`** — 17 schermate, dichiarate direttamente
  nell'HTML in uno `<style>` in linea.
- **WebGPU, non WebGL**: nel bundle, 38 `WebGPURenderer`, 23 `WebGPU`, **55 `TSL`** (Three
  Shading Language, gli shader scritti in JavaScript invece che in GLSL). `WebGLRenderer`
  compare 3 volte, cioe' come ripiego. Coerente col tag che Noomo si mette da sola su
  `/work`: `Noomo Showcase — 3D, WebGPU, Three.js, Immersive`.
- **1,48 MB di JS** in un file solo (`BeQtrGYw.js`), non compresso.
- CSS a **Tailwind** (`text-gt-14`, `bg-brand-white-300`, `text-blue-400`, `xs:hidden
  md:flex`), quindi impostazione diversa dal dominio principale.
- Preloader numerico: `0%`.

## Tre cose da rubare

**1. La pagina che si allunga quando lo schermo si accorcia.**
Non e' `min-height:100vh` moltiplicato: sono cinque scaglioni calibrati a mano su
`@media (max-height:...)`, `2090vh → 2310 → 2280 → 2330 → 2345vh`. Il problema che risolve e'
reale e quasi sempre ignorato: **una coreografia legata allo scroll misurata in `vh` va piu'
veloce sugli schermi bassi**, perche' ogni `vh` vale meno pixel. Loro compensano allungando
la pista, cosi' il numero di **pixel** di scroll per battuta resta costante. Rifacibile in
dieci minuti su qualunque progetto con ScrollTrigger, e si sente subito su portatile.

**2. Il canvas fuori dal contenitore che scorre.**
`#main-scene` sta **dentro `#smooth-wrapper` ma fuori da `#smooth-content`**, con
`position:fixed; z-index:0`. Cosi' la scena 3D **non viene mai traslata** da ScrollSmoother:
resta inchiodata al viewport e riceve solo il valore di avanzamento. Se invece la metti
dentro il contenuto scorrevole, il browser deve comporre un canvas che si muove e la scena
sfarfalla o va a scatti. E' una riga di markup che decide se l'effetto regge a 60fps.

**3. Il prezzo comunicato dal modulo, non dal listino.**
Tre pulsanti radio — `50K–100K`, `100K–300K`, `300K+` — **tutti visibili insieme**, non in un
menu a tendina. In tre parole ottieni quello che una pagina prezzi non ti da':
il cliente si autoseleziona senza che tu abbia scritto una tariffa, chi non e' in target se
ne va da solo, e chi resta ti ha gia' detto quanto vale il progetto **prima** della prima
chiamata. Da copiare pari pari, cambiando gli importi. Nota il contorno: il campo del
progetto e' un `input` di una riga, non una `textarea` — chiedono poco perche' il filtro lo
fa il budget, non il briefing.

**Bonus, da rubare al contrario:** il PNG statico da 174 KB come sostituto della scena 3D
sotto i 1024px. Non e' una resa: e' la decisione di **non provarci** sul telefono. Ma falla
meglio di loro — carica anche il bundle 3D solo quando serve, invece di spedire 253 KB di
Three.js a un telefono che vedra' una foto.

## Non verificato

- **La versione 2023, quella effettivamente premiata.** Non ho potuto recuperarla:
  l'archivio (Wayback Machine) non l'ho interrogato e la regola di questa sessione mi vieta
  il browser condiviso. Della versione premiata so, dalla scheda Awwwards, solo il colore
  (`#DEE7F1`), la descrizione e i punteggi. **Tutte le misure di questa scheda sono della
  versione di oggi.**
- **Il premio esatto.** La scheda Awwwards mostra **Site of the Day 21/09/2023** +
  **Developer Award**. La riga "Site of the Year" viene dalla tabella premi di Noomo, che la
  data **2024** (`Noomo Agency - Website of the year, 2024`). Le due cose sono compatibili
  (l'annuale del 2023 si vota a inizio 2024) ma **non l'ho confermata su una pagina
  ufficiale Awwwards**: il budget di ricerca web della sessione era esaurito.
- **I tempi esatti delle animazioni.** Durate, ritardi e punti di aggancio degli
  `ScrollTrigger` sono dentro `entry.js` minificato (840 KB). Ho estratto le attenuazioni
  (`sine.inOut`, `power2.out`, `none`, `CustomEase`) ma **non ho decompilato la sequenza**.
  I 10 secondi iniziali sono ricostruiti da CSS e sorgente, non cronometrati.
- **Cosa succede davvero dentro la scena 3D.** So che ci sono `O.glb` e `4.glb`, 16
  `ShaderMaterial` e una `PerspectiveCamera`. **Non ho visto la scena**: nessuno screenshot,
  nessun rendering. La descrizione visiva della scena in questa scheda e' dedotta dai file,
  non osservata.
- **Se il renderer WebGL parta comunque sotto i 1024px.** `#main-scene` non e' messo a
  `display:none` e `isMobile` compare 2 volte nel bundle, ma non ho potuto eseguire il JS.
- **I testi, i colori e le sezioni di `showcase.noomoagency.com`.** E' un'applicazione a
  pagina singola: l'HTML servito e' un guscio da 8,3 KB. So l'altezza (`1700vh`) e lo stack
  (WebGPU + TSL + Tailwind), **non so cosa mostri**.
- **`labs.` e `storytelling.`**: ho letto solo titolo, descrizione e testo servito dal
  server. Non li ho analizzati.
- **Peso totale a pagina caricata** e numero di richieste: la scena carica texture e risorse
  via JS che non ho enumerato. I numeri della tabella sono **solo le risorse dichiarate
  nell'HTML**.
- **Tempi reali** (LCP, TTI, FPS della scena) e punteggi Lighthouse: nessuno. Avrei dovuto
  aprire un browser.
- **Dove finisce il modulo.** Ho i campi e la validazione (vee-validate), non l'endpoint:
  l'invio e' gestito da JS nel bundle.
- Se il **CSS sia scritto a mano**: dedotto dai selettori annidati semantici, non
  confermato (a differenza di `showcase.`, che e' chiaramente Tailwind).
