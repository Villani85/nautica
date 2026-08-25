# Riferimenti tecnici pubblici — e tre cose che ci correggono

Ricerca del 2026-08-25 su documentazione pubblica di stabilizzatori a pinne,
per rifare il modello generico con proporzioni e comportamenti credibili invece
che inventati.

---

## Il limite, prima di tutto

**Si legge la documentazione pubblica. Non si scaricano CAD di terzi.**

Due ragioni indipendenti, entrambe sufficienti:

- **D19** — asset originali e controllati, nessun modello generico o senza
  licenza;
- le regole di candidatura Awwwards accettano i progetti dimostrativi **purché
  design e sviluppo siano interamente di chi sottomette**. Un CAD di CMC, Naiad
  o Sleipner dentro la scena ci squalifica, oltre al problema di licenza.

Leggere un brevetto per capire come è fatto un cinematismo e poi modellarlo da
soli è invece esattamente il mestiere dell'illustratore tecnico. È quello che
faremo.

---

## 1. Il cinematismo, dai brevetti

I brevetti sono la fonte migliore: sono pubblici per costruzione, contengono
viste in sezione, e descrivono il meccanismo a parole invece che a slogan.

**US9527556B2 / WO2014065672A1 — *Stabilizer fin and active stabilizer system
for a watercraft***

- l'**asse dell'attuatore è fissato in un foro ricavato nella pinna**, allineato
  con l'asse di rotazione, e **risale attraverso una penetrazione nello scafo**;
- all'interno della barca un **modulo attuatore è fissato allo scafo**, riceve
  l'asse e ne impedisce lo sfilamento;
- il modulo è un **attuatore a doppio effetto** che sposta l'asse in direzione
  angolare facendo ruotare la pinna;
- può essere mosso da **cilindri idraulici, attuatori elettromeccanici o motori
  elettrici**;
- il bordo d'uscita all'estremità della pinna è **piegato di almeno 15°** (20°
  nelle varianti migliorate) rispetto al piano della base: il profilo laterale
  è concavo, non piatto;
- l'asse di rotazione è **ortogonale alla base della pinna**;
- la Figura 6 è proprio la **sezione del collegamento asse-attuatore attraverso
  lo scafo**.

**US20220234699 — *Fin stabilizer with internal actuation mechanism***: la pinna
è portata da un albero che scende sotto la linea di galleggiamento ed è **fisso
in rotazione** rispetto alla barca; è la pinna a ruotare attorno all'albero, e
l'albero può contenere i **passaggi del fluido idraulico** dall'impianto interno
fino all'attuatore.

**US4777899A — *Hydraulically actuated fin stabilizer system***: il corpo è
fissato allo scafo, con il fluido che entra attraverso condotti e luci.

### Cosa cambia per il nostro modello

Quello che abbiamo — albero passante, flangia di attraversamento carena,
collare di tenuta, riduttore, biella — **è la disposizione giusta**. Non era
scontato: era stata dedotta, e i brevetti la confermano.

Da aggiungere per credibilità, tutte cose che si modellano da zero:
- il **profilo con bordo d'uscita piegato**, invece della lente simmetrica
  attuale: è la differenza fra un'ala vera e una sezione di manuale;
- il **corpo dell'attuatore a doppio effetto** riconoscibile, non un cilindro
  liscio;
- la **tenuta sull'attraversamento**, che è il punto in cui un tecnico guarda
  per primo.

---

## 2. Le proporzioni, dalla documentazione dei costruttori

- **Naiad E-525**: pinne da **1,0 a oltre 3,5 m²** per navi tipicamente di
  **35–50 m** di lunghezza.
- Sistemi per imbarcazioni **da 30 a 200 piedi**: pinne da **2,5 a 33 piedi
  quadri**, cioè circa **0,23–3,07 m²**.
- Il coefficiente di portanza della pinna sta tipicamente fra **0,8 e 1,2**
  nell'intervallo di incidenza di lavoro.

