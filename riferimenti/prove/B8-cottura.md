# B8 — Il piano di cottura per la traversata (PRIMO GIRO, solo lettura)

`date -Is` inizio: `2026-09-01T00:24:23+02:00`
`date -Is` fine:   *(scritta alla fine del file, vedi ultima riga)*

Nessun file scritto in questo giro tranne questo. Nessuna cottura eseguita.

---

## 1 · La convenzione dei sei copioni — in sei righe

1. **UV**: un solo canale attivo per mesh (`bassa.data.uv_layers.active` /
   `uv_layers[0]`), lo stesso che porta il colore/atlante — nessuno dei sei usa
   un secondo canale UV dedicato alla mappa cotta. Le UV o arrivano già pronte
   dal costruttore (`glb-impianto.py`, `glb-macchine.py` via `MODO=cottura`,
   `sovrastruttura-uv.blend`) o dall'esportatore JS (`cuoci-ao-scafo.py`,
   `cuoci-luce-scafo.py` leggono `q['uv']` dal JSON) — mai `smart_project` a
   caso: `riferimenti/blender/cuoci-ao-scafo.py:17-27`.
2. **Risoluzione**: cambia per pezzo e non è mai "la stessa per tutti" — vedi
   tabella §2. Non è una scelta a priori: si tara sulla densità texel/cm
   dell'atlante (`riferimenti/blender/cuoci-macchine.py:108-115,132-152`).
3. **Motore**: sempre Cycles, sempre CPU su questo PC (niente GPU disponibile:
   `riferimenti/blender/cottura.py:359-400`), campionamento **adattivo
   spento** (`cottura.py:417`, misurato che 64 e 512 campioni danno la stessa
   media/deviazione: `cottura.py:406-416`). Denoise **solo sull'occlusione**,
   mai sulla normale (`cottura.py:418-421`).
4. **Formato**: si cuoce sempre in **PNG** (buffer float, non-color,
   `cottura.py:142-185`), e si **riesporta in WEBP** al momento dell'export
   GLB, con qualità diversa per script/mappa (90 impianto normale+AO insieme:
   `glb-impianto.py:828-829`; 88 macchine: `glb-macchine.py:962-963`; 82
   sovrastruttura: `glb-sovrastruttura.py:704`; 88 interni:
   `riferimenti/blender/cuoci-interni.py:536-556`). Non ho trovato uso di EXR
   in nessuno dei sei.
5. **Rientro nel materiale**: PNG cotto → nodo texture sul Principled (normale
   + `occlusionTexture` che legge il canale R dell'ORM impaccato O/R/M → R/G/B:
   `cottura.py:538-547`, `glb-impianto.py:804`, commento analogo in
   `glb-macchine.py:922`) → l'esportatore glTF converte in WEBP in uscita. Le
   texture inviate sono quasi sempre **ridotte rispetto alla cottura** (si
   cuoce a 2048 dove i cancelli sono tarati, si spedisce a 512/1024:
   `strumenti/rifai-impianto.sh:29-45`) perché il recupero percettivo è
   uguale alle tre risoluzioni ma i byte no.
