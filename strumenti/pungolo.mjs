/**
 * IL PUNGOLO — mi sveglia quando resto fermo.
 *
 * ─── PERCHE' ESISTE
 *
 * Il committente, guardando da fuori: *«stai andando avanti? a me non
 * risulta»*. Aveva ragione, e la causa era esatta: avevo due commit fatti e non
 * spinti. Dentro la sessione stavo lavorando; da fuori, il repo era fermo da
 * mezz'ora.
 *
 * E' la stessa cosa gia' successa ieri: quaranta commit in locale e il pubblico
 * ne vedeva zero. Me l'ero scritto come regola -- si spinge a ogni difetto
 * chiuso -- e l'ho violata il giorno dopo.
 *
 * Una regola che si ricorda a mano e' una regola che un giorno nessuno ricorda.
 * Questo la rende un fatto: un processo che sta in ascolto e torna a bussare.
 *
 * ─── COME SVEGLIA
 *
 * Non puo' chiamarmi. Ma un comando in secondo piano che ESCE genera una
 * notifica, e quella mi rientra. Quindi il pungolo non fa altro che aspettare
 * il primo fra tre fatti e poi morire, dicendo quale:
 *
 *   1. il ramo remoto si e' mosso        -> c'e' da controllare la corsa
 *   2. il sito servito e' cambiato       -> la pubblicazione e' arrivata
 *   3. sono passati N minuti senza che l'HEAD locale cambi
 *      -> sono fermo, o sto lavorando senza committare: entrambi vanno detti
 *
 * Il terzo e' quello che conta, ed e' scritto apposta sull'HEAD LOCALE e non su
 * quello remoto: se committo senza spingere, il locale si muove e il remoto no.
 * Il pungolo tace, e sarebbe il difetto di oggi ripetuto dentro lo strumento
 * che dovrebbe prenderlo. Quindi guarda ENTRAMBI, e se divergono lo dice.
 */
import { execSync } from 'node:child_process'

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? Number(process.argv[i + 1]) : d }

/** Dopo quanti minuti di HEAD fermo il pungolo bussa. */
const SILENZIO_MIN = arg('--silenzio', 12)
/** Ogni quanto guarda. Trenta secondi: piu' spesso e' rumore. */
const PASSO_MS = 30000
/** Tetto assoluto, per non restare appeso: due ore. */
const TETTO_MIN = arg('--tetto', 120)

const sh = (c) => { try { return execSync(c, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch { return '' } }

const bundleServito = async () => {
  try {
    const r = await fetch('https://villani85.github.io/nautica/?x=' + Date.now())
    const t = await r.text()
    return (t.match(/assets\/index-[\w-]+\.js/) || [null])[0]
  } catch { return null }
}

const testaLocale = () => sh('git rev-parse HEAD')
const testaRemota = () => sh('git rev-parse origin/main')

const t0 = Date.now()
const localeIniziale = testaLocale()
const remotaIniziale = testaRemota()
const servitoIniziale = await bundleServito()
let ultimoCambioLocale = Date.now()
let precedenteLocale = localeIniziale

console.log(`pungolo acceso · silenzio ${SILENZIO_MIN} min · tetto ${TETTO_MIN} min`)
console.log(`  locale  ${localeIniziale.slice(0, 7)}`)
console.log(`  remoto  ${remotaIniziale.slice(0, 7)}`)
console.log(`  servito ${servitoIniziale || '?'}`)

const chiudi = (motivo) => {
  console.log('')
  console.log('PUNGOLO — ' + motivo)
  process.exit(0)
}

while (true) {
  await new Promise((r) => setTimeout(r, PASSO_MS))

  const loc = testaLocale()
  const rem = testaRemota()
  if (loc !== precedenteLocale) { precedenteLocale = loc; ultimoCambioLocale = Date.now() }

  const servito = await bundleServito()
  if (servito && servitoIniziale && servito !== servitoIniziale) {
    chiudi(`IL SITO E CAMBIATO: ${servitoIniziale} -> ${servito}. ` +
           'La pubblicazione e arrivata: verifica cosa e uscito e dillo.')
  }

  if (rem !== remotaIniziale) {
    chiudi(`il ramo remoto si e mosso: ${remotaIniziale.slice(0, 7)} -> ${rem.slice(0, 7)}. ` +
           'Controlla la corsa.')
  }

  const fermoDa = (Date.now() - ultimoCambioLocale) / 60000
  const daSpingere = Number(sh('git rev-list --count origin/main..HEAD') || 0)

  if (daSpingere > 0 && fermoDa > 3) {
    chiudi(`HAI ${daSpingere} COMMIT NON SPINTI da ${fermoDa.toFixed(0)} minuti. ` +
           'Da fuori il lavoro non esiste: spingi prima di continuare.')
  }

  if (fermoDa >= SILENZIO_MIN) {
    chiudi(`HEAD locale fermo da ${fermoDa.toFixed(0)} minuti su ${loc.slice(0, 7)}. ` +
           'O sei bloccato, o stai lavorando senza committare: in entrambi i casi ' +
           'chiudi qualcosa e committalo.')
  }

  if ((Date.now() - t0) / 60000 >= TETTO_MIN) {
    chiudi(`tetto di ${TETTO_MIN} minuti raggiunto. Riaccendimi se serve.`)
  }
}
