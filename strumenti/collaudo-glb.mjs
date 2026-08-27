/**
 * COLLAUDO-GLB — il modello e' un contratto, e questo lo legge.
 *
 *     node strumenti/collaudo-glb.mjs [percorso.glb]
 *
 * Non apre un browser e non guarda niente: apre il file, lo misura e confronta
 * con `docs/14-FOTOREALISMO.md`. Quello che verifica e' scelto per un motivo
 * solo — **e' roba che si e' gia' rotta**, o che si romperebbe in silenzio.
 *
 * ─── IL GUASTO PER CUI ESISTE
 *
 * L'eccentricita' dei dischi cicloidali veniva ricavata dal `boundingSphere`
 * del disco. Ma il disco e' modellato centrato sull'asse: l'orbita gliela da'
 * il sito a runtime. La misura restituiva 0,0005 m — l'asimmetria dei 29 lobi —
 * invece di 0,012. Finito, plausibile, mai zero: nessun ripiego, nessun errore,
 * nessun avviso. I dischi orbitavano di mezzo millimetro e il riduttore si
 * vedeva come una scatola chiusa, che e' esattamente cio' che il §12 vieta di
 * mostrare.
 *
 * Quindi qui non si controlla che il numero *esista*: si controlla che
 * **produca un movimento che si vede**, confrontandolo col raggio del disco.
 * Un cancello che accetta qualunque numero finito non e' un cancello.
 *
 * ─── LE ALTRE COSE, E PERCHE'
 *
 *   NOMI            sono un'API (§2.1). Persi una volta davvero: gltfpack li
 *                   cancella tutti se scordi `-kn`, senza dire niente
 *   GEOMETRIA VERA  un nodo puo' sopravvivere come guscio vuoto. Si scende
 *                   nella gerarchia finche' non si trova una mesh
 *   UNITA'          la conversione 0,4 vale SOLO per un modello in metri.
 *                   Se `authoringUnit` cambia, la scala del sito e' una bugia
 *   INGOMBRO        misurato in metri e confrontato col bersaglio. §12 vieta
 *                   le scale scelte guardando lo schermo: questo e' il modo
 *                   di non sceglierle guardando lo schermo
 *   PESO            1,5 MB e' un obiettivo provvisorio (§9), non un cancello
 *                   definitivo — ma sfondarlo va detto, non scoperto
 *
 * Non misura millisecondi. Misura il file.
 */
import { readFileSync, statSync, readdirSync } from 'node:fs'

const FILE = process.argv[2] ?? 'public/modelli/impianto.glb'

const NODI = [
  'STATIC_FOUNDATION', 'STATIC_HULL_PLATE', 'STATIC_SEAL', 'STATIC_MOTOR',
  'HOUSING_FIXED', 'HOUSING_REMOVABLE', 'HOUSING_SECTION',
  'RIG_INPUT', 'RIG_ECCENTRIC', 'RIG_CYCLO_A', 'RIG_CYCLO_B',
  'RIG_OUTPUT', 'RIG_SHAFT', 'RIG_FIN'
]
/** I nodi che si MUOVONO devono avere qualcosa da muovere. */
const CON_GEOMETRIA = NODI.filter(n => n !== 'RIG_ECCENTRIC')

const APERTURA_ATTESA = 1.50          // m, §1.5 — DAL PIANO DEL FASCIAME (x = 0)
const TOLLERANZA_APERTURA = 0.02      // 2 cm: bersaglio di progetto, non una quota
const AREA_ATTESA = 2.20              // m², §1.5
const TOLLERANZA_AREA = 0.05          // 5%: nel builder l'area e' integrata, non stimata
const RIEMPIMENTO = [0.55, 1.0]       // area dichiarata / (apertura × corda massima)
const ORBITA_MINIMA = 0.03            // eccentricita' / raggio disco
const TETTO_KB = 1536                 // §9, obiettivo provvisorio

