/**
 * LE DUE LISTE DEI CANCELLI DEVONO COMBACIARE, O DIRE PERCHE' NO.
 *
 * ─── IL DIFETTO CHE QUESTO CANCELLO GUARDA
 *
 * `npm run collaudo` (package.json) e `.github/workflows/pubblica.yml` sono
 * due elenchi scritti a mano dello stesso insieme di cancelli. Sono
 * divergenti in ENTRAMBI i versi almeno tre volte: cancelli nati in un file e
 * mai portati nell'altro, o portati e poi persi in un refactor. Il commento a
 * `pubblica.yml` riga ~74 lo racconta in prima persona: "sei su diciotto" era
 * gia' successo una volta prima di oggi.
 *
 * "La suite locale e' verde" non ha mai voluto dire "pubblicabile", perche' i
 * due elenchi non erano lo stesso elenco. Questo cancello confronta i NOMI, non
 * l'esito: fallisce se un cancello compare da una parte sola, a meno che
 * l'assenza sia DICHIARATA qui sotto con una ragione scritta.
 *
 * ─── COSA LEGGE
 *
 * 1. La catena `collaudo` in `package.json`: ogni `strumenti/collaudo-X.mjs`
 *    incatenato con `&&` e' un cancello locale.
 * 2. Gli step di `pubblica.yml`: ogni `run: node strumenti/collaudo-X.mjs`
 *    diretto, PIU' ogni `npm run collaudo:X` risolto attraverso gli script di
 *    `package.json` fino al file `collaudo-X.mjs` che invoca — perche' il
 *    passo "Collaudo dell'impaginato" ci arriva cosi', per poter catturare
 *    l'output riga per riga invece di lasciare che `&&` lo inghiotta.
 *
 * Le righe di commento (che iniziano con `#`, anche indentate) si scartano
 * PRIMA di cercare i nomi: altrimenti un cancello solo NOMINATO in una nota —
 * come qui sopra, o come i cancelli discussi ma non lanciati — sembrerebbe
 * presente quando non lo e'.
 *
 * ─── LE ECCEZIONI DICHIARATE, e perche' ciascuna
 *
 * Un cancello nella catena locale che NON compare nel workflow (o viceversa)
 * e' rosso, TRANNE se e' qui sotto con una ragione. Un'esclusione senza
 * ragione scritta e' essa stessa un rosso: un array di soli nomi si potrebbe
 * riempire senza pensarci, un oggetto che pretende una frase no.
 */

