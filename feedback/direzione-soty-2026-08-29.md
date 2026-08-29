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

## PUNTO 1 — La falsa continuità: NON toccata, e perché

**L'affermazione è confermata e resta la più importante.** `traversata.mp4` è
montato su un piano figlio della camera con `renderOrder = 999`, `depthTest =
false`, copertura completa e opacità fino a 1. Tecnicamente è lo stesso canvas;
percettivamente sostituisce il mondo.

**Non è stata toccata perché il punto 1 non è un lavoro di codice.** Chiede un
interno continuo modellato in Blender (sala macchine, scala, corridoio, salone,
porte e paratie) allineato allo scafo, illuminazione cotta, fotografia
proiettata sulla shell, la coppia scontornata su un piano interno e mobili 3D in
primo piano davanti alle persone. Il cancello di uscita che la direzione stessa
scrive include *«cinque persone su cinque non segnalano spontaneamente qui
cambia scena»*.

Una mezza misura — spostare il piano nello spazio dello yacht senza la shell
dietro — produrrebbe un video che galleggia dentro una nave vuota: peggio di
adesso, e con la stessa bugia.

**E il numero esiste già.** `collaudo-continuita` lo stampa a ogni corsa:

```
LASTRA      copertura massima 1.00 — 3 campioni su 45 giudicano una texture, non la scena
```

Lo misura e non ci boccia sopra. Il tetto che la direzione chiede — *nessun
piano figlio della camera copra più del 10% del fotogramma* — si scrive in una
riga di quel file. Metterla oggi renderebbe la CI rossa senza avvicinare di un
metro la soluzione, e un cancello che si tiene disattivato non è un cancello:
va acceso **insieme** alla shell, nello stesso commit che la rende vera.

**Cosa c'è già, per chi lo farà:** `public/modelli/interni.glb` esiste ed è
valido (0 errori dal validatore glTF, sia sul disco sia decompresso),
`src/scena/salone3d.js` sa già montare un video come tessitura su geometria
nello spazio della scena, e `riferimenti/blender/glb-interni.py` è la sorgente.
Il pezzo che manca non è l'impalcatura: è la **materia**.

## PUNTO 4 — La qualità visiva dello yacht: NON toccata

Stessa ragione, senza attenuanti: raccordi scafo/coperta, curvature dei
finestrini, cornici con spessore, battagliola, scarichi, flange e bulloni nei
primi piani, gelcoat con clearcoat, vetro con volume, teak con fughe fisiche.
È lavoro di modellazione e di materiali in Blender, e la direzione ha ragione
anche sulla parte che non si vede: *nessun color grading finale può correggere
due illuminazioni progettate diversamente*.

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
