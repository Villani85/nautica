# 20 — IL FINALE

Le due persone tornano, e le hai inclinate tu.

**Stato: progettato e provato quanto si può provare senza essere collegato.**
`src/scena/finale.js` esiste, gira, ed è importato da nessuno. Le righe da
toccare stanno al §4 di questo documento, una per una.

---

## 0. Perché esiste, e chi l'ha chiesto

Tre fonti indipendenti chiedono la stessa cosa, e nessuna delle tre sapeva
delle altre.

| fonte | cosa dice |
|---|---|
| `docs/14 §5`, passo 9 | *«torni alle persone: il valore è il benessere, non il motore»* |
| `docs/14 §11`, riga 9 | *«la rivelazione ritorna alle persone»* — condizione di finito |
| `docs/14 §12`, riga 10 | *«nessuna conclusione narrativa dentro la sala macchine»* — divieto |
| `docs/13 §5` | il finale scritto per esteso, con il suo cancello, **e mai collegato** |
| `docs/17 §2` (revisione di conformità) | tutte e tre marcate **V**: violate |

`docs/17` lo dice con la precisione che serve: *«Le persone escono di scena
alla prima battuta e non tornano»*, e l'ultima cosa che il capitolo pronuncia è
una didascalia a 2,6 unità dal riduttore — cioè esattamente la conclusione
narrativa che §12.10 vieta.

Quindi il finale non è un'aggiunta. È **la chiusura di tre clausole aperte**, e
una di esse è un divieto: finché resta aperta, il sito viola la propria
specifica in un punto che si è scritto da solo.

---

## 1. La forma, in una riga

> Con la lama ferma sul meccanismo, lo scorrimento riporta il salone nella
> fascia alta del fotogramma — **lo stesso gruppo, gli stessi due video, la
> stessa `aggiorna()`** — e toglie il congelamento del rollio. Poi il sito non
> fa più niente. Chi spegne lo stabilizzatore vede la stanza inclinarsi perché
> l'integratore diverge, non perché ci sia una riga che glielo dice.

Le due persone sono già lì, **tranquille**, quando arrivi. È il punto: non
compaiono al gesto. Erano comode, e poi le hai fatte inclinare.

---

## 2. Le tre decisioni

### 2.1 Da dove riappare — **sopra la camera, come una lastra. E non è una preferenza: è quello che la geometria consente**

`docs/13 §5` lasciava tre strade e diceva di sceglierle guardando. Due delle
tre si chiudono **misurando**, prima di guardare, e vale la pena scrivere i
numeri perché sono definitivi.

Coordinate vere del modello: salone a `(0, 1.453, 0.6)`, meccanismo a
`(1.346, -0.262, -1.2)`, camera del primo piano a `(2.017, 0, 1.254)`, campo
34° verticali.

**a) Dal primo piano il salone non è in quadro, e nessun trascinamento ce lo
porta.** Il suo rilevamento vero è **52,6° a babordo e 48,5° in alto**, contro
un semicampo di 28,5° × 17,0° su 16:9 e **8,0° × 17,0° su un telefono**. Sulla
corsa intera dell'azimut (±0,92 rad) resta fra 41° e 61° di lato e fra 28° e
76° in alto. Non ci si arriva girando.

**b) Arretrare costa il meccanismo, e su telefono non basta arretrare.** La
stazione più vicina in cui salone e meccanismo stanno tutti e due dentro un
16:9 è a **5,85 unità invece di 2,55**: il pezzo diventa **2,3 volte più
piccolo**, e il primo piano — che è la richiesta più esplicita che il sito
abbia («devi far vedere come si muove tutto») — se ne va. Su un telefono il
semicampo orizzontale è 8,0° e il salone non scende mai sotto i 41° di lato:
**nessuna stazione esiste, a nessuna distanza.** Questo chiude la strada 1
(«la camera si stacca e mostra la sezione intera») e la strada 2 («la camera
alza lo sguardo») di `docs/13 §5`.

**c) E la sezione non può contenerli tutti e due — mai.** Il piano di taglio è
trasversale, `Plane(0, 0, -1, C)`, e tiene `z < C`. Il meccanismo si legge solo
quando la lama arriva a `C = -0,65` (`Z_DENTRO`); a quel punto il salone, che
sta a `z = +0,6`, **è dentro la fetta che è stata tolta**. Una lama che
risparmi il salone (`C ≥ +0,65`) lascia il meccanismo dentro cinque unità di
scafo intatto. *Non esiste una posizione della lama che li mostri tutti e
due.* È una proprietà del piano, non una scelta di regia — e va detto perché è
il fatto che rende «la camera risale» non solo costoso ma impossibile a lama
ferma.

**Quindi: lastra.** E la lastra non finge di essere una finestra nel soffitto.
Entra come inquadratura dentro l'inquadratura, e rivendica di essere vera in
due cose sole:

