import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  creaCorsaCoperchio, profiloCorsa, velocitaProfilo
} from '../../src/scena/impianto.js'

/**
 * ═══ LA MISURA DELLA CORSA DEL COPERCHIO — docs/14 §4.2
 *
 *   node riferimenti/carter/corsa.mjs
 *   node riferimenti/carter/corsa.mjs --durata 0.95    (per tarare)
 *
 * Il §4.2 prescrive due cose che si possono misurare e una che si puo'
 * dimostrare:
 *
 *   - «`HOUSING_REMOVABLE` si separa lungo la normale del taglio in 0,9-1,2 s»
 *     -> una DURATA, in secondi, che qui viene cronometrata invece che
 *        dichiarata;
 *   - «massa e inerzia si sentono nell'easing» -> un PROFILO DI VELOCITA'
 *     asimmetrico: poca accelerazione all'inizio, arresto lungo;
 *   - «senza rimbalzo elastico» -> nessun sorpasso del valore finale, mai.
 *
 * ─── PERCHE' IN NODE E NON NEL BROWSER
 *
 * Perche' cio' che si misura qui e' una LEGGE, non un fotogramma: la funzione
 * che porta lo scorrimento alla posizione del coperchio non tocca three, non
 * carica il GLB e non disegna niente. Portarla in un browser aggiungerebbe
 * soltanto rumore — il ciclo di disegno, la scheda grafica che in headless
 * disegna in software, la pagina che scrolla mentre si misura — e nessuna di
 * quelle cose entra nella durata di una corsa.
 *
 * Il provino importa `creaCorsaCoperchio` DAL FILE DI PRODUZIONE. Non c'e' una
 * copia della legge qui dentro: una copia e' un secondo valore che un giorno
 * diverge da quello vero e continua a passare il collaudo.
 *
 * ─── COSA VUOL DIRE «DURATA», visto che un easing ha le code piatte
 *
 * Un profilo che parte da fermo e arriva da fermo si avvicina agli estremi
 * lentamente: la durata «dal primo movimento all'ultimo» e' onesta ma
 * generosa, e la 10-90% e' onesta ma stretta. Si stampano tutte e due, piu' la
 * 1-99%, e il confronto col §4.2 si fa sulla PIENA — che e' quella in cui il
 * pezzo e' effettivamente in moto: l'istante in cui il coperchio si stacca e
 * quello in cui si ferma.
 */

const QUI = dirname(fileURLToPath(import.meta.url))
const arg = (nome) => {
  const i = process.argv.indexOf(nome)
  return i > 0 ? Number(process.argv[i + 1]) : undefined
}
const OPZIONI = {}
if (arg('--durata') !== undefined) OPZIONI.durata = arg('--durata')
if (arg('--rampa') !== undefined) OPZIONI.rampa = arg('--rampa')
if (arg('--ordine') !== undefined) OPZIONI.ordine = arg('--ordine')

/** §4.2 punto 2. E' il cancello: fuori da qui il provino esce con errore. */
const MIN = 0.90
const MAX = 1.20

const n = (x, c = 3) => x.toFixed(c)
const riga = (s = '─') => console.log(s.repeat(74))

/**
 * ─── IL BANCO
 *
 * Fa girare la corsa a passo fisso e registra, per ogni fotogramma, il tempo,
 * lo scorrimento comandato e la posizione. Lo scorrimento e' una funzione del
 * tempo, cosi' si possono provare gesti veri: un flick, un ripensamento a
 * meta', un'oscillazione di rotella.
 */
function banco (scorrimentoDi, { fps = 60, secondi = 4, corsa = null } = {}) {
  const c = corsa ?? creaCorsaCoperchio(OPZIONI)
  const dt = 1 / fps
  const storia = []
  for (let i = 0; i * dt <= secondi; i++) {
    const t = i * dt
    const s = scorrimentoDi(t)
    const q = c.passo(s, i === 0 ? dt : dt)
    storia.push({ t, s, q, u: c.u, comando: c.comando })
  }
  return { storia, corsa: c }
}

/** Il tempo in cui la posizione attraversa una soglia, interpolato fra i due
 *  fotogrammi che la circondano: la risoluzione della misura non deve essere
 *  quella del frame rate, o «durata» diventerebbe un multiplo di 16,7 ms. */
function attraversa (storia, soglia, da = 0) {
  for (let i = Math.max(1, da); i < storia.length; i++) {
    const a = storia[i - 1], b = storia[i]
    if (a.q < soglia && b.q >= soglia) {
      const f = (soglia - a.q) / (b.q - a.q)
      return a.t + f * (b.t - a.t)
    }
  }
  return null
}

