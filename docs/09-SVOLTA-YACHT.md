# 09 — La svolta: da schema a yacht

Documento di svolta. Registra come il concetto è cambiato, con quali prove, e
cosa questo invalida nei documenti precedenti. Dove un numero compare, è stato
misurato eseguendo. Dove non lo è, è scritto.

Prevale su `08-PROGETTO-TECNICO.md` per quanto riguarda scafo, percorso, camera
e budget degli asset. Il resto di `08` — piani di taglio, simulazione del
rollio, contratto dei sistemi, pipeline Tripo — resta valido.

---

## Sommario delle decisioni

| id | decisione | stato |
|---|---|---|
| **D30** | Il mondo è uno **yacht vero**, non due scatole impilate | presa |
| **D31** | Il cliente resta la **componentistica**, non il cantiere | presa |
| **D32** | Lo yacht è **autoprodotto e dichiarato tale** — nome proprio, nessun cantiere reale | presa |
| **D33** | Lo scafo è un **loft fra ordinate**, non una sezione estrusa | presa |
| **D34** | Il percorso è **a due tempi**: discesa, poi percorrenza | presa |
| **D35** | Lo **scroll è il padrone unico** della posizione | presa |
| **D36** | La camera è vincolata **finché la giunzione è visibile**, poi libera | presa |
| **A08** | Il budget degli asset va **rifatto da zero** | aperta |
| **A09** | Le persone appartengono al disegno o alla fotografia? | aperta |

---

## 1. Come ci siamo arrivati

Il concetto è cambiato tre volte in una sessione. Vale la pena registrare la
catena, perché ogni passaggio è stato causato da una **prova**, non da un
ripensamento.

**Partenza.** Una schermata sola: uno stabilizzatore a pinne, un interruttore,
il rollio che si calma. Diagnosi: è un *explainer*. Gli explainer vincono il
Site of the Day di continuo e non vincono l'anno, perché il SOTY lo decide la
community — che vota quello con cui gioca, non quello che le spiega qualcosa.

**Prima svolta: la lama.** Un piano di sezione guidato dall'utente lungo
quaranta metri di nave, che rivela venti sistemi al lavoro. Converte l'explainer
in uno strumento.

**Seconda svolta, non voluta: l'immagine ha buttato via la nave.** Il primo
fotogramma generato funziona — la tesi si legge in un istante — ma non contiene
nessuno scafo. Sono due scatole impilate. Il fotogramma più forte che avevamo
era incompatibile col concetto specificato, perché senza nave non c'è niente da
attraversare.

**Terza svolta: lo scroll verticale.** Risolve il bivio. Non serve una nave
lunga da percorrere: serve la direzione che il taglio impone già. La riga
orizzontale è l'asse del sito, e scendere è l'unico movimento che non la
contraddice. E cambia la lettura: la lama era un tour, scendere è una
**discesa** — dal comfort alla sua causa.

**Quarta: lo yacht.** Con la discesa il problema diventa che sotto la linea le
macchine finirebbero impilate in una torre, e in una nave vera stanno alla
stessa quota distribuite in lunghezza. Uno yacht vero risolve la geometria e
insieme risolve il problema del premio: una nave è un **mondo**, due scatole
sono un diagramma. È esattamente la differenza fra SOTD e SOTY isolata nel
documento 05.

---

## 2. Le prove, misurate

### Video 1 — «la stanza rolla, l'orizzonte resta piatto»

**Fallito, e in modo istruttivo.** Il modello ha ruotato l'inquadratura, non la
nave: al terzo fotogramma la linea d'acqua attraversa lo schermo in diagonale.
Le persone si inclinano con la barca, quindi il contrasto — l'unica cosa da
testare — scompare.

Due conclusioni utili: la regola della camera a quota zero è giusta e ora
sappiamo com'è brutto quando si rompe; e **solo il tempo reale può produrre
questo effetto**, perché l'acqua sta in coordinate mondo e solo lo scafo ruota.
Nessun modello video lo farà, perché tratta il fotogramma come un'immagine sola.

### Video 2 — «mare cattivo fuori, calma dentro»

Misurato su **tutti i 240 fotogrammi**, non a occhio:

| grandezza | risultato |
|---|---|
| deriva della linea d'acqua | **4 px su 360** — 1,1% |
| variazione di scala della scatola | 2,2% |
| deriva orizzontale del centro | 8 px |
| rollio della stanza | **zero** |

*Nota di metodo:* guardando i fotogrammi ero convinto che la scatola sobbalzasse
verticalmente ed ero pronto a segnalarlo come difetto. La misura dice che non è
vero. È la seconda volta in una sessione che il metro corregge l'impressione.

**Cosa è passato.** Le persone restano ignare per tutta la clip: non guardano
mai fuori, non reagiscono. Era il rischio più grosso.

**Il risultato che vale più del test progettato.** La stanza non rolla affatto,
quindi la prova che avevo disegnato non è stata eseguita — ma il contrasto
funziona **con rollio pari a zero**. Conseguenza sul progetto: avevamo dato per
scontato che il rollio portasse l'emozione e il finestrino fosse di supporto.
È il contrario. **Il finestrino porta l'emozione, il rollio porta la prova
tecnica.** Due lavori diversi. È anche una fortuna: una nave stabilizzata rolla
un grado e mezzo, e lì dentro l'emozione non ci sarebbe stata.

**Due cose che il modello ha deciso da sé e che teniamo.** La cornice del
finestrino quasi nera, che funziona da passe-partout e separa la fotografia dal
disegno. E il riflesso della scatola nell'acqua sotto la linea, che lega le due
metà attraverso il taglio invece di lasciarle affiancate.

**Cosa manca alla clip.** Sotto la linea non c'è niente. È metà della tesi: il
comfort senza la sua ragione.

---

## 3. Lo scafo — dal profilo estruso al loft

### Il problema

Finora la carena era **una sezione sola estrusa lungo Z**. È quella scelta che
rende i tappi di sezione esatti per costruzione: la sezione di un'estrusione a
qualunque quota *è* la `Shape` che l'ha generata. Uno yacht vero non è così —
prua stretta e a V, poppa larga e quasi piatta.

### La soluzione, che conserva il trucco

**Loft fra ordinate.** Otto sezioni lungo la lunghezza, interpolate linearmente.
Il tappo a una quota qualsiasi resta **calcolabile esatto**, perché è
l'interpolazione fra le due ordinate adiacenti: non va approssimato né ricavato
con lo stencil. Costa una funzione, non un modellatore, e nessun asset esterno.

### La tabella delle ordinate

Mezza sezione, lato dritto. `t = 0` prua, `t = 1` specchio di poppa.
Unità di scena: **1 = 2,5 m**.

| t | semilarghezza | chiglia | spigolo y | spigolo x | ponte y |
|---|---|---|---|---|---|
| 0,00 | 0,26 | −0,60 | −0,28 | 0,20 | 1,02 |
| 0,14 | 0,76 | −0,86 | −0,30 | 0,62 | 0,99 |
| 0,28 | 1,16 | −0,94 | −0,28 | 1,02 | 0,96 |
| 0,42 | 1,46 | −0,94 | −0,26 | 1,36 | 0,94 |
| 0,56 | 1,62 | −0,90 | −0,24 | 1,56 | 0,92 |
| 0,70 | 1,66 | −0,82 | −0,22 | 1,63 | 0,91 |
| 0,85 | 1,62 | −0,72 | −0,20 | 1,60 | 0,90 |
| 1,00 | 1,55 | −0,60 | −0,18 | 1,54 | 0,90 |

### Verifica

Campionate 201 sezioni interpolate: nessuna degenere, chiglia sempre sotto lo
spigolo, spigolo sempre entro la semilarghezza, ponte sempre sopra la linea
d'acqua.

**Scafo risultante:** lunghezza **40,0 m** · baglio **8,30 m** · L/B **4,82** ·
pescaggio **2,35 m**. Sono proporzioni corrette per un planante di quella taglia.

**Deadrise** (angolo fra chiglia e spigolo — dice se lo scafo è planante):

| t | 0,00 | 0,14 | 0,28 | 0,56 | 0,85 | 1,00 |
|---|---|---|---|---|---|---|
| ° | 58,0 | 42,1 | 32,9 | 22,9 | 18,0 | 15,3 |

