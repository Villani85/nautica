import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'

/**
 * COLLAUDO DEL TERZO GESTO DELLA COPPIA.
 *
 * Calma e tensione sono stati in loop; il sollievo e' una conseguenza. Questo
 * cancello protegge cinque promesse che il peso e il controllo della camera
 * non possono vedere: il filmato non cicla, resta fermo prima della causa,
 * parte solo dopo tensione + 1,6 s di quiete, arriva alla fine una volta sola
 * e consegna senza salto il proprio ultimo fotogramma al primo frame del ciclo
 * calmo. Il fermo immagine permanente sarebbe un'altra scena mascherata.
 */

const PORTA = Number(process.env.PORTA_COLLAUDO) || 5180
await avvisaSePortaAltrui(PORTA)
const BASE = `http://localhost:${PORTA}/nautica/`

async function serviteci () {
  try {
    const r = await fetch(BASE, { redirect: 'manual' })
    if (r.status < 500) return null
  } catch {}
  const s = spawn('npm', ['run', 'preview', '--', '--port', String(PORTA)], {
    shell: true,
    stdio: 'ignore'
  })
  for (let i = 0; i < 60; i++) {
    try { await fetch(BASE, { redirect: 'manual' }); return s } catch {}
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  s.kill()
  throw new Error('il server non si e alzato')
}

const guai = []
const server = await serviteci()
const browser = await apriBrowser()

try {
  const pagina = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  const errori = []
  pagina.on('pageerror', e => errori.push(String(e)))
  await pagina.goto(BASE + '?ispeziona=1', { waitUntil: 'load' })
  await pagina.waitForFunction(() => window.__nautica?.statoSollievo?.(), null, { timeout: 60000 })
  await pagina.waitForFunction(() => {
    const v = document.querySelector('video[src*="salone-sollievo"]')
    return v?.readyState >= 2 && Number.isFinite(v.duration)
  }, null, { timeout: 30000 })

  const prima = await pagina.evaluate(() => {
    const v = document.querySelector('video[src*="salone-sollievo"]')
    return { ...window.__nautica.statoSollievo(), paused: v.paused, ended: v.ended }
  })
  if (prima.loop !== false) guai.push('il sollievo e in loop')
  if (!prima.paused || prima.tempo > 0.05) guai.push('decodifica prima che esista una causa')
  if (Math.abs(prima.durata - 5) > 0.08) guai.push(`durata ${prima.durata.toFixed(3)} s, attesi 5,00`)

  /* Prima il mare obbliga davvero a puntellarsi; poi resta calmo oltre la
     stessa soglia temporale usata dal sito. Il passo e' dichiarato: il test
     non dipende dai fotogrammi al secondo della macchina. */
  await pagina.evaluate(() => {
    for (let i = 0; i < 120; i++) window.__nautica.provaSollievo(8, 1 / 24)
    for (let i = 0; i < 48; i++) window.__nautica.provaSollievo(0, 1 / 24)
  })
  const partito = await pagina.waitForFunction(() => {
    const s = window.__nautica.statoSollievo()
    return s.inMoto && s.tempo > 0.05 && s.opacita > 0
  }, null, { timeout: 5000 }).then(() => true).catch(() => false)
  if (!partito) guai.push('non parte dopo tensione e quiete')

  const concluso = await pagina.waitForFunction(() => {
    const s = window.__nautica.statoSollievo()
    return s.concluso && !s.inMoto && !s.inConsegna && s.opacita < 0.01
  }, null, { timeout: 8000 }).then(() => true).catch(() => false)
  if (!concluso) guai.push('non consegna il fotogramma finale al ciclo calmo')

  const finale = await pagina.evaluate(() => {
    const v = document.querySelector('video[src*="salone-sollievo"]')
    /**
     * ─── IL SELETTORE PUNTAVA A UN FILE CHE NON ESISTE
     *
     * Qui c'era `video[src*="/filmati/salone.mp4"]`. Nel repo non c'e' nessun
     * `salone.mp4`: la clip calma e' `salone-largo.mp4` (`CALMA` in
     * `salone3d.js`), e `/filmati/salone-largo.mp4` non contiene quella
     * sottostringa. Il selettore non poteva agganciare NIENTE.
     *
     * E il difetto non si presentava come errore. `calma` restava `null`,
     * `?? -1` lo trasformava in un numero, e il cancello stampava «la calma
     * riparte a -1.00 s» -- una misura dall'aria plausibile su un video che
     * non aveva mai trovato. E' la stessa forma di guasto che questo repo ha
     * gia' pagato con `coperturaTraversata`: *un accessore assente non da'
     * errore, da' `undefined`, e `?? 0` lo trasforma in un numero che sembra
     * una misura*.
     *
     * Adesso il nome si prende dalla stessa costante che lo dichiara, e se non
     * trova il video il cancello lo DICE invece di misurare un sentinella.
     */
    const calma = document.querySelector('video[src*="salone-largo"]')
    return {
      ...window.__nautica.statoSollievo(),
      paused: v.paused,
      ended: v.ended,
      calmaTrovata: !!calma,
      calmaTempo: calma ? calma.currentTime : null,
      calmaFerma: calma ? calma.paused : null
    }
  })
  if (!finale.calmaTrovata) guai.push('il video della calma non e in pagina: non misuro il raccordo')
  if (!finale.ended || !finale.paused) guai.push('il decoder non si ferma alla fine')
  if (finale.tempo < 4.8) guai.push(`si ferma troppo presto: ${finale.tempo.toFixed(2)} s`)
  if (finale.calmaTrovata && (finale.calmaFerma || finale.calmaTempo > 0.5)) {
    guai.push(`la calma non riparte dal raccordo: ${finale.calmaTempo.toFixed(2)} s`)
  }

  const ritornaMare = await pagina.evaluate(() => {
    for (let i = 0; i < 12; i++) window.__nautica.provaSollievo(8, 1 / 24)
    return window.__nautica.statoSollievo()
  })
  if (ritornaMare.concluso || ritornaMare.opacita > 0.01) {
    guai.push('il mare difficile non rimette in tensione la coppia')
  }
  if (!ritornaMare.armato) guai.push('un nuovo episodio non riarma il gesto')
  if (errori.length) guai.push('errori di pagina: ' + errori.slice(0, 2).join(' | '))

  console.log(`  prima    fermo ${prima.paused ? 'si' : 'NO'} · loop ${prima.loop}`)
  console.log(`  gesto    ${partito ? 'parte' : 'NON PARTE'} dopo tensione + quiete`)
  console.log(`  finale   ${finale.tempo.toFixed(2)} s · fermo ${finale.paused ? 'si' : 'NO'} · consegnato ${finale.opacita.toFixed(2)}`)
  console.log(`  calma    riparte a ${finale.calmaTrovata ? finale.calmaTempo.toFixed(2) : '--'} s · in moto ${finale.calmaFerma ? 'NO' : 'si'}`)
  console.log(`  ritorno  opacita ${ritornaMare.opacita.toFixed(2)} · riarmato ${ritornaMare.armato ? 'si' : 'NO'}`)
} finally {
  await browser.close()
  server?.kill()
}

if (guai.length) {
  for (const g of guai) console.error('  ROTTO  ' + g)
  process.exit(1)
}
console.log('  SOLLIEVO IN ORDINE')