- **l'assetto** — è l'angolo della corsa viva, senza scala e senza addolcimento;
- **il contenuto** — è lo stesso gruppo, gli stessi due decodificatori, la
  stessa `salone.aggiorna(sim.S.rollio, dt)` che gira dal primo fotogramma
  della visita. Non una copia: **lo stesso oggetto**, staccato dalla tuga e
  appeso alla camera.

Posizione e scala sono dichiaratamente false. Sono dichiarate false qui, nel
commento in cima al modulo, e nel referto. Il sito non le rivendica.

> **E il rilevamento finto è stato provato e scartato, misurando.** L'idea di
> mettere la lastra «nel verso in cui la tuga sta davvero», comprimendo il
> rilevamento vero dentro la fascia alta, sembra più onesta ed è peggio: lungo
> un ciclo di rollio ad azimut −0,40 il rilevamento passa da −7,5° a −59,4°, e
> attraversando l'azimut **cambia segno** (a −0,92 il salone è a dritta, a 0,00
> a babordo). Una lastra che segue quel numero scivola e poi salta da una parte
> all'antra: si legge come un guasto, non come una direzione. Sta al centro, e
> il verso non lo rivendica nessuno.

#### E dove questo non è d'accordo con `docs/19 §C`

`docs/19 §C.5.1` — che raccomanda giustamente di **non** emendare §5.9/§12.10 e
di fare il lavoro — abbozza la regia così: *«la camera che riesce dal taglio e
rientra nella tuga»*. È la strada 2 di `docs/13 §5`, ed è la prima cosa che ho
provato a numeri. **Non regge**, per i tre fatti qui sopra: il salone è dentro
la fetta che il taglio ha tolto (`z = +0,6` contro una lama a `−0,65`), quindi
rientrare nella tuga vuol dire richiudere il taglio e perdere il meccanismo; e
anche riaprendolo altrove, la stazione che tiene tutti e due in quadro è a 5,85
unità su 16:9 e **non esiste su un telefono**.

Lo scrivo qui invece di lasciarlo divergere in due file, che è esattamente la
patologia che `docs/17 §1` ha chiamato *«la contraddizione più pericolosa del
repository»*: tre documenti che hanno ragione dal proprio punto di vista e
nessuno sa di essere in disaccordo. La frase di `docs/19 §C.5.1` da sostituire
è *«la camera che riesce dal taglio e rientra nella tuga»*, e la sostituzione è
*«la camera non si muove: il salone rientra come lastra appesa alla camera,
perché la sezione non può contenere insieme il meccanismo e la tuga»*.

Resta invece **valido parola per parola** il resto di `docs/19 §C`: §12.10 e
§5.9 si chiudono insieme o non si chiudono, e la conclusione narrativa va
spostata fuori dalla sala macchine (§4.2, riga 4). Una sola differenza
operativa: `docs/19 §C.5.1` parla di *«una battuta dopo `meccanismo`»*, e qui
la battuta **non** cambia — resta `meccanismo` per tutta la rampa e tutto il
pianoro. È deliberato: `data-battuta` porta con sé una dozzina di regole di
`stile.css` e il cancello `collaudo-manopola`, che garantisce proprio lì che
l'interruttore sia raggiungibile. Una battuta nuova vorrebbe dire riprovare
tutte quelle regole per guadagnare un nome.

### 2.2 Quanto occupa — **non si sceglie: è quello che resta sopra il meccanismo**

`docs/14 §12.6` vieta le scale scelte guardando lo schermo, e il divieto vale
anche qui. La regola non ha numeri dentro:

> **la lastra non può coprire il meccanismo.**

Si proietta l'ingombro dell'impianto sul fotogramma (`Box3` → sfera, misurata
sul gruppo vero, non dichiarata), si prende il suo bordo alto, e la lastra vive
fra quel bordo e il bordo alto del fotogramma, rientrando del margine. Il
margine non è nuovo: è il 7% per lato con cui `salone3d.js` già stacca la
stanza dai bordi della tuga (`tuga.alt * 0.86`).

Cosa ne esce, calcolato — non guardato:

| schermo | la lastra occupa | note |
|---|---|---|
| 1280×720 | **33%** dell'altezza, 32% della larghezza | |
| 1440×900 | 33% dell'altezza, 35% della larghezza | |
| 390×844 (telefono) | 26% dell'altezza, **93%** della larghezza | si stringe per larghezza, il semicampo è 8,0° |

Al meccanismo resta in tutti e tre i casi **almeno i due terzi del fotogramma**,
che è la risposta alla domanda «a schermo pieno cancella il meccanismo». E la
misura cambia da sola con schermo, campo e distanza, invece di essere un numero
che qualcuno ha battuto una volta.

Quando si stringe, **si cede verso il basso e si tiene il bordo alto**: il
bordo che si sacrifica è quello verso il meccanismo, dove c'è spazio, non
quello verso il cielo, che è il bordo del fotogramma.

