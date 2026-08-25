# Don't Board Me

- **URL**: https://dontboardme.com/ (trovato nel markup della scheda Awwwards, https://www.awwwards.com/sites/dont-board-me)
- **Premio**: Site of the Day 11 marzo 2024, punteggio giuria **7.83/10** (Design 8.08, Usability 7.41, Creativity 8.00, Content 7.73); Developer Award **7.26/10** (Semantics/SEO 7.20, Animations 7.20, Accessibility 7.00, WPO 6.80, Responsive 8.00, Markup 7.20); voto community Awwwards **8.92** — ed e' il voto community che gli fa vincere **Site of the Year Users' Choice 2024** (https://www.awwwards.com/annual-awards-2024/site-of-the-year-users-choice). Anche CSS Winner (https://www.csswinner.com/details/dont-board-me/17891).
- **Studio**: The First The Last — https://thefirstthelast.agency/ (link nel footer del sito, `made by… the first the last`)
- **Anno**: 2024 (SOTD 11/03/2024)
- **Letto il**: 13/08/2026

> **Metodo**: tutto quello che sta qui sotto e' letto da `curl` sull'HTML server-side (il sito e' Nuxt 3 in SSR, quindi il markup completo arriva nella prima risposta), dai bundle JS `/_nuxt/*.js`, dai CSS e dall'API `/api/home`. **Non ho mai renderizzato la pagina in un browser**: nessuno screenshot, nessuna misura di layout a schermo. Quindi le meccaniche di animazione sono VERIFICATE (le ho lette nel codice sorgente, non dedotte dall'aspetto), mentre "come si vede" e', dove dichiarato, `non verificato`.

---

## Cosa vende

Dog walking e pet sitting **a domicilio** (in-home), a ore o ad abbonamento settimanale, nell'area San Diego–Carlsbad (California). Non e' una pensione: il claim del nome e' esattamente questo — *non mettermi in pensione*, vengono loro da te.

Prodotto vero: un abbonamento di passeggiate ricorrenti ($224–$384/mese) venduto con la leva "piu' cammina, meno paghi".

## A chi

Padroni di cane in California che partono, lavorano fuori casa o hanno un cane iperattivo, e che hanno paura di lasciarlo in un box. Il compratore tipo e' emotivo, non razionale: sta comprando tranquillita', non un servizio.

Uscendo dal sito deve pensare: *questa gente ama i cani quanto me, e mi costa meno se lo faccio spesso*. La scheda Awwwards lo dice bene: "a very practical website that will make you adopt a dog just to use their services".

## Idea regista

**Tutta la pagina e' un gioco col cane**: si entra lanciando una pallina, ogni forma decorativa e' una pallina da tennis, i servizi si scelgono ruotando un anello di giocattoli, e la 404 e' cosparsa di cacca.

## Il momento

**Il preloader.** Non c'e' nessuna barra di caricamento: c'e' una pallina da tennis gigante (SVG con gradiente `#FCFCF7`→`#F3F3E9` e le righe bianche) che insegue il cursore su fondo rosa `#F3C3CB`, e la scritta `bounce a ball to get to the site`. Il sito **non entra finche' non clicchi**: `onClickOnce` sul div preloader.

Al clic (letto in `entry.66570678.js`, componente `CommonPreloader`):

1. `.preloader__content-wrap` esce a sinistra: `xPercent: -30, opacity: 0`, 0.4s;
2. contemporaneamente la pallina rimbalza fino al punto esatto del clic: `scale: 1, x: click.x - 54, y: click.y - 27, duration: 1.2, ease: "bounce.out"` — cioe' la pallina **rimbalza davvero**, con l'easing di rimbalzo di GSAP;
3. a 0.9s la pallina sparisce (`opacity: 0, scale: 0`, 0.3s);
4. dal punto del rimbalzo si apre un buco: una `<circle id="circle-mask">` dentro una `<mask>` SVG passa da `r: 0` a `r: 1800` in 1.3s `power2.inOut`. Il rettangolo rosa e' mascherato da quel cerchio, quindi il sito viene "scoperto" dal punto in cui e' caduta la pallina;
5. 400 ms dopo l'inizio della maschera parte l'animazione della home dietro (`animate-page-while-preloader = true`), cosi' quando il buco arriva ai bordi il titolo si sta gia' scrivendo;
6. a fine timeline `lockScroll(false)` e Lenis riparte.

Il centro del buco segue il mouse anche prima del clic (`#circle-mask` cx/cy agganciati alla posizione del puntatore), quindi il punto d'ingresso e' letteralmente scelto dall'utente.

**Su mobile questo momento non esiste** — vedi la sezione Mobile.

## Struttura, sezione per sezione

Le durate sono calcolate dai valori CSS (`height`, `padding-top`) e dal fatto che `html { font-size: 1.1111111111vw }`, cioe' `1rem = viewport/90` (progetto su 1440 px → 1rem = 16 px). "Schermate" = altezze di viewport da 900 px. Dove non c'e' un'altezza esplicita in CSS ho scritto stimato.

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |
|---|---|---|---|
| Preloader | pallina + `bounce a ball to get to the site` | **clicca** (obbligatorio, desktop) | fuori scroll, scroll bloccato |
| Header fisso | logo cane SVG + 5 voci + `book now` | hover / apre il menu | fisso, `position: fixed` |
| Hero | titolo `A tired dog is a happy dog!`, cane bianco animato in Lottie, 4 palline giganti mezze tagliate a fondo schermo, social, paragrafo rosso | legge, cerca lo scroll | `.main-page__content` = `78.125rem` = 1250 px ≈ **1,4** |
| Our services | contatore 01/03, anello di giocattoli cliccabili, foto cane, barra di avanzamento, titolo che cambia (`dog walking` / `pet visits` / `overnight care`) | clicca un giocattolo, o aspetta 5 s | `padding-top: 40rem` + contenuto — stimato **1,5–2** |
| How it works? | 4 schede "process" che si impilano ruotate + 4 numeri fluttuanti che si accendono | scrolla (la sezione e' **pinnata**) | `.how-works { position: sticky; height: 100vh }` dentro `.plash-move-cards { height: 400vh }` → esattamente **4** |
| The care your pet deserves (testimonial) | 10 nomi in swiper infinito, estratto di recensione, palline in parallasse | trascina lo swiper, clicca un nome → modale | stimato **1,5–2** |
| Book consultation | `Have questions?` + telefono + `book now` + 8 palline gialle in parallasse col mouse | clicca / chiama | stimato **1** |
| Cost of walking | 3 card prezzo su fondo azzurro + 4a card vuota che porta a `/pricing` | clicca una card | stimato **1** |
| Instagram | `share the love of your dog`, `@don'tboardme`, foto cani + immagine `dog-ass.png` | clicca Instagram | stimato **1** |
| Footer | indirizzo, mail, nav, legal, social, `made by the first the last` | — | stimato **0,7** |

Totale stimato: **12–14 schermate**, di cui 4 spese tutte sulla sola sezione "How it works".

## L'esperienza in ordine di tempo

**Primi dieci secondi (desktop, ≥1024 px)**

- **0 s** — schermo pieno rosa `#F3C3CB`. Al centro-schermo una pallina da tennis. Titolo `bounce a ball to get to the site` che entra da sinistra (`x: -150% → -50%`, `opacity: 0 → 1`, 0.7 s) e sotto `You've landed on a dog walking site. Follow our rules to keep your dog happy` che entra 0.25 s dopo (`xPercent: -150 → 0`). Scroll bloccato (`body { overflow: hidden; touch-action: none }` + `lenis.stop()`).
- **0–n s** — la pallina insegue il puntatore con ritardo: `gsap.to('.preloader__ball-wrap', { x: mouse.x + 20, y: mouse.y + 20, duration: 0.5 })`. Il tempo qui **non passa**: il sito aspetta il clic, indefinitamente.
- **clic** — vedi "Il momento": testo via, rimbalzo 1.2 s `bounce.out`, cerchio-maschera che si apre in 1.3 s.
- **clic + 0.4 s** — dietro alla maschera parte la home: il titolo `A tired dog is / a happy dog!` viene spezzato in righe con SplitText e le righe salgono con `yPercent: 100 → 0, rotate: 30 → 0, stagger: 0.2, duration: 0.8, ease: power4.out`.
- **+ ~1.2 s** — finito il titolo, **la "o" di "dog" ruota di -13° con `ease: "Bounce.easeOut"`, 0.5 s**: la lettera cade di lato come una pallina. E' il dettaglio-firma della pagina (`<span class='bottom-title__letter'>o</span>` iniettato via regex sul testo che arriva dal CMS).
- **+ 0.75 s dal titolo** — sale il sottotitolo `Your Trusted In-Home Pet Care Companions!`.
- **in parallelo** — le icone social entrano da `opacity: 0, yPercent: 50` con `stagger: 0.2, ease: power3.out, duration: 1.4`.
- **~+1.7 s** — sblocco scroll, Lenis riparte. Il cane bianco e' un **Lottie in loop** (`/Dog.json`, 113 KB, `renderer: "svg"`, `loop: true, autoplay: true`) montato in `#white-dog__anim`.

**Poi, a blocchi**

- **Our services** — carosello a 3 stati che gira **da solo ogni 5 s** (`fromTo(progress, 0→100, { duration: 5, ease: 'none', repeat: -1, repeatDelay: 0.5 })`), con barra di avanzamento visibile. Il titolo cambia con una `<Transition name="move-text" mode="out-in">`; il numero con `name="change-slide-c"`. La navigazione manuale e' **un anello di 4 giocattoli**: a ogni cambio `.services__slider-icons-wrap` ruota di `+90°` (0.7 s) e i giocattoli dentro contro-ruotano di `-90°` per restare dritti; a fine rotazione il giocattolo uscito dallo schermo viene **clonato e reiniettato** dal lato opposto (`cloneNode(true)` su `.hidden_toy.first/second/third`), cosi' l'anello e' infinito con soli 3 asset. La pallina decorativa segue il mouse con smorzamento `/30` e `duration: 1`.
- **How it works?** — la sezione e' `sticky, top: 0, height: 100vh` dentro uno spaziatore da `400vh`. Ognuna delle 4 schede ha il proprio spaziatore `.plash-move-cardN` da `100vh` che fa da trigger `scrub: true` (`start: "top bottom"`, `end: "bottom bottom"`) e anima `top` e `rotate` della scheda: `1 → top 48, rotate -3.077°`, `2 → 76, -1.206°`, `3 → 114, -4.402°`, `4 → 140, 6.321°`. Il risultato e' un mazzo di carte che viene calato una alla volta, ogni carta storta di un angolo diverso e non tondo (i decimali sono presi pari pari da Figma). In parallelo 4 numeri "circle-label" piazzati in punti fissi (`top 100px/left 27%`, `200px/96%`, `32%/66.5%`, `60%/10%`) si accendono uno per volta (`onEnter → activeCard = N`, `onLeaveBack → N-1`) e ondeggiano col mouse: `xPercent: ((mouse.x/vw*100)-50)/2`, segno alternato per indice pari/dispari, `duration: 1.6`.
- **Testimonial** — Swiper con `slidesPerView: auto`, `centeredSlides: true`, `loop: true`, `speed: 500`; l'array delle 10 recensioni e' **duplicato a mano** (`[...testimonials, ...testimonials]`) per rendere il loop credibile. Passando sopra al testo compare un **cursore-testo**: `#cursor-mouse` contiene 10 `<span class="cursor-character">` (r-e-a-d-a-s-t-o-r-y), ognuno `position: fixed`, con `left` fisso a scaletta (0, 10, 20, 30, 45, 60, 70, 80, 93, 104 px) e `mix-blend-mode: difference`. Tutte le lettere inseguono il mouse con lo stesso tween (`top: mouse.y, left: mouse.x + offset, duration: 1.2, delay: 0.04, ease: power4.out`) → la scritta "read a story" si allunga e si ricompone come una coda. Le due palline ai lati fanno parallasse in `scrub` (`.care-pet_left-ball { yPercent: 50 }`, `.care-pet_right-ball { yPercent: -50 }`, trigger `top bottom → center center`). Clic su un nome → modale con la recensione lunga.
- **Book consultation** — 8 palline gialle (`.decor__yellow-ball n1…n7`) che seguono il mouse con `duration: 1.6`, spostamento `(mouse%/5)` e segno alternato **piu' un offset crescente per indice** (`+ i*2`), cosi' non si muovono in blocco.
- **Cost of walking** — su desktop le card entrano da `y: 150, opacity: 0.8` con `stagger: 0.05, duration: 1.2, ease: power2.out`, trigger `top 97%` sul contenitore (tutte insieme). Su mobile ogni card ha il **suo** trigger e un'entrata piu' corta (`y: 40, opacity: 0, duration: 0.6`).
- **Cambio pagina** — transizione `mode: "in-out"` a tendina da destra: la pagina entrante e' `position: fixed, zIndex: 3` e va da `clip-path: polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)` a `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)` in **1 s**, mentre il suo `.page` interno viene da `xPercent: 50` (parallasse interna: il contenuto si muove a meta' velocita' del bordo). A fine transizione `scrollTo(0)`.

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| pallina preloader | `x`, `y` verso il cursore | mouse | `gsap.to`, `duration: 0.5` (nessun ease → `power1.out`) | ritardo volutamente alto, e' il "peso" della palla |
| pallina preloader al clic | `scale`, `x`, `y` sul punto di clic | evento click (una volta sola) | **`bounce.out`**, 1.2 s | il rimbalzo e' letterale |
| `#circle-mask` | attributo `r`: 0 → 1800 (desktop) / 1000 (mobile) | fine del rimbalzo | `power2.inOut`, 1.3 s | rivelazione della home via `<mask>` SVG, non via opacity |
| titolo hero | righe SplitText `yPercent 100→0`, `rotate 30→0` | tempo (dopo preloader) | `power4.out`, 0.8 s, `stagger 0.2` | doppio SplitText annidato: prima `lines`, poi di nuovo `lines` dentro un wrapper `overflow: hidden` |
| la "o" di "dog" | `rotate: -13°` | fine animazione titolo (`.then()`) | **`Bounce.easeOut`**, 0.5 s | firma della pagina |
| cane bianco | animazione vettoriale | tempo, loop infinito | — | **Lottie SVG**, `/Dog.json`, 113 KB |
| paragrafi e blocchi generici | `yPercent: 28 → 0`, `opacity: 0 → 1` | scroll, `start: "top bottom"` | `power2.out`, 1.2 s | helper unico riusato ovunque, imposta `willChange: transform, opacity` |
| anello giocattoli servizi | `rotate: +90°` sul contenitore, `-90°` sui figli | click / autoplay 5 s | 0.7 s (default) | i figli contro-ruotano per restare dritti |
| barra avanzamento servizi | `value: 0 → 100` con `roundProps` | tempo, `repeat: -1`, `repeatDelay: 0.5` | `ease: "none"`, 5 s | avanza il carosello in `onRepeat` |
| 4 schede "process" | `top` e `rotate` | **scroll con `scrub: true`** | lineare (scrub) | un `100vh` di spaziatore per scheda dentro `400vh` totali |
| numeri 1–4 di "how it works" | `xPercent`/`yPercent` | mouse | `gsap.to`, 1.6 s | segno alternato per indice |
| cursore "read a story" | 10 lettere seguono il mouse | mouse (solo hover sul testo) | `power4.out`, 1.2 s, `delay: 0.04` | `mix-blend-mode: difference` |
| palline testimonial | `yPercent: ±50` | scroll `scrub: true` | lineare | parallasse contrapposta destra/sinistra |
| 8 palline gialle | `xPercent`/`yPercent` | mouse | 1.6 s | offset crescente per indice |
| card prezzi | `y: 150 → 0`, `opacity: 0.8 → 1` | scroll `top 97%` | `power2.out`, 1.2 s, `stagger 0.05` | valori diversi su mobile |
| bottoni (`WithDot`) | due cerchietti che scorrono ai lati del testo | hover (solo desktop) | timeline in pausa, 0.15 s, `restart`/`reverse` | la distanza e' calcolata a runtime da `offsetWidth` |
| menu a tutto schermo | `translateY(-102dvh) → 0` | stato aperto | **CSS** `transition: all 1s var(--my-ease)` | `--my-ease` e' una CustomEase GSAP `0.24, 1, 0.36, 1` registrata come `"my-ease"` |
| transizione di pagina | `clip-path` a tendina + `xPercent: 50` interno | navigazione | 1 s | `mode: "in-out"`, uscente su `zIndex: 2` |

Librerie riconosciute dietro gli effetti: **GSAP 3.12.2** con `ScrollTrigger`, `ScrollToPlugin`, `DrawSVGPlugin`, `SplitText`, `Flip`, `Draggable`/`Observer` (i primi tre sono plugin a pagamento del Club GreenSock, quindi lo studio ha licenza); **Lenis** per lo scroll; **Lottie**; **Swiper**.

## Colori

Palette completa letta dai custom properties nel CSS inline della pagina (non stimata).

| ruolo | esadecimale | dove si usa |
|---|---|---|
| accento primario / rosso marchio | `#e33529` (`--c-red`) | testo dell'hero, logo cane, link nav, striscia dell'header, numeri |
| rosso bottone | `#e93225` (`--c-red2`) | sfondo bottoni `book now` |
| rosso scuro | `#a02b22` (`--c-dark-red`) | stati attivi/hover |
| fondo pagina home | `#f4ced3` (`--c-light-pink`) | `.main-page`, overlay del menu (a `opacity: .7`) |
| fondo preloader | `#f3c3cb` (`--c-pink`) | rettangolo mascherato del preloader |
| rosa scuro | `#f0b5be` (`--c-dark-pink`) | cerchio-link decorativo dell'hero |
| rosa chiaro 2/3 | `#f6d2d8`, `#f6d1d8` | superfici secondarie |
| bianco sporco caldo | `#f3f3e9` (`--c-gray1`) | fondo del blocco hero, fondo del menu a tutto schermo |
| grigio caldo | `#f4f4ea` (`--c-gray`) | superfici |
| grigio rosato | `#ede2e2` (`--c-gray2`) | cerchi dietro i giocattoli (112 px, `border-radius: 50%`) |
| bianco | `#f3f3f3` (`--c-white`) | etichetta "process" |
| bianco caldo | `#f6f6ed` (`--c-dark-white`) | testo sui bottoni, osso SVG |
| bianco caldo 2 | `#f3f0ef` (`--c-dark-white2`) | superfici |
| azzurro chiaro | `#afd8fb` (`--c-light-blue`) | **fondo di "cost of walking" e "book consultation"** |
| azzurro medio | `#5b93b0` (`--c-d-light-blue`) | dettagli |
| blu | `#2b6786` (`--c-blue`) | tema header di `/pricing` e `/contacts`, fondo bottoni di default |
| blu scuro | `#124e6d` (`--c-dark-blue`) | testi su azzurro |
| giallo | `#fff500` (`--c-yellow`) | palline da tennis piene, etichetta `book now` |
| giallo scuro | `#dcc060` (`--c-dark-yellow`), `#dcc06040` al 25% | ombre/varianti delle palline |
| giallo scurissimo | `#cfae3d` (`--c-ultra-dark-yellow`) | stato attivo dei bottoni |
| marrone | `#854720` (`--c-brown`) | frecce SVG, tratti |
| marrone chiaro | `#925026` (`--c-light-brown`) | dettagli |
| marrone scuro | `#693413` (`--c-dark-brown`) | tema header delle pagine "default" |
| viola chiaro 1–4 | `#e6dfe7`, `#ead9ec`, `#eacdef`, `#d8b3df` | i 4 riquadri-foto delle schede "process" (classi `.purple1…4`) |
| rosa cursore | `#edbdd1` | lettere di "read a story" (in `mix-blend-mode: difference`) |
| marrone cacca | `#804f27` | pallini nell'SVG della 404 |

Awwwards riassume il sito con due soli colori: `#E33529` e `#AFD8FB`.

## Tipografia

Due sole famiglie. Tutta la scala e' **fissa in rem**, ma `rem` e' agganciato al viewport (vedi nota sotto), quindi in pratica e' tipografia fluida senza `clamp()`.

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| `.h0` | Bayon | 400 | `18.3125rem` (293 px @1440) | 78% | `letter-spacing: -0.36625rem`, `uppercase` |
| `.h1` | Bayon | 400 | `14.75rem` (236 px) | 78% | `-0.295rem` |
| `.h2` | Bayon | 400 | `11.625rem` (186 px) | 78% | titolo hero e 404 |
| `.h3` | Bayon | 400 | `7.875rem` (126 px) | 78% | |
| `.h4` | Bayon | 400 | `6rem` (96 px) | 78% | titoli di sezione, testo testimonial |
| `.h5` | Bayon | 400 | `5rem` | 78% | |
| `.h6` | Bayon | 400 | `4.375rem` (70 px) | 78% | titoli delle schede process, `@don'tboardme` |
| `.h7` | Bayon | 400 | `3.25rem` | 90% | |
| `.h8` | Bayon | 400 | `2.625rem` | 100% | paragrafo rosso sotto l'hero |
| `.h9` | Bayon | 400 | `1.875rem` (30 px) | 100% | etichette bottoni, `book now`, `about us` |
| `.h10` | Bayon | 400 | `1rem` | 100% | descrizioni brevi |
| `.p1-medium` / `.p1-bold` | Neue Montreal | 500 | `1rem` | 120% | corpo testo |
| `.p2-medium` | Neue Montreal | 500 | — | 100% | footer, sottotitolo hero |
| `.p3-medium` / `.p2-bold` | Neue Montreal | 500 | — | 100% | `uppercase`, etichette |
| `.cursor-character` | Neue Montreal | 500 | `0.875rem` | 100% | `uppercase` |

Regola trasversale: **tutti i titoli sono `text-transform: uppercase` con `line-height: 78%` e `letter-spacing` negativo pari a -2% del corpo** (`-0.36625/18.3125 = -0.02`, `-0.295/14.75 = -0.02`, e cosi' via su tutta la scala). E' una scala costruita, non improvvisata.

**Come sono serviti i font**: entrambi **self-hosted** dal bundle Nuxt, `font-display: swap`, in formati **non compressi**: `Bayon-Regular.399e572d.ttf` (54,6 KB) e `NeueMontreal-Medium.3d28dde2.otf` (41,9 KB). Nessun WOFF2, nessun servizio esterno, nessun font variabile. Bayon e' un font Google gratuito (Khmer/Latino condensato); Neue Montreal e' Pangram Pangram, a pagamento. Attenzione: il `@font-face` di Bayon dichiara `font-weight: 300` ma il file e' il Regular, e la scala tipografica chiede `font-weight: 400` — c'e' una discrepanza nel codice.

**La chiave di tutto il layout**: `html, body { font-size: 1.1111111111vw }`, e sotto i 1024 px `font-size: 4.2666666667vw`. Cioe' `1rem = viewport/90` su desktop (progetto Figma 1440 px → 16 px) e `1rem = viewport/23.4375` su mobile (progetto 375 px → 16 px). **Tutto il sito, testi e spazi, e' un unico disegno che scala col viewport**: non ci sono breakpoint intermedi perche' non servono, ci sono due soli disegni. Esiste anche un `--viewport` informativo (`1920 / 1024 / 768 / 375`).

## Testi veri

**Preloader**
- `bounce a ball to get to the site`
- (mobile) `loading 0%` … `loading 100%`
- `You've landed on a dog walking site. Follow our rules to keep your dog happy`

**Hero**
- `A tired dog is` / `a happy dog!` (spezzato in `titleLeft` + `titleRight` nel CMS)
- `Your Trusted In-Home Pet Care Companions!`
- `Here at Don't Board Me Pet Sitting, we understand that your pets are just as much a member of your family as, well, you are!`
- pallina-link: `about us`

**Navigazione** (identica in header, menu mobile e footer)
- `pricing` · `about us` · `services` · `blog` · `contacts` · `book` / `book now` · `menu` / `close`

**Our services**
- `dog walking` · `pet visits` · `overnight care`

**How it works**
- `how it works?` — etichetta scheda: `process`
- `Just fill out the form, and we'll be happy to assist you with your pet.`
- `01. Fill out the form` — `Fill out information, upload your photo and become a basic member.`
- `02. You are being contacted` — `Based on your profile we'll show you the members that are near you.`
- `03. First meeting` — `Before you can message and arrange a "Welcome Woof" you'll need to become a Premium member`
- `04. You receive quality service` — `We recommend members get to know each other really well before a dog is taken care of by another dog lover.`

**Testimonial**
- `The care your pet deserves!` (titolo) / `The personalized in- home care your pet deserves!` (descrizione — lo spazio dopo il trattino e' nel CMS, non e' un mio errore)
- `testimonials`, cursore: `read a story`
- nomi: `JaneDoe`, `HappyPF`, `Mike`, `Joe`, `Clara`, `Torry`, `Flo`, `Tom`, `Sofi`, `Nik`
- estratto in home: `I recently used the dog care service, and I couldn't be happier! The team took excellent care of...`

**Contatto**
- `Have questions?` / `Contact us at 858-449-2691.` / `book now`

**Prezzi (home)**
- `cost of walking`
- `Singular walks (30 min)` — `from $30` — `To just test the service` — `try it`
- `Twice a week` — `from $224\mo.` — `Breaks down to $28 per walk` — `try it`
- `Three times a week` — `from $312\mo.` — `Breaks down to $26 per walk` — `most popular` — `try it`
- `pricing page`

**Pagina /pricing** (in piu')
- `The more your pet walks, the more the price drops!`
- `Four times a week` — `from $384\mo.` — `Breaks down to $24 per walk`
- `more walks / more savings`
- `Additional dog +$5` · `Additional 45 minutes of walking +$60`

**Pagina /contacts**
- `get in touch` · `200 N. Spring Street Los Angeles CA 90012 United States` · `got a question?`
- campi: `name` / `email` / `phone` — errori: `Field is empty`, `Invalid email`, `Minimum 8 symbols` — `send`

**Instagram / Footer**
- `share the love of your dog` · `@don'tboardme`
- `San Diego-Carlsbad, CA Metropolitan Area` · `ayvamail@gmail.com`
- `privacy policy` · `terms of use` · `faq` · `instagram` · `tik-tok`
- `© 2026 don't board me. All rights reserved` · `made by… the first the last`

**404**
- `ooops!` / `page not found` / `go homepage` (+ 7 SVG di cacca sparsi sul fondo)

**Easter egg in console** (`console.log` in un plugin Nuxt): `What the hell are you doing here?` in Comic Sans MS 40 px, verde `#B2F366` su `#141414`.

## Mobile

Il breakpoint e' **uno solo: 1024 px** (109 media query `max-width: 1024px` nell'HTML; il JS usa la stessa soglia: `desktop = [1024, ∞)`, `mobile = [0, 1024)`). Sotto quella soglia non e' "lo stesso sito piu' stretto": e' un altro sito.

**COSA SPARISCE** (regole `display: none` sotto 1024 px, verificate nel CSS)
- `.preloader__ball-wrap` e `.preloader__title` → **la pallina e la scritta "bounce a ball to get to the site" non esistono**;
- `.how-works` e `.plash-move-cards` → **tutta la sezione pinnata da 400vh, il mazzo di carte, i 4 numeri fluttuanti: cancellati**;
- `.services__slider-icons` → l'anello di giocattoli, cioe' la navigazione-firma dei servizi;
- `.main-page__social-links` → i social nell'hero;
- `.main-page__hero-ball.n4` → la pallina "about us" (restano 3 palline su 4);
- `.decor__yellow-ball` in testimonial, e `.n4 .n5 .n6 .n7` in book-consultation → da 8 palline gialle a 3;
- `.desktop-title` → sostituito da un markup titolo diverso;
- `.overlay-modal` e `.modal__btn-close` → la modale della recensione;
- `.testimonial__btn-prev` / `__btn-next` e `.care-pet_content-ruler` → frecce e righello dei testimonial;
- `.header__right-part` e `.header__dont-board` → la nav orizzontale e il lettering del logo;
- `.header__menu-circle` → i 5 cerchioni decorativi del menu;
- **tutti gli effetti al mouse**: sono tutti dentro `if (isDesktop)` o `matchMedia('(min-width: 1024px)')` — cursore "read a story", palline in parallasse, hover dei bottoni `WithDot`, pallina decorativa dei servizi.

**COSA VIENE SOSTITUITO**
- **Preloader → finto caricamento**: al posto del clic, un contatore `loading 0% → 100%` animato con `roundProps` in **3 secondi esatti** con `ease: "none"` (quindi non misura niente), poi 500 ms di pausa e la maschera si apre da sola a `r: 1000`. L'interazione che ha fatto vincere il premio diventa un'attesa passiva di 3,5 s.
- **How it works → slider**: `.how-works__mob` con un titolo proprio (`.how-works__title-mob`), la sua descrizione e uno Swiper (`.how-works__slider-wrap`) sulle stesse 4 schede. Da 4 schermate di scroll pinnato a una slide da far scorrere col dito.
- **Servizi → frecce**: `.btn-slide__mob .prev` / `.next`, due frecce classiche al posto dell'anello di giocattoli.
- **Titolo hero**: markup diverso (`.mobile-title`), l'animazione delle righe ha `stagger: 0.2` uguale ma la "o" ruota su `.mobile-title__letter` invece che `.bottom-title__letter`; il rimbalzo della lettera **resta** — e' l'unica firma che sopravvive.
- **Menu**: pannello a tutto schermo, `transform: translateY(-102dvh) → 0`, `transition: all 1s var(--my-ease)`, overlay rosa `--c-light-pink` a `opacity: .7`, voci centrate verticalmente (`top: 50%`) invece che a `8.125rem`, pagina attiva marcata da un pallino rosso da `0.75rem` a sinistra della voce. Le palline compaiono in hover sulle voci (`.menu__hover-ball.n1/.n2`, `opacity .4s`) — su touch, non si vedranno quasi mai.
- **Card prezzi**: da entrata unica in `stagger` a entrata singola per card, `y: 40` invece di `y: 150`, `0.6 s` invece di `1.2 s`.
- **Header**: compaiono `.header__burger-btn`, `.header__left-mob-btn` e `.header-menu__mob-header` (logo cane + close dentro il pannello).

**COSA RESTA**
- Tutta la scala tipografica e il layout, ridisegnati su 375 px dal cambio di `font-size` su `html`;
- il cane in Lottie;
- il rimbalzo della "o" di "dog";
- le entrate di testo con SplitText e le entrate al scroll `yPercent: 28`;
- la parallasse in `scrub` delle palline dei testimonial (e' `scrollTrigger`, non mouse);
- il carosello servizi in autoplay a 5 s con la barra;
- Lenis (`smoothTouch: false` di default, ma `syncTouch` non e' impostato → su touch lo smooth non e' attivo, lo scroll e' quello nativo);
- la transizione di pagina a tendina;
- tutti i testi.

**Il giudizio dei giurati e' coerente**: Responsive Design 8.00/10 (il piu' alto del Dev Award) — il sito su mobile *funziona*; ma il momento memorabile e' quasi tutto desktop.

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| Framework | **Nuxt 3** (Vue 3), rendering **SSR** | VERIFICATO | header di risposta `x-powered-by: Nuxt`; `<div id="__nuxt">`; chunk `/_nuxt/entry.*.js`; direttive `data-v-*` e `router-link-active` nel markup servito. **Non e' una SPA cieca**: l'HTML iniziale contiene tutti i testi, per questo ho potuto leggere tutto senza browser |
| Animazione | **GSAP 3.12.2** + plugin `ScrollTrigger`, `ScrollToPlugin`, `DrawSVGPlugin`, `SplitText`, `Flip` (`Draggable`/`Observer` presenti nel bundle) | VERIFICATO | stringa `Ne.version = "3.12.2"` nel bundle; `registerPlugin(...)` con `provide: { gsap, ScrollTrigger, ScrollToPlugin, DrawSVGPlugin, SplitText, Flip }`; iniettati come `$gsap` nel contesto Nuxt |
| Easing custom | `CustomEase.create("my-ease", "0.24, 1, 0.36, 1")`, esposto anche come var CSS `--my-ease` | VERIFICATO | letto nel plugin GSAP e usato nelle `transition` CSS dell'header |
| Scroll | **Lenis** — `new Lenis({ duration: 1.2, orientation: 'vertical', smoothWheel: true })`, guidato da `gsap.ticker` con `lagSmoothing(0)`, `lenis.on('scroll', ScrollTrigger.update)` | VERIFICATO | codice del plugin nel bundle; supporta gli attributi `data-lenis-prevent` |
| Animazione vettoriale | **Lottie** (`lottie-web`), `renderer: "svg"` | VERIFICATO | chunk `lottie.5437493b.js` (78,6 KB); `loadAnimation({ path: '/Dog.json', loop: true, autoplay: true })` |
| Caroselli | **Swiper** (componenti Vue) | VERIFICATO | chunk `swiper-vue.b4b441a1.js` (54,2 KB) + CSS dedicato + font icone Swiper in base64 |
| 3D / WebGL | **nessuno** | VERIFICATO | nessuna occorrenza di `three`, `canvas` WebGL o shader nei bundle. Tutta la grafica e' **SVG inline** e PNG |
| Fisica | **nessun motore fisico** (niente Matter.js) | VERIFICATO | il "rimbalzo" e' solo `ease: "bounce.out"` di GSAP; il seguimento del mouse e' `gsap.to` con `duration`. Niente `Engine.create`, niente `applyForce` |
| CMS | **Strapi** (headless), su `api.dontboardme.com` | VERIFICATO | header `X-Powered-By: Strapi <strapi.io>` sul dominio API; CSP che cita `market-assets.strapi.io`; `/admin` risponde 200; struttura `/uploads/thumbnail_|small_|medium_|large_*.webp` |
| Ponte dati | Nuxt server routes (`/api/home`, `/api/footer`) che proxano Strapi | VERIFICATO | `$fetch('/api/home')` nel codice; le rotte rispondono JSON con testi, prezzi, testimonial, SEO |
| Hosting | **VPS Ubuntu con nginx 1.24.0** davanti a Node, sia sito che API | VERIFICATO | `Server: nginx/1.24.0 (Ubuntu)` su entrambi i domini |
| CDN | **nessuno rilevabile** | SUPPOSTO | nessun header `cf-ray`, `x-vercel-*`, `x-amz-cf-*`, `age` o `x-cache` nelle risposte |
| Immagini | **WebP** per i contenuti dal CMS (Strapi genera thumbnail/small/medium/large), **PNG non ottimizzati** per gli asset di design statici in `/main/`. Nessun `<picture>`, nessun `srcset`; solo `loading="lazy"` | VERIFICATO | lista `src` nel markup + misura dei byte |
| Icone e decori | **SVG inline nel bundle Vue** (pallina, osso, cacca, cane-logo, frecce) | VERIFICATO | componenti `IconToyBall`, `IconBone`, `IconPoop`, `CarePetRightBall` sono `render()` che restituiscono `<svg>` con i `path` scritti a mano |
| Font | self-hosted `.ttf` + `.otf` dal bundle | VERIFICATO | due `@font-face` con `format("truetype")` e `format("opentype")` |
| Analytics / tracking | **nessuno** | VERIFICATO | nessun tag GA/GTM/Meta/Hotjar nell'HTML servito |

## Peso e prestazioni

Misure fatte con `curl` da qui, il 13/08/2026, con `Accept-Encoding: gzip, br` (quindi byte realmente trasferiti).

| risorsa | trasferito |
|---|---|
| HTML della home (compresso) | **113,9 KB** (378 KB non compresso — e' SSR, contiene tutti gli SVG inline e ~63 KB di CSS in `<style>`) |
| `entry.66570678.js` | 100,3 KB |
| `lottie.5437493b.js` | 78,6 KB |
| `swiper-vue.b4b441a1.js` | 54,2 KB |
| `index.d67f6018.js` (home) | ~19 KB compresso (57,2 KB grezzo) |
| `/Dog.json` (Lottie) | **113,1 KB** |
| `Bayon-Regular.ttf` | 54,6 KB |
| `NeueMontreal-Medium.otf` | 41,9 KB |
| `/main/i1.png` … `i4.png` | 123 + 157 + 150 + 199 = **629 KB** |
| `/main/slide1.png` | 137 KB |
| `/main/slide2.png` | **4 158 KB (4,16 MB)** |
| `/main/slide3.png` | **2 803 KB (2,80 MB)** |
| `/main/dog-ass.png` | 67,6 KB |

**Il numero che conta: `slide2.png` pesa 4,16 MB e `slide3.png` 2,80 MB.** Sono le due foto del carosello servizi, PNG a piena risoluzione, non convertite in WebP mentre tutte le immagini che passano dal CMS lo sono. Sono `loading="lazy"`, ma il carosello parte da solo dopo 5 secondi: entro ~11 s dall'ingresso il browser ha scaricato ~7 MB di PNG che nessuno ha chiesto.

Totale realistico della home a carosello completo: **~8,5 MB**, contro ~430 KB di JS e ~215 KB di HTML+CSS+font. Il codice e' leggero; le immagini no.

- Richieste: ~12 chunk JS + 7 CSS + 2 font + ~9 PNG locali + ~10 WebP dal CMS + 1 JSON Lottie ≈ **40 richieste**, tutte su due soli host (`dontboardme.com`, `api.dontboardme.com`).
- TTFB della home misurato: **1,37 s**; risposta completa 1,76 s. Nessun `cache-control` visibile nelle intestazioni, nessun CDN.
- Punteggio WPO della giuria Awwwards: **6,80/10** — il piu' basso dei sei parametri del Dev Award. Coerente con i PNG.
- PageSpeed Insights: **non misurato**, l'API pubblica mi ha risposto `429 Too Many Requests`.
- **Il sito oggi e' parzialmente rotto**: `https://dontboardme.com/about-us` risponde **404 di nginx** (pagina d'errore di nginx, non la 404 con le cacche del sito) e `https://dontboardme.com/services` fa 301 su `/services/` che risponde **403 Forbidden di nginx**. Sono due delle sei voci del menu principale, presenti in header, menu mobile e footer. Funzionano: `/`, `/pricing`, `/blog`, `/contacts`, `/faq`, `/privacy-policy`, `/terms-of-use`, `/book-now`. Nel 2024, quando ha vinto, evidentemente funzionavano: la giuria ha valutato Content 7,73.

## Tre cose da rubare

**1. La rivelazione con `<mask>` SVG ancorata al puntatore.**
Non e' un fade e non e' un `clip-path` circolare CSS: e' un `<rect>` a schermo pieno del colore del preloader, mascherato da una `<mask>` che contiene un `<circle>` nero. Il buco si apre animando **l'attributo `r`** da 0 a 1800 con `power2.inOut` in 1,3 s, e `cx`/`cy` sono agganciati alla posizione del mouse *prima* del clic. Rifacibile in venti righe, senza librerie oltre a GSAP, e funziona su qualsiasi fondo (anche video). Il pezzo furbo: **l'animazione della pagina sotto parte 400 ms dopo l'inizio dell'apertura**, non alla fine — cosi' quando il buco arriva ai bordi il contenuto e' gia' in movimento e non sembra una diapositiva.

**2. Il "mazzo di carte" scrubbato: un `100vh` di spaziatore per ogni elemento.**
La sezione e' `position: sticky; top: 0; height: 100vh` dentro un contenitore alto `400vh`. Dentro il contenitore ci sono 4 div vuoti da `100vh` (`.plash-move-card1…4`) che **non si vedono e non contengono niente: servono solo da trigger**. Ogni scheda ha il suo `ScrollTrigger` con `trigger: '.plash-move-cardN', start: 'top bottom', end: 'bottom bottom', scrub: true` e anima `top` + `rotate` verso valori diversi e volutamente non tondi (`-3.077°`, `-1.206°`, `-4.402°`, `6.321°`). E' il modo piu' pulito che ho visto per dire "questo elemento entra nel suo turno" senza calcolare offset a mano: **si costruisce il tempo con l'altezza del DOM**, non con la matematica. Gli stessi trigger accendono i numeri laterali (`onEnter` / `onLeaveBack`).

**3. Il cursore-parola che si allunga: N elementi, un tween solo, `mix-blend-mode: difference`.**
"read a story" e' fatto di 10 `<span>` `position: fixed`, ognuno con un `left` di partenza fisso a scaletta (0, 10, 20, 30, 45, 60, 70, 80, 93, 104 px — spaziature **irregolari**, misurate sulle lettere reali). Tutti ricevono lo stesso tween verso la posizione del mouse (`duration: 1.2, delay: 0.04, ease: power4.out`) dentro una timeline con posizione `"<"`: partono insieme ma, avendo distanze diverse da percorrere, arrivano sfalsati e la parola si stira e si ricompone come una coda. `mix-blend-mode: difference` risolve gratis il problema della leggibilita' su fondi diversi. Zero canvas, zero calcolo di velocita', zero librerie di cursore.

**Bonus, per il metodo piu' che per la meccanica**: `html { font-size: 1.1111111111vw }` con un unico override a `4.2666666667vw` sotto 1024 px. Il progetto e' disegnato su 1440 e su 375, e ogni misura in `rem` corrisponde 1:1 al pixel di Figma. Nessun `clamp()`, nessun breakpoint intermedio, nessuna riga di layout responsive da scrivere: si scrive il numero che si legge in Figma. Da valutare, pero': cosi' su un 27" il testo diventa enorme (infatti hanno dovuto mettere `--viewport: 1920` sopra i 1920 px) e c'e' un costo di accessibilita' reale, perche' l'impostazione "testo grande" del browser viene ignorata. La giuria ha dato Accessibility **7,00/10**.

## Non verificato

- **Non ho mai visto il sito renderizzato.** Nessun browser aperto (vincolo del task: browser condiviso). Tutto viene da HTML SSR, bundle JS, CSS e API. Quindi: posizioni reali degli elementi a schermo, sovrapposizioni, come si legge davvero il titolo sopra le palline, se le animazioni scattano o sono fluide, se il carosello di giocattoli e' comprensibile al primo colpo — **non verificato**.
- **Durate di scroll in schermate**: verificate solo per "How it works" (400vh esatti nel CSS) e per l'hero (`78.125rem` = 1250 px). Tutto il resto e' stimato da `padding` e contenuti, senza misurare `scrollHeight`.
- **Colori**: tutti letti dai custom properties del CSS, nessuno stimato da screenshot. Ma **non so quale colore stia dove sullo schermo** oltre a quanto dichiarato dalle regole CSS che ho citato.
- **Peso totale della pagina**: sommato a mano dalle singole risorse. Non e' una misura da waterfall reale: non so quante di quelle risorse vengano davvero richieste in una sessione tipo, ne' in che ordine, ne' quante siano differite.
- **Punteggi Lighthouse / Core Web Vitals**: non ottenuti (`429` dall'API PageSpeed). Gli unici numeri di prestazione sono il TTFB che ho misurato io e il WPO 6,80/10 della giuria Awwwards.
- **Pagine interne**: ho letto solo `/`, `/pricing`, `/contacts` e la 404. `/blog`, `/faq`, `/book-now`, `/privacy-policy`, `/terms-of-use` rispondono 200 ma non le ho analizzate. `/about-us` e `/services` **non rispondono** (404 e 403 di nginx) quindi non sono analizzabili oggi in nessun modo.
- **Il form di `/contacts`**: ho letto etichette e messaggi d'errore dal markup, ma non so dove invii i dati ne' se funzioni.
- **Menu a tutto schermo su desktop**: il CSS del pannello c'e' e il pulsante burger ha una classe `.active`, ma non ho trovato il codice del componente header nei chunk che ho scaricato (12 chunk sul totale). **Non verificato** se e quando il burger compaia anche sopra 1024 px.
- **Il carosello di giocattoli**: la meccanica di rotazione e clonazione e' letta riga per riga nel codice, ma non ho visto quali siano i tre giocattoli (`.hidden_toy.first/second/third` sono componenti SVG che non ho aperto uno per uno).
- **Se il sito nel 2024 fosse identico a oggi**: no. Il footer dice `© 2026`, alcune date dei testimonial nel CMS sono `13 Aug, 2026` (aggiornate oggi, evidentemente da un campo dinamico), e due pagine sono rotte. La versione premiata puo' differire.
- **Nessuna scheda di browser lasciata aperta**: non ne ho aperta nessuna.

---

### Fonti

- Sito: https://dontboardme.com/ · API: `https://dontboardme.com/api/home`, `https://dontboardme.com/api/footer` · CMS: `https://api.dontboardme.com/`
- Awwwards SOTD: https://www.awwwards.com/sites/dont-board-me
- Awwwards Site of the Year Users' Choice 2024: https://www.awwwards.com/annual-awards-2024/site-of-the-year-users-choice
- Profilo studio: https://www.awwwards.com/thefirstthelast/ · sito studio: https://thefirstthelast.agency/
- CSS Winner: https://www.csswinner.com/details/dont-board-me/17891
- Bundle analizzati: `/_nuxt/entry.66570678.js`, `/_nuxt/index.d67f6018.js`, `/_nuxt/useShowPageAnimFirst.9f0c167c.js`, `/_nuxt/CarePetRightBall.d1205ab0.js`, `/_nuxt/InstagramBlock.95499e99.js`, `/_nuxt/usePageMeta.112462f7.css`
