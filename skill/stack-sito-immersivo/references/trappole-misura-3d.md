# Trappole di misura nel 3D real-time — tutte pagate, nessuna letta

Questo file non contiene ricette: quelle si trovano ovunque. Contiene i modi in
cui **una misura sbagliata sembra giusta**, che è la cosa che nessuno scrive e
che costa giornate intere.

La regola madre, dal progetto `velocity`:

> **Un metro rotto non dà errore. Dà un numero.**

Sei metriche sono state costruite e buttate su un solo progetto. Le prime
quattro davano numeri assurdi e si sono smascherate da sole. **La quinta e la
sesta davano numeri plausibili**, e su quelle ho lavorato per ore prima di
accorgermene. Sono le sole che contano davvero.

---

## 1. Il canarino: `(128,128,255)`

**Se una maschera «texel mappati» ha come mediana la normale neutra, sta
selezionando il riempimento.** Quel colore è ciò con cui *ogni* baker riempie i
texel non mappati, per costruzione. Non c'è altra spiegazione possibile.

Come mi sono ingannato: ho rasterizzato i triangoli UV per costruire la
copertura, ho misurato le mappe solo lì dentro, e ho concluso che il 66% della
carrozzeria fosse a ruvidità zero — cioè uno specchio. Era il **riempimento**:
la mesh contiene sottoscocca, interni e cavità delle carene, superfici mappate
ma **mai cotte**. Pesate per area sono tantissime, e non si vedono mai.

**Il controllo, che costa niente:** dopo ogni maschera, stampa la mediana della
normal map dentro. Con **tolleranza** — la mia usciva `128,127,255` e un
confronto per uguaglianza esatta non l'ha vista.

**La verifica vera: due maschere indipendenti che litigano.** Costruiscine una
dall'immagine ORM («non è il colore del riempimento») e una dalla normal map
(«non è la normale neutra»). Se concordano fra loro e non con la tua, è la tua
a essere sbagliata.

```
A (non-rosso nella ORM)     26.7%
B (non-neutra nella NOR)    27.6%
C (rasterizzazione UV)      56.7%   <- la mia
accordo A/B 79.4%   accordo A/C 30.7%
```

**Corollario:** non campionare mai una mappa **per vertice**. I vertici stanno
sui bordi delle isole e su un atlante sparso il texel più vicino cade nel
padding. Si campiona al **centroide del triangolo**, o si rasterizza.

---

## 2. Un'attesa in fotogrammi non è un'attesa

Un misuratore che scorreva la pagina, aspettava «18 fotogrammi» e fotografava
non era **ripetibile**: tre esecuzioni identiche davano mediana 41,2 / 4,3 /
25,7 e conteggio pixel che ballava del 100%.

Due cause, e valgono per qualunque scena viva:

- **lo scorrimento ha inerzia** (Lenis continua a frenare dopo `scrollTo`),
  quindi quanti fotogrammi passano davvero dipende dal carico della macchina;
- il metodo fotografava **con** il soggetto, lo nascondeva e rifotografava:
  fra i due scatti la scena si spostava, quindi la differenza prendeva dentro
  **il fondo che si era mosso**.

**Si aspetta una CONDIZIONE, non il tempo.** Leggi lo stato della pagina
(posizione di scorrimento, tempo della regia) e vai avanti finché non sta fermo
per qualche giro. Ripetibilità: dal 100% di varianza al 2%.

**E non confrontare due `page.screenshot()` per capire se la scena si è
fermata:** restituiscono **PNG compressi**, e due immagini quasi identiche
danno sequenze di byte diversissime. La condizione non converge mai e la misura
non finisce più. Confrontare byte compressi non è confrontare immagini.

---

## 3. Un provino può ritrarre uno stato transitorio

`autoPronta && ambientePronto` non copriva `ruota.glb`. Fino al suo arrivo, al
posto delle ruote c'erano quelle **di segnale** — `MeshBasicMaterial` con
`toneMapped: false`, cioè emettono luce propria.

Nei provini uscivano quattro dischi ciano luminosi. **Due volte** ho creduto
fossero i cerchi veri troppo specchianti e ho abbassato ruvidità e intensità
d'ambiente. Non cambiava niente: stavo correggendo un materiale che nel
fotogramma **non c'era**.

Un provino deve aspettare **tutto** ciò che compone il soggetto, non il primo
segnale di prontezza che trovi.