**Come entra:** scendendo dal bordo alto, non dissolvendo. Una dissolvenza su
una fotografia di due persone la fa sembrare un fantasma, e a metà apertura
sarebbe una fotografia semitrasparente davanti a un meccanismo — due immagini
sovrapposte e nessuna leggibile. Scendendo, la lastra è sempre opaca e a
cambiare è quanta ne è entrata, che è anche cosa fa una cosa che arriva da
sopra.

### 2.3 Cosa lo fa apparire — **lo scorrimento arma, il gesto accende. E D29 non si rompe.**

Questa è la decisione che cambia il conto, quindi va detta con precisione.

D29 dice: *«un nodo, un padrone. **La posizione** ha un solo proprietario, lo
scorrimento. Tutto il resto la legge.»* Non dice «niente altro può causare
niente»: l'interruttore causa già la calma della nave, e nessuno ha mai
chiamato quello una violazione.

Nel finale i due padroni governano due cose diverse, e ciascuna ne ha uno solo:

| cosa | padrone |
|---|---|
| dove sta la camera, quanto è aperto il taglio, quanto è entrata la lastra | **lo scorrimento** |
| quanto la stanza è inclinata | **l'integratore**, cioè `S.stab` e il mare |

**E la camera non si muove affatto.** Questa è la proprietà che vale più di
tutto l'argomento: durante il finale `spaccato` resta 1, `avvicinamento` resta
1, il raggio resta 2,6, l'azimut resta quello che la mano ha lasciato. Il
finale cambia due cose sole — se il salone è disegnato e dove sulla lastra, e
se il rollio è congelato — e **nessuna delle due è una posizione**.

Quindi il contratto che `docs/13 §2` dava per rotto **qui non serve romperlo**.
Si romperà nell'atto due, per la lama, in un punto dichiarato. Non qui, e non
per deriva.

Corollario, ed è la ragione per cui questa forma è più forte di «la lastra
compare quando spegni»: **quando arrivi, le due persone sono già lì e stanno
bene.** Il sito si apre col sistema acceso (`stato.js` lo argomenta: «si entra
da dove si sta bene»). Scendi, il taglio si apre, arrivi sul riduttore, e sopra
di te c'è la stanza della prima schermata, ferma. Poi spegni. Il cerchio non si
chiude con una comparsa: si chiude con una conseguenza.

E se qualcuno arriva col sistema già spento, il finale è già vero e si mostra
per quello che è. Il sito non fa il poliziotto sull'autore della causa.

---

## 3. Cosa smette di essere congelato, e perché è obbligatorio

Oggi `index.js:474` scrive:

```js
nave.rotation.z = MathUtils.degToRad(sim.S.rollio) * (1 - spaccato)
```

con la nota «non si seziona un oggetto in movimento». La regola vale mentre la
lama **entra** — un disegno tecnico è fermo — e smette di valere quando il
taglio è fatto e si guarda il pezzo lavorare: lì una nave che non si muove è
l'unica cosa falsa nell'inquadratura.

E non è una rifinitura. **Senza questa riga il cancello è rosso per
costruzione:** a `spaccato = 1` lo scafo verrebbe disegnato dritto mentre la
stanza sopra si inclina di θ — fino a **12,4° di disaccordo**, contro una
tolleranza di 0,05°.

`finale.js` la sostituisce con `fattoreRollio(spaccato, f)`, che a `f = 0`
restituisce esattamente `1 - spaccato`: a finale spento il sito è quello di
prima, bit per bit.

> **Questo contraddice una frase di `docs/14`, e la contraddizione va registrata
> lì, non qui.** §5.2 dice: *«Durante il close-up la camera è solidale alla
> struttura dello yacht»*. Oggi la frase è vacuamente vera, perché a
> `spaccato = 1` né la nave né la camera ruotano. Togliendo il congelamento le
> due cose divergono, e il finale ha bisogno della convenzione opposta: **camera
> solidale al mondo**, perché «sopra di te il salone si inclina» richiede che a
> inclinarsi sia la nave nell'inquadratura, non il mare attorno a una nave
> ferma. La frase da sostituire in `docs/14 §5.2` è quella, e la sostituzione è:
> *«Durante il close-up la camera è solidale alla struttura dello yacht finché
> il rollio è congelato; nel finale il congelamento cade e la camera resta
> solidale al mondo.»* Segue l'istruzione in coda a `docs/14`: frase esatta
> sostituita, e il fatto del codice che lo impone.

---

## 4. Cosa collegare — riga per riga

Numeri di riga all'ultimo stato letto, **e accanto il testo esatto da cercare**:
`docs/13 §6` ha già pagato una volta il prezzo di fidarsi dei numeri, che si
spostano in poche ore. Cerca il testo, usa il numero come indizio.

### 4.1 `src/scena/index.js`

