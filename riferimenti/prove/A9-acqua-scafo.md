# A9 — Audit del contatto acqua-scafo

Agente A9, sola lettura. Nessun file modificato oltre questo referto. Screenshot in `uscite/A9/`.

## 1. Come e' fatto il contatto acqua-scafo, con file e riga

Tutto il materiale dell'acqua sta in `src/scena/acqua.js` (1136 righe), innestato via
`onBeforeCompile` su `MeshStandardMaterial`. Punti rilevanti:

- **Varco nel pelo sopra la nave** (permette di vedere il meccanismo a taglio aperto):
  `src/scena/acqua.js:197-244`. Test di raggio contro sfere (`uVarchi`), bordo sfumato
  (riga 235-237), aperto SOLO quando `uSpaccato>0` e il raggio incontra la sfera del
  pezzo (`impianti`), non della nave intera.
- **Giunzione camera/pelo ("il varco a zero pixel")**: `acqua.js:252-297`. Si apre in
  base al seno d'incidenza camera→pelo (`acqSeno`, riga 269) e all'alzo della camera
  (`acqAlzo`, riga 285); a quota zero (camera a pelo d'acqua, l'invariante del sito) il
  pass e' completamente spento (riga 297-304, salto di calcolo dichiarato).
- **Schiuma delle creste** (whitecap generico, non legata allo scafo): `acqua.js:307-322`.
  Dipende da `uMare` (righe 320-321: `smoothstep(1.2, 4.0, uMare)`), dalla distanza
  (vicinanza, riga 315-317) e da una grana procedurale (riga 318-319). Sotto `uMare=1.2`
  non produce nulla.
- **Scia allo scafo** (il "baffo" a V): `acqua.js:324-383`.
  - Sistema locale della nave: `acqua.js:344-346` (`q3 = (uNaveInv * vMondo)/uNaveSemi`,
    `lung`=posizione lungo la nave, `fuori`=distanza in pianta dal profilo).
  - Apertura a V, stretta a prua e larga a poppa: `acqua.js:352-359`.
  - Coda dietro la poppa: `acqua.js:361-368`.
  - Il tutto MOLTIPLICATO per `uNaveVel` (righe 379-380): **zero a nave ferma**, e per
    `acqTaglio` (il varco camera/pelo di cui sopra) — quindi la scia e' comunque
    condizionata dall'angolo di incidenza camera-acqua, non solo dalla velocita'.
  - `uNaveVel` viene fissato a `Math.min(1, nodi/9)` in `acqua.js:1066` (dentro `anima()`),
    cioe' satura gia' a 9 nodi.
- **Opacita' della superficie / "compenetrazione" scafo-acqua**: `acqua.js:558-577`
  (commento) e riga 577: `diffuseColor.a *= mix(1.0, 0.30, (1.0 - acqFres) * acqTaglio)`.
  L'opacita' NON e' costante: segue Fresnel (guardata di scorcio riflette e nasconde,
  guardata ripida si vede attraverso fino al 70%).
- **La schiuma non e' trasmissiva**: `acqua.js:604`:
  `diffuseColor.a = mix(diffuseColor.a, 1.0, clamp(acqSchiuma * 4.0, 0.0, 1.0))` — dove
  c'e' schiuma l'acqua torna opaca (motivato: la schiuma diffonde, non e' un'interfaccia).
- **Ombra della nave sull'acqua** (occlusione approssimata dalla sola distanza in pianta,
  dichiarata come tale): `acqua.js:487-499`.
- **Riflesso della nave nell'acqua**, con distinzione murata chiara/opera viva scura per
  quota: `acqua.js:502-541` (quota separatrice a `y=0` nel sistema nave, sfumata fra
  -0.10 e 0.22, riga 539-540).
- **Assorbimento sotto la linea di galleggiamento** (Beer-Lambert sul volume sommerso, non
  sul pelo): dichiarato a partire da `acqua.js:623` in giu' (sezione "SOTTO LA LINEA NON
  C'ERA ACQUA: C'ERA UNA TINTA").
