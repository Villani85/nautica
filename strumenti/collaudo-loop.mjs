/**
 * COLLAUDO DEI TRE FILMATI CHE IL BROWSER RIPETE.
 *
 *     node strumenti/collaudo-loop.mjs [file.mp4 ...]
 *
 * `collaudo-filmato.mjs` misura la camera DENTRO il file. Non puo' vedere il
 * fotogramma che il browser inventa quando `loop = true`: ultimo -> primo.
 * Questo cancello misura proprio quel bordo.
 *
 * Il metro non e' una differenza assoluta scelta a caso. Ogni clip ha il suo
 * rumore e il suo movimento; percio' il salto finale viene diviso per la
 * mediana dei normali passaggi fra due fotogrammi consecutivi. Il rapporto
 * deve restare sotto 2x. La soglia e' stata fissata guardando i tre raccordi
 * ricostruiti: 1,37x e 1,78x sulle persone, 1,92x sul mare. I vecchi file
 * misuravano 3,05x, 3,90x e 17,93x.
 *
 * Il secondo limite impedisce di nascondere il salto al bordo spostandolo
 * dentro il filmato: nessun passaggio interno puo' superare 4x il passo
 * normale. Infine si controlla BT.709, perche' un loop corretto che cambia
 * colore fra Safari e Chromium non e' un asset chiuso.
 */

import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const LARGHEZZA = 320
const ALTEZZA = 180
const BYTE_FOTOGRAMMA = LARGHEZZA * ALTEZZA
const TETTO_GIUNZIONE = 2
const TETTO_INTERNO = 4

const predefiniti = [
  'public/filmati/salone-largo.mp4',
  'public/filmati/salone-teso.mp4',
  'public/filmati/salone-mare.mp4'
]

const file = (process.argv.slice(2).length ? process.argv.slice(2) : predefiniti)
  .map(p => resolve(p))

function esegui (programma, argomenti, opzioni = {}) {
  const r = spawnSync(programma, argomenti, {
    encoding: opzioni.encoding ?? null,
    maxBuffer: 128 * 1024 * 1024
  })
  if (r.error) throw r.error
  if (r.status !== 0) {
    const errore = Buffer.isBuffer(r.stderr) ? r.stderr.toString('utf8') : r.stderr
    throw new Error(`${programma} e' uscito con ${r.status}: ${errore}`)
  }
  return r.stdout
}

function mediana (valori) {
  const v = [...valori].sort((a, b) => a - b)
  const m = Math.floor(v.length / 2)
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2
}

function differenza (buf, a, b) {
  let somma = 0
  const oa = a * BYTE_FOTOGRAMMA
  const ob = b * BYTE_FOTOGRAMMA
  for (let i = 0; i < BYTE_FOTOGRAMMA; i++) {
    somma += Math.abs(buf[oa + i] - buf[ob + i])
  }
  return somma / BYTE_FOTOGRAMMA
}

function misura (percorso) {
  if (!existsSync(percorso)) throw new Error(`file assente: ${percorso}`)

  const buf = esegui('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-i', percorso,
    '-vf', `scale=${LARGHEZZA}:${ALTEZZA},format=gray`,
    '-f', 'rawvideo', '-'
  ])
  const fotogrammi = Math.floor(buf.length / BYTE_FOTOGRAMMA)
  if (fotogrammi < 3 || buf.length % BYTE_FOTOGRAMMA !== 0) {
    throw new Error(`${percorso}: flusso incompleto (${buf.length} byte)`)
  }

  const passi = []
  for (let i = 0; i < fotogrammi - 1; i++) passi.push(differenza(buf, i, i + 1))
  const passo = mediana(passi)
  const giunzione = differenza(buf, fotogrammi - 1, 0)
  const massimo = Math.max(...passi)

  const sonda = JSON.parse(esegui('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=color_range,color_space,color_transfer,color_primaries',
    '-of', 'json', percorso
  ], { encoding: 'utf8' }))
  const colore = sonda.streams?.[0] || {}

  return {
    percorso,
    fotogrammi,
    passo,
    giunzione,
    rapporto: giunzione / passo,
    massimo,
    rapportoMassimo: massimo / passo,
    colore
  }
}

let rosso = false
for (const percorso of file) {
  const r = misura(percorso)
  const nome = percorso.split(/[\\/]/).pop()
  console.log(`\n  ${nome}`)
  console.log(`  ${r.fotogrammi} fotogrammi · passo mediano ${r.passo.toFixed(3)} livelli`)
  console.log(`  GIUNZIONE  ${r.giunzione.toFixed(3)} · ${r.rapporto.toFixed(2)}x  (tetto ${TETTO_GIUNZIONE}x)`)
  console.log(`  INTERNO    ${r.massimo.toFixed(3)} · ${r.rapportoMassimo.toFixed(2)}x  (tetto ${TETTO_INTERNO}x)`)

  const coloreOk = r.colore.color_range === 'tv' &&
    r.colore.color_space === 'bt709' &&
    r.colore.color_transfer === 'bt709' &&
    r.colore.color_primaries === 'bt709'
  console.log(`  COLORE     ${coloreOk ? 'BT.709 limited' : JSON.stringify(r.colore)}`)

  if (r.rapporto > TETTO_GIUNZIONE) {
    console.error('  ROTTO: il riavvio si vede piu di due fotogrammi normali.')
    rosso = true
  }
  if (r.rapportoMassimo > TETTO_INTERNO) {
    console.error('  ROTTO: il raccordo e stato spostato dentro il file.')
    rosso = true
  }
  if (!coloreOk) {
    console.error('  ROTTO: il file non dichiara integralmente BT.709 limited.')
    rosso = true
  }
}

if (rosso) process.exit(1)
console.log('\n  LOOP IN ORDINE')

