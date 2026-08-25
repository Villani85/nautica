# Locomotive

- **URL**: https://locomotive.ca/en (canonical dichiarato nel `<link rel="canonical">`; `locomotive.ca` redirige a `/en`, versione FR su `/fr`)
- **Premio**: lo studio ha 91 Site of the Day, 4 Site of the Month e 1 Site of the Year su Awwwards ([profilo](https://www.awwwards.com/locomotive/)). Il sito dello studio **in questa versione non risulta premiato**: l'unico SOTD registrato per `locomotive.ca` e' del **23/07/2014**, punteggio 7.19 (design 7.53, usability 6.89, creativity 7.02, content 7.02), e si riferisce a una versione precedente ([scheda](https://www.awwwards.com/sites/locomotive)). Premi recenti dello studio su progetti clienti: Wolverine Worldwide SOTD 24/06/2026, Truck'N Roll SOTD 03/06/2026, Aupale Vodka SOTD 17/03/2026, Dulcedo SOTD 24/02/2026, Lightship SOTD 13/01/2026.
- **Studio**: Locomotive, 1211 Jean-Talon Est, Montreal (QC) H2R 1W1, Canada. Attiva dal 2008 (copyright in pagina: `©2008-2026`).
- **Anno**: il sito e' in vita da anni e viene ricompilato in continuo. Il bundle servito oggi porta il querystring `?v=1784828585344`, cioe' **23/07/2026 17:43 UTC** come data di build degli asset. La copia in home dice "Seven Years Running 2018-2024" (settimo Agency of the Year Awwwards); il micrositto collegato [six.locomotive.ca](https://six.locomotive.ca/en/) celebra i primi sei titoli, "From 2018 to 2023 ... six consecutive titles".
- **Letto il**: 13/08/2026

---

## L'ESPERIENZA (integrazione)

*Aggiunta del 13/08/2026. Letta con `curl` su `/en`, `/en/agency`,
`/en/contact` e `/en/work/lightship-1`. Il contenuto della pagina contatti e'
stato estratto dal blob JSON incorporato nell'HTML (66,5 KB, decodificato e
salvato). Nessun browser aperto.*

### Di cosa tratta il sito

Un'agenzia che **si presenta come una compagnia di persone, non come un
fornitore**. La home ha 5 progetti, un anello 3D che gira, i 30 membri del team
in un canvas WebGL, un negozio di magliette, sei articoli su Medium e sei viaggi
aziendali. Il lavoro c'e', ma occupa meno spazio della cultura.

### Cosa vende, e qual e' l'obiettivo finale

Vende **la reputazione di essere lo studio piu' premiato del mestiere**, e la
spende per ottenere una cosa sola: **un brief scritto bene.** L'obiettivo finale
non e' "far chiedere un preventivo" in senso generico — e' far compilare
`/en/contact`, che e' un questionario di qualifica commerciale in 10 passi
travestito da chiacchierata con un personaggio.

Il secondo obiettivo, dichiarato quanto il primo, e' **reclutare**: `Careers` e'
la terza voce di menu su quattro, e uno dei quattro rami della pagina contatti e'
`Join the team`.

### A chi

A direttori marketing nordamericani di aziende medio-grandi che **stanno gia'
valutando piu' agenzie**. Lo sanno benissimo: nel documento "The ideal digital
brief" c'e' un punto intitolato `Decision-Making Process` che chiede letteralmente
*"how many agencies are being considered. Share what drew you to Locomotive. Any
specific project?"*

### L'esperienza progettata, passo per passo

E' **una visita breve e severa, seguita da una conversazione lunga**. La home e'
alta 9,52 schermate — la piu' corta dei cinque insieme a by-kin.

1. **Preloader** — nero, il wordmark, due colonne di testo che si compongono a
   scatti. Paghi il tempo pieno **una volta per sessione**.
2. **Schermata 1** — video di un volto, H1 in `mix-blend-mode: difference`,
   header con `Work, Agency, Careers, Store` e **`Let's talk` gia' visibile**.
3. **Schermate 1-2,4** — `Seven Years / Running / 2018-2024`, `©2008-2026`,
   l'anello 3D che accelera, e il bottone `The dynasty →` verso un **micrositto
   dedicato ai premi** (six.locomotive.ca). La prova arriva alla **seconda
   schermata**: e' l'ordine opposto a Cuberto.
4. **Schermate 2,5-3,9** — `Featured work`: 5 righe, e la miniatura cresce *dentro*
   il nome del progetto quando ci passi sopra.
5. **Schermate 3,9-5,5** — il manifesto (`Design and code are only tools of
   expression. What sets us and our work apart is people.`) accanto al canvas 3D
   di un membro del team preso a caso, e la didascalia `Always looking / for top
   shelf talent`.
6. **Schermate 5,7-8,3** — `Extras`: articoli, viaggi, negozio. **Un terzo della
   home e' materiale non commerciale.**
7. **Schermate 8,5-9,5** — piede con indirizzo, telefono e `info@locomotive.ca`
   copiabile.

### Cosa deve fare il visitatore, e dove lo portano

Deve cliccare **`Let's talk`** e parlare con **L.I.S.A. — "Locomotive's
Interactive Super Assistant"**, un personaggio in video (clip HLS, una per ogni
passo) che conduce un modulo a domande, una alla volta, con una barra di
progresso. E' il percorso di contatto piu' elaborato dei cinque, di gran lunga.

**Le battute sono randomizzate**: ogni passo ha da 3 a 25 varianti scritte a
mano. Il solo saluto ne ha **25**, tipo `Love - Your - Outfit - Honey. How can I
help you, fabulous?` o `Speak, and the algorithm shall provide.` o `Took you long
enough! I had five existential crises while waiting.` Due visitatori non fanno la
stessa conversazione.

**Il bivio d'ingresso** (`greeting`) ha cinque uscite:
`Start a project` · `Join the team` · `Drop a quick word` · `Discover our
culture` · `Write us: info@locomotive.ca` (che al clic **copia l'indirizzo negli
appunti** invece di aprire il client di posta).

**Il ramo "Start a project", per intero** (con la percentuale di avanzamento
mostrata):

| passo | cosa chiede | campo |
|---|---|---|
| `project-intro` (10%) | battuta di apertura | — |
| `project-username` (20%) | `Alright, let's not be strangers. What should I call the genius behind this project?` | `Your name` |
| `project-company` (30%) | `Who's the lucky brand we're about to turn into a digital icon?` | `Company Name` + `Your job title` |
| `project-type` (40%) | `Alright, let's get into the juicy stuff—what are we building together?` | 4 scelte: `Branding` / `Web` / `Branding & Web` / `I have custom needs` |
| `project-custom-services` (45-50%) | solo se hai scelto "custom" | caselle: `Branding`, `Strategy`, `UX/UI`, `Web Development`, `Content creation` |
| `project-budget` (50%) | `Is it rude to talk about money? I have no manners, I'm a computer. What's your budget for this project?` | **`Your budget` — campo di testo LIBERO** |
| `project-deadline` (60%) | `Let's talk timing. When do you need this beauty out in the world?` | `Your deadline` (selettore mese) |
| `project-brief` (60%) | `Tell us about your project, or, upload a brief if you've got one.` | `My project is about...` + **`Browse my brief`** (upload) |
| `project-email` (60%) | `Mind sharing your email so I can follow up properly?` | `Your email` |
| `project-processing` (100%) | `Email noted. Spinning up the recap, flexing my digital muscles.` | — |
| `project-completion` | `Thanks for your time! Your project's in good hands` | rimanda a `Discover our culture` o `Back to the start` |

### Come e' organizzata la persuasione

| pezzo | dove | in quante schermate |
|---|---|---|
| **promessa** | `Digital-first Design Agency` in blend difference sul video | schermata 1 |
| **prova di autorita'** | `Seven Years Running 2018-2024` + `The dynasty →` | schermata 2 |
| **prova di lavoro** | 5 righe-progetto | schermate 2,5-3,9 |
| **prova umana** | manifesto + 30 modelli 3D del team | schermate 3,9-5,5 |
| **prezzo** | **mai dichiarato: chiesto, a testo libero** | in `/en/contact` |
| **chiamata all'azione** | `Let's talk` nell'header | **schermata 1** |

**Il prezzo, come lo gestiscono.** E' il metodo piu' furbo dei cinque e va
copiato con attenzione. Locomotive **non pubblica nessuna cifra e non offre
nessuna fascia**: mette un **campo di testo libero** etichettato `Your budget` e
lo fa chiedere da un personaggio che si scusa prima (*"Is it rude to talk about
money? I have no manners, I'm a computer"*). Chi risponde nomina un numero
proprio invece di scegliere fra opzioni loro: la trattativa parte dal numero del
compratore, non dal listino del venditore. Conseguenza pratica: **non si
auto-escludono i budget grossi** (una scala con tetto a "$100k+" fa da soffitto
psicologico; un campo vuoto no).

Accanto al campo del brief c'e' un secondo documento, apribile, intitolato
`What's a good brief?` → **`The ideal digital brief`**, *"Here are some essential
details we need from you to better understand your project and provide an accurate
quote"*, in **12 punti**: `Project Overview`, `Digital Requirements`, `Content
Strategy`, `Brand and Design`, `Technical Specifications`, `Content Management`,
**`Budget Constraints`** (*"Share the budget range for the project to align
expectations and scope from the start"*), `Schedule and Milestones`,
**`Decision-Making Process`**, `Legal and Compliance`, `Project Challenges`,
`Next Steps`. E' materiale da direzione commerciale, esposto come cortesia.

**Cosa arriva a chi non scorre.** Passa il minimo indispensabile e passa bene:
il nome, la categoria (`Digital-first Design Agency`), il livello (il video e il
blend), e **il modo di contattarli, gia' visibile nell'header**. Non passa
niente di dimostrativo: non un logo cliente, non un premio, non un lavoro. Ma
qui la piega e' meno grave che altrove, perche' **la prova (`Seven Years
Running`) arriva alla seconda schermata**: bastano due rotellate.

### Come mostrano i casi studio

`/en/work/lightship-1` e' una scheda tecnica prima che un racconto:
`Case Study` · `Categories: Digital, Experience, Content` · nome, anno, settore
(`Automotive`), citta' (`San Francisco, USA`), una riga di claim
(`Electric mobility reimagined for the road.`), il sito reale (`lightshiprv.com`),
`About` (il cliente, non loro), **`Awards (4)` con ente accanto a ciascuno**
(`Gold Prize — Idéa`, `Site of the Day — Awwwards`, `Developer award — Awwwards`,
`Site of the Day — CSSDA`), poi `Mandate` (cosa chiedeva il cliente) e `Approach`
(cosa hanno fatto), le immagini, `Visit lightshiprv.com`, e infine i **`Credits`
nominali completi**: cliente, branding, creative director, art director, UX
designer, front-end, back-end, project manager, account director. Poi
`Next Project`.

**Nessun numero di risultato, nessuna citazione del cliente, e nessun invito a
contattarli in fondo.** La prova che portano non e' il fatturato del cliente: e'
la giuria che li ha premiati e il nome delle persone che hanno fatto il lavoro.

### La pagina servizi

**Non esiste.** Non c'e' `/services` e non c'e' una voce di menu che ci somigli.
I servizi stanno dentro `/en/agency`, in un blocco `Capabilities` a due colonne,
senza descrizioni:

> **Digital** — `Digital strategy` · `Content strategy` · `User experience` ·
> `Copywriting` · `Art direction` · `Web design` · `Web development` · `Hosting` ·
> `E-commerce`
> **Branding** — `Brand identity` · `Logo design` · `Naming` · `Design system` ·
> `Campaign` · `Content creation` · `Motion design` · `Photo direction` ·
> `Video production`

Il resto della pagina agenzia e' manifesto (`We are an independent agency with a
deep skill set, big ideas, lots of heart and a global reputation.`), un film di
`[01:11]` (`Watch film`), la spiegazione del loro modello (`our own brand of
Triforce […] operations, design and development […] It's been that way since our
three founders—an ops guy, a designer and a dev—started the agency back in
2008`), e **l'elenco completo del personale con ruolo e anno di ingresso**
(9 design, 11 sviluppo, piu' gli altri reparti). L'anzianita' e' usata come prova.

### Testi veri (integrazione)

**Agency** — `We are an independent agency with a deep skill set, big ideas, lots
of heart and a global reputation.` · `Digital-first Design™` · `Made in Montréal`

**Mission** — `Our mission is to help brands build a future where design and code
are integral to their success, and where their digital presence becomes a digital
destination.`

**L.I.S.A., prima battuta** — `Hi there, I am L.I.S.A, Locomotive's Interactive
Super Assistant`

**L.I.S.A., il budget** — `Is it rude to talk about money? I have no manners, I'm
a computer. What's your budget for this project?` (varianti: `We've reached the
part where dreams meet dollars. What budget are we working with?` ·
`I'm not here to spend it, just to respect it.`)

**L.I.S.A., il brief** — `The more we know, the better we can bring your vision to
life. No detail is too small—trust me, I notice everything.`

**L.I.S.A., candidature** — `Careers are built. Legends are invited. So tell
me—how do you want in?` → `I'd like to explore current opportunities` /
`I want to freelance with you guys`

**L.I.S.A., cultura** — `Big talent, zero egos, and a shared obsession with doing
great work.`

**Caso studio, etichette** — `Mandate` · `Approach` · `Awards (4)` · `Credits` ·
`Visit` · `Next Project`

---

## Cosa vende

Servizi di agenzia digitale end-to-end per marchi che vogliono un sito-evento: identita' di marca, design, sviluppo, deploy e manutenzione. Il prodotto vero che vendono non e' il sito: e' la reputazione di essere lo studio che vince Awwwards piu' di chiunque altro, e la home e' costruita per dimostrarlo prima ancora di spiegare cosa fanno.

## A chi

Direttori marketing e brand manager di aziende medio-grandi nordamericane (nel portfolio in home: Lightship, Wolverine Worldwide, The Drake Hotel, Dulcedo, Scout Motors) e, in seconda battuta, sviluppatori e designer da assumere — c'e' una voce di menu "Careers" e un blocco "Always looking for top shelf talent" con un canvas 3D dei 30 membri del team.

Chi esce dal sito deve pensare due cose: (1) questi qui sono i piu' premiati del mestiere e non lo devono nemmeno dire, si vede dal sito stesso; (2) sono persone, non una software house — il testo centrale dice letteralmente che "design and code are only tools of expression, what sets us apart is people".

## Idea regista

Una pagina bianca, tipografica e severa in cui l'unica cosa "calda" e' il video del volto in apertura: tutto il resto e' testo enorme in un serif proprietario che si scompone in lettere quando lo tocchi.

## Il momento

I primi due secondi di scroll sulla home. L'eroe e' un video a schermo intero (un volto illuminato di rosso) e sopra c'e' l'H1 bianco in `mix-blend-mode: difference` — cioe' il titolo non ha un colore proprio, e' l'inverso del video, e su quel rosso diventa ciano. La sezione `.c-home-hero` alta 100vh contiene un `<div>` in `position: fixed` clippato da un `clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%)` sul genitore. Risultato: il video sta fermo come una finestra fissa mentre il contenuto scorre, e non appena il progresso di scroll dell'eroe supera **0.5** partono due cose insieme:

- il video si alza fino a `-25vh` (`transform: translate3d(0, calc(-25vh * var(--mapped-progress)), 0)`),
- un velo nero gli va sopra fino a `opacity: 0.75`.

A `--progress = 1` il video e' scuro e alzato, il titolo bianco resta l'unica cosa in campo, e la pagina passa al bianco. Tutta questa coreografia e' **CSS puro**: nessun tween per frame, solo una variabile `--progress` scritta sull'elemento dalla libreria di scroll.

C'e' un secondo momento minore ma piu' copiabile: nella lista dei progetti, passando il mouse su una riga, la miniatura del progetto **cresce da 0 a 1.5em di larghezza in mezzo alle due parole del titolo**, spingendole ai lati. Anche quello e' CSS, non JS.

## Struttura, sezione per sezione

Misure prese in pagina a viewport 1527x670 (`document.documentElement.scrollHeight / window.innerHeight`): la home e' alta **9.52 schermate**.

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |
|---|---|---|---|
| Preloader | schermo nero, wordmark SVG Locomotive, e due colonne di testo che si compongono a scatti ("Digital / Digital-First / Digital-First Design..." e "Based / Based in / Based in Montreal...") | aspetta | fuori flusso, si vede una sola volta per sessione |
| Header fisso | logo `Locomotive®`, un'icona-glifo, `Work, Agency, Careers, Store` separati da virgole, `Let's talk` a destra | naviga; sopra l'eroe l'header e' in `mix-blend-mode: difference` e la sua barra di fondo e' trasparente | fisso, 60px di altezza (`--header-height: 4rem` con root a 15px) |
| `c-home-hero` | video a tutto schermo + H1 in blend difference | scrolla | 0 → 1.00 |
| `c-home-summary` | "Seven Years / Running / 2018-2024" a parole sparpagliate in posizioni assolute, l'etichetta `©2008-2026`, un canvas WebGL con un anello che ruota, e il bottone `The dynasty →` verso six.locomotive.ca | guarda l'anello accelerare mentre scorre | 1.00 → 2.43 (1.43) |
| `c-featured-links` | titolo `Featured work` + 5 righe-progetto a tutta larghezza (Lightship, Wolverine Worldwide, The Drake Hotel, Dulcedo, Scout Motors) + riga `All Work` | passa il mouse: la miniatura si apre in mezzo al nome e si de-pixela | 2.49 → 3.85 (1.36) |
| `c-home-about` | manifesto in corpo H1 + canvas 3D con un membro del team a caso (30 `.glb` riggati) + didascalia "Always looking / for top shelf talent" | clicca il canvas per cambiare persona; trascina per orbitare | 3.89 → 5.45 (1.56) |
| `c-home-extras` | tre colonne — `Articles (13)`, `Culture`, `Store` — poi due immagini in griglia | legge, clicca gli articoli su Medium o lo shop | 5.68 → 8.29 (2.61) |
| `c-footer` | menu su quattro gruppi (Menu / Social / External / newsletter), indirizzo e telefono in corpo grande, `©2026` | copia la mail con un clic (`data-module-copy-to-clipboard`) | 8.53 → 9.52 (0.99) |
| Modali | overlay newsletter e overlay video, fuori flusso | — | — |

## L'esperienza in ordine di tempo

**Primi dieci secondi (prima visita nella sessione).** Le tempistiche sono lette dal sorgente `assets/scripts/preloader.js` recuperato dalla sourcemap pubblica.

- 0.00s — `main.css` non blocca il rendering (e' caricato con il trucco `media="print" onload="this.media='all'"`), quindi il primo paint e' il solo CSS critico inline: schermo `#000` pieno, testo `#fff`.
- 0.30s — il wordmark SVG (`min(250px, 70vw)` di larghezza) entra con `scale(0.9) → 1` + fade, 0.9s, `cubic-bezier(0.215, 0.61, 0.355, 1)`.
- Al `window.onload`, quando il CSS e' pronto, parte la timeline GSAP del preloader: i due blocchi di testo vengono spezzati con **SplitText** in `chars, lines`; i tracciati dell'SVG svaniscono con stagger 0.05 a partire da 0.25s.
- Ogni carattere compare a `blocco*0.25 + indice*0.01` secondi; nell'istante in cui compare **sfarfalla su 5 glifi casuali** presi da `!@#$%&+=qwerty…\/{}][-_()<>?` uno ogni **16ms**, poi si ferma sulla lettera giusta. Mezzo secondo dopo (1.5s per l'ultima riga) rifa lo stesso sfarfallio e sparisce.
- A timeline finita: il nodo del preloader viene rimosso dopo 1s, la promessa che sblocca la pagina si risolve dopo 5×16 = 80ms.
- **Seconda visita nella stessa sessione**: c'e' `sessionStorage['locomotive.quickpreload'] = 'true'` e il preloader si limita a far svanire il logo (stagger 0.025) risolvendo a 0.1s. Il numero pieno lo paghi una volta sola.
- Appena si toglie `is-first-loading`, il velo nero del preloader va a `opacity: 0` in 0.9s ed entra in campo l'eroe: video Vimeo in autoplay muto in loop, H1 ciano-per-differenza.

