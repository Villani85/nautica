# basement.studio

- **URL**: https://basement.studio
- **Premio**: Awwwards Site of the Day + Developer Award, 25/04/2025 — punteggio 7.42/10 (dev 7.61, responsive 8.0, animations 7.8; pro community 8.54). Fonte: https://www.awwwards.com/sites/basement-studio-3
- **Studio**: basement.studio — Mar del Plata, Argentina, fondato 2020 (sede 500 m², sito autoprodotto)
- **Anno**: 2025 (repo `website-2k25`), tuttora in sviluppo attivo — ultimo commit **12/08/2026**
- **Letto il**: 13/08/2026

> **NOTA SULLA FONTE — questa scheda e' quasi tutta VERIFICATA sul codice sorgente.**
> Lo studio pubblica il sito su GitHub: https://github.com/basementstudio/website-2k25
> (252 star, 803 commit, MIT-less ma pubblico). Ho clonato il repo all'HEAD del
> 12/08/2026 e le righe qui sotto marcate VERIFICATO vengono da li', non da
> ispezione visiva. In piu' lo studio ha scritto l'articolo tecnico su come e'
> fatto: https://basement.studio/post/new-digital-hq-pt-1 (20/05/2025).
> Il sito e' raggiungibile (HTTP 200), nessuna sostituzione necessaria.

---

## L'ESPERIENZA (integrazione)

*Blocco aggiunto il 13/08/2026 rileggendo il sito con `curl`: HTML della home,
pagina `/contact` (modulo completo) e il gemello testuale `/ai`, che è la fonte
più pulita che esista per i contenuti di questo studio. Integra — non
sostituisce — le sezioni sotto.*

### Di cosa tratta il sito

Di **uno studio raccontato attraverso il posto in cui lavora**. La home è
l'ufficio vero di Mar del Plata ricostruito in 3D: parete-libreria, scala con una
persona seduta e un cane, cabinato arcade arancione, canestro col tabellone
`BASEMENT`, insegna al neon, pila di televisori a tubo catodico accesi. Sotto e
attorno a quella scena c'è un sito di agenzia del tutto normale: titolo,
sommario, loghi clienti, quattro casi, quattro servizi, contatti. E accanto c'è
**un secondo sito**, `/ai`, che è lo stesso contenuto in testo semplice a fosfori
ambra, dichiaratamente per le macchine.

### Cosa vende, e qual è l'obiettivo finale

Vende **progetti a commessa**: siti, identità visive, esperienze 3D, esecuzione
marketing, per aziende tech americane. La lista clienti reale, testuale dal
mirror `/ai`, è più lunga e più impressionante di quella mostrata in home:

> `Vercel, Next.js, Linear, Cursor, Scale, World Labs, Eleven Labs, Mintlify, Harvey, Baseten, Together.ai, Black Forest Labs, Profound, Rox, Factory, Until Labs, Speakeasy, Xbow, Krea, Apollo GraphQL, Cal.com, Trunk, Replicate, Graphite, Spiral, Applied Compute, Solana, Flox, MrBeast, Daylight Computer Company, EDGLRD, KidSuper Studios`

**Obiettivo dichiarato**: `We make cool shit that performs.`
**Obiettivo vero**: far arrivare una richiesta di progetto a
`sales@basement.studio`, tramite il modulo `/contact`. Tutta la home è costruita
per portare lì: `Contact Us` è **l'unica voce di menu evidenziata**, è presente
dal primo mezzo secondo, e la sezione finale della pagina si chiama `Contact` e
dice `Let's make an impact together.`

**Due obiettivi secondari, entrambi verificati e non nascosti**:
- **Reclutamento**: `/ai` pubblica una sezione `OPEN_POSITIONS` con
  `Visual Designer (Design, Argentina (Remote))` e
  `Frontend Developer (Development, Remote)`.
- **Investimenti**: `Basement Ventures — An early-stage venture studio incubating
  and investing in disruptive companies at their earliest stages. Get More Info →`

E un obiettivo di posizionamento che vale quanto una vendita: il mirror `/ai`
dichiara *`basement.studio is the team behind the Geist typeface, designed in
partnership with Vercel and used across the Next.js ecosystem`* — e il sito è
composto in Geist. **Il carattere che stai leggendo è un loro lavoro**: prova e
prodotto nello stesso oggetto.

### A chi

Al **VP marketing o al founder di una startup tech finanziata**, quasi sempre in
Bay Area, che ha budget e sta scegliendo fra tre agenzie. Sa già cosa vuole
(un sito che converta e non si pianti al lancio); teme di pagare uno studio che
fa bei render e consegna un sito lento. Deve uscire pensando: *non me l'hanno
raccontato, me l'hanno fatto vedere addosso — e i miei concorrenti diretti
(Vercel, Cursor, Linear) lavorano già con loro.*

### L'esperienza progettata, passo per passo

1. **Nero, e subito il menu.** A 0,3–1,5 s ci sono solo due elementi HTML:
   la navbar (`basement.` · Home · Services · Showcase ⁽²⁵⁾ · People · Blog ⁽²⁸⁾ ·
   Lab · **Contact Us**) e la pillola `HUMAN | MACHINE` in basso. Il resto è nero.
   **I conteggi fra parentesi sono già una prova**: 25 casi, 28 articoli.
2. **La stanza si sviluppa come una fotografia.** Mentre carica, un canvas in un
   Web Worker disegna lo stesso ufficio in wireframe; poi i pixel si accendono in
   ordine di luminosità. A ~10–12 s l'ufficio è acceso e il mouse muove la camera.
3. **Si gioca prima di leggere.** Non c'è un menu da usare: **si clicca dentro la
   stanza**. Gli oggetti si possono ispezionare, il canestro si può giocare, il
   cabinato fa girare Doom vero. Lo studio racconta di aver provato prima il menu
   e di averlo scartato perché *"felt too slow"*.
4. **Poi comincia il sito normale.** Scorrendo, sotto la scena, arriva il titolo,
   il sommario, i loghi clienti, i quattro casi in evidenza, i quattro servizi.
