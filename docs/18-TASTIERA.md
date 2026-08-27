# 18 — IL SITO DA TASTIERA

Il sito percorso **con la sola tastiera**, misurando invece di guardando. Non
c'è una conclusione del tipo «è accessibile»: c'è il percorso che ho fatto, i
numeri che ho letto e i punti in cui si rompe.

La domanda che ha fatto nascere questo documento è già nel repo: il committente,
dopo giorni sul proprio sito, ha scoperto solo alla fine che **la nave si può
ruotare**. Se un'affordance sfugge a chi la guarda, da tastiera può sfuggire
peggio — perché da tastiera l'unica cosa che dice «sei qui» è l'anello del
fuoco, e l'anello si può misurare.

---

## 0 · Come è stato misurato

- **Browser**: Chromium di Playwright via `strumenti/browser.mjs` con
  `CHROMIUM=1` (letto, non modificato).
- **Sito**: `vite preview`. La porta 5180 era già occupata da un server di
  sviluppo, quindi la preview è finita su **5182**; serve `dist/`, cioè la
  build, non i sorgenti.
- **Un avvertimento onesto**: il repo era in lavorazione mentre misuravo, e
  `dist/` è stata **ricompilata a metà sessione**. I difetti del §2 sono stati
  perciò **rimisurati tutti in blocco sulla build finale**
  (`index-BBFdi6OC.js`, `index-BLhjqtQ2.css`, `demo-BFOfohZg.js`,
  `stato-Ba7Gr6tw.js`), così che i numeri di questo documento vengano tutti
  dallo stesso artefatto. I riferimenti a `src/` servono a spiegare la causa,
  non a fondare la misura.
- **Finestre**: 1440×900 e 390×844.
- **Sonda**: `?ispeziona=1` espone `window.__nautica` (scena, camera, stato,
  fotogrammi). È del repo, non l'ho aggiunta io.
- **Il fuoco si vede?** — non a occhio. L'anello ha una geometria nota
  (riquadro + `outline-offset`, spessore = `outline-width`): campiono **quei**
  pixel nello scatto con il fuoco e **gli stessi punti** nello scatto senza, poi
  calcolo il contrasto WCAG fra i due. Il fondo lo prendo dallo scatto senza,
  così la scena WebGL che si muove dietro non falsa la misura. Un primo tentativo
  a differenza di pixel dava l'88% dell'area «cambiata» — era l'onda, non il
  fuoco: quella misura è stata buttata.
- **Soglie**: WCAG 2.2 SC 2.4.11 (*Focus Appearance*) chiede ≥ 3:1 fra
  l'indicatore e ciò che c'è sotto; SC 1.4.3 chiede 4,5:1 per il testo piccolo.

### Un metro che non ha funzionato, dichiarato

Ho provato a misurare la rotazione leggendo i pixel della tela con `readPixels`:
ha risposto **0 prima e 0 dopo**, perché il buffer di disegno non è conservato.
Sembrava «le frecce non ruotano»: era il metro rotto. La rotazione è poi stata
misurata sulla **posizione della camera** in `window.__nautica`, e ruota.

E questo browser, senza GPU, disegna la scena a **1,3 fps** (4 fotogrammi in 3
secondi, contati su `__nautica.fotogrammi`). Tutto ciò che dipende dalla
frequenza dei fotogrammi qui **non è misurabile**, e sotto è detto dove.

---

## 1 · La sequenza di tabulazione registrata

Tab premuto dall'inizio, a pagina appena caricata. `sY` è la posizione di
scorrimento nel momento in cui l'elemento prende il fuoco.

### 1440×900

