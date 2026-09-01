/**
 * QUELLO CHE STA DENTRO GLI AMBIENTI: tubi, passerelle, macchine.
 *
 * ─── PERCHE'
 *
 * Il mondo cotto ha 45 maglie e sono tutte SCATOLA: paratie, pagliolo,
 * soffitti, fondazioni, gradini. Nella sala macchine ci sono le fondazioni e
 * NON CI SONO LE MACCHINE. Un locale tecnico vuoto non e' un locale tecnico: e'
 * un corridoio piu' largo.
 *
 * Le luci e le materie hanno reso lo spazio leggibile -- si capisce dove si e'
 * -- ma non hanno niente da illuminare. Un riflesso corre lungo un tubo, non
 * lungo una parete liscia, ed e' il tubo che dice «nave» prima di qualunque
 * texture.
 *
 * ─── PERCHE' GENERATO E NON MODELLATO
 *
 * Stessa ragione delle materie, e lo stesso vincolo misurato: i modelli stanno
 * a 2,89 MB CHIESTI ALL'APERTURA. Un locale macchine modellato per bene sono
 * altri due o tre megabyte, e la traversata pagherebbe in attesa quello che
 * guadagna in contenuto.
 *
 * Cilindri e scatole costano qualche decina di kilobyte di vertici generati sul
 * posto. Non sono un motore vero: sono la sagoma giusta nel posto giusto, che a
 * quella velocita' di passaggio e' quello che si legge.
 *
 * ─── E LE POSIZIONI VENGONO DALLA CURVA
 *
 * Come le plafoniere. La curva della camera attraversa gli ambienti per
 * costruzione: un tubo che le corre parallelo sta lungo la parete, e se domani
 * il percorso cambia l'arredo lo segue senza che nessuno se ne ricordi.
 *
 * ─── COSA NON FA
 *
 * Non fa un motore riconoscibile, non fa targhette, non fa cavi appesi. Quelle
 * sono cose che si guardano da fermi, e qui non ci si ferma.
 */
import {
  Group, Mesh, CylinderGeometry, BoxGeometry, MeshStandardMaterial, Vector3, Box3, Matrix4, Raycaster
} from 'three'

/** Lo strato del mondo: l'arredo va illuminato dalle plafoniere, non dal cielo. */
const STRATO = 1

/**
 * ─── UN PEZZO D'ARREDO NASCE SUL SUO STRATO E CON LA SUA OMBRA
 *
 * Prima ogni pezzo faceva `layers.set(STRATO)` per conto suo, sei volte. Il
 * giorno in cui se ne aggiunge un settimo, quello nasce senza -- ed e' gia'
 * successo con `castShadow`, che in tutto il mondo non c'era: le macchine
 * poggiavano sul pagliolo senza toccarlo, e una cosa che non tocca il pavimento
 * galleggia anche se sta ferma.
 *
 * Le stanze RICEVONO e non proiettano (vedi `mondo.js`, `isolaDallaLuceDiFuori`):
 * qui sta l'altra meta', chi l'ombra la fa.
 */
