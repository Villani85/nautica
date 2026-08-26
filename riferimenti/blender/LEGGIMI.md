# Il metallo che sembra lavorato — ricetta misurata

`provino-metallo.py` si esegue così, e ci mette 35 secondi a fotogramma su
760×470 con 130 campioni:

    "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P provino-metallo.py -- <cartella>

## La scoperta, che vale più della ricetta

**Un rumore isotropo su un metallo si legge sempre come sporco.** Lo stesso
rumore, con la stessa intensità, **stirato nel verso della lavorazione** si
legge come superficie lavorata a macchina.

Non è una questione di *quanto*: è di *che forma*. Confronta le due immagini —
`metallo-sbagliato.jpg` e `metallo-buono.jpg`: nella prima il pezzo sembra
corroso, nella seconda tornito. La differenza fra le due è una riga, il nodo
`Mapping` con scala `(0.06, 9, 9)` prima del rumore.

## Quattro provini, e cosa ha insegnato ognuno

| provino | cosa aggiungeva | esito |
|---|---|---|
| 1 | Principled liscio, luce da studio | **CAD pulito**: superfici perfette, bronzo che sembra plastica |
| 2 | rugosità variabile 0,24 + rilievo 0,06 | **metallo corroso**: sembrava muffa |
| 3 | tre intensità a confronto, isotrope | meno è meglio, ma anche la più lieve legge come sporco |
| 4 | la stessa variazione, **nel verso della lavorazione** | **acciaio tornito** |

## I numeri che funzionano

- rugosità base **0,20** acciaio · **0,30** bronzo;
- escursione della rugosità **0,04** — un pezzo tornito varia di poco;
- rilievo dei graffi **0,006**, con rumore a scala 900 stirato ×60;
- **anisotropia 0,70**: è quella che allunga i riflessi, e da sola fa metà del
  lavoro. Senza, nessuna quantità di graffi salva la superficie;
- luce: **softbox rettangolari**, non un mondo uniforme. È il riflesso con un
  BORDO a leggersi come metallo — un grigio uniforme dà una tinta;
- `AgX` come trasformazione di vista, e profondità di campo a f/3,5.

## Quello che non basta

Smussi e rugosità **non** bastano da soli: il provino 1 li aveva e sembrava CAD.
Servono insieme riflessi con una forma, anisotropia e variazione direzionale.


---

## Il sistema vero — `sistema.py`

`cuoci.py` importa la geometria del sito e la rende. Alla misura di una
fotografia si legge come **pezzi sparsi**, e la causa non è la resa: quella
geometria è uno **schema**, distanziato apposta perché in sezione si capisca chi
fa cosa. Un attuatore vero è un blocco compatto, imbullonato, con tubazioni e
cavi.

`sistema.py` costruisce la macchina vera **attorno alle quote vincolate**.

### La regola che tiene onesto il sito

**Le quote da cui dipende la fisica non si toccano**: raggio e lunghezza
dell'albero, apertura e corda della pinna, braccio della leva, posizione della
flangia e del premistoppa, punto di attacco sul ginocchio di carena. Sono quelle
che `simulazione.js` usa per calcolare la riduzione. Se si cambiano per far
sembrare il pezzo più bello, **il numero che il sito dichiara smette di riferirsi
a ciò che mostra** — ed è la bugia peggiore possibile in un progetto la cui tesi
è l'onestà tecnica.

Nel file sono marcate `VINCOLATA`, una per una.

### Cosa si aggiunge, e perché ognuna

| pezzo | perché |
|---|---|
| **fasciame al minio** | un attuatore senza la lamiera a cui è imbullonato non è installato, è esposto. Dice *dove siamo* |
| **doppiatore** attorno al foro | la lamiera si ispessisce dove è forata, altrimenti si strappa |
| **madieri e pagliolo** | senza un piano d'appoggio si è in un vuoto, non in un locale macchine |
| **corpo fuso in un pezzo** | nello schema erano motore, riduttore e culla separati. È questo a cambiare tutto |
| **nervature** | un getto le ha sempre, ed è ciò che si legge come «pezzo pesante» |
| **coperchio d'ispezione** | dice che il pezzo si apre, cioè che qualcuno ci mette le mani |
| **tubazioni e cavi** | nessuna macchina a bordo è senza qualcosa che la raggiunge |

### La luce

Dentro una carena non entra la luce di un capannone. L'HDRI resta, **smorzato a
0,30**: serve per i **riflessi**, non per illuminare. L'illuminazione la danno
una plafoniera fredda in alto e un rimbalzo caldo dal basso.

E la vernice vuole il rumore **isotropo**, al contrario del metallo: la vernice
è colata, non tornita, quindi non ha un verso.
