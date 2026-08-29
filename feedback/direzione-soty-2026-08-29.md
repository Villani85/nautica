# Direzione «Site of the Year» — cosa è stato fatto, e cosa no

Nono giro, e il primo che non elenca difetti: propone un **percorso**. La
diagnosi in una riga — *«oggi hai un'idea da SOTY e un'implementazione da
SOTD»* — e quattro punti di divario: continuità ancora simulata dal filmato a
schermo pieno, yacht visivamente provvisorio, atto due troppo facile da
saltare, persone non ancora governate dalle conseguenze.

La frase che deve governare tutto:

> Entro nella stessa nave, metto due persone in difficoltà, scopro perché le
> pinne smettono di funzionare, attivo la soluzione corretta e torno da loro
> dopo averle calmate.

Questo giro ha lavorato sul **terzo e sul quarto** divario, che sono di codice.
Il primo e il secondo sono lavoro di ASSET — modellazione, illuminazione,
riprese — e sotto è scritto per esteso perché non sono stati toccati invece di
essere toccati male.

---

## PUNTO 2 — L'atto due si capisce, e adesso in quindici secondi

**L'affermazione.** *«Il modello causale è buono. Il tempo narrativo no.»* Il
suggerimento del giroscopio compariva sotto i 7 nodi, cioè a quasi trenta
secondi dallo spegnimento: corretto, e più tardi della fine dell'esperienza.

**Confermata, e il conto era peggiore di così.** `ACCEL_RIF` valeva 0,30 kn/s,
e in caduta libera la resistenza quadratica dà `1/V` lineare nel tempo:

| soglia | con 0,30 | con 0,80 (adesso) |
|---|---|---|
| 11 kn | 4,9 s | 2,5 s |
| 10 kn | 9,3 s | **4,3 s** |
| 9 kn | 14,7 s | 6,4 s |
| 8 kn | 21,3 s | 8,9 s |
| 7 kn | **29,9 s** | 12,1 s |

**Cosa è cambiato.**

- `ACCEL_RIF` **0,30 → 0,80**. Non sposta di un nodo il punto di servizio —
  all'equilibrio spinta e resistenza si pareggiano a `V_RIF` qualunque sia il
  suo valore — sposta solo l'orologio. È l'unica costante che lo fa.
- `TAU_GYRO` **20 → 4,5 s**. A venti secondi il rotore aveva preso meno di due
  terzi della coppia, e la metà leggibile della curva cominciava dopo il minuto.
  A 4,5: 63% a 4,5 s, 86% a 9, 95% a 13,5. Resta una salita, non uno scatto.
- L'integrazione del rotore passa da `Math.min(1, dt/tau)` alla forma esatta
  `1 - exp(-dt/tau)`, così non cambia fra 30, 60, 120 Hz né a passo dichiarato.
- La pagina lo **dichiara**: `#patto` adesso legge *«Illustrative model ·
  Generic geometry · Normalised values · Accelerated time»*.

**Quello che NON è cambiato, e va detto:** le tabelle di stallo e di riduzione
di `simulazione.js` sono indicizzate sulla **velocità**, non sul tempo. «A 10
nodi la pinna è in stallo il 71%», «riduzione 90,8% a 12 kn e 8,2% a 6» restano
vere parola per parola. Cambia quando ci si arriva.

### La sequenza di nudge, guidata dallo stato fisico

Erano due messaggi con in mezzo il silenzio. Adesso quattro, e **nessuno
dipende dall'inattività**:

| t | condizione fisica | testo |
|---|---|---|
| ~0 | propulsione accesa, pinne accese | Switch propulsion off |
| ~0,2 s | albero al 68% dei giri | The shaft slows. Speed follows. |
| ~4,3 s | autorità pinne sotto il 70% | The fins are still on. They are losing water. |
| ~12,8 s | rollio avvertibile (1,8 RMS) | Try the gyro |
| dopo | — | *niente. Si guarda.* |

