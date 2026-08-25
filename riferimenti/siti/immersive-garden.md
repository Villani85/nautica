# Immersive Garden

- **URL**: https://immersive-g.com — raggiungibile, HTTP 200 (verificato con `curl` e con browser, 13/08/2026). Nessuna sostituzione necessaria.
- **Premio**: Awwwards **Site of the Day** del 07/01/2025, voto 8/10 (Design 8.09 / Usability 7.51 / Creativity 8.40 / Content 8.34; Developer Award 7.5, con Animations/Transitions 8.8 e Accessibility 6.6) — fonte https://www.awwwards.com/sites/immersive-garden-website . Lo studio è inoltre **Awwwards Agency of the Year 2025** e ha vinto Studio Site of the Year e Site of the Month (novembre, con Orano) — fonti https://www.awwwards.com/immersivegarden/awards e https://www.awwwards.com/orano-from-immersive-garden-wins-site-of-the-month-novemeber.html
- **Studio**: Immersive Garden (sito proprio dello studio). 14 avenue Claude Vellefaux, Paris 75010.
- **Anno**: versione online misurata nell'agosto 2026; il premio SOTD è di gennaio 2025. Progetti in home fino a "Cartier Watches and Wonders 24", quindi il contenuto è aggiornato al 2024/2025.
- **Letto il**: 13/08/2026

---

## L'ESPERIENZA (integrazione)

*Blocco aggiunto il 13/08/2026 rileggendo il sito con `curl`: HTML della home
(che è renderizzato dal server, quindi i testi sono leggibili per intero) e le
sotto-pagine `/the-studio/`, `/the-studio/services/` e `/the-studio/contact-us/`,
che nella scheda mancavano. Integra — non sostituisce — le sezioni sotto.*

### Di cosa tratta il sito

Di **diciotto lavori, messi in fila uno dopo l'altro, dentro un muro di
intonaco**. Non c'è altro: nessuna pagina "chi siamo" in home, nessun elenco di
servizi, nessun processo, nessun numero. Solo un titolo, due frasi di
posizionamento (`Our approach`, `Our mission`), diciotto progetti con una riga di
descrizione ciascuno, e un'email in fondo. La sostanza del sito è **l'elenco dei
committenti**: Louis Vuitton, Cartier (tre volte), Dior, Omega, Longines,
Girard-Perregaux, Orano, Masar.

### Cosa vende, e qual è l'obiettivo finale

Vende **siti-evento su misura per case di lusso e grandi marchi**: la lista dei
servizi (che sta però in una sotto-pagina, non in home) va da
`Innovative Concepts`, `UX Design`, `Art Direction`, `Motion Design`,
`Animation 3D` fino a `Phygital Installations`, `AR/VR Experiences` e
`Campaign Advertising (SEO/SEA)`.

**Obiettivo dichiarato**: mostrare il lavoro.
**Obiettivo vero**: **far scrivere una email a `inquiries@immersive-g.com`**. Non
c'è un modulo di contatto in tutto il sito. Il footer della home è un giardino
notturno in 3D con l'indirizzo email al centro e un pulsante
`Copy to clipboard`; la pagina di contatto vera dice soltanto:

> `Interaction begins with dialogue.`
> `inquiries@immersive-g.com`
> `jobs@immersive-g.com`
> `14 rue Claude Vellefaux — 75010 Paris, France`

**Due indirizzi, quindi due obiettivi dichiarati**: nuovi incarichi e
**assunzioni**. Il secondo non è secondario per uno studio di questo tipo: il
sito è anche un annuncio di lavoro rivolto agli sviluppatori creativi che sanno
riconoscere quanto sia difficile ciò che vedono.

**Il prezzo non compare mai**, e non per dimenticanza: il posizionamento di
prezzo è affidato interamente ai **nomi dei clienti** e a un solo numero, che
sta però sulla pagina `/projects/`:

> `Since 2013 we have produced more than 67 projects.`

### A chi

Al **direttore marketing o brand director di una maison** (o al loro direttore
creativo di agenzia) che ha un budget a sei cifre per un sito-evento legato a un
lancio, e che deve tornare dal suo comitato con un fornitore difendibile. Sa già
cosa vuole; teme due cose: che il risultato sia "il solito sito" e che il
fornitore non regga il nome del marchio. Deve uscire pensando due cose in
sequenza: *questo effetto non l'ho mai visto* e *se l'hanno fatto per Louis
Vuitton e Cartier, lo possono fare per noi.*

Secondo pubblico, servito con la stessa pagina: gli sviluppatori creativi
(`jobs@immersive-g.com`).

### L'esperienza progettata, passo per passo

È **una visita a una galleria**, con un prezzo d'ingresso pagato in attesa.

1. **L'attesa, e va detta per prima.** Fondo `#E8E8E8`, il monogramma IG che si
   scopre da una maschera, una riga di progresso da 1 px, e le quattro parole
   `Innovative / digital / experiences / studio` che entrano una alla volta. A
   destra, `Scroll down`. **Lo scroll è bloccato** (`introLoader.lockScroll`).
   Dura **10–20 secondi su desktop e 35–40 sul telefono** (misurati).
2. **Il muro.** Il loader si ritira e sotto c'è una parete di intonaco. L'H1
   compare con le lettere che si ispessiscono da tre centri diversi.
3. **Il gesto.** Si muove il mouse e **l'intonaco fiorisce**: rami, foglie, fiori,
   un uccello escono in rilievo dalla parete e ricadono qualche secondo dopo. È
   la prima cosa che succede, prima di qualunque scroll, e non richiede di aver
   capito niente. Sotto il titolo appare `Click to enable sound`.
4. **La sfilata.** Si scorre — con un'inerzia lunghissima (Lenis `lerp: 0.05`) —
   e i diciotto progetti passano come finestre ritagliate nella parete. Ognuno ha
   una riga di descrizione, il nome e l'etichetta del tipo
   (`Web Experience`, `E-Shop`, `Corporate`). Passando sopra un media, il piano
   si rimpicciolisce del 3% e si scurisce.
5. **La modalità veloce.** Se si scorre forte, il sito **cambia stato**: la
   camera si avvicina, i titoli raddoppiano, i piani si allungano, la nav
   sparisce. Non combatte chi ha fretta: lo asseconda.
6. **La notte.** Superato l'ultimo progetto il bianco lascia il posto al nero e
   compare un giardino notturno fotorealistico che si muove al vento, con
   l'email al centro. Il muro diventa pianta viva.