5. **Contatto.** In fondo `Let's make an impact together.` e
   `hello@basement.studio`, più la newsletter (`Ready to tap into the basement
   vibe? … Roll Me In`).
6. **La scorciatoia per chi non ha pazienza**: la pillola `HUMAN | MACHINE` porta
   allo stesso sito in testo puro.

**Cosa deve fare il visitatore**: muovere il mouse (scopre che la stanza è viva) →
cliccare qualcosa nella stanza (scopre che è un'interfaccia) → scorrere (scopre
che sono un'agenzia seria) → cliccare `Contact Us`.

**Immagine che resta**: un ufficio in penombra stile PlayStation 2 in cui si
cammina con la telecamera, con l'insegna al neon `basement.`

### Il percorso di contatto, per intero

Rotta `/contact` (senza canvas 3D). Il modulo ha **cinque campi**, tutti in
maiuscolo composto a **56 px** — la dimensione di un titolo, non di un form:

| campo | tipo | segnaposto |
|---|---|---|
| `name` | testo | `Name` |
| `company` | testo | `Company` |
| `email` | email | `Email` |
| `budget` | testo libero | **`Budget (optional)`** |
| `message` | area di testo (min 280 px) | `Message` |

Pulsante: `Submit Message`. Accanto, l'indirizzo `hello@basement.studio` scritto
grande. Il mirror `/ai` distingue i due canali:
`customer support → hello@basement.studio` · `sales → sales@basement.studio`.

**Il campo budget è di testo libero ed è opzionale**: è la scelta opposta a
quella di darkroom.engineering, che il budget lo impone a fasce. Basement
preferisce non filtrare in ingresso.

### Come è organizzata la persuasione

| cosa | dove sta | a quale schermata |
|---|---|---|
| Prova (prima ancora della promessa) | i conteggi in navbar `Showcase (25)`, `Blog (28)` e la stanza 3D che gira liscia | 0 — è la prima cosa a schermo |
| Promessa | `A digital studio & branding powerhouse making cool shit that performs` | **2** (su desktop il canvas occupa la prima schermata intera) |
| Prova sociale | `Trusted by Visionaries` + griglia loghi | ~3 |
| Prova dettagliata | 4 casi con risultato dichiarato (`sold out inventory in hours`, `a storefront built for millions`) | ~4–6 |
| Offerta | i 4 servizi con i sotto-elenchi di attività | ~7 |
| Prezzo | **assente dal sito**. Compare solo come campo facoltativo nel modulo | — |
| Chiamata all'azione | `Contact Us` in navbar (sempre) + `Let's make an impact together.` in fondo | 0 e ~9 |

Sono ~7,9 schermate in tutto (`scrollHeight` 5273 px a 1600×900). La CTA è
raggiungibile **al secondo zero**, e questa è la differenza che conta.

### Cosa arriva a chi NON scorre fino in fondo

Arriva **il marchio e la porta d'ingresso, ma non la frase di vendita** — ed è un
difetto reale, non una scelta.

- **Arriva subito, in HTML puro, prima ancora del 3D**: il nome `basement.`, sette
  voci di menu, i due conteggi (25 casi, 28 articoli) e il pulsante `Contact Us`.
  Chi ha fretta ha già dove cliccare.
- **Non arriva il claim.** Su desktop il canvas è `fixed` e il contenuto parte a
  `mt-[100dvh]`: **l'h1 `A digital studio & branding powerhouse making cool shit
  that performs` sta interamente sotto la piega**. Chi non scorre non lo legge
  mai — lo trova solo nel titolo della scheda del browser
  (`basement.studio | We make cool shit that performs.`).
- **Su telefono va meglio**: lì il canvas è alto `80svh` e scorre via, quindi il
  titolo e il sommario arrivano quasi subito. **Il messaggio verbale è più veloce
  sul telefono che sul desktop.**
- **Chi non vuole scorrere affatto — o non è umano — ha una pagina apposta**:
  `/ai` restituisce in testo semplice chi sono, dove sono, i servizi, i clienti,
  i 25 casi, gli ultimi articoli, le posizioni aperte e i due indirizzi email.
  Più `llms.txt`, `agents.md`, `sitemap.md`, e **ogni pagina disponibile anche in
  markdown** aggiungendo `.md` all'URL. È la risposta esplicita al fatto che un
  sito-canvas è invisibile: invece di nasconderla, l'hanno messa in vetrina con
  la pillola `HUMAN | MACHINE`.

### I testi veri principali

> **Titolo**: `A digital studio & branding powerhouse making cool shit that performs`
> **Sommario**: `We partner with the world's most ambitious startups, scale-ups and brands to unlock their true potential and growth through the convergence of creativity, design, and technology.`
> **Occhiello clienti**: `Trusted by Visionaries`
> **Capacità**: `We're here to create the extraordinary.` / `No shortcuts, just bold, precision-engineered work that elevates the game & leaves a mark.`
> **Contatto**: `Let's make an impact together.` · `hello@basement.studio`
> **Newsletter**: `Ready to tap into the basement vibe? Sign up for our newsletter and stay plugged into all the cool stuff we're cooking up.` → `Roll Me In`
> **Pillola**: `HUMAN | MACHINE`
> **Piede**: `© basement.studio LLC 2026 all rights reserved`

Il resto dei testi (i quattro servizi, i quattro casi, People, la testata `/ai`)
è trascritto per intero nella sezione **Testi veri** più sotto.

---

## Cosa vende

Il lavoro di uno studio di design + ingegneria che fa siti, brand identity ed
esperienze 3D per aziende tech americane (Vercel, Cursor, ElevenLabs, Scale,
Harvey, Linear) e per creator (MrBeast, KidSuper). Il sito **e' il portfolio e
insieme la dimostrazione**: l'ufficio vero dello studio ricostruito in 3D e
navigabile.

## A chi

Al VP Marketing o al founder di una startup tech in Bay Area che ha budget e
deve scegliere un'agenzia. Deve uscire pensando: *questi non mi raccontano che
sanno fare 3D e performance, me lo hanno appena fatto vedere addosso*. Il
sottotesto e' il claim: "we make cool shit that **performs**" — non solo bello,
anche veloce.

## Idea regista

Il sito non e' una pagina che scorre: e' l'ufficio dello studio in 3D stile PS2,
e cambiare pagina significa **spostare la telecamera in un altro punto della
stanza**.

## Il momento

Il passaggio dal caricamento all'ufficio acceso, nei primi ~10 secondi.
Mentre carica, un **secondo canvas dentro un Web Worker** disegna lo stesso
ufficio in wireframe (main thread libero). Quando la scena vera e' pronta, la
rivelazione non e' un fade di opacita': nel fragment shader di postprocessing
i pixel si accendono **in ordine di luminosita'** — si campiona una versione
pixelata a 1/8 di risoluzione, se ne prende la luminanza e si scarta il pixel
finche' la sua luminanza sta sotto una soglia che scende con la curva
`reveal = (1 - uOpacity)^4`. Risultato: l'ufficio "si sviluppa" come una
fotografia, dalle luci verso le ombre. VERIFICATO in
`src/shaders/material-postprocessing/fragment.glsl`.

Il secondo momento e' la navigazione: **si clicca dentro la scena**, non nel
menu. Lo studio racconta di aver provato prima il menu e di averlo scartato
perche' "felt too slow", passando al point-and-click delle vecchie avventure
grafiche (fonte: articolo New Digital HQ).

## Struttura, sezione per sezione

Misure prese a viewport 1600x900 (contenuto 670px di altezza utile):
`document.body.scrollHeight` = **5273px**, cioe' ~7,9 schermate.

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |
|---|---|---|---|
| Canvas 3D (home) | L'ufficio: parete-libreria in legno, scala con una persona seduta e un cane, cabinato arcade arancione, canestro con tabellone "BASEMENT", insegna al neon `basement.`, pila di CRT con video, soppalco industriale, godray dall'alto | Muove il mouse (parallasse), clicca gli oggetti "inspectable", clicca le zone-hotspot per cambiare pagina | 1 schermata piena (su desktop il canvas e' `fixed` e il contenuto parte a `100dvh`) |
| Intro | `h1` + sottotitolo | legge | ~0,7 |
| Brands ("Trusted by Visionaries") | griglia loghi clienti | su desktop hover; su mobile i loghi si scambiano da soli | ~1 |
| Featured Projects | 4 casi: Vercel Ship, Daylight, KidSuper, Shop MrBeast | hover -> immagine/video, clicca per il caso | ~2,5 |
| Capabilities | 4 blocchi servizio con sotto-elenchi | accordion / lettura | ~1,5 |
| Contact | form; il 3D del telefono e' renderizzato su **un canvas separato in overlay** | compila | ~1 |
| Navbar (fissa) | Home / Services / Showcase (25) / People / Blog (28) / Lab + "Contact Us" | naviga | sempre |
| Pillola Human/Machine (fissa in basso) | commuta al gemello testuale `/ai` | clicca | sempre, sfuma vicino al footer |

Rotte con canvas 3D: `/`, `/services`, `/showcase`, `/people`, `/blog`, `/lab`,
`/basketball`, `/doom`, e la 404. Rotte "plain" senza canvas: `/contact`,
`/post/<slug>`. VERIFICATO: gruppi `(canvas)` e `(plain)` in
`src/app/(site)/`.

## L'esperienza in ordine di tempo

**Primi 10 secondi** (misurato una volta, desktop 1600x900, DPR 1.25, contesto
browser pulito, connessione domestica):

- **0,0 s** — HTML servito (33 KB brotli). Fondo nero pieno `#000000`.
- **0,3–1,5 s** — compaiono subito, in HTML, solo la navbar (`basement.` a
  sinistra, voci al centro, "Contact Us" a destra) e la pillola
  `HUMAN | MACHINE` in basso. Il resto e' nero: il canvas e' client-only
  (`dynamic(..., { ssr: false })`).
- **~3,4 s** — `DOMContentLoaded`.
- **1,5–6 s** — parte il **loading canvas nel Worker**: l'ufficio in wireframe.
  Il worker riceve via `postMessage` la camera aggiornata frame per frame, cosi'
  il wireframe e' inquadrato esattamente come sara' la scena vera.
- **~6,7 s** — `load`.
- **~7–12 s** — scaricati i GLB (office 2,3 MB + officeItems 3,3 MB +
  personaggi 1,0 MB), la scena si rivela con la dissolvenza per luminanza
  descritta sopra. Da qui il mouse muove la camera.

> Da qui in poi il tempo non conta piu': **niente parte da solo**. Non c'e'
> autoplay, non c'e' timeline. Tutto e' legato al puntatore, allo scroll o al
> click.

**Poi, a blocchi:**

- **Mouse fermo** — la scena resta viva lo stesso: personaggi istanziati,
  animali (`components/pets`), scintille (`sparkles`), i CRT che riproducono
  video, i godray. C'e' anche musica ambient (composta da uno sviluppatore
  dello studio) con un toggle in navbar.
- **Mouse che si muove** — parallasse della camera, con un vincolo: lo
  spostamento e' limitato dalla differenza fra due piani virtuali (uno "interno"
  e uno "di confine"), quindi la camera non esce mai dall'inquadratura buona.
- **Scroll (solo desktop)** — la camera scende/sale in Y dal valore di partenza
  a `targetScrollY`, esaurendo il movimento in **esattamente una schermata**
  (`Math.min(1, scrollY / innerHeight)`). Oltre, il contenuto HTML continua a
  scorrere sopra il canvas fermo.
- **Click su una zona della stanza** — transizione di camera di **1 s** con
  `easeInOutCubic`, e in contemporanea il contenuto HTML viene "spazzato" da una
  maschera CSS a 15 fotogrammi.
- **Click su un oggetto inspectable** — l'oggetto si stacca e viene mostrato da
  vicino; la parallasse del mouse si azzera (`if (!selected && ...)`).
- **404** — c'e' una scena dedicata e il ritorno alla home dura **4 secondi**
  invece di 1 (`ANIMATION_DURATION_FROM_404 = 4`).

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| Camera, cambio pagina | position + target + **fov** insieme | stato (rotta) | `easeInOutCubic`, 1000 ms (`ANIMATION_DURATION = 1`) | `lerpVectors` su posizione e target, interpolazione lineare sul fov. VERIFICATO `camera-hooks.tsx` |
| Camera, ritorno da 404 | idem | stato | stessa curva, **4000 ms** | rallentata apposta |
| Camera, parallasse mouse | slitta lateralmente + ruota | puntatore | `maath` `easing.damp3`, **due costanti diverse**: 0,5 s sulla posizione e 0,25 s sul target | il target e' anche diviso per un divisore responsive (0,32 sotto i 1100px → 0,8 sopra i 1600px): la camera **scivola piu' di quanto giri** |
| Camera, scroll | discesa in Y | scroll, primo `100vh` | lineare clampata | disattivata sotto 1024px |
| Contenuto HTML, cambio pagina | wipe a fotogrammi | stato | `steps(15)` su `mask-position`, 750 ms | maschera CSS, vedi sotto |
| Godray | opacita' 0↔1 | rotta (`GR_Home` su home, `GR_About` su services) | `motion` `animate`, 500 ms `easeInOut` | `depthWrite:false`, `renderOrder:2` |
| Cursore custom | segue il puntatore | puntatore | `motion` `useSpring` **damping 50, stiffness 500**, offset 16px | puo' contenere testo, e se il testo e' lungo diventa un marquee a 7 s lineare infinito |
| Oggetto inspectable | avvicinamento | click | `spring` stiffness 100, damping 20, restDelta 0.001 | `constants/inspectables.ts` |
| Link "actionable" | il colore pulsa e poi si posa | hover | keyframe `actionable-blink` a tappe 20/40/60/80/100%, 300 ms lineare, delay = durata/5 | non un fade: un **lampeggio a scatti**, coerente col retro. `color-mix()` su `currentColor` |
| Loghi clienti (mobile) | due set che si scambiano | tempo | `cubic-bezier(0.4,0,0.6,1)`, ciclo **16 s**, delay pseudo-casuale per cella (`(pos*23+17)%31`) | i due keyframe `fade-in-out` / `fade-out-in` sono complementari |
| Pannelli accordion | altezza | stato | 200 ms `ease-out` | Radix |
| Toast/slide | `translateY(100%)`→0 | stato | 400 ms `cubic-bezier(0.16, 1, 0.3, 1)` | |

**Librerie riconosciute (VERIFICATO da `package.json`):** l'animazione DOM e'
**Motion** (`motion` ^12.42, ex Framer Motion), **non GSAP** — nonostante lo
studio dichiari GSAP fra le competenze. Lo smoothing 3D e' **maath**
(`easing.damp3`). Nessun Lenis, nessun ScrollTrigger, nessun locomotive: lo
scroll e' quello nativo del browser.

### La transizione fra pagine, per esteso (la cosa piu' rubabile del sito)

Non e' JavaScript per fotogramma. E' **una maschera CSS**: uno sprite SVG
5120x320 con 16 riquadri, inline come `data:` URI, applicato con
`mask-image` e animato spostando `mask-position` con `steps(15)`.

```css
.layout-container {
  --mask-in: url(<sprite SVG 16 frame, data URI>);
  --mask-frames: 15;
  --mask-speed: 0.75;              /* -> 750 ms */
  --size: 100vw;
  mask-repeat: repeat-y;
  mask-size: calc((var(--mask-frames) + 1) * var(--size)) var(--size);
  mask-position: var(--position, 100%) 0%;
}
[data-flip="true"] .layout-container {
  mask-image: var(--mask-in);
  --position: 0%;
  transition:
    mask-position var(--speed) steps(var(--mask-frames)),
    transform     var(--speed) steps(var(--mask-frames));
}
[data-disabled="true"] .layout-container { mask-image: none; }
```

Il JS fa solo tre cose: `dataset.disabled="false"`, `dataset.flip="true"`, e
dopo 1000 ms rimette `disabled="true"`. **E si autoesclude sotto i 1024px**
(`if (window.innerWidth >= 1024 && !fromMobileNav)`). VERIFICATO in
`src/components/transitions/transitions.css` e `hooks/use-handle-navigation.ts`.

## Colori

Presi dai **token sorgente** (`tailwind.config.ts`), quindi esatti, non stimati.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| Fondo | `#000000` (`brand-k`) | fondo pagina e fondo canvas |
| Testo primario | `#E6E6E6` (`brand-w1`) | titoli, corpo, logo |
| Testo secondario | `#C4C4C4` (`brand-w2`) | testi attenuati, bordi a 20% opacita' |
| Grigio etichette | `#757575` (`brand-g1`) | occhielli tipo "Trusted by Visionaries" |
| Bordi / superfici | `#2E2E2E` (`brand-g2`) | bordo della pillola Human/Machine, divisori |
| **Accento** | `#FF4D00` (`brand-o`) | voce di menu attiva, hover, focus ring, cabinato arcade |
| Accento 2 | `#FF2B00` (`brand-o2`) | variante |
| Rosso | `#E60002` (`brand-r`) | stati d'errore |
| Rosso chiaro | `#FF4D4D` (`brand-r2`) | stati d'errore |
| Giallo | `#FFCD1A` (`brand-y`) | segnalazioni |
| Verde | `#00FF9B` (`brand-g`) | stato positivo |

**Palette "machine"** — la vista `/ai` ha una tavolozza propria, dichiarata nel
codice come *"orange phosphor palette, CRT look"*:

| ruolo | esadecimale |
|---|---|
| fondo | `#000000` |
| fosforo chiaro | `#FF9C71` |
| fosforo base | `#FF4D00` |
| fosforo spento | `#993000` |

**Blocchi di codice**: `#FF4D00`, `#FF9C71`, `#EBBA9F` su fondo `#0A0A0A`.

Nota onesta: questi sono i colori **dell'interfaccia**. I colori dell'ufficio 3D
(legni, penombra) non stanno nei token — vengono dalle texture e dalle lightmap
cotte in Blender, quindi non sono leggibili dal CSS.

## Tipografia

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| `f-h0` | Geist Sans | 600 | 6,125rem (98px) | 5,5rem | tracking `-0.04em` |
| `f-h0` mobile | Geist Sans | 600 | 2,875rem (46px) | 2,45rem | `-0.04em` |
| `h1` home (desktop reale) | Geist Sans | 600 | **5,4375rem (87px)** | 4,875rem | classe esplicita nel componente Intro; sale a `f-h0` solo oltre 1920px (`3xl`) |
| `f-h1` | Geist Sans | 600 | 4,75rem | 4,25rem | `-0.04em` |
| `f-h2` | Geist Sans | 600 | 2,375rem | 2,25rem | `-0.04em` |
| `f-h3` | Geist Sans | 600 | 1,5rem | 1,5rem | `-0.03em` |
| `f-h4` | Geist Sans | 600 | 1,25rem | 1,25rem | `-0.02em`; e' il corpo del sommario home |
| `f-p` | Geist Sans | **600** | 0,8125rem (13px) | 1rem | tracking 0 |
| `f-p` mobile | Geist Sans | 600 | 0,75rem (12px) | 1rem | |
| `blog` | Geist Sans | 500 | 1rem | 1,5rem | l'unico livello sotto il 600 |

Due cose da notare:
1. **Non c'e' un peso "regular"**. Tutta l'interfaccia sta a **600**, compreso il
   testo da 12–13px. E' quello che da' il tono compatto e "da terminale".
2. **Ogni livello ha un gemello `-mobile` esplicito**, non un `clamp()`. La
   scelta e' dichiarata a mano, non fluida.

**Come sono serviti i font** (VERIFICATO, `src/app/layout.tsx`):
- **Geist Sans** e **Geist Mono** via `next/font/google` (self-hosted da Next,
  subset `latin`, variabili CSS `--font-geist-sans` / `--font-geist-mono`).
  Geist e' il carattere che **lo studio stesso ha disegnato per Vercel** — usarlo
  qui e' anche un argomento di vendita.
- **Flauta** — font locale, `public/fonts/flauta.ttf` (132 KB in totale la
  cartella font), via `next/font/local`, variabile `--font-flauta`. E' un
  bitmap/pixel font (nel repo c'e' anche `ffflauta.json`), usato per il registro
  arcade / Lab.
- Un commento nel codice ammette un limite non risolto:
  `// TODO: find a way to load font-feature-settings`.

## Testi veri

**Titolo (h1, home)**
> A digital studio & branding powerhouse making cool shit that performs

**Sommario**
> We partner with the world's most ambitious startups, scale-ups and brands to unlock their true potential and growth through the convergence of creativity, design, and technology.

**Claim / title del documento**
> basement.studio | We make cool shit that performs.

**Meta description**
> basement.studio is a digital studio crafting brands, websites, 3D experiences, and products. We design and engineer cool shit that actually performs.

**Voci di menu**
> Home · Services · Showcase ⁽²⁵⁾ · People · Blog ⁽²⁸⁾ · Lab · Contact Us

(gli apici sono i conteggi reali degli elementi, mostrati come esponenti)

**Pillola in basso**
> HUMAN | MACHINE

**Occhiello sezione clienti**
> Trusted by Visionaries

**Intestazione capacita'**
> We're here to create the extraordinary.
> No shortcuts, just bold, precision-engineered work that elevates the game & leaves a mark.

**I quattro servizi, testuali**
> **Websites & Features** — From pre-launch landing pages to complete website redesigns, we create next-generation digital experiences that capture attention and inspire action.
> *Product Strategy · UX/UI Design · Engineering · 3D & Motion Design*
>
> **Visual Branding** — From lean identities for early startups to comprehensive brand platforms for industry leaders, we craft scalable brand systems that are impossible to ignore.
> *Visual Identity · Branding Systems*
>
> **IRL Experience Design** — From annual summits to local meetups, we design unforgettable in-real-life events, creating moments that engage audiences and build brand love.
> *Visual Identity · Space Design · Keynote Design · Digital & Interactive*
>
> **Marketing Execution** — From brand to product marketing, we collaborate with marketing teams to create assets that drive awareness, demand, and conversions.
> *Omni-channel Campaign Content · Growth Experiments · Sales Materials*

**I quattro casi in evidenza**
> **Vercel Ship** — Partnering with Vercel means pushing the limits of performance and innovation. Together, we craft a digital ecosystem built for speed, precision, and impact.
> **Daylight** — A bold vision needs a strong launch. We crafted a high-performance, story-driven website that cut through the noise, connected with Daylight's audience, and sold out inventory in hours.
> **KidSuper** — By blending crafted visuals with digital experiences, we helped KidSuper elevate their brand into a dynamic showcase—bridging art, technology, and culture in a way that captivates and inspires.
> **Shop MrBeast** — The world's biggest YouTuber needed a storefront built for millions—high-performance, wildly engaging, and as dynamic as a MrBeast video.

**Ventures**
> **Basement Ventures** — An early-stage venture studio incubating and investing in disruptive companies at their earliest stages. Get More Info →

**People**
> We're creating a space where creatives truly belong. Where arts and crafts are part of everyday life, and where enthusiasts can create without limits. By merging content and technology, we're pushing the boundaries of what's possible to shape the future of the web.
> We keep it fresh, collaborative, and never too serious (except when it matters). Big ideas, sharp execution, and a team that's always striving for more. That's how we do it.

**Menu contestuale sul logo** (tasto destro)
> Copy logo as SVG → "Copied!"

**Contatti / piede**
> hello@basement.studio (generale) · sales@basement.studio (nuovi progetti)
> © 2026 basement.studio
> x.com/basementstudio · instagram.com/basementdotstudio · github.com/basementstudio · linkedin.com/company/basementstudio

**Testata della vista `/ai`** (ASCII art "BSMNT" + queste righe)
> basement.studio :: machine-readable index
> \# plain-text mirror of basement.studio for AI agents, crawlers, and humans who prefer it raw.
> \# every page also serves markdown: append .md to a URL, or request it with Accept: text/markdown
> /* EOF */

## Mobile

**La sezione piu' importante: sul telefono il sito e' un altro sito.** Tutto
VERIFICATO leggendo i gate nel codice, non provato su un telefono fisico.

**COSA SPARISCE**
- **La camera che scende con lo scroll.** Il blocco che muove la Y e' dentro
  `if (!disableCameraTransition && isDesktop)` con
  `isDesktop = useMedia("(min-width: 1024px)")`. Sotto i 1024px la camera e'
  immobile sull'asse verticale.
- **La navigazione point-and-click dentro la scena.** Su dispositivi solo-touch
  il canvas riceve `!pointer-events-none`. La rilevazione e' esplicita e
  triplice: `hasTouchScreen && (pointer: coarse) && !(pointer: fine)` — cioe'
  un tablet con penna o un portatile touch **restano** interattivi, un telefono
  no. Unica eccezione: il minigioco del canestro.
- **La transizione a maschera fra le pagine** — esclusa da
  `window.innerWidth >= 1024`. Su mobile il cambio pagina e' secco.
- **La parallasse del mouse** — non c'e' puntatore, quindi non c'e'.
- **Il cursore custom** e tutti gli hover: la griglia showcase usa
  `useMedia("(hover: hover)")`, la sezione Awards ha cinque `if (!isDesktop) return`.

**COSA VIENE SOSTITUITO**
- **Il canvas cambia natura.** Da `lg:fixed lg:h-[100svh]` (fondale fisso a
  schermo pieno) a **`h-[80svh]` in flusso normale**: su mobile la scena 3D e'
  una fascia alta l'80% dello schermo in cima alla pagina, che **scorre via** e
  non torna. Da fondale diventa copertina.
- **Sparisce il `mt-[100dvh]`**: il margine che su desktop riserva la prima
  schermata al canvas e' `lg:mt-[100dvh]`, quindi su mobile il contenuto parte
  subito sotto la fascia.
- **I loghi clienti**: la versione desktop e' rimpiazzata da un componente
  diverso (`BrandsMobile`, che fa `if (isDesktop) return null`) — griglia
  3 colonne di riquadri quadrati con due set di loghi che si alternano da soli
  ogni 16 s. Da statico-con-hover a animato-da-solo.
- **Showcase**: compare un `<MobileInfo>` che su desktop non esiste — le
  informazioni che li' stavano nell'hover diventano testo stampato.
- **Scoreboard del canestro**: su mobile mostra una classifica ridotta, senza
  bandiera del paese e senza la dicitura "pts".
- **Navbar**: la barra orizzontale diventa un blocco `lg:hidden` con menu a
  pannello.

**COSA RESTA**
- La scena 3D **viene comunque renderizzata e scaricata per intero** (stessi
  GLB, stesso shader). Non c'e' un fallback a immagine. E' guardabile ma non
  toccabile.
- Tutta la tipografia, con i gemelli `-mobile` gia' predisposti in configurazione.
- La pillola Human/Machine.
- Il contenuto HTML e i testi, identici.

**Riassunto in una riga**: su desktop il 3D e' **l'interfaccia**; su mobile e'
**un video di copertina** che scorre via, e il sito diventa una normale pagina
verticale.

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| Framework | **Next.js 16.3.0**, React 19.2.7, App Router, Cache Components + **Turbopack** | VERIFICATO | `package.json` + i chunk `/_next/static/immutable/chunks/turbopack-*.js` nell'HTML servito |
| Linguaggio | TypeScript 5.8, Node 24 | VERIFICATO | `package.json` `engines` |
| Stile | **Tailwind 3.4** + PostCSS (import, nesting), `tailwind-merge`, `clsx` | VERIFICATO | `tailwind.config.ts` |
| Animazione DOM | **Motion 12.42** (`motion/react`) — *non GSAP* | VERIFICATO | import in tutti i componenti |
| Smoothing 3D | **maath** `easing.damp3` | VERIFICATO | `camera-hooks.tsx` |
| Scroll | **nativo del browser**. Nessun Lenis / ScrollTrigger / Locomotive | VERIFICATO | assenti da `package.json`; lo scroll si legge da `window.scrollY` |
| 3D | **three 0.180** + `@react-three/fiber` 9 + `drei` 10 + `three-stdlib` | VERIFICATO | `package.json` |
| 3D, extra | `@react-three/offscreen` (canvas nel Worker), `@react-three/rapier` (fisica, solo canestro), `@react-three/uikit`, `meshline`, `leva` + `r3f-perf` (debug) | VERIFICATO | `package.json` + `components/scene/index.tsx` |
| Shader | **9 material GLSL scritti a mano** in `src/shaders/`: global-shader, postprocessing, characters, flow, net, not-found, screen, solid-reveal, steam. Prettier plugin per GLSL | VERIFICATO | albero del repo |
| Texture 3D | **KTX2 / Basis ETC1S**, transcoder servito da `/basis-transcoder` | VERIFICATO | cartella in `public/` + articolo dello studio |
| Illuminazione | **lightmap + ambient occlusion cotte in texture**, zero luci real-time | VERIFICATO | uniform `lightMap`/`aoMap`/`lampLightmap` nel global shader + articolo |
| Personaggi | volti scansionati, un'unica mesh con **morph target**, e una implementazione **custom di instanced skinned mesh** (Three.js non ce l'ha) | VERIFICATO | `components/characters/instanced-skinned-mesh` + articolo |
| Stato | **Zustand 5** (navigation-store, arcade-store, minigame-store, app-loading-store), `tunnel-rat` per portare React dentro/fuori dal canvas | VERIFICATO | `src/store/`, `components/tunnel` |
| UI | **Radix** (accordion, checkbox, select, tabs, tooltip), `@phosphor-icons/react` | VERIFICATO | `package.json` |
| Form | `react-hook-form` + `@hookform/resolvers`; newsletter via Mailchimp | VERIFICATO | `package.json` |
| CMS | **Sanity 5** (`next-sanity` 13, `@sanity/image-url`, plugin media, Visual Editing, studio su `/studio`). Ci vivono i modelli 3D, **le configurazioni di camera per rotta** e gli oggetti inspectable | VERIFICATO | `sanity.config.ts`, `useAssets().scenes`, commit "Sanity migration (#398)" |
| — nota CMS | L'articolo dello studio del 2025 dice **BaseHub**. **E' superato**: nel maggio 2026 sono migrati a Sanity | VERIFICATO | confronto articolo vs. cronologia commit |
| Video | **Mux** (`@mux/mux-video-react`, `sanity-plugin-mux-input`), con pausa automatica fuori schermo e mount pigro | VERIFICATO | `package.json` + commit "perf(video): tune Mux quality, auto-pause offscreen, lazy mount" |
| Database | **Supabase** (classifica del canestro) | VERIFICATO | `@supabase/supabase-js`, `api/scores` |
| Hosting | **Vercel** | VERIFICATO | `vercel.json`, `@vercel/functions`, `@vercel/analytics`, `@vercel/speed-insights` |
| Analytics | Vercel Analytics + Speed Insights, **PostHog** (anche `captureException`), **Ahrefs** (`analytics.ahrefs.com`, chiave `ulc2H83B54VgW4DK1z3uiw`) | VERIFICATO | `layout.tsx` + tag nell'HTML |
| Curiosita' | **js-dos + emulators** (DOSBox WASM) per far girare **Doom vero** in pagina; `@codesandbox/sandpack-react` e `shiki` per il codice nel Lab; **jQuery 3.7** presente (probabile requisito di js-dos) | VERIFICATO | `package.json`, `public/dos-programs/doom.jsdos` |
| Immagini | `next/image` su CDN Sanity (`cdn.sanity.io`), con `auto=format` | VERIFICATO | URL nei markdown |

