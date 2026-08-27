# 15 — IL PASS PBR

Piano di lavoro, versionato e **aggiornato a ogni passo chiuso**. Chi legge
questo file sa a che punto è il pass, non com'è fatto il sito — quello sta in
`docs/14-FOTOREALISMO.md`, che resta la specifica vincolante.

Legenda: `[ ]` da fare · `[~]` in corso · `[x]` fatto · `[-]` abbandonato, col
perché.

---

## Perché serve, in una riga

Oggi i due modelli non hanno **né UV né texture**: verificato sul file, non a
memoria.

```
impianto.glb        attributi: COLOR_0, NORMAL, POSITION   immagini: 0  texture: 0
sovrastruttura.glb  attributi: NORMAL, POSITION            immagini: 0  texture: 0
```

Quello che sembra materia — fughe del teak, finestre di murata, buccia
d'arancia, striature di tornitura — è **tutto procedurale nello shader**, e
l'occlusione è cotta nei vertici. Regge la media distanza: è il motivo per cui
la nave adesso legge come una nave. Non regge il primo piano, ed è lì che il
sito si gioca tutto, perché la camera arriva a 2,6 unità dal meccanismo.

Due revisioni indipendenti l'hanno chiamato con le stesse parole: *linguaggio
di una buona demo tecnica, non di un oggetto reale fotografato.*

---

## La decisione che regge tutto il pass

**L'alta risoluzione ce l'abbiamo già, e non lo sapevamo.** Il builder genera
la geometria e poi le applica gli smussi come modificatori: 3.528 facce
diventano 44.496 triangoli. Fino a oggi abbiamo esportato *quella*.

Quindi il pass non ha bisogno di scolpire niente. Ha bisogno di **separare le
due che già esistono**:

- **alta** — la mesh con gli smussi applicati, 44.496 triangoli. Non viene
  esportata: serve solo come sorgente della cottura;
- **bassa** — la stessa mesh senza smussi, ~8.000 triangoli. È quella che
  viaggia, e prende dalla cottura la normale che le ridà gli spigoli.

Il guadagno è doppio e va detto perché è controintuitivo: **il pass PBR rende
il file più leggero, non più pesante.** Meno geometria, più dettaglio.

---

## 0 · La mano non si toglie mai `[x]`

Questo passo non c'era, e non l'ho trovato io. È arrivato in tre frasi:

> *«questi devono avere la possibilità di muoversi, altrimenti avrei fatto un
> filmato»* · *«cioè sono io che regolo il mare — il meccanismo sotto in base
> alla manopola si muove»* · *«deve in sostanza far vedere qualcosa che non
> vedrebbe mai, come il funzionamento»*

L'ultima è la tesi del sito in una riga, ed è il metro con cui va giudicato
tutto il resto di questo documento: **la cosa che nessuno vede mai è un
meccanismo che lavora dentro uno scafo, e mostrarla non serve a niente se non
risponde a chi guarda.**

### Il difetto

`stile.css` mandava `.comandi` — stato del mare, andatura, interruttore — a
`opacity:0;pointer-events:none` sulle due battute del primo piano. La catena
fisica era **intatta e giusta**:

```
manopola → stato del mare → integratore → rollio → il controllore
calcola l'angolo di pinna → albero, riduttore cicloidale, dischi
```

Non mancava la fisica: **mancava la mano.** Arrivavi davanti all'unica cosa che
il sito ha da dimostrare, e in quel momento esatto ti veniva tolta la manopola.
Da lì in giù il sito era, letteralmente, un filmato.

E aveva già disattivato un capitolo intero senza che nessuno se ne accorgesse:
il finale previsto dal piano — *«con la lama ferma sul meccanismo, e lo
spegni»* — non era eseguibile, perché non si spegne un interruttore a
`pointer-events:none`.

### Perché nessun cancello l'aveva preso, ed è la parte che vale

Perché **non c'era niente di rotto**. Nessuna eccezione, nessun errore di
shader, nessun numero fuori tolleranza, e un'inquadratura anzi più pulita.

> **Una decisione di regia presa per pulire un'inquadratura può cancellare
> l'interattività senza rompere niente.** Nessuna misura la trova, perché tutto
> funziona — solo, non lo tocca nessuno.

Si trova in un modo solo: **provando a usare il sito da dentro la battuta.**

### Il cancello

`strumenti/collaudo-manopola.mjs` va al primo piano, verifica che i comandi
siano colpibili, e poi li usa:

| | misurato |
|---|---|
| stab. spento, mare 5 | albero d'ingresso **0,000 rad** p-p |
| stab. acceso, mare 5 | **15,358 rad** p-p |
| stab. acceso, mare 2 | **6,393 rad** p-p |
| girando la manopola da 2 a 5 | il meccanismo lavora **2,40 volte di più** |

Rimettendo la regola CSS, il cancello diventa rosso e dice perché. Provato.

### Tre errori della prima stesura, che valgono più del cancello

1. **Cercava la battuta e trovava il nome della battuta.** `data-battuta` resta
   a `meccanismo` dal 36% di scorrimento fino al 100%, ma il palco è `sticky` e
   dal 44% scivola via: al 60% stava a `top=-2028`, fuori dallo schermo. Stavo
   misurando una scena che non era in pagina.
2. **Il testimone di vitalità stava dalla parte sbagliata.** Sapevo già che
   «fermo» e «non disegnato» si leggono identici, e il controllo c'era: solo,
   guardava il **rollio**. Ma la simulazione continua a girare anche quando la
   scena non viene più aggiornata, quindi giurava che tutto fosse vivo mentre
   l'albero stava a zero. **Il testimone deve stare dalla parte della cosa
   misurata**: si misura ciò che viene disegnato, quindi a dire che si disegna
   dev'essere il contatore dei fotogrammi. Da qui `__nautica.fotogrammi`.
3. **Cliccava con `pagina.click`, che porta l'elemento in vista** — e un clic ha
   spostato lo scorrimento da 9798 a 4505: il cancello si muoveva da solo fra un
   campione e l'altro. Ora verifica che il bersaglio sia in quadro e poi clicca
   col mouse alle sue coordinate, che è anche quello che fa una mano.

E un quarto, dello stesso ceppo dei tre: **dava per scontato che
l'interruttore fosse spento**, l'ha cliccato, e lo ha *spento* — poi si è
lamentato che il meccanismo non si muoveva. Il sito si apre stabilizzato e a
mare 4, e `stato.js` lo dichiara. *Lo stato non si suppone, si legge.*

---

## 0-bis · Il mare dal finestrone e' quello della scena `[x]`

Il committente ha chiuso la questione in due frasi: *«cioe' sono io che regolo
il mare»* e *«deve far vedere qualcosa che non vedrebbe mai, come il
funzionamento»*. Dal vetro si vedeva una clip: un mare girato non risponde a
chi guarda, e quindi non e' il mare di nessuno.

Adesso il vetro e' un **buco** — lo apre `alphaMap` — e dietro c'e' l'acqua
della scena, la stessa che si vede da fuori, mossa dallo stesso stato.

### La parte bella: la rotazione l'ha fatta la fisica

La regola di `docs/09` e' sempre stata **la stanza rolla, l'orizzonte no**, e
finora era ottenuta con due rotazioni scritte a mano: una contro-rotazione che
teneva il gruppo livellato, e una rotazione della texture del mare. Sono uscite
tutte e due, e la regola resta vera da sola:

- la camera del sito e' **livellata** — e' l'invariante di tutto il sito —
  quindi il mare del mondo disegna sempre un orizzonte orizzontale;
- il gruppo del salone e' **figlio della nave**, quindi lasciandolo stare rolla
  insieme a lei.

Stanza inclinata, orizzonte piatto, zero righe che lo impongano. Il codice che
c'era non descriveva la scena: la simulava a mano.

### E una cosa che copriva il mare

Attraverso il buco si vedeva **la nave stessa**: un piano orizzontale a quota
1,54, cioe' il ponte sopra la tuga, a 0,47 unita' dalla camera contro 1,35 del
salone. Nascondere la sola `COPERTA` bastava finche' dal vetro c'era un
filmato, perche' la clip copriva tutto quello che stava dietro. Trovato
chiedendo alla scena *chi* fosse in quel punto con `?ispeziona=1`, non
deducendolo dalla forma della macchia.

### Quanto e' forte, misurato

Fra mare 1 e mare 5, dentro il vano: **1,95 livelli su 255 di differenza
media**, con l'8,5% dei pixel che cambia di piu' di 3 livelli. **Risponde, ma
poco.** L'acqua a quella distanza e con quell'angolo rende meno di quanto
dovrebbe, ed e' il prossimo lavoro su questo capitolo — non un dettaglio da
lasciare implicito.

---

## 0-ter · La ripresa nuova del salone `[~]` — bloccata su un cancello

Il committente ha fornito una ripresa molto migliore: stesso salone ma piu'
vicina, con il finestrone che passa dal 27% al 55% della larghezza del quadro.

