# B5 — PASSO 1: camera_path.py riancorato al frame del mondo

inizio: 2026-08-31T19:41:27+02:00
fine:   2026-08-31T19:51:47+02:00

Comando eseguito per davvero (due volte, la seconda dopo un fix trovato
eseguendo la prima):

    "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P riferimenti/blender/camera_path.py

## Correzione in corsa: P2 era sul finestrone, non sulla porta

Il giro iniziale di questo passo aveva riderivato P0/P1/P3 tenendo P2 dov'era
nel file originale: il centro di `vano_salone`. Il committente ha fermato il
lavoro a meta': `vano_salone` e' il FINESTRONE (2,17 x 1,15 m, mezzeria a
57 cm da terra — un'apertura da finestra), non l'apertura che la camera
attraversa. L'apertura vera e misurata e' `ingresso_salone` (4,57 x 2,35 m,
`world_root.CUCITURE['ingresso_salone']`). Il codice e questo referto sono
stati rifatti con P2 sull'ingresso. Vale la pena dirlo perche' e' la riprova
del principio del contratto: un numero MISURATO puo' comunque essere il
numero SBAGLIATO se non e' il numero della cosa giusta.

## Bug trovato eseguendo (non a mano): P4 restava nel frame sbagliato

Prima esecuzione: P4 stampava `(-2.9322, 0.6072, 0.8436)` invece di
`(0,0,0)`. Causa: `POS_SALONE` e' letto RAW dal GLB (`leggi_camera_sorgente_
salone()`, frame del guscio, non tradotto), e il codice lo usava cosi'
com'era per P4 invece di passarlo per `world_root.dal_frame_guscio()`. Il
controllo "scarto d'arrivo" a valle confrontava l'endpoint della curva (gia'
nel frame nuovo, quindi vicino a zero) con `POS_SALONE` raw: sarebbe uscito
uno scarto di ~3,16 m, non zero — e quello sarebbe stato il segnale giusto
che qualcosa non tornava. Corretto con `P4 = world_root.dal_frame_guscio
(POS_SALONE)`; la seconda esecuzione conferma `(0,0,0)` per costruzione. Se
questo bug non fosse stato eseguito, sarebbe rimasto invisibile: sulla carta
"P4 = CAMERA_SORGENTE_SALONE" sembra ovviamente giusto in entrambi i casi.

## Punti di controllo (frame del mondo di world_root.py)

| punto | stato | mondo (x, y, z) m | fonte |
|---|---|---|---|
| P0 meccanismo | DERIVATO | (-10.5913, -3.2700, 0.0000) | punto medio dell'intervallo mondo di MECHANISM_BAY: [X_MB0=-14.902575, porta=-6.280] (`world_root.COLLOCAZIONI['MECHANISM_BAY']`). Y/Z riusano la cucitura della porta (-3.270, 0.0), unico riferimento di sezione misurato per quel pezzo. |
| P1 corridoio | DERIVATO | (-3.5400, -2.2200, 0.0000) | punto medio X del corridoio (locale 0..5.480, cucitura `aperture_alte`), pavimento interpolato linearmente sulla salita (locale 0..2.10, cucitura `aperture_alte`/`alzata_m`), tradotto con `COLLOCAZIONI['STAIR_CORRIDOR']['traslazione_m']` = (-6.280,-3.270,0.0). L'interpolazione lineare e' un'approssimazione dichiarata (la scala vera ha pianerottoli piani alle due estremita', letto in `parts/corridor.py`: `X_INIZIO_SCALA`/`PIANO_SUPERIORE`), non e' una misura di quel punto esatto — ma e' vincolata dai due estremi reali, non indovinata. |
| P2 ingresso_salone | MISURATO | (-0.8000, 0.0050, -1.4440) | centro di `world_root.CUCITURE['ingresso_salone']`: x_m=-0.800, altezza_libera_m=[-1.170,1.180], larghezza_libera_m=[-3.731,0.843]. Fonte dichiarata in world_root: misurato in Blender 5.2 sul GLB del guscio. |
| P3 dentro il salone | **ASSUNTO** | (-0.4000, 0.0025, -0.7220) | punto medio fra P2 e P4. **Resta l'unico ASSUNTO**: world_root non contiene nessun rilievo dell'interno del salone fra la porta d'ingresso e la posa della camera — manca una misura (mobilio, corridoio interno, quota reale di transizione) per sostituirlo con un DERIVATO o un MISURATO. |
| P4 CAMERA_SORGENTE_SALONE | ESATTO | (0.0000, 0.0000, 0.0000) | origine del mondo per costruzione (collocazione SALOON_SHELL di world_root: il guscio si sposta dell'opposto della posizione del nodo camera). |

**ASSUNTI residui: 1 su 5 (P3), spiegato sopra.** Obiettivo "zero ASSUNTO" non
raggiunto del tutto: manca la misura dell'interno del salone fra porta e
camera, che non e' compito di questo script produrre.

## Scarto d'arrivo su CAMERA_SORGENTE_SALONE

Il controllo originale (`camera_path.py`, sezione "Verifica arrivo esatto")
resta nel file ma **e' vuoto per costruzione**: P4 e' l'origine del mondo per
definizione della collocazione SALOON_SHELL, e `ORIENTATIONS[-1]` e' fissato
al quaternione del nodo nel codice stesso — il controllo confronta l'arrivo
con se stesso. Eseguito, stampa `scarto 0.000000 m` e `scarto quaternione
1-|dot| = 0.000e+00`: **zero esatto, non "sotto 1 mm"**, perche' e' una
tautologia matematica (0.0 in floating point su una sottrazione fra numeri
identici), non una misura di qualcosa di indipendente.

Il controllo spostato a monte (nuova sezione "Verifica a monte") verifica
invece qualcosa che PUO' fallire: che P0 cada dentro l'intervallo mondo
costruito per MECHANISM_BAY, `X in [-14.9026, -6.2800]` m. Eseguito:
`P0.x = -10.5913 m` → **DENTRO**, con margine di 4,3113 m da entrambi gli
estremi (parete di fondo e porta verso il corridoio) — P0 e' comodamente a
meta' del locale, non appoggiato a un muro.

## Geometria: nessun punto risulta dentro una parete (nei limiti di cosa e' misurato)

- P0 e P1 sono per costruzione dentro gli intervalli X misurati dei rispettivi
  pezzi (margini riportati sopra per P0; per P1, x=-3.540 e' strettamente fra
  -6.280 e -0.800).
- P2 e' il centro dell'apertura misurata `ingresso_salone`: per costruzione
  non e' dentro nessuna parete, e' nel vuoto della porta.
- P4 e' l'origine per costruzione.
- **Non verificato**: lo spessore/l'ingombro reale delle pareti di
  MECHANISM_BAY e STAIR_CORRIDOR in Y/Z (world_root non porta misure
  dell'interno di questi due pezzi oltre le cuciture alle estremita'), quindi
  non posso escludere che P0/P1, pur dentro l'intervallo X giusto, cadano
  vicino a un ostacolo interno (macchinari, ringhiera della scala) che questo
  script non conosce. Compito dell'assemblatore, non di questo passo.

## Nessuna legge oraria cotta nella curva

Confermato leggendo il codice (non solo eseguendo): la riparametrizzazione
resta per lunghezza d'arco (`pos_at_arclength`/`quat_at_arclength` prendono
`s01` in 0..1 sulla lunghezza reale, mai un tempo), e le misure di
curvatura/jerk/velocita' angolare sono dichiarate esplicitamente "a velocita'
unitaria" (nessuna legge di velocita' e' applicata prima di misurarle). Non
ho toccato questa parte del file. Nessuna traccia di secondi, FPS o costanti
di durata nel codice.

## Trappola del quaternione (dal committente): verificata, non applicabile qui

`world_root.ORIGINE_QUATERNIONE_GLTF` (e il suo equivalente `QUAT_SALONE`
letto dal GLB) sono in ordine glTF (x,y,z,w). `camera_path.py` NON passa mai
questo quaternione a `mathutils.Quaternion()` di Blender: tutta la matematica
dei quaternioni nel file (slerp, squad, log/exp) e' scritta a mano in
numpy, in ordine (x,y,z,w), coerente con se stessa dall'inizio alla fine.
La trappola (norma 1.0 identica in entrambi gli ordini, nessun errore, ma
rotazione sbagliata) non si applica finche' nessuno importa questo
quaternione in `mathutils.Quaternion(w,x,y,z)` senza riordinarlo — se un
prossimo passo lo fa (es. per creare un vero oggetto Camera in Blender),
deve riordinare esplicitamente.

## Confronto sul trasporto della curva al sito (nessuna scelta presa)

Lo script oggi calcola e stampa (non esporta, non scrive file). Due strade
possibili, con i fatti che le distinguono:

**A. JSON in `public/`, il sito interpola**
- Punti di controllo: 5 (P0..P4), ciascuno posizione (3 float) + quaternione
  ai nodi (4 float) = 7 numeri per nodo, piu' eventuali punti fantasma
  gia' calcolati (`_phantom_start`/`_phantom_end`, 2 in piu' se serviti).
  Un JSON con 5 nodi, arrotondato a 6 decimali, pesa nell'ordine di 1-2 KB
  non compresso — trascurabile anche su rete lenta.
- Leggibile e diffabile: un `git diff` su un cambio di P0 mostra 3 numeri
  cambiati, non un binario ricompilato.
- Richiede pero' che IL SITO reimplementi (o porti via WASM/JS) la stessa
  matematica di ricostruzione — Catmull-Rom centripeta Barry-Goldman +
  SQUAD sui quaternioni + riparametrizzazione per lunghezza d'arco. Non e'
  banale: e' la parte piu' delicata di questo script (circa 300 righe fra
  sezioni 1-4). Se il sito ha gia' un interpolatore equivalente (es. una
  libreria con Catmull-Rom centripeta e SQUAD), il costo e' basso; se deve
  scriverlo da zero, e' un pezzo di lavoro non banale duplicato in due
  linguaggi, con rischio di dis-allineamento fra le due implementazioni.
  Non ho verificato se il sito (cartella non esplorata in questo passo,
  fuori dai file che potevo toccare) ha gia' un interpolatore per curve:
  è un fatto mancante, da controllare prima di decidere.

**B. Camera dentro il GLB (`guscio-esporta.py`, gia' con `export_cameras=True`)**
- Strada gia' battuta nel repo (lo script di export esiste e ha il flag
  attivo), quindi zero lavoro di infrastruttura nuovo.
- La curva pero' diventa opaca dentro un binario: nessun diff leggibile,
  nessuna ispezione senza riaprire Blender o un tool GLB.
- Ogni ritocco a un punto di controllo, alla parametrizzazione o alla legge
  di velocita' (che il sito applica sopra, per contratto) richiede un
  riesport dell'intero GLB, non la modifica di un file di testo.
- Il sito otterrebbe l'animazione gia' pronta (Blender/glTF esportano
  keyframe di posizione+rotazione campionati), ma perderebbe il controllo
  sulla LEGGE ORARIA che il contratto assegna esplicitamente al sito
  ("la durata la decide il sito, non il modello") — a meno di ri-derivare
  `s01` dai keyframe esportati, il che vanifica parte del vantaggio di
  "zero lavoro nuovo".

Nessuna delle due e' stata scelta qui: e' una decisione del committente, con
questi fatti a disposizione.

## Cosa e' stato eseguito vs. calcolato

- ESEGUITO in Blender 5.2 (`-b -P`, due volte, headless): lettura del nodo
  `CAMERA_SORGENTE_SALONE` dal GLB reale, costruzione della spline
  Catmull-Rom centripeta + SQUAD, riparametrizzazione per lunghezza d'arco,
  tutte le misure (lunghezza totale 12,7130 m, curvatura max, jerk max,
  velocita' angolare max, scarto d'arrivo, verifica P0 dentro
  MECHANISM_BAY). Tutti i numeri in questo referto vengono da quell'output,
  non da calcolo a mano.
- CALCOLATO A MANO (aritmetica di verifica, non usata per i numeri
  consegnati): la sanity-check dei margini di P0 (4,3113 m simmetrici,
  atteso perche' P0 e' il punto medio esatto dell'intervallo) e la lettura
  incrociata `parts/corridor.py` (sola lettura, nessuna scrittura) per capire
  che `alzata_m=2.10` e' la quota di salita della scala e non un'altezza di
  porta — questa lettura ha cambiato l'interpretazione di P1 rispetto a un
  primo tentativo, ma il numero finale di P1 e' quello uscito
  dall'esecuzione.

fine: 2026-08-31T19:51:47+02:00
