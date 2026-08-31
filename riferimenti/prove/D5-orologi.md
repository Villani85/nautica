# D5 — Quanti orologi ci sono davvero

Inizio: 2026-08-31T17:05:12+02:00

Sola lettura su tutto `src/`. Nessun file sorgente toccato. Questo referto
conta e propone, non unifica: l'unificazione tocca file della catena C e la
fara' chi ne ha la proprieta'.

## 0. L'elenco del Piano era sbagliato — correzione via grep

`riferimenti/Piano.md` non fornisce l'elenco degli otto file — l'elenco degli
otto file mi e' arrivato nell'incarico. Verificato con:

```
grep -rn "performance\.now()\|requestAnimationFrame" src/ --include=*.js
```

Risultato reale: **7 file con chiamate vere**, non 8, e non gli stessi 8:

| File dell'incarico | Verificato | Nota |
|---|---|---|
| `ui/nudge.js` | SI | uso vero |
| `ui/studio.js` | SI | uso vero |
| `ui/comandi.js` | SI | uso vero |
| `demo.js` | SI | uso vero |
| `main.js` | SI | uso vero |
| `scena/guasto.js` | **NO** | solo due commenti che *nominano* `requestAnimationFrame` per spiegare perche' e' stato tolto (righe 383, 395) — zero chiamate |
| `scena/traversata.js` | **NO** | solo un commento che *nomina* `performance.now()` per spiegare perche' non si usa (riga 218) — zero chiamate |
| `scena/salone3d.js` | SI | uso vero, ma diverso da quello descritto: e' un'attesa con tetto, non un orologio |
| (mancante) `salone-atto.js` | **da aggiungere** | 3 chiamate vere, non era nell'elenco |

`guasto.js` e `traversata.js` sono stati inclusi per errore — probabilmente
perche' un grep piu' largo (o una lettura a occhio) ha preso i commenti che
*discutono* quelle API per contesto, non chiamate. `salone-atto.js` mancava.
L'elenco corretto e' quindi: `demo.js`, `main.js`, `salone-atto.js`,
`scena/salone3d.js`, `ui/comandi.js`, `ui/nudge.js`, `ui/studio.js`.

## 1. Tabella completa (occorrenze vere, non i commenti)

