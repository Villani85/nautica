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

## 0-bis · Il mare dal finestrone doveva essere quello della scena `[-]`

**Abbandonato dopo averlo costruito, misurato e guardato.** Resta scritto per
intero perché l'errore vale più della soluzione.

### Cos'era, ed era giusto in teoria

Dietro il vetro c'era una clip, e una clip non risponde a chi guarda. Il vetro
è diventato un **buco** — lo apre `alphaMap` — con dietro l'acqua della scena,
la stessa che si vede da fuori, mossa dallo stesso stato del mare.

E aveva una proprietà bellissima: **la rotazione la faceva la fisica.** Sono
uscite due rotazioni scritte a mano — la contro-rotazione che teneva il gruppo
livellato e la rotazione della texture del mare — e la regola di `docs/09`
restava vera da sola, perché la camera è livellata e il gruppo del salone è
figlio della nave. Stanza inclinata, orizzonte piatto, zero righe che lo
impongano.

### Perché è stato tolto

Perché il finestrone diventava **vuoto**. Misurato sulla stessa inquadratura,
dentro il vano:

| | dettaglio | superficie piatta |
|---|---|---|
| mare girato | **3,07** livelli/pixel | **18,1%** |
| mare 3D della scena | 1,96 | **67,4%** |

Due terzi di finestrone morto. Da dentro, l'acqua si guarda con un angolo
rasente e non ha quasi dettaglio: fisicamente giusto, visivamente niente. E il
«cielo» diventava la carta del sito, cioè una campitura crema.

### L'errore che conta, ed è mio

**La misura ce l'avevo e l'ho letta male.** Avevo già misurato che fra mare 1 e
mare 5 il vano cambiava di 1,95 livelli su 255, e l'avevo scritto qui come
*«risponde, ma poco»*. Era il numero giusto letto con la domanda sbagliata:
misuravo **quanto risponde**, quando la domanda era **quanto c'è**. Un vano
vuoto risponde poco perché non c'è niente che possa rispondere.

Se l'è accorto il committente guardando lo schermo, con quattro parole. Un
numero che dice «debole» e un occhio che dice «vuoto» non sono d'accordo: e
quando non sono d'accordo, ha ragione l'occhio finché non trovo il numero che
gli dà torto.

E la metrica giusta non era nemmeno la deviazione standard, che su un campo a
due tinte con un bordo netto esce alta e non significa niente: era il
**gradiente locale**, cioè quanto cambia da un pixel al vicino.

### Cosa resta valido

- La richiesta *«sono io che regolo il mare»* era già soddisfatta dove il
  committente l'aveva precisata: *«intendo il meccanismo sotto in base alla
  manopola si muove»* — ed è il passo 0, con il suo cancello;
- l'idea che la fisica produca la rotazione invece di simularla a mano resta
  giusta, e tornerà utile quando il salone avrà volume (§0-octies);
- la maschera del vano misurata resta, e serve a entrambe le strade.

---

## 0-ter · La ripresa nuova del salone `[x]`

Il committente ha fornito una ripresa molto migliore: stesso salone ma più
vicina, con il finestrone che passa dal **27% al 55%** della larghezza del
quadro. `strumenti/salone-da-filmato.py` ne ricava la maschera del vano
misurandola invece di ritagliarla a occhio — colore sulla mediana temporale per
trovare la regione, poi tre rette adattate al bordo, **errore medio 1,37 px**.

### Il cancello che la bloccava, e come si è aperto senza aggirarlo

`collaudo-filmato.mjs` la bocciava: **0,34 gradi di rotazione contro un tetto di
0,30**. Quattro tentativi di stabilizzazione, ognuno peggiore del precedente:

| | rotazione | carrellata |
|---|---|---|
| ripresa grezza | 0,34° | 0,48% |
| `vidstab`, tutto il quadro, `smoothing=30` | 0,39° | 0,48% |
| `vidstab`, tutto il quadro, `smoothing=0` | 0,57° | 4,92% |
| `vidstab` rilevato sul solo lato stanza | 7,33° | 8,20% |
| stimatore mio, sul montante | **10,26°** | 9,31% |

Tre cause distinte: rilevare su tutto il quadro stima il moto del **contenuto**
(metà quadro è acqua che scorre); rilevare su un ritaglio e applicare al quadro
intero ruota **attorno al centro sbagliato**; e il mio stimatore misurava 2,04
gradi dove la verità è 0,34, quindi iniettava tremolio.

**La soluzione non era stabilizzare meglio: era guardare il tetto.** Il cancello
lo dichiarava già da sé — *«0,5%: sotto questo la maschera dei finestrini
regge»*. Cioè la soglia è sempre stata la **conseguenza di un margine**, solo
congelata in una costante che nessuno poteva ricalcolare.

Il danno è uno solo e si misura in pixel:

```
scivolamento = deriva + (scala + rotazione_in_radianti) × raggio
```

**Ed è asimmetrico**, che è la parte che sblocca tutto. Da un lato la maschera
buca oltre il vano: si apre un foro nel legno e ci si vede il mare — si nota
subito. Dall'altro resta corta: sopra il mare avanza una scheggia del vano
filmato, che contiene mare. Non si vede.

Quindi la maschera **rientra** di 16 px, il difetto visibile non può più
accadere, e quello che resta è un telaio un po' più spesso. Il rientro lo
dichiara `public/salone/vano.json` e il cancello lo **legge** per derivarne il
proprio tetto. Due strumenti, un contratto: uno dichiara quanto perdona, l'altro
misura quanto scivola, e nessuno dei due si fida di sé stesso.

Misurato: **scivolamento 10,9 px contro 16 di rientro** sulla ripresa nuova,
1,5 px sulla vecchia. Passano entrambe, e passano perché il numero regge, non
perché il tetto è stato alzato.

### Il peso, deciso misurando

30 secondi a 720p sono il file più pesante del sito. Il dettaglio dentro il vano
— cioè l'acqua, la prima cosa che la compressione rovina:

| | dettaglio | peso |
|---|---|---|
| originale | 3,972 | 12,0 MB |
| crf 26 | 3,795 | 3,68 MB |
| crf 28 | 3,749 | 2,86 MB |
| **crf 30** | **3,714** | **2,24 MB** |

Due per cento di dettaglio per il 39% del peso. Preso.

### Cosa resta da fare su questa ripresa

- **a 4,7-5,4 s l'uomo alza il braccio** con la mano aperta, senza motivo. In un
  ciclo lo si vede ogni volta;
- **il contenuto torna indietro**: la coppia di fotogrammi più simili in assoluto
  è 0,0 s ↔ 9,5 s per il mare e 0,5 s ↔ 9,8 s per la stanza. Il generatore ha
  prodotto ~9,6 s di materiale, ripetuto tre volte con variazioni;
