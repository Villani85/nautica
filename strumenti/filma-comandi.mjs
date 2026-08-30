/**
 * FILMA COSA PUO' FARE CHI GUARDA — i comandi, uno per uno, eseguiti davvero.
 *
 *     node strumenti/filma-comandi.mjs
 *     PORTA_COLLAUDO=8340 node strumenti/filma-comandi.mjs
 *
 * ─── PERCHE' ACCANTO AGLI ALTRI DUE E NON AL LORO POSTO
 *
 * `filma-sito` scorre e non tocca niente: dice «questo c'e' dentro, in
 * quest'ordine». `filma-atto-due` fa DUE clic, quelli del percorso che la
 * direzione descrive. Nessuno dei due risponde alla domanda «cosa posso fare
 * io?», che e' quella che si fa chi arriva sul sito.
 *
 * ─── E NON CLICCA ALLA CIECA
 *
 * Ogni gesto e' preceduto da una verifica: il comando esiste, si vede, e' nel
 * quadro, e non e' coperto. Se non lo e', il provino NON finge di premerlo: lo
 * salta e lo dice. Un filmato che mostra un clic su un bottone invisibile e'
 * peggio di un filmato che non lo mostra -- e' una prova falsa.
 *
 * E dopo ogni gesto legge la CONSEGUENZA dallo stato della simulazione, non
 * dai pixel: se spegnere lo stabilizzatore non alza il rollio, il referto lo
 * dice col numero invece di lasciarlo giudicare a chi guarda il video.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, renameSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const PORTA = process.env.PORTA_COLLAUDO || 5283
const L = Number(process.env.LARGHEZZA || 1280)
const A = Number(process.env.ALTEZZA || 720)
const FUORI = process.env.FUORI || 'uscite/filmato-comandi'

mkdirSync(FUORI, { recursive: true })
const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
for (let i = 0; i < 60; i++) {
  try { await fetch(`http://localhost:${PORTA}/`, { redirect: 'manual' }); break } catch {}
  await new Promise(r => setTimeout(r, 500))
}

const browser = await chromium.launch({
  channel: 'chromium',
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars']
})
const contesto = await browser.newContext({
  viewport: { width: L, height: A },
  recordVideo: { dir: FUORI, size: { width: L, height: A } }
})
const pg = await contesto.newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
await pg.waitForTimeout(3500)

const dice = (m) => console.log(m)

/** Lo stato che conta, letto dalla simulazione e non dai pixel. */
const leggi = () => pg.evaluate(() => {
  const S = window.__nautica?.stato
  const palco = document.querySelector('#dimostrazione .palco')
  const b = document.querySelector('.nudge')
  return {
    p: window.__nautica?.p ?? null,
    battuta: palco?.dataset.battuta || '',
    antefatto: palco?.dataset.antefatto || '',
    rollio: S ? +S.rollio.toFixed(2) : null,
    rms: S && Number.isFinite(S.rollioRms) ? +S.rollioRms.toFixed(2) : null,
    velocita: S ? +S.velocita.toFixed(2) : null,
    mare: S ? S.mare : null,
    stab: S ? S.stab : null,
    bolla: b?.dataset.visibile === 'si' ? (b.textContent || '').trim() : null
  }
})

/** Ci si porta a una frazione della CORSA DEL RACCONTO, non della pagina. */
async function vaiA (q, secondi = 2.5) {
  const da = await pg.evaluate(() => window.scrollY)
  const a = await pg.evaluate((qq) => {
    const n = window.__nautica
    return n.cimaSezione + qq * n.corsaRacconto
  }, q)
  const passi = Math.max(1, Math.round(secondi * 1000 / 60))
  for (let i = 1; i <= passi; i++) {
    const u = i / passi
    const e = u * u * (3 - 2 * u)     // stesso addolcimento della regia
    await pg.evaluate((y) => window.scrollTo(0, y), da + (a - da) * e)
    await pg.waitForTimeout(60)
  }
  await pg.waitForTimeout(500)
}

/**
 * PREMERE SUL SERIO, o dire che non si poteva.
 *
 * Si controlla che il bersaglio sia in pagina, visibile, dentro il quadro e
 * che il punto centrale appartenga davvero a lui (`elementFromPoint`): e' lo
 * stesso controllo che usa `collaudo-manopola`, ed e' quello che distingue un
 * comando presente da un comando raggiungibile.
 */
async function premi (sel, etichetta) {
  const ok = await pg.evaluate((s) => {
    const el = document.querySelector(s)
    if (!el) return { c_e: false }
    const r = el.getBoundingClientRect()
    const st = getComputedStyle(el)
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const sopra = document.elementFromPoint(cx, cy)
    return {
      c_e: true,
      inQuadro: r.width > 0 && r.height > 0 && cy > 0 && cy < innerHeight,
      opacita: +st.opacity,
      eventi: st.pointerEvents,
      suo: !!(sopra && (sopra === el || el.contains(sopra))),
      punto: [Math.round(cx), Math.round(cy)]
    }
  }, sel)
  if (!ok.c_e || !ok.inQuadro || ok.opacita < 0.5 || ok.eventi === 'none' || !ok.suo) {
    dice(`   SALTATO  ${etichetta}  ->  ${JSON.stringify(ok)}`)
    return false
  }
  await pg.mouse.move(ok.punto[0], ok.punto[1])
  await pg.waitForTimeout(500)          // il puntatore si vede arrivare
  await pg.mouse.click(ok.punto[0], ok.punto[1])
  dice(`   premuto  ${etichetta}  in ${ok.punto.join(',')}`)
  return true
}

