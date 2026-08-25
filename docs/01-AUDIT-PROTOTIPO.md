# Audit del prototipo — `prototipo/linea-di-galleggiamento.html`

Stato: **letto riga per riga e misurato staticamente.** Non ancora eseguito né
profilato: la distinzione fra "misurato" e "da misurare" è tenuta esplicita per
disciplina — un metro rotto non dà errore, dà un numero.

---

## 1. Che cosa è

Un file HTML solo, 569 righe, che apre con un doppio clic. Zero build, zero CDN,
zero dipendenze da risolvere. Geometria interamente procedurale: nessun modello
di terzi, nessun rischio di licenza. Il brief lo chiedeva e il prototipo già lo fa.

### Ripartizione del peso (misurata sul file)

| voce | peso | quota |
|---|---:|---:|
| bundle three.js UMD, inline in una riga sola | 589,3 KB | 84,0 % |
| font base64 dentro il CSS (4 `@font-face`) | 89,6 KB | 12,8 % |
| **codice nostro** (CSS + HTML + simulazione) | **23,1 KB** | **3,3 %** |
| **totale** | **702,0 KB** | |

Il numero che conta è l'ultimo: **il lavoro d'autore è 23 KB.** Tutto il resto è
zavorra trasportata, e si toglie senza toccare una riga di ciò che vale.

Il bundle porta l'intestazione `Copyright 2010-2021 Three.js Authors` e usa
`THREE.Math.degToRad` (riga 497), alias deprecato e poi rimosso: è three r12x/r13x.
Corrisponde esattamente ai "590 KB del prototipo" citati nel brief.

---

## 2. Quello che va tenuto, e che vale più di quanto sembri

**Il taglio non è un'immagine: è già un meccanismo.** La camera sta a quota zero
e guarda l'orizzonte (`camera.position.y = 0`, `lookAt(0,0,0)`), quindi la linea
di galleggiamento cade **sempre** a metà schermo esatta. Da lì discende che lo
sfondo CSS può spaccarsi con un hard stop al 50% e combaciare col 3D senza
sincronizzare niente. È la regola generativa del brief tradotta in geometria, e
regge da sola tutta la composizione. Questa non si tocca.

Sono già in piedi, e vanno portati di là così come sono:

- **titolo che attraversa la linea e cambia colore a metà glifo** — due copie
  sovrapposte, `.sopra` scuro e `.sotto` chiaro (righe 58–64, 181–184);
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
  scala del mare, `aria-modal` sul foglio di chiusura, `focus-visible` con
  outline sull'accento, Escape che chiude.

---

## 3. I difetti, in ordine di quanto costano

### 3.1 — Il peso (Usability, 30%)
589 KB di UMD inline. Il brief fissa **< 250 KB gzipped** di JS totale. La cura è
nota e non è negoziabile: three a moduli ES + Vite, si importa solo ciò che si usa.
La scena usa una manciata di classi (`Scene`, `PerspectiveCamera`, `WebGLRenderer`,
`Shape`, `ExtrudeGeometry`, `PlaneGeometry`, `BoxGeometry`, `CylinderGeometry`,
`EdgesGeometry`, 4 luci, `MeshStandardMaterial`, `Clock`).

### 3.2 — La parità su mobile è dichiarata ma non c'è (Usability)
Riga 167: sotto 820px `#apri-chiusura` è `display:none`. È il pulsante **"Per il
vostro prodotto"**, cioè l'unica porta verso la chiusura commerciale. Su telefono
oggi è irraggiungibile: si perde insieme il punto di Usability e la ragione
commerciale del sito. Sparisce anche `#nota` ("Trascina per ruotare"), quindi su
mobile l'unica affordance di rotazione è invisibile.

### 3.3 — `prefers-reduced-motion` spegne la dimostrazione (Usability + a11y)
Riga 485: `t += RIDOTTO ? 0 : dt`. Con movimento ridotto il tempo non avanza:
la nave resta **inclinata di un angolo fisso** e non rolla mai. Chi ha attivato
quella preferenza non vede la tesi del sito, vede una barca storta. La regola di
casa è che il movimento ridotto si onora **dentro** l'esperienza — meno moto
autonomo, non meno contenuto. Serve una versione a stati (prima/dopo confrontabili)
invece del congelamento.

### 3.4 — Trappole di porto verso three moderno (tecniche, silenziose)
- `THREE.Math` non esiste più: è `THREE.MathUtils`.
- **Gestione del colore cambiata.** Il prototipo non imposta né `outputColorSpace`
  né `toneMapping`. Da r152 i default sono diversi: colori e intensità luce
  **cambieranno aspetto al porto**, e l'attuale taratura (Hemisphere 0.85,
  Directional 1.15 e 0.45, Point 0.55 con distanza 22) va **ri-tarata guardando
  il provino**, non ricopiata.
- `computeVertexNormals()` su 1.767 vertici a frame alterni: sostenibile su
  desktop, **da misurare** su Android di fascia media prima di dichiararlo tale.

### 3.5 — Accessibilità oltre la base (Usability, verso il 9)
- La rotazione della camera è **solo a puntatore**: da tastiera non esiste modo
  di cambiare punto di vista.
- Il foglio di chiusura è `aria-modal` ma **senza trappola del focus**: il Tab
  esce dietro, e alla chiusura il focus non torna al pulsante che l'ha aperto.

### 3.6 — Struttura: è una pagina, deve diventare una sezione
Tutto è `position:fixed` con `overflow:hidden` sul body. Il brief lo vuole come
**sezione 2 di cinque**, dentro un contesto che scorre. Il guscio va riscritto;
la scena no.

---

## 4. Quello che NON ho ancora misurato

Dichiarato per non spacciare letture per misure:

- LCP / INP / CLS, su 4G reale e su desktop;
- FPS sostenuto e minimo, desktop e Android di fascia media;
- peso trasferito effettivo (gzip/brotli) invece del peso su disco;
- contrasto WCAG dei testi reali sulle due palette — in particolare
  `--acqua-tenue:#7FA3A5` sul fondo `--acqua:#071A1D`, che è il colore di quasi
  tutto il corpo del testo sotto la linea;
- comportamento reale del trascinamento su touch;
- se il gate Mobile Excellence (Google ≥ 70/100) passa.

Questi numeri sono **contenuto della sezione 3**, non solo controlli interni:
il brief impegna a pubblicarli. Vanno in `docs/04-MISURE.md` con data e condizioni,
e nessuno di essi va scritto sul sito prima di essere stato misurato due volte.
