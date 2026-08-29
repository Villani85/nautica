# 13 — L'atto due: sotto la linea

Specifica di costruzione per la seconda metà del percorso.

*Numerazione: `docs/` arrivava a `11`, il piano di lavoro prende `12`. Questo
prende `13` per non collidere — è già successo una volta con `D30–D34`.*

**Stato: in costruzione.** L'avanzamento sta in `12-PIANO-E-AVANZAMENTO.md`.

---

## 1. Perché esiste

Il progetto ha oggi un atto primo forte e cinque sezioni che si leggono. Va bene
per un Site of the Day. Non va bene per il premio annuale, e la ragione non è la
qualità: è la **categoria**.

I vincitori SOTY autoprodotti hanno una cosa in comune, e non è la rifinitura:
**ci si sta dentro dieci minuti.** Bruno Simon è una macchina che si guida.
Messenger è un pianeta con personaggi e multiplayer. Lusion e Active Theory sono
mondi. Nessuno di loro *spiega* qualcosa.

Il SOTY lo decide la community, non la giuria: Messenger ha preso **7,92 dalla
giuria e 9,56 dagli utenti**. Un punto e mezzo. E la community quel voto lo dà a
ciò con cui gioca.

L'atto due è l'unica parte del progetto che cambia gara invece di alzare il
voto. E ha una proprietà che vale più della fatica:

> **Non aggiunge contenuto. Collega quello che c'è.**

La velocità è già calcolata, le due navi sono già simulate, il salone è già
scritto, lo scafo è sezionabile a qualunque quota. L'atto due è soprattutto
cablaggio di cose che esistono e non si parlano.

---

## 2. Il passaggio di consegne

Il momento che decide se la gente resta.

Per sei battute la pagina scorre, e chi guarda impara che **il sito si guarda**.
Arrivato sotto la linea, scorre ancora e **non succede niente**. Un istante di
attrito voluto — mezzo secondo, non tre — poi capisce che ha in mano il taglio.

Non è un espediente: è la pagina che consegna il controllo. Ed è anche il punto
in cui il contratto *«lo scorrimento è il padrone unico»* (D29) decade
**legittimamente**, perché siamo in un altro atto. Va scritto come decisione,
non subìto come deriva: il padrone cambia una volta sola, in un punto
dichiarato, e non torna indietro.

**Il segno** che il controllo è passato non è un cartello. È la lama che smette
di essere una conseguenza dello scorrimento e comincia a rispondere alla mano —
e il primo movimento la fa il sito, di pochi centimetri, per mostrare cosa fa.

### Il cancello sbagliato, e perché resta scritto invece di sparire

La prima stesura diceva: *«dal primo gesto, movimento della lama entro 100 ms»*.
È inutile. Misura la **latenza di input**, che è un `requestAnimationFrame` e
sarà verde per sempre. **Un cancello che non può fallire non è un cancello.**

Quello che può rompersi è **l'attrito**: se lo scorrimento resta morto troppo a
lungo, la gente chiude la scheda. Va misurata **la durata del vuoto**, non la
prontezza della lama.

E non è una soglia da scegliere a tavolino: **è una cosa da guardare addosso a
qualcuno che non conosce il sito.** Quanto ci mette a capire che ha in mano il
taglio, e quanti si arrendono prima. Il numero si scrive qui dopo averlo visto
succedere a una persona vera.

---

## 3. Lo spazio: due assi, non un corridoio

Un corridoio è un tour. Serve uno spazio.

**Asse longitudinale** — la lama va a proravia e a poppavia lungo i 40 m.
**Asse verticale** — la quota: allestimento, locale macchine, sentina.

Quattro stazioni in lunghezza per tre livelli fa dodici celle, di cui sette o
otto hanno qualcosa. **Si esplora una griglia, non si percorre una linea.**

### Niente punti caldi

Ogni sito industriale in WebGL ha i punti caldi da cliccare, ed è la morte: dice
al visitatore che il mondo è finto e che le cose interessanti sono state
marcate. Qui le cose **stanno lì**. Si trovano muovendo il taglio, e
l'annotazione compare **perché ci si è fermati**, non perché si è cliccato.