/** Guarda per N secondi e riporta come e' cambiato lo stato. */
async function guarda (secondi, etichetta) {
  const prima = await leggi()
  const t0 = Date.now()
  let picco = prima.rollio ?? 0
  while (Date.now() - t0 < secondi * 1000) {
    await pg.waitForTimeout(300)
    const s = await leggi()
    if (s.rollio !== null) picco = Math.max(picco, Math.abs(s.rollio))
    if (s.bolla) dice(`      bolla: "${s.bolla}"`)
  }
  const dopo = await leggi()
  dice(`   [${etichetta}] p=${(dopo.p ?? 0).toFixed(3)} battuta=${dopo.battuta}  ` +
    `rollio ${prima.rollio}->${dopo.rollio} (picco ${picco.toFixed(2)})  ` +
    `rms ${prima.rms}->${dopo.rms}  vel ${prima.velocita}->${dopo.velocita} kn  mare ${dopo.mare}  stab=${dopo.stab}`)
}

/* ─────────────────────────────────────────────────────────────────── */

dice('\n1 · L\'APERTURA — adesso la scena e\' gia\' viva dietro il titolo')
await pg.evaluate(() => window.scrollTo(0, 0))
await guarda(5, 'apertura')

dice('\n2 · SI SCORRE: la stanza diventa finestra, la nave esce dall\'acqua')
await vaiA(0.18, 6)
await guarda(3, 'emersione')

dice('\n3 · SI TRASCINA PER GIRARE INTORNO ALLA NAVE')
await vaiA(0.34, 4)
{
  const c = await pg.evaluate(() => {
    const r = document.querySelector('#scena canvas').getBoundingClientRect()
    return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height * 0.62)]
  })
  await pg.mouse.move(c[0], c[1])
  await pg.mouse.down()
  for (let i = 1; i <= 30; i++) { await pg.mouse.move(c[0] - i * 9, c[1]); await pg.waitForTimeout(40) }
  await pg.mouse.up()
  dice('   trascinato di -270 px')
  await pg.waitForTimeout(900)
  for (let i = 1; i <= 30; i++) { await pg.mouse.move(c[0] - 270 + i * 9, c[1]); await pg.waitForTimeout(40) }
  dice('   e riportato indietro')
}
await guarda(2, 'rotazione')

dice('\n4 · SI CAMBIA LO STATO DEL MARE')
await vaiA(0.42, 3)
{
  const bottoni = await pg.evaluate(() => [...document.querySelectorAll('#mare button')].map(b => b.id || b.textContent.trim()))
  dice(`   la scala del mare ha ${bottoni.length} tacche: ${bottoni.join(' ')}`)
  const sel = await pg.evaluate(() => {
    const b = [...document.querySelectorAll('#mare button')]
    return b.length ? `#mare button:nth-of-type(${b.length})` : null
  })
  if (sel) { await premi(sel, 'mare al massimo'); await guarda(6, 'mare grosso') }
  else dice('   SALTATO  la scala del mare non ha bottoni in questa battuta')
}

dice('\n5 · SI SPEGNE LO STABILIZZATORE — ed e\' la dimostrazione del sito')
if (await premi('#stab', 'stabilizzazione OFF')) await guarda(10, 'senza stabilizzatore')

dice('\n6 · E LO SI RIACCENDE')
if (await premi('#stab', 'stabilizzazione ON')) await guarda(8, 'con lo stabilizzatore')

dice('\n7 · SI SPEGNE LA PROPULSIONE — la velocita\' cala e il giroscopio si propone')
if (await premi('#propulsione', 'propulsione OFF')) await guarda(12, 'in deriva')

dice('\n8 · SI ACCENDE IL GIROSCOPIO')
if (await premi('#giroscopio', 'giroscopio ON')) await guarda(8, 'col giroscopio')

dice('\n9 · SI RIACCENDE LA PROPULSIONE')
if (await premi('#propulsione', 'propulsione ON')) await guarda(6, 'in navigazione')

dice('\n10 · SI SCENDE SUL MECCANISMO E SI TORNA DALLE PERSONE')
await vaiA(0.90, 8)
await guarda(4, 'meccanismo')
await vaiA(1.0, 6)
await guarda(8, 'traversata')

dice('\n11 · E C\'E\' UNA RICHIESTA, in fondo')
await pg.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
await pg.waitForTimeout(2500)

await pg.waitForTimeout(1200)
await contesto.close()
await browser.close()
preview.kill()

const vid = readdirSync(FUORI).filter(f => f.endsWith('.webm'))
if (vid.length) {
  const dest = join(FUORI, `comandi-${L}x${A}.webm`)
  renameSync(join(FUORI, vid[0]), dest)
  dice(`\n  scritto ${dest}`)
}
