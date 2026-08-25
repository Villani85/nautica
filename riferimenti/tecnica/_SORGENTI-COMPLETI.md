# I sorgenti completi: 57 siti premiati di cui hai il codice

Battuta del 13/08/2026 su **2.416 domini di siti premiati** raccolti dagli albi
Awwwards, FWA, Webby e CSSDA. Per ognuno: bundle scaricato, sourcemap cercata
*e indovinata alla cieca* quando il commento era stato tolto, mappa riaperta e
classificata. **57 hanno il sorgente vero dello studio dentro.**

## Come si legge questo numero

Il conteggio grezzo diceva 182. Riaprendo ogni mappa e guardando i percorsi,
**125 sono cadute**. Il dettaglio, perche' e' la parte che si sbaglia sempre:

| esito | quanti |
|---|---:|
| **sorgente vero dello studio** | **57** |
| libreria servita dal sito, non codice proprio | 44 |
| troppo poco per valere (meno di 8 file applicativi) | 80 |
| solo immagini e testi, nessun codice | 1 |

**Le librerie che si travestono da bottino**, in ordine di frequenza: lenis (22 volte), swiper (20 volte), babel (1 volte), hls.js (1 volte).

Il caso tipico e' Swiper: i suoi percorsi cominciano con `../src/shared/`,
sembrano codice applicativo e producono esattamente cento file su ogni sito che
lo usa. Chi non riapre le mappe pubblica un numero gonfiato di sei volte.

## I 57 sorgenti, per quantita' di codice

La colonna che conta e' **file di codice** (`.js`, `.ts`, `.vue`, `.svelte`):
le immagini e i suoni dentro la mappa non si contano. La colonna **shader** e'
quella rara: sono `.glsl`, `.vert`, `.frag` scritti a mano, la cosa piu'
difficile da imparare da soli e la piu' preziosa da leggere.

| sito | file di codice | shader | file totali nella mappa |
|---|---:|---:|---:|
| `constellations.quebec` | 762 | **6** | 770 |
| `leap-for-mankind.com` | 668 | **15** | 855 |
| `hennessy-house-of-moves.hello-jury.com` | 504 | **40** | 2386 |
| `dfy.co.kr` | 179 | - | 184 |
| `haven.suncorp.com.au` | 166 | **34** | 675 |
| `insidekristallnacht.org` | 134 | **2** | 138 |
| `enigma.ferragamo.com` | 123 | **2** | 127 |
| `hiringchain.org` | 104 | **4** | 110 |
| `lironmoran-interiors.com` | 100 | **12** | 184 |
| `depoluxe.xyz` | 98 | - | 111 |
| `andreadiego.es` | 96 | - | 108 |
| `emcell.com` | 88 | - | 91 |
| `oceanfilms.com.br` | 81 | - | 91 |
| `airshifumi.hands.agency` | 80 | **20** | 134 |
| `brainstream.nfb.ca` | 76 | - | 104 |
| `blackdogstory.com` | 72 | - | 114 |
| `lusano.com` | 68 | - | 461 |
| `nfb.ca` | 64 | - | 78 |
| `monolith.nyc` | 62 | - | 400 |
| `kellymilligan.art` | 61 | - | 503 |
| `art-yakushev.com` | 59 | - | 316 |
| `8bit.ai` | 56 | - | 548 |
| `cursed.epic.net` | 56 | **36** | 453 |
| `iyo.ai` | 56 | - | 122 |
| `dala.craftedbygc.com` | 53 | **27** | 217 |
| `control.chipsa.ru` | 50 | **2** | 53 |
| `moxion-preprod.rejouice.io` | 49 | - | 181 |
| `banorama.no` | 47 | - | 545 |
| `crumbskees.com` | 47 | - | 326 |
| `freespeech.gubrica.com` | 46 | **10** | 93 |
| `basehabitation.com` | 39 | - | 58 |
| `epic.net` | 39 | **2** | 175 |
| `bakfasaden.rockwool.no` | 38 | - | 162 |
| `experience.drdabber.com` | 38 | - | 52 |
| `des.de` | 37 | - | 95 |
| `jam3.com` | 36 | - | 399 |
| `aquarium.ru` | 33 | - | 156 |
| `incredible.screenagers.com` | 33 | - | 397 |
| `cleverfranke.com` | 31 | - | 315 |
| `oreo.eu` | 30 | - | 92 |
| `oppenheimermovie.com` | 28 | - | 205 |
| `across-multiverse.com` | 27 | **8** | 101 |
| `conceptstudio.com` | 27 | - | 28 |
| `aebeleinteriors.com` | 24 | - | 37 |
| `alitwotimes.com` | 24 | - | 36 |
| `alanmenken.com` | 22 | - | 178 |
| `jesse-zhou.com` | 22 | - | 82 |
| `juliencalot.com` | 16 | - | 23 |
| `mschristensen.com` | 15 | - | 23 |
| `designboom.com` | 14 | - | 32 |
| `media-facade.shiftlink.tech` | 14 | - | 27 |
| `andersonmoss.com` | 13 | - | 31 |
| `giveahand.ai` | 12 | - | 70 |
| `alnf.org` | 11 | - | 161 |
| `kanaknaturals.com` | 10 | - | 62 |
| `adventuretimedistantlands.com` | 8 | - | 94 |
| `buck.co` | 8 | - | 358 |