`DURATA_ATTO_DUE` è 4 s e non 7: i messaggi si mettono in fila uno alla volta, e
con sette secondi a testa la coda avrebbe scavalcato il momento in cui la fisica
merita il giroscopio.

**Un buco trovato costruendo la sequenza:** fra la terza e la quarta battuta ci
sono ~4 s di silenzio, e in quel tratto il nudge del menu — *«Jump to any
scene»* — era ammissibile. Il sito invitava ad andarsene nel mezzo del proprio
unico esperimento. È lo stesso errore di regia già segnalato una volta su questo
identico nudge, curato allora con `scene` (quando è troppo presto) e adesso con
`battute` (dove è fuori posto).

### «Experiment incomplete», senza bloccare lo scroll

`src/ui/esperimento.js`. Non blocca niente — bloccare trasforma una scoperta in
un pedaggio. Compare **solo** se l'utente ha spento la propulsione con le
proprie mani, **solo** quando la dimostrazione è fuori campo, e se ne va in
tutti e due i modi di chiudere l'esperimento: accendere il giroscopio (la
soluzione) o riaccendere la propulsione (la rinuncia). Riporta al meccanismo con
uno scorrimento, non con un salto.

**E un difetto che l'indicatore ha introdotto, preso da un cancello che c'era
già.** `collaudo-manopola` ha bocciato la pubblicazione con:

```
I COMANDI NON SI RAGGIUNGONO NEL PRIMO PIANO:
 - sul meccanismo, "manopola del mare, stato 2": coperto da "esperimento"
```

Il bottone nasce `hidden`, ma la mia regola `.esperimento{display:flex}`
**scavalca `[hidden]{display:none}`**, che sta nel foglio dello user agent e
perde contro qualunque regola d'autore che dichiari un `display`. L'elemento
restava quindi nel quadro: invisibile per l'occhio (opacità 0) e solido per
`elementFromPoint`. Un comando nuovo che ne copriva uno vecchio, e nessuna
prova a occhio l'avrebbe visto. Una riga — `.esperimento[hidden]{display:none}`
— e la manopola è tornata raggiungibile.

---

## PUNTO 3 — Le persone sono dentro la simulazione

**L'affermazione.** *«La reazione non deve dipendere dal booleano del pulsante.
Deve dipendere da una misura filtrata del movimento.»*

**Confermata a metà, ed è la metà che conta.** Non dipendeva dal booleano già
prima — `composito.js` aveva un'isteresi — ma dipendeva dall'**angolo
istantaneo**, che attraversa lo zero due volte per ciclo. L'isteresi era un
secondo meccanismo per compensare la grandezza sbagliata.

**Cosa è cambiato.**

- `simulazione.js` espone `S.rollioRms`: valore efficace del rollio su una
  finestra scorrevole di quattro secondi (media mobile esponenziale del
  quadrato, forma esatta, nessun campione in memoria). Quattro secondi è poco
  più di mezzo periodo di rollio: abbastanza per non contare le traversate dello
  zero, abbastanza poco perché il ritorno del rollio si veda dentro il budget.
- Le due persone reagiscono a quella. **Le soglie sono misurate**, non scelte:

  | | mare 2 | mare 5 |
  |---|---|---|
  | stabilizzatore ACCESO | 0,14–0,35 | 0,35–0,89 |
  | stabilizzatore SPENTO | 2,07–3,70 | 5,17–9,24 |

  Fra 0,89 e 2,07 c'è un vuoto largo più del doppio, e viene dalla fisica: fra
  le due condizioni ci sono undici punti di guadagno di risonanza.
- **Ritardo biologico** `IPOTESI_RITARDO_UMANO_S = 0,45 s`: la reazione non
  parte nel fotogramma in cui la soglia viene superata. Senza, la coppia si
  muoveva insieme al clic e si leggeva come un'animazione innescata da un
  bottone.
- **Presa più rapida del rilascio**: 0,29 s per irrigidirsi (un riflesso), 1,1 s
  per sciogliersi (una decisione). Con una costante sola il ritorno alla calma
  sembrava uno stacco di montaggio invece di due spalle che scendono.