**Poi, a blocchi.**

- **0 → 0.5 di progresso dell'eroe**: non succede niente. `--mapped-progress: calc((var(--progress) - 0.5) / 0.5)` e' negativo e le due proprieta' che lo usano restano ferme. E' una scelta: la prima meta' dello scroll dell'eroe e' "gratis".
- **0.5 → 1**: il video fisso sale a `-25vh` e si annerisce fino a 0.75. Contemporaneamente la classe `is-over-home-hero` viene tolta dall'`<html>` (la scrive il modulo `HomeHero` via `data-scroll-call="inview, HomeHero"`) e l'header perde il `mix-blend-mode: difference`, riprendendo i colori normali su fondo bianco.
- **Sezione summary**: il canvas dell'anello riceve `onScrollProgress` e mappa il progresso 0.5→1 su una velocita' di rotazione **2→20** (`gsap.utils.mapRange(.5, 1, 2, 20, ease(progress))`, con `bezier-easing(0.4, 0, 1, 1)`, poi clampata fra 2 e 20). L'anello accelera mentre gli passi davanti.
- **Featured work**: al `mouseenter` su una riga il JS carica pigramente la miniatura e la fa entrare con l'effetto "de-pixelate"; il CSS in parallelo apre lo spazio fra le due parole del titolo. Al `mouseenter` di qualunque elemento con `data-hover-shuffle` parte anche lo scramble delle lettere.
- **About**: quando il canvas del team entra in viewport (`data-scroll-call="onInview, TeamCanvas"`) viene sorteggiato uno dei 30 `.glb` e caricato; il modello ruota da solo e si puo' orbitare.
- **Cambio pagina**: Barba.js. Nella transizione di default, per 0.25s **tutto il testo visibile della pagina uscente si rimescola** (16 passate × 10), poi entra la pagina nuova e il suo testo visibile fa 4 passate di rimescolamento prima di assestarsi. Il `data-theme` dell'`<html>` in arrivo viene copiato su quello corrente, quindi il fondo cambia colore nello stesso gesto (es. `/en/agency` e' `data-theme="primary"`, rosso).

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| Scroll di pagina | tutto | ruota del mouse | **Lenis 1.1.9 a valori di default**: `lerp: 0.1`, `duration: undefined`, `smoothWheel: true`, `syncTouch: false`, `wheelMultiplier: 1`, `touchMultiplier: 1` | vedi sotto, "come pesano l'inerzia" |
| Video dell'eroe | `translateY` 0 → `-25vh` | `--progress` dell'eroe, oltre 0.5 | lineare, nessun ease | CSS puro, `position: fixed` + `clip-path` sul genitore |
| Velo sull'eroe | `opacity` 0 → 0.75 | idem | lineare | `background-color: var(--color)` cioe' nero |
| H1 dell'eroe | non si muove | — | — | `mix-blend-mode: difference`: cambia colore da solo al cambiare del frame video |
| Header | `mix-blend-mode` on/off e barra di fondo `opacity` 1→0 | classe `is-over-home-hero` scritta all'inview dell'eroe | `0.2s cubic-bezier(0.215, 0.61, 0.355, 1)` sull'opacita' | esiste anche una regola `html.is-scrolling-down .c-header { transform: translate3d(0, -60px, 0) }` ma **il JS non aggiunge mai `is-scrolling-down`** (`Scroll.js` tocca solo `is-scrolling-up`): l'header non si nasconde mai |
| Miniatura in `Featured work` | `width: 0em → 1.5em`, dentro il titolo, che spinge le parole | `:hover` / `:focus-within` | entrata `0.45s`, uscita `0.2s`, `cubic-bezier(0.23, 1, 0.32, 1)` | zero JS per il movimento |
| Immagini in caricamento | "de-pixelate": un canvas sovrapposto ridisegna l'immagine a blocchi 8 → 16 → 32 → 48 → 96 → 128, un passo ogni 100ms, poi si autodistrugge | evento di lazy-load (`data-scroll-call="lazyLoad, Scroll"`, `data-scroll-offset="15%"`) su elementi con `data-depixelate` | a scatti, ~600ms totali | l'immagine sorgente viene ricampionata a 128px di lato lungo per il calcolo |
| Testo in hover (47 occorrenze) | scramble: prende una lettera a caso della parola e la reinserisce in un'altra posizione a caso, 4 volte in **0.25s**, poi ripristina | `mouseenter` su `[data-hover-shuffle]` | timeline GSAP con `.call()` a `0.0625s` di distanza | il testo originale viene salvato in `aria-label` durante l'effetto e ripristinato al `mouseleave` — cosi' gli screen reader non leggono l'anagramma |
| Anello 3D (summary) | rotazione automatica, velocita' 2 → 20 | `data-scroll-module-progress` → `onScrollProgress` | `bezier-easing(0.4, 0, 1, 1)` poi `mapRange(.5, 1, 2, 20)` clampato | canvas WebGL, modello da `/assets/3d/`, mosso dal `gsap.ticker` |
| Canvas del team (about) | il modello ruota su Y di `0.02 rad` per frame a 60fps (≈69°/s), normalizzato sul deltaTime | tempo, sempre, finche' non stai trascinando | costante | OrbitControls con `enableDamping`, polar clampato fra `0.3π` e `0.6π`, zoom e pan disattivati, `controls.touches = {}` |
| Canvas del team, clic | sorteggia un altro dei 30 membri e ne fa partire una clip di animazione a caso (esclusa quella corrente, con `idle-1` al 33% e `walking` al 50%) | `pointerdown`/`pointerup` entro 250ms e meno di 10px di trascinamento | — | l'animazione di default all'ingresso e' `idle-1` |
| Preloader | vedi cronologia sopra | tempo + `window.onload` | `cubic-bezier(0.215, 0.61, 0.355, 1)` | GSAP + SplitText |
| Transizione di pagina | scramble di tutto il testo visibile | evento Barba `leave` / `enter` | `leave` 0.25s con 160 passate, `enter` 4 passate | vedi sotto |
| Sequenza di immagini (pagina `/en/agency`) | 99 fotogrammi JPG scrubati, canvas 2D | `data-scroll-module-progress` | preload a passi di 16, poi 8, 4, 2... | non e' sulla home |

