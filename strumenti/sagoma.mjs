import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'

/**
 * PRODUCE LE SAGOME — gli ingressi della pipeline fotografica.
 *
 *     node strumenti/sagoma.mjs
 *
 * PERCHE' ESISTE, ed e' la cosa che tiene il controllo.
 *
 * Gli asset fotografici del salone non si chiedono a un modello generativo
 * partendo da una descrizione: si chiedono partendo da un FOTOGRAMMA
 * RENDERIZZATO DAL SITO. Composizione, camera, posizione dei mobili, altezza
 * dell'orizzonte nel finestrino e posa delle persone sono decisi dalla scena.
 * Il modello veste una struttura che e' gia' nostra.
 *
 * La differenza non e' estetica: e' che un asset generato da una sagoma
 * versionata **si puo' rifare**, e chi lo rifa ottiene la stessa struttura.
 * Senza, ogni asset e' un colpo di fortuna che non si ripete.
 *
 * Produce tre file in `riferimenti/sagome/`:
 *
 *   salone.png                    la stanza calma, sistema acceso
 *   salone-maschera.png           i suoi finestrini, bianco su nero
 *   salone-inclinato.png          la stanza a 10 gradi, mano gia' sul tavolo
 *   salone-inclinato-maschera.png i finestrini di QUELLA posa
 *
 * La maschera esce dalla STESSA scena, quindi combacia al pixel con le altre
 * due. Ritagliata a mano non combacerebbe mai, e lo scarto si vedrebbe come un
 * alone attorno ai montanti.
 */

const INDIRIZZO = process.env.URL || 'http://localhost:4174/nautica/'
const RADICE = fileURLToPath(new URL('..', import.meta.url))
const FUORI = RADICE + 'riferimenti/sagome/'
mkdirSync(FUORI, { recursive: true })

async function risponde (u) {
  try {
    const c = new AbortController(); const t = setTimeout(() => c.abort(), 3000)
    const r = await fetch(u, { signal: c.signal }); clearTimeout(t); return r.ok
  } catch { return false }
}

let preview = null
if (!(await risponde(INDIRIZZO))) {
  const porta = new URL(INDIRIZZO).port || '4173'
  console.log(`  accendo la preview sulla ${porta}`)
  preview = spawn('npx', ['vite', 'preview', '--port', porta, '--strictPort'],
    { shell: true, stdio: 'ignore', cwd: RADICE })
  for (let i = 0; i < 40 && !(await risponde(INDIRIZZO)); i++) await new Promise(r => setTimeout(r, 500))
}

const b = await chromium.launch({ channel: 'chrome', headless: false,
  args: ['--autoplay-policy=no-user-gesture-required'] })

/**
 * Alta risoluzione: la sagoma e' l'ingresso di un modello generativo, e piu'
 * struttura gli si da' meno ne inventa. `deviceScaleFactor: 2` costa niente
 * qui e cambia molto la' — e' la stessa ragione per cui si fotografa in RAW.
 */
const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 })

async function cattura (query, nome) {
  const pg = await ctx.newPage()
  await pg.goto(INDIRIZZO + query, { waitUntil: 'domcontentloaded' })
  await pg.waitForTimeout(900)
  await pg.evaluate(() => document.querySelector('#salone').scrollIntoView())
  await pg.waitForFunction(() => !!document.querySelector('#scena-salone canvas'), null, { timeout: 25000 })
  // il filmato del mare ci mette un attimo ad arrivare, e senza il finestrino
  // e' vuoto — cioe' la sagoma direbbe una cosa che la scena non dice
  await pg.waitForTimeout(6500)
  await pg.evaluate(() => {
    for (const s of ['.salone__didascalia', '.apertura__sommerso', '.apertura__pelo', '.testata'])
      document.querySelectorAll(s).forEach(e => { e.style.display = 'none' })
    document.querySelector('.apertura').style.boxShadow = 'none'
  })
  await pg.waitForTimeout(500)
  const r = await pg.evaluate(() => {
    const b = document.querySelector('.apertura').getBoundingClientRect()
    return { x: Math.round(b.x), y: Math.round(b.y), width: Math.round(b.width), height: Math.round(b.height) }
  })
  await pg.screenshot({ path: FUORI + nome, clip: r })
  console.log(`  ${nome.padEnd(24)} ${r.width}x${r.height}`)
  await pg.close()
}

/**
 * UNA MASCHERA PER OGNI POSA, e non una sola.
 *
 * La maschera segue la geometria, e la geometria ruota con la stanza: quella
 * della stanza calma non combacia con quella inclinata di dieci gradi. Usarne
 * una sola lascerebbe scoperto un bordo di finestrino da un lato e ne
 * coprirebbe uno dall'altro — cioe' proprio l'alone che questo metodo esiste
 * per evitare.
 */
await cattura('', 'salone.png')
await cattura('?maschera=1', 'salone-maschera.png')
await cattura('?rollio=10', 'salone-inclinato.png')
await cattura('?rollio=10&maschera=1', 'salone-inclinato-maschera.png')

await b.close()
preview?.kill()
console.log('\n  sagome pronte in riferimenti/sagome/\n')
