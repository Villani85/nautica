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
 * ─── TRE STESURE SBAGLIATE PRIMA DI QUESTA, ed e' la parte che vale
 *
 * PRIMA: risalivo l'albero cercando un `background-color` opaco e, non
 * trovandolo, ripiegavo sul bianco. Ma qui quasi tutto il testo sta sopra il
 * CANVAS, che di fondo CSS non ne ha: il ripiego diventava la risposta, e per
 * il titolo usciva «1:1», inchiostro uguale a carta. Non era il sito: era il
 * metro che, non sapendo, inventava.
 *
 * SECONDA: preso il fondo dai pixel veri, uscivano 35 testi su 49, molti a 1:1.
 * Non erano illeggibili: erano NON ANCORA RIVELATI. Questo sito scopre le
 * battute scorrendo, e giudicare a pagina ferma in cima vuol dire bocciare
 * qualcosa per non essere ancora comparso.
 *
 * TERZA: giudicavo ogni testo nel suo MOMENTO MIGLIORE. Meglio, ma una
 * revisione ha visto il buco: approva lo stato finale e salta il transito. Un
 * testo fermo a mezza opacita' per un'intera sezione passerebbe, perche' da
 * qualche parte raggiunge il suo valore buono.
 *
 * QUESTA. Tre correzioni, tutte da quella revisione, e tutte giuste.
 *
 * 1. IL PEGGIO, NON IL MEGLIO — ma solo dove il testo e' DICHIARATAMENTE in
 *    scena. Si tiene il contrasto MINIMO fra tutti i fotogrammi in cui quel
 *    testo sta sullo schermo con opacita' cumulativa >= OPACITA_IN_SCENA. Una
 *    dissolvenza di duecento millisecondi non e' una violazione e resta fuori;
 *    un testo fermo a mezza opacita' per una sezione intera ci entra, ed e' il
 *    caso che conta. La soglia di opacita' e' DICHIARATA qui sotto.
 *
 *    E l'opacita' si conta CUMULATIVA, risalendo i genitori: un contenitore a
 *    0,2 rende invisibile un figlio che si dichiara a 1.
 *
 * 2. IL CONTRASTO NON E' UNA MEDIA. Prima prendevo la mediana di una fascia
 *    fuori dal riquadro. Ma il numero che serve e' fra INCHIOSTRO e CARTA, e
 *    dentro il riquadro ci sono entrambi: si prendono i percentili di luminanza
 *    (5o e 95o), che danno il piu' scuro e il piu' chiaro senza farsi ingannare
 *    da qualche pixel di antialiasing. Su un font sottile la media sottostima,
 *    su un grassetto sovrastima; i percentili no.
 *
 * 3. LO SFONDO NON E' UN COLORE, E' UNA TELA CHE SI MUOVE. Il mare cambia, il
 *    rollio cambia. Un cancello che misura UN fotogramma su una tela animata e'
 *    verde per fortuna, non per costruzione — ed e' esattamente la famiglia di
 *    difetti che questo repo sta cacciando. Quindi a ogni stazione si guardano
 *    piu' fotogrammi DISTINTI e si tiene il peggiore.
 *
 * ─── LA SOGLIA E' 4,5 DAPPERTUTTO, E NON E' UNA SEMPLIFICAZIONE
 *
 * WCAG 2.1 AA chiede 4,5:1, che scendono a 3:1 per il «testo grande» (>= 24px,
 * o >= 18,66px in grassetto). Qui quel ramo non serve, ed e' un fatto contato:
 * `src/stile.css` dichiara 31 corpi in pixel e il piu' grande e' 15px. Nessun
 * testo di questo sito qualifica come grande.
 *
 * Lo stesso conteggio dice un'altra cosa, che NON e' un problema di contrasto e
 * che quindi nessun cancello di contrasto trovera' mai: c'e' un corpo a 7px,
 * tre a 8px e cinque a 9px, su un sito che punta al 30% di Usability. Questo
 * file lo riporta perche' l'ha visto, non perche' sappia giudicarlo.
 *
 * ─── COSA NON COPRE, e va detto
 *
 * Non prova un lettore di schermo e non giudica se le etichette abbiano senso.
 * Non copre WCAG 1.4.11, che chiede 3:1 per i COMPONENTI non testuali — bordi
 * dei pulsanti, cursori, maniglie: questo sito ne ha, servirebbe un cancello
 * suo che sappia dove finisce un bordo e comincia il fondo, e qui non lo si
 * finge misurando testo.
 * E dieci stazioni sono una griglia: fra una e l'altra puo' passare qualcosa.
 */
