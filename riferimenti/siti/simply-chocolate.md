# Simply Chocolate

- **URL**: `https://simplychocolate.dk` — **attenzione: il sito premiato NON
  esiste piu'**. Oggi lo stesso dominio (redirect 301 su `www.simplychocolate.dk`)
  serve un negozio **Shopify** in danese, completamente diverso. Il sito del 2017
  e' leggibile solo su Internet Archive.
  - Versione premiata, letta da:
    `https://web.archive.org/web/20171006110810/https://simplychocolate.dk/`
    (6 ottobre 2017, il giorno dopo il premio) e
    `https://web.archive.org/web/20180901055013/https://simplychocolate.dk/`
    (1 settembre 2018, da cui ho scaricato i bundle JS/CSS del tema).
  - Dominio gemello attivo: `https://www.simplychocolatecph.com` (stesso negozio
    Shopify, versione internazionale).
- **Premio**:
  - **Awwwards Site of the Day 5/10/2017** — voto 7.61/10 (design 7.94, usabilita'
    7.29, creativita' 7.55, contenuto 7.36, **sviluppo 6.75**).
    Fonte: https://www.awwwards.com/sites/simply-chocolate
  - **Awwwards Site of the Year 2017 nella categoria E-Commerce**. Lo dichiara lo
    studio: https://springsummer.dk/simply-chocolate ("Awwwards: Site of the Year
    (E-Commerce), Site of the Day"). Non e' il "Site of the Year" assoluto:
    `non verificato` che abbia vinto il premio generale.
  - **CSS Design Awards**: WOTD 4/10/2017, voto giudici 7.69/10 (UI 7.86, UX 7.51,
    Innovazione 7.71), **Food Site of the Year**, finalista Website of the Year.
    Fonti: https://www.cssdesignawards.com/sites/simply-chocolate/31506/ e
    https://www.cssdesignawards.com/woty2017/sites/simply-chocolate
  - Inoltre (dichiarati dallo studio, non verificati da me): **FWA Site of the Day**,
    **Creative Circle 3x Gold**.
- **Studio**: **Spring/Summer**, Copenhagen (`springsummer.dk`). Su Awwwards
  compare come "Spring/Summer INT". Servizi dichiarati: strategia, concept, UX,
  visual design, art direction, sviluppo su WordPress.
  - **Nota**: Hello Monday viene spesso associato a questo progetto nelle ricerche.
    E' un errore: Hello Monday vinse il Site of the Month di ottobre 2017 con
    *In My World*, un altro sito. Simply Chocolate e' di Spring/Summer.
- **Anno**: 2017. La messa online e' recentissima rispetto al premio: al
  **12 agosto 2017** il dominio serviva ancora il **vecchio sito, con uno slideshow
  in Flash** (`swfobject.embedSWF("/files/design/flash/slideshow.swf", ...)`,
  verificato nello snapshot `20170812191241`). Il nuovo sito e' quindi di
  settembre 2017 e ha vinto entro un mese.
- **Letto il**: 13/08/2026
- **Come l'ho letto**: solo `curl` e WebFetch. Nessuna scheda di browser aperta.
  HTML archiviati + `app.bundle.js` (197.975 byte), `vendor.bundle.js` (680.117
  byte), `app.bundle.css` (78.802 byte), `font.bundle.css` (1.120 byte) scaricati
  dall'archivio e letti a mano. In piu' ho estratto i fotogrammi dai due video di
  anteprima di Awwwards con `ffmpeg` per vedere il movimento
  (`assets.awwwards.com/awards/external/2017/10/59d4f5e540c00.mp4` e
  `...59d4f5e99fce6.mp4`).

---

## Cosa vende

Tredici barrette di cioccolato danesi da 40 g, vendute a scatola. Non vende
"cioccolato": vende **tredici personaggi con un nome proprio** — Salty Fred,
Black Betty, Fresh Freddie, Persian Perry, Dark Marci, Grainy Sue, Grainy Gus,
Grainy Billy, Crunchy Coco, Dark Coco, Speedy Tom, Fit Fiona, Rich Arnold.
Prezzo unitario 3,06 $ (3,70 $ per le tre proteiche); nel filmato di Awwwards il
prezzo mostrato e' `2,55 €` — c'e' un cambio valuta (plugin Aelia Currency
Switcher, verificato nell'HTML). Ordine minimo dichiarato dallo studio:
**20 barrette**.

## A chi

A chi compra cioccolato come regalo o come coccola, non come materia prima: il
compratore danese/nordeuropeo che riconosce il marchio dal chiosco e vuole la
scatola da ufficio o da regalo. Piu' il compratore B2B (la voce di menu
`Catalogue` e i contatti `sales@` / `ct@` nel piede sono li' per lui).

Deve uscire pensando: *questa non e' una barretta industriale, e' un oggetto di
design; e questi tredici hanno una faccia, io ho un preferito*. L'obiettivo
emotivo e' la **preferenza personale** dentro un catalogo piatto: tutte costano
uguale, quindi la scelta e' solo di carattere.

## Idea regista

**Lo schermo e' il tavolo di marmo e tu ci scarti sopra una barretta**: mezzo
schermo e' il colore dell'incarto, mezzo e' il piano bianco con gli ingredienti
sparsi, e la barretta sta esattamente sulla cucitura fra i due.

## Il momento

**Lo scarto della barretta**, che cade fra il primo e il secondo schermo di
scroll dentro una scheda prodotto.

Sequenza esatta (letta fotogramma per fotogramma dal video `59d4f5e540c00.mp4`):
la fascia di colore in alto si ritira verso l'alto, l'incarto si apre e vola via
verso destra, e mentre esce **compare dietro il nome del prodotto in caratteri
giganti nel colore dell'incarto** (`SALTY FRED` su due righe, alte quasi mezzo
schermo). Resta la barretta nuda di cioccolato, appoggiata sul bianco fra le
mandorle e le scaglie.