Lo strumento `strumenti/salone-da-filmato.py` ne ricava la maschera del vano
misurandola invece di ritagliarla a occhio — colore sulla mediana temporale per
trovare la regione, poi tre rette adattate al bordo, errore medio **1,37 px**.

**Non e' spedita**, perche' `collaudo-filmato.mjs` la boccia: **0,34 gradi di
rotazione contro un tetto di 0,30**, con una carrellata dello 0,48% contro
0,50. Il tetto non e' negoziabile e la sua ragione vale oggi piu' di ieri: la
maschera del vano e' ferma, quindi se la camera ruota il vano scivola sotto la
maschera, e adesso che dietro c'e' il mare vero lo scarto si vede come una
scheggia di legno sopra l'acqua. A 0,34 gradi sono circa 2 px.

### Quattro tentativi di stabilizzazione, tutti peggiori del non fare niente

| cosa | rotazione | carrellata |
|---|---|---|
| ripresa grezza | 0,34° | 0,48% |
| `vidstab` su tutto il quadro, `smoothing=30` | 0,39° | 0,48% |
| `vidstab` su tutto il quadro, `smoothing=0` | 0,57° | 4,92% |
| `vidstab` rilevato sul solo lato stanza | 7,33° | 8,20% |
| stimatore mio, sul montante | **10,26°** | 9,31% |

Tre cause distinte, e vale la pena tenerle scritte perche' sono tre modi
diversi di sbagliare la stessa cosa:

1. **rilevare su tutto il quadro** stima il moto del *contenuto* — meta' quadro
   e' acqua che scorre, l'altra meta' ha due persone che gesticolano — e lo
   attribuisce alla camera;
2. **rilevare su un ritaglio e applicare al quadro intero** ruota attorno al
   centro sbagliato: 0,3 gradi diventano 7;
3. **il mio stimatore sul montante misurava 2,04 gradi dove la verita' e'
   0,34**, quindi ha iniettato tremolio invece di toglierlo. Ancora una volta
   due metri in disaccordo di sei volte, e ancora una volta lo ha detto il
   cancello, non la mia fiducia nel mio codice.

### Le due strade, e nessuna e' mia da scegliere

- **rigenerare la clip** con una camera davvero bloccata. Le tre riprese nate
  dalla richiesta «telecamera fissa» si muovono PIU' delle altre — 14,6, 15,5 e
  17,5 gradi di escursione dell'orizzonte — quindi chiederlo a parole non
  basta;
- **far seguire la maschera alla ripresa** invece di tenerla ferma. E' la
  risposta di principio: se la camera si muove, a muoversi dev'essere anche il
  ritaglio. Costa una misura per fotogramma di cui, per ora, non ho una
  versione che regga.

### Cosa e' emerso misurando la ripresa nuova, e serve comunque

- **non ci sono tagli**: il salto massimo fra fotogrammi adiacenti e' 6 volte
  il tipico (uno spruzzo); un attacco darebbe 20-50 volte;
- **ma il contenuto torna indietro**: la coppia di fotogrammi piu' simili in
  assoluto e' 0,0 s ↔ 9,5 s per il mare e 0,5 s ↔ 9,8 s per la stanza. Il
  generatore ha prodotto ~9,6 s di materiale, ripetuto tre volte con
  variazioni: e' il ciclo che si nota guardando;
- **a 4,7-5,4 s un gesto sbagliato**: l'uomo alza il braccio con la mano aperta
  senza motivo. In un ciclo lo si vede ogni volta;
- **per rimescolare, la sorpresa e' rovesciata**: la stanza ha **2364** salti
  che costano meno del doppio di un fotogramma adiacente, da 117 fotogrammi
  diversi; il mare ne ha **12**, da 5. Le onde non combaciano mai. Ma l'acqua
  si puo' dissolvere senza che si veda e le persone no — quindi il
  rimescolamento e' un lavoro sul lato STANZA, non sul mare.

---

## 1 · Le UV `[ ]`

**Un atlante solo per l'impianto**, non uno per pezzo e non uno per materiale.
Le ragioni:

- uno per pezzo farebbe quattordici atlanti e quarantadue texture;
- uno per materiale ne farebbe nove, e i pezzi di uno stesso nodo finirebbero
  in file diversi — cioè più cambi di stato per disegnare la stessa vite.

Con un atlante unico i nove materiali condividono le stesse tre mappe e
tengono ognuno il proprio colore di base. Tre texture in tutto.

**Come**: proiezione automatica per pezzo, poi impacchettamento su tutti i
pezzi insieme in modalità multi-oggetto, margine sufficiente a non far
sanguinare le isole quando la mappa viene rimpicciolita dalla compressione.

