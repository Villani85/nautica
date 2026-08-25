# Mana Yerba Mate

- **URL**: https://manayerbamate.com/ (versione FR, canonica) — https://en.manayerbamate.com/ (versione EN, analizzata qui)
- **Premio**: Awwwards **Site of the Day** 13/03/2023 (voto 8.03/10 — design 8.06, usability 7.61, creativity 8.45, content 8.38, dev 7.8) + **Site of the Year 2023** categoria E-commerce. Fonti: https://www.awwwards.com/sites/mana-yerba-mate e https://www.awwwards.com/websites/sites_of_the_year/
- **Studio**: nessuno studio, un collettivo di freelance. Dai credits del sito stesso (pannello "Credits" nel piede, letto in `/zzz-nope` → `template-404`): **Louis Paquet** — design; **Michaël Garcia** — front-end; **Pam** — back-end; **Janick Rousseau, Camille Charbonneau, Catherine Caballero, Loopkin** — illustrazioni; **Jeff Clermont** — modello 3D.
- **Anno**: online almeno da luglio 2022 (asset datati `1658072958` = 17/07/2022), premiato marzo 2023. Il tema Shopify è ancora lo stesso (`/t/18/`): confrontando la copia Wayback del **15/03/2023 11:17** con il live di oggi, sezioni e struttura sono **identiche**; cambiano solo il gusto "Melon & Mint" e le foto (asset 2024).
- **Letto il**: 13/08/2026

---

## Cosa vende

Lattine da 355 ml di **yerba maté frizzante biologica**, prodotte a Montréal, vendute solo in confezione: **12 lattine 36,99 CAD** o **24 lattine 69,99 CAD** (~3,08 e ~2,92 CAD a lattina). Quattro gusti — Grapefruit, Blackberry & Hibiscus, Tropical, Melon & Mint — più una "Discovery box". Cinque SKU in tutto (fonte: `https://en.manayerbamate.com/products.json`).

Non vende un'esperienza: vende cartoni di bibita ricorrenti. C'è l'abbonamento (app Recharge) con **-10%**: 33,29 CAD ogni 15 o 30 giorni sul 12-pack, 62,99 sul 24.

## A chi

Il claim se lo dichiara da solo, nella meta description: *"Our company's mission is to fuel creativity and provide a showcase for emerging creative talent. MANA yerba maté offers thinkers and creatives a natural, organic, energizing infusion that unleashes the 'flow' needed to achieve their vision."* Quindi: **giovani urbani creativi del Québec/Ontario che comprano una alternativa al caffè e all'energy drink**.

Deve uscire pensando due cose: (1) è una bevanda con cui *stai bene* — bio, 120 mg di caffeina vegetale, niente crollo dopo; (2) è un marchio che gioca, quindi mettere una lattina in scrivania dice qualcosa di me. Il prezzo (37 CAD in un colpo solo) non viene mai difeso a parole: viene coperto dalla quantità di lavoro visibile sulla pagina.

## Idea regista

**La lattina è il regista**: un unico modello 3D di lattina sta al centro dello schermo dalla home al 404, e ogni volta che cambi gusto cambiano insieme la texture della lattina, il colore di fondo della pagina e il colore del pulsante "aggiungi al carrello".

## Il momento

Ce ne sono due, e sono entrambi legati allo scroll.

**Il primo, a ~4 schermate**: `.c-HomeHero--part1` è alta `400vh`. Per tutte e quattro le schermate la lattina 3D ruota su tre assi contemporaneamente (`z: -π`, `y: -π`, `x: 1.12π`), scende del 58% della propria altezza, arretra (`group.position.z → 20`) mentre la camera sale (`camera.position.y → 8`), e le illustrazioni Lottie ai lati volano fuori campo (`x: ±50%`, `y: -80%`, `rotation: ±20`). Scrub `true`, cioè legato al pixel: si può fermare a metà rotazione.

**Il secondo, subito dopo**: `.sectionCercle` viene **pinnata** e un disco gigante (`.innerCercleCartes`) ruota da 0 a **-130°** su una distanza di scroll pari a **3 volte la larghezza della finestra** (a 1440×900 sono 4320 px, circa 4,8 schermate). Sul disco sono infilate sei carte — la domanda "Mana ? Yerba Maté ? What are we talking about?" e i quattro benefici — che salgono e scendono dai bordi come su una ruota panoramica. La sezione parte con `margin-top: -100vh`, quindi si mangia l'ultima schermata dell'hero: la lattina non finisce mai, ci si scivola dentro.

Terzo momento, non da scroll ma **il più citato**: il **piede giocabile**. Vedi sotto.

