# MA (MA True Cannabis)

> **RICOSTRUITO DA ARCHIVIO.** Il sito premiato non esiste piu'.
> `https://matruecannabis.com/` oggi (13/08/2026) risponde **301 → `https://ch.maswitzerland.com/`**:
> il marchio e' stato ribattezzato "MA Switzerland" e il sito 3D e' stato buttato.
> Tutto quello che segue e' letto dalle copie di `web.archive.org`, in particolare:
> - HTML home inglese: `https://web.archive.org/web/20190818104147id_/https://matruecannabis.com/en` (**18/08/2019, il giorno prima del premio**)
> - HTML mondo Party: `https://web.archive.org/web/20190818111530id_/https://matruecannabis.com/en/experience/party`
> - CSS di base: `.../web/20190829173542id_/https://matruecannabis.com/front/main.98273.css`
> - bundle JS principale: `.../web/20190829173544id_/https://matruecannabis.com/front/main.0ef14.js` (661 KB non compressi, leggibile)
> - chunk della scena 3D: `.../web/20190829173544id_/https://matruecannabis.com/front/components-Slider.927e4.js`
> - chunk animazioni di un mondo: `.../web/20201130095650id_/https://matruecannabis.com/front/animations-party.14f60.js`
>
> **Non ho mai visto la pagina renderizzata.** Nessuno screenshot, nessuna registrazione: le copie
> d'archivio dell'HTML ci sono, ma i bundle CSS con le regole vere (`vendors.65087.css`,
> `main.25425.css`) non sono archiviati e il WebGL non gira. Quindi: tutto cio' che segue e'
> ricavato dal **codice sorgente vero** (testi, colori, curve, tempi, shader, modelli 3D), non
> dall'aspetto. Dove dico "sembra", e' una deduzione e la marco.

- **URL**: `https://matruecannabis.com/` (morto nella forma premiata; oggi 301 → `ch.maswitzerland.com`). Le lingue erano `/en`, `/it`, `/de`, `/fr`.
- **Premio**: Awwwards **Site of the Day del 19/08/2019**, voto **7.90** (Design 7.80 · Usability 7.56 · Creativity 8.54 · Content 8.03) + **Developer Award 7.17** (WPO 7.33 · Responsive 7.00 · SEO 7.00 · Markup 6.67 · **Animations 8.67** · Accessibility 6.00). Fonte: https://www.awwwards.com/sites/ma
  - **Attenzione**: la scheda Awwwards dice **Site of the Day**, non Site of the Year. Non sono riuscito a verificare se sia stato anche nominato/vincitore SOTY 2019 (budget di ricerca web esaurito in questa sessione). Trattare "Site of the Year 2019" come **non verificato**.
- **Studio**: **Retail 710** (il committente/brand, societa' svizzera: "Retail 710 SAGL, PO Box 53, 6853 Ligornetto, Switzerland", CHE-247.174625) + **AQuest** (agenzia italiana, Verona/Padova — e' loro tutto il codice: i moduli interni si chiamano `@aquestsrl/react-handlers`, `@aquestsrl/dev-utils`, e il footer linka `https://aquest.it`). Fonte: credits Awwwards + `main.0ef14.js`.
- **Anno**: 2019
- **Letto il**: 13/08/2026

---

## Cosa tratta il sito

E' l'**e-commerce di un produttore svizzero di cannabis legale (CBD)**. Vende due cose sole:

