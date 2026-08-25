# Igloo Inc.

- **URL**: https://igloo.inc — risponde `308` e reindirizza a `https://www.igloo.inc/` (verificato con `curl -I`). Sito raggiungibile, nessuna sostituzione necessaria.
- **Premio**: Awwwards **Site of the Day** del 23/07/2024 (voto 7.92/10: Design 8.05, Usability 7.5, Creativity 8.31, Content 7.91; Dev Award 7.66) — https://www.awwwards.com/sites/igloo-inc . Poi **Site of the Year** e **Developer Site of the Year** (annuncio marzo 2025) — https://x.com/abeto_co/status/1900152588768579701
- **Studio**: **Abeto** (https://abeto.co) in collaborazione con **Bureaux**. Bureaux ha portato moodboard, asset 3D, render e scaletta dei contenuti; Abeto ha fatto codice e arte 3D. Fonte: case study Awwwards https://www.awwwards.com/igloo-inc-case-study.html . Nella console del sito viene stampato `🧊 by https://abeto.co` (verificato).
- **Anno**: 2024 (il copyright a schermo dice `// Copyright © 2026`, quindi la stringa è mantenuta aggiornata)
- **Letto il**: 13/08/2026

---

## L'ESPERIENZA (integrazione)

*Blocco aggiunto il 13/08/2026 rileggendo il sito con `curl` (HTML servito e i due
bundle `index-2eb69c09.js` / `App3D-f554a111.js`) e verificando fuori sito che cosa
Igloo venda davvero. Integra — non sostituisce — le sezioni sotto.*

### Di cosa tratta il sito

Della **holding**, non dei suoi prodotti. Dentro ci sono, in tutto e per tutto:
una frase di missione, **tre schede aziendali** da due paragrafi l'una (Pudgy
Penguins, Overpass, Abstract), tre link ai rispettivi siti, i social e un piede.
Il testo totale del sito è **circa 800 parole**. Tutto il resto è ambiente 3D:
un igloo su un paesaggio innevato, tre blocchi di ghiaccio sospesi con dentro i
loghi, un tunnel di portali.

### Cosa vende, e qual è l'obiettivo finale

**Dichiarato**, testuale a schermo:
> `Our mission is to build the next generation of consumer brands at the intersection of Community, AI, and crypto.`

**Vero.** Su `igloo.inc` non si compra niente: **il prodotto sta a valle**, sui
tre siti figli, e questa pagina serve a legittimare chi ci sta sopra. Il giro
d'affari reale del gruppo è: l'IP di **Pudgy Penguins** (collezione NFT +
giocattoli fisici distribuiti da Walmart e Target, **oltre 10 M$ di ricavi lordi
sul solo giocattolo a inizio 2025**), il **licensing di IP on-chain** con
OverpassIP, e la catena Layer-2 **Abstract** con il suo ecosistema. Igloo ha
raccolto capitale (investimento strategico di Animoca Brands) e ha acquisito
altre società (Frame).
Fonti: https://www.theblock.co/post/301420/pudgy-penguins-parent-company-igloo ·
https://www.animocabrands.com/announcement/animoca-brands-makes-strategic-investment-in-pudgy-penguins-parent-company-igloo-inc

Quindi l'obiettivo finale è **triplo, e nessuno dei tre è una vendita diretta**:

1. **Credibilità istituzionale** davanti a investitori e partner brand. È il vero
   lavoro della pagina: dimostrare che dietro a una mascotte pinguino c'è una
   società di tecnologia. La dimostrazione **non è nel testo, è nel sito stesso**.
2. **Traffico verso i tre siti figli.** L'unica conversione misurabile è il
   click su `[website]` → `pudgypenguins.com`, `overpassip.com`, `cubelabs.xyz`.
3. **Premi e riconoscibilità.** Awwwards SOTD 23/07/2024, poi Site of the Year e
   Developer Site of the Year 2025. Per una società crypto è capitale
   reputazionale a costo di un sito.

**Prova che la vendita non è l'obiettivo — verificata nel bundle**: nel
JavaScript di produzione **non esiste una sola occorrenza** di `contact`,
`careers`, `jobs`, `hiring`, `invest`. Nessun modulo, nessuna email, nessun
prezzo, nessuna newsletter. Le uniche uscite dal sito sono: 3 `website`, i
social di ciascuna azienda (`X`, `IG`, `LI`, `TK`) e 3 link di piede
(`LinkedIn`, `X / Twitter`, `Medium`, con gli URL `linkedin.com/company/igloo-incorporated`,
`twitter.com/iglooinc`, `medium.com/@iglooinc`).

**Precisazione onesta sulla natura del prodotto**: è **cripto, IP e giocattoli**.
Non ho trovato **nessuna componente immobiliare** — l'unico "immobile" del
progetto è l'igloo modellato in 3D.

### A chi

Tre pubblici, in quest'ordine di peso:

1. **Investitori, fondi e partner brand** che devono decidere se Igloo è un
   interlocutore serio. Sanno già cos'è un NFT; temono di trattare con un
   progetto amatoriale. Devono uscire pensando: *qui c'è una società di
   tecnologia, non una community di Discord.*
2. **La community crypto già dentro l'ecosistema Pudgy**, che il sito ricompensa
   con un oggetto da mostrare ("guarda cosa hanno costruito").
3. **Designer e sviluppatori** (la giuria dei premi, e chi in futuro vorrà
   lavorarci). Pubblico non dichiarato ma servito benissimo.

### L'esperienza progettata, passo per passo

Non è una pagina che scorre: è **una visita guidata dentro una scena unica**
(`html, body { overflow: hidden }`), dove la rotella non muove il documento ma
la camera.

1. **Attesa a vuoto (10–20 s).** Fondo `#A0A5B1`, una barra ASCII al centro
   (`---===+++=`) e nient'altro. Nessuna percentuale, nessuna parola, nessun
   logo. È il filtro d'ingresso: chi ha fretta se ne va qui.
2. **Arrivo dall'alto.** La camera attraversa tre portali fra plasma, fumo e
   neve — circa 9 secondi di timeline, ma *scrubbata*: se non scorri, non si
   muove.
3. **La casa.** L'igloo posato sulle montagne. A schermo compaiono quattro sole
   scritte: `IGLOO`, `////// Manifesto` con la frase della missione,
   `Scroll down to discover.`, `Sound: Off`.
