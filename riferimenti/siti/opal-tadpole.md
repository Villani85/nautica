# Opal Tadpole

- **URL**: `https://www.opalcamera.com/opal-tadpole` — **il sito NON esiste piu'**.
  Oggi `opalcamera.com` fa 301 su `https://op.al/` ("Opal Electronics", sito
  Next.js completamente diverso, verificato con curl il 13/08/2026).
  La versione premiata e' leggibile solo su Wayback:
  `https://web.archive.org/web/20240102004620/https://www.opalcamera.com/opal-tadpole`
  (86 catture dal 14/11/2023 al 27/07/2026).
  Pagina d'acquisto: `/shop/opal-tadpole`. Confronto: `/opal-tadpole/comparison`.
- **Premio**: Awwwards **Site of the Day** 11/01/2024 (voto 7.52; design 7.73,
  usability 7.34, creativity 7.27, content 7.64) e poi **E-commerce Site of the
  Year 2024**. Fonte: https://www.awwwards.com/sites/opal-tadpole
- **Studio**: design **Claudio Guglieri** (Head of Design in Opal, non
  un'agenzia esterna); sviluppo **Ingamana**; foto e 3D Hugo Ahlberg + Guglieri;
  collaboratori Anthony Koch, Bryan James, Jason Bradley. Fonti: scheda Awwwards
  e https://guglieri.com/work/tadpole
- **Anno**: home online da novembre 2023, premiata gennaio 2024.
- **Letto il**: 13/08/2026

> **Come l'ho letta.** Non ho aperto browser. Ho scaricato con `curl` dalla
> Wayback Machine: lo scheletro HTML (cattura 02/01/2024), il CSS
> `app.677cac91.css` (341 KB non compressi) e il bundle JS
> `app.0d8bddea.js` (cattura 18/12/2023, 2,73 MB non compressi). Il bundle e'
> minificato ma **non offuscato nelle stringhe**: le chiamate
> `React.createElement` sono leggibili, quindi testi, ordine dei componenti,
> parametri ScrollTrigger e sorgenti video qui sotto sono **letti nel codice**,
> non dedotti da screenshot. Quello che non ho potuto fare e' **vedere il
> risultato in movimento**: dove parlo di ritmo e durata lo dichiaro come stima.

---

## Cosa vende

Una webcam da 175 $ da agganciare al bordo dello schermo del portatile: 35x45x20
mm, meno di 50 grammi, sensore Sony IMX582, microfono direzionale, e un
connettore USB-C che si tocca per silenziare il microfono. Accessorio opzionale:
una custodia "Yoyo Case" da 25 $.

Non vende "una webcam migliore": vende **un oggetto piccolo**. Tutta la pagina e'
costruita intorno alla dimensione.

## A chi

Chi lavora in videochiamata e si porta dietro il portatile: consulenti,
commerciali, founder, creator. Persone che hanno gia' una webcam integrata che
funziona, quindi il sito non deve spiegare la categoria — deve far venire voglia
di un oggetto. Uscendo, il visitatore deve pensare due cose: *"e' incredibilmente
piccola"* e *"e' fatta bene come un prodotto Apple"*. La terza, il prezzo, e'
tenuta bassa e visibile ovunque, mai contrattata.

## Idea regista

**La cosa e' cosi' piccola che la pagina deve ingrandirla per farla vedere**: per
tutta la prima meta' il prodotto e' un modello 3D gigante che ruota sotto le dita
dello scroll, e le uniche misure che compaiono sono paragoni umani (un orsetto
gommoso, il polso, il bordo dello schermo).

## Il momento

**La sezione `Introducing`, la seconda della pagina.** La sezione si blocca
(`pin: true`) per due schermate di scroll e un paragrafo intero — *"Introducing
the Tadpole the smallest webcam ever built..."* — si accende **parola per
parola**: ogni parola e' uno `<span>` a `opacity: 0` che passa a `1` mano a mano
che avanza lo scroll. E fra una parola e l'altra, dentro la riga di testo, sono
incastonati **quattro videini quadrati da 80x80 px** (linea disegnata: la
Tadpole che ruota, un'onda sonora, il pulsante USB-C che gira, la custodia
yo-yo). Quando lo scroll arriva su di loro, i videini fanno `transform:
scale(1.7)`, prendono bordo e ombra, e **partono in play**. Il testo si legge e
si guarda nello stesso gesto.

Meccanica esatta letta nel codice:

```
scrollTrigger: { trigger: gridWrapper, scrub: 1,
                 start: "top+=175% center", end: "bottom+=200% center" }
onUpdate: t = Math.floor(progress * (numeroParole + 1)) - 1
          → aggiunge/toglie la classe .fx a ogni span
          → se lo span e' un videino: .play() entrando, .pause() uscendo
```

## Struttura, sezione per sezione

Ordine letto direttamente dal componente pagina del bundle
(`createElement(HeroVideo), (Introducing), (Design), (PhotoScroll), (Portable),
(VideoScroll), (Unboxing), (TadpolePromo), (HeroSpecs), (Material), (Tactile),
(ImageSound)`).

| # | sezione (nome nel codice) | cosa mostra | cosa fa l'utente | schermate di scroll |
|---|---|---|---|---|
| 0 | barra promo | fascia gialla fissa: sconto + codice | legge / copia il codice | 40 px fissi |
| 1 | `HeroVideo` | video 4K a tutto schermo su fondo nero, poi si ferma su un fermo-immagine. Titolo `A new species of webcam` | guarda, poi scrolla | ~1 (il video parte da solo, non e' scrubbato) |
| 2 | `Introducing` | il paragrafo che si accende parola per parola con i videini in linea | scrolla lentamente, legge | ~3 (pin di 2 schermate + entrata) |
| 3 | `Design` | sequenza di **321 immagini** del render 3D della camera, scrubbata dallo scroll. Titolo `Uniquely designed for your laptop.` + **due pallini per scegliere bianco o nero** | scrolla per ruotare l'oggetto; clicca il pallino per cambiare colore | ~2 |
| 4 | `PhotoScroll` | fotografie di vita reale in due blocchi: `Teenie-Tiny.` e `Clip And Go.` Slider di foto che avanzano con lo scroll, con indicatori a barretta | scrolla | ~2 |
| 5 | `Portable` | `Mirrorless quality, peerless reputation.` + il video `Tadpole vs The World` sopra la foto di un portatile | guarda il video in loop | ~1 |
| 6 | `VideoScroll` | due pannelli video a tutto schermo con persone vere: `Mute your call with a single tap.` e `Out of sight? Out of Mic.` Sopra, illustrazioni tecniche e i dati (`Tap To Mute`, `VisiMic.`) | scrolla | ~3 |
| 7 | `Unboxing` | griglia di 7 riquadri di video in loop del prodotto su fondo bianco, ognuno con un micro-titolo; al centro **una card gialla** `What's inside the box.` | scorre la griglia | ~2-3 |
| 8 | `TadpolePromo` | schermata piena: `Take one home today.` / `Get your Tadpole for $175.` / bottone **Order now** | clicca | 1 esatta (100vh) |
| 9 | `HeroSpecs` | fondo nero, `Technical Specifications`, testo di apertura `Read first.` | legge | ~2 |
| 10 | `Material` | `Color, Material, Finish.` — materiali, misure, peso, con esploso illustrato | legge | ~2 |
| 11 | `Tactile` | `Tactile Capabilities.` — pulsante, cavo, magnete | legge | ~2 |
| 12 | `ImageSound` | `Image & sound.` — lente, sensore, microfono, con il paragrafo sugli insetti | legge | ~2 |
| — | footer | newsletter + mappa del sito | — | ~1 |

Totale stimato: **20-24 schermate di scroll** sul desktop. Non misurato in
browser.

**Nota sull'impianto:** e' pubblicita' e catalogo nella stessa pagina. Le sezioni
1-8 sono lo spettacolo e finiscono nel bottone d'acquisto; le sezioni 9-12 sono
la scheda tecnica completa, ancorata a `#tech-specs` e raggiungibile dal menu
("Tadpole → Tech Specs"). Chi vuole comprare non deve mai vedere le specifiche;
chi vuole le specifiche non deve cambiare pagina.

## L'esperienza in ordine di tempo

**Primi dieci secondi (desktop, tema chiaro di default):**

- **0s** — precaricatore: fondo pieno con un `<canvas id="lo-svg-tadpole">` che
  disegna la sagoma della Tadpole. In cima, la fascia gialla `#ffdb01` con
  *"Take $50 off any order $200 USD or more with code **ANY50**"*.
- **~0,5s** — il precaricatore sfuma (`opacity 1 → 0`, 500 ms, easing lineare) e
  parte l'evento interno `enter:near-start`.
- **~0,5-6s** — la sezione hero e' nera e occupa esattamente 100vh. Il video 4K
  (`Hero_video_4k.mp4`, 1,04 MB) parte **da solo, non scrubbato**. Il titolo
  `A new species / of webcam` sta in basso a sinistra, 56 px, peso 300. In alto a
  destra la barra di navigazione mostra gia': **`Opal Tadpole` / `Laptop Webcam`
  / `B/W` / `$175`** accanto al bottone d'ordine. Il prezzo e' visibile prima del
  primo scroll.
- **fine video** — al `onEnded` la sezione prende la classe `.ended` e resta il
  fermo-immagine `hero-final-frame-desktop.webp`.
- **primo scroll** — l'hero ha `margin-bottom: -100vh` e `z-index: 4`: la sezione
  successiva e' gia' in posizione **sotto** di lui. Scrollando, l'hero si alza
  come un sipario e scopre `Introducing` gia' pronta a tutto schermo. Non c'e'
  transizione: c'e' una sovrapposizione.

**Poi, a blocchi:**

1. `Introducing` si blocca e il paragrafo si scrive da solo mentre i videini si
   accendono (vedi "Il momento").
2. `Design`: entra il render 3D. 321 frame WebP legati allo scroll da `top 85%` a
   `85% 0%`. Qui, e solo qui, compaiono **due pallini**: bianco e nero. Cliccando,
   **cambia tema tutta la prima meta' del sito** (`.theme-dark`, transizione
   colore 480 ms) *e* cambia la sequenza di immagini (`tp_white_432xxx.webp` →
   `tp_black_432xxx.webp`). E' la scelta del colore del prodotto travestita da
   scelta di tema della pagina.
3. `PhotoScroll` e `Portable`: si esce dal 3D e si entra nella fotografia di vita
   reale, ancora sotto lo stesso tema.
4. Il blocco a tema (sezioni 1-5) ha anch'esso `margin-bottom: -100vh`: alla fine
   si alza e scopre `VideoScroll`, che e' gia' li' sotto a tutto schermo con
   persone vere in videochiamata. Da qui in poi il tema e' fisso.
5. `Unboxing`: un pannello bianco arrotondato (`animatedBar`) sale e si allarga
   sopra il fondo nero (`y: 0 → -96px`, `scaleX: .75 → 1`), e dentro c'e' la
   griglia dei sette riquadri.
6. `TadpolePromo`: schermata piena, prezzo, bottone. Anche questa ha
   `margin-bottom: -100vh` e `z-index: 3` — la scheda tecnica e' gia' sotto e
   viene scoperta scrollando.
7. Quattro sezioni di specifiche su fondo `#0a0a0a`.

## Animazioni

Libreria: **GSAP 3.12.3** con **ScrollTrigger**, **SplitText** e **Observer**.
Nessun smooth-scroll (niente Lenis, niente Locomotive, niente ScrollSmoother
attivo): lo scroll e' quello nativo del browser, gli effetti sono tutti
`scrub`. Tutti i dati qui sotto sono presi dal bundle.

| elemento | cosa si muove | legato a | curva / inerzia | note |
|---|---|---|---|---|
| video hero | play una volta sola | evento `enter:near-start` a fine precaricatore | — | `autoPlay: false`, avviato a mano; `muted`, `playsInline` |
| velo hero | `autoAlpha 1 → 0` | scroll, `start: "top bottom-=5% bottom"` → `end: "bottom+=5% top"` | `scrub: 1` | gradiente bianco (o `#0a0a0a` in tema scuro) |
| sezione `Introducing` | **pin** per `2 * innerHeight` px | scroll | `scrub: 1` | `start: "top top"` |
| parole del paragrafo | `opacity 0 → 1` una alla volta | scroll `top+=175% center` → `bottom+=200% center` | `scrub: 1`, transizione CSS `.2s ease` | indice = `floor(progress * (n+1)) - 1` |
| videini in linea | `opacity .1 → 1`, `scale(1) → scale(1.7)`, bordo e ombra; `play()`/`pause()` | stesso trigger delle parole | `.35s var(--ease-o6)` = `cubic-bezier(0.19,1,0.22,1)` | 80x80 px desktop, 48 px tablet |
| render 3D | 321 WebP disegnati su `<canvas>` | scroll `top 85%` → `85% 0%` | `scrub: .5`, `snap: 1` | all'entrata fa un'animazione autonoma verso `initFrameScroll`, poi passa il comando allo scroll |
| cambio tema | `background-color` e `color` di 5 sezioni | click sui pallini | `.48s var(--ease-o1)` = `cubic-bezier(0.47,0,0.745,0.715)` | i pallini sono disattivati (`pointer-events: none`) durante la transizione |
| slider foto | indice immagine + variabile CSS `--progress` per la barretta | scroll, `bottom+=15% center` (<1000px) o `bottom top+=35%` (>=1000px) | `scrub: 1`, `ease: none` | `progress` mappato su `floor(p * n)`; il resto riempie la barretta |
| pannelli `VideoScroll` | velo `autoAlpha 1 → 0` + traslazione | scroll `top+=100vh bottom` → `bottom+=100% bottom+=70%` | `scrub: 1` | video di sfondo a tutto schermo, `object-fit: cover` |
| tutti i video di prodotto | `play()` entrando in viewport, `pause()` uscendo | ScrollTrigger `top bottom` → `bottom top` | — | risparmia CPU: nulla gira fuori schermo |
| pannello bianco `Unboxing` | `y: 0 → -96px`, `scaleX: .75 → 1` | scroll `top-=100px bottom` → `top+=5px bottom` | `scrub: 1`, `ease: linear` | solo da 1000px in su |
| titolo `Technical Specifications` | **SplitText** su righe e caratteri: `yPercent 100 → 0` | entrata in viewport | `stagger: { amount: .4 }` | le righe hanno `overflow: hidden` |
| bottone d'ordine mobile | passa da `fixed` ad `absolute` | ScrollTrigger sulla pagina, `onLeave` → classe `.at-bottom` | — | cosi' si "posa" a fine pagina invece di restare sospeso |
| bottone d'ordine desktop | il CTA della barra si trasforma (`#nav-d-order-cta-morph`, `transition: width .6s`) | click / navigazione | `var(--o6)` | passaggio dalla pagina prodotto alla pagina d'acquisto |

Nel CSS ci sono 18 curve pronte in `:root` (`--i1`…`--io6`), la scala classica
delle easing sine/quad/cubic/quart/quint/expo. Le piu' usate sono `--o6`
(`cubic-bezier(0.19,1,0.22,1)`) per gli oggetti e `--o1`/`--o3` per i colori.

**Nessuna gestione di `prefers-reduced-motion`**: zero occorrenze nel CSS, una
sola nel JS (dentro GSAP). Chi ha l'animazione ridotta a sistema riceve la
pagina identica.

## Colori

Letti dal CSS. La palette e' minuscola: due fondi, un accento, quattro grigi.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo chiaro | `#ffffff` | tema chiaro delle sezioni 2-5; pannello bianco dell'Unboxing |
| fondo scuro | `#0a0a0a` | tema scuro delle stesse sezioni; tutte le sezioni di specifiche; footer |
| nero hero | `#000000` | fondo della sola sezione video d'apertura |
| nero Unboxing | `#080808` | fondo dietro il pannello bianco della griglia |
| testo su chiaro | `#030303` / `#111111` | titoli `PhotoScroll` e `Design` |
| testo su scuro | `#ffffff` | titoli in tema scuro |
| **accento giallo** | **`#ffdb01`** | fascia promo in cima; **card "What's inside the box."**; hover dei bottoni scuri |
| giallo invertito | `rgb(0,36,254)` (blu) | hover dei bottoni quando la sezione e' in tema scuro (e' il complementare del giallo) |
| grigio testo 1 | `#767676` | tutte le didascalie e i paragrafi secondari in tema chiaro |
| grigio testo 2 | `#777777` | stessi paragrafi in tema scuro |
| grigio testo 3 | `#959595` / `#939393` | note piccolissime (12 px) e il prezzo nel promo |
| grigio store | `#999999` | note della pagina d'acquisto ("We ship worldwide"), titoli delle FAQ |
| testo "spento" | `rgba(18,18,18,.1)` / `rgba(255,255,255,.1)` | le parole **non ancora accese** del paragrafo `Introducing` |
| bordi | `rgba(0,0,0,.1)` | griglia dell'Unboxing, divisori delle specifiche |
| stati | `#5ab864` verde, `#ff3427` rosso, `#2156f5` blu | validazione del form newsletter (non nella pagina prodotto) |

