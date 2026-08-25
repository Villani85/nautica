# Il codice che gli studi premiati regalano

Dossier al 13/08/2026. **Tutti i numeri vengono dall'API GitHub e dal registro
npm interrogati oggi**, non da articoli o classifiche. Dove un dato è di
seconda mano lo trovi marcato.

Questa scheda non parla dei siti degli studi (per quelli vedi `basement.md`,
`darkroom.md`, `locomotive.md`). Parla di quello che quegli studi **mettono in
mano a chiunque, gratis**: librerie, starter, strumenti. È il materiale più
direttamente riutilizzabile di tutta la ricerca — e in due casi (satus,
`website-2k25`) è anche la cosa più vicina che esista a **guardare come lavora
uno studio da premi dall'interno**.

## In una riga
Di tutto il codice regalato dagli studi premiati **quattro cose sole meritano
di entrare nel nostro stack** (Lenis, Tempus, GSAP, l'asse
r3f/drei/postprocessing), **una va letta e non installata** (satus), e la
domanda "pubblicare open source porta clienti?" **non ha una sola prova
documentata** — solo un meccanismo indiretto che si vede nei numeri.

---

## Come leggere le tabelle

- **stelle**: popolarità storica. Dice poco sul presente.
- **ultimo push**: la data che conta. Sotto i 3 mesi = vivo; 6-18 mesi =
  fermo ma usabile; oltre 24 mesi + archiviato = morto.
- **scaricamenti/mese npm**: l'unico dato che misura l'uso *vero*. Un
  repository con 1.600 stelle e 0 download è un manifesto, non una libreria.
- **licenza**: `NESSUNA` significa **nessun file di licenza**, cioè
  tecnicamente "tutti i diritti riservati". Non è un dettaglio da avvocati:
  vedi il capitolo apposta in fondo.

---

# 1. darkroom.engineering (ex Studio Freight)

50 repository pubblici. È lo studio che ha regalato di più e meglio: quattro
librerie vive, mantenute, con licenza MIT pulita su tutte.

| repo | stelle | ultimo push | creato | licenza | npm/mese |
|---|---|---|---|---|---|
| **lenis** | 15.396 | **2026-08-11** | 02/2022 | MIT | **5.096.716** |
| **satus** | 979 | **2026-08-12** | 10/2021 | MIT | — (starter) |
| aniso | 440 | 2026-06-04 | 09/2022 | MIT | — |
| **tempus** | 327 | **2026-07-29** | 07/2022 | MIT | 129.922 |
| **hamo** | 312 | **2026-07-29** | 02/2022 | MIT | 19.802 |
| react-lenis | 223 | 2024-05-29 | 01/2023 | nessuna | **ARCHIVIATO** |
| sf-website | 139 | 2024-10-11 | 05/2023 | nessuna | **ARCHIVIATO** |
| compono | 70 | 2024-01-12 | 01/2023 | nessuna | **ARCHIVIATO** |
| elastica | 52 | 2026-07-10 | 07/2024 | MIT | — |
| cc-settings | 42 | **2026-08-12** | 01/2026 | MIT | — |
| omnes | 37 | 2026-06-04 | 04/2024 | MIT | — |
| lenify | 22 | 2026-06-04 | 08/2022 | MIT | — |
| forma | 20 | 2026-06-04 | 06/2024 | MIT | — |
| spargo | 11 | 2026-08-03 | 07/2023 | MIT | — |
| fitbox | 9 | 2026-06-24 | 04/2026 | MIT | — |
| novus | 6 | 2026-08-03 | 03/2026 | MIT | — |
| locomotive-scroll (fork) | 13 | 2024-06-26 | 09/2021 | MIT | archiviato |

## Lenis — l'unica libreria di questo elenco che è uno standard

*"Smooth scroll as it should be"*. **5,1 milioni di scaricamenti al mese**,
15.396 stelle, ultimo push **due giorni fa**. Non è un progetto da studio: è
infrastruttura. Per dare la misura, `locomotive-scroll` — il concorrente
storico, di un altro studio premiato — ne fa **61.939**, cioè **1,2%** di
Lenis. E `locomotive-scroll` v5 **è un guscio costruito sopra Lenis** (vedi
`locomotive.md`): il concorrente si è arreso e ha adottato il vincitore.

**A cosa serve davvero.** Sostituisce lo scroll nativo con uno scroll
interpolato (`lerp`) mantenendo però la barra di scorrimento vera, la
posizione nativa del documento e l'ancoraggio dei link. Non è "un effetto":
è la base su cui poggiano tutte le animazioni legate allo scroll, perché
normalizza la differenza fra rotellina, trackpad e touch.

**Dettaglio che vale i soldi**: il pacchetto `@studio-freight/lenis` — il
**vecchio nome, deprecato da oltre due anni** — fa ancora **398.902
scaricamenti al mese**. Significa che c'è una grossa coda di progetti (e di
tutorial, e di risposte su Stack Overflow) fermi al nome vecchio. Quando
copi un frammento da un blog, controlla quale dei due sta importando: il
pacchetto giusto oggi è **`lenis`** e basta.

**React**: il repository `react-lenis` è **archiviato dal 2024** e questo
spaventa chi lo trova per primo. Non è un abbandono — il wrapper è stato
**assorbito dentro il monorepo di Lenis** e si importa da `lenis/react`.
Chi installa `@studio-freight/react-lenis` sta installando un fossile.

**Ci conviene?** **Sì, senza discussione.** È già nel nostro stack
(`stack-sito-immersivo`), è MIT, è vivo, e lo usano gli studi contro cui ci
confrontiamo. Unica accortezza già documentata in `darkroom.md`: i valori del
loro sito (`lerp .125`, `syncTouch` acceso) **non sono quelli che il loro
stesso starter attiva**. Non copiare i valori: sceglili.

## Tempus — il pezzo che nessuno installa e che risolve un problema vero

*"Use only one requestAnimationFrame for your whole app"*. 327 stelle,
**129.922 scaricamenti/mese**, MIT, ultimo push luglio 2026.

