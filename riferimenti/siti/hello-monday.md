# Hello Monday

- **URL**: https://www.hellomonday.com
- **Premio**: Awwwards **Site of the Day il 07/10/2019**, punteggio 7.85/10 (Design 7.88 / Usability 7.75 / Creativity 7.89 / Content 7.98; Development 7.58). Il profilo studio conta 9 SOTD, 2 SOTM, 2 SOTY, 53 Honorable Mention. Fonti: https://www.awwwards.com/sites/hello-monday e https://www.awwwards.com/hellomonday/
- **Studio**: Hello Monday (New York, Copenhagen, Aarhus, Amsterdam). Dal 2021 fa parte di Dept.
- **Anno**: impianto del 2019 (data del premio), ma **manutenuto**: i case piu' recenti in griglia sono del 2024 (Google Gemini) e la libreria WebGL a bordo e' PixiJS v8, uscito nel 2024. Non ho trovato una data di ultimo deploy dichiarata.
- **Letto il**: 13/08/2026

---

## L'ESPERIENZA (integrazione)

*Aggiunta del 13/08/2026. Letta con `curl` su `/`, `/services`, `/product`,
`/about` e `/work/nat-geo`. Nessun browser aperto.*

### Di cosa tratta il sito

Un **catalogo di 34 lavori** e nient'altro. Non c'e' una pagina che spieghi come
si lavora con loro, non c'e' un processo, non c'e' un modulo, non c'e' un
prezzo. C'e' una griglia da rompere col dito e quattro indirizzi email in fondo.

### Cosa vende, e qual e' l'obiettivo finale

Vende **il permesso di essere considerati fra i tre studi al mondo a cui affidare
una cosa che nessuno sa fare.** Il prodotto e' l'invenzione del meccanismo, e il
sito e' la fattura di quel meccanismo.

L'obiettivo dichiarato e' commerciale. L'obiettivo **vero e' doppio, e la seconda
meta' e' scritta in chiaro nel piede**: delle quattro chiamate all'azione del
sito, **due sono per candidarsi** (`Want to join us? / Become a Mondayteer` e
`Want to learn? / Become an intern`). Un sito costruito per far arrivare
richieste di lavoro tanto quanto richieste di preventivo. La terza (`Want to say
hi?`) non chiede niente. Solo la prima (`Want to collaborate? / Work with us /
newbusiness@hellomonday.com`) vende.

### A chi

A chi ha gia' un budget approvato e sta scegliendo il fornitore. Non a chi deve
capire quanto costa: **la parola "budget" non compare in nessuna pagina del
sito.** Il compratore-tipo e' un brand o product lead di Google, Netflix,
Strava, T-Mobile, LEGO, Meta — cioe' gente che non chiede il listino.

### L'esperienza progettata, passo per passo

E' **un gioco, non una visita**. La struttura e' volutamente povera perche' la
ricchezza sta nel gesto.

1. **1 secondo** — pannello nero, una frase. Il tono prima del contenuto.
2. **Schermata 1** — l'eroe: un'animazione a mano, `We make digital (and
   magical)…`, una parola che ruota (`Branding` / `Experiences` / `Products`) e
   `4 days until Monday`. **Nessun pulsante, nessun menu visibile, nessun
   invito.** Il menu si chiama con una protuberanza sul bordo destro dello
   schermo: bisogna scoprirlo.
3. **Schermate 2-14** — la griglia. Qui il visitatore **deve fare una cosa
   precisa**: avvicinare il puntatore a una miniatura finche' la membrana non
   scoppia. Solo allora parte il video. Il sito **fa ripetere quel gesto 34
   volte**: la memoria non e' di un progetto, e' del gesto.
4. **Schermata ~15** — l'unico blocco di vendita esplicito della home: `A booster
   rocket for digital product teams`, con `Discover more` verso `/product`.
5. **Schermate 15-16** — il piede, che e' l'unica pagina contatti che esiste.

### Cosa deve fare il visitatore, e dove lo portano

**Copiare un indirizzo email.** Letteralmente: le mail nel piede al clic si
copiano negli appunti e il titolo cambia in `E-mail copied to clipboard`. Non
c'e' un modulo, non c'e' una pagina `/contact`, non c'e' un calendario, non c'e'
un campo budget. Il percorso completo e': home -> (eventuale) case study ->
piede -> mailto.

La sola pagina che vende come vendono le altre agenzie e' **`/product`**, ed e'
fuori dalla navigazione principale della griglia. Li' c'e', in ordine: la
promessa (`A booster rocket for digital product teams`), la storia di
legittimazione (*"Our journey into digital product innovation started 10 years
ago, when we helped Google improve the Hangouts experience – now Meet"*), 11
loghi ciascuno con **il numero di progetti fatti insieme** (`24 projects Google`,
`11 projects YouTube`, `3 projects META`…), 4 testimonianze nominali, e una
chiusura con **una persona vera**:

> `Ready to Collaborate?` / `We're always happy to make new friends, so please
> don't hesitate with reaching out:` / `product@hellomonday.com` /
> `Andreas Anderskou` / `Managing Partner and Head of Products` /
> `andreas@hellomonday.com`

E' l'unico punto di tutto il sito dove qualcuno mette la faccia.

### Come e' organizzata la persuasione

