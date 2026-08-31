# Piano.md — piano operativo nautica

**Orchestratore:** Claude Opus 5
**Aperto:** 31 agosto 2026, 15:05 Europe/Rome
**HEAD alla stesura:** `b91176a`
**CI:** corsa 265 su `b91176a`, in esecuzione
**Sito pubblicato:** `index--ghDyN6V.js` — **vecchio**, nessuna corsa è ancora
arrivata in fondo oggi
**Risposte esterne attese in:** `feedback.md` (stessa cartella Drive)

---

## 0 · REGOLE DI ORCHESTRAZIONE, che valgono su tutto il resto

1. **Un file, un proprietario.** Mai due agenti sullo stesso file. In
   particolare `src/scena/index.js`, `src/stato.js`, `src/ui/suono.js`, il
   master Blender e i cancelli hanno un proprietario alla volta.
2. **Venti minuti, non uno di più.** Alla scadenza l'agente si ferma e lascia
   checkpoint, risultati, limiti e domande. Non si prolunga in silenzio.
3. **Gli agenti non integrano.** Nessun agente committa o spinge: consegna file
   e referto. **Solo l'orchestratore** legge il diff, risolve i conflitti
   intenzionalmente e rilancia i cancelli.
4. **Non si riempie la capacità.** Venti agenti si usano solo se ci sono venti
   compiti davvero indipendenti. Si procede a ondate.
5. **Servizi a consumo: un solo responsabile.** ElevenLabs → un agente. Colab →
   un agente. Nessuna chiamata parallela.
6. **Un'attività non è chiusa perché esiste un documento o un commit.** È chiusa
   quando ci sono risultato, test, prove visive e integrazione nel percorso
   standard.
7. **I fallimenti restano scritti.** Un tentativo negativo è un risultato: non
   si cancella e non si traveste da completato.

### Perché non spingo mentre la CI gira

Costato caro oggi: **ogni spinta annulla la corsa in esecuzione**. Cinque corse
annullate di fila, e il sito è rimasto fermo tutto il giorno. L'integrazione
aspetta che la corsa chiuda.

---

## 1 · STATO DI PARTENZA, misurato

| cosa | valore |
|---|---|
| filmati | 4,12 MB su 4,2 |
| JS totale | 210,5 KB gzip su 250 |
| percorso critico | 58,5 KB gzip |
| catena di collaudo locale | verde, zero ROTTO |
| Tripo | autenticato, **860 crediti** |
| ElevenLabs | chiave in `Ricevuti\help\.env`, skill provata |
| Blender | 5.2.0 LTS locale; Colab T4 con OPTIX, 4,3× più veloce |
| Colab WebGL | **T4 vera** con `--use-angle=vulkan` + `libnvidia-gl-580` |

### Difetti aperti, in ordine di gravità

| # | difetto | prova |
|---|---|---|
| D1 | **il gesto iniziale non è messo in scena**: si parte spenti ma a 19-21 s il salone è già un rettangolo nello scafo e il visitatore non ha mai acceso | provino |
| D2 | **la clip tesa è immobile**: 0,076 contro 0,424 del sollievo | misurato |
| D3 | **la traversata è un piano camera-space a copertura totale** | `traversata.js` |
| D4 | **il salone si rivela una carta** a scorrimento 0,235 | `feedback/prove/` |
| D5 | **lo scroll è annullato per 550 ms** e 220svh non raccontano | `attrito.js:36,61` |
| D6 | **tre orologi diversi**: attrito, `leggiScorrimento`, `seguiDiscesa` | codice |
| D7 | **il sito è muto** | zero occorrenze audio in `src/` |
| D8 | tre bordi rivelati non riprodotti (cavità, sezioni senza cappatura) | suo |
| D9 | yacht sui primi cinque punti dell'ordine | giudizio |

### Ingressi mancanti, non producibili da qui

- `WORLDSPACE-CONTRATTO.md` — **non è nel repo**, sta nel pacchetto Drive: va
  scaricato prima della Fase B;
- i cinque test utenti: servono cinque persone;
- il giudizio artistico sulla clip tesa: è del committente.

---

## 2 · ONDATE

