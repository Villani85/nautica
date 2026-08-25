# Messenger (abeto) e Bruno Simon — e il verdetto sul 3D in tempo reale

Due siti studiati insieme perche' rispondono alla stessa domanda: **conviene il
WebGL in tempo reale, o un video scrubbato ottiene lo stesso a un decimo del
costo?** La risposta sta in fondo, ed e' contro il 3D.

---

# 1. MESSENGER — abeto

- **URL**: https://messenger.abeto.co
- **Premio**: **Developer Site of the Year 2025** (54 voti); SOTD 10/11/2025,
  punteggio 7.92, Dev Award 8.21 (Animazioni 9.00, WPO 8.80)
- **Autori**: Vicente Lucendo e Michael Sungaila, studio abeto
- **Case study**: https://www.awwwards.com/messenger.html

## Cosa vende
Lo studio stesso. Si vende **facendo giocare**: il copy quasi sparisce.

## Stack (verificato leggendo `App3D-DwM1eiaC.js`, 490 KB brotli / 1,93 MB)
**three.js r180** con `WebGLRenderer` classico, **non** WebGPU. **Svelte 5** per
la poca UI in DOM. `three-mesh-bvh` per le collisioni. `BatchedMesh` (41
occorrenze) e `InstancedMesh` (25). KTX2/Basis + DRACO. **Otto web worker**:
bitmap, charactergeo, collision, draco, exr, geometry, glyph, msdf. Shader GLSL
scritti a mano con un **Uniform Buffer Object condiviso** da tutti i materiali.
Fisica custom con gravita' verso il centro del pianeta: nessuna libreria terza.

## Tecniche
- **Il mondo non e' una sfera deformata**: hanno provato la deformazione
  procedurale e l'hanno scartata. Modellano un cubo scomposto e lo trasformano
  in sfera, cosi' le UV non si spappolano ai poli.
- **Atlante colore da 16x16 px**: un pixel per colore. Niente albedo sulla
  maggior parte della geometria.
- **Il testo e' dentro il canvas**, reso in MSDF via worker dedicati.
- **Acqua**: `ShaderMaterial` che legge il buffer di scena (`tScene`,
  `uDepthRange`) — un pass di rifrazione, non un blend.

## Peso — misurato fino alla schermata giocabile
**5,60 MB trasferiti / 7,30 MB decompressi in 108 richieste.**
Ripartizione: **audio .ogg 3,51 MB**, JS 0,55, texture .ktx2 0,55, geometria
.drc 0,48, font 0,25, wasm 0,22. File piu' pesante: `bgmusic-highq.ogg`
**2.257 KB**. L'HTML e' 1,7 KB.

> **Il pianeta intero e' 329 KB di geometria. La musica pesa sette volte la
> geometria.**

## Le sette difese sui dispositivi deboli (tutte lette nel codice)
1. **Clamp del pixel ratio**: `dpr <= 2 ? min(dpr, 1.15) : min(dpr, 1.5)`. Su
   schermo 2x rendono a **1,15x**.
2. **`adaptiveDPR` con regola d'arresto** — il pezzo migliore:
   attesa 2 s; finestre di almeno 4 s e 5 campioni; FPS medio &lt; 30 e
   moltiplicatore &gt; 0,6 -> **-0,1**; FPS ≥ 60 e moltiplicatore &lt; 1 -> **+0,1**;
   pavimento 0,6, tetto 1,0. **Se inverte direzione 4 volte stampa
   `"Adaptive DPR stopped."` e si disattiva per sempre.** Ed e' in pausa durante
   le transizioni, per non farsi ingannare dai cali di caricamento.
   *Il pezzo intelligente non e' abbassare la risoluzione: e' accorgersi di
   stare oscillando e smettere.*
3. **Profilazione a monte**: ogni iPhone e' classificato `lowMemoryDevice`.
   Nessuna misura di GPU, scelta netta per famiglia.
4. **Due alberi di asset separati, non un LOD calcolato**: su `lowMemory` carica
   da `planets/present/low/` e salta un livello (`LOD3_THRESHOLD = Infinity`).
