# Direzione per il Site of the Year — giro del 29 agosto 2026

**Trascrizione integrale.** Il contributo arriva da una revisione esterna che
**non vede il repository**: e' stata interrogata sulla direzione da prendere per
il sito dell'anno, e ha risposto sul codice pubblico. Trascritto qui dal
committente perche' resti in un posto solo, come vuole `COME-DARE-FEEDBACK.md`.

HEAD al momento del giro: `cbd0778`.

---

## Esito della verifica — sei affermazioni su sei, tutte confermate

Prima della trascrizione, perche' chi legge sappia su cosa sta ragionando. Le
sei affermazioni fattuali sul repo le ho controllate una per una:

| affermazione | esito | dove |
|---|---|---|
| `#velocita` imposta direttamente `sim.S.velocita` | **confermata** | `src/demo.js:168` — `sim.S.velocita = Number(cursore.value)`, assegnazione diretta dal cursore |
| non esistono moduli runtime per propulsione, giroscopio, timoneria | **confermata** | `src/scena/` ha 18 file, nessuno dei tre. Zero occorrenze di `propulsion`/`gyro`/`timoner` in tutto `src/` |
| la velocita' non e' una conseguenza dinamica | **confermata** | e' il valore del cursore, non integrato: nessuna equazione di stato la produce |
| `finale.js` esiste ma non e' collegato | **confermata, ed e' la piu' seria** | `src/scena/finale.js`, 18.988 byte, esporta `creaFinale` piu' sei funzioni. **Importato da nessun file.** E' codice morto che nessun cancello segnala |
| i filmati nuovi non sono montati | **confermata** | `discesa.mp4` sta in `public/filmati/` e nessuna riga di `src/` lo nomina; i due tagli fotorealistici sono ancora fuori dal repo |
| non esiste l'esplorazione interna a due assi | **confermata** | nessuna stazione, nessun asse dominante, nessuna navigazione |

**Le diciannove kilobyte di `finale.js` meritano una riga a parte**: sono un
pezzo di lavoro finito, con le sue costanti e la sua matematica, che non gira e
che nessuno aveva notato. La revisione qui sotto propone anche di **non usarlo**
— dice che la lastra e' intelligente tecnicamente ma percettivamente ripropone
il difetto gia' noto, una fotografia dentro l'inquadratura. Il che rende la
domanda «si collega o si cancella?» una decisione, non una svista da chiudere.

---

# Trascrizione

La diagnosi è giusta: **continuare a perfezionare lo yacht attuale può migliorare
il voto, ma non cambia la categoria del progetto**. L'atto due, invece, può
trasformarlo da dimostrazione elegante a esperienza memorabile.

Ho verificato l'ultimo `main`, ora a `cbd0778`. La catena di
`docs/13-ATTO-DUE.md` è ancora realmente assente:

* `#velocita` imposta direttamente `sim.S.velocita`;
* non esistono moduli runtime per propulsione, giroscopio o timoneria;
* la velocità non è ancora una conseguenza dinamica;
* `finale.js` esiste ma non è collegato;
* i filmati nuovi non sono montati;
* non esiste ancora l'esplorazione interna a due assi.

La direzione da fissare è questa:

> **L'atto uno mostra che lo stabilizzatore funziona.
> L'atto due permette di capire quando smette di funzionare, perché, e che cosa
> può sostituirlo.**

Non deve diventare un catalogo di quattro macchine. Deve essere un esperimento
che l'utente provoca, osserva, diagnostica e risolve.

## 1. La promessa dell'esperienza

Il sito deve far vivere questa scoperta senza anticiparla con un paragrafo:

1. Le pinne tengono la nave stabile.
2. L'utente spegne la propulsione.
3. Il motore e l'albero rallentano.
4. La nave perde velocità gradualmente.
5. Le pinne continuano fisicamente a muoversi.
6. Ma l'acqua scorre sempre meno sulle pinne.
7. La loro autorità cala con V².
8. Il rollio ritorna.
9. L'utente scopre il giroscopio.
10. Il giroscopio funziona anche a nave quasi ferma.
11. Ripristinando propulsione e stabilizzazione, la nave torna calma.
12. La camera attraversa gli spazi interni e ritorna alle stesse persone del
    salone.

