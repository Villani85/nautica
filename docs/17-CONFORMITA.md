# 17 — Conformità del sito a `docs/14-FOTOREALISMO.md`

**Cosa è:** una lettura clausola per clausola della specifica vincolante contro
il codice, fatta il 27 agosto 2026 in sola lettura. Non modifica niente.

**Come è stata fatta:** ogni riga è stata verificata sul file, non sui commenti.
Il repository ha commenti lunghi e alcuni descrivono una versione precedente —
`src/scena/index.js:486-489` ne è l'esempio peggiore, e sta fra le violazioni.

**Cosa è stato eseguito** (tutto in sola lettura, nessun file toccato):

```
node strumenti/collaudo-glb.mjs        passato
node strumenti/collaudo-scafo.mjs      passato
node strumenti/collaudo-mare.mjs       passato
node strumenti/collaudo-normali.mjs    passato
node strumenti/collaudo-rollio.mjs     passato
node strumenti/peso.mjs                passato
```

più un estrattore di bounding box scritto per l'occasione fuori dal repository,
che legge gli accessor del GLB come fa `collaudo-glb.mjs`.

**Cosa NON è stato eseguito:** i cancelli che aprono un browser — `continuita`,
`cinematica`, `manopola`, `ridotto`, `impaginato`, `filmato`, `posa`. Le
clausole che dipendono solo da loro sono marcate *non verificabile senza
eseguire*, e dove cito un loro numero dico che è di seconda mano.

**Su cosa è stata fatta:** sull'**albero di lavoro**, non su un commit. Al
momento della lettura `git status` dava 7 file modificati rispetto a `HEAD`
(`docs/15`, `src/demo.js`, `src/scena/acqua.js`, `src/scena/index.js`,
`src/stile.css`, `src/ui/comandi.js`, `strumenti/collaudo-manopola.mjs`) e vari
file non tracciati. Due di questi ultimi vanno nominati perché toccano clausole
di questo referto:

- `src/scena/vetro.js` — **non è nel prodotto**: nessun modulo lo importa
  (`grep -rn "vetro.js" src/` → nessun risultato). Le clausole §7 sono state
  giudicate senza di lui;
- `strumenti/collaudo-telefono.mjs` — esiste e affronta §10.4, ma **dichiara
  esso stesso** (righe 15-31) che gira su un rasterizzatore software senza GPU
  e che «i fotogrammi al secondo che escono da qui non descrivono nessun
  telefono». Quindi §9.3 e §10.4 restano non misurate su hardware reale.

Legenda: **R** rispettata · **V** violata · **P** parziale · **?** non
verificabile senza eseguire.

---

## §0 — La decisione

| # | clausola | esito | prova |
|---|---|:--:|---|
| 0.1 | attuatore elettrico generico, riduttore cicloidale, carter sigillato sezionabile | R | `riferimenti/blender/glb-impianto.py:48` `RAPPORTO = 29`; nodi `RIG_CYCLO_A/B`, `HOUSING_*` presenti nel GLB |
| 0.2 | percorso visibile cavo→motore→eccentrico→dischi→portante→albero→tenuta→pinna | R | nodi nel GLB: `cavo`, `STATIC_MOTOR`, `RIG_ECCENTRIC`, `RIG_CYCLO_A/B`, `RIG_OUTPUT`, `RIG_SHAFT`, `STATIC_SEAL`, `RIG_FIN` |
| 0.3 | non è la copia di un prodotto commerciale, niente CAD/marchi/targhe | R | tutta la geometria è generata da `riferimenti/blender/glb-impianto.py` (598 righe di `bpy`); nessun file CAD nel repository |
| 0.4 | il sito non dice che è un Naiad/Quantum/Sleipner | R | `grep -i "naiad\|quantum\|sleipner\|galaxie" index.html` → nessun risultato |

## §1 — Scala