import { apriBrowser } from './browser.mjs'
import { anteprima } from './anteprima.mjs'
import { execSync } from 'node:child_process'
import { readFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/* NON '.': in CI scriverebbe le fotografie nella radice del repo, e
   `upload-pages-artifact` se le porterebbe dietro. */
const DOVE = process.env.SCRATCH || mkdtempSync(join(tmpdir(), 'accesso-'))
const LARG = 1280
const ALTO = 800
const STAZIONI = 10
/** Quanti fotogrammi distinti per stazione: la tela sotto il testo si muove. */
const FOTOGRAMMI = 3
/** Sotto questa opacita' un testo sta transitando, non stando: non si giudica. */
const OPACITA_IN_SCENA = 0.9
/** WCAG 2.1 AA. Uguale per tutti: qui non esiste «testo grande» — vedi testata. */
const SOGLIA = 4.5

/**
 * ─── MISURA E GRIDA, NON FERMA. Per due ragioni, e nessuna e' pigrizia.
 *
 * La prima e' la stessa dei tetti di `peso.mjs`: il committente ha deciso il
 * 1 settembre 2026 che finche' il sito non e' completo nessun numero deve
 * bloccare il lavoro, «altrimenti mi impedisce di completare il sito
 * inutilmente».
 *
 * La seconda vale anche dopo. Un contrasto scarso si corregge CAMBIANDO UN
 * COLORE, e i colori di questo sito sono tavolozza: li decide il committente.
 * Un cancello che bocciasse la build costringerebbe a una scelta cromatica per
 * far tornare un numero — cioe' uno strumento che si mette a fare regia.
 *
 * Per armarlo: `BLOCCA_ACCESSO = true`.
 */
const BLOCCA_ACCESSO = false

const lum = (c) => {
  const v = c.map((x) => { const t = x / 255; return t <= 0.03928 ? t / 12.92 : ((t + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]
}

/** In pagina: i testi IN SCENA adesso, col rettangolo di adesso. */
const RACCOGLI = (opacitaMinima) => {
  const fuori = []
  for (const el of document.querySelectorAll('body *')) {
    const testo = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim())
      .map((n) => n.textContent.trim()).join(' ')
    if (!testo) continue
    const st = getComputedStyle(el)
    if (st.visibility === 'hidden' || st.display === 'none') continue
    let o = 1
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) o *= +getComputedStyle(n).opacity
    if (o < opacitaMinima) continue
    const r = el.getBoundingClientRect()
    if (r.width < 4 || r.height < 4 || r.bottom < 8 || r.top > innerHeight - 8) continue
    fuori.push({
      chiave: el.tagName + '|' + (el.className || '') + '|' + testo.slice(0, 30),
      testo: testo.slice(0, 40),
      px: +parseFloat(st.fontSize).toFixed(1),
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

  /**
   * Il contrasto DENTRO il riquadro, per percentili di luminanza. Il 5o e il
   * 95o danno inchiostro e carta senza che un pixel di antialiasing o un
   * singolo punto acceso spostino la risposta.
   */
  const contrastoDi = (r) => {
    const L = []
    for (let y = Math.max(0, r.y); y < Math.min(ALTO, r.y + r.h); y++) {
      for (let x = Math.max(0, r.x); x < Math.min(LARG, r.x + r.w); x++) {
        const k = (y * LARG + x) * 3
        L.push(lum([cruda[k], cruda[k + 1], cruda[k + 2]]))
      }
    }
    if (L.length < 40) return null
    L.sort((p, q) => p - q)
    const scuro = L[Math.floor(L.length * 0.05)]
    const chiaro = L[Math.floor(L.length * 0.95)]
    return (chiaro + 0.05) / (scuro + 0.05)
  }

  const fotografa = async (nome) => {
    await pg.screenshot({ path: DOVE + '/' + nome + '.png' })
    execSync('ffmpeg -v error -y -i "' + DOVE + '/' + nome + '.png" -f rawvideo -pix_fmt rgb24 "' + DOVE + '/' + nome + '.rgb"')
    cruda = readFileSync(DOVE + '/' + nome + '.rgb')
  }

  const corsa = await pg.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  const peggiore = new Map()
  let corpoMinimo = Infinity
  let quantiFotogrammi = 0

  for (let k = 0; k < STAZIONI; k++) {
    await pg.evaluate((y) => scrollTo(0, y), Math.round(corsa * k / (STAZIONI - 1)))
    for (let j = 0; j < FOTOGRAMMI; j++) {
      /* si aspetta un FOTOGRAMMA NUOVO, non un tempo: a 2,3 fps un'attesa a
         orologio fotograferebbe due volte la stessa tela */
      const n0 = await pg.evaluate(() => window.__nautica.fotogrammi)
      await pg.waitForFunction((n) => window.__nautica.fotogrammi > n + 1, n0, { timeout: 20000 }).catch(() => {})

      const testi = await pg.evaluate(RACCOGLI, OPACITA_IN_SCENA)
      await fotografa('acc-' + k + '-' + j)
      quantiFotogrammi++

      for (const t of testi) {
        if (t.px < corpoMinimo) corpoMinimo = t.px
        const c = contrastoDi(t.r)
        if (c == null) continue
        const p = peggiore.get(t.chiave)
        /* IL PEGGIO, non il meglio: e' la correzione che vale */
        if (!p || c < p.c) peggiore.set(t.chiave, { ...t, c: +c.toFixed(2), stazione: k })
      }
    }
  }

  const scarsi = [...peggiore.values()].filter((t) => t.c < SOGLIA).sort((x, y) => x.c - y.c)
  console.log('  contrasto     ' + peggiore.size + ' testi, ciascuno al suo PEGGIO su ' + quantiFotogrammi + ' fotogrammi')
  console.log('                (' + STAZIONI + ' stazioni x ' + FOTOGRAMMI + ', solo con opacita cumulativa >= ' + OPACITA_IN_SCENA + ')')
  console.log('                ' + scarsi.length + ' sotto ' + SOGLIA + ':1, la soglia WCAG 2.1 AA')
  for (const s of scarsi.slice(0, 12)) {
    console.log('      ' + String(s.c).padStart(5) + ':1  ' + String(s.px).padStart(4) + 'px  (stazione ' + s.stazione + ')  «' + s.testo + '»')
  }
  if (scarsi.length > 12) console.log('      ...e altri ' + (scarsi.length - 12))
  console.log('  corpo minimo  ' + (corpoMinimo === Infinity ? 'n/d' : corpoMinimo + 'px reso a schermo'))

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

  if (scarsi.length) guai.push(scarsi.length + ' testi sotto ' + SOGLIA + ':1 nel loro momento PEGGIORE')
  if (!f.quanti) guai.push('nessun elemento raggiungibile col tasto di tabulazione')
  if (f.senza.length) guai.push(f.senza.length + ' elementi non mostrano dove sta il fuoco')
} finally {
  a.ferma()
  await b?.close()
}

const coda = () => {
  console.log('  NON VERIFICATO: un lettore di schermo, il senso delle etichette, e WCAG')
  console.log('  1.4.11 — i 3:1 dei componenti non testuali (bordi, cursori, maniglie),')
  console.log('  che servirebbe un cancello suo e qui non si finge misurando testo.')
}

console.log('')
if (guai.length) {
  for (const g of guai) console.log('  ' + (BLOCCA_ACCESSO ? 'ROTTO    ' : 'DA VEDERE') + '  ' + g)
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
console.log('  ACCESSO IN ORDINE — contrasto AA anche al peggio, fuoco visibile ovunque.')
console.log('')
coda()