La frase mentale che deve restare non è "ho visto quattro impianti". Deve essere:

> "Adesso ho capito perché una barca può avere sia le pinne sia un giroscopio."

Questa è una conoscenza conquistata. Ed è materiale da premio.

## 2. Durata: non dieci minuti obbligatori

Il percorso principale non deve durare forzatamente dieci minuti. Sarebbe
estenuante. La struttura corretta è:

* esperienza guidata completa: **4-6 minuti**;
* possibilità di restare, sperimentare e confrontare: **oltre 10 minuti**;
* percorso rapido per chi vuole solo vedere: **90-120 secondi** tramite menu.

La profondità deve venire dalle combinazioni — tre stati del mare, propulsione
accesa/spenta, pinne accese/spente, giroscopio acceso/spento, velocità che
evolve, sistemi che reagiscono diversamente — non da dieci minuti di animazione
obbligatoria.

## 3. L'arco narrativo definitivo

### Atto uno — Il beneficio

L'attuale struttura può rimanere: salone, mare agitato, stabilizzatore acceso,
persone comode, uscita dal salone, yacht, apertura dello scafo, meccanismo in
funzione.

Va però accorciato. Deve consegnare l'utente al meccanismo in circa **60-90
secondi**, non esaurire lì tutta l'esperienza.

### Passaggio di consegne

Il close-up dello stabilizzatore è il confine fra sito da guardare e sistema da
esplorare. Qui:

* lo scorrimento smette progressivamente di comandare la regia;
* la lama di sezione compie da sola un movimento minimo;
* appare una sola indicazione: **"Drag the section"**;
* l'utente prende direttamente la lama;
* non cambia canvas, camera, scena o simulazione.

Il momento deve sembrare che il disegno tecnico sia diventato uno strumento.
Nessun tutorial, nessuna schermata "Explore".

### Atto due — La scoperta

La camera non deve uscire nuovamente dallo yacht. Dal meccanismo prosegue dentro
la stessa nave:

1. compartimento dello stabilizzatore;
2. corridoio tecnico;
3. locale propulsione verso poppa;
4. ritorno verso lo stabilizzatore mentre la velocità cala;
5. locale del giroscopio;
6. salita fisica attraverso spazi tecnici e di servizio;
7. passaggio progressivo da freddo/meccanico a caldo/lussuoso;
8. ritorno allo stesso salone.

Questa traversata chiude il significato di "underneath": sotto non c'è un singolo
oggetto, ma un organismo causale.

## 4. I sistemi da costruire

Non costruire subito i quattro sistemi di `docs/13`. Per il primo rilascio
dell'atto due ne servono tre.

### 1. Propulsione

Motore, riduttore o trasmissione, albero, supporti, passaggio attraverso lo
scafo, elica o visualizzazione coerente della trasmissione, interruttore fisico o
leva, rotazione legata ai giri reali, scia legata a velocità e spinta.

L'utente non deve "impostare la velocità". Deve **comandare la propulsione**.

### 2. Stabilizzatori

Il sistema esiste già, ma nell'atto due deve mostrare il fallimento corretto:

* il controllore continua a chiedere incidenza;
* il motore continua a muovere biella e pinna;
* l'angolo può arrivare vicino al limite;
* la pinna lavora apparentemente di più;
* l'effetto sul rollio diminuisce perché manca il flusso d'acqua.

È molto più potente vedere una macchina lavorare inutilmente che vederla
semplicemente spegnersi.

### 3. Giroscopio

È il controesempio che chiude la storia. Rotore, contenitore, supporti,
avviamento graduale, crescita dei giri, coppia stabilizzante indipendente dalla
velocità della nave, tempo di avvio, suono e vibrazione caratteristici.

