/**
 * COLLAUDO D4 — LA FASCIA DI GALLEGGIAMENTO SEGUE L'ONDA VERA?
 *
 * ─── LA DOMANDA
 *
 * La fascia scura dipinta sullo scafo (`GALLEGGIAMENTO` in `materiali.js`) sta
 * a una quota FISSA nello spazio locale della nave (`vLocale.y`). La nave non
 * ha moto verticale (`heave`): una volta emersa, `nave.position.y` non si
 * tocca piu' — solo `nave.rotation.z` (il rollio) la fa oscillare. Il mare,
 * invece, oscilla per conto suo (`acqua.anima`). La domanda e': il confine
 * VISIBILE fra scafo e acqua (dove l'acqua opaca comincia a coprire lo scafo)
 * si sposta con l'onda vera, o resta fermo mentre il mare sale e scende sotto?
 *
 * ─── PERCHE' QUESTO METODO, e non i pixel dello schermo
 *
 * Il metodo suggerito nell'incarico e' leggere una colonna di pixel e trovare
 * un salto di luminanza. `registro-guscio.mjs` spiega perche' la tela WebGL
 * NON si rilegge con `drawImage` (torna nera senza `preserveDrawingBuffer`):
 * la cura li' e' Playwright + ffmpeg sulla schermata compositata.
 *
 * Qui si puo' evitare tutta quella catena: `window.__nautica.chi(u, v)` fa il
 * lavoro con un RAGGIO CONTRO LA SCENA VERA, non contro un pixel — e ritorna
 * il punto 3D colpito (`punto`, in unita' di scena). E' lo stesso confine che
 * un occhio vedrebbe (nearest-hit fra scafo e acqua), ma letto dalla geometria
 * invece che dai livelli di grigio: niente `preserveDrawingBuffer`, niente
 * ffmpeg, niente rumore di codifica JPEG/PNG. Il confine fra "si vede lo
 * scafo" e "si vede acqua" a una colonna dello schermo e' un fatto binario
 * (quale mesh il raggio incontra per primo), quindi ci si arriva per bisezione
 * su `v` invece che cercando un gradiente.
 *
 * ─── COSA SI CONFRONTA
 *
 * Due colonne (bisezione su `v`, `u` fisso), campionate ripetutamente MENTRE
 * IL TEMPO SCORRE (nessun `?fermo`: qui serve il movimento):
 *
 *   colonna SULLO SCAFO     confine scafo -> acqua (dove l'acqua opaca comincia
 *                           a mangiarsi lo scafo). Si legge la quota mondiale
 *                           (`punto[1]`) del punto d'acqua appena sotto il
 *                           confine: e' l'altezza a cui il mare sta occludendo
 *                           lo scafo IN QUEL MOMENTO.
 *   colonna LONTANA         confine cielo -> acqua, cioe' la superficie del
 *                           mare vera in quel punto (nessuno scafo a mezzo).
 *                           Stessa lettura: quota mondiale del punto d'acqua.
 *
 * Se la fascia "segue" l'onda, le due quote devono oscillare in modo
 * paragonabile (la nave affonda e riemerge insieme al mare che la circonda).
 * Se e' dipinta a un'altezza costante e la nave non ha moto verticale, la
 * quota sullo scafo puo' cambiare SOLO per effetto del rollio (rotazione, non
 * traslazione) mentre la quota lontana cambia con l'onda vera: l'escursione
 * della prima deve restare molto piu' piccola di quella della seconda.
 *
 *     node strumenti/collaudo-galleggiamento.mjs
 */
import { apriBrowser } from './browser.mjs'

const BASE = 'http://localhost:4173/nautica/'
const P_MARE_ALTO = 0.45   // dentro 'calma' (0.50-0.64)? no: dentro 'invito'
                            // (0.38-0.50), DOPO che 'mare' (0.26-0.38) e'
                            // finito e PRIMA che 'taglio' (0.64-1.00) cominci:
                            // mare al suo massimo raggiungibile, scafo intero,
                            // visto da fuori.
const P_MARE_PIATTO = 0.20 // dentro 'emerge' (0.15-0.26): la nave e' gia'
                            // emersa ma la rampa 'mare' non e' ancora
                            // cominciata (parte a 0.26) -> mare = 0.

async function vaiA (pg, p) {
  await pg.evaluate((pp) => {
    const n = window.__nautica
    scrollTo(0, n.cimaSezione + pp * n.corsaRacconto)
  }, p)
  return pg.waitForFunction(
    (pp) => Math.abs((window.__nautica.p ?? -1) - pp) < 0.003,
    p, { timeout: 8000 }
  ).then(() => true).catch(() => false)
}

/** Nearest-hit a (u,v): 'acqua' | 'solido' | 'cielo', + quota mondiale se c'e'. */
function classificaEspr () {
  // stringa valutata IN PAGINA — vedi uso sotto con pg.evaluate
}

async function nearestHit (pg, u, v) {
  return pg.evaluate(([u, v]) => {
    const r = window.__nautica.chi(u, v, { quante: 3 })
    if (!r.length) return { tipo: 'cielo', y: null }
    const h = r[0]
    const acqua = h.materiale === 'pelo' || h.materiale === 'velo'
    return { tipo: acqua ? 'acqua' : 'solido', y: h.punto[1], nome: h.nome, materiale: h.materiale }
  }, [u, v])
}

/**
 * Bisezione su v fra due estremi di classe diversa. Torna la quota mondiale
 * (`y`) del punto D'ACQUA al confine — cioe' quanto vale il mare li', appena
 * sotto/sopra il salto. `null` se ai due estremi dati non c'e' un salto della
 * forma attesa (bracket assente): NON si inventa un confine che non c'e'.
 */
