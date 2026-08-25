# Star Atlas

> **ATTENZIONE — IL SITO PREMIATO NON ESISTE PIU'.**
> `https://staratlas.com` risponde 200 ma oggi (13/08/2026) e' un altro sito:
> una pagina statica da 41 KB servita da Google Cloud Storage
> (`server: UploadServer`, `Last-Modified: Thu, 02 Jul 2026 11:41:37 GMT`),
> font Space Mono da Google Fonts, autore `ATMTA, Inc.`, titolo
> "Star Atlas | AAA Space Exploration MMO - Explore, Conquer, Earn".
> Niente WebGL, niente capitoli, niente audio: e' una landing di marketing per
> l'MMO con moduli email e link a Holosim / SAGE Labs.
> Anche la scheda studio e' sparita: `hellomonday.com/work/star-atlas` non
> esiste piu' e non risulta nemmeno negli archivi
> (`hellomonday.com/work` oggi non elenca Star Atlas).
>
> **Questa scheda e' ricostruita dal codice sorgente originale**, non da
> ricordi: snapshot Wayback `20211108211419` (5 giorni dopo il Site of the Day),
> da cui ho scaricato e letto HTML, `build/css/bundle.css`, `build/js/main.js`,
> il chunk `MainScene.6f065ea0.js` e `vendors~MainScene.83632964.js`.
> Tutto cio' che segue e' letto li' dentro salvo dove scritto.

- **URL**: `https://staratlas.com` (versione premiata: `http://web.archive.org/web/20211108211419/https://staratlas.com/`)
- **Premio**: Awwwards **Site of the Day** 03/11/2021 (voto 7.78/10 — Design 7.97, Usability 7.36, Creativity 7.96, Content 7.95; Developer Award 7.03 con Animation/Transitions 8.80 e Accessibility 5.80), poi Site of the Month, poi **Site of the Year 2021 — Users' Choice**. Fonti: [awwwards.com/sites/star-atlas](https://www.awwwards.com/sites/star-atlas), [annual-awards-2021/site-of-the-year-users-choice](https://www.awwwards.com/annual-awards-2021/site-of-the-year-users-choice), [medium.com/star-atlas](https://medium.com/star-atlas/star-atlas-wins-prestigious-site-of-the-year-award-29a732730af5)
- **Studio**: Hello Monday (studio danese-americano, oggi parte di DEPT)
- **Anno**: sito online dal 25/08/2021
- **Letto il**: 13/08/2026

---

## Cosa vende

Non vende il gioco: vende **la voglia di esserci quando uscira'**. Star Atlas
e' un MMO spaziale su blockchain Solana che nel 2021 non era giocabile, e il
sito e' un teaser navigabile che fa attraversare la galassia del gioco per
raccogliere iscrizioni alla newsletter, click su "Play Now" (il marketplace) e
download del White Paper / Economics Paper.

## A chi

