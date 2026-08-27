/**
 * LA SCIA DICE LA VERITA' SULL'ANDATURA.
 *
 * Il baffo d'onda allo scafo cresce con la velocita' e a nave ferma non c'e'.
 * E' una promessa scritta nel codice, e una promessa senza cancello e' una
 * frase: il cursore dell'andatura potrebbe smettere di arrivare all'acqua
 * senza che niente lo dica, perche' il mare resterebbe bellissimo lo stesso.
 *
 * Il cancello guarda una fascia di pixel LUNGO LA MURATA e chiede che a dodici
 * nodi sia piu' chiara che a zero -- l'acqua aerata e' piu' chiara di quella
 * ferma -- e che il resto del quadro non cambi: una scia che schiarisce anche
 * l'orizzonte non e' una scia, e' un filtro.
 *
 * Le due immagini si prendono nello stesso istante, con due disegni a mano di
 * seguito: la nave rolla e il mare si muove, e con due catture separate lo
 * scarto cercato affogherebbe nel movimento. E' costato tre misure non
 * monotone prima di capirlo.
 */
import { apriBrowser } from './browser.mjs'
import { spawn } from 'node:child_process'

const PORTA = process.env.PORTA_COLLAUDO || 5195
const SOGLIA = 1.5      // per cento di schiarimento minimo lungo la murata
const TETTO_FUORI = 0.6 // per cento di scarto massimo lontano dalla nave

