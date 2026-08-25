# Resn

- **URL**: https://resn.co.nz — raggiungibile, HTTP 200. Nessuna sostituzione.
- **Premio**: Awwwards Site of the Day del 14/06/2016, voto 8.57 (Design 8.84 · Usability 7.74 · Creativity 9.27 · Content 8.58), fonte https://www.awwwards.com/sites/resn-co-nz. Lo studio nel suo profilo Awwwards dichiara 61 Site of the Day, 76 Honourable Mention, 11 Site of the Month (https://www.awwwards.com/resn/). Il sito dichiara di suo, in `data/projects.json`: 135 FWA, 63 Awwwards, 10 Webby, 28 Cannes Lions, 19 One Show, 12 D&AD, 53 DINZ Best Awards.
- **Studio**: Resn — Wellington (NZ) e Amsterdam (NL). E' il sito dello studio stesso.
- **Anno**: premiato nel 2016; la build online oggi e' `1.0.a02666f`, cartella `20260721233115_1_0_a02666f`, `Last-Modified: Tue, 21 Jul 2026 23:36:42 GMT`. Quindi impianto del 2016 ancora aggiornato nei contenuti nel 2026.
- **Letto il**: 13/08/2026

> **Nota di metodo**: il sito e' una single page application RequireJS/Backbone. Da fuori l'HTML iniziale e' un guscio di 4.292 byte con dentro solo il preloader. Tutto il resto (markup, testi, dati) l'ho preso dai file veri che il guscio carica: `https://resn.co.nz/index_desktop.html`, `https://resn.co.nz/index_mobile.html`, `.../css/all.css`, `.../css/all_mobile.css`, `.../data/projects.json`, `.../data/interactives/interactives.json`, `.../data/categories.json`, `.../data/sounds.json` e il bundle `.../js/main_desktop_extended.js`. Quello che ho visto a schermo lo dichiaro come tale.

---

## L'ESPERIENZA (integrazione)

> Blocco aggiunto il 13/08/2026 riscaricando `index_desktop.html` (23.926 B, tutto il markup
> del sito, privacy compresa) e `data/projects.json` dalla cartella di build corrente
> (`/20260721233115_1_0_a02666f/`, 869.996 B, **84 progetti, 80 attivi, 18 in evidenza**).
> Risponde alle domande che servono a un'agenzia. Le sezioni tecniche piu' sotto restano
> valide.

### Di cosa tratta il sito, in concreto

Una goccia nera al centro dello schermo, e dietro di lei **ottantaquattro progetti, sette
giocattoli nascosti, tre pagine (About, Work, Contact) e una informativa privacy piu' lunga
di tutto il resto del sito messo insieme.**

Non e' una pagina che scorre: e' **una stanza chiusa con una porta**. La porta e' la goccia.
Chi non la tocca non entra, e il sito non gli dice niente.

### Cosa vende, e qual e' l'obiettivo finale

**Dichiarato**, in tre punti, e solo dopo che sei entrato nel menu e hai cliccato About:
> **Resn · Creative Studio**
> **Bringing your story to life.**
> **Brand · Content · Experience · Digital**

Cinque parole di posizionamento e quattro categorie. Non c'e' un paragrafo. Non c'e' un
"cosa facciamo". Non c'e' un metodo.

**Vero:** essere lo studio che i marchi globali chiamano quando l'idea e' troppo difficile
per la loro agenzia. E, dal 2024 in poi, **una seconda cosa che il sito racconta senza
dirla**: la riconversione del portafoglio clienti. Nei 18 progetti in evidenza (il
carosello Work, quelli che il visitatore vede per primi) i lavori recenti sono
`Tracing Art` (Getty, 2025), `Savor` (2025), `Alpine Bio` (2025), `Navigate` (2024),
`Zentry` (2024) — cioe' **climatech, biotech e web3**, non piu' l'intrattenimento. E infatti
nella lista clienti dell'About c'e' una categoria che dieci anni fa non esisteva:
**`Climatech & Startups` — Alpine Bio · Breakthrough Energy · Savor · TerraPower.** Un guscio
del 2016 che vende un posizionamento del 2026.

**Conversione:** `newbusiness@resn.co.nz`. Ed e' un dettaglio da notare — **e' l'unico dei
quattro studi con un indirizzo dedicato al nuovo business, con due numeri di telefono e due
indirizzi fisici pubblicati.** Nessun modulo di contatto: l'unico campo compilabile del
sito e' l'iscrizione alla newsletter (`GAZETTE`, Mailchimp, con campo trappola antispam
fuori schermo).

**L'imbuto vero, pero', non e' a schermo.** Il sito non ha piede, non ha banner cookie e non
chiede niente — ma ha **HubSpot (portale 5452172), Google Tag Manager + GA4, LinkedIn
Insight Tag e DoubleClick** tutti attivi. Cioe': lo studio che sembra non vendere niente
**sta tracciando ogni visitatore in un CRM commerciale e lo puo' reindirizzare su LinkedIn.**
Il contrasto fra la facciata (nessuna richiesta) e l'impianto (marketing automation
completo) e' la cosa piu' istruttiva della scheda.

### A chi si rivolge

A due compratori:

- **Il direttore marketing di un marchio globale** (Apple, Google, Samsung, Netflix, HBO,
  Riot Games, Playstation, YouTube, Lexus, Toyota, Maserati, Tiffany & Co, Clinique,
  La Mer, adidas Originals sono tutti in lista) che ha gia' un'agenzia e ha bisogno di un
  esecutore per il pezzo impossibile.
- **Il fondatore di una startup finanziata** (Breakthrough Energy, TerraPower, Lucid Motors,
  Alpine Bio, Savor) che deve sembrare piu' grande di quello che e'.

Il primo teme di prendere uno studio che non sa gestire un progetto grosso; per lui c'e' il
campo `role` di ogni progetto, che elenca **undici discipline** — es. testuale su Tracing
Art: *"Strategy, Concept, Design, UX, UI, Creative Direction, Art Direction, Animation,
Content Management, Development, Project Management"*. Non e' un vanto estetico: e' la
risposta a "chi mi coordina il progetto?".

### L'esperienza progettata, passo per passo, e con che ritmo

| momento | quando | cosa succede | ritmo |
|---|---|---|---|
| **Nero** | 0 → 3,3 s | schermo nero, niente. Sta scaricando 4 MB di JavaScript **non compresso** | vuoto assoluto |
| **Cancello** | 3,3 → ~22 s | una goccia bianca disegnata in SVG e una barra alta 1 px che si riempie | **venti secondi di attesa senza intrattenimento** |
| **Comparsa** | ~22 s | la scena WebGL e' in piedi, ma il titolo e' ancora invisibile | |
| **Titolo** | 25,3 → 29,2 s | `Resn · Creative Studio` / `Est. 2004` sale in dissolvenza in **quattro secondi** | lentissimo |
| **L'unica istruzione** | 26,4 → 28,4 s | `CLICK & HOLD` entra **e riesce da sola in due secondi** | e poi il sito tace |
| **Regime** | da qui | la goccia ruota, la grana vibra. **Nessun invito, nessuna freccia, nessuno scorrimento** | fermo |
| **Il gesto** | quando decidi tu | tieni premuto: dopo 300 ms uno dei sette giocattoli invade lo schermo, dopo 1500 ms **l'interfaccia si spegne da sola** | premio immediato |
| **Ingresso** | doppio clic | tre parole sopra la goccia: About · Work · Contact | il sito comincia adesso |

