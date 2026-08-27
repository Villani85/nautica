# 24 — GLI INTERRUTTORI DI PROVA, VERIFICATI

Il sito ha una manciata di interruttori nella query string. Sono documentati
nei commenti, uno per uno, e **nessuno li collauda**. Un interruttore
diagnostico che non funziona più è peggio di uno che non c'è: si usa per
misurare, e quello che misura è sbagliato in silenzio.

Questo documento li verifica **uno alla volta, dal vivo**, e per ognuno dice
tre cose: cosa dichiara il commento, cosa fa davvero misurato in pagina, e cosa
succede con un valore che nessuno ha previsto.

**Come sono stati misurati.** Browser Chromium di Playwright via
`strumenti/browser.mjs` con `CHROMIUM=1`, contro il `npm run preview` già acceso
su `http://localhost:5180/nautica/` — quindi contro `dist/`, non contro i
sorgenti. Ogni misura è una grandezza letta dalla pagina (una dimensione di
mappa d'ombra, una chiave di programma, la quota della nave, un `currentTime`
che avanza), mai una lettura del codice.

**Attenzione a una cosa sola:** il `dist/` collaudato è stato costruito alle
14:31 e in quel minuto altri lavori toccavano ancora i sorgenti. Gli
interruttori qui sotto sono tutti presenti nel bundle servito — è stato
verificato — ma se un sorgente cambia bisogna ricostruire prima di rifare
queste misure.

---

## Il quadro, in una riga per interruttore

| interruttore | verdetto |
|---|---|
| `?ispeziona=1` | **funziona** — espone `window.__nautica` con 13 voci, non solo le tre dichiarate |
| `?doppia=1` | **funziona ancora, per intero** — vecchia architettura viva, video che girano, stato condiviso |
| `?ridotto=1` | **funziona** — accende `sim.S.ridotto`, che è ciò che riduce la forzante a un terzo |
| `?ombre=0\|1024\|2048` | **funziona, ed è l'unico validato** — valore fuori elenco: avviso in console e ripiego automatico |
| `?materia=0` | **funziona** — la lavorazione non viene più iniettata in nessuno dei 7 materiali |

E un difetto comune a tutti tranne `?ombre`: **il confronto è una sottostringa
della query string intera**, quindi `?doppia=0` accende `doppia`, e
`?ispezionaXY=9` accende `ispeziona`. Nessuno di questi è il valore che il nome
dell'interruttore promette.

---

## 1 · `?ispeziona=1` — la finestra sulla scena

**Cosa dichiara.** `src/scena/index.js:694-711`: *«Con `?ispeziona=1` la scena,
la camera e il renderer finiscono su `window.__nautica`. Serve a puntare un
raggio contro un pixel e farsi dire QUALE oggetto c'è lì.»*
`src/scena/guasto.js:24-28` ne dichiara un secondo effetto: l'annotazione dei
guasti *«cambia registro»* — senza l'interruttore dice la frase per il
visitatore, con l'interruttore aggiunge sotto il messaggio d'errore per intero.

**Cosa fa davvero.** Funziona, e dà più di quanto dichiara. Con
`?ispeziona=1`, aspettando che la dimostrazione entri in campo,
`window.__nautica` compare con **tredici** voci:

```
azimut, camera, chi, fotogrammi, impiantoDati, impiantoEccentricita,
impiantoRapporto, nave, ombre, render, scena, stato, tugaPareti
```

`chi(u, v)` è una funzione e risponde: al centro dello schermo, in cima alla
pagina, restituisce `#ffffff a 1,30` — la fotografia del salone dentro la tuga.
`ombre` riporta il livello di ombra effettivamente in uso (2048 su questa
macchina). `stato` è la simulazione viva, con dodici campi fra cui `rollio`,
`rollioNudo`, `picco`, `riduzione`, `ridotto`.

Una quattordicesima voce, `guasti`, si aggancia **solo se c'è un guasto**
(`guasto.js:190-193`): nelle prove non ne è comparso nessuno, e la sua assenza
è un buon segno, non un difetto dell'interruttore.

Da sapere per usarlo: `window.__nautica` **non esiste al caricamento**. La
scena nasce quando la dimostrazione entra in campo, e con il rendering software
di un browser senza GPU può volerci più di venti secondi. Chi legge la sonda
subito dopo `load` misura un `undefined` e conclude che l'interruttore è rotto:
è successo due volte durante questa verifica. Si aspetta
`waitForFunction(() => !!window.__nautica)`, non un timeout.

