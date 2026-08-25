# Riferimenti — il repertorio

Ricerca sui siti premiati e sulle tecniche che li fanno funzionare. **40 schede
di sito** e **33 documenti tematici**, scritti fra il 12 e il 13 agosto 2026
leggendo il codice dei siti, non le loro pagine "about".

Ogni scheda è scritta perché **un'altra intelligenza artificiale possa sapere
tutto di quel sito senza navigarci**. La struttura è fissa: vedi
[`tecnica/_MODELLO.md`](tecnica/_MODELLO.md).

---

## Perché sta qui, e cosa serve a questo progetto

Il piano (`docs/06-SEQUENZA-D-ORO.md`) prevede un **confronto alla cieca** con
vincitori SOTD, SOTM e SOTY prima della candidatura. Il repertorio contiene già
le schede di quasi tutti i termini di paragone che servono:

| scheda | perché conta per Nautica |
|---|---|
| [`lando-norris`](siti/lando-norris.md) | Site of the Year 2025, **8,18**. È il metro numerico di tutto il piano |
| [`messenger-e-bruno-simon`](siti/messenger-e-bruno-simon.md) | Bruno Simon è il precedente del sito autoprodotto che vince il SOTY |
| [`lusion`](siti/lusion.md) | SOTY 2023, sito dello studio di sé stesso, 10 nelle animazioni |
| [`noomo`](siti/noomo.md) | SOTY 2023, altro autoprodotto |
| [`igloo`](siti/igloo.md) · [`dont-board-me`](siti/dont-board-me.md) · [`opal-tadpole`](siti/opal-tadpole.md) | SOTY 2024. Opal Tadpole ha vinto partendo da 7,52 |
| [`active-theory`](siti/active-theory.md) | il riferimento del 3D real-time sul web aperto |
| [`immersive-garden`](siti/immersive-garden.md) · [`resn`](siti/resn.md) · [`locomotive`](siti/locomotive.md) · [`obys`](siti/obys.md) | il livello immersivo corrente |
| [`simply-chocolate`](siti/simply-chocolate.md) | uno dei due SOTY senza Developer Award |

Le altre trenta servono come repertorio di soluzioni: si cerca il problema, non
il sito.

## I tematici, per problema

**Se stai lavorando sul 3D** → [`_WEBGL-TECNICHE`](tecnica/_WEBGL-TECNICHE.md)
(97 KB, il più corposo), [`_PRESTAZIONI`](tecnica/_PRESTAZIONI.md),
[`_MOBILE`](tecnica/_MOBILE.md), [`_CANVAS-E-GOOGLE`](tecnica/_CANVAS-E-GOOGLE.md)
— quest'ultimo sul problema vero di un sito a canvas: cosa vede un motore di
ricerca quando il contenuto è disegnato.

