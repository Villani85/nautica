/**
 * QUANTO E' LIBERA LA CURVA DENTRO GLI AMBIENTI, posa per posa.
 *
 *     node strumenti/misura-franco.mjs
 *
 * ─── PERCHE' NON BASTA IL CONTO SULL'ASSET
 *
 * Il revisore ha contato 13 pose su 96 «dentro un solido» leggendo il JSON
 * della curva e le scatole delle maglie. E' un tetto: una scatola e' piena
 * anche dove la maglia e' vuota, e il conto era fatto PRIMA di
 * `alzaSulPavimento()`, che sposta l'occhio proprio per non stare dentro i
 * gradini.
 *
 * Il sito misura la cosa vera in `mondo.js` (misuraFrancoPose): sei raggi per
 * posa contro la geometria, faccia posteriore = si e' dentro. Questo strumento
 * la legge e la stampa, e non giudica: dice quali pose e dentro cosa, con la
 * distanza. Il giudizio lo fa chi legge i nomi.
 */
import { apriBrowser } from './browser.mjs'
import { anteprima } from './anteprima.mjs'

const a = await anteprima()
const browser = await apriBrowser()
try {
  const pg = await browser.newPage()
  await pg.setViewportSize({ width: 1440, height: 900 })
  await pg.goto(a.indirizzo + '?ispeziona=1', { waitUntil: 'load' })
  await pg.waitForFunction(() => window.__nautica?.mondo()?.ancorato === true, null, { timeout: 120000 })
  const r = await pg.evaluate(() => {
    const n = window.__nautica
    return { stato: n.mondo().franco, tabella: n.francoTraversata() }
  })
  if (!r.tabella) { console.log('  la misura non c\'e: mondo senza pose'); process.exit(2) }
  const t = r.tabella
  console.log(`  pose ${t.length} · dentro un solido (escluso il guscio): ${r.stato.poseDentroSolido}`)
  console.log(`  franco minimo ${r.stato.francoMinimo?.m} m a i=${r.stato.francoMinimo?.i} (s=${r.stato.francoMinimo?.s}) verso ${r.stato.francoMinimo?.cosa}`)
  console.log('')
  console.log('  pose sospette:')
  for (const q of r.stato.quali) console.log(`    i=${String(q.i).padStart(2)} s=${q.s}  dentro: ${q.dentro.join(', ')}`)
  console.log('')
  console.log('  i sei raggi delle pose sospette (+x -x +y -y +z -z, metri di scena):')
  for (const q of r.stato.quali) {
    const f = t[q.i]
    console.log(`    i=${q.i} p=(${f.p.join(', ')})`)
    for (const [k, a] of f.assi.entries()) console.log(`       ${['+x','-x','+y','-y','+z','-z'][k]}  ${a ? a.m + ' m  ' + a.cosa + (a.dietro ? '  DA DIETRO' : '') : 'libero'}`)
  }
  console.log('')
  console.log('  franco sotto 0,30 m:')
  for (const f of t) if (f.franco !== null && f.franco < 0.30) console.log(`    i=${String(f.i).padStart(2)} s=${f.s}  ${f.franco} m  ${f.cosa}${f.dentro.length ? '  [dentro ' + f.dentro.join(',') + ']' : ''}`)
  console.log('')
  console.log('  ogni ottava posa:')
  for (const f of t) if (f.i % 8 === 0 || f.i === t.length - 1) console.log(`    i=${String(f.i).padStart(2)} s=${f.s}  franco ${f.franco} m  ${f.cosa}  ${f.dentro.length ? 'DENTRO ' + f.dentro.join(',') : ''}`)
  console.log('')
  console.log('  le ultime dodici, con la posizione (metri di scena, x y z):')
  for (const f of t.slice(-12)) console.log(`    i=${f.i} s=${f.s}  p=(${f.p.join(', ')})  franco ${f.franco} ${f.cosa}  -y: ${f.assi[3] ? f.assi[3].m + ' ' + f.assi[3].cosa : 'libero'}  +y: ${f.assi[2] ? f.assi[2].m + ' ' + f.assi[2].cosa + (f.assi[2].dietro ? ' DIETRO' : '') : 'libero'}`)
} finally {
  a.ferma()
  await browser.close()
}
