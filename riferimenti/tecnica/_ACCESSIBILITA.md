# L'accessibilita' come vantaggio competitivo

Ricerca del **13 agosto 2026**, per un'agenzia italiana di siti creativi.
Non e' un documento di conformita': e' un documento commerciale. La tesi e' che
l'accessibilita' oggi sia **l'unico punto in cui il web premiato e' debole,
misurabile prima di spendere soldi, e per di piu' obbligatorio per legge su una
fetta precisa di clienti**.

## Metodo, e i suoi limiti

- **Gli esempi della sezione 1 vengono dalla nostra ricerca**: 34 schede di siti
  premiati gia' analizzati riga per riga (`INDICE.md`). Dove c'e' scritto
  **VERIFICATO** e' verificato li'. I punteggi Awwwards vengono da `_PREMI.md`,
  che li ha estratti dalle schede pubbliche di 31 Site of the Day.
- **Le norme sono citate per atto**, non per riassunto: numero, data, Gazzetta,
  articolo. Ma questa sessione **non ha avuto accesso alla rete** (vincolo del
  compito: niente browser condiviso). Quindi **date, ambito e articoli che
  seguono vanno riletti su EUR-Lex e Normattiva prima di metterli in
  un'offerta**: dove il rischio di memoria e' alto c'e' scritto
  **[DA RIVERIFICARE]**, con l'indirizzo esatto dove si controlla in due minuti.
  Le date della direttiva 2019/882 e l'ambito di applicazione sono la parte
  stabile e sono riportate con sicurezza; gli **importi delle sanzioni italiane
  no**.
- **Il contrasto non l'abbiamo misurato con uno strumento** su nessuno dei 34
  siti. Quello che sappiamo sul contrasto e' strutturale (vedi 1.4), non
  numerico. E' la prima cosa da colmare.

---

## 1. GLI ERRORI RICORRENTI NEI SITI CREATIVI

### Prima cosa: l'ordine chiesto non e' l'ordine misurato

La traccia elencava gli errori in quest'ordine: `user-scalable=no`, contrasto,
testo nel canvas, focus, movimento, autoplay. **Sui nostri 34 siti l'ordine di
frequenza e' un altro**, ed e' importante perche' cambia dove si mettono le ore:

| # | errore | frequenza misurata sul nostro campione | criterio WCAG violato | livello |
|---|---|---|---|---|
| **1** | **movimento non disattivabile** | **quasi totale**: 34 schede su 34 hanno animazione pesante, e **una sola** (Apple) ha una gestione sistematica di `prefers-reduced-motion` | 2.3.3 (AAA), e 2.2.2 (A) quando il movimento parte da solo | **A/AAA** |
| **2** | **video e caroselli in autoplay** | **7 siti documentati**, e nessuno di questi ha un comando di pausa | **2.2.2 Pause, Stop, Hide** | **A** |
| **3** | **testo dentro canvas** | **8 siti documentati** (MSDF/WebGL), uno con `<body>` letteralmente vuoto | 1.1.1, 1.3.1, 4.1.2 | **A** |
| **4** | **focus non visibile / niente equivalente da tastiera** | **1 sito su 34** dichiara strumenti di gestione del focus; su tutti gli altri non c'e' traccia | 2.1.1, 2.4.7, 2.4.11 | **A/AA** |
| **5** | **`user-scalable=no`** | **5 siti documentati su 34** — ma il `<meta viewport>` non l'abbiamo letto sistematicamente su tutti, quindi il numero vero e' piu' alto | **1.4.4 Resize Text** | **AA** |
| **6** | **contrasto insufficiente** | **non misurato**, ma la causa strutturale e' documentata su almeno 5 siti (vedi 1.4) | 1.4.3, 1.4.11 | **AA** |

`user-scalable=no` resta **il piu' citato** perche' e' quello che si vede in tre
secondi e che gli strumenti automatici segnalano da soli — ed e' quasi
certamente per questo che pesa cosi' tanto nel voto della giuria. Ma il difetto
piu' diffuso e' il movimento.

---

### 1.1 `user-scalable=no` — il difetto che costa il voto

**Cosa dice la norma.** WCAG 2.1 **1.4.4 Resize Text (AA)**: il testo deve poter
essere ingrandito **fino al 200%** senza perdita di contenuto o funzionalita'.
Bloccare lo zoom con `user-scalable=no` o `maximum-scale=1` toglie all'utente
l'unico modo che ha, sul telefono, di arrivare al 200%.
Fonte: [w3.org/WAI/WCAG21/Understanding/resize-text](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html)

**I casi verificati nella nostra ricerca:**

| sito | premio | cosa c'e' nel viaggio | punteggio accessibilita' Awwwards |
|---|---|---|---|
| **Frans Hals Museum** (`frans-hals.md`) | **Site of the Year 2018** | `user-scalable=no, maximum-scale=1, minimal-ui, shrink-to-fit=no, viewport-fit=cover` | **5,50 / 10** |
| **Star Atlas** (`star-atlas.md`) | SOTY 2021 | `<meta viewport ... user-scalable=no>` | **5,80 / 10** |
| **DARK / Netflix** (`dark-netflix.md`) | SOTD 3/11/2020 + Dev Award | `user-scalable=no, maximum-scale=1` — scelto **per non far litigare lo zoom con i gesti sull'albero genealogico** | n.d. |
| **Prometheus Fuels** (`prometheus-fuels.md`) | SOTD | `maximum-scale=1.0, user-scalable=no, minimal-ui, viewport-fit=cover` | n.d. |
| **Simply Chocolate** (`simply-chocolate.md`) | SOTD + E-commerce SOTY 2017 | `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no` | n.d. |

**Il caso Frans Hals e' la prova commerciale piu' forte che abbiamo.** E' un
museo pubblico olandese, con una pagina dedicata all'accessibilita' fisica —
sedie a rotelle, parcheggi per disabili — e il suo sito **impedisce di
ingrandire il testo con le dita**. Ha vinto Site of the Year 2018 e ha preso
**5,50 in accessibilita'**, il voto piu' basso di tutta la scheda (semantica
6,50, animazioni 8,00, WPO 7,25). Quel singolo attributo, su un campione dove la
media di accessibilita' e' **6,70**, vale da solo piu' di un punto.

**Tre cose da sapere prima di dirlo a un cliente:**

1. **Safari su iOS lo ignora dal 2016** (iOS 10): li' lo zoom funziona lo stesso.
   Chrome su Android invece **lo rispetta ancora**. Quindi il difetto e' reale
   sulla meta' del mercato, non su tutto.
2. **Lighthouse lo segnala da solo** (audit `meta-viewport`, categoria
   Accessibility). E' uno dei pochi errori che un giurato vede senza sforzo.
3. **Nessuno dei cinque casi ne aveva bisogno per davvero, tranne DARK.** DARK
   ha una mappa trascinabile a due dita: li' il conflitto col pinch-to-zoom e'
   vero. La soluzione corretta non e' spegnere lo zoom su tutto il documento, ma
   `touch-action: none` **sul solo canvas** che gestisce i gesti.

**La regola da consegnare:**

