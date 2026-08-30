/**
 * DIAGNOSI (sola lettura): la BASELINE prima di toccare la regia.
 *
 * NON e' un cancello e non entra nella suite. Esiste per obbedire al punto 1
 * di «Metodo e prove obbligatorie» in `ciao.md`:
 *
 *   «Prima registrare la baseline su cinque campioni della battuta:
 *    percentuale di frame occupata dal gruppo, percentuale occlusa, posizione e
 *    mira della camera. Poi modificare la regia. Nessuna nuova soglia prima dei
 *    nuovi fotogrammi.»
 *
 * `collaudo-inquadrature` dava gia' le prime due, ma non la terza -- e senza
 * posizione e mira una traiettoria nuova non si puo' confrontare con quella
 * vecchia, si puo' solo giudicare a occhio.
 *
 * ─── E LA MISURA SI RIPETE, perche' una corsa sola non e' una baseline
 *
 * La battuta del meccanismo ha letto 7,87% in una corsa e 9,95% in un'altra: la
 * forbice e' vera e dipende da dove cade il campione dentro l'avvicinamento.
 * Prendere la corsa fortunata e chiamarla baseline vorrebbe dire tarare le pose
 * nuove contro un numero migliore del vero.
 *
 * Quindi si gira N volte (`GIRI`, di serie 3) e si stampano minimo, mediana e
 * massimo. **Il numero da portarsi dietro e' il minimo**, non la media: e' il
 * peggiore che un visitatore possa vedere.
 *
 * Le coordinate sono in UNITA' di scena e in METRI (1 unita' = 2,5 m), mai in
 * frazioni di pagina -- e' la regola che questo repo ha pagato tre volte.
 */
import { apriBrowser } from './browser.mjs'
import { spawn } from 'node:child_process'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'
import { SOGGETTI, misuraInPagina, trovaArco, vaiA, attendiCameraFerma } from './inquadratura-comune.mjs'

const PORTA = process.env.PORTA_COLLAUDO || 6970
const BATTUTE = (process.env.BATTUTE || 'taglio,meccanismo').split(',')
const QUANTI = Number(process.env.CAMPIONI || 5)
const GIRI = Number(process.env.GIRI || 3)
const M_PER_UNITA = 2.5
/**
 * IL BERSAGLIO SI DICHIARA, e viene dalla regia.
 *
 * `MIRA_MECCANISMO = 1.15` in `src/scena/index.js` e' positiva: la camera, alla
 * battuta del meccanismo, punta il fianco di DRITTA. Quindi il bersaglio
 * narrativo e' quel gruppo, e l'altro resta controllo.
 *
 * La prima versione sceglieva «il piu' vicino». Sembrava innocuo e non lo e':
 * un criterio geometrico puo' scegliere l'impianto sbagliato in una posa in cui
 * la camera passa dall'altra parte, e allora la baseline confronta due cose
 * diverse fra un giro e l'altro. Il bersaglio di una misura non si scopre a
 * ogni fotogramma: si decide una volta e si scrive.
 */
const LATO = process.env.LATO || 'dritta'

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
 * DOVE STA LA CAMERA E DOVE GUARDA.
 *
 * La mira non e' un dato che la scena conserva -- `lookAt` la consuma e tiene
 * solo l'orientamento. Si ricostruisce proiettando la direzione di vista fino
 * al soggetto: e' la mira che conta per una traiettoria, non un punto astratto.
 */
/**
 * DOVE STA LA CAMERA E QUANTO E' LONTANA DAL BERSAGLIO.
 *
 * ─── E NON CLASSIFICA PIU' NIENTE
 *
 * DIFETTO PRESO NEL REFERTO STESSO, e per due volte. La prima versione di
 * questa funzione si divideva gli impianti per conto suo, sulla X di MONDO. Il
 * risultato era che la stessa riga diceva «presenza misurata su dritta» e
 * «scarto verso sinistra»: due soggetti diversi, un rigo solo.
 *
 * La causa non era il criterio, era **la duplicazione**. `misuraInPagina` gia'
 * divide per fianco, nel sistema dello scafo, e sa quale gruppo e' il bersaglio.
 * Averne una seconda copia qui significava tenerne due che prima o poi
 * divergono -- e sono divergute subito, perche' quella qui usava il mondo e
 * quella la' lo scafo.
 *
 * Adesso il bersaglio arriva da fuori, gia' scelto. Questa funzione fa una cosa
 * sola: dice dove sta la camera e come e' messa rispetto a quel punto.
 */
const dovEra = (bersaglio) => pg.evaluate((b) => {
  const n = window.__nautica
  const c = n.camera
  c.updateMatrixWorld(true)
  const e = c.matrixWorld.elements
  /* -Z della matrice: la direzione in cui la camera guarda */
  const dir = { x: -e[8], y: -e[9], z: -e[10] }
  const dx = b[0] - c.position.x, dy = b[1] - c.position.y, dz = b[2] - c.position.z
  const dist = Math.hypot(dx, dy, dz)
  const cos = dist > 0 ? (dir.x * dx + dir.y * dy + dir.z * dz) / dist : 1
  return {
    camera: [c.position.x, c.position.y, c.position.z],
    direzione: [dir.x, dir.y, dir.z],
    distanza: dist,
    scarto: Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI,
    fov: c.fov,
    p: n.p ?? null
  }
}, bersaglio)

const n3 = (a) => a.map(v => +v.toFixed(3))
const mediana = (a) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)] }

console.log(`\n  BASELINE  ${GIRI} giri x ${QUANTI} campioni  ·  1 unita = ${M_PER_UNITA} m  ·  bersaglio: ${LATO}`)