| # | riga oggi | cosa diventa |
|---|---|---|
| 1 | `import { creaSalone3D } from './salone3d.js'` (**:11**) | aggiungere sotto: `import { creaFinale, fattoreRollio, visibilitaSalone } from './finale.js'` |
| 2 | `scena.add(nave)` (**:210**) | aggiungere sotto: `scena.add(camera)` — **obbligatorio**: three disegna solo ciò che pende dalla scena, e la camera qui non ci è mai stata. Senza, la lastra non viene disegnata affatto. Effetto collaterale desiderabile: `chi(u,v)` comincia a vedere la lastra |
| 3 | `if (salone) nave.add(salone.gruppo)` (**:299**) | aggiungere sotto: dare un nome ai due piani, così il raggio del cancello sa cosa ha colpito — oggi tornano `(senza nome)`:<br>`if (salone) salone.gruppo.children.forEach((m, i) => { m.name = i === 0 ? 'SALONE_MARE' : 'SALONE_STANZA' })` |
| 4 | dopo `const impianti = agganci.map(...)` (**:224**) e dopo la riga 3 | creare il finale — vuole il salone, la camera, la nave e il gruppo dell'impianto:<br>`const finale = salone ? creaFinale({ salone, camera, nave, impianto: impianti[0]?.gruppo ?? null }) : null` |
| 5 | `let uscita = LA_SCENA_E_UNA ? 0 : 1` (**:354**) | aggiungere sotto: `let finaleVoluto = 0` |
| 6 | `function impostaAvvicinamento (v) {` (**:409**) | aggiungere una funzione gemella accanto:<br>`function impostaFinale (v) { if (!LA_SCENA_E_UNA) return; finaleVoluto = MathUtils.clamp(v, 0, 1) }` |
| 7 | **prima** di `nave.rotation.z = ...` (**:474**) | `const f = finale ? finale.aggiorna({ f: finaleVoluto, dt }) : 0`<br>Va **prima**, perché la riga 8 ne ha bisogno. Legge la posa della camera del fotogramma precedente: incide solo sulla fascia, che cambia con lo schermo e con il trascinamento — mai sull'inclinazione |
| 8 | `nave.rotation.z = MathUtils.degToRad(sim.S.rollio) * (1 - spaccato)` (**:474**) | `nave.rotation.z = MathUtils.degToRad(sim.S.rollio) * fattoreRollio(spaccato, f)` |
| 9 | `salone.mostra(1 - MathUtils.clamp((uscita - 0.62) / 0.30, 0, 1))` (**:484**) | `salone.mostra(visibilitaSalone(1 - MathUtils.clamp((uscita - 0.62) / 0.30, 0, 1), f))` |
| 10 | `salone.gruppo.rotation.z = -nave.rotation.z` (**:489**) | `if (!finale?.attaccato) salone.gruppo.rotation.z = -nave.rotation.z`<br>La contro-rotazione annulla il rollio del **genitore**. Appeso alla camera il genitore non rolla, e quella riga inclinerebbe la lastra di −θ mentre l'immagine dentro si inclina di +θ: **le due si sommerebbero a zero e il finale non succederebbe** |
| 11 | `salone.gruppo.getWorldPosition(dovEilSalone)` e `salone.profondita(...)` (**:669-670**) | avvolgere: `if (!finale?.attaccato) { salone.gruppo.getWorldPosition(dovEilSalone); salone.profondita(camera.position.distanceTo(dovEilSalone)) }`<br>**Obbligatorio.** Appeso alla camera il gruppo è a 2,5 unità *di scena* ma a 0,3 dopo la scala: la distanza calcolata lì gonfierebbe il fondale marino oltre le murate. Mentre è attaccato la distanza la passa `finale.js`, già riportata alla scala |
| 12 | `get impiantoDati () { ... },` (**:749**) | aggiungere sotto, dentro `window.__nautica`:<br>`get finale () { return finale?.diagnostica ?? null },`<br>Senza questo il cancello non ha niente da leggere |
| 13 | `impostaSpaccato, impostaEmersione, impostaAvvicinamento, impostaUscita,` (**:771**) | aggiungere `impostaFinale,` in coda alla stessa riga |

Nessun'altra riga di `index.js` cambia. In particolare **non cambia niente
della camera**: né raggio, né azimut, né mira, né quota.

### 4.2 `src/regia.js`