1. **Cannabis Buds** (infiorescenze) — nel catalogo tedesco `blutenstande`
2. **Pre-Rolled** (spinelli gia' rollati), miscelati con erbe officinali

Entrambi esistono in **quattro varianti**, che il sito non chiama "varieta'" ma **"Worlds"** (Mondi),
piu' una quinta di servizio:

| mondo | slug | colore | erbe / promessa |
|---|---|---|---|
| CREATE | `/experience/create` | `#EDA80A` giallo-ambra | creativita', immaginazione |
| RELAX | `/experience/relax` | `#66BBC6` verde-azzurro | calma, stress |
| PARTY | `/experience/party` | `#CC504B` rosso mattone | Damiana + Ashwagandha, festa |
| SLEEP | `/experience/sleep` | `#86A7D0` azzurro polvere | riposo |
| PURE | (solo prodotto) | `#417764` verde scuro | pre-rolled senza erbe aggiunte |

(colori VERIFICATI, presi da `:root` in `main.98273.css`)

Oltre allo shop ci sono: **Production** (come si coltiva), **Packaging** (il barattolo),
**Blog** ("our stories", articoli divisi per gli stessi 4 mondi), **FAQ**, **Contact**, area
utente, carrello e checkout completo.

## Cosa vende, e qual e' l'obiettivo finale

**Il prodotto vero non e' l'erba: e' il permesso di comprarla senza sentirsi un drogato.**

Tutto il sito e' costruito per togliere lo stigma. Non dice mai "sballo": dice *"enhance your innate
abilities"*, *"rediscover the great energy that is within you"*, e soprattutto rifiuta il nome che
usano gli altri:

> "The world calls it Cannabis Light or Legal Grass; **we produce True Cannabis**."

L'obiettivo **dichiarato** e' vendere: c'e' il carrello, il checkout, i prezzi (CHF 69 a formato),
PostFinance/TWINT, la spedizione svizzera in 24 ore.

L'obiettivo **vero, secondo me, e' doppio e i due obiettivi litigano**:

- **(a) costruire un marchio di lusso in una categoria che sembrava roba da testoni.** Il barattolo
  e' modellato in 3D con un `MeshPhysicalMaterial` a `metalness: 0.8`, `roughness: 0`,
  `reflectivity: 2.9` — cioe' e' renderizzato come un profumo, non come un sacchetto.
- **(b) farsi vedere dalla giuria.** Il costo di questa scelta e' documentato nel voto stesso:
  Creativity 8.54, **Usability 7.56**, Accessibility 6.00. E la parte 3D vive su URL
  (`/experience/...`) che **dalla homepage non sono raggiungibili se non dal menu e dal piede**.

Il fatto che oggi il dominio rediriga a un normale e-commerce nopCommerce ("MA Switzerland")
suggerisce che (b) abbia vinto e poi sia stato smontato. Deduzione mia, dichiarata come tale.

## A chi

Compratore svizzero adulto (la spedizione era **solo Svizzera**: *"We currently deliver to
Switzerland only"*, con un form apposta per lasciare la mail se sei di un altro paese), maggiorenne
per forza — c'e' un cancello d'eta' prima di tutto.

- **Cosa sa gia'**: che la cannabis CBD e' legale in Svizzera e si compra ovunque, spesso in bustine
  anonime a poco prezzo.
- **Cosa teme**: di comprare roba trattata, di sembrare un tossico, di dare 69 franchi a un sito
  losco. Il sito risponde punto per punto: *"entirely organic methods and without the use of
  pesticides"*, *"in full compliance with the limits imposed by law"*, *"strict controls on the
  supply chain for the certification of the absence of child labour"*, *"Prodotto coltivato,
  lavorato e confezionato in Svizzera. 100% legale."*
- **Cosa deve pensare uscendo**: "questa non e' erba, e' un prodotto di design svizzero, e ce n'e'
  uno per il mio stato d'animo".

## L'esperienza progettata

E' **una visita a un piccolo museo, non una vetrina**. La struttura e' esplicita nel codice: esiste
un unico "palco" WebGL che resta montato mentre l'utente cambia pagina, e le pagine sono le sale.

L'hook `usePageWithSlider` (in `main.0ef14.js`) dice letteralmente che la scena 3D vive su due tipi
di pagina e su nessun'altra:

```js
var l = usePage("homepage"), c = usePage("experience"); return l || c;
```

**Cosa vive chi entra, in ordine:**

1. **Una porta.** Schermo pieno del colore del mondo, logo MA verticale al centro che ruota su se
   stesso all'infinito, e una domanda: *"Are you over 18 years old?"* con due bottoni, **Yes** e
   **No**. Non c'e' modo di guardare dietro. Se rispondi No, la pagina **si ricarica** (`location.reload()`).
2. **Il sipario si ritira.** Non e' un fade: e' un `<path>` SVG a tutto schermo che si deforma due
   volte e risale, lasciando un bordo ondulato (dettaglio esatto sotto, in *Il momento*).
3. **La homepage**, che e' un oggetto 3D fermo — il barattolo (`pot.gltf`) e una foglia
   (`foglia_low.gltf`) — nel giallo di CREATE, con sopra il testo *"We are the True Cannabis"*.
   VERIFICATO: `Homepage.jsx` chiama `changeThemeAndLoad("create", {pot:true, preRolled:false, foglia:true})`.
4. **Il visitatore scorre** e incontra sei blocchi editoriali, ciascuno con un "LEARN MORE" che
   porta in una sala diversa (shop, buds, pre-rolled, packaging, production).
5. **Le quattro sale vere** (`/experience/create|relax|party|sleep`) sono l'unico posto in cui il
   sito diventa un giocattolo. Ogni sala e' **una scena con quattro oggetti 3D che sono coppie
   assurde**, e i nomi dei file lo dicono senza pieta':

   | mondo | i quattro oggetti (nome file `.gltf`) |
   |---|---|
   | CREATE | `orologio_pizza` (orologio+pizza), `barca_razzi` (barca+razzi), `cuore_occhiali` (cuore+occhiali), `fotocamera_lampadina_reduce` |
   | RELAX | `palma_costume`, `paperella_bottone` (paperella+bottone), `cuffie_conchiglie` (cuffie+conchiglie), `visore_orecchie` (visore VR+orecchie) |
   | PARTY | `giradischi_condom`, `bicchiere_trampolino`, `scarpa_banana`, `stereo_ventole` |
   | SLEEP | `pecora_mascherina`, `incudine_palloncino`, `letto_ruote`, `casco_luna` (casco+luna) |

   Ogni oggetto ha addosso **una frase scritta in 3D e piegata su un cilindro** (`themeText` in
   `constants/index.js`, VERIFICATO, testuale):

   - CREATE: `bend time` · `start flying` · `follow your heart` · `picture your dream`
   - RELAX: `everyday is holiday` · `play with yourself` · `listen to your soul` · `reality is unreal`
   - PARTY: `get it on` · `dive into the party` · `go bananas` · `the power of scent`
   - SLEEP: `only one sheep` · `lighten the load` · `race to bed` · `we are not alone`

6. **Cosa deve FARE il visitatore**: scorrere. Mentre scorre i blocchi di testo, **la camera va a
   zoomare l'oggetto corrispondente** (componente `SlideObjectZoomedTrigger`, mappa
   `zoomedObjectMapping`: per `create` gli oggetti 3 e 1, per `party` 3 e 0, ecc.). E puo'
   **cambiare mondo** trascinando/swipando di lato, o cliccando i quattro pallini in basso, che non
   sono pallini ma **quattro miniature** (`create-sm`, `relax-sm`, `party-sm`, `sleep-sm`).
7. **Dove lo si porta**: in fondo a ogni sala ci sono due card di prodotto — `Cannabis Buds` e
   `Pre-Rolled` di quel mondo — a **CHF 69** ciascuna, che portano a `/shop/cannabis-buds/party` e
   `/shop/pre-rolled/party`.

**L'immagine che resta in testa**: un barattolo che galleggia insieme a una pecora con la
mascherina da notte, tutto tinto di un solo colore.

## Come e' organizzata la persuasione

- **Schermata 0 (il cancello d'eta')**: non c'e' persuasione, c'e' un dazio. Costo: una schermata
  intera prima di qualunque messaggio. E' anche l'unico punto di attrito serio del sito.
- **Schermata 1 (promessa)**: *"We are the True Cannabis"* + *"A journey into True Cannabis, our
  Worlds created to accompany you in the discovery of a plant with thousand-year old benefits."*
  La promessa e' **identitaria**, non funzionale: non dice cosa fa il prodotto, dice cosa sei tu.
- **Schermata 2 (differenziazione)**: *"The world calls it Cannabis Light or Legal Grass; we produce
  True Cannabis."* E' qui che si giustifica il prezzo. Subito sotto la prova di processo:
  *"entirely organic methods and without the use of pesticides"*.
- **Schermata 3 (primato)**: *"We are the first brand in the world to introduce Pre-Rolled that
  combine True Cannabis Buds and organic medicinal herbs."*
- **Schermate 4-5 (prova materiale)**: Packaging (*"The result of years of research and design, made
  entirely from environmentally friendly materials"*) e Shipping (*"eco-bikers, drone deliveries"*).
- **Schermata 6 (prova morale)**: *"Our system of beliefs"* — sede in Svizzera, indoor,
  eco-sostenibile, responsabilita' sociale d'impresa, niente lavoro minorile.
- **Schermata 7 (prova sociale)**: "our stories", due articoli di blog.
- **Il prezzo NON e' in homepage.** Compare solo dentro `/experience/*` e nello shop: **CHF 69**.
- **La chiamata all'azione** in homepage e' sempre la stessa parola, ripetuta cinque volte:
  **LEARN MORE**. Mai "Buy", mai "Shop now" nel corpo. "SHOP" c'e' solo nel menu in alto.

**Chi non scorre fino in fondo (la maggioranza) riceve**: il cancello d'eta', il logo, la frase
*"We are the True Cannabis"* e il paragrafo del viaggio. **Non riceve**: che cosa si vende
esattamente, quanto costa, che esistono quattro mondi (compaiono alla seconda schermata, in una
riga di testo: *"CREATE, RELAX, PARTY and SLEEP, the access to 4 Worlds designed around you"*), e
soprattutto **non vede mai il 3D dei mondi**, che sta su un'altra pagina.
Questo e' il difetto commerciale grosso del progetto: **il pezzo forte e' nascosto dietro un clic
del menu.** Dalla homepage i 4 mondi si raggiungono solo dal piede, sotto il titoletto
`GET INSPIRED`, o dal menu (`ssr.menu.been-inspired = "Get inspired"`).

## Idea regista

**Un colore solo per volta**: la sostanza non si descrive, si tinge — un'unica variabile
(`--color-primary`) ricolora contemporaneamente il CSS, la barra del browser e, via uniform `uColor`,
perfino gli shader degli oggetti 3D.

## Il momento

**La ritirata del sipario dopo il "Yes" del cancello d'eta'.** Cade a ~1-2 secondi dall'ingresso, e
non e' legato allo scroll: e' a tempo, comandato da una timeline `anime.js` in `Loader.jsx`.
Sequenza esatta (VERIFICATO, dal bundle):

1. logo + bottoni collassano: `scale: 0`, easing `easeInOutQuint`, `duration: 400`,
   `delay: anime.stagger(70, {start: 600})`;
2. il `<path>` SVG (viewBox `0 0 400 400`, che parte come rettangolo pieno) **morfa** verso una
   forma a onda a meta' schermo — `easeInQuint`, `400ms`, in sovrapposizione `-=200`;
3. **secondo morph** fino a una riga alta 1px in cima — `easeOutQuint`, `800ms`.

Il risultato e' che il colore del mondo **si risucchia verso l'alto con un bordo liquido**, invece di
sparire in dissolvenza. E' esattamente la "colorful animated transition" che Awwwards cita nelle note.
Lo stesso `<path>` e' gia' presente nell'HTML server-rendered, quindi si vede anche prima che il JS
sia pronto.

Il secondo momento, minore, e' **il cambio di mondo**: 700 ms su desktop, **1200 ms su mobile**
(`setTimeout(a, m ? 1200 : 700)` in `useSliderAnimation.js`, dove `m` = isDesktop... il valore
maggiore e' sul ramo desktop; vedi *Non verificato*).

## Struttura, sezione per sezione

**Homepage** (`/en`):

| sezione | cosa mostra | cosa fa l'utente | durata (schermate) |
|---|---|---|---|
| Cancello eta' | colore pieno + logo rotante + "Are you over 18 years old?" | clic Yes / No | 1 (bloccante) |
| Hero | barattolo 3D + foglia in giallo `#EDA80A`, "We are the True Cannabis" | legge, scorre | ~1.2 |
| True Cannabis | "The world calls it Cannabis Light…" + immagine `composizione_01` | clic LEARN MORE → `/shop/cannabis-buds` | ~1 |
| Pre-Rolled | "We are the first brand in the world…" + `composizione_02` | clic LEARN MORE → `/shop/pre-rolled` | ~1 |
| Packaging | "respect for the plant" | clic LEARN MORE → `/packaging` | ~1 |
| Shipping | eco-bikers, droni | — | ~0.7 |
| Our system of beliefs | "cultivating excellence" | clic LEARN MORE → `/production` | ~1 |
| our stories | 2 card di blog | clic → articolo | ~0.8 |
| Newsletter + piede | input mail + checkbox privacy + 4 colonne | iscrizione | ~1 |

**Pagina mondo** (`/en/experience/party`):

| sezione | cosa mostra | cosa fa l'utente | durata |
|---|---|---|---|
| Scena | 4 oggetti 3D del mondo + testi 3D curvi + miniature dei 4 mondi | swipe/drag laterale, clic sulle miniature | persistente (fondo) |
| Titolo | h1: "celebrate your life with more **energy!**" | — | ~1 |
| Claim | "get together and celebrate your life" (da `constants.claim`) | — | ~0.6 |
| what's inside | descrizione del mondo | scorrendo, **zooma l'oggetto 3D abbinato** | ~1.5 |
| Party Cannabis Bud | descrizione della varieta' | idem, secondo oggetto | ~1.5 |
| Party Pre-Rolled | Damiana + Ashwagandha | — | ~1.5 |
| Choose your format | 2 card: Buds CHF 69 / Pre-Rolled CHF 69 | clic → scheda prodotto | ~1 |

## L'esperienza in ordine di tempo

**Primi dieci secondi** (ricostruiti dal codice; i tempi in ms sono letterali dal bundle):

- **0.0 s** — arriva l'HTML gia' renderizzato dal server (React + `react-helmet`). L'elemento `<html>`
  ha gia' addosso `style="--color-primary:#eda80a"` e il `<meta name="theme-color" content="#eda80a">`:
  **anche la barra del browser su Android diventa gialla prima che parta il JS**.
- **0.0-0.3 s** — inline script: `document.documentElement.style.setProperty("--vh", innerHeight*0.01+"px")`
  (il trucco anti-barra-indirizzi mobile). Parte GTM (`GTM-M4HCC2T`).
- **0.3 s** — si vede il `Loader`: schermo pieno del colore, logo MA verticale (SVG inline, 131×166),
  e una barretta che fa `scaleX: 2.5` in 500 ms `easeInOutSine` e poi `scaleX: 0` in 300 ms `easeOutCirc`.
  Il logo ha un pezzo con classe `.rotation` che gira per sempre: `rotateY: [0, -360]`, `easing: "linear"`.
- **~0.8 s** — compare il blocco eta' con preset `collapse` (altezza 0→auto, 600 ms `easeInOutQuart`,
  `delay: 500`): *"Are you over 18 years old?"* / *"No"* / *"Yes"*.
- **attesa umana** — qui il sito si ferma finche' non clicchi.
- **+0 ms dal clic** — cookie `age-verification` per 365 giorni.
- **+600 ms** — logo e bottoni si sgonfiano a `scale: 0` (stagger 70 ms).
- **+1000 ms** — primo morph del sipario (400 ms).
- **+1200 ms** — secondo morph, 800 ms: il colore risale e sparisce.
- **~+2 s** — si vede la homepage. Il WebGL nel frattempo ha caricato `matcap`, `foglia-diffuse`,
  `pot-diffuse`, `tappo-diffuse`, `pot-label-diffuse`, `tappo-bump` piu' i due `.gltf`.

**Poi, a blocchi:**

- **Scroll della homepage**: non e' scroll nativo. E' uno scrollbar custom (`Scrollbar.jsx`) costruito
  su `normalize-wheel` + `lerp`, con `overflow: hidden` sull'`<html>`. I blocchi entrano con
  `IntersectionObserver` (`InView`) e il preset `fadeIn` (`translateY: 80 → 0`, `scaleY: 1.2 → 1`,
  `transformOrigin: top`, `easeOutExpo`, 800 ms, stagger 75 ms).
- **Passaggio a un mondo**: `<html>` prende l'attributo `data-transition-is-active="true"`, il cursore
  desktop diventa un anello di progresso che gira (raggio 16, 2000 ms, in loop), il sipario SVG
  ricopre, la rotta cambia, il sipario si ritira.
- **Dentro il mondo**: entrata scaglionata degli oggetti — `pot` a **900 ms**, `preRolled` a **1000 ms**,
  `foglia` a **1200 ms**, il testo dello slide a **1600 ms** (VERIFICATO, `useSliderAnimation.js`).
- **Cambio mondo laterale**: lo slide vecchio esce a sinistra/destra, il nuovo entra al centro,
  i testi 3D ruotano all'indice nuovo; la palette dell'intera pagina cambia insieme.

## Animazioni

Tutto e' **anime.js**, non GSAP. Nessuna traccia di GSAP nel bundle. Presets letterali da
`common/utils/animations.js` (VERIFICATO).

| elemento | cosa si muove | legato a | curva / inerzia | note |
|---|---|---|---|---|
| Sipario del loader | `<path>` SVG, morph del `d` | tempo (timeline) | `easeInQuint` 400 ms → `easeOutQuint` 800 ms | il "colorful transition" citato da Awwwards |
| Logo MA | `rotateY: [0,-360]` | tempo, loop infinito | `linear` | riparte da solo (`complete → Z()`) |
| Barra del loader | `scaleX: 2.5 → 0` | tempo | `easeInOutSine` 500 / `easeOutCirc` 300 | dentro `requestIdleCallback` |
| Blocchi di testo | `translateY 80→0`, `scaleY 1.2→1`, opacity | scroll (IntersectionObserver) | `easeOutExpo`, 800 ms, stagger 75 ms | preset `fadeIn` |
| Variante elastica | come sopra | scroll | `easeOutElastic(1, .7)` | preset `fadeInElastic` |
| Pannelli (menu, carrello, ricerca) | `translateX/Y: 100% → 0` | stato (apertura layer) | **`spring(0.7, 100, 12, 0)`** in entrata, `spring(0.4, 100, 12, 0)` in uscita | preset `layerTop` / `layerRight` |
| Bottoni | `scale` con rimbalzo | stato | `easeInElastic(1, .7)` entrata, `easeInQuad` 200 ms uscita | preset `scale` |
| "Push" | `scaleX/Y 1 → 2.4 → 1` | stato | `easeInOutQuad` 300 ms | preset `push` |
| Accordion / FAQ | altezza 0↔auto misurata a runtime | clic | `easeInOutQuart` 600 ms | preset `collapse` |
| Cursore desktop | anello SVG che si riempie | stato "transizione in corso" | loop 2000 ms | posizione aggiornata in `useRaf` con `translate3d` |
| Voci di menu e link | testo che cambia in hover | hover | non verificato (CSS non archiviato) | ogni `<a>` porta `data-hover-text="PRODUCTION"` ecc.: c'e' un secondo testo sovrapposto |
| Scroll di pagina | contenuto traslato | ruota / drag | **lerp** con `normalize-wheel` | smooth scroll fatto in casa, non Locomotive |
| Oggetto "cocktail" (PARTY) | bicchiere sale di 4, ruota `-20°→0`, si allarga `scaleX: 2` | ingresso dello slide | **`easeOutElastic(1, 1)`**, rotazione `easeOutElastic(3, 0)` 1800 ms | `animations-party.14f60.js` |
| Oggetto "giradischi" (PARTY) | pulsa `scale x2/y1.6` in loop, sale a `y: 4`, ruota `x: 120°` | ingresso, poi loop | `easeInQuad` 100 / `easeOutQuad` 300 | il disco "batte" a tempo |
| Oggetto "radio" (PARTY) | due mesh ruotano `y: 0→360°` in **200 ms** in loop | ingresso | `linear` | le ventole dello stereo |
| Oggetto "scarpa" (PARTY) | salto: `y: 0→10→0` + rotazione `y: 30°→0` | ingresso | `easeInSine` 100 / `easeOutSine` 300 | |
| Testo 3D | si piega su un cilindro | indice dello slide | vertex shader `quadraticInOut` su `uv.x` | `text3D/post.vert` |
| Oggetti non selezionati | si scoloriscono verso il bianco | quale oggetto e' attivo | mix nel fragment shader | vedi sotto |

**Il trucco piu' bello, e piu' rubabile, e' nello shader `slide/post.frag`:** i quattro oggetti di un
mondo condividono **una sola texture divisa in quattro quadranti UV**, e un `uniform vec4
uWhiteColorsFactors` decide **quanto sbiancare ciascun quadrante indipendentemente**:

```glsl
vec3 whiteColor = desaturate(gl_FragColor.rgb, 0.3);
whiteColor += vec3(0.05);
whiteColor = blendHardLight(whiteColor * uWhiteColorsFactor.r, vec3(uWhiteColorsFactor.g) / 255.);
if (vUv.x < 0.5 && vUv.y < 0.5) { gl_FragColor.rgb = mix(gl_FragColor.rgb, whiteColor, uWhiteColorsFactors.x); }
if (vUv.x > 0.5 && vUv.y > 0.5) { gl_FragColor.rgb = mix(gl_FragColor.rgb, whiteColor, uWhiteColorsFactors.y); }
...
```

Cioe': **un draw call, quattro oggetti, e ognuno si accende o si spegne da solo.** La mappa
quadrante↔oggetto e' per mondo (`objectUVMapping`: create `["x","y","z","w"]`, relax `["y","w","z","x"]`,
sleep `["z","w","x","y"]`, party/pure `["z","w","y","x"]`).

## Colori

VERIFICATI, letti da `:root` in `main.98273.css`. Sono dichiarati in `rgb()`; do l'esadecimale.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| Mondo CREATE | `#EDA80A` | `--color-create`; e' anche il `--color-primary` della homepage |
| Mondo RELAX | `#66BBC6` | `--color-relax` |
| Mondo SLEEP | `#86A7D0` | `--color-sleep` |
| Mondo PARTY | `#CC504B` | `--color-party`; `<html style="--color-primary:#cc504b">` su `/experience/party` |
| Prodotto PURE | `#417764` | `--color-pure` |
| Le stesse al 30% | `rgba(…, 0.3)` | `--color-*-lighten`, per sfondi e stati |
| Istituzionale | `#A20000` | `--color-institutional`, errori e marchio |
| Testo principale | `#666666` | `--color-primary` di default (viene sovrascritto per pagina) |
| Testo secondario | `#777777` | `--color-secondary`, colore del `<body>` |
| Errore campo | `#E1645F` | `--input-error` |
| Fondo campo | `rgba(0,0,0,0.04)` | `--input-bg` |
| Fondo campo in errore | `rgba(162,0,0,0.1)` | `--input-bg-error` |
| Verde di conferma | `#59BF69` | unica occorrenza nel CSS base |
| Grigio chiaro | `#EFEFEF` | separatori |
| Barra di scorrimento | `black` @ opacita' `0.2`, largh. 10px | `--scrollbar-*` |
| Fondo pagina | bianco | dedotto: lo shader `white-plane.frag` disegna `vec3(1.)` e il preset `collapse` in uscita mette `borderTopColor: "white"` |

Nota: la scheda Awwwards elenca come palette `#2779A7`, `#D14836`, `#ECD06F`. **Non corrispondono** ai
token del CSS: sono i colori che Awwwards estrae dalla miniatura. Fidarsi dei token, non della scheda.

Il colore non e' solo CSS: viene passato agli shader come `uniform vec3 uColor` (componente
`DynamicThemeUniforms`, `renderOnPropChange: "uColor"`) e li' fa `blendHardLight(gl_FragColor.rgb,
uColor / 255.)`. **Per questo tutta la scena 3D cambia tinta insieme alla pagina.**

## Tipografia

| livello | famiglia | peso | corpo (desktop) | interlinea | note |
|---|---|---|---|---|---|
| Display / titoloni | **MonumentExtended** | dichiarato `font-weight: "light"` (valore non valido: e' una stringa fra virgolette — bug) | `--font-size-xxxl` = **94px** (114px oltre 1650px, **34px sotto 767px**) | `--line-height-xxs: 1` | woff2 + woff **auto-ospitati**, `font-display: swap` |
| Titoli medi | Krona One | — | 42-54px (`--font-size-xxl1/2`) | 1.2-1.4 | `--font-family-secondary` |
| Corpo | Montserrat | 400 | 15px (17px oltre 1650px, 14px mobile) | **1.85** | `--font-family-primary`, colore `#777` |
| Occhielli / etichette | Montserrat | — | 11-13px | 1.4 | |
| Icone | font "icon" custom | — | 20px | — | woff2 di 3.9 KB generato con `icon.font.js` |