```html
<!-- l'unico viewport da scrivere, sempre -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

```css
/* e se un elemento deve prendersi i gesti, se li prende da solo */
.canvas-gestuale { touch-action: none; }
```

---

### 1.2 Movimento non disattivabile — il difetto piu' frequente in assoluto

**Su 34 schede, 17 nominano `prefers-reduced-motion`. Di queste 17, la
stragrande maggioranza lo nomina per dire che NON c'e'.**

| sito | cosa fa davvero | fonte nella nostra ricerca |
|---|---|---|
| **Apple** (`apple-prodotto.md`) | **97 occorrenze** di `ReducedMotion` nel JS, una sola `@media` nel CSS. Non attenua: **elimina**. Con il movimento ridotto attivo `<html>` riceve `no-enhanced` e **tutta la pagina diventa statica** | verificato sul campo |
| **Vero** (`vero.md`) | `@media (prefers-reduced-motion: reduce)` che **azzera tutto a `.01ms`**, piu' la freccia "scroll" disattivata | tabella animazioni |
| **Trionn** (`trionn.md`) | **attenua**: la rotazione del simbolo 3D passa da `0.0042` a `0.0015` per frame. Ma **non disattiva** la sequenza scrubbata, l'esplosione del testo, i pin | letto nel codice, 2 punti |
| **Revelatio** (`revelatio.md`) | **solo gli odometri** lo onorano (se attivo non animano affatto). Scramble, ASCII shader, marquee trascinabile, logo che si sbriciola: tutti sempre attivi | 17 script in chiaro |
| **2xA** (`2xa.md`) | **una sola regola**, e riguarda la libreria dei cookie: `@media(prefers-reduced-motion){#cc-main{--cc-modal-transition-duration:0s}}`. Intro, tendina, testo liquefatto e quadtree partono comunque | Dev Award, **accessibilita' 6,60** |
| **Locomotive** (`locomotive.md`) | pannello cookie + un componente. Nel JS **non compare mai**: preloader, scramble, de-pixelate, rotazione canvas e transizioni Barba non lo rispettano | cercato in `main.css` e `app.js` |
| **Pangram Pangram** (`pangram-pangram.md`) | **una sola occorrenza** in tutto il bundle; la parallasse non si spegne | E-commerce SOTY 2021 |
| **Darkroom** (`darkroom.md`) — **gli autori di Lenis** | Lenis ha `respectReducedMotion` (default `true`) **sul ramo main**, ma **non c'e' nella 1.3.25 che gira sul loro sito** | verificato leggendo i parametri del costruttore in produzione |
| By-Kin, Aristide Benoist, Cuberto, Lando Norris, Lusion, Mosby, Opal Tadpole, Zajno, Simply Chocolate | **zero occorrenze** in CSS e JS | verificato per assenza su ogni bundle |

Tre note che valgono per la vendita:

- **Lusion**, Site of the Year 2023: 44 schermate di volo dentro un tunnel,
  **zero occorrenze** di `prefers-reduced-motion` in CSS e JS. La nostra scheda
  lo definisce «un buco di accessibilita' consapevole».
- **2xA** ha preso **6,60 in accessibilita'** contro **8,20 in
  animations/transitions**: e' il ritratto esatto del problema. La scheda
  conclude che il movimento non disattivabile e' «probabilmente la parte del
  punteggio Accessibility che pesa di piu'».
- **Chi lo implementa lo implementa male.** Apple spegne invece di attenuare;
  Vero azzera tutto a `.01ms`. Come farlo davvero e' la sezione 2.

---

### 1.3 Video e caroselli in autoplay — il criterio di **livello A** che tutti sbagliano

Qui c'e' un equivoco da smontare subito: si pensa che l'autoplay sia un problema
solo per l'audio. **Non e' cosi'.**

**WCAG 2.1 — 2.2.2 Pause, Stop, Hide, livello A** (il minimo assoluto): per
qualsiasi contenuto che **si muove, lampeggia o scorre**, che parte
automaticamente, dura **piu' di 5 secondi** ed e' presentato insieme ad altro
contenuto, deve esistere un modo per **metterlo in pausa, fermarlo o
nasconderlo**.
Fonte: [w3.org/WAI/WCAG21/Understanding/pause-stop-hide](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html)

Un carosello che gira da solo ogni 5 secondi e un video di sfondo in loop —
**anche muti** — sono violazioni di livello A se non hanno un comando di pausa.

**I casi verificati:**

| sito | cosa parte da solo | comando di pausa? |
|---|---|---|
| **2xA** | `2xa_reel.mp4` in hero, **28,07 MB**, `autoplay` senza `preload`; sei video "experiment" messi in play dall'`IntersectionObserver` | **no** |
| **Cuberto** | showreel 16:9 in loop `autoplay preload="auto"` sopra la piega: **+6,0 MB desktop, +2,1 MB mobile** | **no** |
| **Locomotive** | video Vimeo dell'eroe in autoplay muto in loop, con `mix-blend-mode: difference` sul titolo | **no** |
| **Don't Board Me** (SOTY 2024) | Lottie del cane `loop: true, autoplay: true` **+** carosello servizi in **autoplay a 5 s** con barra di avanzamento | **no** |
| **Revelatio** (SOTD 2026) | testimonianze, **15 voci in autoplay a 5 s** | frecce, ma **nessuna pausa** |
| **Trionn** | testimonianze Swiper `autoplay 5 s` — con `pauseOnMouseEnter: true` | **solo col mouse sopra**: da tastiera e da telefono non si ferma |
| **Frans Hals** | carosello messaggi Flickity con `autoPlay` | **no** |

Trionn e' il caso piu' istruttivo: `pauseOnMouseEnter: true` **sembra** la
soluzione e non lo e'. Un comando di pausa deve essere raggiungibile da
tastiera, e non puo' dipendere da un puntatore che su un telefono non esiste.

**Sull'audio**, invece, la nostra ricerca ha gia' il criterio giusto in
`_SUONO.md`: **WCAG 2.1 — 1.4.2 Audio Control, livello A**, se l'audio parte da
solo e dura piu' di 3 secondi serve un modo per fermarlo o per regolarne il
volume **indipendentemente dal volume di sistema**. Il motivo tecnico e' preciso:
chi usa un lettore di schermo sente la sintesi vocale **sopra** la musica, e il
lettore di schermo usa il volume di sistema — quindi non puo' abbassare la tua
senza abbassare la propria voce. **Partire muti risolve il criterio alla
radice**: se non c'e' audio automatico, il criterio non si applica. E' anche
quello che impone la policy di Chrome («Muted autoplay is always allowed»).

---

### 1.4 Testo dentro canvas — e perche' costa due volte

**I casi verificati:**

| sito | quanto testo e' fuori dal DOM |
|---|---|
| **igloo.inc** — Site of the Year 2024 | **zero testo HTML**: tutto MSDF su texture KTX2, canvas dentro uno **shadow root chiuso**. Body: `<body></body>`. **1.410 byte di HTML, 0 caratteri di testo, 0 `<h1>`** |
| **Immersive Garden** | tre atlanti MSDF; l'`h1` della hero resta `visibility: hidden` **anche a 390 px**: il titolo e' testo WebGL anche sul telefono |
| **Zajno** | la scritta `ZAJNO®` sono **sei texture MSDF** da 1920x728 |
| **Messenger / Bruno Simon** | testo in MSDF via worker dedicati |
| **Lando Norris** — Site of the Year 2025 | atlante MSDF `Brier-Bold-02.webp`, 117 KB |
| **Vero, Prometheus Fuels, Star Atlas** | marchi e titoli in MSDF/atlas |

**Perche' costa due volte.** Il documento `_CANVAS-E-GOOGLE.md` ha gia' misurato
il lato SEO, e va usato **insieme** all'argomento accessibilita', perche' e' lo
stesso identico problema:

- Google **renderizza** il JS (Vercel+MERJ, luglio 2024: 100% delle pagine
  renderizzate) ma **indicizza il DOM testuale, non i pixel**; e il servizio di
  rendering **non scarica immagini ne' video**, quindi su un sito WebGL le
  texture non vengono nemmeno richieste;
- i crawler AI (OpenAI, Anthropic, Perplexity, Meta, ByteDance) **non eseguono
  affatto il JavaScript**;
- lo stesso Google, annunciando l'origin trial dell'API **HTML-in-Canvas**,
  scrive che serve perche' «all the powerful browser features integrated into
  the DOM **break completely** when the UI is trapped inside a static canvas
  pixel grid». **E' l'ammissione di chi vende il rimedio.**

Quindi la frase da dire al cliente e' una sola, e vale doppio: **il testo che sta
solo nel canvas non lo legge ne' un lettore di schermo, ne' ChatGPT, ne' Google.**

**La soluzione che funziona, verificata su un sito premiato: Active Theory.**
Tutto il sito e' un unico `<canvas>`, eppure nel DOM esiste un `div.GLA11y` largo
0 px con `clip: rect(0 0 0 0)` che contiene **link e testi veri**, registrati
oggetto per oggetto:

```js
GLA11y.registerPage(group, "ContactPage");
GLA11y.textNode(group, "Los Angeles");
```

Il risultato, testuale dalla nostra scheda: «la pagina resta navigabile da
tastiera e leggibile da un lettore di schermo, e io ho potuto ricostruire i
contenuti di ogni sezione **senza guardare un pixel**». **Meccanica rifacibile
su qualunque esperienza WebGL: per ogni oggetto interattivo, un `<a>` invisibile
con lo stesso testo e lo stesso ordine di lettura.**

E c'e' una copertura scritta: le policy antispam di Google (agg. 15/05/2026)
elencano fra cio' che **non** e' contenuto nascosto illecito proprio «text
that's only accessible to screen readers and is intended to improve the
experience». `sr-only` e ARIA non sono spam, c'e' scritto.

**Il controesempio da non fare, verificato:** Simply Chocolate aveva un blocco
`seo-content` **rimosso dal DOM all'avvio**. Il crawler lo vedeva, il lettore di
schermo di un utente reale no. Nel 2017 si chiamava "SEO fallback"; oggi e'
contenuto inaccessibile — e sta anche nella zona grigia del cloaking.

---

### 1.5 Focus non visibile e gesti senza equivalente da tastiera

**Su 34 schede, una sola dichiara strumenti di gestione del focus.**

| sito | cosa fa |
|---|---|
| **Locomotive** | **focus-trap 7.0.0** + **tabbable 6.0.0** + polyfill `focus-visible`; il menu chiama `focusTrap.activate()`. In piu' l'unico uso documentato di `:focus-within` in tutta la ricerca: la miniatura di `Featured work` cresce sia in `:hover` **sia in `:focus-within`**, quindi si vede anche arrivandoci col tab |
| **Cuberto** | usa `aria: "auto"` su `h1..h6` in GSAP SplitText, cosi' il lettore di schermo legge il testo vero e non i frammenti |
| **Locomotive** (di nuovo) | lo **scramble** salva il testo originale in `aria-label` durante l'effetto e lo ripristina al `mouseleave`: gli screen reader non leggono l'anagramma |
| **Opal Tadpole** | `<h1 class="sr-only">` per il titolo vero, `alt` su tutte le immagini, `role="presentation"` sulle icone, `aria-label` sui bottoni — **ma nessun `prefers-reduced-motion`** |
| **tutti gli altri 30** | nessuna traccia |

**Il problema strutturale dei siti creativi non e' l'outline mancante: e' che
l'interazione principale e' un gesto.** Casi verificati:

- **Simply Chocolate**: il gesto che fa funzionare il sito e' **trascinare il
  cerchio per scartare il prodotto**. C'e' `handleKeyDown` sul carosello
  (frecce), ma **non sullo scarto**. Il gesto centrale non ha equivalente da
  tastiera.
- **Revelatio**: due cursori personalizzati con `mix-blend-mode: difference` che
  si scambiano su `[data-cursor-hover]`. Tutta la segnalazione di
  "questo e' cliccabile" e' affidata al puntatore.
- **Immersive Garden, Obys**: pannelli di controllo e modalita' aperte da
  scorciatoie che nemmeno noi siamo riusciti a trovare leggendo il codice.
- **Star Atlas**: la nostra scheda lega esplicitamente il **5,80** di
  accessibilita' a tre cose insieme: `user-scalable=no`, testi in canvas, e
  **«interazioni chiave legate all'hover»**.

I criteri in gioco: **2.1.1 Keyboard (A)** — ogni funzionalita' deve essere
azionabile da tastiera; **2.4.7 Focus Visible (AA)**; e in WCAG 2.2 anche
**2.4.11 Focus Not Obscured (AA)**, che e' il criterio nuovo che i siti con
header fisso e cursori sovrapposti sbagliano quasi sempre.

**La regola da consegnare** (e' tre righe, e nessuno le scrive):

```css
/* mai togliere l'outline senza rimetterne uno migliore */
:focus-visible {
  outline: 2px solid var(--focus, #000);
  outline-offset: 3px;
  border-radius: 2px;
}
/* e un anello che si vede su fondo chiaro E scuro: doppio bordo */
.su-fondo-variabile:focus-visible {
  outline: 2px solid #fff;
  box-shadow: 0 0 0 4px #000;
}
```

---

### 1.6 Contrasto insufficiente — dove nasce davvero sui siti creativi

**Dichiarazione onesta: non abbiamo misurato il contrasto su nessuno dei 34
siti.** Quello che possiamo dire e' da dove nasce il problema, ed e' piu' utile
di un elenco di rapporti.

I criteri: **1.4.3 Contrast (Minimum), AA** — 4,5:1 per il testo normale, **3:1**
per il testo grande (18 pt, o 14 pt in grassetto); **1.4.11 Non-text Contrast,
AA** — 3:1 per i bordi dei controlli, gli stati di focus e le parti di grafica
necessarie a capire.

**Le tre cause strutturali che abbiamo verificato:**

1. **`mix-blend-mode`.** Locomotive mette l'H1 in ciano **per differenza** sopra
   un video in autoplay; Revelatio ha i cursori in `difference`; Active Theory
   ha il pannello della chat in `color-dodge`, con testo grigio `#C6C6C6` che
   «diventa lilla o ciano a seconda di cosa gli passa dietro». **Con una blend
   mode il colore reale del testo non esiste come valore**: dipende dal
   fotogramma. Nessuno strumento automatico lo puo' calcolare — e infatti axe
   restituisce "incomplete", non "fail" (vedi sezione 4).
   **Active Theory pero' fa la cosa giusta e va copiata**: sotto 768 px la
   `mix-blend-mode` diventa `normal` e i colori vengono **dichiarati a mano**
   (`#EEEEEE`, `#9CA5FF`). *L'effetto si spegne dove lo schermo e' piccolo e la
   leggibilita' vince.*
2. **Il testo sopra un fondo che cambia scorrendo.** Opal Tadpole: la nostra
   scheda annota che il contrasto su un fondo che cambia in scroll **«uccide
   meta' dei CTA fissi»**; la barra d'acquisto prende una classe `.at-bottom`
   proprio per rimediare. Revelatio inverte bianco/nero a seconda della sezione
   che copre la mezzeria della finestra.
3. **Il testo disegnato in WebGL.** In `_SUONO.md` c'e' il caso letterale:
   l'interruttore audio di igloo.inc e' **«testo disegnato in WebGL in basso a
   sinistra, senza contrasto»**. Non e' un `<button>`, quindi non e' nemmeno
   raggiungibile.

**La regola da consegnare:** ogni testo che sta sopra un video, un canvas o una
`mix-blend-mode` **deve avere un fondo garantito** — un velo, un'ombra piena, o
il colore dichiarato a mano sotto una certa larghezza. Non si delega al caso.

---

## 2. `prefers-reduced-motion` FATTO BENE

### Cosa chiede davvero la preferenza

E' una media feature di **CSS Media Queries Level 5**, con due valori:
`no-preference` e `reduce`. Non e' un interruttore "niente animazioni": la
specifica dice che l'utente ha indicato di preferire un'interfaccia che
**minimizza la quantita' di movimento**, in particolare i movimenti non
essenziali.
Fonte: [w3.org/TR/mediaqueries-5/#prefers-reduced-motion](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion)

Da dove arriva il segnale, perche' bisogna saperlo dire al cliente che chiede
«ma chi la usa questa cosa?»:

| sistema | dove sta |
|---|---|
| **iOS / iPadOS** | Impostazioni > Accessibilita' > **Movimento** > Riduci movimento |
| **macOS** | Impostazioni > Accessibilita' > **Schermo** > Riduci movimento |
| **Windows 10/11** | Impostazioni > Accessibilita' > **Effetti visivi** > Effetti di animazione (spento = `reduce`) |
| **Android** | Impostazioni > Accessibilita' > **Rimuovi animazioni** |

**Non e' una nicchia di malati**: e' anche l'impostazione che accende chi ha
mal d'auto, chi ha emicrania, chi ha un telefono vecchio e chi ha semplicemente
spento le animazioni per far durare la batteria. **Non abbiamo un dato
percentuale verificato** e non ne inventiamo uno.

Il criterio WCAG di riferimento e' **2.3.3 Animation from Interactions**, che e'
di **livello AAA** — quindi *non* obbligatorio per la conformita' AA. Ma
**2.2.2 Pause, Stop, Hide e' livello A**, e riguarda tutto il movimento che
parte da solo. Tradotto: `prefers-reduced-motion` in senso stretto e' facoltativo,
**il comando di pausa no**.
Fonte: [w3.org/WAI/WCAG21/Understanding/animation-from-interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)

---

### La tabella delle decisioni: spegnere, attenuare, lasciare

E' questa la parte che non sta in nessun articolo, e che va imparata a memoria.
Il discrimine e' **il vettore di movimento**: cio' che si sposta o cambia scala
sullo schermo scatena i disturbi vestibolari; cio' che cambia solo opacita' o
colore no.

| | cosa | perche' |
|---|---|---|
| **SPEGNERE** | parallasse (qualunque elemento che scorre a velocita' diversa dalla pagina) | e' il primo scatenante in assoluto: due piani che si muovono a velocita' diverse |
| | scroll morbido / inerzia (Lenis, Locomotive, scroll-jacking) | la pagina continua a muoversi dopo che l'utente ha smesso |
| | zoom e `scale` oltre ~1,1 | espansione del campo visivo = falso movimento in avanti |
| | rotazioni 3D, voli di camera, sequenze scrubbate | vedi Lusion: 44 schermate di volo dentro un tunnel |
| | transizioni di pagina che **traslano** il viewport | si sostituiscono con una dissolvenza |
| | marquee, particellari, screen-shake, loop infiniti | movimento continuo senza fine |
| | video di sfondo in autoplay | e non basta metterlo in pausa: serve il fotogramma statico |
| | pin con movimento interno (sticky + timeline) | l'utente scorre e la pagina resta ferma mentre le cose dentro si muovono: e' la combinazione peggiore |
| **ATTENUARE** | **durate**: dimezzarle, o tagliarle a ~150-200 ms | |
| | **ampiezze**: `translateY(120px)` diventa `8px`, o diventa solo opacita' | il reveal resta, il movimento sparisce |
| | **stagger**: azzerarlo | un elemento alla volta e' una sequenza di movimenti |
| | **inerzia**: `lerp` a `1` | lo scroll segue il dispositivo 1:1 |
| | **movimento ambientale**: rallentarlo | e' esattamente quello che fa Trionn: rotazione da `0.0042` a `0.0015` per frame |
| **LASCIARE** | dissolvenze e cambi di opacita' | nessun vettore di movimento |
| | cambi di colore, sottolineature, stati di hover | |
| | **l'anello di focus** | toglierlo sarebbe un danno, non un aiuto |
| | micro-transizioni sotto ~200 ms e sotto ~10 px | sotto la soglia percettiva di "movimento" |
| | **indicatori di caricamento e barre di progresso** | togliere lo spinner toglie **informazione**. Semmai si sostituisce la rotazione con una barra che si riempie |
| | il movimento **richiesto dall'utente** (un video su cui ha premuto play, una demo che ha aperto) | e' essenziale alla funzione |

**La trappola numero uno, e la sbaglia chiunque copi il reset dal blog di
turno:** se le tue animazioni di ingresso partono da `opacity: 0` e tu
**disattivi la transizione**, il contenuto resta **invisibile per sempre**.
Non basta spegnere l'animazione: bisogna **garantire lo stato finale**.

---

### Il codice

#### 2.1 Il reset globale: cosa fa e perche' non basta

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Perche' `0.01ms` e non `0`.** Con `0` gli eventi `transitionend` e
`animationend` **non vengono emessi**, e qualunque JavaScript che aspetti quegli
eventi per proseguire (transizioni di pagina, preloader, `await` su una
promessa) **resta bloccato per sempre**. Con `0.01ms` l'evento arriva subito e
la catena non si spezza. E' l'unico motivo di quel numero, e quasi nessuno lo sa.

**Perche' non basta.** Questo reset **non tocca** niente di quello che fa
davvero muovere un sito creativo:

- GSAP e le sue timeline (JS, non CSS);
- Lenis / Locomotive / lo scroll morbido;
- il `requestAnimationFrame` di un canvas o di una scena WebGL;
- i `<video autoplay>`;
- Lottie;
- le sequenze scrubbate.

E' esattamente il caso di **Vero**, che ha un `@media (prefers-reduced-motion:
reduce)` che «azzera tutto a `.01ms`»: ha coperto il CSS, non l'`anime.js`
pilotato a mano con `timeline.seek()`. **Il reset globale e' il pavimento, non
la casa.**

#### 2.2 Il modello giusto: un solo numero, `--motion`

Invece di duplicare regole, si dichiara **uno scalare** e lo si moltiplica.
Cosi' si puo' anche **attenuare** (0,3) invece di solo spegnere (0), che e'
proprio la cosa che Apple non fa.

```css
:root {
  --motion: 1;                 /* 1 = pieno, 0 = fermo, 0.3 = attenuato */
  --dur-lento: calc(var(--motion) * 900ms);
  --dur-medio: calc(var(--motion) * 450ms);
  --dur-breve: 150ms;          /* le micro-transizioni restano sempre */
  --parallasse: calc(var(--motion) * 1);
}

@media (prefers-reduced-motion: reduce) { :root { --motion: 0; } }

/* l'interruttore in pagina vince sempre sulla preferenza di sistema */
html[data-motion="reduced"] { --motion: 0; }
html[data-motion="full"]    { --motion: 1; }

.reveal      { transition: opacity var(--dur-medio), transform var(--dur-medio); }
.parallax    { transform: translate3d(0, calc(var(--y) * var(--parallasse)), 0); }
.marquee     { animation: scorri 40s linear infinite; }

@media (prefers-reduced-motion: reduce) {
  .marquee { animation-play-state: paused; }
}
```

Con `--motion: 0` le durate diventano `0ms`, la parallasse diventa `0px` — e
**gli elementi restano dove devono stare**, perche' e' l'ampiezza ad andare a
zero, non l'elemento a sparire.

#### 2.3 Il modello alternativo, ancora piu' sicuro: animare solo su richiesta

```css
/* stato finale come default: se non succede nulla, il sito e' comunque leggibile */
.reveal { opacity: 1; transform: none; }

@media (prefers-reduced-motion: no-preference) {
  .reveal            { opacity: 0; transform: translateY(2rem);
                       transition: opacity .6s var(--ease), transform .6s var(--ease); }
  .reveal.is-visible { opacity: 1; transform: none; }
}
```

**Il vantaggio e' che l'errore per dimenticanza va nella direzione giusta**: se
ti scordi un componente, quel componente e' **meno animato**, non invisibile.
Nel modello opt-out, se ti dimentichi qualcosa, e' invisibile.

#### 2.4 In JavaScript: leggerlo, e **ascoltarne il cambiamento**

La preferenza si puo' cambiare mentre la pagina e' aperta. Chi legge
`matchMedia(...).matches` una volta sola al `load` sbaglia.

```js
const MQ = window.matchMedia('(prefers-reduced-motion: reduce)');

export const motion = {
  get reduced() {
    const scelta = document.documentElement.dataset.motion; // 'full' | 'reduced' | undefined
    if (scelta === 'reduced') return true;
    if (scelta === 'full')    return false;
    return MQ.matches;
  }
};

function applica() {
  document.documentElement.classList.toggle('is-reduced', motion.reduced);
  window.dispatchEvent(new CustomEvent('motion:change', { detail: { reduced: motion.reduced } }));
}

MQ.addEventListener('change', applica);   // NON addListener: deprecato
applica();
```

E l'interruttore in pagina, che e' **il vero adempimento del criterio 2.2.2**
(un comando raggiungibile, non una preferenza di sistema che molti non sanno di
avere):

```js
const salvata = localStorage.getItem('motion');
if (salvata) document.documentElement.dataset.motion = salvata;

document.querySelector('#btn-motion').addEventListener('click', () => {
  const nuovo = motion.reduced ? 'full' : 'reduced';
  document.documentElement.dataset.motion = nuovo;
  localStorage.setItem('motion', nuovo);
  applica();
});
```

```html
<button id="btn-motion" type="button" aria-pressed="false">
  Riduci le animazioni
</button>
```

#### 2.5 GSAP: `gsap.matchMedia()`, non un `if`

`gsap.matchMedia()` e' l'unica forma corretta, perche' **crea e distrugge** le
animazioni e gli ScrollTrigger quando la condizione cambia. Un `if` scritto a
mano lascia in giro trigger morti che continuano a pinnare.

```js
const mm = gsap.matchMedia();

mm.add({
  ok:      '(prefers-reduced-motion: no-preference)',
  ridotto: '(prefers-reduced-motion: reduce)'
}, (ctx) => {
  const { ok } = ctx.conditions;

  if (ok) {
    // la versione da premio
    gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=200%',
                       scrub: 1, pin: true }
    })
    .to('.hero__bg',    { scale: 1.4, ease: 'none' })
    .to('.hero__title', { yPercent: -40, ease: 'none' }, 0);

  } else {
    // la versione ridotta: niente pin, niente scrub, niente scala.
    // Lo stato finale e' garantito, poi una sola dissolvenza.
    gsap.set('.hero__bg',    { scale: 1, clearProps: 'transform' });
    gsap.set('.hero__title', { yPercent: 0, opacity: 1 });
    gsap.from('.hero__title', {
      opacity: 0, duration: 0.2,
      scrollTrigger: { trigger: '.hero', start: 'top 80%', once: true }
    });
  }

  return () => { /* pulizia automatica di tutto cio' che sta nel contesto */ };
});
```

#### 2.6 Lenis / scroll morbido

Dalla nostra scheda `darkroom.md`, verificata leggendo il bundle in produzione:
**`respectReducedMotion` esiste sul ramo `main` di Lenis (default `true`) ma NON
c'e' nella 1.3.25 che gira sul sito degli autori stessi.** Quindi non si da' per
scontato: si scrive.

```js
const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const lenis = new Lenis({
  lerp:        ridotto ? 1 : 0.1,   // 1 = segue il dito/la rotella 1:1
  smoothWheel: !ridotto,
  duration:    ridotto ? 0 : 1.2,
  anchors:     true
});
```

Quando `respectReducedMotion` c'e', fa esattamente questo: **forza `lerp` a 1** e
rende istantanei gli scroll programmatici, **ma continua a girare**, cosi' la
sincronizzazione con il WebGL e con il DOM non si rompe. E' la scelta giusta:
**non si spegne il motore, si azzera l'inerzia.**

#### 2.7 Video, sequenze e Lottie

Il CSS non ferma un `<video autoplay>`. E il modo giusto non e' metterlo in
pausa a meta': e' **mostrare un fotogramma**. E' il pattern di Apple, verificato
in `apple-prodotto.md`: un `<picture class="fallback-frame">` per **ogni**
elemento animato, piu' `data-load-timeout="3000"` che ripiega sul fotogramma
statico se l'animazione non e' pronta in tre secondi.

```js
function rispettaPreferenza() {
  const ridotto = motion.reduced;

  document.querySelectorAll('video[data-hero]').forEach((v) => {
    if (ridotto) {
      v.pause();
      v.removeAttribute('autoplay');
      v.currentTime = v.dataset.frameFermo || 0;  // il fotogramma che "vende"
      v.controls = true;                          // e da qui in poi decide l'utente
      v.closest('.media')?.classList.add('mostra-poster');
    } else if (v.paused && v.dataset.autoplay === 'true') {
      v.play().catch(() => {});
    }
  });

  document.querySelectorAll('[data-lottie]').forEach((el) => {
    const anim = el._lottie;
    if (!anim) return;
    ridotto ? (anim.goToAndStop(anim.totalFrames - 1, true)) : anim.play();
  });
}