Nota: il giallo non e' mai usato per una superficie grande. Compare tre volte, e
una delle tre e' la card che spiega cosa c'e' nella scatola.

## Tipografia

Due famiglie, **entrambe servite in locale** come `.woff2` da
`/static/fonts/`, con `font-display: swap`. **Nessun servizio esterno**
(niente Google Fonts, niente Adobe). Non sono variabili: sono nove file statici.

- **Roobert** (font commerciale di Displaay) — pesi 300, 400, 500, 600, 700 +
  italico 500. E' il carattere di tutto il sito.
- **SF** e **SFC** — pesi 400/500 e 300. Usati solo dove serve il carattere
  Apple (le didascalie di sistema).

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| titolo hero | Roobert | 300 | 28 px → 40 px → `min(56px, 56vw*100/1648)` | 1.075 | `letter-spacing: -.034vw` |
| paragrafo `Introducing` | Roobert | 300 | 28 px → 40 px → `min(72px, 72vw*100/1648)` | 1.28 → 1.11 | e' il corpo piu' grande della pagina |
| didascalia `Introducing` | Roobert | 300 | 18 px → `min(32px, …)` | 1.55 → 1.25 | la riga "And now, it works with both  Mac and  PC." |
| titolo di sezione | Roobert | 300 | 24 px → 32 px → `min(32px, …)` | 1.33 → 1.25 | `Uniquely designed for your laptop.` |
| titolo `VideoScroll` | Roobert | 300 | 32 px → `min(48px, …)` | 1.25 | `max-width: 255px` su mobile: due-tre parole per riga |
| titolo card gialla | Roobert | 300 | 32 px → `min(48px, …)` | 1.25 | `max-width: 250px` |
| titolo promo finale | Roobert | 300 | 32 px → 40 px → `min(56px, …)` | 1.07 | centrato sotto i 1000px, a sinistra sopra |
| micro-titolo Unboxing | Roobert | 600 → 700 | ~16 px | — | l'unico posto in grassetto della meta' spettacolo |
| paragrafo corrente | Roobert | 400 | 12 px → 14 px → `min(16px, …)` | 1.66 → 1.5 | colore `#767676` |
| nota / dato tecnico | Roobert | 400 | 12 px | 20 px | `letter-spacing: -.12px` |
| classi d'utilita' | Roobert | 500 | `copy-body-3` 14/24, `copy-heading-2` 40/48 | — | usate fuori dalla pagina prodotto |

