/**
 * RICODIFICA UNA SOLA MAPPA DENTRO UN GLB.
 *
 *     node strumenti/alleggerisci-mappe.mjs <file.glb> <occlusione|normale> <qualita>
 *
 * Serve perche' l'esportatore glTF di Blender ha UNA qualita' per tutte le
 * immagini, e le due mappe non tollerano la stessa perdita:
 *
 *   - la NORMALE codifica una direzione. Un errore diventa un rilievo che non
 *     c'e', e si vede come una superficie che ondeggia.
 *   - l'OCCLUSIONE e' un termine moltiplicativo d'ombra a basso contrasto.
 *     Tollera perdita che una normale non tollera.
 *
 * Segnalato da una revisione esterna, con i numeri: nel modello spedito l'AO
 * pesava **51,7 KB contro i 33,3 della normale** -- il blocco piu' pesante di
 * tutto il file -- perche' era rimasta a qualita' piena mentre la normale era
 * gia' stata tagliata da 2048 a 512. E un webp non si ricomprime con brotli,
 * quindi ogni KB tolto qui va quasi uno a uno sul filo.
 *
 * ─── PERCHE' RISCRIVE IL BLOB INVECE DI RATTOPPARLO
 *
 * Sostituire i byte di un'immagine cambia la sua lunghezza, e tutte le viste
 * che vengono dopo hanno un offset sbagliato. Non si rattoppa: si riscrive il
 * blocco binario in ordine, ricalcolando gli offset con l'allineamento a 4
 * byte che la specifica chiede. Vale anche per le viste che non c'entrano --
 * geometria compressa compresa, che viene ricopiata identica.
 */
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [file, quale, qualita] = process.argv.slice(2)
if (!file || !quale || !qualita) {
  console.error('uso: alleggerisci-mappe.mjs <file.glb> <occlusione|normale> <qualita>')
  process.exit(2)
}

const b = readFileSync(file)
if (b.readUInt32LE(0) !== 0x46546c67) { console.error('non e un GLB'); process.exit(2) }
const lunJson = b.readUInt32LE(12)
const j = JSON.parse(b.subarray(20, 20 + lunJson).toString('utf8'))
const inizioBin = 20 + lunJson + 8
const bin = b.subarray(inizioBin, inizioBin + b.readUInt32LE(20 + lunJson))

/* Quale immagine: si arriva dal MATERIALE, non dall'ordine delle immagini.
 * L'ordine dipende dall'esportatore e cambia senza avvisare; il ruolo no. */
/**
 * --- NON SI TOCCA UN FILE GIA' COMPRESSO CON MESHOPT
 *
 * In un glTF meshopt i dati veri di una vista NON stanno all'offset della
 * vista: stanno in `extensions.EXT_meshopt_compression`, con offset e
 * lunghezza suoi. Riscrivendo il blob per gli offset delle viste si ricopia
 * altro, e il file esce piu' GRANDE invece che piu' piccolo -- misurato:
 * 247,3 KB diventavano 310,9, e 160,7 di brotli diventavano 191,1, con l'AO
 * comunque scesa da 51,7 a 30,3. Un guadagno vero dentro una perdita piu'
 * grossa, che senza questo controllo sarebbe passato per un miglioramento.
 *
 * Quindi si lavora PRIMA di gltfpack, sull'uscita di Blender, dove il file e'
 * ancora semplice. Qui ci si ferma.
 */
if ((j.extensionsUsed || []).includes('EXT_meshopt_compression')) {
  console.error('  questo GLB e gia compresso con meshopt: la ricodifica va fatta PRIMA')
  console.error('  di `comprimi-modello.mjs`, sull uscita di Blender.')
  process.exit(3)
}

const campo = quale === 'occlusione' ? 'occlusionTexture' : 'normalTexture'
const rif = (j.materials || []).map((m) => m[campo]).find(Boolean)
if (!rif) { console.error(`nessun materiale con ${campo}`); process.exit(3) }
const iImg = j.textures[rif.index].source ??
  (j.textures[rif.index].extensions?.EXT_texture_webp?.source)
if (iImg === undefined) { console.error('la texture non punta a un immagine'); process.exit(3) }
const img = j.images[iImg]
const vista = j.bufferViews[img.bufferView]
const prima = bin.subarray(vista.byteOffset, vista.byteOffset + vista.byteLength)

const est = img.mimeType === 'image/webp' ? 'webp' : 'png'
const tIn = join(tmpdir(), `mappa-in.${est}`)
const tOut = join(tmpdir(), 'mappa-out.webp')
writeFileSync(tIn, prima)
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', tIn, '-c:v', 'libwebp',
  '-quality', String(qualita), '-compression_level', '6', tOut])
const dopo = readFileSync(tOut)
unlinkSync(tIn); unlinkSync(tOut)

if (dopo.length >= prima.length) {
  console.log(`  ${quale}: a qualita ${qualita} non si guadagna niente ` +
              `(${(prima.length / 1024).toFixed(1)} -> ${(dopo.length / 1024).toFixed(1)} KB). Non tocco il file.`)
  process.exit(0)
}

/* Si riscrive il blob: viste in ordine di offset, allineate a 4. */
const ordine = j.bufferViews
  .map((v, i) => ({ v, i }))
  .sort((a, c) => (a.v.byteOffset || 0) - (c.v.byteOffset || 0))
const pezzi = []
let cursore = 0
for (const { v, i } of ordine) {
  while (cursore % 4 !== 0) { pezzi.push(Buffer.alloc(1)); cursore++ }
  const dati = i === img.bufferView
    ? dopo
    : bin.subarray(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength)
  v.byteOffset = cursore
  v.byteLength = dati.length
  pezzi.push(dati)
  cursore += dati.length
}
while (cursore % 4 !== 0) { pezzi.push(Buffer.alloc(1)); cursore++ }
const nuovoBin = Buffer.concat(pezzi)
j.buffers[0].byteLength = nuovoBin.length

const testo = Buffer.from(JSON.stringify(j), 'utf8')
const impJson = Buffer.concat([testo, Buffer.alloc((4 - testo.length % 4) % 4, 0x20)])
const testa = Buffer.alloc(12)
testa.writeUInt32LE(0x46546c67, 0); testa.writeUInt32LE(2, 4)
testa.writeUInt32LE(12 + 8 + impJson.length + 8 + nuovoBin.length, 8)
const iJ = Buffer.alloc(8); iJ.writeUInt32LE(impJson.length, 0); iJ.writeUInt32LE(0x4e4f534a, 4)
const iB = Buffer.alloc(8); iB.writeUInt32LE(nuovoBin.length, 0); iB.writeUInt32LE(0x004e4942, 4)
writeFileSync(file, Buffer.concat([testa, iJ, impJson, iB, nuovoBin]))

const zlib = await import('node:zlib')
const br = zlib.brotliCompressSync(readFileSync(file)).length
console.log(`  ${quale} a qualita ${qualita}: ${(prima.length / 1024).toFixed(1)} -> ` +
            `${(dopo.length / 1024).toFixed(1)} KB   file ${(readFileSync(file).length / 1024).toFixed(1)} KB, ` +
            `brotli ${(br / 1024).toFixed(1)} KB`)