| # | elemento | nome annunciato | sY | battuta | opacità |
|---|---|---|---|---|---|
| 1 | `a.salta` | Skip to the demonstration | 0 | salotto | 1 |
| 2 | `.testata nav a` | Demonstration | 0 | salotto | 1 |
| 3 | `.testata nav a` | How it is made | 0 | salotto | 1 |
| 4 | `.testata nav a` | With your product | 0 | salotto | 1 |
| 5 | `.testata nav a` | Contact | 0 | salotto | 1 |
| 6 | `#scena canvas` | Section view. Left and right arrow keys rotate the point of view. | **900** | salotto | 1 |
| 7–12 | `#mare button` ×6 | Sea state 0…5, nominal roll amplitude 0…15 degrees | 900 | salotto | 1 |
| 13 | `#velocita` | Speed — 12 | 900 | salotto | 1 |
| 14 | `#stab` | Stabilisation | 900 | salotto | 1 |
| 15 | `#apri-chiusura` | For your product | 900 | salotto | **0** |
| 16 | `.indirizzo a` | The repository, commit history included | **10993** | meccanismo | 1 |
| 17 | — | il fuoco esce dal documento | — | — | — |

Sedici fermate, poi si esce. **Nessuna trappola**: il ciclo si chiude, `Shift+Tab`
torna indietro, e da nessun elemento il fuoco resta prigioniero.

L'ordine **corrisponde all'ordine visivo**, con due salti che vale la pena
notare perché non sono difetti ma cambiano lo stato del sito:

- fra 5 e 6 il browser **scorre la pagina di 900 px** per portare la tela in
  vista: tabulare fa avanzare la regia dello scorrimento, cioè cambia la battuta.
- fra 15 e 16 salta **9 000 px** — «How it is made» e «With your product», i due
  capitoli più lunghi del sito, **non contengono un solo elemento focalizzabile**.

### 390×844

Dodici fermate. La navigazione della testata è `display:none` sotto 820 px,
quindi **sparisce anche dall'ordine di tabulazione**: da telefono con tastiera
esterna l'unico modo di raggiungere un capitolo è il collegamento di salto (che
porta solo alla dimostrazione) o scorrere. Il resto è identico, e
`#apri-chiusura` è di nuovo a opacità 0 — questa volta a `y = 24`, cioè
addosso alla testata fissa.

---

## 2 · I difetti, con la prova

### D1 — L'interruttore dichiara il contrario di quello che fa

Il difetto più grave trovato, e **non è solo di tastiera**: mente anche
all'occhio.

Misurato a pagina appena aperta, dimostrazione a schermo, nessuna interazione —
e rimisurato identico sulla build finale:

```
aria-pressed dichiarato ....... "false"
stato vero dell'impianto ...... true          (__nautica.stato.stab)
riduzione mostrata ............ 91%
colore della spia ............. rgba(127,163,165,.35)   <- la regola di SPENTO
colore del testo .............. rgb(127,163,165)        <- la regola di SPENTO
```

Poi, da tastiera:

```
dopo UN Invio  -> aria-pressed "false"  stato vero false  riduzione 0
dopo DUE Invio -> aria-pressed "true"   stato vero true   riduzione 91
```

**Cosa succede.** `index.html` scrive `aria-pressed="false"` a mano;
`src/stato.js` apre la visita con `sim.S.stab = true`; `src/ui/comandi.js`
allinea l'attributo **solo dentro il gestore del clic**. Fra il caricamento e
la prima pressione i due non si parlano. Le tacche del mare non hanno il
problema perché nascono da JS con `String(n === sim.S.mare)`: è lo stesso file,
due strade diverse.

**Cosa costa.**
1. Chi usa un lettore di schermo sente «not pressed» **prima e dopo** la prima
   pressione: nessuna conferma che sia successo qualcosa.
2. Chi guarda vede un interruttore spento, lo preme per accendere, e **lo
   spegne**. Il sito si apre col sistema acceso proprio perché la tesi è
   «guarda cosa fa quando lo togli» — e il comando che dovrebbe dirlo dice il
   contrario.
3. La regola `.palco[data-battuta="invito"] .interruttore:not([aria-pressed="true"])`
   fa **pulsare** l'interruttore per chiamare l'attenzione. Pulsa perché lo
   crede spento: il sito invita a spegnere credendo di invitare ad accendere.

### D2 — La scena 3D non ha alcun indicatore di fuoco

La tela è raggiungibile (sesta fermata) ed è etichettata bene. Ma l'anello del
fuoco **non esiste sullo schermo** — misurato su entrambe le build, identico:

```
riquadro della tela ...... x:0  y:0  w:1440  h:900     (esattamente la finestra)
outline .................. 2px solid rgb(79,224,196)  offset 3px
anello esterno ........... x:-5  y:-5  w:1450  h:910
dentro la finestra? ...... false
pixel dell'anello visibili nella finestra: 0
overflow dell'antenato `.palco`: hidden
```

La tela riempie la finestra, quindi l'anello con `offset: 3px` cade **fuori**
da tutti e quattro i lati; e anche se non lo facesse, `.palco` è
`overflow:hidden`.

Conseguenza: il sesto Tab porta dentro **l'affordance principale del sito** e a
schermo non succede assolutamente niente. L'unico modo di scoprire di essere
lì è premere una freccia a caso.

Le frecce, quando le si preme, funzionano — misurato sulla posizione della
camera: **≈ 3° per pressione**, fine corsa a **±52,7°**. E si esce senza
problemi: `Tab` va alla scala del mare, `Shift+Tab` torna, e `Home`, `End`,
`PageDown` e `Spazio` continuano a scorrere la pagina (verificato: 2400 → 0,
2400 → 10993, 2400 → 3187). **Nessuna trappola**: il difetto è che non si vede
di essere entrati, non che non si esca.

### D3 — Il contrasto dell'anello del fuoco non è deciso da nessuno

Nella dimostrazione l'anello è verde `#4FE0C4` e viene disegnato **sopra il
mare renderizzato da WebGL**. Quel fondo non è governato dal foglio di stile, e
si vede nel modo peggiore possibile: **la stessa misura, sulle stesse regole
CSS, su due build a un'ora di distanza**, con nessuno che avesse toccato le
regole del fuoco.

| elemento | anello | mediana, build delle 13:21 | mediana, build delle 14:05 |
|---|---|---|---|
| `#mare button` | `#4FE0C4` | **2,33:1** | 4,67:1 |
| `#velocita` | `#4FE0C4` | **1,90:1** | 4,70:1 |
| `#stab` | `#4FE0C4` | **2,08:1** | 4,85:1 |

Fra le due build le regole del fuoco in `stile.css` non sono cambiate: a cambiare
è stato ciò che c'è **sotto**. **L'accessibilità dell'anello è migliorata di due
punti e mezzo per effetto collaterale di una taratura della scena.** Sulla build
attuale i tre comandi passano SC 2.4.11; non passano *per decisione*, e la
prossima taratura può riportarli sotto senza che nessun cancello se ne accorga.

Che la misura sia instabile lo dice anche una singola corsa: sulla scala del
mare, 10° percentile **1,43** e massimo **7,36** — cioè il contrasto dell'anello
**cambia con l'onda che gli passa sotto**.

Il resto della tabella, sulla build finale:

| elemento | anello | mediana | SC 2.4.11 |
|---|---|---|---|
| `.testata nav a` | `#15181B` | 14,19:1 | sì |
| `.indirizzo a` | `#15181B` | 14,19:1 | sì |
| `#apri-chiusura` (dove è visibile) | `#4FE0C4` | 6,49:1 | sì |
| `#scena canvas` | `#4FE0C4` | — nessun pixel visibile — | **no** (D2) |
| `.salta` | `#4FE0C4` | vedi sotto | — |

In ogni caso misurato il **100%** dei pixel dell'anello porta il colore
dichiarato: l'anello c'è ed è disegnato correttamente. Il problema non è il
disegno, è che il fondo non è di nessuno.

**Dove il sistema funziona**, e va detto: `[data-lato]` fa il suo lavoro — sopra
la linea l'anello diventa inchiostro e passa a 14:1. Ma la dimostrazione è
`data-lato="misto"` e quindi **non entra mai nel ramo `sopra`**: tiene il verde
anche sulla metà di carta. E l'aritmetica della palette è giusta su un fondo che
a schermo non c'è:

```
--recupero  #4FE0C4  su --aria (carta)      1,31:1
--recupero  #4FE0C4  su --acqua             10,89:1   <- il conto del CSS
--inchiostro #15181B su --aria              14,19:1
--inchiostro #15181B su --acqua              1,00:1
```