- **Animazione dell'onda e zona calma attorno alla camera**: `acqua.js:1040-1058`. Il
  campo d'onda si smorza (`dolce`, riga 1054) e si affonda (`AFFONDO`) entro il raggio
  `CALMA` dalla CAMERA — non dalla nave.
- **Crescita/saturazione della scia con l'andatura**: commento e codice ad
  `acqua.js:1064-1067`.

Sul lato scafo, in `src/scena/nave.js`:
- Costruzione del guscio e chiusure di prua/poppa: `nave.js:158-172`.
- **Spigolo chiaro** (linea di contorno dello scafo, `EdgesGeometry` + `LineBasicMaterial`
  a opacita' `OPACITA_SPIGOLO`): `nave.js:186-191`.
- Nessun riferimento a "galleggiamento"/"waterline" in `nave.js` oltre a un commento
  (`nave.js:137`) sulla fascia dipinta nel materiale (vedi sotto).

La **fascia di galleggiamento (boot-top)** e' dipinta nel materiale, non e' geometria e non
e' legata all'acqua vera: `src/scena/materiali.js:281-390`.
- Costante: `materiali.js:329`: `const GALLEGGIAMENTO = { alto: 0.058, spessore: 0.052 }`
  — quota FISSA in coordinate locali dello scafo.
- Uso nello shader del materiale scafo: `materiali.js:375-377`
  (`float boot = fascia(vLocale.y, 0.058, 0.026, 0.006)`).
- Questa fascia e' calcolata in spazio LOCALE della nave (`vLocale`), quindi si muove
  rigidamente col rollio della nave (`nave.rotation.z`) ma NON risponde in alcun modo
  all'altezza istantanea dell'onda sotto lo scafo: e' un dato pittorico fisso rispetto
  allo scafo, non una misura della vera linea di galleggiamento dinamica.

**Cinematica della nave** (per capire se il pelo e lo scafo possono disallinearsi), in
`src/scena/index.js`:
- `nave.position.y = MathUtils.lerp(-4.2, 0, emersione)` — `index.js:823`: un'unica
  transizione di emersione (intro), non un affondamento/sollevamento continuo (heave) col
  moto ondoso.
- `nave.rotation.z = MathUtils.degToRad(sim.S.rollio) * (1 - 0.6*spaccato)` —
  `index.js:1081`: SOLO rollio (asse z). Il beccheggio (pitch) e' un **invariante
  dichiarato a zero** (`index.js:91`, `820`, `1245`, `1378`, `1421-1423`): scelta di
  regia esplicita per non rompere la giunzione camera/orizzonte CSS, non un difetto.
- `acqua.seguiNave(nave, {...})` — `index.js:734-741`: forza il riflesso/scia a `forza:1.0`
  di default, chiamato una sola volta al setup scena (non per-battuta).
- `acqua.anima(t, sim.S.mare, frame, camera.position.x, camera.position.z, sim.S.velocita)`
  — `index.js:1172`: chiamato ad ogni fotogramma con lo stato reale della simulazione.

**Conseguenza architetturale, NON misurata qui** (vedi §4 "non verificato"): lo scafo non
ha moto verticale (heave) legato alle onde — solo rollio e una transizione di emersione
una tantum — mentre il pelo dell'acqua sotto lo scafo ondeggia (vedi `acqua.js:1040-1050`,
ampiezza `mare*0.052`). La fascia di galleggiamento dipinta a quota fissa (`materiali.js:329`)
puo' quindi trovarsi sopra o sotto il pelo reale istante per istante, e nessun codice
letto lega esplicitamente le due cose. Nessun cancello controlla questo (vedi §2).

## 2. Cancelli esistenti — numeri VERI (exit code letto dal processo, non da un grep)

Lanciati da `C:\Users\Giuseppe\Webingegno\nautica` l'31/08/2026.