Da qui si ricava una proporzione difendibile fra pinna e scafo, invece di
sceglierla a occhio come adesso.

---

## 3. Le tre cose che ci correggono

Sono difetti di **verosimiglianza**, non di codice. Nessuno se ne accorgerebbe
guardando il sito distrattamente — e il primo tecnico del settore che lo apre se
ne accorge in dieci secondi. Il piano prevede proprio una revisione da parte di
«una persona del settore nautico/industriale»: tanto vale arrivarci preparati.

### 3.1 — Le pinne attive NON funzionano da ferme

È il rilievo più pesante. *"Active-fin stabilisers require ship forward motion in
order to develop lift"* (Wärtsilä). I sistemi commerciali chiedono tipicamente
**almeno 6 nodi**; sotto quella soglia non producono nulla.

La nostra dimostrazione mostra una nave **ferma** che si calma accendendo il
sistema. Nella realtà non succederebbe.

Esistono sistemi *zero speed*, progettati apposta per l'uso all'ancora, ma sono
una **forma di controllo diversa** — muovono la pinna per generare momento
invece di sfruttare la portanza — ed è materia di ricerca a sé.

**Come si risolve, e migliora il sito invece di complicarlo:** aggiungere la
**velocità** come grandezza visibile. Sotto i 6 nodi l'interruttore si accende
ma non succede niente; sopra, il sistema lavora. Diventa una seconda cosa che si
scopre — *la parte invisibile funziona solo se la nave cammina* — e rafforza la
tesi invece di diluirla.

### 3.2 — L'angolo della pinna è troppo grande

Il nostro limite è `±0,52 rad`, cioè **±29,8°**. In letteratura si trova una
**saturazione a 24°**, e i sistemi hanno limiti di incidenza espliciti per
**evitare la cavitazione** — che sopra i ~22 nodi riducono il momento
stabilizzante disponibile.

Portare il limite a **±24°** costa una costante e toglie un dettaglio sbagliato.

### 3.3 — L'89% di riduzione è al limite superiore del pubblicato

`SMORZAMENTO = 0.11` significa che dichiariamo una riduzione del rollio
dell'**89%**. Il riferimento reale: le pinne attive dominano le installazioni
commerciali grandi che richiedono **60% o meglio** alla velocità di servizio;
oltre il **90%** si trova in applicazioni militari e su specifici stati del mare.

L'89% non è impossibile, ma è la cifra migliore del settore presentata come
comportamento normale. Su un sito che ha come registro l'onestà dichiarata —
*«modello illustrativo, valori normalizzati»* — è una stonatura. Una riduzione
fra **70% e 80%** è difendibile, e non toglie niente all'effetto.

---

## Fonti

- <https://patents.google.com/patent/US9527556B2/en> — Stabilizer fin and active stabilizer system for a watercraft
- <https://patents.google.com/patent/WO2014065672A1/da> — stessa famiglia
- <https://patents.justia.com/patent/20220234699> — Fin stabilizer with internal actuation mechanism
- <https://patents.justia.com/patent/4777899> — Hydraulically actuated fin stabilizer system
- <https://www.wartsila.com/encyclopedia/term/active-fin-stabilisers> — voce di enciclopedia tecnica
- <https://www.naiad.com/> · <https://www.wesmar.com/commercial-fin-stabilizer-systems> · <https://info.sleipnergroup.com/en/marinestabilizers> — documentazione costruttori
- <https://pmc.ncbi.nlm.nih.gov/articles/PMC6524811/> — controllo della pinna a velocità zero
- <https://proteusds.com/right-size-stabilize/> — dimensionamento

## Cosa NON è stato verificato

Le cifre di dimensionamento vengono da schede commerciali e da un riassunto di
ricerca, non da una norma di società di classificazione. Prima di scriverne una
sola sul sito va aperta la fonte primaria. Le tre correzioni del §3 sono invece
sostenute da fonti tecniche esplicite e possono entrare subito in lavorazione.