## Struttura, sezione per sezione

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |
|---|---|---|---|
| `#intro` (preloader) | titolo gigante "Infused of Bio energy" a lettere che cambiano colore + 9 stelline che rimbalzano | aspetta ~3,4 s | 1 (fissa, scroll bloccato: `lenis.stop()`) |
| `#transition` | Lottie a bolle che copre e scopre lo schermo | niente | — |
| `.bandeau` (annuncio) | "Free shipping on all purchases of $35 or more Quebec and Ontario", fondo `#2B3D73` | può chiuderlo (memorizzato in `localStorage`) | — |
| `header` | logo MANA in SVG, Shop / Learn / Subscription / En-Fr / account / carrello / burger | apre i sottomenù a immagini | fissa |
| `.c-HomeHero--part1` | lattina 3D WebGL su fondo colorato + 8 "step" di illustrazioni Lottie animate + i 4 pulsanti-gusto | clicca frecce/gusti → la lattina gira e il fondo cambia colore; muove il mouse → parallasse sulla lattina | **4** (`height: 400vh`) |
| `.sectionCercle` | ruota di 6 carte: intro + Without the crash / Natural caffeine / Antioxidant / Vegan + carta finale a stelle e bolle | scroll (pinnato) | **~4,8** (3 × larghezza schermo) |
| `.c-imagesDuo` | due foto lifestyle affiancate in parallasse | scroll | ~1 |
| `.c-wordParagraph` | titolo "Flavors" a 21,1vw con lettere arcobaleno + stelline in parallasse | scroll | ~1 |
| `.c-productsSlider` | "Recommended products": 5 schede prodotto in Swiper, foto che cambia al passaggio del mouse | frecce / drag | ~1 |
| `.c-newsletterSubscribe` | "Sign up for automatic delivery* and save 10%." + razzo Lottie + fiore | clicca "Subscribe" → `/pages/abonnement` | ~1 |
| `.c-instagramPush` | 4 foto Instagram sparse + "@manayerbamate / For a dose of energy in your feed." | clicca → Instagram | ~1 |
| `footer` | **mini-gioco**: personaggio che cammina, nuvole, ostacoli, lattina da raccogliere; social; legali; Credits | preme Spazio (desktop) o "Jump key" (mobile) e gioca | ~1 |

Pagine oltre la home: `/products/<gusto>` (5), `/collections/all`, `/pages/abonnement`, `/pages/yerba-mate`, `/pages/faq`, `/pages/points-de-vente`, `/pages/contactez-nous`, `/pages/awwwards` (una pagina di ringraziamento con la sola parola "thanks" e il gioco), 404.

## L'esperienza in ordine di tempo

**Secondo per secondo, primo caricamento della home (desktop):**

- **0,0 s** — schermo pieno color crema `#FEF7E6`. Lenis è fermo (`lenis.stop()`), la pagina non scrolla. Parte in background `chargementModele()`: GLTFLoader per la lattina, RGBELoader per l'HDR.
- **0,8 s** — le lettere di "Infused / of Bio / energy" partono in scala 0.8 e rimbalzano a 1 con `elastic.out(2, 0.5)`, durata 0,6 s, **stagger 0,07 s**. Nello stesso istante ogni lettera entra nel ciclo `rainbow()`: cambia classe colore ogni **70 ms** nell'ordine arancio → blu notte → rosso → rosa → azzurro → giallo → nero. Effetto: un'onda di colore che attraversa la parola.
- **1,7 s** — le due parole "Yerba" e "Mate" salgono da sotto in `elastic.out(0.8, 0.35)`, stagger 0,1 s.
- **2,0 s → ~2,9 s** — le 9 stelline SVG entrano una alla volta (+0,1 s l'una dall'altra) da 200 px più in basso, con rotazione casuale che si azzera, `elastic.out(0.8, 0.35)`, durata 1,5 s, scala finale casuale tra 0,6 e 1.
- **3,4 s** — parte il Lottie di transizione (`transition-faster.json`), fotogrammi 0→54: un'onda di bolle copre lo schermo.
- **fine del Lottie** — `#intro` viene rimosso, si istanzia la classe `Home`, il Lottie riprende dai fotogrammi 93→94 per scoprire la pagina.
- **+0,3 s** — la lattina 3D entra: `group.rotation` da `y: 2π, x: 0.3π, z: 0.2π` a zero con `power2.out` in 1,1 s, mentre il canvas sale a `y: 0` con `elastic.out(1, 0.75)` — la lattina rimbalza come un giocattolo di gomma.
- **al termine di quel rimbalzo** — `lenis.start()`: **solo adesso** si può scrollare.
- **+0,8 s** — lo sfondo illustrato `.fond.first` sfuma da 0 a 1 in 0,8 s.