Sotto i comandi non c'è `--acqua`: c'è il mare disegnato. È lo stesso genere di
errore già registrato in questo repo per la testata fissa — un colore calcolato
contro il fondo del foglio di stile mentre a schermo ce n'è un altro — solo che
lì il fondo sbagliato era fermo, e qui si muove.

**Caso a parte, `.salta`.** Il collegamento di salto ha
`background: var(--recupero)` e l'anello è dello **stesso identico colore**:
1,00:1 contro il pulsante, 1,31:1 contro la carta attorno. Come indicatore vale
zero. Lì però il fuoco si vede lo stesso, perché l'elemento passa da
`translateY(-200%)` a visibile: è l'elemento intero a comparire (misurato: 73%
dei pixel della fascia cambiano, contrasto 14,17:1 fra la carta e il pulsante).
L'anello è inutile, non dannoso.

### D4 — Un pulsante focalizzabile a opacità 0, proprio dove la tabulazione arriva

`#apri-chiusura` («For your product») resta nell'ordine di tabulazione sempre,
con `tabIndex = 0`, mentre la regia lo accende e lo spegne. Misurato con 1,6 s
di assestamento (la transizione dura 0,45 s), battuta per battuta:

| scrollY | battuta | opacità | pointer-events | nella tabulazione |
|---|---|---|---|---|
| 0 · 600 · 1200 | salotto | **0** | auto | sì |
| 1800 | emerge | 1 | auto | sì |
| 2400 | invito | 1 | auto | sì |
| 3000 | calma | 1 | auto | sì |
| 3600 | taglio | 1 | **none** | sì |
| 4200 · 4800 | meccanismo | **0** | none | sì |

Due cose, non una.

**Invisibile ma focalizzabile.** In *salotto* e in *meccanismo* l'opacità è 0 e
il pulsante è comunque una fermata. E la fermata non è teorica: nella camminata
naturale con Tab da pagina appena caricata, la **quindicesima** fermata è
proprio quella, in battuta *salotto*, a opacità 0 — verificato a 1440×900 e a
390×844, entrambe le volte. Cioè: **il primo passaggio con la tastiera colpisce
il pulsante esattamente nella battuta in cui non si vede.** Premuto per sbaglio,
apre una finestra modale che nessuno aveva chiesto.

**Visibile ma inerte.** In *taglio* l'opacità è 1 e `pointer-events` è `none`: il
pulsante si vede, il mouse non lo prende, e la tastiera **lo attiva lo stesso**
(`pointer-events` non tocca l'attivazione da tastiera). Tre comportamenti
diversi per lo stesso comando a seconda della battuta e del dispositivo.

Il commento in `stile.css` conosce metà del problema — *«Nessuno di essi viene
DISABILITATO — solo nascosto alla vista — perché la tastiera non deve perdere il
filo»*. La decisione è giusta e va tenuta: disabilitarlo sarebbe togliere un
comando. Quello che manca è che *nascosto alla vista* e *raggiungibile dalla
tastiera* sono, per chi guarda lo schermo, la definizione di trappola.

### D5 — La finestra modale lascia scorrere la pagina dietro di sé

Sequenza, tutta da tastiera:

```
Invio su #apri-chiusura ......... finestra aperta, fuoco su a.richiamo--pieno,
                                  scrollY 2400
Invio sul collegamento .......... "Go to the full section"
  finestra ancora aperta? ....... true
  sfondo della finestra ......... rgba(7,26,29,0.92)   <- opaco al 92%
  scrollY ....................... 2400 -> 8834
  #offerta ...................... top = 0    (è arrivata esattamente sotto)
  fuoco ......................... BODY
Escape .......................... finestra chiusa, scrollY resta 8834
  fuoco torna a ................. #apri-chiusura
  battuta ....................... meccanismo
  opacità di quel pulsante ...... 0
```

Il collegamento dentro il `<dialog>` è un `<a href="#offerta">` senza gestore:
porta la pagina alla sezione **mentre la finestra e il suo sfondo al 92% sono
ancora sopra**. La sezione arriva a `top = 0`, cioè perfettamente inquadrata, e
non si vede. Il fuoco finisce su `BODY`; chiudendo con Escape il browser lo
riporta correttamente a chi aveva aperto — che a 8834 px è in battuta
*meccanismo*, cioè a **opacità 0** (D4). Si esce dalla finestra con il fuoco su
un elemento invisibile, seimila pixel lontano da dove si era entrati.

Il resto del `<dialog>` è a posto e va detto, perché è il pezzo meglio riuscito
del percorso: il giro del fuoco misurato è
`button#chiudi → (documento della finestra) → a.richiamo--pieno → button#chiudi → …`
e **non esce mai** verso la navigazione o i comandi della pagina; Escape chiude;
il fuoco torna a chi ha aperto. Sono comportamenti nativi di `<dialog>`, ed è
esattamente la ragione per cui qui il difetto residuo è uno solo. Unico neo del
giro: una delle fermate è il documento della finestra, dove **non si vede nulla
a fuoco** — comportamento di Chrome, non del sito.

### D6 — Sei regioni vive che parlano a ogni fotogramma

L'albero di accessibilità di Chrome, interrogato via CDP (sette nodi vivi, gli
stessi sette su entrambe le build):

