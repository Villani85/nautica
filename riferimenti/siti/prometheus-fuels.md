# Prometheus Fuels

> **ATTENZIONE — IL SITO PREMIATO NON ESISTE PIU'.**
> `https://prometheusfuels.com` oggi (13/08/2026) risponde **301 → `https://prometheusfuels.ai/`**,
> che e' un **WordPress con tema `hello-elementor`** (150 KB di HTML, `Server: Apache`,
> `<title>Prometheus Fuels — Carbon-Neutral Liquid Fuels</title>`). Niente WebGL, niente
> capitoli, niente racconto: un sito istituzionale normale, con menu `Home / Technology /
> ULDES / About`. **Anche l'azienda e' cambiata**: oggi non vende piu' "benzina dall'aria
> per il viaggio in macchina" ma *Ultra Long Duration Energy Storage* per **data center e
> difesa** (`Our Ultra Long Duration Energy Storage (ULDES) systems can shape and firm
> renewable energy seasonally`; `Using power from a portable SMR, we can create diesel and
> jet fuel in a containerized system`). Il sito del 2021 raccontava un road trip; quello
> del 2026 parla a chi compra megawatt.
> Anche il CMS originale e' chiuso: `storage.googleapis.com/prometheus-fuels.appspot.com/data`
> risponde `AccessDenied`.
>
> **Questa scheda e' ricostruita dai file veri, non da ricordi.** Ho scaricato e letto
> dagli archivi Wayback:
> - l'HTML della home, snapshot `20210506233254` (due giorni dopo il Site of the Day);
> - **`assets/js/app.js?1618519756467`** (1.130 KB decompressi, snapshot `20210415204916`),
>   che in testa porta l'intestazione ASCII di Active Theory e la data di build `4/15/21 11:43a`.
>   **Dentro c'e' lo storyboard completo del sito** (`Config.PAGE`), con le altezze di
>   scroll scena per scena e i tempi di ogni frase;
> - **`assets/data/uil.json`** (737 KB) — il file di layout dell'engine: 10.328 chiavi con
>   posizioni di camera, uniform di shader, 487 colori esadecimali e 219 texture;
> - `assets/shaders/compiled.vs` (158 KB) — tutti gli shader in un file solo, 182 `void main`;
> - `data/index.json` del CMS, snapshot `20210415204917` — **tutti i testi del sito**.
>
> Tutto cio' che segue e' letto li' dentro salvo dove scritto `SUPPOSTO` o `non verificato`.

- **URL**: `https://www.prometheusfuels.com/` — versione premiata: `http://web.archive.org/web/20210506233254/https://www.prometheusfuels.com/`. Oggi reindirizza a `https://prometheusfuels.ai/`
- **Premio**: Awwwards **Site of the Day** 04/05/2021 — voto **8.40** (Design 8.50, Usability 7.77, Creativity 8.94, Content 8.79; Developer Award 7.61). Fonte: [awwwards.com/sites/prometheus-fuels](https://www.awwwards.com/sites/prometheus-fuels). **Il "Site of the Year 2021" non l'ho potuto verificare** (vedi *Non verificato*)
- **Studio**: **Active Theory** (Los Angeles)
- **Anno**: 2021 (build del bundle letto: 15/04/2021; privacy policy in vigore dal 14/04/2021)
- **Letto il**: 13/08/2026

---

## Cosa tratta il sito

E' il sito di una **startup di chimica industriale** uscita da Y Combinator che costruisce
una macchina, il **Titan Fuel Forge**, che prende CO2 e acqua dall'aria e, con elettricita'
da sole e vento, li ricombina in benzina, diesel e carburante per aerei.

Dentro il sito ci sono cinque cose:

1. **Un racconto giocabile in due capitoli** in cui **si guida un'automobile** attraverso
   un mondo 3D e si entra dentro l'impianto. E' lungo **51 schermate di scroll**
   (28 il capitolo 1, 23 il capitolo 2 — numeri letti nel codice, non stimati).
2. Una pagina **Technology** che smonta l'impianto in **quattro stadi**, ognuno con un
   video dedicato e uno sfondo che alterna beige e nero.
3. Una pagina **Mission**, 13 blocchi di testo lungo: il manifesto.
4. Una sezione **On the Road** (news), archivio articoli in HTML normale.
5. Un **modulo email** che e' l'unica conversione del sito.

## Cosa vende, e qual e' l'obiettivo finale

**Vende una cosa che nessuno puo' vedere**: che una macchina faccia benzina dall'aria allo
stesso prezzo di quella scavata da terra. Nel 2021 non c'era niente da comprare: l'azienda
raccoglieva capitale.

L'obiettivo dichiarato e' **raccogliere email**. L'unico modulo del sito ha questo occhiello,
che dice tutto:

> `STAY UP TO DATE WITH OUR PROGRESS AND HOW YOU CAN SUPPORT US`

L'obiettivo vero e' un altro: **rendere credibile e memorizzabile un processo chimico in
quattro stadi a gente che non ha una laurea in chimica**, e farlo con abbastanza spettacolo
da finire sul tavolo di chi firma assegni. Un'azienda che sa spiegare cosi' bene la propria
macchina sembra un'azienda che la macchina ce l'ha davvero. **E' una raccolta fondi
travestita da videogioco.**

## A chi

Tre compratori sovrapposti, serviti dallo stesso oggetto:

- **L'investitore** (venture capital, energy fund). Sa cos'e' la cattura diretta dell'aria
  e sa che di solito costa troppo. Teme la solita promessa "green" senza numeri. Il sito gli
  risponde con **numeri specifici** (9 kilotoni di CO2 → un milione di galloni l'anno;
  4,5 milioni di kg di O2 = 450 acri di bosco; −90% il prezzo del solare in dieci anni) e con
  **nomi propri di componenti** (Faraday Reactor, Maxwell Core, nanotubi di carbonio).
- **Il giornalista / il curioso tecnologico**, che deve poter raccontare il processo dopo
  averlo visto una volta sola.
- **Il pubblico generico**, a cui interessa solo che l'auto continui ad andare. Per lui c'e'
  il capitolo 2, che non parla di chimica ma di viaggio in macchina, camion, aerei e whisky.

Cosa deve pensare uscendo: *non e' un sogno, e' una macchina, ed e' gia' disegnata pezzo per
pezzo*.

## L'esperienza progettata

**E' un videogioco di guida in cui la strada e' la spiegazione.**

Non e' una pagina che si scorre passivamente: si **guida un'automobile** attraverso un
paesaggio 3D, e la macchina, arrivata all'impianto, **ci entra dentro**. La spiegazione
tecnica non e' un blocco di testo accanto a un disegno: e' **il posto in cui ti trovi**.
Quando il testo dice "potenti ventole tirano l'aria dentro la torre di recupero del
carbonio", tu sei dentro la torre, e la ventola gira davvero (c'e' uno
`SpinningFanShader` con `uSpeed: 25`).

