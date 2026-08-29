import { Group } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

/**
 * LE DUE MACCHINE DELL'ATTO DUE — propulsione e giroscopio.
 *
 * ─── PERCHE' SONO IN UN FILE SOLO, e non uno per macchina
 *
 * Perche' fanno la stessa cosa: si caricano da un GLB, si convalidano contro i
 * nomi dichiarati, e girano leggendo UNO stato. Due file identici al 90%
 * divergono -- e' gia' successo in questo repo con due liste di battute, e la
 * cura fu la stessa: una sola sorgente.
 *
 * ─── COSA GIRA, E DA DOVE PRENDE IL NUMERO
 *
 * `S.giriPropulsione` va da 0 a 1 ed e' l'uscita di `dinamicaPropulsione()`.
 * Albero ed elica ci girano insieme, e sono FRATELLI nel file, non annidati:
 * il costruttore l'ha dichiarato apposta, perche' annidandoli l'elica
 * prenderebbe il doppio dei giri.
 *
 * **Non c'e' nessuna animazione preparata.** Se il motore rallenta, rallentano
 * perche' rallenta il numero: e' la stessa regola per cui le pinne non sanno
 * che la propulsione si e' spenta.
 *
 * ─── DOVE STANNO, E PERCHE' PROPRIO LI'
 *
 * I due GLB sono in METRI (lo dichiarano in `authoringUnit`), la scena e' in
 * unita' da 2,5 m -- `ordinate.js` mette PRUA_Z a -8 e POPPA_Z a +8 per una
 * nave da 40 m. Quindi la conversione e' 1/2,5 = 0,4, la stessa di
 * `impianto.glb`, e non e' un numero scelto: e' il rapporto fra due unita'
 * dichiarate.
 *
 * La collocazione segue la nave, non il gusto: la linea d'assi sta sulla
 * mezzeria e a poppavia, il giroscopio sta basso e verso il centro di
 * gravita', perche' e' li' che una massa rotante serve. Sono le posizioni che
 * un cantiere userebbe, e restano DICHIARATE come approssimazioni finche'
 * qualcuno non guarda il provino: `docs/13` §6 dice che gli spazi dell'atto due
 * vanno costruiti nello stesso riferimento metrico, e questo e' il primo passo.
 */
const M_PER_UNITA = 2.5
const A_UNITA = 1 / M_PER_UNITA

/** I nomi sono il contratto, e non si rinominano senza rifare il cancello. */
const RICHIESTI_PROP = ['prop_albero', 'prop_elica']
const RICHIESTI_GYRO = ['gyro_rotore']

/**
 * Quanti giri al secondo fa l'albero a propulsione piena.
 *
 * **E' UNA SCELTA DI MESSA IN SCENA, e va detto.** Un albero vero a 12 nodi
 * gira sui 3-4 giri al secondo, e a 60 fotogrammi al secondo un'elica a quella
 * velocita' produce un aliasing che la fa sembrare ferma o che la fa girare al
 * contrario -- e' la ruota del carro nei film, e su uno schermo si legge come
 * un difetto invece che come velocita'.
 *
 * 1,1 giri al secondo e' la velocita' piu' alta che a 60 Hz resta LEGGIBILE
 * come rotazione in avanti (poco piu' di sei gradi per fotogramma su una pala
 * a cinque). Non e' la velocita' vera e questo commento e' il posto in cui non
 * fingere che lo sia.
 */
const GIRI_AL_SECONDO = 1.1

function carica (base, file, richiesti) {
  return new Promise((risolvi, rifiuta) => {
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(base + 'modelli/' + file, (glb) => {
      const radice = glb.scene
      const nodi = {}
      radice.traverse(o => { if (o.name) nodi[o.name] = o })
      const mancanti = richiesti.filter(n => !nodi[n])
      if (mancanti.length) {
        rifiuta(new Error(`${file}: mancano i nodi ${mancanti.join(', ')}. I nomi sono il contratto.`))
        return
      }
      /**
       * L'unita' si LEGGE dal file e non si assume. Un modello esportato in
       * centimetri entrerebbe grande 250 volte, e la cosa peggiore e' che non
       * darebbe nessun errore: si vedrebbe come una nave dentro un motore.
       */
      const extra = Object.values(nodi).map(n => n.userData).find(u => u && u.authoringUnit)
      if (extra && extra.authoringUnit !== 'meter') {
        rifiuta(new Error(`${file}: authoringUnit e' "${extra.authoringUnit}", non "meter": la conversione 0,4 non vale.`))
        return
      }
      radice.scale.setScalar(A_UNITA)
      risolvi({ radice, nodi, extra: extra || {} })
    }, undefined, rifiuta)
  })
}

export function creaMacchine (base, { applicaMateria } = {}) {
  const gruppo = new Group()
  let prop = null
  let gyro = null
  let fase = 0

  const caricate = Promise.all([
    carica(base, 'propulsione.glb', RICHIESTI_PROP),
    carica(base, 'giroscopio.glb', RICHIESTI_GYRO)
  ]).then(([p, g]) => {
    prop = p
    gyro = g
    /* la linea d'assi: mezzeria, a poppavia, sotto il galleggiamento */
    p.radice.position.set(0, -0.62, 2.6)
    /* il giroscopio: basso e verso il centro, dove una massa rotante lavora */
    g.radice.position.set(0, -0.55, 0.2)
    gruppo.add(p.radice, g.radice)
    applicaMateria?.(gruppo)
    return { prop, gyro }
  })

  /**
   * Un passo. `dt` in secondi, `S` lo stato della simulazione.
   *
   * La fase si ACCUMULA invece di ricavarsi dal tempo assoluto: cosi' quando i
   * giri cambiano la rotazione non salta. Ricavandola da `t * giri` un
   * rallentamento farebbe indietreggiare l'elica, ed e' il genere di difetto
   * che si legge come rotto invece che come lento.
   */
  function gira (S, dt) {
    if (!prop) return
    fase += (S.giriPropulsione || 0) * GIRI_AL_SECONDO * dt * Math.PI * 2
    prop.nodi.prop_albero.rotation.z = fase
    prop.nodi.prop_elica.rotation.z = fase
  }

  return { gruppo, gira, caricate, get pronto () { return !!prop } }
}