Prua profondamente a V, poppa quasi piatta. È la firma di una carena planante.

*Due difetti trovati e corretti nella prima stesura di questa tabella: il
controllo del pescaggio prendeva il minimo invece del massimo (dava 1,05 m
invece di 2,35), e la prua aveva 28,6° di deadrise dove un planante ne vuole
45-58.*

---

## 4. Il percorso a due tempi

**Primo tempo — la discesa.** Dal salone, attraverso il ponte, alla sala
macchine. Un momento solo di rivelazione, che chiude la domanda *perché stanno
comodi*.

La linea d'acqua resta inchiodata a metà schermo: è il perno e non si muove mai.
Quello che si muove è la **nave, che sale** mentre scorri — così affiora sempre
più macchina da sotto e il salone esce dall'inquadratura in alto. Non è la
camera a scendere: è la nave a emergere. Il vincolo di quota zero sopravvive
intatto, ed è quello che tiene la giunzione fra fondo CSS e canvas a **zero
pixel**.

**Secondo tempo — la percorrenza.** Arrivati sotto, il movimento gira di novanta
gradi e va in lunghezza: a poppa la propulsione, a mezza nave gli stabilizzatori,
a poppavia estrema la timoneria. Qui torna utile la lama, e stavolta ha una nave
vera da attraversare.

**Il contratto dei sistemi non cambia una riga.** Cambia solo cosa significano
le coordinate: da una posizione lungo lo scafo a **due** — quota e lunghezza.
Tutto il lavoro parallelo previsto al §10 di `08` sopravvive alla svolta.

**E si risolve il difetto dei tre padroni.** Lo scroll è il padrone unico della
posizione. La barra del browser è già lo slider accessibile che stavamo per
costruire a mano.

---

## 5. La camera come fase, non come prigione

La quota zero resta **finché la linea d'acqua è in inquadratura**, perché è
quello che protegge la giunzione fra fondo CSS e canvas.

Quando la discesa porta sotto e lo sfondo si chiude sull'acqua profonda, non c'è
più nessuna giunzione da proteggere e **la camera si libera**. Il vincolo
diventa una fase del percorso.

Risolve il rilievo sulla monotonia — una sola inquadratura per tutto il sito —
senza rinunciare alla regola dove serve davvero.

---

## 6. Registro di provenienza dello yacht

Lo yacht è **autoprodotto e dichiarato tale**: nome proprio, ordinate scritte a
mano, nessun cantiere reale, nessun CAD di terzi.

Le tre ragioni, in ordine di peso:

1. **Ammissibilità.** Awwwards accetta i progetti autoprodotti purché design e
   sviluppo siano interamente di chi sottomette. La geometria scritta a mano lo
   è al cento per cento.
2. **Verificabilità.** Uno scafo reale senza CAD si può solo indovinare. Uno
   scafo dichiaratamente nostro con proporzioni corrette non indovina niente.
3. **Onestà spostata dove conta.** L'onestà non sta nel nome dello scafo: sta
   nei **numeri**. Quelli sono già prodotti da una simulazione vera, non
   stampati. Uno scafo di fantasia con una fisica onesta è molto più difendibile
   di uno scafo reale con numeri inventati.

I componenti sotto coperta restano generici come già erano, e la dichiarazione
*modello illustrativo · geometria generica* resta dov'è.

---

## 7. Perché il cliente resta la componentistica

La tesi funziona **proprio perché il committente non è chi vende lo yacht**. A
un cantiere conviene mostrare il salone, non l'attuatore: se il sito diventasse
il suo, direbbe *guarda che bella la mia barca*, e competerebbe contro cantieri
con budget da film.

E c'è un fatto commerciale: un cantiere compra un sito ogni cinque anni. Un
produttore di componentistica lancia prodotti in continuazione, deve spiegare
una differenza tecnica a ogni fiera, e ha l'agente che entra in cantiere col
tablet. È lavoro che si ripete.

**Sintesi: yacht come mondo, componentistica come cliente.**

---

## 8. Cosa questo invalida

