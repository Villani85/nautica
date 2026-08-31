# C1 — La cucitura fra corridoio e locale tecnico: due numeri incompatibili

Agente C1, sola lettura di codice + un calcolo. Nessun file modificato oltre questo
referto. Non decido: consegno il confronto, la scelta e' del committente.

## 1. I due numeri, verificati sul codice

- **Corridoio** (`riferimenti/blender/parts/corridor.py`): l'apertura che si aspetta
  sul lato locale tecnico e' `APERTURA_LOCALE_TECNICO` (righe 122-131), larga
  `LARGHEZZA_CORRIDOIO = 0.85` m (riga 92) e alta `ALTEZZA_LIBERA = 2.00` m
  (riga 93). Entrambi dichiarati INVENTATI dallo stesso file (righe 49-51,
  271-272): "nessuna misura lega il piano del locale tecnico a quello del salone".

- **Locale tecnico** (`riferimenti/blender/parts/mechanism_bay.py`): la porta stagna
  che costruisce sulla paratia di poppa (il varco verso il corridoio) e'
  `PORTA_LARG = 0.70` m, `PORTA_ALT = 1.90` m (righe 126-127), usata alle righe
  284, 315 e restituita nel dizionario `varco` (righe 317-323). Anche questi
  dichiarati non misurati (nessuna `posa.json` per il locale tecnico, righe 125+
  del file, sezione "TUTTO CIO' CHE E' INVENTATO").

**Conferma**: i numeri che mi hai indicato sono esatti (0,85x2,00 vs 0,70x1,90).
Non ho trovato in `WORLDSPACE-CONTRATTO.md` ne' in `Piano.md` alcuna nota che
segnali gia' questo disallineamento fra i due script — sembra non ancora emerso.

La porta stagna (0,70x1,90) e' PIU' STRETTA E PIU' BASSA del rettangolo che il
corridoio si aspetta di agganciare (0,85x2,00): mancano 0,15 m in larghezza e
0,10 m in altezza per lato del confronto.

## 2. Opzione A — allinea il corridoio alla porta stagna (0,70 x 1,90)

1. **Percezione**: una porta stagna piu' stretta del corridoio che la precede si
   legge come un vero passaggio di bordo — l'imbarcazione "si stringe" apposta
   per lo stagno, coerente con l'idea di un'imbarcazione vera (paratie stagne
   reali sono sempre piu' strette del passaggio comune). E' l'effetto che hai
   descritto: "si legge come una nave vera".
2. **File da modificare**: `riferimenti/blender/parts/corridor.py`. Cambiano
   `LARGHEZZA_CORRIDOIO` (riga 92) e `ALTEZZA_LIBERA` (riga 93) — 2 righe di
   valore. Si propagano pero' a cascata: `Y_TOP`, `L2` (righe 115-116),
   `APERTURA_LOCALE_TECNICO` (126), `APERTURA_SALONE` (136, che erediterebbe la
   stessa ALTEZZA_LIBERA — da decidere se e' voluto o se le due estremita' del
   corridoio devono restare disallineate fra loro) e i commenti dichiarativi
   (righe 49-51, 271-272) che citano i due valori come testo. In pratica: 2
   costanti, ma un ricalcolo dell'intera geometria del corridoio (pareti,
   soffitto, larghezza dei pianerottoli) alla riesecuzione dello script.
3. **Effetti sulla camera**: vedi §4 — un corridoio piu' stretto (0,70 invece di
   0,85) riduce il margine fra frustum e stipiti, quindi rende PIU' probabile
   il taglio del frustum contro le pareti, non meno.

## 3. Opzione B — allarga la porta stagna al corridoio (0,85 x 2,00)

1. **Percezione**: una porta stagna larga quanto il corridoio non si legge piu'
   come una paratia stagna "vera" (che tipicamente strozza il passaggio) — si
   legge come un semplice varco fra due stanze, meno caratterizzante. E' l'
   effetto opposto a quello che hai descritto per il corridoio stretto: qui si
   perde il segnale "sono su una nave" nel punto esatto in cui potrebbe essere
   piu' forte.
2. **File da modificare**: `riferimenti/blender/parts/mechanism_bay.py`. Cambiano
   `PORTA_LARG` (riga 126) e `PORTA_ALT` (riga 127) — 2 righe di valore. Uso a
   valle: `PORTA_Z0, PORTA_Z1` (riga 128, derivato) e le due chiamate a
   `paratia_con_porta` (righe 284, 315) che ricostruiscono il foro nella
   paratia — nessuna riga di logica da toccare oltre le 2 costanti, ma va
   verificato che 2,00 m di porta stagna non ecceda `ALTEZZA_LIBERA = 3,0` m del
   locale tecnico (riga con `ALTEZZA_LIBERA` in mechanism_bay.py) ne' urti
   `VANO_ATT_ALTO` — a occhio c'e' margine (2,00 < 3,0), ma non l'ho verificato
   con un ricalcolo completo della geometria del vano attuatore.
3. **Effetti sulla camera**: un'apertura piu' larga (0,85 invece di 0,70) da'
   PIU' margine al frustum, quindi va nella direzione giusta per il punto
   tecnico del §4.

## 4. Il punto tecnico: la camera puo' attraversare senza tagliare contro gli stipiti?

**Misurato**:
- FOV verticale della camera del sito: `34` gradi, `src/scena/index.js:178`
  (`new PerspectiveCamera(34, 1, 0.1, 120)` — argomenti: fov, aspect, near, far).
