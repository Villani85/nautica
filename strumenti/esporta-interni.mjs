/**
 * ESPORTA-INTERNI — passa a Blender la forma VERA dello scafo, stazione per
 * stazione, piu' la griglia dell'atto due letta dove e' gia' dichiarata.
 *
 *     node strumenti/esporta-interni.mjs [uscita.json]
 *
 * E' lo stesso mestiere di `esporta-coperta.mjs` e per la stessa ragione: la
 * curva dello scafo vive in `src/scafo/ordinate.js`, e riscriverla in Python
 * sarebbe la seconda implementazione della stessa cosa. Qui pesa anche di piu'
 * che per la sovrastruttura: gli interni si TAGLIANO sulla forma dello scafo,
 * quindi una copia divergente non produrrebbe una fessura di luce ma un
 * pagliolato che sporge attraverso il fasciame -- e siccome il piano di sezione
 * toglie la meta' di dritta, lo si vedrebbe solo dal lato che si guarda.
 *
 * ─── COSA ESCE, E PERCHE' PROPRIO QUESTO
 *
 * 1. IL CONTORNO DI MEZZA SEZIONE, lato BABORDO, a N stazioni. Non la tabella
 *    delle ordinate: il contorno gia' interpolato da `contornoA`, cioe' la
 *    stessa lista di punti con cui il sito cuce il guscio. Blender non
 *    interpola niente di suo.
 *
 *    La meta' di babordo e non tutte e due perche' `src/scena/index.js` taglia
 *    con `Plane(1,0,0)` e tiene `x < 0`: quello che sta a dritta non si vede
 *    mai. Costruirlo sarebbe peso spedito per niente.
 *
 * 2. LE QUATTRO STAZIONI E LE TRE QUOTE, convertite in coordinate di scena con
 *    LA STESSA FORMULA che usa il sito. `src/ui/atto-due.js` dichiara `x` e `y`
 *    normalizzate e avverte che non sono coordinate di scena; ma `index.js`,
 *    in `vaiACella`, le converte gia' -- e quella conversione ha due costanti,
 *    `PONTE_Y` e `CHIGLIA_Y`, che non sono esportate.
 *
 *    Ricopiarle qui le farebbe divergere in silenzio: la camera andrebbe a una
 *    quota e il pagliolato starebbe a un'altra, e non ci sarebbe nessun errore
 *    da leggere -- solo un pavimento all'altezza sbagliata. Quindi si LEGGONO
 *    dal sorgente per NOME, che e' l'idioma che `collaudo-glb.mjs` si e' gia'
 *    dato per `PRUA_Z` e `POPPA_Z`. Se qualcuno le rinomina, questo strumento
 *    esce con errore invece di inventare un numero.
 *
 * 3. LE TRE CELLE RICCHE. La catena causale del §4 ha tre sistemi e sono loro a
 *    portare l'argomento; le altre nove celle sono stive e vuoti tecnici, e una
 *    sentina E' un vuoto. Gli id non si inventano: si leggono da `SISTEMI`.
 *
 * ─── UNITA'
 *
 * Esce in unita' di scena (1 = 2,5 m) perche' e' l'unita' in cui la curva e'
 * scritta. La conversione in metri la fa Blender, che e' l'unico posto dove i
 * metri servono davvero -- glTF li impone.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { PRUA_Z, POPPA_Z, sezioneA, contornoA, tDaZ } from '../src/scafo/ordinate.js'
import { STAZIONI, QUOTE, SISTEMI } from '../src/ui/atto-due.js'

const FUORI = process.argv[2] ?? 'interni.json'
const STAZIONI_CAMPIONATE = 81      // 20 m / 80 intervalli = 50 cm di passo
const M_PER_UNITA = 2.5

/**
 * Le due costanti della conversione, lette dal sorgente vivo.
 *
 * Non sono esportate da `index.js` e non ho il permesso di toccare quel file;
 * ma copiarle sarebbe peggio che leggerle male, perche' una copia non da'
 * errore. Questa lettura, se il nome sparisce, lo da'.
 */