**Cosa deve fare il visitatore**: muovere il mouse (scopre il rilievo) → scorrere
per ~38 schermate → cliccare un progetto oppure `See all projects` → arrivare in
fondo e copiare l'email. **Sono molti gesti, e il più importante è l'ultimo.**

**Immagine che resta**: un muro bianco liscio da cui esce un ramo in rilievo
sotto il passaggio del mouse.

### Come è organizzata la persuasione

| cosa | dove sta | a quale schermata |
|---|---|---|
| Promessa | `Transcend anything seen or felt before by crafting unparalleled experiences for ambitious brands.` | 1 (ma dopo 10–40 s di attesa) |
| Prova tecnica | il bassorilievo che fiorisce sotto il puntatore | 1, al primo movimento del mouse |
| Posizionamento | `Our approach` e `Our mission`, due frasi in tutto | ~3 e ~9 |
| Prova commerciale | 18 progetti, con i nomi delle maison | **da ~5 a ~36** |
| Prezzo | **assente**. Nessuna cifra, nessuna fascia, nessun listino | mai |
| Testimonianze | **assenti**. Nessuna citazione di cliente in tutto il sito | mai |
| Risultati | **assenti**. Nessun numero di conversione, vendite, traffico | mai |
| Chiamata all'azione | `See all projects` (fisso in basso a sinistra dal primo istante) e l'email nel footer | 1 e ~38 |

La struttura è **una sola idea ripetuta diciotto volte**. Non c'è
argomentazione: c'è accumulo. Funziona perché ogni ripetizione porta un nome che
vale da solo.

### Cosa arriva a chi NON scorre fino in fondo

**Poco, e con un rischio che vale la pena scrivere nero su bianco per un
committente.**

- **Nei primi 10–20 secondi (35–40 sul telefono) arriva soltanto**: il
  monogramma, una riga di caricamento e la frase
  `Innovative digital experiences studio`. Nient'altro. Il `first contentful
  paint` misurato è a **4,5–7,9 s**, l'evento `load` a **23,8 s**. Chi arriva da
  un link su rete mobile e non ha una ragione forte per aspettare, non vede mai
  il sito.
- **Chi resta e non scorre** porta via l'H1 e il muro che fiorisce: una promessa
  verbale generica (`Transcend anything seen or felt before…`) più una
  dimostrazione tecnica notevole. Capisce che sono bravi. **Non sa per chi hanno
  lavorato**: in prima schermata non c'è un solo logo cliente, non c'è un numero,
  non c'è un premio dichiarato. I nomi Louis Vuitton e Cartier arrivano solo dopo
  il primo blocco di testo, cioè oltre la quarta o quinta schermata.
- **Chi non arriva in fondo non trova l'email**, perché l'unico contatto della
  home sta nel footer, dopo ~38 schermate. La nav in alto offre solo `About`.
- **Il motore di ricerca, invece, vede tutto**: la home è renderizzata dal server
  (Nuxt 3 con SSR) e i diciotto titoli, le diciotto descrizioni e i testi di
  posizionamento sono nel markup. Il sito è invisibile all'utente frettoloso ma
  perfettamente leggibile da un crawler — l'esatto contrario di Igloo.

Lettura per un committente: questo modello di persuasione funziona **solo** con
traffico qualificato che ha già una ragione per essere lì (un premio, un
passaparola, un link da un direttore creativo). Su traffico freddo o a pagamento
questi numeri sarebbero un disastro — e lo studio lo sa: la loro CTA principale
non è "contattaci", è "guarda ancora".

### I testi veri principali

> **Baseline del loader**: `Innovative digital experiences studio` · `Scroll down`
> **H1**: `Transcend anything seen / or felt before by crafting / unparalleled experiences / for ambitious brands.`
> **Sotto l'H1**: `Click to enable sound`
> **`Our approach`**: `A global leader in groundbreaking digital design and strategy, we help forward-thinking clients achieve impact and growth.`
> **`Our mission`**: `We partner with exceptional clients, helping drive their success.`
> **Pagina contatti**: `Interaction begins with dialogue.` · `inquiries@immersive-g.com` · `jobs@immersive-g.com` · `14 rue Claude Vellefaux, 75010 Paris, France`
> **Pagina servizi**: `Immersive Garden delivers unparalleled service, blending strategic foresight with unmatched creative brilliance and innovation.` · `As a leading design studio, we create exceptional experiences for prestigious global clients, crafting a legacy of excellence and impact.`
> **Voci di `The Studio`**: `I Innovative Design Studio` · `II Our singular approach to craftsmanship` · `III Services driven by purpose and vision` · `IV Awards over the years` · `V Shaping the future with visionary clients` · `Contact us now` — ognuna con l'invito `Click to explore`
> **Chiamate all'azione**: `See all projects` · `Copy to clipboard` · `Newsletter` · `Off` / `On`

Le diciotto descrizioni di progetto, i tag e il resto sono nella sezione
**Testi veri** più sotto.

---

## Cosa vende

Il lavoro di uno studio parigino che costruisce siti-esperienza 3D per case di lusso (Louis Vuitton, Cartier, Dior, Omega, Longines, Girard-Perregaux) e per aziende che vogliono lo stesso trattamento (Orano, Hatom, Gleec, Masar). La home non è un listino: è la dimostrazione tecnica che quel livello lo sanno fare, applicata a sé stessi.

## A chi

Direzione marketing / brand director di una maison o di un gruppo che ha un budget a sei cifre per un sito-evento, e i loro creative director. Uscendo devono pensare due cose: "questo effetto non l'ho mai visto da nessun'altra parte" e "questi qui sono gli unici che possono realizzarlo". Il secondo pubblico sono gli sviluppatori creativi: il sito è anche un annuncio di assunzione implicito.

## Idea regista

**Tutta la pagina è un muro di intonaco bianco, e il "giardino" del nome è un bassorilievo scolpito dentro quel muro che si gonfia sotto il puntatore** — i progetti sono finestre ritagliate nella parete, e alla fine il muro si spegne e diventa un giardino vero, notturno e tridimensionale.

## Il momento

**Il puntatore che fa fiorire l'intonaco.** Il muro di partenza è liscio. Dove passa il mouse, la superficie si gonfia e affiorano rami, foglie, fiori, un uccello ad ali spiegate — modellati in vero rilievo, con la loro ombra — e ricadono nel piatto qualche secondo dopo che il mouse è andato via. Non è una texture che appare in dissolvenza: è geometria che esce dalla parete, guidata da una *flowmap* della traiettoria del mouse (`tFlow`, `dissipation: 0.953`, `falloff: 0.38`, `mouseEase: 0.4` — valori letti nella config `relief.flowmap` dentro `default.BZYNaK9D.js`). Cade **subito**, già sull'hero, prima ancora di scrollare: è la prima cosa che l'utente fa muovendo il mouse.

Il **secondo** momento è in fondo: superato l'ultimo progetto il muro bianco lascia il posto a un giardino notturno fotorealistico in 3D (ortensie, felci, corimbi) su fondo nero, con l'email `inquiries@immersive-g.com` al centro. Il giorno diventa notte, la scultura diventa pianta viva. È il footer.

---

## Struttura, sezione per sezione

Home a scorrimento unico. Altezza totale misurata: **34.037 px a 1440×900** (≈ 38 schermate) su desktop, **15.217 px a 390×844** (≈ 18 schermate) su mobile. Le durate qui sotto sono ricavate dalle regole CSS (`min-height:100vh` sui blocchi di testo, `gap:11.11vw` fra i media, `margin-top:27.78vw` fra un progetto e l'altro) e dal totale misurato: sono **stime**, non misure sezione per sezione.

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate) |
|---|---|---|---|
| Intro loader | Fondo piatto `#E8E8E8`, monogramma IG + "IMMERSIVE GARDEN", riga di progresso da 1px, baseline "Innovative digital experiences studio", "Scroll down" a destra | Aspetta. Lo scroll è bloccato (`introLoader.lockScroll`) | fissa, ~10-20 s su desktop, **~35-40 s su mobile** (misurato) |
| Hero | H1 su 4 righe in serif, colonne 3-6 del grid, CTA "Click to enable sound" sotto, "See all projects" in basso a sinistra, "About" + monogramma in alto a destra. Sotto: il muro di intonaco col bassorilievo | Muove il mouse e fa fiorire il rilievo | ~1,5 |
| Showreel | Un video mp4 centrato (`Showreel`, tipo media "video", posizione `center`) | Guarda | ~1,5 |
| "Our approach" | Blocco di testo, `min-height:100vh`, allineato | Legge | ~1,4 |
| 3 progetti (Louis Vuitton VIA, David Whyte, Cartier End of Year 23) | 1-2 media ciascuno + paragrafo + titolo/tipo | Passa sopra ai media, clicca per aprire il progetto | ~1,7 ciascuno |
| "Our mission" | Secondo blocco di testo | Legge | ~1,4 |
| 15 progetti (Chartogne Taillet → Hatom) | Stessa griglia, larghezze e posizioni diverse per ognuno | Scorre, passa sopra, clicca | ~1,7 ciascuno |
| "See all projects" | Bottone grande in serif 44px, centrato | Clicca → `/projects/` | ~1 |
| Footer | Giardino notturno 3D su nero, email al centro 44px, "Copy to clipboard", indirizzo, Newsletter, X / Instagram / Linkedin | Copia l'email o si iscrive | ~1,5 |