**Poi, a blocchi:**

- **0 → 4 schermate**: l'hero descritto sopra. Se non tocchi lo scroll ma clicchi una freccia, `updateCan()` fa girare la lattina di `0.3 × 2π` in `power2.in` 0,3 s, poi la porta a `2π` con `elastic.out(0.34, 0.26)` in 1,3 s; la scritta del pulsante si allarga dalla larghezza del pulsante precedente in `power4.inOut` 0,5 s; e l'attributo `data-boisson` sul `<body>` cambia, facendo virare in 0,3 s il fondo dell'hero.
- **dopo 1 schermata**: la barra dei gusti esce in basso (`y: 100%`, `power4.in`, 0,4 s).
- **4 → ~9 schermate**: la ruota delle carte pinnata. All'ingresso si mettono in pausa gli 8 Lottie dell'hero e si accendono i 4 Lottie delle carte (`Lottie.pause("etape…")` / `Lottie.play("carte")`): niente animazioni che girano fuori schermo.
- **poi**: foto in parallasse, titolo "Flavors" con lo stesso ciclo arcobaleno, carosello prodotti, abbonamento, Instagram.
- **arrivo al piede**: `ScrollTrigger` su `footer` avvia il Lottie del paesaggio e del personaggio che cammina, e due nuvole partono in loop (9 s e 8 s, `ease: none`). Compare il pulsante "Press Space to jump". Premuto Spazio: parte una timeline in loop infinito; ogni giro un oggetto attraversa lo schermo in 3,5 s. Con probabilità **30%** è una lattina (`Math.random() >= .7`), altrimenti è uno dei 7 ostacoli. Se prendi la lattina: il personaggio passa allo stato "happy", nel titolo appare **"boost"** e il paesaggio accelera da velocità 1 a 6 in 0,2 s e torna a 1 in 1 s. Se sbagli: stato "sad", appare **"ark…"** e le due nuvole si abbassano del 100% in `elastic.inOut(1,1)` e risalgono dopo 2 s.

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| lettere del titolo intro | scala 0.8→1 + ciclo di 7 classi colore | tempo (delay 0,8 s) | `elastic.out(2, 0.5)`, 0,6 s, stagger 0,07 | il colore non è una tween GSAP: sono 7 `setTimeout` da 70 ms che scambiano classi CSS (`rainbow()`) |
| stelline intro | y +200px → 0, rotate random → 0, scale 0.5 → 0.6-1 | tempo, delay 2 s + 0,1 s l'una | `elastic.out(0.8, 0.35)`, 1,5 s | GSAP |
| lattina 3D, ingresso | rotation `y:2π x:.3π z:.2π` → 0; canvas `y → 0` | tempo, delay 0,3 s | `power2.out` 1,1 s / `elastic.out(1, 0.75)` 1,1 s | three.js + GSAP; `onComplete` sblocca Lenis |
| lattina 3D, hero | rotation `z:-π y:-π x:1.12π`, canvas `+58% h`, `position.z:20`, `camera.y:8` | **scroll**, trigger `.c-HomeHero--part1` top-top → bottom-bottom | `scrub: true` (nessuna inerzia, 1:1 col pixel) | solo se `innerWidth > 600` |
| lattina 3D, mouse | rotazione e traslazione leggere | **puntatore** (`mousemove`) | `gsap.quickTo` — smorzato | ampiezza: `±π/12` in x, `/10` in z. Disattivato su touch |
| illustrazioni Lottie hero | `x: ±50%`, `y: -80%`, `rotation: ±20` | scroll, stesso trigger dell'hero | `ease: none`, `scrub: true` | fuggono ai lati mentre la lattina scende |
| ruota delle carte | `rotation: 0 → -130°` | scroll, `.sectionCercle` pinnata per `3 × innerWidth` | `power1.inOut`, `scrub: true`, `pin: true`, `anticipatePin: true` | sotto 768px il pin sparisce |
| carte benefici (mobile) | `y: 40% → 0`, `x` e `rotation` casuali (±20px, ±5°) | scroll per singola carta | `scrub: true` | il disordine è generato a runtime con `Math.random()` |
| arco decorativo `.arc` | `scaleY: 0 → 1`, origine `0 100%` | scroll, da `top bottom-6%W` a `top top` | `ease: none`, `scrub` | la curva che "cuce" hero e sezione successiva |
| stelline `.parallaxEtoile` | `y: -80px → 80px` | scroll | `ease: none`, `scrub` | solo `> 767px` |
| cambio gusto | lattina `rotation.y +π/6` poi `+π/2`; canvas scatto in `x` yoyo; ruota carte `-30° × indice` | **stato** (click) | `power2.in` 0,3 s → `elastic.out(0.34, 0.26)` 1,3 s | il rimbalzo elastico è la firma di tutto il sito |
| pulsanti (`.bounce`) | `scale` 1 → 1.05 → 0.96 → 1 | hover | `@keyframes bounceSpe`, 0,3 s, `ease` | CSS puro, non GSAP |
| pulsanti (`.btnOmbre`) | `translateY(.15em)` sopra un'ombra piena dello stesso raggio | hover | `transition .1s` | l'ombra è uno `:after` colorato: il pulsante "si schiaccia" sull'ombra |
| logo header | `y: 0 → -100px` scendendo, ritorno salendo | direzione dello scroll (evento `lenis.on('scroll')`) | `power3.in` / `power3.out`, 0,3 s | |
| transizione di pagina | Lottie a bolle 0→54 in uscita, 54→94 in entrata | click su link interno | timing del Lottie | il DOM nuovo arriva via `XMLHttpRequest` + `DOMParser`: router AJAX scritto a mano, niente Barba/Highway |
| nuvole del piede | `x → -100vw` | tempo, loop infinito | `ease: none`, 9 s e 8 s | |
| personaggio del piede | 5 Lottie che si scambiano (walk / jump / happy / sad / paysage) | stato del gioco | — | `changementEtat()` mette in pausa uno e fa partire l'altro |