/** @type {Record<string, string>} nome del cancello (senza `collaudo-` e senza `.mjs`) -> perche' resta fuori da una delle due liste */
const ECCEZIONI = {
  // ── SOLO IN `npm run collaudo`, MAI IN CI ──────────────────────────────
  workflow: 'legge .github/workflows/*.yml e cerca chiavi ripetute che fanno ' +
    'rifiutare il file intero a GitHub Actions (zero job, corsa rossa senza ' +
    "un errore che lo dica). Se il workflow e' invalido la CI non PARTE: un " +
    "cancello dentro la CI non potrebbe mai vederlo. Deve fallire sulla " +
    "macchina di chi scrive, prima della spinta -- e' scritto anche nella " +
    'testata di collaudo-workflow.mjs.',

  passi: "stessa ragione di `workflow`, ed e' la stessa impossibilita': " +
    "verifica che ogni passo abbia un `run` o un `uses`. Un passo senza " +
    "comando GitHub lo RIFIUTA, quindi la corsa non parte affatto e non c'e' " +
    "nessuna corsa che possa segnalarlo. Deve fallire sulla macchina di chi " +
    "scrive, prima della spinta. Nato il 31 agosto perche' togliendo un " +
    "cancello dal workflow ho cancellato la sua sola riga `run:` e lasciato " +
    "in piedi nome, tetto ed env -- e collaudo-workflow ha risposto " +
    "«leggibili da Actions», perche' guarda le chiavi duplicate, che e' " +
    "un'altra domanda.",

  orizzonte: "misura la STRUTTURA TONALE di cio' che il motore disegna. Il " +
    'runner CI non ha GPU: Chromium vi gira su un rasterizzatore software ' +
    '(SwiftShader), che produce una tonalita\' diversa da quella che riceve ' +
    "un visitatore vero. Aggiunto per prova a questo runner, e' uscito rosso " +
    "mentre in locale (con GPU vera) passa -- non e' un difetto del sito, e' " +
    "il metro che misura la macchina invece del disegno. Documentato in " +
    "pubblica.yml riga ~95. Rientra il giorno in cui il runner ha una GPU.",

  inquadrature: "misura la COPERTURA IN PIXEL del soggetto di ogni battuta: " +
    "rende la scena, legge la tela, e conta i pixel che cambiano togliendo il " +
    "soggetto. E' la stessa famiglia di orizzonte e cielo -- un giudizio sui " +
    "pixel disegnati, su un rasterizzatore che non e' quello di un visitatore " +
    "vero. La corsa 280 del 31 agosto e' uscita rossa qui mentre in locale il " +
    "cancello passa, sia con GPU sia con SwiftShader, e con la simulazione " +
    "inchiodata da ?fermo i due ambienti locali danno 16,8% e 16,9% contro un " +
    "tetto del 22%: cinque punti di margine. COSA NON SO, e va detto: senza " +
    "poter leggere il log della CI non so se il rosso sia la copertura o " +
    "l'attesa `attendiCameraFerma`, che si arrende dopo 40 giri e su una " +
    "macchina lenta puo' misurare con la camera ancora in moto. Il giorno in " +
    "cui il log e' leggibile, la prima cosa da guardare e' quale delle due. " +
    "Resta in `npm run collaudo`, che gira su hardware vero: e' li' che quel " +
    "numero significa qualcosa.",

  cielo: "stessa famiglia di orizzonte, stessa causa: struttura tonale " +
    "giudicata su un rasterizzatore software che non e' quello di un " +
    'visitatore vero. Documentato in pubblica.yml riga ~95.',

  cinematica: "aspetta che un ingresso compia un giro intero entro un tetto " +
    "di orologio reale (45 s). Sul rasterizzatore software del runner il " +
    "motore gira a circa un fotogramma al secondo: `index.js` blocca il " +
    "passo simulato a un massimo per fotogramma (giusto per la stabilita'), " +
    "quindi in 45 s di orologio il meccanismo vive circa due secondi SIMULATI " +
    "e nessun punto chiude il giro -- 35-38 campioni su tre punti, mai un " +
    "giro. In locale, con una macchina piu' veloce, almeno un punto lo chiude " +
    "(77 campioni). E' di nuovo un cancello che misurerebbe la velocita' " +
    'della macchina, non il sito. Documentato in pubblica.yml riga ~110.',

  // ── FUORI DA ENTRAMBE LE LISTE, PER SCELTA, E QUESTO E' UNA GUARDIA ────
  'traversata-world': "non entra ne' nella catena locale ne' in CI: e' rosso " +
    'per costruzione (il GLB world-space che collauda non esiste ancora), e ' +
    'un cancello permanentemente rosso dentro una catena con `&&` insegna a ' +
    "ignorare la catena intera. Vive da solo come `npm run onda2`, ed e' la " +
    "CONDIZIONE DI USCITA dell'ondata 2: quando diventa verde, entra qui. " +
    "(Nota per questo cancello: se `traversata-world` comparisse in una delle " +
    'due liste, sarebbe un errore da vedere, non un\'eccezione da concedere -- ' +
    'per questo e\' controllato a parte piu\' sotto, non solo elencato qui.)'
}

// ─────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs'

const PACKAGE = 'package.json'
const WORKFLOW = '.github/workflows/pubblica.yml'

const nomeCancello = (percorso) => {
  const m = percorso.match(/collaudo-([a-z0-9-]+)\.mjs$/)
  return m ? m[1] : null
}

/** righe di commento fuori, PRIMA di cercare qualunque nome: una nota che
 *  cita un cancello non lo mette in nessuna lista */
const senzaCommenti = (testo) => testo.split('\n')
  .filter((r) => !r.trim().startsWith('#'))
  .join('\n')

// ─── 1. LA CATENA LOCALE, da package.json ─────────────────────────────────

const pkg = JSON.parse(readFileSync(PACKAGE, 'utf8'))
const catenaGrezza = pkg.scripts && pkg.scripts.collaudo
if (!catenaGrezza) {
  console.log(`\nROSSO -- ${PACKAGE} non ha uno script "collaudo".\n`)
  process.exit(1)
}
const inCatena = new Set()
for (const passo of catenaGrezza.split('&&')) {
  const m = passo.trim().match(/^node\s+(\S+)/)
  if (!m) continue
  const nome = nomeCancello(m[1])
  /* "cancelli" e' questo stesso script: confronta le due liste, non e' un
     cancello iscritto in nessuna delle due -- iscriverlo vorrebbe dire
     controllare se questo file compare in un elenco che parla di lui */
  if (nome && nome !== 'cancelli') inCatena.add(nome)
}

// ─── 2. IL WORKFLOW, da pubblica.yml ──────────────────────────────────────