```
  ONDATA 1  inventario, baseline, componenti indipendenti     ← in corso
  ONDATA 2  integrazione dei pezzi che passano
  ONDATA 3  collaudi sul percorso standard
  ONDATA 4  correzione delle regressioni
```

---

## 3 · ONDATA 1 — attività

Stati: `PRONTO` · `IN_CORSO` · `CHIUSO` · `PARZIALE` · `BLOCCATO` · `SCARTATO`

> **AVVISO — gli stati qui sotto NON sono piu' autorevoli.**
>
> Rilievo della revisione del 31 agosto, ed era giusto: dentro questo stesso
> file c'erano **due verita' in conflitto**. Nel §3 A1, A2, A4, A7 e A11
> risultavano `IN_CORSO` o `PRONTO`; nel §3-bis erano elencate come chiuse. Uno
> stato duplicato e discorde **vale zero**: chi legge non sa quale credere, e
> chi scrive aggiorna sempre l'altro.
>
> L'unico registro degli esiti e' il **§3-bis**. Le righe qui sotto restano
> perche' descrivono l'INCARICO — cosa era stato chiesto, con quali file e
> quale condizione di completamento — e quello non cambia. Lo stato no.

---

### A1 — Baseline: git, build, suite, peso, browser

- **priorità** 1 · **dipendenze** nessuna
- **file consentiti** `riferimenti/prove/A1-baseline.md` (solo creazione)
- **file vietati** tutto il resto: è **sola lettura** sul codice
- **risultato atteso** referto con HEAD, stato worktree, esito `npm run build`,
  esito `npm run collaudo` con la lista dei cancelli passati, `peso.mjs`, e la
  versione del browser usata dai collaudi
- **test richiesti** i comandi stessi sono il test
- **stato** → vedi §3-bis

### A2 — Inventario Blender: bounding box e coordinate

- **priorità** 1 · **dipendenze** nessuna
- **file consentiti** `riferimenti/blender/prove/00-inventario.txt`,
  `riferimenti/blender/inventario.py`
- **file vietati** ogni altro copione Blender, `public/modelli/*`
- **risultato atteso** versione Blender esatta; import dei GLB esistenti **senza
  scale locali arbitrarie**; bounding box, trasformazioni mondo e nomi dei nodi;
  la conversione dichiarata (0,4 unità per metro) verificata sui numeri
- **test richiesti** il file di inventario deve contenere numeri, non prosa
- **stato** → vedi §3-bis

### A3 — Greybox locale tecnico

- **priorità** 2 · **dipendenze** A2 per le coordinate (può partire in parallelo
  e riallinearsi)
- **file consentiti** `riferimenti/blender/parts/mechanism_bay.py`
- **file vietati** il master, gli altri `parts/*`, `public/modelli/*`
- **risultato atteso** copione che costruisce il locale pinne in **metri**, con
  le collezioni del contratto, e stampa bounding box e conteggio facce
- **stato** → vedi §3-bis

### A4 — Greybox corridoio e scala

- **priorità** 2 · **file consentiti** `riferimenti/blender/parts/corridor.py`
- **stato** → vedi §3-bis

### A5 — Guscio del salone come parte world-space

- **priorità** 2 · **file consentiti** `riferimenti/blender/parts/saloon.py`
- **nota** il guscio esiste già (`guscio-salone.py`, 123 KB, UV cotte, camera
  sorgente esportata): questa attività lo **riusa**, non lo rifà
- **stato** → vedi §3-bis

### A6 — Curva camera world-space

- **priorità** 2 · **file consentiti** `riferimenti/blender/camera_path.py`
- **risultato atteso** curva con continuità almeno C1, **senza durata cotta
  nello spazio**: il sito deve poter rimappare il progresso di scroll
- **stato** → vedi §3-bis

### A7 — Progetto del collaudo world-space

- **priorità** 2 · **file consentiti** `strumenti/collaudo-traversata-world.mjs`
- **risultato atteso** il cancello che verifica il criterio non negoziabile:
  **in nessun fotogramma un piano camera-space copre l'intero canvas**; più
  identità di canvas/renderer/camera e assenza di re-parenting
- **stato** → vedi §3-bis

### A8 — Profiling scroll e frame pacing