### E una soglia sola per due cose, che è la tesi

`IPOTESI_ROLLIO_AVVERTITO_RMS = 1,8` la leggono in due: `composito.js` per far
irrigidire la coppia, `nudge.js` per far comparire «Try the gyro». **Il
suggerimento arriva nell'istante in cui la coppia si irrigidisce.** Due numeri
separati prima o poi divergono, e allora il sito suggerirebbe una cura per un
male che nessuno sta vedendo.

Sostituisce `IPOTESI_ANDATURA_GYRO_KN = 7,0`, che era un **surrogato** del
rollio. Misurato, sbagliava in tutti e due i versi:

| | 7 kn | rollio avvertito |
|---|---|---|
| mare 3 | 12,1 s | 24,7 s |
| mare 4 | 12,1 s | 12,8 s |
| mare 5 | 12,1 s | 11,9 s |

La colonna dei 7 nodi è identica su tutti e tre gli stati del mare: è il modo
più chiaro di dire che stava misurando la cosa sbagliata.

**Le tre clip perfettamente registrate NON esistono ancora.** Il punto 3 ne
chiede tre (rilassate, in tensione, sollievo) con stessa inquadratura, stessi
volti, camera ferma. Oggi ce ne sono due, e il collaudo della posa lo dichiara
da sé. Quello che è stato costruito è **l'accoppiamento**: il giorno che la
terza clip arriva, si attacca a una grandezza che è già lì e già misurata.

---

## PUNTO 8 — La CI misura il meccanismo, non il runner

Il lavoro era già nella copia di lavoro, non committato. È stato portato qui
perché è la premessa di tutto il resto: senza un tempo simulato dichiarabile,
nessuna delle tarature sopra si può verificare.

`disegna(sim, marca, {dt, senzaDisegno})` sostituisce l'orologio e salta il
render; `passoDichiarato(dt, n)` lo espone. `collaudo-manopola` campiona a 1/60
dichiarato: sul runner senza GPU ne disegnava **12 fotogrammi in 20 s** e il
verdetto usciva rovesciato — mare 5 meno agitato di mare 2, fisicamente
impossibile.

### Il cancello nuovo: il budget di tempo

`collaudo-catena.mjs` ha una sezione in più, e guarda una cosa che nessun altro
cancello poteva vedere: **un modello può essere corretto e arrivare tardi.**

```
  OK  un secondo dopo lo stop l albero e visibilmente piu lento (68%, tetto 75%)
  OK  l andatura scende sotto i 10 kn in 4.3 s (tetto 10)
  OK  il rollio torna avvertibile in 12.8 s (tetto 14, direzione 10-12)
  OK  a mare 5 il rollio torna avvertibile in 11.9 s (tetto 12)
  OK  otto secondi dopo il clic il giroscopio ha gia coppia (0.43, a regime 0,62)
```

Non misura nessun orologio reale: avanza a passo dichiarato e legge il tempo
**simulato**, lo stesso numero su qualunque macchina.

**Dove il sito NON rispetta il budget, e il cancello lo dice invece di allargare
la misura fino a coprirlo.** La direzione chiede il rollio chiaramente crescente
entro 10–12 s. A mare 4 — lo stato a cui `regia.js` porta chi arriva al
meccanismo — sono **12,8 s**. Otto decimi oltre, e non si comprano accelerando
la nave:

| ACCEL_RIF | rollio avvertibile, mare 4 |
|---|---|
| 0,80 | 12,8 s |
| 1,00 | 12,5 s |
| 1,20 | 12,4 s |
| 1,50 | 11,9 s |

Quasi un raddoppio della decelerazione compra nove decimi. Il ritardo non è
nella caduta dell'abbrivio: è nel **filtro**. Quattro secondi sono ciò che ci
vuole perché «la nave sta rollando» sia un'affermazione e non un'onda;
accorciarli rimetterebbe a lampeggiare le due persone del salone, che è il
difetto che quel filtro esiste per curare.

