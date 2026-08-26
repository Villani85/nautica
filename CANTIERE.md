# CANTIERE — dove sono arrivato

Foglio di lavoro vivo. **Si aggiorna a ogni pezzo finito**, nello stesso commit
del pezzo. Chi arriva legge questo per sapere a che punto è il lavoro, non per
sapere com'è fatto il progetto — quello sta in `CONSEGNA.md` e `docs/12`.

Legenda: `[ ]` da fare · `[~]` in corso · `[x]` fatto · `[-]` abbandonato, con
il perché.

---

## Bloccato sull'umano — non provare a farlo

- [ ] **GitHub → Settings → Pages → Source: GitHub Actions.** Il workflow è già
      in `.github/workflows/pubblica.yml` e i cancelli girano prima di
      pubblicare. **Finché non è acceso, nessuna misura reale è possibile**:
      niente LCP, niente INP, niente telefono vero, niente persone che lo
      aprono. Tutto l'ordine qui sotto è deciso su ipotesi invece che su misure,
      ed è la cosa che questo progetto non fa mai.
- [ ] **Il profilo Awwwards.** Conta dal giorno in cui esiste. Serve il 6,5
      **dagli utenti** già per l'Honorable Mention, ed è il voto che matura solo
      col tempo.
- [ ] **Aprire il sito da un telefono vero.** Nessuna emulazione lo sostituisce.
- [ ] **Metterlo davanti a persone che non lo conoscono.** Se meno di 12 su 15
      raccontano la stessa storia, la narrazione non è abbastanza chiara.

**Da non fare mai: usare la candidatura Awwwards come collaudo.** Quando entra
in revisione le modifiche si bloccano. Si pubblica prima, si prova, si candida
dopo.

---

## L'ordine, e perché è cambiato

Era: telefono → linea → offerta → atto due.

**È diventato: la nave prima di tutto.** Sistemando il salone ho creato un
problema nuovo — il salone è ora fotografico e la scena 3D è una resa piatta,
quindi la nave sembra il prototipo che interrompe il film. È il salto di
produzione che si vede per primo, e non si nasconde con HUD o bloom: va risolto
nella materia.

---

### 1 · La nave alla qualità del salone `[~]` — **strada scelta e misurata**

Il committente ha posto la barra: fotorealismo, e se il tempo reale non ci
arriva si cambia strada anche buttando il lavoro fatto. Quindi ho smesso di
tarare il WebGL e ho **misurato** se la strada offline regge, invece di
discuterne.

**Verdetto: regge.** Blender gira headless da riga di comando — nessun MCP di
mezzo, che con la connessione lenta è l'unica via praticabile — a **35 secondi
per fotogramma** su 760×470 con 130 campioni. Una sequenza di 40 fotogrammi
costa venti minuti.

**E la ricetta del metallo è trovata**, in quattro provini che si sono smentiti
a vicenda: Principled liscio dà CAD pulito · aggiungere rugosità e graffi dà
metallo *corroso* · meno intensità non basta · la stessa variazione **stirata
nel verso della lavorazione** dà acciaio tornito. Sta in
`riferimenti/blender/`, con le due immagini a confronto.

*Un rumore isotropo su un metallo si legge sempre come sporco. Lo stesso rumore,
stessa intensità, allungato nel verso della lavorazione si legge come superficie
lavorata.* Non è questione di quanto, è di che forma.

**La forma che ne discende**, ed è la grammatica del salone applicata alla nave:

- **fuori si fotografa.** Le battute in cui la nave si *guarda* diventano
  immagini generate da una sagoma renderizzata dal sito, così composizione,
  camera e orizzonte restano nostri;
- **dentro si renderizza.** Il meccanismo non può essere una fotografia, perché
  deve muoversi con la fisica. Diventa una **sequenza cotta in Blender indicizzata
  dall'angolo della pinna**: fotorealistica e comunque guidata dalla simulazione,
  perché è l'angolo a scegliere il fotogramma. Non è tempo reale — è *reattivo*,
  che è ciò che serve;
