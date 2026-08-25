# Revelatio Studio

- **URL**: https://revelatio.studio
- **Premio**: Awwwards Site of the Day, 12/08/2026 — voto 7,37/10 (Design 7,45 · Usability 7,19 · Creativity 7,43 · Content 7,46; Development 7,07). Tag dichiarati da Awwwards: WebGL, GSAP, Webflow. Fonte: https://www.awwwards.com/sites/revelatio-studio
- **Studio**: Revelatio Studio (Recife, Pernambuco, Brasile). Crediti Awwwards: Revelatio Studio + "Yuusuke". Fondatori dichiarati su /about: Arthur Galvão (Co-founder & CBO), Ícaro de Souza (Co-founder & COO), Lucas Lavor (Co-founder & CTO)
- **Anno**: sito pubblicato l'ultima volta il **21/07/2026** (commento Webflow nell'HTML: `Last Published: Tue Jul 21 2026 19:29:44 GMT+0000`). Studio fondato nel 2020
- **Letto il**: 13/08/2026

**Metodo di questa scheda.** Nessun browser aperto. Tutto è letto dal codice
sorgente scaricato con `curl`: HTML della home, CSS Webflow, e **i 17 script
scritti a mano** che lo studio serve in chiaro, non minificati, con i commenti
originali (in portoghese) da `https://revelatio.vercel.app/scripts/`. È un caso
raro: di questo sito si può leggere praticamente tutto il codice di
interazione. **Quello che NON ho è la misura reale dello scorrimento**: durate,
ampiezze e sensazioni sono dedotte dai numeri scritti nel codice.

---

## L'ESPERIENZA (integrazione)

*Aggiunta del 13/08/2026. Letta con `curl` su `/`, `/work`, `/approach`,
`/about`, `/contact` e `/project/medno`. Nessun browser aperto.*

### Di cosa tratta il sito

Uno studio brasiliano che vende **tre cose insieme** — marchio, prodotto e
codice — e costruisce tutta la pagina attorno alla domanda che gli altri quattro
evitano: **cosa succede dopo la consegna.** Il sito contiene 17 progetti, 5 aree
di capacita' con 45 sotto-voci, 15 testimonianze nominali, 18 schede di metrica
post-consegna, 18 loghi cliente e due moduli di contatto diversi.

### Cosa vende, e qual è l'obiettivo finale

Vende **consulenza integrata a prezzo dichiarato per fascia**, ed è l'unico dei
cinque che segmenta l'offerta per mercato: un listino in real brasiliani e uno in
dollari, sulla stessa pagina.

L'obiettivo finale è compilare uno dei due moduli di `/contact` — o prenotare una
chiamata (`Book a call`), che è la terza opzione. L'obiettivo dichiarato e quello
vero coincidono in modo insolitamente onesto: il piede dice
`Let's build something together` e sotto ci sono tre porte etichettate per
intenzione — **`Get a quote` · `Join our team` · `Just say hello`**. Non c'è
finzione: la prima porta si chiama "preventivo".

### A chi

Ad **aziende in crescita**, non a corporate e non a startup di garage. Lo si
legge dalla forbice del modulo internazionale, che parte da `$5K – $10K`: la
metà del gradino minimo di Cuberto. E lo si legge dalle metriche, che sono tutte
di scala piccola e verificabile (`New branch opened in another city`,
`Team size grew 250% after the rebrand`), non di scala enterprise.

Il compratore esce pensando: *sanno costruire — il sito me lo sta dimostrando
mentre lo guardo — e i risultati me li contano in numeri, con nome e cognome di
chi li ha ottenuti.*

### L'esperienza progettata, passo per passo

È **una dimostrazione tecnica seguita da un dossier commerciale**, e le due metà
sono nettamente separate.

1. **0-3,65 s** — preloader nero, barra a scatti, testi che si scramblano.
2. **Schermate 1-2** — il televisore ASCII che cresce e smette di essere un
   televisore. Sopra, l'H1: `Branding, Product Design & Code. One integrated
   vision.` **Due schermate intere spese per dimostrare il terzo pezzo della
   tripletta.**
3. **Schermate 3-5** — servizi e 5 schede progetto con video di sfondo.
4. **Schermate 5-7** — `Capabilities` a fisarmonica, 5 voci.
5. **Schermate 7-11** — le 25 città su fondo nero, sticky per 4 schermate. È
   l'unica sezione che **non vende niente**: dice solo "abbiamo lavorato dove
   lavori tu".
6. **Schermate 11-12** — gli odometri: `Since 2020` · `Projects 300+` ·
   `Countries 9` · `Recognitions 40+`.
7. **Schermate 12-15** — **il cuore commerciale**: `What happens after the work
   goes live.` più un marquee trascinabile di 18 schede metrica, poi 15
   testimonianze.
8. **Schermate 15-17** — loghi, notizie, e la CTA `Want to talk about a project?`
   **con la fotografia di Arthur Galvão, Co-founder & CBO**.
9. **Piede** — doppio orologio (tuo fuso / fuso loro), `Let's build something
   together`, tre porte, logo in ASCII che cade.

### Cosa deve fare il visitatore, e dove lo portano

Deve scegliere **da quale delle tre porte entrare**, e poi compilare il modulo
giusto per il suo mercato. `/contact` si apre con:

> `Got a project in mind, a wild idea, or just want to say hey? We're all ears.`
> **`Local client (Brazil)` | `International client` | `Book a call`**

I due moduli hanno gli stessi campi ma **listini diversi**:

| campo | contenuto |
|---|---|
| `What should I call you?` | nome |
| `Where do I reach you?` | email |
| `What's the best number to reach you?` | telefono |
| `How did you find me?` | canale di provenienza |
| `Which services do you need?` | 11 caselle: `Brand Strategy`, `Visual Identity`, `Brand Naming`, `Website`, `Landing Page`, `Product Design`, `UX/UI Design`, `Web Development`, `Software Development`, `Ongoing Design Support`, `Ongoing Dev Support` |
| **`What is your project budget?`** | **Brasile**: `R$10K – R$20K` · `R$20K – R$50K` · `R$50K – R$100K` · `R$100K+` — **Internazionale**: `$5K – $10K` · `$10K – $25K` · `$25K – $50K` · `$50K – $100K` · `$100K+` |
| `Project Delivery Date?` | `Within 1 month` · `Within 3 months` · `Within 6 months` · `Flexible timeline` |
| `Tell me about your project` | testo libero |
| — | `Send Request` |

**Il dettaglio linguistico che vale il viaggio**: le domande sono tutte in
**prima persona singolare** — `How did you find *me*?`, `Tell *me* about your
project`, `What's the best number to reach *you*?`. Non parla lo studio: parla
una persona. È coerente con la CTA in fondo alla home, che ha la faccia e il
nome del socio, e con le testimonianze, che metà delle volte nominano
direttamente `Arthur`.

### Come è organizzata la persuasione

