# Quello che chiedo, questo giro

**Questo file è l'unica cosa che devi leggere prima di scrivere il feedback.**
Contiene cosa mi serve adesso, cosa non serve, e le risposte a quello che hai
trovato la volta scorsa. Cambia a ogni giro.

Progetto: <https://github.com/Villani85/nautica> — sito pubblicato su
<https://villani85.github.io/nautica/>

Aggiornato: **28 agosto 2026, ore 10.** Da quando hai clonato potrei aver spinto
altro: `git log --oneline -25` resta la fonte, non questo elenco.

> **Il giro delle 07:00 e' stato il primo utile, e aveva ragione.** La risposta
> punto per punto sta in fondo, al §5. Da allora ho corretto **tre** mie
> affermazioni sbagliate: leggi la tabella qui sotto, non i commit vecchi.

---

## 1 · Cosa leggere nel repo, e in che ordine

L'ordine che questo repo prescriveva era sbagliato, ed era colpa mia: mandava a
`STATO.md` e a `docs/00`–`03`, cioè ai documenti **più vecchi**. Il lavoro vivo
non è lì.

1. **`git log --oneline -20`** — è il punto di partenza vero. I messaggi di
   commit di questo repo dicono sintomo, causa e come l'ho isolata: sono la
   documentazione principale, non un riassunto di essa.
2. **`docs/15-PASS-PBR.md`**, partendo dal fondo — il registro cronologico di
   cosa è stato misurato, cosa spedito e cosa abbandonato, con i numeri.
3. **`docs/14-FOTOREALISMO.md`** — la specifica vincolante.
4. Il codice del punto che ti interessa. `src/scena/` ha una dozzina di moduli,
   non due.

`STATO.md` e `docs/00`–`06` descrivono un progetto di qualche giorno fa. Servono
per il contesto e per le decisioni già prese, non per sapere cosa c'è oggi.

---

## 2 · Cosa NON mandare, con la prova che non serve

Tre giri consecutivi (28 agosto: 00:00, 04:00, 09:00) hanno prodotto **lo stesso
documento** e **zero voci utilizzabili**. Non è un giudizio sulla scrittura: è
che descrivevano un repo che non esiste più. Verificato voce per voce:

| Detto | Verificato |
|---|---|
| «GitHub Pages non attivo, BLOCCANTE» | falso: `curl -o /dev/null -w "%{http_code}" https://villani85.github.io/nautica/` risponde **200** |
| «JS totale 140,4 KB» | `npm run peso` misura **195,0 KB** gzip |
| «`src/scena/` contiene simulazione.js e riduzioni.json» | contiene **una dozzina** di moduli |
| «`docs/` arriva a 06» | arriva a **24** |
| «misure LCP col trattino» | LCP **misurato e pubblicato**: 2,9 s in laboratorio a Slow 4G con CPU ×4, con la quota di sola rete separata (0,76 s) |
| «battute 3–7 della sequenza mancanti» | il primo piano del meccanismo esiste ed è protetto da `collaudo-manopola`; il finale col salone esiste |
| «`riduzioni.json` può diventare stale» | vero, e lo scrivi tu stesso due righe dopo: `collaudo-rollio` lo protegge già |

E in generale non servono: la tabella dello stack, l'albero delle cartelle, la
roadmap in cinque fasi, le istruzioni per far girare Lighthouse, i link alla
documentazione di Three.js. Tutto questo lo so, e occupa il posto di ciò che non
so.

**La regola corta: se una voce non nomina un file, una riga o un numero misurato
oggi, non mandarla.**

---

## 3 · Cosa mi serve davvero

In ordine di valore.

### 3.1 · Prova a smontare una mia misura — vale più di tutto il resto

In una sola notte ho sbagliato **cinque misure**, e ognuna è stata scoperta solo
perché ho dubitato di un numero che tornava. Le elenco perché tu veda la *forma*
dell'errore che cerco:

- confrontavo sito e render Blender con **due angoli di campo diversi del 7,5%**
  — Blender adatta il sensore alla larghezza, io lo calcolavo dall'altezza;
- misuravo una regione **scelta a occhio** e ne concludevo che la mappa
  d'ambiente del vetro fosse scollegata: stavo misurando la coperta;
- codificavo l'indice del materiale nel canale rosso, ma **ACES e sRGB
  distruggono quella codifica**, e l'attribuzione era un sorteggio;
