# B2 — Referto: la sezione di scafo che la traversata attraversa

Incarico B2, primo giro. Solo referto, nessuna geometria prodotta.
Inizio: 2026-08-31T20:05:35+02:00.

---

## 1 · Com'è fatto `src/scafo/ordinate.js`

**Struttura.** Il file esporta funzioni pure, nessuno stato. Il cuore è una
tabella di 9 "ordinate" (righe), ciascuna con 5 grandezze, più una funzione
di interpolazione lineare fra righe adiacenti — MISURATO, `src/scafo/ordinate.js:20-53`:

```
t     semilarg  chiglia  spigoloY  spigoloX  ponteY
0.00   0.04    -0.30    -0.22     0.03      1.360   ← indice 0, dritto di prua
0.06   0.34    -0.62    -0.28     0.26      1.293   ← indice 1
0.16   0.82    -0.86    -0.30     0.66      1.194   ← indice 2
0.30   1.20    -0.94    -0.28     1.06      1.083   ← indice 3
0.44   1.48    -0.94    -0.26     1.38      1.000   ← indice 4
0.58   1.62    -0.90    -0.24     1.56      0.944   ← indice 5
0.72   1.66    -0.82    -0.22     1.63      0.910   ← indice 6
0.86   1.62    -0.72    -0.20     1.60      0.893   ← indice 7
1.00   1.55    -0.60    -0.18     1.54      0.890   ← indice 8, specchio di poppa
```

`t` è il parametro normalizzato lungo la nave: **t=0 prua, t=1 specchio di
poppa** (`ordinate.js:25`). `sezioneA(t)` (righe 56-70) interpola linearmente
fra le due righe adiacenti — è l'UNICA interpolazione del file, e sia la
superficie del guscio (`costruisciGuscio`) sia i tappi di sezione (`tappoA`)
la chiamano, mai una seconda volta reimplementata (dichiarato nell'intestazione,
righe 4-17).

`contornoA(t)` (righe 82-149) trasforma le 5 grandezze scalari in un poligono
chiuso di 33 punti `[x, y]`: parte dalla chiglia (x=0), sale sul lato dritto
per un ginocchio quadratico + una murata a smoothstep fino al ponte, poi
rispecchia sul lato sinistro (x negativo). Lo spigolo di carena è **emesso due
volte** (stessa posizione) per tenere una normale netta — righe 100-128.

**Asse-lunghezza e zero.** L'asse lungo la nave si chiama **z** in questo
file (non x). Costanti — MISURATO, `ordinate.js:20-22`:

```
PRUA_Z  = -8      (prua, t=0)
POPPA_Z = +8      (specchio di poppa, t=1)
LUNG    = 16
```

`zDaT(t) = PRUA_Z + t·LUNG` e `tDaZ(z) = (z-PRUA_Z)/LUNG` (righe 72-73)
convertono nei due sensi. Lo **zero di z è la mezzanave**, non la prua né la
poppa.

**Unità.** Dichiarato in una riga di commento — MISURATO, `ordinate.js:19`:

> «Unita' di scena: 1 = 2,5 m. Scafo z in [-8, +8] = 40 m.»

Quindi: nave lunga 40 m, 1 unità di scena = 2,5 m, e le 5 colonne della
tabella (`semilarg`, `chiglia`, `spigoloY`, `spigoloX`, `ponteY`) sono anch'esse
in unità di scena — non c'è un fattore di scala separato per x/y: lo stesso
`2,5 m/unità` si applica a tutte e tre le dimensioni. Prova indipendente:
`ordinate.js:134` dichiara il baglio massimo (larghezza max) a **8,30 m**
verificato; con la tabella, `max(semilarg)=1,66` all'indice 6 (t=0,72), e
`1,66 × 2 × 2,5 = 8,30 m` — combacia esattamente. Stesso numero è ristampato
da `strumenti/esporta-coperta.mjs:79` (`baglio massimo ...`). Due fonti
indipendenti, stesso valore: la scala è confermata, non solo dichiarata.