Librerie riconosciute nel bundle: **GSAP 3.10.4** con **ScrollTrigger** e **MorphSVGPlugin** (plugin a pagamento, `gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin)`), **Lenis 0.2.28**, **three.js r141**, **Lottie-web**, **Swiper**.

## Colori

Estratti dal CSS (`/t/18/assets/app.css`), non stimati.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo pagina | `#FEF7E6` | `body`, crema; anche il colore del testo su fondi scuri (`.c-beige`) |
| testo | `#0E0E0E` | `body color`, tratti SVG, bordi pulsanti scuri |
| testo attenuato | `#0E0E0E99` | dettagli |
| accento primario (giallo) | `#FFD372` | fondo hero per **Grapefruit**, sfondo dei pulsanti tondi, 404 |
| accento secondario (arancio) | `#F15B40` | sfondo del pulsante principale `.btnOmbre`, sigillo "organic" |
| blu notte | `#2B3D73` | ombra dei pulsanti (`:after`), barra annuncio, fondo carte benefici per **Blackberry & Hibiscus** |
| azzurro | `#88C1F8` | fondo hero per **Blackberry & Hibiscus** |
| rosa | `#F6B1CF` | fondo hero per **Tropical**, overlay menù |
| rosso ciclamino | `#E72F63` | pulsante e carte per **Tropical** |
| verde chiaro | `#ACD084` | fondo hero per **Melon & Mint** (è anche il default di `.c-HomeHero-fond`) |
| verde scuro | `#195E1C` | pulsante e carte per **Melon & Mint** |
| bianco | `#FFF` | testo dentro i pulsanti pieni, riempimento `.elBounce` |
| grigio chiarissimo | `#F1F1F1` | riempimento `.elBounce` alternativo |
| grigio caldo | `#A09D9A` | testo secondario |
| quasi nero alternativo | `#1F1F1F` | superfici scure |

**Il meccanismo di colore che conta**: l'attributo `data-boisson` sul `<body>` (valori `pamplemousse`, `mure-et-hibiscus`, `punch-tropical`, `melon-et-menthe`) ripinta con una sola regola CSS tre cose insieme — `.c-HomeHero-fond`, `#AddToCart span` e le carte `.data .haut` — con `transition: .3s; transition-delay: .3s`. Il ritardo di 0,3 s è calibrato per far cadere il cambio colore esattamente mentre la lattina è a metà rotazione.

## Tipografia