Scala completa (`:root`): `xs 11 · sm 13 · md 15 · lg 20 · xl 24 · xxl 30 · xxl1 42 · xxl2 54 · xxxl 94`.
Su mobile diventa `12 · 14 · 14 · 16 · 22 · 22 · 30 · 30 · 34`.
`html { letter-spacing: 1px }` a una certa larghezza — quindi anche il corpo e' leggermente spaziato.

**Come sono serviti**: MonumentExtended (Pangram Pangram) e il font icona sono file locali sotto
`/front/assets/`, con `font-display: swap`. **Montserrat e Krona One sono dichiarati ma non li ho
trovati caricati** ne' come `@font-face` in `main.98273.css` ne' come `<link>` a Google Fonts
nell'HTML: o stanno nel bundle CSS non archiviato, o venivano dal fallback di sistema. **Non verificato.**

## Testi veri

Tutti testuali dall'HTML archiviato (`/en`, `/en/experience/party`) e dal dizionario di etichette
incorporato nella pagina.

**Titolo pagina**: `MA True Cannabis: CBD Inflorescence & Pre-Rolled Joints`
**Meta description**: `Production and online shop of Swiss Cannabis: natural weed, high-quality CBD Inflorescences & Joints. Shop now!`

**Cancello d'eta'**: `Are you over 18 years old?` — `Yes` / `No`
(varianti nel dizionario: `How old are you?`, e per l'acquisto: `You can complete purchases on matruecannabis.com if you are over 18 years old`)

**Menu**: `SHOP` · `PRODUCTION` · `PACKAGING` · `BLOG` (+ `Our products`, `Get inspired`)

**Hero**:
> We are the
> **True Cannabis**
>
> A journey into True Cannabis, our Worlds created to accompany you in the discovery of a plant with thousand-year old benefits.
> A natural product that will allow you to enhance your innate abilities and break down boundaries.
> Do not be swayed by dogmas: rediscover the great energy that is within you, allow yourself to be guided on a journey towards freedom, energy and growth.

**Blocco buds**:
> The world calls it Cannabis Light or Legal Grass; we produce True Cannabis.
> We harvest the fruits of years of research and development that lead us to produce, with entirely organic methods and without the use of pesticides, the best Cannabis Buds in the world.
> The flowers are compact, fragrant, naturally complex and rich in personality: CREATE, RELAX, PARTY and SLEEP, the access to 4 Worlds designed around you.

**Blocco pre-rolled**:
> We are the first brand in the world to introduce Pre-Rolled that combine True Cannabis Buds and organic medicinal herbs.
> Engaging, convenient and ready to smoke: our Pre-Rolled joints, in the PURE version and in the 4 Worlds of MA, are the celebration of our best Cannabis Buds.

**Occhielli**: `respect for the plant` / `Packaging` — `cultivating excellence` / `Our system of beliefs` — `our` / `stories`

**Claim per mondo** (`constants.claim`, con `<br/>` originali):
- create: `free yourself and<br />start shaping your world`
- relax: `connect with yourself <br />and finally relieve stress`
- party: `get together <br/>and celebrate your life`
- sleep: `master your rest <br/>and reset body and mind`
- pure: `Embrace the power of True Cannabis`

**Titolo della pagina PARTY**: `celebrate your life with more energy!`
**Sezioni della pagina mondo**: `what's inside` · `Party Cannabis Bud` · `Party Pre-Rolled` · `Choose your format`
**Prezzo**: `MA PARTY — Cannabis Buds — CHF 69` / `MA PARTY — Pre-Rolled — CHF 69`

**Chiamate all'azione** (dal dizionario, testuali): `Learn more` · `Discover more` · `Add to Cart` ·
`Buy Now` · `Checkout` · `Go to payment` · `Continue shopping` · `Re-Order` · **`Roll More`** (il
"carica altri" dello shop — gioco di parole su "rollare") · `View All` · `Go to Detail`

**Piede**: `SUBSCRIBE TO OUR newsletter` — `your email address *` — `I have read and agree to the privacy policy. *` — colonne `SHOP`, `GET INSPIRED` (Create/Party/Relax/Sleep), `MY PROFILE` (Login), `FOLLOW US ON` — `© Retail 710 - CHE-247.174625`

**Contatti**: `Retail 710 SAGL, PO Box 53, 6853 Ligornetto, Switzerland` · `customersupport@matruecannabis.com` · titolo `need help?`

**Nota legale sul prodotto**: `Prodotto coltivato, lavorato e confezionato in Svizzera. 100% legale.`
(in italiano anche nella versione inglese — svista)

## Il percorso d'acquisto, per intero

E' la parte che i clienti pagano, e qui c'e' tutta, ricostruita dal dizionario di etichette
incorporato nell'HTML (VERIFICATO, testi letterali).

1. **Scheda prodotto** — `Choose your format` (buds / pre-rolled), `Choose the quantity`,
   `Add to Cart` oppure `Buy Now`. Sotto: `Often bought together`. Tab della scheda:
   `Effects`, `Peculiarity`, `Distinctions`, `How to use it`.
2. **Carrello a scomparsa** (`CartLayer`, entra con `spring(0.7, 100, 12, 0)` da destra) —
   `Your Cart`, `Your Items`, riga `Price` / `Quantity`, `Subtotal`, `Shipping`, `VAT`, `Total`.
   Leva di upsell: **`Add [...CHF] and receive free shipping`**. E `Do you have a discount code?` →
   `Enter your code`.
3. **Identificazione** — tre strade: `Login to your account`, `Checkout as guest`, oppure registrarsi
   con l'esca: *"Register for quicker orders and get free shipping on your next order"*.
4. **Indirizzo** — `Contact and Shipping information`; campi `Address`, `Floor, Company, Post-Box`,
   `city`, `zip code`, `District`, `Country`. Vincolo dichiarato: *"We currently deliver to
   Switzerland only"*. Telefono con motivazione: *"We will use it to conact you about the delivery of
   your order, if necessary"* (refuso "conact" nell'originale). Casella
   *"Use your shipping details for billing"*.
5. **Spedizione** — `Choose a delivery method`: `Swiss Post - Express (1 Day)`, con
   *"Expected delivery in the next 24 hours"* / *"…48 hours"* e la promessa operativa
   *"Orders placed before 11.30am are shipped the same day and delivered the next working day"*.
6. **Pagamento** — `Choose a payment method`, due modi:
   - `PostFinance or TWINT` → *"Payment by PostFinance card, e-Finance or TWINT"*
   - `Invoice` → *"PAYMENT WITH INVOICE WITHIN 30 DAYS with our Partner Swissbilling"*
7. **Conferma** — `Thank you {name}!`
8. **Verifica eta' al checkout**: campo compleanno (giorno/mese/anno) con la regola scritta sopra.
9. **Chi non e' svizzero** non viene buttato fuori: gli si apre un form
   (`ShippingAlertForm`) — *"Our products are currently available in Switzerland only. Leave us your
   email address to get to know when they come to your Country."* → `Subscribe`. **Il traffico
   internazionale viene convertito in lista mail invece che perso.** Questa e' la mossa piu'
   commercialmente intelligente di tutto il sito.

Tracciamento e-commerce completo via GTM (`GTM-M4HCC2T`) con eventi
`PRODUCT_IMPRESSION`, `PRODUCT_CLICK`, `PRODUCT_DETAIL`, `ADD_TO_CART`, `CHECKOUT_BUY_NOW`,
`REMOVE_FROM_CART_*`, `CART_SIDEBAR`, `CART_PAGE`, `PURCHASE`.

## Mobile

**Sul telefono e' un altro sito.** Qui e' tutto VERIFICATO dal codice (`useDesktop`, `usePhone`,
`constants/mobile.js`, `isTouch`).

**SPARISCE:**

- **Lo scroll smooth custom.** `Scrollbar.jsx` si attiva solo se `useDesktop()` e' vero (e nemmeno
  su Edge). Su touch resta lo scroll nativo. Scelta giusta, e rara.