- **per rimescolare, la sorpresa è rovesciata**: la stanza ha **2364** salti che
  costano meno del doppio di un fotogramma adiacente, da 117 fotogrammi diversi;
  il mare ne ha **12**, da 5. Le onde non combaciano mai. Ma l'acqua si dissolve
  senza che si veda e le persone no — quindi il rimescolamento è un lavoro sul
  lato **stanza**, non sul mare.

---

## 0-quater · Il mare non comincia quando apri la pagina `[x]`

Il committente l'ha detto in quattro parole — *«l'immagine non si muove»* — e
misurando aveva ragione, ma non per la ragione che sembrava.

Il filmato girava (il 74% dei pixel della stanza cambia in 0,9 s) e la catena
del rollio funzionava: la rotazione nel mondo del gruppo del salone segue
esattamente `sim.S.rollio`, valore per valore. **Il problema era quanto vale
quel rollio.** A stabilizzatore spento e mare 5, sei secondi dopo il
caricamento era **2,3 gradi su 15 nominali**, e saliva piano.

### La causa, che non era un guasto

La condizione iniziale. L'oscillatore parte da `theta = 0, omega = 0`, e con
`ZETA = 0.045` la costante di tempo con cui l'ampiezza monta è

```
1 / (ZETA · W) = 1 / (0,045 × 0,898) = 25 secondi
```

Per arrivare al 95% del regime servono tre costanti: **più di un minuto.**
Nessun visitatore lo concede. Il sito si apriva su una nave immobile e su una
manopola che sembrava non fare niente.

### La cura, e perché non è quella ovvia

Accelerare la salita avrebbe voluto dire falsificare lo smorzamento — cioè
proprio il numero su cui poggia tutta la tesi. Si corregge invece l'ipotesi
implicita sbagliata: **il mare esisteva anche prima che tu arrivassi.** Una
barca in mare sta già rollando; partire da ferma è l'artefatto, non il regime.

`sim.scalda()` integra 150 secondi a porte chiuse prima del primo fotogramma —
6 costanti di tempo, oltre le quali non cambia più niente — e costa qualche
millesimo. È **esattamente ciò che il banco di misura fa già da sempre** con
`TRANSITORIO = 45`: butta i primi secondi perché l'inviluppo deve montare. Qui
non si buttano, si vivono prima di aprire il sipario.

Alla partenza il rollio passa da **0,01° a 0,93°**.

### E una distinzione che vale la pena tenere

La manopola dello stato del mare **scalda**, l'interruttore no, e non è un
espediente:

- lo **stato del mare** non è un evento della traversata, è la traversata che
  si sceglie di guardare. *«Facciamo che il mare sia cinque»* vuol dire una
  nave che sta in mare cinque da un pezzo, non una a cui il mare cambia sotto
  in due secondi. Senza questo, i numeri saltavano subito e lo scafo ci metteva
  un minuto: chi gira una manopola e non vede muoversi niente conclude che non
  funziona;
- l'**interruttore** invece è un evento vero, e resta lento. Spegnere le pinne
  e guardare il rollio che ricresce piano *è* l'argomento: il tempo che ci mette
  è il numero che il sito vende.

---

## 0-quinquies · Il salone risponde davvero `[x]`

Sei richieste del committente in un'ora, tutte sullo stesso capitolo, tutte
vere. Vale la pena tenerle insieme perché raccontano un errore solo: **avevo
costruito una scena che si guarda invece di una in cui si sta.**

### 1 · La stanza rolla, il mare no — ed era al contrario

*«la barca si deve muovere»*, e prima ancora *«per creare il movimento della
barca ma l'orizzonte che non si muove»*.

Il codice faceva l'opposto: teneva ferma la stanza e inclinava il mare. Da
dentro si vedeva un salotto immobile e un orizzonte che si spostava di un
grado — cioè **niente**, perché l'occhio si aggancia ai verticali della stanza,
non a una linea lontana.

Adesso ruota la fotografia dentro un piano fermo, **insieme alla sua
maschera** — il buco del vetro appartiene alla stanza e deve inclinarsi con
lei — e l'ingrandimento necessario si calcola dall'angolo vero a ogni
fotogramma: `cos|a| + (9/16)·sin|a|`, cioè 1,00 da fermo e 1,19 a dodici gradi.
Tenerlo fisso al massimo avrebbe voluto dire buttare il 16% della fotografia
anche col mare calmo.

Misurato a mare 5, sistema spento: rollio 4,7° · stanza 4,7° · maschera 4,7° ·
zoom 1,039 · **mare 0**.

### 2 · Il mare ha una finestra sua

*«il mare devi creare una finestra, altrimenti il movimento è incoerente»*.

Dietro il vetro c'era **la clip della stanza ingrandita 1,55 volte**: divano,
montante e persone compresi. Si vedeva acqua solo perché il vano sta a sinistra
e a sinistra, nella copia ingrandita, c'è ancora acqua — ma a una scala diversa,
e ruotando ruotava un divano ingrandito dietro il vetro.

`salone-da-filmato.py` adesso ritaglia la regione che è **solo mare e cielo**,
dedotta dalle rette del vano e non scelta a occhio, e la specchia in orizzontale
fino a un 16:9 esatto — 1096×616, **nessun riscalamento**, quindi nessuna
perdita di nitidezza e onde alla loro scala. L'ingrandimento residuo scende da
1,55 a 1,15, che è solo quello che serve alla rotazione.

### 3 · Due difetti di generazione, tolti tagliando dove combacia

Il gesto del braccio a 4,7-5,4 s e le braccia che si compenetrano a 10,6-11,7 s.
Non si taglia a caso: si **cerca**, in una finestra attorno all'intervallo, la
coppia di fotogrammi che costa meno — misurata sul lato stanza, perché
dall'altra parte c'è acqua che non combacia mai e coprirebbe il segnale.

| da togliere | taglio trovato | costo |
|---|---|---|
| 4,6-5,5 s | 0,67 → 9,50 s | 2,7× un fotogramma adiacente |
| 10,6-11,7 s | 10,17 → 14,17 s | 7,1× |

Il primo cade sul punto in cui la clip torna su sé stessa: toglie il gesto **e**
una delle tre ripetizioni. Il secondo costa sette volte e si vedrebbe, quindi la
**dissolvenza si adatta al costo** — 1,12 s invece di 0,4. Su un'inquadratura
ferma con due persone sedute una dissolvenza lunga è grammatica, non un errore
nascosto. La clip passa da 30,0 a 15,65 s e da 12 MB a 0,98.

### 4 · L'attrito, e l'invito a scendere

*«quando parte la clip devi bloccare un attimo lo scroll»* e *«dopo 3 secondi
devi far apparire un messaggio scroll»*. Sono i due tempi dello stesso momento:
mezzo secondo in cui la pagina non cede — **mezzo, non tre**, che è la
differenza fra un segno e un guasto — e poi, quando lo sguardo ha finito, il
permesso di andare oltre. Una volta sola, all'apertura, e non con movimento
ridotto.

### 5 · Le sequenze 2-6 tacciono

