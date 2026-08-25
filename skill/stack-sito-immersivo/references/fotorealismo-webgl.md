# Fotorealismo real-time in WebGL / three.js

Come rendere fotorealistica una scena three.js **nel browser** (rasterizzazione + IBL + fake
screen-space, budget 16 ms/frame) — l'opposto del path tracing offline di [[blender]] (Cycles,
minuti/frame). **Il metodo si trasferisce, il modello di costo si inverte.** Scritto per
**three.js puro** (come il progetto `velocity`, three r0.185, niente R3F); gli equivalenti
R3F/drei sono annotati fra parentesi.

Riferito a un'auto, ma vale per ogni superficie lucida. Molte cose qui `velocity` **le fa già**:
lo dico esplicitamente e indico il **livello successivo**, non le basi.

## 0. La legge (o è un disegno tecnico)
Un `MeshPhysicalMaterial` senza **env map** non ha niente da riflettere e senza **tone mapping**
non ha il rolloff dei bright → sembra un disegno tecnico colorato. Minimo vitale:
`renderer.outputColorSpace = SRGBColorSpace` + `renderer.toneMapping = ACESFilmicToneMapping` +
`scene.environment = <PMREM>`. **velocity ce l'ha già** (ACES, exposure 1.0, PMREM da scena e da
panorama). Prossimo livello: valutare **AgXToneMapping** (r0.185 ce l'ha) — rolloff più morbido e
**coerente col look Blender/AgX** offline; dopo lo switch ricontrolla i bright emissivi (l'AgX li
smorza → alza `emissiveIntensity`). Tester A/B ACES vs AgX vs NeutralToneMapping (showroom).

## 1. La verità sulla vernice: è un sistema accoppiato
Il difetto "riflessi a macchia molle invece che righe che corrono" ([[carrozzeria-riflesso-e-zebra]])
in WebGL nasce da **tre cose accoppiate**, non da una:

1. **Il clearcoat è troppo ruvido.** `velocity` è partito da `clearcoat 1 / clearcoatRoughness
   0.028` (specchio) ed è **arretrato a `0.70 / 0.15–0.22` ("SATINATA")** per gusto. È una scelta
   legittima, ma **costa la riga che corre**: a 0.15 di ruvidità il riflesso si sfoca in macchia.
2. **Le normali ondeggiano** (modello da poche viste): uno specchio su normali ondulate mostra ogni
   increspatura → probabilmente è *per questo* che si è arretrati sul clearcoat. Prima si
   **misurano** (zebra + waviness, §9), poi si può permettere lo specchio.
3. **Nell'ambiente non ci sono strisce nette** da riflettere (§2).

**Lo sblocco è nell'ordine**: *raddrizza le normali → allora puoi alzare il clearcoat (roughness
≤0.05) → allora le strisce danno la riga che corre*. Cambiare solo uno dei tre non basta — è la
lezione di `ab_liscia.jpeg` (levigato ma ancora macchia, perché mancavano le strisce).

