# Il censimento finito: 117 studi premiati e il loro codice pubblico

Battuta del 13/08/2026. Chiude il lavoro aperto in `_REPO-CACCIA.md`, dove 20 organizzazioni
erano state lette e dodici erano rimaste in sospeso per esaurimento della quota API.

**Qui dentro**: i dodici che mancavano, piu' 105 studi nuovi cercati in diciotto paesi, per un
totale di **117 studi con account GitHub verificato e 4.469 repository letti uno per uno** con
stelle, licenza, linguaggio e data dell'ultimo push. Nessun browser condiviso: solo `curl` e
richieste HTTP pubbliche.

> **Regola che vale per tutto il file, ripetuta perche' e' quella che costa soldi se la si
> dimentica: senza licenza il codice si STUDIA, non si copia.** Un repository pubblico senza
> file di licenza e' "tutti i diritti riservati": leggerlo e' lecito, incollarlo dentro il
> lavoro di un cliente no. La colonna della licenza e' l'unica colonna di questo documento che
> abbia conseguenze legali.

---

# 1. La scoperta di metodo: leggere GitHub senza consumare quota

E' la cosa piu' riutilizzabile di tutta la battuta, e va scritta prima dei risultati.

`_REPO-CACCIA.md` si era fermato perche' l'API pubblica di GitHub da' **60 richieste all'ora per
indirizzo IP**. Sessanta studi all'ora, e basta. Anche oggi, al momento di partire,
`api.github.com/rate_limit` diceva `remaining: 0`.

**La rotta che risolve il problema**: la pagina delle organizzazioni del sito normale risponde in
JSON se glielo si chiede.

```
curl -s -H "Accept: application/json" \
  "https://github.com/orgs/NOME/repositories?type=source&page=1"
```

Restituisce, per ogni repository: nome, descrizione, **stelle**, **licenza**, linguaggio
principale, numero di issue e pull request, e la data dell'ultimo push. Trenta per pagina, con
`pageCount` per sapere quante pagine ci sono. **Non e' l'API: non consuma la quota da 60/ora.**
In questa battuta sono state fatte oltre milleduecento richieste di questo tipo senza mai essere
bloccati (con sei richieste in parallelo e qualche riprova).

Tre trappole gia' pagate, da annotare:

1. **Anche questa rotta e' sensibile alle maiuscole.** `/orgs/yourmajesty` da' `Not Found`,
   `/orgs/YourMajesty` risponde. La capitalizzazione giusta si legge nella pagina profilo, nel
   meta `octolytics-dimension-user_login`. Il metodo definitivo e' quindi: prima la pagina
   profilo (per la capitalizzazione, per la descrizione e per capire se e' organizzazione o
   persona), poi la rotta JSON.
2. **Se la risposta e' `{"error":"Not Found"}` non vuol dire che l'account non esiste**: vuol
   dire che non e' un'organizzazione. Puo' benissimo essere un account personale con dentro
   roba ottima (vedi Obys, Akaru, S1T2).
3. **Per gli account personali la licenza non c'e'.** La scheda repository di un profilo
   personale mostra stelle, linguaggio e data, ma **non** la licenza. Chi legge in fretta quei
   dati conclude "nessuna licenza" e sbaglia: controllati a mano, `three-mesh-bvh`,
   `canvas-sketch`, `curtains.js`, `phenomenon`, `THREE.MeshLine`, `three.js`,
   `three-projected-material`, `The-Spirit`, `nodl` e `txt-shuffle` **sono tutti MIT**. Per gli
   account personali la licenza si verifica repository per repository, aprendo la pagina del
   repository. In questo documento le percentuali di licenza sono calcolate **solo** sulle
   organizzazioni, dove il dato e' certo.

---

# 2. I dodici in sospeso: chiusi

Erano l'elenco esplicito lasciato in fondo a `_REPO-CACCIA.md`. Risultato: **tutti e dodici
esistono, ma solo sette hanno codice**, e due dei piu' interessanti pubblicano sotto un nome
diverso da quello che si cercava.

| studio | org cercata | repo | esito |
|---|---|---:|---|
| Dogstudio | `dogstudio` | **0** | organizzazione viva ma vuota. Il loro codice sta in `dept` (vedi sotto) |
| Immersive Garden | `immersive-garden` | 2 | `glsl-easings`, `igpu` (Unlicense, luglio 2026) |
| Make Me Pulse | `makemepulse` | 16 | `2024-kaizen-public` (54 st), `nanogl-starter` (22 st) -- **nessuna licenza** |
| ultranoir | `ultranoir` | 9 | tutti a 0 stelle, incluso `ultranoir-portfolio-webgl` (marzo 2026) |
| Bornfight | `bornfight` | 71 | tanta roba PHP/Kotlin, poco frontend creativo |
| Unseen Studio | `unseen-studio` | **0** | **vuota. Il codice vero e' su `craftedbygc`, 13 repo** |
| Rally Interactive | `rallyinteractive` | 0 | account fermo, zero repository |
| North Kingdom | `northkingdom` | 10 | quasi tutti fork; `hooper` (MIT) e' un fork di terzi |
| Your Majesty | `YourMajesty` | 2 | account personale, `pixter` e un test. Niente |
| B-Reel | `b-reel` | 4 | roba VR/Android del 2015-2017, ferma |
| ToyFight | `toyfight` | 0 | vuota |
| Bakken & Baeck | `bakkenbaeck` | 61 | letta per intero: iOS/Swift/Kotlin, `iOS-handbook` 397 st |