| Cancello | Exit code reale | Esito stampato |
|---|---|---|
| `strumenti/collaudo-mare.mjs` (nessun server, solo geometria) | **0** | "TUTTO A POSTO" — superficie sotto l'obiettivo di 0.020 unita' (minimo 0.01); escursione attorno allo scafo: mare0=0.000, mare3=0.355, mare5=0.592 (minimo 0.25 a mare5, cresce col mare) |
| `strumenti/collaudo-scia.mjs` (server proprio, porta 5195) | **0** | "collaudo scia: passato" — lungo la murata: 17.9% pixel cambiati, luminanza 124.5→128.9; schiarimento p90=20.0, p99=61.2, max=87.9 (livelli/255); al largo, per contesto: p90=0.7 |
| `strumenti/collaudo-varco.mjs` (server proprio, porta 5216) | **0** | "collaudo varco: passato" — soggetto 57839px/921600 (6.28%, 2 varchi); APERTO media 106.6 gamma 96 (minimo 60); CHIUSO media 57.2 gamma 11 (tetto 35) |
| `strumenti/collaudo-orizzonte.mjs` (server proprio, porta 5223) | **0** | "mare disegnato e giunzione al posto giusto" — sopra mezzeria rgb(233,229,221) luce228; sotto mezzeria rgb(30,78,77) luce62; mare (mediana) 62.4, struttura 20.2 (minimo 13) |

Tutti e quattro **passano** (exit 0), letti dal codice di uscita reale del processo Node
(`echo $?` subito dopo l'esecuzione), non da testo filtrato in coda a una pipe.

**Cosa NON coprono, dedotto leggendo il codice dei quattro file:**
- `collaudo-mare`: verifica solo che l'acqua non sommerga la camera e che l'escursione
  d'onda cresca col mare. Non guarda la scia, non guarda lo scafo, non guarda la fascia
  di galleggiamento.
- `collaudo-scia`: misura un RAPPORTO di schiarimento lungo la murata contro il largo,
  con soglie deliberatamente basse (`RAPPORTO_MINIMO=3%`, un p90 minimo — vedi
  `strumenti/collaudo-scia.mjs:30` e dintorni). Non verifica l'aspetto — una scia che
  schiarisce il 3% e una che ne schiarisce il 90% passano allo stesso modo sopra soglia;
  qui e' passata a 17.9%/p90=20.0, ben sopra il minimo, ma il gate non dice se e'
  "visibile" o "convincente" a un occhio umano — quello resta un giudizio (vedi §3).
- `collaudo-varco`: misura solo l'apertura/chiusura del pelo sopra il meccanismo (una
  cosa diversa dal contatto acqua-scafo in senso stretto — riguarda la sezione, non la
  linea di galleggiamento).
- `collaudo-orizzonte`: misura la giunzione camera-orizzonte-CSS, non il contatto
  scafo-acqua.
- **Nessuno dei quattro misura la fascia di galleggiamento** (`materiali.js:329`) ne' la
  sua coerenza con l'altezza reale dell'onda sotto lo scafo.

## 3. Fotogrammi catturati — descrizione (GIUDIZIO, non misura)

Navigazione fatta con `window.__nautica.cimaSezione` + `corsaRacconto` (mai frazione di
pagina), pattern di `strumenti/confronto-guscio.mjs`, server avviato con lo stesso schema
di `strumenti/collaudo-manopola.mjs` (`npm run preview`, porta dedicata). Viewport
1440x900 desktop, `?ispeziona=1`. Salvati in `uscite/A9/`.

- `contatto-0050.png` (p=0.05, arrivato=true): sequenza fotografica/video d'apertura
  (mare in tempesta, foto) sovrapposta all'interno del salone — NON e' la superficie
  WebGL di `acqua.js`, e' l'antefatto narrativo. Non pertinente al contatto scafo-acqua
  3D.
