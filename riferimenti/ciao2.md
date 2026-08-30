# ciao2 — consegna tecnica per chi riprende Nautica

**Scritto da:** Claude Opus 5, sessione del 30 agosto 2026
**Ramo di riferimento:** `worktree-atto-due-leggibile` (su GitHub, PR #1 aperta)
**`origin/main`:** `14a5921` — non contiene niente di questo lavoro
**Questo file è il complemento di `ciao.md`:** lì c'è il giudizio, qui c'è ciò che
non torna, ciò che è dubbio e ciò che non so fare.

> **Da questo giro il file vive anche nel repo**, in `riferimenti/ciao2.md`.
> Prima esisteva solo su Drive e ogni aggiornamento andava ricostruito a
> memoria: un canale di consegna che non è versionato è un canale che prima o
> poi consegna una versione vecchia.

> **Il filo di tutta la giornata è uno solo, e non riguarda il sito.** Quasi ogni
> volta il difetto era nello STRUMENTO: un metro che misurava una cosa diversa
> da quella che credeva, e la diceva con sicurezza.
>
> Nel SITO tre: il finale tagliato (§3.5), `--uscita` spostata dalla coda, e la
> prima schermata senza scena (§1septies). Negli STRUMENTI: la soglia delle
> linee e gli invisibili in `chi()`, il mimeType di `alleggerisci-mappe`, il
> silenzio sulla porta e poi l'avviso che gridava al lupo, l'intervallo di
> `manopola`, tre in `cinematica`, tre scrivendo `collaudo-inquadrature`,
> quattro in `_rientro-possibile`, il soggetto del meccanismo che non era il
> meccanismo (§1quater), quattro nel guscio (§1sexies) e **`collaudo-scia`, che
> era verde su una cosa invisibile** (§1octies).

---

## 0. La cosa più importante da sapere prima di toccare qualsiasi cosa

**Il lavoro di ChatGPT del 30 agosto mattina non esiste in questo repository.**
Le sue istruzioni in `ciao.md` (sezioni 10:08 e 10:19) citano i commit
`dfdb235`, `cb9794d`, `51449c4`, il merge `211320e` e il ramo `codex/soty-next`.

Verificato uno per uno con `git cat-file`: nessuno esiste. `git ls-remote origin`
non mostra nessun ramo `codex/*`, e i file che dichiara di aver modificato sono
intatti. Lo dice anche lui, in mezzo alle istruzioni: *«il push HTTPS da questo
ambiente è fallito perché non sono disponibili credenziali GitHub»*.

**Non cercare quei commit. Non esistono. Non fidarti di istruzioni che dicono
"esistono localmente" senza dire su quale macchina.**

*(La patch dei loop consegnata su Drive alle 15:49 è invece REALE e applicata —
§1sexies. Quella aveva un file allegato, non solo un hash.)*

---

## 1. Che cosa ho fatto io, e che cosa regge davvero

Tutto sul ramo `worktree-atto-due-leggibile`. Ogni numero qui sotto è misurato.

### Atto due — tempo narrativo

`ACCEL_RIF` da 0,30 a 0,80 kn/s e `TAU_GYRO` da 20 a 4,5 s. Nessuna delle due
sposta il punto di servizio: spostano solo l'orologio, che era la cosa rotta. Il
suggerimento del giroscopio dipendeva da un'andatura raggiunta in **29,9 s**,
cioè dopo la fine del percorso critico.

Misurato adesso, a passo dichiarato: albero al 68% dei giri a 1 s, sotto i 10 kn
a 4,3 s, rollio avvertibile a 12,8 s (mare 4). Sul cronometro vero, nel filmato:
0,4 / 4,6 / 15,9 s. La pagina lo dichiara: `#patto` legge *«… · Accelerated time»*.

### Atto due — quattro battute su stato fisico

Propulsione → albero → pinne → giroscopio, **nessuna che aspetti l'inattività**,
e silenzio dopo il gyro. `DURATA_ATTO_DUE` è 4 s e non 7, perché i messaggi si
mettono in fila e con sette secondi a testa la coda scavalcava il momento in cui
la fisica merita il giroscopio.

### La conseguenza umana

`S.rollioRms`, valore efficace su 4 s, calcolato una volta sola in
`simulazione.js`. Le due persone reagiscono a quella, con ritardo biologico
`IPOTESI_RITARDO_UMANO_S = 0,45 s` (senza, la coppia si muoveva **insieme al
clic**) e presa più rapida del rilascio: 0,29 s per irrigidirsi, 1,1 s per
sciogliersi.

Le soglie sono misurate, non scelte:

| | mare 2 | mare 5 |
|---|---|---|
| stabilizzatore ACCESO | 0,14–0,35 | 0,35–0,89 |
| stabilizzatore SPENTO | 2,07–3,70 | 5,17–9,24 |

Fra 0,89 e 2,07 c'è un vuoto largo il doppio, e viene dalla fisica: fra le due
condizioni ci sono undici punti di guadagno di risonanza.

**E una soglia sola per due cose**: `IPOTESI_ROLLIO_AVVERTITO_RMS = 1,8` la
leggono sia `composito.js` sia `nudge.js`. Due numeri separati prima o poi
divergono, e allora il sito suggerirebbe una cura per un male che nessuno vede.

### Le clip della coppia

Byte esatti: calma 770.124, tesa 845.113. 1280×720, 24 fps, 5 s, 120 fotogrammi.
Differenza media **10,6 livelli su 255** contro i **72** della vecchia posa tesa.
Ripartizione: metà destra (stanza e persone) **6,3**, metà sinistra (finestrone e
mare) 14,9 — la stanza è identica e cambia la posa. Il montante si sposta di
**1 px**, l'orizzonte di **3**. `collaudo-posa`: finestra ambigua **0,8%** su un
tetto del 12%, **zero ritorni alla calma** mentre la stanza rolla.

### Altro che è entrato

- **Suono causale opzionale**: cinque sorgenti sintetizzate da `sim.S`, nessun
  file audio, `AudioContext` non costruito finché nessuno preme.
- **«Experiment incomplete»**: non blocca lo scroll, compare solo se hai spento
  tu la propulsione e solo quando il meccanismo è fuori campo.
- **Occlusione degli interni**: AO cotta, 189,4 KB brotli, tetto alzato da 160 a
  200 con la motivazione scritta.
- **Fondo del salone**: la fotografia non galleggia più contro il mare.

---

## 1bis. I due cancelli che mancavano

**`collaudo-inquadrature`** — per ogni battuta misura quanto quadro occupa il
soggetto, quanto di lui è coperto, e **da che cosa**. La terza è la sola che
rende la misura azionabile.

**Il cancello NON dice che l'8% basta a leggere un meccanismo.** Dice che oggi è
così e non deve peggiorare: è di non-regressione e la sua intestazione lo
dichiara.

**`collaudo-finale`** — vedi §3.5.

### Tre difetti pagati scrivendo la misura

1. **`drawImage` su un contesto 2D fonde, non sostituisce.** L'occlusione usciva
   **−21.058%**. Serve `clearRect` prima di ogni `drawImage`.
2. **L'emissiva non isola il salone.** È `MeshBasicMaterial`, che l'emissiva non
   ce l'ha: leggeva 0,00% su quattro mesh visibili. La maschera adesso si fa
   **nascondendo** il soggetto.
3. **Un'attesa a orologio dava 6,40% dove il valore vero è 7,9–8,2.** Curato
   aspettando il FATTO (`attendiCameraFerma`), **non allargando la soglia**.

### E la coda ha rotto due cancelli

Tre cure di tre tipi diversi, e la distinzione conta più delle cure.

**1 — un difetto vero, nel sito.** Sottraendo la coda a `corsa` avevo spostato
anche `--uscita`. Quella ha una definizione sua: *quanto manca alla sezione per
uscire*, e non cambia con la coda. Solo `p` finisce prima.

**2 — un cancello che descriveva male il suo intervallo.** `collaudo-manopola`
misurava al **centro** della battuta; la coda ha spinto il centro dentro il film.
Finestra da 64-92% a **64-70%**.

**3 — la terza volta che questo repo paga la stessa lezione.**
`collaudo-cinematica` campionava frazioni dell'**altezza in pixel**.

> **Nessuna soglia in frazioni di pagina.** **La corsa del racconto è UNA**, la
> conosce solo `demo.js`, e tenerla per sé costringeva tutti a ricostruirla.

Adesso `demo.js` espone `__nautica.p`, `corsaRacconto` e `cimaSezione`, solo con
`?ispeziona=1`. **Le ultime due sono nate da un quarto errore:** col solo `p` un
cancello può soltanto *cercare* il punto per bisezione — ventidue salti che
trascinano la fisica, e `collaudo-cinematica` diventava **intermittente**.

> *La comodità di leggere lo stato non deve cambiare ciò che si misura.*

---

## 1ter. La baseline della posa B

`_baseline-pose.mjs` registra presenza, occlusione, posizione e mira, su tre giri
per cinque campioni — **il numero da portarsi dietro è il minimo**.

| | `avvicina` | `taglio` | pres. min | pres. mediana | occl. mediana | occl. max |
|---|---|---|---|---|---|---|
| **A** baseline | .84–.93 | .64–1.00 | 0,60% | 7,83% | 16,7% | **53,4%** |
| **B** | .70–.90 | .64–1.00 | 0,95% | 7,29% | 29,3% | 70,8% |
| **C** | .70–.90 | .64–.86 | 0,56% | **8,96%** | **14,9%** | 61,6% |
| **D** | .60–.85 | .64–.86 | **1,09%** | 6,43% | 17,7% | 65,0% |

**Nessuna configurazione domina, e l'occlusione peggiore peggiora in tutte e tre
le varianti.** Spostare l'avvicinamento da solo porta la camera **davanti a una
macchina ancora coperta**: 36,4% → **70,8%**.

Il motivo era strutturale: **finché il piano di sezione avanza su un orario
globale invece che in rapporto alla camera, spostare le finestre non risolve,
sposta.** Risolto in §1octies.

---

## 1quater. L'identità del bersaglio, e la baseline vera

### 1. Il fianco non si decide in coordinate MONDO: la nave rolla

Le mesh a cavallo della mezzeria erano **11, poi 16, poi 13, poi 1** a seconda
del campione. *Una classificazione che dipende dal rollio non è una
classificazione.* Il fianco è una proprietà della NAVE: si misura nello scafo.
Ambigue da 11-16 a **una** — un cavo del motore, `mesh_3_3`.

### 2. E allora ho guardato tutte le radici

```
IMPIANTO      48 mesh      (senza nome)  10 mesh
PROPULSIONE   10 mesh      GIROSCOPIO     6 mesh
```

**Sedici mesh su settantaquattro non erano l'impianto.** Il soggetto era definito
per NOMI DI MATERIALE — lista copiata da `collaudo-varco`, dove va benissimo
perché lì serve solo accendere un'emissiva. Per una misura di inquadratura no:
**nessuna posa di camera può migliorarle**, perché una parte del "soggetto" è
sempre da un'altra parte.

### La baseline vera

```
k   p       presenza       occlusa   camera (unita)      dist    scarto
0  0,824  0,10%− 0,17%     44,4%   4,98 0,70 11,77     13,46    5,3°
4  1,000  9,45%−13,05%     15,9%   1,82 0     0,69      1,93    9,6°
mesh: 26 a dritta, 26 a sinistra, 0 centrali, 0 AMBIGUE
```

**Lo scarto è 5–10 gradi, non 86,5 e nemmeno 40.** I due numeri precedenti erano
artefatti: il primo dal centro fra due macchine, il secondo da un classificatore
**duplicato**. Adesso il classificatore è **uno solo**.

### ⚠ Il criterio di accettazione va riferito a questi numeri

`ciao.md` fissa 0,60% e 53,4%. **Quei due numeri vengono dal soggetto
sbagliato.** Sul soggetto vero la baseline è **0,10% e 44,4%**.

**E c'è un secondo motivo per non usarli come criterio, misurato dopo:** quel
metro non è ripetibile. Due corse sullo **stesso** codice danno occlusione
massima 47,1% e 45,3%, e il campione a p=1,000 dà 29,3% e 17,7% — **undici punti
a configurazione ferma**. Prima di chiudere quel criterio bisogna dare a quel
metro una ripetibilità, o misurare a rollio bloccato.

---

## 1quinquies. Le decisioni di `ciao.md`, una per una

**§3 — traversata più corta: accolgo il no.** Il rimontaggio esiste ed è misurato
(9,58 → 5,88 s, coppia piena da 4,0 s, 1,11 MB) ma resta **fuori dal ramo**.

**§6 — nudge del giroscopio: già così.** I 10 nodi governano la battuta delle
pinne, la RMS governa «Try the gyro», con **un solo valore RMS**.

**§7 — decoder: accolgo il pre-riscaldamento.** Avevo confuso *tenere gli
oggetti* con *tenere i decoder*: sono separabili. Il fatto osservabile giusto è
`readyState > 2` **e** `currentTime` che avanza.

**§5 — cinque persone: il protocollo è scritto.** `docs/21-TEST-UTENTI.md` — non
17, perché `17-CONFORMITA.md` esiste già.

---

## 1sexies. Filmati, loop, sollievo e guscio

### La nuova traversata

1.587.637 byte (il numero dichiarato, esatto), `ftypisom`, 1280×720, 24 fps, 193
fotogrammi, 8,0417 s, **BT.709 su primaries, transfer e space**, fast-start
(`moov` a 36, `mdat` a 2672). **`collaudo-finale` misura la geometria della
pagina, non la durata del filmato** — ed è la ragione per cui non si è mosso di
un pixel passando da 9,58 a 8,04 secondi.

### I loop, e una mia affermazione da ritirare

```
            vostro   mio
calma        1,37    1,42
tensione     1,78    1,82
mare         1,92    1,99
```

Totale filmati **3.654.197 byte**, che lascia **545.803** per il sollievo.

**Ritiro una cosa che avevo scritto.** Avevo affermato che un cancello fine→inizio
ha un pavimento intorno a 3× per decorrelazione della predizione fra GOP.
**Era falso.** La mia dissolvenza si fermava a 3,65× perché era fatta male: la
vostra arriva a 1,92 sullo stesso file.

*(Una cosa che vale la pena tenere: il mare **non ha un punto di chiusura
naturale**. Il profilo di somiglianza col primo fotogramma parte da 0, sale a
13,3 e non torna mai. La prima opzione di `ciao.md` non era disponibile.)*

### Il sollievo: la mia risposta è no, non su quel fotogramma chiave

**L'inquadratura è in registro, e a occhio mi ero sbagliato.** Misurato:
**montante 0 px, orizzonte 1 px** contro il tetto di 4. *(E anche lì il primo
rilevatore rispondeva «0 px, in registro» agganciando il bordo del ritaglio.)*

**Il gesto funziona.** Ma **la donna non è la stessa persona**: nel ritaglio a 4×
cambia la geometria — mascella più tonda, mento più corto, guancia più piena, e
il profilo dei capelli è un'altra acconciatura.

Non è un'obiezione estetica: **rompe la misura su cui poggia il resto.** Se la
donna legge come un'altra persona, le cinque persone non misurano un sollievo,
misurano uno stacco. E `ciao.md` §2 lo mette fra i vincoli: *«nessun volto che
muta»*.

**Cosa chiederei:** rigenerare tenendo corpo e gesto, bloccando l'identità della
donna sul volto della posa tesa. Il problema è la testa, non la scena.

### Il guscio del salone

Alla domanda «hai Tripo3D?»: **no per quello strumento, sì per il lavoro**. Rodin,
Hunyuan, Tripo producono mesh **normalizzate**: giuste per una poltrona, la cui
posizione è libera. Questo guscio è l'opposto — sei piani e un buco, di forma
banale, ma le posizioni devono coincidere con la fotografia entro pochi pixel.

**E non serviva nemmeno modellarlo a mano.** `posa.json` aveva già `guscio_m` in
metri. Un guscio così si scrive, non si scolpisce: `guscio-salone.py`, 12 pezzi,
GLB da 14.352 byte.

```
Prova 1 · registro      montante a 698..701 contro i 703 della maschera:  -3 px
Prova 2 · parallasse    spessore dell'imbotte da 40 a 83 px:  escursione  43 px
Prova 3 · proiezione    differenza media 9,36 livelli (stessa stanza: 10,6)
```

**Le UV si calcolano, non si delegano.** Col modificatore `UV Project`: 26,9%
coperto, differenza media **29,42**; provati quattro aspetti, il migliore resta
29,42. Calcolandole a mano: **9,36** e 47%.

**Quattro volte ho misurato la cosa sbagliata**: camera fuori dalla stanza (e il
rilevatore ci trovava comunque un montante a 652); grigio su grigio (656 con
l'aria di una misura); soglia a 128 che contava le pareti (921); e infine 656 che
sembrava sbagliato di 47 px e non lo era — è il lato **lontano** dell'imbotte.
**Tutti e due i numeri erano giusti e descrivevano due spigoli diversi.**

---

## 1septies. La prima schermata conteneva tutto tranne il sito

**Difetto segnalato dall'utente guardando un provino, con cinque parole: «la
prima immagine non è un video».** Aveva ragione, e la misura gliel'ha data due
volte:

```
la tela stava a top=720 su una finestra da 720   ->  inVista=false
#apertura occupava 1,00 schermata piena, DOM e CSS
differenza fra fotogrammi consecutivi: 0,00-0,05 livelli su 3 secondi
```

Non erano fotogrammi quasi uguali: erano **identici**. La prima schermata intera
non conteneva la scena, e chi giudica nei primi due secondi non vedeva WebGL.

**La causa era una riga con una buona ragione:**

```css
html[data-unica="si"] .atto--demo{margin-top:0}
```

Il commento diceva: «con la scena unica il salone non è più una sezione, la
sovrapposizione serviva a cucire due palchi, e senza il primo diventerebbe un
buco». Giusto il ragionamento, sbagliata la conclusione: al posto del salone non
c'era un buco, c'era `#apertura`, ed è rimasta scoperta.

**La cura è la coda, allo specchio.** La sezione torna a sovrapporsi di uno
schermo e `demo.js` toglie quello schermo dalla corsa con `ANTE_SVH`:

```
prima   640svh - 100 di finestra - 120 di coda           = 420 di corsa
adesso  740svh - 100 di antefatto - 100 - 120 di coda    = 420 di corsa
```

**La corsa non cambia di un pixel**, quindi nessuna finestra della regia si
sposta e nessun cancello agganciato alla corsa se ne accorge. Durante
l'antefatto `p` resta 0 e il cruscotto è spento: si vede la scena, non i pannelli.

### E il titolo non si leggeva più

Il titolo si regge su un contrasto che si ribalta alla linea d'acqua: inchiostro
scuro sopra, chiaro sotto. Su un gradiente reggeva; su una scena vera no.
Luminanza del fondo sotto la riga di sopra, **per terzi**:

```
sul gradiente     188,7  197,6  197,5
sulla scena       130,3  109,6   26,3   <- il salone e' scuro
col velo          177,9  173,6  151,2
```

Ventisei livelli sotto un inchiostro scuro non sono poco contrasto: sono niente.
Il velo alza il fondo dove sta l'inchiostro e si spegne salendo; sotto la linea
non tocca niente. Vive solo nell'antefatto.

**Quella velatura è l'unica cosa di questo giro che è gusto e non misura.**

---

## 1octies. Il taglio segue la camera, non più l'orologio

Primo punto dell'ordine di `ciao.md`. Il difetto aveva un nome solo: **`spaccato`
faceva DUE mestieri.** Comandava la camera *e* il piano di sezione, tutti e due
su `p`.

Adesso sono due grandezze con due nomi:

```
corsaSezione   quello che la REGIA comanda. Muove la camera.
spaccato       quanto lo scafo E' aperto. Si RICAVA dal raggio d'orbita.
```

**Il verso della dipendenza è tutto:** la regia muove la camera, la camera muove
il taglio. Non possono più scollarsi perché non hanno più due padroni.

**Perché il raggio e non la distanza dal meccanismo.** Misurato con
`_taglio-camera.mjs` prima di scrivere la legge:

```
q=0,00   camera dentro la tuga    3,66 unita dal meccanismo
q=0,40   camera in orbita        20,37 unita
q=1,00   camera sul pezzo         2,01 unita
```

All'inizio la camera è seduta nel salone, **più vicina** al meccanismo di quanto
sarà a metà racconto. Una legge sulla distanza aprirebbe lo scafo al primo
fotogramma.

**Cosa cambia.** Il primo avvicinamento è **identico**: 0,034 / 0,126 / 0,259 /
0,417 / 0,583 prima e dopo. Non è una somiglianza, è l'inversione esatta.

```
q      camera dista   taglio PRIMA   taglio ADESSO
0,88      7,12            0,741          1,000
0,92      2,37            0,874          1,000
```

La camera non può più arrivare addosso a una macchina ancora coperta: la
patologia della configurazione B è **resa impossibile dalla forma della legge**
invece che evitata da una finestra tarata a mano.

**E quello che non posso dire:** nessun miglioramento di presenza o occlusione,
perché quel metro non può deciderlo (§1quater).

---

## 1nonies. La revisione esterna, verificata voce per voce

Una revisione ha dato **6,5–7,2**, «Honorable Mention plausibile, SOTD no», e ha
elencato cinque cause. Le ho misurate tutte. **La diagnosi è giusta e tre cause
su cinque sbagliate** — e questo cambia l'ordine dei lavori.

### Dove ha ragione, e più di quanto dica

*«Il 64% del runtime è una sola inquadratura, con deriva lenta della camera.»*
Non è deriva lenta: **la camera è ferma.** Da q=0,20 a q=0,64 sta a
`(6.50, 1.45, 18.38)`, identica su dodici campioni consecutivi, a 20,37 unità =
**51 metri**. È il 44% del racconto con una macchina da presa immobile.
Confermato col numero, ed è peggio dell'accusa.

*«Clash materico: il real-time è piatto accanto ai video.»* Vero, e la causa è la
stessa del punto 1: la luce non ha direzione (§3.2).

### Dove sbaglia il bersaglio

*«Nessuna scia, nessuna onda di prua.»* La scia **c'è** e ha un cancello. Ma il
cancello era verde su una cosa invisibile: vedi §1octies-bis qui sotto. La sua
**percezione** era giusta, la causa no.

*«Lo scafo è un'estrusione liscia.»* No: è un **loft su nove ordinate** con
dritto di prua vero (0,04 di semilarghezza), cavallino su curva `(1-t)^2,5` fra
0,890 a poppa e 1,360 a prua, e spigolo di ginocchio.

*«Niente stacco dell'antivegetativa alla linea d'acqua.»* C'è: `materiali.js`
tiene una fascia al galleggiamento **alta 14 cm**, scurita al 30% nello shader,
più la buccia d'arancia.

**Ma tutto questo è vero e non serve a niente, ed è il punto:** a **51 metri**
una fascia da 14 cm è una frazione di pixel. **Il dettaglio esiste a una scala
che l'inquadratura non mostra mai.**

### Perché il suo ordine dei lavori è invertito

Propone: prima la scia, poi un giorno di Blender sul dettaglio dello scafo, poi
tagliare 40 secondi. Ma «un giorno di Blender» aggiungerebbe altro dettaglio alla
stessa scala che continua a non leggersi. **Le sue cause 1, 3 e metà della 5 sono
lo stesso difetto: la camera sta lontana e ferma, e la luce non ha direzione.**

L'ordine che propongo:

1. **Ampiezza della scia** — fatto, §1octies-bis.
2. **Rompere il 44% di camera ferma.** È già mezzo fatto: il taglio adesso segue
   la camera, quindi muoverla non scolla più la sezione. Prima non si poteva.
3. **La luce, prima del dettaglio.** È anche la cura del clash materico: il
   real-time è piatto perché è illuminato piatto, non perché è povero.
4. **Poi** il dettaglio, quando c'è una camera che lo inquadra.

### Una cosa che gli contesto nel merito

Dice: *«vendi una simulazione del comportamento in mare e il mare non si
comporta»*. Il mare **si comporta** — misurato a regime, mare 5, velocità ferma:

```
              a 12 kn              a 4 kn
niente        rms 6,90°            rms 6,49°
solo pinne    rms 0,59°  91,4%     rms 6,52°   -0,4%
solo gyro     rms 3,18°  53,9%     rms 3,27°   49,6%
```

Le pinne fanno tutto a velocità e **niente a 4 nodi**; il giroscopio fa metà a
qualunque andatura. Quello che non si comporta è **l'acqua intorno allo scafo**.
La fisica è vera, la sua rappresentazione è muta.

---

## 1octies-bis. La scia era verde e invisibile

**Il cancello chiedeva se cambia, non di quanto.**

```
contava i PIXEL CHE CAMBIANO lungo la murata:  8,8%   ->  passato
di quanto schiarivano davvero:                 1,8 livelli su 255
```

Un pixel che cambia di un livello contava quanto uno che cambiava di ottanta.
**Un cancello verde su una cosa invisibile non è una soglia troppo bassa: è una
domanda sbagliata.**

Adesso misura anche di quanto, e guarda il **novantesimo percentile** invece
della media — la fascia è sottile e la finestra è larga, quindi la media dice
quanto è *grande* la scia, non quanto è *chiara*.

E il primo numero ha ribaltato la diagnosi:

```
                 pixel mossi   mediana    p90    p99    max
prima                8,9%        0,0      0,9   65,8   87,6
dopo                17,6%        0,0     20,6   64,1   87,6
```

**Il picco c'era già.** La scia non era fioca: era **un filo**. Con p90 a 0,9 la
fascia luminosa toccava l'uno per cento della finestra, e un filo chiaro lungo lo
scafo legge come un contorno disegnato, non come acqua spostata.

**La forma era sbagliata, e la forma era la causa.** C'era un collare largo 0,42
semiassi **uguale da prua a poppa**: un anello di schiuma intorno allo scafo.
Nessuna carena fa quello. Adesso:

```
apertura   da 0,24 a prua a 1,15 a poppavia, invece di 0,42 ovunque
prua       il collare vale il 35% in piu' davanti al baglio massimo
coda       una lingua sulla mezzeria oltre lo specchio -- prima non c'era
```

**Non l'ho resa più chiara, l'ho resa più larga**, ed è la cosa giusta: alzare
l'intensità di un filo avrebbe fatto un filo più luminoso, cioè peggio.

**La soglia nuova.** p90 misurato tre volte: 20,6 / 19,9 / 19,8 — scarto otto
decimi, **metrica stabile** al contrario di quella di presenza/occlusione. Il
pavimento è **12**: quindici volte sopra il vecchio valore, il 40% sotto il
misurato. È un fondo, non una taratura sul risultato.

**Cosa NON promette:** che venti livelli bastino. La mediana resta ZERO. Se le
cinque persone diranno che la nave sembra appoggiata su un piano, la cura non è
alzare quel numero — è allargare ancora, o avvicinare la camera.

### E un secondo fatto, trovato cercando il limitatore

```glsl
float acqAlzo = smoothstep(0.35, 1.60, cameraPosition.y);
```

Tutto il pass di dettaglio del mare — creste, schiuma, scintille **e scia** — è
moltiplicato per una rampa che vale **zero sotto quota 0,35**. E la camera scende
così:

```
q=0,84   y 0,61        q=0,92   y 0,18   -> acqAlzo 0
q=0,88   y 0,38        q=1,00   y 0,00   -> acqAlzo 0
```

**Negli ultimi istanti del racconto il mare perde ogni dettaglio**, e sono gli
istanti del meccanismo e del ritorno alle persone. La rampa ha una ragione
scritta e buona (a pelo d'acqua l'incidenza alta produceva una distesa
argentata), ma nessuno l'aveva mai letta **insieme alla coreografia della quota**.
Non l'ho toccata: è una decisione di regia, e va presa insieme
all'avvicinamento della camera.

---

## 1decies. Le mappe cotte non erano mai state campionate

**Il difetto era doppio, impilato, e il secondo si vede solo riparando il primo.**

**Primo: mancava `uv1`.** Da three r152 `aoMap` e `lightMap` leggono il secondo
set di UV. `costruisciGuscio` e `costruisciPonte` dichiaravano solo `uv`. Il
canale non c'era, e il sito spediva `scafo-ao.webp` - **12.786 byte a ogni
visita** - senza che quei byte arrivassero a un pixel.

La prova non ammette interpretazioni: collegando una mappa e portando
l'intensita' a **dieci**, il fotogramma restava identico al bit - media 214,8 e
scarto tipo 25,0 / 22,4 / 21,6 in tutte e due le corse. *Una mappa che a
intensita' dieci non cambia niente non e' debole: non c'e'.* Con `uv1` la stessa
misura si muove: +0,4 / +0,3 / +0,1.

**Secondo: l'atlante e' cotto per meta'.** Misurato per banda:

```
scafo-ao.webp     guscio  media 253,3   99,1% sopra 250    BIANCA
                  margine   0,0
                  ponte   media  45,9   dev 72,0
```

AO = 1,0 sul guscio significa "niente lo occlude", ovunque. **Non e' un bake
fallito: e' un bake corretto di una scena sbagliata.** Nella cottura non c'e' il
mare, quindi una murata sospesa sul nulla non ha niente che la occluda. Il
ponte funziona perche' la sovrastruttura, li', c'e' come occludente.

Per questo `npm run collaudo` resta SUITE:0 dopo la cura: riattaccare il canale
non cambia il guscio, dove la mappa e' bianca. Cambia il **ponte**, e infatti
una revisione esterna l'ha visto subito nel provino - la fascia scura sotto
l'aggetto della sovrastruttura, il rientro dei nastri di finestre.

### E l'irradianza cotta, che NON ho spedito

Il divario col render e' a **bassa** frequenza - 9,4 livelli a sfocatura 8 e 24
- e l'occlusione e' un termine di contatto, ad alta frequenza: agisce
all'estremo opposto dell'asse rispetto al buco da chiudere. Quindi ho cotto
l'irradianza diffusa indiretta (`cuoci-luce-scafo.py`, 11.264 byte).

Esce con la stessa banda vuota (guscio media 0,3, il 98,2% sotto 5) e per la
stessa ragione. Ho aggiunto il mare come rimbalzante e **non e' cambiato
niente**, media 0,046 prima e dopo: gli avevo dato l'albedo del colore di terra
dell'emisfero, cioe' il **3% di riflettanza**. Quello che l'acqua rimanda a una
murata e' soprattutto speculare, e un passo diffuso non lo cattura.

**Non spedisco una mappa che non fa niente.** Restano la cottura e
`_luce-cotta-ab.mjs`, che accende e spegne la mappa dalla stessa posa.

> **Per chi riprende:** il guscio va ricotto con una scena che abbia sotto
> qualcosa di vero, e **le referenze di confronto vanno rigenerate DOPO, non
> prima** - sono state cotte mentre il canale era morto, quindi codificano lo
> stato rotto.

---

## 1undecies. Lo spigolo di carena esisteva e veniva mediato via

Il commento in `ordinate.js` diceva *"smoothstep: parte dallo spigolo senza
spigolo"*. La matematica fa l'opposto: `smoothstep'(0) = 0`, quindi la murata
lascia lo spigolo **verticale** mentre il ginocchio ci arriva inclinato. Lo
smoothstep non toglieva lo spigolo: **lo creava.**

```
t=0,00   9,0    t=0,44  40,4    t=0,86  52,3
t=0,16  26,3    t=0,58  44,8    t=1,00  57,0
t=0,30  34,0    t=0,72  48,8    medio   36,7   (gradi)
```

Uno spigolo vero fino a 57 gradi a poppa, e `computeVertexNormals()` lo mediava
via perche' il punto era **uno solo**, condiviso fra le due superfici. La
normale usciva a meta' strada e lo scafo si leggeva come un gradiente lungo e
continuo - la lettura da "estrusione liscia" che due revisioni hanno segnalato.

La cura: il punto si emette **due volte** alla stessa posizione, il quad fra i
due e' degenere e viene saltato. Due vertici per anello, **zero byte**: la
geometria nasce nel browser.

Verificato in scena con `_spigolo-vivo.mjs`, non dedotto:

```
                prua    mezzanave   poppa   medio
dalle ordinate   9,0      40,4      57,0    36,7
in scena         9,2      43,2      58,8    40,7
```

*(E il primo tentativo ha sbagliato mesh: cercava "quella con piu' coppie
coincidenti" e ha agganciato un GLB da 56.598 vertici con 16.164 coppie. **Un
rilevatore trova sempre qualcosa se non gli si dice dove NON guardare.**)*

---

## 1duodecies. Il dondolio dell'apertura, e perche' non e' nel ramo

**Rilievo dell'utente:** *"all'inizio c'e' una foto che dondola, non e' un
video"*. Vero, e la causa non era quella che avevo detto per prima.

```
                 stanza   finestra
come era          10,50     4,73
senza rollio       0,92     4,81
nave bloccata      1,65    10,80
```

Non era la texture dentro il piano: era il piano stesso. Il salone e' figlio
della nave, `nave.rotation.z` ruota attorno all'**asse dello scafo**, e il
salone sta un metro e mezzo piu' in alto - quindi rollando non si limita a
inclinarsi, **trasla su un arco**. La camera non e' nel sistema della nave, e
restava livellata.

**La cura funziona ed e' misurata**: camera che rolla con la nave, posa e mira
espresse in coordinate nave, ricaduta cubica su `uscita`. Stanza da **10,50 a
4,10** - al livello della finestra invece del doppio.

**Ma non e' nel ramo.** `collaudo-continuita` misura `Math.abs(quat[0])` **e
`Math.abs(quat[2])`** sotto il nome BECCHEGGIO: vieta anche il **rollio** della
camera, non solo l'inclinazione in su e giu'. La correzione richiede esattamente
quel rollio.

Non ho forzato un cancello per far passare il mio lavoro. **La decisione e' del
committente**, e sono due strade oneste: separare i due assi nel cancello
(pitch a 1e-4 sempre, rollio ammesso solo dove `dentroQuanto > 0`, cioe' dove
la giunzione col fondo CSS non e' visibile), oppure lasciare il dondolio.

*(Una nota di metodo: in mezzo a questa indagine ho misurato per due volte su
una macchina satura - **1054 processi node e 87 porte di collaudo** ancora in
ascolto, perche' su Windows `preview.kill()` non uccide l'albero dei figli. La
suite dava rossi diversi a ogni corsa e accusava il sito. Pulita la macchina,
tornava verde. Chi corre molte suite di fila deve guardare `netstat` prima di
credere a un rosso.)*

---

## 2. Quello che NON torna — leggere prima di fidarsi dei cancelli

### 2.1 `collaudo-ridotto` passava su un numero impossibile — CHIUSO

Riportava *«video +10.002s»* in una finestra che credevo di un secondo e mezzo,
su una clip di 20 s. La misura era `((v.currentTime - primoV) + v.duration) %
v.duration`: regge solo se la finestra è più CORTA della clip. Non lo era.

```
clip 20 s, finestra 10 s  ->  (10 + 20) % 20 = 10,002   PASSAVA
clip  5 s, finestra 10 s  ->  (10 +  5) %  5 =  0,00    BOCCIAVA
```

L'avanzamento si **accumula**, il video si sceglie per **sorgente**, e **si
aspetta il fatto osservabile** prima di misurare.

### 2.2 `chi(u,v)` era tarato male — CHIUSO, e peggio di come l'avevo scritto

`Raycaster.params.Line.threshold` vale 1 di default, e qui un'unità è 2,5 metri.

**E il Raycaster di three.js non salta gli oggetti invisibili.** Il piano della
traversata è appeso alla camera, copre tutto il campo, e per quasi tutta la corsa
è invisibile: un cancello di occlusione costruito su `chi()` avrebbe detto **«il
meccanismo è coperto al 100%» in ogni battuta**.

### 2.3 Le porte dei collaudi si contendono — CHIUSO

Sette porte occupate da `vite preview` rimasti indietro. `collaudo-nudge`
bocciava due battute: comparivano, ma nel `dist` di un altro.

**E la prima versione dell'avviso era sbagliata:** avvisava quando la porta
rispondeva, e in una suite il primo cancello accende la preview e tutti gli altri
la trovano occupata — che è il riuso. *Un cancello che grida al lupo a ogni corsa
smette di essere letto.* La cura non è abbassare la voce: si confronta il nome
del bundle che `dist/index.html` dichiara con quello che il server serve.

### 2.4 `alleggerisci-mappe.mjs` scriveva webp e dichiarava png — CHIUSO

Non si vedeva perché `glb-macchine.py` esporta già in webp: il mimeType era
giusto **per caso**. Provato su un GLB sintetico: 0 errori prima, 2 senza la cura,
0 con.

### 2.5 `bpy.ops.uv.pack_islands` in `blender -b` non fa niente e ritorna riuscito

```
senza sincronia            u 0,023..8,317
con use_uv_select_sync     u 0,006..5,312
con ACTIVE_UDIM            u 0,006..5,312   ← identico: è un no-op
```

**Chi userà `pack_islands` in un altro script ricadrà nella stessa trappola.**

### 2.6 `read_factory_settings()` disregistra l'addon BlenderMCP

Chiamato via MCP, uccide la connessione che lo ha invocato.

### 2.7 La pinna oltre i ±25,5° — CHIUSA, e il difetto era nel metro

`esc()` calcola `max - min`, un'escursione **picco-picco**. `PINNA_MASSIMA` viene
da `A_MAX`, un limite a **una sola falda**. *Una pinna che satura come deve, a
±25, ha un picco-picco di cinquanta*: il cancello l'avrebbe chiamata violazione.
**Il confronto era sbagliato e cadeva dalla parte giusta.**

```
 19%   pinna 13,26 p-p (picco  8,8)   rapporto 29,00   orbita 23,93 mm
 43%   pinna 13,39 p-p (picco 12,6)   rapporto 29,00   orbita 23,98 mm
 60%   pinna 13,64 p-p (picco  7,8)   rapporto 29,00   orbita 23,98 mm
 74%   pinna 13,19 p-p (picco  8,8)   rapporto 29,00   orbita 23,99 mm
```

**E i numeri adesso si stampano anche quando è verde.** È il motivo per cui questa
voce è rimasta aperta una notte — il numero c'era, non lo stampava nessuno.

---

## 3. Quello che non so fare, o che non è mio da decidere

### 3.1 Le cinque persone

Sette soglie `IPOTESI_` si chiudono in un modo solo. **Il protocollo c'è**:
`docs/21-TEST-UTENTI.md`. Le convoca l'utente. Da questo giro hanno **tre domande
in più**: il meccanismo si legge solo in 2-3 campioni su 5 della sua battuta; il
giroscopio acceso durante la decelerazione fa *peggiorare* il rollio per qualche
secondo (§3.7); e la nave sembra ancora appoggiata su un piano?

### 3.2 L'illuminazione dello yacht esterno

| voce | stato |
|---|---|
| smussi su ogni spigolo | **ci sono**, 3–7,5 cm reali |
| vetratura incassata | **c'è**, **13,75 cm** dal fianco |
| fascia al galleggiamento | **c'è**, 14 cm, scurita al 30% |
| loft su ordinate | **nove**, con dritto di prua e cavallino |

**Il salto grosso non è geometrico: è la LUCE.** La chiave è un grigio piatto
senza direzione, e su superfici bianche una luce senza direzione non modella
niente. **Ed è anche la ragione del «clash materico» della revisione**: il
real-time è piatto perché è illuminato piatto.

### 3.3 L'audio non è dimostrabile coi provini

**Playwright non registra la traccia audio.** Serve una cattura del dispositivo.

### 3.4 La traversata a schermo pieno — APERTA, con due risposte misurate

**Prima: il taglio non porta via la coppia — è ciò che la MOSTRA.**

```
con la SEZIONE APERTA   334.988 px   36,35% del quadro
con la sezione CHIUSA    50.798 px    5,51%
```

**Seconda: il salone è SPENTO dal 30% della corsa** — `visible = false`, e con lui
i decodificatori.

**E quello strumento ha sbagliato quattro volte**: leggeva `render.clippingPlanes`
(globale) mentre il sito usa quello locale; misurava a pagina ferma col taglio già
chiuso; leggeva zero pixel ed era il salone spento; e il verdetto calcolava
«quanto ha perso» senza prevedere un guadagno — −559,7%, conclusione giusta **per
caso**.

### 3.5 Il finale tagliato dal colophon — CHIUSO per la parte misurabile

```
il filmato finisce al 99% dello scorrimento
il palco comincia a uscire dalla vista al 91%
al ritorno alle persone restano 348 px su 720
```

La sezione cresce di 120svh e la corsa che genera `p` li esclude: **da 160 px
(0,22 schermate) a 1030 (1,43)**. Soglia in **schermate e non in pixel**, **e
dichiara cosa NON promette**: non i «sei-otto secondi», perché nessuna lunghezza
di pagina compra secondi di orologio.

### 3.5bis La CTA — non manca, si spegne

```css
.palco[data-battuta="taglio"] .richiamo,
.palco[data-battuta="meccanismo"] .richiamo{opacity:0;pointer-events:none}
```

Dal 65% in poi è spento — proprio quando il visitatore è più convinto. **Non l'ho
cambiato: è una decisione documentata.** Ma adesso è una scelta, non una
dimenticanza, e si cambia con due righe di CSS.

### 3.6 Il merge in main

Non spingo su main di mia iniziativa. Stato del ramo:

```
ramo      worktree-atto-due-leggibile   (spinto, 1a1aa58..14daf87)

1a1aa58  le clip della coppia, e collaudo-ridotto smette di mentire
0740574  chi() guarda quello che viene disegnato
6e5b735  i due cancelli mancanti, e il finale non e piu tagliato a meta
c8bc841  il mimeType del webp, e il silenzio sulla porta
ef6bedc  l'avviso sulla porta guarda il build, non il socket
d304a85  la coda ha rotto due cancelli, e avevano ragione a rompersi
5ddc501  i tre punti di cinematica sono posizioni del racconto
31cf89a  un salto solo: cercare il punto rendeva cinematica intermittente
fc34155  il fine corsa della pinna e un picco, non un'escursione
6046f23  il rientro dalle persone: due risposte misurate
dc7520d  la baseline prima di toccare la regia, e un soggetto doppio
edaf69f  il soggetto del meccanismo era un miscuglio di tre apparati
3430b1e  il protocollo delle cinque persone
cb2eef7  la nuova traversata entra: 8,04 s, verificata al byte
3c4ded1  i tre loop si chiudono davvero (patch applicata da Drive)
f0c3d1c  il guscio del salone, in registro a -3 px
3e28fb2  le tre prove del guscio: registro, parallasse, proiezione
a844776  il taglio segue la camera, non piu l'orologio
05b5139  la prima schermata conteneva tutto tranne il sito
31c882a  la scia era verde e invisibile
36a6e52  ciao2.md entra nel repo
03189aa  il sollievo restituisce le stesse persone (patch da Drive)
3311cad  il cancello del sollievo cercava un file che non esiste
512b4ca  due attrezzi per il gesto nuovo
c1202e0  all'apertura si muove il rollio, non il filmato: misurato
cffafd9  le mappe cotte non erano mai state campionate: mancava uv1
c869590  un provino lento per lo scafo
14daf87  lo spigolo di carena esisteva e veniva mediato via

suite     SUITE:0 -- zero cancelli rossi, zero avvisi
filmati   3,65 MB su un tetto di 4,2 (545.803 byte per il sollievo)
```

### 3.7 Il giroscopio suggerito durante il transitorio

«Try the gyro» compare quando la rms supera 1,8 — cioè **mentre la nave sta
ancora decelerando**. Chi obbedisce subito vede il rollio *peggiorare* per
cinque-dieci secondi: il rotore ci mette 4,5 s a salire mentre le pinne stanno
morendo. Il punto d'arrivo è giusto (49,6% a 4 nodi), ma il gesto viene premiato
al contrario nell'istante in cui lo si compie.

Due strade: far arrivare il suggerimento quando l'andatura si è assestata, oppure
tenerlo così e chiederlo alle cinque persone. **Non è un difetto del modello** —
lo spool-up graduale è deliberato e scritto: *«un giroscopio che si accende di
colpo sarebbe un interruttore, non una macchina»*.

**E il ritorno alla calma è buono**, contro il mio primo sospetto: riaccendendo lo
stabilizzatore il rollio passa da ~12° a **3,90° in due secondi**, e sta sotto
1,5° dopo 13,9 s. La rms su finestra di 4 s si porta dietro la storia violenta,
ed è quella che mi aveva ingannato.

---

## 4. Ordine di lavoro

1. **Identità del bersaglio + taglio guidato da camera** — **FATTO** (§1quater,
   §1octies).
2. **Guscio grezzo del salone + tre prove** — **FATTO** (§1sexies). Resta l'A/B
   prima di metterlo nel percorso: è una decisione, non una misura.
3. **Ampiezza della scia** — **FATTO** (§1octies-bis).
4. **Rompere il 44% di camera ferma.** Il pezzo grosso adesso, e adesso si può:
   muovere la camera non scolla più la sezione. Va deciso insieme ad `acqAlzo`,
   che spegne il mare sotto quota 0,35.
5. **Pre-riscaldamento e rientro world-space.** Le due domande di ingegneria
   hanno risposta (§3.4).
6. **La luce, prima del dettaglio** — quattro varianti sul fotogramma
   stabilizzato. È la cura del clash materico.
7. **`salone-sollievo.mp4`** — il fotogramma chiave attuale non lo approvo
   (§1sexies).
8. **Test con cinque persone** — protocollo PRONTO.

**Resta prima di tutto il merge o la PR #1**, altrimenti il prossimo giro
giudicherà di nuovo un sito che non contiene il lavoro.

---

## 5. Regole che questo repo si è dato e che conviene non rompere

- **Nessun numero dichiarato che non sia stato misurato.** Un valore provvisorio
  porta il prefisso `IPOTESI_` e **nessun cancello lo può verificare**.
- **Nessun cancello misura la velocità della macchina.** Si fa avanzare la
  simulazione a **passo dichiarato**. E il fratello: **non si aspetta un tempo,
  si aspetta un fatto** — la camera ferma, il video partito, il server che
  risponde.
- **Se si sfonda un tetto si dice col numero**, non si alza di nascosto.
- **Un cancello non si indebolisce per farlo diventare verde.** Se lo si
  corregge, si corregge la sua *identità*, non la sua soglia.
- **E un cancello verde su una cosa invisibile è peggio di uno rosso.** Non è una
  soglia troppo bassa: è una domanda sbagliata. `collaudo-scia` chiedeva *se*
  l'acqua cambia e non *di quanto*, ed è passato per mesi su 1,8 livelli su 255.
  (§1octies-bis)
- **Una media su un rettangolo risponde a «quanto è grande», non a «quanto si
  vede».** Per una fascia sottile dentro una finestra larga serve un percentile.
- **Nessuna soglia in frazioni di pagina** — c'è `__nautica.p`.
- **Verifica che la grandezza sia la stessa prima di confrontarla.** Un picco
  contro un picco-picco: sono i confronti che passano per anni e poi accusano il
  sito il giorno in cui il mare si alza. (§2.7)
- **Prima di attribuire un effetto, misura il rumore del metro.** Presenza e
  occlusione danno undici punti di scarto a configurazione ferma; la p90 della
  scia ne dà otto decimi. Il primo non può decidere niente, il secondo sì.
- **Un cancello intermittente è peggio di uno rosso.**
- **Un avviso che scatta sempre non è un avviso.**
- **Un cancello dichiara anche cosa NON promette.**
- **Uno strumento deve rifiutarsi di concludere quando non ha misurato.** Il
  difetto che questo evita non produce un errore: produce un numero rassicurante.
- **Il soggetto di una misura si dichiara, non si deduce.** E il fianco di un
  pezzo si misura **nello scafo**, non nel mondo: col rollio la X di mondo cambia
  fianco a un pezzo che non si è mosso. (§1quater)
- **Un rilevatore di bordi trova sempre un bordo.** Quattro volte in una sera.
- **Due numeri diversi possono essere tutti e due giusti.** 656 e 700 erano il
  lato lontano e il lato vicino dello stesso spigolo.
- **Il dettaglio esiste alla scala in cui lo si inquadra.** Una fascia da 14 cm a
  51 metri è una frazione di pixel: aggiungerne altra è lavoro buttato finché la
  camera sta lontana. (§1nonies)
- **Si giudica guardando.** I cancelli impediscono il ritorno di errori già
  identificati; non decidono se un'immagine è bella.
