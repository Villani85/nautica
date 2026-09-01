/**
 * CONTRASTO, TABULAZIONE, FUOCO — le voci di Usability che nessuno guardava.
 *
 * ─── PERCHE'
 *
 * `collaudo-ridotto` copre `prefers-reduced-motion`, e lo copre bene. Ma
 * l'accessibilita' NEL SENSO DELLA GIURIA e' un'altra cosa: contrasto, ordine
 * di tabulazione, segno del fuoco. Sono voci di Usability, che pesa il 30%, e
 * non avevano nessun cancello.
 *
 * ─── DUE STESURE SBAGLIATE PRIMA DI QUESTA, ed e' la parte che vale
 *
 * PRIMA: risalivo l'albero cercando un `background-color` opaco e, non
 * trovandolo, ripiegavo sul bianco. Ma qui quasi tutto il testo sta SOPRA IL
 * CANVAS, che di fondo CSS non ne ha: il ripiego diventava la risposta, e per
 * il titolo usciva «1:1», cioe' inchiostro uguale a carta. Non era il sito: era
 * il metro che, non sapendo, inventava.
 *
 * SECONDA: preso il fondo dai pixel veri, uscivano trentacinque testi su
 * quarantanove, molti a 1:1. Non erano illeggibili: erano NON ANCORA RIVELATI.
 * Questo sito scopre le battute scorrendo, e giudicare a pagina ferma in cima
 * vuol dire bocciare qualcosa per non essere ancora comparso.
 *
 * QUESTA: ogni testo si giudica NEL SUO MOMENTO MIGLIORE. Si percorre il
 * racconto in dieci stazioni, si fotografa a ognuna, e per ciascun testo si
 * tiene il contrasto PIU' ALTO che raggiunge. Se al suo meglio resta sotto la
 * soglia, allora non esiste nessun istante in cui si legge: quello si' e' un
 * difetto.
 *
 * Soglie 4,5:1 (testo normale) e 3:1 (testo grande): sono WCAG 2.1 AA, non
 * numeri scelti qui.
 *
 * ─── COSA NON COPRE
 *
 * Non prova un lettore di schermo, non giudica se le etichette abbiano senso, e
 * non dice niente sul testo che compare fra una stazione e l'altra: dieci
 * stazioni sono una griglia, non un continuo.
 */