**Il caso Dogstudio e' istruttivo.** L'organizzazione `dogstudio` e' viva (bio aggiornata,
"multidisciplinary creative studio at the intersection of art, design and technology") e ha zero
repository pubblici. Ma `highway` -- "Highway, a Modern Javascript Transitions Manager", 1.417
stelle, MIT -- **e' loro**, e su npm si chiama ancora `@dogstudio/highway`. Sta nell'organizzazione
`dept`, perche' DEPT ha assorbito lo studio. Chi cerca il codice di uno studio comprato deve
cercare **anche sotto il compratore**.

**E il caso Lusion e' una correzione a un errore precedente.** In cartella Lusion risultava fra i
"verificati ASSENTI". Non lo e': l'organizzazione si chiama **`lusionltd`** e ha due repository,
entrambi MIT, uno dei quali (`WebGL-Scroll-Sync`, 359 stelle) e' esattamente il genere di cosa
che ci interessa. Un nome sbagliato aveva fatto dichiarare assente una cosa che c'e'.

---

# 3. La tabella: 99 studi con codice pubblico

Ordinata per paese. La colonna **premi** e' contesto di settore (circuiti in cui lo studio e'
noto), **non e' un dato misurato oggi**: tutto il resto della riga invece si', ed e' del
13/08/2026. Dove non ho una base solida scrivo `n.d.`, che significa "non verificato", non
"nessun premio".