| # | riga oggi | cosa diventa |
|---|---|---|
| 1 | `taglio: [0.64, 1.00], avvicina: [0.84, 1.00] }` (nella `S` di `LA_SCENA_E_UNA`, **:73-75**) | `taglio: [0.64, 0.84], avvicina: [0.72, 0.84], finale: [0.84, 0.92] }`<br>Il taglio finisce prima, l'avvicinamento gli sta dentro, e restano due tratti: la **rampa** del finale (0,84→0,92) e il **pianoro** (0,92→1,00), dove non cambia più niente e si sta a giocare con l'interruttore. `inizioMecc` diventa 0,74: la battuta `meccanismo` copre rampa e pianoro, quindi **`data-battuta` non cambia mai durante il finale** — nessuna regola CSS nuova, e `collaudo-manopola` continua a garantire che i comandi siano raggiungibili proprio lì |
| 2 | il ramo `?doppia=1` della stessa `S` | aggiungere `finale: [0.86, 0.94]` e stringere `taglio`/`avvicina` allo stesso modo, o lasciare il ramo com'è e accettare che con `?doppia=1` il finale non ci sia (il salone lì è in DOM: non c'è niente da appendere) |
| 3 | `scena.impostaAvvicinamento(dolce(fra(p, S.avvicina[0], S.avvicina[1])))` | aggiungere sotto:<br>`scena.impostaFinale(dolce(fra(p, S.finale[0], S.finale[1])))` |
| 4 | la battuta `meccanismo`: `titolo: 'The part you never see'` e il suo `testo` (**:117-121**) | **spostarli sulla battuta `taglio`**, che sta a distanza e non è la sala macchine. La battuta `meccanismo` resta muta come le 2-6.<br>Questo chiude `docs/14 §12.10` («nessuna conclusione narrativa dentro la sala macchine») e §11.9 («la rivelazione ritorna alle persone»): l'ultima cosa che il capitolo dice diventa l'immagine delle due persone, non una frase |

### 4.3 `src/stile.css` — una riga, e va guardata

`.atto--demo { height: 520svh }` (**:287**). Con la corsa attuale il pianoro
dura `0,08 × 420svh ≈ 34svh`, un terzo di schermo. Se è troppo poco per stare
lì a spegnere e riaccendere, `620svh` porta rampa e pianoro a ~42svh ciascuno,
allungando proporzionalmente anche il taglio. **È l'unico numero di tutto il
finale che non si può derivare: si guarda.**

---

## 5. Il cancello

`docs/13 §5` e §9 lo scrivono così:

> l'inclinazione del salone e l'angolo di rollio della corsa viva devono
> coincidere entro **0,05° su 200 fotogrammi**. Se divergono, il finale è un
> effetto e va rimosso.

### 5.1 Le tre trappole in cui morirebbe da solo

**a) Due zeri coincidono sempre.** Con la nave calma, o con la scena non
disegnata, o col salone invisibile, la differenza è zero e il cancello è verde
su un fotogramma vuoto. Serve un **testimone di vitalità dalla parte della cosa
misurata** (regola di casa, pagata due volte): fotogrammi *disegnati*, ed
escursione picco-picco del rollio sopra una soglia.

**b) Un fotogramma di sfasamento si mangia tutto il budget.** A mare 5 un
fotogramma normale muove il rollio di **0,043°** (misurato in
`collaudo-manopola`), contro una tolleranza di 0,05°. Un confronto fra una
grandezza *disegnata* e `stato.rollio` letto in un rAF diverso può essere rosso
per sfasamento e non per difetto.
**Cura:** il confronto stretto è fra **due grandezze disegnate nello stesso
fotogramma** — la rotazione della texture della stanza e `nave.rotation.z` —
fra cui nessuno sfasamento è possibile. Il legame con la corsa viva si verifica
a parte, con tolleranza dichiarata `0,05° + un fotogramma di moto`.

**c) Un modulo che attesta se stesso.** `finale.js` non tiene copie: il suo
referto **rilegge** `material.map.rotation` dal piano disegnato e
`nave.rotation.z` dal gruppo. Se domani qualcuno addolcisse l'angolo, una copia
salvata direbbe il numero di prima e il cancello resterebbe verde mentre lo
schermo mente.

### 5.2 Come si esegue

Salvare come `strumenti/collaudo-finale.mjs`, aggiungere a `package.json`:

```
"collaudo:finale": "node strumenti/collaudo-finale.mjs",
```

e in coda alla catena `"collaudo"`. Poi `npm run collaudo:finale`.

```js
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'

/**
 * IL FINALE NON E' UN EFFETTO — e questo e' l'unico modo di dimostrarlo.
 *
 * `docs/13 §5`: l'inclinazione del salone e l'angolo della corsa viva devono
 * coincidere entro 0,05 gradi su 200 fotogrammi. Se divergono, il finale va
 * rimosso: sarebbe la bugia peggiore del sito, proprio dove rivendica di non
 * mentire.
 *
 * TRE TRAPPOLE, tutte gia' pagate altrove in questo repo:
 *
 *  1. due zeri coincidono sempre. Serve un testimone di vitalita' DALLA PARTE
 *     della cosa misurata: fotogrammi disegnati, e rollio che si muove davvero;
 *  2. un fotogramma di sfasamento vale 0,043 gradi a mare 5, cioe' quasi tutta
 *     la tolleranza. Il confronto stretto e' fra due grandezze DISEGNATE nello
 *     stesso fotogramma; il legame con la corsa viva si verifica a parte, con
 *     la tolleranza allargata di un fotogramma di moto, dichiarata;
 *  3. un modulo che attesta se stesso non e' una misura. I due numeri si
 *     rileggono dagli oggetti, non da copie.
 */

const PORTA = 5180
const BASE = `http://localhost:${PORTA}/nautica/`
const FOTOGRAMMI = 200
const TOLLERANZA = 0.05          // gradi, docs/13 §5
const ROLLIO_MINIMO = 1.0        // gradi p-p: sotto, si stanno confrontando due zeri