### Come pesano l'inerzia — la risposta secca

Il sito **non tara l'inerzia**. Nel loro `assets/scripts/modules/Scroll.js` (recuperato dalla sourcemap pubblica, quindi il codice e' letterale) l'istanza e':

```js
this.locomotiveScroll = new LocomotiveScroll({
    lenisOptions: {
        // duration: 1,
        // smooth: false,
    },
    scrollCallback: this.onScrollBind,
    modularInstance: this,
    initCustomTicker: (render) => { gsap.ticker.add(render); },
    destroyCustomTicker: (render) => { gsap.ticker.remove(render); }
})
```

`lenisOptions` e' un oggetto **vuoto** — le due righe che toccherebbero la sensazione sono commentate. Quindi valgono i default di Lenis 1.1.9, che nel bundle si leggono uno per uno:

- `lerp: 0.1`, `duration: undefined` → Lenis usa il ramo a smorzamento esponenziale, non quello a durata fissa;
- la formula e' `value = lerp(value, target, 1 - Math.exp(-60 * lerp * dt))`. Con `lerp = 0.1` la costante di tempo e' `1 / (60 × 0.1) = 1/6 s`: **circa 167ms per coprire il 63% della distanza residua, ~500ms per il 95%**. E' corretta sul delta time, quindi non cambia fra 60 e 120Hz.
- `smoothWheel: true`, `syncTouch: false`, `wheelMultiplier: 1`, `touchMultiplier: 1`, `syncTouchLerp: 0.075`, `touchInertiaMultiplier: 35`.