Un solo carattere per tutto il sito: **Neue Montreal** (Pangram Pangram), servito in locale dal CDN Shopify, `woff2` + fallback `woff`, `font-display: swap`. Tre tagli, nessuna variabile: Book 300 (31 KB in woff2), Regular 400, Medium 500.

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| `body` | Neue Montreal 2020 | 400 | `clamp(18px, 1.98vw, 38px)` | 1.16 | il corpo base è enorme già così |
| `.titre` (intro, piede) | Neue Montreal 2020 | 300 | `clamp(65px, 16.2vw, 317px)` | 0.85 | maiuscolo |
| `.grosTitre` | Neue Montreal 2020 | 300 | `clamp(80px, 23.2vw, 446px)` | 1 | maiuscolo |
| `.grosTitreSpe` ("Flavors") | Neue Montreal 2020 | 300 | `21.1vw` fisso | 1 | non ha clamp: scala pura col viewport |
| `.titre2` | Neue Montreal 2020 | 300 | `clamp(65px, 11.5vw, 222px)` | 1 | maiuscolo |
| `.h2` | Neue Montreal 2020 | 400 | `clamp(40px, 5.62vw, 107px)` | 1 | maiuscolo |
| `.titreProduit` | Neue Montreal 2020 | 300 | `clamp(40px, 3.96vw, 76px)` | 0.85 | maiuscolo |
| `.sousTitre` | Neue Montreal 2020 | 300 | `clamp(18px, 2.77vw, 53px)` | 1 | maiuscolo |
| `.h5` | Neue Montreal 2020 | 400 | `clamp(20px, 1.72vw, 33px)` | 1 | |
| `.petitTexte` | Neue Montreal 2020 | 400 | `clamp(15px, 1.31vw, 25px)` | 1 | maiuscolo |
| `.petitTexte2` | Neue Montreal 2020 | 400 | `clamp(15px, 1.31vw, 25px)` | 1.25 | testo corrente delle carte |
| `.details` | — | — | `16px` fisso | 1.25 | note legali e asterischi |

Trucco tipografico: la classe `.c-noir` applicata alle lettere arcobaleno non è nero pieno ma `color: #FEF7E6` con `-webkit-text-stroke: .005em #0E0E0E` — a fine ciclo la lettera resta **vuota con il filo di contorno**, non nera.

Griglia: 12 colonne via variabili CSS, `--wrapper: 94.6vw`, `--gutter: 2.7vw` (su mobile `calc(100vw - 40px)` e `20px`).

## Testi veri

Sono in francese in originale; la versione inglese è una traduzione automatica **Weglot** montata sopra (`weglot.min.js`, `hide_switcher=true`, e `Shopify.locale = "fr"` anche sul dominio `en.`). Si vede: il titolo home in inglese suona storto.

**Home**
- Titolo del preloader (EN): `Infused / of Bio / energy` — originale FR: `Infusée / d'énergie / Bio`
- Sottotitolo: `Yerba` `Mate`
- `<h1>` reale (nascosta agli occhi, `sr-only`): `Mana - Drinking tea`
- Barra annuncio: `Free shipping on all purchases of $35 or more Quebec and Ontario`
- Carte della ruota: `Mana ? Yerba Maté ? What are we talking about?` / `(we're going to tell each other the real things)` — FR: `(on va se dire les vraies affaires)`
- `Without the crash` — `A gentle wave of energy. To get you going without the crash.`
- `Natural caffeine` — `This certified organic caffeine comes from the plant. A gift from Mother Nature.`
- `Antioxidant` — `Richer in antioxidants than tea. Not bad.`
- `Vegan` — `A plant-based drink that tastes like heaven. Who could ask for more?`
- Titolo gusti: `Flavors` — `Fresh, fruity, sparkling, beautiful colours, awaken your taste buds.`
- Carosello: `Recommended products` / `See all our products` / `Discover this product`
- Abbonamento: `Sign up for automatic delivery* and save 10%.` / `Subscribe` / `We have what you need` / `* We don't deliver in space yet, but who knows...`
- Instagram: `@manayerbamate` / `For a dose of energy in your feed.`

**Menù**: `Shop` · `Learn` · `Subscription` · `En` / `Fr` · `All our products`
Sotto-menù Shop: `Melon & Mint`, `Grapefruit`, `Blackberry & Hibiscus`, `Tropical`, `Discovery box`
Sotto-menù Learn: `Points of sale`, `Yerba Mate`, `FAQ`, `Contact`

**Carrello**: `Cart` / `Subtotal` / `Taxes and shipping costs calculated at checkout` / `Payment`

**Scheda prodotto** (Grapefruit): `$36.99` / `Energizing Infusion` / `Tasty combination of bitter grapefruit and Yerba Mate. A light residual sweetness brings a pleasant acidity.` / `12 x 355ml` · `24 x 355ml` / `Single order` · `Subscribe and save 10%.` / `Delivery every 2 weeks` · `Delivery 1 time per month` / `Add to cart` / `Only x left!` / `120mg of organic caffeine from a natural source` / `Certified by ECOCERT Canada`

**Abbonamento** (`/pages/abonnement`): `Never out of Mana` (FR: `Jamais à court de Mana`) / `Sign up for automatic delivery and save 10% on your orders.` / `1 Choose the flavor of your choice` / `2 Change, pause or cancel at any time` / `3 10% discount on all subscriptions` / `Choose your flavor and subscribe!`

