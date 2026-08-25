# I sorgenti aperti gia' celebri nel mestiere

La biblioteca di codice che una persona che apre uno studio creativo dovrebbe
avere sul disco. Non "repository interessanti": roba **premiata o riconosciuta**
nel settore, con il codice davvero leggibile.

Rilevazione del 13/08/2026, in due passate. Ogni repository elencato e' stato
aperto e verificato: **nessun URL inventato**. Dove una cosa non si e' potuta
verificare, c'e' scritto.

**Come e' stata presa la licenza, che e' la colonna che costa piu' fatica.** Tre
strade, in ordine di resa:

1. `https://api.github.com/users/NOME/repos?per_page=100` rende cento repository
   in **una sola** richiesta, licenza compresa. Con un tetto di 60 richieste
   all'ora e' l'unico modo sensato di spendere la quota: cinquantadue richieste
   hanno coperto oltre settecento repository.
2. Finita la quota, la licenza si legge **dalla pagina HTML** del repository, che
   il tetto non ce l'ha. Il marcatore da cercare e' `href="#MIT-1-ov-file"`
   nella barra laterale: il pezzo prima di `-1-ov-file` E' la licenza. Se non
   c'e' quel collegamento, non c'e' licenza. Quaranta repository verificati
   cosi', a costo zero.
3. Quando GitHub segna `NOASSERTION` o non riconosce nulla, **il file va aperto a
   mano**: e' li' che si trovano le sorprese (vedi `spite/Wagner`, MIT che pero'
   esclude gli shader; e `oframe/ogl`, che dichiara la licenza nel
   `package.json` senza avere il file).

Il proxy `https://ungh.cc/repos/OWNER/NOME` non ha tetto e serve a verificare in
massa **se un repository esiste**, ma non riporta la licenza.

---

## LA REGOLA, prima di tutto

> **SENZA LICENZA SI STUDIA, NON SI COPIA.**

Un repository pubblico su GitHub non e' codice libero. Se manca il file LICENSE,
il codice resta coperto dal diritto d'autore pieno: puoi leggerlo, capire la
tecnica, riscriverla con parole tue. Non puoi incollarlo nel progetto di un
cliente.

| Marcatura | Cosa vuol dire | Cosa puoi fare |
|---|---|---|
| **MIT** / **Apache-2.0** / **BSD** / **ISC** / **Unlicense** / **CC0** | licenza permissiva vera | USABILE: copia, modifica, vendi. Tieni l'avviso di copyright. |
| **MPL-2.0** | copyleft di file | USABILE con attenzione: i file modificati restano MPL. |
| **GPL** / **AGPL** | copyleft forte | PERICOLOSO sul lavoro cliente: contamina il progetto. Studia e basta. |
| **NOASSERTION** | c'e' un file di licenza ma GitHub non lo riconosce | LEGGI IL FILE a mano prima di toccare niente. |
| **NESSUNA** | nessun permesso concesso | **SOLO STUDIO.** Leggere si', copiare no. |

Questa regola andava verificata in modo speciale per **Codrops**, e la verifica
ha dato una risposta precisa: le demo **sono MIT**, dichiarate tali sulla pagina
di licenza del sito, ma dal 2020 in poi hanno anche il file nel repository e
prima no. Restano fuori dalla licenza le immagini e i font che ci stanno dentro.
Tutti i numeri e la prova sono nella sezione 2.

---

## 1. I portfolio personali premiati e aperti

Il dato da cui partire, e non e' un dettaglio: **quasi nessun portfolio premiato
e' aperto.** La caccia sistematica in `_SITI-DA-STUDIARE.md` ha trovato sei soli
originali su 69 repository, e il resto erano cloni di studenti. Quindi questa
sezione e' corta per forza: quelli che ci sono valgono tutti gli altri messi
insieme.

### Bruno Simon - il caso unico

E' l'unico sviluppatore premiato che pubblica il sorgente **del sito che ha
vinto**, e per giunta con licenza permissiva. Il portfolio con la macchina da
guidare (Awwwards e FWA, 2019: registrato in `_SITI-DA-STUDIARE.md`) e' anche il
repository di sito 3D piu' letto al mondo.

