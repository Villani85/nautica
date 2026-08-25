# Orano — Innovation Experience

- **URL**: `https://www.orano.group/experience/innovation/en` — **oggi morto**. Verificato il 13/08/2026: `curl -I` restituisce **HTTP 404** sia su `/experience/innovation/en`, sia su `/fr`, sia sulla cartella `/experience/innovation/`, sia sul bundle JS. Il sito istituzionale `orano.group` è vivo, ma l'esperienza premiata è stata rimossa.
  **Questa scheda è ricostruita dall'archivio** — snapshot di riferimento `https://web.archive.org/web/20190408162951/https://www.orano.group/experience/innovation/en` (8 aprile 2019, ~4 mesi dopo il premio: è la prima cattura con tutti i bundle integri). Prima cattura utile dell'HTML: 13/04/2019. Ho letto direttamente i sorgenti archiviati: `app.6e0ef2bb317853100d6a.js` (461.632 byte), `vendor.f5677fb1aaa38558989a.js` (1.522.708 byte), `app.8405bfef406427a000495befa0d346fa.css` (169.126 byte). **Tutti i contenuti testuali, i colori, i tempi e i valori di animazione riportati sotto sono letti da quei file, non stimati.**
- **Premio**: Awwwards **Site of the Day del 26/11/2018** (voto 8,02/10 — Design 8,18 / Usability 7,52 / Creativity 8,44 / Content 8,06) e **Site of the Month di novembre 2018**. Developer Award 7,61 (WPO 8,40 · Responsive 7,40 · Semantics/SEO 7,00 · Markup/Meta-data 7,00 · Animations/Transitions **8,80** · Accessibility 6,80). Fonti: https://www.awwwards.com/sites/orano e https://www.awwwards.com/orano-from-immersive-garden-wins-site-of-the-month-novemeber.html
  **Nota di correzione**: non è Site of the Year 2018. Il Site of the Year 2018 è il Frans Hals Museum (vedi `frans-hals.md`). Orano è SOTD + SOTM.
- **Studio**: **Immersive Garden** (Parigi) — vedi `immersive-garden.md`. Agenzia cliente: **Grenade & Sparks**. Sound design: **Mooders**.
- **Anno**: 2018
- **Letto il**: 13/08/2026

---

## Cosa tratta il sito

Non è il sito di Orano. È un **micro-sito satellite** ospitato in una sottocartella del dominio istituzionale (`/experience/innovation/`), con un solo argomento: **quattro tecnologie che Orano usa per lavorare in ambiente radioattivo**.