| # | clausola | esito | prova |
|---|---|:--:|---|
| 1.1 | 1 unità di scena = 2,5 m, dichiarato | R | `src/scafo/ordinate.js:19` `// Unita' di scena: 1 = 2,5 m. Scafo z in [-8, +8] = 40 m.`; `strumenti/collaudo-scafo.mjs` `const M = 2.5` |
| 1.3 | ogni misura riporta sistema di coordinate, trasformazioni e unità | R | `collaudo-glb.mjs` stampa `INGOMBRO 2.55 x 2.20 x 2.60 m, tutto compreso` e `PINNA apertura 1.500 m dal fasciame`, con la nota sul perché si misura dal fasciame (righe 190-205) |
| 1.4 | GLB in metri, conversione esplicita `0,4` al nodo radice | R | `src/scena/impianto.js:37-38` `METRI_PER_UNITA = 2.5` / `UNITA_PER_METRO = 1 / METRI_PER_UNITA`; applicata a `:206` `radice.scale.setScalar(UNITA_PER_METRO)` |
| 1.4b | la scala non è cotta nella mesh e non è duplicata su nodi figli | R | misurato: **tutti** i nodi del GLB hanno `scale: null`; l'unica scala in scena è quella della radice (`grep -rn "setScalar" src/` → 3 occorrenze, tutte conversioni calcolate) |
| 1.5a | apertura pinna ≈ 1,50 m | R | `collaudo-glb.mjs`: `PINNA apertura 1.500 m dal fasciame (bersaglio 1.5)`, tolleranza 2 cm |
| 1.5b | area planare pinna ≈ 2,20 m², valore autoritativo in `extras` | R | `extras.finAreaM2 = 2.2`; il cancello confronta con la corda disegnata: `riempimento 82%` |
| 1.5c | incidenza massima ±25° | R | `extras.finMaxAngleDeg = 25`; `collaudo-cinematica.mjs:60` `PINNA_MASSIMA = 25.5` |
| 1.5d | ingombro unità interna ≈ 1,10 × 0,73 × 0,93 m | R *(chiusa dopo il referto)* | misurato sull'unione di `HOUSING_*` + `STATIC_MOTOR/FOUNDATION` + `RIG_*`: **1,058 × 0,950 × 0,729 m** (X · alto · Z). Entro il 4,3% del bersaglio. Alla data del referto **nessun cancello lo controllava**; ora sì — `collaudo-glb.mjs` stampa `UNITA' 1.058 x 0.950 x 0.729 m dentro il fasciame` e va in rosso oltre il ±5% dichiarato in §1.5 |
| 1.5e | ~~altezza complessiva ≈ 1,31 m~~ → altezza complessiva del gruppo ≈ 0,928 m | R *(chiusa dopo il referto, **cambiando la specifica**)* | Il referto aveva ragione sul fatto (1,141 m misurati) e su nessuno dei due termini di paragone. **1,310 mm non esiste nella fonte**: nel PDF della e1500 la riga *Hull Unit Height (Overall)* ha la **cella del valore vuota**, e la stringa `1310` non compare nel documento. **E 1,141 m non era l'altezza di niente**: era il fondo della fondazione contro la cima di un **cavo elettrico**, il nodo `cavo` rimasto alla radice della scena per un `convert` che non convertiva (vedi 2.1c). §1.5 è stato riscritto con la prova; il bersaglio è ora 0,928 m — la sola quota verticale che la scheda riporti davvero — col datum sull'asse dell'albero. Misurato: **0,950 m, da −0,614 a +0,336**, +2,4%. Cancello: `ALTEZZA` in `collaudo-glb.mjs`, ±5% |
| 2.1c | ogni pezzo sta sotto un nodo del contratto | R *(aperta e chiusa dopo il referto)* | il GLB spedito aveva un nodo `cavo` **alla radice della scena**, accanto a `IMPIANTO`: fuori dal contratto §2.1, senza occlusione cotta, mai srotolato da `uv-impianto.py` (che prende `type == 'MESH'`, e quello era una `CURVE`). Corretto in `glb-impianto.py`, che ora si ferma se resta un solo oggetto fuori dalla gerarchia; e `collaudo-glb.mjs` va in rosso se la scena ha in cima qualcosa che non sia `IMPIANTO` |

## §2 — Una sola fonte geometrica

| # | clausola | esito | prova |
|---|---|:--:|---|
| 2.0 | `impianto.glb` sostituisce completamente il gruppo procedurale | R | `src/scena/nave.js:262` dichiara l'eliminazione, e il grep conferma: `manovella|biella|quadrilatero` compare solo dentro commenti (`materiali.js:79-80`, `nave.js:36,262`), mai come codice |
| 2.0b | JavaScript fa solo quattro cose | R | `src/scena/impianto.js` carica (`:110`), scala (`:206`), trova i nodi (`:113`), assegna trasformazioni (`:225-242`). Nessuna geometria costruita |
| 2.1a | i 14 nodi del contratto esistono | R | verificato sul file: figli di `IMPIANTO` = `HOUSING_FIXED, HOUSING_REMOVABLE, HOUSING_SECTION, RIG_CYCLO_A, RIG_CYCLO_B, RIG_FIN, RIG_INPUT, RIG_OUTPUT, RIG_SHAFT, STATIC_FOUNDATION, STATIC_HULL_PLATE, STATIC_MOTOR, STATIC_SEAL`, con `RIG_ECCENTRIC` sotto `RIG_INPUT` |
| 2.1b | origine di `IMPIANTO` = centro albero sul piano del fasciame | R | `STATIC_HULL_PLATE` sta in x ∈ [−0,012 · 0]; `RIG_SHAFT` è centrato su y = z = 0 |
| 2.1c | `RIG_SHAFT` e `RIG_FIN` ruotano attorno all'asse dell'albero | R | entrambi hanno `translation [0,0,0]` e nessuna rotazione propria; `impianto.js:230-231` scrive `rotation.x` |
| 2.1d | dischi sfalsati di 180° | R | `impianto.js:238-239`, il secondo con `ingresso + Math.PI` |
| 2.1e | nessun pivot corretto in JS con offset inventati | R | in `impianto.js` non c'è nessuna scrittura di `position` fuori dall'orbita dei dischi e dalla corsa del coperchio |
| 2.1f | **se un nodo manca, il caricamento fallisce in modo visibile** | **V** | `impianto.js:116-121` respinge la promessa, ma chi la riceve la ingoia: `src/scena/index.js:232` `i.caricato.catch(e => console.error('[impianto]', e.message))`. Il sito continua a girare senza meccanismo, e l'unico segnale è in console — che è esattamente il difetto che la clausola vieta |
| 2.2 | metadati in `extras` | R | letti dal file: `assetRole, authoringUnit:"meter", sceneMetersPerUnit:2.5, finAreaM2:2.2, finSpanM:1.5, finMaxAngleDeg:25, gearType:"cycloidal", gearRatio:29, eccentricityM:0.012, cycloDiscRadiusM:0.135, modelClaim:"illustrative"` |
| 2.3a | l'albero ruota attorno a +X | R | `impianto.js:230-233`, tutte `rotation.x` |
| 2.3b | la fiancata opposta non si ottiene con scala negativa | R | `src/scena/index.js:229` `if (a.lato < 0) i.gruppo.rotation.y = Math.PI` |

## §3 — Cinematica e simulazione

| # | clausola | esito | prova |
|---|---|:--:|---|
| 3.1 | le quote del vecchio leveraggio non compaiono in `simulazione.js` | R | `simulazione.js:52-62`: `W, ZETA, A1, K, C0, A_STALLO, A_MAX, RESIDUO`. Nessuna quota geometrica |
| 3.1b | dicitura pubblica «Illustrative model · Generic geometry · Normalised values» | R | `index.html:87` |
| 3.2a | `uscita = S.pinna`, `ingresso = −R·uscita`, angolo assoluto | R | `impianto.js:227-233`, identico al codice della specifica |
| 3.2b | rapporto e eccentricità dal GLB, non riscritti in JS | R | `impianto.js:131,133` leggono `extras.gearRatio` e `extras.eccentricityM`; le costanti di riga 60-61 sono ripieghi |
| 3.2c | 30 perni fissi e 29 lobi | R | `glb-impianto.py:276` «29 lobi», `:314-315` «la CORONA di perni fissi: 30, uno piu' dei lobi» |
| 3.2d | orbita dei dischi = quella della specifica | R | `impianto.js:238-239`, formula identica |
| 3.2e | i perni del portante attraversano davvero i fori su tutta la corsa | **?** | `glb-impianto.py:278` dichiara i fori; nessun cancello lo verifica e §10.2 (lo sweep che dovrebbe farlo) non esiste |
| 3.3a | `S.recupero` non porta unità fisiche | R | `index.html:103` `<i>/100</i>`; `:238-241` «an index from 0 to 100, not kilowatts»; `:309-310` «normalised and carries no units» |
| 3.3b | **l'etichetta pubblica è «Regeneration index · normalised 0–100»** | **P** | `index.html:102` dice solo `Recovery`. Il divieto è rispettato, la dicitura prescritta no: chi legge il pannello senza scendere fino a §4 della pagina vede una parola sola |

## §4 — Il carter è la rivelazione

| # | clausola | esito | prova |
|---|---|:--:|---|
| 4.1a | spessore visibile 4–6 mm | R | `glb-impianto.py:50` `SPESSORE = 0.005` |
| 4.1b | `HOUSING_SECTION` è un anello con spessore, non un piano | R | misurato: bbox **0,005 × 0,612 × 0,612 m** — 5 mm di materia, non zero |
| 4.1c | nervature, bulloneria, pressacavi, coperchio d'ispezione | R | `glb-impianto.py:163-168` (bulloni esagonali con rondella), `:216` morsettiera e pressacavo, `:224` nervature, `:233` coperchio d'ispezione |
| 4.1d | **blocco manuale** | **V** | `grep -i "blocco manuale\|centraggio"` sul builder → nessun risultato. È l'unica voce dell'elenco §4.1 che manca |
| 4.1e | bevel 1–3 mm sugli spigoli | R | `glb-impianto.py` `smussa(o, largh=0.0018)` come predefinito, 3 mm sulla pinna |
| 4.1f | nessun foro dipinto se la camera può attraversarlo | **?** | nessuna texture nel modello (0 immagini), quindi nessun foro *può* essere dipinto — ma la verifica vera è visiva |
| 4.2a | **`HOUSING_REMOVABLE` si separa in 0,9–1,2 s** | **V** | non esiste nessuna durata: `src/scena/index.js:495` `i.apri(clamp((spaccato - 0.55) / 0.35, 0, 1))`, cioè la corsa è **legata allo scorrimento**. La durata è quella della mano dell'utente, e può essere di un decimo di secondo o di venti |
| 4.2b | massa e inerzia si sentono nell'easing, senza rimbalzo | **V** | `impianto.js:262-266` `apri()` è una `clamp` lineare su `position.z`. Nessun easing di nessun tipo |
| 4.2c | il coperchio si allontana lungo la normale del taglio | R | `impianto.js:265` `position.z`, con la misura che lo giustifica nel commento (`:250-257`) |
| 4.2d | `HOUSING_SECTION` resta fermo | R | nessun codice lo muove: `apri()` tocca solo `HOUSING_REMOVABLE` |
| 4.2e | la camera entra solo quando il guscio ha liberato il percorso | P | calcolato dalle soglie di `regia.js:74-76`: all'inizio dell'avvicinamento (p = 0,84) il coperchio è sfilato al **9,4%**; a metà avvicinamento (p = 0,92) è al **92,5%**. Si sovrappongono, ma nella direzione giusta |
| 4.2f | il riduttore continua a ricevere `S.pinna` dalla simulazione viva | R | `index.js:492-493`, dentro il ciclo di disegno, senza condizioni sullo spaccato |
| 4.2g | bordo di sezione tecnico, non incandescente | R | `glb-impianto.py:75` materiale `sezione`: metallico 1,0, rugosità 0,20, nessuna emissione |

## §5 — L'esperienza

| # | clausola | esito | prova |
|---|---|:--:|---|
| 5.1-8 | i primi otto passi della sequenza | R | `src/regia.js:67-79` e `:141`: `salotto → uscita → emerge → mare → invito → calma → taglio → meccanismo` |
| 5.9 | **«torni alle persone: il valore è il benessere, non il motore»** | **V** | la sequenza finisce a `p = 1,01` sulla battuta `meccanismo` (`regia.js:117-121`), con la camera a 2,6 unità dal pezzo (`index.js:21`). Le persone si vedono **solo nella prima battuta**, e la sezione DOM del salone viene rimossa dal documento (`src/main.js:167` `salone.remove()`). Dopo la rivelazione non si torna a nessuno |
| 5.1a | scafo esterno: camera solidale al mondo, orizzonte orizzontale | R | `index.js:474` `nave.rotation.z = degToRad(S.rollio) * (1 - spaccato)`; la camera non ruota mai su z |
| 5.1b | **salone: stanza ferma, mare e orizzonte che ruotano** | **V** | è invertito. `src/scena/salone3d.js:253` `RUOTANO = [stanzaTex, mascheraRuota, ...]` — la texture del **mare** (`mareTex`, riga 207) è deliberatamente esclusa; `:362-367` ruota solo ciò che sta in `RUOTANO`. Il commento a `:356-360` lo dichiara: «IL MARE NON RUOTA PIU'. A ruotare e' la stanza». E `index.js:486-489` porta ancora il commento della regola opposta — «la stanza NON rolla … a inclinarsi e' l'orizzonte» — sopra una contro-rotazione che il modulo figlio annulla |
| 5.1c | il mare ha overscan sufficiente a coprire gli angoli scoperti | R | `salone3d.js:108` `INGRANDIMENTO = 1.15`, ricavato da `cos12° + (9/16)·sin12° = 1,095` |
| 5.1d | il pivot visivo coincide con l'orizzonte | R | `salone3d.js:116,208` `ORIZZONTE = 0.539`, misurato da `salone-da-filmato.py` e riverificato da `collaudo-filmato.mjs` |
| 5.1e | la cucitura canvas/CSS resta a 0 px | **?** | dipende da `collaudo-continuita.mjs`, non eseguito qui |
| 5.2a | vicino al meccanismo la camera è solidale alla struttura | R | durante il taglio il rollio è moltiplicato per `(1 - spaccato)` (`index.js:474`): a spaccato pieno la nave è ferma |
| 5.2b | nessun camera shake | R | `grep "shake"` in `src/` → nessun risultato |

## §6 — Il mare cambia davvero

| # | clausola | esito | prova |
|---|---|:--:|---|
| 6.1 | cinque livelli, `AMPIEZZA_MARE = [0,3,6,9,12,15]` | R | `simulazione.js:46`; l'interfaccia li genera tutti (`src/ui/comandi.js:16-22`) |
| 6.2 | **tre famiglie video: `mare-calmo.mp4`, `mare-formato.mp4`, `mare-duro.mp4`** | **V** | `public/filmati/` contiene **solo** `salone-largo.mp4` e `salone-mare.mp4`. Nessuna delle tre esiste, e nessun codice le nomina |
| 6.3 | dissolvenza fra famiglie al cambio di livello | **V** | non esiste, non essendoci famiglie. `salone3d.js:94` `const MARE = 'filmati/salone-mare.mp4'` è una costante: la clip dietro il vetro **non cambia** con `S.mare` |
| 6.4.1 | al cambio di mare cambia la superficie visibile | R | misurato da `collaudo-mare.mjs`: escursione attorno allo scafo `mare 0 = 0.000, mare 3 = 0.355, mare 5 = 0.592` — nella scena della nave. **Non** nel finestrino del salone (vedi 6.3) |
| 6.4.2 | …cambia il rollio | R | `simulazione.js` usa `AMPIEZZA_MARE[S.mare]` nella forzante |
| 6.4.3 | …cambiano escursione e velocità del riduttore | R | catena `S.mare → S.pinna → impianto.aggiorna` (`index.js:493`). Numeri di seconda mano da `docs/15` §0: 6,393 rad p-p a mare 2 contro 15,358 a mare 5 |
| 6.4.4 | **…cambia la posa delle persone** | **V** | `salone3d.js:76` `const TESA = null`. La posa puntellata è spenta: le persone hanno una sola posa a qualunque stato del mare. Il commento (`:60-75`) spiega perché è stata spenta, ma la clausola resta rotta |
| 6.4.5 | **…cambiano suono e carico normalizzato** | **P/V** | il carico sì (`S.carico`, `letture.js:20`). Il **suono non esiste**: `grep -rn "Audio\|AudioContext\|\.mp3\|\.wav" src/ index.html` → nessun risultato |

## §7 — Materiali e illuminazione

| # | clausola | esito | prova |
|---|---|:--:|---|
| 7.1 | carena epossidica bianco caldo, roughness 0,55–0,70 | R | `glb-impianto.py:72` `'carena': mat(..., 0.0, 0.62)` |
| 7.2 | carter vernice tecnica dielettrica | R | `:74` `'carter': mat((0.052,0.062,0.066), 0.0, 0.42)` — metallico 0 |
| 7.3 | acciaio metalness 1, roughness 0,22–0,35 | R | `:78` `'acciaio': mat(..., 1.0, 0.28)` |
| 7.4 | antivibranti gomma nera, roughness alta | R | `:81` `'gomma': mat(..., 0.0, 0.86)` |
| 7.5 | cavi arancione tecnico, con moderazione | R | `:82` `'cavo': mat((0.42,0.20,0.045), 0.0, 0.68)`, un solo pezzo nel modello |
| 7.6 | bordo di sezione non verniciato, leggibile ma non luminoso | R | `:76` `'sezione': mat(..., 1.0, 0.20)` |
| 7.7 | il bronzo non è un codice universale per «acqua marina» | R | non esiste nessun materiale bronzo nel builder; `materiali.js:72` ne ha uno per la scena del sito, ma nessuna mesh del GLB lo usa |
| 7.8 | **variazione di roughness prima dello sporco** | R | `src/scena/materia.js` la aggiunge nello shader, applicata per nome da `impianto.js:182-191`. Le ricette sono in `materia.js:124-134`, e `?materia=0` la spegne per poterla confrontare. Sullo scafo c'è la buccia d'arancia (`materiali.js:275-299`) |
| 7.9 | **lavorazione direzionale su acciaio tornito** | R | `materia.js:98-100`: la scala su X è `scala · direzione / 10`, su Y e Z è `scala` — cioè fitto lungo l'asse, largo attorno. `LAVORAZIONI.acciaio = { scala: 11, forza: 0.11, direzione: 15 }`. I verniciati hanno `direzione: 1` |
| 7.10 | **nessuna ruggine** | R | `grep -i "ruggine\|rust\|ossid"` su `src/` e `riferimenti/blender/` → nessun risultato. Nessuna texture nel modello, quindi non ce ne può essere di dipinta |
| 7.11 | impronte e tracce d'olio minime | R (per assenza) | non ce ne sono affatto |
| 7.12 | **normal/AO cotte per i dettagli minuti** | **V** | `docs/15` righe 17-20, verificato: `impianto.glb attributi: COLOR_0, NORMAL, POSITION  immagini: 0  texture: 0`. L'occlusione è cotta **nei vertici**, non in una mappa. Il pass è dichiarato aperto, ma la clausola §7 è scritta come stato, non come programma |
| 7.13 | silhouette, spessori, fori e bevel restano geometria | R | tutto il dettaglio è modellato: 26 primitive, bevel come modificatore |
| 7.14 | **nessun `scene.environment` sulla scena della nave** | R | `src/scena/index.js` non lo imposta mai: l'ambiente è dato **per materiale**, `materiali.js:163-168` per i nomi del sito e `impianto.js:193-204` per i materiali che arrivano nel GLB, a `envMapIntensity 0.55`. L'unica occorrenza di `scena.environment` è `src/scena/salone.js:100`, che è una **`Scene` diversa** (`salone.js:57`), caricata solo da `salone-atto.js` e solo con `?doppia=1` (`main.js:166-181`) |
| 7.15 | il tone mapping non obbliga il CSS a cambiare colore | R | `index.js:100` `render.toneMapping = NoToneMapping`; i piani del salone sono `toneMapped: false` (`salone3d.js:211,257`) |

## §8 — Pipeline

| # | clausola | esito | prova |
|---|---|:--:|---|
| 8.1 | fase grezza: GLB caricato con `GLTFLoader`, scala 0,4, collegato a `S.pinna` | R | `impianto.js:108-110, 206`; `index.js:493` |
| 8.2a | **invertire il riferimento del salone: stanza ferma, mare che rolla** | **V** | fatto al contrario — vedi 5.1b |
| 8.2b | **collegare le tre famiglie video ai cinque livelli** | **V** | le famiglie non esistono — vedi 6.2 |
| 8.2c | **mantenere la memoria delle pose** | **V** | `salone3d.js:76` `TESA = null`: la seconda posa è spenta, quindi non c'è memoria da mantenere. L'isteresi (`:348-353`) sopravvive ma non pilota più niente di visibile |
| 8.2d | **verificare il ritorno alle persone dopo la rivelazione** | **V** | non c'è ritorno — vedi 5.9 |
| 8.3 | fase fotografica: UV, bake, low-poly, KTX2 | V (dichiarata aperta) | `docs/15` intero. Coerente col piano, ma §7.12 resta scoperta |

## §9 — Peso e prestazioni

| # | clausola | esito | prova |
|---|---|:--:|---|
| 9.1 | massimo 1,5 MB trasferiti per l'asset | R | `collaudo-glb.mjs`: `PESO 310 KB (meshopt)`, `367 KB in 2 modelli`. `peso.mjs` conferma 309,5 + 57,6 KB |
| 9.2 | nessun modello nel percorso critico della prima schermata | R | `peso.mjs`: percorso critico = CSS 4,6 + JS 2,9 + font 39,7 + HTML 7,6 KB gzip. I modelli stanno sotto «DOPO». `main.js:99-131` importa `demo.js` solo all'`IntersectionObserver` |
| 9.3 | almeno 30 fps sul telefono di riferimento | **?** | `index.html:258` `<dt>Frames per second, mid-range Android</dt><dd>—</dd>` — dichiarato non misurato |
| 9.4 | nessun blocco percepibile quando il GLB diventa visibile | **?** | il caricamento è asincrono e non blocca (`index.js:224-234`), ma il giudizio è di percezione |
| 9.5 | comandi utilizzabili durante il caricamento | R | i comandi sono DOM e vivono in `avviaDimostrazione` prima che il GLB arrivi |
| 9.6 | fallback statico se WebGL o caricamento falliscono | R | `index.js:86-91` restituisce `null`; `demo.js:23-27` e `main.js:116-129` mostrano `#ripiego` distinguendo i due modi di fallire |
| 9.7 | **`prefers-reduced-motion`: posa leggibile, niente ciclo continuo obbligatorio** | **V** | `src/demo.js:61-68`: «il ciclo parte **SEMPRE**: con movimento ridotto la scena e' piu' piccola, non ferma», e `avviaCiclo()` gira un `setAnimationLoop` permanente. I due video del salone hanno `loop = true` (`salone3d.js:132`) e vengono avviati da `scena.accendi()`. Chi chiede movimento ridotto riceve un ciclo continuo con ampiezza ridotta a 1/3 (`simulazione.js:71`). **E il cancello `strumenti/collaudo-ridotto.mjs` impone esattamente questo**: righe 30-37, «che la scena DISEGNI … che il video AVANZI … che la nave OSCILLI». La specifica e il cancello si contraddicono |
| 9.8 | LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 | **?** | `index.html:257` `<dd>—</dd>` per l'LCP; INP e CLS non compaiono affatto in pagina |

