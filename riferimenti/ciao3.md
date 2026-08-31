# ciao3 — cosa è successo il 31 agosto, e cosa chiedo

**Scritto da:** Claude Opus 5, sessione del 31 agosto 2026
**Ramo:** `main` — e questo è già metà del messaggio
**Segue:** `ciao2.md`, che era su `worktree-atto-due-leggibile`

---

## 0 · LA COSA PIÙ IMPORTANTE, E NON È TECNICA

`ciao2.md` si apriva così: *«`origin/main`: `14a5921` — non contiene niente di
questo lavoro»*.

Non lo conteneva da giorni. **Trentotto commit** — le clip della coppia tesa e
del sollievo, `src/ui/suono.js`, i cinque copioni del guscio del salone — stavano
su un ramo che nessuno innestava. E `main` non aveva un solo commit che il ramo
non avesse: era un avanzamento pulito, fermo.

Me ne sono accorto solo perché una revisione ha scritto che `suono.js` esiste, io
avevo **misurato** che non esiste, e invece di difendere la mia misura sono
andato a cercare il file. Le due affermazioni erano tutte e due vere: guardavamo
**due alberi diversi**.

È la stessa forma del difetto che ci ha tenuti fermi due giorni prima — una
chiave YAML duplicata che faceva partire la CI con zero job — vista da un'altra
porta: **lavoro che esiste e non arriva al sito**. In tutti e due i casi nessuno
guardava il canale che porta il lavoro fuori.

**La richiesta, prima di tutte le altre: se apri un ramo, dichiara chi lo
innesta e quando.** Un ramo che vive più di un giorno è un ramo che qualcuno
misurerà al posto di `main`, e da lì in poi due persone parlano di due siti.

---

## 1 · IL GUSCIO DEL SALONE — sbloccato, non finito

### Dove eravamo

Il salone è una clip mascherata e non una stanza modellata. A scorrimento
**0,235** si rivelava: un rettangolo con quattro bordi netti incastrato nello
scafo, col taglio verticale destro che attraversava il salotto a metà. Prova in
`feedback/prove/2026-08-29-salone-e-una-carta.png`.

Nessun cancello poteva vederlo, e la forma di questa cecità vale più del
difetto: `collaudo-filmato` guarda **dentro** l'inquadratura — che la camera
della clip stia ferma (0,18% di carrellata), che la maschera non scivoli oltre
il vano (1,9 px su 24) — e passa, perché è tutto vero. Il difetto sta sul
**bordo**, dove nessuna misura andava.

### Cosa ho fatto oggi

- **`riferimenti/blender/guscio-esporta.py`** (nuovo): unisce due copioni che
  esistevano separati — la geometria di `guscio-salone.py` e le UV proiettate di
  `guscio-proiezione.py`, che però renderizzava invece di esportare.
- **`public/modelli/guscio-salone.glb`**: 8 pezzi, **122 KB** compressi meshopt.
- **`src/scena/guscio.js`** (nuovo): carica, piazza, applica la texture video.
- **`strumenti/posa-sito.mjs`** e **`strumenti/confronto-guscio.mjs`** (nuovi):
  misurano dove sta la camera del sito e confrontano lastra e guscio negli
  stessi tre punti.

Tutto dietro **`?guscio=1`, spento**: il sito pubblicato non cambia di un pixel.

### Le tre trappole già pagate, perché non le ripaghi tu

1. **`export_yup=False` non è un dettaglio.** I copioni lavorano in *Y in alto*
   — `posa.json` dichiara «X lungo la murata, Y in alto, Z fuori dalla parete» —
   dentro un Blender che è *Z in alto*. L'esportatore glTF di suo converte e
   ruota tutto di 90° attorno a X. Visto: il guscio caricato nel sito come una
   scatola blu sopra la tuga.
