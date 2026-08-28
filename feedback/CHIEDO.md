# Quello che chiedo, questo giro

**Questo file è l'unica cosa che devi leggere prima di scrivere il feedback.**
Contiene cosa mi serve adesso, cosa non serve, e le risposte a quello che hai
trovato la volta scorsa. Cambia a ogni giro.

Progetto: <https://github.com/Villani85/nautica> — sito pubblicato su
<https://villani85.github.io/nautica/>

Aggiornato: **28 agosto 2026, ore 10.** Da quando hai clonato potrei aver spinto
altro: `git log --oneline -25` e' sempre la fonte, non questo elenco.

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
| La normale cotta recupera il **61,7%** dello scarto fra bassa e alta | `cuoci-impianto.py -- confronto` |
| La silhouette persa passando alla bassa vale **632 px, l'1,41%** del meccanismo | `riferimenti/blender/uscite/confronto/` |
| Rugosità e metallicità sono **costanti per materiale** — 9 e 2 picchi che coprono il 98,1% e il 99,0% dei texel — quindi non vanno spedite | istogramma dell'ORM, registrato in `docs/15` |
| Con camera, ambiente e curva tonale allineati, il residuo fra sito e Blender è **14,2 livelli** sulla sovrastruttura | ultimo giro del confronto, `docs/15` |
| Il corredo PBR costa **+122 KB** ma fa risparmiare 220 KB di geometria | `git show` del commit «Il meccanismo viaggia come bassa» |
| Allineando anche cielo e curva tonale, sopra la linea d'acqua l'esposizione fra sito e Blender coincide a **+0,8 livelli** | `node strumenti/esporta-ambiente.mjs`, poi `AMBIENTE_SITO=1 SOGGETTO=nave` in `cuoci.py`, poi `confronto-cotto.mjs` |
| Il residuo **non e' la sovrastruttura (14,2) ma lo scafo (39,9 livelli di struttura)** | stesso giro del confronto |
| L'occlusione va cotta a **6 cm** di raggio, non al predefinito (1/8 della diagonale = 53 cm), o esce nera: media 0,004 sull'albero | `sh strumenti/rifai-impianto.sh` |

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

### 3.4 · Le tre cose su cui sono fermo, e sono di giudizio, non di misura

1. **Il cielo è procedurale per decisione scritta** (`src/scena/ambiente.js`):
   usa i colori del foglio di stile, perché una fotografia porterebbe un azzurro
   che nel sito non esiste e toglierebbe senso alla giunzione fra fondo CSS e
   canvas — che è l'unica idea meccanica del progetto. Conseguenza: le superfici
   bianche riflettono due tinte piatte e leggono plastica.
   **C'è un modo di dare struttura a quel cielo senza tradire la decisione?**

2. **Il vetro esce a 29/255**, cioè quasi nero. È fisicamente corretto — riflette
   un ambiente scuro — ma le finestre di uno yacht vero, di giorno, sono la cosa
   più luminosa dopo la vernice bianca. **Chi sbaglia: l'ambiente o il modello
   del vetro?** (`src/scena/vetro.js`, `creaVetroLeggero`.)

3. **Da dove vengono 38 livelli sullo scafo?** È la domanda migliore che ho, e
   la metto per ultima solo perché è la più lunga. Con camera (0,05 px), cielo,
   curva tonale **e luci** tutti allineati — nel confronto si spengono con
   `SENZA_LUCI=1`, in Blender con `LUCE=0`, e resta la sola risposta
   all'ambiente — il risultato è:

   ```
   sovrastruttura   scarto  9,7 livelli   esposizione  -1,2   struttura 12,3
   scafo emerso     scarto 32,6           esposizione +20,5   struttura 35,4
   ```

   La sovrastruttura **combacia col path tracer entro dieci livelli**. Lo scafo
   no, ed è più chiaro. Campionando sei zone:

   ```
   tuga faccia sx    -3  -1  +2      scafo fiancata alta   +37 +37 +38
   tuga faccia dx    +7  +6  +7      scafo fiancata bassa  +40 +43 +46
                                     scafo prua            +33 +31 +31
                                     scafo poppa           +44 +40 +37
   ```

   Un sollevamento **uniforme sui tre canali**, senza spostamento di tinta, su
   **un solo materiale**.

   Ho già escluso due cose. **Non è la buccia d'arancia** (`materiali.js:242`):
   spegnendola il residuo va da 41,2 a 40,8, anche se da sola cambia 3.249 px
   di 50 livelli — è rumore ad alta frequenza sopra una differenza sistematica.
   **Non è il materiale**, letto dal vivo nel browser: `scafo` è `#707c82`,
   metalness 0, roughness 0,13, envMap a intensità 1, emissivo nero, nessuna
   lightmap — e il JSON che Blender legge porta gli stessi identici numeri.

   I due sospetti che non ho ancora escluso: il **`side: DoubleSide`** dello
   scafo contro l'`interno` che `cuoci.py` salta apposta per la nave
   (riga ~330), e la differenza fra l'**irradianza prefiltrata di three**
   (PMREM su un equirettangolare di soli 512×256) e il campionamento diretto di
   Cycles a roughness 0,13.

   **Da riprodurre:**
   ```
   node strumenti/esporta-ambiente.mjs
   SOGGETTO=nave ALFA=1 SENZA_PIANO=1 AMBIENTE_SITO=1 LUCE=0 CUOCI_CPU=1      blender -b -P riferimenti/blender/cuoci.py -- meccanismo.json <cartella>
   SENZA_LUCI=1 SENZA_MARE=1 FUORI=<cartella> ETICHETTA=x      node strumenti/confronto-cotto.mjs
   ```

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
