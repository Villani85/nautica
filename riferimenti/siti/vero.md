# Vero New-York

- **URL**: https://www.verostudio.com (HTTP 200, nessuna sostituzione necessaria. `verostudio.com` senza `www` e' l'host canonico dichiarato in robots.txt e sitemap.xml, ma il dominio con `www` risponde 200 direttamente)
- **Premio**: **non verificato.** Non ho potuto controllare Awwwards/FWA/CSSDA: il budget di ricerca web della sessione era esaurito quando sono arrivato a questa voce. Il sito non espone nessun badge di premio ne' in home ne' nel piede. L'unica attribuzione presente e' quella dei crediti (sotto).
- **Studio**: due firme distinte, lette **testualmente** dal file di traduzione servito nella pagina (`footer.credits.text`):
  > `Designed by <a href='https://www.rodeostudio.fr/'>Rodeo Studio</a><br />Developed by <a href='https://plutot.cool/'>plutot.cool</a>`

  Quindi: **design Rodeo Studio (rodeostudio.fr), sviluppo plutot.cool**. Il committente e' Vero, studio di New York; la fondatrice e' **Madilyn Ontiveros Plumlee** (citata due volte nel sito).
- **Anno**: i documenti del CMS sono stati creati fra il **27/01/2026** (`root-layout`, `layout`) e il **28/01/2026** (`product-page`, `checkout-page`); ultime modifiche di contenuto fra il **12/06/2026** e il **16/07/2026**. Il deploy servito il giorno della lettura e' `dpl_5DJLEfML6Tahb8bYNMHiKG68mpNy`. Quindi: **online dal 2026, contenuti aggiornati a luglio 2026.**
- **Letto il**: 13/08/2026

**Nota di metodo.** Non ho aperto nessuna scheda di browser: tutto viene da `curl` sull'HTML, sui 63 chunk JavaScript, sui 5 fogli di stile, e da **interrogazioni dirette all'API di Sanity**, che su questo progetto e' pubblica in lettura (`https://xei5vqg0.apicdn.sanity.io/v2024-01-01/data/query/production`). Questo mi ha dato i testi esatti, la struttura delle sezioni e l'intero file di traduzione — cioe' tutte le microcopy che di norma restano invisibili da fuori. Non ho quindi mai *visto* il sito: tutto quello che segue e' letto nel codice, e dove deduco un effetto senza averlo osservato lo dico.

---

## Cosa vende

Una **scultura su commissione ricavata dall'abito da sposa della cliente**: l'abito viene ritirato, digitalizzato, mai alterato, restituito; la scultura viene stampata in 3D e rifinita a mano nello studio di New York. Alta 9-15 pollici (23-38 cm), pesa 5-10 libbre (2,3-4,5 kg), finitura "ceramica".

**Non e' un e-commerce di catalogo: e' un e-commerce di una cosa sola.** C'e' un solo prodotto (`/product`), un solo prezzo di partenza — **$2,200** — e un carrello che porta a un acconto Stripe fisso di **220000 centesimi = $2.200** (`INITIAL_PAYMENT_AMOUNT_CENTS = 22e4`, letto nel bundle). Consegna in **12-16 settimane**.

## A chi

Sposa americana di fascia alta (o chi le fa un regalo), nel momento esatto in cui l'abito e' appena tornato dal matrimonio e sta per finire in una scatola. Il testo lo dice senza giri:

> "You wear your gown once, then it's tucked away for years."