// ─── lettura ──────────────────────────────────────────────────────────────
const buf = readFileSync(FILE)
if (buf.readUInt32LE(0) !== 0x46546c67) {
  console.error(`${FILE} non e' un GLB (manca la firma glTF)`)
  process.exit(1)
}
const g = JSON.parse(buf.subarray(20, 20 + buf.readUInt32LE(12)).toString('utf8'))
const nodi = g.nodes ?? []
const perNome = new Map(nodi.map((n, i) => [n.name, i]).filter(([n]) => n))

// ─── matrici, perche' l'ingombro si misura nello spazio giusto ────────────
// La quantizzazione mette la dequantizzazione in una scala e una traslazione
// sul nodo della mesh. Ignorarle darebbe un ingombro in interi, cioe' migliaia
// di metri: un errore rumoroso. Peggio sarebbe assumere che non ci siano mai
// rotazioni — vero oggi, non garantito domani. Quindi TRS completo.
const I4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

function mul (a, b) {
  const o = new Array(16)
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let s = 0
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]
      o[c * 4 + r] = s
    }
  }
  return o
}

function locale (n) {
  if (n.matrix) return n.matrix
  const [x, y, z, w] = n.rotation ?? [0, 0, 0, 1]
  const [sx, sy, sz] = n.scale ?? [1, 1, 1]
  const [tx, ty, tz] = n.translation ?? [0, 0, 0]
  const r = [
    1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w),
    2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w),
    2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y)
  ]
  return [
    r[0] * sx, r[1] * sx, r[2] * sx, 0,
    r[3] * sy, r[4] * sy, r[5] * sy, 0,
    r[6] * sz, r[7] * sz, r[8] * sz, 0,
    tx, ty, tz, 1
  ]
}

const punto = (m, p) => [0, 1, 2].map(i =>
  m[i] * p[0] + m[4 + i] * p[1] + m[8 + i] * p[2] + m[12 + i])

/** Percorre il sottoalbero e restituisce l'ingombro in metri, o null. */
function ingombro (indice, m0 = I4) {
  const mn = [Infinity, Infinity, Infinity]
  const mx = [-Infinity, -Infinity, -Infinity]
  let trovato = false

  ;(function scendi (i, m) {
    const n = nodi[i]
    if (!n) return
    const w = mul(m, locale(n))
    if (n.mesh !== undefined) {
      for (const p of g.meshes[n.mesh].primitives) {
        const a = g.accessors[p.attributes.POSITION]
        if (!a?.min) continue
        trovato = true
        for (let k = 0; k < 8; k++) {
          const q = punto(w, [
            k & 1 ? a.max[0] : a.min[0],
            k & 2 ? a.max[1] : a.min[1],
            k & 4 ? a.max[2] : a.min[2]
          ])
          for (let d = 0; d < 3; d++) {
            if (q[d] < mn[d]) mn[d] = q[d]
            if (q[d] > mx[d]) mx[d] = q[d]
          }
        }
      }
    }
    for (const c of n.children ?? []) scendi(c, w)
  })(indice, m0)

  return trovato ? { mn, mx } : null
}

// ─── i controlli ──────────────────────────────────────────────────────────
const guasti = []
const note = []

const persi = NODI.filter(n => !perNome.has(n))
if (persi.length) {
  guasti.push(`mancano i nodi ${persi.join(', ')} — sono il contratto di §2.1`)
} else {
  const vuoti = CON_GEOMETRIA.filter(n => !ingombro(perNome.get(n)))
  if (vuoti.length) {
    guasti.push(`nodi senza geometria sotto: ${vuoti.join(', ')} — ` +
                'il nome e\' sopravvissuto, il pezzo no')
  }
}