async function serviteci () {
  try { const r = await fetch(BASE, { redirect: 'manual' }); if (r.status < 500) return null } catch {}
  const s = spawn('npm', ['run', 'preview'], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    try { await fetch(BASE, { redirect: 'manual' }); return s } catch {}
    await new Promise(r => setTimeout(r, 500))
  }
  s.kill(); console.error('il server non si e alzato'); process.exit(2)
}

const guai = []
const nota = (t) => console.log('   ' + t)

const server = await serviteci()
const browser = await apriBrowser()
const pagina = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' })
pagina.on('pageerror', e => guai.push('eccezione: ' + String(e).slice(0, 200)))
const finisci = async (c) => { await browser.close(); server?.kill(); process.exit(c) }

await pagina.goto(BASE + '?ispeziona=1', { waitUntil: 'load' })
await pagina.waitForFunction(() => window.__nautica && window.__nautica.scena, null, { timeout: 60000 })

/* --- 1 - TROVARE IL PIANORO, chiedendolo invece di dedurlo ---------------- */

const vaiA = (f) => pagina.evaluate(async (f) => {
  const h = document.documentElement.scrollHeight - window.innerHeight
  window.scrollTo(0, Math.round(h * f))
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  const palco = document.querySelector('.palco[data-battuta]')
  const b = palco.getBoundingClientRect()
  const fin = window.__nautica.finale
  return {
    battuta: palco.dataset.battuta,
    inQuadro: b.top > -1 && b.bottom > window.innerHeight - 1,
    apertura: fin ? fin.apertura : null,
    attaccato: fin ? fin.attaccato : null
  }
}, f)

const primo = await vaiA(0.5)
if (primo.apertura === null) {
  console.error('\n  IL FINALE NON E COLLEGATO. `window.__nautica.finale` non esiste:')
  console.error('  manca la riga 12 di docs/20 §4.1.\n')
  await finisci(2)
}

const dentro = []
for (let f = 0.30; f <= 0.90001; f += 0.01) {
  const r = await vaiA(f)
  if (r.inQuadro && r.attaccato && r.apertura > 0.99) dentro.push(f)
}
if (!dentro.length) {
  console.error('\n  IL FINALE NON SI APRE DA NESSUNA PARTE.')
  console.error('  Nessuna posizione di scorrimento ha insieme il palco in quadro e la')
  console.error('  lastra aperta oltre 0,99. Guarda S.finale in regia.js e impostaFinale.\n')
  await finisci(1)
}
const posto = dentro[Math.floor(dentro.length / 2)]
nota(`il finale vive fra ${(dentro[0] * 100).toFixed(0)}% e ${(dentro[dentro.length - 1] * 100).toFixed(0)}%; misuro al ${(posto * 100).toFixed(0)}%`)
await vaiA(posto)

/* --- 2 - IL SALONE DEVE ESSERCI DAVVERO ---------------------------------- */

const visto = await pagina.evaluate(() => {
  const fin = window.__nautica.finale
  const punti = [[0.5, 0.14], [0.38, 0.20], [0.62, 0.20]]
  const colpiti = punti.map(([u, v]) => (window.__nautica.chi(u, v)[0] || {}).nome || '(niente)')
  return { visibile: fin.visibile, lastra: fin.lastra, colpiti }
})
nota(`la lastra prende il ${(visto.lastra.frazioneAltezza * 100).toFixed(0)}% dell altezza` +
     `${visto.lastra.stretta ? ' (stretta per larghezza)' : ''}; il raggio trova ${visto.colpiti.join(', ')}`)
if (!visto.visibile) guai.push('il gruppo del salone non e visibile: si sta per confrontare un angolo che nessuno vede')
if (!visto.colpiti.some(n => String(n).startsWith('SALONE'))) {
  guai.push(`nella fascia alta il raggio non trova il salone (trova: ${visto.colpiti.join(', ')}). ` +
            'O la lastra non e li, o e coperta')
}

/* --- 3 - IL CANCELLO, 200 FOTOGRAMMI ------------------------------------- */