| studio | paese | premi | org GitHub | esiste | repo | i due migliori (stelle) | licenza prevalente |
|---|---|---|---|---|---:|---|---|
| AKQA | UK | Cannes, Webby | `akqa` | si | 8 | configy (2) / knife-eucalyptus (1) | MIT |
| UNIT9 | UK | FWA, Cannes | `unit9` | si | 37 | justareflektor (207) / coffee-bone (49) | NESSUNA |
| Rehab | UK | FWA | `rehabstudio` | si | 58 | fbmessenger (113) / docker-gunicorn-nginx (103) | MIT |
| Clearleft | UK | n.d. | `clearleft` | si | 23 | clearless (475) / nice-guidelines (7) | NESSUNA |
| Wonderhood Studios | UK | n.d. | `wonderhood` | si | 2 | K14course1 (0) / wonderlearn (0) | NESSUNA |
| Framestore | UK | Oscar VFX, Cannes | `framestore` | si | 15 | tk-framework-widget (1) / tk-shell (1) | Other |
| The Mill | UK | Cannes | `themill` | si | 9 | wiz (50) / qip (13) | NESSUNA |
| **Unseen Studio** | UK | Awwwards | **`craftedbygc`** | si | 13 | **taxi (639)** / e (59) | **BSD-3 / MIT** |
| **Lusion** | UK | Awwwards SOTY, FWA | **`lusionltd`** | si | 2 | **WebGL-Scroll-Sync (359)** / ORYZO-1 (76) | **MIT** |
| Huge | US | Webby | `hugeinc` | si | 42 | styleguide (1852) / flexboxgrid-sass (398) | MIT |
| Big Spaceship | US | Webby | `bigspaceship` | si | 24 | shine.js (2173) / font-attr (42) | NESSUNA |
| Firstborn | US | FWA | `firstborn` | si | 5 | Craft-CMS-Migration-Manager (127) / -- | **MIT su tutti e 5** |
| Code and Theory | US | Webby | `codeandtheory` | si | 31 | YCharts (679) / ychat (147) | Apache-2.0 |
| Postlight | US | Webby | `postlight` | si | 52 | **parser (5787)** / headless-wp-starter (4549) | Apache-2.0 |
| Upstatement | US | Webby | `upstatement` | si | 71 | routes (201) / jigsaw (156) | NESSUNA |
| Viget | US | n.d. | `vigetlabs` | si | 263 | **blendid (4916)** / gulp-rails-pipeline (640) | NESSUNA |
| Use All Five | US | Awwwards | `useallfive` | si | 141 | true-visibility (112) / StreetviewSequence (46) | MIT |
| Sparkbox | US | n.d. | `sparkbox` | si | 181 | bouncy-ball (605) / style-prototype (346) | NESSUNA |
| Barrel | US | n.d. | `barrel` | si | 51 | **shopify-vite (459)** / barrel-cli (22) | NESSUNA |
| Odopod | US | FWA | `odopod` | si | 4 | code-library (27) / style-guide (0) | MIT |
| Deeplocal | US | Cannes, Webby | `deeplocal` | si | 13 | mocktailsmixer (392) / fruit-genie (86) | NESSUNA |
| Ramotion | US/RU | n.d. | `ramotion` | si | 42 | **animated-tab-bar (11088)** / folding-cell (10186) | **MIT (37 su 42)** |
| MetaLab | CA | n.d. | `metalabdesign` | si | 43 | AsyncAwait (402) / dn_api_v2 (20) | NESSUNA |
| Sid Lee | CA | Cannes | `sidlee` | si | 2 | php-flow-manager (0) / google-authenticator (0) | MIT |
| **DEPT (con Dogstudio)** | NL/BE | Awwwards, FWA | `dept` | si | 98 | **highway (1417)** / algomart (181) | NESSUNA |
| Random Studio | NL | Awwwards, FWA | `randomstudio` | si | 124 | osc-simulator (39) / omxconductor (11) | NESSUNA |
| Q42 | NL | n.d. | `q42` | si | 263 | AndroidScrollingImageView (1757) / delighters (744) | MIT |
| Momkai | NL | Awwwards | `momkai` | si | 5 | imlazy (2) / greenlight (0) | MIT |
| Fabrique | NL | n.d. | `fabrique` | si | 10 | wagtail-easy-thumbnails (9) / django-sortedm2m (4) | NESSUNA |
| Build in Amsterdam | NL | Awwwards | `buildinamsterdam` | si | 6 | contentful-rest (1) / use-keydown (1) | MIT |
| Superhero Cheesecake | NL | Awwwards | `superherocheesecake` | si | 4 | csv-splitter (4) / chunks-tool (3) | MIT |
| CLEVER FRANKE | NL | Information is Beautiful | `cleverfranke` | si | 17 | cf-kyt-starter (35) / weather-chart-doc (4) | NESSUNA |
| Studio Dumbar | NL | D&AD | `studiodumbar` | si | 4 | kirby-extensions (53) / starterskit (9) | NESSUNA |
| Vruchtvlees / Verve | NL | n.d. | `vruchtvlees` | si | 2 | cms (0) / tiny-flux (0) | Other |
| 84.Paris | FR | Awwwards, FWA | `84paris` | si | 5 | canvasvideo.js (58) / -- | MIT |
| Bonhomme Paris | FR | Awwwards | `bonhommeparis` | si | 5 | bonnie.js (1) / Bloom (0) | MIT |
| **Cher Ami** | FR | Awwwards | `cher-ami` | si | 11 | **router (37)** / chersite (11) | **MIT (7 su 11)** |
| ultranoir | FR | Awwwards, FWA | `ultranoir` | si | 9 | ultranoir-portfolio-webgl (0) / -- | NESSUNA |
| Make Me Pulse | FR | Awwwards, FWA | `makemepulse` | si | 16 | 2024-kaizen-public (54) / nanogl-starter (22) | NESSUNA |
| Akaru | FR | Awwwards | `akaru` | si | 2 | (account personale, test tecnici) | n.d. |
| Immersive Garden | FR/BE | Awwwards | `immersive-garden` | si | 2 | glsl-easings (2) / igpu (0) | Unlicense |
| Edenspiekermann | DE | n.d. | `edenspiekermann` | si | 71 | sprite.sh (328) / **a11y-toggle (306)** | MIT |
| denkwerk | DE | n.d. | `denkwerk` | si | 31 | standards (8) / denkstrap-structure (6) | NESSUNA |
| Demodern | DE | Awwwards | `demodern` | si | 3 | (tre fork, 0 stelle) | NESSUNA |
| Hi-ReS! | DE | FWA (storico) | `hi-res` | si | 14 | 360player (4) / hires.as3 (3) | NESSUNA |
| Jung von Matt TECH | DE | Cannes | `jungvonmatt` | si | 18 | contentful-migrations (22) / contentful-ssg (15) | MIT |
| ressourcenmangel | DE | n.d. | `ressourcenmangel` | si | 8 | fractal-pug-adapter (8) / kuchenblech (4) | MIT |
| Aperto | DE | n.d. | `aperto` | si | 1 | uqwxd-react_labs (0) | Apache-2.0 |
| ICS INC. | JP | n.d. | `ics-creative` | si | 318 (300 letti) | 170330_webpack (158) / japanese-proofreading (155) | MIT |
| CyberAgent | JP | n.d. | `cyberagent` | si | 27 | boombox.js (226) / beez (97) | MIT |
| Rhizomatiks | JP | Cannes, Ars Electronica | `rhizomatiks` | si | 4 | rzm_logos (11) / inspired_by_prfm (9) | NESSUNA |
| Grupo W | BR | FWA, Cannes | `grupow` | si | 7 | as3-Sound-Manager (17) / as3package (3) | NESSUNA |
| Cheesecake Labs | BR | n.d. | `cheesecakelabs` | si | 100 | ReactNativeCklExample (103) / django-drf-boilerplate (33) | NESSUNA |
| Codeminer42 | BR | n.d. | `codeminer42` | si | 14 | cm42-central (328) / skills (27) | NESSUNA |
| Aerolab | AR | Awwwards | `aerolab` | si | 50 | **midnight.js (3647)** / blockrain.js (993) | NESSUNA |
| basement.studio | AR | Awwwards | `basementstudio` | si | 49 | **scrollytelling (1629)** / xmcp (1310) | NESSUNA |
| Netguru | PL | n.d. | `netguru` | si | 139 | **sticky-parallax-header (2027)** / ResponseDetective (1946) | MIT |
| Monterail | PL | n.d. | `monterail` | si | 112 | zip-codes (123) / rails-event-sourcing (100) | MIT |
| Vazco | PL | n.d. | `vazco` | si | 91 | **uniforms (2104)** / universe-modules (51) | MIT |
| Callstack | PL | n.d. | `callstack` | si | 108 | **react-native-paper (14443)** / linaria (12349) | MIT |
| Software Mansion | PL | n.d. | `software-mansion` | si | 60 | **react-native-reanimated (10956)** / react-native-svg (7998) | **MIT (33 su 60)** |
| 10Clouds | PL | n.d. | `10clouds` | si | 70 | FluidBottomNavigation-android (324) / -rn (197) | NESSUNA |
| Tonik | PL | n.d. | `tonik` | si | 29 | theme (1325) / html-frontend-boilerplate (93) | NESSUNA |
| Obys | UA | Awwwards SOTY | `obys` | si | 1 | (account personale, hello-world) | n.d. |
| Zajno | UA | Awwwards | `zajno` | si | 10 | common-utils (7) / static-site-template (6) | NESSUNA |
| Halo Lab | UA | Awwwards | `halo-lab` | si | 72 | halo-lab (58) / **magnetic-hover (41)** | NESSUNA |
| Bornfight | HR | Awwwards | `bornfight` | si | 71 | avro-to-typescript (37) / RoundedTabBar (16) | NESSUNA |
| **Adoratorio Studio** | IT | Awwwards | `adoratorio` | si | 13 | **hades (4)** / apollo (4) | NESSUNA |
| **MONOGRID** | IT | Awwwards, FWA | `monogrid` | si | 14 | **gainmap-js (161)** / gltf-loader-2 (10) | **MIT (11 su 14)** |
| Cantiere Creativo | IT | n.d. | `cantierecreativo` | si | 73 | redux-bees (589) / admino (56) | MIT |
| oio | IT/UK | n.d. | `oio` | si | 9 | bouncing-band (55) / murmur-diy (31) | NESSUNA |
| Burocratik | PT | Awwwards SOTY | `burocratik` | si | 2 | umami (1) / stats-withburo (0) | MIT |
| Mindera | PT | n.d. | `mindera` | si | 127 | Alicerce (466) / gradle-slack-plugin (153) | MIT |
| Whitesmith | PT | n.d. | `whitesmith` | si | 109 | **rubycritic (3499)** / WSTagsField (1285) | MIT |
| Charlie Tango | DK | n.d. | `charlie-tango` | si | 17 | hooks (81) / umbraco-rich-text (10) | NESSUNA |
| Signifly | DK | Awwwards | `signifly` | si | 59 | laravel-shopify (213) / laravel-janitor (59) | MIT |
| Kraftvaerk | DK | n.d. | `kraftvaerk` | si | 20 | OCPI (16) / generator-rammevaerk (5) | **MIT (16 su 20)** |
| Robocat | DK | Apple Design Award | `robocat` | si | 24 | MiawKit (22) / BuddyBuilder (8) | NESSUNA |
| North Kingdom | SE | FWA, Cannes | `northkingdom` | si | 10 | hooper (1) / alone-in-space (1) | MIT |
| B-Reel | SE | FWA, Cannes | `b-reel` | si | 4 | google-android-wear (61) / vr-weight (37) | NESSUNA |
| Odd Camp | SE | n.d. (chiuso 2023) | `oddcamp` | si | 97 | active_hash_relation (119) / rspec-api_helpers (38) | MIT |
| Odd Hill | SE | n.d. | `oddhill` | si | 60 | Stratagem (7) / context (7) | NESSUNA |
| Varvet | SE | n.d. | `varvet` | si | 130 | **pundit (8520)** / serenade.js (521) | MIT |
| Doberman | SE | n.d. | `doberman` | si | 16 | dbrmn-scss-boilerplate (11) / generator-doberman (5) | Other |
| Perfect Fools | SE | FWA (storico) | `perfectfools` | si | 20 | react-native-loading-dots (0) / -- | MIT |
| Bakken & Baeck | NO | Awwwards | `bakkenbaeck` | si | 61 | iOS-handbook (397) / daylight-ios (136) | NESSUNA |
| Snohetta | NO | design/architettura | `snohetta` | si | 1 | craft-boilerplate (1) | NESSUNA |
| Icelab | AU | n.d. | `icelab` | si | 67 | draft-js-autolist-plugin (69) / jquery-videosub (46) | MIT |
| Hardhat | AU | n.d. | `hardhatdigital` | si | 14 | rails-security-audit (85) / page-speed-guidelines (39) | MIT |
| S1T2 | AU | Awwwards | `s1t2` | si | 2 | (account personale) | n.d. |
| Springload | NZ | n.d. | `springload` | si | 136 | **react-accessible-accordion (785)** / css-reporter (124) | NESSUNA |
| Resn | NZ | FWA, Awwwards | `resn` | si | 8 | (tutti a 0 stelle, quasi tutti fork) | MIT |
| Cuberto | CY/RU | Awwwards | `cuberto` | si | 28 | liquid-swipe (2985) / **mouse-follower (822)** | **MIT (17 su 28)** |
| red_mad_robot | RU | n.d. | `redmadrobot` | si | 78 | input-mask-android (1218) / figma-export (821) | MIT |
| Sngular | ES | n.d. | `sngular` | si | 18 | kloadgen (217) / scs-multiapi-plugin (62) | MPL-2.0 |
| Wildbytes | ES | FWA | `wildbytes` | si | 2 | test3 (0) / Cing (0) | NESSUNA |
| Valtech | FR/global | n.d. | `valtech` | si | 28 | aem-easy-content-upgrade (64) / -- | NESSUNA |
| Very Big Things | RS/US | Awwwards | `verybigthings` | si | 52 | elixir_common (50) / provider (44) | NESSUNA |

