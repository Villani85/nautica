/**
 * COLLAUDO-GLTF — le domande di §10.1 che nessuno faceva.
 *
 *     node strumenti/collaudo-gltf.mjs [percorso.glb ...]
 *     node strumenti/collaudo-gltf.mjs --radice <cartella>
 *
 * `docs/14-FOTOREALISMO.md` §10.1 elenca otto motivi per cui un modello deve
 * diventare rosso. Quattro li chiede già `collaudo-glb.mjs` (nodi del contratto,
 * ingombro, `authoringUnit`, peso). Gli altri quattro erano scritti e basta:
 *
 *   NOMI DUPLICATI     nessuno li cercava. Peggio: chi legge i nodi lo fa con
 *                      una `Map` (`collaudo-glb.mjs:69`) e il sito con un
 *                      oggetto (`impianto.js`, `nodi[o.name] = o`). In tutti e
 *                      due i casi **l'ultimo omonimo vince e il primo sparisce**
 *                      senza un errore: il nodo esiste, il contratto è
 *                      soddisfatto, e il pezzo che si muove è quello sbagliato.
 *   SCALA RADICE 0,4   §2.2 la prescrive, e §12 vieta di sceglierla guardando
 *                      lo schermo. Ma il numero vive in un file JS e nessun
 *                      cancello lo guardava: si poteva ritoccare a occhio e
 *                      restare verdi.
 *   PIVOT ALBERO/PINNA §2.1 dice «asse locale di rotazione di RIG_SHAFT e
 *                      RIG_FIN: asse dell'albero» e «nessun pivot viene
 *                      corretto in JavaScript». Se i due divergono la pinna
 *                      ruota attorno a un altro punto: a 5° non si vede, a 25°
 *                      la pinna entra nello scafo.
 *   MATERIALI/TEXTURE  un riferimento che non si risolve non ferma three.js:
 *                      mette un materiale bianco di riserva e va avanti.
 *   VALIDATOR KHRONOS  non era né installato né invocato.
 *
 * ─── PERCHÉ È UN FILE A PARTE
 *
 * `collaudo-glb.mjs` misura il *contratto geometrico* dell'impianto: orbita,
 * apertura, area, occlusione. Questo misura la *conformità del file* e il patto
 * fra il file e il codice che lo carica. Sono due domande diverse e restano in
 * due file: quello lì non si tocca.
 *
 * ─── IL VALIDATORE NON SA LEGGERE MESHOPT, QUINDI SI DECOMPRIME PRIMA
 *
 * Questa è la cosa importante da sapere prima di fidarsi del verde.
 * `gltf-validator` 2.0.0-dev.3.10 **non supporta `EXT_meshopt_compression`**:
 * sui nostri GLB dichiara «Cannot validate an extension as it is not supported»
 * e poi non guarda un solo byte di geometria. Un file con indici fuori range o
 * posizioni NaN uscirebbe con zero errori.
 *
 * Quindi si valida due volte: il file com'è (struttura, estensioni, header) e
 * una copia decompressa in memoria con lo stesso decodificatore meshopt che usa
 * il sito. La seconda è quella che guarda i dati. Se la decompressione fallisce
 * il collaudo è rosso, non «saltato»: un controllo che si autoesclude in
 * silenzio è il difetto che questi cancelli esistono per non avere.
 *
 * ─── LA RADICE
 *
 * `--radice <cartella>` fa girare tutto su un'altra copia dell'albero
 * (`public/modelli/`, `src/scena/`). Serve per una cosa sola: **rompere ogni
 * controllo apposta e guardarlo diventare rosso**, senza toccare i file veri.
 * Un cancello che non si è visto fallire non è un cancello.
 *
 * ─── COSA NON CONTROLLA
 *
 * Il verso delle normali (sta nel builder), la variazione dei colori di vertice
 * (la fa `collaudo-cinematica.mjs` dove three.js li ha già decodificati), e la
 * plausibilità visiva di qualunque cosa. Questo file legge il file.
 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { join, dirname, basename, resolve as risolviPercorso } from 'node:path'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { Quaternion, Euler, Matrix4, Vector3 } from 'three'
import validatore from 'gltf-validator'

// ─── argomenti ────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
let RADICE = process.cwd()
const espliciti = []
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--radice') RADICE = argv[++i]
  else espliciti.push(argv[i])
}
const dentro = (...p) => join(RADICE, ...p)

const CARTELLA_MODELLI = dentro('public', 'modelli')
const SORGENTE_IMPIANTO = dentro('src', 'scena', 'impianto.js')
const SORGENTE_MATERIA = dentro('src', 'scena', 'materia.js')

const MODELLI = espliciti.length
  ? espliciti
  : (existsSync(CARTELLA_MODELLI)
      ? readdirSync(CARTELLA_MODELLI).filter(f => f.endsWith('.glb')).map(f => join(CARTELLA_MODELLI, f))
      : [])

/** §2.2: 1 unità di scena = 2,5 m, quindi la radice si scala di 1/2,5. */
const SCALA_RADICE_ATTESA = 0.4
/** La conversione è una divisione esatta: non c'è margine da concedere. */
const TOLLERANZA_SCALA = 1e-9
/** I due nodi che §2.1 vuole solidali. */
const COPPIA_PIVOT = ['RIG_SHAFT', 'RIG_FIN']
/** Un decimo di millimetro: sotto, è rumore di virgola mobile. */
const TOLLERANZA_PIVOT_M = 1e-4
/** Mezzo grado: sopra, a 25° di barra la punta della pinna si sposta di cm. */
const TOLLERANZA_ASSE_GRADI = 0.5

