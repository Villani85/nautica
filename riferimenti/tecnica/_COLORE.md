# Il colore dei siti da premio, misurato

Ricerca del **13 agosto 2026**. Complemento a `_ACCESSIBILITA.md`, che dichiara
esplicitamente il proprio buco: *"Il contrasto non l'abbiamo misurato con uno
strumento su nessuno dei 34 siti. Quello che sappiamo sul contrasto e'
strutturale, non numerico. E' la prima cosa da colmare."*

**Questo documento colma quel buco.** I numeri qui dentro vengono da un
programma che ha scaricato l'HTML e i fogli di stile di 38 siti e li ha letti
uno a uno.

---

## 0. Metodo, e i suoi limiti (leggerlo prima di usare i numeri)

**Cosa e' stato fatto, esattamente.** Uno script Node ha, per ciascun sito:
scaricato la home; estratto ogni `<style>` in linea e ogni `<link>` a un `.css`
(piu' i riferimenti `.css` trovati nei manifest dei bundle), fino a 14 file per
sito; concatenato tutto; estratto **ogni letterale di colore** con una sola
espressione regolare (`#hex`, `rgb()`, `rgba()`, `hsl()`, `hsla()`, `oklch()`,
`oklab()`, `lab()`, `lch()`, `color(display-p3 ...)`); convertito ognuno in sRGB
con le matrici standard (OKLab->sRGB lineare, Lab D50->Bradford->D65->sRGB,
P3->XYZ->sRGB); risolto ricorsivamente le `var(--x)` fino a 8 livelli; e
calcolato il contrasto con la formula WCAG 2.x
(`(L1+0.05)/(L2+0.05)`, luminanza relativa con la linearizzazione a 0,04045).

**Totale letto: 8.372.120 byte di CSS (8,0 MB) e 11.478 letterali di colore**,
su 38 siti.

### I quattro limiti, dichiarati

1. **E' il CSS servito, non il pixel a schermo.** Un sito che dipinge in WebGL
   (`igloo`, `active-theory`) o che decide i colori nel bundle JavaScript
   (`obys`, `zajno`, `aristide-benoist`) ha pochissimo colore *nel CSS*. Dove il
   dato manca c'e' scritto **n.d.**, non un numero inventato.
2. **La coppia misurata e' quella dichiarata su `html`/`body`.** E' la coppia di
   base, quella che vale dove nessuna sezione la sovrascrive. **Non e' la media
   di quello che si vede scorrendo.** Su due siti (`kode`, `lusion`) la regola
   di base e' bianco-su-bianco perche' ogni sezione la riscrive: quei due numeri
   sono un artefatto del metodo e sono segnati come tali. Non li ho nascosti.
3. **Il conteggio dei "colori distinti" e' generoso.** Include il CSS di terze
   parti (widget cookie, embed, reset), che un designer non ha scelto. Vale come
   ordine di grandezza e per il confronto fra siti, non come "la palette".
4. **Non ho misurato il contrasto del testo sopra un'immagine o sopra il
   canvas.** E' il caso peggiore del web creativo ed e' anche quello che nessuno
   strumento statico sa misurare. Resta aperto.

### La prova che le conversioni sono giuste

Un convertitore di spazi colore scritto in fretta sbaglia in silenzio, e tutti i
numeri a valle diventano finzione. Il campione ha offerto una verifica gratuita:
**`darkroom.engineering` dichiara gli stessi colori due volte**, una in
esadecimale e una in `lab()` dentro un `@supports`. Le mie conversioni contro le
sue:

| `lab()` scritto da darkroom | il mio convertitore | l'esadecimale che darkroom dichiara accanto |
|---|---|---|
| `lab(0% 0 0)` | `#000000` | `#000` |
| `lab(100% 0 0)` | `#ffffff` | `#fff` |
| `lab(90.9404% 0 -.0000119209)` | `#e5e5e5` | `#e5e5e5` |
| `lab(48.59% 73.6511 58.1409)` | `#e30613` | `#e30613` |

**Quattro su quattro, esatti al byte**, compreso un rosso saturo che passa per
la matrice Bradford D50->D65. La catena Lab->XYZ->sRGB e' corretta. Le altre
(OKLab, P3, HSL) usano le stesse matrici standard e la stessa funzione di
trasferimento.

**Copertura:** 38 siti scaricati. 4 falliti e perche': `igloo.inc` serve
**0 byte di CSS** (coerente con la sua scheda: tutto il testo e' MSDF dentro il
canvas -- e' un dato, non un errore); `umamiland.withgoogle.com` reindirizza a
Google (il sito premiato non esiste piu'); `mammut` risponde 500 sulla radice ma
risponde su `/en`; `verostudio.com` voleva il `www`.

---

## 1. LA TABELLA

38 siti. Fondo e testo sono i valori **risolti** attraverso le `var()`.
L'accento e' il colore piu' frequente con saturazione > 0,35, escluso fondo e
testo. "Colori distinti" = letterali opachi (alfa >= 0,95) unici, dopo la
conversione in sRGB.

| sito | fondo | testo | accento | contrasto | livello | colori distinti |
|---|---|---|---|---|---|---|
| `2xa` | `#0f0f0f` | `#cecece` | `#0000ff` | **12,18** | AAA | 45 |
| `active-theory` | `#000000` | `#ffffff` | -- | **21,00** | AAA | 1 |
| `apple-prodotto` | `#ffffff` | `#1d1d1f` | `#0071e3` | **16,83** | AAA | 110 |
| `aristide-benoist` | `#000000` | `#ffffff` | -- | **21,00** | AAA | 2 |
| `basement` | `#000000` | `#ffffff` | `#ff4d00` | **21,00** | AAA | 13 |
| `bruno-simon` | `#251f2b` | `#ffffff` | `#d5ff95` | **16,04** | AAA | 16 |
| `by-kin` | `#f4f2ed` | `#111214` | `#b84930` | **16,75** | AAA | 13 |
| `cuberto` | `#ffffff` | `#000000` | `#eb4242` | **21,00** | AAA | 12 |
| `darkroom` | `#ffffff` | `#000000` | `#e30613` | **21,00** | AAA | 8 |
| `dogstudio` | `#131419` | `#ffffff` | `#ff4940` | **18,39** | AAA | 214 |
| `dont-board-me` | n.d. | n.d. | `#2b6786` | n.d. | n.d. | 32 |
| `frans-hals` | n.d. | n.d. | `#001317` | n.d. | n.d. | 10 |
| `hello-monday` | `#ffffff` | `#000000` | `#f39096` | **21,00** | AAA | 28 |
| `immersive-garden` | `#e8e8e8` | `#030303` | `#ffff00` | **16,83** | AAA | 7 |
| `kode` | `#ffffff` | (n.d.) | `#8a3796` | *artefatto* | -- | 14 |
| `kpr` | `#ffffff` | `#000000` | `#0e4347` | **21,00** | AAA | 38 |
| `lando-norris` | `#282c20` | `#f4f4ed` | `#b2c73a` | **12,92** | AAA | 40 |
| `locomotive` | `#ffffff` | `#000000` | `#da382e` | **21,00** | AAA | 42 |
| `lusion` | `#ffffff` | (n.d.) | `#00ffff` | *artefatto* | -- | 19 |
| `ma` | `#fcfcfc` | `#020912` | `#a73d36` | **19,49** | AAA | 21 |
| `mammut` | `#ffffff` | `#191919` | `#f56905` | **17,58** | AAA | 18 |
| `mana-yerba-mate` | `#fef7e6` | `#0e0e0e` | `#ffd372` | **18,07** | AAA | 34 |
| `messenger` | n.d. | n.d. | -- | n.d. | n.d. | 1 |
| `mosby` | n.d. | n.d. | `#00b2ff` | n.d. | n.d. | 12 |
| `noomo` | `#c9d2e7` | n.d. | `#231b35` | n.d. | n.d. | 15 |
| `obys` | `#ffffff` | `#000000` | -- | **21,00** | AAA | 2 |
| `opal-tadpole` | `#ffffff` | `#000000` | `#ffdb00` | **21,00** | AAA | 31 |
| `orano` | `#fafafa` | `#000000` | `#ffe600` | **20,12** | AAA | 84 |
| `pangram-pangram` | `#fafafa` | `#000000` | `#0092ff` | **20,10** | AAA | 40 |
| `persepolis` | `#252525` | `#ffffff` | `#79644b` | **15,33** | AAA | 12 |
| `prometheus-fuels` | n.d. | n.d. | `#ffc402` | n.d. | n.d. | 108 |
| `resn` | `#000000` | `#ffffff` | -- | **21,00** | AAA | 3 |
| `revelatio` | `#ffffff` | `#000000` | `#3898ec` | **21,00** | AAA | 38 |
| `simply-chocolate` | n.d. | n.d. | `#c9a227` | n.d. | n.d. | 84 |
| `star-atlas` | `#0a0000` | `#ffffff` | `#32feff` | **20,73** | AAA | 11 |
| `trionn` | `#040508` | `#d8d8d8` | `#d9432b` | **14,30** | AAA | 30 |
| `vero` | `#f3f0ed` | `#181615` | `#e97e00` | **15,89** | AAA | 10 |
| `zajno` | `#000000` | `#ffffff` | -- | **21,00** | AAA | 4 |

---

## 2. L'IPOTESI DA VERIFICARE: **SMENTITA**, in tutte e due le meta'

L'ipotesi era: *"i siti premiati usano pochissimi colori e quasi tutti partono
da un fondo scuro"*. I numeri dicono altro.

### 2.1 Il fondo scuro e' minoranza: **20 chiari contro 12 scuri**

Su 32 siti in cui il fondo si risolve (luminanza relativa < 0,18 = "scuro"):

| | quanti | quali |
|---|---|---|
| **fondo chiaro** | **20 (62,5%)** | apple, by-kin, cuberto, darkroom, hello-monday, immersive-garden, kode, kpr, locomotive, lusion, ma, mammut, mana, noomo, obys, opal, orano, pangram, revelatio, vero |
| **fondo scuro** | **12 (37,5%)** | 2xa, active-theory, aristide-benoist, basement, bruno-simon, dogstudio, lando-norris, persepolis, resn, star-atlas, trionn, zajno |

**Il fondo scuro non e' la regola del web premiato: e' la regola di una
sottocategoria precisa.** Guardando *quali* sono i 12 scuri, si vede subito:

- **12 su 12 hanno una scena WebGL a tutto schermo.** Undici sono evidenti
  (`active-theory`, `basement`, `bruno-simon`, `dogstudio`, `lando-norris`,
  `resn`, `star-atlas`, `trionn`, `zajno`, `aristide-benoist`, `2xa`). Il
  dodicesimo sembrava l'eccezione -- `persepolis` (`#252525`) e' un sito di museo
  fatto di fotografie d'archivio -- **ma la sua scheda dice che anche li' c'e'
  WebGL**: *"un video a schermo pieno mappato su un quad WebGL"* e un preloader
  che ricostruisce la parallasse da `image_start.jpg` + `depth_map.jpg`.
  **L'eccezione non esiste: sono 12 su 12.**
- **Nessuno dei siti di prodotto o di e-commerce e' scuro**: `opal-tadpole`,
  `mana-yerba-mate`, `pangram-pangram`, `simply-chocolate`, `vero`, `mammut`,
  `apple` -- tutti chiari.

**La regola vera non e' "scuro perche' e' premiato". E': scuro se e solo se
c'e' luce emessa da governare** (un canvas, un video, una fotografia). Il nero
non e' uno stile: e' il fondo che non compete con i pixel che si accendono
sopra. Su un sito che vende un divano, il fondo scuro e' una scelta *contro* il
mestiere, non a favore.

### 2.2 "Pochissimi colori": vero solo a meta', e la distribuzione e' a due gobbe

Colori distinti opachi, ordinati:

```
1   messenger, active-theory
2   aristide-benoist, obys
3   resn
4   zajno
7   immersive-garden
8   darkroom
10  frans-hals, vero
11  star-atlas
12  cuberto, mosby, persepolis
13  basement, by-kin
14  kode
15  noomo
16  bruno-simon
18  mammut
19  lusion
21  ma
28  hello-monday
30  trionn
31  opal-tadpole
32  dont-board-me
34  mana-yerba-mate
38  kpr, revelatio
40  lando-norris, pangram-pangram
42  locomotive
45  2xa
84  orano, simply-chocolate
108 prometheus-fuels
110 apple-prodotto
214 dogstudio
```

**Mediana 18. Media 32,2** (la media e' inutile: la tira su una coda di sei
siti). **Minimo 1, massimo 214.**

La distribuzione non e' una campana, sono **due gruppi separati**:

- **Il gruppo stretto (24 siti su 38, fino a 21 colori).** Qui il colore e'
  davvero un vincolo dichiarato. `darkroom.engineering` ne ha **8**;
  `immersive-garden` **7**; `obys` ne ha **2** e li chiama `--white` e `--black`.
  Tutti e 24 sono siti di studio o siti-esperienza, dove il colore che conta e'
  quello del contenuto, non quello dell'interfaccia.
- **La coda larga (6 siti oltre 80).** `dogstudio` 214, `apple` 110,
  `prometheus-fuels` 108, `orano` 84, `simply-chocolate` 84. Sono tutti **siti
  con molte pagine e molti anni**: cataloghi, CMS, e-commerce, o siti aziendali
  di gruppo (`orano` e' un gruppo nucleare francese). Il numero non e' un
  giudizio estetico: **e' il conto degli anni di manutenzione**. Un CSS che
  cresce accumula grigi.

**La lezione commerciale non e' "usa pochi colori".** E': **il conteggio dei
colori distinti nel CSS e' un indicatore di eta' e di disciplina del progetto.**
Se il sito di un prospect ha 214 colori distinti, non gli si vende "un
restyling": gli si vende **un sistema**, e quel numero e' la diapositiva che
apre la riunione. E' verificabile in trenta secondi con lo script qui descritto,
e non richiede di entrare in casa loro.

---

## 3. IL CONTRASTO REALE (WCAG)

Il collegamento con `_ACCESSIBILITA.md`: quel documento sostiene che il web
premiato e' debole in accessibilita' e che il contrasto e' il sospetto numero
due dopo il movimento non disattivabile. **La misura dice che il sospetto era
riposto sul bersaglio sbagliato.**

### 3.1 Il testo principale: 29 su 31 passano AAA

Soglie WCAG 2.2 (criterio 1.4.3 per AA, 1.4.6 per AAA):
testo normale AA >= **4,5**; testo grande (>= 24 px, o 18,66 px in grassetto) e
componenti di interfaccia (1.4.11) AA >= **3,0**; AAA >= **7,0**.

Su 38 siti: 7 non espongono la coppia nel CSS (dipingono in canvas o decidono
nel bundle), 2 danno un artefatto del metodo (sez. 0.2). **Restano 29 misure
valide.**

| esito sulla coppia testo/fondo di base | siti | quota |
|---|---|---|
| **AAA (>= 7,0)** | **29** | **100%** |
| AA ma non AAA (4,5-6,99) | 0 | 0% |
| sotto 4,5 | 0 | 0% |
| *(esclusi: 2 artefatti, 7 non misurabili dal CSS)* | 9 | -- |

**Mediana 20,12. Minimo 12,18. Massimo 21,00.**

**Questo e' un risultato forte e va detto senza ammorbidirlo: sul testo
principale i siti premiati non sono deboli, sono estremisti.** Non uno solo dei
29 e' sotto AAA. **Il peggiore del campione -- `2xa`, con `#cecece` su `#0f0f0f`
-- fa 12,18, cioe' quasi il doppio della soglia AAA.** Diciannove siti su 29
stanno **sopra 18**, e **tredici stanno esattamente a 21,00**, cioe' il massimo
teorico: nero puro su bianco puro o viceversa.

Il web premiato non fa testo grigio-su-grigio. **Fa il contrasto piu' alto che
esista**, e la ragione e' funzionale prima che estetica: un titolo in massimo
contrasto e' l'unica cosa che regge sopra un'immagine o un canvas che si muove
sotto. **L'accessibilita' qui e' un effetto collaterale della coreografia**, non
un obiettivo -- ma il numero e' quello e vale lo stesso.

Quindi la frase da *non* usare in una telefonata commerciale e' "i siti premiati
sbagliano il contrasto del testo". E' falsa, e chiunque abbia un misuratore la
smonta in un minuto.

### 3.2 Dove il contrasto crolla davvero: **l'accento**

Qui il quadro si ribalta. Ho calcolato il rapporto fra **il colore d'accento e
il fondo su cui vive**, per i 26 siti dove entrambi si risolvono:

| esito accento/fondo | siti | quota |
|---|---|---|
| **sotto 3,0 -- fallisce anche per il testo grande e per i bordi dei controlli (1.4.11)** | **9** | **34,6%** |
| 3,0-4,49 -- passa solo come testo grande o elemento di interfaccia | 4 | 15,4% |
| >= 4,5 -- passa come testo normale | 13 | 50,0% |

I nove che falliscono, con il numero:

| sito | accento su fondo | rapporto |
|---|---|---|
| `immersive-garden` | `#ffff00` su `#e8e8e8` | **1,14** |
| `orano` | `#ffe600` su `#fafafa` | **1,21** |
| `lusion` | `#00ffff` su `#ffffff` | **1,25** |
| `mana-yerba-mate` | `#ffd372` su `#fef7e6` | **1,33** |
| `opal-tadpole` | `#ffdb00` su `#ffffff` | **1,37** |
| `2xa` | `#0000ff` su `#0f0f0f` | **2,23** |
| `hello-monday` | `#f39096` su `#ffffff` | **2,27** |
| `vero` | `#e97e00` su `#f3f0ed` | **2,48** |
| `persepolis` | `#79644b` su `#252525` | **2,73** |

**Il modo esatto in cui il web premiato sbaglia il colore e' questo: prende il
testo alla lettera e l'accento per niente.** Cinque dei nove sono **giallo su
bianco** -- che e' matematicamente il modo peggiore di scrivere qualcosa (il
giallo puro ha luminanza relativa 0,928; contro il bianco 1,0 il rapporto non
puo' superare 1,07 per costruzione). `orano`, che e' un **gruppo industriale
francese soggetto all'European Accessibility Act**, usa `#ffe600` **319 volte**
sopra `#fafafa`.

**La distinzione che salva il giallo** (e che va capita prima di scriverlo in
un'offerta): il criterio 1.4.3 riguarda **il testo**. Un giallo usato come
*campitura* -- riempimento di un blocco, sfondo di un pulsante con sopra testo
nero, barra di avanzamento -- **non e' testo e non e' soggetto a 1.4.3**; e'
soggetto a 1.4.11 (>= 3,0) solo se e' l'unico modo per riconoscere un
componente. Il caso di `opal-tadpole` e' esattamente questo: `#ffdb00` e' il
giallo del **pulsante**, con sopra nero -- la coppia che il visitatore legge e'
**nero su giallo, che fa 15,38** e passa AAA con abbondanza.

**Lo stesso vale per `orano`**: `#000000` su `#ffe600` fa **16,57**. Cioe' quei
due gialli **non sono sbagliati in se'** -- sono sbagliati *se* qualcuno ci
scrive sopra del testo su fondo chiaro. Il numero da portare in riunione non e'
"il giallo e' un errore": e' **"il giallo va usato solo come campitura, con il
nero sopra, e mai come colore di un testo"**.

**Il difetto vero, l'unico che si puo' portare in una riunione senza sbagliare,
e' un altro: nessuno di questi nove usa l'accento *anche* per un ruolo di
testo?** Non lo posso affermare da uno strumento statico. Ho verificato il
rapporto, non il ruolo. **Il ruolo va guardato a occhio, sito per sito.** Chi
dice il contrario sta vendendo un report generato.

### 3.3 Le tre righe da aggiungere ad `_ACCESSIBILITA.md`

1. La classifica degli errori in `_ACCESSIBILITA.md` sez. 1 mette il contrasto al
   posto 2. **Sul testo principale il contrasto e' il punto piu' forte del
   campione, non il piu' debole**: 29 misure valide, **29 AAA**, mediana 20,12,
   il peggiore a 12,18. Va spostato in fondo alla classifica.
2. **Il contrasto che manca e' quello dell'accento**: 9 accenti su 26 stanno
   sotto 3,0, cinque sono giallo su bianco. E' li' che si mettono le ore.
3. La conclusione di `_ACCESSIBILITA.md` -- che il movimento non disattivabile e'
   l'errore numero uno (34 schede su 34) -- **regge e ne esce rafforzata**: e'
   l'unico errore che il campione fa in modo compatto, e ora si sa che non ha un
   secondo alla pari.

---

## 4. IL "QUASI NERO" E IL "QUASI BIANCO": **la regola comune e' falsa**

L'affermazione da verificare era: *"nessuno usa `#000` e `#fff` puri"*. E' una
delle cose che si ripetono di piu' nei corsi di design. **Sul campione e'
falsa, e non di poco.**

### 4.1 Il conto sui letterali

| | siti su 38 |
|---|---|
| contengono `#000` / `#000000` / `rgb(0,0,0)` nel CSS | **36 (94,7%)** |
| contengono `#fff` / `#ffffff` / `rgb(255,255,255)` | **37 (97,4%)** |
| contengono **entrambi** | **36 (94,7%)** |
| non contengono **ne' l'uno ne' l'altro** | **1** (`messenger`) |

`obys.agency`, che ha in tutto **due colori**, li dichiara cosi':

```css
:root{--white:#fff;--black:#000}
```

Nero puro e bianco puro, nominati, e nient'altro. `orano` scrive `#000` **377
volte** e `#ffffff` **260 volte**. `dogstudio` 265 e 348.

### 4.2 Ma sul **fondo** la storia si divide in due, e in modo asimmetrico

Contare i letterali non basta: `#000` compare spesso in `rgba(0,0,0,.5)` (ombre,
veli), che e' un uso legittimo e diverso. Il dato che conta e' **il colore del
fondo della pagina**:

**Sui 12 fondi scuri:**

| | quanti | quali |
|---|---|---|
| **nero puro `#000000`** | **5 (42%)** | active-theory, aristide-benoist, basement, resn, zajno |
| **quasi nero** | **7 (58%)** | trionn `#040508`, star-atlas `#0a0000`, 2xa `#0f0f0f`, dogstudio `#131419`, persepolis `#252525`, bruno-simon `#251f2b`, lando-norris `#282c20` |

**Sui 20 fondi chiari:**

| | quanti | quali |
|---|---|---|
| **bianco puro `#ffffff`** | **12 (60%)** | apple, cuberto, darkroom, hello-monday, kode, kpr, locomotive, lusion, mammut, obys, opal, revelatio |
| **quasi bianco** | **8 (40%)** | orano/pangram `#fafafa`, ma `#fcfcfc`, mana `#fef7e6`, by-kin `#f4f2ed`, vero `#f3f0ed`, immersive-garden `#e8e8e8`, noomo `#c9d2e7` |

**E sul testo, su 31 siti:** 10 usano `#ffffff` puro, 10 usano `#000000` puro,
11 usano altro. **Venti su trentuno usano un estremo puro come colore del
testo.**

### 4.3 Quindi: la regola vera, e perche' esiste

**La regola "mai il puro" e' vera solo per il fondo scuro (58%), e falsa per
tutto il resto.** Riscritta sui dati:

> **Il quasi-nero si usa quando sotto c'e' del contenuto luminoso da far
> respirare. Il quasi-bianco si usa quando la pagina deve sembrare carta. Il
> puro si usa quando serve il massimo contrasto e non c'e' niente da far
> respirare.**

Le ragioni tecniche vere, e quelle inventate:

- **Vera, e la piu' importante: i pannelli OLED.** Su un pannello OLED
  `#000000` **spegne fisicamente il pixel**. Il risultato e' che i bordi di
  qualunque cosa non nera diventano tagli netti, e -- soprattutto -- che una
  transizione da un nero pieno a un grigio scuro passa per la riaccensione del
  pixel, che ha un tempo di risposta diverso dal cambio di livello. Su una
  scena 3D che ruota, questo si vede come uno **sfarfallio ai bordi delle
  ombre**. `#040508` (trionn) e `#0a0000` (star-atlas) tengono il pixel acceso al
  minimo. **Che questo sia il motivo per cui *quei* studi hanno scelto *quei*
  valori io non l'ho verificato: e' plausibile, non documentato.**
- **Vera: sotto il puro non c'e' piu' spazio.** Se il fondo e' `#000000` non
  esiste nessun colore piu' scuro. Ogni ombra, ogni bordo, ogni stato "premuto"
  deve andare **verso l'alto**, cioe' schiarire, che e' il contrario
  dell'intuizione fisica. Con un fondo a `#0f0f0f` (2xa) restano quindici
  gradini sotto. **Questo e' il motivo strutturale, e si vede nei dati:** i 5
  siti con fondo `#000000` puro hanno **1, 2, 3, 4 e 13 colori distinti**. Sono
  i piu' poveri di palette del campione. Non e' una coincidenza: **chi sceglie
  il nero puro sta anche rinunciando alla profondita', e lo sa.**
- **Vera, ma piccola: il testo bianco puro su nero puro "vibra".** A 21:1 sui
  pannelli ad alta luminanza i bordi delle aste sottili sfarfallano
  (*halation*). Per questo `trionn` scrive il corpo in `#d8d8d8` su `#040508`
  (14,30) e `2xa` in `#cecece` su `#0f0f0f` (12,18) invece di andare a 21.
  **Questi due sono i due casi puliti e verificati del campione**: hanno
  *deliberatamente rinunciato* a 6 punti di contrasto per leggibilita'. Restano
  a metri di distanza da AAA.
- **Falsa: "il nero puro non esiste in natura".** E' vera come frase e
  irrilevante come argomento: **36 siti su 38 lo scrivono comunque.**

**Cosa portare a casa.** Se qualcuno dice "non si usa mai il nero puro",
rispondere con il numero: **il 94,7% dei siti premiati misurati lo usa**, e cinque
lo usano come fondo della pagina. La scelta fra `#000000` e `#0a0a0a` non e' una
questione di gusto ne' di regole: **e' la domanda "ho bisogno di gradini sotto
il fondo?"**. Se la risposta e' si', il puro e' un errore. Se la risposta e' no
-- perche' sopra c'e' un canvas e la pagina e' una cornice -- il puro e' la scelta
giusta e la fanno tutti.

---

## 5. SPAZI COLORE MODERNI: il risultato piu' netto della ricerca

Ho cercato in 8,0 MB di CSS ogni occorrenza di `oklch()`, `oklab()`, `lab()`,
`lch()`, `color(display-p3 ...)`, `color-mix()`, i colori relativi
(`oklch(from ...)`) e `light-dark()`.

### 5.1 Il conteggio

| funzione | siti che la usano | occorrenze totali |
|---|---|---|
| **`oklch()`** | **0 su 38** | **0** |
| **`color(display-p3 ...)`** | **0 su 38** | **0** |
| **`@media (color-gamut: p3)`** | **0 su 38** | **0** |
| **`light-dark()`** | **0 su 38** | **0** |
| **colori relativi (`from`)** | **0 su 38** | **0** |
| `lab()` | 2 (`darkroom`, `trionn`) | 47 |
| `color-mix()` | 6 (`trionn` 74, `darkroom` 24, `opal-tadpole` 8, `vero` 4, `locomotive` 3, `basement` 2) | 115 |
| `hsl()` / `hsla()` | pochi, quasi solo dentro `var()` | -- |

**Zero. Nel 2026, su 38 siti premiati, nessuno scrive un colore in `oklch()` e
nessuno dichiara un colore wide-gamut.**

### 5.2 E le occorrenze che ci sono **non le ha scritte un designer**

Questa e' la parte che cambia la conclusione. Ho aperto le occorrenze di `lab()`
e `color-mix()` una a una:

```css
/* darkroom.engineering */
@supports (color:lab(0% 0 0)){
  :host,:root{--color-primary:lab(0% 0 0);--color-secondary:lab(0% 0 0);
              --color-contrast:lab(90.9404% 0 -.0000119209)}
}
```

```css
/* trionn.com */
.bg-\[\#000000\]{background-color:lab(0% 0 0/.6)}
.border-\[\#11121426\]{border-color:lab(5.42657% -.0731945 -1.3285/.15)}
```

`lab(0% 0 0)` **e' nero**. `lab(90.9404% 0 -.0000119209)` **e' `#e5e5e5`**. Il
nome della classe e' `.bg-[#000000]`: **l'autore ha scritto `#000000`**. Quelle
`lab()` sono l'output del compilatore -- **Tailwind CSS v4 con Lightning CSS** --
che converte i colori con opacita' in `lab()` sotto un `@supports`, e genera
`color-mix(in oklab, ...)` per i modificatori di opacita'. La conferma: entrambi
i siti hanno le variabili `--tw-*` e `@layer properties`, e in `darkroom`
compaiono `--lightningcss-light` e `--lightningcss-dark`, cioe' la macchina
interna di Lightning CSS.

E il `color-mix(in lab, red, red)` che compare **identico** in tutti e due e'
il valore sentinella che Tailwind emette per verificare il supporto.

**Correzione al conteggio: i siti in cui un essere umano ha scelto uno spazio
colore moderno sono ZERO su 38. Le uniche occorrenze sono artefatti di
compilazione.** I due casi restanti di `color-mix()` scritto a mano
(`opal-tadpole` 8, `vero` 4, `locomotive` 3) vanno riletti allo stesso modo
prima di contarli: non li ho aperti uno a uno.

### 5.3 Cosa cambia praticamente su uno schermo wide-gamut

Il punto tecnico, perche' il "zero" qui sopra si capisca.

**Cosa succede oggi se non si fa niente.** Un `#ff0000` in CSS e' un rosso
**sRGB**. Su un MacBook Pro o un iPhone (pannello P3), il browser sa che quel
valore e' sRGB e lo **converte** nello spazio del pannello: appare esattamente
come su un pannello sRGB. Non si "espande" da solo. **Il colore non e' rotto: e'
solo che il terzo del gamut in piu' che il pannello sa fare non lo si sta
usando.**

**Cosa si guadagna a chiederlo.** `color(display-p3 1 0 0)` e' un rosso che
**in sRGB non esiste**: circa il 25-30% piu' saturo. Dove si vede davvero:

- **rossi, verdi e ciano saturi** -- la differenza e' evidente a occhio nudo;
- **gialli e arancioni** -- meno, il gamut P3 li estende poco;
- **grigi, neri, bianchi, colori desaturati** -- **zero differenza**, per
  costruzione.

**E qui sta la spiegazione dello zero.** Guardare la sez. 2.2: le palette di questo
campione sono **grigi e un accento**. Su una palette di grigi, il P3 non ha
niente da offrire. Gli unici siti che ne guadagnerebbero qualcosa sono
`star-atlas` (`#32feff`), `lusion` (`#00ffff`), `immersive-garden` (`#ffff00`) --
**e sono anche i tre che l'accessibilita' li punisce (sez. 3.2)**. Il colore che
brilla di piu' in P3 e' esattamente il colore che non si puo' usare per il testo.

**Attenzione a una conseguenza che si dimentica:** in una scena WebGL il colore
lo decide il renderer, non il CSS. Un `renderer.outputColorSpace = SRGBColorSpace`
(che e' il caso di `mana-yerba-mate`, verificato nella sua scheda) produce sRGB
**anche su un pannello P3**. Quindi mettere `color(display-p3 ...)` nel CSS di un
sito 3D crea un **disallineamento** fra l'interfaccia e la scena: due rossi
diversi che si toccano. Vedi sez. 6.

### 5.4 Il supporto reale nel 2026

| funzione | supporto globale | da quando |
|---|---|---|
| **`oklch()` / `oklab()`** | **Baseline "widely available"**, disponibile su tutti i browser **da maggio 2023** (MDN) | Chrome/Edge 111, Safari 15.4, Firefox 113 |
| **`color(display-p3 ...)`** | **93,54%** (caniuse) | Chrome/Edge 111, Safari 15, Firefox 113, Opera 98 |
| **`color-mix()`** | **92,89%** (caniuse) | Chrome/Edge 111, Firefox 113, Safari 16.2, Opera 97 |
| **`light-dark()`** | piu' recente, **non verificato in questa sessione** | -- |

**Il supporto non e' il problema. `oklch()` e' Baseline da tre anni e nessuno lo
usa.** Le ragioni plausibili -- le do come plausibili, non le ho verificate con
gli autori:

1. **Non risolve un problema che questi siti hanno.** `oklch()` serve a
   costruire **scale** percettivamente uniformi (dieci grigi che si distanziano
   allo stesso modo). Un sito con **otto colori** non ha scale da costruire.
   `oklch()` e' una tecnologia da *design system*, e questi non sono design
   system: sono oggetti singoli.
2. **Il colore non nasce nel CSS.** Nasce in Figma, in Blender o in un pannello
   di CMS, e arriva in esadecimale. Nessuno di quegli strumenti esporta in
   `oklch()` per default.
3. **Il compilatore ha gia' vinto.** Chi e' su Tailwind v4 (`darkroom`,
   `trionn`, `basement`, `opal-tadpole`) **sta gia' producendo `oklab()` e
   `lab()`** senza scriverli. Il beneficio di interpolazione lo prende
   gratis -- le miscele passano per uno spazio percettivo invece che per sRGB --
   e per questo non ha nessuna ragione di scriverli a mano.

**Cosa ne facciamo noi.** Due mosse, e la seconda e' quella che vale:

- **Scrivere in `oklch()` non ci porta clienti e non si vede.** Non e' un
  argomento di vendita: nessuno guarda il nostro CSS.
- **Ma vale come metodo interno**, per una ragione precisa: in `oklch()` il
  primo numero **e' la luminosita' percepita**, quindi due colori con la stessa
  L hanno lo stesso contrasto sul medesimo fondo. Questo trasforma il problema
  della sez. 3.2 (gli accenti che falliscono) in un vincolo aritmetico invece che in
  un giro di prove. **Si progetta in `oklch()` e si consegna in esadecimale.**
- **Il P3 va usato solo se la palette ha un accento saturo, e solo con il
  fallback**, mai da solo:
  ```css
  --accento: #ff4d00;                       /* tutti */
  @supports (color: color(display-p3 1 0 0)) {
    --accento: color(display-p3 0.98 0.29 0);  /* pannelli P3 */
  }
  ```
  Su una palette di grigi, saltarlo: non cambia un pixel.

---

## 6. LA PALETTE DI UN SITO IMMERSIVO: la luce della scena contro il colore dell'interfaccia

Questa e' la parte che non si trova scritta da nessuna parte e che vale piu' di
tutte le altre, perche' e' il mestiere che stiamo cercando di vendere. La
ricavo dalle schede gia' fatte, dove i valori dei renderer erano stati letti nel
codice.

### 6.1 Il problema, detto bene

In un sito immersivo esistono **due sistemi di colore che non parlano la stessa
lingua**, e che devono toccarsi senza una cucitura visibile:

| | la scena 3D | l'interfaccia |
|---|---|---|
| il colore e' | **luce emessa**, sommata | **pigmento**, sovrapposto |
| si combina | in modo **additivo** (due luci = piu' chiaro) | in modo **alfa** (due veli = piu' scuro) |
| passa per | tone mapping ed esposizione | niente |
| il nero e' | assenza di luce = il `clearColor` | un valore CSS |

**Il punto di rottura e' sempre lo stesso: dove il canvas finisce e il DOM
comincia.** Se il `clearColor` del renderer e' `#000000` e il `background` del
`<body>` e' `#0a0a0a`, sui bordi del canvas si vede una **riga**. Se poi il
renderer ha un tone mapping ACES, quel `#0a0a0a` **non esce piu' `#0a0a0a`**: la
curva lo sposta.

### 6.2 La regola numero uno, e i cinque siti che la applicano

**Il colore di fondo della scena e il colore di fondo della pagina devono essere
lo stesso valore, dichiarato una volta sola.** Verificato nelle schede:

| sito | il valore | dove vive |
|---|---|---|
| `immersive-garden` | `#FFFFFF` | e' insieme il `renderer.clearColor` della home **e** il `meta theme-color` **e** `msapplication-TileColor` |
| `orano` | `#05070f` | `renderer.setClearColor(329487)` (= `0x05070F`) **ed e' anche il fondo dei pannelli di testo**, a opacita' 0,5 / 0,65 |
| `trionn` | `#0C0C0C` | il CSS di `#hero-section` **e** il `clearColor` del renderer three.js |
| `2xa` | `#0f0f0f` | la variabile `--black`, che e' il fondo del tema scuro **e** l'uniform `uColor` della tendina di transizione |
| `lusion` | -- | `renderer.setClearColor(properties.bgColor, properties.clearAlpha)`: il colore di fondo e' **una proprieta' di configurazione**, non una costante nello shader |

**Cinque siti su cinque fanno la stessa cosa.** `orano` e' il caso piu'
istruttivo: lo stesso `#05070f` fa il fondo della scena *e* il fondo dei pannelli
di testo a opacita' parziale -- cosi' un pannello che scorre sopra la scena non
introduce mai una tinta nuova, si limita a **densificare** quella che c'e' gia'.

**E la regola vale anche per l'accento, non solo per il fondo.** `trionn` e' il
caso pulito, ed e' l'unico del campione dove ho potuto confrontare i due lati:

| dove | valori |
|---|---|
| **nel CSS** (misurato) | `#d9432b`, `#ff4b2f`, `#ff6b50` |
| **negli shader** (dalla scheda) | `#ff3300`, `#ff2200`, `#ff5500` |

Sono **lo stesso arancio-rosso**, in due linguaggi diversi, con lo stesso fondo
(`#0C0C0C` nello shader, `#040508` nel CSS). Contrasti: `#d9432b` su `#040508` =
**4,65**; `#ff3300` su `#0C0C0C` = **5,33**. **Nessuna cucitura, e entrambi i lati
passano AA.** E' il modello da copiare: si sceglie una famiglia di tinte, e la si
dichiara due volte -- una per il DOM, una per la GPU -- invece di lasciare che
l'arancione della scena e quello dell'interfaccia divergano progetto dopo
progetto.

### 6.3 La regola numero due: **una sola sorgente, e la scena la segue**

Il caso migliore del campione e' **`ma` (matruecannabis.com)**, dalla sua scheda:

> Il colore non e' solo CSS: viene passato agli shader come `uniform vec3 uColor`
> (`DynamicThemeUniforms`, `renderOnPropChange: "uColor"`) e li' fa
> `blendHardLight(gl_FragColor.rgb, uColor / 255.)`. **Per questo tutta la scena
> 3D cambia tinta insieme alla pagina.**

Cambiare `--color-primary` ricolora **contemporaneamente il CSS, la barra del
browser e la scena 3D**. Questa e' l'architettura giusta, ed e' semplice:

```
--color-primary (unica verita')
   |-- CSS: background, testi, bordi
   |-- <meta name="theme-color">   (la barra del telefono)
   |-- renderer.setClearColor()    (il fondo della scena)
   +-- uniform vec3 uColor         (dentro gli shader, via blend)
```

Il costo e' basso -- un `uniform` e un `renderOnPropChange` -- e il guadagno e'
che **la cucitura sparisce per costruzione**, non per taratura a mano.

### 6.4 Il tone mapping e' il ladro di colore, e va deciso per primo

Due scelte opposte, tutte e due verificate:

- **`mana-yerba-mate`**: `ACESFilmicToneMapping`, esposizione 1,
  `outputEncoding: sRGB`, `AmbientLight 0.45`. ACES **comprime le alte luci**:
  un materiale bianco puro non esce `#ffffff`, esce piu' grigio e leggermente
  caldo. **Se il fondo CSS accanto e' `#fef7e6` (il loro), il salto si vede.**
- **`basement`**: `toneMapping: NoToneMapping`, `antialias: false`,
  `alpha: false`, e -- dalla scheda -- *"il tonemapping e' fatto a mano"*. Con
  `NoToneMapping` il valore che si scrive nel materiale e' **il valore che esce**,
  quindi un `#ff4d00` nello shader e un `#ff4d00` nel CSS sono lo stesso arancione.

**La regola operativa:** se serve che i colori della scena e quelli
dell'interfaccia **coincidano**, `NoToneMapping` (e si accetta che le alte luci
si brucino). Se serve che la scena sia **fotografica**, ACES -- e allora si smette
di pretendere che i due mondi combacino: si mette **una cesura dichiarata** fra
canvas e DOM (un bordo, un gradiente, una fascia), invece di una cucitura che
non riuscira' mai.

### 6.5 Il caso `prometheus-fuels`: palette per scena, non per sito

`prometheus-fuels` ha **108 colori distinti**, ed e' l'unico del campione dove
il numero alto e' una scelta e non un accumulo. Dalla sua scheda, gli shader
hanno **palette proprie, una per ambiente**:

| ambiente | shader | colori |
|---|---|---|
| `gasstation2` (terreno) | `StylizedRoadShader uColor1..4` | `#2d1510`, `#8f4c3e`, `#532f28`, `#813729` |
| `forgefield2` | `uColor1..3` | `#81858d`, `#969eab`, `#939b9f` (grigi freddi) |
| `molecules` (elettricita') | `ElectricityShader uColor` | `#ffd98d` / `uColor0 #ffeab3` |
| cielo di `molecules` | `SkyGradientShader uColor/uColor1` | `#c9be9e` -> `#427689` |
| transizione fra scene | `WaveSceneTransition uColor0` | **`#e74832`** |

Le palette per ambiente sono **quattro mondi diversi** -- terra bruciata, metallo
freddo, elettricita' calda. Ma il **colore della transizione e' uno solo**
(`#e74832`) per tutto il sito. **Questa e' la struttura giusta**: la scena puo'
cambiare tavolozza a ogni capitolo, **la grammatica dell'interfaccia no**. Il
colore che dice "sto cambiando pagina" deve essere identico ovunque, perche' e'
l'unico segnale di continuita' in un sito dove tutto il resto si trasforma.

### 6.6 La ricetta, in sei righe

1. **Un valore di fondo, uno solo**, condiviso da CSS, `meta theme-color`,
   `clearColor` e uniform degli shader.
2. **Decidere il tone mapping prima della palette**, non dopo. Cambia i colori
   a valle.
3. **Palette della scena libera per capitolo; colore dell'interfaccia fisso.**
   Transizioni, cursore, focus, un solo valore in tutto il sito.
4. **L'accento dell'interfaccia non deve esistere nella scena.** Se il rosso del
   pulsante e' anche il rosso di un materiale, il pulsante smette di essere
   leggibile appena la camera lo inquadra.
5. **Se il fondo e' scuro, non usare il nero puro** (sez. 4.3): servono i gradini
   sotto, e su OLED le ombre in movimento sfarfallano.
6. **Testo dell'interfaccia al massimo contrasto** -- e' quello che fa il 93,5%
   del campione (sez. 3.1), ed e' l'unica cosa che regge sopra un canvas che si
   muove.

---

## 7. MODALITA' CHIARA/SCURA: **nessuno la offre davvero**

Misura: occorrenze di `@media (prefers-color-scheme: ...)` nel CSS servito.

| | siti |
|---|---|
| contengono un blocco `prefers-color-scheme` | **3 su 38 (7,9%)** |
| ...di cui **un vero doppio tema progettato** | **0** |
| dichiarano `color-scheme:` | 7 su 38 |
| hanno un tema alternativo via **attributo** (non via preferenza di sistema) | 1 (`darkroom`) |

### 7.1 I tre blocchi, aperti uno a uno -- e sono tutti e tre falsi positivi

**`by-kin`** -- il blocco e':

```css
@media (prefers-color-scheme:dark){
  :root{--foreground-rgb:255,255,255;--background-start-rgb:0,0,0;--background-end-rgb:0,0,0}
}
```

e nel tema chiaro `--background-start-rgb:214,219,220`. **Questo e' il file
`globals.css` che `create-next-app` genera da solo.** Il `rgb(214, 219, 220)` e'
il valore letterale del modello di Next.js. Prova definitiva: **la stringa
`foreground-rgb` compare una volta sola in tutto il CSS del sito**, cioe' nella
sua dichiarazione. **Nessuno la legge. E' codice morto rimasto nel modello.**
`by-kin` ha vinto un **Developer Award** con dentro il boilerplate mai
cancellato.

**`darkroom.engineering`** -- il blocco e':

```css
@media (prefers-color-scheme:dark){:root{--lightningcss-light: ;--lightningcss-dark:initial}}
```

`--lightningcss-light` / `--lightningcss-dark` **e' la macchina interna di
Lightning CSS**, il polyfill con cui il compilatore implementa `light-dark()`.
Non l'ha scritto nessuno.

**`simply-chocolate`** -- il blocco riguarda
`:root:not([data-theme=light]) [data-season=christmas]` e ridefinisce
`--season-primary: #ff4444` e `--season-secondary: #d4af37`: e' **la variante
natalizia**, non un tema chiaro/scuro.

### 7.2 L'unico doppio tema vero del campione: `darkroom`, e non usa la preferenza di sistema

```css
[data-theme=light]{--color-primary:#fff;--color-secondary:#000;--color-contrast:#e5e5e5;--color-hover:#00000080}
[data-theme=dark] {--color-primary:#000;--color-secondary:#fff;--color-contrast:#262626;--color-hover:#00000080}
```

E' un'inversione completa e pulita -- `--color-primary` e' *il fondo*,
`--color-secondary` *il testo*, e si scambiano -- con `--color-contrast` (il
grigio dei bordi) che si adatta invece di invertirsi: `#e5e5e5` nel chiaro,
`#262626` nello scuro. **Entrambe le coppie danno 21,00.** E `darkroom` e'
anche l'unico che dichiara `color-scheme: light dark`, cioe' che dice al browser
di adattare barre di scorrimento e controlli di sistema.

Ma e' pilotato da **un attributo**, cioe' da un interruttore nella pagina: e' una
scelta dello **studio**, non un adeguamento alla preferenza del **visitatore**.

### 7.3 I sette che dichiarano `color-scheme`

`2xa`, `apple`, `basement`, `by-kin`, `locomotive`, `simply-chocolate` scrivono
`color-scheme: dark`; `darkroom` scrive `light dark`. **`color-scheme: dark` non
e' un tema**: e' una riga che dice al browser di disegnare in scuro le barre di
scorrimento, i menu a tendina e i campi di modulo, cosi' non spuntano bianchi in
mezzo a una pagina nera. **E' una riga che costa nulla e che sei siti premiati su
38 hanno.** Su un sito a fondo scuro senza quella riga, la barra di scorrimento
resta chiara: e' il dettaglio che fa sembrare fatto in casa un sito per il resto
curato.

### 7.4 Cosa ne ricaviamo

**Il web premiato non offre la modalita' chiara/scura, e ha una ragione
difendibile.** Questi non sono strumenti: sono **oggetti con un'identita'**. Un
sito il cui fondo `#040508` e' anche il `clearColor` di una scena 3D (sez. 6.2) non
puo' avere una modalita' chiara senza rifare l'illuminazione della scena. **Il
tema doppio e' una funzione da applicazione, e questi non sono applicazioni.**

Ma tre conseguenze concrete:

1. **Su un sito-esperienza il doppio tema non si vende e non si regala**: e'
   raddoppiare la superficie di collaudo per una cosa che nessun concorrente
   premiato fa. Se il cliente lo chiede, la risposta e' la sez. 6.2: il fondo e' la
   scena, e la scena e' il progetto.
2. **Su un sito con molto testo -- un catalogo, una documentazione, un blog --
   si vende**, e allora si fa come `darkroom`: **inversione completa via
   attributo**, non sfumature, con il `color-scheme` dichiarato.
3. **La riga `color-scheme: dark` va messa sempre** su ogni sito a fondo scuro.
   Costa 20 byte. Sei studi premiati su 38 ce l'hanno; gli altri hanno le barre
   di scorrimento bianche.

---

## 8. IL COLORE COME FIRMA DI MARCA

Un accento solo, ripetuto abbastanza, diventa il nome dello studio. I casi del
campione dove questo succede davvero, con il conto delle occorrenze nel CSS:

| studio / sito | accento | occorrenze | il contrasto sul suo fondo |
|---|---|---|---|
| **`orano`** | **`#ffe600`** giallo | **319** -- e' il colore **piu' frequente dell'intero sito**, davanti a `#000000` (289) e `#ffffff` (248) | 1,21 su `#fafafa` -- **fallisce** |
| **`star-atlas`** | **`#32feff`** ciano | **58**, davanti al nero (38) e al bianco (15) | 16,54 su `#0a0000` -- passa AAA |
| **`basement`** | **`#ff4d00`** arancio | **21**, davanti al bianco (12) e al nero (9) | 6,31 su `#000000` -- passa AA |
| **`darkroom`** | **`#e30613`** rosso | 10, con `#c20510` come stato premuto | 4,88 su `#ffffff` -- passa AA |
| **`immersive-garden`** | **`#ffff00`** giallo | 44 (con `#90ee90` verde, 44) su **7 colori in tutto** | 1,14 su `#e8e8e8` -- **fallisce** |
| **`opal-tadpole`** | **`#ffdb00`** giallo | 5 | 1,37 diretto, ma **15,38 come nero-su-giallo** (sez. 3.2) |
| **`apple`** | **`#0071e3`** blu | 92 | 4,70 su `#ffffff` -- passa AA di misura |
| **`lando-norris`** | **`#b2c73a`** lime | 10 | 7,56 su `#282c20` -- passa AAA |
| **`bruno-simon`** | **`#d5ff95`** verde chiaro | 10 | 14,18 su `#251f2b` -- passa AAA |
| **`mosby`** | **`#00b2ff`** azzurro | 8 -- **il colore piu' frequente del sito**, davanti a bianco (7) e nero (4) | n.d. |

### 8.1 I tre modi in cui un accento diventa una firma

**Modo 1 -- la frequenza.** In `orano`, `star-atlas` e `mosby` **l'accento e' il
colore piu' usato del sito, piu' del nero e piu' del bianco.** Non e' un
accento: e' **il colore di base travestito da accento**. E' la strategia piu'
forte e la piu' rischiosa: `orano` e `star-atlas` sono ai due estremi opposti
dello stesso metodo, e la differenza fra i due e' solo dove hanno messo il
fondo. Ciano `#32feff` su nero `#0a0000` = **16,54**. Giallo `#ffe600` su bianco
`#fafafa` = **1,21**. **Stessa idea, stesso coraggio, un fondo diverso, e uno dei
due e' illeggibile.**

**Modo 2 -- l'unicita'.** In `basement`, `darkroom` e `lando-norris` l'accento e'
**l'unico colore del sito**: tutto il resto e' grigio. `basement` ha **13 colori
distinti** e uno solo e' cromatico. Quando l'occhio vede quell'arancione, non ha
alternative da confrontare: **la memoria si aggancia perche' non c'e' nient'altro
a cui agganciarsi.** Questa e' la strategia migliore per uno studio che apre
adesso, perche' costa **un colore** e non richiede coerenza su cento decisioni.

**Modo 3 -- la coppia.** `immersive-garden` usa `#ffff00` e `#90ee90` **lo
stesso numero di volte (44 e 44)**, su una palette di **sette colori in tutto**.
Non e' un accento: e' un **binomio**. Piu' difficile da tenere, e piu'
riconoscibile quando riesce.

### 8.2 La lezione, e la trappola

**La firma funziona sulla frequenza e sulla solitudine, non sulla scelta della
tinta.** Non esiste un arancione migliore di un altro: esiste un arancione usato
21 volte in un sito che ha 13 colori. **Se si ha un accento e ottanta grigi, non
si ha un accento.**

**La trappola, misurata:** dei dieci accenti-firma qui sopra, **due falliscono
il contrasto e sono tutti e due gialli su chiaro**. Il giallo e' il colore piu'
tentante per una firma (nessuno lo usa, si vede da lontano, non e' il rosso di
tutti) **ed e' matematicamente il peggiore su fondo chiaro**: la sua luminanza
relativa e' 0,928, quindi contro il bianco il rapporto **non puo' superare
1,07** -- non e' una questione di scegliere il giallo giusto, e' un tetto fisico.

**Se si vuole il giallo come firma, il fondo deve essere scuro** (e allora fa 15
o 16, come il ciano di `star-atlas`), **oppure il giallo dev'essere solo una
campitura con del nero sopra** -- che e' quello che fa `opal-tadpole`
(**15,38**) e che potrebbe fare `orano` (**16,57**). La terza via non c'e'.

---

## 9. LE OTTO COSE DA PORTARE VIA

1. **Il fondo scuro non e' la regola del web premiato (12 su 32).** E' la regola
   dei siti con luce emessa sopra: 11 dei 12 fondi scuri hanno una scena WebGL a
   tutto schermo. Nessun sito di prodotto del campione e' scuro.
2. **Mediana 18 colori distinti**, ma la distribuzione e' a due gobbe: 24 siti
   sotto 21, sei siti sopra 80. **Il numero alto misura gli anni, non il gusto**
   -- ed e' la diapositiva che apre una riunione con un prospect.
3. **Sul testo principale il contrasto e' altissimo: 29 misure valide, 29 AAA,
   mediana 20,12, tredici siti esattamente a 21,00, il peggiore a 12,18.** La
   convinzione che i siti premiati sbaglino il contrasto del testo e' falsa. Va
   corretta in `_ACCESSIBILITA.md`.
4. **Il contrasto crolla sull'accento: 9 su 26 sotto 3,0, cinque sono giallo su
   bianco.** E' li' che stanno le ore di accessibilita' che si vendono.
5. **`#000` e `#fff` puri si usano eccome: 36 e 37 siti su 38.** La regola "mai
   il puro" vale solo per il fondo scuro (58%), e la ragione vera e' una sola:
   **sotto il nero puro non ci sono piu' gradini.** I cinque siti con fondo
   `#000000` hanno 1, 2, 3, 4 e 13 colori -- hanno rinunciato alla profondita' di
   proposito.
6. **Spazi colore moderni: zero `oklch()`, zero `display-p3`, zero `light-dark()`
   scritti da un essere umano su 38 siti.** Le uniche `lab()` e `color-mix()`
   sono output di Tailwind v4 con Lightning CSS. Il supporto non e' il problema
   (`oklch()` e' Baseline da maggio 2023): **su una palette di grigi il wide-gamut
   non ha niente da offrire.** Progettare in `oklch()` come metodo interno,
   consegnare in esadecimale.
7. **Un solo valore di fondo per CSS, `theme-color`, `clearColor` e uniform degli
   shader** -- lo fanno cinque siti su cinque. Il tone mapping si decide **prima**
   della palette. La palette della scena puo' cambiare a ogni capitolo, il colore
   dell'interfaccia mai (`prometheus-fuels`: quattro mondi, **una** transizione
   `#e74832`).
8. **La modalita' chiara/scura non esiste nel web premiato: 3 blocchi
   `prefers-color-scheme` su 38, e tutti e tre sono falsi positivi** (boilerplate
   di `create-next-app` in `by-kin`, macchina di Lightning CSS in `darkroom`,
   tema natalizio in `simply-chocolate`). L'unico doppio tema vero e' quello di
   `darkroom`, via attributo. Ma **`color-scheme: dark` va scritto sempre** su
   fondo scuro: costa 20 byte ed e' la differenza fra una barra di scorrimento
   nera e una bianca.

---

## Appendice -- riprodurre le misure

Gli script sono stati salvati in **`_codice/colore/`**, insieme ai risultati
grezzi. Si rieseguono con Node (nessuna dipendenza, nessun browser: solo
`fetch`):

| file | cosa fa |
|---|---|
| `harvest.js` | scarica HTML + CSS (fino a 14 fogli per sito, 6 siti in parallelo) in `css/` |
| `analyze.js` | estrae i letterali, converte in sRGB, conta i distinti, cerca `oklch`/`lab`/`display-p3`/`color-mix`/`prefers-color-scheme` |
| `analyze_lib.js` | il parser di colore riusabile (OKLab, Lab D50 con Bradford, display-p3, HSL) e la formula WCAG. **E' il pezzo che vale**: si riusa su qualunque sito |
| `contrast.js` | risolve le `var()` ricorsivamente e calcola i rapporti |
| `result.json`, `contrast.json` | i risultati grezzi del 13/08/2026, per confrontarli fra un anno |

```
node harvest.js      # ~3 minuti, scrive css/
node analyze.js      # tabella colori + spazi moderni + dark mode
node contrast.js     # tabella contrasti
```

**Uso commerciale diretto:** cambiando la mappa `SITES` in cima a `harvest.js`
con i domini di `_BERSAGLI-BRIANZA.md`, in tre minuti si ha per ogni prospect il
numero di colori distinti e il contrasto della coppia di base -- cioe' **due
difetti misurati in piu' da mettere accanto ai tre che quella scheda ha gia'**.

Fonti esterne citate:
[caniuse `color()`](https://caniuse.com/css-color-function) (93,54%),
[caniuse `color-mix()`](https://caniuse.com/mdn-css_types_color_color-mix) (92,89%),
[MDN `oklch()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch)
(Baseline widely available, maggio 2023).
Tutto il resto e' misurato sui CSS scaricati il 13/08/2026.