Non deve essere "migliore" delle pinne. Deve mostrare un altro regime: pinne
efficienti durante la navigazione, giroscopio utile a bassa velocità o da fermi.

### Timoneria

La rimanderei. Può rafforzare la stessa scoperta — anche il timone perde autorità
a bassa velocità — ma prima rischia di diluire la catena principale. Si
costruisce soltanto quando propulsione → pinne → giroscopio è già comprensibile
senza testo.

## 5. La modifica più importante: eliminare il cursore della velocità

Nell'esperienza pubblica il cursore `#velocita` insegna il modello mentale
sbagliato: dice che la velocità è un parametro scelto dall'utente. Nell'atto due
la velocità deve diventare **uno stato fisico**.

Il controllo pubblico deve comandare potenza o giri richiesti, marcia/propulsione
attiva, eventualmente avanti/neutro.

Il vecchio cursore diretto può restare solo nei collaudi, in una modalità
diagnostica, o in un laboratorio sbloccato dopo il racconto. **Non nel percorso
principale.**

## 6. Il modello causale

Non serve una simulazione navale completa. Serve una catena onesta e
verificabile.

### Velocità

La velocità deve essere integrata nel tempo:

    V̇ = ( T(u,n) − D(V) ) / m_eff

dove `u` è il comando della propulsione, `n` i giri, `T` la spinta, `D(V)` una
resistenza crescente con la velocità, `m_eff` una massa efficace dichiarata.

Spegnendo la propulsione: la spinta va verso zero, i giri scendono con inerzia,
la velocità cala progressivamente, **nessun valore viene azzerato
istantaneamente**.

Non è necessario aspettare che la nave arrivi a zero: passando da 12 a 8 nodi
l'autorità delle pinne, con dipendenza quadratica, è già circa il **44%** di
quella iniziale.

### Pinne

La relazione esistente resta:

    C_fin(V) = C₀ · (V / V_rif)²

Il controllore determina l'angolo richiesto; velocità e stallo determinano quanta
coppia reale produce. **Non deve esistere una riga equivalente a
`se propulsione spenta → efficacia pinne = 0`.** Sarebbe una scorciatoia falsa.

### Giroscopio

Stato minimo: comando, giri del rotore, velocità di precessione, autorità
disponibile, temperatura/carico solo se diventano visibili e utili. La sua coppia
dipende dal rotore, non dall'abbrivio della nave. È questo che deve produrre il
contrasto.

### Ordine dell'integrazione

Sempre lo stesso ordine: input dell'utente → dinamica di motore e rotore → spinta
e resistenza → aggiornamento della velocità → autorità delle pinne dalla velocità
nuova → coppia del giroscopio → forzante del mare → integrazione del rollio →
aggiornamento di geometria, suono e letture.

**Una sola simulazione, un solo stato. Nessun secondo modello per l'atto due.**

## 7. Come si esplora

La griglia a due assi di `docs/13` è corretta come struttura tecnica, ma non deve
apparire come una mappa di dodici pagine.

### Desktop

Trascinamento orizzontale: spostamento della sezione lungo lo yacht.
Trascinamento verticale: passaggio fra livelli. Dopo una soglia iniziale il gesto
si blocca sull'asse dominante. Rilascio vicino a una stazione: assestamento
morbido. Frecce: stazione precedente/successiva. Su/giù: livello. Escape: ritorno
alla vista precedente.

La camera non è completamente libera: segue percorsi compatibili con la geometria
e non può attraversare muri o perdere il soggetto.

### Telefono

Non deve essere il desktop rimpicciolito. Swipe orizzontale fra stazioni, swipe
verticale fra livelli, scatto fra posizioni conosciute, un piccolo schema dello
yacht che mostra solo posizione e quota, nessun controllo a due dita
obbligatorio, stessi sistemi e stesse conseguenze del desktop.

**La parità significa stesso risultato, non stesso gesto.**

### Nessun hotspot

I sistemi non devono avere pallini luminosi. Quando la lama si ferma per circa
400-600 ms vicino a un sistema: compare il nome, emerge il controllo fisico,
viene resa disponibile l'alternativa semantica DOM, e l'annotazione sparisce
appena la lama riparte.