const guasti = []
const note = []
const dice = (s) => note.push(s)
const rompe = (s) => guasti.push(s)

// ─── lettura del GLB ──────────────────────────────────────────────────────
function apri (file) {
  const buf = readFileSync(file)
  if (buf.length < 20 || buf.readUInt32LE(0) !== 0x46546c67) {
    throw new Error(`${file} non è un GLB (manca la firma glTF)`)
  }
  const lunghezzaJson = buf.readUInt32LE(12)
  const json = JSON.parse(buf.subarray(20, 20 + lunghezzaJson).toString('utf8'))
  // il chunk BIN, se c'è: header 12 + (8 + json) + 8
  let bin = new Uint8Array(0)
  const inizioBin = 20 + lunghezzaJson
  if (buf.length >= inizioBin + 8) {
    const lunghezzaBin = buf.readUInt32LE(inizioBin)
    const tipo = buf.readUInt32LE(inizioBin + 4)
    if (tipo === 0x004e4942) {
      bin = new Uint8Array(buf.subarray(inizioBin + 8, inizioBin + 8 + lunghezzaBin))
    }
  }
  return { json, bin, buf: new Uint8Array(buf) }
}

/** I byte di un buffer glTF, qualunque sia il modo in cui li tiene. */
function byteDelBuffer (json, bin, file, indice) {
  const b = json.buffers?.[indice]
  if (!b) throw new Error(`buffer ${indice} inesistente`)
  if (b.extensions?.EXT_meshopt_compression?.fallback) {
    // buffer di ripiego: dichiarato, mai riempito. Esiste per i lettori che non
    // sanno decomprimere, e va bene che sia di zeri.
    return new Uint8Array(b.byteLength ?? 0)
  }
  if (!b.uri) return bin
  if (b.uri.startsWith('data:')) {
    return new Uint8Array(Buffer.from(b.uri.slice(b.uri.indexOf(',') + 1), 'base64'))
  }
  const p = join(dirname(file), decodeURIComponent(b.uri))
  if (!existsSync(p)) throw new Error(`il buffer ${indice} punta a ${b.uri}, che non esiste`)
  return new Uint8Array(readFileSync(p))
}

/**
 * Rifà il GLB senza meshopt, così il validatore può guardare i DATI.
 * Non si scrive su disco: vive il tempo di una validazione.
 */
