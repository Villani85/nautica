# TRIONN

- **URL**: https://trionn.com
- **Premio**: Awwwards **Site of the Day** del 27/07/2026, punteggio 7.42 (design 7.40, usability 7.15, creativity 7.77, content 7.63) + **Developer Award** 7.05. Fonte: https://www.awwwards.com/sites/trionn-2 . La pagina /about del sito dichiara anche: Awwwards Honorable Mention x4, The FWA "FWA of the day" x1, CSS Design Awards WOTD x2 / Special Kudos x2 / UI-UX-INN x2, Orpetron SOTM x1 + SOTD x2 + WDA x2, **GSAP Site of the week x1 + Site of the Day x1**, CSS Winner SOTD x3, Codrops Featured x2, Muzli x1.
- **Studio**: TRIONN (marchio "TRIONN®"), studio indipendente. Sede dichiarata nello schema JSON-LD: "216-4Plus Complex, Astron Chowk, Rajkot, Gujarat, India". Founder & CEO: **Sunny Rathod** (giurato Awwwards, https://www.awwwards.com/jury/sunny-rathod/). Team dichiarato 20+ persone.
- **Anno**: sito attivo 2026; la build servita ha `Last-Modified: Thu, 13 Aug 2026 07:47:01 GMT` e `sitemap.xml` con `lastmod 2026-08-13`. Lo studio dichiara "Est. 2012 - 14+ years shaping digital direction".
- **Letto il**: 13/08/2026

---

## Cosa vende

Tempo di uno studio di design e sviluppo: siti premium, prodotti digitali con AI dentro, branding e "sistemi" front-end animati (WebGL/GSAP). Il sito e' contemporaneamente il portfolio e la demo tecnica: il prodotto venduto e' *la capacita' di costruire questo tipo di sito*.

Prezzi impliciti dal form contatti: fasce "Under $5K / $5K-$15K / $15K-$30K / $30K-$60K / $60K+".

## A chi

Committenti internazionali (le testimonianze sono USA e UAE) e agenzie che subappaltano: fondatori di startup e prodotti B2B/SaaS, brand che vogliono un sito "da premio". Uscendo dal sito il compratore deve pensare due cose insieme: (1) "questi sanno fare cose che il mio fornitore attuale non sa fare"; (2) "sono un partner strutturato, non un freelance" - da qui i numeri (1.5K+ progetti, 50+ premi, 20+ persone, 14 anni), i loghi dei partner e le testimonianze video.

## Idea regista

Un unico simbolo 3D metallico (la T di TRIONN) che vive dentro un fondo quasi nero, si scompone e si ricompone, e tre "linee di saldatura" che attraversano la pagina: tutto il sito e' fatto di **fasce orizzontali che si chiudono come una serranda** per passare da una scena all'altra, e di testo che entra e esce a fuoco (blur).

## Il momento

Dentro la sequenza bloccata `#trionn-services` (dopo il portfolio orizzontale): le quattro parole gigantesche **"A.I. / Design / Development / Branding"** vengono lette lettera per lettera con `Range.getBoundingClientRect()`, sostituite da altrettanti `<span>` assoluti in un contenitore `position:fixed; z-index:999; mix-blend-mode:difference`, e **fatte esplodere**. Ogni carattere vola in una direzione casuale ruotando su X/Y/Z, tranne 2-3 caratteri "eroe" estratti a sorte che convergono al centro dello schermo ingrandendosi 6-10 volte. L'esplosione e' scrubbata: cade fra progresso 0.35 e 0.53 della sequenza (quindi si puo' riavvolgere con lo scroll indietro).

Secondo momento, sulla prima schermata: la scritta **"hold to [icona] blast"**. Tenendo premuto il mouse, dopo 0.5 s il simbolo 3D si frantuma nei suoi shard, parte un suono di vetro rotto + un loop "woosh", e **anche gli elementi HTML della pagina** (`#nav`, `#s1-headline`, `#s1-sub`, `#s1-scroll`, `#s1-stats`, `#s1-box`, `#s1-cta`) vengono scossi via `transform: perspective(600px) translate(...) rotateX/Y/Z(...)` scritto a mano ogni frame.

## Struttura, sezione per sezione

Homepage. La colonna "durata" e' calcolata dai valori di `end` dei ScrollTrigger, non misurata a mano.

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |
|---|---|---|---|
| Preloader (`.pl-overlay`) | 4 "+" volano dagli angoli al centro, si forma un riquadro, le 3 aste della T si montano in 3D, contatore a 3 cifre stile slot, tagline "Inspire - Innovate - Impact"; poi il riquadro si espande a schermo intero passando da #D2D2D2 a #000 | nulla, scroll bloccato (`overflow:hidden` + preventDefault su wheel/touch/keydown) | ~3.5-4 s |
| `#hero-section` / `.main-banner` | canvas Three.js a schermo intero con la T estrusa metallica + 3 linee curve disegnate su canvas 2D; sopra, in `mix-blend-difference`, il titolo "Designed to mean something." | muove il mouse (parallasse + hover che fa lampeggiare gli shard), passa sulle linee (scintille + suono), **tiene premuto** (esplosione) | ~1 schermata; l'esplosione legata allo scroll finisce a ~1.2 vh e si ricompone entro 1.8 vh |
| `.home-about` | occhiello "about" + paragrafo grande che si **accende lettera per lettera** in scrub, riga orizzontale con "+", claim + CTA "more about us" | scorre | ~1 |
| `#vision-section` | "Focused vision. / Measured execution.", marquee infinito "Inspire + innovate + Impact", "✦ From idea to outcome."; il canvas 3D e' ancora dietro | scorre; il marquee si ferma a meta' sezione | **pin +200%** desktop, **+150%** touch |
| `#keyfacts-section` | 3 card: "Featured & Awards / 50+" (video di sfondo + loghi premi), "projects completed / 1.5K+", "our team members / 20+" (video del team); poi i loghi partner | desktop: scorre, le card ruotano; mobile: sezione bloccata e strip trascinata orizzontalmente; hover sulla team card fa partire il video | ~1.5 desktop, 1 pin su mobile |
| `#work-section` (contiene `#trionn-services`) | **prima** il portfolio: 3 progetti in home (MyWorker AI, Pulse Studio, Loftloom) su un binario orizzontale; **poi** la sequenza servizi | scorre; puo' cliccare una card progetto | **pin +1350%** desktop (200+150+800+200), **+1060%** mobile (200+60+600+200) |
| ...parte servizi | sequenza di **371 frame WebP** (`/images/stone/frame_0001..0371.webp`) scrubbata, video in `mix-blend-screen` ruotato 180°, audio `thunder.mp3`, 6 card servizio che entrano da sinistra/destra, icone SVG disegnate con DrawSVG, esplosione del testo | scorre | inclusa nel pin sopra; su mobile un secondo pin +800% |
| chiusura: 5 fasce bianche `scaleY` | wipe verso le testimonianze | scorre | ~0.3 |
| `#testimonials` | "Client stories", carosello Swiper in dissolvenza, elenco aziende a sinistra come tab, "▷ Listen to him!" apre YouTube in modale | clicca un'azienda, frecce prev/next, apre il video | ~1 |
| DribbleSection | "Design in / motion": 9 immagini `/images/orbit/orbit-0X.jpg` mappate su nastri che percorrono un'elica 3D e poi atterrano come griglia di card con angoli arrotondati e onda | scorre; hover su una card la ingrandisce a 1.12 | **pin +650%** desktop, **+450%** mobile |
| `#site-footer` | "Ready to build something bold?", orologio IST live, contatti, social, nebbia WebGL animata + griglia di linee SVG che ondeggiano al passaggio del mouse | hover sulle linee (con suono attivo) | ~1 |
| popup contatti | pannello bianco da destra con `clip-path: circle(0% at 95% 5%)` che si apre | compila il form | overlay |

Totale stimato: **circa 27-30 schermate di scroll** sulla home (somma dei `pin` piu' le sezioni normali). Non misurato con lo strumento, calcolato.

## L'esperienza in ordine di tempo

**0.0 s** - HTML servito prerenderizzato (`x-nextjs-prerender: 1`), ma `<main>` arriva con `style="opacity:0;visibility:hidden;pointer-events:none"` e `<html>` senza `data-trionn-ready`. Sopra tutto c'e' `.pl-white-overlay` (#c8c8c8, z-index 9050). Lo scroll e' bloccato: `document.documentElement.style.overflow='hidden'` piu' `preventDefault` su `wheel`, `touchmove` e `keydown`.

**0.0-0.9 s** - quattro glifi "+" (13x13 px, stroke #555) partono dai quattro angoli a 60 px dal bordo, convergono al centro ruotando fino a 720°, con easing `1-(1-t)^5`.

**0.9-1.5 s** - i "+" rimbalzano verso l'esterno fino agli angoli di un riquadro (`clamp(10rem,22vw,17.5rem)`), mentre il riquadro appare con una scala elastica (`1+2.8(t-1)^3+1.8(t-1)^2`).

**1.5-2.6 s** - le **tre aste della T** entrano in 3D una alla volta (ritardi 0 / 200 / 400 ms, `rotateY(±60deg) rotateZ(±30deg)` che si azzerano, scala 0.15→1), il bordo tratteggiato dell'SVG si disegna, sotto compare un contatore a tre rulli (slot machine) e la tagline "Inspire · Innovate · Impact" con le parole che salgono di 6 px una dopo l'altra.

**~2.6-3.5 s** - il riquadro (900 ms, `cubic-in-out`) si espande da riquadro a pieno schermo virando da rgb(210,210,210) a #000; i "+" agli angoli sfumano; poi 700 ms di dissolvenza a zero. `data-trionn-ready="true"`, evento `trionn-loader:complete`, Lenis parte, `ScrollTrigger.refresh()`.

**3.5 s in poi, fermi** - il canvas della hero e' gia' vivo: il gruppo 3D ruota da solo (`rotY += 0.0042` per frame, 0.0015 se `prefers-reduced-motion`), la posizione insegue il mouse con lerp 0.06, tre luci puntiformi arancioni (#ff3300, #ff2200, #ff5500) orbitano, un `CubeCamera` 256px aggiorna la envMap. Le tre linee curve si disegnano dal centro verso i bordi (`prog += 0.0205` per frame) e su ognuna corre un impulso luminoso a intervalli casuali.

**Al primo movimento del mouse** - se il puntatore passa a meno di 14 px da una linea partono da 5 a 6 raffiche di **scintille di saldatura**: `THREE.Line` a 10 vertici con jitter, piu' 3 linee di alone e 6 "tubi" cilindrici additivi, piu' una `PointLight` che viaggia lungo il fulmine; colore estratto a caso fra #ffffff, #88DDFF, #44AFFF, #0066FF, #00CCFF, #AADDFF, #0044CC. Se il suono e' attivo suona `hero-spark.mp3`. Passando sopra uno shard: `hover-beep.mp3` e il materiale diventa piu' liquido (`transmission` 0.35→0.67, `roughness` 0.08→0.02).

**Primo scroll** - il simbolo si scompone progressivamente: `scrollProgress` = 0 sotto 0.1 vh, sale a 1 entro 1.0 vh, resta a 1 fino a 1.2 vh, torna a 0 entro 1.8 vh; ogni shard si allontana di `5.5 * progress` lungo la propria normale e ruota sul proprio asse. Poi sfilano le sezioni.

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| scroll globale | tutta la pagina | Lenis | `easing: t => 1-(1-t)^3`, `duration 1.05`, `lerp 0.105`, `wheelMultiplier 0.85` (0.6 su Mac/iOS), `touchMultiplier 1.1`, `syncTouch:true`, `smoothTouch:false` | `autoRaf:false`; il raf lo da' `gsap.ticker`; `lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.lagSmoothing(500,33)` |
| barra spaziatrice | scroll continuo | keydown/keyup su `Space` | +15 px per frame in `immediate` | scorciatoia "tieni premuto spazio per scorrere" |
| simbolo 3D hero | esplosione shard, rotazione, flash materiale | scroll (`useLenis`) + mouse + hold | lerp manuali (0.06 posizione, 0.975 decay intro, +0.02/frame sul burst) | three.js puro, nessun R3F |
| elementi DOM della hero | tremolio poi lancio 3D | stato "holding" del mouse sul canvas | `transform` scritto a mano ogni frame; ritorno con `transition: transform .7s cubic-bezier(.25,.46,.45,.94)` | lista di id passata come prop `vibrateElementIds` |
| titoli e claim | entrata da `blur(12px)` + `autoAlpha:0` | ScrollTrigger `start:"top 90%"`, `end:"bottom 10%"` | `power2.out`, `stagger {each:0.05, from:"random"}` | componente `BlurTextReveal`, split con **GSAP SplitText** (`type:"chars,words,lines"`, `smartWrap:true`) |
| paragrafo "Trionn is an independent digital studio..." | i caratteri passano da `rgba(216,216,216,0.1)` a `#d8d8d8` | ScrollTrigger **scrub**, `start:"top 80%"`, `end:"bottom center"` | lineare | componente `FadeOnScroll` |
| voci di menu / link | hover: il testo originale esce (`y: ±10px`, `blur(5px)`), un clone identico entra | mouseenter | uscita `power2.in` 0.3 s stagger 0.025; entrata `power2.out` 0.4 s stagger 0.04 | componente `HoverBlur`, due layer sovrapposti |
| bottoni | le lettere scorrono di lato, la freccia attraversa, il sottolineato si ritrae e rientra | hover | **Web Animations API**, non GSAP; tempi da variabili CSS `--step:30ms --base-dur:300ms --dur-step:30ms --run:28px --out-time:200ms --in-time:320ms --ul-out-time:1000ms --ul-in-time:500ms` | componente `WordShiftButton` |
| passaggi fra sezioni | 5 fasce a tutta larghezza `scaleY 0→1` da `transform-origin:bottom` | scroll (timeline in pausa pilotata da `progress()`) | lineare, stagger 0.3/(n-1) al contrario (dal basso) | ricorre in vision, servizi, dribble; la sezione successiva e' tirata su con `marginTop:-100dvh` e `yPercent` |
| card "Key facts" (desktop) | `rotateX: -92deg → 0` con `transform-origin: center top` | ScrollTrigger `start:"top center"`, `end:"top top"`, **scrub 2** | `ease:"none"`, `stagger {each:0.6}`, `perspective:1400` | `gsap.matchMedia()` `(min-width:768px)` |
| card "Key facts" (mobile) | strip che scorre in orizzontale | sezione **pinnata**, scrub 2 | lineare | ramo `(max-width:767px)` della stessa matchMedia |
| portfolio | binario orizzontale (desktop) o verticale (mobile); ogni card sale da `y:550` a 0 quando entra | progresso del pin, calcolato a mano | `1-(1-x)^3` scritto a mano | linee delle card: `scaleY/scaleX 0→1`, `power2.out` 1.2 s, delay `0.1*i` |
| sequenza pietra | 371 WebP scambiati su un unico `<img id="c">` | progresso del pin, con smorzamento `videoIdx += (target-videoIdx)*0.12` | inerzia manuale | preload a blocchi di 20 con `requestIdleCallback` + `img.decode()` |
| 6 card servizio | volo da fuori schermo su un percorso a 13 keyframe (x, y, opacity) | progresso 0.56→1 della sequenza | `ease:"none"` su keyframes, ingresso smorzato da `cardsT += (t-cardsT)*0.08` | `perspective: 93.75rem`, `backdrop-blur-md`, `bg-[#000]/20` |
| icone SVG delle card | tratto che si disegna | evento: quando la coppia passa il centro | `drawSVG 0%→100%`, durata 1.5 s, `stagger 0.04` | **DrawSVGPlugin** |
| esplosione del testo | ogni carattere diventa uno span volante | progresso 0.35→0.53 | timeline in pausa pilotata da `progress()`; alone "eroe" con scala 6-10x | contenitore `mix-blend-mode: difference` |
| crossfade dei claim | "Design with intent..." esce sfocandosi, "Different disciplines..." entra | progresso | `blur(0→12px)` per gruppo di caratteri | i due testi sono sovrapposti in `absolute inset-0` |
| marquee | nastro infinito con cloni | tempo (rAF condiviso), non scroll | velocita' costante, arresto con lerp `stopSpeed 0.5` | opzionalmente **Draggable + InertiaPlugin** (`dragResistance 0.12`, `throwResistance 2500`) |
| "Design in / motion" | le due parole si separano orizzontalmente (`x: +100vw` / `-100vw`) | ScrollTrigger **scrub 0.6** | `ease:"none"` | e' l'unico scrub GSAP "classico" della sezione |
| nastri Dribbble | 9 piani a 117 segmenti deformati lungo un'elica (r=12, 2 giri), poi atterraggio a griglia con onda sinusoidale | pin +650%, con **scroll smorzato a mano** `eH += (scrollY-eH)*(1-0.001^dt)` | esponenziale su dt | shader custom: SDF di rettangolo arrotondato per l'alpha, raggio 8 px |
| nebbia del footer | fBm a 3 ottave, due campi mescolati in loop di 32 unita' | tempo + **livello audio** (AnalyserNode) + hover | mix pesato, alpha max 0.82 | WebGL1 grezzo, `blendFunc(ONE, ONE_MINUS_SRC_ALPHA)` |
| linee del footer | ogni `path` diventa una sinusoide che si smorza | hover, ampiezza e velocita' decadono | integrazione a fase | testo di istruzione: "sound on [icona] Hover the lines." |
| testimonianze | dissolvenza incrociata | tempo (autoplay 5 s) + click | `speed: 600` ms | **Swiper** con `effect:"fade"`, `crossFade:true`, `loop:true`, `pauseOnMouseEnter:true` |

## Colori

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo principale | `#040508` | `html`, `body`, footer, sezione form di /contact; `theme-color` del browser |
| fondo hero | `#0C0C0C` | `#hero-section` e `clearColor` del renderer three.js |
| fondo sequenza servizi | `#000000` | contenitore della sequenza pietra; card servizio `#000` al 20% (60% su mobile) |
| testo chiaro | `#D8D8D8` | token `--color-light-font` e `--color-cream-line`; colore di `html`/`body` |
| testo scuro | `#434343` | token `--color-dark-font` e `--color-grey-line`; usato sui fondi chiari |
| nero "morbido" | `#272727` | token `--color-black` (titoli su chiaro) |
| crema | `#e6e4e2` | token `--color-cream`, card "projects completed" |
| grigio secondario | `#9c9c9c` | token `--color-grey-light` (divisori loghi partner al 15%) |
| bordi scuri | `#2F323B` | riquadro "Est. 2012", linee della sezione about, menu mobile |
| bordo/fondo cookie | `#24262E` | banner cookie |
| card team | `#2F3135` | terza card di Key facts |
| grigio "serranda" | `#D2D2D2` | 5 fasce del wipe di `#vision-section`, pannello del preloader |
| grigio Dribbble | `#C3C3C3` | fondo della sezione "Design in motion" |
| gradiente Key facts | `linear-gradient(0deg,#FFFFFF 0%,#D2D2D2 100%)` | `#keyfacts-section` |
| gradiente testimonianze | `linear-gradient(0deg,#C3C3C3 0%,#FFFFFF 100%)` | `#testimonials` |
| bianco wipe | `#FFFFFF` | 5 fasce alla fine della sequenza servizi |
| errore form | `#d9432b` | etichette "Enter a valid email" ecc. |
| linee 3D Dribbble | `#9E9E9E` | i due tracciati che accompagnano l'elica |
| linea preloader | `#434343` bordo, `#555` i "+", `#aaa` i tracciati della T | overlay del preloader |
| scheda progetto | `#171717` | `/work/<slug>` |
| about "we're not for" | `#F7F7F7` | sezione su /about |

Palette del materiale 3D (convertita dai valori decimali nel codice): metallo `#3A3D42` con emissive `#1A2030`; luce ambiente `#2A3040`; direzionali `#8899AA` e `#6677AA`; spigoli `#363E4D`; puntiformi calde `#ff3300`, `#ff2200`, `#ff5500`. Nebbia del footer: `#05080D` → `#1F242E` → `#474F5C`, con tinta hover `#596170` (stimati dai `vec3` normalizzati dello shader).

Dettaglio: `body ::selection { background-color: transparent }` - la selezione del testo e' resa invisibile su tutto il sito.

## Tipografia

Quattro famiglie, **tutte self-hosted** via `next/font/local` (un solo peso ciascuna, formato woff2, servite da `/_next/static/media/`), con fallback metric-compatible generato su Arial (`ascent-override`, `size-adjust`).

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| `html` / `body` / `p` / `.small` | **Neue Haas Display Roman** (`--font-neue`) | 400 | `--text-xl` (1.25rem) mobile → `--text-base` da 64rem | normal | testo corrente; `-webkit-font-smoothing: antialiased` |
| `h1` / `.h1` | **Familjen Grotesk Variable** (`--font-familjen`) | Regular (variabile) | `clamp(3.75rem, 6.614vw, 6.25rem)` | `clamp(3.5rem, 5.952vw, 5.625rem)` | `letter-spacing: clamp(-.06em, -.055vw, -.06em)` |
| `h2` / `.h2` | Familjen Grotesk | Regular | `clamp(2.5rem, 6.283vw, 5.938rem)` | `clamp(2.2rem, 5.952vw, 5.625rem)` | variante `.h2.big`: `clamp(3.5rem, 6.349vw, 6rem)` |
| `h3` / `.h3` | Familjen Grotesk | Regular | 1.75rem → `--text-4xl` da 80rem | 1 | `-0.04em` |
| `.title` (occhielli, etichette) | Familjen Grotesk | Regular | `--text-lg` → 1.063rem → `--text-base` a 125rem | 1 | `text-transform: uppercase`, `-0.02em` |
| `.menu` (voci di navigazione) | Familjen Grotesk | Regular | 3rem mobile → `--text-xl` da 48rem | 1.375rem | uppercase |
| `.mrquee-text` (parole gigantesche) | Familjen Grotesk | Regular | `clamp(5rem, 9.164vw, 10rem)` | 0.672 | `letter-spacing: -0.08em` |
| `.number-small` (i numeri delle card) | Familjen Grotesk | Regular | 3.5rem | 3.125rem | `tabular-nums`, `-0.06em` |
| `.numbers` | **PP Editorial New Ultralight** (`--font-ppeditorial`) | Ultralight | 5.375rem | 6.125rem | l'unica serif del sito, usata per i numeri grandi |
| `.button-text` (CTA) | **Martian Mono Light** (`--font-martian`) | Light | `--text-base` → `--text-sm` da 64rem | normal | uppercase, `-0.06em` |

Trucco di impaginazione che vale la pena copiare: **la radice ha `font-size: calc(1000vw / var(--size))`**, dove `--size` e' la larghezza di progetto del breakpoint corrente (320 / 360 a 440px / 480 a 640px / 750 a 768px / 850 a 1024px / 1000 a 1280px / 1180 a 1441px / 1280 a 1536px). In pratica 1rem = 10px alla larghezza di progetto e **tutto il layout scala con la finestra** senza scrivere clamp ovunque: i clamp restano solo sui titoli.

## Testi veri

Menu: `Work` · `Services` · `About` · `Contact` · `✦ The TRIONN name Story` (→ `/trionn-story`)
Header: pulsante `let's talk` (bianco pieno), pulsante `Menu`, toggle audio con `title="Enable sound"` (default **spento**, `aria-pressed="false"`).

Preloader / tagline: `Inspire · Innovate · Impact`

Hero:
- H1: `Designed to mean something.`
- micro-copy: `hold to [icona] blast` e `Dare ⚡ to touch the lines.` (solo da `lg` in su)
- riquadro: `Est. 2012` / `14+ years shaping digital direction.`
- sottotitolo: `Websites, AI products, brands, and systems built for clarity, scale and impact.`
- CTA: `Discuss Your Project` (aria-label completo: "Discuss Your Project — open the inquiry form") e `Book a 30-minute call` (→ `https://calendly.com/hello-trionn/30min`)

About in home:
- occhiello `about`
- `Trionn is an independent digital studio crafting meaningful brand experiences through strategy, design, and technology.`
- `We design for longevity clarity first, craft always, built to scale.`
- `Our mission is to make technology feel human by designing digital products that are intuitive, purposeful, and meaningful to people.`
- CTA `more about us`

Vision: `Focused vision. / Measured execution.` · marquee `Inspire + innovate + Impact` · `✦ From idea to outcome.`

Key facts: `Key facts` / `A snapshot of our experience and impact.`
- `Featured & Awards` — `Featured on top design platforms worldwide.` — `50+`
- `projects completed` — `90% of our clients seek our services for a second project.` — `1.5K+`
- `our team members` — `Different skills. One standard.` — `20+`
- `Our business partners`

Servizi (occhiello `OUR SERVICES`, parole giganti `A.I.` `Design` `Development` `Branding`):
- claim 1: `✦ Design with intent. Built to work.` → claim 2: `✦ Different disciplines. One standard of craft.`
- CTA `view services`
- card: `AI & Intelligent Automation` — "AI-powered solutions designed to enhance products, automate workflows, and unlock smarter digital experiences." · `Web Development` — "Custom web development delivered with a product-focused, design-conscious approach." · `Product Design` — "Thoughtful product design that captures attention, deepens engagement, and builds lasting loyalty." · `Website & Mobile Design` — "High-quality website and app experiences designed to attract users and keep them coming back." · `WordPress Development` — "WordPress development focused on performance, clarity, and experiences that convert visitors into loyal users." · `Branding` — "Impactful branding positions startups for success through credibility, clarity, and lasting loyalty."

Testimonianze: `Client stories` / `Great work is built through partnership. Here's what our clients say.` · CTA `become a client` · pulsante video `▷ Listen to him!`

Dribbble: `Design in` / `motion` · `Exploring ideas through daily design practice.` · `Concepts, explorations, and interface experiments shared openly as part of our creative process.` · CTA `View on Dribbble`

Footer:
- `Let's build work that inspires.`
- H2: `Ready to build something bold?`
- `sound on [icona] Hover the lines.` (solo da `md`)
- `©TRIONN® 2026` · `IST → HH:MM` (orologio live su fuso `Asia/Kolkata`)
- `Business enquiry` — `E. hello@trionn.com` · `P. +91 98241 82099`
- `Social` — `Linkedin` `Facebook` `Dribbble` `Instagram`

Popup contatti: `Let's build something great.` / `Tell us about your project, we usually reply within one business day.` · errori `Enter your name`, `Enter a valid email`, `Select a service`, `Minimum 20 characters`, `Select a budget` · CTA `Send Inquiry` / `or` / `Book a 30-minute call` / `Prefer email? hello@trionn.com`

Cookie: `We use cookies to enhance your experience.` · `Decline` / `Accept`

Altre pagine (H1 testuali): `/work` → `Our work` ("A curated showcase of branding, digital products, websites, and mobile experiences.") · `/services` → `Area of expertise` (occhiello `✦ WHAT WE DO BEST`, claim "Focused disciplines where strategy, design, and technology work as one.") · `/about` → `We are an independent digital studio built on clarity, thoughtful craft, and trust earned worldwide.` con l'istruzione `Dare the Lion 🦁 Drag the strips with sound on.` · `/contact` → `Let's start something.` · 404 → `The page you're looking for may have been moved, refined, or no longer exists.`

## Mobile

Il sito **non e' un altro sito** sul telefono, ma cambia parecchio. Breakpoint Tailwind usati: 40rem (sm), 48rem (md), 64rem (lg), 80rem (xl), 90.0625rem, 96rem (2xl), 125rem (4xl).

**Sparisce:**
- `hold to blast` e `Dare ⚡ to touch the lines.` (classe `hidden lg:flex`) - l'interazione hold funziona ma non e' annunciata.
- Il campo di 200 particelle three.js dietro il simbolo (`points.visible = innerWidth >= 768`).
- L'elenco delle aziende come tab nelle testimonianze (`hidden md:flex`): sul telefono il nome dell'azienda compare dentro la slide.
- La riga statica dei loghi partner (`hidden lg:flex`).
- `sound on ... Hover the lines.` nel footer (`hidden md:block`).
- La seconda linea guida nella scena Dribbble su desktop / la prima su mobile (si scambiano).

**Viene sostituito:**
- **Il menu**: da `md` in giu' e' un pannello nero a tutta pagina che entra da destra (`translateX(100%)` → 0, `data-lenis-prevent`), con le voci in colonna a corpo 3rem; sopra `md` e' un overlay diverso ancorato al pulsante "Menu".
- **I video**: ogni video ha un gemello `_m.mp4` servito da `md:hidden` (`homepage-services-video_m.mp4` 453 KB contro 877 KB, `awards-card-video_m.mp4`, `rushi_m.mp4`, `hanging-lion-mobile.mp4`).
- **Le immagini di progetto**: campo `mobileImage` separato (`myworker_m.jpg`).
- **Il portfolio**: binario **orizzontale** su desktop (`x: -scrollWidth`), **verticale** su mobile (`y: -scrollHeight`); su mobile le card non hanno l'offset di ingresso `y:550`, entrano gia' in posizione.
- **Le 6 card servizio**: su desktop arrivano a **coppie** da sinistra e destra (3 coppie, `centerTime` 0.135 / 0.335 / 0.535); su mobile arrivano **una alla volta dal basso**, sei tappe (`0.12*i + 0.09`), larghezza `viewport - 48px` e altezza 55% della larghezza.
- **Key facts**: desktop = tre card affiancate che ruotano su `rotateX`; mobile = sezione **pinnata** con la striscia di card larghe `85vw` trascinata in orizzontale.
- **Loghi partner**: su mobile diventano un marquee.
- **La griglia Dribbble**: 3 colonne x 2 righe su desktop, **2 colonne x 3 righe** su mobile, con gap diversi (0.18/0.22 contro 0.38/0.55).
- **La sequenza pietra**: dimensione forzata `999x594` sotto 768px, `4:3` sul tablet, `16:9` sull'altezza del `visualViewport` su desktop.

**Resta ma con parametri diversi:**
- Lenis: su touch `wheelMultiplier 0.6`, `touchMultiplier 1.2`, `lerp 0.105`, `syncTouch:true`, `smoothTouch:false`.
- `devicePixelRatio` limitato: **1** sotto 768px, 1.5 sopra, per la scena hero (ma il renderer della sezione Dribbble usa `setPixelRatio(2)` fisso - probabile svista).
- Lunghezza dei pin ridotta: vision `+150%` invece di `+200%`; work `+1060%` invece di `+1350%`; Dribbble `+450%` invece di `+650%`.
- FOV e distanza camera del simbolo 3D cambiano a scalini (42/40/38/36 gradi, z 6 → 9.35) per far stare la T nello schermo verticale.
- La formula `font-size: 1000vw / --size` fa scalare tutto: a 320px di larghezza 1rem = 10px esatti.

Non verificato: come si comporta l'esplosione del testo su mobile (il codice non ha rami dedicati, quindi dovrebbe girare uguale, ma su un telefono medio sono ~40 span animati per frame).

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| Framework | **Next.js 16.2.1**, App Router, React Server Components | VERIFICATO | `window.next={version:"16.2.1"}` nel bundle; payload RSC `self.__next_f.push`; header `X-Powered-By: Next.js` |
| Bundler | **Turbopack** (non webpack) | VERIFICATO | chunk `turbopack-0nz662b_cli3l.js`, runtime `globalThis.TURBOPACK.push([...])` |
| Rendering | SSG/ISR sulle pagine principali, SSR sulle schede progetto | VERIFICATO | `x-nextjs-prerender: 1` + `x-nextjs-cache: HIT` + `Cache-Control: s-maxage=31536000` su `/`, `/work`, `/services`, `/about`, `/contact`, `/trionn-story`; `/work/myworker-ai` risponde `private, no-cache, no-store` senza header di prerender |
| CSS | **Tailwind CSS v4** (`@layer theme` con token `--color-*`, `@layer utilities`) + un layer di classi tipografiche custom | VERIFICATO | struttura del CSS compilato, sintassi v4 (`--tw-*` in `@layer properties`) |
| Animazione | **GSAP 3.15.0** | VERIFICATO | `version:"3.15.0"` in 10 punti del bundle |
| Plugin GSAP | **ScrollTrigger**, **SplitText**, **DrawSVGPlugin**, **Draggable**, **InertiaPlugin**, **ScrollSmoother** (registrato ma non usato) | VERIFICATO | moduli distinti: ScrollTrigger 43 KB, SplitText 7 KB, `name:"drawSVG"`, `name:"inertia"`, `Draggable.version="3.15.0"`, `ScrollSmoother-wrapper` |
| React + GSAP | **`@gsap/react`** (`useGSAP`) | VERIFICATO | export `useGSAP` come modulo a se', usato con `{ scope, dependencies }` |
| Scroll | **Lenis** via **`lenis/react`** (`<ReactLenis root>`, hook `useLenis`) | VERIFICATO | export `ReactLenis` e `useLenis`; attributi `data-lenis-prevent` nell'HTML |
| 3D | **three.js**, usato **grezzo** (niente React Three Fiber, niente drei, niente postprocessing) | VERIFICATO | chunk da 514.815 B con `THREE.WebGLRenderer`, `__THREE_DEVTOOLS__`; nessuna traccia di `@react-three/*`; versione non leggibile (nessuna stringa `REVISION`) |
| WebGL grezzo | un secondo canvas WebGL1 senza librerie per la nebbia del footer | VERIFICATO | `getContext("webgl",{alpha:true,premultipliedAlpha:false,antialias:false})` + shader inline, log `[FooterFog]` |
| Carosello | **Swiper** (moduli Autoplay, Navigation, EffectFade) | VERIFICATO | codice Swiper completo nel chunk delle testimonianze, `swiper-slide-active`, `fadeEffect` |
| Audio | **Web Audio API** a mano (nessuna libreria) | VERIFICATO | `AudioContext`, `decodeAudioData`, `ScriptProcessorNode` per il rumore bruno, `AnalyserNode` per la nebbia; file `/assets/glass-shatter.mp3`, `join-zoom.mp3`, `woosh-loop.mp3`, `hero-spark.mp3`, `hover-beep.mp3`, `/audio/thunder.mp3`, `lion-growl.mp3`, `curtain.mp3`, `hanging-lion.mp3`, `work-listing.mp3` |
| CMS | **nessuno**: i contenuti sono un modulo TypeScript statico | VERIFICATO | un solo chunk (`150d1p-43jycd.js`, 79 KB) esporta `projects`, `ServicesListData`, `TestimonialsData`, `HowWorkData`, `WeNotData`, `faqData`, `menu`, `social`, `enquiry`, `budgetOptions`, `serviceOptions`, `partnersLogo`, `bookACallUrl` |
| Form | endpoint interno `POST /api/contact` + **Google reCAPTCHA v3** (`react-google-recaptcha-v3`) | VERIFICATO | `GoogleReCaptchaProvider` nel bundle; `GET /api/contact` risponde 405 |
| Immagini | `next/image` **senza ottimizzazione server**: i file sono serviti tal quali da `/public` | VERIFICATO | markup `data-nimg`, ma `src="/images/..."` e nessuna URL `/_next/image?...` in tutto l'HTML |
| Font | `next/font/local`, 4 woff2 self-hosted + fallback metrici su Arial | VERIFICATO | `@font-face` in `/_next/static/media/`, `ascent-override`/`size-adjust` generati |
| Hosting | **VPS con Apache 2.4.52 (Ubuntu)** davanti a Next.js. Non Vercel, non Cloudflare | VERIFICATO | `Server: Apache/2.4.52 (Ubuntu)`; nessun `x-vercel-cache`, `cf-ray`, `via`, `age` |
| Analytics | Google Tag `G-D2L5FM3EVB` | VERIFICATO | script `googletagmanager.com/gtag/js` caricato `afterInteractive` |
| Booking | Calendly `hello-trionn/30min` | VERIFICATO | costante `bookACallUrl` |
| Framer Motion | **assente** | VERIFICATO | nessuna traccia nei bundle; e' citata solo nel testo dello stack pubblicato in `/services` |
| Locomotive Scroll, matter-js, embla, react-hook-form, zod, radix, lottie | **assenti** | VERIFICATO | grep su tutti i chunk delle 6 pagine |

### Come e' organizzato il progetto

Il bundle e' minificato senza nomi di file (Turbopack usa id numerici), quindi la struttura si ricostruisce dai nomi di export e dai confini dei chunk. Quello che si legge e' questo.

**1. Un layout che monta quattro provider annidati.** Il payload RSC mostra l'ordine esatto:
`SiteSoundProvider` → `TransitionProvider` → `SmoothScrollProvider` (il wrapper di `ReactLenis root`) → `ContactPopupProvider` → header + `<main>` + footer + cookie banner.
Il layout e' un Server Component; ogni provider e' un file `"use client"` separato.

**2. Una cartella di primitive riutilizzabili.** Sono componenti minuscoli con un solo export nominato, che ricorrono in tutte le pagine:
- `BlurTextReveal` — SplitText + entrata sfocata, l'unico modo in cui il testo entra in scena
- `FadeOnScroll` — SplitText + colorazione dei caratteri in scrub
- `FadeInOnScroll` — `y:20` + opacita', per i paragrafi
- `HoverBlur` — due layer di testo che si scambiano all'hover
- `WordShiftButton` — il bottone con le lettere che scorrono (Web Animations API)
- `ContactCTA` — variante del bottone che apre il popup invece di navigare
- `TransitionLink` — `<Link>` che prima suona la transizione a serranda e poi naviga
- `Marquee` — nastro infinito con cloni, opzionalmente trascinabile
- `LinePlusBlock` — il divisorio con la linea e il "+" al centro
- `ContactForm`, `CookieConsent`, `IconMark`

**3. Le sezioni di pagina sono componenti "grossi", uno per sezione**, con il codice di animazione **dentro** al componente: non c'e' una cartella `animations/` separata. Il pattern e' sempre lo stesso:

```
function Section() {
  const ready = useTransitionReady();       // aspetta la fine del preloader
  const state = useRef({ ...tutto lo stato mutabile... });
  useGSAP(() => {
     if (!ready) return;
     ...setup, ScrollTrigger.create(...), manager.register(render)...
     return () => { ...kill/unregister... };
  }, { scope: rootRef, dependencies: [ready] });
  return <section ref={rootRef}>...</section>;
}
```

**4. Le quattro sezioni pesanti sono lazy, con `next/dynamic` e `ssr:false`**, dichiarate in un unico file barrel (`TrionnSymbolAnimationDynamic`, `WorkServicesSequenceDynamic`, `TestimonialsDynamic`, `DribbleSectionDynamic`). Nell'HTML servito al loro posto c'e' `<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING">`.

**5. Tutti i contenuti in un solo modulo dati.** Nessuna chiamata di rete per i contenuti: `projects` e' un array di 21 oggetti con `slug`, `title`, `subTitle`, `year`, `image`, `mobileImage`, `category[]`, `tabs[]` (challenge/approach/outcome/wedid, con HTML dentro), `content[]` (`{image, layout: "single"|"grid"}`) e un flag `visibleInHome` (solo 3 a `true`) piu' `pos` (`left`/`right`/`center`) e `size` (`small`/`medium`/`large`/`xlarge`) che pilotano il layout della griglia di `/work`.

### Come convivono React e GSAP (la parte davvero replicabile)

Questo e' il cuore, ed e' piu' disciplinato di quanto sembri.

**a) Un unico rAF per tutto il sito.** Esiste un singleton `getCanvasManager()`: una classe con `entries: Map`, e metodi `register(fn, active, name)`, `unregister(id)`, `setActive(id, bool)`, `suspend/resume(id, reason)`. Il loop **non e' `requestAnimationFrame`**: e' `gsap.ticker.add(this.tick)`. Il ticker viene rimosso da solo quando nessuna entry e' attiva, e il tick e' saltato quando `document.hidden`. Ogni canvas, ogni marquee, ogni nebbia si iscrive li'. **Le tre scene three.js, il canvas 2D delle linee, la nebbia WebGL e tutti i marquee girano nello stesso frame, sincronizzati con GSAP e con Lenis.**

**b) L'attivazione e' delegata a IntersectionObserver.** Ogni componente che registra un renderer crea un `IntersectionObserver` (`rootMargin` fra 64 e 160 px) e chiama `manager.setActive(id, entry.isIntersecting)`. Fuori vista, il costo e' zero. In piu' i `<video>` vengono messi in pausa quando la sezione esce.

**c) Lenis e' l'unico smoother, ScrollSmoother e' registrato ma inerte.** Il cablaggio canonico e' tutto in `SmoothScrollProvider`:

```js
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));   // options.autoRaf = false
gsap.ticker.lagSmoothing(500, 33);
history.scrollRestoration = 'manual';
```
Piu': su `resize` con debounce 200 ms si incrementa una `key` sul `<ReactLenis>` per **ricreare** l'istanza da zero; su `visibilitychange` si riallinea `lenis.scrollTo(lenis.scroll, {immediate:true, force:true})` e si chiama `ScrollTrigger.update()`.

**d) ScrollTrigger spesso non anima nulla: fornisce solo il numero.** Il pattern piu' interessante del sito e' che nelle sequenze pesanti (portfolio, servizi, Dribbble) `ScrollTrigger.create()` viene usato solo con `pin: true` e `onUpdate: st => { progressRef.current = st.progress }`. L'animazione vera avviene nel render del CanvasManager, che legge quel ref, lo smorza (`v += (target - v) * 0.08`) e **pilota a mano** timeline GSAP messe in pausa (`tl.progress(x)`) o scrive direttamente su `style.transform`. Risultato: un solo passaggio di lettura/scrittura per frame, nessun ScrollTrigger che si azzuffa con un altro, e la possibilita' di aggiungere inerzia dove `scrub` non basterebbe.

**e) Tutto e' gated dietro un flag globale.** L'hook `useTransitionReady()` legge `document.documentElement.dataset.trionnReady` e ascolta gli eventi custom `trionn-loader:complete`, `trionn-transition:start`, `trionn-transition:complete`. Nessun `useGSAP` fa niente finche' il preloader non ha finito. La comunicazione fra provider e sezioni passa **da eventi sul `window`**, non da context: `trionn-loader:complete`, `trionn-transition:start` / `:belts-closed` / `:complete` / `:early-start`, `trionn-modal:open` / `:close`, `trionn-scroll-to` (con `detail: {target, offset}`), `trionn:intro-text-finished`. E' un bus di eventi DOM usato come message queue fra React e codice imperativo.

**f) Cleanup ossessivo.** Ogni `useGSAP` ritorna una funzione che fa `kill()` di timeline e ScrollTrigger, `unregister()` dal manager, `disconnect()` di IntersectionObserver e ResizeObserver, `split.revert()` di SplitText, `renderer.dispose()` + `traverse` con `geometry.dispose()`/`material.dispose()` per three.js, e `detachShader`/`deleteProgram`/`deleteBuffer` per il WebGL grezzo.

