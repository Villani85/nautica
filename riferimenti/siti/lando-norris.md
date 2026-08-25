# Lando Norris

- **URL**: https://landonorris.com/
- **Premio**: Site of the Year 2025 (Awwwards); SOTD 17/11/2025, punteggio 8.18
- **Studio**: OFF+BRAND — https://www.itsoffbrand.com/our-work/lando-norris
- **Letto il**: 13/08/2026 — bundle e HTML letti direttamente, sito ispezionato in esecuzione

## Cosa vende
Il pilota stesso come marchio: contenuti, caschi, gare, merchandising. Nella
build in produzione c'e' un takeover sponsor (variante "Gold"/"Google").

## A chi
Tifosi e partner commerciali. Deve trasmettere che il pilota e' un marchio
curato quanto una casa automobilistica.

## Idea regista
Un unico campo di fluido reattivo attraversa tutte le scene come texture
condivisa (`tFluid`), cosi' casco, testa, tipografia e fondali sembrano immersi
nello stesso liquido invece di essere sezioni separate.

## Il momento
La rotazione del casco scrubbata: due giri pieni (`y` da `PI/2.2` a `PI*4`)
legati allo scroll. Piu' un uovo di Pasqua: digitando `disco` parte una scena
alternativa (`uHelmetTransition` a 1, `duration: 2, ease: expo.inOut`).

## Struttura, sezione per sezione
| sezione | cosa mostra | cosa fa l'utente | durata |
|---|---|---|---|
| hero | testa in 2.5D + tipografia | scorre | ~1 schermata |
| casco | GLB PBR che ruota | scorre (scrub) | ~2 schermate |
| tracciati | scroll orizzontale (solo desktop) | scorre | dipende dal nastro |
| sezioni Rive | animazioni vettoriali scrubbate | scorre | varie |

## L'esperienza in ordine di tempo
Apertura con caratteri SplitText da `y:"100%"` e immagini da `autoAlpha:0,
y:"1rem"`; la nav scende da `y:-90`. Poi il fluido reagisce al puntatore su
tutta la pagina. Il resto e' guidato dallo scroll, con un gate che accende il
rendering solo entro mezzo viewport di margine.

## Animazioni
| elemento | cosa si muove | legato a | curva/inerzia | note |
|---|---|---|---|---|
| casco | rotazione Y, 2 giri | scroll | timeline in pausa, scrubbata | GLB Draco 139 KB |
| testa | parallasse | puntatore + scroll | fluido | **depth map da 3,7 KB**, non una mesh |
| animazioni Rive | input `scroll` 0-1000 | scroll | `scrub: 0.5` | vedi contratto sotto |
| tracciati | nastro orizzontale | scroll verticale | pin | solo &gt; 992 px |
| transizione pagina | tendina | router custom | — | **e' un file Rive**, non CSS |

### Il contratto Rive <-> ScrollTrigger (la cosa piu' rubabile del sito)
Convenzione a data-attribute sul `<canvas>`: `data-rive-object`,
`data-rive-file`, `data-rive-state-machine`, `data-rive-scrolltrigger-start/-end`.
Il NOME della state machine decide il comportamento: contiene `_play` -> parte
all'ingresso; contiene `_scroll` -> viene scrubbata.

    // la state machine espone un input numerico "scroll", 0..1000
    const tl = gsap.timeline({paused:true, onUpdate(){
      input.value = gsap.utils.clamp(0,1,this.progress())*1000 }});
    tl.to({}, {duration:1});                     // timeline finta: solo interpolatore
    ScrollTrigger.create({ trigger, start, end, scrub: 0.5,
      onUpdate: st => { tl.progress(st.progress); if(!rive.isPlaying) rive.play() },
      onLeave:  () => { input.value = 1000; setTimeout(()=>rive.pause(), 50) } });
    // correzione anti-fling: dopo uno swipe veloce l'animazione resterebbe a meta'
    lenis.on('scroll', () => { const v = lenis.velocity || 0;
      if (Math.abs(v) > 100) { /* forza 0 o 1000 agli estremi */ } });

Il designer esporta la state machine, lo sviluppatore non scrive una riga per
quella specifica animazione. E' ingegneria di PROCESSO: separa il lavoro del
motion designer da quello del front-end.

## Colori
non verificato in esadecimale. Il sito ha **tre varianti** e cambia da solo
secondo l'ora:

    getVariantAccordingToTime(){ const h = new Date().getHours();
      return (h>=6 && h<18) ? "Lime" : "Dark" }

Nella build in produzione e' scavalcata da `VARIANT = "Google"` (sponsor). Ogni
variante cambia texture del casco, `envMapIntensity` e `iridescence`.

## Tipografia
Mona Sans **variabile** (167,5 KB) + Brier-Bold (23,6 KB), servite dal CDN
Webflow. Piu' un atlante MSDF `Brier-Bold-02.webp` da 117 KB per il testo
dentro WebGL.