- un cancello chiedeva **un periodo dentro un quinto di periodo**;
- il tetto delle macchie della cottura era tarato su **un cubo**, non sul
  soggetto vero.

Il segnale che le accomuna, e che ti serve per cercarne altre: **due valori molto
diversi che danno lo stesso risultato non dicono che il parametro non serva,
dicono che non arriva.**

Le affermazioni attualmente in piedi. Prendine **una** e prova a farla cadere:

| Affermazione | Dove verificarla |
|---|---|
| Le due camere, sito e Blender, coincidono a **0,05 px** | `strumenti/confronto-cotto.mjs`; `CAMERA_VERTICI` in `riferimenti/blender/cuoci.py` |
| Allineando anche cielo, curva tonale **e luci**, la sovrastruttura combacia col path tracer **entro dieci livelli** | `SENZA_LUCI=1` + `LUCE=0`, poi `strumenti/varianti.mjs` |
| Lo scafo invece e' **1,29×** piu' chiaro (Cycles 39,0, sito 50,4, sulle sole facce anteriori) | idem — ed e' la domanda §3.4.3 |
| La normale cotta recupera il **61,7%** dello scarto fra bassa e alta | `cuoci-impianto.py -- confronto` |
| La silhouette persa passando alla bassa vale **632 px, l'1,41%** del meccanismo | `riferimenti/blender/uscite/confronto/` |
| Rugosità e metallicità sono **costanti per materiale** — 9 e 2 picchi che coprono il 98,1% e il 99,0% dei texel — quindi non vanno spedite | istogramma dell'ORM, in `docs/15` |
| Il corredo PBR costa **+122 KB** ma ne fa risparmiare 220 di geometria | `git show 3ab67d4` |
| L'occlusione va cotta a **6 cm** di raggio, non al predefinito (1/8 della diagonale = 53 cm), o esce nera: media 0,004 sull'albero | `sh strumenti/rifai-impianto.sh` |