| dove | cosa cade | perché |
|---|---|---|
| `08` §1 | «una sezione estrusa lungo Z» | sostituita dal loft, §3 qui |
| `08` §2 | la lama come movimento primario | diventa il **secondo** tempo, §4 qui |
| `08` §3 | camera vincolata per tutto il sito | diventa una fase, §5 qui |
| `08` §8 | budget asset 20 × 25 KB | tarato su due scatole — **A08**, da rifare |
| `08` §12 | tetto di 3.000 facce per pezzo | derivava dal budget qui sopra |
| `08` §7 | accessibilità come «leva» | è **igiene che alimenta la Usability al 30%**, non una leva |

### Il budget delle persone, misurato

Il tetto di 3.000 facce non veniva dalle persone: veniva da `500 KB ÷ 20 pezzi`,
e quei venti pezzi appartenevano al concetto che l'immagine ha già sostituito.

Misurato con `gltfpack -cc` su mesh organiche di densità umana, meshopt + gzip:

| triangoli | peso compresso | 4 figure |
|---|---|---|
| 3.000 | 8,3 KB | 33,1 KB |
| 6.000 | 15,2 KB | 60,8 KB |
| 10.000 | 23,5 KB | 94,2 KB |
| 16.000 | 36,1 KB | 144,3 KB |
| 25.000 | 53,2 KB | 212,7 KB |

**Quattro figure a 10.000 triangoli costano 94 KB.** Non era il problema.

Il problema vero non erano mai i triangoli, ed è in tre parti che i poligoni
risolvono solo in parte. I **volti**: senza texture leggono come maschere, e più
densità peggiora, non migliora. Le **mani**: stesso problema, e la generazione
fonde le dita più spesso sugli umani che sugli oggetti. La **stoffa**: qui i
poligoni servono davvero, ed è la notizia buona — le pieghe sono pura geometria,
funzionano senza texture, e sono ciò che fa leggere una figura come persona
invece che come manichino.

Spesa consigliata: **10.000 triangoli con la stoffa dettagliata, volto e mani
deliberatamente sommari.**

---

## 9. A09 — la domanda che l'immagine ha già risposto al posto nostro

Nel fotogramma generato tutto è diagramma: carta piatta, teal piatto, linea
d'acqua netta. Le persone sono **l'unica cosa fotografica** dell'inquadratura, e
quel contrasto è metà del motivo per cui l'immagine funziona.

Se le rendiamo coerenti col diagramma, astratte e senza texture, perdiamo il
contrasto. Se le vogliamo fotografiche in WebGL, salta il principio *dalla
generazione si prende solo la geometria* proprio sull'asset più importante.

Non è una questione di budget: **le persone appartengono al disegno o alla
fotografia?** Finché la risposta non è dichiarata, il §12 di `08` sta
ottimizzando la cosa sbagliata.

### La regola che ne discende, se la risposta è «fotografia»

> Tutto ciò che è diagramma si costruisce.
> Tutto ciò che è fotografia si vede **attraverso un'apertura**.

Le persone e il mare fuori dal finestrino diventano la stessa cosa: fotografie
inquadrate da un'apertura dentro un disegno tecnico. Il mare **sotto** la linea
resta campo grafico piatto. Due mari nella stessa inquadratura non è un errore:
è la stessa divisione che governa tutto il sito, applicata all'acqua.

### Il mare fuori dal finestrino è l'asset migliore del progetto

Tre ragioni, e la terza è quella che le persone non hanno.

**Un piano video è una bugia per una persona e un fatto per un orizzonte.** Un
orizzonte a cinque chilometri *è* un piano perpendicolare allo sguardo: la
geometria coincide con la fisica, quindi l'obiezione sulla piattezza cade invece
di essere aggirata.

**Il rollio arriva gratis.** Il piano del mare sta in coordinate mondo, la stanza
no. Quando lo scafo ruota, l'orizzonte resta piatto **da solo** — è la
conseguenza di dove metti il piano, non una riga di codice. Ed è precisamente
l'effetto che il modello video non è riuscito a produrre.

**Non mente sullo stato: lo *è*.** Il video dei due che ridono con gli
stabilizzatori spenti sarebbe una bugia — la nave rolla dodici gradi e loro
bevono tranquilli. Il mare fuori invece **è** la manopola: giri lo stato del
mare e cambia il mare. Non può contraddire ciò che l'utente controlla.