**Validazione: nessuna.** Il confronto è `location.search.includes('ispeziona')`.
Misurato:

| query | `window.__nautica` |
|---|---|
| `?ispeziona=1` | **sì** |
| `?ispeziona=0` | **sì** — il valore non viene guardato |
| `?ispeziona` | **sì** |
| `?ispezionaXY=9` | **sì** — un altro parametro che comincia per «ispeziona» |
| `?altro=ispeziona` | **sì** — la parola nel *valore* di un altro parametro |
| `?ispezion=1` | no |
| nessun parametro | no |

Per una sonda diagnostica il danno è piccolo: al massimo si accende quando non
serviva. Vale la pena saperlo perché **la stessa forma di confronto la usano
`?doppia` e `?materia`**, dove il danno non è piccolo.

---

## 2 · `?doppia=1` — la vecchia architettura a due scene

Due revisioni ne chiedono l'eliminazione, e per decidere serve sapere se è
ancora vivo. **Lo è: non c'è la scorciatoia della decisione facile.**

**Cosa dichiara.** `src/regia.js:24-33`: *«Prima il sito aveva due atti in due
sezioni: un salone in DOM e una dimostrazione in WebGL. Ora è un atto solo, e
comincia SEDUTI nel salone. `?doppia=1` riporta alla vecchia architettura —
resta finché la nuova non ha girato su un telefono vero.»* Lo stesso vincolo è
ripetuto in `src/main.js:163-165` e in `src/scena/index.js:270`.

Chi lo consuma sono cinque punti in tre file: `main.js:166` (tenere o rimuovere
la sezione `#salone`), `regia.js:67` e `:141` (due tabelle di soglie e due
sequenze di battute), `index.js:278`, `:295`, `:326`, `:354`, `:384`, `:405`
(salone dentro la scena, allestimento, fuoribordo, emersione, uscita).

**Cosa fa davvero — quattro misure, tutte positive.**

*a) Il DOM torna a due capitoli.* Senza l'interruttore, `#salone` è **rimosso**
dal documento e la radice porta `data-unica="si"`. Con `?doppia=1` la sezione
**c'è**, `data-unica` **non c'è**, e il tasto `#stab-salone` esiste.

*b) La nave torna a emergere.* È la differenza meccanica fra le due
architetture: con la scena unica `impostaEmersione` inchioda `emersione = 1`,
quindi `nave.position.y` vale **0,000 sempre**; con `?doppia=1` la nave parte
sommersa e sale. Misurato in cima alla dimostrazione: **`nave.position.y =
-2,436`**, che torna a 0 entro il 15% della corsa. La camera al centro dello
schermo, in cima, vede `#14454a a 3,12` — l'acqua — invece del `#ffffff a 1,30`
della fotografia del salone. **Sono due sequenze diverse, non una variante di
stile.**

*c) Le battute tornano a essere sei.* Con la scena unica la corsa attraversa
`salotto → emerge → mare → invito → calma → taglio → meccanismo` (sette). Con
`?doppia=1` la prima sparisce e le altre si riallineano alle soglie vecchie:
`emerge` a p=0, `mare` a 0,15, `invito` a 0,30, `calma` a 0,45, `taglio` a
0,60, `meccanismo` a 0,80. Sono esattamente i numeri del ramo `else` di
`regia.js:78-80`. **La tabella delle soglie doppie è ancora coerente.**

*d) Il capitolo in DOM si avvia, i video girano, e lo stato è condiviso.*
Scorrendo su `#salone`, `salone-atto.js` viene caricato pigramente e
`creaComposito` costruisce i tre strati previsti:

```
VIDEO.composito__mare                              salone-largo.mp4
VIDEO.composito__stanza                            salone-largo.mp4
VIDEO.composito__stanza composito__stanza--tesa    salone-teso.mp4
```

Lo strato del mare **avanza di 1,56 s in 2 s di orologio**: il video gira
davvero, non è un primo fotogramma congelato. Lo strato `--tesa` resta in pausa,
ed è previsto: è la copia da dissolvere quando il sistema si spegne.

E la prova che conta di più, perché è quella che l'architettura vecchia
rischiava di perdere: **cliccando `#stab-salone` lo stato condiviso cambia
davvero**. `__nautica.stato.stab` passa da `true` a `false`, il palco prende
`data-spento="si"` e il tasto `aria-pressed="false"`. I due capitoli guardano
lo stesso integratore, che era il requisito di `src/stato.js`.

Nessun errore di pagina, nessuna richiesta fallita: solo i due avvisi di
deprecazione di three (`Clock`, `PCFSoftShadowMap`) che ci sono anche senza
l'interruttore.

