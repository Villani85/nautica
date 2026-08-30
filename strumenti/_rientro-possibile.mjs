/**
 * DIAGNOSI (sola lettura): tornando dalle persone con la SEZIONE APERTA, si
 * vedono ancora?
 *
 * NON e' un cancello e non entra nella suite. Risponde a una sola domanda, che
 * e' quella che blocca la traversata world-space (`ciao2.md` §3.4).
 *
 * Il finale dovrebbe tornare alle due persone volando, invece che con un
 * filmato. Il brief chiede di **attraversare la sezione e salire**, cioe' di
 * tornare CON IL TAGLIO ANCORA APERTO. Ma il taglio porta via la meta' di
 * dritta dello scafo, e la fotografia del salone sta dentro quella meta'.
 *
 * Se il taglio se la porta via, la coreografia non e' una scelta: il rientro
 * DEVE richiudere la sezione, e il desiderio del brief e' impossibile come
 * scritto. Se invece la coppia resta, allora la scelta e' davvero libera ed e'
 * del committente.
 *
 * La domanda e' geometrica, quindi si risponde con una misura e non con
 * un'opinione. Si porta la camera davanti al salone -- ricavando dove sta dal
 * suo stesso ingombro, non da numeri scritti a mano -- una volta con la sezione
 * chiusa e una con la sezione aperta, e si contano i pixel della fotografia.
 */
import { apriBrowser } from './browser.mjs'
import { spawn } from 'node:child_process'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'

const PORTA = process.env.PORTA_COLLAUDO || 6950
await avvisaSePortaAltrui(PORTA)

const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
for (let i = 0; i < 60; i++) {
  try { await fetch(`http://localhost:${PORTA}/`, { redirect: 'manual' }); break } catch {}
  await new Promise(r => setTimeout(r, 500))
}

const browser = await apriBrowser({ conGpu: true })
const pg = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1&senzaFilmato=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })
await pg.waitForTimeout(2500)

/**
 * --- PRIMA SI APRE LA SEZIONE, POI SI GUARDA
 *
 * TERZO DIFETTO DI IDENTITA' DI QUESTO STRUMENTO, e i primi due li ha presi il
 * suo stesso referto. Misuravo a pagina ferma sull'inizio, dove `spaccato` vale
 * ZERO: il taglio era gia' chiuso. Quindi «con la sezione aperta» e «con la
 * sezione chiusa» erano due volte la stessa condizione, e la differenza dello
 * 0,0% non voleva dire «il taglio non la tocca» -- voleva dire «non ho mai
 * aperto niente».
 *
 * Si va dove il sito la apre davvero: `taglio` vive fra il 64% e il 100% della
 * corsa del racconto, quindi al 95% lo spaccato e' pieno. Ci si arriva con un
 * salto solo, usando la corsa che `demo.js` espone.
 */
const aperto = await pg.evaluate(async () => {
  const n = window.__nautica
  if (n.corsaRacconto === undefined) return null
  scrollTo({ top: Math.round(n.cimaSezione + 0.95 * n.corsaRacconto), behavior: 'instant' })
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  return { p: n.p, costante: (typeof n.sezione === "function" ? n.sezione().costante : (n.sezione ? n.sezione.costante : null)) }
})
if (aperto === null) {
  console.error('  ROTTO  `__nautica.corsaRacconto` non esiste: senza la corsa non so dove aprire il taglio')
  process.exit(2)
}
await pg.waitForTimeout(1500)
console.log(`\n  portato al ${(aperto.p * 100).toFixed(0)}% della corsa; costante del piano di sezione ${aperto.costante}`)