## Peso e prestazioni

Numeri misurati il 13/08/2026 (HTTP diretto e Performance API; desktop
1600x900, DPR 1,25, contesto browser pulito).

**Trasferito sul filo**

| risorsa | brotli | non compresso |
|---|---|---|
| HTML della home | **33 KB** | 223 KB |
| 31 chunk JS referenziati nell'HTML | **890 KB** | 2,92 MB |
| `office.glb` | 2,29 MB | (binario, gia' compresso) |
| `officeItems.glb` | 3,33 MB | |
| `character-model.glb` | 0,97 MB | |
| **totale indicativo prima scena** | **~7,5 MB** | |

**Sul disco del repo** (non tutto viene caricato subito): `public/3d` 23 MB,
`public/emulators` 9,6 MB (DOSBox WASM 6,7 MB), `public/dos-programs` 5,3 MB
(doom.jsdos 5,5 MB), `public/images` 4,7 MB, font 132 KB.

**Tempi** (una sola misura, non una media)
- `DOMContentLoaded` **3,4 s**
- `load` **6,7 s**
- scena 3D visibile e interattiva **~10-12 s**
- `first-contentful-paint`: **non registrato** dalla Performance API (coerente
  con una prima schermata quasi interamente nera + canvas)

**Punteggi Awwwards** (giuria, 25/04/2025): totale 7,42 · development 7,61 ·
responsive 8,0 · animations 7,8 · pro community 8,54.

**Nota metodologica onesta**: `performance.getEntriesByType('resource')` sulla
pagina principale riporta solo **18 richieste / 0,5 MB**. Non e' il peso reale:
i GLB sono caricati **dentro il Worker**, la cui timeline non compare fra le
risorse del documento principale. Per questo ho misurato i modelli con richieste
HTTP dirette. Non ho potuto eseguire Lighthouse (vedi "Non verificato").

**Le scelte di prestazione, esplicite nel codice**

- `frameloop="demand"` sul `<Canvas>`: **non c'e' un ciclo di rendering
  continuo**, si disegna solo quando qualcosa lo richiede (`invalidate()`).
- `antialias: false`, `alpha: false`, `toneMapping: NoToneMapping` — l'AA si
  perde volutamente (fa parte del look PS2) e il tonemapping e' fatto a mano
  nello shader di postprocessing.
- Pausa automatica quando la scheda non e' visibile e durante lo scroll
  (`AnimationController`).
- **Il bloom gira solo su meta' dei pixel**: nel fragment shader il campionamento
  a disco di Vogel (24 campioni) e' racchiuso in
  `if (uBloomStrength > 0.001 && checkerPattern > 0.5 && uActiveBloom > 0.5)`,
  dove `checkerPattern` e' una scacchiera calcolata da `gl_FragCoord`. Costo del
  bloom dimezzato, e alla risoluzione bassa non si vede la differenza.
- Il ciclo di bloom usa `step()` invece di un `if` per la soglia di luminanza,
  con il commento *"Avoid conditional branching which can be costly on GPUs"*.
- Un solo passaggio di postprocessing fa tutto: tonemap ACES + gamma + contrasto
  + esposizione + luminosita' + vignettatura + bloom + rivelazione.
- Il canvas 3D e' **montato una volta sola nel layout radice** e sopravvive alle
  navigazioni client (`isCanvasInPage` "sticky"). Cambiare pagina non ricostruisce
  il contesto WebGL.
- Il passaggio Human↔Machine e' invece un **link normale, navigazione completa**,
  con un commento che spiega perche': l'albero WebGL non sopravvive a smontaggio
  e rimontaggio attraverso il confine di route group ("it comes back as a black
  screen"), mentre una navigazione vera lo recupera dal bfcache.
- `ErrorBoundary` attorno al canvas: se WebGL fallisce, il 3D viene rimosso,
  l'errore va a PostHog e **il sito HTML resta in piedi**.
- `@million/lint` in dipendenze (analisi di re-render React).

**Nota AEO/SEO — un intero secondo sito per le macchine.** Da giugno-agosto 2026
hanno costruito un livello parallelo: `/ai` (indice a fosfori ambra in HTML
puro), `/ai/blog`, `/ai/post/<slug>`, `llms.txt`, `agents.md`, `sitemap.md`, e
**ogni pagina servita anche in markdown** aggiungendo `.md` all'URL o con
`Accept: text/markdown`. Piu' JSON-LD Organization / WebSite /
ProfessionalService / Person / BreadcrumbList / JobPosting. E' la risposta
diretta al problema del sito 3D: un sito che e' un canvas e' invisibile ai
crawler, quindi ne hanno scritto un gemello testuale — e l'hanno messo in
vetrina con la pillola Human/Machine invece di nasconderlo.

## Tre cose da rubare

**1. La transizione fra pagine come sprite di maschera CSS animato a `steps()`.**
Uno sprite SVG con 16 riquadri di dithering, inline come data URI, applicato con
`mask-image`; si anima `mask-position` con
`transition: mask-position 0.75s steps(15)`. Il JavaScript tocca solo due
attributi `data-` sull'elemento `<html>`. Costo per fotogramma: zero (lo fa il
compositor). Si ottiene un wipe "a fotogrammi", che sembra fatto a mano e non
sembra affatto una dissolvenza CSS. Funziona su qualunque sito, anche senza 3D,
e si spegne con una media query. → `src/components/transitions/transitions.css`

**2. La navigazione come stati di camera, con la parallasse smorzata a due
velocita'.** Ogni rotta e' un oggetto
`{ position, target, fov, targetScrollY, offsetMultiplier }` (per giunta preso
dal CMS, quindi gli artisti 3D lo tarano da soli in browser senza toccare il
codice). Cambiare pagina = `lerpVectors` di posizione, target **e fov** insieme
per 1 s con `easeInOutCubic`. Sopra ci sta la parallasse del puntatore, ed e'
qui il trucco fine: due `damp3` con costanti diverse — **0,5 s sulla posizione,
0,25 s sul target** — piu' un divisore responsive sul target (0,32 → 0,8 a
seconda della larghezza). La camera **scivola piu' di quanto ruota**, ed e'
esattamente quello che evita il senso di nausea da parallasse. In piu' lo
spostamento e' vincolato dalla differenza fra due piani (uno a `width*0.4`, uno
a `width*0.6`), quindi non si esce mai dall'inquadratura buona.
→ `src/components/camera/camera-hooks.tsx`