4. **L'apertura.** L'igloo si smonta, i mattoni restano sospesi, l'interno si
   illumina. È la metafora dichiarata: *ti stiamo facendo entrare*.
5. **Il portfolio come reperti.** Tre blocchi di ghiaccio, uno per azienda, con
   dentro il logo intrappolato. Etichetta da laboratorio a filo del cristallo:
   `PORTFOLIO_CO_02 OVERPASS`, `TEMP 25.72 / -03.49`, `D 06.01.2023`,
   `CLICK TO EXPLORE`.
6. **L'interno.** Al click i caratteri esplodono, la camera entra nel cristallo,
   il fondo si ribalta al blu notte e appare il testo lungo: `////// Summary`,
   due paragrafi, `/// Discover` con `[X] [IG] [LI] [TK]`, `/// Visit` con
   `[website]`, e `Close`.
7. **Il congedo.** Il pinguino si dissolve in nuvola di punti; nel piede i punti
   si ricompongono nella forma del social sotto il puntatore.
8. **Il loop.** Si rientra sull'igloo di partenza. Il sito non finisce mai:
   **non c'è una schermata finale, quindi non c'è un momento di chiusura in cui
   chiedere qualcosa.**

**Cosa deve fare il visitatore**: scorrere → cliccare un cubo → leggere → cliccare
`[website]`. Sono quattro gesti, e il quarto lo porta **fuori dal sito**.

**Immagine che resta**: un blocco di ghiaccio sospeso con un logo congelato
dentro, che si apre e ti inghiotte.

### Come è organizzata la persuasione

