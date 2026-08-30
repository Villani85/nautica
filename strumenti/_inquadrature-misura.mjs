/**
 * DIAGNOSI (sola lettura): quanto quadro occupa il soggetto di ogni battuta,
 * quanto di lui e' coperto, e DA CHE COSA.
 *
 * NON e' un cancello e non entra nella suite. Serve a produrre i numeri con
 * cui si scrivono le soglie di `collaudo-inquadrature`, perche' in questo repo
 * una soglia dichiarata senza misura non vale niente.
 *
 * Tre grandezze per battuta:
 *
 *   presenza   = pixel del soggetto visibili / pixel del quadro
 *   occlusione = 1 - (visibili / sagoma intera col vuoto davanti)
 *   colpevoli  = quanta di quella occlusione la mette ciascun ramo della scena
 *
 * La seconda e' la ragione per cui questo strumento esiste. Un soggetto puo'
 * occupare lo 0,6% del quadro perche' e' lontano (va bene) oppure perche' e'
 * coperto per un terzo da una paratia (non va bene), e le due cose danno lo
 * STESSO numero di presenza. Solo confrontandole si distinguono. La terza e'
 * la sola che rende la misura azionabile: «coperto al 31%» non dice cosa fare,
 * «lo copre il ramo della nave per il 30%» si'.
 */
import { apriBrowser } from './browser.mjs'
import { spawn } from 'node:child_process'
/* la misura vive in un modulo solo, condiviso col cancello: due copie della
   stessa misura divergono, e il giorno in cui divergono la diagnosi e il
   cancello raccontano due siti diversi */
import { SOGGETTI, misuraInPagina, trovaArco, vaiA as vaiAPagina } from './inquadratura-comune.mjs'

const PORTA = process.env.PORTA_COLLAUDO || 6801
const QUANTI = 5

const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
for (let i = 0; i < 60; i++) {
  try { await fetch(`http://localhost:${PORTA}/`, { redirect: 'manual' }); break } catch {}
  await new Promise(r => setTimeout(r, 500))
}

const browser = await apriBrowser({ conGpu: true })
const pg = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1&senzaFilmato=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })
await pg.waitForTimeout(2500)

const vaiA = (f) => vaiAPagina(pg, f)

console.log('\n  battuta      soggetto                        presenza   occlus.   arco')
console.log('  ' + '-'.repeat(78))

const righe = []
for (const [battuta, def] of Object.entries(SOGGETTI)) {
  /**
   * ─── SI CERCA L'INTERVALLO DELLA BATTUTA, NON UN PUNTO
   *
   * Prendere il PRIMO fotogramma in cui la battuta e' attiva sembra innocuo e
   * non lo e': la battuta del meccanismo comincia al 78% dello scorrimento, ma
   * l'avvicinamento della camera vive fra l'84% e il 93%. Misurata al primo
   * fotogramma leggeva 0,65% di quadro -- e il pezzo non e' piccolo, e' che la
   * camera non era ancora arrivata.
   *
   * La domanda giusta non e' «com'e' al primo istante» ma **«c'e' un momento,
   * dentro questa battuta, in cui il soggetto si legge?»**. Si campiona l'arco
   * e si tiene il migliore, stampando anche il peggiore: una battuta che si
   * legge per un fotogramma solo non e' una battuta che si legge.
   *
   * E la posizione si CERCA, non si indovina -- la regola che `collaudo-varco`
   * e `collaudo-manopola` hanno gia' pagato due volte: una frazione di pagina
   * smette di valere il giorno in cui il documento cambia, e il sintomo non e'
   * un rosso onesto, e' una statistica calcolata sul rumore.
   */
  const arco = await trovaArco(pg, battuta)

  if (arco === null) { console.log(`  ${battuta.padEnd(12)} POSIZIONE NON TROVATA`); continue }

  const punti = []
  for (let k = 0; k < QUANTI; k++) {
    const f = arco.da + (arco.a - arco.da) * (k / (QUANTI - 1))
    await vaiA(f)
    await pg.waitForTimeout(1200)
    const m = await pg.evaluate(misuraInPagina, { def, conColpevoli: false })
    if (!m.rotto) punti.push({ f, ...m })
  }
  if (!punti.length) { console.log(`  ${battuta.padEnd(12)} nessuna misura riuscita`); continue }

  const migliore = punti.reduce((a, b) => (b.visibili > a.visibili ? b : a))
  const peggiore = punti.reduce((a, b) => (b.visibili < a.visibili ? b : a))

  await vaiA(migliore.f)
  await pg.waitForTimeout(1200)
  const r = await pg.evaluate(misuraInPagina, { def, conColpevoli: true })

  const pc = (v) => 100 * v.visibili / v.quadro
  const oc = (v) => (v.nudi > 0 ? 100 * (1 - v.visibili / v.nudi) : null)
  const o = oc(r)
  righe.push({
    battuta, arco, quando: migliore.f,
    presenza: pc(r), occlusione: o, colpevoli: r.colpevoli,
    presenzaPeggiore: pc(peggiore), occlusionePeggiore: oc(peggiore)
  })
  console.log(`  ${battuta.padEnd(12)} ${def.cosa.padEnd(30)} ${pc(r).toFixed(2).padStart(6)}%   ` +
              `${(o === null ? '  n/d' : o.toFixed(1).padStart(5) + '%')}   ` +
              `${(arco.da * 100).toFixed(0)}-${(arco.a * 100).toFixed(0)}%, meglio al ${(migliore.f * 100).toFixed(0)}%`)
  console.log(`               peggiore nell'arco: ${pc(peggiore).toFixed(2)}% di quadro, ` +
              `occlusione ${oc(peggiore) === null ? 'n/d' : oc(peggiore).toFixed(1) + '%'}`)
  r.colpevoli.forEach(c => console.log(`               ^ lo copre  ${c.ramo}  per il ${c.quota}%  (${c.mesh} mesh)`))
}

console.log('\nJSON:' + JSON.stringify(righe.map(r => ({
  battuta: r.battuta,
  arco: [+r.arco.da.toFixed(3), +r.arco.a.toFixed(3)],
  quando: +r.quando.toFixed(3),
  presenza: +r.presenza.toFixed(3),
  occlusione: r.occlusione === null ? null : +r.occlusione.toFixed(2),
  presenzaPeggiore: +r.presenzaPeggiore.toFixed(3),
  occlusionePeggiore: r.occlusionePeggiore === null ? null : +r.occlusionePeggiore.toFixed(2),
  colpevoli: r.colpevoli
}))))

await browser.close(); preview.kill(); process.exit(0)