function costanteDiScena (nome) {
  const src = readFileSync('src/scena/index.js', 'utf8')
  const r = new RegExp('const\\s+' + nome + '\\s*=\\s*(-?[0-9.]+)').exec(src)
  if (!r) {
    throw new Error(`in src/scena/index.js non trovo ${nome}. La conversione fra la ` +
                    'griglia dell\'atto due e le coordinate di scena vive li\': se e\' ' +
                    'stata rinominata questo strumento va aggiornato, non indovinato.')
  }
  return Number(r[1])
}

const PONTE_Y = costanteDiScena('PONTE_Y')
const CHIGLIA_Y = costanteDiScena('CHIGLIA_Y')

const zDiStazione = x => PRUA_Z + x * (POPPA_Z - PRUA_Z)
const yDiQuota = y => PONTE_Y + y * (CHIGLIA_Y - PONTE_Y)

/**
 * IL CONTORNO DI BABORDO, dalla chiglia al trincarino.
 *
 * `contornoA` percorre: chiglia, poi il lato dritto salendo, poi il lato
 * sinistro RIDISCENDENDO. Il pezzo che serve e' l'ultimo, rovesciato, con la
 * chiglia in testa.
 *
 * ─── E QUI C'E' UNA PROPRIETA' CHE VALE TUTTO IL RESTO DELLO SCRIPT
 *
 * Lungo questo contorno **y cresce sempre e |x| cresce sempre**: dalla chiglia
 * allo spigolo di carena, dallo spigolo al trincarino. Quindi la mezza sezione
 * e' una FUNZIONE x = f(y), a un valore solo.
 *
 * Non e' un dettaglio: e' la ragione per cui in Blender ogni pezzo tagliato
 * sullo scafo -- pagliolati, paratie, ossatura -- si costruisce a righe di y
 * senza un solo booleano. Un booleano su una superficie loftata e' la fabbrica
 * di facce degeneri di questo repo. Se un domani le ordinate producessero un
 * rientro (semilarg che scende salendo), questa proprieta' cadrebbe: il
 * controllo qui sotto e' li' per accorgersene invece di produrre un modello
 * sbagliato in silenzio.
 */
function contornoBabordo (t) {
  const c = contornoA(t)
  const meta = (c.length - 1) / 2
  const p = [c[0], ...c.slice(1 + meta).reverse()]
  for (let i = 1; i < p.length; i++) {
    if (p[i][1] < p[i - 1][1] - 1e-9) {
      throw new Error(`a t=${t.toFixed(3)} il contorno di babordo scende in y fra il punto ` +
                      `${i - 1} e il ${i}: la mezza sezione non e' piu' una funzione di y, ` +
                      'e tutta la costruzione degli interni presuppone che lo sia.')
    }
    if (Math.abs(p[i][0]) < Math.abs(p[i - 1][0]) - 1e-9) {
      throw new Error(`a t=${t.toFixed(3)} il contorno di babordo rientra in x fra il punto ` +
                      `${i - 1} e il ${i}: stessa rottura, vista sull'altro asse.`)
    }
  }
  return p
}

const punti = []
for (let i = 0; i < STAZIONI_CAMPIONATE; i++) {
  const u = i / (STAZIONI_CAMPIONATE - 1)
  const z = PRUA_Z + u * (POPPA_Z - PRUA_Z)
  const t = tDaZ(z)
  const s = sezioneA(t)
  punti.push({
    z: +z.toFixed(5),
    chiglia: +s.chiglia.toFixed(5),
    ponteY: +s.ponteY.toFixed(5),
    semilarg: +s.semilarg.toFixed(5),
    contorno: contornoBabordo(t).map(([x, y]) => [+x.toFixed(5), +y.toFixed(5)])
  })
}

