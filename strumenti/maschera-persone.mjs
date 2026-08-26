import { execFileSync } from 'node:child_process'
import { readFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * RICAVA IL RITAGLIO DELLE PERSONE, confrontando la posa calma con quella tesa.
 *
 *     node strumenti/maschera-persone.mjs <calma.mp4|calma.jpg> <tesa.jpg> <uscita.png>
 *
 * PERCHE' SERVE, ed e' un difetto che ha visto il committente prima di me.
 *
 * Le due pose sono generate una dall'altra, quindi in teoria differiscono solo
 * per le persone. **In pratica no.** Oltre alle due figure cambiano i cuscini e
 * il bordo del tavolo: il modello non ricopia, rigenera, e cio' che rigenera non
 * torna mai identico. Dissolvendo le due immagini INTERE i mobili si
 * trasformavano — *«i cuscini sono diversi»*. Non era un difetto della
 * dissolvenza: si stava dissolvendo troppo.
 *
 * Quindi la stanza viene sempre dalla posa calma, e solo le persone si
 * scambiano. Questo file dice DOVE sono le persone.
 *
 * ─── LA PRIMA VERSIONE ERA UN BOZZOLO, E IL MOTIVO NON ESISTE PIU'
 *
 * Con due fotografie FERME il confronto ha un punto cieco severo: dove la
 * camicia bianca della donna sta sul divano crema, la differenza e' di pochi
 * punti — sotto qualunque soglia che non raccolga anche il rumore di
 * rigenerazione di tutta la stanza. **Un ritaglio basato sulla differenza
 * fallisce proprio dove chiaro sta su chiaro**, che nel salone di uno yacht e'
 * quasi ovunque, e restava un buco dentro la sagoma della persona attraverso
 * cui la si vedeva ancora.
 *
 * Per turare quei buchi dilatavo di 46 pixel e sfumavo di 14. Funzionava, e
 * copriva il **20,7%** dell'immagine: un bozzolo che invadeva braccioli,
 * pavimento e tavolo, e li congelava. Il committente l'ha visto: «poco precisa».
 *
 * Adesso la posa calma e' un FILMATO. Le stesse persone nello stesso posto, ma
 * per nove secondi: quei pixel ciechi cambiano nel tempo. Campionando il
 * filmato invece di guardare un fotogramma solo, la differenza li vede.
 *
 * ─── SOGLIA DOPPIA, non una
 *
 * Una soglia sola costringe a scegliere fra due mali: alta perde la camicia
 * chiara, bassa raccoglie il rumore di mezza stanza. Due soglie non scelgono:
 *
 *   ALTA   dove la differenza e' fuori discussione — capelli, maglione scuro,
 *          pantaloni. Sono i semi;
 *   BASSA  dove la differenza c'e' ma e' debole. Si tiene **solo se e'
 *          attaccata a un seme**.
 *
 * E' la stessa idea del rilevatore di bordi di Canny, e qui vale per la stessa
 * ragione: un pixel debole in mezzo al nulla e' rumore, un pixel debole
 * attaccato a una spalla e' la manica. Il ritaglio segue la sagoma invece di
 * inscatolarla, la dilatazione torna a fare solo il bordo morbido, e la stanza
 * congelata si riduce a quello che c'e' davvero sotto una persona.
 */

const [calmaFile, tesaFile, uscita, movimentoFile] = process.argv.slice(2)
if (!calmaFile || !tesaFile || !uscita) {
  console.error('  uso: node strumenti/maschera-persone.mjs <calma.jpg> <tesa.jpg> <uscita.png> [movimento.mp4]')
  process.exit(2)
}

const misura = (f) => execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', f]).toString().trim().split('x').map(Number)
const durata = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries',
  'format=duration', '-of', 'csv=p=0', f]).toString().trim())

const [W, H] = misura(tesaFile)

/**
 * DAL FILMATO SI PRENDONO PIU' FOTOGRAMMI, e la differenza si tiene al MASSIMO
 * su tutti. Se una persona in un istante copre un pixel e in un altro no, quel
 * pixel appartiene comunque alla regione: il ritaglio deve coprire l'UNIONE di
 * tutte le posizioni che il corpo assume, altrimenti la posa tesa non riesce a
 * cancellare quella calma nei fotogrammi in cui si e' spostata.
 */
const CAMPIONI = 16