window.addEventListener('motion:change', rispettaPreferenza);
```

Nota su Lottie: `goToAndStop(totalFrames - 1)` e non `stop()`. `stop()` riporta
al fotogramma 0, che spesso e' **il vuoto**: si finisce con un buco al posto
dell'illustrazione. Anche qui, **garantire lo stato finale**.

#### 2.8 WebGL: attenuare, non spegnere

Spegnere un canvas WebGL lascia un rettangolo nero: e' peggio del movimento.
La scala giusta e' quella di Trionn, che pero' si ferma a meta' — noi la
completiamo:

```js
const k = motion.reduced ? 0 : 1;

// 1. il movimento ambientale rallenta ma non si ferma (0.0042 -> 0.0015)
gruppo.rotation.y += 0.0015 + 0.0027 * k;

// 2. l'inseguimento del puntatore si spegne del tutto: e' movimento non richiesto
camera.position.lerp(bersaglio, 0.06 * k);

// 3. lo scrub della camera diventa uno scatto fra due pose, senza interpolazione
if (motion.reduced) camera.position.copy(posa[Math.round(progresso * (posa.length - 1))]);
```

E se la scena e' **il contenuto** (un configuratore, un prodotto girevole), non
si tocca: e' movimento essenziale, richiesto dall'utente. La distinzione e'
sempre la stessa: **movimento che l'utente ha chiesto, o movimento che gli e'
capitato addosso.**

#### 2.9 Le altre preferenze, che costano dieci minuti e nessuno mette

```css
@media (prefers-reduced-transparency: reduce) {
  .vetro { backdrop-filter: none; background: var(--fondo-pieno); }
}

