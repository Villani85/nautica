import { costruisciGuscio, costruisciPonte } from '../src/scafo/ordinate.js'

/**
 * COLLAUDO DELLE NORMALI DELLO SCAFO — quale faccia guarda fuori.
 *
 *     node strumenti/collaudo-normali.mjs
 *
 * PERCHE' ESISTE, e l'ha trovato il committente in tre parole: «stiamo parlando
 * di yacht».
 *
 * Guardando la nave, la meta' poppiera del fianco era **nera**, con il colore
 * esatto di `materiali.interno`. Lo scafo si disegna due volte — la faccia
 * esterna con `materiali.scafo` in FrontSide, quella interna con
 * `materiali.interno` in BackSide, perche' dentro una carena e' buio — quindi
 * un pezzo che appare nero da fuori vuol dire una cosa sola: **li' le normali
 * sono rovesciate**, e si sta vedendo la faccia interna.
 *
 * Non e' un difetto di resa. Meta' yacht renderizzata al rovescio legge come
 * una chiatta con una stiva aperta, ed e' quello che si vedeva: nessuna texture
 * e nessun ambiente salva una faccia girata dalla parte sbagliata.
 *
 * ─── PERCHE' NON L'AVEVA PRESO NESSUNO
 *
 * Una normale rovesciata **non da' errore**. La geometria e' valida, il loft
 * chiude, `collaudo-scafo.mjs` verifica che il tappo della sezione combaci con
 * la superficie a otto quote — e combacia, perche' le posizioni sono giuste. E'
 * solo l'ORIENTAMENTO a essere sbagliato, e nessun controllo lo guardava.
 *
 * Lo stesso difetto era gia' stato trovato una volta sul ponte, a occhio
 * («le normali del ponte puntavano in giu'»). Trovato due volte a occhio
 * significa che serviva un cancello.
 *
 * ─── COME SI MISURA
 *
 * Una carena e' un tubo attorno all'asse di lunghezza. Per ogni triangolo si
 * confronta la normale con la direzione che va **dall'asse verso il baricentro
 * del triangolo**: se il prodotto scalare e' positivo la faccia guarda fuori.
 *
 * I triangoli quasi orizzontali — fondo e ponte — non hanno una direzione
 * radiale sensata, quindi si giudicano sulla componente verticale: il fondo
 * guarda in giu', il ponte in su'.
 */

function triangoli (geo) {
  const pos = geo.attributes.position.array
  const idx = geo.index ? geo.index.array : null
  const n = idx ? idx.length / 3 : pos.length / 9
  const out = []
  for (let f = 0; f < n; f++) {
    const i = idx ? [idx[f * 3], idx[f * 3 + 1], idx[f * 3 + 2]] : [f * 3, f * 3 + 1, f * 3 + 2]
    const p = i.map(k => [pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2]])
    const u = [p[1][0] - p[0][0], p[1][1] - p[0][1], p[1][2] - p[0][2]]
    const v = [p[2][0] - p[0][0], p[2][1] - p[0][1], p[2][2] - p[0][2]]
    const nor = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
    const l = Math.hypot(...nor)
    if (l < 1e-9) continue
    const centro = [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3, (p[0][2] + p[1][2] + p[2][2]) / 3]
    out.push({ n: nor.map(x => x / l), c: centro, area: l / 2 })
  }
  return out
}

let rotto = false

console.log('\nLO SCAFO: OGNI FACCIA DEVE GUARDARE FUORI')
{
  const tri = triangoli(costruisciGuscio(72))
  let dentro = 0, areaDentro = 0, areaTot = 0
  let peggioZ = null
  for (const t of tri) {
    areaTot += t.area
    // direzione radiale nel piano della sezione: dall'asse (0, y_asse, z) al centro
    const rx = t.c[0], ry = t.c[1] + 0.35   // l'asse del tubo sta poco sotto il galleggiamento
    const lr = Math.hypot(rx, ry)
    const orizzontale = lr > 0.25
    const fuori = orizzontale
      ? (t.n[0] * rx + t.n[1] * ry) / lr
      : (t.c[1] < 0 ? -t.n[1] : t.n[1])
    if (fuori < -0.15) {
      dentro++; areaDentro += t.area
      if (!peggioZ || t.area > peggioZ.area) peggioZ = t
    }
  }
  const perc = 100 * areaDentro / areaTot
  console.log(`         ${tri.length} triangoli · ${dentro} girati al rovescio · ${perc.toFixed(1)}% dell'area`)
  if (peggioZ) {
    console.log(`         il piu' grande e' a z = ${peggioZ.c[2].toFixed(2)} (prua -8, poppa +8), y = ${peggioZ.c[1].toFixed(2)}`)
  }
  if (perc > 2) {
    console.error(`  ROTTO  il ${perc.toFixed(1)}% dello scafo guarda dentro: da fuori si vede il materiale
         dell'interno, che e' quasi nero, e mezza nave legge come una stiva aperta.`)
    rotto = true
  } else {
    console.log('  OK     lo scafo guarda fuori')
  }
}

console.log('\nE IL PONTE DEVE GUARDARE IN SU')
{
  const tri = triangoli(costruisciPonte(72))
  let giu = 0, area = 0, tot = 0
  for (const t of tri) {
    tot += t.area
    if (t.n[1] < 0) { giu++; area += t.area }
  }
  const perc = 100 * area / tot
  console.log(`         ${tri.length} triangoli · ${giu} rivolti in giu' · ${perc.toFixed(1)}% dell'area`)
  if (perc > 2) {
    console.error('  ROTTO  il ponte e\' illuminato da sotto: e\' il difetto gia\' trovato una volta a occhio.')
    rotto = true
  } else {
    console.log('  OK     il ponte guarda in su')
  }
}

console.log()
if (rotto) { console.error('  LE NORMALI NON REGGONO.\n'); process.exit(1) }
console.log('  TUTTO A POSTO\n')