*«non serve a nulla, non legge nessuno quelle cose»*. Le battute restano come
**stati** — camera, taglio, regole di stile dipendono da `data-battuta` — ma
smettono di parlare.

L'unica perdita vera è *«Turn it on»*, che era la sola istruzione del sito. Non
si compensa con altro testo: si compensa con **l'interruttore**, che in quella
battuta adesso pulsa finché non viene toccato.

### 6 · «Che la nave potesse girare l'ho capito ora»

L'ha scritto **il committente**, dopo giorni passati su questo sito. Il
suggerimento stava a 9 px in un angolo, in inchiostro tenue, e sotto i 900 px
era `display:none` — cioè da telefono non lo scopriva nessuno, sul dispositivo
dove il gesto è più naturale.

Se non lo scopre chi l'ha commissionato, non lo scopre nessun giurato. Adesso
sta sotto la nave, ha la dimensione di un'etichetta, porta il segno del gesto, e
**su telefono c'è**.

---

## 0-sexies · Con movimento ridotto il sito si riduce, non si spegne `[x]`

*«deve partire su tutti gli schermi anche su chi disattiva le animazioni»* — ed
era già una regola data e disattesa.

Chi aveva la preferenza attiva non riceveva un sito più calmo: ne riceveva una
**fotografia**. Tre cose si spegnevano insieme, e la terza per sbaglio:

- `simulazione.js` congelava la nave al proprio angolo di picco;
- `index.js` non faceva avanzare né l'orologio né le onde;
- `demo.js` non avviava il ciclo di disegno — e **dentro quel ciclo vive il
  video del salone**. Nessuno aveva deciso di fermarlo: si è fermato perché era
  attaccato a qualcosa che qualcun altro spegneva.

Il difetto vestibolare non è il movimento, è l'**ampiezza** del movimento.
Quindici gradi a tutto schermo sono un problema, cinque no. La forzante scende a
un terzo e tutto il resto gira identico. `collaudo-ridotto.mjs` misura due volte
— con e senza la preferenza — perché «si muove» e «si muove meno» sono due
requisiti diversi che si contraddicono se se ne controlla uno solo.

---

## 0-septies · Il clic non teletrasporta più la nave `[x]`

Difetto **mio**, introdotto tre ore prima curando quello opposto, e trovato da
una revisione esterna. Il clic sulla manopola chiamava `sim.scalda()`, che
integra 150 secondi in un colpo:

| | salto nel fotogramma del clic |
|---|---|
| mare 4 → 5 | **6,27°** |
| mare 2 → 5 | 1,94° |
| un fotogramma normale | 0,043° |

Centoquarantasei volte. E il mio cancello non poteva vederlo: misura
l'escursione picco-picco *prima* e *dopo*, e in mezzo c'era un taglio di
montaggio che nessuna delle due misure poteva contenere. **Una misura fra due
stati non vede cosa succede nel passaggio.**

La cura è una proprietà dell'equazione, non un espediente: il rollio nudo è
**lineare** nella forzante, quindi il regime nel mare *b* è quello nel mare *a*
moltiplicato per il rapporto delle ampiezze — stessa orbita, stessa fase, scala
diversa. Basta moltiplicare angolo e velocità per quel rapporto, spalmato su
1,6 s applicando a ogni passo la radice `dt`-esima.

Il caso peggiore scende da 6,27° a 0,234° per fotogramma, cioè **1,7 volte la
velocità angolare che la nave fa da sola** — dentro il suo moto naturale. E
`collaudo-manopola.mjs` adesso campiona **a cavallo** del gesto, non prima e
dopo.

Resta lento un caso solo, e va detto: da mare **zero** il rapporto non esiste,
e l'ampiezza deve montare davvero con la sua costante di 25 secondi. Da una
calma piatta il mare ci mette del tempo ad arrivare.

---

## 0-octies · Il salone deve potersi attraversare `[ ]` — **il passo che resta**

Questa sezione era nel piano a `2c52cf0` ed **è sparita** mentre riscrivevo i
passi 0-bis e 0-ter. Segnalato da una revisione, verificato: è vero, e non è una
svista da poco. È l'unico passo che cambia la categoria del sito, ed era stato
sostituito da lavoro su un filmato — cioè esattamente la deriva che il passo
serviva a evitare.

Rimessa qui, intera, e non si tocca finché non è fatta.

### Perché è il passo che conta

*«questi devono avere la possibilità di muoversi, altrimenti avrei fatto un
filmato»*. Oggi il salone sono due piani con sopra delle texture. La camera ci
passa davanti, non dentro: spostandola, nessuna superficie si comporta come la
superficie che è. **Un piano fotografico è un filmato con dei passi in più.**

Tutto quello che è stato fatto in queste ore — la stanza che rolla, la finestra
di solo mare, i tagli, l'attrito — rende il capitolo migliore. Nessuna di quelle
cose gli dà **volume**.

### Cosa NON si fa

Non si modella il salone. La fotografia è l'asset più forte del sito — legno,
lampada accesa, due persone vere — e sostituirla con mobili costruiti a mano
significherebbe buttare l'unica cosa che oggi *non* sembra CG.

### Cosa si fa: la fotografia proiettata su un volume

Si costruisce il guscio grezzo della stanza — pavimento, soffitto, le due
murate, la paratia di fondo, il vano del finestrone — e ci si **proietta sopra
la clip dalla posizione della camera che l'ha ripresa**. Da quel punto di vista
l'immagine è identica a oggi, pixel per pixel. Spostandosi, ogni superficie si
comporta come la superficie che è: il montante copre il divano, il mare scorre
dietro il vano, il pavimento fugge.

È la stessa idea del resto del sito applicata a un'immagine invece che a una
carena: **ciò che è fotografia si guarda, ma deve stare dove starebbe.**

### Il punto difficile, e come si verifica

La proiezione vale solo se la camera che proietta è nella stessa posa di quella
che ha ripreso. Sbagliarla di poco si vede subito: i bordi del finestrone
proiettato non cadono su quelli modellati.

Si tara sulle linee della fotografia — e tre di quelle linee **sono già
misurate**: `salone-da-filmato.py` ha adattato al bordo del vano la diagonale
alta (59,46° dalla verticale), il montante (−0,25°) e la battuta bassa
(−55,90°), con un errore medio di 1,37 px. Da tre rette e un'ipotesi di
rettangolo si ricava la posa della camera. **Il lavoro di calibrazione è già
mezzo fatto e non lo sapevo.**

Due cancelli:

1. **i bordi proiettati devono cadere su quelli costruiti** entro pochi pixel;
2. **muovendo la camera di mezza unità, le occlusioni devono cambiare.** Un
   billboard non cambia. Si misura contando i pixel che cambiano fra due pose
   vicine in una regione dove un oggetto vicino passa davanti a uno lontano.

### E il mare torna a essere quello della scena

