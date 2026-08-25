# Mosby's Files

- **URL**: https://www.mosbyfiles.com
- **Premio**: Awwwards Site of the Day, 13/08/2026 — punteggio 7.23/10 (Design 7.33, Usability 7.03, Creativity 7.29, Content 7.34). Fonte: https://www.awwwards.com/sites/mosbys-files. Segnalato anche da The FWA.
- **Studio**: Tubik Studio (Ucraina). Team accreditato su Awwwards: Sergii Valiukh, Oleg Savenok, Myky Zhuravlov, Anastasiia Lutsenko, Ernest Asanov.
- **Anno**: 2026 (contenuti Storyblok creati 02/2026, ultima pubblicazione 30/06/2026 — dai timestamp `published_at` nel payload)
- **Letto il**: 13/08/2026 (solo via `curl` + lettura di HTML/CSS/JS; nessun browser aperto)

---

## Cosa vende

Niente. Non è un sito commerciale: è un archivio editoriale su otto architetti del
Modernismo americano (Wright, Gill, Gehry, Kahn, Pei, Rudolph, Colter, Sullivan),
costruito da uno studio di design come pezzo di portfolio. Il prodotto in vendita
è **Tubik Studio stesso**: la firma è nel footer ("Crafted with 🤍 by tubik studio"),
la pagina About è firmata dal fondatore.

## A chi

A due pubblici in contemporanea: la giuria/community Awwwards (che deve premiarlo)
e i clienti potenziali di Tubik. Chi esce dal sito deve pensare: *questo studio sa
costruire un'esperienza fisica e credibile senza sparare 3D, e sa scrivere*. Il
sottotesto è dichiarato nell'About: "Bauhaus. Bauhaus. Bauhaus. Say the word and
watch every designer in the room nod." — cioè: noi abbiamo qualcosa da dire, non
solo da citare.

## Idea regista

**È una cartella d'archivio di cartone: la home è la pila di faldoni visti di
taglio, ogni architetto è una cartella che si apre, e dentro c'è la scrivania di
un ricercatore con foto, note, graffette, righello e forbici.** Gli autori la
dichiarano nell'About: *"We built this website to replicate the feeling of opening
an old folder… Think of it as a researcher's desk: folders, blueprints, clippings,
margin notes."*

## Il momento

**L'apertura della cartella**, al clic su una linguetta della pila.
Meccanica esatta (letta nella transizione `FolderOpenEnter`):

1. GSAP **Flip** cattura lo stato della cartella dentro la pila (`Flip.getState`),
   il nodo `.case-folder` viene spostato via `appendChild` dentro `.case-content__inner`
   della pagina nuova, e `Flip.from` lo fa morfare da "linguetta orizzontale nella
   pila" a "cartella verticale a tutta pagina" in **1.5s `power3.inOut`**.
2. In parallelo la copertina `.case-folder__cover` ruota `rotateY: 0 → -180deg`
   (CSS 3D, `transform-style: preserve-3d`, `backface-visibility: hidden`,
   `perspective: 3000px`): la cartella si **apre come un libro**.
3. Un'ombra finta (`.case-folder__cover__shadow`, `box-shadow: 0 0 250px #00000080`)
   sale a opacity 1 a t=0.25s e ricade a 0 a t=0.6s — è l'ombra dell'anta che passa.
4. A t=0.65s le lettere del nome dell'architetto entrano da sinistra
   (`.case-hero-title .char`, `xPercent: -150 → 0`, stagger 0.025, `power2.out`).
5. A t=0.85s le linguette laterali degli altri architetti della stessa categoria
   salgono (`yPercent: 110 → 0`); a t=1s gli oggetti dello scrapbook volano su da
   `y: 50vh` con opacity 0.

Non c'è un secondo momento paragonabile. Il resto è ritmo, non colpo di scena.

## Struttura, sezione per sezione

### Home (`/`)