/**
 * ─── LE TRE QUOTE DIVENTANO TRE PAGLIOLATI, E LA REGOLA E' UNA SOLA
 *
 * `vaiACella` porta la camera all'OCCHIO, non al pavimento. Il pagliolato sta
 * sotto, e la distanza fra i due e' una scelta di messa in scena dichiarata
 * qui: 1,55 m. Non e' l'altezza d'occhio di una persona in piedi (1,60-1,70):
 * e' quella che, misurata contro questo scafo, tiene tutti e tre i piani
 * dentro il guscio. Il numero e' scritto UNA volta e stampato in fondo insieme
 * all'altezza libera che produce, perche' chi lo cambia veda subito cosa rompe.
 *
 * ─── E LA SENTINA NON PUO' AVERE UN PIANO ORIZZONTALE
 *
 * MISURATO, non deciso: l'occhio della sentina sta a -0,557 e il pagliolato
 * cadrebbe a -1,177, mentre la chiglia piu' profonda di questo scafo e' a
 * -0,940. Un piano orizzontale a quella quota sarebbe interamente FUORI dallo
 * scafo, e il taglio sulla forma vera lo farebbe sparire del tutto -- cioe' la
 * cella piu' bassa dell'atto due resterebbe senza pavimento, senza nessun
 * errore da leggere.
 *
 * Un piano orizzontale piu' alto (la quota minima della chiglia, -0,84) sarebbe
 * FUORI dallo scafo a poppa, dove la chiglia risale a -0,60: la cella
 * poppa/sentina resterebbe senza pavimento. Misurato anche quello.
 *
 * Quindi il pagliolato di sentina SEGUE la chiglia con uno scostamento fisso.
 * Non e' un ripiego: e' cio' che e' davvero un pagliolato di sentina -- una
 * grigliata appoggiata sui madieri, che segue il fondo. Gli altri due sono
 * ponti veri e restano orizzontali, perche' un ponte lo e'.
 */
const OCCHIO_SUL_PAGLIOLATO = 1.55 / M_PER_UNITA     // 0,62 unita'
const SENTINA_SULLA_CHIGLIA = 0.25 / M_PER_UNITA     // 10 cm di unita', 25 cm veri

const chigliaMin = Math.min(...punti.map(p => p.chiglia))
const quote = QUOTE.map((q, i) => {
  const occhio = yDiQuota(q.y)
  const piano = occhio - OCCHIO_SUL_PAGLIOLATO
  const segueChiglia = piano < chigliaMin
  return {
    id: q.id,
    nome: q.nome,
    yNormalizzata: q.y,
    occhio: +occhio.toFixed(5),
    /** `null` quando il pagliolato segue la chiglia invece di stare a una quota. */
    piano: segueChiglia ? null : +piano.toFixed(5),
    segueChiglia,
    scostamentoChiglia: segueChiglia ? +SENTINA_SULLA_CHIGLIA.toFixed(5) : null,
    laPiuBassa: i === QUOTE.length - 1
  }
})

/**
 * ─── I POZZI: DOVE IL PAGLIOLATO SI APRE SULLE MACCHINE
 *
 * ─── IL DIFETTO CHE L'HA CHIESTO, E COME L'HO ISOLATO
 *
 * Il provino della cella poppa/macchine mostrava il pagliolato del locale
 * macchine passare ATTRAVERSO il motore di propulsione. Misurato leggendo i
 * GLB invece che guardando: `propulsione.glb` occupa y da -0,94 a -0,24 unita'
 * di scena una volta collocato da `macchine.js`, e il pagliolato delle macchine
 * sta a -0,411 -- in mezzo. Stessa cosa per il giroscopio (-0,82 .. -0,28) e
 * per l'impianto stabilizzatore.
 *
 * Non era un errore di quota: e' che un locale macchine VERO non ha un
 * pavimento continuo sopra i motori. Ha un pozzo -- il cofano -- con i pagliolati
 * tutt'intorno e la macchina che ci sta dentro, servita dal basso. Il difetto
 * era la mancanza del pozzo, non l'altezza del piano.
 *
 * ─── PERCHE' L'INGOMBRO SI LEGGE DAI GLB E NON SI SCRIVE QUI
 *
 * Perche' quei modelli non sono miei e cambiano: mentre scrivo, un altro agente
 * ci sta cuocendo le mappe sopra. Un pozzo con le misure ricopiate a mano
 * diventerebbe falso al primo rifacimento, e il modo in cui lo si scoprirebbe e'
 * un pagliolato che ricomincia a tagliare un motore -- cioe' guardando, sei
 * mesi dopo. Letto dal file, il pozzo insegue la macchina da solo.
 *
 * E se un GLB manca o non si legge, il pozzo NON si inventa: si stampa che
 * manca. Un pozzo grande "quanto basta di sicuro" sarebbe un buco nel pavimento
 * al posto di una misura.
 */