C'e' un secondo momento, piu' piccolo ma piu' furbo: sull'incarto c'e' un
**cerchio bianco con una freccia in giu'** (raggio 29 px, contorno 2 px,
riquadro 66x66 px — valori letti nel codice). Non e' decorazione: e' un punto
trascinabile (`DraggablePoint`, con eventi `move` / `success` / `failure`). Il
gesto di scartare lo puoi **fare tu con il mouse**, non solo subirlo con lo
scroll. Il fallimento e' previsto e gestito: se molli troppo presto, l'incarto
torna indietro con una molla.

## Struttura, sezione per sezione

Il sito non e' una pagina che scorre: e' un **carosello verticale a passi**
(`stepSpring`, `goNext` / `goPrev`), con `document.body` in classe `blockScroll`.
Lo scroll nativo e' spento e la rotellina viene intercettata. Quindi "schermate
di scroll" qui vuol dire **passi**, non pixel.

| sezione | cosa mostra | cosa fa l'utente | quanto dura |
|---|---|---|---|
| Onboarding (intro) | Titolo in 4 righe `WE MAKE / ALL NATURAL / CHOCOLATE / BARS.` su fondo panna, sotto la fascia colorata con la prima barretta che spunta; link `READ ABOUT COPENHAGEN CHOCOLATE FACTORY`; etichetta `Scroll to shop` ruotata a 90 gradi in basso a sinistra | rotella / freccia / clic su `Scroll to shop` | 1 passo |
| Shop (13 passi) | Una barretta per schermata. In alto a sinistra la descrizione (`DARK CHOCOLATE 60% WITH SALTED ALMONDS`), il prezzo, il pulsante `ADD TO BOX`. Al centro l'incarto sulla cucitura. In basso gli ingredienti veri sparsi (mandorle, scaglie, cocco, menta) | rotella, frecce, swipe verticale, `NEXT` / `PREV` ruotati in basso a destra | 13 passi, 1 per prodotto |
| Scheda prodotto (per barretta) | Dopo lo scarto: nome gigante, due paragrafi con titolo (`SALTY FRED. RAISE THE BAR.` / `SWEET & SALTY = YIN AND YANG.`), tabella nutrizionale a due colonne, barretta nuda | continua a scorrere | ~2 passi |
| Chiusura scheda | `BITE INTO IT` + prezzo + `ADD TO BOX`, che si trasforma in contatore `- 1 +` | clic | 1 passo |
| Carrello (`Your box`) | Pannello laterale: righe prodotto con quantita', `Total`, `Free delivery in Denmark.`, icone carte di credito, `Buy now`, `Continue shopping`, `Close` | clic | sovrapposizione |
| Piede | Newsletter (`Sign up to our newsletter`), feed Instagram, contatti, social | — | 1 blocco |
| Pagine WordPress classiche | `About`, `Stores`, `Catalogue`, carrello e checkout WooCommerce | navigazione normale | pagine a se' |

Il piede e il carrello **non sono nel carosello**: sono spinti da molle separate
(`handleFooterSpringUpdate`, `handleGradientSpringUpdate`).

## L'esperienza in ordine di tempo

**Primi dieci secondi (desktop, versione ottobre 2017)**

- **0 s** — Fondo panna `#f8f8f4`. In alto a sinistra il logotipo `Simply
  Chocolate` in grazie, **ruotato di -90 gradi**, che si legge dal basso verso
  l'alto. In alto a destra le voci `SHOP · ABOUT · STORES · CATALOGUE · YOUR BOX`,
  **ciascuna ruotata di -90 gradi**, in fila come cinque bandierine verticali;
  accanto un cerchio nero con dentro il numero di barrette nella scatola.
- **0,3-1,5 s** — Entra il titolo `WE MAKE ALL NATURAL CHOCOLATE BARS.` in un
  grottesco condensato nero, tutto maiuscolo, quattro righe, interlinea 1em (le
  righe si toccano). Sotto, staccato di 32 px, il link
  `READ ABOUT COPENHAGEN CHOCOLATE FACTORY` sottolineato, corpo 16 px.
- **1,5-3 s** — Dal basso sale la fascia di colore del primo prodotto e con lei
  la punta dell'incarto. Il pannello panna che copre lo schermo e' un `div` che
  si ritira (`header__inner__overlay`, `bottom: -42.85%`, origine `center top`):
  la fascia colorata non entra, **e' il bianco che se ne va**.
- **3 s** — In basso a sinistra compare `Scroll to shop`, ruotato di -90 gradi,
  con un filo bianco sotto. Il suo `translate` e' calcolato sul progresso
  (`scale(t, .5, 1, 10, 0)`): **finche' non sei oltre la meta' del passo non e'
  cliccabile** (`pointer-events` passa a `auto` solo sopra 0,75).
- **poi** — La barretta respira: sotto c'e' un `Container` PixiJS con ombre
  separate (`shadow_main`, `shadow_middle`, `shadow_side`) e un effetto `smoke`
  guidato da una molla morbidissima (attrito 15, tensione 5): si muove piano e
  non si ferma mai del tutto.

**Il resto, a blocchi**

1. **Un colpo di rotella = un prodotto.** Il fondo pagina **interpola il colore**
   fra la barretta che esce e quella che entra (`MathUtil.interpolateColor`).
   Non e' un taglio: e' una tinta che scivola dal blu al verde al dorato.
2. Dentro una barretta, continuando a scorrere, si entra nella scheda: incarto
   via, nome gigante, testi, valori nutrizionali.
3. In fondo alla scheda `BITE INTO IT`. Il pulsante `ADD TO BOX` al clic non
   cambia pagina: l'etichetta scorre via verso l'alto (`translateY(-100%)`,
   0,333 s, `cubic-bezier(.645,.045,.355,1)`, ritardo 0,166 s) e sotto compare il
   contatore `- n +`. Il pulsante **diventa** il selettore di quantita'.
4. Il carrello (`Your box`) scivola dentro come pannello; il resto resta dov'e'.
5. Dal carrello in poi si esce dall'esperienza ed entra WooCommerce standard,
   vestito con lo stesso carattere ma con impaginazione da modulo.

