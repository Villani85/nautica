import { costruisciGuscio, tappoA, contornoA, contornoInternoA, sezioneA, tDaZ, PRUA_Z, POPPA_Z } from '../src/scafo/ordinate.js'

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
  const d = contornoInternoA(tDaZ(z))
  const tg = tappoA(z)
  const tp = tg.attributes.position.array
  /**
   * Da quando il tappo e' un ANELLO, i suoi vertici stanno su due bordi: quello
   * esterno, che DEVE coincidere con la superficie, e quello interno, che deve
   * starne discosto della parete.
   *
   * La prima stesura di questo controllo confrontava tutti i vertici col solo
   * contorno esterno, e dopo l'anello segnalava uno scarto di 4,50e-2 — cioe'
   * esattamente lo spessore della parete. Il metro non era rotto: misurava la
   * cosa giusta rispetto a un'aspettativa che si era spostata. Ora ogni vertice
   * si confronta col bordo PIU' VICINO fra i due, e il bordo esterno resta
   * l'invariante che non puo' muoversi.
   */
  let max = 0
  for (let i=0;i<tp.length;i+=3){
    let de = 1e9, di = 1e9
    for (const [x,y] of c) de = Math.min(de, Math.hypot(tp[i]-x, tp[i+1]-y))
    for (const [x,y] of d) di = Math.min(di, Math.hypot(tp[i]-x, tp[i+1]-y))
    max = Math.max(max, Math.min(de, di))
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

// ─── L'ANELLO DEL TAPPO ───────────────────────────────────────────────────
{
  const { contornoA, contornoInternoA, tappoA, PRUA_Z, POPPA_Z } =
    await import('../src/scafo/ordinate.js')
  const areaSeg = p => { let a=0; for(let i=0;i<p.length;i++){const u=p[i],v=p[(i+1)%p.length];a+=u[0]*v[1]-v[0]*u[1]} return a/2 }

  console.log('\nIL TAPPO AD ANELLO — spessore di parete, non un piano')
  let rotti = 0, anelli = 0
  for (let i = 0; i <= 40; i++) {
    const z = PRUA_Z + (POPPA_Z - PRUA_Z) * (i / 40)
    const t = (z - PRUA_Z) / (POPPA_Z - PRUA_Z)
    const e = contornoA(t), d = contornoInternoA(t)
    const ae = areaSeg(e), ad = areaSeg(d)
    const verso = Math.sign(ae) === Math.sign(ad)
    const dentro = Math.abs(ad) < Math.abs(ae)
    if (verso && !dentro) rotti++
    const n = tappoA(z).attributes.position.count
    if (n > 40) anelli++
  }
  console.log(`  quote con anello: ${anelli} su 41`)
  console.log(`  contorni interni piu' GRANDI dell'esterno: ${rotti}`)
  if (rotti > 0) { console.error('  ROTTO: l\'offset va nel verso sbagliato'); process.exitCode = 1 }
  else console.log('  OK — l\'interno sta sempre dentro l\'esterno')
}