**g) `gsap.matchMedia()` solo dove serve davvero.** E' usato in una sola sezione (Key facts) per due coreografie completamente diverse desktop/mobile. Altrove i rami mobile sono `if (window.innerWidth < 768)` dentro al setup, con `ResizeObserver` su `document.body` che chiama `ScrollTrigger.refresh()`.

**h) Il preloader non usa GSAP.** E' scritto in `requestAnimationFrame` + `style` inline con easing scritti a mano (`4t³`/`1-(-2t+2)³/2`, `1-(1-t)^5`). Probabilmente per non dover caricare GSAP prima del primo frame.

## Peso e prestazioni

Misurato con `curl` il 13/08/2026, non con Lighthouse.

- **HTML della home**: 152.463 B non compressi, servito **gzip**. Altre pagine: `/about` 226.984 B, `/work` 214.082 B, `/services` 170.993 B, `/contact` 155.279 B, `/work/myworker-ai` 132.005 B, 404 112.699 B.
- **JS + CSS del primo caricamento (home)**: **527.855 B gzip** su 22 file. Di questi, `03~yq9q893hmn.js` (39.627 B gz) e' un bundle `noModule` per browser vecchi, quindi un browser moderno ne scarica ~488 KB gz.
- Il file piu' pesante e' **three.js: 514.815 B non compressi, 126.799 B gzip** — ed e' nella lista degli script **iniziali** della home, non lazy: viene tirato dentro perche' il componente `not-found` del layout (l'animazione "404" in 3D) fa parte dell'albero client. Le sezioni 3D della home lo caricherebbero comunque, ma piu' tardi.
- **ScrollSmoother** e' registrato e quindi bundlato pur non essendo mai istanziato: peso morto.
- **La sequenza pietra e' l'osso duro**: 371 file WebP, campionati 25 su 371, media 34.786 B → **circa 12,9 MB** per la sola sequenza. Vengono precaricati tutti (`requestIdleCallback` a blocchi di 20 con `img.decode()`) non appena la sezione entra nel raggio dell'IntersectionObserver.
- Video: `homepage-services-video.mp4` 877.274 B (mobile 452.753 B), `awards-card-video.mp4` 865.848 B, `team/rushi.mp4` 171.550 B. Audio `thunder.mp3` 140.204 B. Immagini orbit ~120 KB l'una x9. Copertine progetto ~340 KB l'una (`myworker.jpg` 339.717 B).
- **Caching sbagliato sugli asset**: `/_next/static/*` ha correttamente `Cache-Control: public, max-age=31536000, immutable`, ma **tutto quello che sta in `/public` (immagini, video, audio, i 371 frame) ha `Cache-Control: public, max-age=0`**. Sono comunque revalidati con ETag (304), ma sono 371+ richieste condizionali a ogni visita.
- Non ci sono `<link rel="preload">` per i frame: solo per i 4 woff2 e il logo.
- Nessun punteggio Lighthouse rilevato: non ho misurato i tempi reali (niente browser).

## Tre cose da rubare

1. **Il CanvasManager: un solo `gsap.ticker` per tutte le animazioni imperative del sito.** Un singleton con `register(fn) / setActive(id, bool) / suspend(id, reason)`, alimentato da `gsap.ticker.add()` invece che da `requestAnimationFrame`, che si spegne da solo quando nessuna entry e' attiva e salta il tick a scheda nascosta. Ogni componente che disegna (WebGL, canvas 2D, marquee, contatori) si registra e passa un `IntersectionObserver` che fa `setActive`. Costa venti righe, elimina la classe di bug piu' comune di questi siti (dieci rAF concorrenti che si desincronizzano da Lenis) e da' gratis lo spegnimento fuori schermo.

2. **ScrollTrigger come sensore, non come animatore.** `ScrollTrigger.create({ trigger, start:'top top', end:'+=1350%', pin:true, onUpdate: st => ref.current = st.progress })` e basta. Poi, dentro il tick condiviso, si smorza il valore (`v += (target - v) * 0.08`) e si pilotano timeline GSAP **in pausa** con `tl.progress(v)`. Si guadagnano tre cose: inerzia che `scrub` non sa dare, un solo punto di scrittura sul DOM per frame, e la possibilita' di far dipendere piu' animazioni indipendenti dallo stesso progresso senza creare N ScrollTrigger.

3. **La "serranda" come unica transizione, riusata ovunque.** Cinque `<div>` a tutta larghezza, `flex:1`, `transform:scaleY(0)`, `transform-origin:bottom`, `margin-top:-1px` per non far vedere le fessure. Si chiudono con una timeline in pausa in cui la fascia *i* parte a `0.3*(n-1-i)/(n-1)` e dura 0.3 (quindi dal basso verso l'alto), e la sezione successiva viene tirata su con `marginTop:-100dvh` + `yPercent → 0`. Lo stesso identico blocco fa da wipe fra le sezioni, da transizione di pagina e da uscita del preloader: e' quello che da' al sito l'impressione di essere un solo pezzo. Aggiungi il trucco tipografico `html { font-size: calc(1000vw / var(--size)) }` con `--size` = larghezza di progetto per breakpoint, e il layout scala da solo senza clamp sparsi.

## Non verificato

- **Tempi reali** (LCP, TTI, FPS durante la sequenza pietra, punteggi Lighthouse): non ho aperto un browser, per vincolo del compito. Tutti i numeri sono peso di rete e valori letti nel codice.
- **Versione di three.js**: nel bundle non c'e' nessuna stringa `REVISION`; c'e' solo `__THREE_DEVTOOLS__`. Dall'API usata (`transmission`, `ior`, `clearcoat` su `MeshPhysicalMaterial`, `WebGLCubeRenderTarget`) e' r150+, ma non e' determinabile con precisione.
- **Se il sito usa `next/image` con `unoptimized: true` o un loader custom**: vedo solo che le `src` puntano a `/public` e non passano da `/_next/image`. Non posso distinguere le due cause.
- **Comportamento reale della modale video YouTube** e delle transizioni di pagina fra rotte: ho letto il codice, non le ho eseguite.
- **Il "leone" di `/about`**: e' un secondo motore WebGL grezzo con mappa di profondita' (`/images/about/lion.jpg` + `lion-depth.jpg`) trascinabile con suono (`lion-growl.mp3`, `curtain.mp3`). Ho la lista degli asset e il fatto che ci sia un fallback (`console.warn("WebGL not supported; lion animation disabled.")`), ma non ho letto la coreografia in dettaglio.
- **La scena "orbit" di `/services`** (canvas `#main-canvas-services-v2`, asset `/services-orbit/*.svg`, `spark.mp3`, `woosh.mp3`): individuata, non analizzata riga per riga.
- **La griglia di `/work`** con `#line-canvas` e `#spark-webgl-canvas` (due canvas fissi sovrapposti, uno 2D e uno WebGL): individuata, non analizzata.
- **Se il sito e' dietro una CDN**: dagli header sembra un VPS Apache nudo, ma non ho fatto test da piu' geografie.
- **Il flusso reale di `POST /api/contact`** (destinatario, storage, antispam oltre a reCAPTCHA v3): non ispezionabile senza inviare dati.
- **Come si comporta con `prefers-reduced-motion: reduce`**: il codice lo legge in due punti (rotazione del simbolo rallentata da 0.0042 a 0.0015 per frame nella hero e nella 404) ma **non disattiva** ne' la sequenza scrubbata, ne' l'esplosione del testo, ne' i pin. Non verificato dal vivo.
