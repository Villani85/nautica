# Censimento delle font dei Site of the Day — e cosa chiude A04

Il blocco su **A04** (quali due famiglie tipografiche) aspettava da giorni un
censimento che nessuno aveva fatto. È stato fatto, e poi **verificato in modo
indipendente** aprendo la faccetta e interrogandola.

Base: la catalogazione Awwwards su **6.432 Sites of the Day**.

---

## Il risultato che chiude la questione

Cercando `Grotesk` nella faccetta Font dei SOTD escono **due sole famiglie**:

- **Acid Grotesk** (Blaze Type)
- **Basel Grotesk** (Atipo)

Entrambe di fonderia, entrambe a pagamento.

> **Space Grotesk non compare.** Non fra i SOTD, in nessuna posizione.

Cercando `Mono` escono **tre** famiglie in tutto: **Azeret Mono**,
**Fraktion Mono**, **Fragment Mono**. **JetBrains Mono non compare.**

Le due famiglie che il prototipo usa oggi — Space Grotesk e JetBrains Mono —
sono **entrambe assenti** dal campo dei vincitori.

## E la cosa che va detta sul metodo

La proposta originale era di aprire gli ultimi venti SOTD e leggere la
`font-family` dal dev tools. È stata fatta una cosa diversa e più larga: la
**faccetta di catalogazione** di Awwwards su tutto lo storico. Più dati, meno
recenti, e sono **i tag di Awwwards, non il CSS reale**.

### Chi ha proposto il censimento aveva previsto l'opposto

Nel contributo originale (F3) la previsione era che aprendo i SOTD si sarebbero
trovate famiglie comuni ovunque, e che quindi la proposta di cambiare i caratteri
cadesse **come causa**.

**I dati dicono il contrario della previsione, e chi l'aveva fatta l'ha
scritto.** È il comportamento che questo repository chiede a tutti, applicato a
sé stessi. Vale la pena registrarlo insieme al risultato.

---

## Due letture che il censimento NON sostiene

Il risultato è solido. Due conclusioni che gli si potrebbero appendere non lo sono.

### 1. L'ordine della faccetta non è affidabile

Il contributo riporta un ordine — *Neue Montreal, PP, GT, Neue Haas, Aeonik,
Monument, Open, DM, Founders…* — presumendo che sia per frequenza, e lo dichiara
come presunzione.

**Aprendo la stessa faccetta l'ordine osservato è diverso:** *Aeonik, GT,
Founders, DM, FK, ABC, AT, Druk…*

L'insieme si sovrappone parecchio, la **graduatoria no**. Quindi:

> **L'appartenenza all'elenco è una prova. La posizione nell'elenco non lo è.**

Non si può dire «Neue Montreal è la più usata». Si può dire «Neue Montreal è
nel campo, Space Grotesk no».

### 2. L'assenza di un mono pesa molto meno dell'assenza di una grottesca

Tre monospaziate in tutto su 6.432 siti è un numero troppo piccolo perché
significhi «i mono non si usano». Significa quasi certamente che **la faccetta
registra il carattere notevole, quello del display**, non ogni carattere
presente nella pagina.

Conseguenza pratica: l'assenza di **Space Grotesk**, che nel prototipo è il
carattere *del display*, è una prova forte. L'assenza di **JetBrains Mono**, che
sta nelle etichette da 10px, è quasi priva di valore. La coppia va cambiata lo
stesso, ma per coerenza di sistema, non perché il dato lo dimostri.

---

## Correlazione e causa

La riformulazione proposta — *sono assenti dal campo perché il campo compra i
caratteri* — è molto migliore della motivazione originale, che si appoggiava a
un rubric inesistente. Ma va tenuta per quello che è:

**Il campo che vince compra i caratteri. Comprare i caratteri non compra i
punti.** La popolazione che vince ha anche altre dieci abitudini costose.