Orano è il gruppo francese del ciclo del combustibile nucleare (l'ex AREVA, ribattezzata Orano nel gennaio 2018): miniere di uranio, arricchimento, riprocessamento, smantellamento di centrali. Il sito è nato nell'anno del rebranding.

Le quattro tecnologie, che sono anche le quattro sezioni del sito (slug e titoli letterali dal bundle):

| slug | titolo EN | titolo FR | oggetto reale |
|---|---|---|---|
| `protect` | **Protect** | Protéger | **NanoPix**, telecamera gamma miniaturizzata (7×3×5 cm, <300 g, "the smallest gamma camera in the world") |
| `validate` | **Validate** | Valider | **TQC2 / DIOTAPLAYER**, realtà aumentata su tablet per il controllo di conformità di impianti |
| `training` | **Training** | S'entraîner | **cabina di simulazione** per la guida del ponte polare in edificio reattore (7 schermi, 700 kg, 2,90×1,70×2,53 m) |
| `investigate` | **Investigate** | Investiguer | **droni** per topografia e fotogrammetria su siti minerari e cantieri di smantellamento |

Dentro ogni sezione c'è un vero dossier tecnico: specifiche, benefici, servizi, citazioni di dipendenti con nome e ruolo ("Yoann Richard, Geophysicist"), dati di precisione ("< 5 cm in planimetric measurement"), perfino il premio ricevuto dal consorzio GIP NO. **Non è un sito vetrina con quattro slogan: sono quattro schede prodotto lunghe**, riscritte dentro un mondo 3D.

## Cosa vende, e qual è l'obiettivo finale

**Non vende niente di acquistabile.** Non c'è carrello, non c'è listino, non c'è modulo di contatto, non c'è nemmeno un pulsante "richiedi informazioni". Ho controllato l'intero bundle: **zero form, zero campi input, zero indirizzi mail**. L'unico link in uscita è nel piede: `https://orano.group`, con etichetta `"Return to "` / `"Retour home "`.

Quello che vende è **la reputazione tecnologica del gruppo**. La tesi, dichiarata nel titolo della home:

> EN: **"Innovation is part of our DNA"**
> FR: **"Innover est en nous"**

E la frase dello studio, ripresa dall'articolo Awwwards: *"We, humans created nuclear power, yet it is not accessible for us. This virtual universe allows users to explore it."*

Gli obiettivi veri, in ordine di peso:

1. **Cambiare l'aggettivo associato al nucleare.** Il nucleare è "pericoloso e opaco". Il sito lo fa diventare "strumentato e sotto controllo": ogni sezione è uno strumento di misura che *tu* usi, e ogni strumento funziona.
2. **Reclutamento e attrattività.** Il pubblico che gioca con un ponte polare virtuale è un ingegnere di 25 anni, non un investitore di 60.
3. **Difesa preventiva sul tema sicurezza.** Le quattro tecnologie parlano tutte della stessa cosa: *tenere l'uomo lontano dalla radiazione*. NanoPix "reduces operator exposure"; il simulatore ha "no physical risks"; il drone copre "areas not sufficiently safe to be covered from the ground". È un argomento di licenza sociale, non di vendita.
4. **Vincere un premio.** Dichiaratamente sì — ed è riuscito.

**Lo scarto tra obiettivo dichiarato e obiettivo vero**: il sito dice "ecco le nostre innovazioni" e in realtà dice "**siamo gente che ha tutto sotto misura**". La prova non è nei testi, è nel fatto che gli strumenti nella pagina *funzionano*.

## A chi

Tre pubblici, in ordine di quanto il sito li serve bene:

- **Giovani ingegneri e neolaureati** (servito benissimo). Sa già cos'è la fotogrammetria, riconosce Unity3D e Navisworks citati nel testo, e i mini-giochi gli parlano.
- **Giornalisti, community del design, giurie** (servito benissimo, ed è metà del motivo per cui esiste).
- **Clienti industriali e prescrittori** — EDF, operatori di centrali, ministeri (servito **male**: nessun modo di prendere contatto; il dossier è ottimo ma finisce nel vuoto).

**Cosa sa già**: che il nucleare fa paura e che le aziende del settore comunicano poco.
**Cosa teme**: la retorica. Un'azienda nucleare che dice "sicurezza" senza mostrare niente peggiora la propria posizione.
**Cosa deve pensare uscendo**: *"questi hanno strumenti veri, e me li hanno fatti toccare"*. Non "che bel sito".

## L'esperienza progettata

**È un videogioco con dentro una brochure.** Non una brochure con dentro un videogioco: l'ordine conta, perché il 3D è il contenitore e i testi sono l'inserto.

Struttura in tre livelli, tutti sopra **una sola scena WebGL continua che non viene mai smontata**:

1. **Home** — logo, titolo, un pulsante che lampeggia, tre righe di sommario. Il 3D è già lì dietro, di notte, in wireframe.
2. **Slider** — un carosello di quattro mondi. Non è una griglia di card: la telecamera **vola fisicamente** da un mondo all'altro (60 unità di scena per scatto, 3 secondi). Frecce sinistra/destra della tastiera, swipe sul telefono.
3. **Sezione** (×4) — il mondo scelto si mette a fuoco. Sotto compare il dossier tecnico e **lo scroll della pagina è la carrellata della telecamera**: scendendo nel testo la telecamera scende nella scena, fino a depositarti dentro il mini-gioco che chiude la sezione.

Cosa deve **fare** il visitatore, passo per passo:

1. Alzare il volume (glielo chiede il preloader: *"Loading, please turn on your volume"* / *"Chargement, veuillez monter votre volume"*).
2. Premere **Enter** / **Découvrir** — un pulsante rettangolare che lampeggia ogni 0,3 s come una spia industriale.
3. Scegliere un mondo con le frecce (o il click sui due bottoni circolari laterali).
4. Dentro il mondo: **muovere il mouse** — la scena fa parallasse; **tenere premuto il tasto** — si apre un menu circolare attorno al puntatore con quattro inquadrature (*Zoom / Back / Front / Top*) e la telecamera si sposta su quella scelta; **passare sopra i punti caldi** — appaiono didascalie ancorate agli oggetti 3D.
5. **Scorrere** il dossier tecnico fino in fondo.
6. **Giocare** il mini-gioco finale della sezione (uno per sezione, quattro diversi).
7. Tornare al menu ("Live the experiences" / "Vivre les expériences") e ripetere per gli altri tre.

Il ritmo: **lento all'inizio** (quasi 4 secondi di apparizioni scaglionate in home prima che il testo sia tutto lì), **veloce nei passaggi** (3 s di volo con glitch), **lungo nella lettura** (6-8 blocchi di dossier), **di nuovo attivo alla fine** (il gioco).

**L'immagine che resta in testa**: un fusto giallo di scorie in un capannone al buio che, quando lo clicchi, si accende di colori termici dal centro verso l'esterno — e una scritta che dice *"Radioactivity detected"*.

## Come è organizzata la persuasione

La cosa notevole, e il motivo per cui questo caso è utile a un cliente industriale: **la persuasione non è costruita a imbuto, è costruita a dimostrazione ripetuta quattro volte**.

- **La promessa** sta nella prima schermata, ed è una frase sola: *"Innovation is part of our DNA"* + tre righe di sommario. Zero schermate di scroll: è tutto sopra la piega.
- **La prova** è di tre tipi diversi, e sono impilati:
  1. **prova tecnica** — numeri verificabili nel dossier (200 nSv/h → 30 Sv/h, < 5 cm di precisione planimetrica, 1300 MW e 900 MW di reattori modellati, 10 volte meno costoso di un rilievo aereo);
  2. **prova visiva** — l'oggetto ricostruito in 3D e girabile;
  3. **prova cinestetica** — il mini-gioco. È la più forte, e non la usa quasi nessuno.
- **Il prezzo**: non c'è, e non serve. Il prodotto è la fiducia.
- **La chiamata all'azione**: **assente**, e questo è il buco del progetto (vedi *Tre cose da rubare*, punto sul trapianto).
- Il "carrello" del sito, funzionalmente, è **il ritorno a orano.group** in fondo al piede, in maiuscoletto da 10 px.

**Cosa arriva a chi NON scorre fino in fondo** (la maggioranza):

- Chi si ferma alla **home**: riceve la frase-tesi, il logo e un'atmosfera. Il messaggio "innoviamo" arriva; il *perché crederci* no.
- Chi arriva allo **slider** e non entra: vede quattro mondi 3D distinti — miniera, capannone, cabina, terreno — e capisce che il gruppo fa cose diverse. Il messaggio geografico/industriale arriva **senza leggere una parola**.
- Chi entra in una sezione ma non scorre: la prima schermata gli dà titolo + *intro* (una frase completa e autosufficiente, scritta apposta: *"Thanks to NanoPix, this miniature gamma camera can squeeze itself into tiny spaces making the invisible visible."*) + un oggetto 3D che può girare col menu circolare. **Il messaggio arriva lo stesso.**
- Chi non arriva al mini-gioco perde **la parte migliore**. Ed è quasi certamente la maggioranza: il gioco sta in fondo a 6-8 blocchi di dossier tecnico. È il vero errore di progetto del sito — il momento più persuasivo è quello meno visto.

## Idea regista

**Il nucleare è invisibile: ogni sezione è uno strumento che lo rende visibile, e te lo mette in mano.**

## Il momento

**Il fusto che si accende.** In `protect`, arrivati in fondo al dossier, il mondo diventa un capannone al buio con dei fusti. Il puntatore si trasforma in un mirino a quattro angoli, con inerzia (`0,1` di lerp per fotogramma). Passi sopra un fusto: il mirino si stringe. Clicchi: parte il suono di validazione, appare *"Scan in progress…"*, e dopo **1,8 secondi** (la prima volta; **0,8 s** dalla seconda in poi) il fusto si accende dall'interno con una rampa termica — il codice tweena la `uFocusDistance.value.y` da 0 a **0,06** in 1 s con `Power2.easeOut`, contro una texture chiamata `heatGradientTexture`. La scritta diventa *"Radioactivity detected"*.

È il momento in cui il sito smette di parlare di sicurezza e te la fa fare.

**Il secondo momento**, questo sì visto da tutti: **il volo fra i mondi**. Nello slider, ogni cambio di sezione muove un contenitore della telecamera di 60 unità in Z, in 3 s con `Power3.easeInOut`, e durante il volo la posizione Y disegna una campana `sin(t·π)·0,6` con due micro-turbolenze sovrapposte, `sin(50t)·0,02` e `sin(40t)·0,02`. Cioè: **la telecamera scavalca, e mentre scavalca trema**. Sopra ci passa un glitch a fasce verticali. Nessuna dissolvenza, nessuna tendina: un movimento fisico.

## Struttura, sezione per sezione

Le rotte sono letterali, dal router (`mode: "history"`, `base: "/experience/innovation/"`):

| rotta | cosa mostra | cosa fa l'utente | durata |
|---|---|---|---|
| `/:lang/` (home) | logo Orano, `h1` animato lettera per lettera, pulsante `Enter`, sommario | preme il pulsante | 1 schermata, ~4 s di apparizioni |
| `/:lang/slider` | il carosello dei 4 mondi; titolo + descrizione + due bottoni circolari + paginazione | frecce ←/→, swipe, click | 1 schermata, 3 s per scatto |
| `/:lang/menu` | 4 voci giganti in maiuscolo con indice `01`–`04` in giallo; sfondo sotto glitch continuo | sceglie una voce | 1 schermata |
| `/:lang/protect` | dossier NanoPix: **7 blocchi** (picture-with-text, list-1, push, list-2, picture-with-text, list-1, list-2) + mini-gioco **barrels** | legge, tiene premuto per cambiare inquadratura, scorre, clicca i fusti | lunga |
| `/:lang/validate` | dossier TQC2/DIOTAPLAYER: **7 blocchi** (picture-with-text, simple-text, list-1, key, list-2, big-text, list-1) + mini-gioco **tank** | legge, scorre, trascina il cursore | lunga |
| `/:lang/training` | dossier simulatore: **5 blocchi** (picture-with-text, list-1, list-2, big-text, list-1) + mini-gioco **simulation** | legge, scorre, guida il ponte con 6 tasti | lunga |
| `/:lang/investigate` | dossier droni: **6 blocchi** (picture-with-text, list-1, list-2, picture-with-text, simple-text, list-1) + mini-gioco **droning** | legge, scorre, pilota il drone | la più lunga |
| `/:lang/*` | 404 | — | — |

I tipi di blocco disponibili nel dossier sono **sette** e stanno tutti nei dati, non nel codice: `picture-with-text`, `simple-text`, `list-1` (elenco numerato con indice in un quadrato giallo), `list-2` (elenco a colonne con titoli), `big-text` (citazione gigante in Blender Pro), `key` (numero-chiave gigante su fascia), `push` (due dati appaiati + claim), `interaction-*`. **È un mini-CMS a blocchi**, con un campo `margin` (`small` / `medium` / `large` / `very-large`) per il ritmo verticale. Da rubare così com'è.

**Quante schermate di scroll**: `non verificato` in modo esatto — servirebbe rendere la pagina. Ma dalla struttura dati (5-7 blocchi + immagini da 500-630 px di altezza + margini fino a 180 px) e dal fatto che la telecamera di `investigate` deve percorrere **43,7 unità di scena** in verticale contro le 2,7 di `protect`, la sezione droni è di gran lunga la più lunga: il fattore fra la più corta e la più lunga è **16×** in corsa di telecamera.

## L'esperienza in ordine di tempo

**I primi dieci secondi (desktop, prima visita).**

- **0 s** — schermo nero-blu (`#05070f`). Compare il preloader: un cerchio e la scritta *"Loading, please turn on your volume"* in maiuscoletto da 12 px, spaziatura 0,2 em, opacità 0,5.
- **0-3 s** — si scaricano in parallelo: bundle (≈630 KB compressi), i due loop musicali (≈1,03 MB **ciascuno**, entrambi con `autoplay: true`), la texture del terreno (241 KB), le due texture SMAA, il gradiente del glitch.
- **~3 s (fine primo passo del caricamento)** — parte `world.playLoading()`: nasce la scena. La telecamera è nello stato `protectPreIntro`, che su desktop sta a **z = −80,41** — lontanissima. Parte la musica principale con una salita di volume di 1 s da 0 a 1.
- **+0,12 s dal montaggio della home** — appare il pulsante `Enter`, che comincia a **lampeggiare ogni 0,3 s**.
- **+2,0 s** — parte il titolo: *"Innovation is part of our DNA"*, lettera per lettera, con separazione RGB (vedi *Animazioni*).
- **+3,0 s** — il pulsante smette di lampeggiare e resta acceso: ora è "armato".
- **+3,9 s** — appaiono insieme il **logo Orano** in alto e il **sommario** in basso.
- Nel frattempo, in sottofondo, si caricano i **22 modelli OBJ** e le altre 14 texture.

**Poi, a blocchi.**

- **Click su Enter** → rotta `slider`. Suono `click` + suono `transition`. La telecamera esce dal preintro e si porta a `protectFocus`. Compare la scritta *"Scroll to discover"* in **giallo #ffe600**.
- **Freccia destra** → `experience.changeIndex`: volo di 60 unità in 3 s con la campana di rimbalzo, glitch verticale a fasce sopra, suono `Chgt DECOR`. Il titolo della sezione si smonta e si rimonta lettera per lettera. Il pulsante lampeggia per 2 s a intervalli di 75 ms.
- **Entrata in una sezione** → la musica **incrocia**: `ambientDefault` scende da 1 a 0 e `ambientUnder` sale da 0 a 1, in **1500 ms**. Cioè le due tracce girano sempre entrambe, in loop, e cambia solo il mix. Uscendo, oltre all'incrocio inverso, parte il suono `woosh` ("Zoom back home").
- **Dentro la sezione** → si accendono i **punti caldi**: pallini ancorati a coordinate 3D dell'oggetto (posizioni letterali nei dati, es. NanoPix a `{x: −0,15, y: 0,58, z: −0,05}`), che compaiono solo se la loro proiezione a schermo è a più di **100 px** dal bordo (**50 px** sotto i 1023 px di larghezza). Ogni hover suona `HOTSPOT`.
- **Tieni premuto il tasto** → compare la scritta *"Click and hold"* / *"Cliquez et maintenez"*, si apre un anello attorno al puntatore con 4 spicchi (*Zoom / Back / Front / Top*); ruotando scegli, e la telecamera interpola verso quell'inquadratura in 1 s con `Power3.easeInOut`.
- **Scroll** → la telecamera scivola dallo stato `<slug>Focus` verso `<slug>Experience`, con `progress` del documento come miscelatore.
- **Fondo pagina** → il mini-gioco. Vinto il gioco, suono `Valid` e compare la conclusione didattica (il testo `conclusion` di ogni interazione).

## Animazioni

| elemento | cosa si muove | legato a | curva / inerzia | note |
|---|---|---|---|---|
| telecamera, posizione e rotazione | interpolazione continua verso il bersaglio | tick + progresso di scroll | lerp `+= (target − value) · delta · 0,008` | **è il cuore del sito**: nessun `ScrollTrigger`, solo un `progress` 0→1 che miscela due stati |
| telecamera, cambio sezione | contenitore mosso di 60 unità in Z | evento `experience.changeIndex` | `TweenLite` 3 s, `Power3.easeInOut` | + campana `y = sin(t·π)·0,6` e turbolenze `sin(50t)·0,02`, `sin(40t)·0,02` |
| telecamera, parallasse (desktop) | pan e rotazione | posizione del mouse | lerp `0,002` per delta; ampiezza `0,06 / 0,04` | ampiezza dichiarata **per stato**: `0,02` nell'intro, `0` nel gioco |
| telecamera, parallasse (telefono) | pan e rotazione | **giroscopio** (`deviceorientation`) | stesso lerp | `beta`/`gamma` scalati ×0,02-0,04 e **saturati a ±0,5** — vedi *Mobile* |
| telecamera, inquadrature | salto su una delle 2-4 pose predefinite | menu circolare (tieni premuto) | 1 s `Power3.easeInOut` + lerp `0,01` | le pose sono un array `angles` nei dati, per stato |
| titoli (`app-animated-text`) | ogni lettera appare con ritardo proprio | montaggio del componente | transizione CSS, **ritardo = `charCode % 10 × 0,16 s`** | vedi *Tre cose da rubare* |
| titoli, separazione RGB | copie rossa/verde/gialla della lettera che rientrano | stessa transizione | ritardi sfalsati di `+0,5 s` | copie generate solo se `(charCode+4) % 10 > 5` |
| griglia di fondo | le linee più vicine **si agganciano ai bordi** dell'elemento sotto il mouse | hover su qualunque elemento interattivo | transizione CSS sui `transform` | vedi *Tre cose da rubare* |
| griglia, parallasse | traslazione verticale delle orizzontali | progresso di scroll | `−progress · altezzaViewport · 3` | `parallaxMultiplier: 4`, disattivata su mobile |
| pulsante principale | lampeggio | `setInterval` a **300 ms** | nessuna | si spegne quando diventa "attivo" |
| passaggio al menu | glitch a fasce **orizzontali** + saturazione | rotta | `TimelineLite` a `timeScale(0,7)`, ~1,8 s | `uTileAmplitude: 2`, `uTileOffset: (0,10 / 0,03)`, saturazione che sale a **2,5** e rientra in 1,8 s |
| passaggio fra sezioni | glitch a fasce **verticali** | rotta | timeline 3 s | `uTileAmplitude: 3`, `uTileOffset: (0,03 / 0,10)` |
| aberrazione cromatica | separazione RGB radiale su tutto lo schermo | stato di rotta (`experienceRgbOffset`) | pass permanente | `strength: 15`, `radialDumping: (0,5, 0,5, 1, −0,5)`, `teint: (1,165, 1,132, 1,274)` |
| oggetti 3D, comparsa | dissolvenza per distanza dal punto di rivelazione + fluttuazione | shader | `step()` su `distance(position, uRevealPosition)` | l'alfa oscilla con tre seni a frequenze `1,0 / 1,754 / 0,679` |
| terreno | onda, distorsione, colore | shader | uniform `uWaveDistance: 2`, `uWaveAmplitude: 1`, `uElevationNoiseMultiplier: 0,07` | materiale `AdditiveBlending`, `depthWrite: false`, `flatShading` |
| fusto scansionato | rampa di colore termico dal centro | click | `TweenLite` 1 s `Power2.easeOut` su `uFocusDistance.y` → 0,06 | ritardo 1800 ms la prima volta, 800 ms poi |
| carico del ponte (training) | il colore vira al rosso se oscilla | velocità > 0,002 | `fromTo` 2 s da `(129,53,53)/255/2` a `(0,12, 0,12, 0,12)` | vittoria: colore fisso `(0,3, 0,6, 0)` e la struttura sale di 1,25 in 2 s |
| forma d'onda del suono | sinusoide disegnata su canvas 30×30 | tick | ampiezza moltiplicata per `0,1 + 0,9 · volume` | l'icona audio **è** il volume: piatta quando è muto |
| onda audio, hover | la velocità passa da `0,0035` a `0,008` | mouse sopra l'icona | immediata | dettaglio da un centesimo di secondo, ma è quello che si nota |

Libreria dietro gli effetti: **GSAP 1.x** (`TweenLite`, `TimelineLite`, ease `Power2`/`Power3`) per tutto ciò che è a tempo; **nessuna libreria di scroll** (niente Locomotive, niente Lenis, niente ScrollTrigger): lo scroll è nativo, letto con `window.pageYOffset`, normalizzato a 0-1 e usato come miscelatore. Le inerzie sono lerp scritte a mano nel tick.

## Colori

Letti dal CSS archiviato e dal codice del renderer.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| fondo scena (WebGL) | `#05070f` | `renderer.setClearColor(329487)` = 0x05070F. È **anche** il fondo dei pannelli di testo, a opacità 0,5 / 0,65 / 0,7 / 0,75 / 0,85 |
| fondo interfaccia scura | `#0f0f18` | piede su mobile (barra fissa alta 75 px, 55 px sotto i 579 px) |
| testo principale | `#ffffff` | tutto il corpo (`body { color: #fff }`) |
| **accento, giallo Orano** | `#ffe600` | indici `01`–`04` del menu, titoli di elenco, etichetta "Scroll to discover", bordi dei quadrati d'indice a `rgba(255,230,0,.6)` |
| accento, variante | `#fee600` | 15 occorrenze — **c'è una seconda tonalità di giallo a un punto di distanza**, quasi certamente un refuso di brand mai riconciliato |
| accento 3D | `(1, 0,9, 0)` | `uFocusColor` degli shader: il giallo del "fuoco" sugli oggetti in scena |
| testo su giallo | `#161611` | etichetta del menu circolare (nero caldo, non nero puro) |
| testo attenuato | `#cfcfcf` | citazioni `big-text` |
| testo molto attenuato | `#8e8e8e`, `#898989`, `#6b6b6b` | didascalie, numeri in secondo piano |
| verde di conferma | `#0aff15` | stati "riuscito" nell'interfaccia; in 3D `(0,3, 0,6, 0)` |
| rosso di allarme | `rgb(129, 53, 53)` diviso 2 → ≈`#402a2a` | flash del carico che oscilla nel simulatore (solo shader, non CSS) |
| grigio neutro 3D | `(0,12, 0,12, 0,12)` | colore di riposo di terreni e strutture |
| sfumature | `rgba(5,7,15,0)` → `rgba(5,7,15,.85)` | 8 gradienti per staccare i testi dal 3D |

**La palette è tre colori**: blu-nero quasi nero, bianco, giallo. Il giallo compare **solo** su indici, etichette e sul fuoco 3D — mai su superfici grandi. Awwwards riporta `#ECD06F` come colore estratto: è un'estrazione automatica dallo screenshot, **non un colore del sito**.

## Tipografia

Due famiglie, entrambe **servite in locale, con subset, in woff2 + woff**. Nessun servizio esterno, nessun `@import`, nessuna richiesta a terzi.

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| titolo home / titolo sezione | Blender Pro | **100** (Thin) | 60 px → 52 → 46 → 43 → 40 → **37** | 1,2 em (1,1 e 1,0 sotto) | maiuscolo, **spaziatura 0,2 em** (0,15 em sotto i 579 px) |
| voci di menu | Blender Pro | 100 | 80 px di riga, **60 px** → 55 → 50 → 45 → 40 → **30** | riga = altezza | maiuscolo, 0,2 em |
| indice di menu `01`–`04` | Blender Pro | 100 | 16 px | 80 px | giallo `#ffe600`, 0,075 em |
| citazione `big-text` | Blender Pro | 100 | 50 px → 45 → 40 → 35 → **30** | — | maiuscolo, 0,2 em, `#cfcfcf` |
| numero-chiave `key` | Blender Pro | — | ~65 px → 56 → 47 → 40 → **35** | — | il "fade" secondario a 50 px in `#6b6b6b` |
| indice di elenco | Blender Pro | **500** (Medium) | 22 → 20 → 18 → **16** px | quadrato 60→40 px | bordi gialli al 60% |
| pulsante `Enter` | — | — | 17 px → 15 px | riga 60 → 50 px | maiuscolo |
| titoletto di elenco | Nunito Sans | 100 | **14 px** | 1,8 em | maiuscolo, **spaziatura 0,25 em** — la più larga del sito |
| corpo | **Nunito Sans** | **300** (Light) | **16 px** globale, `#app` a 15 px sotto 1199 px e **14 px** sotto 767 px | 1,5-1,8 em | `-webkit-font-smoothing: antialiased` |
| istruzioni dei giochi | Blender Pro | 100 | 16 → 15 → 14 px | 1,8 → 1,5 em | su pannello `rgba(5,7,15,.5)` |
| piede | Nunito Sans | 300 | **10 px** | — | maiuscolo, 0,15 em, **smoothing disattivato apposta** (`-webkit-font-smoothing: auto`) |

**Blender Pro** è un carattere tecnico/militare (Blender Foundation, disegnato da Nick Roach): squadrato, geometrico, con le sue vere maiuscole strette. È la scelta che fa "strumentazione" prima ancora che si legga una parola. **Nunito Sans** è il contraltare umanista per i paragrafi lunghi — è anche l'unico font della coppia che sia gratuito e disponibile ovunque.

Il dettaglio da rubare: **la scala tipografica scende per gradini dichiarati** (60 → 52 → 46 → 43 → 40 → 37) invece che con un `clamp()`. Sono sei punti di rottura su un titolo. E il piede **disattiva l'antialiasing** perché a 10 px in maiuscoletto l'antialiasing sporca; su tutto il resto è attivo.

Trucco di caricamento visto nel CSS: `#app:after { content:""; position:fixed; font-size:0; font-family: Blender Pro }` — un elemento invisibile che **forza il browser a scaricare il font** anche se in quel momento nessun testo lo usa.

## Testi veri

**Home (EN)**
> Titolo: `Innovation is part of our DNA`
> Sommario: `Intervention in nuclear environment is leading us to innovate over and over, in order to enhance  safety and security. The driver of our  creativity is the safey  of our operators, leveraging and empowering them in harsh situations.`
> *(sic: doppi spazi e "safey" al posto di "safety" sono nel file. Il testo inglese non è stato riletto.)*

**Home (FR)**
> Titolo: `Innover est en nous`
> Sommario: `Intervenir en milieu radioactif nous pousse à innover en permanence pour assurer toujours plus de sûreté et de sécurité. Protéger les femmes et les hommes, les préparer et les entraîner aux situations complexes sont nos moteurs de créativité.`

**Interfaccia (EN → FR)**
| chiave | EN | FR |
|---|---|---|
| `explore` | `Enter` | `Découvrir` |
| `officialSite` | `Return to ` | `Retour home ` |
| `menuOpen` | `Live the experiences` | `Vivre les expériences` |
| `menuClose` | `Close` | `Fermer` |
| `scroll` | `Scroll to discover` | `Scroller pour découvrir` |
| `loading` | `Loading, please turn on your volume` | `Chargement, veuillez monter votre volume` |
| `clickHold` | `Click and hold` | `Cliquez et maintenez` |
| menu circolare | `Zoom` / `Back` / `Front` / `Top` | `Zoom` / `Arrière` / `Avant` / `Dessus` |
| `menu.toCome` | `To come` | `À venir` |

**Menu**: `01 Protect` · `02 Validate` · `03 Training` · `04 Investigate` (FR: `Protéger` · `Valider` · `S'entraîner` · `Investiguer`). Tutte e quattro `active: true`; esiste però uno stato "bloccato" con lucchetto e etichetta *To come* — **l'impianto era predisposto per una quinta sezione mai pubblicata**.

**Le quattro aperture di sezione (EN, testuali)**
> **Protect** — `Locating gamma radiation sources in nonaccessible area is challenging, and a major safety concern. Thanks to NanoPix, this miniature gamma camera can squeeze itself into tiny spaces making the invisible visible.`
> **Validate** — `The TQC2 (as designed/as built) project aims to use augmented reality to facilitate compliance monitoring on potentially complex equipment or facilities, while offering better traceability and improving the comfort of operators.`
> **Training** — `Training in the driving of a polar crane in a nuclear power plant in order to practice handling heavy loads and dealing with situations that are hazardous or require familiarization prior to implementation: moving large components in and out of the zone, positioning and maintenance of tooling.`
> **Investigate** — `Drones have become essential in a number of our core businesses including our mining and dismantling & services activities. They are used at different stages of the lifecycle of a mine, from exploration to rehabilitation, as well as for inspection.`

**I testi dei quattro mini-giochi** (istruzione → esito → conclusione didattica). Sono la parte meglio scritta del sito:

> **barrels** — `Scan the area using the NanoPix camera, to highlight radioactive locations` → `Click on the barrels to scan` → `Scan in progress…` → `Radioactivity detected` → conclusione: `The Nanopix has detected radioactivity on the barrel, warm colours indicate the area with the highest concentration`
> **tank** — `Verify that the delivered object matches your design intentions` → `Drag the cursor to verify the object's conformity` → `Discrepancy detected!` → conclusione: `When receiving equipment the tool enables real-time visualisation to compare any possible discrepancies with your blueprints.`
> **simulation** — `Install the component in its container within the reactor.` → `The operations manager has validated your scenario!` → conclusione: `The simulation cabin saves data from your situational attempts to facilitate analysis and improvement alongside your instructor at the end of the session.`
> **droning** — `Explore the area to determine the mining site's dimensions and topography.` → `You've mapped the area and enabled the teams to proceed with pipeline optimisation!` → conclusione: `The images are enhanced with a photogrammetry software that generates a dot cloud from which are exported the rectified images and topographical grids.`

**Lo schema è sempre lo stesso, e vale come formula riusabile**: *istruzione all'imperativo → conferma di successo con una conseguenza aziendale reale → una riga tecnica che spiega cosa hai appena fatto davvero.* Il terzo tempo è quello che trasforma il giochino in argomento di vendita.

**Punti caldi (esempi testuali, EN)**
> `Due to its small size, the NanoPix is easy to transport`
> `The camera can also be mounted on robots, mechanical arms and drones`
> `The positioning of the seven screens is optimised for total immersion inside the environment, with identical audio and heat conditions`
> `Drones are used in exploration and support missions for mining or denuclearisation activities`

**Citazione dal dossier `investigate`**, con attribuzione:
> `« The drone is a solution which is a valuable addition to our current portfolio. It helps us to target areas which are often considered too small to justify an aerial overflight. It also makes it possible to cover areas that are hard to access or not sufficiently safe to be covered from the ground »` — **Yoann Richard, Geophysicist**

**Piede**: selettore lingua `en` / `fr` + icona audio (onda animata) + `Return to ` con link a `https://orano.group`.

## Mobile

**Questo è il caso raro: sul telefono NON è un altro sito.** Ed è una scelta esplicita, non una svista.

**Come viene deciso**: non da una media query, ma da **`platform.js`** che legge la famiglia del sistema operativo. `platform.mobile = ["Android","iOS","Windows Phone"].indexOf(os.family) !== −1`. Cioè: **un iPad è "mobile", un portatile con schermo piccolo no.** Scelta discutibile ma coerente col fatto che quello che cambia è l'*input*, non lo spazio.

**Cosa RESTA (tutto il peso):**
- La stessa scena WebGL, gli stessi **22 modelli OBJ (891,6 KB)**, le stesse texture, gli stessi shader, gli stessi **2,2 MB di audio**. Nessuna versione leggera, nessun fallback a immagine. Un telefono del 2018 si scaricava e renderizzava esattamente quello che si scaricava un desktop.
- I quattro mini-giochi, tutti e quattro.
- L'intero dossier testuale.
- `setPixelRatio(Math.min(devicePixelRatio, 2))` — **il telefono renderizza a 2×**, quindi in pixel reali fa più lavoro del desktop. Contrappeso: il pass SMAA è attivo **solo** se `devicePixelRatio <= 1`, quindi su telefono l'antialiasing di post-produzione è spento (glielo fa già la densità).

**Cosa viene SOSTITUITO:**
- **La parallasse del mouse diventa il giroscopio.** Su desktop `pan.target = cursor.ratioFromCenter × ampiezza`. Su mobile si registra `deviceorientation` e si usano `beta`/`gamma`, con **tre casistiche per `window.orientation` (0, 90, −90)**, scalatura ×0,02-0,04, un offset fisso di `−0,32π` per compensare l'inclinazione naturale con cui si tiene il telefono, e **saturazione dura a ±0,5** perché altrimenti girando su sé stessi la scena si strappa. Non è un ripiego: è la versione *migliore* dell'effetto.
- **Le frecce della tastiera diventano lo swipe.** Soglia minima **20 px**, sull'asse X, registrata su `document.body`.
- **I comandi dei giochi diventano bottoni a schermo.** Nel simulatore i sei pulsanti prendono la classe `is-mobile`; nel drone i due pulsanti `shift` e `space` **spariscono del tutto** (`v-if` negato su `platform.mobile`), quindi sul telefono il drone si pilota solo su due assi invece di tre.
- **La scansione dei fusti passa a `touchstart`**, e il mirino non insegue più il dito: la posizione viene forzata sul punto toccato (`forceUpdate`).
- **Le pose di telecamera sono un secondo set completo.** Esiste una tabella `portrait` parallela a `landscape` con tutti e 13 gli stati riscritti a mano. Esempio: `protectPreIntro` in orizzontale sta a **z = −80,41** (arrivo da lontanissimo), in verticale a **z = −5,8** — cioè **su telefono l'ingresso spettacolare da lontano non c'è**, si parte già addosso all'oggetto, perché con un campo visivo verticale quel volo non si leggerebbe.

**Cosa SPARISCE:**
- **Il menu circolare "tieni premuto"** — disabilitato esplicitamente (`&& !platform.mobile`). Con lui spariscono le **inquadrature alternative**: nella tabella `portrait` il campo `angles` è **`null` su tutti e 13 gli stati**, mentre in `landscape` ha 2-4 pose per scena. Su telefono l'oggetto lo guardi da dove ti mettono.
- **L'aggancio della griglia all'hover** — non c'è hover; e la parallasse della griglia è disattivata con un `if (!platform.mobile)` in cima a `updateScrollProgress`.
- Sotto **767 px** spariscono via CSS: il **logo in home**, l'etichetta "Scroll to discover", l'etichetta testuale del pulsante menu (resta solo l'icona a 6 barre), il pannello sinistro del gioco dei fusti, le due sfumature sopra/sotto.
- Sotto **579 px** spariscono anche: il **titolo principale nella barra**, la **paginazione dello slider**, il secondo pulsante, l'etichetta "To come", e un elemento decorativo dei blocchi immagine.
- Il piede cambia natura: da elemento fisso appoggiato all'angolo destro (`left: calc(100vw − 60px)`) diventa una **barra piena alta 75 px** (55 px sotto 579 px) con fondo `#0f0f18`.

**Sei punti di rottura** in tutto: 1599, 1199, 1023, 767, 579, 440 px — più tre regole su `orientation: portrait`. La densità di regole dice dove hanno sudato: **99 blocchi a 1023 px, 87 a 1199 px, 64 a 767 px**.

**Il giudizio**: è la strategia opposta a Obys o Aristide Benoist (due siti diversi) e uguale a Igloo (stesso peso ovunque). Qui però ha una giustificazione che Igloo non ha: **il contenuto è il 3D**. Togliere il 3D avrebbe tolto la tesi. Il costo lo si paga in Responsive 7,40 su Awwwards — il punteggio più basso dopo l'accessibilità.

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| framework | **Vue.js 2.5.3** | **VERIFICATO** | `version:"2.5.3"` in `vendor.js`; componenti compilati con `render()`/`staticRenderFns`, CSS con scope `data-v-*` |
| routing | **vue-router 3.0.1**, `mode: "history"`, base `/experience/innovation/` | **VERIFICATO** | `Lt.version="3.0.1"` in `vendor.js`; tabella rotte in chiaro in `app.js` |
| build | **webpack** con `webpackJsonp`, hash nei nomi, chunk `manifest`/`vendor`/`app` | **VERIFICATO** | prima riga di `app.js`; nomi dei file |
| stili | **Stylus** | **SUPPOSTO** (dichiarato dallo studio su Awwwards) | il CSS compilato non lo prova; lo dice l'articolo SOTM |
| 3D | **Three.js r95** | **VERIFICATO** | `m="95"` esportato come `REVISION` in `vendor.js` |
| post-produzione | **`postprocessing`** (il pacchetto di vanruesc, non gli esempi di three) | **VERIFICATO** | `EffectComposer(renderer, {depthTexture:true})`, `SMAAPass`, `RenderPass`, e nel bundle ci sono anche `BloomPass`, `BokehPass`, `GodRaysPass` **mai usati** |
| pass attivi | `RenderPass` → `SMAAPass` (solo se DPR ≤ 1) → **RGB-offset radiale** (custom) → **2 × glitch a fasce** (custom, spenti a riposo) | **VERIFICATO** | costruzione della catena in `app.js` |
| shader | **GLSL scritto a mano**, incluso come stringhe nel bundle | **VERIFICATO** | decine di moduli `e.exports="uniform ...\n"`; fra questi un vero **effetto raggi-X** con `pow(uC − dot(normal, viewVector), uPower)` e un test punto-in-triangolo per la maschera |
| modelli | **22 file `.obj`** esportati da **Blender 2.79** | **VERIFICATO** | l'intestazione `# Blender v2.79 (sub 0) OBJ File: 'barrels-1.blend'` è leggibile nei data-URI base64 dentro il bundle |
| animazione | **GSAP 1.x** — `TweenLite`, `TimelineLite`, `TimelineMax`, `CSSPlugin`, `BezierPlugin` v1.3.8 | **VERIFICATO** | esportazioni in `vendor.js`; ease usati: `Power2.easeInOut/easeOut`, `Power3.easeInOut/easeOut` |
| scroll | **nessuna libreria**. `window.pageYOffset` normalizzato a 0-1, letto nel tick | **VERIFICATO** | `setScroll()` in `app.js`; fallback su `document.body.scrollTop` **solo per IE 11** |
| audio | **Howler.js**, 8 file MP3, 2 loop musicali sempre in riproduzione con mix incrociato | **VERIFICATO** | `new Q.Howl({...})` per ognuno; `Howler.volume()` globale |
| rilevamento piattaforma | **platform.js** | **VERIFICATO** | `platform.os.family`, `platform.name`, e due classi appese all'`<html>`: `browser-*` e `version-*` |
| i18n | **oggetto JS in chiaro**, due lingue (`en`, `fr`), fallback su `navigator.language` | **VERIFICATO** | modulo `jw4L` che esporta `{fr, en}`; guardia `beforeEach` nel router |
| CMS | **nessuno**. Tutti i contenuti sono **compilati dentro il bundle** | **VERIFICATO** | i due dizionari occupano ~46 KB dei 461 KB di `app.js`; nessuna chiamata di rete per i contenuti |
| font | **self-hosted**, subset, woff2 + woff. Blender Pro (Thin 100, Medium 500), Nunito Sans (ExtraLight 200, Light 300, Regular 400) | **VERIFICATO** | 5 `@font-face` nel CSS, file `subset-*` sullo stesso dominio |
| analytics | **AT Internet** (`smarttag.js` da `tag.aticdn.net`) + **Google Analytics** `UA-118705249-1` | **VERIFICATO** | script nel `<head>`; `router.afterEach` fa `tag.page.set({}); tag.dispatch()` |
| hosting | stesso dominio del sito istituzionale, in sottocartella | **VERIFICATO** | percorsi e `window.environments` con la regex `/^https?:\/\/(www.)?orano.group/` |
| IE 11 | **supportato con degradazione dichiarata**: `useComposer: false` (niente post-produzione) e scroll sul `body` | **VERIFICATO** | due condizioni esplicite su `browser.name === "ie" && version === "11.0"` |

**Va detto per intero**: è una **single page application con guscio vuoto**. L'HTML servito contiene `<div id="app"></div>` e tre `<script>`. Nessun contenuto, nessun `h1`, nessun testo nel sorgente. Tutto quello che ho descritto sopra viene dal JavaScript. Questo spiega i due punteggi più bassi del Developer Award (Semantics/SEO 7,00 e Markup/Meta-data 7,00) e **oggi sarebbe una scelta insostenibile**: nel 2018 non c'erano modelli linguistici che leggono i siti.

## Peso e prestazioni

Numeri veri, misurati dai record dell'archivio (la lunghezza dei record CDX è la dimensione **trasferita**, cioè compressa; ho verificato la corrispondenza confrontandola con i file scaricati).

| voce | trasferito | non compresso |
|---|---|---|
| `vendor.js` (Three r95 + Vue + vue-router + GSAP + Howler + postprocessing) | **474,0 KB** | 1.522.708 byte (1,45 MB) |
| `app.js` (l'intero sito: componenti, shader, contenuti, 22 riferimenti a modelli) | **113,3 KB** | 461.632 byte |
| `manifest.js` | 1,4 KB | — |
| `app.css` | **40,8 KB** | 169.126 byte |
| **totale codice** | **≈ 629 KB** | ≈ 2,15 MB |
| audio (8 MP3) | **2.251,5 KB** — di cui **1.054,8 + 1.054,1 KB** i due loop musicali | — |
| texture del mondo (13 PNG/JPG) | **1.204,6 KB** | — |
| **modelli 3D (22 `.obj`)** | **913,0 KB** | — |
| immagini di contenuto (10 JPG del dossier) | 1.047,6 KB | — |
| immagine di condivisione social | **664,5 KB** (`share-1200x630.jpg` da solo **575,6 KB**) | — |
| font (5 woff2 + 5 woff = 148,9 KB; **in uso sui browser moderni solo i 5 woff2 ≈ 66,9 KB**) | 148,9 KB | — |
| **TOTALE sito completo** | **≈ 6,62 MB** | — |

**Conferma esterna**: lo studio dichiara ad Awwwards *"30 3D models optimized to 901KB (gzipped)"*. Io ne conto **22** per **913,0 KB**. I numeri combaciano: gli 8 mancanti sono probabilmente conteggi separati di sotto-oggetti. **È un dato dichiarato che regge alla verifica** — cosa non scontata (vedi `_PRESTAZIONI.md`).

**Il primo caricamento** (rotta home, prima del secondo passo del loader) è: 629 KB di codice + 66,9 KB di font woff2 + le due texture SMAA + il gradiente del glitch + la texture del terreno (241,3 KB) + **i due loop musicali (2,06 MB, entrambi con `autoplay: true`)**. Ordine di grandezza: **~3 MB prima di vedere la scena in movimento**, di cui **il 68% è musica**. I 22 modelli e le altre 14 texture arrivano dopo, in un secondo passo, mentre la home è già interattiva.

**Il dato che pesa di più su questo sito è la musica.** Due tracce da ~1 MB ciascuna, tenute **entrambe in riproduzione per tutta la sessione** (loop infinito, volume incrociato a 1500 ms al cambio di rotta). È la stessa lezione di `_SUONO.md`: la musica costa più della geometria. Qui la musica pesa **2,3 volte** tutti i modelli 3D messi insieme, e i sei effetti di interazione costano invece **142 KB in tutto** — meno di un'immagine del dossier.

**Punteggio WPO Awwwards: 8,40**, il più alto dei sei sotto-punteggi tecnici. **Lighthouse / Core Web Vitals: non verificato** — il sito non esiste più e l'archivio non è misurabile in modo onesto.

Tre scelte di prestazione che vale la pena registrare:
- **`camera.far = 40`** con `PerspectiveCamera(35, aspect, 0,1, 40)`. Un piano lontano cortissimo: tutto quello che non serve è già fuori.
- **`WebGLRenderer({ stencil: false, depth: true, alpha: true })`** — stencil buffer disattivato esplicitamente.
- **`setPixelRatio(Math.min(devicePixelRatio, 2))`** con SMAA acceso solo sotto DPR 1. Cioè: **o densità o antialiasing, mai tutti e due.**

## Tre cose da rubare

**1. La griglia che si aggancia a quello che stai puntando.**
Sul fondo c'è una griglia di linee sottili in DOM (non canvas): `n` verticali e `n × 4` orizzontali, posizionate con `transform: translateX/Y`. Quando il mouse entra in un elemento interattivo, il componente prende il `getBoundingClientRect()` dell'elemento, **cerca le quattro linee più vicine ai quattro lati** (la verticale più vicina a sinistra del centro, quella più vicina a destra, l'orizzontale più vicina sopra, quella sotto) e **le riscrive esattamente sui bordi dell'elemento**. Uscendo, tornano al loro posto. La transizione la fa il CSS.
Costo: zero librerie, zero WebGL, un array di numeri e una transizione. Effetto: il fondo *sa* dove stai guardando, e ogni pulsante sembra un mirino che si chiude. Su un sito industriale ha anche il significato giusto: **misura**.
Sopra ci sta un secondo strato di parallasse — le orizzontali si muovono a `−progress × altezzaViewport × 3` — che fa profondità senza toccare il layout.

**2. Il testo che si compone con ritardi decisi dai caratteri stessi.**
`app-animated-text` spezza la stringa in parole e ogni parola in lettere, e assegna a ciascuna un ritardo così:
```
transition-delay = (charCodeAt(0) % steps) × (duration / steps)     // steps=10, duration=1.6s
```
Cioè: **il ritardo di ogni lettera è il suo stesso codice ASCII modulo 10**. Pseudo-casuale, deterministico, identico a ogni ricarica, calcolato una volta sola in fase di render — **zero JavaScript per fotogramma**. Sopra, la stessa lettera viene duplicata in copie rossa, verde e gialla che partono spostate e rientrano con `+0,5 s` di ritardo — ma **solo per le lettere che soddisfano `(charCode + 4) % 10 > 5`**, cioè circa metà. L'aberrazione cromatica del titolo è quindi **irregolare per costruzione**, non con `Math.random()`.
È il modo più economico che ho visto di ottenere un'apparizione tipografica "da glitch" senza SplitText, senza GSAP, senza canvas.

**3. La formula in tre tempi del mini-gioco che vende.**
Ogni sezione finisce con un'interazione di 20 secondi, e i quattro testi hanno **sempre la stessa forma**:
*(a)* istruzione all'imperativo con lo scopo dentro — `Scan the area using the NanoPix camera, to highlight radioactive locations`;
*(b)* conferma con **conseguenza aziendale**, non complimento — `You've mapped the area and enabled the teams to proceed with pipeline optimisation!` (non "bravo!", ma "hai sbloccato il lavoro della squadra");
*(c)* **una riga tecnica che riqualifica il gioco a dimostrazione** — `The images are enhanced with a photogrammetry software that generates a dot cloud…`.
Il terzo tempo è quello che nessuno mette, ed è quello che converte. Senza, resta un giochino; con, il visitatore esce avendo capito un processo industriale.
Meccanicamente i quattro giochi costano pochissimo: uno è un **raycast + un tween su una uniform**; uno è un **cursore trascinabile che scrive un `progress` 0-1** (soglie: `> 0,02` = iniziato, `> 0,99` = finito); due sono lo **stesso identico schema a sei tasti** (`↑↓←→` + `shift` + `space` mappati su `zPos/zNeg/xPos/xNeg/yPos/yNeg`) riusato per una gru e per un drone, con condizioni di vittoria diverse (`distanza < 0,035 && velocità < 4e−5`).

**Bonus, per un cliente vero:** i contenuti dei quattro dossier sono **dati puri** — un array di blocchi tipizzati (`picture-with-text`, `list-1`, `list-2`, `simple-text`, `big-text`, `key`, `push`, `interaction-*`) ciascuno con un `margin` fra `small/medium/large/very-large`. Questo è già un CMS a blocchi: si trapianta su Sanity o Strapi in un pomeriggio, e il cliente può scrivere una quinta scheda prodotto da solo. **Il sito è predisposto** — c'è perfino lo stato "bloccato" con lucchetto e l'etichetta `To come`.

## Non verificato

- **Non ho visto il sito in movimento.** Non esiste più e non ho usato browser. Tutto quello che ho scritto sull'esperienza è ricostruito dai sorgenti (`app.js`, `app.css`), dai valori numerici delle animazioni e dai testi. **Non ho una registrazione né uno screenshot**: i colori li ho letti dal CSS e dal renderer, non stimati da immagine, ma non ho controllato con gli occhi come si compongono.
- **Non ho contato le schermate di scroll** di ciascuna sezione. Servirebbe rendere la pagina. Ho dato invece il dato strutturale (5-7 blocchi) e la corsa di telecamera (2,7 / 2,7 / 11,7 / 43,7 unità), che è la misura relativa affidabile.
- **Non so quanto durino davvero i tempi di caricamento.** Il WPO 8,40 di Awwwards è l'unico dato di velocità che ho. Nessun Lighthouse, nessun Core Web Vitals: non ci sono, e misurare l'archivio darebbe numeri falsi.
- **Non so se il preloader avesse una percentuale o una barra.** Ho trovato l'etichetta (`Loading, please turn on your volume`), il CSS del `.loader .label` e il fatto che il caricamento avviene in due passi, ma non ho ricostruito il disegno del cerchio.
- **Non ho la lista completa delle texture.** Ne ho identificate 13 con nome; ce ne sono altre codificate in base64 dentro il bundle (ne ho contate almeno 6 come data-URI PNG) di cui non ho ricostruito l'uso.
- **Stylus è dichiarato dallo studio**, non provato dal codice compilato.
- **Non so se ci fosse `prefers-reduced-motion`.** Ho cercato: **non compare né nel CSS né nel JS.** Quindi la risposta è quasi certamente no — coerente con l'accessibilità 6,80.
- **Non ho verificato l'audio all'ascolto**: i nomi dei file (`Boucle musique principale`, `Boucle musique light`, `SD HOTSPOT`, `SD Chgt DECOR`, `SD Zoom back home`) e i volumi (0,5 / 0,6 / 0,8 / 1,0) sono letti dal codice.
- **Non so perché il sito sia stato spento**, né quando esattamente. L'archivio mostra catture con codice 200 fino al 2026, ma il server oggi risponde 404 su tutti i percorsi provati: la rimozione è recente o le ultime catture erano già risposte di errore memorizzate. `non verificato`.
- **Non ho controllato la versione FR dei testi dei giochi e dei dossier per intero** — ho letto integralmente il dizionario EN e a campione il FR. I due dizionari **non sono traduzioni fedeli**: per esempio i due punti caldi di `protect` sono **invertiti** fra EN e FR, e la posizione `y` di `tablet1` è 0,2 in EN e 0,5 in FR. Chi rifà un sito bilingue così deve sapere che le due lingue possono divergere anche nelle coordinate 3D.