function fotogrammi (f) {
  const [w, h] = misura(f)
  const filmato = /\.(mp4|mov|webm|mkv)$/i.test(f)
  const o = join(tmpdir(), 'mp-' + Math.abs(f.length * 7919) + '-' + Date.now() + '.rgb')
  const args = ['-loglevel', 'error', '-i', f]
  if (filmato) {
    const passo = Math.max(1, Math.round(durata(f) * 24 / CAMPIONI))
    args.push('-vf', `select=not(mod(n\\,${passo})),scale=${W}:${H}`, '-vsync', '0')
  } else {
    args.push('-vf', `scale=${W}:${H}`, '-frames:v', '1')
  }
  args.push('-f', 'rawvideo', '-pix_fmt', 'rgb24', '-y', o)
  execFileSync('ffmpeg', args)
  const d = readFileSync(o); unlinkSync(o)
  if (w !== W || h !== H) console.log(`  (${f.split(/[\\/]/).pop()} era ${w}x${h}, riscalato a ${W}x${H})`)
  return { d, n: Math.floor(d.length / (W * H * 3)) }
}

const calma = fotogrammi(calmaFile)
const tesa = fotogrammi(tesaFile)
console.log(`  posa calma: ${calma.n} fotogrammi · posa tesa: ${tesa.n}`)

/** La differenza massima fra un qualunque fotogramma calmo e la posa tesa. */
const diff = new Uint8Array(W * H)
for (let k = 0; k < calma.n; k++) {
  const off = k * W * H * 3
  for (let p = 0; p < W * H; p++) {
    const i = off + p * 3, j = p * 3
    const v = (Math.abs(calma.d[i] - tesa.d[j]) +
               Math.abs(calma.d[i + 1] - tesa.d[j + 1]) +
               Math.abs(calma.d[i + 2] - tesa.d[j + 2])) / 3
    if (v > diff[p]) diff[p] = Math.min(255, v)
  }
}

/**
 * ─── E SI UNISCE DOVE IL FILMATO SI MUOVE, che e' una regione diversa
 *
 * Il ritaglio dalle due fotografie copre dove le due POSE differiscono. Basta
 * finche' la posa calma e' una fotografia. Con un filmato non basta piu': le
 * persone respirano e gesticolano, e quel movimento esce dal ritaglio. A schermo
 * si vedeva **un filo scuro ondulato sulla spalliera**, dietro la spalla
 * dell uomo: era il suo braccio calmo, che nel filmato si sposta di qualche
 * pixel e spunta da sotto il bordo.
 *
 * Il primo tentativo e' stato costruire tutto il ritaglio dal filmato contro la
 * posa tesa, e ha prodotto una maschera che seguiva **i montanti dei finestrini
 * e il bordo del tavolo** invece dei corpi: filmato e posa tesa sono due
 * generazioni diverse e non combaciano — nella fascia dei vetri c e l 1,5% di
 * scala di scarto — e qualche pixel di disallineamento su un montante nero
 * contro un vetro chiaro da' una differenza enorme, mentre una persona chiara su
 * un divano chiaro ne da' una piccola. I semi finivano sull arredamento.
 *
 * Il filmato pero' e' generato DALLA posa calma, e con quella combacia: il 90°
 * percentile della differenza e' 9 contro 23. Quindi le due domande si fanno
 * separatamente e si uniscono i risultati:
 *
 *   dove le due POSE differiscono      →  calma.jpg contro tesa.jpg
 *   dove il FILMATO si muove           →  ogni fotogramma contro IL PRIMO
 *                                         FOTOGRAMMA DELLO STESSO FILMATO
 *
 * Il secondo confronto e' interno: stessa sorgente, stessa codifica, stesso
 * ricampionamento, quindi **nessun disallineamento possibile per costruzione**.
 * Confrontarlo con calma.jpg sembrava innocuo — sono parenti stretti, il 90°
 * percentile della differenza e' 9 contro 23 — e invece i montanti tornavano
 * nella maschera lo stesso: il filmato e' 1024x576 riscalato a 1280x714, e il
 * ricampionamento sposta di una frazione di pixel proprio i bordi ad altissimo
 * contrasto. Un quarto di pixel su un montante nero contro un vetro chiaro vale
 * piu' di una persona intera.
 */
