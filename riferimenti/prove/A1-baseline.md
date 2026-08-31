# A1 — baseline misurata del repository

Agente A1, sola lettura. Limite duro 20 minuti. Data: 2026-08-31.
Ogni numero qui sotto e' l'output vero di un comando eseguito in questa sessione,
non un'interpretazione. Dove un comando non e' girato per il limite di tempo,
e' scritto NON MISURATO col motivo.

## 1. HEAD e stato del repository

Comando: `git log --oneline -1`

```
b91176a Sul telefono la didascalia copriva la dichiarazione, e la regola era tarata su una riga sola
```

Comando: `git status --short`

```
?? feedback/ciao-2026-08-31-1600.md
?? materiali/tesa-cand02.mp4
?? riferimenti/Piano.md
?? riferimenti/STRUMENTI-3D.md
?? strumenti/_leggi.py
?? strumenti/_titoli.py
```

Sei file non tracciati, nessuna modifica in sospeso su file tracciati.
Non ho toccato nulla di questo (sono in sola lettura).

## 2. Build

Comando: `npm run build` (= `vite build`)

Esito: **OK**, exit code 0.
Tempo reale (misurato con `time`): **1.384 s** (real 0m1.384s, user 0m0.137s, sys 0m0.106s).

Output:

```
vite v8.2.2 building client environment for production...
transforming...
✓ 50 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                       15.28 kB │ gzip:  6.14 kB
dist/assets/index-BFW4hTx2.css        30.45 kB │ gzip:  6.95 kB
dist/assets/atto-due-Cw2gLPNj.js       1.21 kB │ gzip:  0.65 kB
dist/assets/salone-atto-1wuPJAom.js    4.02 kB │ gzip:  1.88 kB
dist/assets/salone-BRnNsFq5.js         4.10 kB │ gzip:  2.03 kB
dist/assets/tocco-Dnucsfc4.js          6.65 kB │ gzip:  2.80 kB
dist/assets/index--LJP1XGG.js         16.47 kB │ gzip:  6.26 kB
dist/assets/demo-BRN4rhnb.js         152.25 kB │ gzip: 52.55 kB
dist/assets/stato-DFDVChGV.js        247.28 kB │ gzip: 67.57 kB
dist/assets/ambiente-D4zsP4P5.js     345.15 kB │ gzip: 84.06 kB

✓ built in 285ms
```

## 3. Peso — `node strumenti/peso.mjs`

Esito: OK, exit code 0. Eseguito subito dopo la build, sullo stesso `dist/`.

```
PERCORSO CRITICO — cio' che serve al primo disegno
  dist/assets/index--LJP1XGG.js                     16,1 KB  gzip     6,1 KB  br     5,5 KB
  dist/assets/index-BFW4hTx2.css                    29,7 KB  gzip     6,7 KB  br     6,1 KB
  dist/font/recursive-var.woff2                     39,7 KB  gzip    39,7 KB  br    39,7 KB
  dist/index.html                                   14,9 KB  gzip     6,0 KB  br     5,2 KB
  TOTALE                                           100,4 KB  gzip    58,5 KB  br    56,5 KB

DOPO — caricato solo quando la dimostrazione si avvicina
  dist/assets/ambiente-D4zsP4P5.js                 337,1 KB  gzip    81,3 KB  br    67,9 KB
  dist/assets/atto-due-Cw2gLPNj.js                   1,2 KB  gzip     0,6 KB  br     0,6 KB
  dist/assets/demo-BRN4rhnb.js                     148,7 KB  gzip    50,9 KB  br    44,7 KB
  dist/assets/salone-atto-1wuPJAom.js                3,9 KB  gzip     1,8 KB  br     1,6 KB
  dist/assets/salone-BRnNsFq5.js                     4,0 KB  gzip     2,0 KB  br     1,8 KB
  dist/assets/stato-DFDVChGV.js                    241,5 KB  gzip    65,2 KB  br    54,2 KB
  dist/assets/tocco-Dnucsfc4.js                      6,5 KB  gzip     2,7 KB  br     2,4 KB
  dist/filmati/salone-largo.mp4                    632,2 KB  gzip   631,6 KB  br   632,2 KB
  dist/filmati/salone-mare.mp4                     828,1 KB  gzip   825,6 KB  br   828,1 KB
  dist/filmati/salone-sollievo.mp4                 456,4 KB  gzip   456,1 KB  br   456,5 KB
  dist/filmati/salone-teso.mp4                     557,8 KB  gzip   556,9 KB  br   557,8 KB
  dist/filmati/traversata.mp4                     1550,4 KB  gzip  1549,5 KB  br  1550,4 KB
  dist/modelli/giroscopio.glb                      155,2 KB  gzip    99,8 KB  br    94,6 KB
  dist/modelli/guscio-salone.glb                   122,6 KB  gzip    11,5 KB  br     9,5 KB
  dist/modelli/impianto.glb                        205,9 KB  gzip   126,1 KB  br   119,5 KB
  dist/modelli/interni.glb                         466,1 KB  gzip   212,2 KB  br   189,4 KB
  dist/modelli/propulsione.glb                     217,2 KB  gzip   134,7 KB  br   128,7 KB
  dist/modelli/scafo-ao.webp                        12,5 KB  gzip    12,4 KB  br    12,4 KB
  dist/modelli/sovrastruttura.glb                  119,2 KB  gzip    66,2 KB  br    61,3 KB
  dist/salone/finestrone.png                         3,0 KB  gzip     1,4 KB  br     1,3 KB
  dist/salone/vano.json                              0,3 KB  gzip     0,2 KB  br     0,2 KB

JS TOTALE gzip: 210,6 KB   (cancello del brief: 250,0 KB)

I NUMERI IN PAGINA
  OK     Filmati                                    4.12 MB su un tetto di 4.2   (salone-largo.mp4 0.65 MB, salone-mare.mp4 0.85 MB, salone-sollievo.mp4 0.47 MB, salone-teso.mp4 0.57 MB, traversata.mp4 1.59 MB)
```

