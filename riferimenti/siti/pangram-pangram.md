# Pangram Pangram Foundry

- **URL**: https://pangrampangram.com
- **Premio**: Awwwards **E-commerce Site of the Year 2021** (Annual Awards). Prima Site of the Day l'11/11/2021 con punteggi Design 7.91 / Usability 7.65 / Creativity 7.59 / Content 8.1 — totale 7.79; Developer Award 7.73 (Animations/Transitions 8.40, WPO 7.00). Fonte: https://www.awwwards.com/sites/pangram-pangram-foundry e https://www.awwwards.com/annual-awards-2021/ecommerce-site-of-the-year
- **Studio**: Locomotive (Montreal). Lo studio rivendica in totale sei premi sul progetto: E-commerce of the Year, ori e argenti Idéa, Site of the Day, Developer Award, Mobile Excellence. Fonte: https://locomotive.ca/en/work/pangram-pangram-foundry
- **Anno**: premio 2021. **ATTENZIONE: il sito letto oggi NON e' piu' quello premiato.** Il tema attuale e' Shopify theme `t/52`, build Vite, senza Locomotive Scroll (0 occorrenze nel bundle). L'impianto premiato nel 2021 usava Locomotive Scroll (dichiarato da Awwwards). Tutto quello che segue descrive la **versione live oggi**, salvo dove segnalato.
- **Letto il**: 13/08/2026

---

## Cosa vende

Licenze d'uso di caratteri tipografici propri (62 famiglie a catalogo, dichiarate `Showing 16 of 62 fonts` sulla collection). Non vende file: vende **diritti di uso, tariffati per unita' di diffusione** — postazioni installate, pageview mensili, utenti attivi mensili dell'app, follower, dipendenti dell'azienda. I file si prendono gratis prima, in prova.

## A chi

Designer e studi che stanno scegliendo un carattere per un progetto di un cliente, e team di brand che devono licenziare per un'azienda intera. Uscendo dal sito il compratore deve pensare due cose: *«questo carattere l'ho gia' provato, ce l'ho sul disco»* e *«so esattamente quale scaglione di licenza mi serve»*. La vendita non e' impulsiva: e' il secondo passaggio dopo una prova gratuita.

## Idea regista

**La pagina di un carattere e' composta in quel carattere**: entri nel prodotto e tutta l'interfaccia — titoli, corpo, menu, etichette, prezzi — si ricompone nel font in vendita, quindi il prodotto non e' mostrato, e' indossato.

## Il momento

Non e' uno scroll e non e' un video: e' un **evento di caricamento**. All'apertura della scheda prodotto il sito e' vuoto, poi il file del font arriva e la pagina si scrive tutta insieme nel carattere che stai per comprare.

E' un meccanismo esplicito nel codice, non un'impressione:

1. `pageFont()` (componente Alpine) scarica il `.woff2` del prodotto, ne legge la tabella `fvar` con opentype.js per ricavare il range dell'asse `wght`, lo registra con `new FontFace(...)` e `document.fonts.add()`.
2. Riscrive il contenuto di `<style id="style-ufont">` con `--pagefont-family`, `--pagefont-weight`, `--pagefont-style`, `--pagefont-variableProperties`, `--pagefont-sizeAdjust`.
3. Emette l'evento `pageFontReady`; un listener aggiunge `body.pagefont-ready`.
4. Il CSS ha `body.pagefont-ready .u-loading-pagefont{opacity:1;transform:translateY(0)}` — quindi **tutti gli elementi composti nel font venduto sono invisibili finche' il font non e' pronto**, e poi entrano a cascata con ritardo `calc(0.1s * var(--delay-order))`.

Il secondo momento e' il **tester variabile che si muove da solo**: il grande campione di testo cambia peso/larghezza in continuazione senza che tu tocchi niente, e si ferma nel momento in cui muovi tu uno slider (vedi Animazioni).

## Struttura, sezione per sezione

### Home (`/`)