| pezzo | dove | in quante schermate |
|---|---|---|
| **promessa** | H1 sull'eroe ASCII | schermate 1-2 |
| **prova di capacità** | il canvas stesso: il sito *è* la dimostrazione del "code" | schermate 1-2 |
| **prova di copertura** | 25 città | schermate 7-11 |
| **prova di scala** | 4 odometri | schermate 11-12 |
| **prova di risultato** | **18 metriche post-consegna** | schermate 12-14 |
| **prova di parola** | **15 testimonianze con nome, ruolo, azienda, città e paese** | schermate 14-15 |
| **prezzo** | **le fasce stanno in `/contact`, segmentate per mercato** | fuori home |
| **chiamata all'azione** | `Get in touch` nella barra (schermata 1), `Let's talk` (schermata 16), 3 porte nel piede (17) | 1 e 16-17 |

**Il prezzo, come lo trattano.** Non pubblicano un listino, ma **il modulo lo
rivela**: dichiarare `$5K – $10K` come primo gradino è già un prezzo di entrata
comunicato. E la doppia valuta è una decisione commerciale esplicita — il minimo
brasiliano (`R$10K`, circa $1,8-2K) è **molto** più basso del minimo
internazionale. Vendono lo stesso studio a due mercati con due scale.

**La prova al posto del prezzo, versione estrema.** È il sito che investe di più
in prove misurabili, ed è l'unico dei cinque a farlo. Le 18 schede metrica sono
frasi corte con un numero grande davanti:

> `+30` — *30 positions opened in the first month of operation.*
> `+250%` — *Team size grew 250% after the rebrand.*
> `+300k` — *Landing page with 300,000+ visits over a three-month campaign.*
> `+60%` — *60% revenue increase after the rebrand.*
> `+400%` — *Revenue quadrupled in six months after the rebrand.*
> `+92` — *Branding projects with an NPS of 92.*
> `Acquired` — *by an industry leader 12 months after the rebrand.*
> `95%` — *of our clients remain active in the market.*

Introdotte dalla riga che le rende credibili invece che vanterie:
*"Beyond delivery, our work is designed to perform. The numbers below reflect how
what we build behaves in practice, across markets, products, and stages of
growth."* Nessuna delle 18 dice "abbiamo fatto un bel sito": tutte dicono cosa è
successo all'azienda dopo.

**Cosa arriva a chi non scorre.** Arriva **la dimostrazione, non l'argomento**.
Nella prima schermata ci sono il televisore ASCII in WebGL, l'H1 `Branding,
Product Design & Code. One integrated vision.` e `Get in touch` nella barra. Chi
si ferma lì capisce che sanno costruire cose difficili — perché gliel'hanno fatta
vedere, non raccontata — ma **non vede nemmeno un cliente, un numero o una
testimonianza**. E il costo qui è alto: l'eroe si prende **2 schermate su ~17**,
e le prove cominciano alla dodicesima. È la struttura più sbilanciata dei cinque:
tutto il materiale che convince sta nell'ultimo terzo.

### Come mostrano i casi studio

È il formato più completo dei cinque. `/project/medno`:

- **Titolo-claim in una riga**: `Medno — Designing a brand and digital experience
  that turn corporate health from a black box into a managed function.`
- **Settore e anno**: `Healthtech & Corporate Care | 2026`
- **Strumenti**: `Figma`, `Webflow` (dichiarano lo stack, cosa che nessuno degli
  altri quattro fa nei case)
- **`Deliverables`**: elenco piatto — *Brand Workshop, Brand Strategy, Positioning
  & Messaging, Visual Identity, Motion Graphics, Brand Guidelines, Brand
  Applications, Web Design & Development*
- **`Context`** — il problema di mercato, scritto bene: *"Companies can quote
  their cash flow to the second decimal. Ask the same companies how their team's
  health has changed this year and the honest answer is usually a shrug…"*
- **`Challenge`** — perché era difficile
- **`Solution`** — cosa hanno fatto e **perché ogni scelta**: *"The symbol locks
  small modules into a contemporary cross on a circular grid, completing only when
  every part is present, the way Medno only works when plan, assistants,
  specialists and data move together."*
- **`Credits`** nominali per ruolo (Account Lead, Research & Strategy,
  Positioning, Brand Design, Web Design, Web Development, Motion Graphics, e
  perfino `Case Study: Arthur Galvão`)
- Due progetti successivi
- **La stessa CTA della home, con la faccia del socio**: `Want to talk about a
  project?` / `Arthur Galvão — Co-founder & CBO` / `Let's talk`

Un difetto onesto: **il caso studio non riporta le metriche**. I numeri stanno
solo nel marquee della home e di `/approach`, staccati dal progetto che li ha
prodotti. Nessuna delle 18 schede dice di quale cliente parla.

### La pagina servizi

**Esiste, si chiama `/approach`, ed è la più completa dei cinque siti.** Ha tre
strati:

1. **Il manifesto** — *"We believe design and code are only means of expression.
   The real work lies in identifying problems, simplifying complexity, and
   building solutions that move things forward."* (praticamente la stessa frase
   del manifesto di Locomotive: *"Design and code are only tools of
   expression"*.)
2. **Le 5 capacità con 45 sotto-voci in totale** — `01 Brand Strategy` (10 voci,
   da `Brand Audit & Diagnosis` a `Go-to-Market Strategy`), `02 Brand & Visual
   System` (10), `03 Digital Products` (10), `04 Technology & Innovation` (7, con
   `AI Implementation` e `CMS & Headless Architecture`), `05 Embedded Teams &
   Partnerships` (7, con `Fractional Brand Leadership`, `Squad as a Service`,
   `Retainer & Open-Scope Engagement`, `Venture Partnerships`). **La quinta è
   quella che vende il fatturato ricorrente** e nessuno degli altri quattro siti
   ce l'ha.
