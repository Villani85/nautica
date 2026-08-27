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

### 1ter · La notte del 26-27 agosto — cosa è cambiato davvero `[x]`

**L'impianto è integrato, dettagliato e compresso.** 1686 KB → 223 KB con
meshopt, misurato contro Draco (236 KB + 251 KB di decodificatore contro 223 +
28). I 44.000 triangoli restano: per la GPU non erano mai stati un problema,
era solo il trasferimento.

**Tre numeri dichiarati che la geometria non rispettava**, tutti dello stesso
genere — un valore plausibile che nessuno confronta con niente:

| dichiarato | disegnato | come si nascondeva |
|---|---|---|
| eccentricità 12 mm | 0,5 mm | «misurata» dal `boundingSphere` di un disco costruito **centrato sull'asse**: restituiva l'asimmetria dei 29 lobi. Finita, plausibile, mai zero, quindi nessun ripiego scattava |
| apertura pinna 1,50 m | 1,68 m | la riga che la stampava faceva `mx[0] - 0.18` — il massimo X di *qualunque* oggetto meno una costante. Tornava per aritmetica |
| area pinna 2,20 m² | ~0,7 m² | nessuno aveva mai integrato il profilo. Ora la corda si **ricava** dall'area, sulle stesse stazioni con cui la mesh è costruita |

**Due cancelli nuovi, e fanno due domande diverse.** `collaudo-glb.mjs` legge il
file: nomi, geometria sotto ogni nodo, unità, apertura dal piano del fasciame,
area contro il rettangolo che contiene la pinna, e se l'orbita dichiarata sia
abbastanza grande da **vedersi**. Rotto apposta quattro volte: li becca tutti e
quattro. `collaudo-cinematica.mjs` guarda il sito che gira — rapporto osservato
29,00 esatti in tre punti del capitolo — e ha insegnato tre cose scritte in
testa al file, di cui una vale oltre questo progetto: **confrontare il moto con
il numero dichiarato è circolare**, e il cancello passava su un riduttore che
orbitava di un millimetro.

**La nave.** Aveva un livello solo: due `BoxGeometry` alte 1,8 m su 15,5. Ora i
due ponti superiori, la coperta in teak, la murata, la battagliola, l'hard-top e
l'albero arrivano da Blender (58 KB compressi), appoggiati al cavallino **vero**
letto da `ordinate.js` e passato a Blender da `strumenti/esporta-coperta.mjs` —
non ricopiato. La tuga del ponte principale resta nel sito perché dentro ha
un'**apertura vera**, ed è da lì che si vedono il salone e l'orizzonte.

E lo scafo non è più acciaio grezzo: `metalness 0.42 / roughness 0.44` è la
ricetta di una lamiera non trattata. La vernice non è un conduttore. Ora è
lucido e **riflette la linea dell'orizzonte su se stesso**, che è la tesi del
sito applicata alla carena. Con finestre di murata e fascia al galleggiamento
dipinte nel materiale, perché le UV non ci sono ancora.

**Le ombre**, che non c'erano affatto: con tre ponti sovrapposti la scena
leggeva come carta ritagliata. Una sola luce proietta — due ombre su una barca
al sole sono il primo indizio che la scena è finta.

**La continuità, su richiesta esplicita** («non devono essere scene separate»,
«come se andassi giù nella barca»). La causa non era la regia: ogni sezione
dipingeva lo spacco su **se stessa**, e `.atto--salone` è alta 220svh, quindi la
sua linea cadeva a 110svh. Ora lo spacco è uno strato fisso dietro tutta la
pagina, i due capitoli si sovrappongono di uno schermo, e l'apertura del salone
**sale** negli ultimi metri: chi guarda sprofonda, e la nave che emerge è la
stessa discesa vista da fuori.

**Un difetto vecchio trovato per strada**, e non era di stanotte:
`document.querySelector('.palco')` in `demo.js` restituiva il palco del
**salone**, che nel DOM viene prima. Da sempre la regia scriveva `data-battuta`
sull'elemento sbagliato, quindi tutte le regole che nascondono i pannelli
durante il taglio non hanno **mai** funzionato. Non si vedeva come un errore: si
vedeva come una cosa che non succedeva mai.

**Cosa resta aperto, e va detto:**

- il tone mapping non è ancora deciso **misurando** (Mossa A del piano). Con
  ambiente, ombre e uno scafo a rugosità 0,13 le alte luci possono tagliare, e
  finché non si campionano carta, linea e coperta con e senza ACES è
  un'ipotesi;
- lo scafo non ha UV né mappe cotte: la variazione di rugosità — l'indizio
  numero uno di §7 — è ancora costante. Debito dichiarato, non nascosto;
- i tre filmati del mare (`mare-calmo/formato/duro`) non ci sono: il contratto
  «mare → rollio → risposta meccanica» resta incompleto a monte;
- la figura al bordo su telefono.

---

### 1quater · La scena e' una sola — 27 agosto, notte `[x]`

**Il difetto bloccante di due revisioni consecutive è chiuso.** Il sito apre
seduti nel salone, dentro la stessa scena 3D che poi diventa la nave e il
meccanismo: un canvas, un renderer, una camera, un mare, un integratore,
dall'inizio alla fine. `#salone` non è più una sezione — è la prima battuta
della dimostrazione.