function decomprimi (json, bin, file) {
  const sorgenti = new Map()
  const daBuffer = (i) => {
    if (!sorgenti.has(i)) sorgenti.set(i, byteDelBuffer(json, bin, file, i))
    return sorgenti.get(i)
  }

  const pezzi = (json.bufferViews ?? []).map((bv, i) => {
    const c = bv.extensions?.EXT_meshopt_compression
    if (!c) {
      const s = daBuffer(bv.buffer)
      const off = bv.byteOffset ?? 0
      if (off + bv.byteLength > s.length) {
        throw new Error(`bufferView ${i} esce dal buffer ${bv.buffer} ` +
                        `(${off}+${bv.byteLength} > ${s.length})`)
      }
      return s.slice(off, off + bv.byteLength)
    }
    const fuori = new Uint8Array(c.count * c.byteStride)
    const s = daBuffer(c.buffer)
    const off = c.byteOffset ?? 0
    if (off + c.byteLength > s.length) {
      throw new Error(`i dati compressi del bufferView ${i} escono dal buffer ${c.buffer}`)
    }
    MeshoptDecoder.decodeGltfBuffer(
      fuori, c.count, c.byteStride, s.subarray(off, off + c.byteLength), c.mode, c.filter)
    return fuori
  })

  const j = JSON.parse(JSON.stringify(json))
  let cursore = 0
  j.bufferViews = (json.bufferViews ?? []).map((bv, i) => {
    const nuovo = { buffer: 0, byteOffset: cursore, byteLength: pezzi[i].length }
    if (bv.byteStride !== undefined) nuovo.byteStride = bv.byteStride
    if (bv.target !== undefined) nuovo.target = bv.target
    if (bv.name !== undefined) nuovo.name = bv.name
    cursore += pezzi[i].length
    if (cursore % 4) cursore += 4 - (cursore % 4)
    return nuovo
  })
  const binNuovo = new Uint8Array(cursore)
  for (let i = 0; i < pezzi.length; i++) binNuovo.set(pezzi[i], j.bufferViews[i].byteOffset)

  j.buffers = [{ byteLength: cursore }]
  const via = (a) => (a ?? []).filter(e => e !== 'EXT_meshopt_compression')
  if (j.extensionsUsed) j.extensionsUsed = via(j.extensionsUsed)
  if (j.extensionsRequired) j.extensionsRequired = via(j.extensionsRequired)
  if (!j.extensionsUsed?.length) delete j.extensionsUsed
  if (!j.extensionsRequired?.length) delete j.extensionsRequired

  // e si riimpacchetta
  const testoJson = Buffer.from(JSON.stringify(j), 'utf8')
  const padJson = (4 - (testoJson.length % 4)) % 4
  const padBin = (4 - (binNuovo.length % 4)) % 4
  const totale = 12 + 8 + testoJson.length + padJson + 8 + binNuovo.length + padBin
  const out = Buffer.alloc(totale)
  out.writeUInt32LE(0x46546c67, 0); out.writeUInt32LE(2, 4); out.writeUInt32LE(totale, 8)
  out.writeUInt32LE(testoJson.length + padJson, 12); out.writeUInt32LE(0x4e4f534a, 16)
  testoJson.copy(out, 20)
  out.fill(0x20, 20 + testoJson.length, 20 + testoJson.length + padJson)
  const dopo = 20 + testoJson.length + padJson
  out.writeUInt32LE(binNuovo.length + padBin, dopo); out.writeUInt32LE(0x004e4942, dopo + 4)
  Buffer.from(binNuovo).copy(out, dopo + 8)
  return { json: j, bin: binNuovo, buf: new Uint8Array(out) }
}

// ─── 1. IL VALIDATORE DI KHRONOS ──────────────────────────────────────────
const SEVERITA = ['errori', 'avvisi', 'informazioni', 'suggerimenti']
const SEVERITA_UNA = ['ERRORE', 'AVVISO', 'INFO', 'SUGGERIMENTO']

async function passaAlValidatore (etichetta, byte, file, rossoSuAvvisi = true) {
  let esito
  try {
    esito = await validatore.validateBytes(new Uint8Array(byte), {
      uri: file,
      // le risorse esterne si leggono davvero: un `uri` che non si apre deve
      // diventare un errore del validatore, non un'assenza
      externalResourceFunction: (uri) => {
        const p = join(dirname(file), decodeURIComponent(uri))
        if (!existsSync(p)) return Promise.reject(new Error(`non trovo ${uri}`))
        return Promise.resolve(new Uint8Array(readFileSync(p)))
      }
    })
  } catch (e) {
    rompe(`${basename(file)} [${etichetta}]: il validatore Khronos non è riuscito ` +
          `nemmeno ad aprirlo — ${e.message ?? e}`)
    return
  }

  const q = esito.issues
  const perCategoria = [q.numErrors, q.numWarnings, q.numInfos, q.numHints]
  dice(`VALIDATORE ${basename(file)} [${etichetta}]  ` +
       perCategoria.map((n, i) => `${n} ${SEVERITA[i]}`).join(', '))

  // raggruppati per codice: dieci volte lo stesso difetto è un difetto
  const gruppi = new Map()
  for (const m of q.messages ?? []) {
    const k = `${m.severity}|${m.code}`
    if (!gruppi.has(k)) gruppi.set(k, { ...m, quante: 0 })
    gruppi.get(k).quante++
  }
  for (const g of gruppi.values()) {
    const riga = `  ${SEVERITA_UNA[g.severity]} ${g.code}` +
                 `${g.quante > 1 ? ` ×${g.quante}` : ''} @ ${g.pointer ?? g.offset ?? '-'} — ${g.message}`
    dice(riga)
  }

  if (q.numErrors > 0) {
    rompe(`${basename(file)} [${etichetta}]: ${q.numErrors} errori del validatore Khronos ` +
          `(${[...gruppi.values()].filter(g => g.severity === 0).map(g => g.code).join(', ')})`)
  }
  if (rossoSuAvvisi && q.numWarnings > 0) {
    rompe(`${basename(file)} [${etichetta}]: ${q.numWarnings} avvisi del validatore Khronos ` +
          `(${[...gruppi.values()].filter(g => g.severity === 1).map(g => g.code).join(', ')}). ` +
          'Un avviso di Khronos è un pezzo di specifica che stiamo tirando: si decide, non si subisce.')
  }
  return esito
}