Si chiude in un modo solo: **meno autorità residua alle pinne sotto i 7 nodi**,
che è una scelta di modello e non di taratura, e va fatta guardando.

### E una trappola trovata mentre lo si costruiva, che vale per TUTTI i cancelli

Il collaudo nuovo bocciava due battute su quattro: *«manca la battuta
dell'albero», «manca la battuta delle pinne»*. Comparivano benissimo. Il
cancello stava misurando **il `dist` di un altro processo**.

`collaudo-nudge` lancia il proprio server con `--strictPort` e `stdio:
'ignore'`. Se la porta è occupata **vite esce, e non lo dice a nessuno**: il
cancello poi apre `localhost:5321`, lo trova che risponde — perché risponde il
server di qualcun altro — e misura quello. Tre corse per accorgersene.

E non è un caso isolato. Gli altri cancelli col browser dichiarano la stessa
politica per scelta: *«se un server è già acceso sulla porta lo si usa: in
locale è comodo, e chi lo ha acceso sa cosa ha acceso»*. Sulla mia macchina,
in questo momento:

```
porta   4174  5180  5195  5216  5223  5231  5321   →  tutte occupate
```

Sono server rimasti indietro da corse precedenti (`preview.kill()` su Windows
non chiude l'albero `npx → vite`) e da lavori in parallelo. **Il default di
`collaudo-continuita`, `collaudo-telefono`, `collaudo-ridotto` e
`collaudo-manopola` è la 5180, che è anche la porta di `npm run dev`**: un
server di sviluppo acceso e quei quattro cancelli non provano più la build.

Con `PORTA_COLLAUDO` su una porta libera, la sequenza esce giusta al primo
colpo:

```
  0.3 s   11.97 kn   [taglio]   "The shaft slows. Speed follows."
  4.6 s    9.85 kn   [taglio]   "The fins are still on. They are losing water."
  9.8 s    7.69 kn   [taglio]   "Try the gyro"
  acceso il giroscopio, otto secondi dopo: silenzio
```

`collaudo-nudge` adesso **muore invece di misurare**: se il figlio esce prima
che si cominci, stampa NON MISURABILE e dice quale porta provare. È la stessa
regola che questo repo si ripete addosso da settimane — *un metro rotto non dà
errore, dà un numero* — applicata allo strumento invece che al sito. Gli altri
cancelli col browser meritano lo stesso trattamento, e questo giro non gliel'ha
dato.

### `collaudo-nudge` adesso protegge qualcosa

Controllava una cosa sola: che la bolla del giroscopio comparisse. Adesso
osserva **tutta la fila** — albero, pinne, giroscopio — ne verifica l'**ordine**
(«le pinne stanno perdendo acqua» detto dopo «prova il giroscopio» sarebbe la
catena raccontata al contrario) e pretende il **silenzio dopo il giroscopio**.

**E non misura i secondi, deliberatamente.** Le battute maturano su grandezze
della simulazione, che avanza a fotogrammi: un tetto in secondi qui misurerebbe
la velocità del runner. Il budget di tempo sta dove la misura vale, a passo
dichiarato.

*(`collaudo-nudge` in `npm run collaudo` e in CI è stato aggiunto in parallelo
nella copia principale; questo ramo non tocca quei due file per non entrare in
conflitto.)*

---

## PUNTO 7 — Il suono, generato dallo stesso stato

`src/ui/suono.js`. **Non c'è nessun file audio.** Cinque sorgenti sintetizzate,
lette da `sim.S` dieci volte al secondo:

- **mare** — rumore passa-basso, dallo stato del mare;
- **scia** — rumore in banda, col **cubo** di `velocita/V_RIF`: sotto i sei nodi
  praticamente non c'è più, ed è il punto — la nave che plana è silenziosa prima
  ancora di essere lenta;
- **scafo** — quaranta metri di struttura che si torce, da `rollioRms`;
- **motore** — due denti di sega a `26 + 54·giri` Hz, col passa-basso che segue
  la fondamentale: salendo di giri cambia il **timbro**, non solo l'altezza;
- **giroscopio** — un tono che sale da 170 a 650 Hz coi giri del rotore.

Il **silenzio relativo quando la nave torna stabile non è programmato**: nessuna
riga dice «alla fine abbassa». Succede perché a giroscopio inserito il rollio
scende, l'albero è fermo, l'andatura è bassa. Tre sorgenti che si spengono per
conto loro, e resta il mare.

`AudioContext` non viene nemmeno **costruito** finché nessuno preme il comando —
non è un contesto sospeso in attesa: non esiste. Il primo volume sale da zero in
due secondi.

---

## PUNTO 1 — La carta del salone: il tell è tolto. La traversata no.

Il punto 1 sono **due** carte, e vanno separate perché costano cose diverse.

### La carta del salone — curata, e si vede

`feedback/prove/2026-08-29-salone-e-una-carta.png`: a scorrimento 0,235 il
salone è un rettangolo con quattro bordi netti che galleggia contro lo scafo.
*«Ruotando compaiono zone bianche intorno al rettangolo, il bordo destro appare
come il margine di una scheda.»*

**La causa non era il piano: era ciò che c'era dietro.** Un piano non ha bordi
visibili se dietro c'è una stanza; li ha se dietro c'è il mare. E dietro c'era
il mare, letteralmente — `nave.js` costruisce la tuga in due fasce, parapetto e
tetto, e fra le due non c'è niente. Quella trasparenza non è un difetto: è la
prova §5.1 che l'orizzonte non rolla con la stanza. Ma nel tratto in cui c'è la
fotografia si vede **da parte a parte**, quindi il bordo si stacca contro il
cielo e il rettangolo legge come una scheda.

Adesso dietro la fotografia c'è un fondo che chiude la fascia **solo lì**, con
un margine. Il resto della tuga resta passante e la prova dell'orizzonte regge
intatta. Confronto: `feedback/prove/2026-08-30-salone-dentro-un-volume.png`.

Il colore non è una tinta scelta a occhio: è la **stessa clip**, ingrandita
quattro volte — a quell'ingrandimento non si riconosce più niente, resta il
tono — e moltiplicata per un fattore scuro. Grana, temperatura e artefatti di
compressione coincidono col bordo della fotografia per costruzione, che è la
stessa ragione per cui il mare dietro il vetro è la stessa clip della stanza.

**Tre giri per arrivarci, e i due errori valgono quanto il risultato:**

1. La prima versione toglieva i bordi della fotografia e ci metteva i **propri**:
   un rettangolo nero netto invece di uno chiaro. Meglio — almeno legge come
   ombra e non come cielo — ma sempre un rettangolo.
2. La sfumatura copiata dal mare **non sfumava niente**, e il codice sembrava
   giusto. Il fondo magnifica la clip con `repeat = 1/4`, quindi `vMapUv` corre
   solo fra 0,375 e 0,625: non si avvicina mai a 0 né a 1, e lo smoothstep
   restituisce 1 dappertutto. Sul mare la stessa riga funziona perché lì
   l'ingrandimento è 1,55 e la fascia è 0,06. Serviva la UV **grezza** del
   piano, portata con un varying proprio.
3. Con il fondo a 1,9 × 1,25 e una sfumatura di 0,24 per lato, il nucleo opaco
   valeva `(1 − 2·0,24) × 1,9 = 0,99` volte la stanza: il fondo spariva
   **proprio dove finisce la fotografia**, e il bordo di lei tornava. A 2,4 ×
   2,8 il nucleo vale 1,44 × 1,68 e la fotografia finisce dentro la parte
   piena.

**Cosa NON è.** Non è il guscio Blender con la proiezione dalla posa calibrata
che la direzione chiede. È il tell tolto con la geometria che c'era già. Da
fuori, attraverso il taglio, un salotto illuminato dentro un volume scuro è
esattamente ciò che si vede guardando dentro un ambiente da una fessura — ma
non c'è occlusione vera: mobili e imbotti non passano davanti a niente.

**E il guscio vero è più vicino di quanto sembri**, perché la calibrazione
esiste già ed è seria: `riferimenti/salone/posa.json` porta la posa della camera
sorgente (x −2,9322, y 1,17, z 0,8436 dal montante; imbardata −18,98°,
beccheggio −2,827°), la matrice di rotazione, il guscio in metri (pavimento
−0,5628, soffitto 1,7872, murata destra 4,5747), il vano, la focale 1177,51 px
coerente con la `PerspectiveCamera(34)` del sito, **e il limite oltre cui la
profondità non è più misurata** (1,90 m; la paratia di fondo è dichiarata non
determinata). Errore di riproiezione 1,175 px medio. Chi costruirà il guscio non
deve misurare niente: deve modellare quei numeri e proiettare.

### La traversata a schermo pieno — NON toccata

`traversata.js` monta ancora il filmato su un `PlaneGeometry` figlio della
camera, con `depthTest:false`, `renderOrder = 999` e opacità fino a 1.
Sostituirla chiede una traiettoria di camera dentro `interni.glb` e il filmato
come proiezione world-space: è la parte del punto 1 che resta lavoro di asset e
di regia, non di righe.

**E il numero esiste già.** `collaudo-continuita` lo stampa a ogni corsa:

```
LASTRA      copertura massima 1.00 — 2 campioni su 45 giudicano una texture, non la scena
```

Lo misura e non ci boccia sopra. Il tetto che la direzione chiede — *nessun
piano figlio della camera copra più del 10% del fotogramma* — si scrive in una
riga di quel file. Metterla oggi renderebbe la CI rossa senza avvicinare di un
metro la soluzione, e un cancello che si tiene disattivato non è un cancello:
va acceso **insieme** alla shell, nello stesso commit che la rende vera.

## PUNTO 4 — Il texturing degli interni: l'occlusione c'è

**L'affermazione.** *«`interni.glb` ha 4 materiali, 14 primitive, 0 texture e 0
immagini. È una struttura utile per la sezione, non ancora un interno
fotorealistico.»*

**Confermata, ma la diagnosi era incompleta**, e guardare i provini lo dice
subito. Il modello è ben costruito — ordinate, pagliolati, paratie, scale,
riduttore, serbatoio, il gruppo pinna. Quello che manca non è "una texture": è
**l'ombra di contatto**. Dove il pagliolato incontra l'ordinata, sotto i piani,
dietro le scalette, nell'angolo fra fasciame e paratia non si scurisce niente.
Un interno senza occlusione legge come cartone ritagliato per quanto sia
modellato bene, ed è il segno di CG più forte che quelle immagini portano.

Quindi si cuoce l'occlusione, e **non** la coppia normale+ORM delle macchine:
lì una ALTA con smussi trasferisce dettaglio su una BASSA semplificata, qui non
c'è nessuna semplificazione — la mesh spedita *è* quella di dettaglio, 51.848
triangoli. Una normale cotta da sé stessa uscirebbe piatta, e `cottura.py` la
boccerebbe da sola col cancello dell'informazione.

### La strada scartata, misurata prima di scartarla

**Occlusione sui vertici** in `COLOR_0`: nessun atlante, nessuna texture,
nessuna cucitura. 25.108 vertici × 4 byte = 98 KB grezzi. Allettante.

Non funziona **su questa** geometria, e il perché è nei numeri:

| distanza | p10 | mediana | p90 |
|---|---|---|---|
| 0,10 m | 0,016 | 0,445 | 0,991 |
| 0,20 m | 0,000 | 0,402 | 0,965 |
| 0,35 m | 0,000 | 0,366 | 0,965 |
| 0,60 m | 0,000 | 0,342 | 0,947 |

Il decimo percentile è **zero a qualunque distanza**, e la distanza quasi non
sposta la mediana. Non è taratura: il modello è fatto di scatole che si
compenetrano — ordinate dentro il fasciame, supporti annegati nei pagliolati —
e i vertici di quelle compenetrazioni stanno *dentro* il solido, dove
l'occlusione vale zero. Su un atlante sono superficie nascosta; su un vertice il
nero viene interpolato sul triangolo visibile e macchia.

### Il costo vero non è la texture: sono le cuciture

| | vertici | ×  |
|---|---|---|
| senza UV | 25.108 | — |
| proiezione a cubo | 54.894 | 2,19 |
| unwrap angle-based | 59.185 | 2,36 |
| smart project 66° | 62.103 | 2,47 |

Il fattore non scende sotto 2,19 con nessun metodo: srotolare spacca ogni
vertice su un bordo d'isola, e su una geometria di scatole ogni spigolo lo è.
Da qui la discesa, tutta misurata:

| configurazione | brotli |
|---|---|
| senza occlusione | 136,3 KB |
| atlante 1024, smart, webp q70 | 308,3 KB |
| atlante 512, smart, webp q70 | 272,3 KB |
| atlante 512, **srotolando solo dove rende** | **189,6 KB** |

L'ultimo scalino viene da una regola misurata, non da una lista di nomi: si
srotola una mesh solo se la sua quota d'**area** vale almeno metà della sua
quota di **cuciture**. Il conto che la giustifica:

```
int_ordinate               21191 cuciture aggiunte    9,5% area   57,3% costo  → piatta
int_supporti                2598                      0,6%         7,0%        → piatta
int_pagliolato_allestimento  570                     31,3%         1,5%        → srotolata
int_pagliolato_sentina       177                     13,2%         0,5%        → srotolata
```

Le ordinate da sole costavano il **57,3% di tutte le cuciture per il 9,5% della
superficie**. Restano piatte, e ricevono una copia del materiale *senza* il nodo
dell'occlusione — altrimenti una mesh senza UV campionerebbe tutta la
superficie sul texel (0,0), cioè una tinta presa a caso.

Risultato: 89% dell'area srotolata pagando il 25% delle cuciture. Occlusione
misurata: mediana 0,953, media 0,825, il 25,9% dei texel sotto 0,75.

### E il tetto è stato alzato dicendolo col numero

`collaudo-glb` dichiarava 160 KB brotli, con la motivazione scritta: *«non
possono costare più delle due macchine messe insieme, che hanno un tetto di 250
KB; 160 è la misura di oggi più il margine per il corredo che ancora manca»*.
Il corredo è arrivato ed è questo. Il tetto passa a **200** — venti KB di
margine sul valore di oggi, come li aveva il precedente — e resta sotto i
**223,3 KB** che le due macchine pesano davvero, quindi il principio scritto
regge invariato.

### Tre trappole pagate, scritte perché non si ripaghino

1. **`bpy.ops.uv.pack_islands` in `blender -b` non fa niente e ritorna
   riuscito.** L'impacchettamento vive nell'editor UV, e in background quello
   non c'è. Le UV restano fuori dal quadrato unitario (misurato: `u 0,023..8,317`
   senza sincronia, `0,006..5,312` con), ogni cottura scrive fuori
   dall'immagine, e il PNG esce **nero**. Tre corse per accorgersene. Adesso
   l'atlante se lo costruisce lo script — una cella per mesh, area
   proporzionale alla superficie e proporzione uguale a quella dell'isola — ed
   è deterministico. Con celle quadrate la copertura era 29,9%; con la
   proporzione giusta, 52,9%.