const GIOCO_POZZO = 0.15 / M_PER_UNITA      // 15 cm attorno alla macchina

function bboxGlb (percorso) {
  const b = readFileSync(percorso)
  const j = JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)).toString('utf8'))
  const nodi = j.nodes ?? []
  const I4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  const locale = (n) => {
    if (n.matrix) return n.matrix
    const [x, y, z, w] = n.rotation ?? [0, 0, 0, 1]
    const [sx, sy, sz] = n.scale ?? [1, 1, 1]
    const [tx, ty, tz] = n.translation ?? [0, 0, 0]
    const r = [
      1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w),
      2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w),
      2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y)
    ]
    return [r[0] * sx, r[1] * sx, r[2] * sx, 0,
            r[3] * sy, r[4] * sy, r[5] * sy, 0,
            r[6] * sz, r[7] * sz, r[8] * sz, 0, tx, ty, tz, 1]
  }
  const mul = (a, c) => {
    const o = new Array(16)
    for (let r = 0; r < 4; r++) {
      for (let k = 0; k < 4; k++) {
        let s = 0
        for (let q = 0; q < 4; q++) s += a[q * 4 + r] * c[k * 4 + q]
        o[k * 4 + r] = s
      }
    }
    return o
  }
  const mn = [Infinity, Infinity, Infinity]
  const mx = [-Infinity, -Infinity, -Infinity]
  const scendi = (i, m) => {
    const n = nodi[i]
    if (!n) return
    const w = mul(m, locale(n))
    if (n.mesh !== undefined) {
      for (const p of j.meshes[n.mesh].primitives) {
        const a = j.accessors[p.attributes.POSITION]
        if (!a?.min) continue
        for (let k = 0; k < 8; k++) {
          const P = [k & 1 ? a.max[0] : a.min[0], k & 2 ? a.max[1] : a.min[1], k & 4 ? a.max[2] : a.min[2]]
          for (let d = 0; d < 3; d++) {
            const v = w[d] * P[0] + w[4 + d] * P[1] + w[8 + d] * P[2] + w[12 + d]
            if (v < mn[d]) mn[d] = v
            if (v > mx[d]) mx[d] = v
          }
        }
      }
    }
    for (const c of n.children ?? []) scendi(c, w)
  }
  for (const r of j.scenes?.[j.scene ?? 0]?.nodes ?? []) scendi(r, I4)
  const ex = nodi.find(n => n.extras)?.extras ?? {}
  if (!Number.isFinite(mn[0])) throw new Error('nessuna geometria')
  return { mn, mx, metriPerUnita: ex.sceneMetersPerUnit ?? M_PER_UNITA }
}

/** Dove `macchine.js` colloca una macchina. Per nome, non per riga. */
function posizioneMacchina (chiave) {
  const src = readFileSync('src/scena/macchine.js', 'utf8')
  const r = new RegExp(chiave.replace('.', '\\.') +
                       '\\.position\\.set\\(\\s*(-?[\\d.]+)\\s*,\\s*(-?[\\d.]+)\\s*,\\s*(-?[\\d.]+)\\s*\\)').exec(src)
  return r ? [Number(r[1]), Number(r[2]), Number(r[3])] : null
}

const macchineDaCollocare = [
  { file: 'public/modelli/propulsione.glb', chiave: 'p.radice', giro: false },
  { file: 'public/modelli/giroscopio.glb', chiave: 'g.radice', giro: false },
  {
    file: 'public/modelli/impianto.glb',
    /**
     * L'impianto stabilizzatore lo colloca `nave.js` interrogando lo scafo, e
     * qui si rifa' la STESSA domanda alla stessa funzione invece di ricopiare
     * due coordinate: sta sullo spigolo di carena alla quota delle pinne.
     * Quello di babordo e' ruotato di mezzo giro, quindi il suo ingombro in x
     * e in z si specchia -- e specchiare un ingombro vuol dire scambiarne gli
     * estremi cambiati di segno, non negarli e basta.
     */
    posizione: () => {
      const src = readFileSync('src/scena/nave.js', 'utf8')
      const r = /export const Z_PINNE\s*=\s*(-?[\d.]+)/.exec(src)
      if (!r) return null
      const zp = Number(r[1])
      const s = sezioneA(tDaZ(zp))
      return [-s.spigoloX, s.spigoloY, zp]
    },
    giro: true
  }
]

