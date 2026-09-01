/**
 * DUE SCRITTE NON SI STAMPANO UNA SULL'ALTRA.
 *
 * ─── IL DIFETTO
 *
 * Il committente ha fotografato la prima schermata: dietro "SCROLL" si
 * leggeva un'altra riga. Non era un artefatto di compressione, erano due
 * elementi sovrapposti -- misurato: a 1280x800 la nota stava a y534-552 e
 * l'invito a y509-544, dieci pixel di collisione; su telefono, y541-557 dentro
 * y539-574, cioe' completamente uno sull'altro.
 *
 * ─── PERCHE' NESSUN ALTRO CANCELLO LO PRENDEVA
 *
 * Tutti gli altri misurano la SCENA. Questo misura il LAYOUT, ed e' l'unica
 * famiglia di difetti che il repo non aveva: due elementi possono essere
 * entrambi corretti, entrambi visibili, entrambi al posto dichiarato dal
 * proprio CSS, e stare nello stesso posto. Il numero che lo dice e' la
 * sovrapposizione dei rettangoli, e non serve nient'altro.
 *
 * Si misura a piu' formati perche' la collisione e' una proprieta' del
 * formato: a 1280 era un bordo, a 390 era totale.
 */
import { apriBrowser } from './browser.mjs'
import { anteprima } from './anteprima.mjs'

const FORMATI = [[1280, 800], [1440, 900], [390, 844], [768, 1024]]
/** Gli elementi che occupano la prima schermata e non devono toccarsi. */
const PEZZI = ['#nota', '#invito-scorri', '.comandi', '.pannello--energia', '.pannello--letture', '#apri-chiusura']
/** Sotto questa opacita' un elemento non e' in campo: sovrapporsi non conta. */
const VISIBILE = 0.06
/** Dove si guarda: la battuta in cui l'invito e la nota sono entrambi accesi. */
const P = 0.10

const _ant = await anteprima()
const b = await apriBrowser({ conGpu: true })
const pg = await b.newPage()
let rossi = 0

for (const [W, H] of FORMATI) {
  await pg.setViewportSize({ width: W, height: H })
  await pg.goto(`${_ant.indirizzo}?ispeziona=1`, { waitUntil: 'load', timeout: 45000 })
  await pg.waitForFunction(() => window.__nautica?.corsaRacconto > 0, null, { timeout: 30000 })
  await pg.evaluate((p) => scrollTo(0, window.__nautica.cimaSezione + window.__nautica.corsaRacconto * p), P)
  /* non si aspetta un tempo: si aspetta che la corsa sia arrivata dove si e' chiesto */
  await pg.waitForFunction((p) => Math.abs(window.__nautica.p - p) < 0.01, P, { timeout: 10000 })
  await pg.waitForTimeout(700)

  const box = await pg.evaluate((sel) => sel.map((s) => {
    const e = document.querySelector(s)
    if (!e) return null
    const r = e.getBoundingClientRect()
    return { s, x: r.left, y: r.top, x2: r.right, y2: r.bottom, op: +getComputedStyle(e).opacity }
  }).filter(Boolean), PEZZI)

  const vivi = box.filter((e) => e.op > VISIBILE && e.x2 > e.x && e.y2 > e.y)
  console.log(`--- ${W}x${H}  (${vivi.length} elementi in campo)`)
  /* per formato, non globale: con un contatore solo l'ultimo formato pulito
     non stampava niente e sembrava non essere stato misurato */
  let quiRossi = 0
  for (let i = 0; i < vivi.length; i++) {
    for (let j = i + 1; j < vivi.length; j++) {
      const a = vivi[i], c = vivi[j]
      const dx = Math.min(a.x2, c.x2) - Math.max(a.x, c.x)
      const dy = Math.min(a.y2, c.y2) - Math.max(a.y, c.y)
      if (dx > 0 && dy > 0) {
        console.log(`  ROSSO  ${a.s} e ${c.s} si sovrappongono per ${Math.round(dx)}x${Math.round(dy)} px`)
        rossi++; quiRossi++
      }
    }
  }
  if (!quiRossi) console.log('  nessuna collisione')
}
await b.close()
_ant.ferma()

if (rossi) { console.log(`\nROSSO — ${rossi} collisioni fra elementi dell'interfaccia.`); process.exit(1) }
console.log('\nVERDE — nessun elemento dell\'interfaccia ne copre un altro.')
