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
  Group, Mesh, CylinderGeometry, BoxGeometry, MeshStandardMaterial, Vector3
} from 'three'

/** Lo strato del mondo: l'arredo va illuminato dalle plafoniere, non dal cielo. */
const STRATO = 1

/** Quanti tubi corrono lungo il percorso, e a che distanza dall'asse. */
const TUBI = [
  { raggio: 0.055, lato: +0.30, alto: 1.36, colore: 0x6b6f72, ruvido: 0.55, metallo: 0.75 },
  { raggio: 0.038, lato: +0.30, alto: 1.22, colore: 0x8a6a4a, ruvido: 0.65, metallo: 0.60 },
  { raggio: 0.070, lato: -0.30, alto: 1.30, colore: 0x5a5e60, ruvido: 0.60, metallo: 0.70 }
]

/** Ogni quanti campioni della curva si mette una staffa. */
const PASSO_STAFFA = 9

function materiale (colore, ruvido, metallo) {
  const m = new MeshStandardMaterial({ color: colore, roughness: ruvido, metalness: metallo })
  m.fog = false
  m.envMapIntensity = 0
  return m
}

/**
 * Un tubo spezzato che segue la curva: un cilindro per tratto, orientato fra
 * due campioni. Una spline sarebbe piu' bella e costerebbe una geometria
 * personalizzata; a questa velocita' di passaggio la spezzata non si legge.
 */
function tuboLungo (punti, spec, mat) {
  const g = new Group()
  for (let i = 0; i < punti.length - 1; i++) {
    const a = punti[i]
    const b = punti[i + 1]
    const d = new Vector3().subVectors(b, a)
    const l = d.length()
    if (l < 1e-4) continue
    const c = new Mesh(new CylinderGeometry(spec.raggio, spec.raggio, l, 8, 1, true), mat)
    c.position.copy(a).addScaledVector(d, 0.5)
    /* il cilindro nasce lungo Y: lo si punta lungo il tratto */
    c.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), d.clone().normalize())
    c.layers.set(STRATO)
    g.add(c)
  }
  return g
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

  for (const spec of TUBI) {
    const mat = materiale(spec.colore, spec.ruvido, spec.metallo)
    /* i punti del tubo: la posa spostata di lato e in alto. Il "lato" e' Z nel
       frame del mondo, che e' la larghezza del corridoio -- x e' la lunghezza. */
    const punti = pose.map((v) => new Vector3(v.p[0], v.p[1] + spec.alto, v.p[2] + spec.lato))
    const t = tuboLungo(punti, spec, mat)
    pezzi += t.children.length
    arredo.add(t)

    /* e le staffe che lo tengono: senza, un tubo galleggia */
    for (let i = PASSO_STAFFA; i < punti.length - 1; i += PASSO_STAFFA) {
      const s = new Mesh(new BoxGeometry(0.02, 0.16, 0.05), matStaffa)
      s.position.copy(punti[i]).add(new Vector3(0, 0.08, Math.sign(spec.lato) * 0.02))
      s.layers.set(STRATO)
      arredo.add(s)
      pezzi++
    }
  }

  /**
   * ─── E LE MACCHINE, dove le fondazioni ci sono gia'
   *
   * Le fondazioni stanno nella sala macchine, cioe' nel primo terzo della
   * curva -- il tratto piu' lontano dal salone. Ci si mettono sopra due blocchi
   * e un paio di cilindri: non sono un motore, sono la massa che una fondazione
   * regge, ed e' quella che manca quando si guarda dentro e non c'e' niente.
   */
  const matMacchina = materiale(0x2f3234, 0.55, 0.65)
  const matRame = materiale(0x7a5230, 0.5, 0.8)
  const quanti = Math.max(2, Math.floor(pose.length * 0.22))
  for (let i = 2; i < quanti; i += Math.max(3, Math.floor(quanti / 3))) {
    const v = pose[i]
    for (const lato of [-1, 1]) {
      const b = new Mesh(new BoxGeometry(1.15, 0.72, 0.62), matMacchina)
      b.position.set(v.p[0], v.p[1] + 0.36, v.p[2] + lato * 0.95)
      b.layers.set(STRATO)
      arredo.add(b)

      const t = new Mesh(new CylinderGeometry(0.16, 0.16, 0.9, 12), matRame)
      t.rotation.z = Math.PI / 2
      t.position.set(v.p[0], v.p[1] + 0.86, v.p[2] + lato * 0.95)
      t.layers.set(STRATO)
      arredo.add(t)
      pezzi += 2
    }
  }

  gruppo.add(arredo)
  return pezzi
}
