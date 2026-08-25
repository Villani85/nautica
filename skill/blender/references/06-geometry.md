# 06 — Geometria che non sembra CG

Un modello con spigoli matematicamente netti e superfici uniformi grida "sintetico". Il cervello
riconosce il vero dalle **tolleranze**, dai **bordi smussati** che catturano un filo di luce, e
dall'**usura**. Tre interventi risolvono quasi tutto.

## 1. Bevel su OGNI spigolo

Nessun bordo reale è perfettamente affilato. Un raggio piccolo (0.5–2 mm su scala reale) crea la
riga di luce che legge come spigolo vero. Due strade:

```python
import bpy, math
def bevel_all(obj_name, width=0.001, segments=2, angle_deg=30):
    ob = bpy.data.objects[obj_name]
    mod = ob.modifiers.new("Bevel", 'BEVEL')
    mod.width = width; mod.segments = segments
    mod.limit_method = 'ANGLE'; mod.angle_limit = math.radians(angle_deg)
    mod.harden_normals = True
    return mod
```
Alternativa senza geometria extra: **Bevel shader node** (`ShaderNodeBevel`) nel materiale, collegato
al Normal del Principled — arrotonda i bordi solo in render.

## 2. Weighted Normals (hard-surface pulito)

Dà alle facce grandi più peso nello shading, così i pannelli larghi restano lisci e i bevel leggono
bene. Va **dopo** il Bevel nello stack.

```python
def weighted_normals(obj_name):
    ob = bpy.data.objects[obj_name]
    ob.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
```

## 3. Shade smooth per angolo (curvi puliti)

```python
def smooth_by_angle(obj_name, angle_deg=30):
    ob = bpy.data.objects[obj_name]
    bpy.context.view_layer.objects.active = ob
    try:
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle_deg))  # 4.1+
    except Exception:
        bpy.ops.object.shade_smooth()
        if hasattr(ob.data, "use_auto_smooth"):
            ob.data.use_auto_smooth = True
            ob.data.auto_smooth_angle = math.radians(angle_deg)
```

## 4. Edge wear / usura ai bordi (pointiness)

I bordi convessi consumati (roughness diversa, colore più chiaro) e la **polvere** negli incavi
concavi sono ciò che dà "peso" e vissuto. Maschera geometrica via **Pointiness**:

```python
import bpy
def add_edge_wear(mat_name, wear_rough=0.15, wear_lighten=0.1):
    m = bpy.data.materials[mat_name]; nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    geo = nt.nodes.new('ShaderNodeNewGeometry'); geo.location = (-800, 400)
    ramp = nt.nodes.new('ShaderNodeValToRGB'); ramp.location = (-600, 400)  # isola i bordi convessi
    ramp.color_ramp.elements[0].position = 0.55
    ramp.color_ramp.elements[1].position = 0.62
    nt.links.new(geo.outputs['Pointiness'], ramp.inputs['Fac'])
    # spinge su la roughness sui bordi
    r_in = bsdf.inputs['Roughness']
    base_r = r_in.default_value if not r_in.is_linked else 0.4
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type='FLOAT'; mix.location=(-300,300)
    mix.inputs['A'].default_value = base_r
    mix.inputs['B'].default_value = min(1.0, base_r + wear_rough)
    nt.links.new(ramp.outputs['Color'], mix.inputs['Factor'])
    nt.links.new(mix.outputs['Result'], r_in)
    return ramp
```
Puoi usare la stessa maschera per schiarire la Base Color sui bordi (metallo scrostato) o, invertita
(`Separate`/`Invert`), per accumulare polvere/AO negli incavi.

## Normali che ondeggiano (modelli da poche viste) — il rimedio

Un'auto (o qualsiasi superficie continua e lucida) da un modello generato da 4 viste ha **normali
che ondeggiano**: i riflessi lunghi delle strisce softbox, invece di correre dritti, serpeggiano.
Prima **misura** l'ondulazione (zebra analysis + `normal_waviness()` in `08-realism-checklist.md`),
poi correggi — dal rimedio più leggero al più radicale:

```python
import bpy
def fair_panels(obj_name, factor=0.5, iterations=8):
    """Toglie l'alta frequenza dalle normali senza collassare la forma.
       Corrective Smooth conserva il volume meglio dello Smooth semplice."""
    ob = bpy.data.objects[obj_name]
    m = ob.modifiers.new("Fairing", 'CORRECTIVE_SMOOTH')
    m.factor = factor; m.iterations = iterations
    m.smooth_type = 'LENGTH_WEIGHTED'
    # poi ristabilisci normali pulite
    wn = ob.modifiers.new("WeightedNormal", 'WEIGHTED_NORMAL')
    return m
# 1) misura (08) -> 2) fair_panels("Carrozzeria") -> 3) rimisura: waviness_rms deve scendere
```

Se dopo il fairing l'indice resta alto o la forma si deforma, i rimedi veri sono:
- **Shrinkwrap** dei pannelli su una versione **liscia** costruita a mano (proietti il dettaglio su
  una superficie fair);
- **retopo** della carrozzeria come superfici fair (patch quad regolari), non la mesh generata così com'è.
La striscia riflessa è il collaudo: rimisura con la zebra dopo ogni intervento — il numero deve
scendere, non "sembrare meglio" ([[metriche-vanno-verificate]]).

## Perché la geometria "perfetta" tradisce

Niente arrotondamenti, niente usura, superfici identiche, spigoli a rasoio → il cervello segnala
"finto". Introduci imperfezione **controllata** ovunque. La griglia diagnostica base "sembra finto"
sta in [[render3d-in-video-reale]]; le righe estreme in `08-realism-checklist.md`.

Ordine consigliato nello stack modificatori: **Bevel → Weighted Normal → (Subdiv)** e poi lo shade
smooth. Per gli hard-surface auto: bevel stretti sui pannelli, gap tra i pannelli modellati (non
dipinti), bordi delle prese d'aria smussati.

Torna al metodo: [[blender]]. Materiali che reggono i bevel: `02-materials-principled.md`.