Peso: la fascia del finestrino è dell'ordine di 900×160 px, un decimo di un
video a schermo intero. Tre clip — calmo, mosso, agitato — **una per volta**,
caricate su richiesta al cambio di stato. Non entra nel carico iniziale.

*Vincolo iOS:* il divieto nella skill riguarda lo **scrubbing**, non la
riproduzione normale. Il limite vero è la decodifica simultanea, quindi un
elemento video alla volta e taglio netto fra stati, non dissolvenza incrociata.

*Da verificare in produzione:* il filmato va girato o generato **da un ponte,
guardando l'orizzonte in piano** — non da drone né a pelo d'acqua. Se la
prospettiva del filmato litiga con la vista quasi ortografica della scena, si
vede subito e non si aggiusta.

---

## 10. Verificato e non verificato

**Verificato eseguendo, in questa sessione:**
la tabella delle ordinate su 201 sezioni interpolate, e le proporzioni che ne
escono (40,0 m · 8,30 m · L/B 4,82 · 2,35 m); il deadrise lungo la carena; i
pesi compressi delle mesh a densità umana con `gltfpack` reale; le tre metriche
del video 2 su tutti i 240 fotogrammi.

**Verificato nelle sessioni precedenti e ancora valido:**
la logica dei due piani di taglio su tutta la lunghezza; la taratura della
forzante e dell'autorità delle pinne; la tabella del rollio ai cinque stati del
mare; la stabilità dell'integratore su 20 minuti da 20 a 120 Hz; il quadrilatero
articolato, rigido a 0,30000 e 0,11000 su tutta la corsa.

**Non verificato, e nessuno di questi numeri esiste ancora:**
qualunque cosa riguardi prestazioni, resa visiva e comportamento su un
dispositivo reale. Il loft non è mai stato disegnato: le ordinate sono valide
come numeri, non come superficie. E l'affermazione «89% è il riferimento
commerciale per gli yacht» va aperta su fonte prima di tararci sopra.

---

## 11. Prossimo passo

**Non costruire.** Scrivere prima **A07**, la direzione artistica — tipografia,
colore, impaginazione, riferimenti visivi. Tre revisioni indipendenti hanno detto
la stessa cosa e hanno ragione: il collo di bottiglia è la resa, non il codice.
Oggi il codice è specificato al millesimo e la resa vale il **70%**.

Il fotogramma generato è il riferimento di partenza di A07. Non lo sostituisce.

---

# Esito della verifica — orchestratore, 2026-08-25

## La tabella delle ordinate: verificata al centesimo

Ricalcolata in modo indipendente dai numeri della tabella, unità di scena 2,5 m.

| grandezza | dichiarato | calcolato |
|---|---|---|
| lunghezza | 40,0 m | **40,0 m** |
| baglio | 8,30 m | **8,30 m** |
| L/B | 4,82 | **4,82** |
| pescaggio | 2,35 m | **2,35 m** |

I sei valori di deadrise coincidono tutti entro un decimo di grado — 58,0 ·
42,1 · 32,9 · 22,9 · 18,0 · 15,3. E su **201 sezioni interpolate**: zero
degeneri, chiglia sempre sotto lo spigolo, spigolo sempre entro la
semilarghezza, ponte sempre sopra la linea d'acqua.

Le proporzioni sono corrette per un planante di quella taglia, e la firma della
carena è coerente: prua profondamente a V, poppa quasi piatta.

## La trappola del loft, che il documento non nomina

L'affermazione «il tappo resta calcolabile esatto perché è l'interpolazione fra
le due ordinate adiacenti» è **vera solo a una condizione**: che la superficie
sia costruita con la **stessa** interpolazione con cui si calcola il tappo.

Se un giorno il loft viene addolcito longitudinalmente — una spline fra le
ordinate invece di superfici rigate — la formula del tappo continua a restituire
un poligono, **senza dare errore**, ma non è più la sezione della superficie
disegnata. Si vede come una scheggia di carta che sporge dallo scafo, e si dà la
colpa al materiale.

> **Il generatore della superficie e il calcolo del tappo devono condividere la
> stessa funzione di interpolazione.** Una funzione sola, chiamata da entrambi.
> Non due implementazioni che «fanno la stessa cosa».