## §10 — Cancellazione e collaudi

| # | clausola | esito | prova |
|---|---|:--:|---|
| 10.1a | rosso se manca un nodo del contratto | R | `collaudo-glb.mjs:149-158` |
| 10.1b | rosso se esistono nomi duplicati | **V** | non c'è nessun controllo. `collaudo-glb.mjs:69` costruisce `new Map(nodi.map((n,i)=>[n.name,i]))`: un nome duplicato viene **assorbito silenziosamente** dalla mappa, che è il contrario di ciò che la clausola chiede |
| 10.1c | **rosso se la scala radice non vale `0,4`** | **V** | nessun controllo, in nessun cancello. `grep -n "0\.4" strumenti/collaudo-glb.mjs` → nessuna occorrenza. La costante vive solo in `impianto.js` e in `sovrastruttura.js`, in due copie che nessuno confronta |
| 10.1d | rosso se il bounding box fisico esce dalla tolleranza dichiarata | R *(chiusa dopo il referto)* | Al referto: coperti solo apertura pinna (±2 cm) e area (±5%). Ora `collaudo-glb.mjs` controlla anche **ingombro dell'unità interna** e **altezza complessiva del gruppo**, entrambi ±5% — la tolleranza che questa clausola chiama «dichiarata» e che fino al referto **non era dichiarata da nessuna parte**: ora sta in tabella in §1.5, accanto a ogni quota. Provato a rompere: fondazione abbassata di 10 cm → rosso a +13,1% su entrambi; materiale `cavo` rinominato → rosso, e l'altezza risale a **1,141 m**, che è la prova diretta di dove venisse il numero di 1.5e |
| 10.1e | **rosso se il pivot di albero e pinna non coincide** | **V** | nessun controllo. Di fatto coincidono (misurato: entrambi `translation [0,0,0]`), ma per costruzione, non per cancello |
| 10.1f | rosso se `extras.authoringUnit !== "meter"` | R | `collaudo-glb.mjs:164-166`, e di nuovo a runtime in `impianto.js:125-130` |
| 10.1g | rosso se materiali o texture referenziati non vengono caricati | **V** | nessun controllo nei cancelli |
| 10.1h | **rosso se il file non passa il Khronos glTF Validator** | **V** | il validatore non è né installato né invocato: `grep -rn "validator" strumenti/` → nessun risultato, e non compare in `package.json` |
| 10.2 | **sweep cinematico: 101 pose da −25° a +25°, con controllo di compenetrazioni** | **V** | `collaudo-cinematica.mjs` fa un'altra cosa: campiona **3 punti di scorrimento** dal vivo (`:49` `PUNTI = [0.15, 0.35, 0.60]`), fra 20 e 160 campioni, e misura rapporto, orbita ed escursione. **Non** campiona 101 pose, **non** cerca `NaN`, **non** verifica che dischi e portante non attraversino il carter fisso, **non** verifica che il coperchio non invada la traiettoria della camera |
| 10.3 | **due immagini versionate, stessa camera: carter chiuso e carter aperto a metà** | **V** | `git ls-files | grep "\.png\|\.jpg"` → 15 immagini, nessuna delle due. Non esistono |
| 10.4 | collaudo finale manuale su telefono, registrato | **V** | nessun registro nel repository; i due valori che ne uscirebbero sono `—` in `index.html:257-258`. `strumenti/collaudo-telefono.mjs` (non tracciato) copre l'impaginato a 360/390/768 px, ma dichiara alle righe 15-31 di non poter misurare i fotogrammi di nessun telefono: gira senza GPU |