## Le organizzazioni che esistono e sono VUOTE

Contano quanto le altre, perche' evitano di ricercarle domani. Tutte verificate oggi, tutte a
zero repository pubblici non-fork.

| studio | paese | org GitHub | nota |
|---|---|---|---|
| Dogstudio | BE | `dogstudio` | il codice e' in `dept` |
| Unseen Studio | UK | `unseen-studio` | il codice e' in `craftedbygc` |
| Jam3 | CA | `jam3` | la bio rimanda a Experience.Monks; anche `monks` e' vuota |
| Studio Freight | US | `studiofreight` | rinominata `darkroomengineering`, 50 repo |
| ToyFight | UK | `toyfight` | -- |
| DixonBaxi | UK | `dixonbaxi` | -- |
| Pentagram | UK/US | `pentagram` | -- |
| Rally Interactive | US | `rallyinteractive` | -- |
| Base Design | BE | `basedesign` | -- |
| Hello Monday | DK/US | `hellomonday` | bio viva, zero repo |
| Shape (Framna) | DK | `shapehq` | -- |
| Vertic | DK | `vertic` | -- |
| Ars Thanea | PL | `arsthanea` | -- |
| Kryptonum | PL | `kryptonum` | -- |
| Akaru studio | FR | `akaru-studio` | -- |
| Moku Studio | IT | `moku-studio` | -- |
| tha ltd. | JP | `tha-ltd` | -- |
| Whatever Inc | JP | `whatever-inc` | -- |
| Bascule | JP | `bascule` | -- |
| Mount Inc | JP | `mount-inc` | -- |
| Dot By Dot | JP | `dot-by-dot` | -- |
| YUMEMI | JP | `yumemi` | -- |
| Buck | US | `buck-design` | "This org is being sunset" |
| SapientNitro | US | `sapientnitro` | -- |
| NoA Ignite (ex Making Waves) | NO | `makingwaves` | -- |
| PHA5E | BE | `laphase5` | -- |
| BulbStudios | UK | `bulbstudios` | -- |
| Wolox | AR | `wolox` | -- |
| Tundra | -- | `tundra` | -- |

