/**
 * DIAGNOSI (sola lettura): all'apertura si muove il FILMATO o solo il rollio?
 *
 * Rilievo dell'utente guardando il provino: «all'inizio c'e' una foto che
 * dondola, non e' un video». E' un'accusa precisa e separabile, perche' nel
 * salone ci sono due movimenti sovrapposti:
 *
 *   1. la stanza si INCLINA col rollio della nave
 *   2. il filmato del salone SCORRE
 *
 * Misurando la differenza fra fotogrammi consecutivi si sommano. Se il moto e'
 * tutto il numero 1, allora quello che si guarda e' davvero una fotografia
 * inclinata, e il fatto che un <video> decodifichi dietro non conta niente.
 *
 * Si separa in un modo solo: si azzera il rollio e si guarda se resta
 * movimento. E si misura DOVE, perche' l'inclinazione muove i bordi e lascia
 * fermo il centro, mentre un filmato muove anche il centro.
 */
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'
import { mkdirSync } from 'node:fs'

const PORTA = Number(process.env.PORTA_COLLAUDO || 6562)
const FUORI = process.env.FUORI || 'uscite/apertura-dondola'
const PAUSA = Number(process.env.PAUSA || 900)
const QUANTI = Number(process.env.QUANTI || 6)

mkdirSync(FUORI, { recursive: true })
await avvisaSePortaAltrui(PORTA)
const pv = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
for (let i = 0; i < 60; i++) {
  try { await fetch(`http://localhost:${PORTA}/`, { redirect: 'manual' }); break } catch {}
  await new Promise(r => setTimeout(r, 500))
}

const b = await apriBrowser({ conGpu: true })
const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
await pg.evaluate(() => window.scrollTo(0, 0))
await pg.waitForTimeout(3000)

const leggi = () => pg.evaluate(() => {
  const S = window.__nautica.stato
  const vs = [...document.querySelectorAll('video')].map(v => ({
    n: (v.currentSrc || v.src).split('/').pop(),
    t: +v.currentTime.toFixed(3),
    fermo: v.paused
  }))
  const g = (r) => +(r * 180 / Math.PI).toFixed(3)
  const n = window.__nautica
  return {
    rollio: +S.rollio.toFixed(3), mare: S.mare, stab: S.stab, video: vs,
    naveZ: g(n.nave.rotation.z),
    cameraZ: g(n.camera.rotation.z),
    cameraY: g(n.camera.rotation.y),
    residuo: +(g(n.nave.rotation.z) - g(n.camera.rotation.z)).toFixed(3)
  }
})

async function serie(nome, prima) {
  if (prima) await prima()
  await pg.waitForTimeout(1200)
  const s0 = await leggi()
  const scatti = []
  for (let i = 0; i < QUANTI; i++) {
    scatti.push(await pg.screenshot({ path: `${FUORI}/${nome}-${i}.png` }))
    await pg.waitForTimeout(PAUSA)
  }
  const s1 = await leggi()
  const vt = s0.video.map((v, i) => `${v.n} ${v.t}->${s1.video[i].t}`).join('  ')
  console.log(`\n  ── ${nome}`)
  console.log(`     rollio ${s0.rollio} -> ${s1.rollio}   mare ${s1.mare}  stab ${s1.stab}`)
  console.log(`     naveZ ${s1.naveZ}deg  cameraZ ${s1.cameraZ}deg  cameraY ${s1.cameraY}deg  RESIDUO ${s1.residuo}deg`)
  console.log(`     video: ${vt}`)
}

console.log('\n  APERTURA: si muove il filmato o solo il rollio?')

await serie('come-e', null)

/**
 * Si azzera il rollio senza toccare il resto: mare calmo e stabilizzatore
 * acceso e' la condizione in cui la nave sta ferma, ed e' uno stato che il
 * sito ha davvero -- non un trucco da laboratorio.
 */
/**
 * ─── E LA CALMA SI ASPETTA, NON SI FA AVANZARE A PASSO DICHIARATO
 *
 * DIFETTO DEL METRO, mio, e trovato guardando i numeri accanto. Qui c'erano
 * 400 passi di `passoDichiarato` per portare il rollio a zero in fretta.
 * Funzionava per il rollio e rompeva tutto il resto: in quella serie il
 * filmato del salone avanzava di **0,063 secondi** in cinque secondi di
 * orologio, perche' il tempo simulato correva senza che i <video> lo
 * seguissero.
 *
 * Cosi' non si confrontava «col rollio» contro «senza rollio»: si confrontava
 * «col video» contro «senza video», e il crollo della stanza da 10,5 a 1,6
 * -- che avevo attribuito all'inclinazione -- era il filmato fermo.
 *
 * La calma si aspetta sull'orologio vero, come la vedrebbe una persona.
 */
await serie('rollio-fermo', async () => {
  await pg.evaluate(() => {
    const S = window.__nautica.stato
    S.mare = 0
    S.stab = true
  })
  await pg.waitForTimeout(9000)
})

/**
 * TERZA SERIE: si blocca la ROTAZIONE DELLA NAVE, non il rollio.
 *
 * Se azzerando la rotazione della TEXTURE non cambia niente ma azzerando
 * `nave.rotation.z` la stanza si ferma, allora quello che dondola non e' la
 * fotografia dentro il piano: e' il piano stesso -- il salone sta dentro la
 * tuga, la tuga ruota con la nave, e la camera resta livellata.
 */
await serie('nave-ferma', async () => {
  await pg.evaluate(() => {
    const S = window.__nautica.stato
    S.mare = 4
    S.stab = false
    const n = window.__nautica.nave
    Object.defineProperty(n.rotation, 'z', {
      get: () => 0, set: () => {}, configurable: true
    })
  })
})

await b.close(); pv.kill()
console.log(`\n  scatti in ${FUORI}\n`)
