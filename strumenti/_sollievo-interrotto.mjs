/**
 * DIAGNOSI (sola lettura): che succede se si scorre via MENTRE il sollievo
 * sta consegnando alla calma?
 *
 * `collaudo-sollievo` prova la consegna standodo fermi, e passa. Nel provino
 * `filma-sollievo` ho scorso via a meta' consegna e lo stato e' rimasto a
 * `opacita 1, concluso false`. Due letture possibili, molto diverse:
 *
 *   a) il salone e' SOSPESO fuori campo (comportamento voluto, documentato) e
 *      quello che ho letto e' un sistema in pausa, non un guasto;
 *   b) la consegna si incastra e tornando indietro si trova un fermo immagine
 *      -- che e' proprio la cosa che quel cancello esiste per impedire.
 *
 * Si distingue in un modo solo: tornare indietro e guardare se riprende.
 */
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'

const PORTA = Number(process.env.PORTA_COLLAUDO || 6560)

await avvisaSePortaAltrui(PORTA)
const pv = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
for (let i = 0; i < 60; i++) {
  try { await fetch(`http://localhost:${PORTA}/`, { redirect: 'manual' }); break } catch {}
  await new Promise(r => setTimeout(r, 500))
}

const b = await apriBrowser({ conGpu: true })
const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica?.statoSollievo, null, { timeout: 60000 })
await pg.waitForTimeout(2500)

const q = (x) => pg.evaluate((qq) => {
  const n = window.__nautica
  window.scrollTo(0, n.cimaSezione + qq * n.corsaRacconto)
}, x)
const leggi = () => pg.evaluate(() => {
  const s = window.__nautica.statoSollievo()
  const v = document.querySelector('video[src*="salone-sollievo"]')
  return {
    inMoto: s.inMoto, tempo: +s.tempo.toFixed(2), opacita: +s.opacita.toFixed(2),
    concluso: s.concluso, armato: s.armato,
    vTempo: v ? +v.currentTime.toFixed(2) : null, vFermo: v ? v.paused : null
  }
})

await q(0.06)
await pg.waitForTimeout(600)
console.log('\n  1 · si arma il gesto (tensione, poi quiete) a passo dichiarato')
await pg.evaluate(() => {
  for (let i = 0; i < 120; i++) window.__nautica.provaSollievo(8, 1 / 24)
  for (let i = 0; i < 48; i++) window.__nautica.provaSollievo(0, 1 / 24)
})
for (let i = 0; i < 12; i++) {
  await pg.waitForTimeout(250)
  const s = await leggi()
  if (s.inMoto) { console.log('     parte:', JSON.stringify(s)); break }
}

console.log('  2 · si scorre VIA a meta\' del gesto')
await pg.waitForTimeout(1800)
const durante = await leggi()
console.log('     prima di andar via:', JSON.stringify(durante))
await q(0.60)
await pg.waitForTimeout(2500)
const lontano = await leggi()
console.log('     lontano (p=0,60)  :', JSON.stringify(lontano))

console.log('  3 · si TORNA indietro, ed e\' qui che si decide')
await q(0.06)
await pg.waitForTimeout(1200)
console.log('     appena tornati     :', JSON.stringify(await leggi()))
await pg.waitForTimeout(3000)
const dopo = await leggi()
console.log('     dopo 3 s           :', JSON.stringify(dopo))

console.log('')
if (dopo.opacita < 0.01 && dopo.concluso) console.log('  la consegna si COMPLETA tornando: era il salone sospeso, non un guasto')
else if (dopo.opacita > 0.5) console.log('  ATTENZIONE: resta un fermo immagine del sollievo sopra la calma')
else console.log('  stato intermedio: va guardato')
console.log('')

await b.close(); pv.kill()
