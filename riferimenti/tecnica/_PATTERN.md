# I pattern dei siti premiati — agosto 2026

Sedici siti ispezionati **nel codice**: bundle scaricati e cercati per firma di
libreria, `document.fonts` letto, corpi misurati sul DOM reale, presenza di
contesto WebGL verificata. Dove il bundle e' offuscato, sta scritto.

**Avvertenza dell'autore della ricerca:** le meccaniche di scroll sono dedotte
dalla presenza del codice, non campionate durante lo scorrimento. Chi le rifa'
deve misurarle.

## I sedici siti

| sito | studio | verificato nel codice | tecnica |
|---|---|---|---|
| Lando Norris (SOTY 2025) | OFF+BRAND | Webflow + bundle 1,29 MB: GSAP, ScrollTrigger, Lenis, Three.js, SplitText, DRACO; 20 canvas | Webflow "truccato" |
| Messenger (Dev SOTY 2025) | abeto | React + Three.js + postprocessing + DRACO + KTX2 + 4 worker, 1,88 MB | gioco WebGL |
| Igloo Inc (SOTY 2024) | abeto | GSAP + Three.js + postprocessing + DRACO + KTX2, `App3D` 1,45 MB | stessa architettura |
| Obys | Obys | **non verificato**: 117 KB manglati. Confermati 1 canvas, `mix-blend-mode`, font propri | build offuscata |
| Active Theory | Active Theory | framework proprietario **Hydra** (8 worker) + Three.js, 1,78 MB. **Niente GSAP, niente Lenis** | tutto dentro il canvas |
| TRIONN | Trionn | Next.js + GSAP + ScrollTrigger + SplitText + Lenis + Tailwind | stack moderno completo |
| Merci Michel | Merci Michel | GSAP + Three.js + R3F + postprocessing | canvas unico + serif didone |
| Lusion (SOTY 2023) | Lusion | Three.js + SplitText, 1,22 MB (GSAP non rilevato) | motore proprio |
| Revelatio Studio | Revelatio | Webflow + GSAP/ScrollTrigger/SplitText/ScrambleText + `page-transition.js` da 3 KB | transizione in 60 righe |
| NOTHIN' | Thomas Carre | Webflow + `main.js` 735 KB: GSAP, ScrollTrigger, Lenis, Three.js | un solo carattere |
| Dragonfly Redux | Studio Freight | Nuxt/Vue + GSAP + ScrollTrigger + SplitText + Lenis | trio serif/grotesque/mono |
| 2xA Studio | 2xA | GSAP (Observer, Flip, ScrollSmoother) + Lenis + Three + **Swup 4** + Splitting.js; 8 canvas **2D** | unica libreria di transizione |
| Noomo Showcase | Noomo | Nuxt/Vue + GSAP + Three.js + DRACO | canvas + Vue sopra |
| **Mosby's Files** (SOTD 13/08/2026) | Tubik | Nuxt/Vue + GSAP + SplitText + Lenis, 2,98 MB, **nessun WebGL** | **premiato senza 3D** |
| Vero New-York | Rodeo | Next.js su Vercel + React + GSAP | e-commerce, scala 12x |
| Hearst Exhibit 2026 | OSMOS | Next.js + React + GSAP + Three.js | didone sopra il canvas |

## I pattern (soglia: almeno tre siti)

**P1 — Canvas WebGL persistente sotto, DOM sopra (13/16).** Un solo `<canvas>`
`position:fixed; inset:0`, mai smontato. Gli elementi HTML fanno da slot:
misurati con `getBoundingClientRect()`, le loro coordinate pilotano le mesh. Il
testo resta HTML, selezionabile e indicizzabile. *Caso limite opposto:* Active
Theory e Messenger mettono tutto dentro il canvas — ma hanno un framework
proprio. *Controesempio che conta:* **Mosby's Files ha vinto il SOTD del
13/08/2026 senza WebGL.**

**P2 — Lo scroll si interpola, non si sequestra (6/16).** Lenis normalizza
wheel e touch (`lerp` ~0,1), ScrollTrigger fa da `scrub`. La scrollbar resta
reale.