async function confineY (pg, u, vLo, vHi, atteso) { // atteso = ['solido','acqua'] o ['cielo','acqua']
  let lo = await nearestHit(pg, u, vLo)
  let hi = await nearestHit(pg, u, vHi)
  if (lo.tipo !== atteso[0] || hi.tipo !== atteso[1]) return null
  for (let i = 0; i < 14; i++) {
    const vm = (vLo + vHi) / 2
    const m = await nearestHit(pg, u, vm)
    if (m.tipo === atteso[0]) { vLo = vm; lo = m } else { hi = m; vHi = vm }
  }
  // il punto sul lato ACQUA del confine e' la lettura che vogliamo
  return atteso[1] === 'acqua' ? hi.y : lo.y
}

async function main () {
  const browser = await apriBrowser({ conGpu: true })
  const pg = await browser.newPage()
  await pg.setViewportSize({ width: 1280, height: 800 })
  await pg.goto(BASE + '?ispeziona=1', { waitUntil: 'load', timeout: 45000 })
  await pg.waitForFunction(() => window.__nautica?.stato, null, { timeout: 30000 })

  console.log('\nCOLLAUDO D4 — la fascia di galleggiamento segue l onda vera?\n')

  async function misura (pTarget, etichetta) {
    const arrivato = await vaiA(pg, pTarget)
    if (!arrivato) { console.log(`  ${etichetta}: NON MISURABILE — non si e raggiunta p=${pTarget}`); return null }
    await pg.waitForFunction(() => window.__nautica.fotogrammi > 5, null, { timeout: 10000 }).catch(() => {})

    const mare = await pg.evaluate(() => window.__nautica.stato.mare)

    /** Trova, ai margini dello schermo, una colonna scafo e una acqua lontana. */
    // colonna sullo scafo: al centro (la ripresa larga inquadra la nave in mezzo)
    const uScafo = 0.50
    // colonna lontana: bordo dello schermo, lontano dallo scafo
    let uAcqua = null
    for (const cand of [0.06, 0.94, 0.12, 0.88]) {
      const alto = await nearestHit(pg, cand, 0.30)
      const basso = await nearestHit(pg, cand, 0.70)
      if (alto.tipo === 'cielo' && basso.tipo === 'acqua') { uAcqua = cand; break }
    }
    if (uAcqua === null) {
      console.log(`  ${etichetta}: NON MISURABILE — nessuna colonna lontana con cielo sopra e acqua sotto`)
      return null
    }

    const N = 20
    const scafoY = [], acquaY = []
    for (let i = 0; i < N; i++) {
      const y1 = await confineY(pg, uScafo, 0.30, 0.72, ['solido', 'acqua'])
      const y2 = await confineY(pg, uAcqua, 0.30, 0.72, ['cielo', 'acqua'])
      if (y1 !== null) scafoY.push(y1)
      if (y2 !== null) acquaY.push(y2)
      await pg.waitForTimeout(250) // il tempo scorre: qui serve il moto, niente ?fermo
    }

    if (scafoY.length < N * 0.6 || acquaY.length < N * 0.6) {
      console.log(`  ${etichetta}: NON MISURABILE — bracket perso troppe volte (scafo ${scafoY.length}/${N}, acqua ${acquaY.length}/${N})`)
      return null
    }

    const escursione = (a) => Math.max(...a) - Math.min(...a)
    const eScafo = escursione(scafoY)
    const eAcqua = escursione(acquaY)
    const rapporto = eAcqua > 0.01 ? eScafo / eAcqua : null

    console.log(`  ${etichetta}  (mare=${mare}, uScafo=${uScafo}, uAcqua=${uAcqua}, ${scafoY.length}/${acquaY.length} campioni validi)`)
    console.log(`    escursione al confine SULLO SCAFO:   ${eScafo.toFixed(4)} unita`)
    console.log(`    escursione al confine LONTANO (mare): ${eAcqua.toFixed(4)} unita`)
    if (rapporto === null) {
      console.log('    mare troppo piatto per giudicare (escursione lontana < 0,01): confronto non significativo')
    } else {
      console.log(`    rapporto scafo/lontano: ${rapporto.toFixed(3)}`)
      const segue = rapporto > 0.5
      console.log('    ESITO: ' + (segue
        ? 'VERDE — il confine sullo scafo si muove quanto il mare: la fascia SEGUE l onda'
        : 'ROSSO — il confine sullo scafo resta quasi fermo mentre il mare oscilla: la fascia e DIPINTA A QUOTA COSTANTE'))
    }
    return { eScafo, eAcqua, rapporto, mare }
  }

  const alto = await misura(P_MARE_ALTO, 'MARE ALTO (scafo intero, visto da fuori)')
  console.log('')
  const piatto = await misura(P_MARE_PIATTO, 'MARE PIATTO (subito dopo l emersione, prima della rampa)')

  console.log('\n' + '-'.repeat(70))
  console.log('RIEPILOGO')
  if (alto?.rapporto != null) console.log(`  mare alto:   rapporto scafo/lontano = ${alto.rapporto.toFixed(3)}  (mare=${alto.mare})`)
  else console.log('  mare alto:   NON MISURABILE o non significativo')
  if (piatto?.rapporto != null) console.log(`  mare piatto: rapporto scafo/lontano = ${piatto.rapporto.toFixed(3)}  (mare=${piatto.mare})`)
  else console.log('  mare piatto: mare troppo piatto per un rapporto (atteso: entrambe le escursioni vicine a zero)')
  console.log('')

  await browser.close()
}

main().catch((e) => { console.error('ERRORE:', e); process.exit(2) })