| File | Riga | Classificazione | Cosa scandisce |
|---|---|---|---|
| `demo.js` | 100-101 | CICLO | `sveglia()`: a movimento ridotto ridisegna finche' `n<45`, poi si ferma — il limite e' un conteggio di fotogrammi, non un tempo |
| `main.js` | 109 | OROLOGIO | `t0 = performance.now()` — nasce l'orologio dell'ENTRATA della pagina |
| `main.js` | 119, 128 | OROLOGIO | stesso orologio: `k=(t-t0)/ENTRATA_MS`, `ENTRATA_MS=1100`, scandisce `--pelo` (l'apertura del pelo dell'acqua in ingresso) |
| `salone-atto.js` | 80-83 (marca passata a `passo`, rAF non testuale qui ma e' lo stesso circuito di 190) | CICLO | `passo(marca)` calcola `dt` dalla marca del fotogramma e chiama `avanza(dt, marca)` di `stato.js` — alimenta l'UNICO orologio fisico condiviso, non ne e' uno proprio |
| `salone-atto.js` | 190 | CICLO | `giro`: fallback quando il composito non ha un renderer proprio — stesso `passo` di sopra, un fotogramma alla volta |
| `salone-atto.js` | 206-207 | CICLO | `sveglia()`: identico a `demo.js`, `n<30` fotogrammi poi si ferma |
| `scena/salone3d.js` | 721 | ATTESA | `chiudi()` dentro `consegnaAllaCalma`: rete di sicurezza a fianco di `requestVideoFrameCallback`, con tetto `attese<60` **fotogrammi** (non millisecondi) — aspetta il fatto "il seek ha fatto effetto", non un tempo |
| `scena/salone3d.js` | 766 | ATTESA | `framePronto()`: stessa attesa, doppia via (`requestVideoFrameCallback` + rAF), `chiudi` e' idempotente |
| `ui/comandi.js` | 279-290 | OROLOGIO | `mostraCheSiGira()`: `t0` al primo fotogramma, dura `secondi*1000` (2,4 s default), scandisce la dimostrazione "si puo' girare" (oscillazione avanti-indietro) |
| `ui/nudge.js` | 348, 366, 383 | OROLOGIO | `ultimoGesto = performance.now()` ogni gesto — nasce/si rinnova l'orologio di inattivita' |
| `ui/nudge.js` | 442 | OROLOGIO | `performance.now() - ultimoGesto > PAUSA` — decide quando un suggerimento puo' comparire |
| `ui/studio.js` | 47, 75, 80, 91, 96, 101 | OROLOGIO | `nascita`, `primoGestoEfficace`, `permanenza` per sistema, durata annotazioni — una famiglia di misure sullo stesso orologio (`performance.now()`), strumento di banco opt-in (`?studio=1`) |

Commenti-soltanto (non contano come orologi, ma spiegano il principio del
progetto — vedi §4): `scena/guasto.js:383,395`, `scena/traversata.js:218`.

## 2. `passoDichiarato` — cosa fa davvero

`src/scena/index.js:1684` (`window.__nautica.passoDichiarato`): chiama
`disegna(ultimaSim, undefined, { dt, senzaDisegno: true })` per `n` passi.
Dentro `disegna` (riga 1098-1125): `const dt = dichiarato ? opz.dt : Math.min(orologio.getDelta(), 0.05)`,
poi `avanza(dt, dichiarato ? undefined : marca)` in `stato.js`. Cioe': **sotto
passo dichiarato il tempo non lo detta piu' un orologio da parete, lo detta
chi chiama**, un passo simulato alla volta, senza disegnare — cosi' la misura
vale uguale su questa macchina e su un runner senza GPU (commento del file,
riga 1676-1680: "nessun cancello misura la velocita' della macchina").

Questo tocca **due orologi che il grep letterale non vede**, perche' non
scrivono `performance.now()`/`requestAnimationFrame` nel proprio file — ricevono
il tempo come parametro:

- `scena/index.js:754` — `const orologio = new Clock()` (THREE.Clock, wave-clock):
  guida `t` (righe 1102-1113), le onde. Sotto `passoDichiarato`, `opz.dt`
  sostituisce `orologio.getDelta()`.
- `stato.js:188` — `export function avanza (dt, marca)`: il tempo fisico
  (rollio, stabilizzatore). Riga 184-198 e commento 169-183: "**E ANCHE IL
  TEMPO HA UN PADRONE SOLO**" — un guard su `marca === ultimaMarca` impedisce
  il doppio passo quando salone e dimostrazione disegnano nello stesso
  fotogramma. E' gia' stato un bug reale (la nave rollava al doppio della
  velocita' al confine fra i due capitoli).

Sono entrambi deterministici sotto `passoDichiarato`: ricevono `dt` diretto,
non ricalcolano mai da un orologio reale.

## 3. `traversata.js:avanza()` — l'esempio citato nell'incarico

`scena/traversata.js:279-284`: la consegna del finale (dal filmato della
traversata al loop calmo) non usa `performance.now()`, usa
`videoCalma.currentTime / DURATA_CONSEGNA`. Il commento alle righe 214-222
spiega il perche', in due proprieta' che un orologio da parete non ha:

1. se il browser rifiuta di suonare il video, `currentTime` resta 0 — la
   consegna non parte e in campo resta l'ultimo fotogramma, mai un buco;
2. sotto `passoDichiarato` la dissolvenza non dipende da quanto e' carica la
   macchina — perche' non e' guidata da un orologio che accumula tempo reale,
   e' guidata dal fatto "il video e' arrivato a un certo punto della sua
   propria pista".

E' lo stesso principio applicato in `scena/guasto.js` (righe 380-408, solo
commenti oggi): prima c'era un doppio `requestAnimationFrame` per far partire
una transizione — misurato: su un browser senza GPU, un secondo e mezzo di
ritardo. Sostituito con una lettura di layout (`el.offsetHeight`) che forza il
browser a fissare lo stato iniziale e lascia che sia la transizione CSS,
non JS, a scandire il resto. Stessa mossa concettuale: **il tempo lo dà il
fatto (il video che avanza, il layout che si fissa), non l'orologio**.

## 4. Il conteggio vero

**Nello scope letterale del grep (i 7 file con chiamate vere): 4 orologi
indipendenti**, non un conteggio piatto delle occorrenze:

1. `main.js` — orologio dell'entrata di pagina (1100 ms, una volta sola, prima
   che la scena esista)
