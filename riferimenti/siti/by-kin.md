# By-Kin ('kin) — la lezione di sobrieta'

- **URL**: https://by-kin.com/ · CMS: https://cms.by-kin.com/api (Strapi)
- **Premio**: Awwwards SOTD + **Developer Award** 26/12/2024 — SOTD 7.33,
  **Dev Award 7.49** (piu' alto di design e creativita': hanno premiato
  l'esecuzione, non l'idea)
- **Chi**: 'kin e' lo studio cliente (Manchester). Design **Huy Phan**,
  sviluppo **Hon Tran**. Il sito NON e' stato costruito dallo studio inglese.
- **Attenzione**: `awwwards.com/sites/kin-1` e `/sites/studio-kin` sono un
  ALTRO studio. Dei "quattro premi" me ne risultano verificati due.

## L'ESPERIENZA (integrazione)

*Aggiunta del 13/08/2026. Letta con `curl` su `/`, `/work`, `/about`,
`/contact`, `/journal` e `/work/dentons`. Nessun browser aperto.*

### Di cosa tratta il sito

Il lavoro di uno studio di **interni commerciali** di Manchester: 13 progetti
(9 di interni, 5 di identita' grafica), cinque persone, tre premi e cinque
articoli di diario. E' il piu' piccolo e il piu' asciutto dei cinque siti — ed e'
anche l'unico che non e' un'agenzia digitale, quindi l'unico dove il sito **non
e' il prodotto**: e' la brochure di un prodotto fisico.

### Cosa vende, e qual e' l'obiettivo finale

Vende **la progettazione di uffici per grandi studi legali e aziende inglesi**
(Dentons, Taylor Wessing, Auto Trader, JD Sports). L'obiettivo finale e' **una
mail**: `sayhi@by-kin.com`. Non c'e' altro. Nessun modulo, nessun campo budget,
nessun calendario, nessun numero di telefono.

L'obiettivo dichiarato e quello vero coincidono, ma il sito ne persegue un terzo
non detto: **far sembrare lo studio piu' caro di quanto e'**. Ci riesce
rallentando tutto (1,2 s di durata standard, oltre un secondo di inerzia per una
rotellata) e non mostrando mai un prezzo.

### A chi

A chi commissiona un trasloco o un rifacimento di sede: facility manager,
partner di studi professionali, developer immobiliari del nord dell'Inghilterra.
Sanno gia' cos'e' un progetto d'interni e quanto costa; quello che non sanno e'
se questo studio e' all'altezza del loro palazzo. Escono pensando: *hanno fatto
Dentons a Edimburgo e hanno vinto il Mixology North; sono della nostra taglia.*

### L'esperienza progettata, passo per passo

E' **una visita corta e controllata**, e la scelta piu' radicale dei cinque siti
sta qui: **la home e' alta esattamente una schermata** (`scrollHeight ===
innerHeight`). Non si scorre. Non esiste "chi non arriva in fondo".

1. **Home (1 schermata)** — logo, menu (`About` · `Work` · `Journal` ·
   `Contact` · `Subscribe`), il claim in tre righe
   (`'kin are a creative commercial interiors, branding and graphic design
   studio.`), il pulsante `Get to know us`, un selettore `Layout 1 / 2`, e
   `FEATURED WORKS 01 02 03`. Piu' `sayhi@by-kin.com` e i social.
2. **`/work`** — 13 progetti con filtro dichiarato coi conteggi:
   `all (13)` · `Interior design (9)` · `Graphic & Brand Identity (5)`. Ogni voce
   dice `view project`.
3. **Il caso studio** — 14,45 schermate, di cui **11 consecutive senza una sola
   riga di testo**. Tutte le parole stanno nella prima schermata; poi solo
   fotografie ferme.
4. **La chiusura del caso studio** — `want to work with us?` / `Get in contact`.
5. **`/contact`** — l'indirizzo mail, l'indirizzo fisico, i social. Fine.

### Cosa deve fare il visitatore, e dove lo portano

**Guardare le fotografie e poi scrivere una mail.** Il sito non chiede altro e
non offre altro. E' l'imbuto piu' corto e piu' povero dei cinque: nessuna
qualifica, nessuna fascia di budget, nessun brief guidato. Chi scrive arriva
grezzo e la selezione la fanno a mano, dopo.

> **Guasto verificato il 13/08/2026**: il CMS (`cms.by-kin.com/api`) risponde
> **502 Bad Gateway**, e di conseguenza **`/contact` reindirizza alla home**
> (nel payload RSC: `E{"digest":"NEXT_REDIRECT;replace;/;307;"}`). Oggi la
> pagina contatti del sito **non e' raggiungibile**. L'unico canale che
> sopravvive e' la mail nel piede, che e' scritta nel markup statico. E' la
> dimostrazione pratica del rischio di mettere la conversione dentro il CMS.

### Come e' organizzata la persuasione

| pezzo | dove | in quante schermate |
|---|---|---|
| **promessa** | il claim in tre righe, in home | schermata 1 (unica) |
| **prova di lavoro** | 3 lavori in home, 13 in `/work` | 1, poi `/work` |
| **prova di autorita'** | premi e stampa — **solo in `/about`** | fuori home |
| **prova di parola** | **nessuna testimonianza in tutto il sito** | — |
| **prezzo** | **assente ovunque** | — |
| **chiamata all'azione** | `Contact` nel menu (schermata 1) e in fondo a ogni caso studio | 1 |

**Il prezzo, come lo evitano.** Non lo nominano mai, in nessuna forma: nessuna
cifra, nessuna fascia, nessun "a partire da", nessun campo budget. Al suo posto
mettono **il riconoscimento di settore, con l'anno e l'esito**, nel blocco
`In the press` di `/about`:

> `Awards` — `Mixology North / 2023 / Dentons, Edinburgh - Winner` ·
> `BCO - North Region / 2022 / Taylor Wessing - Winner` ·
> `Insider Property Awards / 2021 / Taylor Wessing - Winner`
> `Featured` — `Interview - Matt Holmes (2024)` · `Dezeen - Dentons, Edinburgh
> (2023)` · `FRAME - Dentons, Edinburgh (2023)` · `Mix Interiors - Dentons,
> Edinburgh (2023)` · `Mix Interiors - Taylor Wessing, Liverpool (2021)`

Introdotto da una riga che dice esattamente a cosa serve: *"Our work has
consistently been recognised by industry experts for its unique approach and
ability to drive results for our clients. […] But don't just take our word for
it..."*

**Cosa arriva a chi non scorre.** Tutto quello che c'e', perche' **la home e'
una schermata sola**. Passa: chi sono, cosa fanno, tre lavori, il menu e la
mail. **Non passa nessuna prova**: chi non clicca su `About` non vede mai un
premio, un cliente famoso o una citazione sulla stampa. E' l'inverso esatto del
compromesso di Hello Monday — qui il messaggio base arriva sempre, il messaggio
persuasivo quasi mai.

### Come mostrano i casi studio

Il modello piu' economico dei cinque, e funziona. `/work/dentons`:

- Titolo (`Dentons`), poi `info`
- Riga con anno: `Dentons (2023)`
- **Una frase di claim**: `An award winning office inspired by the natural
  landscape and architecture of Scotland.`
- **Un solo paragrafo** di contesto, che parla dell'obiettivo del cliente, non
  della tecnica: *"It was important to Dentons for clients to WANT to use the
  space […] So a visit is not just a business meeting, but an experience."*
- Quattro metadati in colonna: `client` · `sector` · `location` · `awards`
- Poi **11 schermate di sole fotografie**, ferme
- Chiusura: **`want to work with us?` / `Get in contact`**

**E' l'unico dei cinque siti che chiude ogni caso studio con un invito a
contattarli.** Cuberto chiude con "Next project", Hello Monday e Locomotive con
progetti affini. Qui, dopo undici schermate di silenzio, l'unica frase che
riappare e' la domanda. Meccanica da rubare: **il silenzio prolungato rende
sonora la domanda finale.**

### La pagina servizi

**Non esiste come pagina.** I servizi stanno dentro `/about`, sotto il titolo
`What we do`, in quattro blocchi numerati:

1. **`Interiors`** — *"We design exceptional commercial interiors in close
   collaboration with our clients. Trusted by some of the UK's leading brands, we
   bring visions to life—from concept to installation…"*
2. **`Branding`** — *"We specialise in building brands that capture the heart and
   soul of each company."*
3. **`Graphics`** — *"From bespoke illustrations and dynamic motion design to
   standout marketing, we bring a unique approach to every project."*
4. **`Other`** — ed e' **l'unico invito commerciale scritto in tutto il sito**:
   *"We thrive on design challenges—some of our favorite work has emerged from
   pushing ourselves to think differently. […] **If you have an exciting project
   in mind, get in touch—we'd love to make it a reality.**"*

Un quarto servizio chiamato "Altro" che esiste solo per contenere una chiamata
all'azione: e' un trucco elegante e riusabile.

### Testi veri (integrazione)

**Home** — `'kin are a creative commercial interiors, branding and graphic design
studio.` · `Get to know us` · `Layout 1 2` · `FEATURED WORKS 01 02 03` ·
`sayhi@by-kin.com`

**Meta description** — `'kin are a Manchester-based creative studio specialising
in commercial interior design, branding & graphic design, helping businesses
transform spaces & grow.`

**Contact, meta** — `Get in touch with 'kin, a creative studio specialising in
interior design and branding. We're here to help bring your vision to life,
contact us today.`

**About** — `What we do` · `Meet the team` (Connor, Matt, Robbie, Martina, Nia,
con le lettere che si compongono) · `In the press` · `Awards` · `Featured`

**Caso studio** — `info` · `client` · `sector` · `location` · `awards` ·
`Back to Overview` · `want to work with us?` · `Get in contact`

**Piede** — `Subscribe` · `Say hello` · `sayhi@by-kin.com`

**Avviso mobile** — `This site is only viewable in portrait mode. Please rotate
your device.`

## Cosa vende
Interni commerciali e branding. Il sito e' la vetrina: deve far sembrare lo
studio costoso e sicuro di se'.

## Idea regista
Tutto il movimento sta nella tipografia e nelle cornici; **le fotografie non si
muovono mai**. Cosi' il poco che si muove si legge, invece di fare rumore.

## Lo stack
Next.js **App Router**, hosting **proprio** (nginx su Ubuntu, non Vercel), ISR
con finestre da **3 a 10 secondi**. GSAP 3.12.5 con `@gsap/react`, Lenis,
**SplitType** (non SplitText), Swiper solo su `/work`, Strapi v4, SWR.
**Zero WebGL, zero canvas** su tutte e cinque le pagine. **Zero terze parti**:
311 richieste su 311 verso il proprio dominio, nessun analytics, nessun font da
CDN, nessun banner dei cookie.

> **Falla da segnalare**: nel bundle client c'e' un token Strapi in chiaro
> (`Authorization: Bearer b08a6268…`, 256 caratteri). Leggibile da chiunque
> apra i sorgenti.

## La tipografia — due numeri, non un sistema
Due famiglie, entrambe **Apercu**, auto-ospitate. Le tre `@font-face` dichiarano
pesi 400/500/700 **puntando allo stesso file**: il 700 non esiste. Il sito gira
su **due tagli e mezzo**. ~140 KB di font, di cui **56 KB duplicati** (convivono
`next/font` e un blocco legacy: difetto reale, non stile).

**Nessun `clamp()` in tutto il CSS. Zero occorrenze.** La fluidita' sta sul root:

    html { font-size: 10px !important }                          /* < 768 */
    @media (min-width:768px)  { html { font-size: 1.1111111111vw !important } }
    @media (min-width:1200px) { html { font-size: .5208333333vw !important } }

`0.5208333333vw` di 1920 = esattamente **10px**. Tutta la scala e' in `rem`, i
valori del progetto si scrivono in chiaro (`4.8rem` = 48px) e **un solo numero
governa l'intero sistema tipografico**.

Scala misurata a 1920: 320 display · 100 mono maiuscolo (marcatori di sezione) ·
48 titolo · 36 headline · 24 occhiello · 18 corpo (interlinea 1.5) · 14/12 mono
per etichette e meta.

Palette: fondo `#F4F2ED`, inchiostro `#111214`, accento `#FF6542`, piu'
`#4F4A3B`, `#999896`, `#8499CA`, `#FAEDBC`.

## Il movimento, e soprattutto cosa NON si muove

**Lenis: configurazione di DEFAULT.** `lerp: 0.1`, `wheelMultiplier: 1`,
`touchMultiplier: 1`, `syncTouch: false`. Non hanno gonfiato niente: il peso
viene dal lerp, non da un moltiplicatore.

**L'inerzia misurata** — un solo evento wheel, deltaY 800:

| tempo | completato |
|---|---|
| 69 ms | 31% |
| 291 ms | 84% |
| 793 ms | 99% |
| ~1240 ms | 100% |

**Una singola rotellata impiega piu' di un secondo a fermarsi.** E' la prova
numerica del "peso".

**Il vocabolario e' minuscolo**: `power3.out` **34 volte**, `power3.inOut` 13, e
poi una occorrenza ciascuno di altre quattro. Durate: `0.6` **23 volte**, poi
1.2, 1.0, 0.8, 1.6, 0.4. Quattro curve CSS dichiarate una volta. La transizione
CSS piu' frequente e' **`1.2s var(--easeOutQuart)`**: un hover che dura 1,2
secondi.

**Il reveal del testo**: SplitType in righe+parole, `.line{overflow:hidden}`,
parole da `y:100%`, `duration: 1.2`, `ease: power3.out`, sfalsate **per riga**
(`n/10`), non per parola. Con `.word{padding-bottom:.14em}` per non tagliare le
discendenti. E **due budget di ritardo diversi**: una funzione controlla se
l'elemento era sotto la piega al caricamento — se si' ritardo corto (l'utente ci
e' arrivato scrollando e sta gia' aspettando), se no coreografia lunga.

### Cosa hanno deciso di NON animare
- **Le fotografie. Mai.** Misurato: fra `scrollY 2000` e `2400`, **0 immagini
  su 31** cambiano offset o transform. Nessun parallasse, nessuno scale, nessuna
  maschera. L'unica cosa: un segnaposto che sfuma in **0,2 s** al caricamento.
- **Nessuno `scrub`, nessun `pin`.** ScrollTrigger e' usato solo come
  sostituto di IntersectionObserver: `{onEnter, start:"top+=20% bottom",
  once:true}`. Niente e' legato alla progressione dello scroll.
- **Nessun cursore custom.** Nel CSS solo `cursor:pointer` (18 volte).
- **Nessun `prefers-reduced-motion`**: zero occorrenze. (Il blog dello
  sviluppatore afferma il contrario: e' smentito dal build.)

Controcorrente, da rubare: la sottolineatura dei link e' **sempre presente** e
all'hover **si ritira** (`scaleX(1) -> scaleX(0)`, origine da `left` a `right`,
0,6 s). Al passaggio del mouse l'elemento diventa piu' leggero, non piu' pesante.

## La transizione fra pagine, misurata al fotogramma
Un velo bianco `position:fixed; z-index:99999` col logo dentro:

| dal click | opacita' | rotta |
|---|---|---|
| 70 ms | 0,58 | `/` |
| 350 ms | 1,00 | `/` |
| ~700 ms | 1,00 | **`/about`** |

**Il velo copre in 0,35 s e il router cambia rotta a 0,7 s, sotto la
copertura.** Le lettere del logo entrano da posizioni parcheggiate con
`power3.out`, `duration: 1.4`.

Sotto c'e' un secondo strato: una **scheda della destinazione** che ridimensiona
in `1.2s easeOutQuart` verso misure diverse per ogni meta — work 679x498
argento, about 736x436 `#4F4A3B`, journal 506x556 nero, contact 826x427 bianco.
**Ogni destinazione ha gia' il suo colore e la sua proporzione prima di essere
caricata: il viaggio ti dice dove stai andando.** Tutte le rotte sono in
prefetch RSC: quando il velo si alza, la pagina e' gia' in memoria.

## Il ritmo — misurato
Home: **esattamente una schermata**, `scrollHeight === innerHeight`. Non scorre.
`/work`: idem. Un caso studio: **14,45 schermate**, e dentro:

| fascia | blocchi di testo |
|---|---|
| 0 | 26 |
| 1 -> 11 | **0** |
| 12 | 4 |

**Tutte le parole stanno nella prima schermata. Poi undici schermate
consecutive senza una sola riga di testo**: solo fotografie, alternate fra
righe a due e piena larghezza, con i rientri che lasciano respirare il fondo.

## Perche' vince pur essendo sobrio
Tre cose, e nessuna e' un effetto. **Il tempo**: 1,2 s di durata standard e
oltre un secondo di inerzia rendono ogni gesto costoso, e quel costo si legge
come qualita'. **La rinuncia**: le fotografie non si muovono, quindi tutto il
movimento residuo diventa leggibile. **La coerenza spinta all'osso**: due
famiglie, due pesi e mezzo, quattro curve, sei durate, un solo `font-size` sul
root. Dietro, la disciplina invisibile — zero host terzi, ISR a 3 secondi,
prefetch di ogni rotta — che fa sembrare istantaneo un sito che si muove lento
apposta.

## Tre cose da rubare
1. **La scala tipografica sul root invece che con `clamp()`.** Un numero
   governa tutto, zero breakpoint tipografici da mantenere.
2. **I due budget di ritardo** (sopra/sotto la piega al caricamento) piu' lo
   stagger **per riga**. E' la differenza fra un reveal e una frase che si
   compone.
3. **Congelare le fotografie e spendere la lentezza altrove.**

## Dichiarazioni dello sviluppatore
Da https://www.hontran.dev/blog/by-kin-case-study-award-winning-website :
*«The new page starts lifting in before the cover has fully cleared, so the eye
never lands on a dead frame.»* · *«Motion had to feel directed, not
decorative.»* · *«A site this motion-dense collapses if every animation is tuned
in isolation.»*

**Due cautele**: gli snippet che pubblica (`expo.inOut`, 0.9 s) **non
corrispondono al bundle in produzione** (`power3.out`, 0.6/1.2) — e'
ricostruzione a posteriori. E l'affermazione sul rispetto di
`prefers-reduced-motion` e' contraddetta dal build.

## Non verificato
Le schede FWA e CSS Design Awards (rivendicate solo dal blog). Lo strato
"scheda della destinazione" in movimento (in headless resta a `opacity:0`).
Il comportamento mobile: misurato solo a 1920x1080, e il sito blocca il
landscape. Core Web Vitals reali.