**Conclusione per chi deve decidere.** `?doppia=1` **non è rotto**. Chi lo
vuole togliere deve motivarlo col costo di mantenerlo — due tabelle di soglie,
due sequenze di battute, sei rami in `index.js`, un file
(`src/scena/composito.js`) e un capitolo DOM interi che vivono solo lì — non
con l'argomento comodo che tanto è già morto.

**Ma una cosa che i documenti dicono di lui è falsa.** `docs/17-CONFORMITA.md`
§7.14 e la riga 348 affermano che `src/scena/salone.js` — l'unico posto dove il
progetto imposta `scena.environment` — è *«caricata solo da `salone-atto.js` e
solo con `?doppia=1`»*. Misurato: con `?doppia=1` da solo dentro `#scena-salone`
ci sono **tre `<video>`**, cioè il composito. La scena 3D del salone appare solo
con **`?doppia=1&sagoma=1`**, e allora dentro `#scena-salone` c'è un `<canvas>`.
Servono **tutti e due** gli interruttori: `salone-atto.js:34` sceglie fra scena
e composito su `?sagoma=1`, e `main.js:166` decide su `?doppia` soltanto **se
quel file viene caricato**. Chi si fidasse di `docs/17` per verificare
`scena.environment` guarderebbe la pagina sbagliata.

**Validazione: nessuna, e qui fa male.** Il confronto è
`location.search.includes('doppia')`, quindi:

| query | architettura |
|---|---|
| `?doppia=1` | **vecchia** (`nave.position.y = -2,436`, `#salone` presente) |
| `?doppia=0` | **vecchia** — «zero» accende, non spegne |
| `?doppiaX=9` | **vecchia** |

`?doppia=0` che riporta all'architettura doppia è la trappola peggiore del lotto:
è la forma che chiunque scriverebbe per **disattivarla**.

---

## 3 · `?ridotto=1` — il movimento ridotto forzato

**Cosa dichiara.** `src/stato.js:18-22`: *«`?ridotto=1` resta l'interruttore di
prova che lo forza: la preferenza di sistema non si può cambiare da una scheda
automatizzata, e un requisito che non si può provare è un requisito dichiarato e
basta.»* E `simulazione.js:243-266` dichiara cosa vuol dire ridotto: **non
spegne, riduce** — la forzante del mare scende a `RIDOTTO = 1/3`, tutto il resto
gira identico.

**Cosa fa davvero.** Funziona. `location.search.includes('ridotto=1')` viene
messo in `or` con `matchMedia('(prefers-reduced-motion: reduce)')` e finisce in
`creaSimulazione({ ridotto })`. Misurato con `window.__nautica.stato.ridotto`:

| query | `stato.ridotto` |
|---|---|
| nessun parametro | `false` |
| `?ridotto=1` | **`true`** |
| `?ridotto=0` | `false` |
| `?ridotto=si` | `false` |

Il flag è esattamente la variabile che `simulazione.js:268` legge per
moltiplicare la forzante per un terzo, quindi misurarlo non è misurare una
dichiarazione: è misurare l'ingresso del ramo che fa il lavoro.

**E il flag riduce davvero l'ampiezza.** Il rollio istantaneo campionato da
fuori non serve a niente qui — un browser senza GPU disegna la scena a due
fotogrammi al secondo, e con trenta campioni su un mare pseudo-casuale la misura
balla del 40% fra un caricamento e l'altro. Si legge invece `stato.picco`, che è
il massimo su finestra di dieci secondi mantenuto **dentro** la simulazione a
ogni passo (`simulazione.js:177`), quindi indipendente da quanto spesso lo si
guarda. Trenta secondi dopo il caricamento, tre giri per parte:

| giro | senza interruttore | con `?ridotto=1` |
|---|---|---|
| 1 | 0,617° | **0,331°** |
| 2 | 1,011° | **0,180°** |
| 3 | 0,749° | **0,372°** |
| media | 0,792° | **0,294°** |

Rapporto 2,7 — l'atteso è 3 (`RIDOTTO = 1/3` a `simulazione.js:71`), e i due
gruppi non si sovrappongono: il valore ridotto peggiore resta sotto il valore
normale migliore. **Riduce, non spegne**: il picco non va mai a zero e i
fotogrammi continuano ad avanzare (47-86 per pagina), che è il difetto contro cui
esiste `strumenti/collaudo-ridotto.mjs`.