`?doppia=1` riporta alla vecchia architettura. Resta finché la nuova non ha
girato su un telefono vero, ed è anche ciò che permette al cancello di
dimostrare di funzionare: `collaudo-continuita --doppia` **fallisce**.

**Cosa è servito, e nessuna delle cose era prevista:**

| | perché |
|---|---|
| la tuga da 1,80 a 2,35 m | un ponte da 1,80 non è abitabile, e un'inquadratura 16:10 alta così sarebbe larga tre metri e mezzo: la fotografia del salone non ci stava. Non era posizionamento, era quota |
| montanti sui fianchi | erano sbarre che attraversavano la stanza da murata a murata. Da fuori non si vedeva: da fuori se ne vede solo l'estremità nel finestrino |
| pareti, coperta, allestimento e fuoribordo spenti da dentro | sono la rappresentazione **esterna** del salone. Da dentro sono mobili in mezzo al fotogramma e una feritoia da cui guardare il mondo |
| il mare ritagliato | è grande 1,55× perché ruotando scopre gli angoli, ma quel di più non deve vedersi. Nel DOM lo ritagliava `overflow:hidden` |
| la distanza ricavata dal campo | né «contieni» né «riempi»: su telefono l'immagine deborda del 32%, come già decideva la versione in DOM |

**Tutte trovate col raggio di `?ispeziona=1`**, che risponde col nome e il
colore di ciò che sta davanti. Nessuna si sarebbe trovata rileggendo il
codice — due le avevo già rilette senza vederle.

### La CI era rossa da undici commit, e la colpa era mia

Il sito non si pubblicava. La catena `npm run collaudo` ha smesso di essere
solo aritmetica quando ci è entrato il primo cancello che apre un browser, e
il workflow installava Chromium **nello step successivo** — che non viene mai
raggiunto quando quello prima fallisce.

Da lì una catena di guasti che si nascondevano a vicenda, e ognuno insegna
qualcosa che vale oltre questo repo:

| guasto | perché non si vedeva |
|---|---|
| browser installato dopo i collaudi | in locale c'è il Chrome di sistema |
| WebGL spento senza GPU | da Chrome 138 SwiftShader va chiesto con `--enable-unsafe-swiftshader`; qui la GPU c'è |
| ffmpeg non c'è più sui runner | l'errore diceva «file inesistente» e quel file era il **programma** |
| i font non erano arrivati | il cancello misurava il ripiego di sistema e chiamava traboccamento un problema di caricamento |

**Tre di questi quattro dicevano la conseguenza invece della causa.** È il
motivo per cui adesso ogni cancello è uno step con il suo nome — il nome È la
diagnosi — e per cui i referti escono come annotazioni: il riepilogo del
lavoro non è esposto dall'API pubblica, le annotazioni sì, e senza token
quello è l'unico canale.

---

### La domanda aperta che va decisa a mente fresca

**In che verso si attraversa.** Oggi la camera parte dal salone ed **esce**:
salone → fuori → nave intera → taglio → meccanismo. Viene dalle tue parole —
«da qui quando farò scroll è come se andassi giù nella barca» — e tiene la
tesi, perché la riduzione del rollio si dimostra guardando la nave da fuori.

Una revisione sostiene il contrario: esterno → apertura dello scafo →
meccanismo → **ingresso** nel salone, e dice che l'uscita non deve diventare
definitiva «per inerzia tecnica». Ha ragione sul metodo: non l'ho scelto, l'ho
ereditato dall'ordine delle sezioni.

Le due versioni non costano lo stesso: l'inversione è mezza giornata, non
un'ora, perché il salone diventerebbe il finale e le battute vanno riscritte.
**Non la faccio senza che tu abbia visto questa.**

### I cancelli nuovi, e cosa impediscono

- **`collaudo-continuita`** — beccheggio nullo (l'invariante vero: una camera
  livellata mette l'orizzonte a metà schermo da qualunque quota), nessun salto
  della camera, **identità** di tela/scena/camera/renderer, zero `<video>`
  visibili, e gli errori di shader che `npm run build` non può vedere. Rotto
  apposta in tre modi;
- **`peso --scrivi`** — i numeri pubblicati li scrive la misura. Ha già preso
  un mio commit un'ora dopo averli resi veri;
- **`collaudo-glb`** — ora copre anche la sovrastruttura, e **dichiara cosa
  non controlla**: il verso delle normali, che da qui vorrebbe dire
  decodificare meshopt. La difesa sta nel builder.

### Cosa resta aperto, in ordine di peso

1. **Il pass PBR.** UV e mappe cotte per vernice, vetro, metallo. Oggi teak e
   finestre sono disegnati nello shader in coordinate oggetto — costa zero e
   regge la media distanza, ma **non regge un primo piano**. È il rilievo che
   separa «geometria nautica» da «fotorealismo»;
2. **Il salone è un piano.** In un primo piano si legge «schermo dentro la
   nave», non «stessa stanza». Serve o profondità (parallasse, strati) o una
   transizione materica che renda onesta la sua natura bidimensionale;
3. **Il telefono vero.** Fotogrammi, memoria e temperatura. Il livello
   d'ombra ora scende a 1024 su schermo piccolo, ma è una prudenza, non una
   misura;
4. **I tre filmati del mare.** Senza, il contratto «mare → rollio → risposta»
   resta incompleto a monte.

---

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
