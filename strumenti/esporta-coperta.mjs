/**
 * ESPORTA-COPERTA — passa il cavallino vero a Blender.
 *
 *     node strumenti/esporta-coperta.mjs [uscita.json]
 *
 * La sovrastruttura si costruisce in Blender e deve appoggiare sul ponte. Il
 * ponte e' una curva che vive in `src/scafo/ordinate.js` — nove ordinate scritte
 * a mano, con un cavallino che sale di 118 cm su 40 m.
 *
 * ─── PERCHE' NON LA RISCRIVO IN PYTHON
 *
 * Sarebbe stato piu' rapido copiare la tabella nello script Blender. E sarebbe
 * stata la seconda implementazione della stessa curva: il difetto peggiore
 * possibile qui, perche' **non da' errore**. La sovrastruttura continuerebbe a
 * essere costruita, valida, e appoggiata a un ponte che non e' piu' quello
 * disegnato — interrata a prua o sollevata a poppa di qualche centimetro. Si
 * vedrebbe come una fessura di luce sotto la tuga, e si darebbe la colpa
 * all'ombra.
 *
 * E' la stessa regola che `ordinate.js` si da' gia' in testa al file: la
 * superficie e il tappo passano dalla STESSA funzione. Qui la regola attraversa
 * due linguaggi, quindi passa da un file.
 *
 * ─── UNITA'
 *
 * Esce in unita' di scena, dove 1 = 2,5 m, perche' e' l'unita' in cui la curva
 * e' scritta. La conversione in metri la fa Blender, che e' anche l'unico posto
 * dove i metri servono (glTF li impone).
 */
import { writeFileSync } from 'node:fs'
import { PRUA_Z, POPPA_Z, sezioneA, tDaZ } from '../src/scafo/ordinate.js'
import { TUGA } from '../src/scena/nave.js'

const FUORI = process.argv[2] ?? 'coperta.json'
const STAZIONI = 41

const punti = []
for (let i = 0; i < STAZIONI; i++) {
  const t = i / (STAZIONI - 1)
  const z = PRUA_Z + t * (POPPA_Z - PRUA_Z)
  const s = sezioneA(tDaZ(z))
  punti.push({ z: +z.toFixed(5), semilarg: +s.semilarg.toFixed(5), ponteY: +s.ponteY.toFixed(5) })
}

const dati = {
  commento: 'Generato da strumenti/esporta-coperta.mjs. NON modificare a mano: ' +
            'la fonte e\' src/scafo/ordinate.js.',
  unita: 'unita di scena, 1 = 2,5 m',
  metriPerUnita: 2.5,
  pruaZ: PRUA_Z,
  poppaZ: POPPA_Z,
  punti,
  /**
   * LA TUGA DEL PONTE PRINCIPALE resta costruita nel sito, non in Blender, e
   * non e' pigrizia: dentro ha un'APERTURA VERA — fra la fascia bassa e quella
   * alta non c'e' niente — ed e' attraverso quel buco che si vedono il salone e
   * l'orizzonte. E' la regola del sito: cio' che e' diagramma si costruisce,
   * cio' che e' fotografia si guarda attraverso un'apertura. Un vetro scuro
   * modellato la chiuderebbe.
   *
   * Quindi Blender costruisce cio' che sta SOPRA, e ha bisogno di sapere dove
   * finisce questa. Il tetto e' inclinato col cavallino, quindi si passano le
   * sue due estremita' e non una quota media.
   */
  tuga: {
    z: TUGA.z,
    lung: TUGA.lung,
    alt: TUGA.alt,
    tettoProra: sezioneA(tDaZ(TUGA.z - TUGA.lung / 2)).ponteY + TUGA.alt,
    tettoPoppa: sezioneA(tDaZ(TUGA.z + TUGA.lung / 2)).ponteY + TUGA.alt,
    semilargh: sezioneA(tDaZ(TUGA.z)).semilarg * TUGA.fattoreLarghezza
  }
}

writeFileSync(FUORI, JSON.stringify(dati, null, 1) + '\n')

const p = punti
const cav = p[0].ponteY - p[p.length - 1].ponteY
console.log(`${FUORI}: ${p.length} stazioni`)
console.log(`  ponte da ${p[p.length - 1].ponteY.toFixed(3)} a poppa a ${p[0].ponteY.toFixed(3)} a prua`)
console.log(`  cavallino ${(cav * 2.5 * 100).toFixed(0)} cm su ${((POPPA_Z - PRUA_Z) * 2.5).toFixed(0)} m`)
console.log(`  baglio massimo ${(Math.max(...p.map(q => q.semilarg)) * 2 * 2.5).toFixed(2)} m`)