import { apriBrowser } from './browser.mjs'
import { anteprima } from './anteprima.mjs'
import { execSync } from 'node:child_process'
import { readFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/* NON '.': in CI scriverebbe dieci PNG e dieci RGB nella radice del repo, e
   `actions/upload-pages-artifact` se li porterebbe dietro. Una cartella
   temporanea sua, che il sistema pulisce da solo. */
const DOVE = process.env.SCRATCH || mkdtempSync(join(tmpdir(), 'accesso-'))
const LARG = 1280
const ALTO = 800
const STAZIONI = 10

/**
 * ─── MISURA E GRIDA, NON FERMA. Per due ragioni, e nessuna e' pigrizia.
 *
 * La prima e' la stessa dei tetti di `peso.mjs`: il committente ha deciso il
 * 1 settembre 2026 che finche' il sito non e' completo nessun numero deve
 * bloccare il lavoro, «altrimenti mi impedisce di completare il sito
 * inutilmente». Ha ragione: un sito a meta' sfonda ogni soglia tarata su cio'
 * che c'era prima.
 *
 * La seconda e' piu' specifica, e vale anche dopo. Un contrasto scarso si
 * corregge CAMBIANDO UN COLORE, e i colori di questo sito non li decido io:
 * sono tavolozza, e la tavolozza e' del committente. Un cancello che bocciasse
 * la build costringerebbe a una scelta cromatica per far tornare un numero --
 * cioe' esattamente il modo in cui uno strumento si mette a fare regia.
 *
 * Quindi qui si misura, si stampa l'elenco per esteso con i colori veri, e si
 * esce verdi. Chi legge ha davanti i numeri e decide. Per armarlo:
 * `BLOCCA_ACCESSO = true`.
 */
const BLOCCA_ACCESSO = false

const lum = (c) => {
  const v = c.map((x) => { const t = x / 255; return t <= 0.03928 ? t / 12.92 : ((t + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]
}
const rapporto = (f, s) => { const a = lum(f) + 0.05, b = lum(s) + 0.05; return a > b ? a / b : b / a }

/** In pagina: i testi VISIBILI adesso, col rettangolo di adesso. */
const RACCOGLI = () => {
  const leggi = (s) => (s.match(/[0-9.]+/g) || []).slice(0, 4).map(Number)
  const fuori = []
  for (const el of document.querySelectorAll('body *')) {
    const testo = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim())
      .map((n) => n.textContent.trim()).join(' ')
    if (!testo) continue
    const st = getComputedStyle(el)
    if (st.visibility === 'hidden' || st.display === 'none' || +st.opacity < 0.9) continue
    const r = el.getBoundingClientRect()
    if (r.width < 4 || r.height < 4 || r.bottom < 8 || r.top > innerHeight - 8) continue
    const px = parseFloat(st.fontSize)
    fuori.push({
      chiave: el.tagName + '|' + (el.className || '') + '|' + testo.slice(0, 30),
      testo: testo.slice(0, 40),
      px: +px.toFixed(0),
      soglia: (px >= 24 || (px >= 18.66 && +st.fontWeight >= 700)) ? 3.0 : 4.5,
      colore: leggi(st.color).slice(0, 3),
      r: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
    })
  }
  return fuori
}

const guai = []
const a = await anteprima()
let b
try {
  b = await apriBrowser()
  const pg = await b.newPage()
  await pg.setViewportSize({ width: LARG, height: ALTO })
  await pg.goto(a.indirizzo + '?ispeziona=1', { waitUntil: 'domcontentloaded' })
  await pg.waitForFunction(() => window.__nautica?.fotogrammi > 3, null, { timeout: 90000 })

  let cruda = null
  const pix = (x, y) => {
    if (x < 0 || y < 0 || x >= LARG || y >= ALTO) return null
    const k = (y * LARG + x) * 3
    return [cruda[k], cruda[k + 1], cruda[k + 2]]
  }
  const mediana = (v) => v.slice().sort((p, q) => p - q)[Math.floor(v.length / 2)]

  /* la fascia si prende FUORI dal rettangolo: dentro ci sono le lettere, e
     mediarle col fondo darebbe un contrasto piu' basso di quello vero */
  const fondoDi = (r) => {
    const p = []
    for (let d = 2; d <= 5; d++) {
      for (let x = r.x - d; x <= r.x + r.w + d; x += 3) {
        const s = pix(x, r.y - d); if (s) p.push(s)
        const t = pix(x, r.y + r.h + d); if (t) p.push(t)
      }
      for (let y = r.y - d; y <= r.y + r.h + d; y += 3) {
        const s = pix(r.x - d, y); if (s) p.push(s)
        const t = pix(r.x + r.w + d, y); if (t) p.push(t)
      }
    }
    return p.length < 8 ? null : [0, 1, 2].map((k) => mediana(p.map((q) => q[k])))
  }

  const corsa = await pg.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  const migliore = new Map()

  for (let k = 0; k < STAZIONI; k++) {
    await pg.evaluate((y) => scrollTo(0, y), Math.round(corsa * k / (STAZIONI - 1)))
    /* si aspetta un FOTOGRAMMA, non un tempo: la fotografia deve ritrarre lo
       stato dopo lo scorrimento, e a 2,3 fps un'attesa a orologio sbaglia */
    const n0 = await pg.evaluate(() => window.__nautica.fotogrammi)
    await pg.waitForFunction((n) => window.__nautica.fotogrammi > n + 1, n0, { timeout: 20000 }).catch(() => {})

    const testi = await pg.evaluate(RACCOGLI)
    await pg.screenshot({ path: DOVE + '/acc-' + k + '.png' })
    execSync('ffmpeg -v error -y -i "' + DOVE + '/acc-' + k + '.png" -f rawvideo -pix_fmt rgb24 "' + DOVE + '/acc-' + k + '.rgb"')
    cruda = readFileSync(DOVE + '/acc-' + k + '.rgb')

    for (const t of testi) {
      const f = fondoDi(t.r)
      if (!f) continue
      const c = rapporto(t.colore, f)
      const p = migliore.get(t.chiave)
      if (!p || c > p.c) migliore.set(t.chiave, { ...t, c: +c.toFixed(2), fondo: f, stazione: k })
    }
  }

  const scarsi = [...migliore.values()].filter((t) => t.c < t.soglia).sort((x, y) => x.c - y.c)
  console.log('  contrasto     ' + migliore.size + ' testi giudicati nel loro momento migliore su ' + STAZIONI + ' stazioni')
  console.log('                ' + scarsi.length + ' restano sotto la soglia WCAG AA anche al loro meglio')
  for (const s of scarsi.slice(0, 10)) {
    console.log('      ' + String(s.c).padStart(5) + ':1 (serve ' + s.soglia + ') ' + String(s.px).padStart(3) + 'px  ' +
                'rgb(' + s.colore + ') su rgb(' + s.fondo + ')  «' + s.testo + '»')
  }
  if (scarsi.length > 10) console.log('      ...e altri ' + (scarsi.length - 10))

  /* --- fuoco e tabulazione, in cima dove la barra e' quella vera ---------- */
  await pg.evaluate(() => scrollTo(0, 0))
  const f = await pg.evaluate(() => {
    const tab = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')]
      .filter((e) => e.tabIndex >= 0 && e.offsetParent !== null)
    const senza = []
    for (const el of tab) {
      const p = getComputedStyle(el)
      const prima = [p.outlineStyle, p.outlineWidth, p.boxShadow, p.borderColor, p.backgroundColor].join('|')
      el.focus()
      const d = getComputedStyle(el)
      if (prima === [d.outlineStyle, d.outlineWidth, d.boxShadow, d.borderColor, d.backgroundColor].join('|')) {
        senza.push(el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''))
      }
      el.blur()
    }
    return { quanti: tab.length, senza }
  })
  console.log('  tabulazione   ' + f.quanti + ' elementi raggiungibili da tastiera')
  console.log('  fuoco         ' + f.senza.length + ' senza nessun segno visibile')
  for (const s of [...new Set(f.senza)].slice(0, 6)) console.log('      ' + s)

  if (scarsi.length) guai.push(scarsi.length + ' testi sotto il contrasto WCAG AA anche nel loro momento migliore')
  if (!f.quanti) guai.push('nessun elemento raggiungibile col tasto di tabulazione')
  if (f.senza.length) guai.push(f.senza.length + ' elementi non mostrano dove sta il fuoco')
} finally {
  a.ferma()
  await b?.close()
}

const coda = () => {
  console.log('  NON VERIFICATO: un lettore di schermo, il senso delle etichette, e il testo')
  console.log('  che compare fra una stazione e l altra — dieci stazioni sono una griglia.')
}

console.log('')
if (guai.length) {
  for (const g of guai) console.log('  ' + (BLOCCA_ACCESSO ? 'ROTTO ' : 'DA VEDERE') + '  ' + g)
  if (!BLOCCA_ACCESSO) {
    console.log('')
    console.log('  CANCELLO ADDORMENTATO: non ferma nessuno. Il contrasto si corregge')
    console.log('  cambiando un colore, e la tavolozza la decide il committente — vedi')
    console.log('  BLOCCA_ACCESSO in testa al file. I numeri restano sul tavolo.')
  }
  console.log('')
  coda()
  process.exit(BLOCCA_ACCESSO ? 1 : 0)
}
console.log('  ACCESSO IN ORDINE — contrasto AA nel momento migliore, fuoco visibile ovunque.')
console.log('')
coda()
