# Come misurare i proxy (numeri, non impressioni)

Ogni voto della scorecard va sostenuto da una **misura ripetibile**. Strumenti: il MCP
**chrome-devtools** (`mcp__chrome-devtools__*`, deferred → caricali con ToolSearch: `lighthouse_audit`,
`performance_start_trace`/`stop_trace`, `emulate`, `resize_page`, `list_network_requests`,
`evaluate_script`) e il Chrome MCP **claude-in-chrome** (`javascript_tool` per misure in-pagina).
Per FPS/fotogrammi duplicati c'è anche `registra.py` di [[confronto-gemini]].

## USABILITY

### Core Web Vitals + Lighthouse (misura mobile!)
- `mcp__chrome-devtools__emulate` → device mobile + throttling (4G, CPU 4×) **prima** di misurare:
  la giuria testa su mid-range, non su desktop in fibra.
- `mcp__chrome-devtools__lighthouse_audit` → Performance score, LCP, CLS, TBT; oppure
  `performance_start_trace` → interagisci/scrolla → `performance_stop_trace` → `performance_analyze_insight`.
- Soglie (75° percentile, 2026): **LCP < 2.5s** (scarso >4.0), **INP < 200ms** (scarso >500; il più
  fallito nel 2026), **CLS < 0.1** (scarso >0.25). **Mobile Excellence** vuole Google mobile **≥70/100**.

### Peso pagina e formati immagine
```javascript
// via evaluate_script / javascript_tool — peso trasferito e formati
const r = performance.getEntriesByType('resource');
const kb = r.reduce((s,e)=>s+(e.transferSize||0),0)/1024;
const imgs = r.filter(e=>/\.(avif|webp|jpg|jpeg|png|gif)(\?|$)/i.test(e.name));
const byFmt = {};
imgs.forEach(e=>{const m=e.name.match(/\.(avif|webp|jpg|jpeg|png|gif)/i);const k=m?m[1].toLowerCase():'?';byFmt[k]=(byFmt[k]||0)+1;});
JSON.stringify({peso_kb:Math.round(kb), immagini:byFmt});
// AVIF = ottimo (20–30% < WebP a parità di SSIM); molti JPEG/PNG grossi = penalità peso.
```
Oppure `mcp__chrome-devtools__list_network_requests` e somma i transfer size.

### prefers-reduced-motion
```javascript
matchMedia('(prefers-reduced-motion: reduce)').matches;   // stato attuale
```
Con `mcp__chrome-devtools__emulate` forza `reduce` e verifica che le animazioni si **riducano/
sostituiscano** (non che spariscano i contenuti). Assenza di gestione = penalità Usability + a11y.

### Touch target ≥44px e overflow orizzontale
```javascript
// bersagli troppo piccoli
const small = [...document.querySelectorAll('a,button,[role=button],input,select')]
  .map(e=>e.getBoundingClientRect())
  .filter(b=>b.width>0 && (b.width<44 || b.height<44)).length;
// overflow orizzontale (rompe il mobile)
const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
JSON.stringify({target_piccoli: small, overflow_orizzontale: overflow});
```

### Responsive
`mcp__chrome-devtools__resize_page` (o `emulate`) a 390×844 / 768 / 1440, screenshot, e ricontrolla
`overflow_orizzontale` a ogni breakpoint. Un capolavoro desktop che si rompe su iPhone perde subito.

## DESIGN

### Contrasto WCAG (il criterio più fallito)
```javascript
function lum(c){const s=c.match(/[\d.]+/g).slice(0,3).map(Number)
  .map(v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4;});
  return 0.2126*s[0]+0.7152*s[1]+0.0722*s[2];}
function ratio(fg,bg){const a=lum(fg),b=lum(bg);const hi=Math.max(a,b),lo=Math.min(a,b);
  return ((hi+0.05)/(lo+0.05));}
// campiona i testi principali
[...document.querySelectorAll('h1,h2,p,a,button')].slice(0,20).map(e=>{
  const s=getComputedStyle(e);
  return {t:(e.innerText||'').slice(0,20), r:+ratio(s.color, s.backgroundColor==='rgba(0, 0, 0, 0)'
     ? getComputedStyle(document.body).backgroundColor : s.backgroundColor).toFixed(2)};
});
// AA: 4.5:1 testo normale, 3:1 testo grande/UI. Sotto = penalità (ma MISURA prima di dichiararlo:
// in passato un contrasto 11.7:1 fu erroneamente detto "sotto WCAG").
```

### Font non-di-sistema (tell dell'estetica generica)
```javascript
JSON.stringify({h1:getComputedStyle(document.querySelector('h1')||document.body).fontFamily,
                body:getComputedStyle(document.body).fontFamily});
// Inter / Space Grotesk / Roboto / Arial come primario = segnale di template.
```

## CREATIVITY

### FPS durante lo scroll (60fps è la disciplina)
```javascript
// misura l'FPS mentre la pagina scorre (esegui, poi scrolla realmente per ~3s)
(()=>{let f=0,last=performance.now(),min=999,frames=0;
 function loop(t){f++;frames++;const dt=t-last;if(dt>=1000){const fps=f*1000/dt;min=Math.min(min,fps);f=0;last=t;}
   if(frames<240)requestAnimationFrame(loop);else window.__fps={min:Math.round(min)};}
 requestAnimationFrame(loop);return 'misuro FPS ~4s: ora scrolla';})();
// poi: window.__fps  → min sostenuto <50 su mid-range = jank = penalità Creativity+Usability.
```
In alternativa registra con `registra.py` e conta i **fotogrammi duplicati**: sopra il 50% "il
filmato mente" e il giudizio non vale.

### Momenti bespoke vs librerie pronte
Ispeziona gli script/marcatori: presenza di **Vanta / Aceternity / Magic UI / React Bits** = tell
"tema". Conta invece i **momenti firma legati a scroll/stato/tempo** (2–4 è la norma SOTD).
> NON contare gli effetti al mouse come creatività ([[niente-effetti-al-mouse]]).

## Disciplina
- **Non dichiarare un effetto scroll senza campionare il transform a due altezze**
  ([[effetti-scroll-dichiarare-solo-se-misurati]]); un errore silenzioso lascia console pulita e
  pagina ferma.
- **Misura il difetto citato prima di correggerlo**: le confabulazioni (proprie o del giudice
  esterno) esistono ([[confronto-gemini-instabile-quattro-round]]).

Torna al metodo: [[valuta-awwwards]]. Anchor dei voti: `rubric.md`.