| sezione | cosa mostra | cosa fa l'utente | durata (schermate) |
|---|---|---|---|
| Header sticky | logo `Pangram Pangram`, `All fonts`, `Font starter pack`, `Font in use`, `Academy`, `Support`, cerca, account, carrello | apre il megamenu a tendina nera a tutta pagina | fisso |
| Hero 1 — Palma | badge `New`, nome composto nel proprio font, `A familiar Humanist with Fizz.` | `Explore font` / `Try for Free` | 1 |
| Hero 2 — Neue Montreal | badge `Update`, `Version 3 is here! Added styles, languages and much more!` | idem | 1 |
| Hero 3 — Neue Gstaad | badge `Early Access`, `Calm. Efficient. Swiss.` | idem | 1 |
| Our newest fonts | 12 schede font, `Showing 12 of 62 fonts`, toggle `Card view` / `List view` | commuta vista, hover sulle schede | 3–4 |
| Our fonts in use | progetti reali taggati col font usato (Stella Artois x Wimbledon, Côt Parrilla, Veda, The Dock, Dickie's Ginger, The Webster, The Moraine) | `Read More` | 2 |
| Manifesto | `We provide trend-conscious, free to try fonts for designers.` + `All our commercial licenses start at $40.` | `Learn more about us` | 1 |
| Trusted by these curated brands | loghi clienti | `View All` | 1 |
| Promo doppie | Microsite Neue Montreal / Font Starter Pack (`78 Typefaces with about 1250+ Styles and 42 Pro Mockups.`) / Sector / merch `Rules of Play Longsleeve tee.` | click | 2 |
| From The Pangram Academy | articoli editoriali (`The Best Technology Fonts for Tech and Digital Brands`, `Readable vs Accessible`) | `Read More` | 1 |
| Footer | catalogo completo dei 62 font in colonne + newsletter `Don't miss a beat` | iscrizione | 1 |

### Scheda prodotto (`/products/neue-montreal`) — la pagina che conta

| # | sezione | cosa mostra | cosa fa l'utente |
|---|---|---|---|
| 1 | Page header | nome del font enorme, `Rooted in Montreal's design heritage, from Expo 67 to today's global creative landscape.`, `Free to try`, `Licenses start at $40` | `Try for Free` / `Buy Now` |
| 2 | Style list | `36 Styles`, campioni `AaBbCc` `01234567` `{(!@#$?&)}` | — |
| 3 | Weights list | i 36 nomi con il valore numerico (`Hairline 100` … `Black 900`, poi gli Italic, poi i `Text`) | **hover su un peso → il testo grande sopra si ricompone in quel peso** |
| 4 | Sampler (×4, testi diversi) | testo editabile con slider `Size` / `Leading` / `Spacing` + select dello stile | trascina gli slider, cambia stile |
| 5 | Descrizione lunga | copy SEO su storia, Text version, supporto linguistico | — |
| 6 | `Neue Montreal is variable` | tester ad assi variabili con uno slider per ogni asse trovato nel file | muove gli assi, play/pause |
| 7 | `Glyphs set overview` | canvas con il glifo disegnato e le linee di metrica; griglia dei glifi raggruppati | clicca un glifo, `See all glyphs` |
| 8 | Microsite | `Welcome to Neue Montreal` — `Travel through to the type's iconic features and landmarks.` | `Experience the microsite` |
| 9 | `Neue Montreal's Features` | feature OpenType che si accendono e spengono da sole (`Alternate a`, `Round dots`, `Standard ligatures`, `Case-Sensitive Forms`, `Discrete Ligatures`, `Tabular Numbers`) | guarda |
| 10 | Pitch | `The only Grotesk you'll ever need.` + 506 lingue / 3.4 miliardi di parlanti | — |
| 11 | `What's new in Version 3.00` | changelog editoriale con Larger Apertures / Weight Corrections / Spacing Adjustment | — |
| 12 | Scheda tecnica | Designers, Collaborator, Categories, `36 Styles with 1350 Glyphs each`, `Version 3.00`, `Latest update: April 2026`, `OTF, TTF, WOFF, WOFF2`, elenco lingue | — |
| 13 | `Commercial Licenses` | selettore a due passi: **1** pacchetto (Complete / Upright / Italic / Essentials…), **2** tipo e copertura della licenza; `Subtotal in USD` | `Add to cart →` |
| 14 | Fallback commerciale | `Not sure what to get? Or can't find the right coverage?` → `Contact us`; `Need more information about our licenses?` → `Read our FAQ` | — |
| 15 | `Neue Montreal in use` | 6 progetti taggati Branding/Digital/Print/Packaging | `View project` |
| 16 | `Neue Montreal pairs well with these typefaces.` | 4 font correlati, ognuno con il proprio pangramma | `Check it out` |
| 17 | Footer | come home | — |

## L'esperienza in ordine di tempo

**Scheda prodotto, primi dieci secondi.**

- **0.0–0.5s** — HTML servito da Shopify (TTFB misurato 0.51–0.91s). `fonts.css` e il CSS principale sono in `<link rel=preload>` gia' negli header HTTP.
- **0.5–1.0s** — arriva `PPNeueMontreal-Variable.woff2` (319 188 byte), il font di **interfaccia**, dichiarato `font-display: block`. Fino a qui la UI e' a testo invisibile: nessun fallback di sistema viene mai mostrato. E' una scelta: una fonderia non puo' permettersi di far vedere Arial.
- **~1.0s** — `DOMContentLoaded` → `body.dom-loaded` → tutti gli elementi `.u-loading` passano da `opacity:0; translateY(1rem)` a pieno, in `0.75s` con `cubic-bezier(.22,1,.36,1)`, scaglionati di 0.1s per `--delay-order` (classi `u-delay-1` … `u-delay-10`).
- **~1.0–2.0s** — in parallelo `pageFont()` scarica il woff2 del font in vendita, lo parsa con opentype.js, lo registra.
- **~2.0s** — `pageFontReady` → `body.pagefont-ready` → **la seconda ondata**: tutto cio' che e' composto nel font venduto (`.u-loading-pagefont`) entra con la stessa curva e lo stesso scaglionamento. Questo e' il momento.
- **2–4s** — il `variableTester` piu' in basso ha gia' avviato il suo `requestAnimationFrame`: quando ci arriverai starai gia' vedendo gli assi muoversi.

**Poi, a blocchi.**

- Ogni blocco successivo entra su `x-intersect.once` con margine `-50px`: la direttiva `x-appear` aggiunge `.visible` e l'elemento sale di `2rem`.
- Ogni scheda font in griglia scarica **il proprio file font solo quando entra nel viewport** (`customFont` + `x-intersect`), quindi lo scroll della home e' una sequenza di caratteri che si rivelano uno alla volta.
- I banner immagine hanno parallasse: l'immagine e' al 118% dell'altezza del contenitore e viene traslata su `--parallax-progress`.

## Animazioni

| elemento | cosa si muove | legato a | curva / inerzia | note |
|---|---|---|---|---|
| Entrata iniziale UI | `opacity 0→1`, `translateY(1rem→0)` | stato `body.dom-loaded` | `0.75s cubic-bezier(.22,1,.36,1)` (ease-out-quint) | stagger `calc(.1s * --delay-order)` |
| Entrata testi nel font venduto | idem | stato `body.pagefont-ready` | idem | **gated sul caricamento del font**, non sul DOM |
| Blocchi in scroll | `translateY(2rem→0)` + fade | `x-intersect.once.margin.-50px` (IntersectionObserver via plugin Alpine) | idem | direttiva custom `x-appear` |
| **Tester variabile** | ogni asse `fvar` oscilla fra `minValue` e `maxValue` | **tempo**, `requestAnimationFrame` | `0.5*(1-cos(2πt/durata))` poi rimappato con easeInOutSine; **durata random 5000–8000ms per asse** | gli assi vanno fuori fase fra loro, il movimento non e' mai ciclico all'occhio. Si ferma appena tocchi uno slider (`updatedAxis` → `isPlaying=false`); c'e' un tasto play/pause |
| Lista pesi | il campione grande cambia `--font-weight` / `--font-style` / `--font-variation-settings` | **hover** sulla riga del peso | istantaneo (interpolazione del font variabile) | componente `fontWeights` |
| Feature OpenType | due span sovrapposti (feature ON / feature OFF) si alternano | tempo, CSS puro | `@keyframes fades{0%{opacity:1}45%{opacity:1}55%{opacity:0}to{opacity:0}}`, `2s ease-in infinite alternate both`, la versione OFF con `animation-direction` invertita | dimostra una feature senza un solo byte di JS |
| Testo che riempie la larghezza | `font-size: calc(1em * var(--font-cover-size-ratio))` | ResizeObserver (debounce 100ms) | nessuna | `fontCoverSize` clona il testo nascosto, misura la larghezza reale, calcola il rapporto con il contenitore |
| Parallasse banner | `--parallax-progress` su immagini alte 118% | scroll (listener diretto su `scroll`/`resize`, senza throttle) | nessuna inerzia | componente `parallax` |
| Pagina 404 | figurine che scorrono | **`animation-timeline: view()`** — scroll-driven animation nativa CSS | `linear` | nessuna libreria |
| Schede font | sfondo → nero, testo → bianco, layer di hover che sale del 4% | hover | `var(--transition-speed) ease-out-quint` | `container-type: inline-size` sulla card |
| Apertura scheda Font Starter Pack | la card vola dal punto cliccato al centro schermo | click, vettori calcolati da `getBoundingClientRect()` | transizione CSS su `--trans-x/--trans-y` | tecnica tipo FLIP fatta a mano |
| Menu | pannello nero cala dall'alto | stato | `transform/opacity .3s ease-out-cubic` in entrata, `.2s ease-in-cubic` in uscita | `.--transition-from{opacity:0;translateY(-8%)}` |

**Librerie riconosciute (bundle attuale):** Alpine.js (core + plugin `intersect`, `persist`, `focus`, `trap` — `x-trap.noscroll.inert` sui modali), Swiper (carousel e lightbox), opentype.js (parsing `fvar`, `os2`, disegno dei glifi), Web Font Loader di Typekit (fallback `fontloader.loadVariant`). **Zero GSAP, zero Lenis, zero Locomotive Scroll, zero Three.js** — verificato per conteggio di occorrenze sul bundle.

## Colori

Definiti come triple HSL in `:root` e consumati con `hsl(var(--token))`, cosi' ogni token e' modulabile in opacita' senza duplicati.

| ruolo | token | esadecimale | dove si usa |
|---|---|---|---|
| Fondo pagina | `--color-offwhite` → `--color-background` | `#fafafa` | tutto il sito |
| Testo | `--color-black` → `--color-foreground` | `#000000` | tutto il testo, i glifi, i menu |
| Inverso | `--color-white` | `#ffffff` | testo su nero, glifo disegnato nel canvas |
| Superficie chiara | `--color-gray` | `#ededed` | placeholder immagini, card |
| Bordi / divisori | `--color-gray-medium` | `#d9d9d9` | linee |
| Testo disattivato | `--color-gray-dark` | `#ababab` | feature OpenType spente, note del carrello |
| Testo secondario | `--color-gray-darker` | `#666666` | dettagli, **linee di metrica del canvas glifi** |
| **Accento primario** | `--color-red` → `--color-primary` | `#ff2f00` | hover dei link, pallino contatore dei filtri attivi, badge `New` |
| Accento 2 | `--color-yellow` | `#ffb700` | badge |
| Accento 3 | `--color-green` | `#5cffa8` | **il subtotale del carrello** — l'unica cosa verde del sito |
| Accento 4 | `--color-blue` | `#bfe0ff` | badge |
| Accento 5 | `--color-orange` | `#f86700` | badge |
| Pannello menu | `hsl(var(--color-foreground) / .99)` | nero quasi pieno | menu a tendina, con `box-shadow: 0 0 30px 9px #0000004d` |

Nota: la tavolozza operativa e' **bianco sporco + nero**. I cinque colori accento esistono solo dentro i badge e nel subtotale. Nessun gradiente, nessuna ombra decorativa fuori dai pannelli sovrapposti.

## Tipografia

**Un solo font per tutta l'interfaccia**, e per giunta uno dei loro. `fonts.css` contiene esattamente una regola:

```css
@font-face {
  font-family: "Neue Montreal";
  src: url("PPNeueMontreal-Variable.woff2") format("woff2");
  font-weight: 1 999;
  font-display: block;
}
```

Un file, 319 188 byte, asse peso da 1 a 999, `font-display: block` (mai un fallback a schermo). Il secondo font di sistema che compare e' solo nel canvas dei glifi per le etichette di metrica.

### Scala

Ratio **1.125** (seconda maggiore) su base 14px, e le dimensioni sono **fisse, non fluide** (`clamp(x, x + 0vw, x)`): a scalare col viewport sono le **spaziature**, non il corpo. Deliberato: su un sito di caratteri il corpo deve restare comparabile fra schermi.

| livello | token | rem | px | uso |
|---|---|---|---|---|
| micro | `--fs-xs` | .6914 | 11.1 | contatori badge |
| piccolo | `--fs-s` | .7778 | 12.4 | note, avvisi carrello |
| **base** | `--fs-base` | .875 | **14** | corpo, `--font-body-weight: 400` |
| medio | `--fs-m` | .9844 | 15.8 | descrizioni |
| large | `--fs-l` | 1.1074 | 17.7 | corpo desktop |
| xl | `--fs-xl` | 1.2458 | 19.9 | occhielli, titoli card |
| 2xl | `--fs-2xl` | 1.4016 | 22.4 | voci di menu, sottotitoli |
| 3xl | `--fs-3xl` | 1.5768 | 25.2 | bigtext desktop |
| 4xl | `--fs-4xl` | 1.7739 | 28.4 | — |
| huge | `--fs-huge` | 2.25 | 36 | prezzi, icone TOC |
| enormous | `--fs-enormous` | 3.75 | 60 | titolo prodotto desktop, **subtotale carrello** |
| gigantic | `--fs-gigantic` | 5 | 80 | display |

Pesi: corpo 400, titoli `--font-heading-weight: 600`.

### Come sono serviti i font

Tre regimi diversi, ed e' il cuore tecnico del sito.

1. **Font di interfaccia** — `@font-face` statico in un CSS precaricato via header `Link: rel=preload`, `font-display: block`.
2. **Font del prodotto in vendita** — caricato in JS (`pageFont`), parsato con opentype.js per leggere il range reale dell'asse `wght` dalla tabella `fvar`, registrato con `new FontFace(family, arrayBuffer, {weight: "min max", display: "swap"})`, poi iniettato come `--pagefont-family` in uno `<style>` dedicato. La classe che lo applica e':
   ```css
   .u-font{
     font-family: var(--pagefont-family), "Neue Montreal", sans-serif;
     font-weight: var(--pagefont-weight);
     font-style: var(--pagefont-style);
     font-variation-settings: var(--pagefont-variableProperties);
     font-synthesis: none;
   }
   ```
   `font-synthesis: none` e' la riga morale del sito: **il browser non ha il permesso di falsificare un grassetto o un corsivo.** Se un peso non esiste nel file, non si vede. E' l'unica scelta possibile per chi vende i pesi uno a uno.
3. **Font dei campioni in griglia** — `customFont` con `x-intersect`: il file arriva solo quando la scheda entra in viewport; l'`@font-face` viene scritto a runtime in un `<style data-name="font-face_famiglia:n4">` e memoizzato in `window.fontloader.variants` cosi' due schede sullo stesso font non lo scaricano due volte. Le variabili scritte sull'elemento sono `--rendered-font-family`, `--rendered-font-weight`, `--rendered-font-style`, `--rendered-font-variation-settings`, `--rendered-font-size-adjust`.

`font-size-adjust` viene passato **per carattere** dal CMS (attributo `data-font-size-adjust`): serve a normalizzare l'altezza della x fra famiglie diverse, cosi' due campioni affiancati a 60px hanno lo stesso peso ottico anche se hanno metriche diverse. E' un dettaglio che quasi nessuno fa.

### I tre strumenti tipografici, in dettaglio

**a) Sampler** (`productSampler`) — il campo di testo grande con tre slider.
- `Size` non e' in px ne' in vw ma in **`cqw` (container query width)**: `--samplerFontSizeDesktop: calc(size/20) cqw`. Il corpo e' relativo al contenitore, quindi il campione resta proporzionato dentro il suo riquadro a qualunque larghezza. Su mobile il valore viene rimappato su un altro range: `lerp(3, 60, normalize(size, sizeMin, sizeMax))` cqw.
- `Leading` → `line-height: valore/10`. `Spacing` → `letter-spacing: valore/100 em`.
- I **toggle delle feature OpenType** compongono `font-feature-settings` da due liste servite dal CMS: `custom_css` per la feature accesa e `custom_css_off` per quella spenta, cosi' si puo' anche *disattivare* una feature attiva di default.
- La select degli stili passa una stringa `peso,stile,variationSettings,famigliaCustom`: se il font e' variabile costruisce `"wght" 700, "ital" 1`, se e' statico assegna `font-weight`.