**Validazione: buona per caso.** Il confronto è sulla stringa intera `ridotto=1`,
non sul solo nome, quindi `?ridotto=0` e `?ridotto=si` **non** accendono niente —
è l'unico dei quattro interruttori a sottostringa che si comporta come ci si
aspetta. Resta però la stessa forma debole: `?xridotto=1x` lo accenderebbe, e
qualunque parametro il cui valore contenga `ridotto=1` pure.

---

## 4 · `?ombre=0|1024|2048` — il livello delle ombre

**Cosa dichiara.** `src/scena/index.js:158-181`: il livello si sceglie da solo
da due indizi (`hardwareConcurrency` e il lato corto dello schermo), 1024 sotto
i cinque nuclei o sotto i 700 px, 2048 sopra; *«`?ombre=0|1024|2048` la forza,
per poterla guardare invece di discuterla»*. E subito sotto, la clausola che
nessun altro interruttore ha: *«`?ombre` accetta solo i tre livelli che
esistono. Un numero qualunque — `?ombre=37` — produrrebbe una mappa che nessuno
ha mai guardato, e un interruttore diagnostico che accetta valori non previsti
smette di essere una diagnosi: diventa un altro modo di rompere la scena.»*

**Cosa fa davvero.** Funziona, ed è l'unico dei cinque che valida. Misurato su
`render.shadowMap.enabled`, sul `castShadow` del sole e sulla sua
`shadow.mapSize` (macchina di prova: 12 nuclei, lato corto 800 px, quindi
automatico = 2048):

| query | `shadowMap.enabled` | `sole.castShadow` | `mapSize` | avviso in console |
|---|---|---|---|---|
| (assente) | `true` | `true` | 2048×2048 | — |
| `?ombre=0` | **`false`** | **`false`** | 512×512 (default mai toccato) | — |
| `?ombre=1024` | `true` | `true` | **1024×1024** | — |
| `?ombre=2048` | `true` | `true` | **2048×2048** | — |
| `?ombre=pippo` | `true` | `true` | 2048×2048 (automatico) | `[nautica] ?ombre=pippo non e' fra 0, 1024, 2048: ignorato` |
| `?ombre=37` | `true` | `true` | 2048×2048 (automatico) | `[nautica] ?ombre=37 non e' fra 0, 1024, 2048: ignorato` |

**`?ombre=pippo` fa esattamente quello che il commento promette:** avvisa in
console e ripiega sulla scelta automatica. Non lancia, non spegne le ombre, non
crea una mappa che nessuno ha mai guardato.

Due dettagli minori, nessuno dei quali è un difetto.

- La validazione è **sul valore numerico**, non sulla stringa: il codice fa
  `LIVELLI_OMBRA.includes(Number(chiesta))`. Quindi `?ombre=2048.0` è accettato
  come 2048 e `?ombre=%201024` (spazio davanti) come 1024 — misurati entrambi.
  Sono grafie diverse degli stessi tre livelli, quindi il divieto regge.
- L'interruttore governa **solo il sole**. La seconda luce direzionale — il
  controluce di `index.js:196` — ha `castShadow: false` in ogni caso, come vuole
  il codice. Chi conta le luci che proiettano ombra ne trova sempre una sola.

---

## 5 · `?materia=0` — spegne la variazione di rugosità

**Cosa dichiara.** `src/scena/impianto.js:375-391`: la variazione direzionale di
rugosità si applica **per nome** ai materiali che arrivano dal GLB, e
*«`?materia=0` la spegne: serve a poterla CONFRONTARE invece che dichiararla, ed
è così che si è misurato che fa qualcosa»*. Le ricette stanno in
`src/scena/materia.js:124-134`, sette nomi.

**Cosa fa davvero.** Funziona su tutti e sette. La misura più diretta è la
chiave di cache del programma: `materia.js:109-110` la imposta a
`lavorazione-<scala>-<forza>-<direzione>`, e un materiale non lavorato
restituisce invece la chiave predefinita di three, che è il testo del suo
`onBeforeCompile` vuoto.

| materiale | senza interruttore | con `?materia=0` |
|---|---|---|
| `acciaio` | `lavorazione-11-0.11-15` | `onBeforeCompile() {}` |
| `lucido` | `lavorazione-14-0.06-15` | `onBeforeCompile() {}` |
| `sezione` | `lavorazione-13-0.09-15` | `onBeforeCompile() {}` |
| `tenuta` | `lavorazione-10-0.1-12` | `onBeforeCompile() {}` |
| `carter` | `lavorazione-26-0.045-1` | `onBeforeCompile() {}` |
| `motore` | `lavorazione-26-0.045-1` | `onBeforeCompile() {}` |
| `carena` | `lavorazione-20-0.05-1` | `onBeforeCompile() {}` |

