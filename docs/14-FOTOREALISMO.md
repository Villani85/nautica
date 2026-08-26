# 14 — Fotorealismo: specifica esecutiva definitiva

**Stato:** deciso · pronto per la costruzione  
**Ambito:** salone fotorealistico, impianto realtime, scala, cinematica, mare,
carter, materiali, caricamento e cancelli  
**Prossima consegna ammessa:** un GLB grezzo nel sito, non un altro piano

Questo documento sostituisce le precedenti stesure sul fotorealismo e, nei
punti in conflitto, sostituisce anche il §1 di `CANTIERE.md` e i passaggi di
`docs/08-PROGETTO-TECNICO.md` che attribuiscono la fisica alle quote del
leveraggio o fissano a priori 500/900 KB per il modello.

Le marche **FATTO**, **MISURATO**, **FONTE** e **DECISIONE** non sono sinonimi:

- **FATTO**: si legge direttamente nel codice o in uno standard;
- **MISURATO**: deriva da un comando riproducibile indicato nel testo;
- **FONTE**: è sostenuto da documentazione primaria linkata;
- **DECISIONE**: è una scelta di progetto, non una proprietà del mondo reale.

---

## 0. La decisione, senza più forcelle

**DECISIONE — Si costruisce un attuatore elettrico generico con riduttore
cicloidale, dentro un carter sigillato sezionabile.**

Il vecchio quadrilatero manovella–biella–leva viene eliminato. Il nuovo percorso
visibile è:

```text
quadro → cavo → servomotore → eccentrico → dischi cicloidali
       → portante d'uscita → albero → tenuta → pinna → acqua
```

Non è la copia di un prodotto commerciale e non usa CAD, marchi o targhe di un
costruttore. È geometria originale informata da prodotti reali.

La scelta è difendibile perché:

- Naiad documenta attuatori elettrici con servomotore AC e riduttori
  **Galaxie®/cicloidali** per yacht della classe 35–50 m;
- Quantum documenta un'unità elettrica compatta con riduttore dedicato per yacht
  della classe 40–65 m;
- il movimento eccentrico dei dischi rende visibile la catena causale senza
  inventare un leveraggio esterno.

Fonti primarie:

- [Naiad E-Series Electric Fin Stabilizers — PDF ufficiale](https://www.naiad.com/wp-content/uploads/2025/09/Product-Flyer-Electric-Fin-Stabilizers-07-2025.pdf)
- [Quantum e-FIN — pagina ufficiale](https://quantumstabilizers.com/products/stabilizers/e-fin-electric-system)
- [Sleipner SPS100E — attuatore elettrico per yacht 36–45 m](https://www.sleipnergroup.com/stabilizers/actuators/electric-stabilizer-actuator-sps100e)

Il sito non deve dire che il meccanismo è un Naiad, Quantum o Sleipner. Può dire:

> Generic electric fin actuator · Author-built geometry · Normalised model

---

## 1. Scala: il conto chiuso

### 1.1 La scena esistente

**FATTO — Nel repository `1 unità di scena = 2,5 m`.**

È dichiarato in [`src/scafo/ordinate.js`](../src/scafo/ordinate.js):

```js
// Unita' di scena: 1 = 2,5 m. Scafo z in [-8, +8] = 40 m.
```

ed è applicato da [`strumenti/collaudo-scafo.mjs`](../strumenti/collaudo-scafo.mjs):

```js
const M = 2.5
```

Il gruppo pinna di [`src/scena/nave.js`](../src/scena/nave.js) non ha un fattore
di scala proprio. Le sue coordinate locali devono quindi essere moltiplicate
per 2,5 per ottenere metri narrativi.

### 1.2 Misure del modello JavaScript attuale

Le misure seguenti servono solo a documentare il difetto che viene sostituito.
Non sono le quote del nuovo GLB.

| misura | unità di scena | metri |
|---|---:|---:|
| centro calotta `-1,07` → centro flangia `0,06` | 1,130 | **2,825** |
| ingombro esterno calotta → flangia | 1,1975 | **2,994** |
| apertura della pinna, bounding box compreso bevel | 1,064 | **2,660** |

Il precedente valore di circa 1,20 m per calotta–flangia era sbagliato: leggeva
le unità locali come metri. Il valore 2,83 m è corretto **solo se la misura è
centro-centro**. Non va confrontato con un bounding box esterno.

### 1.3 La regola per ogni confronto futuro

**Mai confrontare centro-centro con ingombro esterno.** Le sole misure ammesse
nel registro sono:

1. bounding box completo dell'unità interna;
2. altezza complessiva dall'asse dell'albero;
3. bounding box della pinna;
4. area planare della pinna;
5. posizione del pivot rispetto al fasciame.

Ogni misura deve riportare sistema di coordinate, trasformazioni applicate e
unità. Il bounding box viene calcolato con `Box3.setFromObject(obj, true)` dopo
`obj.updateWorldMatrix(true, true)`: [documentazione ufficiale Three.js di
`Box3`](https://threejs.org/docs/pages/Box3.html).

### 1.4 Blender, glTF e la conversione intenzionale

**FONTE — glTF usa metri per tutte le distanze lineari.**

[Specifica glTF 2.0, §3.4 Coordinate System and Units](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#coordinate-system-and-units)

Il GLB viene quindi modellato ed esportato in metri reali. Three.js è invece
unitless e la scena nautica interpreta una sua unità come 2,5 m. Al caricamento
serve perciò una conversione esplicita:

```js
const METRI_PER_UNITA_SCENA = 2.5
const UNITA_SCENA_PER_METRO = 1 / METRI_PER_UNITA_SCENA // 0,4

impianto.scale.setScalar(UNITA_SCENA_PER_METRO)
```

Questa scala `0,4` **non corregge il modello a occhio**: converte metri glTF in
unità della scena esistente. Non deve essere cotta nella mesh e non deve essere
duplicata su nodi figli.

Riferimenti di formato:

- [Blender Manual — esportazione glTF 2.0](https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html)
- [Three.js — GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)

### 1.5 Bersaglio dimensionale del nuovo asset

Il riferimento di scala è la classe **Quantum e1500**, non la sua forma
proprietaria. La scheda ufficiale riporta:

- unità interna: **1.105 × 729 × 928 mm**;
- altezza complessiva: **1.310 mm**;
- pinne tipiche: **1,5–3,5 m²**;
- yacht tipici: **30–66 m**.

Fonte: [Quantum e1500 Hull Unit — scheda tecnica ufficiale](https://cdn.quantumstabilizers.com/uploads/e1500-Hull-Unit-Technical-Specifications-0726.pdf).

**DECISIONE — Il modello originale usa come obiettivo:**

| grandezza | obiettivo Blender/glTF | dopo scala `0,4` nella scena |
|---|---:|---:|
| ingombro unità interna | circa 1,10 × 0,73 × 0,93 m | 0,44 × 0,29 × 0,37 |
| altezza complessiva | circa 1,31 m | 0,524 |
| apertura della pinna | circa 1,50 m | 0,60 |
| area planare pinna | circa 2,20 m² | 0,352 unità²; il valore autoritativo resta in `extras` |
| incidenza massima | ±25° | invariata |

Le quote sono un **bersaglio di progetto** compatibile con le fonti, non la
pretesa di riprodurre l'e1500.

---

## 2. Una sola fonte geometrica

**DECISIONE — `impianto.glb` sostituisce completamente il gruppo procedurale di
`nave.js`.**

JavaScript non ricostruisce motore, riduttore, albero o pinna. Fa soltanto
quattro cose:

1. carica il GLB;
2. applica la conversione `0,4` al nodo radice;
3. trova i nodi nominati;
4. assegna loro trasformazioni provenienti dalla simulazione e dalla regia.

Il vecchio codice del quadrilatero e il suo eventuale collaudo vengono rimossi
nello stesso commit in cui entra il GLB. Non si mantengono due modelli con un
test che tenta di tenerli allineati.

### 2.1 Contratto dei nodi

```text
IMPIANTO
├── STATIC_FOUNDATION
├── STATIC_HULL_PLATE
├── STATIC_SEAL
├── STATIC_MOTOR
├── HOUSING_FIXED
├── HOUSING_REMOVABLE
├── HOUSING_SECTION
├── RIG_INPUT
│   └── RIG_ECCENTRIC
├── RIG_CYCLO_A
├── RIG_CYCLO_B
├── RIG_OUTPUT
├── RIG_SHAFT
└── RIG_FIN
```

Regole:

- origine di `IMPIANTO`: centro dell'albero sul piano del fasciame;
- asse locale di rotazione di `RIG_SHAFT` e `RIG_FIN`: asse dell'albero;
- `RIG_CYCLO_A/B`: dischi sfalsati di 180°;
- `HOUSING_REMOVABLE`: parte che la regia allontana;
- `HOUSING_SECTION`: anello di materia che resta visibile sul piano di taglio;
- nessun pivot viene corretto in JavaScript con offset inventati;
- i nomi sono API: se uno manca, il caricamento fallisce in modo visibile.

### 2.2 Metadati nel GLB

Il nodo radice porta in `extras`:

```json
{
  "assetRole": "generic-electric-fin-actuator",
  "authoringUnit": "meter",
  "sceneMetersPerUnit": 2.5,
  "finAreaM2": 2.2,
  "finMaxAngleDeg": 25,
  "gearType": "cycloidal",
  "gearRatio": 29,
  "modelClaim": "illustrative"
}
```

Questi dati descrivono il modello mostrato. Non entrano automaticamente nella
fisica finché `simulazione.js` non li usa esplicitamente.

### 2.3 Contratto degli assi

In Blender:

```text
+X  fuoribordo
-Y  verso poppa
+Z  alto
```

Dopo la conversione dell'esportatore glTF e il caricamento in Three.js:

```text
+X  fuoribordo
+Y  alto
+Z  verso poppa
```

L'albero ruota quindi attorno a `+X`, come il gruppo attuale. La fiancata
opposta non si ottiene con scala negativa: si usa una rotazione propria o una
seconda istanza orientata, così normali e tangenti non vengono rovesciate.

---

## 3. Cinematica e simulazione: una distinzione obbligatoria

### 3.1 Cosa governa davvero il rollio

**FATTO — Le quote del vecchio leveraggio non compaiono in
[`src/scena/simulazione.js`](../src/scena/simulazione.js).**

Il rollio attuale dipende, fra l'altro, da `W`, `ZETA`, `A1`, `K`, `C0`,
`A_STALLO`, `A_MAX` e `RESIDUO`. Il GLB visualizza l'uscita del modello; non ne
dimostra la validità fisica.

La dicitura pubblica resta:

> Illustrative model · Generic geometry · Normalised values

### 3.2 Movimento del riduttore

L'angolo autoritativo dell'uscita è `S.pinna`, già espresso in radianti.

```js
const R = 29
const uscita = S.pinna
const ingresso = -R * uscita

rigFin.rotation[ASSE] = uscita
rigShaft.rotation[ASSE] = uscita
rigOutput.rotation[ASSE] = uscita
rigInput.rotation[ASSE] = ingresso
```

La geometria eccentrica e i dischi derivano da `ingresso`; non ricevono
animazioni registrate. Usare l'angolo assoluto evita deriva numerica e produce
lo stesso risultato dell'integrazione di `S.pinnaVel` quando lo stato iniziale
è coerente.

**DECISIONE — Il riduttore illustrativo usa 30 perni fissi e 29 lobi**, quindi
rapporto nominale 29:1. Con eccentricità `e`:

```js
cycloA.position.set(0, e * Math.cos(ingresso), e * Math.sin(ingresso))
cycloB.position.set(0, e * Math.cos(ingresso + Math.PI), e * Math.sin(ingresso + Math.PI))
cycloA.rotation[ASSE] = uscita
cycloB.rotation[ASSE] = uscita
```

I due dischi orbitano sfasati di 180° e contro-ruotano lentamente rispetto
all'ingresso. I perni del portante d'uscita devono attraversare davvero i fori
dei dischi su tutta la corsa: non sono decorazione sovrapposta.

Se si usa l'integrazione per continuità visiva:

```js
ingresso += -R * S.pinnaVel * dt
```

la posa viene riconciliata con `-R * S.pinna` quando si entra nella scena o si
ripristina una sessione. La velocità non viene mai assegnata direttamente a una
rotazione.

### 3.3 Recupero

Quantum documenta un recupero energetico reale nella propria architettura
e-FIN, con accumulo su condensatori. Questa fonte dimostra che il fenomeno
esiste, non che il nostro modello lo misuri:

- [Quantum e-FIN — Energy Storage System](https://quantumstabilizers.com/products/stabilizers/e-fin-electric-system)

Nel repository `S.recupero` è invece un indice d'autore derivato dal verso e
dall'intensità del moto. Mancano coppia, rendimento, tensione, corrente e
potenza. L'etichetta pubblica diventa quindi:

> **Regeneration index · normalised 0–100**

Non si usano `kW`, `kWh`, percentuali di energia recuperata o frasi come
“energia generata” finché non esiste un modello separato e verificato.

---

## 4. Il carter è la rivelazione

Il meccanismo entra in scena **chiuso**. Prima deve sembrare un prodotto
industriale credibile; solo dopo il taglio ne mostra l'interno.

### 4.1 Costruzione

- guscio esterno e interno distinti;
- spessore visibile 4–6 mm;
- `HOUSING_SECTION` come anello, mai una superficie senza spessore;
- nervature, bulloneria, pressacavi, coperchio di ispezione e blocco manuale;
- nessun foro puramente dipinto se la camera può attraversarlo;
- bevel da 1–3 mm sugli spigoli leggibili in primo piano.

La documentazione Naiad mostra come elementi credibili un carter in ghisa
nodulare, servomotore AC, albero in acciaio, cuscinetti a rulli e possibilità di
centraggio/blocco manuale. La scheda Quantum e1500 conferma riduttore compatto,
doppio cuscinetto e blocco manuale accessibile. Sono riferimenti funzionali, non
forme da copiare.

### 4.2 Regia del taglio

1. il piano di sezione raggiunge il carter;
2. `HOUSING_REMOVABLE` si separa lungo la normale del taglio in 0,9–1,2 s;
3. massa e inerzia si sentono nell'easing, senza rimbalzo elastico;
4. `HOUSING_SECTION` resta fermo e rende evidente lo spessore;
5. la camera entra soltanto quando il guscio ha liberato il percorso;
6. il riduttore continua a ricevere `S.pinna` dalla simulazione viva.

Il bordo di sezione può essere più luminoso del carter perché è materia non
verniciata, ma deve restare tecnico: niente metallo incandescente, scintille o
effetto “appena segato”.

---

## 5. L'esperienza: causa, conseguenza, sollievo

Il meccanismo è la spiegazione. L'emozione è il passaggio fra disagio e calma.

La sequenza definitiva è:

```text
1. scegli il mare
2. lo yacht rolla con il sistema spento
3. entri nel salone e ne subisci le conseguenze
4. attivi lo stabilizzatore
5. orizzonte, corpi e oggetti si acquietano
6. il taglio apre lo scafo e poi il carter
7. entri vicino al riduttore mentre lavora
8. cambi di nuovo il mare e la macchina risponde dal vivo
9. torni alle persone: il valore è il benessere, non il motore
```

La scena non termina su una tabella tecnica.

### 5.1 Due scene, due riferimenti di camera

**Scafo esterno — camera solidale al mondo.**

- orizzonte e linea d'acqua restano orizzontali;
- scafo e sovrastruttura rollano;
- la cucitura canvas/CSS resta a 0 px;
- è osservazione e dimostrazione.

**Salone — camera solidale allo yacht.**

- stanza e cornice restano ferme nell'inquadratura;
- mare e orizzonte ruotano nel finestrino in verso opposto al rollio;
- corpi, bicchieri e lampada reagiscono rispetto alla stanza;
- è esperienza vissuta.

Oggi [`src/scena/composito.js`](../src/scena/composito.js) usa la convenzione
opposta: tiene fermo il mare e ruota `stanza` e `tesa`. Per applicare questa
decisione, la trasformazione di rollio passa al livello `mare`; i livelli della
stanza non ruotano. La posa tesa continua a dipendere dall'ampiezza e conserva
la memoria già implementata.

Il mare deve avere overscan sufficiente a coprire gli angoli scoperti dalla
rotazione. Il pivot visivo coincide con l'orizzonte, non col centro casuale del
video.

### 5.2 Vicino al meccanismo

Durante il close-up la camera è solidale alla struttura dello yacht: carter e
fondazione sono leggibili, mentre rotore, dischi, uscita e pinna mostrano la
risposta. Non si aggiunge camera shake per “far sentire il mare”: il mare si
sente dal suono, dal carico e dal movimento comandato.

---

## 6. Il mare cambia davvero

L'interfaccia mantiene i cinque livelli già previsti da
`AMPIEZZA_MARE = [0, 3, 6, 9, 12, 15]`. Sono livelli del **modello d'autore**,
non gradi Beaufort.

Tre famiglie visive bastano, purché la simulazione resti a cinque livelli:

| livello UI | ampiezza nominale nuda | famiglia video | risposta visibile |
|---:|---:|---|---|
| 0 | 0° | calma/debug | macchina quasi ferma |
| 1 | 3° | calma | correzioni piccole e discontinue |
| 2 | 6° | mare formato | attività regolare |
| 3 | 9° | mare formato | corsa e velocità maggiori |
| 4 | 12° | mare duro | lavoro continuo, picchi di carico |
| 5 | 15° | mare duro | fondo corsa/stallo possibile secondo la simulazione |

Asset minimi:

```text
mare-calmo.mp4
mare-formato.mp4
mare-duro.mp4
```

Devono condividere:

- camera, focale, quota e posizione dell'orizzonte;
- durata e frame rate compatibili;
- direzione dominante dell'onda;
- color grading;
- primo e ultimo fotogramma richiudibili in loop.

Il cambio di famiglia usa una breve dissolvenza soltanto quando l'utente cambia
livello. La dissolvenza non sostituisce il moto: `S.mare` continua a modificare
la forzante, `S.rollio`, `S.pinna` e `S.pinnaVel` nello stesso istante.

**Cancello narrativo:** cambiando mare devono cambiare insieme, entro la stessa
interazione:

1. superficie visibile;
2. rollio;
3. escursione e velocità del riduttore;
4. posa delle persone;
5. suono e carico normalizzato.

Se cambia soltanto un numero, il contratto è rotto.

---

## 7. Materiali e illuminazione

La scena racconta una sala macchine mantenuta di uno yacht da 40 m, non
un'officina abbandonata.

| elemento | trattamento |
|---|---|
| struttura carena | epossidico bianco caldo, roughness 0,55–0,70 |
| carter | vernice tecnica grafite o verde petrolio, dielettrica |
| albero e bulloneria | acciaio lavorato, metalness 1, roughness 0,22–0,35 |
| tenute e supporti | acciaio/leghe coerenti con il riferimento scelto |
| antivibranti | gomma nera, roughness alta |
| cavi di potenza | arancione tecnico, usato con moderazione |
| bordo di sezione | metallo non verniciato, più leggibile ma non luminoso |

Il bronzo non è un codice universale per “acqua marina” e non viene inserito se
la funzione del pezzo non lo giustifica.

Regole di resa:

- variazione di roughness prima dello sporco;
- lavorazione direzionale su acciaio tornito;
- impronte e tracce d'olio minime;
- nessuna ruggine;
- normal/AO cotte per i dettagli minuti;
- silhouette, spessori, fori vicini e bevel restano geometria.

Luce: plafoniere tecniche sopra l'impianto, grande rimbalzo sulle superfici
chiare, riflessi controllati sul metallo. Nessuna officina HDRI visibile dietro
il taglio.

### 7.1 Environment e tone mapping

Per la scena della nave resta valida la soluzione già misurata in
[`src/scena/materiali.js`](../src/scena/materiali.js): environment map assegnata
ai soli materiali che devono riflettere. Non si imposta `scene.environment`
sulla scena principale perché raggiunge anche l'acqua e rompe la giunzione.

Il tone mapping non obbliga il CSS a cambiare colore. Le superfici che devono
combaciare esattamente con la carta/acqua usano CSS oppure materiali unlit con
`toneMapped = false`; il modello fotorealistico può essere valutato con ACES.
La scelta finale passa da un provino misurato della cucitura, non da una regola
astratta.

---

## 8. Pipeline di costruzione

### 8.1 Fase grezza — la prossima modifica

Costruire in Blender soltanto:

- volume esterno dell'unità;
- carter fisso, removibile e anello di sezione;
- albero e pinna;
- ingresso, eccentrico, due dischi e uscita;
- pivot e nomi definitivi;
- materiali piatti distinti.

Esportare `impianto.glb`, caricarlo con
[`GLTFLoader`](https://threejs.org/docs/#examples/en/loaders/GLTFLoader), applicare
scala `0,4` e collegarlo a `S.pinna`. Nessun dettaglio high-poly prima che questo
passo sia visibile nel sito.

### 8.2 Fase emotiva

- invertire il riferimento del salone: stanza ferma, mare che rolla;
- collegare le tre famiglie video ai cinque livelli;
- mantenere la memoria delle pose;
- verificare il ritorno alle persone dopo la rivelazione.

### 8.3 Fase fotografica

Soltanto dopo l'integrazione:

- high-poly controllato;
- UV definitive;
- bake normal, AO e roughness;
- low-poly manuale;
- compressione mesh e texture;
- luci e grading;
- dettagli di installazione e service clearance.

[Manuale ufficiale Blender glTF](https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html)

---

## 9. Peso e prestazioni

Il GLB viene caricato dopo l'apertura e quindi non è automaticamente parte
dell'LCP iniziale. Le metriche da separare sono:

1. peso trasferito di GLB e texture;
2. tempo richiesta → primo fotogramma interattivo del meccanismo;
3. tempo di parsing/decompressione sul main thread;
4. memoria GPU/CPU;
5. frame rate e frame time durante apertura carter e mare 5;
6. INP dei comandi mentre il modello è attivo.

Il vecchio limite 500/900 KB non è un fatto. **Obiettivo provvisorio**, non
cancello: massimo 1,5 MB trasferiti per l'asset mobile completo. Il tetto
definitivo viene deciso sul primo GLB integrato e su un Android reale.

Minimi di accettazione:

- nessun modello nel percorso critico della prima schermata;
- almeno 30 fps sostenuti sul telefono di riferimento;
- nessun blocco percepibile quando il GLB diventa visibile;
- comandi utilizzabili durante il caricamento;
- fallback statico se WebGL o caricamento falliscono;
- `prefers-reduced-motion`: posa leggibile, niente ciclo continuo obbligatorio.

Core Web Vitals restano misure separate dell'intera pagina: LCP ≤ 2,5 s,
INP ≤ 200 ms, CLS ≤ 0,1 al 75º percentile secondo la documentazione ufficiale
Google: [Web Vitals](https://web.dev/articles/vitals).

---

## 10. Cancellazione e collaudi

Non si costruisce una nuova suite prima del GLB grezzo. Dopo l'integrazione si
aggiungono soltanto questi controlli.

### 10.1 `collaudo-glb.mjs`

Rosso se:

- manca un nodo del contratto;
- esistono nomi duplicati;
- la scala radice non vale `0,4`;
- il bounding box fisico esce dalla tolleranza dichiarata;
- il pivot di albero e pinna non coincide;
- `extras.authoringUnit !== "meter"`;
- materiali o texture referenziati non vengono caricati;
- il file non passa il [Khronos glTF Validator](https://github.com/KhronosGroup/glTF-Validator).

### 10.2 Sweep cinematico

Campionare almeno 101 pose da −25° a +25°. Rosso se:

- un nodo restituisce `NaN` o una matrice non finita;
- pinna/albero/uscita divergono oltre la tolleranza numerica;
- dischi o portante attraversano il carter fisso;
- il carter removibile invade la traiettoria della camera.

### 10.3 Controllo visivo

Due immagini versionate, stessa camera:

1. carter chiuso;
2. carter aperto a metà.

Devono rendere visibili spessore, anello di sezione e percorso interno. Questo
non viene ridotto a un test numerico: “sembra una linea invece di un anello” è un
difetto visivo.

### 10.4 Telefono

Il collaudo finale è manuale e registrato: caricamento a freddo, apertura del
carter, mare 5, rotazione dell'oggetto, cambio mare e ritorno al salone. Si
registrano dispositivo, browser, rete, peso, frame rate e problemi osservati.

---

## 11. Definizione di finito

Il capitolo è chiuso soltanto quando tutte queste frasi sono vere:

- [ ] il vecchio leveraggio non esiste più nel prodotto;
- [ ] esiste un solo modello geometrico dell'impianto;
- [ ] il GLB è in metri e viene convertito con scala radice `0,4`;
- [ ] carter, sezione e cinematica sono leggibili senza didascalia;
- [ ] `S.pinna` comanda realmente l'intera catena del riduttore;
- [ ] il mare visibile cambia insieme alla simulazione;
- [ ] nel salone la stanza resta ferma e l'orizzonte rolla;
- [ ] il valore “Recovery” è dichiarato indice normalizzato;
- [ ] la rivelazione ritorna alle persone;
- [ ] il telefono reale regge il percorso completo;
- [ ] nessuna affermazione pubblica attribuisce al modello precisione che non ha.

Il risultato non deve sembrare “un bel motore”. Deve permettere a chi guarda di
formulare da solo la sequenza:

> il mare peggiora → la persona perde stabilità → la macchina lavora di più →
> la barca si calma → la vita a bordo riprende.

---

## 12. Divieti

- nessun altro documento di pianificazione prima del GLB grezzo integrato;
- nessuna copia di un CAD commerciale;
- nessun logo di produttore;
- nessun planetario mostrato e chiamato cicloidale;
- nessuna unità fisica sul recupero normalizzato;
- nessuna scala scelta guardando lo schermo;
- nessun `scene.environment` globale sulla scena della nave;
- nessun high-poly prima che pivot, nodi e simulazione funzionino;
- nessuna riduzione del mare a un valore numerico con video invariato;
- nessuna conclusione narrativa dentro la sala macchine.

---

## 13. Fonti e cosa autorizzano a dire

| fonte | cosa sostiene | cosa non sostiene |
|---|---|---|
| [Naiad E-Series](https://www.naiad.com/wp-content/uploads/2025/09/Product-Flyer-Electric-Fin-Stabilizers-07-2025.pdf) | servomotore AC, drive Galaxie/cicloidale, classe E525 35–50 m, pinne 1,12–3,53 m² | che il nostro asset sia un Naiad o ne replichi la meccanica proprietaria |
| [Quantum e-FIN](https://quantumstabilizers.com/products/stabilizers/e-fin-electric-system) | sistema elettrico, riduttore dedicato, recupero/accumulo reali, classe 40–65 m | che `S.recupero` misuri energia reale |
| [Quantum e1500](https://cdn.quantumstabilizers.com/uploads/e1500-Hull-Unit-Technical-Specifications-0726.pdf) | ingombri, peso, campo tipico e area pinne | diritto di copiare forma, CAD o dettagli proprietari |
| [Sleipner SPS100E](https://www.sleipnergroup.com/stabilizers/actuators/electric-stabilizer-actuator-sps100e) | esistenza di attuatori elettrici compatti per yacht 36–45 m e installazione orientabile | architettura interna cicloidale |
| [glTF 2.0 §3.4](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#coordinate-system-and-units) | distanze glTF in metri, assi e angoli | conversione automatica nella scena Three.js del progetto |
| [Three.js Box3](https://threejs.org/docs/pages/Box3.html) | bounding box world-space dopo le trasformazioni | significato fisico delle unità del progetto |
| [Blender glTF](https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html) | pipeline supportata di esportazione | qualità o correttezza meccanica dell'asset |
| [Google Web Vitals](https://web.dev/articles/vitals) | soglie LCP, INP e CLS | budget specifico del GLB differito |

### Istruzione per la prossima AI

Non riscrivere questo piano. Prima di proporre un cambiamento:

1. indica la frase esatta di questo documento che il cambiamento sostituisce;
2. mostra un fatto del codice, una misura riproducibile o una fonte primaria;
3. se il cambiamento non è necessario per produrre il GLB grezzo integrato,
   rimandalo.

La prossima azione è aprire Blender.