- **il taglio resta un disegno**, e lì va bene: il sito lo dichiara, *«The cut is
  not a picture»*.

Fatto: `[x]` provini di fattibilità e ricetta del metallo · `[x]` ambiente sui
soli materiali della nave (`scene.environment` raggiungeva anche l'acqua e
rompeva la giunzione) · `[x]` acqua che si schiarisce nel taglio.

**La catena funziona da capo a fondo**, e questo era il pezzo incerto:

    node strumenti/esporta-meccanismo.mjs meccanismo.json
    blender -b -P riferimenti/blender/cuoci.py -- meccanismo.json <cartella>

`[x]` la geometria si esporta **dalla pagina viva** — 73 pezzi, 4891 triangoli —
quindi c'è **una sorgente di verità sola**. La prima stesura riscriveva il
meccanismo in Python dalle quote di `nave.js`: funzionava, e alla prima modifica
delle ordinate le due sarebbero divergute in silenzio. `GLTFExporter` non serve
e non funziona: importa `three` con un nome nudo, e nel bundle three è inglobato
nei chunk. Serializzare a mano costa venti righe e non dipende da niente.

`[x]` Blender la ricostruisce con la ricetta del metallo e rende in 12–14 s.

`[x]` **l'ambiente c'è, ed era la cosa che mancava.** Con `metalness: 1` un
metallo mostra *soltanto* ciò che riflette: contro un gradiente piatto riflette
una tinta, e usciva verde acqua. Con un HDRI d'officina il materiale diventa
fotografico — acciaio vero, ottone vero, riflessi con una forma.

*Avevo escluso gli HDRI per una ragione giusta applicata al posto sbagliato:*
pesano 1–2 MB contro un budget di 500 KB. Vero **per il web**. Qui non si
spedisce l'ambiente, si spediscono i **fotogrammi cotti**: l'HDRI resta sul disco
e la pagina non cambia di un byte.

**Ma il divario vero non era il materiale: è la geometria.** Alla misura giusta
i pezzi si leggono *separati* — motore staccato dal riduttore, albero che
galleggia, manovella su un tavolino a parte. Non è un difetto di resa: **quella
geometria è uno schema, non una macchina.** È distanziata apposta perché in
sezione si capisca chi fa cosa. Un attuatore vero è un blocco compatto,
imbullonato, con tubazioni e cablaggi.

Quindi la conclusione, ora misurata invece che supposta, è la stessa della nave:
dove il meccanismo si **guarda** serve una fotografia generata dalla sagoma;
dove si **taglia**, lo schema è giusto — il sito lo dichiara, *«The cut is not a
picture»*.

`[ ]` cuocere la sequenza indicizzata dall'angolo · `[ ]` montarla al posto della
scena in tempo reale nelle battute del meccanismo.

**Un difetto chiuso a metà, e va detto.** Metà scafo era nera perché le due mesh
— faccia esterna e faccia interna — disegnano *gli stessi triangoli*: con la
doppia faccia sono la stessa superficie, quindi vince l'una o l'altra, mai
entrambe. Non è tarabile, è una contraddizione di progetto. Per ora la doppia
faccia tiene lo scafo intero e la cavità della sezione resta chiara: difetto
minore di mezza nave nera. Sparisce del tutto quando il meccanismo passa alla
sequenza cotta.

### 2 · Il telefono, progettato come versione diversa `[ ]`

Non basta spostare `object-position`. L'inquadratura è composta in orizzontale —
mare a sinistra, persone a destra — e su uno schermo verticale una delle due
sparisce. Verificato: a schermo stretto si vede solo il mare.

- [ ] a schermo stretto l'apertura inquadra **la metà destra**, le persone, e il
      mare resta la fascia sopra la linea;
- [ ] orizzonte sempre visibile, persone sempre leggibili;
- [ ] interruttore raggiungibile col pollice;
- [ ] misure vere quando il sito è pubblico: LCP ≤ 2,5 s · INP ≤ 200 ms ·
      CLS ≤ 0,1 al 75º percentile.

