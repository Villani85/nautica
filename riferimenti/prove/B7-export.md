# B7 — L'export

`date -Is` inizio: `2026-08-31T23:20:21+02:00`
`date -Is` fine:   `2026-08-31T23:27:09+02:00`  (durata reale ~6m48s)

## Cosa e' stato scritto

- `riferimenti/blender/esporta-traversata.py` (nuovo) — esegue
  `scena-continua.py` via `runpy.run_path` (non lo modifica, non lo
  reimplementa), seleziona gli oggetti delle quattro collezioni del mondo
  (`MECHANISM_BAY`, `ENGINE_ROOM`, `STAIR_CORRIDOR`, `SALOON_SHELL`) ed
  esporta un GLB unico con le stesse opzioni di `guscio-esporta.py:265-280`
  (`export_yup=False` compreso, per lo stesso motivo li' documentato).
- `public/modelli/traversata-world.glb` (nuovo).

Comando usato per assemblare e verificare (invariato, letto prima di scrivere
qualunque cosa):

    "/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P riferimenti/blender/scena-continua.py

Esito: tutti e tre i pezzi **OK** (`saloon.py`, `mechanism_bay.py`,
`corridor.py`), le quattro collezioni del mondo tutte con geometria reale.
Bbox mondo (Blender X,Y,Z) misurati da quella corsa:

    SALOON_SHELL     min=(-0.800, -1.250, -0.964)  max=( 9.052,  1.260, 3.851)
    STAIR_CORRIDOR   min=(-6.280, -3.350, -0.545)  max=(-0.800,  0.910, 0.545)
    MECHANISM_BAY    min=(-15.003,-3.330, -1.700)  max=(-10.555, -0.220, 1.700)
    ENGINE_ROOM      min=(-10.555,-3.330, -1.700)  max=(-6.180, -0.220, 1.700)

    bbox mondo UNIONE (Blender X,Y,Z): min=(-15.003, -3.350, -1.700)
                                       max=(  9.052,  1.260,  3.851)

Comando usato per esportare:

    "/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P riferimenti/blender/esporta-traversata.py

Esito: `esporta-traversata.py` ha rieseguito `scena-continua.py` (stesso esito
OK/OK/OK sopra), poi ha raccolto 56 oggetti dalle quattro collezioni
(MECHANISM_BAY 13, ENGINE_ROOM 8, STAIR_CORRIDOR 18, SALOON_SHELL 17) e li ha
esportati. Tutte le mesh raccolte avevano gia' un materiale assegnato (nessun
avviso di mesh "di plastica").

## Peso del GLB

    public/modelli/traversata-world.glb   1.561.168 byte   =  1,561168 MB decimali (10^6)

## Triangoli e materiali

Contati leggendo direttamente il JSON del GLB (accessori delle primitive, non
dedotti da un tool esterno):

    nodi                    56
    mesh / primitive        45 (una primitiva per mesh, nessuna con >1 primitiva)
    materiali                9
    triangoli totali    61.884
    riferimenti a texture     0  (i materiali sono a colore pieno, nessuna immagine)
    immagini                  0

Questi numeri combaciano con quelli stampati indipendentemente da
`collaudo-gltf.mjs` (9 materiali, 45 primitive) — vedi sotto.

## `node strumenti/collaudo-glb.mjs` — ESEGUITO

Prima esecuzione, passando il nuovo file come argomento posizionale
(`node strumenti/collaudo-glb.mjs public/modelli/traversata-world.glb`):
**FALLITO**, ma per un motivo che non riguarda questo export — l'argomento
posizionale di quello script seleziona il file su cui applicare **il
contratto dell'impianto** (§2.1: nodi `STATIC_FOUNDATION`, `RIG_INPUT`, ecc.),
non un contratto generico. Passandogli `traversata-world.glb` lo script ha
provato a cercarci i nodi del riduttore cicloidale, che ovviamente non ci
sono. E' un uso sbagliato dello strumento, dichiarato qui invece che
nascosto: quello script, letto (righe 51-54), e' scritto per
`public/modelli/impianto.glb` di default e non conosce ancora
`traversata-world.glb` come file da collaudare.