2. **I materiali si esportano, ma senza immagine.** `export_materials='NONE'` fa
   cadere `collaudo-gltf`, che ha ragione (primitiva senza materiale → grigio di
   riserva di three.js → il pezzo esce di plastica, senza errori).
   `export_materials='EXPORT'` col materiale FOTO porta dentro la fotografia:
   **da 122 a 881 KB** e `IMAGE_FEATURES_UNSUPPORTED` dal validatore Khronos. La
   cura è un materiale semplice creato apposta prima dell'export.
3. **`comprimi-modello` bocciava una compressione buona.** Diceva «extras
   spariti del tutto» ogni volta che l'uscita non ne aveva — giusto per
   l'impianto, che negli extras porta il rapporto del riduttore; sbagliato per
   un modello che extras non ne ha mai avuti. Confrontava con un'**aspettativa**
   invece che con l'**ingresso**. Corretto: se l'ingresso ne aveva, l'uscita
   deve averli; se non ne aveva, non c'è niente da perdere e lo dice.

### DOVE MI SONO FERMATO, col numero esatto

Il piazzamento non è risolto. Misurato:

```
  scatola del guscio, coordinate mondo   min -0.47  2.36  -1.04
                                         max  2.62  3.58   3.33
  gruppo del salone,  coordinate mondo       -0.01  1.45   0.60
  camera del sito,    coordinate mondo        0.01  1.45   1.91
```

Il guscio **galleggia sopra la camera** (y 2,36–3,58 contro 1,45) e sbanda in X.
La camera dovrebbe stare *dentro* la stanza.

**Quello che è certo**, e serve a non ripartire da zero:

- la posa della camera del sito al salone, nel sistema del **gruppo**, è
  `(-0.01, 0, 1.3089)` con rotazione **zero** — in asse, 1,31 unità davanti alla
  lastra. Misurata, non supposta.
- il gruppo del salone è **figlio di `nave`**, e `nave.position.y` è animata
  dall'emersione (−4,2 → 0). Una posa giusta in coordinate di scena è sbagliata
  come posizione locale, **e non lo dice nessuno**. È la trappola in cui sono
  caduto per primo.
- la trasformazione è aritmetica, con tutti e due i termini misurati:
  `q = q_sito · q_sorgente⁻¹` e `p = C − q·(S·scala)`, scala = 1/2,5.
- la posa sorgente è in `riferimenti/salone/posa.json`: errore medio **1,175 px**
  sulle rette del vano, **1,56 px** contro la maschera già spedita.

**Il sospetto che lascio, non verificato:** la rotazione mischia ancora due assi.
`guscio-camera-prova.py` ha determinato per misura che la convenzione è
*trasposta + mezzo giro attorno a X*, e in `guscio.js` l'ho riportata — ma non ho
verificato che regga dopo il passaggio Blender → glTF → three.js con
`export_yup=False`. È il primo posto dove guarderei.

### ⟶ DOMANDA 1

Il modo più corto per chiudere il piazzamento: rendere dal sito con `?guscio=1`
alla battuta del salone e confrontare col fotogramma della clip. Se il guscio è
piazzato bene, **devono coincidere** — è la stessa prova di tautologia che
`guscio-proiezione.py` fa in Blender. Conosci un modo di fare quel confronto che
non richieda di indovinare prima la rotazione?

---

## 2 · IL SOLLIEVO — due difetti in fila, e uno arrivava agli utenti

### Il difetto vero

La consegna dal sollievo al ciclo calmo si chiude su
`vCalma.requestVideoFrameCallback(chiudi)`. Ma tre righe sopra il video calmo è
messo **in pausa**: se è già sul fotogramma giusto non ne presenta più nessuno,
la richiamata **non arriva mai**, e lo schermo resta coperto dal fermo immagine
del sollievo. Non per un istante: per sempre.

Si vedeva a intermittenza perché dipende da dove sta il ciclo calmo quando il
sollievo finisce. In CI tre volte su tre, in locale con la GPU mai.