| pezzo | dove | in quante schermate |
|---|---|---|
| **promessa** | `We make digital (and magical)…` | schermata 1 |
| **prova** | 34 lavori, ma solo come miniature da rompere | 2-14 |
| **prova di autorita'** | `Shiny Things` — **solo su `/services`** | fuori home |
| **prova di parola** | 4 testimonianze — **solo su `/product`** | fuori home |
| **prezzo** | **inesistente in tutto il sito** | — |
| **chiamata all'azione** | `Discover more` (~15), piede (~16) | 15-16 |

**Il prezzo, come lo evitano.** Non lo evitano con una frase: lo **sostituiscono
con un conteggio**. La pagina `/services` chiude con un blocco intitolato
`We Got Shiny Things`, preceduto dall'unica riga in cui ammettono di volerlo
usare come argomento: *"We're supposed to say we're humbled, but we're actually
proud when we win awards. They're not a perfect measure of creativity (it's about
happy users, not happy judges) but they're a sign we're doing something right."*
Poi i numeri, secchi: `Cannes Lion 8` · `Webby Awards 14` · `D&AD 5` ·
`Creative Circle Awards 48` · `Eurobest awards 2` · `Awwwards 58` ·
`FWA SOTD / FWA Hall of Fame 121`. **Al posto della fascia di prezzo mettono la
fascia di riconoscimento.** Chi vede quei numeri sa gia' di non essere il
cliente giusto, se non ha budget.

**Cosa arriva a chi non scorre.** Molto poco, ed e' una scelta pagata cara. La
prima schermata dice solo il tono: un disegno animato, `We make digital (and
magical)…`, una parola che ruota e una battuta sul lunedi'. **Nessun logo
cliente, nessun premio, nessun servizio, nessun invito, nessun menu visibile.**
Chi si ferma li' esce sapendo che e' uno studio simpatico, non che ha fatto
prodotti per Google per dieci anni. E' il sito piu' costoso da attraversare dei
cinque: il valore si guadagna alla decima schermata o non si guadagna.

### Come mostrano i casi studio

E' il modello opposto a Cuberto: **raccontano il processo, non il risultato**.
`/work/nat-geo` e' diviso in capitoli navigabili (`In depth: 01 Concept · 02
Loader · 03 Hand drawn illustrations`) in cui mostrano **anche gli scarti** —
*"we felt that original the style tryouts were too refined and 'curated'"* — e
arrivano a spiegare quante illustrazioni sono servite per animare un orso (*"We
decided on 4 key poses and to apply two inbetweens maximum, leaving us with 10
drawings to sequence"*). In fondo: `Type / Client / Deliverables`, poi
`Project awarded:` con l'elenco per ente (Webby, One Show, Creative Circle,
Awwwards SOTM+SOTD, The FWA), poi tre progetti affini, poi il piede.

**Nessun numero di business, nessuna citazione del cliente, nessuna CTA di
contatto in fondo al caso studio.** Il caso studio non chiede niente: dimostra
artigianato e passa la palla.

### La pagina servizi

Esiste, si chiama `/services`, e non elenca servizi: elenca **quattro
appartenenze** — `Products`, `Experiences`, `Branding`, `Shiny Things`. Ogni
blocco e' un paragrafo scritto in prima persona plurale piu' **due case study di
esempio** e un link `View Digital Products` / `View Digital Experiences` /
`View Branding` che riporta alla griglia filtrata. Niente elenchi puntati di
deliverable, niente processo, niente fasi, niente prezzi. Anche la pagina
servizi, in pratica, e' un modo per rimandare al portfolio.

### Testi veri (integrazione)

**Services** — `What we do` / `We build better businesses by creating joyful
digital ideas, products and experiences that connect the hearts of brands to the
hearts of humans.`

**Products** — `We make better products and make products better. […] Our
approach was agile before they called it agile […] Over the past couple of years,
we've dived deep into machine learning and AI, but always with one question in
mind: how does it make life better for humans?`

**Branding** — `Brands are ideas that keep growing. We think of them like machine
learning. […] But ultimately the brand creates itself – in the minds and hearts
of the audience.`

**Product, testimonianze** — `"Working with Hello Monday is like strapping a
rocket booster to our brains. It's a way more than just great design" — Mike
Cleron, Director at Google` · `"Hello Monday is this nice and cute-looking design
agency that turns out to be a wonder weapon when you need to wake up your
organization with a radical idea." — Philipp Thesen, Senior VP of Design,
Deutsche Telekom AG`

**About** — `HELLO MONDAY/DEPT® is a creative studio that makes digital (and
magical) ideas, products and experiences. We're called Hello Monday because we
aim to make Mondays better.` — piu' il `Code of Honor` in 8 punti
(`01 Be nice`, `02 Use our powers for good`, `03 Try the truth`, `04 Enjoy the
ride`, `05 Speak up and listen`, `06 Solve the problem`, `07 Help each other`,
`08 Team up`) e la lista nominale dei `Mondayteers` con la citta' di ciascuno.

---

## Cosa vende

Il lavoro di uno studio digitale che fa branding, prodotti e "experiences" per Google, Netflix, Strava, Bang & Olufsen, Lyft, Greenpeace. Non vende una skill: vende **34 case study** messi in fila e la prova che sa costruire cose che nessun altro costruisce.

La seconda cosa che vende, esplicitamente, e' il reparto prodotto: `A booster rocket for digital product teams` — consulenza continuativa a startup e product department.

## A chi

Marketing/brand lead e product lead di grandi aziende tech, piu' chi cerca lavoro (due delle quattro chiamate all'azione del piede sono per candidarsi). Uscendo deve pensare: *questi non montano template, questi inventano il meccanismo*. Il sito e' la dimostrazione, non la descrizione.

## Idea regista

**Il sito e' il portfolio**: ogni miniatura e' un giocattolo fisico da rompere col puntatore prima che ti lasci vedere il video, e la home ti fa fare quel gesto 34 volte.

## Il momento

Sta nella griglia, non nell'apertura. Ogni miniatura ha il bordo **elastico**: quando avvicini il puntatore, i punti del contorno piu' vicini vengono risucchiati verso il cursore e l'immagine si deforma come una membrana. Se insisti oltre la soglia, la membrana **scoppia** con un rimbalzo (wobble di 70px avanti e indietro in 0.2s, `yoyo:true`), il cursore di sistema sparisce (`cursor:none`) e al suo posto compare un **occhio disegnato** che si apre nella direzione da cui sei entrato; nello stesso istante parte il video del progetto.

Numeri veri della meccanica (dal bundle JS):
- soglia di attrazione: `_distanceThreshold = 125` px, smorzamento `_forceDampening = .2` (`.3` sugli angoli)
- soglia di aggancio: `_mouseSnapThreshold = 80` px
- il contorno e' una **CompoundPath di Paper.js** con 12 / 15 / 18 segmenti a seconda del formato della miniatura, ridisegnata a ogni frame con `smooth({type:"catmull-rom"})` su un canvas fuori schermo e usata come texture di una sprite PixiJS
- c'e' persino un suono pronto per l'aggancio: `/assets/audio/stick.mp3` (11.410 byte), istanziato per ogni segmento

Non e' legato allo scroll. E' legato al puntatore, ed esiste **solo su desktop non-touch**.

## Struttura, sezione per sezione

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |
|---|---|---|---|
| `.Intro` (preloader) | pannello nero a tutto schermo, una frase bianca in Clarendon 21px | aspetta | ~1 s, non scrollabile |
| `HeroModule` | animazione 2D disegnata a mano in loop, occhiello, una parola che ruota, contatore "days until Monday" | guarda, scrolla | 1 schermata (`height:100vh`, `max-height:667px` base / `900px` da 768px) |
| `CaseGridModule` | 34 progetti in masonry a 3 colonne, renderizzato in WebGL | passa sopra le miniature, filtra per tag, clicca | la parte lunga: ~10-14 schermate (non misurata, vedi Peso) |
| `.all` | un solo link `View all projects` | clicca | 1 riga |
| `DeepDiveSplashModule` | pannello scuro `#191919`, titolo 90px, video 16:9, corpo, CTA | clicca `Discover more` → `/product` | ~1 schermata |
| `Footer` | 4 sezioni a fisarmonica (contatti/lavoro), 4 uffici, privacy, social, "Back to top" | apre le fisarmoniche, copia le email | ~1.5 schermate |

