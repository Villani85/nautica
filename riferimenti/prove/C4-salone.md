# C4 — il salone come riferimento del frame comune

inizio: 2026-08-31T17:45:46+02:00
fine:   vedi fondo file

Metodo: **eseguito per davvero**, non calcolato a mano. Blender 5.2.0 LTS
c'e' su questa macchina (`/c/Program Files/Blender Foundation/Blender 5.2/blender.exe`,
il messaggio "probabilmente non c'e'" nell'incarico era sbagliato ed e' stato
corretto dall'orchestratore a meta' lavoro). Comando usato:

```
blender -b -P riferimenti/blender/parts/saloon.py
```

Uscita pulita, `exit code 0`. Log completo salvato in
`C:\Users\Giuseppe\AppData\Local\Temp\claude\...\scratchpad\C4-run.txt`
(fuori repo, solo per mia consultazione). I quattro scarti sotto sono letti
riga per riga dall'output reale di questa esecuzione, non ricopiati da
`posa.json` o da `world_root.py`.

## Cosa e' cambiato in `parts/saloon.py`

1. Import di `world_root` aggiungendo la cartella padre (`riferimenti/blender`)
   a `sys.path` (lo script sta in `riferimenti/blender/parts/`).
2. La radice locale (`WORLD_ROOT = collezione('WORLD_ROOT')` con un helper
   tutto suo, riga 124 originale) e' sostituita da `world_root.radice()` +
   `world_root.collezione()`: la funzione locale `collezione()` e' stata
   rimossa. Confermato dal log: `collezioni: WORLD_ROOT > SALOON_SHELL (8
   pezzi mesh...)` — una radice sola, creata dal modulo condiviso.
3. Aggiunto un `assert` che verifica
   `world_root.COLLOCAZIONI['SALOON_SHELL']['traslazione_m'] == (0.0, 0.0, 0.0)`:
   se qualcuno cambia quel numero senza aggiornare questo script, l'esecuzione
   si ferma invece di importare il guscio in silenzio nel posto sbagliato.
4. Aggiunta una sezione di **verifica del vano misurata sui pezzi
   effettivamente importati ORA** (non sulle costanti lette da `posa.json`
   in testa allo script) e una sezione di **verifica di scala**. Nessuna
   coordinata del vano e' stata toccata: `VANO_X0/X1/Y0/Y1` restano quelle
   lette da `posa.json`, usate solo per leggere il referto e per scegliere
   quali pezzi ispezionare (non per produrre il risultato del confronto).