const ex = nodi.find(n => n.name === 'IMPIANTO')?.extras ?? null
if (!ex) {
  guasti.push('nessun extras sul nodo IMPIANTO: il sito non saprebbe ne\' l\'unita\' ne\' il rapporto')
} else {
  if (ex.authoringUnit !== 'meter') {
    guasti.push(`authoringUnit e' "${ex.authoringUnit}", non "meter": la conversione 0,4 del sito diventa falsa`)
  }
  if (ex.sceneMetersPerUnit !== 2.5) {
    guasti.push(`sceneMetersPerUnit e' ${ex.sceneMetersPerUnit}, il sito assume 2,5`)
  }
  if (!(ex.gearRatio > 1)) guasti.push(`gearRatio non plausibile: ${ex.gearRatio}`)

  const e = ex.eccentricityM
  const R = ex.cycloDiscRadiusM
  if (typeof e !== 'number' || typeof R !== 'number') {
    guasti.push('eccentricityM o cycloDiscRadiusM assenti: senza il raggio ' +
                'l\'orbita non ha metro di paragone')
  } else {
    const frazione = e / R
    note.push(`ORBITA    ${(e * 1000).toFixed(1)} mm su un disco da ` +
              `${(R * 1000).toFixed(0)} mm = ${(frazione * 100).toFixed(1)}% del raggio`)
    if (frazione < ORBITA_MINIMA) {
      guasti.push(
        `l'orbita dei dischi e' il ${(frazione * 100).toFixed(2)}% del raggio: sotto il ` +
        `${ORBITA_MINIMA * 100}% non si vede, e un riduttore cicloidale che non si vede ` +
        'muovere e\' una scatola chiusa. E\' il guasto per cui questo cancello esiste.')
    }
  }
}

const pinna = perNome.has('RIG_FIN') ? ingombro(perNome.get('RIG_FIN')) : null
if (pinna) {
  /**
   * L'APERTURA SI MISURA DAL FASCIAME, NON DALLA RADICE.
   *
   * §2.2 mette l'origine di IMPIANTO «sul piano del fasciame», quindi la punta
   * in x *e'* l'apertura, e non serve nessuna sottrazione. Prendere invece la
   * dimensione maggiore dell'ingombro da' il pezzo disegnato — che parte dentro
   * la tenuta — o, peggio, la corda quando la pinna e' piu' larga che lunga:
   * su questo modello dava 1,949 m, che non e' ne' l'apertura ne' un errore
   * riconoscibile. Nel builder lo stesso sbaglio era travestito da `mx[0]-0.18`.
   */
  const ap = pinna.mx[0]
  note.push(`PINNA     apertura ${ap.toFixed(3)} m dal fasciame  (bersaglio ${APERTURA_ATTESA})`)
  if (Math.abs(ap - APERTURA_ATTESA) > TOLLERANZA_APERTURA) {
    guasti.push(`apertura pinna ${ap.toFixed(3)} m contro ${APERTURA_ATTESA} attesi: ` +
                'o il modello e\' cambiato, o e\' in un\'altra unita\'')
  }

  /**
   * L'AREA NON SI PUO' INTEGRARE DA QUI, MA UN DIVARIO DI TRE VOLTE SI VEDE.
   *
   * `finAreaM2` dichiarava 2,20 m² su una pinna che ne aveva circa 0,7. §2.2
   * dice che gli extras «descrivono il modello mostrato»: era una dichiarazione
   * falsa. Ricostruire l'area vera da un GLB compresso vorrebbe dire
   * decodificare le mesh — troppo per un cancello che deve restare veloce.
   *
   * Basta il confronto col rettangolo che contiene la pinna. Una pianta
   * rastremata lo riempie fra il 55% e il 100%; fuori da li', il numero
   * dichiarato non descrive quella forma. Non e' una misura fine: e' una misura
   * a cui non sfugge un fattore tre.
   */
  const corda = Math.max(pinna.mx[1] - pinna.mn[1], pinna.mx[2] - pinna.mn[2])
  const rettangolo = (pinna.mx[0] - pinna.mn[0]) * corda
  const dichiarata = ex?.finAreaM2
  if (typeof dichiarata !== 'number') {
    guasti.push('finAreaM2 assente: §2.2 lo elenca fra i dati che descrivono il modello')
  } else {
    const q = dichiarata / rettangolo
    note.push(`          area dichiarata ${dichiarata.toFixed(2)} m², corda massima ` +
              `${corda.toFixed(2)} m, riempimento ${(q * 100).toFixed(0)}%`)
    if (Math.abs(dichiarata - AREA_ATTESA) > AREA_ATTESA * TOLLERANZA_AREA) {
      guasti.push(`area dichiarata ${dichiarata.toFixed(2)} m² contro ${AREA_ATTESA} di §1.5`)
    }
    if (q < RIEMPIMENTO[0] || q > RIEMPIMENTO[1]) {
      guasti.push(
        `l'area dichiarata riempie il ${(q * 100).toFixed(0)}% del rettangolo che contiene ` +
        `la pinna: fuori dalla forbice ${RIEMPIMENTO[0] * 100}-${RIEMPIMENTO[1] * 100}%. ` +
        'Il numero dichiarato non descrive la forma disegnata.')
    }
  }
}