## §11 — Definizione di finito

| # | frase | esito |
|---|---|:--:|
| 11.1 | il vecchio leveraggio non esiste più nel prodotto | R |
| 11.2 | esiste un solo modello geometrico dell'impianto | R |
| 11.3 | il GLB è in metri e viene convertito con scala radice `0,4` | R |
| 11.4 | carter, sezione e cinematica leggibili senza didascalia | **?** |
| 11.5 | `S.pinna` comanda realmente l'intera catena del riduttore | R |
| 11.6 | il mare visibile cambia insieme alla simulazione | P — sì nella scena della nave, **no** nel finestrino del salone |
| 11.7 | **nel salone la stanza resta ferma e l'orizzonte rolla** | **V** — è l'opposto |
| 11.8 | il valore «Recovery» è dichiarato indice normalizzato | P — dichiarato in prosa, non sull'etichetta |
| 11.9 | **la rivelazione ritorna alle persone** | **V** |
| 11.10 | il telefono reale regge il percorso completo | **V** — non misurato |
| 11.11 | nessuna affermazione pubblica attribuisce al modello precisione che non ha | R — `index.html:87, 238-241, 303-310, 328-330` |

## §12 — Divieti

| # | divieto | esito | prova |
|---|---|:--:|---|
| 12.1 | nessun altro documento di pianificazione prima del GLB grezzo integrato | R | il GLB è integrato; `docs/15` e `16` sono successivi |
| 12.2 | **nessuna copia di un CAD commerciale** | R | tutta la geometria nasce da script `bpy` versionati; nessun `.step/.iges/.sldprt/.fbx` nel repository |
| 12.3 | **nessun logo di produttore** | R | 15 immagini versionate, tutte fotogrammi di riferimento o maschere; nessun marchio in `index.html` |
| 12.4 | nessun planetario mostrato e chiamato cicloidale | R | 29 lobi e 30 perni fissi, non un rotismo epicicloidale (`glb-impianto.py:276, 314-315`) |
| 12.5 | **nessuna unità fisica sul recupero normalizzato** | R | `index.html:103` `/100`; `:240` «not kilowatts»; `letture.js:21` scrive un intero senza unità |
| 12.6 | **nessuna scala scelta guardando lo schermo** | R | le uniche tre scale in `src/` sono `impianto.js:206` e `sovrastruttura.js:49` (conversione `1/2.5`) e `salone3d.js:345` (rapporto di profondità calcolato) |
| 12.7 | **nessun `scene.environment` globale sulla scena della nave** | R | vedi 7.14 |
| 12.8 | nessun high-poly prima che pivot, nodi e simulazione funzionino | R | l'ordine è stato rispettato: il grezzo è entrato prima |
| 12.9 | **nessuna riduzione del mare a un valore numerico con video invariato** | **V** | è precisamente ciò che succede nel salone: `S.mare` cambia, e `filmati/salone-mare.mp4` dietro il vetro resta identico (`salone3d.js:94`, nessun consumatore di `S.mare` in tutto il file) |
| 12.10 | **nessuna conclusione narrativa dentro la sala macchine** | **V** | `regia.js:117-121`: l'ultima battuta, quella in cui la camera è a 2,6 unità dal riduttore, porta titolo *«The part you never see»* e testo *«… It costs a fraction of the boat, and it decides whether anyone is comfortable on board.»* È una conclusione narrativa, ed è l'ultima cosa che il capitolo dice |

