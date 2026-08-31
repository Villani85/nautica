# B6 — L'ASSEMBLATORE — referto

Inizio: 2026-08-31T22:52:15+02:00
Fine:   2026-08-31T22:57:28+02:00 (poi solo scrittura di questo referto)

Comando eseguito per davvero (due volte: la prima aveva un bug mio, vedi
sotto; la seconda e' quella dei numeri qui):

    "/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P riferimenti/blender/scena-continua.py

Uscita pulita (`EXIT=0`): lo script NON crasha piu' a livello Python — cattura
lui stesso i fallimenti dei pezzi e continua a verificare quello che puo'.
"Esce senza errore" qui NON vuol dire "assemblaggio riuscito": vuol dire che
l'assemblatore ha fatto il suo lavoro di dichiarare rossi invece di morire con
un traceback indistinto. **L'assemblaggio, nel merito, NON e' riuscito.**

Nota di processo: la prima esecuzione e' fallita per un bug MIO nello script
(unpacking di una tupla a 4 quando la funzione ne ritorna 3, riga morta
lasciata per errore). Corretto e rieseguito. Non e' uno dei tre pezzi
verificati, era il mio codice.

---

## 0 · Esito import dei tre pezzi (prerequisito delle tre verifiche)

| Collezione | Script | Esito | Causa |
|---|---|---|---|
| SALOON_SHELL | `parts/saloon.py` | **FALLITO** | `AssertionError` |
| MECHANISM_BAY / ENGINE_ROOM | `parts/mechanism_bay.py` | **FALLITO** | `KeyError: 'aggancio_m'` |
| STAIR_CORRIDOR | `parts/corridor.py` | OK | — |

Solo **1 pezzo su 3** ha effettivamente costruito geometria in questa
sessione. Questo non e' il conflitto `porta_locale_tecnico` gia' noto (quello
e' un disaccordo fra due file d'accordo su tutto il resto): sono **due bug
nuovi**, di contratto-vs-pezzo, scoperti eseguendo — esattamente il tipo di
cosa che l'assemblatore serve a trovare.

### FALLIMENTO 1 — `saloon.py` (traceback reale, non riassunto)

```
AssertionError: world_root.py dichiara per SALOON_SHELL una traslazione
(2.93219995, -0.607200027, -0.843599975) ma questo script importa il guscio
a trasformazione identita' (nessun offset). Il vano e' il riferimento del
progetto: se questo numero cambia, saloon.py va aggiornato di conseguenza,
non ignorato.
```

`saloon.py:141` contiene proprio questo assert, scritto da chi ha fatto
`saloon.py` per proteggersi da esattamente questo scenario — e infatti si
attiva. `world_root.COLLOCAZIONI['SALOON_SHELL']['traslazione_m']` oggi vale
`(+2.932, -0.607, -0.844)` (il "secondo riancoraggio" descritto nel contratto,
sezione 2), MA `saloon.py` non e' stato aggiornato dopo quel riancoraggio: continua
ad assumere trasformazione identita'. Il file stesso lo dice: "se questo
numero cambia, saloon.py va aggiornato di conseguenza, non ignorato" — ed e'
cambiato, e non e' stato aggiornato. Ne' `world_root.py` ne' `saloon.py` sono
scrivibili da questo incarico: **registro e basta**.

### FALLIMENTO 2 — `mechanism_bay.py` (traceback reale)

```
File "mechanism_bay.py", line 92, in <module>
    MB_AGGANCIO = world_root.COLLOCAZIONI['MECHANISM_BAY']['aggancio_m']
KeyError: 'aggancio_m'
```

`mechanism_bay.py:92` si aspetta una chiave `aggancio_m` dentro
`COLLOCAZIONI['MECHANISM_BAY']`. Quella chiave non esiste. Cio' che
`world_root.py` dichiara oggi per `MECHANISM_BAY` (sezione 4 del contratto,
verificata leggendo il file) e':

    cucitura_mondo_m            (-6.280, -3.270, 0.0)
    cucitura_locale_x_m         8.622575
    traslazione_x_derivata_m    -14.902575

Tre chiavi diverse da quella che il pezzo legge. Crasha alla RIGA 92, prima
di qualunque `def`: nessuna funzione del file (nemmeno
`costruisci_locale_tecnico()`, pensata apposta per essere chiamata da un
master senza rieseguire tutto lo script) e' arrivata a essere definita.
Anche questo e' un disallineamento fra contratto e pezzo, non un conflitto
di misura fra due pezzi. Non scrivibile da questo incarico: **registro e
basta**.

---

## VERIFICA 1 — Le cuciture passano

Usata `world_root.verifica_cucitura()`, non riscritta. Chiamata con i valori
letti dal namespace REALE di `corridor.py` dopo la sua esecuzione riuscita
(`LARGHEZZA_CORRIDOIO=0.85`, `ALTEZZA_LIBERA=2.00` — non ricopiati a mano).

```
CUCITURA IN CONFLITTO: porta_locale_tecnico
  corridor.py dichiara       0.85 x 2.00 m
  mechanism_bay.py dichiara  0.70 x 1.90 m
la porta e' 15 cm piu' STRETTA e 10 cm piu' BASSA dell'apertura che il
corridoio si aspetta. Assemblati cosi', il corridoio sbuca su una parete con
una porta piu' piccola del proprio vano: 7,5 cm di risega per lato e 10 cm
di architrave.
DECIDE: IL COMMITTENTE.
```

`world_root.verifica_cucitura` ha alzato `SystemExit` come da contratto:
catturato, NON aggirato con un try/except silenzioso.

**ESITO: ROSSO DICHIARATO.** L'assemblaggio non e' certificabile finche' il
committente non decide fra porta 0,70x1,90 e corridoio stretto a 0,70, o
corridoio 0,85x2,00 e porta allargata.

Le altre 4 cuciture del contratto, per stato (non tutte verificabili con
`verifica_cucitura`, che serve solo per le CONFLITTO — le altre sono
riportate cosi' come dichiarate):

| Cucitura | Stato |
|---|---|
| `porta_locale_tecnico` | CONFLITTO (sopra) |
| `aperture_alte` | DERIVATO |
| `ingresso_salone` | MISURATO |
| `vano_salone` | MISURATO |
| `paratia_poppa` | TRADOTTO |

---

## VERIFICA 2 — Nessuna compenetrazione fra collezioni

Metodo: bbox mondo REALE (vertici trasformati, non `location`/`dimensions`
che scatola() azzera con `transform_apply`) per ogni collezione presente
nella scena Blender di questa esecuzione, confronto a coppie con tolleranza
dichiarata **0,15 m** (dell'ordine dello spessore delle pareti/solai dei
pezzi: 0,08–0,12 m — distingue "si toccano alla cucitura" da "si
compenetrano").

Bbox mondo misurate (Blender X, Y, Z), unita' metri:

| Collezione | min | max | Fonte |
|---|---|---|---|
| SALOON_SHELL | — | — | **assente**: `saloon.py` fallito (FALLIMENTO 1) |
| STAIR_CORRIDOR | `(-6.280, -3.350, -0.545)` | `(-0.800, 0.910, 0.545)` | MISURATO, dopo traslazione applicata dall'assemblatore (vedi sotto) |
| MECHANISM_BAY | — | — | **assente**: `mechanism_bay.py` fallito (FALLIMENTO 2) |
| ENGINE_ROOM | — | — | **assente**: idem |

Nota sulla traslazione di STAIR_CORRIDOR: verificato PRIMA di scrivere
codice che `corridor.py` costruisce le proprie scatole con coordinate
LOCALI grezze (`scatola('CORRIDOIO_piano_basso', 0.0, X_INIZIO_SCALA, ...)`,
righe 239–283) — le variabili `TX_MONDO/TY_MONDO/TZ_MONDO` (riga 133)
vengono usate SOLO nel testo del referto stampato, mai passate a `scatola()`.
Quindi, diversamente da `saloon.py` (che si autocolloca, a zero) e da come
*dovrebbe* fare `mechanism_bay.py` (ma non puo', crash a riga 92),
`corridor.py` NON si autocolloca: l'assemblatore ha applicato lui la
traslazione dichiarata in `world_root.COLLOCAZIONI['STAIR_CORRIDOR']
['traslazione_m']` = `(-6.280, -3.270, 0.0)` agli oggetti radice della
collezione dopo l'esecuzione. Il bbox sopra e' POST-traslazione.

**ESITO: NON VERIFICABILE.** Con una sola collezione popolata su tre non
c'e' nessuna coppia da confrontare — 0 coppie testate, non "0 compenetrazioni
trovate". Dichiarato come rosso per assenza di dato, non taciuto e non
spacciato per un verde. La compenetrazione SALOON_SHELL↔STAIR_CORRIDOR,
SALOON_SHELL↔MECHANISM_BAY e STAIR_CORRIDOR↔MECHANISM_BAY resta da
verificare quando i due FALLIMENTI sopra saranno risolti da chi puo'
toccare quei file.

---

## VERIFICA 3 — La curva camera non attraversa geometria solida

Non e' stato possibile un test punto-dentro-mesh reale: mancano due delle tre
geometrie (verifica 2). Eseguita la versione DEBOLE dichiarata dal mandato:
`camera_path.py` girato per davvero (eseguibile in modo indipendente dal bug
2, perche' legge solo `traslazione_x_derivata_m` e `cucitura_mondo_m`, chiavi
che esistono), campionati **60 punti** uniformi in lunghezza d'arco
(`pos_at_arclength`, s01 da 0 a 1), e verificato che ognuno cada dentro un
volume libero DICHIARATO per zona (bbox rettangolare per ambiente, spessori
pareti sottratti), non contro una mesh vera.

Volumi liberi usati, con fonte:

| Zona | X (m) | Y (m) | Z (m) | Fonte |
|---|---|---|---|---|
| MECHANISM_BAY/ENGINE_ROOM | `[-14.903, -6.280]` | `[-3.270, -0.320]` | `[-1.480, 1.480]` | DICHIARATO — X da `world_root.COLLOCAZIONI['MECHANISM_BAY']`; Y/Z da costanti lette nel testo di `mechanism_bay.py` (`PAGLIOLO_Y`, `ALTEZZA_LIBERA=3.0`, `BEAM=3.2`), NON misurate ora (il pezzo non ha costruito geometria) |
| STAIR_CORRIDOR | `[-6.280, -0.800]` | `[-3.270, 0.830]` | `[-0.425, 0.425]` | **MISURATO** in questa sessione: bbox reale (verifica 2) meno spessori (`SPESSORE_SOLAIO=0.08`, `SPESSORE_PARETE=0.12`, letti in `corridor.py`) |
| SALOON_SHELL | `[-0.800, 8.000]` | `[-1.170, 1.180]` | `[-3.731, 0.843]` | DICHIARATO — da `world_root.CUCITURE['ingresso_salone']` e `FONDO_SCELTO_X=6.0` letto in `saloon.py` (usato 8.0 come margine oltre il fondo scelto, per non tagliare corto la zona) |

Risultato:

```
campioni totali: 60
fuori da OGNI zona dichiarata: 0
dentro una zona ma fuori dal volume libero Y/Z dichiarato: 13
peggiore: zona STAIR_CORRIDOR, punto (-0.8381, -0.0153, -1.4563)  (score 1.0313 m)
```

**ESITO: ROSSO**, ma con un limite del controllo che va dichiarato subito:
tutti e 13 i punti fuori-volume cadono nella fascia `X` fra circa `-0.84` e
`-0.72`, cioe' proprio attorno a `P2` (l'ingresso al salone, a X=-0.800): la
curva della camera in quel tratto ha Z che tende verso `-1.44` (il centro
della vera apertura misurata `ingresso_salone`, larga 4,57 m), ma la mia
zona STAIR_CORRIDOR li' finisce a `Z=[-0.425, 0.425]` (la larghezza del
corridoio, molto piu' stretta). Il "rosso" e' quindi, con alta probabilita',
un artefatto del confine rigido fra due scatole rettangolari che non
rappresentano la vera forma dell'apertura (un imbuto, non un gradino netto)
— non necessariamente la prova che la curva attraversa una parete vera. **Non
lo dichiaro verde per questo**: la copertura del controllo e' quella
dichiarata all'inizio (non rileva un solido reale dentro il volume, e qui in
piu' i confini di zona sono scatole grezze non le aperture vere), quindi il
sospetto resta aperto e va verificato con geometria reale quando i due
FALLIMENTI sopra saranno sanati.

---

## Riepilogo per chi deve decidere

1. **Assemblaggio NON certificabile.** Due pezzi su tre (`saloon.py`,
   `mechanism_bay.py`) falliscono all'esecuzione con un contratto
   (`world_root.py`) che, cosi' com'e' oggi, loro non rispettano — non e' il
   conflitto di misura gia' noto (`porta_locale_tecnico`), sono due bug
   nuovi trovati eseguendo:
   - `saloon.py:141` assume traslazione zero; `world_root.py` oggi dichiara
     `(2.932, -0.607, -0.844)`.
   - `mechanism_bay.py:92` legge `COLLOCAZIONI['MECHANISM_BAY']['aggancio_m']`;
     `world_root.py` non ha quella chiave (ha `cucitura_mondo_m` /
     `cucitura_locale_x_m` / `traslazione_x_derivata_m`).
2. La cucitura `porta_locale_tecnico` resta in CONFLITTO, come dichiarato nel
   contratto: decide il committente fra porta 0,70 e corridoio 0,85.
3. Compenetrazione fra collezioni: NON VERIFICATA (solo 1 pezzo su 3 costruito).
4. Curva camera: controllo debole eseguito, ROSSO con 13/60 campioni fuori dal
   volume libero dichiarato, concentrati alla transizione corridoio→salone;
   sospetta di essere in parte un limite del controllo stesso (scatole
   rettangolari troppo strette rispetto alla vera apertura), non confermabile
   senza geometria reale.

Nessun numero e' stato aggiustato per far tornare un conto. Nessun file
vietato e' stato toccato.