Non c'e' un menu visibile a riposo. Sopra 1025px e non-touch il menu si chiama con una **protuberanza sul bordo destro** (vedi Animazioni); sotto, con un hamburger fisso in alto a destra.

## L'esperienza in ordine di tempo

**Primi dieci secondi (desktop, 1440px)**

- **0.0 s** — l'HTML arriva gia' scritto dal server (226 KB, 109 KB compressi). Il `<body>` ha `data-intro="true"`. Sopra tutto c'e' `.Intro`: pannello **nero pieno** a tutto schermo con una sola frase bianca centrata in Clarendon 21px. `#SiteWrapper` va da opacita' 0 a 1 in **0.3 s**. In parallelo `PAGE_WIPE` prende uno "snapshot" grande quanto la finestra nel colore del menu (`#000000`).
- **0.3 s** — `.Intro` sfuma a 0 in 0.3 s e parte il sipario: `reverseWipe("right")`. E' un path di Paper.js i cui ~13 punti vengono tweenati verso il bordo destro, ognuno con un ritardo casuale fra 0 e 0.1 s, durata **0.5 s**, poi lisciato Catmull-Rom. Il nero non scorre via dritto: **si stacca con un bordo che ondeggia**.
- **~0.9 s** — il sipario e' finito. Ma il sito parte solo quando sono veri *entrambi*: sipario finito **e** asset caricati. Gli asset sono, in quest'ordine: i 3 web font, poi 9 spritesheet/PNG (`face_all.json`, `dot2.json`, `play-pause.json`, `scroll-dot.json`, `behind_eye.json`, `menu_blob_init.json`, `menu_blob_init_black.json`, `circle.png`, `trail.png`).
- **~1 s** — compare il logo (parte da `opacity:0`), il layer dei template e il footer passano a `display:block`.
- **1-2.5 s** — nell'eroe c'e' prima un PNG segnaposto (`/assets/images/landing/hm-hero-desktop.png`, 57 KB). Dopo un `delayedCall(1.5)` il video e' autorizzato; parte `hm-hero-desktop.mp4` (**10,3 MB**, o 9,5 MB nella variante non-retina) e il PNG viene nascosto.
- **da subito, in loop** — sotto il video: l'occhiello `We make digital (and magical)…` in NB International Pro Regular 14px, e sotto la parola grande in Clarendon 80px che **cambia da sola**: `Branding` → `Experiences` → `Products`. Non c'e' un timer: il cambio e' agganciato alla fine di ogni giro dell'animazione a spritesheet del pallino di scroll (43 fotogrammi, `animationSpeed 1.5`). Uscita 0.2 s (opacita' 0, `y:+10`), entrata 0.2 s (da `y:-10`).
- **in alto a destra** — un'icona calendario e la scritta **`4 days until Monday`**. Le sette varianti sono scritte in chiaro nel codice: `["1 day until Monday","It's Monday today!","6 days until Monday","5 days until Monday","4 days until Monday","3 days until Monday","2 days until Monday"]`, indicizzate con `new Date().getDay()`; delle 7 SVG del calendario ne viene mostrata una sola. Verificato a schermo il 13/08/2026, un giovedi': diceva `4 days until Monday`.

