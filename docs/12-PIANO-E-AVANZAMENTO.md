# 12 — Piano e avanzamento

**Questo file è il canale con chi legge il repository da fuori.** Si aggiorna a
ogni pezzo finito, e chi lo legge non ha il contesto della conversazione in cui
il lavoro è stato fatto: deve capirlo da qui.

Le regole che mi do nello scriverlo:

- ogni voce ha uno **stato esplicito**;
- ogni problema si racconta con **sintomo, causa e come l'ho isolato**, non con
  «risolto bug X» — perché chi legge deve poter *contestare* la diagnosi;
- ogni decisione porta **il numero che l'ha decisa**. «Ho scelto la RMS» non
  serve a nessuno; «il picco su finestra finita non converge perché le tre
  armoniche hanno periodi incommensurabili, misurato 5,60 punti di escursione
  contro 0,19» si può verificare;
- ogni cancello dice **cosa impedisce e come si esegue**;
- in coda, **dove sono bloccato**, così chi legge sa dove può servire.

---

## Il bersaglio, e perché il piano è cambiato

Il progetto punta al premio annuale, non al Site of the Day. La differenza non è
di grado: è di **categoria**.

I vincitori SOTY autoprodotti hanno una cosa in comune, e non è la rifinitura —
**ci si sta dentro dieci minuti**. Bruno Simon è una macchina che si guida,
Messenger è un pianeta. Nessuno di loro *spiega* qualcosa. E il voto lo dà la
community, non la giuria: Messenger ha preso 7,92 dalla giuria e **9,56 dagli
utenti**.

Il sito oggi è **un atto primo forte più cinque sezioni che si leggono**. Un
primo piano di lavoro — riempire le sezioni di testo raddoppiato, aggiungere due
poster renderizzati — è stato **scartato** perché faceva la cosa sbagliata:
allungava un sito che si legge. Al suo posto c'è `13-ATTO-DUE.md`.

---

## Stato dei lavori

| # | cosa | stato |
|---|---|---|
| F.0 | la tabella delle riduzioni precalcolata, e i cancelli rifatti | **fatta** |
| F.1 | il copy che contraddiceva il metodo | **fatta** |
| F.2 | `collaudo-impaginato.mjs`, e l'impaginato su cinque viewport | **fatta** |
| F.2b | il telefono: da rotto a leggibile — ma **non ancora progettato** | **fatta, e resta dovuto** |
| **Il salone** | il capitolo emotivo, fotografico e reattivo | **fatto** |
| — | il sito si apre sul salone, non sulla dimostrazione | **fatto** |
| — | il mare fuori dal finestrino, filmato | **fatto** |
| A | l'ambiente HDRI e il tone mapping | **superata**: il salone e' fotografico, la dimostrazione resta disegno tecnico (D33) |
| B | la nave che si divide | da fare |
| **Il meccanismo** | far *sentire* che la macchina lavora — priorita' dichiarata | da fare |
| atto due §2 | il passaggio di consegne | da fare |
| atto due §4 | la catena causale | da fare |
| atto due §5 | il finale, col salone | da fare |
| — | la sezione che sostituisce il cliente (`#offerta` operativa) | da fare |
| — | l'identità: il nome sulla nave, la firma dello studio | da fare |
| ~~—~~ | ~~la linea come spina: testo raddoppiato nelle sezioni~~ | **abbandonata**: alza il Design ma allunga la lettura, che è il difetto |
| ~~—~~ | ~~poster renderizzati in Blender per `#fattura` e `#offerta`~~ | **abbandonata**: immagini ferme in un sito che ha bisogno di mani |

---

## I problemi trovati, e come sono stati isolati

Sono tutti della stessa famiglia, e vale la pena dirla in una riga: **lo
strumento restituisce un numero e non dice che è rotto.**

### 1 · Il mare sommergeva l'obiettivo

**Sintomo.** La metà chiara del fotogramma diventava `(28,29,29)` invece di
`(233,229,221)`: il cielo si spegneva e la linea a metà schermo spariva — cioè
saltava l'unica idea meccanica del sito.

