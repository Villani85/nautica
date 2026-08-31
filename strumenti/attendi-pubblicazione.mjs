/**
 * ASPETTA CHE IL SITO SERVA DAVVERO L'ULTIMO COMMIT.
 *
 * Non aspetta un tempo e non aspetta la CI: aspetta il FATTO, cioe' che
 * l'hash del bundle servito da GitHub Pages coincida con quello che la build
 * locale produce. E' l'unica prova che il lavoro e' arrivato a un visitatore.
 *
 * Nato oggi da un difetto che e' costato l'intera giornata: ho lavorato per
 * otto ore su un sito che serviva ancora la build delle 12:23, perche' la CI
 * era rossa da due corse e nessuno guardava.
 */
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

/**
 * ─── SI GUARDA SOLO LA CORSA DI QUESTO COMMIT
 *
 * DIFETTO DELLO STRUMENTO, non del sito. La prima versione leggeva l'ULTIMA
 * corsa qualunque essa fosse, e appena spinto la corsa nuova non e' ancora
 * comparsa: leggeva quella PRECEDENTE, la trovava rossa, e annunciava «corsa
 * rossa, il sito resta indietro» su un esito gia' superato. Ha chiuso un
 * guardiano al primo giro dando un verdetto su un commit che non era piu' il
 * mio.
 */
const TESTA = execSync('git rev-parse HEAD').toString().trim()

const atteso = readFileSync('dist/index.html', 'utf8').match(/assets\/index-[\w-]+\.js/)?.[0]
if (!atteso) { console.log('non trovo il bundle nella build locale'); process.exit(1) }
console.log('atteso:', atteso)
/* si dichiara COSA sta cercando: senza, quando non trova la corsa non si
   distingue «non e' ancora partita» da «sto cercando l'hash sbagliato» */
console.log('commit: ', TESTA.slice(0, 7), '· ramo', (() => {
  try { return execSync('git rev-parse --abbrev-ref HEAD').toString().trim() } catch { return '?' }
})())

const api = async (v) => (await fetch(v, { headers: { 'accept': 'application/vnd.github+json' } })).json()

/**
 * Ottanta giri da mezzo minuto: quaranta minuti. Con venti la sentinella usciva
 * per scadenza su una corsa ancora viva e non distingueva «rotta» da «lenta» --
 * due difetti diversi con due rimedi diversi. La catena ha 38 passi da quando
 * le due liste sono state riallineate, e non ne facevano piu' venti.
 */
for (let giro = 1; giro <= 200; giro++) {
  let servito = null
  try {
    const pagina = await (await fetch('https://villani85.github.io/nautica/?x=' + Date.now())).text()
    servito = pagina.match(/assets\/index-[\w-]+\.js/)?.[0]
  } catch { /* rete: si riprova */ }

  const corse = (await api('https://api.github.com/repos/Villani85/nautica/actions/runs?per_page=8'))?.workflow_runs || []
  const r = corse.find((c) => c.head_sha === TESTA) || null
  const stato = r ? `${r.run_number} ${r.head_sha.slice(0, 7)} ${r.status}/${r.conclusion}`
    : (corse.length ? 'la corsa di questo commit non e ancora comparsa' : 'api muta')
  console.log(`  giro ${String(giro).padStart(2)}  servito ${servito || '?'}  ·  corsa ${stato}`)

  if (servito === atteso) { console.log('\nPUBBLICATO: il sito serve il commit corrente.'); process.exit(0) }
  if (r && r.status === 'completed' && r.conclusion === 'failure') {
    console.log(`\nCORSA ROSSA (${r.run_number}). Il sito resta indietro.`); process.exit(2)
  }
  await new Promise(r => setTimeout(r, 30000))
}
console.log('\nventi minuti e il sito non e cambiato.'); process.exit(3)