## Verificati ASSENTI (nessun account trovato, provate piu' varianti)

Merci-Michel, Aixsponza, Serial Cut, Erretres, Gummy Industries, Kolle Rebbe, Athletics NYC,
Tool of North America, Universal Favourite, Never Sit Still, Bond Habits, El Passion, Solar
Digital. Si aggiungono ai gia' noti TRIONN, Noomo, by-kin, Mosby's Files, 2xA.

**Correzione importante a un dato precedente: Lusion NON e' assente**, e' `lusionltd`.

## Gli omonimi: otto nomi che sembrano lo studio e non lo sono

Questa e' la trappola piu' insidiosa del lavoro, perche' produce dati falsi senza dare errore.
Tutti questi account esistono e rispondono 200; nessuno e' lo studio che si stava cercando.

| nome | chi e' davvero |
|---|---|
| `huge` | persona (linktr.ee/uhuge), roba di AI. Lo studio e' `hugeinc` |
| `koto` | Krzysztof Kotowicz, ricercatore di sicurezza. Non Koto Studio |
| `kode` | il repository di Robert Konrad (framework Kha). Non Kode (Italia) |
| `teamlab` | contenuti MOOC coreani della Gachon University. Non teamLab (Tokyo) |
| `party` | account con `tv`, `keg`, `party-server`. Non PARTY Tokyo |
| `caffeina` | account personale con due script del 2013. Non l'agenzia italiana |
| `vinta` | l'autore di `awesome-python` (Taiwan). Non Vinta Software (Brasile) |
| `charlietango` | persona ("I build apps for humans"). Lo studio danese e' `charlie-tango` |

Altri due minori: `fantasy`, `fi`, `handsome`, `impero`, `isobar`, `poke`, `precious`,
`greatworks`, `wunderman`, `buck`, `klick`, `taller`, `domestika`, `snask` e `mercimichel` sono
account senza rapporto con gli studi omonimi, o vuoti.

---

# 4. Gli strumenti riusabili

`_LIBRERIE-DEGLI-STUDI.md` copre gia' a fondo darkroom.engineering (Lenis, Tempus, Hamo, Satus),
basement.studio, brunosimon, pmndrs e GSAP. **Qui c'e' solo cio' che li' non c'e'**, uscito da
questa battuta. Numeri npm del 13/08/2026, scaricamenti dell'ultimo mese.

## Scorrimento, navigazione, transizioni di pagina