I sette valori a sinistra corrispondono uno per uno alla tabella `LAVORAZIONI`,
quindi non è solo «qualcosa è cambiato»: è **la ricetta giusta sul pezzo
giusto**. La `roughness` scalare resta identica nei due casi (0,42 il carter,
0,28 l'acciaio, 0,16 il lucido…) ed è corretto: la lavorazione non tocca il
valore base, modula il fattore **dentro il frammento**.

**Validazione: nessuna, e col verso invertito.** Il confronto è
`location.search.includes('materia=0')`:

| query | lavorazione |
|---|---|
| (assente) | applicata |
| `?materia=0` | **spenta** |
| `?materia=1` | applicata |
| `?materia=0000` | **spenta** — «materia=0» è un prefisso di «materia=0000» |

`?materia=1` si comporta bene, ma per la ragione sbagliata: non perché il valore
sia stato letto, ma perché `materia=1` non contiene `materia=0`. Qualunque
valore che *cominci* per zero spegne.

---

## 6 · Gli altri interruttori che il codice ha e che nessuno aveva elencato

Cercandoli nel codice (`location.search` in `src/`) ne saltano fuori altri
cinque. Non erano nell'incarico, ma stanno nella stessa query string e vale la
pena che siano scritti in un posto solo.

| interruttore | dove | cosa dichiara | verificato |
|---|---|---|---|
| `?sagoma=1` | `salone-atto.js:24-36` | apre la scena 3D del salone invece del composito; è la sorgente delle sagome per `npm run sagome` | **sì** — con `?doppia=1&sagoma=1` dentro `#scena-salone` c'è un `<canvas>` invece dei tre `<video>`. Da solo non fa niente: senza `?doppia` il capitolo DOM viene rimosso e `salone-atto.js` non viene mai caricato |
| `?maschera=1` | `scena/salone.js:340-359` | tutto nero tranne il mare: la maschera dei finestrini, che esce dalla stessa scena e quindi combacia al pixel | non misurato — vive dentro la scena raggiungibile solo con `?doppia=1&sagoma=1` |
| `?rollio=N` | `scena/salone.js:340-359` | inchioda l'inclinazione a N gradi, per catturare la sagoma a un angolo scelto | non misurato — stessa scena |
| `?senzaAmbiente` | `scena/index.js:126` | non costruisce la mappa d'ambiente | **sì** — i materiali con `envMap` valorizzata passano da **75 a 0**, e quelli con lo slot vuoto da 19 a 94 |
| `?senzaAcqua` | `scena/index.js:330-336` | toglie il mare dalla scena; *«è costato un ciclo di compilazione e ha isolato in un colpo un difetto che stavo per attribuire all'acqua»* | **sì** — i figli diretti della scena passano da **7 a 6**, e con loro spariscono otto materiali |

I due `?senza…` usano la stessa forma a sottostringa **sul solo nome**, senza
`=1`: misurato, `?senzaAcqua=0` toglie l'acqua esattamente come `?senzaAcqua=1`
(stessi 6 figli, stessi 11 materiali senza `envMap`).

---

## 7 · Cosa si porta a casa

1. **Nessuno dei cinque interruttori dell'incarico è rotto.** Tutti fanno la
   cosa che il loro commento dichiara, e `?ispeziona=1` ne fa un po' di più.
2. **`?doppia=1` è vivo e completo**: DOM, soglie, battute, emersione, video,
   stato condiviso. La decisione di toglierlo va presa sul costo di
   mantenimento, non sulla speranza che sia già marcio.
3. **Un solo interruttore valida il proprio valore**, ed è `?ombre`. Gli altri
   quattro confrontano una sottostringa sulla query string intera, con l'effetto
   che `?doppia=0` accende l'architettura doppia e `?materia=0000` spegne la
   materia. Se un giorno si decide di uniformarli, il modello scritto bene è già
   in `index.js:180-188`: `URLSearchParams`, elenco chiuso dei valori ammessi,
   avviso in console e ripiego sul comportamento predefinito.
4. **Una riga di `docs/17` va corretta**: la scena 3D del salone non è
   raggiungibile con `?doppia=1`, ma con `?doppia=1&sagoma=1`.
5. **`window.__nautica` non esiste al caricamento.** Chi scrive un cancello
   nuovo deve aspettarlo, non contarci: la scena nasce quando la dimostrazione
   entra in campo, e su una macchina senza GPU ci mette decine di secondi.
