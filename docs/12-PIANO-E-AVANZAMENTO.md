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

## Il piano per finire — 26 agosto, sera

### La cosa che vale più di tutto il resto

**Nessuno può ancora aprire il sito.** Diciannove commit, quattromila righe, un
salone che finalmente sembra uno yacht — e zero persone che l'hanno visto. Non è
un dettaglio di rilascio: è la condizione di tutto. Nessuno dei tre premi si
vince da un repository, si vincono da un indirizzo che qualcuno apre.

E finché il sito non è pubblico non si possono nemmeno **misurare** le cose che
mancano: LCP e INP veri, il telefono su un telefono vero, il tempo che una
persona ci sta dentro. Sto ordinando lavoro su ipotesi invece che su misure, ed
è esattamente ciò che questo progetto non fa.

**Due clic, e sono solo tuoi:**

1. **GitHub → Settings → Pages → Source: GitHub Actions.** Il workflow è già in
   `.github/workflows/pubblica.yml` e i cancelli girano prima di pubblicare.
2. **Il profilo Awwwards.** Non posso aprirlo io — creare account e inserire
   password sono cose che non faccio. Conta dal giorno in cui esiste, non da
   quando ce ne ricordiamo: serve il 6,5 **dagli utenti** già per l'Honorable
   Mention, ed è il voto che matura solo col tempo.

---

### Dove siamo davvero

| capitolo | stato |
|---|---|
| il salone | **finito.** Due clip sorelle, camera collaudata, posa che reagisce |
| la dimostrazione | funziona, ma è la parte fredda: nave e meccanismo sono resa 3D |
| `#fattura`, `#offerta` | colonne di testo con il 60% di schermo vuoto |
| l'atto due | **non cominciato** |
| il telefono | **mai provato su un telefono** |

---

### L'ordine, e perché questo

**A · Il telefono.** È il primo perché la Usability pesa il 30%, è il criterio
più debole dei vincitori (7,46 Messenger, 7,90 Lando Norris) e metà giuria apre
dal telefono. E perché a quella larghezza il capitolo del salone **non si
capisce**: l'apertura mostra solo il mare e le persone escono dall'inquadratura.
Non è un difetto di impaginazione, è che la fotografia è composta per il largo.
La cura probabile: a schermo stretto l'apertura inquadra la METÀ DESTRA — le
persone — e il mare resta la fascia sopra la linea. Da misurare, non da
assumere.

**B · La linea ovunque.** Il sito ha un'idea sola — la linea a metà schermo — e
la fa vedere nel titolo di apertura e basta. `#fattura` e `#offerta` sono
colonne di testo in un mare di bianco. È il divario che separa un buon sito da
un Site of the Day, ed è rifinitura: colmabile senza inventare niente.

**C · `#offerta` operativa.** Oggi dice «il CAD del componente, semplificato o
no». Un produttore la legge e non capisce se ho mai visto un suo file. Deve
dire: quale formato (STEP, IGES, Parasolid, e cosa succede se arriva un nativo),
quali grandezze servono per far girare la fisica, chi deve stare nel progetto
dal lato regulatory, e in quanto tempo. **È l'unica cosa che un cliente vero
avrebbe dato e che si può dare senza averlo.**

**D · L'atto due.** È quello che separa un explainer da un Site of the Year, e
non si fa in una notte: il passaggio di consegne, la catena causale
(propulsione → velocità → `C(V)` → le pinne muoiono da sole), il finale in cui
spegni lo stabilizzatore e il salone sopra di te si inclina. Il numero che
serve al finale — `S.rollioNudo` — esiste già ed è collaudato.

---

### Cosa faccio mentre non ci sei

Nell'ordine, e mi fermo a ogni pezzo finito con il suo commit:

1. **il telefono**, che è la cosa più grossa e la più misurabile;
2. **la linea in `#fattura` e `#offerta`**;
3. **`#offerta` operativa**;
4. l'aggiornamento di `docs/12` e delle skill con quello che ho imparato stasera
   — che è tanto, e per ora sta solo nei commit.

Quello che **non** comincio senza di te: l'atto due. È settimane, cambia la
struttura del sito, e va deciso insieme.

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
| atto due §4 | la catena causale | **FATTA — 29 agosto.** `dinamicaPropulsione()` porta i giri al comando con inerzia e integra spinta e resistenza quadratiche; `#propulsione` ha sostituito il cursore dell'andatura; `strumenti/collaudo-catena.mjs` verifica i CONFINI fra le cause, non che quattro numeri si muovano insieme |
| atto due §5 | il finale, col salone | da fare |
| ~~—~~ | ~~la sezione che sostituisce il cliente (`#offerta` operativa)~~ | **abbandonata**: il committente ha fatto togliere §04 e §05 per intero, ~250 righe. Verificato il 29 agosto: zero occorrenze di `offerta` e `fattura` in `index.html` |
| — | l'identità: il nome sulla nave, la firma dello studio | da fare |
| ~~—~~ | ~~la linea come spina: testo raddoppiato nelle sezioni~~ | **abbandonata**: alza il Design ma allunga la lettura, che è il difetto |
| ~~—~~ | ~~poster renderizzati in Blender per `#fattura` e `#offerta`~~ | **abbandonata**: immagini ferme in un sito che ha bisogno di mani |