**Frame locale.** `x` = distanza laterale dal piano di mezzeria (semilarghezza,
segno = lato), `y` = quota verticale (chiglia in basso, ponte in alto), `z` =
posizione lungo la nave. È un frame **Y-up** (verticale = y), coerente con
`ASSI` di `world_root.py` (§2 sotto).

**Ordinate come parametri di formula, non punti sciolti.** Le 9 righe non
sono ordinate "vere" nel senso navale (non descrivono una carena reale
rilevata): sono **punti di controllo** di un'interpolazione lineare a tratti
su 5 canali. Fra due righe la sezione è definita ovunque da `sezioneA(t)`,
non solo alle 9 stazioni tabulate.

---

## 2 · Corrispondenza col frame del mondo (`world_root.py`)

### 2.1 · Cosa dichiara il contratto — MISURATO/DERIVATO, `world_root.py`

- Unità: **metri**; conversione a scena **0,4 unità/metro = 1 unità = 2,5 m**,
  applicata "una volta sola al nodo radice" — `world_root.py:46-57`. **Stesso
  numero, 2,5 m/unità, dichiarato indipendentemente anche in `ordinate.js:19`
  e in `riferimenti/WORLDSPACE-CONTRATTO.md:27-28`.** Tre fonti concordi:
  la scala fra i due mondi è la stessa scala, non un'ipotesi.
- Assi: **+X verso PRUA, +Y verso ALTO, +Z verso DRITTA** (Y-up, NON la
  convenzione Blender Z-up) — `world_root.py:64-78`.
- Origine: il nodo `CAMERA_SORGENTE_SALONE` dentro
  `public/modelli/guscio-salone.glb` — `world_root.py:80-84`.
- `COLLOCAZIONI['STAIR_CORRIDOR'].traslazione_m = (-6.280, -3.270, 0.0)`,
  stato DERIVATO — `world_root.py:272-281`.
- `COLLOCAZIONI['MECHANISM_BAY'].traslazione_x_derivata_m = -14.902575`,
  stato DERIVATO — `world_root.py:282-297`.
- `CUCITURE['ingresso_salone'].x_m = -0.800`, stato **MISURATO** (misurato
  in Blender sul GLB spedito) — `world_root.py:393-399`.

Quindi la fascia della traversata, **nel frame del mondo**, è
`X_m_mondo ∈ [-14.902575, -0.800]` — entrambi gli estremi hanno stato e fonte
dichiarati nel contratto stesso.

### 2.2 · Il ponte fra i due frame — NON dichiarato in un unico posto, RICOSTRUITO qui

`ordinate.js` e `world_root.py` non si parlano: nessuno dei due importa
l'altro, e non esiste nel repo una costante che dichiari "z=tot in
`ordinate.js` corrisponde a X=tot nel mondo". La corrispondenza è stata
ricostruita incrociando tre file del sito (non del pacchetto Blender), e per
questo la marco DERIVATA — non MISURATA in senso stretto, perché nessuna
singola fonte la dichiara già combinata.

**Passo 1 — la stessa fisica, lo stesso nodo.** Il sito carica lo stesso GLB
(`public/modelli/guscio-salone.glb`) e cerca lo stesso nodo
(`CAMERA_SORGENTE_SALONE`) che `world_root.py` usa come origine —
`src/scena/guscio.js:88-99`. Non è un'ipotesi: è testualmente lo stesso file
e lo stesso nome di nodo nei due pacchetti.

**Passo 2 — dove cade quel nodo nel frame di `ordinate.js`.** `guscio.js`
compone la trasformazione in modo che, nella scena, `CAMERA_SORGENTE_SALONE`
finisca esattamente dove sta la camera del sito "alla battuta del salone".
Quella posizione è **MISURATA con lo strumento** `strumenti/posa-sito.mjs`
(righe 1-16 del file, eseguendo il sito in un browser):

- nel sistema locale del gruppo salone: `(-0.01, 0, 1.3089)` unità —
  `strumenti/posa-sito.mjs:14-16`, ripetuto in `src/scena/salone3d.js:534-544`.