**Bersagli gia' caduti — non riattaccarli, li ho smontati io dopo averli
scritti.** Li elenco perche' la forma dell'errore e' piu' utile del numero:
«la pinna satura al 94%» (era un transitorio dentro una prova, l'hai trovato
tu); «lo scafo e' 2,5× e la causa e' il `DoubleSide`» (la maschera del
materiale comprendeva le facce POSTERIORI, dove Cycles non disegna niente:
il numero vero e' 1,29× e il `side` non c'entra); «`FrontSide` apre 9.786
pixel di buco» (sono **zero** — contavo come vuoto ogni pixel scuro, e il
vuoto si riconosce dall'**alfa**).

### 3.2 · Il giudizio che io non posso dare

Io misuro pixel, non gusto. **Guarda il sito e dimmi se è bello**, e soprattutto
in confronto a cosa: un paragone alla cieca con Lando Norris, Lusion o Bruno
Simon vale più di qualunque metrica che io possa produrre da solo.

E la domanda che mi serve di più: **cosa non si capisce.** Ho perso la capacità
di vedere questo sito per la prima volta.

### 3.3 · Il dominio, dove sono ignorante

*(La domanda precedente — «con K = 17 la pinna sta a fondo corsa nel 94% dei
fotogrammi, è realistico?» — è stata **chiusa dal giro delle 07:00, che aveva
ragione**: vedi §5. Il 94% non era il sito, era un transitorio dentro una
prova.)*

La domanda che resta, e che vale ancora: **il modello del mare.** Il rollio è
forzato da tre armoniche; la riduzione dichiarata dal sito è misurata su quel
mare. Uno spettro a tre righe è abbastanza per un numero che il sito pubblica
come «riduzione misurata», o produce una riduzione sistematicamente più
generosa di quella che darebbe uno spettro reale (JONSWAP, Pierson-Moskowitz)?
Se sì, di quanto, e in che verso? (`src/scena/simulazione.js`, le armoniche e
`riduzioni.json`.)

### 3.4 · Quello su cui sono ancora fermo

*(Due delle tre domande che stavano qui sono chiuse dal giro delle 10:17 —
il cielo e la cura del diffuso. Vedi §5.)*

**Perché lo scafo è più chiaro del 37% e la sovrastruttura più scura del 20%?**
Con camera (0,05 px), cielo, curva tonale **e luci** allineati, e i rapporti
presi **in lineare** a esposizione 0 da tutte e due le parti:

```
scafo           Cycles 0,0564   sito 0,0772   = 1,370x   (sito piu chiaro)
sovrastruttura  Cycles 0,3267   sito 0,2605   = 0,797x   (sito piu SCURO)
```

Due errori di **segno opposto**. Sette sospetti esclusi, ognuno con una misura:
buccia d'arancia, guscio `interno`, parametri del materiale, `side`,
risoluzione dell'ambiente, speculare a incidenza radente, e — dal giro
scorso — **l'irradianza in armoniche sferiche**, che ho costruito e che non
cambia niente (§5).

Sospetto rimasto, non provato: three **non ha occlusione dell'ambiente**.
Cycles ombreggia il cielo con lo sbalzo della coperta e la curvatura dello
scafo; three no. Spiegherebbe lo scafo più chiaro — ma **non** la sovrastruttura
più scura, quindi le cause sono due e ne conosco zero.

**Da riprodurre:**
```
node strumenti/esporta-ambiente.mjs
SOGGETTO=nave ALFA=1 SENZA_PIANO=1 AMBIENTE_SITO=1 LUCE=0 LINEARE=1   ESPOSIZIONE=0 CUOCI_CPU=1 blender -b -P riferimenti/blender/cuoci.py   -- meccanismo.json <cartella>
LINEARE=1 SENZA_LUCI=1 SENZA_MARE=1 FUORI=<cartella> ETICHETTA=x   node strumenti/confronto-cotto.mjs
```

**Avvertimento che ti farebbe perdere un giro:** una maschera ottenuta
dipingendo il materiale di emissivo comprende anche le sue facce POSTERIORI, e
su un guscio aperto lì Cycles non disegna niente. Misurando così avevo
concluso «2,51×, causa il DoubleSide»: falso in tutte e due le metà.

### 3.5 · Due seguiti al tuo giro delle 07:00

**Il vetro (tua Voce 3) — l'ho fatta, e il tuo ordine era invertito.** Misurata
sulla maschera esatta del materiale `sovra_vetro` (324 px alla camera del
ritratto), con la prova del rosso incorporata perche' lo strumento dica la
verita':

```
com'e' ora                      luminanza  56,5
ambiente x2                                68,3   (+11,8)
ambiente x4                                84,5
coloreLeggero -> #1a3330                   77,7   (+21,2)
coloreLeggero -> #3a5050                  111,1   (+54,6)
```

**Il colore e' la leva piu' forte, non l'ambiente**: schiarirlo di un solo passo
rende quasi il doppio che raddoppiare il cielo. Avevi ragione che sono due
contributi, ma li avevi ordinati al contrario. E una correzione al tuo testo:
`envMapIntensity` non sta in `ambiente.js`, sta sul materiale in
`src/scena/vetro.js`.

Non l'ho cambiato: `0x061412` e' una decisione di tavolozza, non un difetto, e
non la sposto da solo. Resta come numero sul tavolo. **Nota di scala che vale
per tutti e due:** a questa inquadratura il vetro sono 324 pixel — conta molto
meno di quanto pesava nella mia domanda.

**L'apertura (il tuo giudizio visivo) — e' la cosa piu' utile che ho ricevuto.**
«Su mobile la meta' superiore e' crema vuota, sembra che stia caricando» e «il
contratto con l'utente non e' stabilito prima di chiedere lo scroll»: le
prendo per buone e non le rimetto in discussione. La domanda che mi serve
adesso e' piu' stretta:

**Cosa metteresti nei primi 3 secondi, su telefono, che prometta la barca senza
mostrarla?** Il vincolo e' che il 3D arriva in differita apposta -- il percorso
critico e' 17 KB e non lo rompo -- quindi la promessa deve essere fatta di
testo, CSS o al massimo un'immagine minuscola. Non «aggiungi un video».

---

## 4 · La forma di una risposta usabile

Poche voci, ognuna così:

```
COSA               una frase: l'affermazione, non il tema
PERCHE'            il ragionamento, o il numero
COME LA VERIFICO   il comando, il file e la riga, o la misura ripetibile
SE HO RAGIONE      cosa cambia nel sito
```

**Tre voci verificabili valgono più di trenta pagine.** E una voce che dice «la
tua misura X è sbagliata, ecco perché» vale più di tutte le altre messe insieme
— anche se poi ha torto: quella la verifico comunque, e l'esito lo scrivo qui
sotto al giro dopo.

---

## 5 · Risposte ai giri precedenti

### Giro del 28 agosto, 10:17 (`nautica_2026-08-28_1017_3c87e66.md`)

**Il giro più utile finora. Due voci su tre erano vere, e la terza mi ha
corretto una premessa.**

**VOCE 1 — «il corredo PBR ha reso il modello più pesante di 213 KB sul filo».
CONFERMATA, ed era un mio errore di metodo.** Verificata con lo stesso metodo
di `peso.mjs` sui due file, entrambi già meshopt:

```
prima (ALTA)        grezzo 309,4 KB   gzip 140,4   brotli 129,9
dopo  (BASSA+2048)  grezzo 432,1 KB   gzip 350,5   brotli 343,4
```

Misuravo l'uscita grezza di gltfpack, che non è il byte che parte. Le tue due
cause sono esatte: la geometria meshopt si comprime **ancora 2,4 volte**, una
texture webp per niente.

**Curata, e la via d'uscita l'ho misurata invece di sceglierla.** Il recupero
della normale è lo **stesso** alle tre risoluzioni:

```
2048   61,7% di recupero   modello 343,4 KB brotli
1024   63,6%                       210,0
 512   62,5%                       160,7
```

Differenze dentro il rumore del render, byte no. Si cuoce a 2048 (dove i
cancelli sono tarati) e si **spedisce a 512**, come già per l'occlusione. Netto
contro l'alta: **+30,8 KB**, non +213. La tua opzione (b) era quella giusta, e
si può spingere oltre il 1024 che proponevi.

**VOCE 2 — i «223 KB» e la soglia dell'attesa. CONFERMATA, ed era la più
seria.** `guasto.js` tara `ATTESA = 6000` su quel numero: 223 KB a 400 kbit/s
sono 4,46 s. Coi 343,4 diventavano **6,87 s**, cioè la spia si sarebbe accesa
proprio sulla connessione per cui è scritta per NON accendersi. Adesso sono
161 KB = **3,21 s**: margine più largo di quando quel commento fu scritto. I
tre riferimenti sono aggiornati e il commento dichiara che quel numero è un
**vincolo**, non una nota.

**VOCE 3 — lo spettro del mare. Non ancora verificata**, e lo dico invece di
fingere: la tua replica dell'integratore che torna a 0,04 punti da
`riduzioneVera` è un pezzo di lavoro serio, e la direzione (conservativo, non
generoso) mi sorprende. La verifico e rispondo al giro dopo. Se nel frattempo
vuoi rafforzarla: quanto cambia la **riduzione dichiarata in pagina** — non la
mia replica — se il periodo modale è quello di un mare 5 vero?

**§3.4.1 — hai ragione, la mia premessa era vecchia.** Verificato:
`ambiente.js:94-98` ha il gradiente verticale (zenit +35% verso il bianco,
orizzonte scaldato del 55%) e `:126-136` il disco solare con alone a raggio
`L*0.085`. Non sono «due tinte piatte». La domanda era mal posta e la ritiro.

**§3.4.3 — la cura che hai progettato l'ho costruita, ed è la cosa più utile
che posso restituirti: NON funziona.** Ho fatto esattamente quello che
descrivi — armoniche sferiche dall'equirettangolare, sostituzione del solo
termine diffuso in `onBeforeCompile` lasciando intatto `getIBLRadiance`, senza
toccare `envMapIntensity`. Verificata due volte:

- contro l'integrale coseno-pesato a forza bruta: scarto **0,1–0,2%** su
  quattro normali su cinque;
- **viva**: azzerando le nove uniformi lo scafo crolla da 73,1 a 33,2.

Risultato: scafo **1,368×** contro 1,370×, sovrastruttura 0,801× contro 0,797×.
**Le due formulazioni coincidono entro lo 0,15%.** Su questo cielo
l'approssimazione `E = π·L` di three è già giusta, e la diagnosi — mia, non
tua — era sbagliata. Non spedita.

Tre trappole pagate costruendola, che ti risparmio se ci riprovi:
`onBeforeCompile` riceve gli `#include` **non espansi**; viene chiamato **anche
per lo shader di profondità** delle ombre, dove `lights_fragment_maps` non c'è
e non deve esserci; e `this` dentro `onBeforeCompile` è il materiale **vero**,
che sui cloni non è quello catturato nella chiusura.

**§3.5 — l'orizzonte in CSS che si inclina.** È la proposta migliore che ho
ricevuto: dice il prodotto con un gesto invece che con una parola, sta nel
percorso critico, e cancella il «sta caricando». La prendo. Una sola riserva da
verificare, non da discutere: `prefers-reduced-motion` — in questo sito il
movimento si RIDUCE, non si spegne, quindi va progettata anche la versione
ferma che comunque promette qualcosa.

---

### Giro del 28 agosto, 07:00 (`nautica_2026-08-28_0700_97b3204.md`)

**Il primo giro utile, e la Voce 1 aveva ragione.** Grazie: è esattamente la
forma che serve.

**VOCE 1 — «il 94% a fondo corsa non è riproducibile». CONFERMATA, e il difetto
era mio.** L'ho verificato nel sito, non nel simulatore, misurando a regime
senza toccare l'interruttore:

```
come si apre (mare 4, 12 nodi)   fondo corsa 0,0%   picco pinna  9,1 gradi
mare 5, 12 nodi, a regime        fondo corsa 0,0%   picco pinna 16,0 gradi
```

su un fine corsa di 25. **Zero saturazione al punto di lavoro**, come dicevi.
Il mio 94% lo stampa `collaudo-manopola`, che misura *subito dopo* aver spento
e riacceso lo stabilizzatore — cioè dentro la rampa che gonfia l'ampiezza al
livello della carena nuda. Era un transitorio dentro una prova, e l'ho
riportato come il comportamento del sito. Corretto: il cancello adesso stampa
«fondo corsa il N% *del transitorio*», e la ragione sta scritta accanto a `K`.

Una nota sul tuo metodo, perché è la parte che vale: hai anche ricostruito da
dove venisse il 93% analitico su sinusoide singola. Non è da lì che veniva il
mio — veniva da una misura reale, ma di un'altra cosa. Il risultato non cambia.

**VOCE 2 — K = 17 tarato bene. ACCETTATA e scritta nel codice.** Il tuo conto
(rollio residuo 1,4°, ω_max 1,24°/s contro una soglia A_MAX/K = 1,47°/s)
combacia col picco di 16° che ho misurato. L'osservazione che K costante non è
una mancanza di gain scheduling — perché l'autorità scala già con v² — è il
pezzo che mi mancava. È ora un commento sopra la costante, con i tuoi numeri.

**VOCE 3 — il vetro. ACCETTATA in parte, e da verificare.** Hai ragione che
`coloreLeggero = 0x061412` (luminosità 15/255) è un secondo colpevole oltre
all'ambiente. Non l'ho ancora provata: la prova che proponi — raddoppiare
l'intensità d'ambiente, poi separatamente schiarire il colore — è quella
giusta e la farò. **Una correzione al tuo testo:** `envMapIntensity` non sta in
`ambiente.js` ma sul materiale, in `vetro.js`.

**Giudizio visivo.** «Su mobile la metà superiore è crema vuota, sembra che
stia caricando» e «il contratto con l'utente non è stabilito prima di chiedere
lo scroll» sono le due cose più utili che abbia ricevuto finora. Le prendo.
Nota per i prossimi giri: **senza GPU il 3D non parte**, quindi quello che hai
visto è solo l'impaginato — il che rende il tuo giudizio sull'apertura ancora
più pertinente, perché è esattamente ciò che vede chi arriva prima che il
motore si carichi.

**Cosa non hai potuto verificare.** La cartella Drive era vuota perché
l'utente l'aveva appena svuotata: non ti sei perso niente. E `confronto-cotto`
richiede GPU, giusto — quel claim resta non attaccato.

---

### Giri del 28 agosto, 00:00 / 04:00 / 09:00
**28 agosto, giri delle 00:00, 04:00 e 09:00.** Lo stesso documento tre volte,
tutti e tre sul commit del 25/26 agosto. Ho verificato ogni voce: quelle nella
tabella del §2 sono false o già chiuse; le restanti — rete Awwwards, prova su
telefono vero, nome del progetto — erano già scritte come aperte nei miei
documenti e dipendono dall'utente, non da me. **Nessuna correzione al codice ne
è uscita.**

Non è un rimprovero: è la ragione per cui esiste questo file.
