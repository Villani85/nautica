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
/**
 * p=0.45: dentro 'invito' (0.38-0.50), dopo la rampa 'mare' (0.26-0.38) e
 * prima che 'taglio' (0.64-1.00) cominci a sezionare lo scafo — nave intera,
 * vista da fuori. Sondato a mano (`_diag-galleggiamento.mjs`, non
 * consegnato): li' `stato.mare` resta stabile a 4 (il massimo raggiunto in
 * dieci controlli da 0,4 s), mentre `stato.rollio` oscilla davvero (0,98 a
 * 5,48 gradi in due secondi e mezzo) — e' la scena viva che serve.
 *
 * NON misurabile in 20 minuti: uno stato di mare AFFIDABILMENTE piatto.
 * `stato.mare` non segue linearmente lo scroll (letto 4 a p=0, 1 a p=0,30,
 * 3 a p=0,34) — sonda non convergente nel tempo dato. Il secondo esito
 * richiesto (rosso E verde) si ottiene quindi come l'incarico stesso
 * permette in alternativa: STRINGENDO LA SOGLIA sugli stessi numeri, non
 * cercando un secondo stato di mare — vedi in fondo a `main()`.
 */
const P_MARE_ALTO = 0.45

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
 * Bisezione su v fra due estremi di classe diversa. Il confine vero si sposta
 * fotogramma per fotogramma (rollio, onda): una staffa FISSA lo perde appena
 * scivola fuori, quindi prima si RITROVA la staffa con una scansione grossa
 * dentro il range dato, poi si biseca dentro la coppia adiacente dove la
 * classe cambia. `null` se in tutto il range non c'e' nessun salto della
 * forma attesa: NON si inventa un confine che non c'e'.
 */
async function confineY (pg, u, vScanLo, vScanHi, atteso, passi = 16) { // atteso = ['solido','acqua'] o ['cielo','acqua']
  const step = (vScanHi - vScanLo) / passi
  let precV = vScanLo, prec = await nearestHit(pg, u, vScanLo)
  let vLo = null, vHi = null, lo = null, hi = null
  for (let i = 1; i <= passi; i++) {
    const v = vScanLo + i * step
    const cur = await nearestHit(pg, u, v)
    if (prec.tipo === atteso[0] && cur.tipo === atteso[1]) { vLo = precV; lo = prec; vHi = v; hi = cur; break }
    precV = v; prec = cur
  }
  if (vLo === null) return null
  for (let i = 0; i < 12; i++) {
    const vm = (vLo + vHi) / 2
    const m = await nearestHit(pg, u, vm)
    if (m.tipo === atteso[0]) { vLo = vm; lo = m } else { vHi = vm; hi = m }
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

    /**
     * Le due colonne, e le due staffe (vLo,vHi) fra cui bisecare — TROVATE A
     * MANO con una sonda preliminare (`_diag-galleggiamento.mjs`, non
     * consegnato) perche' la superficie 'pelo' e' trasparente e sotto c'e'
     * un'altra mesh statica (il fondale, sempre a y=0): oltre v~0,62 sulle
     * colonne laterali il raggio comincia ad alternare fra le due, e la
     * bisezione li perderebbe. Dentro le staffe scelte l'alternanza non c'e'
     * mai stata, in nessuna sonda.
     *
     * colonna SULLO SCAFO: al centro (u=0,5), dove la ripresa larga inquadra
     * la nave — sopra e' scafo/coperta (v 0,50-0,62), sotto e' 'pelo' pulito
     * fino a v=0,89.
     * colonna LONTANA: ai bordi (u=0,06 / u=0,94) — sopra e' cielo (nessun
     * hit) fino a v~0,54, sotto (v~0,60) e' 'pelo' pulito.
     */
    const uScafo = 0.50
    const uAcqua = 0.06

    const N = 20
    const scafoY = [], acquaY = []
    for (let i = 0; i < N; i++) {
      const y1 = await confineY(pg, uScafo, 0.48, 0.90, ['solido', 'acqua'], 24)
      const y2 = await confineY(pg, uAcqua, 0.40, 0.68, ['cielo', 'acqua'], 24)
      if (y1 !== null) scafoY.push(y1)
      if (y2 !== null) acquaY.push(y2)
      await pg.waitForTimeout(300) // il tempo scorre: qui serve il moto, niente ?fermo
    }

    if (scafoY.length < N * 0.35 || acquaY.length < N * 0.35) {
      console.log(`  ${etichetta}: NON MISURABILE — bracket perso troppe volte (scafo ${scafoY.length}/${N}, acqua ${acquaY.length}/${N})`)
      return null
    }

    const escursione = (a) => Math.max(...a) - Math.min(...a)
    const eScafo = escursione(scafoY)
    const eAcqua = escursione(acquaY)
    const rapporto = eAcqua > 0.01 ? eScafo / eAcqua : null

    console.log(`  ${etichetta}  (mare=${mare}, uScafo=${uScafo}, uAcqua=${uAcqua}, ${scafoY.length}/${acquaY.length} campioni validi)`)
    console.log(`    escursione al confine SULLO SCAFO:    ${eScafo.toFixed(4)} unita`)
    console.log(`    escursione al confine LONTANO (mare): ${eAcqua.toFixed(4)} unita`)
    if (rapporto === null) {
      console.log('    mare troppo piatto per giudicare (escursione lontana < 0,01): confronto non significativo')
    } else {
      console.log(`    rapporto scafo/lontano: ${rapporto.toFixed(3)}`)
    }
    return { eScafo, eAcqua, rapporto, mare }
  }

  const alto = await misura(P_MARE_ALTO, 'MARE ALTO (scafo intero, visto da fuori)')

  console.log('\n' + '-'.repeat(70))
  console.log('ESITO, a due soglie sugli STESSI numeri (nessun secondo stato di mare')
  console.log('e stato trovato in tempo: vedi il commento su P_MARE_ALTO)\n')
  if (alto?.rapporto == null) {
    console.log('  NON MISURABILE.')
  } else {
    for (const soglia of [0.5, 0.98]) {
      const segue = alto.rapporto > soglia
      console.log(`  soglia ${soglia.toFixed(2)}:  rapporto ${alto.rapporto.toFixed(3)} ${segue ? '>' : '<='} soglia -> ` +
        (segue ? 'VERDE (la fascia "segue" l onda)' : 'ROSSO (la fascia resta ferma mentre il mare oscilla: dipinta a quota costante)'))
    }
  }
  console.log('')

  await browser.close()
}

main().catch((e) => { console.error('ERRORE:', e); process.exit(2) })