- **priorità** 2 · **file consentiti** `strumenti/collaudo-fluidita.mjs`
- **risultato atteso** p50/p95/p99 degli intervalli rAF, frame oltre 25/33,4/50
  ms, e il salto massimo nelle quattro giunzioni
- **attenzione** il metro non deve misurare la macchina: passo dichiarato dove
  serve, e `NON MISURABILE` invece di un numero inventato
- **stato** → vedi §3-bis

### A9 — Audit acqua-scafo

- **priorità** 3 · **sola lettura** + `riferimenti/prove/A9-acqua-scafo.md`
- **stato** → vedi §3-bis

### A10 — Validazione visiva della clip tesa candidato 02

- **priorità** 1 · **file consentiti** `riferimenti/prove/A10-clip-tesa.md`
- **già misurato dall'orchestratore**: movimento stanza 0,457 (contro 0,076
  della clip in uso), carrellata 0,33%, deriva 1,2 px — **passa i cancelli**
- **cosa resta** il giudizio di credibilità, che è del committente, e la prova
  dentro il sito
- **stato** `PARZIALE`

### A11 — Audio: due candidati `scafo-onde-loop` e due `salone-roomtone-loop`

- **priorità** 2 · **UNICO agente autorizzato a usare ElevenLabs**
- **file consentiti** `uscite/audio/**`
- **vincoli** `/v1/sound-generation`, `prompt_influence: 0.35`, MP3 originale
  conservato come restituito, master WAV 24-bit/48 kHz, mono per i suoni
  puntuali; **la chiave non compare mai** in file, log, repo o Drive
- **condizione di arresto esplicita** dopo i quattro candidati **si ferma** e
  aspetta il giudizio prima di spendere altri crediti
- **stato** → vedi §3-bis

---

## 3-bis · ESITI DELL'ONDATA 1, man mano

### CHIUSE

**A2 · inventario Blender** — 6 GLB importati (`scafo.glb` non esiste: lo scafo
e' procedurale in `src/scafo/ordinate.js`, e l'agente lo riporta come errore
vero invece di inventare un numero). **Scala confermata: 2,350143 contro 2,35 m
dichiarati, scarto 0,006%.** I GLB sono in metri; la conversione 0,4 unita'/metro
la applica il sito a runtime.
*Errore corretto dall'agente stesso:* al primo giro aveva misurato l'asse Y e
otteneva 412% di scarto — glTF e' Y-up e l'importatore Blender ruota a Z-up.
Consegna: `riferimenti/blender/inventario.py`, `prove/00-inventario.txt`.

**A7 · cancello della traversata world-space** — scritto e **rosso per il motivo
giusto**:

```
  COPERTURA   massima 100.0% (a p=0.96), tetto 99%; 3 campioni su 51
  IDENTITA'   tela, scena, camera e renderer restano gli stessi oggetti
  TELA        1 canvas
  CAMERA      nessun oggetto nuovo appeso alla camera
```

Fallisce **solo** su copertura, fra p=0,96 e p=1,00 — che coincide con la fascia
`[0.93, 1.00]` dichiarata in `regia.js:92`. Quindi il difetto e' quello descritto
dalla revisione, non un secondo mondo.
Consegna: `strumenti/collaudo-traversata-world.mjs`.

**A11 · audio, quattro candidati e stop** — quattro chiamate a
`/v1/sound-generation`, mai `/v1/music`. Durate esatte 20,000000 s, master WAV
48 kHz 24-bit. **Nessuna chiave trapelata**, verificato.
Il verdetto e' misurato sui campioni, non sperato: **nessuno dei quattro e'
davvero seamless**. Il peggiore, `salone-roomtone-loop_v1`, salta il **27% del
picco sul canale destro**. Migliori: `scafo-onde-loop_v1` e
`salone-roomtone-loop_v2`. Serve un micro-crossfade di 10-20 ms in montaggio.
Consegna: `uscite/audio/` (4 MP3 + 4 WAV + `manifest.md` con SHA-256).