const ingombriMacchine = []
/**
 * Dove stanno le macchine, per chi renderizza. Il provino gira anche su una
 * macchina remota, dove `src/` non c'e': se lo script del render leggesse i
 * sorgenti del sito, la' non troverebbe niente e collocherebbe le macchine
 * all'origine -- un provino plausibile e sbagliato. Le collocazioni si leggono
 * QUI, dove i sorgenti ci sono, e viaggiano nel JSON insieme allo scafo.
 */
const collocazioniMacchine = []
for (const m of macchineDaCollocare) {
  let bb
  try { bb = bboxGlb(m.file) } catch (e) {
    console.log(`  POZZI     ${m.file} non leggibile (${e.message}): nessun pozzo per questa ` +
                'macchina, e il pagliolato le passera dentro. Detto, non aggirato.')
    continue
  }
  const pos = m.posizione ? m.posizione() : posizioneMacchina(m.chiave)
  if (!pos) {
    console.log(`  POZZI     collocazione di ${m.file} non trovata nel sorgente: nessun pozzo`)
    continue
  }
  const k = 1 / bb.metriPerUnita          // da metri a unita' di scena
  let x0 = bb.mn[0] * k
  let x1 = bb.mx[0] * k
  let z0 = bb.mn[2] * k
  let z1 = bb.mx[2] * k
  if (m.giro) {
    ;[x0, x1] = [-x1, -x0]
    ;[z0, z1] = [-z1, -z0]
  }
  collocazioniMacchine.push({
    file: m.file.split('/').pop(),
    posizione: pos.map(v => +v.toFixed(5)),
    giro: !!m.giro
  })
  ingombriMacchine.push({
    file: m.file.split('/').pop(),
    x: [x0 + pos[0], x1 + pos[0]],
    y: [bb.mn[1] * k + pos[1], bb.mx[1] * k + pos[1]],
    z: [z0 + pos[2], z1 + pos[2]]
  })
}

/**
 * Un pozzo per ogni coppia (macchina, pagliolato) che si intersecano in
 * verticale. Un pagliolato che passa SOPRA o SOTTO una macchina non ha niente
 * da aprire, e aprirlo sarebbe un buco gratuito nel pavimento.
 */
const pozzi = []
for (const q of quote) {
  for (const g of ingombriMacchine) {
    const y = q.piano
    if (y === null) continue          // la grigliata di sentina segue la chiglia: sotto le macchine, non dentro
    if (y <= g.y[0] || y >= g.y[1]) continue
    pozzi.push({
      quota: q.id,
      macchina: g.file,
      z0: +(g.z[0] - GIOCO_POZZO).toFixed(5),
      z1: +(g.z[1] + GIOCO_POZZO).toFixed(5),
      // il pozzo si ferma sulla mezzeria: la meta' di dritta non esiste
      x0: +Math.max(-99, g.x[0] - GIOCO_POZZO).toFixed(5),
      x1: +Math.min(0, g.x[1] + GIOCO_POZZO).toFixed(5)
    })
  }
}

/**
 * LE PARATIE stanno a META' STRADA fra due stazioni, e il numero non lo scelgo
 * io: e' la posizione che divide lo spazio in quattro compartimenti, uno per
 * stazione. Fra quattro stazioni ci sono tre interfacce, quindi tre paratie.
 */
const zStazioni = STAZIONI.map(s => zDiStazione(s.x))
const paratie = []
for (let i = 0; i < STAZIONI.length - 1; i++) {
  paratie.push({
    id: `${STAZIONI[i].id}_${STAZIONI[i + 1].id}`,
    z: +((zStazioni[i] + zStazioni[i + 1]) / 2).toFixed(5)
  })
}

/**
 * LE CELLE RICCHE — tre, e sono quelle dei tre sistemi della catena causale.
 *
 * Il corredo industriale (passerelle, tubazioni, supporti antivibranti) va
 * SOLO qui. Le altre nove celle ricevono pagliolato, paratie, ossatura e una
 * plafoniera: sono stive e vuoti tecnici, e riempirle sarebbe sbagliato prima
 * ancora che lento.
 *
 * L'estensione longitudinale di una cella e' meta' passo fra stazioni da una
 * parte e dall'altra, cioe' esattamente il compartimento fra due paratie.
 */