2. **`bpy.ops.wm.read_factory_settings()` disregistra l'addon BlenderMCP.**
   Chiamato via MCP, uccide la connessione che lo ha invocato. Da lì in poi si
   lavora in `blender -b`, che è comunque la strada del repo.
3. **`alleggerisci-mappe.mjs` riscrive i byte in webp e lascia il `mimeType`.**
   Il validatore Khronos ha bocciato `interni.glb` con `IMAGE_MIME_TYPE_INVALID`
   e `IMAGE_NON_ENABLED_MIME_TYPE`: il file dichiarava `image/png` e conteneva
   webp, e webp in glTF vuole `EXT_texture_webp`. Sulle macchine non si vede
   perché `glb-macchine.py` esporta già in webp e lo strumento sostituisce webp
   con webp. **Il difetto è nello strumento condiviso e resta lì**: l'ho aggirato
   allineando l'esportazione degli interni (`export_image_format='WEBP'`)
   invece di toccare una catena che oggi funziona, ma chiunque userà quello
   strumento su un GLB con immagini PNG ripagherà lo stesso errore.
4. **Cycles non mostra l'occlusione.** `occlusionTexture` è un concetto da
   motore in tempo reale; Cycles calcola la GI vera e la ignora. I provini di
   `render-interni.py` escono identici a prima: la verifica va fatta nel sito,
   dove three.js la applica come `aoMap` sulla diffusa indiretta — e la scena ha
   sia una `HemisphereLight` sia un `environment` su cui agire.