## Animazioni

Tutto quello che conta e' mosso da **molle fisiche (rebound: `SpringSystem` /
`SpringConfig`)**, non da curve a durata fissa. Le curve CSS restano solo per le
micro-transizioni di interfaccia.

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| Carosello dei 13 prodotti | posizione verticale del passo | rotella / frecce / swipe / `NEXT`-`PREV` | molla (`stepSpring`, con `endstateupdate`) | i gesti sono a **soglia**, non continui: `swipe` e' in `throttle` a 300 ms, `scrollTo` a 900 ms |
| Colore del fondo pagina | `document.body.style.backgroundColor` | progresso del passo | interpolazione lineare fra i due colori prodotto | `interpolateColor` di PixiJS |
| Fascia colorata / gradiente | scala verticale (`Point(1,0)` -> 1) e opacita' | stesso progresso | molla | e' un `Sprite` PixiJS con un filtro applicato |
| Fumo / vapore dietro la barretta | deformazione continua | tempo (mai a riposo) | **molla attrito 15 / tensione 5** — lentissima | `smokeSpring` |
| Riquadro dell'etichetta prodotto | scala | ingresso del passo | **molla attrito 18 / tensione 100** — secca | `squareSpring` |
| Punto trascinabile (cerchio con freccia) | posizione | trascinamento del mouse / dito | **molla attrito 5 / tensione 40** — molto elastica | ritorna indietro da solo se il gesto fallisce |
| Cerchio del punto trascinabile | `transform` | passaggio del mouse | `.75s cubic-bezier(.19,1,.22,1)` | il contorno passa da 2 a 3 px in `.4s cubic-bezier(.165,.84,.44,1)` |
| Scarto dell'incarto | l'incarto esce di scena e appare la barretta nuda | progresso dello scroll dentro la scheda **oppure** trascinamento | molla | gli spritesheet si chiamano `bars.json` (incarto intero e corto) e `cracks.json` (la rottura) |
| Nome gigante del prodotto | entra da dietro l'incarto | stesso progresso | molla + `stagger` | il modulo di movimento ha `fromSpring(...).stagger(...)` con ritardo calcolato `max(0, 100 - 50 * (n - i - 1))` ms |
| Ingredienti sparsi sul bianco | scivolano e ruotano | progresso | molla | sono sprite veri, non un'immagine unica: atlanti `ingredients-0.json` / `ingredients-1.json` |
| Pulsante `ADD TO BOX` -> contatore | l'etichetta scorre in alto | clic | `.333s cubic-bezier(.645,.045,.355,1)`, ritardo `.166s` | i quattro bordi del pulsante sono quattro `div` colorati a mano, per poterli tingere del colore del prodotto |
| Hamburger (sotto 1024 px) | 5 linee SVG con `stroke-dasharray` | apertura menu | 2 tempi: `.6s` sul colore, `.4s` sul disegno, ritardi scalati 0 / 50 / 100 / 500 / 550 ms | le tre linee si cancellano e le due della X si disegnano |
| Voci del menu mobile | entrata | apertura menu | ritardi 0,20 / 0,25 / 0,30 ... 0,65 s | scala classica, ma su 10 voci |
| Voce di menu attiva | pallino di 6 px a destra | stato della rotta | opacita' | il sottolineato e' uno pseudo-elemento alto 2 px |
| Sottolineato del piede / newsletter | colore del bordo | esito dell'invio | `.6s cubic-bezier(.165,.84,.44,1)` | in errore diventa `#ff6d34` |

**Libreria dietro gli effetti**: PixiJS 4.6.2 in WebGL per tutto cio' che e'
barretta, ingredienti, ombre, fumo, gradiente. React 15.6.2 per l'interfaccia in
DOM (testi, pulsanti, menu, carrello). Rebound per le molle. **I gesti sono
scritti a mano**, non con Hammer.js: nel bundle ci sono le costanti
`DIRECTION_UP/DOWN/LEFT/RIGHT`, `AXIS_VERTICAL/HORIZONTAL`, e gli eventi
`panstart` / `panmove` / `panrelease` / `press` / `pressup` / `swipe`, ma nessuna
traccia di Hammer (verificato: 0 occorrenze di `Hammer`, `TOUCH_ACTION`,
`Recognizer` nei due bundle).

## Colori

Il sito ha **due colori fissi e tredici colori variabili**. La tinta non e' una
scelta di pagina: e' un dato del prodotto, salvato nel CMS.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| Fondo | `#f8f8f4` | fondo di tutto il sito (token `colors.backgroundColor` nel bundle) e del pannello che si ritira |
| Testo | `#000` | titoli, corpo, pulsanti |
| Inverso | `#fff` | testo sopra la fascia colorata, piede |
| Piede | `#000` fondo / `#fff` testo | blocco finale |
| Bordi e righe | `#c6c6c3` | sottolineature dei campi del checkout |
| Superfici grigie | `#ebebe8`, `#e8e8e8`, `#f5f5f5` | tabelle, separatori |
| Errore | `#ff6d34` (piede) / `#ff480e` | newsletter e moduli |
| Verde scuro | `#203e17` | messaggi WooCommerce |
| Rosa | `#ffc3cd` | titolo della pagina di conferma ordine |
| Blu dell'onboarding (2018) | `#131da3` | fondo dell'intro nella versione del 2018 (nel 2017 era gestito diversamente) |

**I tredici colori dei prodotti** (letti nel payload `window.__data`, campo
`color` = colore della fascia e del nome gigante, `text_color` = colore
secondario del testo):