Quello che si compra davvero non è un punteggio: è **non somigliare a un
modello preconfezionato**. E questo restringe il criterio in modo utile —
qualunque famiglia fuori dal grappolo delle scelte automatiche assolve, e non
deve necessariamente essere cara.

---

## I criteri di scelta, in ordine di forza

**1. Una famiglia con un mono sorella.** È il criterio più forte, ed è del
contributo. La coerenza fra display e mono arriva gratis invece di essere
costruita, ed è esattamente ciò su cui si vota il 40% del Design. Nel campo
osservato lo danno Monument Grotesk (Dinamo), GT America con GT Pressura Mono
(Grilli Type), Aeonik con Aeonik Mono (CoType).

**2. Cifre tabulari vere, in entrambe le famiglie.** Criterio che nessuno aveva
nominato, e per questo progetto è vincolante: le letture a schermo — rollio,
picco, riduzione — **cambiano sessanta volte al secondo**. Se le cifre non hanno
larghezza costante, i numeri ballano mentre si guardano. Serve nel mono per le
letture, **e nel display** per la tabella dei numeri della sezione tecnica.

**3. Una variabile, se c'è.** Ha un effetto che non è di gusto ma di
prestazione: oggi i font pesano **67,2 KB** e sono **la voce dominante del
percorso critico**, che senza di loro sta a 7,6 KB. Una variabile può sostituire
due file statici con uno. Il carattere quindi non tocca solo il Design 40%:
tocca la Usability 30%.

---

## La licenza, e una trappola concreta

Il costo di una coppia display + mono, due o tre pesi ciascuna, con licenza web
per un sito piccolo, sta nell'ordine delle **centinaia di euro**. Non
proibitivo, ma **non «quasi nullo»** — che era già la correzione fatta a
`P01-bis`, e il censimento la conferma dal lato opposto.

> **Trappola: la licenza di prova non basta.** Questo sito è uno strumento di
> vendita — la decisione **D36** dice che il cliente è la componentistica, e il
> sito serve a vendere a quel cliente. È **uso commerciale**. Le licenze
> personali o di prova che molte fonderie regalano non lo coprono, e su un sito
> candidato a un premio la cosa è visibile a chiunque apra il CSS.

---

## Cosa resta aperto

Il censimento chiude la domanda «vanno cambiate?» — **sì** — e fornisce i
criteri. **Non sceglie la coppia**: quella richiede di guardare i caratteri
composti nella nostra scala, con i nostri numeri dentro, non di leggerne il nome
in un elenco.

Il passo successivo è una prova di composizione: le stesse tre schermate — il
titolo che attraversa la linea, le letture della dimostrazione, la tabella dei
numeri — composte con due o tre coppie candidate e messe a confronto.

---

# La proposta: Recursive. Gratis, e migliore dei criteri che l'avevano generata

Verificata eseguendo, non scelta leggendo un elenco.

**Recursive** — Stephen Nixon / Arrow Type — **OFL-1.1**, self-hostable via
`@fontsource-variable/recursive` (nessun CDN, quindi **D06** è salva).

## Perché batte una coppia comprata, sui nostri stessi criteri

### Criterio 1 — mono sorella: qui non è sorella, è la stessa

Recursive ha un asse **`MONO`, da 0 a 1, passo 0,01**. Non è una famiglia con
un mono affiancato: è **un disegno solo** che scorre da proporzionale a
monospaziato.

Verificato misurando le larghezze reali dopo aver istanziato il font:

| | `i` | `W` | `m` | cifre | `.` | larghezze distinte |
|---|---|---|---|---|---|---|
| **MONO = 0** | 350 | 950 | 850 | 600 | 350 | 4 → proporzionale |
| **MONO = 1** | 600 | 600 | 600 | 600 | 600 | **1 → monospaziato** |

La coerenza fra display ed etichette non «arriva gratis»: è **tautologica**.
Nessuno può sbagliare l'abbinamento perché non c'è un abbinamento.