Riepilogo numeri chiave:
- **JS totale gzip: 210,6 KB** (soglia dichiarata 250,0 KB — dentro soglia)
- **Percorso critico gzip: 58,5 KB** (100,4 KB non compresso)
- **Filmati: 4,12 MB su un tetto di 4,2 MB** (OK) — 5 file: salone-largo 0.65 MB, salone-mare 0.85 MB, salone-sollievo 0.47 MB, salone-teso 0.57 MB, traversata 1.59 MB

## 4. Chromium usato dai collaudi

File: `strumenti/browser.mjs`. I collaudi che aprono un browser usano
`chromium.launch({ channel: 'chromium', ... })` (con ripiego a `channel: 'chrome'`),
non `chromium.launch({ headless: true })` semplice — il commento nel file spiega che
quest'ultimo lancia `chrome-headless-shell`, un binario senza stack GPU, e che la riga
`channel: 'chromium'` prende invece il binario completo con GPU vera (verificato in
passato via `WEBGL_debug_renderer_info`: ANGLE su Intel Graphics via D3D11 su questa
macchina, non SwiftShader).

Versione effettiva misurata in questa sessione lanciando lo stesso canale
(`chromium.launch({ headless: true, channel: 'chromium' })` da `playwright-core`)
e leggendo `browser.version()`:

```
VERSION: 151.0.7922.34
```

`playwright-core` in `package.json`: `^1.62.1`.

## 5. Catena collaudi — `npm run collaudo`

Comando eseguito in background con cattura del codice di uscita VERO (non quello
di un `grep` in coda alla pipe — questa e' la trappola gia' pagata in questo
repo):

```
npm run collaudo > collaudo-output.log 2>&1
echo "EXIT_CODE_REALE=$?" >> collaudo-output.log
```

`npm run collaudo` incatena 25 script `collaudo-*.mjs` con `&&`, seguiti da
`node strumenti/peso.mjs`. Con `&&`, il primo script che esce con codice
diverso da 0 ferma la catena: tutto cio' che viene dopo in elenco NON gira.

**Codice di uscita reale letto dal log: `EXIT_CODE_REALE=1`.**

**Esito: ROSSO.** La catena si e' fermata al decimo script su 25, sul cancello
del sollievo (`collaudo-sollievo.mjs`, che testa il comportamento di "calma"
dopo tensione+quiete — riparte, consegna il fotogramma finale, si ferma al
momento giusto).

### Cancelli passati (in ordine, prima del guasto)

Confermati dal testo dell'output, tutti con esito positivo:

1. `collaudo-workflow.mjs` — OK (`.github\workflows\pubblica.yml`, nessuna chiave ripetuta; workflow leggibili da Actions)
2. `collaudo-stato-iniziale.mjs` — OK (al primo fotogramma stab spento, mare 4, `aria-pressed "false"`; dopo il clic stab acceso; si parte spenti, accende l'utente)
3. `collaudo-rollio.mjs` — OK (stabilita' dell'integratore a 20/30/60/120 Hz, picco 1,4 gradi; taratura carena nuda scarto max 5% su tetto 30%; segnale/rumore su riduzione col mare; riduzione massima 90,8% su tetto 95; velocita' comanda la portanza; stallo oltre 20 gradi; percorso ridotto = percorso vivo; indipendenza da fasi e passo; tabella versionata corrisponde al modello — "TUTTO A POSTO")
4. `collaudo-catena.mjs` — OK (16 controlli sulla catena causale dell'atto due, tutti "OK"; controesempio col giroscopio, tutti "OK"; budget di tempo, tutti "OK" — "La catena e' causale: nessun ramo spegne le pinne al posto della velocita'.")
5. `collaudo-scafo.mjs` — OK (guscio 2145 vertici / 3968 triangoli, nessun valore non finito; tappo contro superficie scarto max 7,22e-8 — precisione float32; tappo ad anello, interno sempre dentro l'esterno; normali murata/ponte corrette; obiettivo mai sott'acqua, margine 0,020; mare attorno alla nave si muove e cresce con lo stato — "TUTTO A POSTO")
6. `collaudo-mare.mjs` / `collaudo-fantasma.mjs` — OK (a sistema spento le due navi coincidono esattamente, scarto 0,0000° su 3600 passi; il fantasma segue la fisica della nave nuda, non un fattore applicato; ad acceso le due navi divergono visibilmente, 8,79° a regime — "TUTTO A POSTO"). Nota: nel log questi due script producono un blocco unico e non sono riuscito a separare con certezza quale riga appartiene a quale file nel tempo rimasto — la sequenza rispetta comunque l'ordine dichiarato in `package.json`.
7. `collaudo-filmato.mjs` — OK (salone-largo/sollievo/teso.mp4: risolvenza, carrellata, deriva, rotazione, scivolamento tutti dentro i tetti dichiarati — "TUTTO A POSTO")
8. `collaudo-loop.mjs` — OK (giunzione e interno per salone-largo/teso/mare.mp4 tutti dentro i tetti 2x/4x — "LOOP IN ORDINE")

### Cancello ROTTO

**`collaudo-sollievo.mjs`** — cinque esiti negativi testuali, riportati parola per
parola dall'output:

```
diagnosi  calma: 1761 fotogrammi presentati, readyState 4, rVFC c e, inConsegna false
prima    fermo si · loop false
gesto    NON PARTE dopo tensione + quiete
finale   0.00 s · fermo NO · consegnato 0.00
calma    riparte a -- s (letta poi a 0.28) · in moto si
ritorno  opacita 0.00 · riarmato si
ROTTO  non parte dopo tensione e quiete
ROTTO  non consegna il fotogramma finale al ciclo calmo
ROTTO  il decoder non si ferma alla fine
ROTTO  si ferma troppo presto: 0.00 s
ROTTO  la scena non registra l istante della consegna: non misuro il raccordo
```

### Cancelli NON eseguiti (chain interrotta da `&&` dopo il fallimento)

Questi 15 script, elencati dopo `collaudo-sollievo.mjs` nella pipeline di
`package.json`, NON sono girati in questa sessione — NON MISURATO, perche' la
catena si e' fermata prima:

`collaudo-normali.mjs`, `collaudo-scia.mjs`, `collaudo-varco.mjs`,
`collaudo-inquadrature.mjs`, `collaudo-finale.mjs`, `collaudo-glb.mjs`,
`collaudo-gltf.mjs`, `collaudo-continuita.mjs`, `collaudo-orizzonte.mjs`,
`collaudo-cielo.mjs`, `collaudo-cinematica.mjs`, `collaudo-manopola.mjs`,
`collaudo-nudge.mjs`, `collaudo-ridotto.mjs`, `collaudo-telefono.mjs`.

L'ultimo passo della catena (`node strumenti/peso.mjs` finale, dentro
`npm run collaudo`) non e' girato per lo stesso motivo — ma il peso e'
comunque MISURATO in questo referto alla sezione 3, eseguito separatamente
subito dopo la build.

### Riepilogo numerico

- Cancelli eseguiti: 9 (workflow, stato-iniziale, rollio, catena, scafo,
  mare+fantasma, filmato, loop) — tutti OK per quanto riportato dal testo.
- Cancello fallito: 1 (`collaudo-sollievo.mjs`, 5 esiti ROTTO).
- Cancelli non eseguiti: 15 script + il `peso.mjs` di chiusura della catena.
- Codice di uscita reale della catena: **1** (rosso).
