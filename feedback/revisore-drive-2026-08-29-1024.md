# Esito della verifica — giro Drive del 29 agosto 2026, 10:24

Originale: `nautica_2026-08-29_1024_8911bb8.md`, file Drive
`1colYC7j-6xVNfvwVEFQKN878yuxM3RMu`. E' il primo giro che attacca l'atlante PBR
invece della curva tonale o del mare, e dichiara in testa il perche': a `8911bb8`
l'ultimo commit che tocca il codice spedito e' ancora `20fa37f`, quindi il
fotogramma e' quello che i giri 06:22 e 08:23 hanno gia' visto e ripeterlo
sarebbe la voce sprecata che `CHIEDO.md` §2 vieta. Ha ragione, ed e' il secondo
giro di fila che si autolimita da solo.

**Dove ho misurato.** Su questo albero di lavoro, branch `atto-due-locale`,
HEAD `c8b967e`. Sembra un HEAD diverso dal suo e non lo e' per cio' che conta:

    git diff --quiet 20fa37f HEAD -- public/modelli/impianto.glb   ->  0

`impianto.glb` e' **byte per byte lo stesso file** che ha misurato lui; l'atto
due aggiunge `giroscopio.glb` e `propulsione.glb` e non tocca il meccanismo.
Quindi tutte le misure sotto sono sui suoi stessi byte, non su una ricostruzione.

**In una riga.** Le tre voci arrivano tutte a qualcosa di vero, e due delle tre
hanno un difetto nello stesso punto: **la maschera del footprint e' ribaltata
verticalmente**. Sulla VOCE 1 non cambia la conclusione — anzi la rafforza di
sette volte. Sulla VOCE 2 la ribalta: i 197 texel corrotti «proprio sulla pinna»
sulla pinna sono **zero**.

---

## VOCE 1 — CONFERMATA, e piu' forte di come e' scritta · due numeri di contorno cadono

**L'affermazione.** La pista lasciata aperta da `0017f12` — «se l'isola della
pinna cade nella meta' destra fittissima dell'atlante, ogni pixel pesca texel
scorrelati: e' esattamente sale e pepe» — e' falsa: `carena` sta sui trapezi
lisci a sinistra e nella banda destra non ha **un solo texel**.