const passo = (zStazioni[zStazioni.length - 1] - zStazioni[0]) / (STAZIONI.length - 1)
const celleRicche = SISTEMI.map(s => {
  const is = STAZIONI.findIndex(x => x.id === s.stazione)
  const iq = QUOTE.findIndex(x => x.id === s.quota)
  if (is < 0 || iq < 0) {
    throw new Error(`il sistema ${s.id} dichiara stazione "${s.stazione}" e quota ` +
                    `"${s.quota}", e una delle due non e' in STAZIONI/QUOTE.`)
  }
  return {
    sistema: s.id,
    stazione: s.stazione,
    quota: s.quota,
    /**
     * Il compartimento si TRONCA sullo scafo, e il numero che l'ha chiesto e'
     * 0,107: la cella di poppa arrivava a z = 8,107 mentre lo specchio sta a 8,
     * e il cancello di `glb-interni.py` l'ha presa -- 27 cm di corredo
     * industriale sospesi FUORI dallo scafo, dietro lo specchio di poppa. Non
     * si sarebbero visti dalla posa della cella e si sarebbero visti dalla
     * sezione verticale, che e' il cancello principale.
     */
    z0: +Math.max(PRUA_Z, zStazioni[is] - passo / 2).toFixed(5),
    z1: +Math.min(POPPA_Z, zStazioni[is] + passo / 2).toFixed(5)
  }
})