**Perché nessuno l'aveva visto.** Va e viene col periodo dell'onda. Da fermo,
venti campioni a un secondo l'uno danno `##...###..##..##...#`. Uno scatto solo
lo prende una volta su due, e un fotogramma nero si legge come «quella battuta è
scura» invece che come un difetto. Quattro provini su sei sono stati letti così.

**Come è stato isolato.** Con l'interruttore `?senzaAcqua=1`, che esiste in
produzione apposta: senza acqua la carta era giusta a tutte le posizioni, con
l'acqua no. Una prova, una risposta.

**Causa.** La camera sta a quota zero e la superficie del mare oscilla *attorno*
a quella quota: `mare * 0.052` per coefficienti che sommano 1,14 fa **+0,30** a
mare 5. Le creste passavano sopra l'obiettivo.

**Cura.** Non si alza la camera e non si abbassa il mare: si **spegne l'onda**
in un raggio di 5,5 unità attorno all'obiettivo, con la superficie tenuta 0,10
sotto. Quella zona si guarda di striscio e non occupa pixel.

**Cancello.** `node strumenti/collaudo-mare.mjs`

### 2 · Tre metri rotti prima di trovarlo

- **`toBlob` su una tela WebGL** senza `preserveDrawingBuffer` restituisce un
  buffer **vuoto**, non quello a schermo. Ho letto «alpha 0 ovunque» e concluso
  che il difetto fosse del registratore video. Non lo era.
- Su quella lettura avevo aggiunto in CSS un fondo sotto la tela «per rendere la
  giunzione indipendente dal compositing». **Non serve a niente**: per una tela
  accelerata quel fondo sta nello stesso livello del genitore. La riga è stata
  tolta e il fatto lasciato scritto in `stile.css`, perché è la prima cosa che
  viene in mente.
- **L'ffmpeg incluso in Playwright è minimale**: niente filtro `fps`, e non
  legge mp4. Fallisce con «No such filter» e «Invalid data», che sembrano
  problemi del file. Ce n'è uno completo nel PATH.

### 3 · Il numero di testata diceva 52% dove doveva dire 91%

**Sintomo.** Due secondi dopo aver acceso il sistema, `REDUCTION` segnava 21%.

**Causa.** Ogni gesto dell'utente azzera le due finestre di picco, e con
smorzamento 0,045 l'inviluppo della corsa nuda ha costante di tempo 24,8 s. Il
sito sottovendeva il prodotto esattamente nell'istante della rivelazione.

**E non si assestava mai.** A 20/40/80/120 secondi dava 92/89/89/92. La forzante
è somma di tre armoniche a 0,51ω, 0,83ω e 1,37ω: **periodi incommensurabili, che
non tornano mai in fase**. Il massimo su una finestra finita dipende da dove
capiti dentro il battimento, e non converge per nessuna durata. Non c'era un
parametro da tarare.

**Cura.** Rapporto delle **RMS a regime**, mediato su più realizzazioni del
mare. Escursione fra caricamenti: da 5,6 punti a 2,1 nel caso peggiore (mare 3 a
8 nodi, in pieno stallo, dove la dipendenza è fisica), sotto 0,4 dove il sistema
è lineare. La RMS è anche la grandezza con cui il settore quota la riduzione di
rollio — scoperto dopo averla scelta per l'altro motivo.

**Ricaduta:** il numero di servizio passa da 89% a **91%**.

### 4 · Un cancello che misurava il carico della macchina

**Sintomo.** `collaudo-rollio.mjs` era **rosso su `main`**: il tetto dei 16 ms
sfondava sempre. Otto esecuzioni: 16,9 · 18,0 · 19,0 · 17,7 · 19,1 · 17,5 ·
17,4 · 17,5. E più tardi, sotto carico, 51,7 · 52,5 · 22,2.

**Causa, e non è la soglia.** Quei numeri sono **lo stesso codice**: cambia solo
quanto è occupato il computer. Un tetto in millisecondi non misura il codice,
misura la macchina. Alzarlo non lo aggiusta.

**E la domanda giusta prima di toccarlo:** quel costo si pagava una volta o a
ogni gesto? `riduzioneVera` era in cache per `(mare, velocità)` — 6 × 21 = 126
combinazioni — quindi si pagava a ogni combinazione nuova: **uno scatto di 20-50
ms ogni nodo trascinato sul cursore dell'andatura**. Venti scatti per
attraversarlo. Jank vero, e la Usability pesa il 30%.