**Su un telefono lento è un sito rotto.**

Curato tenendo tutte e due le strade: la richiamata del video resta quella buona
— è l'unica che garantisce il fotogramma *a schermo* — e `requestAnimationFrame`
fa da rete. `chiudi` si protegge da solo, quindi chi arriva secondo non fa
niente.

### E uno che era mio, di metodo

Chiuso il primo, restava «la calma non riparte dal raccordo: **1,99 s**». Numero
vero, conclusione sbagliata: il criterio parla dell'**istante** della consegna,
ma chi lo verifica da fuori legge più tardi, e nel frattempo il video ha suonato.
Stavo misurando **il mio ritardo nel guardare**.

Adesso `chiudi()` registra `calmaAllaConsegna` dentro la scena, e il cancello
stampa tutte e due le letture, perché la differenza *è* il punto:

```
  calma  riparte a 0.00 s (letta poi a 1.93) · in moto si     senza GPU
  calma  riparte a 0.00 s (letta poi a 0.01) · in moto si     con GPU
```

### La cosa che quasi sbagliavo

Avevo già scritto la spiegazione comoda — «è la sesta volta che un cancello
misura la macchina» — quando ho deciso di stampare lo stato invece di
concluderlo:

```
  diagnosi  calma: 207 fotogrammi presentati, readyState 4, rVFC c e, inConsegna true
```

Duecentosette fotogrammi presentati. Non era il runner: era il sito. **Una
spiegazione che ha funzionato cinque volte è esattamente quella che al sesto
caso non si verifica più.**

---

## 3 · SEI VOLTE LA STESSA MALATTIA, E LE TRE FORME CHE PRENDE

Fra il 29 e il 31 la CI è caduta sei volte, e cinque erano **cancelli che
misuravano la velocità della macchina invece del sito**. Le forme:

| forma | dove | cura |
|---|---|---|
| campionamento a fotogrammi | manopola: 12 campioni invece di 480, verdetto **rovesciato** | `passoDichiarato(dt, n)`: il tempo lo detta il cancello |
| attesa d'orologio prima della misura | assestamento della manopola: stessa fase, macchine diverse | stessi passi dichiarati anche per l'attesa |
| attesa d'orologio al posto di un fatto | varco (3 s fissi), sollievo (8 s) | si aspetta **il fatto**, e si stampa quanti fotogrammi sono passati |
| un timer che non riesce a girare | telefono: `setTimeout` da 400 ms letto a 1200 | si aspetta l'annotazione, non i millisecondi |
| il server interrogato prima che risponda | nudge: `ERR_CONNECTION_REFUSED` | si riusa un server acceso, o lo si interroga finché non risponde |

**La correzione che vale per tutte, e che avevo scritto sbagliata:** un
`setTimeout` è indipendente dalla macchina per quando viene *programmato*, non
per quando può essere **eseguito**. Il callback aspetta che il thread principale
si liberi, e su un runner dove un fotogramma lo occupa per oltre un secondo,
400 ms letti a 1200 sono una gara che il timer perde.

Nessuna l'ho chiusa allargando una soglia: **il criterio resta, cambia da dove
viene il tempo.**

### ⟶ DOMANDA 2

Vale la pena scrivere un cancello che cerca **questa classe** invece dei singoli
casi? Qualcosa che segnali `waitForTimeout` e `setTimeout` dentro `strumenti/`
quando il fenomeno atteso avanza a fotogrammi. Il rischio è ovvio — un cancello
che boccia il codice per come è scritto invece che per cosa fa — e per questo lo
chiedo invece di farlo.

---

## 4 · COLAB CON LA GPU VERA — una mia nota era sbagliata

La skill `colab` diceva, con tre configurazioni misurate, che su Colab Chromium
vede **sempre** SwiftShader. Era vera, e la causa che indicava era giusta a metà:
mancava l'ICD. Ma non mancava il file JSON — mancavano **le librerie**.

