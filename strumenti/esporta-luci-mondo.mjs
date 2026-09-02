/**
 * LE PLAFONIERE DEL MONDO, DAL SITO A BLENDER.
 *
 *     node strumenti/esporta-luci-mondo.mjs
 *
 * ─── PERCHE' SI ESPORTANO INVECE DI RISCRIVERLE
 *
 * Le posizioni delle plafoniere non stanno in nessun file: le decide un raggio
 * che, a runtime, misura il soffitto sopra ogni tratto del percorso
 * (`mondo.js`, `accendiLuci`). Riscriverle a mano in Blender vorrebbe dire
 * rifare lo stesso conto in un secondo posto -- ed e' il difetto che questo
 * repo insegue da giorni: due copie di un valore sono due valori che un giorno
 * divergono.
 *
 * Quindi si misurano dove nascono e si scrivono in un file che la cottura
 * legge. Se domani il percorso o i soffitti cambiano, si riesporta.
 *
 * ─── IL SISTEMA DI COORDINATE, dichiarato
 *
 * Il file porta i metri nel frame del MONDO, quello del GLB della traversata:
 * x lungo il percorso (prua negativa), y in alto, z di traverso. Blender ha lo
 * stesso frame ruotato Y-up -> Z-up dall'importatore glTF, quindi la cottura
 * converte cosi':  blender = (x, -z, y).  La conversione sta LI', in un posto
 * solo, e questo file resta nel sistema del sito.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { anteprima } from './anteprima.mjs'
import { apriBrowser } from './browser.mjs'

const FUORI = 'riferimenti/blender/luci-mondo.json'

const servito = await anteprima()
const browser = await apriBrowser({ conGpu: true })
const pg = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await pg.goto(servito.indirizzo + '?ispeziona=1', { waitUntil: 'load' })
await pg.waitForFunction(() => window.__nautica?.mondo()?.ancorato === true, null, { timeout: 120000 })
await pg.waitForTimeout(1500)
const luci = await pg.evaluate(() => window.__nautica.luciMondo())
await browser.close()
servito.ferma()

if (!luci || !luci.length) {
  console.error('\n  NESSUNA PLAFONIERA: il mondo non ne espone. Non scrivo niente,')
  console.error('  perche un file vuoto qui vorrebbe dire «stanze senza lampade».\n')
  process.exit(2)
}

mkdirSync('riferimenti/blender', { recursive: true })
writeFileSync(FUORI, JSON.stringify({
  sistema: 'metri nel frame del MONDO (GLB traversata): x lungo il percorso, y in alto, z di traverso',
  perBlender: 'blender = (x, -z, y)',
  quando: new Date().toISOString().slice(0, 19) + 'Z',
  luci
}, null, 1) + '\n')

console.log(`\n  ${luci.length} plafoniere scritte in ${FUORI}`)
for (const l of luci) console.log(`    ${l.p.join(' ').padEnd(28)} intensita ${l.intensita}  portata ${l.portata}  ${l.colore}`)
console.log('')