**La regola tipografica che tiene tutto insieme:** ogni corpo desktop e' scritto
come `min(Npx, N vw*100/1648)`. Sopra i 1648 px il testo si ferma alla misura
disegnata; sotto, si restringe in proporzione esatta alla larghezza. Non c'e'
nessun `clamp()` con minimo: il minimo lo danno i due breakpoint (700 e 1000 px)
che riscrivono da capo il corpo. Tre valori a mano, non una formula fluida.

**Il peso 300 e' la scelta di identita'.** Tutti i titoli, dal claim d'apertura
al prezzo finale, sono in Light. Un prodotto piccolo raccontato con un carattere
sottile.

## Testi veri

Trascritti dal bundle, in inglese, nell'ordine in cui compaiono.

**Barra promo (fissa, gialla)**
> Take $50 off any order $200 USD or more with code **ANY50**

**Menu desktop** — colonne: `Products` (Tadpole, C1, Composer) · `Company`
(About, Terms, Privacy) · `Resources` (Support, Media Kit, Downloads,
Newsletter). Blocco d'ordine sempre visibile: `Opal Tadpole` / `Laptop Webcam` /
`B/W` / `$175` + `Order now`. Sotto-menu della Tadpole: `Overview` · `Comparison`
(sul desktop anche `Tech Specs`).

