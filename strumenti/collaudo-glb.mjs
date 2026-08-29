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
 *   UNITA'/ALTEZZA  le due quote di §1.5 che stavano in tabella senza cancello.
 *                   Un numero prescritto e non misurato scivola: questo lo
 *                   aveva gia' fatto, e la storia sta scritta accanto al codice
 *   RADICE          ogni pezzo sotto un nodo del contratto. Un nodo alla radice
 *                   della scena arriva nel sito lo stesso, e non da' errore:
 *                   da' un pezzo che nessun nome comanda
 *   PESO            1,5 MB e' un obiettivo provvisorio (§9), non un cancello
 *                   definitivo — ma sfondarlo va detto, non scoperto
 *
 * Non misura millisecondi. Misura il file.
 */
import { readFileSync, statSync, readdirSync } from 'node:fs'
// Il tetto delle due macchine e' in BROTLI: e' il peso che passa sul filo,
// e il grezzo del disco non lo prevede.
import { brotliCompressSync, constants as ZLIB } from 'node:zlib'

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

/**
 * Percorre il sottoalbero e restituisce l'ingombro in metri, o null.
 *
 * `senzaMateriali` toglie dal conto le primitive di certi materiali. Serve
 * perche' §1.5 misura l'ingombro dell'EQUIPAGGIAMENTO — e' la nota della
 * scheda e1500, «dimensions are of the equipment» — mentre nel modello lo
 * stesso nodo porta anche il cavo che se ne va verso la paratia. Si filtra per
 * materiale e non per nome del nodo perche' il cavo E' dentro STATIC_MOTOR:
 * e' li' che deve stare, ed e' li' che non deve contare.
 */
/**
 * ─── LA MISURA E' UNA FABBRICA, DA QUANDO I MODELLI SONO QUATTRO
 *
 * `ingombro` chiudeva sopra le due costanti `g` e `nodi` del file in collaudo,
 * quindi sapeva misurare UN documento solo. Finche' il controllo profondo era
 * riservato all'impianto andava bene: la sovrastruttura passava da un lettore
 * ridotto, in fondo al file, che le trasformazioni non le guardava affatto.
 *
 * Con `propulsione.glb` e `giroscopio.glb` quel lettore ridotto non basta piu':
 * la cosa che va misurata su di loro — se l'origine di un nodo rotante sta sul
 * suo asse — richiede la matrice di MONDO, cioe' esattamente cio' che il
 * lettore ridotto non calcolava. Duplicare la camminata sarebbe stato il modo
 * sicuro di farla divergere: in questo repo e' gia' successo con
 * `glb-grezzo.py`. Quindi la si apre a qualunque documento e basta.
 *
 * `mondo(indice)` e' nuovo e serve solo a quel controllo: dice DOVE finisce
 * l'origine di un nodo dopo tutta la catena dei padri. Senza, si potrebbe
 * confrontare l'ingombro con la traslazione LOCALE del nodo, che su un figlio
 * — il rotore del giroscopio sta sotto la culla cardanica — e' un altro punto.
 */