if (movimentoFile) {
  const mov = fotogrammi(movimentoFile)
  const base = mov.d   // il PRIMO FOTOGRAMMA DEL FILMATO, non la fotografia
  for (let k = 1; k < mov.n; k++) {
    const off = k * W * H * 3
    for (let p = 0; p < W * H; p++) {
      const i = off + p * 3, j = p * 3
      const v = (Math.abs(mov.d[i] - base[j]) +
                 Math.abs(mov.d[i + 1] - base[j + 1]) +
                 Math.abs(mov.d[i + 2] - base[j + 2])) / 3
      if (v > diff[p]) diff[p] = Math.min(255, v)
    }
  }
  console.log(`  movimento: ${mov.n} fotogrammi confrontati col primo`)
}

const ALTA = 40         // differenza fuori discussione: sono i semi
const BASSA = 14        // differenza debole: si tiene solo se attaccata a un seme
const PROFONDITA = 40   // e solo entro questa distanza dal seme
const SEME = 400        // px: un seme piu' piccolo di cosi non e un corpo
const MINIMA = 1200     // px: la regione finita deve valere almeno questo

/**
 * ─── E LA CRESCITA HA UN LIMITE DI DISTANZA, che la prima stesura non aveva
 *
 * Senza limite la crescita e dilagata: una regione sola da **175.842 px**, il
 * 19% dell immagine, e la maschera finita copriva il 28,4% — peggio del bozzolo
 * che doveva sostituire. Non era un offset globale fra filmato e fotografia: la
 * mediana della differenza e **3**, la stanza combacia benissimo. Era che il
 * 16% di pixel sopra la soglia bassa — rumore di compressione lungo tutti i
 * bordi dell arredamento — forma una **ragnatela connessa**, e la crescita ci
 * cammina sopra da una persona all altra attraversando tutta la stanza.
 *
 * Alzare la soglia bassa non risolve: a 30 resta il 7,6% dei pixel, comparabile
 * con le persone stesse, e la ragnatela regge lo stesso. Quello che distingue
 * un pixel debole utile da uno inutile non e quanto e forte, e **quanto e
 * lontano dal seme**: la camicia chiara sul divano crema sta dentro la sagoma
 * di una persona, quindi a poche decine di pixel dai capelli o dai pantaloni.
 * Il rumore che collega due divani no.
 */
const distanza = new Int16Array(W * H).fill(-1)
const coda = new Int32Array(W * H)
const dentro = new Uint8Array(W * H)

/** Prima i semi: le macchie forti, e solo quelle di taglia credibile. */
const visto = new Uint8Array(W * H)
const semi = []
for (let s = 0; s < W * H; s++) {
  if (diff[s] <= ALTA || visto[s]) continue
  let testa = 0, fine = 0
  const gruppo = []
  coda[fine++] = s; visto[s] = 1
  while (testa < fine) {
    const q = coda[testa++]; gruppo.push(q)
    const qx = q % W, qy = (q / W) | 0
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = qx + dx, ny = qy + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const r = ny * W + nx
      if (!visto[r] && diff[r] > ALTA) { visto[r] = 1; coda[fine++] = r }
    }
  }
  if (gruppo.length >= SEME) semi.push(gruppo)
}
if (!semi.length) {
  console.error(`  ROTTO  nessun seme sopra ${SEME} px: le due pose sono troppo simili, o ALTA e troppo alta.`)
  process.exit(1)
}
console.log(`  ${semi.length} semi sopra ${SEME} px: ${semi.map(g => g.length).sort((a, b) => b - a).slice(0, 6).join(", ")}`)

/** Poi la crescita, in ampiezza, con la distanza che si porta dietro. */
let testa = 0, fine = 0
for (const g of semi) for (const p of g) { distanza[p] = 0; dentro[p] = 1; coda[fine++] = p }
while (testa < fine) {
  const q = coda[testa++]
  if (distanza[q] >= PROFONDITA) continue
  const qx = q % W, qy = (q / W) | 0
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = qx + dx, ny = qy + dy
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
    const r = ny * W + nx
    if (dentro[r] || diff[r] <= BASSA) continue
    dentro[r] = 1; distanza[r] = distanza[q] + 1; coda[fine++] = r
  }
}