```
live=polite atomic=false role=generic  <- div#battuta
live=polite atomic=true  role=status   <- output#v-carico
live=polite atomic=true  role=status   <- output#v-recupero
live=polite atomic=true  role=status   <- output#v-rollio
live=polite atomic=true  role=status   <- output#v-picco
live=polite atomic=true  role=status   <- output#v-velocita
live=polite atomic=true  role=status   <- output#v-riduzione
```

`<output>` ha `role="status"` implicito, cioè **è già una regione `aria-live`
anche senza che nessuno l'abbia chiesto**. E `src/ui/letture.js` li riscrive
tutti e sei a fotogrammi alterni:

```js
frame++
if (frame % 2) return
el.rollio.textContent = ...
```

Su una macchina a 60 fps sono **30 riscritture al secondo per ciascuno dei sei**.
Il rollio e il picco cambiano di continuo, quindi un lettore di schermo che le
onora non smette mai di parlare. È esattamente il caso che il brief chiamava
«peggio del silenzio».

**Questa frequenza qui non l'ho potuta misurare**: il renderer software gira a
1,3 fps e ho contato 2 riscritture in 3 secondi. Il rapporto
riscritture/fotogrammi è però **0,50 esatto**, che conferma il `frame % 2` del
codice. Quello che è misurato è il *fatto* (sei `role=status`, `atomic=true`);
la frequenza è dedotta dal codice, non osservata.

Il rovescio: `#battuta`, che è la regione `aria-live` **dichiarata a mano**, si
comporta bene. `src/regia.js` esce con `if (indice === ultima) return` prima di
riscrivere titolo e testo, quindi parla solo quando la battuta cambia davvero —
misurato **0 mutazioni in 1 secondo** di scorrimento fermo. L'unica regione
scritta apposta è l'unica che non urla.

**Quello che nessuno annuncia**, invece, è il resto: la riduzione che si accende
(`#d-riduzione[data-attiva]` cambia solo lo stile), il picco che si azzera
quando si cambia mare, il fatto stesso che l'impianto sia acceso. Le sei
`role=status` dicono tutto quaranta volte e la cosa che conta — *il numero è
cambiato perché hai premuto tu* — non la dice nessuno.

### D7 — Il suggerimento che dice che la nave si gira è a 1,23:1

È l'unico posto in cui il sito, a schermo, dice che si può ruotare. Misurato
sui pixel dello scatto:

```
#nota  "Drag to rotate"
  colore dichiarato ....... rgb(95,99,103)     (--inchiostro-tenue)
  fondo dominante misurato  rgb(100,116,108)   (build finale)
  contrasto ............... 1,23:1     (WCAG AA testo piccolo: 4,5:1)

  sulla build precedente:   fondo rgb(20,68,68)  ->  1,79:1
```

Anche qui il numero si muove con l'acqua — 1,79:1 su una build, **1,23:1**
sull'altra — e in nessuna delle due si avvicina alla soglia.

Il colore è quello pensato **per la metà di carta**, ma `.nota` sta a
`bottom: 31vh`, cioè **sotto la linea d'acqua**, sul mare scuro. È inchiostro su
acqua profonda — lo stesso difetto già corretto per la testata fissa, ripetuto
su un altro nodo.