**Cura.** La tabella si **precalcola e si versiona**:
`strumenti/genera-riduzioni.mjs` produce le 126 celle con lo stimatore caro
(passo 1/120 contro 1/25, finestre doppie, otto realizzazioni invece di cinque)
e scrive `src/scena/riduzioni.json`. A runtime resta una lettura.

Tre cose migliorano, e la terza è la più importante:
- **lo scatto sparisce** — zero calcolo sul fotogramma;
- **il cancello diventa deterministico** — `creaMare` accetta ora un **seme**,
  quindi la tabella è riproducibile byte per byte e il cancello la ricalcola e
  la confronta invece di cronometrare;
- **i numeri diventano ispezionabili.** Prima la riduzione era un numero da
  credere; adesso è un file che chiunque può rigenerare con un comando. Il sito
  dice *«measured, not declared»*: questa è la versione forte di quella frase.

### 5 · Il cancello nuovo ha preso subito un difetto suo

Ricavando il passo dai metadati della tabella, `dt` diventava `NaN`, il ciclo di
integrazione non girava nemmeno una volta, e `_riduzioneCruda` restituiva
**zero, in silenzio**: nessun errore, un numero plausibile, e il cancello
accusava il file invece del proprio calcolo. Ora protesta con un'eccezione.
*Uno strumento che non sa di essere rotto è peggio del difetto che cerca.*

### 6 · Una sostituzione che non ha agganciato e non l'ha detto

Un'automazione di modifica testuale ha riportato successo senza aver cambiato
niente, perché la stringa cercata non corrispondeva. Il file è stato rigenerato
due volte nel formato vecchio prima che me ne accorgessi. **Ogni modifica
automatica deve fallire forte se non trova il suo bersaglio.**

### 7 · Meta' dell'interfaccia era uscita dal palco

**Sintomo.** Sul telefono i comandi comparivano a `y = 2622` con la finestra
alta 844: millesettecento pixel sotto lo schermo. Il pulsante «For your
product» stava a `y = -751`, cioe' sopra la pagina.

**Come e' stato isolato.** Chiedendo al browser la **parentela vera** invece di
dedurla dalla geometria:

    [...document.querySelector('.palco').children]

`.palco` conteneva soltanto la scena, la linea e due righe di testo. Comandi,
energia, letture e pulsante erano diventati figli diretti della sezione — che e'
alta cinque schermi, e contro quella si risolvevano `top:50%` e `bottom`.

**Causa.** Un mio ritocco all'HTML. Estraendo il blocco delle letture per
spostarlo, la ricerca del `</div>` di chiusura aveva agganciato quello della
singola lettura invece di quello del pannello. Il `</div>` avanzato chiudeva il
palco troppo presto.

**E il controllo che avevo messo non l'ha visto.** Verificavo che il blocco
estratto finisse con `</div>`: finiva, ma con quello sbagliato. E dopo la
modifica il conteggio dei `<div>` tornava — **38 aperti e 38 chiusi** — perche'
i due errori si compensavano: un tag mancante al pannello e uno di troppo che
chiudeva il palco. *Un conteggio che torna non e' una struttura giusta.*

### 8 · Il cancello dell'impaginato mentiva, e l'avevo scritto io

**Sintomo.** Il collaudo diceva **zero sovrapposizioni** e lo schermo del
telefono era illeggibile: la didascalia si disegnava sopra le letture.

**Causa.** Misurava i `getBoundingClientRect` — le **scatole**. Con
`min-height:0` dentro un flex, la didascalia si stringeva sotto la sua altezza
naturale e il testo usciva fuori senza portarsi dietro il riquadro. Le scatole
non si toccavano; l'inchiostro si'.

**Cura.** Un controllo nuovo nel cancello, che confronta `scrollHeight` con
`clientHeight`. **Un cancello che misura le scatole mente appena qualcosa
trabocca dalla sua.**

