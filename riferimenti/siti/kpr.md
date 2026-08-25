# KPR

- **URL**: https://kprverse.com/ — **VIVO**, HTTP 200. Non serve nessuna ricostruzione
  d'archivio: il sito e' in piedi, aggiornato e ancora manutenuto. Prova: l'ultimo
  articolo del Journal e' pubblicato il **09/07/2026** (`New Eden Dreams: How to Play`),
  il bundle JS ha `Last-Modified: Mon, 15 Jun 2026 16:27:40 GMT`, la versione applicativa
  dichiarata nello store e' `0.0.76`.
  (Attenzione: `curl -I` sulla home torna **404 JSON** perche' il metodo HEAD non e'
  gestito dal Lambda; con GET torna 200. Chi verifica in fretta puo' concludere per
  sbaglio che il sito sia morto.)
- **Premio**: **Awwwards Site of the Day del 26/12/2022**, voto **7.98** — Design 8.10 ·
  Usability 7.47 · Creativity 8.43 · Content 8.13 — piu' **Developer Award 7.61**.
  Fonte: https://www.awwwards.com/sites/kpr
  > **Rettifica sulla consegna**: il compito diceva "Site of the Year 2022". **Non l'ho
  > potuto confermare.** Sulla scheda Awwwards di KPR compaiono solo i badge *Site of the
  > Day* e *Dev Award*; nessun *Site of the Year*, nessun *Site of the Month*, nessuna
  > *Honourable Mention*. Le pagine `awwwards.com/annual-awards-2022/site-of-the-year` e
  > `.../nominees/` rispondono 404. La pagina FWA `thefwa.com/cases/kpr` esiste ma e' un
  > guscio JavaScript senza dati nell'HTML. Quindi: **SOTD verificato, SOTY non
  > verificato** — vedi la sezione "Non verificato".
- **Studio**: **Resn** (Wellington NZ + Amsterdam). Ruolo dichiarato dallo studio:
  *"Animation, Creative, Design, Development, Illustration"*. Fonte: la scheda progetto
  dentro `https://resn.co.nz/20260721233115_1_0_a02666f/data/projects.json`, voce
  `route: kprverse`.
- **Anno**: **novembre 2022** (`date: November 2022` nel file di Resn). Il contenuto del
  CMS mostra le prime pubblicazioni il **18/08/2022** e l'ultima il **09/07/2026**.
- **Letto il**: 13/08/2026

> **Nota di metodo — come ho letto questo sito senza aprirlo**
>
> KPR e' una applicazione **Nuxt 3 con rendering lato server**. Ho scaricato l'HTML con
> `curl` e dentro ci sono due cose diverse:
> 1. **il markup visibile**, che e' quasi vuoto (876 caratteri di testo utile: la home
>    *non* consegna contenuto al primo caricamento);
> 2. **`window.__NUXT__`**, uno script inline da **494.943 byte** con dentro
>    **tutto il contenuto del CMS Storyblok**: testi della home, nav, footer, i 52
>    comandi segreti della console, i 36 articoli del Journal, le pagine About e
>    Protocol.
>
> Ho decodificato quel payload con Node (`eval` in sandbox) e l'ho riversato in JSON:
> da li' vengono **tutti i testi virgolettati** di questa scheda. Le meccaniche
> (scroll, tenuta del click, WebGL, audio) vengono dalla lettura dei chunk
> `/_nuxt/*.js` e `/_nuxt/*.css` scaricati singolarmente. **Non ho aperto nessuna
> scheda del browser.** Quello che non si legge nel codice lo dichiaro come tale.

---

# L'ESPERIENZA

## Cosa tratta il sito

E' il sito di lancio di **KPR (si legge "Keeper")**, un progetto di intrattenimento
Web3: un **mondo narrativo inventato** — "New Eden" — piu' una **collezione di 10.000
personaggi digitali** (NFT su Ethereum) che di quel mondo sono gli abitanti.

Dentro, in concreto, ci sono:

1. **Una home che e' un racconto a scorrimento** di circa **17 schermate**, divisa in
   nove capitoli: atterraggio, introduzione alla storia, la storia, la collezione,
   la galleria dei personaggi, e poi **tre "tableaux"** — Il Keep, le Fazioni, il Mondo —
   e infine il lancio.
2. **Una galleria vera con tutti e 10.000 i personaggi**, filtrabile per **13 categorie
   di tratti** (Ear, Entity, Eyes, Face, Hair, Headgear, Hand, Innerwear, Mouth, Neck,
   Outerwear, Special, Tattoo) per un totale di **373 valori distinti** — il sito ne
   dichiara *"over 400"*. Ogni scheda ha il link a OpenSea.
   Fonte: `https://metadata.kprverse.com/gallery.json`, 1.355.239 byte.
3. **Una pagina "Protocol"**: cinque capitoli (Vision, World, Characters, Portal, Union)
   con **la voce di una intelligenza artificiale narrante**, in cinque file mp3
   (`protocol-intro.mp3`, `protocol-chapter1-vision.mp3` … `chapter5-union.mp3`) e un
   testo sovrapposto che dice cose come *"Welcome, Traveler, to this space between
   worlds. We are the Protocol and we have been waiting for you."*
4. **Un Journal con 36 articoli**, dal 18/09/2022 (`Our Origin Story`) al 09/07/2026
   (`New Eden Dreams: How to Play`). E' il segno che il sito e' rimasto vivo per quasi
   quattro anni.