**Soglia — ed e' un'IPOTESI, non un requisito.** Deciso il 29 agosto: i
valori provvisori sono ammessi, spacciarli per dimostrati no. Le tre specie
sono ora distinte e il nome le dichiara: `IPOTESI_*` in `src/ui/soglie.js` per
i valori provvisori, `SOGLIA_*` per quelli validati su persone, e **un cancello
automatico puo' nascere solo dalla seconda specie** -- un cancello costruito su
un'ipotesi certificherebbe la mia congettura invece del sito. Nessun test deve
sostenere che 400 ms siano corretti, e `?studio=1` (`src/ui/studio.js`) misura
cio' che serve a sostituirli: tempo al primo gesto efficace, tentativi a vuoto,
permanenza per macchina, annotazioni aperte e abbandonate subito, ritorno o
mancato ritorno al salone. Si chiude dopo cinque persone che non conoscono il
sito.

**E nessun ritardo artificiale prima che la lama risponda: la lama risponde
subito.** L'attrito del passaggio di consegne e' una cosa che si guarda addosso
a qualcuno; la prontezza della mano si da' e basta.

L'annotazione appare dopo 400 ms di quiete della lama entro il
raggio del sistema, e scompare al primo movimento. Va tarata guardando.

### La camera si libera, e la regola lo prevedeva già

D28 dice che la camera è vincolata **finché la giunzione è visibile**. Sotto la
linea lo sfondo si chiude sull'acqua profonda: non c'è più giunzione da
proteggere. Il vincolo era una fase, non una prigione.

**Ma si rilegga D56 prima di liberarla.** L'invariante vero è **beccheggio
zero**, non quota zero — e la libertà utile è meno di quella disponibile. La
geometria sopravvive a qualunque quota: misurato, a 1,28 unità di altezza
l'orizzonte cade a 0,019 px dal centro su una tela alta 900. La **lettura tonale
no**: alzando la camera si guarda dall'alto una superficie illuminata, la metà
bassa smette di essere acqua profonda, e lo spacco muore lo stesso — per una
ragione completamente diversa. Sotto la linea questo pesa meno, ma non zero.

---

## 4. I tre sistemi, e perché non quattro

Propulsione · stabilizzatori · giroscopio.

Non venti. Tre, scelti perché **si tengono per mano**. Sistemi scollegati sono
un catalogo; tre conseguenze concatenate sono un modello mentale che ci si
porta a casa. La timoneria resta fuori dal primo atto due: non chiude questa
catena e aggiungerla adesso significherebbe aggiungere un'altra demo.

### La catena causale

```
   PROPULSIONE  ──spenta──►  la nave perde abbrivio
                                      │
                                      ▼
                              la velocita' cala
                                      │
                       C(V) = C0·(V/V_rif)²  ──►  l'autorita' delle pinne
                                      │            cala col QUADRATO
                                      ▼
                        gli STABILIZZATORI muoiono da soli
                                      │
                                      ▼
                              il rollio torna
                                      │
                                      ▼
                   il GIROSCOPIO e' il controesempio:
                   funziona a nave ferma, dove le pinne non possono
```

Nessuno glielo ha detto. L'ha scoperto.

E il giroscopio chiude il ragionamento invece di aggiungere un pezzo: **è il
motivo per cui esistono entrambi**, e nessun sito lo ha mai fatto capire
facendolo provare.

### La velocità è diventata una conseguenza

Il cursore pubblico da 0 a 20 nodi è stato rimosso. Il comando ora è
`#propulsione`; la velocità resta una lettura. `dinamicaPropulsione()` porta i
giri verso il comando con inerzia e integra spinta e resistenza quadratiche.
La scia riceve la stessa `S.velocita`, mentre `autorita()` continua a ricavare
da quella grandezza — e soltanto da quella — l'autorità delle pinne.

Il banco numerico può ancora costruire una simulazione a velocità imposta: è
una modalità di misura, non una superficie data al visitatore.

**Cancello, ed è il più importante del documento:** con la propulsione spenta,
la velocità deve scendere secondo una decelerazione dichiarata, e la riduzione
del rollio deve seguire `C(V)` **senza nessuna riga di codice che la forzi**. Se
qualcuno scrive *«quando la propulsione è spenta, poni riduzione = 0»*, la
catena è finta e va rimossa. Sarebbe la bugia peggiore possibile in questo sito.

