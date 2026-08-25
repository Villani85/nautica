import { creaSimulazione, AMPIEZZA_MARE, V_RIF, _costanti } from '../src/scena/simulazione.js'
const C = _costanti
function corri (mare, v, C0scala, secondi = 300, hz = 60) {
  const s = creaSimulazione({}); s.S.mare = mare; s.S.stab = true
  s.S.velocita = v * Math.sqrt(C0scala)      // scalare v^2 equivale a scalare C0
  const dt = 1/hz, n = Math.round(secondi*hz); let stallo = 0, maxA = 0
  for (let i=0;i<n;i++){ s.passo(dt,i*dt)
    const a = Math.abs(s.S.pinna); if(a>maxA) maxA=a
    if(a>C.A_STALLO-1e-9) stallo++ }
  return { rid:s.S.riduzione, stallo:stallo/n, maxA:maxA*180/Math.PI }
}
const med = (f,n=9)=>{const v=[];for(let i=0;i<n;i++)v.push(f());v.sort((a,b)=>a-b);return v[Math.floor(n/2)]}

console.log('=== ricerca di C0 con l\'integratore vero, mare 3, velocita di servizio ===')
console.log('  scala   C0        riduzione   in stallo   alfa max')
for (const k of [0.02,0.05,0.10,0.20,0.35,0.60,1.00]) {
  const r = med(()=>corri(3,V_RIF,k).rid)
  const u = corri(3,V_RIF,k)
  console.log(`  ${k.toFixed(2)}   ${(C.C0*k).toFixed(4)}    ${(100*r).toFixed(1)}%      ${(100*u.stallo).toFixed(0)}%       ${u.maxA.toFixed(1)}°`)
}
