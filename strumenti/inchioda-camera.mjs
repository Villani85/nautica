import { execFileSync } from 'node:child_process'
import { readFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * TOGLIE LA CARRELLATA DA UN FILMATO, misurandola.
 *
 *     node strumenti/inchioda-camera.mjs <dentro.mp4> <fuori.mp4>
 *
 * ─── PERCHE' ESISTE
 *
 * I modelli generativi muovono la camera anche quando gli si dice di non farlo:
 * su cinque clip chieste esplicitamente ferme, tre hanno carrellato. E la
 * carrellata e' l'unico difetto che il capitolo non tollera, perche' la maschera
 * del finestrone e' fissa: se la stanza cresce, il vetro esce da sotto il suo
 * buco.
 *
 * `vidstab` non serve — corregge traslazione e rotazione, **non la scala**,
 * provato. Ma `collaudo-filmato.mjs` la scala la misura gia', fotogramma per
 * fotogramma, con la stessa tecnica dei due bordi. **Quello che si misura si
 * puo' togliere.**
 *
 * ─── NON INVENTA NIENTE, E QUESTO DECIDE IL VERSO
 *
 * Se la camera si e' avvicinata, riportare l'ultimo fotogramma al primo
 * vorrebbe dire allargare il campo: servirebbero pixel che non esistono, e un
 * generatore li inventerebbe. Quindi si fa il contrario — si porta ogni
 * fotogramma alla scala PIU' STRETTA della clip, cioe' si stringe l'inizio
 * invece di allargare la fine.
 *
 * Costa un po' di campo visivo, e in cambio ogni pixel del risultato e' un pixel
 * girato davvero. In un capitolo che si chiama «measured, not declared» e' il
 * baratto giusto.
 *
 * ─── PERCHE' UNA RETTA E NON I VALORI GREZZI
 *
 * La misura per fotogramma ha rumore di frazioni di pixel. Applicandola cosi'
 * com'e' si toglierebbe la carrellata e si aggiungerebbe un tremolio. La
 * carrellata di un generatore e' lenta e monotona, quindi si adatta una retta e
 * si applica quella: il difetto sparisce, il rumore no — perche' non c'era.
 */

const [dentro, fuori] = process.argv.slice(2)
if (!dentro || !fuori) {
  console.error('  uso: node strumenti/inchioda-camera.mjs <dentro.mp4> <fuori.mp4>')
  process.exit(2)
}

const W = 1280, H = 720
const grezzo = join(tmpdir(), 'ic-' + Date.now() + '.gray')
execFileSync('ffmpeg', ['-loglevel', 'error', '-i', dentro, '-vf', `scale=${W}:${H}`,
  '-f', 'rawvideo', '-pix_fmt', 'gray', '-y', grezzo])
const d = readFileSync(grezzo)
unlinkSync(grezzo)
const N = Math.floor(d.length / (W * H))
const fotogramma = (n) => d.subarray(n * W * H, (n + 1) * W * H)

function gradiente (g, xa, xb) {
  const p = new Float64Array(H)
  for (let y = 0; y < H; y++) {
    let s = 0
    for (let x = xa; x < xb; x++) s += g[y * W + x]
    p[y] = s / (xb - xa)
  }
  const q = new Float64Array(H)
  for (let y = 2; y < H - 2; y++) q[y] = (p[y + 2] + p[y + 1]) / 2 - (p[y - 1] + p[y - 2]) / 2
  return q
}
function bordo (q, y0, raggio) {
  const da = Math.max(3, y0 - raggio), a2 = Math.min(H - 3, y0 + raggio)
  let best = 0, dove = -1
  for (let y = da; y < a2; y++) if (Math.abs(q[y]) > best) { best = Math.abs(q[y]); dove = y }
  if (dove < 0 || dove <= da + 1 || dove >= a2 - 2) return null
  const a = Math.abs(q[dove - 1]), b = Math.abs(q[dove]), c = Math.abs(q[dove + 1])
  const den = a - 2 * b + c
  return dove + (den ? Math.max(-1, Math.min(1, 0.5 * (a - c) / den)) : 0)
}

/**
 * ─── L'AGITAZIONE SI MISURA FRA FOTOGRAMMI VICINI, e la prima stesura li
 * prendeva lontani.
 *
 * La regola e' giusta — la camera si misura su cio' che non si muove da solo —
 * ma il confronto era sulla scala di tempo sbagliata. Una carrellata e' LENTA:
 * su dieci secondi sposta l'interno piu' di quanto il mare sposti se stesso, e
 * il conto sceglieva la meta' del MARE, prendendo l'orizzonte come riferimento
 * di camera. Su una clip con carrellata forte l'ho visto stampare 15,8% di
 * scala dopo la correzione, cioe' peggio di prima.
 *
 * Fra fotogrammi vicini le due cose si separano da sole: il mare cambia in un
 * ventesimo di secondo, la camera no. Stessa regola, scala di tempo giusta.
 */
function agitazione (xa, xb) {
  let s = 0, n = 0
  const passo = Math.max(1, Math.round(N / 40))
  for (let k = passo; k < N; k += passo) {
    const a = fotogramma(k - passo), b = fotogramma(k)
    for (let y = 0; y < H; y += 3) for (let x = xa; x < xb; x += 3) { s += Math.abs(a[y * W + x] - b[y * W + x]); n++ }
  }
  return s / n
}
const sx = agitazione(0, W / 2), dx = agitazione(W / 2, W)
const [XA, XB] = sx <= dx ? [0, W / 2] : [W / 2, W]
console.log(`  agitazione: sinistra ${sx.toFixed(1)} · destra ${dx.toFixed(1)} → misuro sulla ${XA === 0 ? 'SINISTRA' : 'DESTRA'}`)

/** I due bordi piu' stabili nel tempo, non i piu' forti del primo fotogramma. */
const stabile = new Float64Array(H).fill(Infinity)
for (let k = 0; k < 8; k++) {
  const q = gradiente(fotogramma(Math.floor(k * (N - 1) / 7)), XA, XB)
  for (let y = 0; y < H; y++) stabile[y] = Math.min(stabile[y], Math.abs(q[y]))
}
const cand = []
for (let y = 20; y < H - 20; y++) cand.push({ y, f: stabile[y] })
cand.sort((a, b) => b.f - a.f)
const p1 = cand[0]
const p2 = cand.find(c => Math.abs(c.y - p1.y) > H * 0.2)
if (!p2) { console.error('  ROTTO  non trovo due bordi stabili abbastanza distanti.'); process.exit(1) }
const yA = Math.min(p1.y, p2.y), yB = Math.max(p1.y, p2.y)
const base = yB - yA
console.log(`  bordi di riferimento: righe ${yA} e ${yB} (distanza ${base})`)

const RAGGIO = 34
const punti = []
for (let n = 0; n < N; n++) {
  const q = gradiente(fotogramma(n), XA, XB)
  const a = bordo(q, yA, RAGGIO), b = bordo(q, yB, RAGGIO)
  if (a === null || b === null) continue
  punti.push({ n, s: (b - a) / base, t: (a + b) / 2 - (yA + yB) / 2 })
}
if (punti.length < N * 0.6) {
  console.error(`  ROTTO  bordi persi in ${N - punti.length} fotogrammi su ${N}: non si puo' correggere cio' che non si misura.`)
  process.exit(1)
}

/** Retta ai minimi quadrati su scala e spostamento. */
const retta = (chiave) => {
  const n = punti.length
  const mx = punti.reduce((a, p) => a + p.n, 0) / n
  const my = punti.reduce((a, p) => a + p[chiave], 0) / n
  let num = 0, den = 0
  for (const p of punti) { num += (p.n - mx) * (p[chiave] - my); den += (p.n - mx) ** 2 }
  const m = den ? num / den : 0
  return { m, q: my - m * mx }
}
const rs = retta('s'), rt = retta('t')
const sMin = Math.min(rs.q, rs.q + rs.m * (N - 1))
const sMax = Math.max(rs.q, rs.q + rs.m * (N - 1))
console.log(`  scala: da ${(100 * (rs.q - 1)).toFixed(2)}% a ${(100 * (rs.q + rs.m * (N - 1) - 1)).toFixed(2)}% · escursione ${(100 * (sMax - sMin)).toFixed(2)}%`)
console.log(`  spostamento: da ${rt.q.toFixed(1)} a ${(rt.q + rt.m * (N - 1)).toFixed(1)} px`)

/**
 * ─── E SI RIFIUTA SE LA MISURA NON REGGE, che e' la parte piu' importante
 *
 * Su una clip con carrellata forte questo strumento ha PEGGIORATO due volte: da
 * 0,5% di tetto a 15,8% la prima volta e a 13,9% la seconda, con la rotazione
 * salita da 1,4 a 10,3 gradi. Non perche' il metodo sia sbagliato, ma perche'
 * su quella clip **la misura stessa era inaffidabile**: bordi persi in 94
 * fotogrammi su 240, e un adattamento che dava la scala fra -12,7% e -7,7%,
 * cioe' un intervallo che non contiene nemmeno il valore neutro.
 *
 * Una correzione costruita su una misura inaffidabile peggiora sempre, perche'
 * sposta le cose di una quantita' sbagliata invece di lasciarle dov'erano.
 * Quindi qui lo strumento si ferma e lo dice, invece di provarci: e' lo stesso
 * principio del residuo e della risolvenza nel collaudo — **un metro deve
 * dichiarare quando non sa**.
 *
 * Il residuo si giudica in pixel sulla base dei due bordi: se i punti si
 * scostano dalla retta piu' di mezzo pixel, la retta non descrive un movimento
 * di camera, descrive rumore.
 */
{
  const n = punti.length
  const mx = punti.reduce((a, p) => a + p.n, 0) / n
  let res = 0
  for (const p of punti) res += (p.s - (rs.q + rs.m * p.n)) ** 2
  const disp = Math.sqrt(res / n) * base
  const persi = N - n
  console.log(`  affidabilita': residuo ${disp.toFixed(2)} px · ${persi} fotogrammi persi su ${N}`)
  if (disp > 0.5 || persi > N * 0.15 || rs.q < 0.9 || rs.q > 1.1) {
    console.error(`
  NON CORREGGIBILE  la misura su questa clip non regge, quindi non c'e' niente
         di affidabile da togliere. Correggere su una misura incerta PEGGIORA:
         provato, e la carrellata e' salita a due cifre.

         Questa clip va rigenerata. Il prompt sta in
         riferimenti/prompt/salone-filmati.md`)
    process.exit(1)
  }
}

if (sMax - sMin < 0.002) {
  console.log('  la camera e\' gia\' ferma: niente da togliere.')
  process.exit(0)
}

/**
 * Ogni fotogramma si porta alla scala PIU' LARGA misurata — che a schermo e' la
 * piu' stretta di campo. Il ritaglio e' `sorgente * s(n)/sMax`, e poi si
 * riscala alla misura piena.
 */
const [w0, h0] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', dentro]).toString().trim().split('x').map(Number)
const k = (h0 / H)   // dalla misura a 720 alle righe vere
const fs = `(${rs.q.toFixed(8)}+${rs.m.toExponential(6)}*n)/${sMax.toFixed(8)}`
const ft = `((${rt.q.toFixed(4)}+${rt.m.toExponential(6)}*n)*${k.toFixed(4)})`
const filtro =
  `crop=w='floor(iw*${fs}/2)*2':h='floor(ih*${fs}/2)*2':` +
  `x='(iw-ow)/2':y='(ih-oh)/2-${ft}',` +
  `scale=${w0}:${h0}:flags=lanczos`
console.log(`  filtro: ritaglio da ${(100 * sMin / sMax).toFixed(1)}% a 100% del fotogramma`)

execFileSync('ffmpeg', ['-loglevel', 'error', '-i', dentro, '-vf', filtro,
  '-an', '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-y', fuori])
console.log(`  scritto ${fuori}`)
console.log('  ora ripassalo al collaudo: node strumenti/collaudo-filmato.mjs ' + fuori)