---

## 5. Il finale

L'atto due deve **finire**, o è una sabbia aperta da cui si esce chiudendo la
scheda. E il finale è già scritto nel sito, semplicemente non è collegato.

Il sito si apre con due persone comode mentre fuori c'è mare forza cinque.

L'atto due finisce quando si arriva allo stabilizzatore, con la lama ferma sul
meccanismo — **e lo si spegne.**

E sopra, il salone si inclina.

Non è un'animazione: è **la stessa simulazione**. Le due persone viste tranquille
nella prima schermata adesso non lo sono, e la causa è chi guarda. Il cerchio si
chiude, ed è l'unica cosa che questo progetto può fare e nessun altro — perché
sopra e sotto la linea sono **lo stesso integratore**.

Lì si rimette l'interruttore, la nave si calma, e il sito lascia andare.

**Cancello:** l'inclinazione del salone e l'angolo di rollio della corsa viva
devono coincidere entro 0,05° su 200 fotogrammi. Se divergono, il finale è un
effetto e va rimosso: sarebbe la bugia peggiore del sito, proprio nel punto in
cui rivendica di non mentire.

### DUE DECISIONI SI CONTRADDICONO, e non la chiudo io — 29 agosto

Il cancello qui sopra e' stato scritto per un finale **in 3D**: il salone
sopra, lo scafo sotto, lo stesso integratore che li inclina tutti e due. Con
quel finale il cancello e' esatto e necessario.

Ma il finale deciso il 29 agosto **e' un filmato** -- la traversata dal
meccanismo alle persone, girata, fotorealistica, montata come tessitura nella
scena. **Un filmato non risponde al rollio.** Quindi, per come stanno le cose
adesso:

- l'inclinazione del salone nel finale **non** viene dalla corsa viva: viene
  dalla camera di chi ha girato la clip;
- il cancello del §5 non puo' passare, e non perche' ci sia un difetto: perche'
  misura una cosa che il finale nuovo non fa piu';
- e la frase «le due persone viste tranquille nella prima schermata adesso non
  lo sono, **e la causa e' chi guarda**» -- che e' l'argomento piu' forte di
  tutto il documento -- con un filmato **non e' piu' vera**.

Le tre strade, e la scelta e' del committente:

1. **il finale resta un filmato**, e il cancello del §5 si cancella insieme alla
   frase che proteggeva. Si guadagna il fotorealismo, si perde la causalita'
   proprio nel punto in cui il sito la rivendica di piu';
2. **il finale torna in 3D**, e allora serve il guscio del salone con parallasse
   e occlusioni vere (§10) -- che e' la condizione perche' non sia una
   fotografia in un riquadro, ed e' settimane;
