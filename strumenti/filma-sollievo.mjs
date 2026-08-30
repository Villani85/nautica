/**
 * FILMA IL TERZO GESTO — tensione, quiete, sollievo, consegna alla calma.
 *
 *     node strumenti/filma-sollievo.mjs
 *
 * `collaudo-sollievo` verifica la causalita': che il filmato non cicli, che
 * parta solo dopo tensione piu' quiete, che finisca una volta sola e consegni
 * il suo ultimo fotogramma al ciclo calmo. Nessuna di quelle cose dice se il
 * gesto SI LEGGE, e quello si giudica guardando.
 *
 * Il sollievo vive nel salone, quindi si guarda dove il salone e' in quadro --
 * il primo quinto della corsa. Il provino prova a premere l'interruttore
 * ESATTAMENTE come lo premerebbe una persona, e se in quella battuta il comando
 * non e' raggiungibile lo DICE invece di fingere il clic: sarebbe una scoperta
 * piu' importante del filmato, perche' vorrebbe dire che nessun visitatore puo'
 * innescare il gesto guardandolo.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, renameSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const PORTA = process.env.PORTA_COLLAUDO || 5284
const L = Number(process.env.LARGHEZZA || 1280)
const A = Number(process.env.ALTEZZA || 720)
const FUORI = process.env.FUORI || 'uscite/filmato-sollievo'
const Q = Number(process.env.Q ?? 0.06)

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
const stato = () => pg.evaluate(() => {
  const S = window.__nautica?.stato
  const s = window.__nautica?.statoSollievo?.() ?? null
  const palco = document.querySelector('#dimostrazione .palco')
  return {
    p: window.__nautica?.p ?? null,
    battuta: palco?.dataset.battuta || '',
    rms: S && Number.isFinite(S.rollioRms) ? +S.rollioRms.toFixed(2) : null,
    stab: S ? S.stab : null,
    mare: S ? S.mare : null,
    sollievo: s ? { inMoto: s.inMoto, tempo: +s.tempo.toFixed(2), opacita: +s.opacita.toFixed(2), concluso: s.concluso, armato: s.armato } : null
  }
})

async function vaiA (q, secondi = 3) {
  const da = await pg.evaluate(() => window.scrollY)
  const a = await pg.evaluate((qq) => {
    const n = window.__nautica
    return n.cimaSezione + qq * n.corsaRacconto
  }, q)
  const passi = Math.max(1, Math.round(secondi * 1000 / 60))
  for (let i = 1; i <= passi; i++) {
    const u = i / passi
    const e = u * u * (3 - 2 * u)
    await pg.evaluate((y) => window.scrollTo(0, y), da + (a - da) * e)
    await pg.waitForTimeout(60)
  }
  await pg.waitForTimeout(400)
}

/** Premere sul serio, o dire che non si poteva. */
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
      raggiungibile: r.width > 0 && cy > 0 && cy < innerHeight &&
        +st.opacity >= 0.5 && st.pointerEvents !== 'none' &&
        !!(sopra && (sopra === el || el.contains(sopra))),
      punto: [Math.round(cx), Math.round(cy)]
    }
  }, sel)
  if (!ok.c_e || !ok.raggiungibile) {
    dice(`   NON RAGGIUNGIBILE  ${etichetta}  ${JSON.stringify(ok)}`)
    return false
  }
  await pg.mouse.move(ok.punto[0], ok.punto[1])
  await pg.waitForTimeout(450)
  await pg.mouse.click(ok.punto[0], ok.punto[1])
  dice(`   premuto  ${etichetta}`)
  return true
}

/** Sorveglia il gesto e stampa quando parte e quando consegna. */
async function sorveglia (secondi, etichetta) {
  const t0 = Date.now()
  let partito = false
  let concluso = false
  while (Date.now() - t0 < secondi * 1000) {
    await pg.waitForTimeout(250)
    const s = await stato()
    if (s.sollievo?.inMoto && !partito) {
      partito = true
      dice(`      ${((Date.now() - t0) / 1000).toFixed(1)} s  IL SOLLIEVO PARTE  (rms ${s.rms})`)
    }
    if (s.sollievo?.concluso && !concluso) {
      concluso = true
      dice(`      ${((Date.now() - t0) / 1000).toFixed(1)} s  consegnato alla calma  (tempo ${s.sollievo.tempo} s)`)
    }
  }
  const f = await stato()
  dice(`   [${etichetta}] p=${(f.p ?? 0).toFixed(3)} battuta=${f.battuta} rms=${f.rms} stab=${f.stab} mare=${f.mare} sollievo=${JSON.stringify(f.sollievo)}`)
}

dice('\n1 · L\'APERTURA, e il salone in quadro')
await pg.evaluate(() => window.scrollTo(0, 0))
await sorveglia(4, 'apertura')

dice(`\n2 · CI SI PORTA DOVE IL SALONE E\' IL SOGGETTO (q=${Q})`)
await vaiA(Q, 4)
await sorveglia(3, 'salotto')

dice('\n3 · SI SPEGNE LO STABILIZZATORE: il mare entra nella stanza')
if (await premi('#stab', 'stabilizzazione OFF')) await sorveglia(12, 'in tensione')

dice('\n4 · E LO SI RIACCENDE: la quiete torna, e dopo la quiete arriva il gesto')
if (await premi('#stab', 'stabilizzazione ON')) await sorveglia(16, 'sollievo')

dice('\n5 · POI IL RACCONTO PROSEGUE')
await vaiA(0.45, 6)
await sorveglia(2, 'mare')
await vaiA(0.90, 7)
await sorveglia(2, 'meccanismo')
await vaiA(1.0, 6)
await sorveglia(6, 'traversata')

await pg.waitForTimeout(1200)
await contesto.close()
await browser.close()
preview.kill()

const vid = readdirSync(FUORI).filter(f => f.endsWith('.webm'))
if (vid.length) {
  const dest = join(FUORI, `sollievo-${L}x${A}.webm`)
  renameSync(join(FUORI, vid[0]), dest)
  dice(`\n  scritto ${dest}`)
}