function inScena (m) {
  m.layers.set(STRATO)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

/**
 * ─── I TUBI STANNO SOTTO IL SOFFITTO, CONTRO LA PARETE -- misurati, non offset
 *
 * La prima versione li metteva a un offset fisso dall'asse della camera:
 * ±0,30 m di lato e 1,22-1,36 m dal pavimento. Visti nel provino erano tre
 * tubi da 8-14 cm a trenta centimetri dalla testa, appena sotto l'occhio (che
 * sta a 1,55 m), e seguivano la curva anche SU PER LA SCALA e dentro il
 * salone: le «S» che si vedevano nel quadro erano le curve del percorso
 * disegnate in tubo. Un tubo che corre di fianco all'occhio e' un tubo che
 * occupa il quadro, e un tubo su una scala non e' di nessuna nave.
 *
 * Adesso ogni punto si misura: un raggio in alto trova il soffitto, uno di lato
 * trova la parete, e il tubo corre a `sotto` metri dal soffitto e a
 * `raggio + DALLA_PARETE_TUBO_M` dalla parete -- che e' dove i tubi corrono
 * davvero, nell'angolo fra paratia e cielino. Dove un raggio non trova niente
 * entro il limite (locale aperto, vano) il tubo si interrompe: un tubo finisce
 * su una paratia, non galleggia. E si ferma UNA PEDATA PRIMA del primo gradino:
 * da li' in avanti il segnale di movimento e' il corrimano.
 *
 * `lato` e' solo il SEGNO: +z o -z, quale parete.
 */
const TUBI = [
  { raggio: 0.055, lato: +1, sotto: 0.22, colore: 0x6b6f72, ruvido: 0.55, metallo: 0.75 },
  { raggio: 0.038, lato: +1, sotto: 0.36, colore: 0x8a6a4a, ruvido: 0.65, metallo: 0.60 },
  { raggio: 0.070, lato: -1, sotto: 0.26, colore: 0x5a5e60, ruvido: 0.60, metallo: 0.70 }
]
/** Luce fra tubo e parete. */
const DALLA_PARETE_TUBO_M = 0.06
/** Oltre questa corsa un raggio non ha trovato una parete: si e' in un vano. */
const PARETE_ENTRO_M = 3.0
const SOFFITTO_ENTRO_M = 6.0
/** Da dove parte il raggio verso l'alto: sopra il pavimento della posa, sotto l'occhio. */
const SOPRA_LA_POSA_M = 1.0

/** Le maglie del mondo cotto, escluse le cose messe da questo modulo o dalle luci. */
const NON_MURO = /^(luciPratiche|arredoMondo)$/
function maglieDelMondo (gruppo) {
  const b = []
  ;(function raccogli (o) {
    if (NON_MURO.test(o.name)) return
    if (o.isMesh && o.visible) b.push(o)
    for (const c of o.children) raccogli(c)
  })(gruppo)
  return b
}

/**
 * Un misuratore nel frame del gruppo (metri): lancia un raggio da `da` lungo
 * `verso` (versore locale) e torna la distanza in metri al primo colpo, o
 * null se entro `entro` non c'e' niente. Il Raycaster lavora in coordinate di
 * scena, quindi si trasforma all'andata e si riporta il punto al ritorno: la
 * distanza si legge nel frame in cui e' stata posta la domanda.
 */
export function misuratore (gruppo) {
  gruppo.updateWorldMatrix(true, true)
  const inversa = new Matrix4().copy(gruppo.matrixWorld).invert()
  const bersagli = maglieDelMondo(gruppo)
  const r = new Raycaster()
  r.layers.enable(STRATO)
  const o = new Vector3()
  const d = new Vector3()
  const colpito = new Vector3()
  return (da, verso, entro) => {
    o.copy(da).applyMatrix4(gruppo.matrixWorld)
    d.copy(verso).transformDirection(gruppo.matrixWorld)
    r.set(o, d)
    const c = r.intersectObjects(bersagli, false)[0]
    if (!c) return null
    colpito.copy(c.point).applyMatrix4(inversa)
    const m = colpito.distanceTo(da)
    return m <= entro ? m : null
  }
}

/** Ogni quanti campioni della curva si mette una staffa. */
const PASSO_STAFFA = 9

function materiale (colore, ruvido, metallo) {
  const m = new MeshStandardMaterial({ color: colore, roughness: ruvido, metalness: metallo })
  m.fog = false
  m.envMapIntensity = 0
  return m
}

/**
 * Arreda un gruppo lungo una curva di pose (in metri, frame del mondo).
 * @returns {number} quanti pezzi ha aggiunto -- un numero, non una promessa.
 */
export function arredaMondo (gruppo, pose) {
  if (!pose || pose.length < 4) return 0
  const arredo = new Group()
  arredo.name = 'arredoMondo'

  const matStaffa = materiale(0x4a4d4f, 0.7, 0.5)
  let pezzi = 0

  const misura = misuratore(gruppo)
  const gradini = pedateDellaScala(gruppo)
  /* i tubi finiscono una pedata prima del primo gradino; senza scala, corrono
     fino in fondo */
  const finoA = gradini.length >= 2
    ? gradini[0].x - (gradini[gradini.length - 1].x - gradini[0].x) / (gradini.length - 1)
    : Infinity
  const SU = new Vector3(0, 1, 0)
  const LATO = new Vector3()

  /**
   * ─── UN TUBO E' DRITTO, E ATTRAVERSA LE PARATIE ALLA SUA QUOTA
   *
   * La prima misura costruiva un cilindro per posa e li incatenava. Visto
   * col campo aperto (58 gradi) il risultato era sbagliato in tre modi, tutti
   * nel provino:
   *
   *  - sulle porte il raggio verso l'alto colpiva l'ARCHITRAVE (1,1 m piu' in
   *    basso del soffitto) e quello di lato lo STIPITE: il tubo faceva una V
   *    verso il basso e una virata verso il centro, cioe' «passava» la paratia
   *    piegandosi nel vano invece di attraversarla dritto alla sua quota;
   *  - i giunti fra cilindri aperti (`openEnded`) lasciavano vedere l'interno
   *    del tubo: cunei neri agli spigoli alti del quadro;
   *  - nel corridoio (0,86 m) il tubo correva a 13 cm dalla parete e finiva
   *    a mezz'aria una pedata prima della scala. In un passaggio stretto i
   *    tubi sono cassonati, non a vista.
   *
   * Adesso i punti misurati si dividono in TRATTI dove la misura salta (una
   * porta, un vano) o dove il locale e' piu' stretto di `LOCALE_MINIMO_M`, e
   * ogni tratto e' UN cilindro dritto e chiuso, dal primo all'ultimo punto,
   * alla quota e alla distanza medie -- che in una stanza a scatola sono
   * costanti al centimetro. Le due estremita' si allungano di un passo di posa
   * per entrare nella paratia: cosi' il tubo finisce DENTRO il muro, e da
   * entrambi i lati si legge come uno che passa.
   */
  const SALTO_M = 0.10
  const LOCALE_MINIMO_M = 1.0
  const passoPose = pose.length > 1 ? Math.abs(pose[1].p[0] - pose[0].p[0]) : 0.1
  for (const spec of TUBI) {
    const mat = materiale(spec.colore, spec.ruvido, spec.metallo)
    LATO.set(0, 0, spec.lato)
    const tratti = [[]]
    const spezza = () => { if (tratti[tratti.length - 1].length) tratti.push([]) }
    for (const v of pose) {
      if (v.p[0] > finoA) break
      const piede = new Vector3(v.p[0], v.p[1] + SOPRA_LA_POSA_M, v.p[2])
      const soffitto = misura(piede, SU, SOFFITTO_ENTRO_M)
      if (soffitto === null) { spezza(); continue }
      const quota = new Vector3(v.p[0], piede.y + soffitto - spec.sotto, v.p[2])
      const parete = misura(quota, LATO, PARETE_ENTRO_M)
      if (parete === null || parete < LOCALE_MINIMO_M) { spezza(); continue }
      quota.z += spec.lato * (parete - spec.raggio - DALLA_PARETE_TUBO_M)
      const ultimo = tratti[tratti.length - 1].at(-1)
      if (ultimo && (Math.abs(ultimo.y - quota.y) > SALTO_M || Math.abs(ultimo.z - quota.z) > SALTO_M)) spezza()
      tratti[tratti.length - 1].push(quota)
    }

    for (const punti of tratti) {
      if (punti.length < 2) continue
      const y = punti.reduce((a, q) => a + q.y, 0) / punti.length
      const z = punti.reduce((a, q) => a + q.z, 0) / punti.length
      const x0 = punti[0].x - passoPose
      const x1 = punti[punti.length - 1].x + passoPose
      const tubo = new Mesh(new CylinderGeometry(spec.raggio, spec.raggio, x1 - x0, 10, 1, false), mat)
      tubo.rotation.z = Math.PI / 2   // il cilindro nasce lungo Y: lo si stende lungo x
      tubo.position.set((x0 + x1) / 2, y, z)
      inScena(tubo)
      arredo.add(tubo)
      pezzi++

      /* e le staffe che lo tengono al cielino: senza, un tubo galleggia */
      for (let i = PASSO_STAFFA; i < punti.length - 1; i += PASSO_STAFFA) {
        const h = spec.sotto - spec.raggio
        const s = new Mesh(new BoxGeometry(0.02, h, 0.05), matStaffa)
        s.position.set(punti[i].x, y + spec.raggio + h / 2, z)
        inScena(s)
        arredo.add(s)
        pezzi++
      }
    }
  }

  /**
   * ─── E LE MACCHINE, dove c'e' posto per metterle
   *
   * Le fondazioni stanno nella sala macchine. Ci si mettono sopra blocchi e
   * cilindri: non sono un motore, sono la massa che una fondazione regge, ed e'
   * quella che manca quando si guarda dentro e non c'e' niente.
   *
   * Prima erano tre stazioni nei primi 1,8 m della curva, a offset fisso: la
   * prima ATTRAVERSAVA la paratia fra locale tecnico e sala macchine (l'inventario
   * la dava a x -10,36..-9,21 con la paratia a -9,49..-9,39), e il resto della
   * sala -- tre metri -- restava vuoto. Adesso una stazione si mette dove tre
   * raggi dicono che c'e' posto: di lato una parete abbastanza lontana, e
   * avanti e indietro niente entro mezza macchina. Una macchina dentro un muro
   * non e' arredo, e' un difetto.
   */
  const matMacchina = materiale(0x2f3234, 0.55, 0.65)
  const matRame = materiale(0x7a5230, 0.5, 0.8)
  const MACCHINA = { lungo: 1.15, alto: 0.72, largo: 0.62, dalCentro: 0.95 }
  const OGNI_M = 1.4
  const AVANTI = new Vector3(1, 0, 0)
  const INDIETRO = new Vector3(-1, 0, 0)
  let prossimaX = -Infinity
  for (const v of pose) {
    if (v.p[0] > finoA) break
    if (v.p[0] < prossimaX) continue
    let messa = false
    for (const lato of [-1, 1]) {
      const centro = new Vector3(v.p[0], v.p[1] + MACCHINA.alto / 2, v.p[2] + lato * MACCHINA.dalCentro)
      LATO.set(0, 0, lato)
      const parete = misura(new Vector3(v.p[0], centro.y, v.p[2]), LATO, PARETE_ENTRO_M)
      if (parete === null || parete < MACCHINA.dalCentro + MACCHINA.largo / 2 + 0.10) continue
      const mezza = MACCHINA.lungo / 2 + 0.05
      if (misura(centro, AVANTI, mezza) !== null || misura(centro, INDIETRO, mezza) !== null) continue

      /**
       * ─── UNA MACCHINA E' FATTA DI BORDI, non di volumi lisci
       *
       * Prima erano due pezzi: una scatola e un cilindro di rame. Nel provino
       * leggevano come due MACCHIE marroni senza scala -- e la ragione e' la
       * stessa per cui il metallo sembrava plastica: senza spigoli non c'e'
       * niente che accrocci la luce, e adesso che c'e' una mappa d'ambiente
       * (`creaAmbienteInterno`) un bordo si vede eccome.
       *
       * Quindi: la basetta che la solleva dal pagliolo, tre costole sul fianco,
       * e le due flange agli estremi del cilindro. Sono cinque pezzi in piu' per
       * stazione e nessuno di loro e' decorazione: la basetta dice dove poggia,
       * le costole danno la lunghezza, le flange dicono che quel cilindro e' un
       * corpo montato e non un tubo che passa.
       */
      const basetta = new Mesh(
        new BoxGeometry(MACCHINA.lungo + 0.12, 0.06, MACCHINA.largo + 0.10), matStaffa)
      basetta.position.set(centro.x, v.p[1] + 0.03, centro.z)
      inScena(basetta)
      arredo.add(basetta)

      const b = new Mesh(new BoxGeometry(MACCHINA.lungo, MACCHINA.alto, MACCHINA.largo), matMacchina)
      b.position.copy(centro)
      b.position.y += 0.06
      inScena(b)
      arredo.add(b)

      for (let k = -1; k <= 1; k++) {
        const costola = new Mesh(new BoxGeometry(0.04, MACCHINA.alto - 0.08, MACCHINA.largo + 0.03), matStaffa)
        costola.position.set(centro.x + k * (MACCHINA.lungo / 3), centro.y + 0.06, centro.z)
        inScena(costola)
        arredo.add(costola)
      }

      const t = new Mesh(new CylinderGeometry(0.16, 0.16, 0.9, 12), matRame)
      t.rotation.z = Math.PI / 2
      t.position.set(centro.x, v.p[1] + MACCHINA.alto + 0.20, centro.z)
      inScena(t)
      arredo.add(t)
      for (const q of [-1, 1]) {
        const flangia = new Mesh(new CylinderGeometry(0.20, 0.20, 0.04, 12), matMacchina)
        flangia.rotation.z = Math.PI / 2
        flangia.position.set(centro.x + q * 0.45, t.position.y, centro.z)
        inScena(flangia)
        arredo.add(flangia)
      }
      pezzi += 8
      messa = true
    }
    if (messa) prossimaX = v.p[0] + OGNI_M
  }

  pezzi += corrimano(gruppo, arredo, matStaffa)

  gruppo.add(arredo)
  return pezzi
}

/**
 * ─── IL CORRIMANO, che e' un segnale di movimento prima che un oggetto
 *
 * Il revisore, guardando il tratto della scala: si sale, ma non si vede che si
 * sale. Un pavimento che cambia quota e' invisibile in soggettiva; un
 * corrimano che scorre di fianco e' la cosa che il corpo legge come «scala».
 *
 * Non si mette a mano: si ricava dalle pedate. Si cercano le maglie
 * `*gradino*`, se ne prende il filo superiore, e il tubo corre a 0,90 m sopra
 * la linea che le unisce -- che e' l'altezza a norma, e se domani i gradini
 * diventano nove il corrimano li segue.
 *
 * Sta sul lato -z del corridoio, a 4 cm dalla parete, con un montante ogni
 * due gradini. Acciaio spazzolato: colore e finitura sono un numero sul
 * tavolo del committente, non una scelta.
 */
const ALTEZZA_CORRIMANO_M = 0.90
const RAGGIO_CORRIMANO_M = 0.021
const DALLA_PARETE_M = 0.04

/** Le pedate della scala, nel frame del gruppo (metri), ordinate lungo x. */
function pedateDellaScala (gruppo) {
  const gradini = []
  gruppo.updateWorldMatrix(true, true)
  const inversa = new Matrix4().copy(gruppo.matrixWorld).invert()
  const b = new Box3()
  gruppo.traverse((o) => {
    if (!o.isMesh || !/gradino/i.test(o.name)) return
    b.setFromObject(o).applyMatrix4(inversa)
    gradini.push({ x: (b.min.x + b.max.x) / 2, y: b.max.y, zMin: b.min.z, zMax: b.max.z })
  })
  gradini.sort((a, c) => a.x - c.x)
  return gradini
}

function corrimano (gruppo, arredo, matMontante) {
  const gradini = pedateDellaScala(gruppo)
  if (gradini.length < 2) return 0

  /* il lato: quello a -z, e il tubo sta a 4 cm dentro il filo del gradino */
  const z = Math.min(...gradini.map((g) => g.zMin)) + DALLA_PARETE_M + RAGGIO_CORRIMANO_M
  const primo = gradini[0]
  const ultimo = gradini[gradini.length - 1]
  const pedata = (ultimo.x - primo.x) / (gradini.length - 1)
  /* si prolunga di una pedata per parte: un corrimano non finisce sul gradino */
  const verso = Math.sign(pedata) || 1
  const a = new Vector3(primo.x - pedata, primo.y + ALTEZZA_CORRIMANO_M - Math.abs(ultimo.y - primo.y) / (gradini.length - 1), z)
  const c = new Vector3(ultimo.x + pedata, ultimo.y + ALTEZZA_CORRIMANO_M + Math.abs(ultimo.y - primo.y) / (gradini.length - 1), z)
  void verso

  const matTubo = materiale(0x9a9c9e, 0.35, 0.9)
  const d = new Vector3().subVectors(c, a)
  const tubo = new Mesh(new CylinderGeometry(RAGGIO_CORRIMANO_M, RAGGIO_CORRIMANO_M, d.length(), 10, 1), matTubo)
  tubo.position.copy(a).addScaledVector(d, 0.5)
  tubo.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), d.clone().normalize())
  inScena(tubo)
  tubo.name = 'corrimano'
  arredo.add(tubo)
  let pezzi = 1

  /* i montanti: uno ogni due gradini, dal tubo giu' alla pedata */
  for (let i = 0; i < gradini.length; i += 2) {
    const g = gradini[i]
    const t = (g.x - a.x) / (c.x - a.x)
    const yTubo = a.y + (c.y - a.y) * t
    const h = yTubo - g.y
    if (h <= 0) continue
    const m = new Mesh(new CylinderGeometry(0.012, 0.012, h, 8), matMontante)
    m.position.set(g.x, g.y + h / 2, z)
    inScena(m)
    m.name = 'montante'
    arredo.add(m)
    pezzi++
  }
  return pezzi
}
