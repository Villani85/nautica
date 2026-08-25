import { costruisciGuscio, tappoA, contornoA, sezioneA, tDaZ, PRUA_Z, POPPA_Z } from '../src/scafo/ordinate.js'

const g = costruisciGuscio(64)
const p = g.attributes.position.array
const tri = g.index.count / 3
let xm=[1e9,-1e9], ym=[1e9,-1e9], zm=[1e9,-1e9]
for (let i=0;i<p.length;i+=3){
  xm[0]=Math.min(xm[0],p[i]); xm[1]=Math.max(xm[1],p[i])
  ym[0]=Math.min(ym[0],p[i+1]); ym[1]=Math.max(ym[1],p[i+1])
  zm[0]=Math.min(zm[0],p[i+2]); zm[1]=Math.max(zm[1],p[i+2])
}
const M = 2.5
console.log('GUSCIO')
console.log('  vertici        ' + g.attributes.position.count)
console.log('  triangoli      ' + tri)
console.log('  lunghezza      ' + ((zm[1]-zm[0])*M).toFixed(2) + ' m')
console.log('  baglio         ' + ((xm[1]-xm[0])*M).toFixed(2) + ' m')
console.log('  altezza        ' + ((ym[1]-ym[0])*M).toFixed(2) + ' m   (chiglia ' + (ym[0]*M).toFixed(2) + ', ponte ' + (ym[1]*M).toFixed(2) + ')')

// NaN / infiniti
const rotti = [...p].filter(v => !Number.isFinite(v)).length
console.log('  valori non finiti: ' + rotti)

// ── LA PROVA CHE CONTA ────────────────────────────────────────────
// Il tappo a una quota qualsiasi deve avere i vertici ESATTAMENTE sul
// contorno che genera la superficie. Se un giorno qualcuno scrive una
// seconda interpolazione, questa prova fallisce invece di produrre
// una scheggia silenziosa.
console.log('')
console.log('TAPPO CONTRO SUPERFICIE — scarto massimo per quota')
let peggio = 0
for (const z of [-7.5, -5, -2.4, 0, 1.7, 4, 6.3, 7.9]) {
  const c = contornoA(tDaZ(z))
  const tg = tappoA(z)
  const tp = tg.attributes.position.array
  // ogni vertice del tappo deve coincidere con un punto del contorno
  let max = 0
  for (let i=0;i<tp.length;i+=3){
    let d = 1e9
    for (const [x,y] of c) d = Math.min(d, Math.hypot(tp[i]-x, tp[i+1]-y))
    max = Math.max(max, d)
    if (Math.abs(tp[i+2]-z) > 1e-6) { console.log('  QUOTA SBAGLIATA a z='+z); }
  }
  peggio = Math.max(peggio, max)
  console.log('  z=' + String(z).padStart(5) + '  scarto ' + max.toExponential(2))
}
console.log('  peggiore assoluto: ' + peggio.toExponential(2) + (peggio < 1e-6 ? '  → coincidenza entro la precisione float32' : '  → DIVERGONO'))

// nessuna sezione degenere lungo tutta la lunghezza
let ok = true
for (let t=0;t<=1;t+=0.002){
  const s = sezioneA(t)
  if (!(s.semilarg>0 && s.spigoloX<=s.semilarg+1e-9 && s.chiglia<s.spigoloY && s.ponteY>0)) { ok=false; console.log('DEGENERE t='+t) }
}
console.log('')
console.log('501 sezioni campionate: ' + (ok ? 'nessuna degenere' : 'ERRORE'))