L'ordine dei 18 progetti in home, testuale dal payload: Louis Vuitton VIA · David Whyte Experience · Cartier End of Year 23 · Chartogne Taillet · Cartier in Time · Aten7 · Gleec · Dioriviera · Longines Spirit Zulu Time · Masar Destination · Midwam · Omega Space Sustainability · Orano · Prior Holding · Artisans d'Idées · Cartier Watches and Wonders 24 · Girard Perregaux Casquette · Hatom.

## L'esperienza in ordine di tempo

**0-1 s** — Fondo piatto `#E8E8E8`. Compare il monogramma IG a sinistra (SVG, `min-width:180px`), rivelato da una maschera: un `<rect>` dentro `<defs><mask>` che scorre da `x:-66%` a `0` in **2,5 s con `quart.out`** (letto in `IntroLoader.D9qttrK0.js`).

**1-3 s** — Sotto il logo appare una riga orizzontale da 1px con `opacity:.2`: è la barra di caricamento, animata in `scaleX` con `transform-origin:0 0`. A destra "Scroll down" in Helvetica 14px.

**2-4 s** — Le parole della baseline ("Innovative", "digital", "experiences", "studio") entrano una alla volta in opacità: `duration: 1.25`, `stagger: .1`, `ease: sine.inOut`.

**4-10 s** — Non succede nulla di visibile mentre scarica il modello 3D. Sul mio profilo pulito il First Contentful Paint è a **7,9 s** e il DOMContentLoaded a **11,6 s**.

**~10-20 s (desktop)** — Il loader si ritira: la maschera del logo torna indietro (`x:-66%`, 2 s, `quart.inOut`), la barra sparisce (1,2 s `sine.inOut`), e sotto c'è **il muro di intonaco**, non più piatto: il bassorilievo si gonfia fuori dalla parete. Sull'hero appare l'H1 in serif, con le lettere che si "ispessiscono" dal centro verso l'esterno (animazione SDF di `thickness`, `fade` e `mask`, ognuna `duration: 6` con una sua `cubic-bezier` — vedi tabella animazioni).

**Primo movimento del mouse** — L'intonaco fiorisce sotto il puntatore. Sotto il titolo compare "Click to enable sound": il sito ha una colonna sonora e parte muto.

**Primo scroll** — La parete scorre verso l'alto con inerzia molto lunga (Lenis `lerp: 0.05`). Il cursore del mouse è sostituito da una nuvoletta di puntini neri da 3px. Il primo video di progetto entra dall'alto: non è un `<video>` nel DOM, è un piano WebGL che occupa la posizione della sua immagine segnaposto.

**Scroll lento continuo** — I media si muovono in parallasse rispetto alla parete (`parallaxPositionFactor: 0.6`, il modello 3D si muove a `0.45`). Passando sopra un media, il piano si **rimpicciolisce del 3%**, si scurisce del 20%, e il bassorilievo che ha davanti gli proietta sopra la propria ombra e la propria deformazione (nel fragment shader: `if(uIsHome){ colorHSV.b -= … relief … extrude }`).

