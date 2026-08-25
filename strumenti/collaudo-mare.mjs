import { costruisciAcqua } from '../src/scena/acqua.js'

/**
 * COLLAUDO DEL MARE — un solo controllo, e vale tutto il file.
 *
 * L'OBIETTIVO NON DEVE MAI FINIRE SOTT'ACQUA.
 *
 * La camera sta a quota zero: e' l'invariante da cui discende la giunzione a
 * zero pixel fra fondo CSS e disegno, cioe' l'unica idea meccanica del sito.
 * La superficie del mare oscilla attorno a quella stessa quota, e per mesi le
 * creste le sono passate sopra: a mare 5 salivano a +0,30. Quando succedeva,
 * la meta' chiara del fotogramma diventava (28,29,29) invece di (233,229,221)
 * e la linea spariva.
 *
 * NON L'HA VISTO NESSUNO, e il motivo e' istruttivo: va e viene col periodo
 * dell'onda. Da fermo, venti campioni a un secondo davano `##...###..##..##...#`.
 * Uno scatto solo lo prende una volta su due, e un fotogramma nero si legge
 * come "quella battuta e' scura" invece che come un difetto. Due revisori
 * esterni ci sono passati sopra.
 *
 * Per questo il controllo e' qui e non nell'occhio: si spazza il tempo, lo
 * stato del mare e tutte le posizioni che la camera puo' assumere, e si chiede
 * che la superficie resti SOTTO l'obiettivo. Sempre, non quasi sempre.
 */

let guasti = 0
const esito = (ok, testo) => {
  console.log('  ' + (ok ? 'OK   ' : 'ROTTO') + '  ' + testo)
  if (!ok) guasti++
}

const acqua = costruisciAcqua()
const pelo = acqua.gruppo.children[0]
const pos = pelo.geometry.attributes.position.array

/**
 * La quota piu' alta della superficie entro `r` unita' dall'obiettivo.
 *
 * PERCHE' 1,6 E NON "OVUNQUE". Un'onda che sporge sopra la quota zero a venti
 * unita' di distanza NON e' un difetto: e' il mare. Sta 0,86 gradi sopra la
 * linea e la sfrangia, che e' esattamente cio' che rende un mare un mare.
 * Il difetto e' l'acqua ADDOSSO all'obiettivo, quella che lo sommerge.
 *
 * 1,6 unita' sono poco meno di tre celle della maglia (46/76 = 0,605): la
 * distanza entro cui un vertice puo' trovarsi davvero fra l'obiettivo e il
 * piano di taglio vicino. Piu' stretto non misurerebbe niente, piu' largo
 * boccerebbe il mare invece del difetto.
 */
function quotaVicina (camX, camZ, r = 1.6) {
  let max = -Infinity
  for (let k = 0; k < pos.length; k += 3) {
    const dx = pos[k] - camX, dz = pos[k + 2] - camZ
    if (dx * dx + dz * dz > r * r) continue
    if (pos[k + 1] > max) max = pos[k + 1]
  }
  return max
}

console.log('\nL OBIETTIVO NON DEVE MAI FINIRE SOTT ACQUA')
{
  // tutte le posizioni che la camera assume davvero: veduta larga e sezione,
  // per tutta l escursione dell azimut che l utente puo comandare
  const posti = []
  for (const raggio of [19.5, 13.0, 7.2]) {
    for (let az = -0.92; az <= 0.921; az += 0.23) {
      posti.push([Math.sin(az) * raggio, Math.cos(az) * raggio, raggio, az])
    }
  }
  let peggio = -Infinity, dove = ''
  let frame = 0
  for (const mare of [0, 1, 2, 3, 4, 5]) {
    for (let t = 0; t < 40; t += 0.25) {
      for (const [x, z, raggio, az] of posti) {
        acqua.anima(t, mare, frame++, x, z)
        const q = quotaVicina(x, z)
        if (q > peggio) { peggio = q; dove = `mare ${mare}, t=${t.toFixed(2)}, raggio ${raggio}, azimut ${az.toFixed(2)}` }
      }
    }
  }
  console.log('         quota massima della superficie accanto all obiettivo: ' + peggio.toFixed(4))
  console.log('         nel caso peggiore: ' + dove)
  esito(peggio < -0.01, 'la superficie resta sotto l obiettivo di ' + (-peggio).toFixed(3) + ' unita  (minimo 0,01)')
}

/**
 * E LA ZONA CALMA NON DEVE MANGIARSI IL MARE.
 *
 * Spegnere l'onda attorno all'obiettivo risolve il difetto, ma se il raggio
 * cresce senza che nessuno se ne accorga il mare diventa una piastra ferma e
 * lo stato del mare smette di leggersi. Il moto va misurato DOVE SI GUARDA:
 * attorno alla nave, non attorno alla camera.
 */
console.log('\nMA IL MARE ATTORNO ALLA NAVE DEVE ANCORA MUOVERSI')
{
  const camX = Math.sin(0.34) * 19.5, camZ = Math.cos(0.34) * 19.5
  let frame = 0
  const escursione = (mare) => {
    let min = Infinity, max = -Infinity
    for (let t = 0; t < 24; t += 0.5) {
      acqua.anima(t, mare, frame++, camX, camZ)
      for (let k = 0; k < pos.length; k += 3) {
        // solo la fascia che circonda lo scafo, che e' cio che si guarda
        const d = Math.hypot(pos[k], pos[k + 2])
        if (d > 9) continue
        if (pos[k + 1] < min) min = pos[k + 1]
        if (pos[k + 1] > max) max = pos[k + 1]
      }
    }
    return max - min
  }
  const e0 = escursione(0), e3 = escursione(3), e5 = escursione(5)
  console.log(`         escursione attorno allo scafo: mare 0 = ${e0.toFixed(3)}, mare 3 = ${e3.toFixed(3)}, mare 5 = ${e5.toFixed(3)}`)
  esito(e5 > 0.25, 'col mare grosso lo scafo e circondato da onde vere (' + e5.toFixed(3) + ', minimo 0,25)')
  esito(e5 > e3 && e3 > e0, 'e l escursione cresce con lo stato del mare')
}

console.log('\n' + (guasti === 0 ? 'TUTTO A POSTO' : guasti + ' CONTROLLI ROTTI') + '\n')
process.exit(guasti === 0 ? 0 : 1)
