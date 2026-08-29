/**
 * IL MENU SUL TELEFONO — chi c'e' e chi si vede.
 *
 * Nasce da un rilievo di una revisione: sul telefono la navigazione mostra
 * SALOON, SHIP, CUT, MECHANISM, BELOW e **non** CONTACT, mentre su desktop
 * l'ultima voce e' CONTACT e BELOW non c'e'. Se e' vero, il contatto -- l'unico
 * modo di raggiungere chi ha fatto il sito -- sparisce proprio dove sta meta'
 * del pubblico.
 *
 * Si misura invece di guardarlo: per ogni voce si chiede il rettangolo e lo
 * stile calcolato, e si stampa se **occupa spazio** e se e' **dentro la
 * finestra**. Un elemento che esiste nel DOM e cade fuori dallo schermo non e'
 * raggiungibile, e nel conteggio va con gli assenti.
 */
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'

const PORTA = process.env.PORTA_COLLAUDO || 5311
const preview = spawn('npx', ['vite', 'preview', '--port', PORTA, '--strictPort'], { shell: true, stdio: 'ignore' })
const browser = await apriBrowser({ conGpu: true })

for (const [nome, L, A] of [['desktop', 1440, 900], ['telefono', 390, 844]]) {
  const pg = await browser.newPage()
  await pg.setViewportSize({ width: L, height: A })
  await pg.goto(`http://localhost:${PORTA}/nautica/`, { waitUntil: 'load' })
  await pg.waitForTimeout(2500)
  const voci = await pg.evaluate(() => {
    const nav = document.querySelector('.testata nav')
    if (!nav) return null
    return [...nav.children].map(e => {
      const b = e.getBoundingClientRect()
      const st = getComputedStyle(e)
      return {
        testo: (e.textContent || '').trim(),
        largo: Math.round(b.width),
        alto: Math.round(b.height),
        dentro: b.right <= innerWidth + 1 && b.left >= -1 && b.bottom <= innerHeight + 1,
        visibile: st.display !== 'none' && st.visibility !== 'hidden' && st.opacity !== '0'
      }
    })
  })
  console.log(`\n  ${nome} ${L}x${A}`)
  for (const v of voci || []) {
    const ok = v.visibile && v.largo > 2 && v.dentro
    console.log(`    ${ok ? 'si ' : 'NO '} ${v.testo.padEnd(12)} ${String(v.largo).padStart(4)}x${v.alto}` +
                `${v.visibile ? '' : '  (display/visibility spenti)'}${v.dentro ? '' : '  (fuori dalla finestra)'}`)
  }
  await pg.close()
}

await browser.close()
preview.kill()