- **Il cursore custom** (`Cursor.jsx` fa `return isDesktop ? <…> : null`): sul telefono l'anello di
  caricamento durante le transizioni **non esiste**. Non c'e' nessun sostituto: la transizione
  diventa muta.
- **L'aggancio scroll↔zoom sull'oggetto 3D.** In `Experience.jsx`:
  `var B = c ? SlideObjectZoomedTrigger : "div"` dove `c = useDesktop()`. Su mobile i blocchi di
  testo sono `<div>` normali: **scorrere non muove piu' la camera.** E' la perdita piu' grave:
  su desktop l'esperienza e' un accoppiamento testo-oggetto, su mobile e' un fondale.
- **Le texture in alta risoluzione.** `image-ext-detect` sceglie per media query:
  `(max-width: 767px)` → cartella **`webgl-low`**, `(min-width: 767px)` → **`webgl-medium`**.
  (Non esiste una `webgl-high`: anche il desktop e' su qualita' media.)

**VIENE SOSTITUITO:**

- **L'inquadratura 3D, interamente.** Desktop: camera a `(0, 15, 160)`, `fov 18`; i 4 oggetti a
  `x = -40, -30, +30, +40`. Mobile: camera **arretrata** a `(0, 20, 225)` e oggetti **stretti**
  verso il centro a `x = -12, -26, +26, +12`, con quote piu' alte (`y` 35 e 30 invece di 25 e 26).
  In pratica su mobile la scena viene compattata e vista da piu' lontano per stare in verticale.