const tutto = perNome.has('IMPIANTO') ? ingombro(perNome.get('IMPIANTO')) : null
if (tutto) {
  const d = [0, 1, 2].map(i => (tutto.mx[i] - tutto.mn[i]).toFixed(2)).join(' x ')
  note.push(`INGOMBRO  ${d} m, tutto compreso`)
}

const kb = Math.round(statSync(FILE).size / 1024)
const compresso = g.extensionsRequired?.includes('EXT_meshopt_compression')
note.push(`PESO      ${kb} KB${compresso ? ' (meshopt)' : ' (non compresso)'}`)
if (kb > TETTO_KB) {
  guasti.push(`${kb} KB sfondano l'obiettivo provvisorio di ${TETTO_KB} KB (§9). ` +
              'Non e\' un cancello definitivo, ma va deciso, non subito.')
}

/**
 * ─── OGNI MODELLO HA UN CONTRATTO, NON SOLO L'IMPIANTO
 *
 * Segnalato da una revisione esterna, e vero: `sovrastruttura.glb` era entrata
 * nel sito senza che nessun cancello le chiedesse niente. Le domande che
 * valgono per QUALUNQUE modello di questo repo sono tre, e sono quelle che
 * rompono il sito in silenzio:
 *
 *   l'unita'    la conversione 0,4 vale solo per un modello in metri;
 *   i nomi      la compressione li cancella tutti se si scorda `-kn`;
 *   la sostanza un nodo puo' sopravvivere come guscio vuoto: sotto ogni nome
 *               ci deve essere geometria;
 *   l'ingombro  un modello che esce di scala si vede subito qui e mai altrove.
 *
 * ─── COSA QUESTO CANCELLO NON CONTROLLA, E VA DETTO
 *
 * **Il verso delle normali.** Una normale rivolta dentro non da' errore: da
 * fuori la parete sparisce per culling e si vede attraverso la nave. E'
 * successo davvero, sulla sovrastruttura, e a schermo sembrava un pezzo
 * modellato male — non una faccia al rovescio.
 *
 * Controllarlo qui vorrebbe dire decodificare le mesh compresse con meshopt,
 * cioe' portarsi dentro il decodificatore per un controllo solo. La difesa
 * vera sta a monte, nel builder, che ricalcola le normali verso l'esterno con
 * `recalc_face_normals` — ed e' li' che va tenuta. Scriverlo qui e non farlo
 * sarebbe la cosa peggiore: un commento che promette un controllo inesistente
 * insegna a fidarsi di un verde che non copre niente.
 *
 * Le domande specifiche dell'impianto — orbita, apertura, area — restano dove
 * sono: valgono per lui e per nessun altro.
 */