**A4 · corridoio e scala** — 17 pezzi, alzata **17,5 cm**, pedata **29,0 cm**,
2×alzata+pedata = 64,0 cm (dentro la formula di comfort 62-64). Aperture
dichiarate come parametri in testa al file, senza tappi: sono le cuciture verso
A3 e A5.
**E un elenco onesto di cio' che ha inventato** perche' non esiste una misura:
larghezza 0,85 m, altezza libera 2,00 m, dislivello 2,10 m, pianerottoli 1,00 m.
Gli spessori li ha ripresi da `guscio-salone.py` invece di riderivarli.
Consegna: `riferimenti/blender/parts/corridor.py`.

**A1 · baseline** — e qui il risultato vale piu' del compito.

```
  HEAD           b91176a
  build          OK, 1,384 s, 50 moduli
  JS gzip        210,6 KB su 250
  percorso crit. 58,5 KB
  filmati        4,12 MB su 4,2
  Chromium       151.0.7922.34, channel 'chromium'
  CATENA         ROSSA — collaudo-sollievo, 5 ROTTO
```

**Ma la catena era VERDE un'ora prima, misurata da me.** A1 l'ha lanciata mentre
altri quattro agenti giravano sulla stessa macchina, e `collaudo-sollievo` e' il
cancello piu' sensibile ai tempi che questo repo abbia.

> **Nuova regola, nata qui: la baseline si misura a macchina ferma.** Un
> cancello temporale misurato sotto il carico di cinque agenti descrive il
> carico, non il sito. E' la settima forma dello stesso difetto — «misurare la
> macchina invece del sito» — e la prima che nasce dall'orchestrazione.

Da rifare a ondata chiusa. **Il numero di A1 non e' cancellato**: resta come
misura sotto carico, che e' un'informazione vera su un'altra domanda.

**A9 · audit acqua-scafo** — e ha trovato la distinzione piu' fine della
giornata:

> il cancello della scia **passa**, ma con mediana di schiarimento **0 livelli
> su 255** e solo il p90 a 20. *«Misura che l'effetto c'e', non che si vede.»*

I quattro cancelli dell'acqua passano tutti (mare, scia, varco, orizzonte), e
**nessuno copre la fascia di galleggiamento**: e' dipinta a quota FISSA sullo
scafo (`materiali.js:329`, `alto: 0.058`), mentre il pelo dell'acqua ondeggia
sotto con ampiezza `mare*0,052`. La nave ha rollio ma non sussulto.
L'agente lo dichiara **letto nel codice e non misurato**, che e' la cosa giusta.

**A6 · curva camera** — arco 11,0901 m, arrivo con scarto **0,000000 m** sul
nodo `CAMERA_SORGENTE_SALONE` letto dentro il GLB. Riparametrizzata per
lunghezza d'arco: nessuna legge oraria cotta nella curva. Picco di jerk al nodo
del corridoio, **atteso e spiegato**: Catmull-Rom centripeta e' C1 e non C2.

**A5 · guscio salone** — importato, non rifatto. Altezza aria 2,3501 contro
2,35 (0,004%). Decadimento oltre 1,9 m in due modi: ombra vera nel materiale
**piu' una paratia fisica** a 2,2 m con una porta. Una causa materiale, non una
dissolvenza nel vuoto.

**A3 · locale tecnico** — 21 pezzi. Non ha importato la geometria di
`impianto.glb`: ne ha usato il bounding box come **taglia**, perche' non e'
certo quale asse diventera' l'alto. Vano di sicurezza invece di incasso su un
orientamento presunto.

**A8 · fluidita'** — trova le quattro giunzioni **interrogando la pagina viva**
invece di cablare le soglie di `regia.js`.

```
  p50 33,1 ms · p95 33,6 · p99 49,8 · max 66,7
  peggiore: scafo->meccanismo e meccanismo->traversata, 66,7 ms con
            un salto di camera di 1,97 unita'
```

E dichiara il proprio limite: p50 a 33 ms **puo' essere il vsync di questa
macchina**, non il costo del sito.

---

## 3-ter · ONDATA 2 — il blocco che l'ondata 1 ha scoperto

**Manca un frame world-space comune.** A6 lo dice esplicitamente: P2 e' misurato
(il centro del vano da `posa.json`), ma P0 e P1 sono **assunti**, perche' i
quattro tratti sono stati costruiti da agenti diversi in sistemi di riferimento
diversi. Senza un `WORLD_ROOT` condiviso i pezzi non si toccano.