@media (forced-colors: active) {           /* alto contrasto di Windows */
  .bottone { border: 1px solid ButtonText; forced-color-adjust: none; }
}

@media (prefers-contrast: more) {
  :root { --testo-secondario: var(--testo); }
}

/* lo scroll morbido nativo va SEMPRE dentro una no-preference */
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
```

#### 2.10 Come si prova, in trenta secondi

Chrome/Edge DevTools > `Cmd/Ctrl+Shift+P` > **"Show Rendering"** > sezione
**Emulate CSS media feature `prefers-reduced-motion`** > `reduce`.
Firefox: `about:config` > `ui.prefersReducedMotion = 1`.

**E poi si riscorre la pagina intera.** Il 90% dei bug di
`prefers-reduced-motion` sono contenuti rimasti invisibili, non animazioni
rimaste accese.

---

## 3. COSA DICE LA LEGGE, IN ITALIA E IN EUROPA

> **Avvertenza d'uso.** Questa sezione e' stata scritta **senza accesso alla
> rete**. Le date e l'ambito della direttiva 2019/882 sono la parte stabile e le
> riporto con sicurezza. **Gli importi delle sanzioni italiane e i numeri di
> alcuni articoli del decreto di recepimento vanno riletti su Normattiva prima
> di scriverli in un'offerta**: sono marcati **[DA RIVERIFICARE]**. Non usare
> mai un blog come fonte: gli atti sono liberamente consultabili e bastano due
> minuti.

### 3.1 Prima cosa: non e' una legge sola, sono tre regimi distinti

Il malinteso commerciale piu' diffuso in Italia e' che «dal 28 giugno 2025 tutti
i siti devono essere accessibili». **E' falso**, e chi lo dice a un cliente
brucia la propria credibilita' al primo commercialista che controlla. I regimi
sono tre e non si sovrappongono:

| # | regime | chi tocca | da quando |
|---|---|---|---|
| **A** | **Direttiva (UE) 2016/2102** (siti e app del settore pubblico) → in Italia **L. 4/2004 "Stanca"** come modificata dal **D.Lgs. 10 agosto 2018, n. 106** | pubbliche amministrazioni, organismi di diritto pubblico, societa' in controllo pubblico | siti nuovi **23/09/2019**, siti esistenti **23/09/2020**, app mobili **23/06/2021** |
| **B** | **L. 4/2004, art. 3, comma 1-bis** (introdotto dal **D.L. 76/2020** conv. **L. 120/2020**) | **soggetti privati** che offrono servizi al pubblico via web o app con **fatturato medio negli ultimi tre anni superiore a 500 milioni di euro** | dal 2022 |
| **C** | **Direttiva (UE) 2019/882 — European Accessibility Act** → in Italia **D.Lgs. 27 maggio 2022, n. 82** | **operatori economici privati** su un elenco chiuso di **prodotti e servizi** | **28 giugno 2025** |

Il regime **C** e' quello che interessa un'agenzia, perche' e' l'unico che
raggiunge i clienti privati normali.

### 3.2 European Accessibility Act — le date, per atto

**Direttiva (UE) 2019/882 del Parlamento europeo e del Consiglio, del 17 aprile
2019, sui requisiti di accessibilita' dei prodotti e dei servizi.**
Pubblicata in **GU UE L 151 del 7 giugno 2019**.
Testo ufficiale: [eur-lex.europa.eu — CELEX 32019L0882](https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX%3A32019L0882)

| momento | data | dove sta |
|---|---|---|
| entrata in vigore | **27 giugno 2019** (20° giorno dalla pubblicazione) | art. 33 |
| termine di recepimento per gli Stati | **28 giugno 2022** | art. 31, §1 |
| **inizio di applicazione** | **28 giugno 2025** | art. 31, §2 |
| deroga transitoria: servizi prestati usando **prodotti** gia' legittimamente impiegati prima | fino al **28 giugno 2030** | art. 32, §1 |
| deroga transitoria: **contratti di servizio** conclusi prima del 28/06/2025 | possono proseguire fino alla scadenza, **e comunque non oltre il 28 giugno 2030** | art. 32, §2 |
| terminali self-service gia' in uso | fino a fine vita utile, **massimo 20 anni** | art. 32, §3 |

**Attenzione a come si legge la deroga al 2030.** Molti articoli italiani
scrivono «i siti gia' esistenti hanno tempo fino al 2030». **Non e' quello che
dice l'art. 32**: la proroga riguarda i **prodotti** impiegati per erogare il
servizio e i **contratti** gia' conclusi, non il contenuto di un sito web. **Un
e-commerce gia' online e' soggetto agli obblighi dal 28 giugno 2025.**

### 3.3 A chi si applica — l'elenco e' chiuso

**Prodotti** (art. 2, §1): computer e sistemi operativi per consumatori;
**terminali self-service** (terminali di pagamento, bancomat, biglietterie
automatiche, chioschi di check-in, terminali informativi interattivi);
apparecchiature terminali per consumatori con capacita' di calcolo interattiva
usate per le comunicazioni elettroniche; apparecchiature terminali per
l'accesso ai servizi di media audiovisivi; **e-reader**.

**Servizi** (art. 2, §2) — la lista che conta per noi:

| servizio | cosa vuol dire per un'agenzia |
|---|---|
| **commercio elettronico** | **il punto centrale.** Definito all'art. 3, §30 come i servizi forniti **a distanza, attraverso siti web e servizi su dispositivi mobili, per via elettronica e su richiesta individuale di un consumatore, al fine di concludere un contratto di consumo** |
| servizi bancari per consumatori | siti, app, home banking, contratti, identificazione |
| servizi di comunicazione elettronica | operatori telefonici, VoIP, messaggistica |
| servizi che danno accesso ai media audiovisivi | siti e app delle piattaforme, EPG |
| elementi dei servizi di **trasporto passeggeri** (aereo, autobus, ferroviario, via nave) | siti, app, **biglietteria elettronica**, informazioni di viaggio, servizi self-service |
| **libri elettronici** e software dedicato | editori, piattaforme di lettura |

**Le tre conseguenze operative che vanno dette al cliente, senza ammorbidirle:**

1. **Il sito vetrina di un'azienda NON e' coperto dall'EAA.** Un sito
   istituzionale, un portfolio, un sito di un ristorante senza prenotazione
   online: fuori ambito. Chi vende l'EAA su un sito vetrina sta mentendo.
2. **Il B2B NON e' coperto.** La definizione dice **consumatore**. Un portale
   per rivenditori e' fuori.
3. **Un e-commerce B2C e' dentro.** Il sito, l'app, il carrello, il checkout,
   l'assistenza. E per un'agenzia italiana **e' la fetta di clientela piu'
   grande in assoluto** che passa da "consiglio" a "obbligo".

Un caso di confine da chiarire sempre: **la prenotazione online**. Un sito di un
hotel o di un ristorante con prenotazione e pagamento e' un contratto di consumo
concluso a distanza per via elettronica. **Rientra.** Una pagina con un numero
di telefono no.

### 3.4 Chi e' esonerato

- **Microimprese che forniscono SERVIZI** (art. 4, §5): esonerate. La
  definizione (Raccomandazione 2003/361/CE) e': **meno di 10 occupati** **e**
  fatturato annuo **oppure** totale di bilancio **non superiore a 2 milioni di
  euro**. Attenzione al doppio vincolo: 8 dipendenti e 3 milioni di fatturato
  **non e'** una microimpresa.
  **L'esonero vale per i servizi, non per i prodotti**: chi fabbrica, importa o
  distribuisce prodotti resta soggetto (con qualche alleggerimento
  documentale).
- **Onere sproporzionato** (art. 14 e Allegato VI): si puo' invocare, ma
  **va documentato per iscritto**, conservato **5 anni**, **rivalutato ogni 5
  anni** o a ogni modifica del servizio, e comunicato all'autorita' su
  richiesta. E **non si puo' invocare se si e' ricevuto un finanziamento
  esterno destinato a migliorare l'accessibilita'**.
- **Modifica sostanziale** che alteri la natura di base del prodotto/servizio:
  stessa disciplina.

Da qui esce **un argomento di vendita che quasi nessuno usa**: l'onere
sproporzionato **non e' gratis**. Documentarlo, conservarlo e rivalutarlo ogni
cinque anni costa consulenza. Su un progetto medio, **rendere il sito conforme
costa meno che dimostrare per iscritto che non si poteva.**

### 3.5 Cosa vuol dire concretamente "conforme"

I requisiti stanno nell'**Allegato I** della direttiva, scritti per funzioni
(percepibile, utilizzabile, comprensibile, robusto) e non per tecnologie.
L'**art. 15** stabilisce la **presunzione di conformita'** per cio' che rispetta
le norme armonizzate pubblicate in Gazzetta UE.

In pratica, per un sito, la catena e':
**Allegato I → EN 301 549 → WCAG 2.1 livello AA.**

- **EN 301 549 V3.2.1 (2021-03)** e' la norma tecnica europea di riferimento; il
  suo capitolo 9 (Web) recepisce **WCAG 2.1 livello A e AA**.
  [etsi.org — EN 301 549 V3.2.1 (PDF)](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf)
- Il riferimento e' citato in GUUE per la direttiva 2016/2102 dalla **Decisione
  di esecuzione (UE) 2018/2048**, come modificata dalla **Decisione di
  esecuzione (UE) 2021/1339**.
- **[DA RIVERIFICARE]** quale versione di EN 301 549 sia citata in GUUE **per
  l'EAA** (esiste una V4.x pubblicata da ETSI nel 2025 in risposta al mandato di
  normazione M/587): verificare su
  [eur-lex.europa.eu](https://eur-lex.europa.eu/) e su
  [etsi.org](https://www.etsi.org/). **Nel dubbio operativo si lavora su WCAG
  2.2 AA**, che e' sovrainsieme di 2.1 AA e non puo' essere sbagliato.

**L'obbligo che tutti dimenticano e che non e' tecnico** (art. 13): il fornitore
del servizio deve **descrivere nelle condizioni generali di contratto come il
servizio soddisfa i requisiti di accessibilita'**. E' una pagina di testo. E' la
cosa piu' facile da vendere e da consegnare, ed e' quella che un'ispezione
guarda per prima perche' e' pubblica.

### 3.6 Sanzioni e chi controlla

**Livello europeo** (art. 30): gli Stati membri stabiliscono le sanzioni, che
devono essere **effettive, proporzionate e dissuasive**, e devono essere
accompagnate da **azioni correttive effettive**. La direttiva **non fissa
importi**: li fissa ogni Stato.

**Livello italiano.** Il recepimento e' il **Decreto Legislativo 27 maggio 2022,
n. 82**, «Attuazione della direttiva (UE) 2019/882 [...] sui requisiti di
accessibilita' dei prodotti e dei servizi», pubblicato in **Gazzetta Ufficiale,
Serie Generale n. 134 del 10 giugno 2022**.
Testo consolidato: [normattiva.it](https://www.normattiva.it/) (cercare
"decreto legislativo 82 2022").

**[DA RIVERIFICARE — questo e' il punto piu' delicato dell'intero documento]**

- **L'importo che circola in tutta la stampa specializzata italiana e' «fino al
  5 per cento del fatturato»**, con l'irrogazione affidata all'**AgID**. La cifra
  del 5% e' coerente sia con l'impianto del D.Lgs. 82/2022 sia con quello della
  L. 4/2004 per i privati sopra i 500 milioni. **Ma l'articolo esatto e la
  formulazione precisa vanno letti su Normattiva prima di citarli**: non
  scrivere mai un numero di articolo che non hai aperto.
- **Le autorita' competenti** (vigilanza sul mercato dei prodotti da un lato,
  verifica di conformita' dei servizi dall'altro) sono ripartite fra **AgID** e
  amministrazioni di settore. **La ripartizione esatta va verificata**: non
  affermarla a memoria.

**Cio' che invece e' certo e vale come argomento:** l'EAA prevede (art. 29) che
**consumatori e associazioni** possano agire davanti agli organi giurisdizionali
o amministrativi per far rispettare gli obblighi. **Il rischio non arriva solo
dall'ispezione: arriva dal cliente arrabbiato e dall'associazione di
categoria.** In un mercato dove la denuncia costa un modulo, questo e' l'argomento
che sposta il preventivo — non la multa teorica.

### 3.7 Il quarto canale, che nessuno cita e che vale soldi: gli appalti

**Direttiva 2014/24/UE, art. 42**: per tutti gli appalti destinati all'uso da
parte di persone fisiche, le specifiche tecniche devono essere elaborate
**tenendo conto dei criteri di accessibilita' per le persone con disabilita' o
della progettazione per tutti gli utenti**, salvo casi debitamente motivati.

Tradotto: **qualunque fornitura ICT a una pubblica amministrazione italiana
deve gia' oggi contenere requisiti di accessibilita'.** Un'agenzia che sa
consegnare una dichiarazione di accessibilita' e un report WCAG **puo'
partecipare a gare a cui le altre non arrivano**. Il riferimento italiano sono
la L. 4/2004 e le **Linee guida sull'accessibilita' degli strumenti informatici
di AgID**, che rimandano a EN 301 549 e impongono la **dichiarazione di
accessibilita'** pubblicata tramite il modulo AgID e **rinnovata ogni anno**
([agid.gov.it — accessibilita'](https://www.agid.gov.it/it/design-servizi/accessibilita)).
**[DA RIVERIFICARE]** la scadenza annuale esatta della dichiarazione (nella
prassi e' fissata a settembre) e gli estremi della determinazione AgID vigente.

---

## 4. COME SI VERIFICA

### 4.1 Gli strumenti gratuiti, e cosa trovano davvero

| strumento | cosa e' | cosa trova | cosa NON trova | tempo |
|---|---|---|---|---|
| **axe DevTools** (estensione Chrome/Firefox, motore **axe-core**, open source) | il motore piu' usato al mondo, e' anche quello dentro Lighthouse | violazioni deterministiche: alt mancanti, label mancanti, ARIA sbagliata, contrasto **quando calcolabile**, gerarchia dei titoli | tutto cio' che richiede giudizio | 2 min/pagina |
| **Lighthouse** (dentro Chrome) | usa **un sottoinsieme** delle regole axe | i grandi errori, e **`user-scalable=no`** (audit `meta-viewport`) | **il punteggio 100 non significa niente**: e' una media pesata di ~40 controlli automatici su ~90 criteri WCAG | 1 min |
| **WAVE** (WebAIM) | estensione con evidenziazione visiva sulla pagina | ottimo per **far vedere il problema al cliente**: mette le icone sopra gli elementi | idem come sopra | 2 min |
| **Accessibility Insights for Web** (Microsoft, gratuito) | axe + **"Assessment" guidato**: ti fa fare a mano i controlli che la macchina non puo' fare, uno alla volta | **e' l'unico gratuito che copre anche il manuale**, con checklist e registrazione degli esiti | | 2-4 h per un audit guidato completo |
| **NVDA** (Windows, gratuito) + **VoiceOver** (macOS/iOS, incluso) | lettori di schermo veri | tutto quello che conta davvero: ordine di lettura, testo nel canvas, bottoni senza nome, modali che non catturano il focus | | 20 min per le pagine chiave |
| **Colour Contrast Analyser** (TPGi, gratuito) | contagocce + calcolo del rapporto | il contrasto **reale**, anche sopra immagini e video, campionando i pixel | | 10 min |
| **DevTools > Rendering** | emulazione `prefers-reduced-motion`, `prefers-contrast`, `forced-colors`, daltonismi | il comportamento con le preferenze attive | | 30 sec |
| **la tastiera** | `Tab`, `Shift+Tab`, `Invio`, `Spazio`, `Esc`, frecce | **il 40% dei problemi veri**, e non costa niente | | 5 min |

### 4.2 Il numero che va detto al cliente prima di ogni preventivo

**Gli strumenti automatici trovano fra il 30% e il 57% dei problemi.** Il 57% e'
la cifra dichiarata da **Deque**, che vende axe (ed e' quindi la stima piu'
generosa possibile); le rilevazioni indipendenti stanno **intorno al 30-40%**.
**[DA RIVERIFICARE le fonti puntuali]** — ma qualunque numero si scelga dentro
quella forbice, la conclusione non cambia:

> **Un sito con Lighthouse Accessibility a 100 puo' essere inutilizzabile.**

E il caso peggiore e' proprio il nostro: **su un sito creativo, la percentuale
trovata dall'automatico crolla ulteriormente**, perche' le sue tre firme —
canvas, blend mode, movimento — sono esattamente cio' che l'automatico non sa
valutare. Il dettaglio tecnico che serve saper spiegare: quando il testo sta
sopra un'immagine, un video, un gradiente o una `mix-blend-mode`, **axe non
restituisce "fail": restituisce "incomplete" / "needs review"**. Cioe' alza le
mani. E chi legge il report a valle vede zero errori.

Il quadro generale, dalla rilevazione annuale **WebAIM Million** (analisi
automatica su un milione di home page,
[webaim.org/projects/million](https://webaim.org/projects/million/)) — cifre
stabili anno dopo anno, **[DA RIVERIFICARE l'edizione corrente]**:

- circa il **95%** delle home page ha errori WCAG **rilevabili in automatico**;
- media di **~50 errori per home page**;
- la classifica degli errori non cambia mai: **contrasto insufficiente** (~4 su
  5 delle pagine), **alt mancanti**, **campi di form senza label**, **link
  vuoti**, **bottoni vuoti**, **lingua del documento mancante**.

**Quattro di questi sei errori si sistemano in mezza giornata e non toccano il
design.** E' il motivo per cui l'accessibilita' e' il criterio piu' economico da
guadagnare (vedi sezione 5).

### 4.3 Cosa l'automatico non trovera' mai, e che affossa proprio noi

1. **Il testo dentro il canvas.** Per axe non esiste: `<canvas>` e' un elemento
   valido con un ruolo `img` implicito. Nessuno strumento ti dira' mai che il
   tuo `<h1>` e' una texture.
2. **L'ordine del focus.** Si controlla solo premendo Tab.
3. **Il movimento.** Nessuno strumento sa se la tua parallasse si spegne.
4. **Il gesto senza equivalente da tastiera** (il caso Simply Chocolate).
5. **La qualita' degli `alt`**: `alt="immagine1.jpg"` passa il controllo.
6. **Il contrasto sopra media in movimento** (il caso `mix-blend-mode`).
7. **Le trappole di focus** in modali e menu.
8. **Lo scroll rubato**: se la rotella e' intercettata, un utente da tastiera o
   con uno zoom al 200% puo' semplicemente **non riuscire ad arrivare in fondo**.
9. **Il tempo**: caroselli che cambiano da soli, timeout, animazioni obbligatorie
   prima di poter interagire (i preloader lunghi).

### 4.4 Lo screening da 30 minuti — quello che facciamo su ogni sito prima di consegnare

Nell'ordine, senza scorciatoie:

1. **Tab dall'inizio alla fine.** Si vede sempre dove sono? Si arriva a tutto?
   Si esce dai menu con `Esc`? Il primo tab offre un "salta al contenuto"?
2. **Zoom del browser al 200%** su desktop (e testo a 200% sul telefono, se lo
   zoom non e' bloccato: si scopre subito se lo e').
3. **`prefers-reduced-motion: reduce`** attivo, e **riscorrere tutta la pagina**:
   cerchi contenuti rimasti invisibili, non animazioni rimaste accese.
4. **Contagocce su cinque coppie critiche**: testo su hero, CTA, testo
   secondario, placeholder dei form, testo sopra il video.
5. **NVDA o VoiceOver sulla home e su una pagina di dettaglio.** Se in due minuti
   non capisci di che azienda si tratta, il sito e' da rifare.
6. **axe DevTools** su 5 template. E' l'ultimo passaggio, non il primo: serve a
   raccogliere le briciole.
7. **Audio e video**: parte qualcosa da solo? Si puo' fermare **senza il mouse**?

### 4.5 Metterlo in CI — noi abbiamo gia' Playwright

Non e' un'aggiunta teorica: la pipeline di registrazione che usiamo gia'
(`playwright`) esegue anche questo, e diventa un controllo automatico a ogni
consegna.

```bash
npm i -D @axe-core/playwright
```

```js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGINE = ['/', '/lavori', '/lavori/progetto-1', '/contatti'];

