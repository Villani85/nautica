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
  meccanismo: {
    come: 'materiali',
    nomi: ['acciaio', 'lucido', 'carter', 'motore', 'tenuta', 'gomma', 'cavo', 'bronzo', 'sezione'],
    cosa: 'il meccanismo'
  }
}

/**
 * LA MISURA, dentro la pagina.
 *
 * Non fa riferimento a niente fuori da se': Playwright la serializza e la
 * esegue nel browser, dove nessun identificatore di questo modulo esiste.
 */
export function misuraInPagina ({ def, conColpevoli }) {
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
    let radice = null
    n.scena.traverse(o => { if (!radice && (o.name === def.chiave || o.nome === def.chiave)) radice = o })
    if (radice) radice.traverse(aggiungi)
  }
  if (!mesh.length) return { rotto: 'nessuna mesh per questo soggetto: i nomi sono cambiati' }

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
  const suo = new Set(mesh)
  const nascondi = (quali) => {
    const spente = []
    quali.forEach(o => { if (o.visible) { spente.push(o); o.visible = false } })
    return () => spente.forEach(o => { o.visible = true })
  }
  const altre = []
  n.scena.traverse(o => { if (o.isMesh && !suo.has(o)) altre.push(o) })

  /* 1 - com'e' adesso contro com'e' senza il soggetto: i suoi pixel visibili */
  const pieno = leggi()
  let torna = nascondi(mesh)
  const senzaSoggetto = leggi()
  torna()
  const visibili = differenza(pieno, senzaSoggetto)

  /* 2 - solo il soggetto contro il vuoto: la sua sagoma intera, coperta o no */
  torna = nascondi(altre)
  const soloSoggetto = leggi()
  const torna2 = nascondi(mesh)
  const vuoto = leggi()
  torna2(); torna()
  const nudi = differenza(soloSoggetto, vuoto)

  const base = { visibili, nudi, quadro: c.width * c.height, mesh: mesh.length }
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
    const rip2 = nascondi(mesh)
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

export const vaiA = (pg, f) => pg.evaluate((ff) =>
  scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * ff)), f)

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