**Hero**
> `<h1>` (nascosto ai vedenti, per lo screen reader): **A new species of webcam**
> `<h2>` (visibile): **A new species / of webcam**

**Introducing** (un solo blocco, si accende parola per parola)
> Introducing the Tadpole the smallest webcam ever built. With a category-first
> directional microphone, a mirrorless Sony sensor, and the easiest way to mute
> your call with a tap, it's the perfect webcam to take with you everywhere
>
> And now, it works with both  Mac and  PC.

**Design**
> **Uniquely designed for your laptop.**
> The Tadpole is the remarkably small, laptop dedicated, camera system designed
> by Opal.
> It comes with an adjustable clip that fits most laptop displays, a bead you can
> use to safely store your camera or wrap it around your wrist, and a premium
> woven cable.
>
> (pulsanti nascosti: `Toggle Light Theme` / `Toggle Dark Theme`)

**PhotoScroll**
> **Teenie- Tiny.**
> The tadpole is just a tad taller than a gummy bear. It fits in your hand and it
> clips nicely on your laptop display.
> *(su desktop l'ultima frase cambia in: "…and rests nicely on your laptop
> display.")*
>
> **Clip And Go.**
> The Opal Tadpole Was made to go with you. Wrap it around your wrist or put it
> in its case to keep it safe.

**Portable**
> **Mirrorless quality, peerless reputation.**
> Our powerful Sony IMX582 RS sensor combined with our f1.8 six element glass
> lens produces the truest color you can carry in your pocket.
>
> etichetta sul video: **Tadpole vs The World**

**VideoScroll — pannello 1**
> **Mute your / call with / a single tap.**
> Have you ever wished you could instantly mute yourself in a video call without
> having to look for that elusive mic button? Well, now you can have it.
>
> **Tap To Mute™**
> Touch it or swipe it. Our integrated capacitive USB-C button can mute your mic
> instantly.

**VideoScroll — pannello 2**
> **Out of sight? / Out of Mic.**
> A first on any consumer device, our directional VisiMic microphone captures
> only what the camera can see. By allowing sound waves to pass through a sonic
> tunnel inside the device, any sound outside the camera's field of view is not
> recorded. No noise filtering, just physics.
>
> **VisiMic.**
> Field of View on a webcam for the first time. Our Mic technology can filter out
> the loudest background sounds.

**Unboxing** — i sette riquadri, in ordine nel codice:
> **Lens To Impress.** — With an f1.8 lens letting in as much light as a
> professional camera.
> **Tap To Mute™** — tap the capacitive USB-C button at anytime to mute your
> microphone.
> *(card gialla)* **What's inside / the box.** — Good things come in small
> packages, and inside of this you will find everything you need to get your
> video up and running. Both for Macs and PCs, no software needed.
> — in fondo alla card: With every purchase you get access to the Opal Composer
> app for Mac and a continuous stream of updates.
> **VisiMic.** — The first mic to capture only what the camera can see.
> **Designed for laptops.** — Equipped with a clip that can fit most laptop
> displays on the market.
> **Case.** — Designed to look like a yo-yo but resistant like a vault.
> *(etichetta: `sold separately`)*
> **Bead.** — wrap your camera around your wrist as you go from meeting to
> meeting.

**TadpolePromo — la chiamata all'azione principale**
> `<h1>` nascosto: **Opal Tadpole.**
> **Take one / home today.**
> Get your Tadpole for $175.
> [ **Order now** ] → `/shop/opal-tadpole`

**Specifiche**
> **Technical Specifications**
> etichetta sul prodotto: **The tiny webcam with a clip.** — Opal Camera Inc.
> Designed in San Francisco, USA. Made in Taipei, Taiwan.
>
> **Read first.**
> The Tadpole is a feat of engineering. This tiny 3.5 by 4.5 cm unit is a
> powerful self-contained image capture system, equipped with a category first
> directional mic, and a mount system able to clip on most laptop displays. Our
> package comes with a premium woven cable, a wrap-around bead and a capacitive
> USB-C mute button. This is the most compact, full equipped camera system on the
> market. And it weights less than 50 grams.
>
> **Color, Material, Finish.** — Front: Painted aluminum 6K series · Back:
> Anodized aluminum 6K series · Clip: Premium silicone rubber · Glass:
> Chemically-strengthened glass · **95% Recyclable** · Height 35mm · Width 45mm ·
> Depth 20mm · Device weight 35gr · Cable & connector weight 10gr · Maximum clip
> opening 35º
>
> **Tactile Capabilities.** — Tap To Mute™ · USB-C Connector · Built-in
> capacitive touch with LED · Touch surface 0.7mm thick chemically strengthened ·
> Cable: USB 2.0 200 MBps, gold-plated contacts, premium woven fabric, 55 cm,
> 3.7 mm · **45 grams · 47 Parts · 8 Materials**
>
> **Image & sound.** — DFOV 70º · EFL 4.8 mm · Aperture ƒ1.8 · Focal range
> 10 cm → ∞ · Phase detection · 6 plastic elements · Sony IMX582 Exmor RS · CMOS
> Rolling Shutter · 48MP binned to 1080P · 30 FPS
> — *Powered by premium mobile phone sensor technology for a true-to-life image
> quality.*
> — *Our microphone sensor is a novel design inspired by the physics behind the
> smallest auditory systems in nature - insects. Tadpole's directional MEMS
> transducer in such a way that it can provide a high-performing dipole response
> in an ultra-compact form factor.*

**Piede**
> Subscribe to the / Opal Newsletter
> Latest news, musings, announcements and updates direct to your inbox.
> By signing up, I agree with the data protection policy of Opal.
> Opal Camera Inc. — All rights reserved

**Pagina d'acquisto `/shop/opal-tadpole`**
> **Purchase your** *(al 20% di opacita')* **Opal Tadpole**
> **Choose your finish.** → `White Edition` · `Black Edition` (ognuno con il
> proprio contatore +/−)
> **Accessories.** → `Yoyo Case` `+ $25` · `No thanks, I don't need a case.`
> We ship worldwide · Taxes are calculated at next step.
> [ **$ totale** ] [ **Checkout** ]
>
> FAQ a fisarmonica:
> · What devices is Tadpole compatible with? → Tadpole works with both Windows
>   (Windows 7 or later) and Mac (Mac OS X Mountain Lion or later) laptops.
> · What is the return policy? → We accept returns within 30 days for a full
>   refund. Returns after this period will receive store credit.
> · What is the video resolution and frame rate of the webcam? → The camera
>   shoots all video in 4K, and downscales based on the requested resolution up
>   to 1080p, the current maximum of all video conferencing applications.
> · How do I adjust the webcam settings for optimal video quality? → Mac users
>   can download Opal Composer to customize settings. For Windows users, we
>   recommend using OBS Studio.
> · How large of laptops does Tadpole support? → Tadpole's nylon USB-C cable
>   works with most laptops up to 16" in screen size. The mounting clip opens to
>   a width of 7mm (9/32").
>
> chiusura: With every purchase you get access to the Opal Composer app for Mac
> and a continuous stream of updates and complete device protection.

**Messaggio in landscape (solo mobile)**
> Please rotate your device.

**Senza JavaScript**
> Please enable JavaScript to view this website

---

## Il percorso fino all'acquisto

Questa e' la parte che a un'agenzia serve davvero. Il sito ha **tre porte
d'acquisto sempre aperte** e una sola pagina di configurazione.

1. **Barra di navigazione, desktop.** Non c'e' un carrello. C'e' un blocco che
   dice cosa stai guardando e quanto costa — `Opal Tadpole / Laptop Webcam /
   B/W / $175` — accanto al bottone. Il prezzo e' sullo schermo dal primo
   fotogramma, prima ancora del titolo. Il bottone non e' un link secco: e' un
   elemento che **si trasforma** (`#nav-d-order-cta-morph`, `transition: width
   .6s var(--o6)`) quando si va alla pagina d'acquisto.
2. **Bottone fisso, mobile.** Un unico bottone largo 152 px, centrato, a 30 px
   dal fondo, `position: fixed`, con **`mix-blend-mode: difference`** — quindi si
   inverte da solo su qualunque cosa ci passi sotto: nero sui video chiari,
   bianco sui video scuri. Mai un fondo semitrasparente, mai un problema di
   contrasto. Arrivati in fondo alla pagina prende la classe `.at-bottom` e
   diventa `absolute`: smette di galleggiare e si posa.
3. **`TadpolePromo`, la schermata dedicata.** Una schermata intera, prezzo
   scritto per esteso in una riga di 16 px grigia (`Get your Tadpole for $175.`)
   sotto un titolo grande e caldo (`Take one home today.`). E' l'unico punto
   della pagina dove il prezzo e' scritto in una frase e non in un dato.
4. **La barra promo.** Fissa, gialla, sempre lassu': `ANY50`, 50 $ di sconto
   sopra i 200 $. La Tadpole costa 175 $ — **da sola non arriva alla soglia**.
   Con la Yoyo Case da 25 $ fa esattamente 200 $. Lo sconto e' costruito per
   vendere l'accessorio.

**La pagina d'acquisto** e' un configuratore a due colonne, non un carrello:

- sinistra (8 colonne su 12): il prodotto in un riquadro **`sticky top-22`** che
  resta fermo mentre si scorre la colonna destra, e cambia immagine (con
  dissolvenza) al variare della finitura scelta;
- destra (4 colonne): titolo, `Choose your finish.` con due righe cliccabili
  (bianco / nero, ognuna con contatore quantita'), `Accessories.` con la custodia
  e la riga di rifiuto esplicito **"No thanks, I don't need a case."**, poi le
  due righe di rassicurazione, poi le cinque FAQ;
- in basso, sempre visibile, una barra **`sticky bottom-0`** con il totale e
  `Checkout`.

Al `submit` il sito fa `POST /api/checkout/tadpole` con
`{tadpoleBlack: n, tadpoleWhite: n, tadpoleCase: n}` e poi
`window.location.href = checkoutUrl`. **Il checkout vero e' altrove** (nessuna
traccia di Shopify o Stripe nel bundle: e' un endpoint proprio che restituisce
un URL). Se tutte le quantita' sono zero, la funzione esce subito senza chiamare
niente.

Prodotti nel codice, con ID:

| alias | finitura | prezzo | max |
|---|---|---|---|
| `tadpoleWhite` | white | $175 | 99 |
| `tadpoleBlack` | black | $175 | 99 |
| `tadpoleCase` | transparent | $25 | 99 |
| `opalC1White` / `opalC1Black` | — | $300 | 99 |

**La quarta porta, quella lenta:** il menu della Tadpole ha una voce
`Comparison`, che porta a una pagina di **video girati con la Tadpole a
confronto con MacBook M1, Logitech Brio, Logitech C920, Lenovo, Asus Zenbook e la
stessa Opal C1** (`/assets/media/opal-tadpole/comparison/`, 1,3-3,8 MB per
clip, in tre risoluzioni). Non e' una tabella di specifiche: e' la stessa persona
ripresa da sette webcam diverse. Per chi non compra d'impulso, la prova e' li'.

---

## Come alterna spettacolo e informazione di prodotto

E' il punto piu' interessante di questo sito e vale la pena scriverlo per esteso.

**Non alterna a caso: alterna per canale.** Ogni pezzo di informazione tecnica
compare due volte, in due registri diversi, in due punti diversi della pagina.

| informazione | prima volta (spettacolo) | seconda volta (dato) |
|---|---|---|
| il microfono direzionale | parola "microphone" che si accende accanto a un videino di onde sonore, e poi un pannello video a tutto schermo con un titolo che fa una battuta (`Out of sight? Out of Mic.`) | riquadro `VisiMic.` — 20 Hz-20 kHz, 63.5 dBA SNR, 685 µA |
| il pulsante mute | una domanda diretta ("Have you ever wished…"), poi un riquadro in loop dove il pulsante lampeggia | `Tactile Capabilities.` — touch capacitivo, vetro 0,7 mm |
| la dimensione | *"just a tad taller than a gummy bear"* su una fotografia in mano | 35 x 45 x 20 mm, 35 gr |
| il sensore | *"the truest color you can carry in your pocket"* + un video di confronto | Sony IMX582 Exmor RS, 0.8 µm, 48MP binned to 1080P |
| il materiale | il render 3D che ruota, bianco o nero | Painted aluminum 6K series, 95% Recyclable |

E la sequenza non e' spettacolo-dato-spettacolo-dato: e' **tutto lo spettacolo,
poi il bottone, poi tutti i dati**. Il bottone `Take one home today.` sta
*esattamente* nel punto in cui finisce l'emozione e comincia la scheda tecnica.
Chi si e' innamorato compra li'. Chi non si e' innamorato scrolla ancora e trova
47 parti, 8 materiali e il paragrafo sugli insetti.

**Tre osservazioni sui testi**, perche' sono la vera macchina di questo sito:

1. **Titoli corti, sottotitoli che spiegano.** Nessun titolo supera le sei
   parole: `Teenie-Tiny.` · `Clip And Go.` · `Lens To Impress.` · `Case.` ·
   `Bead.` Il punto fermo dopo una sola parola e' una scelta di ritmo — sono
   didascalie da museo, non slogan.
2. **Il paragone sempre concreto, mai il numero.** Nella meta' spettacolo non
   c'e' *un solo millimetro*: c'e' l'orsetto gommoso, la mano, il polso, la
   tasca. I millimetri arrivano dopo il bottone.
3. **La rassicurazione dove serve, non prima.** Compatibilita', resi, risoluzione
   e software non stanno nella pagina prodotto: stanno **nella pagina
   d'acquisto**, sotto il bottone di checkout, sotto forma di cinque domande. La
   pagina prodotto dice una sola cosa rassicurante — *"Both for Macs and PCs, no
   software needed"* — e la dice dentro la card gialla.

---

## Mobile

Sotto i 700 px il sito **cambia meccanica, non solo impaginazione**.

**Cosa SPARISCE**
- I **videini incastonati fra le parole** del paragrafo `Introducing`. Su
  desktop sono `position: relative` in linea con il testo; sotto i 700 px
  diventano `position: absolute; left: calc(50% - 32.5px)` e **restano a
  opacita' .1** — praticamente invisibili.
- Il blocco d'ordine con il prezzo nella barra desktop (`Opal Tadpole / B/W /
  $175`). Il menu mobile e' solo logo + hamburger + logomark.
- La voce `Tech Specs` dal sotto-menu (nel menu mobile della Tadpole restano
  `Overview` e `Comparison`).
- La griglia a 12 colonne: diventa 4 colonne sotto i 700 px, 8 fra 700 e 1000.

**Cosa viene SOSTITUITO**
- **Il momento chiave.** Al posto dei videini in linea, sotto i 700 px si accende
  un contenitore separato (`sectionVideosMobile`) alto **500%** della sezione,
  con **quattro video da 140x140 px** sparsi in posizione assoluta a
  `top: 65% / 75% / 85% / 95%`, a destra, a sinistra, a destra, al centro. Il
  testo si accende comunque parola per parola, ma i filmati gli scorrono
  **intorno** invece che dentro. Stessa idea, coreografia diversa.
- **Gli spazi.** Su mobile vengono inseriti `<span>` dedicati (`spaceMobile`) che
  contengono uno spazio o una virgola, perche' senza i videini in linea la
  punteggiatura si perderebbe. Sopra i 700 px quegli span sono
  `display: none`.
- **Tutti i video di fondo.** Non e' un ridimensionamento: sono **file diversi,
  girati in verticale**. `Hero_video_4k.mp4` (3840x2160) →
  `Hero_video_4k_mobile.mp4` (**1280x2310**). Idem `videoBg01`/`videoBg02` della
  sezione `VideoScroll`. Ognuno ha il suo `poster` WebP di ripiego.
- **La sequenza 3D.** Da `white1920_q80` a `white1280_q80`, e i parametri di
  scrub cambiano (`top 85% → 85% 0%` diventa `10% 95% → 80% 0%`), con
  `resolutionScale: 2`.
- **Il bottone d'acquisto.** Il CTA della barra desktop e' sostituito dal
  bottone fisso in basso con `mix-blend-mode: difference`.
- **La griglia Unboxing.** 7 riquadri: **2 colonne** su mobile, 4 da 700 px,
  **3** da 1000 px. E l'ordine cambia: la card gialla `What's inside the box.`
  ha `order: -1` su mobile — **e' la prima cosa che si vede della sezione**,
  larga tutto lo schermo — mentre su desktop torna in mezzo alla griglia
  (`order: 3`). Ogni riquadro ha un `order` diverso per breakpoint: la griglia e'
  ricomposta tre volte a mano.
- **I titoli allineati.** Titolo hero, titolo promo e sequenza 3D sono
  `text-align: center` sotto i 1000 px e `text-align: left` sopra.
- **L'altezza del viewport.** Non si usa `100vh` ma una variabile
  `--page-vh` ricalcolata in JS, e il ricalcolo scatta **solo se l'altezza
  cambia di piu' di 250 px** — cosi' la comparsa della barra del browser mobile
  non fa saltare tutta la pagina. `ScrollTrigger.config({ignoreMobileResize:
  true})`.

**Cosa RESTA**
- L'ordine delle sezioni: identico, nessuna sezione viene tolta.
- Tutti i testi: identici, tranne una riga di `Teenie-Tiny.` (*"fits in your hand
  and **it clips** nicely"* su mobile, *"…and **rests** nicely"* su desktop).
- Il pin di `Introducing` e tutti gli scrub.
- Il cambio tema bianco/nero.
- Le sezioni di specifiche complete.

**In piu' sul telefono**: se si gira in orizzontale compare un pannello a tutto
schermo con scritto **"Please rotate your device."** Il sito verticale non e'
previsto in landscape.

---

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| resa | **SPA in React 18.2.0**, montata su `#root` da un `app.js` unico | **VERIFICATO** | l'HTML servito e' un guscio: navigazione, piede, barra promo e `<noscript>Please enable JavaScript to view this website</noscript>`. Zero contenuto di prodotto. `version:"18.2.0"` nel bundle |
| architettura | non e' un framework: e' un **sito multipagina classico con isole React**. Un `<div id="is-page-tadpole">` vuoto nell'HTML dice al JS di montare la pagina prodotto | **VERIFICATO** | classe `loadPage()` che fa `createRoot(document.getElementById('root')).render(...)` solo se il div esiste |
| build | Webpack (CSS Modules con hash `Nome-module__classe--xxxxx`, `i(667294)` per gli asset) | **VERIFICATO** | nomi delle classi nel CSS e chiamate `require` numeriche nel bundle |
| CSS d'utilita' | **Tailwind** (o un clone) affiancato ai CSS Modules | **VERIFICATO** | `col-span-*`, `md:`/`lg:`/`xl:`, `--tw-text-opacity`, colori personalizzati `text-opal-grey1`, `bg-opal-yellow-digital` |
| animazione | **GSAP 3.12.3** + **ScrollTrigger** + **SplitText** + **Observer** + `gsap.context()` e `gsap.matchMedia()` | **VERIFICATO** | `version:"3.12.3"`; 64 riferimenti a ScrollTrigger; la classe con `chars/words/lines` e il messaggio `revert() call wasn't scoped properly.` e' SplitText |
| scroll | **nativo**, nessuno smooth-scroll | **VERIFICATO** | zero occorrenze di Lenis / Locomotive; `ScrollSmoother` compare solo nella lista dei plugin GSAP, mai registrato; `ScrollTrigger.config({ignoreMobileResize: true})` |
| 3D | **nessun WebGL nella pagina prodotto**: la rotazione e' una **sequenza di 321 WebP disegnati su `<canvas>` 2D** | **VERIFICATO** | `getContext("2d")`, 321 `new Image()` precaricate, `drawImage` a ogni update |
| WebGL | esiste un motore WebGL proprio nel bundle (shader, FBO, texture) — usato dal precaricatore e da altre pagine, **non** dalle sezioni Tadpole | **VERIFICATO** (esistenza) / **SUPPOSTO** (a cosa serve) | `createTexture`, `texImage2D`, `createShader`; il precaricatore ha `<canvas id="lo-svg-tadpole">` |
| video | `.mp4` H.264 serviti in proprio da `/assets/media/`, `muted playsInline loop disableRemotePlayback`, con `poster` WebP | **VERIFICATO** | attributi e percorsi nel bundle |
| immagini | **WebP ovunque**, servite con `<picture>` e `<source media>` a 4 soglie (600 / 1000 / 1280 / oltre), spesso con `1x 2x 3x` | **VERIFICATO** | markup nel bundle |
| font | Roobert + SF/SFC, **`.woff2` in locale**, `font-display: swap`, nove file statici | **VERIFICATO** | `@font-face` in `app.css`, percorsi `/static/fonts/` |
| e-commerce | endpoint proprio `POST /api/checkout/tadpole` → `checkoutUrl` esterno | **VERIFICATO** (la chiamata) / **non verificato** (chi c'e' dietro) | nessuna stringa Shopify / Stripe / Snipcart nel bundle |
| CMS | **nessuno**: i testi sono nel JSX, le foto in un JSON incorporato (`JSON.parse('{"St":{"imgDesktop":…')`) | **VERIFICATO** | i testi sono letterali nel bundle |
| hosting / CDN | **Cloudflare** | **VERIFICATO** | `/cdn-cgi/scripts/.../email-decode.min.js` nell'HTML |
| analytics | **nessuno nel guscio HTML della versione premiata** | **VERIFICATO** | zero GTM, GA, Segment, Klaviyo, Hotjar. (Il sito attuale su `op.al` invece precarica `googletagmanager.com/gtm.js?id=GTM-MWF58NC`) |
| accessibilita' | `<h1 class="sr-only">` per il titolo vero, `alt` su tutte le immagini, `role="presentation"` sulle icone, `aria-label` sui bottoni; **ma nessun `prefers-reduced-motion`** | **VERIFICATO** | markup nel bundle; zero occorrenze nel CSS |

**Nota importante sulla cronologia dello stack.** La versione premiata
(nov 2023 - meta' 2024) e' questa SPA React/Webpack fatta a mano. Nel corso del
2025 il sito e' stato **riscritto in Next.js** (`_next/static/chunks/pages/
opal-tadpole/comparison-*.js`, catture Wayback da gennaio 2025) e nel 2026 il
dominio e' passato a `op.al`. Se qualcuno guardasse il sito oggi, guarderebbe un
sito diverso.

## Peso e prestazioni

Numeri veri, presi dall'indice CDX della Wayback Machine (sono i **byte
trasferiti**, quindi gia' compressi dove il server comprimeva).

**Codice**

| file | trasferito | non compresso |
|---|---|---|
| `app.677cac91.css` | **53,4 KB** | 341,7 KB |
| `app.0d8bddea.js` | **592,0 KB** | 2,73 MB |

Un solo CSS e un solo JS per **tutto il sito** (home, C1, Tadpole, Composer,
newsroom, negozio, pagine legali). Nessuno spezzettamento per rotta: chi apre la
pagina Tadpole scarica anche il codice della pagina C1.

**Media della sola pagina Tadpole** (somma delle risorse archiviate):

| gruppo | file | peso |
|---|---|---|
| sequenza 3D bianca 1920 | **321** WebP | **13,70 MB** (~42,7 KB a frame) |
| fotografie `PhotoScroll` | 26 | 8,40 MB |
| video `Unboxing` | 13 | 4,11 MB |
| video `VideoScroll` (fondo) | 6 | 3,21 MB |
| video hero + confronto | 4 | 2,17 MB |
| immagini hero (fermo-immagine + poster) | 3 | 1,32 MB |
| videini `Introducing` | 8 | 0,57 MB |

Singoli, per dare la scala: `Hero_video_4k.mp4` **1,04 MB** (versione mobile
verticale **0,75 MB**); `hero-final-frame-desktop.webp` **0,98 MB**;
`videoBg02.mp4` **1,81 MB**; `case-yoyo.mp4` **1,44 MB**.

**Totale stimato per uno scroll completo su desktop, tema bianco:
circa 33-34 MB.** Piu' i 645 KB di codice. E se si clicca il pallino nero, si
scarica **una seconda sequenza da 321 frame**.

La pagina di confronto `/opal-tadpole/comparison` da sola vale un altro
**~30 MB** (sette clip in tre risoluzioni, la piu' pesante `C1_raw.mp4` a
**3,83 MB**).

**Come lo tengono in piedi**, perche' 34 MB non sono un incidente ma una scelta
gestita:
- ogni `<video>` fa `play()` entrando in viewport e `pause()` uscendo — mai piu'
  di uno o due che girano davvero;
- tutte le immagini non hero hanno `loading="lazy"`;
- la sequenza 3D e' precaricata in blocco all'entrata della sezione, con
  un'icona di caricamento dedicata (`ImageSequence-module__loadingIcon`) e un
  `onload` sul frame corrente per sapere quando si puo' cominciare;
- l'aggiornamento del canvas avviene solo dentro `onUpdate` di ScrollTrigger,
  non in un `requestAnimationFrame` continuo.

**Non ho misurato**: Lighthouse, LCP, CLS, TTFB, tempo al primo fotogramma. Il
sito non e' piu' raggiungibile e la Wayback non e' un banco di prova credibile.

---

## Tre cose da rubare

**1. Il paragrafo che si accende parola per parola, con gli oggetti dentro.**
La meccanica costa poco: spezzi il testo in `<span>` (a mano nel JSX, o con
SplitText), metti gli span a `opacity: 0`, blocchi la sezione con
`ScrollTrigger pin + scrub: 1`, e in `onUpdate` calcoli
`i = floor(progress * (n+1)) - 1` per aggiungere una classe agli span fino a `i`.
La parte che fa la differenza e' la seconda: **fra le parole ci metti dei
`<video>` da 80 px** con lo stesso trattamento, che scattano a `scale(1.7)` e
partono in play quando arriva il loro turno. Costo di produzione: quattro
animazioni a linea da 15-20 KB l'una (i quattro videini di Opal pesano **0,57 MB
in tutto**). Effetto: il visitatore *legge* le funzioni invece di scorrere una
lista di icone. E funziona identico per un servizio, non solo per un oggetto.

**2. Il selettore di colore travestito da tema della pagina.**
Due pallini in mezzo alla sezione 3D. Clicchi e non cambia solo il prodotto:
cambia il fondo di **cinque sezioni** (`.theme-dark`, transizione colore
480 ms) e cambia la cartella della sequenza di immagini
(`tp_white_*` → `tp_black_*`). Costo: girare due volte il render (che e' gia'
3D, quindi e' un secondo rendering, non un secondo servizio fotografico) e
scrivere le regole di tema come override di variabili. Guadagno commerciale:
l'utente ha gia' **scelto la finitura** prima di arrivare al carrello, e ha
passato trenta secondi a guardare *la sua* versione. Sulla pagina d'acquisto
ritrova la stessa scelta, gia' familiare.

**3. Il bottone fisso mobile con `mix-blend-mode: difference`.**
Tre righe di CSS:
```css
position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
max-width: 152px; mix-blend-mode: difference; z-index: 30;
```
piu' una regola JS che a fine pagina sostituisce `fixed` con `absolute` (classe
`.at-bottom` via `ScrollTrigger onLeave`). Risolve in un colpo il problema che
uccide meta' dei CTA fissi: **il contrasto su un fondo che cambia in
continuazione** (video chiari, video scuri, sezioni bianche, sezioni nere). Il
bottone si inverte da solo, non serve nessun rilevamento del colore di sfondo,
non serve un fondo semitrasparente. E il passaggio ad `absolute` alla fine gli
evita di coprire il piede.

*(Bonus, se ne servisse una quarta: `margin-bottom: -100vh` + `z-index`
decrescente per fare in modo che ogni blocco si alzi come un sipario scoprendo
quello gia' pronto sotto. Opal lo usa tre volte — hero, blocco a tema,
schermata d'acquisto — e non richiede ne' `position: sticky` ne' `pin`.)*

---

## Non verificato

- **Non ho mai visto il sito in movimento.** Nessuna registrazione, nessuno
  screenshot, nessun browser aperto. Tutto e' letto dal codice sorgente
  archiviato. Ritmi, durate percepite e "quanto e' bello" non li posso
  confermare.
- **Le schermate di scroll nella tabella struttura sono stime** ricavate dai
  parametri `start`/`end` di ScrollTrigger e dalle altezze CSS, non misurate.
- **I colori sono letti dal CSS** (quindi esatti come valore), ma non ho
  verificato quale sia effettivamente visibile in ogni punto della pagina: dove
  un tema copre l'altro l'ho dedotto dalle regole `.theme-dark`.
- **Il bundle JS e' del 18/12/2023, il CSS del 02/01/2024.** Sono a due settimane
  di distanza. Nel CSS ci sono classi di componenti (`PortableNew`,
  `LensAndSensor`, `ColorAndLighting`, `HeroComparison`, `VideoComparison`,
  `DraggerElement`) **che nel bundle JS non esistono**: o appartengono alla
  pagina `/opal-tadpole/comparison`, o sono arrivati in un rilascio successivo.
  Il `DraggerElement` in particolare suggerisce un **cursore trascinabile** su
  qualche confronto video che non ho potuto ispezionare.
- **La pagina `/opal-tadpole/comparison`** l'ho identificata solo dai file media
  archiviati e dalla voce di menu. Non ne ho letto il codice.
- **Il checkout**: so che il sito fa `POST /api/checkout/tadpole` e poi
  reindirizza a un `checkoutUrl`. **Non so quale piattaforma ci sia dietro** —
  nessuna stringa di Shopify, Stripe o altri nel bundle.
- **Non so quanto pesasse davvero il primo caricamento** ne' quali punteggi
  facesse. Nessun Lighthouse, nessun Core Web Vitals: il sito non esiste piu'.
- **Non so se i font Roobert fossero regolarmente licenziati** (e' un carattere a
  pagamento di Displaay); l'ho solo trovato servito in locale.
- **Non ho controllato la home page `opalcamera.com`** del 2023-24, solo la
  pagina prodotto e quella d'acquisto.
- **Il precaricatore**: so che c'e' un `<canvas id="lo-svg-tadpole">` e che
  sfuma in 500 ms, ma **non so cosa disegnasse esattamente**.
- **Non ho verificato l'uso di `<video>` in tema scuro per ogni videino**: nel
  codice ci sono coppie `file.mp4` / `file-black.mp4`, quindi lo do per
  confermato solo per i quattro di `Introducing`.
- Non ho lasciato aperta nessuna scheda del browser: **non ne ho aperta
  nessuna.**
