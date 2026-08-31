/**
 * I DOCUMENTI NON DICHIARANO MANCANZE CHE IL REPO SMENTISCE.
 *
 * ─── LA CLASSE DI DIFETTO, PRESA TRE VOLTE IN UN GIORNO
 *
 * 1. D7 «il sito e' muto, zero occorrenze audio in src/». Falso:
 *    `src/ui/suono.js:121` costruisce un `AudioContext`, `:143-150` cinque
 *    sorgenti. Il grep cercava estensioni di file, e la sintesi non ha file.
 * 2. «`WORLDSPACE-CONTRATTO.md` non e' nel repo». Falso da `708e0bf`, che ce
 *    l'ha messo. Scritto in DUE posti del piano, e nessuno dei due ritirato.
 * 3. Il registro delle ondate fermo su «aperta 15:05 · chiusa —» mentre sopra
 *    undici attivita' risultavano chiuse.
 *
 * Tre volte la stessa forma: **una domanda che si e' risposta da sola e che
 * nessuno ha ritirato**. Non e' distrazione, e' struttura: chi lavora aggiunge
 * righe alle domande aperte e non le rilegge mai. Un revisore che legge quel
 * file conclude che manchi qualcosa che c'e', e spende il proprio giro a
 * ridirmelo -- e' successo tre volte in sei ore.
 *
 * ─── IL METRO
 *
 * Si cercano, nei documenti, le righe che NEGANO l'esistenza di qualcosa e che
 * nominano un percorso fra backtick. Se quel percorso esiste sul disco, la riga
 * e' falsa. Non serve capire la frase: basta che chi la scrive nomini il file
 * di cui parla, che e' comunque una buona abitudine.
 *
 * NON pretende di trovare tutte le affermazioni false -- solo questa forma, che
 * e' quella che e' costata tre giri di revisione. Un cancello che dichiarasse
 * di piu' sarebbe la quarta occorrenza dello stesso difetto.
 *
 * ─── COSA NON PRENDE, e va detto qui e non scoperto fra un mese
 *
 * Delle tre recidive di oggi, questo strumento ne avrebbe presa **una**: la
 * riga su `WORLDSPACE-CONTRATTO.md`, perche' nomina il file.
 *
 * NON avrebbe preso D7 («zero occorrenze audio in `src/`»): nomina una
 * CARTELLA, non un file, e la cartella esiste in entrambi i casi. Verificare
 * quella frase vorrebbe dire rieseguire il grep da cui e' nata -- e quel grep
 * era sbagliato in partenza, perche' cercava estensioni di file mentre il
 * suono e' sintetizzato. Un cancello che ripete un grep sbagliato conferma
 * l'errore invece di trovarlo.
 *
 * NON prende il registro delle ondate fermo su «chiusa —»: quella non e' una
 * negazione, e' un campo vuoto, e non c'e' niente sul disco che dica quando
 * un'ondata e' finita.
 *
 * Provato rosso il 31 agosto con una riga falsa in `feedback/`, e verde subito
 * dopo averla tolta.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * ─── SOLO I DOCUMENTI VIVI, E LA DISTINZIONE E' IL CUORE DELLO STRUMENTO
 *
 * `docs/` e `riferimenti/prove/` sono ARCHIVI: il registro delle decisioni e i
 * referti degli agenti, datati. Una riga che dice «X non esiste» dentro un
 * verbale del 28 agosto e' **vera come storia** anche se oggi X esiste, e
 * riscriverla sarebbe falsificare il registro -- il difetto opposto e peggiore.
 *
 * Un PIANO invece dichiara il presente. Se dice «X non e' nel repo» e X c'e',
 * chi legge spende il proprio giro a ridirmelo. E' successo tre volte in sei
 * ore, sempre allo stesso revisore.
 *
 * Il primo giro di questo strumento guardava anche `docs/` e sputava sei rossi,
 * tutti su verbali del 28 agosto. Un cancello che chiede di riscrivere la
 * storia e' un cancello che si impara a ignorare.
 */
const CARTELLE = ['riferimenti', 'feedback']
const ESCLUSE = ['riferimenti/prove', 'riferimenti\prove']
/** Le forme con cui, in questo repo, si nega che una cosa esista. */
const NEGAZIONI = [
  /non\s+(?:è|e')\s+nel\s+repo/i,
  /non\s+esiste/i,
  /zero\s+occorrenze/i,
  /non\s+(?:è|e')\s+versionat/i,
  /manca(?:no)?\s+(?:il|la|lo|i|le)\b/i
]
/** Una riga gia' ritirata non si conta: il barrato e' la ritrattazione. */
const RITIRATA = /~~|RITIRAT|SMENTIT|RISOLTO|era vero|non e' piu'/i

function md (dir, out = []) {
  if (!existsSync(dir)) return out
  for (const n of readdirSync(dir)) {
    const v = join(dir, n)
    if (ESCLUSE.some((e) => v.startsWith(e))) continue
    if (statSync(v).isDirectory()) md(v, out)
    else if (n.endsWith('.md')) out.push(v)
  }
  return out
}

let rossi = 0
let righe = 0
for (const via of CARTELLE.flatMap((c) => md(c))) {
  const testo = readFileSync(via, 'utf8').split(/\r?\n/)
  for (let i = 0; i < testo.length; i++) {
    const r = testo[i]
    if (!NEGAZIONI.some((n) => n.test(r))) continue
    if (RITIRATA.test(r)) continue
    righe++
    for (const [, percorso] of r.matchAll(/`([\w./-]+\.(?:mjs|js|py|md|glb|mp4|json|css|html|yml))`/g)) {
      /* il nome nudo si cerca anche in giro: i documenti lo scrivono spesso
         senza cartella, ed e' comunque lo stesso file */
      const trovato = existsSync(percorso) ||
        ['riferimenti', 'strumenti', 'src', 'public', 'consegne', 'riferimenti/blender']
          .some((c) => existsSync(join(c, percorso)))
      if (trovato) {
        console.log(`  ROSSO  ${via}:${i + 1}`)
        console.log(`         dichiara che «${percorso}» non c'e', e invece c'e'.`)
        console.log(`         > ${r.trim().slice(0, 110)}`)
        rossi++
      }
    }
  }
}

console.log(`\n  ${righe} righe di negazione esaminate, ${rossi} smentite dal disco`)
if (rossi) {
  console.log('\nROSSO — un documento afferma una mancanza che il repo smentisce.')
  console.log('        Ritira la riga (barrala e scrivi perche\'), non cancellarla:')
  console.log('        una domanda che si e\' risposta da sola e\' informazione, se si vede.')
  process.exit(1)
}
console.log('\nVERDE — nessun documento dichiara mancante qualcosa che esiste.')