**3. Il trio che rende sostenibile una scena 3D pesante.** Tre meccaniche
indipendenti, tutte rifacibili da sole:
 - `frameloop="demand"` invece del ciclo continuo, piu' pausa su scheda nascosta
   e durante lo scroll: la GPU sta ferma quando non serve;
 - **bloom a scacchiera** — il campionamento a disco di Vogel gira solo sui pixel
   dove `mod(floor(x/s) + floor(y/s), 2)` e' dispari: meta' del costo, differenza
   invisibile a bassa risoluzione;
 - **canvas di caricamento in un Web Worker** che disegna la stessa scena in
   wireframe ricevendo la camera via `postMessage`, cosi' il main thread resta
   libero mentre scarica 6 MB di GLB — e la rivelazione finale avviene per
   **soglia di luminanza** sul pixel (`reveal = (1-uOpacity)^4` confrontato con
   la luminanza di un campione a 1/8 di risoluzione), non per opacita': l'immagine
   "si sviluppa" invece di sfumare.
→ `components/scene/index.tsx`, `shaders/material-postprocessing/fragment.glsl`,
`components/loading/`

## Non verificato

- **Lighthouse / Core Web Vitals reali.** Il browser condiviso era conteso da
  altri agenti in parallelo (la scheda selezionata mi e' stata cambiata sotto due
  volte, una misura e' finita su un'altra pagina). Ho chiuso la mia scheda e ho
  ripiegato su misure HTTP dirette, che sono affidabili ma non danno LCP/CLS/TBT.