Due conseguenze che valgono piu' di qualsiasi opinione:

1. **Sul telefono non c'e' nessuna inerzia aggiunta.** `syncTouch: false` significa che al tocco Lenis non interviene: lo scorrimento e' quello nativo del browser. Il "loro" scroll morbido esiste solo con la rotella.
2. **Il raf di Lenis e' agganciato al ticker di GSAP**, non a un `requestAnimationFrame` proprio. Un solo loop per tutta la pagina — anello 3D compreso — e nessuna contesa fra due cicli di rendering. Il canvas del team fa eccezione: quello ha un `requestAnimationFrame` suo.

Una nota sull'assenza piu' interessante: **ScrollTrigger non e' nel bundle**. Le due occorrenze della stringa `ScrollTrigger` in `app.js` sono l'hook interno di GSAP che lo chiamerebbe se fosse registrato. I plugin GSAP effettivamente registrati sono **CSSPlugin, SplitText e ScrambleTextPlugin**. Tutto cio' che e' legato allo scroll passa da locomotive-scroll v5: `--progress` in CSS, `data-scroll-call` per gli inview, `onScrollProgress` verso i moduli.

E l'altra assenza: **`data-scroll-speed` non compare in nessuna delle tre pagine che ho scaricato** (home, `/en/work/lightship-1`, `/en/agency`). Hanno la parallasse della loro libreria e non la usano; preferiscono `position: fixed` + `clip-path` + una custom property.

## Colori

Le variabili sono su `:root` e i temi si applicano su `<html data-theme="...">`. La home e' `data-theme="default"`, la pagina Agency e' `data-theme="primary"`.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| Fondo (default) | `#FFFFFF` | `--color-bg`, tutta la home sotto l'eroe |
| Testo (default) | `#000000` | `--color`, tutto il testo di pagina |
| Velo sull'eroe | `#000000` a `opacity: 0.75` | `.c-home-hero_background:before` |
| Fondo preloader | `#000000` | schermata iniziale |
| Testo preloader | `#FFFFFF` | wordmark e testo del preloader |
| Fondo del menu a tutto schermo (dal tema default) | `#312DFB` (blu) | `--menu-color-bg`; il testo del menu diventa `#FFFFFF` |
| Fondo tema `primary` | `#DA382E` (rosso) | `/en/agency`; menu invertito su `#000000` |
| Fondo tema `secondary` | `#312DFB` | testo `#FFFFFF`, menu su `#FFFFFF` |
| Fondo tema `dark` | `#000000` | testo `#FFFFFF`, menu su `#DA382E` |
| Tema `lisa` | fondo `#FFFFFF`, testo `#000000`, menu `#312DFB` | pagina del personaggio interattivo; l'header ha la barra trasparente |
| Bordi | `currentColor` con spessore `--border-size: 2px` (desktop) / `1px` (≤1024px) | righe fra i progetti, sottolineature |
| Riga progetto disattivata | testo a `opacity: .3` | `.c-featured-links_item.-inactive` |