const r = await pg.evaluate(async () => {
  const n = window.__nautica
  const THREE = { }
  const t = n.render.domElement
  const c = document.createElement('canvas'); c.width = t.width; c.height = t.height
  const x = c.getContext('2d')
  const leggi = () => {
    n.render.render(n.scena, n.camera)
    x.clearRect(0, 0, c.width, c.height)
    x.drawImage(t, 0, 0)
    return x.getImageData(0, 0, c.width, c.height).data
  }
  const diff = (a, b) => {
    let q = 0
    for (let i = 0; i < a.length; i += 4) {
      const d = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) +
                Math.abs(a[i + 2] - b[i + 2]) + Math.abs(a[i + 3] - b[i + 3])
      if (d > 12) q++
    }
    return q
  }

  /* --- il salone: dove sta, ricavato dal suo ingombro --- */
  let radice = null
  n.scena.traverse(o => { if (!radice && (o.name === 'SALONE3D' || o.nome === 'SALONE3D')) radice = o })
  if (!radice) return { rotto: 'nessun nodo SALONE3D in scena' }
  const mesh = []
  radice.traverse(o => { if (o.isMesh && o.material) mesh.push(o) })
  if (!mesh.length) return { rotto: 'SALONE3D non ha mesh' }

  const box = new (Object.getPrototypeOf(radice).constructor === Object ? Object : Object)()
  /* si usa la Box3 di three passando per la geometria: la si raggiunge da un
     oggetto qualunque della scena, senza importare nulla */
  const B3 = n.scena.constructor // non serve: si calcola a mano
  let minX = Infinity, minY = Infinity, minZ = Infinity
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity
  const v = { x: 0, y: 0, z: 0 }
  for (const m of mesh) {
    const g = m.geometry
    if (!g || !g.attributes || !g.attributes.position) continue
    const pos = g.attributes.position
    m.updateWorldMatrix(true, false)
    const e = m.matrixWorld.elements
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i)
      const wx = e[0] * px + e[4] * py + e[8] * pz + e[12]
      const wy = e[1] * px + e[5] * py + e[9] * pz + e[13]
      const wz = e[2] * px + e[6] * py + e[10] * pz + e[14]
      if (wx < minX) minX = wx; if (wx > maxX) maxX = wx
      if (wy < minY) minY = wy; if (wy > maxY) maxY = wy
      if (wz < minZ) minZ = wz; if (wz > maxZ) maxZ = wz
    }
  }
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, cz = (minZ + maxZ) / 2
  const largo = maxX - minX, alto = maxY - minY

  /* --- si mette la camera davanti alla fotografia, a distanza da inquadrarla --- */
  const fov = n.camera.fov * Math.PI / 180
  const dist = (alto / 2) / Math.tan(fov / 2) * 1.15
  const salvata = { x: n.camera.position.x, y: n.camera.position.y, z: n.camera.position.z }

  const misura = () => {
    /* i pixel del salone: si nasconde e si guarda cosa cambia */
    const pieno = leggi()
    const spente = []
    mesh.forEach(o => { if (o.visible) { spente.push(o); o.visible = false } })
    const senza = leggi()
    spente.forEach(o => { o.visible = true })
    return diff(pieno, senza)
  }

  /**
   * --- IL SALONE VA RIACCESO PER POTERLO MISURARE
   *
   * QUARTO DIFETTO DI IDENTITA' DI QUESTO STRUMENTO, ed e' quello che ha
   * prodotto il risultato piu' utile.
   *
   * Aperta la sezione, la fotografia leggeva ZERO pixel in tutte e due le
   * condizioni. Non era il taglio: **il sito spegne il salone**. Misurato:
   *
   *      p = 5%    SALONE3D visibile   4 mesh su 4
   *      p = 30%   SPENTO              0 su 4
   *      p = 60%   SPENTO              0 su 4
   *      p = 95%   SPENTO              0 su 4
   *
   * Dal 30% della corsa in poi quel gruppo ha `visible = false`. Non e' fuori
   * quadro: e' proprio spento, e con lui i decodificatori -- una scelta voluta,
   * chiesta da una revisione per la batteria dei telefoni.
   *
   * **Ed e' un secondo ostacolo al rientro world-space che `ciao2.md` §3.4 non
   * elencava.** Per tornare volando dalle due persone non basta una risalita
   * indipendente dallo spaccato: bisogna anche tenere vivo il salone fino alla
   * fine, cioe' due decodificatori accesi per tutta la corsa. Quella e' una
   * decisione, non un dettaglio.
   *
   * Qui lo si riaccende solo per il tempo della misura: e' una diagnosi, e la
   * domanda che deve rispondere -- il taglio se la porta via? -- e' geometrica
   * e non dipende da chi ha acceso cosa.
   */
  const spentiPrima = []
  for (let o = radice; o; o = o.parent) if (o.visible === false) { spentiPrima.push(o); o.visible = true }
  radice.traverse(o => { if (o.visible === false) { spentiPrima.push(o); o.visible = true } })

  /* la camera guarda la fotografia dal lato da cui la si guarda nel sito:
     da poppa, cioe' da z maggiore */
  n.camera.position.set(cx, cy, cz + dist)
  n.camera.lookAt(cx, cy, cz)
  n.camera.updateMatrixWorld(true)

  /**
   * --- I PIANI DI TAGLIO STANNO SUI MATERIALI, NON SUL RENDERER
   *
   * DIFETTO DELLA PRIMA VERSIONE DI QUESTO STRUMENTO, e si e' visto solo
   * perche' il referto stampava quanti piani aveva trovato: ZERO. Leggevo
   * `render.clippingPlanes`, che e' il ritaglio GLOBALE; questo sito usa il
   * ritaglio LOCALE (`localClippingEnabled = true`) e appende i piani ai
   * materiali dello scafo, della sovrastruttura e delle macchine.
   *
   * Con zero piani in mano non spegnevo niente, e le due misure -- «sezione
   * aperta» e «sezione chiusa» -- erano lo stesso fotogramma contato due
   * volte. Il risultato era una differenza dello 0,0% e la conclusione
   * rassicurante «il taglio non la tocca». Un metro rotto non da' errore, da'
   * un numero: quello ne dava uno, ed era pure incoraggiante.
   *
   * Si raccolgono i piani veri girando i materiali della scena.
   */
  const piani = []
  n.scena.traverse(o => {
    if (!o.material) return
    for (const m of [].concat(o.material)) {
      for (const pl of (m.clippingPlanes || [])) if (!piani.includes(pl)) piani.push(pl)
    }
  })
  const costanti = piani.map(p => p.constant)

  const primaDelle = piani.map(p => p.constant)
  const conTaglio = misura()

  /* si chiude il taglio spostando i piani fuori dalla scena: con la costante
     enorme il semispazio tenuto contiene tutto, cioe' non si taglia piu' niente */
  piani.forEach(p => { p.constant = 1e6 })
  const senzaTaglio = misura()
  piani.forEach((p, i) => { p.constant = costanti[i] })

  spentiPrima.forEach(o => { o.visible = false })
  n.camera.position.set(salvata.x, salvata.y, salvata.z)
  n.camera.updateMatrixWorld(true)

  return {
    quadro: c.width * c.height,
    conTaglio, senzaTaglio,
    piani: piani.length,
    costanti: primaDelle.map(v => +v.toFixed(3)),
    riaccesi: spentiPrima.length,
    ingombro: { largo: +largo.toFixed(2), alto: +alto.toFixed(2) },
    centro: [+cx.toFixed(2), +cy.toFixed(2), +cz.toFixed(2)],
    distanza: +dist.toFixed(2)
  }
})

