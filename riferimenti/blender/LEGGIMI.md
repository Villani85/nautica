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