| barretta | `color` | `text_color` |
|---|---|---|
| Black Betty | `#848484` | `#333335` |
| Salty Fred | `#2f93ff` | `#0046c9` |
| Fresh Freddie | `#00936a` | `#6ee8bd` |
| Crunchy Coco | `#c6a35b` | `#f2d395` |
| Dark Coco | `#d35abe` | `#772481` |
| Persian Perry | `#d5d4cf` | `#c0bcb4` |
| Dark Marci | `#db4f70` | `#fab8b1` |
| Grainy Gus | `#93dbe8` | `#81cbd4` |
| Grainy Sue | `#d67a10` | `#f9cb6a` |
| Grainy Billy | `#ff7087` | `#cf364d` |
| Speedy Tom | `#515a62` | `#9bdec9` |
| Fit Fiona | `#515a62` | `#fcb6f0` |
| Rich Arnold | `#515a62` | `#eed153` |

Awwwards riporta come palette dominante `#49c5b6`, `#FF9398`, `#ffffff`: sono
tinte campionate da uno screenshot, **non** i valori del CSS. I valori qui sopra
sono presi dal codice.

Nel fotogramma reale la fascia di Salty Fred e' un **gradiente** che va dal blu
profondo (vicino a `#131da3`) al blu del prodotto: la sfumatura e' generata da
`palette.png` con un filtro PixiJS. `non verificato` l'estremo esatto del
gradiente, perche' `palette.png` non e' stato archiviato.

## Tipografia

Due caratteri, uno per titolare e uno per leggere. Nient'altro.

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| Nome gigante del prodotto | `social-gothic` | 600 | fluido (nel filmato ~200 px) | `.92em` | maiuscolo; su schermi stretti sborda a sinistra di `-46px`, cioe' **esce dallo schermo di proposito** |
| Titolo intro `h1` | `social-gothic` | 600 | non fissato nel CSS di modulo (`.module--title h1` = 35 px) | `1em` | maiuscolo, margine inferiore 32 px |
| Sottotitolo `h2` | `social-gothic` | 600 | 20 px, **30 px sopra 1024 px** | `1.17em` | maiuscolo, spaziatura `.005em` |
| Prezzo, pulsanti, menu, `h3` | `social-gothic` | 600 | 16 px | `1em` / `16px` | maiuscolo, spaziatura `.01em` |
| `NEXT` / `PREV` / `Scroll to shop` | `social-gothic` | 600 | `1.2em` | `1.6em` | maiuscolo, ruotati di -90 gradi |
| Corpo | `Libre Baskerville`, serif | 400 | **12 px sotto 720 px, 13 px fino a 1024 px, 16 px oltre** | `2em` (piede `1.5em`) | spaziatura `.01em`, `-webkit-font-smoothing: antialiased` |
| Tabella nutrizionale | `Libre Baskerville` | 400 | 14 px | `1.5625em` | valori allineati a destra, `white-space: nowrap` |
| Piede | `Libre Baskerville` | 400 | 12 px | `1.5em` | su nero |
| Avviso cookie | `social-gothic` | 600 | 13 px | — | maiuscolo |

**Come sono serviti**:
- `social-gothic` e' **auto-ospitato**, un solo file per tre formati
  (`woff2` + `woff` + `ttf`, nomi con hash: `1dba0a33505dcc...woff2`), **un solo
  peso: 600**. Non e' variabile. Nessun `font-display`.
- `Libre Baskerville` arriva da **Google Fonts** via
  `fonts.googleapis.com/css?family=Libre+Baskerville:400,700` — quindi un dominio
  esterno che blocca il rendering.
- Il logotipo `Simply Chocolate` **non e' testo**: e' un SVG (grazie, alta
  contrasto, tipo Didone), ruotato in CSS di -90 gradi con
  `transform-origin: right top`.

**Griglia**: 6 colonne, larghezza massima 1440 px, con token dichiarati nel
bundle (`app.bundle.js`, modulo 73):

```
breakpoints:   xs 0px · sm 720px · md 1024px · lg 1440px
grid-columns:  6
max-width:     1440px
gutters:       xs 14px · sm 43px · md 98px
outer-margins: xs 46px · sm 60px · md 100px
padding-top:   xs 24px · sm 30px · md 45px
```

I margini esterni sono anche la posizione del logo e del menu (23/24 px, 30 px,
50/45 px): **il perimetro dello schermo e' la griglia**.

## Testi veri

**Intro (ottobre 2017, dal payload `onboarding`)**
```
We make
all natural
chocolate
bars.
```
```
Read about Copenhagen Chocolate factory
```

**Intro (settembre 2018, cambiata)**
```
ALL NATURAL
CHOCOLATE
BARS
```
```
FIND YOUR ALL OUR NATURAL CHOCOLATE HERE
```
(sic — l'errore di battitura e' nel dato reale: `"cta":{"title":"FIND YOUR ALL
OUR NATURAL CHOCOLATE HERE"}`)

**Menu**: `Shop` · `About` · `Stores` · `Catalogue` · `Your box`
(nel 2018 si aggiungono `News`, `Travel Retail`, `Cocoa Horizons`)

**Chiamate all'azione e microtesti** (tutti estratti dal bundle):
```
Scroll to shop
Add to box
Bite into it
Buy now
Continue shopping
Sold out
Your box
Total
Free delivery in Denmark.
Next   Prev   Swipe   Close   Say hi
Nutritional content / 100g
Energy · Fat / of which saturated fat · Carbohydrates / of which sugar
Fibers · Protein · Salt
Ingredients
Terms and Conditions   Cookie Policy   Accept
Use of this site:   We use    You're
```

**Descrizione prodotto (Salty Fred, testuale)**
```
DARK CHOCOLATE 60% WITH SALTED ALMONDS
2,55 €
ADD TO BOX

Salty Fred. Raise the bar.
Your taste buds will be thanking you the second the dark chocolate hits your
tongue. And when the salted almonds set in - they will simply never be the same
again.

Sweet & Salty = Yin and Yang.
Dark chocolate 60% with salted almonds, known for their superb quality. The
salty hint and the fruity chocolate truly make this the best of both worlds.
Hmmmm.

40 g. of dark chocolate 60% with salted almonds
Energy 2330 kJ / 557 kcal · Fibre 9.2 g · Fat / of which saturated fat 40 g / 22 g
Protein 7.2 g · Carbohydrates / of which sugar 39 g / 34 g · Salt 0.24 g
```