function misura (storia) {
  const t0 = attraversa(storia, 1e-6)
  const t1 = attraversa(storia, 1 - 1e-9)
  const d = (a, b) => (a === null || b === null) ? null : b - a
  // velocita' osservata, per differenze finite centrate
  const vel = []
  for (let i = 1; i < storia.length - 1; i++) {
    vel.push({
      t: storia[i].t,
      u: storia[i].u,
      v: (storia[i + 1].q - storia[i - 1].q) / (storia[i + 1].t - storia[i - 1].t)
    })
  }
  let picco = { v: -Infinity, t: 0, u: 0 }
  for (const p of vel) if (p.v > picco.v) picco = p
  let massimo = 0
  for (const p of storia) if (p.q > massimo) massimo = p.q
  let monotona = true
  for (let i = 1; i < storia.length; i++) {
    if (storia[i].q < storia[i - 1].q - 1e-12) { monotona = false; break }
  }
  return {
    piena: d(t0, t1),
    d1099: d(attraversa(storia, 0.10), attraversa(storia, 0.90)),
    d0199: d(attraversa(storia, 0.01), attraversa(storia, 0.99)),
    picco,
    massimo,
    monotona,
    vel
  }
}

/** Il profilo di velocita' disegnato con le barre: serve a VEDERE che il picco
 *  sta prima di meta' corsa e che la coda e' lunga. Un numero solo non lo dice. */