---

## 4. `envMapIntensity` è un rapporto, non un valore

Alzando la forza delle strisce emissive nel PMREM da 7,6 a 55 (per recuperare
l'esposizione dopo essere passato a una vernice dielettrica) ho invalidato in
un colpo la taratura di **tutti** i materiali che specchiano.

Ho abbassato l'intensità dei cerchi quattro volte — 1,7 → 1,0 → 0,28 → 0,07 —
senza capire perché non bastasse mai: **0,28 di un ambiente sette volte più
forte vale più di 1,7 di prima.**

> Quando tocchi la forza dell'ambiente, ricontrolla ogni `envMapIntensity`.
> Il numero da guardare non è l'intensità: è **il prodotto**.

**E poi non era nemmeno l'ambiente.** Con l'ambiente quasi spento un metallo può
prendere luce solo dalle luci dirette: erano le `RectAreaLight`, fredde, e da lì
veniva il ciano. La cura era la **ruvidità** (allarga il colpo speculare invece
di concentrarlo) e la **riflettanza** — su un metallo il colore base *è* la
riflettanza, e 0,74 è argento lucidato, non alluminio.

**La prova che ha sciolto il dubbio in un colpo:** dipingere il materiale
sospetto di **rosso pieno** e rendere. Se la zona diventa rossa, il materiale è
quello e le modifiche arrivano; il problema è altrove.

---

## 5. Una soglia tarata su un asset che non esiste più

Una maschera per il vetro fumé era chiavata sulla **luminanza** di
`diffuseColor`, con la soglia scelta sulla valle dell'istogramma della mappa di
colore. Poi la mappa è stata rifatta e la valle è sparita.

E `diffuseColor` vale `colore × mappa`: con una mappa bianca la maschera non
misurava più il vetro, misurava **quanto è scura la vernice scelta**. Con una
tinta scura si accendeva al 77% ovunque la superficie guardasse in alto.

**Chiava le maschere su INVARIANTI, non su asset.** Ri-chiavata sulla **quota**
— con la linea di cintura misurata, non indovinata — cambiare vernice non può
più spostare i vetri. E le quote non si scrivono a mano: si misurano dalla
scatola d'ingombro vera e si passano in uniform, o al prossimo modello i vetri
finiscono sul cofano senza che niente dia errore.

---

## 6. Difetti che spengono la scena in silenzio

- **`anisotropy` senza tangenti.** `MeshPhysicalMaterial.anisotropy` lavora
  nello spazio tangente: senza UV non si calcolano le tangenti, e senza
  tangenti three compila un materiale **che non disegna**. Nessuna eccezione,
  nessun `console.error`, scena intera nera. Il primo sintomo è stato una
  `mediana 0.0` perfettamente formata.
- **`aoMap` legge `uv1`, non `uv`.** Con un glb a un solo set di UV
  l'occlusione non compare e non dà errore:
  `if (!g.attributes.uv1) g.setAttribute('uv1', g.attributes.uv)`
- **Sostituire il materiale di un glb uccide anche `KHR_texture_transform`.**
  Con `gltfpack -vt 12` la scala delle UV finisce lì: sostituendo il materiale,
  il modello campiona **1/16** di ogni tessitura e nessuno se ne accorge.
- **`gltfpack` butta le UV senza `-kv`, e i nomi anche con `-kn`.**
- **Modificare l'albero dentro `traverse()`** non fa niente e non dà errore.
- **Backtick nei commenti dentro un template literal GLSL**: chiudono la
  stringa. Tre errori di sintassi apparentemente scollegati.
- **`transformIndexHtml` con `order: 'pre'`**: Vite riprocessa ciò che
  inserisci, e prova a risolvere uno `<script application/ld+json>` come
  modulo. Muore con `EISDIR: illegal operation on a directory, read` — un
  errore che non nomina né l'HTML né il plugin.

**Conseguenza operativa:** gli strumenti di provino devono ascoltare
`pageerror` e `console.error`. Un guasto deve **gridare**, non restituire una
statistica.

---

## 6bis. Il cancello dell'ultimo bin — e la sua eccezione

**Una mediana non vede la saturazione.** Una mappa con metà dei texel schiacciati
contro 255 restituisce una mediana perfettamente plausibile, e l'ampiezza finita
contro il soffitto non compare da nessuna parte. Su un progetto con 108 strumenti
di misura, il difetto è passato *perché misurano tutti mediane e percentili*.

Il controllo costa venti righe e va messo **prima di salvare**, non dopo. E deve
**lanciare**, non avvisare: un generatore che in silenzio produce un risultato
sbagliato è peggio del valore scritto a mano, perché quello almeno si vede.

**L'eccezione, trovata applicandolo.** La regola «un picco sull'ultimo bin è
sempre un errore» vale per un canale che porta un **campo continuo** — una
ruvidità variabile, un'altezza, un'occlusione. È **falsa** per un canale che
porta **classi di materiale**: ruvidità 0 non è un valore schiacciato, è uno
specchio; metallico 0 non è un errore, è un dielettrico, cioè quasi tutto quello
che esiste.

Alla prima applicazione il cancello ha bocciato una mappa **giusta**, proprio sui
texel di vetro e cromature che quella versione esisteva per salvare. Se l'unico
modo di farlo passare fosse stato alzare la soglia per tutti, lo strumento
sarebbe stato zittito del tutto — **e uno strumento che si può solo spegnere
viene spento**. Le soglie vanno separate per *alto* e per *basso*, e per canale,
con la ragione scritta a ogni chiamata.

## 6ter. Un criterio non separa due popolazioni che hanno lo stesso valore

Ricostruendo una mappa ORM ho deciso cosa fosse carrozzeria e cosa riempimento
guardando **la ORM stessa**: `isola = G > 8 || B > 8`. Sembra ovvio e non lo è —
un texel di **vetro** ha ruvidità ≈ 0 e metallico 0, cioè **la stessa identica
firma del riempimento** `(255, 0, 0)`. Scambiati per vuoto e appiattiti: canopy e
cromature murati, misurato come un crollo dal 17,9% al 4,0%.

> Se due popolazioni devono restare distinte, il criterio deve venire da
> **un'altra fonte**.

Qui viene dalla normal map («non è la normale neutra»), che è indipendente e
concorda al 95% con quella costruita dalla ORM.

## 6quater. Il verso del passa-alto non è quello che sembra

Un passa-alto è «originale meno sfocato». Un **σ piccolo** dà una sfocatura
vicina all'originale, quindi la differenza è piccola: **toglie di più**.
Cercando di salvare le fughe fra i pannelli abbassando σ, le stavo cancellando.

E il cancello è su **due numeri letti insieme**: la mediana dello scarto angolare
deve scendere (la banda bassa se ne va) e il **p95 deve restare alto**, perché la
coda è dove vivono fughe, prese d'aria e griglie — l'unico contenuto per cui la
mappa esiste. Guardare solo la mediana fa passare una mappa rasata.

## 6quinquies. Un registratore senza guardia produce il video di un'applicazione rotta

Il filmato dura i suoi secondi, pesa i suoi megabyte e **sembra un video**.
Quattro fotogrammi presi a 1, 8, 17 e 27 secondi erano identici — fermi sulla
prima schermata — e lo strumento non aveva detto niente.

Serve la guardia sugli errori **e** un controllo di stato a fine corsa:
`window.scrollTo` può non fare niente (uno scorrimento inerziale lo intercetta,
la corsa può essere zero, un errore può aver ucciso il ciclo). Si verifica che
la posizione finale sia davvero quella attesa.

E **la finestra di taglio non si indovina**: le fasi prima del contenuto possono
durare molto più del previsto (un clic che non trova il suo bersaglio costa il
timeout intero, e sei clic fanno mezzo minuto). Si estrae un fotogramma ogni
nove secondi su tutta la registrazione e si guarda dove comincia. Costa venti
secondi.

## 7. La disciplina, in tre righe

1. **Guarda il provino, non solo le statistiche.** Una mediana `0.0`
   perfettamente formata era una scena interamente nera.
2. **Guarda le mappe.** Il nodo più difficile della sessione si è sciolto
   esportando le tre tessiture affiancate e guardandole.
3. **Verifica il metro prima di crederci**, e quando qualcuno ti smentisce con
   un argomento verificabile, **misura invece di rispondere**. Due volte su due
   aveva ragione chi mi correggeva.

Progetto di riferimento: `velocity` — `docs/CARROZZERIA_FAIRNESS.md` e
`docs/PIANO_FOTOREALISMO.md`, su https://github.com/Villani85/velocity.
Controparte offline: [[blender]]. Ricette: `fotorealismo-webgl.md`.