**A cosa serve davvero.** In un sito immersivo finisci con tre o quattro cicli
di animazione indipendenti: quello di Lenis, quello di Three.js, quello delle
tue interpolazioni, magari quello di una libreria terza. Ognuno chiama
`requestAnimationFrame` per conto suo, e **l'ordine in cui girano dentro il
fotogramma non è garantito**. Il sintomo è il tremolio di un elemento
agganciato allo scroll: si muove un fotogramma dopo lo sfondo. Tempus dà un
solo ciclo con **priorità dichiarate**, così decidi tu che prima gira lo
scroll e poi il rendering.

**Ci conviene?** **Sì**, ed è il consiglio meno ovvio di tutta la scheda.
Costa niente (poche righe), si aggancia a Lenis in tre righe, e toglie una
classe intera di difetti che altrimenti insegui per ore. GSAP ha il suo
`gsap.ticker` che fa una cosa simile: **se il progetto è già tutto su GSAP,
usa quello e salta Tempus**. Tempus serve quando GSAP non c'è o quando devi
mettere in fila anche roba non-GSAP.

## Hamo — utile, ma piccolo

*"Hamo means hook, do the math"*. 312 stelle, MIT, vivo (luglio 2026), ma
**19.802 scaricamenti/mese**: due ordini di grandezza sotto Lenis. È una
raccolta di hook React (dimensioni della finestra, rilevamento del riquadro
visibile, `useRect` senza far ricalcolare il layout a ogni fotogramma).

**Ci conviene?** **Solo se lavoriamo in React.** Il valore vero è `useRect`:
misura gli elementi in modo raggruppato invece di chiamare
`getBoundingClientRect` dentro il ciclo di animazione — che è esattamente
l'errore che fa impuntare un sito. Se non usiamo React, il concetto va
copiato, non il pacchetto.

## Satus — lo starter. Da leggere, non da installare

**979 stelle, MIT, versione 2.0.1, ultimo push ieri.** Questo è il pezzo più
interessante di tutto il censimento, perché non è una libreria: è **il modo in
cui uno studio da premi imposta un progetto nuovo**. La descrizione ufficiale:
*"Advanced Next.js App Router starter for content-driven sites"*.

**Cosa contiene davvero** (letto dal `package.json` e dall'albero dei file,
382 file):

*Il telaio*
- **Next.js 16.3** con App Router, **React 19.2**, **TypeScript in modalità
  stretta**
- **bun** come gestore di pacchetti *e* come esecutore degli script (non npm,
  non pnpm)
- **Tailwind v4** via PostCSS, più un sistema di stili proprio in
  `lib/styles/` con uno script `setup:styles` che genera i token
- **oxlint + oxfmt** al posto di ESLint e Prettier — scritti in Rust, e con
  `lint:types` per il controllo dei tipi

