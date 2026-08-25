import { creaSimulazione, AMPIEZZA_MARE, V_RIF, autorita, portanza, riduzioneVera, _costanti }
  from '../src/scena/simulazione.js'

/**
 * COLLAUDO DEL ROLLIO.
 *
 * Non stampa una relazione: **esce con errore**. Uno strumento che in silenzio
 * produce un risultato sbagliato e' peggio del numero scritto a mano, perche'
 * quello almeno si vede.
 *
 * Le quattro cose che deve impedire:
 *   1. che l'integratore diverga
 *   2. che la riduzione sia COSTANTE a ogni stato del mare (firma di un
 *      sistema lineare: cinque numeri uguali leggono come un dato inventato)
 *   3. che a nave ferma le pinne funzionino lo stesso
 *   4. che la taratura si sposti senza che nessuno se ne accorga
 */

let guasti = 0
const esito = (ok, testo) => {
  console.log(`  ${ok ? 'OK  ' : 'ROTTO'}  ${testo}`)
  if (!ok) guasti++
}

/** Fa girare la simulazione per N secondi a passo fisso e restituisce lo stato. */
function corri ({ mare, stab, velocita, secondi, hz }) {
  const sim = creaSimulazione({})
  sim.S.mare = mare; sim.S.stab = stab; sim.S.velocita = velocita
  const dt = 1 / hz
  const n = Math.round(secondi * hz)
  let maxAssoluto = 0
  for (let i = 0; i < n; i++) {
    sim.passo(dt, i * dt)
    if (Math.abs(sim.S.rollio) > maxAssoluto) maxAssoluto = Math.abs(sim.S.rollio)
    if (!Number.isFinite(sim.S.rollio)) return { divergente: true, maxAssoluto }
  }
  return { picco: sim.S.picco, riduzione: sim.S.riduzione, maxAssoluto, divergente: false }
}

console.log('\nSTABILITA\' DELL\'INTEGRATORE — 20 minuti simulati, mare 5, sistema acceso')
for (const hz of [20, 30, 60, 120]) {
  const r = corri({ mare: 5, stab: true, velocita: V_RIF, secondi: 1200, hz })
  esito(!r.divergente && r.maxAssoluto < 90,
    `${String(hz).padStart(3)} Hz — picco assoluto ${r.maxAssoluto.toFixed(1)}째` +
    (r.divergente ? '  DIVERGE' : ''))
}

console.log('\nTARATURA — la carena nuda deve dare le ampiezze nominali')
{
  const errori = []
  for (let m = 1; m <= 5; m++) {
    const r = corri({ mare: m, stab: false, velocita: V_RIF, secondi: 600, hz: 60 })
    // Si confronta col MASSIMO DI LUNGA CORSA, non col picco a 10 s: l'ampiezza
    // nominale e' una proprieta' dello stato del mare, la lettura a schermo e'
    // un campione vivo di quella. Confrontarle era mettere insieme due metri.
    const atteso = AMPIEZZA_MARE[m]
    const scarto = Math.abs(r.maxAssoluto - atteso) / atteso
    errori.push(scarto)
    console.log(`         mare ${m}: nuda ${r.maxAssoluto.toFixed(1)}째  (nominale ${atteso.toFixed(1)}째, scarto ${(100 * scarto).toFixed(0)}%)`)
  }
  const peggio = Math.max(...errori)
  esito(peggio < 0.30, `scarto massimo dalla nominale ${(100 * peggio).toFixed(0)}%  (tetto 30%)`)
}

console.log('\nLA RIDUZIONE DEVE VARIARE COL MARE — se e\' costante, il modello e\' lineare')
{
  const rid = []
  for (let m = 1; m <= 5; m++) {
    const r = corri({ mare: m, stab: true, velocita: V_RIF, secondi: 240, hz: 60 })
    rid.push(r.riduzione)
    console.log(`         mare ${m}: riduzione ${(100 * r.riduzione).toFixed(1)}%`)
  }
  const campo = Math.max(...rid) - Math.min(...rid)
  esito(campo > 0.02, `escursione fra mare 1 e mare 5: ${(100 * campo).toFixed(1)} punti  (minimo 2)`)
  esito(Math.max(...rid) < 0.95, `riduzione massima ${(100 * Math.max(...rid)).toFixed(1)}%  (tetto 95: oltre e\' militare)`)
}

console.log('\nLA VELOCITA\' COMANDA — una pinna ferma non produce portanza')
{
  const prove = []
  for (const v of [0, 3, 6, 12, 20]) {
    const r = corri({ mare: 4, stab: true, velocita: v, secondi: 240, hz: 60 })
    prove.push({ v, rid: r.riduzione })
    console.log(`         ${String(v).padStart(2)} nodi: riduzione ${(100 * r.riduzione).toFixed(1)}%`)
  }
  esito(prove[0].rid < 0.005, `a nave ferma la riduzione e\' ${(100 * prove[0].rid).toFixed(2)}%  (deve essere zero)`)
  esito(prove[1].rid < prove[3].rid, 'a 3 nodi la riduzione e\' minore che a 12')
  esito(prove[3].rid > 0.5, `a velocita\' di servizio la riduzione e\' ${(100 * prove[3].rid).toFixed(0)}%  (minimo 50)`)
}

console.log('\nLO STALLO — oltre i 20째 la portanza deve CALARE, non essere tagliata')
{
  const g = d => portanza(d * Math.PI / 180) * 180 / Math.PI
  console.log(`         10째 -> ${g(10).toFixed(1)}   20째 -> ${g(20).toFixed(1)}   23째 -> ${g(23).toFixed(1)}   25째 -> ${g(25).toFixed(1)}`)
  esito(Math.abs(g(10) - 10) < 0.01, 'sotto lo stallo la portanza vale esattamente l\'incidenza')
  esito(g(25) < g(20), `a fondo corsa la portanza e\' scesa a ${(100 * g(25) / g(20)).toFixed(0)}% del picco`)
}

console.log('\nIL PERCORSO A MOVIMENTO RIDOTTO deve dare lo stesso numero di quello vivo')
{
  const aut = autorita(V_RIF)
  const stimata = riduzioneVera(4, V_RIF)
  const misurata = corri({ mare: 4, stab: true, velocita: V_RIF, secondi: 240, hz: 60 }).riduzione
  const scarto = Math.abs(stimata - misurata)
  console.log(`         stimata ${(100 * stimata).toFixed(1)}%   misurata ${(100 * misurata).toFixed(1)}%`)
  esito(scarto < 0.06, `scarto ${(100 * scarto).toFixed(1)} punti  (tetto 6)`)
}

console.log('\nDUE VISITE NON DANNO LO STESSO NUMERO — le fasi sono estratte')
{
  const a = corri({ mare: 4, stab: true, velocita: V_RIF, secondi: 240, hz: 60 }).riduzione
  const b = corri({ mare: 4, stab: true, velocita: V_RIF, secondi: 240, hz: 60 }).riduzione
  console.log(`         corsa A ${(100 * a).toFixed(2)}%   corsa B ${(100 * b).toFixed(2)}%`)
  esito(Math.abs(a - b) > 1e-6, 'le due corse differiscono: le fasi sono davvero casuali')
  esito(Math.abs(a - b) < 0.10, `ma non troppo: scarto ${(100 * Math.abs(a - b)).toFixed(1)} punti (tetto 10)`)
}

console.log(`\n${guasti === 0 ? 'TUTTO A POSTO' : guasti + ' CONTROLLI ROTTI'}\n`)
process.exit(guasti === 0 ? 0 : 1)