Seconda esecuzione, invocazione di default (`node strumenti/collaudo-glb.mjs`,
senza argomenti — quella corretta):

    EXIT 0
    collaudo glb: passato

`traversata-world.glb` non compare fra i file che questo cancello controlla
esplicitamente (la sua lista fissa e' impianto/sovrastruttura/propulsione/
giroscopio/interni): il cancello passa perche' non e' ancora stato esteso a
conoscere il nuovo file, non perche' l'abbia giudicato. Dichiarato, non
taciuto.

## `node strumenti/collaudo-gltf.mjs` — ESEGUITO

Invocazione di default (scansiona `public/modelli/*.glb` da solo):

    EXIT 0
    collaudo gltf: passato

Sezione specifica di `traversata-world.glb`:

    FILE       traversata-world.glb  1525 KB, 56 nodi
    VALIDATORE traversata-world.glb [come sta sul disco]  0 errori, 0 avvisi, 1 informazioni, 0 suggerimenti
      INFO NODE_EMPTY @ /nodes/55 — Empty node encountered.
    NOMI       traversata-world.glb: 56 nomi distinti su 56 nodi con nome
    MATERIALI  traversata-world.glb: 9 materiali, 45 primitive, 0 riferimenti a texture, 0 immagini

L'unica informazione (non errore, non avviso) e' `NODE_EMPTY` sul nodo 55: e'
la camera di riferimento (`CAMERA_SORGENTE_SALONE`, portata dentro da
`saloon.py` insieme al guscio, esportata perche' `export_cameras=True` come
prescritto) — un nodo camera senza mesh e' "vuoto" per il validatore glTF per
definizione, non un difetto.