**E la soglia ha avuto la sua trappola.** Segnalare qualunque sbordo sopra 2 px
dava **70 falsi allarmi**, tutti sullo stesso elemento e tutti di **5 px in
verticale e 0 in orizzontale**: erano le cifre con `line-height: .94`, cioe'
inchiostro che esce dal riquadro per *scelta tipografica*. Un cancello che grida
per quello si impara a ignorarlo. La soglia giusta non e' un numero scelto a
mano ma **una riga di testo** — `fuoriY > lineHeight * 0.9` chiede «e' uscita
almeno una riga intera?», e la risposta si chiede al foglio di stile invece di
indovinarla.

**E appena e' diventato onesto ha trovato il difetto vero, quello che la prima
correzione aveva solo nascosto:** la didascalia sbordava di **113 px, cioe' 4,2
righe**, su 1366x768 e 1280x720. Mettere didascalia e letture nello stesso flex
aveva tolto la sovrapposizione fra i RIQUADRI e lasciato quella fra gli
INCHIOSTRI.

**Causa, e in parte l'avevo fatta io.** In `stile.css` non esisteva **nessuna
media query sull'altezza**, e correggendo il copy di F.1 avevo **allungato**
proprio il testo della battuta piu' lunga. Adesso c'e' `@media (max-height:820px)`
— piu' una seconda soglia a 680 — e la didascalia cede per prima **mostrando che
cede**: il paragrafo si taglia con i puntini invece di uscire di nascosto. Il
titolo resta sempre, perche' e' quello che dice a che punto sei.

### 9 · E due attese che scadevano invece di verificare

- `waitUntil: 'networkidle'` non arriva mai su una pagina che carica un motore
  3D: sotto carico il collaudo falliva dopo trenta secondi per un motivo che non
  c'entrava con l'impaginato. Si aspetta una **condizione vera** — la tela che
  esiste — non un tempo morto;
- il collaudo premeva l'interruttore dall'ultima posizione del giro precedente,
  dove il sito **ritira i comandi apposta**. Playwright li vedeva ancora
  «visibili» e aspettava un minuto che la tela smettesse di intercettare il
  clic. Non era un difetto del sito: era il collaudo che premeva un pulsante
  gia' messo via.

### 10 · Il telefono non era stretto: non era progettato

**Sintomo, misurato a 390x844 prima di toccare niente.** La navigazione andava
a capo su **quattro righe** e copriva il suggerimento del trascinamento. La
didascalia usciva dal fondo dello schermo. E **i comandi non si vedevano
affatto** — interruttore, scala del mare e andatura tutti sotto il bordo. Il
pulsante «For your product» stava a `y = -751`, cioe' fuori dalla pagina.

**I conti, perche' li' non ci sta tutto.** Meta' bassa a 390x844: **422 px**.
Contenuto a corpo pieno: comandi 206 + energia 29 + letture 110 + didascalia
130, piu' tre stacchi = **475**. Mancano cinquantatre pixel, e traboccare non e'
una risposta: bisogna decidere *cosa* cede.

**Cede la scala, non il contenuto.** Le quattro letture su una riga sola a corpo
ridotto — misurato 344 px in 358 disponibili, mentre a corpo pieno erano 478 e
uscivano dallo schermo — e la didascalia tenuta a due righe. Restano tutte e
quattro le letture e resta il testo. La navigazione sparisce: su una pagina che
e' uno scorrimento lineare, **una nav che si rompe vale meno di nessuna nav**.

**E una cosa ha dovuto cedere davvero.** Anche dopo la riproporzione, alla
didascalia restavano 123 px per un contenuto che ne chiede 86 solo di titolo:
veniva **tagliata**, che e' peggio che sbordare perche' sparisce in silenzio.
Fra il narrato e le due barre dell'energia — dichiarate dal sito stesso «un
indice da 0 a 100, non kilowatt» — **cede l'indice**: `.pannello--energia` non
si mostra sotto gli 820 px. E' la cosa piu' secondaria della pagina, e toglierla
fa respirare il resto. Detto qui perche' e' una **perdita di contenuto su
mobile**, non un aggiustamento.

**RESTA DOVUTO un vero progetto per il telefono.** `13-ATTO-DUE.md` §8 lo dice:
la Usability vale il 30%, meta' giuria prova dal telefono, e un'esperienza
«adattata» invece che progettata si vede. Questo lavoro toglie i difetti — zero
sovrapposizioni, zero scorrimento laterale, tutti i comandi raggiungibili — non
fa il progetto.