3. **Il processo in 4 fasi**, ognuna con un titolo-frase invece di un'etichetta:
   - `Immersion` — *We dive beneath the surface.*
   - `Diagnosis` — *Understand the problem before solving it.*
   - `Craft` — *Where thinking takes a body.*
   - `Handover` — *Built to ship. Built to outlast us.* (*"We don't hand projects
     off — we hand them over. […] Code that's easy to evolve once we're out of the
     picture."*)

Poi, sulla stessa pagina: clienti, le 15 testimonianze e le 18 metriche. Cioè
**la pagina servizi è anche la pagina delle prove**: chi ci arriva trova
l'offerta e la giustificazione nello stesso scroll.

### Testi veri (integrazione)

**Approach, manifesto** — `We believe design and code are only means of
expression. The real work lies in identifying problems, simplifying complexity,
and building solutions that move things forward.`

**Approach, sistema** — `A system built across layers of thinking and execution.`

**Handover** — `We don't hand projects off — we hand them over. Tested,
documented, and ready for the environments they were made for. […] Handover isn't
a finish line; it's the moment the work starts earning its keep.`

**Contact, apertura** — `Got a project in mind, a wild idea, or just want to say
hey? We're all ears.`

**Testimonianze (campione)** —
`"Revelatio knew how to listen to me, and that was the key. […] The result was
representative, with personality, just the way I wanted: making a strong
entrance." — Carlos Henrique, Founder, Medno - São Luís, Brazil`
`"The work of Revelatio goes far beyond design; it is deep, strategic, and
captures the essence of the brand. Our branding is one of my greatest prides in
life […] It was one of the best investments I've ever made, and I would do it all
over again without a second thought." — Giovanna Schettini, Founder, Immersy -
Recife, Brazil`
`"Revelatio captured an essence that even we, as directors, couldn't fully
articulate. It was by far the best consultancy I've ever worked with." — Bruna
Veríssimo, Marketing & Sales Director, cVortex - Uberlândia, Brazil`

**Work, sommario** — `We create strategy, brand systems, and digital products for
companies looking to move forward with clarity.`

**Piede** — `Let's build something together` · `Get a quote` · `Join our team` ·
`Just say hello`

---

## Cosa vende

Consulenza integrata brand + prodotto + codice, venduta come una cosa sola e non
come tre fornitori. Il sito è la prova del terzo pezzo: il "code" della tripletta
è dimostrato dal sito stesso, non raccontato.

## A chi

Aziende in crescita (non startup di garage, non corporate) che stanno rifacendo
o costruendo il proprio marchio e hanno anche bisogno di far girare un prodotto.
Testimonianze da Brasile, USA, Germania, Emirati. Il compratore deve uscire
pensando: *questi sanno anche costruire, e i risultati si contano in numeri* —
la pagina è letteralmente costruita attorno a una fila di metriche post-consegna.

## Idea regista

**Un tubo catodico che si accende, cresce fino a diventare la pagina, e poi
smette di essere un tubo catodico.**

## Il momento

Il primo. Il video di presentazione dello studio non è un video: è renderizzato
in **ASCII con uno shader WebGL scritto a mano**, dentro una cornice a forma di
tubo catodico (bordi bombati, curvatura fish-eye, aberrazione cromatica, bloom).
All'uscita del preloader il "televisore" **si accende** con due lampi gaussiani
(`powerOn(980)`), e poi, sui **200vh** di scorrimento successivi, la cornice
cresce fino a occupare tutta la finestra mentre il parametro `tvness` va da 1 a 0
— cioè la curvatura, il bombamento e l'aberrazione **si spengono progressivamente
mentre l'immagine si ingrandisce**. Arrivi a schermo pieno e il tubo non c'è più.

Cade tra 0 e ~2 schermate di scorrimento dall'alto della home. Codice:
`video-ascii.js`, blocco *Scroll zoom*, `SCALE_END_PROGRESS = 0.85`,
`TVNESS_END_PROGRESS = 0.85`.

Secondo momento, più tardi: la sezione delle città (sticky, 400vh) dove passando
il mouse si lascia **una scia di 11 fotografie di progetto** che ruotano e
svaniscono in 1,2 s.

## Struttura, sezione per sezione

Nove blocchi `.section` più l'eroe. Le durate in schermate sono lette dal CSS
(`height` in vh) dove esiste; dove il blocco è a flusso normale ho scritto la
stima in base al contenuto e l'ho marcata.

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |
|---|---|---|---|
| Preloader | fondo nero, logo Revelatio, due righe di testo che si "scramblano", barra verticale che sale a scatti 0→25→50→75→100% | attende, non può scorrere (wheel/touch/tasti bloccati) | fisso, min 2,0 s + 0,95 s di uscita + 0,7 s di dissolvenza |
| Eroe | `<canvas>` WebGL: video ASCII dentro cornice CRT, sticky 100vh su spaziatore 200vh; h1 sovrapposto | scorre e guarda il TV crescere; muove il mouse per deformare l'ASCII | **2,0** (`.home-hero_spacer { height: 200vh }`) |
| 1 — Servizi + progetti (fondo bianco) | filtri Branding/Website/Product/Code, 5 schede progetto con video Vimeo di sfondo, "See all projects" | passa sopra le schede, filtra | ~2,5 (stimato) |
| 2 — Capabilities (bianco) | 5 accordion: Embedded Teams, Technology & Innovation, Digital Products, Brand & Visual System, Brand Strategy | apre/chiude le voci | ~1,5 (stimato) |
| 3 — Città (**nero**) | h2 gigante con 25 città in fila, in sticky; il fuoco di opacità scorre città per città | scorre; muovendo il mouse spawna la scia di foto | **4,0** (`.locations_component-view { height: 400vh }`) |
| 4 — Chi siamo (bianco) | paragrafo studio + 4 odometri: Since 2020 / Projects 300+ / Countries 9 / Recognitions 40+ | guarda i numeri girare all'ingresso in viewport | ~1,2 (stimato) |
| 5 — Risultati (bianco) | "What happens after the work goes live." + marquee **trascinabile** di 18 schede metrica; poi carosello testimonianze 1/15 | trascina il marquee, sfoglia le testimonianze | ~2,5 (stimato) |
| 6 — Selected Clients (**nero**) | griglia di 18 loghi cliente | scorre | ~1,0 (stimato) |
| 7 — News (nero) | Swiper 11 con 6 notizie (Web Summit Rio, Red Bull, Tech Bridges, Vibe Hack…) | frecce prev/next | ~1,0 (stimato) |
| 8 — CTA (nero) | "Want to talk about a project?" + foto di Arthur Galvão + "Let's talk" | clicca | ~0,8 (stimato) |
| 9 — Footer (nero) | doppio orologio (tuo fuso / fuso Revelatio), "Let's build something together", tre CTA, logo Revelatio **in ASCII che cade e si ricompone** | guarda il logo formarsi; il mouse lo respinge (effetto magnetico) | ~1,5 (stimato) |

La sequenza dei fondi è: **bianco, bianco, nero, bianco, bianco, nero, nero,
nero, nero**. L'inversione non è dipinta a mano: la fa uno script (vedi
Animazioni).

## L'esperienza in ordine di tempo

**I primi dieci secondi** (ricostruiti dalle costanti in `preloader.js` e
`video-ascii.js`; i tempi sono quelli scritti nel codice, non cronometrati):

- **0,00 s** — schermo nero. `html.is-preloading`: `overflow: hidden`, `body`
  in `position: fixed`, `history.scrollRestoration = 'manual'`, e tre listener
  che annullano `wheel`, `touchmove` e i tasti ` `/PageUp/PageDown/frecce/Home/End.
  Non si scorre in nessun modo.
- **0,00–0,95 s** — le due righe "Branding, Product Design & Code" e "Recife,
  Brazil / Working Globally" entrano **scramblate** con i caratteri `^$%#@!&*?+=`
  (GSAP ScrambleTextPlugin, `duration: 0.95`, `speed: 0.9`, stagger 0,12 s tra le
  due righe). Il logo è visibile. Dietro, il canvas ASCII è già acceso ma
  soffocato: `filter: brightness(0.14) blur(1.4px); opacity: .62`.
- **0,00–2,00 s** — il numero percentuale sale **a scatti**, non in continuo:
  solo 0 / 25 / 50 / 75 / 100, minimo 420 ms tra uno scatto e l'altro, ogni
  cambio scramblato in 0,42 s. La barra verticale segue con
  `transform: scaleY(v/100)`, origine in basso, `cubic-bezier(.22,1,.36,1)` in
  0,48 s. Il valore reale di caricamento è una curva
  `0.9 * (1 - e^(-t/1400))` finché il documento non è `complete`: **la barra
  mente per costruzione**, non arriva mai a 90% da sola.
- **~2,00 s** (mai prima: `MIN_DURATION_MS = 2000`) — uscita. Le due righe
  escono **lettera per lettera**: ogni carattere diventa un simbolo casuale e poi
  sparisce in 0,06 s, con 18 ms di ritardo tra un carattere e l'altro; la riga di
  sinistra si smonta **da destra a sinistra**, quella di destra da sinistra a
  destra. Il logo del preloader va a `opacity: 0` in 0,5 s.
- **~2,95 s** (`EXIT_CONTENT_MS = 950`) — il preloader va a `opacity: 0` e nello
  stesso istante partono due cose: (a) l'h1 dell'eroe si scrambla parola per
  parola (`duration: 1.2`, stagger 0,01 s, `SplitText` su words+chars, poi
  `split.revert()`); (b) **il televisore si accende**: `revelatioAscii.powerOn(980)`
  porta `powerState` 0→1 con una curva spezzata (potenza 0,58 fino al 35% del
  tempo, poi potenza 1,3) e due lampi gaussiani sovrapposti, il primo a t=0,12
  con ampiezza 1,55, il secondo a t=0,32 con ampiezza 0,55. È l'accensione di un
  CRT, rifatta a mano.
- **~3,65 s** (`+ PRELOADER_FADE_MS = 700`) — `is-preloading` rimossa, scorrimento
  restituito, evento `revelatio:preloader-done` sparato. Da qui in poi Lenis
  guida la ruota.

**Poi, a blocchi:**

1. **Eroe (0→200vh).** Il `.revelatio-tv` è misurato una volta a riposo
   (`captureBase()`), poi larghezza e altezza vengono interpolate linearmente
   verso `window.innerWidth` × altezza visibile, e il blocco sale di 3em
   (2em su mobile) fino a 0. In parallelo `tvness: 1 - progresso`: la cornice
   bombata `tvSize` passa da `(0.93, 0.80)` a `(1.0, 1.0)`, il bombamento
   orizzontale da 0,035 a 0, il verticale da 0,14/0,15 a 0, il fish-eye da 0,28 a
   0, l'aberrazione cromatica da 2 a 0. Il 100% è raggiunto all'85% dello scroll:
   **l'ultimo 15% è schermo pieno fermo**, deliberatamente.
