# Audit del prototipo — `prototipo/linea-di-galleggiamento.html`

**Revisione 2 — 2026-08-25.** La revisione 1 conteneva due errori importanti,
trovati da revisori esterni e confermati misurando. Sono corretti qui e
documentati in `feedback/`. La versione sbagliata resta nella cronologia git:
serve a ricordare come sono stati commessi.

> Correzioni rispetto alla revisione 1:
> **(a)** il taglio del titolo era dichiarato "già in piedi" e **non è
> implementato** — avevo letto un commento CSS e riportato l'intenzione come
> fatto; **(b)** il peso era usato per dire che il prototipo sfonda il budget
> JS, e **misurato in gzip il budget è rispettato con margine.**

---

## 1. Che cosa è

Un file HTML solo, 569 righe, che apre con un doppio clic. Zero build, zero CDN,
zero dipendenze da risolvere. Geometria interamente procedurale: nessun modello
di terzi, nessun rischio di licenza. Il brief lo chiedeva e il prototipo già lo fa.

### Peso — misurato su disco e in gzip

| blocco | byte | gzip -9 |
|---|---:|---:|
| bundle three.js UMD, inline in una riga sola | 603.462 | 148.751 (145,3 KB) |
| CSS + font base64 (4 `@font-face`) | 99.783 | 72.291 (70,6 KB) |
| **simulazione d'autore** | **12.114** | **4.213 (4,1 KB)** |
| **file completo** | **718.877** | **226.935 (221,6 KB)** |

Due letture, e servono entrambe.

**Il lavoro d'autore è 23.647 B, cioè 7,5 KB gzipped** — misurato come tutto il
file meno il bundle three.js meno i quattro blocchi base64 dei font. La
revisione 2 diceva "4,1 KB": contava solo il secondo `<script>` e buttava via
HTML e CSS d'autore, che sono lavoro quanto il resto — anzi, il taglio del
titolo vive proprio nel CSS.

**Il budget del brief è già rispettato.** JS totale in gzip: **149,4 KB** contro
i 250 KB fissati. Chi cita "702 KB" o "718 KB" sta citando byte su disco, che
non sono quelli che viaggiano: non usare quei numeri per dire quanto pesa il sito.

Il bundle porta l'intestazione `Copyright 2010-2021 Three.js Authors` e usa
`THREE.Math.degToRad` (riga 497), alias deprecato e poi rimosso: è three r12x/r13x.

---

## 2. Quello che va tenuto, e che vale più di quanto sembri

**Il taglio non è un'immagine: è già un meccanismo.** La camera sta a quota zero
e guarda l'orizzonte (`camera.position.y = 0`, `lookAt(0,0,0)`), quindi la linea
di galleggiamento cade **sempre** a metà schermo esatta. Da lì discende che lo
sfondo CSS può spaccarsi con un hard stop al 50% e combaciare col 3D senza
sincronizzare niente. È la regola generativa del brief tradotta in geometria, e
regge da sola tutta la composizione. Questa non si tocca.

Sono in piedi e verificati:

- **due palette divise dal taglio**, non una unificata, con un accento saturo
  solo sotto la linea (`--recupero:#4FE0C4`): esattamente il §4 del brief;