Doppio compratore, e il sito serve entrambi con lo stesso oggetto:
il **giocatore** di strategici spaziali (a cui deve restare in testa "questa e'
roba AAA, non un giochino crypto") e l'**investitore in token** ATLAS/POLIS
(a cui i due PDF nel menu e la voce "Decide the future and direction of Star
Atlas" parlano direttamente). Uscendo deve pensare: dietro c'e' un mondo gia'
costruito, non una promessa.

## Idea regista

**Tutto il sito e' un unico volo di camera dentro una galassia fatta di punti**,
e lo scroll e' la manetta: 71 schermate di viaggio in linea retta lungo l'asse Z,
divise in 5 capitoli, senza mai una sezione, un bordo o un cambio pagina.

## Il momento

**L'occhio.** Al caricamento la camera e' a `z = -305` con fov 65 davanti a un
occhio umano gigante fatto di particelle (`particles/eye.drc`, 19 KB, piu' una
mesh `eye_singular.glb` con `eye_texture.jpg`), illuminato da uno `SpotLight`
che genera dei **god rays** la cui `decay` cambia in tempo reale con la distanza
del mouse dal centro dello schermo. In mezzo c'e' scritto `Click ⟡ Enter`.

Al click la camera **entra dentro la pupilla** e non ne esce piu': l'occhio si
disperde (`opacity: 0` con `power3.inOut`, `group.position.z += 90` in
`power4.inOut`), la texture dell'iride viene stirata (`repeat` da 1 a 7.5), e
mentre l'occhio si apre in avanti il `cameraWrapper` scivola a `z: 8` in 4
secondi con un dolly-zoom (fov 15 → -25). Tre secondi dopo il click compaiono
la navigazione capitoli, i titoli in basso a sinistra e il contatore in
anni luce.

E' l'istante che chiude il contratto: da li' in poi non stai leggendo un sito,
stai pilotando.

## Struttura, sezione per sezione

Non ci sono sezioni: ci sono **5 capitoli** montati su una sola timeline GSAP
lunga esattamente `1`, con lo `#ScrollSpacer` alto `7100%` (= 71 altezze di
viewport). Ogni capitolo e' un `Object3D` piazzato a `z = (n-1) * 201.0252686870402`.

| capitolo | cosa mostra (point cloud caricati) | cosa fa l'utente | durata (schermate) |
|---|---|---|---|
| **Landing** | occhio + anelli + nuvole di cluster, h1 del claim, link al trailer | clicca `Click ⟡ Enter` (hit area 50vw × 60vh al centro), oppure guarda il trailer | 0 (bloccata, lo scroll e' disabilitato finche' non entri) |
| **1 — The future of reality**<br>"A World Vast Beyond Imagining" | `planet_ships_orbit`, `pearce_ship`, `multiple_planets` | scrolla; a meta' capitolo appare il quiz **"What faction will you join?"** (Ustur / MUD / ONI); hotspot EXPLORE | **11** |
| **2 — Experience space living**<br>"Live and prosper among the stars" | `vzus` (navetta), `spacestation`, `planet_link` + `planet_link/lines` | scrolla; quiz **"Where will you take your spaceship first?"** (Combat / Dock / Light speed) | **15** |
| **3 — A booming space economy**<br>"Be part of the intergalactic prosperity" | `mining_station/new2`, `mining_station/planet`, `multiple_asteroids` | scrolla; hotspot EXPLORE che apre la galleria concept art | **15** |
| **4 — Aboard your starship**<br>"Equip your ship for deep space travel" | `capital_ship`, `calico_yacht`, `cosmonaut` | scrolla; hotspot EXPLORE | **15** |
| **5 — Your Intergalactic Future Awaits**<br>"Live the freedom of the metaverse" | `ustur/face`, `ustur`, `council_of_peace` | scrolla fino al volto dell'androide Ustur che riempie lo schermo | **15** |
| **EndScreen** | "Your interstellar adventure awaits" + due bottoni + trailer | clicca Play Now / Visit the showroom | in coda al capitolo 5 |

Sopra tutto, sempre presenti (dentro `#StickyOverlay`, `position: sticky`):
`.ExploreNav` (indice capitoli a destra), `.ChapterPOIs` (titolo+testo in basso
a sinistra), `.ScrollTimer` (anni luce in basso a sinistra), `.SoundMute` e
"Watch the Trailer" in basso a destra, burger menu in alto a sinistra.

## L'esperienza in ordine di tempo

**Prima del secondo 0** — schermo `#f1eae1` con il logo Star Atlas a triangolo
(SVG `#D5D2D1`) e la scritta `LOADING`. Non e' una barra finta: il `LoadManager`
sta scaricando **tutti** i point cloud di **tutti** i capitoli (≈2,6 MB di `.drc`)
e decomprimendoli con il decoder Draco in WASM. Finche' non finiscono tutti,
`loadDone()` non parte.

**0.0 s (a caricamento finito)** — la camera si posiziona a `z = -305`, fov 65.
Parte `playLoadDoneIntroAnimation()`: l'occhio si compone, e in parallelo la
camera fa `zoom` da +2 a 1 in 3 s (`power3.inOut`) e scivola da `z: -300` a
`z: -305` in 4 s. Il div `#Loading` viene **rimosso dal DOM** a fine timeline.

**~0–4 s** — l'occhio respira: c'e' un tween infinito `ambientValue 0→1` in 4 s
`sine.inOut` `yoyo`, e i god rays pulsano. Il mouse muove la camera
(`mouseMoveAmount = 0.2`) e il punto di mira (`mousePanAmount = 5`) in senso
opposto: parallasse.

**In attesa del click** — sopra l'occhio: l'h1 `A grand strategy game of space
exploration, territorial conquest, political domination, and more.`, il menu di
pagina in basso a sinistra, la card del trailer in basso a destra, e al centro
`Click ⟡ Enter`. Il rombo e la scritta **inseguono il mouse con inerzia
diversa** (0.15 il rombo grande, 0.3 la scritta) tramite `gsap.quickSetter`.

**click + 0.0 s** — l'audio ambientale `landing_ambient.mp3` (997 KB, loop)
viene abilitato: e' agganciato al gesto utente, non parte da solo. Trailer e
menu di landing sfumano in 0.4 s.

**click + 0.0 → 4.0 s** — volo dentro l'occhio (vedi *Il momento*).

**click + 3.0 → 5.0 s** — entrano in dissolvenza (2 s ciascuna, tutte insieme):
`.ExploreNav`, `.ChapterPOIs`, `.BottomBar-right`, `.ScrollTimer`. La classe
`darkMenu` viene tolta dall'`<html>` a 2.8 s.

**click + 4.0 → 6.5 s** — il titolo del capitolo 1 si dissolve verso lo sfondo
(`chapterIntroClass.timeline` da 1 a 0 in 2.5 s `sine.inOut`).

**click + 6.0 s** — appare `.ScrollHelpIndicator` (la freccia "SCROLL" in basso
al centro, con una linea tratteggiata). Fine timeline → `enableScroll()`:
solo **adesso** lo `#ScrollSpacer` prende altezza `7100%` e ScrollTrigger fa
`refresh()`.

**Da qui in poi (71 schermate)** — un unico `gsap.timeline` con
`scrollTrigger: { scrub: 1, start: "0%", end: "100%" }` (scrub 1 secondo su
desktop, 0.1 su touch) pilota tutto: posizioni, rotazioni e **uniform degli
shader** di ogni oggetto, i 7 dolly-zoom, i titoli capitolo, i POI, la barra
laterale, e il contatore anni luce che sale di `+=1001` da `622107.238`.

## Animazioni

| elemento | cosa si muove | legato a | curva / inerzia | note |
|---|---|---|---|---|
| Camera principale | `cameraWrapper.position.z`, `fov`, `zoom` | scroll (master timeline, scrub 1s) | `power1.inOut`, `power3.inOut`, `power4.inOut` | 7 istanze `dollyZoom` per capitolo, es. `update(110,100,15)`, `update(55,3,110)`: fov e distanza si compensano per il vertigo effect |
| Camera, micro-movimento | `camera.position.x/y` + `cameraLookAtPoint` opposto | mouse (per frame, non scroll) | inerzia esponenziale `1 - (1-speed)^deltaRatio` | ampiezze `mouseMoveAmount` 0.2 → 2 dopo l'intro, `mousePanAmount` 5 → 2 |
| Ogni oggetto (navi, pianeti, asteroidi, volti) | posizione, rotazione **e uniform** `focusNear/focusFar/maxBlur/maxOpacity` | scroll | `power1/2/3/4`, `sine`, piu' una `CustomEase("custom", "M0,0 C0.632,0.674 0.656,0.708 0.786,0.854 0.852,0.928 0.918,1 1,1")` | il "fuoco" e' animato come una vera messa a fuoco cinematografica |
| Punti fuori fuoco | `gl_PointSize` cresce e `alpha` cala | shader, guidato dallo scroll | `smoothstep` | vedi *Tre cose da rubare* |
| Anelli di capitolo | 15 anelli `z` da 20 a -130, rotazione `z` fino a π | scroll + tempo (`repeat: -1`, durata 50→200 s) | `none` (lineare) | colore `#080202` |
| ClusterCloud (nebulose di fondo) | rotazione `z` 2π in 200 s, `z -= 508.7` in 100 s | tempo, infinito | `none` | 3 copie per capitolo, riciclate |
| Titoli capitolo (`.ChapterIntro h1`) | i caratteri passano da sfocati a nitidi | scroll | `quad.inOut`, stagger `{each: .1, from: "edges", grid: "auto", ease: "power2.inOut"}` | **GSAP SplitText**: due `<h1>` sovrapposti, uno spezzato in char con classe `.blurCharacter` (CSS `filter: blur(10px)`) e uno nitido; si scambiano char per char partendo dai bordi verso il centro, con anche un `x: 30 → 0` |
| POI (`.ChapterPOIs div`) | `y: 80 → 0`, `opacity` 0→1→0 | scroll | `power3.out` / `sine.out` | entra nel primo 35% del suo slot, esce all'80% |
| `.ExploreNav` | linee che si allungano, rombi che si aprono, numero che compare | scroll (timeline dedicata sincronizzata alle lunghezze dei capitoli) | `sine.inOut` | il rombo interno scala a 0.2 e sparisce all'hover, lasciando il numero |
| Bottone EXPLORE | segue in 2D un `Object3D` proiettato dalla camera | per frame | `gsap.quickSetter` su x/y in px | se il punto esce dal `Frustum` viene spostato a `-1000px` invece di essere nascosto |
| Quiz `.MakeChoice` | tre immagini composite si separano (`xPercent ±3`, o ±15/±20 sul secondo quiz) e appare l'immagine singola + descrizione | hover mouse | `power4.out`, 0.9–1.2 s | vedi *Mobile*: e' legato solo a `mouseover`/`mouseout` |
| Galleria concept art | slide trascinabili con snap | drag | **GSAP Draggable + InertiaPlugin** | `snap.x` calcolato, `onThrowComplete` riapre la didascalia |
| Grana su tutto | rumore animato in `MULTIPLY`, opacita' 0.1 | per frame | — | `NoiseEffect` della libreria `postprocessing` |
| God rays dell'occhio | `decay` 0.88 + 0.05·(1 − distanza mouse dal centro) | mouse | — | `GodRaysEffect` (density .8, decay .9, weight .7, exposure .9, 35 samples, height 480) |
| Contatore anni luce | numero che sale di 1001 | scroll | `none` | `font-feature-settings: "tnum"` + `contain: content` per non far ricalcolare il layout ad ogni frame |

Librerie riconosciute nel codice: **GSAP 3.7.1** con **ScrollTrigger 3.7.1**,
**ScrollToPlugin**, **SplitText**, **CustomEase**, **Draggable**, **InertiaPlugin**;
**three.js** (r131) con `GLTFLoader` + `DRACOLoader` (wasm) + `KHR_texture_basisu`;
**postprocessing** (EffectComposer / GodRaysEffect / NoiseEffect / SMAA);
**lazysizes**; **video.js**.

## Colori

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo 3D (colore della scena three.js) | `#f1eae1` | `scene.background = new Color(15854305)`; identico allo sfondo di `#Loading` |
| fondo pagina | `#f5f1eb` | `html { background-color }` — sabbia leggermente piu' fredda del fondo 3D |
| testo base | `#2f2425` | `body { color }` |
| accento primario (rosso-arancio) | `#f93c04` | occhiello dei capitoli, hover nell'indice, icona chiusura menu |
| accento, varianti | `#fa3b02` `#fa3a00` `#f53a02` | freccia ScrollTimer, cerchio del numero capitolo, rombi |
| accento freddo | `#322fb3` | rombo di `Click ⟡ Enter`, triangolo play del trailer, bullet del menu |
| blu profondo | `#00335b` | voci del menu di landing |
| blu del claim | `#102434` | `h1` della landing |
| titoli scuri | `#16171b` / `#231f20` | `h1` dei capitoli, `h2` dei POI e dei quiz |
| testo secondario | `#78746d` | paragrafi dei POI e delle descrizioni |
| testo terziario | `rgba(58,48,43,.8)` / `rgba(58,48,43,.6)` | etichette indice capitoli, ScrollTimer |
| bordi e filetti | `#d8d4ce` `#dcd8d2` `#d0ccc8` | linee dei quiz, bordo del bottone "with-borders" |
| logo | `#17181d` | SVG del wordmark |
| anelli 3D | `#080202` | `new Color(524802)` |
| fondo galleria (unica superficie scura) | `#141313` | `#LandingGallery` + gradiente sulla didascalia |
| fondo menu / loading SVG | `#D5D2D1` e `#CFCDCB` | logo a triangolo e tratteggio |
| cookie bar | `#392526` su testo `#fff` | unica UI a contrasto invertito |
| bianco | `#ffffff` | bottone `.ButtonCta.gradient` (gradiente `rgba(245,241,235,0) → #fff 36%`) |

L'intera pagina ha una texture di grana applicata via `.bgNoise { background-image: url(data:...) }`
piu' il `NoiseEffect` sul canvas.

## Tipografia

Due famiglie sole. **Roobert** per tutto cio' che si legge, **Rogan** per tutto
cio' che si etichetta (sempre maiuscolo, sempre con letter-spacing largo).

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| base | Roobert | 400 | 14px | — | `body, html` |
| h1 landing | Roobert | 300 (il `<b>` e' 500) | 20 → 24px | 1.4 → 1.33 | colore `#102434`; il grassetto e' solo su "A grand strategy game of space exploration," |
| h1 capitolo | Roobert | 300 | fluido `calc(9.09091vw - 4.09091px)` → `calc(2.22222vw + 21.66667px)`, cap **59px** | fluido fino a **72px** | `letter-spacing: -.02em`, colore `#16171b` |
| occhiello capitolo | Rogan | 700 | 9 → 15px | 12px | maiuscolo, `letter-spacing: .2em`, colore `#f93c04` |
| numero capitolo | Rogan | 700 | 12 → 18px | — | dentro un cerchio 44 → 50px con anello `#fa3a00`, `font-variant-numeric: tabular-nums` |
| h2 dei POI | Roobert | 300 | 20 → 31px (fluido) | 27px | `#231f20` |
| p dei POI | Roobert | 400 | 11 → 16px (fluido) | 17px | `letter-spacing: .03em`, `#78746d` |
| h2 quiz | Roobert | 400 | 16 → 22px | 24 → 30px | `letter-spacing: .02em` |
| h3 / p quiz | Roobert | 400 | 14px | 1.429 | `letter-spacing: .04em`, `#39352d` / `#78746d` |
| h2 finale | Roobert | 300 | 27 → 35px (fluido) | 32px | |
| p finale | Roobert | 400 | 14 → 19px (fluido) | 18px | `rgba(22,23,27,.7)` |
| bottoni | Rogan | 700 | 11 → 12px | — | maiuscolo, `letter-spacing: .2em`, altezza 50 → 54px |
| etichette indice / ScrollTimer | Rogan | 700 | 9 → 12px | — | maiuscolo, `tnum` |
| galleria | Roobert | 400 | h3 20 → 22px, p 15 → 16px | 28 / 22px | su fondo scuro, p a `opacity: .72` |

**Come sono serviti**: **nessuna richiesta di rete per i font**. Cinque `@font-face`
(Roobert 300/400/500, Rogan 600/700) sono **woff2 incorporati come data-URI base64
dentro `bundle.css`**. E' il motivo per cui il CSS pesa 473 KB non compresso
(195 KB in gzip): sono font pagati per intero al primo byte, ma zero FOUT e zero
round-trip. Nessun font variabile.

I corpi non usano `clamp()`: usano vecchie `calc(Xvw + Ypx)` incastonate in
media query `min-width` a cascata (320 / 375 / 640 / 768 / 1024 / 1200 / 1680),
con anche condizioni su `min-height`.

## Testi veri

**Claim (h1 di landing)**
> A grand strategy game of **space exploration,** territorial conquest, political domination, and more.

**Meta description**
> A grand strategy game of space exploration, territorial conquest, political domination, and more.

**Invito all'ingresso**
> Click ⟡ Enter

**Titoli dei 5 capitoli** (occhiello / titolo)
> 1 · The future of reality — *A World Vast Beyond Imagining*
> 2 · Experience space living — *Live and prosper among the stars*
> 3 · A booming space economy — *Be part of the intergalactic prosperity*
> 4 · Aboard your starship — *Equip your ship for deep space travel*
> 5 · Your Intergalactic Future Awaits — *Live the freedom of the metaverse*

**I dieci POI, in ordine di scroll**
> **Depths of the universe** — Immerse yourself in the spectacular living metaverse and experience the future.
> **Space technology of tomorrow** — Fly your state-of-the-art spaceship equipped with 27th century technology to wherever your heart desires.
> **A universe of opportunities** — Build your fortune in your home in space.
> **Explore and conquer** — Expand into space and be rewarded for your effort.
> **Mining Town** — Resource-rich areas are hubs of economic activity.
> **The Marketplace** — Buy and sell your resources and services on the Star Atlas marketplace, both in and outside the game.
> **Calico Ship Manufacturer** — Calico starships have the reputation of being a perfect home away from home, offering all bells and whistles a ship could offer while retaining a very familiar, human design.
> **The Crew Quarters** — Catch a breath in the relaxing ambiance of crew quarters. With your favorite ReBirth meta-poster on the wall, the space comes alive with colors and an electronic beat breathed into it.
> **Player character customization** — Choose between different signature styles for your character.
> **Decide the future and direction of Star Atlas** — Through holding the Star Atlas governance token POLIS, you will have a say in the fate of the metaverse and the rules governing it.

**Quiz 1**
> What faction will you join? / Join one of three main in-game factions.
> **Ustur Sector** — A collective of sentient androids.
> **MUD Territory** — A territory governed by humankind.
> **ONI Region** — A consortium of alien species.

**Quiz 2**
> Where will you take your spaceship first? / Set a course for your adventure
> **Engage in combat** — Engage enemies in open space to win untold riches.
> **Dock at the space station** — Explore the ONI Central Station, your home away from home.
> **Travel at the speed of light** — Turn on next-gen warp drive and experience interstellar travel.

**Schermata finale**
> Your interstellar adventure awaits
> A grand strategy game of space exploration, territorial conquest, political domination, and more.
> [Play Now] [Visit the showroom]

**Menu principale (burger)**
> 01 Experience · 02 Showroom · 03 News & Info · 04 Partners · 05 Team · 06 Contact
> White Paper • PDF — *Read Our Official White Paper!*
> Economics Paper • PDF — *Learn the tokenomics of ATLAS and POLIS in the galactic economy.*
> Sign up to our monthly Newsletter — placeholder `email@example.com` — [Subscribe]
> A message has been sent to confirm your email address.
> Terms of Service · Privacy Policy

**Chiamate all'azione**: `Play Now` (verso `play.staratlas.com`, presente in
alto a destra, nel menu e in fondo), `Visit the showroom`, `Watch the Trailer`,
`Subscribe`, `Accept Cookies`.

**Barra cookie**
> We use cookies to enhance your experience and analyze our site usage. Please see our Privacy Policy for more information.

**Etichette di sistema**: `LOADING`, `EXPLORE`, `LIGHTYEAR` (accanto al numero
`622107.238`), `Prev` / `Next` nella galleria.

## Mobile

Il sito **non ha una versione mobile alternativa**: `MainScene` viene importata
senza nessun controllo di dispositivo (`Promise.all([e(3), e(0)])` dentro il
costruttore di `HomeTemplate`), quindi il telefono scarica gli stessi 2,6 MB di
point cloud e fa girare lo stesso WebGL. Cambiano invece **la resa, l'inerzia e
tutto cio' che dipende dal puntatore**.

**Cosa SPARISCE**
- **Il menu di pagina in basso a sinistra** (`Experience / Showroom / News & Info / Partners / Team / Contact`): `display: none` sotto `768px × 768px`. Resta solo il burger in alto.
- **I nomi dei capitoli nell'indice laterale**: sono dentro `@media (hover:hover)` → su touch non compaiono **mai**. Restano solo i rombi e i numeri, rimpiccioliti da 12px a 9px.
- **La parola "Watch the Trailer" in basso a destra**: `display: none` sotto 768×768, resta solo il triangolino.
- **La scritta "LIGHTYEAR" accanto al contatore**: solo da 768×768 in su. E il contatore intero sparisce sotto i 480px di altezza, o se il browser non supporta `contain: content` (in quel caso l'elemento viene proprio rimosso dal DOM).
- **Il filetto 40×2px sopra i POI**: solo da 400×600 in su.
- **Tutti i `<br>` dei testi dei quiz e della schermata finale**: `display: none` sotto 768×768, il testo va a capo da solo.
- **L'antialiasing**: il renderer nasce con `antialias: false` quando gli effetti sono attivi (vale ovunque, non solo mobile) — l'antialias e' fatto in post con SMAA.

**Cosa viene SOSTITUITO**
- **Il trailer**: la card con la thumbnail in basso a destra viene sostituita da un link testuale `▶ Watch the Trailer` sotto l'h1 (`.MobileTrailerLink`, visibile solo sotto 768×768).
- **L'inerzia dello scroll**: `SCRUB_DURATION = IS_TOUCH_DEVICE ? 0.1 : 1`. Su desktop la scena insegue lo scroll con un secondo di ritardo elastico; su touch e' praticamente istantanea. E' la scelta piu' importante di tutta la scheda: la stessa animazione con scrub 1 su un dito sembra rotta.
- **La densita' di pixel**: `RENDERER_PIXEL_RATIO = Math.min(devicePixelRatio, IS_IOS ? 2 : 1)`. Su iOS si arriva a 2×, su **Android e su desktop si renderizza sempre a 1×** qualunque sia lo schermo. Il `PIXEL_RATIO` entra anche nello shader per dimensionare i punti.
- **L'indicatore di scroll**: con `html.is-touch` compare una variante `.TouchScroll` al posto della freccia desktop.
- **Il trascinamento della galleria**: su Android il `trigger` del Draggable e' il contenitore delle immagini, altrove e' tutto il layer (`m.a.IS_ANDROID ? this.imageContainer : this.container`).

**Cosa RESTA**
- Tutta la scena 3D, tutti i 5 capitoli, le 71 schermate, l'audio, la galleria, i god rays, la grana.
- I titoli capitolo con l'effetto sfocato→nitido (e' CSS `filter`, non dipende dal puntatore).
- La parallasse del mouse diventa semplicemente inerte (su touch `MouseMoveTracker` resta al centro): la camera perde il micro-movimento ma non si rompe nulla.

**Un buco vero**: i due quiz (`What faction will you join?`, `Where will you
take your spaceship first?`) sono agganciati **solo** a `mouseover`/`mouseout`
sui tre bottoni. Non c'e' nessun `touchstart`, nessun `click`, nessun fallback
temporizzato. Su touch il quiz resta l'immagine composita e le tre descrizioni
non si rivelano, salvo il `mouseover` sintetico che iOS Safari emette al primo
tap. Non l'ho potuto verificare eseguendolo (vedi *Non verificato*), ma nel
codice il ramo touch non esiste.

Nota di impianto: `<meta viewport ... user-scalable=no>` — lo zoom e' disabilitato.

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| Struttura pagina | **HTML servito dal server, non SPA** — template PHP/simile con `<!-- inject:html -->`, poi un `TemplateManager` in JS che scambia i `.template` | **VERIFICATO** | il markup completo (menu, POI, quiz, titoli capitolo) e' **tutto nell'HTML** dello snapshot, non generato in JS |
| Bundler | webpack 4 (runtime `webpackJsonp`, chunk `MainScene` / `VideoJSPlayer` / `vendors~*`, `publicPath: "/build/js/"`) | **VERIFICATO** | runtime del bundle in chiaro |
| Animazione | **GSAP 3.7.1** + ScrollTrigger 3.7.1, ScrollToPlugin, SplitText, CustomEase, Draggable, InertiaPlugin | **VERIFICATO** | banner di licenza `* ScrollTrigger 3.7.1 * https://greensock.com` dentro `main.js`; i plugin dai nomi di classe e dalle API usate |
| Scroll | ScrollTrigger con `scroller: #App` (contenitore `overflow-y: scroll`, `overscroll-behavior: contain`) e un `#ScrollSpacer` alto 7100%; overlay in `position: sticky`. Nessuno smooth-scroll di libreria (niente Lenis/Locomotive) | **VERIFICATO** | `USE_STICKY = true`, `ScrollTrigger.defaults({scroller: AppContainer, trigger: ScrollSpacer})`; la morbidezza viene solo da `scrub: 1` |
| 3D | **three.js r131** — `WebGLRenderer` con `antialias/stencil/depth: false` e `powerPreference: "high-performance"`, `PerspectiveCamera(65, ratio, 1, 200)` | VERIFICATO (la revisione **r131** e' dedotta dalla costante `REVISION` nel chunk: probabile, non stampata in chiaro) | `vendors~MainScene.83632964.js` contiene l'export completo di three |
| Geometria | **point cloud compressi Draco** (`.drc`) decodificati in **WASM** (`libs/draco/draco_decoder.wasm`), con attributi custom `position` + `color` + `size`; una sola mesh vera (`eye_singular.glb`) | **VERIFICATO** | `DRACOLoader.setDecoderConfig({type:"wasm"})`, `taskConfig.attributeIDs = {position:"POSITION", color:"COLOR", size:"GENERIC"}` |
| Shader | `ShaderMaterial` custom **DOFPointsMaterial** con uniform `focusNear/focusFar/focusFadeOutLength/minBlur/maxBlur/minOpacity/maxOpacity/radiusScaleFactor/PIXEL_RATIO/viewport` | **VERIFICATO** | sorgente GLSL (con i commenti dell'autore) in chiaro nel chunk |
| Post-processing | libreria **`postprocessing`** (vanruesc): `EffectComposer`, `RenderPass`, `GodRaysEffect` (height 480, density .8, decay .9, weight .7, exposure .9, 35 samples), `NoiseEffect` in `MULTIPLY` opacita' 0.1, SMAA | **VERIFICATO** | nomi ed API nel chunk |
| Ordinamento trasparenze | ri-ordinamento manuale degli indici dei punti per profondita' rispetto alla camera, poi `geometry.toNonIndexed()` | **VERIFICATO** | funzione `sortPointsData()` |
| Video | **video.js** in chunk separato + sorgenti **Vimeo** (HLS `.m3u8` + MP4 fino a 4K, 15 lingue di sottotitoli) | **VERIFICATO** | `player.vimeo.com/external/591652085...`, `<track>` en/tr/pl/zh/ar/hi/it/ko/fr/pt-BR/es/ru/ja/nl/de |
| Immagini | **Contentful** (`images.ctfassets.net/2kg7h835bpe1/...` con `?w=&h=&fm=&q=&fit=fill`), `<picture>` con sorgente WebP + fallback, lazy con **lazysizes** | **VERIFICATO** | URL e classi `lazyload` nell'HTML |
| CMS | **Contentful** (lo space id `2kg7h835bpe1` compare in tutte le immagini) | **VERIFICATO** (che sia il CMS di tutto il sito e non solo delle immagini: SUPPOSTO) | vedi sopra |
| Font | Roobert e Rogan **self-hosted, woff2 in base64 dentro il CSS** | **VERIFICATO** | cinque `@font-face` con `src: url("data:font/woff2;base64,...")` |
| Audio | `<audio>` HTML nativo, `landing_ambient.mp3` in loop, attivato al click | **VERIFICATO** | markup + `AmbientAudio` class |
| Analytics / errori | Google Analytics 4 `G-45GKDW0P4G` (con `client_storage: 'none'` e `anonymize_ip`), Facebook Pixel `981266265778161`, **Bugsnag** (da CloudFront), **Signalfox** (`signalfoxv2.js`, appId `248d43d3-...`) | **VERIFICATO** | script inline nell'`<head>` |
| Hosting | non verificato | — | lo snapshot Wayback non conserva gli header di risposta originali |

## Peso e prestazioni

Misure prese sui file reali dello snapshot 08/11/2021 (dimensione trasferita = come li serviva il server, in gzip; dimensione a riposo = dopo decompressione).

| risorsa | trasferita | a riposo |
|---|---|---|
| HTML della home | 18,4 KB | 66,6 KB |
| `build/css/bundle.css` | **194,7 KB** | 473,2 KB (di cui la stragrande maggioranza sono i 5 font in base64) |
| `build/js/main.js` | 71,5 KB | 207,0 KB |
| `vendors~MainScene.js` (three + postprocessing) | **276,4 KB** | 927,2 KB |
| `MainScene.js` (la scena vera) | 19,4 KB | 100,4 KB |
| `vendors~VideoJSPlayer.js` + `VideoJSPlayer.js` | 145,9 KB | — (caricati **anche in home**, non solo all'apertura del trailer) |
| **totale codice** | **≈726 KB** | ≈1,9 MB |

Point cloud (gia' compressi Draco, scaricati **tutti** prima di poter entrare):

| file | byte | | file | byte |
|---|---:|---|---|---:|
| `multiple_asteroids/0.drc` | 269.378 | | `pearce_ship/pearce.drc` | 163.327 |
| `ustur/new/0.drc` | 243.192 | | `council_of_peace/0.drc` | 162.394 |
| `multiple_planets/0.drc` | 220.174 | | `spacestation/0.drc` | 126.202 |
| `planet_ships_orbit/0.drc` | 220.074 | | `cosmonaut/0.drc` | 123.744 |
| `mining_station/planet/0.drc` | 219.715 | | `planet_link/0.drc` | 104.775 |
| `capital_ship/0.drc` | 217.343 | | `calico_yacht/new/0.drc` | 100.510 |
| `ustur/face/0.drc` | 196.098 | | `vzus/0.drc` | 99.358 |
| `mining_station/new2/0.drc` | 85.533 | | `eye.drc` | 19.123 |
| `clusters/0.drc` | 13.269 | | `planet_link/lines.drc` | 2.104 |
| | | | **TOTALE** | **2.586.313 (≈2,59 MB)** |

Altri asset: `eye_texture.jpg` 136,8 KB, `eye_singular.glb` 26,3 KB,
`landing_ambient.mp3` **997,9 KB** (caricato dopo, in `loadDone`), piu' il
decoder Draco in WASM e due PNG di 32×32 px per i punti.

**Peso per vedere il primo pixel interattivo: ≈3,45 MB**, tutto obbligatorio,
niente streaming per capitolo. E' la scelta piu' costosa del progetto: una
schermata `LOADING` lunga in cambio di un volo che non si ferma mai. Sopra ai
3,45 MB, il primo secondo di audio ne aggiunge quasi 1.

**Numeri che non ho**: tempi reali di caricamento, FPS, LCP/TTI, punteggi
Lighthouse. Non c'e' un case study tecnico pubblico e non ho eseguito il sito.
L'unico voto pubblico e' quello Awwwards: 7.78/10 complessivo, **Accessibility 5.80**
— coerente con `user-scalable=no`, testi in `<canvas>` inesistenti e
interazioni chiave legate all'hover.

## Tre cose da rubare

**1. La sfocatura falsa che costa zero: DOF nello shader dei punti.**
Non c'e' nessun pass di depth-of-field. Nel vertex shader, ogni punto misura la
propria distanza dalla camera contro `focusNear`/`focusFar` con due `smoothstep`;
piu' e' fuori fuoco, piu' **cresce** (`gl_PointSize` interpolato tra `minBlur` e
`maxBlur`) e piu' diventa **trasparente**. Nel fragment shader si mescolano due
sprite 32×32 — un cerchio pieno e un cerchio sfumato — con lo stesso fattore:
a fuoco e' un puntino netto, fuori fuoco e' un alone. E c'e' il trucco di
performance esplicito nei commenti dell'autore:

```glsl
if (vAlpha < 0.0001) {
    // This makes the GPU cull the vertex, increasing performance for non-visible points:
    gl_PointSize = 0.0;
    gl_Position.z = 0.0;
}
```

Rifacibile su qualunque `THREE.Points`. Ti da' profondita' cinematografica su
centinaia di migliaia di punti senza un solo pass di post-processing, e i
parametri di fuoco sono normali proprieta' animabili con GSAP — cioe' **puoi
mettere la messa a fuoco sulla timeline dello scroll**.

**2. Il titolo che entra a fuoco, con la stessa grammatica della scena.**
Due `<h1>` identici sovrapposti: uno spezzato in caratteri con SplitText e
classe `.blurCharacter` (`filter: blur(10px)` sullo `<span>` interno), l'altro
nitido. Sullo scroll si scambiano carattere per carattere con
`stagger: { each: .1, from: "edges", grid: "auto", ease: "power2.inOut" }`,
piu' un `x: 30 → 0`. Il testo si "mette a fuoco" dai bordi verso il centro,
esattamente come i punti 3D dietro. E' la ragione per cui il sito sembra una
cosa sola e non un canvas con del testo appoggiato sopra: **lo stesso verbo
visivo — la messa a fuoco — governa il 3D e la tipografia.**

**3. L'hotspot 3D proiettato in 2D, con il taglio del frustum.**
Il bottone `EXPLORE` e' un `<div>` HTML normale. Ogni frame prende un
`Object3D` invisibile ancorato alla scena, lo proietta in coordinate schermo
(`Frustum.setFromProjectionMatrix` → `pos.project(camera)` → `x*halfW+halfW`),
e lo posiziona con `gsap.quickSetter(el, "x", "px")` — che scrive direttamente
la trasformazione senza creare tween. Se il punto **non e' dentro il frustum**
non lo nasconde con `display` o `opacity`: lo butta a `-1000px`. Niente
reflow, niente `visibility` che ritorna a costare, e il click al centro apre
una galleria di concept art i cui titoli e didascalie stanno gia' nell'HTML
come `data-explore-titles` / `data-explore-descriptions` separati da `|||`
(indicizzabili, e disponibili anche se il WebGL non parte).

## Non verificato

- **Non ho mai visto il sito in funzione.** Vietato l'uso del browser condiviso e la versione premiata non e' piu' online: tutto viene dalla lettura di HTML, CSS e JavaScript archiviati. Le sequenze temporali sono ricostruite dai valori di `duration`/`delay` delle timeline, non cronometrate.
- **La revisione di three.js (r131)** e' dedotta dal valore della costante `REVISION` nel bundle minificato, non da una stringa in chiaro.
- **Numero di punti per modello, e quindi il carico reale sulla GPU**: i `.drc` sono compressi e non li ho decodificati.
- **Comportamento reale dei due quiz su touch**: nel codice ci sono solo `mouseover`/`mouseout`. Se iOS Safari emetta il `mouseover` sintetico su questi specifici elementi non l'ho potuto provare.
- **Hosting e CDN del 2021**: lo snapshot Wayback non conserva gli header originali.
- **Prestazioni misurate** (tempo di caricamento, FPS, Core Web Vitals, Lighthouse): nessun dato pubblico trovato, nessuna esecuzione possibile.
- **Le altre pagine** (`/showroom`, `/newsroom`, `/team`, `/partners`, `/contact`) esistono negli archivi ma non le ho analizzate: questa scheda copre la home, cioe' l'esperienza premiata.
- **Case study dello studio**: non esiste (piu'). `hellomonday.com/work/star-atlas` da' 404 e non e' archiviato; la pagina DEPT `deptagency.com/en-uki/case/an-immersive-metaverse-gaming-experience/` oggi da' 404. Le poche frasi di contesto vengono dal comunicato di Star Atlas su Medium — dove pero' il riferimento a **Unreal Engine 5 / Nanite riguarda il gioco, non il sito**: il sito e' three.js, non ha niente a che vedere con UE5.
- **Foundry e licenza dei font Roobert e Rogan**: non verificate.