await browser.close(); preview.kill()

if (r.rotto) { console.error('  ROTTO  ' + r.rotto); process.exit(2) }
if (!r.piani) {
  console.error('\n  ROTTO  nessun piano di taglio trovato sui materiali: senza quelli le due')
  console.error('         misure sono lo stesso fotogramma contato due volte, e questo')
  console.error('         strumento non puo dire niente. Non fidarsi del numero che segue.')
  process.exit(2)
}

const pc = (v) => (100 * v / r.quadro).toFixed(2) + '%'
console.log('\n  tornare dalle persone con la sezione aperta: si vedono?')
console.log(`  la fotografia del salone e larga ${r.ingombro.largo} e alta ${r.ingombro.alto} unita,`)
console.log(`  centro ${r.centro.join(', ')} · camera a ${r.distanza} unita di fronte`)
console.log(`  piani di taglio trovati sui materiali: ${r.piani} · costanti ${r.costanti.join(', ')}`)
console.log(`  nodi del salone riaccesi per la misura: ${r.riaccesi} (il sito li spegne dal 30% della corsa)`)
console.log('')
console.log(`  con la SEZIONE APERTA   ${String(r.conTaglio).padStart(7)} px  (${pc(r.conTaglio)} del quadro)`)
console.log(`  con la sezione CHIUSA   ${String(r.senzaTaglio).padStart(7)} px  (${pc(r.senzaTaglio)} del quadro)`)
/**
 * --- E IL VERDETTO DEVE SAPER LEGGERE ANCHE UN GUADAGNO
 *
 * La prima versione calcolava `1 - conTaglio / senzaTaglio` e lo chiamava
 * «perso». Con il taglio aperto la fotografia si vede DI PIU', quindi quel
 * numero e' uscito **-559,7%** -- e il ramo `< 2` l'ha stampato come «il taglio
 * non la tocca». Conclusione giusta per caso, da un confronto che non prevedeva
 * il proprio esito.
 *
 * Si dice il rapporto, che regge in tutti e due i versi.
 */
const rapporto = r.senzaTaglio > 0 ? r.conTaglio / r.senzaTaglio : null
console.log('')
if (r.conTaglio === 0 && r.senzaTaglio === 0) {
  console.log('  la fotografia non si vede in nessuno dei due casi: la prova non dice niente.')
  process.exit(2)
}
if (rapporto === null) {
  console.log('  a scafo intero non si vede affatto, con il taglio si: il taglio e cio che la MOSTRA.')
} else if (rapporto > 1.2) {
  console.log(`  IL TAGLIO NON LA PORTA VIA: e cio che la MOSTRA (${rapporto.toFixed(1)} volte piu pixel).`)
  console.log('  A scafo intero la fiancata la copre; aperto il taglio, la si guarda da fuori.')
  console.log('  Il rientro a sezione aperta non e solo possibile: e l unico che funziona da fuori.')
} else if (rapporto > 0.9) {
  console.log(`  il taglio la lascia com e (${(100 * rapporto).toFixed(0)}%): la scelta e libera.`)
} else {
  console.log(`  il taglio ne toglie il ${(100 * (1 - rapporto)).toFixed(1)}%: il rientro a sezione`)
  console.log('  aperta mostrerebbe una coppia parziale.')
}
console.log('')
console.log('  MA ATTENZIONE, e vale piu del risultato di sopra: per fare questa misura ho')
console.log('  dovuto RIACCENDERE il salone, che il sito spegne dal 30% della corsa. Tornare')
console.log('  volando dalle due persone non chiede solo una risalita indipendente dallo')
console.log('  spaccato: chiede di tenere vivi due decodificatori fino alla fine, e quella')
console.log('  e una decisione, non un dettaglio.')
process.exit(0)