## Peso di `public/modelli/` — prima e dopo

    PRIMA   1.329.850 byte   =  1,32985 MB decimali
    DOPO    2.891.018 byte   =  2,891018 MB decimali

    differenza = 1.561.168 byte, ESATTAMENTE il peso del nuovo GLB (nessun
    altro file nella cartella e' stato toccato — verificato: nessun altro
    file risulta modificato da `git status --porcelain`, l'unica riga nuova
    e' `traversata-world.glb`).

Il totale piu' che raddoppia (+117,4%). Il mandato non fissa un tetto
numerico per questo export ne' per il totale di `public/modelli/` — dice solo
di misurare con precisione e, se sfonda, riportare peso/triangoli e proporre
cosa togliere senza decidere da solo un nuovo tetto. Lo dichiaro cosi':

- il file **non e' compresso**: e' un export Blender grezzo, senza meshopt ne'
  Draco, mentre gli altri modelli del progetto (propulsione.glb, giroscopio.glb,
  interni.glb...) usano `EXT_meshopt_compression` (visibile nel loro
  `extensionsUsed`, assente nel nostro). Misurato per contesto: la stessa
  geometria compressa con brotli qualita' 11 pesa 116.109 byte (0,1161 MB) —
  un fattore ~13x, plausibile perche' sono grandi pannelli piani con molti
  vertici ripetuti. Questo NON e' il peso che arriva al sito (il sito non
  applica brotli da solo su questo file finche' nessuno lo dice), e' solo la
  prova che c'e' margine di compressione reale se il tetto lo richiede.
- la via piu' diretta per ridurre, se serve: passare il file per `gltfpack`
  (gia' presente in `node_modules/.bin`, usato altrove nel repo) con
  quantizzazione e `EXT_meshopt_compression`, come fanno gli altri modelli.
  Non l'ho fatto: non e' fra i tre file che posso scrivere, e comunque e' una
  decisione (quale tetto, quale perdita di precisione accettare) che non
  spetta a questo incarico.

## SHA-256

    aba0fcf3bea7f237ed1ac2fc412164395cbf3ae9c0682d00b1925ae5d91f5d3f  public/modelli/traversata-world.glb

## Verifica Y-up: reimport in Blender vs bbox della scena assemblata

Reimportato `traversata-world.glb` in una scena Blender vuota con le opzioni
di import DI DEFAULT (nessuna conversione custom), poi misurato il bbox mondo
reale (Blender X,Y,Z) di tutte le 45 mesh importate:

    bbox REIMPORTATO   min=(-15.0026, -3.8509, -3.3500)
                        max=(  9.0522,  1.7000,  1.2601)

    bbox ASSEMBLATO     min=(-15.0030, -3.3500, -1.7000)
                        max=(  9.0520,  1.2600,  3.8510)

**Non combaciano diretti, asse per asse** — ed e' atteso, non un errore:
l'importatore glTF di Blender applica SEMPRE la conversione standard
Y-up(file) -> Z-up(Blender nativo) in lettura, indipendentemente da come il
file e' stato scritto (`export_yup=False` in scrittura non lascia una nota nel
file che dica "salta la conversione anche in lettura" — quella flag governa
solo l'export). La regola di quella conversione e':

    Blender_X = file_X
    Blender_Y = -file_Z
    Blender_Z =  file_Y

Applicando questa regola al bbox ASSEMBLATO (che e' gia' nella convenzione
Y-up del contratto, essendo raw Blender coords con `export_yup=False`) si
ottiene il bbox ATTESO dopo un reimport standard:

    bbox ATTESO (assemblato permutato con la regola sopra):
      min=(-15.0030, -3.8510, -3.3500)
      max=(  9.0520,  1.7000,  1.2600)

Confronto numerico, ATTESO vs REIMPORTATO:

    X:  atteso [-15.0030,  9.0520]   reimportato [-15.0026,  9.0522]   scarto <= 0,6 mm
    Y:  atteso [ -3.8510,  1.7000]   reimportato [ -3.8509,  1.7000]   scarto <= 0,1 mm
    Z:  atteso [ -3.3500,  1.2600]   reimportato [ -3.3500,  1.2601]   scarto <= 0,1 mm

**Combaciano**, entro il millimetro, con la permutazione d'asse prevista dalla
conversione standard di import — la stessa identica permutazione che
`saloon.py` inverte apposta (la sua rotazione -90 su X, commentata come
"riporta indietro il guscio importato") quando importa `guscio-salone.glb`.
Questo conferma con i numeri che `traversata-world.glb` e' scritto nella
STESSA convenzione Y-up del resto del progetto (raw, nessuna doppia
conversione), non in Z-up: se fosse stato scritto per errore con
`export_yup=True` (o senza quell'opzione), il reimport avrebbe applicato la
conversione standard a dati GIA' convertiti, e il confronto sopra sarebbe
uscito sbagliato su un asse diverso da quello previsto (o il bbox sarebbe
uscito ruotato di 90 gradi in piu', con Y e Z scambiati in modo diverso da
quello misurato qui). Non e' cosi': i numeri tornano sulla permutazione
attesa, non su un'altra.

## Riepilogo per la risposta

    peso            1.561.168 byte  =  1,561168 MB decimali
    triangoli       61.884
    materiali       9
    collaudo-glb.mjs (default)   PASSATO (traversata-world.glb non e' fra i
                                  file che quel cancello controlla nel merito,
                                  solo elencato/misurato indirettamente)
    collaudo-gltf.mjs (default)  PASSATO (0 errori, 0 avvisi su
                                  traversata-world.glb; 1 info NODE_EMPTY =
                                  la camera di riferimento, attesa)
    public/modelli/ prima   1.329.850 byte (1,32985 MB)
    public/modelli/ dopo    2.891.018 byte (2,891018 MB)  — +117,4%, nessun
                                  tetto numerico dato dal mandato per questo
                                  export; file non compresso, margine reale
                                  (~13x con brotli/meshopt) se un tetto verra'
                                  deciso
    sha256          aba0fcf3bea7f237ed1ac2fc412164395cbf3ae9c0682d00b1925ae5d91f5d3f
    bbox Y-up       COMBACIA (entro il millimetro) con la permutazione d'asse
                    attesa dalla conversione standard d'import — confermato
                    con i numeri, non assunto

`date -Is` fine: `2026-08-31T23:27:09+02:00`.
