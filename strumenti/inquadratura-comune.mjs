/**
 * QUANTO SI VEDE IL SOGGETTO DI UNA BATTUTA — la misura, condivisa.
 *
 * La usano in due: `_inquadrature-misura.mjs` (diagnosi, stampa tutto) e
 * `collaudo-inquadrature.mjs` (cancello, tiene ferme le soglie). Stanno qui
 * insieme perche' due copie della stessa misura divergono, e il giorno in cui
 * divergono il cancello e la diagnosi raccontano due siti diversi.
 *
 * Tre grandezze:
 *
 *   presenza   = pixel del soggetto visibili / pixel del quadro
 *   occlusione = 1 - (visibili / sagoma intera col vuoto davanti)
 *   colpevoli  = quanta di quella occlusione la mette ciascun ramo della scena
 *
 * La seconda e' la ragione per cui questo esiste. Un soggetto puo' occupare lo
 * 0,6% del quadro perche' e' lontano (va bene) oppure perche' e' coperto per un
 * terzo da una paratia (non va bene), e le due cose danno lo STESSO numero di
 * presenza. Solo confrontandole si distinguono. La terza e' la sola che rende
 * la misura azionabile: «coperto al 31%» non dice cosa fare, «lo copre il ramo
 * della nave per il 30%» si'.
 */

/**
 * Chi e' il soggetto di ogni battuta.
 *
 * `materiali` isola per nome di materiale (il meccanismo, che e' fatto di pezzi
 * sparsi dentro la nave); `nave` e `sottoalbero` isolano per antenato. Le due
 * strade servono perche' le due domande sono diverse: «il PEZZO si vede» e «la
 * NAVE e' in quadro».
 */
export const SOGGETTI = {
  salotto: { come: 'sottoalbero', chiave: 'SALONE3D', cosa: 'la fotografia del salone' },
  emerge: { come: 'nave', cosa: 'la nave vista da fuori' },
  mare: { come: 'nave', cosa: 'la nave sul mare' },
  invito: { come: 'nave', cosa: 'la nave, col comando a portata' },
  calma: { come: 'nave', cosa: 'la nave che smette di rollare' },
  taglio: { come: 'nave', cosa: 'la sezione aperta' },
  /**
   * ─── IL MECCANISMO SI DEFINISCE PER RADICE, NON PER NOMI DI MATERIALE
   *
   * Qui c'era la lista dei materiali -- acciaio, lucido, carter, motore,
   * tenuta, gomma, cavo, bronzo, sezione -- copiata da `collaudo-varco`. Per
   * quel cancello va bene: gli serve accendere un'emissiva su tutto cio' che e'
   * meccanico, e qualche pezzo in piu' non sposta un contrasto.
   *
   * Per una misura di INQUADRATURA no. Misurato, sulle 74 mesh che quella lista
   * raccoglie:
   *
   *     IMPIANTO      48 mesh   x -1,95 .. 1,95 nello scafo
   *     (senza nome)  10 mesh
   *     PROPULSIONE   10 mesh
   *     GIROSCOPIO     6 mesh
   *
   * **Sedici mesh su settantaquattro non sono l'impianto delle pinne**: sono la
   * propulsione e il giroscopio, due apparati diversi che stanno altrove nella
   * nave. Presenza e occlusione calcolate su quel miscuglio non descrivono
   * nessuno dei tre, e nessuna posa di camera puo' migliorarle -- una parte del
   * "soggetto" e' sempre da un'altra parte.
   *
   * La battuta dice cosa vuole mostrare: *«Servomotor, cycloidal reduction,
   * output carrier, shaft, gland, fin»*. E' `IMPIANTO`. E' quello il soggetto.
   */
  meccanismo: {
    come: 'sottoalbero',
    chiave: 'IMPIANTO',
    cosa: 'l impianto delle pinne'
  }
}

/**
 * LA MISURA, dentro la pagina.
 *
 * Non fa riferimento a niente fuori da se': Playwright la serializza e la
 * esegue nel browser, dove nessun identificatore di questo modulo esiste.
 */