**P3 — Testo spezzato e rivelato in cascata (6/16).** SplitText avvolge ogni
riga in un contenitore con `overflow: clip`, i figli partono da `y:100%` e
risalgono con stagger 20-60 ms.

**P4 — Due gradini tipografici, non sette (misurato su 4).** Servizio 11-15 px
maiuscolo, spesso mono; display 77-175 px con `letter-spacing` negativo ~1% del
corpo. Rapporti misurati: Mosby **14,6x** (12->174,7), Vero **12x** (14->168),
NOTHIN' **6,7x** (11,5->76,8, tracking -0,768 px), TRIONN **6,25x** (15->93,75).
Il vuoto in mezzo e' la scelta.

**P5 — Asset compressi per la GPU (DRACO 5/16, KTX2 3/16).** Non e'
ottimizzazione di rete: e' memoria video.

**P6 — `mix-blend-mode: difference` per restare leggibili sopra il fondo (10/16).**

**P7 — Un solo bundle monolitico dietro un'attesa (9/16).** Mosby 2,98 MB ·
Messenger 1,88 · Active Theory 1,78 · Igloo 1,45 · Noomo 1,44 · Lando 1,29 ·
Lusion 1,22 · NOTHIN' 735 KB · 2xA 735 KB.

**P8 — Webflow come CMS e tutto il resto scritto a mano (3/16).** Lando Norris
(Site of the Year!), Revelatio, NOTHIN'.

**P9 — Font auto-ospitati (15/16).** **Zero richieste a `fonts.googleapis.com`
su nessuno dei sedici.**

## Le librerie che si usano davvero

| libreria | sui premiati | npm/settimana (3-9 ago 2026) |
|---|---|---|
| **GSAP** | **12/15** | 4.448.997 |
| **Three.js** | **11/15** | 14.218.946 |
| **ScrollTrigger** | 10/15 | (in gsap) |
| **Lenis** | 6/15 | 1.349.285 |
| SplitText/SplitType | 6/15 | 83.470 |
| postprocessing | 3/15 | 860.563 |
| React Three Fiber | 1/15 | 5.025.658 |
| Swup | 1/15 | 38.037 |
| Locomotive Scroll | **0/15** | 15.353 |
| **Framer Motion / motion** | **0/15** | **42,8 M + 17,5 M** |

**Il dato che vale.** Framer Motion ha 42,8 milioni di download a settimana e
non compare su nessuno dei sedici. GSAP ne ha dieci volte meno ed e' su dodici.
**La popolarita' npm misura quante app React esistono, non cosa si usa per
vincere.** Chi sceglie lo stack dalle classifiche npm sbaglia bersaglio.

## Transizioni fra pagine

**La View Transitions API nativa non regge questi siti: zero su sedici la usano
come motore.** Supporto: same-document Chrome 111+/Safari 18+/Firefox 144+;
cross-document — quello che serve ai multipagina — Chrome 126+, Safari 18.2+,
**Firefox non lo supporta**, meta-bug Mozilla 1860854 ancora NEW senza
milestone. MDN la marca "Limited availability".

Due trappole di metodo: i reset moderni (Tailwind v4) azzerano
`view-transition-name: unset`, quindi cercare la stringa nel CSS da' **falsi
positivi**; e `startViewTransition` compare nei bundle Nuxt/Next perche' e'
codice di framework — **bundle non vuol dire uso**.

**A) La tendina piu' navigazione vera** — la piu' diffusa. Estratta dal codice
di Revelatio (3 KB): si intercetta il click su `a:not([target=_blank])`,
`gsap.to(cover, {duration:.6, autoAlpha:1, ease:'power2.inOut'})`, nel
`onComplete` **`window.location.href`** (navigazione reale, niente SPA), flag in
`sessionStorage`, la pagina nuova fa il contrario in 0,8 s. Sessanta righe,
nessun router, su Webflow.

