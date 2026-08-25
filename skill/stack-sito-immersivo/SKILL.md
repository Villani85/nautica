---
name: stack-sito-immersivo
description: Lo stack per costruire siti immersivi di fascia alta - Lenis, GSAP ScrollTrigger, React Three Fiber, shader, tipografia variabile, peso delle immagini - con le trappole gia' pagate e le scelte che decidono se un sito sembra da 3k o da 20k. Usala quando si progetta o si costruisce un sito creativo, quando si deve scegliere se serve un build o basta HTML, e per sapere quali librerie NON usare e perche'.
---

# Lo stack, e la prima domanda da farsi

**Serve un build?** E' la scelta che si fa per prima e che quasi nessuno fa
consapevolmente.

**NO, se** il sito e' una pagina sola, guidata dallo scorrimento, con contenuti
fissi e magari una sequenza di fotogrammi. Li' Vite piu' React piu' TypeScript
aggiungono peso, un passaggio di compilazione e una cartella `node_modules` per
niente. I due demo di questa agenzia sono cosi': un `index.html`, un foglio di
stile, tre script e la libreria GSAP in locale. Si mettono su qualunque
hosting, si aprono senza attese, e fra sei mesi funzionano ancora.

**SI, se** ci sono stati da gestire, molte pagine, un configuratore, dati che
cambiano, o si usa React Three Fiber - che senza React non esiste.

La domanda giusta non e' "cosa e' moderno" ma "questo passaggio in piu' cosa mi
restituisce". Su un sito-vetrina la risposta e' spesso niente.

---

# LENIS — lo scorrimento inerziale

E' la prima cosa da installare su un sito desktop: cambia la percezione di
tutto il resto senza toccare una riga delle animazioni.

**Non confonderlo con `scrub`.** Sono due manopole diverse e vengono scambiate
di continuo: `scrub` di ScrollTrigger e' l'inerzia fra scorrimento e ANIMAZIONE;
Lenis e' l'inerzia dello SCORRIMENTO stesso. Servono insieme, e nessuna sostituisce
l'altra.

## L'aggancio a GSAP: dal ticker, non da scrollerProxy

Versione corrente **1.3.26**. Il codice ufficiale e' questo, e sono quattro
righe:

    const lenis = new Lenis()
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

Le tre cose che non si indovinano:

1. **`gsap.ticker.lagSmoothing(0)` va spento.** Il livellamento del ritardo di
   GSAP introduce uno scarto sulle animazioni legate allo scroll: si vede come
   un ritardo che non si riesce a spiegare.
2. **Niente `autoRaf: true`.** Il ciclo lo guida gia' il ticker di GSAP; averne
   due produce micro-scatti - due cicli che aggiornano la stessa posizione a
   frequenze leggermente diverse.
3. **`scrollerProxy` non serve piu'.** Era la strada di prima ed e' ancora
   sparsa ovunque nelle guide vecchie. Oggi si sincronizza dal ticker, e basta.

Il senso di tutto: far cadere aggiornamento dello scroll e animazioni **nello
stesso blocco di esecuzione**. E' li' che nasce la continuita'; due cicli
separati la rompono anche se ognuno dei due e' perfetto.

## Sul telefono si spegne

iOS ha gia' la sua inerzia, tarata sul dito. Lenis che ci litiga fa peggio del
comportamento nativo. **Lenis vince sulla rotellina del desktop.** Su touch si
lascia il sistema operativo al suo posto.

## Il movimento ridotto lo gestisce da solo

Con `prefers-reduced-motion: reduce` porta il lerp a 1 - lo scorrimento segue
l'input uno a uno - e gli spostamenti programmati saltano al bersaglio invece
di scivolarci. Continua pero' a girare, cosi' la sincronizzazione con canvas e
WebGL non si rompe. E si puo' leggere `lenis.prefersReducedMotion` per adeguare
anche le proprie animazioni.

E' uno dei pochi casi in cui l'accessibilita' arriva gratis: va solo verificata,
non implementata.

---

# GSAP — le trappole gia' pagate

Il repertorio completo sta nel kernel `KERNEL_WEB_IMMERSIVO` del Gem hce 3.0.
Qui stanno solo gli errori che sono costati tempo davvero.

- **`from` con opacita' sul contenuto da leggere e' una bomba a orologeria.**
  Se il trigger non scatta resta una fascia vuota al posto del testo. Sempre
  `fromTo` con `immediateRender: false`.
- **`scrub` come NUMERO, non come `true`.** E' la manopola del peso: 0,1 su
  telefono, 0,5-0,8 su desktop, sopra 1 diventa gomma.
- **Chi disegna e' il tween, non il trigger.** Su una sequenza di fotogrammi,
  disegnare nell'`onUpdate` del ScrollTrigger fa disegnare quando cambia lo
  scroll; disegnare in quello del tween fa disegnare anche mentre lo scrub sta
  recuperando. Col primo, fotogrammi e didascalie si scollano.