2. `ui/comandi.js` — orologio del suggerimento "si puo' girare" (2,4 s, su
   gesto dell'utente)
3. `ui/nudge.js` — orologio di inattivita' (soglia `PAUSA`, continuo)
4. `ui/studio.js` — famiglia di misure UX, stesso orologio (`performance.now()`),
   opt-in, fuori dal percorso critico

Le altre occorrenze nello scope letterale **non sono orologi**: `demo.js` e
`salone-atto.js` hanno CICLI limitati per conteggio di fotogrammi (non di
tempo), e `salone3d.js` ha un'ATTESA con tetto in fotogrammi. `salone-atto.js`
righe 80-190 alimentano l'orologio fisico condiviso, non ne possiedono uno
proprio.

**Fuori dallo scope letterale (non scrivono `performance.now()`/rAF nel
proprio file, ricevono il tempo come parametro), ma sono orologi reali e sono
il cuore della domanda "tre orologi diversi" del Piano: altri 4**:

5. `scena/index.js` — orologio delle onde (`Clock()` di three.js), un solo
   proprietario
6. `stato.js` — orologio fisico (`avanza(dt, marca)`), "un padrone solo",
   condiviso fra salone e dimostrazione
7. `scena/traversata.js` — orologio-video della consegna traversata→calma
   (`videoCalma.currentTime`)
8. `scena/salone3d.js` — orologio-video della consegna sollievo→calma
   (`consegnaAllaCalma`, `vCalma.currentTime`), stesso principio del punto 7
   ma un'altra coppia di video

**Totale orologi indipendenti nel sito: 8**, non tre. Sono 8 sorgenti di
tempo che NON si azzerano o non si accumulano a vicenda: fermarne una non
ferma le altre.

## 5. Candidati all'unificazione e rischio

- **`main.js` (entrata) + `ui/comandi.js` (mostraCheSiGira)** — stesso
  pattern (t0 al primo rAF, durata dichiarata in ms, easing, un colpo solo).
  Potrebbero condividere un piccolo helper "cronometro(durata, passo)".
  Rischio: BASSO — sono entrambe animazioni UI transitorie, nessuna delle due
  tocca lo stato della simulazione. L'unico attrito e' che `main.js` gira
  PRIMA che la scena esista (non puo' dipendere da un modulo di scena), quindi
  l'helper condiviso dovrebbe vivere in un file neutro, non in `scena/`.
- **Le due ATTESE video-consegna (`traversata.js`, `salone3d.js`)** —
  stesso pattern (`requestVideoFrameCallback` + rAF di rete, tetto in
  fotogrammi, `chiudi` idempotente). Potrebbero condividere una funzione
  `attendiFotogrammaVideo(video, condizione, tetto)`. Rischio: BASSO-MEDIO —
  la logica e' identica ma i due chiamanti hanno soglie di "condizione
  raggiunta" diverse (`readyState`/`currentTime` con confronti diversi); un
  helper mal fatto rischia di reintrodurre uno dei due bug gia' misurati e
  descritti nei commenti (chiusura anticipata a 0,96 s, o attesa che non
  arriva mai su rasterizzatore software).

## 6. Intoccabili, e perche'

- **`stato.js` (`avanza`) e `scena/index.js` (`orologio` delle onde)** — sono
  gia', di fatto, UN SOLO orologio fisico per capitolo, con un guard
  esplicito (`marca === ultimaMarca`) nato da un bug reale (doppio rollio al
  confine fra salone e dimostrazione). Fondere ulteriormente i due (onde +
  fisica) in un'unica classe e' rischioso: sono due grandezze concettualmente
  diverse (le onde sono un tempo continuo estetico, il rollio ha semantiche di
  reset/inchiodatura — `FERMO_A`, `inchiodata` — che non si applicano alle
  onde) e la fusione toccherebbe file di catena C. Non e' compito di questo
  incarico proporla oltre l'osservazione che sono gia' allineati sotto
  `passoDichiarato`.
- **Gli orologi-video (`traversata.js`, `salone3d.js`)** — NON vanno mai
  convertiti in `performance.now()`. E' esattamente l'anti-pattern che il
  progetto vieta: "un orologio da parete dentro una transizione visiva rende
  quella transizione non riproducibile sotto misura". Convertirli
  romperebbe le due proprieta' che li giustificano (silenzio se il video non
  parte, indipendenza dal carico macchina sotto `passoDichiarato`) e
  reintrodurrebbe un cancello che misura la velocita' della macchina.
- **`ui/nudge.js` (inattivita')** — misura TEMPO REALE dell'utente
  ("da quanto non tocca niente"). Non ha senso simularlo sotto
  `passoDichiarato` ne' condividerlo con l'orologio di scena: e' l'unico dei
  4 orologi UI che deve restare per costruzione un orologio da parete, perche'
  il fenomeno che misura (l'inattivita' umana) e' esso stesso in tempo reale.
- **`ui/studio.js`** — strumento di banco, opt-in via `?studio=1`,
  esplicitamente fuori dal percorso critico ("non costa un byte" quando non
  richiesto). Unificarlo con qualsiasi altro orologio rischierebbe di tirarlo
  dentro il bundle critico o di legarlo a uno stato che non deve dipendere da
  lui. Misura comportamento umano reale (tempo al primo gesto efficace,
  permanenza), quindi deve restare `performance.now()` per la stessa ragione
  di `nudge.js`.

## 7. «Tre orologi diversi» del Piano: giusto, sbagliato, o giusto altrove?

**Giusto in un senso diverso da quello che un grep letterale suggerirebbe.**
Se «tre orologi» si riferisce al DOMINIO SCENA/SIMULAZIONE — quello che
`passoDichiarato` deve rendere deterministico — il numero e' quasi giusto:
ci sono le onde (`Clock()`), la fisica (`avanza`), e il pattern video-consegna
(usato due volte, `traversata.js` + `salone3d.js`) — tre FAMIGLIE di tempo
scena, anche se la terza ha due istanze. Questi tre non compaiono nel grep
letterale di `performance.now()`/`requestAnimationFrame`: due ricevono `dt`
come parametro, il terzo usa deliberatamente `video.currentTime` per evitare
proprio quell'API.

Il grep letterale — quello che l'incarico chiedeva di verificare — trova
invece un insieme quasi disgiunto: 4 orologi nello strato UI/pagina (entrata,
suggerimento di rotazione, inattivita' dei nudge, telemetria di studio) che
il Piano non conta affatto, perche' non toccano la scena e non hanno bisogno
di essere deterministici sotto misura. Contando tutto insieme il totale reale
e' 8, non 3 — ma la parte che conta per la riproducibilita' sotto
`passoDichiarato` (il vincolo che l'incarico chiede di rispettare) e' proprio
quei tre del dominio scena, gia' unificati o deliberatamente non unificabili
con un orologio da parete.

Fine: 2026-08-31T17:10:24+02:00