### Atto due — cosa e' chiuso, e con quale prova

Si aggiorna a ogni pezzo finito, e ogni riga porta la misura che la sostiene.
Una riga senza prova qui dentro non vale: e' il difetto che questo repo si
vieta da solo.

| §13 | pezzo | stato | la prova |
|---|---|---|---|
| §11.3-4 | la catena causale propulsione -> velocita' -> pinne -> rollio | **CHIUSO 29 ago** | `collaudo-catena.mjs`, 16 proprieta' verdi su questa macchina. Dopo 40 s a propulsione spenta: 12 -> **6,10 kn**, autorita' delle pinne **-70%**, rollio di ritorno **6,42 gradi RMS**, e le pinne continuano a tentare la correzione. Deriva fra 30/60/120 Hz: **6,099 / 6,101 / 6,102 kn**, sotto 0,01 |
| §4 | la velocita' non e' piu' un comando pubblico | **CHIUSO 29 ago** | `#velocita` non esiste piu' in `index.html`; `#propulsione` e' un `<button>` con `aria-pressed`. `collaudo-telefono` e `collaudo-manopola` puntano al comando nuovo |
| §9 | il cancello che vieta la scorciatoia | **CHIUSO 29 ago** | la prova che conta: **a velocita' uguale, il booleano della propulsione non cambia l'autorita' delle pinne**. Se qualcuno scrivesse «propulsione spenta -> riduzione = 0», quella riga fallirebbe |
| §11.3 | la macchina VISIBILE della propulsione | in corso | albero, riduttore ed elica in Blender, collegati a `giriPropulsione` |
| §11.5 | il giroscopio, il controesempio | in corso | — |
| §11.1 | la lama come strumento, e il passaggio di consegne | da fare | — |
| §11.2 | la navigazione a due assi | da fare | — |
| §11.6 | il finale: l'inclinazione del salone dalla corsa viva | da fare | il cancello lo dichiara gia': scarto sotto 0,05 gradi su 200 fotogrammi |
| §11.7 | il telefono, e §8 dice che vale quanto il resto | da fare | — |
| §5 | l'inquadratura del finale | **decisione aperta**, tre strade, e il §5 dice di sceglierla guardando |

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
| 2 | la stanza fuori dalla regione delle persone | **sì**, col rollio vero |
| 3 | la posa calma, dentro quella regione, opacità `1−q` | **sì** |
| 4 | la posa tesa, dentro quella regione, opacità `q` | **sì** |
| 5 | la cornice dell'apertura | mai |

Gli strati 2, 3 e 4 accettano indifferentemente **una fotografia o un filmato**:
maschera, rotazione e dissolvenza non sanno cosa stanno mostrando. È la forma
ibrida decisa col committente — **il filmato dà la vita, la simulazione dà
l'inclinazione** — e passare dall'una all'altro è una riga in `SORGENTE`, dentro
`src/scena/composito.js`.

Lo strato 2 esiste perché i cuscini non devono mai dissolversi: vedi il difetto
15 qui sopra.

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

### 15 · Quattro persone invece di due, e tre cure sbagliate prima di capire

**Sintomo.** Il committente ha visto il difetto prima di me: *«i cuscini sono
diversi»*. Confrontando le due fotografie pixel per pixel aveva ragione — oltre
alle due figure cambiano i cuscini e il bordo del tavolo. Il modello non
ricopia, rigenera, e ciò che rigenera non torna mai identico. Dissolvendole
intere, durante la transizione i mobili si trasformavano.

**La cura ovvia, e le volte che ha fallito.** Ritagliare la posa tesa sulle sole
persone e sovrapporla alla calma. A schermo comparivano **quattro persone**. Ho
dato la colpa al ritaglio e l'ho rifatto quattro volte:

| tentativo | risultato |
|---|---|
| le due macchie di differenza più grandi | quattro persone |
| tutte le macchie sopra 1200 px, dilatate di 22 | quattro persone |
| il riquadro rettangolare di tutte le macchie umane | copriva il **71,5%** dell'immagine |
| il riquadro della sola macchia più grande per lato | quattro persone |

**Come l'ho isolato.** Componendo la stessa maschera **fuori dal sito**, con
ffmpeg e la posa tesa piena: **due persone pulite**. Il ritaglio era già giusto.
Poi ho rifatto la composizione aggiungendo l'intersezione con la maschera dei
finestrini, cioè quello che fa `composito.js`: **quattro persone**. Riprodotto
in due comandi, senza browser.

**La causa.** Le due maschere si combattono. Le figure calme siedono con la
testa appoggiata ai vetri. Lì `tesa-maschera` è nera — deve esserlo, è il buco
del finestrino — quindi buca anche il ritaglio delle persone, e la posa tesa
**non può disegnare sopra la testa calma**.

*Quando un difetto non si sposta pur cambiando la cosa che lo causa, la cosa che
lo causa è un'altra. Isolarlo fuori dal contesto costa dieci minuti e li ripaga
tutti.*

