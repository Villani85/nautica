/**
 * PARLARE NON E' PUNTELLARSI, e un contapixel non distingue le due cose.
 *
 *     node strumenti/agitazione.mjs <clip.mp4> <maschera.png>
 *
 * ─── L'ERRORE CHE QUESTO STRUMENTO RIPARA
 *
 * Per decidere se un girato del salone mostra due stati umani -- comodi e
 * irrigiditi -- avevo misurato quanto cambia l'immagine da un fotogramma al
 * successivo dentro la stanza. Ne usciva 16,3 / 16,3 / 13,4 su tre tratti, e
 * ho concluso che i due stati non c'erano.
 *
 * La conclusione era sbagliata e il committente l'ha corretta: **quel
 * movimento e' parlare.** Due persone che conversano muovono moltissimi pixel
 * -- mani, bocca, testa -- e restano ferme sul divano. Due persone che si
 * puntellano contro un'onda muovono MENO pixel e spostano tutto il corpo.
 *
 * Un numero giusto che risponde a un'altra domanda: e' il difetto piu'
 * frequente di questo repo, e stavolta l'ho fatto su un giudizio che stava per
 * scartare un girato buono.
 *
 * ─── COSA MISURA INVECE
 *
 * Il BARICENTRO di cio' che si muove, e quanto si sposta lentamente.
 *
 *   · parlare      = tanti pixel che cambiano, baricentro fermo
 *   · puntellarsi  = meno pixel, ma il baricentro va e viene
 *
 * Il baricentro si calcola sui pixel che differiscono dal fondo (la mediana
 * temporale, che e' la stanza vuota), e poi si guarda la sua escursione dopo
 * un lisciamento di circa un secondo: cosi' il tremolio del parlato si media
 * via e resta l'oscillazione del corpo.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [clip, maschera] = process.argv.slice(2)
if (!clip) { console.error('  uso: agitazione.mjs <clip.mp4> [maschera.png]'); process.exit(2) }

const FPS = 8
const W = 320, H = 180
const g = join(tmpdir(), 'ag-' + Date.now() + '.gray')
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', clip, '-vf', `fps=${FPS},scale=${W}:${H}`,
  '-f', 'rawvideo', '-pix_fmt', 'gray', g])
const d = readFileSync(g); unlinkSync(g)
const N = Math.floor(d.length / (W * H))

let dentroStanza = null
if (maschera) {
  const m = execFileSync('ffmpeg', ['-v', 'error', '-i', maschera, '-vf', `scale=${W}:${H}`,
    '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1e9 })
  dentroStanza = (p) => m[p] >= 128      // bianco = stanza
}

/* il fondo e' la mediana nel tempo: la stanza senza le persone */
const fondo = new Uint8Array(W * H)
{
  const col = new Uint8Array(N)
  for (let p = 0; p < W * H; p++) {
    for (let k = 0; k < N; k++) col[k] = d[k * W * H + p]
    const o = [...col].sort((a, b) => a - b)
    fondo[p] = o[N >> 1]
  }
}

const cx = [], cy = [], quanti = []
for (let k = 0; k < N; k++) {
  const f = d.subarray(k * W * H, (k + 1) * W * H)
  let sx = 0, sy = 0, s = 0
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x
      if (dentroStanza && !dentroStanza(p)) continue
      const v = Math.abs(f[p] - fondo[p])
      if (v < 14) continue
      sx += x * v; sy += y * v; s += v
    }
  }
  cx.push(s ? sx / s : NaN); cy.push(s ? sy / s : NaN); quanti.push(s / (W * H))
}

/** lisciamento su circa un secondo: il parlato si media via, il corpo no */
const liscia = (a) => a.map((_, i) => {
  const da = Math.max(0, i - FPS >> 1), a2 = Math.min(a.length, i + (FPS >> 1) + 1)
  let s = 0, n = 0
  for (let j = da; j < a2; j++) if (!Number.isNaN(a[j])) { s += a[j]; n++ }
  return n ? s / n : NaN
})
const sc = liscia(cx), sy2 = liscia(cy)
const dev = (a) => {
  const v = a.filter(x => !Number.isNaN(x))
  const m = v.reduce((s, x) => s + x, 0) / v.length
  return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / v.length)
}
const media = (a) => a.reduce((s, x) => s + x, 0) / a.length

console.log(`\n  ${clip.split(/[\/]/).pop()}   ${N} campioni a ${FPS} al secondo`)
console.log(`  quanto si muove (pixel che cambiano): ${media(quanti).toFixed(2)}`)
console.log(`  BARICENTRO del corpo, escursione lenta:  x ${dev(sc).toFixed(2)} px   y ${dev(sy2).toFixed(2)} px`)
console.log('  (su 320x180. Parlare tiene il baricentro sotto ~1 px; puntellarsi lo sposta)')

/* e per decina di secondi, per vedere se ci sono tratti diversi */
const passo = FPS * 10
for (let i = 0; i < N; i += passo) {
  const a = sc.slice(i, i + passo), b = sy2.slice(i, i + passo)
  if (a.length < FPS * 3) break
  console.log(`    s ${String(i / FPS).padStart(2)}-${String(Math.min((i + passo) / FPS, N / FPS)).padStart(2)}:  ` +
              `baricentro x ${dev(a).toFixed(2)}  y ${dev(b).toFixed(2)}   pixel ${media(quanti.slice(i, i + passo)).toFixed(2)}`)
}