// ─── 2. NOMI DI NODO DUPLICATI ────────────────────────────────────────────
/**
 * Il guasto è l'assorbimento silenzioso: `new Map(nodi.map(n => [n.name, i]))`
 * e `nodi[o.name] = o` tengono l'ULTIMO. Due nodi chiamati `RIG_FIN` e il sito
 * muove il secondo — mentre il primo resta fermo in scena, visibile, morto.
 */
function nomiDuplicati (json, file) {
  const conta = new Map()
  for (const n of json.nodes ?? []) {
    if (!n.name) continue
    conta.set(n.name, (conta.get(n.name) ?? 0) + 1)
  }
  const doppi = [...conta].filter(([, q]) => q > 1)
  dice(`NOMI      ${basename(file)}: ${conta.size} nomi distinti su ` +
       `${(json.nodes ?? []).filter(n => n.name).length} nodi con nome`)
  if (doppi.length) {
    rompe(`${basename(file)}: nomi di nodo duplicati — ` +
          doppi.map(([n, q]) => `${n} ×${q}`).join(', ') +
          '. Chi legge per nome tiene l\'ultimo: il primo omonimo sparisce dal ' +
          'controllo del sito senza un errore, e resta in scena immobile.')
  }
  // stessa trappola sui materiali: `impianto.js` applica le lavorazioni per
  // `mat.name`, e due materiali omonimi con parametri diversi sono
  // indistinguibili da lì
  const contaMat = new Map()
  for (const m of json.materials ?? []) {
    if (!m.name) continue
    contaMat.set(m.name, (contaMat.get(m.name) ?? 0) + 1)
  }
  const doppiMat = [...contaMat].filter(([, q]) => q > 1)
  if (doppiMat.length) {
    rompe(`${basename(file)}: materiali con lo stesso nome — ` +
          doppiMat.map(([n, q]) => `${n} ×${q}`).join(', ') +
          '. Le lavorazioni di `materia.js` si applicano per nome: due omonimi ' +
          'sono la stessa cosa per il sito e cose diverse nel file.')
  }
}

// ─── 3. LA SCALA RADICE 0,4 ───────────────────────────────────────────────
/**
 * Il numero non sta nel GLB: sta nel codice che lo carica, che è il posto
 * giusto (§2). Ma allora è lì che va guardato, altrimenti «0,4» è una frase in
 * un documento. Si legge il sorgente, si risolve la costante e si confronta.
 *
 * Non si importa `impianto.js`: tira dentro three, WebGL e `location`. Si legge
 * l'assegnazione e si risolvono gli identificatori all'indietro — se un giorno
 * la riga cambia forma, questo controllo diventa rosso chiedendo di essere
 * aggiornato, che è meglio che diventare cieco.
 */
