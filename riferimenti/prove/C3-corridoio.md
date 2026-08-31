# C3 — corridor.py nel frame comune (world_root)

Inizio: 2026-08-31T17:45:24+02:00

## Cosa e' stato fatto

`riferimenti/blender/parts/corridor.py` ora:

1. importa `world_root` (aggiunta `riferimenti/blender/` a `sys.path`, non
   ricopiato niente da li');
2. prende la traslazione da `world_root.COLLOCAZIONI['STAIR_CORRIDOR']
   ['traslazione_m']` invece di ricalcolarla — `TX_MONDO, TY_MONDO, TZ_MONDO
   = world_root.COLLOCAZIONI[...]`;
3. usa `world_root.radice()` e `world_root.collezione('STAIR_CORRIDOR',
   WORLD_ROOT)` al posto di `bpy.data.collections.new('WORLD_ROOT')` in
   proprio (riga 180 del file originale, ora rimossa);
4. le due aperture (`APERTURA_LOCALE_TECNICO`, `APERTURA_SALONE`) espongono
   accanto alle quote locali le chiavi `x_mondo`, `y_pavimento_mondo`,
   `y_soffitto_mondo`, `z0_mondo`, `z1_mondo`, calcolate da `TX/TY/TZ_MONDO`;
5. la nota "valore di partenza ragionato, NON misurato — vedi ciao.md §15"
   e' sostituita: `APERTURA_LOCALE_TECNICO['nota']` dichiara **CONFLITTO**
   sulla cucitura `porta_locale_tecnico`; `APERTURA_SALONE['nota']` dichiara
   **DERIVATO** sulla cucitura `aperture_alte`;
6. `verifica_cuciture_mondo()` chiama `world_root.verifica_cucitura(
   'porta_locale_tecnico', 'corridor.py', larghezza_m=LARGHEZZA_CORRIDOIO,
   altezza_m=ALTEZZA_LIBERA)`, ma NON viene chiamata all'esecuzione
   standalone: e' protetta da `if os.environ.get('NAUTICA_VERIFICA_CUCITURE')`
   in fondo al file, cosi' lo script normale continua a produrre il proprio
   GLB da solo (come chiede il compito), e l'assemblatore la richiama quando
   vuole far fermare la build sul conflitto.

`LARGHEZZA_CORRIDOIO` e `ALTEZZA_LIBERA` NON sono stati toccati (restano
0.85 e 2.00): il conflitto con `mechanism_bay.py` (0.70 x 1.90) e' registrato,
non risolto — la scelta e' del committente.

**Nota sul contratto**: `world_root.py` offre solo `collezione()`, `radice()`,
`verifica_cucitura()`, `riepilogo()`. Non offre equivalenti di `pulisci()`,
`materiale()` o `scatola()` — quelle restano proprie di `corridor.py` (come
gia' erano), perche' il contratto e' congelato e non le definisce. E' un
buco del contratto, non una scelta di questo file: se `mechanism_bay.py` e
`saloon.py` hanno le proprie copie di `materiale()`/`scatola()`, sono tre
copie della stessa funzione in tre file — esattamente il difetto che
`world_root.py` dice di voler eliminare, ma per queste tre non lo elimina
ancora.

## Prova: ESEGUITO in Blender 5.2.0 LTS, non calcolato a mano

Blender e' disponibile in
`C:\Program Files\Blender Foundation\Blender 5.2\blender.exe` (non nel PATH
di bash, va invocato col percorso completo).

Sintassi:
```
python -c "import ast; ast.parse(open('riferimenti/blender/parts/corridor.py',encoding='utf-8').read())"
```
→ nessun errore.

Esecuzione standalone (nessun flag):
```
blender -b -P riferimenti/blender/parts/corridor.py
```
→ conclusa, GLB scritto (`riferimenti/blender/uscite/corridor.glb`, 20240
byte, 17 pezzi = 12 gradini + 2 pianerottoli + soffitto + 2 pareti — manca
solo l'export separato del "guscio" generico, i pezzi combaciano col conteggio
stampato). Nessun `SystemExit`: la verifica della cucitura non parte da sola,
come richiesto.

Esecuzione con la verifica forzata:
```
NAUTICA_VERIFICA_CUCITURE=1 blender -b -P riferimenti/blender/parts/corridor.py
```
→ **exit code 1**. Lo script produce comunque il GLB (l'export avviene prima
della verifica, in fondo al file), poi Blender stampa e propaga il
`SystemExit`:
```
  CUCITURA IN CONFLITTO: porta_locale_tecnico
    corridor.py dichiara  0.85 x 2.00 m
    mechanism_bay.py dichiara  0.70 x 1.90 m
  la porta e' 15 cm piu' STRETTA e 10 cm piu' BASSA dell'apertura che il
  corridoio si aspetta. [...]
  DECIDE: IL COMMITTENTE. [...]
  Finche' non e' deciso, l'assemblaggio si ferma qui invece di produrre un
  modello sbagliato.
```
Comportamento verificato per davvero, non dedotto dalla lettura del codice.

## Traslazione applicata

Da `world_root.COLLOCAZIONI['STAIR_CORRIDOR']['traslazione_m']` (stato
DERIVATO nella tabella di `world_root.py`):

```
TX_MONDO = -5.480   TY_MONDO = -2.100   TZ_MONDO = 0.000
```

## Le due aperture — stampa reale del run standalone

```
APERTURA lato locale tecnico (X=0, verso -X esce dal corridoio):
    locale   x=0.000  y 0.000..2.000  z -0.425..0.425
    mondo    x=-5.480  y -2.100..-0.100  z -0.425..0.425
    stato CONFLITTO — larghezza x altezza qui 0.85 x 2.00 m, mechanism_bay.py
    dichiara 0.70 x 1.90 m. Non risolto: decide il committente.

APERTURA lato salone (X=5.480, verso +X esce dal corridoio):
    locale   x=5.480  y 2.100..4.100  z -0.425..0.425
    mondo    x=0.000  y 0.000..2.000  z -0.425..0.425
    stato DERIVATO — x locale = LUNGHEZZA_TOTALE = 4.48 + 1.00 = 5.480 m
    (corridor.py riga 113); la traslazione la riporta esattamente
    sull'origine del mondo (x_mondo = 0.0).
```

In tabella (metri, coordinate ASSOLUTE nel mondo):

| apertura | x | y pavimento | y soffitto | z0 | z1 |
|---|---|---|---|---|---|
| locale tecnico | -5.480 | -2.100 | -0.100 | -0.425 | 0.425 |
| salone | 0.000 | 0.000 | 2.000 | -0.425 | 0.425 |

## Verifica contro il vano del salone (MISURATO)

`vano_salone` in `world_root.CUCITURE` (fonte: `guscio-salone.py:40`,
`riferimenti/salone/posa.json`, stato **MISURATO**):

```
X da -2.1746 a 0.0
Y da  0.0    a 1.1449
```

Apertura lato salone del corridoio, in coordinate assolute:
`x_mondo = 0.000`, `y 0.000..2.000`, `z -0.425..0.425`.

**Confronto e scarto:**

- **X** — l'apertura del corridoio e' un PIANO a x = 0.000 (la sezione dove
  il corridoio finisce), non una larghezza. Cade esattamente sul bordo
  X = 0.0 del vano misurato: **scarto 0 mm** su quel bordo. Ma il confronto
  e' fra grandezze di natura diversa: il range X del vano (2174.6 mm) e' la
  LARGHEZZA del foro nella parete del salone (misurata lungo l'asse
  longitudinale della nave, +X = verso prua, per convenzione di
  `world_root.ASSI`), mentre la LARGHEZZA del corridoio (850 mm) giace
  sull'asse Z (trasversale), non su X. Il vano misurato e' un foro nella
  parete di murata (piano a Z = 0, normale +Z, per `guscio-salone.py`:
  "murata col vano z = 0,0"); l'apertura del corridoio e' un foro con normale
  +X. **Le due aperture hanno normali su assi diversi (X contro Z): non e'
  solo uno scarto in millimetri, e' un disaccordo di orientamento fra il
  corridoio (assume di sboccare in una paratia trasversale) e il vano
  fotografato (un foro nella murata laterale).** Questo non e' un numero da
  correggere qui: e' la stessa famiglia di problema del CONFLITTO gia'
  registrato su `porta_locale_tecnico`, ma world_root.py non lo mette in
  tabella come cucitura formale — lo segnalo qui perche' l'assemblatore lo
  veda.

- **Y (altezza)** — pavimento: `y_pavimento_mondo = 0.000` contro
  `Y0 = 0.0`: **scarto 0 mm** (combaciano per costruzione, e' proprio
  l'origine). Soffitto: `y_soffitto_mondo = 2.000` contro `Y1 = 1.1449`:
  **scarto = 2.000 − 1.1449 = 0.8551 m = 855,1 mm**. L'apertura dichiarata dal
  corridoio arriva 855,1 mm PIU' IN ALTO del bordo superiore del vano
  misurato nella foto del salone.

**Non ho aggiustato ALTEZZA_LIBERA ne' altro per far combaciare i numeri.**
Lo scarto e' un risultato: o il vano fotografato in `posa.json` non e' la
stessa apertura che il corridoio si aspetta di incontrare (letture diverse
del "passaggio verso il corridoio"), o le quote INVENTATE del corridoio
(0.85 x 2.00, vedi sopra) vanno riviste quando arriva una misura vera anche
per questo lato. Decisione fuori dal mio mandato.

## Misurato vs assunto

**MISURATO** (letto da fonti verificabili, non toccato da me):
- `vano_salone`: X [-2.1746, 0.0], Y [0.0, 1.1449] — `guscio-salone.py:40`,
  `riferimenti/salone/posa.json`.
- L'origine del mondo (X=0, Y=0, Z=0) coincide con quel vano per definizione
  di `world_root.ORIGINE`.

**DERIVATO** (somma/differenza di valori scritti altrove, formula esplicita):
- `TX_MONDO, TY_MONDO, TZ_MONDO = (-5.480, -2.100, 0.000)` —
  `world_root.COLLOCAZIONI['STAIR_CORRIDOR']`.
- `LUNGHEZZA_TOTALE = 5.480 = 4.48 (corsa scala + pianerottolo inferiore) +
  1.00 (pianerottolo superiore)` — gia' in `corridor.py:110-113`, ripreso
  come DERIVATO in `world_root.CUCITURE['aperture_alte']`.
- Tutte le `x_mondo`/`y_..._mondo`/`z_..._mondo` delle due aperture: derivate
  applicando TX/TY/TZ alle quote locali, mai ricopiate a mano.

**ASSUNTO / INVENTATO** (nessuna misura dietro, dichiarato tale nel file
stesso fin da prima di questo intervento):
- `LARGHEZZA_CORRIDOIO = 0.85 m`, `ALTEZZA_LIBERA = 2.00 m` (oggetto del
  CONFLITTO con `mechanism_bay.py`).
- `ALZATA = 0.175 m`, `PEDATA = 0.29 m`, `N_GRADINI = 12`.
- `PIANO_INFERIORE = PIANO_SUPERIORE = 1.00 m`.
- `SPESSORE_PARETE = 0.12 m`, `SPESSORE_SOLAIO = 0.08 m` (riusati da
  `guscio-salone.py` per coerenza, non misurati per il corridoio).

**CONFLITTO** (due moduli, due numeri, nessuno autorevole):
- `porta_locale_tecnico`: 0.85 x 2.00 m (`corridor.py`) contro 0.70 x 1.90 m
  (`mechanism_bay.py`). Registrato e non toccato.

**Segnalazione aggiuntiva, non in tabella `world_root.CUCITURE`:**
- l'apertura lato salone e il `vano_salone` misurato hanno normali su assi
  diversi (X contro Z) e un'altezza che non combacia di 855,1 mm — vedi
  sezione sopra.

Fine: 2026-08-31T17:50:44+02:00
