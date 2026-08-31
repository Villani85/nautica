# D1 — allineare la catena `collaudo` e `pubblica.yml`

Inizio: 2026-08-31T17:04:53+02:00
Fine: 2026-08-31T17:13:56+02:00

## Cosa ho scritto

- `strumenti/collaudo-cancelli.mjs` (nuovo): legge la catena `collaudo` da
  `package.json` e gli step di `pubblica.yml` (diretti `node
  strumenti/collaudo-X.mjs` + `npm run collaudo:X` risolti attraverso
  `package.json`), estrae i nomi dei cancelli e fallisce se uno compare da
  una parte sola senza un'eccezione dichiarata con ragione scritta (≥ 20
  caratteri, altrimenti l'eccezione stessa è rossa). Ha anche una guardia
  dedicata: `collaudo-traversata-world` non deve **mai** comparire né nella
  catena locale né nel workflow.
- `package.json`: aggiunto `node strumenti/collaudo-impaginato.mjs` alla
  catena `collaudo` (girava già in CI via `npm run collaudo:impaginato`, ma
  non era nella catena locale — divergenza nell'altro verso), e aggiunto
  `node strumenti/collaudo-cancelli.mjs` come penultimo passo (prima di
  `peso.mjs`).
- `.github/workflows/pubblica.yml`: aggiunti 7 step mancanti (vedi sotto).
- Questo referto.

## I due conteggi veri (contati con lo strumento, non a occhio)

**Prima** (stato del repo all'inizio dell'incarico):
- catena locale `npm run collaudo`: **30** cancelli (`collaudo-*.mjs`
  incatenati con `&&`, esclusa `peso.mjs` che non è un cancello ma una
  misura di peso)
- `pubblica.yml`: **19** cancelli invocati direttamente (`run: node
  strumenti/collaudo-X.mjs`) + **1** invocato indirettamente via `npm run
  collaudo:impaginato` (risolto in `collaudo-impaginato.mjs`, che però NON
  stava nella catena locale) = **20** cancelli effettivi, ma solo **19** in
  comune con la catena locale.
- Cancelli nella catena locale e assenti dal workflow, **senza nessuna
  dichiarazione in nessuno dei due file**: 11 —
  `workflow`, `piano`, `inquadrature`, `finale`, `orizzonte`, `cielo`,
  `cinematica`, `finale-vivo`, `ingombri`, `corsa-viva`, `fluidita`.
  (Di questi, `orizzonte`, `cielo`, `cinematica` avevano già una spiegazione
  scritta *dentro `pubblica.yml`* per restarne fuori — ma nessuno strumento
  la verificava o la rendeva un'eccezione formale; le altre 8 non avevano
  alcuna nota.)
- Cancello nel workflow e assente dalla catena locale: 1 —
  `collaudo-impaginato.mjs` (girava solo in CI, via script `npm run`
  intermedio).
- **Nota sul numero che mi era stato dato**: l'incarico parlava di "una
  trentina" e di "dieci" divergenti "fra cui" un elenco di 10 nomi. Il primo
  numero torna (30). Il secondo no: i nomi elencati nell'incarico sono
  esattamente 10, ma la lista vera è 11 — mancava `piano`
  (`collaudo-piano.mjs`), che infatti non compariva né citato né escluso in
  nessuna riga di `pubblica.yml`. Contato con lo script sopra, non a
  occhio.

**Dopo** (con `strumenti/collaudo-cancelli.mjs` in esecuzione, VERDE):
- catena locale: **31** cancelli (30 + `collaudo-impaginato.mjs`;
  `collaudo-cancelli.mjs` stesso non si conta — è il metro, non il misurato)
- workflow: **27** cancelli (19 originali + `impaginato` via `npm run` +
  7 aggiunti: `piano`, `inquadrature`, `finale`, `finale-vivo`, `ingombri`,
  `corsa-viva`, `fluidita`)
- differenza 31 − 27 = 4, e sono esattamente le 4 eccezioni dichiarate che
  restano solo-locali (`workflow`, `orizzonte`, `cielo`, `cinematica`) —
  nessun'altra divergenza.

## Le eccezioni dichiarate, con la ragione (dentro `collaudo-cancelli.mjs`)

1. **`workflow`** (`collaudo-workflow.mjs`) — verifica che `pubblica.yml` non
   abbia chiavi ripetute che lo farebbero rifiutare da GitHub Actions (zero
   job, corsa rossa senza un errore che lo dica). Se il workflow è invalido
   la CI non parte: un cancello dentro la CI non potrebbe mai vederlo. Deve
   fallire in locale, prima della spinta — è la stessa ragione già scritta
   nella testata del file.

2. **`orizzonte`** (`collaudo-orizzonte.mjs`) — misura la struttura tonale
   del disegno. Il runner CI non ha GPU: gira su un rasterizzatore software
   (SwiftShader), che produce una tonalità diversa da quella di un
   visitatore vero. Provato su questo runner: rosso, mentre in locale (con
   GPU) passa. Ragione già scritta in `pubblica.yml` (riga ~95 prima delle
   mie modifiche), ora anche formalizzata come eccezione controllata dallo
   strumento.

3. **`cielo`** (`collaudo-cielo.mjs`) — stessa famiglia e stessa causa di
   `orizzonte`.

4. **`cinematica`** (`collaudo-cinematica.mjs`) — aspetta che un ingresso
   compia un giro completo entro un tetto di orologio reale (45 s). Sul
   rasterizzatore software del runner il motore avanza a passo simulato
   limitato (`Math.min(getDelta(), 0.05)`), quindi in 45 s reali il
   meccanismo vive solo ~2 s simulati e nessun punto chiude il giro — è un
   cancello che misurerebbe la velocità della macchina, non il sito. Ragione
   già scritta in `pubblica.yml` (riga ~110 prima delle mie modifiche).

5. **`traversata-world`** (`collaudo-traversata-world.mjs`) — per l'incarico
   D4/onda2: rosso per costruzione (il GLB world-space che collauda non
   esiste ancora), vive da solo come `npm run onda2`, e NON deve entrare né
   nella catena né in CI finché non diventa verde. È l'unica eccezione con
   una guardia dedicata nello script (controlla che il nome non compaia in
   nessuna delle due liste, non solo che la sua assenza sia "giustificata").

## La parte delicata (browser in CI)

Il workflow installa già Chromium (`npx playwright install --with-deps
chromium`) e diversi cancelli con browser girano già in CI, inclusi due che
chiedono esplicitamente `apriBrowser({ conGpu: true })` — `scia` e `varco` —
e passano. Ho verificato caso per caso i 6 cancelli mancanti che aprono un
browser:

- `inquadrature`, `finale`, `finale-vivo`, `ingombri`, `corsa-viva` usano
  tutti `apriBrowser({ conGpu: true })`, la stessa chiamata già provata in CI
  da `scia`/`varco`. Misurano posizioni DOM (`getBoundingClientRect`),
  screenshot per stato video, o un valore JS (`window.__nautica.p`) — non la
  struttura tonale del rendering come `orizzonte`/`cielo`. Li ho aggiunti.
- `fluidita` si autoriconosce su un rasterizzatore software (cerca
  `swiftshader|llvmpipe|software|basic render` nel renderer riportato dal
  browser) e in quel caso NON dà un verdetto di prestazione — stampa i
  numeri per debug ed esce verde (`await finisci(0)`). Per questo può
  entrare in CI anche senza GPU vera. Aggiunto.
- Nessuno dei sei è stato lasciato fuori in silenzio: o è entrato in CI
  (tutti e sei), o — non essendo questo il caso — sarebbe finito
  nell'elenco delle eccezioni con ragione.

`collaudo-traversata-world.mjs` non è stato toccato: resta fuori da entrambe
le liste come richiesto, protetto da una guardia dedicata nello strumento
(punto 4 sopra), e vive come `npm run onda2`.

## Prova ROSSA e VERDE

**ROSSA**: ho tolto temporaneamente la riga del passo `piano` da
`pubblica.yml` (il cancello `collaudo-piano.mjs`, appena aggiunto al
workflow) e lanciato `node strumenti/collaudo-cancelli.mjs`:

```
ROSSO -- 1 cancelli girano in "npm run collaudo" e non in pubblica.yml, senza eccezione dichiarata:
    collaudo-piano.mjs
    Aggiungili al workflow, o dichiara qui sopra perche' restano fuori.

  catena locale:  31 cancelli
  workflow CI:    26 cancelli
  eccezioni dichiarate: 5 (workflow, orizzonte, cielo, cinematica, traversata-world)

ROSSO -- le due liste divergono senza che la divergenza sia tutta dichiarata.
```
Uscita con `exit code 1`, come atteso.

**VERDE**: ripristinata la riga (dal backup fatto prima di romperla) e
rilanciato:

```
  catena locale:  31 cancelli
  workflow CI:    27 cancelli
  eccezioni dichiarate: 5 (workflow, orizzonte, cielo, cinematica, traversata-world)

VERDE -- ogni cancello sta in entrambe le liste, o la sua assenza e' dichiarata con una ragione.
```
Uscita con `exit code 0`. Confrontato il file con il backup (`diff`):
identico dopo il ripristino. Rilanciato anche `collaudo-workflow.mjs` prima
e dopo: nessuna chiave ripetuta introdotta dalle mie modifiche.

## Verifiche finali

- `node -e "require('./package.json')"` → JSON valido.
- `node --check strumenti/collaudo-cancelli.mjs` → sintassi OK.
- `node strumenti/collaudo-piano.mjs` (il gate appena aggiunto a CI) →
  VERDE oggi (0 righe smentite su 308 esaminate), quindi non introduce una
  CI rossa immediata.
- `collaudo-cancelli.mjs` NON è stato aggiunto come step separato in
  `pubblica.yml` (non richiesto dall'incarico, che lo vuole solo nella
  catena `collaudo` di `package.json`); esclude se stesso dal conteggio
  della catena locale per non controllare la propria presenza in un elenco
  che parla di lui.

Non ho toccato `riferimenti/Piano.md`. Nessun commit, nessuna push.