Il compratore secondario e' **la lista nozze**: c'e' una pagina `/registry` dedicata a farsi aggiungere su The Knot, Zola e Over The Moon. E c'e' un terzo canale, piu' silenzioso: i **designer di abiti** (pagina `/featured-designers`, e ogni scultura in home e' didascalizzata col nome della maison — "Gown by Antonio Riva Milano", "Alyssa Monique Bridal").

Uscendo dal sito deve pensare: *questo non e' un servizio di conservazione dell'abito, e' commissionare un'opera d'arte* — e $2.200 e' il prezzo di un'opera, non di un servizio.

## Idea regista

**L'abito che hai indossato una volta diventa oggetto: il sito lo fa letteralmente, mostrandoti un vestito vero in 3D che ruota, si allontana e si dissolve in scultura mentre scorri.**

## Il momento

**Il "Dress Discover", la seconda sezione della home.** E' l'unico punto del sito dove tutto converge, ed e' costruito con una precisione che si legge nel codice.

La sezione e' alta `100lvh + 1800px`. Dentro c'e' un contenitore `position: fixed` alto `100lvh` con un canvas WebGL. Il modello e' **un abito vero fotogrammetrato** — `/webgl/dress-felicity/dress-felicity.glb`, **1,43 MB**, piu' normal map (1,15 MB) e occlusion map (1,06 MB): **3,65 MB per un solo oggetto.**

Su quei 1800 px di scroll gira una timeline `anime.js` creata con `autoplay: false` e **fatta avanzare a mano** con `timeline.seek(durata * progresso)`, dove
`progresso = (scrollY - sezione.top + contenitore.height) / (sezione.height + contenitore.height)`.

La coreografia, letta tacca per tacca dal bundle:

| tacca | cosa succede |
|---|---|
| `start` | camera in `y = 2.65`, `zoom = 1.6`, uniform `fade` alla base dell'abito |
| 50 → 337 | **la camera scende** da `y = 1.9` a `y = -1.5`, `ease: linear`, durata 287 |
| 50 → 350 | **l'abito compie un giro completo**, `rotation.y` da `0` a `-2π`, `linear`, durata 300 |
| ~112 | si apre il **primo punto di interesse**, resta 39 tacche, si chiude |
| ~153 | si apre il **secondo**, resta 41 tacche, si chiude |
| 208 → 298 | la seconda riga di testo sale di **620 px** (`ease: inOutQuad`) |
| 240 → 280 | e sfuma a `opacity: 0` |
| 200 → 300 | `zoom` da `1.6` a `1.4`, `ease: inQuad` |
| −300 dalla fine | l'uniform `fade` si allarga da `min.y + 0.2 * scale.y` a `min.y + 0.6 * scale.y`: **l'abito si dissolve dal basso** |

I due punti di interesse sono **etichette HTML agganciate a coordinate 3D**. Le loro posizioni nello spazio sono fisse nel codice — `[[0.2, 2.35, -0.12], [0.2, 1.9, -0.12]]` — e un `requestAnimationFrame` continuo chiama `scene.projectPOI(i, vec)`, proietta il punto con la camera e scrive `--x` / `--y` in pixel sul nodo DOM. Cioe': **il pallino "+" resta incollato alla spalla dell'abito mentre l'abito ruota**, senza che il DOM sappia nulla di 3D.

Sopra tutto questo, due righe di testo che si scambiano con una rivelazione mascherata riga per riga:

> `your most` / `important` / `dress` → `DESERVES TO` / `last` / `forever.`

E l'ombra e' una **PCSS vera** (Percentage-Closer Soft Shadows): 37 campioni Poisson su 11 anelli, shadow map 2048×2048, calcolata in un fragment shader scritto a mano. Per un sito di matrimoni.

Il secondo momento, piu' breve: la **citazione di Carl Sandburg** in `168px` maiuscolo con una moneta 3D sopra (vedi *Animazioni*).

## Struttura, sezione per sezione

Le sezioni sono tipizzate nel CMS: quello che segue e' l'ordine reale del documento `Homepage` in Sanity, non una mia lettura a occhio.

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |
|---|---|---|---|
| `RootLayoutLoader` | piastra beige con un **foro rettangolare che si allarga**; sopra e sotto il foro, `where your wedding dress becomes art.`; contatore `0%` | aspetta | copre lo schermo, ~1,9 s di animazione |
| `main-hero` | video a schermo intero, H1 `Custom SCULPTURE of your WEDDING DRESS.`, marchio Vero in WebGL, freccia "scroll" | legge, scorre | ~1 |
| `dress-discover` | **l'abito 3D** (il momento) + titolo + descrizione + bottone `Start your COMMISSION` | scorre; puo' aprire i 2 punti di interesse | **~2,8** (`100lvh + 1800px`) |
| `full-size-scroller-stepper` | 3 immagini a schermo intero in sticky, che si scoprono con un tergicristallo laterale; sopra, `From dress,` → `to data,` → `to sculpture.`; titolo `the ESSENCE of VERO` / `where INNOVATION meets CRAFTSMANSHIP` | scorre | **~3** (3 blocchi sticky da 100lvh) |
| `secondary-hero` | `a PROCESS BUILT for PERFECTION` / `so THAT YOU BECOME ART.` | legge | ~1 |
| `diptych` | colonna sinistra: una foto **sticky** che resta ferma; colonna destra: coppie di immagini mascherate, il testo `Worn once. / Never meant to disappear.`, il bottone `DISCOVER our PROCESS`, la citazione della fondatrice | scorre | ~3 |
| `secondary-hero` | `your MEMORY` / `will FOREVER be a MASTERPIECE.` | legge | ~1 |
| `media-grid-push` | **20 foto** in griglia a 4 colonne con parallasse a velocita' diverse per colonna; il bottone `Explore the GALLERY` resta **incollato a meta' schermo** mentre la griglia gli scorre dietro | scorre, clicca | ~3 |
| `large-quote` | moneta 3D + poesia di Carl Sandburg in 5 righe da 168 px | scorre | ~1,5 |
| `reassurance` | `Your story deserves to be sculpted` / `We'd be honored to craft it with you.` + `Start your COMMISSION` | clicca | ~1 |
| `RootLayoutFooter` | marchio `Vero` in WebGL che si rivela lettera per lettera, nav, cattura email, crediti | clicca | ~1 |

**Pagine del sito** (da `sitemap.xml`): `/` · `/product` (priorita' 0.9) · `/gallery` (0.8) · `/registry` (0.7) · `/featured-designers` · `/process` · `/about` · `/legals/faq` · `/legals/terms` · `/legals/policy`. Piu' tre rotte escluse dai motori in `robots.txt`: **`/checkout`, `/thank-you`, `/playground`**.

## L'esperienza in ordine di tempo

**Primi dieci secondi, desktop, arrivo diretto sulla home**

- **0,0 s** — l'HTML arriva in **22,3 KB in brotli**. Header `Cache-Control: private, no-cache, no-store` e `X-Vercel-Cache: MISS` a ogni richiesta: la pagina **non e' mai in cache di bordo** (vedi *Peso e prestazioni*). Nel `<head>` ci sono gia' `preconnect` e `dns-prefetch` verso `xei5vqg0.api.sanity.io`, e il **preload dei due tagli di Louize Display** (tondo e corsivo).
- **0,0 s** — parte il loader. E' l'elemento piu' curato del sito e non usa JavaScript per animarsi: e' **CSS puro**. Una piastra `--color-beige-100` a schermo intero con due maschere sovrapposte in `mask-composite: exclude`; l'animazione `mask-expand` fa crescere la maschera-buco da `0 0` a `15.6vw × (15.6vw * 100lvh/100vw)` in **1,4 s con `cubic-bezier(.83,0,.17,1)` (in-out quint), dopo 0,5 s di ritardo**. In parallelo il contenuto viene ritagliato con un `clip-path` a 10 vertici che apre lo stesso rettangolo. Risultato: **un foro rettangolare si apre al centro dello schermo e dentro si vede gia' il video dell'hero.**
- **0,0-1,9 s** — attorno al foro, le parole. Sopra: `where` / `your`; sotto: `wedding` / `dress` / `becomes art.` Sono a **32 px sotto i 480 px di larghezza, poi fluide (`calc(7.05vw - 1.85px)` sopra, `calc(7.85vw - 5.69px)` sotto), fino a 120 px e 130 px oltre i 1728 px**. Ogni riga entra con due animazioni sovrapposte: `fade-in` (0,6 s) e `dynamic-fade-in` (1,5 s) che porta l'opacita' **solo a `0.14`** — restano volutamente fantasma. E si allontanano dal centro (`dynamic-slide`, `translate3d(0, ±altezza-foro/2, 0)`) mentre il foro cresce fra loro. Il contatore `0%` sale accanto.
- **~1,9 s** — a caricamento finito: `mask-full` (0,7 s, in-out quart) spalanca la maschera a tutto schermo, `slide-out` sputa le due righe fuori (`-25%` sopra, `+25%` sotto) con `ease-in-quint`. Il velo sparisce.
- **~2 s** — l'header compare (`opacity 0 → 1` in **1 s**), le sue voci entrano dal basso con un keyframe `reveal` sfalsato: `translateY(calc((var(--i) + 1) * 60px))` → `0`, cioe' ogni voce parte da 60 px piu' in basso della precedente.
- **~2 s** — l'H1 dell'hero si rivela, ed e' **il gesto tipografico che regge tutto il sito**: le parole in *corsivo* e quelle in MAIUSCOLO si comportano in modo diverso.
  - le parole in corsivo (`em`): `opacity 0 → 1`, **0,6 s**, `ease-out-sine`;
  - le parole in maiuscolo: sono in un contenitore `overflow: hidden` e **salgono da `translateY(100%)` a `0` in 1,4 s con `ease-out-expo` (`cubic-bezier(.19,1,.22,1)`)**.
  - entrambe ritardate di `calc(var(--stagger) * .1s + .55s)`, con `--stagger` scritto in linea su ogni riga dal loro splitter di testo.

  Quindi `Custom` sfuma, `SCULPTURE` sale, `of your` sfuma, `WEDDING DRESS.` sale. **Il corsivo respira, il maiuscolo si alza.** Questa regola vale su ogni titolo del sito.
- **~2 s** — il marchio "Vero" nell'hero **non e' un'immagine**: e' una scena WebGL (`LogoScene`) che disegna il lettering con un font MSDF (`/webgl/logo/font.png`, 87 KB) e lo rivela con un shader — `smoothstep(-fwidth, +fwidth, mediana(rgb) - soglia)` dove la soglia va da `0.8` a `0` per glifo, sfalsata da `uStagger` e mossa da `uTime` con una `easeOutCubic` (`1 - pow(1-t, 3)`). Se WebGL non c'e', il componente ricade su un `<Brand>` SVG. Il video sotto e' `autoPlay muted loop playsInline preload="metadata"`.
- **2-10 s** — l'utente scorre. **Lo scroll e' nativo.** Nessun Lenis, nessuno smooth scroll, nessun wheel hijacking (vedi *Stack*). Il video dell'hero viene mangiato da un `clip-path` a 4 vertici che si stringe fino al **70%** in larghezza e altezza (`--mask-scale: calc(1 - .3 * var(--mask-progress))`, con la larghezza in ritardo di `0.1` sull'altezza), con `transition: clip-path .2s var(--ease-out-quart)` a smorzare il campionamento discreto dello scroll.
- Contemporaneamente il marchio dell'hero **vola nell'header**: ci sono tre nodi con le stesse identiche misure (`beacon`, `logo`, `brand`: 230×70 px mobile, 250×75 px, 290×90 px oltre 1728 px), di cui `logo` e `brand` sono `position: fixed`. E' un FLIP fatto a mano: il `beacon` misura dove deve arrivare, il `logo` ci va.

**Poi, a blocchi**

- **Dress Discover** — descritto sopra. Da segnalare: c'e' anche una **rotazione al movimento del mouse**, ma minuscola e volutamente frenata: `pointerRotationTarget` clampato a **±0.01π sull'asse x (±1,8°) e ±0.05π sull'asse y (±9°)**, inseguito con `rotation += (target - rotation) * min(1, 0.003 * delta)`. Non e' un effetto-giocattolo: e' il tremito di un oggetto tenuto in mano.
- **Il tergicristallo** (`FullSizeScrollerStepper`) — tre blocchi `position: sticky; top: 0` alti `100lvh`, ognuno ritagliato con
  `clip-path: polygon(calc((1 - var(--mask-progress)) * 100%) 0, 100% 0, 100% 100%, calc((1 - var(--mask-progress)) * 100%) 100%)`.
  Cioe': **il bordo sinistro dell'immagine scorre da destra a sinistra** e scopre la foto sotto. Il primo blocco parte gia' scoperto.
- **Il dittico** — la colonna sinistra e' una foto `sticky` che resta ferma per tre schermate mentre a destra scorre il racconto. Le foto di destra entrano con due maschere diverse:
  - `DiptychDoubleMaskMedia`: da `polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)` a tutto pieno, **1,6 s con `ease-out-quint`**, innescato da `is-visible` (IntersectionObserver);
  - `DiptychSingleMaskMedia`: legato allo **scroll**, non allo stato — `--progress: clamp(.1, calc(var(--mask-progress) / .4), 1)` e un poligono che si apre da `25%-85%` in orizzontale e `10%-90%` in verticale. Nota il `/.4`: **la maschera finisce di aprirsi al 40% dello scroll disponibile**, poi resta ferma.
- **La griglia delle 20 foto** — quattro colonne, e la parallasse **e' diversa per colonna**: `--multiplier: 2.4` sulle colonne esterne (`4n+1`, `4n+4`), `1.2` su quelle interne (`4n+2`, `4n+3`), applicato come `translate3d(0, calc(var(--y) * var(--multiplier)), 0)`. Le colonne ai bordi corrono al doppio di quelle centrali. Sotto i 768 px il ritmo passa a 5 (`5n+1`, `5n+5` veloci).
  Sopra, un velo: `linear-gradient` da beige al 2% a beige al 95%, alto `50% + 100px`, con `--opacity` guidata da JS. E dentro quel velo, **il bottone `Explore the GALLERY` in `position: sticky; bottom: 50lvh`** — resta esattamente a meta' schermo mentre le foto gli passano dietro.
- **La citazione** — cinque righe, e ogni riga e' scritta nel CMS come **due meta'**: `{start: "I held a", end: "moment"}`, `{start: "in my hand", end: "brilliant"}`, e cosi' via. Il contenitore e' `white-space: nowrap; overflow: clip` con altezza bloccata a `calc(1em * 1.1 * var(--lines-count))`. Le due meta' si muovono in orizzontale in senso opposto: **le righe si compongono mentre scorri.** Sopra, la moneta 3D (`CoinScene`, `/webgl/coin/coin.glb` + tre mappe PBR, 1,66 MB in tutto) larga `clamp(44px, 8vw, 140px)`.
- **Il piede** — la parola `Vero` di nuovo in WebGL (`LogoScene`, stavolta `color: 1578517` = `#181615`), rivelata glifo per glifo.

**E poi la parte che vende.** Vedi *Testi veri* e *Tre cose da rubare*: la pagina prodotto e il checkout sono un sito diverso, di proposito.

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| scroll di pagina | niente | — | **nessuna** | `useScroll` e' `addEventListener('scroll', …, {passive:true})` puro. Nessun lerp, nessun smooth scroll |
| loader, foro | `mask-size` da `0 0` a `15.6vw × altezza` | tempo | **1,4 s `cubic-bezier(.83,0,.17,1)`**, delay 0,5 s | CSS puro, `mask-composite: exclude` |
| loader, contenuto | `clip-path` a 10 vertici | tempo | stessa curva e durata | apre lo stesso rettangolo |
| loader, uscita | `mask-size` a `100% 100%` | stato (caricato) | **0,7 s `cubic-bezier(.76,0,.24,1)`**, delay 0,15 s | |
| loader, testo | `translate3d(0, ±altezza-foro/2)` poi `±25%` | tempo, poi stato | in-out quint 1,4 s, poi **`cubic-bezier(.64,0,.78,0)` (in-quint) 0,7 s** | opacita' massima `0.14` |
| H1, parole corsive | `opacity 0 → 1` | stato (`is-title-revealed`) | **0,6 s `cubic-bezier(.61,1,.88,1)` (out-sine)** | delay `--stagger * .1s + .55s` |
| H1, parole maiuscole | `translateY(100% → 0)` dentro `overflow:hidden` | stesso | **1,4 s `cubic-bezier(.19,1,.22,1)` (out-expo)** | stesso delay |
| marchio hero | `translate` da centro schermo all'header | scroll | non verificato (calcolato in JS) | tre nodi di misure identiche: `beacon`, `logo` fixed, `brand` fixed |
| video hero | `clip-path` a 4 vertici, scala fino a `0.7` | scroll (`--mask-progress`) | `transition: clip-path .2s var(--ease-out-quart)` | la larghezza ha `max(0, progress - .1)`: ritarda sull'altezza |
| abito 3D, camera | `position.y` da `1.9` a `-1.5` | scroll (`seek`) | **`linear`**, durata 287 | timeline anime.js scrubata |
| abito 3D, rotazione | `rotation.y` da `0` a `-2π` | scroll | **`linear`**, durata 300 | giro completo |
| abito 3D, zoom | `1.6 → 1.4` | scroll | `inQuad`, durata 100, da tacca 200 | |
| abito 3D, dissolvenza | uniform `fade` da `+0.2·h` a `+0.6·h` | scroll | `inOutQuad`, durata 100 | l'abito si smaterializza dal basso |
| abito 3D, mouse | `rotation.x/y` | movimento del puntatore | inseguimento `min(1, .003 * delta)` | clampato a **±1,8° / ±9°** |
| punti di interesse | `--x` / `--y` in px sul nodo DOM | rAF continuo | nessuna (riproiezione a ogni frame) | `camera.project()` di un `Vec3` fisso |
| POI, apertura | `scale(1 → 0)` sul "+", `rotate(-45deg)`, contenuto `opacity 0 → 1` | stato (clic o timeline) | `opacity .3s` con 50 ms di ritardo | |
| tergicristallo | `clip-path`, bordo sinistro da 100% a 0% | scroll (`--mask-progress`) | lineare sul progresso | 3 blocchi `sticky` |
| dittico, doppia maschera | `clip-path` da riquadro 20-80% a pieno | stato (`is-visible`) | **1,6 s `cubic-bezier(.22,1,.36,1)` (out-quint)** | |
| dittico, maschera singola | `clip-path` | scroll | `clamp(.1, progress / .4, 1)`, `transition .2s out-quart` | finisce al 40% dello scroll |
| griglia 20 foto | `translate3d(0, calc(var(--y) * var(--multiplier)))` | scroll | lineare | `2.4` colonne esterne, `1.2` interne |
| bottone galleria | resta a meta' schermo | `position: sticky; bottom: 50lvh` | — | CSS puro |
| citazione | due meta' di riga in orizzontale | scroll | non verificato | contenitore `nowrap` + `overflow: clip` |
| moneta 3D | rotazione | non verificato (probabile tempo o scroll) | non verificato | `CoinScene` |
| marchio WebGL | soglia MSDF da `0.8` a `0` per glifo | tempo (`uTime`) | **`easeOutCubic` (`1 - pow(1-t,3)`)** nello shader, sfalsata da `uStagger` | usato in hero e nel piede |
| griglia galleria | `opacity` + `scale(.85 → 1)` | stato (filtro attivo) | **0,6 s `cubic-bezier(.33,1,.68,1)` (out-cubic)**, stagger 0,1/0,2 s | in uscita `in-cubic` |
| freccia "scroll" | `opacity` `.2 → .7 → .2` | tempo | **5,2 s `cubic-bezier(.455,.03,.515,.955)` infinito** | disattivata con `prefers-reduced-motion` |
| voci di menu | `translateY(calc((var(--i)+1) * 60px)) → 0` | stato (apertura) | `ease-out-quint` | ogni voce parte 60 px piu' in basso |
| icona hamburger | due barre ruotano a `±45°` | stato | `.3s` con **`0.6 s` di ritardo** in chiusura, `0 s` in apertura | le barre sono SVG in base64 **con le estremita' calligrafiche**, non rettangoli |
| header, sfondo scuro | `opacity 0 → .5` su un velo `#181615` | stato (menu aperto) | `.3s ease-in-out` | |
| fondo pagina | `document.body.style.background` | IntersectionObserver | nessuna transizione dichiarata | vedi *Colori* |
| tutto il resto | — | — | — | `@media (prefers-reduced-motion: reduce)` azzera tutto a `.01ms` |

**Il paletto di easing dichiarato in `:root`** (14 curve, tutte usate):

`--ease-custom-1: cubic-bezier(.25,.1,.25,1)` · `--ease-custom-1-reverse: cubic-bezier(.75,0,.75,.9)` · `--ease-out-expo: cubic-bezier(.19,1,.22,1)` · `--ease-in-out-expo: cubic-bezier(.87,0,.13,1)` · `--ease-in-quart: cubic-bezier(.5,0,.75,0)` · `--ease-out-quart: cubic-bezier(.25,1,.5,1)` · `--ease-in-out-quart: cubic-bezier(.76,0,.24,1)` · `--ease-in-sine: cubic-bezier(.12,0,.39,0)` · `--ease-out-sine: cubic-bezier(.61,1,.88,1)` · `--ease-in-quint: cubic-bezier(.64,0,.78,0)` · `--ease-out-quint: cubic-bezier(.22,1,.36,1)` · `--ease-in-out-quint: cubic-bezier(.83,0,.17,1)` · `--ease-in-out-circ: cubic-bezier(.85,0,.15,1)` · `--ease-out-cubic: cubic-bezier(.33,1,.68,1)` · `--ease-in-cubic: cubic-bezier(.32,0,.67,0)` · `--ease-in-out-cubic: cubic-bezier(.65,0,.35,1)` · `--ease-in-quad`, `--ease-out-quad`, `--ease-in-out-quad`.

## Colori

Undici token, e **niente tema scuro**: il sito ha un solo vestito.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| **fondo pagina (default)** | `#f3f0ed` — `--color-beige-100` | `--color-background-primary`. E' il fondo di quasi tutte le sezioni (`theme: "ultra-light"`) e la piastra del loader |
| **fondo pagina (variante)** | `#e6d8cc` — `--color-beige-300` | `--color-background-secondary`, tema `light`. Beige piu' caldo, per le sezioni che devono staccare |
| **testo** | `#181615` — `--color-grey-900` | tutto il testo di lettura, il marchio nel piede, il velo del menu al 50%, il colore dei campi Stripe |
| **fondo dell'`<html>`** | `#f8f8f8` — `--color-grey-100` | `html { background-color }`, e il colore del testo sul video dell'hero (il titolo usa `--color-beige-100`) |
| **testo tenue / placeholder** | `#979696` — `--color-grey-600` | placeholder dei campi, anche dentro gli Stripe Elements |
| **bordi / righe** | `#d9d9d9` — `--color-grey-300` | filetti, separatori |
| **errore** | `#9d1414` — `--color-red` | `--color-error`, messaggi di validazione |
| **accento** | `#e97e00` — `--color-orange` | dichiarato in `:root` ma **non l'ho trovato usato in nessuna regola**. Probabile residuo, o riservato a uno stato che non ho raggiunto |
| nero / bianco | `#000000` / `#ffffff` | `--color-black`, `--color-white`; usati come `--icon-color` nei due temi dell'header |

**Il meccanismo del fondo, che vale piu' della tavolozza.** Non ci sono sezioni con lo sfondo dipinto. C'e' un componente `SectionContainer` che avvolge ogni blocco e fa questo:

```js
const inView = useInView(ref, { rootMargin: "-50% 0px -50% 0px" })
useEffect(() => { if (inView) document.body.style.background = THEMES[theme] }, [inView, theme])
// THEMES = { "ultra-light": "var(--color-beige-100)", light: "var(--color-beige-300)" }
```

`rootMargin: "-50% 0px -50% 0px"` riduce il riquadro di osservazione a **una riga alta zero a meta' schermo**. Tradotto: **la sezione che sta attraversando il centro dello schermo ridipinge il fondo di tutto il documento.** Non c'e' `transition` dichiarata, quindi il cambio e' netto.

L'header ha due temi separati dal fondo: `theme-plain` (`--icon-color: #000`, e per l'icona hamburger un `filter: invert()`) e `theme-transparent` (`--icon-color: #f8f8f8`, sopra il video).