| repository | stelle | licenza | ultimo push | cosa si impara di preciso |
|---|---:|---|---|---|
| [brunosimon/folio-2019](https://github.com/brunosimon/folio-2019) | **4.728** | **MIT** (file `license.md`) | 25/05/2024 | come si tengono i 60 fotogrammi con una scena piena di oggetti fisici: la fisica gira su cannon.js in un mondo separato dalla grafica, e il rendering legge solo le posizioni. E' il modello di come si separa simulazione e disegno. |
| [brunosimon/folio-2025](https://github.com/brunosimon/folio-2025) | 1.689 | **MIT** | 07/04/2026 | la stessa idea riscritta sei anni dopo, con three.js moderno: si legge in parallelo alla 2019 e si vede cosa e' cambiato nel mestiere in sei anni. Vale come corso intero. |
| [brunosimon/my-room-in-3d](https://github.com/brunosimon/my-room-in-3d) | 4.476 | **NESSUNA** | 12/09/2023 | come si fa il baking da Blender a three.js: luci e ombre cotte in una texture, materiale non illuminato in scena. E' la tecnica che fa sembrare "renderizzato" un sito che gira a 60 fps su un portatile. |
| [brunosimon/infinite-world](https://github.com/brunosimon/infinite-world) | 625 | **NESSUNA** | 05/02/2023 | come si genera un mondo infinito a chunk con il rumore, e come si scaricano i pezzi usciti dal campo visivo senza far scattare il frame. |
| [brunosimon/three.js-tsl-sandbox](https://github.com/brunosimon/three.js-tsl-sandbox) | 203 | **NESSUNA** | 03/08/2026 | il nuovo linguaggio di shader di three.js (TSL, che compila sia in GLSL sia in WGSL) provato esempio per esempio. E' la cosa piu' recente su cui si possa mettere le mani: aggiornata questo mese. |
| [brunosimon/webgl-black-hole](https://github.com/brunosimon/webgl-black-hole) | 285 | **NESSUNA** | 06/07/2022 | come si piega la luce attorno a un punto con un solo shader su un piano: effetto da copertina, costo quasi nullo. |
| [brunosimon/organic-sphere](https://github.com/brunosimon/organic-sphere) | 248 | **NESSUNA** | 07/10/2021 | come si deforma una sfera con il rumore nel vertex shader per farla sembrare viva e non modellata. |
| [brunosimon/doom-portal-in-webgl](https://github.com/brunosimon/doom-portal-in-webgl) | 162 | **NESSUNA** | 21/09/2021 | come si fa un portale che mostra un'altra scena dentro a un buco: render target usato come texture. |
| [brunosimon/threejs-template-complex](https://github.com/brunosimon/threejs-template-complex) | 293 | **NESSUNA** | 12/12/2022 | l'architettura di un progetto three.js serio: Experience singleton, Resources con il caricamento, Sizes, Time. E' lo scheletro che poi si ritrova in meta' dei siti WebGL. |
| [brunosimon/keppler](https://github.com/brunosimon/keppler) | 1.933 | **MIT** | 26/06/2022 | come si trasmette il codice in tempo reale a un'aula durante una lezione. Serve il giorno in cui insegni, non il giorno in cui produci. |

**La trappola da conoscere.** Solo `folio-2019`, `folio-2025` e `keppler` hanno
un file di licenza. Tutti gli altri, compreso `my-room-in-3d` che e' il piu'
copiato, **non hanno licenza**: si studiano, non si copiano. Nota che
`_SITI-DA-STUDIARE.md` segnava `folio-2019` e `folio-2025` come "nessuna": era
sbagliato, il file c'e' e si chiama `license.md` in minuscolo. **Sono MIT
davvero, verificato aprendo il file.**

### Gli altri portfolio aperti verificati

| repository | cos'e' | stelle | licenza | ultimo push | cosa si impara di preciso |
|---|---|---:|---|---|---|
| [bchiang7/v4](https://github.com/bchiang7/v4) | il portfolio di Brittany Chiang, **il piu' copiato del mondo** fra gli sviluppatori | **8.274** | **MIT** | 13/08/2026 | non e' un sito da premio grafico: e' la lezione su come un portfolio sobrio, veloce e accessibile diventi un biglietto da visita per dieci anni. Da leggere quando devi fare il TUO sito, non quello del cliente. |
| [bchiang7/bchiang7.github.io](https://github.com/bchiang7/bchiang7.github.io) | la terza versione, in Jekyll | 850 | (da leggere a mano) | 11/08/2026 | l'archeologia della stessa persona: si vede come cambia un portfolio nel tempo. |

**Gli originali dei siti di studio** (Basement, Studio Freight/Darkroom, Star
Atlas, ustwo) sono gia' catalogati in `_SITI-DA-STUDIARE.md`, con md5 e
istruzioni di clonazione: **non si duplicano qui.** Se cerchi il sorgente di un
sito premiato, quello e' il file giusto, insieme a `_SOURCEMAP-SWEEP.md` per i
72 casi in cui la sourcemap dimenticata in produzione restituisce il sorgente
originale.

---

## 2. CODROPS - la miniera degli effetti isolati

L'organizzazione [`codrops`](https://github.com/codrops) e' la piu' utile di
tutta la ricerca per un motivo semplice: ogni demo e' **un effetto solo, isolato,
in una cartella che si apre e si guarda in dieci minuti**, invece che un sito
intero da cui estrarre la tecnica a fatica. E' l'esatto contrario dei sorgenti
degli studi.

**Quante sono: almeno 300** (tre pagine piene da cento, scaricate una per una il
13/08/2026), per 36.015 stelle in tutto secondo il conteggio di
`_REPO-CACCIA.md`. Coprono dal 2012 a oggi: l'ultima e' del 18/06/2026.

### La licenza: la risposta e' precisa, e non e' quella che sembra

Guardando solo GitHub sembrerebbero quasi tutte senza licenza. **Non e' cosi', ed
e' il contrario di quel che si teme.** Verificato su tre fronti:

1. **La pagina ufficiale** <https://tympanus.net/codrops/licensing/> dice, testuale:
   *"Our downloadable demos are licensed under the MIT license, if not
   specifically mentioned otherwise"*, seguito dal testo MIT completo,
   "Copyright (c) 2024 Codrops".
2. **I file nei repository**: su 300 scaricati, **118 hanno il file LICENSE MIT e
   182 non ce l'hanno.**
3. **Lo spartiacque e' l'anno**, ed e' netto:

| ultimo push | con LICENSE MIT | senza file |
|---|---:|---:|
| 2012-2019 (i classici) | **0** | 155 |
| 2020 (l'anno del cambio) | 16 | 13 |
| 2021-2026 (i moderni) | **102** | 14 |

Dal 2020 in poi Codrops ha cominciato a mettere il file MIT in ogni demo. Prima
non lo metteva: quelle demo sono coperte dalla dichiarazione generale del sito,
che vale, ma **e' una dichiarazione su una pagina web, non un file nel
repository**. Se il codice deve finire in un lavoro pagato, sulle demo vecchie
salva anche uno screenshot della pagina di licenza: e' la tua prova.

### Le tre cose che la MIT di Codrops NON copre

Questa e' la trappola vera, e non sta su GitHub ma dentro ai README:

- **Le immagini.** Ogni demo moderna ha una sezione `## Credits` che dice da dove
  vengono. Esempio verificato, `RepeatingImageTransition`: *"Images generated
  with Midjourney"*. Altre usano Unsplash o foto di autori citati. **La MIT
  copre il codice, non le foto.** In un lavoro cliente le immagini si
  sostituiscono, sempre.
- **I font.** Molte demo caricano caratteri commerciali per la resa della demo.
  Vanno ricomprati.
- **Le "design freebies"**, che sono un'altra cosa dalle demo: la stessa pagina
  dice che si possono usare in progetti personali e commerciali **tranne**
  ridistribuirle o rivenderle, anche modificate. E gli articoli non si
  ripubblicano.

> Onesta': **non ho potuto verificare demo per demo la dicitura "Site of the
> Day"**. Codrops e' un punto di riferimento riconosciuto del mestiere e i suoi
> effetti si ritrovano su siti premiati, ma un albo che assegni un premio alla
> singola demo non e' consultabile da riga di comando. Trattale come "tecnica di
> riferimento", non come "vincitrice di un premio".

### Le demo che servono davvero a un sito immersivo

Scelte fra le 300 per un criterio solo: **servono a costruire un sito che si
muove sullo scroll**. Ordinate per utilita', non per stelle.

| demo | stelle | licenza | ultimo push | cosa si impara di preciso |
|---|---:|---|---|---|
| [CodropsTemplate](https://github.com/codrops/CodropsTemplate) | 139 | **MIT** | 31/05/2026 | lo scheletro con cui Codrops stessa parte per ogni demo. E' il punto da cui cominciare a scrivere le TUE demo: struttura, build, come si impacchetta un effetto perche' sia leggibile da un altro. |
| [SlideshowAnimations](https://github.com/codrops/SlideshowAnimations) | 305 | **MIT** | 13/04/2025 | una raccolta di transizioni di slideshow in un solo repository: si sceglie la variante e si legge solo quella. La piu' redditizia per ora spesa. |
| [OnScrollTypographyAnimations](https://github.com/codrops/OnScrollTypographyAnimations) | 343 | **MIT** | 05/12/2023 | come si anima il testo mentre entra nel campo visivo senza che diventi illeggibile: e' il 70% di quello che si vede sui siti premiati. Vedi anche `_ANIMAZIONE-TESTO.md`. |
| [ScrollBasedLayoutAnimations](https://github.com/codrops/ScrollBasedLayoutAnimations) | 333 | **MIT** | 20/07/2023 | come si cambia proprio il LAYOUT durante lo scroll (da griglia a colonna a schermo intero) con GSAP Flip, invece di limitarsi a spostare le cose. |
| [Scroll3DGrid](https://github.com/codrops/Scroll3DGrid) | 181 | **MIT** | 03/08/2023 | come si mette una griglia di immagini in prospettiva e la si attraversa scorrendo: profondita' vera con CSS 3D, zero WebGL. |
| [TileScroll](https://github.com/codrops/TileScroll) | 229 | **MIT** | 14/10/2020 | come si accoppiano Locomotive Scroll e le animazioni della griglia: e' il ponte fra lo scroll morbido e gli effetti. Vedi `locomotive.md`. |
| [HorizontalSmoothScrollLayout](https://github.com/codrops/HorizontalSmoothScrollLayout) | 162 | **MIT** | 09/12/2020 | come si fa scorrere una pagina in orizzontale mantenendo la barra di scorrimento verticale del browser: il trucco che regge tutti i siti "a nastro". |
| [KineticTypePageTransition](https://github.com/codrops/KineticTypePageTransition) | 123 | **MIT** | 30/05/2025 | come si usa una parola gigante come copertura del cambio pagina: la transizione che nasconde il caricamento invece di aspettarlo. |
| [3DStackMotion](https://github.com/codrops/3DStackMotion) | 115 | **MIT** | 06/03/2024 | come si impila un mazzo di carte in 3D e lo si sfoglia sullo scroll. |
| [OnScrollLayoutFormations](https://github.com/codrops/OnScrollLayoutFormations) | 115 | **MIT** | 19/09/2024 | come si fanno "atterrare" elementi sparsi in una formazione ordinata mentre si scorre. |
| [ScrollBlurTypography](https://github.com/codrops/ScrollBlurTypography) | 146 | **MIT** | 23/04/2024 | come si rivela il testo dalla sfocatura: costa poco e legge come "cinema". |
| [GooeyTextHoverEffect](https://github.com/codrops/GooeyTextHoverEffect) | 156 | **MIT** | 06/08/2024 | l'effetto "gocciolante" fatto con i filtri SVG (blur + contrasto): il piu' alto rapporto fra resa e righe di codice del catalogo. |
| [ElasticGridScroll](https://github.com/codrops/ElasticGridScroll) | 56 | **MIT** | 03/06/2025 | come si fanno scorrere le colonne di una griglia a velocita' leggermente diverse: la parallasse fatta bene, senza libreria. |
| [RepeatingImageTransition](https://github.com/codrops/RepeatingImageTransition) | 24 | **MIT** | 01/05/2025 | come si sposta un'immagine lungo un percorso lasciando copie dietro di se': l'effetto "scia" che si vede sui portfolio nuovi. |
| [RotatingOnScrollAnimations](https://github.com/codrops/RotatingOnScrollAnimations) | 31 | **MIT** | 18/06/2026 | la piu' recente di tutte: rotazione 3D delle immagini legata allo scroll. |
| [codrops-sketches](https://github.com/codrops/codrops-sketches) | 202 | **MIT** | 17/02/2024 | decine di varianti e idee mai diventate articolo: e' il quaderno degli scarti, e gli scarti sono spesso i piu' interessanti. |
| [astro-shop-view-transitions](https://github.com/codrops/astro-shop-view-transitions) | 117 | **MIT** | 28/02/2024 | come si fa una transizione di pagina con la View Transitions API nativa invece che con JavaScript. Vedi `_TRANSIZIONI-DI-PAGINA.md`. |

### I classici senza file di licenza (dichiarati MIT solo sul sito)

Sono i piu' famosi e i piu' vecchi. Si usano, ma con la cautela detta sopra.

| demo | stelle | licenza | ultimo push | cosa si impara di preciso |
|---|---:|---|---|---|
| [RainEffect](https://github.com/codrops/RainEffect) | **1.771** | nessun file (MIT dichiarata sul sito) | 12/09/2022 | come si simula la pioggia sul vetro in WebGL: gocce che si ingrossano, colano e trascinano le altre. E' l'effetto piu' citato del catalogo. |
| [PageTransitions](https://github.com/codrops/PageTransitions) | **2.311** | nessun file | 05/08/2024 | la raccolta storica delle transizioni di pagina in sola CSS: si legge per capire cosa si puo' fare senza JavaScript. |
| [HoverEffectIdeas](https://github.com/codrops/HoverEffectIdeas) | 1.648 | nessun file | 17/10/2023 | il repertorio degli hover discreti: quelli che si notano solo se mancano. |
| [LiquidDistortion](https://github.com/codrops/LiquidDistortion) | 470 | nessun file | 10/10/2017 | come si distorce una slideshow con una mappa di spostamento in WebGL usando PixiJS e GSAP: il matrimonio 2D+shader che costa pochissimo. |
| [SmoothScrollingImageEffects](https://github.com/codrops/SmoothScrollingImageEffects) | 335 | nessun file | 29/01/2020 | come si deformano le immagini in funzione della VELOCITA' dello scroll, non della posizione: e' la differenza fra "si muove" e "ha inerzia". |
| [ImageTiltEffect](https://github.com/codrops/ImageTiltEffect) | 567 | nessun file | 06/10/2018 | l'inclinazione con copie semitrasparenti sfalsate: profondita' finta a costo zero. |
| [CSSGlitchEffect](https://github.com/codrops/CSSGlitchEffect) | 702 | nessun file | 22/12/2017 | il glitch fatto con `clip-path` e animazioni CSS invece che con un video. |
| [BlockRevealers](https://github.com/codrops/BlockRevealers) | 554 | nessun file | 01/10/2020 | i blocchi che scoprono il contenuto scorrendo via: il rivelatore piu' usato in assoluto nei siti da premio. |
| [ScrollSpiral](https://github.com/codrops/ScrollSpiral) | 233 | nessun file | 26/04/2017 | come si dispone il contenuto su una spirale percorsa dallo scroll. |
| [TextDistortionEffects](https://github.com/codrops/TextDistortionEffects) | 100 | nessun file | 06/02/2019 | come si passa il testo attraverso uno shader (con Blotter.js) per liquefarlo mantenendolo selezionabile. |

---

## 3. pmndrs (Poimandres) - l'ecosistema React per il 3D

Il secondo bacino piu' grosso di tutta la ricerca: **99 repository, 226.657
stelle** (`_REPO-CACCIA.md`). E' un collettivo, non un'azienda, e la differenza
si vede: quasi tutto e' MIT, cioe' **usabile davvero in un lavoro pagato**.

### Il nucleo: le cinque che servono davvero

| repository | stelle | licenza | ultimo push | cosa si impara di preciso |
|---|---:|---|---|---|
| [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | **31.702** | **MIT** | 11/08/2026 | come si scrive una scena three.js in JSX senza pagare overhead: `<mesh />` diventa `new THREE.Mesh()`, e i componenti si aggiornano fuori dal ciclo di React. Il pezzo da leggere e' `useFrame`, che e' il ciclo di rendering condiviso: capito quello, si e' capita la libreria. |
| [pmndrs/drei](https://github.com/pmndrs/drei) | 9.796 | **MIT** | 05/08/2026 | e' l'archivio delle soluzioni gia' trovate: `ScrollControls` (lo scroll che pilota la scena), `Environment` (illuminazione da HDRI in una riga), `MeshTransmissionMaterial` (il vetro che si vede su ogni sito da premio), `Text3D`, `useGLTF`. **Leggere il sorgente di una helper alla volta e' il modo piu' veloce che esista per imparare three.js.** |
| [pmndrs/gltfjsx](https://github.com/pmndrs/gltfjsx) | 5.838 | **MIT** | 04/11/2024 | come si trasforma un `.glb` uscito da Blender in un componente React con i nodi gia' nominati e le istanze gia' fatte. **E' l'anello che unisce Blender al sito**, ed e' esattamente il ponte che serve a chi modella. Fa anche la compressione Draco e la trasformazione delle texture in KTX2. |
| [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) | 2.823 | **Zlib** (permissiva, non MIT) | 13/08/2026 | come si concatena il post-processing in un passaggio solo invece di un render target per effetto: bloom, profondita' di campo, SSAO, godray. E' la differenza fra un 3D che sembra un videogioco del 2005 e uno che sembra cinema. |
| [pmndrs/leva](https://github.com/pmndrs/leva) | 6.198 | **MIT** | 09/11/2025 | come si costruisce il pannello di regolazione mentre si sviluppa: si espone un parametro, si trascina lo slider, si trova il valore giusto in trenta secondi invece che ricompilando venti volte. Il tempo che fa risparmiare e' misurabile in giornate. |

### Il contorno, che serve piu' di quanto sembri

| repository | stelle | licenza | ultimo push | cosa si impara di preciso |
|---|---:|---|---|---|
| [pmndrs/react-postprocessing](https://github.com/pmndrs/react-postprocessing) | 1.345 | **MIT** | 09/08/2026 | gli effetti sopra, ma dichiarati in JSX. |
| [pmndrs/detect-gpu](https://github.com/pmndrs/detect-gpu) | 1.211 | **MIT** | 09/08/2026 | **come si decide QUANTO 3D mostrare a questo visitatore**: classifica la scheda video contro una tabella di benchmark e restituisce un livello. E' il modo onesto di non far fondere i telefoni. Da mettere in ogni progetto immersivo. |
| [pmndrs/react-three-offscreen](https://github.com/pmndrs/react-three-offscreen) | 528 | **MIT** | 30/01/2025 | come si sposta tutto il rendering su un worker con OffscreenCanvas, cosi' che l'interfaccia non si blocchi mai. |
| [pmndrs/three-stdlib](https://github.com/pmndrs/three-stdlib) | 857 | **MIT** | 26/06/2026 | gli `examples/jsm` di three.js impacchettati come moduli veri e mantenuti: risolve il rogna quotidiano degli import dei controlli e dei loader. |
| [pmndrs/drei-vanilla](https://github.com/pmndrs/drei-vanilla) | 614 | **MIT** | 20/02/2026 | le stesse helper **senza React**: e' la risposta a "mi serve solo l'effetto, non voglio il framework". |
| [pmndrs/meshline](https://github.com/pmndrs/meshline) | 380 | **MIT** | 03/06/2024 | la linea con spessore vero (l'erede di `spite/THREE.MeshLine`), manutenuta. |
| [pmndrs/lamina](https://github.com/pmndrs/lamina) | 1.107 | **MIT** | 22/06/2025 | come si compone un materiale a strati (come in Photoshop) invece di scrivere uno shader monolitico. |
| [pmndrs/react-three-rapier](https://github.com/pmndrs/react-three-rapier) | 1.422 | **MIT** | 03/11/2025 | la fisica moderna (Rapier, in Rust compilato a WASM). **E' questa la scelta di oggi**, non `use-cannon` che e' fermo al 2024 e per giunta senza licenza. |
| [pmndrs/react-spring](https://github.com/pmndrs/react-spring) | 29.138 | **MIT** | 12/08/2026 | come si anima con la fisica delle molle invece che con durata e curva: il movimento non ha un "tempo", ha una massa. Si sente. |
| [pmndrs/use-gesture](https://github.com/pmndrs/use-gesture) | 9.621 | **MIT** | 15/07/2024 | come si leggono trascinamento, pizzico e ruota in modo uniforme fra mouse e dito. |
| [pmndrs/zustand](https://github.com/pmndrs/zustand) | **58.558** | **MIT** | 13/08/2026 | lo stato condiviso in 1 kB. Nel 3D serve perche' la scena e l'interfaccia devono guardare gli stessi dati senza ridisegnare tutto. |
| [pmndrs/react-three-next](https://github.com/pmndrs/react-three-next) | 2.862 | **MIT** | 21/06/2024 | lo scheletro Next.js + r3f gia' montato, con il canvas che sopravvive al cambio pagina. |
| [pmndrs/racing-game](https://github.com/pmndrs/racing-game) | 2.209 | **MIT** | 23/02/2023 | un gioco intero e leggibile: fisica del veicolo, circuito, interfaccia. Fermo, ma completo. |
| [pmndrs/ecctrl](https://github.com/pmndrs/ecctrl) | 775 | **MIT** | 15/06/2026 | il controller di un personaggio in terza persona gia' fatto: se il sito deve far "camminare" qualcuno dentro a uno spazio, e' questo. |

### Le eccezioni sulla licenza, verificate a mano

Non tutto pmndrs e' MIT pulita. Le tre cose da sapere:

- **`pmndrs/uikit`** (3.231) e **`pmndrs/xr`** (2.604): GitHub li marca
  `NOASSERTION`. Aperto il file: **e' testo MIT** (Copyright 2024 Bela
  Bohlender), gli manca solo la riga di intestazione che il rilevatore cerca.
  Usabili.
- **`pmndrs/react-three-a11y`** (614): il file LICENSE contiene un **conflitto di
  merge non risolto** (`<<<<<<< HEAD` dentro al testo). E' MIT in entrambe le
  versioni in conflitto, ma e' il caso da manuale del perche' la licenza va
  aperta e non dedotta.
- **Senza alcun file di licenza**: `pmndrs/maath` (985, ancora vivissimo),
  `pmndrs/use-cannon` (2.959), `pmndrs/triplex` (1.300),
  `pmndrs/threejs-journey` (807, che sono le demo del corso di Bruno Simon
  portate in React). Si studiano, non si copiano.

### La vetrina: la risposta onesta

La domanda era quali esempi della vetrina siano siti veri premiati. **Nessuno.**
Aperta la pagina degli esempi (`docs.pmnd.rs/react-three-fiber/getting-started/examples`),
la vetrina e' un muro di **CodeSandbox**, non di siti in produzione. Le etichette
dicono tutto: `bruno, simon, threejs-journey`, `lusion`, `configurator, t-shirt`,
`caustics, effects, soft-shadows`, `scroll, refraction, lens`. Sono
**riproduzioni di effetti** visti su siti premiati (una e' esplicitamente
etichettata `lusion`), non i siti stessi.

Il che e' comunque utile, ed e' il modo giusto di usarla: **si cerca l'etichetta
dell'effetto che si vuole, si apre il sandbox, si legge il file.** Per i siti
veri restano `_SITI-DA-STUDIARE.md` e `_SOURCEMAP-SWEEP.md`. Lo starter di
Darkroom `satus` (979 stelle, MIT), che monta insieme Next.js, GSAP, Lenis e
react-three-fiber, e' documentato in `_CODICE-PUBBLICO-2.md`.

---

## 4. googlecreativelab - la piu' ricca, e quasi tutta congelata

**66 repository, 38.769 stelle**: e' l'organizzazione piu' grossa incontrata in
tutta la ricerca dopo i grandi framework. E' il laboratorio creativo di Google,
quello degli "AI Experiments", "Chrome Experiments", "Android Experiments".

### Il dato che decide come usarla: 55 repository su 66 sono ARCHIVIATI

Non "vecchi": **archiviati**, cioe' chiusi in sola lettura dai proprietari.

| | repository | stelle |
|---|---:|---:|
| **archiviati (sola lettura)** | **55** (83%) | 35.259 (**91% delle stelle**) |
| ancora aperti | 11 | 3.510 |

C'e' anche l'impronta della passata amministrativa: **18 repository diversi hanno
tutti l'ultimo push il 18/08/2025**, e altri 9 il 07/02/2022. Non e' vita, e'
manutenzione di massa. Quando vedi una data identica su venti repository, non
stai guardando un progetto attivo.

**Cosa vuol dire in pratica.** Un repository archiviato non prende piu'
correzioni: le dipendenze di otto anni fa hanno falle note, i tutorial dentro
puntano ad API di Google spente. **Si legge la tecnica, non si esegue il
codice.** Ma la tecnica, li' dentro, e' di prima qualita'.

### La licenza: e' la parte migliore

| licenza | repository | cosa vuol dire |
|---|---:|---|
| **Apache-2.0** | **46** | permissiva, e in piu' **concede esplicitamente i brevetti**: e' la licenza piu' sicura che esista per un lavoro commerciale. Meglio della MIT su questo punto. |
| NOASSERTION | 10 | file di licenza da leggere a mano |
| NESSUNA | 7 | **solo studio** - fra questi `aiexperiments-ai-duet`, che ha 1.669 stelle |
| MIT | 2 | permissiva |
| **GPL-3.0** | 1 | `creatability-seeing-music`: **copyleft forte, contamina.** Da tenere lontano dal lavoro cliente. |

Google pubblica sotto Apache-2.0 per politica aziendale, ed e' il motivo per cui
questa organizzazione vale piu' di tante altre: **quasi tutto si puo' davvero
usare**, non solo guardare.

### Sui premi, la stessa onesta' di `_REPO-ALTRI-PREMI.md`

Ho cercato la prova dentro ai repository: **nessuno dei README di
googlecreativelab rivendica un premio**. Gli albi ufficiali di Webby e FWA sono
applicazioni JavaScript e non si leggono da riga di comando (limite gia'
registrato in `_REPO-ALTRI-PREMI.md`). Quindi qui vale la stessa convenzione:
le voci marcate **(*)** sono esperimenti di punta di Google, riconosciuti nel
settore e citati ovunque, ma **anno e categoria del premio non sono stati
ri-verificati sull'albo**. Non li invento.

### Quelli che insegnano qualcosa a chi fa siti immersivi

| repository | stelle | licenza | stato | ultimo push | cosa si impara di preciso |
|---|---:|---|---|---|---|
| [chrome-music-lab](https://github.com/googlecreativelab/chrome-music-lab) (*) | 2.419 | **Apache-2.0** | archiviato | 28/02/2024 | come si rende visibile una cosa astratta: tredici esperimenti che trasformano armonici, spettrogrammi e ritmo in oggetti che si toccano. E' il riferimento su **come si spiega un concetto con l'interazione invece che col testo** - la cosa che i clienti pagano. |
| [quickdraw-dataset](https://github.com/googlecreativelab/quickdraw-dataset) (*) | **6.800** | NOASSERTION (dati CC BY 4.0, leggere il file) | archiviato | 11/03/2025 | **50 milioni di disegni umani** in formato ndjson, con l'ordine dei tratti e i tempi. Non e' codice: e' materia prima. Un'animazione fatta con disegni veri di persone vere ha una qualita' che nessun asset comprato ha. |
| [quickdraw-component](https://github.com/googlecreativelab/quickdraw-component) | 120 | **Apache-2.0** | archiviato | 18/08/2025 | come si mette quel dataset in pagina con **una riga**: un web component che pesca il disegno e lo anima. |
| [anypixel](https://github.com/googlecreativelab/anypixel) (*) | **6.439** | **Apache-2.0** | archiviato | 18/08/2025 | come si pilota un display fisico enorme (bottoni, LED, hardware) **dal browser**. Serve il giorno che il cliente chiede l'installazione in fiera e non solo il sito. |
| [aiexperiments-ai-duet](https://github.com/googlecreativelab/aiexperiments-ai-duet) (*) | 1.669 | **NESSUNA** | archiviato | 18/08/2025 | un pianoforte che risponde a quello che suoni. **Attenzione: nessuna licenza** malgrado le 1.669 stelle. Solo studio. |
| [teachablemachine-community](https://github.com/googlecreativelab/teachablemachine-community) (*) | 1.728 | **Apache-2.0** | **VIVO** | 19/06/2026 | come si allena un modello **nel browser, con la webcam, in trenta secondi** e lo si usa dentro a una pagina. E' la via piu' corta per un sito che reagisce al corpo o agli oggetti senza server e senza costi per chiamata. |
| [teachable-machine-boilerplate](https://github.com/googlecreativelab/teachable-machine-boilerplate) | 522 | **Apache-2.0** | **VIVO** | 10/06/2026 | lo stesso, ridotto a un file leggibile: si parte da qui. |
| [posenet-sketchbook](https://github.com/googlecreativelab/posenet-sketchbook) | 217 | **Apache-2.0** | archiviato | 18/08/2025 | una raccolta di schizzi che usano **la posa del corpo** come sorgente di movimento. Il modo di far entrare il visitatore dentro l'animazione senza VR. |
| [semi-conductor](https://github.com/googlecreativelab/semi-conductor) (*) | 126 | **Apache-2.0** | archiviato | 18/08/2025 | dirigere un'orchestra muovendo le braccia davanti alla webcam: come si mappa un gesto continuo su tempo, volume e strumento. |
| [pattern-radio](https://github.com/googlecreativelab/pattern-radio) | 37 | **Apache-2.0** | archiviato | 18/08/2025 | come si naviga **un terabyte di audio** (anni di canti di balena) dentro a una pagina web senza scaricarlo: la lezione sullo streaming di dati enormi in un'interfaccia fluida. |
| [inside-music](https://github.com/googlecreativelab/inside-music) | 400 | **Apache-2.0** | archiviato | 13/02/2018 | come si "entra dentro" una canzone vedendone le tracce separate nello spazio. |
| [shadercam](https://github.com/googlecreativelab/shadercam) | 241 | NOASSERTION | archiviato | 18/08/2025 | shader OpenGL applicati al flusso della fotocamera: il pensiero e' lo stesso di un post-processing su video in pagina. |
| [creatability-components](https://github.com/googlecreativelab/creatability-components) | 300 | NOASSERTION | **VIVO** | 12/05/2026 | come si rende **accessibile** uno strumento creativo: componenti gia' fatti per input alternativi. Da leggere insieme a `_ACCESSIBILITA.md`: e' l'argomento che distingue un preventivo serio. |
| [creatability-seeing-music](https://github.com/googlecreativelab/creatability-seeing-music) | 115 | **GPL-3.0 (contamina)** | **VIVO** | 28/06/2026 | la musica resa visibile per chi non sente. Bellissimo da studiare, **da non copiare in un progetto chiuso**. |
| [morse-learn](https://github.com/googlecreativelab/morse-learn) (*) | 337 | **Apache-2.0** | **VIVO** | 28/06/2026 | come si insegna qualcosa in pagina con associazioni visive e ripetizione: e' un piccolo corso interattivo, ed e' la struttura da rubare per un sito che deve spiegare. |
| [gemini-demos](https://github.com/googlecreativelab/gemini-demos) | 207 | **Apache-2.0** | **VIVO** | 24/06/2026 | la roba nuova del laboratorio: dimostrazioni costruite su Gemini. E' dove guardare per capire dove sta andando il gruppo adesso. |

### Gli 11 ancora aperti, per intero

`teachablemachine-community` (1.728), `teachable-machine-boilerplate` (522),
`morse-learn` (337), `creatability-components` (300), `gemini-demos` (207),
`creatability-seeing-music` (115, **GPL-3.0**), `tiny-motion-trainer` (93),
`tf4micro-motion-kit` (77), `finger-user-interface` (58, **nessuna licenza**),
`air-snare` (49), `astrowand` (24).

Il tema e' evidente e vale come indicazione di rotta: **quello che Google
Creative Lab tiene aperto oggi e' l'apprendimento automatico nel browser e sui
microcontrollori.** Gli esperimenti WebGL e VR sono tutti chiusi.

---

## 5. theatre-js, greensock, pixijs - i tre strumenti con un'azienda dietro

Tre casi diversissimi fra loro, e la differenza sta tutta nella licenza. Va
capita **prima** di scegliere lo strumento, non dopo aver consegnato.

### GreenSock / GSAP - il caso da studiare per primo

**5 repository, 42.004 stelle.** E' la libreria di animazione piu' usata al
mondo su siti da premio, ed e' **l'unica di queste tre che NON e' open source.**

| repository | stelle | licenza | ultimo push | cosa si impara di preciso |
|---|---:|---|---|---|
| [greensock/GSAP](https://github.com/greensock/GSAP) | **27.666** | **NESSUN file di licenza.** Licenza proprietaria "standard no charge" di Webflow | 13/04/2026 | come si scrive un motore di animazione che non salta un fotogramma: un solo ciclo, una sola lettura del layout, tutto il resto e' matematica. E ScrollTrigger, che e' il modo in cui la meta' dei siti premiati lega il movimento allo scroll. |
| [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | **13.540** | **MIT** | 29/07/2026 | le istruzioni ufficiali scritte da GreenSock **perche' un agente di IA usi GSAP correttamente**. Sono 13.540 stelle in pochi mesi: e' il documento che dice come loro stessi vogliono che si usi la libreria. Da leggere anche da umani. |
| [greensock/react](https://github.com/greensock/react) | 335 | **NESSUNA** | 15/01/2025 | `useGSAP()`, cioe' come si anima in React senza lasciare animazioni orfane allo smontaggio del componente. |
| [greensock/GreenSock-AS3](https://github.com/greensock/GreenSock-AS3) | 423 | **NESSUNA** | 29/05/2019 | archeologia: da dove viene GSAP (Flash). Utile solo per capire perche' l'API e' fatta cosi'. |

**La licenza di GSAP, letta parola per parola su <https://gsap.com/standard-license>
il 13/08/2026.** Serve saperla, perche' e' l'unica cosa in tutto questo file che
puo' generare una fattura a sorpresa:

- **GSAP e' di Webflow.** Copyright 2008-2026, tutti i diritti riservati. Non e'
  MIT, non e' Apache: e' un contratto di licenza.
- **E' gratis anche in commerciale, plugin compresi.** Testuale: *"All of GSAP
  including the plugins that were formerly members-only can be used in
  commercial projects at no charge."* SplitText, ScrollSmoother, MorphSVG,
  Draggable: tutto incluso, senza pagare.
- **La condizione unica e' chi paga.** Si puo' usare *"as long as end users are
  not charged a fee of any kind to use your product or gain access to any part
  of it"*. E poi, esplicitamente: **"If your client pays you a one-time fee to
  create the site/product, that's perfectly fine"**. Cioe': il lavoro tipico
  dello studio (cliente paga una volta, il sito e' aperto a tutti) e' coperto.
  **Se invece il sito ha un abbonamento o un accesso a pagamento, serve la
  membership.** Questa riga va letta prima di preventivare un'area riservata.
- **Vietato** costruirci sopra un editor visuale di animazioni che faccia
  concorrenza a Webflow, e togliere le note di copyright.
- **Webflow puo' revocare** la licenza a chi non rispetta i termini, e puo'
  cambiare i termini: le versioni gia' scaricate restano sotto i termini
  vecchi, le nuove no.
- Nota di colore utile: alla domanda se un'IA possa generare codice GSAP,
  rispondono *"Absolutely!"*.

> Regola pratica per lo studio: **GSAP si usa, non si ridistribuisce**, e la
> riga sull'accesso a pagamento va nel preventivo. Vedi `_PREVENTIVO.md` e
> `_STRUMENTI-E-COSTI.md`.

### Theatre.js - l'editor di motion design, e questo si' che e' aperto

**5 repository, 12.638 stelle**, praticamente tutte su uno solo.

| repository | stelle | licenza | ultimo push | cosa si impara di preciso |
|---|---:|---|---|---|
| [theatre-js/theatre](https://github.com/theatre-js/theatre) | **12.598** | **Apache-2.0** | 14/08/2024 | come si costruisce **una timeline con i keyframe dentro al browser**, che modifica la scena dal vivo e poi esporta lo stato in un file JSON che il sito riproduce. E' il pezzo mancante fra "so animare per codice" e "so far vedere al cliente cosa cambia": si trascina il keyframe, non si ricompila. Si aggancia a three.js e a react-three-fiber. |
| [theatre-js/website](https://github.com/theatre-js/website) | 14 | **Apache-2.0** | 22/04/2024 | il sito e la documentazione, aperti. |

**Il neo, ed e' serio: l'ultimo push e' del 14/08/2024, due anni fa.** Il
progetto e' fermo. La licenza Apache-2.0 pero' e' la piu' generosa possibile
(permissiva **con concessione di brevetto**): se serve, si puo' prendere e
mantenere per conto proprio. Da valutare come strumento interno, non come
dipendenza di un sito consegnato.

### PixiJS - il 2D veloce, e la licenza piu' pulita del gruppo

**41 repository, 55.137 stelle. MIT quasi ovunque.** E' l'alternativa giusta
quando la scena e' 2D: immagini, testo, particelle, filtri. Costa una frazione
di three.js e non chiede una scheda video seria.

| repository | stelle | licenza | ultimo push | cosa si impara di preciso |
|---|---:|---|---|---|
| [pixijs/pixijs](https://github.com/pixijs/pixijs) | **48.006** | **MIT** | 11/08/2026 | come si disegnano decine di migliaia di sprite a 60 fps raggruppando le chiamate di disegno: il batching. E' la lezione di prestazioni piu' utile che esista, e vale anche fuori da Pixi. |
| [pixijs/filters](https://github.com/pixijs/filters) | 1.125 | **MIT** | 13/02/2026 | **una collezione di shader gia' pronti e commentati**: dissolvenza, spostamento, glitch, bagliore, rumore. E' il posto piu' rapido dove capire un effetto: un filtro = un file GLSL leggibile. |
| [pixijs/pixi-react](https://github.com/pixijs/pixi-react) | 2.879 | **MIT** | 16/01/2026 | Pixi dichiarato in JSX, come r3f fa con three.js. |
| [pixijs/sound](https://github.com/pixijs/sound) | 474 | **MIT** | 27/09/2024 | l'audio con filtri legato al ciclo di rendering. Vedi `_SUONO.md`. |
| [pixijs/assetpack](https://github.com/pixijs/assetpack) | 165 | **MIT** | 11/11/2025 | come si prepara in automatico la pipeline delle risorse: atlanti, compressione, formati moderni. E' la parte noiosa che decide il peso della pagina. |
| [pixijs/layout](https://github.com/pixijs/layout) | 166 | **MIT** | 12/06/2026 | Yoga (lo stesso motore di React Native) per disporre elementi dentro al canvas: risolve il problema di allineare cose in WebGL. |
| [pixijs/devtools](https://github.com/pixijs/devtools) | 63 | **MIT** | 08/12/2025 | l'estensione per ispezionare l'albero della scena dal browser. |
| [pixijs/open-games](https://github.com/pixijs/open-games) | 443 | **MIT** | 11/11/2025 | giochi completi e leggibili. |
| [pixijs/pixijs-skills](https://github.com/pixijs/pixijs-skills) | 309 | **MIT** | 04/06/2026 | come sopra per GSAP: le istruzioni ufficiali per far usare Pixi a un agente di IA. |
| [pixijs/examples](https://github.com/pixijs/examples) | 472 | **NESSUNA** | 16/01/2024 | gli esempi del sito. Attenzione: **e' l'unico pezzo importante senza licenza.** |

**Il confronto che serve a decidere**, e sta tutto in tre righe:

| | licenza | si puo' ridistribuire | rischio |
|---|---|---|---|
| **PixiJS** | MIT | si' | nessuno |
| **Theatre.js** | Apache-2.0 (+ brevetti) | si' | e' fermo dal 2024 |
| **GSAP** | proprietaria Webflow, gratis con condizioni | **no** | l'accesso a pagamento va verificato caso per caso |

---

## 6. Dove NON cercare due volte

Questo file copre **le persone e le organizzazioni celebri del mestiere**. Il
resto della cartella copre altro, ed e' gia' stato battuto a fondo: aprire
quello giusto risparmia mezza giornata.

| se cerchi | il file e' | cosa ci trovi gia' |
|---|---|---|
| il sorgente di un sito che ha **vinto** | `_SITI-DA-STUDIARE.md` | i sei originali veri (Basement, folio-2019, folio-2025, sf-website, Star Atlas, ustwo), con md5 verificati e comandi di clonazione. E il verdetto: gli studi non pubblicano quasi mai il sito premiato. |
| il sorgente **nascosto** in produzione | `_SOURCEMAP-SWEEP.md` | 151 domini scansionati per sapere quanti dimenticano la sourcemap. E' la strada che ha reso di piu' in tutta la ricerca. |
| altri repository di siti premiati non-Awwwards | `_REPO-ALTRI-PREMI.md` | 89 repository (FWA, CSS Design Awards, Webby, One Show, D&AD) piu' 72 sourcemap, con la licenza sempre compilata. |
| il perimetro Awwwards | `_REPO-AWWWARDS.md` | la caccia mirata a Site of the Year, Developer Award, Site of the Month 2019-2026. |
| **la battuta larga**: tutto quello che pubblicano gli studi | `_REPO-CACCIA.md` | 69 organizzazioni, **3.959 repository**, 1.436.408 stelle, con il metodo per rifarla. E' il bacino da cui viene meta' di questo file. |
| cosa regalano gli studi (librerie, non siti) | `_LIBRERIE-DEGLI-STUDI.md` | Lenis, Tempus, Hamo e compagnia, con i numeri npm. |
| il codice leggibile studio per studio | `_CODICE-PUBBLICO-1.md`, `-2.md`, `-3.md` | Lusion, Active Theory, Obys, Resn, Immersive Garden, Hello Monday, Locomotive, Merci Michel, e 13 siti-progetto. |
| **come e' fatto un effetto** | `_WEBGL-TECNICHE.md` | dieci tecniche che ricompaiono ovunque, spiegate dal codice vero. |
| lo scroll morbido | `locomotive.md` e la skill `stack-sito-immersivo` | Lenis contro Locomotive, e le trappole gia' pagate. |
| come si e' partiti | `_COME-SI-PARTE.md` | quando e' arrivato il primo premio agli studi che oggi vincono, e con che lavoro. |

Le persone elencate qui sotto nella sezione 7 **non** sono ripetute negli altri
file: li' ci sono gli studi, qui ci sono gli individui.

---

## 7. Gli sviluppatori creativi premiati a titolo personale

Sono le persone, non gli studi. Quando pubblicano, pubblicano la tecnica nuda:
un effetto, un tool, una libreria minima. Vale piu' di mille articoli.

### mrdoob (Ricardo Cabello) - il padre di three.js

| repository | stelle | licenza | ultimo aggiornamento | cosa si impara di preciso |
|---|---:|---|---|---|
| [mrdoob/three.js](https://github.com/mrdoob/three.js) | 114.493 | MIT | 13/08/2026 (vivissimo) | come si tiene un'API pubblica stabile per dodici anni mentre sotto cambia tutto: WebGL1, WebGL2, ora WebGPU/TSL. La cartella `examples/` e' il manuale vero. |
| [mrdoob/stats.js](https://github.com/mrdoob/stats.js) | 9.144 | MIT | 11/10/2024 | come si misura il frame rate senza falsarlo: 70 righe che mostrano il costo reale di un frame in ms, non solo gli FPS. |
| [mrdoob/glsl-sandbox](https://github.com/mrdoob/glsl-sandbox) | 1.678 | MIT | 10/07/2026 | come si costruisce un editor di shader live con galleria: compilazione al volo, gestione degli errori GLSL, permalink. |
| [mrdoob/texgen.js](https://github.com/mrdoob/texgen.js) | 1.868 | MIT | 23/01/2021 | come si generano texture per codice invece di scaricarle: peso zero sulla rete. |
| [mrdoob/frame.js](https://github.com/mrdoob/frame.js) | 1.168 | MIT | 18/09/2025 | come si costruisce una timeline con keyframe sopra a una scena WebGL. |

Nota: `mrdoob/three.wasm` (537 stelle) e' **archiviato** dal 02/04/2026. Da non
usare, interessante da leggere.

### spite (Jaume Sanchez Elias) - Google, ex Player Two

| repository | stelle | licenza | ultimo aggiornamento | cosa si impara di preciso |
|---|---:|---|---|---|
| [spite/ccapture.js](https://github.com/spite/ccapture.js) | 3.761 | **MIT** | 27/07/2026 | come si registra un canvas a frame rate FISSO falsando `requestAnimationFrame` e `Date.now`: e' cosi' che si esportano video perfetti da animazioni che nel browser andrebbero a scatti. Serve ogni volta che devi consegnare un video del sito. |
| [spite/THREE.MeshLine](https://github.com/spite/THREE.MeshLine) | 2.339 | **MIT** | 22/03/2024 | perche' `THREE.Line` non puo' avere spessore, e come si costruisce una linea vera come strip di triangoli orientati nel vertex shader. |
| [spite/Wagner](https://github.com/spite/Wagner) | 1.084 | **MIT** (ma gli shader restano dei rispettivi autori) | 26/05/2024 | come si concatena una catena di post-processing con ping-pong fra due render target. |
| [spite/polygon-shredder](https://github.com/spite/polygon-shredder) | 869 | **MIT** | 15/12/2016 | come si animano centinaia di migliaia di cubi tenendo la posizione dentro a una texture (GPGPU) invece che in JavaScript. |
| [spite/ShaderEditorExtension](https://github.com/spite/ShaderEditorExtension) | 634 | **MIT** | 01/05/2017 | come si intercettano le chiamate WebGL di una pagina qualsiasi per leggere gli shader altrui: strumento di reverse engineering. |
| [spite/sketch](https://github.com/spite/sketch) | 321 | **MIT** | 02/08/2026 | rendering non fotorealistico: tratteggio, incisione, cross-hatching. Vivo. |

### luruke (Luigi De Rosa) - Interactive Director, Active Theory

| repository | stelle | licenza | ultimo aggiornamento | cosa si impara di preciso |
|---|---:|---|---|---|
| [luruke/browser-2020](https://github.com/luruke/browser-2020) | 7.974 | **NESSUNA** | 28/10/2021 | l'elenco delle API del browser che quasi nessuno usa e che risolvono problemi veri di un sito immersivo. Si legge in un'ora e cambia il repertorio. |
| [luruke/awesome-casestudy](https://github.com/luruke/awesome-casestudy) | 2.621 | **NESSUNA** | 28/09/2022 | e' l'indice ragionato dei case study tecnici di siti premiati: la scorciatoia per capire come sono fatti dentro i siti che vinceranno il premio. |
| [luruke/aladino](https://github.com/luruke/aladino) | 849 | **NESSUNA** | 30/03/2021 | come si sostituisce un'immagine HTML con un piano WebGL mantenendo la posizione del DOM: il trucco base dei siti "con l'effetto sulle immagini". |
| [luruke/magicshader](https://github.com/luruke/magicshader) | 248 | **NESSUNA** | 16/03/2021 | come si costruisce un pannello di debug che scopre da solo le uniform dello shader e ci mette gli slider. |
| [luruke/antipasto](https://github.com/luruke/antipasto) | 161 | **NESSUNA** | 16/03/2021 | lo scheletro minimo di un progetto three.js fatto da chi lavora in uno studio da premi. |

### akella (Yuri Artiukh) - Kiev, il divulgatore degli effetti

| repository | stelle | licenza | ultimo aggiornamento | cosa si impara di preciso |
|---|---:|---|---|---|
| [akella/fake3d](https://github.com/akella/fake3d) | 546 | **NESSUNA** | 05/01/2020 | come si fa sembrare tridimensionale UNA foto piatta con una depth map e uno shader di parallasse: effetto costosissimo all'occhio, quasi gratis in banda. |
| [akella/webGLImageTransitions](https://github.com/akella/webGLImageTransitions) | 486 | **NESSUNA** | 05/11/2019 | come si passa da un'immagine all'altra con una texture di rumore come maschera di dissolvenza. |
| [akella/webgl-mouseover-effects](https://github.com/akella/webgl-mouseover-effects) | 399 | **MIT** | 18/05/2023 | come si distorce un'immagine seguendo il puntatore con un campo di velocita' che si smorza. |
| [akella/ExplodingObjects](https://github.com/akella/ExplodingObjects) | 223 | **NESSUNA** | 26/03/2019 | come si esplode un modello 3D nei suoi pezzi e lo si ricompone (ispirato a un sito FWA). |
| [akella/DistortedPixels](https://github.com/akella/DistortedPixels) | 287 | **MIT** | 12/01/2022 | come si pixelano/distorcono immagini in tempo reale su griglia. |

### edankwan (Edan Kwan) - fondatore di Lusion, GIUDICE FWA

Il piu' premiato del gruppo: Lusion e' uno studio con decine di riconoscimenti
Awwwards e FWA, e lui e' **giudice FWA** (dichiarato nella sua bio GitHub).

| repository | stelle | licenza | ultimo aggiornamento | cosa si impara di preciso |
|---|---:|---|---|---|
| [edankwan/The-Spirit](https://github.com/edankwan/The-Spirit) | 1.273 | **MIT** | 12/07/2016 | il sistema a particelle GPGPU con curl noise che ha fatto scuola: mezzo milione di particelle mosse interamente sulla GPU. E' il codice dietro a mezza generazione di siti "con le particelle". |
| [edankwan/PerspectiveTransform.js](https://github.com/edankwan/PerspectiveTransform.js) | 325 | **NESSUNA** | 05/06/2024 | come si calcola la matrice CSS `matrix3d` per inchiodare i quattro angoli di un div a quattro punti arbitrari: prospettiva vera senza WebGL. |
| [edankwan/hyper-mix](https://github.com/edankwan/hyper-mix) | 249 | **MIT** | 12/07/2016 | simulazione fisica su GPU con marching cubes. |

### ykob (Yoichi Kobayashi) - Tokyo

| repository | stelle | licenza | ultimo aggiornamento | cosa si impara di preciso |
|---|---:|---|---|---|
| [ykob/sketch-threejs](https://github.com/ykob/sketch-threejs) | 2.543 | **MIT** | 29/04/2025 | una raccolta di decine di sketch three.js separati, ciascuno leggibile da solo: e' il modo migliore per studiare un effetto per volta senza districarsi in un sito intero. |
| [ykob/shape-overlays](https://github.com/ykob/shape-overlays) | 422 | **NESSUNA** | 20/10/2017 | come si fa la transizione di menu a piu' strati con path SVG che si deformano in sequenza: l'effetto "tenda" che si vede su meta' dei siti premiati, senza WebGL. |
| [ykob/scroll-manager](https://github.com/ykob/scroll-manager) | 110 | **MIT** | 12/08/2019 | come si centralizza UN solo listener di scroll che alimenta tutto il resto, invece di venti listener che si pestano i piedi. |
| [ykob/threejs-experiments](https://github.com/ykob/threejs-experiments) | 92 | **NESSUNA** | 08/08/2026 | la versione TypeScript e viva degli sketch: aggiornata questo mese. |

### gkjohnson (Garrett Johnson) - NASA JPL, il piu' tecnico di tutti

| repository | stelle | licenza | ultimo aggiornamento | cosa si impara di preciso |
|---|---:|---|---|---|
| [gkjohnson/three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) | 3.447 | **MIT** | 10/08/2026 | come si fa il raycast su una mesh da un milione di triangoli in tempo costante costruendo un albero BVH: e' la differenza fra "il sito risponde al mouse" e "il sito si pianta". Dipendenza di mezzo ecosistema. |
| [gkjohnson/three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer) | 1.807 | **MIT** | 13/08/2026 | come si fa path tracing progressivo in browser: qualita' da render offline che si raffina mentre l'utente guarda. |
| [gkjohnson/three-bvh-csg](https://github.com/gkjohnson/three-bvh-csg) | 939 | **MIT** | 17/02/2026 | come si tagliano e fondono solidi in tempo reale (booleane): serve per i configuratori di prodotto. |
| [gkjohnson/threejs-sandbox](https://github.com/gkjohnson/threejs-sandbox) | 863 | **MIT** | 11/08/2026 | decine di estensioni sperimentali a three.js, ognuna isolata. |

### yiwenl (Yi-wen Lin) - Londra

| repository | stelle | licenza | ultimo aggiornamento | cosa si impara di preciso |
|---|---:|---|---|---|
| [yiwenl/Sketches](https://github.com/yiwenl/Sketches) | 650 | **NESSUNA** | 31/07/2026 | anni di sketch WebGL raccolti per stagione, tutti eseguibili: vivo nel 2026. |
| [yiwenl/Alfrid](https://github.com/yiwenl/Alfrid) | 238 | **MIT** | 16/07/2025 | come si scrive da zero un wrapper WebGL proprio invece di usare three.js: si capisce cosa fa three.js sotto. |
| [yiwenl/glsl-fbm](https://github.com/yiwenl/glsl-fbm) | 56 | **NESSUNA** | 20/10/2019 | il rumore frazionale browniano in GLSL, la funzione da cui nascono nuvole, terreni e fumo. |
| [yiwenl/glsl-bezier-curve](https://github.com/yiwenl/glsl-bezier-curve) | 32 | **NESSUNA** | 18/10/2019 | come si valuta una bezier dentro allo shader per far scorrere oggetti su un percorso senza toccare la CPU. |

### cabbibo (Isaac Cohen) - Oakland

| repository | stelle | licenza | ultimo aggiornamento | cosa si impara di preciso |
|---|---:|---|---|---|
| [cabbibo/PhysicsRenderer](https://github.com/cabbibo/PhysicsRenderer) | 221 | **NESSUNA** | 17/04/2017 | come si tiene lo stato di una simulazione fisica dentro a texture floating point e lo si avanza di un passo per frame: la base del GPGPU spiegata piccola. |
| [cabbibo/glsl-curl-noise](https://github.com/cabbibo/glsl-curl-noise) | 156 | **NESSUNA** | 28/09/2022 | il curl noise: la funzione che fa muovere le particelle come fumo invece che a caso. Sono 40 righe e le usano tutti. |
| [cabbibo/Text](https://github.com/cabbibo/Text) | 122 | **NESSUNA** | 19/10/2017 | come si trasforma una scritta in una nuvola di particelle che si ricompone. |

### crnacura (Manoela Ilic) - e' LEI che sta dietro a Codrops

| repository | stelle | licenza | ultimo aggiornamento | cosa si impara di preciso |
|---|---:|---|---|---|
| [crnacura/AmbientCanvasBackgrounds](https://github.com/crnacura/AmbientCanvasBackgrounds) | 806 | **NESSUNA** | 13/12/2018 | cinque fondali animati in Canvas 2D con simplex noise: come si riempie uno sfondo senza WebGL e senza ammazzare la batteria. |
| [crnacura/PlayersClub](https://github.com/crnacura/PlayersClub) | 114 | **NESSUNA** | 23/11/2025 | un template Astro completo per un sito di artisti musicali. Recente. |
| [crnacura/grid-deformation-effect](https://github.com/crnacura/grid-deformation-effect) | 4 | **MIT** | 27/08/2024 | la deformazione di una griglia di immagini al passaggio del puntatore, in TypeScript. |

### winkerVSbecks (Varun Vachhar) - Toronto, Chromatic

| repository | stelle | licenza | ultimo aggiornamento | cosa si impara di preciso |
|---|---:|---|---|---|
| [winkerVSbecks/sketchbook](https://github.com/winkerVSbecks/sketchbook) | 222 | **NESSUNA** | 17/08/2024 | esperimenti di arte generativa con `canvas-sketch`: come si imposta un progetto generativo che esporta anche in stampa. |
| [winkerVSbecks/xvg](https://github.com/winkerVSbecks/xvg) | 279 | **MIT** | 22/05/2022 | come si ispeziona e si anima un path SVG (lunghezza, dash offset): il debug dell'effetto "linea che si disegna". |
| [winkerVSbecks/a-triangle-everyday](https://github.com/winkerVSbecks/a-triangle-everyday) | 170 | **MIT** | 05/05/2015 | il valore della pratica quotidiana vincolata: 30 giorni, un solo vincolo. |

### oframe (Nathan Gordon) - OGL

| repository | stelle | licenza | ultimo aggiornamento | cosa si impara di preciso |
|---|---:|---|---|---|
| [oframe/ogl](https://github.com/oframe/ogl) | 4.622 | **Unlicense** dichiarata nel `package.json`, ma il file LICENSE non c'e' | 13/04/2025 | come si fa WebGL in 1/10 del peso di three.js: quando il sito deve pesare poco e il 3D e' semplice, e' questa la scelta. Il codice e' leggibile per intero in un pomeriggio. |
| [oframe/ogpu](https://github.com/oframe/ogpu) | 133 | **Unlicense** | 11/08/2026 | la stessa filosofia portata su WebGPU. Vivo e libero davvero (Unlicense = dominio pubblico). |
| [oframe/ibl-converter](https://github.com/oframe/ibl-converter) | 50 | **MIT** | 05/03/2022 | come si prepara una mappa di illuminazione ambientale per il PBR senza pagare un tool. |

### Una nota sulla sezione 7, ora che le licenze sono tutte verificate

Le quaranta caselle "da verificare" lasciate dalla prima passata sono state
chiuse una per una leggendo la pagina di ogni repository. Il risultato conta:

- **Chi fa strumenti mette la licenza.** gkjohnson: 4 repository su 4 MIT.
  mrdoob: 5 su 5 MIT. spite: 6 su 6 MIT. E' gente che si aspetta che il codice
  venga usato.
- **Chi fa effetti spesso non la mette.** luruke: **0 su 5**. cabbibo: 0 su 3.
  yiwenl: 3 su 4 senza. akella: 3 su 5 senza. Sono dimostrazioni, non prodotti:
  **si guardano.**
- **Due casi da conoscere a memoria**: `spite/Wagner` e' MIT ma il file aggiunge
  *"All shaders are copyright of their respective authors"* - cioe' la parte che
  ti interessa davvero e' esclusa. E `oframe/ogl` dichiara **Unlicense** nel
  `package.json` senza avere il file: e' usabile, ma se un cliente serio chiede
  l'inventario delle licenze, quella riga va documentata.

---

## 8. DA QUALI CINQUE REPOSITORY SI COMINCIA

La domanda vera: **una persona che sa programmare e sa usare Blender, e vuole
imparare a fare siti immersivi, da dove parte?**

Non da three.js. Non da un corso. Da cinque repository, in quest'ordine. L'ordine
non e' un dettaglio: ognuno rende leggibile il successivo. Sono tutti gia'
elencati sopra con licenza e data, qui c'e' **il perche' e in che ordine**.

### 1. `brunosimon/my-room-in-3d` - il ponte da quello che gia' sai

`git clone --depth 1 https://github.com/brunosimon/my-room-in-3d`

**Perche' primo.** Perche' parte da Blender, che e' la cosa che gia' sai fare, e
finisce su una pagina web. E' la stanza di Bruno Simon modellata in Blender, con
luci e ombre **cotte in una texture** (baking) e poi mostrate nel browser con un
materiale non illuminato. Risultato: sembra un render, gira a 60 fotogrammi su
un portatile, e non c'e' una sola luce calcolata in tempo reale.

**Cosa ti porta a casa in un pomeriggio**: che la qualita' visiva di un sito 3D
si decide **in Blender, prima**, non nel browser. E' l'inversione mentale che
salva sei mesi.

**Attenzione: NESSUNA licenza.** Si legge, si capisce, si rifa' con la propria
scena. Non si copia dentro a un lavoro cliente.

### 2. `brunosimon/folio-2019` - come e' fatto un sito che ha vinto davvero

`git clone --depth 1 https://github.com/brunosimon/folio-2019`

**Perche' secondo.** Adesso che sai portare una scena dentro a una pagina, ti
serve vedere **un sito intero e premiato**, non un esempio. 4.728 stelle: e' il
codice piu' letto al mondo su un sito 3D che ha vinto. E dentro c'e' la risposta
alla domanda che si fanno tutti: *come fa a non scattare?* La fisica gira per
conto suo, il disegno legge solo le posizioni; le risorse si caricano in fasi;
l'esperienza e' un oggetto solo che possiede tutto il resto.

**Da leggere subito dopo, dello stesso autore**:
`brunosimon/threejs-template-complex`, che e' quella stessa architettura ridotta
allo scheletro nudo (Experience, Resources, Sizes, Time). Sono venti minuti e ti
resta per sempre.

**Licenza MIT** (file `license.md`): questo si puo' anche usare.

### 3. `codrops/CodropsTemplate` e tre demo di scroll - il vocabolario

`git clone --depth 1 https://github.com/codrops/CodropsTemplate`
`git clone --depth 1 https://github.com/codrops/OnScrollTypographyAnimations`
`git clone --depth 1 https://github.com/codrops/ScrollBasedLayoutAnimations`
`git clone --depth 1 https://github.com/codrops/SlideshowAnimations`

**Perche' terzo.** Perche' i primi due insegnano il 3D, ma **un sito immersivo
non e' fatto di 3D: e' fatto di ritmo.** Il testo che entra al momento giusto, il
layout che cambia forma mentre scorri, la slideshow che non stacca ma trasforma.
Qui ogni effetto e' **un solo effetto in una cartella**: si apre, si guarda, si
chiude. E' l'unico materiale in tutta questa raccolta fatto apposta per essere
letto invece che eseguito.

**Come si studia davvero**: uno al giorno, e ogni volta si riscrive l'effetto da
zero senza guardare. Tre settimane cosi' e il repertorio c'e'.

**Licenza MIT** (dal 2020 in poi il file c'e'), **ma le immagini no**: quelle si
sostituiscono sempre.

### 4. `pmndrs/drei` - smettere di reinventare, e far girare la roba sui telefoni

`git clone --depth 1 https://github.com/pmndrs/drei`

**Perche' quarto e non primo.** Se lo apri prima di aver fatto le cose a mano,
copi senza capire. Se lo apri adesso, riconosci ogni helper come "il problema che
ho appena risolto male": `ScrollControls`, `Environment`, `useGLTF`,
`MeshTransmissionMaterial`. **Il modo di leggerlo e' uno solo: una helper alla
volta, dal sorgente.** Sono file corti e ognuno e' una lezione di three.js
completa.

Insieme a questo, due cose che decidono se il sito e' vendibile:
**`pmndrs/gltfjsx`** (trasforma il `.glb` di Blender in un componente con i nodi
gia' nominati, compressione Draco compresa) e **`pmndrs/detect-gpu`** (misura la
scheda video del visitatore e ti fa decidere quanto mostrare). Il primo ti fa
risparmiare ore, il secondo ti evita il telefono che si spegne durante la
presentazione al cliente.

**Licenza MIT** tutti e tre: usabili nel lavoro pagato.

### 5. `mrdoob/three.js` - il manuale, e ci si torna per sempre

`git clone --depth 1 https://github.com/mrdoob/three.js`

**Perche' ultimo, e perche' non si "legge".** 114.493 stelle, aggiornato oggi.
Non si studia dall'inizio alla fine: **si apre la cartella `examples/` e si cerca
l'esempio che fa la cosa che serve**. Sono centinaia di file autosufficienti,
ognuno una tecnica isolata, tutti eseguibili aprendo un server locale nella
cartella. E' il posto dove si va quando una cosa non funziona e nessuno ne ha
scritto.

Da qui in poi la strada si biforca, e sono i due repository da tenere pronti:
**`gkjohnson/three-mesh-bvh`** (MIT) il giorno che il puntatore su una mesh pesante
inchioda la pagina, e **`brunosimon/three.js-tsl-sandbox`** per il linguaggio di
shader nuovo (TSL), che compila sia in GLSL sia in WebGPU ed e' dove sta andando
tutto.

### Il quadro, per non perderlo di vista

| # | repository | licenza | cosa risolve | quanto ci vuole |
|---|---|---|---|---|
| 1 | `brunosimon/my-room-in-3d` | **NESSUNA - solo studio** | portare Blender nel browser con resa da render | un pomeriggio |
| 2 | `brunosimon/folio-2019` | **MIT** | l'architettura di un sito 3D che ha vinto | due giorni |
| 3 | `codrops/*` (template + scroll) | **MIT**, immagini escluse | il ritmo, il testo, le transizioni | tre settimane, uno al giorno |
| 4 | `pmndrs/drei` + `gltfjsx` + `detect-gpu` | **MIT** | smettere di riscrivere, e non far fondere i telefoni | una settimana |
| 5 | `mrdoob/three.js` (`examples/`) | **MIT** | tutto il resto, per sempre | non finisce |

**Tre su cinque sono di Bruno Simon o passano da lui.** Non e' pigrizia della
ricerca: e' che e' l'unico, fra tutti i premiati censiti in questa cartella, che
pubblica il codice buono con una licenza vera e lo scrive perche' venga letto.

> **E la regola, un'ultima volta, perche' e' quella che si dimentica per prima:
> SENZA LICENZA SI STUDIA, NON SI COPIA.** Il primo dei cinque repository qui
> sopra non ha licenza. Si apre, si capisce, si richiude, e si riscrive con la
> propria scena e con le proprie mani. Quello che esce da li' e' tuo, e lo puoi
> vendere.