2. **Servizi e progetti.** Ogni riga dei blocchi servizi viene spezzata in righe
   vere e alzata da `translateY(.75rem)` + `opacity 0` a zero, `power2.out`,
   0,6 s, stagger 0,09 s, innescata da `IntersectionObserver` (soglia 0,2,
   `rootMargin: 0px 0px -8% 0px`) — **non da ScrollTrigger**.
3. **Città.** Sticky per 3 schermate nette. Le 25 città sono avvolte una per una
   in `<span>` con `opacity: .08`; un valore `focused = progresso × 24` scorre
   lungo l'elenco e ogni parola prende `opacity = .08 + max(0, 1-|i-focused|) × .92`,
   con transizione `.12s linear`. Effetto: una lente di luce che cammina sulle
   parole. Sopra, la scia di foto.
4. **Numeri.** Odometri a cifre che ruotano, con `IntersectionObserver`
   (soglia 0,35, `rootMargin: 0px 0px -12% 0px`), `power3.out` 1 s, stagger 0,1 s
   tra elementi e 0,04 s tra cifre, 2 giri di cifre. **Rispetta
   `prefers-reduced-motion`: se attivo non anima affatto.**
5. **Risultati.** Marquee che cammina da solo (50 s per un giro di lista) e che
   si può **trascinare** per accelerare o invertire; il cursore sopra scrive
   "Drag".
6. **Testimonianze.** 15 voci, autoplay 5 s, transizione riga per riga con
   `SplitText` sulle righe e maschera dell'immagine
   `circle(0% at 50% 50%)` → `circle(50% at 50% 50%)`.
7. **Footer.** Il logo Revelatio (SVG a percorsi) viene campionato ogni 14 px, e
   ogni punto diventa un carattere da `01#@&ABCDEFGHIJKLMNOPQRSTUVWXYZ` che
   **cade** (gravità 0,70, 1200 ms) e poi si ricompone nella forma del logo
   (1100 ms). Il mouse ha un campo magnetico: raggio 120 px, forza 28, ritorno
   0,08.

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| Scorrimento globale | tutto | ruota/touch | **Lenis** `duration: 2`, easing `t => t===1 ? 1 : 1 - 2^(-10t)` (expo.out) | `smoothWheel: true`, **`smoothTouch: false`** — sul telefono lo scroll è nativo. Caricato tramite il wrapper "SScroll" di **OFF+BRAND** (`lenis-offbrand-v2.txt`), configurato con attributi `data-*` sul tag `<script>` |
| Eroe, canvas ASCII | dimensione + `tvness` | scroll, progresso su 200vh | lineare (`lerp` semplice) | scritto a mano, `requestAnimationFrame` + `getBoundingClientRect`, **niente ScrollTrigger** |
| Eroe, glifi ASCII | deformazione locale | **posizione e velocità del mouse** | scia di 24 punti nello shader, decadimento `trailDecay: .839` | il mouse "spinge" i caratteri lungo la direzione del movimento (`warpStrength: 46.5`); l'energia decade con `mouseEnergy += (target-mouseEnergy)*0.09` e va a zero dopo 260 ms di immobilità |
| Preloader, barra | `scaleY` 0→1 a 4 scatti | tempo + `readyState` | `cubic-bezier(.22,1,.36,1)`, 0,48 s | |
| Preloader, testi | scramble in e out | tempo | GSAP ScrambleTextPlugin | uscita lettera per lettera, 18 ms di passo |
| h1 dell'eroe | scramble per parole | evento `revelatio:preloader-done` | `duration 1.2`, stagger 0,01 s | `SplitText` poi `revert()` — il DOM torna pulito |
| Titoli in pagina | scramble per parole | **ScrollTrigger** `start: 'top bottom'`, `once: true` | `duration 1.4`, stagger 0,015 s | l'unico uso di ScrollTrigger che ho trovato negli script custom |
| Link e bottoni | lampeggio dei caratteri + `scale: .985` | hover | keyframes opacity 0/1/0/1 su 0,23 s, stagger 0,03 s `from: 'random'` | `data-scramble-hover` |
| Fondo della pagina | **inverte bianco↔nero** | quale `.section` copre la **mezzeria verticale** della finestra | `transition: .35s ease` su `background-color`, `color`, `border-color`, `fill`, `stroke` | `color-inversion.js`: due set di variabili CSS su `html` e `html.dt`, commutati da uno `scroll` listener in rAF |
| Cursore 1 (cerchio) | segue il mouse **1:1, senza inerzia** | mousemove | `transform` 0,22 s `cubic-bezier(.22,1,.36,1)` solo per la scala | `mix-blend-mode: difference`, `background: #fff`, 1em; `scale(1.5)` sopra `a, button, [role=button]` |
| Cursore 2 (etichetta) | pillola scura con testo scramblato | hover su `[data-cursor-hover]` | `scale` 0,02→1, `power3.out` 0,32 s in ingresso / `power2.out` 0,2 s in uscita | i due cursori si scambiano: quando la pillola compare, il cerchio si riduce a `scale(0.02)` via evento custom `revelatio:scramble-cursor-active` |
| Città | opacità per parola | scroll su 400vh sticky | `.12s linear`, campana triangolare larga ±1 parola | |
| Scia di foto | 11 immagini clonate | mousemove, **soglia di distanza = mezza larghezza della card** | classi CSS `hidden`/`visible`/`transition-out` a 0/400/1200 ms | non è una scia continua: è un clone ogni N pixel percorsi |
| Marquee risultati | scorre a sinistra, 50 s/giro | `requestAnimationFrame` **vanilla** | trascinamento con moltiplicatore 35, ritorno al ritmo base in 0,9 s | dichiaratamente svincolato da GSAP: il commento originale dice *"NAO depende de GSAP / ScrollTrigger / Observer… nao existe corrida de carregamento de libs"* |
| Blocchi servizi | righe che salgono | `IntersectionObserver` | `power2.out` 0,6 s, stagger 0,09 s | |
| Odometri | cifre che ruotano | `IntersectionObserver` | `power3.out` 1 s | **onora `prefers-reduced-motion`** |
| Testimonianze | righe + maschera circolare | autoplay 5 s / frecce | GSAP + `SplitText` sulle righe | |
| Logo footer | caratteri che cadono e si ricompongono | ingresso + mouse | gravità 0,70, caduta 1200 ms, formazione 1100 ms, magnete r=120 px | |
| Transizione di pagina | tendina nera | click su `<a>` | `power2.inOut`, 0,6 s in uscita / 0,8 s in entrata | vedi sotto, per intero |

**Librerie riconosciute:** GSAP 3.15.0 (core + ScrollTrigger + SplitText +
ScrambleTextPlugin + Observer), Lenis (via wrapper OFF+BRAND), Swiper 11,
jQuery 3.5.1 (solo come runtime Webflow). **Three.js non c'è**: il WebGL è
scritto a mano, `gl.createShader` diretto.

## Colori