```
GPU:             Tesla T4, driver 580.82.07
ICD EGL:         solo 50_mesa.json
libEGL_nvidia:   assente
libGLX_nvidia:   assente
```

Una riga (`apt-get install -y libnvidia-gl-580`) e poi:

| argomenti | `UNMASKED_RENDERER_WEBGL` |
|---|---|
| `--use-angle=gl` | ANGLE (Google, **SwiftShader** driver) |
| **`--use-angle=vulkan`** | **ANGLE (NVIDIA, Vulkan 1.4.312 (NVIDIA Tesla T4), NVIDIA)** |

Il disallineamento fra kernel (580.82.07) e userspace (580.178.04), che mi
aspettavo bloccante, **non lo è**.

**Con `gl` si resta in software anche a librerie installate, e non lo dice
nessuno.** Il cancello sul renderer resta obbligatorio: basta scordare un
argomento per tornare a numeri che sembrano autorevoli.

**Quello che NON risolve:** il runner di GitHub Actions resta senza GPU. Colab dà
un posto dove misurare la **resa** in modo onesto, non un modo di far passare i
cancelli di qualcun altro.

### ⟶ DOMANDA 3

I provini di resa — confronto cotto/real-time, FPS, curva tonale — hanno senso
girarli su Colab adesso che la GPU c'è? La T4 non è la scheda di nessun
visitatore, quindi gli FPS restano un numero relativo. Ma per **confrontare due
versioni dello stesso sito** basterebbe.

---

## 5 · QUELLO CHE NON HO FATTO, dichiarato

### I tre bordi che hai visto e io non ho riprodotto

- la cavità nera dietro il piano nello stesso passaggio del salone;
- i bordi di sezione dello scafo **senza cappatura**, circa 96–110 s;
- le lastre bianche e le strutture troncate quando taglio verticale, taglio
  trasversale e zoom si sovrappongono.

Li ho presi come indicazioni, **non come misure mie**. Il protocollo che hai dato
— quattro viewport, percorso a 0,25×, si guarda il **perimetro** e non il centro
— non l'ho eseguito.

### Lo yacht

Non toccato. L'ordine che hai dato è registrato e non discusso: silhouette →
contatto scafo-acqua → illuminazione → cappature → separazione dei materiali →
microdettaglio, *«non iniziare dal punto 6»*.

### Il suono

`src/ui/suono.js` è arrivato col ramo ed è nel sito. **Non l'ho ascoltato**: ho
verificato che il file esista e che la catena passi. I sei strati che hai
ordinato non li ho confrontati con quello che il file fa davvero.

### ⟶ DOMANDA 4

Dei tre — bordi, yacht, regia sonora — quale sposta di più il giudizio, dato che
il salone resta una carta finché il guscio non è piazzato? Il mio istinto dice
**prima il guscio, poi i bordi** (sono la stessa famiglia di difetto: supporto
rivelato), e lo yacht dopo. Ma è messa in scena, e la decisione non è mia.

---

## 6 · STATO DEL SITO

**Pubblicato:** https://villani85.github.io/nautica/

- filmati **4,12 MB** su un tetto di 4,2
- JS **210,5 KB** gzip su 250
- percorso critico **58,5 KB** gzip
- catena di collaudo completa: **verde**, zero ROTTO
- il finale torna alla coppia dell'apertura: scarto di calore **0,7 livelli**
  contro i 47,5 del finale precedente, e ci si arriva in 8,04 s

**Guarda il sito pubblicato, non i filmati.** Gli ultimi due giri hanno giudicato
provini vecchi — uno da 67,9 s che non arrivava nemmeno al meccanismo — e questo
ha prodotto due voci non riproducibili: «Jump to any scene» sulla hero (misurato:
compare a q 0,292, nella seconda scena) e un nudge «Drag the speed» che **non
esiste**.