**Il resto, a blocchi**

1. **Lo scroll non e' lo scroll del browser.** Su desktop `document.body.style.overflow = "hidden"`, l'evento `wheel` viene bloccato con `preventDefault()`, il delta viene **dimezzato** (`* .5`), messo in un tween GSAP di **0.3 s** e solo alla fine applicato con `window.scrollTo(0, position)`. Risultato: inerzia lunga e velocita' dimezzata rispetto al sistema. Su touch invece torna lo scroll nativo (`overflowY:scroll` + listener `scroll`). Tastiera: Spazio = -200px, frecce = ±40px, e **il Tab viene intercettato e annullato** (`preventDefault`) — e' un problema di accessibilita', non un effetto.
2. **La griglia.** 3 colonne, 34 voci, riempite bilanciando l'altezza: ogni voce vale 1 se orizzontale, 2 se verticale, e la colonna successiva viene scelta confrontando i totali. **Il formato di 27 voci su 34 e' `Random`**: a ogni caricamento `Math.random() > .5` decide se quel progetto e' orizzontale (base 276px) o verticale (base 647px). La home non ha due volte lo stesso impaginato.
3. **Al passaggio sopra una miniatura** (desktop): compare un pallino accanto al titolo (0.4 s, ritardo 0.2 s), il bordo si deforma, e viene attaccato **un unico elemento `<video>` condiviso** per tutto il sito, riusato di miniatura in miniatura. Quando il video e' pronto (`canplaythrough`) la sprite dell'immagine sfuma a 0 in 0.5 s e resta il video.
4. **I tag sotto ogni titolo sono il filtro.** Al passaggio il tag va da `#c6c5c5` a `#000` in 0.1 s e sopra compare la scritta `Filter by`. Al clic **non c'e' un riordino animato**: parte una tendina Paper.js dal basso, sotto la tendina la griglia viene svuotata e ricomposta (prima i progetti che passano il filtro, poi gli altri al 10% di opacita'), la pagina viene riportata in posizione, e dopo 0.2 s la tendina si ritira verso il basso. Filtri esistenti: `Branding`, `Experiences`, `Platform`, `Products`, `E-commerce`.
5. **Il pannello scuro** con `A booster rocket for digital product teams` a 90px, con un video Contentful in loop muto sotto il titolo.
6. **Il piede** e' chiaro (`#f8f6f5`): quattro sezioni che si aprono a fisarmonica, quattro indirizzi, e le email che **al clic si copiano negli appunti** cambiando il titolo in `E-mail copied to clipboard`, con una GIF di conferma incorporata in base64 nel bundle.

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| Sipario di apertura / cambio pagina / cambio filtro | un path chiuso di Paper.js che invade o libera lo schermo | stato (navigazione) | tween 0.5 s per punto, ritardo casuale 0-0.1 s per punto, poi `smooth({type:"catmull-rom"})` | il colore di riempimento e' quello del case cliccato (`data-splash-color`); il default nel codice e' `#83C58F` |
| Bordo delle miniature | 12/15/18 segmenti di una CompoundPath risucchiati verso il puntatore, poi rimbalzo | posizione del mouse | attrazione proporzionale entro 125px, smorzamento 0.2; rimbalzo 70px `yoyo` in 0.2 s `easeInOut` | Paper.js che disegna la maschera, PixiJS che la usa come texture |
| Cursore dentro una miniatura | un occhio/faccia animata a spritesheet | ingresso del mouse + lato da cui entra | `animationSpeed .4`, non in loop | spritesheet `face_all.json`, 127 fotogrammi, 7 animazioni: `AdultToBaby`, `BabyToTeen`, `TeenToAdult`, `LtoR`, `RtoL`, `DownUp`, `UpDown`. La mappa lato→animazione e' `[6,4,5,3]` |
| Parola dell'eroe | `Branding`/`Experiences`/`Products` | fine di ogni giro dell'animazione del pallino di scroll | 0.2 s fuori (`y:+10`), 0.2 s dentro (da `y:-10`) | non e' un `setInterval`: e' il ritmo dell'animazione a dettare il testo |
| Video dell'eroe | animazione 2D in loop | tempo (video) | 24 fps, 37,96 s | 950x660, h264 |
| Scroll di pagina | tutto il documento | ruota/tastiera | tween GSAP 0.3 s con `overwrite:true`, delta dimezzato | scroll riscritto, non una libreria nota (niente Lenis, niente Locomotive) |
| Menu, bordo destro | una protuberanza SVG che gonfia dal bordo destro dello schermo quando il puntatore si avvicina | posizione del mouse | tween 0.3 s sulla percentuale, path ricalcolato a ogni update | `_maxSpread = 300`, `size = 60`; attivo solo se **non** touch |
| Menu aperto | pannello nero, voci in Clarendon bianca 60px, ognuna con un pallino animato a spritesheet | stato | — | `menu_blob_init.json`, velocita' 0.25 |
| Pannello "Behind the scenes" (pagine case) | il pannello entra da destra 0.5 s e **spinge il contenuto di -200px** | clic | `easeInOut`, velo al 40% | |
| Favicon | alterna due PNG in base64 | `setInterval(500 ms)` | — | disattivata su Safari; e' una favicon che sbatte le palpebre |
| Miniature all'ingresso in viewport | l'immagine sale di 100px e appare | `IntersectionObserver` con `rootMargin:"200px"` | — | |

Librerie riconosciute dietro gli effetti: **GSAP 1.9.2** (`TweenLite`/`TweenMax`/`TimelineMax`, quindi la versione 2.x, non la 3), **Paper.js** per tutta la geometria elastica, **PixiJS v8** per il rendering della griglia. Niente ScrollTrigger, niente Lenis, niente Three.js, niente Lottie (le animazioni "tipo Lottie" sono spritesheet PNG + JSON di PixiJS).

## Colori

| ruolo | esadecimale | dove si usa |
|---|---|---|
| Fondo pagina, fondo eroe | `#ffffff` | `.HeroModule`, `.CaseGridModule` (`data-color="#ffffff"`) |
| Testo, titoli, linee dell'hamburger | `#000000` | testo corrente, `h1-h5`, bordo inferiore dei link |
| Fondo del preloader | `#000000` | `.Intro` a tutto schermo; e' anche `MENU_COLOR` |
| Superficie chiara | `#f8f6f5` | fondo del `Footer`, fondo dei segnaposto delle miniature |
| Superficie scura | `#191919` | pannello interno di `DeepDiveSplashModule` |
| Grigio dei tag a riposo | `#c6c5c5` | `.tag` prima del passaggio del mouse (poi `#000`) |
| Grigio dei numeri a riposo | `#b9b9b9` | id delle voci del "Code of Honor" (poi `#000`) |
| Bordi e divisori | `#cacaca` | `border-top` delle sezioni del piede, `.divider` |
| Testo secondario scuro | `#2c2d2e` | nomi delle citta' negli uffici |
| Bordo delle miniature | `#ffffff` | `border:1px solid #fff` sull'`imageContainer` |
| Verde del sipario (default) | `#83c58f` | riempimento iniziale del path di `PageWipe`, quasi sempre sovrascritto |

Tutti letti dal CSS, nessuno stimato da screenshot.

**Colori portati dai contenuti**: ogni case ha il suo `data-color`/`data-splash-color`, usato per il fondo della miniatura e per il colore del sipario quando ci clicchi sopra. Esempi reali: Fingerspelling `#623DF5`, Universal Music `#D5D500`, Star Atlas `#18235D`, Lyft `#EB503F`, EPOS `#00242A`, Bearaby `#272949`, Aurora Solar `#FEC351`, The Web Can Do What `#1FB254`.

## Tipografia

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| Titolo eroe | ClarendonBTWXX-Light | 300 | 40px base → **80px** da 1025px | `.8` | e' la parola che ruota |
| Occhiello eroe | NB International Pro Regular | 400 | 14px | 1.57 | centrato |
| Contatore "Monday" | NB International Pro Regular | 400 | 13px | 1.54 | `white-space:nowrap` |
| Titolo di un case in griglia | ClarendonBTWXX-Light (via `h3`) | 300 | 15px base → **23px** da 768px | 1.24 → 1.09 | `max-width:400px` su mobile |
| Tag / filtro | NB International Pro Regular | 400 | 14px (separatore 13px) | 1.43 | |
| Titolo del pannello scuro | ClarendonBTWXX-Light | 400 | 36 → 50 → 63 → **90px** | 34 → 47 → 59 → 84px | quattro scaglioni |
| Corpo del pannello scuro | NB International Pro Light | 400 | 15px → 19px | 139% | `max-width` 520 → 600px |
| Voci di menu | ClarendonBTWXX-Light | 300 | 35px centrate → **60px** allineate a sinistra (52px se la finestra e' bassa) | — | bianche su nero, `letter-spacing:.3px` |
| Email nel piede | ClarendonBTWXX-Light | 300 | 18px | 1.39 | |
| Testo corrente del piede | NB International Pro Regular | — | 14px | 1.43-1.57 | spesso a `opacity:.5` |
| Testo del preloader | ClarendonBTWXX-Light | 300 | 21px | 1.43 | bianco su nero |
| `p`, `li` di default | NB International Pro Regular | — | 12px | 1.29 | |

**Come sono serviti i font**: tutti **auto-ospitati** su `/assets/fonts/`, in quattro formati (`.eot`, `.woff2`, `.woff`, `.ttf`) — l'`.eot` tradisce l'eta' dell'impianto. Nessun servizio esterno, nessun `@import`, nessun font variabile. Pesi in `woff2`: Clarendon 30.320 B, NB Regular 40.104 B, NB Light 40.484 B. Il nome file `383D05_0_0` e' la nomenclatura di un kit MyFonts. Il caricamento **blocca l'avvio**: `initSite()` parte solo dopo che un FontLoader interno ha confermato le tre famiglie. Fallback dichiarato in `body`: `Georgia, Times New Roman, Times, serif`.

## Testi veri

**Preloader**
> We creates joyful digital ideas, products, brand identities and experiences that connect the hearts of brands to the hearts of their audiences.

(l'errore grammaticale "We creates" e' nel sorgente.)

**Eroe**
> We make digital (and magical)…
> Branding / Experiences / Products

**Contatore**
> 4 days until Monday
> It's Monday today!

**Menu**
> Work · Services · About · Stories · Product
> Facebook · Instagram · Twitter

**Griglia** (i primi titoli, testuali)
> Google - Gemini Developer Competition
> Bang & Olufsen - See yourself in Sound…
> Filter by
> View all projects

**Pannello prodotto**
> A booster
> rocket for digital
> product teams
>
> We collaborate with startups and product departments around the world to invent and reinvent the products of tomorrow.
>
> Discover more

**Piede**
> Want to collaborate? / Work with us / newbusiness@hellomonday.com
> Want to say hi? / General inquiries / hello@hellomonday.com
> Want to join us? / Become a Mondayteer / Apply here
> Want to learn? / Become an intern / Apply here
> View on maps
> New York — 36 East 20th St, 6th Floor, New York, NY 10003 — Tel: +1 917 818-4282
> Copenhagen — Langebrogade 6E, 2nd floor, 1411 Copenhagen — Tel: +45 3145 6035
> Aarhus — Banegardspladsen 20A, 1.TV, 8000 Aarhus C — Tel: +45 6015 4515
> Amsterdam — Generaal Vetterstraat 66, 1059 BW Amsterdam, Netherlands
> Global Privacy Statement
> Back to top
> E-mail copied to clipboard

**Meta description**
> Hello Monday is a creative studio in New York, Copenhagen, and Aarhus that handcrafts digital (and magical) products, brands, and experiences.

## Mobile

Questa e' la parte che conta: **sul telefono e' un altro sito**, e la linea di taglio non e' la larghezza, e' `IS_TOUCH_DEVICE` (`"ontouchstart" in window`). Al boot il codice aggiunge la classe `touch` al `<body>` e da li' cambia tutto. Un desktop stretto e un tablet largo si comportano in modo diverso a parita' di pixel.

**Cosa SPARISCE**
- **Tutto il livello WebGL.** `_rendering = !IS_TOUCH_DEVICE`. La griglia non viene piu' renderizzata in PixiJS.
- **Con esso sparisce il momento**: niente bordo elastico, niente scoppio, niente cursore-occhio, niente `stick.mp3`. Sul telefono le miniature sono rettangoli fermi.
- **Lo scroll riscritto**: su touch torna quello nativo (`overflowY:scroll`), senza il dimezzamento e senza l'inerzia di 0.3 s.
- **La protuberanza sul bordo destro** per aprire il menu: `if (!IS_TOUCH_DEVICE) menuBulge.activate()`.
- **Il contatore "days until Monday"**: nascosto sotto 1025px, e nascosto anche sopra 1025px se il dispositivo e' touch (`.touch .HeroModule .countdown{display:none}`).
- **Il pallino animato** accanto alle voci di menu e alle storie (`if (IS_TOUCH_DEVICE)` salta la creazione).
- **Il passaggio del mouse sui tag** (nessun `mouseover` registrato su touch): resta solo il clic.
- **La colonna sinistra del piede** con il video in `mix-blend-mode: multiply` (`display:none` sotto 768px).

**Cosa viene SOSTITUITO**
- La griglia WebGL diventa una griglia di `<img class="lazyload">` normali, con `data-src` e lazysizes. Il video al passaggio del mouse c'e' ancora nel codice ma perde il senso: il ramo touch fa solo `opacity` sull'`imageContainer`.
- Il menu a protuberanza diventa un **hamburger fisso** in alto a destra (`.mobileBurger`, 40x40, `top:26px`, `z-index:999`), visibile sotto 1025px e su qualunque dispositivo touch.
- Le voci di menu passano da 60px allineate a sinistra a **35px centrate** (e a 52px se la finestra e' bassa, `max-height:580px`).
- Il video dell'eroe cambia sorgente: `hm-hero-mobile.mp4` (8,0 MB) al posto di `hm-hero-desktop.mp4`, con box di riferimento 828x574 invece di 950x660, e riposizionato verticalmente al centro invece che a `-5%`.

**Cosa RESTA**
- Il preloader nero e il sipario Paper.js: quelli girano anche su touch.
- L'ordine delle sezioni, i testi, i font (identici, nessun taglio).
- Il cambio di parola nell'eroe.
- Il piede completo con le quattro fisarmoniche e i quattro uffici.

**Scaglioni tipografici**: titolo di un case 23px → **15px**; margine fra le voci 100px → **50px**; titolo del pannello prodotto 90px → **36px**; titolo dell'eroe 80px → **40px**.

Breakpoint dichiarati nel JS: 412 / 640 / 768 / 1024 / 1440. Nel CSS le query sono tutte `min-width` (impianto mobile-first): 412, 640, 768, 900, 1024, 1025, 1440, 1850, 2550, piu' tre query su `height` (`max-height:510px`, `max-height:580px`, `min-height:770px`) per non far sbordare l'eroe sui portatili bassi.

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| Rendering delle pagine | **server-side, HTML completo**. Non e' una SPA React/Vue: l'HTML sorgente contiene gia' tutti i 34 case, i testi e il piede | VERIFICATO | `curl` senza JS restituisce 226 KB di markup pieno |
| Navigazione | router client interno (`TemplateManager` + `LinkParser` + `signalHashChange`) che scambia i template senza ricaricare | VERIFICATO | classi `TemplateManager`, `addTemplate("HomeTemplate"...)` nel bundle |
| Backend | **Laravel su Heroku**, dietro Cloudflare | SUPPOSTO (Heroku e Cloudflare sono VERIFICATI) | header `via: 2.0 heroku-router`, `Server: cloudflare`; `Cache-Control: no-cache, private` e' il default di Laravel, ma non ho conferma diretta |
| CMS | **Contentful** | VERIFICATO | tutte le immagini e i video dei case vengono da `images.ctfassets.net` / `videos.ctfassets.net`, space id `9uhkiji6mhey` |
| Ottimizzazione immagini | API di Contentful (`?w=980&fm=jpg&q=100`) | VERIFICATO | nei `data-landscape-image` |
| Animazione | **GSAP 2.x** (`TweenLite`/`TweenMax`/`TimelineMax`, banner `VERSION: 1.9.2 — DATE: 2019-02-07`) | VERIFICATO | licenza GreenSock in chiaro nel bundle |
| Geometria elastica, maschere, sipario | **Paper.js** (`PaperScope`, `CompoundPath`, `smooth("catmull-rom")`) | VERIFICATO | classi Paper.js nel bundle |
| WebGL | **PixiJS v8** (Sprite, Container, Graphics, AnimatedSprite, spritesheet) | VERIFICATO | stringhe `pixi.js:...`, `pixi-program`, `#version 300 es`, `pixi.js/unsafe-eval` |
| 3D | **nessuno** | VERIFICATO | zero occorrenze di Three.js/Babylon; il WebGL e' tutto 2D |
| Shader personalizzati | **nessuno** | VERIFICATO | gli unici sorgenti GLSL nel bundle sono quelli interni a Pixi |
| Smooth scroll | **fatto in casa** sopra GSAP, non una libreria | VERIFICATO | `class Io`: `overflow:hidden` + `wheel` bloccato + tween 0.3s + `window.scrollTo` |
| Lazy loading | **lazysizes** + `IntersectionObserver` | VERIFICATO | classi `lazyload`/`lazyloaded`, `data-src` |
| Video player (pagine case) | **hls.js** e **Plyr** presenti nel bundle | VERIFICATO (presenti) / SUPPOSTO (usati nelle pagine case, non in home) | stringhe nel bundle; in home non vengono istanziati |
| Analytics | **Plausible** (self-service, no cookie) | VERIFICATO | `<script defer data-domain="hellomonday.com" src="https://plausible.io/js/script.js">` — unico script di terze parti della pagina |
| Error tracking | **Bugsnag** (`autoCaptureSessions:true`, `collectUserIp:false`) | VERIFICATO | chiamata di init nel bundle |
| Build | webpack, un solo bundle CSS e un solo bundle JS con hash nel nome (`bundle-2bdea8b598.css`, `main-e03077acdb.js`) | VERIFICATO | struttura `i(4556)` dei moduli, naming `/build/...` |
| Font | auto-ospitati, 3 famiglie, 4 formati ciascuna | VERIFICATO | `@font-face` nel CSS |
| Cookie banner | **nessuno** | VERIFICATO | nessun markup di consenso, coerente con Plausible |

## Peso e prestazioni

Misurato il 13/08/2026 con `curl` da Milano (CF-RAY `...-MXP`).

**Codice**

| risorsa | non compressa | come arriva |
|---|---|---|
| HTML della home | 226.058 B | **108.948 B** |
| CSS (bundle unico) | 151.730 B | **26.790 B** |
| JS (bundle unico) | 1.743.079 B | **685.234 B** |
| **totale codice** | ~2,12 MB | **~821 KB** |

**Media, prima schermata**

| risorsa | peso |
|---|---|
| `hm-hero-desktop.mp4` (retina) | **10.339.565 B — 10,3 MB** |
| `hm-hero-desktop-non-retina.mp4` | 9.530.060 B |
| `hm-hero-mobile.mp4` | 8.031.405 B |
| PNG segnaposto dell'eroe | 57.386 B |
| 3 font `woff2` | 110.908 B |
| spritesheet `face_all.png` + `.json` | 33.703 + 29.116 B |
| altri spritesheet e PNG (scroll-dot, dot2, menu blob, circle, trail) | ~10 KB in tutto |
| `stick.mp3` | 11.410 B |
| miniatura Contentful, campione | 46.231 B |

**Prima schermata reale su desktop: circa 1 MB di codice piu' 10,3 MB di video**, piu' le miniature che entrano in viewport (~46 KB ciascuna). Il video e' 950x660, h264, 24 fps, 37,96 s, 911 fotogrammi, ed e' un'animazione a tratto in bianco e nero: **un contenuto che un `<canvas>` o un WebM alpha avrebbero pagato una frazione**. E' il singolo numero peggiore del sito.

Mitigazioni che ci sono davvero: il video parte solo dopo 1,5 s ed e' governato da `IntersectionObserver` (si mette in pausa quando esce dallo schermo); esiste una variante alleggerita per schermi non-retina; il PNG segnaposto copre l'attesa; c'e' **un solo script di terze parti** (Plausible) e nessun cookie banner.

**Tempi**: la prima risposta HTML ha impiegato 2,16 s a freddo e 7,79 s in una seconda misura (`cf-cache-status: DYNAMIC`, quindi Cloudflare non serve la home dalla cache — ogni visita passa da Heroku). CSS 1,20 s, JS 3,75 s. Sono tempi di `curl` da rete domestica, non Web Vitals.

Punteggi Lighthouse: **non misurati** (vedi sotto).

## Tre cose da rubare

1. **La membrana da bucare al posto dell'hover.** Un contorno chiuso di ~12 punti attorno all'immagine, disegnato con Paper.js su un canvas fuori schermo e usato come maschera. Ogni punto viene attratto verso il puntatore in proporzione alla distanza (soglia 125px, smorzamento 0.2); quando il puntatore supera la soglia di aggancio (80px) il punto e' "trascinato"; quando lo si strappa, tutti i punti scattano insieme con un rimbalzo di 70px `yoyo` in 0.2s e **solo allora** il contenuto (il video) si rivela. E' la differenza fra "il video parte quando ci passi sopra" e "il video te lo sei guadagnato". Costa una libreria di 200 KB e nessun modello 3D.

2. **Il video condiviso, uno solo per tutto il sito.** Un unico `<video>` viene staccato dal DOM al boot (`SHARED_VIDEO`), tenuto in memoria, e al passaggio del mouse viene **spostato dentro la miniatura corrente** e gli si cambia `src`. Con 34 progetti in griglia, questo e' 1 elemento video invece di 34, 1 decoder invece di 34. E' la ragione per cui la pagina non muore. Da copiare in qualunque griglia con anteprime video.

3. **Il dettaglio che dice il nome dello studio senza dirlo.** "Hello Monday" mette in alto a destra un calendarietto e la frase `4 days until Monday`, calcolata da `new Date().getDay()` su un array di sette stringhe scritte a mano — inclusa `It's Monday today!`. Zero costo, zero libreria, sette righe di codice, e resta in mente piu' della griglia. La meccanica generale: **prendi il nome del cliente e trasformalo in un widget che cambia da solo ogni giorno.** Stessa famiglia: la favicon che sbatte le palpebre alternando due PNG ogni 500ms, e la formattazione random del portfolio che rende ogni visita un impaginato diverso.

## Non verificato

- **Lighthouse, Core Web Vitals, numero totale di richieste, peso totale della pagina caricata**: non misurati. Il browser MCP di questa macchina e' condiviso con altri agenti e durante la sessione la scheda e' passata a un altro sito; ho preferito fermarmi a un solo screenshot piuttosto che aprire schede e rischiare di rompere il lavoro di un altro processo (vedi nota sulla memoria in fondo).
- **Altezza totale del documento e numero esatto di schermate di scroll**: non misurata, per lo stesso motivo. La stima di 10-14 schermate per la griglia e' calcolata a mano dalle altezze base (276 / 351 / 647 px) su 3 colonne, non letta dal browser.
- **Impaginato reale su telefono**: non ho potuto fare uno screenshot in emulazione. Quello che scrivo sul mobile viene dal CSS e dai rami `IS_TOUCH_DEVICE` del JS, che sono espliciti; ma **quante colonne restino sul telefono non l'ho confermato a schermo**: le regole `.column{width:47%}` di base, `margin-left:5.99%` da 412px e `width:29.34%` da 769px sono contraddittorie da leggere in un CSS minificato.
- **Il backend Laravel** e' dedotto dagli header, non confermato.
- **`stick.mp3`**: il file esiste e viene istanziato per ogni segmento, ma non ho verificato all'ascolto che venga effettivamente riprodotto (potrebbe restare muto per via delle policy di autoplay audio del browser).
- **Le pagine interne** (`/work/...`, `/about`, `/services`, `/stories`, `/product`): non aperte. Le classi `CaseHeroModule`, `BehindTheScenesModule`, `CaseContentModule`, `AwardsModule`, `CodeOfHonorEntry`, `StoriesListModule` sono nel bundle e le ho lette, ma non le ho viste in funzione.
- **`.QuoteDisplay`**: il codice del menu lo cerca dentro `.MainMenu`, che nell'HTML della home e' vuoto. Non so se sia una funzione viva su altre pagine o codice morto.
- **Data dell'ultimo aggiornamento del sito**: nessun indizio in chiaro. Datazione dedotta dai contenuti (case Gemini, 2024) e dalle librerie (PixiJS v8, 2024).

---

*Nota sulla memoria: non ho aperto nessuna scheda mia. La navigazione ha riusato l'unica scheda gia' presente nel browser condiviso, che a fine sessione risultava in uso da un altro agente (Immersive Garden) — non l'ho chiusa per non interromperlo. Tutto il resto della scheda e' stato ricavato con `curl`, `ffprobe`/`ffmpeg` e `WebFetch`, senza browser.*