La cosa interessante deve essere **trovata nello spazio**, non indicata da un
segnaposto.

## 8. La regia della scoperta

| Momento | Azione dell'utente | Conseguenza |
|---|---|---|
| Stabilizzatore | osserva il sistema funzionare | associa movimento a stabilità |
| Propulsione | spegne il motore | giri, albero, scia e velocità iniziano a calare |
| Ritorno verso la pinna | non fa nulla | vede che la pinna si muove sempre di più ma controlla sempre meno |
| Rollio | osserva le persone/salone peggiorare | comprende che qualcosa è cambiato |
| Giroscopio | lo attiva | il rotore sale di giri e il rollio diminuisce anche a bassa velocità |
| Ripristino | riaccende propulsione o combina i sistemi | scopre le differenze fra i regimi |
| Salone | ritorna alle persone | il risultato tecnico diventa benessere umano |

Le annotazioni devono **confermare dopo** la scoperta, non anticiparla. Esempi
accettabili: *"Same fin angle. Less water. Less force."* · *"The gyro does not
need forward motion."* · *"Underway: fins. At rest: mass in motion."*

Non servono paragrafi.

## 9. Il finale

Non userei come soluzione definitiva la lastra prevista dall'attuale `finale.js`.
È intelligente tecnicamente, ma percettivamente riporta il problema già visibile:
una fotografia dentro l'inquadratura.

Il finale da Site of the Year deve essere **spaziale**: la camera lascia il
locale del giroscopio, attraversa corridoi e aperture reali, sale attraverso
l'interno, materiali e luce passano gradualmente dal tecnico al lusso, arriva al
salone esatto — stesso finestrone, stesso mare, stesse persone, stessa luce —
**nessun taglio, dissolvenza o reset**, e lo stato dei sistemi non cambia durante
il viaggio.

Il fotogramma iniziale e quello finale devono essere quelli approvati. Fra i due
si muove la camera, non cambia il mondo.

Le persone devono reagire al **rollio filtrato**, non allo stato booleano
dell'interruttore: rollio basso per alcuni secondi → rilassate; rollio crescente
→ attenzione; rollio alto persistente → si puntellano; ritorno alla stabilità →
rilascio graduale.

## 10. Architettura grafica

Una scena unica non significa che tutto debba essere caricato subito. Si può
mantenere: un solo `Scene`, un solo `WebGLRenderer`, una sola camera, un solo
integratore, un solo sistema di coordinate, gruppi caricati in anticipo prima che
entrino in vista.

Gli spazi dell'atto due devono essere costruiti in Blender **nello stesso file
metrico** o nello stesso riferimento dello yacht: compartimento stabilizzatore,
locale propulsione, locale giroscopio, corridoi, passaggi verticali, guscio del
salone. Gli asset possono essere divisi in GLB per lo streaming, ma devono
entrare in nodi già posizionati nella stessa scena. **Nessun caricamento
intermedio visibile.**

### Salone

La fotografia deve essere proiettata su un **guscio tridimensionale**: pavimento,
soffitto, finestrone, montanti, pareti, volumi principali del divano, mobili
dominanti. Alla posa iniziale la proiezione deve coincidere col fotogramma
approvato; allontanandosi deve produrre parallasse e occlusioni reali.

### Filmati

I video nuovi devono essere **materiale visivo, non architettura**. Possono
essere texture, proiezioni, sorgenti per il salone, transizioni interne preparate
in Blender solo se coincidono al pixel con il frame WebGL precedente e
successivo. **Non devono apparire come un nuovo film a schermo pieno.**

## 11. Fotorealismo

Prima di produrre tutti gli asset bisogna **chiudere la decisione ACES/AgX**.
Altrimenti materiali e luci vengono giudicati con una curva diversa da quella
spedita.