export function misuraInPagina ({ def, conColpevoli, soloLato }) {
  const n = window.__nautica
  const t = n.render.domElement
  const c = document.createElement('canvas'); c.width = t.width; c.height = t.height
  const x = c.getContext('2d')

  /**
   * ─── SI PULISCE LA TELA PRIMA DI COPIARCI SOPRA
   *
   * DIFETTO PAGATO SCRIVENDO QUESTO. `drawImage` su un contesto 2D **fonde**,
   * non sostituisce: dove il fotogramma nuovo e' trasparente resta quello
   * vecchio. Il renderer del sito ha il canale alfa, quindi una scena vuota e'
   * trasparente -- e il confronto «solo il soggetto» contro «niente» leggeva
   * 2.968 pixel di differenza su un soggetto che ne occupava 627.992. Non era
   * una scena sbagliata: era la tela precedente che traspariva da sotto, e il
   * risultato era un'occlusione del -21.058%.
   *
   * `collaudo-varco` non ci e' mai incappato perche' confronta due fotogrammi
   * con la STESSA geometria: sotto c'era sempre la stessa cosa.
   */
  const leggi = () => {
    n.render.render(n.scena, n.camera)
    x.clearRect(0, 0, c.width, c.height)
    x.drawImage(t, 0, 0)
    return x.getImageData(0, 0, c.width, c.height).data
  }

  const differenza = (a, b) => {
    let q = 0
    for (let i = 0; i < a.length; i += 4) {
      /* l'alfa conta: fra «geometria» e «niente» la differenza sta li', e su un
         pezzo scuro contro fondo scuro sarebbe l'unica */
      const d = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) +
                Math.abs(a[i + 2] - b[i + 2]) + Math.abs(a[i + 3] - b[i + 3])
      if (d > 12) q++
    }
    return q
  }

  /* --- chi e' il soggetto --- */
  const mesh = []
  const aggiungi = (o) => { if (o.isMesh && o.material) mesh.push(o) }
  if (def.come === 'materiali') {
    const suoi = new Set(def.nomi)
    n.nave.traverse(o => {
      if (!o.isMesh || !o.material) return
      if ([].concat(o.material).some(m => suoi.has(String(m.name)))) aggiungi(o)
    })
  } else if (def.come === 'nave') {
    n.nave.traverse(aggiungi)
  } else {
    /**
     * TUTTE le radici con quel nome, non la prima.
     *
     * Gli impianti sono due, uno per fianco, e possono comparire come due nodi
     * con lo stesso nome. Fermarsi al primo avrebbe misurato mezzo soggetto e
     * chiamato baseline il risultato -- e per giunta in silenzio, che e' il
     * modo in cui questi errori sopravvivono.
     */
    const radici = []
    n.scena.traverse(o => { if (o.name === def.chiave || o.nome === def.chiave) radici.push(o) })
    for (const r of radici) r.traverse(aggiungi)
  }
  if (!mesh.length) return { rotto: 'nessuna mesh per questo soggetto: i nomi sono cambiati' }

  /**
   * ─── SE IL SOGGETTO E' DOPPIO, SI MISURA IL BERSAGLIO, NON LA MEDIA
   *
   * Il meccanismo di questa nave e' **doppio**: un impianto per fianco.
   * Misurato: 29 mesh a sinistra, 30 a dritta, 15 sulla mezzeria, da -4,18 a
   * +4,16 metri.
   *
   * Chi calcola «il centro dell'ingombro del soggetto» ottiene un punto **sulla
   * mezzeria, dove non c'e' nessuna macchina**. Una camera che inquadra
   * benissimo l'impianto di dritta risulta puntata di fianco a un fantasma: la
   * prima versione del registratore stampava **86,5 gradi di scarto** su una
   * macchina che occupava il 6-11% del quadro. Numero assurdo, e l'ho creduto
   * per qualche minuto.
   *
   * E presenza e occlusione, mescolando i due impianti, danno un numero che non
   * descrive nessuna delle due macchine -- e che nessuna posa di camera puo'
   * migliorare, perche' meta' del soggetto e' dall'altra parte dello scafo.
   *
   * Quindi il bersaglio non si deduce da una media: si SCEGLIE, si dichiara, e
   * l'altro fianco resta come controllo. Con la regia attuale la mira narrativa
   * e' `MIRA_MECCANISMO = 1.15`, positiva: il bersaglio e' **dritta**.
   *
   * ─── E UNA MESH A CAVALLO NON SI ASSEGNA A CASO
   *
   * Alcune parti stanno legittimamente sulla mezzeria, simmetriche attorno allo
   * zero: quelle sono centrali e vanno bene. Una che invece sborda da una parte
   * sola in modo asimmetrico non e' ne' di un fianco ne' centrale: e' AMBIGUA,
   * e metterla da una parte falserebbe l'ingombro del bersaglio. Si dichiara e
   * si ferma, invece di sceglierne una in silenzio.
   *
   * Vive dentro questa funzione e non fuori perche' Playwright la serializza e
   * la esegue NEL BROWSER, dove nessun identificatore di questo modulo esiste.
   * L'ho scoperto scrivendola fuori.
   *
   * ─── E IL FIANCO SI DECIDE NEL SISTEMA DELLO SCAFO, NON DEL MONDO
   *
   * La prima versione classificava sulla X di MONDO, ed e' quello che chiedeva
   * la specifica. Il controllo severo l'ha bocciata subito, e aveva ragione:
   * le mesh «a cavallo» erano **11, poi 16, poi 13, poi 1** a seconda del
   * campione.
   *
   * Il motivo e' che **la nave rolla**. Un pezzo che appartiene senza dubbio
   * all'impianto di dritta ha il proprio ingombro di mondo che scavalca lo zero
   * appena lo scafo si inclina, e cambia fianco fra un fotogramma e l'altro. Una
   * classificazione che dipende dal rollio non e' una classificazione: e' un
   * sorteggio con la faccia seria.
   *
   * Il fianco di un pezzo e' una proprieta' della NAVE, non del mondo. Quindi si
   * misura nel sistema dello scafo -- `nave.matrixWorld` invertita -- dove
   * dritta resta dritta a qualunque angolo di rollio.
   *
   * (`Matrix4` non serve importarlo: le matrici che la scena gia' possiede
   * hanno `clone`, `invert` e `multiply` come metodi d'istanza.)
   */
  const inversaNave = n.nave && n.nave.matrixWorld ? n.nave.matrixWorld.clone().invert() : null
  const scatolaMondo = (lista) => {
    if (!lista.length) return null
    let a = Infinity, b = Infinity, cc = Infinity, d = -Infinity, e = -Infinity, f = -Infinity
    for (const m of lista) {
      if (!m.geometry) continue
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox()
      m.updateWorldMatrix(true, false)
      const q = m.matrixWorld.elements
      const bb = m.geometry.boundingBox
      for (const vx of [bb.min.x, bb.max.x]) for (const vy of [bb.min.y, bb.max.y]) for (const vz of [bb.min.z, bb.max.z]) {
        const wx = q[0] * vx + q[4] * vy + q[8] * vz + q[12]
        const wy = q[1] * vx + q[5] * vy + q[9] * vz + q[13]
        const wz = q[2] * vx + q[6] * vy + q[10] * vz + q[14]
        if (wx < a) a = wx; if (wx > d) d = wx
        if (wy < b) b = wy; if (wy > e) e = wy
        if (wz < cc) cc = wz; if (wz > f) f = wz
      }
    }
    return { min: [a, b, cc], max: [d, e, f], centro: [(a + d) / 2, (b + e) / 2, (cc + f) / 2] }
  }

  const TOLL = 0.02
  const fianchi = { dritta: [], sinistra: [], centrale: [], ambigua: [] }
  for (const m of mesh) {
    const g = m.geometry
    if (!g) { fianchi.ambigua.push(m); continue }
    if (!g.boundingBox) g.computeBoundingBox()
    m.updateWorldMatrix(true, false)
    /* la X che conta e' quella nello scafo: col rollio la X di mondo cambia
       fianco a un pezzo che non si e' mosso di un millimetro dalla nave */
    const q = (inversaNave ? inversaNave.clone().multiply(m.matrixWorld) : m.matrixWorld).elements
    const bb = g.boundingBox
    let xmin = Infinity, xmax = -Infinity
    for (const vx of [bb.min.x, bb.max.x]) for (const vy of [bb.min.y, bb.max.y]) for (const vz of [bb.min.z, bb.max.z]) {
      const wx = q[0] * vx + q[4] * vy + q[8] * vz + q[12]
      if (wx < xmin) xmin = wx
      if (wx > xmax) xmax = wx
    }
    if (xmin > TOLL) fianchi.dritta.push(m)
    else if (xmax < -TOLL) fianchi.sinistra.push(m)
    else {
      const a = Math.abs(xmin), b = Math.abs(xmax), gr = Math.max(a, b)
      ;(gr < 1e-6 || Math.abs(a - b) / gr < 0.2 ? fianchi.centrale : fianchi.ambigua).push(m)
    }
  }
  const scatole = {
    dritta: scatolaMondo(fianchi.dritta),
    sinistra: scatolaMondo(fianchi.sinistra),
    centrale: scatolaMondo(fianchi.centrale)
  }
  const conteggio = {
    dritta: fianchi.dritta.length, sinistra: fianchi.sinistra.length,
    centrale: fianchi.centrale.length, ambigua: fianchi.ambigua.length
  }
  let mie = mesh
  if (soloLato) {
    if (fianchi.ambigua.length) {
      return { rotto: `${fianchi.ambigua.length} mesh stanno a cavallo della mezzeria in modo ` +
        'asimmetrico: non sono ne di un fianco ne centrali, e assegnarle falserebbe ' +
        'l ingombro del bersaglio', conteggio, scatole }
    }
    mie = fianchi[soloLato]
    if (!mie || !mie.length) return { rotto: `nessuna mesh sul fianco "${soloLato}"`, conteggio, scatole }
  }

  /**
   * ─── LA MASCHERA SI FA NASCONDENDO, NON ACCENDENDO L'EMISSIVA
   *
   * `collaudo-varco` e `maschera-soggetto.mjs` isolano il soggetto dandogli
   * un'emissiva rossa e guardando quali pixel cambiano. Funziona per il
   * meccanismo, che e' `MeshStandardMaterial`, e **non funziona per il
   * salone**: la fotografia e' un `MeshBasicMaterial`, che l'emissiva non ce
   * l'ha proprio. Misurato: presenza 0,00% su quattro mesh presenti e visibili
   * -- un altro numero sbagliato senza errore.
   *
   * Nascondere il soggetto e guardare quali pixel cambiano vale per QUALUNQUE
   * materiale, perche' non chiede niente al materiale. Il caso che perde e' un
   * soggetto identico allo sfondo dietro di lui, e in una scena illuminata non
   * capita.
   */
  const suo = new Set(mie)
  const nascondi = (quali) => {
    const spente = []
    quali.forEach(o => { if (o.visible) { spente.push(o); o.visible = false } })
    return () => spente.forEach(o => { o.visible = true })
  }
  const altre = []
  n.scena.traverse(o => { if (o.isMesh && !suo.has(o)) altre.push(o) })

  /* 1 - com'e' adesso contro com'e' senza il soggetto: i suoi pixel visibili */
  const pieno = leggi()
  let torna = nascondi(mie)
  const senzaSoggetto = leggi()
  torna()
  const visibili = differenza(pieno, senzaSoggetto)

  /* 2 - solo il soggetto contro il vuoto: la sua sagoma intera, coperta o no */
  torna = nascondi(altre)
  const soloSoggetto = leggi()
  const torna2 = nascondi(mie)
  const vuoto = leggi()
  torna2(); torna()
  const nudi = differenza(soloSoggetto, vuoto)

  const base = { visibili, nudi, quadro: c.width * c.height, mesh: mie.length, conteggio, scatole, lato: soloLato || 'tutti' }
  if (!conColpevoli || nudi === 0 || visibili >= nudi * 0.995) return { ...base, colpevoli: [] }

  /* 3 - e chi lo copre: per ogni ramo di primo livello, quanto risale la
     presenza del soggetto se quel ramo sparisce */
  const colpevoli = []
  n.scena.children.forEach((ramo, idx) => {
    const suoiRami = []
    ramo.traverse(o => { if (o.isMesh && !suo.has(o)) suoiRami.push(o) })
    if (!suoiRami.length) return
    const rip = nascondi(suoiRami)
    const senzaRamo = leggi()
    const rip2 = nascondi(mie)
    const senzaRamoNeSoggetto = leggi()
    rip2(); rip()
    const recuperati = differenza(senzaRamo, senzaRamoNeSoggetto) - visibili
    if (recuperati > nudi * 0.01) {
      colpevoli.push({
        ramo: ramo.name || ramo.nome || `${ramo.type}[${idx}]`,
        quota: +(100 * recuperati / nudi).toFixed(1),
        mesh: suoiRami.length
      })
    }
  })
  colpevoli.sort((a, b) => b.quota - a.quota)
  return { ...base, colpevoli }
}