5. **Culling per prodotto scalare** invece del frustum:
   `frustumCulled = false`, `DOT_THRESHOLD = 0.45`. La faccia opposta del
   pianeta non si disegna mai.
6. **Audio a due qualita'**: `bgmusic-mobile.ogg` vs `-highq.ogg`.
7. **Otto worker**: decodifica, geometria, collisioni, glifi — tutto fuori dal
   thread principale.

## Tre cose da rubare
1. **`adaptiveDPR` con la resa dopo 4 inversioni.** Vale su qualsiasi canvas,
   anche 2D: un sito che sfarfalla fra 0,8 e 0,9 e' peggio di uno fermo a 0,8.
2. **Culling per prodotto scalare** su qualunque scena a geometria prevedibile.
3. **Due cartelle di asset scelte da un flag al primo frame**: costo di build,
   zero costo a runtime, zero transizioni visibili.

---

# 2. BRUNO SIMON — folio 2025

- **URL**: https://bruno-simon.com
- **Premio**: SOTD 21/01/2026 (8.11); **Site of the Month gennaio 2026**
- **Sorgente pubblico, MIT, file Blender inclusi**:
  https://github.com/brunosimon/folio-2025

## Stack (verificato su `package.json` e sorgenti)
**three ^0.183.2 importato come `three/webgpu`**, `WebGPURenderer` con
`forceWebGL: false` -> WebGPU quando c'e', fallback WebGL2 automatico.
**Shader in TSL, non GLSL.** Fisica **Rapier** caricata con `import()` dinamico
in parallelo agli asset. Vite 7. **Nessun React, nessun R3F**: vanilla ES
modules, un singleton `Game` con 14 stadi di ticker. Mondo modellato
interamente in Blender, comprese collision shape e respawn point.

## Tecniche
- **Palette texture da 1,5 KB.** Il colore non sta nelle texture: sta in un
  atlante minuscolo campionato con `NearestFilter`. Per questo tutta la
  geometria puo' essere unita.
- **Erba a budget costante**: griglia fissa **280x280 = 78.400 fili**. Quando il
  viewport si allarga **ingrossa il filo** invece di aggiungerne. La densita'
  percepita resta, il costo non si muove.
- **`cheapDOF`, e il nome e' onesto**: NON legge il depth buffer. E' un hash
  blur pesato su `abs(uv.y - 0.5)` — un tilt-shift finto. Un pass, nessun
  rendering di profondita'.
- **`PreRenderer`**: prima di rivelare la scena rende **tutto, compresi gli
  oggetti nascosti**, in un `CubeRenderTarget` da **32 pixel**, poi rinasconde.
  Serve solo a forzare la compilazione delle pipeline ed elimina lo stutter del
  primo frame.
- **La schermata di caricamento e' dentro la scena 3D**: il cerchio di
  progresso e' una mesh. Nessun loader HTML.

## Peso — misurato con curl
| risorsa | peso |
|---|---|
| **bundle JS** | **1,03 MB gzip** (4,86 MB raw) |
| chunk Rapier | 34,9 KB gzip |
| draco + basis wasm | 279 + 515 KB, **non compressi** |
| **tutti i modelli e le texture** | **1.374 KB** |

Dettaglio: `areas-compressed.glb` 624 KB, `terrain.ktx` 341 KB, **l'auto: 34 KB**,
il terreno come geometria: 25 KB.

> **Il bundle JavaScript pesa quasi quanto tutti gli asset 3D del sito.** E il
> sito serve solo gzip, non brotli: c'e' un 15-20% lasciato sul tavolo.

Pipeline di compressione (`scripts/compress.js`): `gltf-transform etc1s
--quality 255`, poi `draco --method edgebreaker --quantize-position 12
--quantize-normal 6 --quantize-texcoord 6`. Texture `toktx` in **ETC1S** di
default, **UASTC** solo dove serve.

## Prestazioni: due livelli, decisi dallo user agent, mai rivisti
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    this.level = isMobile ? 1 : 0

**Nessuna misura di FPS, nessun degrado automatico.** Sul livello 1: shadow map
da 2048² a **512²**, bloom da 5 mip a **2**, tilt-shift **disattivato**,
pre-compilazione shader **no**, zoom dinamico **no**, delta fisica fisso a 1/60.
Piu': antialias attivo **solo se** `pixelRatio < 2`.