**Scroll veloce** — Superata la soglia (`fastMode.fastTrigger: 0.99`) il sito entra in "fast mode": la camera si avvicina (`fastModeZoom: 0.6` contro `slowModeZoom: 1`), i titoli in WebGL crescono (`fastScale: 2.5` contro `slowScale: 1`), i piani dei media si allungano verticalmente (`uStretchFactor` nel vertex shader) e si incurvano ai bordi, i puntini del cursore passano da nero `#030303` a grigio `#A6A6A6` (classe `dots__fast`), e la barra di navigazione in alto si dissolve (transizione Vue `isFastMode`). Rallentando sotto `slowTrigger: 0.75` tutto rientra.

**Fine pagina** — Il bianco lascia il posto al nero. Il giardino notturno 3D entra in scena con l'email al centro. Il bottone "See all projects" e la nav passano dalla variante nera (`#030303`) a quella chiara (`#E8E8E8`) via classi `--white` / `darkBg`.

---

## Animazioni

| elemento | cosa si muove | legato a | curva / inerzia | note |
|---|---|---|---|---|
| Scroll di tutta la pagina | traslazione del contenuto | ruota / touch | Lenis, `lerp: 0.05` desktop e `lerp: 1` mobile, `syncTouch: true` | inerzia lunghissima su desktop, **nessuna** su mobile: scelta esplicita nel codice |
| Bassorilievo dell'intonaco | estrusione della geometria dove passa il mouse | posizione del puntatore | flowmap con `dissipation: 0.953`, `falloff: 0.38`, `mouseEase: 0.4` | il "momento" del sito. Rientra in dissolvenza in 2 s (`over.hide.relief.fade`), esce in 0,5 s (`over.show.relief.fade`) |
| Maschera del logo nel loader | `<rect>` dentro `<mask>` SVG, `x` da -66% a 0 | tempo | in: 2,5 s `quart.out` — out: 2 s `quart.inOut` | tendina che scopre il monogramma |
| Barra di progresso | `scaleX` con `transform-origin: 0 0` | avanzamento del preload | lineare | altezza 1px, `opacity: .2` |
| Parole della baseline | opacità | tempo | 1,25 s `sine.inOut`, `stagger: .1` | |
| Titolo H1 | rivelazione tipografica in tre canali (spessore, dissolvenza, maschera) su testo SDF | tempo, all'uscita del loader | tre `cubic-bezier` distinte, tutte `duration: 6`: `(0, 0.016, 0.5775, 0.972)` per lo spessore, `(0, 0.208, 0.334, 0.968)` per la dissolvenza, `(0, 0.316, 0.406, 0.959)` per la maschera | ognuna con un proprio `sdfCenter`, cioè un punto d'origine diverso sul titolo: l'inchiostro cresce da tre centri sfalsati |
| Paragrafi di progetto | il blocco sale di 50px e le **righe** entrano in opacità | ingresso in viewport (top dell'elemento contro bottom della finestra) | offset `power2.out` 2 s; opacità `power1.out` 1,8 s con `stagger: .1` | righe separate con **GSAP SplitText** (`type: "lines"`), componente `AnimatedParagraph` |
| Media (piani WebGL) | parallasse verticale | scroll | ease custom `mediaBlockParallax` = `cubic-bezier(.5, 0, 1, .4)` | `parallaxPositionFactor: 0.6`, `parallaxMaskFactor: 0.13` |
| Titoli in WebGL | scala | scroll | ease custom `titleParallax` = `cubic-bezier(.5, 0, 1, .4)` | `globalScale: 2.6` |
| Media in hover | il piano si rimpicciolisce del 3%, l'immagine dentro respira (`sin(uTime*0.2)*0.02`), la saturazione cala del 10%, la luminosità cala del 20% | stato hover | `uHover` interpolato | la deformazione usa depth map + relief map del bassorilievo davanti |
| Media in scroll veloce | allungamento verticale (`uStretchFactor`) e incurvatura a barile ai bordi (`uDeformationProgress`) | velocità dello scroll | ease custom `fast` = `cubic-bezier(.2, 0, 0, 1)`; per il rallentamento `slow` = `cubic-bezier(.4, 0, 0, 1)` | soglie `fastTrigger: 0.99` / `slowTrigger: 0.75` |
| Camera | zoom | modalità di scroll | `power1.out` 2 s in ingresso | `fov: 30`, `distance: 15`, `near: 5`, `far: 20`; `fastModeZoom: 0.6` |
| Transizione home → About | dissolvenza + zoom camera a 1.05 | click | `cubic-bezier(0.425, 0.032, 0, 0.972)`, **6 s** | accompagnata da un suono di tuono (`IG_Eventsounds_v3_Home_To_About_Thunder_1.mp3`) |
| Apertura di un progetto | il piano del media si trasforma in quad a tutto schermo (`uFullscreen` da 0 a 1, in due fasi) e va a nero | click | `open1: 1 s power2.inOut`, `open2: 1,5 s power2.inOut` | |
| Cursore a puntini | opacità dei singoli punti (121 `div.dot` nel DOM) | velocità dello scroll | `transition: opacity .25s ease` per accendersi, `1s ease` per il punto attivo | passa a `#A6A6A6` in fast mode |
| Icona del bottone circolare | disegno di un cerchio su `<canvas>` | hover | ease custom `circleDraw` = `cubic-bezier(0.4, 0, 0, 1)` | |
| Bottone "About" in hover | il testo trasla di 4px e diventa `#FFFFFF`, il logo affiancato appare | hover | `cubic-bezier(.2, 0, 0, 1)` 0,8 s per la traslazione, `cubic-bezier(.39,.575,.565,1)` 0,5 s per il colore | |
| Barra di navigazione | dissolvenza | fast mode / footer in viewport | `opacity 1.5s linear 1s` in CSS + transizioni Vue nominate `fade`, `fade-delay`, `isFastMode` | |
| Giardino del footer | oscillazione di rami e fiori al vento, con raffiche | tempo + posizione del mouse | molla fisica per il vento del cursore (`cursor.wind.k`, `damping`, `mass`); rumore per-ramo (`branchSwayPowerA/B`, `branchNoise`, `windPower`, `facingWind`) tutto nel **vertex shader** | ogni fiore ha una massa calcolata dal proprio bounding box (`flowerMass`) e si piega di conseguenza (`flowerLean`) |
| Post-produzione | bloom | continuo | — | `strength: 2.2`, `radius: 0.15`, `threshold: 0.38`, `smoothWidth: 0.5` |

Librerie riconosciute dietro gli effetti: **GSAP** (con **CustomEase** e **SplitText**, plugin Club GreenSock) per tutte le tempistiche, **Lenis** per lo scroll, **three.js r151** per il 3D e gli shader. Non c'è ScrollTrigger usato in modo classico: le soglie di viewport sono gestite da un observer proprio dello studio (`ScrollManager`, `WindowResizeObserver`).

---

## Colori

La palette DOM è di **tre valori**. Tutto il resto del colore lo fa il rendering 3D.

| ruolo | esadecimale | dove si usa | come l'ho ricavato |
|---|---|---|---|
| Fondo chiaro / testo su fondo scuro | `#E8E8E8` | fondo del loader, sfondo del footer in versione "solo DOM", testo e linee quando il fondo è scuro (`.darkBg`, `--white`) | CSS, **verificato** |
| Testo e UI | `#030303` | tutti i testi, i puntini del cursore, le sottolineature dei bottoni, i bordi | CSS, **verificato** |
| Cursore in scroll veloce | `#A6A6A6` | i puntini quando si scorre forte (`.dots__fast .dots`) | CSS, **verificato** |
| Sfondo del renderer WebGL | `#FFFFFF` | `renderer.clearColor` della scena home; anche `meta theme-color` e `msapplication-TileColor` | config JS + meta, **verificato** |
| Colore hover del label di nav | `#FFFFFF` | `.navButton.isOver .navButton__label` | CSS, **verificato** |
| Intonaco renderizzato (desktop) | ~`#BEBEBE` – `#C4C4C4` | tutta la parete di fondo | **stimato**, campionato dai miei screenshot 1440×900 |
| Intonaco renderizzato (mobile) | ~`#E5E5E5` – `#E7E7E7` | stessa parete su iPhone | **stimato**, campionato dal mio screenshot 390×844. Perché il tono sia più chiaro di ~40 livelli rispetto al desktop **non l'ho verificato** (modello `low` diverso, esposizione o bloom diversi) |
| Fondo del footer | ~`#000000` (68% dei pixel campionati nella fascia alta) | giardino notturno | **stimato** dallo screenshot |
| Verde-azzurro del fluido | `#7ABFC5` (`rgb(122,191,197)`) | `relief.fluidEffect.baseColor` | config JS, **verificato nel codice** ma con `fluidMagnitude: 0.15` e `linesStrength: 0` non l'ho mai visto a schermo |

**Attenzione a non copiare** `#FF0` e `#90EE90`: compaiono 20 volte ciascuno nel CSS ma appartengono solo al pannello di debug **Tweakpane** (`.tweakpane .config .tp-fldv_t`) e a `mark`, rimasti nel bundle di produzione. Non fanno parte del design.

---

## Tipografia

Base di progetto **1440px**: tutti i corpi sono in `vw` e i valori qui sotto sono la conversione a 1440.

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| H1 hero / bottone "See all projects" / email nel footer / testo grande | PSTimes (serif) | 400 | `3.0555vw` = **44px** (34px sotto 1113px) | 1.1 (email 1.2) | l'H1 è `visibility:hidden` nel DOM: viene ridisegnato in WebGL |
| Testo corrente dei blocchi / didascalie / progresso del loader | PSTimes | 400 | `1.9444vw` = **28px** (23px sotto 1183px) | 1.2 | |
| Paragrafi di progetto / testo piccolo | PSTimes | 400 | `1.5277vw` = **22px** (20px sotto 1309px) | 1.4 | |
| Suffisso del bottone footer (`:after`, da `data-after`) | PSTimes | 400 | `1.1111vw` = **16px** | — | `letter-spacing: .01em` |
| Tutta la micro-UI: nav, CTA, "Scroll down", indirizzo, social, validazione newsletter, link mobile | HelveticaNeueRegular | 400 | `0.9722vw` = **14px** (bloccato a 14px sotto 1440px) | 1.1 | |
| Campo newsletter | HelveticaNeueLight | 300 | `2.9166vw` = **42px** | 0 | `letter-spacing: -.01em` |

**Come sono serviti**: tre `@font-face` **auto-ospitati** in `/assets/`, `woff2` con fallback `woff`, `font-display: swap`. Nessun servizio esterno, nessun font variabile, un solo peso per famiglia. Le famiglie sono `PSTimes`, `HelveticaNeueRegular`, `HelveticaNeueLight`.

In più, tre **atlanti MSDF** per il testo disegnato dentro il canvas (`/webgl/msdf/`): `PSTimesBody` (PSTimes-Regular.png + .json, 77 KB), `Helvetica-neue` (68 KB) e `TimesNowNumbers` (TimesNow, usato solo per i numeri). Nel fragment shader la funzione `median(r,g,b)` con `clamp(sigDist/fwidth(sigDist)+0.5, 0, 1)` è l'antialiasing MSDF standard.

*Supposto*: "PSTimes" è verosimilmente un taglio di Times su misura o su licenza; "TimesNow" è il carattere Pangram Pangram. Non ho verificato le licenze.

---

## Testi veri

**Loader / baseline**
> Innovative digital experiences studio
> Scroll down

**H1 dell'hero** (nel payload il campo è `hero`, con `<br/>` dove qui vanno a capo)
> Transcend anything seen
> or felt before by crafting
> unparalleled experiences
> for ambitious brands.

**CTA sotto l'H1**
> Click to enable sound

**Primo blocco di testo**
> Our approach
> A global leader in groundbreaking digital design and strategy, we help forward‑thinking clients achieve impact and growth.

**Secondo blocco di testo**
> Our mission
> We partner with exceptional clients, helping drive their success.

**Descrizioni di progetto** (le prime tre, testuali)
> Explore our collaboration with Louis Vuitton on VIA, showcasing the Maison's Web 3 vision through its first digital trunk.
> Step into David Whyte's poetry in a digital journey, capturing life's profound moments with artistic depth.
> Discover Cartier's End of Year: redefining elegance with an immersive campaign, Above the Clouds.

**Tipi di progetto usati come etichetta**: `Web Experience`, `E-Shop`, `Corporate`.
**Tag di competenza** (nel payload, mostrati sulle pagine progetto): `Design, Tech, E-shop, NFT, 3D` · `Design, Experience, Watercolor` · `Design, Champagne, Experience, 3D` · `Design, Web3, 3D` · `Design, Branding, Strategy` · `Film` · `Installation`.

**Voci di menu**: `About` (rotta `/the-studio/`), e in pagina progetto la voce diventa `Close`. Sotto-rotte dell'About: `the-studio`, `our-approach`, `Services`, `Awards`, `Our Clients`, `Contact us`.

**Chiamate all'azione**
> See all projects
> Work with us
> Copy to clipboard
> Newsletter
> Off / On (interruttore del suono)

**Pagina Projects** (titolo, dal payload)
> Since 2013 we have produced more than 67 projects.

**Piede**
> inquiries@immersive-g.com
> Immersive Garden
> 14 avenue Claude Vellefaux
> Paris 75010
> Newsletter — X — Instagram — Linkedin

---

## Mobile

Misurato con un contesto iPhone reale (390×844, DPR 3, UA iOS 17.5, touch attivo). Il sito **non** degrada a versione statica: il muro di bassorilievo c'è tutto anche sul telefono. Cambia il modo di guidarlo.

**Cosa SPARISCE**
- **Il cursore a puntini**: `.scrollCursor { display: none }` sotto 1024px. Non c'è nessun sostituto.
- **La rivelazione del rilievo col puntatore**, cioè il momento del sito: senza mouse la flowmap non ha traiettoria da seguire. Il bassorilievo resta visibile (è geometria, non è un effetto hover) ma **non fiorisce sotto il dito**. *Non ho verificato* se un trascinamento col dito alimenti comunque `uMouse`.
- **L'inerzia dello scroll**: Lenis viene inizializzato con `lerp: DeviceHelper.device.mobile ? 1 : .05`. `lerp: 1` significa nessun smoothing: sul telefono lo scorrimento è quello nativo del sistema. Restano attivi `syncTouch: true` e `touchMultiplier`.
- **Gli stati hover** dei media (rimpicciolimento del 3%, scurimento, ombra del rilievo).
- **Il modello 3D ad alta risoluzione**: viene servito `reliefs_low_compressed.glb` (4,62 MB) invece di `reliefs_high_compressed.glb` (5,99 MB), tramite un `fallback: { mobile_or_lowTier: … }` dichiarato nella lista risorse. Per la scena About si scende ancora, a `bg_ultralow_draco.glb`. Il `drawRange` delle geometrie passa da `"low"` a `"ultralow"`.
- **Le ombre** dei modelli, se la GPU è di fascia bassa: `shadows: gpu.tier > BAD`.

**Cosa viene SOSTITUITO**
- **Il click sul media diventa un link di testo.** Sotto ogni progetto compare `.text__mobileLink` (`display: none` su desktop, `display: flex` sotto 1024px): il titolo sottolineato con una riga da 1px e, di fianco, il tipo di progetto a `opacity: .5`. Verificato a schermo: "David Whyte — Web Experience". È l'unico modo di aprire un progetto col dito.
- **I titoli lunghi vengono accorciati a mano** nel componente MediaBlock: "Cartier Watches and Wonders 24" → "Cartier W&W 24", "Longines Spirit Zulu Time" → "Longines Zulu", "David Whyte Experience" → "David Whyte".
- **La griglia si contrae in tre scalini**, non uno: a 768px ogni larghezza guadagna 2 colonne (un `width__4` diventa `span 6`) e le posizioni si accorpano; a 560px i media orizzontali vanno a tutta larghezza (`grid-column: 1 / 13`) mentre i **verticali restano a 7 colonne** (`.portrait { grid-column: 1 / 8 }`), quindi il ritmo non diventa una colonna monotona.
- **I margini passano da `vw` a pixel fissi sotto 432px**: `offsetY__negative` da `-27.77vw` a `-120px`, `offsetY__center_positive` da `16.66vw` a `72px`. Sotto quella soglia lo studio smette di scalare e blocca.
- **Il DPR viene tagliato a 2**: canvas `780×1688` su un viewport di `390×844` con `devicePixelRatio: 3`. È una scelta esplicita (uniform `uDpr`), non un caso.
- **Il layout del loader**: il monogramma passa a `grid-column: 1/5`, barra di progresso e "Scroll down" vanno entrambi a `1/12`, uno sotto l'altro; la baseline si stringe a `max-width: 200px`.

**Cosa RESTA**
- **Il canvas WebGL, il bassorilievo e il giardino notturno del footer**: tutto renderizzato anche sul telefono.
- **L'H1 disegnato in MSDF**: `hero__text1` resta `visibility: hidden` anche a 390px, quindi il titolo è testo WebGL pure lì. Corpo 34px.
- **Il suono**: il pulsante Off/On è presente e funziona (verificato con un tap).
- **La barra fissa in basso a sinistra** "See all projects" e "About" in alto a destra, con padding ridotto da 40px a 32px.
- **I 18 progetti**, tutti, nello stesso ordine. La pagina è però lunga ~18 schermate contro le ~38 del desktop.

**Il prezzo**: alla fine del caricamento mobile ho contato **95 richieste e 20,60 MB**, di cui **9,6 MB di soli modelli 3D** (`reliefs_low` 4,62 + `footer` 3,60 + `bg_ultralow` 1,12 + `fish` 0,30). Il loader era ancora a schermo dopo **19 secondi** (barra a ~90%) e la home è diventata navigabile intorno ai **35-40 secondi**. Su rete mobile vera è un'attesa che pochi committenti accetterebbero.

---

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| Framework | **Nuxt 3** su Vue 3, con **SSR** | VERIFICATO | `<script id="__NUXT_DATA__" data-ssr="true" data-src="/_payload.json">` nell'HTML; asset in `/assets/entry.<hash>.js`; il markup dei progetti arriva già completo dal server (non è un guscio vuoto) |
| Stato | **Pinia** | VERIFICATO | chiave `"pinia"` nella radice del payload, con gli store `transition`, `ui`, `webgl`, `datas`, `scroll` |
| Animazione | **GSAP** + **CustomEase** + **SplitText** | VERIFICATO | intestazione di licenza GreenSock nel chunk `cremap.CU3cgCQg.js`; 5 ease registrate a mano (`fast`, `slow`, `circleDraw`, `mediaBlockParallax`, `titleParallax`); `linesClass`/`wordsClass`/`charsClass` nel bundle |
| Scroll | **Lenis** | VERIFICATO | `new Lenis({ wrapper, content, lerp: DeviceHelper.device.mobile?1:.05, wheelMultiplier, touchMultiplier, syncTouch:true })` in chiaro nel bundle; classe `html.lenis` nel CSS |
| 3D | **three.js r151** | VERIFICATO | `REVISION="151"` nel bundle, più i simboli `WebGLRenderer`, `ShaderMaterial`, `DepthTexture` |
| Compressione 3D | **DRACO** + **KTX2/Basis** | VERIFICATO | `/webgl/libs/draco/` e `/webgl/libs/basis/`, file `.ktx2` (es. `rocks_normal.ktx2`) e `_compressed.glb` / `_draco.glb` |
| Testo nel canvas | atlanti **MSDF** propri | VERIFICATO | `/webgl/msdf/PSTimesBody/`, `/Helvetica-neue/`, `/TimesNowNumbers/`; funzione `median()` + `fwidth()` nel fragment shader |
| Post-produzione | bloom in stile UnrealBloomPass | VERIFICATO nei parametri, SUPPOSTO nella classe | config `composer.bloom { enabled:true, strength:2.2, radius:.15, threshold:.38, smoothWidth:.5 }`; `smoothWidth` è il parametro di UnrealBloomPass |
| Adattamento GPU | **detect-gpu 5.0.60** | VERIFICATO | `benchmarksURL: "https://unpkg.com/detect-gpu@5.0.60/dist/benchmarks"`; soglie `desktopTiers: [0,30,50,60]` in fps; fallback `mobile_or_lowTier` sulle risorse |
| Audio | **Howler** | VERIFICATO (presente nel bundle) | occorrenze di `howler`; il volume è comunque animato con `gsap.to(…, {volume, duration:.5, ease:"sine.inOut"})`. Sei file in `/sounds/general/`: `IG_HomePage_v5_v4.mp3`, `IG_AboutPage_v5_v5.mp3`, `IG_FocusPage_v5_v8.mp3` (un tema per tipo di pagina), `Marble_Crack_10secLoop_no_filter.mp3` (loop legato alla pietra), `IG_Eventsounds_v3_Home_To_About_Thunder_1.mp3` (transizione), `actions.mp3` (sprite dell'interfaccia) |
| Pannello di debug | **Tweakpane** | VERIFICATO | classi `.tweakpane .config .tp-fldv_t`, chiamate `addInput(… {label:"Intensity"})`, `title:"Flower Lean"` — **spedito in produzione**, non rimosso dal build |
| CMS | **Strapi** self-hosted, API **GraphQL** | VERIFICATO nella forma, SUPPOSTO nel nome | endpoint `https://ig-cms-prod-xu4tl.ondigitalocean.app/graphql` nel payload; i media hanno la forma tipica di Strapi (`formats` con `thumbnail_`/`xsmall_`/`small_`/`medium_`/`large_` + `hash`, `ext`, `mime`). **Nota**: la scheda Awwwards dichiara "Contentful" — non corrisponde a quello che ho letto nel payload |
| Hosting | **DigitalOcean App Platform** | VERIFICATO | dominio `*.ondigitalocean.app` per il CMS |
| Media | **DigitalOcean Spaces**, regione `ams3` (Amsterdam) | VERIFICATO | tutti gli mp4/jpg su `ig-medias-prod.ams3.digitaloceanspaces.com`; alcuni riferimenti residui a `cms-staging-medias.ams3…` |
| Funzione serverless | **DigitalOcean Functions**, regione `lon1` | VERIFICATO | `https://faas-lon1-917a94a7.doserverless.co/api/v1/web/fn-…` nel payload — verosimilmente l'iscrizione alla newsletter (SUPPOSTO l'uso) |
| Immagini | **jpg e mp4 grezzi**, nessun `srcset`, nessun webp/avif per i media dei progetti | VERIFICATO | zero attributi `srcset` nell'HTML; i tag `<img>` servono solo da segnaposto di layout. Le uniche `.webp`/`.ktx2` sono texture WebGL |
| Impaginazione | griglia CSS a **12 colonne**, gap 16px, padding 16px, `max-width: 2088px` | VERIFICATO | `.gridWrapper { grid-template-columns: repeat(12, 1fr); grid-column-gap:16px }` |
| Analytics / tag manager | nessuno trovato | VERIFICATO per assenza | nessun GA, GTM, Segment, Plausible fra le 136 richieste osservate |

**La cosa architetturalmente più importante**: il DOM **non disegna quasi niente**. `.mediaBlock__image { opacity: 0 }` e `.hero__text1 { visibility: hidden }` — le immagini e il titolo esistono nel documento solo per **occupare lo spazio giusto nella griglia** e dare al motore WebGL un rettangolo da leggere; il pixel lo mette il canvas. Esiste anche una classe `debugDom` (`.mediaBlock.debugDom .mediaBlock__image { opacity: 1 }`, `.hero.debugDom .hero__text1 { visibility: inherit }`) e una flag `debugParams.debugDom` nello store, per riaccendere il DOM e verificare che il layout coincida col rendering. Conseguenza pratica: la griglia resta una vera griglia CSS responsive — la si può ridisegnare con i media query normali — e il 3D la segue.

---

## Peso e prestazioni

Numeri miei, Chromium via Playwright, profilo pulito, connessione domestica.

**Desktop 1440×900**
- **Prima visita**: 94 richieste / **18,6 MB** trasferiti al `load`, che sale a 136 richieste / **23,1 MB** dopo ~20 s (le risorse WebGL continuano ad arrivare).
- **First Contentful Paint: 4,5 s** (7,9 s in una seconda misura). **DOMContentLoaded: 11,1 s**. Evento `load`: **23,8 s**. Nessun LCP registrato dall'API (il contenuto è nel canvas).
- Ripartizione della prima misura: immagini **16,6 MB**, script 968 KB, CSS 836 KB, link/preload 148 KB.
- Peso dei singoli asset pesanti: `reliefs_high_compressed.glb` **5,99 MB**, `footer_compressed.glb` **3,71 MB**, `entry.nmlBdY4S.js` **529 KB compressi** (2,02 MB decompressi), `default.BZYNaK9D.js` 163 KB compressi (715 KB), tre mp3 di ambiente da ~713 KB l'uno, `matcap2.png` 555 KB, `mask-noise.png` 404 KB.
- CSS: 7 fogli, **215 KB non compressi in totale** — ma è un totale gonfiato, perché lo stesso reset e le stesse regole di base sono ripetuti sotto 6 diversi hash `data-v-*` di Vue scoped. I selettori unici sono ~570.
- Memoria: **159 MB** di heap JS con la scena home attiva.
- Console: **0 errori**, 17 warning.
- Canvas: 1440×900, cioè DPR 1 nel mio ambiente.

**Mobile 390×844, DPR 3**
- **95 richieste / 20,60 MB**. Loader ancora a schermo a 19 s; pagina navigabile intorno ai 35-40 s.
- Canvas 780×1688 → **DPR tagliato a 2**.
- Modelli scaricati: `reliefs_low_compressed.glb` 4,62 MB + `footer_compressed.glb` 3,60 MB + `bg_ultralow_draco.glb` 1,12 MB + `fish.glb` 0,30 MB.

**Punteggi esterni**: Awwwards dà 7,5/10 alla parte di sviluppo, con **Accessibility 6,6/10** come voce più bassa e Animations/Transitions 8,8/10 come più alta (https://www.awwwards.com/sites/immersive-garden-website). Non ho eseguito Lighthouse.

**Lettura onesta**: è un sito che accetta consapevolmente 20 MB e mezzo minuto di attesa in cambio dell'effetto. Funziona perché il pubblico è un direttore creativo che sta valutando un fornitore, non un compratore che deve convertire. Su un e-commerce o su una landing a pagamento questi numeri sarebbero un disastro.

---

## Tre cose da rubare

**1. Il DOM come impalcatura invisibile, il WebGL come pittore.**
Scrivi il layout con una normale griglia CSS a 12 colonne, con `<img>` e `<h1>` veri al posto giusto, poi mettili a `opacity: 0` / `visibility: hidden` e usa il loro `getBoundingClientRect()` per posizionare i piani nella scena 3D. Guadagni tre cose in una: il responsive lo continui a fare con i media query (qui la stessa griglia regge desktop, 1024, 768, 560 e 432 senza toccare il 3D), i motori di ricerca e i lettori di schermo trovano comunque testo e immagini, e per il debug ti basta una classe (`debugDom`) per riaccendere il DOM e vedere se il rendering coincide. **Costo**: uno solo, ma serio — le immagini restano `opacity: 0` anche se il WebGL fallisce, quindi ti serve un percorso di fallback che rimetta `opacity: 1` quando il contesto non parte.

**2. La flowmap del puntatore che deforma la geometria, non l'immagine.**
Renderizza in una texture la scia del mouse (una `Flowmap`: si scrive nel rosso/verde la direzione, e a ogni frame si moltiplica per `dissipation ≈ 0.95` così la traccia svanisce da sola), poi campiona quella texture **in coordinate schermo** dentro il vertex shader di un piano ad alta densità di vertici, e usa il valore per estrudere. Qui bastano tre numeri a definire il carattere del gesto: `dissipation: 0.953` (quanto resta la scia), `falloff: 0.38` (quanto è largo il pennello), `mouseEase: 0.4` (quanto il pennello insegue il mouse in ritardo). È la stessa meccanica che serve per acqua, sabbia, tessuto e — come qui — intonaco. Vale molto più di un hover con `transform: scale()`, e costa un solo render target da 128×128.

**3. Due modalità di scroll con isteresi, non una curva sola.**
Non limitarti a lisciare lo scroll: misura la velocità e fai **cambiare stato** al sito quando supera una soglia. Qui `fastTrigger: 0.99` accende la modalità veloce e `slowTrigger: 0.75` la spegne — due soglie diverse, così non sfarfalla al confine. In modalità veloce cambiano insieme cinque cose: la camera si avvicina (`0.6`), i titoli raddoppiano (`2.5` contro `1`), i piani si allungano verticalmente e si incurvano ai bordi, i puntini del cursore sbiadiscono da `#030303` a `#A6A6A6`, e la barra di navigazione sparisce. È il trucco che fa sembrare "reattivo" un sito lento da scorrere: chi scrolla forte sta cercando, e il sito glielo lascia fare senza combattere. E si può fare **senza 3D**: bastano `velocity` da Lenis, una variabile CSS e qualche `transform: scaleY()`.

---

## Non verificato

- **La causa della differenza di tono dell'intonaco** fra desktop (~`#BEBEBE`) e mobile (~`#E5E5E5`). Può essere il modello `low` con materiali diversi, un'esposizione diversa o il bloom. Non l'ho isolata.
- **Se il bassorilievo reagisca al dito su mobile.** Il codice della flowmap è presente su mobile, ma non ho testato un trascinamento con `touchscreen` per vedere se `uMouse` viene alimentato.
- **La pagina About** (`/the-studio/`) e le pagine progetto: le ho identificate solo dagli asset (`/webgl/about/`, `/webgl/about-detail/` con 6 scene, LUT `.3dl`, fireflies, nebbia, acqua) e dalle rotte nel payload. Non le ho aperte, per rispettare il vincolo di una scheda per volta.
- **Il pannello Tweakpane in produzione**: ho verificato che il CSS e le chiamate `addInput` ci sono. Non ho trovato la scorciatoia da tastiera o il parametro URL che lo apre.
- **A cosa serva `fish.glb`** (296 KB, in `/webgl/projects/`): viene scaricato anche dalla home, ma non ho visto nessun pesce a schermo.
- **Se il colore `#7ABFC5` del `fluidEffect` sia mai visibile.** È nella config, ma con `linesStrength: 0` e `fluidMagnitude: 0.15` potrebbe essere disattivato.
- **Le licenze dei caratteri** PSTimes e TimesNow.
- **Lighthouse / Core Web Vitals reali**: non ho eseguito un audit. I tempi riportati sono presi da `performance.getEntriesByType()` sulla mia macchina e sulla mia rete, senza throttling: **non sono un campo di prova rappresentativo**.
- **Il conteggio delle schermate per singola sezione** nella tabella della struttura è calcolato dalle regole CSS e dal totale misurato, non misurato blocco per blocco.
- **La discrepanza sul CMS**: Awwwards indica Contentful, il payload ha la forma di Strapi. Non ho interrogato l'endpoint GraphQL per dirimere (avrebbe richiesto una chiamata a un'API di terzi non necessaria per la scheda).
- **Il pulsante del suono su desktop**: nel DOM c'è (`.soundWrapper`, `.sound--muted`, testi "Off"/"On") e su mobile l'ho visto e usato, ma su desktop nei miei screenshot in basso a destra si vede solo un punto: non ho capito con quale gesto si espande.