function risolviCostante (sorgente, nome, profondita = 0) {
  if (profondita > 5) return NaN
  const m = sorgente.match(
    new RegExp(`\\bconst\\s+${nome}\\s*=\\s*([^\\n]+?)\\s*(?://.*)?$`, 'm'))
  if (!m) return NaN
  const espressione = m[1].replace(/\/\*.*?\*\//g, '').trim()
  if (!/^[-+*/(). \d\w]+$/.test(espressione)) return NaN
  const identificatori = [...new Set(espressione.match(/[A-Za-z_$][\w$]*/g) ?? [])]
  let calcolabile = espressione
  for (const id of identificatori) {
    const v = risolviCostante(sorgente, id, profondita + 1)
    if (!Number.isFinite(v)) return NaN
    calcolabile = calcolabile.replace(new RegExp(`\\b${id}\\b`, 'g'), `(${v})`)
  }
  try {
    const v = Function(`"use strict";return (${calcolabile})`)()
    return typeof v === 'number' ? v : NaN
  } catch { return NaN }
}

function scalaRadice (json, file) {
  if (!existsSync(SORGENTE_IMPIANTO)) {
    rompe(`non trovo ${SORGENTE_IMPIANTO}: la scala 0,4 vive lì, e senza quel file ` +
          'questo controllo non ha niente da leggere')
    return
  }
  const sorgente = readFileSync(SORGENTE_IMPIANTO, 'utf8')
  const m = sorgente.match(/\.scale\.setScalar\(\s*([^)]+?)\s*\)/)
  if (!m) {
    rompe(`in ${basename(SORGENTE_IMPIANTO)} non trovo più \`.scale.setScalar(...)\` sulla ` +
          'radice del GLB: se la conversione è stata scritta in un altro modo, questo ' +
          'controllo va aggiornato invece che perso.')
    return
  }
  const argomento = m[1].trim()
  const valore = /^[\d.eE+-]+$/.test(argomento)
    ? parseFloat(argomento)
    : risolviCostante(sorgente, argomento)

  if (!Number.isFinite(valore)) {
    rompe(`in ${basename(SORGENTE_IMPIANTO)} la scala della radice è \`${argomento}\`, ` +
          'e non riesco a risolverla in un numero: un cancello che non sa leggere il ' +
          'numero non può giurare che sia 0,4.')
    return
  }
  dice(`SCALA     il sito scala la radice di ${valore} (\`${argomento}\` in ` +
       `${basename(SORGENTE_IMPIANTO)}), atteso ${SCALA_RADICE_ATTESA}`)
  if (Math.abs(valore - SCALA_RADICE_ATTESA) > TOLLERANZA_SCALA) {
    rompe(`la scala della radice è ${valore}, non ${SCALA_RADICE_ATTESA} (§2.2 e §10.1). ` +
          'È la conversione metri→unità di scena, non una taratura: se il modello sembra ' +
          'della misura sbagliata si cambia il modello. §12 vieta le scale scelte a occhio.')
  }

  // e deve restare d'accordo con quello che il GLB dichiara di sé
  const extra = (json.nodes ?? []).find(n => n.extras?.sceneMetersPerUnit !== undefined)?.extras
  if (extra) {
    const dallGlb = 1 / extra.sceneMetersPerUnit
    if (Math.abs(dallGlb - valore) > 1e-6) {
      rompe(`${basename(file)} dichiara sceneMetersPerUnit ${extra.sceneMetersPerUnit} ` +
            `(cioè una scala di ${dallGlb.toFixed(6)}), ma il sito applica ${valore}: ` +
            'il modello e il codice raccontano due scene diverse.')
    }
  }

  // una scala sui nodi di primo livello moltiplicherebbe quella della radice
  for (const i of json.scenes?.[json.scene ?? 0]?.nodes ?? []) {
    const n = json.nodes[i]
    const s = n.scale ?? (n.matrix ? scalaDaMatrice(n.matrix) : [1, 1, 1])
    if (s.some(v => Math.abs(v - 1) > 1e-6)) {
      rompe(`${basename(file)}: il nodo di primo livello ${n.name ?? i} porta già una scala ` +
            `(${s.map(v => v.toFixed(4)).join(', ')}): moltiplica quella del sito, e la ` +
            'conversione 0,4 smette di essere la scala vera del modello.')
    }
  }
}

function scalaDaMatrice (m) {
  return [0, 1, 2].map(c => Math.hypot(m[c * 4], m[c * 4 + 1], m[c * 4 + 2]))
}

// ─── 4. I PIVOT DI ALBERO E PINNA ─────────────────────────────────────────
/**
 * Non basta che i due nodi stiano nello stesso punto: quello che conta è
 * l'ASSE attorno a cui gireranno nel sito. `impianto.js` scrive
 * `nodi.RIG_FIN.rotation.x` e `nodi.RIG_SHAFT.rotation.x`, cioè sovrascrive la
 * componente X dell'Euler e lascia in piedi Y e Z. L'asse effettivo è quindi la
 * colonna X della matrice mondo calcolata CON x azzerato — ed è esattamente
 * così che lo si ricostruisce qui, invece di assumere che i nodi siano dritti.
 *
 * Due assi paralleli ma sfalsati di un centimetro, a 25° di barra, spostano la
 * punta della pinna di più di un centimetro e la fanno mordere la tenuta.
 * Guardando lo schermo si vede una pinna che ruota: bisogna guardare il file.
 */
function matriceLocale (n, azzeraX = false) {
  const M = new Matrix4()
  if (n.matrix) M.fromArray(n.matrix)
  else {
    const q = new Quaternion().fromArray(n.rotation ?? [0, 0, 0, 1])
    M.compose(
      new Vector3().fromArray(n.translation ?? [0, 0, 0]),
      q,
      new Vector3().fromArray(n.scale ?? [1, 1, 1]))
  }
  if (!azzeraX) return M
  const p = new Vector3(); const q = new Quaternion(); const s = new Vector3()
  M.decompose(p, q, s)
  const e = new Euler().setFromQuaternion(q, 'XYZ')
  e.x = 0
  return new Matrix4().compose(p, new Quaternion().setFromEuler(e), s)
}