### 11 · Il cancello nuovo non girava su un clone pulito

Segnalato da una revisione esterna, e **aveva ragione** — anche se da me girava
verde. Tre cause distinte, tutte mie:

1. **`const URL = process.env.URL` oscurava il costruttore globale `URL`.** La
   riga che ricava la porta moriva con «URL is not a constructor». Stava proprio
   nel ramo che accende la preview da solo, cioe' **quello che non avevo mai
   eseguito**, perche' una preview c'era sempre. Rinominata in `INDIRIZZO`.
2. **`headless: false`** non parte su una macchina senza schermo — cioe' in
   integrazione continua, che e' esattamente dove il cancello deve girare. Ora
   e' headless per difetto, con `TESTA=1` per guardare.
3. **`playwright-core` non scarica nessun browser**, di proposito: si appoggia
   al Chrome di sistema. Il rimedio suggerito, `npx playwright install`, **non
   avrebbe funzionato**: serve `npx playwright install chrome`. Adesso il
   cancello prova il Chrome di sistema, ripiega sul chromium incluso, e se non
   c'e' ne' l'uno ne' l'altro **dice quale comando lanciare** invece di sputare
   uno stack trace.

E la preview se la accende da sola se non ne trova una, spegnendola alla fine:
`npm run collaudo:impaginato` funziona da un clone appena fatto, con un comando.
I prerequisiti stanno nel README.

### 12 · I cancelli non fermavano la pubblicazione

Il workflow di GitHub eseguiva **solo build e peso**. I collaudi esistevano nel
repository e non fermavano niente: li chiamavamo cancelli mentre una regressione
poteva arrivare in produzione lo stesso. Adesso `npm run collaudo` e
`npm run collaudo:impaginato` girano prima di pubblicare.

### 13 · Il sito dichiarava numeri vecchi, ed e' il difetto peggiore della lista

La pagina diceva **67,2 KB di font** (Recursive ne pesa 39,7), **7,6 KB di
percorso critico** (sono 10,2), **145,9 KB di motore 3D** (144,6) e **otto
sezioni dello scafo** — mentre `ORDINATE` ne contiene **nove**, contate.

Su un sito la cui tesi e' *«measured, not declared»*, e che dedica un paragrafo
a spiegare che le voci col trattino restano col trattino finche' non sono
misurate, **sbagliare il numero piu' facile da verificare smonta tutto il
resto**. Corretti tutti, presi da `npm run peso` e dal file delle ordinate.

### 14 · Il provino tipografico mostrava un confronto falso

Confrontava Space Grotesk + JetBrains contro Recursive. Vinta la prova (D43),
quei due file sono stati **cancellati** — erano 67,2 KB contro 39,7 — e il
provino ha continuato a cercarli mostrando **caratteri di sistema al loro
posto**: un confronto che sembrava vero e non lo era. Adesso confronta le due
cose che restano da decidere davvero, i due registri dello stesso carattere.
Tolta anche una copia duplicata del font che poteva divergere in silenzio.

---

## Il salone — come è fatto, per chi vuole rifarlo

È il capitolo che si apre per primo, ed è la metà emotiva che mancava. Non è una
scena in tempo reale: è **una fotografia che reagisce**.

### Il metodo, ed è la parte che conta

Non si chiede una scena a un modello generativo. Si chiede di **vestire una
sagoma renderizzata dal sito**.

    npm run sagome        produce le sagome dalla scena 3D
    ?sagoma=1             apre la scena 3D invece del composito
    ?rollio=N             inchioda l'inclinazione a N gradi
    ?maschera=1           tutto nero tranne i finestrini

Composizione, camera, posizione dei mobili, altezza dell'orizzonte nel
finestrino e posa delle persone li decide **la scena**. Il modello mette
materiali e facce. La differenza non è estetica: un asset generato da una sagoma
versionata **si può rifare**, e chi lo rifà ottiene la stessa struttura. Senza,
ogni asset è un colpo di fortuna che non si ripete.