**B) L'elemento condiviso con GSAP Flip.** `Flip.getState()` sulla card,
`Flip.from()` fino all'hero della pagina nuova. Diffuso da quando Flip e'
diventato gratuito.

**C) Il canvas che non si smonta mai.** La scena vive per tutta la sessione, il
DOM cambia sotto. **Trappola dichiarata:** durante la transizione i plane devono
staccarsi dal tracking del DOM, o il render loop sovrascrive il tween sessanta
volte al secondo.

## Cosa non si vede MAI (zero su sedici)

1. **Animazioni CSS scroll-driven** (`animation-timeline`, `view-timeline`) —
   l'argomento piu' scritto del 2026, usato da nessuno. Tutti fanno lo scroll
   in JavaScript.
2. **View Transitions API come motore.**
3. **Locomotive Scroll** — sostituito da Lenis.
4. **Framer Motion.**
5. **Google Fonts da CDN.**
6. **jQuery per animare** (c'e' su 4 siti, ma solo come runtime di Webflow).
7. **Highway.js** — ultima release aprile 2020.

## La tipografia

Trio ricorrente: **serif espressivo + grotesque neutro + monospace di
servizio**. Serif su 6 siti (Signifier, Louize Display, IvyPresto, Bodoni Book,
FK Roman, PP Editorial New). Mono su 8, **mai da solo**: sempre per etichette,
numeri, metadati. Grotesque ricorrenti: Neue Haas Grotesk, PP Neue Montreal,
Founders Grotesk, ABC Favorit, Aeonik, Geist.

**Font variabili: verificati solo 2 su 16.** L'animazione degli assi legata
allo scroll e' ben documentata come tecnica ma **non l'ho trovata in produzione
su nessun sito premiato**.

## Cinque regole

1. **Il canvas sta sotto, il testo resta HTML.**
2. **Lo scroll si interpola, non si sequestra** — e si campiona il transform a
   due altezze prima di dichiarare che l'effetto c'e'.
3. **Due gradini tipografici, non sette** — rapporto fra 6x e 14x.
4. **La transizione di pagina e' una tendina e una navigazione vera.**
5. **Si sceglie con GSAP, non con npm.**

## CORREZIONI arrivate dopo, dalle schede singole

**2xA Studio: NON usa Flip ne' ScrollSmoother.** Le occorrenze nel bundle sono
`_isFlipped` interno a GSAP e controlli difensivi dentro ScrollTrigger. Usa
GSAP 3.13 + ScrollTrigger + **Observer**, Lenis 1.3.15, Tempus, Splitting.js,
Three r184, `simplex-noise`. E non e' "8 canvas 2D invece del WebGL": sono 7 in
2D e 1 WebGL (la tendina), piu' un secondo WebGL sulla pagina About. Quello che
manca e' il canvas persistente sotto il DOM del pattern P1.

**Zajno contraddice il P1 ("il testo resta HTML").** Il titolo `ZAJNO(R)` sono
**sei texture MSDF** da 1920x728 disegnate in shader con `fwidth`+`smoothstep`.
Il display type puo' essere una texture: il pattern vale per il testo di
lettura, non per il titolone.

**Il ramo View Transitions di 2xA e' scritto bene ed e' SPENTO.** Nel bundle:
`visit.animation.native && document.startViewTransition ? ... : ...`, con la
bandiera per singola visita. Ma il default e' `native: false`, lo studio non lo
tocca, e nel CSS ci sono **zero** regole `::view-transition*`. Conferma la
regola dal lato piu' interessante: **il ramo nativo esiste e nessuno lo
accende**, perche' l'API sa fare dissolvenze e morphing, non un bordo a retino
ordinato.

## Non verificato
Le dinamiche di scroll (presenza del codice != ampiezza reale). Lo stack di
Obys. Bundle != uso (Three.js e' nel bundle di Mosby che non ha canvas attivo).
godly.website reindirizza a `recent.design` che risponde 403. Comportamento su
mobile e con `prefers-reduced-motion`: ispezionato solo a 1536 px.
