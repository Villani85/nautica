# Zajno

- **URL**: https://zajno.com
- **Premio**: Awwwards **Site of the Day 24/07/2023**, punteggio **7.74/10**
  (https://www.awwwards.com/sites/zajno-digital-studio). Nei crediti Awwwards
  compare **Aristide Benoist** come collaboratore. Il profilo dello studio
  dichiara 5 SOTD e 35 Honorable Mention (https://www.awwwards.com/Zajno/); il
  sito stesso rivendica "Awwwards 62" nella sezione Stats.
- **Studio**: Zajno Digital Studio (si dichiara "los angeles, ca")
- **Anno**: impianto 2023 (il repository Prismic si chiama `zajno-website-2023`),
  contenuti aggiornati al 2026 (piede "©zajno 2026", "©2015-26")
- **Letto il**: 13/08/2026

> **Come l'ho letto.** Nessuna scheda di browser aperta, mai: solo `curl`,
> `WebFetch` e `WebSearch`, come da regola. Tutto quello che segue viene dal
> codice scaricato — HTML, i due CSS, i due JS, il JSON di contenuto, i PNG e il
> woff2 — non da una visita. **Non ho quindi mai visto il sito in movimento.**
> Le ampiezze reali degli effetti e la lunghezza in schermate delle sezioni sono
> marcate `non verificato` dove non ricavabili dal codice.

---

## Cosa vende

Servizi di uno studio digitale: web design, sviluppo, branding, motion graphics,
illustrazione 3D, sound design, Webflow. Il prodotto vero è la **prova di
capacità tecnica**: il sito è il portfolio, e il modo in cui è costruito è
l'argomento di vendita.

Il listino è dichiarato apertamente nel form di contatto — fasce da `Under $10k`
a `$100k +`.

## A chi

A un committente aziendale (marketplace, biotech, crypto, fintech, ed-tech: sono
i settori delle cinque case history in home) che deve uscire pensando *"questi
sanno fare cose che gli altri non sanno fare, e mi tolgono il lavoro di gestione
dalle mani"*.

Il testo lo dice in modo esplicito: *"we know your time is precious… freeing you
from the burden of micromanagement"*. Il posizionamento è contro il template:
*"today's reality that is oversaturated with templated solutions"*.

## Idea regista

**Il mondo è grigio finché non lo tocchi**: tutta la pagina nasce desaturata e
ferma, e solo l'elemento sotto il puntatore torna a colori e si liquefa.

Non è un'impressione: è scritto nel codice. Ogni piano WebGL parte con `bw = 1`
(grigio pieno) e `kin = 0` (nessuna distorsione); l'elemento in hover va a
`bw = 0` e `kin = 1`. Vedi *Animazioni*.

## Il momento

**I primi 1,2 secondi dopo il preloader**: la scritta gigante `ZAJNO®` alta 728 px
non è testo HTML e non è un'immagine — sono **sei texture MSDF** (una per
lettera) disegnate in WebGL, che entrano una dopo l'altra con 60 ms di scarto e
1600 ms di durata ciascuna.

Sorgente, dalla tabella dei tempi in `d.js`:

```js
hoMsdf: { delay: [1200, 60], d: 1600 }
```

Cade **a tempo, non a scroll**: parte 1200 ms dopo la fine del caricamento.

Il secondo momento è **legato al puntatore**: passando sopra un'immagine, quella
sola si ricolora (smorzamento 0,06 → circa mezzo secondo) mentre la velocità del
mouse la deforma con aberrazione cromatica sui tre canali. È l'effetto firma
dello studio, ed è anche il motivo per cui **sul telefono il sito è un altro
sito** (vedi *Mobile*).

---

## Struttura, sezione per sezione

Ordine reale del DOM della home (`cache["/"].html[0]`, 8.153 caratteri).
Le altezze sono quelle del CSS, convertite a 1920 px (`vw × 19,2`).

| sezione | cosa mostra | cosa fa l'utente | quanto dura |
|---|---|---|---|
| `#ho-he-ba` header | nav in alto (zajno®, digital studio, work/studio/contact, twitter/instagram, los angeles ca) + la scritta `ZAJNO®` in WebGL | legge, non clicca | **728 px** (`37.9167vw`) |
| `#ho-sh-ba` + `#ho-sh-fr` showreel | piano video a tutta larghezza; sopra, nel layer frontale, pallino play bianco da 100 px a 828 px da sinistra, "Watch Showreel" / "2015-26" | clicca per il video Vimeo 1080p | **902 px** (`46.9792vw`) |
| `#ho-wr` Work | titolo "Work" con freccia, paragrafo, "©2015-26"; poi 5 voci numerate 01-05 | passa sopra una voce → si ricolora e si deforma; clicca → progetto | lista rientrata di 316 px, miniature da 296 px |
| `#ho-st` Studio | titolo "Studio", paragrafo, due colonne: Services (8 voci) e Stats (5 voci) | legge | padding 100 px sopra e sotto |
| `#ho-wo` Playground Z15™ | titolo, paragrafo manifesto, carosello orizzontale di 6 lavori, logo `Z15` in SVG pieno `#ff3928` | **trascina in orizzontale** il carosello | 6 voci |
| `footer.f` | logo SVG, Work/Studio/Contact, "©zajno 2026", 5 social (Instagram, Twitter, LinkedIn, Clutch, Dribbble, Behance) | esce | padding 100 px |
| `#co` (sempre nel DOM) | **overlay** contatti a tutta pagina, form in 8 passi | si apre da `/contact` sopra la pagina corrente | fuori flusso |

**Quante schermate di scroll**: `non verificato`. La pagina non ha scroll nativo
(vedi *Stack*), quindi l'altezza totale è la somma degli `offsetHeight` dei figli
misurata a runtime — non ricavabile staticamente. Le due sezioni di apertura,
però, fanno da sole **1630 px** a 1920 di larghezza: a 1080 px di altezza schermo
sono già una schermata e mezza prima del primo titolo.

---

## L'esperienza in ordine di tempo

### I primi dieci secondi

| quando | cosa succede | fonte |
|---|---|---|
| 0 ms | PHP serve un guscio di **10.959 byte** con `<body>` quasi vuoto: solo `#lo` (fondo `#ebebeb`) e un contatore `0` a 14 px, già tradotto a `translate3d(0,110%,0)` cioè **fuori vista sotto la sua maschera** | HTML inline |
| 0 ms | uno script sniffa lo user agent e **sceglie il sito**: `d` o `m`. Poi inietta `/static/css/{d|m}.css` e, a `readyState==="complete"`, `/static/js/{d|m}.js` | `<head>` |
| — | `<noscript>` e `<script nomodule>` scrivono "Please enable javascript" / "Please update your browser" | HTML |
| primo frame utile | `d.js` costruisce `class Intro`: azzera la trasformazione di `#lo-no` (**il contatore risale sotto la maschera: è il primo movimento della pagina**) e chiama `R.Fetch("/?device=d")` | `class Intro` |
| + rete | arriva **un JSON da 457.866 byte** (92.923 gzip) con dentro `routes`, `data`, `cache` e `body`. È **tutto il sito**: 45 rotte, l'HTML di ognuna. Da qui in poi nessuna pagina verrà mai più richiesta | `Fetch` in `intro()` |
| subito dopo | `insertAdjacentHTML(document.body, "afterbegin", body)` — il DOM nasce tutto in una volta | stesso punto |
| poi | `new RGL()` prende il contesto `webgl` su `#_r` con `{antialias:true, alpha:true}`; `new Load()` scarica le texture e fa **salire il numero del preloader** | `RGL`, `Load` |
| — | al primo ingresso preallinea le texture delle rotte con `preload:true` — sono **quattro**: `/`, `/studio`, `/work/up-order`, `/work/optikka` | `data.gl.li` |
| fine caricamento | `Intro.cb()` → `rgl.intro()`, `e.intro()`, `init()`, `run()`, `new Fx$1` | `Intro` |
| **+1200 ms** | entrano le sezioni (`delay: 1200`) e partono le **sei lettere MSDF**, 60 ms l'una dall'altra, 1600 ms ciascuna | `Page`, `hoMsdf` |
| **+1400 ms** | se si è entrati direttamente su `/contact`, entra l'overlay | `Page` |
| **+1700 ms** | `e.on()` attiva gli ascoltatori e `#lo` passa a `pointer-events: none` — **prima di questo istante il sito non risponde** | `Page` |

### Il resto, a blocchi

**Muovendo il mouse.** Ogni movimento aggiorna una velocità (`class C`): delta in
pixel diviso il tempo trascorso, con un `dt` minimo di 14 ms per non esplodere ai
frame lunghi, smorzata a 0,3. Quella velocità viene iniettata in una **griglia di
42 righe** (`class PKinetic`) che decade del 6% a frame (`*= 0.94`), viene
caricata come **texture RGB float** e usata dallo shader come mappa di
spostamento. È una finta fluidodinamica: nessuna simulazione, solo una griglia
che ricorda dove sei passato.

**Passando sopra un elemento.** Due smorzamenti diversi, ed è questo che dà il
carattere: il colore torna piano (`0,06`), la deformazione si accende in fretta
(`0,15`).

**Scorrendo.** Lo scroll non è nativo: la rotella e il trascinamento alimentano
un valore interpolato che trasla la pagina. Le immagini scalano da **1,05 a 1,00**
mentre attraversano lo schermo (smorzamento `0,12`); il wordmark ha una parallasse
in spazio UV da `+0,04` a `−0,17`; i filetti sottili (`.lv`, `.lh`) **si disegnano
in proporzione allo scroll**.

**Cambiando pagina.** Nessuna richiesta di rete: l'HTML è già in `cache`. Una
transizione da **1650 ms** chiude e riapre la pagina con `clip-path: inset(...)`
animato a `cubic-bezier(.87,0,.13,1)`, mentre un contatore risale sotto maschera
(y da 101 a 0, 1650 ms, ritardo 825 ms). L'URL cambia con `history.pushState`.

**Andando su `/contact` (desktop).** Non è una pagina: la voce di cache è
**vuota**. Il form vive sempre nel `body` come overlay `#co` e viene solo
mostrato; la pagina sotto resta dov'è, e il pulsante di chiusura è un link alla
rotta precedente. Sul telefono, invece, `/contact` è una pagina vera da 7.694
caratteri.

---

## Animazioni

| elemento | cosa si muove | legato a | curva / inerzia | note |
|---|---|---|---|---|
| `ZAJNO®` (6 piani MSDF) | comparsa in cascata | **tempo** | `d: 1600 ms`, scarto **60 ms** | parte a 1200 ms; disegnato in WebGL, non è testo |
| immagini | desaturazione → colore | **hover** | `R.Damp(bw, 0, .06)` | default `bw = 1`, cioè **tutto nasce grigio** |
| immagini | deformazione + aberrazione cromatica | **velocità del mouse** | `R.Damp(kin, 1, .15)` | 4 volte più rapido del colore: si accende subito, si spegne piano |
| griglia cinetica | campo di velocità 42 righe | **movimento del mouse** | decadimento `× 0,94` a frame | raggio d'influenza `0,2 × 42 ≈ 8,4` celle, spinta `0,06 × clamp(distMax/d, 0, 10)` |
| immagini | scala 1,05 → 1,00 | **scroll** | `R.Damp(scale, e, .12)` | `Remap` sull'intervallo di ingresso/uscita dell'elemento |
| wordmark | parallasse UV `+0,04 → −0,17` | **scroll** | `Remap` lineare | applicata su `move.ease.prlx` |
| filetti `.lv` / `.lh` | si disegnano | **scroll** | `R.iLerp` sull'intervallo | con anti-collisione: due filetti alla stessa quota vengono sfalsati di 50 px |
| pagina | apre/chiude a `clip-path: inset()` | **stato** (navigazione) | 1650 ms, `cubic-bezier(.87,0,.13,1)` | anche i piani WebGL hanno le loro maschere `mLR/mRL/mTB/mBT` |
| righe di testo | y da 110% a −110% | **stato** | `delay: .08` fra discendenti | primitiva `.y_` (maschera) + `.y` (figlio traslato) |
| pallino play | `scale(0)` → `scale(.92)` | **hover** | `600 ms var(--o6)` | in CSS, non in JS |
| link di nav | filetto `.li` sotto | **hover** | `clip-path 800 ms var(--o6)` | il sottolineato è ritagliato, non scalato |
| `#cta` "Menu" (solo mobile) | — | — | — | `mix-blend-mode: difference` su `#e5e5e5` |

**Librerie riconosciute dietro questi effetti: nessuna.** Vedi *Stack*.

### Le curve, per esteso

Dichiarate due volte, in CSS e in JS, con **valori diversi** — un dettaglio da
sapere prima di copiarle.

In CSS (`:root`):

```css
--o3:  cubic-bezier(.215,.61,.355,1);
--o6:  cubic-bezier(.19,1,.22,1);
--io6: cubic-bezier(.16,1,.3,1);
```

In JS (`_A.t.e4`), che sono i valori standard di easings.net:

```js
o1: [.61,1,.88,1]   o3: [.33,1,.68,1]   o6:  [.16,1,.3,1]
io6:[.87,0,.13,1]   io1:[.37,0,.63,1]   i3:  [.32,0,.67,0]   i1:[.12,0,.39,0]
```

Il `--o6` del CSS **non è** l'`o6` del JS: `.19,1,.22,1` contro `.16,1,.3,1`.
E `--io6` in CSS ha i valori che in JS si chiamano `o6`.

I tempi di default:

```js
fx: { show: {d:1400, e:"o6"}, hide: {d:600, e:"i3"} }
```

**Entrare dura più del doppio di uscire** (1400 contro 600), e con curva opposta:
esponenziale in uscita per entrare, cubica in entrata per sparire.

---

## Colori

Due sole variabili dichiarate. Tutto il resto è letterale.

```css
:root { --color-dark: #1a1a1a; --color-red: #ff3928; }
```

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo pagina | `#ebebeb` | `body`, `[data-layer=back] .p`, fondo del preloader, pagina 404 |
| testo | `#1a1a1a` | `body` via `--color-dark`; **anche dentro lo shader**, come `vec3(.10196)` |
| accento | `#ff3928` | logo `Z15`, spunte selezionate del form, `.ho-wr-bo-in-ov` (i premi sotto ogni lavoro) |
| superficie / velo | `#fff` | `.bg` fisso a `opacity: 0`, usato in transizione; testo sopra lo showreel; fondo del menu mobile |
| nero | `#000` | `.txt-s`, bordo `2px solid` sotto `.txt-l` |
| testo debole | `#b2b2b2` | segnaposto dei campi, nota "Your Project, Goals, Success Criteria" |
| esito positivo | `#3ec25d` | messaggio di invio riuscito del form |
| grigio del contatore | `#ebebeb` | `#lo-tr-no`, il numero della transizione |
| `#e5e5e5` (solo mobile) | `#e5e5e5` | `#cta`, in `mix-blend-mode: difference` |

**Palette separata, solo sul template `.p.sei`** (le schede servizio rifatte,
classi `sei26-*`): `#ff0201` per i titoli e i numeri, `#121212` per i fondi dei
media, `#222` per le etichette. È l'unica parte del sito con un'altra idea di
colore — e con `font-weight: 700`, che il carattere caricato non ha (vedi sotto).

**Nota sul grigio.** Il grigio delle immagini **non è un colore**: è calcolato
nello shader come media dei tre canali, `(r+g+b)/3`, e miscelato con l'originale.
Non è la luminanza percettiva (`0.2126 R + 0.7152 G + 0.0722 B`): è la media
semplice, che schiarisce i blu e scurisce i verdi rispetto a un grigio corretto.

---

## Tipografia

**Un solo carattere, un solo peso, per tutto il sito.**

Letto dalla tabella `name` del woff2 con `fontTools`:

| campo | valore |
|---|---|
| famiglia | **Söhne** |
| stile | **Halbfett** |
| fonderia | **Klim Type Foundry** |
| disegnatore | **Kris Sowersby** |
| `usWeightClass` | **600** |
| glifi | 545 |
| unità per em | 1000 |
| variabile | **no** |
| file | `/static/font/sh.woff2`, **32.604 byte** |
| licenza | "Not Licensed for Desktop Use", ordine Klim N° 23040658 |

Servito **da sé**, con `@font-face` scritto nel CSS critico dentro `<head>` (non
nei fogli esterni), `font-display: swap`, alias `font-family: "s"`. Zero
richieste a servizi esterni: la CSP lo impone, `font-src 'self'`.

### La scala, desktop (riferimento 1920 px, `vw × 19,2`)

| livello | selettore | corpo | interlinea | note |
|---|---|---|---|---|
| display | `.title`, `.ppc-co a` | `10.4167vw` = **200 px** | `9.375vw` = 180 px (0,90) | `letter-spacing: -.02em` |
| grande | `.sei-cta a` | `5vw` = 96 px | 1 | |
| medio | `.txt-l` | `3.125vw` = **60 px** | 60 px (1,00) | bordo `2px solid #000` sotto |
| corpo | `body` | `1.5625vw` = **30 px** | 30 px (**1,00**) | interlinea uguale al corpo |
| campo form | `.co-co-fo-li-in` | `.9375vw` = 18 px | 30 px | |
| servizio | `.ho-wr-bo-in-ov` | `.8333vw` = 16 px | 16 px | in `#ff3928` |
| etichetta | `.txt-s`, `#wo-li-he` | `.7292vw` = **14 px** | 20 px | |
| minimo | `.co-co-fo-li-de` | `.6771vw` = **13 px** | 13 px | |

**Rapporto fra i due gradini: 200 / 13 = 15,4×.** In mezzo il vuoto è reale — fra
30 px e 60 px non c'è quasi niente, e fra 60 e 200 nulla.

### La scala, mobile (px indicativi a 390 px di viewport)

| livello | selettore | corpo | note |
|---|---|---|---|
| display | `.ppc-co a`, `.title` | `26.6667vw` ≈ 104 px | |
| titolo | `.ca .title`, `.hero .title` | `16vw` ≈ 62 px | interlinea `13.3333vw`, cioè **0,83** |
| menu | `#menu-ti` | `8vw` ≈ 31 px | |
| corpo | `body` | `4vw` ≈ 15,6 px | interlinea `4.5333vw` (1,13) |
| campi | `.co-co-fo-li-in` | `2.9333vw` ≈ 11,4 px | |
| minimo | — | `2.1333vw` ≈ 8,3 px | |

**Rapporto: 12,5×.**

`letter-spacing: -.02em` compare 24 volte, `-.01em` 3, `-.015em` 1. Non c'è
tracciatura positiva da nessuna parte.

**Da segnalare:** il template `.p.sei` chiede `font-weight: 700` in almeno 8
regole, ma **l'unico file caricato è a peso 600**. O il browser sintetizza un
finto grassetto, o quelle regole non fanno nulla. `non verificato` quale delle
due: servirebbe un rendering.

**Nessun font variabile, nessun monospace.** Il trio "serif + grotesque + mono"
che ricorre sugli altri premiati qui non c'è: c'è un grotesque solo, in un peso
solo, e le differenze si fanno **tutte con il corpo**.

---

## Testi veri

**Titolo del documento**
> Zajno Digital Studio | Web Design, Branding, 3D, Animation & Webflow Development Services

**Descrizione**
> We are making award-winning immersive websites and apps with cool custom graphics, photos, videos, and animations. Let's Collaborate!

**Nav (desktop)**
> zajno® · digital studio · work · studio · contact · twitter · instagram · los angeles, ca

**Hero**: la scritta `ZAJNO®` — **non esiste come testo**, è disegnata in WebGL.
L'unico testo alternativo è l'`aria-label` del logo: `Zajno, Digital Design Studio`.

**Showreel**
> Watch Showreel
> 2015-26

**Work**
> Work
> At Zajno, we know your time is precious, and that's why we prioritize simplicity and efficiency. Our team has the expertise and creativity to handle everything from research and planning to custom design and development, freeing you from the burden of micromanagement.
> ©2015-26

I cinque lavori, testuali:

| n. | ruolo | premi | nome | settore |
|---|---|---|---|---|
| 01 | Full-cycle product development | Product Hunt x 1 · Awwwards x 2 · CSS x 4 | Acquire | Marketplace |
| 02 | Full-cycle website creation | Awwwards x 1 · CSSDA x 4 · Dribbble Select x 1 | Evergreen | Biotech |
| 03 | Full-cycle website creation, branding | Awwwards x 1 · CSSDA x 4 | 8Finance | Crypto |
| 04 | Full-cycle website creation | Awwwards x 2 · CSSDA x 3 · FWA x 1 | Gentlerain.ai | Educational |
| 05 | Design & development of the website's 3 pages | Awwwards x 1 · CSSDA x 3 | Brightmark | Technology |

**Studio**
> Studio
> We're a digital design studio that's all about breaking the mold! We don't do boring websites or ordinary apps - we specialize in crafting the wildest, most unconventional digital experiences out there.

> Services: Web Design · Web Development · Mobile Apps · Branding · Motion Graphics · 3D Illustration · Sound Design · Webflow
> Stats: Founded 2015 · Clients 300+ · Countries 12 · Awwwards 62 · Team 28

**Playground Z15™**
> Playground Z15™
> We dare to be different: to experiment, innovate, bring things into being, and spark emotions in the hearts of people interacting with us. We proudly stand with our heads up in the midst of today's reality that is oversaturated with templated solutions, and we invite you to join us in creating something truly unique.

Voci del carosello:
> Motion.ed — 2023 · The power of sound — 2019 · TL/E — 2023 · Zajno Grid — 2018 · Playlists — 2020 · Journey — Coming soon

**Form di contatto** — titolo `Let's collaborate!`, otto passi numerati:

| n. | domanda | opzioni |
|---|---|---|
| 01 | What can we do for you? | Design · Development · 2D & 3D Art · Animation · Marketing Support · SEO · Sound Design |
| 02 | Budget in USD | Under $10k · $10k-$20k · $20k-$50k · $50k-$100k · $100k + |
| 03 | Your Name | segnaposto `Enter name` |
| 04 | Your Email | segnaposto `Enter email` |
| 05 | Project Details | nota: `Your Project, Goals, Success Criteria`; segnaposto `Enter details` |
| 06 | When would you like to start? | `Select Date...` |
| 07 | Do you have a deadline? | Yes · No, I'm in no rush · No deadline, but asap please |
| 08 | Where did you hear about us? | Google · Awwwards · Dribbble · FWA · LinkedIn · Other |

Pulsante: `Send Request`. Errore: `Error. Try again please.`

**Piede**
> Work · Studio · Contact
> ©zajno 2026
> Instagram · Twitter · LinkedIn · Clutch · Dribbble · Behance

**Menu mobile** (non esiste sul desktop)
> Menu
> 01 home · 02 work · 03 studio · 04 contact · 05 twitter · 06 instagram
> Los Angeles, CA
> ©zajno 2026

**404**
> Please enable javascript to view this website (noscript)
> Please update your browser to view this website (nomodule)

**Dalla pagina `/studio`** — il manifesto, testuale:
> Every day, we power up with caffeine and fuel, remembering our identity and mission. Smiling like a badass, we don't screw around and remember our end game. Our quest is to flip the world on its head and aid others in doing the same, so we partner with like-minded rebels. In client meet-ups, we strategize world domination, then unleash our plan. If we fail, we level up, chuckle it off, and respawn. We grind until we're unstoppable.

---

## Mobile

**Questa non è una versione responsiva. Sono due siti, scelti dal server.**

Nel `<head>` c'è questo, ed è la decisione più importante di tutto il progetto:

```js
device = /Mobi|Andrdoid|Tablet|iPad|iPhone/.test(n.userAgent)
      || ("MacIntel" === n.platform && 1 < n.maxTouchPoints) ? "m" : "d";
css.href = "/static/css/" + device + ".css";
js.src   = "/static/js/"  + device + ".js";
```

Poi il JS chiede `"/?device=" + device` e **il PHP restituisce un HTML diverso**.
Ho scaricato tutte e due le varianti e le ho confrontate.

> **Un errore di battitura, vero, nel codice in produzione:** `Andrdoid`.
> "Android" è scritto male. In pratica non si nota, perché Chrome su Android
> manda comunque `Mobi` nello user agent — ma qualunque agente Android che non
> mandi `Mobi` (diversi tablet, alcuni browser) **prende il sito desktop, con
> tutto il WebGL**. È il tipo di riga che vale la pena rileggere due volte quando
> si copia questo schema.

### I numeri del confronto

| | desktop (`d`) | mobile (`m`) |
|---|---|---|
| JS | **96.759 B** | **33.556 B** (35%) |
| CSS | 35.434 B | 25.831 B |
| JSON del sito | 457.866 B | 421.648 B |
| `body` iniziale | 19.343 caratteri | 16.166 |
| home, layer di contenuto | `[8153, 458]` | `[10652, 0]` |
| `/contact` in cache | `[0, 0]` — **vuoto** | `[7694, 0]` |
| classi WebGL | `GL RGL Ren Tex Pgm Geo Cam Kinetic PKinetic PBg PMedia` | **nessuna** |
| `getContext("webgl")` | 1 | **0** |
| `gl_FragColor` | 1 shader | **0** |
| `mousemove` | sì | **0** |
| media query nel CSS | **0** | **0** |

### Cosa SPARISCE sul telefono

- **Tutto il WebGL.** Non c'è `<canvas>`, non c'è contesto, non c'è shader, non
  c'è la griglia cinetica. Il conteggio è zero, non "ridotto".
- **Il segnaposto `._ri`**, la classe che sul desktop fa da calco per i piani
  WebGL: non compare mai nel DOM mobile.
- **La scritta `ZAJNO®` in MSDF**, e con lei le 6 texture da 1920×728.
- **L'overlay contatti `#co`** con tutto il form: sul telefono non è nel `body`.
- **Il dettaglio dei lavori**: `ho-wr-bo-in`, `-in-ro` (il ruolo) e `-in-ov`
  (i premi, "Awwwards x 2", "CSSDA x 4"). **Sul telefono i premi non si vedono.**
- **La data `©2015-26`** nell'intestazione della sezione Work.
- **I sottolineati in hover** (`.li_`, `.li`, `.n-li`) — non c'è hover.
- **Le tre variabili di easing** `--o3 --o6 --io6`: il `:root` mobile dichiara
  solo i due colori.
- **Il layer frontale**: sul desktop contiene il pulsante showreel
  (`[8153, 458]`); sul telefono è `<div class="m" data-layer="front"></div>`,
  vuoto.

### Cosa viene SOSTITUITO

| desktop | mobile |
|---|---|
| `ZAJNO®` in 6 texture MSDF WebGL | `#ho-he-ba-h1`, **un SVG inline** del logotipo, `fill: var(--color-dark)` |
| nav in linea `#n` con 5 gruppi | `#cta` fisso ("Menu", `mix-blend-mode: difference`) + `<nav id="menu">` a tutta pagina con 6 voci numerate |
| showreel come piano WebGL | `#ho-sh-im` → un `<img>` normale |
| `/contact` = overlay sopra la pagina | `/contact` = pagina vera, navigazione normale |
| scroll virtualizzato (rotella + trascinamento) | **scroll nativo** |
| carosello Playground trascinabile | `class Slider`: pulsanti **prev/next** e un contatore `01 / 08` |
| immagini a colori, desaturate dallo shader | **immagini già grigie sul server** |

### Il dettaglio che vale il viaggio

I file immagine del sito mobile hanno un altro nome:

```
…/01_001_m_playground_black&white.webp
…/cover_acquire_d_black&white@2x.png
…/cover_home_8finance_m_black&white.png
…/cover_home_gentlerain_m_black&white.png
```

`black&white`. **Hanno cotto l'effetto dello shader dentro l'asset.** Sul
desktop il grigio è `mix(colore, media(rgb), g)` calcolato sulla GPU e reversibile
in hover; sul telefono, dove non c'è né GPU né hover, servono direttamente il file
già desaturato. Stessa immagine, stessa resa, zero righe di codice.

Chiedono anche **ritagli diversi** a Prismic: `w=534&h=534` sul desktop,
`w=406&h=406` sul mobile. Non è la stessa immagine ridimensionata dal browser: è
un'altra richiesta al CDN.

### Cosa RESTA

Il testo, tutto, parola per parola: i paragrafi Work/Studio/Playground, Services,
Stats, il piede, le 8 domande del form. La palette. Il carattere e la sua unica
declinazione. La struttura in due layer `.m[data-layer]`. Le rotte, tutte e 45.
Le primitive di animazione `.y_` / `.y`, `Anima`, `Obj`, `ObjArr` — **il motore di
animazione DOM è lo stesso file su tutti e due**.

### Il paradosso

`SNative`, la classe di scroll mobile, per intero:

```js
class SNative {
  constructor(t){ t=t.cb; this.cbY=t.y; R.BM(this,["run"]); }
  on(){ this.l("a"); } off(){ this.l("r"); }
  l(t){ R.L(window, t, "scroll", this.run); }
  run(){ this.cbY(pageYOffset); }
}
class S {
  constructor(){ R.BM(this,["sY"]); this.s=new SNative({cb:{y:this.sY}}); }
  init(){} resize(){} on(){this.s.on()} off(){this.s.off()}
  sY(t){}          // ← vuota
}
```

Registrano un ascoltatore sullo scroll, leggono `pageYOffset`, lo passano a una
funzione **che non fa niente**. Sul telefono **non esiste un solo effetto legato
allo scroll**. Il sito mobile è una pagina statica con transizioni di pagina e un
menu.

Contro le ~500 righe di `class S` desktop: rotella, tastiera, trascinamento a
velocità doppia (`2 * -(y - start) + prevTarget`), resistenza elastica a metà
velocità oltre i bordi, posizione di scroll **memorizzata per rotta** in modo che
tornando indietro si riparta dallo stesso punto.

---

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| framework JS | **nessuno** — micro-framework proprietario nel namespace `R` | **VERIFICATO** | zero occorrenze di `react`, `vue`, `angular`, `svelte` nei due bundle; `R` espone `Lerp`, `Damp`, `iLerp`, `Remap`, `Clamp`, `Ease`, `Ease4`, `RafR`, `Raf`, `Timer`, `Delay`, `Tab`, `Select`, `L`, `G`, `M`, `TL`, `ROR`, `Snif` |
| animazione | **nessuna libreria**, motore proprio | **VERIFICATO** | zero `gsap`, `ScrollTrigger`, `SplitText`, `anime`, `motion`, `framer` |
| easing | libreria propria + **risolutore cubic-bezier scritto a mano** | **VERIFICATO** | `R.Ease` ha linear + `i1..i6`/`o1..o6`/`io1..io6`; `R.Ease4` è bisezione + Newton-Raphson su 11 campioni — lo stesso algoritmo di `bezier-easing` |
| scroll | **proprietario**, virtualizzato su desktop / nativo su mobile | **VERIFICATO** | `class S` + `SV` + `MM`; zero `lenis`, `locomotive`, `smooth-scrollbar` |
| 3D / WebGL | **WebGL 1 scritto a mano**, niente Three.js | **VERIFICATO** | `getContext("webgl", {antialias:true, alpha:true})`; classi `Ren`, `Pgm`, `Geo`, `Tex`, `Cam`, `RGL`; funzioni matrice 4×4 (`create`, `identity`, `invert`) inline; zero `THREE`, `WebGLRenderer`, `PerspectiveCamera` |
| shader | uno solo, `_Basic`, con **3 modalità** | **VERIFICATO** | letto per intero, vedi sotto |
| tipografia grande | **atlanti MSDF** disegnati in WebGL | **VERIFICATO** | `/static/media/ho/he/0..5.png`, 1920×728 RGB; ispezionate a occhio: separazione dei canali tipica MSDF; nello shader `max(min(r,g),min(max(r,g),b)) - .5` con `fwidth` + `smoothstep`; in JS `isHo && s < 6 → t = 2` |
| divisione desktop/mobile | **sniffing dello user agent lato client + rendering lato server** | **VERIFICATO** | `?device=d|m`; due CSS, due JS, due HTML |
| CMS | **Prismic** | **VERIFICATO** | tutte le immagini da `images.prismic.io/zajno-website-2023/…`; la CSP elenca `img-src https://images.prismic.io` |
| backend | **PHP 8.2.6** | **VERIFICATO** | header `X-Powered-By: PHP/8.2.6` |
| hosting / CDN | **AWS**: API Gateway dietro CloudFront | **VERIFICATO** | header `Apigw-Requestid`, `Via: … cloudfront.net`, `X-Amz-Cf-Pop: YUL62-P1` |
| video | **Vimeo** (mp4 progressivo) + **dash.js** come ripiego | **VERIFICATO** | `data.showreel` punta a `player.vimeo.com/progressive_redirect/playback/1184846187/rendition/1080p/…`; dash.js caricato dalla CDN **solo se** `canPlayType('application/vnd.apple.mpegURL')` è falso |
| form | **Formspree**, nessun backend proprio | **VERIFICATO** | `fetch("https://formspree.io/f/mwkrllbz", {method:"POST"})` |
| analitica | GA4 `G-M21F25RTN2`, Google Ads `AW-11105111388`, **Hotjar** `3895992`, **Mixpanel**, **Meta Pixel** `1489878807973890` | **VERIFICATO** | tutti nel `<head>`; Mixpanel è inizializzato con `debug: true` in produzione |
| immagini | Prismic come CDN di trasformazione | **VERIFICATO** | `?auto=format,compress&rect=…&w=…&h=…` |
| font | auto-ospitato, `font-src 'self'` | **VERIFICATO** | CSP + `/static/font/sh.woff2` |
| build | minificatore che **conserva i nomi delle classi** | **SUPPOSTO** | variabili a lettera singola ma `class RGL`, `class PKinetic`, `class Kinetic` leggibili; suffissi `Fx$1 … Fx$8`, `GL$1 … GL$5` sono la firma di **Rollup** |
| DRACO / KTX2 / compressione GPU | **assenti** | **VERIFICATO** | zero occorrenze; le texture sono PNG/WebP normali |
| View Transitions API | **assente** | **VERIFICATO** | zero `startViewTransition`, zero `view-transition-name` |
| `prefers-reduced-motion` | **assente** | **VERIFICATO** | zero occorrenze in tutti e quattro i file |

### Lo shader, per intero

Uno solo per tutto il sito. Vertex:

```glsl
precision highp float;
attribute vec2 p; attribute vec2 u;
uniform mat4 e;   // proiezione
uniform mat4 f;   // modello
uniform vec2 s;   // scala (il "cover" si fa qui)
uniform vec2 w;   // dimensioni finestra
uniform float r;  // scorrimento verticale della uv
varying vec2 b; varying vec2 c;
void main(){
  vec4 a = f * vec4(p.x, p.y, 0., 1);
  gl_Position = e * a;
  b = (u - .5) / s + .5;   // object-fit: cover, calcolato nel vertex
  b.y += r;
  c = (a.xy / w) + .5;     // coordinate schermo, per la mappa di spostamento
}
```

Fragment, tre modalità selezionate dall'uniform `t`:

- **`t == 2` — testo MSDF.** Legge la mappa di spostamento in spazio schermo,
  sposta la lettura, poi ricava l'alfa con la mediana dei tre canali
  (`max(min(r,g), min(max(r,g),b)) - .5`) e la antialiasa con `fwidth` +
  `smoothstep`. Colore fisso `vec3(.10196)` = `#1a1a1a`.
- **`t == 1` — immagine.** Spostamento più **aberrazione cromatica**: rosso
  campionato a `-.023 * d`, verde a `-.02 * d`, blu a `-.017 * d`. Poi
  `mix(colore, media_rgb, g)` per la desaturazione.
- **altrimenti** — tinta piatta `#1a1a1a`.

In coda, quattro `step()` costruiscono le maschere di ritaglio (`m`, `q`) che
fanno le transizioni di pagina, con un ramo `h == 1` che le inverte.

Richiede `GL_OES_standard_derivatives` (per `fwidth`), che è WebGL 1 —
`non verificato` cosa succede dove l'estensione manca.

### L'architettura, in una riga

```
<div class="m" data-layer="back">   ← la pagina che scorre (testo, link, SEO)
<canvas id="_r">                    ← WebGL, pointer-events: none
<div class="m" data-layer="front">  ← ciò che sta sopra il canvas (il pulsante showreel)
```

Il canvas sta **in mezzo**, non sotto. E ha `pointer-events: none`: non riceve mai
un evento. Il collegamento fra DOM e GPU è a senso unico e passa da qui:

```js
this.img = R.G.class("_ri", page);          // i segnaposto vuoti nel DOM
const r = el.getBoundingClientRect();
const a = this.tex[t].move.lerp;
a.x = r.left;  a.w = el.offsetWidth;  a.h = el.offsetHeight;
```

Un `<div class="_ri">` vuoto occupa lo spazio nel flusso, il layout lo posiziona,
il suo rettangolo diventa la geometria di un piano WebGL. Il browser fa il
layout, la GPU fa il disegno.

### La gestione della memoria video

`data.gl.preloadMax: 2`. Alla navigazione, `class Load` scorre le texture
all'indietro e **distrugge** quelle delle rotte oltre le due più recenti, saltando
sempre quella corrente e quella precedente, e solo dove il manifesto dice
`delete: true`. Quattro rotte sono marcate `preload: true` e non vengono mai
buttate: `/`, `/studio`, `/work/up-order`, `/work/optikka`.

In tutto il manifesto dichiara **364 texture** su 43 rotte. Senza sfratto, sarebbe
tutto in memoria video insieme.

---

## Peso e prestazioni

Misurato con `curl`, `Accept-Encoding: gzip, br`, il 13/08/2026.

### Home, desktop, a freddo

| risorsa | sul disco | sul filo |
|---|---|---|
| guscio HTML | 10.959 B | **5.493 B** |
| `/static/css/d.css` | 35.434 B | **6.932 B** |
| `/static/js/d.js` | 96.759 B | **29.132 B** |
| `/?device=d` (tutto il sito) | 457.866 B | **92.923 B** |
| `/static/font/sh.woff2` | 32.604 B | 32.604 B |
| 6 PNG MSDF | 108.995 B | 108.995 B |
| **codice + font + hero** | | **≈ 276 KB** |
| 13 immagini Prismic della home | | **1.574.464 B ≈ 1.538 KB** |
| **TOTALE home** | | **≈ 1.808 KB ≈ 1,77 MB** |

più cinque script di terze parti (GA4, Google Ads, Hotjar, Mixpanel, Meta Pixel),
non misurati.

**Richieste di prima parte sulla home: 24** — 1 HTML + 1 CSS + 1 JS + 1 JSON +
1 font + 6 PNG + 13 immagini.

### Le singole immagini della home

```
391.264 B   …_0.webp                 (3378×1984, q=100)
304.806 B   …_1_1@2.jpg              (1670×1356, q=100)
199.140 B   …_01_01.webp
117.826 B   …_01_05.webp
117.354 B   …_01_02.webp
115.258 B   …_01_04.webp
 88.574 B   …cover_home_brightmark
 87.910 B   …_01_06.webp
 85.992 B   …_01_03.webp
 32.910 B   …_0031.png
 15.500 B   …cover_evergreen_534.png
 10.770 B   …cover_home_gentlerain
  7.160 B   …cover_acquire_534.png
```

**Il codice pesa il 15% della pagina. Le immagini l'85%.** E le due più pesanti
(696 KB in due) sono chieste a **`q=100`**, mentre le miniature usano
`auto=format,compress`. La più grande è 3378×1984 per un piano che a 1920 è largo
1920 e alto 902: **quasi il doppio dei pixel necessari**.

Il PNG MSDF più grande è 25.510 B per 1920×728 — la scritta gigante costa **8-25 KB
a lettera**, meno di qualunque immagine della pagina.

### Confronto fra i due siti

| | desktop | mobile |
|---|---|---|
| JS | 96.759 B | 33.556 B |
| CSS | 35.434 B | 25.831 B |
| JSON | 457.866 B | 421.648 B |
| **totale codice** | **590.059 B** | **481.035 B** (−18,5%) |

### Il costo nascosto

**Il primo caricamento scarica l'HTML di tutte e 45 le rotte** — 458 KB, 93 sul
filo — anche per chi guarda solo la home. In cambio, **ogni navigazione
successiva costa zero richieste**: il contenuto è già in memoria, la transizione
da 1650 ms non aspetta niente.

È lo scambio esplicito del progetto: un primo caricamento più pesante, poi un sito
che non tocca più la rete.

### Quello che non ho

Lighthouse, LCP, CLS, INP, tempo al primo byte utile: **non misurati**, perché
richiedono un browser e ho lavorato solo con `curl`. Il TTFB grezzo della prima
richiesta è stato **25,0 s** su `X-Cache: Miss from cloudfront` da un PoP di
Montréal — cioè una pagina PHP non in cache; le richieste successive sono state
immediate. Un solo campione, **non rappresentativo**.

---

## Tre cose da rubare

### 1. Il segnaposto vuoto che comanda la GPU

Metti nel DOM un `<div class="_ri">` **vuoto**. Non contiene niente: serve solo a
occupare spazio nel flusso normale, dove il motore di layout lo sa mettere meglio
di te. Poi, a ogni `resize` e a ogni frame:

```js
const r = el.getBoundingClientRect();
plane.x = r.left;  plane.w = el.offsetWidth;  plane.h = el.offsetHeight;
```

Il rettangolo diventa la geometria del piano WebGL. **Il canvas ha
`pointer-events: none`**: hover, click, focus e tab restano sul DOM, dove
funzionano già. Il layout responsive lo fa il CSS; tu disegni.

Rifacibile senza WebGL: la stessa idea regge per posizionare un `<video>`, un
elemento in `position: fixed`, o un secondo canvas 2D.

### 2. Cuocere l'effetto nell'asset quando la piattaforma non può farlo

Sul desktop il grigio è uno shader e si può togliere in hover. Sul telefono non
c'è GPU e non c'è hover, quindi l'effetto non serve **reversibile** — serve solo
il risultato. Allora servono un altro file:

```
cover_home_8finance_m_black&white.png
```

Zero righe di codice, zero WebGL, zero JavaScript, resa identica.

La regola generale: **prima di portare un effetto su una piattaforma più povera,
chiediti se quell'effetto ha bisogno di essere dinamico.** Se in hover non torna
indietro, non è un effetto: è un asset.

### 3. Un fetch che porta tutto il sito, e uno smorzamento indipendente dal frame

Due meccaniche piccole che cambiano il comportamento generale.

**Il fetch unico.** Una richiesta a `/?device=d` torna
`{routes, data, cache, body}`, dove `cache` ha l'HTML di **ogni** pagina.
Poi `insertAdjacentHTML` per entrare, `removeChild` per uscire,
`history.pushState` per l'URL. Nessun router, nessuna idratazione, nessuna
richiesta successiva. 93 KB gzip per 45 pagine.

**Lo smorzamento.** Ogni interpolazione del sito passa da qui:

```js
const FR = 1000/60;  let RD = 0;   // RD = deltaTime / FR, aggiornato a ogni raf
R.Damp = (a, b, t) => R.Lerp(a, b, 1 - Math.exp(Math.log(1 - t) * RD));
```

Non è `lerp(a, b, 0.1)`, che a 144 Hz va più che al doppio della velocità che a
60 Hz. Elevando il coefficiente al rapporto fra i delta, **l'animazione dura lo
stesso tempo su qualunque monitor**. Sei righe, e il sito smette di essere legato
al frame rate.

E il coefficiente si sceglie per dare carattere: colore `0,06`, deformazione
`0,15`, scala allo scroll `0,12`, velocità del mouse `0,3`. **La differenza fra
0,06 e 0,15 è quello che rende l'hover "vivo"**: la forma reagisce subito, il
colore ci mette mezzo secondo.

---

## Non verificato

- **Il sito in movimento.** Non ho mai aperto una scheda: nessuno screenshot,
  nessun rendering. Tutto viene dal codice statico. Le ampiezze reali degli
  effetti sono dedotte dai coefficienti, **non campionate**.
- **Quante schermate dura ogni sezione.** L'altezza si calcola a runtime dagli
  `offsetHeight` (lo scroll è virtualizzato) e non è ricavabile dal CSS.
- **La resa delle sei texture MSDF composte.** Ho aperto `he0.png` (la Z) e
  `he5.png` (la ®) e ho confermato la struttura MSDF; **non ho verificato le
  quattro in mezzo** né come si compongono a schermo.
- **`font-weight: 700` sul template `.p.sei`** con un solo file a peso 600:
  finto grassetto o regola inerte, non lo so senza un rendering.
- Il **tempo di caricamento reale** (Lighthouse, LCP, CLS, INP). Il TTFB di 25 s
  è un solo campione, a cache fredda, su PoP di Montréal.
- Il comportamento **con `prefers-reduced-motion`**: ho verificato che il
  supporto **non c'è** (zero occorrenze), non come si comporta chi lo ha attivo.
- Il comportamento del ramo `hasFloatTex = false` (GPU senza texture float): il
  codice ha un `try/catch` di ripiego, `non verificato` cosa disegna dopo.
- Il **peso delle terze parti** (GA4, Ads, Hotjar, Mixpanel, Meta Pixel): non
  misurato.
- Cosa vedono davvero gli **Android senza `Mobi`** nello user agent, per via del
  refuso `Andrdoid`: dedotto dalla regex, non provato.
- Il ruolo esatto di **Aristide Benoist**: risulta nei crediti Awwwards, e lo
  stile del micro-framework è compatibile, ma **è una supposizione**.
- Le **44 rotte oltre la home**: ho letto i titoli e il testo di `/studio` e
  `/contact`; le pagine dei lavori non le ho analizzate.