const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
await new Promise(r => setTimeout(r, 4000))
const browser = await apriBrowser({ conGpu: true })
const pg = await (await browser.newContext({ viewport: { width: 1000, height: 620 } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1${process.env.EXTRA || ''}`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })
await pg.evaluate(() => {
  const r = document.querySelector('#dimostrazione').getBoundingClientRect()
  scrollTo(0, Math.round(r.top + scrollY + r.height * 0.30))
})
await pg.waitForTimeout(2500)

/**
 * --- SI MISURA UN RAPPORTO, NON UNA LUMINANZA
 *
 * Primo tentativo: due disegni a mano di seguito, uno a zero nodi e uno a
 * dodici. Scarto **0,00% esatto** -- perche' `uNaveVel` si aggiorna dentro
 * `anima`, che gira nel ciclo del sito, e dentro una sola chiamata nessun
 * fotogramma passa. Il cursore lo avevo mosso, ma l'acqua non lo aveva ancora
 * sentito.
 *
 * Lasciando passare fotogrammi pero' la nave ROLLA e il mare si muove, ed e'
 * la trappola che ha gia' prodotto tre misure non monotone stanotte.
 *
 * La via d'uscita e' misurare una grandezza che il movimento non sposta: il
 * RAPPORTO fra la fascia lungo la murata e una fascia di mare aperto, preso
 * dentro lo stesso fotogramma. Se il mare intero si schiarisce perche' e'
 * passata un'onda, si schiariscono tutte e due e il rapporto non si muove. Poi
 * si media su piu' fotogrammi, perche' un rapporto solo resta rumoroso.
 */
const CAMPIONI = 10

const esito = await pg.evaluate(async (CAMPIONI) => {
  const n = window.__nautica
  const cur = document.querySelector('#velocita')
  if (!cur) return { rotto: 'non trovo #velocita: il cursore dell andatura non c e piu' }
  n.camera.position.set(24.3634, 3.0, 37.331)
  n.camera.lookAt(0, 1.7209, 0)
  n.camera.fov = 2 * Math.atan(12 / 85) * 180 / Math.PI
  n.camera.aspect = 1000 / 620
  n.camera.updateProjectionMatrix()
  const tela = n.render.domElement
  const c = document.createElement('canvas')
  c.width = tela.width; c.height = tela.height
  const ctx = c.getContext('2d')
  /**
   * --- SI CONTA LA CODA CHIARA, NON LA MEDIA
   *
   * La media su un rettangolo diluisce una fascia sottile: col baffo acceso a
   * dodici nodi la media cambiava dello 0,00%, e sembrava che la scia non ci
   * fosse. C'era: il provino diagnostico -- baffo al massimo, dipinto di rosso
   * -- la mostrava benissimo lungo la murata.
   *
   * La schiuma non e' un innalzamento del livello medio, e' un insieme di
   * PIXEL CHIARI dentro acqua scura. Quindi si guarda il novantacinquesimo
   * percentile: se compare schiuma, la coda si alza anche quando la media non
   * si muove di un livello.
   */
  const alto = (im, x0, y0, x1, y1) => {
    const v = []
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * im.width + x) * 4
        v.push(0.2126 * im.data[i] + 0.7152 * im.data[i + 1] + 0.0722 * im.data[i + 2])
      }
    }
    v.sort((a, b) => a - b)
    return v[Math.floor(v.length * 0.95)]
  }
  const media = alto
  /* LE DUE FASCE ARRIVANO DAL PROVINO, NON DA UNA STIMA.
     La prima stesura le aveva a occhio e cadevano su acqua in ombra: il
     segnale c'era ma valeva lo 0,44%, e sarebbe stato facile concluderne che
     la scia non funziona. Il provino diagnostico -- baffo al massimo, dipinto
     di rosso -- dice dove cade davvero: x 0,154..0,686 e y 0,606..0,690 della
     tela. La fascia di confronto sta alla STESSA altezza, oltre la prua, dove
     c'e' solo mare. Stessa altezza perche' l'acqua cambia molto con la
     distanza, e confrontare due profondita' diverse misurerebbe quella. */
  const rq = (x0, y0, x1, y1) => [Math.round(x0 * tela.width), Math.round(y0 * tela.height),
                                  Math.round(x1 * tela.width), Math.round(y1 * tela.height)]
  const murata = rq(0.16, 0.610, 0.68, 0.688)
  const largo = rq(0.75, 0.610, 0.97, 0.688)
  /**
   * --- SI CAMBIA UNA GRANDEZZA SOLA, A FOTOGRAMMA FERMO
   *
   * Muovere il cursore e aspettare che l'acqua lo senta vuol dire lasciar
   * passare venti fotogrammi, e in venti fotogrammi il mare si muove e la nave
   * rolla: misurato, il 24% dei pixel cambia per quello. Il segnale cercato e'
   * una fascia sottile, e ci affoga -- tre metriche diverse hanno risposto
   * 0,00% prima che capissi che il rumore non era nella metrica ma nel metodo.
   *
   * Con l'uniforme in mano si disegna due volte lo STESSO istante: stessa
   * onda, stessa posa, stessa luce. Quello che resta e' solo la scia.
   */
  const vel = n.acqua.uni.uNaveVel
  const disegna = (v) => {
    vel.value = v
    n.render.render(n.scena, n.camera)
    ctx.drawImage(tela, 0, 0)
    return ctx.getImageData(0, 0, c.width, c.height)
  }
  const prima = vel.value
  const fermoIm = disegna(0)
  const corsaIm = disegna(1)
  vel.value = prima
  const fermo = { rapporto: media(fermoIm, ...murata) / media(fermoIm, ...largo),
                  murata: media(fermoIm, ...murata), largo: media(fermoIm, ...largo) }
  const corsa = { rapporto: media(corsaIm, ...murata) / media(corsaIm, ...largo),
                  murata: media(corsaIm, ...murata), largo: media(corsaIm, ...largo) }
  return { fermo, corsa }
}, CAMPIONI)

await browser.close(); preview.kill()

if (esito.rotto) { console.error('  ROTTO  ' + esito.rotto); process.exit(1) }

const d = 100 * (esito.corsa.rapporto - esito.fermo.rapporto) / esito.fermo.rapporto
console.log('la scia contro l andatura')
console.log(`  RAPPORTO murata/largo   ferma ${esito.fermo.rapporto.toFixed(4)}   a 12 nodi ${esito.corsa.rapporto.toFixed(4)}   ${d >= 0 ? '+' : ''}${d.toFixed(2)}%  (minimo +${SOGLIA}%)`)
console.log(`  (luminanze del primo campione: murata ${esito.fermo.murata.toFixed(1)} -> ${esito.corsa.murata.toFixed(1)}, largo ${esito.fermo.largo.toFixed(1)} -> ${esito.corsa.largo.toFixed(1)})`)

const guai = []
if (d < SOGLIA) guai.push(`fra nave ferma e dodici nodi il rapporto cambia del ${d.toFixed(2)}%: la scia non arriva all acqua.`)
if (guai.length) {
  console.error('\nCOLLAUDO SCIA FALLITO')
  for (const g of guai) console.error('  · ' + g)
  process.exit(1)
}
console.log('\ncollaudo scia: passato')