const campiona = (n) => pagina.evaluate((n) => new Promise((res) => {
  const G = 180 / Math.PI
  const primo = window.__nautica.fotogrammi
  let i = 0, scartoMax = 0, scartoCorsa = 0, rMin = Infinity, rMax = -Infinity
  let precRollio = null, passoMax = 0
  const passo = () => {
    const d = window.__nautica.finale
    const rollio = window.__nautica.stato.rollio
    if (d.inclinazioneSalone === null) { res({ rotto: 'la texture della stanza non ha una rotazione leggibile' }); return }
    const salone = d.inclinazioneSalone * G
    const scafo = d.inclinazioneScafo * G
    scartoMax = Math.max(scartoMax, Math.abs(salone - scafo))
    scartoCorsa = Math.max(scartoCorsa, Math.abs(scafo - rollio))
    if (precRollio !== null) passoMax = Math.max(passoMax, Math.abs(rollio - precRollio))
    precRollio = rollio
    rMin = Math.min(rMin, rollio); rMax = Math.max(rMax, rollio)
    if (++i < n) requestAnimationFrame(passo)
    else res({
      scartoMax, scartoCorsa, passoMax, ppRollio: rMax - rMin,
      disegnati: window.__nautica.fotogrammi - primo,
      stab: window.__nautica.stato.stab, mare: window.__nautica.stato.mare
    })
  }
  requestAnimationFrame(passo)
}), n)

// si misura col sistema SPENTO: e' li' che il rollio c'e', ed e' il finale
const metti = async (acceso) => {
  const ora = await pagina.evaluate(() => window.__nautica.stato.stab)
  if (ora !== acceso) {
    const b = await pagina.evaluate(() => {
      const el = document.querySelector('#stab'); const r = el.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    })
    await pagina.mouse.click(b.x, b.y)
  }
  return pagina.evaluate(() => window.__nautica.stato.stab)
}

if (await metti(false) !== false) guai.push('l interruttore non si spegne dal finale: il gesto non arriva')
await new Promise(r => setTimeout(r, 2500))   // il rollio deve crescere

const c = await campiona(FOTOGRAMMI)
if (c.rotto) { guai.push(c.rotto) } else {
  nota(`mare ${c.mare}, stab ${c.stab ? 'acceso' : 'spento'}, ${c.disegnati}/${FOTOGRAMMI} fotogrammi disegnati, ` +
       `rollio ${c.ppRollio.toFixed(2)} gradi p-p, un fotogramma ne muove al piu ${c.passoMax.toFixed(3)}`)
  nota(`scarto salone-scafo ${c.scartoMax.toFixed(4)} gradi | scarto scafo-corsa viva ${c.scartoCorsa.toFixed(4)} gradi`)

  if (c.disegnati < FOTOGRAMMI / 2) {
    guai.push(`la scena ha disegnato ${c.disegnati} fotogrammi su ${FOTOGRAMMI}: non si sta misurando il finale, ` +
              'si sta misurando una scena ferma')
  }
  if (c.ppRollio < ROLLIO_MINIMO) {
    guai.push(`il rollio si e mosso di ${c.ppRollio.toFixed(2)} gradi p-p in ${FOTOGRAMMI} fotogrammi. ` +
              'Sotto questa soglia il confronto e fra due zeri, e due zeri coincidono sempre')
  }
  if (c.scartoMax > TOLLERANZA) {
    guai.push(`il salone e lo scafo divergono di ${c.scartoMax.toFixed(3)} gradi (massimo ${TOLLERANZA}). ` +
              'Qualcuno addolcisce l angolo, lo scala, o lo prende da un altra sorgente')
  }
  const largo = TOLLERANZA + c.passoMax
  if (c.scartoCorsa > largo) {
    guai.push(`lo scafo e la corsa viva divergono di ${c.scartoCorsa.toFixed(3)} gradi ` +
              `(massimo ${largo.toFixed(3)} = ${TOLLERANZA} + un fotogramma di moto): ` +
              'il congelamento non e stato tolto, o il rollio disegnato non e quello simulato')
  }
}

/* --- 4 - E DEVE ESSERE COLPA DI CHI GUARDA ------------------------------- */

await metti(true)
await new Promise(r => setTimeout(r, 3500))
const calmo = await campiona(90)
nota(`riacceso: rollio ${calmo.ppRollio.toFixed(2)} gradi p-p (spento era ${c.ppRollio?.toFixed(2)})`)
if (!(c.ppRollio > calmo.ppRollio * 1.5)) {
  guai.push(`spegnere non cambia il finale: ${c.ppRollio?.toFixed(2)} gradi p-p da spento contro ` +
            `${calmo.ppRollio.toFixed(2)} da acceso. La stanza si inclina lo stesso, quindi non e una conseguenza`)
}

/* --- REFERTO ------------------------------------------------------------- */

