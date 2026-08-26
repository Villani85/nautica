import { Group, MathUtils } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * L'IMPIANTO — il modello vero, comandato dalla simulazione.
 *
 * Specifica: `docs/14-FOTOREALISMO.md`. Questo file fa le quattro cose che il
 * §2 gli assegna, e nessuna di piu':
 *
 *   1. carica il GLB;
 *   2. applica la conversione di scala al nodo radice;
 *   3. trova i nodi nominati;
 *   4. assegna loro le trasformazioni che vengono dalla simulazione.
 *
 * **Non ricostruisce niente.** Motore, riduttore, albero e pinna sono geometria
 * che arriva dal file: c'e' una sola fonte geometrica, e non si tengono due
 * modelli con un collaudo che tenta di allinearli.
 *
 * ─── LA SCALA E' UNA CONVERSIONE, NON UNA CORREZIONE A OCCHIO
 *
 * Il GLB e' in METRI, perche' la specifica glTF lo impone. La scena nautica
 * interpreta una sua unita' come 2,5 m. Quindi 1/2,5 = 0,4, e quel numero non
 * si tara guardando lo schermo: se il modello sembra sbagliato si cambia il
 * modello, non questa costante. Il §12 lo vieta esplicitamente — «nessuna scala
 * scelta guardando lo schermo».
 *
 * ─── I NOMI DEI NODI SONO UN'API
 *
 * Se un nodo manca, il caricamento fallisce **in modo visibile**: meglio una
 * scena che non parte di una che parte muovendo la cosa sbagliata. E' lo stesso
 * principio dei cancelli — un difetto che non si annuncia e' peggio di uno che
 * ferma tutto.
 */

const METRI_PER_UNITA = 2.5
const UNITA_PER_METRO = 1 / METRI_PER_UNITA     // 0,4

/** §2.1 — il contratto. Questi nomi non si rinominano. */
const RICHIESTI = [
  'STATIC_FOUNDATION', 'STATIC_HULL_PLATE', 'STATIC_SEAL', 'STATIC_MOTOR',
  'HOUSING_FIXED', 'HOUSING_REMOVABLE', 'HOUSING_SECTION',
  'RIG_INPUT', 'RIG_ECCENTRIC', 'RIG_CYCLO_A', 'RIG_CYCLO_B',
  'RIG_OUTPUT', 'RIG_SHAFT', 'RIG_FIN'
]

/**
 * §3.2 — il rapporto e l'eccentricita' vengono dal GLB, non da qui.
 * Sono proprieta' del modello: leggerle da `extras` invece di riscriverle
 * significa che cambiando il modello non resta un numero vecchio in un file JS
 * a raccontare un'altra macchina.
 */
const RAPPORTO_DI_SCORTA = 29
const ECCENTRICITA_DI_SCORTA = 0.012

export function creaImpianto (base) {
  const gruppo = new Group()
  const nodi = {}
  let rapporto = RAPPORTO_DI_SCORTA
  let eccentricita = ECCENTRICITA_DI_SCORTA
  let pronto = false

  const caricato = new Promise((risolvi, rifiuta) => {
    new GLTFLoader().load(base + 'modelli/impianto.glb', (glb) => {
      const radice = glb.scene
      radice.updateMatrixWorld(true)
      radice.traverse(o => { if (o.name) nodi[o.name] = o })

      const mancanti = RICHIESTI.filter(n => !nodi[n])
      if (mancanti.length) {
        rifiuta(new Error(
          `impianto.glb: mancano i nodi ${mancanti.join(', ')}. ` +
          'I nomi sono il contratto di docs/14 §2.1 e non si rinominano.'))
        return
      }

      const extra = nodi.IMPIANTO?.userData ?? {}
      if (extra.authoringUnit && extra.authoringUnit !== 'meter') {
        rifiuta(new Error(
          `impianto.glb: authoringUnit e' "${extra.authoringUnit}", non "meter". ` +
          'La conversione 0,4 vale solo per un modello in metri.'))
        return
      }
      if (typeof extra.gearRatio === 'number') rapporto = extra.gearRatio

      /**
       * L'eccentricita' si MISURA dal modello invece di riscriverla: e' lo
       * spostamento del disco rispetto all'asse, e il modello ce l'ha gia'
       * dentro. Un numero copiato a mano da un file all'altro e' un numero che
       * un giorno divergera' in silenzio.
       */
      const disco = nodi.RIG_CYCLO_A?.children?.[0]
      if (disco) {
        disco.geometry?.computeBoundingSphere?.()
        const c = disco.geometry?.boundingSphere?.center
        if (c) eccentricita = Math.hypot(c.y, c.z) || ECCENTRICITA_DI_SCORTA
      }

      radice.scale.setScalar(UNITA_PER_METRO)
      gruppo.add(radice)
      pronto = true
      risolvi({ nodi, rapporto, eccentricita })
    }, undefined, rifiuta)
  })

  /**
   * ─── IL MOVIMENTO VIENE DALLA FISICA, NON DA UN'ANIMAZIONE
   *
   * `S.pinna` e' l'angolo autoritativo dell'uscita, gia' in radianti. Tutto il
   * resto discende da li' con la cinematica vera del riduttore: l'ingresso gira
   * `rapporto` volte piu' in fretta e nel verso opposto, i dischi orbitano
   * sfasati di 180 gradi.
   *
   * Si usa l'angolo ASSOLUTO e non l'integrazione di `S.pinnaVel`: una velocita'
   * non e' un angolo, e integrarla accumula deriva. Con l'angolo assoluto la
   * posa e' sempre riconciliata con lo stato vero, anche rientrando nella scena.
   */
  function aggiorna (S) {
    if (!pronto) return
    const uscita = S.pinna
    const ingresso = -rapporto * uscita

    nodi.RIG_FIN.rotation.x = uscita
    nodi.RIG_SHAFT.rotation.x = uscita
    nodi.RIG_OUTPUT.rotation.x = uscita
    nodi.RIG_INPUT.rotation.x = ingresso

    // i dischi ORBITANO — e' il movimento che rende visibile la catena — e
    // contro-ruotano piano con l'uscita
    const e = eccentricita
    nodi.RIG_CYCLO_A.position.set(0, e * Math.cos(ingresso), e * Math.sin(ingresso))
    nodi.RIG_CYCLO_B.position.set(0, e * Math.cos(ingresso + Math.PI), e * Math.sin(ingresso + Math.PI))
    nodi.RIG_CYCLO_A.rotation.x = uscita
    nodi.RIG_CYCLO_B.rotation.x = uscita
  }

  /** §4.2 — il coperchio si allontana lungo la normale del taglio. */
  function apri (quanto) {
    if (!pronto) return
    const q = MathUtils.clamp(quanto, 0, 1)
    nodi.HOUSING_REMOVABLE.position.y = -q * 0.9
    nodi.HOUSING_REMOVABLE.visible = q < 0.999
  }

  return { gruppo, caricato, aggiorna, apri, get pronto () { return pronto } }
}
