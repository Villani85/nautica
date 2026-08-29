# Esito della verifica — giro Drive del 29 agosto 2026, 14:10

Quinto giro consecutivo sullo stesso fotogramma, e il terzo di fila che **si
rifiuta di rifare il giudizio visivo** perche' il pixel non e' cambiato. La
disciplina di `CHIEDO.md` §2 e' entrata: cinque giri, cinque bersagli diversi,
zero ripetizioni.

Attacca la cosa piu' difficile da attaccare: non il valore della riduzione — che
e' riproducibile byte per byte — ma **cio' che lo produce**.

Contesto per chi legge dal futuro: il giro ha rivisto `main` a `8911bb8`. Il
lavoro dell'atto due sta su `atto-due-locale`, che quel giorno era ventidue
commit avanti. Le due voci sono state riverificate **sul branch** e valgono
identiche — ma il branch aggiunge una risposta al §SE HO RAGIONE della prima,
scritta in fondo.

---

## VOCE 1 — CONFERMATA. Lo stallo della pinna non arriva al punto di lavoro

**L'affermazione.** `simulazione.js:110` giustifica cosi' il fatto che la
portanza non sia un semplice `clamp`:

> *«Con un semplice clamp il sistema resta lineare, e allora la riduzione esce
> IDENTICA a ogni stato del mare — cinque numeri uguali, che a schermo leggono
> come un dato inventato anche essendo veri. Lo stallo e' cio' che rompe la
> linearita' e fa variare il risultato con le condizioni, come nella realta'.»*

Il revisore sostiene che a 12 nodi — l'andatura di servizio, quella che il sito
mostra — lo stallo **non ingaggia mai**, quindi quella giustificazione non
descrive il codice dove il codice viene guardato.

**Riprodotto qui, sul branch, con il modulo spedito:**

```
picco della pinna a 12 nodi, misurato su 300 s per stato del mare
  mare 1    3,6 gradi     in stallo 0,00%     (soglia A_STALLO = 20)
  mare 3   10,9 gradi     in stallo 0,00%
  mare 5   17,7 gradi     in stallo 0,00%
```

Al mare piu' grosso che il sito mostra la pinna arriva a **2,3 gradi sotto la
soglia di stallo** e 7,3 sotto il fine corsa. La nonlinearita' e' tarata per
stare *appena fuori portata*.

**Quindi la riduzione che il visitatore legge e' il numero che darebbe un
modello puramente lineare**, e il pregio dichiarato — «varia con le condizioni
come nella realta'» — non contribuisce di un decimale dove viene mostrato.

Non e' un numero sbagliato. E' un numero il cui **merito dichiarato non e'
verificabile nel punto in cui si legge**, ed e' esattamente la forma d'errore
che `CHIEDO.md` §3.1 chiede di cercare: *un parametro che e' scritto e non
arriva dove serve*.

**Il commento va corretto**, ed e' costo zero sul sito: lo stallo lavora, ma
solo sotto i 10 nodi. Scriverlo evita che qualcuno creda che la piattezza della
riduzione sia vietata dal modello, quando e' il suo comportamento normale.

## VOCE 2 — CONFERMATA sulla tabella spedita

La resa non dipende dallo stato del mare a velocita' di servizio. Letta
verticalmente la colonna dei 12 nodi in `riduzioni.json`:

```
mare 1..5    90,769   90,791   90,794   90,792   90,780
spread       0,025 punti     (a 20 nodi: 0,006)
```

Mare 1 (3 gradi di rollio nudo) e mare 5 (15 gradi, cinque volte tanto) rendono
lo stesso 90,8%. Per costruzione: un modello lineare da' riduzione indipendente
dall'ampiezza, e la saturazione che la romperebbe non ingaggia (VOCE 1).

**Il rilievo di dominio.** Uno stabilizzatore a pinne reale ha portanza finita:
in mare grosso il momento richiesto cresce, la pinna satura, e la resa **cala**
con lo stato del mare. E' il motivo per cui i costruttori pubblicano curve per
stato di mare e non un numero solo.

**Il revisore dichiara da solo il limite della sua stessa voce**, e va scritto:
la direzione (la resa cala) e' dominio consolidato, il **quanto** non l'ha
misurato su dati reali. E' un'affermazione di verso, non di magnitudine. Non
cambio niente su una magnitudine che nessuno ha.

## Cosa NON e' vero sul branch, e cambia la conseguenza in pagina

La VOCE 1(b) dice: *«il mare e' una leva che muove la scena ma non il dato»*, e
che una percentuale ferma sotto un gesto legge come **hardcoded** — l'opposto di
«measured, not declared». Su `main` e' esatto.

Sul branch **c'e' gia' una leva che muove quel numero, ed e' enorme**: la
propulsione. La riduzione dipende dalla velocita', e la velocita' e' diventata
una conseguenza:

```
riduzione a mare 5, lungo la velocita'
  12 kn  90,8%      10 kn  38,9%      8 kn  17,2%
   6 kn   8,2%       4 kn   3,2%      2 kn   0,7%
```

Spegnendo la propulsione la nave scende a 2,19 kn in quaranta secondi e **la
percentuale crolla da 90,8 a sotto l'uno**. Il numero non e' fermo: risponde al
gesto piu' importante dell'atto due.

E a bassa andatura torna vero anche il resto: a 6 nodi lo spread fra gli stati
del mare e' **59,96 punti**, non 0,025 — perche' li' la pinna satura davvero e
la nonlinearita' lavora. Cioe' **lo stallo non e' codice morto: e' codice che si
accende dove il sito adesso porta chi guarda.**

Questo non salva il commento — a 12 nodi resta falso — ma sposta la conclusione:
il modello non e' «lineare e basta», e' lineare *nel punto di partenza* e
nonlineare *nel punto di arrivo* della scoperta.

## Cosa ho fatto e cosa no

- **corretto** il commento su `portanza`, con i numeri misurati;
- **non toccato** il modello: introdurre una degradazione della resa con lo
  stato del mare e' una decisione sul realismo di cio' che il sito pubblica, e
  la magnitudine non ce l'ha nessuno. Numero sul tavolo;
- **non toccata** la pagina: mettere il rollio nudo accanto alla riduzione, come
  suggerisce la VOCE 1(b), e' messa in scena.

## Cosa non ho verificato

- **le curve di resa reali dei costruttori** — il revisore stesso dice di non
  averle, e io nemmeno;
- **la saturazione con seme casuale in pagina**: ho misurato su semi
  deterministici, come lui. Il picco piu' alto visto e' 17,7 gradi; in pagina le
  fasi sono casuali e potrebbe occasionalmente sfiorare i 20 a mare 5. La
  conclusione regge sul valor medio, che e' quello che la riduzione usa;
- **la sua reimplementazione** di `_riduzioneCruda`: non l'ho rieseguita. Ho
  verificato direttamente sul modulo spedito, che e' un percorso indipendente e
  arriva allo stesso posto.
