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

### 1 · L'impianto — **la specifica è `docs/14-FOTOREALISMO.md`** `[~]`

Questa sezione non descrive più il lavoro: lo fa `docs/14`, che è vincolante e
sostituisce quanto c'era qui. In particolare sostituisce due cose che avevo
scritto io e che erano **false**:

- che le quote del leveraggio governassero la fisica. Non lo fanno: `RL`, `RC`,
  `LB`, `CY`, `CZ` non compaiono in `simulazione.js`, dove il rollio dipende da
  `W`, `ZETA`, `K`, `C0`, `A_STALLO`, `A_MAX`, `RESIDUO`. Presentare come
  vincolato dalla fisica ciò che è solo coerente visivamente è la stessa specie
  di errore dei cinque metri già rotti;
- il tetto di 500/900 KB, che non è un fatto: si decide sul primo GLB integrato
  e su un Android reale.

**E la decisione presa**: il quadrilatero manovella–biella–leva viene eliminato.
Al suo posto un attuatore elettrico generico con riduttore cicloidale dentro un
carter sigillato, e il taglio che lo apre diventa la rivelazione.

**La prossima consegna ammessa è un GLB grezzo dentro il sito**, non un altro
piano. `[~]` in corso.

### 1bis · Il registro di cosa e' uscito

- `[x]` **il quadrilatero manovella–biella–leva**, 99 righe piu' `profiloPinna`
  e `asta`, e le costanti `RL RC LB CY CZ`. Sostituito da `impianto.glb` nello
  stesso commit in cui il GLB entra, come vuole `docs/14` §2.
- `[x]` **`strumenti/collaudo-quote.mjs`**, scritto un'ora prima su richiesta di
  una revisione e **rimosso subito dopo**, ed è giusto così: verificava che due
  descrizioni della stessa macchina coincidessero. Con una sola fonte geometrica
  non c'è più niente da allineare, e il §2 lo dice — *«non si mantengono due
  modelli con un collaudo che tenta di tenerli allineati»*.

  Va detto perché sembra una contraddizione e non lo è: il cancello era giusto
  **finché** i modelli erano due. Ed era già passato una volta dal falso al
  vero — la prima stesura sosteneva di proteggere la fisica, e non era vero.
  *Un cancello che protegge qualcosa che non esiste più è peggio di nessun
  cancello: passa sempre verde e insegna che verde non significa niente.*

### 2 · Il telefono `[~]`

**Il rilievo era vecchio.** «A schermo stretto si vede solo il mare» valeva per
la composizione precedente — quella con la fascia di finestrini. Con la
fotografia nuova il telefono mostra **entrambi i mondi**: misurato a 390×844,
apertura piena, nessuno scorrimento laterale, interruttore a 774 px dall'alto,
cioè sotto il pollice.

- `[x]` l'apertura deborda del 32% invece di stare dentro la finestra: prima
  lasciava 400 px di carta vuota sopra e riduceva le persone a due macchie.
  La fotografia ha gli estremi sacrificabili — mare aperto a sinistra, fondo
  della stanza a destra — e il centro porta montante e persone;
- `[x]` il ritaglio è spostato verso le persone (−61% invece di −50%): il
  debordamento simmetrico tagliava fuori la donna, cioè metà della coppia;
- `[ ]` la donna resta al bordo. Un'inquadratura dedicata al verticale la
  recupererebbe del tutto;
- `[ ]` misure vere quando il sito è pubblico: LCP ≤ 2,5 s · INP ≤ 200 ms ·
  CLS ≤ 0,1 al 75º percentile, e frame rate su un Android reale — che
  `docs/14` §9 mette come punto in cui **si decide il tetto** del modello.

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