**Altri titoli di prodotto, per capire il tono di voce**
```
Black Betty. AKA "El original"          -> "Chocolate Terapia"
Fresh Freddie. Fresher than the rest.   -> "Keep it fresh."
Crunchy Coco. What trouble?             -> "Keep it milky."
Dark Coco. Double Trouble.              -> "A premium lady in purple"
Persian Perry. A world champion.        -> "Go for liquorice."
Dark Marci. An oldie but definitely a Goldie.  -> "Opposites Attract."
Grainy Gus. Because yes - morning chocolate is a thing.  -> "The good life"
Grainy Sue. Ohh my goodness             -> "Think number 1"
Grainy Billy. Hello Paradise            -> "A twisted Classic"
Speedy Tom. Keep going.                 -> "Wind tunnel flavour."
Fit Fiona. Can you outrun yourself?     -> "Everyone's favourite pick me up."
Rich Arnold. Need a personal trainer?   -> "The 100% natural post workout."
```

**Piede**
```
Sign up to our newsletter
Receive invitations to stock sales, contests, news and job postings.
Type in your email
Thank you for subscribing!

Social medias:  Facebook   Instagram

Contact
Simply Chocolate
Amager Landevej 123
2770 Kastrup
CVR: 32761844
+45 3313 5622
Monday - Thursday: 8 - 16
Friday: 8 - 15
Saturday - Sunday: closed

Inquiries within Denmark: sales@simplychocolate.dk  +45 2752 2079
International inquiries: ct@simplychocolate.dk
Press inquiries: marketing@simplychocolate.dk
Complaints: reklamation@simplychocolate.dk
```

**Meta descrizione** (Yoast, verbatim)
```
Simply Chocolate is truly simple. Simply Chocolate produce handmade chocolate
bars with natural ingredients. Try our Salty Fred, Dark Marci or Grainy Sue.
Simply Chocolate is a danish factory based in Copenhagen. Up here it's too cold
to grow cocoa beans, but it's hot enough to have a love affair with great
chocolate.
```

## Mobile

**Non ho potuto aprire il sito su un telefono** (non esiste piu' e nell'archivio
il WebGL non gira). Quello che segue e' dedotto **dal codice**, non osservato:
CSS mobile-first (i `@media` sono quasi tutti `min-width`) e un solo ramo
JavaScript su `window.innerWidth`.

**Cosa SPARISCE**
- Il menu orizzontale con le cinque voci ruotate: sotto **1024 px** il componente
  non viene proprio montato (`t.innerWidth >= 1024 ? <menu orizzontale> : null`).
- Il passaggio del mouse: tutti gli stati `:hover` (il contorno del cerchio che
  si ingrossa, la barretta che va in `focus()` / `release()` sotto il puntatore)
  sono morti.
- Il grande respiro dei margini: 100 px di margine esterno diventano 46 px,
  45 px di margine alto diventano 24 px.

**Cosa viene SOSTITUITO**
- Il menu diventa **hamburger + pannello a tutto schermo** (`menu--dark`,
  sovrapposizione `#f8f8f4` opaca, voci a scalare con ritardi 0,20 -> 0,65 s).
  L'icona e' fatta di 5 linee SVG: 3 si cancellano, 2 si disegnano a X.
- Il gesto: rotella e frecce diventano **swipe verticale**
  (`new Swipe(window, {axis: AXIS_VERTICAL})`) e trascinamento
  (`panstart`/`panmove`/`panrelease`).
- Il corpo del testo scende da 16 px a **13 px** (sotto 1024 px) e a **12 px**
  (sotto 720 px). L'`h2` scende da 30 px a 20 px.
- Il nome gigante del prodotto **esce dallo schermo a sinistra**
  (`margin-left: -46px` sotto 720 px, `-60px` fino a 1024 px, `0` oltre). Non e'
  un ripiego: e' la stessa idea grafica riscritta per uno schermo stretto.

**Cosa RESTA**
- Il carosello a passi, il WebGL, lo scarto della barretta, il fumo, il colore
  del fondo che interpola: **non c'e' nessun ramo che disattiva PixiJS sotto una
  certa larghezza**. Il telefono del 2017 si prendeva tutto.
- Il logo ruotato in alto a sinistra e il blocco `NEXT`/`PREV` ruotato in basso a
  destra.
- L'intera esperienza. **Non e' un altro sito sul telefono, e' lo stesso sito piu'
  stretto.** Questa e' l'eccezione, non la regola, fra i siti premiati.

