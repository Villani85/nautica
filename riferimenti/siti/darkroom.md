# Darkroom Engineering

- **URL**: https://darkroom.engineering (raggiungibile, HTTP 200, nessuna sostituzione necessaria)
- **Premio**: nessun premio sulla home attuale che io abbia potuto verificare. Il profilo Awwwards dello studio (ancora sotto il vecchio nome Studio Freight) conta 17 Site of the Day, 4 Honorable Mention e Developer Award su quasi tutti — fra cui **Lenis, SOTD + Developer Award del 02/02/2023** (https://www.awwwards.com/studiofreight/). Il piede del sito dichiara "Awards / Features: Awwwards, CSS Design Awards, Muzli, FWA" senza link a una singola vittoria.
- **Studio**: darkroom.engineering (ex Studio Freight). Team distribuito fra Spagna, Italia, Francia, Argentina e USA (meta description del sito).
- **Anno**: versione corrente online da gennaio 2026 — l'activity log del sito dice `2026/01/13 | Migration | darkroom.engineering migrated to new Satus`.
- **Letto il**: 13/08/2026

---

## L'ESPERIENZA (integrazione)

*Blocco aggiunto il 13/08/2026 rileggendo il sito con `curl`: HTML prerenderizzato
della home e **la pagina `/contact` con il modulo completo**, che è la parte
commercialmente più interessante di tutto il sito e mancava. Integra — non
sostituisce — le sezioni sotto.*

### Di cosa tratta il sito

Di **uno studio di ingegneria front-end che si presenta come un log**. Dentro ci
sono: una promessa in quattro parole, la definizione da vocabolario della parola
"darkroom", tre progetti in video, tre testimonianze anonime, quattro librerie
open source di loro proprietà, quattro liste secche (servizi, clienti,
tecnologie, premi) e — la cosa più insolita — **un registro datato di 33 righe
con tutto quello che hanno spedito negli ultimi 18 mesi**, comprese le voci
oscurate (`[REDACTED] — iOS app. More soon.`, `[REDACTED 3] signed a retainer
with us`).

### Cosa vende, e qual è l'obiettivo finale

Vende **ore di ingegneria front-end su commissione**. Non design d'immagine:
codice. La lista dei servizi è testuale e senza aggettivi:

> `Front-End Development, Back-End Development, Framer Plugin Development, Web3 Integration, APIs Integration, Headless E-Commerce, WebGL, Motion & Interaction, Creative Development`

**Obiettivo dichiarato**: `Where Things Get Developed`.

**Obiettivo vero, e qui è più esplicito che negli altri tre siti**: portare il
visitatore sul modulo `/contact` e **fargli dichiarare un budget**. Il modulo non
è un "scrivici": è un **qualificatore di lead con listino a fasce**. E per chi non
è pronto a impegnarsi, c'è un prodotto d'ingresso a basso attrito, dichiarato
testualmente sulla pagina di contatto:

> `not sure where to start? we offer a two-week discovery sprint — a focused engagement to audit your current stack, map opportunities, and deliver a clear roadmap. no long-term commitment required.`

**Il secondo motore commerciale è l'open source**, e non è beneficenza: **Lenis**
ha ~15.400 stelle su GitHub ed è usato da mezza industria. Chi arriva qui spesso
ci arriva perché ha già installato una loro libreria. La sezione `Tools We Build
and Use. Now Yours Too.` è la prova di competenza più economica e più forte che
uno studio possa avere: **il cliente ha già il loro codice in produzione**. C'è
persino la richiesta di sostegno: `Become an Open Source Sponsor`.

### A chi

A un **CTO o head of design di un'azienda che ha già un prodotto** e deve farlo
girare veloce: startup finanziate, piattaforme Web3, team con un design system
esistente. Sa già cosa vuole e non vuole spiegarlo due volte — la testimonianza
scelta lo dice al posto loro:
> `clearly everyone is very senior and action oriented without needing much guidance from us`

Teme di dover fare da project manager al fornitore. Deve uscire pensando: *questi
sono quelli che hanno scritto Lenis; posso mandargli un brief in tre righe e
capiscono.*

### L'esperienza progettata, passo per passo

Il ritmo è l'opposto degli altri tre siti: **niente loader, niente attesa, tutto
già scritto nell'HTML.**

1. **A 0,3 secondi si legge già tutto quello che conta.** L'HTML è
   prerenderizzato (`X-Nextjs-Prerender: 1`), `<html data-theme="simple">` è già
   nel markup: nero e rosso dal primo fotogramma, nessun lampo di tema. A schermo:
   `Where / Things / Get / Developed` a 200 px, la definizione, il sommario di
   posizionamento e il pulsante `Let's talk→`.
2. **Tre lavori, in 300vh.** La sezione dei progetti è alta tre schermate: tre
   video a piena pagina si scoprono uno sull'altro con un tergicristallo
   verticale, mentre il nome resta appiccicato (`Oreo & BTS`, `Looped`,
   `Ibicash`). Poi una didascalia che ammette apertamente di essere un campione
   parziale e rimanda alla pagina `/work`.
3. **Tre testimonianze senza nome.** `Past Client`, `Web3 Partner`,
   `Design & Development Partner`. Sono citazioni brevi, quasi ruvide
   (`nothing you guys were exceptional…`) — sembrano ritagliate da una chat, non
   scritte da un ufficio marketing.
4. **Gli strumenti.** Schede `Satus / Lenis / Hamo / Tempus`, con un video e i
   link ai repo.
5. **Il claim commerciale**, in mezzo alla pagina e non in cima:
   `We bring brands and interfaces to life with code that runs smooth and scales
   right.` seguito da `Get in Touch→`.
6. **Le quattro liste** (servizi, clienti, tecnologie, premi): niente narrazione,
   solo inventario.
7. **L'activity log**: 33 righe `AAAA/MM/GG | categoria | descrizione`. È una
   prova di vitalità continua, non un elenco di trofei.
8. **Il footer** con la parola `darkroom` alta 251 px che si scopre a metà
   velocità. E se continui a girare la rotella oltre il fondo, dopo 300 px
   accumulati: `you've found the darkroom backrooms.`

**Cosa deve fare il visitatore**: scorrere (o non scorrere affatto) e cliccare
uno fra `Let's talk→` (in alto, sempre presente), `Get in Touch→` (a metà) o
`contact` (nel piede). Tutti e tre portano alla stessa pagina.

**Immagine che resta**: uno schermo nero con testo rosso in monospaziato
maiuscolo, e una tenda che si alza come carta fotografica.

### Il percorso di contatto, per intero — la parte che i clienti veri pagano

Rotta `/contact`. Titolo della scheda:
`Contact - Let's Build Something That Lasts`. La tenda di transizione che la
apre porta scritto: `contact:// if you've got a vision, we've got questions`.

Testi in pagina:
> `got something worth building?`
> `skip the small talk.`
> `Whether it's a badass product idea or a broken thing that needs fixing, we're here to build. Give us the raw details, and we'll take it from there.`
> `FOR GENERAL INQUIRES, MOVIE OR RESTAURANT RECOMMENDATIONS, YOU CAN REACH OUT VIA EMAIL.`

Il modulo è numerato in **sette passi**, con l'asterisco sui campi obbligatori:

| # | domanda | tipo | opzioni / segnaposto |
|---|---|---|---|
| 01 | `I want to *` | scelta singola | `BUILD SOMETHING` · `FIX SOMETHING` |
| 02 | **`My budget is *`** | scelta singola | `LET'S TALK` · **`$35,000`** · **`$50,000`** · **`$70,000`** · **`UNLIMITED`** |
| 03 | `I need it done within *` | scelta singola | `1 MONTH` · `3 MONTHS` · `6 MONTHS` · `9 MONTHS` |
| 04 | `my company is` | testo | segnaposto `METACORTEX` |
| 05 | `so. about that project` | area di testo (5 righe) | `ANYTHING SPECIFIC WE NEED TO KNOW ABOUT IT?` |
| 06 | `here is my info *` | testo + email | segnaposti `MR. ANDERSON` e `NEO@METACORTEX.COM` |
| 07 | `i heard about you via *` | scelta singola | `LINKEDIN` · `A PROJECT` · `AWWWARDS & CO` · `A FRIEND` · `OTHER` |

Pulsante: `SEND REQUEST →`. I campi radio veri sono nascosti
(`clip-path: inset(50%)`) e stilizzati a mano; l'invio passa da una Server Action
di Next.js, non da un endpoint esterno.

**Tre cose da notare, e sono tutte rubabili:**
1. **Il prezzo esiste ed è il secondo campo.** Su quattro siti esaminati, questo
   è **l'unico che dichiara delle cifre**. La soglia più bassa selezionabile è
   `$35,000`: chi ha 5.000 euro capisce subito di essere nel posto sbagliato, e
   se ne va senza far perdere tempo a nessuno. `LET'S TALK` è la valvola di
   sfogo per chi non sa ancora.
2. **`i heard about you via` con `AWWWARDS & CO` fra le opzioni**: misurano
   quanto rendono i premi. Chi mette quel campo sta facendo attribuzione seria.
3. **I segnaposto sono una battuta di Matrix** (`MR. ANDERSON`,
   `NEO@METACORTEX.COM`, `METACORTEX`): il tono della casa arriva fin dentro il
   modulo, dove tutti gli altri diventano seri.

### Come è organizzata la persuasione

| cosa | dove sta | a quale schermata |
|---|---|---|
| Promessa | `Where Things Get Developed` + la definizione + il sommario | **1, in 0,3 s** |
| Prova 1 — lavori | tre video a piena pagina | 2–4 |
| Prova 2 — parole altrui | tre testimonianze anonime | ~6 |
| Prova 3 — codice | `Tools We Build and Use. Now Yours Too.` (Lenis, ~15.400 stelle) | ~7 |
| Prova 4 — vitalità | l'activity log datato, 33 righe, l'ultima di sei giorni fa | ~10–12 |
| Offerta | le quattro liste secche | ~9 |
| **Prezzo** | **nel modulo `/contact`, campo 02: `$35,000 / $50,000 / $70,000 / UNLIMITED`**; più il `two-week discovery sprint` come prodotto d'ingresso | fuori dalla home |
| Chiamata all'azione | `Let's talk→` in header (sempre), `Get in Touch→` a metà, `contact` nel piede | 1 |

### Cosa arriva a chi NON scorre fino in fondo

**Qui, e solo qui fra i quattro siti, arriva tutto l'essenziale.**

A **0,3 secondi**, senza aver scorso di un pixel e senza aspettare nessun
caricamento, il visitatore ha davanti:
- **chi sono**: `darkroom.engineering`;
- **cosa fanno**: `Where Things Get Developed` e
  `A Studio Engineering Creativity into Reality.`;
- **per chi e perché**: `you've got a product that needs to be fast, polished,
  and built to last. we're the studio that gets it there — design, engineering,
  and system thinking working together so you ship with confidence, not
  compromise.`;
- **dove cliccare**: `Let's talk→` e il menu `Work / About / Contact`.

Chi chiude la scheda dopo tre secondi ha comunque ricevuto il messaggio completo.
È l'unico dei quattro di cui si possa dire questo, e non è un caso: il peso
iniziale è **~425 KB compressi** in tutto, i quattro font hanno le metriche di
fallback dichiarate perché il testo non si sposti, e il tema è nel markup.
**Il sito più severo esteticamente è anche il più gentile con chi ha fretta.**

Quel che si perde non scorrendo è la **prova**: i tre lavori, le testimonianze,
le librerie e il registro. Cioè il materiale che serve a decidere, non a capire.

### I testi veri principali

> **H1**: `Where Things Get Developed`
> **Definizione**: `[ Darkroom ], noun` — `1. A Lightproof Room for Developing Photographs.` — `2. A Studio Engineering Creativity into Reality.`
> **Sommario**: `you've got a product that needs to be fast, polished, and built to last. we're the studio that gets it there — design, engineering, and system thinking working together so you ship with confidence, not compromise.`
> **Claim**: `We bring brands and interfaces to life with code that runs smooth and scales right.` + `We've built for teams who care about craft. If you want engineers who speak design fluently and sweat the details that make the difference, we should talk.`
> **Chiamate all'azione**: `Manifesto→` · `All Work→` · `All Tools→` · `Get in Touch→` · `Let's talk→` · `Become an Open Source Sponsor`
> **Su Satus**: `The starting point for high-performance web experiences. Next.js 16, React 19, TypeScript strict, Zod validation, smooth animations, WebGL, and production-ready integrations — all wired up and ready to ship.`
> **Piede**: `©2026 darkroom.engineering all rights reserved`

Testimonianze, testi delle tende e liste complete sono nella sezione
**Testi veri** più sotto.

---

## Cosa vende

Sviluppo front-end e creative development su commissione: siti e interfacce "motion-rich", headless commerce, WebGL, integrazioni Web3/API, plugin Framer. Non vendono design d'immagine, vendono **ingegneria del front-end**: il claim è "code that runs smooth and scales right".

## A chi

A chi ha già un prodotto o un brand e deve farlo girare veloce: startup finanziate, piattaforme Web3, team di prodotto con un design system esistente. Il compratore tipo è un CTO o un head of design che non vuole spiegare le cose due volte — la testimonianza scelta in home lo dice esplicitamente: *"clearly everyone is very senior and action oriented without needing much guidance from us"*. Uscendo dal sito deve pensare: questi sono quelli che hanno scritto Lenis, quindi il mio scroll non farà schifo.

## Idea regista

Il sito è **una camera oscura sotto lo scroll**: fondo nero, testo rosso, tutto in monospaziato maiuscolo come un log di terminale, e ogni transizione è una tenda che si alza (`clip-path: inset(100% 0 0)`) come la carta che esce dallo sviluppo.

## Il momento

**L'easter egg del fondo pagina**, e non è un modo di dire: è codice verificato (chunk `js/c17.js`, componente `BackroomsEasterEgg`).
Quando sei arrivato in fondo (`Math.abs(lenis.scroll - lenis.limit) < 1`) e **continui a girare la rotellina verso il basso**, il componente somma i `deltaY` in una finestra che si azzera dopo 500 ms di inattività. Superati **300 px accumulati** parte una tenda a schermo intero (`z-[100]`, `bg-secondary`, testo `color-primary`) che rivela la frase:

> `you've found the darkroom backrooms.`

Dopo 800 ms uno stato intermedio, dopo **2000 ms** `router.push('/backrooms')`. La tenda entra con `clip-path: inset(100% 0 0)` → `inset(0)` in **1.2 s `cubic-bezier(.7,0,.3,1)`**, il testo in 0.8 s con la stessa curva; l'uscita è 1 s / 0.6 s.

Il secondo momento, più visibile, è la sezione dei tre progetti: 300vh di scroll in cui tre video a schermo intero si sovrappongono con un tergicristallo verticale (dettagli sotto).

## Struttura, sezione per sezione

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |
|---|---|---|---|
| Header (fisso in alto) | logo `darkroom.engineering`, nav Work/About/Contact, glifi animati, "Let's talk→" | clic | altezza 28px @375 / 22px @1440 |
| Hero | H1 in 4 parole su griglia, la definizione di "[ Darkroom ], noun", paragrafo di posizionamento, bottone "Manifesto→" | legge | ~1 |
| Selected work | 3 video a piena pagina (Oreo & BTS, Looped, Ibicash) impilati in sticky | scorre; i video si scoprono uno sull'altro | **3** (contenitore `h-[300vh]`, `main` sticky `h-dvh`) |
| Nota + "All Work→" | didascalia sui tre progetti | clic | ~0.5 |
| What Clients Say | 3 citazioni in griglia, senza nome cliente ("Past Client", "Web3 Partner", "Design & Development Partner") | legge | ~1 |
| Tools We Build and Use | tab Satus / Lenis / Hamo / Tempus + video `SATUS.mp4` + link "Satus↗" e "All Tools→" | clic sulle tab | ~1 |
| Manifesto commerciale | "We bring brands and interfaces to life…" + "Get in Touch→" | clic | ~1 |
| Quattro colonne | Services, Clients, Technologies, Awards/Features — liste secche | legge | ~1 |
| Activity Log | 33 righe datate `AAAA/MM/GG | categoria | descrizione`, dal 2026/02/06 al 2025/03/22 | legge/scorre | ~2 |
| Barra piede sticky (solo desktop) | 4 quadratini tema + "Become an Open Source Sponsor" | clic | sticky `bottom-0`, alta quanto l'header |
| Real footer | parola gigante `darkroom`, pattern a righe, nav completa (home/work/about/contact, open source, social), © 2026 | clic | wrapper alto `100svh - header-height`, dentro uno `stickyWrapper` di **200vh** → rivelazione a velocità dimezzata |

## L'esperienza in ordine di tempo

**Primi dieci secondi (desktop, arrivo diretto sulla home)**

- **0.0 s** — HTML prerenderizzato da Vercel (`X-Nextjs-Prerender: 1`, `X-Vercel-Cache: HIT`), 24.5 KB in brotli. `<html data-theme="simple">` è già nel markup: **niente flash di tema**, si parte già nero con testo rosso.
- **0.0–0.3 s** — quattro woff2 in preload (`therma`, `sauce`, `mono`, `sans`) con metriche di fallback su Arial (`ascent-override`, `size-adjust`) già dichiarate: il salto tipografico è compensato prima ancora che i font arrivino.
- **~0.3 s** — l'H1 "Where / Things / Get / Developed" è a schermo, 200px @1440, `line-height: 80%`, `letter-spacing: -.694vw`, disposto su griglia a 8 colonne: le quattro parole occupano celle diverse e "Developed" è allineato a destra. Il contenitore ha `overflow-hidden` — un mascheramento pronto per una rivelazione a tendina (il JS della home non è nei chunk iniziali, **rivelazione non verificata**).
- **~0.5 s** — parte la favicon animata: ogni **500 ms** riscrive `link[rel="icon"]` con un SVG 10×10 in base64, ciclando 14 glifi (quadrati pieni/vuoti/anelli) colorati con `theme.primary`/`theme.secondary`. Stesso alfabeto di glifi che ruota dentro l'header e dentro ogni bottone (`animation: 2s linear infinite rotate`).
- **~0.5 s** — Lenis si aggancia. Non ha un rAF proprio (`autoRaf: false`): viene fatto avanzare da **Tempus**, l'unico `requestAnimationFrame` di tutta la pagina.
- **1–10 s** — l'utente scorre. Lo scroll è interpolato con `lerp: 0.125`, senza `duration`/`easing` (in Lenis i due modi si escludono). Compare la barra di scorrimento custom a destra, larga `.277vw` (4px @1440), che appare solo quando l'inner porta `data-lenis="started"`.

**Poi, a blocchi**

- **Selected work** — il `<section>` è alto 300vh, dentro c'è un `div` sticky alto `100dvh` con i tre progetti in `position:absolute; top:0` sovrapposti. Un hook `useScrollTrigger` **fatto in casa** (non GSAP ScrollTrigger) con `start: "top center"`, `end: "bottom center"`, `steps: 3` chiama `onProgress`; per ogni progetto oltre il primo scrive a mano `clip-path: inset(${(1-p)*100}% 0 0 0)` con `p = Math.min(2 * progresso_step, 1)`. Tradotto: **ogni video si scopre dal basso verso l'alto nella prima metà del suo terzo di scroll, e resta fermo nella seconda metà**. Nel frattempo il video attivo va in `play()` e gli altri in `pause()`. I `<h2>` con i nomi sono `sticky` dentro la stessa cella di griglia, con una riga a 1px sotto (`::before`, `opacity: .5`).
- **Cambio pagina** — non è una navigazione, è una tenda. Vedi la tabella animazioni: è la cosa più costruita del sito.
- **Fondo pagina** — il footer vero sta dentro uno `stickyWrapper` alto 200vh in un wrapper alto `100svh - header-height` con `overflow-clip`: il footer si scopre a metà velocità mentre il contenuto gli scorre sopra. La parola `darkroom` è alta **17.43vw** (251px @1440) in font `sauce`, ancorata `bottom: 6.25vw`, `translateX(-50.5%)`. Sopra, un pattern di righe orizzontali fatto con `repeating-linear-gradient(0deg, var(--color-contrast) 0 2px, transparent 2px 8px)` alto 35.5vw.

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| scroll di pagina | posizione di scroll | wheel / touch | **Lenis 1.3.25, `lerp: 0.125`**, nessuna `duration` | rAF fornito da Tempus, non da Lenis |
| tre video "Selected work" | `clip-path: inset(X% 0 0 0)` | scroll, 300vh, 3 step | lineare sul progresso, `Math.min(2*p, 1)` | hook `useScrollTrigger` proprietario su Lenis + `useRect` di hamo, non GSAP |
| marquee del banner (pagine interne) | `translate3d(-x, 0, 0)` | tempo **+ velocità di scroll Lenis** | `r = 0.1 * speed * (1 + |lenis.velocity| / 5) * deltaTime` | `modulo(transform, larghezza)`, `repeat: 10`, si ferma se fuori viewport (IntersectionObserver) o in hover |
| tenda di transizione, uscita | `#curtain` `clip-path` `inset(100% 0 0 0)` → `inset(0)` | stato (cambio rotta) | `sine.inOut`, **1.4 s** | GSAP 3.15.0 timeline |
| tenda, contenuto | `#curtain-content` `translateY` 100% → 0 | stesso | `power2.out`, **2 s**, posizione 0 | |
| tenda, righe di testo | `.curtain-text-line-left` x da `E[i]%` a `E[i]-4%`; `-right` speculare | stesso | `sine.out`, **2 s** | sfalsamento per riga da un array fisso `[34,14,8,22,10,26,20,12,28,16,4,24,18,6,2,30,…]` |
| pagina che esce | `main` e `#webgl`: `y: 0 → -50vh`, `opacity: 1 → 0` | stesso | `sine.inOut`, **1 s** | |
| header che esce | `y: 0 → -100%` | stesso | `power2.inOut`, **0.7 s**, in coda (`">"`) | |
| tenda, entrata nuova pagina | `#curtain-content` y → `-(altezzaLenis - 151px)` su desktop, **`-240.5vw`** su mobile | stesso | `power2.inOut`, **1.5 s** | due formule diverse desktop/mobile |
| righe testo, entrata | x `E[i]-4%` → `E[i]-16%`, poi `y: 0 → -200%` | stesso | `sine.in` 2 s, poi `power2.inOut` 1 s a `">-1.2"` | |
| pagina che entra | `main`/`#webgl`: `y: 100vh → 0`, `opacity: 0 → 1` | stesso | `power2.inOut`, **1.48 s**, alla label `curtain-up` | |
| header che rientra | `y: -100% → 0` | stesso | `expo.out`, **1 s**, a `">-.5"` | |
| easter egg backrooms | tenda `clip-path` + testo | wheel accumulato oltre il fondo | `cubic-bezier(.7,0,.3,1)` — 1.2 s tenda, 0.8 s testo | uscita 1 s / 0.6 s |
| glifi (header, bottoni) | rotazione continua | tempo | `2s linear infinite` | CSS puro |
| favicon | 14 SVG in ciclo | tempo | `setInterval` **500 ms**, `i % 13` | data URI base64, colori dal tema attivo |
| hover generici | sfondo/colore | stato | `background-color .5s var(--ease-out-expo), color .3s var(--ease-out-expo)` | `--ease-out-expo: cubic-bezier(.19,1,.22,1)` |
| entrate secondarie | trasformazione + opacità | stato | `transform .6s / opacity .6s` con `--ease-out-expo` | |
| clip generici | `clip-path` | stato | `.4s var(--ease-gleasing)` | `--ease-gleasing: cubic-bezier(.4,0,0,1)` |

Durante ogni transizione di pagina **Lenis viene fermato** (`lenis.stop()`) e riavviato in `onAfterEnter`. Le rotte con transizione sono esattamente `["/", "/work", "/about", "/store", "/contact"]`.

## Colori

Il sito ha **cinque temi** commutabili a caldo (`document.documentElement.setAttribute('data-theme', …)`). La home parte su `simple`. Il nome `--color-primary` indica **lo sfondo**, `--color-secondary` **il testo** (verificato da `bg-primary` / `text-secondary` nel markup).

| ruolo | esadecimale | dove si usa |
|---|---|---|
| nero | `#000000` — `oklch(0 0 0)` | sfondo dei temi `dark` e `simple`, testo dei temi `light` e `red` |
| bianco | `#ffffff` — `oklch(1 0 0)` | sfondo `light`/`nasa`, testo `dark` |
| rosso | `#e30613` — `oklch(0.577 0.2339 27.95)` | **il colore della casa**: testo nei temi `simple` e `nasa`, sfondo nel tema `red` |
| rosso scuro | `#c20510` — `oklch(0.5131 0.2076 27.8)` | superfici/`contrast` nel tema `red` |
| rosso bruciato | `#390205` — `oklch(0.2203 0.0849 24.47)` | **superfici del tema di default `simple`**: sfondo dei bottoni e dei blocchi (`bg-contrast`), righe del pattern del footer |
| grigio chiaro | `#e5e5e5` — `oklch(0.9219 0 0)` | superfici nei temi `light` e `nasa` |
| grigio scuro | `#262626` — `oklch(0.2686 0 0)` | superfici nel tema `dark` |
| hover | `color-mix(in oklab, var(--color-secondary) 50%, transparent)` | stati hover, sempre il testo al 50% |
| bordi | `var(--color-contrast)` a 1px | `border-b-1 border-contrast` sotto ogni H1/H2 di sezione |

Composizione dei cinque temi (sfondo → testo → superficie):
`light` bianco→nero→#e5e5e5 · `dark` nero→bianco→#262626 · **`simple` nero→#e30613→#390205 (default home)** · `red` #e30613→nero→#c20510 · `nasa` bianco→#e30613→#e5e5e5.

Nel piede desktop ci sono 4 quadratini che commutano fra `light`, `simple`, `dark`, `red`. `nasa` esiste nel codice ma non è esposto in home.

## Tipografia

Quattro famiglie, tutte **self-hosted** in un solo woff2 ciascuna, servite da `/_next/static/media/` (nessun servizio esterno; il CSP ha `font-src 'self' data:`).

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| H1 hero (home) | `therma` (ASTherma Bold Condensed) | 700 | **100px @375 / 200px @1440** (26.667vw / 13.889vw) | 80% | `letter-spacing: -1.333vw` mobile, `-.694vw` desktop; ogni parola con `margin-left` negativo |
| `.h1` (titoli di sezione) | `therma` | 700 | 72px @375 / 120px @1440 | 80% | `letter-spacing -.03em` / `-.05em`, `font-feature-settings: "ss04"` |
| `.h2` | `therma` | 700 | 32px @375 / 48px @1440 | 80% | `-.03em`, `ss04` |
| `.p` / `.cta` / `.link` | `mono` (Replica Mono LL Web Regular) | **200** | 12px @375 / 14px @1440 | 125% / 120% | `-.01em`; `.cta` e `.caption` accendono `font-feature-settings: "case"` (punteggiatura alzata per il maiuscoletto) |
| `.caption` | `mono` | 200 | 8px @375 / 10px @1440 | 125% / 120% | usata per le liste Services/Clients/Technologies |
| parola "darkroom" del footer | `sauce` (ASModule2 VF, variabile) | 400 | 65px @375 / 251px @1440 (17.33vw / 17.43vw) | 100% | è l'unico font variabile; la tenda di transizione usa `font-variation-settings: "DENS" 50` |
| — | `sans` (Replica LL Web Bold) | 700 | — | — | dichiarato ma non l'ho visto usato in home — **non verificato** |

Tutte le famiglie hanno un `@font-face` di fallback su `local(Arial)` con `ascent-override` / `descent-override` / `size-adjust` calcolati (es. `therma Fallback`: ascent 149.24%, size-adjust 67%): il layout non si sposta quando i font atterrano. Praticamente tutto il sito è **uppercase**.

I corpi non sono in px fissi ma in una formula fluida: `calc(((N*100)/var(--device-width))*1vw)`, con `--device-width: 375` sotto 800px e `1440` sopra. Cioè **tutto scala col viewport dentro ogni fascia**, e c'è un solo salto a 800px.

## Testi veri

**Titolo (H1)**: `Where Things Get Developed`

**Definizione sotto il titolo**:
`[ Darkroom ], noun`
1. `A Lightproof Room for Developing Photographs.`
2. `A Studio Engineering Creativity into Reality.`

**Sommario hero**: `you've got a product that needs to be fast, polished, and built to last. we're the studio that gets it there — design, engineering, and system thinking working together so you ship with confidence, not compromise.`

**Claim commerciale**: `We bring brands and interfaces to life with code that runs smooth and scales right.`
seguito da: `We've built for teams who care about craft. If you want engineers who speak design fluently and sweat the details that make the difference, we should talk.`

**Meta description**: `We're a global design and development studio shipping fast, motion-rich, and scalable digital work. WebGL, headless builds, and open source tools—crafted by a team distributed across Spain, Italy, France, Argentina, and the US.`

**Open Graph description**: `Welcome to darkroom, where things get developed. you might've seen our work out in the wild. stuff like https://ibi.cash↗, badomensofficial.com↗ and looped.poly.ai↗. we're the ones behind the curtain, making sure it loads fast, looks good, and doesn't fall over when it hits the front page of reddit.`

**Menu (header desktop)**: `Work` · `About` · `Contact` — più `Let's talk→`

**Menu (footer)**: `home` · `work` · `about` · `contact` — `open source`: `all OSS projects`, `satus`, `lenis`, `hamo`, `tempus`, `elastica`, `aniso`, `cc-settings` — `social`: `github`, `X (twitter)`, `Instagram`, `LinkedIn`, `Inspiration`

**Chiamate all'azione**: `Manifesto→` · `All Work→` · `All Tools→` · `Get in Touch→` · `Satus↗` · `Become an Open Source Sponsor`

**Didascalia dei tre progetti**: `A Small Sample, Just Three Builds We Liked for Different Reasons. If You Want the Full Stack (Live Links, Case Studies, the Weird Stuff), Head Over to the Work Page.`

**Titoli di sezione**: `What Clients Say` · `Tools We Build and Use. Now Yours Too.` · `Activity Log`

**Sottotitoli**: `Open-Source Libraries Built for Speed and Reliability, Powering Real Projects — Now They Can Help You Too.` · `A Running Log of What We're Shipping. New Projects, Open-Source Updates, and the Occasional Deep Dive.`

**Testimonianze (anonime)**:
- `nothing you guys were exceptional and brilliantly clear + prescriptive on what was possible vs. not` — `Past Client`
- `clearly everyone is very senior and action oriented without needing much guidance from us` — `Web3 Partner`
- `Seeing what you've built already and the people you've worked with — this is the biggest selling point.` — `Design & Development Partner`

**Testi delle tende di transizione** (uno per rotta, ripetuto su tutte le righe della tenda):
- `/work` → `work:// designed to be built, built to be used.`
- `/about` → `about:// what we stand on, and what we stand for`
- `/contact` → `contact:// if you've got a vision, we've got questions`
- `/store` → `store:// merch for people who ask "what typeface is that?"`

**Easter egg**: `you've found the darkroom backrooms.`

**Piede**: `©2026 darkroom.engineering all rights reserved`

**Liste secche del piede**:
- Services: `Front-End Development, Back-End Development, Framer Plugin Development, Web3 Integration, APIs Integration, Headless E-Commerce, WebGL, Motion & Interaction, Creative Development`
- Clients: `Argus Labs, Every, Drive Capital, Ecotrak, Framer, Griflan, Milkinside, Studio Freight, Viture`
- Technologies: `Next.js, Contentful, HubSpot, Vercel, Lenis, R3F, Three.js, GSAP, Sanity, Framer, Figma`
- Awards / Features: `Awwwards, CSS Design Awards, Muzli, FWA`

## Mobile

Il breakpoint è **uno solo: 800px** (`@media (max-width:799.98px)` / `(min-width:800px)`). Il telaio di progetto passa da **1440×816 / 8 colonne / gap 16 / margine 16 / header 22px** a **375×852 / 4 colonne / gap 8 / margine 8 / header 28px**. Non ci sono breakpoint intermedi: sotto gli 800px tutto è ricalcolato su una larghezza nominale di 375.

**SPARISCE sotto 800px** (verificato, regole `display:none !important` e `.desktop-only`):
- la nav orizzontale `Work / About / Contact` nell'header;
- **la barra di scorrimento custom** (`.scrollbar{display:none}` dentro il media query mobile) — sul telefono torna quella di sistema;
- **la barra sticky in fondo con i 4 selettori di tema e "Become an Open Source Sponsor"** (`desktop-only`): sul telefono **non si può cambiare tema**;
- i glifi decorativi dentro i bottoni (`.glyphs` marcato `desktop-only` sui bottoni; nell'header invece i glifi sono `mobile-only`, cioè è il contrario);
- l'`<h2>` desktop di "What Clients Say" e del claim, sostituiti da gemelli `mobile-only` con **interruzioni di riga diverse** (`We bring brands and interfaces / to life with code…` a mobile contro `We bring brands and interfaces to life / with code…` a desktop): due `<h2>` distinti nel DOM, non un ritorno a capo automatico.

**VIENE SOSTITUITO**:
- la nav diventa un **hamburger** (`aria-label="Open menu"`, tre `<span>`) che apre un dialog Base UI; all'apertura il codice fa `document.documentElement.classList.toggle('overflow-hidden', isNavOpened)`, cioè blocca lo scroll dal CSS e non con `lenis.stop()`;
- **i video dei tre progetti cambiano file**: `useDeviceDetection().isMobile` fa `src.replace(/\.mp4$/, '-mobile.mp4')`. Verificato che i file esistano davvero. Sono più leggeri ma non sempre: oreo 720 KB → 148 KB, looped 1.04 MB → 186 KB, ma **ibicash 6.17 MB → 1.22 MB**;
- la tenda di transizione ha una formula diversa: su desktop sale di `altezzaPagina - 151px`, su mobile di un fisso `-240.5vw`;
- il numero di righe della tenda è calcolato a runtime: `ceil(altezzaFinestra / 106px)` su desktop, `/ 80px` su mobile.

**RESTA**:
- **lo scroll Lenis, e anzi sul telefono fa di più**: il sito attiva `syncTouch: true` con `syncTouchLerp: 0.075` (vedi Stack). Non è la scelta di default della loro libreria;
- l'impilamento sticky dei tre progetti a 300vh, identico;
- il rapporto tipografico: i corpi sono la stessa formula fluida, quindi H1 100px su 375 di larghezza è **proporzionalmente più grande** che a desktop (26.7% della larghezza contro 13.9%);
- l'activity log completo, tutte e 33 le righe;
- la favicon animata e i glifi rotanti dell'header.

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| framework | **Next.js App Router**, React con il compiler attivo | VERIFICATO | `X-Nextjs-Prerender: 1`, `/_next/static/chunks/`, e nei bundle il pattern `(0,r.c)(18)` del React Compiler (memo cache) ovunque |
| bundler | **Turbopack** | VERIFICATO | `chunks/turbopack-3ttl9kxhdgn10.js` |
| starter | **satus**, il loro boilerplate open source | VERIFICATO | il codice del wrapper Lenis nel bundle è identico riga per riga a `components/layout/lenis/index.tsx` del repo satus; l'activity log lo dichiara |
| scroll | **Lenis 1.3.25** | VERIFICATO | stringa di versione `e="1.3.25"` nel chunk che contiene il costruttore Lenis |
| loop rAF | **Tempus** (`tempus/react`, `useTempus`) | VERIFICATO | `useTempus(({time}) => lenisRef.current.lenis.raf(time))` nel bundle |
| misure/hook | **hamo** (`useRect`, `useWindowSize`, `useIntersectionObserver`, `useTransform`, `useDeviceDetection`) | VERIFICATO | chiamate presenti nei chunk |
| animazione | **GSAP 3.15.0** + TextPlugin, **solo per le transizioni di pagina** | VERIFICATO | `version="3.15.0"`, timeline della tenda; ScrollTrigger **non** risulta usato: gli effetti di scroll passano da un `useScrollTrigger` proprietario costruito su Lenis + hamo |
| CSS | **Tailwind v4** con token custom + CSS Modules | VERIFICATO | classi `col-span-full`, `dt:` come variante desktop, accanto a `*-module__HASH__nome`; `--spacing-*`, `--ease-*` come token |
| 3D / WebGL | **assente sulla home** | VERIFICATO | nessun `<canvas>`, nessun `#webgl` nel DOM, nessuna occorrenza di `THREE`/`WebGLRenderer` nei chunk della home. Il codice della transizione anima un `#webgl` che qui non esiste: predisposizione per altre rotte |
| componenti a11y | **Base UI** | VERIFICATO | `data-base-ui-click-trigger`, id `base-ui-_R_…` sull'hamburger |
| CMS | **Sanity** (e Contentful dichiarato) | SUPPOSTO | il CSP autorizza `cdn.sanity.io` e `connect-src *.sanity.io`; il piede elenca sia Sanity sia Contentful. Non ho visto una risposta dal CMS |
| immagini | dominio dedicato `assets.darkroom.engineering` | VERIFICATO | voce `img-src` del CSP; i tre video della home sono però serviti dallo stesso dominio in `/images/` |
| hosting | **Vercel**, regione `fra1` | VERIFICATO | `Server: Vercel`, `X-Vercel-Id: fra1::…` |
| analytics | `@vercel/analytics` | SUPPOSTO | presente nel layout satus; nel CSP c'è `*.google.com` (reCAPTCHA sul form contatti, plausibile) |
| easter egg / rotte | `/backrooms`, `/store`, `mc.darkroom.engineering` | VERIFICATO | rotte nel bundle e nell'activity log |

## Peso e prestazioni

Numeri misurati con `curl` il 13/08/2026 dall'Europa (edge `fra1`, cache HIT). Nessun punteggio Lighthouse: non ho aperto un browser.

- **HTML**: 467.301 byte non compressi → **24.529 byte** con brotli. È un prerender statico completo (tutta la home è nel markup, activity log incluso).
- **CSS**: 2 file, **13.648 byte** compressi (5.633 + 8.015). Non compressi: 66.973.
- **JS iniziale**: 27 chunk, **267.345 byte** compressi in totale (5,0 MB non compressi). Include GSAP core (~70 KB non compressi) caricato subito.
- **Font**: 4 woff2, **119.856 byte** in totale, tutti in preload. Il più pesante di gran lunga è `ReplicaLLWeb_Bold` con **67.126 byte** — ed è la famiglia `sans` che non ho visto usata in home: sono ~67 KB scaricati in preload per niente, se la mia lettura è giusta.
- **Totale al primo caricamento**: **≈ 425 KB** compressi, senza contare i video.
- **Video**: tutti con `preload="none"` e `poster` jpg derivato dal nome del file, quindi non pesano finché non entrano in scena. Desktop: ibicash 6.172.647 B, looped 1.043.109 B, oreo 720.154 B, SATUS 144.620 B → **~8,08 MB** se si scorre tutta la home. Mobile: 1.215.159 + 186.093 + 147.899 → **~1,55 MB**. Sono `muted loop playsInline`, quindi niente audio.
- **Sicurezza/cache**: CSP restrittivo dichiarato per intero (`default-src 'self'`), HSTS con preload a 2 anni, `Permissions-Policy: camera=(), microphone=(), geolocation=()`. `Cache-Control: public, max-age=0, must-revalidate` con `X-Nextjs-Stale-Time: 180`.

---

# APPROFONDIMENTO: come Darkroom usa Lenis sui propri progetti

Sono gli autori di Lenis (15.396 stelle su GitHub). Questa è la parte che vale davvero, perché i valori sono presi **dal bundle di produzione del loro sito**, non dalla documentazione.

## I valori esatti che usano sul proprio sito

Estratto da `darkroom.engineering/_next/static/chunks/*.js` (chunk del componente `Lenis`, deminificato a mano):

```js
<ReactLenis
  ref={lenisRef}
  root={root}
  options={{
    ...options,
    lerp: options?.lerp ?? 0.125,   // NON 0.1, che è il default della libreria
    autoRaf: false,                 // il rAF lo dà Tempus
    anchors: true,
    autoToggle: true,
    syncTouch: true,                // <-- default di libreria: false
    syncTouchLerp: 0.075,           // = default
    prevent: (node) => /* VERCEL-LIVE-FEEDBACK, theatrejs-studio-root */
  }}
/>
```

E il rAF viene da fuori:

```js
useTempus(({ time }) => {
  if (lenisRef.current?.lenis) lenisRef.current.lenis.raf(time)
})
```

**Le tre cose che contano:**

1. **`lerp: 0.125`, e nessuna `duration`.** In Lenis i due modi si escludono: se definisci `lerp`, `duration` ed `easing` vengono ignorate (README, riga della tabella opzioni: *"Useless if lerp defined"*). Loro stanno sul lerp. 0.125 contro il default 0.1 significa **scroll leggermente più reattivo e meno "galleggiante"** del default della loro stessa libreria.
2. **`syncTouch: true` sul telefono.** Questa è la scelta più significativa e **non è nello starter**: il repo `satus` non imposta `syncTouch`, quindi resta `false` (scroll nativo su touch). Il sito dello studio lo accende, con `syncTouchLerp: 0.075` (uguale al default) e `touchInertiaExponent: 1.7` (default, non toccato). Il README avverte: *"Mimic touch device scroll while allowing scroll sync (can be unstable on iOS<16)"*. Traduzione operativa: **loro sul proprio sito si prendono il rischio, e nello starter che regalano no.**
3. **`autoRaf: false` + `useTempus`.** Un solo `requestAnimationFrame` per tutta l'app. Il marquee, Lenis e tutto il resto girano nello stesso tick di Tempus, in ordine di priorità. È il motivo per cui il sito non ha loop concorrenti.

## Come si comporta il touch, riga per riga

Dal sorgente di `packages/core/src/lenis.ts` (verificato anche nel bundle in produzione), la logica dell'evento touch è:

```js
const isTouch = /* evento touch */
const isSyncTouch = isTouch && this.options.syncTouch
const isTouchEnd = isTouch && event.type === 'touchend'

if (isTouchEnd) {
  delta = Math.sign(delta) * Math.abs(this.velocity) ** this.options.touchInertiaExponent
}

this.scrollTo(this.targetScroll + delta, {
  programmatic: false,
  ...(isSyncTouch
    ? { lerp: isTouchEnd ? this.options.syncTouchLerp : 1 }   // 0.075 al rilascio, 1 durante il trascinamento
    : { lerp: this.options.lerp, duration: ..., easing: ... })
})
```

Cioè: **durante il trascinamento `lerp` è forzato a 1** (il dito muove la pagina 1:1, nessun ritardo), e **solo al `touchend` entra `syncTouchLerp: 0.075`** per l'inerzia, con la velocità elevata a `touchInertiaExponent` (1.7). È questo che dà l'inerzia lunga e morbida invece di uno stop secco.

## I default della libreria, per confronto

Dal costruttore (`packages/core/src/lenis.ts`) e dalla tabella del README:

| opzione | default | cosa usa darkroom.engineering |
|---|---|---|
| `lerp` | `0.1` | **`0.125`** |
| `duration` | `1.2` (in secondi) | non impostata (inutile con `lerp`) |
| `easing` | `t => Math.min(1, 1.001 - Math.pow(2, -10 * t))` | non impostata |
| `smoothWheel` | `true` | default |
| `syncTouch` | `false` | **`true`** |
| `syncTouchLerp` | `0.075` | `0.075` (esplicito) |
| `touchInertiaExponent` | `1.7` | default |
| `touchMultiplier` | `1` | default |
| `wheelMultiplier` | `1` | default |
| `autoRaf` | `false` | `false` esplicito, rAF da Tempus |
| `anchors` | `false` | **`true`** |
| `autoToggle` | `false` | **`true`** |
| `allowNestedScroll` | `false` | default (usano `prevent`, più economico) |
| `overscroll` | `true` | default |
| `respectReducedMotion` | `true` | **opzione presente solo su `main`, non nella 1.3.25 in produzione sul loro sito** |

Il README avverte su `allowNestedScroll`: *"Can create performance issues since it checks the DOM tree on every scroll event. If that's a concern, use `prevent` option instead."* — e infatti loro usano `prevent`, con una funzione che esclude il pannello di Vercel Live, quello di Theatre.js Studio e (nella versione satus) lo shadow root di react-scan.

## `prefers-reduced-motion`

Sul ramo `main` di Lenis esiste `respectReducedMotion` (default `true`): quando l'utente ha `reduce`, **il `lerp` viene forzato a 1** (lo scroll segue il dispositivo 1:1, `duration`/`easing` ignorati) e gli scroll programmatici saltano istantaneamente; Lenis continua a girare così la sincronizzazione con WebGL/DOM non si rompe, e si può leggere `lenis.prefersReducedMotion`.

**Attenzione**: quella opzione **non c'è nella 1.3.25 che gira sul loro sito** — l'ho verificato leggendo la lista dei parametri del costruttore nel bundle in produzione, dove non compare. È una funzionalità aggiunta dopo. Chi copia la configurazione oggi da npm deve controllare la versione.

## Il CSS obbligatorio (spesso dimenticato)

`autoToggle: true` **richiede** il CSS raccomandato, altrimenti non funziona. Da `packages/core/lenis.css`:

```css
html.lenis, html.lenis body { height: auto; }
.lenis:not(.lenis-autoToggle).lenis-stopped { overflow: clip; }
.lenis [data-lenis-prevent],
.lenis [data-lenis-prevent-wheel],
.lenis [data-lenis-prevent-touch],
.lenis [data-lenis-prevent-vertical],
.lenis [data-lenis-prevent-horizontal] { overscroll-behavior: contain; }
.lenis.lenis-smooth iframe { pointer-events: none; }
.lenis.lenis-autoToggle {
  transition-property: overflow;
  transition-duration: 1ms;
  transition-behavior: allow-discrete;
}
```

`autoToggle` sfrutta `transition-behavior: allow-discrete` per accorgersi da solo quando il wrapper smette di essere scorrevole: **Safari > 17.3, Chrome > 116, Firefox > 128**. Sotto quelle versioni va lasciato `false`.

## Come sincronizzano GSAP ScrollTrigger (quando lo fanno)

Nello starter `satus`, `components/layout/lenis/scroll-trigger.tsx`, la sincronizzazione è **due righe**, non lo `scrollerProxy`:

```js
const lenis = useLenis(() => ScrollTrigger.update())   // ad ogni scroll di Lenis
useEffect(() => { if (lenis) ScrollTrigger.refresh() }, [lenis])
```

Funziona perché Lenis muove lo scroll **reale** della finestra, non un contenitore trasformato: ScrollTrigger continua a leggere `window.scrollY`, gli basta sapere quando aggiornare. Ed è opt-in: `<Wrapper>` passa `syncScrollTrigger` solo quando serve.

Sul sito vero, però, **non usano ScrollTrigger per gli effetti di scroll**. Hanno un `useScrollTrigger` proprietario costruito su `useLenis` + `useRect`/`useWindowSize` di hamo, che imita la sintassi GSAP (`start: "top center"`, `end: "bottom center"`, `markers`, `onEnter`/`onLeave`/`onProgress`) e in più ha `steps: N` per suddividere il progresso in tappe. I default sono `start: "bottom bottom"`, `end: "top top"`. GSAP nel bundle c'è, ma serve alle timeline delle transizioni di pagina.

## L'ecosistema che ci gira intorno (repo pubblici, agosto 2026)

`lenis` (15.396 ⭐, smooth scroll) · `aniso` (440 ⭐, generatore di immagini ASCII) · `tempus` (327 ⭐, un solo rAF per tutta l'app) · `hamo` (312 ⭐, hook di misura) · `react-lenis` (223 ⭐, ora rientrato dentro `lenis/react`) · `satus` (979 ⭐, starter Next.js) · `novus` (starter React Router, stesso wrapper Lenis con gli stessi valori) · `elastica` (fisica 2D con binding React) · `spargo` (dithering GPU via WebGL) · `forma` (istanze statiche da font variabili) · `create-darkroom` (scaffolder) · `cc-settings` (42 ⭐, la loro configurazione di Claude Code).

Fonti: https://github.com/darkroomengineering · https://github.com/darkroomengineering/lenis · https://github.com/darkroomengineering/satus · https://github.com/darkroomengineering/novus

## Tre cose da rubare

1. **Un rAF solo per tutta l'app, e Lenis dentro quello.** `autoRaf: false` + un ticker condiviso (Tempus o il proprio) che chiama `lenis.raf(time)`. Nel loro marquee lo si vede sfruttato fino in fondo: l'avanzamento è `0.1 * speed * (1 + Math.abs(lenis.velocity) / 5) * deltaTime`, con `modulo(x, larghezzaContenuto)` e `translate3d`, sospeso da un IntersectionObserver quando l'elemento è fuori schermo. Un solo loop, zero animazioni che girano invisibili, e un marquee che accelera quando scorri — quattro righe di codice.

2. **La pila sticky a `clip-path`, senza librerie.** Un `<section>` alto `300vh`, dentro un contenitore `sticky` alto `100dvh`, dentro N figli `position:absolute; top:0` sovrapposti nella stessa cella di griglia. Al progresso dello scroll scrivi a mano `element.style.setProperty('clip-path', 'inset(' + (1-p)*100 + '% 0 0 0)')` con `p = Math.min(2 * progressoDelloStep, 1)`. Ogni pannello si scopre nella prima metà del suo step e riposa nella seconda. Nessun pin, nessun `transform` sul contenitore, quindi niente si rompe: e i video si mettono in `play()`/`pause()` allo stesso segnale. Il costo è una proprietà CSS per frame.

3. **La transizione come oggetto scenico, non come dissolvenza.** La tenda è un `div` fisso a `z-50` con `clip-path: inset(100% 0 0)` che sale in 1.4 s `sine.inOut` mentre il contenuto della tenda entra da sotto (`translateY 100% → 0`, 2 s `power2.out`) e la pagina vecchia scivola via (`y: -50vh`, opacità a 0, 1 s). Dentro la tenda ci sono N righe di testo — N calcolato come `ceil(altezzaFinestra / 106)` — che scorrono orizzontalmente **sfalsate da un array fisso di offset** `[34,14,8,22,10,26,20,12,28,16,4,24,18,6,2,30,…]`: è quello sfalsamento pseudo-casuale ma deterministico a far sembrare la cosa costruita e non generata. Il testo cambia per destinazione (`work:// designed to be built, built to be used.`). E in tutto questo Lenis viene **fermato** all'inizio e **riavviato** in `onAfterEnter`: nessuno scroll fantasma sotto la tenda.

## Non verificato

- **Le animazioni di ingresso dell'H1 della home.** Il `<h1>` ha `overflow-hidden` e le parole sono `<span>` separati — è il classico apparecchio per una rivelazione a mascheratura — ma il modulo JS della home (`home-module__PvhTqa__*`) **non è fra i 27 chunk caricati con l'HTML**: arriva pigro e non l'ho catturato. Non affermo che ci sia una rivelazione: dichiaro che l'infrastruttura c'è e il comportamento non l'ho visto.
- **Se e come si muove la sezione "Tools We Build and Use"** (tab Satus/Lenis/Hamo/Tempus): stesso motivo, JS della home non catturato.
- **La rivelazione a parallasse del footer.** L'ho dedotta dalla geometria (`stickyWrapper` di 200vh dentro un wrapper `100svh - header-height` con `overflow-clip`, footer `sticky`): è il costrutto che produce mezza velocità. Non ho misurato lo spostamento a due altezze di scroll, quindi la dichiaro **derivata dal CSS, non misurata**.
- **Tutto ciò che riguarda il rendering reale**: nessun browser aperto, quindi niente Lighthouse, niente LCP/CLS/INP reali, niente FPS durante lo scroll, nessuna verifica visiva dei colori (che però sono letti dal CSS in oklch, non stimati da uno screenshot).
- **Il CMS.** Il CSP autorizza Sanity, il piede elenca sia Sanity sia Contentful, satus supporta entrambi. Quale dei due alimenti davvero questa home non l'ho stabilito.
- **`assets.darkroom.engineering`**: è autorizzato nel CSP per le immagini ma i video della home arrivano dal dominio principale. Non ho visto una richiesta a quel sottodominio.
- **Il font `sans` (Replica LL Web Bold, 67 KB)**: è in preload ma non ho trovato dove venga usato in home. Potrei aver semplicemente mancato la regola.
- **`/backrooms`, `/store`, `mc.darkroom.engineering`, la pagina `/work`, `/about`, `/contact`**: non le ho aperte. La scheda descrive la sola home.
- **Le pagine con banner a marquee**: il codice mostra che il banner esiste sulle rotte diverse da `/`, quindi la formula della velocità legata a Lenis l'ho letta ma non vista in azione.
- **Il premio.** Il profilo Awwwards è ancora intestato a "studiofreight" e non ho trovato una pagina premio per questa versione del sito. Che i 17 SOTD elencati siano dello stesso team è ragionevole (Lenis è fra quelli), ma **non è la premiazione di questa home**.

---

*Metodo: nessuna scheda di browser aperta. Tutto ottenuto con `curl`/`WebFetch` — HTML prerenderizzato, i 2 fogli di stile, i 27 chunk JS iniziali (deminificati a mano), i sorgenti su `raw.githubusercontent.com` e l'API GitHub. Gli artefatti scaricati stanno nella cartella di lavoro temporanea della sessione, fuori dai progetti.*