for (const url of PAGINE) {
  test(`accessibilita' AA: ${url}`, async ({ page }) => {
    await page.goto(url);
    const esito = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // le "incomplete" NON sono verdi: vanno guardate a mano
    console.log(`${url} — da rivedere a mano: ${esito.incomplete.length}`);
    expect(esito.violations, JSON.stringify(esito.violations, null, 2)).toEqual([]);
  });

  test(`movimento ridotto: ${url}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(url);
    // il controllo che conta: nessun contenuto rimasto invisibile
    const invisibili = await page.locator('.reveal:not(.is-visible)').count();
    expect(invisibili).toBe(0);
  });
}
```

`page.emulateMedia({ reducedMotion: 'reduce' })` e
`page.emulateMedia({ forcedColors: 'active' })` sono API native di Playwright:
**il controllo piu' importante di tutta la sezione 2 e' automatizzabile in tre
righe.**

### 4.6 Quanto costa una verifica seria

**Queste sono le nostre stime a giorni-uomo, non una rilevazione di mercato.**
Marcate come tali, e da tarare sui primi due lavori veri.

| livello | cosa comprende | tempo | prezzo indicativo |
|---|---|---|---|
| **Screening** | i 7 passi di 4.4 su 5 template, elenco puntato dei problemi, nessun report formale | **mezza giornata** | **300-500 €** — o gratis, come strumento commerciale di apertura (vedi 5.4) |
| **Audit WCAG 2.1/2.2 AA** | 8-12 template, automatico + manuale completo, 2 lettori di schermo, tastiera, zoom 200%, movimento, contrasto misurato, report per criterio con gravita' e schermate | **3-5 giorni** | **2.000-4.000 €** |
| **Audit + piano di rimedio** | l'audit, piu' l'indicazione tecnica di come si sistema ogni voce, ordinata per rapporto impatto/costo | **+1-2 giorni** | **+800-1.500 €** |
| **Ricontrollo dopo i fix** | rifare i controlli falliti e chiudere il verbale | **1 giorno** | **500-800 €** |
| **Dichiarazione di accessibilita'** + testo per le condizioni generali (obbligo art. 13 EAA) | pagina pubblica, mantenimento annuale | **mezza giornata** | **300-600 €/anno** |

**Il confronto che serve a difendere il prezzo:** un audit esterno di uno studio
specializzato in Italia sta tipicamente **fra i 3.000 e i 10.000 €** e **non
include la correzione**. Costruire il sito accessibile dall'inizio costa
**dal 5 al 10% in piu' del progetto**; rimediarci sopra a fine lavoro costa
molto di piu', perche' tocca l'impianto (la gerarchia dei titoli, il focus, la
struttura del canvas) e non la vernice.

### 4.7 Gli overlay: la risposta e' no, e va detta subito

Prima o poi un cliente chiedera' «ma non c'e' quel widget che si installa e
risolve tutto?». La risposta:

- gli overlay (widget JS che promettono conformita' automatica) sono oggetto
  dell'**Overlay Fact Sheet** ([overlayfactsheet.com](https://overlayfactsheet.com/)),
  firmato da **centinaia di professionisti dell'accessibilita'**, molti dei
  quali sono utenti di lettori di schermo, che dichiarano di **disattivarli**;
- **non sanare l'inaccessibilita' strutturale**: non possono mettere il tuo
  `<h1>` dentro il DOM se e' una texture, ne' dare un equivalente da tastiera a
  un gesto di trascinamento;
- **negli Stati Uniti sono finiti sotto azione della FTC** per pubblicita'
  ingannevole **[DA RIVERIFICARE: il caso accessiBe, gennaio 2025, con una
  sanzione dell'ordine del milione di dollari]**;
- e sono un rischio legale al contrario: **dichiarare la conformita' senza
  averla e' esattamente cio' che rende dimostrabile la colpa.**

**La frase da usare:** *un overlay non ti mette a norma, ti mette per iscritto
che sapevi.*

---

## 5. IL PUNTO DI VENDITA

### 5.1 I tre clienti, e sono tre discorsi diversi

| chi | la leva | la frase |
|---|---|---|
| **A. Chi e' obbligato** — e-commerce B2C, banche, assicurazioni con vendita online, trasporti, telco, editori, hotel con prenotazione | **28 giugno 2025**: e' gia' passato. Non e' un progetto futuro, e' un'inadempienza in corso | «Dal 28 giugno 2025 il vostro checkout e' soggetto all'European Accessibility Act. Non e' una best practice: e' il D.Lgs. 82/2022. In mezza giornata vi diciamo dove siete» |
| **B. Chi vuole il premio** — studi, brand, chiunque punti a un riconoscimento | l'accessibilita' e' **il criterio piu' economico** di tutto l'impianto Awwwards | «L'accessibilita' e' 1/6 del Developer Award e vale in media **6,70**, contro **7,99** delle animazioni. E' l'unico criterio che si puo' verificare **prima** di pagare i 65 € di candidatura» |
| **C. Chi vuole il mercato** — retail, servizi, chi ha un pubblico anziano | il pubblico escluso e' quello che spende | «Nell'Unione Europea ci sono circa **87 milioni di persone con disabilita'** (Strategia UE per i diritti delle persone con disabilita' 2021-2030, COM(2021) 101 final). Piu' tutti quelli che al sole non leggono, che tengono il telefono con una mano sola, che hanno cinquant'anni e non lo dicono» |

### 5.2 L'argomento per la giuria di un premio — i numeri esatti da `_PREMI.md`

Questo e' il pezzo che vale piu' di tutto il resto, perche' **e' aritmetica**,
non opinione:

- **L'usabilita' pesa il 30% del voto della giuria** (Design 40%, Usability 30%,
  Creativity 20%, Content 10% — [awwwards.com/about-evaluation](https://www.awwwards.com/about-evaluation/)),
  ed e' **il criterio dove tutti prendono i voti piu' bassi**: media **7,12**
  contro 7,47 di creativity, misurata su 31 Site of the Day. **Mezzo punto di
  usabilita' vale +0,15 sul totale**, e la concorrenza lo sta regalando.
- **Nel Developer Award l'accessibilita' e' il punto piu' debole del web
  premiato**: media **6,70**, minimo osservato **6,0**, contro **7,99** delle
  animazioni. **1,29 punti di scarto.**
- Se i sei criteri dev pesano uguale (compatibile con i dati, non confermato
  ufficialmente), **portare l'accessibilita' da 6,7 a 8,5 alza il totale dev di
  +0,30** — piu' del divario fra il Dev Award medio (7,33) e la soglia di
  ammissione (7,0).
- **E' l'unico criterio auditabile da soli prima di spendere.** Design,
  creativity e content si scoprono solo pagando.

**La conclusione commerciale, in una riga:** *l'accessibilita' e' l'unico posto
del sistema dei premi dove si comprano decimi con la disciplina invece che col
talento.*

E il caso studio da portare in riunione ce l'abbiamo gia' pronto, ed e'
imbarazzante nel modo giusto: **il Site of the Year 2018 e' il sito di un museo
pubblico, con una pagina dedicata all'accessibilita' fisica, che impedisce di
ingrandire il testo sul telefono. Accessibilita': 5,50.**

### 5.3 Il riposizionamento che fa la differenza sul prezzo

L'errore e' vendere l'accessibilita' come **conformita'** (un costo, una tassa,
una cosa che il cliente vuole pagare il meno possibile). Va venduta come
**tre cose che il cliente gia' vuole comprare**:

| si vende come | perche' e' vero, con la prova interna |
|---|---|
| **SEO e visibilita' sulle AI** | e' letteralmente lo stesso lavoro: portare il testo dentro il DOM. `_CANVAS-E-GOOGLE.md`: i crawler di ChatGPT, Claude e Perplexity **non eseguono JavaScript**; il rendering di Google **non scarica immagini ne' video**. Il sito che ha vinto il premio piu' importante del 2024 ha un `<body>` vuoto: *e' bellissimo, e non lo trova nessuno* |
| **prestazioni e batteria** | `prefers-reduced-motion` e i fallback statici sono lo stesso impianto della degradazione: Apple ha **15 validatori** che spengono l'esperienza ricca, e il movimento ridotto e' uno di quelli |
| **conversione** | Opal Tadpole: il contrasto su un fondo che cambia scorrendo **«uccide meta' dei CTA fissi»**. Un bottone che non si legge non e' un problema di accessibilita': e' un problema di fatturato |

### 5.4 La mossa di apertura: lo screening gratuito

**E' il miglior grimaldello commerciale che abbiamo**, e costa mezza giornata:

1. si prende il sito del prospect;
2. si fanno i 7 passi di 4.4 (30 minuti veri) piu' axe su 5 template;
3. si consegna **una pagina sola**: tre schermate con il problema cerchiato, il
   criterio WCAG violato con numero e livello, la data del 28 giugno 2025 se il
   cliente e' in ambito EAA, e **una riga sul rischio**: consumatori e
   associazioni possono agire (art. 29 della direttiva);
4. **non si vende l'audit: si vende il rifacimento.** L'audit e' il pretesto per
   entrare.

Funziona perche' e' **verificabile**: il cliente puo' premere Tab da solo e
vedere che non succede niente.

### 5.5 Cosa non promettere mai

- **Mai «100% conforme» o «WCAG certificato».** Non esiste una certificazione
  WCAG. Si dichiara un **livello** (AA), una **versione** (2.1 o 2.2), una
  **data**, un **perimetro** (quali template) e un **metodo**. Punto.
- **Mai «a norma per sempre».** Ogni pubblicazione di contenuti puo' rompere la
  conformita': per questo la dichiarazione si rinnova e il ricontrollo si vende
  come canone annuale — **che e' ricavo ricorrente, non un fastidio**.
- **Mai citare la sanzione senza aver aperto l'articolo.** Se il cliente
  controlla e la cifra e' sbagliata, hai perso il lavoro e la reputazione nello
  stesso minuto. Vedi l'avvertenza in cima alla sezione 3.

---

## 6. LA CHECKLIST OPERATIVA — 20 PUNTI PRIMA DI CONSEGNARE

Ordinata per **costo crescente**. I primi 8 si controllano in mezz'ora e coprono
la maggioranza dei punti che un giurato o un ispettore vede per primo.

| # | controllo | come si verifica | criterio |
|---|---|---|---|
| 1 | Il `<meta viewport>` **non** contiene `user-scalable=no` ne' `maximum-scale` | cerca "viewport" nel sorgente | **1.4.4 AA** |
| 2 | `<html lang="it">` presente e corretto, e cambiato dove cambia la lingua | sorgente | 3.1.1 A |
| 3 | Ogni pagina ha **un solo `<h1>`** e una gerarchia di titoli senza salti | axe / estensione headings | 1.3.1 A |
| 4 | **Tutto il testo che conta e' nel DOM**, non solo nel canvas. Se c'e' WebGL, esiste il livello alternativo (modello `GLA11y` di Active Theory) | disattiva JavaScript, oppure guarda il sorgente grezzo | 1.1.1 A |
| 5 | Ogni immagine informativa ha un `alt` **che dice cosa mostra**; quelle decorative hanno `alt=""` | a mano, 5 minuti | 1.1.1 A |
| 6 | Ogni campo di form ha una `<label>` associata (non solo un `placeholder`) | axe | 3.3.2 A |
| 7 | Ogni bottone e ogni link hanno **un nome accessibile** (niente `<a>` vuoti con dentro un'icona) | axe | 4.1.2 A |
| 8 | **Niente autoplay con audio.** Se c'e' suono, parte **muto** e ha un interruttore vero (`<button>`, non una scritta in WebGL) | apri il sito a volume alto | **1.4.2 A** |
| 9 | **Ogni movimento che parte da solo e dura piu' di 5 s ha un comando di pausa** raggiungibile da tastiera: caroselli, marquee, video di sfondo, Lottie in loop | Tab fino al carosello | **2.2.2 A** |
| 10 | `prefers-reduced-motion: reduce` attivo → **niente parallasse, niente scroll morbido, niente scrub, niente pin con movimento interno** | DevTools > Rendering | 2.3.3 AAA |
| 11 | `prefers-reduced-motion: reduce` attivo → **si scorre tutta la pagina e non manca nessun contenuto** (nessun `opacity: 0` rimasto) | a mano + test Playwright di 4.5 | — |
| 12 | Con la sola tastiera si raggiunge **ogni** funzione: menu, filtri, modali, carosello, e il **gesto principale del sito** ha un equivalente | Tab / frecce / Invio / Esc | **2.1.1 A** |
| 13 | Il focus **si vede sempre**, anche sopra video, canvas e fondi che cambiano; e non finisce **sotto** l'header fisso o il cursore personalizzato | Tab lento su tutta la pagina | 2.4.7 AA + 2.4.11 AA (2.2) |
| 14 | Modali e menu: il focus entra dentro, **resta dentro**, `Esc` chiude e il focus **torna dove era** | Tab dentro la modale | 2.4.3 A |
| 15 | Primo elemento focalizzabile = **"Salta al contenuto"** funzionante | premi Tab appena carica | 2.4.1 A |
| 16 | Contrasto **misurato col contagocce** (non a occhio) su: titolo hero, corpo, testo secondario, CTA, testo sopra media, placeholder → **4,5:1** (3:1 se grande) | Colour Contrast Analyser | 1.4.3 AA |
| 17 | Contrasto **3:1** su bordi dei campi, stati di focus e icone che veicolano informazione; e **l'informazione non e' mai data dal solo colore** | CCA + prova in scala di grigi | 1.4.11 AA + 1.4.1 A |
| 18 | **Zoom del browser al 200%**: nessun contenuto tagliato, nessuna barra orizzontale, niente testo sovrapposto (e 400% a 1280 px per il reflow) | `Ctrl +` | 1.4.4 AA + 1.4.10 AA |
| 19 | Un giro con **NVDA** (Windows) e uno con **VoiceOver** (iOS) su home + pagina di dettaglio + checkout: si capisce di cosa si tratta e si arriva in fondo | 20 minuti | trasversale |
| 20 | Consegnati insieme al sito: **pagina di dichiarazione di accessibilita'**, il paragrafo per le **condizioni generali** (obbligo art. 13 EAA per i servizi in ambito), e il **report** con livello, versione WCAG, data, perimetro e problemi noti | file, non parole | art. 13 dir. 2019/882 |

**I tre che cadono per primi in un sito da premio**, per esperienza dei 34 casi
analizzati: il **12** (il gesto senza tastiera), il **13** (il focus invisibile
sopra il canvas) e l'**11** (i contenuti che spariscono col movimento ridotto).
Se hai tempo per tre soli controlli, fai quei tre.

---

## FONTI

**Atti ufficiali** (da rileggere prima dell'uso commerciale — vedi avvertenza 3):

- **Direttiva (UE) 2019/882** (European Accessibility Act), GU UE L 151 del
  7.6.2019 — [eur-lex.europa.eu, CELEX 32019L0882](https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX%3A32019L0882)
- **Direttiva (UE) 2016/2102** (accessibilita' siti web e app del settore
  pubblico) — [CELEX 32016L2102](https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX%3A32016L2102)
- **Direttiva 2014/24/UE**, art. 42 (specifiche tecniche e accessibilita' negli
  appalti) — [CELEX 32014L0024](https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX%3A32014L0024)
- **Decisione di esecuzione (UE) 2018/2048** e **(UE) 2021/1339** (norma
  armonizzata EN 301 549) — EUR-Lex
- **D.Lgs. 27 maggio 2022, n. 82** (recepimento EAA), GU Serie Generale n. 134
  del 10 giugno 2022 — [normattiva.it](https://www.normattiva.it/)
- **Legge 9 gennaio 2004, n. 4** ("Stanca"), testo vigente — normattiva.it
- **D.Lgs. 10 agosto 2018, n. 106** (recepimento dir. 2016/2102) — normattiva.it
- **Raccomandazione 2003/361/CE** (definizione di microimpresa) — EUR-Lex
- **COM(2021) 101 final** — Strategia UE per i diritti delle persone con
  disabilita' 2021-2030 (dato: ~87 milioni di persone)
- **AgID — accessibilita'**: [agid.gov.it/it/design-servizi/accessibilita](https://www.agid.gov.it/it/design-servizi/accessibilita)

**Norme tecniche:**

- **EN 301 549 V3.2.1 (2021-03)** —
  [etsi.org (PDF)](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf)
- **WCAG 2.1** — [w3.org/TR/WCAG21](https://www.w3.org/TR/WCAG21/) ·
  **WCAG 2.2** — [w3.org/TR/WCAG22](https://www.w3.org/TR/WCAG22/)
- 1.4.2 Audio Control — [w3.org/WAI/WCAG21/Understanding/audio-control](https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html)
- 1.4.4 Resize Text — [w3.org/WAI/WCAG21/Understanding/resize-text](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html)
- 2.2.2 Pause, Stop, Hide — [w3.org/WAI/WCAG21/Understanding/pause-stop-hide](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html)
- 2.3.3 Animation from Interactions — [w3.org/WAI/WCAG21/Understanding/animation-from-interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- **CSS Media Queries Level 5**, `prefers-reduced-motion` —
  [w3.org/TR/mediaqueries-5](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion)
- MDN — [developer.mozilla.org/.../prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

**Strumenti e rilevazioni:**

- axe-core — [github.com/dequelabs/axe-core](https://github.com/dequelabs/axe-core)
- Accessibility Insights for Web — [accessibilityinsights.io](https://accessibilityinsights.io/)
- WAVE — [wave.webaim.org](https://wave.webaim.org/)
- WebAIM Million — [webaim.org/projects/million](https://webaim.org/projects/million/)
- Overlay Fact Sheet — [overlayfactsheet.com](https://overlayfactsheet.com/)
- Awwwards, criteri di valutazione — [awwwards.com/about-evaluation](https://www.awwwards.com/about-evaluation/)

**Fonti interne (misurate da noi, con il dettaglio nelle schede):**

`_PREMI.md` (31 SOTD + 26 Developer Award analizzati) · `_CANVAS-E-GOOGLE.md` ·
`_SUONO.md` · `_PRESTAZIONI.md` · `frans-hals.md` · `star-atlas.md` ·
`dark-netflix.md` · `prometheus-fuels.md` · `simply-chocolate.md` ·
`apple-prodotto.md` · `active-theory.md` · `trionn.md` · `revelatio.md` ·
`vero.md` · `darkroom.md` · `locomotive.md` · `2xa.md` · `lusion.md` ·
`igloo.md` · `immersive-garden.md` · `zajno.md` · `opal-tadpole.md` ·
`cuberto.md` · `dont-board-me.md`

---

## NON VERIFICATO / DA CHIUDERE

1. **Le sanzioni italiane.** Importo, articolo esatto del D.Lgs. 82/2022 e
   ripartizione delle autorita' competenti: **da leggere su Normattiva**. E' il
   punto piu' importante commercialmente e il piu' rischioso da citare a memoria.
2. **La versione di EN 301 549 citata in GUUE per l'EAA** (V3.2.1 o una V4.x
   piu' recente).
3. **La scadenza annuale della dichiarazione di accessibilita'** e gli estremi
   della determinazione AgID vigente.
4. **Il contrasto reale dei 34 siti analizzati**: mai misurato con uno
   strumento. E' l'unica sezione di questo documento senza numeri nostri.
5. **Le percentuali di copertura degli strumenti automatici** (30% / 57%) e
   **l'edizione corrente del WebAIM Million**.
6. **Il caso FTC / accessiBe** (data e importo).
7. **Il `<meta viewport>` non e' stato letto su tutti i 34 siti**: i 5 casi di
   `user-scalable=no` sono un minimo certo, non un totale.
8. **Nessun dato percentuale su quanti utenti abbiano `prefers-reduced-motion`
   attivo.** Non lo inventiamo: se serve, si misura sui nostri stessi siti con
   una riga di analytics.