### 3 · Il salone senza trucchi `[ ]`

La dissolvenza fra due clip è una **sovrapposizione** per tre decimi di secondo:
due corpi in posizioni diverse mescolati. La forma giusta è quattro segmenti —
`calma-loop`, `si-puntellano`, `tesi-loop`, `si-rilassano` — così il gesto è un
movimento invece che una mescolanza. Costa due generazioni, e stasera quattro su
sei sono state bocciate.

- [ ] i due segmenti di transizione;
- [ ] il tumbler che diventa calice fra le due clip: nessuna delle sei
      generazioni ha tenuto lo stesso bicchiere per dieci secondi;
- [ ] cancello nuovo: trenta secondi registrati, zero fotogrammi con fantasma,
      cucitura o arredo che cambia.

Già misurato e **non** difettoso, contro quanto riportato in revisione: gli
angoli sono coperti (145 px di margine a 12°) e lo stacco del ciclo vale 2,70
contro un movimento naturale di 2,00–3,91.

### 4 · La linea ovunque `[ ]`

Il sito ha un'idea sola e la fa vedere nel titolo di apertura e basta.

- [ ] ogni titolo di sezione attraversa la linea;
- [ ] `#fattura` e `#offerta` non possono restare colonne di testo con lo
      schermo mezzo vuoto: ogni affermazione forte compare due volte, sopra
      nel registro commerciale e sotto in quello tecnico.

### 5 · `#offerta` operativa `[ ]`

Oggi dice «il CAD del componente, semplificato o no»: un produttore la legge e
non capisce se ho mai visto un suo file.

- [ ] quale formato (STEP, IGES, Parasolid, e cosa succede se arriva un nativo);
- [ ] quali grandezze servono per far girare la fisica;
- [ ] chi deve stare nel progetto dal lato regulatory, e cosa decide;
- [ ] in quanto tempo.

**È l'unica cosa che un cliente vero avrebbe dato e che si può dare senza
averlo.**

### 6 · L'atto due `[ ]` — non lo comincio da solo

Cambia la struttura del sito ed è lavoro di settimane. La specifica è in
`docs/13`. L'arco che regge, e il punto 7 è quello che mancava:

promessa → conseguenza umana → domanda → rivelazione → causa fisica →
fallimento controllato → **ritorno alle persone** → chiusura commerciale.

*Se finisce su una tabella tecnica resta una demo ingegneristica. Se finisce sul
benessere che quel meccanismo rende possibile, diventa una storia.*

Il numero che serve al finale, `S.rollioNudo`, esiste già ed è collaudato.

---

## Questioni aperte

**Due cancelli danno esiti diversi su macchine diverse.** Una revisione esterna
riporta `collaudo-posa` rosso («non trova `#stab-salone`») e
`collaudo-impaginato` rosso con 8 sovrapposizioni, allo stesso commit in cui qui
sono entrambi verdi. L'elemento esiste in `index.html` e i cancelli passano sul
Chrome di sistema. Non riesco a riprodurre il rosso — qui il chromium di
Playwright non è installato.

**Un cancello verde da uno e rosso da un altro non vale niente**, quindi la
questione resta aperta e non la chiudo dichiarando che uno dei due ha torto.
`CHROMIUM=1` ora forza il browser interno, così la differenza si può riprodurre
invece che discutere. Chi ha entrambi i browser: eseguili nei due modi e scriva
qui cosa cambia.

---

## Il rischio numero uno

Questo repository ha decine di migliaia di righe di analisi e un sito che
**nessuno ha ancora aperto**. Il rischio non è costruire male: è documentare
invece di finire.

Regola per me e per chi segue: **nessuno strumento nuovo che non paghi il suo
costo prima della fine della sessione in cui lo scrivo.** Stasera
`collaudo-filmato` ha bocciato quattro clip su sei e ci ha portati a quella
buona — quello si è ripagato. Lucidare le intestazioni dei cancelli no.