Il ritmo e' scandito da frasi brevissime, tre righe alla volta. Sono **quattordici** nel
capitolo 1 e **dieci** nel capitolo 2 (elenco completo piu' sotto, testuale).

**Ci sono tre e solo tre azioni in tutto il sito** — le ho lette nello storyboard, sono
esattamente queste, e sono il vero indice del racconto:

| # | dove | cosa dice a schermo (desktop) | cosa dice sul telefono |
|---|---|---|---|
| 1 | scena `carflyaround`, al 35–52% | `HOLD SPACEBAR TO ACCELERATE THE CAR` | `TAP AND HOLD TO ACCELERATE THE CAR` |
| 2 | scena `Molecules`, al 35–65% | `HOLD SPACEBAR TO ENERGIZE THE MOLECULES` | `TAP AND HOLD TO ENERGIZE THE MOLECULES` |
| 3 | scena `gasstation3`, al 45–110% | `HOLD SPACEBAR TO FILL THE TANK` | `TAP AND HOLD TO FILL THE TANK` |

Tre gesti, uno per atto: **parti, trasforma, fai il pieno.** E' la struttura del processo
industriale trasformata in tre pulsanti.

Cosa deve fare il visitatore, passo per passo:

1. Aspettare il caricamento (una barra di avanzamento vera, non finta).
2. Leggere la promessa sulla prima schermata.
3. **Tenere premuto e accelerare.** Da li' non e' piu' un lettore, e' un pilota.
4. Entrare nell'impianto (`Let's dive into a titan fuel forge`).
5. **Tenere premuto e "energizzare le molecole"** — cioe' fare lui, con la mano, lo stadio 2
   del processo chimico.
6. Attraversare gli stadi 3 e 4.
7. **Tenere premuto e fare il pieno**, e vedere il contatore della CO2 andare a zero.
8. Vivere il capitolo 2: il mondo dopo.
9. Lasciare l'email.

**L'immagine che resta**: il **cruscotto**. Mentre guidi, in basso a destra c'e' il quadro
strumenti dell'auto con due lancette: a sinistra il carburante, a destra le emissioni. E la
seconda scende mentre la prima sale.

## Come e' organizzata la persuasione

Costruita al contrario rispetto a un sito industriale normale, ed e' questa la lezione.

| dove | cosa | quando arriva |
|---|---|---|
| **Promessa** | `We remove CO2 from the air and turn it into gasoline & jet fuel` + `Zero Net Carbon Fuels` | schermata 1, prima di qualunque interazione (`start: .001, end: .12`) |
| **Il problema** | `For centuries, the way we've made fuel has choked the air with CO2, dangerously warming the planet` | 55–80% della prima scena |
| **La domanda** | `But what if we could remove this CO2?` | 65–90% della prima scena |
| **La prova visiva** | i quattro stadi vissuti da dentro l'impianto | schermate 13–28 |
| **La prova numerica** | i cruscotti con numeri veri (16 GAL / 314 LBS CO2 / 2137 MILES / 56 TONS) | dentro le scene, come strumenti |
| **La prova tecnica** | `In a year, a single Titan Fuel Forge turns 9 kilotons of atmospheric CO2 into one million gallons` | pagina Technology, fuori dal racconto |
| **Il prezzo** | non c'e' listino. Il "prezzo" e' `That cost the same as fuels extracted from the ground` — la sola obiezione che conta per questo prodotto | schermate 11–14 |
| **Chiamata all'azione** | `JOIN THE ENERGY REVOLUTION` + modulo email | in fondo, e sempre raggiungibile dal menu (`Connect`) |

**Il punto piu' importante di tutta la scheda**: la promessa completa sta **nella prima
schermata**, e nel `<title>` e nella meta description, in una frase sola che contiene sia
il come sia il cosa sia l'obiezione:

> `We remove CO2 from the air and turn it into gasoline and jet fuel. Our fuels are the
> first zero net carbon fuels that can compete with fossil fuels on price.`

**Cosa arriva a chi non scorre fino in fondo** — e sono quasi tutti. Arriva **tutto il
messaggio commerciale**: la prima scena e' alta 10 schermate ma il testo di apertura sta fra
lo 0,1% e il 12%, cioe' **in una schermata sola**. Chi se ne va subito ha gia' letto cosa
fanno, con cosa, e perche' regge economicamente. Quello che perde e' la **credibilita'**,
che sta tutta nel viaggio.

Il sito e' progettato in modo che **la parte breve venda l'idea e la parte lunga venda
l'azienda.** E' l'unico modo sensato di costruire 51 schermate senza buttarle via.

## Idea regista

**La spiegazione e' un viaggio in macchina: si guida dentro la fabbrica, ogni stadio del
processo chimico e' un posto che si attraversa invece di un paragrafo che si legge, e ogni
numero e' uno strumento sul cruscotto invece che una cifra in un testo.**

## Il momento

**`HOLD SPACEBAR TO ENERGIZE THE MOLECULES`.**

Non e' la prima interazione (quella e' accelerare l'auto, ed e' solo un aggancio). E' la
seconda, e cade **al 35–65% della scena `Molecules`, alta 9 schermate** — cioe' esattamente
al centro geometrico del capitolo 1, dentro l'impianto.

In quell'istante il visitatore **esegue con la mano lo stadio 2 del processo chimico**: tiene
premuto e le molecole si caricano di elettricita'. Il testo che sta a schermo in quel momento
e': `As they stream into the forge, the molecules are "energized" by renewable power to form
hydrocarbons that can be made into any type of fuel`.

Il colore dell'istruzione e' `#efcd7c`, un giallo caldo diverso dall'arancione di tutto il
resto del sito: e' l'unico posto dove compare.

E' l'istante che chiude il contratto: **chi ha *fatto* la reazione ricorda la reazione.**

Il secondo momento e' `HOLD SPACEBAR TO FILL THE TANK` alla stazione di servizio, dove il
cruscotto mostra a sinistra il serbatoio che si riempie (`16 GAL — GAS — Zero Net Carbon`) e
a destra il contatore delle emissioni che cala da `314 LBS CO2` verso il basso, con le due
etichette `Polluted Past` in alto e `Net Zero Future` in basso.

## Struttura, sezione per sezione

**Questa tabella e' letta nel codice** (`Config.PAGE` in `app.js`), non stimata. La colonna
`height` e' il valore vero in altezze di viewport.

### Capitolo 1 — `FUEL FROM THE AIR` — 28 schermate

| # | scena (nome nel codice) | cosa mostra | cosa fa l'utente | schermate | bloom |
|---|---|---|---|---|---|
| 1 | `carflyaround` | la home, poi l'auto in volo sopra il paesaggio; 6 blocchi di testo dal 13% al 90% | legge, poi **tiene premuto per accelerare** (35–52%) | **10** | 0.25 |
| 2 | `forgefield2` | il campo di Titan Fuel Forge con le turbine | scorre | **3** | **0** |
| 3 | `fanscene2` | le ventole di aspirazione | scorre | **2** | 0.1 |
| 4 | `Molecules` (classe, non layout) | l'interno dell'impianto: molecole, elettricita', membrana | **tiene premuto per energizzare le molecole** (35–65%) | **9** | 0.25 |
| 5 | `gasstation3` | la stazione di servizio | **tiene premuto per fare il pieno** (45–110%) | **4** | 0.25 |

### Capitolo 2 — `THE ROAD TO NET ZERO` — 23 schermate