Vale la pena tenerlo accanto alla frase del committente: *«che la nave potesse
girare l'ho capito ora»*. Il suggerimento c'era. Era a 1,23:1.

Stesso problema, meno grave, per `#patto` («Illustrative model · Generic
geometry · Normalised values»): **2,71:1** con `--acqua-tenue` su un fondo
misurato `rgb(52,92,92)`. La palette dichiara 6,54:1 per quel colore su
`--acqua`; a schermo, sopra il mare disegnato, sono 2,71.

### D8 — Il testo visibile e l'etichetta della tela dicono due cose diverse

```
testo visibile ................. "Drag to rotate"
aria-hidden del suggerimento ... (nessuno)
etichetta della tela ........... "Section view. Left and right arrow keys rotate the point of view."
aria-describedby della tela .... (nessuno)
```

Chi vede lo schermo e usa la tastiera legge solo **«Drag to rotate»**: il sito
non gli dice mai che ci sono le frecce. Chi usa un lettore di schermo sente
entrambe le versioni, scollegate fra loro, perché `#nota` non è `aria-hidden` e
non è legata alla tela da `aria-describedby`.

Il commento in `stile.css` cita una frase che nel documento non c'è più —
*«"Drag, or use the arrow keys" è metà falso su uno schermo tattile»*: la
menzione dei tasti è stata tolta dal testo e il commento è rimasto. La
correzione è nota a chi ha scritto il file; il file non ce l'ha.

### D9 — La scala del mare si annuncia come sei interruttori indipendenti

Sei `<button aria-pressed>` dentro un `role="group"` chiamato «Sea state».
Funzionano da tastiera: `Invio` sul secondo pulsante porta
`aria-pressed` da `false,false,false,false,true,false` a
`false,true,false,false,false,false`, e le letture reagiscono.

Le etichette **dicono il vero** — verificate contro
`AMPIEZZA_MARE = [0, 3, 6, 9, 12, 15]` in `simulazione.js`:

```
[0] Sea state 0, nominal roll amplitude 0 degrees
[1] Sea state 1, nominal roll amplitude 3 degrees
...
[5] Sea state 5, nominal roll amplitude 15 degrees
```

Il difetto è di **modello**, non di etichetta: sono opzioni **mutuamente
esclusive** annunciate come sei interruttori a due stati. Un lettore di schermo
dice «Sea state 3 … toggle button, not pressed» invece di «radio button, 4 di
6», e non c'è modo di sapere quante sono senza tabularle tutte. Sono anche
**sei fermate di tabulazione** su sedici totali: più di un terzo del percorso
serve ad attraversare un unico comando. Con `role="radiogroup"` sarebbe una
fermata sola e le frecce lo percorrerebbero — misurato che oggi non lo fanno:
`ArrowRight` dentro il gruppo lascia il fuoco dov'è.