Il ciano che si vede in cima alla home **non e' un colore dichiarato**: e' il risultato di `#FFFFFF` in `mix-blend-mode: difference` sopra i rossi del video.

## Tipografia

Radice a `--font-size: 15px`, quindi `1rem = 15px`.

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| Corpo | HelveticaNowDisplay | 400 | 15px | 19.5px (1.3) | l'unico grottesco del sito, usato per tutto il testo corrente |
| `-huge` (titoli progetto, citazioni, coordinate del footer) | LocomotiveNew | 400 | `7.6388888889vw` (≈110px a 1440, misurato 116.6px a 1527) | 1.1 | e' il corpo piu' grande della pagina |
| `-h1` (titolo eroe, manifesto About) | LocomotiveNew | 400 | `4.6666666667rem` = **70px** | 1.1 → 77px | misurato in pagina |
| `-h2` / `.o-text.-medium` | HelveticaNowDisplay | 400 | `1.7333333333rem` = 26px | 1.2 | "Featured work" |
| `-h3` | LocomotiveNew per i `.c-heading` | 400 | `1.4666666667rem` = 22px | 1.1 | |
| `-h4` / `-h5` / `-h6` | — | 400 | 20px / 18px / 16px | 1.1 | |
| Menu a tutto schermo | LocomotiveNew | 400 | `min(12vw, 4.6666666667rem)` | 1.4 | |
| "Montreal, Quebec" nel menu | LocomotiveNew | 400 | `8vw` | 1 | |
| Coordinate del footer | LocomotiveNew | 400 | `var(--font-size-h1)`, poi `5vw` sotto 1400px, `6vw` fra 700 e 1024, `min(3.33rem, 9.15vw)` sotto 700 | 1.1 | |

**Come sono serviti.** Due sole famiglie, entrambe **self-hosted** in `woff2` + `woff` di ripiego, `font-display: swap`, nessun servizio esterno (Google Fonts non compare; `fonts.gstatic.com` e' solo permesso in CSP, non usato):

- `LocomotiveNew` ← `assets/fonts/PPLocomotiveNew-Light.woff2` (67.3 KB in transito). E' un **serif da display** disegnato su misura (famiglia PP di Pangram Pangram), dichiarato a `font-weight: 400` anche se il file si chiama `-Light`.
- `HelveticaNowDisplay` ← `assets/fonts/HelveticaNowDisplay-Regular.woff2` (41.6 KB).
- Terza famiglia inutile ma presente: `swiper-icons`, incorporata come base64 dentro il CSS (viene dal pacchetto Swiper).
- Stack di ripiego identico per entrambe: `-apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Cantarell, Ubuntu, roboto, noto, arial, sans-serif`.

**Il trucco tipografico da segnalare.** Nel markup ci sono emoji letterali usate come ornamenti — `🔶`, `🍺🔞`, `🛑🚹🚺`, `🟤`, `🔠`, `📞`, `🔂` — ma a schermo **non si vedono emoji**: si vedono glifi di marca (un riquadro `OPS | DES / DEV`, un asterisco, un monogramma `LOCO`, un'icona nell'header). Il font LocomotiveNew rimappa quei codepoint su disegni propri. Ogni emoji e' marcata `aria-hidden="true"` e affiancata da uno `<span class="u-screen-reader-text">` che porta il significato vero — nel footer `🔠` sta per uno spazio, `🔂` sta per la `@` della mail, `📞` sta per `+1 514 524 5678`. *(che il glifo venga dal font e non da una sostituzione JS e' dedotto: il DOM contiene l'emoji, non ci sono altre `@font-face`, e nel render appare un disegno di marca — non l'ho verificato ispezionando la tabella cmap del file.)*

## Testi veri

