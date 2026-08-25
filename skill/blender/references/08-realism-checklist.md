# 08 — Checklist realismo, recipe card per soggetto, QA

## "Sembra finto → causa → cura"

La griglia base sta in [[render3d-in-video-reale]]; qui le righe per l'**estremo** realismo.

| Sintomo | Causa | Cura (file) |
|---|---|---|
| Disegno tecnico piatto | niente ambiente da riflettere + view transform Standard | HDRI world + **AgX** (`03`, `01`) |
| Highlight neon/clippati | Standard + nessun clamp | AgX + Clamp Indirect ~10 (`01`) |
| Di plastica / clay | roughness uniforme, niente micro-normal, niente imperfezioni | variazione roughness + imperfection maps (`02`, `05`) |
| Giocattolo | scala/focale/DoF sbagliati, spigoli a rasoio | scala reale + focale+sensore + DoF + **bevel** (`04`, `06`) |
| Troppo pulito / CG | niente usura, polvere, graffi | edge wear pointiness + smudge (`06`, `05`) |
| Oggetto "incollato" sullo sfondo | niente contact shadow, white balance/prospettiva diversi | AO/ombra di contatto, match camera+WB (`03`, `07`) |
| Sembra renderizzato | nitidezza da bordo a bordo, nessun difetto ottico | DoF + glare/CA/vignette/grain (`04`, `07`) |
| Vetro nero | Transmission bounces troppo bassi | alza Transmission a 8–12 (`01`) |
| Auto: riflessi "sporchi"/ondeggianti | pochi Glossy bounces / normali sbagliate | Glossy 3–4 + weighted normals + strisce softbox (`01`, `06`, `03`) |

## Recipe card per soggetto