| strumento | studio | licenza | npm/mese | stato |
|---|---|---|---:|---|
| **`@unseenco/taxi`** | Unseen Studio (UK) | **BSD-3** | 1.907 | push 11/2025, **vivo** |
| `@unseenco/e` | Unseen Studio (UK) | BSD-3 | 4.026 | push 06/2025 |
| **`@dogstudio/highway`** | Dogstudio, ora in DEPT | **MIT** | 2.175 | push 04/2022, **fermo** |
| `@bsmnt/scrollytelling` | basement.studio (AR) | Other | 19.880 | fermo dal 2024 (gia' segnalato) |
| `@adoratorio/hades` | Adoratorio (IT) | **NESSUNA** | 721 | push 07/2026, vivo |
| `@cher-ami/router` | Cher Ami (FR) | MIT | 949 | push 04/2026, vivo |
| `@cher-ami/transitions-manager` | Cher Ami (FR) | MIT | -- | push 11/2023 |

**Taxi e' il pezzo che vale il viaggio.** E' il gestore di navigazione PJAX di Unseen Studio: 639
stelle, licenza BSD-3 (permissiva quanto MIT, con la clausola di non usare il nome), aggiornato a
novembre 2025. Fa le transizioni fra pagine senza ricaricare, con cache e gestione della
cronologia. E' l'alternativa viva a Highway, che fa la stessa cosa e **e' fermo dal 2022**:
Highway resta interessante come lettura, ma su un lavoro nuovo si parte da Taxi.

**Hades di Adoratorio (uno scrollbar "custom" italiano, aggiornato a luglio 2026) e' senza
licenza.** Vale la pena leggerlo -- e' scritto bene, TypeScript, piccolo -- ma **non si copia e
non si installa dentro il lavoro di un cliente** finche' non aggiungono un file di licenza. Lo
stesso vale per i loro `apollo` (cursore) e `demetra`. Fa eccezione `medusa` (MIT). Se il pezzo
serve davvero, si scrive a loro e si chiede: e' gente italiana e sono due minuti.

## Animazione, testo, cursore

| strumento | studio/persona | licenza | npm/mese | nota |
|---|---|---|---:|---|
| **`mouse-follower`** | Cuberto (CY) | **MIT** | 3.125 | cursore magnetico, 822 st |
| `magnetic-hover` | Halo Lab (UA) | **NESSUNA** | -- | 41 st, solo studio |
| `txt-shuffle` | Bruno Imbrizi (BR) | MIT | 5.320 | scramble del testo, 188 st |
| `@activetheory/split-text` | Active Theory (US) | MIT | 1.521 | alternativa a SplitText di GSAP |
| `@activetheory/fit-text` | Active Theory (US) | MIT | 235 | -- |
| `@theatre/core` + `studio` | Theatre.js | Apache-2.0 | 95.592 | editor di motion nel browser |
| `linaria` / `@linaria/core` | Callstack (PL) | MIT | 2.452.229 | CSS-in-JS a runtime zero |

**Nota sul cursore**: `mouse-follower` di Cuberto e' MIT, mantenuto, e fa esattamente la cosa che
in cartella e' gia' stata bocciata come principio (`niente-effetti-al-mouse`). Sta qui perche' e'
lo strumento migliore della categoria, non perche' vada usato: se un cliente lo pretende, questo
e' il modo di farlo bene invece che a mano.

## 3D e WebGL

| strumento | studio/persona | licenza | npm/mese | nota |
|---|---|---|---:|---|
| **`three-mesh-bvh`** | Garrett Johnson | **MIT** | **16.512.371** | raycast veloce, query spaziali |
| `three-gpu-pathtracer` | Garrett Johnson | MIT | 77.655 | path tracing su three.js |
| **`@monogrid/gainmap-js`** | **MONOGRID (IT)** | **MIT** | **15.285.118** | HDR con gain map, porting di Adobe |
| `three.meshline` | Jaume Sanchez (spite) | MIT | 75.390 | linee spesse in three.js |
| `curtainsjs` | Martin Laxenaire | MIT | 3.755 | WebGL sui DOM, 1.825 st |
| `gpu-curtains` | Martin Laxenaire | MIT | 2.122 | il successore in **WebGPU** |
| `phenomenon` | Colin van Eenige | MIT | 581.709 | API WebGL da 2 kB |
| `three-projected-material` | Marco Fugaro (14islands) | MIT | 881 | proiezione di texture |
| `WebGL-Scroll-Sync` | **Lusion (UK)** | MIT | -- | 359 st, come sincronizzare scroll e WebGL |
| `nanogl-starter` | Make Me Pulse (FR) | NESSUNA | -- | il loro starter, solo lettura |
| `shader-lab` | basement.studio (AR) | Apache-2.0 | -- | gia' in `_LIBRERIE` |

**Il numero che sorprende: `@monogrid/gainmap-js` fa 15,3 milioni di scaricamenti al mese.** E'
di uno studio di Firenze da quattordici repository. Non lo scarica il pubblico: lo tira dentro
`@react-three/drei` (15,2 milioni al mese) come dipendenza per le immagini HDR. Un pezzo tecnico
piccolo, entrato in una dipendenza grande, fa piu' numeri di tutto il resto della tabella. E' il
modello opposto a quello di chi pubblica un portfolio con 4.000 stelle e zero installazioni.

## Prestazioni, accessibilita', qualita'

| strumento | studio | licenza | npm/mese | nota |
|---|---|---|---:|---|
| **`react-accessible-accordion`** | Springload (NZ) | **MIT** | **473.996** | fisarmonica accessibile |
| `a11y-toggle` | Edenspiekermann (DE) | MIT | 1.330 | toggle accessibili, 306 st |
| `floating-focus-a11y` | Q42 (NL) | MIT | -- | stato di focus visibile e bello |
| `bouncy-ball` | Sparkbox (US) | MIT | -- | confronto fra tecniche di animazione |
| `rubycritic` | Whitesmith (PT) | MIT | -- | qualita' del codice Ruby, 3.499 st |
| `browserslist-to-esbuild` | Marco Fugaro (14islands) | MIT | **5.587.427** | target esbuild da browserslist |

## Build, CMS, impalcature

| strumento | studio | licenza | npm/mese | nota |
|---|---|---|---:|---|
| `vite-plugin-shopify` | Barrel (US) | MIT | 64.381 | Vite dentro i temi Shopify, 459 st |
| `blendid` | Viget (US) | MIT | 474 | 4.916 st ma **fermo dal 2020** |
| `uniforms` | Vazco (PL) | MIT | 81.579 | form da schema, 2.104 st |
| `parser` | Postlight (US) | Apache-2.0 | -- | estrae il contenuto da una pagina, 5.787 st |
| `contentful-ssg` | Jung von Matt (DE) | MIT | -- | Contentful verso file, per SSG |
| `sprite.sh` | Edenspiekermann (DE) | MIT | -- | sprite SVG da una cartella, 328 st |
| `theme` (Tonik) | Tonik (PL) | MIT | -- | starter WordPress moderno, 1.325 st |
| `react-native-reanimated` | Software Mansion (PL) | MIT | 25.613.793 | se mai servisse il mobile |

**Attenzione a `blendid`**: 4.916 stelle attirano, ma l'ultimo push e' del **2020** e fa 474
scaricamenti al mese. E' l'esempio da manuale della differenza fra stelle e uso reale gia'
enunciata in `_LIBRERIE-DEGLI-STUDI.md`: le stelle sono storia, i download sono il presente.

---

# 5. La statistica

## Quanti studi da premio hanno un'organizzazione pubblica

Su **128 studi cercati** in questa battuta (contando come uno solo studio tutte le varianti di
nome provate):

- **117 hanno un account GitHub** -- il 91%
- **99 hanno almeno un repository pubblico** -- il **77%**
- **18 hanno l'organizzazione registrata e vuota** -- il 14%
- **11 non hanno nulla di trovabile** -- il 9%

Detto in modo utile: **tre studi da premio su quattro pubblicano qualcosa, ma "qualcosa" quasi
mai e' il sito premiato.** Nella grandissima maggioranza dei casi quello che esce e'
infrastruttura interna -- plugin Laravel, moduli Drupal, boilerplate, configurazioni di lint,
librerie iOS. Il WebGL che vince i premi resta dentro.

Le eccezioni contano perche' sono poche: `craftedbygc/taxi`, `lusionltd/WebGL-Scroll-Sync`,
`dept/highway`, `basementstudio/scrollytelling`, `monogrid/gainmap-js`, `cuberto/mouse-follower`,
`makemepulse/nanogl-starter`, `activetheory/activeframe`, e naturalmente Lenis.

## La licenza: il 38% precedente era ottimista

`_REPO-CACCIA.md` aveva misurato **237 su 616 (38%)** senza licenza. Sul campione nuovo, molto
piu' largo:

- **4.469 repository di organizzazione** letti in questa battuta
- **1.957 senza alcuna licenza** = **44%**
- allargando a tutte le organizzazioni interrogate, comprese quelle non di studi (collettivi,
  redazioni tecniche): **5.219 repository, 2.330 senza licenza = 45%**

**Il 38% era ottimista: la cifra vera sta fra il 44 e il 45%.** Quasi la meta' del codice
pubblico degli studi da premio non e' riutilizzabile.

E la distribuzione conta piu' della media. Le organizzazioni si dividono in due famiglie nette:

- **quelle che pubblicano per essere usate**: Software Mansion (12 senza licenza su 60),
  Ramotion (3 su 42), Code and Theory (5 su 31), Postlight (12 su 52), Sngular (2 su 18),
  Kraftvaerk (3 su 20), MONOGRID (2 su 14). Qui la licenza c'e' perche' senza licenza il
  pacchetto non lo installerebbe nessuno;
- **quelle che pubblicano per mostrare**: Random Studio (90 senza licenza su 124), ICS (133 su 300 letti), Viget (145 su 263), Sparkbox (128 su 181), Cheesecake Labs (57 su 100), Halo Lab (47 su
  72), Bakken & Baeck (31 su 61). Qui la licenza manca perche' non e' mai stata la domanda:
  quel codice e' una vetrina, non un prodotto.

**Il crinale non e' fra studi bravi e studi meno bravi: e' fra chi pubblica un pacchetto e chi
pubblica un progetto.** Quando prendi qualcosa dalla seconda famiglia, sei sempre nel caso
"studia, non copiare".

Un caso limite da tenere a mente: **Adoratorio Studio (Italia)** ha una libreria di scroll
aggiornata a luglio 2026, ben scritta, con zero licenza. E' esattamente la situazione in cui la
tentazione e' massima e il rischio pure.

---

# 6. I tre fondatori da seguire

Criterio: sono fondatori o direttori di studi di questo censimento, e quello che pubblicano a
titolo personale e' piu' utile di quello che pubblica la loro azienda.

## 1. Clement Roche -- `github.com/clementroche` (darkroom.engineering, FR)

Cofondatore dello studio che ha fatto **Lenis**. Sul suo profilo personale ci sono 24 repository:
`nuxt-three` (63 st, MIT, starter Nuxt + three.js), `motion-hover-effects` (87 st), `laws` --
una raccolta di leggi e principi di progettazione aggiornata ad **agosto 2026**. Il valore non e'
il singolo repository: e' che si vede in tempo reale cosa entra nello stack di darkroom prima che
diventi una libreria. Chi seguiva questo profilo ha visto Lenis prima che fosse Lenis.

## 2. Edan Kwan -- `github.com/edankwan` (fondatore di Lusion, UK)

29 repository pubblici, 4.126 stelle. `The-Spirit` (1.273 st, **MIT**) e' l'esperimento WebGL di
particelle da cui e' uscita mezza estetica degli anni successivi; `PerspectiveTransform.js` (325
st) risolve un problema concreto (trasformazione 3D CSS su quattro punti). E' giudice FWA, quindi
quello che pubblica e' anche un indizio su cosa premiera'. Attenzione: **molti dei suoi
repository non hanno licenza** -- `The-Spirit` si', altri no. Va controllato uno per uno.