/** Infine si buttano le regioni finite piccole. */
const buone = new Uint8Array(W * H)
const marca = new Uint8Array(W * H)
let quante = 0
for (let s = 0; s < W * H; s++) {
  if (!dentro[s] || marca[s]) continue
  let t2 = 0, f2 = 0
  const gruppo = []
  coda[f2++] = s; marca[s] = 1
  while (t2 < f2) {
    const q = coda[t2++]; gruppo.push(q)
    const qx = q % W, qy = (q / W) | 0
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = qx + dx, ny = qy + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const r = ny * W + nx
      if (!marca[r] && dentro[r]) { marca[r] = 1; coda[f2++] = r }
    }
  }
  if (gruppo.length >= MINIMA) { for (const p of gruppo) buone[p] = 1; quante++ }
}
console.log(`  ${quante} regioni tenute sopra ${MINIMA} px`)

const sfoca = (src, r) => {
  const t = new Float32Array(W * H), o = new Float32Array(W * H)
  for (let y = 0; y < H; y++) {
    let s = 0
    for (let x = 0; x < W + r; x++) {
      if (x < W) s += src[y * W + x]
      if (x >= r * 2 + 1) s -= src[y * W + x - r * 2 - 1]
      if (x >= r) o[y * W + x - r] = s / (r * 2 + 1)
    }
  }
  for (let x = 0; x < W; x++) {
    let s = 0
    for (let y = 0; y < H + r; y++) {
      if (y < H) s += o[y * W + x]
      if (y >= r * 2 + 1) s -= o[(y - r * 2 - 1) * W + x]
      if (y >= r) t[(y - r) * W + x] = s / (r * 2 + 1)
    }
  }
  return t
}

/**
 * DILATAZIONE MEDIA, BORDO MORBIDO PICCOLO — ed e' il contrario di quello che
 * viene istintivo.
 *
 * Prima erano 46 e 14, e servivano a scavalcare i buchi che la differenza non
 * vedeva. Quei buchi non ci sono piu', ma 5 e 4 hanno prodotto un difetto
 * nuovo che il committente ha visto subito: **un alone chiaro attorno ai
 * volti**. Il bordo morbido passava DENTRO la faccia, e li' mescolava due
 * facce diverse — quella della posa tesa e quella del filmato.
 *
 * Un bordo morbido e' la cosa giusta quando le due sorgenti sotto sono uguali,
 * perche' nasconde il taglio. Dove sono diverse non lo nasconde: lo spalma. E
 * su un volto lo spalmato si legge come un fantasma.
 *
 * Quindi il contorno si allarga fino a inglobare le teste — cosi' il bordo cade
 * sul divano, dove le due sorgenti coincidono — e la sfumatura resta stretta,
 * perche' li' non ha piu' niente da nascondere.
 *
 * La pelle non si puo' riconoscere per colore, provato: R-B fa 48-70 sui volti
 * e 45-47 su divano e pavimento. Un punto di margine non e' un discriminante.
 */
const CRESCITA = 14
const MORBIDO = 0
const f = new Float32Array(W * H)
for (let p = 0; p < W * H; p++) f[p] = buone[p]
const largo = sfoca(f, CRESCITA)
const pieno = new Float32Array(W * H)
for (let p = 0; p < W * H; p++) pieno[p] = largo[p] > 0.12 ? 1 : 0
const morbido = MORBIDO ? sfoca(pieno, MORBIDO) : pieno

const fuori = Buffer.alloc(W * H)
let area = 0
for (let p = 0; p < W * H; p++) {
  const v = Math.max(0, Math.min(1, morbido[p]))
  fuori[p] = Math.round(v * 255)
  area += v
}
console.log(`  la maschera copre il ${(100 * area / (W * H)).toFixed(1)}% dell'immagine`)

/**
 * SI SCRIVE ANCHE IL COMPLEMENTO, e serve al terzo strato: la stanza FUORI
 * dalla regione delle persone, che non si dissolve mai. Lo si genera qui invece
 * che nel CSS perche' `mask-composite: subtract` ha sintassi diversa fra
 * standard e prefisso webkit — un file da pochi KB costa meno di un ramo che
 * funziona su un motore solo.
 */
const scrivi = (dati, dove) => {
  execFileSync('ffmpeg', ['-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'gray',
    '-s', `${W}x${H}`, '-i', 'pipe:0', '-y', dove], { input: dati })
  console.log(`  scritta ${dove}`)
}
scrivi(fuori, uscita)

const complemento = Buffer.alloc(W * H)
for (let p = 0; p < W * H; p++) complemento[p] = 255 - fuori[p]
scrivi(complemento, uscita.replace(/\.png$/, '-fuori.png'))