## Tipografia

Due famiglie, **entrambe ospitate in casa** (`/fonts/`), nessun servizio esterno, nessun font variabile. Servite in `woff2` con `woff` di riserva e `font-display: swap`; solo i due tagli di Louize sono in `<link rel="preload">`.

| famiglia | ruolo | tagli | peso file |
|---|---|---|---|
| **Louize Display** | `--font-family-primary` — tutti i titoli, il corpo del testo, i bottoni | tondo 400, **corsivo 400** | **50,4 KB** (tondo) |
| **Beausite Classic** | `--font-family-content` — etichette, moduli, microcopy | 400, 500 | **8,0 KB** (regular) |

> **Da segnalare: il file si chiama `BeausiteClassicWebTrial-Regular.woff2`.** In produzione, su un sito che incassa pagamenti con chiave Stripe live, gira **la versione di prova** del carattere. E' un fatto letto nel `@font-face`, non un'interpretazione.

Ripiego dichiarato: Louize → `Georgia, "Times New Roman", Garamond, "Palatino Linotype", "Book Antiqua", serif`. Beausite → `Roboto, "Helvetica Neue", Helvetica, Arial, "Segoe UI", sans-serif`. Nessuna metrica di compensazione (`size-adjust`, `ascent-override`): con `swap` **il salto tipografico al caricamento c'e'**.