function assiDiRotazione (json, nomi) {
  const genitore = new Map()
  ;(json.nodes ?? []).forEach((n, i) => { for (const c of n.children ?? []) genitore.set(c, i) })
  const indice = new Map()
  // come three.js: `nodi[o.name] = o` tiene l'ULTIMO omonimo. Qui si imita il
  // sito, non si sceglie meglio di lui: il cancello deve misurare il pezzo che
  // si muoverà davvero
  ;(json.nodes ?? []).forEach((n, i) => { if (n.name) indice.set(n.name, i) })

  const esito = new Map()
  for (const nome of nomi) {
    const i = indice.get(nome)
    if (i === undefined) continue
    const catena = []
    for (let k = i; k !== undefined; k = genitore.get(k)) catena.unshift(k)
    const M = new Matrix4()
    for (const k of catena) M.multiply(matriceLocale(json.nodes[k], k === i))
    esito.set(nome, {
      origine: new Vector3().setFromMatrixPosition(M),
      asse: new Vector3().setFromMatrixColumn(M, 0).normalize()
    })
  }
  return esito
}

function pivotSolidali (json, file) {
  const assi = assiDiRotazione(json, COPPIA_PIVOT)
  const mancanti = COPPIA_PIVOT.filter(n => !assi.has(n))
  if (mancanti.length) {
    // che i nodi ci siano lo dice già collaudo-glb; qui si dice solo che il
    // controllo non ha potuto girare, invece di tacere
    rompe(`${basename(file)}: non trovo ${mancanti.join(', ')}, quindi il pivot di albero ` +
          'e pinna non è stato confrontato con niente')
    return
  }
  const [a, b] = COPPIA_PIVOT.map(n => assi.get(n))
  const distanza = a.origine.distanceTo(b.origine)
  const gradi = Math.acos(Math.min(1, Math.abs(a.asse.dot(b.asse)))) * 180 / Math.PI
  dice(`PIVOT     ${COPPIA_PIVOT.join(' vs ')}: origini distanti ` +
       `${(distanza * 1000).toFixed(3)} mm, assi divergenti ${gradi.toFixed(4)}°`)
  if (distanza > TOLLERANZA_PIVOT_M) {
    rompe(`${basename(file)}: i pivot di ${COPPIA_PIVOT.join(' e ')} distano ` +
          `${(distanza * 1000).toFixed(2)} mm. §2.1 li vuole sull'asse dell'albero, e ` +
          '«nessun pivot viene corretto in JavaScript con offset inventati»: la pinna ' +
          'ruoterebbe attorno a un punto che non è il suo, e a barra piccola non si vede.')
  }
  if (gradi > TOLLERANZA_ASSE_GRADI) {
    rompe(`${basename(file)}: gli assi di rotazione di ${COPPIA_PIVOT.join(' e ')} divergono ` +
          `di ${gradi.toFixed(2)}°. Il sito assegna lo STESSO angolo a tutti e due ` +
          '(`rotation.x`): con assi diversi, albero e pinna smettono di essere un pezzo solo.')
  }
  // e l'asse deve essere quello dell'albero, cioè +X (§2.3)
  for (const nome of COPPIA_PIVOT) {
    const cos = Math.abs(assi.get(nome).asse.dot(new Vector3(1, 0, 0)))
    const fuori = Math.acos(Math.min(1, cos)) * 180 / Math.PI
    if (fuori > TOLLERANZA_ASSE_GRADI) {
      rompe(`${basename(file)}: l'asse di ${nome} è a ${fuori.toFixed(2)}° da +X. ` +
            '§2.3 dice che l\'albero ruota attorno a +X, ed è su `rotation.x` che il sito scrive.')
    }
  }
}

// ─── 5. MATERIALI E TEXTURE DICHIARATI MA NON CARICABILI ──────────────────
/**
 * three.js non si ferma su un riferimento rotto: mette il materiale bianco di
 * riserva e disegna. Il pezzo diventa di plastica e nessuno sa perché.
 *
 * Si guardano tre cose diverse che finiscono nello stesso modo:
 *   · una primitiva senza materiale, o con un indice che non esiste;
 *   · una texture che punta a un'immagine assente, vuota o non riconoscibile;
 *   · un materiale che il SITO si aspetta per nome (`LAVORAZIONI` in
 *     `materia.js`) e che in nessun modello esiste — quel caso è il più
 *     silenzioso di tutti, perché non rompe niente: la lavorazione
 *     semplicemente non viene mai applicata, e la rugosità resta costante.
 */
const FIRME = [
  { nome: 'PNG', byte: [0x89, 0x50, 0x4e, 0x47] },
  { nome: 'JPEG', byte: [0xff, 0xd8, 0xff] },
  { nome: 'RIFF/WebP', byte: [0x52, 0x49, 0x46, 0x46] },
  { nome: 'KTX2', byte: [0xab, 0x4b, 0x54, 0x58] }
]