## 3. Marco Fugaro -- `github.com/marcofugaro` (creative tech, 14islands, IT/SE)

Il piu' pratico dei tre, ed e' italiano. `three-projected-material` (711 st, MIT) risolve la
proiezione di texture su modelli 3D, cosa che serve appena si prova a "vestire" un oggetto sotto
lo scroll. Ma il pezzo che dice chi e': **`browserslist-to-esbuild`, 5,6 milioni di scaricamenti
al mese**, dodici righe di codice utile che stanno dentro le build di mezzo mondo. Chi pubblica
cose cosi' ha capito la differenza fra un progetto e uno strumento.

**Fuori classifica, perche' non e' fondatore di uno studio ma vale piu' di tutti e tre**: Garrett
Johnson -- `github.com/gkjohnson`. `three-mesh-bvh` fa **16,5 milioni di scaricamenti al mese**,
e' MIT, ed e' aggiornato tre giorni fa. Se in un progetto three.js serve raycast veloce, collisioni
o query spaziali, e' lui che le risolve.

---

# 7. Cosa resta da fare

- **Le redazioni con squadre di grafica interattiva**: nytimes, guardian, propublica,
  reuters-graphics, the-pudding, ft-interactive, datadesk, nprapps, texastribune, bbc,
  washingtonpost, voxmedia. Verificate esistenti in `_REPO-CACCIA.md`, mai lette. Con la rotta
  JSON descritta al capitolo 1 si fanno tutte in una ventina di minuti, senza quota.