### Quello che resta aperto

L'occlusione è cotta, agganciata, spedita dentro il budget e difesa da un
cancello. **Ma non ho una prova visiva che migliori le inquadrature del sito**,
e questo va detto per intero invece che lasciato intendere.

Ho catturato sei scorrimenti — 0,785 · 0,79 · 0,80 · 0,815 · 0,83 · 0,86 — che
è tutta la finestra in cui il repo stesso archivia «gli interni in scena». In
tutti e sei gli interni stanno **sotto la linea d'acqua, piccoli e in ombra
dietro lo scafo**: si distinguono il riduttore, l'albero e il gruppo pinna, e
la struttura che li contiene è una macchia scura. A quella scala un termine di
occlusione non si legge, e sarebbe disonesto sostenere il contrario.

Quindi la domanda vera non è «l'occlusione è giusta» — lo è, misurata — ma
**se questa sia la spesa giusta di 53 KB per il sito com'è oggi**. La risposta
dipende da una cosa che non decido io: se la sezione longitudinale completa che
la direzione chiede al punto 5 («persone sopra, propulsione a poppa,
stabilizzatori sotto la linea, gyro al centro, tutto nello stesso quadro») verrà
costruita, gli interni diventano il soggetto di un fotogramma eroico e
l'occlusione è esattamente ciò che li fa leggere come volume. Se invece restano
lo sfondo sommerso di adesso, quei 53 KB comprano poco.

