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

const atteso = readFileSync('dist/index.html', 'utf8').match(/assets\/index-[\w-]+\.js/)?.[0]
if (!atteso) { console.log('non trovo il bundle nella build locale'); process.exit(1) }
console.log('atteso:', atteso)

const api = async (v) => (await fetch(v, { headers: { 'accept': 'application/vnd.github+json' } })).json()

for (let giro = 1; giro <= 40; giro++) {
  let servito = null
  try {
    const pagina = await (await fetch('https://villani85.github.io/nautica/?x=' + Date.now())).text()
    servito = pagina.match(/assets\/index-[\w-]+\.js/)?.[0]
  } catch { /* rete: si riprova */ }

  const r = (await api('https://api.github.com/repos/Villani85/nautica/actions/runs?per_page=1'))?.workflow_runs?.[0]
  const stato = r ? `${r.run_number} ${r.head_sha.slice(0, 7)} ${r.status}/${r.conclusion}` : 'api muta'
  console.log(`  giro ${String(giro).padStart(2)}  servito ${servito || '?'}  ·  corsa ${stato}`)

  if (servito === atteso) { console.log('\nPUBBLICATO: il sito serve il commit corrente.'); process.exit(0) }
  if (r && r.status === 'completed' && r.conclusion === 'failure') {
    console.log(`\nCORSA ROSSA (${r.run_number}). Il sito resta indietro.`); process.exit(2)
  }
  await new Promise(r => setTimeout(r, 30000))
}
console.log('\nventi minuti e il sito non e cambiato.'); process.exit(3)
