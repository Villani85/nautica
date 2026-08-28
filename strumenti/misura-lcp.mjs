/**
 * L'LCP DEL SITO PUBBLICATO, CON LA RETE DICHIARATA.
 *
 *     node strumenti/misura-lcp.mjs [indirizzo]
 *
 * --- PERCHE' SOLO ADESSO
 *
 * Questa misura era impossibile fino a ieri: il sito non si pubblicava, e
 * `#fattura` dichiara un trattino dove promette un numero. Un trattino e'
 * onesto -- «non l'ho misurato» -- ma resta un buco proprio nella sezione che
 * punta al Developer Award.
 *
 * --- LA RETE SI DICHIARA, O IL NUMERO NON VALE
 *
 * Un LCP misurato da questa macchina su fibra non descrive nessuno. Qui la
 * rete e' STROZZATA via CDP col profilo che Lighthouse chiama «Slow 4G»:
 * 1,6 Mbit in discesa, 750 kbit in salita, 150 ms di andata e ritorno, e la
 * CPU rallentata di quattro volte. Sono i numeri che Google usa per le sue
 * misure di laboratorio, quindi confrontabili con quelli che si leggono in
 * giro -- e vanno scritti accanto al risultato, o il risultato non significa
 * niente.
 *
 * Resta una misura di LABORATORIO: non e' un telefono vero su una rete vera,
 * e il sito non deve spacciarla per tale.
 */
import { apriBrowser } from './browser.mjs'

const INDIRIZZO = process.argv[2] || 'https://villani85.github.io/nautica/'
const GIRI = Number(process.env.GIRI || 5)

// il profilo «Slow 4G» di Lighthouse, in unita' del protocollo
const RETE = { offline: false, downloadThroughput: 1.6 * 1024 * 1024 / 8,
               uploadThroughput: 750 * 1024 / 8, latency: 150 }
const CPU = 4

const browser = await apriBrowser({ conGpu: true })
const misure = []
for (let i = 0; i < GIRI; i++) {
  /* `RIDOTTO=1` chiede la preferenza di movimento ridotto, che SPEGNE
     l'entrata: serve a sapere se e' l'animazione a spostare il candidato LCP.
     Un'entrata che ridisegna il titolo per un secondo puo' far scivolare la
     misura anche quando a schermo tutto e' gia' li'. */
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    reducedMotion: process.env.RIDOTTO === '1' ? 'reduce' : 'no-preference'
  })
  const pg = await ctx.newPage()
  const cdp = await ctx.newCDPSession(pg)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', RETE)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU })
  await pg.goto(INDIRIZZO, { waitUntil: 'load', timeout: 120000 })
  // l'LCP si stabilizza dopo l'ultimo elemento candidato: si aspetta un po'
  // e si prende l'ULTIMO, che e' quello che conta
  await pg.waitForTimeout(6000)
  const r = await pg.evaluate(() => new Promise((res) => {
    let lcp = 0
    new PerformanceObserver((l) => { for (const e of l.getEntries()) lcp = e.startTime })
      .observe({ type: 'largest-contentful-paint', buffered: true })
    setTimeout(() => {
      const nav = performance.getEntriesByType('navigation')[0]
      res({ lcp: Math.round(lcp), fcp: Math.round((performance.getEntriesByName('first-contentful-paint')[0] || {}).startTime || 0),
            dcl: Math.round(nav ? nav.domContentLoadedEventEnd : 0) })
    }, 400)
  }))
  misure.push(r)
  console.log(`  giro ${i + 1}: LCP ${r.lcp} ms · FCP ${r.fcp} ms · DOM ${r.dcl} ms`)
  await ctx.close()
}
await browser.close()

const v = misure.map(m => m.lcp).sort((a, b) => a - b)
const mediana = v[Math.floor(v.length / 2)]
console.log(`\nLCP mediano su ${GIRI} giri: ${mediana} ms   (da ${v[0]} a ${v[v.length - 1]})`)
console.log(`rete dichiarata: 1,6 Mbit/s giu, 750 kbit/s su, 150 ms RTT, CPU x${CPU}`)
console.log(`indirizzo: ${INDIRIZZO}`)