/**
 * DOVE VIVE UNA BATTUTA, in frazioni di scorrimento.
 *
 * Si CERCA, non si indovina: e' la regola che `collaudo-varco` e
 * `collaudo-manopola` hanno gia' pagato due volte. Una frazione di pagina
 * scritta a mano smette di valere il giorno in cui il documento cambia, e il
 * sintomo non e' un rosso onesto -- e' una statistica calcolata sul rumore, su
 * un fotogramma in cui il soggetto non c'e'.
 */
export const trovaArco = (pg, battuta) => pg.evaluate(async (b) => {
  const H = document.documentElement.scrollHeight - innerHeight
  let da = null; let a = null
  for (let f = 0; f <= 1.0001; f += 0.005) {
    scrollTo(0, Math.round(H * f))
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    const palco = document.querySelector('.palco[data-battuta]')
    if (palco && palco.dataset.battuta === b) { if (da === null) da = f; a = f }
    else if (da !== null) break
  }
  return da === null ? null : { da, a }
}, battuta)

/**
 * ─── `f` E' UNA FRAZIONE DEL RACCONTO, NON DELLA PAGINA
 *
 * DIFETTO PRESO DALLA CI, e la causa e' una regola di questo repo violata
 * dentro un cancello. Questa funzione faceva
 *
 *     scrollTo(0, (scrollHeight - innerHeight) * f)
 *
 * cioe' misurava in FRAZIONI DI PAGINA. Finche' la pagina non cambia lunghezza
 * funziona; il giorno in cui l'antefatto e' passato da 1,0 a 0,5 schermi, ogni
 * campione si e' spostato rispetto al racconto e il cancello ha misurato le
 * battute nei punti sbagliati. Il meccanismo e' passato da 7,93% a 5,68% di
 * quadro e la superficie dell'acqua e' comparsa a coprirlo per il 19%.
 *
 * Il sito non era peggiorato: era il METRO ad aver cambiato scala sotto la
 * misura -- e per giunta il metro accusava il sito.
 *
 * `demo.js` pubblica apposta `cimaSezione` e `corsaRacconto`, e il commento
 * accanto spiega che esistono per non far cercare a nessuno il punto per
 * bisezione. Erano li' da prima di oggi.
 */