Il ritmo, in una riga: **trenta secondi di niente, due secondi di istruzione, poi silenzio a
oltranza finche' non fai un gesto.** E' un sito che mette alla prova.

### Cosa deve fare il visitatore, e dove lo portano

Tutta l'interazione passa da **un solo bottone del mouse, e da tre soglie di tempo**:

1. **160 ms** — un secondo `mousedown` entro questa finestra e' un doppio clic → si entra
   nel menu.
2. **300 ms** — se stai ancora premendo, parte uno dei **sette** giocattoli
   (`AWWWARD`, `SHAPESHIFTER`, `ROD`, `BAT`, `TUNNEL`, `SKETCH`, `CUBES`) con un contatore
   `n / 7` che ti dice quanti ne restano da scoprire.
3. **1.500 ms** — l'interfaccia si toglie di mezzo da sola e resta solo il gioco. Al rilascio
   torna tutto.

Poi: `Work` → carosello orizzontale da trascinare con 18 poster in evidenza · `View All
Projects` → griglia a due colonne con filtro per categoria (Activation, Animation, Branding,
Content, Creative Strategy, Design, Development, Games, Motion) su 80 lavori · un progetto →
25-40 blocchi tipizzati (immagini, video in loop, titoli, testi, caroselli, maschere) ·
`Live Website` verso il sito vero del cliente.

**Dove lo portano davvero:** in un catalogo profondissimo, ma solo se ha fatto il gesto
iniziale. Il contatore `n / 7` e' la cosa piu' astuta del sito: **trasforma un effetto in
una collezione**, cioe' da' un motivo per restare che non e' commerciale.

### Come e' organizzata la persuasione

| leva | dove sta | quanto e' lontana dall'ingresso |
|---|---|---|
| **Promessa** | `Bringing your story to life.` | **doppio clic + clic su About** |
| **Anzianita'** | `Est. 2004` | schermata 1 (e' l'unica informazione che si ottiene gratis) |
| **Prova visiva** | la goccia e i sette giocattoli | schermata 1, ma **solo se tieni premuto** |
| **Prova per nomi** | 33 clienti in 7 settori nell'About | 2 clic |
| **Premi** | 6 sigle nell'About; i conteggi (135 FWA · 63 Awwwards · 10 Webby · 28 Cannes Lions · 19 One Show · 12 D&AD · 53 DINZ) stanno in `projects.json` | 2 clic |
| **Prova pesante** | 80 progetti, 18 in carosello, 25-40 blocchi ciascuno | 2 clic |
| **Contatti** | 2 email, **2 telefoni**, 2 indirizzi | 2 clic |
| **Prezzo** | **assente** | — |
| **Chiamata all'azione** | **non esiste una CTA scritta in tutto il sito** | — |

Merita di essere scritto chiaro: **Resn non chiede mai niente.** Non c'e' un "contattaci",
non c'e' un "parliamone", non c'e' un "richiedi un preventivo". La parola `Contact` e' una
voce di menu, non un invito. Tutto il carico persuasivo e' scaricato sulla lista clienti e
sull'esperienza — e sul CRM che gira in silenzio.

### Cosa arriva a chi NON scorre fino in fondo

**Il caso peggiore dei quattro, e di parecchio.**

- **Chi chiude nei primi 20-30 secondi**: zero. E non e' un'ipotesi: il
  `first-contentful-paint` misurato e' **31,2 secondi**, con 4 MB di JavaScript serviti senza
  compressione (comprimendolo si risparmierebbe il 79%). Un visitatore da telefono in
  mobilita' non vede **mai** questo sito.
- **Chi arriva alla prima schermata e non fa il gesto**: riceve tre informazioni in tutto —
  il nome (`Resn`), la categoria (`Creative Studio`), l'anno (`Est. 2004`). **Nessun
  cliente, nessun servizio, nessun premio, nessun contatto, nessuna frase di
  posizionamento.** L'unica istruzione (`CLICK & HOLD`) resta a schermo **due secondi** e poi
  se ne va: chi guarda altrove in quel momento resta davanti a una schermata muta.
- **Chi non fa doppio clic**: non arrivera' mai ne' all'About ne' al Work.

Il messaggio, per chi si ferma, e' **solo tonale**: "siamo cari, siamo vecchi (2004), e non
ci spieghiamo". Se il compratore e' quello giusto puo' bastare; per tutti gli altri il sito
non esiste.

Come Active Theory, anche Resn ha spostato il pitch scritto **fuori dalla pagina**, verso i
motori di ricerca invece che verso il visitatore:

> `Resn - Creative Digital Agency | Ideation, Design, and Development`
> `Resn is a creative studio bringing brand, content and digital experiences to life through
> stories shaped with global brands and emerging innovators.`

Quella frase — l'unica che spiega davvero cosa vendono — **non compare da nessuna parte sullo
schermo.**

### Come costruiscono la fiducia (e' questo il prodotto)

- **Clienti, impaginati per settore** — ed e' il pezzo di persuasione meglio costruito del
  sito, perche' ogni riga risponde a un'obiezione diversa:
  `Tech Innovation & Future` — Apple · Google · Magic Leap · Samsung ·
  `Climatech & Startups` — Alpine Bio · Breakthrough Energy · Savor · TerraPower ·
  `Fashion & Beauty` — adidas Originals · Clinique · La Mer · Tiffany & Co ·
  `Web3` — KPR · Navigate · Zentry · Sylo ·
  `Entertainment & Culture` — Netflix · HBO · Riot Games · Playstation · YouTube ·
  `Automotive` — Lexus · Toyota · Lucid Motors · Subaru · Maserati ·
  `Collaborations` — MCA · Estée Lauder · Getty Research Institute.
  Il messaggio implicito: *qualunque sia il tuo settore, ci siamo gia' stati.*
- **Premi per marca, non per numero, a schermo**: `Cannes Lions` · `Webby` · `D&AD` ·
  `One Show` · `Awwwards` · `FWA`. I conteggi veri (135 FWA, 63 Awwwards, 28 Cannes Lions,
  53 DINZ Best Awards) vivono in `projects.json`. **Ventotto Cannes Lions e' un argomento da
  prima riga**, e sta in un file JSON.
- **Ogni progetto dichiara il ruolo svolto**, con un elenco lungo e specifico di discipline.
  E' la prova di essere partner completi e non fornitori di una singola voce.