**La scala.** I token sono ridefiniti in blocco a 930 px. Colonna sinistra = mobile, destra = desktop.

| livello | famiglia | peso | corpo mobile → desktop | interlinea | note |
|---|---|---|---|---|---|
| `--font-display-1` | Louize | 400 | **46 px → 120 px** | 1.1 → 1 | titoli principali |
| `--font-display-2` | Louize | 400 | 35 px → 40 px | 1 → 1 | |
| `--font-display-3` | Louize | 400 | **25 px → 80 px** | 1.3 → 1 | il salto piu' violento della scala: **×3,2** |
| `--font-display-4` | Beausite | 500 | 20 px → 30 px | 1.15 → 1.06 | unico livello "display" in sans |
| `--font-display-5` | Louize | 400 | 18 px → 21 px | 1.5 → 1 | occhielli, contatti |
| `--font-body` | Louize | 400 | **18 px** (non cambia) | 1.5 | il testo di lettura e' **in serif, corsivo compreso** |
| `--font-label-1` | Louize | 400 | 18 px → 16 px | 1.1 | **si rimpicciolisce** sul desktop |
| `--font-label-2` | Beausite | 500 | 18 px → 15 px | 1.5 | idem |
| `--font-label-form` | Beausite | 400 | 15 px | 1 | etichette dei moduli |
| `--font-button` | Louize | 400 | 15 px | 1 | `letter-spacing: .06em` |
| `--font-tiny-1` | Beausite | 400 | 13 px | 1.6 | |
| `--font-tiny-2` | Beausite | 400 | **10 px** | 1.4 | il piu' piccolo del sito |
| `--font-header` | Louize | 400 | `clamp(46px, 5vw, 120px)` → `clamp(46px, 6.5vw, 120px)` | 1 | **le voci del menu aperto** |

**I corpi fuori scala**, dichiarati caso per caso con interpolazioni lineari a mano (non `clamp`, ma `calc(Xvw ± Ypx)` incastrati in media query annidate):

| dove | mobile | interpolazione | massimo |
|---|---|---|---|
| **citazione Sandburg** | 18 px | `calc(7.12vw - 8.72px)` da 375 px; poi 56 px da 768 px; poi `calc(16.67vw - 72px)` | **168 px da 1440 px** |
| Dress Discover | (display-1) | 46 px da 768 px, poi `calc(14.45vw - 65px)` | **120 px da 1280 px** |
| loader, riga alta | 32 px | `calc(7.05vw - 1.85px)` da 480 px | **120 px da 1728 px** |
| loader, riga bassa | 32 px | `calc(7.85vw - 5.69px)` da 480 px | **130 px da 1728 px** |
| tergicristallo | (display-3) | 46 px da 930 px, poi `calc(4.26vw + 6.38px)` | **80 px da 1728 px** |

**Sulla misura "14 → 168 px".** Confermata come ordine di grandezza, ma i numeri esatti sono altri: **il piu' piccolo corpo dichiarato e' 10 px** (`--font-tiny-2`), **il piu' grande e' 168 px** (la citazione oltre i 1440 px). Rapporto reale **16,8×**. I 14 px esistono ma sono un caso di servizio: il link "Skip to main content" e il messaggio di successo dell'iscrizione alla newsletter. Il rapporto piu' onesto per il testo *di lettura* e' **18 px → 168 px = 9,3×**.

**Le due micro-regole che tengono insieme la scala:**

