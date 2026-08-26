# I due filmati del salone — cosa chiedere, e perche'

Il capitolo del salone e' **ibrido**: il filmato da' la vita (respiro, capelli,
il vino nel bicchiere, il gesto di puntellarsi), la simulazione da'
l'inclinazione. Sono due mestieri separati e **non devono sovrapporsi**.

## La regola che decide tutto

> **Il filmato non deve inclinare niente.** Camera bloccata, stanza diritta,
> orizzonte orizzontale e alla stessa altezza dal primo all'ultimo fotogramma.

Non e' una preferenza estetica. Il sito ruota la stanza dell'angolo che
l'integratore calcola in quell'istante, e tiene fermo l'orizzonte: **la stanza
si inclina contro un orizzonte che non si inclina con lei**, ed e' l'unico
argomento che questo capitolo porta. Se il filmato sbanda gia' per conto suo:

1. i due sbandamenti si sommano a caso, e l'angolo a schermo non e' piu' quello
   che la didascalia dichiara — cioe' il sito mente nel punto in cui rivendica
   di misurare;
2. l'orizzonte dentro i vetri si inclina **insieme** alla stanza, che e'
   esattamente cio' che succede quando lo stabilizzatore NON c'e'.

## Cosa e' stato misurato sul primo tentativo, e come mi ero sbagliato io

`Motor_yacht_saloon_heels_over_202608261131.mp4` — 1280x720, 8 s, 24 fps.

**Prima avevo scritto che il filmato inclinava l'orizzonte di 2,43°. Non e'
vero, ed era il mio metro a essere rotto.** Cercavo il salto di luminosita' piu'
forte dentro la fascia dei vetri e ci adattavo una retta; nel primo secondo il
mare e' annegato nella foschia, quindi il salto piu' forte non e' l'orizzonte,
**e' il davanzale**. La retta usciva inclinata e il numero descriveva un pezzo
di arredamento. Guardando i fotogrammi a piena risoluzione i montanti sono
verticali in tutti e tre i campioni: la stanza non ruota.

*Un metro che non dice quando non ha capito niente e' peggio di nessun metro.*
La versione corretta stampa anche R², e sotto 0,9 il numero non si guarda.

| cosa | com'e' | verdetto |
|---|---|---|
| proporzione | 1280x720, identica alla fotografia | **giusto** |
| set, persone, vestiti | gli stessi della sagoma | **giusto** |
| la stanza sbanda? | **no**, resta diritta dal primo all'ultimo fotogramma | **giusto**, ed e' quello che serve |
| l'orizzonte si inclina? | no | **giusto** |
| il gesto | la donna si sporge e appoggia la mano al secondo 3,1, poi si rilassa | **giusto**, ed e' la cosa che vale il rifacimento |
| la camera | **carrellata lenta in avanti**: fra il primo e l'ultimo fotogramma la stanza cresce nell'inquadratura | **da rifare** |

Il rollio chiesto dal prompt il modello non l'ha fatto, e per noi e' una
fortuna: l'inclinazione la deve dare la simulazione. Quello che ha fatto invece
e' il movimento di camera che il prompt negativo vietava.

**La carrellata non si toglie dopo.** `vidstab` corregge traslazione e
rotazione, non la scala: provato, il filmato esce identico. E la carrellata e'
fatale per il composito, perche' la maschera dei finestrini e' fissa: se i vetri
si ingrandiscono escono da sotto i loro buchi e il mare compare sul divano.

**La correzione al prompt**: togliere del tutto la richiesta di rollio — e' lei
a suggerire al modello che deve succedere qualcosa di drammatico, e il modello
lo traduce in movimento di camera — e chiedere la staticita' come **genere**,
non come divieto. Un modello ignora «no zoom» molto piu' facilmente di quanto
ignori «fixed security camera».

## Prompt 1 — la posa calma (ciclo)

```
Fixed security-camera footage from a camera bolted to the bulkhead. The frame
never changes. The interior of a motor yacht
saloon, seen square-on: two cream L-shaped sofas facing each other across a low
wooden table with two glasses of white wine, a horizontal band of windows behind
them showing open sea and a level horizon.

A woman in a white shirt sits on the left sofa, relaxed, one arm along the
backrest. A man in a dark navy sweater sits on the right, also relaxed, arm
along the backrest. They are talking calmly.

Nothing tilts. The camera does not move, does not pan, does not roll, does not
zoom. The room stays perfectly upright and the horizon line stays perfectly
horizontal at a constant height for the whole shot. The only movement is human:
breathing, small shifts of weight, hair, a hand gesture while talking, and the
sea moving slowly beyond the glass.

Photorealistic, natural overcast daylight, shallow contrast. The camera is
bolted down: no dolly, no push-in, no zoom, no crane, no handheld, no shake, no
rack focus, no reframing. Nothing in the room moves except the two people.
```

## Prompt 2 — la posa puntellata (ciclo)

```
Fixed security-camera footage from a camera bolted to the bulkhead. The frame
never changes. Same motor yacht saloon, same framing, same two people, same wine
glasses on the same low table.

The woman in the white shirt is now leaning forward with her palm flat on the
table, bracing herself. The man in the navy sweater has gripped the edge of the
backrest with one hand and planted his other hand on the seat beside him. Both
are steadying themselves and have stopped talking.

Nothing tilts. The camera does not move, does not pan, does not roll, does not
zoom. The room stays perfectly upright and the horizon line stays perfectly
horizontal at a constant height for the whole shot. They hold the braced
posture; the only movement is small — muscle tension, breathing, hair, the wine
trembling in the glasses, and the sea beyond the glass.

Photorealistic, natural overcast daylight, shallow contrast. The camera is
bolted down: no dolly, no push-in, no zoom, no crane, no handheld, no shake, no
rack focus, no reframing. Nothing in the room moves except the two people.
```

## Cosa NON mettere nel prompt

- **`heels over`, `rolls`, `tilts`, `lists`, `pitching`, `stabilisers cut out`**.
  Non servono — l'inclinazione la mette il sito — e sono proprio loro a dire al
  modello che deve succedere qualcosa di drammatico. Il modello non sa inclinare
  una stanza tenendo fermo l'orizzonte, quindi traduce il dramma nell'unico modo
  che conosce: **muovendo la camera**. E' cosi' che e' nata la carrellata.
- **il mare grosso**, che tanto non si vede: il sito buca i finestrini con una
  maschera e ci mette dietro il proprio filmato del mare, cosi' l'orizzonte
  resta fermo mentre la stanza gira.

## Come si verificano prima di metterli sul sito

    node strumenti/collaudo-filmato.mjs <file.mp4>

Misura l'inclinazione e l'altezza dell'orizzonte fotogramma per fotogramma ed
esce con errore se sfondano. Poi:

    node strumenti/chiudi-ciclo.mjs <file.mp4> <ciclo.mp4> 1.0

chiude il filmato in ciclo dissolvendo la coda sulla testa, e stampa lo stacco
misurato fra primo e ultimo fotogramma.
