/**
 * OGNI PASSO DI UN WORKFLOW HA UN COMANDO.
 *
 * ─── DIFETTO PRESO SU ME STESSO, CINQUE MINUTI DOPO AVERLO INTRODOTTO
 *
 * Togliendo un cancello dal workflow ho cancellato la sua riga `run:` e ho
 * lasciato in piedi il passo con il nome, il tetto e l'`env`. Un passo con
 * `name` ma senza `run` ne' `uses` GitHub lo RIFIUTA: la corsa non parte
 * affatto.
 *
 * E `collaudo-workflow.mjs` ha risposto «i workflow sono leggibili da
 * Actions», perche' guarda le chiavi duplicate -- che e' il difetto per cui
 * era nato, e un difetto diverso. Un cancello che dice «leggibile» su un file
 * che il servizio rifiuta e' un cancello che RASSICURA, ed e' la specie che
 * questo repo insegue da un giorno intero.
 *
 * ─── PERCHE' UN FILE NUOVO E NON UNA RIGA IN QUELLO VECCHIO
 *
 * Perche' sono due domande diverse: «questo YAML e' ben formato?» e «questo
 * workflow e' eseguibile?». Un cancello che risponde a due domande, quando
 * fallisce, ne fa credere una sola.
 *
 * ─── E IL CONTROLLO E' GREZZO APPOSTA
 *
 * Niente parser YAML: qui il parser e' un altro modo di sbagliare, ed e' gia'
 * successo -- PyYAML accettava senza fiatare la chiave `env:` duplicata che
 * faceva produrre a GitHub zero job. Si cerca la forma che questo repo usa
 * davvero: passi in stile compatto su una riga, oppure `- name:` seguito dalle
 * proprie chiavi piu' rientrate.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const CARTELLA = '.github/workflows'
if (!existsSync(CARTELLA)) {
  console.log('nessuna cartella dei workflow: niente da controllare.')
  process.exit(0)
}

let orfani = 0
let passi = 0

for (const nome of readdirSync(CARTELLA).filter((f) => /\.ya?ml$/.test(f))) {
  const righe = readFileSync(join(CARTELLA, nome), 'utf8').split('\n')
  for (let i = 0; i < righe.length; i++) {
    const r = righe[i]
    const m = r.match(/^(\s+)- (name:|\{)/)
    if (!m) continue
    passi++
    /* stile compatto: il comando sta sulla stessa riga */
    if (/\brun:|\buses:/.test(r)) continue

    const rientro = m[1].length
    let comando = false
    for (let k = i + 1; k < righe.length; k++) {
      const n = righe[k]
      if (!n.trim() || /^\s*#/.test(n)) continue
      const q = n.length - n.trimStart().length
      if (q <= rientro) break                       // finito il passo
      if (/^\s*(run|uses):/.test(n)) { comando = true; break }
    }
    if (!comando) {
      console.log(`  ROSSO  ${nome}:${i + 1}`)
      console.log(`         passo senza \`run\` ne' \`uses\`: GitHub rifiuta il file.`)
      console.log(`         > ${r.trim().slice(0, 78)}`)
      orfani++
    }
  }
}

console.log(`\n  ${passi} passi esaminati, ${orfani} senza comando`)
if (orfani) {
  console.log('\nROSSO — il file e\' leggibile e il servizio lo rifiuta lo stesso.')
  process.exit(1)
}
console.log('\nVERDE — ogni passo di ogni workflow ha un comando.')
