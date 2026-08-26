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

### 1 · L'IMPIANTO IN 3D, MUOVIBILE DAL SITO `[~]`

**Cosa deve essere**, deciso col committente: non fotogrammi cotti, ma **il
modello vero che si gira e si muove dal sito** — l'impianto intero, tutto uno di
seguito all'altro:

    quadro → cavo → motore → riduttore → giunto → supporto → albero
           → attraversamento carena → radice → pinna

L'occhio segue la catena della causa dal comando fino all'acqua senza saltare, e
non è una scelta di composizione: **è la tesi del sito resa geometria.** Il pezzo
che vale sta sotto, e ci si arriva seguendo il filo.

#### La regola che non si negozia

**Le quote da cui dipende la fisica non si toccano**: raggio dell'albero,
apertura e corda della pinna, braccio della leva, posizione di flangia e
premistoppa, attacco sul ginocchio di carena. Sono quelle che `simulazione.js`
usa per calcolare la riduzione. Cambiarle per far sembrare il pezzo più bello
vorrebbe dire che **il numero dichiarato non si riferisce più a ciò che si
mostra** — la bugia peggiore possibile in un sito la cui tesi è l'onestà
tecnica. Nei file sono marcate `VINCOLATA`, una per una.

#### I passi, in ordine, con il criterio che li chiude

- `[~]` **1.1 · il modello completo in Blender.** Tutti i pezzi della catena,
  con bulloneria, nervature, pressacavi, tubi. *Chiuso quando:* un render a
  1400 px si legge come una fotografia di un impianto, non come un modello.
- `[ ]` **1.2 · il peso, misurato PRIMA di costruire le mappe.** Il budget è
  500 KB per tutto il 3D, e la pagina porta in riga «3D models downloaded:
  0 bytes». Due giri fa avevo scartato gli HDRI perché pesano — poi ho deciso di
  cuocere i fotogrammi, e l'argomento del peso è caduto; ora che si spedisce un
  modello vero **è tornato valido**. Va misurato prima, non scoperto dopo.
- `[ ]` **1.3 · le mappe cotte.** Occlusione ambientale, rugosità e normali
  cotte nelle texture. È il passo che porta il tempo reale vicino al render:
  l'ombra fra le nervature e dentro i fori non si calcola dal vivo, **è già
  dipinta**. *Chiuso quando:* il modello in three.js con le mappe è
  indistinguibile dallo stesso modello in Cycles a camera ferma.
- `[ ]` **1.4 · esportazione glTF compressa.** Meshopt o Draco, texture in
  KTX2. *Chiuso quando:* sta sotto i 900 KB — il sito porta in pagina la riga
  «3D models downloaded: 0 bytes» e quella riga andrà cambiata, non nascosta.
- `[ ]` **1.5 · il caricamento in three.js** con ambiente PMREM e tone mapping.
  *Chiuso quando:* la giunzione fra fondo CSS e canvas resta a 0 px — è l'unica
  idea meccanica del sito e nessun modello la può rompere.
- `[ ]` **1.6 · il movimento lo comanda la simulazione.** `S.pinna` guida
  albero, leva e pinna con la cinematica vera, non un'animazione registrata.
  *Chiuso quando:* nessuna riga forza una posa — l'angolo viene dalla fisica, e
  un cancello lo verifica come già fa `collaudo-fantasma` per il rollio nudo.
- `[ ]` **1.7 · si gira col trascinamento**, e da telefono con lo stesso esito
  anche se non con lo stesso gesto.

#### Cosa il tempo reale non darà, detto prima

Illuminazione globale e profondità di campo restano di Cycles. Su un meccanismo
scuro su fondo scuro il divario è **piccolo**, perché il metallo è quasi tutto
riflessi e quelli l'ambiente li dà bene. Su una scena intera no. È il motivo per
cui la nave *fuori* resta fotografica e il meccanismo *dentro* diventa modello.

#### E il vincolo `VINCOLATA` ora ha un cancello

`[x]` `strumenti/collaudo-quote.mjs` legge le quote dalle **due** sorgenti — il
sito e i file Blender — e le confronta. Se divergono, rosso, con scritto *«la
riduzione che il sito dichiara è calcolata con X, il modello mostra una macchina
con Y: sono due macchine diverse»*.

Lo ha trovato una revisione esterna, ed era il rilievo migliore ricevuto finora:
**`VINCOLATA` era un commento, e un commento non è un cancello.** Il difetto non
darebbe errore da nessuna parte — il quadrilatero continuerebbe a funzionare, il
render uscirebbe più bello, e la riduzione dichiarata si riferirebbe a una
macchina diversa da quella disegnata. Nessun collaudo esistente lo prendeva.

Rotto apposta prima di fidarsene: `RL` da 0,22 a 0,26 → uscita 1. Ripristinato →
uscita 0.

#### Quello che è già in mano

`[x]` Blender headless, 2 minuti a fotogramma · `[x]` la ricetta del metallo,
misurata in quattro provini · `[x]` l'esportatore che prende la geometria **dalla
pagina viva**, una sorgente di verità sola · `[x]` gli assi della carena, che la
prima stesura aveva sbagliati.

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
