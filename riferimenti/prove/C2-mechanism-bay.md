# C2 — mechanism_bay.py nel frame comune

Inizio: 2026-08-31T17:22:22+02:00
Fine:   2026-08-31T17:49:19+02:00  (sforato il limite di 20' — vedi nota in fondo)

## Esecuzione

Blender 5.2.0 LTS ERA disponibile (`/c/Program Files/Blender Foundation/Blender 5.2/blender.exe`),
contrariamente a quanto ipotizzato nell'incarico. Eseguito per davvero:

    blender -b -P riferimenti/blender/parts/mechanism_bay.py

Uscita: `EXIT=0`, nessun errore. Sintassi verificata anche con
`python -c "import ast; ast.parse(...)"` su entrambi i file (OK) prima di eseguire.
GLB scritto in `riferimenti/blender/uscite/mechanism_bay.glb` (23892 byte, 21 pezzi,
120 facce) — output normale dello script, non un file scritto da me.
I numeri sotto sono quelli STAMPATI dallo script, non ricalcolati a mano.

## Collocazione applicata

`X_MB0`, `PAGLIOLO_Y` e il centro di `Z0/Z1` non sono piu' costanti locali:
sono letti da `world_root.COLLOCAZIONI['MECHANISM_BAY']['aggancio_m']` via
`MB_AGGANCIO = world_root.COLLOCAZIONI['MECHANISM_BAY']['aggancio_m']`:

    MB_AGGANCIO = (-5.480, -2.100, 0.0)   # X, Y, Z — dal contratto, non ricopiato

Import: aggiunta la cartella padre (`riferimenti/blender/`) a `sys.path` perche'
il modulo vive un livello sopra `parts/`, poi `import world_root`.

Collezioni: `costruisci_locale_tecnico()` ora chiama `world_root.radice()` (crea/
ritrova `WORLD_ROOT` e tutte le figlie del contratto) e poi
`world_root.collezione('MECHANISM_BAY', root)` / `world_root.collezione('ENGINE_ROOM', root)`
— non piu' `bpy.data.collections.new(...)` locale. Entrambe le collezioni che
questo script costruisce (MECHANISM_BAY e ENGINE_ROOM, la seconda segnalata
dal coordinatore dopo il lancio) finiscono sotto `WORLD_ROOT`.

`verifica_cucitura`: aggiunta `verifica_cuciture_contratto()`, che chiama
`world_root.verifica_cucitura('porta_locale_tecnico', 'mechanism_bay.py',
larghezza_m=PORTA_LARG, altezza_m=PORTA_ALT)`. NON chiamata da `__main__`: la
cucitura `porta_locale_tecnico` e' in stato CONFLITTO (corridor.py vuole
0,85x2,00 m, questo file dichiara 0,70x1,90 m) e la funzione alza
`SystemExit` di proposito. Chiamarla qui avrebbe fermato lo script da solo;
resta pronta per l'assemblatore, quando il conflitto sara' deciso da chi deve
deciderlo (il committente, per dichiarazione di world_root.py).

Helper `pulisci()`, `materiale()`, `scatola()`: **non rimossi**. `world_root.py`
(contratto congelato, sola lettura) non offre equivalenti — definisce solo
`collezione()`, `radice()`, `verifica_cucitura()`, `riepilogo()`. Restano quindi
tre copie locali (una per pezzo: saloon/corridor/mechanism_bay), e questo e'
un buco del contratto da segnalare, non da tappare io in un file vietato.

## Bounding box del pezzo, frame comune, in metri (dai log dell'esecuzione)

    min   X=-5.5800  Y=-2.1600  Z=-1.7000
    max   X= 3.2426  Y= 0.9500  Z= 1.7000
    dim   dx=8.8226  dy=3.1100  dz=3.4000

## Apertura verso il corridoio (varco), coordinate ASSOLUTE nel frame comune

    x pavimento/soffitto (centro spessore paratia)  X = 3.1926 m  (paratia X 3.1426..3.2426)
    y pavimento (soglia)                             Y = -2.1000 m
    y soffitto apertura                              Y = -0.2000 m   (soglia + PORTA_ALT 1,90)
    z0, z1                                            Z = -0.3500 .. 0.3500 m
    normale                                           +X

## Gli 8,6226 — abbandonati, e da dove viene il numero fantasma