**Cosa può andare storto, e come me ne accorgo**: la proiezione automatica
taglia dove le capita, e su un cilindro tornito una cucitura in mezzo alla
faccia visibile si vede. Il cancello guarda **densità di texel** — quanti pixel
per centimetro tocca a ogni pezzo — e si arrabbia se un pezzo ne prende dieci
volte più di un altro, perché vuol dire che l'impacchettamento ha sprecato
l'atlante su qualcosa che non si vede.

## 2 · La cottura `[ ]`

Dall'alta alla bassa, tre mappe:

- **normale** — è quella che ridà gli spigoli smussati a una mesh che non ce li
  ha più. È il pezzo che paga la riduzione di triangoli;
- **occlusione** — sostituisce quella cotta nei vertici, che esce nello stesso
  commit. In texture ha la risoluzione dell'atlante invece che della mesh:
  l'ombra sotto la testa di un bullone smette di essere interpolata su un
  triangolo;
- **rugosità** — sostituisce la variazione procedurale di `materia.js`, che
  esce con lei. Cotta, la lavorazione può seguire la forma vera del pezzo
  invece di un disturbo in coordinate oggetto.

Le tre viaggiano in **due file**: la normale da sola, e occlusione + rugosità +
metallicità impacchettate nei tre canali di una texture sola, come vuole glTF.

**Cosa può andare storto**: se la bassa e l'alta non combaciano abbastanza, la
cottura prende la superficie sbagliata e la normale esce con macchie. Si
riconosce a occhio e si cura con la distanza di ricerca, ma va **guardata**, non
data per riuscita.

## 3 · La compressione KTX2 `[ ]`

Tre mappe a 2048 in PNG pesano più di tutta la geometria del sito messa
insieme. In KTX2 con compressione Basis stanno in una frazione, e restano
compresse **anche in memoria video** — che sul telefono conta più del
trasferimento.

Il decodificatore costa come quello di meshopt e si carica una volta sola.

**Il cancello dei numeri della pagina prenderà lo scostamento** appena il peso
cambia: è già successo tre volte stanotte, e ogni volta prima che me ne
accorgessi io.

## 4 · Il vetro `[ ]`

Oggi è uno specchio scuro senza spessore: `metalness 0,85`, nessuna
trasmissione, nessun indice di rifrazione. Da fuori regge, perché di giorno un
vetro di yacht *è* uno specchio scuro. Ma nel passaggio ravvicinato — quando la
camera esce dal salone e passa accanto al finestrino — si vede che è una
superficie sola.

Serve spessore vero e IOR 1,5. Su tre livelli di sovrastruttura è geometria da
aggiungere, non solo materiale.

## 5 · Le imperfezioni `[ ]`

**Controllate**, non sporcizia. §7 lo dice già: *variazione di roughness prima
dello sporco*, *nessuna ruggine*. Quindi:

- sigillature agli spigoli fra pannelli;
- giunti di testa sui corsi di teak, che oggi corrono da prua a poppa senza
  interruzione — ed è la cosa che si nota per prima in una coperta finta;
- tracce d'uso dove le mani e i piedi passano davvero: battagliola, corrimano,
  bordo dei gradini.

Ultimo per una ragione: sono la finitura di una superficie che deve già essere
giusta. Metterle prima vorrebbe dire sporcare un materiale sbagliato.

---

## Cosa NON entra in questo pass

- La **sovrastruttura** riceve le UV e la cottura solo dopo l'impianto. È più
  lontana dalla camera e più grande: costa più atlante e rende meno.
- I **filmati del mare** restano una dipendenza esterna.

---

## Registro

| quando | passo | cosa è successo |
|---|---|---|
| 27 ago, 07:40 | — | piano scritto e versionato |
| 27 ago, 07:50 | 0-bis | il salone entra nel pass, **in testa**: «altrimenti avrei fatto un filmato» |
| 27 ago, 09:20 | 0 | **i comandi non si spengono più sul meccanismo.** Una riga di CSS teneva la mano fuori dal primo piano; `collaudo-manopola.mjs` la vieta |
| 27 ago, 09:20 | 0-bis | deciso col committente: dal finestrone si vedrà **il mare 3D della scena**, non una clip |
| 27 ago, 10:30 | 0-bis | **fatto.** Le due rotazioni scritte a mano sono uscite: la fisica le produce da sola. Misurato: risponde alla manopola, ma debolmente (1,95/255) |
| 27 ago, 11:10 | 0-ter | ripresa nuova misurata e maschera estratta (1,37 px). **Non spedita**: fuori dal cancello di 0,04 gradi, e quattro stabilizzazioni su quattro l'hanno peggiorata |