- **`gsap.matchMedia` con tre contesti**, non due: desktop, telefono, movimento
  ridotto. E il telefono e' un progetto a parte, non il desktop rimpicciolito.
- **`invalidateOnRefresh: true`** su tutto cio' che dipende da una larghezza o
  un'altezza misurata, o al ridimensionamento i valori restano quelli vecchi.
- **`ScrollTrigger.batch`** per le liste lunghe: un osservatore invece di
  cinquanta.
- **Chi chiede meno movimento non riceve meno sito**: sparisce cio' che parte da
  solo, resta cio' che risponde al dito.

---

# LA SEQUENZA DI FOTOGRAMMI SU TELA

E' la tecnica con cui un oggetto si compone sotto lo scorrimento senza motore 3D
nel browser. Le regole stanno per esteso nella skill
`render3d-in-video-reale`; il riassunto operativo:

- niente elemento `<video>`: su iOS lo spostamento continuo del punto di
  riproduzione singhiozza;
- non tenere decodificati tutti i fotogrammi: 240 immagini 1400x788 sono
  **1,06 GB**. Si decodifica una finestra di fotogrammi vicini;
- precarico a onde: prima il fotogramma 1, poi uno ogni 16, ogni 6, ogni 3;
- il numero di fotogrammi vive in UN posto solo, un manifesto scritto dallo
  script che li genera;
- il telefono vuole un ritaglio suo, fatto in produzione.

---

# IL PESO E' IL VINCOLO VERO

Su un sito a fotogrammi il peso decide tutto, e si guadagna piu' qui che in
qualunque ottimizzazione di codice.

- **AVIF invece di WebP.** A parita' di resa taglia parecchio. Da adottare sui
  nostri 240 fotogrammi per atto, oggi salvati in WebP a qualita' 76.
- **`decoding="async"` e `decode()`** prima di disegnare.
- **Font in locale** con Fontsource invece che da un dominio esterno: un
  collegamento in meno da negoziare e nessuna dipendenza da terzi.

---

# COSA NON USARE, E PERCHE'

**Le librerie di componenti gia' animati** - Aceternity UI, Magic UI, React
Bits - e **Vanta.js** per gli sfondi. Servono per capire COME e' fatto un
effetto, poi si rifa'. Lasciati come sono, sono gli effetti piu' copiati degli
ultimi anni: chi compra a 20k li ha gia' visti e li legge come "fatto con un
tema". E' lo stesso motivo per cui sono vietati gli effetti al mouse.

**Gli effetti legati al mouse**, punto. Cursore disegnato, pulsanti magnetici,
schede che si inclinano col puntatore, parallasse col mouse. Meta' del pubblico
apre da telefono, dove non esistono; e il puntatore si muove a caso, mentre
l'immersione si guida col tempo e con lo scorrimento, che li scriviamo noi.

---

# QUELLO CHE NON HO ANCORA PAGATO

Onesta' sullo stato dell'arte, cosi' non si spaccia esperienza per lettura:

- **React Three Fiber, Drei, postprocessing, Leva**: li so scrivere, ma su
  nessun progetto vero di questa agenzia e' ancora girato 3D in tempo reale -
  la scelta e' stata l'opposta, video scrubbato. Prima volta che serve, si
  mette in conto un giro di prove. **Eccezione: il progetto `velocity` gira 3D
  real-time (three.js puro).** Per il fotorealismo WebGL (tone mapping, PMREM/env
  con strisce, MeshPhysicalMaterial clearcoat/vetro/perla, RectAreaLight, riflesso
  planare, N8AO, ombre cotte, post, misura normali) vedi
  **`references/fotorealismo-webgl.md`** — tarato sul codice reale di velocity e
  collegato alla controparte offline [[blender]].
  E **`references/trappole-misura-3d.md`**, che vale di piu': non contiene
  ricette — quelle si trovano ovunque — ma i modi in cui **una misura sbagliata
  sembra giusta**. Sei metriche costruite e buttate su un progetto solo; le due
  che contano davvero davano numeri PLAUSIBILI. Il canarino `(128,128,255)`,
  l'attesa in fotogrammi che non e' un'attesa, `envMapIntensity` che e' un
  rapporto e non un valore, e i difetti che spengono la scena in silenzio.
- **OGL**, **Rive**: conosciuti, non usati.
- **Shader GLSL**: si scrivono, ma il debito e' sulle prestazioni su telefono,
  che si misurano e basta.
- **View Transitions API**: da verificare sul campo, non solo sulla carta.

Ogni voce che si prova sul serio va spostata piu' su, con il difetto che ha
fatto perdere tempo. Una skill che elenca strumenti non serve a niente: serve
quando dice dove si sbatte la testa.

---

# RIFERIMENTI

Awwwards e Godly per il livello. Si ispeziona il codice dei siti premiati: meta'
delle tecniche si riconoscono subito. Ma si prende la **meccanica**, non
l'estetica - l'estetica copiata si vede.