function materialiETexture (json, bin, file) {
  const eti = basename(file)
  const materiali = json.materials ?? []

  let primitive = 0
  for (const [im, m] of (json.meshes ?? []).entries()) {
    for (const [ip, p] of m.primitives.entries()) {
      primitive++
      if (p.material === undefined) {
        rompe(`${eti}: la primitiva ${ip} della mesh ${m.name ?? im} non ha materiale. ` +
              'three.js le mette il grigio di riserva e il pezzo esce di plastica: ' +
              'nessun errore, solo una resa sbagliata.')
      } else if (!materiali[p.material]) {
        rompe(`${eti}: la primitiva ${ip} della mesh ${m.name ?? im} punta al materiale ` +
              `${p.material}, che non esiste (ce ne sono ${materiali.length})`)
      }
    }
  }

  // ogni riferimento a texture, comprese quelle dentro le estensioni
  const riferimenti = []
  const scava = (o, dove) => {
    if (!o || typeof o !== 'object') return
    for (const [k, v] of Object.entries(o)) {
      if (v && typeof v === 'object' && /Texture$/.test(k) && typeof v.index === 'number') {
        riferimenti.push({ indice: v.index, dove: `${dove}/${k}` })
      } else if (v && typeof v === 'object') scava(v, `${dove}/${k}`)
    }
  }
  materiali.forEach((m, i) => scava(m, `materiale ${m.name ?? i}`))

  for (const r of riferimenti) {
    const t = json.textures?.[r.indice]
    if (!t) {
      rompe(`${eti}: ${r.dove} punta alla texture ${r.indice}, che non esiste`)
      continue
    }
    const sorgente = t.source ?? t.extensions?.EXT_texture_webp?.source
    if (sorgente === undefined) {
      rompe(`${eti}: ${r.dove} usa una texture senza immagine sorgente: non si caricherà`)
      continue
    }
    const img = json.images?.[sorgente]
    if (!img) {
      rompe(`${eti}: ${r.dove} punta all'immagine ${sorgente}, che non esiste`)
      continue
    }
    let byte = null
    if (img.uri && !img.uri.startsWith('data:')) {
      const p = join(dirname(file), decodeURIComponent(img.uri))
      if (!existsSync(p)) {
        rompe(`${eti}: ${r.dove} carica \`${img.uri}\`, che sul disco non c'è`)
        continue
      }
      byte = new Uint8Array(readFileSync(p).subarray(0, 16))
    } else if (img.uri) {
      byte = new Uint8Array(Buffer.from(img.uri.slice(img.uri.indexOf(',') + 1), 'base64').subarray(0, 16))
    } else if (img.bufferView !== undefined) {
      const bv = json.bufferViews?.[img.bufferView]
      if (!bv) {
        rompe(`${eti}: ${r.dove} punta al bufferView ${img.bufferView}, che non esiste`)
        continue
      }
      const off = bv.byteOffset ?? 0
      if (off + bv.byteLength > bin.length || bv.byteLength === 0) {
        rompe(`${eti}: ${r.dove} sta in un bufferView vuoto o fuori dai dati del file`)
        continue
      }
      byte = bin.subarray(off, off + 16)
    } else {
      rompe(`${eti}: ${r.dove} è un'immagine senza \`uri\` e senza \`bufferView\`: dichiarata e assente`)
      continue
    }
    const firma = FIRME.find(f => f.byte.every((b, i) => byte[i] === b))
    if (!firma) {
      rompe(`${eti}: ${r.dove} non comincia con nessuna firma di immagine nota ` +
            `(primi byte ${[...byte.subarray(0, 4)].map(b => b.toString(16).padStart(2, '0')).join(' ')}): ` +
            'i byte ci sono ma non sono un\'immagine caricabile')
    }
  }

  dice(`MATERIALI ${eti}: ${materiali.length} materiali, ${primitive} primitive, ` +
       `${riferimenti.length} riferimenti a texture, ${(json.images ?? []).length} immagini`)
  return new Set(materiali.map(m => m.name).filter(Boolean))
}

