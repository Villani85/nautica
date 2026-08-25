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