**Il prezzo pagato**: `<meta name="viewport" content="width=device-width,
initial-scale=1, maximum-scale=1, user-scalable=no">`. Lo **zoom con le dita e'
disabilitato**. Nel 2017 era prassi, oggi e' una violazione WCAG 1.4.4 e iOS lo
ignora comunque.

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| CMS | **WordPress 4.8.2** (2017) / 4.x + Yoast SEO 7.5.1 (2018) | **VERIFICATO** | `<meta name="generator" content="WordPress 4.8.2">` nell'HTML archiviato |
| E-commerce | **WooCommerce 3.1.2** (2017) / 3.4.0 (2018) | **VERIFICATO** | `<meta name="generator" content="WooCommerce 3.1.2">`, script `add-to-cart.min.js`, `cart-fragments.min.js` |
| Tema | tema su misura `simply-chocolate`, bundle webpack (`vendor.bundle.js` + `app.bundle.js` + `app.bundle.css`) | **VERIFICATO** | percorsi `/wp-content/themes/simply-chocolate/static/...?ver=1.0.8` |
| Interfaccia | **React 15.6.2** con **CSS Modules** | **VERIFICATO** | stringa `"15.6.2"` nel vendor, `"react.element"`, `componentWillReceiveProps`; classi con hash tipo `menu__menu__item___3PyBB` |
| Stato | **Redux** (`connect`, azioni `ACTION_ADD_TO_CART`, `ACTION_OPEN_CART`, `ACTION_TOGGLE_MENU`, `ACTION_PAN_ACTIVE`...) | **VERIFICATO** | stringa `redux` nel vendor + le costanti nell'app |
| Rendering grafico | **PixiJS 4.6.2** in WebGL (filtri `Blur`, `Displacement`, `ColorMatrix`) | **VERIFICATO** | `VERSION="4.6.2"`, 55 occorrenze di `PIXI`, `new PIXI.Container`, `MathUtil.interpolateColor` |
| Animazione | **rebound** (molle fisiche) — `SpringSystem`, `SpringConfig`; default `{friction:10, tension:40}` | **VERIFICATO** | `new c.default.SpringSystem`, `i.createSpring(tension, friction)` |
| Gesti | **scritti a mano** (Pan / Swipe / Press con `AXIS_*` e `DIRECTION_*`) | **VERIFICATO** | eventi `panstart`/`panmove`/`panrelease` presenti, `Hammer` assente in entrambi i bundle |
| Scroll | **nessuna libreria di smooth scroll**: scroll nativo spento (`body.blockScroll`) + `mousewheel` + `keydown` + swipe, con `throttle` (900 ms su `scrollTo`, 300 ms su `swipe`) | **VERIFICATO** | `on(window,'mousewheel',...)`, classe `blockScroll` sul `<body>` |
| Utilita' | lodash (`throttle`, `debounce`) | **VERIFICATO** | `lodash` nel vendor, `(0,M.default)(e.swipe, 300, {leading:!0, trailing:!1})` |
| Sprite | atlanti JSON+PNG generati dal CMS: `bars.json`, `cracks.json`, `ingredients-0.json`, `ingredients-1.json`, `stickers.json`, `palette.png` | **VERIFICATO** (esistenza) | elencati in `window.__data.meta` |
| Immagini | PNG con maschere SVG; fotografia in bianco e nero **colorata dal CMS** | **SUPPOSTO** per la tecnica, dichiarato dallo studio | https://springsummer.dk/simply-chocolate ("greyscale photography cropped with SVG masks, colorization through the CMS") |
| Caratteri | `social-gothic` auto-ospitato (woff2/woff/ttf) + Libre Baskerville da Google Fonts | **VERIFICATO** | `font.bundle.css` e il `<link>` a `fonts.googleapis.com` |
| Valute | plugin **Aelia Currency Switcher 4.4.20** | **VERIFICATO** | `wc_aelia_currency_switcher_params` con `"current_exchange_rate_from_base":"0.160943"` |
| Cache | **W3 Total Cache** | **VERIFICATO** | commento finale `Served from: simplychocolate.dk @ 2018-09-01 07:50:13 by W3 Total Cache` |
| Sicurezza | **Wordfence** | **VERIFICATO** | script `wordfence_lh=1` |
| Analisi | Google Analytics classico (`analytics.js`, `UA-106556252-1`) + estensione e-commerce (`ec:addProduct`) | **VERIFICATO** | nel `<head>` |
| Newsletter | MailChimp (lista `f9a096e4a0`) | **VERIFICATO** | `window.__data.meta.footer.newsletter.mailchimp` |
| Hosting | Debian (dichiarato su Awwwards) | **SUPPOSTO** | scheda Awwwards, non confermato da intestazioni |
| jQuery | 1.12.4 + jquery-migrate 1.4.1 | **VERIFICATO** | caricati da WordPress, usati solo da WooCommerce |

## Peso e prestazioni

Numeri **reali ma parziali**: sono i byte **non compressi** dei file cosi' come
li ho scaricati dall'archivio.

| file | byte |
|---|---|
| `vendor.bundle.js` | 680.117 |
| `app.bundle.js` | 197.975 |
| `app.bundle.css` | 78.802 |
| `font.bundle.css` | 1.120 |
| HTML della home (ottobre 2017, con banner archivio) | 37.781 |
| HTML della home (settembre 2018, con banner archivio) | 48.321 |
| **totale JS del tema** | **878.092 (~858 KB)** |

A questi vanno aggiunti: jQuery 1.12.4, jquery-migrate, quattro script
WooCommerce, il CSS del cambiavalute, il CSS di Google Fonts, i due file del
carattere `social-gothic`, e soprattutto **gli atlanti di sprite** (barrette,
rotture, ingredienti, adesivi, palette) — che sono quasi certamente la parte piu'
pesante.

`non verificato` il peso degli atlanti: `bars.json`, `cracks.json`,
`ingredients-*.json`, `stickers.json` e `palette.png` **non sono stati archiviati**
(404 su tutti). Quindi **non conosco il peso totale della pagina**, ne' il numero
di richieste, ne' i tempi reali.

Indizi indiretti sul fatto che fosse pesante:
- Awwwards ha dato **6.75 in Development**, il voto piu' basso delle cinque voci
  e ben sotto il 7.94 di Design. Su Awwwards il voto di sviluppo scende quando il
  sito e' lento o scattoso.
- Un tema React 15 + PixiJS 4 dentro WordPress con Wordfence e W3 Total Cache non
  e' un impianto leggero.
- Il sito **non aveva `font-display`**, quindi il testo restava invisibile mentre
  arrivava Google Fonts.

Sul sito **di oggi** (misurato il 13/08/2026 con `curl`): HTML della home
**329.725 byte**, servito da Shopify dietro Cloudflare, `server-timing:
processing;dur=203, render;dur=82`. Nessun Lighthouse: non uso il browser.

## Tre cose da rubare

**1. Il colore e' un campo del prodotto, non una scelta di pagina.**
Nel payload ogni barretta porta con se' `color`, `text_color`, `chocolate`
(`dark`/`milk`/`white`), `type` (`squared`/`rounded`) e la lista degli
ingredienti. Il fondo pagina interpola fra il colore di quello che esce e quello
che entra. Risultato: **aggiungere il quattordicesimo prodotto non richiede una
riga di CSS**. Chi lo copia deve mettere il colore nel CMS e far interpolare al
codice, non scrivere tredici classi.

