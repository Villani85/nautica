# 20 — IL FINALE

**Questo documento e' stato SVUOTATO il 29 agosto 2026, e va detto perche'
invece di lasciarlo sparire.**

Descriveva per esteso — 615 righe — come collegare `src/scena/finale.js`: una
lastra col salone appesa alla camera nella fascia alta del fotogramma, con la
posizione e la scala dichiarate false e l'assetto e il contenuto tenuti veri.
Era onesto nel dichiarare cosa fingeva, ed era costruito bene.

**E' stato respinto lo stesso, ed e' la decisione giusta.** Una lastra e' una
fotografia che ricompare dentro l'inquadratura: e' esattamente il difetto che
il progetto si porta dietro dal salone («in un primo piano si legge schermo
dentro la nave, non stessa stanza»), messo nel punto in cui il sito rivendica
di piu' la propria continuita'. Un picture-in-picture mascherato contraddice la
scena unica, che e' la conquista piu' costosa di questo repo.

`src/scena/finale.js` e' stato **cancellato**, non archiviato. Non era
importato da nessuno, rappresentava un'architettura vietata, e teneva
diciannove kilobyte di codice morto che nessun cancello segnalava — chi fosse
arrivato dopo avrebbe potuto crederlo la strada. La sua storia sta per intero
in git: `git log --diff-filter=D -- src/scena/finale.js`.

---

## Il finale che si costruisce al suo posto

Deciso dal committente il 29 agosto. La specifica vive in
[`13-ATTO-DUE.md`](13-ATTO-DUE.md) §5, e questa e' la forma:

1. la camera **arretra fisicamente** dal meccanismo, dentro lo stesso scafo
   aperto;
2. compare una **sezione verticale completa**: il meccanismo sotto, il salone e
   le persone sopra, nello stesso taglio;
3. l'utente risolve il problema;
4. rollio, pinne, mare e persone reagiscono **contemporaneamente**;
5. la camera **risale attraverso lo stesso taglio** ed entra nel salone;
6. il sito finisce sulle stesse persone della prima immagine, ora rilassate.

**La sezione intera e' il climax razionale; le persone sono il climax emotivo.**

E i vincoli, che sono la parte che conta:

- **nessun salto di camera**, nessuna dissolvenza, nessun reset;
- **nessuna fotografia che compare dentro un riquadro**;
- se servira' un modulo separato potra' contenere **soltanto** la traiettoria
  continua della camera e la composizione finale — mai un renderer, una scena o
  una lastra alternativi;
- il cancello resta quello del §5 di `docs/13`: l'inclinazione del salone e
  l'angolo di rollio della corsa viva devono coincidere **entro 0,05 gradi su
  200 fotogrammi**. Se divergono, il finale e' un effetto e va rimosso.

## Cosa resta valido di quel lavoro, e va riletto prima di rifare i conti

Le misure che il documento cancellato portava restano vere, e rifarle sarebbe
tempo buttato. Stanno nella storia di `finale.js`, e le tre che contano:

- dal primo piano il salone **non e' in quadro** e nessun trascinamento ce lo
  porta: a raggio 2,6 il suo rilevamento e' 52,6 gradi a babordo e 48,5 in alto,
  contro un semicampo di 28,5 x 17,0 su 16:9 e **8,0 x 17,0 su un telefono**;
- **arretrare costa il meccanismo**: la stazione piu' vicina che li contiene
  entrambi in 16:9 sta a 5,85 unita' invece di 2,55, e il pezzo diventa 2,3
  volte piu' piccolo. Su telefono quella stazione **non esiste**;
- **il piano di taglio non puo' contenerli tutti e due**: e' trasversale,
  `Plane(0,0,-1,C)`, e il meccanismo si legge solo da `C = -0,65`, dove il
  salone (`z = +0,6`) sta gia' dentro la fetta tolta.

**Sono i tre vincoli che il finale nuovo deve battere, ed e' la ragione per cui
la sezione verticale non e' un ripiego ma l'unica strada:** se nessuna stazione
inquadra i due soggetti insieme e nessun piano trasversale li contiene, allora
il taglio va girato — e la sezione verticale e' esattamente quel giro.