- in coordinate di scena (= nave, vedi sotto): `(0.0065, 1.4528, 1.9089)`
  unità — commento `src/scena/guscio.js:53-56`.

Il gruppo salone è posizionato, come figlio di `nave`, a
`gruppo.position.set(0, tuga.quota, tuga.z)` con **`TUGA.z = 0.6`** unità
— `src/scena/salone3d.js:600` e `src/scena/nave.js:55`. Verifica di coerenza:
`0.6 + 1.3089 = 1.9089` — combacia con il valore di scena riportato in
`guscio.js`. Due derivazioni indipendenti (locale+offset vs. misura diretta
in scena) danno lo stesso numero: **z₀ = 1,9089 unità di scena**, DERIVATO
da `nave.js:55` + `salone3d.js:544`, incrociato con `guscio.js:54`.

**Passo 3 — `nave` non trasla mai in z.** `nave.position.y` è animato
dall'emersione (`src/scena/index.js:829`), ma **non esiste** nel repo
un'analoga animazione su `nave.position.x` o `.z`: la z di `nave` resta 0 in
ogni fotogramma. Verificato per grep su `nave.position` in `index.js` e
`nave.js` — solo la riga 829 tocca la posizione, solo su `y`. Quindi la z di
scena coincide sempre con la z locale di `nave`, cioè con la z di
`ordinate.js`: non c'è un'ulteriore traslazione da tenere in conto.

**Passo 4 — la formula di corrispondenza.** `world_root.py` dice +X verso
prua (`world_root.py:64-67`); `ordinate.js` ha prua a z negativa (PRUA_Z=-8) e
poppa a z positiva (POPPA_Z=+8, righe 20-25): **i due assi puntano in versi
opposti sulla stessa retta fisica** (la lunghezza della nave). Con la stessa
scala (2,5 m/unità, §2.1) e z₀ = 1,9089 come origine comune:

```
X_m_mondo = -(z_unita_scena − 1,9089) × 2,5
z_unita_scena = 1,9089 − X_m_mondo / 2,5
```

DERIVATA dai passi 1-4. **Non è una misura diretta**: è la composizione di
quattro fatti ciascuno tracciabile a un file:riga, nessuno dei quali da solo
basta.

### 2.3 · Cosa manca per portarla da DERIVATA a MISURATA

Tre cose, dichiarate qui perché non si perdano:

1. **Nessuna costante dichiarata la porta esplicitamente.** La formula sopra
   non esiste scritta in nessun file: va ricostruita ogni volta dai tre file
   citati. Rischio concreto: se domani `TUGA.z` o il bersaglio di
   `posa-sito.mjs` cambiano, questo referto si disallinea silenziosamente,
   proprio il difetto che il contratto (`world_root.py:220-222`) elenca come
   "grandezza giusta letta in un sistema che non era il suo".