Nota su un dettaglio del metodo: i due pannelli che delimitano il vano
(quello sopra l'apertura e quello sotto) si riconoscono per MISURA — la loro
larghezza X coincide con la larghezza del vano — non per nome: i nomi degli
oggetti nel GLB sono generici (`Mesh_0`..`Mesh_7`), come gia' notato nel
codice esistente per l'altezza aria.

## Il vano in coordinate ASSOLUTE nel frame comune

`COLLOCAZIONI['SALOON_SHELL']['traslazione_m']` e' `(0.0, 0.0, 0.0)` e lo
script importa il guscio a trasformazione identita' (nessun offset): quindi,
nel frame comune di `world_root.py` (convenzione Y-up, X lungo la murata, Y
in alto — la stessa di `posa.json`, NON la Z-up interna di Blender dopo la
rotazione dell'importatore glTF), le coordinate assolute del vano misurate
in questa esecuzione sono:

| | MISURATO ora (esecuzione reale) |
|---|---|
| x_da | **-2.174659 m** |
| x_a  | **-0.000115 m** |
| y_da | **0.000062 m** |
| y_a  | **1.145065 m** |

(pannello sopra il vano: `Mesh_6`, bbox Z 1.145..1.787; pannello sotto il
vano: `Mesh_7`, bbox Z -0.563..0.0 — candidati trovati per larghezza X pari
a quella del vano, soglia 0,05 m, nessun altro pezzo del guscio ha
rientrava in quella soglia).

## Confronto con `posa.json` e con `prove/00-inventario.txt`, scarto in mm

`posa.json.guscio_m.vano` dichiara: `x_da_m: -2.1746, x_a_m: 0.0, y_da_m:
0.0, y_a_m: 1.1449`. `prove/00-inventario.txt` (righe 1075-1089, stessa GLB,
stessa importazione con l'importatore glTF di default) riporta per gli
stessi due pezzi bbox identici a quelli misurati ora — coerente, perche' e'
un import deterministico dello stesso file:

| numero | dichiarato (posa.json) | MISURATO (questa esecuzione) | scarto |
|---|---|---|---|
| x_da | -2.1746 m | -2.174659 m | **0.059 mm** |
| x_a  | 0.0 m | -0.000115 m | **0.115 mm** |
| y_da | 0.0 m | 0.000062 m | **0.062 mm** |
| y_a  | 1.1449 m | 1.145065 m | **0.165 mm** |

Tutti e quattro sotto 1 mm. `00-inventario.txt` (righe 1075-1089) mostra gli
stessi identici bbox (arrotondati a 3 decimali nel log storico, es. Mesh_6
min=(-2.174659, ..., 1.145065) max=(-0.000115, ..., 1.787325)) — nessuna
discrepanza fra la corsa storica e questa.

**Causa dello scarto** (dichiarata, non nascosta): e' rumore di
mesh/precisione in virgola mobile del pannello importato (spessore dei
montanti del vano, ~0,1-0,2 mm), presente anche in `00-inventario.txt`
prima di qualunque modifica di questo incarico — non introdotto dal frame
comune. `world_root.py` non applica nessuna traslazione al salone
(`(0,0,0)`), quindi il frame comune non sposta il vano: lo riproduce entro
il rumore che il modello stesso porta gia'.

## Verifica della conversione di scala

`world_root.UNITA_SCENA_PER_METRO = 0.4` (1 unita di scena = 2,5 m).

Numero noto preso a riferimento (dall'incarico, dal referto A2): i pannelli
del guscio misurano 2,350143 m contro 2,35 m dichiarati in `posa.json`
(scarto 0,006%). Misurato di nuovo in questa esecuzione sul pannello a
tutta altezza `Mesh_0`: **dz = 2.350143 m** — scarto 0.143 mm (0.0061%)
dalla dichiarazione — combacia col referto A2.

Il punto delicato, verificato con i numeri: il fattore 0,4 **non va
applicato al pannello del GLB**, che e' gia' metrico (Blender importa il
GLB gia' in metri, nessuna scala interviene). Applicarlo per errore darebbe
`2.350143 * 0.4 = 0.9401 m`, che NON e' 2,35 m — sarebbe un baco, non una
verifica riuscita. La conversione 0,4 riguarda un'ALTRA quantita': la
geometria procedurale del sito autorata in "unita di scena" (es.
`src/scena/nave.js TUGA.alt = 0,94 unita`). Riprova indipendente eseguita
in questa corsa: `0,94 / 0,4 = 2.350000 m`, che combacia ESATTAMENTE con
`posa.json.dichiarato.altezza_aria_m = 2,35 m`.

**Esito**: la conversione dichiarata (0,4 unita/metro) riproduce
correttamente il numero noto, ma solo per la grandezza a cui si applica
davvero (le unita' di scena procedurali), non per il GLB gia' metrico. Il
commento di `world_root.py` riga 54-57 e' accurato su questo punto e non va
corretto.

## Cosa ho MISURATO e cosa ho ASSUNTO

MISURATO (in questa esecuzione, con Blender vero, via `bpy` e
`import_scene.gltf`):
- i bbox mondo degli 8 pezzi mesh di `guscio-salone.glb` dopo l'import
  standard (rotazione Y-up→Z-up applicata dall'importatore);
- le quattro coordinate del vano (x_da, x_a, y_da, y_a) sui due pannelli che
  lo delimitano, trovati per larghezza X e non per nome;
- l'altezza del pannello a tutta altezza (2.350143 m);
- che `world_root.radice()` crea una sola collezione `WORLD_ROOT` con
  `SALOON_SHELL` e `OCCLUDERS` agganciate correttamente sotto di essa
  (confermato dal log delle collezioni);
- che lo script termina con `exit code 0` senza errori (solo due
  `DeprecationWarning` su `Material.use_nodes`, non bloccanti, non
  pertinenti a questo incarico).

ASSUNTO / NON MISURATO in questo incarico (gia' dichiarato come tale nel
codice esistente, non toccato):
- la larghezza vera del vano (`x_da_m` in `posa.json` e' un minimo, il
  montante di sinistra e' fuori quadro nella fotografia sorgente);
- la focale della ripresa, la paratia di fondo, il verso della stanza, la
  murata opposta oltre la moquette (elenco `posa.json.non_determinato`);
- larghezza e posizione della porta nella paratia di decadimento (1,0 m,
  centrata — scelta di modellazione dichiarata in `saloon.py`, non una
  misura).
- **Non ho verificato** `corridor.py` ne' `mechanism_bay.py`: sono fuori dal
  mio perimetro (altri due agenti li stanno modificando in questo momento) e
  non li ho letti.

## Condizione di chiusura

Scarto sotto 1 mm su tutti e quattro i numeri del vano (max 0,165 mm),
misurato con Blender vero, non calcolato a mano. **Il frame comune di
`world_root.py` rispetta il vano del salone**: con
`traslazione_m = (0,0,0)` per `SALOON_SHELL`, il vano resta esattamente
dove lo dichiara `posa.json`, entro il rumore di mesh gia' presente nel
GLB stesso. `world_root.py` **non va corretto** per quanto riguarda questa
cucitura.

La verifica di scala conferma che `UNITA_SCENA_PER_METRO = 0,4` riproduce
il numero noto (2,35 m) quando applicato alla grandezza giusta (unita' di
scena procedurali), e correttamente NON va applicato al GLB gia' metrico.
Nessuna correzione necessaria neanche qui.

fine: 2026-08-31T17:51:14+02:00