Sagome e fotografie stanno in `riferimenti/sagome/`, versionate.
`src/scena/salone.js` non è codice morto: è la **sorgente degli asset**.

### I tre strati, e fra due di essi c'è tutta la tesi

| strato | cosa | ruota? |
|---|---|---|
| 1 | il mare, filmato | **no** |
| 2 | la stanza, fotografia coi finestrini bucati | **sì**, col rollio vero |
| 3 | la cornice dell'apertura | mai |

Non c'è una riga che tenga fermo il mare: è fermo perché **nessuno lo tocca**. La
stanza si inclina contro un orizzonte che non si inclina con lei.

### Due pose, perché una sola sarebbe emotivamente falsa

Una fotografia sola, ruotata, mostrerebbe due persone **serene mentre la stanza
sbanda**. Le pose sono due — a riposo, e con la mano piatta sul tavolo — e si
dissolvono seguendo l'angolo. La seconda è stata generata **a partire dalla
prima**, così inquadratura, facce e materiali coincidono: un primo tentativo
aveva l'inclinazione impressa nella fotografia, era più bello e **inservibile**,
perché il modello aveva riquadrato e le due immagini non si allineavano più.

### Cinque difetti, tutti visti guardando

1. **La maschera presa dalla sagoma non combacia.** Il modello riquadra: nella
   fotografia la fascia dei finestrini è più alta e i montanti sono altrove. Ora
   si ricava dalla FOTO (`strumenti/maschera-finestrini.mjs`), con un
   discriminante misurato — dentro il vetro `R−B` sta fra **−8 e −3**, dentro la
   stanza fra **+36 e +48**, i montanti sono neutri ma scuri. E la pelle è calda
   (`+66`), quindi le teste che coprono un vetro restano escluse da sole.
2. **La maschera era del verso sbagliato.** Con `mask-mode: luminance` il bianco
   MOSTRA: il buco va fatto in nero. Scritta nel verso intuitivo, la stanza
   compariva solo dentro i finestrini e il mare copriva tutto il salone.
3. **L'orizzonte del filmato cadeva sotto i vetri**, e si vedeva solo cielo. Il
   conto: fascia 7,2:1 con orizzonte a metà, in un riquadro alto quanto
   l'apertura cade al 50%, mentre i vetri stanno fra il 27% e il 47%. Alzando il
   riquadro del 12% l'orizzonte scende al 38%.
4. **La dissolvenza lineare lasciava un fantasma** — due teste sovrapposte a
   sette gradi. Adesso è una banda stretta fra 2,5 e 6 gradi.
5. **Il tempo non avanzava**, per la seconda volta e in un posto nuovo:
   sostituendo la scena 3D col composito è sparita la riga che fa avanzare la
   simulazione, e il capitolo mostrava una stanza dritta mentre la didascalia
   diceva che rollava. *Chi legge uno stato deve anche farlo avanzare, se è
   l'unico sveglio.*

### E il primo mare era sbagliato anche se era bello

Frangeva come un'onda su un fondale — shore break — invece di essere mare lungo
che incontra una barca, e aveva una prua in basso che il prompt negativo
escludeva. La cura non è stata insistere sul negativo: è stata **nominare la
fisica invece dell'effetto** — *deep open ocean, hundreds of miles from any
coast, long-period swell that lifts and passes, never curling*. Chiedere la
causa, non il risultato.

Il vincolo di `docs/09` è verificato invece che sperato: orizzonte misurato col
gradiente verticale alla riga 312 di 720, ritagliata una fascia centrata, e
**rimisurato dopo il ritaglio — 50,0% esatto**.

### Peso

Due fotografie 72 KB l'una, due maschere 3 KB, il filmato 64. **228 KB** contro
un budget di 500 per gli asset 3D. JS totale 152,5 KB gzip contro 250.

---

## Le decisioni prese, in breve

Il registro completo sta in `03-DECISIONI.md`. Da scrivere lì, in coda a D53:

- **D54** — dal picco alla RMS, e poi alla tabella precalcolata. Motivo e numeri
  al punto 3 qui sopra.