2. **Il valore 1,9089 dipende da parametri di default.** `guscio.js:161,178`
   espone `?conv=`, `?dx=`, `?dy=`, `?dz=`, `?ds=` per una ricerca di
   calibrazione ancora aperta (commento righe 145-159: "il giorno in cui la
   ricerca ha un vincitore, quel valore diventa l'unico"). Il valore
   1,9089 è quello misurato con i default (`conv=0`, offset a zero); se la
   calibrazione converge su altri parametri, z₀ cambia.
3. **Nessuna riesecuzione fresca in questo giro.** `strumenti/posa-sito.mjs`
   non è stato rilanciato: i numeri sopra sono letti dai commenti già
   presenti nei file, non ricalcolati ora. Sono coerenti fra loro (tre fonti
   che tornano allo stesso 1,9089), ma non ririfatti da zero — coerente col
   vincolo "NON eseguire Blender" e, per estensione prudente, non eseguire
   nemmeno il sito in questo giro da 20 minuti.

**Conclusione sul punto 3 del compito:** la corrispondenza è ricavabile, ma
con stato DERIVATO e non MISURATO, e con la dipendenza esplicita dai tre
punti sopra. Non la marco ASSUNTA perché ogni passo ha una fonte concreta;
non la marco MISURATA perché nessuna fonte la dichiara già come un'unica
costante verificata.

---

## 3 · Quali ordinate cadono nella fascia della traversata

Applicando `z = 1,9089 − X_m_mondo / 2,5` (DERIVATA, §2.2) ai due estremi
dichiarati in `world_root.py` (§2.1):

| estremo traversata | X_m_mondo | stato (fonte) | z_unita_scena | t = tDaZ(z) |
|---|---|---|---|---|
| ingresso salone | −0,800 | MISURATO, `world_root.py:394` | 2,2289 | 0,6393 |
| fondo locale tecnico | −14,902575 | DERIVATO, `world_root.py:288` | 7,8699 | 0,9919 |

Fascia in `ordinate.js`: **t ∈ [0,6393 ; 0,9919]**, ovvero **z ∈ [2,229 ; 7,870] unità di scena** — DERIVATO, formula §2.2, applicata ai valori di `world_root.py` citati sopra.

Confrontando con le 9 righe della tabella (§1):

| indice | t | z (unità) | X_m_mondo corrispondente | dentro la fascia? |
|---|---|---|---|---|
| 5 | 0,58 | 1,28 | +1,572 | NO — davanti (proravia) all'ingresso salone |
| **6** | **0,72** | **3,52** | **−4,028** | **SÌ** |
| **7** | **0,86** | **5,76** | **−9,628** | **SÌ** |
| 8 | 1,00 | 8,00 | −15,228 | AL LIMITE — appena FUORI (oltre il fondo del locale tecnico) |

**Due ordinate cadono pienamente dentro la fascia: indice 6 (t=0,72) e indice 7 (t=0,86).**

L'ordinata 8 (t=1,00, lo specchio di poppa) cade **appena oltre** il limite
poppiero della traversata: la sua X corrisponderebbe a −15,228 m, cioè
**0,325 m più a poppa** del fondo dichiarato del locale tecnico (−14,902575 m,
DERIVATO in `world_root.py:288`). Con la catena di derivazione a più passaggi
di §2.2 (ciascuno arrotondato a 3-4 decimali), 32,5 cm è un margine piccolo
ma non trascurabile: **non lo dichiaro né dentro né fuori con certezza** —
serve rifare il calcolo con la calibrazione (`?conv/?dx/?dy/?dz`) verificata
per decidere se lo specchio di poppa entra nella sezione da tagliare o resta
appena a poppavia.

Coordinate delle due ordinate sicuramente coinvolte, in unità di scena
(fonte: `ordinate.js:50-51`) e convertite in metri (× 2,5, `ordinate.js:19`):

```
indice 6, t=0,72, z=3,52 unità (X_m_mondo ≈ −4,03 m)
  semilarg  1,66 unità = 4,15 m     chiglia   −0,82 unità = −2,05 m
  spigoloY −0,22 unità = −0,55 m    spigoloX   1,63 unità = 4,08 m
  ponteY    0,91 unità = 2,275 m

indice 7, t=0,86, z=5,76 unità (X_m_mondo ≈ −9,63 m)
  semilarg  1,62 unità = 4,05 m     chiglia   −0,72 unità = −1,80 m
  spigoloY −0,20 unità = −0,50 m    spigoloX   1,60 unità = 4,00 m
  ponteY    0,893 unità = 2,2325 m
```

Tutti MISURATI da `ordinate.js:50-51` (i valori tabulati), le conversioni in
metri sono DERIVATE (× 2,5, `ordinate.js:19`). Ricorda: fra le stazioni
tabulate la sezione vera non è "a gradini" — `sezioneA(t)` la definisce con
continuità per ogni t nella fascia, comprese le z intermedie (es. z=7,870,
t=0,9919, appena prima della 8).

---

## 4 · Tolleranza accettabile e come misurarla

`ordinate.js` stesso pone il vincolo, nella sua intestazione (righe 4-17):
superficie e tappo **devono passare dalla stessa funzione**, perché una
seconda implementazione che diverge "non dà errore" — produce una sezione che
sembra valida ma non è più quella dello scafo disegnato, visibile come "una
scheggia di carta che sporge dallo scafo".

Per la sezione della traversata vale la stessa regola, quindi la tolleranza
giusta non è una soglia in centimetri da rispettare per approssimazione: è
**zero per costruzione**, ottenibile SOLO chiamando `contornoA(t)` /
`sezioneA(t)` alle z derivate in §3, non ritrascrivendo i numeri a mano in
Python.

Se in pratica un margine va dichiarato (perché la pipeline Blender non può
eseguire JS a runtime), la tolleranza operativa proposta è:
**≤ 1 mm per punto del contorno**, misurata così — stesso metodo già usato
nel repo per calibrare il guscio (`world_root.py:54-56`, scarto 0,006% sui
pannelli): si esegue `contornoA(t)` dal vivo (node) alle z di §3 e si
confrontano punto per punto con i numeri effettivamente incorporati nello
script Blender, prendendo il massimo scarto assoluto in metri. Un
disallineamento nasce silenziosamente (nessun errore Python, nessun crash
Blender) esattamente come descritto nell'intestazione del file — quindi la
misura va fatta con uno script di confronto dedicato, non assunta.

---

## 5 · Automatizzabile o congelata a mano — la domanda che decide il secondo giro

**AUTOMATIZZABILE, e c'è già un precedente diretto nel repo che lo dimostra.**

`strumenti/esporta-coperta.mjs` risolve esattamente lo stesso problema per un
altro pezzo Blender (la sovrastruttura/tuga che deve appoggiare sul ponte):
importa `sezioneA`, `tDaZ`, `PRUA_Z`, `POPPA_Z` direttamente da
`src/scafo/ordinate.js` (riga 29), campiona 41 stazioni, scrive un JSON in
unità di scena con `metriPerUnita: 2.5` dichiarato nel file, e lascia che sia
Blender a convertire in metri. La sua stessa intestazione (righe 10-20) dice
perché: riscrivere la tabella in Python "sarebbe stata la seconda
implementazione della stessa curva... il difetto peggiore possibile qui,
perché non dà errore".

La stessa ricetta si applica pari pari a `hull_section` (**non scritta in
questo giro**, per vincolo): uno script gemello (es.
`strumenti/esporta-sezione-scafo.mjs`) che importa `contornoA`/`tappoA` da
`ordinate.js`, calcola le z di §3 (o meglio: riceve in ingresso gli X in
metri della fascia e applica la formula di §2.2), e scrive un JSON con i
poligoni di contorno in metri. `parts/hull_section.py` legge quel JSON — non
reimplementa il loft.

**Perché NON va congelata a mano:**
1. `ordinate.js` è dichiaratamente vivo — il file porta già la storia di due
   difetti corretti nella tabella stessa (righe 27-41): i numeri cambiano.
2. La regola "una sola funzione, mai una seconda implementazione" è scritta
   dal file stesso come principio, non come preferenza di stile.
3. Il precedente `esporta-coperta.mjs` esiste appunto per evitare la seconda
   copia — usarlo come modello costa una manciata di righe, meno del rischio
   di uno scafo e una sezione che divergono senza errore.

**L'unica parte che oggi NON è automatizzabile end-to-end** è la
corrispondenza z↔X del §2.2: non essendo dichiarata da nessuna parte come
costante unica, uno script che la usi deve o (a) ricostruirla importando
`TUGA` da `nave.js` e il bersaglio da `posa-sito.mjs`/`salone3d.js` come ho
fatto qui a mano, oppure (b) — meglio — qualcuno la dichiari per la prima
volta come costante esplicita (es. una nuova voce in `world_root.py`, con
`stato: 'DERIVATO'` e la formula di §2.2 come `formula`), così il prossimo
script la importa invece di ricostruirla. Questo, non le ordinate stesse, è
il pezzo mancante prima di scrivere `hull_section.py`.

---

Fine: 2026-08-31T20:14:41+02:00.