- **Il comportamento reale su un telefono fisico.** Tutta la sezione Mobile e'
  letta dai gate nel codice (`useMedia`, `lg:`, `pointer: coarse`), non
  osservata. In particolare non ho verificato quanto scorre la pagina su mobile
  ne' se la fascia 80svh regga il frame rate su un telefono di fascia media.
- **Il numero totale di richieste di rete a scena completa.** La Performance API
  del documento principale non vede il traffico del Worker; ho misurato i tre
  GLB principali ma non l'intero elenco di texture KTX2, audio e video Mux.
- **Se il deploy in produzione corrisponde esattamente all'HEAD del repo.** Gli
  hash dei chunk non sono confrontabili. Le date coincidono (ultimo commit
  12/08/2026, sito letto il 13/08/2026) e le funzionalita' viste dal vivo
  (pillola Human/Machine, `/ai`, conteggi in navbar) corrispondono a commit
  recenti, quindi la corrispondenza e' molto probabile ma non provata.
- **La musica e il toggle audio**: presenti nel codice (`MusicToggle`, 5 MB di
  mp3 in `public/3d/audio`), non ascoltati.
- **L'elenco degli oggetti inspectable e le posizioni di camera per rotta**: sono
  su Sanity, non nel repo. So che esistono e che forma hanno (`ICameraConfig`),
  non i valori.
- **Il minigioco del canestro, il Lab/arcade e Doom**: verificati come codice e
  come asset (DOSBox WASM, doom.jsdos), non giocati.
- **I colori dell'ambiente 3D**: non estraibili dal CSS perche' stanno nelle
  texture e nelle lightmap. Ho riportato solo i token dell'interfaccia, che sono
  esatti.
- **`ffflauta.json`** accanto a `flauta.ttf`: non ho verificato a cosa serva
  (probabile atlante bitmap per il testo dentro il canvas).
