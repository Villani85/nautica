# 07 — Compositing / post: il tocco finale

Una foto vera ha bloom, un filo di aberrazione ai bordi, vignettatura, grana. Un render "pulito"
al 100% legge come CG. Tutto **sottile**. In Blender 5.x le ottiche stanno nella categoria
**Camera / Lens Effects** del compositor; il **Glare** sostituisce il Bloom rimosso da EEVEE Next.

## Ordine (conta)

**grade → Glare (bloom/streaks) → Lens Distortion + Chromatic Aberration → Vignette → grain → sharpen.**

Valori: distorsione/CA ~0.01–0.05 (fringing solo ai bordi ad alto contrasto); glare soglia alta,
mix basso; grana appena percettibile (rompe il banding nei gradienti scuri); sharpen leggero solo
per contrastare l'ammorbidimento del denoiser.

## Ricetta bpy — albero compositor completo

```python
import bpy
sc = bpy.context.scene
sc.use_nodes = True
nt = sc.node_tree
nt.nodes.clear()

rl  = nt.nodes.new('CompositorNodeRLayers');  rl.location  = (-800, 0)
comp= nt.nodes.new('CompositorNodeComposite'); comp.location = (1200, 0)
view= nt.nodes.new('CompositorNodeViewer');    view.location = (1200, -250)

# 1) GRADE — color balance (lift/gamma/gain)
cb = nt.nodes.new('CompositorNodeColorBalance'); cb.location = (-560, 0)
cb.correction_method = 'LIFT_GAMMA_GAIN'
cb.gain  = (1.02, 1.0, 0.98)     # un filo caldo nelle alte luci
cb.gamma = (1.0, 1.0, 1.0)
cb.lift  = (0.0, 0.0, 0.01)      # ombre leggermente fredde
nt.links.new(rl.outputs['Image'], cb.inputs['Image'])

# 2) GLARE (bloom morbido dalle alte luci)
gl = nt.nodes.new('CompositorNodeGlare'); gl.location = (-320, 0)
gl.glare_type = 'BLOOM' if 'BLOOM' in gl.bl_rna.properties['glare_type'].enum_items else 'FOG_GLOW'
try: gl.threshold = 1.0
except Exception: pass
try: gl.mix = -0.85          # -1 solo original ... 0 metà/metà; teniamo il glare basso
except Exception: pass
nt.links.new(cb.outputs['Image'], gl.inputs['Image'])

# 3) LENS DISTORTION + aberrazione cromatica (dispersion = CA)
ld = nt.nodes.new('CompositorNodeLensdist'); ld.location = (-40, 0)
try: ld.use_projector = False
except Exception: pass
ld.inputs['Distortion'].default_value = 0.008
ld.inputs['Dispersion'].default_value = 0.010   # frange colore ai bordi
nt.links.new(gl.outputs['Image'], ld.inputs['Image'])
# (in 5.2 esiste anche un nodo dedicato 'Chromatic Aberration' più controllabile)

# 4) VIGNETTE (ellisse sfocata moltiplicata)
mask = nt.nodes.new('CompositorNodeEllipseMask'); mask.location = (-40, -300)
mask.width = 0.82; mask.height = 0.82
blur = nt.nodes.new('CompositorNodeBlur'); blur.location = (180, -300)
blur.size_x = 200; blur.size_y = 200; blur.filter_type = 'GAUSS'
nt.links.new(mask.outputs['Mask'], blur.inputs['Image'])
vmix = nt.nodes.new('CompositorNodeMixRGB'); vmix.location = (420, 0)
vmix.blend_type = 'MULTIPLY'; vmix.inputs['Fac'].default_value = 0.25   # forza vignette
nt.links.new(ld.outputs['Image'], vmix.inputs[1])
nt.links.new(blur.outputs['Image'], vmix.inputs[2])

# 5) SHARPEN leggero (contro il denoise)
sh = nt.nodes.new('CompositorNodeFilter'); sh.location = (700, 0)
sh.filter_type = 'SHARPEN'; sh.inputs['Fac'].default_value = 0.15
nt.links.new(vmix.outputs['Image'], sh.inputs['Image'])

nt.links.new(sh.outputs['Image'], comp.inputs['Image'])
nt.links.new(sh.outputs['Image'], view.inputs['Image'])
print("Compositor post-processing costruito.")
```

## Grana (opzionale, molto sottile)

Aggiungi una grana fine per rompere la perfezione digitale: un `CompositorNodeTexture` con una
texture Noise mixata in **Add** a fattore ~0.02, oppure applica il grain in post (Photoshop/After
Effects) se preferisci controllarla lì. Non esagerare: deve vedersi solo al 100% di zoom.

## Attenzione

- **Sottile è la regola**: se noti l'effetto a colpo d'occhio, è troppo.
- Il grading migliore parte da un render **AgX** già corretto (→ `01`); il compositor rifinisce, non
  salva un'esposizione sbagliata.
- Verifica sul render finale, non sull'anteprima (→ `08`, [[strumento-verde-non-vuol-dire-pulito]]).

Torna al metodo: [[blender]]. Checklist finale: `08-realism-checklist.md`.