**Piede**: `Press Space to jump` (desktop) / `Jump key` (mobile) / parole del gioco: `boost` e `ark...` / `2026 © Mana Yerba Maté` / `Terms of use` · `Refund policy` · `Credits`

**Cookie**: `This website uses cookies.` / `Okay`

## Mobile

È **un altro sito**, e il taglio è netto. Punti di rottura: 1280, 1024, **900**, **767/768**, **650**, **600**, 500, 480, più `@media(pointer: coarse)` e il test JS `isTouch()`.

**Cosa SPARISCE**
- **Lo scroll smooth.** `const lenis = isTouch() ? null : new Lenis(...)`. Su touch Lenis non viene proprio istanziato: scroll nativo.
- **Tutte e 12 le animazioni Lottie dell'hero.** Sono dentro `isTouch() || (Lottie.loadAnimation(...))`: su touch non vengono neanche scaricate. Restano solo le 4 dei benefici, le 5 del gioco e quella di transizione.
- **La grande coreografia dell'hero.** `.c-HomeHero--part1` passa da `height: 400vh` a `height: 100vh` sotto 600px, e `.margeNeg` da `-100vh` a `0`. Le quattro schermate di rotazione della lattina non esistono.
- **Il pin della ruota delle carte** (sotto 768px): niente `pin`, niente rotazione di -130°.
- **La parallasse del mouse sulla lattina** (`isTouch()` la disattiva) e la parallasse delle stelline (`> 767px`).
- Con `pointer: coarse` spariscono gli sticker decorativi: `.woman, .mangue, .planet, .star, .eau, .fleur`.
- Sotto 900px la voce menù piena (`.btn.offMob`: Shop, Learn, Subscription, En/Fr) e il fiore dell'abbonamento.
- Sotto 1024px il pulsante "Discover this product" sulle schede prodotto; sotto 767px la foto in hover, le frecce desktop del carosello, i social del piede, la tabella caratteristiche della scheda prodotto.
- Sotto 768px il Lottie della bolla nell'hero (`> 768` per `bubbles.json`) e alcune illustrazioni.

**Cosa viene SOSTITUITO**
- La ruota delle carte pinnata diventa **quattro carte impilate** che entrano una per una: ognuna sale da `y: 40%` con `x` e `rotation` casuali (`Math.random()`, ±20 px e ±5°), scrub sulla propria posizione.
- Lo sfondo illustrato animato diventa **una sola immagine ferma**: su touch si esegue solo `gsap.to(".fond.first", {opacity: 1, duration: .8, delay: .8})`.
- "Press Space to jump" diventa **"Jump key"**: un pulsante (`.btnEspaceMobile`, mostrato solo con `pointer: coarse`) e in più il tocco su `.innerJeu` fa saltare.
- Il canvas 3D si ridimensiona: da `clamp(650, 900, larghezza/2)` px a `0.9 × larghezza`; la camera passa da `z: 84` a `z: 70` con `y: 0.6` di correzione.
- Le frecce del carosello passano da `nav-desktop` a `nav-mobile`, sopra le schede.
- Il menù intero diventa `.innerMenuMob` a schermo pieno con burger.

**Cosa RESTA**
- La lattina 3D WebGL. Non viene sostituita da un'immagine: three.js gira anche su telefono, con `devicePixelRatio` limitato a 2.
- Il preloader completo, lettere arcobaleno e stelline comprese.
- Le transizioni di pagina AJAX con il Lottie a bolle.
- **Il gioco nel piede**, adattato al tocco.
- Tutti i colori, la tipografia in `clamp()` e i pulsanti con l'ombra.