Il sistema è **bianco e nero puri più rampe alfa**. Non esiste un colore di
marca. L'unico colore cromatico di tutto il sito è un giallo che compare solo
nel cursore, quando un progetto è coperto da riservatezza.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo chiaro | `#ffffff` (`--color--neutral--light`) | sezioni 1, 2, 4, 5 |
| fondo scuro | `#000000` (`--color--neutral--dark`) | eroe, sezioni 3, 6, 7, 8, 9, preloader, tendina di transizione |
| testo su chiaro | `#000000` (`--tfg` in tema chiaro) | tutto il corpo |
| testo su scuro | `#ffffff` (`--tfg` in tema scuro `html.dt`) | tutto il corpo |
| testo attenuato 60% | `rgba(0,0,0,.6)` / `rgba(255,255,255,.6)` (`--tfg-60`, classe `.op-60`) | sommari, orologi |
| testo attenuato 40% | `rgba(0,0,0,.4)` / `rgba(255,255,255,.4)` (`--tfg-40`, classe `.op-40`) | metadati |
| superficie / bottoni / bordi | `hsla(0,0%,0%,.08)` su chiaro, `hsla(0,0%,100%,.16)` su scuro (`--tt`) | bottoni non bianchi, barra nav, schede risultati, accordion |
| riga di separazione | `hsla(0,0%,0%,.85)` / `hsla(0,0%,100%,.85)` (`--tline`) | righe delle metriche |
| schede cliente | `hsla(0,0%,0%,.04)` / `hsla(0,0%,100%,.04)` | griglia Selected Clients |
| rampa neutra Webflow | `#0000000a` `#00000014` `#00000029` `#00000052` `#000000a3` e i gemelli su bianco | variabili `--color--neutral--100…1000` |
| **accento, unico** | **`#ffd166`** | testo del cursore quando vale la stringa `confidential` (`scramble-cursor.js`) |
| selezione testo | `background: var(--tfg); color: var(--tbg)` | inversione anche nella selezione |

Il fondo dell'ASCII nello shader è `vec3(0.0)` puro: i glifi sono l'unica cosa
illuminata.

## Tipografia

**Un solo carattere in tutto il sito.** Nessun serif, nessun monospace di
servizio — il che rompe il trio ricorrente degli altri premiati. Il monospace
esiste ma **solo dentro il canvas**: l'atlante dei glifi ASCII è disegnato con
`Menlo, Monaco, "Courier New", monospace` a peso 700, 52 px per cella.

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| base (`body`) | Neue Haas Grotesk Text Pro 55 Roman | 400 | **`.833vw`** (= 16 px a 1920, 10,7 px a 1280, 21,3 px a 2560) | 1,5 | tutto il resto è in `em`, quindi **tutta la pagina scala con la larghezza della finestra** |
| h1 / `.heading-style-h1` | idem | 400 | `3em` (48 px a 1920) | 1,1 | `letter-spacing: -.03em` |
| h2 | idem | 400 | `2.25em` (36 px) | 1,2 | `letter-spacing: -.03em` |
| h3 | idem | 400 | `1.75em` (28 px) | 1,2 | |
| display città | idem | 400 | **`6em`** (96 px a 1920) | — | il corpo più grande del sito |
| corpo | idem | 400 | `1em` (16 px) | 1,5 | `letter-spacing: -.019em` |
| piccolo / bottoni | idem | 400 | `.875em` (14 px) | 1,1 | `letter-spacing: -.03em` |
| menu / etichette | idem | 400 | `.75em` (12 px) | — | |

**Rapporto tra i due gradini: 96 / 12 = 8x** (display città contro etichetta);
guardando solo l'h1 il rapporto scende a 4x. Sta dentro la forbice 6–14x
osservata sugli altri premiati, ma nella parte bassa.

**Come sono serviti i font.** Auto-ospitati sul CDN Webflow, **in formato TTF,
non WOFF2**: `neue-haas-grotesk-text-pro-55-roman.ttf`, **86 KB**, un solo peso.
Zero richieste a `fonts.googleapis.com`. Un WOFF2 dello stesso file peserebbe
verosimilmente un terzo — è la svista più evidente di tutto il sito.

## Testi veri

**Titolo pagina (`<title>`)**
> Revelatio | Branding, Product Design & Code

**Meta description**
> Revelatio is an integrated studio for branding, product design, and code, building digital experiences and brand systems for ambitious companies.

**Preloader**
> Branding, Product Design & Code
> Recife, Brazil / Working Globally

**H1 dell'eroe**
> Branding, Product Design & Code. One integrated vision.

**Sommario dei servizi**
> We partner with companies of all sizes, across industries and borders, delivering a broad spectrum of design and code services.

**Menu**
> Work · Approach · About · Careers · Contact — EN / PT — Get in touch

**Titolo dei risultati**
> What happens after the work goes live.

> Beyond delivery, our work is designed to perform. The numbers below reflect how what we build behaves in practice, across markets, products, and stages of growth.

**Chi siamo**
> Nothing here happened overnight. Each number represents a step forward, shaped by real problems, real people, and a constant pursuit of better solutions.

> Revelatio is an independent consultancy based in Recife, working with clients across nine countries. For six years, we've partnered with growing companies on the work that defines them — brand, product, and the systems behind both.

**Odometri**
> Since 2020 · Projects 300+ · Countries 9 · Recognitions 40+

**Città (h2, in fila, separate da virgola)**
> Waterloo, New York, Boca Raton, Atlanta, Los Angeles, London, Porto, Munich, San Sebastián, Tel Aviv, Dubai, Recife, Natal, Salvador, Fortaleza, Manaus, Bela Vista, Porto Alegre, Canela, São Carlos, Imperatriz, São Paulo, Rio de Janeiro, Balneário Camboriú, Chapecó,

**CTA finale**
> Want to talk about a project?
> From crafting unique brand identities to designing intuitive websites and valuable content, we're here to execute your ideas. Contact us, and let's discuss your project.
> Arthur Galvão — Co-founder & CBO — Let's talk

**Footer**
> Let's build / something together
> Get a quote · Join our team · Just say hello
> Location — Recife, Pernambuco, Brazil
> Your Timezone (US) 20:26:24 · Revelatio Timezone (BR) 20:26:24
> © Revelatio 2026 · Privacy Notice

**Testo di default del cursore, lasciato nel markup**
> Hello Osmo

(È il testo segnaposto della libreria di componenti **Osmo** — osmo.supply.
Rimane nell'HTML servito: `<span data-cursor-text-target class="cursor-scramble__text">Hello Osmo</span>`.
Prova, non deduzione, che parte dei componenti viene da lì.)

## Mobile

Il taglio è netto e va letto per media query. I punti di rottura sono quelli
standard di Webflow: **991 / 767 / 479 px**.

**Cosa SPARISCE**
- **Entrambi i cursori.** `.circle-cursor { display: none }` sotto 991 px, e in
  più tutti e due gli script escono subito se
  `matchMedia('(hover: hover) and (pointer: fine)')` non corrisponde. Il CSS in
  testa nasconde `.cursor` sotto `(hover: none) and (pointer: coarse)`.
- **La scia di 11 foto sulle città.** È agganciata solo a `mousemove`: su touch
  non esiste. La sezione resta, ma diventa il solo testo che si illumina.
- **Lo scorrimento morbido.** `data-smoothTouch="false"`: Lenis non tocca il
  touch. Il telefono usa lo scroll nativo del sistema — è una scelta, non una
  dimenticanza.
- Il selettore di lingua nella barra (`hide-mobile`), un blocco marcato
  `hide-tablet`.

**Cosa viene SOSTITUITO**
- La barra di navigazione diventa un **menu a schermo intero** gestito da
  `mobile-menu.js`: `html.is-menu-open` blocca l'overflow, forza il testo della
  nav a `#fff` e il fondo dei bottoni a `hsla(0,0%,100%,.16)` **indipendentemente
  dal tema chiaro/scuro in corso**, e le voci entrano con scramble.
  Le `.menu-link` passano da `.875em` a **`2em`** sotto 479 px.
- Il display delle città passa da `6em` a `4em` (≤991), `3.7em` (≤767) e infine a
  **`4.3vh`** (≤479): sotto i 479 px il corpo è ancorato **all'altezza** della
  finestra, non alla larghezza, per non far traboccare la riga.
- Il corpo base cambia formula a ogni soglia — `.833vw` → `1.615vw` → `2.086vw`
  → `3.738vw` — calibrate perché il risultato resti intorno a 16 px al punto di
  rottura. Sotto i 479 px il testo torna quindi a una scala leggibile.