**Titolo (H1 dell'eroe)**
> [🔶] Locomotive®
> Digital-first Design Agency[🍺🔞]

**Sommario / manifesto (corpo H1, sezione About)**
> [🔰]Design and code are only tools of expression. What sets us and our work apart is people. We're a small group of creative thinkers who craft bespoke digital-first brand identities and experiences, tailor-made for you and your audience.[🔛🔜]

**Secondo blocco di testo**
> From strategy to deployment and maintenance, we're the ultimate digital one-stop shop. Over the past 15 years, Locomotive® has become a go-to for meaningful, innovative, results-driven digital experiences, web design and branding. Freshness guaranteed.

**Claim dei premi (sezione summary)**
> Seven Years / Running / 2018-2024 — `©2008-2026` — bottone: `The dynasty →`

**Preloader** (le righe compaiono una dopo l'altra)
> Digital / Digital-First / Digital-First Design / Digital-First Design / Digital-First Agency / Digital-First Agency
> Based / Based in / Based in Montreal / Based in Montreal / Based in Montreal, Canada / Based in Montreal, Canada / Based in Montreal, Canada

**Menu principale**: `Work`, `Agency`, `Careers`, `Let's talk`, `Store` — nell'header sono su una riga separati da virgole (`.c-header-menu_item:not(:last-child):after { content: "," }`). Il pulsante mobile dice `Menu` e, aperto, `Close`.

**Sezioni**
> `Featured work` · `See all projects` · `All Work` · `Always looking / for top shelf talent` · `Extras` · `Articles (13)` · `Culture` · `Store` · `Check out our gear`

**Progetti in home**: `Lightship`, `Wolverine Worldwide`, `The Drake Hotel`, `Dulcedo`, `Scout Motors`. Il link accessibile di ogni riga dice `Read more about this project`.

**Articoli elencati**
> Locomotive x Lightship : Innovation Needs a Companion
> Locomotive x Chivalry: How We Became More Than Just Collaborators
> Should I use Locomotive Scroll on my project?
> Why don't we use front-end frameworks at Locomotive?
> The revolution of the workspace as we know it
> A few things your UX designer can learn from your shrink

**Culture**: `(2024) Locomotive in Jamaica`, `(2023) Locomotive in Samana`, `(2022) Locomotive in Playa del Carmen`, `(2019) Locomotive in Mexico`, `(2018) Locomotive in Jamaica`, `(2017) Locomotive in Samana`

**Store**: `Pros de l'internet White T-Shirt` / `30 USD` / `Buy now→` · `Pros de l'internet Sand Hat` / `25 USD` / `Buy now→`

**Newsletter (modale)**
> Give an email, get the newsletter — `Subscribe` — successo: `Check your email to confirm your subscription`

**Piede**
> Menu · Work · Agency · Careers · Let's talk · Privacy · Francais · Cookie preferences · `Newsletter ↓`
> Social: Instagram, Twitter, LinkedIn, Behance, GitHub
> External: Store, Locomotive Scroll, Annual trips, Dynasty
> [🟤]1211[🔠] Jean-Talon Est[🔚🔞] Montreal[🛑🚹🚺](QC), Canada[🦉]H2R 1W1
> Telephone [+1 514 524 5678][📞] — info[🔂@]locomotive.ca
> ©2026

**Copia dei cookie**: `We use cookies!` (banner `vanilla-cookieconsent`, categoria `analytics` bloccata di default, `gtag('consent','default', ...)` con tutto a `denied`).

## Mobile

Tre soglie: **1024px** e **699px** in CSS, piu' `@media (hover: none)` per il tocco e un flag JS `window.isMobile` da user-agent (`/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/` piu' il caso `MacIntel` con `maxTouchPoints > 1`) che aggiunge la classe `is-mobile` sull'`<html>`.

**Cosa SPARISCE**

- **L'inerzia dello scroll.** E' la sparizione piu' importante e non e' una media query: `syncTouch: false` nei default di Lenis. Sul telefono lo scorrimento e' nativo al 100%. Il sito che senti col mouse e quello che senti col dito sono due sensazioni diverse per costruzione.
- **La miniatura dentro il titolo del progetto**: `@media (hover: none) { .c-featured-links_visual { display: none !important } }`. Su tocco le righe dei progetti restano solo testo. Sparisce quindi anche il de-pixelate su hover.
- Lo **scramble delle lettere su hover** e' agganciato a `mouseenter`, quindi di fatto non esiste su tocco. Resta invece nelle transizioni di pagina, che su mobile diventano l'unico posto in cui vedi l'effetto.
- **La didascalia** "Always looking / for top shelf talent" sotto il canvas del team: `@media (max-width: 699px) { .c-home-about_caption { display: none } }`.
- Il **CTA `Let's talk` nell'header**: `@media (max-width: 1024px) { .c-header_cta { display: none } }` — resta solo dentro il menu a tutto schermo.
- Nella lista lavori (`/en/work`) la **miniatura in hover** sparisce gia' su tablet senza hover, e la terza colonna della lista team (`.c-team-list_item > span:nth-child(3)`) sparisce sotto 699px.
- La **rotazione col dito** sul canvas del team: `controls.touches = {}` piu' l'attributo `data-team-canvas-no-touch`. Il modello continua a girare da solo e si puo' toccare per cambiarlo, ma non lo orbiti.

**Cosa viene SOSTITUITO**

- **Navigazione**: sotto 1025px la barra `Work, Agency, Careers, Store` sparisce e diventa un pulsante `Menu` che apre un overlay a tutto schermo `position: fixed` su fondo **`#312DFB`** con testo bianco (dal tema default), voci in LocomotiveNew a `min(12vw, 4.67rem)`, con focus-trap (`focus-trap` 7.0.0) e chiusura con `Esc`.
- **Griglia**: 12 colonne → **8** sotto 1024px → **4** sotto 699px. Gutter 20px → 10px. Margine di pagina `2.6667rem` (40px) → `1.3333rem` (20px).
- **Corpi**: `--font-size-h1` 70px → 50px (≤1024) → **36px** (≤699). `--font-size-huge` da `7.639vw` a **40px fissi** sotto 699px — cioe' su mobile i titoli dei progetti smettono di essere fluidi. `--font-size-medium` 26px → 24px → **18px**.
- **Spessore dei bordi**: `--border-size` 2px → **1px** sotto 1024px. Tutte le righe divisorie si assottigliano.
- **Altezza dell'eroe**: da `min(100vh, 80vw)` sopra 700px a `100 × var(--vh)` puro sotto. `--vh` e' calcolato in JS e **riaggiornato solo quando cambia la larghezza** della finestra (`window.innerWidth != t && matchMedia('(hover: none)')`), cosi' il ritrarsi della barra degli indirizzi non fa saltare l'eroe.
- **Sorgente video dell'eroe**: uno script inline dentro il `<video>` legge `data-video-inview-list`, sorteggia una voce e monta due `<source>` con `media="(max-width: 699px)"`; il poster e' `poster_mobile.png` o `poster_desktop.png` a seconda di `matchMedia("(max-width: 699px)")`. Nella build di oggi, pero', **il file mp4 mobile e desktop e' lo stesso** (stesso URL 1080p), cambia solo il poster.
- **Layout summary**: sopra 1025px le tre parole "Seven Years / Running / 2018-2024" sono sparpagliate in `position: absolute` a `top: 3.33rem` e `top: 13.33rem` ai lati del blocco; sotto 1025px il blocco diventa una griglia a 4 colonne con `grid-template-areas: "text text visual visual" / "footer footer visual visual"` e le parole si incolonnano.
- **Lista lavori su tablet senza hover**: la colonna "location" diventa un `(+)` / `(-)` in `::before` che apre e chiude la riga a fisarmonica.
- **Footer**: menu principale a 2 colonne, i titoli dei gruppi spariscono (`.c-footer_menu.-main .c-footer_menu_title { display: none }`), le coordinate scendono a `min(3.33rem, 9.15vw)`.
- **Preloader**: la griglia passa da 12 a 4 colonne (soglia 1199px) e i due blocchi si riposizionano.

**Cosa RESTA**

- Il video dell'eroe in autoplay muto con il `mix-blend-mode: difference` sul titolo — l'effetto che definisce il sito non viene tolto.
- Tutta la coreografia CSS legata a `--progress` (parallasse fissa e velo): funziona identica, perche' non dipende dallo scorrimento morbido ma dalla posizione.
- Il canvas WebGL dell'anello e quello del team: **restano attivi su mobile**, con `setPixelRatio(Math.min(devicePixelRatio, 2))`. Non c'e' nessun ramo che li disattivi su schermi piccoli o su batteria. C'e' solo un flag `ag` di supporto WebGL.
- Le transizioni Barba con lo scramble del testo.
- Il de-pixelate sulle immagini in lazy-load (quello legato allo scroll, non all'hover).

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| Rendering | HTML servito dal server, non una SPA. Template Twig | **VERIFICATO** | l'HTML arriva gia' completo (65.8 KB non compressi, tutti i testi presenti); nel sorgente c'e' un `console.log('preloaderPromise created in preloader.twig')` |
| CMS | Craft CMS | **SUPPOSTO** | Twig + `uploads/...` + `x-turbo-charged-by: LiteSpeed` sono la firma tipica di Craft su PHP, ma nessun header o percorso lo nomina |
| Framework front-end | **nessuno per l'interfaccia**. Sistema a moduli proprietario **modujs** (`data-module-*`, `this.call(nome, arg, 'Modulo')`, lifecycle `init`/`destroy`) | **VERIFICATO** | `node_modules/modujs/dist/main.esm.js` nella sourcemap; 34 moduli registrati (`CookieConsent, CopyToClipboard, FancyGallery, FancyTexts, FeaturedLinks, Gallery, GridHelper, Header, HomeHero, Hovers, ImagesSequence, Lisa, LisaVisualizer, Load, LostScene, ModelViewer, NewsletterModal, NewsletterToggler, Rail, Ring, Scroll, TeamCanvas, TeamList, TeamListCanvas, TeamModal, TeamModalCanvas, VideoInview, VideoModal, VideoModalToggler, WorkFilters, WorkGallery, WorkListItem, WorkNext, WorkSingleHero`) |
| ...pero' | **Vue 3** e' comunque nel bundle (`@vue/runtime-dom`, `@vue/compiler-dom`, `@vuelidate/core`, `vue-recaptcha`, `focus-trap-vue`, `vue-filepond`) | **VERIFICATO** | pacchetti nella sourcemap; i sorgenti propri sono `assets/scripts/vue/components/LisaForm.js`, `LisaStep.js`, `LisaDialog.js`, `LisaVisualizer.js`. Vue e' usato per i form (careers/contatti) e per il flusso interattivo "Lisa", non per il sito. Va detto che uno dei loro articoli in home si intitola *"Why don't we use front-end frameworks at Locomotive?"* |
| Scroll | **locomotive-scroll v5** (la loro libreria), che a sua volta istanzia **Lenis 1.1.9** | **VERIFICATO** | `window.lenisVersion === "1.1.9"` letto in pagina; nella sourcemap ci sono `node_modules/locomotive-scroll/index.ts`, `core/Core.ts`, `core/ScrollElement.ts`, `core/IO.ts`, `core/RO.ts` e `node_modules/lenis/src/maths.js`; `index.ts` importa `Lenis from 'lenis'` |
| Animazione | **GSAP 3.14.2** con **CSSPlugin**, **SplitText** e **ScrambleTextPlugin**. **Nessun ScrollTrigger** | **VERIFICATO** | banner di licenza in coda a `app.js`; `gsap.registerPlugin` chiamato su SplitText e ScrambleText; `ScrollTrigger` compare solo come hook interno di gsap-core |
| Easing extra | `bezier-easing` | **VERIFICATO** | usato in `modules/Ring.js` |
| Transizioni di pagina | **@barba/core** | **VERIFICATO** | pacchetto nella sourcemap + 3 transizioni proprie in `assets/scripts/transitions/` (`default.js`, `workList.js`, `workNext.js`), prefisso `data-load`, `timeout: 10000`, con `prefetch` |
| 3D | **three.js r165** con GLTFLoader + **DRACOLoader** (decoder preso da `unpkg.com/three@0.165.0/examples/jsm/libs/draco/gltf/`), OrbitControls; piu' `threejs-gif-texture` | **VERIFICATO** | 186 file `three/` nella sourcemap, percorso del decoder nel bundle, `connect-src https://unpkg.com` in CSP |
| 3D su misura | una intera cartella `assets/scripts/sixty/` con renderer, camera, raycaster e materiali shader propri: `PBR`, `Skin`, `Eye`, `Lashes`, `Cloth`, `Screen`, `ScreenGlow`, `Lights`, `Background`, `MouseComputation`, `Noise`, `DeviceMotion` (file `.fs` / `.vs` GLSL) | **VERIFICATO** | sourcemap; e' il motore del personaggio "Lisa" e del sito `six.locomotive.ca` — non gira sulla home |
| Video | `<video>` HTML nativo per l'eroe, con mp4 progressivo servito da **Vimeo** (`player.vimeo.com/progressive_redirect/...` → `download-video-ak.vimeocdn.com`). Nel bundle ci sono anche **hls.js** e un player **Mux** | **VERIFICATO** | URL nel markup; `hls.js` (155 file) nella sourcemap; `https://*.mux.com` in `media-src` e `connect-src` della CSP |
| Slider | **Swiper** | **VERIFICATO** | 69 file nella sourcemap + il font `swiper-icons` base64 nel CSS |
| Form / upload | **FilePond 4.30.4** + `vue-filepond` 7.0.3 + plugin di validazione tipo/dimensione, **@vuelidate**, **vue-recaptcha** con reCAPTCHA di Google | **VERIFICATO** | banner di licenza + `recaptcha/api.js` nell'HTML |
| Accessibilita' | **focus-trap 7.0.0** + **tabbable 6.0.0**, polyfill `focus-visible`, `svg4everybody 2.1.9` | **VERIFICATO** | banner di licenza; il menu chiama `focusTrap.activate()` |
| Cookie | **vanilla-cookieconsent 3.0.0-rc.17** con Google Consent Mode v2 | **VERIFICATO** | banner di licenza + `gtag('consent', 'default', ...)` inline |
| Debug in produzione | **Tweakpane 4.0.5** e un modulo `GridHelper`, attivati da `data-debug="true"` sull'`<html>` | **VERIFICATO** | banner di licenza; `window.isDebug = html.dataset.debug == 'true'`; nel CSS c'e' `.tp-dfwv { position: fixed !important; z-index: 99999 }` |
| Template lato client | **mustache.js** | **VERIFICATO** | banner di licenza |
| Build | esbuild (o simile) — un solo `app.js` + un `vendors.js` minuscolo, cache-busting a timestamp, **nessun code splitting** | **SUPPOSTO** per lo strumento, **VERIFICATO** per la forma | la sourcemap ha 642 sorgenti concatenati in un file solo, e le uniche occorrenze di `import(` sono stringhe d'errore del parser Babel |
| CSS | Sass compilato in un unico `main.css`, metodologia **ITCSS/BEM-ish** (`o-` oggetti, `c-` componenti, `u-` utility, `-modificatore`), design token in custom property | **VERIFICATO** per la convenzione, **SUPPOSTO** per Sass | nel CSS e' rimasta la riga non compilata `font-family: ff("primary")`, che e' una funzione Sass |
| Hosting / rete | **Cloudflare** davanti a **LiteSpeed**; HSTS con preload, `content-security-policy-report-only` con `report-uri /csp-report` | **VERIFICATO** | header `Server: cloudflare`, `x-turbo-charged-by: LiteSpeed`, `CF-RAY` |
| Immagini | `<img>` con `data-src` e placeholder SVG inline delle dimensioni giuste (niente CLS), lazy-load pilotato dallo scroll con `data-scroll-offset="15%"`, e reveal a de-pixelate. **JPG e PNG, nessun WebP/AVIF** | **VERIFICATO** | markup + `Content-Type` delle risposte |
| Analytics | Google Analytics 4 (`G-WYYJ9ZP43V`), caricato solo dopo il consenso (`type="text/plain" data-category="analytics"`) | **VERIFICATO** | HTML |
| Sourcemap | `app.js.map` **pubblica**, 10.6 MB, con `sourcesContent` completo | **VERIFICATO** | `curl` diretto, HTTP 200 |

## Peso e prestazioni

Misure fatte con `curl` sugli asset reali il 13/08/2026, con `Accept-Encoding: br,gzip`.

| risorsa | in transito (compresso) | non compresso |
|---|---|---|
| HTML `/en` | **12.8 KB** | 65.8 KB |
| `app.js` | **709.8 KB** | **2.55 MB** |
| `vendors.js` | 1.9 KB | 5.5 KB |
| `main.css` | **31.1 KB** | 199.9 KB |
| `PPLocomotiveNew-Light.woff2` | 67.3 KB | — |
| `HelveticaNowDisplay-Regular.woff2` | 41.6 KB | — |
| `uploads/home/poster_desktop.png` | **553.9 KB** | — (PNG) |
| video dell'eroe (Vimeo, 1080p mp4) | **8.23 MB** (`Content-Length`) | — |

Totale del guscio prima del video: **≈ 1.42 MB** in transito. Con il video dell'eroe che si scarica per intero (e' un mp4 progressivo in `loop`, non HLS): **≈ 9.6 MB**.

Le tre cose che pesano davvero:

1. **Un bundle solo da 710 KB compressi**, che contiene three.js completo (con i nodi WebGPU e i moduli di post-processing), hls.js, Swiper, Vue 3 con il compilatore di template, FilePond e Tweakpane — **anche sulla home, che di questa roba usa solo three.js**. Niente code splitting: la pagina che ha bisogno di FilePond e' `/en/careers`, ma il codice lo scarica anche chi guarda la home.
2. **Il poster dell'eroe e' un PNG da 554 KB.** Riesportato in AVIF o WebP costerebbe una frazione. E' l'inefficienza piu' facile da correggere del sito.
3. **8.23 MB di mp4** scaricati dritti dal CDN Vimeo, senza qualita' adattiva, con lo stesso file su mobile e su desktop.

Cose che invece sono fatte bene e si misurano:

- Il CSS non blocca il rendering (`media="print"` + `onload="this.media='all'"`), quindi il primo paint e' governato dal solo CSS critico inline dentro `<head>` (≈1 KB, il solo preloader).
- I `<img>` hanno `width`/`height` e un placeholder SVG delle stesse proporzioni: **niente layout shift** in caricamento.
- I 30 modelli `.glb` del team sono compressi con Draco e **si scarica solo quello sorteggiato**, con una cache globale in memoria per non riscaricarlo.
- La sequenza da 99 fotogrammi della pagina Agency preallinea prima 1 fotogramma su 16, poi raffina a 8, 4, 2 — cioe' e' guardabile subito e migliora dopo.
- Un solo `requestAnimationFrame` per lo scroll e l'anello 3D (il `gsap.ticker`), con `pause()` che rimuove il ticker quando l'elemento esce dal viewport.
- Il tempo pieno del preloader si paga **una volta per sessione** (`sessionStorage`).

**Non ho numeri di Core Web Vitals** (LCP, INP, CLS) ne' un punteggio Lighthouse: vedi la sezione sotto.

## Tre cose da rubare

**1. Guidare un'animazione di scroll con una sola custom property, e finirla in CSS.**
Il pattern completo, ricostruibile in venti righe:

```html
<section class="hero" data-scroll data-scroll-css-progress data-scroll-repeat data-scroll-ignore-fold>
  <div class="hero__content">…</div>
  <div class="hero__bg"><video …></video></div>
</section>
```

```css
.hero{
  /* la libreria scrive --progress da 0 a 1 mentre la sezione attraversa il viewport */
  --mapped-progress: calc((var(--progress) - 0.5) / 0.5); /* i primi 50% non fanno niente */
  height: calc(var(--vh, 1vh) * 100);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); /* rende il genitore un containing block */
}
.hero__bg{
  position: fixed; inset: 0; z-index: -1;
  transform: translate3d(0, calc(-25vh * var(--mapped-progress)), 0);
}
.hero__bg::before{                    /* il velo che scurisce */
  content:""; position:absolute; inset:0; z-index:10;
  background: #000; opacity: calc(var(--mapped-progress) * .75);
}
.hero__content{ mix-blend-mode: difference; color: #fff; } /* il titolo si inverte sul video */
```

Tre idee dentro una: `clip-path` sul genitore per intrappolare un `position: fixed` senza wrapper aggiuntivi; `mix-blend-mode: difference` per non dover mai scegliere il colore del testo sopra un video; e il rimappaggio `(p - 0.5) / 0.5` per avere una zona morta iniziale. Il costo per frame e' zero JavaScript: la libreria scrive una stringa, il compositor fa il resto. Il valore `--progress` si puo' ottenere anche con `ScrollTrigger` (`onUpdate: self => el.style.setProperty('--progress', self.progress)`) o, senza librerie, con un `IntersectionObserver` a soglie multiple.

**2. Far crescere una miniatura dentro il titolo, in CSS puro.**
Il titolo del progetto e' spezzato in due `<span>` centrati, con la miniatura in mezzo a larghezza zero:

```html
<div class="row__title"><span>Wolverine</span><figure class="row__thumb">…</figure><span>Worldwide</span></div>
```
```css
.row__title{ --in:.45s; --out:.2s; --ease:cubic-bezier(.23,1,.32,1);
  display:flex; justify-content:center; text-align:center; line-height:1; }
.row__thumb{ display:inline-block; overflow:hidden; width:0em; pointer-events:none;
  transition: width var(--out) var(--ease); }
.row__thumb::before{ content:""; display:block; padding-bottom:1em; } /* altezza = 1em del titolo */
.row__item:hover .row__thumb,
.row__item:focus-within .row__thumb{ width:1.5em; transition-duration: var(--in); }
@media (hover:none){ .row__thumb{ display:none !important; } }
```
La miniatura e' dimensionata in `em`, quindi cresce con il titolo a qualunque viewport; l'entrata e' piu' lenta dell'uscita (0.45s contro 0.2s) e questa asimmetria e' meta' dell'effetto. Il `:focus-within` la rende raggiungibile da tastiera e la media query la spegne al tocco, dove sarebbe solo un salto di layout. Il JS serve **solo** a caricare l'immagine al primo `mouseenter`.

**3. Lo scramble che non rompe gli screen reader — e il de-pixelate come reveal.**
Lo scramble di Locomotive non sostituisce le lettere con simboli: prende **una** lettera a caso della parola e la reinserisce in un'altra posizione a caso. Quattro passate in 0.25s, poi ripristino. Sembra glitch ma resta leggibile, e non serve un plugin.

```js
const swap = w => { const a=[...w], i=Math.random()*a.length|0, [c]=a.splice(i,1);
  a.splice(Math.random()*a.length|0, 0, c); return a.join(''); };

el.addEventListener('mouseenter', () => {
  el.setAttribute('aria-label', el.innerText);   // il testo vero resta per lo screen reader
  const tl = gsap.timeline({ onComplete(){ el.innerText = el.getAttribute('aria-label');
                                           el.removeAttribute('aria-label'); }});
  for (let s = 0; s < 4; s++) tl.call(() => { el.innerText = el.innerText.split(' ').map(swap).join(' '); }, [], s * 0.0625);
});
```

Vale la stessa logica per il loro reveal delle immagini: invece del solito fade, un `<canvas>` sovrapposto ridisegna l'immagine a blocchi via `getImageData` + `fillRect`, con la dimensione del blocco che passa per **8 → 16 → 32 → 48 → 96 → 128 in sei scatti da 100ms**, poi si rimuove. L'immagine viene ricampionata a 128px di lato lungo per il calcolo, quindi il costo e' irrilevante anche su decine di elementi. La progressione a sei scatti discreti e' il motivo per cui sembra un caricamento anni '90 e non una sfocatura.

**Bonus, gratis**: `sessionStorage['quickpreload']`. La prima volta il preloader dura secondi ed e' parte del marchio; dalla seconda pagina in poi si riduce a 0.1s. Costa quattro righe e toglie l'unico motivo per odiare un preloader.

## Non verificato

- **Core Web Vitals reali e punteggio Lighthouse.** Non ho eseguito ne' un trace ne' un audit. Il browser condiviso di questa sessione veniva ri-selezionato da altri processi fra una chiamata e l'altra (due `evaluate_script` sono finite su un'altra scheda), e ho preferito chiudere la mia scheda piuttosto che insistere. Tutti i numeri di peso qui sopra vengono da `curl`, non da un profiling.
- **Screenshot**: ne ho catturato **uno solo**, il primo viewport desktop. La cronologia di scroll e il comportamento mobile qui descritti sono ricavati dal CSS, dal JS e dalla sourcemap, non da una registrazione video. Le misure di altezza delle sezioni sono state prese in pagina, ma a viewport 1527x670 (la finestra non si e' lasciata ridimensionare a 1440x900).
- **Il CMS.** Craft e' un'ipotesi ragionevole (Twig + LiteSpeed + `/uploads/`) ma nessun header, cookie o percorso lo conferma.
- **I glifi al posto delle emoji.** Vedo emoji nel DOM e disegni di marca a schermo, e ci sono solo due `@font-face`; ne deduco che PPLocomotiveNew rimappi quei codepoint. Non ho ispezionato la tabella `cmap` del `.woff2` per esserne certo, e non escludo un font di emoji installato lato sistema che non ho isolato.
- **Il numero di richieste di rete a caricamento completo.** Ho misurato le risorse una per una, non ho un waterfall.
- **Il contenuto esatto del canvas dell'anello** in `c-home-summary`: so che carica un modello da `/assets/3d/` e come ruota, ma non ho scaricato il file per vedere che oggetto sia (presumibilmente un anello/trofeo legato ai sette Agency of the Year — non verificato).
- **Le pagine oltre home, `/en/work/lightship-1` e `/en/agency`.** Delle ultime due ho letto solo l'HTML per confrontare gli attributi di scroll e il tema; non le ho descritte.
- **Il comportamento reale su un dispositivo touch.** Le conclusioni sul mobile vengono dalle media query, dai flag `isTouch` nel codice e dai default di Lenis, non da una prova su telefono.
- **`prefers-reduced-motion`**: nel CSS esiste solo per il pannello dei cookie e per un componente (`c-lisa-note`); nel JS **non compare mai**. Preloader, scramble, de-pixelate, rotazione dei canvas e transizioni Barba non lo rispettano. Questo l'ho verificato per assenza — cioe' ho cercato la stringa in `main.css` e `app.js` — ma non ho provato ad attivare l'impostazione nel browser per vedere se qualcosa cambia comunque.