6. **Tempo**: dichiarato solo in due punti trovati — impianto **66 s** in
   locale/CPU a 2048px/256 campioni (`docs/15-PASS-PBR.md:751`, e NON i "13
   minuti" citati altrove, verificati falsi); macchine **185 s** CPU / **43,5
   s** T4 propulsione, **38,8 s** T4 giroscopio, sempre 2048px/256 campioni
   (`strumenti/rifai-macchine.sh:80-90`). Per sovrastruttura e interni **non
   ho trovato un tempo di cottura dichiarato** — vedi buco in §2.

## 2 · I sei copioni, uno per uno (con fonte)

| # | script | UV | risoluzione | motore/campioni/denoise | formato finale | tempo dichiarato |
|---|---|---|---|---|---|---|
| 1 | `cuoci-ao-scafo.py` | dall'esportatore JS (`q['uv']`), canale `UVMap` nuovo — `:103-108` | `LATO_AO` env, default **512** — `:39` | Cycles CPU, `AO_CAMPIONI` default **128**, nessun denoise esplicito — `:39-40,115-126` | **PNG** semplice (non ORM impaccato), 1 canale usato — `:128-131` | non dichiarato |
| 2 | `cuoci-luce-scafo.py` | stesso schema — `:70-` (UVMap) | `LATO_LUCE` env, default **512** — `:59` | Cycles CPU, `LUCE_CAMPIONI` default **256**, bake `DIFFUSE` solo indiretto — `:59-60,204-223` | **PNG**, pensato per `lightMap` three.js (additivo) — `:34-36` | non dichiarato |
| 3 | `cuoci-macchine.py` | prepara ALTA/BASSA, poi delega a `cottura.py` (stesso canale) — `:1-37` | **512** propulsione / **320** giroscopio in normale, **384**/**256** in ORM — tarate a parità di densità texel/cm, non di lato — `strumenti/rifai-macchine.sh:56-72` | Cycles, 256 campioni, via `cottura.py` (adattivo off, denoise solo AO) | PNG cotto → **WEBP q88** all'export — `glb-macchine.py:962-963` | **185 s CPU / 43,5-38,8 s T4** — `strumenti/rifai-macchine.sh:80-90` |
| 4 | `cuoci-sovrastruttura.py` | solo il passo "prepara" (join ALTA/BASSA + smusso); UV = atlante di `sovrastruttura-uv.blend`, canale unico + `TEAK_CORSI` come canale UV separato ma NON per lightmap, per le fughe del teak — `:54-61,108-117` | atlante dichiarato **2048** per il pass PBR — `glb-sovrastruttura.py:493` (non ho trovato lo script/comando che invoca `cottura.py` con la risoluzione di spedizione: **buco**) | Cycles via `cottura.py` (stessi default) | PNG cotto → **WEBP q82** — `glb-sovrastruttura.py:704` | **non dichiarato** |
| 5 | `cuoci-interni.py` | niente ALTA/BASSA: la mesh spedita è già quella di dettaglio, si srotola **solo dove la quota area/cuciture supera 0,5** — `:53-95` | resa in argomento posizionale, usata a **512** nel driver — `strumenti/rifai-interni.sh:62` | Cycles CPU, `--campioni` default **64** — `:106` | PNG cotto → **WEBP q88**, export inline nello stesso script — `:536-556` | non dichiarato (il tempo 92s CPU/35s T4 nel driver è per il **render-provino**, non per questa cottura — `strumenti/rifai-interni.sh` fondo pagina) |
| 6 | `cottura.py` (il forno comune) | usa `bassa.data.uv_layers` — deve esistere, non lo crea — `:459-460` | argomento `dimensione`, predefinito **2048** — `:69-70` | Cycles, adattivo **off**, denoise solo AO, GPU via OPTIX se `--gpu` (muore se assente, non degrada in silenzio) — `:359-421` | PNG con cancelli di qualità (copertura, macchie, deviazione, informazione) — `:590-624` | n/d (è il motore, non un tempo fisso) |

**Nota sulla vera precedente di "lightmap"**: `cuoci-luce-scafo.py` è l'unico
dei sei che cuoce davvero un'irradianza indiretta pensata per la `lightMap`
three.js — ma il suo output **non risulta spedito**: in `public/modelli/` c'è
solo `scafo-ao.webp` (12.786 byte), nessun `scafo-luce.*`, e
`grep -rn lightMap src/` trova solo i commenti in `src/scafo/ordinate.js:333-413`,
non un caricamento del file. Va dichiarato: **la lightmap del dorso della nave
esiste come script, non come asset spedito**.

## 3 · La trappola trovata: `aoMap`/`lightMap` vogliono `uv1`, non `uv`

`src/scafo/ordinate.js:332-351` e `:394-413` documentano, con la prova
misurata (`lightMapIntensity` a 10 non cambiava un bit del fotogramma), che
**da three r152 `aoMap` e `lightMap` campionano l'attributo `uv1`
(TEXCOORD_1), non `uv` (TEXCOORD_0)**. Per lo scafo — geometria costruita a
mano in JS — il rimedio è stato dichiarare lo stesso set di UV due volte
(`g.setAttribute('uv1', attrUv)`).

Per i quattro modelli GLB già cotti (impianto, macchine, sovrastruttura,
interni) **questo non risulta verificato**: `grep -rn "TEXCOORD_1|uv1" src/
riferimenti/blender/*.py strumenti/*.mjs` non trova NESSUN riferimento fuori
da `ordinate.js`. Le loro mappe usano `occlusionTexture`/`normalTexture`
standard glTF su un solo canale, caricate via `GLTFLoader`, che si comportano
diversamente da un `MeshStandardMaterial` assemblato a mano — ma **non ho
verificato che funzionino davvero a runtime**, solo che i quattro file
esistono e pesano quanto dichiarato. È un buco, non una bocciatura: se la
traversata riceve una cottura e la si vede grigia lo stesso, il primo sospetto
è questo, non il bake.

## 4 · Il guscio del salone: NON va ricotto

`public/modelli/guscio-salone.glb` (125.516 byte grezzi, 8 mesh, 1 materiale,
**0 immagini** — misurato con `gltfpack -i ... -v`) porta solo geometria. La
texture proiettata (`finestrone.png`, 3.063 byte) è una **fotografia vera**,
applicata a runtime con:

    o.material = new MeshBasicMaterial({ map: texturaStanza, toneMapped: false, side: DoubleSide })

— `src/scena/guscio.js:101-115`. `MeshBasicMaterial` **non supporta `aoMap`,
`normalMap` né `lightMap`**: sono proprietà di `MeshStandardMaterial`. Cuocere
una normale o un'occlusione per questo guscio sarebbe lavoro sprecato due
volte: (a) la fotografia porta già luce e ombra reali, cotte dentro i pixel
dalla macchina fotografica; (b) anche cotta, la mappa non avrebbe dove
attaccarsi senza prima cambiare il materiale runtime — decisione fuori dallo
scopo di questo giro. **SALOON_SHELL esce dall'elenco delle collezioni da
cuocere.**

## 5 · I numeri di peso, MISURATI (non stimati)

`ls -la public/modelli/`:

    giroscopio.glb           158.972 byte
    guscio-salone.glb        125.516 byte
    impianto.glb             210.796 byte
    interni.glb              477.284 byte
    propulsione.glb          222.416 byte
    scafo-ao.webp              12.786 byte
    sovrastruttura.glb        122.080 byte
    traversata-camera.json     16.569 byte
    traversata-world.glb    1.561.168 byte
    TOTALE cartella           2,89 MB grezzi (confermato)

`dist/modelli/` ha gli stessi file, stessi byte (build già allineata alla
sorgente).

`node strumenti/peso.mjs` (colonna brotli, quella che conta secondo il
committente):

    giroscopio.glb            94,6 KB br
    guscio-salone.glb          9,5 KB br
    impianto.glb              119,5 KB br
    interni.glb               189,4 KB br
    propulsione.glb           128,7 KB br
    scafo-ao.webp              12,4 KB br
    sovrastruttura.glb         61,3 KB br
    traversata-camera.json      2,0 KB br
    traversata-world.glb      113,4 KB br   <- OGGI, senza nessuna cottura

**Non esiste un tetto automatico per `traversata-world.glb`**: `npm run
collaudo` NON lo controlla per costruzione —
`strumenti/collaudo-cancelli.mjs:99-107` lo dichiara esplicitamente escluso
finché `collaudo-traversata-world.mjs` non passa (condizione d'uscita
dell'ondata 2, ancora rossa). Ho letto `collaudo-traversata-world.mjs` per
intero (`grep -n "peso|KB|MB|byte"`) e **non contiene nessun controllo di
peso**, solo geometria/continuità/camera. L'unico tetto misurabile oggi è
quello dei filmati (4,2 MB, `strumenti/peso.mjs:306`) e quello del JS gzip
(250 KB, `strumenti/peso.mjs:149`) — nessuno dei due copre i GLB. Il "budget"
per la traversata è quindi **una decisione da prendere ora**, non un cancello
che già esiste.

`gltfpack -i public/modelli/traversata-world.glb -v` (misurato):

    56 nodi, 45 mesh/primitive, 9 materiali, 0 skin, 0 animazioni, 0 immagini
    61.884 triangoli, 34.098 vertici

— zero immagini conferma "grigio": nessun materiale porta una texture oggi.

Bbox per collezione, MISURATE nel giro precedente e già in
`riferimenti/prove/B7-export.md:25-31` (Blender X,Y,Z — non ricalcolate qui,
citate):

    MECHANISM_BAY    X 4,448 x Y 3,110 x Z 3,400   (13 oggetti)
    ENGINE_ROOM      X 4,375 x Y 3,110 x Z 3,400   (8 oggetti)
    STAIR_CORRIDOR   X 5,480 x Y 4,260 x Z 1,090   (18 oggetti) — combacia con
                     `LUNGHEZZA_TOTALE = 5.480` di `corridor.py:118` e
                     `LARGHEZZA_CORRIDOIO = 0.85`, `ALTEZZA_LIBERA = 2.00` di
                     `corridor.py:97-98`
    SALOON_SHELL     X 9,852 x Y 2,510 x Z 4,815   (17 oggetti, ESCLUSO — §4)

La sezione del corridoio (Y×Z qui non è larghezza×altezza pulite, la bbox
include gradini/scala) è comunque la più STRETTA delle tre da cuocere: il
volume utile dichiarato in `corridor.py` è 0,85 m di larghezza contro i ~3,1 m
di sala macchine/locale tecnico — un fattore ~3,6 di sezione.

## 6 · Il piano per la traversata

### Ordine proposto

1. **MECHANISM_BAY** (locale tecnico) — è il vano dove la camera INDUGIA di
   più secondo il contratto (nodo `CAMERA_SORGENTE_SALONE`/uscita meccanismo,
   `riferimenti/blender/world_root.py:80-123`), e il più vicino in stile ai
   quattro copioni già rodati (superfici tecniche, non organiche). Farlo per
   primo dà il template da riusare.
2. **ENGINE_ROOM** (sala macchine) — stessa famiglia geometrica di 1, stessa
   densità/scala (bbox quasi identica: 4,375 vs 4,448 m), si può cuocere con
   gli STESSI parametri misurati per 1, dimezzando il rischio di dover ritarare.
3. **STAIR_CORRIDOR** (corridoio) — ultimo perché è il caso più marginale
   (sezione stretta, poca superficie da AO/normale — vedi risoluzione sotto) e
   perché la sua geometria dipende da una cucitura ancora in `CONFLITTO`
   (`world_root.py:490-519`, porta locale tecnico 0,85×2,00 contro 0,70×1,90):
   se il committente la risolve cambiando la larghezza, meglio non aver già
   cotto un atlante che cambia forma.
4. **SALOON_SHELL** — NON si cuoce, per i motivi del §4.

### Risoluzione proposta, con la ragione

Nessuno dei sei precedenti sceglie una risoluzione a priori: la tara sulla
densità texel/cm (`cuoci-macchine.py:108-115`). Non ho i m² reali di
superficie (servirebbe l'`area_3d()` di `cuoci-macchine.py:79-93` applicata
alle mesh delle tre collezioni, che è un conto DENTRO Blender e quindi
cottura, non lettura — fuori scopo di questo giro). Con le bbox di §5 come
proxy di scala:

- **MECHANISM_BAY**: **512 px** normale, **384 px** occlusione — stessa
  filosofia della propulsione (bbox comparabile, 4,4 m), che a 512/384 ha dato
  cotture accettate.
- **ENGINE_ROOM**: **512 px** normale, **384 px** occlusione — stessa ragione
  di sopra, e per uniformità visiva fra due vani adiacenti che la camera
  attraversa in continuità (un salto di densità fra i due si vedrebbe come un
  bordo).
- **STAIR_CORRIDOR**: **320 px** normale, **256 px** occlusione — sulla falsariga
  del giroscopio (bbox più piccola in un asse, 320/256 diede 0,49 texel/cm
  "come la macchina grande" — `strumenti/rifai-macchine.sh:56-72`). Un
  corridoio stretto e lungo ha superficie sviluppata piccola rispetto al suo
  ingombro: dargli 512 px sprecherebbe texel dove la propulsione ne aveva
  davvero bisogno.

Questa è un'ANALOGIA con le densità già misurate sulle macchine, **non una
misura fatta su questa geometria**: va dichiarato come tale. Il primo vero
giro di cottura deve ristampare `area_3d()`/`area_uv()` per le tre collezioni
prima di fidarsi di questi numeri.

### Peso atteso

Le quattro cotture GLB esistenti pesano, in brotli: impianto 119,5 KB (2 mappe,
9 materiali... in realtà l'impianto ha piu' pezzi, vedi tabella §5),
sovrastruttura 61,3 KB, propulsione 128,7 KB, giroscopio 94,6 KB, interni
189,4 KB (1 sola mappa, geometria più grossa). La traversata ha **9 materiali**
su **3 collezioni da cuocere** (non 4), con geometria complessivamente più
piccola di interni (61.884 triangoli contro un modello che già pesa 477 KB
grezzi). Per analogia con macchine (che hanno normale+ORM insieme, risoluzioni
simili a quelle proposte sopra):

    stima locale tecnico + sala macchine   ~90-130 KB brotli l'una (come propulsione/giroscopio)
    stima corridoio                        ~40-60 KB brotli (geometria piu' piccola, risoluzione piu' bassa)
    TOTALE ATTESO aggiunto al GLB          ~220-320 KB brotli in piu'

    traversata-world.glb OGGI              113,4 KB brotli
    traversata-world.glb ATTESO DOPO       ~330-430 KB brotli

Questa è una stima per analogia, **non un calcolo** — dichiarata come tale.
Confrontata con gli altri modelli spediti (impianto 119,5 + propulsione 128,7
+ giroscopio 94,6 + sovrastruttura 61,3 + interni 189,4 + guscio-salone 9,5 +
scafo-ao 12,4 = **615,4 KB brotli già spediti** per il resto della nave), un
salto della traversata da 113 a ~330-430 KB la porterebbe a pesare quanto
**metà di tutto il resto della nave messo insieme**. Non c'è un cancello che
lo blocchi (§5) — è una scelta del committente, non un limite tecnico.

### Tempo stimato per giro, e quanti giri

Dai due tempi dichiarati (§1.6): 66 s (impianto, CPU locale, 2048/256) e
185 s CPU / ~40 s T4 (macchine, stessa risoluzione). Le tre collezioni da
cuocere sono più piccole delle macchine, ma la pipeline completa non è solo il
bake:

    per collezione:  ~1-3 min prepara/geometria
                    + ~1-3 min bake CPU locale (66-185 s per i precedenti)
                    + ~1 min mappe "da spedire" (ffmpeg scale) + export GLB
                    + ~1 min alleggerisci-mappe + meshopt
                    ≈ 5-10 minuti per collezione IN LOCALE, se tutto passa al
                      primo colpo

    su Colab T4 (misurato 4,3x più rapido sul bake, non sul resto):
                    ≈ 3-6 minuti per collezione

Tre collezioni, primo giro pulito: **15-30 minuti locale, 10-20 su Colab** —
ma nessuno dei sei precedenti ha superato il primo cancello al primo colpo
(impianto e macchine hanno tutti dei `--max-macchie`/`--distanza-ao` DERIVATI
da una cottura fallita prima). **Un piano realistico prevede almeno 2 giri per
collezione** (uno per misurare i cancelli veri, uno per correggerli): quindi
**~1-2 ore reali totali per le tre collezioni**, non un singolo giro da 20
minuti come questo.

## 7 · La domanda per il committente

Due esiti sul tavolo, entrambi con numeri sopra — non scelgo:

**A. Cottura piena (locale tecnico + sala macchine + corridoio)**
- Risolve davvero il "quattro stanze di plastica": normale + AO su tutte le
  superfici che la camera attraversa da vicino.
- Costo: ~1-2 ore reali di lavoro (bake + correzioni sui cancelli), peso
  atteso ~330-430 KB brotli (da 113,4 oggi), cioè +200-300 KB, senza un tetto
  automatico che lo verifichi (§5) — la verifica resta manuale finché
  `collaudo-traversata-world.mjs` non guadagna un controllo di peso.
- Rischio aperto non richiuso in questo giro: se `occlusionTexture`/
  `normalTexture` standard non si comportano come le mappe manuali dello
  scafo (§3, `uv1` vs `uv`), la cottura potrebbe non apparire a runtime pur
  essendo dentro il file — da verificare sul PRIMO pezzo cotto, prima di
  ripetere la ricetta sugli altri due.

**B. Materiali semplici, cottura rimandata**
- Costo quasi zero adesso: si sistemano colore/rugosità/metallicità piatti
  per materiale (senza bake), il che già toglierebbe parte del grigio anche
  senza AO/normale.
- Il confronto col filmato fotografico resta debole nelle stanze (non nel
  salone, che è già fotografico e resta com'è).
- Rimanda il rischio del punto A (uv1) a un giro futuro, quando si deciderà
  di cuocere davvero.

## Fonti citate in questo referto (riepilogo dei comandi eseguiti)

    ls -la public/modelli/
    ls -la dist/modelli/ dist/salone/
    node strumenti/peso.mjs
    ./node_modules/.bin/gltfpack -i public/modelli/traversata-world.glb -o <scarto> -v
    ./node_modules/.bin/gltfpack -i public/modelli/guscio-salone.glb -o <scarto> -v
    grep -rn "LIGHTMAP_RECEIVERS" .
    grep -rn "TEXCOORD_1|uv1" src/ riferimenti/blender/*.py strumenti/*.mjs
    grep -rn "lightMap|scafo-luce|cuoci-luce-scafo" src/ strumenti/

`date -Is` fine: `2026-09-01T00:33:43+02:00`  (durata reale ~9m20s)