## I dieci da aprire per primi

**15 dei 57 hanno shader veri**, per un totale di 220 file GLSL leggibili.
E' li' che sta il valore che non si trova nei tutorial.

**`hennessy-house-of-moves.hello-jury.com`** -- 40 shader, 504 file di codice

    webpack:///./src/component/general/VideoPlayer/VideoPlayer.scss
    webpack:///./src/asset/image/artists/victor-solomon-8.jpg
    webpack:///./src/asset/webgl/textures/mobile/backboard_middle.webp

**`cursed.epic.net`** -- 36 shader, 56 file di codice

    webpack:///./src/functions.ts
    webpack:///./src/components/CustomMesh.ts
    webpack:///./src/shaders/button_frag.glsl

**`haven.suncorp.com.au`** -- 34 shader, 166 file di codice

    webpack://_N_E/./src/utils/logger.ts
    webpack://_N_E/./src/state/preloadStore.ts
    webpack://_N_E/./src/state/threeStore.ts

**`dala.craftedbygc.com`** -- 27 shader, 53 file di codice

    webpack://unseen/./resources/assets/js/animations/index.js
    webpack://unseen/./resources/assets/js/animations/splitCharsWipeUpIn.js
    webpack://unseen/./resources/assets/js/animations/splitTextRotateIn.js

**`airshifumi.hands.agency`** -- 20 shader, 80 file di codice

    webpack:///./src/assets/images/load.png
    webpack:///./src/assets/sounds/C_game_start.mp3
    webpack:///./src/assets/sounds/C_game_lose.mp3

**`leap-for-mankind.com`** -- 15 shader, 668 file di codice

    webpack:///./src/components/Gallery/GalleryClose.vue?9b90
    webpack:///./src/components/Shared/SharedProgress/SharedProgressTutorial/SharedProgressTutorial.vue?275c
    webpack:///./src/assets/gallery/space/full/space-walk-2.jpg

**`lironmoran-interiors.com`** -- 12 shader, 100 file di codice

    webpack://liron-moran/./src/api/primsic.js
    webpack://liron-moran/./src/models/data/serializers/utils.js
    webpack://liron-moran/./src/api/data.js

**`freespeech.gubrica.com`** -- 10 shader, 46 file di codice

    ../../src/modules/State/State.js
    ../../src/modules/Renderer.js
    ../../src/modules/Shaders/Vertex/postProcessingVertex.glsl

**`across-multiverse.com`** -- 8 shader, 27 file di codice

    webpack:///./src/procedural/starfield/Starfield.js
    webpack:///./src/procedural/nebula/Nebula.js
    webpack:///./src/procedural/galaxy/Galaxy.js

**`constellations.quebec`** -- 6 shader, 762 file di codice

    webpack:///./src/templates/components/Enter/EnterCta/EnterCtaBtn/EnterCtaBtn.vue?b1d3
    webpack:///./src/templates/components/Shared/SharedMapIcon/SharedMapIconSaintJeanBaptiste.vue?a495
    webpack:///./src/templates/components/Home/HomeNavigation/HomeNavigation.vue?2068

## Come si scarica

La sourcemap si prende come un file qualsiasi, e i sorgenti stanno dentro il
campo `sourcesContent`. Per estrarli tutti in una cartella:

    curl -s SITO | grep -oE 'src="[^"]+\.js"'      # trova il bundle
    curl -s BUNDLE.js.map -o m.json                  # prova sempre anche alla cieca
    python -c "import json,os;d=json.load(open('m.json'));\
    [ (os.makedirs(os.path.dirname('out/'+s.split('://')[-1].lstrip('./')),exist_ok=True),\
       open('out/'+s.split('://')[-1].lstrip('./'),'w',encoding='utf-8').write(c or ''))\
      for s,c in zip(d['sources'],d['sourcesContent']) ]"

> **Regola non negoziabile: questo codice si STUDIA, non si copia.** Una
> sourcemap servita e' materiale pubblico e leggerla e' lecito, ma il codice
> resta protetto dal diritto d'autore pieno: nessuno di questi siti ha una
> licenza. Si legge per capire come e' fatto, e si riscrive.

## Cosa non e' stato fatto

- **Nessuno di questi sorgenti e' stato letto.** E' una mappa di dove sta il
  codice, non una recensione di cosa contiene.
- **Il premio non e' stato riverificato sito per sito**: i domini vengono dagli
  albi di Awwwards, FWA, Webby e CSSDA, ma anno e categoria andrebbero
  ricontrollati sulla scheda del premio prima di citarli in una proposta.
- Su 2.416 domini, **1.235 non hanno risposto**: sono per lo piu' vincitori
  vecchi, e `_CHI-HA-CHIUSO.md` misura che dopo dieci anni ne sopravvive circa
  la meta'. Il campione vivo e' quindi ~1.180, e su quello la resa e' del 4%.
- **161 siti hanno un bundle non minificato** e non sono in questo elenco:
  leggibili ma senza nomi di file ne' struttura. Sono una seconda ondata da
  battere, ed e' piu' larga di questa.