- **Descrizioni di progetto scritte dal punto di vista del cliente**, non dello studio.
  Testuale, da `Savor` (2025): *"Savor is a pioneering food company that has developed a new
  way to create functional, versatile fats. With 30% of global emissions from food and a
  quarter of that tied to fat and oil production, Savor is committed to decarbonizing this
  essential macronutrient."* Tre righe sul cliente prima di una parola su di se': **e' il
  contrario di quello che fanno Lusion e Active Theory.**
- **Due sedi con numero di telefono**: `WELLINGTON +64 4 385 0705` e
  `AMSTERDAM +31 20 2610299`. Nessuno degli altri tre studi pubblica un numero. Per un
  compratore enterprise dall'altra parte del mondo, un telefono e' un argomento di
  affidabilita'.
- **`careers.resn.co.nz`** messo accanto alla mail commerciale: uno studio che assume e' uno
  studio che ha lavoro.
- **Autoprodotto come prova**: `Sheer Cupidity` (cliente: Resn, gennaio 2024) sta nel
  carosello in evidenza accanto a Getty e Amazon.
- **Processo**: **assente**, come negli altri tre. Nessuna fase, nessun tempo, nessun metodo.

### I testi veri principali

Home (tutto quello che si ottiene senza fare niente):

> **Resn · Creative Studio**
> **Est. 2004**
> `click & hold` (desktop) / `touch & hold` (mobile) — reso in maiuscolo dal CSS

Interfaccia:

> `Drop` · `Discover` · `Showreel` · `Audio` · `View All Projects`
> `Close Project` · `Close Showreel` · `Close All Projects`
> `About` · `Work` · `Contact`