Da notare: **Bruno Simon, che e' l'autore di Three.js Journey, si e' fermato a
`navigator.userAgent` con due livelli.** Non perche' non sappia fare di meglio:
perche' ogni livello di qualita' in piu' e' un secondo sito da testare.

## Tre cose da rubare
1. **`PreRenderer`**: trenta righe che eliminano lo stutter da compilazione
   shader del primo frame.
2. **`cheapDOF`**: sfocatura in funzione di `abs(uv.y - 0.5)`. Il 90% della resa
   cinematografica al 10% del costo, **portabile su qualsiasi canvas, anche un
   video scrubbato**.
3. **Budget di vertici costante con compensazione visiva**: applicabile a
   particelle, coriandoli, qualsiasi campo denso. Il costo diventa una costante
   da mettere a bilancio.

---

# 3. IL VERDETTO: conviene il 3D in tempo reale?

**Quasi mai. E questi due siti non sono un argomento a favore: sono l'eccezione
che spiega la regola.**

**Tempo.** Bruno Simon dichiara "poco piu' di un anno". Non e' un principiante:
e' l'autore del corso di riferimento. Messenger sono due persone di uno studio
che fa solo questo, con Houdini e Substance gia' in pipeline. Senza un LOD
system gia' scritto, si mettano in conto **3-6 mesi per un mondo navigabile**.

**Peso, e non dove ce lo si aspetta.** Il 3D compresso bene e' leggero: e' il
RUNTIME a costare, e quello non si comprime.

**Manutenzione permanente.** Messenger ha sette meccanismi di degrado. Voi ne
testerete uno.

## Quando il tempo reale e' l'unica risposta
Un solo criterio, e non e' "il 3D e' bello": **l'utente ha una scelta che voi
non conoscete in anticipo?**
- guida, cammina, apre, ruota, configura -> si, non potete precalcolare 10.000
  traiettorie;
- il sito **e'** la dimostrazione della competenza che vendete -> si, ed e' il
  caso di Bruno: il portfolio e' la demo del corso che vende. Il ritorno non e'
  il portfolio, e' Three.js Journey.

## Quando il video scrubbato vince, e vince nettamente
- **se la coreografia e' la stessa per tutti**: un video E' una tabella di
  fotogrammi precalcolati, il WebGL non aggiunge nulla, ricalcola solo a ogni
  fotogramma quello che avevate gia';
- **se i materiali sono costosi**: vetro, subsurface, riflessi veri — da un
  render offline li avete gratis;
- **se il traffico e' mobile**: il video decodifica in hardware, il WebGL no.

Ordine di grandezza: ~300 fotogrammi a 1440p in AV1/H.265 stanno in **3-6 MB**,
girano su qualunque telefono degli ultimi cinque anni, e si producono in giorni.
**"Un decimo del costo" e' semmai ottimista verso il WebGL: nei casi semplici
e' un ventesimo.**

## I limiti del video, da dire al cliente PRIMA
Non risponde al puntatore (e va bene). Non ha stati: niente "cambia colore",
niente hotspot. **Il seek su iOS Safari e' il punto debole vero**: o si estraggono
i fotogrammi come immagini, o WebCodecs, o si accetta il singhiozzo — ed e'
l'unica ragione tecnica seria per cui a volte si finisce in WebGL. Non e'
indicizzabile senza un ripiego testuale.

## La regola
> **Se lo storyboard si puo' disegnare come una singola linea temporale, e' un
> video. Se l'utente decide dove andare, e' WebGL.**

E se la risposta e' "video", quasi tutto quello che rende belli questi due siti
resta rubabile: `cheapDOF` funziona su un canvas 2D, `adaptiveDPR` su qualsiasi
ciclo di rendering, i due alberi di asset sono pura pipeline di build.

## Non verificato
fps reali su hardware vero (nessuno dei due). Il tetto di 17,5 MB di Messenger
e' un dato di terzi (Hacker News), non degli autori. Il fallback WebGL2 di Bruno
non e' stato provato. Backend WebSocket di Messenger non ispezionabile.