- **D55** — il mare che sommergeva l'obiettivo. Punto 1.
- **D56** — **nominare l'invariante vero.** In dodici punti fra `docs/` e `src/`
  era scritto che la linea sta a metà schermo *perché la camera sta a quota
  zero*. È il `lookAt` alla stessa quota a produrla: **beccheggio zero**. La
  parola non compariva da nessuna parte nel repository.
  **E con la sua metà scomoda:** misurato, a quota 1,28 con sguardo orizzontale
  l'orizzonte proietta a 0,019 px dal centro — la *geometria* sopravvive a
  qualunque quota. La *lettura tonale* no: alzandosi si guarda dall'alto la
  superficie illuminata, la metà bassa smette di essere acqua profonda, e lo
  spacco muore lo stesso. L'invariante è **beccheggio zero E quota bassa**, per
  due ragioni distinte. Senza la seconda metà, la correzione autorizzerebbe
  proprio l'errore che l'ha prodotta.
- **D57** — l'identità: **il nome sta sulla nave, non su un'azienda che non
  esiste.** Uno yacht autoprodotto e dichiarato tale (`09` §6), con lo studio
  che firma. Un committente inventato sarebbe una credenziale finta, ed è la
  prima cosa che un giurato controlla.
- **D58** — un cancello che misura millisecondi misura la macchina. Punto 4.

---

## I cancelli, e come si eseguono

Nessuno di questi avvisa: **escono con errore.**

| comando | cosa impedisce |
|---|---|
| `npm run collaudo` | rollio, scafo e mare in fila |
| `node strumenti/collaudo-rollio.mjs` | che il modello del rollio si sposti in silenzio; che la misura dipenda dalle fasi o dal passo; che la tabella versionata non corrisponda al modello |
| `node strumenti/collaudo-scafo.mjs` | che il tappo di sezione si scolli dalla superficie; sezioni degeneri; normali rivolte all'interno |
| `node strumenti/collaudo-mare.mjs` | che le creste tornino a sommergere l'obiettivo; e l'opposto, che il raggio calmo si mangi il mare attorno allo scafo |
| `npm run collaudo:impaginato` | che i riquadri si sovrappongano **e che il testo esca dal suo riquadro**, su 5 viewport x 6 battute x 2 stati, piu' lo scorrimento laterale. Richiede la preview servita: `URL=... npm run collaudo:impaginato` |
| `npm run riduzioni` | rigenera la tabella (≈2 minuti). `-- --verifica` la rigenera e la confronta senza scrivere |
| `npm run peso` | che il percorso critico sfondi i tetti del brief |

**Regola:** build più cancelli prima di ogni commit. E se un cancello è rosso, si
cura la causa — non si alza la soglia.

---

## Dove sono bloccato, e dove potete servire

**Due cose non le posso fare io.**

1. **GitHub Pages** → Settings → Pages → Source: GitHub Actions. Il workflow è
   già in `.github/workflows/pubblica.yml`. Senza, restano bloccate le misure
   sulla preview pubblica, il video registrato dal sito vero e la prova su
   telefono. Un sito che non è pubblico non compete in nessuna categoria.
2. **Il profilo Awwwards.** Non apro account. Ma **A05 è il rischio numero uno
   del progetto** e matura nel tempo: serve 6,5 anche dagli utenti qualificati
   già per l'Honorable Mention, cioè per il *primo* anello. Ogni settimana in
   cui non esiste è persa e non si recupera costruendo meglio.

**E la priorita' dichiarata, che viene prima di tutto il resto:**

> **Far sentire che il meccanismo funziona.** E' la parte che si vende a
> un'azienda e che cambia da azienda ad azienda. Oggi, alla battuta del
> meccanismo, si vede un ammasso di scatole grigie: la cinematica c'e' e si
> muove, ma non si legge come una macchina che lavora. E' il prossimo lavoro.

**Dove un'altra AI può servire davvero:**

- **§5 di `13-ATTO-DUE.md` lascia aperta una domanda di regia**: come si vede il
  salone mentre si è sotto la linea? Tre strade elencate, nessuna provata.
- **Il telefono per l'atto due** (`13` §8) è il pezzo duro e non è iniziato.
- **Rileggere le diagnosi qui sopra e contestarle.** Sono scritte con i numeri
  apposta: se una è sbagliata, si vede dai numeri e non dal tono.
