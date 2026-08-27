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
| | rotazione | carrellata |
|---|---|---|
| ripresa grezza | 0,34° | 0,48% |
| `vidstab`, tutto il quadro, `smoothing=30` | 0,39° | 0,48% |
| `vidstab`, tutto il quadro, `smoothing=0` | 0,57° | 4,92% |
| `vidstab` rilevato sul solo lato stanza | 7,33° | 8,20% |
| stimatore mio, sul montante | **10,26°** | 9,31% |
| | dettaglio | peso |
|---|---|---|
| originale | 3,972 | 12,0 MB |
| crf 26 | 3,795 | 3,68 MB |
| crf 28 | 3,749 | 2,86 MB |
| **crf 30** | **3,714** | **2,24 MB** |
| da togliere | taglio trovato | costo |
|---|---|---|
| 4,6-5,5 s | 0,67 → 9,50 s | 2,7× un fotogramma adiacente |
| 10,6-11,7 s | 10,17 → 14,17 s | 7,1× |
| | salto nel fotogramma del clic |
|---|---|
| mare 4 → 5 | **6,27°** |
| mare 2 → 5 | 1,94° |
| un fotogramma normale | 0,043° |
| quando | passo | cosa è successo |
|---|---|---|
| 27 ago, 07:40 | — | piano scritto e versionato |
| 27 ago, 07:50 | 0-bis | il salone entra nel pass, **in testa**: «altrimenti avrei fatto un filmato» |
| 27 ago, 09:20 | 0 | **i comandi non si spengono più sul meccanismo.** Una riga di CSS teneva la mano fuori dal primo piano; `collaudo-manopola.mjs` la vieta |
| 27 ago, 09:20 | 0-bis | deciso col committente: dal finestrone si vedrà **il mare 3D della scena**, non una clip |
| 27 ago, 10:30 | 0-bis | fatto: il vetro bucato sul mare 3D, e due rotazioni scritte a mano tolte |
| 27 ago, 11:10 | 0-ter | ripresa nuova misurata e maschera estratta (1,37 px). Non spedita: fuori dal cancello di 0,04 gradi, e quattro stabilizzazioni su quattro l'hanno peggiorata |
| 27 ago, 12:15 | 0-quater | **«l'immagine non si muove»**: l'integratore partiva da fermo e l'ampiezza monta in 25 s di costante di tempo. Adesso la traversata è già cominciata |
| 27 ago, 12:15 | — | revisione delle 08:30: corrette la promessa fisica falsa in `#offerta`, i 180,6/181,4 KB (legando anche la prosa alla misura) e l'assenza di cancello su `COLOR_0` |
| 27 ago, 12:40 | 0-bis | **abbandonato.** Il vano diventava vuoto: 67,4% di superficie piatta contro 18,1% col mare girato. Avevo la misura e l'ho letta male |
| 27 ago, 13:10 | 0-ter | **spedita.** Il tetto del cancello adesso si DERIVA dal rientro dichiarato della maschera invece di essere un numero scelto: 11,4 px di scivolamento contro 16 di margine (poi 17,3 contro 24 sulla ripresa senza ciclo: il numero lo stampa il cancello, non il documento) |
| 27 ago, 14:30 | 0-quinquies | il salone risponde: la stanza rolla e l orizzonte no, il mare ha una finestra sua, due difetti di generazione tagliati, attrito e invito, sequenze 2-6 mute, la rotazione si scopre |
| 27 ago, 14:30 | 0-sexies | movimento ridotto: si riduce, non si spegne. Il ciclo spento fermava anche il video |
| 27 ago, 14:30 | 0-septies | tolto il teletrasporto che avevo introdotto io: 6,27 gradi in un fotogramma diventano 0,23 |
| 27 ago, 15:00 | 0-octies | **rimessa nel piano** la specifica del salone attraversabile: era sparita riscrivendo 0-bis e 0-ter, e l ha trovata una revisione. E il lavoro di calibrazione e gia mezzo fatto: le tre rette del vano sono misurate |
| 27 ago, 16:00 | — | revisione delle 11:25 (su `f0bebcd`): **tre dei suoi cinque bloccanti erano già chiusi** dal commit successivo — la posa tesa che sostituiva il salone, il ciclo interno del filmato, il teletrasporto al clic. Restano veri il volume del salone e Pages |
| 27 ago, 16:00 | — | dalla stessa revisione, due difetti piccoli e veri: `vano.json` usciva con CRLF (`Path.write_text` traduce i fine riga su Windows) e i **filmati non avevano un tetto** — in una mattina erano passati da 1,1 a 3,7 MB senza che nessun cancello parlasse |
