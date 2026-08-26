import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { AMPIEZZA_MARE, V_MAX, _riduzioneCruda } from '../src/scena/simulazione.js'

/**
 * GENERA LA TABELLA DELLE RIDUZIONI.
 *
 *     node strumenti/genera-riduzioni.mjs            scrive il file
 *     node strumenti/genera-riduzioni.mjs --verifica rigenera e confronta
 *
 * PERCHE' ESISTE, che e' la parte che vale la pena leggere.
 *
 * La riduzione del rollio si calcolava a runtime, in cache per (mare,
 * velocita'). Sono 6 x 21 = 126 combinazioni, e ognuna costava una
 * integrazione: **uno scatto di 20-50 ms ogni nodo che l'utente trascinava**.
 * Venti scatti per attraversare il cursore dell'andatura.
 *
 * E il cancello che avrebbe dovuto impedirlo misurava millisecondi, quindi
 * misurava quanto era carica la macchina: lo STESSO codice dava 11,4 ms a
 * riposo e 52 sotto carico. Un cancello cosi' non protegge niente.
 *
 * Adesso il calcolo si fa QUI, una volta, con lo stimatore caro — passo 1/120
 * contro 1/25, finestre doppie, otto realizzazioni del mare invece di cinque.
 * A runtime resta una lettura.
 *
 * E siccome `creaMare` accetta un SEME, la tabella e' riproducibile byte per
 * byte: `--verifica` la rigenera e confronta. E' cosi' che il cancello smette
 * di misurare il tempo e comincia a misurare il lavoro.
 *
 * IL GUADAGNO CHE NON MI ASPETTAVO: i numeri diventano ispezionabili. Prima la
 * riduzione era un numero che il visitatore doveva credere. Adesso e' un file
 * nel repository che chiunque puo' rigenerare con un comando. Il sito dice
 * "measured, not declared": questa e' la versione forte di quella frase.
 *
 * VA RIESEGUITO ogni volta che cambia il modello del rollio — costanti,
 * stallo, autorita', armoniche del mare. Il collaudo se ne accorge da solo.
 */

// Lo stimatore caro. Gira una volta, quindi non si risparmia.
const OPZ = { dt: 1 / 120, transitorio: 90, misura: 180 }
const REALIZZAZIONI = 8

const USCITA = new URL('../src/scena/riduzioni.json', import.meta.url)

/** Semi distinti e deterministici: stessa cella, stessi otto mari. */
const seme = (mare, vel, i) => mare * 100000 + vel * 1000 + i

function genera () {
  const t0 = performance.now()
  const tabella = []
  for (let mare = 0; mare < AMPIEZZA_MARE.length; mare++) {
    const riga = []
    for (let vel = 0; vel <= V_MAX; vel++) {
      let somma = 0
      for (let i = 0; i < REALIZZAZIONI; i++) {
        somma += _riduzioneCruda(mare, vel, { ...OPZ, seme: seme(mare, vel, i) })
      }
      // cinque decimali: 0,001% di risoluzione, e il diff resta leggibile
      riga.push(Math.round((somma / REALIZZAZIONI) * 1e5) / 1e5)
    }
    tabella.push(riga)
    process.stdout.write(`  mare ${mare}: ` + riga.filter((_, i) => i % 4 === 0)
      .map((x, i) => `${i * 4}kn ${(x * 100).toFixed(1)}%`).join('  ') + '\n')
  }
  return { tabella, ms: performance.now() - t0 }
}

/**
 * UNA RIGA PER STATO DEL MARE, e non e' estetica.
 *
 * Con la formattazione automatica ogni numero finiva su una riga sua: 126
 * righe di cifre, e un diff che non dice niente. Cosi' invece una riga cambiata
 * significa **un mare cambiato**, e si vede a colpo d'occhio da dove viene la
 * differenza. Un file generato che si legge male viene ignorato, e un file
 * ignorato tanto vale non versionarlo.
 */
const testo = (t) => '{\n' +
  '  "_": "Generato da strumenti/genera-riduzioni.mjs. Non si modifica a mano: si rigenera.",\n' +
  '  "_righe": "un mare per riga, da 0 a 5; una colonna per nodo, da 0 a 20",\n' +
  `  "passo": ${OPZ.dt}, "transitorio": ${OPZ.transitorio}, "misura": ${OPZ.misura}, "realizzazioni": ${REALIZZAZIONI},\n` +
  '  "riduzione": [\n' +
  t.map(r => '    [' + r.map(x => x.toFixed(5)).join(', ') + ']').join(',\n') +
  '\n  ]\n}\n'

const verifica = process.argv.includes('--verifica')
const { tabella, ms } = genera()

if (verifica) {
  if (!existsSync(USCITA)) {
    console.error('\n  ROTTO: riduzioni.json non esiste. Esegui senza --verifica.\n')
    process.exit(1)
  }
  const atteso = readFileSync(USCITA, 'utf8')
  const ottenuto = testo(tabella)
  if (atteso !== ottenuto) {
    const a = JSON.parse(atteso).riduzione
    let peggio = 0, dove = ''
    for (let m = 0; m < tabella.length; m++) {
      for (let v = 0; v < tabella[m].length; v++) {
        const d = Math.abs((a?.[m]?.[v] ?? 0) - tabella[m][v]) * 100
        if (d > peggio) { peggio = d; dove = `mare ${m}, ${v} nodi` }
      }
    }
    console.error(`\n  ROTTO: la tabella versionata non corrisponde a quella rigenerata.`)
    console.error(`  scarto peggiore ${peggio.toFixed(3)} punti a ${dove}`)
    console.error(`  Se il modello del rollio e' cambiato apposta, rigenera e committa:`)
    console.error(`      node strumenti/genera-riduzioni.mjs\n`)
    process.exit(1)
  }
  console.log(`\n  OK  la tabella versionata corrisponde  (rigenerata in ${(ms / 1000).toFixed(1)} s)\n`)
} else {
  writeFileSync(USCITA, testo(tabella))
  console.log(`\n  scritto src/scena/riduzioni.json  —  126 celle in ${(ms / 1000).toFixed(1)} s\n`)
}