Poi il fotorealismo dell'atto due si costruisce in questo ordine: silhouette e
scala → smussi e contatti → illuminazione coerente → materiali distinti →
occlusione → usura selettiva → riflessi → dettaglio minuto.

Il locale tecnico non deve essere sporco "da videogame". Uno yacht di lusso ha
metallo pulito ma non perfetto, vernice industriale, bulloneria, cavi ordinati,
targhette, tubazioni, giunti, supporti antivibranti, condensa o sale soltanto
dove plausibile.

La transizione freddo → caldo deve avvenire attraverso **la luce e i materiali**,
non con un cambio di color grading.

## 12. Suono

Per questo atto il suono è strutturale. Servono almeno: motore elettrico,
trasmissione, albero, acqua sullo scafo, colpi irregolari del mare, attuatore
delle pinne, rotore del giroscopio, vibrazione del locale tecnico, ambiente
ovattato del salone.

Tutto deve dipendere dagli stessi stati: giri, velocità, carico, rollio, distanza
della camera. **Il giroscopio deve essere riconoscibile a occhi chiusi.**

Il suono parte soltanto dopo un gesto e deve avere mute, trascrizione descrittiva
e nessuna informazione disponibile esclusivamente per via sonora.

## 13. UI e nudge

L'atto due deve **ridurre** il cruscotto, non aggiungerne un altro. Durante
l'esplorazione mostrerei soltanto velocità, rollio, autorità pinne e stato dei
tre sistemi. Ma progressivamente: prima velocità, poi autorità pinne, infine
confronto col giroscopio.

I nudge: apertura nessuno; salone lo stabilizzatore; consegna "Drag the section";
inattività vicino alla propulsione, evidenziare delicatamente l'interruttore;
**nessun nudge che dica "spegni la propulsione"**; nessun nuovo nudge mentre una
conseguenza importante è in corso; menu senza promozione durante l'arco emotivo.

Il vecchio "Drag the speed" va rimosso dal percorso principale: contraddice
l'atto due.

## 14. Cancelli necessari

| Cancello | Deve fallire quando |
|---|---|
| Catena causale | la riduzione viene forzata in base allo stato della propulsione |
| Decelerazione | la velocità salta o cresce dopo lo spegnimento senza una forza che lo spieghi |
| Autorità pinne | non corrisponde a `autorita(V)` |
| Persistenza | mare, velocità o interruttori vengono resettati cambiando stazione |
| Continuità | cambia identità di scene, renderer, camera o integratore |
| Percorso | la camera attraversa una superficie chiusa o teletrasporta |
| Finale | salone e scafo non usano lo stesso rollio nello stesso fotogramma |
| Copertura mobile | un sistema è raggiungibile solo da desktop |
| Fotorealismo | la transizione mostra il bordo di una proiezione o un asset non caricato |
| Durata | dopo dieci minuti aumentano memoria, decodificatori o listener |
| Accessibilità | un'azione richiede esclusivamente drag o raycasting |
| Stato del mare | immagine, rollio, suono e risposta meccanica indicano stati differenti |

Aggiungerei soprattutto **`collaudo-catena-causale.mjs`**. Deve dimostrare che
spegnendo la propulsione la velocità scende; l'autorità delle pinne segue la
stessa velocità; la pinna non viene disattivata artificialmente; il rollio
ritorna; il giroscopio produce autorità anche a velocità quasi zero; e ripetendo
il test con passi diversi il risultato rimane stabile.

## 15. Validazione con persone

Il test non è "ti piace?". Con 12-15 persone che non conoscono il progetto
bisogna misurare: quante capiscono che la scena è interattiva; quante prendono la
lama senza spiegazione; quante scoprono la propulsione; quante collegano velocità
e pinne; quante provano il giroscopio; quante riescono da telefono; che storia
raccontano alla fine.

Soglia minima: almeno **12 su 15** devono raccontare correttamente la catena;
almeno **10 su 15** devono scoprirla senza che il testo la anticipi; **nessuno**
deve pensare che le pinne si siano semplicemente rotte; almeno metà deve provare
spontaneamente una seconda combinazione.