/** I nomi che il sito si aspetta di trovare, e che oggi nessuno verifica. */
function lavorazioniSenzaMateriale (nomiVisti) {
  if (!existsSync(SORGENTE_MATERIA)) {
    rompe(`non trovo ${SORGENTE_MATERIA}: non posso confrontare le lavorazioni coi materiali`)
    return
  }
  const sorgente = readFileSync(SORGENTE_MATERIA, 'utf8')
  const blocco = sorgente.match(/export const LAVORAZIONI\s*=\s*\{([\s\S]*?)\n\}/)
  if (!blocco) {
    rompe(`in ${basename(SORGENTE_MATERIA)} non trovo più \`export const LAVORAZIONI = {\`: ` +
          'se è stato rinominato, questo controllo va aggiornato invece che perso')
    return
  }
  const chiavi = [...blocco[1].matchAll(/^\s*([A-Za-z_$][\w$]*)\s*:/gm)].map(m => m[1])

  /**
   * ─── NON TUTTI I MATERIALI ARRIVANO DA UN GLB
   *
   * Questo controllo assumeva che ogni lavorazione si applicasse a un
   * materiale del modello, e per mesi e' stato vero: le lavorazioni erano
   * collegate ai soli pezzi del meccanismo, che vengono da Blender.
   *
   * Da quando la NAVE ha una sua materia non lo e' piu': lo scafo e la coperta
   * sono costruiti in codice in `materiali.js`, e per loro «nessun modello ha
   * un materiale con quel nome» e' la risposta giusta, non un difetto.
   *
   * Il controllo NON si allenta: si allarga la domanda. Una lavorazione deve
   * corrispondere a un materiale che esiste DA QUALCHE PARTE -- in un GLB
   * oppure fra le chiavi di `materiali` in `materiali.js`. Una chiave che non
   * si trova in nessuno dei due posti resta un errore, ed e' il caso che
   * questo cancello e' nato per prendere: una ricetta scritta per un materiale
   * che non esiste, che non rompe niente e lascia la superficie uniforme.
   */
  const SORGENTE_MATERIALI = join(dirname(SORGENTE_MATERIA), 'materiali.js')
  const inCodice = new Set()
  try {
    const src = readFileSync(SORGENTE_MATERIALI, 'utf8')
    const b2 = src.match(/const materiali\s*=\s*\{([\s\S]*?)\n\}/)
    if (b2) for (const m of b2[1].matchAll(/^\s*([A-Za-z_$][\w$]*)\s*:/gm)) inCodice.add(m[1])
  } catch { /* se non c'e', restano solo i modelli */ }

  const orfane = chiavi.filter(k => !nomiVisti.has(k) && !inCodice.has(k))
  const daCodice = chiavi.filter(k => !nomiVisti.has(k) && inCodice.has(k))
  dice(`LAVORAZIONI ${chiavi.length} dichiarate in materia.js, ` +
       `${chiavi.filter(k => nomiVisti.has(k)).length} trovate nei modelli` +
       (daCodice.length ? `, ${daCodice.length} su materiali costruiti in codice (${daCodice.join(', ')})` : ''))
  if (orfane.length) {
    rompe(`le lavorazioni ${orfane.join(', ')} si applicano per NOME di materiale, e quel nome ` +
          'non esiste ne fra i materiali dei modelli ne fra quelli costruiti in codice in ' +
          '`materiali.js`: non verranno mai applicate. §7 mette la ' +
          'variazione di rugosità in cima alle regole di resa, e questa è la via silenziosa ' +
          'per perderla — nessun errore, solo una superficie uniforme.')
  }
}

// ─── giro ─────────────────────────────────────────────────────────────────
await MeshoptDecoder.ready

if (!MODELLI.length) {
  console.error(`nessun .glb in ${CARTELLA_MODELLI}`)
  process.exit(1)
}

const nomiMateriali = new Set()

for (const file of MODELLI) {
  console.log(risolviPercorso(file))
  let aperto
  try {
    aperto = apri(file)
  } catch (e) {
    rompe(`${basename(file)}: ${e.message}`)
    continue
  }
  dice(`FILE      ${basename(file)}  ${Math.round(statSync(file).size / 1024)} KB, ` +
       `${(aperto.json.nodes ?? []).length} nodi`)

  // il file com'è: struttura, header, estensioni
  await passaAlValidatore('come sta sul disco', aperto.buf, file)

  // e il file con i dati in chiaro, perché il validatore non sa leggere meshopt
  let chiaro = aperto
  const compresso = aperto.json.extensionsRequired?.includes('EXT_meshopt_compression')
  if (compresso) {
    try {
      chiaro = decomprimi(aperto.json, aperto.bin, file)
      await passaAlValidatore('meshopt decompresso', chiaro.buf, file)
    } catch (e) {
      rompe(`${basename(file)}: la decompressione meshopt è fallita (${e.message ?? e}), ` +
            'quindi il validatore Khronos NON ha guardato un solo byte di geometria: ' +
            'il verde su questo file non varrebbe niente.')
      chiaro = aperto
    }
  }

  nomiDuplicati(aperto.json, file)
  for (const n of materialiETexture(chiaro.json, chiaro.bin, file)) nomiMateriali.add(n)

  // le domande che valgono per l'IMPIANTO e per nessun altro modello
  if ((aperto.json.nodes ?? []).some(n => n.name === 'IMPIANTO')) {
    scalaRadice(aperto.json, file)
    pivotSolidali(aperto.json, file)
  }
}

lavorazioniSenzaMateriale(nomiMateriali)

// ─── esito ────────────────────────────────────────────────────────────────
for (const n of note) console.log('  ' + n)
if (guasti.length) {
  console.error('\nCOLLAUDO GLTF FALLITO')
  for (const g of guasti) console.error('  · ' + g)
  process.exit(1)
}
console.log('\ncollaudo gltf: passato')