*La parte che ci interessa come agenzia*
- `lib/integrations/`: **Sanity** (CMS), **Shopify**, **HubSpot**,
  **Mailchimp**, **Cloudflare Turnstile** (l'anti-bot dei moduli). Cioè: lo
  starter arriva già con le prese per il CMS, il negozio, il CRM, la
  newsletter e la protezione del modulo contatti.
- `e2e/` con **Playwright** e **`@axe-core/playwright`**: i test di
  accessibilità sono *dentro lo starter*, non un ripensamento. Vale la pena
  metterlo a confronto con `_ACCESSIBILITA.md`, dove l'accessibilità risulta
  il punto più debole di tutto il web premiato.
- uno script **`handoff`** (`prepare-handoff.ts`): la consegna al cliente è
  automatizzata. Da guardare quando scriveremo il nostro `_PREVENTIVO.md`
  operativo.
- **`doctor`**, **`check:assets`**, **`generate:manifest --check`**,
  **`bench:nav`** e **`bench:rerender`**: controlli e misure di prestazione
  come comandi di progetto.
- **`contrast:accept`**: uno script che accetta esplicitamente le eccezioni di
  contrasto. Vuol dire che il contrasto è verificato in automatico e le
  deroghe sono un atto deliberato, registrato.

*La parte grafica*
- **GSAP 3.15 + `@gsap/react`** — nota bene: lo studio che ha scritto Lenis
  **usa GSAP** per le animazioni
- **lenis, tempus, hamo** (roba loro)
- **three 0.185 + @react-three/fiber 9 + drei 10 + postprocessing** —
  esattamente l'asse pmndrs del capitolo 4
- **@theatre/core + @theatre/studio**: editor visuale di animazioni
- **zustand** per lo stato, **zod** per la validazione, **Base UI** per i
  componenti accessibili

*I segni dei tempi*
- **`app/llms.txt`** è una rotta dello starter (vedi `_LLMS-TXT.md`: lo
  pubblicano tutti, non lo legge nessuno — e ora è pure nel telaio)
- **`.cursor/rules`** e **`@storybook/addon-mcp`**: lo starter è attrezzato per
  essere guidato da un'AI
- **`deslop-cli`** fra i comandi: uno strumento che ripulisce il codice
  generato dall'AI. Lo studio dà per scontato che parte del codice sia
  generato, e mette un filtro.

**Ci conviene?** **No — non come base di partenza. Sì come lettura.** Tre
ragioni concrete:

1. **Ci vincola a metà del mercato**: Next.js 16 + bun + Sanity + Tailwind v4
   sono scelte forti. Un cliente da 8-15k in Brianza (`_MERCATO-ITALIA.md`)
   spesso vuole WordPress o un sito statico, non un App Router con un CMS a
   pagamento.
2. **È il loro flusso, non il nostro**: gli script (`doctor`, `handoff`,
   `bench:*`) valgono per una squadra che li ha scritti. Ereditarli senza
   capirli significa avere un progetto che si rompe in punti che non
   conosciamo.
3. **Il ritmo di cambiamento è brutale**: siamo alla 2.0.1 e il push è di
   ieri. Uno starter che si muove così ti costringe a rincorrere.

**Quello che invece dobbiamo rubare subito** sono **quattro idee**, non i file:
i test di accessibilità dentro il progetto; lo script di consegna; il controllo
del contrasto con deroga esplicita; e le integrazioni CRM/newsletter/anti-bot
previste dal primo giorno invece che appiccicate alla fine.

## Il resto di darkroom, in breve

- **aniso** (440 stelle, MIT, giugno 2026) — generatore di immagini ASCII.
  Bello, molto "portfolio". Utile per **un progetto nostro senza cliente**,
  che è esattamente il canale con cui 9 studi su 12 hanno vinto il primo
  premio (`_COME-SI-PARTE.md`). Non è infrastruttura.
- **spargo** (11 stelle, agosto 2026) — dithering GPU in tempo reale via
  WebGL. Piccolo e recentissimo. Da tenere d'occhio: il retino è un effetto
  che ricorre nei siti premiati (vedi lo shader Bayer di `2xa.md`).
- **elastica** (52 stelle, luglio 2026) — motore fisico 2D per corpi rigidi
  con binding React. Nicchia.
- **forma** (20 stelle) — genera istanze statiche da un font variabile
  (FontTools, Python). **Utile davvero**: serve a tagliare il peso quando usi
  un variabile per due soli pesi.
- **fitbox** (9 stelle, aprile 2026) — testo che si adatta al riquadro senza
  ricalcolare il layout. Stesso problema del `fitty` di basement.
- **lenify** (22 stelle) — estensione Chrome che applica Lenis a qualsiasi
  sito. **Ottimo strumento commerciale**: fai vedere al cliente il *suo* sito
  con lo scroll morbido, in dieci secondi, senza toccare niente.
- **novus** (6 stelle, marzo 2026) — la versione React Router di satus. Nuovo.
- **cc-settings** (42 stelle, **creato a gennaio 2026, push di ieri**) —
  *"Claude Code configuration — agents, skills, hooks & settings for Darkroom
  Engineering"*. Uno studio da premi **pubblica la propria configurazione di
  Claude Code**. Da leggere per confronto con la nostra.
- **Gli archiviati**: `sf-website` (139 stelle, il vecchio sito Studio
  Freight), `compono` (i loro componenti), `bibliotheca`, `darkroom-guide`.
  Sono la traccia del cambio di nome da Studio Freight a
  darkroom.engineering. **Nessuno di questi ha un file di licenza**: non sono
  riutilizzabili legalmente, solo leggibili.

---

# 2. basementstudio

49 repository pubblici. Profilo diverso da darkroom: **meno libreria, più
prodotto e più esperimento**. E una nota che pesa: la maggior parte dei loro
repository **non ha nessuna licenza**.

| repo | stelle | ultimo push | creato | licenza |
|---|---|---|---|---|
| **xmcp** | 1.310 | **2026-08-13** | 05/2025 | MIT |
| scrollytelling | 1.629 | 2024-02-22 | 04/2023 | non standard |
| **shader-lab** | 663 | **2026-08-12** | 03/2026 | Apache-2.0 |
| basement-laboratory | 367 | 2025-09-11 | 05/2022 | nessuna |
| basement-grotesque | 336 | 2023-03-06 | 07/2021 | **OFL-1.1** |
| commerce-toolkit | 288 | 2025-09-24 | 05/2022 | MIT |
| **website-2k25** | 252 | **2026-08-13** | 11/2024 | nessuna |
| next-typescript | 192 | 2024-09-09 | 08/2020 | nessuna |
| next-real-viewport | 124 | 2023-10-30 | 01/2021 | nessuna |
| react-miami-game | 65 | 2026-01-31 | 04/2025 | nessuna |
| ship-25-explorations | 56 | 2026-01-31 | 01/2025 | nessuna |
| mcp-three | 24 | 2025-08-13 | 07/2025 | nessuna |
| ogl-starter | 14 | 2025-12-15 | 09/2024 | nessuna |
| create-bsmnt-app | 10 | 2024-09-18 | 03/2024 | MIT |
| lib-starter | 6 | 2026-02-07 | 06/2025 | nessuna |

## website-2k25 — il sito dello studio, aperto e vivo

252 stelle, **ultimo push oggi**, creato novembre 2024. È il repository su cui
`_TEMPI.md` ha già misurato la cosa più utile di tutta la ricerca: **4 mesi, 10
persone, 253 persona-giorni**, con 79 commit e 4 persone entrate il giorno del
lancio.

**A cosa serve davvero**: non è codice da riusare, è **una fonte**. È l'unico
posto dove puoi leggere la cronologia completa di un sito premiato — cosa hanno
fatto prima, quanto è durata la messa a punto, cosa hanno buttato.

**Ci conviene?** **Sì, come lettura continua** — è ancora vivo oggi, quindi
continua a produrre dati. **No come codice**: nessuna licenza, quindi copiare
file interi è formalmente una violazione.

## xmcp — il repo più vivo dello studio, e non c'entra col web creativo

*"The TypeScript MCP framework"*. 1.310 stelle, MIT, **push di oggi**, creato
maggio 2025. **65.424 scaricamenti/mese**. È un telaio per costruire server MCP
(gli strumenti che si collegano agli assistenti AI).

Il fatto interessante non è la libreria: è che **il repository più attivo di
uno studio di siti creativi nel 2026 è un attrezzo per l'AI**, non un effetto.
E li ha portati fuori dal proprio settore.

**Ci conviene?** **Non per i siti dei clienti.** Ma se un giorno vendessimo un
"agente che conosce il vostro catalogo" come servizio ricorrente
(`_RICORRENTE.md`), questo è il telaio, ed è MIT.

## shader-lab — la sorpresa

663 stelle in **cinque mesi** (creato marzo 2026), Apache-2.0, push di ieri.
*"A powerful toolkit to create, stack, and animate shaders."*

È il progetto con la crescita più rapida di tutto il censimento. Impilare e
animare shader senza scriverli da zero è esattamente il lavoro che costa di
più nei nostri progetti.

**Ci conviene?** **Da provare subito, con prudenza.** Licenza buona
(Apache-2.0 dà anche la concessione esplicita sui brevetti, più solida della
MIT), argomento centrale per noi. Ma ha cinque mesi di vita: **non lo metto in
un sito di un cliente prima di averlo aperto e capito**. Da usare intanto sui
progetti nostri.

## scrollytelling — attenzione: è fermo da due anni e mezzo

1.629 stelle — **il repository più stellato dello studio** — e questo è
esattamente il caso che dimostra perché le stelle non contano: **ultimo push
22 febbraio 2024**. Due anni e mezzo fa. Nel frattempo sono usciti React 19,
Next 15 e 16, e GSAP 3.13 con il cambio di licenza.

*"A library for creating Scrollytelling animations, powered by React & GSAP"*:
avvolge GSAP e ScrollTrigger in componenti React dichiarativi.

**Ci conviene?** **No.** L'idea è buona ma il codice è fermo su una versione
di React precedente e su un GSAP di due generazioni fa. Usa GSAP direttamente
con `useGSAP` (che è ufficiale, mantenuto e fa 4,8 milioni di download al
mese). **Questo è il caso da tenere a mente ogni volta che qualcuno cita le
stelle di un repository.**

## Il resto di basement, in breve

- **basement-grotesque** (336 stelle, **OFL-1.1**) — il loro carattere
  tipografico, con **licenza font aperta**: si può usare in progetti
  commerciali, anche dei clienti. **È il regalo più immediatamente spendibile
  di tutto il censimento**: un carattere da studio premiato, gratis, legale.
  Va sempre riletta la OFL sul riservare il nome, ma l'uso è libero.
- **commerce-toolkit** (288 stelle, MIT, settembre 2025) — attrezzi per
  storefront. Fermo da quasi un anno ma MIT e ancora leggibile.
- **basement-laboratory** (367 stelle) — la raccolta dei loro esperimenti.
  **Nessuna licenza**: si guarda, non si copia. Ottima miniera di idee.
- **next-real-viewport** (124 stelle, ottobre 2023) — risolveva il `100vh` sul
  telefono. **Oggi è obsoleto**: le unità `svh`/`lvh`/`dvh` sono supportate
  ovunque e fanno la stessa cosa senza JavaScript. Non installarlo.
- **ogl-starter**, **mcp-three**, **lib-starter**, **create-bsmnt-app** —
  attrezzi interni. Piccoli, per lo più senza licenza.
- **ship-25-explorations** e **react-miami-game** — materiale da conferenza.
  Utile come idee per progetti-vetrina.

---

# 3. brunosimon

84 repository. **Profilo completamente diverso dai due studi**: Bruno Simon non
pubblica librerie, pubblica **dimostrazioni**. È coerente con quello che
vende: Three.js Journey, un corso. Il codice aperto è il campione gratuito.

| repo | stelle | ultimo push | creato | licenza |
|---|---|---|---|---|
| folio-2019 | 4.728 | 2024-05-25 | 07/2019 | MIT |
| my-room-in-3d | 4.476 | 2023-09-12 | 08/2021 | nessuna |
| keppler | 1.933 | 2022-06-26 | 06/2016 | MIT |
| **folio-2025** | 1.688 | 2026-04-07 | 10/2024 | **MIT** |
| infinite-world | 625 | 2023-02-05 | 01/2022 | nessuna |
| threejs-template-complex | 294 | 2022-12-12 | 07/2021 | nessuna |
| webgl-black-hole | 285 | 2022-07-06 | 06/2022 | nessuna |
| **three.js-tsl-sandbox** | 203 | **2026-08-03** | 07/2024 | nessuna |
| three.js-tsl-template | 92 | 2025-03-07 | 11/2024 | nessuna |

## folio-2025 — il valore è la cronologia, non il codice

1.688 stelle, **MIT** (raro in questo elenco), ultimo push aprile 2026.

`_TEMPI.md` ha già estratto da qui il numero che ci serve: **14 mesi, 1
persona, 233 persona-giorni** — praticamente gli stessi persona-giorni dei 10
di basement in 4 mesi. Questa è la prova, su dati veri, che **il lavoro non si
comprime aggiungendo gente**: si comprime solo il calendario.

**Ci conviene?** **Come codice no** (è un portfolio personalissimo, non una
base). **Come studio sì**, ed è già stato fatto. La cosa da rubare è la
licenza: MIT su un portfolio significa che chiunque può leggerlo e citarlo — è
una scelta di marketing, non di ingegneria.

## Il segnale nascosto: TSL

I tre repository più recenti di Bruno Simon (`three.js-tsl-sandbox`,
`threejs-tsl-voronoi`, `threejs-tsl-uv-based-pixelation`,
`three.js-tsl-template`) sono tutti su **TSL** — il *Three.js Shading
Language*, il modo nuovo di scrivere shader in Three.js che si compila sia per
WebGL sia per WebGPU. `three.js-tsl-sandbox` è stato pushato **dieci giorni
fa** ed è il suo repo più attivo.

**Perché ci riguarda.** L'uomo che insegna Three.js a mezzo mondo ha spostato
tutto il proprio lavoro pubblico su TSL. È il miglior indicatore anticipato che
abbiamo su dove va la scrittura degli shader nei prossimi due anni. **Non è
ancora il momento di usarlo su un cliente** (nessuno di quei repo ha una
licenza, e WebGPU non è ovunque), ma è il momento di impararlo.

**Attenzione al resto**: `my-room-in-3d` (4.476 stelle), `infinite-world`,
`webgl-black-hole` e quasi tutti i template **non hanno licenza** e sono fermi
al 2021-2023. Sono materiale didattico da leggere. Copiarli in un progetto
cliente è, alla lettera, senza permesso.

---

# 4. pmndrs — il collettivo, non uno studio

99 repository pubblici. **Poimandres** non è un'agenzia: è un collettivo aperto
di sviluppatori nato attorno a **Paul Henschel (drcmda)**, che è l'autore di
`react-three-fiber`, `react-spring`, `zustand` e `drei`. Non vendono siti:
mantengono infrastruttura, e vivono di sponsorizzazioni (Open Collective) e dei
lavori dei singoli.

Questa distinzione conta: **sono l'unica voce dell'elenco su cui possiamo
appoggiare un progetto di produzione con tranquillità**, perché non dipendono
dall'agenda commerciale di uno studio.

| repo | stelle | ultimo push | npm/mese | licenza |
|---|---|---|---|---|
| **zustand** | 58.557 | **2026-08-13** | **198.546.234** | MIT |
| **react-three-fiber** | 31.701 | **2026-08-11** | **19.248.521** | MIT |
| react-spring | 29.138 | **2026-08-12** | 4.507.583 | MIT |
| jotai | 21.241 | 2026-08-04 | — | MIT |
| valtio | 10.220 | **2026-08-13** | — | MIT |
| **drei** | 9.796 | **2026-08-05** | **15.261.326** | MIT |
| use-gesture | 9.621 | 2024-07-15 | — | MIT |
| leva | 6.198 | 2025-11-09 | 3.468.749 | MIT |
| gltfjsx | 5.837 | 2024-11-04 | — | MIT |
| uikit | 3.231 | 2026-08-04 | — | non standard |
| use-cannon | 2.959 | 2024-02-25 | — | nessuna |
| react-three-next | 2.862 | 2024-06-21 | — | MIT |
| **postprocessing** | 2.823 | **2026-08-10** | **3.543.096** | **Zlib** |
| xr | 2.603 | 2026-05-29 | — | non standard |
| react-three-rapier | 1.422 | 2025-11-03 | — | MIT |
| **react-postprocessing** | 1.345 | **2026-08-09** | 2.808.014 | MIT |
| detect-gpu | 1.211 | **2026-08-09** | — | MIT |
| **maath** | 985 | **2026-08-12** | **17.579.852** | **nessuna** |
| three-stdlib | 857 | 2026-06-26 | — | MIT |
| lamina | 1.107 | 2025-06-22 | — | **ARCHIVIATO** |

**Quanto sono vivi**: i sei pacchetti che contano (`zustand`,
`react-three-fiber`, `drei`, `postprocessing`, `react-postprocessing`,
`maath`) sono stati **tutti pushati negli ultimi otto giorni**. Non c'è nessun
segnale di abbandono. `react-three-fiber` da solo fa **19,2 milioni di
scaricamenti al mese** e `three` ne fa 54,1 milioni: **più di un progetto
Three.js su tre passa da r3f**.

**Le cose da sapere prima di installare:**

- **postprocessing è Zlib, non MIT.** È comunque una licenza permissiva e
  compatibile con l'uso commerciale; la Zlib chiede solo di non spacciare il
  codice modificato per originale. Nessun problema pratico, ma se un cliente
  grande ci chiede l'elenco delle licenze, questa è quella che non è MIT.
- **maath non ha nessun file di licenza** pur facendo **17,5 milioni di
  scaricamenti al mese**. È il buco legale più grosso di tutto il censimento
  ed è dentro a mezzo ecosistema r3f (arriva come dipendenza di `drei`). In
  pratica nessuno se ne cura; formalmente è un rischio che va conosciuto.
- **use-gesture è fermo da luglio 2024** e **gltfjsx da novembre 2024**. Non
  sono morti (sono stabili e molto usati) ma non aspettarti correzioni rapide.
- **lamina è archiviato**: se lo trovi in un tutorial sui materiali a strati,
  è passato.
- **`gltfjsx` resta lo strumento giusto** per trasformare un `.glb` in un
  componente React: è il passaggio che rende gestibile un modello 3D dentro
  r3f, e nessuno lo ha rimpiazzato.

**Ci conviene?** **Sì, ed è già la nostra scelta.** L'asse
`three` + `@react-three/fiber` + `@react-three/drei` + `postprocessing` è la
stessa che darkroom mette dentro satus. Con una regola già scritta in
`stack-sito-immersivo` e confermata dalle schede (`lusion.md`,
`active-theory.md`, `aristide-benoist.md`): **r3f serve quando c'è una scena
3D vera con molti oggetti e stato React da sincronizzare. Per un piano con uno
shader sopra, r3f è un peso inutile** — 771 caratteri di GLSL fanno il lavoro
(vedi `aristide-benoist.md`).

---

# 5. GSAP dopo Webflow — cosa è cambiato davvero

Questo capitolo sta qui perché GSAP è l'unica dipendenza che compare in
**quasi tutte** le schede di questa ricerca. Un cambio di licenza su GSAP
riguarda ogni preventivo che faremo.

## I fatti, con le date

| fatto | data | fonte |
|---|---|---|
| Webflow acquisisce GreenSock | ottobre 2024 | annuncio Webflow *(seconda mano)* |
| **GSAP 3.13.0 — tutto gratuito** | **30/04/2025** | **registro npm, data di pubblicazione** |
| GSAP 3.14.0 | 08/12/2025 | registro npm |
| **GSAP 3.15.0 (attuale)** | **13/04/2026** | registro npm |
| ultimo push sul repository | 13/04/2026 | API GitHub |

**Cosa è diventato gratuito.** Il README ufficiale, letto oggi dal
repository, dice testualmente:

> *"Thanks to Webflow, GSAP is now **100% FREE** including ALL of the bonus
> plugins like SplitText, MorphSVG, and all the others that were exclusively
> available to Club GSAP members. That's right - the entire GSAP toolset is
> FREE, even for commercial use!"*

In pratica: **SplitText, MorphSVG, ScrollSmoother, DrawSVG, Inertia,
GSDevTools, CustomBounce/CustomWiggle, ScrambleText, MotionPathHelper** —
tutto quello che prima stava dietro l'abbonamento **Club GreenSock** — oggi si
installa da npm senza pagare e senza registrarsi. Prima ScrollSmoother e
SplitText erano il motivo principale per cui uno studio pagava ~99 $/anno.

## Il punto che quasi nessuno ha letto: la nuova licenza

**GSAP non è open source. Non lo è mai stato e non lo è diventato.** Il
repository GitHub, letto oggi, contiene **quattro soli file nella radice**:
`.gitignore`, `README.md`, `SECURITY.md`, `package.json`. **Non c'è nessun
file di licenza.** Il campo `license` del `package.json` non è uno SPDX ma una
frase:

> `"license": "Standard 'no charge' license: https://gsap.com/standard-license."`

E in fondo al README: *"Copyright (c) 2008-2026, GreenSock. All rights
reserved."*

**Cosa dice quella licenza oggi** (letta direttamente su
`gsap.com/standard-license`). Il testo in vigore è una licenza Webflow in sei
articoli:

- **Concessione**: licenza non esclusiva, mondiale, per usare GSAP su
  *"qualsiasi sito, applicazione web o interfaccia digitale"*.
- **L'unico divieto vero**: non si può usare GSAP per costruire strumenti che
  permettano di **creare animazioni visualmente senza codice** in concorrenza
  con Webflow. Il testo lo dice esplicitamente, e altrettanto esplicitamente
  chiarisce che va bene anche per *"aziende che competono con Webflow in altri
  settori"*.
- **La proprietà intellettuale è di Webflow**, non tua.
- **Webflow può revocare la licenza a propria discrezione** in caso di
  violazione, e **può modificare i termini quando vuole**, pubblicando la
  versione nuova. Se non accetti la revisione, **puoi continuare a usare le
  versioni precedenti** ai termini con cui te le avevano concesse.

**La scoperta che vale il capitolo.** Sulla pagina della licenza il vecchio
*"Plain English Summary"* — quello che diceva *"a patto che agli utenti finali
non venga chiesto alcun tipo di pagamento per usare il tuo prodotto... se gli
utenti finali pagano, iscriviti al Club GSAP Business"* — **è ancora nel
sorgente della pagina ma è racchiuso in un commento HTML**, cioè **non è più
il testo in vigore**. Lo abbiamo verificato riga per riga nell'HTML: il blocco
`<div id="summary">` e tutta la clausola sugli utenti paganti sono dentro
`<!-- ... -->`.

**Perché ci riguarda concretamente.** La vecchia regola era la trappola dei
progetti in abbonamento: se costruivi per un cliente un'area riservata a
pagamento, formalmente servivi la licenza Business. **Oggi quel vincolo non
c'è più nel testo in vigore.** Restano due cose da sapere e da scrivere nel
preventivo:

1. **Non possiamo trattare GSAP come MIT.** Se un cliente aziendale ci chiede
   l'elenco delle licenze delle dipendenze — e i clienti industriali lo
   chiedono — GSAP va dichiarato come *licenza proprietaria d'uso gratuito
   concessa da Webflow*, non come software libero.
2. **È una licenza revocabile e modificabile unilateralmente da un
   concorrente commerciale.** Webflow oggi regala; niente le impedisce di
   cambiare i termini domani. La tutela pratica è quella scritta nella
   licenza stessa: **le versioni già scaricate restano tue alle condizioni di
   allora**. Tradotto in pratica: **blocca la versione di GSAP nel
   `package.json` e tieni una copia del pacchetto**, non affidarti a un
   intervallo aperto.

## L'altro repository di GreenSock, quello che sorprende

| repo | stelle | ultimo push | licenza |
|---|---|---|---|
| GSAP | 27.665 | 2026-04-13 | proprietaria "no charge" |
| **gsap-skills** | **13.535** | **2026-07-29** | **MIT** |
| @gsap/react (repo `react`) | 335 | 2025-01-15 | nessuna |
| GreenSock-AS3 | 423 | 2019-05-29 | — (Flash, morto) |

**`gsap-skills`** — *"Official AI skills for GSAP. These skills teach AI coding
agents how to correctly use GSAP"* — ha raccolto **13.535 stelle**, cioè
**metà delle stelle della libreria stessa**, ed è **più aggiornato della
libreria** (luglio 2026 contro aprile 2026). Ed è **MIT**, mentre la libreria
non lo è.

Il segnale è forte e va oltre GSAP: **l'azienda che possiede la libreria di
animazione più diffusa del web ha deciso che il pezzo da regalare con licenza
aperta è il manuale per gli agenti AI.** Chi scrive codice oggi non legge la
documentazione: la fa leggere a un modello. (Le nostre skill `gsap-*`
installate vengono da lì.)

**Numeri d'uso**: `gsap` fa **17.369.658 scaricamenti/mese**,
`@gsap/react` **4.857.752**. Il README dichiara *"oltre 12 milioni di siti"*.
Nota però che **`@gsap/react` è fermo alla 2.1.2 del 15/01/2025**: è stabile,
non abbandonato, ma non aspettarti novità.

**Ci conviene?** **Sì, ed è la dipendenza meno discutibile di tutte.** Con due
righe da mettere in procedura: **versione bloccata** e **licenza dichiarata
come proprietaria** nella documentazione di consegna.

---

# 6. Il capitolo che ci evita una figuraccia: la licenza mancante

Il dato più imbarazzante di tutto il censimento, contato repository per
repository:

| chi | repo senza **nessun** file di licenza |
|---|---|
| **brunosimon** | **71 su 84 — 85%** |
| **basementstudio** | **33 su 49 — 67%** |
| **darkroom.engineering** | **23 su 50 — 46%** |
| **pmndrs** | **22 su 99 — 22%** |

"Pubblico su GitHub" **non** vuol dire "puoi usarlo". In assenza di un file di
licenza vale il diritto d'autore ordinario: **tutti i diritti riservati**. Il
proprietario ti concede solo quello che GitHub concede per contratto —
guardare il codice e biforcare il repository dentro GitHub. **Non** copiarlo
in un progetto che fatturi a un cliente.

Nella pratica nessuno fa causa per uno shader. Ma la nostra procedura deve
essere questa, e va scritta:

- **Dipendenza installata da npm** → si controlla il campo `license`. MIT,
  Apache-2.0, Zlib, ISC, BSD: si può. Assente o strana: si valuta.
- **Codice copiato da un repository** → si apre il repository e si cerca il
  file di licenza **prima** di incollare. Se non c'è, si riscrive la tecnica,
  non si copia il file.
- **Nel documento di consegna al cliente** va l'elenco delle dipendenze con la
  licenza. GSAP va scritto come **licenza proprietaria gratuita di Webflow**,
  non come open source. È la riga che ci distingue da chi non se lo è mai
  chiesto — e in `_PREVENTIVO.md` vale come argomento di vendita.

I casi concreti in cui lo abbiamo trovato: `maath` (**17,5 milioni di
scaricamenti al mese, nessuna licenza**), `basement-laboratory`,
`website-2k25`, `my-room-in-3d`, quasi tutti i template di Bruno Simon,
`ogl-starter`, `mcp-three`, `next-typescript`, `next-real-viewport`,
`use-cannon`.

---

# 7. Cosa prendiamo subito, e cosa no

## Prendere adesso, senza discutere

| cosa | perché | licenza |
|---|---|---|
| **lenis** | standard di fatto, 5,1 M/mese, vivo, MIT. Importalo come `lenis`, e `lenis/react` per React | MIT |
| **gsap** 3.15 + **@gsap/react** | ScrollTrigger è il sensore di scroll di metà dei siti premiati; da aprile 2025 **tutti i plugin sono gratuiti**. **Blocca la versione** | proprietaria gratuita |
| **three + @react-three/fiber + drei + postprocessing** | l'asse standard, tutto pushato negli ultimi 8 giorni. **Solo quando c'è una scena vera** | MIT / Zlib |
| **tempus** | un solo `requestAnimationFrame` con priorità. **Salta se il progetto è già tutto GSAP**: usa `gsap.ticker` | MIT |
| **basement-grotesque** | un carattere da studio premiato, **licenza font aperta**, usabile nei lavori dei clienti. Il regalo più spendibile del censimento | OFL-1.1 |
| **gltfjsx** | trasforma un `.glb` in componente React. Strumento, non dipendenza | MIT |
| **lenify** | estensione Chrome: mostri al cliente **il suo sito** con lo scroll morbido in dieci secondi. Attrezzo di vendita, non di produzione | MIT |
| **forma** | genera istanze statiche da un font variabile: taglia peso quando servono due soli pesi | MIT |

## Leggere, non installare

- **satus** — le quattro idee da rubare: (1) i test di accessibilità con
  `@axe-core/playwright` dentro il progetto; (2) lo script di **consegna al
  cliente** e il `PROD-README.md` separato; (3) il **controllo del contrasto
  con deroga esplicita e registrata**; (4) le integrazioni CRM / newsletter /
  anti-bot previste dal primo giorno. **Non** adottarlo come base: ci lega a
  Next 16 + bun + Sanity, che è metà del mercato che possiamo servire.
- **website-2k25** — è una fonte, non codice. Continua a produrre dati
  (`_TEMPI.md`), ed è ancora vivo oggi. Nessuna licenza.
- **basement-laboratory** — la miniera di idee. Nessuna licenza: si guarda.
- **darkroom/cc-settings** — la configurazione Claude Code di uno studio da
  premi, MIT, aggiornata ieri. Da confrontare con la nostra.

## Non prendere, e la ragione

| cosa | perché no |
|---|---|
| **scrollytelling** (basement) | 1.629 stelle ma **fermo dal 22/02/2024**. Usa GSAP + `useGSAP` direttamente |
| **next-real-viewport** | **obsoleto**: `svh` / `lvh` / `dvh` fanno la stessa cosa senza JavaScript |
| **@studio-freight/lenis** e **@studio-freight/react-lenis** | nomi vecchi. Il primo fa ancora 398.902 download/mese: è la coda dei tutorial datati |
| **react-lenis** (repo separato) | **archiviato**: il wrapper vive dentro `lenis/react` |
| **lamina** | **archiviato** |
| **shader-lab** | ottimo e Apache-2.0, ma ha **cinque mesi**. Sui progetti nostri sì, su un cliente non ancora |
| **maath** diretto | **nessuna licenza**. Arriva comunque come dipendenza di `drei`: non aggiungerlo a mano |
| **TSL** (Bruno Simon) | da **imparare**, non da spedire: repo senza licenza e WebGPU non è ovunque |
| **satus come base** | vedi sopra |
| **xmcp** | ottimo telaio MCP, ma non c'entra con i siti dei clienti. Da tenere da parte se venderemo un agente come servizio ricorrente |

## Le tre regole che escono da questo censimento

1. **Guarda la data, non le stelle.** `scrollytelling` ha 1.629 stelle ed è
   fermo da due anni e mezzo. `shader-lab` ne ha 663 in cinque mesi ed è la
   cosa più viva dello studio.
2. **Guarda i download, non le stelle.** `maath` ha 985 stelle e **17,5
   milioni** di scaricamenti al mese: è infrastruttura travestita da
   progettino. `basement-laboratory` ha 367 stelle e zero download: è un
   quaderno.
3. **Guarda la licenza prima di incollare.** Fra il 22% e l'85% dei
   repository di questi studi non ne ha nessuna.

---

# 8. Pubblicare codice aperto conviene a un'agenzia che apre?

## La risposta onesta: **non abbiamo trovato una sola prova documentata**

Non esiste, in quello che siamo riusciti a verificare, **nessun caso
pubblico e documentato di un cliente arrivato da un repository**. Nessuno di
questi studi pubblica un dato del tipo "da Lenis sono arrivati N contatti" o
"il cliente X ci ha scritto dopo aver usato la nostra libreria".

**Limite dichiarato di questa scheda**: la verifica su interviste, podcast e
articoli di terzi **non è stata completabile in questa sessione** (budget di
ricerca web esaurito). Quindi la formulazione corretta è: *non abbiamo trovato
prove*, non *le prove non esistono*. Chi riprende questo dossier faccia quella
verifica e la scriva qui.

Quello che invece abbiamo potuto misurare direttamente è utile lo stesso, e
punta tutto nella stessa direzione.

## Prova 1 — chi paga davvero è la concorrenza, non il cliente

Il README di Lenis chiede sponsorizzazioni ed elenca **nove sponsor**. Li
abbiamo letti uno a uno:

> The Content Architecture · Glauber Sampaio · Scott Sunarto · **Luis
> Bizarro** · **Edoardo Lunardi** · **cachet.studio** · **GoodFella Studio** ·
> **OHO Design** · **OFF+BRAND**

**Otto su nove sono studi o sviluppatori dello stesso mestiere.** Cioè: il
ritorno economico diretto e visibile di una libreria da 5,1 milioni di
scaricamenti al mese è **la sponsorizzazione dei propri pari**. Non clienti
finali. Non aziende che comprano siti.

## Prova 2 — il costo è misurabile e non è piccolo

Le issue aperte oggi, contate dall'API:

| organizzazione | repo | **issue aperte** |
|---|---|---|
| darkroom.engineering | 50 | **114** |
| basementstudio | 49 | **250** |
| **pmndrs** | 99 | **1.666** |

Pubblicare vuol dire ereditare una coda di segnalazioni che non finisce mai.
Lenis da solo ha **23 issue aperte e 661 fork**. `drei` ne ha 113, `leva` 125.
**pmndrs non è un'agenzia**: è un collettivo che vive di sponsorizzazioni,
proprio perché quel carico non è sostenibile mentre fatturi progetti.

## Prova 3 — il meccanismo vero è la posizione, non il contatto

Quello che una libreria diffusa produce in modo dimostrabile è **presenza nel
posto dove stanno i pari**:

- `lenis` è nel `package.json` di decine di migliaia di progetti, col nome
  `darkroom.engineering` nella riga della licenza;
- **`locomotive-scroll` — la libreria di un altro studio premiato — oggi è un
  guscio costruito sopra Lenis**, ed è elencata nel README di Lenis come
  "plugin". Il concorrente storico è diventato un satellite;
- il README di Lenis elenca **tutorial scritti da terzi** e **plugin di altri
  studi** (`r3f-scroll-rig` di 14islands);
- i README dei repository sono usati come **vetrina commerciale**: quello di
  `website-2k25` si apre con *"A digital studio & branding powerhouse making
  cool shit that performs. We partner with the world's most ambitious
  startups, scale-ups and brands..."* seguito dai link ai social. È un
  depliant, non una documentazione.

L'intenzione commerciale quindi c'è, ed è esplicita. **Il risultato non è
documentato da nessuna parte.**

Questo combacia con `_PRESENZA-PUBBLICA.md` — *i follower si accumulano dove
sta l'oggetto* — e spiega il tipo di ritorno: non "un cliente ci ha scritto",
ma **essere lo studio che gli altri studi citano**. Da lì passano
raccomandazioni, lavoro white-label e assunzioni. È reale ed è indiretto.

## Prova 4 — il controesempio dentro i nostri stessi dati

Tre studi, tre strategie opposte, tutte funzionanti:

- **darkroom.engineering** pubblica librerie vere e ne ha una che è uno
  standard;
- **basementstudio** ha 49 repository e **nessuna libreria di successo vivo**
  (la più stellata è ferma dal 2024) — ed è uno studio più grande, con più
  premi;
- **Bruno Simon** non pubblica librerie: pubblica **dimostrazioni**, e vende
  un corso. Il suo repository più stellato è un portfolio del 2019.

**Se pubblicare librerie fosse la leva commerciale, i tre non potrebbero stare
tutti in piedi.** L'open source non è la variabile che decide.

## Cosa ne ricaviamo, in pratica

**Per un'agenzia che apre oggi in Brianza: no, non pubblicare una libreria.**
Il costo è certo (le issue), il ritorno è indiretto, differito e non
documentato, e il pubblico che raggiungi **è fatto di concorrenti**, non di
clienti. In `_COME-SI-PARTE.md` c'è la leva con la resa dimostrata: **9 studi
su 12 hanno vinto il primo premio con un progetto senza cliente**, e il primo
premio con un cliente pagante arriva a ~28 mesi. È lì che vanno le ore.

**Ma c'è un formato che conviene, ed è un altro.** Non "una libreria": **uno
strumento piccolo, nato da un problema che abbiamo avuto davvero**. Nei dati
si vede il modello:

- **`lenify`** (22 stelle) — estensione che applica Lenis a qualsiasi sito;
- **`forma`** (20 stelle) — istanze statiche da un font variabile;
- **`spargo`** (11 stelle) — dithering su GPU;
- **`fitbox`** (9 stelle) — testo che riempie il riquadro.

Costano un pomeriggio, non hanno coda di manutenzione, e fanno esattamente il
lavoro che serve a chi apre: **dimostrare competenza a chi sa leggerla**. Con
una regola sola: **licenza MIT dal primo commit**, così chiunque possa usarlo
davvero — che è l'unico motivo per cui poi ti citano.

Il regalo più efficace, se un giorno vorremo farne uno, non è nemmeno codice:
è **la cosa che gli altri non pubblicano**. In questa ricerca ce ne sono due,
già misurate e che nessuno ha documentato: i **suoni di interazione**
(`_SUONO.md`) e i **preloader** (`_PRELOADER.md`).

---

# 9. Metodo e verificabilità

Tutti i numeri di questa scheda vengono da interrogazioni fatte il
**13/08/2026**:

- **API GitHub REST** (`api.github.com`, senza autenticazione, via
  PowerShell): elenchi dei repository delle organizzazioni
  `darkroomengineering`, `basementstudio`, `pmndrs`, `greensock` e
  dell'utente `brunosimon`; albero dei file e `package.json` di `satus`;
  `package.json`, README ed elenco dei file di `GSAP`; README di `lenis`,
  `satus`, `website-2k25`.
- **Registro npm** (`registry.npmjs.org`) per versioni e date di
  pubblicazione; **`api.npmjs.org/downloads`** per gli scaricamenti
  dell'ultimo mese.
- **`gsap.com/standard-license`** letto nel sorgente HTML, che è come è
  emerso che il vecchio riassunto della licenza è dentro un commento.

Le risposte grezze sono salvate e riesaminabili. **Stelle e scaricamenti
cambiano**: se rileggi questa scheda fra sei mesi, rifai le interrogazioni —
il metodo vale più dei numeri.

**Cosa manca e va aggiunto** da chi riprende il dossier:
1. le dichiarazioni degli studi sul ritorno commerciale dell'open source
   (interviste, podcast, conferenze) — verifica non completata qui;
2. i termini esatti del passaggio di GSAP sotto Webflow nell'annuncio di
   ottobre 2024, letti alla fonte;
3. una lettura del codice di `shader-lab` prima di deciderne l'uso.