- **Il testo 3D**: da `scale 0.56` e `y: 10` (desktop) a **`scale 0.20`** e `y: 50`, con
  un'inclinazione di `4°` sull'asse x. Cioe' su mobile il testo curvo e' un quinto ed e' spostato in alto.
- **La navigazione fra gli oggetti**: `react-swipeable` (swipe) al posto delle zone di hover laterali
  (`sliderHoverRotateLeft`/`Right`), che sul touch non hanno senso.
- **La scala tipografica**: il titolone passa da **94px a 34px** (meno di un terzo), il corpo da 15 a 14,
  lo `--spacer` da 15px a 8px, l'header da 90px a 68px, i margini laterali da `16vw` a `32px`.
- **I tempi**: il cambio di slide passa da 700 ms a 1200 ms (o viceversa — vedi *Non verificato*).

**RESTA:**

- Il cancello d'eta', identico e bloccante.
- Il sipario SVG del loader (e' CSS/SVG, indipendente dal WebGL).
- Tutti i testi, il commercio, il checkout: **il sito e' server-rendered**, quindi su mobile lento
  il contenuto arriva comunque.
- Il `--vh` calcolato a mano per l'altezza reale della viewport.

**IN PIU', SOLO SU MOBILE:** un pannello a schermo pieno che ti blocca — `RotateLayer` — con
un'icona e la scritta **`Rotate your device`** se sei su touch, **`Resize your window`** se sei su
desktop con la finestra troppo piccola. Cioe': **il sito si rifiuta di funzionare in un formato che
non gli piace.** E' la dichiarazione piu' onesta di tutto il progetto: l'esperienza e' progettata per
una forma sola, e le altre vengono respinte invece che adattate.

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| Framework | **React** con **server-side rendering** (non e' una SPA cieca: l'HTML arriva completo) | VERIFICATO | `data-react-helmet` su ogni meta, testo completo nell'HTML archiviato |
| Router | `react-router-dom` + `react-router-animation-switch` | VERIFICATO | in `main.0ef14.js` |
| Stato | `redux`, `react-redux`, `redux-thunk`, `redux-axios-middleware`, `react-responsive-redux` | VERIFICATO | idem |
| Form | `final-form` + `react-final-form-hooks` + `fastest-validator` | VERIFICATO | idem |
| Animazione | **anime.js** (`animejs/lib/anime.es.js`) — **niente GSAP** | VERIFICATO | import espliciti; presets in `utils/animations.js` |
| 3D | **three.js**, incluso come sorgente locale `./src/client/three.min.js` (versione forkata/pinnata) + `three-gltf-loader` | VERIFICATO | import in ogni componente 3D |
| Wrapper 3D | **libreria propria di AQuest**, `components/ReactThree/*` (Scene, Camera, Mesh, Material, Texture, Uniforms, RayCaster, OrbitControls) — **non** react-three-fiber | VERIFICATO | i file sono nel bundle sotto `src/common/components/ReactThree/` |
| Shader | **GLSL** iniettato in materiali standard via `onBeforeCompile`, sostituendo i chunk `fog_fragment` e `dithering_fragment` | VERIFICATO | `useOnBeforeCompile.js` + 16 file `.frag`/`.vert` |
| Modelli | **glTF + .bin** (nessuna compressione Draco) | VERIFICATO | `/front/models/**/*.gltf` + `.bin` gemelli nell'indice CDX |
| Scroll | smooth scroll **fatto in casa**: `normalize-wheel` + `lerp` + `range`, solo desktop | VERIFICATO | `Scrollbar.jsx` |
| Swipe | `react-swipeable` | VERIFICATO | in `components-Slider.927e4.js` |
| Osservazione | `intersection-observer` (polyfill) + `react-hook-intersection-observer` + `@rooks/use-mutation-observer` | VERIFICATO | |
| Code splitting | webpack + `@loadable/component`, con preload dichiarato in `<head>` (`data-chunk`) | VERIFICATO | `<link data-chunk=components-Slider rel=preload …>` |
| CSS | **CSS Modules** (classi generate: `_17cwx`, `yLeWK`…) + custom properties come design token | VERIFICATO | mappa classi nel bundle |
| Immagini | `<picture>` con **WebP + fallback PNG/JPG**, selezione della cartella per media query | VERIFICATO | `<source type=image/webp>` in ogni blocco |
| PWA | manifest + `register-service-worker` | VERIFICATO | `<link rel=manifest href=/manifest.json>` |
| CMS / backend | **nopCommerce** su **IIS/ASP.NET** | VERIFICATO (per le versioni 2020+) / SUPPOSTO per il 2019 | i cookie si chiamano `.Nop.Customer` e `.Nop.Authentication`; le copie successive espongono URL tipici di nopCommerce (`/addproducttocart/catalog/`, `/backinstocksubscriptions/manage`); Awwwards elenca `IIS` |
| API | REST propria: `/api/pages/homepage`, `/api/pages/party`, `/api/pages/create`, `/api/pages/relax`, `/api/pages/sleep`, `/api/category`, `/api/news/categories`, `/api/product/pre-rolled/pure` | VERIFICATO | indice CDX del dominio |
| Analytics | Google Tag Manager `GTM-M4HCC2T`, con dataLayer e-commerce | VERIFICATO | inline nell'`<head>` |
| Hosting | non verificato | — | Awwwards dice IIS; nessun header d'archivio consultato |

## Peso e prestazioni

Numeri veri, ma **misurati sulle copie d'archivio** (i valori dell'indice CDX sono la dimensione del
record WARC, cioe' in pratica il **trasferito compresso**).

| risorsa | trasferito | non compresso |
|---|---|---|
| HTML `/en` server-rendered | non rilevato | **72 KB** (contiene anche ~293 etichette UI incorporate) |
| `main.0ef14.js` | **156 KB** | 661 KB |
| `main.98273.css` | **13.7 KB** | 68 KB |
| `components-Slider.927e4.js` (la scena 3D) | **23.2 KB** | 105 KB |
| `bootstrap.3d234.js` | 2.4 KB | 3.9 KB |
| `vendors.13495.js` / `vendors.65087.css` (React, three.js, anime.js) | **non archiviati** | — |
| font `monument-extended.woff2` | 20 KB | — |
| font icona `.woff2` | 3.9 KB | — |
| texture `create-diffuse.webp` (qualita' media) | 192 KB | — |
| texture `prerolled-diffuse.webp` | 265 KB | — |
| texture `foglia-diffuse.webp` | 174 KB | — |
| texture `party-diffuse.webp` | 145 KB | — |
| `matcap.webp` | 8 KB | — |
| geometria, per coppia di oggetti (`barca_razzi.gltf` + `.bin`) | ~85 KB | — |

**Stima onesta**: la homepage senza WebGL sta sotto ~250 KB di codice (piu' il bundle vendors, non
misurabile: con React + three.js + anime.js e' verosimile un altro 250-400 KB compressi). **Ogni
pagina-mondo aggiunge circa 340 KB di geometria (4 coppie) + ~190 KB di texture**, cioe' mezzo mega
per sala, e sono quattro sale.

Il giudizio dei giudici: **WPO 7.33/10** e **Accessibility 6.00/10** nel Developer Award — cioe' il
sito era percepito come pesante e poco accessibile gia' nel 2019. Coerente con: `overflow: hidden`
sull'`<html>`, scroll riscritto a mano, e un pannello che ti obbliga a ruotare il telefono.

Nessun dato reale di Lighthouse, LCP o numero di richieste: la pagina non e' piu' visitabile e
l'archivio non conserva i tempi.

## Tre cose da rubare

1. **Un unico token che ricolora CSS, browser e shader insieme.**
   `<html style="--color-primary:#cc504b">` viene emesso **dal server**, insieme a
   `<meta name="theme-color" content="#cc504b">`; lo stesso valore entra nel WebGL come
   `uniform vec3 uColor` e li' fa `blendHardLight(colore_texture, uColor/255.)`. Risultato: cambi una
   riga e cambiano insieme la pagina, la barra del browser su Android e la tinta degli oggetti 3D —
   **senza flash, perche' il colore c'e' gia' nel primo byte di HTML**. Rifacibile in mezza giornata
   su qualunque sito con temi.

2. **Un atlas 2×2 e un `vec4` per accendere un oggetto alla volta.**
   Quattro oggetti, una texture, un draw call: il fragment shader guarda in quale quadrante UV si
   trova il pixel e decide quanto sbiancarlo (`mix(colore, whiteColor, uWhiteColorsFactors.x|y|z|w)`).
   Animando quel `vec4` con anime.js ottieni "il selezionato e' a colori, gli altri sono in bianco"
   **a costo zero di geometria e di materiali**. Vale per gallerie di prodotto, mappe, configuratori.

3. **Il sipario che si ritira invece della dissolvenza.**
   Un solo `<path>` SVG con `preserveAspectRatio="none"` a tutto schermo, e due morph consecutivi
   del suo attributo `d` (`easeInQuint` 400 ms → `easeOutQuint` 800 ms). Costa nulla, non richiede
   WebGL, funziona anche su mobile, ed e' **gia' nell'HTML server-rendered**, quindi copre anche il
   tempo in cui il JS non e' ancora arrivato. E' il pezzo che Awwwards ha citato per primo.

**Bonus, gratis**: `data-hover-text="PRODUCTION"` su ogni link. Il testo dell'hover e' nel DOM come
attributo, quindi l'effetto si fa in CSS puro con `::after { content: attr(data-hover-text) }` senza
duplicare il markup.

## Non verificato

- **Se il sito sia stato Site of the Year 2019.** La scheda Awwwards dice Site of the Day
  (19/08/2019). Il budget di ricerca web di questa sessione era esaurito, quindi non ho potuto
  cercare le nomination annuali. Nel dubbio: SOTD sicuro, SOTY no.
- **L'aspetto.** Non ho mai visto una schermata: nessuno screenshot, nessun video, il WebGL non gira
  in archivio. Composizione, spaziature, forme e "come si sente" sono ricostruiti dal codice.
- **Le regole CSS vere delle classi.** `main.98273.css` contiene solo i token e le basi; le regole
  dei CSS Modules (`_1KArd`, `_3OHLm`…) stanno in bundle non archiviati. Quindi: colori di sfondo dei
  pannelli, dimensioni dei bottoni, comportamento dell'hover `data-hover-text` — dedotti, non letti.
- **Come sono serviti Montserrat e Krona One.** Dichiarati nei token, ma nessun `@font-face` e
  nessun `<link>` a Google Fonts trovato.
- **Il verso della disparita' 700/1200 ms.** In `useSliderAnimation.js` il codice e'
  `setTimeout(a, m ? 1200 : 700)` con `m = useDesktop()`. Preso alla lettera, **il desktop e' il
  ramo lento (1200 ms)**, il che e' controintuitivo: mi aspetterei il contrario. Non ho modo di
  provarlo, quindi riporto entrambe le letture.
- **Il suono.** Nessun file audio nell'indice d'archivio del dominio; nessun import di libreria
  audio nel bundle. Probabilmente il sito era muto, ma non posso escludere audio caricato via API.
- **Il preloader "vero"**: non so se ci fosse una percentuale di caricamento visibile. Nel codice c'e'
  `AsyncCounter` e `CircleProgress`, ma non ho ricostruito dove venissero montati.
- **Prestazioni reali** (LCP, numero di richieste, punteggio Lighthouse): impossibili da misurare.
  Restano solo i sotto-voti del Developer Award di Awwwards.
- **Chi ha fatto cosa fra Retail 710 e AQuest.** Il codice e' tutto AQuest; Retail 710 e' la societa'
  svizzera titolare del marchio. Awwwards li accredita entrambi come studio.
- **La versione italiana e francese**: esistevano (`hreflang` it/fr, cartelle `/it`, `/de`), ma ho
  letto solo `/en` e `/de`. I testi italiani originali non li ho estratti.