if (guai.length) {
  console.error('\n  IL FINALE NON REGGE:\n')
  for (const g of guai) console.error('   - ' + g)
  console.error('\n  docs/13 §5: se divergono, il finale e un effetto e va rimosso.\n')
  await finisci(1)
}
console.log('\n  il salone si inclina di quanto rolla la nave, e rolla perche lo hai spento tu.\n')
await finisci(0)
```

---

## 6. Cosa è già provato, e come

`finale.js` gira in Node con oggetti `three` veri e senza WebGL — le funzioni
sono pure o toccano solo il grafo di scena. Provato:

- **a `f = 0` non succede niente**: `fattoreRollio(s, 0) === 1 - s` esatto,
  `visibilitaSalone(x, 0) === x`, nessun attacco, il gruppo resta nella tuga a
  `y = 1,453`. Il finale spento è il sito di prima, bit per bit;
- **a `f = 1`** il gruppo è figlio della camera, `rotation.z` resta a zero
  (l'inclinazione non passa di qui), scala 0,65, posizione in alto e davanti;
- **l'apertura ha la costante dichiarata**: 0,682 a 0,125 s, cioè il 63% di
  1/8 di secondo, la stessa di `salone3d.js`;
- **la fascia è il 86% del disponibile** — `tuga.alt * 0.86`, lo stesso numero,
  non uno nuovo;
- **la lastra su tre schermi**: 33% / 33% / 26% dell'altezza (§2.2);
- **`profondita()` riceve una distanza riportata alla scala**, non quella cruda;
- **il referto rilegge dagli oggetti**: scrivendo a mano
  `mappaStanza.rotation = 7,31°` e `nave.rotation.z = 7,31°`, la diagnostica li
  riporta entrambi a meno di 1e-9;
- **il ritorno a casa è esatto**: chiudendo, posizione, quaternione e scala
  tornano identici a quelli di partenza.

Non è provato — e non si può, senza collegarlo: che il disegno sia leggibile,
che la lastra non finisca sotto un pannello del DOM, che i decodificatori video
riprendano puliti dopo essere stati invisibili per un minuto (il primo
fotogramma può essere vecchio di uno).

---

## 7. Cosa NON si è potuto decidere senza vederlo

Quattro cose. Le prime due sono quelle che decidono se il finale funziona.

1. **Il meccanismo esce dal bordo basso quando lo scafo rolla di nuovo.**
   Misurato: a raggio 2,6 e azimut 0,34, con un ingombro di 0,45 unità attorno
   al pezzo, il bordo basso passa da 15,9° a **22,4°** contro un semicampo di
   17,0° quando θ raggiunge −14°. Il centro del pezzo resta dentro (da −5,9° a
   −12,7°), ma la parte bassa esce. Il picco di rollio nudo misurato è 12,4° a
   mare 5, quindi succede sul serio.
   Tre cure, e non si sceglie a tavolino: abbassare la mira del finale di ~4°,
   allargare il raggio del ~15%, oppure **inseguire il pezzo con la sola mira**
   (posizione ferma, quindi D29 intatto), che lo inchioda al centro e fa girare
   tutto il resto attorno. L'ultima è la più bella e la più a rischio di dare
   nausea. **Va guardata a mare 5 col sistema spento.**

2. **Quanto pianoro serve.** §4.3: `.atto--demo` da 520svh dà ~34svh di tratto
   in cui non cambia niente e si sta lì a spegnere e riaccendere. È l'unico
   numero del finale che non si deriva da niente. Si guarda addosso a qualcuno
   che non conosce il sito — come `docs/13 §2` chiede per l'attrito.

3. **Se la lastra ha bisogno di una cornice.** Senza, è una fotografia che
   galleggia; con, dichiara di essere un inserto ma aggiunge un elemento
   grafico a un sito che non ne ha nessuno. Il modulo non ne disegna: se serve,
   è una `PlaneGeometry` più grande dietro, e va aggiunta dopo averla vista
   mancare.

4. **Se sul telefono la lastra al 93% della larghezza legge o schiaccia.** Il
   numero è derivato e giusto; se le due persone in una striscia larga quanto
   lo schermo e alta un quarto siano ancora due persone, lo dice solo un
   telefono vero. `docs/13 §8` ne fa un cancello: *ogni cosa che si può
   scoprire da desktop si deve poter scoprire da telefono*.

---

## 8. Cosa questo non risolve

Non risolve l'atto due. `docs/13` chiede la lama come strumento, la
navigazione a due assi, tre sistemi nuovi e il telefono: questo finale è il
punto 6 di quell'ordine, costruito prima degli altri perché è l'unico che
chiude clausole già scritte in `docs/14` — e perché non ha bisogno di nessuno
di loro.

E non aggiunge un grammo di contenuto. Sposta un gruppo che esiste, toglie un
congelamento che esiste, e legge un angolo che esiste. È esattamente la
proprietà che `docs/13 §1` rivendicava per tutto l'atto due:

> **Non aggiunge contenuto. Collega quello che c'è.**