| # | scena | cosa mostra | strumento sul cruscotto | schermate | bloom |
|---|---|---|---|---|---|
| 1 | `GasStation2` | si riparte dalla pompa | — | 2 | 0.25 |
| 2 | `route66` | la strada del deserto (cactus, alberi di Giosue', cartelli) | — | 2 | 0.25 |
| 3 | `trucks` | i camion, visti anche **da dentro la cabina** | `truck`: 2137 → 0 MILES, 356 GAL DIESEL, `Origin: Port of Los Angeles / Destination: Chicago`, 4 TONS CO2 | 2 | 0.25 |
| 4 | `planeLayout` | l'aereo che passa sopra | `plane`: 2475 → 0 MILES, 5325 GAL JETFUEL, `Origin: JFK / Destination: LAX`, 56 TONS CO2, colore `#38807a` | 2 | 0.25 |
| 5 | `oilfieldtransform` | **il campo petrolifero che si trasforma** in impianto Prometheus | — | 2 | 0.25 |
| 6 | `solarfield2` | il campo fotovoltaico | — | **4** | 0.25 |
| 7 | `distill` | la distilleria (bottiglie, tavoli) | `spirits`: 750 ML SPIRITS Zero Net Carbon, 383 GRAMS CO2 — **a sinistra**, non a destra | 2 | 0.25 |
| 8 | `campshopsmall` | il negozio di articoli da campeggio | `store`: 100% → 0% INVENTORY, 1159 LBS GOODS `banked-carbon`, 1.8 TONS CO2 **negative** | 2 | **1.0** |
| 9 | `tents` | le tende, il campeggio | `camp`: 216 → 0 MILES, 13.5 GAL GAS, `Origin: Los Angeles city limits / Destination: Mojave Desert`, 265 LBS CO2 | 2 | 0.8 |
| 10 | `campfire` | il fuoco da campo sotto le stelle, con il razzo lontano | — | **3** | **1.5** |

Il **bloom sale con la temperatura emotiva**: `0` nel campo delle turbine, `0.25` in strada,
`1.5` sul fuoco da campo finale. E' una scelta di regia scritta in un numero.

### Il resto

| sezione | com'e' fatta |
|---|---|
| **Technology** | 6 sezioni con lo sfondo che **alterna beige e nero**: `landing` → `titan-fuel-forge` (beige) → `carbon-salvage` (nero) → `charging` (beige) → `molecular-sorting` (nero) → `custom-assembly` (beige). Ognuna con il suo mp4 |
| **Mission** (`aboutMain`) | height `1`, ma con uno sfondo spaziale (`about/000_Space.jpg`, `stars-repeat.jpg`) e un `AboutSpaceBG` shader con texture in `MIRROR_REPEAT` |
| **On the Road** (news) | pagina HTML vera (`NewsPageUI`), griglia di articoli, il primo a piena larghezza |
| **Connect** | `ContactSection` + `ContactUI` |
| **Privacy** | `PrivacyUI`, testo servito come **Quill Delta JSON** |
| **Error** | `ErrorSection` + `ErrorUI` — c'e' una 404 progettata, con il suo blocco di colore `#e74833` |

**Sopra tutto, sempre presente:**

- **Una cornice beige attorno a tutto lo schermo**: quattro `div.border` `position:fixed`,
  `10px` su desktop e `5px` su telefono, colore `#FDF0E1`, `z-index 100`. Il sito e'
  incorniciato come un film. E lo stesso bordo esiste **anche nel post-processing**
  (`SceneComposite uBorderColor #fcefe0`, `uBorderWidth 0.008`).
- **Logo in alto a sinistra** che cambia forma: e' il **wordmark** completo finche' si e' sulla
  home e lo scroll e' sotto 0.1, poi **diventa il solo simbolo**. Il fondo del logo cambia
  colore per pagina (arancione, beige).
- **Hamburger in alto a destra**, tre righe che diventano una X: `rotation:45, y:10` in 600ms
  `easeOutCubic`, con la riga centrale che sparisce (`scale:0, x:-100`).
- **Un indicatore di avanzamento verticale** disegnato in WebGL (`ScrollProgressShader`):
  largo 3 unita', alto il **65% dello schermo**, colore beige, diviso in tanti segmenti
  quante sono le sezioni (`uSectionAmount: views.length`).
- **Un invito a scorrere** (`ScrollHintItemShader`): un cerchio (`ui/star-circle.png`) e una
  freccia in giu' (`ui/down-arrow.png`).
- **Il cruscotto** (`DashboardOverlay`), in basso a destra (in basso a sinistra nella scena
  della distilleria).

## L'esperienza in ordine di tempo

**Prima del secondo 0** — fondo `#161616` pieno schermo, `<body>` completamente **vuoto**.
Nel `<head>` c'e' un blocco di CSS critico inline (≈33 KB) e uno script che sceglie il bundle:

```js
let p = 'app';
try { eval('async () => {};'); } catch(e) { window._ES5_ = true; p = 'es5-'+p; }
```

Cioe': prova a compilare una funzione `async`; se il browser non ce la fa, carica una build
ES5 separata. Poi inietta `/assets/js/app.js?<timestamp>` in `async`.

**Caricamento** — due anelli SVG sovrapposti al centro: uno ruota piano
(`animation: rotate 50s linear infinite`, a `opacity:.3`), l'altro **si disegna**
(`stroke-dasharray:1200; stroke-dashoffset:2400; animation: draw 4s linear infinite`).
Colore `#fdf0e1`, entrambi scalati a `.45`.

**La barra e' vera**: l'`AssetLoader` conta `Assets.list().filter(["shaders","uil","quill"])`
piu' 3 passi aggiuntivi, e l'ultimo (`_loader.trigger(3)`) scatta solo quando la **prima
sezione interattiva** e' pronta (`InteractiveSection.INITIAL_LOADED`). Quando il caricatore
finisce, il `ViewController` diventa visibile, l'interfaccia entra e il `LoaderView` viene
**distrutto**, non nascosto.

**Home** — logo, `Zero Net Carbon Fuels`, `We remove CO2 from the air and turn it into
gasoline & jet fuel`, CTA `MISSION`. Sta fra lo 0,1% e il 12% della prima scena.

**Capitolo 1, in ordine, con le percentuali vere di comparsa** (testi testuali dal CMS):

| % della scena | testo |
|---|---|
| 13–28% | `Since the beginning,\nwe've been driven\nto explore` |
| 22–37% | `Called by the\nopen road, and the\nspirit of adventure` |
| 31–46% | `To seek the thrill\nof heading into\nthe unknown` |
| **35–52%** | **istruzione: `HOLD SPACEBAR TO ACCELERATE THE CAR`** |
| 40–58% (a destra) | `But to go where we want\nto go next, we need a\nnew kind of fuel` |
| 55–80% (a destra, in nero) | `For centuries, the way we've\nmade fuel has choked the\nair with CO2, dangerously\nwarming the planet` |
| 65–90% (a destra, in nero) | `But what if we could\nremove this CO2?` |

Si noti la **sovrapposizione**: ogni frase entra prima che la precedente sia uscita. Non ci
sono stacchi, e' un flusso.

Poi, scena `forgefield2` (3 schermate):
- 10–70%, in nero: `And turn it into\nzero net carbon fuels`
- 35–110%, in nero: `That cost the same as\nfuels extracted from\nthe ground`

Scena `fanscene2` (2 schermate):
- 10–100%, in nero, a destra: `Let's dive into\na titan fuel forge`

Scena `Molecules` (9 schermate — la piu' lunga del capitolo dopo l'apertura):
- 0–15%: `Strong fans draw air\ninto our carbon\nsalvage tower` — con il link `Our Technology`
- 10–25%: `As the air whips past,\na powerful waterfall\nstrips it of CO2 and\nwater molecules` — link `Our Technology`
- 28–60%: `As they stream into the forge,\nthe molecules are "energized"\nby renewable power to form\nhydrocarbons that can be made\ninto any type of fuel` — link `Our Technology`
- **35–65%: istruzione `HOLD SPACEBAR TO ENERGIZE THE MOLECULES`, colore `#efcd7c`**
- 52–70%: `Because we're turning electrical\nenergy from solar and wind into\nthe chemical energy of fuels,\nyou can think of our fuels as\n"liquid electricity."\n\nWe call them "electrofuels."` — link `Our Technology`
- 75–110% (in alto a destra): `The only byproduct of our\nprocess is oxygen. It actually\ncleans the air around it`

Scena `gasstation3` (4 schermate):
- 5–55% (a destra): `The result is zero net carbon\ngasoline, diesel, and jet fuel\nthat are atomically identical\nto fossil fuels, cost the same,\nand can run in any engine`
- 45–110%: `The moment you fill\nyour tank, you drive\ninto a whole new era`
- 58–120%, **colore teal `#66B4AD` e fusione additiva**: `the era of Net\nZero Emissions`
- **45–110%: istruzione `HOLD SPACEBAR TO FILL THE TANK`, colore teal**
- **50–100%: il cruscotto `fillup`** entra in scena

Nota: l'ultima frase e' in **teal con `additive: true`**, cioe' non e' dipinta sopra
l'immagine ma **si somma alla luce**: brilla. E' l'unico testo del capitolo trattato cosi'.

**Capitolo 2, in ordine** (una scena per frase, ritmo costante 2 schermate ciascuna salvo
il campo solare che ne prende 4 e il fuoco 3):

1. `As you pull away,\nthe surge of\nfreedom is classic` (40–110%)
2. `But this is no ordinary\nroad trip. You're running\non fuel that doesn't\nharm the planet` (20–110%, scena `route66`)
3. `You pass big rigs, which\nhaul 70% of U.S. freight.\nThey're powered by\nzero net carbon diesel` + cruscotto camion
4. `Overhead, a jet soars.\nIts cross-country flight\nis 100% carbon neutral` (in nero) + cruscotto aereo
5. `The old, polluting 20th\ncentury technology is\nwhere it belongs` (a destra) + `in the past` (teal, additivo) — mentre il campo petrolifero si trasforma
6. `At Prometheus,\nwe make energy in\na brand new way\n— from the air` + `Using renewable power,\nwe can turn atmospheric CO2\ninto all kinds of things` (4 schermate)
7. `From zero net\ncarbon spirits,\nlike gin and whiskey` (in alto) + cruscotto distilleria
8. `To carbon negative\ngoods that store\ntheir CO2 forever` + cruscotto negozio (**CO2 negativa**)
9. `The goal is a world\nof limitless potential,\nwhere both humans\nand the planet can thrive` + cruscotto campeggio
10. `Net Zero may be our\nnearest destination,\nbut the journey is\njust beginning` (50–110%), con sottotitolo `Learn more about how we make our products` e il link `Our Technology`

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| **Tempo delle animazioni 3D** | tutto il movimento e' **quantizzato nel tempo** | uniform `uPosterizeTime` | `floor(time * uPosterizeTime) / uPosterizeTime` (dal GLSL vero) | **la cosa piu' importante del sito**: valori usati `60`, `27`, `24`, `12`, `6`. A 12 la scena si muove 12 volte al secondo, cioe' "animazione sui due" da cartone animato. Un motore real-time fatto sembrare un film disegnato a mano |
| Camera | posizione, `lookAt`, `fov`, parallasse col mouse | scroll + mouse | **lerp `0.2` su desktop, `0.5` su telefono** (`_this.camera.lerp = Device.mobile ? .5 : .2`) | la camera insegue lo scroll con inerzia; sul telefono e' piu' pronta perche' il dito e' meno preciso |
| Parallasse | ampiezza per scena, uniform `moveXY` | mouse | — | es. scena `campfire`: `moveXY [0.35, 0.1]`; `ch1intro` in apertura `[0.5, 0]` (solo orizzontale) |
| **Velocita' del mondo** | `ViewController.SPEED_MULTI` da 0 a 1 | **tasto tenuto premuto** | `2500ms easeOutCubic` | tenendo premuto non "parte un'animazione": **cambia il moltiplicatore di velocita' di tutta la scena** |
| Motore (audio) | `engine.mp3` volume 0→1, `engine-fade.mp3` volume 0→0.5 | stesso tasto | `3000ms` e `4000ms` `easeOutSine`; in rilascio `500ms` | il suono del motore sale in 3 secondi e scende in mezzo: accelerare *si sente* prima che si veda |
| **Scroll → distorsione** | `uScrollDelta = 1 + clamp(-.2, .2, delta*10)` | **velocita' dello scroll** | delta sullo scroll smussato | scorrendo veloce lo shader di transizione si deforma. Il movimento della rotella entra dentro l'immagine |
| Ventole | rotazione attorno a `uAxis [0,1,0]` | tempo | `uSpeed 25` (scena `fanscene`), `-7` (scena `molecules`) | girano in verso opposto nelle due scene |
| Ruote dell'auto | `uWheelSpeed` nello `PBRCarShader` | velocita' | — | l'auto ha anche un `uWiggle [0.002,0,0,0]`: **trema di 2 millesimi**. Non e' mai perfettamente ferma |
| Molecole | `uExplode` (da `-7.8` a `+2.96`), `uWobble`, `uRotationSpeed 0.02` | scroll / interazione | — | "energizzare" le molecole significa muovere `uExplode` |
| Testo | ogni frase entra e esce su una finestra `start`→`end` di scroll | scroll | — | le finestre si **sovrappongono** sempre di ~10 punti percentuali |
| Testo (colore) | le parti in grassetto sono **arancioni**, il resto beige | markup nel CMS | — | `Text3D.onCreateShader` aggiunge `uNormalColor: #FDF0E1` e `uBoldColor: #E74833`. Il grassetto non e' piu' pesante: e' di un altro colore |
| Testo (superficie) | `WaveTextShader` con `tNoise: noise/dirnoise3.jpg`, `uTimeScale: .39` | tempo | — | il testo non e' piatto, ondeggia leggerissimo |
| Cruscotto | entra e esce su finestre di scroll; scala con la larghezza | scroll + resize | `scale = Math.range(Stage.width, 0, 1800, 0, 1)` | sotto 1800px si rimpicciolisce proporzionalmente |
| Post-processing | `uNoise: 1`, `uGrunge: 0.35`, `uVignette: 0.3`, `uRGBShift`, `uUVScale: 0.45`, `uRotation: -25`, `uBorderColor #fcefe0`, `uBorderWidth 0.008` | costante | — | grana + vignettatura + bordo, sempre accesi. Il "grunge" e' due campionamenti della stessa texture (`vUv*2.0` e `vUv*2.2+0.5`) fusi in `blendScreen` e `blendMultiply` |
| Pennellate | `uBrushScale`, `uBrushRotate`, `uBrushBlend` | costante | `blendOverlay(color, brush, uBrushBlend)` su UV ruotate | ogni superficie ha una texture di pennello sovrapposta: e' cosi' che una scena 3D sembra dipinta |
| Bloom | valore per scena, `0` → `1.5` | scena | — | vedi tabella struttura |
| Transizione fra scene | `WaveSceneTransition` con `uTransition` e `uColor0` | cambio scena | — | il colore di transizione globale e' `#e74832` |
| Hamburger | tre righe → X | click | `600ms easeOutCubic`, `rotation:45, y:10` | la riga centrale sparisce con `scale:0, x:-100` |
| Immagine articolo (DOM) | da desaturata a piena: `brightness(.5) sepia(1) grayscale(.3) contrast(1.25)` → `brightness(1) sepia(0) grayscale(0) contrast(1)`; bordo da `#fdf0e1` a `#e74833` | hover | **`150ms ease-out` sul filtro, `1000ms cubic-bezier(.19,1,.22,1)` sul resto** | il filtro e' velocissimo, il movimento lentissimo: reattivita' immediata, moto lento |
| Card articolo → pagina | la card viene **clonata**, messa `position:fixed`, allargata a `calc((100vw/3)*2 + 10rem)`; l'originale diventa `visibility:hidden` | click, classi `_ACTIVE` / `_ACTIVE_V2` | `1000ms cubic-bezier(.19,1,.22,1)` + `width 1000ms cubic-bezier(.455,.03,.515,.955)` | transizione condivisa fatta a mano, senza librerie |
| Frecce prev/next | freccia `±50%`, testo `±20%` e `opacity .5` | hover | `300ms cubic-bezier(.19,1,.22,1)` | due velocita' diverse: effetto di trascinamento |
| Menu, form e social | entrano in ritardo | apertura menu | `opacity 500ms cubic-bezier(.455,.03,.515,.955)` **con 500ms di ritardo** | il menu appare prima, il contenuto dopo |
| Loader | anello che ruota (`50s linear`) + anello che si disegna (`4s linear`) | tempo | — | |

**Librerie di animazione**: nessuna esterna. **Non c'e' GSAP** (nessuna firma nel bundle),
non c'e' three.js. C'e' `tween(oggetto, {prop}, ms, "easeOutSine")`, il sistema interno di
Hydra. Le transizioni dell'interfaccia HTML sono **CSS puro**, con **due sole curve** in
tutto il sito: `cubic-bezier(.19,1,.22,1)` (expo.out) e `cubic-bezier(.455,.03,.515,.955)`
(sine.inOut).

## Colori

**Il palinsesto vero**, letto dall'oggetto `Colors` dentro `app.js` — non stimato,
non da screenshot:

```js
this.value = {
  beige:        "#FDF0E1",
  orange:       "#E74833",
  darkOrange:   "#6e1409",
  orangeYellow: "#FFA300",
  greyishTeal:  "#66B4AD",
  teal:         "#66B4AD",
  darkBlueGrey: "#122A2B",
  dirtyBlue:    "#3BBEA0",
  black:        "#161616"
}
```

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo | `#161616` ("black") | `html, body, #Stage`, fondo delle pagine testuali, blocco di colore del menu |
| testo / crema | `#FDF0E1` ("beige") | testo 3D normale, **la cornice fissa attorno allo schermo**, l'indicatore di avanzamento, gli anelli del loader, i titoli degli articoli |
| accento | `#E74833` ("orange") | **il grassetto dentro il testo 3D**, il titolo `News`, le sottolineature, le istruzioni a schermo, il blocco di colore di Contatti e 404 |
| secondo accento | `#66B4AD` ("teal") | i cruscotti, e le due frasi trattate in additivo: `the era of Net Zero Emissions` e `in the past` |
| giallo unico | `#efcd7c` | **solo** l'istruzione "energize the molecules" |
| giallo/oro | `#FFA300` ("orangeYellow") | usato una volta sola nel codice |
| verde-blu sporco | `#3BBEA0` ("dirtyBlue") | dichiarato ma raro |
| arancione scuro | `#6e1409` | dichiarato |
| blu-verde scuro | `#122A2B` | dichiarato |
| **blu delle emissioni negative** | `#1c87ff` | il numero della CO2 sul cruscotto **quando diventa negativo** (scena del negozio, `banked-carbon`) |
| verde acqua dell'aereo | `#38807a` | tutto il cruscotto della scena aereo |
| rosso hamburger | `#ee2f22` | le tre righe del menu — **un rosso diverso dall'accento**, letto nel CSS |
| grigio interfaccia | `#d8d8d8` | testi del form, cerchi social, campo email |
| bordo nel post-processing | `#fcefe0` | `SceneComposite uBorderColor` — un beige leggermente diverso da quello del DOM |
| colore di transizione | `#e74832` | `SceneComposite uTransitionColor` — un arancione a **un punto** di distanza da quello ufficiale |
| tema browser | `#ffffff` | `<meta name="theme-color">` |
| Safari pinned tab | `#46a0de` | `<link rel="mask-icon" color="#46a0de">` — **unico blu del sito, e non compare in pagina** |

**I colori del mondo 3D sono altri 487**, tutti in `uil.json`, uno per superficie per scena.
Alcuni esempi che fanno capire il metodo:

| scena | uniform | colore |
|---|---|---|
| `campfire` (cielo notturno) | `CutoutShader/Element_16` | `#030b39` (blu quasi nero) |
| `campfire` (fuoco) | `CutoutShader/Element_10` | `#bb4242` |
| `tents` | `Element_16` / `Element_12` | `#7f97d5` / `#5278c5` |
| `gasstation2` (terreno) | `StylizedRoadShader uColor1..4` | `#2d1510`, `#8f4c3e`, `#532f28`, `#813729` |
| `forgefield2` | `uColor1..3` | `#81858d`, `#969eab`, `#939b9f` (grigi freddi) |
| `solarfield2` | `Element_1` | `#a0d2ff` |
| `forgefield2` (pannelli) | `Element_1` | `#288eff` |
| `molecules` (elettricita') | `ElectricityShader uColor` | `#ffd98d` / `uColor0 #ffeab3` |
| cielo di `molecules` | `SkyGradientShader uColor/uColor1` | `#c9be9e` → `#427689` |

I due colori piu' frequenti in tutto il mondo 3D sono `#ffffff` (69 volte) e `#9b9b9b`
(41 volte): la maggior parte delle superfici e' **bianca o grigia**, e il colore arriva
dalle texture e dai gradienti, non dai materiali.

**Nota**: Awwwards dichiara una palette `#2779a7 / #D14836 / #ffffff`. Il `#D14836` e' una
lettura approssimata dell'arancione `#E74833`; il blu `#2779a7` non esiste nel codice — e'
probabilmente il cielo campionato da uno screenshot.

## Tipografia

Due famiglie sole, entrambe **servite in locale** da `/assets/fonts/`. Nessun servizio
esterno: niente Google Fonts, niente Typekit, niente `<link>` a domini terzi.

| livello | famiglia | file | corpo | note |
|---|---|---|---|---|
| Titoloni HTML (`News_Header`, `News_Detail_Title`, `PrivacyUI__title`) | **Mars Condensed** | `marscondensed-regular-TRIAL.otf` | `12rem` desktop, `8rem` ≤960px, `6rem` ≤600px | interlinea `10rem`, maiuscolo |
| Titolo articolo in griglia | Mars Condensed | idem | `4rem` | `line-height:3.4rem`, troncato a 3 righe (`-webkit-line-clamp:3`) |
| Etichette prev/next | Mars Condensed | idem | `3rem` | testo nel `::after` |
| Citazioni | Mars Condensed | idem | `4rem` | filetti sopra e sotto `1px #fdf0e1` |
| **Testo dentro il 3D** (istruzioni, cruscotti) | **Futura LT Bold** | `FuturaLT-Bold.ttf` + atlas `.json` | `12` desktop / `10` mobile (unita' della scena), larghezza `450`, `lineHeight 1.5` | e' geometria, non HTML |
| Corpo lungo HTML | Futura LT Medium | `FuturaLT-Medium.ttf` | `1.8rem` | `line-height:2.4rem` |
| Date, etichette | Futura LT Medium | idem | `1.4rem` | maiuscolo |
| Titolo form | Futura LT Bold | idem | `2rem` | colore `#e74833` |

Nel bundle sono referenziati **cinque pesi** di Futura LT: `Light`, `Book`, `Medium`,
`Bold`, `Heavy`. Piu' una variante web di Mars (`marscondensedweb-regular-TRIAL`).

**Il dettaglio che vale la scheda**: i file si chiamano `marscondensed-regular-TRIAL.otf` e
`marscondensedweb-regular-TRIAL`. E' la **versione di prova** del carattere, spedita in
produzione su un sito premiato a livello internazionale.

**Un secondo dettaglio buffo**: dentro `app.js` c'e' ancora l'oggetto tipografico di serie di
Hydra — `FONT_FAMILY = {title:"Aktifo-B", body:"Aktifo-B Book", button:"Aktifo-B Bold"}` —
mai sostituito. E' il boilerplate dello studio rimasto nel codice di produzione.

**Come e' gestita la scala** — non ci sono breakpoint tipografici sparsi: c'e' **un rem
fluido** sulla radice, e tutto il resto e' in `rem`:

```css
html, body, #Stage { font-size: calc(100vw/1440*10); }
@media (min-width:601px) and (max-width:960px) { font-size: calc(100vw/768*10); }
@media (max-width:600px)                       { font-size: calc(100vw/375*10); }
```

`1rem` = 1/144 della larghezza schermo su desktop, 1/76,8 su tablet, 1/37,5 su telefono. Il
sito non "si adatta", **si scala**, e i tre numeri (1440 / 768 / 375) sono i tre file di
progetto. E' il trucco piu' rifacibile di tutta la scheda.

## Testi veri

**Meta / condivisione**
- `<title>`: `Prometheus Fuels`
- description e `og:description`: `We remove CO2 from the air and turn it into gasoline and jet fuel. Our fuels are the first zero net carbon fuels that can compete with fossil fuels on price.`

**Home**
- header: `Prometheus`
- subhead: `Zero Net Carbon Fuels`
- body: `We remove CO2 from the air and turn it into gasoline & jet fuel`
- CTA: `MISSION`

**Menu**
- `home` → `Home`
- `about` → `Mission`
- `technology` → `Technology`
- `news` → `On the Road`
- `contact` → `Connect`

Nessuna voce si chiama come ci si aspetterebbe. "Chi siamo" e' `Mission`, "blog" e'
`On the Road`, "contatti" e' `Connect`. Le etichette sono coerenti col viaggio.

**Le tre istruzioni a schermo** (composte a runtime, maiuscolo):
- `HOLD SPACEBAR TO ACCELERATE THE CAR` / `TAP AND HOLD TO ACCELERATE THE CAR`
- `HOLD SPACEBAR TO ENERGIZE THE MOLECULES` / `TAP AND HOLD TO ENERGIZE THE MOLECULES`
- `HOLD SPACEBAR TO FILL THE TANK` / `TAP AND HOLD TO FILL THE TANK`

(nel CMS c'e' anche la variante `Hold Space Bar to Accelerate`, non usata da questa build)

**Il link ricorrente dentro il racconto**: `Our Technology` — compare quattro volte, sempre
accanto ai passaggi tecnici.

**I cruscotti, testuali** — sono testi anche questi, e sono i piu' persuasivi del sito:

| scena | strumento sinistro | strumento destro |
|---|---|---|
| stazione di servizio | `F` / `E`, `16 GAL`, icona `gas`, `GAS`, `Zero Net Carbon` | `314 LBS`, icona `molecule`, `CO2`, `Emissions`, con `Polluted Past` in alto e `Net Zero Future` in basso |
| camion | `2137 MILES` → `0 MILES`, `356 GAL`, `DIESEL`, `Zero Net Carbon` | `Origin: Port of Los Angeles` / `Destination: Chicago`, `4 TONS CO2 Emissions` |
| aereo | `2475 MILES` → `0 MILES`, `5325 GAL`, `JETFUEL`, `Zero Net Carbon` | `Origin: JFK` / `Destination: LAX`, `56 TONS CO2 Emissions` |
| distilleria | `PARTY` / `NIP`, `750 ML`, icona `whiskey`, `SPIRITS`, `Zero Net Carbon` | `383 GRAMS CO2 Emissions` |
| negozio | `100%` → `0% INVENTORY`, `1159 LBS`, icona `camping`, `GOODS`, `banked-carbon` | `1.8 TONS CO2 Emissions` — **negativo**, in blu `#1c87ff` |
| campeggio | `216 MILES` → `0 MILES`, `13.5 GAL`, `GAS`, `Zero Net Carbon` | `Origin: Los Angeles city limits` / `Destination: Mojave Desert`, `265 LBS CO2 Emissions` |

**Technology — i titoli delle sei scene**
`HOW WE<br>MAKE<br>OUR FUEL` · `INSIDE A` + `TITAN FUEL<br>FORGE` · `CARBON<br>SALVAGE` ·
`CHARGING` · `MOLECULAR<br>SORTING` · `CUSTOM<br>ASSEMBLY`

**Technology — i corpi, testuali**

> **Titan Fuel Forge** — `The Prometheus Titan Fuel Forge pulls CO2 and water from the air and combines them with electricity from solar and wind power to make zero net carbon fuels.`
>
> `In a year, a single Titan Fuel Forge turns 9 kilotons of atmospheric CO2 into one million gallons of gasoline, diesel, or jet fuel. These fuels are molecularly identical to those we put into our cars and planes today.`

> **Stage One — Carbon Salvage** — `In Stage One, CO2 is removed from the air. Industrial fans suck air in and blow it across a waterfall that absorbs CO2 and additional water.`

> **Stage Two — Charging** — `In Stage Two, the salvaged CO2 encounters electricity in an electrochemical stack called the Faraday Reactor. The electricity 'charges' or 'energizes' the carbon with hydrogen molecules from the water to create long-chain alcohols.`
>
> `During this step, oxygen is released, making our Forge a kind of mechanical forest. How much oxygen? In one year, a single Titan Fuel Forge will emit 4.5 million kilograms of O2 or roughly the same amount of oxygen emitted by 450 acres of forest.`

> **Stage Three — Molecular Sorting** — `In Stage Three, the alcohols are harvested using a special type of membrane called the Maxwell Core. Its pores are carbon nanotubes, which allow alcohols through while rejecting water.`

> **Stage Four — Custom Assembly** — `In Stage Four, a final catalyst step combines the alcohols and recovers water. This step can be customized to produce gasoline, diesel, or jet fuel.`

**Mission — i passaggi che portano il peso**

> `Prometheus was founded to achieve an audacious goal - to replace all oil and gas with zero net carbon fuels made from CO2 in the air.`
>
> `Ever since, we've been asked two questions. **Why now?** And **what makes us think we can do it?**`
>
> `The climate crisis is the greatest threat humankind has ever faced. No less than the fate of the planet and all the life it supports hang in the balance. The stakes could not be higher.`
>
> `Engineers have known how to make synthetic fuel from the air for nearly a century, but only recently has it been possible to make zero net carbon synthetic fuel at a price that can compete with fossil fuels.`
>
> `Our answer here is also simple - We know the task is great. But the technology exists.`
>
> `One development that unlocked this change was the tremendous drop in the price of electricity from solar and wind—over 90% in the last decade.`
>
> `The only inputs to our process are air and renewable power. The only outputs are fuel and oxygen. There are no agricultural inputs and no waste products.`
>
> `We also know that in order to succeed, our fuels can't just be as good as fossil fuels, they have to be better. That's why we've designed them to be high-performance and clean-burning. Most importantly, our fuels will cost the same or less than fossil fuels.`
>
> `We are propelled by the future we imagine—one in which everyone who wants to can experience the joy of a road trip, the thrill of flight, and, one day soon, the humbling awe of viewing the Earth from orbit.`
>
> `We invite you to imagine this future, and if you find it as inspiring as we do, we hope you'll join us.`

La struttura della pagina Mission e' **due domande e due risposte, dichiarate**:
"Why now?" → la crisi climatica + il crollo del prezzo del rinnovabile.
"What makes us think we can do it?" → lo stack tecnologico proprietario.
E' un pitch deck riscritto in prosa.

**Contatto / newsletter** — il modulo intero:
- titolo: `JOIN THE ENERGY REVOLUTION`
- occhiello: `STAY UP TO DATE WITH OUR PROGRESS AND HOW YOU CAN SUPPORT US`
- campi: `First Name` (`firstName`), `Last Name` (`lastName`), `Email Address` (`emailAddress`)
- errore campi: `Please fill in all fields`
- errore email (scritto nel codice, non nel CMS): `Please verify your email address and try again`
- successo: `Thank you for joining us.`
- disclaimer: `We are collecting this information so that we can contact you in the future with updates about our product. We will never share it with any third party companies and you may unsubscribe at any time by following the instructions in the emails you receive.`

**Il modulo nel menu** e' piu' corto: un solo campo email con **una freccia disegnata a CSS**
(tre `div` da `.15rem`: due ruotati a ±45° con `transform-origin: top right`, uno dritto da
`3.5rem`) e una **checkbox quadrata** da `3.5rem` con `border:.15rem solid #d8d8d8` e
`border-radius:.7rem`. Nessuna icona, nessuno SVG: forme costruite con i bordi.

**Altro**
- email pubbliche: `info@prometheusfuels.com`, `legal@prometheusfuels.com`
- privacy in vigore dal `04/14/2021` — il giorno prima della build del bundle

## Mobile

**Cambia molto piu' del layout: cambia il gesto, la camera e il testo delle istruzioni.**

**Il gesto.** La barra spaziatrice non esiste, quindi la stringa e' costruita a runtime:

```js
let text = (Device.mobile ? "TAP AND HOLD TO\n" : "HOLD SPACEBAR TO\n") + _config.copy;
```

Non e' un fallback: e' **la stessa meccanica** (tieni premuto → `SPEED_MULTI` sale a 1 in
2,5 s) con un dito invece che con un tasto. Il desktop ascolta `keyCode 32` (con
`preventDefault` per non far scrollare la pagina), il telefono ascolta `touchstart` /
`touchend`.

**La camera.** La scena di apertura ha **due inquadrature diverse**, non un ritaglio:

| | desktop | telefono |
|---|---|---|
| `startCamera position` | `[1.22, -1.56, -9.44]` | `[-2.9, -1.35, -9.6]` |
| `startCamera groupPos` | `[2.95, 2.23, 0]` | `[0.1, 2.16, 0]` |
| `rotation` | `[2, -0.2, 0]` | `[0, 0, 0]` |
| `fov` | 30 | 30 |
| inerzia camera | `lerp 0.2` | **`lerp 0.5`** |

Su telefono l'auto e' spostata a sinistra e la camera e' dritta: la composizione e'
**ricostruita per lo schermo verticale**, non stretta.

**Il testo 3D.** Corpo `12` su desktop, `10` su telefono. Le istruzioni salgono di 25 unita'
dal fondo (`Stage.height - max(40, 6% altezza) - (phone ? 10 : 35)`).

**Il cruscotto.** Scala proporzionale: `scale = Math.range(Stage.width, 0, 1800, 0, 1)`, cioe'
piena grandezza solo sopra i 1800px. E in piu', **solo su telefono in verticale**, c'e' una
seconda riscalatura che lo fa stare in `Stage.width - 40`. Non sparisce: si rimpicciolisce
fino a entrare.

**La cornice.** `10px` su desktop, `5px` su telefono.

**Cosa cambia nell'HTML** (breakpoint `600px` e `960px`):
- I titoloni Mars Condensed: `12rem` → `8rem` → `6rem`, interlinea `10rem` → `7rem` → `5rem`.
- La griglia articoli: da **due colonne** a **una**, e il contenitore da
  `calc((100%/3)*2 + 10rem)` a `calc(100% - 5rem)`.
- Le immagini articolo: altezza fissa `20rem` invece del calcolo proporzionale `larghezza * .627`.
- I social si spostano **da destra a sinistra**: da `bottom:4rem; right:5%` a
  `bottom:3rem; left:20px`.
- Le etichette di navigazione **cambiano testo**: il `content` del `::after` passa da
  `PREV ARTICLE` / `NEXT ARTICLE` a `PREV` / `NEXT`. Non e' un troncamento: e' un testo
  diverso scritto in una media query.
- Il corpo delle pagine testuali: da `width:50vw` a `width:100%` (privacy: `95vw` con
  `padding:80px 40px 40px`).
- **L'animazione di espansione della card e' spenta**: su desktop l'immagine cresce con
  transizione `1000ms`; su telefono la stessa regola dichiara `width 0ms, height 0ms, left 0ms`.
  L'effetto **si disattiva da solo** dove costa troppo, e resta solo la dissolvenza.

**E' un'applicazione, non un documento**: il viewport blocca lo zoom
(`maximum-scale=1.0, user-scalable=no, minimal-ui, viewport-fit=cover`), il CSS mette
`user-select:none` e `-webkit-tap-highlight-color:transparent` su `#Stage *`, e l'engine ha
`Mobile.fullscreen()`, `navigator.vibrate()`, blocco di orientamento e gestione del `100vh`
che cambia con la barra del browser.

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| Framework | **Hydra**, l'engine proprietario di Active Theory | **VERIFICATO** | la stringa `Hydra` compare 133 volte nel bundle; `await Hydra.ready()`, `Hydra.LOCAL`, `HydraCSS.style(...)`. In testa al file c'e' l'intestazione ASCII `https://activetheory.net` con la data di build |
| Motore 3D | **motore WebGL scritto in casa**, non three.js | **VERIFICATO** | classi `Scene extends Base3D`, `Mesh extends Base3D`, `PerspectiveCamera extends CameraBase3D`, `Points`, `Group`, `CubeCamera`, `MultiRenderTarget`, `DataTexture extends Texture`, geometrie `BoxGeometry`/`SphereGeometry`/`TorusKnotGeometry`/`IcosahedronGeometry`/`PolyhedronGeometry`/`RingGeometry`/`ConeGeometry extends CylinderGeometry`. Nomi da three.js ma gerarchia diversa (`Base3D` invece di `Object3D`). `THREE.` compare **una volta sola** in tutto il bundle |
| Shader | **40 shader**, tutti precompilati in un file solo `assets/shaders/compiled.vs` (158 KB, 182 `void main`) | **VERIFICATO** | scaricato e letto. Inventario: `CutoutShader`, `StylizedTextureShader`, `StylizedRoadShader`, `StylizedSmokeShader`, `StylizedDiffuseShader`, `StylizedCloudShader`, `StylizedFieldShader`, `StylizedBuildingShader`, `MatcapShader`, `AnimatedInstanceShader`, `ShadowShader`, `PBRCarShader`, `ModifiedGlassShader`, `GlassShader`, `MoleculeShader`, `AnimatedFuelForgeShader`, `SpinningFanShader`, `BonfireShader`, `ElectricityShader`, `WaterShader`, `SkyGradientShader`, `TilingSkyShader`, `SpeedlineShader`, `CloudDistanceShader`, `CloudCover`, `ParticleShader`, `SceneParticlesShader`, `TechnologyBGShader`, `TechnologyGraphicShader`, `InteractiveScrollPageBgShader`, `AboutSpaceBG`, `AboutTopLayerShader`, `StrikeShader`, `HueShader`, `ColorBlockShader`, `FlatColorShader`, `SolidColorShader`, `GreyboxShader`, `IllustratedSmokeShader`, `WaveSceneTransition`, `SceneComposite`, `ChapterCopyShader`, `WaveTextShader`, `ScrollProgressShader`, `ScrollHintItemShader` |
| Struttura pagina | **una sola pagina**, `<body>` vuoto, tutto costruito da JS dentro `#Stage`; `#Stage, #Stage *` sono `position:absolute` | **VERIFICATO** | HTML archiviato. **Da fuori si legge solo il guscio**: nessun contenuto nel sorgente |
| Storyboard | `Config.PAGE` — un oggetto JS con `chapter1`, `chapter2`, `news`, `mission`, `menu`, `error`, `privacy`, `contact`, `newsDetail`; ogni scena ha `layoutName`, `height`, `bloom`, `text[]` con `start`/`end`, `instruction`, `dashboard` | **VERIFICATO** | estratto e letto per intero (4.615 caratteri) |
| Layout / dati scena | `assets/data/uil.json` — **10.328 chiavi**: posizioni camera, uniform di ogni shader per ogni elemento di ogni scena, 219 texture, 487 colori | **VERIFICATO** | scaricato e analizzato |
| Editor visuale | **UIL** (User Interface Layer): l'engine ha un pannello di regolazione in pagina (`UILStorage`, `Utils.query("uil")`, `_this.isPlayground()`, `hotreload:true` sulle texture) | **VERIFICATO** | i designer regolavano gli shader **dal vivo nel browser** e salvavano in `uil.json`. E' il motivo per cui il file esiste |
| Geometrie | formato proprietario `.json` per mesh, caricate a richiesta (`loadGeometry`, `loadSkinnedGeometry`, cache interna) | **VERIFICATO** | elenco: `car/a_body_subd`, `car/b_wheel`, `ch1intro/road`, `ch1intro/cliff2`, `gasstation/pumps1..4`, `gasstation/gaspump2`, `gasstation/signs`, `route66/cactus`, `route66/joshua`, `trucks/truck_interior`, `trucks/airfreshener`, `distillery/structure`, `solarfield/connector_instance`, `molecules/truck` e altre ~70 |
| Texture | **219 file** in 25 cartelle; formato compresso a runtime, con varianti per densita' di pixel (`ASSETS.RES[path]["x"+ratio]`, ratio limitato a 3) e supporto **Basis Universal** | **VERIFICATO** | `uil.json` + `parseResolution()` in `app.js` |
| CMS | **headless proprietario**, JSON statico su Google Cloud Storage (`window._CONFIG_.CMS`); editor rich-text **Quill** (i campi lunghi sono Delta JSON `{"ops":[...]}`) | **VERIFICATO** | HTML + struttura di `index.json` |
| Hosting | **Firebase / Google Cloud** (bucket `prometheus-fuels.appspot.com`); oggi l'origine e' dietro **Fastly** | **VERIFICATO** | nome del bucket; header `X-Served-By: cache-…`, `alt-svc: h3` |
| Audio | `assets/audio/engine.mp3` e `assets/audio/engine-fade.mp3`, con `GlobalAudio3D` (audio spazializzato) | **VERIFICATO** | riferimenti nel bundle |
| Video | mp4 con range request (`206`): `0_Intro.mp4` 5,5 MB, `1_CarbonSalvage_Black.mp4` 5,3 MB, `2_Charging.mp4` 5,1 MB, `3_Sorting_Black.mp4` 4,8 MB, `4_CustomAssemblyGas.mp4` 3,3 MB, piu' `videos/ch1.mp4` 4,1 MB | **VERIFICATO** | elenco CDX dell'archivio |
| Player video | **video.js** | **VERIFICATO** | `assets/css/video-js.min.css` fra gli asset archiviati |
| Font WebGL | atlas/metriche JSON accanto ai `.ttf` (`FuturaLT-Bold.json`, 5,4 KB) | **VERIFICATO** | presenti nell'archivio e usati da `$glText(..., "FuturaLT-Bold", ...)` |
| Accessibilita' / SEO del WebGL | **`GLSEO`**: un livello DOM parallelo (classe `.GLA11y`) che crea un nodo per ogni oggetto 3D interattivo, con `role`, `aria`, `<a href>` e attivazione da tastiera (`Spacebar` / click) | **VERIFICATO** | `GLSEO.objectNode(mesh, seoRoot)`, `mesh.seo.aLink(url, label, options)`, `seo.div.onkeydown` |
| Rilevamento hardware | `Device.mobile` (103 usi), `Device.graphics.webgl.gpu`, `GPU.TIER` / `GPU.M_TIER`, test dedicati `iOSGPUTest` e `MacOSPerf` | **VERIFICATO** | il sito **misura la GPU** e adatta la qualita' |
| Analytics | Google Analytics `UA-160159103-1` | **VERIFICATO** | script nell'`<head>` |
| Error tracking | **Sentry** (`js.sentry-cdn.com/dd3054e8258647d3963aab2ecf5f6b30.min.js`) | **VERIFICATO** | script nell'`<head>` |
| Compatibilita' | build ES5 alternativa scelta con `try { eval('async () => {};') } catch` | **VERIFICATO** | script inline nell'HTML |
| Animazione | sistema interno di Hydra: `tween(obj, {prop}, ms, "easeOutSine")`. **Niente GSAP** | **VERIFICATO** | nessuna firma GSAP/TweenMax/TimelineMax nel bundle |

**Detto onestamente**: il sito e' una single page application WebGL. Il DOM e' vuoto e tutta
l'esperienza vive dentro il canvas. **Quello che so con certezza e' quello che e' scritto nel
codice e nei dati; quello che non so e' come appariva in movimento** — l'app archiviata non
gira, perche' mancano geometrie e texture.

## Peso e prestazioni

Numeri veri, misurati sui file scaricati dall'archivio (dimensioni **decompresse**, fra
parentesi il peso in rete):

| file | peso |
|---|---|
| HTML della home | **34,2 KB** (7,4 KB) — di cui ≈33 KB di CSS critico inline |
| `assets/js/app.js` | **1.130 KB** (324 KB) |
| `assets/data/uil.json` | **737 KB** (104 KB) |
| `assets/shaders/compiled.vs` | **158 KB** (38 KB) |
| CMS `data/index.json` | **41,8 KB** (10,8 KB) |
| geometrie | ~70 file `.json`, non conservati dall'archivio |
| texture | 219 file, non conservati |
| video degli stadi | 5,5 + 5,3 + 5,1 + 4,8 + 3,3 = **≈24 MB** con range request |
| `videos/ch1.mp4` | 4,1 MB |
| audio | 2 file mp3, non conservati |

Quindi **≈484 KB di codice e dati in rete prima di poter iniziare**, piu' geometrie, texture e
audio. Non e' un sito leggero e non prova a esserlo: il caricamento e' una schermata dedicata
con una barra vera.

Non ho **punteggi Lighthouse ne' tempi reali**: il sito non esiste piu' e la versione
archiviata non gira. L'unico giudizio di prestazione documentato e' il punteggio Awwwards di
usabilita', **7.77**, il piu' basso dei quattro — coerente con un sito che chiede attesa,
tastiera e GPU.

Quello che il codice mostra sulle prestazioni e' che il problema era **preso sul serio**:
misurazione della GPU con test dedicati per iOS e macOS, texture in **Basis Universal** con
varianti per densita' di pixel, shader precompilati in un file solo, geometrie caricate a
richiesta con cache, build ES5 separata per i browser vecchi, e **Sentry** in produzione.

## Come si spiega una tecnologia con un sito — la lezione di questo caso

E' il motivo per cui questa scheda esiste. Sette meccaniche, tutte rifacibili.

**1. Il visitatore *esegue* il processo, non lo legge.**
Le tre azioni del sito sono i tre momenti chiave del processo industriale: **accelerare**
(entrare nel racconto), **energizzare le molecole** (lo stadio 2, la reazione
elettrochimica), **fare il pieno** (il risultato). Non c'e' una quarta interazione, e non ce
n'e' una decorativa. Chi ha tenuto premuto per caricare di elettricita' delle molecole ha
capito cos'e' un reattore elettrochimico meglio di chi ha letto tre paragrafi.

**2. Ogni numero diventa uno strumento.**
Il dato non sta in un testo, sta su un **cruscotto** con due lancette: a sinistra quello che
guadagni (galloni, miglia, bottiglie, inventario), a destra quello che eviti (libbre e
tonnellate di CO2), con le etichette fisse `Polluted Past` in alto e `Net Zero Future` in
basso. E quando il prodotto e' a carbonio negativo, **il numero diventa blu**. Un contatore
che si muove mentre guidi vale dieci infografiche.

**3. La spiegazione e' divisa in due strati, con un ponte etichettato.**
Lo strato emotivo (i capitoli) e lo strato tecnico (la pagina Technology) sono **due prodotti
separati con testi diversi sullo stesso fatto**:

| stadio | come lo dice il racconto | come lo dice la pagina tecnica |
|---|---|---|
| 1 | `Strong fans draw air into our carbon salvage tower` | `In Stage One, CO2 is removed from the air. Industrial fans suck air in and blow it across a waterfall that absorbs CO2 and additional water.` |
| 2 | `the molecules are "energized" by renewable power` | `the salvaged CO2 encounters electricity in an electrochemical stack called the Faraday Reactor` |
| 3 | (la membrana non viene mai nominata) | `the alcohols are harvested using a special type of membrane called the Maxwell Core. Its pores are carbon nanotubes` |

Il racconto **non semplifica** la pagina tecnica: la **precede**. E il ponte fra i due e' un
link che compare quattro volte, sempre con la stessa etichetta: `Our Technology`.

**4. Ogni pezzo della macchina ha un nome proprio.**
Non "il reattore" ma il **Faraday Reactor**. Non "la membrana" ma il **Maxwell Core**. Non
"l'impianto" ma il **Titan Fuel Forge**. Nomi di fisici famosi su pezzi di metallo. Costa
zero e trasforma una descrizione in un inventario: **una cosa con un nome proprio sembra una
cosa che esiste.**

**5. Ogni cifra astratta e' seguita da un'unita' di misura familiare.**
`4.5 million kilograms of O2` non dice niente, quindi subito dopo: `roughly the same amount
of oxygen emitted by 450 acres of forest`, e l'impianto viene chiamato `a kind of mechanical
forest`. La CO2 diventa `9 kilotons` → `one million gallons`. Il crollo del rinnovabile
diventa `over 90% in the last decade`.

**6. Una metafora sola, dichiarata una volta, poi usata come nome commerciale.**
`you can think of our fuels as "liquid electricity."` → `We call them "electrofuels."`

**7. L'obiezione piu' dura, affrontata tre volte e presto.**
Per un carburante sintetico l'obiezione non e' "funziona?" ma "costa troppo". Il sito la mette
nel racconto (`That cost the same as fuels extracted from the ground`), nella meta description
(`can compete with fossil fuels on price`) e nella Mission (`our fuels will cost the same or
less than fossil fuels`). Tre volte, in tre registri.

**E il verbo e' sempre al presente, in prima persona plurale**: `We remove`, `we make`,
`we've developed`, `we call them`. Mai "verra' prodotto", mai "si stima che". Un impianto che
non esiste ancora viene descritto come se fosse gia' acceso.

## Tre cose da rubare

**1. Quantizzare il tempo delle animazioni per farle sembrare disegnate a mano.**
Una riga di GLSL, presa dal file vero:

```glsl
float t = floor(time * uPosterizeTime) / uPosterizeTime;
```

Con `uPosterizeTime = 12` la cosa si muove **12 volte al secondo** invece che 60: e'
"l'animazione sui due" del cinema d'animazione. Prometheus usa `60` per gli elementi che
devono restare fluidi, `24` per il cinema, `12` per il cartone, `6` per il tremolio. Il
risultato e' che una scena 3D real-time perde l'aria da videogioco e diventa **un film
illustrato** — che e' esattamente il registro giusto per spiegare qualcosa. Costa una riga e
cambia il genere del progetto. (Sul DOM lo stesso trucco si fa con
`animation-timing-function: steps(n)`.)

**2. Il cruscotto: trasformare i dati in strumenti che si muovono con lo scroll.**
Due colonne fisse, in basso a destra: a sinistra il beneficio, a destra il costo evitato,
ognuna con numero grande, unita' di misura piccola, icona e sottotitolo. Le etichette non
cambiano mai (`Polluted Past` / `Net Zero Future`), cambiano solo i numeri. Sei scene, sei
configurazioni, un solo componente. Rifacibile in HTML con un `IntersectionObserver` e un
contatore — e vale piu' di qualunque grafico, perche' **lo strumento appartiene al mondo del
racconto** (il cruscotto e' dell'auto che stai guidando), non alla pagina web.

**3. Il rem fluido a tre disegni.**
Una riga di CSS al posto di venti media query:

```css
html, body { font-size: calc(100vw/1440*10); }                                  /* desktop */
@media (min-width:601px) and (max-width:960px) { font-size: calc(100vw/768*10); } /* tablet */
@media (max-width:600px)                       { font-size: calc(100vw/375*10); } /* telefono */
```

Poi **tutto** in `rem`. Il sito non si riflowa, si scala, e i tre numeri (1440/768/375) sono
esattamente i tre artboard di Figma. Dieci minuti di lavoro, e cambia la sensazione di
solidita' di un progetto intero.

*(Bonus, se serve una quarta: la transizione card→pagina fatta con un clone e due classi CSS,
senza librerie — si clona il nodo, `position:fixed`, si nasconde l'originale con
`visibility:hidden`, si aggiunge `.\_ACTIVE` e lavora `transition: all 1000ms
cubic-bezier(.19,1,.22,1)`. Su telefono la stessa regola azzera le durate e l'effetto si
spegne da solo.)*

## Non verificato

- **Come si muove davvero.** Ho lo storyboard, i tempi, le camere, gli shader e i colori, ma
  non geometrie e texture: **l'app archiviata non gira**. Non ho visto un fotogramma di questo
  sito in movimento. Tutto quello che scrivo sull'aspetto e' dedotto da nomi di file, uniform
  e valori.
- **Il "Site of the Year 2021"**. La scheda Awwwards che ho letto documenta il **Site of the
  Day del 04/05/2021** con voto 8.40. Non ho trovato conferma di un premio annuale 2021 per
  questo sito, e **non ho potuto cercare oltre** (budget di ricerca web esaurito in questa
  sessione). La pagina degli annual awards 2021, letta via WebFetch, non elenca i vincitori
  nel contenuto servito. **Da verificare a mano.**
- **Il case study di Active Theory.** `activetheory.net/work/prometheus-fuels` restituisce solo
  il guscio della SPA (anche il loro sito e' un'applicazione WebGL senza contenuto nel
  sorgente), sia oggi sia nelle copie archiviate. Non ho potuto leggere il loro racconto del
  progetto, ne' i credits.
- **Se la build che ho letto e' esattamente quella premiata.** Il bundle e' del 15/04/2021, la
  premiazione del 04/05/2021. L'HTML che ho letto e' del 06/05/2021 e punta a un bundle con
  timestamp diverso (`1620234551869` nei favicon). Le differenze sono probabilmente piccole,
  ma **una c'e' gia': il CMS dice `Hold Space Bar to Accelerate`, il codice dice
  `Accelerate the car`** con il prefisso costruito a runtime.
- **La durata reale in secondi.** So le altezze in schermate (51 in tutto), non quanto tempo
  ci mette una persona vera.
- **Il resto dei testi della pagina Technology e News.** Ho i corpi principali dal CMS di
  aprile; gli articoli di `On the Road` erano su un endpoint separato che non ho recuperato.
- **Il numero esatto di richieste di rete e il peso totale.** L'archivio conserva solo gli
  asset che il crawler ha toccato.
- **Punteggi Lighthouse / CrUX.** Impossibili: il sito non esiste piu'.