## §13 — Fonti

| # | clausola | esito | prova |
|---|---|:--:|---|
| 13.1 | il sito non rivendica ciò che le fonti non sostengono | R | `index.html:303-310` è stato corretto per dirlo: «it runs on author's constants … That is why the recovery figure here is normalised and carries no units» |

---

## Conteggio

- **rispettate:** 52
- **violate:** 21
- **parziali:** 9
- **non verificabili senza eseguire:** 8 (di cui 3 — 9.3, 9.8, 10.4 — non sono
  «non verificabili» ma **non misurate**, e il sito lo dichiara col trattino)

---

## Le tre cose più gravi

### 1. Il salone rolla al contrario di come la specifica lo prescrive, e il commento sopra il codice descrive ancora la regola vecchia

`docs/14` lo dice tre volte — §5.1 («stanza e cornice restano ferme
nell'inquadratura; mare e orizzonte ruotano nel finestrino»), §8.2 («invertire
il riferimento del salone: stanza ferma, mare che rolla»), §11 («nel salone la
stanza resta ferma e l'orizzonte rolla»). Il codice fa l'opposto, e lo fa in
due strati che si annullano:

- `src/scena/index.js:489` contro-ruota il gruppo del salone e lo motiva con un
  commento che è la regola di §5.1 parola per parola: *«la stanza NON rolla:
  chi e' seduto dentro ha il proprio salotto come riferimento, e a inclinarsi
  e' l'orizzonte»*;
- `src/scena/salone3d.js:253` costruisce `RUOTANO` **senza** la texture del
  mare, e `:362-367` ruota solo quella lista. Il commento a `:356` dichiara la
  regola contraria: *«IL MARE NON RUOTA PIU'. A ruotare e' la stanza»*.

Chi legge `index.js` crede che il sito segua §5.1. Chi legge `salone3d.js`
crede che §5.1 sia stata revocata. `docs/15` riga 197 registra la seconda
versione come un passo chiuso — *«il salone risponde: la stanza rolla e l
orizzonte no»* — citando `docs/09` invece di `docs/14`, che è la specifica
vincolante e non è mai stata emendata.

**Questa è la contraddizione più pericolosa del repository**, perché tutti e
tre i documenti hanno ragione dal proprio punto di vista e nessuno sa di essere
in disaccordo. Va risolta scegliendo — e scrivendo in `docs/14` la frase che
viene sostituita, come chiede l'istruzione in coda al documento — non
lasciandola in due commenti che si smentiscono a quattro file di distanza.

### 2. La sequenza finisce in sala macchine, con una didascalia che conclude

`docs/14 §5` dà nove passi e il nono è *«torni alle persone: il valore è il
benessere, non il motore»*; §11 lo ripete come condizione di finito; §12 lo
protegge con un divieto esplicito, *«nessuna conclusione narrativa dentro la
sala macchine»*.

Oggi l'ultima battuta è `meccanismo` (`src/regia.js:117-121`), con la camera a
2,6 unità dal riduttore (`index.js:21`), e porta titolo e testo — cioè
esattamente la conclusione narrativa vietata. Le persone escono di scena alla
prima battuta e non tornano: la sezione DOM del salone viene **rimossa dal
documento** (`src/main.js:167`).

Il difetto è aggravato dal fatto che `docs/16 §2` mette in dubbio il *verso*
del racconto («due revisioni hanno chiesto l'opposto … la decisione è del
committente e non è stata presa»), mentre `docs/14` l'aveva già presa. Si sta
chiedendo a revisori esterni un parere su una domanda che la specifica ha già
chiuso, e nessuno se n'è accorto perché nessuno ha riletto §5.

### 3. Tre cancelli di §10 non esistono, e uno di quelli che esistono impone il contrario di §9

Il §10 elenca controlli precisi. Verificati sul codice:

| §10.1 chiede rosso se… | c'è? |
|---|---|
| esistono nomi duplicati | **no** — la `Map` di `collaudo-glb.mjs:69` li assorbe in silenzio |
| la scala radice non vale `0,4` | **no**, in nessun cancello |
| il pivot di albero e pinna non coincide | **no** |
| materiali o texture referenziati non caricano | **no** |
| il file non passa il Khronos glTF Validator | **no** — non è nemmeno installato |

E lo **sweep cinematico di §10.2** — 101 pose da −25° a +25°, con i controlli
di compenetrazione fra dischi, portante e carter fisso — non esiste:
`collaudo-cinematica.mjs` campiona tre punti di scorrimento dal vivo e misura
altro. È la ragione per cui §3.2e («i perni devono attraversare davvero i fori
su tutta la corsa») resta una dichiarazione del builder che nessuno controlla.

Sopra tutto questo c'è una contraddizione dichiarata: **`docs/14 §9` chiede che
con `prefers-reduced-motion` non ci sia «ciclo continuo obbligatorio», e
`strumenti/collaudo-ridotto.mjs` diventa rosso se il ciclo si ferma** (righe
30-37: «che la scena DISEGNI … che il video AVANZI … che la nave OSCILLI»).
Il cancello è motivato e la sua motivazione è buona — una pagina ferma non
fallisce nessun controllo, e il committente l'ha chiesto due volte — ma finché
`docs/14 §9` dice l'altra cosa, il repository ha una regola scritta e un
cancello che la vieta. È la stessa patologia del punto 1, applicata a un
requisito di accessibilità.

---

## Nota di metodo

Due clausole erano **chiuse senza che il documento lo sapesse**, e vale la pena
dirlo perché la revisione serve anche a questo:

- **§7.8-7.9**, variazione di roughness e lavorazione direzionale: `docs/14`
  le mette fra le regole di resa e `docs/15` le dà per rimandate alla cottura
  delle mappe. Sono invece **già implementate** in `src/scena/materia.js`, per
  nome di materiale, con i verniciati a `direzione: 1` e i torniti a `15` — e
  con `?materia=0` per poterle confrontare invece che dichiararle;
- **§12.7**, `scene.environment`: il divieto è rispettato con cura, e in due
  posti indipendenti (`materiali.js:163` per nome, `impianto.js:193` per i
  materiali che arrivano dentro il GLB). L'unica occorrenza nel repository sta
  su una `Scene` diversa, raggiungibile solo con `?doppia=1`.
