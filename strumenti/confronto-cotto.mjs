/**
 * LA STESSA NAVE DALLA STESSA CAMERA, cotta e disegnata.
 *
 * E' l'unico confronto che dice dove il tempo reale perde. Con due
 * inquadrature diverse ogni differenza si puo' attribuire alla posa; con la
 * stessa, quello che resta e' il render.
 *
 * La posizione arriva da `cuoci.py`, che la stampa in coordinate del sito
 * (riga CAMERA_SITO): non si trascrive a mano, si passa da qui.
 */
import { apriBrowser } from './browser.mjs'
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const [px, py, pz, mx, my, mz, fuoco] = (process.env.CAMERA_SITO ||
  '24.3634 3.0000 37.3310 0 1.7209 0 85').split(/\s+/).map(Number)
const L = Number(process.env.LARGO || 1000)
const H = Number(process.env.ALTO || 620)
const PORTA = process.env.PORTA_COLLAUDO || 5188

const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
await new Promise(r => setTimeout(r, 4000))
const browser = await apriBrowser({ conGpu: true })
const pg = await (await browser.newContext({ viewport: { width: L, height: H } })).newPage()
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1${process.env.EXTRA || ''}`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })

// dentro la dimostrazione, dove il ciclo di disegno e' acceso
const QUOTA = Number(process.env.QUOTA || 0.30)
await pg.evaluate((q) => { window.__quota = q }, QUOTA)
const y = await pg.evaluate(() => {
  const r = document.querySelector('#dimostrazione').getBoundingClientRect()
  return Math.round(r.top + scrollY + r.height * Number(window.__quota || 0.30))
})
await pg.evaluate((y) => scrollTo(0, y), y)
await pg.waitForTimeout(2500)

/** Otto punti in coordinate del SITO, scritti identici in `cuoci.py`. Servono
 *  solo a chiedere alle due camere «dove vedi questo?»: non descrivono niente,
 *  quindi non devono seguire la geometria. */
const PROVA = [
  [-1.9, -0.9, -8], [1.9, -0.9, -8], [-1.9, -0.9, 8], [1.9, -0.9, 8],
  [-1.9, 4.3, -8], [1.9, 4.3, -8], [-1.9, 4.3, 8], [1.9, 4.3, 8]
]

const dati = await pg.evaluate(([px, py, pz, mx, my, mz, fuoco, L, H, senzaMare, PROVA,
                                senzaLuci, lineare, senzaAo]) => {
  const n = window.__nautica
  // Il ciclo del sito riscrive la camera a ogni fotogramma: si disegna UNA
  // volta a mano, subito dopo averla messa, e si legge la tela prima che il
  // fotogramma successivo la sovrascriva.
  /**
   * --- LA NAVE VA RIMESSA DRITTA, O SI CONFRONTANO DUE POSE
   *
   * `index.js:598` scrive `nave.rotation.z = degToRad(S.rollio)` a ogni
   * fotogramma: nel sito la nave ROLLA. In Blender no -- `cuoci.py` non ha
   * nessuna posa di rollio, la nave e' dritta.
   *
   * Misurato sulle due sagome sopra l'orizzonte, prima di accorgersene:
   *
   *     cycles   x 371-703 (largo 332)   y 167-319
   *     sito     x 354-689 (largo 335)   y 177-319
   *
   * La LARGHEZZA coincide -- rapporto 1,009, cioe' la focale e' la stessa e il
   * confronto e' impostato bene -- ma il centro e' spostato di **15,5 px** in
   * orizzontale e la cima di **10 px** in verticale. Una traslazione rigida a
   * scala invariata: non e' un difetto di resa, e' un'altra posa.
   *
   * Senza questa riga ogni confronto pixel-a-pixel attribuisce alla RESA una
   * differenza che e' di POSIZIONE, ed e' il modo piu' silenzioso di sbagliare
   * tutto il pass di fotorealismo: i numeri escono, sono precisi, e misurano
   * un'altra cosa.
   */
  /**
   * --- E LA CURVA TONALE DEV'ESSERE LA STESSA, O SI CONFRONTANO DUE OCCHI
   *
   * Terzo strato dello stesso errore, dopo l'angolo di campo e l'ambiente. Il
   * sito disegna con `ACESFilmicToneMapping` a esposizione 1; `cuoci.py` rende
   * con `view_transform = 'AgX'` a **-1 EV**. Sono due curve diverse e uno stop
   * di differenza, e nessuno dei due e' sbagliato: sono solo due occhi.
   *
   * Misurato prima di accorgersene, sulla sovrastruttura: il sito usciva
   * **+27,3 livelli piu' chiaro** (185,6 contro 158,2), e tolto quello
   * scostamento uniforme restavano 18,2 livelli. Cioe' il 60% di quel che
   * sembrava «dove il tempo reale perde» era la curva.
   *
   * three ha AgX anche lui, quindi i due lati si fanno combaciare invece di
   * correggere a posteriori. -1 EV vale un fattore 0,5 sull'esposizione.
   *
   * Si verifica il valore di partenza: se three rinumerasse le costanti, si
   * spegne invece di misurare in silenzio con la curva sbagliata.
   */
  /* --- E I RAPPORTI SI PRENDONO IN LINEARE, NON DOPO LA CURVA
   *
   * AgX e' fortemente non lineare: lo stesso rapporto di radianza produce
   * rapporti diversi a luminosita' diverse. Misurato accorgendosene: sostituendo
   * il cielo con uno PIATTO -- che abbassa tutta la scena -- il rapporto della
   * sovrastruttura passava da 0,988 a 1,138, cioe' peggiorava una zona che
   * prima combaciava. Un cambiamento che tocca anche cio' che era giusto non e'
   * un difetto del soggetto: e' il metro.
   *
   * `LINEARE=1` spegne la curva da tutte e due le parti (qui NoToneMapping,
   * in `cuoci.py` il view transform 'Standard'): restano valori sRGB, che si
   * invertono esattamente, e i rapporti tornano confrontabili fra loro. */
  const ACES = 4, AGX = 6, NESSUNA = 0
  if (lineare) {
    n.render.toneMapping = NESSUNA
    n.render.toneMappingExposure = 1
  } else if (n.render.toneMapping !== ACES) {
    return { errore: 'toneMapping del sito e ' + n.render.toneMapping + ', non ACESFilmic (' +
                     ACES + '): le costanti di three sono cambiate e questo confronto ' +
                     'userebbe una curva a caso' }
  } else {
    n.render.toneMapping = AGX
    n.render.toneMappingExposure = 0.5
  }

  /* `SENZA_LUCI=1`: si spengono le luci della scena e resta la sola risposta
   * all'ambiente. E' l'unico confronto che isola la RESA, perche' i due
   * impianti di luce sono due -- il sito ha emisferica, sole, controluce e una
   * puntiforme; `cuoci.py` due luci ad area. Dal lato Blender si spengono con
   * LUCE=0. Finche' restano accesi, ogni scarto e' attribuibile alle luci
   * prima che al renderer. */
  const spente = []
  if (senzaLuci) {
    n.scena.traverse((o) => {
      if (o.isLight && o.intensity > 0) { spente.push([o, o.intensity]); o.intensity = 0 }
    })
  }

  n.nave.rotation.z = 0

  /**
   * --- E IL MARE VA TOLTO, COME `SENZA_PIANO=1` LO TOGLIE IN BLENDER
   *
   * Non e' estetica: senza, la SAGOMA della nave non si puo' misurare, perche'
   * l'acqua riempie il fotogramma e ogni riquadro di ingombro comprende lei.
   * Il primo tentativo aggirava il problema tagliando a `y < 320`, e misurava
   * due immagini TRONCATE ALLA STESSA QUOTA: il rapporto di altezza che ne
   * usciva (1,07) non diceva niente sulla nave, diceva dov'era il taglio.
   */
  /**
   * --- E L'OCCLUSIONE VA POTUTA SPEGNERE, perche' Blender non ce l'ha
   *
   * `cuoci.py` costruisce i materiali dal sito con colore, metalness e
   * roughness: **nessuna mappa di occlusione**. Il sito invece ne ha una cotta
   * sullo scafo. Quindi una parte dello scarto fra i due non e' resa: e' un
   * termine che sta da una parte sola. `SENZA_AO=1` lo toglie e permette di
   * sapere quanto vale, invece di attribuirlo al renderer -- che e' l'errore
   * gia' fatto con l'ambiente, e costava 56,85 livelli.
   */
  const ao = []
  if (senzaAo) {
    n.scena.traverse((o) => {
      const ms = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : [])
      for (const m of ms) {
        if (m && m.aoMap && m.aoMapIntensity > 0) { ao.push([m, m.aoMapIntensity]); m.aoMapIntensity = 0 }
      }
    })
  }

  const nascosti = []
  if (senzaMare) {
    n.scena.traverse((o) => {
      const ms = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : [])
      if (o.visible && ms.some((m) => m.name === 'pelo' || m.name === 'velo')) {
        o.visible = false; nascosti.push(o)
      }
    })
  }

  n.camera.position.set(px, py, pz)
  n.camera.lookAt(mx, my, mz)
  if (n.camera.isPerspectiveCamera) {
    /**
     * --- IL SENSORE SI ADATTA ALLA LARGHEZZA, NON ALL'ALTEZZA
     *
     * Qui c'era `2*atan(12/fuoco)`: l'angolo verticale ricavato dai 24 mm di
     * ALTEZZA di un sensore 36x24. Sembra la formula giusta -- `fov` in three
     * e' verticale, e 12 e' mezza altezza -- ed e' sbagliata, perche' Blender
     * non fa cosi'. Con `sensor_fit = 'AUTO'` (il predefinito) Blender adatta
     * il lato del sensore alla dimensione MAGGIORE del fotogramma: su
     * 1000x620 e' la larghezza, quindi i 36 mm stanno sull'orizzontale.
     *
     *     three  mezza tangente orizzontale  (12/85) * (1000/620) = 0,22771
     *     Blender                             18/85              = 0,21176
     *     rapporto                                                 1,0754
     *
     * **Il 7,5% c'era in ogni confronto sito-Cycles fatto finora**, e non si
     * vede guardando: le due immagini si somigliano, e la differenza si legge
     * come «il tempo reale rende diversamente». Misurato proiettando otto
     * punti fissi da tutte e due le camere, lo scarto era 27,9 px con la firma
     * inconfondibile di una scala attorno al centro -- i punti lontani
     * sbagliati di -25, i vicini di +20.
     *
     * Quindi la verticale si DERIVA dall'orizzontale di Blender.
     */
    const mezzaTangenteOrizzontale = 18 / fuoco          // sensore 36 mm sul lato lungo
    n.camera.fov = 2 * Math.atan(mezzaTangenteOrizzontale * (H / L)) * 180 / Math.PI
    n.camera.aspect = L / H
    n.camera.updateProjectionMatrix()
  }
  n.render.render(n.scena, n.camera)
  /* L'INGOMBRO DELLA NAVE, in coordinate del sito. Serve a rispondere alla
   * domanda che nessuna immagine risponde: le due navi stanno nello stesso
   * posto? Se non ci stanno, ogni confronto pixel-a-pixel e' contaminato. */
  const B = { min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] }
  const v = new (Object.getPrototypeOf(n.camera.position).constructor)()
  n.nave.updateWorldMatrix(true, true)
  n.nave.traverse((o) => {
    if (!o.isMesh || !o.visible || !o.geometry) return
    const g = o.geometry
    if (!g.boundingBox) g.computeBoundingBox()
    const bb = g.boundingBox
    for (let i = 0; i < 8; i++) {
      v.set(i & 1 ? bb.max.x : bb.min.x, i & 2 ? bb.max.y : bb.min.y, i & 4 ? bb.max.z : bb.min.z)
      v.applyMatrix4(o.matrixWorld)
      const c = [v.x, v.y, v.z]
      for (let k = 0; k < 3; k++) { if (c[k] < B.min[k]) B.min[k] = c[k]; if (c[k] > B.max[k]) B.max[k] = c[k] }
    }
  })

  /**
   * --- LE DUE CAMERE SI VERIFICANO SUI PIXEL, NON SUI PARAMETRI
   *
   * Passare posizione, mira e focale non basta a garantire la stessa immagine:
   * restano sensore, aspetto, orientamento e convenzione degli assi, e ognuno
   * puo' spostare l'inquadratura senza che nessun numero se ne accorga.
   *
   * E confrontare le SAGOME non serve, come ho scoperto sprecandoci mezz'ora:
   * il render Blender esce con la nave SEZIONATA e il sito la disegna intera,
   * quindi i due riquadri di ingombro non contengono la stessa geometria. Ne
   * usciva uno «scarto di 15,5 px» che era un artefatto del taglio.
   *
   * L'unico confronto che regge e' su punti NOTI: gli otto vertici
   * dell'ingombro, proiettati da tutte e due le camere. `cuoci.py` stampa i
   * suoi con `CAMERA_VERTICI`; qui si stampano gli stessi. Se non combaciano,
   * il confronto va fermato invece di produrre numeri precisi e falsi.
   */
  /* I punti sono FISSI e scritti uguali qui e in `cuoci.py`. Il primo
   * tentativo usava i vertici dell'ingombro della nave, e non funzionava per
   * una ragione che vale la pena scrivere: **l'ingombro del sito cambia da un
   * giro all'altro**, perche' la sovrastruttura arriva in differita. Due giri
   * consecutivi hanno dato `max y` 4,382 e 1,997. Un riferimento che dipende
   * da cosa e' finito di caricare non e' un riferimento. */
  const V = Object.getPrototypeOf(n.camera.position).constructor
  const vertici = PROVA.map(([x, y, z]) => {
    const p2 = new V(x, y, z).project(n.camera)
    return [(p2.x * 0.5 + 0.5) * L, (0.5 - p2.y * 0.5) * H]
  })

  for (const o of nascosti) o.visible = true
  for (const [o, i] of spente) o.intensity = i
  for (const [m, i] of ao) m.aoMapIntensity = i
  return { url: n.render.domElement.toDataURL('image/png'), fov: n.camera.fov,
           nascosti: nascosti.length, ingombro: B, vertici, spente: spente.length, ao: ao.length,
           sezione: n.sezione.costante,
           rollio: n.stato.rollio, rotZ: n.nave.rotation.z,
           navePos: [n.nave.position.x, n.nave.position.y, n.nave.position.z] }
}, [px, py, pz, mx, my, mz, fuoco, L, H, process.env.SENZA_MARE === '1', PROVA,
    process.env.SENZA_LUCI === '1', process.env.LINEARE === '1',
    process.env.SENZA_AO === '1'])

writeFileSync(`${process.env.FUORI}/sito-${process.env.ETICHETTA || 'stessa-camera'}.png`,
  Buffer.from(dati.url.split(',')[1], 'base64'))
if (dati.errore) { console.error('  ' + dati.errore); await browser.close(); preview.kill(); process.exit(1) }
console.log(process.env.LINEARE === '1'
  ? '  curva tonale SPENTA da tutte e due le parti: i rapporti sono in lineare'
  : '  curva tonale allineata a Blender: AgX, esposizione 0,5 (cioe -1 EV)')
console.log(`  taglio a ${dati.sezione.toFixed(3)} - fov ${dati.fov.toFixed(2)} gradi`)
const f3 = (a) => a.map(x => x.toFixed(3)).join(', ')
console.log('  VERTICI (sito): ' + dati.vertici.map(v => v.map(x => x.toFixed(1)).join(',')).join(' '))
if (process.env.VERTICI_BLENDER) {
  const b = process.env.VERTICI_BLENDER.trim().split(/\s+/).map(t => t.split(',').map(Number))
  let peggio = 0
  for (let i = 0; i < Math.min(b.length, dati.vertici.length); i++) {
    const d = Math.hypot(b[i][0] - dati.vertici[i][0], b[i][1] - dati.vertici[i][1])
    if (d > peggio) peggio = d
  }
  console.log(`  scarto massimo fra le due camere: ${peggio.toFixed(2)} px`)
  if (peggio > 2) {
    console.error('  LE DUE CAMERE NON GUARDANO LA STESSA COSA: ogni confronto pixel-a-pixel sarebbe falso')
    process.exitCode = 1
  }
}
console.log(`  ingombro nave (sito): min (${f3(dati.ingombro.min)})  max (${f3(dati.ingombro.max)})`)
console.log(`  luci spente: ${dati.spente}   occlusioni spente: ${dati.ao ?? 0}`)
console.log(`  mare ${dati.nascosti ? 'nascosto (' + dati.nascosti + ' nodi)' : 'presente'}`)
console.log(`  rollio ${dati.rollio.toFixed(3)} gradi, nave.rotation.z ${dati.rotZ.toFixed(5)} rad, ` +
            `posizione (${dati.navePos.map(v => v.toFixed(3)).join(', ')})`)
console.log(`  -> ${process.env.FUORI}/sito-${process.env.ETICHETTA || 'stessa-camera'}.png`)

/**
 * ─── E SE C'E' ANCHE LA COTTA, SI MISURA invece di guardarla
 *
 *     COTTA=<render.png> ...
 *
 * Il paragone a occhio dice «il fianco cotto ha un gradiente e quello del sito
 * e' piu' piatto», e va bene per accorgersene. Non va bene per sapere se una
 * modifica ha migliorato qualcosa: due immagini simili si giudicano uguali, e
 * un miglioramento del 10% non si vede.
 *
 * ─── SI CONFRONTA SOLO DOVE C'E' LA NAVE IN TUTTE E DUE
 *
 * Lo sfondo dei due e' diverso per costruzione: nel sito il mare si nasconde
 * (fondo nero), in Blender c'e' l'ambiente. Confrontare tutto il fotogramma
 * misurerebbe soprattutto quella differenza, che non interessa a nessuno --
 * l'ennesimo numero vero che risponde a un'altra domanda.
 *
 * La sagoma comune si prende dai pixel che in ENTRAMBI si staccano dal proprio
 * fondo. Il fondo del sito e' nero pieno; quello della cotta e' la mediana
 * della colonna piu' esterna, che li' e' solo ambiente.
 *
 * ─── E SI STAMPA ANCHE PER FASCE ORIZZONTALI
 *
 * Un solo numero medio nasconde dove sta il divario. Cinque fasce dicono se il
 * problema e' la murata, la coperta o la sovrastruttura -- cioe' cosa andare a
 * toccare.
 */
if (process.env.COTTA) {
  const { execFileSync } = await import('node:child_process')
  const grezzo = (f) => execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-vf', 'scale=1000:620',
    '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1e9 })
  const A = grezzo(process.env.COTTA)
  const B = grezzo(`${process.env.FUORI}/sito-${process.env.ETICHETTA || 'stessa-camera'}.png`)
  const L = 1000; const H = 620
  /* il fondo della cotta: mediana della colonna 2, che e' solo ambiente */
  const col = []
  for (let y = 0; y < H; y++) col.push(A[y * L + 2])
  col.sort((a, b) => a - b)
  const fondoA = col[Math.floor(col.length / 2)]
  let n = 0; let somma = 0; let sommaAss = 0
  /**
   * ─── E SI STAMPA ANCHE LA MEDIANA, che qui non e' un dettaglio
   *
   * Il sito dipinge sulla murata cose che nella cotta NON esistono: la fascia
   * al galleggiamento e le finestre di murata, che lo shader disegna e la
   * geometria non ha. Sono pixel molto scuri e in minoranza, ed e' esattamente
   * la forma di dato che sposta la MEDIA di parecchio e la MEDIANA di poco.
   *
   * Se media e mediana divergono, lo scarto e' fatto di poche macchie nere --
   * cioe' di contenuto in piu' da una parte. Se coincidono, e' un livello
   * generale, e allora si sta parlando di resa.
   */
  const tutti = []
  const fasce = Array.from({ length: 5 }, () => ({ n: 0, s: 0, v: [] }))
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < L; x++) {
      const a = A[y * L + x]; const b = B[y * L + x]
      if (b < 12) continue                       // fondo nero del sito
      if (Math.abs(a - fondoA) < 6) continue     // fondo dell ambiente nella cotta
      const d = b - a
      n++; somma += d; sommaAss += Math.abs(d); tutti.push(d)
      const f = fasce[Math.min(4, Math.floor(y / (H / 5)))]
      f.n++; f.s += d; f.v.push(d)
    }
  }
  console.log('')
  console.log('SCARTO FRA COTTA E DISEGNATA, sui pixel dove c e la nave in tutte e due')
  /**
   * ─── E SE LE LUCI SONO ACCESE, IL NUMERO NON PARLA DEL RENDER
   *
   * Gli impianti di luce sono DUE E DIVERSI: il sito ha emisferica, sole,
   * controluce e una puntiforme; `cuoci.py` due luci ad area. Con tutti e due
   * accesi, quello che si misura e' in gran parte la differenza fra i due
   * impianti.
   *
   * Sta scritto piu' su in questo stesso file da prima che io arrivassi -- e
   * l'ho ignorato lo stesso, tirandone una conclusione sbagliata che e' finita
   * in un commit: «scarto quasi uniforme, quindi esposizione». Coi numeri qui
   * sotto, misurati subito dopo:
   *
   *     con le due luci accese     sovra -9,1   coperta -1,5   murata -27,6
   *     solo ambiente, tutti e due sovra -1     coperta +5     murata -6
   *
   * Non era ne' uniforme ne' esposizione: erano le luci. Ventidue livelli sulla
   * murata venivano da li'.
   *
   * Quindi l'avviso e' stampato dove si legge il risultato, non in un commento.
   */
  if (process.env.SENZA_LUCI !== '1') {
    console.log('  ATTENZIONE: le luci sono ACCESE da tutte e due le parti, e sono due')
    console.log('  impianti diversi. Questo numero misura soprattutto quella differenza.')
    console.log('  Per misurare la RESA: SENZA_LUCI=1 qui e LUCE=0 in cuoci.py.')
  }
  if (!n) {
    console.log('  nessun pixel in comune: le due sagome non si sovrappongono')
  } else {
    console.log(`  pixel in comune       ${n}`)
    console.log(`  scarto medio          ${(somma / n).toFixed(2)} livelli   (sito meno cotta: positivo = il sito e piu chiaro)`)
    console.log(`  scarto medio assoluto ${(sommaAss / n).toFixed(2)} livelli`)
    const mediana = (a) => { const c = a.slice().sort((p, q) => p - q); return c[Math.floor(c.length / 2)] }
    console.log(`  scarto MEDIANO        ${mediana(tutti).toFixed(2)} livelli`)
    console.log('  per fascia (dall alto in basso):')
    fasce.forEach((f, i) => {
      if (!f.n) { console.log(`    ${i + 1}  -`); return }
      const c = f.v.slice().sort((p, q) => p - q)
      console.log(`    ${i + 1}  ${String(f.n).padStart(6)} px   media ${(f.s / f.n).toFixed(2).padStart(7)}   mediana ${String(c[Math.floor(c.length / 2)]).padStart(5)}`)
    })
  }
}

await browser.close(); preview.kill(); process.exit(0)