5. **Una console segreta con 52 comandi** che si apre con il tasto **`** (backtick) e
   sputa fuori pezzi di storia, immagini e scherzi interni.
6. Pagine About (squadra di 10 persone con pseudonimo), Media, Gallery, una pagina
   Registration collegata al wallet, e i legali.

## Cosa vende, e qual e' l'obiettivo finale

**Il prodotto vero non e' il sito e non e' nemmeno "l'arte": e' la credibilita' di un
marchio nuovo, misurata in una vendita che doveva chiudersi in pochi minuti.**

Lo dice Resn stessa, senza giri di parole, nella pagina di caso studio:

> *"The challenge with KPR was to build a living world with a rich story and digital
> collectibles that allow visitors to be active participants in the narrative. We aimed
> to connect imagination to reality through layered interactive content and community
> engagement, **establishing KPR's relevance and credibility for enthusiasts and
> investors alike**."*

E il risultato, sempre dichiarato da Resn:

> *"KPR made an enormous impact in the Web3 space and beyond, earning numerous awards
> and accolades. It also proved to be a successful launchpad for the KPR brand and mint.
> Phase one of the mint ran for 24 hours before opening to the general public in phase
> two. **Within the first minute of phase two, all 10,000 KPR digital collectables were
> sold out**, firmly establishing KPR as a credible and desirable new brand in the Web3
> space."*

Quindi:

- **Obiettivo dichiarato dal sito**: farti entrare in un mondo, farti diventare "un
  Keeper", farti *sentire parte* di una storia collettiva.
  Testo: *"KPR is a brand that focuses on collective narrative and empowering
  storytellers. Keepers is a living story, an uncharted world waiting to be explored,
  to be imagined."*
- **Obiettivo vero, al momento del lancio (2022)**: **vendere 10.000 oggetti digitali a
  gente che compra sulla fiducia.** In quel mercato il compratore non puo' valutare il
  prodotto (non esiste ancora), quindi valuta **la serieta' di chi lo fa**. Il sito e'
  la prova di serieta'. Un sito da 20.000 euro dice "questi non spariscono domani"
  meglio di qualunque whitepaper.
- **Obiettivo secondo, e non minore**: **vincere premi**. La densita' di effetti, il
  peso degli asset e le scelte che rompono l'usabilita' (vedi sotto: il sito si rifiuta
  di funzionare se la finestra e' stretta) sono decisioni da giuria, non da conversione.
  Il voto Awwwards lo conferma: Creativity 8.43, **Usability 7.47** — il punteggio piu'
  basso della scheda.

Il contratto e' pubblico dentro la configurazione dell'applicazione:
`CONTRACT_ADDRESS: 0x2d33Bfe1c867346543Ac245396DFc6c3EBc8534F`, `CONTRACT_CHAIN_ID: 1`
(Ethereum mainnet), `CONTRACT_TOKEN_ID_SHIFT: 5022`.

**Cosa succede oggi, nel 2026.** Il pulsante finale non vende piu' niente: la sezione
"Launch" e' rimasta con la data **"09 / 09"** e l'etichetta **"Launch Sep 9"**, mentre
la sezione della collezione dice **"Launch at TBA"**. Due date incoerenti congelate in
produzione da quattro anni. La conversione oggi passa da **OpenSea** (link in nav) e da
**Discord**. Il sito e' diventato **un monumento al lancio**, non piu' uno strumento di
vendita.

## A chi

**Due compratori, molto diversi, sulla stessa pagina.**

1. **Il collezionista/speculatore Web3 del 2022.** Sa gia' cos'e' un mint, ha il wallet
   pronto, e ha visto cento progetti sparire con i soldi. **Cosa teme:** che sia
   l'ennesima truffa fatta in due settimane. **Cosa gli si risponde:** un sito che
   costa evidentemente moltissimo, una squadra con curriculum verificabili (EA, Nexon,
   Riot Games, The Sims 4, Titanfall, League of Legends), 400 asset dipinti a mano,
   cinque capitoli di lore scritti sul serio. **Non gli si vende l'immagine: gli si
   vende il costo di produzione**, come prova che nessuno scappa.
2. **Il curioso che arriva da Awwwards o da Twitter.** Non comprera' niente. Serve a
   fare numero, rumore e premi.

**Cosa deve pensare uscendo:** *"questi hanno costruito un mondo intero, non una
collezione di immagini"*. E, sotto: *"qui c'e' dentro talmente tanto lavoro che non
possono permettersi di sparire"*.

## L'esperienza progettata

E' **una discesa dentro un mondo**, non una vetrina. La regola che governa tutto:
**scorrere fa avanzare il racconto, tenere premuto apre una seconda dimensione dentro la
stessa scena.**

Resn la descrive cosi':

> *"We used interactive tableaux — The Keep, the Factions, and the World — to immerse
> users in the KPR universe. By **seamlessly expanding or contracting dimensions**, we
> give visitors the impression of moving between realities as they scroll through the
> site. **Click-and-hold interactions reveal new layers of content**, enhancing the
> already rich experience."*

E:

> *"Our vision was to play with notions of perception and perspective by combining **3D
> characters and 2D design elements with an interactive layer that revealed a hidden
> dimension**."*

**Cosa deve fare il visitatore, passo per passo:**

1. **Aspettare.** Il precaricamento non e' saltabile. Mentre aspetta gli viene chiesta
   una cosa sola: *"Click to Enable Sound"*. L'audio parte **spento** (`isMuted: true`)
   e il primo gesto che il sito chiede non e' comprare: e' **accendere il suono**.
2. **Scorrere.** Per circa diciassette schermate.
3. **Tenere premuto.** Nei tre tableaux compare un mirino con scritto **"CLICK & HOLD"**
   (su telefono: **"TAP & HOLD"**). Se tiene premuto, sopra la scena si apre uno strato
   di grafiche tecniche — scansioni, letture di sensori, trasmissioni — e l'anello
   intorno al mirino si riempie man mano.
4. **Facoltativo, e nascosto: premere il tasto `**. Si apre un terminale finto dove
   digitare **52 comandi segreti** e leggere pezzi di storia che nel sito non stanno da
   nessuna parte.
5. **Alla fine**, il pulsante di lancio, e la nav laterale verso Gallery / Journal /
   Protocol / OpenSea.

