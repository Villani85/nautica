# Active Theory (v6)

- **URL**: https://activetheory.net (raggiungibile, HTTP 200 il 13/08/2026 — nessuna sostituzione)
- **Premio**: Awwwards Site of the Day + Developer Award. Punteggi: design 8.1, usability 7.29, creativity 8.68, content 7.88, SOTD 7.95, dev 7.92. Nominato agli Annual Awards 2024. Fonte: https://www.awwwards.com/sites/active-theory-v6 e https://annuals.awwwards.com/site-nominees/active-theory-v6. (La scheda Awwwards riporta 6 febbraio 2024, una fonte secondaria 18 settembre 2024: non risolto.)
- **Studio**: Active Theory (Los Angeles, New York City, Amsterdam — le tre citta' sono scritte nella pagina Contact)
- **Anno**: v6, dati CMS aggiornati 2024; bundle JS con `Last-Modified: Tue, 02 Jun 2026`
- **Letto il**: 13/08/2026

---

## L'ESPERIENZA (integrazione)

> Blocco aggiunto il 13/08/2026 rileggendo i contenuti veri del sito (i JSON del CMS
> `metadata-dev.json`, `contact-dev.json`, `projects-dev.json` — 65 progetti — piu' i testi
> gia' estratti dal livello di accessibilita'), per rispondere alle domande che servono a
> un'agenzia. Le sezioni tecniche piu' sotto restano valide.

### Di cosa tratta il sito, in concreto

E' **un unico viaggio subacqueo in sei ambienti**, senza stacchi di camera, dentro il quale
sono sospese quattordici schede-video di progetto. Non c'e' una pagina "servizi", non c'e'
una pagina "processo", non c'e' un piede. Il sito e' composto da: un logo di vetro appeso a
un filo, un titolo, un paragrafo, un catalogo che galleggia, due scene senza testo, un
rimando a un laboratorio esterno, e un pannello di chat che ti chiede cosa cerchi.

Il catalogo vero e' molto piu' grande di quello che si vede: il CMS contiene **65 progetti**,
in home ne compaiono **14, rimescolati a ogni caricamento**. Non esiste un ordine autoriale:
esiste una `priority`, e chi rientra vede un sito diverso.

### Cosa vende, e qual e' l'obiettivo finale

**Dichiarato** (meta description e testi in scena, testuali):
> Founded in 2012. We blend story, art & technology as an in-house team of passionate makers.
> Our industry-leading web toolset consistently delivers award-winning work through quality & performance.

Notare cosa c'e' dentro quella frase: non "facciamo bei siti", ma **"abbiamo un nostro
strumentario, ed e' il migliore del settore"**. Quello che vendono e' **Hydra**, il motore
grafico proprietario — solo che non lo vendono come prodotto, lo vendono come motivo per cui
il lavoro esce meglio e piu' veloce. La chiusura della frase e' commerciale, non artistica:
*through quality & performance*.

**Vero:** entrare nella rosa dei fornitori di produzione digitale dei grandi marchi
(Google, Microsoft, IBM, YouTube, Spotify, Fox, Amazon, U.S. Air Force sono tutti nel CMS) e
delle agenzie che appaltano la parte tecnica (Droga5, dentsu).

**Conversione:** una mail a `hello@activetheory.net`. Verificato nel JSON dei contatti: la
pagina Contact contiene **sei link e nessun modulo** — Email (mailto), Newsletter
(Mailchimp), Privacy (Notion), Instagram, LinkedIn, X. I posti di lavoro stanno su Lever.
**Zero campi da compilare in tutto il sito**, con un'eccezione che e' la cosa piu'
interessante del progetto (vedi sotto: la chat).

**Terzo obiettivo, dichiarato nel codice e in nessun altro posto: farsi trovare dalle AI.**
Il sito registra cinque strumenti WebMCP (`navigator.modelContext.registerTool`) perche' un
agente possa leggerlo, cercare fra i progetti e aprire la pagina contatti da solo.

### A chi si rivolge

A due compratori diversi, e il sito lo sa:

- **Il direttore creativo di un marchio** o dell'agenzia che gli fa da capofila. Sa cos'e'
  una produzione digitale, ha gia' visto tre studi, e cerca chi non gli fara' saltare la
  data di lancio. La sua paura e' che l'esperienza sia una demo che si rompe su un telefono
  vero.
- **Un agente AI** che sta compilando una lista di fornitori per conto di qualcuno. E' un
  compratore nuovo, e Active Theory e' l'unico dei quattro studi di questa ricerca che gli
  abbia scritto una scheda dedicata.

### L'esperienza progettata, passo per passo, e con che ritmo

| momento | schermate | cosa succede | ritmo |
|---|---|---|---|
| **Cancello** | — | nero pieno 12-16 s, un contatore in glifi ciano che sale a scatti. Nessun logo, nessuna barra finta | attesa dichiarata, senza consolazione |
| **Apertura** | 0 → 4,2 | il logo "a" di vetro sospeso a un filo che si incrocia a otto, particelle, `SCROLL DOWN` che svanisce al 20% | **lentissimo: quattro schermate senza una parola** |
| **Promessa** | 4,2 → 5,2 | `CREATIVE DIGITAL EXPERIENCES` + il paragrafo, attraversati dal logo gigante in vetro | una sola schermata, e la meta' e' occupata dall'effetto |
| **Catalogo** | 5,2 → 15,7 | 14 schede-video in fila indiana, una per volta in primo piano. **Entra la chat.** Entra il player musicale | la parte utile, dieci schermate |
| **Respiro** | 15,7 → 17,8 | TreeScene: impianto sommerso, particelle in gabbia, **zero testo** | due schermate di puro decoro |
| **Il laboratorio** | 17,8 → 19 | si passa sotto il pelo dell'acqua, pannello a nido d'ape, `// THE LAB ->` | una schermata, e porta **fuori dal sito** |
| **Fine** | 19 → 23,3 | il logo torna nel vuoto, luce verde acqua, **nessun piede** | quattro schermate di niente |

Ritmo complessivo: **lento all'inizio, lento alla fine, con il contenuto commerciale
schiacciato in mezzo.** Delle 23 schermate desktop, dieci sono catalogo e **otto sono
apertura e chiusura senza informazioni**. Sul telefono tutto si dimezza (`pageScalar: 0.5`),
e la proporzione resta identica.

### Cosa deve fare il visitatore, e dove lo portano

1. **Aspettare** (obbligatorio).
2. **Scorrere.** L'unica istruzione data e' `SCROLL DOWN`, e svanisce dopo il 20% della
   prima sezione.
3. **Cliccare una scheda** → pagina progetto `/work/<slug>`.
4. **Scrivere nella chat** — ed e' qui che il sito qualifica.
5. **Cliccare `// THE LAB ->`** → esce su `atlab.io`.
6. **Cliccare la pillola `CONTACT`** → overlay con la mail.

**La chat e' il vero imbuto, travestito da giocattolo.** Il pannello in basso a sinistra
chiede `What are you looking for?` e offre cinque scorciatoie:

> `-> websites` · `-> installations` · `-> XR / VR / AI` · `-> multiplayer` · `-> games`

Confrontando quelle cinque voci con i tag dei 65 progetti nel CMS, **coincidono uno a uno**:
Website 21 · Installation 12 · XR 12 · Game 11 · Multiplayer 9 · AI 2. Cioe': quello che
sembra un assistente conversazionale **e' il listino servizi**, riscritto in prima persona
dal cliente ("cosa stai cercando") invece che in terza dallo studio ("cosa offriamo"). E'
la scelta piu' furba del sito: **fa dire al visitatore di che progetto ha bisogno, senza
un modulo e senza sembrare di venderglielo.** Dietro c'e' un backend proprio con thread
persistenti, cioe' la conversazione viene conservata.

### Come e' organizzata la persuasione

| leva | dove sta | in quante schermate dall'inizio |
|---|---|---|
| **Promessa** | `CREATIVE DIGITAL EXPERIENCES` + paragrafo | **4,2** (dopo 12-16 s di nero) |
| **Anzianita'** | `FOUNDED IN 2012` | 4,2 |
| **Differenziazione** | *"our industry-leading web toolset"* | 4,2 |
| **Prova visiva** | tutto il viaggio, dal secondo zero | 0 |
| **Prova per nomi** | i loghi cliente sulle 14 schede | 5,2-15,7 |
| **Qualificazione** | la chat con le 5 voci | ~5,5 |
| **Prova di ricerca** | `// THE LAB ->` e il link ad atlab.io | 17,8 |
| **Chiamata all'azione** | pillola `CONTACT` in alto | **sempre visibile** |
| **Premi e numeri** | **solo nella scheda per le AI** | mai, a schermo |
| **Prezzo** | **assente ovunque** | — |

Il dato piu' notevole della scheda: **il conto dei premi non e' scritto da nessuna parte
sullo schermo.** Esiste in un solo posto — la descrizione registrata come strumento WebMCP,
cioe' il testo che il sito recita a un'intelligenza artificiale che glielo chiede:

> Active Theory is a creative digital production studio founded in 2012. We focus on creative
> tech frameworks that are custom and beautifully crafted in-house. **We have won 126 FWA
> awards, 24 Cannes Lions, 15 CLIO awards, 69 Awwwards, and one Golden Globe.** […] We have a
> global team based out of Los Angeles, New York City, and Amsterdam.

Ventiquattro Cannes Lions e un Golden Globe: la prova sociale piu' pesante che uno studio
digitale possa mettere in tavola, **riservata alle macchine.** L'essere umano che scorre
non la vede mai. E' una scelta di tono coerente (niente vanterie a schermo) ma dal punto di
vista commerciale e' un argomento buttato via.

Sul prezzo: niente. Nessun listino, nessuna forbice, nessuna durata di progetto. Come per
Lusion, **il prezzo lo dice il costo del sito**: 108,9 MB su una sessione completa e un
motore 3D scritto in casa dal 2012.

### Cosa arriva a chi NON scorre fino in fondo

Questo sito e' il caso limite dei quattro, e va detto senza attenuanti:

- **Chi chiude durante i 12-16 secondi di nero**: zero.
- **Chi si ferma alla prima schermata**: **quasi zero.** Vede un oggetto di vetro sospeso
  nel blu, la parola `SCROLL DOWN`, e in alto a destra `WORK` e `CONTACT`. **Non c'e' una
  frase che dica cosa fanno.** Il nome dello studio e' solo il logo. Per sapere di cosa si
  tratta bisogna arrivare alla schermata 4,2, cioe' scorrere per un quinto della pagina.
- **Chi si ferma prima della schermata 5,2**: non vede nessun cliente, nessun progetto,
  nessuna chat.

**Ma hanno costruito un canale parallelo per chi non guarda.** Tre livelli, tutti verificati:

1. **La meta description** — che e' cio' che arriva a chi vede solo il link condiviso su
   Slack o LinkedIn — contiene il posizionamento completo.
2. **Il livello `div.GLA11y`**, largo 0 px e ritagliato via, contiene tutti i testi e i link
   veri in ordine di lettura: chi usa un lettore di schermo riceve il contenuto **prima**
   di chi guarda.
3. **I cinque strumenti WebMCP**: un agente AI ottiene la descrizione dello studio, l'elenco
   dei progetti, la ricerca per parole chiave e l'apertura della pagina contatti — **senza
   aspettare il preloader e senza scorrere.**

In sintesi: **il sito e' illeggibile per l'impaziente e perfettamente leggibile per la
macchina.** E' una scommessa dichiarata sul fatto che il compratore giusto scorra.

### Come costruiscono la fiducia (e' questo il prodotto)

- **Clienti**: mostrati come logo sulla scheda del progetto, mai come muro di loghi. Nel
  CMS: IBM, Spotify, YouTube, Google, Microsoft, Fox, Adult Swim, Amazon, U.S. Air Force,
  Pottermore, WSJ, Adidas, Blue Shield, Girls Who Code, Porter Robinson, Thorne, Autoneum.
- **Le descrizioni dei progetti sono una riga sola, e parlano di capacita', non di
  risultati.** Esempi testuali dal CMS: *"IBM's Watson responds to sight, voice, and commands
  of tour guides at the Masters tournament, delivering real-time statistics onto a curved
  u-shaped room"* · *"A high-tech, interactive training simulation with 16 unique mini-games,
  designed to teach potential recruits about different career paths within the Air Force"* ·
  *"An explorable crime scene where users can collect evidence and attempt to solve the Wayne
  murders"*. **Nessun numero di risultato, nessuna testimonianza, nessun caso studio con
  metriche.** Solo: guarda cosa siamo riusciti a costruire.
- **Colore per cliente**: ogni progetto ha un `uiColor` nel CMS (WSJ `#48BDB5`, Xbox
  `#00C390`, Adidas `#E71407`, IBM `#19A8D9`). L'interfaccia si tinge del marchio mentre lo
  guardi: e' deferenza, non decorazione.
- **Ricerca e sviluppo come prova**: `// THE LAB ->` —
  *"OUR HOME FOR INNOVATION, WHERE PROTOTYPES TURN INTO PRODUCTION PROJECTS"*. Nel CMS ci
  sono progetti il cui cliente e' letteralmente `Lab`: lavori fatti per se stessi, messi
  accanto a quelli di Google senza distinzione grafica.
- **Squadra e sedi**: `LAX → NYC → AMS`, in corpo 110, dentro l'overlay Contact. Tre fusi
  orari sono l'argomento di continuita' operativa, scritto come una rotta aerea.
- **Processo**: **non raccontato.** Zero fasi, zero tempi, zero metodo. L'unica cosa che
  somiglia a un processo e' *"in-house team of passionate makers"*, cioe' "non
  subappaltiamo".

### I testi veri principali

> **CREATIVE DIGITAL EXPERIENCES**
> **FOUNDED IN 2012**
> **WE BLEND STORY, ART & TECHNOLOGY AS AN IN-HOUSE TEAM OF PASSIONATE MAKERS**
> **OUR INDUSTRY-LEADING WEB TOOLSET CONSISTENTLY DELIVERS AWARD-WINNING WORK THROUGH QUALITY & PERFORMANCE**

> SCROLL DOWN

> `// THE LAB ->` — OUR HOME FOR INNOVATION, WHERE PROTOTYPES TURN INTO PRODUCTION PROJECTS

Chat (l'imbuto):

> **What are you looking for?**
> `-> websites` · `-> installations` · `-> XR / VR / AI` · `-> multiplayer` · `-> games`
> segnaposto: `Ask me anything...`
> `Sessions may be recorded. By using chat, you acknowledge our Privacy Policy.`

Contatto:

> `✦ CONTACT US ✦` — `LAX → NYC → AMS` — `HELLO@ACTIVETHEORY.NET`
> `PRIVACY NOTICE` · `NEWSLETTER SIGNUP` · `CAREERS` · `[ MOBILE SYNC ]`

Meta (cio' che arriva a chi vede solo il link):

> Active Theory · Creative Digital Experiences
> Founded in 2012. We blend story, art & technology as an in-house team of passionate makers. Our industry-leading web toolset consistently delivers award-winning work through quality & performance.

---

## Cosa vende

Produzione digitale su commessa: siti, giochi, esperienze multiplayer, installazioni fisiche, XR/AR/VR e progetti AI, costruiti con un motore grafico web scritto in casa. Il sito e' la dimostrazione del motore: non racconta il servizio, lo esegue.

## A chi

Direttori creativi e responsabili marketing di brand grandi (i clienti in home sono Google, Microsoft, IBM, Adidas, WSJ, U.S. Air Force, Pottermore/Harry Potter, Porter Robinson) e agenzie che cercano un partner tecnico. Uscendo dal sito il compratore deve pensare: "questi fanno cose che gli altri non sanno fare, e le fanno girare nel browser". Secondo obiettivo dichiarato nel codice: farsi trovare dagli agenti AI (vedi WebMCP nello Stack).

## Idea regista

Una sola inquadratura continua: la telecamera non taglia mai, lo scroll e' un movimento di macchina dentro un unico mondo sommerso in cui l'utente attraversa sei ambienti.

## Il momento

A circa 3800–4700 px di scroll (sezione About, la seconda): il titolo `CREATIVE DIGITAL EXPERIENCES` in bianco a tutta pagina viene attraversato dal logo "a" gigante in vetro rifrangente, che passa davanti alle lettere e le deforma otticamente mentre la camera sale. Il testo non e' HTML sopra un canvas: e' dentro la scena, alla stessa profondita' del vetro, e la dispersione cromatica lo spezza (screenshot a 4016 px). E' l'unica inquadratura in cui tipografia e 3D si contendono lo stesso pixel.

## Struttura, sezione per sezione

Le sezioni sono dichiarate nel bundle in `_initFXScroll([...])`. Ogni voce ha un `vh` che viene moltiplicato per 105vh: l'altezza reale della pagina e' quindi `vh × 105vh`. Su telefono tutti i `vh` sono moltiplicati per `pageScalar: 0.5` (con minimo 1). Tutto VERIFICATO nel codice e misurato: desktop 20.979 px a viewport 900 (= 2331vh), mobile 10.634 px a viewport 844 (= 1260vh), entrambi coincidono al pixel con il calcolo.

| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |
|---|---|---|---|
| Home (`Home421`, vh 4, cameraMove 20) | logo "a" in vetro sospeso a un filo, particelle, scritta `SCROLL DOWN`, fondo blu-nero | scorre; la scritta svanisce a scrollProgress > 0.2 | 420vh desktop / 210vh mobile (4,2 schermate) |
| About (`About655`, vh 1, cameraMove 2) | titolo `CREATIVE DIGITAL EXPERIENCES` + paragrafo, logo gigante che li attraversa | legge | 105vh (1,05 schermate) su entrambi |
| Work (`$work`, vh 10, route `/work`) | 14 schede-video in vetro che galleggiano in profondita', una per volta in primo piano; a sinistra il pannello chat AI; in alto il player musicale | scorre tra i progetti, puo' cliccare una scheda, puo' scrivere in chat | 1050vh desktop / 525vh mobile (10,5 schermate) |
| TreeScene (`TreeScene302`, vh 2, cameraMove 6) | struttura industriale/impianto sommerso, nube di particelle colorate dentro una gabbia | scorre | 210vh / 105vh |
| CleanRoom = "THE LAB" (`CleanRoom832`, vh 1.2, cameraMove 4) | pannello a nido d'ape, `// THE LAB ->` + `OUR HOME FOR INNOVATION, WHERE PROTOTYPES TURN INTO PRODUCTION PROJECTS`, link a atlab.io | clicca per uscire su atlab.io | 126vh / 105vh |
| Footer (`Footer78`, vh 4, cameraMove 20) | ritorno al logo in vetro nel vuoto, luce verde-azzurra | fine corsa | 420vh / 210vh |
| Contact (fuori scroll) | overlay a tutta pagina: `✦ CONTACT US ✦`, `LAX → NYC → AMS` in corpo 110, mail, social, QR `[ MOBILE SYNC ]`, globo wireframe | apre da nav, chiude con `CLOSE ✕` | modale, l'URL resta `/` |

Nota: `/contact` come URL non esiste, reindirizza a `/`. Solo `/work` e `/work/<slug>` sono rotte vere.

## L'esperienza in ordine di tempo

Primi dieci secondi (misurati con screenshot a 0,5s / 1 / 1,5 / 2 / 3 / 4 / 5 / 6,5 / 8 / 10 s):

- 0,0–1,5 s: schermo completamente nero. Nessun logo, nessuna barra.
- ~2 s: al centro compare un blocchetto di glifi monospazio (barre `/` e cifre) in ciano `#81ECFE`, largo circa 70 px, che si riempie dall'alto formando una cupola; sotto, un numero preceduto da `/`.
- 3 s: il contatore segna 30. 5 s: 30. 8 s: 33. 10 s: 49, e il blocchetto di glifi e' cresciuto a cupola piena. Il caricamento e' lungo e dichiarato: niente finta barra, solo un numero che sale a scatti.
- Fine caricamento (evento interno `Global/loadFinished`, nelle mie prove tra 12 e 16 s con cache fredda): la scena appare gia' in movimento. Da qui partono due animazioni ritardate scritte nel codice: il player musicale entra da `y:-100` a `y:0` con `opacity 0 → 0.8` in 2000 ms `easeOutCubic` con 1500 ms di ritardo; il pannello chat va a `opacity 1` in 2000 ms `easeInOutSine` con 3300 ms di ritardo.
- Il banner cookie compare in basso a destra (`opacity` in 800 ms, cubic-bezier(.39,.575,.565,1), 200 ms di ritardo).

Poi, a blocchi:

1. **Home**: la camera sale lentamente lungo un vicolo sommerso; il logo "a" resta al centro appeso a un filo che si incrocia a otto. `SCROLL DOWN` in blu polvere sopra il logo; al 20% della sezione svanisce (`tween alpha 0`, 500 ms, `easeOutSine`).
2. **About**: entra il titolo a tre righe e, sulla destra, il paragrafo "Founded in 2012 / We blend story, art & technology…". Il logo gigante taglia la composizione.
3. **Work**: le schede-video arrivano in fila indiana da dietro. Ogni scheda e' un rettangolo di vetro con angoli arrotondati che contiene il video del progetto in loop, il logo del cliente e il titolo. Attorno galleggiano vertebre organiche e sciami di particelle iridescenti. Al primo ingresso nella sezione compare a sinistra la chat AI con cinque scorciatoie; il player musicale in alto a destra mostra il brano corrente.
4. **TreeScene**: 210vh senza testo, pura scenografia (impianto sommerso, nube di particelle in gabbia). Serve da respiro tra il catalogo e il laboratorio.
5. **CleanRoom / THE LAB**: si passa sotto il pelo dell'acqua (si vede la superficie increspata in alto), poi il pannello a nido d'ape con il claim del laboratorio.
6. **Footer**: il logo torna nel vuoto, la luce vira al verde acqua, la pagina finisce senza piede tradizionale: tutte le informazioni di contatto stanno nell'overlay Contact.

## Animazioni

Dove c'e' una durata o una curva, e' letta dal bundle (VERIFICATO). Dove non c'e', e' osservazione da screenshot.

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| camera di ogni scena | posizione y/z | scroll (`scrollProgress` 0→1 mappato con `Math.range`) | lineare sul progresso, poi lisciato dal lerp dello scroll | es. Home: `camera.y = range(p,0,1,26,-20)`; About: `range(p,0,1,40,-7)` (su telefono `-11`) |
| scroll | scorrimento | ruota/touch su un div `overflow:scroll` | inerzia interna a FXScroll, `angle: 0.7`; snap con `scrollTo(dst,'y',400,'easeOutCubic')` | `keyboard:false`, `virtualScroll:false` |
| testo `SCROLL DOWN` | alpha 1→0 | scroll > 20% della sezione Home | 500 ms `easeOutSine` | una sola volta (`scroll.out` flag) |
| pannello chat (ingresso) | opacity 0→1 | evento `loadFinished` | 2000 ms `easeInOutSine`, delay 3300 ms | |
| pannello chat (mostra/nascondi) | opacity + uniform `uChatOpen` | `Work/scrollProgress` tra 0.05 e 0.95 (0.10–0.88 su telefono) e stato `contact` | show: 1000 ms `easeOutSine`; hide: 200 ms `easeInSine` + 3000 ms `easeInOutSine` sull'uniform | la chat DOM pilota un uniform dello shader: il 3D reagisce all'apertura del pannello |
| link della chat | colore + `translateX(0→10px)` | hover / stato `.active` | `transition: all 0.4s cubic-bezier(.17,.4,.02,.99)` | in `.active` aggiunge `text-shadow: #fff 1px 0 5px` |
| testo del disclaimer chat | lettere sostituite a caso che si stabilizzano | comparsa | `tween` su `progress` 1→0, durata clampata 500–1500 ms, `linear`, refresh a 15 fps | effetto "scramble" scritto in casa (`replaceRandomLetters`), non GSAP |
| player musicale (ingresso) | y −100→0, opacity 0→0.8 | `loadFinished` + audio pronto | 2000 ms `easeOutCubic`, delay 1500 ms | |
| ticker del brano | marquee orizzontale | tempo | `animation: ticker 9s linear infinite` (due copie affiancate) | cambio brano: opacity→0 in 100 ms `easeInSine`, poi →0.5 in 1000 ms `easeOutSine` con 200 ms di ritardo |
| volume globale | 0→0.15 | primo gesto utente | 2000 ms `easeInOutSine` | toggle audio: 500 ms `easeOutSine` |
| pulsante audio in nav | uniform `uHover` 0→1 | hover | in 300 ms `easeOutSine`, out 500 ms `easeOutSine` | il pulsante e' un oggetto WebGL con shader proprio (`NavAudioShader`, uniform `uAmplitude`) |
| particelle | posizione | GPU, simulazione a texture (sistema "Antimatter": tPos/tPrevPos in float texture) | — | 100.000 particelle nella scena home, 150.000 nella pagina work (valori in `uil.json`) |
| fluido | campo di velocita' | movimento del puntatore | passo di `splat` con `SPLAT_RADIUS`, throttle a 50 ms | simulazione fluida su FBO (velocity/pressure), usata come disturbo delle particelle |
| post-produzione | bloom, lens streak, volumetriche | continuo | — | `UnrealBloomComposite`, `HydraLensStreak`, `VolumetricLight`, FXAA (tutti nomi di uniform in `uil.json`) |

Libreria di animazione: **nessuna libreria esterna**. Il `tween(obj, props, ms, "easeOutCubic", delay)` e' interno a Hydra. Nel bundle non esistono le stringhe `gsap`, `lenis`, `Tween.js` (verificato: 0 occorrenze).

## Colori

Il sito e' quasi tutto WebGL, quindi i colori "di marca" sono uniform di shader. Quelli marcati (UIL) sono letti da `assets/data/uil.1780406240914.json`, quelli marcati (CSS) dal foglio di stile nel bundle, quelli marcati (stimato) sono campionati dagli screenshot.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo assoluto | `#000000` | `body`, `background` del canvas, `theme-color` (CSS) |
| fondo scena home | `#0B0D13` / `#10141B` / `#090E12` (stimato) | atmosfera blu-nera dominante |
| grigi di scena | `#222C38`, `#2F3D4A`, `#535F68` (stimato) | volumi in penombra, pareti |
| nebbia home | `#1A90AD` (UIL) | `HomeSceneVFX_home_uFogColor` |
| pavimento home | `#93E5FF` su base `#161616` (UIL) | `HomeFloorShader` |
| luce schermo home | `#D600FF` (UIL) | `HomeScreenLight`, magenta di rimbalzo |
| vetro (fresnel) | `#B4E0E3` / phong `#FFFFFF` (UIL) | `GlassCubeShader`, il logo e le schede |
| particelle core | `#C64DFF` + `#422EA3` + `#84C8C3` (UIL) | `CoreParticlesShader` (tre colori miscelati) |
| lens streak | alone `#CCEEFF`, striscia `#C2DCFF` (UIL) | `HydraLensStreak` |
| verde spia | `#0BED90` (UIL) | luce `L_Element_11_home_scene` |
| acqua TreeScene | `#002D57` (UIL) | `TreeWaterShader` |
| testo principale | `#FFFFFF` (CSS + glText `fontColor`) | titoli, `LAX → NYC → AMS`, mail |
| testo chat | `#F4F4F4` (CSS) | risposte del bot |
| link chat desktop | `#C6C6C6` (CSS) — a schermo appare lilla `#D4BEFA` (stimato) per via del `color-dodge` | `-> websites`, `-> installations`, … |
| link chat mobile | `#EEEEEE`, e `#9CA5FF` per le scorciatoie `.home` (CSS) | sotto 768 px |
| cursore chat | `#00FFFF` (CSS) | quadratino 8×12 px che lampeggia in 1,5 s |
| caricamento | `#81ECFE` (glText) | glifi e contatore del preloader |
| `SCROLL DOWN` | `#6D9DB8` (stimato) | home |
| bordi UI | `rgba(255,255,255,0.3)` e `0.6` (CSS) | banner cookie, campo chat, pulsanti player |
| fondo pulsante "Accept" | `rgba(156,165,255,0.333)` = `#9CA5FF` al 33% (CSS) | banner cookie |
| pannello cookie | `rgba(0,0,0,0.5)` + `backdrop-filter: blur(4px)`, raggio 12 px (CSS) | |
| barra di scorrimento | `rgba(255,255,255, var(--baropacity))`, larga 8 px, raggio 10 px (CSS) | opacita' pilotata da variabile CSS |
| colore per progetto | uno per scheda, dal CMS (`uiColor`) | es. WSJ `#48BDB5`, Xbox `#00C390`, Kandinsky `#FFA147`, Adidas `#E71407`, Prometheus `#765648`, Paper Planes `#8A8BCF`, IBM `#19A8D9` |

## Tipografia

Un solo carattere in tutto il sito: **NB Architekt Std** (Neubau), monospazio di grazia tecnica, in tre pesi.

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| titolo di sezione (`CREATIVE DIGITAL EXPERIENCES`) | NBArchitektStd | Light/Regular | enorme, ~90–110 px equivalenti | ~1.0 | testo dentro il WebGL, non HTML |
| citta' Contact (`LAX`, `NYC`, `AMS`) | NBArchitektStd-Light | 300 | `fontSize: 110`, `letterSpacing: .1`, allineato al centro | — | valori dal codice |
| etichetta (`CONTACT US`) | NBArchitektStd-Light | 300 | 14, `letterSpacing: .1` | — | tra due glifi `✦` |
| mail e voci di piede | NBArchitektStd-Bold | 700 | 11–15 | — | `HELLO@ACTIVETHEORY.NET` a 15, `[ MOBILE SYNC ]` a 9 |
| chat (DOM) | `nbarchitekt, monospace` | 400 | 14 px desktop, 13 px sotto 768 px | 1.5 | `white-space: pre-wrap`, margine 6 px |
| banner cookie (DOM) | `nbarchitekt, monospace` | 400 | 14 px | 21 px | |
| ticker musicale (DOM) | `nbarchitekt, monospace` | 400 | 10 px | 30 px | opacita' 0.4 |
| preloader | `nbarchitekt` | 400 | 13 e 16 | — | colore `#81ECFE` |

Come sono serviti: **font locali**, dichiarati in un `<style>` in linea nell'HTML (nessuna richiesta a servizi esterni). Tre `@font-face` con `woff2` + `woff` + `otf` di ricaduta, sotto `assets/fonts/NBArchitektStd-*-export/`. Il solo `woff2` Regular scaricato all'avvio pesa 19 KB. Per il testo dentro il WebGL esistono in piu' tre file `assets/fonts/NBArchitektStd-{Regular,Light,Bold}.json` (~2 KB l'uno): sono atlanti di tipo campo-di-distanza, quindi le lettere in 3D restano nitide a ogni scala. Nessun font variabile.

## Testi veri

Meta e intestazione:

- `Active Theory · Creative Digital Experiences`
- `Founded in 2012. We blend story, art & technology as an in-house team of passionate makers. Our industry-leading web toolset consistently delivers award-winning work through quality & performance.`

Nel sito (testuali, dal livello di accessibilita' e dagli screenshot):

- `CREATIVE DIGITAL EXPERIENCES`
- `FOUNDED IN 2012`
- `WE BLEND STORY, ART & TECHNOLOGY AS AN IN-HOUSE TEAM OF PASSIONATE MAKERS`
- `OUR INDUSTRY-LEADING WEB TOOLSET CONSISTENTLY DELIVERS AWARD-WINNING WORK THROUGH QUALITY & PERFORMANCE`
- `// THE LAB ->` — `OUR HOME FOR INNOVATION, WHERE PROTOTYPES TURN INTO PRODUCTION PROJECTS`
- `SCROLL DOWN`

Menu: `WORK` — `CONTACT` (in una pillola con bordo chiaro, in alto a destra su desktop, centrata su telefono; diventa `CLOSE ✕` quando il contatto e' aperto). Terzo comando solo per lettori di schermo: `Toggle Audio`.

Chat (pannello in basso a sinistra):

- `What are you looking for?`
- `-> websites` / `-> installations` / `-> XR / VR / AI` / `-> multiplayer` / `-> games`
- segnaposto del campo: `Ask me anything...`
- `Sessions may be recorded. By using chat, you acknowledge our Privacy Policy.`

Contatto: `✦ CONTACT US ✦` — `LAX → NYC → AMS` — `HELLO@ACTIVETHEORY.NET` — `PRIVACY NOTICE` — `NEWSLETTER SIGNUP` — `CAREERS` — `[ MOBILE SYNC ]` (sotto un QR code) — icone Instagram, LinkedIn, X.

Banner cookie: `Our site uses essential cookies and, with your consent, analytics cookies. Details in Privacy Notice.` + `Accept Cookies` / `Reject Cookies`.

Titoli dei 14 progetti in home (sono i primi 14 per `priority`, **rimescolati a ogni caricamento**): `Sustainable Horizons` (WSJ), `Prometheus` (Prometheus Fuels), `Million Piece Mission` (U.S. Airforce), `Paper Planes` (Google & Droga5), `20 Years of Xbox` (Microsoft), `Secret Sky` (Porter Robinson), `Discover your Patronus` (Pottermore), `E.C.H.O.` (U.S. Airforce), `Frontier Within` (Thorne), `Kandinsky` (Google), `Chile 20` (Adidas), `Harmonic State` (IBM), `Welcome to Hogwarts` (Pottermore), `Racer` (Google).

Descrizione dello studio scritta per le AI (registrata come strumento `get_more_agency_info`, testuale):

> `Active Theory is a creative digital production studio founded in 2012. We focus on creative tech frameworks that are custom and beautifully crafted in-house. We have won 126 FWA awards, 24 Cannes Lions, 15 CLIO awards, 69 Awwwards, and one Golden Globe. […] We have a global team based out of Los Angeles, New York City, and Amsterdam.`

## Mobile

Il sito **non cambia**: e' la stessa scena WebGL, gli stessi sei ambienti, la stessa chat. Cambia la coreografia. Tutto quanto segue e' VERIFICATO (codice + prova su viewport 390×844, DPR 2, user agent iPhone).

**Cosa sparisce**

- Meta' del viaggio: `pageScalar: Device.mobile.phone ? .5 : 1` dimezza il `vh` di ogni sezione (con minimo 1). Misurato: 2331vh desktop → 1260vh mobile, cioe' 10.634 px invece di 20.979. La sezione Work passa da 1050vh a 525vh.
- Il `mix-blend-mode: color-dodge` del pannello chat: sotto 768 px diventa `normal`. Sul telefono l'interfaccia smette di "prendere" il colore della scena e torna a essere testo pieno leggibile.
- Le due frecce decorative della pagina Contact (`arrow1`, `arrow2`) hanno `alpha: 0` quando il telefono e' in verticale.
- Il player musicale: resta nel DOM ma vive di `:hover` (opacita' 0 → 1), quindi in pratica su touch e' invisibile finche' non si tocca.

**Cosa viene sostituito**

- La pillola di navigazione si sposta al centro in alto (su desktop e' a destra); il player musicale sale da `top: 70px` a `top: 55px` e il margine da 2.6rem a 2rem.
- Colori dei link della chat: `#C6C6C6` diventa `#EEEEEE`, e le cinque scorciatoie `.home` diventano `#9CA5FF` (lilla pieno) — cioe' il colore che su desktop nasceva dalla fusione, sul telefono viene dichiarato a mano.
- Corpo della chat da 14 px a 13 px, margini da 6 px a 4 px.
- Soglie di comparsa della chat: su desktop appare tra il 5% e il 95% della sezione Work, su telefono tra il 10% e l'88%.
- Posizione della camera: nella scena About la camera scende a `y = -11` invece di `-7`, arretra di `z += 5`, e la mira passa da 2.5 a 1. Le stesse inquadrature vengono riquadrate per il formato verticale.
- Le schede di lavoro sono impaginate una per schermata invece che in fuga prospettica a tre.
- Lo scorrimento: se `HYDRA_MOBILE_SCROLL` e' attivo il palco passa a `height: 100vh` con un `ResizeObserver`, per convivere con la barra del browser che si accorcia.

**Cosa resta**

Tutto il resto: WebGL, particelle, chat AI, audio, testo dentro la scena, il livello di accessibilita', il caricamento a contatore. Non esiste una versione statica di ripiego per telefono. L'unica versione alternativa e' `unsupported.html` (vedi sotto).

**Il caso limite**: se il browser non ha WebGL2 (ne' l'estensione instancing, ne' il contenitore nativo `window.AURA`), il sito reindirizza a `/unsupported`, che e' una pagina statica con una `unsupported-bg.jpg` e la scritta `YOUR BROWSER IS NOT SUPPORTED`. Verificato per caso: Chrome senza GPU (SwiftShader) finisce sempre li'.

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| motore | **Hydra**, motore 3D e framework proprietario di Active Theory | VERIFICATO | `window.Hydra`, `HydraObject`, `HydraCSS`, `DOMTemplate`, `AppState`, `Render.drawFrame` nel `window`; classi 3D proprie (`Mesh`, `Shader`, `Points`, `UBO`, `NukePass`, `Antimatter*`) |
| framework JS | nessuno | VERIFICATO | nel bundle 0 occorrenze di `Vue`, `React`, `svelte` |
| animazione | `tween()` interno a Hydra con easing per nome (`easeOutCubic`, `easeInOutSine`, `easeOutSine`, `linear`) | VERIFICATO | 0 occorrenze di `gsap` / `lenis` / `Tween.js` nel bundle |
| 3D | **non three.js**. Motore proprio | VERIFICATO | 2 sole occorrenze della stringa `THREE` (in messaggi di errore ereditati), nessun `REVISION` |
| sequencer | **Theatre.js** | VERIFICATO (presente) / SUPPOSTO (uso) | `window.Theatre`, `__TheatreJS_CoreBundle`, link alla documentazione nel bundle; non ho potuto vedere quali sequenze piloti |
| editor visuale | **UIL v2.3**, GUI interna per registi/artisti | VERIFICATO | `window.UIL_STATIC_PATH`, file `assets/data/uil.1780406240914.json` con **2593 parametri** (camere, luci, uniform di 40+ shader, conteggi di particelle) |
| parallelismo | 8 Web Worker generici | VERIFICATO | `assets/js/hydra/hydra-thread.js` (13 KB) richiesto 8 volte; il worker riceve codice via `postMessage` e lo `eval`-a |
| scroll | div `overflow: scroll` con 6 blocchi vuoti `.scrollElement` alti `vh × 105vh`, camera guidata da `scrollProgress` | VERIFICATO | DOM ispezionato + `_initFXScroll([...])` nel bundle |
| testo in 3D | atlanti campo-di-distanza (`NBArchitektStd-*.json`) | VERIFICATO | tre JSON di ~2 KB scaricati all'avvio accanto ai woff2 |
| texture | **KTX2 / Basis** con transcoder wasm | VERIFICATO | `assets/js/lib/basis_transcoder.wasm` (184 KB) + 60 riferimenti `.ktx2` |
| geometrie | **Draco** | VERIFICATO | `assets/js/lib/_draco/draco_decoder.wasm` (65 KB), 49 riferimenti |
| shader | precompilati e serviti come asset unico | VERIFICATO | `assets/shaders/compiled.vs` (39 KB) scaricato all'avvio |
| video | mp4 su Google Cloud Storage, usati come texture WebGL | VERIFICATO | `<video>` dentro un div `.VideoTextures` di 0×0 px, `z-index: -10`; `assets/video/reel.mp4` per lo showreel, `storage.googleapis.com/activetheory-v6.appspot.com/media/*.mp4` per i progetti |
| CMS | JSON generati da un CMS headless (struttura `globalType` / `prefix` / `sizes.i200px` / `id` esadecimali) su GCS | VERIFICATO (endpoint) / SUPPOSTO (Payload CMS) | `https://storage.googleapis.com/activetheory-v6.appspot.com/cms/{metadata,contact,projects}-dev.json`; il file `projects` pesa 216 KB e contiene **65 progetti** |
| chat AI | backend proprio su Google App Engine, con thread persistenti | VERIFICATO | `https://backend-dot-activetheory-v6.uc.r.appspot.com/api/assistant` con `/createThread` e `/createMessage`; nel bundle anche `api.openai.com/v1/chat/completions`, `api.elevenlabs.io/v1/text-to-speech/` e il modello vocale `vosk-model-small-en-us-0.15.tar.gz` (riconoscimento vocale in locale) |
| interfaccia per agenti AI | **WebMCP** (`navigator.modelContext.registerTool`) | VERIFICATO | cinque strumenti registrati: `get_more_agency_info`, `open_contact_page`, `scroll_to_page_section` (top/about/work/lab), `get_all_projects`, `search_projects_by_keywords`, piu' una routine che scorre i progetti e si interrompe al primo `wheel`/`touchstart`/`keydown` dell'utente |
| accessibilita' | **GLA11y**, livello DOM invisibile che rispecchia la scena | VERIFICATO | `GLA11y.registerPage(group, "ContactPage")`, `GLA11y.textNode(...)`, `GLA11y.objectNode(...)`; nel DOM un `div.GLA11y` con `clip: rect(0 0 0 0)` contenente link e testi reali |
| QR / passaggio al telefono | `qrious.js` caricato a richiesta | VERIFICATO | `assets/js/lib/qrious.js` (6 KB), classe `QRCodeGen`, etichetta `[ MOBILE SYNC ]`, classe `SynchronizedObjects` |
| tiering hardware | lettura GPU via `WEBGL_debug_renderer_info` + benchmark su iOS (dove la GPU e' mascherata) + tabella A++/A+/A/B/C/D/F con blocklist | VERIFICATO | `iOSGPUTest` con `primeTest()` che indovina il modello Apple dal tempo di calcolo; override salvato in `localStorage` |
| hosting | Firebase Hosting dietro Fastly | VERIFICATO | intestazioni `Vary: x-fh-requested-host`, `X-Served-By: cache-lin…`, `alt-svc: h3`; progetto `activetheory-v6.appspot.com` |
| analytics | GA4 `G-J7TMDT4F8N` | VERIFICATO | tag nell'HTML |
| geolocalizzazione | `https://us-central1-at-services.cloudfunctions.net/geo` | VERIFICATO | stringa nel bundle |
| pagine esterne | privacy su Notion, lavoro su Lever, newsletter su Mailchimp, laboratorio su `atlab.io` | VERIFICATO | URL nel bundle |

## Peso e prestazioni

Misure mie, Chrome 140 con GPU reale, viewport 1440×900, cache fredda, connessione domestica.

**All'avvio** (solo codice e dati, prima che entrino le scene):

- 25 richieste allo stesso dominio, **707 KB trasferiti**, 3,29 MB decompressi.
- I pezzi piu' grossi: `app.js` 340 KB compressi (1,82 MB in chiaro), `basis_transcoder.wasm` 184 KB, `draco_decoder.wasm` 65 KB, `compiled.vs` 39 KB, `uil.json` 20 KB, il woff2 19 KB.
- `DOMContentLoaded` 2,08 s — `load` 5,01 s. Ma la pagina e' ancora nera: il contatore del preloader era al 49% a 10 s dall'avvio.
- Heap JS a regime: ~89 MB.

**Su tutta la sessione** (home + pagina Work + Contact, circa 3 minuti), contando i `Content-Length` di ogni risposta: **108,9 MB**, di cui **88,6 MB di video** (`media`), 19,1 MB di asset (`fetch`: ktx2, glb, bin) e 1,1 MB di script. Un solo video di progetto pesa 7,58 MB (`paperplanes_1.mp4`).

**Trappola da segnalare**: `performance.getEntriesByType('resource')` sul thread principale vede solo 25 richieste e ignora quasi tutti gli asset 3D, perche' vengono scaricati dentro i Web Worker di Hydra. Chi misura questo sito con gli strumenti standard ottiene numeri falsamente ottimi. Il conto vero si fa intercettando le risposte a livello di browser.

**Frame rate**: ho misurato 7 fps con `requestAnimationFrame` in una finestra Chrome guidata da Playwright e in secondo piano; il numero non e' attendibile (Chrome limita le finestre non a fuoco) e non lo uso come giudizio. Nessun punteggio Lighthouse raccolto.

## Tre cose da rubare

1. **Il doppio della pagina per chi non vede il canvas.** Tutto il sito e' un unico `<canvas>`, eppure nel DOM esiste un `div.GLA11y` largo 0 px con `clip: rect(0 0 0 0)` che contiene link e testi veri, registrati oggetto per oggetto (`GLA11y.registerPage(group,"ContactPage")`, `GLA11y.textNode(group,"Los Angeles")`). Il risultato: la pagina resta navigabile da tastiera e leggibile da un lettore di schermo, e io ho potuto ricostruire i contenuti di ogni sezione **senza guardare un pixel**, semplicemente leggendo quel livello mentre scorrevo. Meccanica rifacibile su qualunque esperienza WebGL: per ogni oggetto interattivo, un `<a>` invisibile con lo stesso testo e lo stesso ordine di lettura.

2. **L'interfaccia HTML che prende il colore della scena, tranne dove serve leggere.** Il pannello della chat e' HTML sopra il canvas con `mix-blend-mode: color-dodge`: il testo grigio `#C6C6C6` diventa lilla o ciano a seconda di cosa gli passa dietro, e l'interfaccia sembra parte del 3D senza costare un solo draw call. Sotto 768 px la stessa regola diventa `mix-blend-mode: normal` e i colori vengono dichiarati a mano (`#EEEEEE`, `#9CA5FF`): l'effetto si spegne dove lo schermo e' piccolo e la leggibilita' vince. Stesso trucco sul player musicale con `plus-lighter`. In piu' la chat scrive in un uniform (`uChatOpen`) mentre si apre, quindi il 3D reagisce all'apertura del pannello: il ponte DOM→shader e' una riga.

3. **La lunghezza dello scroll come parametro, non come conseguenza.** La pagina non ha sezioni con contenuto: ha sei div vuoti alti `vh × 105vh` dentro un contenitore `overflow: scroll`, e ogni scena legge il proprio `scrollProgress` da 0 a 1 per muovere la camera (`camera.y = Math.range(p, 0, 1, 26, -20)`). Cosi' la durata di ogni capitolo e' un numero in una lista (`{vh:"4"}`, `{vh:"10"}`, `{vh:"1.2"}`) e la coreografia resta identica. Sul telefono cambiano **un parametro solo** — `pageScalar: 0.5` — e l'intero viaggio si dimezza (20.979 px → 10.634 px) senza toccare una singola animazione. E' il modo giusto di fare "la versione mobile piu' corta".

## Non verificato

- **La risposta della chat AI.** Ho scritto `what do you do for games?` e il messaggio e' entrato nel pannello con il disclaimer, ma non ho catturato la risposta del backend (probabilmente serviva piu' attesa, o la navigazione successiva l'ha interrotta). Non so quindi ne' il tono ne' la lunghezza delle risposte, ne' se la voce ElevenLabs venga effettivamente usata sul sito o solo in progetti clienti.
- **Il riconoscimento vocale (Vosk)**: il modello e' referenziato nel bundle ma non ho verificato se esista un pulsante microfono attivo nel sito pubblico.
- **La pagina di dettaglio di un progetto** (`/work/<slug>`): il clic programmato sui link del livello di accessibilita' non ha cambiato rotta, quindi non ho visto ne' il layout ne' i testi di una scheda aperta. So solo che esiste (il titolo del documento cambia in `${data.title} · Active Theory`) e che i campi disponibili sono titolo, sottotitolo, corpo, cliente, tag, data, link al progetto e al case study.
- **Il `[ MOBILE SYNC ]`**: c'e' un QR e una classe `SynchronizedObjects`, ma non ho provato la sincronizzazione telefono↔desktop, quindi non so cosa venga sincronizzato.
- **Theatre.js**: presente nel bundle, non so quali animazioni piloti davvero.
- **Il frame rate reale** e i punteggi Lighthouse: non misurati in modo attendibile (vedi sopra).
- **La data del premio Awwwards**: due fonti in disaccordo (6 febbraio 2024 sulla scheda, 18 settembre 2024 in una fonte secondaria).
- **Il CMS**: la struttura dei JSON somiglia molto a Payload CMS, ma non ho una conferma diretta. Curiosita': in produzione il sito carica i file `-dev.json`, perche' `window.PROD` non risulta impostato; i file `-latest.json` restituiscono 404.
- **La scena `TreeScene`** (210vh tra Work e Lab): non ha testo, non so se abbia un significato narrativo preciso o sia solo un passaggio.
- **Un avvertimento sul metodo**: la prima volta che ho scaricato `app.js` con `curl`, la CDN mi ha restituito il bundle di **un altro sito** (Vue + GSAP + Lenis + three.js). Se avessi scritto la scheda su quel file avrei dichiarato uno stack completamente sbagliato. La seconda richiesta, con parametro anti-cache, ha dato il file giusto — che di quelle librerie non ne ha nessuna.

## Fonti

- Sito: https://activetheory.net — bundle `assets/js/app.1780406240914.js`, `assets/data/uil.1780406240914.json`, `assets/js/hydra/hydra-thread.js`
- CMS: https://storage.googleapis.com/activetheory-v6.appspot.com/cms/projects-dev.json (65 progetti)
- Premio: https://www.awwwards.com/sites/active-theory-v6
- Case study tecnici dello studio (Medium, `medium.com/active-theory`):
  - "The Story of Technology Built at Active Theory" — nascita di Hydra e della sua GUI, e perche' hanno lasciato three.js: motore ottimizzato per "massima resa grafica con meno CPU", lavoro spostato su WebWorker, ricalcolo delle matrici solo quando un oggetto cambia davvero. https://medium.com/active-theory/the-story-of-technology-built-at-active-theory-5d17ae0e3fb4
  - "The Harmonic State" (IBM, 2021) — nuvole volumetriche renderizzate in un render target piccolo e poi ricampionate, **con la dimensione del render target decisa dalla GPU dell'utente**; approccio ibrido rasterizzatore + ray marcher. https://medium.com/active-theory/the-harmonic-state-9aee2ebda24f
  - "Million Piece Mission" (U.S. Air Force, 2020) — puzzle multiplayer da 1,2 milioni di pezzi su una foto da un gigapixel, con livelli di dettaglio "come Google Maps" e generatore procedurale di pezzi fatto in Houdini. https://medium.com/active-theory/million-piece-mission-62d6f658d307
  - "Fiomet" (2020) — riduzione di modelli CAD da 300k a 15–20k poligoni, profondita' di campo finta con poisson disk + blue noise, render target riusati tra scene. https://medium.com/active-theory/fiomet-case-study-9a0180268423
  - "Thorne: The Frontier Within" (2019) — un solo codice sorgente per il sito e per l'installazione fisica con sensori biometrici. https://medium.com/active-theory/thorne-the-frontier-within-7c97f8a49719
  - "Chrome Music Lab: Kandinsky" (2019) — linee calcolate e disegnate sulla GPU. https://medium.com/active-theory/chrome-music-lab-making-kandinsky-7de5ab04f4fe