**La forma che regge**, tre strati di stanza invece di due: la stanza **fuori**
dalla regione delle persone — non si dissolve mai, quindi i cuscini non cambiano
per costruzione e non per taratura — e **dentro** la regione le due pose che si
scambiano. Dove la posa tesa ha un finestrino al posto di una testa compare il
mare, che è ciò che c'è davvero dietro quella testa quando la persona si è
spostata.

### 16 · Il filmato generato aveva una carrellata che a occhio non si vede

**Sintomo.** Il primo filmato del salone — 1280×720, stessa inquadratura della
sagoma, stesse persone, col gesto di puntellarsi al secondo 3,1 — sembrava
perfetto. La stanza resta diritta e l'orizzonte piatto, che è ciò che serve:
l'inclinazione la deve dare la simulazione.

**Il difetto.** Una lentissima **carrellata in avanti**: fra il primo e l'ultimo
fotogramma la stanza cresce nell'inquadratura. Il prompt negativo la vietava
esplicitamente. La maschera dei finestrini è fissa: se i vetri si ingrandiscono
escono da sotto i loro buchi e il mare compare sul divano.

**Non si corregge dopo.** `vidstab` corregge traslazione e rotazione, **non la
scala**: provato, il filmato esce identico.

**Perché è successo.** Il prompt chiedeva alla stanza di sbandare. Un modello
generativo non sa inclinare una stanza tenendo fermo l'orizzonte, quindi
traduce il dramma nell'unico modo che conosce: **muovendo la camera**. La cura
non è un divieto più forte — c'era già ed è stato ignorato — è **togliere la
richiesta di rollio**, che non serve perché l'inclinazione la mette il sito, e
chiedere la staticità come *genere* (`fixed security-camera footage`) invece che
come divieto. Misure e prompt in `riferimenti/prompt/salone-filmati.md`.

### 17 · Tre metri rotti di fila, sulla stessa domanda

Serviva un cancello che dicesse se la camera di un filmato sta ferma. Ne ho
scritti tre, e i primi due davano numeri.

**Primo.** L'orizzonte come il salto di luminanza più forte dentro la fascia dei
vetri, con una retta adattata. Nel primo secondo il mare è annegato nella
foschia, quindi il salto più forte non era l'orizzonte, **era il davanzale**. Ne
usciva *2,43 gradi di inclinazione dell'orizzonte*: un numero che descriveva un
pezzo di arredamento, e stavo per far rigenerare un filmato per un difetto che
non aveva. L'ho scoperto solo guardando i fotogrammi a piena risoluzione — i
montanti erano verticali in tutti i campioni.

**Secondo.** Adattare il **profilo per righe** fra ogni fotogramma e il primo,
cercando scala e spostamento. Sembra solido. Su un mare — profilo a rampa liscia
— ingrandire e spostare producono quasi la stessa cosa, quindi il conto si
appoggia dove capita e il residuo resta bassissimo, perché una rampa combacia
sempre con sé stessa: **10,6% di carrellata su un filmato che sta fermo**, e
bocciava l'unica clip già buona. Ho aggiunto una prova di risolvenza — di quanto
posso sbagliare la scala prima che il residuo peggiori del 5% — e ha bocciato
anche la stanza: **1,6%** contro un tetto dello 0,5%. Non era tarato male, era
cieco a quella grandezza. Trentaquattro secondi per non sapere niente.

**Terzo, e funziona.** Due bordi orizzontali netti — il taglio dei vetri in
alto, la linea del pavimento in basso — e la loro **distanza**: è
l'ingrandimento, il loro punto medio è la traslazione, la differenza fra metà
sinistra e metà destra è la rotazione. I bordi distano centinaia di righe,
quindi la leva c'è, e un bordo netto si localizza sotto il pixel interpolando la
parabola sul massimo del gradiente. Risolve lo **0,187%** contro un tetto dello
0,5%, **e lo stampa prima dei numeri**. 1,6 secondi.

*Il metro giusto non è quello più raffinato: è quello che ha la leva sulla
grandezza che gli si chiede. E deve dichiararla, altrimenti chi legge non ha
modo di sapere che sta guardando rumore.*

### 18 · Il mare si vedeva solo come cielo, sotto una didascalia che diceva il contrario

**Sintomo.** Nei finestrini si vedeva una fascia chiara uniforme, mentre la
didascalia dice *«the horizon is the only thing standing still»*.

**Il conto.** La striscia del mare è 1024×142 con l'orizzonte al 57,7%;
`object-fit: cover` la ingrandisce 3,7 volte per riempire il palco, e
l'eccedenza è **tutta orizzontale** — quindi `object-position` non ha nessuna
presa verticale, e l'unico comando è `top`. Con `-12%` l'orizzonte cadeva a
240 px su un palco di 525, e la fascia dei vetri sta fra 120 e 244: era **sul
bordo inferiore**. Con `-23%` scende a 182, al centro della fascia.

*Un sito che dichiara di misurare non può contraddirsi nell'immagine che sta
accanto alla frase.*

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
