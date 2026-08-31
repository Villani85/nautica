/**
 * IL SITO DICHIARA DA QUALE COMMIT NASCE.
 *
 * ─── DIECI RIGHE CHE CHIUDONO UNA CLASSE DI DISCUSSIONI
 *
 * Il 31 agosto io e il revisore abbiamo passato mezza giornata a non essere
 * d'accordo su cosa fosse pubblicato. Io dicevo «il bundle di stamattina», lui
 * leggeva sul sito vivo una frase delle 12:40 e non una delle 15:52. Avevamo
 * ragione tutti e due e non potevamo saperlo, perche' l'unica cosa che il sito
 * dichiarava era il nome del proprio file JS -- un'impronta del CONTENUTO, non
 * una data e non un commit.
 *
 * Da qui in poi la domanda «cosa c'e' pubblicato» ha una risposta che si legge
 * con `curl`, in un secondo, senza costruire niente in locale e senza mettersi
 * d'accordo su niente.
 *
 * Scrive due cose perche' servono a due lettori diversi:
 *   dist/versione.json   per uno strumento: commit, data, ramo
 *   <meta> in index.html per un umano con `curl | grep versione`
 *
 * IL COMMIT VIENE DA GITHUB_SHA quando c'e' -- in CI e' l'unica fonte vera,
 * perche' il clone e' superficiale e `git rev-parse` puo' dire un'altra cosa.
 * In locale si ripiega su git, e lo DICHIARA: `fonte` dice sempre da dove
 * arriva il numero, che e' la regola di questo repo applicata a se stesso.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'

const daGitHub = process.env.GITHUB_SHA || null
let commit = daGitHub
let fonte = 'GITHUB_SHA'
if (!commit) {
  try { commit = execSync('git rev-parse HEAD').toString().trim(); fonte = 'git rev-parse (locale)' }
  catch { commit = 'sconosciuto'; fonte = 'nessuna' }
}
let ramo = process.env.GITHUB_REF_NAME || null
if (!ramo) {
  try { ramo = execSync('git rev-parse --abbrev-ref HEAD').toString().trim() } catch { ramo = 'sconosciuto' }
}

const stampiglio = {
  commit,
  breve: commit.slice(0, 7),
  ramo,
  fonte,
  costruito: new Date().toISOString()
}

writeFileSync('dist/versione.json', JSON.stringify(stampiglio, null, 2) + '\n')

const via = 'dist/index.html'
if (existsSync(via)) {
  let html = readFileSync(via, 'utf8')
  const tag = `<meta name="versione" content="${stampiglio.breve}" data-costruito="${stampiglio.costruito}">`
  /* subito dopo <head>, cosi' `curl | head` lo trova senza scaricare tutto */
  if (/<meta name="versione"/.test(html)) html = html.replace(/<meta name="versione"[^>]*>/, tag)
  else html = html.replace(/<head>/i, `<head>\n  ${tag}`)
  writeFileSync(via, html)
}

console.log(`stampiglio: ${stampiglio.breve} (${fonte}) su ${ramo}`)