**Riprodotta esatta**, rasterizzando le UV vere di `carena` dal GLB spedito
(meshopt decompresso con `MeshoptDecoder`, `KHR_texture_transform` applicata),
atlante 512²:

    mat 4 carena   77050 texel (29,4% dell'atlante)   tri = 48
    Banda destra fitta (x>360): 20125 texel etichettati, di cui carena 0,0%

Lo **0,0% e' uno zero esatto, non un arrotondamento**, e c'e' una ragione
strutturale che il suo script non stampa e che chiude la voce meglio del
conteggio:

    carena, UV dopo la texture_transform:  u [0,0041 – 0,7031]   v [0,0494 – 0,9960]
    vertici fuori da [0,1]: 0 su 96
    0,7031 x 512 = 360,0

Il bordo destro di `carena` **cade esattamente su x = 360**. E siccome nessuno
dei 96 vertici esce da `[0,1]`, lo zero non e' un artefatto del ritaglio del
rasterizzatore — che era l'unico modo in cui questo conto poteva mentire, e l'ho
controllato apposta. Il **29,7% destro dell'atlante non contiene `carena`**, per
costruzione dell'impacchettamento.

E il verso e' quello che dice lui: 48 triangoli che si prendono il 29,4%
dell'atlante vuol dire texel enormi su pannelli grandi, cioe' il contrario di un
vicinato fitto.

**Il 93,6% di `0017f12` non si riproduce.** Il bbox del footprint di `carena`
misura **66,2%** (`x[2,359] y[2,486]`), lo stesso 66% che dichiara lui. Da dove
venga il 93,6% non l'ho ricostruito: so solo che non e' il bbox. E' una mia
misura vecchia che cade, la terza di questo file.

**Le statistiche AO che porta a corredo sono calcolate su una maschera
ribaltata — e con quella giusta la sua tesi vince piu' largamente.** Il suo
`sonda-pinna.mjs` scrive l'etichetta a `label[(N-1-y)*N + x]`, cioe' capovolge
la riga; poi la usa per mascherare l'immagine letta con PIL, dove la riga 0 e'
in alto. Le due cose non sono nello stesso verso. La spec glTF mette l'origine
UV **in alto a sinistra**, quindi la riga immagine e' `v·H` senza ribaltamento.
Non l'ho deciso dalla spec, l'ho misurato — sotto, alla VOCE 2.

Con la sua maschera i suoi numeri tornano al decimale, incluso il taglio della
grana che il documento non dichiara (e' `>5`):

    maschera del revisore (ribaltata)   scuri isolati  27 = 0,035%
                                        grana fine     7,93%  contro 5,91% globale
    maschera allineata all'atlante      scuri isolati   0 = 0,000%
                                        grana fine     0,79%  contro 5,91% globale

Cioe': sotto la pinna l'occlusione non e' «appena sopra la media», e' **sette
volte e mezza piu' liscia della media dell'atlante**, e gli scuri isolati con la
firma esatta del sale e pepe non sono 27, sono **zero**. La conclusione della
voce — «il contenuto della mappa AO sotto la pinna e' liscio, il bianco pieno
non toglie una macchia che nel testo non c'e', alza il fondo» — regge *a
fortiori*. Sono i suoi numeri a essere troppo timidi, non la sua tesi.

**Cosa costa questo, in pratica.** Il giro che `0017f12` stava per far spendere
— colorare l'isola e guardare dove finisce — non va speso. E la sola prova
positiva che `0017f12` aveva («sostituire il contenuto dell'AO con bianco pieno
fa sparire la grana») non punta piu' dove sembrava puntare.

---

## VOCE 2 — PREMESSA CONFERMATA · LOCALIZZAZIONE SULLA PINNA NON RIPRODOTTA

**L'affermazione.** L'esclusione «tolta la normale, la grana resta» non scagiona
la normale, perche' toglie tutta la mappa invece dei suoi difetti; e i difetti
ci sono: 632 normali che puntano dentro la superficie, **197 proprio sulla
pinna**.

**Quello che e' vero, e va preso.** Il rilievo **metodologico** e' corretto e
non ha bisogno di misure: togliere l'intera `normalMap` toglie insieme il
rilievo cotto buono e gli eventuali texel corrotti dalla codifica, quindi quel
test non separa le due cose. E i texel corrotti esistono davvero. Riprodotti
esatti, decodificando `img0` del GLB come `v = rgb/127.5 − 1`:

    z<0 (normali rivolte all'indietro)   632 texel   (0,241%)
    speckle croma verde (g>170 & b<120)   85 texel

La normale parte webp lossy a 512² (`image[0]`, 33,3 KB, `EXT_texture_webp`), e
632 vettori invalidi in una mappa di normali sono una conseguenza plausibile del
croma-subsampling. Fin qui la voce e' in piedi.

**Quello che non regge e' il «197 sulla pinna».** Lo riproduco **solo con la
maschera ribaltata**. Con la maschera allineata all'atlante, i 632 stanno qui:

    nel gutter, mai campionati da nessuna geometria   436   (69,0%)
    dentro le isole                                   196   (31,0%)
       acciaio  116
       tenuta    80
       carena     0

**Zero su `carena`.** I 196 dentro le isole cadono su `acciaio` e `tenuta` — la
minuteria — e piu' di due terzi dei 632 stanno nel margine di cottura, dove
nessun triangolo va a pescare. La quasi-coincidenza fra i suoi 197 e i miei 196
e' un caso: sono due insiemi diversi, non lo stesso conto arrotondato.

**Come ho stabilito il verso, senza appellarmi alla spec.** In una mappa cotta,
dentro le isole ci sono pannelli piatti (texel identici al vicino) e fuori c'e'
la dilatazione del margine, che spalma bordi diversi e cambia a ogni texel. Il
test e' contare i texel identici al vicino di sinistra:

    NORMALE, texel identici al vicino sinistro (globale 47,7%)
      maschera allineata     dentro 71,7%   fuori 17,8%      <- separa 4 volte
      maschera del revisore  dentro 50,9%   fuori 43,8%      <- non separa

Una maschera che discrimina la struttura dell'immagine di quattro volte e'
allineata; una che discrimina dell'1,16 sta guardando altrove. Lo stesso verso
esce dall'AO (84,5 / 73,4 contro 79,9 / 79,0), dalla frazione di normale piatta
(73,1 / 24,2 contro 51,6 / 50,9) e dal fatto che la maschera allineata e' quella
che rende **coerente la sua stessa VOCE 1**. Quattro segnali indipendenti, tutti
dalla stessa parte.

**Cosa resta sul tavolo, e non lo decido io.** La leva che propone — spedire la
normale in KTX2/BC5 o webp lossless invece del webp lossy — **non e' una cura
per la grana della pinna**, perche' sulla pinna non c'e' niente da curare: zero
texel corrotti su 77.050. Se valga la pena spenderla lo stesso per i 196 texel
di `acciaio` e `tenuta`, e a che prezzo in byte, e' una decisione di costo del
committente, non una misura. Il numero per deciderla e' questo: **196 texel su
262.144, lo 0,075% dell'atlante, su due materiali di minuteria.**

**E la prova di causalita' che chiedeva resta non fatta**, per un motivo diverso
dal suo: lui non ha Blender, io non l'ho eseguita perche' ho tolto la pinna
dall'elenco dei posti dove la normale e' corrotta, e ri-cuocere per inseguire
zero texel non e' un esperimento. La causa della grana **resta ignota**: questo
giro ha tolto una pista (VOCE 1) e ne ha tolta una seconda (VOCE 2), non ne ha
messa nessuna.

---

## VOCE 3 — CONFERMATA su tutti i numeri, ed e' colpa mia

**L'affermazione.** La riga di §3.1 «il corredo PBR costa +122 KB ma ne fa
risparmiare 220 di geometria» e' ferma a tre revisioni fa: il repo l'ha gia'
ritrattata due volte e oggi il corredo spedito pesa 43,5 KB.

**Riprodotta esatta**, parsando i GLB spediti:

    public/modelli/impianto.glb        file 205,9 KB   immagini 43,5 KB
       image[0] impianto_bassa-normale  33,3 KB  (webp)
       image[1] impianto_bassa-ao       10,3 KB  (webp)
    public/modelli/sovrastruttura.glb  file 119,2 KB   immagini 17,6 KB
       image[0] sovrastruttura-ao       17,6 KB  (webp)

E la ritrattazione e' testualmente nei miei commit, non in una sua
ricostruzione — `git show -s e2ae489`:

    «quello che ho tolto costava sul filo 130 KB e non 220»
    scarto grezzo +122,7 / gzip +210,1 / brotli +213,5
    «Netto contro l'alta: +30,8 KB»

Il `+122` era l'uscita **grezza** di gltfpack a `3ab67d4` (309,4 → 432,1 KB),
prima di meshopt+webp; il netto vero l'ho fissato io a **+30,8 KB** in
`e2ae489`, e `0d1d6f8` ha poi ricompresso l'occlusione. La riga di §3.1 non ha
seguito nessuno dei due.

**Ed e' esattamente il guasto che questo file esiste per evitare:** §3.1 e' la
tabella dei bersagli, cioe' la prima cosa che un giro nuovo attacca. Tenerci
dentro un numero morto significa comprare un giro intero per farsi dire una cosa
che il mio stesso repo sapeva gia'. **Corretta in `CHIEDO.md`** — e' `feedback/`,
non `src/`, quindi la sistemo invece di lasciarla come numero sul tavolo.

---

## Le voci del giudizio visivo, e perche' non le chiudo io

**`DRAW 0/100` e `RECOVERY 0/100` si leggono come strumenti rotti.** E' l'aperta
§5.1 vista a schermo, e le righe esistono:

    index.html:111-112   <span class="et">Draw</span>     <output id="v-carico">0</output><i>/100</i>
    index.html:116-117   <span class="et">Recovery</span> <output id="v-recupero">0</output><i>/100</i>

Fondo scala 100 con l'ago fermo a 0 all'apertura: confermato sulle righe. **Non
ho rieseguito** i 180 s di simulazione su questo branch — il campo che vive in
0-6 resta come misurato in
[`revisore-drive-arretrati-2026-08-29.md`](revisore-drive-arretrati-2026-08-29.md).
Ritarare il fondo scala o dichiararlo accanto e' messa in scena: **numero sul
tavolo, non lo decido io.** (Correggo solo il riferimento: l'arretrato citava
`index.html:113,118`, sono 111-112 e 116-117.)

**Il cielo come rampa piatta, le tre righe di testo che si accavallano, la meta'
superiore crema su telefono, le tre proposte per i primi 3 secondi (§3.5) e il
gradiente a due-tre fermi con dithering (§3.4.1).** Sono tutte decisioni di
tavolozza e di messa in scena. **Restano al committente, per intero**, e non le
ho ne' verificate ne' istruite. La sola cosa che ci metto e' che la 1 di §3.5
(la linea d'orizzonte CSS) e' l'unica delle tre che dichiara di costare **0 byte
di rete**, e quel numero non l'ho verificato.

---

## Cosa NON ho verificato

- **Niente di visivo, niente browser.** Nessuna schermata, nessun build servito,
  nessun `vite preview`. Tutto il capitolo «Giudizio visivo» del giro — bellezza,
  confronto con Lusion/Bruno Simon/Lando Norris, cielo, accavallamento dei testi,
  mobile 390×844 — **non e' riprodotto**, ne' a favore ne' contro.
- **Niente Blender/Cycles.** La prova di causalita' della VOCE 2 (ri-cuocere in
  BC5/lossless e riguardare il primo piano) non e' stata fatta.
- **La causa della grana resta ignota.** Ho tolto due piste, non ne ho messa una.
- **Non ho verificato che i 196 texel `z<0` di `acciaio` e `tenuta` si vedano a
  schermo.** E' un conto sull'atlante, non un fotogramma: 196 texel possono
  cadere dietro un pezzo, o su una faccia mai illuminata di taglio.
- **Non ho isolato l'oggetto lama dentro `carena`** — stesso limite che dichiara
  lui. `carena` sta su due nodi (uno solo-`carena`, uno `carena`+`gomma`+
  `acciaio`), 48 triangoli in tutto; misuro il materiale, non la lama. La
  conclusione «non e' nella meta' fitta» vale comunque per la lama, che di quel
  footprint e' un sottoinsieme.
- **Non ho ricostruito da dove venga il 93,6%** di `0017f12`: so che non e' il
  bbox (66,2%), non che cosa sia.
- **Non ho rieseguito i 180 s della simulazione** per `DRAW`/`RECOVERY` su questo
  branch, che ha la propulsione dell'atto due.
- **Non ho riletto i `_v3`/`_v5`** del giro delle 07:00, che restano non
  verificati voce per voce come gia' dichiarato negli arretrati.

## Come rifare queste misure

Il suo `sonda-pinna.mjs` e il suo `glbbytes.mjs` sono nel documento Drive per
intero e girano dalla radice del repo con `node`, contro `three` gia' in
`node_modules`. **Con una correzione**: nel painter, `label[(N-1-y)*N + x]` va
letto come ribaltato quando si maschera l'immagine — o si scrive `label[y*N+x]`,
o si maschera con `numpy.flipud(label)`. Il test di allineamento (texel identici
al vicino sinistro, dentro contro fuori le isole) e' due righe e dice da solo
quale verso e' quello giusto, senza dover credere ne' a me ne' alla spec.
