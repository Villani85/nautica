# Cuberto

- **URL**: https://cuberto.com
- **Premio**: Awwwards Honorable Mention al sito dello studio (cuberto.com), 23/08/2024. Lo studio e' Awwwards Agency of the Year e ha 5 Site of the Day + 10 Honorable Mention + 4 Developer Award su progetti clienti (Kelvin Zero 2024, Magma 2023, Cuberto Hello 2023, Weltio 2022, Potion 2022, Flipaclip 2021). Fonte: https://www.awwwards.com/cuberto/ — ATTENZIONE: la home letta oggi e' una versione successiva a quella premiata (bundle `v=5.6.0b4`, `last-modified: Wed, 12 Aug 2026`, articoli di blog datati 8/11/2026).
- **Studio**: Cuberto (agenzia in-house, si e' fatta il sito da sola). Fondata nel 2010 dai fratelli Roman e Dmitri, 40+ persone. Fonte: https://cuberto.com/about/
- **Anno**: build corrente pubblicata il 12/08/2026 (header `last-modified`). Il sito esiste dal 2010, questa e' l'ennesima riscrittura.
- **Letto il**: 13/08/2026

**Metodo**: tutta la scheda e' ricavata dal sorgente scaricato (`curl`), non da rendering. Non ho aperto nessuna scheda di browser. HTML 153.543 byte, CSS interamente inline in un unico `<style>` di 79.654 byte, un solo JS `/assets/js/bundle.js?v=5.6.0b4` di 283.029 byte. Quindi colori, tempi, curve e breakpoint qui sotto sono letti nel codice, non stimati a occhio. Quello che manca e' solo cio' che si vede muovendosi davvero (vedi "Non verificato").

---

## L'ESPERIENZA (integrazione)

*Aggiunta del 13/08/2026. Letta con `curl` su `/` (home), `/services/`,
`/contacts/`, `/about/`, `/projects/qvino/`, `/blog/how-much-does-a-website-redesign-cost-in-2026/`
e `hello.cuberto.com`. Nessun browser aperto.*

### Di cosa tratta il sito

Un'agenzia che si presenta con **un solo documento lungo**: la home. Dentro ci
sono, in quest'ordine, chi sono, cosa fanno (5 servizi), per chi l'hanno fatto
(12 loghi), cosa hanno fatto (10 lavori), cosa dicono i clienti (5
testimonianze), perche' fidarsi (4 numeri), cosa scrivono (3 articoli), 8
obiezioni sciolte (FAQ), e un invito. Le altre pagine sono di servizio.

### Cosa vende, e qual e' l'obiettivo finale

Vende **progetti di rifacimento sito e di prodotto digitale su commessa, con
budget dichiarato all'ingresso.** L'obiettivo finale del sito e' uno solo, ed e'
scritto nel codice: portare a `/contacts/` e far compilare il modulo con la
fascia di budget selezionata. Tutto il resto della home lavora per quello.

L'obiettivo dichiarato ("mostrare il lavoro") e quello vero non coincidono. La
prova sta nei link: sulla home ci sono **tre soli link verso `/contacts/`**
(pulsante `Get in touch` nell'header, `Tell us about it` nel blocco finale, voce
di menu e di piede) e i cinque bottoni `Explore` della sezione servizi — quella
che sembra il cuore della pagina — **non sono link**: sono `<div class="cb-btn
cb-btn_more" style="visibility:hidden">`. Non portano da nessuna parte e a
riposo non si vedono nemmeno. La sezione servizi e' una **dimostrazione di
bravura**, non un percorso.

### A chi

A chi sta scrivendo o valutando una RFP di rifacimento sito e ha gia' un numero
in testa. Non e' una deduzione: i tre articoli del blog messi in home sono
`Website Redesign RFP: What Agencies Actually Need From You`, `Website Redesign
Process` e `How Much Does a Website Redesign Cost in 2026?`. Cuberto non aspetta
il compratore, **lo intercetta su Google mentre cerca il prezzo**.

### L'esperienza progettata, passo per passo

E' una **vetrina lunga con un banco di vendita in fondo**, e un secondo ingresso
laterale dal blog.

1. **Schermata 1** — H1 + sommario + showreel. Sai chi sono e cosa fanno. Il
   pulsante `Get in touch` e' gia' li', in alto a destra.
2. **Schermate 2-3** — "What we do": un paragrafo, nessun elenco puntato.
3. **Schermate 3-5** — i 5 servizi che si aprono sullo scroll. **Vicolo cieco
   voluto**: leggi e vai avanti.
4. **Schermata 6** — 12 loghi. Prima prova.
5. **Schermate 6-11** — "Selected work", 10 card. Le didascalie non dicono il
   nome del cliente, dicono **il risultato ottenuto** (`Modernizing the digital
   presence of a nationwide industry leader`). Clic = pagina progetto.
6. **Schermata 11** — 5 testimonianze. Seconda prova.
7. **Schermata 12** — "Why Cuberto": `15+`, `300+`, premi, in-house. Terza prova.
8. **Schermate 13-14** — 3 articoli (l'aggancio SEO, riesposto ai gia' arrivati).
9. **Schermate 14-16** — **8 domande di FAQ**, che sono l'unico punto della home
   in cui si parla di soldi, di CMS, di tempi e di modelli contrattuali.
10. **Schermata 16-17** — `Have an idea?` / `Tell us about it` -> `/contacts/`.

### Cosa deve fare il visitatore, e dove lo portano

Deve **compilare il modulo di `/contacts/`**, che e' il solo punto di
conversione del sito. Il modulo, per intero:

- Titolo: `Hey! Tell us all the things`
- `I'm interested in...` — 7 caselle: `Site from scratch`, `UX/UI design`,
  `Product design`, `Webflow site`, `Motion design`, `Branding`,
  `Mobile development`
- `Your name` (obbligatorio), `Email` (obbligatorio),
  `Tell us about your project` (textarea)
- **`Project budget (USD)`** — 5 pulsanti a scelta singola: `10-20k`, `30-40k`,
  `40-50k`, `50-100k`, `> 100k`. **Manca la fascia 20-30k**: e' un buco reale nel
  markup (`value="10-20k"` poi `value="30-40k"`), non una scelta commerciale
  leggibile.
- `Add attachment` (file multipli), `Send request` (disabilitato finche' il
  modulo non e' valido), reCAPTCHA.
- Conferma: `Thank you! / Thanks for inquiry! We'll contact you shortly!`
- Errore: `Oops.. / Something went wrong. Please check form data and try again
  or send email to us.`

**Non c'e' nessuna promessa di tempi** ("shortly"), nessun calendario, nessuna
chiamata prenotabile, nessun nome di persona. Si scrive a un'azienda.

### Come e' organizzata la persuasione

| pezzo | dove | in quante schermate |
|---|---|---|
| **promessa** | H1 + sommario | schermata 1 |
| **prova sociale** | 12 loghi | schermata 6 |
| **prova di lavoro** | 10 case con didascalia a risultato | schermate 6-11 |
| **prova di parola** | 5 testimonianze | schermata 11 |
| **prova di scala** | `15+ anni`, `300+ progetti`, premi, in-house | schermata 12 |
| **obiezioni** | 8 FAQ | schermate 14-16 |
| **prezzo** | **mai sulla home** | — |
| **chiamata all'azione** | header (schermata 1) e chiusura (schermata 16) | 1 e 16 |

**Il prezzo — dove sta davvero.** Cuberto e' l'unico dei cinque che pubblica
cifre, e le pubblica **fuori dalle pagine di vendita, dentro il blog**, dove
lavorano per la ricerca organica. In
`/blog/how-much-does-a-website-redesign-cost-in-2026/` c'e' una tabella
esplicita:

> `Focused visual refresh` — **$10,000–15,000**
> `Small custom marketing website` — **$15,000–20,000**
> `Complete corporate or SaaS redesign` — **$20,000–30,000**
> `Complex enterprise website` — **$30,000–50,000**
> `Large-scale digital platform` — **$50,000+**

con la clausola che le disinnesca: *"These ranges are intended as general
benchmarks rather than fixed packages"*, e la tesi che le giustifica: *"a website
redesign is not priced based on how many pages it contains. It's priced based on
the complexity of the problems it needs to solve."* La chiusura dell'articolo e'
un invito diverso da quello della home, e piu' facile da accettare:
`Send us your current website and tell us what is no longer working. We will help
define the right scope, team and budget for the project.`

Sulla home il prezzo esiste solo come **modello contrattuale**, nella FAQ
`Do you work on fixed-price projects or Time & Materials?` — *"Both pricing
models are available."*

**Cosa arriva a chi non scorre.** Nella prima schermata ci sono: chi sono
(`Digital design & development agency`), per chi (`for companies ready to move
beyond the ordinary`), il livello (lo showreel), e **come contattarli**. Non
c'e' nessuna prova: zero loghi, zero premi, zero numeri sopra la piega. Chi
guarda solo la prima schermata esce sapendo **cosa sono e che sanno fare
video**, non che hanno lavorato per IKEA e McDonald's. La prova comincia alla
sesta schermata.

### Come mostrano i casi studio

Male, rispetto al resto. `/projects/qvino/` e' fatto cosi': titolo, `The
challenge` (con un elenco di problemi di mercato), `Product overview`, blocchi
di funzionalita', una citazione di un utente-tipo (`Audience need`), `Next
project`. **Non c'e' un solo numero di risultato, non c'e' una citazione del
cliente vero, non ci sono i crediti, e — soprattutto — non c'e' nessun invito a
contattarli alla fine.** Chi finisce un caso studio puo' solo passare al
successivo o cadere nel piede. E' il punto piu' debole del sito: le didascalie
in home promettono risultati (`Modernizing the digital presence...`) e la pagina
poi non li dimostra.

### La pagina servizi

`/services/` esiste, e' nel menu, **ed e' vecchia e in contraddizione con la
home**. Elenca **3 soluzioni** (`Websites and platforms`, `Mobile applications`,
`Strategy and branding`) mentre la home ne elenca 5 e diverse; dice `With 12
years of experience` mentre la home dice `15+`; e ha un blocco `Benefits of
working with us` con quattro voci di tono commerciale d'altri tempi
(`Time zones ain't no thing`, `Impossible? We're on it`, `Flexible work terms`,
`Full spectrum of services`). E' l'unico posto del sito che nomina il modello
economico in chiaro: *"Just like we stick to a fixed budget, we stay within a set
Time and Materials framework."* Non ha CTA propria.

C'e' inoltre un **secondo sito di vendita**, `hello.cuberto.com`, linkato dal
piede come `Workflow`: `We create memorable websites`, `Est. 2010`, aree
servite (E-commerce, Finance, Education, Social, Entertainment, Medicine), stack
dichiarato (`Swift, Kotlin, Node, React`, `React.js, Next.js, Angular, Vue.js`).
E' la vecchia identita' commerciale, mai spenta.

### Testi veri (integrazione)

**Contatti**: `Hey! Tell us all the things` · `I'm interested in...` ·
`Project budget (USD)` · `Add attachment` · `Send request` ·
`Thanks for inquiry! We'll contact you shortly!`

**FAQ, risposta sui prezzi**: `Both pricing models are available. For projects
with a clearly defined scope, timeline and deliverables, a fixed-price model
provides predictable budgeting and milestones. For evolving products, startups or
long-term partnerships, Time & Materials offers greater flexibility.`

**Blog, apertura**: `Every week, we receive project inquiries that sound almost
the same: "We need to redesign our website. How much will it cost?"`

**Blog, chiusura**: `Send us your current website and tell us what is no longer
working. We will help define the right scope, team and budget for the project.`

**Servizi (pagina legacy)**: `Our services` · `Going beyond what's possible` ·
`Our solutions` · `Benefits of working with us`

---

## Cosa vende

Progettazione e sviluppo di prodotti digitali su commessa: app, siti marketing, identita' di marca e "creative development" (WebGL/GSAP). Il prodotto vero che vendono e' *la certezza che il risultato vinca premi e converta*, dimostrata mostrando lavori per Cisco, IKEA, McDonald's, Etihad, TradingView, Mapbox.

## A chi

Chi decide un budget di rifacimento sito o di prodotto: founder di startup/scale-up e marketing/product director di aziende grandi. Il target secondario e' esplicito nei testi e nella FAQ: chi sta scrivendo una RFP di redesign e cerca "quanto costa". Uscendo deve pensare: *questi sono i migliori al mondo sull'artigianato dell'interfaccia, e non sono uno studio di soli visual — sanno anche di processo, CMS, SEO, PageSpeed e MVP*.

## Idea regista

Ogni blocco della pagina e' un rettangolo con angoli morbidi (`border-radius: 2rem` / `8rem`) che si apre, si inverte in nero o si riordina mentre gli passi accanto: il sito e' la demo del servizio che vende.

## Il momento

La sezione servizi (`.cb-feature`, 5 voci). Cade **subito dopo il video showreel, intorno alla terza schermata di scroll**. Ogni voce e' una card grigia `#eee` con solo il titolo; quando la card attraversa il centro del viewport si tinge di nero, il testo diventa bianco, e la sua fisarmonica si apre (`gridTemplateRows` da `0fr` a `1fr`) **agganciata allo scroll con `scrub: 1`** — quindi si apre e si richiude avanti e indietro seguendo la rotella. Le card sono in posizione assoluta sopra 5 spaziatori invisibili (`.cb-feature-fake`, `height: 37.42rem` ciascuno): l'altezza totale della sezione e' costante, quindi la lista si apre e si chiude senza mai far saltare il layout della pagina.

Il secondo momento e' piu' piccolo ma piu' furbo: le 5 testimonianze clienti stanno a terra come un mazzo di carte buttato (rotazioni da `-20deg` a `+20deg`, traslazioni fino al 48%), e **basta portare il puntatore sul contenitore perche' si mettano tutte in fila dritte** in 1s con `cubic-bezier(.25,1,.5,1)`. Un solo selettore CSS, nessun JS.

## Struttura, sezione per sezione

Le schermate di scroll sono **calcolate dal CSS** (viewport 1600x900, dove `1rem = 10px`), non misurate a video.

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate) |
|---|---|---|---|
| `.cb-navbar` | logo SVG + Services / Projects / About / Blog / Contacts + "Get in touch" | naviga; su mobile apre il menu a tutto schermo | fissa, alta `8rem` |
| `.cb-tophead` | H1 "Digital design & development agency" + sommario, centrati | legge | ~0,6 |
| `.cb-preview` #showreel | video showreel 16:9 in loop, muto, autoplay, angoli `2rem` | clicca (cursore diventa "play") e apre la modale col video integrale | ~0,8 |
| `.cb-overview` #about | "What we do" + paragrafo, con un divisore SVG elastico | legge; muovendo il mouse deforma la linea | ~1 |
| `.cb-feature` #features | 5 servizi che si aprono e si invertono in nero sullo scroll | scrolla (desktop) / clicca (mobile) | ~2,1 |
| `.cb-logoreel` #brands | 12 loghi clienti in griglia 4 colonne | in hover su uno, gli altri 11 sbiadiscono a `opacity:.2` | ~0,6 |
| `.cb-summary -inverse` #featured | "Selected work": 10 card progetto su 2 colonne sfalsate, fondo nero | hover = parte il video di copertina; clic = pagina progetto | ~4,9 |
| `.cb-summary` #clients | "Trusted by our clients": 5 testimonianze come carte sparse | hover sul gruppo = si allineano | ~0,8 |
| `.cb-overview` (2°) | "Why Cuberto" + 6 riquadri (15+, 300+, premi, in-house) | legge | ~1 |
| `.cb-summary -inverse` #blog | "Insights": 3 articoli con data | clic | ~1,5 |
| `.cb-faq -inverse` | 6 domande in `<details>` su fondo nero | apre/chiude | ~1,5 |
| `.cb-outro` | "Have an idea?" su immagine di sfondo, fondo nero, alto `57.7rem` | clic su "Tell us about it" | ~0,7 |
| `footer.cb-footer` | due sedi, link, privacy, social | — | ~0,8 |

Totale approssimativo: **16-17 schermate**.

## L'esperienza in ordine di tempo

Tempi e curve presi dai timeline GSAP nel bundle, non cronometrati.

**Secondi 0-3 (ingresso)**
- `0.0s` — il velo bianco del loader (`.cb-loader-fill`) sparisce: `opacity 1 -> 0` in `0.4s`. Sul primo caricamento e' quasi impercettibile; serve davvero nelle transizioni tra pagine.
- `0.0s` — il logo in alto a sinistra si compone: ogni `path` dell'SVG da `scale: 0` a `1`, `duration .4`, `stagger .06`. Le lettere del logo "pop" una dopo l'altra.
- `0.0s` — voci di menu, CTA e toggle entrano insieme da `y: 20, opacity: 0` in `0.8s`, `stagger .1`.
- `0.0s -> 2.3s` — l'H1 e' spezzato in **parole** con SplitText (`type:"words", mask:"words"`), ogni parola sale da `y: 120%` dietro una maschera. `duration 1.7`, `ease "expo.out"`, `stagger: {amount: .6}` (i .6s si distribuiscono su tutte le parole, quindi l'ultima parte a 0.6s e finisce a 2.3s). Stesso trattamento al paragrafo sotto.
- `0.1s -> 2.6s` — il blocco video showreel entra con un `clipPath` che si apre: da `inset(5% 10% round 2rem)` e `scale .9` a `inset(0% 0% round 2rem)` e `scale 1`, `duration 2.5`, `ease "expo.out"`, in contemporanea `opacity 0 -> 1` in `1s`. E' la firma dell'ingresso: **il video non appare, si "sbriglia" dai bordi**.

**Secondi 3-10**
- Il video showreel gira gia' in loop (autoplay, muted, playsinline). Sorgente diversa sotto i 768px.
- Se l'utente non tocca niente non succede altro: **non c'e' nessun timer, nessun carosello automatico, nessuna intro a scena obbligata**. Tutto il resto e' comandato dallo scroll.
- Al primo movimento di rotella entra Lenis: lo scroll diventa inerziale (solo desktop non-touch).
- Lo showreel ha anche un parallasse continuo: la sua `media` e' a `scale 1.05` e si muove da `y:-10%` a `y:+10%` con `ease:"none"`, `scrub: true`, sull'intera traversata del viewport.

**Poi, a blocchi**
1. Header "What we do": entra con lo stesso word-reveal mascherato (`stagger .2` tra header e testo). Sopra c'e' un `.cb-divider`: un `<path>` SVG generato in JS (`M0,100 Q<x>,<y> <w>,100`) che entra da `scaleX: 0` in `3s` `expo.out` e poi **segue il mouse deformandosi** (`gsap.to` sull'attributo `d`, `duration .2`), e al `mouseleave` torna dritto con `elastic.out(1, 0.2)` in `2s`.
2. Sezione servizi: il momento descritto sopra.
3. Loghi clienti: entrano in batch (`ScrollTrigger.batch`, semplice `opacity 0 -> 1`, `duration 2`, `stagger .1`, `expo.out`, `once: true`).
4. "Selected work": le card entrano da `y: 70, opacity: 0` in `2s` `expo.out` con `stagger .1`, in batch. La seconda colonna parte 15rem piu' in basso (`margin-top: 15rem`), quindi le due colonne non sono mai allineate. In hover: la card intera va a `scale(.98)` in `1.2s` `cubic-bezier(.16,1,.3,1)`, l'immagine sfuma e **parte il video** (`currentTime = 0; play()` all'`mouseenter`, `pause()` all'`mouseleave`).
5. Testimonianze: pila disordinata che si ordina in hover.
6. FAQ: `<details>` nativi animati con `::details-content` (`grid-template-rows 0fr->1fr .3s ease-out` + `content-visibility ... allow-discrete`). Nessun JS.
7. Chiusura nera + footer.

**Cambio pagina** (non e' un ricaricamento pieno): un router interno rifa' solo `title`, `meta`, `.cb-navbar` e `#view-main`. In uscita il contenuto scivola su di `-10vh` (`-5vh` in verticale) in `0.9s` con un ease custom `.76, 0, .2, 1`, mentre il velo bianco sale da `scaleY: 0` con origine in basso, `0.7s`, `power4.inOut`.

## Animazioni

| elemento | cosa si muove | legato a | curva / inerzia | note |
|---|---|---|---|---|
| H1, H2, paragrafi | parole da `y:120%` dietro maschera | ScrollTrigger `once:true` (l'H1 al load) | `expo.out`, `duration 1.7`, `stagger {amount:.6}` | **GSAP SplitText** `type:"words", mask:"words", tag:"span"`; `aria:"auto"` sugli `h1..h6` cosi' lo screen reader legge il testo vero |
| showreel / poster | `clipPath inset(5% 10% round 2rem)` + `scale .9` -> pieno | load / ScrollTrigger | `expo.out`, `2.5s` | usato identico su showreel, poster articoli, copertine |
| showreel media | `y -10% -> +10%`, `scale 1.05` | scroll, `scrub: true` | `ease:"none"` | parallasse classico |
| card servizio (x5) | colore testo -> `#fff`, `.cb-feature-item-fill` -> `#000`, immagine di sfondo `opacity 0->1`, fisarmonica `gridTemplateRows 0fr->1fr`, numero a `opacity .5` | scroll su uno spaziatore invisibile, `start:"top center+=20%"`, `end:"bottom center+=30%"`, **`scrub: 1`** | il testo interno entra con `duration .6` a offset `.4` | reversibile: risalendo si richiude |
| card servizio, sfondo | immagine PNG in `mix-blend-mode: lighten` | stato (`opacity`) | — | l'immagine si "brucia" sul nero invece di essere ritagliata |
| card progetto | `scale(.98)` su tutta la card, video `opacity 0->1` | hover (solo `pointer:fine`) | `1.2s cubic-bezier(.16,1,.3,1)` per la card, `.4s` per il video | il `<video>` ha `preload="none"`: non scarica niente finche' non ci passi sopra |
| loghi clienti | fratelli a `opacity .2` | hover sul contenitore | `.6s` | `.cb-logoreel-items:hover .cb-logoreel-item-img{opacity:.2}` + override su `:hover` del singolo |
| testimonianze | da rotazioni `-20deg..+20deg` e offset a `translate(0) rotate(0)` | hover sul contenitore | `1s cubic-bezier(.25,1,.5,1)` | solo CSS |
| divisore | `d` del path SVG segue il mouse | mousemove | `.2s` in inseguimento, ritorno `elastic.out(1, 0.2)` in `2s` | l'unico effetto puramente "al mouse" del sito |
| bottoni CTA | `scaleX(1.02)` | hover | `.6s cubic-bezier(.34,5.56,.64,1)` | il secondo valore >1 e' un rimbalzo elastico voluto |
| bottoni CTA, riempimento | `.cb-btn_cta-ripple span` da `translateY(101%)` con `border-radius 50% 50% 0 0` a piatto | hover | `.5s cubic-bezier(.4,0,0,1)` | l'onda che sale dal basso e si "spiana" |
| link e voci di menu | `span` sale, il duplicato in `::after` (`content: attr(data-text)`) sale al suo posto | hover | `.8s / 1.2s cubic-bezier(.16,1,.3,1)`, con `skewY(10deg)` nel menu mobile | e' il motivo dei `data-text="Services"` nell'HTML |
| barra di navigazione | `translateY(-100%)` scorrendo giu', `translateY(0)` risalendo | listener `scroll` passivo, confronto con `scrollY` precedente | `.3s` | il pannello dietro e' `rgba(255,255,255,.95)` + `backdrop-filter: blur(12px) saturate(300%)` |
| menu mobile | `clipPath inset(0 0 0 100%) -> inset(0 0 0 0%)` | clic | `1s power4.out` | tendina da destra |
| entrata generica dei blocchi | `y: 70 -> 0` + `opacity` | `ScrollTrigger.batch`, `once: true` | `expo.out`, `2s`, `stagger .1` | tre sole primitive riusate ovunque: fade, fade+y, scale |
| cursore | pallino che insegue, si deforma in direzione del movimento, cambia scala per contesto | mousemove | inseguimento `speed: .5`, `skewing: 1.5` (`.5` quando contiene un media) | vedi sotto |
| transizione di pagina | velo bianco `scaleY 0->1` dal basso + contenuto a `y:-10vh` | navigazione | `power4.inOut .7s` / ease custom `.76,0,.2,1` `.9s` | |

**Il cursore**, che e' la firma storica di Cuberto: un `div` `position: fixed`, `z-index: 500`, `mix-blend-mode: exclusion` con un cerchio bianco da `10rem` in `::before` tenuto normalmente a `scale(.1)`. Cambia stato in base a cosa c'e' sotto:

| stato | `scale` del cerchio | quando |
|---|---|---|
| riposo | `.1` | ovunque |
| `-pointer` | `.25` (`.3` al clic) | su un link |
| `-opaque` | `.6` (`.5` al clic) | quando serve coprire |
| `-icon` | `.8` | quando mostra una icona SVG (`play`, `times`, `arrow-up-right`) |
| `-text` | `.9` | quando mostra una parola |
| `-lg` | `1.05` (`1.15` al clic) | stato grande |

Configurazione letta nel bundle: `{ skewing: 1.5, skewingMedia: .5, speed: .5, iconSvgSrc: "/assets/sprites/svgsprites.svg?2" }`. Le icone arrivano da uno sprite SVG unico da 9,6 kB. Il markup pilota il cursore con due soli attributi: `data-cursor="-inverse"` sulle sezioni scure e `data-cursor-icon="arrow-up-right|play|times"` sugli elementi cliccabili. Il cursore si attiva **solo** se `matchMedia("(pointer:fine)")` e' vero.

## Colori

Palette letta dal CSS inline. Il sito e' rigorosamente bicromo; i colori esistono solo dove serve.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo | `#ffffff` | `body`, `.cb-summary-fill`, velo del loader, `theme-color` del manifest |
| testo | `#000000` | `body`, testo del cursore |
| inverso (fondo) | `#000000` | `.cb-summary-fill.-inverse` (Selected work, Insights), `.cb-faq.-inverse`, `.cb-outro`, tooltip dei loghi |
| inverso (testo) | `#ffffff` | tutto cio' che sta sopra il nero |
| superficie chiara | `#eeeeee` | `.cb-feature-item-fill` — la card servizio prima di invertirsi |
| superficie fredda | `#f1f3fa` | riquadri "Why Cuberto", testimonianze dispari, citazioni e testate di tabella nel blog |
| superficie verde-menta | `#e3f5f3` | testimonianze pari, riquadro che contiene un `<strong>` (`:has(strong)`), citazioni pari |
| selezione testo | `#494949` (fondo) su `#fff` | `::selection` |
| grigio secondario | `#999999` | placeholder dei campi, nome autore |
| grigio tenue | `#b7b7b7` | messaggi nelle modali |
| errore | `#eb4242` | messaggi di validazione dei form |
| rosso video | `#fc0019` | pulsante play di un embed in hover (stile YouTube) |
| velo | `rgba(0,0,0,.3)` | sfondo del loader |
| barra fissa | `rgba(255,255,255,.95)` + `blur(12px) saturate(300%)` | `.cb-navbar-fill` |

Non ci sono variabili CSS: zero `--custom-property` in tutto il foglio. I colori sono scritti a mano nelle regole.

## Tipografia

| livello | famiglia | peso | corpo (mobile / >=768px) | interlinea | note |
|---|---|---|---|---|---|
| H1 hero | Suisse Intl | 500 | `4.5rem` / `9rem` (45px / 90px) | `100%` | `letter-spacing: -.01em`, `text-wrap: balance`, centrato da 768px in su |
| H2 sezione | Suisse Intl | 500 | `4.5rem` / `9rem` | `100%` | `letter-spacing: -.02em` |
| H2 chiusura | Suisse Intl | 500 | `5rem` / `8rem` | `110%` | `letter-spacing: -.03em` |
| H3 servizio | Suisse Intl | eredita | `3.2rem` / `4.2rem` | `110%` | |
| sommario hero | Suisse Intl | 400 | `2rem` / `2.4rem` | `130%` / `120%` | `letter-spacing: .02em`, `max-width: 84rem` |
| numeri (15+, 300+) | Suisse Intl | eredita | `4.5rem` / `6.4rem` | `100%` | `letter-spacing: -.03em` |
| didascalia card | Suisse Intl | 400 | `1.7rem` / `2rem` | `120%` | |
| bottone CTA | Suisse Intl | eredita | `2rem` | `1` | pillola, padding `3.2rem 5.6rem`, `border-radius: 99999px` |
| etichetta / occhiello | Suisse Intl | 600 | `1.4rem` / `1.6rem` | `110%` | `text-transform: uppercase` |
| corpo base | Suisse Intl | 400 | `1.4rem` | `1.15` | |

**Come sono serviti i font**: **Suisse Intl** self-hosted da `/assets/fonts/suisseintl/`, 5 file statici (`light 300`, `regular 400`, `medium 500`, `semibold 600`, `bold 700`), woff2 con fallback woff, tutti `font-display: swap`. Non e' un font variabile. ~17 kB per peso. Non c'e' nessun `<link rel="preload">` sui font. **Manrope** (variabile 200-800, da Google Fonts CDN) e' caricato solo per `html:lang(ru)`: e' il font della versione russa del sito, il cirillico di Suisse Intl non e' incluso.

**Il sistema di misura e' la cosa piu' interessante della tipografia**: tutto e' in `rem` e la radice e' fluida.

```css
html          { font-size: 2.6666666667vw }  /* mobile: 1rem = 10px a 375px */
@media (min-width:768px)  { html { font-size: .625vw } }  /* 1rem = 10px a 1600px */
@media (min-width:1600px) { html { font-size: 10px } }    /* si blocca */
```

Quindi: il layout **scala proporzionalmente** con la larghezza dello schermo tra 768px e 1600px (nessun breakpoint intermedio da gestire), si blocca a 1600px, e sotto i 768px riparte con una scala mobile dedicata. Un solo salto reale nel CSS: 768px.

## Testi veri

**Menu (desktop e mobile)**: `Services` · `Projects` · `About` · `Blog` · `Contacts` — piu' `Get in touch` e `info@cuberto.com` nel menu mobile. Il toggle si chiama `Menu`.

**Titolo (H1)**: `Digital design & development agency`

**Sommario**: `We design and build digital products, brands and websites for companies ready to move beyond the ordinary.`

**About**: `What we do` / `Since 2010, we've partnered with startups, scale-ups and global companies to design brands, websites and digital products that combine beautiful visuals with measurable business results.`

**I cinque servizi** (titolo + testo, ognuno con CTA `Explore`):
1. `Digital Product Design` — `We design digital products from early concepts to scalable systems. Combining product strategy, UX and interface design, we help startups and established companies turn complex ideas into clear, usable experiences.`
2. `Web Design & Development` — `We create marketing websites that explain products clearly, strengthen brands and support business growth. From structure and content to responsive design and development, every website is built around a specific goal.`
3. `UX Research & UI Design` — `We uncover how people use digital products and where their experience breaks down. Through research, user flows, wireframes and prototypes, we improve usability before moving into interface design.`
4. `Brand Identity` — `We create visual identities that give companies a distinct and consistent presence. From typography and color to digital guidelines and campaign assets, every element is designed to work as one system.`
5. `Creative Development` — `We bring ambitious digital concepts to life through motion, 3D and interactive development. Using technologies such as WebGL, GSAP and modern JavaScript frameworks, we build experiences that standard templates cannot deliver.`

**Loghi**: `Trusted by remarkable global brands` — Mapbox, Cisco, Spark, TradingView, SCA, PuntoPago, FlipAClip, Etihad, Raiffeisen, IKEA, McDonald's, Housing.

**Lavori**: `Selected work` + CTA `View all projects`. Le didascalie sono frasi di risultato, mai nomi di categoria:
- `Building a connected ecosystem where discovering, learning and buying wine feels effortless`
- `Modernizing the digital presence of a nationwide industry leader`
- `Bringing the creativity of millions of artists into an immersive web experience`
- `Designing a product that brings payroll, HR and IT together in one seamless experience`
- `Building a scalable design foundation for one of the world's technology leaders`
- `Building a complete real estate brand and digital platform from the ground up`
- `Turning an ambitious idea into a complete mobile product and brand from scratch`
- `Creating a digital experience worthy of one of the world's fastest-growing capitals`
- `Reimagining a B2B product through branding, storytelling and motion`

**Clienti**: `Trusted by our clients`. Prima testimonianza: `Cuberto completed a rebranding of our company website zelt.app. The quality of the team's work exceeded my expectations, and since completion we have won a number of awards, including the Site of Day awwward.`

**Why Cuberto**: `For over 15 years, we've been helping startups, scale-ups and global companies transform ambitious ideas into successful digital products. Our work has earned international recognition, but what matters most to us is building long-term partnerships and delivering measurable business value.`
Riquadri: `15+ / Years of experience` · `Recognized by leading design awards` · `300+ / Projects delivered worldwide` · `Long-term partnerships with global brands` · `Strategy, design & development – all in-house`

**Blog**: `Insights` + CTA `Visit blog`. Articoli: `Website Redesign RFP: What Agencies Actually Need From You` (8/11/2026), `Website Redesign Process: How We Plan, Design and Build Websites` (8/4/2026), `How Much Does a Website Redesign Cost in 2026?` (7/28/2026).

**FAQ**: `FAQ` — `What does the typical website redesign or revamp process look like?` · `What services does Cuberto provide?` · `Do you build websites using Webflow or custom code?` · `Can you help launch an MVP quickly?` · `Which CMS do you recommend?` · (una sesta su prezzi / SEO-PageSpeed). Nella risposta sullo stack dichiarano loro stessi: `we usually build custom websites using modern technologies like Astro, Next.js, React, GSAP and headless CMS solutions such as Strapi.`

**Chiusura**: `Have an idea?` + `Tell us about it`

**Piede**: `info@cuberto.com` · `+1 301 549 9309` · `Main office / 901 N Pitt Street / Alexandria VA, 22314` · `Second office / Na Perstyne / 342/1, 11000 Prague` · link `Services` `Blog` `Projects` `Workflow` (verso https://hello.cuberto.com/) `About` `Contacts` · `Privacy Policy` · `2026, Cuberto` · social: Dribbble, GitHub, YouTube, LinkedIn.

## Mobile

Il breakpoint unico e' **768px**. Il CSS e' scritto mobile-first (190 blocchi `min-width:768px`, solo 12 `max-width:767px`), quindi la struttura non cambia: **cambia il modo di comandarla**. Quello che segue e' letto nel codice.

**SPARISCE completamente**
- **Il cursore personalizzato.** Non viene nemmeno istanziato: `if (window.matchMedia("(pointer:fine)").matches)`. Tutti gli `data-cursor-icon` diventano inerti.
- **Lo scroll inerziale.** `if (!ScrollTrigger.isTouch) new Lenis(...)`: su touch si scrolla nativo. Nessun fallback, nessuna finta inerzia.
- **I video in hover sulle card progetto.** `.cb-card-preview-media.-video { display: none }` e diventa `display:block` solo dentro `@media (pointer:fine)`. Su mobile resta la sola JPG. Anche il `mouseenter -> video.play()` e' dietro `if (!ScrollTrigger.isTouch)`.
- **Il primo riquadro contatore** in "Why Cuberto" (`.cb-overview-counter:first-child { display: none }` sotto 767px).
- **La colonna sinistra degli articoli** (`.cb-article-grid-col.-left`) e l'utility `.-gxs`.
- **La deformazione del divisore col mouse** (`if (ScrollTrigger.isTouch) return`).
- **Il magnetismo** sugli elementi che inseguono il puntatore (`if (!ScrollTrigger.isTouch)`).

**VIENE SOSTITUITO**
- **La sezione servizi cambia meccanica, non solo aspetto.** Sotto 768px il timeline con `scrub` non esiste: `gsap.matchMedia()` registra al suo posto un `click` che fa `classList.toggle("-active")` su ogni card, e la fisarmonica si apre in CSS con `transition: grid-template-rows 1.2s cubic-bezier(.16,1,.3,1)`. Gli spaziatori `.cb-feature-fake` e il posizionamento assoluto valgono solo da 768px in su: su mobile le card sono in flusso normale. **E' il pezzo di codice piu' istruttivo del sito: stesso contenuto, stesso stato finale, due sorgenti d'input diverse.**
- **La navigazione** diventa un pannello a tutto schermo (`height: 100lvh`, fondo bianco) che entra con `clipPath` da destra; il menu inline desktop e' spento con `display: none !important` da 768px in giu' e viceversa. Il pulsante toggle e' `position: sticky; top: 2.5rem` dentro un contenitore `pointer-events: none` (trucco per tenerlo agganciato senza bloccare i clic sotto).
- **Il video showreel ha un altro file**: `<source src="/assets/showreel/short.mp4" media="(min-width:768px)">` e in fallback `short-sm.mp4`. **6,0 MB contro 2,1 MB.** E c'e' un listener che chiama `video.load()` quando il `matchMedia` di una `<source>` cambia (altrimenti il browser non riscambia la sorgente al resize).
- **Il video della modale** ugualmente: `full-1440-60.mp4` (85 MB!) sopra 1200px, `full-1080-60.mp4` sotto.
- **Le testimonianze**: da pila ruotata (`display:flex` + rotazioni) a `display: grid` verticale con `gap: .8rem`, dritte. L'effetto "si riordinano" non esiste.
- **Le card progetto** cambiano proporzione: `aspect-ratio: 365/420` su mobile, `500/675` da 768px (e le card `-sm` restano `1/1`). Le colonne sfalsate diventano una colonna sola.
- **Gli angoli morbidi delle sezioni**: `border-radius: 8rem` sui blocchi neri solo da 768px in su. Su mobile sono squadrati.
- **Il padding di pagina**: `0 2rem` -> `0 12rem` (contenitore normale), `0 1.5rem` -> `0 24rem` (contenitore `-lg`). Cioe' su desktop il testo hero sta in una colonna molto stretta al centro.
- **Loghi clienti**: griglia 2 colonne -> 4 colonne, altezza item `9rem` -> `11.8rem`.
- **Riquadri "Why Cuberto"**: colonna singola -> griglia a 6 colonne.
- **Allineamento**: hero e sommario sono `text-align: left` su mobile, `center` da 768px.
- Tutti gli hover di sostituzione testo sono neutralizzati sotto `@media (pointer:coarse)` con `transform: none`, per evitare lo stato "incastrato" dopo un tap.

**RESTA**
- Word-reveal con SplitText su tutti i titoli, entrate `y:70` + fade in batch, parallasse dello showreel, `clipPath` d'ingresso: tutta la coreografia da scroll non-scrub e' identica.
- Le FAQ (sono `<details>` nativi, animati in CSS puro).
- La barra che si nasconde scrollando giu' e riappare risalendo.
- Le transizioni di pagina col velo bianco.

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| Framework front-end | **nessuno**. HTML statico pre-renderizzato, servito intero. Non e' una SPA. | VERIFICATO | zero occorrenze di `react`, `vue`, `svelte`, `alpine`, `htmx` in `bundle.js`; l'HTML contiene gia' tutti i testi e tutte le sezioni |
| Generatore statico | probabilmente Astro | SUPPOSTO | nessuna impronta nell'output (niente `astro-island`, niente commenti di build). Lo dichiarano loro nella FAQ: "we usually build custom websites using modern technologies like **Astro**, Next.js, React, GSAP"; l'HTML pulito senza runtime e' compatibile con Astro |
| Animazione | **GSAP 3.15.0** con i plugin **ScrollTrigger**, **SplitText**, **Observer**, **Flip**, **CustomEase**, **ScrollSmoother** (presente nel bundle; non ho trovato una sua istanziazione) | VERIFICATO | `si.version = Xt.version = Li.version = "3.15.0"`; `SplitText.create(e,{type:"words",mask:"words",tag:"span"})`; `registerPlugin(ScrollTrigger)`, `registerPlugin(Observer)`, `registerPlugin(CustomEase)` |
| Scroll | **Lenis 1.3.25**, `new Lenis()` **senza opzioni** (quindi default: `duration 1.2`, easing `1 - 2^(-10t)`, `smoothWheel: true`, `wheelMultiplier: 1`), agganciato al ticker GSAP | VERIFICATO | `ya="1.3.25"`; `initLenis(){ if(!ScrollTrigger.isTouch){ this.lenis=new Lenis(); this.lenis.on("scroll",ScrollTrigger.update); gsap.ticker.add(t=>this.lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0) } }` |
| Caroselli | **Swiper** (91 occorrenze), usato in `.cb-overview-carousel` con `slidesPerView:1, spaceBetween:30, speed:1000` | VERIFICATO | letto nel bundle; sulla home il carosello non e' presente |
| Marquee | modulo interno "Reeller" con plugin `scroller` (`speed:15, multiplier:.3, reversed:true`) | VERIFICATO | usato in `.cb-nextcase-reel` (pagine progetto), non sulla home |
| Router / transizioni | **router interno custom**, non una libreria nota. `fetch` + `DOMParser`, sostituisce solo `["title","meta",".cb-navbar","#view-main"]` | VERIFICATO | `executeRequest(){ fetch(...).then(r=>r.text()).then(t=>this.parser.parseFromString(t,...)) }` e `options:{updateSelectors:[...]}`; zero occorrenze di `taxi`, `barba`, `swup`, `highway` |
| 3D / WebGL | **nessuno** sulla home | VERIFICATO | zero `THREE`, `webgl`, `createShader` nel bundle. (Lo vendono come servizio, non lo usano sul proprio sito.) |
| CSS | un unico `<style>` inline da 79.654 byte, nessuna variabile CSS, convenzione BEM-like con modificatori a trattino iniziale (`.cb-summary.-inverse`) | VERIFICATO | letto nell'HTML |
| Font | Suisse Intl self-hosted (5 woff2 statici); Manrope da Google Fonts solo per `:lang(ru)` | VERIFICATO | `@font-face` nel CSS inline |
| CMS | headless, non identificabile dall'esterno | SUPPOSTO | i post del blog hanno date e slug regolari; nella FAQ nominano **Strapi**. Niente nell'output lo conferma |
| Hosting | **DigitalOcean App Platform** + storage compatibile S3 (Ceph RGW), dietro **Cloudflare** | VERIFICATO | header di risposta: `x-do-app-origin: 4f58bfda-...`, `x-rgw-object-type: Normal`, `x-amz-request-id: ...fra1c`, `Server: cloudflare`, `cf-cache-status: HIT` |
| Cache | `Cache-Control: public, max-age=10, s-maxage=86400` | VERIFICATO | header |
| Immagini | JPG/PNG con `srcset` a `2x` e `loading="lazy"`; **niente WebP/AVIF** sulle copertine (4 sole `.webp` in tutta la pagina, tra cui lo sfondo del blocco finale); niente `<picture>` con `type` alternativi | VERIFICATO | 31 `<img>`, 25 con `loading="lazy"`, `srcset="...@2x.jpg 2x"` |
| Video | MP4 self-hosted, nessun player esterno, nessun HLS | VERIFICATO | zero `hls.` nel bundle; `<source>` con attributo `media` per servire file diversi per breakpoint |
| Icone | sprite SVG unico caricato dal cursore (`/assets/sprites/svgsprites.svg?2`, 9,6 kB) + SVG inline per logo e riquadri | VERIFICATO | letto in HTML e bundle |
| Analytics | **Google Tag Manager** (`GTM-T9VW8G26`), unico terzo | VERIFICATO | script nel `<head>`; nessun Hotjar/Clarity/Segment/Intercom |
| Dati strutturati | JSON-LD `Organization` con `contactPoint` e `address` | VERIFICATO | nel `<head>` |

## Peso e prestazioni

Misurato con `curl` il 13/08/2026, non con un browser.

| voce | non compresso | trasferito (br/gzip) |
|---|---|---|
| HTML (CSS inline compreso) | 153.543 B | **33.539 B** |
| `bundle.js` | 283.029 B | **94.893 B** |
| Suisse Intl regular `.woff2` | 17.228 B | gia' compresso |
| Suisse Intl medium `.woff2` | 17.788 B | gia' compresso |
| sprite SVG icone | 9.607 B | |
| showreel desktop `short.mp4` | **6.003.109 B (6,0 MB)** | |
| showreel mobile `short-sm.mp4` | **2.068.309 B (2,1 MB)** | |
| showreel integrale (modale, >1200px) `full-1440-60.mp4` | **85.160.081 B (85 MB)** | `preload="none"` |
| copertina progetto tipo `.jpg` | 86.867 B | |
| video hover progetto tipo `.mp4` | 433.742 B | `preload="none"`, uno per card, 10 card |

**Somma del percorso critico** (HTML + JS + 2 font + sprite): **~173 kB trasferiti**. Poi parte subito lo showreel: **+6,0 MB su desktop, +2,1 MB su mobile**, perche' e' `autoplay preload="auto"` sopra la piega. E' di gran lunga la voce dominante e la scelta piu' discutibile del sito.

Conteggio in pagina: 31 `<img>` (25 in lazy), 12 `<video>`. I 10 video di copertina dei progetti sono in `preload="none"`: **non pesano finche' non ci passi sopra il mouse**, e su mobile non pesano mai (`display:none`).

Dettagli di ottimizzazione notati: `gsap.ticker.lagSmoothing(0)` per non far saltare le animazioni quando il thread e' occupato; `will-change: transform` messo e tolto a mano dentro i timeline (`set(..., {willChange:"transform"})` all'inizio, `"auto"` alla fine); `contain: layout style size` sul cursore; e un trucco esplicito: **3 secondi dopo il completamento della pagina tutte le immagini `loading="lazy"` vengono promosse a `eager`** (`setTimeout(()=>this.loadLazyImages(), 3000)`), cosi' il lazy protegge il caricamento iniziale ma non fa vedere buchi bianchi a chi scrolla veloce.

**Punteggi Lighthouse / PageSpeed: non verificati.** L'API pubblica di PageSpeed Insights ha risposto `429 Quota exceeded` e non ho aperto un browser per farla in locale (regola sulla memoria).

## Tre cose da rubare

1. **Il pilotaggio con spaziatori invisibili.** La sezione servizi mette le card in `position: absolute` sopra 5 `div` vuoti (`.cb-feature-fake`, `height: 37.42rem`), e ogni ScrollTrigger e' agganciato allo **spaziatore**, non alla card. Risultato: la fisarmonica puo' aprirsi e chiudersi in `scrub` senza che l'altezza del documento cambi mai, quindi niente `ScrollTrigger.refresh()`, niente salti, niente scroll che si "mangia" da solo. E' la soluzione pulita al problema classico "animo l'altezza di un elemento mentre lo scroll dipende dall'altezza della pagina".

2. **Due input, uno stato: `gsap.matchMedia()` con cleanup.** Lo stesso componente registra `mm.add("(max-width: 767px)", ...)` (click che fa toggle di una classe, transizione in CSS) e `mm.add("(min-width: 768px)", ...)` (timeline scrubbed). Entrambe le funzioni **restituiscono la propria funzione di pulizia**, che rimuove i listener e toglie la classe `-active`. Ruotando il telefono si passa da una modalita' all'altra senza stati fantasma. Copiabile pari pari:
   ```js
   this.mm = gsap.matchMedia();
   this.mm.add("(max-width: 767px)", () => {
     const fns = [];
     items.forEach((el, i) => { fns[i] = () => { el.classList.toggle("-active"); ScrollTrigger.refresh(true) }; el.addEventListener("click", fns[i]) });
     return () => items.forEach((el, i) => { el.removeEventListener("click", fns[i]); el.classList.remove("-active") });
   });
   ```

3. **Tre primitive d'ingresso, riusate ovunque, sempre in `ScrollTrigger.batch` con `once: true`.** Tutto il sito si anima con: fade (`opacity 0->1, duration 2, stagger .1, expo.out`), fade+salita (`y: 70 -> 0`, stessi valori), scale (`scale .5 -> 1`). Piu' un solo reveal tipografico (SplitText a parole mascherate, `y:120%`, `expo.out 1.7`, `stagger {amount:.6}`) e una sola apertura di media (`clipPath: inset(5% 10% round 2rem) + scale .9` -> pieno, `expo.out 2.5`). Cinque funzioni in croce, un solo `ease` (`expo.out`), e un sito intero che sembra coreografato. La coerenza non viene dalla varieta': viene dal ripetere le stesse cinque cose.

**Bonus, gratis:** `.cb-summary-testimonials:hover .cb-summary-testimonial { transform: translateY(0) translateX(0) rotate(0) }` — una pila di carte sparse che si mette in fila. Una riga di CSS, nessun JS, e la gente se lo ricorda.

## Non verificato

- **Non ho aperto nessun browser.** Quindi: non ho visto il sito in movimento, non ho verificato che i tempi letti nei timeline corrispondano alla percezione reale, non ho controllato se ci sono glitch, e non ho preso screenshot. Tutte le curve e le durate qui sopra sono lette nel codice sorgente.
- **Punteggi Lighthouse, LCP, CLS, TBT**: non ottenuti. L'API PageSpeed ha risposto `429 Quota exceeded`.
- **Il generatore statico (Astro?)**: supposto. L'output HTML e' completamente ripulito e non porta impronte.
- **Il CMS (Strapi?)**: supposto, dalla loro FAQ. Nessun endpoint visibile dall'esterno.
- **ScrollSmoother** e' nel bundle ma non ho trovato dove venga istanziato — probabilmente e' dentro il bundle solo perche' importato dal pacchetto GSAP Club e non tree-shakato. Lo scroll fluido reale lo fa Lenis.
- **Il contatore numerico** `.cb-overview-counter` esiste nel CSS e nel JS ma sulla home i numeri "15+" e "300+" sono dentro `.cb-overview-tile` come testo statico: **non ho verificato se si animano** (probabilmente no, su questa pagina).
- **Il tooltip dei loghi clienti** (`.cb-logoreel-item-tooltip`, nero, `border-radius 1.6rem`) e' definito nel CSS ma **nel markup della home non c'e'**. O e' un residuo, o compare in altre pagine.
- **Il carosello Swiper e il marquee "Reeller"** sono nel bundle ma non nella home: appartengono alle pagine progetto.
- **Le pagine interne** (progetti, about, contatti, blog) non le ho analizzate: la scheda riguarda solo la home.
- Non ho verificato il comportamento con `prefers-reduced-motion`: **non c'e' nessuna regola `@media (prefers-reduced-motion)` nel CSS e nessun controllo nel JS**. Questo l'ho verificato (assenza), ma non ho verificato se ci sia una gestione altrove.
- L'attributo `alt` dei loghi clienti e' letteralmente `alt="undefined logo"` su tutti e 12: **e' un bug di template**, verificato nel sorgente.