**b) Tester variabile** (`variableTester`) — non ha assi cablati: **li scopre dal file**.
- Legge `font.tables.fvar.axes`, scarta gli assi degeneri (`maxValue > minValue`), e genera uno slider per ognuno. Funziona su un font a due assi come su uno a sei senza toccare il template.
- Il valore mostrato si adatta al tipo di asse: se il range e' fra 0 e 1 (tipo `ital`, `slnt` normalizzato) stampa due decimali, altrimenti un intero.
- Il default dell'asse `wght` non e' il default del file ma `max(minValue, 400)`: non parte mai da un Hairline illeggibile.
- Anima da solo finche' non intervieni.

**c) Visore glifi** (`fontGlyphs`) — due `<canvas>` sovrapposti, scalati per `devicePixelRatio`.
- Il canvas di fondo disegna le **metriche verticali vere lette da `os2`**: `Baseline`, `Ascender` (`sTypoAscender`), `Descender` (`sTypoDescender`), `Cap Height` (`sCapHeight`), `x-height` (`sxHeight`), etichetta a sinistra e **valore in unita' em a destra**.
- Il glifo e' disegnato come path vettoriale (`glyph.getPath(x, baseline, size).draw(ctx)`), riempito `#FFFFFF`, non come testo: quindi si vede la forma esatta, non il rendering del browser.
- I glifi sono raggruppati per range Unicode e divisi in `primary` (contiene codepoint < 384, cioe' latino base) e `secondary` (tutto il resto: cirillico, greco, arabo), con un `See all glyphs` che apre i gruppi secondari.
- Mostra `U+XXXX (indice)` per il glifo attivo. Ridisegna su `ResizeObserver` con debounce 200ms.

## Testi veri

**Titolo pagina**: `Pangram Pangram — Free to try, High-Quality Fonts for Designers`

**Meta description**: `Pangram Pangram is a world-renowned type foundry crafting premium, contemporary fonts for bold brands and creatives. Explore our full catalog, every font is free to try, made to perform across print, digital, and everything in between.`

**Menu principale**: `All fonts` · `Font starter pack` · `Font in use` · `Academy` · `Support`
**Menu esteso**: `All fonts` · `Early access` · `Font starter pack` · `Font in use` · `Academy` · `About us` · `Search` · `Support` · `Contact us` · `Font licenses` · `FAQs` · `EULA`
**More PP®F**: `Off Type Foundry` · `Shop Playground Goods` · `Discover the Lab` · `TypeTrials®`

**Chiamate all'azione**: `Try for Free` · `Buy Now` · `Explore font` · `Check it out` · `Add to cart →` · `View all fonts` · `Get it now` · `Experience the microsite` · `Read More` · `Get your fonts`

**Manifesto (home)**:
> `We provide trend-conscious, free to try fonts for designers.`
> `Each typeface, every glyph is crafted with great care and attention to details for your everyday designs.`
> `All our commercial licenses start at $40.`

**Prodotto (Neue Montreal)**:
- occhiello: `Rooted in Montreal's design heritage, from Expo 67 to today's global creative landscape.`
- etichette sopra i bottoni: `Free to try` · `Licenses start at $40`
- claim: `The only Grotesk you'll ever need.`
- `A timeless grotesque.`
- `Neue Montreal is variable`
- `Glyphs set overview` · `Glyphs View` · `See all glyphs`
- `Welcome to Neue Montreal` — `Travel through to the type's iconic features and landmarks.`
- `36 Styles with 1350 Glyphs each` · `Version 3.00` · `Latest update: April 2026` · `OTF, TTF, WOFF, WOFF2`
- `Love Neue Montreal for your project? Grab our comprehensive licenses below.`
- `Choose your font package` · `Choose Family or Weight` · `Subtotal in USD`
- `Not sure what to get? Or can't find the right coverage?` / `Please contact us for our tailored corporate licenses!`
- `Neue Montreal pairs well with these typefaces.`

**Modale «Try for Free»** (il pezzo commerciale piu' importante del sito):
> `📦📦📦`
> `Almost there!`
> `Get key weights of Neue Montreal with a complete glyph set for free for your personal projects, portfolio, pitches, etc... Simply enter a valid email address below, press the button and check your emails for your free-to-try files.`
> `Get News & Updates from Pangram Pangram`
> `Enter your email address*`
> `It usually takes 3 to 5 minutes to get your files depending on the traffic..`
> `Get your fonts`
> (dopo l'invio) `Thank you for subscribingg` [refuso presente nel sito]

**Pangrammi** — ogni carattere ne ha uno diverso, mai lo stesso testo due volte. E' la firma della casa (si chiamano Pangram Pangram):
- Palma: `Bored? Craving a pub quiz fix? Why, just come to the Royal Oak!`
- Neue Montreal: `Jim quickly realized that the beautiful gowns are expensive.`
- Neue York: `The five boxing wizards jump quickly from Bronx cafes to dazzling Queens nightclubs.`
- Frama: `In Baghdad, a quail gawked at a camel playing sexy lo-fi Peruvian jazz.`
- Kyoto: `Watch "Jeopardy!", Alex Trebek's fun TV quiz game.`
- Neue Gstaad: `The wizard quickly jinxed the gnomes before they vaporized.`
- Museum / Watch: `Few black taxis drive up major roads on quiet hazy nights.` / `Foxy diva Jennifer Lopez wasn't baking my quiche.`
- Editorial Old: `Six javelins thrown by the quick savages whizzed forty paces beyond the mark.`
- Lettra Mono: `Jaded zombies acted quietly but kept driving their oxen forward.`

**Descrittori dei caratteri** — una riga sola, con la punteggiatura usata come ritmo:
`A familiar Humanist with Fizz.` · `The only Grotesk you'll ever need.` · `A layered gothic rooted in the city's rich designs` · `A classic geometric, refined for today.` · `Bold slabs. Soft teardrops. Impact with grace.` · `Calm. Efficient. Swiss.` · `Inspired by Japan. Built for anywhere.` · `Classic form. Contemporary soul.` · `Ultimate tool for advertising.` · `Understated. Overdelivered.` · `Your brutalist ally.` · `Inspired by the iconic Japanese brand Tamiya.`

**Piede**: `Don't miss a beat` / `Subscribe to our newsletter to stay in touch with the latest.` · `Copyright © 2018 – 2026. All rights reserved.` · `↑ Back to top` · `Pangram Pangram® Foundry` · `Created by Mat Desjardins and the team.`

## Come funziona il negozio

Shopify, ma il prodotto e' costruito su misura. Il modello:

1. **Provare e' gratis e non e' finto.** `All of our fonts are free to try for personal use as long as it is not used in a commercial project.` L'uso personale ammesso e' elencato: `Personal portfolios, Client pitches, personal projects, personal instagram (or any social media) posts, artistic projects with a small audience.` **I pitch al cliente sono inclusi**: e' il punto in cui il designer si affeziona al carattere prima di poter chiedere il budget.
2. **Il file gratuito costa un'email.** Il bottone `Try for Free` apre un modale che invia a un form Brevo/Sendinblue (`sibforms.com`) — non un download diretto. `It usually takes 3 to 5 minutes to get your files`. Il carrello del sito e' un secondo tempo; il primo e' la mailing list.
3. **La licenza si compra in due passi.** Passo 1 = quale pacchetto di stili (`Complete Collection (36 Styles + Variable including italics)`, `Upright Collection`, `Italic Collection`, `Essentials Collection (Regular, Italic, Bold, Bold Italic)`, oppure singoli pesi). Passo 2 = tipo di licenza e copertura. I due passi sono numerati in CSS con `content:"1"` e `content:"2"` in un pallino.
4. **Sette tipi di licenza, ognuno tariffato su un'unita' diversa** (fonte: https://pangrampangram.com/pages/faq):

| licenza | copre | il prezzo scala su |
|---|---|---|
| Print (ex Desktop) | `any non-embedded material (except on social media and in a logo)` | numero di **postazioni** con il font installato |
| Web | `any website, microsite and subdomain where the font is embedded` | **pageview mensili** previste |
| App | `any application (mobile or desktop) and software where the font is embedded` | **utenti attivi mensili** |
| Social Media | `any commercial use of the font on any social media platform` | **follower totali combinati** |
| Logo | `each company logo that features the font` | **numero di dipendenti** dell'azienda |
| Broadcast | spot TV e broadcasting | — |
| Video Game | videogiochi | — |

5. **Il prezzo minimo e' un'ancora dichiarata ovunque**: `Licenses start at $40` compare accanto ai bottoni del prodotto e nel manifesto della home. Non c'e' listino a griglia visibile: il totale si costruisce e appare come `Subtotal in USD` in **verde `#5cffa8` a 60px** — l'unico momento cromatico del sito.
6. **La via d'uscita per i casi grossi e' esplicita**: `Please contact us for our tailored corporate licenses!`
7. **Catalogo navigabile per forma, non per marketing.** Filtri (`filter.p.tag`): `Sans Serif`, `Serif`, `Variable`, `Arabic`, `Brutalist`, `Cyrillic`, `Display`, `Expressive`, `Geometric`, `Gothic`, `Grotesk`, `Humanist`, `Italics`, `Japanese`, `Monospace`, `Organic`, `Text`. Ordinamenti: `Most recent first`, `Most popular first`, `Alphabetical A-Z`, `Alphabetical Z-A`. Doppia vista `Card view` / `List view`.
8. **Contenuto editoriale che sostiene la vendita**: `Font in use` (casi reali taggati col font, con link incrociato dalla scheda prodotto), `Pangram Academy` (articoli tipo `The Best Fashion Fonts for Apparel and Clothing Brands`, `Readable vs Accessible`), i **microsite** dedicati ai caratteri di punta (Frama, Fragment, Editorial New, Neue Montreal), un `Font Starter Pack` in bundle (`78 Typefaces with about 1250+ Styles and 42 Pro Mockups.`), merch, e un secondo marchio (`Off Type Foundry`).
9. Sul carrello c'e' una checkbox EULA obbligatoria (`.cart__field--eula`). Localizzazione: cookie `localization=US`, `cart_currency=USD`, selettore lingua `Français` nel footer.

## Mobile

Il sito non e' un altro sito sul telefono — e' notevolmente **lo stesso sito**, e per un e-commerce di font e' una scelta forte. Ma alcune cose cambiano. Breakpoint dominante: **768px** (106 regole `width>=768px`), piu' 750px (eredita' del tema Shopify Dawn), 990px, 1024px, 1440px.

**SPARISCE su mobile**
- I tag/categorie sopra i titoli dei caroselli (`.carousel__tags{display:none}`).
- I loghi dei metodi di pagamento nel piede del menu (`.nav__box-footer-logos`).
- L'intestazione della colonna sinistra del visore glifi (`.product-glyphs__left-col .product-glyphs__header`).
- Le interruzioni di riga forzate nei bigtext (`.page-header__bigtext br{display:none}`).
- Tutto cio' che porta `.u-hide-mobile` (utility esplicita, con `.u-hide-desktop` speculare: **contenuti diversi vengono scritti due volte nel markup**, non riadattati).
- Gli hover: schede, righe dei pesi, badge invertiti — tutta l'interazione a puntatore non ha equivalente. La lista dei pesi che ricompone il campione al passaggio del mouse **su telefono e' una lista muta**.

**VIENE SOSTITUITO**
- Menu → pannello nero a tutta altezza (`height:100vh; overflow:scroll`) che cala dall'alto, griglia forzata a `1fr 1fr`, `max-width` del wrapper annullato; scroll del body bloccato da una classe utility.
- Modale → a tutto schermo: `height:100vh`, `border-radius:0`, `padding-inline` azzerato sul form. Il titolo passa a **`font-size: 13vw`** (unico caso di corpo davvero fluido del sito).
- Sampler → il corpo del testo usa `--samplerFontSizeMobile`, calcolato con una rimappatura diversa (`lerp(3,60,...)` cqw) invece di `size/20` cqw: gli stessi valori di slider danno testi molto piu' grandi in proporzione, per non ridurre il campione a un francobollo.
- Titolo prodotto → da `--fs-gigantic` a `--fs-enormous` (60px), header centrato invece che allineato a destra.
- Piede → `grid-template-areas` a **2 colonne** (`allfonts / submenu1 submenu2 / submenu3 submenu4 / newsletter`), che diventano **3** a 720px e **7** a 1024px. Tre layout diversi dello stesso piede.
- Visore glifi → le due colonne si scambiano con `order: 0/1` (su mobile il canvas viene prima, i controlli dopo) e la colonna destra diventa una barra `flex; justify-content: space-between`.
- Corpo del testo → da `--fs-l` (17.7px) a `--fs-base` (14px) nelle descrizioni prodotto e nel carrello.
- Filtri collection → il pannello a popover cambia allineamento e i bottoni perdono il padding esterno.

**RESTA**
- **Tutti e tre gli strumenti tipografici**: sampler con slider, tester ad assi variabili, visore glifi su canvas. Nessuno viene degradato a immagine. Su un sito di caratteri e' la decisione giusta e costosa.
- Il caricamento lazy dei font per scheda, quindi il consumo dati e' proporzionale a quanto scrolli, non alla lunghezza della pagina.
- La sostituzione del font di pagina col font venduto.
- La parallasse (nessun `prefers-reduced-motion` la disattiva: il file CSS contiene **una sola** occorrenza di `prefers-reduced-motion` in tutto il bundle).
- Il carrello e il flusso di licenza per intero.

Le dimensioni tipografiche essendo fisse (`clamp` con `0vw`), su telefono si legge lo stesso corpo del desktop con piu' righe: la scala non si comprime, si allunga la pagina.

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| E-commerce | **Shopify** | VERIFICATO | header `set-cookie: _shopify_essential`, `cart_currency`, `shopify-complex-…`, asset sotto `/cdn/shop/t/52/` |
| Tema | tema custom, non Dawn (ma con residui Dawn) | VERIFICATO | breakpoint 750px e variabili `--font-body-scale`, `--focused-base-outline` tipiche di Dawn, dentro un CSS per il resto originale |
| Build | **Vite** | VERIFICATO | nomi `index-hF3E6oxz.js` / `index-DDGOTtS_.css` (hash Vite), CSS e JS singoli e minificati |
| Framework JS | **Alpine.js** | VERIFICATO | `window.Alpine`, `Alpine.start()`, 25 componenti registrati con `Alpine.data(...)`, direttive `x-data`/`x-show`/`x-intersect` nel markup servito |
| Plugin Alpine | `intersect`, `persist`, `focus`, `trap` | VERIFICATO | `x-intersect.once.margin.-50px`, `$persist(...)`, `$focus.wrap().next()`, `x-trap.noscroll.inert` |
| Animazione | **CSS puro** (transition + keyframes + custom properties) | VERIFICATO | nessun motore JS di tween nel bundle |
| Scroll | **nativo**, nessuno smooth scroll | VERIFICATO | 0 occorrenze di `lenis`/`locomotive`/`ScrollTrigger`; `scrollIntoView({behavior:'smooth'})` per le ancore; `animation-timeline: view()` per lo scroll-driven della 404 |
| Tipografia runtime | **opentype.js** + **CSS Font Loading API** (`FontFace`, `document.fonts.add`) | VERIFICATO | `font.tables.fvar`, `font.tables.os2`, `glyph.getPath(...).draw(ctx)`; costruttore `FontFace` con ArrayBuffer |
| Fallback font loader | **Web Font Loader** (Typekit) | VERIFICATO | `load({custom:{families:[...]}, fontactive, fontinactive, timeout:6000})` |
| Carousel / lightbox | **Swiper** (moduli Keyboard + Navigation) | VERIFICATO | 105 occorrenze, `new xl(container,{modules:[Tl,Sl], keyboard:true, navigation:{...}})` |
| Opzioni di prodotto | **Itoris Dynamic Product Options** | VERIFICATO | selettori `#itoris_dynamicproductoptions`, `.dpo-container`, classi `ppv3-checkbox`/`ppv3-dropdown` |
| Abbonamenti | **Appstle** | VERIFICATO | metodo `bindAppstleRadios()`, input `name='selling_plan'` |
| Email marketing | **Brevo / Sendinblue** | VERIFICATO | `sibforms.com/forms/end-form/build/sib-styles.css`, submit su `5034716a.sibforms.com/serve/...` |
| CDN / edge | **Cloudflare** davanti a Shopify CDN | VERIFICATO | `cf-cache-status: DYNAMIC`, `Report-To: cf-nel`, e un challenge `Verifying your connection...` quando ho insistito |
| Immagini | Shopify Image CDN, `srcset` + `width=` | VERIFICATO | 35 `srcset`, 209 parametri `width=`, formati jpg/webp/png/svg, `loading="lazy"` su 33 img su 37, `fetchpriority` presente 23 volte |
| Video | un solo `<video>` mp4 in home | VERIFICATO | conteggio sul markup |
| 3D | nessuno | VERIFICATO | 0 occorrenze di three/webgl/canvas 3D; l'unico canvas e' 2D per i glifi |
| Stack della versione premiata 2021 | **Locomotive Scroll** + Shopify | VERIFICATO (per la vecchia versione) | dichiarato da Awwwards; **oggi non c'e' piu'** |

## Peso e prestazioni

Misurato con `curl` il 13/08/2026 (non ho potuto eseguire Lighthouse: l'API PageSpeed ha risposto 429 senza chiave, e non ho aperto browser).

| risorsa | non compresso | gzip | note |
|---|---|---|---|
| HTML home | 251 158 B | non misurabile | il tentativo di misurare il gzip ha innescato il challenge Cloudflare |
| HTML prodotto Neue Montreal | 383 029 B | non misurabile | pagina lunghissima, tutta server-rendered |
| HTML collection | 310 341 B | — | |
| CSS unico | 156 008 B | **27 048 B** | un solo file per tutto il sito |
| JS unico | 488 082 B | **141 304 B** | un solo bundle, tutto incluso |
| Font di interfaccia PPNeueMontreal-Variable.woff2 | **319 188 B** | (gia' compresso) | `cache-control: public, max-age=31557600` — un anno |
| Font campione statico (es. PPPaloma-FizzyHeavy) | ~35 900 B | | caricato on-intersect |
| Font campione statico (es. PPNeueGstaad-Semibold) | ~44 300 B | | |
| Font campione variabile (es. PPPalma-FizzyVariable) | ~66 400 B | | |
| Font campione variabile (es. PPNeueYork-NormalVariable) | ~94 100 B | | |

**Stima del costo tipografico della home**: 27 riferimenti distinti in `data-font-src`. A scroll completo, con la media dei campioni misurati (~60 KB), sono **circa 1.5 MB di soli font**, piu' i 319 KB dell'interfaccia. Ma il caricamento e' rigorosamente pigro e deduplicato: chi apre la home e non scorre paga solo l'interfaccia.

**TTFB misurati**: home 0.51–1.11s, prodotto 0.79–0.91s, asset CDN 0.82–1.22s.

Il punteggio WPO di Awwwards sulla vecchia versione era **7.00/10** — il piu' basso della scheda, e coerente con questo modello: un sito che deve scaricare decine di font veri non sara' mai leggero, e hanno scelto la fedelta' invece della velocita'. `font-display: block` sull'interfaccia e' la conferma: preferiscono una pagina bianca a una pagina composta nel font sbagliato.

## Tre cose da rubare

**1. Il prodotto veste l'interfaccia, e l'interfaccia aspetta il prodotto.**
Meccanica completa e rifacibile: (a) definisci tutto il testo che deve cambiare con una sola classe utility che legge da custom properties (`--pagefont-family` e compagnia); (b) carica l'asset del prodotto in JS e iniettalo riscrivendo un unico `<style id="...">`; (c) emetti un evento custom, aggiungi una classe al `<body>`, e tieni quegli elementi a `opacity:0` finche' l'evento non arriva. Vale per un font, ma anche per una palette di un prodotto, un materiale, un tema di un cliente. Il valore non e' il caricamento: e' aver **legato la comparsa del contenuto allo stato dell'asset**, cosi' non si vede mai la versione sbagliata.
E il dettaglio che fa la differenza: `font-synthesis: none`. Non lasciare mai che il browser falsifichi cio' che stai vendendo.

**2. Il controllo si dimostra da solo, e si arrende al primo tocco.**
Il tester variabile parte in movimento (`requestAnimationFrame`, oscillazione coseno, **durata random 5–8s per ogni asse** cosi' non vanno mai in fase) e si ferma nell'istante in cui l'utente muove uno slider. Chi non sa cosa sia un font variabile lo capisce senza leggere niente; chi lo sa prende il comando. Costa venti righe. Applicabile a ogni configuratore: fallo animare finche' nessuno lo tocca.
Corollario ancora piu' economico: la dimostrazione delle feature OpenType e' **solo CSS** — due span sovrapposti, `@keyframes fades` con `animation-direction` invertita su uno dei due. Zero JS per mostrare un prima/dopo che si alterna.

**3. Il campione si misura, non si indovina.**
Tre tecniche di dimensionamento che non usano il viewport:
- `fontCoverSize`: clona il testo, lo rende invisibile in posizione assoluta, ne misura la larghezza reale con `getBoundingClientRect()`, e scrive `font-size: calc(1em * var(--font-cover-size-ratio))` per farlo combaciare esattamente con il contenitore. Riesegue su `ResizeObserver` con debounce 100ms. E' l'unico modo onesto di fare un titolo a piena larghezza con un carattere che non conosci in anticipo.
- **`cqw` invece di `vw`** per il corpo del sampler: il campione e' proporzionale al suo riquadro, non alla finestra, quindi lo stesso componente funziona in colonna larga e in colonna stretta senza media query.
- **`font-size-adjust` per famiglia**, servito dal CMS: normalizza l'altezza della x cosi' caratteri diversi affiancati hanno lo stesso peso ottico. E' la differenza fra una griglia di campioni che sembra progettata e una che sembra un elenco.

## Non verificato

- **Il sito premiato nel 2021 non l'ho visto.** Ho letto la versione live di oggi, che e' un rifacimento successivo: Awwwards accredita Locomotive Scroll, il bundle attuale non ne ha traccia. Tutte le meccaniche descritte qui sono della versione 2026. Non ho consultato Wayback Machine.
- **Nessun browser aperto** (vincolo del compito): non ho screenshot, non ho verificato con gli occhi la resa di nessuna animazione, il comportamento reale del menu, l'ordine visivo dei blocchi in viewport, ne' come si comportano gli strumenti su un touch reale. Tutto quanto descritto e' dedotto da CSS, JS e markup serviti.
- **Nessuna misura Lighthouse / Core Web Vitals**: l'API PageSpeed ha risposto 429 e non avevo chiave. LCP, CLS e INP reali sono ignoti. Il rischio di CLS sul cambio di font di pagina e' plausibile ma non misurato.
- **Peso totale reale di una pagina** (numero di richieste, transfer totale): non misurabile senza browser. Le cifre riportate sono per-risorsa.
- **Compressione dell'HTML**: non misurata; il tentativo ha fatto scattare il challenge Cloudflare.
- **Prezzi effettivi delle licenze**: il selettore e' costruito lato client da Itoris, quindi nell'HTML servito non compaiono ne' gli scaglioni ne' le cifre. Ho verificato solo l'ancora dichiarata (`start at $40`) e le **unita'** su cui scala ogni licenza (dalla FAQ). Non conosco i moltiplicatori.
- **Il microsite Neue Montreal** (`Experience the microsite`) non l'ho aperto: e' probabilmente un'esperienza a se' con uno stack diverso.
- **La versione francese** del sito non e' stata controllata.
- **`data-font-size-adjust`**: ho verificato il meccanismo nel codice, non ho campionato quali valori il CMS assegni realmente ai singoli caratteri.
- Le pagine `Font Starter Pack`, `TypeTrials®`, `Off Type Foundry`, `Academy` e `Font in use` non sono state analizzate, solo rilevate come voci di menu.

---

**Verifica finale**: nessuna scheda di browser aperta durante questa ricerca. Tutto fatto con `curl`, `WebFetch` e `WebSearch`.