- **onestà dichiarata sul modello** — la riga `#patto` ("Modello illustrativo ·
  Geometria generica · Valori normalizzati") e il commento alle righe 513–514
  ("Indice 0–100, non kW: i moltiplicatori sono autorali e un'unità fisica
  mentirebbe"). Vale doppio: è il registro della sezione 3 e la differenza fra
  un contenuto vero e un numero spacciato per misura;
- **la meccanica della dimostrazione**: rollio a due armoniche, ampiezza che
  transita smorzata (riga 492) — accendendo la stabilizzazione la nave **si
  calma, non si spegne** — pinne che contrastano in proporzione alla *velocità*
  di rollio, non all'angolo, e biella che si muove per dire che qualcosa lavora;
- **ripiego senza WebGL** già presente, con testo che spiega invece di scusarsi;
- **base d'accessibilità**: `aria-pressed` sui comandi, `role="group"` sulla
  scala del mare, Escape che chiude, `focus-visible` con outline sull'accento.

---

## 3. I difetti verificati

### 3.0 — Il taglio del titolo non è implementato
*Trovato da revisione esterna. Confermato.*

Le due copie del titolo (`.titolo.sopra` scura, `.titolo.sotto` chiara) stanno
alla stessa posizione assoluta, e la chiara è dipinta dopo: **la copre per
intero.** Nel CSS d'autore non esiste alcun `clip-path`, `mask` o `clip`:

```
grep -o -E "clip-path|-webkit-mask|mask-image|clip:"  →  1 sola occorrenza,
riga 256, dentro il bundle three.js (AnimationUtils.subclip)
```

E `header` sta a `top:0` con `padding:26px`: il titolo è nella fascia alta e non
incontra mai il 50%. Il commento alla riga 58 dichiara l'intenzione — *"il
titolo attraversa la linea e cambia colore a metà glifo"* — ma il meccanismo non
c'è. **Un commento non è una prova che il codice faccia quella cosa.**

Non è un difetto da correggere: è il primo momento-firma **da costruire**.

### 3.1 — Il peso, per la ragione giusta
Il budget è rispettato (149,4 KB gzipped di JS contro 250). Il motivo per andare
a moduli ES è un altro: **145,3 KB gzipped di API in gran parte inutilizzate**
vanno comunque scaricati, decompressi e **analizzati** prima che il primo pixel
arrivi, e quello ricade su LCP e INP. (Non "codice mai eseguito": il browser
quel codice lo valuta comunque — è esattamente il costo che il caricamento
differito toglie di mezzo.) La scena usa una manciata di classi (`Scene`,
`PerspectiveCamera`, `WebGLRenderer`, `Shape`, `ExtrudeGeometry`, `PlaneGeometry`,
`BoxGeometry`, `CylinderGeometry`, `EdgesGeometry`, 4 luci, `MeshStandardMaterial`,
`Clock`). Il guadagno atteso è sul tempo, non sul budget — e va **misurato**,
non dichiarato.

### 3.2 — La parità su mobile è dichiarata ma non c'è
Riga 167: sotto 820px `#apri-chiusura` è `display:none`. È il pulsante **"Per il
vostro prodotto"**, cioè l'unica porta verso la chiusura commerciale. Su telefono
oggi è irraggiungibile: si perde insieme il punto di Usability e la ragione
commerciale del sito. Sparisce anche `#nota` ("Trascina per ruotare"), quindi su
mobile l'unica affordance di rotazione è invisibile.

### 3.3 — `prefers-reduced-motion` spegne la dimostrazione, e la rallenta
Riga 485: `t += RIDOTTO ? 0 : dt`. Con movimento ridotto il tempo non avanza:
la nave resta **inclinata di un angolo fisso** e non rolla mai. Chi ha attivato
quella preferenza non vede la tesi del sito, vede una barca storta.

*Aggravante trovata da revisione esterna, confermata:* `S.picchi` riceve un
oggetto per fotogramma, ma la sua pulizia è `while (t - S.picchi[0].t > 10)` —
con `t` fermo a 0 **non rimuove mai niente**. L'array cresce senza limite, e
`reduce` lo scorre **per intero a ogni fotogramma**: non è solo una perdita di
memoria, è un **rallentamento progressivo**, che colpisce esattamente gli utenti
che avevano chiesto meno movimento.

### 3.4 — Bersagli tattili sotto la soglia
Riga 97: `#mare button{width:20px}`, con altezze dal 20% al 100% di 34px. Il
bersaglio più piccolo è circa **20 × 7 px** contro i 44 × 44 px del requisito:
meno di un sesto dell'area.

Segnalata anche una possibile **sovrapposizione su mobile** fra `#lettura` e
`#energia`, che sotto 820px condividono `bottom:104px`. Il conto è stretto ma
**è una previsione, non una misura**: da verificare in esecuzione prima di
correggerla.

### 3.5 — La modale è accessibile anche da chiusa
Nel file non compare né `inert`, né `hidden`, né `visibility`. Con `opacity:0` e
`pointer-events:none` il pulsante `#chiudi` **resta nel tab order**, e
`aria-modal="true"` continua a dichiarare modale una finestra chiusa. Manca
inoltre la trappola del focus, e alla chiusura il focus non torna al pulsante
che l'ha aperta.

### 3.6 — Trappole di porto verso three moderno, silenziose
- `THREE.Math` non esiste più: è `THREE.MathUtils`.
- **Gestione del colore cambiata.** Il prototipo non imposta né `outputColorSpace`
  né `toneMapping`. Da r152 i default sono diversi: colori e intensità luce
  **cambieranno aspetto al porto**, e l'attuale taratura (Hemisphere 0.85,
  Directional 1.15 e 0.45, Point 0.55 con distanza 22) va **ri-tarata guardando
  il provino**, non ricopiata.
- `computeVertexNormals()` su 1.767 vertici a frame alterni: sostenibile su
  desktop, **da misurare** su Android di fascia media prima di dichiararlo tale.

### 3.7 — La rotazione esiste solo a puntatore
Da tastiera non c'è modo di cambiare punto di vista.

### 3.8 — È una pagina, deve diventare una sezione
Tutto è `position:fixed` con `overflow:hidden` sul body. Il brief lo vuole come
**sezione 2 di cinque**, dentro un contesto che scorre. Il guscio va riscritto;
la scena no.

---

## 4. Quello che NON è ancora misurato

Dichiarato per non spacciare letture per misure:

- LCP / INP / CLS, su 4G reale e su desktop;
- FPS sostenuto e minimo, desktop e Android di fascia media;
- contrasto WCAG dei testi reali sulle due palette — in particolare
  `--acqua-tenue:#7FA3A5` sul fondo `--acqua:#071A1D`, che è il colore di quasi
  tutto il corpo del testo sotto la linea;
- comportamento reale del trascinamento su touch, e la sovrapposizione di §3.4.

Questi numeri sono **contenuto della sezione 3**, non solo controlli interni:
il brief impegna a pubblicarli. Vanno in `docs/04-MISURE.md` con data e condizioni,
e nessuno di essi va scritto sul sito prima di essere stato misurato due volte.

---

## 5. Come sono nati i due errori della revisione 1

Vale la pena scriverlo, perché sono due modi diversi di sbagliare e tornano
sempre.

**Il primo** è aver creduto a un commento. Il CSS dichiarava che il titolo
attraversa la linea; l'ho riportato fra le cose acquisite senza cercare il
`clip-path` che avrebbe dovuto realizzarlo. La regola violata sta in
`docs/04-MISURE.md`: *guarda il provino, non la statistica* — qui, non la
dichiarazione.

**Il secondo** è aver usato un numero fuori dal suo dominio. Il peso su disco è
un dato vero; usato per parlare di traffico di rete diventa falso. In
`04-MISURE.md` avevo scritto di mia mano che quei numeri non andavano usati così,
e li ho usati così due sezioni più in là. **Scrivere la regola non basta:
applicarla costa attenzione soprattutto quando il numero conferma quello che si
sperava di trovare.**