Il passo 0-bis è stato abbandonato perché dal vetro l'acqua 3D rendeva un vano
vuoto — 67,4% di superficie piatta contro 18,1%. Ma la ragione era l'**angolo**:
da dentro si guarda l'acqua radente da 3,6 m, e a quell'angolo la superficie
attuale non ha dettaglio.

Con il volume, quel problema si può affrontare dalla parte giusta: non
sostituendo due pezzi, ma **migliorando l'oceano** — creste vicine, glitter
speculare, una normale di dettaglio a corto raggio, schiuma. È lavoro che serve
comunque al fotorealismo generale, e la misura per decidere se è pronto esiste
già ed è quella: dettaglio e superficie piatta dentro il vano.


---

## 1 · Le UV `[x]` — l'impianto

**Un atlante solo per l'impianto**, non uno per pezzo e non uno per materiale.
Le ragioni:

- uno per pezzo farebbe quattordici atlanti e quarantadue texture;
- uno per materiale ne farebbe nove, e i pezzi di uno stesso nodo finirebbero
  in file diversi — cioè più cambi di stato per disegnare la stessa vite.

Con un atlante unico i nove materiali condividono le stesse tre mappe e
tengono ognuno il proprio colore di base. Tre texture in tutto.

`riferimenti/blender/uv-impianto.py`. Geometria presa da `glb-impianto.py`
eseguendone il sorgente fino alla riga della cottura AO: **il file non è
toccato**, e se quella riga sparisce lo script si ferma con un errore invece di
srotolare a caso. 3.378 facce → 18.738 con i modificatori applicati, 14 pezzi.

### Il risultato

```
densità   3,02 px/cm su tutti e 14 i pezzi     RAPPORTO 1,00  (tetto 10)
isole     1017
atlante   55,68% analitico · 59,11% misurato rasterizzando a 2048²
bleed     8 px sicuri a 2048  →  4 a 1024, 2 a 512
```

### Tre cose che il piano dava per scontate e non lo erano

**1 · L'impacchettamento automatico normalizza per OGGETTO, non per area.**
Primo tentativo: rapporto **14,28** — il bullone e il fasciame da 11,5 m²
escono con la stessa area UV, perché `smart_project` mette ogni oggetto nel
proprio quadrato unitario, e il pack scala tutte le isole dello stesso fattore.
165× di rapporto d'area, radice quadrata, 12,8× di densità. Curato con
`average_islands_scale` prima dell'impacchettamento — **non alzando la soglia**.

**2 · Il margine costava molto più di quanto sembrasse.** Misurato cambiando
solo quel numero:

| margine | atlante occupato | densità |
|---|---|---|
| 2 px | 74,25% | 3,49 px/cm |
| 4 px | 68,17% | 3,34 |
| 8 px | 57,01% | 3,06 |
| 16 px | 30,73% | **2,24** |

Con isole larghe in media ~55 px, un gutter da 16 per lato **raddoppia il
lato**. Scelto 8: è il minimo che soddisfa i due vincoli veri — un blocco di
compressione è 4×4, e a mip 512 restano 2 px, cioè il raggio del bilineare.

**3 · Il packer può IGNORARE il margine che gli si chiede.** `shape_method =
'CONCAVE'`, scelto per densità, dà un bleed misurato di **0 px**: cinque coppie
di isole si toccano, e Blender non avvisa.

| forma | atlante | bleed misurato |
|---|---|---|
| CONCAVE | 57,01% | **0 px** |
| CONVEX | 55,68% | 8 px |
| AABB | 55,23% | 8 px |

L'1,3% di atlante contro una cottura che sanguina da un pezzo all'altro. Da
qui il **secondo cancello**: si misura il bleed sul disegno, e se è sotto il
margine chiesto, rosso. *«Margine sufficiente» è un parametro dichiarato al
packer, e va verificato sul risultato.*

E anche la sonda del bleed era rotta al primo giro: confrontava il buffer con
sé stesso spostato in quattro direzioni e rispondeva «nessun contatto entro
32 px» su un atlante dove due isole si toccavano — due isole distanti (16, 5)
non stanno su nessuna di quelle rette. Sostituita da una propagazione di fronte
a otto vicini.

### La decisione che resta aperta, col numero

**3,02 px/cm è poco per un primo piano.** A 2048 uno smusso da 2 mm prende
0,6 px: la normale cotta ci sta a malapena, e la camera arriva a 2,6 unità dal
meccanismo. Le strade sono due e costano diversamente:

- **atlante a 4096** — ×4 di peso, e il pass PBR doveva rendere il file più
  leggero, non più pesante;
- **fasciame e pinna fuori dall'atlante comune** — sono il 37% dell'area e i
  due pezzi meno guardati. Il fasciame da solo si prende il 45% dell'atlante
  usato (11,53 m² su 25,60).

C'è già `--priorita`, che declassa il fasciame a mezza densità: gli altri
salgono a 3,46 px/cm (+15%), rapporto 2,00, dentro il tetto — **ma il bleed
scende a 6 px e il secondo cancello lo boccia**. È spento, e non è stato
spedito.

### Cosa NON è verificato, e va detto

- **nessuna cottura su queste UV**: non c'è la prova che reggano un bake;
- **nessuna misura di distorsione DENTRO le isole**: è pareggiata la densità
  *media* per pezzo, una calotta stirata dentro un'isola non si vedrebbe;
- **le cuciture non sono state guardate**: il sospetto scritto qui sopra —
  cilindri con una cucitura in mezzo alla faccia visibile — non è verificato;
- **sovrapposizioni: solo un controllo indiretto** (raster 59,11% > analitico
  55,68%, quindi niente di grosso; le piccole passerebbero);