È lo stesso genere di guasto silenzioso già catalogato in
`riferimenti/velocity/CARROZZERIA_FAIRNESS.md`.

## Due affermazioni che il documento riporta e che sono già superate

**1. Il video 1 e la «diagonale».** Il §2 ripete che «al terzo fotogramma la
linea d'acqua attraversa lo schermo in diagonale». È stato **misurato** su 80
fotogrammi: inclinazione mediana **−0,34°**, peggiore **−5,14°**, oltre 1° in 20
fotogrammi su 80. È un'inclinazione visibile, non una diagonale.

E il difetto più grave è un altro, che nessuno aveva nominato: **la quota della
linea deriva dal 52,5% al 61,2%**, mediana 54,4%. Il video non ha mai rispettato
la regola del 50%, nemmeno da fermo. Dettaglio in
[`10-DIREZIONE-ARTISTICA.md`](10-DIREZIONE-ARTISTICA.md).

La conclusione che il documento trae resta però giusta, ed è rafforzata dalla
misura: un modello generativo non può tenere un invariante.

**2. L'89% è già stato aperto su fonte.** Il §10 lo elenca fra le cose da
verificare. È stato fatto: i costruttori e la stampa di settore pubblicano
comunemente **fino al 90% in navigazione** e ~70% da fermi. **L'89% è
difendibile e la taratura non va abbassata.** Il «60% o meglio» che circolava
riguarda le navi commerciali grandi, dove è un requisito *minimo*. Errata
completa in `07-RIFERIMENTI-TECNICI.md` §3.3.

## Il rischio dei due orizzonti

Il §9 propone il mare fuori dal finestrino come piano video, e l'argomento è
buono: un orizzonte a cinque chilometri **è** un piano perpendicolare allo
sguardo, e il rollio arriva gratis perché il piano sta in coordinate mondo.

Ma la camera sta a quota zero e guarda l'orizzonte, quindi **l'orizzonte della
scena cade al centro esatto del canvas**. Se il filmato dentro il finestrino ha
il proprio orizzonte a una quota diversa, nell'inquadratura ce ne sono **due**,
e non combaciano.

Non è un ostacolo, è un requisito di ripresa da scrivere adesso: il filmato va
girato con l'orizzonte **a metà fotogramma esatta**, e il piano va posizionato
perché quella riga cada sulla quota zero della scena. È la stessa disciplina
della giunzione CSS/canvas, applicata a un secondo confine.

## Numerazione: c'era una collisione, ed è stata risolta

Il documento assegna `D30–D36` e `A08–A09`, ma nel registro **D30, D31, D32,
D33, D34 e A08 erano già occupati** da decisioni prese poche ore prima. Lasciarlo
così avrebbe corrotto il registro, che è l'unico posto dove si legge perché una
cosa è stata decisa.

| nel documento | nel registro | nota |
|---|---|---|
| D30 yacht vero | **D35** | |
| D31 cliente = componentistica | **D36** | |
| D32 yacht autoprodotto e dichiarato | **D37** | |
| D33 loft fra ordinate | **D38** | |
| D34 percorso a due tempi | **D39** | |
| D35 scroll padrone unico | *già* **D29** | stessa decisione, arrivata per altra strada |
| D36 camera vincolata finché la giunzione è visibile | *già* **D28** | idem |
| A08 budget asset da rifare | **A09** | |
| A09 persone: disegno o fotografia | *già* **A08** | il documento la fa avanzare parecchio |

Due decisioni su sette erano **già state prese qui**, per strade diverse e con
le stesse parole. È il segnale che il metodo converge, non che qualcuno ha
copiato.

## Su «scrivere prima A07»

Il §11 dice di scrivere la direzione artistica prima di costruire. **È già
scritta** — `10-DIREZIONE-ARTISTICA.md`, aperta dal fotogramma generato, con
l'accento riservato alla cinematica, lo spessore di parete della sezione e i due
registri di resa.

Ma il rilievo resta valido **per la metà che manca**: tipografia (ferma a
`P01-bis`, in attesa del censimento delle font dei SOTD) e impaginazione. Quelle
due non sono coperte, e senza di esse il 40% del Design è specificato a metà.