La pipeline è pronta o in un caso o nell'altro, e si spegne togliendo un passo
da `rifai-interni.sh`.

Restano intatti gli altri capi del punto 4: raccordi scafo/coperta, curvature
dei finestrini, cornici con spessore, battagliola, scarichi, flange e bulloni
nei primi piani, gelcoat con clearcoat, vetro con volume, teak con fughe
fisiche. È modellazione e materiali in Blender, e la direzione ha ragione anche
sulla parte che non si vede: *nessun color grading finale può correggere due
illuminazioni progettate diversamente*.

## PUNTO 6 — Le cinque persone: non le ho

Il primo test di usabilità richiede cinque persone estranee al progetto con
`?studio=1`. Non è delegabile a un cancello, ed è il motivo per cui le sette
soglie di `src/ui/soglie.js` portano ancora il prefisso `IPOTESI_`. Questo giro
ne ha aggiunte due e ne ha chiusa una sostituendola con una misura:

| soglia | come si chiude |
|---|---|
| `IPOTESI_ANDATURA_PINNE_KN` | a che punto della planata dicono che le pinne non bastano più |
| `IPOTESI_RITARDO_UMANO_S` | tre ritardi a confronto: quale coppia reagisce al mare e non al bottone |
| `IPOTESI_ROLLIO_AVVERTITO_RMS` | mare alzato a scatti: a che RMS dicono che la nave si muove |