Detto in una riga: **su telefono cade lo spettacolo dello scroll, non cade il personaggio del marchio.**

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| e-commerce | **Shopify** (tema custom "Mana" v1.0.0, `the-a-boire.myshopify.com`, shop id 27830747234, valuta CAD) | VERIFICATO | `Shopify.theme` nell'HTML; `/products.json` risponde |
| front-end | **Liquid server-side, non SPA**: l'HTML arriva completo (166 KB non compressi) con tutti i testi | VERIFICATO | `curl` senza JS restituisce tutta la pagina |
| transizioni di pagina | **router AJAX scritto a mano**: `XMLHttpRequest` + `DOMParser` + swap del `<main>`, sincronizzato con un Lottie | VERIFICATO | classe `Transition` in `global.js`; nessuna traccia di Barba/Highway/Taxi |
| animazione | **GSAP 3.10.4** + **ScrollTrigger** + **MorphSVGPlugin** | VERIFICATO | `gsap$3.version="3.10.4"`, `registerPlugin(ScrollTrigger, MorphSVGPlugin)` nel bundle |
| scroll | **Lenis 0.2.28** (`duration: 1.4`, easing `1.001 - 2^(-10t)`), disattivato su touch | VERIFICATO | `window.lenisVersion="0.2.28"` e la riga di istanza nel bundle |
| 3D | **three.js r141**: `GLTFLoader` + `DRACOLoader` presente, `RGBELoader` per l'HDR, `AmbientLight` 0.45, `ACESFilmicToneMapping` esposizione 1, `outputEncoding: sRGB`, `PerspectiveCamera(40)` sulla home e `(30)` sulla scheda prodotto | VERIFICATO | `REVISION="141"` e i nomi di classe nel bundle |
| modello 3D | `MANA_canettes__v5_WEBGL.gltf` — 2 mesh (`Cylinder.002/.003`), **armatura con 2 ossa e 2 animazioni** (`can_v2.001`, `ArmatureAction`), materiale `MANA_pamplemousse_2048` con base color + roughness/metal + normal | VERIFICATO | scaricato e letto il JSON del glTF |
| animazioni vettoriali | **Lottie-web**, 23 file JSON | VERIFICATO | `data-lottie_*` sul `<body>` e `Lottie.loadAnimation` nel bundle |
| carosello | **Swiper** (`slidesPerView: 2`, `loop: true`, modulo Navigation) | VERIFICATO | `new Swiper(".c-Collection__products", …)` |
| build | bundle unico Vite/Rollup (`global.js` 1,16 MB non minificato-mappato, tutte le librerie dentro) + `app.css` unico | SUPPOSTO | forma del bundle e naming `gsapWithCSS`; nessun sourcemap pubblico |
| abbonamenti | **Recharge** (`recharge-recurring-payments`, piani a 15 e 30 giorni, `-10%`) | VERIFICATO | blocco app nella scheda prodotto |
| traduzione | **Weglot** (`api_key=wg_[REDATTA]`, `hide_switcher=true`) sopra un negozio in francese | VERIFICATO | script nell'`<head>`, `Shopify.locale = "fr"` anche su `en.` |
| e-mail / popup | **EcomSend** | VERIFICATO | `window.EcomSendApps` nell'HTML |
| analytics | Google Tag Manager `GTM-T53PHSF`, Shopify Analytics/Trekkie, Facebook domain verification | VERIFICATO | nell'`<head>` |
| hosting / CDN | Shopify (`cdn.shopify.com`) | VERIFICATO | tutti gli URL degli asset |
| immagini | JPG/PNG serviti dal CDN Shopify con `_WxH_crop_center` e `srcset` `@2x`; **nessun WebP/AVIF** | VERIFICATO | attributi `src`/`srcset` nell'HTML |
| font | woff2 + woff auto-ospitati sul CDN Shopify, `font-display: swap` | VERIFICATO | `@font-face` inline nell'`<head>` |

## Peso e prestazioni