## Testi veri
non verificato (non raccolti).

## Mobile — la sezione piu' istruttiva
- **Breakpoint unico a 991/992 px** (standard Webflow). Attraversarlo
  **ricarica la pagina** (`window.location.reload()`, debounce 150 ms). Nessun
  re-init responsive: e' una scelta brutale ma azzera un'intera classe di bug.
- **Il 3D NON viene tolto.** Su iPhone emulato scarica gli stessi 3 GLB
  (940 KB), gli stessi 8 file Rive, le stesse 22 texture. Il telefono paga il
  peso pieno.
- **DPR INVERTITO**, ed e' il dettaglio piu' contro-intuitivo del sito:

      pixelRatio = width > 768 ? min(devicePixelRatio, 1.25)
                               : min(devicePixelRatio, 2)

  Misurato: desktop 1440x900 con DPR 2 -> buffer 1800x1125 (**1,25x**);
  iPhone DPR 3 -> buffer 780x1688 (**2x**). Il desktop viene sotto-campionato
  apposta perche' la simulazione di fluido e' limitata dal riempimento su
  canvas grandi; il telefono ha un canvas piccolo e puo' permettersi densita'.
- **Lenis resta attivo sul touch**: `syncTouch: true`, `syncTouchLerp: 0.075`,
  `touchInertiaMultiplier: 35`.
- **Lo scroll orizzontale e' solo desktop**: sotto 992 px i suoi ScrollTrigger
  vengono uccisi, il markup resta.
- **Animazioni hero dedicate**, non ridotte: target separati `mob1` (rivelata
  con `clipPath: ellipse(110% 110% at 50% 0%)`) e `mob2`.
- **Blocco del landscape**: un file Rive da 52,8 KB dice "ruota il dispositivo".
- **Nessuna gestione di `prefers-reduced-motion`**: zero occorrenze nel bundle.

## Stack
| voce | cosa usa | stato |
|---|---|---|
| CMS/hosting | **Webflow** + jQuery 3.5.1 | VERIFICATO |
| codice custom | **un solo bundle**, 1,32 MB raw / **370 KB compresso** | VERIFICATO |
| animazione | **GSAP 3.13.0** + ScrollTrigger, SplitText, Observer, Flip | VERIFICATO |
| scroll | **Lenis** `lerp 0.1`, guidato dal ticker GSAP, `lagSmoothing(0)` | VERIFICATO |
| 3D | **Three.js** (non OGL): GLTFLoader, DRACOLoader, InstancedMesh, EffectComposer | VERIFICATO |
| motion 2D | **Rive** `@rive-app/canvas-lite 2.26.4`, 8 file `.riv` | VERIFICATO |
| router | fetch + `pushState` custom (non Barba, non Swup) | VERIFICATO |
| requisito | **WebGL 2 obbligatorio**, altrimenti classe `gl-fallback` e niente scena | VERIFICATO |

Sei scene WebGL sotto un unico namespace `window.landoGL`.

## Peso e prestazioni
| voce | sul filo |
|---|---|
| HTML | 43,9 KB |
| CSS Webflow | 31,4 KB |
| bundle OFF+BRAND | 370,6 KB |
| font | 191,1 KB |
| Rive, 8 file | 275,0 KB |
| GLB, 3 modelli Draco | 962,4 KB |
| **texture, 31 file** | **2.430,9 KB** |
| **totale home** | **≈ 4,16 MB su 60-70 richieste** |

Le texture sono oltre meta' del peso; le due mappe d'ombra della testa da sole
fanno 569 KB, mentre la depth map che fa il lavoro vero ne costa 3,7.
Awwwards: WPO 7,60/10, Animazioni 8,60/10.

## Tre cose da rubare
1. **Il contratto Rive<->ScrollTrigger a data-attribute**, con il `pause()` a
   50 ms fuori viewport e la correzione anti-fling su `lenis.velocity > 100`.
2. **Il DPR invertito**: `width > 768 ? min(dpr,1.25) : min(dpr,2)`. Due righe,
   meta' dei pixel da riempire sui monitor grandi, perdita visiva quasi nulla.
3. **Il gate di rendering con mezzo viewport di margine**
   (`refreshPriority: -99`) piu' il `pause()` delle istanze Rive fuori schermo:
   e' il motivo per cui 21 canvas nella stessa pagina restano gestibili.

Bonus: **la depth map da 3,7 KB al posto di una mesh della testa.**

## Non verificato
Revisione esatta di Three.js (minificata). Origine della simulazione di fluido
(i nomi combaciano con i port di Stable Fluids, nessuna conferma dello studio).
Risoluzione degli FBO del fluido. **fps reali** su hardware vero. Peso di un
cambio pagina. Comportamento su Android reale (esiste un
`gold-android-fix-03.js`, non ho isolato quale fix). Testi e colori esadecimali.