- `contatto-0150.png` (p=0.15, arrivato=false — lo scroll non si e' assestato entro gli
  8s/0.003 di tolleranza, il fotogramma e' comunque vicino a p=0.15): prua/murata dritta
  della nave, WebGL. **GIUDIZIO**: la linea di contatto scafo-acqua e' un bordo netto e
  diritto; guardando lo zoom `_zoom-0150-prua.png` e `_zoom3-0150-galleggiamento.png` non
  si vede schiuma, spruzzo ne' onda d'urto a prua, e la texture dell'acqua immediatamente
  a contatto con lo scafo e' indistinguibile da quella del mare aperto pochi metri piu'
  in la'. Nessuna fascia di galleggiamento scura riconoscibile a questa distanza/angolo.
- `contatto-0250.png` e `contatto-0350.png` (p=0.25 e 0.35, arrivato=true): stessa
  inquadratura di poppa/fianco con lo scafo aperto in sezione (vista "cutaway" con
  ringhiere e ponte interni visibili) — sono la stessa scena statica (il rollio letto
  nell'HUD scende da 2.6° a 2.0°, la nave si e' solo calmata). **GIUDIZIO**: identico al
  caso precedente — nessuna schiuma, nessuna scia visibile a occhio nella zona di
  contatto scafo/acqua, nonostante l'HUD dichiari "SPEED 12,0 kn" in tutti i fotogrammi.
  Una riga bianca orizzontale netta attraversa il mare a meta' altezza in questi due
  scatti (visibile in `contatto-0250.png`/`contatto-0350.png` intorno a y≈470px); **non
  identificata** — puo' essere una struttura reale della scena (parapetto/pontile in
  lontananza) o un artefatto della giunzione. Non misurata, solo segnalata.

Nota onesta: la sensazione "niente schiuma" e' un giudizio a occhio su un fotogramma
statico, non una misura di pixel — il cancello `collaudo-scia.mjs` (§2) **misura** che un
effetto di schiarimento esiste (p90=20 livelli/255 lungo la murata) pur essendo quasi
impercettibile in uno screenshot fermo; la mediana e' 0, quindi l'effetto e' clemente e
localizzato (poche celle di grana accese), coerente con quello che si vede (o non si
vede) nei fotogrammi.

## 4. Cosa NON ho potuto verificare in 20 minuti

- Non ho misurato numericamente lo scarto fra la quota della fascia di galleggiamento
  dipinta (`materiali.js:329`, y=0.058 locale) e l'altezza reale dell'onda sotto lo
  scafo in funzione del tempo/stato del mare: nessun cancello esiste per questo (vedi
  §1 "conseguenza architetturale" e §2). E' un rischio segnalato dalla lettura del
  codice, non un difetto misurato.
- Non ho catturato fotogrammi a stati di mare alti (mare 4-5) ne' con la camera a
  incidenza rasente lo scafo (dove la scia e la schiuma dovrebbero essere piu' forti per
  costruzione, vedi `acqua.js:315-317` e `acqua.js:379-380`): i quattro `p` scelti
  cadono nella sezione "01 — THE SEQUENCE" iniziale, non ho esplorato oltre per il
  limite di tempo.
- `contatto-0150.png` e' stato scattato senza attesa di assestamento completo dello
  scroll (`arrivato=false`): il fotogramma e' indicativo, non garantito a p=0.150 esatto.
- Non ho verificato il comportamento su viewport mobile (il repo ha rami di
  regia separati mobile/desktop per `emerge`/`mare`, vedi `src/regia.js:90-93`).
- Non ho eseguito `strumenti/collaudo-scafo.mjs` (esiste, ma il compito indicava
  esplicitamente solo mare/scia/varco/orizzonte); non l'ho lanciato per restare nel
  perimetro e nel tempo assegnato.
- Non ho ispezionato `strumenti/misura-acqua.mjs` (esiste, nome pertinente, non aperto
  per il tempo limite).