export const vaiA = (pg, f) => pg.evaluate((ff) => {
  const n = window.__nautica
  if (n && typeof n.cimaSezione === 'number' && n.corsaRacconto > 0) {
    scrollTo(0, Math.round(n.cimaSezione + n.corsaRacconto * ff))
    return
  }
  /* senza la maniglia si ripiega sulla pagina, ma e' un ripiego dichiarato:
     senza `?ispeziona=1` questo cancello non misura quello che crede */
  scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * ff))
}, f)

/**
 * ─── SI ASPETTA CHE LA CAMERA SIA ARRIVATA, NON UN SECONDO E DUE DECIMI
 *
 * DIFETTO PRESO ALLA PRIMA CORSA DEL CANCELLO. Con un'attesa a orologio la
 * battuta del meccanismo leggeva **8,02% di quadro** nella diagnosi e **6,40%**
 * nel cancello, a parita' di sito e di posizione: la camera non aveva ancora
 * finito di avvicinarsi. Uno scarto del 20% fra due corse identiche non e'
 * rumore accettabile in una misura su cui poggia una soglia -- e la cura non e'
 * abbassare la soglia finche' ci sta dentro, che sarebbe indebolire il cancello
 * per farlo tornare verde.
 *
 * La camera del sito insegue la posizione di scorrimento con un filtro: dopo
 * uno `scrollTo` continua a muoversi per qualche decimo. Si aspetta che si
 * FERMI -- due letture consecutive a meno di un millesimo di unita', cioe' due
 * millimetri e mezzo -- e allora la misura vale.
 *
 * Costa una `evaluate` minuscola per giro, non otto render: e' l'attesa piu'
 * economica che questo repo abbia.
 */
export async function attendiCameraFerma (pg, { giri = 40, quiete = 3 } = {}) {
  let prec = null
  let fermi = 0
  for (let i = 0; i < giri; i++) {
    const p = await pg.evaluate(() => {
      const c = window.__nautica.camera
      return [c.position.x, c.position.y, c.position.z]
    })
    if (prec && Math.hypot(p[0] - prec[0], p[1] - prec[1], p[2] - prec[2]) < 0.001) {
      if (++fermi >= quiete) return { fermo: true, giri: i + 1 }
    } else fermi = 0
    prec = p
    await new Promise(r => setTimeout(r, 100))
  }
  return { fermo: false, giri }
}