### Criterio 2 — cifre tabulari: ci sono, e in un modo più solido

`tnum` **non esiste** in Recursive. Le funzioni presenti sono `ccmp dnom frac
liga locl numr pnum rvrn`.

Non serve: **le cifre sono larghe 600 in entrambe le modalità**, quindi sono
**tabulari per costruzione**, e `pnum` è semmai la via d'uscita verso le
proporzionali.

È una garanzia più forte di una funzione OpenType: una funzione si può
dimenticare di attivare, o farsi azzerare da un `font-feature-settings` scritto
altrove. Una larghezza no. Le letture del rollio cambiano sessanta volte al
secondo: qui non ballano perché **non possono**.

### Criterio 3 — variabile, e pesa meno di quello che abbiamo

Il file variabile completo pesa 297,8 KB, che sarebbe stato un no. Ma il font si
**istanzia** sui due estremi dell'asse e si sottoinsiema ai glifi che il sito
usa davvero. Misurato:

| | peso |
|---|---|
| MONO = 0, peso ancora variabile 300–1000 | 31,9 KB |
| MONO = 1, peso ancora variabile 300–1000 | 31,0 KB |
| **totale, con il peso variabile** | **62,9 KB** |
| totale, a peso fisso | **24,8 KB** |
| *oggi: 4 file statici Space Grotesk + JetBrains* | *67,2 KB* |

**62,9 KB contro 67,2**, e in cambio il peso diventa **continuo da 300 a 1000**
invece di due valori fissi. A peso fisso si scende a 24,8 KB, cioè **−63%**
sulla voce dominante del percorso critico.

## E la ragione che vale più delle tre messe insieme

Un asse che scorre da **proporzionale a macchina** è la tesi del sito scritta
nel sistema tipografico.

Sopra la linea la gente sta comoda: proporzionale, umano, `MONO = 0`. Sotto la
linea lavorano le macchine: monospaziato, tecnico, `MONO = 1`. Non è un
abbinamento scelto perché sta bene — è **lo stesso argomento del taglio,
applicato alle lettere**, e discende dalla regola generativa invece di
affiancarsi ad essa.

È esattamente ciò che il 40% del Design premia: non una bella scelta, un
sistema che deriva da un principio.

*Cautela, perché è il genere di idea che scivola in una trovata:* i due lati
usano **i due estremi**, fermi. Far scorrere l'asse con lo scorrimento sarebbe
un effetto, e la regola di casa dice che la settima idea che non discende dal
taglio si rifiuta.

## Cosa questo cambia in D40, D41 e D42

- **D40** (le due famiglie si cambiano) — confermata, e adesso c'è la sostituta.
- **D41** (i tre criteri) — soddisfatti tutti e tre, e due in modo più forte di
  come erano stati posti.
- **D42** (licenza commerciale, non di prova) — **decade**. OFL-1.1 copre l'uso
  commerciale e la ridistribuzione self-hosted. Restano gli obblighi della
  licenza: mantenere la nota di copyright e non vendere il font da solo.

Le centinaia di euro previste per una coppia di fonderia non servono più. Non
perché si sia rinunciato al livello, ma perché **il criterio giusto non era il
prezzo**: era non somigliare a un modello preconfezionato, e avere un sistema
invece di due scelte.

## Cosa resta da fare prima di adottarla

La prova di composizione resta necessaria, e non è una formalità: **i numeri
misurati dicono che si può, non che è bello.** Le stesse tre schermate — il
titolo che attraversa la linea, le letture della dimostrazione, la tabella dei
numeri — composte con Recursive ai due estremi, guardate, e confrontate con
almeno una coppia di fonderia per non innamorarsi della soluzione elegante.

Lo strumento che ha prodotto questi pesi va salvato: serve a rifare la misura
ogni volta che cambia l'insieme dei glifi.