`8.6226` non e' MAI scritto come costante in nessun file: e' il risultato,
calcolato dal codice stesso, di `X_MB0(=0 locale) + AISLE_PRUA + VANO_ATT_DX +
AISLE_MEDIANA + SP_PARATIA + LUNGHEZZA_SALA_MACCHINE = 8.622575` (e +0,10 per
lo spessore paratia = 8.722575), **se si lascia `X_MB0 = 0.0`** — cioe' se si
legge il locale tecnico come se il suo zero locale fosse l'origine del mondo.
Confermato eseguendo lo script con la vecchia costante: e' esattamente quel
numero. Questa e' quasi certamente l'origine dell'8,6226 di `Piano.md`: qualcuno
ha calcolato la geometria locale senza applicare la traslazione al frame
comune, e ha scritto il risultato come se fosse una posizione assoluta.

**Decisione eseguita: abbandonato.** Con la collocazione vera applicata
(`MB_AGGANCIO`), il limite di poppa (paratia + varco) cade a **X = 3.1426..3.2426 m**
nel frame comune — non 8,6226. Il numero 8,6226 non e' ne' confermato ne'
ricalcolato: e' scartato, perche' nasceva da un frame sbagliato (locale trattato
come mondo). Il vero limite di poppa deriva dalla catena di geometria dichiarata
in `mechanism_bay.py` (aisle + vano attuatore + aisle mediana + paratia +
lunghezza sala macchine), ancorata a `MB_AGGANCIO` invece che a zero.

## ATTENZIONE — cucitura X non verificata, da registrare per l'assemblatore

Con la collocazione applicata cosi' com'e' scritta nel contratto (traslazione
rigida dell'intero pezzo, ancorata su `X_MB0` = fondo chiuso), il varco di
questo pezzo verso il corridoio cade a **X = 3.19 m**, mentre
`STAIR_CORRIDOR` (stesso `world_root.py`) mette la propria apertura lato
locale-tecnico a **X = -5.480 m**. Le due aperture NON combaciano (scarto
~8,7 m sull'asse della traversata). Non l'ho corretto: il contratto assegna a
questo pezzo la collocazione del proprio ancoraggio (`X_MB0`, l'estremo
opposto alla porta, per dichiarazione esplicita dell'incarico — «quello zero
significava la mia cucitura»), non la posizione della porta stessa. Riallineare
la porta richiederebbe ridefinire dove nel locale tecnico si applica
`MB_AGGANCIO` (es. ancorare al varco anziche' al fondo chiuso), decisione che
tocca l'assemblatore o chi ridefinisce `world_root.COLLOCAZIONI`, non questo
script isolato. Registrato, non deciso qui.

## Misurato vs assunto

MISURATO (nessuna misura nuova fatta da me in questo incarico):
- niente. Le uniche quote MISURATE nel progetto restano quelle di
  `guscio-salone.py` / `posa.json` (vano_salone), fuori scope C2.
- `IMPIANTO_DX/DY/DZ` e i pivot di `propulsione.glb` (righe 95-101, 118-121)
  vengono da `00-inventario.txt`, una misura di A2 — ereditata, non rifatta.

DERIVATO (nuovo in C2, dalla catena world_root -> corridor.py):
- `X_MB0`, `PAGLIOLO_Y`, centro `Z0/Z1` = `MB_AGGANCIO` = -5,480 / -2,100 / 0,0,
  a sua volta derivato in `world_root.py` da `LUNGHEZZA_CORRIDOIO_M` (4,48+1,00)
  e `RISALITA_CORRIDOIO_M` (2,10), entrambe dichiarate in `corridor.py`.
- Limite di poppa (paratia+varco) X=3.1426..3.2426 — somma della catena di
  geometria interna a partire da `MB_AGGANCIO`.

ASSUNTO (invariato dall'intestazione originale del file, non toccato da C2):
BEAM (3,2), ALTEZZA_LIBERA (3,0), SP_PARATIA/PAGLIOLO/SOFFITTO,
MARGINE_SERVIZIO_VANO, AISLE_PRUA/MEDIANA/MACCHINE, PORTA (0,70x1,90 —
in CONFLITTO dichiarato con corridor.py, non risolto qui) — tutti gia'
segnalati come inventati nell'intestazione del file (righe 41-70), non
modificati in questo incarico.

APERTO (segnalato, non risolto qui): la cucitura X fra MECHANISM_BAY e
STAIR_CORRIDOR non combacia numericamente (vedi sopra); la cucitura
`porta_locale_tecnico` resta in CONFLITTO su larghezza/altezza.

## Nota sui tempi

Il messaggio del coordinatore (Blender disponibile per davvero, seconda
collezione ENGINE_ROOM, non toccare il contratto con nuovi helper) e'
arrivato dopo che il limite di 20' era gia' scaduto sul primo giro (calcolo a
mano). Ho rieseguito con Blender vero come richiesto: il referto sopra e'
gia' aggiornato con i numeri STAMPATI dall'esecuzione reale, non quelli
calcolati a mano nel primo giro.
