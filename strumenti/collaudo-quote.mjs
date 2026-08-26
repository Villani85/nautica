import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * COLLAUDO DELLE QUOTE CONDIVISE — il modello Blender contro la scena del sito.
 *
 *     node strumenti/collaudo-quote.mjs
 *
 * ─── COSA PROTEGGE DAVVERO, e la prima stesura lo diceva sbagliato
 *
 * Avevo scritto che queste quote «governano la fisica» e che cambiarle
 * significherebbe che «la riduzione dichiarata non si riferisce piu' a cio' che
 * si mostra». **Falso, e verificato**: `RL`, `RC`, `LB`, `CY`, `CZ` non
 * compaiono in `src/scena/simulazione.js`. Il rollio e' governato da `W`,
 * `ZETA`, `K`, `C0`, `A_STALLO`, `A_MAX` e `RESIDUO`, tutte indipendenti dal
 * leveraggio. Si puo' riscalare il quadrilatero senza cambiare di un millimetro
 * la simulazione.
 *
 * L'ha trovato una revisione esterna, ed e' esattamente l'errore che questo
 * progetto esiste per non fare: **presentare come vincolato dalla fisica
 * qualcosa che e' solo coerente visivamente.** E' la stessa specie dei cinque
 * metri gia' rotti — una cosa che sembra fondata e non lo e'.
 *
 * ─── ALLORA PERCHE' IL CANCELLO RESTA
 *
 * Perche' la stessa macchina e' descritta in DUE posti — la scena in tempo reale
 * e il modello Blender — e se divergono il sito mostra **due macchine diverse**:
 * una nel taglio, una nel render. Il visitatore non lo saprebbe dire, ma
 * vedrebbe che qualcosa non torna, e un tecnico se ne accorgerebbe subito.
 *
 * Non e' un vincolo fisico: e' un vincolo di **coerenza fra rappresentazioni**.
 * Vale comunque la pena difenderlo, e nessun altro collaudo lo guarda —
 * `collaudo-rollio` verifica la simulazione, `collaudo-scafo` la carena,
 * `collaudo-normali` le facce.
 *
 * ─── E IL VINCOLO CHE INVECE E' REALE
 *
 * Il quadrilatero si blocca se la distanza fra centro manovella e perno esce
 * dall'intervallo `|RC-LB| .. RC+LB`. Quello si', e' un vincolo vero — ma e'
 * **geometrico**, non fisico, e lo verifica gia' `collaudo-rollio`.
 *
 * *Un cancello che protegge la cosa giusta con la motivazione sbagliata insegna
 * a chi legge una falsita': va corretto anche se il numero che stampa e' esatto.*
 */

const RADICE = fileURLToPath(new URL('..', import.meta.url))
const leggi = (p) => readFileSync(RADICE + p, 'utf-8')

/**
 * Le quote che compaiono in ENTRAMBE le descrizioni. Il nome a sinistra e' come
 * si chiama in `nave.js`, a destra come si chiama nei file Blender.
 *
 * Non si chiamano piu' «vincolate dalla fisica», perche' non lo sono: sono
 * condivise fra due rappresentazioni della stessa macchina.
 */
const CONDIVISE = [
  { nome: 'RL', descr: 'braccio della leva', sito: /const RL\s*=\s*([\d.]+)/, blender: /^RL\s*=\s*([\d.]+)/m },
  { nome: 'R_ALBERO', descr: 'raggio dell\'albero', sito: /CylinderGeometry\(([\d.]+),\s*\1,\s*0\.62/, blender: /^R_ALBERO\s*=\s*([\d.]+)/m },
  { nome: 'X_FLANGIA', descr: 'attraversamento carena', sito: /flangia\.position\.set\(X\(([\d.]+)\)/, blender: /^X_FLANGIA\s*=\s*([\d.]+)/m },
  { nome: 'X_PREMI', descr: 'premistoppa', sito: /premistoppa\.position\.set\(X\(([\d.]+)\)/, blender: /^X_PREMI\s*=\s*([\d.]+)/m },
  { nome: 'X_RADICE', descr: 'radice della pinna', sito: /radice\.position\.x = X\(([\d.]+)\)/, blender: /^X_RADICE\s*=\s*([\d.]+)/m },
  { nome: 'X_PINNA', descr: 'attacco della pinna', sito: /pinna\.position\.x = X\(([\d.]+)\)/, blender: /^X_PINNA\s*=\s*([\d.]+)/m }
]

const FILE_BLENDER = ['riferimenti/blender/impianto.py', 'riferimenti/blender/sistema.py']

const sito = leggi('src/scena/nave.js')
let rotto = false

console.log('')
console.log('LE DUE DESCRIZIONI DELLA STESSA MACCHINA DEVONO COINCIDERE')

for (const f of FILE_BLENDER) {
  let testo
  try { testo = leggi(f) } catch { console.log(`  (${f} non c'e', saltato)`); continue }
  console.log(`\n  ── ${f}`)
  for (const q of CONDIVISE) {
    const a = sito.match(q.sito)
    const b = testo.match(q.blender)
    if (!b) continue                      // quel file non usa questa quota
    if (!a) {
      console.error(`  ROTTO  ${q.nome}: non trovo la quota in src/scena/nave.js.
         O e' cambiato il codice del sito, o questo cancello cerca la cosa
         sbagliata. In entrambi i casi non sta piu' proteggendo niente.`)
      rotto = true
      continue
    }
    const vs = Number(a[1]), vb = Number(b[1])
    const uguale = Math.abs(vs - vb) < 1e-9
    console.log(`  ${uguale ? 'OK    ' : 'ROTTO '} ${q.nome.padEnd(10)} ${q.descr.padEnd(26)} sito ${vs}  ·  modello ${vb}`)
    if (!uguale) {
      console.error(`         Il sito disegna una macchina con ${vs}, il modello ne mostra una con ${vb}.
         Sono due macchine diverse: una nel taglio, una nel render.`)
      rotto = true
    }
  }
}

console.log()
if (rotto) {
  console.error(`  LE DUE DESCRIZIONI DIVERGONO.

  Si decide QUALE COMANDA e si allinea l'altra. Non si allinea il cancello ai
  numeri: si allineano i numeri fra loro.

  E una nota, perche' la prima stesura di questo cancello diceva il falso:
  queste quote NON entrano nella simulazione. Il rollio dipende da W, ZETA, K,
  C0, A_STALLO, A_MAX, RESIDUO. Cambiarle non falsa nessun numero dichiarato: fa
  vedere due macchine diverse, che e' un difetto piu' piccolo ma pur sempre un
  difetto.\n`)
  process.exit(1)
}
console.log('  TUTTO A POSTO\n')
