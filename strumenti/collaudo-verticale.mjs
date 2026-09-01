/**
 * LA TRAVERSATA STA DENTRO LO SCAFO? — la prova che morde sull'offset.
 *
 * ─── PERCHE' ESISTE, e cosa NON prova
 *
 * Il ponte fra il frame Blender e le unita' del sito e'
 *
 *     z_unita = 1,9089 - X_m / 2,5
 *
 * ed e' DERIVATO da tre letture indirette. Avevo scritto che due conti
 * indipendenti lo confermavano: la campata della traversata veniva 5,6410
 * unita' per la mia strada e 5,64 per quella del committente.
 *
 * ERA UN VERDE FALSO, ed e' della stessa famiglia dei mebibyte letti come
 * megabyte: **la campata dipende solo dal fattore 1/2,5**, che entrambi
 * usavamo gia'. Qualunque offset -- 1,9089, zero, quaranta -- avrebbe dato
 * 5,641 lo stesso. L'unica parte del ponte che porta informazione e' proprio
 * l'OFFSET, ed e' l'unica che quel confronto non toccava. Un numero giusto che
 * verifica qualcosa di diverso da quello che sembra verificare.
 *
 * ─── LA PROVA CHE INVECE MORDE E' VERTICALE
 *
 * L'offset decide a QUALI ORDINATE cade la traversata, e le ordinate hanno una
 * luce finita: lo scafo si stringe verso poppa. Quindi si costruisce la quota
 * del soffitto del salone partendo dalla chiglia sotto il locale tecnico e si
 * guarda se esce dal ponte.
 *
 * E si fa A DUE STAZIONI, non a una. Il primo conto che avevo in mente sommava
 * 2,00 + 2,10 + 2,35 = 6,45 m dentro la stessa luce: sbagliato, perche' i due
 * ambienti stanno a quattordici metri di distanza longitudinale, non impilati
 * sulla stessa ordinata. Il committente l'ha detto prima che lo usassi.
 *
 * ─── E NON RICOPIA LA TABELLA
 *
 * Importa `sezioneA` da `src/scafo/ordinate.js`, che il file dichiara essere
 * «l'UNICA interpolazione, tutto il resto del file la chiama», ed e' LINEARE.
 * Una spline darebbe una sezione piu' bella e DIVERSA, e lo scafo di Blender
 * non combacerebbe con quello che il visitatore vede intorno a se'.
 */
import { sezioneA, PRUA_Z, POPPA_Z } from '../src/scafo/ordinate.js'

const M = 2.5                    // ordinate.js:19 — 1 unita' di scena = 2,5 m
const OFFSET = 1.9089            // world_root.PONTE_SITO_ORIGINE_Z_UNITA
const X_SALONE = -0.800          // world_root.CUCITURE.ingresso_salone.x_m
const X_FONDO = -14.902575       // world_root.COLLOCAZIONI.MECHANISM_BAY
const RISALITA = 1.40            // world_root.RISALITA_CORRIDOIO_M, vincolata dalle ordinate
const ALTEZZA_SALONE = 2.35      // il guscio misurato

const z = (x) => OFFSET - x / M
const t = (zz) => (zz - PRUA_Z) / (POPPA_Z - PRUA_Z)

/**
 * IL SEGNO, PROVATO E NON DICHIARATO.
 *
 * +X va verso PRUA e la z del sito cresce verso POPPA: il ponte deve invertire.
 * Un ponte che sbagliasse SOLO il segno pescherebbe la sezione dall'altra meta'
 * della nave senza lanciare nessun errore. Un segno dichiarato in un commento
 * sopravvive a chi ha scritto il commento; un'asserzione no.
 */
const TOLL = 0.001
const attese = [[X_SALONE, 2.2289], [X_FONDO, 7.8699]]
let guai = 0
console.log('IL VERSO DEL PONTE')
for (const [x, atteso] of attese) {
  const ok = Math.abs(z(x) - atteso) < TOLL
  console.log(`  z(X = ${x.toFixed(3)}) = ${z(x).toFixed(4)}  atteso ${atteso.toFixed(4)}  ${ok ? 'ok' : 'SBAGLIATO'}`)
  if (!ok) guai++
}
if (z(X_FONDO) <= z(X_SALONE)) {
  console.log('  ROSSO — la z non cresce andando verso poppa: il segno e\' invertito.')
  guai++
}

const A = sezioneA(t(z(X_FONDO)))    // stazione del locale tecnico
const B = sezioneA(t(z(X_SALONE)))   // stazione del salone

const pavimentoMB = A.chiglia * M
const pavimentoSalone = pavimentoMB + RISALITA
const soffittoSalone = pavimentoSalone + ALTEZZA_SALONE
const ponteSalone = B.ponteY * M
const eccesso = soffittoSalone - ponteSalone

console.log('\nIL CONTO A DUE STAZIONI')
console.log(`  locale tecnico   t ${t(z(X_FONDO)).toFixed(4)}   chiglia ${pavimentoMB.toFixed(3)} m   luce ${((A.ponteY - A.chiglia) * M).toFixed(3)} m`)
console.log(`  salone           t ${t(z(X_SALONE)).toFixed(4)}   ponte   ${ponteSalone.toFixed(3)} m   luce ${((B.ponteY - B.chiglia) * M).toFixed(3)} m`)
console.log(`  la chiglia risale di ${((A.chiglia - B.chiglia) * M).toFixed(3)} m fra le due stazioni`)
console.log(`\n  chiglia ${pavimentoMB.toFixed(3)} + risalita ${RISALITA.toFixed(2)} + salone ${ALTEZZA_SALONE.toFixed(2)} = soffitto ${soffittoSalone.toFixed(3)} m`)
console.log(`  ponte alla stazione del salone                                   ${ponteSalone.toFixed(3)} m`)

if (eccesso > 0) {
  const max = ponteSalone - pavimentoMB - ALTEZZA_SALONE
  console.log(`\nROSSO — il soffitto del salone esce sopra il trincarino di ${eccesso.toFixed(3)} m.`)
  console.log(`        Con questo offset la risalita del corridoio non puo' superare ${max.toFixed(3)} m,`)
  console.log(`        e corridor.py:54 ne dichiara ${RISALITA.toFixed(2)} -- dodici gradini da 0,175.`)
  console.log('\n        TRE CANDIDATI, e questo strumento NON sceglie:')
  console.log('        · la risalita 2,10, che corridor.py:54 dichiara «nessuna misura»')
  console.log('        · l\'offset 1,9089, che e\' DERIVATO da tre letture indirette')
  console.log('        · il pavimento del locale tecnico appoggiato alla chiglia,')
  console.log('          che e\' un\'assunzione di questo conto, non del modello')
  console.log(`\n        Nota aritmetica: l'eccesso (${eccesso.toFixed(3)}) e' quasi la risalita della`)
  console.log(`        chiglia fra le due stazioni (${((A.chiglia - B.chiglia) * M).toFixed(3)}). E per azzerarlo col solo`)
  console.log('        offset servirebbero 8,33 m in avanti, che porterebbero il locale')
  console.log('        tecnico a mezzanave invece che a poppa. Quindi l\'offset da solo')
  console.log('        non spiega il difetto.')
  guai++
} else {
  console.log(`\n  il soffitto sta sotto il ponte con ${(-eccesso).toFixed(3)} m di franco`)
}

if (guai) process.exit(1)
console.log('\nVERDE — la traversata sta dentro lo scafo, e il ponte ha il verso giusto.')