3. **i due si dividono il lavoro**: il filmato fa la TRAVERSATA (corridoi,
   scale, spazi tecnici: li' non c'e' niente da inclinare), e l'ultimo tratto --
   il salone con le persone -- torna in 3D, dove il rollio e' vero. La cucitura
   si sposta dall'inizio del filmato alla sua fine, ed e' misurabile con lo
   stesso strumento (`consegna.mjs`, che ora sa confrontare tutti e due i
   versi).

**La terza e' l'unica che tiene insieme fotorealismo e causalita'**, ed e' anche
la piu' cara. Non la prendo da solo: e' messa in scena, e la messa in scena la
decide il committente. Scritta qui come numero sul tavolo, non come proposta
approvata.


### La domanda che questo paragrafo lascia aperta

**Come si vede il salone mentre si è sotto la linea?**

La lama è ferma sul meccanismo, la camera è dentro la carena. «Sopra di te il
salone si inclina» richiede un'inquadratura che il paragrafo non nomina, e non è
un dettaglio: è ciò che decide se il finale funziona o è una didascalia.

Tre strade, e va scelta **guardando**, non ragionando:

1. **La camera si stacca e mostra la sezione intera** — sotto le macchine, sopra
   la stanza con le due persone, un taglio solo, e l'inclinazione che attraversa
   entrambi. È la tesi del sito resa letterale in un fotogramma:
   *sopra la gente sta comoda; sotto, venti macchine lavorano perché ci stia.*
   È la strada che sospettiamo giusta, ed è la più costosa.
2. **La camera alza lo sguardo** attraverso il taglio, e il salone si vede in
   scorcio da sotto. Più economica, più fedele al punto di vista, e rischia di
   essere illeggibile.
3. **Il salone appare in un'apertura** nella parte alta dell'inquadratura, con
   la composizione del riferimento. Sicura, e la meno legata al gesto.

### CHIUSA — 29 agosto. La prima strada, ma non come fotogramma

Il committente ha scelto, e ha corretto la domanda: **la sezione intera non e'
l'ultima immagine, e' il climax razionale**. Il finale emotivo viene dopo, ed e'
il ritorno alle persone.

La sequenza, in sei passi:

1. la camera **arretra fisicamente** dal meccanismo, dentro lo stesso scafo
   aperto;
2. compare la **sezione verticale completa**: il meccanismo sotto, il salone e
   le persone sopra, un taglio solo;
3. l'utente risolve il problema;
4. rollio, pinne, mare e persone reagiscono **contemporaneamente**;
5. la camera **risale attraverso lo stesso taglio** ed entra nel salone;
6. il sito finisce sulle stesse persone della prima immagine, **ora rilassate**.

**Le altre due strade sono scartate, con la ragione.** Guardare in alto dal
meccanismo rende il salone troppo piccolo e prospetticamente difficile.
Il salone dentro un'apertura e' un picture-in-picture mascherato: contraddice
la scena continua, che e' la conquista piu' costosa di questo repo. E in nessuna
delle due deve esserci un salto di camera o una fotografia che compare dentro un
riquadro.

**E il vecchio `finale.js` e' stato cancellato**, non collegato: implementava
esattamente la soluzione respinta. Diciannove kilobyte non importati da nessuno,
un'architettura vietata, e una trappola per chi fosse arrivato dopo. La storia
resta in git; il perche' sta in `docs/20-FINALE.md`, che ora e' la lapide di
quella strada e porta le tre misure geometriche che il finale nuovo deve
battere.

Se servira' un modulo separato potra' contenere **soltanto** la traiettoria
continua della camera e la composizione finale. Mai un renderer, una scena o
una lastra alternativi.

---

## 6. Cosa esiste già

Più di quanto sembri. È il motivo per cui l'atto due è cablaggio.

| pezzo | dove | stato |
|---|---|---|
| scafo lofted, sezionabile a qualunque quota | `src/scafo/ordinate.js` | fatto, collaudato |
| piani di taglio e tappi ad anello | `src/scena/nave.js` | fatto |
| simulazione con velocità e stallo | `src/scena/simulazione.js` | fatto, collaudato |
| `C(V) = C0·(V/V_rif)²` — `autorita()` | `simulazione.js` | fatto |
| due corse parallele, viva e nuda | `simulazione.js`, `creaSimulazione` | fatto |
| tabella riduzioni precalcolata | `src/scena/riduzioni.json` | fatto |
| comando propulsione e andatura dinamica | `#propulsione`, `dinamicaPropulsione()` | fatto, collaudato |
| cancello della catena causale | `strumenti/collaudo-catena.mjs` | fatto |
| meccanismo stabilizzatori | `nave.js` | fatto |
| allestimento e fuoribordo | `costruisciAllestimento`, `costruisciFuoribordo` | scritti, invisibili |
| contratto dei sistemi | `docs/08` §5 | specificato |

> **Qui non ci sono numeri di riga, ed è deliberato.** La prima stesura di
> questa tabella diceva `simulazione.js:76` per `autorita()` e `:143` per le due
> corse. Una riscrittura della riduzione — dal picco alla RMS — le ha spostate a
> `100` e `193` **nel giro di poche ore**, e chiunque si fosse fidato di quei
> numeri sarebbe finito nel posto sbagliato. Si cerca per nome con `grep`: i
> nomi sopravvivono alle riscritture, i numeri di riga no.

## 7. Cosa manca

1. **La lama come strumento** — oggi è conseguenza dello scorrimento.
2. **La navigazione a due assi** e il passaggio di consegne.
3. **La camera libera sotto la linea**, entro il vincolo di beccheggio.
4. **La macchina visibile della propulsione e il giroscopio.** Il comando e la
   dinamica propulsiva esistono; albero, riduttore ed elica non hanno ancora
   una rappresentazione Blender collegata a `giriPropulsione`.
5. **Completare la catena del §4** — propulsione → velocità → pinne → rollio è
   costruita e collaudata; manca il controesempio del giroscopio.
6. **Le annotazioni** che compaiono per quiete, non per clic.
7. **Il finale** — collegare l'inclinazione del salone alla corsa viva, e
   risolvere l'inquadratura lasciata aperta al §5.
8. **L'equivalente su telefono**, che è il pezzo duro.

---

## 8. Il telefono, detto prima che lo dica qualcun altro

**La parte difficile non è il 3D. È il touch.**

Un'esplorazione a camera libera su schermo tattile è un problema di progetto a
sé: due assi da governare, nessun puntatore, nessun passaggio del mouse per
scoprire cosa è interattivo, e uno schermo dove la nave sezionata occupa un
terzo dello spazio.

La Usability vale il **30%** ed è il criterio più debole dei vincitori — Lando
Norris 7,90, Messenger 7,46. Un atto due che funziona da desktop e si arrende da
telefono **abbassa** il voto invece di alzarlo, e cancella il guadagno di
categoria che è tutta la ragione per costruirlo.

Il telefono va progettato **come atto due suo**, non come lo stesso ridotto. La
strada che sospettiamo giusta — da provare, non da assumere — è che su touch la
griglia a due assi diventi **una sequenza di celle** con trascinamento
orizzontale fra stazioni e verticale fra quote: un movimento a scatti fra
posizioni note invece che libero. Meno agency, più leggibilità, e nessuna camera
da governare con due dita.

**Cancello:** ogni cosa che si può scoprire da desktop si deve poter scoprire da
telefono. Non con lo stesso gesto — con lo stesso esito.

---

## 9. I cancelli

| cosa | come si verifica | esce con errore se |
|---|---|---|
| attrito del passaggio | durata del vuoto, guardata addosso a qualcuno | la soglia si scrive dopo averla vista |
| catena causale | propulsione spenta → riduzione, confrontata con `C(V)` | esiste una riga che forza la riduzione |
| finale | inclinazione salone contro `viva.c.theta`, 200 fotogrammi | scarto > 0,05° |
| annotazioni | comparsa per quiete, non per clic | esiste un gestore di clic sui sistemi |
| copertura | ogni sistema raggiungibile da telefono | uno solo non lo è |
| peso | `npm run peso` con i tre sistemi nuovi | oltre i tetti del brief |

E la regola di casa che vale qui più che altrove: **un difetto periodico non si
vede in un provino, si vede campionando nel tempo.** L'atto due ha una camera
libera, quindi molti più modi di rompersi in modo intermittente di quanti ne
avesse l'atto uno.

---

## 10. Cosa questo non risolve

**Non risolve A05**, che resta il rischio numero uno. La presenza nella community
Awwwards è zero, serve il 6,5 dagli utenti già per l'Honorable Mention, ed è
lavoro di mesi che non si recupera costruendo meglio. Nessuna riga di questo
documento la tocca.

**Non è lavoro di una notte.** Sono settimane, e la stima onesta è che il
telefono da solo valga quanto il resto.

**E non garantisce niente.** Il SOTY sono due-cinque all'anno su circa 365 SOTD,
tre anelli decisi da elettori diversi, e su due dei tre la qualità del codice non
entra. Questo documento cambia la **categoria** in cui il sito compete — da
explainer a cosa-con-cui-si-gioca. Non cambia le probabilità dentro quella
categoria.

Ma senza, la categoria è quella sbagliata, e nessuna quantità di rifinitura la
sposta.

---

## 11. L'ordine

1. la lama come strumento, e il passaggio di consegne
2. la navigazione a due assi, desktop
3. propulsione — perché è il primo anello della catena
4. il cablaggio delle conseguenze, e il suo cancello
5. giroscopio — il controesempio
6. il finale, e il suo cancello
7. **il telefono**
8. timoneria, se resta tempo

I punti 3, 4 e 5 sono il cuore: sono quelli che trasformano quattro oggetti in
un ragionamento. Il punto 7 è quello che si è tentati di rimandare, e non si può.