- **I musei**: metmuseum, cooperhewitt, rijksmuseum, artic, Smithsonian.
- **Gli sviluppatori creativi a titolo personale gia' raccolti oggi ma non spremuti**: mattdesl
  (639 repo), keijiro (932), akella (202), cabbibo (272), spite (139), mrdoob, dmnsgn, ykob,
  yiwenl, baku89, winkerVSbecks, vorg, wagerfield, MaximeHeckel, vaneenige, emilwidlund,
  AndrewPrifer, Mamboleoo, crnacura, cmiscm, MartinLaxenaire, brunoimbrizi, ashthornton, luruke.
  Per tutti questi **la licenza va verificata repository per repository**: la scheda del profilo
  non la mostra.
- **Codrops**: 345 repository, 69.217 stelle, e **174 su 300 letti senza licenza**. E' il piu'
  grande giacimento di effetti web che esista ed e' anche quello con il maggior rischio di
  copia-incolla illecito. Merita una scheda sua, con la licenza controllata caso per caso.
- **La domanda ancora aperta**, ereditata da `_LIBRERIE-DEGLI-STUDI.md`: pubblicare codice aperto
  porta clienti? Su questo campione allargato la risposta non cambia -- non c'e' una sola prova
  documentata, e la maggioranza degli studi da premio pubblica infrastruttura, non vetrina.

---

# 8. Verificabilita'

Tutto quello che sta in questo file e' riproducibile con due comandi.

```
# esistenza, capitalizzazione canonica, descrizione, organizzazione o persona
curl -s https://github.com/NOME | grep -E 'octolytics-dimension-user_login|meta name="description"|schema.org/Organization'

# tutti i repository con stelle, licenza, linguaggio, ultimo push -- SENZA quota API
curl -s -H "Accept: application/json" "https://github.com/orgs/NOME/repositories?type=source&page=1"

# uso reale di un pacchetto
curl -s https://api.npmjs.org/downloads/point/last-month/NOME_PACCHETTO
```

Date: profili e repository letti il **13/08/2026**; scaricamenti npm dell'intervallo
**11/07/2026 - 09/08/2026**. La quota API non autenticata era a zero all'inizio del lavoro e
**non e' mai stata usata**: l'intero censimento e' stato fatto con la rotta HTML/JSON.

**E per l'ultima volta: senza licenza si studia, non si copia.**