- Near plane: `0.1` m, stesso costrutto, `src/scena/index.js:178`.
- L'aspect ratio NON e' fisso: viene riassegnato ad ogni resize con
  `camera.aspect = w / h`, `src/scena/index.js:989` — dipende dalla finestra/
  dispositivo del visitatore, nessun valore costante nel codice.
- `riferimenti/blender/camera_path.py` dichiara ESPLICITAMENTE (righe 257-258 e
  263-264) che MECHANISM_BAY, ENGINE_ROOM e STAIR_CORRIDOR "non ancora
  integrati in un frame comune" con il percorso camera, e che serve "un nodo
  di aggancio comune (WORLD_ROOT condiviso ... non ancora eseguito)". I punti
  di controllo P0 (meccanismo) e P1 (corridoio) hanno la profondita' Z
  dichiarata ASSUNTA, non misurata (righe 275-276: "P0, P1, P3 sono ASSUNTI da
  A6 in mancanza del tratto intermedio"). L'unico varco con posizione MISURATA
  nel percorso e' P2, ma e' il vano del SALONE (`guscio-salone.py` /
  `posa.json`), non la porta del locale tecnico o l'apertura del corridoio
  oggetto di questo referto.

**Conclusione**: NON POSSO calcolare con certezza la larghezza minima
dell'apertura per non tagliare il frustum. Mi mancano due dati, entrambi
assenti dal codice attuale:

1. **La distanza reale camera-stipiti nel punto di attraversamento
   corridoio/locale-tecnico.** `camera_path.py` non ha ancora un tratto
   integrato in quel varco: P0/P1 sono posizioni plausibili ma dichiarate non
   misurate, e non esiste ancora il WORLD_ROOT che alligni corridor.py e
   mechanism_bay.py al sistema del percorso camera. Senza una distanza reale,
   qualunque larghezza minima calcolata sarebbe una stima spacciata per conto.
2. **Un aspect ratio di riferimento.** Il FOV orizzontale (da cui dipende la
   larghezza del frustum) si ricava da `camera.aspect`, che e' dinamico
   (`w/h` della finestra, riga 989) — non c'e' un solo numero, ce n'e' uno per
   ogni dispositivo/orientamento. Per dare un conto servirebbe un aspect
   scelto come riferimento (es. il piu' stretto atteso, verticale su
   telefono) — quel dato non e' nel codice, e' una scelta di prodotto.

Se in futuro questi due dati vengono fissati (una distanza camera-stipiti
misurata sul percorso integrato, e un aspect ratio minimo di riferimento), il
calcolo e' comunque semplice e lo lascio pronto per chi lo fara':
`mezzoH = atan(tan(radians(fov/2)) * aspect)`,
`larghezza_minima_frustum = 2 * distanza * tan(mezzoH)` (dove `fov=34`,
`distanza` = quella misurata dallo stipite, `aspect` = quello scelto) — poi va
confrontata con `LARGHEZZA_CORRIDOIO`/`PORTA_LARG` per vedere se il frustum
resta dentro l'apertura netta a quella distanza.

## 5. Misurato vs. assunto — riepilogo esplicito

**Misurato leggendo il codice**:
- `LARGHEZZA_CORRIDOIO = 0.85`, `ALTEZZA_LIBERA = 2.00` — `corridor.py:92-93`.
- `PORTA_LARG = 0.70`, `PORTA_ALT = 1.90` — `mechanism_bay.py:126-127`.
- `fov=34`, `near=0.1` della camera del sito — `src/scena/index.js:178`.
- `camera.aspect` e' assegnato dinamicamente da `w/h`, non e' una costante —
  `src/scena/index.js:989`.
- `camera_path.py` dichiara esplicitamente (righe 257-264, 275-276) che il
  tratto corridoio/locale-tecnico non e' integrato nel percorso e che P0/P1
  sono posizioni assunte, non misurate.
- Nessuna nota nei documenti di progetto (`WORLDSPACE-CONTRATTO.md`,
  `Piano.md`) segnala gia' il disallineamento fra i due numeri di apertura.

**Assunto da me in questo referto** (nessuno confluito nei calcoli sopra, sono
solo letture di implicazione, dichiarate come tali):
- Che modificare `ALTEZZA_LIBERA` in `corridor.py` (Opzione A) la propaghi
  anche ad `APERTURA_SALONE` (riga 136), perche' la costante e' condivisa nel
  file — non ho verificato se questo sia voluto per l'estremita' lato salone.
- Che 2,00 m di porta stagna (Opzione B) stiano dentro `ALTEZZA_LIBERA=3,0` e
  `VANO_ATT_ALTO` del locale tecnico — plausibile per differenza semplice fra i
  numeri dichiarati, ma non ricalcolato eseguendo lo script.
- Nessuna assunzione e' entrata nel calcolo del §4: li' ho preferito dichiarare
  il dato mancante piuttosto che stimarlo.

## 6. La domanda esatta per il committente

Volete che la cucitura fra corridoio e locale tecnico si legga come **una vera
paratia stagna che strozza il passaggio** (si adegua il corridoio a 0,70x1,90,
Opzione A — e allora la porta stagna resta la piu' stretta del percorso, con
il rischio maggiore di inquadratura tagliata dalla camera in quel punto), o
come **un varco continuo della stessa sezione** (si allarga la porta stagna a
0,85x2,00, Opzione B — piu' margine per la camera, ma la paratia stagna perde
il segnale visivo di "restringimento vero")? La decisione tecnica sulla
larghezza minima resta sospesa finche' non esistono (a) una distanza
camera-stipiti misurata sul percorso integrato e (b) un aspect ratio di
riferimento scelto per il calcolo del §4.