- **4.365 facce su 18.738 hanno area UV sotto 0,25 px²** — quasi certamente
  smussi collassati, che a 2048 non ricevono texel propri. Non indagato.

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
| 27 ago, 10:30 | 0-bis | fatto: il vetro bucato sul mare 3D, e due rotazioni scritte a mano tolte |
| 27 ago, 12:40 | 0-bis | **abbandonato.** Il vano diventava vuoto: 67,4% di superficie piatta contro 18,1% col mare girato. Avevo la misura e l'ho letta male |
| 27 ago, 12:15 | 0-quater | **«l'immagine non si muove»**: l'integratore partiva da fermo e l'ampiezza monta in 25 s di costante di tempo. Adesso la traversata è già cominciata |
| 27 ago, 12:15 | — | revisione delle 08:30: corrette la promessa fisica falsa in `#offerta`, i 180,6/181,4 KB (legando anche la prosa alla misura) e l'assenza di cancello su `COLOR_0` |
| 27 ago, 11:10 | 0-ter | ripresa nuova misurata e maschera estratta (1,37 px). Non spedita: fuori dal cancello di 0,04 gradi, e quattro stabilizzazioni su quattro l'hanno peggiorata |
| 27 ago, 15:00 | 0-octies | **rimessa nel piano** la specifica del salone attraversabile: era sparita riscrivendo 0-bis e 0-ter, e l ha trovata una revisione. E il lavoro di calibrazione e gia mezzo fatto: le tre rette del vano sono misurate |
| 27 ago, 14:30 | 0-quinquies | il salone risponde: la stanza rolla e l orizzonte no, il mare ha una finestra sua, due difetti di generazione tagliati, attrito e invito, sequenze 2-6 mute, la rotazione si scopre |
| 27 ago, 14:30 | 0-sexies | movimento ridotto: si riduce, non si spegne. Il ciclo spento fermava anche il video |
| 27 ago, 14:30 | 0-septies | tolto il teletrasporto che avevo introdotto io: 6,27 gradi in un fotogramma diventano 0,23 |
| 27 ago, 13:10 | 0-ter | **spedita.** Il tetto del cancello adesso si DERIVA dal rientro dichiarato della maschera invece di essere un numero scelto: 10,9 px di scivolamento contro 16 di margine |
| 27 ago, 16:00 | — | revisione delle 11:25 (su `f0bebcd`): **tre dei suoi cinque bloccanti erano già chiusi** dal commit successivo — la posa tesa che sostituiva il salone, il ciclo interno del filmato, il teletrasporto al clic. Restano veri il volume del salone e Pages |
| 27 ago, 16:00 | — | dalla stessa revisione, due difetti piccoli e veri: `vano.json` usciva con CRLF (`Path.write_text` traduce i fine riga su Windows) e i **filmati non avevano un tetto** |
| 27 ago, 17:30 | — | **il registro si è mangiato il documento.** Riordinandolo per data ho cercato la prima riga `\|---\|---\|---\|`: non era quella del registro ma una tabella a tre colonne in `0-bis`, e ho troncato il file da lì. Ripristinato da `23a15ee`. La lezione: un separatore di tabella non è un indirizzo |
| 27 ago, 17:45 | 1 | **atlante UV dell'impianto fatto**: densità 3,02 px/cm pareggiata su 14 pezzi, rapporto 1,00. Tre sorprese misurate: il packer normalizza per oggetto e non per area, il margine da 16 px costava il 36% della densità, e `shape_method='CONCAVE'` ignora il margine che gli si chiede (bleed misurato 0 px) |
| 27 ago, 19:30 | 2 | **cottura vera sull'impianto.** Copertura 100%, texel informativi 21,5%, macchie 0,21% col cage a 0,5 mm. E la risposta alla domanda dei 2048: la normale RECUPERA il 58,4% dello scarto dall'alta (0,829 contro 1,994 livelli), 1,11 texel per pixel a 2,6 unità — **2048 basta**, non serve 4096. Aperto: a retina (dpr 2) scende a 0,56 e non è misurato |
| 27 ago, 19:30 | 1 | **due difetti trovati cuocendo**: l'atlante pubblicato era srotolato sull'ALTA (le UV devono stare sulla bassa, che è quella che viaggia — ordine invertito in `cuoci-impianto.py`); e il fasciame, invisibile nel sito, si prende il 45% dell'atlante per lo 0,97% di informazione — senza di lui la densità sale a 3,74 px/cm (+24%). E la rugosità cotta oggi AZZEREREBBE `materia.js` invece di sostituirla: i materiali hanno roughness costante, va cotta da un materiale che la variazione ce l'ha |
| 27 ago, 19:30 | — | **il 1,31 m di §1.5 non aveva fonte**: la cella del PDF Quantum è vuota, la stringa 1310 non esiste nel documento. E il modello aveva un cavo orfano alla RADICE della scena — `convert` girava su selezione vuota, in silenzio — che era il punto più alto: il −13% dell'audit era «fondo fondazione contro cima di un cavo elettrico». Specifica riscritta con la prova, cancello su altezza/ingombro/radice, e la geometria è rigenerata: **l'atlante e la cottura andranno rifatti sul modello nuovo** |
| 27 ago, 19:30 | — | **lo sweep delle 101 pose ha trovato due compenetrazioni vere**: lobi nei perni 7,33 mm, perni del portante che ATTRAVERSANO i fori (gioco richiesto 25,5 mm, presente 20). Il profilo dei lobi è un coseno, non l'epitrocoide: da correggere in `glb-impianto.py` |
| 27 ago, 19:30 | — | `collaudo-manopola.mjs` è **instabile**: stesso file, verde poi rosso, rapporto misurato 0,84/1,07/3,76 contro soglia 1,3. Un cancello che dà un esito a caso è peggio di nessun cancello: da sistemare campionando più a lungo o cambiando metro |
| 27 ago, 21:00 | 2 | **Colab non serve, e l ho scoperto misurando invece di installarlo.** La cottura dell impianto a 2048 dura **66 secondi**, non decine di minuti: i «13 minuti» che avevo in mano venivano dal provino a forma di cubo di un altro agente, riportati senza verificarli sul caso vero. Su una GPU remota si risparmierebbero 40 secondi, spendendone 150 per installare Blender a ogni sessione |
| 27 ago, 21:00 | 2 | e **i campioni restano 64**: 16 contro 64 danno 3,1 livelli di differenza media ma **28 al novantanovesimo percentile e 103 al massimo** — la coda sta negli angoli concavi, cioe' esattamente cio' per cui si cuoce l occlusione. Una media piccola con una coda grossa e' il modo in cui una media mente |
| 27 ago, 22:20 | — | **occlusione spedita sulla nave, per una strada diversa da questo pass — e va detto, perché sono due strade.** Questo documento costruisce l'atlante col pareggio delle densità (`uv-sovrastruttura.py`, `cottura.py`) per cuocere **normale + ORM** dall'alta alla bassa. Io ho messo uno `smart_project` dentro `glb-sovrastruttura.py` e cotto la **sola occlusione**, senza saperlo. È una seconda implementazione, che qui è vietata, quindi la dichiaro invece di lasciarla in giro |
| 27 ago, 22:20 | — | perché non l'ho semplicemente rifatta sul pass buono: **l'occlusione è a bassa frequenza e la densità dei texel quasi non la tocca** — 512 px bastano, contro i 2048 che una normale pretende. Quando `cottura.py` arriverà sulla sovrastruttura, l'AO va presa da lì e le tre righe in `glb-sovrastruttura.py` vanno tolte: **è quel file a doversi arrendere, non questo pass** |
| 27 ago, 22:20 | — | il numero che l'ha chiesta: la stessa nave dalla stessa camera, cotta in Cycles e disegnata dal sito. La coperta AL RIPARO sotto la tuga misurava **1,02** volte quella scoperta dove il render dà **0,83**. Ora, A/B nello stesso istante: **−22,1%** sui pixel occlusi, e la differenza fra i due fotogrammi cade su sovrastruttura, tientibene e coperta — non sul mare, non sulla murata all'aperto |
| 27 ago, 22:20 | — | **gltfpack cancella le UV se nessun materiale usa una texture.** Il GLB usciva con POSITION e NORMAL soltanto, senza un avviso: stessa specie del difetto già pagato coi nomi dei nodi. Non si cura con un flag — si cura mettendo l'occlusione DENTRO il glTF come `occlusionTexture`, attraverso il gruppo di nodi che l'esportatore cerca per nome («glTF Material Output», ingresso «Occlusion»). Allora le UV servono davvero, e `GLTFLoader` collega `aoMap` da solo |
| 27 ago, 22:20 | — | **lo scafo non ha bisogno di uno srotolamento affatto**: è un loft su griglia regolare, e `a` lungo la nave e `i` lungo l'ordinata sono già due coordinate fra 0 e 1. Scritte in `ordinate.js` costano zero byte di trasferimento, perché la geometria nasce nel browser. Guscio e ponte condividono un atlante da 512 (12,8 KB webp), in due bande di v separate da un margine |
| 27 ago, 22:20 | — | e un difetto che vale per chiunque cuocia da questa scena: **`interno` è LA STESSA geometria del guscio**, disegnata due volte con `side: BackSide`. In Blender diventano due superfici a distanza zero che si occludono a vicenda — l'AO usciva 0,43 di media su una murata all'aperto, e tutta la fiancata si scuriva uniforme. Tolto il doppione, il massimo torna a 1,000 |
| 27 ago, 22:20 | — | `aoMapIntensity` **sopra 1 non significa niente**: three calcola `(ao − 1)·intensità + 1`, che con una texture a mezza scala va negativa. Intensità 4 esce più chiara di 1, e non è un difetto della mappa |
| 28 ago, 14:45 | — | **il profilo dei lobi: costruito, verificato a 0,000 mm sulla carta, e NON spedito.** `collaudo-corsa` trova 7,33 mm di compenetrazione fra lobi e corona. Il profilo è `r = 0,135 + 0,010·cos(29t)`: una cosinusoide, che §12 vieterebbe di chiamare cicloidale |
| 28 ago, 14:45 | — | **la formula in forma chiusa non l'ho copiata, e ho fatto bene**: l'epitrocoide equidistante con questa corona dà un disco fino a 0,156 m contro un inviluppo interno dei perni a 0,144 — compenetra comunque, e la formula ha più convenzioni (perni o lobi, segno del termine equidistante). Sceglierne una e verificarla dopo è il modo di sbagliare due volte |
| 28 ago, 14:45 | — | **un profilo cicloidale è una DEFINIZIONE, non una curva da ricordare**: è l'inviluppo dei perni visti dal disco mentre il meccanismo gira. Costruito così — per ogni posa si portano i 30 perni nel sistema del disco, che orbita di `e` e ruota di −φ/29, e per ogni direzione si tiene la distanza minima a cui un perno la blocca. Risultato verificato PRIMA di generare: **29 lobi contati** e ondulazione **24,0 mm = 2e esatti**, che è il risultato da manuale. E contro sé stesso dà **gioco 0,000 mm**: non compenetra per costruzione |
| 28 ago, 14:45 | — | **ma nel sito interferisce lo stesso, e questo LOCALIZZA il difetto.** Generato e collaudato: 7,46 mm, cioè come prima. Provata la costruzione col verso opposto (+φ/29): il profilo DEGENERA a 4,2 mm di ondulazione — un disco quasi rotondo, che interferisce meno (3,62) proprio perché non è più cicloidale. E il numero che chiude: il profilo vero usato col verso sbagliato dà **−7,96 mm**, che è esattamente ciò che il cancello misura |
| 28 ago, 14:45 | — | quindi **il difetto non è (solo) il profilo: è il verso con cui il sito fa ruotare il disco rispetto alla sua orbita.** La cinematica dichiarata è coerente — `uscita = S.pinna`, `ingresso = −29·uscita`, quindi θ = −φ/29, che è la relazione giusta — e nonostante questo il disco si comporta come se fosse +φ/29. Il sospetto è la conversione degli assi dell'esportatore glTF, che porta (x,y,z) in (x,z,−y) e **specchia il piano del disco**; ma specchiando anche il profilo il conto non torna, quindi il sospetto non è confermato |
| 28 ago, 14:45 | — | **niente di tutto questo è spedito**: il modello è tornato a quello di partenza. Una variante col profilo vero peggiora (7,46 contro 7,33), l'altra ha un profilo finto. Un difetto misurato e non curato vale più di una cura che ne introduce uno peggiore o che finge |
| 28 ago, 06:00 | — | **`collaudo-manopola` era instabile perche' chiedeva un periodo dentro un quinto di periodo.** La finestra era 90 fotogrammi (1,5 s) contro un rollio da 7 s, e si misurava a rampa aperta: ogni statistica dipendeva da QUALE quinto di ciclo. Da li' sia l'«1,22 volte» sia lo «0,0000 rad, catena scollegata» -- una finestra caduta dove la pinna stava a fondo corsa. Con un periodo intero e 2,2 s di assestamento l'escursione cresce di **4,6 volte** e a mare 2 la pinna non satura affatto (0%, non il 46% del transitorio). Dieci giri verdi |
| 28 ago, 06:00 | — | e **due cure sbagliate prima di quella giusta, tutte e due misurate**: chiudere una rampa applicandone il residuo in un colpo porta i salti a 4,35 gradi/fotogramma (319 volte il naturale) -- e' il teletrasporto scritto come cura; due slot indipendenti li riportano a 0,3 ma restano rossi, perche' due rampe sulla stessa corsa si moltiplicano. Ora `riscala` somma i logaritmi di tutte le rampe e taglia la somma: il tetto sta a valle di tutte |
| 28 ago, 06:00 | — | **la strada sbagliata che ho fatto prima di trovarla, perche' e' ripetibile.** A mare 5 l'albero da' 25,307 rad = 50,00 gradi esatti, cioe' la corsa piena fra gli arresti: sembrava provare che il fine corsa rendesse la soglia irraggiungibile, e ho riscritto il criterio sulla velocita'. Col massimo leggeva il rumore di temporizzazione, col percentile 95 leggeva **zero** (con la pinna a fondo corsa nel 96% dei fotogrammi, il 95% dei campioni di velocita' e' nullo). **Due statistiche opposte tutte e due rotte** e' il segno che il guasto sta a monte di quale statistica si prende |
| 28 ago, 06:30 | — | **il render Cycles della nave e il fotogramma del sito, stessa camera: sono vicini, e i limiti sono gli stessi.** Il sito ha il mare, la nave intera e lo scafo che legge; il Cycles ha una separazione tonale migliore fra i piani e un contatto piu' morbido sotto gli sbalzi. Tutti e due hanno i vetri neri e la sovrastruttura senza dettagli. **Il divario da colmare non e' fra i due**: e' cio' che manca a entrambi |
| 28 ago, 06:30 | — | e il cielo NON si cura con un HDRI: `ambiente.js` lo costruisce dai colori del foglio di stile per una ragione scritta — una fotografia porterebbe i suoi colori, lo scafo rifletterebbe un azzurro che nel sito non esiste, e la giunzione col fondo CSS perderebbe il senso. Il bianco piatto va curato sulla SUPERFICIE, non sul cielo |
| 28 ago, 06:30 | — | **nuovo strumento `strumenti/proprietari.mjs`: di chi sono questi pixel.** Un materiale per volta diventa emissivo rosso e i pixel che cambiano sono i suoi -- maschera esatta, non stima. Dei pixel scuri della nave: `sovra_vetro` 2484, `scafo` 1503, `sovra_guscio` 1376, `sovra_montante` 1152 |
| 28 ago, 06:30 | — | **due errori miei che lo strumento esiste per non ripetere.** (1) Ho misurato una regione scelta a occhio sul ritaglio ingrandito e conclusa morta la envMap del vetro: luminanza 34,64 identica a quattro decimali moltiplicando l'ambiente per sei. Stavo misurando la **coperta**; sui pixel veri l'ambiente arriva, 29,65 -> 56,96. (2) La prima maschera codificava l'indice del materiale nel canale rosso e leggeva tutto in un disegno solo: fra scrittura e lettura ci sono **ACES e sRGB**, che non sono lineari, e l'indice esce cambiato. Diceva che la banda sotto le finestre era il **teak**. **Un canale colore non e' un canale dati** se in mezzo c'e' una curva |
| 28 ago, 07:30 | — | **il confronto «stessa camera» guardava due inquadrature diverse del 7,5%**, e ci poggia tutto il pass. `confronto-cotto.mjs` ricavava l'angolo da `2*atan(12/fuoco)` -- la verticale dai 24 mm di ALTEZZA del sensore -- mentre Blender con `sensor_fit='AUTO'` adatta i 36 mm alla dimensione MAGGIORE, cioe' alla larghezza. Adesso le due camere si VERIFICANO: `cuoci.py` stampa `CAMERA_VERTICI` (otto punti fissi in coordinate del sito) e il confronto si ferma sopra i 2 px. **Scarto dopo la cura: 0,05 px** |
| 28 ago, 07:30 | — | tre strade sbagliate prima, tutte istruttive: le SAGOME non si possono confrontare (Blender rende la nave sezionata, il sito intera); l'INGOMBRO del sito **cambia fra un giro e l'altro** perche' la sovrastruttura arriva in differita (`max y` 4,382 e poi 1,997); e un fattore **2,065 identico sui due assi** era `world_to_camera_view` chiamata prima di `resolution_x = 1000`. Una scala isotropa pura e' la firma di un errore di unita': un disallineamento sposta, non ingrandisce |
| 28 ago, 07:40 | 1 | **atlante rifatto sul modello nuovo**: col predefinito e' rosso (bleed 6 px su 8 chiesti), verde con `--forma AABB` -- bleed 8 px, rapporto di densita' 1,00, atlante al 54,98%. Non si e' abbassata la richiesta |
| 28 ago, 07:50 | 2 | **la cottura sul modello nuovo e' RIFIUTATA e ieri passava**: macchie **0,1828%** contro un tetto di 0,0500. Copertura 100% e informazione 21,39%, cioe' le altre due misure sono sane. Il cancello consiglia di abbassare estrusione o raggio, e **il consiglio non si applica**: con raggio 20, 6 e 3 mm il numero e' 0,1828 IDENTICO. Tre valori diversi che danno lo stesso risultato non dicono che il parametro non serve, dicono che il difetto non e' li' -- e il parametro arriva davvero a `bpy.ops.object.bake(max_ray_distance=...)`, verificato. Il sospetto e' geometria coincidente nell'alta, la stessa specie del difetto di `interno`. **Non spedito niente**: il tetto dei byte si spende su una cottura sana |
| 28 ago, 08:10 | 2 | **la cottura non era una regressione: il tetto era tarato sul soggetto sbagliato.** Stessa misura sui due file: quella di ieri, ACCETTATA, ha piu' macchie di quella di oggi, rifiutata -- 0,1581% contro 0,1428%. Il tetto dello 0,05% viene da un provino a forma di cubo col 5,84% di texel informativi; l'impianto ne ha il 37,5%, e il filtro alla mediana legge come macchia anche il dettaglio vero |
| 28 ago, 08:10 | 2 | **e l'ipotesi che avevo per curarlo era sbagliata, misurata.** Pensavo che un errore di raggio fosse sale e pepe e il dettaglio connesso, quindi bastasse contare le macchie SOLE. Prodotta apposta una cottura patologica (estrusione 0,25, raggio illimitato): le sue macchie sono connesse al **94,6%**. Contare le sole avrebbe discriminato 1,5 volte; la misura totale ne discrimina **9**. Non era la misura a essere sbagliata, era la soglia |
| 28 ago, 08:10 | 2 | soglia **derivata invece che scelta**: sul soggetto vero sano 0,18%, patologico 2,06%, media geometrica **0,61** -> `--max-macchie 0.6`. Cottura ACCETTATA: copertura 100%, informazione 21,39%, macchie 0,1828%. E l'atlante e' verde con `--forma AABB` (bleed 8 px) |
| 28 ago, 08:10 | 2 | **due dei tre canali dell'ORM sono da buttare, e l'istogramma lo dimostra.** G rugosita': **9 picchi coprono il 98,1%** dei texel, cioe' costante per materiale. B metallicita': **2 picchi (0 e 255) coprono il 99,0%**, binaria. Tutte e due sono gia' in `materiali.js` con ricette misurate, e spedirle sostituirebbe la variazione procedurale di `materia.js` con costanti piatte -- un peggioramento pagato a peso. R occlusione invece ha 256 valori distinti e 38 picchi che coprono solo il 73,7%: quella e' informazione vera |
| 28 ago, 08:10 | 2 | **quindi il corredo costa 260 KB, non 1-2 MB**: normale 2048 a q90 = 211,6 KB (danno misurato 1,8 gradi d'angolo RMS; il 4:4:4 non cambia niente, il croma non era il problema) piu' occlusione a 512 = 48,7 KB, perche' l'occlusione e' a bassa frequenza. Il 3D passerebbe da 436 a ~700 KB e il totale da 2,05 a ~2,3 MB |
| 28 ago, 08:10 | 2 | **ma non si puo' ancora spedire: il GLB non ha UV.** Verificato leggendo il file -- attributi POSITION, NORMAL, COLOR_0, zero texture. E' la trappola gia' documentata di `gltfpack`. La strada: `cuoci-impianto.py` srotola i pezzi PRIMA di unirli in `IMPIANTO_BASSA`, quindi le UV cotte esistono gia' a quel passaggio -- serve un modo `esporta` che si fermi prima del join e scriva il GLB con UV e texture. Riusa lo stesso srotolamento che e' stato cotto, quindi niente seconda implementazione |
| 28 ago, 08:30 | 2 | **il sito spedisce l'ALTA, e la normale serve proprio a non doverlo fare.** Letto dal file: il GLB spedito ha **43.152 triangoli**, e `IMPIANTO_ALTA` ne ha 43.168 -- e' lei. La bassa, quella che la cottura presuppone, ne ha 12.448. Il passo 2 di questo documento lo dice da sempre («adesso quella che viaggia e' la BASSA»); il sito non ha mai fatto il passaggio, quindi paga gli smussi in geometria **e** non ha le UV per la mappa |
| 28 ago, 08:30 | 2 | **e questo ribalta il conto dei byte, misurato con gltfpack (`-cc -kn -ke`)**: alta 213,1 KB contro bassa **61,2 KB**, rapporto 3,48. Applicato ai 309,4 KB spediti oggi fa **~89 KB**: la geometria RISPARMIA ~220 KB e il corredo ne costa 260. **Netto +40 KB**, non 1-2 MB. Il 3D passerebbe da 436 a ~476 KB e il totale da 2,05 a ~2,09 MB |
| 28 ago, 08:30 | 2 | quello che resta da provare, e non e' un dettaglio: la bassa **non ha gli smussi in silhouette**. Una normale finge l'ombreggiatura, non il contorno, e la camera del sito arriva a 2,6 unita' dal meccanismo. Va guardato in A/B nello stesso istante prima di spedire: se i bordi diventano taglienti si vede, e nessun numero di byte lo compensa |
| 28 ago, 08:50 | 2 | **la silhouette non e' un ostacolo: costa 632 pixel.** Reso il confronto a tre (alta / bassa+normale / bassa nuda) alla distanza vera del sito, 2,6 unita': la normale recupera il **61,7%** dello scarto (scarto medio 0,765 livelli contro 1,995 della bassa nuda). E il conto della silhouette, che quel confronto NON fa perche' misura solo i pixel dove tutte e tre hanno materia: **632 px diversi, 1,41% del meccanismo, 0,117% del quadro**. Guardato ingrandito: bassa+normale e' quasi indistinguibile dall'alta, la bassa nuda perde le luci sugli spigoli del carter e l'anello si appiattisce |
| 28 ago, 08:50 | 2 | **e il risparmio e' piu' grande di quanto avevo detto**: `glb-impianto.py` cuoce gia' l'occlusione nei COLORI DEI VERTICI, e applica gli smussi apposta per averla su 44.000 facce invece di 3.528. Passando alla bassa l'occlusione si sposta sulla texture (512 px = 145.000 texel utili, tre volte i campioni per vertice di oggi) e **cade anche COLOR_0 su 39.261 vertici** |
| 28 ago, 08:50 | 2 | **la cucitura fra i due file e' pulita, e decide come si fa il cambio.** `cuoci-impianto.py` esegue `glb-impianto.py` SOLO fino alla riga `print('COTTURA occlusione ambientale...')`, con una guardia che si ferma se sparisce: prende i pezzi coi modificatori BEVEL **non applicati**, e da li' ricava l'alta applicandoli e la bassa togliendoli |
| 28 ago, 08:50 | 2 | **quindi lo srotolamento va messo PRIMA del taglio, coi modificatori ancora attaccati.** Le UV finiscono sulla mesh base -- che *e'* la bassa -- e il BEVEL le interpola quando viene applicato. Cosi' tutti e due i lati le ereditano per costruzione: niente seconda implementazione, e la §3 di `cuoci-impianto.py` diventa una VERIFICA che le UV ci siano invece di una seconda ricetta. **Dopo** il taglio, `glb-impianto.py` toglie i modificatori invece di applicarli, salta la cottura sui vertici, aggancia normale e occlusione e esporta |
| 28 ago, 08:50 | — | **non fatto stanotte, e la ragione e' una regola, non la stanchezza**: quel cambio riscrive il GLB da cui dipende tutta la scena, e va fatto con i cancelli davanti (`collaudo-glb`, `collaudo-gltf`, `collaudo-cinematica`, `collaudo-manopola`, `peso`) e non in coda a una sessione lunga. Il piano qui sopra e' completo e verificato riga per riga: manca l'esecuzione, non l'analisi |
| 28 ago, 09:40 | 2 | **SPEDITO: il meccanismo viaggia come BASSA con normale e occlusione in texture.** 12.448 triangoli invece di 43.152, `COLOR_0` caduto su 39.261 vertici, UV e tangenti su 26/26 primitive, occlusione e normale su 9/9 materiali. GLB da 309,4 a 432,1 KB; la pagina dichiara 558 KB di modelli e 2,17 MB totali, e il cancello del peso li verifica |
| 28 ago, 09:40 | 2 | **lo srotolamento sta in `glb-impianto.py` PRIMA della riga di taglio**, coi modificatori ancora attaccati: le UV vanno sulla mesh base — che e' la bassa — e il BEVEL le interpola quando viene applicato. `cuoci-impianto.py` le eredita eseguendo quel sorgente, e la sua §3 e' diventata una VERIFICA. Il marcatore del taglio si chiamava `COTTURA occlusione ambientale...`, cioe' un passo che non esiste piu': adesso dice cosa fa |
| 28 ago, 09:40 | — | **tre difetti trovati spedendo, e tutti e tre erano parametri che non arrivavano.** (1) Le tangenti uscivano su **1 primitiva su 26**: `calc_tangents()` fallisce sulle facce con piu' di quattro lati e questa geometria aveva **281 n-gon**. Triangolare prima dell'export non cambia la geometria — glTF e' triangoli — cambia solo che le tangenti si possono calcolare. Costo 29 KB |
| 28 ago, 09:40 | — | (2) **l'occlusione usciva NERA**: media 0,004 sull'albero, 0,041 sui dischi, 0,217 sulla pinna. Causa: `--distanza-ao` predefinito e' 1/8 della diagonale, cioe' **53 cm**, e in un meccanismo compatto a mezzo metro ogni punto vede un'altra superficie. La vecchia cottura sui vertici usava **6 cm**, scritto in chiaro nel file che ho sostituito. Con 6 cm: pinna 0,905, lastra 0,986, pezzi dentro il carter 0,34-0,48 |
| 28 ago, 09:40 | — | (3) **`--campioni` era una decorazione**: 64 e 512 davano media 213,2 e deviazione 83,33 IDENTICHE, e la stessa fascia granulosa sul fianco della pinna. Cycles tiene acceso il **campionamento adattivo**, che si ferma alla soglia di rumore. Spento; e il denoise acceso SOLO per l'AO, perche' su una normale inventerebbe continuita' dove servono spigoli. La fascia e' sparita |
| 28 ago, 09:40 | — | la regola che questi tre hanno in comune, ed e' la stessa del raggio di stanotte: **due valori molto diversi che danno lo stesso risultato non dicono che il parametro non serva, dicono che non arriva** |
| 28 ago, 09:40 | — | e la catena e' diventata **un comando**: `sh strumenti/rifai-impianto.sh`. Aveva sei numeri non predefiniti, ognuno da una misura, e vivevano nella cronologia di una shell |