**Il ritmo.** Il sito ha una alternanza precisa, leggibile dalle altezze CSS delle
sezioni (vedi tabella piu' avanti): **capitoli brevi da 1–1,5 schermate** per i testi,
e **capitoli lunghi da 2,7 schermate** per i tre tableaux. I tre tableaux sono lunghi
identici — 270vh ciascuno — cioe' **il ritmo e' scritto nel CSS come un ritornello**:
tre blocchi uguali, uno dietro l'altro, che occupano da soli **la meta' dell'intera
pagina** (810vh su ~1690).

**L'immagine che resta in testa:** un personaggio dipinto a mano, fermo dentro una
scena, e sopra di lui — mentre tieni premuto — una griglia di strumenti che lo sta
misurando. Il mondo si guarda, e mentre lo guardi ti accorgi che **anche lui e'
sorvegliato**.

## Come e' organizzata la persuasione

**Dove sta la promessa.** Subito, prima schermata, tre parole in colonna:
**Keep / Protect / Reimagine**, e sotto la frase di posizionamento. Zero scroll.

**Dove sta la prova.** E' distribuita e non e' mai un elenco di argomenti:

- **La prova che il mondo esiste**: i tre tableaux, 810vh di scene disegnate con
  didascalie da rapporto tecnico (`smog-level-scan`, `air-quality-index`,
  `kai-fusion-reactor`, `mining-area-scan`, `keep-cargo-ships`). Nessuno legge quelle
  didascalie. **Servono a esistere, non a essere lette.**
- **La prova che il prodotto e' fatto bene**: la sezione collezione — *"10,000 unique
  digital collectibles… born, endowed with attributes from a collection of over 400
  meticulously hand-painted assets"* — piu' la galleria vera con tutti e diecimila.
- **La prova che dietro c'e' gente seria**: la pagina About, con i curriculum
  (EA, Nexon, Riot Games, Chanel, IBM, Nintendo, TreasureDAO).
- **La prova sociale**: il contatore **"28 Keepers Live"** in basso.
  ⚠️ **E' finto.** Nel chunk `live-counter.c24e0c86.js` il valore e' scritto a mano:
  `const f = computed(() => 28)`. Non c'e' nessuna chiamata di rete. **Verificato.**

**Dove sta il prezzo.** **Da nessuna parte.** Non c'e' un prezzo, non c'e' un "compra".
C'e' una data (**"Launch Sep 9"**) e un link a OpenSea nel menu. In quel mercato il
prezzo si annuncia su Discord, non sul sito: **il sito e' il volantino, la vendita
avviene altrove.**

**Dove sta la chiamata all'azione.** Tre, in ordine di importanza reale:

| CTA | dove | quante schermate ci vogliono |
|---|---|---|
| *"Click to Enable Sound"* | nel precaricamento | 0 — prima di tutto |
| *"CLICK & HOLD"* | nei tableaux | ~6 |
| Il pulsante di lancio + *"What path will you forge as you become the Keeper of your destiny?"* | ultima sezione | **~16–17** |
| *"Share your idea"* → `discord.gg/kpr` | fondo della pagina Protocol | altra pagina |

**E cosa arriva a chi NON scorre fino in fondo — cioe' quasi tutti.**

Arriva **quasi tutto il messaggio identitario e zero del messaggio commerciale.**
Nella prima schermata ci sono le tre parole del marchio e la frase che spiega cos'e'
KPR. Chi si ferma li' sa che esiste un mondo narrativo collettivo. **Non sa che si puo'
comprare qualcosa, non sa quanto costa, non sa quando.** Il che, per un lancio NFT del
2022 in cui il pubblico arrivava gia' informato da Discord e Twitter, era una scelta
difendibile: **il sito non doveva convincere a comprare, doveva togliere il sospetto.**

C'e' pero' un difetto vero e misurabile: **il visitatore che apre il sito con una
finestra stretta non vede niente del sito.** Vedi la sezione Mobile.

## Idea regista

**Ogni scena ha due strati: quello che guardi, e quello che si vede solo se tieni
premuto — il mondo e la sua sorveglianza.**

## Il momento

**Il "click & hold" nel primo tableau (Il Keep), intorno alla settima schermata di
scroll.**

Fin li' hai solo scorso. Compare un mirino con quattro tacche e la scritta
**CLICK & HOLD**. Se tieni premuto:

- l'anello attorno al mirino **si riempie in funzione dell'avanzamento della sequenza**
  — verificato: `this.btnHold.props.draw = this.tlSequence.progress()`;
- sopra la scena si apre il **secondo strato**, un insieme di grafiche `.webp`
  caricate da `/images/tableau/{keep|factions|universe}/second-layer/flow-{n}/set-{n}/`;
- parte un suono (`FX_flow_transition_IN_*.mp3`, rilascio `FX_flow_transition_RELEASE.mp3`).

E' il momento in cui il sito smette di essere un video e diventa **uno strumento**.

**Se non tieni premuto non succede niente e il sito funziona lo stesso** — il che e'
la ragione per cui la meccanica e' onesta e non punitiva, ma anche il motivo per cui
molti visitatori non la scoprono mai.

## Struttura, sezione per sezione

Altezze **verificate** leggendo `Home.3f2d3f45.css` (`.homePage .<nome>Ref{height:…}`).
Su desktop `1rem = 10px` (`html{font-size:10px}`), quindi `212rem ≈ 212vh` su uno
schermo alto 1000px.

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate) |
|---|---|---|---|
| Preloader | barra di avanzamento, nomi di file finti che scorrono, invito ad accendere l'audio | aspetta, e clicca per il suono | fuori scroll |
| `landingRef` — **HomeLanding** | logo animato (spritesheet 101 fotogrammi), le tre parole *Keep / Protect / Reimagine*, la frase di posizionamento, indicatore di scroll | guarda, poi scorre | **1,0** |
| `projectIntroRef` — **HomeStoryIntro** | titolo *"A familiar world… Set on a different path."*, immagini di personaggi con didascalia *"Animus character"*, il trailer con didascalia *"Trailer V.004"* | scorre; puo' aprire il video | **1,5** |
| `projectStoryRef` — **HomeStoryProject** | *"You are a Keeper…"*, terminale finto con coordinate `N 35°27.37 / E 139°38.57` e temperatura `33.8°` | scorre | **2,1** (mobile 1,1) |
| `collectionIntroRef` — **HomeCollectionIntro** | *"Initial Collection · 10K"*, *"Launch at TBA"*, video del cristallo, didascalie *"Kai Crystal"*, *"Windows to the Soul"* | scorre | **1,2** |
| `collectionGalleryRef` — **HomeCollectionGallery** | *"10,000 unique digital collectibles."* + carosello verticale di personaggi (frecce su/giu', tre suoni diversi) | scorre, oppure clicca le frecce | **1,5** |
| `keepRef` — **HomeTableauxKeep** | tableau 1: *"the keep"*, 6 strati × 3 flussi di grafiche/video | **tiene premuto** | **2,7** |
| `factionsRef` — **HomeTableauxFactions** | tableau 2: *"2 factions"*, 6 strati × 4 flussi | **tiene premuto** | **2,7** |
| `universeRef` — **HomeTableauxUniverse** | tableau 3: *"the world"*, 5 strati × 3 flussi (marchi finti: BOON, NEON, KLMX) | **tiene premuto** | **2,7** |
| `launchRef` — **HomeLaunch** | numeri giganti `09` `09`, *"Launch Sep 9"*, la domanda finale, tre link ai tableaux | clicca | **1,5** |
| Footer | nav, social, *"Download Brand Book"*, `hello@kprverse.com`, legali | clicca | — |

**Totale ≈ 16,9 schermate su desktop.** I tre tableaux da soli fanno **8,1 schermate,
cioe' il 48% dell'intera pagina.**

## L'esperienza in ordine di tempo

### I primi dieci secondi

Ricostruiti dal codice del preloader (`preloader.56cd92f8.js`) e del landing
(`Home.17c0ce45.js`). **I tempi assoluti dipendono dalla rete**: sono asset pesanti e
il precaricamento aspetta `LOAD_COMPLETE`, quindi su una connessione lenta questa fase
dura molto piu' di dieci secondi.

- **0,0 s** — Schermo nero. In alto una barra sottile che si allunga
  (`transform: scaleX(progress)`), a sinistra un'icona a triangoli e la scritta
  **"LOADING - 0%"**.
- **0,0–0,4 s** — A destra comincia a scorrere una lista di **32 percorsi finti**, uno
  ogni **150–400 ms scelti a caso** (`randomInt(150,400)`). Testuali:
  `HTTPS://KPRVERSE.COM/KPCO/KAI-14/REACTOR/ISOTOPE-C/43LK2L`,
  `HTTPS://KPRVERSE.COM/KPCO/AREA-SCAN/CO2_LEVELS`,
  `HTTPS://KPRVERSE.COM/WEAPONS/GRADE-4/TITANIUM_SWORD/DURABILITY`,
  `INITIALIZING SYSTEM…..12`, `INITIALIZING SYSTEM…..48`, `INITIALIZING SYSTEM…..72`,
  `READY`, `LOADING ATTRIBUTES`.
  **Nessuno di questi indirizzi e' reale.** E' teatro di caricamento: comincia a
  raccontare il mondo mentre il mondo si carica.
- **0,2 s in poi** — Al centro compare un anello con dentro l'icona dell'audio e la
  scritta **"Click to Enable Sound"** (su telefono **"Tap to Enable Sound"**).
  **Su desktop l'anello insegue il puntatore** con un inseguimento morbido
  (`ease: 0.4`), partendo da meta' larghezza e tre quarti di altezza. Il cursore
  di sistema viene nascosto (`.no-cursor`) finche' l'audio e' muto: **l'anello
  *diventa* il cursore.**
- **fino a caricamento completo** — la percentuale sale. Non c'e' modo di saltare.
- **all'arrivo** — dissolvenza del preloader (`autoAlpha`), poi:
  - parte `FX_logo_intro_animation.mp3` (137.642 byte) — se l'utente ha acceso l'audio;
  - il logo si compone da uno **spritesheet di 101 fotogrammi** (`logo-anim-low-res-0`,
    atlante 2048×2048 fatto con TexturePacker), mentre un secondo foglio
    (`header-sprite`, **131 fotogrammi**) anima la testata;
  - entrano in sequenza le tre parole `Keep`, `Protect`, `Reimagine` (tre elementi
    `.js-title`), poi la frase di posizionamento;
  - compare l'indicatore di scroll (**solo desktop**);
  - lo scroll morbido, che era in pausa (`scroller.paused(true)`), viene sbloccato.

### Il resto, a blocchi

- **Blocco 1 (schermate 1–2,5) — "il mondo e' rotto".** Titolo
  *"A familiar world... Set on a different path."*, corpo *"Isolated within the New Eden
  safe zone, you witness humanity struggling to avoid descending into chaos."*
  Compare il trailer (`keepers-teaser-1080.mp4`, **19,3 MB**) con la didascalia
  *"Trailer V.004"* — cioe' **la versione del file e' parte della grafica**.
- **Blocco 2 (2,5–4,6) — "e tu chi sei".** *"You are a Keeper: an agent of power and
  change in this world."* / *"What will you do with this power? Will you choose to
  protect or destroy? To give or to take?"* Accanto, un terminale che finge di caricare:
  `//Initializing / Keeper Story / Loading...[47%] / Location_Data /
  Character_Attributes / KLMx Transmissions`. **Il 47% e' fisso**: non arrivera' mai a
  100. E' l'unica frase del sito che pone una **domanda morale**, ed e' messa esattamente
  a meta' della prima parte.
- **Blocco 3 (4,6–5,8) — "cosa si compra".** `Initial Collection`, `10K`,
  `Launch at TBA`. Video di un cristallo. Didascalie *"Kai Crystal"* e
  *"Windows to the Soul"*.
- **Blocco 4 (5,8–7,3) — "guarda quanti sono".** *"10,000 unique digital collectibles."*
  con la spiegazione dei 400 asset dipinti a mano. Carosello verticale di personaggi,
  con tre suoni diversi a rotazione (`FX_character_carousel_1/2/3.mp3`).
- **Blocchi 5–7 (7,3–15,4) — i tre tableaux.** Uguali per durata, diversi per contenuto:
  - **The Keep** — *"The last stronghold of all knowledge. The Keep is where all the
    value accrues. A place to wonder, protect, and fight for."* Sottotitolo
    *"most needed"*. Sei strati: reattore a fusione Kai, area montuosa, topografia,
    scansione della torre, macchinari minerari, indice della qualita' dell'aria, navi
    cargo, livello di smog, logo KPCO.
  - **Factions** — *"One world, two factions. Divided in belief, united in purpose."*
    Sottotitolo *"divided"*. Sei strati su **quattro** flussi: loghi Animus e Prisma,
    scansioni dei due personaggi, componenti di elisir, spada al silicio, arco in fibra
    di carbonio, spada in titanio grado 4, spada di cristallo bianco.
  - **The World** — *"The discovery of Kai, the world's primordial energy source,
    heralded mankind's Golden Age. Or so they believed."* Sottotitolo *"whole new"*.
    Qui il mondo si fa **quotidiano**: noodles BOON, un piatto di salmone NEON, una
    recensione, un imballaggio, la classifica settimanale, un trasmettitore portatile
    KLMX. **E' il colpo migliore della narrazione: dopo due tableaux di armi e reattori,
    il terzo ti fa vedere il cibo da asporto.** Un mondo diventa credibile quando ha
    marchi di cibo spazzatura.
- **Blocco 8 (15,4–16,9) — il lancio.** Due numeri giganti `09` e `09` (carattere
  Hexaframe a **50,4rem = 504px**), la scritta *"Become a Keeper"*, la domanda
  *"What path will you forge as you become the Keeper of your destiny?"*, e tre link
  che rimandano indietro ai tableaux (`The Keep`, `Factions`, `The World`).
- **Poi il footer**, con `Download Brand Book` (uno zip su Storyblok), l'indirizzo
  `hello@kprverse.com`, e il terminale del footer che dice:
  `// initializing / new files in database / kai_53815.jpg / audio_log_2018116.wav /
  activate console for access...` — **l'unico indizio, nel sito, che la console esista.**

---

# LA PARTE TECNICA

## Animazioni

| elemento | cosa si muove | legato a | curva / inerzia | note |
|---|---|---|---|---|
| Scroll dell'intera pagina | tutto | — | **GSAP ScrollSmoother**, `smooth: 1`, `effects: false` | **VERIFICATO** in `the-smooth-scroll.6f06ac0c.js`. Parte in pausa (`paused(true)`) e viene sbloccato a caricamento finito. Il sito calcola anche la velocita': `Math.abs(scroller.getVelocity()) > 20` → stato "sto scorrendo" |
| Sezioni della home | ogni sezione ha la sua linea del tempo | ScrollTrigger | `start: "top top+=1px"` / `end: "bottom top"` (una variante `"top bottom-=1px"`) | **VERIFICATO**: `stStart`/`stEnd` in `Home.17c0ce45.js` |
| Scene dei tableaux | camera, strati, personaggi, effetti | scroll → `tlSequence.progress(n)` | mappatura con `clamp` su `1.2 × vh` | Il tempo della sequenza e' esposto come `props.tSequence`: **e' una linea del tempo scrubata, non una animazione a tempo** |
| Anello del "CLICK & HOLD" | l'anello si disegna | **tenuta del click** | `draw = tlSequence.progress()` | **VERIFICATO**. Su mobile diventa una barra orizzontale |
| Secondo strato dei tableaux | grafiche `.webp` che entrano | tenuta del click | timeline GSAP annidata (`e.add(s.createTimeline(), 0)`) | percorsi `second-layer/flow-{n}/set-{n}/{prefisso}.webp` |
| Logo e testata | 101 e 131 fotogrammi | tempo, all'ingresso | — | **Spritesheet TexturePacker**, atlanti 2048×2048, non 3D |
| Effetti dei tableaux (kai, raggi, capelli, stoffa, navi, bagliore del cielo) | animazioni disegnate | scroll | — | Anche questi **spritesheet**: `kai_fx`, `rays_fx`, `magic_fx`, `beams_fx`, `female_hair_fx`, `male_hair_fx`, `female_cloth_fx`, `ship_fx`, `sky_glow_fx`, `energy_left_fx`, `energy_right_fx`, `lower_beam_fx` |
| Coreografia degli strati | posizioni e tempi | dati esportati da After Effects | — | **`/data/2ndlayer.ae.json`, 76.333 byte.** La composizione AE e' esportata e rigiocata a schermo |
| Testo "hacky" | lettere che si rimescolano prima di posarsi | ingresso in vista (ScrollTrigger) | — | `hacky-text.e29ccd00.js`, usato su didascalie e contatori |
| Console che si apre | sfondo che si allarga in orizzontale + contenuto che sfarfalla | stato | `power2.inOut` per `scaleX`; per il contenuto **`rough({strength: 4, points: 50, clamp: true, template: power2.out})`** | **VERIFICATO** in `the-console.705b3b85.js`. E' la curva "rough" di GSAP: fa vibrare l'opacita' come un tubo catodico che si accende |
| Anello dell'audio nel preloader | insegue il puntatore | mouse | inseguimento con smorzamento `ease: 0.4` | **Solo desktop**, escluso se `isMobile` |
| Passaggi fra pagine | tendina | rotta | — | `transition-wipe.95a52aec.js` |
| Suoni all'hover | campione audio su entrata/uscita | hover | — | `hover-sfx.90813991.js` con **Howler.js**; `/audio/UI_menu_rollover.mp3` |

**Curve dichiarate nel CSS** (variabili, `entry.6ad9710f.css`): `--ease-in/out-quad`,
`-cubic`, `-quart`, `-quint`, `-back`, `-expo`, `--ease-in-out-sine`. Le piu' usate nei
tween JS: `expo`, `power4`, `power3.out`, `power2.inOut`, `none`.

## Colori

Il fatto piu' importante: **il livello HTML della home e' in bianco e nero.** Tolto il
blocco di temi morto (vedi sotto), in `Home.3f2d3f45.css` restano **17 dichiarazioni
`#fff`, 8 `#000`**, piu' tre bordi `hsla(0,0%,100%,.2)`. **Tutto il colore del sito sta
dentro le immagini e dentro WebGL, non nel CSS.** E' una scelta netta: l'interfaccia non
compete con il mondo.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| Fondo / vuoto | `#000` | fondo pagina, preloader, console |
| Testo, linee, mirini, tipografia | `#fff` | tutta l'interfaccia della home |
| Linea chiara | `hsla(0,0%,100%,.2)` (`--line-light`) | bordi dei riquadri, tacche |
| Linea scura | `rgba(0,0,0,.1)` (`--line-dark`) | sezioni a tema chiaro (`.lightTheme`) |
| Velo bianco | `#fff3` (bianco 20%) | sovrapposizioni |
| Velo nero | `#0003` (nero 20%) | sovrapposizioni |
| **Accento verde acido** | **`#c0fb50`** (`--cl-green`) | dichiarato in `:root` |
| **Accento lavanda** | **`#968adf`** (`--cl-lavender`) | dichiarato in `:root` |
| Errore | `#b83e35` (`--cl-error`) | messaggi di errore del wallet |
| Debug | `hsla(0,0%,100%,.3)` (`--cl-debug`) | riquadri di sviluppo |
| Colore dominante secondo Awwwards | `#6D64A3` | **dichiarato da Awwwards**, non letto dal CSS: e' la media delle immagini. Coerente con il lavanda |

> **Trovata:** dentro `entry.css` e `Home.css` c'e' **un intero sistema di temi che non
> appartiene a questo sito** — `[theme=banana]`, `[theme=tangerine]`, `[theme=cilantro]`,
> `[theme=bluekale]`, `[theme=strawberry]`, `[theme=asparagus]`, `[theme=eggplant]`,
> `[theme=aqua]`, `[theme=lime]` — che rimandano a variabili **mai definite**
> (`--cl-offwhite-400` compare **38 volte come `var()` e zero volte come definizione**).
> E' CSS morto ereditato da un altro progetto o da un modello di partenza dello studio,
> spedito a tutti i visitatori su ogni pagina. **VERIFICATO.**

## Tipografia

`html { font-size: 10px }` fisso (e `html.remlock` lo blocca a 10px con `!important`):
**nessuna tipografia fluida**, i corpi cambiano solo al passaggio sotto i 768px.

| livello | famiglia | peso | corpo (desktop → mobile) | interlinea | note |
|---|---|---|---|---|---|
| `type-dh1` (numeri giganti del lancio) | **Hexaframe** | 700 | **50,4rem = 504px** | 0.87 | `letter-spacing: -.095em`, `font-feature-settings:"zero" on` (lo zero sbarrato) |
| `type-h0` | **ABCWhytePlus** | 700 (mobile 900) | 8rem → 4,8rem | 0.87 → 1 | `-.075em` |
| `type-h1` | ABCWhytePlus | 650 (mobile 900) | 5,2rem → 2,5rem | 0.9 → 0.95 | **maiuscolo**, `-.07em` |
| `type-h2` | ABCWhytePlus | 600 | 3,6rem → 2,8rem | 0.85 | maiuscolo |
| `type-h3` | ABCWhytePlus | 573 (mobile 600) | 2,2rem → 1,6rem | 0.975 | **peso 573**: e' un font variabile, il peso e' un numero qualunque |
| `type-body1` | ABCWhytePlus | 400 | 1,5rem → 1,2rem | 1.3 → 1.2 | corpo dei testi |
| `type-body2` | **ABCWhyte** | 350 | 1,8rem → 1,5rem | 1.5 → 1.3 | testi lunghi (Journal) |
| `type-caption2` | **IBMPlexMono** | 450 | 0,9rem → 0,8rem | 1.1 | maiuscolo — **e' il carattere di tutta l'interfaccia "da macchina"** |
| `type-caption3` | IBMPlexMono | 400 | 1rem | 1.1 | maiuscolo |
| `type-caption4` | IBMPlexMono | 400 | **11px** (fisso) | 1 | maiuscolo |
| `type-btn` | IBMPlexMono | 450 | 1,1rem → 0,9rem | 0.85 | maiuscolo |
| `type-gallery` | IBMPlexMono | 450 | 1,1rem | 0.85 | `-.04em` |
| `type-citizen-title` | **PP Fraktion Sans** | 700 | 1,2rem → 1rem | 1.1 | area "cittadino"/wallet |
| `type-citizen2` | PP Fraktion Sans | 500 | 1,1rem | 1.1 | |

**Come sono serviti i font — tutti locali, tranne uno.**

- **Variabili, auto-ospitati**, in tre formati a cascata (`woff2-variations`, `woff`,
  `ttf`), con `font-stretch: 50 300` e `font-weight: 125 950`:
  **ABC Whyte**, **ABC Whyte Plus**, **ABC Whyte Inktrap** (della fonderia Dinamo).
  `ABCWhyteVariable.woff2` pesa **191.416 byte**.
- **Statici, auto-ospitati**: **Hexaframe CF Bold** (`.otf` — formato pesante e non
  ottimizzato per il web), **IBM Plex Mono** in 4 pesi (**tutti `.ttf`**, non woff2),
  **PP Fraktion Sans** Medium e Bold (`.ttf`).
- **Esterno**: la primissima riga del CSS e'
  `@import "https://fonts.googleapis.com/css2?family=Noto+Sans+JP…+SC…+TC…"`.
  **Un `@import` a Google Fonts in cima al foglio principale blocca il rendering** — e
  serve solo alle tre localizzazioni asiatiche (`[lang=ja-jp]`, `[lang=zh-cn]`,
  `[lang=zh-tw]`), che il visitatore inglese non usera' mai. **VERIFICATO.**

Il `font-feature-settings: "zero" on` su tutti i livelli e' il dettaglio piu' fine di
tutta la tipografia: **lo zero barrato**, quello dei terminali. E' cio' che fa sembrare
"tecnica" ogni cifra del sito.

## Testi veri

**Landing**
> Keep
> Protect
> Reimagine
>
> KPR is a brand that focuses on collective narrative and empowering storytellers.
> Keepers is a living story, an uncharted world waiting to be explored, to be imagined.

**Introduzione alla storia**
> A familiar world... Set on a different path.
>
> Isolated within the New Eden safe zone, you witness humanity struggling to avoid
> descending into chaos.
>
> *(didascalie)* Trailer V.004 · Animus character · Animus Character

**La storia**
> You are a Keeper: an agent of power and change in this world.
>
> What will you do with this power? Will you choose to protect or destroy? To give or
> to take?
>
> *(terminale)* //Initializing / Keeper Story / Loading...[47%] / Location_Data /
> Character_Attributes / KLMx Transmissions
> *(coordinate)* N 35°27.37 / E 139°38.57 — *(temperatura)* 33.8°

**Collezione**
> Initial Collection · 10K · Launch at TBA
> *(didascalie)* Kai Crystal · Windows to the Soul
>
> 10,000 unique digital collectibles.
> Every Keeper is born, endowed with attributes from a collection of over 400
> meticulously hand-painted assets. They are personable, iconic possessions that
> represent KPR's foundational pillars of evolution, inclusion, and imagination.

**I tre tableaux**
> **The Keep** — The last stronghold of all knowledge. The Keep is where all the value
> accrues. A place to wonder, protect, and fight for.
>
> **Factions** — One world, two factions. Divided in belief, united in purpose.
>
> **The World** — The discovery of Kai, the world's primordial energy source, heralded
> mankind's Golden Age. Or so they believed.
>
> *(titoli a schermo)* the keep / 2 factions / the world
> *(sottotitoli)* most needed / divided / whole new
> *(numerazione)* 001 · 002 · 003

**Lancio**
> Become a Keeper
> 09 09 — Launch Sep 9
> What path will you forge as you become the Keeper of your destiny?

**Menu (nav)**
> Discover: Story · Protocol · Journal · Media · Gallery · About
> Connect: Twitter · Discord
> Buy On: Opensea

**Footer**
> Discover More: Story · Journal · Media · Gallery · About · Careers
> Join the Conversation: Twitter · Discord
> More Details — Want to learn more about how we collaborate with partners?
> Contact us at hello@kprverse.com
> Download Brand Book
> Privacy Policy · Terms of Service · Legal License
> © 2022
>
> *(terminale del footer)*
> // initializing / new files in database / kai_53815.jpg / audio_log_2018116.wav /
> activate console for access...

**Console** (si apre col tasto `` ` ``)
> keep mainnet version 6.5.3
> copyright(c) 2434–2864 kpr inc.
> all rights reserved.
>
> K:/root
> !COMMANDS
>
> *(barra in alto)* Encrypted Protocol / nz49-61208762 — Keep Mainnet
> *(campo)* Type Your Command
> *(comando sbagliato)* /The Command "xxx does not exist. Please try again.
>
> *(elenco comandi, aggiornato al 25.07.2024)*
> !NEWS · !PROTECT · !MOTHER · !TALK · !KLMX · !KPCO · !NEON · !BOON · !PAMP ·
> !ACTIVATE · !REVEAL · !DEFILED · !MOLTEN · !REVENANT · …
>
> *(titoli di alcune finestre)* "Hello from Pamp the Cyborg Bunny" · "WEN BOON?" ·
> "The secret stash"

**About**
> KPR IS
> A brand for the metaverse, focusing on collective narrative. Our world brings together
> art, stories and people to reimagine a new genre of media and entertainment.
>
> // What KPR is About — TEAM
> KPR is reimagining how stories are being told and experienced.
> You, the Keepers, will breathe life into this world, explore its secrets, and forge
> its future. Together, we will empower the very essence of Web3, which is technology,
> community and culture.
> Are you ready to be a Keeper?
>
> OUR VALUES & MARK — WHAT KPR STANDS FOR — // OUR FOUNDATIONAL PILLARS
> When our aims and values are clear, they translate into tangible change.
>
> **Keep.** KPR is built on integrity, professionalism, and humility. The Keepers story
> represents a shared history, creating a foundation for our continued quest for
> excellence. We learn, we adapt, and we keep evolving.
>
> **Protect.** The community is the center of everything that we do. We believe in the
> power of inclusion and diversity of experience and it is through mutual understanding,
> empathy and respect that we will thrive together.
>
> **Reimagine.** Keepers are windows into a new world, symbols of transformation, and
> embody our hopes for the future. We display them with pride as we push each other to
> reimagine possibilities in physical and digital realities.
>
> Join the Keep. Find your voice. Your indelible mark. Our story.
> // let's forge the future together.

**Protocol** (la voce dell'IA, sovrapposta ai capitoli)
> Welcome, Traveler, to this space between worlds. We are the Protocol and we have been
> waiting for you.
> Initializing….
> Keep. Protect. Reimagine.
> These were the words of our creators and the tenants on which the New Eden safe zone
> was founded. A world built by survivors to empower the next generation to forge their
> own path and to escape the follies of the past.
> We will see.
>
> *(chiusura)* This world will evolve with you. — Built together
> The future is ours to create. […] KPR is a living dream, an uncharted world waiting to
> be explored. A new frontier built by your imagination and a digital home where
> visionary ideas can be born. Keep. Protect. Reimagine.
> *(pulsante)* Share your idea → discord.gg/kpr
> *(terminale)* Time is permanent, dates are simply a matter of record keeping. The
> former causes the latter, but the latter is powerless against the former.
> *(terminale iniziale)* // Initializing / 12: the number of the ancients / 22: the
> palindromic semi-prime / 21: 1+2+3+4+5+6 = 21 / Focus Life.

**404**
> The requested page could not be found. Explore the Homepage for more information about
> KPR. — *(pulsante)* Go to Homepage

**Errori di adattamento** (vedi Mobile)
> Your Browser resolution is currently not supported. **Try resizing the window to
> experience the site.**
> Error // RESOLUTION NOT SUPPORTED
> Please turn your device to portrait mode — landscape view not supported

## Mobile

**Questa e' la sezione piu' importante della scheda, perche' KPR fa una cosa che quasi
nessuno osa: se non gli piace la finestra, si rifiuta di funzionare.**

### 1. Il sito si blocca da solo — su desktop e su telefono

Due componenti diversi, entrambi **verificati nel codice**, mettono un velo a schermo
intero e **mettono in pausa lo scroll** (`app.toggleScrollerPause(true)`):

**`widescreen-warning.9d962197.js` — su desktop.** Il blocco scatta se, NON essendo un
dispositivo mobile:

- il rapporto larghezza/altezza e' **maggiore di 3** (monitor ultrawide, o due finestre
  affiancate su 21:9), **oppure**
- l'altezza della finestra e' **minore di 500px**, **oppure**
- il rapporto e' **minore di 0,7**, **oppure**
- la larghezza e' **minore o uguale a 768px**.

Messaggio: *"Your Browser resolution is currently not supported. Try resizing the window
to experience the site."*

**Tradotto: un visitatore da desktop che non ha la finestra a tutto schermo — chiunque
lavori con due finestre affiancate — non vede il sito.** Gli viene chiesto di ridimensionare
la finestra del browser per meritarsi il contenuto. E' probabilmente la ragione principale
del voto Usability 7.47.

**`landscape-warning.3c9c2071.js` — su telefono.** Se il rapporto larghezza/altezza
supera **13/9 ≈ 1,44** (cioe' telefono girato), copre tutto:
*"Please turn your device to portrait mode / landscape view not supported"*.

Il rilevamento del dispositivo e' fatto con **sniffing dello User Agent**
(`gozer-env.ed057cb2.js`, la classica regex di `isMobile`), non con rilevamento di
funzionalita'. Un telefono nuovo con un UA non previsto viene trattato come desktop e
finisce nel blocco "resolution not supported".

### 2. Cosa SPARISCE sul telefono

- **L'indicatore di scroll** nella landing (`Gt || (this.scrollIndicator = …)`).
- **L'inseguimento del puntatore** dell'anello audio nel preloader (`if (isMobile) return`).
- **La lista di percorsi finti** che scorre nel preloader (marcata `desktop-only`).
- **L'immagine `homeProjectIntro__img1Wrap`** nella sezione di introduzione
  (`display:none` sotto 768px).
- Vari blocchi marcati `d-only` nei tableaux: `block--right d-only`,
  `homeProjectIntro__leftContainer d-only`, `rowBlock small d-only` — **cioe' gli strati
  laterali di grafica tecnica dei tableaux vengono tolti**. Il tableau su mobile e' piu'
  povero di strati.
- La griglia passa da **48 colonne a 16**; i margini laterali da `6rem` a `2rem`.
- La barra laterale del menu (larga 67px su desktop) sparisce: `--menu-width: 0px`,
  e nasce una barra in alto alta `4.1rem` piu' una sottonavigazione di `3.8rem`.

### 3. Cosa viene SOSTITUITO

| desktop | mobile |
|---|---|
| **"CLICK & HOLD"** con mirino e **anello che si riempie** | **"TAP & HOLD"** con **due frecce** che si avvicinano e una **barra orizzontale** di avanzamento (`btnHoldMobile__progress`) |
| *"Click to Enable Sound"* | *"Tap to Enable Sound"* |
| Menu a barra verticale sul lato sinistro | `the-nav-mobile` + `the-subnav-mobile` in alto, con ScrollTrigger che cambia tema alla barra (`start: "top top+=<altezza barra>"`) |
| Console: le finestre dei comandi appaiono in linea | Su mobile si apre **una finestra sovrapposta** (`browser.isMobile && (popup.show = true)`) |
| Sezione "la storia" alta **212rem** | alta **109rem** — cioe' **quasi meta'**: su telefono quel capitolo scorre molto piu' in fretta |
| Anello di caricamento audio `loading-audio-cta-ring.svg` | versione dedicata `loading-audio-cta-ring-m.svg` |
| Angoli `--radius: 1rem`, `--overlap: 2rem`, `--parallax: 4rem` | `.5rem`, `1rem`, `2rem` — **il parallasse e' dimezzato** |

### 4. Cosa RESTA

- **Tutto il racconto e tutte e nove le sezioni.** Nessun capitolo viene tolto.
- **I tre tableaux con il WebGL e la meccanica della tenuta**: non c'e' nessuna
  versione "a immagini ferme" per telefono. Su mobile gira lo stesso motore Three.js.
- **La console segreta** — ma sul telefono **non c'e' il tasto backtick**: si apre solo
  dal pulsante `btn-console`.
- L'altezza totale di scroll resta praticamente la stessa (~16 schermate contro ~17).

**Il giudizio da portarsi a casa:** KPR non e' "un altro sito sul telefono". E'
**lo stesso sito, con meno strati e comandi diversi**, e con la stessa fatica di
caricamento. La vera discriminazione non e' desktop/mobile: e' **finestra intera contro
finestra parziale**.

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| Framework | **Nuxt 3** (Vue 3, composizione, `<script setup>` compilato) | **VERIFICATO** | `window.__NUXT__`, header `X-Powered-By: Nuxt`, cartella `/_nuxt/`, `entry.*.js` come `modulepreload` |
| Rendering | **SSR su AWS Lambda** dietro API Gateway | **VERIFICATO** | `serverRendered: true`, `isSSR: true`, header `Apigw-Requestid`, e HEAD che risponde 404 JSON |
| Stato | **Pinia** | **VERIFICATO** | `window.__NUXT__.pinia` con gli store `app`, `browser`, `debug`, `storyblok`, `wallet-store` |
| Animazione | **GSAP 3.10.4** | **VERIFICATO** | stringa `version:"3.10.4"` ripetuta nel bundle |
| Plugin GSAP (a pagamento, Club GreenSock) | **ScrollTrigger, ScrollSmoother, SplitText, DrawSVGPlugin, CustomEase, Flip, Observer** | **VERIFICATO** | 125 occorrenze di `ScrollTrigger`, 9 di `ScrollSmoother`, piu' `SplitText`, `DrawSVG`, `CustomEase`, `Flip`, `Observer`; `registerPlugin(xC,kO,KO,BC,_I,zI,sO,D$,fC)` |
| Scroll morbido | **GSAP ScrollSmoother** (`smooth: 1`, `effects: false`) — **non** Lenis, **non** Locomotive | **VERIFICATO** | `the-smooth-scroll.6f06ac0c.js` |
| 3D | **Three.js**, build a modulo, 486.129 byte | **VERIFICATO** | `/_nuxt/three.module.c9112413.js`; supporto `KHR_draco_mesh_compression`, `KHR_texture_basisu`, `EXT_meshopt_compression`, `KHR_materials_transmission/iridescence/sheen/clearcoat` |
| Materiali | **shader GLSL scritti a mano** | **VERIFICATO** | `custom-material.e347eaa2.js` (54.989 byte), 117 occorrenze di `uniform`; nomi `BeamMaterial`, `GlowMaterial`, `RayMaterial`, `FrameMaterial`, `LayerMaterial` |
| Motore interno | **un framework proprietario di Resn** ("gozer") sopra Three.js | **SUPPOSTO (forte)** | chunk `gozer-env`, `dom-component`, `three-object`, `simple-three`, `create-canvas`, `drawing`, `camera`, `lerp`, `modulo`, `in-range`. La home e' **un solo `<div class="home">`**: il markup delle scene e' generato dal motore con template a stringhe (`re\`…\``, cioe' lit-html o simile) |
| Animazioni 2D | **spritesheet TexturePacker** (atlanti 2048×2048, multi-pack) + **dati esportati da After Effects** | **VERIFICATO** | `"app":"https://www.codeandweb.com/texturepacker"` nei JSON; `/data/2ndlayer.ae.json` |
| Audio | **Howler.js** | **VERIFICATO** | `new s.Howl({src:[…]})` in `hover-sfx`; 39 occorrenze di `Howler` |
| CMS | **Storyblok**, spazio `165555`, lingua `us-en`, versione `published`, con **proxy** su API Gateway | **VERIFICATO** | `config.public.storyblok.apiOptions.proxyEndpoint`; il token e' mascherato (`xxx-KPR-xxx`) perche' le chiamate passano dal proxy — **fatto bene** |
| Wallet / blockchain | connessione wallet con **MetaMask** e **WalletConnect**, firma di un messaggio, verifica catena | **VERIFICATO** | `wallet-store`, `btn-wallet-connect`, `metamask.svg`, `wallet-connect.svg`, `SIGNING_MESSAGE: "New Eden citizens! Please sign this message to verify your account. You will not be charged gas for this interaction."` |
| Dati della collezione | servizio separato **`metadata.kprverse.com`** (`gallery.json`, `thumbs/`, `images/`) + API su `3sr17t6r2g.execute-api.us-east-1.amazonaws.com` (`/my-collection/{address}`, `/storyblok`) | **VERIFICATO** | `config.public` e `gallery-store` |
| Analitica | **GA4**, `G-VNY65FGL4R` | **VERIFICATO** | `config.public.googleMeasurementId` |
| Widget esterno | bundle su `dir8tnx7alyrd.cloudfront.net/main.bundle.js` + `.css` | **VERIFICATO** (esiste la configurazione) / **non verificato** a cosa serva | `widget_bundle_js` / `widget_bundle_css` |
| Ospitalita' | **AWS S3 + CloudFront** per gli asset, **API Gateway + Lambda** per l'HTML | **VERIFICATO** | `Server: AmazonS3`, `Via: … cloudfront.net`, `X-Amz-Cf-Pop: FRA56-P10` |
| Immagini | **PNG** per gli spritesheet, **WebP** per il secondo strato dei tableaux, **MP4** per video e cicli | **VERIFICATO** | percorsi nei chunk. Nessun AVIF, nessun `srcset` visto |
| Strumenti di sviluppo lasciati nel bundle | **Tweakpane** e **Stats.js** | **VERIFICATO** | `/_nuxt/tweakpane.07e91d40.js`, `/_nuxt/stats.min.40ed55e2.js`, store `debug: {enabled:false, stats:false, frame:true}` |
| Utility CSS | un piccolo strato tipo Tailwind, ma **senza le variabili `--tw-`** e senza preflight | **SUPPOSTO** | classi `.pointer-events-auto`, `.flex-row`, `ring-offset` presenti; nessuna occorrenza di `--tw-` o `tailwind` |

## Peso e prestazioni

Numeri veri, misurati con `curl` il 13/08/2026 dalla Germania (CloudFront `FRA56-P10`).

**Il documento**

| risorsa | crudo | trasferito (gzip) |
|---|---|---|
| **HTML della home** | **618.160 B** | **618.160 B — NON compresso** |
| di cui `window.__NUXT__` | 494.943 B | — |
| di cui testo visibile | ~876 caratteri | — |
| HTML `/about` | 804.671 B | — |
| HTML `/media` | 693.443 B | — |
| HTML `/journal` | 652.213 B | — |
| HTML `/protocol` | 638.277 B | — |

> **Il difetto piu' grosso del sito.** L'HTML **non e' compresso**: `Content-Length:
> 618160` anche chiedendo `Accept-Encoding: br, gzip`. Sono **604 KB** che passano
> interi, su ogni pagina, prima che parta un solo pixel. Con gzip sarebbero stati
> ~60–80 KB. Il JavaScript invece e' compresso (gzip, **non brotli**).
> Motivo probabile: la risposta arriva da Lambda via API Gateway, dove la compressione
> va accesa a mano. **VERIFICATO.**

**Il codice**

| file | crudo | gzip |
|---|---|---|
| `entry.9cfb39b7.js` | 704.006 B | **222.556 B** |
| `three.module.c9112413.js` | 486.129 B | **124.818 B** |
| `Home.17c0ce45.js` | 222.413 B | **53.654 B** |
| `custom-material.e347eaa2.js` | 54.989 B | — |
| `entry.6ad9710f.css` | 36.230 B | **6.646 B** |
| `Home.3f2d3f45.css` | 53.144 B | — |
| **JS minimo per vedere la home** | ~1,41 MB | **~400 KB** |

Piu' — contati uno per uno nei `modulepreload`/`preload` in testa all'HTML della home —
**128 chunk JavaScript, 6 fogli di stile e 19 fra SVG e immagini**, per **153 risorse
dichiarate nel `<head>` prima ancora di cominciare**. Il codice e' spezzettato bene, ma
il costo si sposta sul numero di richieste.

**Gli asset**

| risorsa | peso |
|---|---|
| `videos/trailer/keepers-teaser-1080.mp4` | **19.339.829 B (19,3 MB)** |
| `metadata.kprverse.com/gallery.json` | **1.355.239 B** (10.000 token + 13 tratti) |
| **`og.jpg`** | **1.053.107 B (1 MB)** |
| `images/tableau/keep/kai/kai-0.png` | 1.077.131 B — **ed e' 1 di 4** (`kai-1/2/3`), quindi ~4 MB per il solo effetto "kai" del primo tableau |
| `images/sheets/header-sprite.png` | 206.101 B (131 fotogrammi, atlante 2048×2048) |
| `_nuxt/ABCWhyteVariable.woff2` | 191.416 B |
| `images/landing/kpr-map.png` | 175.948 B |
| `audio/FX_logo_intro_animation.mp3` | 137.642 B |
| `images/landing/kpr-texture.png` | 75.337 B |
| `data/2ndlayer.ae.json` | 76.333 B |
| `images/sheets/logo-anim-low-res-0.png` | 58.253 B (101 fotogrammi) |

**Stima complessiva della home**: non l'ho potuta misurare a schermo (niente browser).
Ma **solo tra HTML non compresso (0,6 MB), JS (0,4 MB), font (0,2 MB) e gli spritesheet
dei tre tableaux si superano abbondantemente i 10 MB**, e il trailer da 19,3 MB e' in
pagina. **Nessun punteggio Lighthouse rilevato** — non avendo un browser non l'ho potuto
girare, e non ne ho trovato uno pubblicato.

**Cose che pesano e non servono**, tutte verificate:
- il sistema di temi morto (banana/tangerine/cilantro/…) in entrambi i fogli di stile;
- `@import` a Google Fonts per Noto Sans JP/SC/TC, che blocca il rendering per tutti;
- **Tweakpane e Stats.js** spediti in produzione;
- `og.jpg` da 1 MB, che nessuno vede mai sul sito (serve solo alle anteprime social).

**SEO — praticamente assente**, e per questo tipo di progetto e' quasi coerente:
- `/robots.txt`, `/sitemap.xml`, `/llms.txt` → **tutti 404** (rispondono con la pagina
  404 dell'applicazione, cioe' con 600 KB di HTML);
- `<meta name="description" content>` — **vuota**, su tutte le pagine;
- `og:description` e `twitter:description` — **vuote**;
- **`<meta name="twitter:site" content="@title">`** — un segnaposto del modello mai
  sostituito, in produzione da quattro anni;
- nessun `canonical`, nessun `hreflang`, benche' esistano quattro localizzazioni;
- il titolo e' sempre `KPR | <sezione>`.

## Tre cose da rubare

### 1. Il precaricamento che racconta la finzione invece di scusarsi

**La meccanica:** invece di una percentuale, il preloader mostra **una lista di percorsi
finti che appartengono al mondo del sito**, cambiata a intervalli casuali fra 150 e
400 ms.

```js
const paths = [
  "HTTPS://KPRVERSE.COM/KPCO/KAI-14/REACTOR/ISOTOPE-C/43LK2L",
  "HTTPS://KPRVERSE.COM/KPCO/AREA-SCAN/CO2_LEVELS",
  "INITIALIZING SYSTEM…..48",
  "READY",
];
let i = 0;
const tick = () => { timer = setTimeout(() => {
  i += 1; if (i < paths.length - 1) tick();
}, randomInt(150, 400)); };
```

**Perche' funziona:** l'attesa e' l'unico momento in cui il visitatore **deve** guardare
lo schermo. KPR ci mette dentro la prima pagina della sua narrazione. E l'intervallo
casuale e' il trucco vero: a intervalli regolari sembrerebbe un'animazione, a intervalli
casuali sembra **una macchina che lavora davvero**.

**Come rifarlo su un sito di un cliente italiano:** in un e-commerce di arredamento, la
lista puo' essere `MISURA TELAIO / 1840mm`, `ESSENZA — ROVERE NODATO`,
`VERIFICA GIUNZIONE 04`. Costa venti righe e un elenco di stringhe. Funziona anche senza
WebGL.

### 2. "Tieni premuto" come secondo livello di lettura

**La meccanica:** una sola scena, due strati. Lo scroll fa avanzare la scena; **la
tenuta del puntatore apre lo strato tecnico sopra**, e l'anello del pulsante si disegna
**in funzione dell'avanzamento della sequenza, non di un timer**:

```js
whilePlay() {
  this.btnHold.props.draw = this.tlSequence.progress();
}
```

**Perche' funziona, per un'agenzia:**
- **non punisce nessuno** — chi non tiene premuto vede comunque tutto il racconto;
- **premia chi partecipa**, e chi partecipa e' esattamente il compratore che serve;
- **raddoppia il contenuto senza raddoppiare la pagina**: gli stessi 270vh contengono
  due letture.
- Su mobile diventa `TAP & HOLD` con barra orizzontale: **la stessa idea, un altro
  gesto.** E' cosi' che si porta una meccanica desktop sul telefono senza buttarla.

**Dove usarla in Italia:** una scheda prodotto di un mobile su misura. Scorri e vedi il
divano nella stanza; **tieni premuto e compaiono le quote, l'essenza, la densita' della
gommapiuma, i punti di cucitura.** La promessa e' l'immagine, la prova e' sotto il dito.

### 3. Il catalogo di 10.000 pezzi che si filtra senza bloccare la pagina

**La meccanica, doppia.**

*(a) I dati sono indicizzati, non descritti.* Ogni token e' un array, non un oggetto:

```
[ 0,                                  // id
  [[0,3],[1,0],[2,17],[3,0],…],       // [indiceTratto, indiceValore]
  "68a371499c4185…"                   // hash dell'immagine
]
```

I nomi dei tratti stanno **una volta sola** in un dizionario a parte. Risultato:
**10.000 pezzi con 13 tratti in 1,36 MB.** Con oggetti JSON per esteso sarebbero stati
15–20 MB.

*(b) Il filtro non blocca il thread.* Invece di un `filter()` su 10.000 elementi, il
lavoro e' spezzato: **400 elementi, poi cede il controllo per 5 ms, poi altri 400**, con
possibilita' di annullare se l'utente cambia filtro nel frattempo:

```js
const chunked = (items, perTick, fn) => {
  let i = 0, timer;
  const step = (done) => {
    let end = false;
    for (let n = 0; n < perTick && !end; n++) {
      if (i >= items.length) end = true; else fn(items[i], i);
      i++;
    }
    end ? done() : timer = setTimeout(() => step(done), 5);
  };
  return { cancel: () => clearTimeout(timer), start: () => new Promise(step) };
};
```

**Perche' vale oro per un'agenzia:** e' la ricetta per **un configuratore o un catalogo
grosso che resta fluido** su un telefono di fascia media, senza web worker, senza
libreria, senza framework. Vale per un catalogo di piastrelle, di profili in alluminio,
di ricambi. Trenta righe.

### Bonus, come regola di produzione, non come effetto

**Gli effetti "3D" dei tableaux non sono 3D.** Fuoco, raggi, capelli al vento, stoffa,
bagliori: sono **spritesheet esportati da After Effects** (TexturePacker + un JSON di
coreografia, `2ndlayer.ae.json`), giocati su piani Three.js. Cioe': **il motion designer
lavora in After Effects, non nello shader**. Questo, per un'agenzia piccola, e' la
differenza fra "non possiamo permettercelo" e "lo facciamo". Il prezzo e' il peso
(4 MB per un singolo effetto), quindi va usato dove l'effetto e' *il* momento.

## Non verificato

1. **Il premio "Site of the Year 2022"** indicato nella consegna. La scheda Awwwards
   mostra solo *Site of the Day 26/12/2022* e *Dev Award*. Le pagine annuali di Awwwards
   che avrei dovuto controllare rispondono 404, `thefwa.com/cases/kpr` e' un guscio
   JavaScript, e **il budget di ricerca web della sessione era esaurito** (200/200
   chiamate) quando ho affrontato la verifica: non ho potuto cercare fonti terze.
   **Da ricontrollare.** Resn stessa, nel suo `projects.json`, lascia il campo
   `awards: []` **vuoto** per KPR.
2. **Quanto pesa davvero la home a schermo, e i tempi reali.** Non avendo aperto un
   browser non ho ne' il totale trasferito, ne' il numero di richieste, ne' LCP/CLS/INP,
   ne' un punteggio Lighthouse. I pesi che riporto sono file per file, misurati con
   `curl`.
3. **L'aspetto reale.** Non ho visto un fotogramma. Colori, composizioni e movimenti
   sono ricostruiti da CSS, nomi degli asset e configurazione. **Il colore `#6D64A3` e'
   quello che dichiara Awwwards, non l'ho letto io.** Non so quale sia il colore
   dominante di ciascun tableau.
4. **Il contenuto dei 52 comandi della console.** Ho l'elenco completo dei comandi e i
   titoli di alcune finestre; **non ho trascritto i corpi** (sono documenti in formato
   ricco annidati, decine di migliaia di caratteri).
5. **La pagina Media.** Il suo contenuto e' `content-media` senza blocchi nel payload:
   gli elementi arrivano da una chiamata a runtime che non ho seguito.
6. **Il flusso "Registration" / "citizen".** So che esiste (`/registration`, comando
   `connect_citizens`, `citizen-store`, `SIGNING_MESSAGE`, `citizenNickname`), ma il
   percorso completo di registrazione e' interamente lato client e richiede un wallet.
7. **A cosa serve il widget su `dir8tnx7alyrd.cloudfront.net/main.bundle.js`.**
8. **La pagina `/careers`**: nel CMS non esiste (`us-en/careers/` e' `null` → 404). Il
   link del footer punta fuori, a `https://kpr.homerun.co/?lang=en`, che non ho aperto.
9. **Se il blocco "resolution not supported" scatti davvero come lo leggo nel codice**:
   la logica e' chiara ma non l'ho vista in azione.
10. **Le quattro lingue.** Il CSS prevede `[lang=ja-jp]`, `[lang=zh-cn]`, `[lang=zh-tw]`
    e c'e' un selettore di lingua nel footer (mostra `EN`), ma il payload che ho letto
    e' solo `us-en`: non so se le traduzioni siano davvero pubblicate.
11. **`resn.co.nz/data/projects.json` risponde 403**: i dati del caso studio li ho presi
    dalla cartella di build corrente,
    `https://resn.co.nz/20260721233115_1_0_a02666f/data/projects.json`. Se cambia la
    build, cambia l'indirizzo.