for (const battuta of BATTUTE) {
  const def = SOGGETTI[battuta]
  if (!def) { console.log(`  ${battuta}: soggetto non dichiarato in SOGGETTI`); continue }
  const arco = await trovaArco(pg, battuta)
  if (!arco) { console.log(`  ${battuta}: battuta non trovata`); continue }

  console.log(`\n  ── ${battuta} — ${def.cosa}   (arco ${(arco.da * 100).toFixed(0)}-${(arco.a * 100).toFixed(0)}%)`)
  console.log('     k   p        presenza  occlusa   camera (unita)              dist    scarto')

  const perCampione = Array.from({ length: QUANTI }, () => ({ pres: [], occ: [] }))
  let ultimaPosa = []
  const guaiMisura = new Set()
  let conteggio = null; let scatole = null

  for (let g = 0; g < GIRI; g++) {
    for (let k = 0; k < QUANTI; k++) {
      await vaiA(pg, arco.da + (arco.a - arco.da) * (k / (QUANTI - 1)))
      await attendiCameraFerma(pg)
      const m = await pg.evaluate(misuraInPagina, { def, conColpevoli: false, soloLato: LATO })
      if (m.rotto) { guaiMisura.add(m.rotto); continue }
      if (g === 0 && k === 0) conteggio = m.conteggio, scatole = m.scatole
      const cen = m.scatole && m.scatole[LATO] ? m.scatole[LATO].centro : null
      if (!cen) { guaiMisura.add(`nessun ingombro per il fianco "${LATO}"`); continue }
      const d = await dovEra(cen)
      d.lato = LATO
      const pres = 100 * m.visibili / m.quadro
      const occ = m.nudi > 0 ? 100 * (1 - m.visibili / m.nudi) : null
      perCampione[k].pres.push(pres)
      if (occ !== null) perCampione[k].occ.push(occ)
      if (g === GIRI - 1) ultimaPosa[k] = d
    }
  }

  if (guaiMisura.size) {
    console.log('     MISURA RIFIUTATA: ' + [...guaiMisura].join(' | '))
    if (conteggio) console.log(`     mesh: ${conteggio.dritta} dritta, ${conteggio.sinistra} sinistra, ${conteggio.centrale} centrali, ${conteggio.ambigua} ambigue`)
  }
  const tutteQ = perCampione.flatMap(c => c.pres)
  if (!tutteQ.length) { console.log('     nessuna misura utilizzabile in questa battuta'); continue }

  for (let k = 0; k < QUANTI; k++) {
    const c = perCampione[k]
    if (!c.pres.length) { console.log(`     ${k}   nessuna misura riuscita`); continue }
    const d = ultimaPosa[k] || {}
    const cam = d.camera ? n3(d.camera).join(' ') : '?'
    console.log(`     ${k}   ${(d.p ?? 0).toFixed(3)}   ` +
      `${Math.min(...c.pres).toFixed(2)}%` +
      `${c.pres.length > 1 ? '–' + Math.max(...c.pres).toFixed(2) + '%' : '      '}  ` +
      `${c.occ.length ? Math.max(...c.occ).toFixed(1) + '%' : '  n/d'}   ` +
      `${cam.padEnd(26)}  ${(d.distanza ?? 0).toFixed(2)}  ${(d.scarto ?? 0).toFixed(1)}° ${d.lato || ''}`)
  }

  const tutte = perCampione.flatMap(c => c.pres)
  const occTutte = perCampione.flatMap(c => c.occ)
  console.log(`     ---- su ${tutte.length} misure: presenza min ${Math.min(...tutte).toFixed(2)}%, ` +
    `mediana ${mediana(tutte).toFixed(2)}%, max ${Math.max(...tutte).toFixed(2)}%`)
  if (occTutte.length) {
    console.log(`          occlusione min ${Math.min(...occTutte).toFixed(1)}%, ` +
      `mediana ${mediana(occTutte).toFixed(1)}%, max ${Math.max(...occTutte).toFixed(1)}%`)
  }
  if (guaiMisura.size) {
    console.log('     MISURA RIFIUTATA: ' + [...guaiMisura].join(' | '))
    continue
  }
  if (conteggio) {
    console.log(`     mesh: ${conteggio.dritta} a dritta, ${conteggio.sinistra} a sinistra, ` +
      `${conteggio.centrale} centrali, ${conteggio.ambigua} ambigue`)
    for (const k of ['dritta', 'sinistra']) {
      const b = scatole && scatole[k]
      if (!b) { console.log(`     ${k}: assente`); continue }
      const seg = k === LATO ? ' <- BERSAGLIO' : ' (controllo)'
      console.log(`     ${k}: da ${b.min.map(v => v.toFixed(2)).join(' ')} a ` +
        `${b.max.map(v => v.toFixed(2)).join(' ')} unita, centro ` +
        `${b.centro.map(v => v.toFixed(2)).join(' ')}${seg}`)
    }
  }
  /* Le due scatole le stampa gia' il blocco qui sopra, prendendole dalla
     misura. Qui non si ricalcola niente: un secondo calcolo dello stesso
     ingombro e' esattamente il modo in cui questo strumento si e' contraddetto
     due volte in una riga. */
  console.log('\n     IL NUMERO DA PORTARSI DIETRO E IL MINIMO, non la mediana:')
  console.log(`     presenza ${Math.min(...tutte).toFixed(2)}%` +
    (occTutte.length ? `, occlusione ${Math.max(...occTutte).toFixed(1)}%` : ''))
}

await browser.close(); preview.kill(); process.exit(0)