const dati = {
  commento: 'Generato da strumenti/esporta-interni.mjs. NON modificare a mano: le ' +
            'fonti sono src/scafo/ordinate.js e src/ui/atto-due.js.',
  unita: 'unita di scena, 1 = 2,5 m',
  metriPerUnita: M_PER_UNITA,
  pruaZ: PRUA_Z,
  poppaZ: POPPA_Z,
  latoCostruito: 'babordo (x <= 0): il piano di sezione Plane(1,0,0) toglie l\'altra meta\'',
  ponteY: PONTE_Y,
  chigliaY: CHIGLIA_Y,
  occhioSulPagliolato: +OCCHIO_SUL_PAGLIOLATO.toFixed(5),
  stazioni: STAZIONI.map((s, i) => ({ id: s.id, nome: s.nome, x: s.x, z: +zStazioni[i].toFixed(5) })),
  quote,
  paratie,
  celleRicche,
  pozzi,
  /**
   * ─── TUTTO CIO' CHE SERVE AL PROVINO, E NIENTE DI PIU'
   *
   * `docs/13` §5 chiude il finale con la sezione verticale, e il provino deve
   * fotografare LA POSA DEL SITO, non una posa scelta a occhio. Le tre
   * grandezze che la definiscono vivono in `src/scena/index.js` -- le due
   * distanze della camera e il campo verticale -- e si leggono per NOME come
   * tutto il resto di questo file.
   */
  provino: {
    raggio: costanteDiScena('RAGGIO'),
    raggioSezione: costanteDiScena('RAGGIO_SEZIONE'),
    fovVerticaleGradi: (() => {
      const src = readFileSync('src/scena/index.js', 'utf8')
      const r = /new PerspectiveCamera\(\s*([\d.]+)/.exec(src)
      if (!r) {
        throw new Error('in src/scena/index.js non trovo new PerspectiveCamera(...): il ' +
                        'provino userebbe un campo inventato e mostrerebbe un\'inquadratura ' +
                        'che il sito non produce.')
      }
      return Number(r[1])
    })(),
    macchine: collocazioniMacchine
  },
  punti
}

mkdirSync(dirname(FUORI) || '.', { recursive: true })
writeFileSync(FUORI, JSON.stringify(dati, null, 1) + '\n')

// ─── quello che si e' misurato, detto ad alta voce ─────────────────────────
const m = v => (v * M_PER_UNITA).toFixed(2)
const semiA = (z, y) => {
  const t = tDaZ(z)
  const c = contornoBabordo(t)
  if (y <= c[0][1]) return 0
  if (y >= c[c.length - 1][1]) return Math.abs(c[c.length - 1][0])
  for (let i = 1; i < c.length; i++) {
    if (c[i][1] >= y) {
      const u = (y - c[i - 1][1]) / (c[i][1] - c[i - 1][1] || 1)
      return Math.abs(c[i - 1][0] + (c[i][0] - c[i - 1][0]) * u)
    }
  }
  return 0
}

console.log(`${FUORI}: ${punti.length} stazioni campionate, ${punti[0].contorno.length} punti per mezza sezione`)
console.log(`  costanti lette da src/scena/index.js: PONTE_Y ${PONTE_Y}, CHIGLIA_Y ${CHIGLIA_Y}`)
console.log('  STAZIONI  ' + dati.stazioni.map(s => `${s.id} z=${s.z.toFixed(2)}`).join('  '))
console.log('  PARATIE   ' + paratie.map(p => `${p.id} z=${p.z.toFixed(2)}`).join('  '))
for (const q of quote) {
  if (q.piano === null) {
    console.log(`  QUOTA ${q.id.padEnd(13)} occhio ${q.occhio.toFixed(3)} — pagliolato SULLA ` +
                `CHIGLIA +${m(q.scostamentoChiglia)} m (un piano orizzontale cadrebbe a ` +
                `${(q.occhio - OCCHIO_SUL_PAGLIOLATO).toFixed(3)}, sotto la chiglia piu' ` +
                `profonda ${chigliaMin})`)
  } else {
    console.log(`  QUOTA ${q.id.padEnd(13)} occhio ${q.occhio.toFixed(3)}  pagliolato ` +
                `${q.piano.toFixed(3)} (${m(q.piano)} m sul galleggiamento)`)
  }
}
/**
 * L'ALTEZZA LIBERA, MISURATA, non prescritta. E' il numero che dice se questi
 * tre ponti sono spazi o fessure, e va stampato perche' e' l'unico modo di non
 * scoprirlo guardando lo schermo.
 */
console.log('  ALTEZZA LIBERA misurata alle quattro stazioni (m):')
for (const s of dati.stazioni) {
  const t = tDaZ(s.z)
  const sez = sezioneA(t)
  const q = quote.map(x => x.piano === null ? sez.chiglia + SENTINA_SULLA_CHIGLIA : x.piano)
  const soffitto = [sez.ponteY, q[0], q[1]]
  const righe = quote.map((x, i) => `${x.id} ${m(soffitto[i] - q[i])}`)
  console.log(`    ${s.id.padEnd(8)} ${righe.join('   ')}`)
}
console.log('  MEZZO BAGLIO al pagliolato (m, da mezzeria a fasciame):')
for (const s of dati.stazioni) {
  const sez = sezioneA(tDaZ(s.z))
  const righe = quote.map(x => {
    const y = x.piano === null ? sez.chiglia + SENTINA_SULLA_CHIGLIA : x.piano
    return `${x.id} ${m(semiA(s.z, y))}`
  })
  console.log(`    ${s.id.padEnd(8)} ${righe.join('   ')}`)
}
for (const g of ingombriMacchine) {
  console.log(`  MACCHINA  ${g.file.padEnd(18)} x ${g.x.map(v => v.toFixed(2)).join('..')}  ` +
              `y ${g.y.map(v => v.toFixed(2)).join('..')}  z ${g.z.map(v => v.toFixed(2)).join('..')}`)
}
for (const p of pozzi) {
  console.log(`  POZZO     ${p.quota.padEnd(13)} per ${p.macchina.padEnd(18)} ` +
              `z ${p.z0.toFixed(2)}..${p.z1.toFixed(2)}  x ${p.x0.toFixed(2)}..${p.x1.toFixed(2)}`)
}
if (!pozzi.length) {
  console.log('  POZZI     nessuno: nessun pagliolato taglia una macchina, oppure i GLB ' +
              'non erano leggibili (le righe qui sopra lo dicono)')
}
console.log('  CELLE RICCHE  ' + celleRicche.map(c => `${c.sistema} (${c.stazione}/${c.quota}) z ${c.z0.toFixed(2)}..${c.z1.toFixed(2)}`).join('  '))