### 🚗 VEICOLI (priorità) — passo per passo
0. **Modello a scala reale** (~4.5 m un'auto media). Se manca: Sketchfab/Poly Haven o Hyper3D Rodin,
   poi rescala (tool in [[blender]]).
1. **Geometria** (`06`): bevel sui pannelli, gap tra pannelli **modellati** (non dipinti), weighted
   normals, bordi prese d'aria smussati.
2. **Materiali** (`02`): `CarPaint_Metallic` (+ clearcoat Coat) sulla carrozzeria, `Chrome` su
   cerchi/paraurti/griglia, `CarGlass_Tinted` sui vetri, `TireRubber` sulle gomme, `Headlight_*`
   sui fari, plastica opaca sul trim; interni pelle/tessuto.
3. **Ambiente + luci** (`03`): **studio con strisce softbox lunghe** (scolpiscono i pannelli) o HDRI
   **strada/città**; **contatto a terra** (piano leggermente riflettente + ombra/AO).
4. **Camera** (`04`): 3/4 anteriore hero, **35–85 mm**, **f/5.6–11**, fuoco sul montante anteriore;
   motion blur ruote solo se l'auto è in movimento.
5. **Render** (`01`): Glossy 3–4, Transmission ≥6–8, Clamp Indirect ~10, denoise OIDN+Accurate, AgX.
6. **Post** (`07`): glare basso, CA/vignette sottili.
7. **Test**: i **riflessi delle strisce** devono correre **dritti** lungo la fiancata; se ondeggiano,
   ci sono ammaccature o normali da sistemare (`06`). → vedi **Zebra analysis** sotto.

#### Perché "macchia molle" invece di "riga che corre" (diagnosi, tutta misurabile)
Una carrozzeria non ha texture: l'unica cosa che ne racconta la forma è **come si deforma un
riflesso lungo** mentre ci scorre sopra. Perciò si usano strisce da 3–9 m, non pannelli quadrati:
la striscia lunga è a **bassa estensione angolare** in una direzione → riflesso stretto e lungo che
campiona la curvatura. Se vedi macchie e non righe, in ordine di probabilità:
1. **Vernice non abbastanza specchio**: il riflesso netto vive nel **clearcoat quasi-mirror** →
   `Coat Weight = 1`, `Coat Roughness ≤ 0.03`. Se la base roughness "sfonda", lo specchio è smerigliato.
2. **Manca il buio intorno**: una riga si vede per **contrasto** (striscia chiara su ambiente scuro).
   Se l'HDRI illumina tutto, la striscia non stacca. In studio il fondo è nero apposta.
3. **Bordi striscia sfumati / emissione debole** → riflesso dal bordo sfumato. Serve bordo definito
   e Watt alti (`03`).
4. **Glossy bounces bassi** (`01`) impastano il riflesso.
Sono tutti numeri (roughness, contrasto, watt, bounces) → verificabili.

#### 🦓 Zebra analysis — VEDERE e MISURARE le normali
Un modello generato da poche viste ha normali che **ondeggiano**: è il difetto atteso, e va
**misurato**, non intuìto ([[metriche-vanno-verificate]]).

**Vedere** — ambiente a strisce (zebra): sostituisci temporaneamente il world con strisce
emissive; sulla superficie fair le zebre sono continue e regolari, sui difetti si spezzano/ondeggiano.
```python
import bpy, math
def zebra_world(freq=24.0):
    w = bpy.context.scene.world; w.use_nodes = True
    nt = w.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputWorld'); out.location=(400,0)
    bg  = nt.nodes.new('ShaderNodeBackground'); bg.location=(200,0); bg.inputs['Strength'].default_value=1.5
    wav = nt.nodes.new('ShaderNodeTexWave'); wav.location=(-100,0)
    wav.wave_type='BANDS'; wav.inputs['Scale'].default_value=freq
    tc  = nt.nodes.new('ShaderNodeTexCoord'); tc.location=(-320,0)
    nt.links.new(tc.outputs['Window'], wav.inputs['Vector'])
    nt.links.new(wav.outputs['Color'], bg.inputs['Color'])
    nt.links.new(bg.outputs['Background'], out.inputs['Surface'])
# zebra_world()   # poi render: leggi la continuità delle bande sulla fiancata
```

**Misurare** — indice di ondulazione delle normali lungo una scanline. Marcia lungo la fiancata,
raycast sul corpo, leggi la normale mondiale, e calcola la **seconda differenza** del suo
andamento: un pannello fair dà una curva liscia (indice basso, poche inversioni); un modello da 4
viste dà alta frequenza (indice alto, molte inversioni) — con la posizione del punto peggiore.
```python
import bpy
from mathutils import Vector

def normal_waviness(obj_name, z=0.9, y_from=3.0, x0=-2.0, x1=2.0, steps=200, cast_axis='-Y'):
    """Scansiona lungo X a quota z, spara verso il corpo, misura l'ondulazione delle normali.
       Ritorna: indice RMS (curvatura), n. di inversioni (wiggle), x del punto peggiore."""
    ob = bpy.data.objects[obj_name]
    dg = bpy.context.evaluated_depsgraph_get()
    scan = Vector((1,0,0))                      # asse di scansione
    d = Vector((0,-1,0)) if cast_axis=='-Y' else Vector((0,1,0))
    sig = []                                    # normale proiettata sull'asse di scansione
    xs  = []
    for i in range(steps):
        x = x0 + (x1-x0)*i/(steps-1)
        origin = Vector((x, y_from, z))
        hit, loc, nrm, idx, hobj, mtx = bpy.context.scene.ray_cast(dg, origin, d)
        if hit and (hobj == ob or hobj.name.startswith(ob.name)):
            sig.append(nrm.dot(scan)); xs.append(x)
    if len(sig) < 5:
        return {"error": "poche intersezioni: regola z / y_from / cast_axis", "hits": len(sig)}
    # seconda differenza = curvatura discreta della direzione normale
    d2 = [sig[i-1] - 2*sig[i] + sig[i+1] for i in range(1, len(sig)-1)]
    rms = (sum(v*v for v in d2)/len(d2)) ** 0.5
    # inversioni della prima differenza = numero di "onde"
    d1 = [sig[i+1]-sig[i] for i in range(len(sig)-1)]
    flips = sum(1 for i in range(1,len(d1)) if (d1[i-1]>0) != (d1[i]>0))
    worst_i = max(range(len(d2)), key=lambda i: abs(d2[i]))
    return {"hits": len(sig), "waviness_rms": round(rms,5),
            "wiggles": flips, "worst_x": round(xs[worst_i+1],3)}

# print(normal_waviness("Carrozzeria", z=0.9, y_from=3.0, x0=-2.2, x1=2.2))
# Riferimento indicativo: waviness_rms < ~0.002 e poche wiggles = fiancata fair;
# valori alti / molte inversioni = normali ondeggianti (rimodella/retopo o shrinkwrap su superficie liscia).
```
Rimedi se l'indice è alto (`06`): retopo/superfici NURBS-like, **Shrinkwrap** su una versione
liscia, Smooth/Corrective Smooth mirato, o ricostruire i pannelli come superfici fair invece di
usare la mesh generata così com'è.

### 📦 Prodotto / still-life
Studio HDRI + softbox, sweep/piano infinito, **f/8–11**, **85–120 mm**, imperfezioni e impronte sul
materiale, **contact shadow** morbida. Enfasi su micro-roughness e bordi smussati.

### 🏠 Interni / arch-viz
Finestre con **portals** (`03`), **Fast GI** (`01`), luce da HDRI esterno o sole+cielo, **24–35 mm**,
scala reale rigorosa, materiali coerenti (legno/tessuto/metallo con roughness varia), niente pareti a
riflettanza troppo alta.

### 🌲 Esterni / natura
**Sole + cielo Nishita** (`03`, solo Cycles), scale grandi, vegetazione con translucenza (foglie),
volume/atmosfera leggera per la profondità, DoF ampio (f/8–16) per il paesaggio.

### 🧑 Personaggi / pelle
Materiale `Skin` (**SSS Random Walk**/Skin + coat sebo), occhi umidi (transmission/coat), capelli
con **sheen**, **85–105 mm** (mai grandangolo sul volto), luce chiave morbida grande + rim, DoF f/2–4.

## Disciplina di verifica (QA)

- **Si giudica su un render Cycles vero + campionamento dei pixel**, non sullo stato teorico della
  scena. Un "tutto ok" nell'anteprima non prova niente ([[strumento-verde-non-vuol-dire-pulito]],
  [[metriche-vanno-verificate]]).
