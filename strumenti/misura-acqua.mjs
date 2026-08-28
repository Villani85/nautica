/**
 * QUANTA ACQUA C'E' DAVVERO FRA LA CAMERA E LO SCAFO SOMMERSO.
 *
 * Serve a scegliere il coefficiente di estinzione su una misura invece che a
 * occhio, e a sapere quanto conta la differenza fra due cose che oggi il
 * codice tratta come una: la DISTANZA dalla camera e il CAMMINO NELL'ACQUA.
 *
 * Coincidono solo con la camera sul pelo. In uscita dal salone la camera
 * scende da dentro la tuga fino a zero, e in quel tratto una parte del
 * segmento sta in aria: usare tutta la distanza sovrastima l'assorbimento.
 *
 * Il cammino subacqueo esatto e' geometria, non approssimazione: per un
 * frammento a quota h < 0 e una camera a quota c >= 0 il segmento taglia il
 * pelo a t = c/(c-h), quindi la parte bagnata vale d*|h|/(c+|h|). A c = 0 da'
 * esattamente d, cioe' quello che il sito calcola adesso.
 *
 *     node strumenti/misura-acqua.mjs
 */
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'

const M = 2.5          // metri per unita di scena, come in impianto.js e vetro.js
const PORTA = process.env.PORTA_COLLAUDO || 5217
const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
const browser = await apriBrowser({ conGpu: true })
const pg = await browser.newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })

const righe = []
for (const q of [0, 0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88, 1]) {
  await pg.evaluate((q) => {
    const h = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo(0, h * q)
  }, q)
  await pg.waitForTimeout(700)
  const r = await pg.evaluate(() => {
    const n = window.__nautica
    const THREE = n.THREE || {}
    const cam = n.camera
    cam.updateMatrixWorld(true)
    const cw = new cam.position.constructor()
    cam.getWorldPosition(cw)
    // Punti dello SCAFO sommerso, presi dalla geometria vera e non inventati:
    // si scorrono i vertici del guscio e si tengono quelli sotto il pelo.
    let dMin = Infinity, dMax = 0, dSom = 0, n0 = 0
    let bagMin = Infinity, bagMax = 0, bagSom = 0
    let hMin = 0
    const v = new cam.position.constructor()
    n.nave.traverse((o) => {
      if (!o.isMesh || !o.geometry?.attributes?.position) return
      if (/pelo|velo|scia/i.test(o.name || '')) return
      const p = o.geometry.attributes.position
      const passo = Math.max(1, Math.floor(p.count / 400))
      for (let i = 0; i < p.count; i += passo) {
        v.fromBufferAttribute(p, i); o.localToWorld(v)
        if (v.y >= 0) continue
        const d = v.distanceTo(cw)
        const h = Math.abs(v.y), c = Math.max(0, cw.y)
        const bagnato = d * h / (c + h)
        dMin = Math.min(dMin, d); dMax = Math.max(dMax, d); dSom += d
        bagMin = Math.min(bagMin, bagnato); bagMax = Math.max(bagMax, bagnato); bagSom += bagnato
        hMin = Math.min(hMin, v.y)
        n0++
      }
    })
    return { camY: cw.y, n: n0, dMin, dMax, dMed: dSom / n0, bagMin, bagMax, bagMed: bagSom / n0, hMin }
  })
  righe.push({ q, ...r })
}
await browser.close()
preview.kill()

console.log('\nquota camera e acqua attraversata, in METRI (1 unita = 2,5 m)\n')
console.log('  scorr.  camera   punti      distanza dalla camera        cammino nell ACQUA      errore')
for (const r of righe) {
  if (!r.n) { console.log(`  ${r.q.toFixed(2)}    ${(r.camY * M).toFixed(1).padStart(6)} m   nessun punto sommerso`); continue }
  const e = 100 * (r.dMed - r.bagMed) / r.dMed
  console.log(`  ${r.q.toFixed(2)}    ${(r.camY * M).toFixed(1).padStart(6)} m  ${String(r.n).padStart(5)}   ` +
    `${(r.dMin * M).toFixed(1).padStart(6)} - ${(r.dMax * M).toFixed(0).padStart(4)}  med ${(r.dMed * M).toFixed(1).padStart(6)}   ` +
    `${(r.bagMin * M).toFixed(1).padStart(6)} - ${(r.bagMax * M).toFixed(0).padStart(4)}  med ${(r.bagMed * M).toFixed(1).padStart(6)}   ` +
    `${e.toFixed(1).padStart(5)}%`)
}
const s = 0.085 / M    // il sigma di oggi, riportato a metri
console.log(`\nsigma di oggi: 0,085 per UNITA = ${s.toFixed(4)} per metro  ->  1/e a ${(1 / s).toFixed(1)} m`)
console.log('quanta luce resta alla distanza media, per qualche sigma:')
for (const sm of [0.034, 0.06, 0.10, 0.15, 0.25]) {
  const q = righe.filter(r => r.n).map(r => `${r.q.toFixed(2)}: ${(100 * Math.exp(-sm * r.bagMed * M)).toFixed(0)}%`)
  console.log(`  ${sm.toFixed(3)}/m (1/e a ${(1 / sm).toFixed(0).padStart(3)} m)   ${q.join('   ')}`)
}