const ymlGrezzo = readFileSync(WORKFLOW, 'utf8')
const ymlSenzaCommenti = senzaCommenti(ymlGrezzo)

const inWorkflow = new Set()

// step diretti: `run: node strumenti/collaudo-X.mjs` (anche dentro `{ ... }`)
for (const m of ymlSenzaCommenti.matchAll(/\bnode\s+(\S*collaudo-[a-z0-9-]+\.mjs)/g)) {
  const nome = nomeCancello(m[1])
  if (nome) inWorkflow.add(nome)
}

// step indiretti: `npm run collaudo:X`, risolti negli script di package.json
// fino al file `collaudo-X.mjs` che invocano davvero
for (const m of ymlSenzaCommenti.matchAll(/npm run (collaudo:[a-z0-9-]+)/g)) {
  const scriptName = m[1]
  const target = pkg.scripts && pkg.scripts[scriptName]
  if (!target) {
    console.log(`\nROSSO -- pubblica.yml invoca "npm run ${scriptName}", ma package.json non ha quello script.\n`)
    process.exit(1)
  }
  const mm = target.match(/collaudo-([a-z0-9-]+)\.mjs/)
  if (mm) inWorkflow.add(mm[1])
}

// ─── 3. LE ECCEZIONI DEVONO AVERE UNA RAGIONE SCRITTA ─────────────────────

let rosso = false
for (const [nome, ragione] of Object.entries(ECCEZIONI)) {
  if (typeof ragione !== 'string' || ragione.trim().length < 20) {
    console.log(`ROSSO -- l'eccezione "${nome}" non ha una ragione scritta (o e' troppo corta per essere una ragione vera).`)
    rosso = true
  }
}

// ─── 4. LE DUE LISTE, CONFRONTATE ─────────────────────────────────────────

const eccezioniNomi = new Set(Object.keys(ECCEZIONI))

const soloLocale = [...inCatena].filter((n) => !inWorkflow.has(n) && !eccezioniNomi.has(n)).sort()
const soloWorkflow = [...inWorkflow].filter((n) => !inCatena.has(n) && !eccezioniNomi.has(n)).sort()

if (soloLocale.length) {
  rosso = true
  console.log(`\nROSSO -- ${soloLocale.length} cancelli girano in "npm run collaudo" e non in pubblica.yml, senza eccezione dichiarata:`)
  for (const n of soloLocale) console.log(`    collaudo-${n}.mjs`)
  console.log('    Aggiungili al workflow, o dichiara qui sopra perche\' restano fuori.')
}
if (soloWorkflow.length) {
  rosso = true
  console.log(`\nROSSO -- ${soloWorkflow.length} cancelli girano in pubblica.yml e non in "npm run collaudo", senza eccezione dichiarata:`)
  for (const n of soloWorkflow) console.log(`    collaudo-${n}.mjs`)
  console.log('    Aggiungili alla catena locale, o dichiara qui sopra perche\' restano solo in CI.')
}

// ─── 5. LA GUARDIA SU collaudo-traversata-world ───────────────────────────
//
// Non deve MAI comparire ne' nella catena locale ne' nel workflow: e' rosso
// per costruzione (D4 di questo incarico) e vive solo come `npm run onda2`.
// Se ricompare in una delle due liste, e' un guasto da vedere subito, non
// un'eccezione silenziosa -- per questo e' un controllo a parte e non solo
// una voce di ECCEZIONI.

if (inCatena.has('traversata-world')) {
  rosso = true
  console.log('\nROSSO -- collaudo-traversata-world e\' entrato nella catena locale "npm run collaudo".')
  console.log('    E\' rosso per costruzione: deve restare fuori, come npm run onda2.')
}
if (inWorkflow.has('traversata-world')) {
  rosso = true
  console.log('\nROSSO -- collaudo-traversata-world e\' entrato in pubblica.yml.')
  console.log('    E\' rosso per costruzione: deve restare fuori, come npm run onda2.')
}

// ─── ESITO ─────────────────────────────────────────────────────────────

console.log(`\n  catena locale:  ${inCatena.size} cancelli`)
console.log(`  workflow CI:    ${inWorkflow.size} cancelli`)
console.log(`  eccezioni dichiarate: ${eccezioniNomi.size} (${[...eccezioniNomi].join(', ')})`)

if (rosso) {
  console.log('\nROSSO -- le due liste divergono senza che la divergenza sia tutta dichiarata.\n')
  process.exit(1)
}
console.log('\nVERDE -- ogni cancello sta in entrambe le liste, o la sua assenza e\' dichiarata con una ragione.\n')