1. **La spaziatura si stringe crescendo.** Quasi ogni livello ha `letter-spacing: .02em` (o `.01em` sui display) sotto i 930 px e **`0` sopra**. Il testo piccolo su schermo piccolo respira; il testo grande su schermo grande no. Un'inversione: `--font-label-1` e `.DiptychDoubleMaskMedia .text` passano da `.02em` a **`.04em`** — sono le didascalie, e sopra i 930 px si allargano.
2. **Corsivo e maiuscolo si alternano dentro la stessa frase.** Nel CMS ogni titolo e' un `block` con figli marcati `em` o `uppercase`, e i due marchi ricevono **animazioni diverse** (vedi *Animazioni*). Le didascalie usano un terzo marchio, `underline`, riservato ai nomi propri: `Vero Studio`, `Antonio Riva Milano`, `Alyssa Monique Bridal`, `Dallas Private Clients`.

Impostazioni globali: `body { font-size: 16px; font-family: var(--font-family-content) }`, `-webkit-font-smoothing: antialiased`, `-moz-osx-font-smoothing: grayscale`, `text-rendering: optimizeLegibility`. `text-wrap: balance` sul blocco finale di rassicurazione.

**Griglia**: `--grid-columns: 2` sotto i 930 px, **`12`** sopra; `--grid-gap: 10px`. Margini del contenitore: **20 px** mobile → **30 px** da 930 px → centrato con `max-width: 1728px` da 1788 px.

**Punti di rottura**: 375, 480, 768, **930**, 1280, 1440, 1728, 1788 px. I due che contano sono dichiarati anche in JS: `SCREENS = { tablet: 768, desktop: 930 }`.

## Testi veri

**Loader**
> where
> your
> wedding
> dress
> becomes art.