> **METRO ROTTO (pagato il 2026-08-24).** Ho provato a misurare la waviness binando la componente
> verticale delle normali della fiancata e contando i cambi di segno: dava **~45 "ondulazioni"** su
> tutti i glb (grezzo, liscia, l40) e **non scendeva** nemmeno applicando un fairing Taubin che
> *sposta davvero* i vertici (media ~9 mm, max ~14 cm). Il numero era un **pavimento di rumore** (il
> segnale è quasi-zero → i cambi di segno sono jitter di binning), non una misura del difetto. E il
> "0" ottenuto dal vivo era **corruzione** della mesh quantizzata, non levigatura. Due numeri belli,
> entrambi falsi ([[metriche-vanno-verificate]]). **Non fidarsi del conteggio vertex-normale.**
> Il metro affidabile per la fairness della carrozzeria è la **zebra su un render**: si mette un
> ambiente a bande e si guarda se le bande riflesse restano continue o si spezzano (è ciò che fa
> l'occhio del giurato). La curvatura si può misurare bene solo con un profilo 2D per scanline
> (fit + seconda derivata), non con le normali per-vertice binnate. Da rifare con quel metodo.
Parametri vernice metallizzata reali: `metalness 0` (la scaglia la fa il clearcoat) o `0.9`,
`roughness 0.28–0.4`, `clearcoat 1`, `clearcoatRoughness 0.02–0.1`; flake = normal ad alta
frequenza + micro-variazione di `roughnessMap` (±0.05). Perla: `iridescence`, `iridescenceIOR 1.3`,
`iridescenceThicknessRange [100,400]`.

## 2. Le strisce che si riflettono davvero
La riga sul fianco è quasi tutta **env map**, non luce diretta. Due modi in three puro:
- **Bake di piani emissivi nel PMREM** (l'equivalente vanilla di drei `<Lightformer>` dentro
  `<Environment>`): costruisci una scenetta con piani `MeshBasicMaterial` emissivi **lunghi e
  stretti** (le softbox 3–9 m), poi `pmrem.fromScene(scenaStrisce, 0, 0.1, 200)` → `scene.environment`.
  Così le strisce **appaiono come softbox riflesse** nel clearcoat anche dove le luci non arrivano.
- **RectAreaLight** (già usata in `velocity`): con un clearcoat liscio la sua area si riflette come
  forma luminosa reale (LTC). Serve `RectAreaLightUniformsLib.init()`, non fa ombra, solo su
  Standard/Physical. Falle **lunghe** e mettile lungo i fianchi.
- Leva gratis: `scene.environmentRotation.y` per far scorrere la riga sul cofano **senza spostare
  le luci** (`velocity` non la usa ancora).
Regola di lettura: la striscia si vede **per contrasto** — chiara su ambiente scuro. Su fondo chiaro
non stacca.

> **LE STRISCE, FATTE (2026-08-24).** Implementate in velocity (`Panorama.ts`,
> `ambienteConStrisce`): il panorama diventa una **sfera rovesciata** (`BackSide`, `MeshBasic`) e
> ci si aggiungono **pannelli emissivi lunghi e stretti** — 12x0,55 sui due fianchi a quota 3,1 e
> 7x0,4 sopra — poi `pmrem.fromScene(s, 0, 0.1, 200)`. Il rapporto conta: un rettangolo largo
> torna a fare la macchia. Misurato: luce sull'auto da 104,6 a **118,7** e scuri da 7,4% a **4,0%**.
> Funziona SOLO come terzo passo: prima normali raddrizzate, poi clearcoat nitido (0,88/0,045).
>
> **MONTARE UN PEZZO GENERATO (una ruota) — trappole pagate:** una funzione che *normalizza*
> l'asse maggiore collassa il pezzo a fattore zero (invisibile, nessun errore): serve un caricatore
> grezzo. **Non clonare le geometrie cuocendoci `matrixWorld`**: con geometrie quantizzate la
> bounding box torna VUOTA mentre i vertici ci sono — si clona l'OGGETTO. **L'asse del mozzo si
> misura** dalla scatola (l'asse sottile), non si indovina. **Gomma e cerchio sono una mesh sola**:
> si dividono per raggio (>78% = pneumatico). Le **texture del generatore si buttano** (40 MB con
> la luce cotta dentro): si tiene la geometria e si vestono coi materiali del progetto.

> **NON MODIFICARE L'ALBERO DENTRO `traverse`** (pagata il 2026-08-24, ore perse). Aggiungere un
> figlio a una mesh dentro `scena.traverse(...)` fa visitare a three anche il pezzo appena creato:
> la logica gira su se stessa e **non succede niente**, senza errori. Nel caso reale: una divisione
> per raggio che a freddo separava 9.597 triangoli di pneumatico da 19.085 di cerchio, in app
> lasciava tutto in un materiale solo. Cura: **raccogliere in un array prima, modificare dopo.**
> E' lo stesso genere di difetto della bounding box vuota su geometria quantizzata: il codice e'
> giusto, il momento in cui gira no.

## 3. Riflessi oltre l'IBL
- **Pavimento planare** (già: `Riflesso.ts`): three core `Reflector` / (drei `<MeshReflectorMaterial>`
  con `blur`, `mixStrength`, `depthScale`, fade con la distanza). È il "pavimento da showroom" ed è
  quasi sempre ciò che àncora l'auto — verifica che il tuo `Riflesso` sia alla qualità di un
  `MeshReflectorMaterial` (blur+fade), non solo uno specchio secco.
- **FARE UN PAVIMENTO BAGNATO** quando il pavimento e' una fotografia: non si accende un piano
  vero (se ne avresti due), si fa **uscire il riflesso planare** oltre il soggetto. Tre numeri, e
  il terzo e' quello che conta: raggio del disco di ritaglio molto piu' largo (e il LATO del piano
  di conseguenza, se no si tronca), `forza` su e `sfocatura` giu', e soprattutto **l'esponente di
  Fresnel da ~4 a ~2**. Con esponente alto il riflesso esiste solo a incidenza radente e da una
  camera che guarda il pavimento dall'alto **sparisce**: una superficie bagnata riflette piu' di
  una asciutta proprio perche' il suo Fresnel e' meno ripido. Ricordarsi che lo stesso esponente
  puo' vivere in DUE punti (il piano del riflesso e lo specchio dentro il materiale).

- **SSR/SSGI** (`realism-effects`): riflessi/GI in screen-space. **Sconsigliato per il target 60fps**:
  dimezza gli FPS su GPU medie, riflette solo ciò che è a schermo (perde i fianchi/cielo), e la
  libreria è di fatto **non mantenuta**. Un buon PMREM + planare batte l'SSR a metà costo.

> **SORGENTI CHE NON SI VEDONO: tre cause, tutte silenziose** (pagate su velocity 2026-08-24).
> Un anello LED su un podio non compariva mai. (1) **`RingGeometry` ha la normale su +Z**: una
> rotazione di +90 gradi su X la porta a puntare IN BASSO e con `FrontSide` la camera lo elimina
> dal culling — si vedeva solo nel riflesso planare, che guarda dal basso. Cura: `DoubleSide`.
> (2) **manca `toneMapped: false`**: ACES ricomprime il moltiplicatore e la sorgente torna sotto
> la soglia di bloom. In lineare un ambra x2,6 ha solo il rosso che sfiora una soglia a 2,60.
> (3) **un altro pezzo la copriva esattamente** (stesso raggio): far rientrare il piano di due
> centimetri fa sporgere la luce come un labbro. Nessuna delle tre da' errore.
>
> **VERNICE SCURA = STRISCE PIU' FORTI.** Portando la tinta da quasi bianca a quasi nera, il metro
> della luce sul soggetto e' crollato (mediana 17, **42% di pixel scuri**: silhouette). Con una
> tinta scura le strisce sono l'UNICA cosa che racconta la forma, perche' il colore non
> restituisce piu' niente: alzata `forza` da 3,0 a 5,2 → mediana 36, scuri 17%. E' la stessa
> sequenza accoppiata, vista dal lato opposto.
>
> **UNA BARRA LUMINOSA E' UNA QUESTIONE DI FORMA, non di codice.** Su una coda **a punta**
> (streamliner) un piano costruito resta dentro la carena o di taglio, invisibile da ogni angolo,
> a qualunque quota: oltre i tre quarti di lunghezza la carena e' piu' stretta della barra. Le
> barre luminose dei riferimenti stanno su posteriori **verticali**. Su una coda affusolata la
> luce si dipinge nella **mappa emissiva**, non si appoggia come geometria.

## 4. Occlusione e contatto a terra ("incollato" vs appoggiato)
- **AO**: `velocity` usa `GTAOPass` core (soggetto a **aloni** ai bordi di profondità). Upgrade:
  **N8AO** (`n8ao`, `N8AOPass`) — hemisphere sampling con denoise spaziale+temporale, niente aloni,
  half-res + preset di qualità = costo prevedibile. Stesso look o meglio, spesso a costo inferiore.
- **Ombra di contatto**: l'auto è **statica** sotto lo scroll → conviene un'ombra **accumulata/
  cotta** (drei `<AccumulativeShadows>` o un piano cotto offline) invece dell'ombra PCF live: più
  pulita e più economica. Ombra live solo per ciò che si muove (ruote, luce che passa).

> **FARE LA NOTTE: si abbassa lo SFONDO, non l'esposizione.** `scene.backgroundIntensity`
> tocca solo la fotografia dietro; `scene.environmentIntensity` e' cio' che ILLUMINA i materiali.
> Separarle da' una notte vera (sfondo giu', soggetto leggibile); abbassare
> `toneMappingExposure` le abbassa entrambe e da' una **foto scurita**. Su velocity: background
> 1,0 → 0,62 + esposizione 1,00 → 0,82.
> **Il contraccolpo da ricompensare**: ogni passo che scurisce spegne anche i **riflessi** (che
> passano per il tone mapping) ma **non** le sorgenti con `toneMapped: false`. Quindi strisce
> 3,0 → 7,6 e LED del podio 2,6 → 5,2, mentre la tinta della vernice e' dovuta RISALIRE
> (0,055 → 0,105: a 0,055 il metro dava 69% di pixel scuri, cioe' la vettura spariva).
> **Regola: una sorgente dichiarata resta, un riflesso va ricompensato.**
> Per il colore, se il grade non ha manopole: **temperatura come guadagno incrociato**
> (R +x, B -x, G a meta') non sposta la luminanza, e **saturazione** leggermente sotto 1 fa
> risaltare per contrasto cio' che e' acceso.

## 5. Post-processing (l'ordine conta) — quello che velocity ha già
Catena giusta (WebGL classico): `RenderPass` → **AO** (N8AO/GTAO, input HDR lineare, presto) →
[SSR] → **Bloom** (`UnrealBloomPass`, soglia ~0.85–1.0, intensità bassa, o pmndrs `mipmapBlur`) →
DoF (solo hero) → CA/Vignette/Grain (dosi minime) → **ToneMapping ULTIMO** → **SMAA/TAA** in display
space. `velocity` ha `MSAA HalfFloat → RenderPass → GTAO → UnrealBloom(0.34,0.20,2.60) → SMAA →
OutputPass → grade`: corretto (l'`OutputPass` fa il tone mapping e consuma `renderer.toneMapping`; il
grade va **dopo**). **Trappola già documentata**: dentro un `EffectComposer`, `antialias:true` sul
renderer non fa niente → l'AA lo fa l'MSAA del target + SMAA.

## 6. Aliasing e scintillio speculare (la vernice alias-a male)
`velocity` ha già un **specular-AA** (`Nitidezza.ts`, `antialiasSpeculare` alza la clearcoatRoughness
dove la normale varia — approccio Toksvig). Completalo con:
- `texture.anisotropy = renderer.capabilities.getMaxAnisotropy()` su color/normal/roughness (ora è
  **hardcoded a 8**: su molte GPU il max è 16, e non è applicato a tutte le mappe).
- **mipmap** puliti su normal+roughness; TAA se serve smorzare ancora lo shimmer in movimento.

## 7. Materiali che mancano (upgrade di ricchezza)
- **Vetro fisico**: `transmission 1`, `roughness 0–0.05`, `ior 1.5`, `thickness 0.08+`,
  `attenuationColor 0xd8f2ff`, `attenuationDistance ~4`, opz. `dispersion 0.06` (r167+). Costoso
  (render target di trasmissione) ma è il vetro vero, non un finto scuro.
- **Perla/candy**: `iridescence` + `iridescenceThicknessRange`.
- **Metallo spazzolato** (trim/cerchi): `anisotropy 0–1` + `anisotropyRotation` (r147+).
- **Sheen** per wrap opachi/velluto interni.

> **IL BUG PIU' SUBDOLO: le UV schiacciate a 1/16.** `gltfpack -vt 12` quantizza le texcoord a
> 12 bit in un attributo u16 normalizzato (4095/65535 = **0,0625**) e mette il fattore di scala in
> **`KHR_texture_transform`** sul materiale del glb. Se l'app **sostituisce quel materiale con uno
> suo** (cosa normalissima: si costruisce un `MeshPhysicalMaterial` e ci si attaccano le proprie
> texture), la trasformazione se ne va col materiale e **l'oggetto campiona il 6% in basso a
> sinistra di ogni texture**. Il file e' formalmente corretto; il risultato no. Sintomi: mappe che
> «perdono materia», emissive che non si accendono, maschere UV che non intersecano niente.
> Cura: `-vtf` (texcoord float) invece di `-vt N`, e se il danno e' gia' nel file riportare le UV
> a scala (`u * 65535/4095`; in Blender V e' capovolta: `1 - (1-v) * 65535/4095`).
> **Regola: se sostituisci il materiale di un glb, verifica le UV che arrivano davvero.**

## 8. Asset e performance (60fps su mid-range = criterio Awwwards)
- **KTX2/Basis** (`KTX2Loader` + `GLTFLoader.setKTX2Loader`): le webp attuali si decomprimono a RGBA
  pieno in VRAM; KTX2 resta compresso sulla GPU → taglia memoria con 22 luci + riflesso + grade.
- glb: meshopt (già) e/o Draco; per 460k tri valuta merge dei draw call.
- **Budget**: PMREM + planare + N8AO half-res + ombra cotta battono SSGI + PCSS live a metà costo.
- **Fissa il tier di qualità** quando misuri: in headless Chromium disegna in software (SwiftShader)
  e il gestore di qualità spegne da solo riflesso/AO/post → screenshot plausibili ma falsi
  ([[chromium-headless-disegna-in-software]]). Verifica la GPU via `WEBGL_debug_renderer_info` (NON
  deve dire "SwiftShader") e lancia con `--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist`
  (è ciò che fa già `strumenti/uno.mjs`).

## 9. Misurare (numeri, non intuizioni)
- **Zebra + waviness delle normali** in WebGL: pronto in `velocity/strumenti/misura_normali.mjs`
  (Playwright: apre la scena viva, trova la mesh `AUTO`, bina le normali della fiancata lungo la
  lunghezza e stampa `waviness_rms` + `ondulazioni`). Stessa logica di [[blender]] `references/08`.
  Se la riga riflessa ondeggia, ondeggiano le normali ([[carrozzeria-riflesso-e-zebra]]).
- **Il metro affidabile è VISIVO: `velocity/strumenti/zebra_render.mjs`** — mette la vernice a
  specchio (clearcoat 0.02, `normalScale=0` per isolare le normali del MODELLO dal normal map) e
  fotografa: se il riflesso scorre liscio la fiancata è fair, se **si increspa/bugna** le normali
  ondeggiano. Fatto su velocity (2026-08-24): il riflesso è **grumoso** → superficie non fair
  confermata (origine: modello Tripo da 4 viste). Nota: la **regia dell'app ri-applica l'ambiente
  ogni frame**, quindi lo swap di `scene.environment` a bande non tiene (tiene il materiale a
  specchio); per una zebra pulita ripetibile serve un piccolo hook di debug DENTRO l'app.
- **Pagina di collaudo isolata** (aggiunta a velocity): `collaudo.html` + `src/collaudo.ts` — carica
  QUALSIASI glb (`?glb=/modelli/x.glb&vista=lato|tre-quarti`) in una scena controllata (env a bande +
  vernice a specchio + normal map azzerata, ruote/vetri nascosti) con OrbitControls, per l'A/B della
  fairness fra il modello attuale e un candidato di `leviga.mjs`. **Funziona, ed e' ripetibile.**

  **RISULTATO (2026-08-24)**: la zebra sul modello attuale mostra bande **marmorizzate, spezzate,
  arricciate** su tutta la fiancata = superficie non fair, confermato. Il candidato `leviga.mjs`
  (Taubin, 25 iterazioni) da' bande **piu' larghe e continue** su cofano e fiancata **mantenendo la
  forma** (bounding box identica al millesimo: 1.00010 -> 1.00052) — ma restano increspature su
  parafango posteriore e montante: la levigatura migliora, non basta da sola.

  **TRE trappole pagate per far girare questo collaudo** (in ordine di quanto tempo hanno rubato):
  1. **`MSYS_NO_PATHCONV=1` — la vera causa.** Git Bash converte l'argomento `/modelli/auto2.glb` in
     `C:/Program Files/Git/modelli/auto2.glb` prima di passarlo a node: la pagina chiedeva un file
     inesistente e il loader diceva `TypeError: Failed to fetch`. Sette tentativi buttati a
     incolpare Vite. **Un argomento che inizia con `/` va sempre protetto.**
  2. **`optimizeDeps.include`** con gli import profondi di three (`three/examples/jsm/...`) +
     `server.warmup`: senza, alla prima scoperta Vite manda un «optimized dependencies changed.
     reloading» che **riparte la pagina a meta' caricamento** e uccide il fetch. Il `full-reload`
     viaggia solo sul websocket di `@vite/client`: gli strumenti lo servono vuoto
     (`p.route('**/@vite/client', ...)`), come fanno gia' tutti gli altri tool del repo.
  **MISURATO il 2026-08-24, tre interventi provati con la zebra:**
  - **Fairing Taubin (`leviga.mjs`, 25 iter)**: bande piu' larghe e continue, **forma intatta**
    (bbox identica al millesimo). Migliora **ma non basta**: restano increspature su parafango
    posteriore e montante.
  - **Precisione normali oct8 -> 12 bit** (`gltfpack -cc -vp 16 -vn 12`, invece di
    `gltf-transform meshopt` che **cabla oct8** e non si puo' configurare): a parita' di geometria
    la differenza misurata e' **1.3 %** (RMS 3.34/255, energia alta frequenza 47.6 -> 47.0).
    In teoria oct8 vale ~0.28 gradi di errore (raddoppiato nel riflesso); in pratica **e' marginale**
    perche' il difetto dominante e' la lumpiness a bassa frequenza, cento volte piu' grande.
    Va fatto lo stesso (bordi delle bande piu' netti, e **file piu' leggero**), ma non e' la cura.
  - **Difetto di pipeline trovato**: `strumenti/liscia.mjs` parte da `public/modelli/auto2.glb`,
    cioe' da un file **gia' compresso a 8 bit** invece che dalla sorgente float
    `asset/auto/auto2_intera.glb`: ogni giro di levigatura **accumula** errore di quantizzazione.
    Partire sempre dal float. (Bonus misurato: ripaccando dal float con gltfpack il corpo pesa
    **390 kB contro i 683 kB** spediti oggi.)

  **LA CURA, PROVATA E MISURATA (2026-08-24): quad remesh + subdivision.**
  Percorso: `tripo model import <sorgente float>` (0 crediti) -> `tripo model convert <id> --format
  FBX --quad --face-limit 14000` (10 crediti, ~13.3k quad puliti, solo 4 triangoli) -> import FBX in
  Blender -> **Subdivision Catmull-Clark 1 livello** -> export glb -> `gltfpack -cc -vp 16 -vn 12`.

  | variante | residuo @25mm | @50mm | p95 @25mm | peso |
  |---|---|---|---|---|
  | attuale (65k tri) | 0.840 mm | 1.103 mm | 4.165 mm | 683 kB |
  | quad grezzo 13k | — (troppo rada) | 1.623 mm | — | 590 kB |
  | **quad+subdiv compresso** | **0.404 mm (-52%)** | **0.763 mm (-31%)** | **1.389 mm (-67%)** | **494 kB** |
  | **CANDIDATO FINALE (con UV)** | **0.341 mm (-59%)** | — | **1.231 mm (-70%)** | **636 kB** |

  **Candidato spedibile**: `public/modelli/_finale_c.glb` — 61.306 vertici, attributi
  `POSITION, NORMAL, TEXCOORD_0` (UV trasferite dall'originale, quindi le texture esistenti
  `auto2_col/orm/nor/emi.webp` continuano a indicizzare), mesh nominata `AUTO` come si aspetta
  `Materiali.ts`. **TRAPPOLA**: `gltfpack` **scarta le UV** se nessun materiale le usa —
  serve **`-kv`** (keep source vertex attributes). Senza, il file esce con solo POSITION+NORMAL e
  le texture si spalmano a caso. Verificare SEMPRE gli attributi dopo la compressione.

  Vince su fairness E su peso. Alla zebra: bande **piu' larghe e continue** su cofano e fiancata.
  Restano da sistemare: **dettaglio perso** (presa d'aria anteriore, bordi canopy) -> serve
  **shrinkwrap** sull'originale + re-smooth; e un'increspatura residua sul passaruota posteriore.
  Poi re-unwrap + re-bake delle mappe (le UV del remesh non sono quelle originali).

  **SHRINKWRAP: PROVATO E SCARTATO (misurato).** Il ciclo canonico dei manuali
  (cage quad -> shrinkwrap PROJECT sull'originale -> corrective smooth -> subdiv, due giri con
  fattori 0.60/14 e 0.45/8) **recupera la silhouette** (dimensioni tornate 1.0x0.409x0.219 contro
  1.0x0.411x0.219 dell'originale) **ma distrugge la fairness**: residuo **2.608 mm contro 0.429**,
  cioe' **sei volte peggio** — lo shrinkwrap ririporta la cage sulle increspature dell'originale e
  il corrective smooth non le toglie. Su una mesh generata da poche viste **non c'e' dettaglio buono
  da recuperare**: c'e' solo rumore. Quindi: **niente shrinkwrap**, e il dettaglio si rimette con una
  **normal map** — che in three.js NON tocca il riflesso del clearcoat (usa `clearcoatNormalMap`
  separato, e in sua assenza la normale geometrica). Geometria fair + dettaglio in mappa.
  Se il remesh ha perso le UV, invece di ri-cucire e ri-cuocere tutte le mappe conviene
  **trasferire le UV** dall'originale (Blender **Data Transfer**, `use_loop_data`,
  `data_types_loops={'UV'}`, `loop_mapping='POLYINTERP_NEAREST'`): le texture esistenti continuano
  a indicizzare giusto. E' lento (minuti su 65k->53k), va lanciato e atteso.

  **IL RE-TEXTURING E' IL COLLO DI BOTTIGLIA (misurato il 2026-08-24).** Il remesh vince sulla
  fairness (0.341 contro 0.840 mm) ma **non e' stato spedito**: il metro della luce sull'auto
  (`carrozzeria.mjs`) e' sceso del 25-35% (hero 95.9 -> 77.4, orbita 104.6 -> 87.9) perche' le UV
  rifatte con Smart UV Project e le mappe cotte a 2048 non hanno la cura di quelle originali.
  Regola: **il remesh e' inutile se non sai ri-testurizzare almeno alla pari.** Trappole del bake:
  - **esportare la sola mesh della carrozzeria fa sparire i pezzi accessori** (fari, ottiche) e
    con loro gli elementi emissivi: esportare TUTTE le mesh dell'oggetto;
  - un bake **DIFFUSE su materiale metallico torna quasi nero** (i metalli non hanno diffusa):
    azzerare il Metallic prima di cuocere il colore, o esce 4x scuro;
  - ruvidita'/metallo si cuociono **spingendo il canale nell'Emission e cuocendo EMIT**: il
    valore passa esatto senza essere interpretato da un BSDF;
  - il **Data Transfer delle UV** da' UV valide ma **macchie scure** sulle texture.
  E prima di toccare un repo con git: `git status` — parte di cio' che sembra tuo puo' essere
  lavoro non committato di qualcun altro.

  **IL METRO GIUSTO (dopo tre sbagliati).** Falliti perche' dominati dal rumore o dalla domanda
  sbagliata: (a) conteggio ondulazioni su normali per-vertice; (b) energia ad alta frequenza sul
  render — misura i bordi delle bande, nettissimi in tutte le varianti; (c) frammentazione delle
  bande per scanline — il numero di bande lo decide l'AMBIENTE, non la superficie.
  Quello che funziona: **residuo da fit quadrico locale sulla GEOMETRIA** a raggio fisso
  (`strumenti/fairness.mjs`): piano tangente + `w = a+bu+cv+du2+euv+fw2`, RMS dei residui in mm.
  Assorbe la curvatura legittima, niente pavimento di rumore, e concorda con l'occhio.
  Bersaglio "product film": **< 0.1 mm a R=25mm** (siamo a 0.40, l'attuale era 0.84).

  **La cura vera (dalla ricerca, non ancora provata)**: la fairness e' una proprieta' della
  **derivata seconda**, e su una triangolazione con lati da 5.8 a 51.9 mm il rumore di
  campionamento domina — un campo di normali fair **non e' rappresentabile su questa mesh**.
  Serve **quad remesh** (Tripo `model convert --quad --face-limit 12000` gia' disponibile, oppure
  QuadriFlow in Blender, o Quad Remesher) -> **shrinkwrap** sull'originale -> **smooth** ->
  **subdivision**, poi **re-bake** delle mappe. Nota per la vernice: il clearcoat in three.js usa
  `clearcoatNormalMap` **separato** e in sua assenza la normale **geometrica** — quindi cuocere il
  dettaglio in una normal map NON sporca il riflesso del clearcoat (ed e' proprio per questo che
  la geometria va risolta a monte, non mascherata).

  3. **Niente retry in pagina**: un reload distrugge l'intero contesto JS, `setTimeout` compreso —
     il rimedio sta nella CONFIGURAZIONE, non nel codice della pagina. E l'attesa si fa con
     `waitForFunction`, non con un polling di `evaluate` (che muore con "Execution context was
     destroyed").
- **L'esposizione era il difetto originale (confronto con The Watch), ora è a posto**: il metro
  `strumenti/carrozzeria.mjs` (mediana/90°/scuri della sola auto, per differenza) dà mediana
  95–121 (era 50) e scuri <7% → niente più silhouette. Il gap residuo "da vicino non product-film"
  è **superficie/riflessi**, non luce.
- **TRAPPOLA (pagata il 2026-08-24)**: `auto2.glb` usa `KHR_mesh_quantization`. **NON** fare il
  fairing scrivendo posizioni nel buffer quantizzato della scena viva (`position.setXYZ` su
  attributo Int → la mesh si corrompe, l'auto sparisce, e la waviness misura "0" fasulla). Il
  fairing va fatto sulla **mesh sorgente de-quantizzata** nella pipeline asset (gltf-transform:
  `dequantize` → smoothing Taubin lieve → ricalcolo normali → nuovo glb), non a runtime
  ([[metriche-vanno-verificate]]). Misurare va bene (sola lettura); scrivere no.
- **FPS su mid-range** sostenuto (min, non medio) durante lo scroll: sotto 50 = jank.
- **Non fidarti dell'aggregato**: passa il righello su un campione noto prima
  ([[metriche-vanno-verificate]]); e attento al `CanvasTexture` che costa 110 ms/frame di sync —
  cura = `DataTexture` ([[tela-2d-verso-webgl-stallo]]).

## 10. La lista upgrade per `velocity` (dal codice reale)
1. **AgX/Neutral** in A/B contro l'ACES attuale (coerenza col look Blender + rolloff bright).
2. **Il sistema accoppiato della vernice** (§1): misura normali → clearcoatRoughness ≤0.05 → strisce.
3. **Strisce nel PMREM** (§2) e uso di `environmentRotation` per piazzare la riga sul cofano.
4. `anisotropy = getMaxAnisotropy()` su tutte le mappe (ora 8 fisso).
5. **N8AO** al posto del GTAO core (niente aloni).
6. **Ombra di contatto cotta/accumulata** (auto statica) invece della PCF live.
7. **Vetro con `transmission`/`attenuationColor`**; perla con `iridescence`; trim con `anisotropy`.
8. **KTX2** per la memoria GPU.
9. Verificare che `Riflesso.ts` sia alla qualità di un MeshReflector (blur+fade), non specchio secco.

Torna allo stack: [[stack-sito-immersivo]]. Controparte offline (stesse regole, costo invertito):
[[blender]] e [[skill-blender-fotorealismo]].


---

# I NUMERI FISICI, DA FILAMENT — cosi' non si indovinano

La documentazione PBR di Filament (Google) e' il riferimento canonico, e
contiene esattamente i valori che qui erano stati cercati a mano. Tre che
hanno gia' cambiato una decisione su `velocity`:

**Un dielettrico** tiene il metallico a zero o quasi, e la riflettanza a **0,5
lineare — cioe' il 4%** — quando non c'e' un valore migliore. **Non si scende
mai sotto 0,35 lineare (il 2%).** Su `velocity` `vernice()` aveva
`specularIntensity: 0.6`, che porta F0 al 2,4%: sotto il pavimento, in
territorio «materiale che non esiste». E' cio' che ammazzava il Fresnel bianco,
che su una vernice scura e' l'unica cosa che fa vedere la superficie.

**Un metallo** usa il colore base come colore speculare E riflettanza insieme,
e va tenuto fra il **67% e il 100% di luminosita' — 170-255 in sRGB.** La
finitura di partenza di `velocity` aveva `metallo: 0.85` con tinta
`[0.085, 0.105, 0.155]` lineare, cioe' **82-110 in sRGB**: la meta' del minimo
fisico. Non era «un metallo dove serviva un dielettrico»: era **un metallo che
in natura non esiste**, e per questo non restituiva niente e sembrava un buco
blu. Tabelle pronte: alluminio 0,91/0,92/0,92, argento 0,97/0,96/0,91.

**Lo strato**: clear coat sopra, poi sheen, poi speculare, poi diffuso. E'
l'ordine da cui derivare le tinte di un configuratore invece di sceglierle.

Altre due fonti che valgono per un'automobile: la **Enterprise PBR** di
Dassault documenta il clearcoat come componente separata con la **sua normal
map indipendente** — cioe' il comportamento su cui poggia la separazione fra
geometria e mappa; e la guida **automotive di NVIDIA Omniverse** descrive le
scaglie metalliche come effetto procedurale SOTTO il clearcoat.

**Regola pratica che ne discende:** quando un materiale «non restituisce
niente», prima di alzare le luci controlla se sta **fuori dai limiti fisici**.
Un metallo troppo scuro e un dielettrico con F0 sotto il 2% non si aggiustano
con l'illuminazione.
