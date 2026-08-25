# Lusion

- **URL**: https://lusion.co
- **Premio**: Awwwards Site of the Year 2023 + Site of the Month + Developer Award (assegnati alla versione "Lusion v3", https://www.awwwards.com/sites/lusion-v3 — punteggi: design 8.26, usabilita' 7.95, creativita' 8.65, contenuto 8.26, sviluppo 8.41). Lo studio ha 20 premi Awwwards in totale (https://www.awwwards.com/lusion/). Fonti terze riportano che il sito dello studio ha vinto Site of the Year anche su FWA e CSSDA. **La versione online oggi non e' quella premiata**: e' un rifacimento successivo (footer "©2026 LUSION Creative Studio", progetti fino a Oryzo AI / aprile 2026). Se questa versione abbia vinto qualcosa: `non verificato`.
- **Studio**: Lusion Creative Studio (Lusion Ltd), Suite 2, 9 Marsh Street, Bristol BS1 4AA, UK. Fondato da Edan Kwan nel 2017.
- **Anno**: versione attuale 2026 (copyright nel piede). La versione premiata Awwwards e' del 2023.
- **Letto il**: 13/08/2026

---

## L'ESPERIENZA (integrazione)

> Blocco aggiunto il 13/08/2026 rileggendo il sito con `curl` e WebFetch (home, `/about`,
> `/projects`, `/projects/oryzo_ai`) per rispondere alle domande che servono a un'agenzia e
> che la prima stesura non copriva: di cosa parla, cosa vende, a chi, come e' organizzata la
> persuasione, e cosa arriva a chi non scorre. Le sezioni tecniche piu' sotto restano valide.

### Di cosa tratta il sito, in concreto

Non e' un sito di servizi: e' **una dimostrazione unica lunga 56 schermate**, piu' quattro
pagine di corredo (`/about`, `/projects` con 17 lavori, le pagine dei singoli progetti,
`labs.lusion.co`). La home contiene, nell'ordine: una frase che dice cosa fanno, un
giocattolo 3D che risponde al puntatore, un video showreel, l'elenco di dieci lavori, due
paragrafi di posizionamento, **44 schermate di volo dentro un tunnel spaziale senza una
parola di vendita**, un invito, i contatti.

Il rapporto e' questo: **su 56 schermate, meno di 8 contengono argomenti di vendita.** Le
altre 48 sono la prova, e la prova non e' descritta — e' eseguita addosso al visitatore.

### Cosa vende, e qual e' l'obiettivo finale

**Dichiarato** (titolo hero, testuale):
> We create 3D visual storytelling and interactive web experiences that help brands stand out

**Vero:** un posto nella lista corta di 3-4 studi che un direttore marketing considera
quando ha un lancio grosso e un budget a sei cifre. Il sito non prova a chiudere una
vendita: prova a rendere impossibile fare la gara senza invitarli.

**L'obiettivo di conversione, verificato nel markup, e' una sola cosa: far partire una mail
a `hello@lusion.co`.** Il pulsante "LET'S TALK" dell'header, la voce "Let's talk" del
pannello menu e il titolo della sezione finale sono tutti e tre un
`<a href="mailto:hello@lusion.co">` nudo, senza oggetto precompilato e senza corpo.
**Non esiste un modulo di contatto in tutto il sito.** L'unico `<form>` presente e'
l'iscrizione alla newsletter (un solo campo, `name="EMAIL"`), ripetuto due volte: nel
pannello menu e nel piede.

E `lusion.co/contact` **non e' una pagina**: risponde con byte identici alla home (58.598 B,
verificato con `cmp`). "Contact" nel menu e' un `data-scroll-to="contact"`, cioe' un
comando che porta in fondo alla pagina in cui gia' ti trovi.

**Obiettivo secondario, non dichiarato ma strutturale:** essere premiato e condiviso. Sulle
pagine progetto i riconoscimenti sono link espliciti ("FWA SOTM", "Awwwards SOTD"), e il
progetto piu' recente in home e' un lavoro autoprodotto — Oryzo AI — che esiste solo per
essere guardato.

### A chi si rivolge

Al direttore creativo o marketing di un marchio globale, e all'agenzia (AKQA, Nexus sono
fra i loghi mostrati) che cerca un esecutore tecnico per la parte che non sa fare.
Il compratore **sa gia' cosa vuole** e non ha bisogno che gli si spieghi cos'e' il WebGL:
la sua paura non e' "sara' bello?", e' **"reggera' il traffico del lancio e sara' pronto per
la data?"**. Per questo il sito non spiega niente e si limita a girare senza rompersi per
cinquanta schermate: e' la risposta a quella paura specifica.

### L'esperienza progettata, passo per passo, e con che ritmo

| momento | schermate | cosa succede | ritmo |
|---|---|---|---|
| **Cancello** | — | schermo nero, percentuale che rulla, barra. Non si salta | sospensione forzata, lunga |
| **Promessa** | 0 → 1 | la frase di posizionamento, il giocattolo 3D che reagisce al puntatore, "scroll to explore" | fermo, invito a toccare |
| **Riformulazione + reel** | 1 → 3 | "Bold Ideas, Brought to Life" a 144px, il sommario dei servizi, il video | accelera |
| **Prova per nomi** | 3 → 6,7 | "Featured Work", dieci progetti con tag e marchi (Porsche, Meta, Devin AI) | scorrimento veloce, elenco |
| **Manifesto** | ~7 | "Where Creative Ideas Become Immersive Experiences" + il paragrafo sul metodo | ultimo testo argomentativo |
| **Dimostrazione pura** | 7 → 51 | il tablet che si apre in tunnel, 23 schermate di volo, il vetro che si rompe, l'astronauta che cade | **44 schermate senza una parola di vendita** |
| **Chiamata** | ~51 | "Is Your Big Idea Ready to Go Wild?" / "Let's work together!" | stacco netto |
| **Contatti** | ~54,5 | indirizzo fisico, social, due email, newsletter | pagina normale |
| **Gancio** | 55,8 | "Keep Scrolling to Learn More → About Us" con barra che si riempie | il sito non finisce: continua |

La sequenza e' quella di un trailer: **titolo, promessa, prove, poi la scena grossa** — con
la differenza che qui la scena grossa dura l'86% della durata.

### Cosa deve fare il visitatore, e dove lo portano

Le azioni richieste sono pochissime e tutte facoltative tranne una:

1. **Aspettare** (obbligatorio, il preloader e' bloccante).
2. **Spingere le croci 3D col puntatore** — nessuno glielo dice, si scopre muovendo il mouse.
3. **Scorrere.** E' l'unico verbo del sito: `scroll to explore`, `CONTINUE TO SCROLL`,
   `Keep Scrolling to Learn More`.
4. **Cliccare "Play Reel"** → overlay video Vimeo.
5. **Cliccare un progetto** → pagina con descrizione breve, servizi, link ai premi, link al
   progetto vero.
6. **Cliccare "LET'S TALK"** → si apre il client di posta.

Il percorso "buono" non e' verso un modulo: **e' verso il basso, e poi verso la pagina
successiva.** Chi scorre oltre il piede entra in About senza aver cliccato niente. Il sito
e' progettato come un nastro continuo, e la conversione e' un'uscita laterale sempre
disponibile (l'header non sparisce mai) invece che un traguardo in fondo.

### Come e' organizzata la persuasione

| leva | dove sta | in quante schermate dall'inizio |
|---|---|---|
| **Promessa** | titolo hero, una frase | **0** |
| **Riformulazione** | sommario reel (design, motion, 3D, development) | 2 |
| **Prova visiva** | il giocattolo 3D che risponde | 0 (immediata) |
| **Prova per nomi** | dieci titoli di progetto con i marchi dentro | 3-6,7 |
| **Differenziazione** | "We do not chase trends…" | ~7 |
| **Prova pesante** | 44 schermate di tunnel | 7-51 |
| **Chiamata all'azione** | "Is Your Big Idea Ready to Go Wild?" | ~51 |
| **Contatti** | piede | ~54,5 |
| **Chiamata sempre presente** | "LET'S TALK" nell'header | sempre |
| **Prezzo** | **assente ovunque** | — |

Sul prezzo: non c'e' un listino, non c'e' un "a partire da", non c'e' una durata tipica di
progetto, non c'e' la dimensione della squadra. **Il prezzo e' comunicato dal costo del
sito stesso**: 24 MB scaricati, un preloader di decine di secondi, un motore 3D scritto in
casa. Chi ha un budget da 5.000 euro capisce da solo di essere nel posto sbagliato, e
questo e' esattamente il lavoro che il preloader fa.

Il blocco "chiamata + piede" e' **ripetuto identico su ogni pagina** (verificato su home,
`/projects`, `/projects/oryzo_ai`): qualunque sia il percorso, si finisce sempre sullo
stesso invito e sulle stesse due email.

### Cosa arriva a chi NON scorre fino in fondo

Distinguendo tre livelli di abbandono:

- **Chi chiude durante il preloader**: **zero.** Nessun testo, nessun marchio, nessun
  contatto. E' il rischio piu' grosso del sito, ed e' accettato consapevolmente.
- **Chi si ferma alla prima schermata** (il caso piu' frequente): riceve **il messaggio
  completo.** La frase di posizionamento e' intera, la prova di abilita' e' gia' sotto il
  puntatore, e "LET'S TALK" e' in alto a destra. Da questo punto di vista la home e'
  costruita bene: **la promessa non e' rimandata.**
- **Chi si ferma prima della schermata 51**: non vede mai la chiamata all'azione esplicita.
  Gli resta l'header.

Ma c'e' un buco preciso, e vale la pena scriverlo: **i nomi dei clienti grossi e il conto
dei premi non sono in home.** Coca-Cola, Apple, Google, Sony, NVIDIA, Stanford, Calvin
Klein, Max Mara, Hyundai, Wallpaper, AKQA, Nexus Studios e i "58 Awwwards" stanno **solo su
`/about`**, cioe' dietro un clic che la maggioranza non fa. In home i marchi compaiono
soltanto dentro i titoli dei progetti ("Porsche: Dream Machine", "Meta: Spatial Fusion").
La prova sociale piu' forte che hanno e' la cosa piu' nascosta del sito.

### Come costruiscono la fiducia (e' questo il prodotto)

- **Clienti**: muro di 15 loghi su `/about` — Coca-Cola, Max Mara, Calvin Klein, Porsche,
  Wallpaper, Hyundai, Google, Apple, Webby Awards, Stanford, Sony, Awwwards, NVIDIA, AKQA,
  Nexus Studios. Nessuna testimonianza, nessuna citazione di un cliente, nessun numero di
  risultato (niente conversioni, niente visite, niente vendite).
- **Premi**: contati e impaginati come una specifica tecnica, in IBM Plex Mono con lo zero
  davanti — `58 Awwwards`, `001 Site of the Year`, `001 Developer Site of the Year`,
  `001 Site of the Month`, `010 Site of the Day`, `016 Honorable Mention`, piu' FWA, CSSDA,
  Webby, Lovie, Drum, CommArts. La forma da bollettino fa sembrare i premi **dati**, non
  vanti.
- **Processo**: **non c'e' un metodo per fasi.** Nessun "come lavoriamo in 5 passi", nessun
  tempo, nessun kick-off, nessun deliverable. Al suo posto ci sono quattro aree di
  competenza con cinque voci ciascuna: **Strategy** (Digital Experience Strategy, Technology
  Strategy, Creative Direction, Discovery, Research) · **Creative** (Art Direction, UX/UI
  Design, Motion Design, Interactive Design, Illustration) · **Tech** (WebGL Development,
  Front End Development, Unity/Unreal, Interactive Installations, AR and VR Experiences) ·
  **Production** (Procedural Modeling, 3D Asset Creation, 3D Optimization, Animation, 3D
  Pipeline Development). E' un elenco di **cosa sanno fare**, non di **come lo fanno**: la
  scommessa e' che il compratore di questa fascia il processo lo conosce gia'.
- **Persone**: una sola, e messa in evidenza — `001 Edan Kwan · Cofounder & Creative
  Director`. Lo studio ha una faccia, non un organigramma.
- **Autoprodotto come prova**: Oryzo AI, dichiarato senza giri di parole —
  *"a self initiated project by Lusion built around a deliberately ridiculous idea:
  presenting a simple cork coaster as a serious AI era product launch."* Serve a dire "il
  livello lo teniamo anche senza un cliente che paga".
- **Contatti**: due indirizzi separati, ed e' una scelta di qualificazione —
  `hello@lusion.co` (general enquires) e **`business@lusion.co` (new business)**. Chi ha un
  budget viene indirizzato altrove rispetto a chi fa domande.

### I testi veri principali

> **We create 3D visual storytelling and interactive web experiences that help brands stand out**

> scroll to explore

> **Bold Ideas, / Brought to Life**
> We combine design, motion, 3D, and development to create digital experiences that feel visually striking and technically seamless. From campaign launches to immersive brand worlds, we build work that captures attention and invites interaction.

> **Featured Work**
> A selection of immersive digital experiences created for ambitious brands and forward thinking teams.

> **Where Creative Ideas Become Immersive Experiences**
> We do not chase trends or produce work that looks like everyone else. We focus on creating visually distinctive digital experiences that reflect your brand, engage your audience, and make people remember what they saw. Our process blends creative direction, 3D craft, and interactive development to build tailored digital journeys that feel original, polished, and built for impact.

> Step into a new world and let your imagination run wild  *(dentro il tunnel)*

> **Is Your Big Idea Ready to Go Wild?** / **Let's work together!**

> CONTINUE TO SCROLL — Keep Scrolling to Learn More — About Us — Next Page

Dalla pagina About:

> **WE ARE A CREATIVE PRODUCTION STUDIO CRAFTING UNIQUE DIGITAL EXPERIENCES**
> A worldwide team of specialists in design, motion, 3D, and technology working together to turn ambitious ideas into immersive digital experiences.
> We combine different disciplines into one creative production process, allowing ideas to move from concept to execution with clarity and craft. The result is digital work that feels distinctive, technically refined, and built to make a lasting impact.
> 001 Edan Kwan — Cofounder & Creative Director

Piede (su ogni pagina):

> General enquires — hello@lusion.co · New business — business@lusion.co
> Subscribe to our newsletter · ©2026 LUSION Creative Studio · Built by Lusion with ❤️

Meta (quello che arriva a chi vede solo il link condiviso):

> Lusion - Award Winning 3D and Interactive Web Studio
> We design and produce 3D visual storytelling, immersive websites, and interactive digital experiences that help brands stand out online.

---

## Cosa vende

Produzione di esperienze web in 3D real-time: siti WebGL, lanci di campagna, mondi di marca interattivi. Non vendono "design": vendono la capacita' tecnica di far girare a 60fps in un browser roba che sembra un rendering offline. Il sito e' il portfolio e insieme la dimostrazione.

## A chi

Marketing director e creative director di marchi globali (Porsche, Meta, Coca-Cola, Google fra i clienti citati) che hanno un budget per un lancio e vogliono qualcosa che venga premiato e condiviso. Chi esce dal sito deve pensare: "questa roba qui non la sa fare quasi nessun altro, e non si e' rotta mentre la guardavo".

## Idea regista

Il sito e' un unico volo continuo: si parte da una pila di croci 3D nel bianco e si finisce, senza stacchi, dentro un tunnel spaziale nero dove cade un astronauta — il 79% dello scroll della home e' quel tunnel.

## Il momento

C'e', ed e' lunghissimo. Nella sezione `#home-goal` un'immagine dentro un mockup di tablet (un astronauta sopra la Terra) si ingrandisce fino a riempire lo schermo e diventa la bocca di un tunnel: da li' in poi si vola in avanti dentro una struttura di travi e greeble mentre un astronauta ruota al centro dell'inquadratura, poi la scena passa al bianco, la cornice si spacca (vetro rotto) e l'astronauta cade.

Dove cade, misurato a 1440x900: `#home-goal` parte a 6.043 px di scroll e dura 39.855 px, cioe' **44,3 schermate su 55,8 totali della home**. La sequenza interna e' un timeline a pesi letta dal codice (`GoalSectionRanges.itemList`):

| tappa | peso | quota della sequenza |
|---|---|---|
| `blackFrameShow` | (a pixel fissi) | apertura della cornice nera |
| `blackFrameIn` | 1 | 4,4% |
| `blackTitle` | 5 | 22,2% |
| `blackTunnel` | 12 | 53,3% |
| `whiteTunnel` | 2 | 8,9% |
| `whiteFrameOut` | 1 | 4,4% |
| `whiteFrameBreak` | 1,5 | 6,7% |
| `astronautDrop` / `astronautWait` | (a pixel fissi) | coda |

Peso totale 22,5. Quindi il solo volo nel tunnel nero vale circa 23 schermate di scroll.

## Struttura, sezione per sezione

Misure reali prese dal DOM (`offsetTop` e altezza del box). Desktop = viewport 1440x900; mobile = iPhone 13, 390x664.

| sezione | cosa mostra | cosa fa l'utente | schermate desktop | schermate mobile |
|---|---|---|---|---|
| `#home-hero` | titolo + riquadro 3D con ~24 croci di plastica/pietra che si accatastano | spinge le croci col puntatore (su telefono: inclina il telefono) | 1,0 | 1,0 |
| `#home-reel` | titolo "Bold Ideas, Brought to Life" a 144px, descrizione, blocco video showreel in duotone | clicca "Play Reel" → overlay Vimeo | 2,0 | 1,3 |
| `#home-featured` | "Featured Work" + elenco di 10 progetti con tag e anteprima | passa sopra le voci, clicca | 3,7 | 5,6 |
| `#home-goal` | il titolo, i due paragrafi di posizionamento, poi tutta la sequenza tunnel | scrolla e basta | **44,3** | **44,0** |
| `#end-section` | "Is Your Big Idea Ready to Go Wild?" + "Let's work together!" | clicca per aprire il contatto | 3,5 | 3,5 |
| `#footer-section` | indirizzo, social, due email, iscrizione newsletter | compila la mail | 1,0 | 1,0 |
| `#scroll-nav-section` | "Keep Scrolling to Learn More" + barra "Next Page → About Us" | continua a scrollare e passa alla pagina dopo | 0,3 | 0,4 |
| **totale** | | | **55,8** (50.262 px) | **56,8** (37.714 px) |

Nota strutturale: il piede non e' la fine. Sotto c'e' `#scroll-nav-section` con una barra che si riempie (verde `#c1ff00`) e la scritta "CONTINUE TO SCROLL": se si insiste, si entra nella pagina About senza aver mai cliccato un link.

## L'esperienza in ordine di tempo

**Preloader (gate duro, non si salta).** La prima cosa e' uno schermo nero pieno: fondo `#000`, un contatore percentuale enorme in basso a sinistra (`#preloader-percent-digits`, 6 cifre che rullano, 13vw su mobile) e una barra di avanzamento orizzontale al centro schermo. Il sito non appare finche' il caricamento non e' completo. Il caricatore e' pesato per risorsa (`quick-loader` di Edan Kwan, ogni item ha un `weight`; la texture del blue noise ne pesa 55, la SMAA area map 32), quindi la percentuale avanza in modo proporzionale al costo reale, non al numero di file.

Quanto duri su una macchina normale: `non verificato`. Le mie due misure sono inquinate (macchina con altri browser WebGL aperti in parallelo, GPU Intel integrata): 71 s su desktop e 55 s su emulazione mobile. Sono numeri da non citare come rappresentativi; dicono pero' che il gate esiste e che il budget di byte prima del primo fotogramma e' alto.

**Primi 10 secondi dopo il preloader.**
1. Compare il fondo lavanda `#f0f1fa` con il titolo nero in Aeonik in alto a sinistra dell'area centrale.
2. Il riquadro scuro (angoli arrotondati 20px) contiene la pila di croci 3D. Le croci cadono e si assestano con fisica propria; il puntatore le spinge via.
3. In basso, la riga "SCROLL TO EXPLORE" fra quattro segni `+` (su telefono ne restano due).
4. Header: logo LUSION a sinistra (svg con `mix-blend-mode: exclusion`, cosi' resta leggibile sia sul bianco sia dentro il tunnel nero), a destra tre controlli — audio, pillola scura "LET'S TALK", pillola chiara "MENU ••".

**Poi, a blocchi.**
- Scroll → il titolo del reel entra riga per riga, il blocco video si allarga; il video e' colorato in duotone con l'accento della sessione.
- Elenco progetti: dieci voci, ognuna con la riga di tag ("web • design • development • 3d") e il nome.
- Sezione goal: entra un nastro 3D (un tubo che serpeggia dietro e davanti alla tipografia, ho misurato azzurro in una sessione e blu in un'altra), poi il mockup del tablet, poi il tunnel.
- Tunnel: il fondo passa a `#000`, il testo dell'header diventa bianco, si vola. Effetti visibili: aberrazione cromatica ad arcobaleno sui bordi dell'inquadratura, scintille cyan, poi un reticolo al neon magenta/cyan.
- Uscita: cornice bianca, vetro che si rompe, astronauta che cade, "Is Your Big Idea Ready to Go Wild?".

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| scroll di tutta la pagina | `transform` su `#page-container` | ruota / trascinamento | smorzamento esponenziale `1-exp(-k*dt)`, `wheelEaseCoeff = 12` | scroll virtuale scritto in casa (classe `ScrollPane`), non Lenis ne' Locomotive. `overflow: hidden` sul body |
| inerzia da trascinamento (telefono e drag desktop) | velocita' residua dopo il rilascio | stato del puntatore | attrito interpolato fra `frictionCoeffFrom = 2.1` e `frictionCoeffTo = 1.9`, pesato sulla velocita' / `viewSizePixel` / 5 | la velocita' di rilascio e' media pesata sugli ultimi 0,1 s (`dragHistoryMaxTime`) |
| tutto lo smorzamento "morbido" (camera, valori scalari, vettori) | posizione che insegue un bersaglio | tempo | **second order dynamics** (classe `SecondOrderDynamics`), default f=1.5, z=0.8, r=2 | e' la molla di Ryan Juckett: risponde con anticipo e sovraelongazione invece del solito lerp |
| croci 3D dell'hero | caduta, collisioni, spinta | fisica a tempo + puntatore | `MOUSE_RADIUS = 0.025`, `MOUSE_INFLUENCE = 0.1`, `MOUSE_PUSH_FORCE = 0.12` | motore scritto in casa (`HomeBalloonsPhysics`, `HomeBalloonsBody`), nessuna libreria di fisica nel bundle |
| tunnel intero | avanzamento della camera, stato dei materiali, rottura del vetro, caduta dell'astronauta | **scroll**, tramite un timeline a pesi | fit lineari su intervalli (`math.fit`, `math.saturate`) | vedi la tabella dei pesi sopra |
| nastro 3D nella sezione goal | un tubo che passa dietro e davanti alla tipografia | scroll | non verificato | classe `Line`; **su mobile non viene nemmeno costruito** |
| pillole CTA ("Our Approach", "See all projects") | un pallino nero si ingrandisce 20-32 volte e riempie la pillola di blu `#1a2ffb` | hover CSS | `transform` + `background` con `cubic-bezier(.35,0,0,1)`, 0.5s con 0.3s di ritardo | pura CSS, nessun JS |
| voci del menu | pillola di sfondo `#0016ec` che scala da 0.85 a 1 | hover CSS | `.4s cubic-bezier(.4,0,.1,1)` | |
| barra dello scroll a destra | altezza proporzionale, opacita' che sale a 1 quando si scrolla e torna a 0 dopo 0,5 s di fermo | scroll + tempo | rampa lineare a velocita' 2/s, altezza minima 20% | |
| distorsione "screen paint" | scia del puntatore che deforma l'immagine | posizione del puntatore | shader di post-produzione | `ScreenPaint` + `ScreenPaintDistortion`, con curl noise (`screenPaintCurlScale: .02`, `curlStrength: 3`, `distortionRGBShift: .5`) |
| cifre del preloader | rullo verticale su ogni cifra | avanzamento del caricamento | non verificato | il markup ha 6 span di cifre |

**Librerie riconosciute**: three.js r158 (stringa `REVISION="158"` nel bundle). **Non** ci sono GSAP, Lenis, Locomotive Scroll, Barba, cannon/rapier/matter, React, Vue o Svelte: ho cercato tutti questi nomi nel bundle e non compare nessuno. Tweening, scroll, fisica e transizioni di pagina sono tutti codice loro.

## Colori

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo | `#f0f1fa` (`--color-off-white`) | fondo di tutto il sito. **Il JS legge questa variabile CSS e la usa come clear color di WebGL** (`bgColorHex = getComputedStyle(:root).getPropertyValue('--color-off-white')`), cosi' DOM e canvas non possono divergere |
| fondo alternativo | `#000000` (`--color-black`) | dentro il tunnel e su tutta la pagina About: `properties.bgColor.setStyle(blackColorHex)` quando la sezione riempie lo schermo |
| testo | `#000000` | colore di `#ui` |
| superficie chiara | `#ffffff` (`--color-white`) | fondo del piede (`#footer-bg`), fondo del body sotto il canvas, titolo dentro il tunnel |
| accento (variabile a ogni caricamento) | uno fra `#061dfb`, `#ADFF00`, `#f6000e`, `#7e09f5`, `#ffc000` | colore delle croci 3D colorate e del duotone del video reel. E' scelto a caso: `COLORS[Math.floor(Math.random()*COLORS.length)]`, sovrascrivibile con `?BALLOON_COLOR=...` |
| accento fisso, interfaccia | `#0016ec` (`--header-color`) | fondo del pannello menu aperto, hover di "Let's talk", pillola di hover delle voci di menu |
| accento fisso, azioni | `#1a2ffb` (`--color-blue`) | riempimento in hover delle CTA "Our Approach" / "See all projects" e del pulsante di play |
| verde | `#c1ff00` (`--color-green`) | barra di avanzamento "Next Page" in fondo alla pagina, pagina Playground |
| pillola scura | `#2b2e3a` (`--color-grey-blue`) | fondo di "LET'S TALK" |
| pillola chiara | `#e4e6ef` (`--color-dark-white`) | fondo di "MENU" |
| atmosfera Terra | `#4169E1` | uniform `u_atmosphereColor` del pianeta in fondo al tunnel |
| errore | `#e90000` (`--color-error`) | messaggi del modulo newsletter |
| dichiarati ma non li ho visti in uso | `#ff4c41` (`--color-red`), `#8832f7` (`--color-purple`), `#071bdf` (`--color-dark-blue`), `#f0f` (logo dettaglio progetto) | zero occorrenze di `var(--color-red)` / `var(--color-purple)` nel CSS |

## Tipografia

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| tutto il corpo, h1-h4, button, input | Aeonik | 400 | ereditato | 1.15 su html | grottesca geometrica commerciale |
| titolo hero `#home-hero-title` | Aeonik | 400 | **2.5vw** desktop (36px a 1440) → **6vw** mobile | 1.1 | su telefono passa da 5 colonne su 12 a tutta la larghezza |
| titolo reel `#home-reel-title` | Aeonik | 400 | **10vw** desktop (144px a 1440) → **13.8vw** mobile | 1.0 | `letter-spacing: -.02em`, `left: -.03em` per allineare otticamente il bordo |
| titolo goal `#home-goal-title` | Aeonik | 400 | **8vw** desktop (115px a 1440) → **10vw** mobile | 1.0 | `letter-spacing: -.01em`, `left: -.068em`, larghezza fissata a `11em` |
| titolo "Featured Work" | Aeonik | 400 | `clamp(7em, 8vw, 20em)` → **15vw** mobile | 0.9 | `margin-left: -.07em` |
| titolo dentro il tunnel | Aeonik | 400 | 6vw | — | maiuscolo, bianco |
| numeri, etichette tecniche | IBM Plex Mono | 400 / 500 | — | — | numeri di progetto, numeri della squadra, categorie premi |
| lettere decorative | LusionMono (font proprietario) | 400 | — | — | lettere delle card "capability" nella pagina About, testo della pagina Playground |

**Come sono serviti**: file locali su `lusion.co/assets/fonts/`, woff2 con ripiego woff, sei file per 185 KB totali. Nessun servizio esterno (niente Google Fonts, niente Adobe). `font-display: block` su tutte e sei — scelta coerente col preloader: siccome la pagina e' comunque nascosta, non c'e' motivo di mostrare un ripiego. Nessuna famiglia variabile: sono istanze statiche separate (Regular, Medium, RegularItalic).

## Testi veri

**Titolo hero**
> We create 3D visual storytelling and interactive web experiences that help brands stand out

**Sotto l'hero**
> scroll to explore

**Titolo reel** (due righe distinte nel markup)
> Bold Ideas,
> Brought to Life

**Sommario reel**
> We combine design, motion, 3D, and development to create digital experiences that feel visually striking and technically seamless. From campaign launches to immersive brand worlds, we build work that captures attention and invites interaction.

**Sezione progetti**
> Featured Work
> A selection of immersive digital experiences created for ambitious brands and forward thinking teams.

I dieci progetti, con i loro tag testuali:
> concept • web • design • development • 3d • animation — Oryzo AI
> web • design • development • 3d • animation — Of The Oak
> web • design • development • 3d — Devin AI
> concept • 3D illustration • mograph • video — Porsche: Dream Machine
> web • design • development • 3d — Synthetic Human
> web • design • development • 3d — Meta: Spatial Fusion
> web • design • development • 3d • web3 — Spaace - NFT Marketplace
> web • design • development • 3d — DDD 2024
> concept • web • game design • 3d — Choo Choo World
> AR • development • 3d — Soda Experience

**Sezione goal**
> Where Creative Ideas Become Immersive Experiences
> We do not chase trends or produce work that looks like everyone else. We focus on creating visually distinctive digital experiences that reflect your brand, engage your audience, and make people remember what they saw. Our process blends creative direction, 3D craft, and interactive development to build tailored digital journeys that feel original, polished, and built for impact.

**Titolo dentro il tunnel**
> Step into a new world and let your imagination run wild

**Chiusura**
> Is Your Big Idea Ready to Go Wild?
> Let's work together!
> CONTINUE TO SCROLL

**Menu e chiamate all'azione**
> Menu / Close / Let's talk / Home / About us / Projects / Contact / Labs / back
> Our Approach / See all projects / Play Reel / PLAY / MUTE
> Subscribe to our newsletter

**Navigazione in fondo**
> Keep Scrolling to Learn More
> About Us
> Next Page

**Piede**
> Suite 2 9 Marsh Street Bristol, BS1 4AA United Kingdom
> Twitter / X — Instagram — Linkedin
> General enquires — hello@lusion.co
> New business — business@lusion.co
> Subscribe to our newsletter
> ©2026 LUSION Creative Studio
> R&D: labs.lusion.co
> Built by Lusion with ❤️

**Meta**
> Lusion - Award Winning 3D and Interactive Web Studio
> We design and produce 3D visual storytelling, immersive websites, and interactive digital experiences that help brands stand out online.

## Mobile

La sezione piu' importante, perche' qui Lusion fa il contrario di quello che fa quasi tutti: **non taglia l'esperienza, la ridimensiona**. Il tunnel, l'astronauta, il vetro che si rompe: c'e' tutto anche sul telefono (verificato: sequenza completa in emulazione iPhone 13). Quello che cambia sono i pixel e i byte.

Il confine e' 812px, dichiarato due volte e tenuto in sincrono: `MOBILE_WIDTH = 812` nel JS (`useMobileLayout = innerWidth <= settings.MOBILE_WIDTH`) e `@media (max-width: 812px)` nel CSS (129 blocchi). Esiste anche `IS_SMALL_SCREEN = Math.min(screen.width, screen.height) <= 820`, basato sullo **schermo** e non sulla finestra. La distinzione "mobile" per il 3D e' invece per user agent (`isMobile = detectUA.isMobile || detectUA.isTablet`): un tablet e' trattato come telefono.

### Cosa SPARISCE
- **L'audio, tutto.** `USE_AUDIO = browser.isSupportOgg && !browser.isMobile`. Nessun file `.ogg` viene caricato, e il pulsante audio dell'header e' `display: none`.
- **Due croci di vetro su ventiquattro.** L'array dei materiali della pila 3D ha 22 voci di base; le ultime due, entrambe `isSemitransparent: true` con materiale GLASS, vengono aggiunte solo con `browser.isMobile || sphereData.push(...)`. Su telefono la scena e' 22 oggetti e nessuna rifrazione.
- **Il nastro 3D della sezione capability (pagina About).** Non viene proprio istanziato: `browser.isMobile || (this.lineVisual = new Line(2), ...)`. Non e' nascosto, e' assente dalla scena.
- **La convoluzione del bloom.** `USE_CONVOLUTION` e `USE_HD` valgono `!isMobile`: su telefono il bloom gira in versione economica.
- **Un terzo delle particelle dell'hero About.** `SIM_TEXTURE_HEIGHT` passa da 192 a 128 (la larghezza resta 128), cioe' da 24.576 a 16.384 particelle.
- **Elementi decorativi dell'interfaccia**: due dei quattro segni `+` sotto l'hero, le croci attorno al blocco video, il titolo "Play Reel", la linea a croce della navigazione in fondo, le informazioni di testata nelle pagine progetto.
- **Le etichette testuali dei pulsanti.** "Menu" e "Close" spariscono; restano solo i due pallini. Le pillole "LET'S TALK" e "MENU" si riducono a cerchi da `3.2em`, e "Let's talk" si sposta dentro il pannello del menu (`#header-menu-talk { display: flex }`).

### Cosa viene SOSTITUITO
- **La risoluzione di rendering. Questa e' la leva grossa.** `DPR = Math.min(1.5, window.devicePixelRatio)`. Misurato su iPhone 13 (390x664 CSS, devicePixelRatio 3): il canvas ha un buffer di **585x996**, cioe' esattamente 1,5x. Sono 583.000 pixel invece dei 2.330.000 del nativo: **un quarto dei pixel da riempire**. In piu' c'e' un tetto assoluto, `MAX_PIXEL_COUNT = 2560*1440 = 3.686.400`, applicato mantenendo il rapporto d'aspetto: su un desktop 2560x1440 a devicePixelRatio 2 il conto darebbe 3840x2160, ma viene riportato a 2560x1440.
- **La geometria.** `home/cross.buf` (282.676 byte) → `home/cross_ld.buf` (123.984 byte), −56%.
- **Il matcap.** `home/matcap.exr` (602.702 byte) → `home/matcap_ld.exr` (172.380 byte), −71%.
- **Le texture del tunnel.** `tunnels/stickers.png` (409.573 byte) → `tunnels/stickers_low.png` (258.457 byte), −37%.
- **Tutti i video e tutte le immagini di progetto**, per sostituzione di stringa nel percorso: `filename.replace('/video', '/mobile_video')` e `filename.replace('/image', '/mobile_image')`. Il video del reel: `reel/desktop.mp4` (4.980.580 byte) → `reel/mobile.mp4` (2.267.388 byte), −54%.
- **Il controllo della camera.** Su desktop la camera segue il puntatore (e c'e' un `OrbitControls` per la modalita' di sviluppo). Su telefono viene creato un `DeviceOrientationControls` con quaternioni interpolati: **la scena si inclina muovendo il telefono**. E' l'unica interazione "puntatore" possibile e l'hanno rimpiazzata invece di eliminarla.
- **Lo scroll.** Su telefono e' trascinamento con inerzia, con blocco della direzione (`isDragScrollingX = |deltaX| > |deltaY|`).
- **La griglia.** Da 12 a 6 colonne (`--grid-space` si ricalcola, `.project-list` passa a `repeat(6, ...)`), `--grid-gap` da 2vw a 4vw, `--base-padding-x` da `max(5vw, 40px)` a `max(6vw, 60px)`, `--global-border-radius` da 20px a 15px.
- **La scala tipografica**, ricalibrata verso l'alto in vw perche' 10vw su 390px e' minuscolo: hero 2.5vw→6vw, reel 10vw→13.8vw, goal 8vw→10vw, featured `clamp(7em,8vw,20em)`→15vw, nomi progetto 6.5vw.
- **`100vh`.** Il JS scrive `--vh` a ogni ridimensionamento (`documentElement.style.setProperty('--vh', innerHeight * .01 + 'px')`) e il CSS usa `calc(var(--vh, 1vh) * 100)` — il solito rimedio alla barra degli indirizzi iOS.

### Cosa RESTA
- Tutta la sequenza del tunnel, l'astronauta, la rottura del vetro, la Terra sullo sfondo.
- La pila di croci 3D con la fisica.
- SMAA, screen-paint distortion, blue noise, i passaggi di post-produzione.
- La lunghezza dello scroll: 56,8 schermate su telefono contro 55,8 su desktop. Il tunnel resta 44 schermate. Non hanno accorciato niente.
- L'overlay video Vimeo (con in piu' un pulsante di chiusura dedicato, `#video-overlay__mobile-close-btn`).

### Il conto in byte
Stessa sessione, stesso copione (caricamento + scroll fino in fondo alla home), misurata con Playwright sommando i `content-length`:

| | desktop 1440x900 | mobile iPhone 13 |
|---|---|---|
| risposte HTTP | 118 | 86 |
| byte totali | ~24,1 MB | ~10,5 MB (**−56%**) |
| immagini | 48 richieste / 5,99 MB | 39 richieste / 4,22 MB |
| modelli e texture (xhr: `.buf`, `.exr`) | 40 richieste / 3,31 MB | 18 richieste / 1,06 MB (**−68%**) |
| video | 13,5 MB (il file da 4,98 MB richiesto tre volte a intervalli) | 4,4 MB |
| audio | ~0,5 MB di `.ogg` | zero |
| font | 6 file / 185 KB | 6 file / 185 KB (identico) |

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| generatore del sito | **Astro** | VERIFICATO | i percorsi `/_astro/hoisted.CUO_IjfL.js` e `/_astro/about.CNa9RfUh.css`, piu' `<link rel="sitemap" href="/sitemap-index.xml">` |
| 3D | **three.js r158** | VERIFICATO | stringa `REVISION="158"` nel bundle; classi `WebGLRenderer`, `PMREMGenerator`, `EXRLoader` tutte presenti in chiaro |
| contesto grafico | **WebGL2** con ripiego a WebGL1 | VERIFICATO | `USE_WEBGL2 = true`, `checkSupportWebGL()` prova `getContext('webgl2')` e in caso di fallimento ritenta `webgl`/`experimental-webgl` chiedendo `OES_texture_float` |
| opzioni del renderer | `antialias: false`, `alpha: false`, `xrCompatible: false`, `powerPreference: "high-performance"`, `premultipliedAlpha: false` | VERIFICATO | oggetto `webglOpts` nel bundle |
| antialiasing | **SMAA** in post-produzione (non MSAA hardware) | VERIFICATO | classe `Smaa` + texture `smaa-area.png` / `smaa-search.png`; c'e' anche un `isSupportMSAA = !userAgent.match("version/15.4 ")`, cioe' una lista nera per una versione precisa di Safari |
| catena di post-produzione | SMAA → Bloom → ScreenPaintDistortion → Final → (FSR) → PreUfx → PostUfx | VERIFICATO | ordine dei `postprocessing.queue.push(...)` |
| upscaling | **FSR** (AMD FidelityFX Super Resolution) portato in shader | VERIFICATO che il codice c'e' (classe `Fsr`), **spento per default** | e' istanziato solo se `settings.UP_SCALE > 1`, e `UP_SCALE` non e' fra le proprieta' di `Settings`: e' `undefined` a meno di non passarlo in query string |
| campionamento | **blue noise** | VERIFICATO | texture `LDR_RGB1_0.png`, classe `BlueNoise`, chunk shader `getBlueNoise`, offset randomizzato a ogni frame |
| animazione / easing | codice proprio: `Tween`, `Ease`, `SecondOrderDynamics`, `math.cubicBezier` | VERIFICATO | nessuna traccia di gsap/greensock/tween.js nel bundle |
| scroll | codice proprio: `ScrollPane` / `ScrollManager` con `ResizeObserver` | VERIFICATO | nessuna traccia di lenis/locomotive |
| fisica | codice proprio: `HomeBalloonsPhysics` / `HomeBalloonsBody` | VERIFICATO | nessuna traccia di cannon/rapier/matter/ammo |
| routing fra pagine | codice proprio: `Route`, `RouteManager`, `PageManager`, `TransitionOverlay` | VERIFICATO | classi nel bundle; nessun framework SPA |
| caricatore | **quick-loader** (libreria di Edan Kwan) con pesi per risorsa | VERIFICATO | firma `quickLoader.create()`, `AbstractItem` con `weight` e `loadedWeight` |
| formato geometrie | **`.buf`, formato binario proprietario** (non glTF, non Draco, non meshopt) | VERIFICATO | classe `BufItem` registrata nel loader; 84 riferimenti a `.buf`; zero occorrenze di draco/meshopt/ktx2/basis/glb/gltf |
| formato texture | `.exr` (HDR, via `EXRLoader`), `.webp`, `.png` | VERIFICATO | percorsi nel bundle e nelle richieste di rete |
| video | mp4 progressivo per le texture in scena; **Vimeo** per lo showreel a schermo intero | VERIFICATO | `player.vimeo.com` + `api/oembed.json?...id=761102167` nelle richieste |
| audio | `.ogg`, solo desktop | VERIFICATO | `AUDIO_PATH`, `canPlayType('audio/ogg')`, `USE_AUDIO` |
| font | woff2/woff locali, Aeonik + IBM Plex Mono + LusionMono | VERIFICATO | sei `@font-face` con `src: url(/assets/fonts/...)` |
| hosting HTML | **Netlify** | VERIFICATO | header `Server: Netlify`, `Cache-Status: "Netlify Edge"; hit`, `X-Nf-Request-Id` |
| hosting risorse | dominio separato **lusion.dev**, dietro **Cloudflare** | VERIFICATO | `CDN_PATH = "https://lusion.dev"` attivato solo se `location.hostname == "lusion.co"`; header `Server: cloudflare`, `CF-RAY` |
| analitica | Google Analytics 4 (`G-W2XC5XK9QJ`) | VERIFICATO | tag gtag.js nel `<head>` |
| antispam newsletter | Cloudflare Turnstile | VERIFICATO | 11-12 richieste a `challenges.cloudflare.com` per sessione |
| CMS | nessuno visibile: sito statico, contenuti compilati nel markup | SUPPOSTO | tutte le pagine progetto sono file statici sotto `/projects/...`; nessuna chiamata a un'API di contenuti. Non escludo un CMS a monte usato solo in fase di build |

## Peso e prestazioni

**Byte del guscio, misurati con curl.**

| risorsa | non compressa | in transito (gzip/br) |
|---|---|---|
| `/` (HTML) | 58.598 B | **7.095 B** |
| `/_astro/about.CNa9RfUh.css` | 90.367 B | **14.268 B** |
| `/_astro/hoisted.CUO_IjfL.js` | 1.251.728 B | **305.180 B** |

Un bundle unico da 305 KB compressi, con dentro three.js, la fisica, lo scroll, il router e tutti gli shader. Non c'e' code splitting per pagina: la stessa `hoisted.js` serve home, About, Projects e Playground.

**Sessione completa** (caricamento + scroll fino al piede), somma dei `content-length` osservati:
- desktop 1440x900: **118 risposte, ~24,1 MB**
- mobile iPhone 13: **86 risposte, ~10,5 MB**

**Risoluzione di rendering** (misurata leggendo `canvas.width/height`):
- desktop 1440x900 a devicePixelRatio 1 → buffer **1441x901** (1,3 Mpx)
- mobile 390x664 a devicePixelRatio 3 → buffer **585x996** (0,58 Mpx), cioe' il tetto di 1.5x

**Memoria JS**: `usedJSHeapSize` fra 15 e 20 MB in tutte le prove, prima e dopo aver percorso il tunnel. E' poco, ed e' coerente col fatto che i dati pesanti (geometrie e texture) finiscono in memoria GPU e non nell'heap JS. Non ho misurato la memoria GPU.

**Cache**: le risorse pesanti su `lusion.dev` tornano con `Cache-Control: public, max-age=0, must-revalidate` e `cf-cache-status: DYNAMIC`. Cioe': niente cache lunga sul client e niente cache al bordo Cloudflare. C'e' l'`ETag`, quindi al secondo caricamento i byte non ripassano (304), ma **si paga comunque un giro di rete per ognuna delle ~50-85 risorse**. Su un sito con un preloader bloccante, questa e' l'unica scelta di prestazioni che mi sembra sbagliata.

**Quello che NON ho**: punteggio Lighthouse e dati di campo CrUX. L'API PageSpeed Insights ha risposto `429 Quota exceeded` (quota giornaliera del progetto gia' esaurita da altri usi). I miei tempi di caricamento e i miei FPS sono inutilizzabili come riferimento: la macchina di prova aveva GPU Intel integrata e altri browser con siti WebGL pesanti aperti in parallelo — ho letto 20 FPS su desktop 1440x900 e 36-53 FPS in emulazione mobile, e la sola differenza fra i due numeri (quattro volte meno pixel) e' l'unica cosa che porto a casa da quella misura.

**Nessun `prefers-reduced-motion`**, ne' nel CSS ne' nel JS: zero occorrenze in entrambi i file. Su un sito che e' 44 schermate di volo dentro un tunnel, e' un buco di accessibilita' consapevole.

**Degrado senza WebGL**: `App.initEngine()` costruisce il motore solo dentro `if (properties.isSupported)`. Se il contesto WebGL non si ottiene, il motore semplicemente non parte — e siccome tutti i testi, i titoli e i link sono veri elementi HTML nel documento servito (58 KB di markup, non un guscio vuoto), resta un sito leggibile e navigabile, senza 3D. Non ho verificato se il preloader in quel caso si toglie di mezzo.

**Interruttori di sviluppo lasciati accessibili**: ogni proprieta' di `Settings` si sovrascrive dalla query string (`this.override(new URLSearchParams(location.search))`). Quindi funzionano `?WEBGL_OFF=1`, `?USE_HD=1` (che disattiva il tetto di pixel), `?SKIP_ANIMATION=1`, `?TEST_TUNNEL=1`, `?BALLOON_COLOR=ff0000`, `?JUMP_SECTION=...`, `?LOG=1`, `?SHOW_DETAILS=...`. Non l'ho provato: e' lettura di codice.

## Tre cose da rubare

**1. Il tetto di pixel a due stadi, invece del solito `min(dpr, 2)`.**
Non e' un limite sul devicePixelRatio: sono due limiti in cascata.

```js
DPR = Math.min(1.5, window.devicePixelRatio) || 1;
USE_PIXEL_LIMIT = true;
MAX_PIXEL_COUNT = 2560 * 1440;   // 3.686.400
// al resize:
let w = innerWidth * DPR, h = innerHeight * DPR;
if (USE_PIXEL_LIMIT && w * h > MAX_PIXEL_COUNT) {
  const aspect = w / h;
  h = Math.sqrt(MAX_PIXEL_COUNT / aspect);
  w = Math.ceil(h * aspect);
  h = Math.ceil(h);
}
webglDPR = w / innerWidth;       // il DPR effettivo, tenuto da parte
```

Il primo stadio (1.5) protegge i telefoni ad alta densita': su un iPhone si rende un quarto dei pixel. Il secondo (3,7 Mpx) protegge i monitor grandi, dove il devicePixelRatio e' basso ma i pixel sono comunque tanti. E il rapporto d'aspetto viene mantenuto, quindi non si deforma niente. Il costo di riempimento diventa **limitato superiormente su qualunque dispositivo**, che e' esattamente quello che serve quando il tuo collo di bottiglia sono gli shader e non i triangoli.

**2. Il colore di fondo dichiarato una volta sola, in CSS, e letto dal 3D.**

```js
bgColorHex = getComputedStyle(document.documentElement)
               .getPropertyValue('--color-off-white').trim();
// ...
properties.renderer.setClearColor(properties.bgColor, properties.clearAlpha);
properties.bgColor.setStyle(properties.bgColorHex);
```

Il canvas e il DOM non possono andare fuori sincrono, perche' hanno una sola sorgente di verita': la variabile CSS. Quando la sezione tunnel riempie lo schermo, il codice fa `bgColor.setStyle(blackColorHex)` e il fondo passa a nero **per il 3D e per l'interfaccia insieme** — con il logo che resta leggibile grazie a `mix-blend-mode: exclusion` invece di due varianti di logo da gestire a mano. Rifacibile in mezz'ora su qualunque progetto con un canvas dietro il contenuto.

**3. La coreografia dello scroll come lista di pesi, non come lista di pixel.**

```js
itemList = [
  { id: 'blackFrameShow', isPixelBased: true },
  { id: 'blackFrameIn',   weight: 1   },
  { id: 'blackTitle',     weight: 5   },
  { id: 'blackTunnel',    weight: 12  },
  { id: 'whiteTunnel',    weight: 2   },
  { id: 'whiteFrameOut',  weight: 1   },
  { id: 'whiteFrameBreak',weight: 1.5 },
  { id: 'astronautDrop',  isPixelBased: true },
  { id: 'astronautWait',  isPixelBased: true }
];
```

Le tappe elastiche hanno un `weight` (si spartiscono proporzionalmente lo spazio disponibile, qualunque sia l'altezza dello schermo), quelle che devono durare un tempo fisso hanno `isPixelBased: true`. Ogni pezzo di scena poi legge `getRange('blackTunnel').ratio` e si anima su quel numero fra 0 e 1. E' per questo che la stessa sequenza da 44 schermate funziona identica a 1440x900 e su un telefono 390x664 senza toccare un solo numero: **si riequilibra da sola**. C'e' anche un `SHOW_DEBUG` che disegna la timeline come barra fissa in fondo allo schermo, che e' il modo giusto per non impazzire mentre la si regola.

*(Bonus, sempre meccanica: `SecondOrderDynamics` con f=1.5, z=0.8, r=2 al posto del `lerp` di tutti. Una molla del secondo ordine ha anticipo e sovraelongazione, cioe' fa "peso"; il lerp fa solo "ritardo". E' la differenza fra un oggetto che sembra avere massa e uno che sembra scivolare.)*

## Non verificato

- **La durata reale del preloader** su una macchina normale. Le mie due misure (71 s desktop, 55 s mobile emulato) sono state prese su GPU Intel integrata con altre istanze di Chrome che macinavano siti WebGL in parallelo. Il numero non vale.
- **FPS reali.** Stesso problema. I 20 FPS desktop / 36-53 FPS mobile che ho letto misurano la mia macchina sotto carico, non il sito.
- **Lighthouse e dati di campo CrUX** (LCP, INP, CLS reali): API PageSpeed Insights esaurita, `429 Quota exceeded`.
- **Il comportamento su un telefono vero.** Ho usato l'emulazione iPhone 13 di Playwright: i percorsi degli asset e il DPR sono quelli veri (l'user agent decide), ma i controlli via giroscopio (`DeviceOrientationControls`) non li ho potuti provare, e non so come si comporti Safari iOS con l'EXR e con la catena di post-produzione.
- **Memoria GPU** occupata da geometrie e texture. Ho solo l'heap JS (15-20 MB).
- **Cosa succede davvero senza WebGL.** So che il motore non parte e che il markup e' completo, ma non ho provato a bloccare WebGL per vedere se il preloader si toglie di mezzo.
- **Le altre pagine.** Ho analizzato a fondo solo la home. About, Projects, le pagine progetto e Playground le conosco solo dal codice (esistono le classi `AboutPage`, `ProjectsPage`, `ProjectPage`, `PlaygroundPage` e i loro asset), non le ho percorse.
- **Il numero di versione** di questo rifacimento (v4?) e se abbia ricevuto premi propri.
- **Il CMS**, se c'e'. Il sito servito e' statico; non so cosa ci sia a monte della build.
- **Le curve esatte** di alcune animazioni WebGL (il nastro 3D, l'entrata dei titoli riga per riga): sono dentro gli shader e nei metodi `update`, e leggerle tutte richiedeva piu' tempo di quello che avevo.
- **Il conteggio esatto delle croci dell'hero.** Ne ho contate 24 nella struttura dati (22 senza le due di vetro su mobile), ma non ho verificato che ognuna corrisponda a un oggetto visibile a schermo.