| cosa | dove sta | a quale schermata |
|---|---|---|
| Promessa | la sola frase del manifesto, in alto a destra sulla home | ~2 (dopo il loader e l'intro) |
| Prova dichiarata | le tre schede aziendali, con date di acquisizione e temperatura | 4–9 |
| Prova reale (quella che convince) | **il sito stesso**: 17 MB di 3D che gira liscio | dal primo istante |
| Prezzo | **assente**. Nessun numero, nessuna cifra, nessun dato di trazione | mai |
| Chiamata all'azione | `Click to explore` (dentro il sito) e poi `[website]` (fuori) | 4 in poi |

Non c'è un imbuto: c'è **un rimando**. Il sito non chiede niente, mostra e
smista. Servono **4–6 giri completi di rotella** prima che compaia il primo nome
commerciale del gruppo.

### Cosa arriva a chi NON scorre fino in fondo

È il punto debole, ed è deliberato.

- **Chi abbandona durante il loader (i primi 10–20 s) porta via zero.** L'HTML
  servito è di 1410 byte con `<body></body>` vuoto: niente titolo in pagina,
  niente immagine, niente testo. Il `first-contentful-paint` misurato è a **9,8 s**
  e quel che dipinge è una barra ASCII.
- **Chi si ferma alla prima schermata utile** porta via tre cose: il nome
  `IGLOO`, la frase del manifesto, e la sensazione — corretta — che sia gente
  molto capace. **Non porta via nessuno dei tre nomi commerciali**: Pudgy
  Penguins, Overpass e Abstract compaiono solo dopo aver scorso.
- **Chi arriva da un motore di ricerca o da un'anteprima social** legge una cosa
  ancora diversa: i meta dicono `Our mission is to create the largest onchain
  community, driving the consumer crypto revolution.` — **non coincide** con il
  manifesto a schermo. Il testo visibile è stato aggiornato, i meta no.
- **Un crawler senza JavaScript vede: un titolo e una riga di descrizione.**

Tradotto per un committente: questo sito funziona **solo** su chi ha già una
ragione per restare (un investitore che ha ricevuto il link, un giurato, un
membro della community). Su traffico freddo non comunica nulla.

### I testi veri, per intero

Sono pochi: stanno tutti qui, letti dall'oggetto di configurazione nel bundle.

> `////// Manifesto`
> `Our mission is to build the next generation of consumer brands at the intersection of Community, AI, and crypto.`

> `Scroll down to discover.` · `Click to explore` · `???????????????` (quando il
> click è disabilitato) · `Close` · `Sound: Off` / `Sound: On` · `/// Follow Us`

> `PORTFOLIO_CO_01 Pudgy Penguins` (`01/02/2020`, temp `0`) ·
> `PORTFOLIO_CO_02 Overpass` (`06/01/2023`, temp `-3`) ·
> `PORTFOLIO_CO_03 Abstract` (`06/28/2024`, temp `-5`)

> `////// Summary` · `/// Discover` · `/// Visit` · `website`

> `// Copyright © 2026` · `Igloo, Inc.` · `All Rights Reserved.`

I due paragrafi di ciascuna scheda sono trascritti per intero più sotto, nella
sezione **Testi veri**.

---

## Cosa vende

Niente. È la pagina istituzionale della holding che possiede **Pudgy Penguins**, **OverpassIP** e **Abstract**: vende credibilità e appartenenza a una società crypto, non un prodotto acquistabile. Non c'è un solo modulo, prezzo o carrello: l'unica conversione possibile è cliccare verso i tre siti figli o i social.

## A chi

Investitori, partner brand e la community crypto già dentro l'ecosistema Pudgy. Deve uscirne pensando che dietro alle mascotte pinguino ci sia un'azienda con capacità tecniche serie — il sito stesso è la dimostrazione, non il messaggio. Secondo pubblico, dichiarato dai premi: la giuria di designer e sviluppatori.

## Idea regista

Ogni azienda del gruppo è un blocco di ghiaccio: ci si avvicina, lo si legge dall'esterno, lo si apre e ci si entra dentro — e tutto, testo compreso, è un unico canvas WebGL.

## Il momento

**Il click su un blocco di ghiaccio.** L'etichetta accanto al cristallo (`PORTFOLIO_CO_02 OVERPASS`, `TEMP 25.72 / -03.49`, `D 06.01.2023`, `CLICK TO EXPLORE`) esplode in caratteri casuali, la camera entra dentro il cristallo e lo sfondo si ribalta dal grigio chiaro al blu quasi nero della scheda interna. Ho catturato l'effetto a metà transizione: il testo a schermo diceva `KKVXBLIN`, `WAIM 7`, `CLICK UP GRJNIUH` — sono le stesse etichette con i caratteri sostituiti a caso (screenshot `ig_desk_12.png`). Non è un effetto CSS: è uno spostamento di offset sull'atlas SDF dentro lo shader (confermato dal case study Awwwards).

Secondo momento, più lungo: l'intro. Una timeline GSAP scrubbata di ~9,2 secondi in cui la camera attraversa tre portali (a progress 0.28, 0.375, 0.465) tra anelli, plasma, scie di fumo e particelle di neve, con il FOV che passa da 22 a 30 gradi in 7,2 secondi (letto direttamente nel bundle, vedi Animazioni).

## Struttura, sezione per sezione

Non ci sono sezioni HTML: è **una sola scena continua** guidata da uno scroll virtuale (`html, body { overflow: hidden; touch-action: none }`, verificato nel CSS iniettato). La "lunghezza" qui sotto è espressa in **passi di rotella da 2880 px** (12 × 240 px), che è il passo con cui ho campionato: a 900 px di viewport vale circa 3,2 schermate per passo. La mappatura esatta dei confini fra stati **non è verificata**, perché il progresso non è leggibile dal DOM.

| sezione | cosa mostra | cosa fa l'utente | quanto dura (passi da 2880 px di rotella) |
|---|---|---|---|
| Loader | Fondo `#A0A5B1` pieno, al centro una barra ASCII animata (`---===+++=` che scorre) in `monospace` bold 17 px | Aspetta. Nessuna percentuale, nessun pulsante | fino al termine del precaricamento (nel mio test la scena era già a schermo al primo screenshot, ~20 s dopo il `goto`) |
| Intro / tunnel | Attraversamento di tre portali con anelli, plasma, scie di fumo, particelle di neve, tunnel | Scorre (la timeline è scrubbata sul progresso) | ~1 |
| Campo wireframe | L'igloo al centro dentro una griglia di triangoli bianchi con numeri sparsi (`44`, `48`, `28`, `22`, `17`) | Scorre | dentro il passo 0 |
| Home | L'igloo sul paesaggio di montagne innevate. Logo `IGLOO` in alto a sinistra, `////// Manifesto` in alto a destra, `Scroll down to discover.` e `Sound: Off` in basso a sinistra | Scorre; può accendere l'audio | ~1 |
| Igloo che si smonta | I mattoni dell'igloo si staccano e restano sospesi, l'interno si illumina di bianco | Scorre | dentro il passaggio verso i cristalli |
| Portfolio ×3 | Un blocco di ghiaccio sospeso per azienda, con dentro il logo intrappolato. Etichetta a filo: `PORTFOLIO_CO_0n <nome>`, `TEMP` con due valori, `D <data>`, `CLICK TO EXPLORE` | Scorre per passare al blocco successivo, **clicca** per entrare | ~1 per blocco |
| Anello / portale | Un grande anello di ghiaccio luminoso con il logo dell'azienda scavato dentro, visto frontalmente e poi attraversato | Scorre | ~1 fra un blocco e l'altro |
| Interno progetto | Fondo scuro, il soggetto 3D (il pinguino, il logo) resta sullo sfondo in penombra. Testo: `////// Summary` + 2 paragrafi, `/// Discover` con `[X] [IG] [LI] [TK]`, `/// Visit` con `[website]`. In alto a destra `Close` dentro quattro parentesi angolari | Scorre il testo, clicca i link, chiude | fino a `Close` |
| Particelle / volumi | Il pinguino Pudgy ricostruito come nuvola di punti che ruota su anelli concentrici, con frange di aberrazione cromatica | Scorre | ~1 |
| Footer / link | Tre voci (`LinkedIn`, `X / Twitter`, `Medium`): la nuvola di punti si ricompone nella forma corrispondente al passaggio del mouse | Passa sopra e clicca | non verificato (non l'ho raggiunto in cattura) |
| Loop | L'esperienza rientra sull'igloo di partenza | — | il ciclo si è richiuso dopo ~5-6 passi |

Il loop è coerente con il tag **Infinite Scroll** che Awwwards assegna alla scheda del sito.

Esiste anche una rotta client-side `"/portfolio/:project"` con gli slug `pudgy-penguins`, `overpass`, `abstract` (stringa trovata nel bundle): l'apertura di una scheda cambia URL ed è quindi condivisibile e indicizzabile come stato.

## L'esperienza in ordine di tempo

**Primi dieci secondi (rete reale, senza throttling, Chromium con GPU, viewport 1440×900):**

- **0,0 s** — Arriva l'HTML: 1410 byte, `<body>` completamente vuoto, un solo `<script type="module">`. Schermo del colore `--bgColor: #A0A5B1`.
- **0,1–1 s** — Parte il chunk `index-*.js` (16,5 KB): monta `#app`, `#webgl` e `#loader`, inietta il CSS in un `<style>` inline e importa dinamicamente `App3D-*.js`.
- **~1 s** — Compare il loader: una riga ASCII al centro che scorre (`---===+++=` → `----===+++` → …), 100 keyframe di `content`, ciclo di 5 s, con `text-shadow` bianco al 40%. Nessuna percentuale.
- **1–10 s** — Scaricano in parallelo 108 risorse per ~17 MB: 49 texture KTX2, 22 geometrie Draco, 18 tracce OGG, i due decoder WASM (Basis 462 KB, Draco 279 KB), una environment map EXR. `first-contentful-paint` misurato a **9852 ms** (è il loader: prima non c'è nulla da dipingere).
- **fine caricamento** — Il loader svanisce in opacità (`will-change: opacity`, `pointer-events: none`) e parte l'intro in tempo reale.

**Poi, a blocchi:**

1. **Intro (~9,2 s di timeline, scrubbata sullo scroll).** La camera parte da lontano e rientra: `timelinePosition` va a `z:0, x:0` in 2,5 s con `power2.out`, poi `y:-9.83` in 7 s con l'ease custom `entry_ease_3`; l'orizzonte ruota di 180° (`upRotation: Math.PI`) in 5,25 s con `power3.inOut`; il FOV va da 22 a 30 in 7,2 s con `power1.inOut`; al secondo 4 parte un displacement (`x:.01, y:.005 → 0`) e una rotazione di 0.05. Tre portali si accendono e si spengono per fasce di progresso, e il volume del suono dei portali è calcolato come distanza dal portale più vicino (`fit(distanza, 0, 0.04, 1, 0)` con `power2.out`, moltiplicato per 0.9): **l'audio è funzione della posizione, non un trigger**.
2. **Home.** L'igloo posato sul paesaggio. Il manifesto è allineato a destra, il copyright sotto al logo. In basso l'invito `Scroll down to discover.` e l'interruttore `Sound: Off` (l'audio parte **muto**: nel config `muted: true`).
3. **Smontaggio.** I mattoni si sollevano e la luce interna filtra dalle fughe.
4. **Portfolio.** Tre blocchi in sequenza, uno per azienda, ognuno con la sua etichetta tecnica e la sua temperatura (0, −3, −5).
5. **Interno.** Click → ribaltamento cromatico su fondo scuro, testo lungo, link, `Close`.
6. **Footer.** I punti si ricompongono nelle forme dei tre link.

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| Camera intro | posizione, target, `up`, FOV 22→30 | progresso dello scroll (timeline GSAP scrubbata) | `power2.out`, `power1.inOut`, `power3.inOut` e le ease custom `entry_ease`, `entry_ease_2`, `entry_ease_3` | tutti i valori letti nel bundle |
| Portali (anelli, plasma, scie) | comparsa/scomparsa | fasce di `progress`: anelli fino a .43/.52, force field .1–.34 / .25–.43 / .36–.52, plasma .06–.34 / .25–.43 / .35–.52, scie 0–.37 / 0–.47 / 0–.56, tunnel e neve fino a .52, anello stanza da .53 | — | è visibilità booleana a soglia, non fade: il costo si scarica appena l'elemento esce di quadro |
| Etichette UI (`PORTFOLIO_CO_02`, `TEMP`, `CLICK TO EXPLORE`) | i caratteri si sostituiscono a caso e si ricompongono | cambio di stato (entrata/uscita da un blocco) | — | **non è JS sul DOM**: cambia l'offset sulla texture SDF dentro lo shader (case study Awwwards). Catturato a metà: `KKVXBLIN`, `CLICK UP GRJNIUH` |
| Testo (glitch) | sfarfallio / disturbo | stato | — | shader WebGL al posto di clipping e mask CSS, dichiarato dallo studio come scelta di prestazioni |
| Transizioni di scena | aberrazione cromatica, displacement, dissolvenza a brina | cambio di stato | — | visibile come frange rosso/ciano sugli anelli nello screenshot `ig_desk_05.png` |
| Blocchi di ghiaccio | rotazione lenta continua | tempo | — | continuano a ruotare anche fermi |
| Igloo che si smonta | i mattoni si staccano e restano sospesi | scroll | ease custom `igloo_ease_1` (`M0,0 C0.662,0.073 0.047,1 1,1` — parte veloce, poi quasi si ferma) | |
| Particelle volumetriche (pinguino, loghi footer) | i punti si ricompongono da una forma all'altra | hover sul link / scroll | — | dati da volumi VDB convertiti con un esportatore proprio; il colore dipende dalla velocità del punto e i punti si illuminano durante il cambio forma, in sincrono con l'audio |
| DPR del renderer | risoluzione di rendering | FPS medi misurati | passo 0.1 | vedi Peso e prestazioni |
| Loader ASCII | la barra scorre | tempo (CSS `@keyframes` su `content`, 5 s, infinito) | `linear` | è l'unica animazione non-WebGL del sito |

**Librerie riconosciute (tutte VERIFICATE nel bundle):** GSAP con **CustomEase** — nove curve registrate a mano:

```
inOut1        M0,0 C0.5,0 0.1,1 1,1
inOut2        M0,0 C0.56,0 0,1 1,1
inOut3        M0,0 C0.6,0 0,1 1,1
inOut4        M0,0 C0.4,0 -0.06,1 1,1
inOut5        M0,0 C0.171,0 0.77,-0.013 0.842,0.272 0.972,0.794 0.972,0.85 1,1
entry_ease    M0,0 C0.358,0 0.336,0.209 0.442,0.519 0.59,0.952 0.768,0.918 1,1
entry_ease_2  M0,0 C0.388,0.082 0.924,0.862 1,1
entry_ease_3  M0,0 C0.272,0 0.472,0.454 0.496,0.496 0.66,0.79 0.685,1 1,1
igloo_ease_1  M0,0 C0.662,0.073 0.047,1 1,1
```

Post-processing: **pmndrs/postprocessing** (nel bundle c'è l'URL `https://github.com/pmndrs/postprocessing` e le classi `EffectComposer`, `DepthOfFieldEffect`, `GodRaysMaterial`, `KawaseBlurMaterial`, `GaussianBlurPass`, `LuminancePass`, `EdgeDetectionMaterial`, `Downsampling.Mipmap`, `DoF.Bokeh.Near/Far`).

**Nessuna libreria di smooth scroll** (né Lenis né Locomotive): lo scroll è gestito in proprio, con un event bus interno che emette `wheel`, `touch_start`, `touch_drag`, `touch_end`, `touch2_*` verso un controller di camera.

## Colori

Tutti letti nel codice, non stimati. I primi sei stanno in un unico oggetto di configurazione del bundle.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo pagina (dietro al canvas) | `#A0A5B1` | variabile CSS `--bgColor`, su `html`, `body` e sul loader — è il grigio-azzurro che si vede prima che la scena esista |
| logo | `#ffffff` | la parola `IGLOO` in alto a sinistra |
| testo generico | `#ffffff` | manifesto, `Scroll down to discover.`, `Sound: Off`, `Close` |
| titolo | `#3C3C54` | `colorTitle` — grigio-viola scuro |
| titolo di progetto | `#67707E` | intestazioni `////// Summary`, `/// Discover`, `/// Visit` dentro la scheda |
| testo di progetto | `#A1AAB7` | i due paragrafi lunghi della scheda |
| azzurri di ghiaccio | `#d1e3ff`, `#b5d5ff`, `#d7ebfa`, `#a7b2d6`, `#83a1c5` | presenti nel bundle; uso puntuale **non verificato** |
| grigi freddi | `#e1e6f1`, `#e0e8ef`, `#d1d6e3`, `#c9d0df`, `#bdc6d4`, `#b3bac9`, `#afb6c7`, `#8b909d`, `#6b7685`, `#6a6f7d`, `#545b6b` | scala completa dal quasi-bianco al medio; è tutta la tavolozza del sito |
| blu notte (interni) | `#09121f`, `#222b42`, `#2d3133` | il fondo scuro delle schede progetto — coerente con quanto ho visto negli screenshot |
| caldi | `#cda05e`, `#ab8349`, `#886a3d`, `#904619` | unici colori caldi del bundle; probabilmente il becco del pinguino. **Non verificato** |
| bianco puro / nero | `#ffffff`, `#000000` | luci ed estremi |

Il sito **non ha un accento cromatico**. È tutto costruito su una scala di grigi freddi con qualche punta di azzurro: il "colore" arriva solo dall'aberrazione cromatica nelle transizioni, cioè dall'errore ottico, non dalla tavolozza.

## Tipografia

Un solo carattere in tutto il sito: **IBM Plex Mono**.

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| logo `IGLOO` | non è testo — è una texture (`ui/logo-datatexture.ktx2`) | — | — | — | il lettering è disegnato, non composto |
| titoli/etichette WebGL | IBMPlexMono-Medium (atlas MSDF) | Medium (500) | `size: .13` e `.115` in unità di scena | `lineHeight: 0.8` | il corpo non è in pixel: è misura 3D, quindi scala con la camera |
| corpo e didascalie WebGL | IBMPlexMono-Medium (atlas MSDF) | Medium | `size: .1` e `.09` | `lineHeight: 0.8` | interlinea molto stretta, sotto il corpo: è la firma visiva del sito |
| loader | `monospace` di sistema | bold | 17 px | — | l'unico testo DOM reale della pagina |

**Come sono serviti i font.** Doppio binario, ed è la cosa interessante:

1. Come webfont classici, auto-ospitati e con hash: `IBMPlexMono-Regular` e `IBMPlexMono-Medium`, ognuno in `.woff2` + fallback `.woff`, `font-display: swap`. Servono al DOM (di fatto quasi solo al loader).
2. Come **atlas MSDF dentro una texture compressa**: `../fonts/IBMPlexMono-Medium-datatexture.ktx2`, più `cubes/blurrytext_atlas.ktx2`, `igloo/numbers.ktx2`, `frost-datatexture.ktx2`, `scroll-datatexture.ktx2`. È così che tutto il testo visibile finisce dentro il canvas. C'è persino un `msdfworker-*.js` dedicato.

Anche le icone dell'interfaccia sono texture: `ui/arrow-`, `ui/close-`, `ui/logo-`, `ui/sound-`, `ui/visit-datatexture.ktx2`. **Nel sito non esiste un solo nodo di testo HTML visibile.**

## Testi veri

Trascritti dalla configurazione nel bundle (quindi testuali, non riletti da screenshot).

**Manifesto**
> `////// Manifesto`
> `Our mission is to build the next generation of consumer brands at the intersection of Community, AI, and crypto.`

**Inviti e stati**
> `Scroll down to discover.`
> `Click to explore`
> `???????????????` (versione dell'invito quando il click è disabilitato)
> `Close`
> `Sound: Off` / `Sound: On`
> `/// Follow Us`

**Piede**
> `// Copyright © 2026`
> `Igloo, Inc.`
> `All Rights Reserved.`

**Social della holding**: `X` → https://twitter.com/iglooinc · `LI` → https://www.linkedin.com/company/igloo-incorporated

**Le tre schede di portfolio**

1. `PORTFOLIO_CO_01 Pudgy Penguins` — slug `pudgy-penguins`, data `01/02/2020`, temperatura `0`
   > `////// Summary`
   > `Pudgy Penguins, a creative venture founded in 2021, quickly gained attention for its unique IP and engaging community. In 2022, the company was acquired by Igloo Inc., a strategic move aimed at expanding its reach and capabilities. The acquisition by Igloo Inc. was part of a broader vision to transform and reposition Pudgy Penguins as a next-generation entertainment company and the face of Web3 worldwide.`
   >
   > `We believe in a future where intellectual property, digital collectibles, and communities are born and thrive on the blockchain. Since our acquisition, Pudgy Penguins has leveraged its onchain origins to create a new model for consumer brands, shifting from a brand-and-consumer approach to a brand-and-participant model. Our business strategy focuses on expanding a vast range of content mediums, products, and experiences, driving people onchain into the new era of the internet. By harnessing the power of our vibrant community and the rich and whimsical universe of Pudgy Penguins, we're revolutionizing the way IP is created and experienced.`
   >
   > `/// Discover` → `X`, `IG`, `LI`, `TK` — `/// Visit` → `website` (https://www.pudgypenguins.com)

2. `PORTFOLIO_CO_02 Overpass` — slug `overpass`, data `06/01/2023`, temperatura `-3`
   > `OverpassIP was established as a solution to a significant licensing challenge faced by Pudgy Penguins, marking its inception with a crucial breakthrough in NFT licensing. The company empowers NFT holders by allowing them to submit their digital assets for potential licensing opportunities, offering a platform where collections can significantly amplify their growth and engagement. By participating in OverpassIP, collections open up a realm of possibilities for their brands, bringing their holders along for the ride through expansive licensing avenues.`
   >
   > `Moreover, brands seeking to enhance their initiatives can access a curated pool of NFTs on OverpassIP, selecting the intellectual property that best aligns with their strategic goals. This innovative approach not only facilitates dynamic partnerships between NFT creators and brands but also pioneers new frontiers in the utilization of digital assets within the broader market.`
   >
   > `/// Discover` → `X` — `/// Visit` → `website` (https://www.overpassip.com)

3. `PORTFOLIO_CO_03 Abstract` — slug `abstract`, data `06/28/2024`, temperatura `-5`
   > `Introducing Abstract, the blockchain for consumer crypto, pioneering culture, community, and creativity onchain. We believe that consumer crypto is the breakthrough opportunity to bring billions of people onchain and the final frontier for consumer crypto adoption. The dominant consumer crypto chain will be the single greatest distribution channel-bringing users, liquidity, partnerships, and community to crypto-native builders and global brands.`
   >
   > `Through a combination of culture & community building, a brand-new economic mechanism, cutting-edge cryptography, and dedicated builder & brand support, Abstract allows those building for the masses to scale and flourish.`
   >
   > `/// Discover` → `X`, `LI` — `/// Visit` → `website` (https://cubelabs.xyz)

**Meta** (dal `<head>`, unica cosa che un crawler senza JS può leggere):
> `<title>Igloo Inc.</title>`
> `Our mission is to create the largest onchain community, driving the consumer crypto revolution.`

Da notare: la descrizione nei meta (`largest onchain community`) **non coincide** con il manifesto a schermo (`next generation of consumer brands at the intersection of Community, AI, and crypto`). Il testo visibile è stato aggiornato, i meta no.

**Voci di menu**: non esistono. Non c'è navigazione, non c'è header, non c'è hamburger. Gli unici comandi persistenti sono il logo in alto a sinistra e `Sound: Off` in basso a sinistra.

## Mobile

Questa è la parte che smentisce l'aspettativa: **su telefono non è un altro sito. È lo stesso sito, con lo stesso peso.**

Ho eseguito la stessa sonda con emulazione iPhone 13 (390×844, DPR 3, touch, User-Agent iOS) e ho confrontato le liste di richieste:

- **108 richieste su desktop, 108 su mobile.** Le uniche due differenze sono due URL `blob:` generati a runtime, cioè gli stessi worker con UUID diverso.
- **18,39 MB di corpi di risposta su desktop, 18,39 MB su mobile.** Identico byte per byte come insieme di asset.
- Nessuna texture a risoluzione ridotta, nessun modello semplificato, nessun taglio dell'audio, nessuna scena disattivata.

**Cosa RESTA**: tutto. Il 3D completo, il post-processing, l'audio, l'intro coi portali, i tre blocchi di ghiaccio, le schede interne, il testo renderizzato in WebGL.

**Cosa CAMBIA** — solo il dimensionamento dell'interfaccia, tramite tre costanti nel config (verificate nel bundle):

```
gridSize: 125     gridSizeLow: 50     gridSizeMobile: 25
topMargin: 90     topMarginLow: 45    topMarginMobile: 25
breakpointW: 1600  breakpointH: 800   breakPointMobile: 640
```

Ci sono quindi **tre regimi**, non due: desktop pieno (oltre 1600×800), desktop "low" (sotto quella soglia), e mobile (sotto 640 px). Passando da 125 a 25 la griglia si fa cinque volte più larga in proporzione: il risultato è che sul telefono **il testo è enormemente più grande rispetto allo schermo** — il logo `IGLOO` occupa circa un terzo della larghezza, il manifesto in alto a destra è corpo pieno su sei righe. Sul desktop le stesse stringhe sono minute e defilate ai bordi. Il margine superiore scende da 90 a 25.

**Cosa viene SOSTITUITO**: l'interazione. Il controller ascolta `touch_start` / `touch_drag` / `touch_end` **e** `touch2_start` / `touch2_drag` / `touch2_end`, cioè gestisce esplicitamente il **secondo dito** con stati dedicati `ZOOM_PAN` e `ZOOM_ROTATE`. Su desktop lo stesso controller ascolta `wheel`. Il tocco non è la rotella riciclata: è un percorso a parte con pinch.

**Cosa SPARISCE**: nulla di visibile. `Sound: Off` resta, `Close` resta, il testo lungo delle schede resta identico e scorre verticalmente con una dissolvenza in alto e in basso (verificato negli screenshot `ig_mob_03.png` e `ig_mob_08.png`); i link diventano `[X] ↑  [IG] ↑  [LI] ↑  [TK] ↑` e `[website] ↑`, in fila, con area di tocco generosa.

**La conseguenza onesta**: un telefono in 4G paga gli stessi ~17 MB e deve reggere una heap JavaScript che nella mia misura è arrivata a **247 MB** (contro i 223 MB del desktop). L'unica difesa è il DPR adattivo — e su un iPhone con DPR 3 quella difesa lavora molto: al peggio scende a 0,6 del DPR nativo, il che è comunque più definito di un desktop a DPR 1. Detto altrimenti: la strategia mobile non è "alleggerire il contenuto", è "**abbassare la risoluzione di rendering finché gli FPS non tornano**".

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| Framework UI | **Svelte** | VERIFICATO | il runtime Svelte è nel chunk `index-*.js`: funzioni di transizione che scrivono `element.style.animation` e filtrano i nomi che contengono `__svelte` |
| Build | **Vite** | VERIFICATO | asset con hash stile Vite (`index-2eb69c09.js`), `<script type="module" crossorigin>`, `import("./App3D-*.js")` dinamico; confermato dal case study |
| 3D | **Three.js** | VERIFICATO | 213 occorrenze di `THREE`, `WebGLRenderer`, `BatchedMesh`, `MeshPhysicalMaterial`, `KTX2Loader`, `DRACOLoader` |
| Collisioni / raycast | **three-mesh-bvh** | VERIFICATO | messaggi d'errore `MeshBVH: ...` nel bundle; confermato dal case study (`three-mesh-bhv`) |
| Post-processing | **pmndrs/postprocessing** | VERIFICATO | URL del repo nel bundle + `EffectComposer`, `DepthOfFieldEffect`, `GodRaysMaterial`, `KawaseBlurMaterial`, `SMAA`/`EdgeDetectionMaterial` |
| Animazione | **GSAP** (con CustomEase) | VERIFICATO | `https://gsap.com/standard-license` nel bundle, `Missing plugin? gsap.registerPlugin()`, nove `CustomEase.create()` |
| Smooth scroll | **nessuna libreria**, implementazione propria | VERIFICATO | nessuna traccia di Lenis/Locomotive; c'è un event bus proprio (`Q.on("wheel", ...)`, `touch_drag`, `touch2_drag`) |
| Texture | **KTX2 / Basis Universal** | VERIFICATO | 49 file `.ktx2`, `basis_transcoder.wasm` (462 KB) + `basis_transcoder.js` |
| Geometrie | **Draco** | VERIFICATO | 22 file `.drc`, `draco_decoder.wasm` (279 KB) |
| Volumi particellari | **VDB**, con esportatore proprio verso il browser | VERIFICATO (asset) / dichiarato (pipeline) | `assets/images/volumes/peachesbody_64.ktx2`, `x_64.ktx2`, `medium_32.ktx2`, agganciati ai tre link del footer; la pipeline VDB→browser è dichiarata nel case study |
| Environment map | **EXR** | VERIFICATO | `cubes_env.exr` (253 KB) + un `exrworker-*.js` |
| Web Worker | 4 worker dedicati | VERIFICATO | `audioworker`, `bitmapworker`, `exrworker`, `msdfworker` |
| Audio | implementazione propria su Web Audio, file **OGG** | VERIFICATO | 18 `.ogg`, `AudioListener`, un `audioworker`; nessuna traccia di Howler |
| Tipografia in scena | **MSDF** su texture KTX2 | VERIFICATO | `IBMPlexMono-Medium-datatexture.ktx2`, `msdfworker-*.js`, `Error loading msdf json:` |
| Canvas | dentro uno **shadow root chiuso** | VERIFICATO | nel bundle: `t.attachShadow({mode:"closed"}).append(this.renderer.domElement)`. Conseguenza pratica: `document.querySelector('canvas')` restituisce `null` mentre la scena sta rendendo — l'ho verificato di persona |
| Routing | rotta client-side `/portfolio/:project` | VERIFICATO | stringa nel bundle, slug `pudgy-penguins`/`overpass`/`abstract` |
| Rilevamento dispositivo | parser di User-Agent tipo **ua-parser-js** | VERIFICATO | nel bundle c'è l'intera tabella di marche e browser (`Fairphone`, `NuVision`, `Coc Coc`, `Konqueror`, `TikTok`, `GSA`…) |
| Pannello di debug | **Tweakpane** | SUPPOSTO | il CSS iniettato stila `.tp-dfwv` e la sua scrollbar (classe di Tweakpane), ma la libreria non risulta nel bundle di produzione: probabilmente il CSS è rimasto e il pannello no |
| Hosting | **Vercel** dietro **Cloudflare** | VERIFICATO | header `x-vercel-id: fra1::...`, `Server: cloudflare`, `cf-cache-status`, `CF-RAY` |
| Cache | `Cache-Control: public, max-age=14400, must-revalidate` (4 ore) sugli asset | VERIFICATO | header di risposta |
| CMS | nessuno | VERIFICATO | testi, date, slug, link e temperature sono costanti dentro il bundle JavaScript |
| Immagini | nessun `.jpg`/`.webp` di contenuto | VERIFICATO | solo 4 PNG minuscoli (favicon, `perlin-datatexture.png`, `uvchecker`) e l'immagine social `social.jpg` citata nei meta |
| Modellazione / texturing | **Houdini** e **Blender**; UI in **Figma**, Photoshop, Affinity Photo; audio in **DaVinci Resolve** | dichiarato dallo studio | case study Awwwards |

Da segnalare: **il sito è una single page application pura**. L'HTML servito è di 1410 byte con `<body></body>` completamente vuoto; senza JavaScript non esiste né testo né immagine. Tutto quello che sta in questa scheda oltre ai meta tag viene dal bundle e dall'esecuzione reale, non dal sorgente della pagina.

## Peso e prestazioni

Misure mie, Playwright con Chromium **non headless** (GPU reale), rete domestica senza throttling, viewport 1440×900, DPR 1. Non ho usato Lighthouse.

**Payload**

| | valore |
|---|---|
| HTML iniziale | **1410 byte**, `<body>` vuoto |
| Risorse totali | **108 richieste** |
| Peso trasferito (`transferSize`, quindi compresso) | **17,14 MB** |
| Peso decodificato | **18,85 MB** |
| Corpi di risposta sommati per tipo | **18,39 MB** |

**Ripartizione per formato** (somma dei corpi di risposta)

| formato | richieste | peso |
|---|---|---|
| KTX2 (texture Basis) | 49 | **12,11 MB** (66%) |
| OGG (audio) | 18 | 2,80 MB (15%) |
| JavaScript | 8 | 1,75 MB |
| WASM (Basis + Draco) | 2 | 0,72 MB |
| DRC (geometrie Draco) | 22 | 0,56 MB |
| EXR (environment) | 1 | 0,25 MB |
| PNG | 4 | 0,03 MB |
| JSON | 1 | 0,02 MB |

**I dieci file più pesanti**

| peso | file |
|---|---|
| 1492 KB | `assets/audio/music-highq.ogg` |
| 1256 KB | `assets/images/scroll-datatexture.ktx2` |
| 1108 KB | `assets/images/cubes/cube3_normal.ktx2` |
| 1052 KB | `assets/images/cubes/cube1_normal.ktx2` |
| 1052 KB | `assets/images/cubes/cube2_normal.ktx2` |
| 823 KB | `assets/images/igloo/igloo_exploded_color.ktx2` |
| 817 KB | `assets/images/volumes/peachesbody_64.ktx2` |
| 615 KB | `assets/images/floor_color.ktx2` |
| 614 KB | `assets/images/igloo/ground_sansigloo_color.ktx2` |
| 611 KB | `assets/images/igloo/ground_color.ktx2` |

**JavaScript**: il chunk d'ingresso `index-2eb69c09.js` pesa **16,5 KB** ed è l'unico script nel `<head>`; il chunk pesante `App3D-f554a111.js` è **1,49 MB non compresso** ma viaggia in **brotli a 422.990 byte (413 KB)** — l'ho verificato con `curl -H "Accept-Encoding: br"`. È importato dinamicamente, quindi il loader compare prima che arrivi.

**Tempi** (una sola esecuzione, senza throttling — indicativi)

| | desktop 1440×900 | iPhone 13 emulato |
|---|---|---|
| `domContentLoaded` | 9801 ms | 5561 ms |
| `first-contentful-paint` | 9852 ms | 5600 ms |
| `loadEvent` | 9805 ms | 5599 ms |
| heap JS in uso | **223 MB** | **247 MB** |

Il FCP a ~10 secondi non è un difetto di rete: **è strutturale**. Il `<body>` è vuoto, quindi non c'è nulla da dipingere finché il modulo non ha montato il loader. Il sito accetta consapevolmente un FCP pessimo in cambio di un ingresso in scena senza sbavature.

**Il DPR adattivo — il meccanismo di difesa vero.** Ho decompilato la classe: c'è un moltiplicatore di device pixel ratio governato dagli FPS medi.

- attesa iniziale di **2 secondi** prima di iniziare a misurare;
- valuta ogni **4 secondi**, e solo con almeno **5 campioni** di FPS;
- se la media scende **sotto 30 FPS** → moltiplicatore `-0.1`, con pavimento a **0.6**;
- se la media risale **a 60 FPS o più** → moltiplicatore `+0.1`, con tetto a **1.0**;
- conta le inversioni di direzione: alla **quarta**, smette di adattarsi e scrive in console `Adaptive DPR stopped.`

Quest'ultimo dettaglio è la parte intelligente: senza il contatore, un dispositivo che oscilla intorno alla soglia continuerebbe a salire e scendere di risoluzione per sempre, e lo sfarfallio sarebbe più fastidioso del calo di FPS. Il sistema si arrende di proposito e si stabilizza.

**Altre scelte di prestazioni verificate**

- Visibilità a soglia sul progresso della timeline: interi gruppi di mesh vengono spenti appena escono dalla fascia utile, invece di essere lasciati in scena a costo zero apparente.
- Ascolto di `visibilitychange` (4 occorrenze): l'esperienza si sospende con la scheda in secondo piano.
- Testo e icone come texture SDF: nessun reflow del DOM per animare una lettera, mai.
- `renderer.info.autoReset = false`, cioè le statistiche di draw call sono raccolte a mano — segno di profiling attivo durante lo sviluppo.
- Un messaggio nel bundle recita `An idle task took too long to complete, aborting.`: esiste una coda di lavori a tempo perso (probabilmente compilazione shader e upload texture in background), coerente con quanto dichiarato nel case study.
- Precaricamento totale prima di partire: il loader non lascia entrare finché non è pronto, il che spiega perché durante l'esperienza non ci siano cali improvvisi.

**Non misurato**: Lighthouse, Core Web Vitals sul campo, FPS reali su un telefono vero, tempo di compilazione shader, tempo esatto dalla navigazione alla prima immagine della scena (nel mio test la scena era già a schermo al primo screenshot, circa 20 s dopo il `goto`, ma la soglia precisa non l'ho catturata).

## Tre cose da rubare

**1. Il DPR adattivo con contatore di inversioni.** Non "abbasso la risoluzione se va lento", ma: attendi 2 s, misura su finestre di 4 s con almeno 5 campioni, scendi di 0.1 sotto i 30 FPS fino a un pavimento di 0.6, risali di 0.1 sopra i 60 FPS fino a 1.0, **e dopo quattro cambi di direzione smetti del tutto**. La regola dell'arresto è ciò che distingue un sistema utilizzabile da uno che pulsa. Si riscrive in una cinquantina di righe sopra qualunque renderer Three.js ed è la sola ragione per cui questo sito gira su un telefono.

**2. Il testo come atlas SDF dentro il canvas, con lo scramble fatto in shader.** Invece di animare `textContent` o mascherare con CSS (che costa un reflow a ogni frame), il carattere è un atlas MSDF in una texture KTX2 e l'effetto "caratteri impazziti" è un semplice spostamento di offset sulle coordinate UV. Costo: zero lavoro sul layout del browser. Il beneficio non è solo prestazionale — è che il testo vive nello stesso spazio 3D della scena, quindi si può inclinare, sfocare col depth of field e attraversare con la camera come qualunque altro oggetto. Rifacibile con `troika-three-text` o con un atlas generato da `msdf-bmfont-xml`.

**3. Il canvas dentro uno shadow root chiuso.** Una riga: `container.attachShadow({mode:"closed"}).append(renderer.domElement)`. Isola il canvas da qualunque CSS della pagina, da estensioni del browser e da script di terze parti che vadano a caccia di `canvas`; e siccome è `closed`, nemmeno `element.shadowRoot` lo espone. Costo zero, e ho verificato che funziona davvero: mentre la scena era in movimento sotto i miei occhi, `document.querySelector('canvas')` mi restituiva `null`.

*(Bonus, se serve una quarta: il volume dell'audio calcolato come funzione continua della distanza dal portale più vicino — `fit(distanza, 0, 0.04, 1, 0)` con `power2.out` — invece che come trigger a soglia. È il motivo per cui il suono non "scatta" mai.)*

## Non verificato

- **I confini esatti fra le sezioni** in termini di pixel di scroll. Il progresso non è esposto nel DOM e la scena è continua: ho campionato a passi fissi di 2880 px di rotella e ricostruito l'ordine dagli screenshot, ma non so dove finisca uno stato e cominci il successivo.
- **Il footer con i tre link a particelle.** So dalla configurazione che esiste (`LinkedIn` → volume `peachesbody_64`, `X / Twitter` → `x_64`, `Medium` → `medium_32`, con scale 1.2 / 1.3 / 1.25) e il case study descrive il morphing al passaggio del mouse, ma nella mia cattura non l'ho raggiunto: lo scroll era già rientrato nel loop.
- **Il comportamento reale su un telefono fisico.** Ho usato l'emulazione iPhone 13 di Playwright su GPU desktop. Il confronto sul payload è solido (le richieste sono identiche), ma FPS, temperatura e consumo di batteria reali non li ho misurati.
- **Il colore preciso dei fondali scuri delle schede progetto.** Ho `#09121f` e `#222b42` nel bundle e gli screenshot sono coerenti, ma non ho isolato quale dei due sia il fondo della scheda.
- **I quattro colori caldi** (`#cda05e`, `#ab8349`, `#886a3d`, `#904619`). Sono gli unici non-freddi del progetto; presumo il becco del pinguino, ma non l'ho confermato.
- **Tweakpane.** Il CSS iniettato stila `.tp-dfwv`, che è la sua classe, ma la libreria non compare nel bundle di produzione. Probabilmente residuo di sviluppo.
- **La revisione di Three.js.** Non sono riuscito a estrarre la costante `REVISION` dal bundle minificato.
- **Lighthouse e i Core Web Vitals.** Non eseguiti.
- **Il momento esatto in cui il loader lascia il posto alla scena.** Al primo screenshot (~20 s dalla navigazione) la scena era già viva; la soglia precisa non l'ho catturata.
- **Il case study dello studio** (`https://abeto.co/work/igloo`) risponde `403` alle richieste automatiche. I dettagli di pipeline in questa scheda vengono dal case study su Awwwards.

---

### Nota di metodo

La scheda è costruita quasi tutta leggendo il bundle JavaScript (`index-2eb69c09.js`, 16,5 KB, e `App3D-f554a111.js`, 1,49 MB) scaricato con `curl`, più due esecuzioni con uno script Playwright isolato — una desktop e una in emulazione iPhone 13 — che si è chiuso da solo alla fine. La scheda del browser aperta con l'MCP è stata chiusa prima di scrivere: **nessuna scheda lasciata aperta**.

Screenshot conservati nella cartella temporanea di sessione come `ig_desk_00..12.png` e `ig_mob_00..12.png`.
