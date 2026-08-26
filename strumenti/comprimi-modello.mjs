/**
 * COMPRIMI-MODELLO — porta il GLB dell'impianto dal peso di autore a quello
 * di rete, e verifica che nel viaggio non si sia perso il contratto.
 *
 *     node strumenti/comprimi-modello.mjs <ingresso.glb> <uscita.glb>
 *
 * ─── PERCHE' MESHOPT E NON DRACO
 *
 * Misurato su questo modello, non scelto per fama:
 *
 *     nessuna compressione   1686 KB  +   0 KB di decodificatore
 *     Draco livello 6         236 KB  + 251 KB   (wasm + wrapper)
 *     meshopt -cc             223 KB  +  28 KB   (un modulo ES, lo impacchetta Vite)
 *
 * Draco comprime quasi uguale e si porta dietro dieci volte il decodificatore,
 * che va servito come file a parte. meshopt vince due volte: 251 KB contro 487.
 * I 44.000 triangoli restano tutti — la compressione non toglie geometria, e
 * per la GPU non erano mai stati un problema. Era solo il trasferimento.
 *
 * ─── PERCHE' QUESTO STRUMENTO VERIFICA INVECE DI LIMITARSI A COMPRIMERE
 *
 * Alla prima esecuzione gltfpack ha restituito un file piu' piccolo, valido, e
 * **senza un solo nome di nodo e senza gli extras**. Nessun errore, nessun
 * avviso: trenta nodi diventati anonimi. Nel sito sarebbe arrivato come
 * «mancano i nodi STATIC_FOUNDATION, ...» a runtime, cioe' nel posto piu'
 * lontano possibile dalla causa.
 *
 * Servono `-kn` (tiene i nodi con nome) e `-ke` (tiene gli extras). Ma
 * ricordarsi due flag non e' una garanzia: la garanzia e' che il file d'uscita
 * venga riaperto e confrontato con il contratto prima di essere accettato.
 *
 * Nota su cosa gltfpack ha comunque il diritto di fare: fonde le primitive di
 * ogni nodo in una mesh sola, appesa a un figlio anonimo `<NODO>_MESH`. La
 * gerarchia e i pivot restano, e le chiamate di disegno calano. Va bene — ma
 * significa che chi cerca la geometria di un nodo deve SCENDERE, non guardare
 * `children[0].geometry`.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'

const [ingresso, uscita] = process.argv.slice(2)
if (!ingresso || !uscita) {
  console.error('uso: node strumenti/comprimi-modello.mjs <in.glb> <out.glb>')
  process.exit(2)
}

/**
 * IL CONTRATTO SI RICAVA DALL'INGRESSO, NON SI SCRIVE QUI.
 *
 * La prima versione elencava a mano i quattordici nodi dell'impianto e i suoi
 * quattro extras. Ha funzionato finche' il solo modello era quello: al secondo
 * — la sovrastruttura — quell'elenco sarebbe diventato una bugia da aggiornare
 * a ogni modello nuovo, e chi lo dimentica non ottiene un errore, ottiene un
 * controllo che non controlla piu' niente.
 *
 * La regola giusta e' piu' semplice e piu' forte: **niente di cio' che c'era
 * puo' sparire.** Ogni nome e ogni extra del file d'ingresso deve ritrovarsi
 * identico nell'uscita. Non serve sapere a cosa servono.
 */

function apri (percorso) {
  const b = readFileSync(percorso)
  const j = JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)).toString('utf8'))
  const nodi = (j.nodes || [])
  return {
    json: j,
    nomi: new Set(nodi.map(n => n.name).filter(Boolean)),
    extras: nodi.find(n => n.extras)?.extras ?? j.scenes?.[0]?.extras ?? null
  }
}

const prima = apri(ingresso)
const NODI = [...prima.nomi]
const EXTRAS = Object.keys(prima.extras ?? {})

execFileSync('npx', ['gltfpack', '-i', ingresso, '-o', uscita, '-cc', '-kn', '-ke'],
             { stdio: 'inherit', shell: process.platform === 'win32' })

const dopo = apri(uscita)
const guasti = []

const persi = NODI.filter(n => !dopo.nomi.has(n))
if (persi.length) guasti.push(`nodi persi nella compressione: ${persi.join(', ')}`)

if (!dopo.extras) guasti.push('extras spariti del tutto: il sito non saprebbe ne\' il rapporto ne\' l\'unita\'')
else for (const k of EXTRAS) {
  if (dopo.extras[k] === undefined) guasti.push(`extra perso: ${k}`)
  else if (prima.extras && prima.extras[k] !== dopo.extras[k]) {
    guasti.push(`extra alterato: ${k} era ${prima.extras[k]}, ora ${dopo.extras[k]}`)
  }
}

const kb = p => Math.round(statSync(p).size / 1024)
console.log(`\nPESO  ${kb(ingresso)} KB  →  ${kb(uscita)} KB`)
console.log(`NODI  ${prima.nomi.size} con nome  →  ${dopo.nomi.size}`)

if (guasti.length) {
  console.error('\nCOMPRESSIONE RIFIUTATA')
  for (const g of guasti) console.error('  · ' + g)
  console.error('\nIl file compresso non e\' stato installato. Un GLB piu\' leggero')
  console.error('che ha perso il contratto costa piu\' di quanto risparmia.')
  process.exit(1)
}
console.log('CONTRATTO  intatto: nomi ed extras sopravvissuti')