(Nota minore trovata di passaggio: la tacca `Sea state 0` dichiara ampiezza 0
gradi ma disegna una barra alta il 16%, perché l'altezza è `16 + n*16`%. Il
segno visivo e l'etichetta non concordano sullo zero.)

### D10 — Il cursore dell'andatura non dice l'unità

```
min 0  max 20  step 1
etichetta ....... "Speed"        (<label for="velocita">, corretta)
aria-valuetext .. null
aria-describedby  v-velocita     -> un <output role=status> che mostra "12kn"
```

Da tastiera funziona: due `ArrowLeft` portano il valore da 12 a 10 e la lettura
a schermo lo segue. Ma senza `aria-valuetext` un lettore di schermo annuncia
**«12»**, mentre a schermo c'è **«12 kn»**. E la descrizione è agganciata a un
elemento che è a sua volta una regione viva riscritta trenta volte al secondo
(vedi D6): la descrizione del cursore è uno dei nodi che urlano.

### D11 — Il collegamento di salto lascia il fuoco su `BODY`

```
primo Tab ....... "Skip to the demonstration"
Invio ........... scrollY 0 -> 900,  hash #dimostrazione
fuoco su ........ BODY
Tab successivo .. CANVAS (la tela della dimostrazione)
```

`#dimostrazione` è una `<section>` senza `tabindex="-1"`, quindi il fuoco non
si sposta: Chrome tiene il *punto di partenza della navigazione sequenziale* e
il Tab successivo riprende dal punto giusto — infatti finisce sulla tela. Il
salto funziona qui; ma è un comportamento che non tutti i browser e non tutte
le tecnologie assistive onorano allo stesso modo, e non costa niente rendere il
bersaglio focalizzabile.

### D12 — Nove metri di sito senza una fermata

Fra `#apri-chiusura` (fermata 15, sY 900) e il collegamento del contatto
(fermata 16, sY 10993) ci sono **«How it is made»** e **«With your product»** —
i due capitoli in cui il sito espone il metodo, i numeri misurati e l'offerta
commerciale — e **nessun elemento focalizzabile**. Non è un errore in sé (è
testo, e si legge scorrendo o con i comandi di lettura), ma sotto 820 px la
navigazione della testata è `display:none` e quindi **anche l'unico indice
sparisce dall'ordine di tabulazione**: da lì l'unico salto disponibile porta
alla dimostrazione.

L'indice delle intestazioni, per chi naviga per titoli, regge — `h1`, poi `h2`
per ogni atto (due dei quali `.via`, fuori schermo ma leggibili), `h3` per i
paragrafi — con una eccezione: `h3[data-ruolo="titolo"]` dentro `#battuta` è il
titolo della battuta corrente, e `src/regia.js` lo **svuota** in cinque battute
su sei (`tit.textContent = b.titolo || ''`). Chi elenca le intestazioni trova
un `h3` vuoto o mutevole a seconda di dove si era fermato a scorrere.

---

## 3 · Il movimento ridotto

Verificato con la preferenza di sistema (`reducedMotion: 'reduce'` nel
contesto), non solo con `?ridotto=1`.

**La preferenza arriva**: `matchMedia('(prefers-reduced-motion: reduce)').matches`
→ `true`.

**Le animazioni decorative si spengono davvero.** Misurato lo stile calcolato,
non dedotto dalla regola:

| animazione | normale | con movimento ridotto |
|---|---|---|
| frecce del suggerimento (`.nota i::before`, `tira`) | `tira 3s infinite` | `none` |
| stanghetta dell'invito (`.invito i`, `scendi`) | `scendi 2.2s infinite` | `none` |
| pulsazione dell'interruttore (`#stab`, `chiama`) | `chiama 2s infinite` | `none` |
| animazioni CSS vive nel documento | `tira, tira, chiama, scendi` + una transizione | solo due transizioni, durata 0,01 s |

**E il segno resta**: l'invito «Scroll» compare comunque (`data-visibile="si"`)
— perde il battito, non la presenza. È la cosa giusta, ed è misurata.

**Quello che resta è usabile da tastiera**: la rotazione con le frecce funziona
identica (19,48° → 51,82° con otto pressioni), l'interruttore commuta
(`stato vero true → false`, riduzione 91 → 0), le letture continuano ad
aggiornarsi. Il ciclo di disegno non si ferma, come dichiara `demo.js`.

**Un dubbio che lascio aperto, non risolto.** Con la preferenza attiva la
forzante scende a `RIDOTTO = 1/3` (`simulazione.js`). Ho provato a misurarlo —
mare 5, sistema spento, 12 secondi di attesa, stesse condizioni nei due casi:

```
ridotto = false  ->  rollio 0,5°   picco 0,7°
ridotto = true   ->  rollio 0,0°   picco 0,1°
```

**Questa misura non conclude niente, e va detto perché.** La simulazione avanza
col `dt` del ciclo di disegno: a 1,3 fps, in 12 secondi di orologio, ha fatto
una quindicina di passi. La nave non è arrivata a regime in nessuno dei due
casi — è dichiarato in `stato.js` che ci mette più di un minuto, ed è il motivo
per cui esiste `sim.scalda()`. Il numero utile è solo il rapporto, che è
coerente con `1/3`.

Quello che resta aperto è il rischio, non il risultato: con la lettura a **un
decimale**, se a regime il rollio ridotto sta sotto il grado, la differenza fra
acceso e spento finisce nell'ultima cifra e la dimostrazione smette di
dimostrare. **Va rimisurato su una macchina con GPU**, mare 5, sistema spento,
almeno un minuto. La domanda precisa: *con movimento ridotto, la differenza fra
acceso e spento si legge ancora sui numeri?*

---

## 4 · Quello che funziona, detto per non farlo riportare di nuovo

Non è un attestato: sono i punti che ho provato a rompere e non si sono rotti.

- **Nessuna trappola del fuoco.** In nessun punto del percorso il fuoco resta
  prigioniero. La tela `role="application"` si lascia (Tab, Shift+Tab) e non
  ruba `Home`, `End`, `PageDown`, `Spazio`.
- **Le frecce ruotano davvero** — 3° per pressione, fine corsa ±52,7° —
  e funzionano anche con movimento ridotto.
- **Il `<dialog>` nativo fa il suo lavoro**: fuoco intrappolato dentro, Escape
  chiude, il fuoco torna a chi ha aperto.
- **Le etichette della scala del mare dicono il vero**, verificate contro
  `AMPIEZZA_MARE`.
- **`aria-pressed` sulle tacche del mare è corretto fin dal caricamento**
  (nasce da JS). È l'interruttore a non esserlo — vedi D1.
- **`#battuta` non urla**: la regione `aria-live` dichiarata a mano parla solo
  quando la battuta cambia.
- **I bersagli sono 44×44**, misurati: le tacche del mare 44×44, il cursore
  132×44, l'interruttore 174×47, la navigazione 99×44, il contatto 481×44.
- **L'invito «Scroll» è `aria-hidden="true"`**: decorativo, e dichiarato tale.
- **`lang="en"`** coerente con i contenuti, `<main>`, `<nav aria-label="Sections">`.

---

## 5 · Quanti punti non ho potuto verificare

Sette. Elencati perché un referto che non dice dove finisce vale meno.

1. **Nessun lettore di schermo reale.** Tutto ciò che qui riguarda l'annuncio
   viene dall'albero di accessibilità di Chrome via CDP. NVDA, JAWS e VoiceOver
   non sono stati ascoltati: cosa faccia davvero un lettore con sei
   `role=status` riscritte a 30 Hz è **dedotto**, non udito.
2. **La frequenza reale delle riscritture.** Questo browser disegna a 1,3 fps
   (SwiftShader, nessuna GPU). Il `frame % 2` del codice è confermato dal
   rapporto misurato 0,50, ma i «30 al secondo» vengono dall'aritmetica.
3. **Se il movimento ridotto lasci una dimostrazione leggibile** (fine §3):
   serve una macchina con GPU e un minuto di regime.
4. **Solo Chromium.** Firefox e Safari non sono stati provati, e l'anello del
   fuoco, `<dialog>` e `role="application"` sono esattamente le tre cose su cui
   i motori divergono di più.
5. **Nessuna prova con `forced-colors` / alto contrasto** né con
   `prefers-contrast`. Un `outline` a colore fisso è il tipo di cosa che quelle
   modalità riscrivono.
6. **Nessuna prova con lo zoom del testo al 200%** né con
   `zoom` di pagina, dove la pila dei comandi della dimostrazione è già stretta
   di suo (lo dice `stile.css` sulle finestre basse).
7. **Nessuna prova di navigazione vocale** (Voice Control / Dragon), dove i
   comandi si chiamano per nome visibile: le sei tacche del mare non hanno un
   nome visibile, solo `aria-label`.

---

## 6 · Se se ne corregge uno solo

**D1.** È l'unico difetto che fa fare all'utente il contrario di quello che
vuole, e costa una riga: allineare `aria-pressed` allo stato vero al
caricamento, come già fanno le tacche del mare. Tutto il resto di questo
documento riguarda cose che si vedono male; quella riguarda una cosa che si
capisce al rovescio.

**D2** subito dopo, e per la stessa ragione per cui esiste `#nota`: il sito ha
un'affordance che nessuno trova, e da tastiera non ha nemmeno l'anello per
dire di averla trovata.