function profilo (vel, quanti = 26) {
  const utili = vel.filter(p => p.v > 1e-9)
  if (!utili.length) return
  const t0 = utili[0].t, t1 = utili[utili.length - 1].t
  const vmax = Math.max(...utili.map(p => p.v))
  for (let i = 0; i < quanti; i++) {
    const ta = t0 + (t1 - t0) * i / quanti
    const tb = t0 + (t1 - t0) * (i + 1) / quanti
    const dentro = utili.filter(p => p.t >= ta && p.t < tb)
    const v = dentro.length ? dentro.reduce((a, p) => a + p.v, 0) / dentro.length : 0
    const largo = Math.round(v / vmax * 54)
    console.log(`  ${n(ta, 2).padStart(5)}s │${'█'.repeat(largo).padEnd(54)}│ ${n(v, 2)}`)
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 1 · LA CORSA PIENA — il numero che il §4.2 prescrive
 * ═══════════════════════════════════════════════════════════════════════════
 */
riga('═')
console.log('§4.2 · CORSA DEL COPERCHIO — misura, non dichiarazione')
riga('═')

// gesto: lo scorrimento e' fermo sotto la soglia, poi la supera e ci resta.
// Il comando arriva a t = 0,20 s; la corsa parte da li'.
const apreEBasta = (t) => t < 0.20 ? 0.30 : 0.70
const A = banco(apreEBasta, { fps: 60, secondi: 3 })
const mA = misura(A.storia)

console.log(`
  durata piena (stacco -> fermo) ....... ${n(mA.piena)} s      [§4.2: ${MIN}-${MAX} s]
  durata 10-90% ........................ ${n(mA.d1099)} s
  durata 1-99% ......................... ${n(mA.d0199)} s
  velocita' di picco ................... ${n(mA.picco.v, 2)} corse/s
  quando cade il picco ................. a ${n(mA.picco.u / 1 * 100, 0)}% della fase, ${n(mA.picco.t - (mA.piena ? attraversa(A.storia, 1e-6) : 0), 2)} s dopo lo stacco
  massimo raggiunto .................... ${n(mA.massimo, 6)}   [rimbalzo se > 1]
  monotona (non torna mai indietro) .... ${mA.monotona ? 'si' : 'NO'}`)

console.log('\n  profilo di velocita\' (media per intervallo, unita\'/s):')
profilo(mA.vel)

/**
 * ─── IL METRO SI CONTROLLA CONTRO LA FORMULA
 *
 * La velocita' qui sopra e' misurata per differenze finite su una simulazione.
 * La stessa grandezza esiste in forma chiusa (`velocitaProfilo`). Se le due non
 * coincidono, non e' l'animazione a essere sbagliata: e' il provino. Ho gia'
 * pagato una volta il prezzo di uno strumento che restituiva un numero
 * plausibile senza avvisare di essere rotto.
 */
let scarto = 0
for (const p of mA.vel) {
  if (p.v < 1e-9) continue
  // dq/dt = E'(u) · du/dt ; du/dt lo ricavo dai campioni di u
  const i = mA.vel.indexOf(p)
  if (i < 1 || i >= mA.vel.length - 1) continue
  const du = (mA.vel[i + 1].u - mA.vel[i - 1].u) / (mA.vel[i + 1].t - mA.vel[i - 1].t)
  const atteso = velocitaProfilo(p.u) * du
  scarto = Math.max(scarto, Math.abs(atteso - p.v))
}
console.log(`\n  controllo del metro: scarto max fra velocita' osservata e formula = ${n(scarto, 5)}`)

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 2 · LA DURATA NON DIPENDE DAL FRAME RATE
 * ═══════════════════════════════════════════════════════════════════════════
 * Un'animazione tarata a colpi di lerp per fotogramma dura meta' su uno schermo
 * a 144 Hz, ed e' un difetto che sul portatile di chi l'ha scritta non si vede
 * mai. Qui l'integrazione e' in secondi e la rampa e' esponenziale in dt.
 */
riga()
console.log('2 · INDIPENDENZA DAL FRAME RATE')
riga()
for (const fps of [24, 30, 60, 90, 144]) {
  const m = misura(banco(apreEBasta, { fps, secondi: 3 }).storia)
  console.log(`  ${String(fps).padStart(3)} fps -> piena ${n(m.piena)} s   10-90% ${n(m.d1099)} s   picco ${n(m.picco.v, 2)}`)
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 3 · IL RITORNO DELLO SCORRIMENTO — la domanda difficile
 * ═══════════════════════════════════════════════════════════════════════════
 * Se lo scorrimento torna indietro a meta' apertura, cosa deve fare il
 * coperchio? La regola scelta sta in `impianto.js`: il comando e' binario, con
 * isteresi, e l'inversione e' permessa in qualsiasi istante. Qui si verifica
 * che non produca stati impossibili.
 */
riga()
console.log('3 · RITORNO DELLO SCORRIMENTO')
riga()

/** L'accelerazione massima lungo una storia, in corse/s^2. Serve un metro:
 *  40 corse/s^2 non vuol dire niente finche' non lo si confronta con quella di
 *  un'apertura pulita, che nessuno chiama «un colpo». */
function accelerazioneMax (storia) {
  let m = 0
  for (let i = 2; i < storia.length; i++) {
    const dt = storia[i].t - storia[i - 1].t
    const v1 = (storia[i].q - storia[i - 1].q) / dt
    const v0 = (storia[i - 1].q - storia[i - 2].q) / dt
    m = Math.max(m, Math.abs(v1 - v0) / dt)
  }
  return m
}
const accA = accelerazioneMax(A.storia)
console.log(`  riferimento: accelerazione max di un'apertura pulita = ${n(accA, 1)} corse/s^2`)

// (a) ripensamento a meta' corsa: apre, e a 0,45 s l'utente risale sopra il carter
const ripensamento = (t) => t < 0.10 ? 0.30 : (t < 0.55 ? 0.70 : 0.30)
const B = banco(ripensamento, { fps: 60, secondi: 3 })
const qMaxB = Math.max(...B.storia.map(p => p.q))
const finaleB = B.storia[B.storia.length - 1]
const tornato = B.storia.find(p => p.t > 0.55 && p.q <= 1e-9)
// il salto di velocita' nel fotogramma dell'inversione: e' cio' che si vedrebbe
// come un colpo se la velocita' di fase venisse ribaltata di segno di colpo
const saltoMax = accelerazioneMax(B.storia)
console.log(`  (a) inversione a meta': apertura massima raggiunta ${n(qMaxB)}`)
console.log(`      torna a zero ....................... ${tornato ? `si, a t = ${n(tornato.t, 2)} s` : 'NO — resterebbe a meta\''}`)
console.log(`      posizione finale ................... ${n(finaleB.q, 6)}`)
console.log(`      accelerazione max .................. ${n(saltoMax, 1)} corse/s^2   [apertura pulita: ${n(accA, 1)} — ${n(saltoMax / accA, 2)}x]`)

// (b) oscillazione di rotella DENTRO la banda d'isteresi: 4 Hz fra 0,44 e 0,54
const oscilla = (t) => t < 0.5 ? 0.70 : 0.49 + 0.05 * Math.sin(t * 2 * Math.PI * 4)
const C = banco(oscilla, { fps: 60, secondi: 4 })
const cambiC = C.storia.filter((p, i) => i > 0 && p.comando !== C.storia[i - 1].comando).length
console.log(`\n  (b) rotella che oscilla dentro la banda (0,44-0,54), 4 Hz per 3,5 s:`)
console.log(`      cambi di comando ................... ${cambiC}   [sbatterebbe se > 1]`)
console.log(`      posizione finale ................... ${n(C.storia[C.storia.length - 1].q, 6)}   [aperto = 1]`)

// (c) oscillazione ATTRAVERSO le due soglie: l'utente lo vuole davvero
const attraversaTutto = (t) => t < 0.5 ? 0.70 : 0.49 + 0.20 * Math.sin(t * 2 * Math.PI * 0.8)
const D = banco(attraversaTutto, { fps: 60, secondi: 6 })
const cambiD = D.storia.filter((p, i) => i > 0 && p.comando !== D.storia[i - 1].comando).length
const saltoD = accelerazioneMax(D.storia)
console.log(`\n  (c) rotella che ATTRAVERSA le soglie, 0,8 Hz per 5,5 s:`)
console.log(`      cambi di comando ................... ${cambiD}`)
console.log(`      accelerazione max .................. ${n(saltoD, 1)} corse/s^2   [${n(saltoD / accA, 2)}x l'apertura pulita: frena, non sbatte]`)
console.log(`      posizione finale ................... ${n(D.storia[D.storia.length - 1].q, 6)}`)

/**
 * ─── LA SOGLIA CHE NON HO SCELTO IO
 *
 * L'accelerazione dell'inversione e' ~3,6 volte quella di un'apertura pulita, e
 * la prima versione di questo provino la bocciava per questo. Sbagliato: il
 * rapporto e' alto perche' in inversione la velocita' cambia del doppio e nel
 * punto in cui la curva e' piu' ripida — nessuna taratura ragionevole lo porta
 * sotto 3, quindi quella soglia bocciava la fisica, non un difetto.
 *
 * Un COLPO e' una cosa precisa: una discontinuita' di velocita'. E una
 * discontinuita' si riconosce senza sceglierne il valore — l'accelerazione
 * misurata cresce con il frame rate, perche' il salto avviene sempre in un
 * fotogramma solo. Se invece converge a un numero finito, per quanto grande,
 * quella e' una frenata.
 */
const accInv = [60, 120, 240, 1000].map(fps => ({
  fps, a: accelerazioneMax(banco(ripensamento, { fps, secondi: 3 }).storia)
}))
const convergenza = accInv[accInv.length - 1].a / accInv[0].a
console.log(`
  (c2) l'inversione e' una frenata o un colpo? (un colpo cresce col frame rate)`)
for (const r of accInv) console.log(`      ${String(r.fps).padStart(4)} fps -> ${n(r.a, 1)} corse/s^2`)
console.log(`      crescita 60 -> 1000 fps ............ ${n(convergenza, 2)}x   [colpo se > 1,25]`)

// (d) il ciclo di disegno si ferma a meta' corsa (sezione fuori campo) e riprende
const E = creaCorsaCoperchio(OPZIONI)
E.passo(0.30, 1 / 60)
for (let i = 0; i < 24; i++) E.passo(0.70, 1 / 60)   // 0,4 s di corsa
const qPausa = E.q
E.passo(0.70, 8.0)                                    // otto secondi di scheda nascosta
const qDopoPausa = E.q
for (let i = 0; i < 180; i++) E.passo(0.70, 1 / 60)
console.log(`\n  (d) ciclo fermo a meta' (scheda nascosta, dt = 8 s):`)
console.log(`      prima della pausa .................. ${n(qPausa)}`)
console.log(`      subito dopo ........................ ${n(qDopoPausa)}   [il dt e' tagliato a 0,05 s: niente salto]`)
console.log(`      tre secondi dopo ................... ${n(E.q, 6)}   [riprende e finisce]`)

// (e) primo fotogramma con lo scorrimento gia' dentro il taglio (ricarica pagina)
const F = creaCorsaCoperchio(OPZIONI)
const q0 = F.passo(0.85, 1 / 60)
console.log(`\n  (e) pagina ricaricata a meta' del taglio: q al primo fotogramma = ${n(q0, 6)}`)
console.log(`      [aggancio, non corsa: nessuna apertura che l'utente non ha chiesto]`)

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 4 · IL PRIMA — quanto durava la corsa quando seguiva il dito
 * ═══════════════════════════════════════════════════════════════════════════
 * `index.js:495` mappava `clamp((spaccato - 0,55) / 0,35, 0, 1)`. La durata non
 * esisteva: era una conseguenza di quanto in fretta si girava la rotella.
 * Il conto sotto usa la geometria vera del capitolo (`regia.js`: taglio su
 * p 0,64-1,00, con `dolce` in mezzo) e una sezione alta quattro schermate.
 */
riga()
console.log('4 · IL PRIMA — la corsa che seguiva il dito')
riga()
const dolceInv = (y) => {           // inversa di 3x^2-2x^3, per bisezione
  let a = 0, b = 1
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2
    if (m * m * (3 - 2 * m) < y) a = m; else b = m
  }
  return (a + b) / 2
}
const VIEWPORT = 900
const CORSA_PX = 4 * VIEWPORT                       // sezione alta cinque schermate
const dP = (dolceInv(0.90) - dolceInv(0.55)) * (1.00 - 0.64)
const PX = dP * CORSA_PX
console.log(`  lo scorrimento da coprire per aprire tutto: ${n(PX, 0)} px (${n(PX / 100, 1)} colpi di rotella)`)
for (const [gesto, px_s] of [['flick inerziale', 1600], ['rotella decisa', 600], ['rotella lenta', 180], ['trackpad al rallentatore', 60]]) {
  console.log(`    ${gesto.padEnd(26)} ${String(px_s).padStart(5)} px/s  ->  corsa in ${n(PX / px_s, 2)} s`)
}
console.log(`  [§4.2 chiede ${MIN}-${MAX} s. Nessuno di questi gesti ci cade dentro, e non e' un caso:`)
console.log(`   una durata non puo' uscire da una mappatura, perche' la mappatura non ha un tempo.]`)

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IL CANCELLO
 * ═══════════════════════════════════════════════════════════════════════════
 */
riga('═')
const guasti = []
if (mA.piena === null) guasti.push('la corsa non arriva mai a 1')
else if (mA.piena < MIN || mA.piena > MAX) {
  guasti.push(`durata ${n(mA.piena)} s fuori dai ${MIN}-${MAX} s del §4.2`)
}
if (mA.massimo > 1 + 1e-12) guasti.push(`rimbalzo: massimo ${n(mA.massimo, 8)} > 1`)
if (!mA.monotona) guasti.push('la corsa torna indietro durante l\'apertura')
if (mA.picco.u > 0.5) guasti.push(`picco di velocita' a ${n(mA.picco.u * 100, 0)}% della fase: profilo senza massa`)
if (scarto > 0.02) guasti.push(`il provino non concorda con la formula (scarto ${n(scarto, 4)})`)
if (!tornato) guasti.push('lo scorrimento torna indietro e il coperchio resta a meta\'')
if (cambiC > 1) guasti.push(`l'isteresi non tiene: ${cambiC} cambi di comando su un'oscillazione interna alla banda`)
if (q0 < 0.999) guasti.push('il primo fotogramma anima invece di agganciarsi')
if (convergenza > 1.25) {
  guasti.push(`l'inversione e' un colpo: l'accelerazione cresce ${n(convergenza, 2)}x fra 60 e 1000 fps`)
}

const esito = {
  quando: new Date().toISOString(),
  fonte: 'src/scena/impianto.js — creaCorsaCoperchio',
  prescrizione: { documento: 'docs/14-FOTOREALISMO.md §4.2', min: MIN, max: MAX },
  durataPiena: mA.piena,
  durata1090: mA.d1099,
  durata0199: mA.d0199,
  velocitaPicco: mA.picco.v,
  faseDelPicco: mA.picco.u,
  massimo: mA.massimo,
  monotona: mA.monotona,
  scartoDallaFormula: scarto,
  ritorno: {
    aperturaMassimaPrimaDelRipensamento: qMaxB,
    tornaAZero: Boolean(tornato),
    cambiComandoOscillazioneInterna: cambiC,
    cambiComandoOscillazioneAttraverso: cambiD,
    accelerazioneMassimaInInversione: saltoMax,
    accelerazioneAperturaPulita: accA,
    accelerazionePerFrameRate: accInv,
    crescitaColFrameRate: convergenza
  },
  primoFotogrammaAggancia: q0 >= 0.999,
  guasti
}
mkdirSync(resolve(QUI), { recursive: true })
writeFileSync(resolve(QUI, 'misura.json'), JSON.stringify(esito, null, 2) + '\n')

if (guasti.length) {
  console.log('GUASTO:')
  for (const g of guasti) console.log('  · ' + g)
  riga('═')
  process.exit(1)
}
console.log(`OK — corsa di ${n(mA.piena)} s, picco a ${n(mA.picco.u * 100, 0)}% della fase, nessun rimbalzo.`)
console.log('   misura scritta in riferimenti/carter/misura.json')
riga('═')