About (integrale — sono cinque righe piu' due elenchi):

> **Resn · Creative Studio**
> **Bringing your story to life.**
> **Brand · Content · Experience · Digital**
> `Selected Clients` … `Awards`

Contatto:

> `newbusiness@resn.co.nz` · `careers.resn.co.nz`
> `WELLINGTON` — `+64 4 385 0705` — `Level 7/138 Wakefield Street, Wellington 6011, New Zealand`
> `AMSTERDAM` — `+31 20 2610299` — `Amsterdam, The Netherlands`
> `SOCIAL` — LinkedIn · Instagram · X
> `GAZETTE` · `PRIVACY` · segnaposto `Email`
> `Thanks! You are now subscribed.`

Meta (l'unico posto dove il posizionamento e' scritto per esteso):

> Resn - Creative Digital Agency | Ideation, Design, and Development
> Resn is a creative studio bringing brand, content and digital experiences to life through
> stories shaped with global brands and emerging innovators.

---

## Cosa vende

Il tempo di uno studio che costruisce esperienze digitali su misura (siti, installazioni, giochi, contenuti 3D e motion) per marchi globali. Non vende un prodotto: vende la prova che sanno fare cose che gli altri non sanno fare.

## A chi

Al direttore marketing o al creative director di un marchio grosso (Apple, Netflix, Tiffany, Lexus, Riot Games sono nella lista clienti) e al capo di una startup finanziata bene (Breakthrough Energy, TerraPower, Lucid Motors). Deve uscire pensando due cose: "questi hanno un livello tecnico che non trovo altrove" e "il sito stesso e' il portfolio, non lo racconta, lo dimostra".

## Idea regista

Una goccia nera sfaccettata sta al centro dello schermo, e ogni cosa che fai — cliccare, tenere premuto, entrare in un progetto — e' un modo di toccarla.

## Il momento

Tieni premuto il tasto sinistro sulla goccia. Dopo circa 300 ms la scritta `CLICK & HOLD` sparisce, una barra circolare si riempie, e nel giro di un secondo lo schermo viene invaso da un giocattolo a schermo intero — nel mio test un caleidoscopio in bianco e nero fatto di mele e lune specchiate (l'interattivo `SHAPESHIFTER`). Un contatore in basso segna **2 / 7**: i giocattoli nascosti sono sette e ne peschi uno a caso. Nel frattempo il titolo va a opacita' 0 e, dopo 1.500 ms, l'interfaccia si spegne da sola (evento `SHELL:DEACTIVATE` nel codice): resta solo il giocattolo. Appena molli il tasto, tutto torna com'era.

Verificato a schermo (screenshot) e nel codice (`view/modules/background/background_drop_view`, `interactive_bar_view`, `data/interactives/interactives.json`).

I sette, con il numero che appare nel contatore desktop:
`1 AWWWARD` · `2 SHAPESHIFTER` · `3 ROD` · `4 BAT` · `5 TUNNEL` · `6 SKETCH` · `7 CUBES`.
Su mobile sono sei: `TUNNEL` non c'e' e i numeri si ricompattano.

## Struttura, sezione per sezione

Non e' una pagina che scorre. E' una SPA a stati, con routing hashbang (`#!/menu`, `#!/work`, `#!/work/all`, `#!/about`, `#!/contact`). Lo scroll esiste solo dentro quattro stati.

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |
|---|---|---|---|
| Home `#!/` | goccia 3D al centro, titolo `Resn · Creative Studio / Est. 2004`, messaggio `CLICK & HOLD` | tiene premuto (giocattolo) oppure doppio clic (entra) | 0 — schermata fissa |
| Menu `#!/menu` | tre parole in fila sopra la goccia: About · Work · Contact | clic su una parola | 0 — schermata fissa |
| Work `#!/work` | carosello orizzontale: un poster progetto grande al centro (~1345×610 su 1795 px), titolo sopra, i titoli vicini che sbucano dai bordi | trascina in orizzontale, clic per aprire | 0 — si trascina, non si scorre |
| Overview `#!/work/all` | griglia a 2 colonne di poster, intestazione `FILTER / All Projects ⌄`, frecce su/giu ai lati | filtra per categoria, scorre | 80 progetti in griglia 2 colonne, ~40 righe (non misurato in schermate) |
| Progetto `#!/work/<route>` | pagina costruita da un JSON: immagini, video loop, titoli, testi, caroselli, mascherati su una griglia a colonne | scorre, apre immagini a tutto schermo, lancia il sito vero | variabile: da 25 a oltre 40 blocchi per progetto |
| About `#!/about` | titolo, claim, elenco clienti per settore, elenco premi, separatori orizzontali | scorre | lunga, non misurata |
| Contact `#!/contact` | due email, due indirizzi, social, iscrizione newsletter | scorre poco, compila la mail | 1–2 schermate |
| Privacy | informativa completa impaginata a due colonne | scorre | molto lunga (~15 blocchi) |
| Showreel | video con timeline a canvas | play/replay | 0 — non aperta, non verificata |

L'involucro fisso (`shell`) e' sempre lo stesso e cambia solo quali bottoni accende. Misurati su viewport 1442×670:
goccia in alto a sinistra (23, 15), hamburger in alto a destra (1395, 20), icona audio in basso a destra (1389, 633), piu' `Showreel` e `Close Project / Close Showreel / Close All Projects` che compaiono a seconda dello stato.

## L'esperienza in ordine di tempo

Numeri misurati in Chrome desktop, viewport ~1440×670, su una macchina contesa da altre sessioni: prendili come ordine di grandezza, non come benchmark pulito.

**Primi dieci secondi — non succede niente.** Questo e' il dato piu' importante della scheda.

- **0.0 s** — arriva l'HTML (4.292 byte). Schermo nero (`body { background: black }` e' scritto inline nel guscio).
- **0.0–3.3 s** — nero. Sta scaricando `main_desktop_extended.js`: **4.011.938 byte, serviti senza compressione**.
- **3.3 s** — compare il preloader: una goccia bianca disegnata in SVG al centro e una barra alta 1 px sotto. `first-paint` a 3.832 s, `DOMContentLoaded` a 3.375 s.
- **3.3–10 s** — la barra si riempie da sinistra (`scaleX` da 0 a 1). Sotto, tre canvas sono gia' vivi.
- **10 s** — ancora barra.

**Poi, a blocchi.**

- **~22 s** — il preloader sparisce, i canvas passano da 3 a 6, la scena WebGL della goccia e' in piedi. Titolo ancora invisibile (opacita' 0).
- **25.3 → 29.2 s** — il titolo `Resn · Creative Studio / Est. 2004` sale in dissolvenza da 0 a 1 in circa 4 secondi. Il `first-contentful-paint` misurato su un caricamento diretto e' **31.232 s**.
- **26.4 → 28.4 s** — la scritta `CLICK & HOLD` entra e riesce da sola in circa 2 secondi. E' l'unica istruzione che il sito ti da'.
- **da qui in poi** — la goccia ruota lenta, il grain si muove, l'audio ambientale (`bg_01/02/03.mp3`, 713 KB l'uno) e' pronto ma parte solo se accendi l'icona audio.
- **doppio clic** (secondo mousedown entro 160 ms) — vai al menu; le tre parole si materializzano attraverso una maschera a triangoli.
- **clic su Work** — il carosello orizzontale: il poster centrale e' gia' scaricato, gli altri sono `<img>` impilati con `display:none` che vengono accesi uno alla volta.

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| barra del preloader | `scaleX` 0 → 1 di un div alto 1 px | progresso di caricamento | lineare | fondo `rgb(40,40,40)`, riempimento `rgb(255,255,255)` |
| goccia / gemma | mesh sfaccettata che ruota e reagisce al puntatore | tempo + posizione del mouse | continua | three.js r84 con shader GLSL propri (`data/shaders/gem_vertex.shader`, `gem_fragment.shader`, non scaricabili dall'esterno) |
| bordi della gemma | frange rosse e ciano sui bordi delle facce | tempo | continua | aberrazione cromatica: `shaders/ColourOffsetShader` dentro un `EffectComposer` |
| grana dell'immagine | rumore che vibra su tutto lo schermo | tempo | continua | modulo `view/modules/background/grain/grain` + `shaders/NoiseShader` |
| schegge di fondo | poligoni scuri appena piu' chiari del nero | tempo | continua | `.background__shards`, colore `#141214`. **Su mobile non esistono** |
| testo di menu, titoli progetto, titoli About | le lettere appaiono a chiazze, come rivelate da vetri che ruotano | stato (entrata della pagina) | `radiusMultiplier` da 2 a 0.9 con `Cubic.easeOut`; `maskBaseOpacity` da 0 a 0.05 con `Sine.easeInOut` | **non e' CSS**: e' un canvas 2D. Le lettere sono disegnate con `fillText` da posizioni precalcolate, poi ritagliate con `globalCompositeOperation = 'destination-in'` da un secondo canvas che contiene 3 triangoli che ruotano piano (`rotationSpeed` casuale tra 0.08 e 0.18) e orbitano attorno al centro |
| barra dell'interattivo | linea che si allunga in `scaleX` + cerchio su canvas + contatore `n / 7` | pressione del mouse | apertura `TweenMax.to(1.8s, Sine.easeOut)`, chiusura `0.4s, Expo.easeOut` | il contatore ha due `span` che entrano da `y:+24` e `y:-24` con il divisore che parte da `scale:0` |
| interfaccia (bottoni d'angolo) | svanisce da sola mentre tieni premuto | timer 1.500 ms dal `mousedown` | — | evento `SHELL:DEACTIVATE`; torna al rilascio |
| carosello Work | i pannelli scorrono in `matrix3d` sull'asse X | trascinamento | inerzia a interpolazione lineare, coefficienti `ease = 0.12` e `0.1` nel bundle | nessuna libreria di smooth scroll: e' un `lerp` a mano dentro un `requestAnimationFrame` centralizzato (`util/anim_frame`) |
| poster del carosello | crossfade tra progetti | selezione | — | tutte le `<img>` sono gia' nel DOM, si accende/spegne `display` |
| maniglie di trascinamento | scala 0.9375 → 1 | hover | `transition: transform 200ms cubic-bezier(0.165, 0.84, 0.44, 1)` | una delle due sole bezier del CSS; l'altra e' `cubic-bezier(0.46, 0.03, 0.52, 0.96)` |
| suoni | campioni a sprite sui rollover del menu, tracce in loop per ogni giocattolo | hover e stato | fade 200 ms | Howler; `audio/rollovers_mixdown.mp3` contiene 8 sprite (`menu1..menu4`, `1..4`) con offset in millisecondi in `data/sounds.json` |

Libreria di animazione: **GSAP 1.17.0 (TweenMax, maggio 2015)**. Distribuzione reale delle curve nel bundle desktop, contate a mano: `Expo.easeOut` 104 volte, `Sine.easeInOut` 79, `Sine.easeOut` 68, `Expo.easeInOut` 23, `Quart.easeOut` 16, `Cubic.easeIn` 16. Praticamente tutto il sito e' Expo in uscita e Sine per i respiri.

## Colori

Presi da `css/all.css` salvo dove indicato.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo documento | `#000000` | `body { background: black }` nel guscio HTML |
| fondo percepito | `≈ #212121` (**stimato da screenshot**) | quello che vedi non e' un colore CSS: e' la scena WebGL piu' il grain sopra il nero |
| schegge di fondo | `#141214` | `.background .background__shards` |
| gemma spenta / schegge su tablet e Safari | `#1e1c20` | `.background__gem.is-inactive`, `.tablet .background__shards`, `.is-safari .background__shards` |
| superficie scura (scrollbar, sfondo immagine a tutto schermo) | `#171719` | `::-webkit-scrollbar`, `.carouselFullscreen__content`, `.imageFullscreen__bg` |
| pastiglie circolari (play video, maniglia) | `#1c1a1c` | `.project__video .video__play-button`, `.project__maskDragHandleBg` |
| pulsante play dello showreel | `#1a191b` | `.reel-page .video__play-button` |
| testo primario | `#ffffff` | titoli, voci di menu, etichette |
| testo di corpo dentro i progetti | `#e0e0e0` | `.project__text .text__body`, `.project__list` |
| testo secondario / didascalie 13 px | `#898989` | `p`, `.project__infos p`, nomi dei premi, `.privacy__info p` |
| testo terziario (istruzione `CLICK & HOLD`) | `#717171` | `.interactive_bar_msg`, `.home_title_message span` |
| righe e separatori | `#333333` | `.about-page hr`, `.contact-page hr`, `.headline__divider` |
| accento — unico colore del sito | `#ffda93` (oro pallido) | classe `.gold` nell'informativa privacy e `.privacy a:hover`. **In tutto il resto del sito non c'e' un accento cromatico** |
| velature | `rgba(255,255,255,0.2)` · `0.3` · `0.12` — `rgba(0,0,0,0.2)` | bordi, sottolineature (`.underline.fade` sta a `opacity: 0.24`) |
| sfumature ai bordi (solo mobile) | da `#161517` a trasparente | `.page-edges .top` e `.bottom`, alte il 20% dello schermo |
| altri presenti in mobile | `#5c5b5b`, `#555555`, `#222222` | testi disattivati e fondi minori in `css/all_mobile.css` |

In pratica: nero, cinque grigi scurissimi che si distinguono a fatica, bianco, tre grigi di testo, e un oro che compare solo nella privacy policy.

## Tipografia

Base: `html { font-size: 10px }`, quindi `1rem = 10px`. Sopra c'e' pero' uno `scaleRatio` applicato dall'app in JavaScript (`AppModel.get('scaleRatio')`), che riscala i corpi in funzione del viewport: su 1442 px di larghezza ho misurato un rapporto di 0.9 (una regola da `1.1rem` restituisce `9.9px` calcolati).

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| titolo home | Fort-Extralight | normale | **48 px** desktop misurati / **20 px** mobile misurati | 48 px desktop | `text-align: center`, `text-transform: none`, bianco |
| voci di menu (About/Work/Contact) | Fort-Extralight | normale | `6.5rem` = 65 px desktop / `4rem` = 40 px mobile | 6.5 rem | `letter-spacing: -2px` su desktop. Su desktop sono in riga (larghezza 20% ciascuna, l'ultima 22%), su mobile `display: block`, incolonnate |
| titolo About "Resn · Creative Studio" | Fort-Light | normale | `6rem` = 60 px | 1 | `.about__resnTitle` |
| titoli di sezione About | Fort-Light | normale | `4rem` = 40 px desktop / `2.4rem` = 24 px mobile | 1 | `letter-spacing: -0.05em`, `margin-bottom: 9.6rem` desktop |
| corpo dei progetti | Fort-Light | normale | `2.2rem` = 22 px | `3.8rem` = 38 px | colore `#e0e0e0`, `letter-spacing: 0.02rem`, larghezza 70% con `margin-left: 10%` |
| paragrafi e didascalie | Fort-Book | normale | 13 px | 20–24 px | colore `#898989`, `letter-spacing: 0.52px` |
| voci della griglia progetti | Fort-Book | normale | 14.4 px misurati | — | maiuscolo, bianco |
| etichette di interfaccia (`VIEW ALL PROJECTS`) | Fort-Medium | normale | `1.1rem` → 9.9 px misurati | `2.2rem` | maiuscolo, `letter-spacing: 0.1em` (0.99 px calcolati) |
| etichette dei bottoni della shell (`Drop`, `Discover`, `Showreel`, `Audio`) | Fort-Book | normale | 16 px misurati | — | bianco; su desktop hanno l'iniziale maiuscola, su mobile sono minuscoli nel markup |
| istruzione `CLICK & HOLD` | fort-medium | normale | 10 px | — | `#717171`, maiuscolo, `letter-spacing: 0.04em` |
| contatore dei progetti (solo mobile) | WorkSans-Regular | normale | — | — | l'unico posto dove esce Work Sans |

**Come sono serviti i font.** Tutti in casa, da `/fonts`, nessun servizio esterno, nessun font variabile. Cinque tagli di **Fort** (Extralight, Light, Book, Medium, Bold) in formato `.eot` + `.woff` + `.svg` — **niente WOFF2**, formato del 2013. Quattro tagli di **Work Sans** in `.ttf` grezzo (Thin, ExtraLight, Light, Regular): un TTF non compresso e' il modo piu' pesante di servire un font. Fallback dichiarato ovunque: `"Arial", sans-serif`. Il foundry di Fort non l'ho verificato.

Da notare: nei nomi di famiglia il CSS scrive a volte `"Fort-medium"` e `"Fort-light"` con la minuscola, mentre l'`@font-face` dichiara `"Fort-Medium"` e `"Fort-Light"`. Il match dei nomi di famiglia in CSS e' case-insensitive, quindi funziona lo stesso, ma e' sciatteria.

## Testi veri

Testuali, in inglese.

**Titolo del documento**
`Resn - Creative Digital Agency | Ideation, Design, and Development`

**Meta description**
`Resn is a creative studio bringing brand, content and digital experiences to life through stories shaped with global brands and emerging innovators.`

**Home**
`Resn · Creative Studio`
`Est. 2004`

**Istruzione sulla home**
`click & hold` (desktop) / `touch & hold` (mobile) — resi in maiuscolo dal CSS

**Bottoni dell'involucro** (desktop)
`Drop` · `Discover` · `Showreel` · `Audio` · `Close Project` · `Close Showreel` · `Close All Projects` · `View All Projects`
(su mobile gli stessi in minuscolo nel markup: `drop`, `discover`, `showreel`, `audio`)

**Menu**
`About` · `Work` · `Contact`

**About**
`Resn · Creative Studio`
`Bringing your story to life.`
`Brand · Content · Experience · Digital`
`Selected Clients`
- `Tech Innovation & Future` — `Apple` · `Google` · `Magic Leap` · `Samsung`
- `Climatech & Startups` — `Alpine Bio` · `Breakthrough Energy` · `Savor` · `TerraPower`
- `Fashion & Beauty` — `adidas Originals` · `Clinique` · `La Mer` · `Tiffany & Co`
- `Web3` — `KPR` · `Navigate` · `Zentry` · `Sylo`
- `Entertainment & Culture` — `Netflix` · `HBO` · `Riot Games` · `Playstation` · `YouTube`
- `Automotive` — `Lexus` · `Toyota` · `Lucid Motors` · `Subaru` · `Maserati`
- `Collaborations` — `MCA` · `Estée Lauder` · `Getty Research Institute`

`Awards`
`Cannes Lions` · `Webby` · `D&AD` · `One Show` · `Awwwards` · `FWA`

I nomi dei clienti sono separati a video da un punto mediano generato in CSS: `content: "\00A0·\00A0"`.

**Work — filtro**
`Filter` / `All Projects`
Categorie: `Activation` · `Animation` · `Branding` · `Content` · `Creative Strategy` · `Design` · `Development` · `Games` · `Motion`
Etichette dentro la scheda progetto su mobile: `View Project` · `Watch the case study`

**Contact**
`Contact`
`newbusiness@resn.co.nz`
`careers.resn.co.nz`
`WELLINGTON` — `+64 4 385 0705` — `Level 7/138 Wakefield Street, Wellington 6011, New Zealand`
`AMSTERDAM` — `+31 20 2610299` — `Amsterdam, The Netherlands`
`SOCIAL` — `LinkedIn` · `Instagram` · `X`
Gli handle social sono `resn_has_no_i` su Instagram e su X; su LinkedIn `resnglobal`.

**Newsletter**
`GAZETTE` · `PRIVACY` · placeholder `Email`
`It looks like something went wrong. Please try again.`
`Thanks! You are now subscribed.`

**Privacy**
`Resn Customer Privacy Notice`
`This privacy notice tells you what to expect us to do with your personal information.`
`hello@resn.co.nz` · `L7, 138-140 Wakefield Street, Te Aro, Wellington, 6011, NZ` · `Keizersgracht 174 1e verdieping, 1016 DW, Amsterdam, Noord-Holland Netherlands`
`last updated` — `10 May, 2024`

**Esempio di testo di progetto** (Tracing Art, cliente Getty, `May, 2025`)
> `Tracing Art brings to life real stories of art provenance using dynamic visuals and rich data from the newly updated Getty Provenance Index, one of the world's largest digital collections of archival records describing the ownership and market histories of artworks.`

Ruolo dichiarato per quel progetto, testuale:
`Strategy, Concept, Design, UX, UI, Creative Direction, Art Direction, Animation, Content Management, Development, Project Management`

**Non c'e' un piede.** Nessun footer, nessun copyright, nessuna barra di consenso cookie — e questo nonostante HubSpot, Google Analytics e LinkedIn Insight siano tutti attivi.

## Mobile

Questa e' la parte piu' utile: **mobile non e' lo stesso sito ridotto, e' un secondo sito**. Al caricamento il loader legge `config.MOBILE` e sceglie un altro bundle e un altro markup:

- desktop → `js/main_desktop_extended.js` (4.011.938 byte) + `index_desktop.html` + `css/all.css`
- mobile → `js/main_mobile.js` (2.954 KB misurati) + `index_mobile.html` + `css/all_mobile.css`
- esistono anche un flusso `TABLET` e uno `BASIC` per i desktop vecchi, entrambi sul bundle desktop. Non testati.

**Cosa SPARISCE**
- Le **schegge di fondo** (`.background__shards`): sul mobile il div non c'e' proprio.
- Il giocattolo **`TUNNEL`**: su mobile gli interattivi sono 6 invece di 7.
- I **suoni dell'interattivo `ROD`**: su desktop ha 6 campioni, su mobile l'array e' vuoto.
- Sulla home, **tre bottoni su quattro**: ho misurato solo l'hamburger visibile, a (347, 31) su viewport 390. Spariscono goccia, audio e showreel.
- Tutti gli **effetti di rivelazione del testo** nella pagina About: nel markup desktop ogni blocco ha `data-text-effect="paragraph"` e `data-fade-in="true"`, nel markup mobile quegli attributi non ci sono. About su mobile e' testo fermo.
- I link `<a>` attorno alle voci di menu: su mobile diventano `<div data-href="about">` gestiti a mano.
- La sottolineatura animata (`.underline.animate`) sui link di contatto: resta solo quella fissa.
- **La modalita' orizzontale**: `@media screen and (orientation:landscape) { .rotate-overlay { display: block } }` copre lo schermo con un pannello nero pieno. Il sito ti obbliga a ruotare il telefono in verticale.

**Cosa viene SOSTITUITO**
- La **goccia**: su desktop e' un oggetto piccolo al centro (circa un terzo dell'altezza); su mobile riempie tutto lo schermo, dal bordo superiore a quello inferiore, con l'aberrazione cromatica molto piu' marcata. E' l'unica cosa che si vede.
- I **canvas**: da 6 sul desktop a **2** sul mobile (la scena a schermo intero, 1170×2532 a dpr 3, piu' il cerchio della barra). Il cerchio della barra passa da 100×100 a 80×80.
- Il **carosello Work**: su desktop e' un pannello centrale con i vicini che sbucano ai lati e un'icona a doppia freccia; su mobile c'e' un lettore a tutto schermo con due link testuali in basso a sinistra (`View Project`, `Watch the case study`), un contatore posizione in basso a destra (in Work Sans) e una diversa icona di trascinamento disegnata in SVG con cinque `<line>`.
- Il bottone **`Close Project / Close Showreel / Close All Projects`** con testo esplicito diventa una singola `x` senza testo (`shell__button--close`).
- La **home** guadagna una voce che sul desktop non c'e': `VIEW ALL PROJECTS`, sottolineata, in alto al centro.
- Compaiono le **sfumature ai bordi** (`.page-edges`): due bande alte il 20% dello schermo, da `#161517` a trasparente, sopra e sotto, che sfumano il testo che scorre.

**Cosa RESTA**
- Tutti i testi, uno per uno, compresa l'informativa privacy per intero.
- La goccia 3D con lo stesso three.js r84.
- La struttura di navigazione a stati e le stesse rotte.
- Il carattere Fort e la scala tipografica, ridotta: titolo home da 48 a 20 px, voci di menu da 65 a 40 px, titoli About da 40 a 24 px.
- L'accento oro `#ffda93`, sempre e solo nella privacy.

**Il prezzo.** Su iPhone emulato (390×844, dpr 3) il preloader era **ancora in corso dopo 30 secondi**, e ancora dopo 2 minuti (la barra era passata da circa il 40% al 70%). La home e' comparsa a circa 5 minuti dall'inizio, dopo 152 richieste e 28,5 MB. La macchina di test era pesantemente contesa da altre sessioni, quindi il numero preciso non vale come benchmark — ma la scala del problema si': **il sito mobile scarica quasi 3 MB di JavaScript non compresso prima di mostrare qualsiasi cosa**.

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| caricatore di moduli | RequireJS | VERIFICATO | `<script data-main=".../js/loader" src=".../js/libs/require.js">` nell'HTML, e la `requirejs.config` completa in fondo a `loader.js` |
| architettura | Backbone 1.1.0 + Underscore 1.8.3 | VERIFICATO | `window.Backbone.VERSION` letto a runtime; header di licenza in `loader.js`; moduli `view/pages/*`, `view/modules/*` nel bundle |
| DOM | jQuery 2.1.4 (aprile 2015) | VERIFICATO | `window.jQuery.fn.jquery` a runtime |
| animazione | GSAP TweenMax 1.17.0 (maggio 2015) | VERIFICATO | `window.TweenMax.version` a runtime; header di licenza GreenSock in `loader.js`; plugin dichiarato: `ScrollToPlugin` |
| 3D | three.js **r84** (2017) | VERIFICATO | `window.THREE.REVISION` a runtime |
| post-processing | `EffectComposer`, `RenderPass`, `ShaderPass`, `MaskPass`, `ClearPass` | VERIFICATO | mappati uno per uno nella `requirejs.config` |
| shader propri | `ColourOffsetShader` (aberrazione cromatica), `NoiseShader` (grana), `BasicBlurShader`, `BlendPass`, `PremultiplierShader`, `ChokeShader` + `FXAAShader`, `BrightnessContrastShader`, `ColorCorrectionShader`, `ConvolutionShader`, `BurnShader`, `AdditiveBlendShader` | VERIFICATO | percorsi `shaders/*` e `three/shaders/*` nella `requirejs.config`; i due `.shader` della gemma sono referenziati ma non scaricabili dall'esterno (403) |
| fisica | cannon.js | VERIFICATO (presente) / SUPPOSTO (uso) | `cannon: "libs/cannon.min"` con `exports: "CANNON"` nella config; non ho visto quale interattivo la usi |
| grafica 2D e sprite | CreateJS — EaselJS 0.8.2, TweenJS 0.6.2, PreloadJS 0.6.2, SoundJS 0.6.0 | VERIFICATO | shim in `requirejs.config`; `window.createjs` esiste a runtime |
| audio | Howler (due versioni caricate: `howler` e `howler.2.min`) | VERIFICATO | `window.Howl` a runtime; mappa degli sprite in `data/sounds.json` |
| modelli 3D | SEA3D + SEA3DLZMA + `OBJLoader` | VERIFICATO (presente) | shim nella `requirejs.config` |
| morphing SVG | `SVGMorph.min` (`exports: "MORPH"`) + `svg-points` | VERIFICATO (presente) | `requirejs.config` |
| altro nel carrello | Handlebars, sylvester (algebra lineare), visibly, tap, stats.js, swfobject (!), mocha + expect | VERIFICATO (presente) | tutti dichiarati nella `requirejs.config`. `swfobject` e' il caricatore Flash: e' rimasto li' dal 2010 |
| rilevamento dispositivo | device.js + Modernizr 2.5.3 + es6-shim | VERIFICATO | `<script>` nel `<head>` e sorgente in chiaro in testa a `loader.js` |
| loop di animazione | un unico `requestAnimationFrame` centralizzato | VERIFICATO | modulo `util/anim_frame`, tutti i moduli si iscrivono con `AnimFrame.on('anim_frame', ...)` |
| smooth scroll | **nessuna libreria** | VERIFICATO | nessuna traccia di Lenis, Locomotive, VirtualScroll o simili nel bundle; solo interpolazione lineare a mano con coefficienti `0.1` e `0.12` |
| routing | Backbone Router, hashbang | VERIFICATO | `location.hash` diventa `#!/menu`, `#!/work`, `#!/work/all` |
| CMS | nessuno visibile | VERIFICATO (assenza) | i contenuti sono file statici: `data/projects.json` (870 KB, 84 progetti di cui 80 attivi, 18 in evidenza), `data/categories.json`, `data/interactives/interactives.json`, `data/sounds.json`, `data/letters.json` |
| hosting | Amazon S3 dietro CloudFront | VERIFICATO | header `Server: AmazonS3`, `Via: 1.1 ...cloudfront.net`, `X-Amz-Cf-Pop: FCO50-P8`; i percorsi mancanti rispondono con XML `<Error><Code>AccessDenied</Code>` di S3 |
| cache busting | cartella di build con marca temporale | VERIFICATO | tutti gli asset stanno sotto `/20260721233115_1_0_a02666f/`; il commento HTML in fondo dichiara `version: 1.0.a02666f` |
| immagini | `.webp` per i contenuti dei progetti, `.png` e `.jpg` per alcuni poster | VERIFICATO | percorsi in `projects.json`; nessun `<picture>`, nessun `srcset`: la scelta della misura la fa il JavaScript con chiavi tipo `poster` / `poster_m` |
| video | MP4 diretti da Vimeo (`player.vimeo.com/progressive_redirect/playback/<id>/rendition/1080p/file.mp4` con firma) | VERIFICATO | dentro gli item `videoloop` di `projects.json`; non usano il player di Vimeo, si prendono il file |
| newsletter | Mailchimp | VERIFICATO | `<div id="mc_embed_signup">`, campo trappola `b_b22ce02943773ea2da8afedee_8fe59b876f` fuori schermo a `left: -5000px` |
| marketing e analitica | HubSpot (portale `5452172`), Google Tag Manager + GA4, LinkedIn Insight Tag, DoubleClick | VERIFICATO | host contattati: `js.hs-scripts.com`, `js.hs-banner.com`, `js.hs-analytics.net`, `js.hsadspixel.net`, `api.hubapi.com`, `track.hubspot.com`, `cta-service-cms2.hubspot.com`, `perf-na1.hsforms.com`, `www.googletagmanager.com`, `region1.analytics.google.com`, `stats.g.doubleclick.net`, `snap.licdn.com`, `px.ads.linkedin.com` |

**In sintesi**: e' un sito del 2016 tenuto in vita fino al 2026. jQuery 2.1.4, GSAP 1.17, Backbone, RequireJS e three.js r84 sono tutti fermi tra il 2015 e il 2017. Il pacchetto tecnologico dichiarato da Awwwards nel 2016 (jQuery, WebGL, GSAP, Underscore.js, Backbone.js, RequireJS, GLSL, Modernizr) coincide esattamente con quello che ho trovato oggi.

## Peso e prestazioni

Misurato in Chrome desktop (viewport 1442×670, dpr 1.25) su una macchina condivisa con altre sessioni. Non ho eseguito Lighthouse.

**Desktop, a sessione ferma**
- **136 richieste**, **~27,6 MB** trasferiti
- ripartizione: script 15 richieste / 4.350 KB · immagini 69 / 13.019 KB · XHR 37 / 9.990 KB · CSS 5 / 158 KB
- `first-paint` **3,832 s** · `DOMContentLoaded` **3,375 s** · `load` **6,724 s** · `first-contentful-paint` **31,232 s**
- 17 host di terze parti contattati

**Mobile emulato (iPhone 390×844, dpr 3)**
- **152 richieste**, **~28,5 MB**
- preloader ancora in corso a 30 s e a 120 s; home visibile intorno ai 5 minuti sulla macchina di test (contesa: cifra non attendibile come benchmark)

**I file grossi**

| file | peso trasferito |
|---|---|
| `js/main_desktop_extended.js` | **4.011.938 byte** |
| `js/main_mobile.js` | 2.954 KB |
| `js/loader.js` | 245.606 byte |
| `img/projects/sheer-cupidity/hero-V4.png` | 1.967 KB |
| `img/projects/adobe-bowie/poster-desktop.png` | 1.507 KB |
| `img/projects/just/desktop/JUST_cover.png` | 1.505 KB |
| `data/projects.json` | 850 KB — **richiesto due volte** nella stessa sessione |
| `audio/bg_01.mp3`, `bg_02.mp3`, `bg_03.mp3` | 713 KB ciascuno |
| `css/all.css` | 63.673 byte |

**Il difetto piu' grave, verificato.** Gli asset di testo sono serviti **senza alcuna compressione**. Ho ripetuto la richiesta con `Accept-Encoding: gzip, deflate, br` e la risposta non ha nessun header `Content-Encoding`: `Content-Length: 4011938`, identico. Comprimendo lo stesso file in locale con gzip vengono **849.697 byte**: si risparmierebbe il **79%**, cioe' oltre 3 MB sul solo bundle principale. Vale anche per `all.css` (63.673 byte non compressi) e per `projects.json` (850 KB non compressi, scaricati due volte). E' una configurazione mancante su CloudFront, non un problema di progetto: si sistemerebbe senza toccare una riga di codice.

**Il secondo difetto.** Il caricamento e' tutto-o-niente. Non c'e' nessun rendering progressivo: il preloader tiene lo schermo nero finche' non ha finito, e "finito" significa aver scaricato l'intero bundle piu' i poster dei progetti in evidenza. Da qui il `first-contentful-paint` a 31 secondi.

## Tre cose da rubare

**1. Il testo che appare a chiazze, fatto con una maschera a triangoli su canvas 2D.**
Non e' una dissolvenza e non e' un `clip-path`. Serve un `<canvas>` per ogni parola. Nel loop: (a) su un canvas di maschera si riempie tutto di un colore opaco con `globalAlpha` pari a `maskBaseOpacity` (parte da 0 e arriva a **0.05**, cioe' il testo resta comunque quasi trasparente sul fondo); (b) sopra si disegnano **3 triangoli** pieni, disposti a 120° attorno al centro, ciascuno con una rotazione iniziale casuale e una velocita' casuale tra `0.08` e `0.18` gradi per frame, e con l'orbita a distanza `radiusX × radiusMultiplier`; (c) sul canvas visibile si disegna il testo con `fillText`; (d) si applica `ctx.globalCompositeOperation = 'destination-in'` e si disegna sopra il canvas di maschera. Il reveal e' un solo tween: `radiusMultiplier` da **2 a 0.9** con `Cubic.easeOut` — i triangoli entrano da fuori campo e si stringono sulla parola. Il lato del triangolo e' `max(larghezza, altezza) × 0.5`, le semiassi dell'orbita `0.8` e `0.6` del lato. Costa un canvas per parola e gira dentro un `requestAnimationFrame` condiviso.

**2. Tre soglie di tempo su un solo gesto del puntatore.**
Lo stesso `mousedown` produce tre esiti a seconda di quanto lo tieni: **160 ms** — se arriva un secondo `mousedown` entro questa finestra e' un doppio clic e si naviga; **300 ms** — se stai ancora premendo, viene istanziato l'interattivo (uno di 7, con un contatore `n / 7` che te lo dice); **1.500 ms** — l'interfaccia si spegne da sola e resta solo il gioco, e torna al rilascio. Nessuna istruzione a schermo se non due parole (`CLICK & HOLD`) che compaiono per due secondi e se ne vanno. La lezione rifacibile e' l'ultima: **la UI si toglie di mezzo da sola quando capisce che stai giocando**, e nessuno deve premere una `x`.

**3. Contenuti in JSON statici, e la cartella di build come cache busting.**
Niente CMS, niente API, niente server: ottantaquattro progetti stanno in un solo `projects.json` di 870 KB, ogni progetto e' un array di `items` tipizzati (`image`, `text`, `headline`, `videoloop`, `video`, `carousel`, `mask`, `mobile`) posizionati su una griglia a colonne (`width_columns`, `left_columns`, `top_offset`), e la pagina progetto e' un renderer generico di quell'array. Tutti gli asset vivono sotto una cartella con marca temporale (`/20260721233115_1_0_a02666f/`): ogni pubblicazione crea una cartella nuova, quindi ogni file e' immutabile e cacheabile per sempre senza query string ne' invalidazioni di CDN. Sopra ci basta S3 con davanti CloudFront. Il ribaltamento sta nel fatto che la **rotta pubblica non cambia mai** mentre **il percorso degli asset cambia a ogni build**: e' il contrario di quello che fa quasi tutto il mondo. (Se lo copi, ricordati di accendere gzip/brotli — vedi sopra cosa succede se te ne dimentichi.)

## Non verificato

- **Il foundry e la licenza del carattere Fort.** So che e' servito in casa da `/fonts` in `.eot`/`.woff`/`.svg`, non chi lo disegna.
- **Le pagine di progetto vere.** Non ne ho aperta nessuna a schermo. La loro struttura la deduco da `data/projects.json` e dai nomi dei moduli (`project_image_view`, `project_videoloop_view`, `project_mask_view`, `project_carousel_view`). Il comportamento reale di scroll, maschere e caroselli non l'ho visto.
- **Lo showreel.** La `reel-page` esiste nel markup con un video e una timeline disegnata su canvas. Non l'ho aperto.
- **Sei dei sette giocattoli.** Ho visto solo `SHAPESHIFTER` (il numero 2). Di `AWWWARD`, `ROD`, `BAT`, `TUNNEL`, `SKETCH`, `CUBES` conosco solo i manifest: quante texture, quanti suoni, il percorso della classe. `AWWWARD` e' il piu' corredato (14 texture, 31 suoni) e ha il numero 1, quindi con ogni probabilita' e' quello centrale, ma non l'ho visto.
- **Gli shader della gemma.** `data/shaders/gem_vertex.shader` e `gem_fragment.shader` sono richiamati dal codice ma dall'esterno rispondono 403: il GLSL vero non l'ho letto. Quello che dico sull'aberrazione cromatica e sulla grana viene dai nomi dei moduli di post-processing, non dal codice degli shader.
- **Il flusso tablet e il flusso "basic"** per i desktop vecchi. Esistono nel loader (`FLOWS.TABLET`, `FLOWS.BASIC`) e il CSS ha regole `.tablet` dedicate; non li ho provati.
- **I tempi su una macchina pulita e su rete mobile reale.** Le mie misure vengono da un browser condiviso con una decina di altre sessioni pesanti. I rapporti (bundle non compresso, nero per 20+ secondi) sono solidi; i secondi esatti no.
- **Il colore del fondo percepito** (`≈ #212121`): stimato da screenshot. In CSS il `body` e' nero pieno; quel grigio nasce dalla scena WebGL e dal grain, non da una dichiarazione.
- **Se dietro i JSON ci sia un CMS.** I file serviti sono statici; il processo che li genera non e' ispezionabile da fuori.
- **Lighthouse.** Non eseguito, nessun punteggio da riportare.
- **La lunghezza in schermate** di About, Privacy e Overview: non misurata.
