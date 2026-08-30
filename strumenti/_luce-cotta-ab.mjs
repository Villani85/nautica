/**
 * QUANTO STRUTTURA AGGIUNGE LA LUCE COTTA, alle scale in cui mancava.
 *
 * Il divario col render Cycles e' misurato e scritto in `materiali.js`: sui
 * soli pixel sopra l'acqua, lo scarto tipo del sito contro quello del render
 *
 *      sfocatura     2      8     24
 *      Cycles      38,1   34,7   28,4
 *      sito        38,2   25,3   19,0
 *
 * L'alta frequenza era gia' a posto; a scala media e grande il sito era un
 * terzo piu' piatto, e la diagnosi scritta accanto era «manca la luce
 * rimbalzata». Questo strumento misura se la mappa cotta la restituisce.
 *
 * ─── SI CONFRONTA IL SITO CON SE STESSO, e la ragione conta
 *
 * Non si rifa' il confronto col render: quello richiede la cottura Cycles e la
 * stessa camera, ed e' un altro strumento. Qui si accende e si spegne SOLO la
 * lightMap, dalla stessa posa e nello stesso istante di racconto. Cosi' ogni
 * differenza e' attribuibile alla mappa e a niente altro -- che e' la domanda
 * di questo commit. I 34,7 e 28,4 del render restano il bersaglio dichiarato.
 *
 *   node strumenti/_luce-cotta-ab.mjs
 */
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'
import { mkdirSync } from 'node:fs'

const PORTA = Number(process.env.PORTA_COLLAUDO || 6564)
const FUORI = process.env.FUORI || 'uscite/luce-cotta'
const Q = Number(process.env.Q ?? 0.34)          // la nave sul mare, vista da fuori
const VALORI = (process.env.VALORI || '0,0.5,1,1.5').split(',')

mkdirSync(FUORI, { recursive: true })
await avvisaSePortaAltrui(PORTA)
const pv = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
for (let i = 0; i < 60; i++) {
  try { await fetch(`http://localhost:${PORTA}/`, { redirect: 'manual' }); break } catch {}
  await new Promise(r => setTimeout(r, 500))
}

const b = await apriBrowser({ conGpu: true })

for (const v of VALORI) {
  const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
  await pg.goto(`http://localhost:${PORTA}/?ispeziona=1&senzaFilmato=1&luceCotta=${v}`, { waitUntil: 'load' })
  await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
  await pg.waitForTimeout(2500)
  await pg.evaluate((qq) => {
    const n = window.__nautica
    window.scrollTo(0, n.cimaSezione + qq * n.corsaRacconto)
  }, Q)
  await pg.waitForTimeout(2500)
  /* il mare si muove: si ferma il tempo, o si misura la differenza fra due
     onde invece che fra due illuminazioni */
  await pg.evaluate(() => { window.__nautica.stato.mare = 0 })
  await pg.waitForTimeout(2500)
  await pg.screenshot({ path: `${FUORI}/luce-${v}.png` })
  console.log(`  reso  luceCotta=${v}`)
  await pg.close()
}

await b.close(); pv.kill()
console.log(`\n  scatti in ${FUORI}  ·  ora: python analizza\n`)