| sezione | cosa mostra | cosa fa l'utente | durata |
|---|---|---|---|
| Header fisso | logo centrato (SVG), voce "About" a destra | clic su About | sempre visibile, si nasconde in fondo pagina |
| `.section-hero` | H1 gigante "American modernism" + paragrafo grigio | legge | 1 schermata (`height: 100vh`) |
| `.page-home__stack` | la pila: 4 `stack-group` (categorie), 8 `stack-page` (cartelle), ognuna con la sua linguetta colorata | passa il mouse sopra → la pila si inclina e si apre a ventaglio; clic → entra | ~0.8 schermate (`80vh + 11.25rem`, con `margin-top: -15rem` che la fa risalire nell'hero) |
| Footer | 7 rose dei venti, righello SVG, "© 2026", firma Tubik | — | **è stampato sulla copertina dell'ultimo faldone**, non è un blocco a sé |

Documento totale ≈ **1.8 schermate**. La home è cortissima: tutto il lavoro lo fa
l'hover, non lo scroll.

### Pagina architetto (`/cases/<slug>`)

| sezione | cosa mostra | cosa fa l'utente | durata |
|---|---|---|---|
| `.case-hero` | nome dell'architetto in `heading-1` maiuscolo | — | ~0.4 schermate |
| `.case-folder` | la cartella aperta: a sinistra le linguette ruotate 90° degli altri architetti della categoria, dentro `.case-folder-sheet` (foto segnaletica + nato/morto + biografia con capolettera) | clic su una linguetta laterale → transizione `page-turn` verso il collega | 1–1.5 schermate |
| `.case-folder-scrapbook` | 3–5 `scrapbook-item`, ognuno un gruppetto di foto + nota colorata + graffetta, posizionati a mano in percentuale | **trascina** foto e note (Draggable con inerzia); **clicca** una foto → lightbox con didascalia e fonte | 2–4 schermate (varia per architetto) |
| `.case-next-widget` / `.case-next-folder` | barra "Keep scrolling for the next page" + bottone "Next" | continua a scrollare oltre il fondo → barra di avanzamento → passa al prossimo | overscroll, non scroll |

### About (`/about`)

Una schermata piena, non scrollabile come le altre: a sinistra titolo + galleria di
4 immagini con didascalie che si alternano; a destra il saggio (≈13 paragrafi + lista
a 3 punti) firmato. Pulsante di chiusura in basso a sinistra.

## L'esperienza in ordine di tempo

### Primi dieci secondi (home, desktop)

Fino a che l'app non è pronta, `.__app.is-loading` tiene a `opacity: 0` titolo,
sommario e pila: **niente preloader con percentuale**, solo un fermo immagine sul
fondo crema. Quando Nuxt risolve la suspense parte una sola timeline
(`ease: power4.out` di default):

- **t=0.0s** — `.stack` entra da `yPercent: -50`; i 4 `.stack-group` da
  `yPercent: 200, scale: 1.75` verso `0 / 1`, durata 0.5s, **stagger 0.015s**: i
  faldoni si "impilano" praticamente insieme, con un filo di sfasamento.
- **t=0.4s** — parte la prima riga del titolo: i `.char` (SplitText, `mask: "chars"`)
  salgono da `yPercent: 100` con opacity 0, durata 0.9s.
- **t=0.6s** — parte la seconda riga (stagger fisso di 0.2s **per riga**, non per
  carattere: `0.4 + rigaIndex * 0.2`).
- **t=0.9s** — il sommario grigio sale di 2rem e appare (0.65s).
- **≈t=1.5s** — tutto fermo. **t=1.8s circa**: `ScrollTrigger.refresh()` (chiamato
  con `setTimeout 300ms` dopo `app:suspense:resolve`).
- **da qui in poi non succede niente da solo.** Il sito aspetta il mouse. Dai 2 ai
  10 secondi lo schermo è statico salvo le 7 rose dei venti del footer, che
  ruotano puntando il cursore (`Math.atan2` sul `mousemove`, nessuna inerzia).

### Il resto, a blocchi

- **Hover sulla pila** — tutto CSS, `transition: transform .65s cubic-bezier(.33,1,.68,1)`:
  entrando su una cartella, tutte quelle *davanti* prendono `is-rotated`
  (`translateY(1rem) rotateX(-3deg)`), quindi la pila si "apre" verso l'osservatore
  e si vedono le linguette sotto.
- **Hover sull'ultimo terzo destro di una cartella** (`.stack-page__unfold-area`,
  `width: 33%`) — le cartelle davanti prendono anche `is-unfolded`: il gruppo
  **si accorcia** in altezza e scopre la copertina del faldone, dove è stampata la
  descrizione della categoria. È la zona "sfoglia", separata dalla zona "entra".
- **Clic** — `setLockState(true)` blocca l'hover, poi la transizione `folder-open`
  descritta sopra. Il link è un `NuxtLink` con `prefetch-on="interaction"`.