- Il "sollevamento" del televisore nell'eroe passa da 3em a **2em**
  (`MOBILE_MONITOR_LIFT_EM`).

**Cosa RESTA**
- **Il canvas ASCII WebGL gira anche sul telefono.** Non c'è nessun guard di
  media query in `video-ascii.js`: si inizializza ovunque ci sia
  `[data-ascii-canvas]` e un contesto `webgl`. Resta l'intero shader — fish-eye,
  bloom, aberrazione, scia — e resta il download del **video MP4 da 3,49 MB**.
  Solo la deformazione da mouse resta di fatto inattiva.
- Il preloader completo, con i suoi 2 secondi minimi.
- L'inversione bianco/nero: è basata sulla mezzeria del viewport, funziona uguale.
- La transizione di pagina.
- Gli odometri, i blocchi servizi, le testimonianze (tutti su
  `IntersectionObserver`, indipendenti dal puntatore).
- Il logo ASCII del footer, con `data-ascii-align` centrato invece che a
  sinistra e altezza `22.75em` invece di `30em`.

Il codice contiene inoltre due difese esplicite per iOS: la barra dinamica di
Safari viene aggirata leggendo `visualViewport.height` invece di `100vh`, e un
`resize` che cambia **solo** l'altezza non ricalcola le misure di base (solo un
cambio di larghezza è considerato un resize vero).

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| CMS / build | **Webflow** | **VERIFICATO** | `<!-- This site was created in Webflow -->`, `data-wf-site`, `data-wf-page`, `<meta name="generator" content="Webflow">`, collezioni `w-dyn-list` |
| Hosting del sito | Webflow (CDN `cdn.prod.website-files.com`) | **VERIFICATO** | dominio degli asset e del CSS |
| Hosting degli script custom | **Vercel**, dominio separato `revelatio.vercel.app` | **VERIFICATO** | 17 `<script src="https://revelatio.vercel.app/scripts/…">` |
| Animazione | **GSAP 3.15.0** + ScrollTrigger + SplitText + ScrambleTextPlugin + Observer | **VERIFICATO** | 5 tag `<script>` da `cdn.prod.website-files.com/gsap/3.15.0/` e `gsap.registerPlugin(ScrollTrigger,SplitText,ScrambleTextPlugin,Observer)` inline |
| Scroll | **Lenis** via wrapper "SScroll" di **OFF+BRAND** | **VERIFICATO** | `lenis-offbrand-v2.txt` servito dal sito Webflow di OFF+BRAND (`645e0e1ff7fdb6dc8c85f3a2`); CSS `html.lenis`, `.lenis-smooth`, `[data-lenis-prevent]` in testa; configurazione via `data-*`: `duration="2"`, easing expo.out, `smoothTouch="false"` |
| 3D / WebGL | **WebGL 1 grezzo, scritto a mano.** Nessun Three.js | **VERIFICATO** | `video-ascii.js`: `canvas.getContext('webgl')`, `gl.createShader`, vertex+fragment shader completi in stringa. `three` non compare in nessuna risorsa |
| Carosello | **Swiper 11** da jsDelivr | **VERIFICATO** | `swiper-bundle.min.js` + `.css` |
| jQuery | 3.5.1 | **VERIFICATO** | caricato da `d3e54v103j8qbb.cloudfront.net`; è il runtime standard di Webflow, non lo usano per animare |
| Video di presentazione | MP4 su CDN Webflow, letto come texture (`crossOrigin: anonymous`) | **VERIFICATO** | `videoSrc` in `video-ascii.js` |
| Video delle schede progetto | **Vimeo**, 5 player in `background=1` | **VERIFICATO** | `player.vimeo.com/video/…?background=1` |
| Immagini | WebP + PNG su CDN Webflow, `loading="lazy"` su 86 di 94 `<img>`, `srcset` su 11 | **VERIFICATO** | markup |
| Cookie | Finsweet Cookie Consent v1, modalità `opt-in` | **VERIFICATO** | `fs-cc.js` con `fs-cc-mode="opt-in"` |
| Analytics | Google Analytics 4, `G-XLFKCCHK88` | **VERIFICATO** | tag gtag |
| Libreria di componenti | **Osmo** (osmo.supply) per almeno il cursore | **VERIFICATO** | il testo segnaposto "Hello Osmo" è rimasto nell'HTML di produzione |
| Multilingua | Webflow Localization, EN + PT-BR | **VERIFICATO** | `w-locales-list`, `hreflang` alternate verso `/pt-br` |
| Font | Neue Haas Grotesk Text Pro 55 Roman, auto-ospitato **in TTF** | **VERIFICATO** | `@font-face` con `url(…roman.ttf)` nel CSS Webflow |
| View Transitions API | **non usata** | **VERIFICATO** | nessuna occorrenza di `startViewTransition` o `view-transition-name`; la transizione è quella di `page-transition.js`, con `window.location.href` |

## Peso e prestazioni

Misurati con `curl` in richiesta compressa (gzip/br), il 13/08/2026. Non ho
eseguito Lighthouse (niente browser).

| risorsa | trasferito | note |
|---|---|---|
| HTML della home | **238,3 KB** | grezzo 520,1 KB |
| CSS Webflow | 22,3 KB | grezzo 128,3 KB |
| GSAP core | 29,4 KB | |
| ScrollTrigger | 18,4 KB | |
| SplitText + ScrambleText + Observer | 12,1 KB | |
| Swiper 11 (js + css) | 48,8 KB | |
| jQuery 3.5.1 | 31,5 KB | runtime Webflow |
| Webflow js (3 chunk) | 56,8 KB | |
| Lenis (wrapper OFF+BRAND) | 4,2 KB | |
| **17 script custom** | **46,0 KB** | il più grosso: `ascii-logo-footer.js` 10,6 KB, `video-ascii.js` 8,4 KB. `page-transition.js`: **2,6 KB grezzi** |
| Font TTF | **86,1 KB** | un solo peso; sarebbe un terzo in WOFF2 |
| **Video MP4 dell'eroe** | **3,49 MB** | scaricato sempre, anche su telefono |
| **Totale JS+CSS+font** | **≈ 394 KB** | |
| **Totale con il video** | **≈ 3,88 MB** | escluse le immagini e i 5 iframe Vimeo |

**107 URL esterni unici** nell'HTML, distribuiti così: 68 al CDN Webflow, **18 a
`revelatio.vercel.app`**, 5 iframe Vimeo, 3 a jsDelivr, 1 a CloudFront, 1 a
Google Tag Manager, il resto link social. **94 tag `<img>`.**

**Il difetto strutturale.** 419 KB dei 520 KB di HTML — **l'80%** — sono
**34 SVG in linea**: i loghi cliente esportati da Figma, di cui **110 KB sono
immagini raster in base64** infilate dentro `<mask>` e `<pattern>` degli SVG.
Sono nella prima risposta HTML, quindi bloccano il primo rendering, non si
possono mettere in cache separatamente, e non si possono caricare pigramente. Se
quei 34 SVG fossero file `.svg` o `.webp` esterni con `loading="lazy"`, l'HTML
scenderebbe da 238 KB a circa 45 KB compressi.

Da mettere in conto anche: 3 origini distinte per lo script critico
(Webflow CDN, jsDelivr, Vercel), quindi tre handshake TLS; e **17 richieste
separate** per gli script custom, non concatenate.

---

## `page-transition.js` — il file, per intero, commentato

Scaricato da `https://revelatio.vercel.app/scripts/page-transition.js` il
13/08/2026. **2 637 byte grezzi, 112 righe.** Il codice è riportato senza
modifiche; i commenti in italiano sono miei.

Serve anche il CSS che lo accompagna. Sta in un blocco `<style>` nel `<head>`
della pagina Webflow, e senza di esso lo script non funziona:

```css
/* la pagina parte NERA: se il JS non gira, non si vede un lampo bianco */
html, body { background: #000; }

/* la tendina. Sempre presente nel DOM, mai creata al volo */
.transition-cover {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: 99999;
  display: flex;
  opacity: 1;         /* NOTA: parte VISIBILE */
  visibility: visible;
  will-change: opacity;
}

/* il contenitore di tutta la pagina, che parte invisibile */
.page-wrapper {
  opacity: 0;         /* NOTA: parte INVISIBILE */
  transition: none;   /* nessuna transizione CSS: comanda solo GSAP */
}
```

Il trucco d'impostazione è tutto qui: **a pagina appena caricata la tendina è
già chiusa e il contenuto è già invisibile**. Non c'è un istante in cui si
intravede la pagina prima che la tendina la copra, perché la tendina non deve
arrivare: c'è già. È il JavaScript che decide se aprirla con l'animazione
(navigazione interna) o farla sparire di colpo (arrivo diretto).

```js
/* ============================================================
   BLOCCO 1 — la rete di sicurezza
   Gira SUBITO, prima di qualunque evento, in una IIFE.
   Inietta il fondo nero della tendina con !important.
   Perche': la classe .transition-cover e' disegnata in Webflow,
   e chiunque tocchi quello stile dall'editor potrebbe cambiarne
   il fondo senza accorgersi di rompere la transizione. Questo
   lo blocca dal codice. E' una difesa contro il proprio CMS.
   ============================================================ */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .transition-cover {
      background: #000 !important;
      position: fixed;
      inset: 0;
      z-index: 99999;
    }
  `;
  document.head.appendChild(style);
})();


/* ============================================================
   BLOCCO 2 — il motore vero
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  // Tutti i link che NON aprono una scheda nuova.
  // I link con target="_blank" restano intatti: sarebbe assurdo
  // calare una tendina sulla pagina che resta.
  const links = document.querySelectorAll('a:not([target="_blank"])');

  const transitionCover = document.querySelector('.transition-cover');
  const pageWrapper = document.querySelector('.page-wrapper');

  // Se manca uno dei due elementi lo script si spegne e basta.
  // Il sito continua a funzionare come un sito normale.
  // Questa riga e' il motivo per cui il file e' sicuro da incollare
  // in un progetto Webflow qualsiasi.
  if (!transitionCover || !pageWrapper) return;


  /* ---- USCITA: si va via da questa pagina ---- */
  const startTransitionAnimation = (targetURL) => {
    // Si prepara la tendina: visibile come box (display:flex) ma
    // trasparente. autoAlpha di GSAP = opacity + visibility insieme,
    // cosi' quando opacity e' 0 l'elemento e' anche
    // visibility:hidden e non intercetta i click.
    gsap.set(transitionCover, {
      display: 'flex',
      autoAlpha: 0
    });

    // La tendina si chiude in 0,6 s.
    gsap.to(transitionCover, {
      duration: 0.6,
      autoAlpha: 1,
      ease: 'power2.inOut',
      // IL PUNTO CENTRALE DI TUTTO IL FILE:
      // la navigazione parte solo QUANDO la tendina e' gia' chiusa.
      // Non c'e' nessuna SPA, nessun router, nessun fetch.
      // Il browser fa una navigazione vera: la barra degli indirizzi,
      // la cronologia, il tasto indietro e l'indicizzazione
      // funzionano esattamente come su un sito statico.
      onComplete: () => {
        window.location.href = targetURL;
      }
    });
  };


  /* ---- ENTRATA: si arriva su questa pagina ---- */
  const endTransitionAnimation = () => {
    // Stato di partenza esplicito: contenuto invisibile, tendina chiusa.
    // Ridichiarato in JS anche se il CSS lo fa gia': se il CSS venisse
    // modificato in Webflow, qui si riallinea comunque.
    gsap.set(pageWrapper, { opacity: 0 });
    gsap.set(transitionCover, {
      display: 'flex',
      autoAlpha: 1
    });

    // La tendina si apre in 0,8 s — piu' lenta dei 0,6 s dell'uscita.
    // Asimmetria voluta: uscire e' un gesto (deve essere rapido),
    // entrare e' una rivelazione (puo' respirare).
    gsap.to(transitionCover, {
      duration: 0.8,
      autoAlpha: 0,
      ease: 'power2.inOut',

      // Il contenuto NON aspetta che la tendina sia sparita: sale a
      // opacity 1 in 0,4 s partendo INSIEME all'apertura. Cioe' le due
      // dissolvenze si sovrappongono, e il contenuto e' gia' pieno
      // a meta' apertura. E' quello che elimina la sensazione di vuoto.
      onStart: () => {
        gsap.to(pageWrapper, {
          opacity: 1,
          duration: 0.4,
          ease: 'power1.out'
        });
      },

      // Pulizia: la tendina esce dal flusso. Senza display:none
      // resterebbe un <div> a tutto schermo con z-index 99999 sopra
      // la pagina — invisibile ma capace di rubare i click.
      onComplete: () => {
        gsap.set(transitionCover, {
          display: 'none',
          autoAlpha: 0
        });
      }
    });
  };


  /* ---- LA MEMORIA FRA UN DOCUMENTO E L'ALTRO ----
     Il problema da risolvere: la pagina nuova e' un documento
     completamente nuovo. Non sa se ci sei arrivato cliccando un
     link (e quindi la tendina e' gia' calata e va aperta) o
     digitando l'indirizzo (e quindi non c'e' nessuna tendina da
     aprire e il contenuto va mostrato subito).
     La risposta e' una bandierina in sessionStorage, scritta
     dalla pagina precedente un istante prima di navigare.
     sessionStorage e non localStorage: vive quanto la scheda,
     e' isolata per scheda, e non lascia niente sul disco.        */
  const hasTransition = sessionStorage.getItem('nextPageTransition');

  if (hasTransition) {
    // Sei arrivato da un link interno: apri la tendina.
    endTransitionAnimation();
    // Consumata subito. Se non la si cancellasse, un ricaricamento
    // della pagina rigiocherebbe l'apertura senza motivo.
    sessionStorage.removeItem('nextPageTransition');
  } else {
    // Arrivo diretto (indirizzo digitato, link esterno, primo ingresso):
    // niente animazione. Contenuto visibile e tendina rimossa, subito.
    // Questo e' il ramo che rende il sito indicizzabile e veloce
    // per chi arriva da Google.
    gsap.set(pageWrapper, { opacity: 1 });
    gsap.set(transitionCover, {
      display: 'none',
      autoAlpha: 0
    });
  }


  /* ---- L'INTERCETTAZIONE DEI CLICK ---- */
  links.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');

      // Nessun href, o ancora interna (#sezione): e' uno spostamento
      // dentro la stessa pagina. Non si cala nessuna tendina.
      if (!href || href.startsWith('#')) return;

      // Link che punta alla pagina in cui si e' gia' (tipico del logo
      // in home, o della voce di menu attiva). Confronto su link.href,
      // che e' l'URL ASSOLUTO risolto dal browser, non sull'attributo
      // grezzo: cosi' "/", "/index" e l'URL completo si equivalgono.
      // Senza questo controllo il logo in home calerebbe la tendina
      // per poi ricaricare la stessa identica pagina.
      if (link.href === window.location.href) return;

      // Da qui in poi si prende il comando.
      e.preventDefault();
      sessionStorage.setItem('nextPageTransition', 'true');
      startTransitionAnimation(link.href);
    });
  });

});


/* ============================================================
   BLOCCO 3 — il tasto INDIETRO
   Questo e' il pezzo che quasi tutti dimenticano, ed e' quello che
   separa una transizione che funziona da una che lascia gli utenti
   davanti a uno schermo nero.
   ============================================================ */