**Se stai lavorando sul design** → [`_TIPOGRAFIA`](tecnica/_TIPOGRAFIA.md),
[`_COLORE`](tecnica/_COLORE.md),
[`_ANIMAZIONE-TESTO`](tecnica/_ANIMAZIONE-TESTO.md),
[`_TRANSIZIONI-DI-PAGINA`](tecnica/_TRANSIZIONI-DI-PAGINA.md),
[`_PRELOADER`](tecnica/_PRELOADER.md) (93 KB: il brief dice *niente preloader
che conta fino a cento*, e qui c'è il perché).

**Se stai lavorando sulla Usability** — che pesa il 30% ed è dove il sito
dell'anno prende 7,90 → [`_ACCESSIBILITA`](tecnica/_ACCESSIBILITA.md) (68 KB),
[`_MOBILE`](tecnica/_MOBILE.md), [`_PRESTAZIONI`](tecnica/_PRESTAZIONI.md).

**Se stai cercando come è fatto un effetto** →
[`_SORGENTI-COMPLETI`](tecnica/_SORGENTI-COMPLETI.md),
[`_SOURCEMAP-SWEEP`](tecnica/_SOURCEMAP-SWEEP.md),
[`_CODICE-PUBBLICO-1..3`](tecnica/_CODICE-PUBBLICO-1.md),
[`_REPO-AWWWARDS`](tecnica/_REPO-AWWWARDS.md),
[`_REPO-STUDI`](tecnica/_REPO-STUDI.md),
[`_LIBRERIE-DEGLI-STUDI`](tecnica/_LIBRERIE-DEGLI-STUDI.md).

> **Il codice senza licenza si studia e non si copia.** Vale come regola di casa
> e come requisito di candidatura: design e sviluppo devono essere interamente
> di chi sottomette. Si prende la **meccanica**, non l'implementazione — e
> nemmeno l'estetica, che copiata si vede.

**Se stai lavorando sui premi** → [`_PREMI`](tecnica/_PREMI.md),
[`_CASO-STUDIO`](tecnica/_CASO-STUDIO.md),
[`_PRESENZA-PUBBLICA`](tecnica/_PRESENZA-PUBBLICA.md) — quest'ultimo è
direttamente collegato alla mossa **M7**, la rete su Awwwards, che oggi è il
rischio più grande del progetto e non è tecnico.

---

## `velocity/` — l'unico 3D real-time di produzione dello studio

Non è materiale di ricerca: è un progetto vero, e i due documenti qui sono
quelli che la skill `stack-sito-immersivo` cita.

- [`PIANO_FOTOREALISMO.md`](velocity/PIANO_FOTOREALISMO.md) — il fotorealismo
  WebGL in pratica: tone mapping, PMREM, clearcoat, luci ad area, post.
- [`CARROZZERIA_FAIRNESS.md`](velocity/CARROZZERIA_FAIRNESS.md) — come si
  misura una superficie senza mentire a sé stessi. È la fonte del capitolo sulle
  trappole di misura.
- [`strumenti/guardia.mjs`](velocity/strumenti/guardia.mjs) — il processo in
  ascolto che **esce con errore al primo guasto**, invece di restituire una
  statistica. Il modello di ogni strumento di misura di questo progetto.
- [`strumenti/canarino.mjs`](velocity/strumenti/canarino.mjs) — il controllo che
  smaschera una maschera che sta misurando il riempimento invece del soggetto.
  Costa venti righe ed evita giornate.

---

## `tripo/` — generare modelli 3D da riga di comando

Documentazione della CLI Tripo: 15 file del fornitore (`tripo-cli@0.2.0`, MIT)
più i nostri appunti di lavorazione. **Nessuna chiave dentro** — verificato
passando una ripulitura che non ha modificato un solo byte, il che dimostra che
non c'era niente da rimuovere.

Prima di usarla su questo progetto si legge [`tripo/NOTA.md`](tripo/NOTA.md), che
spiega perché di norma **non** va usata: D19 chiede asset originali, e su
*velocity* un modello generato da poche viste aveva le **normali ondeggianti**.
Qui lo scafo è l'estrusione di una curva, ed è quella proprietà che rende esatta
la faccia del piano di sezione. Resta utile per provini di forma buttati via
subito.

---

## Cosa NON è stato pubblicato, e perché

Il repertorio originale contiene anche la **strategia commerciale dello studio**:
tariffe, preventivo campione, posizionamento, elenco di prospect, comportamento
del mercato locale.

**Diciannove documenti tematici, più due file cumulativi e due che ne citavano
le cifre, sono stati esclusi.** Non per riservatezza generica: su un repository
pubblico quel materiale lo leggono anche i clienti a cui il preventivo va
presentato, e i concorrenti che lavorano sulla stessa piazza.

Quello che resta è **tecnico e di design**: analisi di siti pubblici, tecniche,
misure. Utile a chiunque, dannoso per nessuno.

Sono stati inoltre rimossi un file che aggregava tutto — e che quindi rimetteva
dentro gli esclusi — e redatto il frammento di una chiave di terzi osservata
ispezionando il traffico di un sito.

## Un avvertimento sull'età

Questa ricerca è del **13 agosto 2026**. Le schede descrivono i siti com'erano
allora: alcuni saranno cambiati, e i numeri di prestazione vanno rimisurati
prima di essere citati. Vale la regola di `docs/04-MISURE.md` — **un metro
rotto non dà errore, dà un numero** — e un numero vecchio è un metro rotto.
