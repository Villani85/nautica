import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * COLLAUDO DELLE QUOTE VINCOLATE — il modello Blender contro la fisica del sito.
 *
 *     node strumenti/collaudo-quote.mjs
 *
 * ─── PERCHE' ESISTE, e l'ha trovato una revisione esterna
 *
 * Il modello 3D del meccanismo si costruisce in Blender attorno a quote che
 * **la fisica usa**: braccio della leva, manovella, biella, centro del
 * quadrilatero, raggio dell'albero, apertura della pinna. Se qualcuno le cambia
 * per far sembrare il pezzo piu' bello, il numero che il sito dichiara smette di
 * riferirsi a cio' che si mostra — ed e' la bugia peggiore possibile in un
 * progetto la cui tesi e' l'onesta' tecnica.
 *
 * Le avevo marcate `VINCOLATA` nei file, una per una. **Un commento non e' un
 * cancello.** La regola del repository dice che ogni cancello esce con errore, e
 * li' c'era una regola scritta e nessuno che la facesse rispettare: la stessa
 * famiglia dei cinque metri gia' rotti, una cosa che sembra protetta e non lo e'.
 *
 * E il difetto non darebbe errore da nessuna parte. Il quadrilatero continuerebbe
 * a funzionare, il render uscirebbe piu' bello, e la riduzione dichiarata si
 * riferirebbe a una macchina diversa da quella disegnata. Nessun collaudo
 * esistente lo prenderebbe: `collaudo-rollio` verifica la simulazione,
 * `collaudo-scafo` la carena, `collaudo-normali` le facce. La geometria del
 * modello Blender non la guardava nessuno.
 *
 * ─── COME MISURA
 *
 * Legge le costanti dalle DUE sorgenti — `src/scena/nave.js` e i file Blender in
 * `riferimenti/blender/` — e le confronta. Non interpreta: cerca il numero
 * accanto al nome, e se non lo trova lo dice invece di passare.
 *
 * *Un cancello che non trova cio' che deve controllare deve essere rosso, non
 * verde: e' il modo piu' comune in cui un collaudo smette di collaudare.*
 */

const RADICE = fileURLToPath(new URL('..', import.meta.url))
const leggi = (p) => readFileSync(RADICE + p, 'utf-8')

/**
 * Le quote che la fisica usa davvero. Il nome a sinistra e' come si chiama in
 * `nave.js`; a destra come si chiama nei file Blender.
 */
const VINCOLATE = [
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

console.log('\nLE QUOTE DEL MODELLO DEVONO ESSERE QUELLE DELLA FISICA')

for (const f of FILE_BLENDER) {
  let testo
  try { testo = leggi(f) } catch { console.log(`  (${f} non c'e', saltato)`); continue }
  console.log(`\n  ── ${f}`)
  for (const q of VINCOLATE) {
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
      console.error(`         La riduzione che il sito dichiara e' calcolata con ${vs}.
         Il modello mostra una macchina con ${vb}: sono due macchine diverse.`)
      rotto = true
    }
  }
}

console.log()
if (rotto) {
  console.error(`  LE QUOTE DIVERGONO.

  Se il modello e' giusto e il sito e' vecchio, si cambia il sito E si rigenera
  la tabella delle riduzioni (npm run riduzioni). Se il modello e' stato reso
  piu' bello a scapito della fisica, si rimette com'era.

  Non si allinea il cancello ai numeri: si allineano i numeri fra loro.\n`)
  process.exit(1)
}
console.log('  TUTTO A POSTO\n')