**2. Il pulsante che diventa il selettore di quantita'.**
`ADD TO BOX` non apre un pannello e non ricarica: l'etichetta scorre via verso
l'alto e sotto, nello stesso rettangolo, compare `- 1 +`. E' un solo elemento con
due stati (`box--controllable`), non due elementi. Meccanica esatta:
`overflow: hidden` sul contenitore, `translateY(-100%)` sull'etichetta in
`.333s cubic-bezier(.645,.045,.355,1)` con `transition-delay: .166s` in entrata e
`0s` in uscita — **l'asimmetria del ritardo e' quello che lo fa sembrare
meccanico**. I quattro bordi sono quattro `div` separati proprio per poterli
tingere del colore del prodotto.

**3. Il contenuto vero in HTML, cancellato dal JavaScript dopo il caricamento.**
Nella pagina c'e' un `<div id="seo-content">` con navigazione, `h1`, tutti e
tredici i prodotti con `h3`/`h4`/prezzo/link, e il piede completo — HTML piatto e
leggibile. Subito dopo il bundle:

```js
var seoContent = document.getElementById('seo-content');
if (seoContent && seoContent.parentNode) {
  seoContent.parentNode.removeChild(seoContent);
}
```

E' la risposta piu' economica al problema "esperienza WebGL contro
indicizzazione": **il crawler e il lettore di schermo vedono un catalogo vero, il
visitatore vede l'esperienza**. Costa zero rendering lato server e zero
idratazione. (Da rifare oggi meglio: lasciarlo nel DOM nascosto invece di
rimuoverlo, cosi' serve anche l'accessibilita' e non solo il posizionamento.)

**Bonus, gratis**: la *tipografia ruotata sul perimetro*. Logo, menu, `NEXT`/`PREV`
e `Scroll to shop` sono tutti `transform: rotate(-90deg)` con `transform-origin`
agli angoli. Costa nulla, libera tutto il centro dello schermo per il prodotto, e
nel 2026 e' ancora un segno riconoscibile.

## Non verificato

- **Il peso e il numero di richieste della pagina reale**: gli atlanti di sprite
  (`bars.json`, `cracks.json`, `ingredients-0/1.json`, `stickers.json`,
  `palette.png`) danno 404 sull'archivio. Senza quelli il totale non ha senso.
- **Tempi, Lighthouse, Core Web Vitals**: nessuna fonte d'epoca trovata, e non
  posso misurare un sito che non esiste piu'.
- **Il comportamento reale su telefono**: dedotto da CSS e JS, mai osservato.
  L'archivio non fa girare il WebGL.
- **Il "Site of the Year"**: lo studio dichiara "Site of the Year (E-Commerce)".
  Non ho trovato conferma diretta sulle pagine annuali di Awwwards
  (ricerche web esaurite durante il lavoro). Sul CSSDA risulta **finalista**
  Website of the Year e vincitore **Food Site of the Year**.
- **FWA SOTD e i tre Gold del Creative Circle**: solo dichiarazione dello studio.
- **L'estremo esatto del gradiente della fascia colorata**: `palette.png` non
  archiviato.
- **La transizione fra le pagine WordPress (`About`, `Stores`, `Catalogue`) e il
  carosello**: c'e' un `handleChangeHistory` e uno `_isTransitionContinuous`, ma
  non ho ricostruito cosa si vede.
- **Il video nell'intro**: nel CSS c'e'
  `.header__inner__overlay div video { position: absolute }`, quindi il pannello
  dell'intro poteva ospitare un filmato. Non risulta usato nei due snapshot letti.
- **Chi ha scritto il codice**: Spring/Summer dichiara strategia, UX, visual e
  art direction. Se lo sviluppo front-end sia interno o di terzi, `non verificato`.

---

# COSA E' INVECCHIATO E COSA NO

*Sezione extra, richiesta: il sito ha quasi nove anni. Il fatto piu' brutale e'
che **non esiste piu'**. Il dominio premiato oggi serve un negozio Shopify
standard: nessun `canvas`, nessun `PIXI`, nessun `WebGL`, nessun "Salty Fred" in
home. Il marchio si e' rinominato **Simply®**, ha aggiunto una linea proteica e
quattro lingue, e ha buttato l'esperienza. Il primo insegnamento e' questo:
un'esperienza su misura dentro il CMS e' un'opera d'arte con una data di
scadenza commerciale, e la scadenza arriva quando cambia il piano marketing, non
quando invecchia il design.*

## E' invecchiato — e si vede

**1. Lo stack, tutto.**
React 15.6.2 (2017) e' cinque versioni maggiori indietro; `componentWillMount` e
`componentWillReceiveProps`, che qui sono ovunque, sono **deprecati dal 2018**.
PixiJS 4.6.2 e' quattro versioni maggiori indietro (oggi v8, con WebGPU).
WordPress 4.8 + WooCommerce 3.1 + jQuery 1.12 sono un impianto che oggi
nessuno sceglierebbe per un catalogo di tredici prodotti. Il tema **non e'
ricostruibile**: e' un bundle webpack di un'epoca in cui non c'erano i moduli ES
nativi.

**2. Il peso, e come lo si paga.**
858 KB di JavaScript del solo tema, non compresso, **piu' jQuery, piu' quattro
script WooCommerce, piu' gli sprite**. Nel 2017 il 6.75 in sviluppo era una nota
a margine; oggi e' la differenza fra comparire e non comparire su Google. E il
carattere serve da `fonts.googleapis.com` **senza `font-display`**: testo
invisibile finche' non arriva.

**3. Lo scroll rapito.**
`document.body.classList.add('blockScroll')` piu' l'intercettazione di
`mousewheel` piu' un `throttle` a 900 ms: **un colpo di rotella = un prodotto, e
per un secchio di millisecondi non ne fai altri**. Nel 2017 era la firma di un
sito premiato. Oggi e' il difetto piu' citato nelle recensioni di UX: chi ha un
trackpad si trova con un gesto continuo mappato su un passo discreto, e chi ha
tredici prodotti da vedere fa tredici gesti obbligatori. Il modo moderno
(Lenis/GSAP + `ScrollTrigger`) fa la stessa coreografia **senza spegnere lo
scroll nativo**, e questa e' una differenza di sostanza, non di libreria.

**4. L'accessibilita'.**
- `user-scalable=no, maximum-scale=1`: zoom con le dita disabilitato. Oggi e' una
  violazione WCAG 1.4.4 conclamata.
- Nessuna traccia di `prefers-reduced-motion` nei due bundle. Il fumo si muove
  **sempre**, non si ferma mai (molla con attrito 15 e tensione 5, mai a riposo).
- Il trucco del `seo-content` **rimosso dal DOM**: il crawler lo vede, il lettore
  di schermo di un utente reale no, perche' viene cancellato all'avvio. Nel 2017
  si chiamava "SEO fallback". Oggi si chiama contenuto inaccessibile.
- Il gesto principale (trascinare il cerchio per scartare) non ha un equivalente
  da tastiera dichiarato: c'e' `handleKeyDown` sul carosello (frecce), ma non
  sullo scarto.

**5. Il carattere unico e statico.**
`social-gothic` con **un solo peso (600)** e nessuna variabilita'. Nel 2026 lo
stesso effetto lo si ottiene con un variabile e si guadagnano peso, gerarchia e
transizioni fra i pesi. Questa e' proprio l'era in cui i font variabili non
c'erano ancora.

**6. Le pagine di servizio.**
Carrello e checkout sono **WooCommerce nudo**, ridipinto con lo stesso carattere.
Si vede il salto: da un'esperienza a molle si passa a una tabella con `th`, e
il sito che hai appena ammirato smette di esistere. Questo tipo di frattura
(esperienza brillante -> checkout di serie) era normale nel 2017; oggi
l'aspettativa e' che il negozio sia coerente fino al pagamento.

## Regge ancora — e reggerebbe oggi

**1. L'idea regista. E' la parte piu' giovane di tutto il sito.**
Mezzo schermo colore dell'incarto, mezzo schermo tavolo bianco, la barretta sulla
cucitura, gli ingredienti veri sparsi sotto. Non e' una moda del 2017: e' una
composizione. Se prendi il fotogramma di *Salty Fred* e lo mostri oggi senza
data, nessuno lo colloca nel 2017.

**2. La fotografia e il sistema di produzione dietro.**
Lo studio ha fatto **due servizi fotografici** e ha costruito un sistema:
fotografia in bianco e nero, maschere SVG, colorazione dal CMS, sovrapposizione
degli ingredienti, ombre separate. Il risultato e' che **un prodotto nuovo entra
senza ridisegnare niente**. Questo tipo di investimento non invecchia: e' il
motivo per cui l'unica cosa che si e' salvata del progetto e' l'immagine di
marca. Il sito Shopify di oggi usa ancora **la stessa fotografia di prodotto e lo
stesso grottesco condensato**, che nel frattempo e' diventato un font di marca
vero e proprio (`font-family: 'Simply Chocolate Condensed'`, verificato
nell'HTML del 13/08/2026). **Il design e' sopravvissuto al sito.**

**3. Il colore come dato, non come stile.**
Tredici prodotti, tredici colori nel database, il fondo che interpola. Questa
architettura la scriveresti identica oggi, con i token CSS al posto
dell'interpolazione JavaScript. Regge perche' non e' un effetto: e' una decisione
di modellazione dei dati.

**4. Le molle fisiche al posto delle durate fisse.**
Rebound nel 2017, `spring` di Motion o `gsap.to(..., {ease: 'elastic'})` nel 2026:
la libreria e' cambiata, il principio no. Anzi, il resto del mondo ha raggiunto
questo sito solo dopo (`spring` e' arrivato in Framer Motion nel 2019, in CSS con
`linear()` nel 2023). I valori scelti qui sono ancora un buon punto di partenza:
**attrito 15 / tensione 5 per un movimento ambientale che non deve mai fermarsi,
attrito 18 / tensione 100 per un elemento che deve arrivare e stare fermo**.

**5. Il gesto che sostituisce lo scroll, non lo decora.**
Il cerchio con la freccia sull'incarto e' la cosa piu' moderna del sito: ti offre
di **fare** il gesto (scartare) invece di guardarlo. Ha successo, fallimento e
ritorno elastico. Nel 2026 lo stesso schema — un affordance visibile, un gesto
opzionale, un fallimento gestito — e' esattamente quello che si insegna. Va solo
raddoppiato con un equivalente da tastiera.

**6. La tipografia sul perimetro.**
Logo, menu, `NEXT`/`PREV`, `Scroll to shop`: tutti ruotati di -90 gradi sui bordi.
Costa quattro righe di CSS, libera il centro, e nel 2026 e' ancora un segno di
riconoscimento (lo si vede su meta' dei siti di studi premiati oggi).

**7. La scrittura.**
`Black Betty. AKA "El original"`, `Dark Marci. An oldie but definitely a Goldie.`,
`Rich Arnold. Need a personal trainer?`. Tredici barrette con tredici voci. Non ha
preso una ruga. Ed e' la parte che **non e' sopravvissuta** al passaggio a
Shopify: oggi in home i personaggi non ci sono piu', ci sono "Chokolade
Proteinbar - Simply® Rich Arnold" e "Gaveæske 500g". Il sito nuovo e' piu'
veloce, piu' manutenibile, piu' multilingua — e ha perso l'unica cosa che
rendeva quel cioccolato diverso dagli altri.

## La lezione, in una riga

**Invecchia l'impianto (stack, peso, scroll rapito, accessibilita'); non invecchia
la decisione** (colore come dato, gesto come contenuto, fotografia come sistema,
voce di marca). E il sito e' morto non perche' fosse vecchio, ma perche' era
*speciale*: nessuno dentro l'azienda poteva mantenerlo.
