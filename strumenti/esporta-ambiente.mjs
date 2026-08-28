/**
 * L'AMBIENTE DEL SITO, SU FILE, PERCHE' BLENDER GUARDI LO STESSO CIELO.
 *
 *     node strumenti/esporta-ambiente.mjs [uscita.png]
 *
 * `cuoci.py` costruiva per il ritratto della nave un gradiente suo, con la
 * stessa idea del sito -- carta sopra la linea, acqua sotto -- e col commento
 * giusto: cosi' il confronto misura il render e non due mondi diversi. Erano
 * pero' DUE implementazioni della stessa cosa, e la seconda non aveva il disco
 * del sole.
 *
 * Quanto costava, misurato col confronto alla stessa camera (che nel frattempo
 * e' diventato esatto a 0,05 px): sui 53.594 pixel in comune, **scarto medio
 * 56,85 livelli**, e nella mappa delle differenze lo scafo era quasi nero.
 * Attribuirlo alla resa sarebbe stato l'errore piu' costoso del pass: sono due
 * illuminazioni, non due renderer.
 *
 * La tela e' LDR e questo e' esatto, non una comodita': il sito la costruisce
 * con `intensitaSole = 1`, quindi nessun valore esce dal bianco e un PNG la
 * porta senza perdere niente. Se un giorno il sole passasse sopra 1, questo
 * file dovra' scrivere un HDR -- e allora il PNG comincerebbe a tagliare
 * proprio la parte che decide i riflessi.
 */
import { apriBrowser } from './browser.mjs'
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const FUORI = process.argv[2] || 'riferimenti/blender/hdri/ambiente-sito.png'
const PORTA = process.env.PORTA_COLLAUDO || 5194
const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
await new Promise(r => setTimeout(r, 4500))
const browser = await apriBrowser()
const pg = await (await browser.newContext()).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1`, { waitUntil: 'load' })
// il motore 3D arriva in differita: senza scorrere, `__nautica` non nasce mai
// e l'attesa scade su una pagina perfettamente sana
await pg.evaluate(() => { const d = document.documentElement
  scrollTo(0, Math.round((d.scrollHeight - innerHeight) * 0.36)) })
await pg.waitForFunction(() => !!(window.__nautica && window.__nautica.telaAmbiente),
                         null, { timeout: 40000 })

const dati = await pg.evaluate(() => {
  // gli stessi argomenti che passa `index.js`: se cambiano li', questo file
  // esporta un cielo che il sito non usa piu'
  // restituisce una CanvasTexture, non una tela: quella sta in `.image`
  const c = window.__nautica.telaAmbiente(1.0, 0).image
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data
  let max = 0
  for (let i = 0; i < d.length; i += 4) {
    for (let k = 0; k < 3; k++) if (d[i + k] > max) max = d[i + k]
  }
  return { url: c.toDataURL('image/png'), w: c.width, h: c.height, max }
})

mkdirSync(dirname(FUORI), { recursive: true })
writeFileSync(FUORI, Buffer.from(dati.url.split(',')[1], 'base64'))
console.log(`  ambiente ${dati.w}x${dati.h}, valore massimo ${dati.max}/255 -> ${FUORI}`)
if (dati.max >= 255) {
  console.error('  IL CIELO TOCCA IL BIANCO: un PNG lo taglia proprio dove decide i riflessi. ' +
                'Serve un HDR, non questo file.')
  await browser.close(); preview.kill(); process.exit(1)
}
await browser.close(); preview.kill(); process.exit(0)