Le cuciture dichiarate, da allineare:

```
  A3 locale tecnico   paratia di poppa a X = 8,6226..8,7226
                      porta 0,70 x 1,90, Z -0,350..0,350, normale +X
  A4 corridoio        apertura bassa X = 0,000   (0,85 largo, 2,00 alto)
                      apertura alta  X = 5,480   (dislivello 2,10 m)
  A5 salone           vano X = -2,1746..0,0  Y = 0,0..1,1449  Z = 0,0
```

| ID | attivita' | proprietario | stato |
|---|---|---|---|
| B1 | master world-space: `scena-continua.py`, un solo `WORLD_ROOT`, aperture allineate | `riferimenti/blender/scena-continua.py` | `PRONTO` |
| B2 | cancello della fascia di galleggiamento: segue l'onda vera? | `strumenti/collaudo-galleggiamento.mjs` | `PRONTO` |
| B3 | audio: crossfade sui due candidati migliori + versioni web | `uscite/audio/**` | `PRONTO` |

**Nota di orchestrazione:** l'ondata 2 parte **dopo** la rimisura della catena a
macchina ferma, non durante. E' la regola nata da A1.

### SBLOCCATO DALL'ORCHESTRATORE

`riferimenti/WORLDSPACE-CONTRATTO.md` **scritto**, ricavato da `ciao.md` §15.4-15.6:
il file originale sta in uno zip Drive da 9,4 MB e gli agenti non potevano
leggerlo. Se il pacchetto entra nel repo, quel file cede all'originale.

---

## 4 · REGISTRO DELLE ONDATE

*(aggiornato dopo ogni ondata, non solo alla fine)*

| ondata | aperta | chiusa | esito |
|---|---|---|---|
| 1 | 15:05 | — | in corso |

---

## 5 · DOMANDE APERTE

1. **`WORLDSPACE-CONTRATTO.md` non è nel repo.** Sta nel pacchetto Drive del
   §14. Va scaricato e messo sotto controllo di versione prima della Fase B,
   altrimenti gli agenti costruiscono contro un contratto che non possono
   leggere.
2. **La clip tesa candidato 02 passa i numeri** (0,457 di movimento contro
   0,076, carrellata 0,33%). Resta il giudizio di credibilità — il primo
   candidato è stato respinto perché la donna si alzava. **Serve un sì.**
3. **Il gesto iniziale (D1) è messa in scena**: dove mettere il comando e come
   chiamarlo (`STABILISE THE YACHT` invece di `See what it does`) lo decide il
   committente. Il collaudo con pointer click vero è mio e lo faccio comunque.
4. **`attrito.js`**: toglierlo è una decisione di regia. L'attrito è stato messo
   per una ragione dichiarata nel file.

---

# Onda 3 — le segnalazioni del committente del 31 agosto (sessione dal vivo)

Nove voci arrivate una dietro l'altra guardando il sito pubblicato. Sono
elencate **tutte**, comprese quelle che non ho ancora toccato, con lo stato
vero e la misura che le regge o le smentisce.