Se non accade, non si aggiungono asset: **si corregge la regia.**

## 16. Roadmap realistica

**Settimana 1 — Nucleo causale.** Rendere dinamica la velocità; introdurre
comando propulsione; eliminare la velocità come input pubblico; collegare
`autorita(V)`; costruire il cancello; nessun nuovo asset definitivo. Risultato:
un test numerico e una schermata grezza in cui la catena esiste davvero.

**Settimana 2 — Interazione e spazio.** Passaggio di consegne; lama a due assi;
tre stazioni grigie; desktop e telefono già entrambi; stato persistente; primo
test con cinque persone.

**Settimane 3-4 — Propulsione e giroscopio.** Modelli Blender; pivot e
cinematica; PBR; suono provvisorio; controlli fisici; annotazioni per quiete.

**Settimane 5-6 — Traversata interna.** Corridoi; porte e passaggi; camera
vincolata; illuminazione continua; streaming anticipato; transizione tecnico →
lusso.

**Settimana 7 — Salone e persone.** Guscio proiettato; reazioni causali; mare in
tre stati; fotogramma finale; ritorno continuo.

**Settimana 8 — Mobile, prestazioni e accessibilità.** Profilazione su Android
reale; memoria e temperatura; navigazione snap; tastiera; movimento ridotto;
screen reader; LCP/INP/CLS.

**Settimane 9-10 — Test e rifinitura.** 12-15 persone; confronto alla cieca;
correzioni; blocco modifiche; candidatura soltanto dopo il collaudo.

Stima onesta: **8-12 settimane a tempo pieno**, più facilmente 12-16 se il lavoro
è discontinuo. Non è una notte e non deve essere trattato come tale.

## 17. I prossimi tre commit

Il prossimo commit non deve essere un altro documento.

**Commit 1 — "La velocità non è più un cursore: è la conseguenza della
propulsione."** Propulsione nello stato; integrazione della velocità; rimozione
del comando diretto dal percorso pubblico; `collaudo-catena-causale`.

**Commit 2 — "Il motore si spegne, ma le pinne non sanno che è successo."**
Modello provvisorio della propulsione; giri, albero e scia; pinne che perdono
autorità solo attraverso V²; nessuna forzatura sullo stabilizzatore.

**Commit 3 — "Il taglio smette di essere una conseguenza dello scroll e diventa
uno strumento."** Passaggio di consegne; navigazione fra stabilizzatore e
propulsione; prototipo mobile a scatti; stato persistente.

Solo dopo questi tre commit inizierei il lavoro fotorealistico definitivo sui
nuovi sistemi.

## Giudizio finale

L'atto due non garantisce il Site of the Year. Ma senza l'atto due il progetto
resta quasi certamente nella categoria sbagliata: **un ottimo explainer
interattivo**, capace di Honorable Mention o SOTD, ma troppo corto e troppo
leggibile per essere ricordato come mondo.

La mossa decisiva non è aggiungere quattro macchine. È fare in modo che l'utente
**provochi** un problema reale, **capisca** la dipendenza fra i sistemi e
**torni** alle persone dopo averlo risolto.

Quella è la versione del progetto che può restare in testa a fine anno.

---

# Cosa serve a chi ha scritto questo, e non ce l'ha

Questa revisione **non vede il repository**: ha ragionato sul codice pubblico e
ha preso sei bersagli su sei. Per il giro successivo servono due cose che da
sola non puo' avere:

1. **Riferimenti.** Nomi di siti, sequenze, opere in cui una catena causale come
   questa e' gia' stata fatta funzionare senza testo — e in cui l'utente
   *provoca* il guasto invece di subirlo. Il repertorio del repo sta in
   `riferimenti/` (40 schede) ma e' tarato sull'atto uno: superfici, scroll,
   fotorealismo. Sull'esplorazione diagnostica non c'e' niente.
2. **Il progetto vero.** Il committente lo fornira' e finira' su git. Da quel
   momento questa direzione diventa la cornice, non la specifica.