function lettore (doc) {
  const nodi = doc.nodes ?? []
  const perNome = new Map(nodi.map((n, i) => [n.name, i]).filter(([n]) => n))

  function ingombro (indice, m0 = I4, senzaMateriali = null) {
    const mn = [Infinity, Infinity, Infinity]
    const mx = [-Infinity, -Infinity, -Infinity]
    let trovato = false

    ;(function scendi (i, m) {
      const n = nodi[i]
      if (!n) return
      const w = mul(m, locale(n))
      if (n.mesh !== undefined) {
        for (const p of doc.meshes[n.mesh].primitives) {
          if (senzaMateriali?.has(doc.materials?.[p.material]?.name)) continue
          const a = doc.accessors[p.attributes.POSITION]
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

  /**
   * La matrice di mondo del nodo, e QUELLA DEL SUO PADRE.
   *
   * Il padre serve davvero: `ingombro` parte dall'identita', quindi su un nodo
   * annidato — `gyro_rotore` sta sotto `gyro_cardano` — misurerebbe la
   * geometria nel sistema del padre e la confronterebbe con un'origine di
   * mondo. Due riferimenti diversi, nessun errore, e uno scarto inventato pari
   * alla traslazione che si e' persa.
   */
  function mondo (indice) {
    let risultato = null
    for (const r of doc.scenes?.[doc.scene ?? 0]?.nodes ?? []) {
      ;(function scendi (i, m) {
        if (risultato) return
        const n = nodi[i]
        if (!n) return
        const w = mul(m, locale(n))
        if (i === indice) { risultato = { w, padre: m }; return }
        for (const c of n.children ?? []) scendi(c, w)
      })(r, I4)
    }
    return risultato
  }

  return { doc, nodi, perNome, ingombro, mondo }
}

const { nodi, perNome, ingombro } = lettore(g)

// ─── i controlli ──────────────────────────────────────────────────────────
const guasti = []
const note = []

const persi = NODI.filter(n => !perNome.has(n))
/**
 * QUESTO FILE E' L'IMPIANTO SE HA IL CONTRATTO DELL'IMPIANTO, non se si chiama
 * cosi'. I controlli specifici erano gia' condizionati a `FILE.includes(
 * 'impianto')`: basta collaudare una copia con un altro nome — cioe' proprio
 * cio' che si fa per provare che un cancello sa fallire — e meta' dei controlli
 * si spegne restituendo verde. Trovato provando a rompere il cancello nuovo.
 */
const E_IMPIANTO = !persi.length
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
  note.push(`INGOMBRO  ${d} m, tutto compreso — lastra del fasciame e pinna incluse`)
}

/**
 * ═══ §1.5 · LE DUE QUOTE PRESCRITTE CHE NESSUNO MISURAVA ═══════════════
 *
 * §10.1 chiede il rosso quando «il bounding box fisico esce dalla tolleranza
 * dichiarata». Fino a qui erano coperte solo l'apertura della pinna e l'area:
 * l'ingombro dell'unita' interna e l'altezza complessiva stavano in tabella in
 * §1.5 e non le guardava nessuno.
 *
 * Ed e' successo esattamente quello che succede a un numero senza cancello.
 * Una revisione ha misurato l'altezza del gruppo e l'ha trovata a 1,141 m
 * contro 1,31 prescritti — il 13% in meno. Ma nessuno dei due numeri era
 * quello che sembrava:
 *
 *   1,310   non esiste nella fonte. Nel PDF della e1500 la riga «Hull Unit
 *           Height (Overall)» c'e' e la CELLA DEL VALORE E' VUOTA. Il numero
 *           era stato attribuito alla scheda da qualcuno, ed e' rimasto in
 *           §1.5 abbastanza a lungo da diventare un fatto. `glb-grezzo.py` lo
 *           copiava in `ALT_TOT = 1.310`, una costante mai usata in nessuna
 *           espressione: un bersaglio che non costruiva niente.
 *
 *   1,141   non era l'altezza di niente. Era la distanza fra il fondo della
 *           fondazione e la cima di un CAVO ELETTRICO — un nodo `cavo` finito
 *           alla radice della scena, fuori dal contratto di §2.1, per un
 *           `convert` che non convertiva. Un cavo non e' una quota: dove
 *           arriva dipende da dov'e' il quadro.
 *
 * Quindi qui non si controlla «il bounding box». Si controlla il bounding box
 * di cio' che §1.5 dichiara di misurare, che e' un'altra cosa e va scritta:
 *
 *   fuori la lastra   `STATIC_HULL_PLATE` e' scena, non equipaggiamento; il
 *                     sito la nasconde perche' lo scafo vero ce l'ha gia'
 *   fuori il bordo    la quota di scheda dice «inside vessel after
 *                     installation»: tenuta, albero e pinna stanno oltre
 *   fuori i cavi      la scheda dice «dimensions are of the equipment». Per
 *                     MATERIALE, non per nome del nodo: il cavo deve stare
 *                     dentro STATIC_MOTOR, e li' non deve contare
 *
 * L'altezza si stampa col suo datum — da quanto sotto a quanto sopra l'asse
 * dell'albero — perche' §1.3 punto 2 la definisce cosi' e perche' la stessa
 * altezza sopra o sotto l'asse non si installa allo stesso modo.
 */
const U_BERSAGLIO = [1.105, 0.928, 0.729]   // X larghezza, Y altezza, Z profondita'
const ALT_BERSAGLIO = 0.928                 // §1.5: niente sporge in verticale
const TOLLERANZA_QUOTE = 0.05               // ±5%, dichiarata in §1.5
const OLTRE_IL_FASCIAME = ['STATIC_SEAL', 'RIG_SHAFT', 'RIG_FIN']
const NON_EQUIPAGGIAMENTO = new Set(['cavo'])

if (E_IMPIANTO) {
  /**
   * PRIMA: LA REGOLA D'ESCLUSIONE DEVE AVERE A COSA APPLICARSI.
   *
   * Filtrare per un materiale che non esiste piu' non da' errore: da' un
   * ingombro piu' grande e un cancello che si accende senza spiegare perche'.
   * Se qualcuno rinomina `cavo`, deve rompersi qui, dove la causa e' scritta.
   */
  const materiali = new Set((g.materials ?? []).map(m => m.name))
  const mancanti = [...NON_EQUIPAGGIAMENTO].filter(m => !materiali.has(m))
  if (mancanti.length) {
    guasti.push(
      `il materiale "${mancanti.join(', ')}" non esiste piu' nel modello: e' quello ` +
      'con cui §1.5 riconosce i flessibili da tenere fuori dall\'ingombro. ' +
      'Se e\' stato rinominato, va aggiornata la regola, non persa.')
  }

  const unione = (nomi) => {
    const mn = [Infinity, Infinity, Infinity]
    const mx = [-Infinity, -Infinity, -Infinity]
    let trovato = false
    for (const n of nomi) {
      const b = perNome.has(n) ? ingombro(perNome.get(n), I4, NON_EQUIPAGGIAMENTO) : null
      if (!b) continue
      trovato = true
      for (let d = 0; d < 3; d++) {
        if (b.mn[d] < mn[d]) mn[d] = b.mn[d]
        if (b.mx[d] > mx[d]) mx[d] = b.mx[d]
      }
    }
    return trovato ? { mn, mx } : null
  }

  const dentro = NODI.filter(n => n !== 'STATIC_HULL_PLATE' && !OLTRE_IL_FASCIAME.includes(n))
  const gruppo = NODI.filter(n => n !== 'STATIC_HULL_PLATE')

  const u = unione(dentro)
  if (!u) {
    guasti.push('non trovo geometria per l\'unita\' interna: §1.5 non e\' verificabile')
  } else {
    const d = [0, 1, 2].map(i => u.mx[i] - u.mn[i])
    const scarto = [0, 1, 2].map(i => (d[i] - U_BERSAGLIO[i]) / U_BERSAGLIO[i])
    note.push(
      `UNITA'    ${d.map(v => v.toFixed(3)).join(' x ')} m dentro il fasciame ` +
      `(bersaglio ${U_BERSAGLIO.join(' x ')}), scarto ` +
      scarto.map(s => `${s >= 0 ? '+' : ''}${(s * 100).toFixed(1)}%`).join(' / '))
    const assi = ['larghezza', 'altezza', 'profondita\'']
    for (let i = 0; i < 3; i++) {
      if (Math.abs(scarto[i]) > TOLLERANZA_QUOTE) {
        guasti.push(
          `${assi[i]} dell'unita' interna ${d[i].toFixed(3)} m contro ${U_BERSAGLIO[i]} di §1.5: ` +
          `${(scarto[i] * 100).toFixed(1)}%, fuori dal ±${TOLLERANZA_QUOTE * 100}% dichiarato`)
      }
    }
  }

  const gr = unione(gruppo)
  if (!gr) {
    guasti.push('non trovo geometria per il gruppo: l\'altezza complessiva non e\' verificabile')
  } else {
    const h = gr.mx[1] - gr.mn[1]
    const scarto = (h - ALT_BERSAGLIO) / ALT_BERSAGLIO
    note.push(
      `ALTEZZA   ${h.toFixed(3)} m complessivi, da ${gr.mn[1] >= 0 ? '+' : ''}${gr.mn[1].toFixed(3)} ` +
      `a ${gr.mx[1] >= 0 ? '+' : ''}${gr.mx[1].toFixed(3)} sull'asse dell'albero ` +
      `(bersaglio ${ALT_BERSAGLIO}, scarto ${scarto >= 0 ? '+' : ''}${(scarto * 100).toFixed(1)}%)`)
    if (Math.abs(scarto) > TOLLERANZA_QUOTE) {
      guasti.push(
        `altezza complessiva del gruppo ${h.toFixed(3)} m contro ${ALT_BERSAGLIO} di §1.5: ` +
        `${(scarto * 100).toFixed(1)}%, fuori dal ±${TOLLERANZA_QUOTE * 100}% dichiarato. ` +
        'Prima di alzare un pezzo: §1.5 dice che in questo impianto NIENTE sporge in ' +
        'verticale oltre l\'unita\', quindi o e\' cresciuto qualcosa che non doveva, ' +
        'o un flessibile e\' rientrato nel conto.')
    }
  }

  /**
   * E IL PEZZO CHE SCAPPA DAL CONTRATTO.
   *
   * E' il difetto che ha prodotto il numero sbagliato: un nodo alla radice
   * della scena, accanto a IMPIANTO invece che sotto. Nel sito arriva lo
   * stesso — `gruppo.add(glb.scene)` prende tutto — quindi non si vede
   * nessun errore: si vede un pezzo che non risponde a nessun nome del
   * contratto, senza occlusione cotta e senza UV.
   */
  const radici = (g.scenes?.[g.scene ?? 0]?.nodes ?? []).map(i => nodi[i]?.name ?? '(senza nome)')
  const intrusi = radici.filter(n => n !== 'IMPIANTO')
  note.push(`RADICE    la scena ha ${radici.length} nodo/i in cima: ${radici.join(', ')}`)
  if (intrusi.length) {
    guasti.push(
      `alla radice della scena c'e' anche ${intrusi.join(', ')}, fuori da IMPIANTO. ` +
      'Ogni pezzo deve stare sotto un nodo di §2.1: quello che sta fuori non riceve ' +
      'le trasformazioni della regia, non ha l\'occlusione cotta, non entra ' +
      'nell\'atlante UV — e falsa qualunque misura d\'ingombro.')
  }
}

/**
 * --- L OCCLUSIONE C E ANCORA, E ADESSO HA UN INDIRIZZO
 *
 * Segnalato da una revisione: nessun cancello proteggeva l occlusione cotta.
 * Basterebbe una ricompressione senza il flag giusto per perderla, e tutto
 * resterebbe verde -- e' gia' successo con i nomi dei nodi, cancellati in
 * silenzio da gltfpack.
 *
 * QUI SI CONTROLLAVA `COLOR_0`, e non ha piu' senso: l occlusione non viaggia
 * piu' nei colori dei vertici. Il modello adesso spedisce la BASSA con una
 * normale e una occlusione in texture -- 12.448 triangoli invece di 43.152, e
 * gli smussi nella mappa. `COLOR_0` e' caduto con tutto il resto: era peso su
 * 39.261 vertici che serviva solo a portare quell AO.
 *
 * Il controllo diventa piu' forte, non piu' debole, perche' la strada in
 * texture ha piu' anelli che si possono rompere in silenzio:
 *
 *   - i materiali devono dichiarare `occlusionTexture` e `normalTexture`;
 *   - le primitive devono portare `TEXCOORD_0`, o la mappa non ha dove
 *     appoggiarsi. **gltfpack cancella le UV se nessun materiale usa una
 *     texture**, senza dirlo: e' esattamente il difetto che ha tenuto ferma
 *     questa strada per giorni;
 *   - e `TANGENT`, perche' la normale e' cotta in spazio MikkTSpace. Senza,
 *     il validatore Khronos alza MESH_PRIMITIVE_GENERATED_TANGENT_SPACE e
 *     chi disegna se le inventa: misurato, uscivano su 1 primitiva su 26,
 *     perche' `calc_tangents()` fallisce sulle facce con piu' di quattro lati
 *     e questa geometria aveva 281 n-gon.
 *
 * Se il canale VARI, o se sia tutto bianco, da questo file non si vede: gli
 * accessori compressi con meshopt non portano `min`/`max`, e l immagine e'
 * un blob. Quel pezzo lo fa `collaudo-cinematica.mjs`, dove three.js l ha gia
 * decodificata per disegnarla. Dichiararlo qui e non farlo sarebbe la cosa
 * peggiore: e' la stessa regola con cui questo file dichiara di NON
 * controllare il verso delle normali invece di far finta.
 */
if (E_IMPIANTO) {
  let prim = 0, conUV = 0, conTangenti = 0
  for (const m of g.meshes ?? []) {
    for (const p of m.primitives) {
      prim++
      if (p.attributes.TEXCOORD_0 !== undefined) conUV++
      if (p.attributes.TANGENT !== undefined) conTangenti++
    }
  }
  const mat = g.materials ?? []
  const conAO = mat.filter((m) => m.occlusionTexture).length
  const conNormale = mat.filter((m) => m.normalTexture).length
  note.push(`OCCLUSIONE ${conAO}/${mat.length} materiali con occlusionTexture, ` +
            `${conNormale} con normalTexture (la VARIAZIONE la controlla collaudo-cinematica)`)
  note.push(`UV        ${conUV}/${prim} primitive con TEXCOORD_0, ${conTangenti} con TANGENT`)
  if (conAO === 0) {
    guasti.push('nessun materiale dichiara occlusionTexture: l occlusione e sparita dal ' +
                'modello. La aggancia glb-impianto.py col gruppo di nodi "glTF Material ' +
                'Output", ingresso "Occlusion"; se quel gruppo cambia nome, sparisce zitta')
  }
  if (conNormale === 0) {
    guasti.push('nessun materiale dichiara normalTexture: senza, la BASSA e una bassa e ' +
                'basta, cioe si spedisce meno geometria E meno resa')
  }
  if (conUV < prim) {
    guasti.push(`${prim - conUV} primitive su ${prim} senza TEXCOORD_0: le mappe non hanno ` +
                'dove appoggiarsi. gltfpack cancella le UV quando nessun materiale usa una ' +
                'texture, e non lo dice')
  }
  if (conTangenti < prim) {
    guasti.push(`${prim - conTangenti} primitive su ${prim} senza TANGENT: la normale e ` +
                'cotta in MikkTSpace e chi disegna se le inventerebbe. Di solito e un n-gon: ' +
                'calc_tangents() fallisce e l esportatore salta la mesh in silenzio')
  }
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
/**
 * ─── LA RIGA IN PAGINA NON C'E' PIU', E IL CONTROLLO E' USCITO CON LEI
 *
 * Qui si verificava che «3D models downloaded» in `index.html` descrivesse
 * ancora i byte sul disco. Quella riga stava dentro la tabella «The numbers,
 * measured», tolta insieme a tutta la prosa di §04 e §05 su richiesta
 * dell'utente: «togli tutto questo testo, nessuno te lo ha chiesto».
 *
 * Il controllo se n'e' andato **col suo soggetto**, non e' stato aggirato: non
 * c'e' nessuna condizione ammorbidita per far tornare verde un cancello. Se un
 * giorno il peso torna scritto in pagina, torna anche questo confronto -- il
 * modo di farlo e' tre righe e sta nella storia di questo file.
 *
 * Resta il resto del collaudo, che non dipendeva dalla pagina: geometria,
 * quote, materiali, UV, tangenti, occlusione e peso del file.
 */
const modelli = readdirSync('public/modelli').filter(f => f.endsWith('.glb'))
const totaleKB = Math.round(
  modelli.reduce((s, f) => s + statSync(`public/modelli/${f}`).size, 0) / 1024)
note.push(`MODELLI   ${totaleKB} KB in ${modelli.length} file sul disco`)

/**
 * ═══ LE MACCHINE DELL'ATTO DUE ════════════════════════════════════════
 *
 * `docs/13-ATTO-DUE.md` §7 punto 4 chiede albero, riduttore ed elica collegati
 * a `giriPropulsione`, e il punto 5 il giroscopio. Sono due GLB nuovi, e senza
 * questo blocco entrerebbero nel sito come c'e' gia' entrata la sovrastruttura:
 * senza che nessun cancello chiedesse loro niente.
 *
 * ─── IL CONTROLLO CHE ESISTE SOLO PER QUESTI DUE MODELLI
 *
 * Un nodo che gira attorno a un'origine fuori asse **non gira: descrive un
 * cono.** E' il difetto piu' facile da fare e uno dei piu' difficili da
 * attribuire, perche' non produce nessun errore: il GLB e' valido,
 * l'animazione parte, il pezzo si muove. A schermo si vede un'elica che
 * sbanda, e la prima ipotesi di chiunque e' che il modello sia storto.
 *
 * Si misura cosi': si prende l'ingombro del nodo in coordinate di MONDO, si
 * guarda il piano perpendicolare all'asse di rotazione dichiarato, e si
 * verifica che il centro di quell'ingombro coincida con l'origine del nodo.
 * Se l'origine e' fuori asse di d, il centro dell'ingombro e' fuori di d: e'
 * la stessa quantita', vista da un punto in cui si puo' misurare.
 *
 * La tolleranza puo' essere STRETTA — il 2% dell'estensione — perche' i pezzi
 * che fanno un giro intero qui sono tutti simmetrici attorno al proprio asse:
 * l'albero e il rotore sono solidi di rivoluzione, e l'elica ha un numero PARI
 * di pale, quindi il suo ingombro e' invariante per un quarto di giro. La
 * scelta delle quattro pale e' motivata in `glb-macchine.py` proprio qui: con
 * cinque pale lo scarto geometrico sarebbe del 5,3% e la tolleranza andrebbe
 * allargata fino a non vedere piu' un difetto vero.
 *
 * ─── COSA QUESTO CANCELLO NON CONTROLLA, E VA DETTO
 *
 * **Il nodo di precessione del giroscopio non passa da questa prova.**
 * `gyro_cardano` porta i due cilindri del freno di precessione, che stanno da
 * una parte sola: il suo ingombro NON e' simmetrico attorno ai perni, e non
 * deve esserlo — una culla cardanica vera e' fatta cosi'. Applicargli la prova
 * di simmetria darebbe un rosso su una geometria corretta, cioe' un cancello
 * che insegna a ignorarlo. La sua origine si stampa e basta: chi la cambia la
 * vede cambiare, ma qui non c'e' nessuna misura che la giudichi. E' la stessa
 * regola con cui questo file dichiara di non controllare il verso delle
 * normali invece di far finta.
 */
const ASSE = { x: 0, y: 1, z: 2 }
const NOME_ASSE = ['X', 'Y', 'Z']
const TOLL_CENTRO = 0.02        // 2% dell'estensione nel piano perpendicolare
const TOLL_DIAMETRO = 0.03      // 3% fra diametro dichiarato e disegnato
const TETTO_MACCHINE_BR = 250 * 1024   // il vincolo del brief, sui DUE insieme

/**
 * LA LUNGHEZZA DELLA NAVE SI LEGGE DALLE ORDINATE, NON SI SCRIVE QUI.
 *
 * Serve a dare un metro alla scala delle macchine, e se la si copiasse a mano
 * diventerebbe falsa il giorno in cui lo scafo cambia — senza che niente lo
 * dica. Si cerca per NOME, non per riga: `docs/13-ATTO-DUE.md` avverte che i
 * numeri di riga di questo repo si spostano nel giro di ore, i nomi no.
 */
function loaMetri (metriPerUnita) {
  let src
  try { src = readFileSync('src/scafo/ordinate.js', 'utf8') } catch { return null }
  const num = (nome) => {
    const r = new RegExp('export const ' + nome + '\\s*=\\s*(-?[0-9.]+)').exec(src)
    return r ? Number(r[1]) : null
  }
  const prua = num('PRUA_Z')
  const poppa = num('POPPA_Z')
  if (prua === null || poppa === null) return null
  return (poppa - prua) * metriPerUnita
}

/**
 * Il metro dell'impianto, LETTO dal file e non assunto: e' il riferimento
 * contro cui le macchine nuove devono stare.
 */
const METRO_IMPIANTO = (() => {
  try {
    const b = readFileSync('public/modelli/impianto.glb')
    const j = JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)).toString('utf8'))
    return (j.nodes ?? []).find(n => n.extras)?.extras?.sceneMetersPerUnit ?? null
  } catch { return null }
})()

const MACCHINE = [
  {
    file: 'public/modelli/propulsione.glb',
    radice: 'PROPULSIONE',
    nodi: ['prop_motore', 'prop_riduttore', 'prop_albero', 'prop_astuccio',
           'prop_supporti', 'prop_scafo', 'prop_elica'],
    extrasAttesi: ['spinAxis', 'spinNodes', 'motorPowerKW', 'gearRatio',
                   'shaftDiameterM', 'propDiameterM', 'propBlades'],
    // Una linea d'assi completa sta fra un decimo e un terzo della nave: sotto
    // e' un giocattolo, sopra non ci starebbe in sala macchine. E' la forbice
    // che coglie l'errore di scala x10 — il piu' comune e il piu' invisibile
    // in un GLB, perche' un modello dieci volte piu' grande si apre, si vede,
    // e sembra giusto finche' non gli si mette accanto qualcos'altro.
    frazioneLOA: [0.10, 0.33],
    diametro: { nodo: 'prop_elica', extra: 'propDiameterM' }
  },
  {
    file: 'public/modelli/giroscopio.glb',
    radice: 'GIROSCOPIO',
    nodi: ['gyro_rotore', 'gyro_sfera', 'gyro_calotta', 'gyro_cardano',
           'gyro_basamento'],
    extrasAttesi: ['spinAxis', 'spinNodes', 'precessAxis', 'precessNode',
                   'rotorDiameterM', 'rotorRpm'],
    frazioneLOA: [0.02, 0.08],
    diametro: { nodo: 'gyro_rotore', extra: 'rotorDiameterM' }
  }
]

let brMacchine = 0
for (const M of MACCHINE) {
  let b
  try { b = readFileSync(M.file) } catch { guasti.push(`manca ${M.file}`); continue }
  const j = JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)).toString('utf8'))
  const L = lettore(j)
  const eti = M.file.split('/').pop()
  const kbM = Math.round(b.length / 1024)
  const brM = brotliCompressSync(b, { params: { [ZLIB.BROTLI_PARAM_QUALITY]: 11 } }).length
  brMacchine += brM
  note.push(`MACCHINA  ${eti}  ${kbM} KB grezzo, ${(brM / 1024).toFixed(1)} KB brotli`)
  if (kbM > TETTO_KB) {
    guasti.push(`${eti}: ${kbM} KB sfondano l'obiettivo provvisorio di ${TETTO_KB} KB (§9)`)
  }

  const persiM = M.nodi.filter(n => !L.perNome.has(n))
  if (persiM.length) {
    guasti.push(`${eti}: mancano i nodi ${persiM.join(', ')} — sono il contratto che il ` +
                'sito interroga per nome, e gltfpack li cancella tutti se si scorda -kn')
    continue
  }
  const vuotiM = M.nodi.filter(n => !L.ingombro(L.perNome.get(n)))
  if (vuotiM.length) {
    guasti.push(`${eti}: nodi senza geometria sotto: ${vuotiM.join(', ')} — il nome e' ` +
                'sopravvissuto alla compressione, il pezzo no')
  }

  const radiciM = (j.scenes?.[j.scene ?? 0]?.nodes ?? [])
    .map(i => j.nodes[i]?.name ?? '(senza nome)')
  if (radiciM.length !== 1 || radiciM[0] !== M.radice) {
    guasti.push(`${eti}: la scena ha in cima ${radiciM.join(', ')} invece del solo ` +
                `${M.radice}. Un pezzo alla radice arriva nel sito lo stesso e non ` +
                'risponde a nessun nome del contratto.')
  }

  const exM = j.nodes?.find(n => n.extras)?.extras ?? null
  if (!exM) {
    guasti.push(`${eti}: nessun extras — il sito non saprebbe ne' l'unita' ne' ` +
                'attorno a quale asse far girare i pezzi')
    continue
  }
  if (exM.authoringUnit !== 'meter') {
    guasti.push(`${eti}: authoringUnit e' "${exM.authoringUnit}", non "meter": la ` +
                'conversione 0,4 del sito diventa falsa')
  }
  // ─── LO STESSO RIFERIMENTO METRICO DELL'IMPIANTO, LETTO DAI DUE FILE ───
  if (METRO_IMPIANTO !== null && exM.sceneMetersPerUnit !== METRO_IMPIANTO) {
    guasti.push(`${eti}: sceneMetersPerUnit e' ${exM.sceneMetersPerUnit} mentre ` +
                `impianto.glb dichiara ${METRO_IMPIANTO}. Due modelli nella stessa scena ` +
                'con due metri diversi non danno nessun errore: danno una macchina ' +
                'grande il doppio accanto a una giusta.')
  }
  for (const k of M.extrasAttesi) {
    if (exM[k] === undefined) guasti.push(`${eti}: manca l'extra ${k}`)
  }

  // ─── l'ingombro, e la scala misurata contro la nave ───────────────────
  const tuttoM = L.ingombro(L.perNome.get(M.radice))
  if (tuttoM) {
    const d = [0, 1, 2].map(i => tuttoM.mx[i] - tuttoM.mn[i])
    const loa = loaMetri(exM.sceneMetersPerUnit)
    const q = Math.max(...d)
    const forbice = M.frazioneLOA.map(f => (f * 100).toFixed(0)).join('-')
    if (loa) {
      note.push(`          ingombro ${d.map(v => v.toFixed(2)).join(' x ')} m; quota maggiore ` +
                `${q.toFixed(2)} m = ${(q / loa * 100).toFixed(1)}% dei ${loa.toFixed(0)} m ` +
                `di scafo (forbice ${forbice}%)`)
      const f = q / loa
      if (f < M.frazioneLOA[0] || f > M.frazioneLOA[1]) {
        guasti.push(`${eti}: la quota maggiore e' ${q.toFixed(2)} m, il ` +
                    `${(f * 100).toFixed(1)}% dei ${loa.toFixed(0)} m di scafo, fuori dalla ` +
                    `forbice ${forbice}%. Un fattore 10 sulla scala esce di qui e da ` +
                    'nessun\'altra parte.')
      }
    } else {
      note.push(`          ingombro ${d.map(v => v.toFixed(2)).join(' x ')} m ` +
                '(LOA non ricavabile da src/scafo/ordinate.js: forbice non verificata)')
    }
  }

  // ─── I NODI CHE FANNO UN GIRO INTERO: L'ORIGINE STA SULL'ASSE? ────────
  const iAsse = ASSE[String(exM.spinAxis).toLowerCase()]
  if (iAsse === undefined) {
    guasti.push(`${eti}: spinAxis e' "${exM.spinAxis}", non x/y/z: il sito non saprebbe ` +
                'attorno a cosa far girare i pezzi')
  } else {
    const perp = [0, 1, 2].filter(i => i !== iAsse)
    for (const nome of String(exM.spinNodes).split(',').map(x => x.trim()).filter(Boolean)) {
      const i = L.perNome.get(nome)
      if (i === undefined) {
        guasti.push(`${eti}: spinNodes nomina ${nome}, che nel file non c'e'`)
        continue
      }
      const m = L.mondo(i)
      if (!m) { guasti.push(`${eti}: ${nome} non e' raggiungibile dalla scena`); continue }
      const bb = L.ingombro(i, m.padre)
      if (!bb) { guasti.push(`${eti}: ${nome} non ha geometria da far girare`); continue }
      const org = [m.w[12], m.w[13], m.w[14]]
      const detto = []
      for (const d of perp) {
        const centro = (bb.mn[d] + bb.mx[d]) / 2
        const est = bb.mx[d] - bb.mn[d]
        const scarto = Math.abs(centro - org[d])
        detto.push(`${NOME_ASSE[d]} ${(scarto * 1000).toFixed(1)} mm su ${(est * 1000).toFixed(0)}`)
        if (est > 0 && scarto / est > TOLL_CENTRO) {
          guasti.push(
            `${eti}: l'origine di ${nome} e' fuori dal suo asse di rotazione. Sull'asse ` +
            `${NOME_ASSE[d]} il centro della geometria sta a ${centro.toFixed(4)} m e ` +
            `l'origine del nodo a ${org[d].toFixed(4)}: ${(scarto * 1000).toFixed(1)} mm, il ` +
            `${(scarto / est * 100).toFixed(1)}% dell'estensione, oltre il ${TOLL_CENTRO * 100}%. ` +
            'Ruotando, quel pezzo descrive un CONO invece di girare — e non da\' nessun errore.')
        }
      }
      note.push(`          ${nome} gira attorno a ${NOME_ASSE[iAsse]}: ` +
                `scarto dell'origine ${detto.join(', ')}`)
    }
  }
  if (exM.precessNode) {
    const i = L.perNome.get(exM.precessNode)
    const m = i === undefined ? null : L.mondo(i)
    if (!m) {
      guasti.push(`${eti}: precessNode nomina ${exM.precessNode}, che nel file non c'e'`)
    } else {
      note.push(`          ${exM.precessNode} precede attorno a ` +
                `${String(exM.precessAxis).toUpperCase()}, origine ` +
                `(${[12, 13, 14].map(k => m.w[k].toFixed(3)).join(', ')}) — NON verificata ` +
                'per simmetria, vedi la nota qui sopra')
    }
  }

  // ─── IL DIAMETRO DICHIARATO DEVE DESCRIVERE IL PEZZO DISEGNATO ────────
  //
  // Stessa regola di `finAreaM2` sull'impianto, dove un numero dichiarato
  // valeva tre volte la forma che descriveva. Qui si puo' fare meglio di un
  // confronto per ordine di grandezza: i due pezzi in questione sono
  // simmetrici attorno al proprio asse, quindi l'ingombro nel piano
  // perpendicolare E' il diametro, e si confronta al 3%.
  if (M.diametro && iAsse !== undefined) {
    const i = L.perNome.get(M.diametro.nodo)
    const m = i === undefined ? null : L.mondo(i)
    const bb = m ? L.ingombro(i, m.padre) : null
    const atteso = exM[M.diametro.extra]
    if (bb && typeof atteso === 'number') {
      const perp = [0, 1, 2].filter(k => k !== iAsse)
      const misurato = Math.max(...perp.map(d => bb.mx[d] - bb.mn[d]))
      const sc = (misurato - atteso) / atteso
      note.push(`          ${M.diametro.extra} dichiarato ${atteso} m, misurato ` +
                `${misurato.toFixed(3)} m su ${M.diametro.nodo} ` +
                `(${sc >= 0 ? '+' : ''}${(sc * 100).toFixed(1)}%)`)
      if (Math.abs(sc) > TOLL_DIAMETRO) {
        guasti.push(`${eti}: ${M.diametro.extra} dichiara ${atteso} m ma ` +
                    `${M.diametro.nodo} ne misura ${misurato.toFixed(3)}: ` +
                    `${(sc * 100).toFixed(1)}%, oltre il ${TOLL_DIAMETRO * 100}%. Il numero ` +
                    'dichiarato non descrive la forma disegnata.')
      }
    }
  }
}

/**
 * IL TETTO E' IN BROTLI, E SI MISURA QUI PERCHE' E' IL NUMERO CHE PASSA SUL FILO.
 *
 * Il grezzo del disco non lo prevede e non ci va nemmeno vicino: la geometria
 * meshopt si comprime ancora ~2,4 volte, una texture webp per niente. Due
 * modelli con lo stesso peso su disco possono costare molto diverso in rete a
 * seconda di cosa c'e' dentro — e quello che conta e' la rete.
 */
if (brMacchine) {
  const ok = brMacchine <= TETTO_MACCHINE_BR
  note.push(`MACCHINE  ${(brMacchine / 1024).toFixed(1)} KB brotli in due, su un tetto di ` +
            `${(TETTO_MACCHINE_BR / 1024).toFixed(0)} — ${ok ? 'dentro' : 'FUORI'}`)
  if (!ok) {
    guasti.push(`le due macchine dell'atto due pesano ${(brMacchine / 1024).toFixed(1)} KB ` +
                `brotli contro un tetto di ${(TETTO_MACCHINE_BR / 1024).toFixed(0)}.`)
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
