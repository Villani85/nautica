# Direzione artistica — il fotogramma che la definisce

Apre la questione **A07**, che due revisioni indipendenti avevano segnalato come
il vuoto più grave del progetto: 420 righe di specifica meccanica e una riga
sulla resa, su un punteggio dove Design e Usability fanno il 70%.

Il riferimento è un'immagine sola, e vale più di un documento di intenti.

---

## Che cosa mostra

Un taglio trasversale, guardato in perpendicolare. **Sopra la linea** un salone:
due persone sedute sui divani, un tavolino, due bicchieri, la finestra a nastro,
i lucernari. **Sotto la linea** il locale macchine: motore elettrico, riduttore,
manovella, biella, albero, flangia di attraversamento carena, e fuori bordo la
pinna nell'acqua.

La linea d'acqua taglia l'immagine a metà esatta, netta, senza sfumatura.

---

## Le tre regole che l'immagine ha trovato

Nessuna delle tre era scritta nella specifica. Tutte e tre entrano.

### 1. L'accento è riservato alla cinematica

Non «un accento saturo sotto la linea», che era la regola vecchia e più debole.
L'acquamarina sta **solo sui pezzi che si muovono**: bottone di manovella, testa
e piede di biella, il tappo del riduttore. Struttura, basamenti, carter, albero
condotto restano acciaio.

Il colore smette di essere decorazione e diventa **informazione**: chi guarda
capisce in un colpo d'occhio dove finisce ciò che sostiene e comincia ciò che
lavora, senza una didascalia. Costa zero e disciplina ogni scelta futura — è
esattamente il tipo di regola che permette a più mani di lavorare senza
divergere.

### 2. La sezione ha spessore di parete

Le facce di taglio si vedono come **bande**, non come un piano. Il guscio ha uno
spessore, e il taglio lo rivela.

La specifica dice `ShapeGeometry`, cioè un piano a spessore zero. È più povero.
Si corregge con una seconda `Shape` offsettata verso l'interno: il tappo diventa
un anello fra profilo esterno e profilo interno. Costa una curva, non è lavoro.

### 3. I due lati hanno registri di resa diversi, non solo colori diversi

È la regola che nessuno aveva nominato, ed è la più forte.

**Sopra**: caldo, morbido, fotografico. Tessuto, legno, pelle, luce diffusa dai
lucernari. **Sotto**: duro, tecnico, lavorato di macchina. Metallo, spigoli,
riflessi stretti.

Non sono due palette: sono **due materialità**. La tesi del sito — *il pezzo che
vale di più è quello che non vedi mai* — è resa dalla differenza di trattamento
prima ancora che dal contenuto. Sopra la gente sta comoda; sotto una macchina
lavora perché ci stia.

---

## Che cosa NON dimostra, e va detto

**Non dimostra che la forma regge l'attraversamento.**

Il rilievo «ha buttato via la nave, sono due scatole impilate» coglie qualcosa di
vero ma sbaglia bersaglio. Una sezione trasversale di un salone **è** un
rettangolo; una sezione di un locale macchine **è** una scatola con il ginocchio
di carena arrotondato — e nell'immagine quella curva c'è, in basso a destra.

Il problema non è la forma: è **l'angolo di camera**. A azimut zero qualunque
sezione legge come una scatola. È lo stesso motivo per cui in questo repository
la vista predefinita è stata portata a **0,34 rad** durante la costruzione: di
fronte, l'estrusione si leggeva come una lastra piatta.

Quindi non è un bivio fra due concetti. È la distinzione fra due cose che
servono entrambe:

- la **vista ortogonale** è il fotogramma da manifesto, quello con cui il sito
  viene riconosciuto;
- la **vista in prospettiva** è l'esperienza, perché è l'unica in cui si vede
  insieme la faccia di taglio e l'interno che fugge.

---

## Le persone: la decisione che va presa adesso

Le due figure sono **fotografiche**. Non passerebbero mai il collaudo in scala di
grigi che la specifica stessa propone, e non sono generabili a 3.000 facce senza
texture: una figura umana è precisamente ciò che quel budget non regge.

Tre strade, e vanno scelte, non subite:

1. **stilizzate per decisione** — silhouette piene, senza volto, nel colore
   della carta. Coerenti col registro del disegno tecnico, e leggibili anche
   piccole;
2. **fotografiche come piano** — un ritaglio 2D orientato verso la camera, non
   geometria. Peso di un'immagine, non di una mesh;
3. **assenti** — e allora la metà emotiva della tesi si perde, insieme al motivo
   per cui il meccanismo esiste.

La 1 è coerente col resto. La 2 è quella che l'immagine mostra. La 3 costa il
concetto.

---

## Il video: un fallimento utile, misurato

Il filmato generato dallo stesso fotogramma dura 10 secondi a 24 fps. È stato
**misurato**, non guardato: 80 fotogrammi campionati a 8 al secondo, rilevando
il bordo carta/acqua sui due margini estremi.

| grandezza | risultato |
|---|---|
| inclinazione della linea d'acqua | mediana **−0,34°** · minimo **−5,14°** · massimo **+0,88°** |
| oltre 1° di inclinazione | **20 fotogrammi su 80** |
| oltre 3° | 6 fotogrammi su 80 |
| quota della linea | mediana **54,4%** · da **52,5%** a **61,2%** |

Due letture, e la seconda è più grave della prima.

**L'inclinazione si rompe, ma meno di quanto sembri.** Il caso peggiore è 5,1°,
che è un'inclinazione visibile — su un fotogramma da 1280 px la linea si sposta
di un centinaio di pixel da un margine all'altro — ma non è una diagonale.

**La quota deriva di nove punti, e questo nessuno l'aveva notato.** Passa dal
52,5% al 61,2% dell'altezza, con mediana 54,4%. Cioè **il video non ha mai
rispettato la regola del 50%**, nemmeno da fermo. E la regola del 50% non è
un'estetica: è il vincolo da cui dipende che il fondo CSS combaci col disegno,
misurato a **0 px** di scarto nella costruzione vera.

Si rompe anche una terza cosa: **l'accento sparisce** a metà filmato e torna
alla fine. La regola del colore riservato alla cinematica non sopravvive
nemmeno dieci secondi.

### Perché è la prova migliore che questa cosa va costruita

Un modello generativo tratta ogni fotogramma come un'immagine a sé. Non ha
nessun modo di tenere un **invariante** — e la linea a metà schermo, l'accento
sulla cinematica, lo spessore della parete sono tutti invarianti.

Il 3D in tempo reale gli invarianti li dà **gratis**, per costruzione: la camera
sta a quota zero, quindi la linea è a metà schermo, sempre, senza che nessuno la
controlli. È il contrario di un vincolo da sorvegliare.

Il video non è una delusione: è la dimostrazione, per differenza, di che cosa
solo il tempo reale può fare.

---

## Cosa entra nel lavoro

1. accento riservato ai pezzi in movimento — regola di `materiali.js`;
2. tappi di sezione ad anello, con spessore di parete;
3. due registri di resa, non due sole palette: sopra morbido e diffuso, sotto
   duro e speculare;
4. la vista ortogonale come fotogramma da manifesto, la prospettiva come
   esperienza;
5. la decisione sulle persone — aperta, vedi sopra.

Restano fuori, perché non sono direzione artistica ma conseguenze da misurare:
tipografia (ferma a **P01-bis**), impaginazione, e il comportamento delle due
materialità su telefono.
