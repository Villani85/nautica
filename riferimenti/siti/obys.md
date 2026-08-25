# Obys Agency

- **URL**: https://obys.agency
- **Premio**: Awwwards Site of the Day del 04/05/2026, voto 7.46/10 (Dev award 7.98/10). Tag Awwwards: Portfolio, Scrolling, Gallery, Storytelling, WebGL. Fonte: https://www.awwwards.com/sites/obys-2
- **Studio**: Obys (auto-commissionato). Olha Olianishyna (Managing Director), Viacheslav Olianishyn (Design Director), Surya Aditya (sviluppo, da crediti Awwwards). Fondato 2018, sede EU (AMS, WAW, BER).
- **Anno**: 2026 (footer "All rights reserved. (c)2026 Obys"; SOTD maggio 2026)
- **Letto il**: 13/08/2026

> Nota di metodo: la scheda e' costruita leggendo il **sorgente vero** scaricato con curl /
> Invoke-WebRequest (HTML, `d.css`, `d.js`, `m.css`, `m.js`, il woff2) piu' il case study
> ufficiale su Awwwards. Il browser condiviso era occupato da altri agenti e mi ha
> dirottato la scheda tre volte, quindi **non ho screenshot miei**: tutto quello che
> segue e' letto nel codice, non guardato. Dove serviva l'occhio, l'ho scritto in
> "Non verificato". Nessuna scheda lasciata aperta da me (non ho mai chiamato
> `tabs_create`; ho riusato la pagina condivisa gia' esistente).

---

## L'ESPERIENZA (integrazione)

> Blocco aggiunto il 13/08/2026 riscaricando con `curl` la home desktop (90.186 B), la home
> mobile (24.849 B, HTML diverso) e `/about` (36.291 B), ed estraendo i testi veri.
> Risponde alle domande che servono a un'agenzia. Le sezioni tecniche piu' sotto restano
> valide.

### Di cosa tratta il sito, in concreto

Diciannove progetti, un paragrafo sullo studio, un indirizzo email, e una pagina About.
**Tutto qui.** Ed e' un'informazione strutturale, non una critica: Obys ha deciso che il
portfolio non ha bisogno di argomenti.

La cosa da capire prima di ogni altra: **la home non scorre.**
`document.documentElement.scrollHeight` e' uguale all'altezza del viewport. Non c'e' una
"seconda schermata", non c'e' un "sotto la piega". La rotella non muove la pagina: muove
**la lista dentro la pagina**, e la lista e' in loop infinito. Il sito e' una **vetrina con
un nastro trasportatore dietro il vetro**, e il logo O al centro e' il vetro.

### Cosa vende, e qual e' l'obiettivo finale

**Dichiarato** (meta description, unico claim scritto del sito):
> Concept-driven design studio based in the EU. Crafting award-winning brand and web
> experiences shaped by storytelling and strong visual systems.

**Vero, e scritto nero su bianco nell'About** — e' l'unico dei quattro studi che dichiara il
proprio modello commerciale in una frase:
> **Obys takes on a limited number of projects each year, partnering with marketing leaders
> and founders who value authorship, clarity and long-term brand impact.**

Cioe': vendono **scarsita' e paternita' del lavoro**. Non capacita' produttiva (sono meno di
10), non tecnologia (lo dicono: modernismo, griglia, tipografia), non velocita'. Vendono il
fatto che il progetto lo dirigono i fondatori. La frase che chiude il manifesto e' la
dichiarazione di prezzo travestita da manifesto: **"No layers. No dilution."**

**Conversione:** una mail a `info@obys.agency`. E il meccanismo e' particolare e vale la
pena copiarlo: il pulsante "Contact" dell'header **non apre il client di posta** — copia
l'indirizzo negli appunti e il testo diventa `Copied` per 2000 ms, poi torna `Contact`.
Niente `mailto:` (cioe' niente roulette del client di posta predefinito), nessun modulo,
nessun campo. Chi vuole scrivere, incolla e scrive dal proprio strumento.

### A chi si rivolge

Lo dicono loro, testualmente: **"marketing leaders and founders"**. Cioe' non l'ufficio
acquisti e non il project manager: **chi decide da solo e non deve giustificare la scelta a
un comitato.** Le industrie sono elencate: Architecture, Fashion, Technology, Culture,
Education, Finance, Automotive, Furniture.

Questo compratore non teme che il lavoro sia brutto: teme di **essere passato a un team
junior dopo la firma**. E' esattamente la paura a cui rispondono, con tre frasi in fila:
*"Our team remains intentionally small, under 10 people"* / *"Every project is led closely by
the founders"* / *"No layers. No dilution."*

### L'esperienza progettata, passo per passo, e con che ritmo

| momento | quando | cosa succede | ritmo |
|---|---|---|---|
| **Cancello** | 0 → ~2,5 s | nero pieno, contatore `00` in alto a destra, barra da 2,5 px | breve (secondi, non decine di secondi) |
| **Firma** | ~1,5 → 2,5 s | le due meta' del logo fanno morphing: due parentesi quadre diventano i lobi di una sfera con i meridiani | il marchio si costruisce davanti a te |
| **Rientro** | ~2,5 → 4,0 s | tutta l'interfaccia risale a cascata con stagger di 60 ms: wordmark, Work, About, orologio, Contact, i tre modi, il copyright | una sola onda |
| **Il testo** | ~3 s in poi | il paragrafo dello studio entra riga per riga | l'unico "contenuto" che si rivela |
| **Regime** | da qui in avanti | **nessuna sezione successiva, nessun tempo morto.** La rotella scorre i 19 progetti in loop; il logo si apre e si chiude sul passaggio delle foto | continuo, senza inizio e senza fine |

**Non c'e' arco narrativo.** Nessun crescendo, nessun climax, nessuna chiusura. E' una
condizione stabile in cui si entra dopo quattro secondi e da cui si esce quando si vuole.
E' l'opposto esatto di Lusion (56 schermate con un finale) e di Resn (un cancello da
superare).

L'unico cambio di stato importante e' il **selettore di modo** in basso a sinistra:
`Vertical,` `Horizontal,` `Grid`. Tre modi di guardare gli stessi 19 lavori. Non aggiunge
informazione: **aggiunge controllo**, ed e' l'unico gioco che il sito concede.

### Cosa deve fare il visitatore, e dove lo portano

1. **Guardare.** Il sito e' gia' tutto li'.
2. **Girare la rotella** → la lista scorre in loop; il progetto al centro cambia, la riga
   meta (categoria / servizi / numero) si sostituisce, il logo si allarga o si stringe.
3. **Cambiare modo** (Vertical / Horizontal / Grid).
4. **Cliccare un progetto** → `/work/<slug>`: una schermata sola, titolo + due righe meta +
   `Live Website`, e una colonna di galleria.
5. **Cliccare About** → l'unica pagina lunga del sito.
6. **Cliccare Contact** → l'indirizzo finisce negli appunti.

Non lo si "porta" da nessuna parte: **lo si tiene fermo e gli si fa passare davanti il
lavoro.** L'immagine che resta e' quella meccanica: la O che si apre e lascia passare una
foto, e si richiude.

### Come e' organizzata la persuasione

Il punto forte di questo sito, in una riga: **tutta la persuasione sta nella schermata 1.**

| leva | dove sta | schermate dall'inizio |
|---|---|---|
| **Promessa** | il paragrafo fisso in colonna destra, sempre a schermo | **0** |
| **Prova** | 19 lavori che passano al centro, con marchi leggibili (Porsche, Miro, Peter Lindbergh, Makhno) | **0** |
| **Qualificazione** | la riga meta: categoria + servizi + numero, per ogni progetto | 0 |
| **Contatto** | `info@obys.agency` scritto per esteso, e il pulsante Contact | **0**, entrambi |
| **Prova pesante** | pagina About: premi, conferenze, stampa, ventun foto di studio | 1 clic |
| **Scarsita' / prezzo implicito** | *"a limited number of projects each year"*, *"under 10 people"* | 1 clic |
| **Prezzo esplicito** | **assente** | — |

Il paragrafo fisso della home e' l'unico testo di vendita, e non parla di risultati ne' di
servizi — parla di **cura**:

> The studio is shaped by people who care deeply about design and the process behind. Each
> project becomes a case study and a meaningful part of our portfolio, developed with care
> and attention.

Da leggere bene: *"Each project becomes a case study and a meaningful part of our
portfolio"*. Sta dicendo al cliente che **il suo progetto servira' anche a loro**. E' un
patto dichiarato — voi ci date un lavoro che possiamo mostrare, noi ci mettiamo la firma —
ed e' il motivo per cui non c'e' bisogno di parlare di prezzo.

### Cosa arriva a chi NON scorre fino in fondo

**Su desktop: tutto.** E' l'unico dei quattro siti dove la domanda non si pone, perche' non
c'e' un "fondo". Chi arriva e chiude dopo cinque secondi ha gia' ricevuto: chi sono
(wordmark), cosa fanno (19 lavori con i loro settori), come si pongono (il paragrafo), e
come si scrive loro (l'email per esteso). **Persuasione a costo zero di scorrimento.**

**Su telefono: molto meno, ed e' un buco vero.** Verificato nell'HTML mobile (24.849 B, un
documento diverso servito dallo stesso URL):

- **il blocco fisso `#fix` sparisce** → **il paragrafo dello studio non c'e';**
- **`info@obys.agency` scritto per esteso sparisce** con lui;
- spariscono l'orologio, il copyright, i tre modi, la griglia editoriale, tutto il WebGL.

Sul telefono resta: l'header (`Work` · `About` · `Contact`), la colonna di 19 immagini, e il
logo O al centro. Cioe' **il pitch scritto viene tagliato proprio sul dispositivo in cui il
visitatore ha meno pazienza**, e l'unico contatto rimasto e' un pulsante che copia negli
appunti — un gesto che su un telefono e' quasi inutile. Le due build fatte a mano sono un
esempio tecnico eccellente (vedi "Tre cose da rubare"), ma la scelta editoriale dentro
quella build ha lasciato indietro il messaggio.

E un dettaglio che dice tutto sulla loro idea di controllo: **in orizzontale il sito non
esiste.** Se `innerHeight < 500 && innerWidth < 950` compare a schermo pieno
**"Please rotate your device"**.

### Come costruiscono la fiducia (e' questo il prodotto)

Obys costruisce fiducia in modo diverso dagli altri tre: non con la potenza tecnica, ma con
**le prove di esistenza**.

- **Clienti**: mai un muro di loghi. Una frase sola nell'About —
  *"partnerships with brands such as CNN, Porsche, Hilton, Miro, Makhno and Glyphic
  Biotechnologies"* — e poi i marchi leggibili dentro i 19 titoli.
- **Premi, con il disclaimer**: l'elenco e' lungo (Studio of the Year Awwwards 2023, 4x
  Studio of the Year CSSDA, Best of the Best Red Dot, Jury Prize European Design Awards,
  30+ SOTD, 35+ WOTD, 3x Communication Arts, *"and 60+ more..."*) ma e' chiuso da una
  clausola che vale piu' dell'elenco: **"not as an objective, but as a reflection of
  consistent standards"**. Si vantano e si scusano nella stessa frase.
- **La griglia di 21 foto di studio, con le didascalie**: e' la leva piu' originale del
  sito. Non sono render, sono **prove che lo studio e' un posto vero, con persone che
  viaggiano**. Le didascalie, testuali: `Dior / Business Trips / Paris, France / 2023` ·
  `Awwwards / Conference, Trophy / Studio of the Year / 2020` ·
  `Awwwards / Trophy / Studio of the Year / 2023` · `Obys / Studio Events / Hoverla (2061m)
  Hiking / 2022` · `Obys / Business Trips / Zurich, Switzerland / 2025` ·
  `TGG / Conferences / Osijek, Croatia / 2025` · `Obys / Business Trips / Rome, Italy / 2024`
  · `Obys / Business Trips / Museum of Modern Art / 2024` · `Obys / Photography / Team Photo
  / 2019`. Dieci anni di vita di studio impaginati come un archivio.
- **Persone con nome e ruolo**: `Olha Olianishyna (Managing Director)` e
  `Viacheslav Olianishyn (Design Director)`, e sull'About il logo O diventa una cornice: al
  passaggio del mouse sul nome di un fondatore, dentro l'apertura della O compare il suo
  ritratto. **Il marchio si apre e dentro c'e' una faccia.**
- **Insegnamento come prova**: quattro conferenze pubbliche datate (The Geek Gathering
  Osijek 2025, Awwwards Valencia 2024, Dysarium Lviv 2024, Awwwards Amsterdam 2022) e una
  piattaforma educativa propria (Design Education Series), che compare **anche come
  progetto numero 08 del portfolio**. Insegnare il metodo e' il modo piu' forte di
  dimostrare di averne uno.
- **Stampa**: Codrops, Red Dot, Awwwards, FWA, Communication Arts, Top Interactive Agencies,
  50Pros.
- **Il carattere disegnato in casa**: `OTF Obys NG by Obys`, accreditato in fondo all'About
  accanto ai premi. Un neo-grottesco proprietario e' la firma piu' cara che uno studio di
  design possa esibire, e infatti la mettono in fondo come si firma un quadro.
- **Processo**: non c'e' un metodo per fasi, ma c'e' una **filosofia dichiarata**, ed e' piu'
  di quanto facciano gli altri tre — *"Rooted in modernist design principles and graphic
  design tradition, our work combines typography, grid systems and motion"*.

### I testi veri principali

Interfaccia (tutta la home sta qui):

> `Work` · `About` · `CEST 10:14 AM` · `Contact` (al clic: `Copied`)
> `Vertical,` · `Horizontal,` · `Grid`
> `Back` · `Live Website` · `All rights reserved. ©2026 Obys`
> `Please rotate your device`

Blocco fisso (l'unico testo di vendita della home, **assente su telefono**):

> The studio is shaped by people who care deeply about design and the process behind. Each
> project becomes a case study and a meaningful part of our portfolio, developed with care
> and attention.
> **Contact:** info@obys.agency

Manifesto About, integrale:

> Obys is a concept-driven design studio founded by Olha Olianishyna and Viacheslav
> Olianishyn in 2018 and based in the EU (AMS, WAW, BER).
> Rooted in modernist design principles and graphic design tradition, our work combines
> typography, grid systems and motion to create digital experiences that balance clarity,
> usability and bold visual expression.
> Our team remains intentionally small, under 10 people, which allows creative direction to
> stay personal and decisions to stay sharp. Every project is led closely by the founders.
> **No layers. No dilution.**

> Over the years, our work has grown from independent collaborations to partnerships with
> brands such as CNN, Porsche, Hilton, Miro, Makhno and Glyphic Biotechnologies. Along the
> way, Obys was named Studio of the Year by Awwwards in 2023, received 4x Studio of the Year
> titles from CSS Design Awards, and earned Red Dot recognition — **not as an objective, but
> as a reflection of consistent standards**

> We live design daily, not only through client work, but through research, experimentation,
> public talks and education. The studio's methodology has evolved into its own educational
> platform, where we share the thinking behind our practice.

> **Obys takes on a limited number of projects each year, partnering with marketing leaders
> and founders who value authorship, clarity and long-term brand impact.**

Meta (cio' che arriva a chi vede solo il link):

> Obys Agency
> Concept-driven design studio based in the EU. Crafting award-winning brand and web
> experiences shaped by storytelling and strong visual systems.

---

## Cosa vende

Il tempo di uno studio di 10 persone che progetta identita' e siti su misura, e che
prende "un numero limitato di progetti l'anno". Il sito e' un portfolio di 19 lavori:
non spiega servizi, dimostra controllo tipografico e di movimento.

## A chi

Marketing lead e fondatori di brand (moda, architettura, tecnologia, automotive) che
comprano autorialita', non produzione. Il pensiero che devono avere uscendo e':
"questi controllano ogni pixel e ogni millisecondo, non li si compra a listino".
Testo esplicito nell'About: *"partnering with marketing leaders and founders who value
authorship, clarity and long-term brand impact."*

## Idea regista

Il logo O sta fisso al centro dello schermo in `mix-blend-mode: difference` e tutto il
sito - immagini, titoli, meta - scorre **attraverso** di lui: il sito e' una lente, non
una pagina.

## Il momento

Il logo si apre. Le due meta' della O (`#logo-l`, `#logo-r`) traslano di ±137% con
`transition: transform 1s cubic-bezier(.16,1,.3,1)` (classe `is-spread`), e nel varco
passa la colonna di immagini del portfolio. L'ampiezza del varco **respira**: nel JS,
`calcLogoGap()` calcola una media pesata dell'altezza degli item vicini al centro
(peso `(1 - d/B)^2`) e fa tendere `logoGap` a `logoGapBase + (maxItemH - mediaPesata)*0.5`
con smorzamento esponenziale. Quindi la O si allarga quando sta passando una foto alta
e si richiude quando passa una piccola. In piu' `--logo-y` / `--logo-y1` sono offset
verticali smorzati (lambda 0.09) legati allo scroll: la O deriva di poco contro il
movimento della lista.

Non cade a una percentuale di scroll: cade in continuo, ogni volta che un progetto
attraversa il centro. Sull'About lo stesso meccanismo diventa un ritratto: il logo si
ridimensiona alla larghezza del visual centrale (`--logo-w` = `#ab-co-vis`.offsetWidth) e
al passaggio del mouse sui nomi dei fondatori (`data-founder`) cambia la foto dentro
l'apertura.

## Struttura, sezione per sezione

La home **non scorre**. `document.documentElement.scrollHeight` = altezza del viewport
(misurato: 1080 su viewport 1080). `main` e `.page_` sono `position:absolute; height:100%;
overflow:hidden`. Lo scroll e' virtuale: la rotella pilota `scrollS[modo].cur/tar` in JS e
la lista e' infinita (`calcLoopLens` / `wrapAt`, wrap a meta' del ciclo).

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |
|---|---|---|---|
| Preloader | fondo nero pieno, contatore numerico che parte da `00` in alto a destra in blend difference, barra di avanzamento nera 2.5px in cima | attende | ~1 schermata, poi il contatore esce verso l'alto (`y: 0 -> -110%`, 300ms) e il nero sfuma in bianco |
| Header (fisso, sempre) | wordmark Obys SVG a sinistra; a destra "Work, About" + orologio "CEST 10:14 AM" + bottone "Contact" | clic Work/About, clic Contact | fisso |
| Blocco fisso `#fix` | paragrafo di 5 righe sullo studio + "Contact:" + `info@obys.agency` sottolineato | hover sull'email | fisso, colonna di 2 su 12, a destra |
| Home / modo **Vertical** (`#ho-wo-0`) | colonna centrale di 19 miniature; a sinistra la colonna con TUTTI i 19 titoli in mascheratura; a destra-centro la riga meta (categoria / servizi / numero 01-19) | rotella verticale | 1 schermata fissa, lista in loop infinito |
| Home / modo **Horizontal** (`#ho-wo-1`) | le stesse 19 miniature in **riga**, ciascuna ruotata `rotate(-90deg)`; stack dei titoli spostato in basso a destra (`height:24.5rem`, `clip-path: inset(13.5% 0 0 0)`) | rotella (asse orizzontale, o shift+rotella) | 1 schermata fissa, loop infinito |
| Home / modo **Grid** (`#ho-wo-2`) | griglia editoriale a 12 colonne, ogni tessera piazzata a mano con `--gr`/`--gc` (riga/colonna per breakpoint), `gap: 8rem 1rem` | hover su una tessera | scorre in verticale |
| Grid / stato hover | anteprima grande fissa al centro (`clip-path: inset(50%)` -> `inset(0%)` in .8s), titolo del progetto a 8rem incollato al fondo schermo, riga meta a mezza altezza | muove il mouse | - |
| Selettore di modo | in basso a sinistra: `Vertical,` `Horizontal,` `Grid` (tre `<button>`), sottolineatura scaleX sul selezionato | clic | fisso |
| Copyright | in basso a destra, `#c9c9c9` | - | fisso |
| Pagina progetto `/work/<slug>` | una sola schermata: a sinistra titolo + due righe meta + link "Live Website"; a destra una colonna alta quanto lo schermo con la galleria. **Nel DOM `#wo-ga` e' vuoto**: la galleria e' disegnata in WebGL | scorre dentro la colonna | 1 schermata fissa |
| About | manifesto a 4rem; griglia di 21 foto di studio (viaggi, conferenze, vita in studio) con meta al passaggio; blocchi Services / Industries / Selected Awards / Latest Public Speeches / Featured Press / Socials; footer con lettering grande | scorre, hover sui fondatori | pagina lunga |

## L'esperienza in ordine di tempo

**0.0s** - Fondo nero pieno (`#preloader-bg`, `var(--black)`). In alto a destra il numero
`00` in bianco su `mix-blend-mode: difference`. In cima allo schermo una barra alta 2.5px
che avanza con due transizioni annidate misurate nel DOM live:
`transform 1000ms cubic-bezier(0.76,0,0.2,1)` sul contenitore e
`transform 3500ms cubic-bezier(0.16,1,0.3,1)` (expo.out) sull'interno.

**0.0-1.5s** - Le due meta' del logo partono da `opacity:0` e vengono impostate a mano dal
JS. Il logo ha classe `is-intro`, che **disattiva la transizione** (`#logo.is-intro>svg
{transition:none}`): l'intro e' guidata a frame, non dal CSS.

**~1.5-2.5s** - Le due meta' della O fanno morphing. Ogni path ha un attributo `data-d`
con la forma d'arrivo: le due parentesi quadre del marchio diventano i due lobi di una
sfera con i meridiani. Il codice interpola `globeSrcL/globeSrcR` verso `globeTgtL/globeTgtR`.

**~2.5s** - Il nero esce: il contatore scivola su (`y: 0 -> -110%`, 300ms, ease "i3"),
poi `#preloader-bg` va a `opacity 0` in 300ms con 150ms di ritardo, cambia
`background-color` a bianco e il nodo viene rimosso.

**~2.5-4.0s** - Rientro in cascata dell'interfaccia, un'unica timeline con stagger di 60ms
su: i path dell'SVG del wordmark (`y: 120% -> 0`), le voci "Work"/"About", l'orologio, il
bottone "Contact", i tre bottoni di modo, il copyright (tutti `y: 110% -> 0`). Durata di
ciascuno: 1600ms, easing "o6" (default `translate.show` letto nel bundle:
`{duration:1600, ease:"o6"}`).

**~3s in poi** - Le righe di testo del blocco `#fix` entrano riga per riga: ogni riga e'
avvolta in `.ln_` (overflow hidden) con dentro `.ln` a `translateY(102%)` che sale a 0.

**Da qui** - Nessun tempo morto e nessuna "sezione successiva". La rotella muove la lista,
il logo respira, le meta del progetto al centro si sostituiscono. L'unico cambio di stato
grosso e' il clic su Vertical / Horizontal / Grid.

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| lista progetti (Vertical/Horizontal) | traslazione della colonna/riga | rotella, virtuale | lerp/damp a frame (`_0(cur,tar,lambda)`, esponenziale, indipendente dal frame rate) | 45 occorrenze di `lerp` e 21 di `damp` nel bundle; nessuna libreria |
| lista progetti | wrap infinito | posizione di scroll | - | `calcLoopLens` misura il ciclo, `wrapAt = loopLen/2 + maxH` |
| logo O | apertura delle due meta' ±137% | stato hover / item attivo (classe `is-spread`) | `transform 1s cubic-bezier(.16,1,.3,1)` | il varco poi si smorza a codice su `logoGap` |
| logo O | ampiezza del varco | altezza media pesata degli item vicini al centro | smorzamento esponenziale | vedi "Il momento" |
| logo O | deriva verticale | scroll | damp lambda `0.09` | via variabili CSS `--logo-y`, `--logo-y1` |
| logo O | morphing dei path | tempo (solo intro) | interpolazione punto a punto | forma d'arrivo negli attributi `data-d` |
| logo O (About) | larghezza | larghezza di `#ab-co-vis` | `width 1.6s cubic-bezier(.19,1,.22,1)` (expo.out) | `--logo-w` |
| immagini portfolio (desktop) | passaggio da grigio a colore | vicinanza/hover | interpolazione dell'uniform `g` | **fatto nel fragment shader**: `color = mix(color, toGray(color), g); color = mix(color, 0.5+(color-0.5)*0.85, g)` - desatura E abbassa il contrasto al 85% insieme |
| immagini portfolio (desktop) | bordi morbidi | posizione nel viewport | `aaStep(mTB.x, 1-vPosition.y) * ...` | maschera antialiasata su 4 lati, nel shader: le immagini sfumano ai bordi della colonna invece di essere tagliate |
| tessera Grid, hover | anteprima al centro | hover | `clip-path: inset(50%) -> inset(0%)`, `.8s cubic-bezier(.16,1,.3,1)` | l'immagine dentro fa `scale(1.15) -> scale(1)` in `1.6s` stessa curva: il clip apre piu' veloce dello zoom |
| tessera Grid, hover | cornice | hover | `opacity 0/1` | `border: .1rem solid #0000001a; inset: .1rem` |
| titolo progetto (Grid) | risalita | hover | `d:1200, e:"o6"` | `translateY(110%) -> 0` |
| meta progetto | risalita | hover / cambio item | `d:1200, e:"o6", de:60` in ingresso; `d:300, e:"o2"` in uscita | asimmetria voluta: entra in 1200ms, esce in 300ms |
| tutti i testi | rivelazione riga per riga | scroll (trigger interno) | default `translate.show {1600ms, "o6"}`, `translate.hide {600ms, "i3"}` | marcatore `mo-ln` sul contenitore, `_sl` sul testo da spezzare; ogni riga in `.ln_`/`.ln` |
| testi | stagger | numero di righe | `stag = clamp(5*durata/numOggetti, 20, durata)` ms | lo stagger si accorcia da solo quando le righe sono tante |
| blocchi di elementi | dissolvenza a cascata | scroll | opacita' 0->1 | marcatore `mo-fd`; passo **50ms se piu' di 10 elementi, altrimenti 100ms** |
| sottolineature link | comparsa | hover / stato attivo | `transform .8s cubic-bezier(.19,1,.22,1)` | `scaleX(0)->scaleX(1)` con `transform-origin` che passa da `right` a `left`: entra da sinistra ed esce a destra |
| link email `#fix-co-em` | sparizione della riga | hover | `transform .6s cubic-bezier(.16,1,.3,1)` | logica invertita: la riga c'e' e **sparisce** all'hover (`:hover .l {scaleX(0)}`) |
| wordmark header | restringimento a monogramma | classe `is-shrink` | `max-width .8s cubic-bezier(.16,1,.3,1)` | da 2 colonne a `4.05rem` |
| bottone Contact | testo | clic | - | copia `info@obys.agency` negli appunti, il testo diventa `Copied` e torna `Contact` dopo **2000ms** |
| orologio | ora di Amsterdam | tempo | `setInterval` | calcolata a mano da UTC con controllo ora legale, stampa `CET`/`CEST` |

**Libreria: nessuna.** Nel bundle non compare una sola occorrenza di gsap, ScrollTrigger,
SplitText, Lenis, Locomotive, Three.js, Barba o Swiper. Il case study lo conferma:
*"an in-house animation system built on top of Request Animation Frame and the Web
Animation API"*. Le uniche chiamate WebGL sono primitive (`createProgram`, `shaderSource`).
Curve bezier custom compilate nel bundle: `[0.89,-1,0.07,1.9]` (con anticipo e
sfondamento), `[0.17,0.67,0.3,1.33]`, `[0.76,0,0.2,1]`, `[0.58,0,0.38,1]`.

## Colori

Palette di tre valori piu' due grigi di servizio. Tutti letti nel CSS, nessuno stimato.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo desktop | `#ffffff` | `body{background-color:var(--white)}`, e `<meta name="theme-color" content="#ffffff">` |
| fondo mobile | `#fafafa` | solo in `m.css` - il telefono non e' bianco puro |
| testo | `#000000` | `body{color:var(--black)}` |
| fondo preloader | `#000000` | `#preloader-bg`, schermo pieno |
| barra di caricamento | `#000000` | `#prg>div`, 2.5px in cima |
| secondario / smorzato | `#c9c9c9` | copyright `#ho-cp`, link "Back", `h2` dell'About, crediti, **stato hover dei link di testo** (nero -> `#c9c9c9` in .3s) |
| bordo | `#0000001a` (nero al 10%) | cornice della tessera in hover; e come colore di fondo del contenitore `figure` prima che l'immagine carichi |
| header e logo | `#ffffff` + `mix-blend-mode: difference` | non sono bianchi: si invertono su qualunque cosa passi sotto |
| griglia di debug | `red`, `opacity .15` (`.3` con classe `g_o`) | `#g_` / `#g`, overlay a colonne rimasto in produzione |

Non c'e' un colore d'accento. L'unico "accento" e' l'inversione data dal blend difference.

## Tipografia

**Un solo carattere, un solo peso, un solo stile.** Tutta la gerarchia e' fatta con corpo,
interlinea e crenatura.

- Famiglia: `Obys`, cioe' **OTF Obys NG**, neo-grottesco disegnato in casa dallo studio.
  Credito testuale nell'About: *"Typography: OTF Obys NG by Obys"*. Il case study dice che
  il redesign e' partito da li': *"a custom neo-grotesque designed to work across both
  functional and expressive contexts"*.
- Servito **in locale**, un solo file: `/font/ObysSans4.woff2`, **6.272 byte**
  (sottoinsieme molto stretto), `font-weight:400`, `font-style:normal`,
  `font-display:swap`, dichiarato in un `<style>` inline nell'head (non in un file esterno,
  cosi' non aspetta il CSS). Fallback: `serif` - scelta strana e voluta, se il font non
  arriva il sito imbruttisce in modo evidente invece di somigliarsi.
- Il `Content-Security-Policy` ammette `fonts.gstatic.com` in `font-src` ma **nessun font
  Google viene caricato**: residuo di configurazione.

Scala: nessuna media query sul testo. Tutto e' in `rem` e il `rem` e' agganciato al
viewport.

- Desktop: `html{font-size: .694444vw}` -> a **1440px 1rem = 10.00px esatti** (tavola di
  disegno di riferimento), a 1920px 1rem = 13.33px.
- Mobile: `html{font-size: 3.125vw}` -> a **320px 1rem = 10.00px esatti**, a 390px = 12.19px.

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| corpo / liste / meta / titoli in modo Vertical | Obys | 400 | `1.1rem` = **11px a 1440**, 14.7px a 1920 | `1.2` | crenatura `-.01em`. E' il livello che porta quasi tutto il sito |
| titolo progetto in modo Grid | Obys | 400 | `8rem` = **80px a 1440**, 107px a 1920 | `1` | crenatura `-.03em`, `white-space:nowrap`, incollato al fondo schermo e centrato |
| manifesto About | Obys | 400 | `4rem` = **40px a 1440** | `1.18` | crenatura `-.03em`; larghezza bloccata a `calc(var(--c)*7.525 + var(--g)*6)` - 7,5 colonne su 12, con il mezzo modulo |
| manifesto About su mobile | Obys | 400 | `1.8rem` = **21.9px a 390** | `1.05` | l'interlinea si **stringe** da 1.18 a 1.05 rimpicciolendo |
| didascalie foto About | Obys | 400 | `1.1rem` | `1.2` | |
| logo | SVG | - | `13rem` di larghezza (130px a 1440) | - | non e' testo |
| wordmark ristretto | SVG | - | `4.05rem` | - | |

Due dettagli da orafo, entrambi nel CSS:

1. `.ln_{margin-left:-1px; margin-right:-1px}` con `.ln{padding-left:1px; padding-right:1px}`.
   La maschera di riga viene allargata di 1px per lato e il testo ricompensato con 1px di
   padding: serve a non tagliare le grazie o gli sfondamenti laterali dei glifi durante lo
   scorrimento. Costo: due dichiarazioni. Effetto: le lettere non si "rosicchiano".
2. `#ab-co-ma .ln_{margin-block: -1.5rem; padding-block: .5rem}` sul manifesto: stessa idea
   sull'asse verticale, per far passare accenti e discendenti fuori dalla maschera.
3. Le sottolineature non sono `text-decoration` ma `border-bottom: 1.34px solid` - valore
   non tondo, scelto per restare 1px fisico dopo lo scaling.

## Testi veri

Menu e interfaccia:

> `Work`  `About`  `CEST 10:14 AM`  `Contact` (al clic: `Copied`)
> `Vertical,`  `Horizontal,`  `Grid`
> `Back`  `Live Website`
> `All rights reserved. ©2026 Obys`
> `Please rotate your device` (solo mobile in orizzontale)

Blocco fisso della home e delle pagine progetto:

> "The studio is shaped by people who care deeply about design and the process behind.
> Each project becomes a case study and a meaningful part of our portfolio, developed with
> care and attention."
> "Contact:" / "info@obys.agency"

Meta description (unico "claim" scritto del sito):

> "Concept-driven design studio based in the EU. Crafting award-winning brand and web
> experiences shaped by storytelling and strong visual systems."

Manifesto About, integrale:

> "Obys is a concept-driven design studio founded by Olha Olianishyna and Viacheslav
> Olianishyn in 2018 and based in the EU (AMS, WAW, BER).
> Rooted in modernist design principles and graphic design tradition, our work combines
> typography, grid systems and motion to create digital experiences that balance clarity,
> usability and bold visual expression.
> Our team remains intentionally small, under 10 people, which allows creative direction to
> stay personal and decisions to stay sharp. Every project is led closely by the founders.
> No layers. No dilution."

> "Over the years, our work has grown from independent collaborations to partnerships with
> brands such as CNN, Porsche, Hilton, Miro, Makhno and Glyphic Biotechnologies. Along the
> way, Obys was named Studio of the Year by Awwwards in 2023, received 4x Studio of the Year
> titles from CSS Design Awards, and earned Red Dot recognition - not as an objective, but
> as a reflection of consistent standards"

> "We live design daily, not only through client work, but through research,
> experimentation, public talks and education. The studio's methodology has evolved into its
> own educational platform, where we share the thinking behind our practice."

> "Obys takes on a limited number of projects each year, partnering with marketing leaders
> and founders who value authorship, clarity and long-term brand impact."

Liste dell'About:

> **Services:** Creative Direction, Web Design, Web Development, Brand Identity, 3D, Motion Design, Lectures and Consulting
> **Industries:** Architecture, Fashion, Technology, Culture, Education, Finance, Automotive, Furniture
> **Selected Awards:** Studio of the Year (Awwwards) / 4x Studio of the Year (CSSDA) / Best of the Best (Red Dot) / Jury Prize (European Design Awards) / 30+ Site of the Day (Awwwards) / 35+ Website of the Day (CSSDA) / 3x Award of Excellence (Communication Arts) / Best of the Behance (Behance) and 60+ more...
> **Latest Public Speeches:** The Geek Gathering. Osijek, Croatia (2025) / Awwwards. Valencia, Spain (2024) / Dysarium. Lviv, Ukraine (2024) / Awwwards. Amsterdam, Netherlands (2022)
> **Featured Press:** Codrops / Red Dot / Awwwards / FWA / Communication Arts / Top Interactive Agencies / 50Pros
> **Socials:** Instagram / Behance / Twitter / LinkedIn / Design Education Series
> **Typography:** OTF Obys NG by Obys

I 19 progetti, nell'ordine, con la riga meta esatta (categoria / servizi / numero):

| # | progetto | categoria | servizi |
|---|---|---|---|
| 01 | Makhno | Architecture, Furniture | Creative Direction, Web Design/Dev |
| 02 | Source Unknown | Fashion | Web Design/Dev |
| 03 | Autex | Architecture | Web Design |
| 04 | Odin's Crow | Fashion, Photography | Creative Direction, Web Design/Dev |
| 05 | Olga Prudka | Photography, Fashion | Web Design/Dev, Identity |
| 06 | Yulia | Fashion | Web Design/Dev, Identity |
| 07 | The Ways We Work (Miro) | Technology | Web Design/Dev |
| 08 | Design Education Series | Education | Concept, Web Design/Dev, Identity |
| 09 | Obys' Design Books | Education | Concept, Web Design/Dev, Identity |
| 10 | Eminente | Fashion, Photography | Creative Direction, Web Design/Dev |
| 11 | Abetka | Culture | Concept, Web Design/Dev, Identity |
| 12 | BlackSheep | Architecture, Development | Creative Direction, Web Design/Dev |
| 13 | Salience Labs | Technology | Web Design/Dev, 3D |
| 14 | AI Modernism of Kharkiv | Culture, Side Project | Concept, Web Design/Dev, Identity |
| 15 | Glyphic Biotechnologies | Technology, Biotech | Creative Direction, Web Design/Dev, 3D |
| 16 | Porsche Taycan | Automotive | Web Design/Dev |
| 17 | Ayocin (Atmos Lamp) | Technology, Furniture | Creative Direction, Web Design/Dev |
| 18 | Grids | Education, Side Project | Concept, Web Design/Dev, Identity |
| 19 | Peter Lindbergh | Fashion, Photography | Concept, Web Design/Dev |

Testi alternativi delle immagini: scritti, descrittivi, non decorativi. Es. *"Woman in dark
dress stands beside a modern wall with dark green geometric panels."*, *"A black and white
photo captures a woman seated, looking upwards in a contemplative pose."*

## Mobile

**Non e' un altro layout: e' un altro sito.** E la scelta e' fatta due volte, sul server e
sul client.

Meccanismo, verificato scaricando la home con User-Agent iPhone:

1. Il server risponde con **un HTML diverso**: 24.849 byte contro 90.186 della versione
   desktop.
2. Nell'head c'e' uno script `__SEED__` con un JSON offuscato in base64 + XOR (la chiave e'
   la stringa di cache-busting `?msh4f1r6`). Lo script decodifica, poi:
   `I = /Mobi|Android|Tablet|iPad|iPhone/i.test(userAgent) || (platform==="MacIntel" && maxTouchPoints>2) ? "m" : "d"`
   e inietta `/css/${I}.css` e `/js/${I}.js`. **Due build separate.**
3. Il `<script>` viene appeso al body **solo** quando `document.readyState === "complete"`.

Numeri delle due build:

| | desktop `d` | mobile `m` |
|---|---|---|
| CSS | 14.804 byte (2.696 compresso) | 6.874 byte (1.692 compresso) |
| JS | 119.746 byte (37.776 compresso) | 59.564 byte (20.334 compresso) |
| HTML | 90.186 byte | 24.849 byte |

**Cosa SPARISCE sul telefono**

- Il `<canvas id="gl">` e tutto il WebGL. In `m.css` non esiste la regola `#gl`, nell'HTML
  mobile non c'e' il tag.
- I tre modi. `#ho-wo-mo` (i bottoni `Vertical, Horizontal, Grid`) non e' nel DOM mobile.
  Resta solo il modo Vertical.
- L'orologio `#header-time`: assente dall'HTML mobile.
- Il blocco fisso `#fix` con la descrizione dello studio e l'email: assente.
- Il copyright `#ho-cp`: assente.
- La barra di caricamento `#prg` e il contatore `#preloader-prg`: `display:none`.
- Il link "Back" nelle pagine progetto: assente.
- La griglia editoriale del modo Grid: assente.

**Cosa viene SOSTITUITO**

- *Il motore delle immagini*: da piani WebGL a `<img>` veri. Nella home desktop gli `<a
  class="r">` del modo Vertical sono **vuoti** (hanno solo `aspect-ratio` e `width`): sono
  segnaposto e le foto le disegna il canvas. Su mobile diventano
  `<a class="ho-wo-r"><figure><img loading="lazy" srcset sizes crossorigin></figure></a>`.
- *Il grigio->colore*: da uniform di shader a filtro CSS.
  `.ho-wo-r{filter: grayscale(1) contrast(.85); opacity:.7}` ->
  `.ho-wo-r.is-active{filter: grayscale(0) contrast(1); opacity:1}`, transizione `.4s`.
  Stesso identico risultato visivo, l'85% di contrasto e' lo stesso numero che sta nel
  fragment shader desktop.
- *Il grilletto*: da `mouseenter` a distanza dal centro dello schermo. Il JS mobile misura
  ogni item e mette `is-active` a quello piu' vicino al centro del viewport.
- *Lo scroll*: da virtuale a **nativo**. `html{overflow:hidden; height:100svh}` +
  `body{overflow:auto; height:100svh}`: si scorre il `body`, non la finestra. Il loop
  infinito e' fatto clonando gli item (`cloneItems`, classe `is-loop`) e riportando
  `document.body.scrollTop` al centro quando esce dalla fascia sicura (`checkJump`,
  `midStart`). C'e' uno snap con una finestra di 400ms.
- *La griglia*: da 12 colonne a 6. `--c` passa da `(100vw - (1rem*2 + 1rem*11))/12` a
  `(100vw - (1rem*2 + 1rem*5))/6`.
- *Il fondo*: da `#fff` a `#fafafa`.
- *La scala*: da `.694444vw` a `3.125vw`.
- *Il logo*: apertura da ±137% a **±65%**, transizione da `1s` a `.8s`, e in piu' uno stato
  `is-hide` (`opacity:0; scale:1.2`) che sul desktop non esiste.
- *Il manifesto About*: da `4rem`/`1.18` a `1.8rem`/`1.05`.
- *La pagina progetto*: `#wo-ga` da vuoto (WebGL) a lista di `<figure><img loading="eager">`;
  il blocco titolo diventa `position:fixed` a mezza altezza con uno stato `is-hide`, e la
  galleria parte con `padding-block-start: calc(50svh + 5rem)` e ogni riga
  `transform: translateY(50vh)` (entra dal basso).

**Cosa RESTA**

- Il logo O fisso al centro, in blend difference, con lo stesso morphing e la stessa
  apertura.
- L'header con "Work, About" + "Contact" (che copia ancora l'email e diventa "Copied").
- Il carattere, la scala in rem, la crenatura, il sistema di rivelazione riga per riga
  (`.ln_`/`.ln`), le stesse curve bezier.
- Il parallasse dentro il ritaglio: le immagini restano a `scale(1.1)` e vengono traslate,
  su tutte e due le versioni.

**In piu' solo su mobile**: se il telefono e' in orizzontale e
`innerHeight < 500 && innerWidth < 950`, il JS crea al volo un `<div id="rt">` a schermo
pieno con scritto **"Please rotate your device"**. Il sito in landscape non lo fanno proprio.

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| server + bundler | **Bun** | VERIFICATO | case study ufficiale: *"a custom codebase powered by Bun, which serves as both the HTTP server and the bundler"* (https://www.awwwards.com/the-new-obys.html). Il prelude del bundle e' quello di esbuild/Bun con gli helper dei decoratori TypeScript |
| framework | **React usato SOLO come templating lato server**, zero React nel browser | VERIFICATO | il case study lo dice esplicitamente; e nell'HTML servito restano gli attributi in camelCase di React: `charSet="utf-8"`, `srcSet="..."`. Nel DOM non c'e' `#__next`, `#__nuxt`, nessun runtime |
| linguaggio client | TypeScript compilato in un unico bundle IIFE | VERIFICATO | un solo `<script src="/js/d.js">` iniettato a runtime; helper di decoratori TS nel prelude |
| animazione | motore proprio su rAF + Web Animations API | VERIFICATO | zero occorrenze di gsap/ScrollTrigger/SplitText/Lenis/Locomotive/Barba/Swiper nel bundle; case study: *"an in-house animation system built on top of Request Animation Frame and the Web Animation API"* |
| scroll | virtuale su desktop (rotella -> lerp), nativo con loop clonato su mobile | VERIFICATO | `scrollHeight` = viewport; handler `wheel`; `lerp`/`damp` a codice; su mobile `body.scrollTop` + `checkJump` |
| 3D | **WebGL2 nudo**, nessuna libreria | VERIFICATO | `canvas.getContext('webgl2')` risponde; nel bundle solo `createProgram`/`shaderSource`; shader letti in chiaro (`#version 300 es`) |
| shader | vertex + fragment scritti a mano; uniform `tex, g, o, mLR, mTB, of, z, mY, m4, v4` | VERIFICATO | sorgente GLSL leggibile nel bundle |
| texture | prese dagli `<img>` e dai `<video>` del DOM | VERIFICATO | `texImage2D(..., I.dom)` con controllo `isPlaying`/`videoWidth`: il canvas puo' disegnare anche video |
| CSS | CSS a mano, nessun framework | VERIFICATO | 14.8 KB per tutto il sito, nomi di classe corti e propri (`ho-wo-0-me_`), zero utility |
| CMS | **Strapi** su `cms.obys.agency` | VERIFICATO | case study lo nomina; e le URL sono la convenzione Strapi: `/uploads/` con i prefissi `thumbnail_`, `small_`, `medium_`, `large_` |
| immagini | WebP con `srcset` a 3-5 tagli, `sizes` in `rem`, `loading="lazy"` (home) / `"eager"` (galleria progetto), `crossorigin="anonymous"` | VERIFICATO | letto nell'HTML. Il `crossorigin` c'e' perche' le immagini finiscono in texture WebGL |
| font | self-hosted, un woff2 | VERIFICATO | `@font-face` inline nell'head |
| hosting | **VPS proprio, nginx 1.24.0 su Ubuntu** | VERIFICATO | header `Server: nginx/1.24.0 (Ubuntu)` sia su obys.agency sia su cms.obys.agency. Niente Vercel/Netlify/Cloudflare |
| analytics | Google Analytics 4 (`G-L16SCYVMS7`), unico terzo | VERIFICATO | unico script esterno nell'HTML |
| sicurezza | CSP stretta con nonce per script, COOP/COEP/CORP, `object-src 'none'`, `base-uri 'none'`, `Cache-Control: no-store` sull'HTML | VERIFICATO | header di risposta |

## Peso e prestazioni

Misurato il 13/08/2026 con `curl` e `Accept-Encoding: br, gzip`.

| risorsa | non compressa | trasferita |
|---|---|---|
| HTML home desktop | 90.186 B | **13.574 B** |
| `css/d.css` | 14.804 B | **2.696 B** |
| `js/d.js` | 119.746 B | **37.776 B** |
| `font/ObysSans4.woff2` | 6.272 B | 6.272 B |
| **totale codice desktop** | 231.008 B | **~60,3 KB** |
| HTML home mobile | 24.849 B | - |
| `css/m.css` | 6.874 B | **1.692 B** |
| `js/m.js` | 59.564 B | **20.334 B** |
| **totale codice mobile** (senza HTML) | - | **~28,3 KB** |

Richieste della home desktop: 1 HTML + 1 CSS + 1 JS + 1 font + 1 script GA + **38 immagini**
(19 progetti x 2: la tessera della griglia e l'anteprima grande dell'hover). Nessun'altra
origine oltre `cms.obys.agency` e Google.

Peso delle immagini, campionato su Makhno: `small_` 12.804 B, versione piena 27.492 B.
A occhio la home carica fra 250 e 500 KB di WebP a seconda del taglio scelto da `sizes`.
**Stima**, non misurata a pieno carico.

Tempi: TTFB fra 1,7s e 3,7s dalla mia rete. Numero **non attendibile** come giudizio sul
sito (rete sandbox, nessun CDN in mezzo, prima richiesta a freddo). Non ho fatto girare
Lighthouse.

Punteggio Awwwards: 7.46/10 complessivo, 7.98/10 la voce Development
(https://www.awwwards.com/sites/obys-2).

Tre scelte di prestazione che si vedono nel codice:

- Il `@font-face` e il reset stanno **inline nell'head**: il testo si compone senza
  aspettare nessun file.
- Il bundle viene appeso al body **solo a `readyState === "complete"`**: il JS non compete
  mai con il primo disegno.
- Il CSS e il JS della piattaforma sbagliata **non vengono nemmeno richiesti**: chi e' su
  telefono non scarica un byte dei 37,8 KB del motore WebGL.

## Tre cose da rubare

**1. Due build, scelte da una riga.**
Non un layout responsive: due HTML, due CSS, due JS. Il ramo e' una sola espressione:
`I = /Mobi|Android|Tablet|iPad|iPhone/i.test(ua) || (platform==="MacIntel" && maxTouchPoints>2) ? "m" : "d"`
e poi `link.href = /css/${I}.css` / `script.src = /js/${I}.js`. Il risultato e' che sul
telefono il codice scende da 40 KB a 22 KB e sparisce l'intero motore WebGL invece di
restare a girare a vuoto. Rifacibile su qualunque stack che possa emettere due entry point:
si smette di scrivere `@media` difensive e si scrive due volte la cosa giusta. Il prezzo da
mettere in conto: il caching va gestito con `Vary: User-Agent` o, come fanno loro, sceglien-
do lato client con l'HTML a `Cache-Control: no-store`.

**2. La scala tipografica agganciata a due tavole di disegno.**
`html{font-size: .694444vw}` su desktop e `3.125vw` su mobile. Sono i due numeri che fanno
`1rem = 10px` esatti a **1440px** e a **320px**. Da li' in poi ogni misura del sito - corpi,
gutter, colonne, larghezza del logo, altezze delle maschere - e' in `rem`, e non esiste una
sola media query sul testo: si scrivono i px dell'artboard divisi per dieci e il sito
respira da solo su ogni schermo. Le colonne si costruiscono da un'unica variabile:
`--c: calc((100vw - (var(--m-x)*2 + var(--g)*11))/12)`, e ogni blocco si posiziona con
`calc(var(--c)*N + var(--g)*M)`. Da provare subito su un progetto piccolo: e' mezz'ora di
setup e cancella meta' del CSS responsive.

**3. Il ritmo asimmetrico, dichiarato una volta sola.**
Tutte le entrate durano **1600ms**; tutte le uscite **300-600ms**. E' scritto in un unico
oggetto in cima al bundle:
`{translate:{show:{1600,"o6"}, hide:{600,"i3"}}, opacity:{show:{1000,"o2"}, hide:{600,"i3"}}}`.
Nessun numero magico sparso nel codice. Aggiungici lo stagger che si auto-regola
(`stag = clamp(5*durata/numeroOggetti, 20, durata)`, e passo 50ms invece di 100ms quando gli
elementi sono piu' di 10): una lista da 4 voci e una da 40 entrano nello stesso tempo
percepito senza toccare un parametro. E' la ragione per cui il sito "ha ritmo" e non
"ha animazioni": la lentezza in entrata e la velocita' in uscita sono una regola, non un
gusto applicato caso per caso.

## Non verificato

- **Non ho visto il sito.** Il browser condiviso e' stato dirottato da altri agenti tre
  volte su tre (mi ha portato su trionn.com, merci-michel.com, hollywoodexhibit2026.com) e
  lo screenshot non e' stato salvato. Colori, corpi, curve e struttura sono letti nel CSS e
  nel JS, che e' piu' affidabile di uno screenshot; ma composizione visiva, densita' reale e
  qualita' percepita del movimento non li ho controllati con l'occhio.
- **Il passaggio fra i tre modi**: non so come avviene la transizione Vertical ->
  Horizontal -> Grid (dissolvenza? le tessere si spostano interpolando? si ricostruisce?).
  Nel CSS i tre contenitori `.ho-wo-s_` sono sovrapposti in `position:absolute` e i due non
  attivi hanno `pointer-events:none`, quindi c'e' un incrocio, ma la coreografia sta nel
  bundle e non l'ho ricostruita.
- **Il modo Horizontal**: leggo `#ho-wo-1>.ho-wo-s a{transform: rotate(-90deg)}`, cioe' le
  aree cliccabili sono ruotate di un quarto di giro. La mia lettura e' che sia la stessa
  colonna coricata, ma non l'ho visto e non so se le foto ruotano davvero o solo il bersaglio.
- **Le transizioni fra pagine**: c'e' un router (`Ph("url")`, `pg.upd`, `m.out()`/`m.in()`) e
  Awwwards cita "video transitions", ma non ho seguito il flusso di navigazione.
- **Video**: il codice delle texture gestisce elementi video (`videoWidth`, `isPlaying`), e
  l'About su Awwwards e' descritto con contenuti video, ma nell'HTML che ho scaricato non
  c'e' un tag `<video>`. Probabilmente iniettati dopo.
- **Peso reale delle immagini a pieno carico**: stimato da due campioni, non misurato con un
  waterfall.
- **Lighthouse / Core Web Vitals**: non eseguito.
- **Il contatore del preloader**: parte da `00`, ma non ho verificato se conta le risorse
  vere o e' una finta (nel codice `progress(h){}` e' un metodo vuoto - indizio forte che sia
  a tempo, non a caricamento, ma non e' una prova).
- **La griglia rossa di debug** (`#g_`): e' nel CSS di produzione, non ho trovato la
  scorciatoia da tastiera che la accende.
- **Le pagine dei singoli progetti**: ne ho letta una sola, `/work/makhno`. Assumo che le
  altre 18 abbiano la stessa struttura.
