/**
 * DIAGNOSI (sola lettura): l'apertura del sito e' viva o e' una fotografia?
 *
 * Nasce da un'osservazione dell'utente guardando un provino — «la prima
 * immagine non e' un video» — e da una misura sul filmato che le da' ragione:
 * fra t=2,75 s e t=5,75 s la differenza fra fotogrammi consecutivi e' 0,00-0,05
 * livelli. Non e' poco movimento: sono fotogrammi identici.
 *
 * Restava da capire se il fermo e' del SITO o della RIPRESA (Playwright decodifica
 * i video in software, e un decodificatore lento non e' un difetto del sito).
 * Questo strumento guarda in pagina, a scorrimento ZERO, e chiede a ogni <video>
 * le sole cose che rispondono senza opinioni: se e' in pausa, a che punto sta,
 * e se quel punto AVANZA.
 *
 *   node strumenti/_apertura-viva.mjs
 */
import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'

const PORTA = Number(process.env.PORTA_COLLAUDO || 6556)
const ATTESE = (process.env.ATTESE || '0,1000,2000,4000,7000').split(',').map(Number)

await avvisaSePortaAltrui(PORTA)
const pv = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
for (let i = 0; i < 60; i++) {
  try { await fetch(`http://localhost:${PORTA}/`, { redirect: 'manual' }); break } catch {}
  await new Promise(r => setTimeout(r, 500))
}

const b = await apriBrowser({ conGpu: true })
const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })
/*
 * DOVE SI GUARDA, e la prima versione lo sbagliava: `scrollTo(0,0)` e' la cima
 * della PAGINA, che sta prima della scena. L'apertura del racconto e' la cima
 * della SEZIONE, e la sa solo `demo.js` — per questo la espone.
 */
const Q = process.env.SCROLL !== undefined ? null : Number(process.env.Q ?? 0)
await pg.evaluate(({ q, px }) => {
  if (q === null) { window.scrollTo(0, px); return }
  const n = window.__nautica
  window.scrollTo(0, (n.cimaSezione ?? 0) + q * (n.corsaRacconto ?? 0))
}, { q: Q, px: Number(process.env.SCROLL || 0) })
await pg.waitForTimeout(300)

/*
 * E LA TELA: c'e', si vede, e sta disegnando? Sono tre domande diverse, e la
 * differenza decide la cura. Una tela assente e' un problema di impaginato;
 * una tela sotto la piega e' una decisione; una tela ferma e' una scena che
 * non gira.
 */
const tela = await pg.evaluate(() => {
  const c = document.querySelector('canvas')
  if (!c) return { c_e: false }
  const r = c.getBoundingClientRect()
  const st = getComputedStyle(c)
  return {
    c_e: true,
    rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
    inVista: r.bottom > 0 && r.top < innerHeight && r.width > 0 && r.height > 0,
    opacita: st.opacity,
    visibilita: st.visibility,
    display: st.display,
    spaccato: document.querySelector('[data-spaccato]')?.dataset.spaccato ?? null,
    emersione: document.querySelector('[data-spaccato]')?.dataset.emersione ?? null
  }
})
console.log('\n  la tela: ' + JSON.stringify(tela))

const stato = () => pg.evaluate(() => ({
  scroll: window.scrollY,
  video: [...document.querySelectorAll('video')].map(v => ({
    src: (v.currentSrc || v.src || '').split('/').pop(),
    t: +v.currentTime.toFixed(3),
    pausa: v.paused,
    pronto: v.readyState,
    durata: +(v.duration || 0).toFixed(2)
  }))
}))

console.log('\n  APERTURA — a scorrimento zero, cosa fanno i <video>\n')
console.log('   attesa   ' + 'sorgente'.padEnd(22) + 'currentTime  pausa  ready')
console.log('   ' + '-'.repeat(66))
let passato = 0
for (const a of ATTESE) {
  if (a - passato > 0) await pg.waitForTimeout(a - passato)
  passato = a
  const s = await stato()
  if (!s.video.length) { console.log(`   ${String(a).padStart(5)}ms  (nessun <video> in pagina)`); continue }
  s.video.forEach((v, i) => {
    console.log(`   ${String(a).padStart(5)}ms  ${String(v.src).padEnd(22)}${v.t.toFixed(3).padStart(9)}` +
      `   ${String(v.pausa).padEnd(6)} ${v.pronto}${i === 0 ? '' : ''}`)
  })
  console.log('')
}

const fine = await stato()
console.log(`   scorrimento durante la prova: ${fine.scroll} px  (deve essere 0)`)
const fermi = fine.video.filter(v => v.pausa || v.t === 0)
console.log(fermi.length
  ? `   FERMI a fine prova: ${fermi.map(v => v.src).join(', ')}`
  : '   tutti i video hanno avanzato')
console.log('')

await b.close(); pv.kill()