Non ho potuto girare Lighthouse (l'API PageSpeed Insights ha risposto *"Quota exceeded for quota metric 'Queries'"*), quindi **non ho punteggi né tempi reali**. Ho invece **misurato con `curl` i byte effettivamente trasferiti** (compressione attiva) di ogni risorsa che il codice richiede sulla home:

| risorsa | trasferiti |
|---|---|
| HTML home | 45 KB (166 KB non compressi) |
| `app.css` | 12,5 KB (65 KB non compressi) |
| `global.js` | **303 KB** (1,16 MB non compressi) |
| 23 file Lottie JSON | **246 KB** (il più pesante, `lottie_hibi_3.json`, da solo 83 KB) |
| `MANA_canettes__v5_WEBGL.gltf` + `.bin` | 16 KB + **720 KB** |
| texture lattina Grapefruit (color + roughness/metal + normal) | 413 + 438 + 6 KB |
| texture altri 3 gusti (PNG) | 417 + 410 + 513 KB |
| ambiente `MANA_hdr.hdr` | **435 KB** |
| 4 sfondi illustrati `fond1-4.png` | 530 KB |
| `woman.svg` | 38 KB (un SVG solo) |
| font woff2 (Book) | 31 KB |

**Totale delle risorse proprie del tema: circa 4,5 MB**, di cui **~3,4 MB solo per il livello 3D** (bin + 5 texture + HDR). Vanno poi aggiunte le foto prodotto, Shopify, GTM, Recharge, Weglot, EcomSend.

Scelte di prestazione che si vedono nel codice:
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`: niente rendering a 3x sui telefoni.
- I Lottie sono **caricati con `autoplay: false`** e messi in play/pausa da ScrollTrigger a ogni sezione: fuori schermo non gira niente.
- All'ingresso della ruota delle carte, gli 8 Lottie dell'hero vengono messi in pausa uno per uno.
- Un `ScrollTrigger` su `.offCanvas` toglie il ticker GSAP dell'animazione 3D e aggiunge `display: none` al canvas quando l'hero è passato.
- `kill()` su ogni classe di pagina fa `renderer.dispose()` + `forceContextLoss()` e uccide tutti gli ScrollTrigger: il router AJAX non lascia contesti WebGL orfani.
- `history.scrollRestoration = "manual"`.
- Nessun WebP, nessun `loading="lazy"` sulle immagini dell'hero (c'è solo sulle miniature del menù e su Instagram).

Voto Awwwards nella colonna che pesa qui: **usability 7.61** — il più basso dei cinque. Con 4 schermate di hero prima di poter comprare, e ~4,5 MB, si capisce perché.

## Tre cose da rubare

1. **Un attributo sul `<body>` che ripinta il sito intero.** `data-boisson="pamplemousse|mure-et-hibiscus|punch-tropical|melon-et-menthe"` e quattro righe di CSS ripintano insieme fondo dell'hero, pulsante "aggiungi al carrello" e carte dei benefici, con `transition-delay: .3s` calibrato per cadere a metà rotazione della lattina. Costo: dieci righe di CSS. Effetto: il sito **indossa il prodotto scelto**. Su un cliente con 4 varianti (colori, finiture, gusti) si rifà tale e quale in mezza giornata.

2. **Un solo asset 3D riusato ovunque, e mai come scenografia.** La stessa `canGeometry` compare sulla home (rotazione legata allo scroll), sulla scheda prodotto (rotazione al cambio di variante) e sulla 404 (texture che cambia ogni 600 ms). Un modello, una `.bin`, texture scambiate a runtime (`material.map = textureX`). Non è un configuratore: è **la foto di prodotto che si muove**. E ha `kill()` con `renderer.dispose()` + `forceContextLoss()` a ogni cambio pagina — la parte che quasi nessuno scrive.

3. **Un gioco nel piede che costa cinque Lottie e una `gsap.timeline({repeat: -1})`.** Nessun motore fisico, nessun canvas: cinque JSON che si scambiano con `classList`, un oggetto che traversa lo schermo in 3,5 s, `Math.random() >= .7` per decidere se è premio o ostacolo, e due parole di feedback (`boost` / `ark…`) che sono già lì nel DOM. Il piede è la parte di pagina che tutti scrollano e nessuno guarda: qui è il pezzo che la gente racconta. Meccanica rifacibile in un giorno, e non tocca il resto del sito.

## Non verificato

- **Prestazioni reali**: nessun punteggio Lighthouse, nessun LCP/CLS/TBT/FCP, nessun conteggio di richieste reale. L'API PageSpeed Insights ha risposto "Quota exceeded". I 4,5 MB sono una **somma di misure `curl`** delle risorse che il codice richiede, non una waterfall di browser: alcune (le texture degli altri gusti) potrebbero essere caricate in differita o mai, se l'utente non cambia gusto.
- **Il comportamento dinamico non l'ho visto**: per la regola sul browser condiviso non ho aperto una scheda. Tutte le animazioni sopra sono **lette nel codice sorgente** di `global.js` e `app.css`, non osservate. Curve, durate e distanze sono quelle scritte nel bundle; l'effetto percepito potrebbe differire.
- **Il colore esatto in cui appaiono le lettere arcobaleno** dipende dall'ordine dei `setTimeout` e dal frame rate: l'ho ricostruito dal codice, non misurato a schermo.
- **Se il DRACOLoader sia davvero usato**: la classe è nel bundle ma il `.bin` è un buffer glTF standard non compresso. Probabilmente è codice morto incluso dal bundler.
- **Il layout preciso della scheda prodotto sotto il fold** (tabella nutrizionale, ingredienti, ruota carte prodotto): ho letto i testi ma non ho mappato animazioni e griglia con la stessa precisione della home.
- **Quale sia il valore reale di "Only x left!"**: nell'HTML statico è letteralmente `<span>x</span>`, riempito da JS al cambio variante. Non so se sia scarsità vera o un contatore decorativo.
- **La versione premiata**: ho confrontato struttura e nome del tema con la copia Wayback del 15/03/2023 e coincidono, ma non ho confrontato il CSS e il JS riga per riga. Cambiamenti minori tra la versione votata e quella di oggi sono possibili (il gusto Melon & Mint e alcune foto sono del 2024).
- **Il traffico e le vendite**: nessun dato. Non so se il sito converta.