**Hero** (corsivo in tondo, MAIUSCOLO come nell'originale)
> *Custom* SCULPTURE *of your* WEDDING DRESS.

**Dress Discover**
> Vero is a luxury fine-art studio that transforms your wedding dress into a timeless sculpture.
>
> Each Vero sculpture stands approximately 15 inches tall, weighs 5–10 pounds, and has the presence of ceramic. Our sculptures are crafted through a blend of advanced technology and hand craftsmanship so that your gown is captured with exceptional precision and detail, exactly as it was worn on your wedding day.

> YOUR MOST / *important* / DRESS → DESERVES TO / LAST / *forever.*

**Tergicristallo**
> *the* ESSENCE *of* VERO
> *where* INNOVATION / *meets* CRAFTSMANSHIP
>
> *From* DRESS, → *to* DATA, → *to* SCULPTURE.

**Occhielli**
> *a* PROCESS BUILT *for* PERFECTION / *so* THAT YOU BECOME ART.
>
> *your* MEMORY / *will* FOREVER / *be a* MASTERPIECE.

**Dittico**
> **Worn once.**
> **Never meant to disappear.**
>
> *You wear your gown once, then it's tucked away for years. It deserves to be appreciated forever.*
> Vero transforms your dress into a lasting sculpture, created through a balance of advanced technology and hand craftsmanship so that we can preserve every detail. Every commission begins with a private consultation. Together, we'll discuss your commission, coordinate the collection of your gown, and personally guide you through every step of the Vero experience.

**Citazione della fondatrice**
> "Technology often pulls us away from what's real.
> Vero does the opposite - we use it to bring memory back to physical form."
> — Madilyn ontiveros Plumlee, *founder of* vero

**Citazione Sandburg** (cinque righe, ognuna in due meta')
> I held a / moment
> in my hand / brilliant
> as a star / fragile as
> a flower, / **a tiny silver**
> of one / hour.
> — Carl Sandburg

> **Errore di battitura nel CMS.** Il verso di Sandburg e' *"a tiny **sliver** of one hour"* — una scheggia. Sul sito e' scritto **`silver`**, argento. E' nel campo `end` del quarto oggetto `lines` del documento Homepage, quindi finisce in pagina a **168 px**. E' l'errore piu' visibile del sito ed e' anche il piu' facile da correggere.

**Chiusura**
> Your story deserves to be sculpted
> We'd be honored to craft it with you.
> [ *Start your* COMMISSION ]

**Menu** (voce per voce)
> home · About us · Process · Gallery · Order · Registry
> Contact: **+1 (212) 789-1070** · **hello@verostudio.com**
> FAQ · Featured Designers & Photography · Terms & Conditions · Privacy Policy

**Chiamate all'azione — e qui c'e' la cosa piu' intelligente del sito.** Nel CMS l'header ha **due** bottoni autorizzati, non uno:

| campo | testo | destinazione |
|---|---|---|
| `default_secondary_button` | *Start your* COMMISSION | interna → `/product` |
| `product_secondary_button` | TALK *to a* SCULPTURE *advisor* | `mailto:advisory@verostudio.com` |

Su tutto il sito l'header dice *compra*. **Sulla pagina prodotto — cioe' dove l'utente e' gia' davanti al prezzo — l'header smette di dire compra e dice "parla con un consulente".** Su un prodotto da $2.200 che richiede di spedire l'abito da sposa a degli sconosciuti, l'ostacolo non e' piu' l'intenzione: e' la paura. E l'unico bottone in alto cambia mestiere.

**Pagina prodotto**
> COMMISSION *now*
> *Let's* BEGIN / *your* SCULPTURE.
>
> Sculptures | <u>Vero Studio</u> in New York
> Gowns | <u>Antonio Riva Milano</u> and <u>Alyssa Monique Bridal</u>
>
> Drag around
>
> **Commission a sculpture of your wedding gown.**
> Commissions start at <u>$2,200 per sculpture</u>.
> Each sculpture is completed in 12-16 weeks.
> See how different dress styles come to life as sculpture by clicking below:
>
> [ Description ] [ Process ] [ Care ]
> [ Start your Commission ]

**Le tre righe di rassicurazione sotto il bottone** (`product.details.reassurance`):
> Made to order in our New York studio
> Sculptures created in 12–16 weeks
> Insured, prepaid wedding dress shipping label sent after checkout is complete

La terza e' la piu' importante del sito: risponde all'unica obiezione che conta — *e chi paga se il mio abito si perde per strada?*

**Checkout** (dal file di traduzione, che e' il documento piu' rivelatore di tutto il progetto)

Briciole di pane: `Product` → `Process` → `Information` → `Gown & Commission` → `Checkout`. Il pulsante indietro dice `Back to {step}`.

Riepilogo laterale:
> **Order summary**
> Your Vero journey begins here.
> Ready in 12–16 weeks
> Subtotal · Tax · Shipping · Total

Titoli dei passi: `The Vero Process` · `Contact & Delivery Details:` · `Your Gown & Commission:` · `Payment:`

Campi del passo *Information* (con i segnaposto reali):
> Full name — `Eloise Wehner`
> Email address — `eloisewehner@gmail.com`
> Phone number — `(201) 555-0123`
> Sculpture delivery address — `101 E Sunrise Hwy`
> City — `New York` · State — `New York` · Postal code — `10314`
> **Use the same address for your gown pickup & return?** Yes / No
> **Use the same address for billing?** Yes / No
> `Did you mean {address}` → `Use this address →`

Campi del passo *Gown & Commission*:
> **Gown designer** — `Designer name, or 'Unknown'`
> **Original Gown Retail Value** — `Retail value of the dress`
> **Who is this commission for?** — `First & Last name`
> **Photo in dress:** `(optional)` → `Upload` / `File uploaded (Select to change)`
> **Select your sculpture size** — `Scale I (9-11")` / `Scale II (13-15")`
> **Display style:** — `Free-standing` / `Wall-mounted`

Pagamento:
> Select a payment method: `Credit or debit card` / `PayPal`
> `Pay ${total}` · `Processing...` · `Payment successful! Redirecting...`
> I have read and agree to the Terms & Conditions and the Privacy Policy, which govern this order.
> **Questions about our process? Speak with a sculpture advisor.** (→ `mailto:advisory@verostudio.com`)
> Questions? We would be delighted to assist.

Ringraziamento — **quattro passi, non un "grazie" generico**:
> **Thank you!**
> Your commission is confirmed and now underway. / Our team will be in touch to arrange the collection of your gown. / You will receive a welcome email with your commission details shortly.
>
> **What happens next**
> 1. **Order confirmed** — You'll receive an order confirmation by email shortly.
> 2. **Studio review** — Our team will be in touch within 1–2 business days to confirm the details of your commission.
> 3. **Crafted to order** — Production begins once your details are confirmed and typically takes 12–16 weeks. We'll keep you informed at every stage.
> 4. **Delivered** — Your piece arrives ready to display, with care information enclosed.
>
> Questions in the meantime? Email the studio at …

**Processo** (`/process`) — quattro tappe numerate in numeri romani:
> **I. Commission** — Every journey begins by commissioning your sculpture through the Vero website. …
> **II. Capture** — The gown's silhouette, texture, and detail are documented using advanced imaging & engineering. **The original gown is never altered.**
> **III. Create** — The work is digitally translated, precision-fabricated, and finished by hand.
> **IV. Deliver** — The completed commissioned sculpture is sent to the client & ready to display and live with.
>
> Throughout the process, the gown remains completely untouched and unaltered, and is returned in the same condition in which we receive it.
> For questions, please contact **commissions@verostudio.com**.

**Lista nozze** (`/registry`)
> **Add Vero to your wedding registry**
> A Vero sculpture will become the most meaningful gift on your wedding registry.
> Unlike traditional registry gifts, a Vero sculpture is entirely unique to you. …
> **The Knot** — Use the "Add to The Knot" button (under "Add a gift from anywhere"), then open the product page and add it. The name, photo and price fill in automatically.
> **Zola** — Use the "Add to Zola" browser extension, or choose "Add from another store" and paste the link to the product page.
> **Over The Moon** — Over The Moon is curated by invitation. Reach out and we'll help you feature Vero on your registry.

**Chi siamo** (`/about`)
> **Your Dress Should Be Seen**
> I spent over 100 hours finding my wedding dress, and wore it for just a few hours. When I think of my dress, I think of my wedding. It holds that entire memory. Preserving it in a box felt like letting it disappear, so I set out to create something more intentional and lasting. Something that could hold every detail, and the feeling of that day.
> — Madilyn Ontiveros Plumlee
>
> **Our VISION:** A WORLD WHERE *anyone* can immortalize THEIR MEMORIES through fine art.
> **I. Legacy · II. Artistry · III. Celebration**
> **I. VERO NAME** — Vero is derived from the founder's maiden name, **Ontiveros**, a tribute to her personal roots …
> **II. CALLA LILY** — The calla lily shapes the Vero logo, chosen for its sculptural form …
> **III. MAENAD** — Our Vero logo features a dancing maenad. Maenads in Greek and Roman art symbolize self-expression, emotion, and form captured in time …
> **IV. SUNRISE PALETTE** — Inspired by sunrise and sunset, our palette reflects moments of transition and celebration …

Quest'ultima e' la giustificazione dichiarata dei beige: **non e' "beige elegante", e' "alba"**.

**Galleria** — filtri: `In Situ` / `Up Close` / `Brand World`. Bottone per immagine: `See fullscreen`.

**FAQ** (`/legals/faq`) — 21 domande. La prima e' aperta, le altre in accordion. La pagina porta in cima l'avviso `This section is under construction`. Le domande includono `How much does a Vero sculpture cost?`, `Will the train of my dress be captured?`, `What happens if my gown or sculpture is damaged or lost?`, `Do you offer rush orders?`, `Can I cancel my order?`

**Piede**
> **Stay in touch with the studio** → [ Email address ] [ → ]
> Thank you. You're on the list. / Please enter a valid email address. / Something went wrong. Please try again.
> Home · Order · Process · About · Gallery · Instagram · LinkedIn · Registry · Accessibility · Terms & Conditions · Privacy Policy · Featured Designers
> All Rights Reserved · Credits

**Testi di errore** (curati, il che e' raro)
> **Something went wrong** — We hit an unexpected error. Please try again — if it keeps happening, contact us at advisory@verostudio.com. [ Try again ]
> **Page not found** — The page you are looking for does not exist or has been moved.

## Mobile

Il punto di rottura e' **930 px** (`SCREENS.desktop`), con un secondo a 768 px (`SCREENS.tablet`). Tutto quello che segue e' letto nelle media query e nei componenti.

**Cosa SPARISCE sul telefono**

- **La seconda nav dell'header.** `.RootLayoutHeader .secondary { display: none }` sotto i 930 px: FAQ, Featured Designers & Photography, Terms & Conditions, Privacy Policy escono dall'header. (Nel pannello del menu aperto restano, spostate nel gruppo `legals` — che invece e' `display: none` **sul desktop**. Le due liste si scambiano di posto.)
- **Le parole dell'header.** `.menuText`, `.closeText`, `.buttonText` hanno `display: none !important`. Restano le icone (`.menuIcon`, `.buttonIcon`) — che sul desktop sono nascoste con la stessa forza. **Desktop: "Menu"/"Close" a parole. Mobile: hamburger e icona sacchetto.**
- **Le foto marcate `desktop-only`.** `.DiptychStickyMedia.visibility-desktop-only { display: none }`: la foto sticky di sinistra del dittico, cioe' **l'intera colonna che regge il ritmo su desktop**, puo' essere tolta per composizione.
- **Il pallino di chiusura dei punti di interesse** e' l'inverso: `.DressDiscoverPOI .close { display: none }` **sopra** i 930 px. Su desktop il POI si chiude uscendo col mouse, su mobile serve una × esplicita.

**Cosa viene SOSTITUITO**

- **Il trittico diventa un carosello a dito.** E' la sostituzione piu' netta. Sopra i 930 px `.Triptych .groups` e' `display: grid; grid-template-columns: repeat(3, 1fr)` — tre foto affiancate, ferme. Sotto, e' `display: flex` con ogni `.group` a `flex: 0 0 100%`, `touch-action: pan-y`, `user-select: none`, `cursor: grab` (`grabbing` in `:active`) e un `.indicator` che appare (nascosto su desktop). **Tre immagini contemporanee diventano una alla volta da trascinare.**
- **Le immagini sono file diversi, non lo stesso file ridimensionato.** Esistono due classi `.Media .mobile` e `.Media .desktop` che si escludono a vicenda, e nel CMS ogni `media` ha campi separati `image` / `image_desktop` e `video` / `video_desktop`. E' **direzione artistica**, non `srcset`: sul telefono le foto sono altre foto, ritagliate in verticale. Esempio dal tergicristallo: `1417×1999` su mobile contro `2887×1800` su desktop; secondo blocco `1286×2000` contro `1843×1003`.
- **Anche il video dell'hero e' doppio** — e con una sorpresa: il taglio **mobile pesa 3,61 MB**, quello **desktop 1,53 MB**. Il file piu' pesante e' quello servito alla connessione peggiore. (Probabilmente il taglio verticale copre molti piu' pixel dello stesso soggetto; resta una scelta discutibile.)
- **La legenda della pagina prodotto diventa un tooltip.** `InformationTooltip` con `mode="mobile-only"`: su desktop la didascalia dell'abito e delle maison e' sempre visibile, su mobile e' dietro un pallino "i" con un pannello `role="dialog"` da chiudere.
- **Il ritmo della parallasse cambia gruppo.** Nella griglia della galleria i moltiplicatori passano da cicli di 5 (`5n+1`, `5n+5` veloci) a cicli di 4 (`4n+1`, `4n+4`) sotto i 930 px, perche' cambiano le colonne.
- **Il layout globale si dimezza**: `--grid-columns` da **12 a 2**. Margini da 30 px a 20 px.

**Cosa RESTA — e cosa in piu'**

- **Il 3D resta tutto.** Non ho trovato nessuna disattivazione di WebGL per larghezza o per `deviceMemory`. Il solo controllo e' di capacita': se `canvas.getContext("webgl")` fallisce si ricade sull'SVG. Quindi **un telefono scarica comunque il modello dell'abito da 1,43 MB piu' 2,2 MB di texture**. Questa e' la scelta piu' costosa del sito.
- **Il loader, l'hero, il Dress Discover, il tergicristallo, la citazione** restano identici come meccanica: cambiano solo i corpi (46 px invece di 120, 18 px invece di 168).
- **Compare una cosa che sul desktop non esiste: il bottone d'acquisto fisso.** `ProductPageStickyAddToCart` e' `display: none` sopra i 930 px. Sotto, e' un `position: sticky; top: 0` con un contenitore alto `100dvh` e `justify-content: flex-end`, `padding-bottom: 30px`: **una barra d'acquisto larga quanto lo schermo, incollata al fondo del telefono per tutta la pagina prodotto**, che compare in `opacity` (0,3 s) quando si supera la soglia.
- **E l'eroe del prodotto si accorcia di dieci volte.** `.ProductPageHero` e' alto `calc(100lvh + 1000px)` con `position: relative` su desktop, e `calc(100lvh + 100px)` con `position: sticky; top: 0` su mobile. **Mille pixel di scultura da girare su desktop, cento sul telefono.** Sul telefono lo spettacolo si taglia e la scheda prodotto arriva subito.

Questa coppia — *togli 900 px di scenografia, aggiungi una barra d'acquisto fissa* — e' la dichiarazione di intenti dell'intero progetto: **sul desktop si seduce, sul telefono si vende.**

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| framework | **Next.js, App Router, React Server Components** | VERIFICATO | `X-Powered-By: Next.js`, `X-Matched-Path: /[[...slug]]`, payload `self.__next_f.push`, `createServerReference` |
| bundler | **Turbopack** | VERIFICATO | chunk `turbopack-02s--b2e7r0cz.js`, formato modulo `globalThis.TURBOPACK.push` |
| hosting | **Vercel** | VERIFICATO | `Server: Vercel`, `X-Vercel-Id: fra1::iad1::…`, `data-dpl-id` |
| CMS | **Sanity**, progetto `xei5vqg0`, dataset `production` | VERIFICATO | `preconnect` a `xei5vqg0.api.sanity.io`; ho interrogato l'API e ottenuto i documenti |
| tipi di documento | `root-layout`, `layout`, `default-page`, `product-page`, `checkout-page`, `gallery-page` | VERIFICATO | `array::unique(*[]._type)` |
| editing | **Sanity Presentation / Visual Editing** attivo in produzione | VERIFICATO | attributi `data-sanity` nel DOM, il set di chiavi "stega" e i messaggi dell'editor nel bundle |
| **animazione** | **anime.js v4** | VERIFICATO | `createTimeline`, `tweenTypes`, `valueTypes`, `globals.precision`, `stagger`, `parseEase`, ease per stringa `"out(3)"`, `"inOutQuad"` |
| **3D** | **OGL** (non Three.js) | VERIFICATO | `Vec3.scaleRotateMatrix4`, `Vec3.smoothLerp`, `Transform`, `Camera(gl, {fov})`, `GLTFLoader.load(gl, url)`, `Shadow`, `TextureLoader` — API di OGL, non di Three. Nessuna occorrenza di `THREE` |
| **GSAP** | **assente** | VERIFICATO | zero occorrenze di `gsap`, `ScrollTrigger`, `SplitText`, `Draggable`, `Flip` in **63 chunk** (3,1 MB non compressi). *La premessa dell'incarico su questo punto e' sbagliata.* |
| **smooth scroll** | **assente** | VERIFICATO | zero occorrenze di `lenis`. `useScroll` = `addEventListener('scroll', …, {passive:true})`. `scroll-behavior: auto` |
| split del testo | **implementazione propria** | VERIFICATO | classe esportata come `splitText`, usa `Intl.Segmenter`, emette `<span style="--stagger: {i}">` e `data-line` |
| viewport / misura | **hook propri** | VERIFICATO | `useInView` (IntersectionObserver condiviso per `rootMargin`), `useMeasure` (ResizeObserver), `useRefs`, `useMergeRefs`, `useOnWindowResize` |
| UI accessibile | **Radix UI** | VERIFICATO | `Accordion*`, `Dialog*`, `Collapsible*`, `Popover*`, `Avatar*`, `DismissableLayer`, `createContextScope`, `react-focus-lock` |
| lingue | **next-intl** | VERIFICATO | `IntlProvider`, `useTranslations`, il file `messages` nel payload. **Una sola lingua: `en`** |
| **pagamenti** | **Stripe Elements** (`@stripe/react-stripe-js`) | VERIFICATO | `CardNumberElement`, `CardExpiryElement`, `CardCvcElement`, `PaymentElement`, `ElementsContext`, `confirmPayment`, chiave **live** `pk_live_51Surhd…` |
| creazione del pagamento | **Next.js Server Action** | VERIFICATO | `createServerReference(…, "createPaymentIntent")` — nessuna rotta `/api/` esposta |
| metodo alternativo | **PayPal** (via Stripe) | VERIFICATO | `payment.methods.paypal` nelle traduzioni, ramo `method: "express"` nel codice |
| **analitica** | **PostHog** | VERIFICATO | `posthog` in 3 chunk, `PostHogProvider`, `person_profiles`, moduli surveys/conversations |
| errori | **Sentry** | VERIFICATO | `captureException` chiamato **due volte** (due client distinti) nella pagina d'errore, `/monitoring` bloccato in robots.txt |
| prestazioni | **@vercel/analytics** | VERIFICATO | riferimento a `vercel.com/docs/analytics/quickstart` nel bundle |
| immagini | **Sanity CDN** + `next/image` | VERIFICATO | `cdn.sanity.io/images/xei5vqg0/production/…?w=…&q=90&auto=format`; scala `w`: 32·48·64·96·128·256·384·640·750·828·1080·1200·1920·2048·3840 |
| video | file Sanity `.mp4`, nessuno streaming | VERIFICATO | `cdn.sanity.io/files/…mp4`, nessun `hls`/`m3u8`/Mux/Vimeo |
| font | ospitati in casa in `/fonts/` | VERIFICATO | `@font-face` con `src: url(/fonts/…)` |
| stili | **CSS Modules da SCSS** | VERIFICATO | classi `Nome-module-scss-module__HASH__parte`, `sourceMappingURL=….css.map` |
| **appuntamenti** | **Calendly** | VERIFICATO | `CALENDLY_LINK = "https://calendly.com/verostudio/30min"` nelle costanti |
| indirizzi | validazione con suggerimento | VERIFICATO | `Did you mean {address}` / `Use this address →`; fornitore **non verificato** |
| paesi ammessi al checkout | 28 UE + `GB` + `US` + `CA` | VERIFICATO | costante `CHECKOUT_LOCALES` |

**Le quattro scene WebGL**, registrate per nome e caricate in `import()` pigro:

| scena | dove | risorse |
|---|---|---|
| `DressDiscoverScene` | home, il momento | `dress-felicity.glb` 1,43 MB + normal 1,15 MB + occlusion 1,06 MB |
| `DressesScene` | pagina prodotto, "Drag around" | `dress-felicity.glb` (A-line) 1,43 MB · `dress-mermaid.glb` (Column) **212 KB** · `dress-ballgown.glb` (Ballgown) **230 KB** |
| `CoinScene` | sopra la citazione | `coin.glb` 43 KB + diffuse 975 KB + normal 322 KB + roughness 319 KB |
| `LogoScene` | marchio nell'hero e nel piede | `font.png` 87 KB (atlante MSDF) |

Piu' `DemoScene`, raggiungibile solo da `/playground` (bloccata in robots.txt).

Il materiale dell'abito e' un **PBR scritto a mano**: luci direzionali in `struct`, `metalness`/`roughness`/`occlusion`, mappe attivate da `#define` (`DIFFUSE_MAP`, `RMO_MAP`, `NORMAL_MAP`, `FRESNEL`, `SHADOW`, `SHADOW_PCSS`), correzione gamma 2.2 a mano, ombre PCSS a 37 campioni. GLSL ES 3.00.

**Nota sui bot.** `robots.txt` ammette esplicitamente `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-Web`, `anthropic-ai`, `PerplexityBot`, `Perplexity-User`, `Google-Extended`, `Applebot-Extended`, `Amazonbot`, `Meta-ExternalAgent`, `CCBot`. Su un prodotto che si cerca per descrizione (*"turn wedding dress into sculpture"*) e' una scelta di posizionamento, non una svista.

## Peso e prestazioni

Tutte misure mie, con `curl`, il 13/08/2026 da una connessione italiana.

**Ingresso**

| voce | peso |
|---|---|
| HTML della home | **22,3 KB** brotli (188,5 KB in chiaro) |
| **JS + CSS iniziali** | **473 KB brotli su 30 richieste** (25 `<script async>` + 4 fogli di stile + 1 preload) |
| font (2 file in preload) | **58,5 KB** (Louize 50,4 + Beausite 8,0) |
| video hero desktop | **1,53 MB** |
| video hero mobile | **3,61 MB** |

**Ingresso desktop, senza immagini: ~2,08 MB.** Con il primo schermo di immagini Sanity (`q=90`) si sale ben oltre.

**A scorrere**

| scena | peso aggiuntivo |
|---|---|
| abito 3D (Dress Discover) | **3,65 MB** |
| moneta 3D | **1,66 MB** |
| gli altri due abiti (pagina prodotto) | 442 KB |
| atlante del marchio | 87 KB |
| **totale WebGL** | **~5,8 MB** |

Le tre texture della moneta pesano **1,62 MB per un oggetto largo al massimo 140 px**. Sono JPEG, non compressi per GPU: **nessun KTX2, nessun Basis, nessun Draco, nessun meshopt**, benche' OGL supporti la strada. Sono i **due megabyte piu' facili da recuperare di tutto il sito**.

**Rete**

- HTML: `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`, `X-Vercel-Cache: **MISS**` **a ogni singola richiesta**, su tutte le prove. `X-Vercel-Id: fra1::iad1::…` — il bordo di Francoforte va a prendere la pagina in Virginia. **L'HTML non e' mai in cache di bordo**, benche' la home sia identica per tutti.
- Statici: `Cache-Control: public, max-age=31536000, immutable`, `X-Vercel-Cache: HIT`. Corretto.
- Compressione brotli attiva ovunque.
- Sicurezza: `Strict-Transport-Security: max-age=63072000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`. **Nessun `Content-Security-Policy`.**

**Tempi.** Non li riporto come giudizio: la mia connessione ha ~1 s di latenza di base e restituisce lo stesso TTFB (1,0-1,7 s) sia sull'HTML sia su un file statico gia' in cache. **Il dato strutturale, quello si', e' solido: `no-store` + `MISS` sempre significa che ogni visitatore paga il viaggio fino all'origine per il primo byte.**

Lighthouse, Core Web Vitals di campo, punteggi: **non verificati** — richiedono un browser, che l'incarico esclude.

## Tre cose da rubare

**1. La sezione che attraversa il centro dello schermo ridipinge il fondo di tutta la pagina.**
Non sezioni con lo sfondo colorato: un solo `document.body`, riverniciato. Bastano dieci righe:

```js
const inView = useInView(ref, { rootMargin: "-50% 0px -50% 0px" })
useEffect(() => { if (inView) document.body.style.background = THEMES[theme] }, [inView, theme])
```

`rootMargin: "-50% 0px -50% 0px"` schiaccia il riquadro d'osservazione a una **linea alta zero a meta' viewport**: scatta esattamente quando la sezione taglia il centro. Il colore vive nel CMS (`container.theme`), quindi **chi scrive i contenuti decide il ritmo cromatico della pagina senza toccare il CSS**. Costo: un IntersectionObserver per sezione. Nessuna libreria, nessun frame perso, e funziona anche con lo scroll nativo. (Se lo rifai, aggiungi una `transition: background-color .6s` — qui non c'e' e il cambio e' netto.)

**2. Due marchi tipografici nello stesso titolo, con due animazioni diverse.**
Nel CMS ogni titolo e' testo ricco con figli marcati `em` o `uppercase`. In CSS i due marchi non condividono nulla:

```css
.title > span em span            { transition: .6s  opacity   calc(var(--stagger)*.1s + .55s) var(--ease-out-sine); }
.title > span .uppercase         { display: inline-block; overflow: hidden; vertical-align: bottom; }
.title > span .uppercase span    { transition: 1.4s transform calc(var(--stagger)*.1s + .55s) var(--ease-out-expo); }
.is-revealed .uppercase span     { transform: translateY(0); }
.is-revealed em span             { opacity: 1; }
```

*Il corsivo sfuma in 0,6 s. Il maiuscolo sale da dietro una maschera in 1,4 s.* Piu' del doppio del tempo, curva diversa, e ogni riga sfalsata di 100 ms tramite un `--stagger` scritto in linea dallo splitter. Il risultato e' che **la stessa frase ha due voci** — e la parola che pesa (`SCULPTURE`, `WEDDING DRESS.`, `FOREVER`) e' sempre quella che si alza. Rifacibile in CSS puro: serve solo uno splitter che emetta `--stagger` e una classe di stato. Nessuna libreria di animazione.

**3. Il bottone principale cambia mestiere sulla pagina del prezzo.**
Nel CMS l'header ha **due** CTA autorizzate, non una:

| | testo | destinazione |
|---|---|---|
| ovunque | *Start your* COMMISSION | interna → `/product` |
| **su `/product`** | TALK *to a* SCULPTURE *advisor* | `mailto:advisory@verostudio.com` |

La regola: **finche' l'utente non ha visto il prezzo, il bottone spinge; quando ce l'ha davanti, il bottone rassicura.** Su un prodotto caro, lento e irreversibile — devi spedire il tuo abito da sposa — l'ostacolo a valle non e' il desiderio, e' la paura, e un secondo "compra" non la scioglie. Lo stesso mestiere lo fanno le tre righe sotto il prezzo (`Made to order in our New York studio` / `Sculptures created in 12–16 weeks` / **`Insured, prepaid wedding dress shipping label sent after checkout is complete`**) e i quattro passi della pagina di ringraziamento, che raccontano cosa succede **dopo** il pagamento invece di limitarsi a dire grazie. Costa zero: e' un campo in piu' nello schema e un `if` sul percorso.

**Bonus, per un pelo fuori dai tre:** il bottone `Explore the GALLERY` in `position: sticky; bottom: 50lvh` che resta immobile a meta' schermo mentre venti fotografie in parallasse gli scorrono dietro, dentro una sfumatura beige che le sbiadisce. Due righe di CSS, e la chiamata all'azione sta esattamente dove sta l'occhio.

## Non verificato

- **Il premio.** Non ho potuto controllare Awwwards, FWA o CSS Design Awards: il budget di ricerca web della sessione era esaurito. Il sito non espone badge.
- **Tutto cio' che richiede un browser**: Lighthouse, Core Web Vitals di campo, FPS reali sulle scene 3D, memoria occupata, comportamento su un telefono vero.
- **Il checkout oltre il primo passo.** `/checkout` risponde 200 ma il corpo e' vuoto: e' costruito interamente dal client dietro un contesto (`CheckoutProvider`) che pretende un prodotto in carrello. Ho ricostruito passi, campi e testi dal file di traduzione e dal bundle, **non** navigandoli. Non so quindi: come si calcolano `Tax` e `Shipping`, se il prezzo cambia con `Scale I`/`Scale II` o con `Free-standing`/`Wall-mounted`, e se i $2.200 sono un acconto o l'intero.
- **Il caricamento del carrello.** Non ho trovato la logica che porta dal bottone `Start your Commission` allo stato di checkout; e' probabilmente in un chunk che si carica solo dopo l'interazione.
- **Il momento in cui le due meta' della citazione Sandburg si muovono** — vedo il contenitore (`nowrap` + `overflow: clip`), i dati (`start`/`end` per riga) e un `.scroller` in overlay, ma non l'animazione: e' calcolata in JS e non l'ho isolata.
- **La moneta 3D**: non so se ruota col tempo o con lo scroll.
- **Il volo del marchio dall'hero all'header**: vedo i tre nodi di misure identiche e il `position: fixed`, ma la trasformazione e' scritta in JS e non l'ho estratta.
- **Il fornitore della validazione indirizzi** (`Did you mean {address}`).
- **La gestione dei cookie / consenso**: non ho trovato banner ne' libreria, benche' PostHog sia attivo e i paesi UE siano ammessi al checkout. Puo' essere caricato dopo l'interazione, oppure mancare.
- **La pagina `/playground`**: bloccata in robots.txt, non l'ho richiesta.
- **Il rapporto fra le tre immagini del checkout** (`a_line`, `column`, `ballgown`): nel CMS `free_standing` e `wall_mounted` puntano allo **stesso identico asset**, il che sembra un contenuto non ancora completato piu' che una scelta.
- **Il `--color-orange` `#e97e00`**: dichiarato, mai usato in nessuna regola che io abbia trovato.
- Il file di traduzione e' servito in **una sola lingua (`en`)**; se esistano altre lingue in preparazione non e' verificabile da fuori.