| # | segnalazione (parole del committente) | stato | misura |
|---|---|---|---|
| 1 | «io vedo un fotogramma fermo che oscilla, dovrebbe essere un video con persone che oscillano?» | **diagnosticato, in attesa di decisione** | i video SUONANO (largo +4,14 s in 3 s). Ma il movimento umano della clip tesa e' **0,076** contro **0,424** del sollievo e **0,457** del candidato 02. L'occhio legge una fotografia inclinata perche' quasi lo e'. |
| 2 | «alla fine dovrebbe essere un video in loop dopo la traversata dove sono tranquille le persone» | **CHIUSO** | il filmato restava congelato a 8,04 s coprendo tutto, col loop calmo che suonava sotto invisibile. Ora la lastra si consegna al loop. Movimento del finale: **0,000 → 0,983 livelli**. |
| 3 | «il filmato parte sulla linea dell'orizzonte, riesci ad agganciare il 3D alla stessa altezza e allinearlo mentre scorro» | **da fare** | non ancora misurato. |
| 4 | «nella clip iniziale il movimento del mare non e' coerente con il movimento della barca» | **diagnosticato, da curare** | la geometria e' gia' giusta (ruota la stanza, non l'orizzonte). Il difetto e' che la clip del mare ha l'orizzonte **fermo: 2 px su 90** di escursione, e **non reagisce affatto** allo `SEA STATE`. La barca rolla 9,2° RMS dentro una finestra che mostra una tavola. |
| 5 | «il suono e' fastidiosissimo continuo, non e' coerente con nessun movimento» | **diagnosticato, da curare** | cinque voci, cinque scalari: `mare` segue lo stato del mare, `scia` la velocita', `motore` e `gyro` i giri, `scafo` il rollio **RMS** — che e' gia' una media, con costante di tempo 0,5 s. A comandi fermi sono tutte costanti. **Nessun termine nella fase del rollio**: per costruzione non puo' essere coerente con un movimento che oscilla. |
| 6 | «i pulsanti in grigio se disattivati con un'indicazione, accesi verde» | **CHIUSO** | lo spento era scritto in `--acqua-tenue`, la stessa famiglia del verde acceso. Ora grigio neutro + «Activate»; verificato sui colori calcolati. |
| 7 | «oltre scroll ci devono essere delle frecce con scritto muovi a destra / muovi a sinistra» | **CHIUSO** | fatto. E ha scoperto un difetto piu' grosso: la nota e l'invito **si sovrapponevano** (10 px a 1280x800, **totale** su telefono). Nuovo cancello `collaudo-ingombri.mjs`, 4 formati puliti. |
| 8 | «linee con angoli retti che indicano sistemi speciali, 3-4 scritte eclatanti» | **in corso** | «3 volte meglio» era un'ipotesi: **e' esatta**. Misurato a mare 5, picco di rollio **8,4° spenti → 2,8° accesi**. E la riduzione viva e' **91%**. I richiami leggono le cifre dal GLB e dalla lettura viva, non da stringhe. |
| 9 | «guarda la barra laterale da qui a qui, lo scroll non fa niente» | **in misura** | `collaudo-corsa-viva.mjs` campiona 60 punti della corsa e stampa quanto cambia la tela a ogni passo. Trova **tutte** le zone morte, non solo quella segnalata. |

## Cosa aspetta una decisione, e non la prendo io

1. **La clip di apertura.** Il candidato 02 misura 0,457 di movimento umano contro
   0,076 della clip in linea, e passa il cancello di stabilita' della camera
   (carrellata 0,33% su 0,5; deriva 1,2 px su 6; rotazione 0,12° su 0,3). A crf 30
   pesa 637 KB e resta dentro il tetto dei filmati. **Manca solo il tuo giudizio
   sulla credibilita' della posa.**
2. **La parola dei pulsanti.** Ho scritto «Activate» e non «Attiva il sistema»:
   il resto dell'interfaccia e' in inglese, e a 390px «ACTIVATE SYSTEM» va a capo.
   Si cambia in una riga.
3. **I testi dei quattro richiami.** Le cifre sono misurate, le frasi che le
   accompagnano sono mie. Il GLB dichiara `modelClaim: "illustrative"`: se hai i
   dati veri del costruttore, sostituiscono i miei senza toccare il codice.

## Blender: dove sono davvero

- **Fatto:** `inventario.py`, e quattro pezzi separati — `parts/mechanism_bay.py`,
  `parts/corridor.py`, `parts/saloon.py`, `camera_path.py`.
- **Il problema:** i quattro pezzi **non si toccano**. Non esiste ancora il
  `WORLD_ROOT` comune che allinea le cuciture dichiarate (paratia X=8,6226-8,7226,
  porta 0,70x1,90, normale +X; aperture X=0,000 e X=5,480, alzata 2,10 m; vano
  X=-2,1746..0, Y=0..1,1449). Finche' non esiste, non c'e' una traversata
  world-space: c'e' un filmato e quattro modelli scollegati.
- **Il guscio del salone** e' costruito e piazzato in un minimo locale misurato
  (scarto 26,7, residuo strutturale) ma **non e' certificato**: resta dietro
  `?guscio=1`, spento.
- **Il prossimo passo vero e' B1**, lo script padrone `scena-continua.py`.