window.addEventListener('pageshow', function (event) {
  const transitionCover = document.querySelector('.transition-cover');
  const pageWrapper = document.querySelector('.page-wrapper');

  if (!transitionCover || !pageWrapper) return;

  // event.persisted === true significa: questa pagina NON e' stata
  // ricaricata, e' stata ripescata dalla bfcache (back/forward cache).
  // Il browser l'ha congelata com'era e l'ha rimessa in vita.
  // "Com'era" vuol dire: con la tendina NERA CHIUSA, perche' quello
  // era il suo stato nell'istante in cui si e' navigato via.
  // Senza questo blocco, il tasto indietro mostra una pagina nera.
  if (event.persisted) {
    // Si ammazza qualunque tween congelato a meta'. gsap.killTweensOf('*')
    // e' volutamente brutale: nella bfcache possono essersi fermate
    // animazioni di qualsiasi parte del sito, non solo della tendina.
    gsap.killTweensOf('*');

    // Si riporta a mano lo stato "pagina normale", senza animazione:
    // l'utente ha premuto indietro, si aspetta una pagina, non uno show.
    gsap.set(pageWrapper, { opacity: 1 });
    gsap.set(transitionCover, {
      display: 'none',
      autoAlpha: 0
    });

    // E si pulisce la bandierina, che potrebbe essere rimasta scritta.
    sessionStorage.removeItem('nextPageTransition');
  }
});
```

**Cosa costa e cosa dà.** 112 righe, 2,6 KB, una sola dipendenza (GSAP, che sul
sito c'è già per altri dieci motivi), nessun router, nessun bundler, nessuna
View Transitions API — che peraltro Firefox non supporta ancora per il
cross-document. Funziona su qualunque sito multipagina, Webflow o no, WordPress
compreso, purché esistano due elementi con quelle due classi. Sopravvive al
tasto indietro, ai link esterni, alle ancore, ai ricaricamenti e al link che
punta a sé stesso.

**Cosa gli manca, per onestà.**
1. Non guarda `prefers-reduced-motion`: chi ha chiesto meno animazioni si becca
   comunque 1,4 s di tendina a ogni click.
2. Non distingue i domini esterni: un `<a href="https://instagram.com/...">`
   senza `target="_blank"` verrebbe intercettato e la tendina resterebbe calata
   mentre il browser lascia il sito. Su questo sito i social hanno
   `target="_blank"`, quindi il caso non si presenta — ma chi copia il file deve
   aggiungere un controllo su `link.hostname !== location.hostname`.
3. Non gestisce il ctrl+click / cmd+click / click con la rotella: `e.preventDefault()`
   scatta comunque, quindi **"apri in una scheda nuova" non funziona sui link
   interni**. Serve un `if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;`.
4. Non c'è timeout di sicurezza: se `window.location.href` non porta a nulla
   (rete caduta, 404 lento) la tendina resta nera all'infinito.
5. I link aggiunti al DOM dopo il `DOMContentLoaded` (contenuto CMS caricato via
   fetch, risultati di un filtro) non vengono agganciati — servirebbe una
   delega dell'evento su `document` invece di 200 listener individuali.

---

## Tre cose da rubare

**1. Il tema si inverte da solo in base a quale sezione taglia la mezzeria dello
schermo.** Non è una classe messa a mano per sezione: è un `scroll` listener in
`requestAnimationFrame` che scorre tutti i `.section`, trova quello il cui
rettangolo contiene `innerHeight * 0.5`, e mette o toglie una sola classe su
`<html>`. Il resto è CSS: due set delle stesse sei variabili
(`--tbg --tfg --tt --tline --tfg-60 --tfg-40`) e una `transition: .35s ease`
su `background-color, color, border-color, fill, stroke`. Trenta righe di JS per
un effetto che di solito costa un ScrollTrigger per sezione. Il dettaglio da non
perdere: **le opacità non si fanno con `opacity`** ma con l'alfa nel colore
(`.op-60` → `color: var(--tfg-60)`), altrimenti l'inversione arriverebbe
sfasata rispetto al testo pieno. Il commento originale nel file lo dice.

```js
const center = window.innerHeight * 0.5;
for (const sec of document.querySelectorAll('.section')) {
  const r = sec.getBoundingClientRect();
  if (r.height < 10) continue;
  if (r.top <= center && r.bottom >= center) {
    document.documentElement.classList.toggle('dt',
      sec.classList.contains('background-color-neutral-dark'));
    break;
  }
}
```

**2. Un parametro solo che spegne un intero effetto mentre l'elemento cresce.**
Nell'eroe non ci sono due animazioni (ingrandimento + perdita del CRT): c'è un
solo progresso di scroll che pilota due cose. Le dimensioni si interpolano da
misurate a schermo pieno, e **lo stesso progresso** entra nello shader come
`tvness: 1 - progresso`, che nel GLSL moltiplica *contemporaneamente* la
curvatura fish-eye, il bombamento dei bordi, la maschera del tubo e
l'aberrazione cromatica. Un numero, quattro effetti che si spengono insieme,
zero rischio che vadano fuori sincrono. È la lezione generale: **non animare
quattro proprietà in parallelo, animare un parametro e farlo leggere a quattro
posti.**

**3. Un preloader che mente in modo credibile.** Il progresso mostrato non è il
progresso reale (che è inutilizzabile: sale a scatti irregolari e sta fermo per
secondi). È `0.9 * (1 - e^(-t/1400))` — una curva che parte veloce e rallenta,
esattamente come si aspetta l'occhio — **quantizzata a soli quattro scatti**
(0/25/50/75/100) con almeno 420 ms di distanza tra uno e l'altro. Il vero
`readyState === 'complete'` serve solo come *condizione di uscita*, insieme a un
minimo di 2 000 ms. Risultato: la barra non balbetta mai e non resta mai
piantata. E ogni scatto è scramblato, così il salto da 25 a 50 sembra un
calcolo, non un taglio.

---

## Non verificato

- **Le durate e le ampiezze reali dello scorrimento.** Ho i numeri scritti nel
  codice (200vh, 400vh, `lerp`, easing) ma non ho campionato nessun `transform`
  a due altezze diverse. Chi rifà questi effetti deve misurarli.
- **Le schermate stimate** nella tabella della struttura per le sezioni a flusso
  normale (1, 2, 4, 5, 6, 7, 8, 9): non hanno `height` in vh nel CSS, la stima è
  sul volume di contenuto. Le uniche misurate sono eroe (200vh) e città (400vh).
- **La resa vera del canvas ASCII.** Ho letto tutto lo shader; non l'ho visto
  girare. Non so quanti fps regga, né come si comporti la texture del video su
  Safari iOS (`crossOrigin: anonymous` su un CDN Webflow: le intestazioni CORS
  non le ho controllate).
- **Il comportamento con `prefers-reduced-motion`.** Solo `odometer.js` e
  `services-item-entrance.js` lo controllano esplicitamente. Preloader,
  transizione di pagina, scramble, canvas ASCII, marquee e logo del footer
  **non lo controllano affatto** — verificato per assenza nel codice, non provato
  in un browser con l'impostazione attiva.
- **Le altre pagine** (`/work`, `/approach`, `/about`, `/careers`, `/contact`,
  `/pt-br`). Ho ispezionato solo la home; `/about` solo tramite WebFetch, quindi
  il testo sì, il codice no. `projects-filter.js` e `news-swiper.js` esistono ma
  il primo non ha bersagli nella home.
- **Lighthouse, LCP, CLS, fps.** Nessun browser aperto per regola del compito:
  niente punteggi.
- **Il peso totale delle immagini.** 94 `<img>` non pesati uno per uno; il totale
  di ≈3,88 MB le esclude, così come i 5 player Vimeo.
- **Chi è "Yuusuke"** nei crediti Awwwards accanto a Revelatio Studio.
- **Se il TTF sia una scelta o una svista.** Il file esiste solo in TTF sul CDN;
  non ho trovato un WOFF2 corrispondente, ma non ho tentato di indovinarne l'URL.