const ALTRI = ['public/modelli/sovrastruttura.glb']
for (const altro of ALTRI) {
  if (altro === FILE) continue
  let b
  try { b = readFileSync(altro) } catch { guasti.push(`manca ${altro}`); continue }
  const j = JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)).toString('utf8'))
  const conNome = (j.nodes ?? []).filter(n => n.name).length
  const ex2 = (j.nodes ?? []).find(n => n.extras)?.extras ?? null
  const kb2 = Math.round(statSync(altro).size / 1024)
  note.push(`ALTRO     ${altro.split('/').pop()}  ${kb2} KB, ${conNome} nodi con nome`)
  if (!conNome) guasti.push(`${altro}: nessun nodo ha un nome — la compressione li ha cancellati`)
  if (ex2?.authoringUnit !== 'meter') {
    guasti.push(`${altro}: authoringUnit e' "${ex2?.authoringUnit}", non "meter"`)
  }
  // sotto ogni nodo con nome ci deve essere geometria: un nome sopravvive alla
  // compressione anche quando il pezzo no
  const nodi2 = j.nodes ?? []
  const idx2 = new Map(nodi2.map((n, i) => [n.name, i]).filter(([n]) => n))
  const conMesh = (i) => {
    let trovato = false
    ;(function scendi (k) {
      const n = nodi2[k]
      if (!n || trovato) return
      if (n.mesh !== undefined) { trovato = true; return }
      for (const c of n.children ?? []) scendi(c)
    })(i)
    return trovato
  }
  const vuoti2 = [...idx2.keys()].filter(n => !/_MESH$/.test(n) && !conMesh(idx2.get(n)))
  const senzaGeometria = vuoti2.filter(n => n !== 'SOVRASTRUTTURA_NAVE')
  if (senzaGeometria.length) {
    guasti.push(`${altro}: nodi senza geometria sotto: ${senzaGeometria.join(', ')}`)
  }
  // e l'altezza d'aria dichiarata deve stare nella forbice di un quaranta metri
  const aria = ex2?.airDraftM
  if (typeof aria === 'number') {
    note.push(`          altezza d'aria dichiarata ${aria.toFixed(2)} m`)
    if (aria < 8 || aria > 12) {
      guasti.push(`${altro}: altezza d'aria ${aria.toFixed(2)} m, fuori dalla forbice 8-12 ` +
                  'di un quaranta metri: o il modello sta in unaltra scala, o le quote sono cambiate')
    }
  }
}

/**
 * ─── I NUMERI IN PAGINA DEVONO RESTARE VERI
 *
 * Il sito pubblica quanto pesa cio' che scarica. Per una notte ha dichiarato
 * «3D models downloaded: 0 bytes» mentre ne scaricava 280: era vero quando
 * tutta la geometria nasceva da curve in JavaScript, ed e' diventato falso nel
 * commit che ha aggiunto il primo GLB. Nessuno l'ha visto, perche' un numero
 * scritto a mano in una pagina non ha modo di accorgersi che il mondo e'
 * cambiato sotto di lui.
 *
 * Su un sito che fonda la propria autorevolezza sulla misura, quella riga vale
 * piu' di un difetto grafico: e' l'unica cosa che un giurato puo' verificare in
 * dieci secondi. Da qui in poi non puo' piu' divergere senza fermare i
 * cancelli.
 */
const modelli = readdirSync('public/modelli').filter(f => f.endsWith('.glb'))
const totaleKB = Math.round(
  modelli.reduce((s, f) => s + statSync(`public/modelli/${f}`).size, 0) / 1024)
const pagina = readFileSync('index.html', 'utf8')
const riga = pagina.match(/3D models downloaded<\/dt><dd>([^<]+)<\/dd>/)
if (!riga) {
  guasti.push('in `index.html` non trovo piu\' la riga «3D models downloaded»: ' +
              'se e\' stata rinominata, questo controllo va aggiornato invece che perso')
} else {
  const dichiarato = parseFloat(riga[1].replace(',', '.'))
  note.push(`PAGINA    dichiara ${riga[1].trim()}, sul disco ci sono ${totaleKB} KB in ${modelli.length} modelli`)
  if (!(Math.abs(dichiarato - totaleKB) <= 3)) {
    guasti.push(
      `la pagina dichiara "${riga[1].trim()}" di modelli 3D, ma sul disco ce ne sono ` +
      `${totaleKB} KB. Il sito misura tutto: se questo numero e' falso, non c'e' ` +
      'ragione di credere agli altri.')
  }
}

// ─── esito ────────────────────────────────────────────────────────────────
console.log(FILE)
for (const n of note) console.log('  ' + n)
if (guasti.length) {
  console.error('\nCOLLAUDO GLB FALLITO')
  for (const x of guasti) console.error('  · ' + x)
  process.exit(1)
}
console.log('\ncollaudo glb: passato')
