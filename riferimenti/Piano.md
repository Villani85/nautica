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

---

### A1 — Baseline: git, build, suite, peso, browser

- **priorità** 1 · **dipendenze** nessuna
- **file consentiti** `riferimenti/prove/A1-baseline.md` (solo creazione)
- **file vietati** tutto il resto: è **sola lettura** sul codice
- **risultato atteso** referto con HEAD, stato worktree, esito `npm run build`,
  esito `npm run collaudo` con la lista dei cancelli passati, `peso.mjs`, e la
  versione del browser usata dai collaudi
- **test richiesti** i comandi stessi sono il test
- **stato** `IN_CORSO`

### A2 — Inventario Blender: bounding box e coordinate

- **priorità** 1 · **dipendenze** nessuna
- **file consentiti** `riferimenti/blender/prove/00-inventario.txt`,
  `riferimenti/blender/inventario.py`
- **file vietati** ogni altro copione Blender, `public/modelli/*`
- **risultato atteso** versione Blender esatta; import dei GLB esistenti **senza
  scale locali arbitrarie**; bounding box, trasformazioni mondo e nomi dei nodi;
  la conversione dichiarata (0,4 unità per metro) verificata sui numeri
- **test richiesti** il file di inventario deve contenere numeri, non prosa
- **stato** `IN_CORSO`

### A3 — Greybox locale tecnico

- **priorità** 2 · **dipendenze** A2 per le coordinate (può partire in parallelo
  e riallinearsi)
- **file consentiti** `riferimenti/blender/parts/mechanism_bay.py`
- **file vietati** il master, gli altri `parts/*`, `public/modelli/*`
- **risultato atteso** copione che costruisce il locale pinne in **metri**, con
  le collezioni del contratto, e stampa bounding box e conteggio facce
- **stato** `PRONTO`

### A4 — Greybox corridoio e scala

- **priorità** 2 · **file consentiti** `riferimenti/blender/parts/corridor.py`
- **stato** `PRONTO`

### A5 — Guscio del salone come parte world-space

- **priorità** 2 · **file consentiti** `riferimenti/blender/parts/saloon.py`
- **nota** il guscio esiste già (`guscio-salone.py`, 123 KB, UV cotte, camera
  sorgente esportata): questa attività lo **riusa**, non lo rifà
- **stato** `PRONTO`

### A6 — Curva camera world-space

- **priorità** 2 · **file consentiti** `riferimenti/blender/camera_path.py`
- **risultato atteso** curva con continuità almeno C1, **senza durata cotta
  nello spazio**: il sito deve poter rimappare il progresso di scroll
- **stato** `PRONTO`

### A7 — Progetto del collaudo world-space

- **priorità** 2 · **file consentiti** `strumenti/collaudo-traversata-world.mjs`
- **risultato atteso** il cancello che verifica il criterio non negoziabile:
  **in nessun fotogramma un piano camera-space copre l'intero canvas**; più
  identità di canvas/renderer/camera e assenza di re-parenting
- **stato** `PRONTO`

### A8 — Profiling scroll e frame pacing

- **priorità** 2 · **file consentiti** `strumenti/collaudo-fluidita.mjs`
- **risultato atteso** p50/p95/p99 degli intervalli rAF, frame oltre 25/33,4/50
  ms, e il salto massimo nelle quattro giunzioni
- **attenzione** il metro non deve misurare la macchina: passo dichiarato dove
  serve, e `NON MISURABILE` invece di un numero inventato
- **stato** `PRONTO`

### A9 — Audit acqua-scafo

- **priorità** 3 · **sola lettura** + `riferimenti/prove/A9-acqua-scafo.md`
- **stato** `PRONTO`

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
- **stato** `PRONTO`

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

### IN CORSO

A3 locale tecnico · A5 guscio salone world-space · A6 curva camera ·
A9 audit acqua-scafo

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