- Usa `get_viewport_screenshot` per un colpo d'occhio e `bpy.ops.render.render(write_still=True)` per
  il giudizio vero.
- **Strumenti di misura oggettiva** (esposizione/clipping, sfere di riferimento grigio+cromo,
  rapporto luce in stop, fairness multi-scanline, scala, scopes, contatto a terra):
  `09-misura-e-collaudo.md`.
- **Conta i pezzi visibili risalendo ai genitori**: `traverse` visita anche i figli di gruppi spenti,
  il contatore mente ([[render3d-in-video-reale]]).
- Checklist rapida sul render finale:
  - [ ] highlight **non** clippati sotto AgX
  - [ ] i materiali **riflettono** l'ambiente (HDRI presente)
  - [ ] roughness **non uniforme** (variazione/imperfezioni visibili)
  - [ ] **bevel** su tutti gli spigoli (nessuna riga nera netta)
  - [ ] scala reale → DoF e ombre coerenti
  - [ ] un filo di glare/CA/vignette/grain (non troppo)
  - [ ] auto: riflessi delle strisce **dritti**; vetri non neri; contatto a terra presente

## Controparte real-time (WebGL / three.js)
Se il render NON è offline ma gira nel browser (three.js/R3F, es. il progetto `velocity`), le
stesse regole valgono con API diverse (env map/PMREM ↔ HDRI World; `MeshPhysicalMaterial.clearcoat`
↔ Coat; RectAreaLight/Lightformer ↔ softbox; tone mapping AgX/ACES ↔ view transform) ma il **costo
si inverte** (16 ms/frame vs minuti). La zebra e la waviness delle normali si misurano con un
raycaster invece che con `ray_cast` bpy. Ricette real-time: [[stack-sito-immersivo]]
`references/fotorealismo-webgl.md`.

Torna al metodo: [[blender]].