- **Dentro una cartella** — lo scroll è Lenis; le foto si trascinano; il clic su una
  foto apre la lightbox con Flip (l'immagine morfa dalla posizione nel collage al
  centro schermo) più didascalia e fonte ("Source: Historic American Buildings
  Survey. Library of Congress").
- **In fondo** — quando `scroll >= limit - 100px` si entra in stato `isOverscroll`.
  Da lì ogni tacca di rotella somma il suo `deltaY` (clampato a 100) in
  `overscrollAmount`; `overscrollProgress = min(amount / 2000, 1)`. Mentre sale, il
  contenuto slitta di `-5 * progress` vh e la barra si riempie. A **progress = 1**
  (cioè **2000px di delta accumulato, ~20 scatti di rotella**) parte
  `router.push` verso il prossimo architetto dopo 350ms.
- **Tra colleghi della stessa categoria** — clic su una linguetta laterale:
  transizione `page-turn`, la copertina richiude `rotateY: -180 → 0` e riapre
  sull'altro, le lettere del titolo escono a destra (`xPercent: 150`).
- **Ritorno alla home** — `folder-close`: la cartella torna dentro la pila con Flip,
  i gruppi risalgono da `yPercent: 120` con **stagger 0.1s** e `power4.out`.

## Animazioni

| elemento | cosa si muove | legato a | curva | note |
|---|---|---|---|---|
| pila home (`.stack-group`, `.stack-page`) | `rotateX(-3deg)` + `translateY(1rem)` + `translateZ(2px * i)` | hover (stato Pinia) | `cubic-bezier(.33,1,.68,1)` .65s | **CSS puro**, nessun JS per frame. `perspective: 3000px`, `preserve-3d` |
| gruppo "sfogliato" | `height` che si accorcia | hover sul 33% destro | stessa curva | scopre la copertina con la descrizione |
| copertina cartella | `rotateY: 0 → -180deg` | transizione di pagina | `power3.inOut` 1.5s | CSS 3D + GSAP; `backface-visibility: hidden`, faccia interna `rotateX(180deg)` |
| cartella pila → pagina | morphing posizione/dimensione | transizione | `power3.inOut` 1.5s | **GSAP Flip** (`Flip.getState` + `appendChild` + `Flip.from`) |
| ombra dell'anta | `opacity 0→1→0` | timeline della copertina | lineare 0.35s / 0.3s | `box-shadow: 0 0 250px #00000080` |
| titolo hero home | `.char` da `yPercent: 100`, opacity 0 | intro | `power4.out` .9s | **SplitText** `type: "chars, words, lines"`, `mask: "chars"`; stagger **per riga** 0.2s |
| titolo architetto | `.char` `xPercent: ±150 → 0` | transizione | `power2.out` / `power2.inOut` | stagger 0.025s (0.035 in uscita) |
| oggetti scrapbook (ingresso) | `y: 50vh → 0`, opacity | transizione | `power3.out` .5s | in uscita `y: 50vh` in 0.2s `power2.in` |
| foto e note (desktop ≥1024) | trascinamento libero | mouse | inerzia fisica | **GSAP Draggable**: `type:"x,y"`, `inertia: true`, `edgeResistance: .75`, `throwResistance: 15000`, `bounds: .case-content__draggable-bounds` |
| foto e note (mobile <1024) | `y = progress * (larghezzaViewport * 0.02 * indice)` | **scroll** | `scrub: true` | **ScrollTrigger**, `start: "top bottom"`, `end: "bottom top"` — parallasse proporzionale alla posizione nella lista, scritto con `gsap.quickSetter` |
| foto → lightbox | morphing immagine | clic | — | **Flip** su `data-flip-id="img-<uid>"` |
| linguette laterali cartella | `translateY(-10px)` + ombra | hover | `cubic-bezier(.33,1,.68,1)` .325s | solo dentro `@media (hover: hover)` |
| rose dei venti (footer) | `rotate(deg)` verso il cursore | `mousemove` globale | nessuna (istantanea) | `atan2(dy,dx) * 180/π + 90 - 45` |
| header | si nasconde | scroll giù oltre 300px su una pagina caso; e sempre a fine documento | `cubic-bezier(.33,1,.68,1)` .65s in entrata, .325s in uscita | |
| widget "Next" | barra `translateX(-100% → 0)` | overscroll accumulato | lineare (`ease: false`) | |

**Librerie riconosciute** (tutte registrate nello stesso plugin Nuxt): GSAP core,
ScrollTrigger (`config({ignoreMobileResize: true})`), **Flip**, **Draggable**,
**InertiaPlugin**, **SplitText**, **DrawSVGPlugin**, GSDevTools — cioè il pacchetto
Club GreenSock completo. Lenis come smooth scroll.

**Nessun `prefers-reduced-motion` in tutto il CSS e in tutto il JS** (0 occorrenze).

## Colori

Il sistema è a **tre colori base** più **un colore per architetto** letto dal CMS.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo carta | `#fdfaf7` | `--color-light`: sfondo pagina, `--color-contrast` |
| testo / superfici scure | `#191919` | `--color-dark`, `--color-primary`; header `#191919cc` con `backdrop-filter: blur(100px)` |
| testo secondario | `#787a7f` | `--color-gray`: sommario dell'hero |
| bordo header | `hsla(0,0%,100%,.1)` | bordo inferiore dell'header |
| ombra pila | `rgba(0,0,0,.15)` | `--stack-shadow: 0 -1px 8px`, `--folder-shadow: 1px 0 8px` |
| ombra apertura | `#00000080` | `box-shadow: 0 0 250px` sulla copertina in rotazione |
| fondo lightbox | `#000000d9` | `.popup__bg` |

**Accenti per architetto** (`content.color`, decidono il colore del faldone, della
linguetta e della cartella aperta):

| architetto | esadecimale | tema |
|---|---|---|
| Frank Lloyd Wright | `#1E4BD7` | light |
| Irving Gill | `#D71E1E` | light |
| Frank Gehry | `#0C7866` | light |
| Louis Kahn | `#581E70` | light |
| I. M. Pei | `#FFE927` | **dark** (testo nero) |
| Paul Rudolph | `#000000` | light |
| Mary Colter | `#D71E1E` | light |
| Louis Sullivan | `#1E4BD7` | light |

Il tema è solo un booleano: `theme === "dark" ? "#000" : "#fff"` per il testo sopra
il colore. Nient'altro cambia.

**Colori dei post-it e degli oggetti** (dal contenuto, non dal CSS): `#FFDE7A` giallo
(11 usi), `#DE96A1` rosa (7), `#8EACED` azzurro (5), `#79B6B2`, `#8F93F0`, `#79B2EF`,
`#b7b7b7` graffetta grigia, `#f40000` segni a penna rossa (20 usi), `#8000ff`.

## Tipografia

**Solo due font caricati**, entrambi self-hosted in woff2, entrambi Klim Type Foundry:

| famiglia | peso | file | peso file |
|---|---|---|---|
| **Signifier** (serif) | 400 (Light) | `/fonts/signifier-light.woff2` | 53.5 KB |
| **Founders Grotesk X-Condensed** | 700 (Bold) | `/fonts/founders-grotesk-x-condensed-bold.woff2` | 11.9 KB |

Serviti con `font-display: swap`, **senza `<link rel="preload">`**. Non sono variabili.
`html { font-family: Signifier, serif }` — il serif è il default di tutto il sito.

**Terzo font dichiarato ma mai caricato**: `IBM Plex Mono` compare in 4 regole CSS
(`.caption`, `.par-2`, `.case-folder-sheet__info`, `.the-footer`) ma **non esiste
nessun `@font-face` e nessuno stylesheet esterno** — `/fonts/ibm-plex-mono.woff2`
risponde 404. Chi non ha IBM Plex Mono installato vede il fallback `sans-serif`.
È un bug, non una scelta.

**La radice è fluida per breakpoint** — è il moltiplicatore di tutto il sistema:

| viewport | `html { font-size }` |
|---|---|
| ≤320px | 12px |
| ≤480px | 13px |
| ≤768px | 13px |
| ≤900px / ≤1024px | 14px |
| ≥1025px | 15px |
| ≥1440px | 16px |
| ≥1920px | **18px** |

**La scala:**

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| H1 home `.section-hero__title` | Founders Grotesk XCond | 700 | `clamp(1px, (100vw - 2*offset) * .119, 200px)` | .8 | **maiuscolo**. Non è un clamp su `vw`: è una **frazione della larghezza del contenitore** (11.9%) — il titolo è agganciato alla griglia, non alla finestra. A viewport 1536px → **174.7px**. Tetto a 200px |
| H1 caso `.case-hero-title` | idem | 700 | `.heading-1` = `clamp(4rem, 2.25rem + 5.833vw, 7.5rem)` | .8 | maiuscolo; a root 18px il tetto vale 135px |
| `.heading-2` | idem | 700 | `clamp(2.66rem, 1.49rem + 3.9vw, 5rem)` | .8 | maiuscolo |
| `.heading-3` | Signifier | 400 | `clamp(2rem, 1.429rem + 2.857vw, 4rem)` | .92 | |
| `.heading-4` | Founders | 700 | 2rem | 1 | |
| `.heading-5` | Signifier | 400 | 1.125rem | 1.16 | |
| biografia `.case-folder-sheet__desc` | Signifier | 400 | 1.75vw (→ 24px ≥1440, **30px ≥1920**, 18px ≤1024, 16px ≤768) | 1.4 | `text-shadow: 1px 1px 1px #fff` per simulare inchiostro su carta |
| **capolettera** della biografia | Signifier | 400 | **5em** del paragrafo (→ 150px a ≥1920) | .425 | `float: left`, `margin-top: .21em`, `margin-right: 1rem` |
| `.par-1` (sommario hero) | Signifier | 400 | `clamp(1rem, .875rem + .417vw, 1.25rem)` | 1.4 | colore `#787a7f`, `text-wrap: balance`, `width: 50rem` |
| linguette `.tag` | Signifier | 400 | 1.625rem (→1.25rem ≤1024, 15px ≤480) | — | `white-space: nowrap` |
| `.caption` | "IBM Plex Mono" (→ sans-serif) | 400 | `clamp(.75rem, 0rem + .833vw, 1rem)` | 1.4 | |
| footer | "IBM Plex Mono" | 400 | .75rem | — | `text-transform: uppercase` |

**Il rapporto reale della scala**: dal `.the-footer` a .75rem con root 12px (9px) al
titolo home a 200px, sono **22×**. Alla larghezza dove è stato misurato prima
(1536px): caption 12px → titolo 174.7px = **14.6×**. Il numero non viene da una
scala modulare: viene dal fatto che il titolo è dimensionato **in percentuale della
colonna** e la didascalia in punti quasi fissi. È questa forbice — non la
tipografia in sé — a fare la gerarchia.

Altri dettagli di composizione da rubare:
- `text-wrap: balance` su hero, sommario e note.
- `p:not(:first-child) { text-indent: 2.5rem }` nella biografia: rientro di capoverso
  da libro, insieme al capolettera.
- `.heading-1 .line { margin-top: -.05em }` + `.char { padding-bottom: .05em }`:
  compensazione manuale per far entrare i discendenti nella maschera dello SplitText
  senza aprire l'interlinea.

## Testi veri

**Titolo pagina**: `Mosby's Files—American Modernist Architecture`

**Meta description**: `A research-driven archive exploring the architects who built American Modernism—independently of Europe, and on their own radical terms.`

**Home, H1**: `American modernism`

**Home, sommario**:
> A project exploring early 20th-century American architects, contrasting them with European Modernism and revealing a distinct American path of functionalism that shaped contemporary architecture

**Menu**: una sola voce, `About`.

**Le quattro categorie della pila** (testo stampato sulle copertine dei faldoni):

1. `Organic & Early Modernism` — *"The movement that broke from European convention before Europe finished writing its manifesto. Buildings designed around human life, natural landscape, and open space — where structure followed environment, not the other way around. The root system beneath everything American Modernism would later become."*
2. `Expressive` — *"Where function alone was never enough. These architects pushed form, material, and structure into territory that was confrontational, sculptural, and deeply personal. Every surface carried an argument, every material choice a point of view."*
3. `Monumental Modernism` — *"Architecture at the scale of civilization — civic, institutional, and built to outlast the moment. These buildings draw on mass, geometry, and the precise control of light to create spaces that feel both inevitable and timeless."*
4. `Contextual & Transitional Architecture` — *"Architecture shaped by place, culture, and continuity rather than formal invention alone. Mix of tradition and modernity through local materials, historical reference, and environmental logic that resist the impulse to impose and choose instead to belong."*

**Scheda anagrafica (esempio Frank Lloyd Wright)**:
> Born: `June 8, 1867, Richland Center, Wisconsin, United States`
> Died: `April 9, 1959 (age 91 years), St Joseph Hospital, Phoenix, Arizona, United States`

**Biografia (Wright, testo integrale — è il livello di scrittura del sito)**:
> Frank Lloyd Wright redefined architecture from the inside out. To him, walls and roofs were secondary—the real essence was space: shaped for life, movement, and use. Form, he argued, must follow the rhythm of living.
>
> He pioneered organic architecture: not in metaphor, but in method. The building emerged from its site, rooted in it, inseparable from its ground. His Usonian houses, born of economic crisis, made simplicity a civic virtue—standardized, yet never anonymous.
>
> He broke the tyranny of the box: dissolving corners, layering sightlines, letting rooms unfold like thought. And he didn't stop at walls—light fixtures, furniture, vents, even screws were part of the same vision. Architecture, for Wright, was total.

**Note sui post-it** (una per opera, 2–3 righe, sempre con nome + anno):
> `Fallingwater` / `1935` — "Wright's masterstroke of organic architecture. Cantilevered slabs hover over a waterfall, anchoring the house to rock and motion. Not placed in nature — grown from it, vein by vein."
> `Robie House` / `1910` — "A manifesto in brick and line. Long, low horizontals stretch across the Chicago landscape, dissolving walls into flow. The Prairie style, sharpened into spatial choreography."
> `Guggenheim Museum, New York` / `1959` — "A spiral cast in concrete. No corners, no floors — just one continuous ramp, pulling visitors downward in a slow, centrifugal ballet of art and architecture."

**Chiamata all'azione (unica di tutto il sito)**: `Keep scrolling for the next page` + bottone `Next`

**Didascalie della lightbox**: descrizione + `Source: <fonte>` — es. *"First Floor Plan - Fallingwater, State Route 381 (Stewart Township), Ohiopyle, Fayette County, PA Drawings from Survey"* / *"Source: Historic American Buildings Survey. Library of Congress"*. Altre fonti citate: Encyclopædia Britannica, UMKC University Libraries, Pixabay, Youtube.

**About, H1**:
> Bauhaus. Bauhaus. Bauhaus. Say the word and watch every designer in the room nod.

**About, apertura**:
> "What principles guided your design system?" "Well, you know…I'm a huge admirer of the Bauhaus school, so my work follows the same principles established in the early twentieth century..."
>
> That conversation plays on loop across design studios, architecture firms, editorial offices. And there's nothing wrong with it—digging into old movements is genuinely useful. **It only becomes a problem when Bauhaus stops being a source of actual thought and becomes a shield against the absence of it.**

**About, la dichiarazione di metodo**:
> We built this website to replicate the feeling of opening an old folder—a carefully assembled archive belonging to someone obsessed not just with history, but with the people who made it. It's not a dry catalog. Not a textbook. Think of it as a researcher's desk: folders, blueprints, clippings, margin notes, all pulled together in one place.

**About, chiusura**:
> The folder's open. We won't tell you where to start.

**Firma**: `Sergii Valiukh,` `Founder of` `Tubik Studio`

**Piede**: `© 2026` — `Crafted with 🤍 by tubik studio` (+ logo Tubik) — e a sinistra un
**scalimetro** da disegno tecnico (`/images/scale.svg`, 129×21, barre bianche
alternate 12/12/24/72px con i numeri sotto, larghezza a schermo 8.75rem): il segno
grafico che dichiara "questo è un documento d'archivio, non una pagina web".

## Mobile

Il breakpoint che conta è **1024px**: sotto, il sito cambia natura.

**Cosa SPARISCE**
- **Il trascinamento.** `Draggable` viene creato solo dentro `useMatchMedia("(min-width: 1024px)")`. Sotto i 1024px non esiste: gli oggetti non si toccano.
- **Tutto l'hover della pila.** `.stack-page` reagisce a `mouseenter`/`mouseleave`: su touch non parte niente. L'inclinazione a ventaglio, l'apertura del gruppo e la scoperta della descrizione di categoria (la zona `.stack-page__unfold-area`, 33% destro) **non sono raggiungibili col dito**. Su telefono la home è una lista di linguette da toccare.
- **L'hover sulle linguette laterali** della cartella (`translateY(-10px)`) è chiuso dentro `@media (hover: hover)`.
- **2 rose dei venti su 7** hanno `hide_on_mobile: true` e spariscono dal footer.
- Il collage assoluto: `.scrapbook-item` perde `position: absolute` e `max-width: 100%`.

**Cosa viene SOSTITUITO**
- **Trascinamento → parallasse di scroll.** Stesso hook, ramo `else`: ogni elemento riceve uno `ScrollTrigger` con `scrub: true` che lo trasla di `larghezzaViewport * 0.02 * indiceNelGenitore` px sul passaggio `top bottom → bottom top`. Cioè: quello che su desktop muovi tu, su mobile lo muove lo scroll, e più è in basso nella lista più si muove. **È la sostituzione più intelligente del sito.**
- **Collage → colonna.** `.case-folder-scrapbook` diventa `gap: 4rem; margin-left: 5%; width: 90%`, con `.scrapbook-item:nth-child(2n) { align-self: flex-end }`: zigzag sinistra/destra invece della griglia libera.
- **Posizioni CMS → posizioni CMS mobile.** Ogni oggetto ha in Storyblok fino a **quattro set di trasformazioni** (`desktop`, `responsive_mobile_lg` 1024, `responsive_mobile_md` 768, `responsive_mobile_sm` 480), risolti a cascata con `Object.create` (ogni breakpoint eredita dal precedente e sovrascrive solo ciò che serve). x, y, width, rotation, z-index, transform-origin, margini, e due flag `position_x_reversed`/`position_y_reversed` che ancorano l'oggetto al lato opposto. **La riimpaginazione mobile è stata fatta a mano, oggetto per oggetto, dentro il CMS.**
- **Transizione "prossima cartella"**: su desktop la cartella corrente sale di `-75vh` e la successiva entra da `-10..-15vh`; su mobile `.case-folder` e `.case-next-widget` escono insieme a `-100vh`.
- **Transizione "entra nella cartella"**: su desktop la cartella e il titolo risalgono da `60vh` con anche un cambio di `color` e `scale: .666`; su mobile è solo un ingresso lettera per lettera da `xPercent: -100` più la cartella che sale da fondo schermo.
- **Lightbox**: da centrata con barra laterale a 14rem, diventa a colonna piena con la X in `position: fixed` in alto a destra.
- **Scheda biografica**: da due colonne affiancate a colonna singola (≤768px), foto al 33% poi al 90% (≤480px), graffetta laterale da 4rem a 2.5rem, e il bordo verticale punteggiato dei fori sparisce sotto 480px.

**Cosa RESTA**
- L'apertura della cartella con `rotateY: -180deg`: la transizione `folder-open` non ha rami responsive. Il gesto centrale è identico su telefono.
- Lenis (`syncTouch` presente nella build), l'overscroll per il "next", la lightbox con Flip, le linguette laterali cliccabili, la scala tipografica (via `html { font-size }` 12→13→14px).
- Le rose dei venti puntano il cursore anche su mobile, dove non c'è cursore: 5 immagini PNG/AVIF da 1000×1000 caricate per un effetto che sul telefono non esiste.

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| Framework | **Nuxt 3/4 + Vue 3**, SSR | VERIFICATO | header `X-Powered-By: Nuxt`, `id="__NUXT_DATA__"`, `/_nuxt/*.js`, `data-v-*` scoped styles |
| Store | **Pinia** | VERIFICATO | `defineStore("stack"|"main"|"popup")` minificato nel bundle |
| Animazione | **GSAP** + ScrollTrigger, Flip, Draggable, InertiaPlugin, SplitText, DrawSVGPlugin, GSDevTools | VERIFICATO | `gsap.registerPlugin(...)` nel plugin `name:"gsap"` del bundle; conferma su Awwwards ("GSAP, Vue.js") |
| Smooth scroll | **Lenis** `{ lerp: 0.075 }`, guidato da `gsap.ticker` con `lagSmoothing(0)`, `lenis.on('scroll', () => ScrollTrigger.update())` | VERIFICATO | plugin `name:"lenis", dependsOn:["gsap"]` |
| 3D | **nessun WebGL.** Solo CSS 3D: `perspective: 3000px`, `transform-style: preserve-3d`, `backface-visibility: hidden`, `rotateX(-3deg)`, `rotateY(-180deg)`, `translateZ(2px * i)` | VERIFICATO | zero occorrenze di `WebGLRenderer`, `getContext("webgl`, `THREE.` nel bundle; Awwwards lo descrive come "CSS-only skeuomorphic folder system" |
| CMS | **Storyblok** (spazio `290489675855311`, token pubblico in chiaro nel `window.__NUXT__.config`, `storyblokVersion: "published"`, bridge attivo) | VERIFICATO | payload SSR + config inline |
| Hosting | **Vercel** (regione build `fra1`, edge `iad1`), `siteURL` di origine `https://mosby-files.vercel.app/` | VERIFICATO | header `Server: Vercel`, `X-Vercel-Id` |
| Analytics | **Vercel Web Analytics** 2.0.1, con evento custom `"Popup Open"` (page, type, popupInfo) | VERIFICATO | `@vercel/analytics` nel bundle, funzione `$track` |
| Immagini | Storyblok CDN, **AVIF** alla risoluzione originale. **Nessun `srcset`, nessun `sizes`, nessun `loading="lazy"`, `alt=""` su tutte** | VERIFICATO | HTML della pagina caso |
| Icone | `@nuxt/icon` / Iconify (set `material-symbols`, `mdi`, più un set `custom` locale per la freccia) | VERIFICATO | `NuxtIcon`, elenco collezioni nel bundle |
| Video | iframe YouTube incorporati dal CMS, con **Plyr** come player | VERIFICATO | classi `.plyr__*` nel CSS, `embed` con `youtube.com/embed/...` nel payload |
| Carosello lightbox | **Swiper** (per gli `content-stack`, i mazzetti di foto) | SUPPOSTO | riferimenti a `swiper` come prop del `PopupSidebar`; non ho visto il codice della libreria |
| Font | self-hosted woff2, 2 file, `font-display: swap` | VERIFICATO | `@font-face` in `entry.css` |
| Cache | `Cache-Control: public, max-age=0, must-revalidate` sull'HTML, `X-Vercel-Cache: MISS` | VERIFICATO | header |

## Peso e prestazioni

Misurato con `curl` il 13/08/2026, **home page**:

| risorsa | trasferito |
|---|---|
| HTML (br) | 68.2 KB (283.999 byte non compressi — il payload Storyblok SSR è 3/4 del file) |
| `entry.css` (br) | 7.0 KB (37.9 KB non compressi) |
| altri 2 CSS | 1.5 KB |
| **`DwAQhwlc.js` (bundle principale)** | **1.033 MB** compressi — **3.052 MB non compressi** |
| 7 chunk JS secondari | 6.9 KB in tutto |
| 2 font woff2 | 65.4 KB |
| 7 rose dei venti (PNG 1000×1000 + AVIF 600×600) | **286 KB** |
| 2 SVG (righello, logo Tubik) | 3.6 KB |
| **totale ≈** | **~1.47 MB su ~23 richieste** |

**Pagina caso** (Frank Lloyd Wright): HTML 73.4 KB (br) + stesso bundle da 1.03 MB +
**9 immagini AVIF a piena risoluzione per 1.02 MB** (la più pesante: 319 KB,
`1344×894`; la foto ritratto è `2670×3051` per 102 KB) → **≈ 2.2 MB**.

Il collo di bottiglia è **il bundle JS da 1 MB compresso / 3 MB parsati**: dentro ci
sono sette plugin GSAP, Lenis, Vue, Pinia, il client Storyblok e Iconify, tutti nel
chunk d'ingresso, tutti bloccanti prima dell'intro. È il prezzo pagato per non avere
WebGL — che però in genere costa meno di così.

**Non ho numeri di Core Web Vitals né Lighthouse**: non ho aperto un browser.

## Tre cose da rubare

1. **Il titolo dimensionato in percentuale della colonna, non della finestra.**
   `font-size: clamp(1px, (100vw - var(--container-offset)*2) * .119, 200px)`, con
   la percentuale che cambia per breakpoint (.119 desktop → .13 ≤1024 → .18 ≤768 →
   .23 ≤480) e un tetto a 200px. Risultato: il titolo tocca sempre i due margini,
   a qualsiasi larghezza, senza tabelle di media query sul corpo e senza JS di
   fit-to-width. Più il moltiplicatore fluido su `html { font-size }` (12→18px per
   breakpoint), che scala tutto il resto in `rem` sotto di esso. **Questa coppia è
   il motore della scala 14×.** Costo: due righe di CSS.

2. **Due zone di hover sullo stesso oggetto: "guarda" e "entra".**
   `.stack-page` intera cattura `mouseenter` → la pila si inclina di `-3deg` e si
   apre; ma un figlio `.stack-page__unfold-area { width: 33%; right: 0 }` cattura un
   secondo `mouseenter` → il gruppo si accorcia e scopre la copertina con la
   descrizione. Due livelli di rivelazione, zero clic, zero modali, e la transizione
   è **solo CSS** (`transition: transform .65s cubic-bezier(.33,1,.68,1)`): il JS
   scrive tre booleani in uno store, il browser fa il resto a costo zero.
   Rifacibile in un pomeriggio su qualsiasi lista di prodotti/servizi.

3. **La stessa animazione con due sorgenti diverse: mouse su desktop, scroll su mobile.**
   Un solo hook: se `matchMedia("(min-width: 1024px)")` allora `Draggable` con
   `inertia: true`, altrimenti `ScrollTrigger` con `scrub: true` che trasla
   l'elemento di `larghezzaViewport * 0.02 * indiceNelGenitore`. Non è "l'effetto
   disattivato su mobile": è **lo stesso movimento con un'altra fonte di energia**,
   e il fattore per indice fa sì che il collage si scomponga a strati durante lo
   scroll. Corollario da rubare anche a monte: le posizioni (x, y, rotazione,
   larghezza, z-index) di ogni oggetto stanno **nel CMS**, con quattro set
   sovrapponibili per breakpoint che ereditano a cascata — è così che si può
   comporre a mano un collage e rimpaginarlo a mano su tre larghezze senza toccare
   il codice.

## Non verificato

- **Non ho aperto nessun browser** (vincolo del compito): tutto viene da HTML, CSS e
  JS scaricati. Quindi niente screenshot, niente misura di FPS, niente Lighthouse,
  niente LCP/CLS/INP, e nessuna verifica visiva che le animazioni facciano davvero
  quello che il codice dice.
- La durata reale in schermate di scroll delle pagine caso: dipende dal numero e
  dall'altezza degli oggetti posizionati in percentuale, che non ho renderizzato.
  Il dato in tabella è una stima.
- Il comportamento vero su touch: se la pila della home sia solo una lista di
  linguette toccabili o se ci sia un fallback che non ho trovato. Il codice dice
  che `mouseenter` è l'unico ingresso, ma non l'ho provato su un dispositivo.
- Il CSS di `.case-next-widget` e `.case-next-folder` non è nei fogli che ho
  scaricato (né nei blocchi `<style>` inline né in `entry.css`): presumo un chunk
  CSS caricato in ritardo. Quindi l'aspetto della barra "Keep scrolling" è dedotto
  dal solo JS.
- Swiper: ne vedo il nome come prop, non la libreria. Marcato SUPPOSTO.
- Non ho controllato se `IBM Plex Mono` venga caricato da qualche altra parte a
  runtime (per esempio da un `<style>` iniettato via JS): nei file statici non c'è.
  Se non c'è davvero, tutte le didascalie e il footer del sito premiato girano in
  `sans-serif` di sistema.
- Non ho aperto le pagine degli altri 7 architetti: la struttura di dettaglio
  (numero di oggetti, tipi speciali come `content-film-reel`, `content-ruler`,
  `content-pdf`, `content-audio`) l'ho ricavata dal payload della home, che
  contiene il contenuto completo di tutte e 8 le schede.
- Il numero esatto di richieste (23) è una somma delle risorse che ho trovato nel
  sorgente, non una lettura del pannello di rete: potrebbero esserci chiamate
  aggiunte a runtime (analytics, chunk in ritardo).
