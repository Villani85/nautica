# 05 — Texture e rilievo (PBR)

Le texture PBR fanno la differenza tra "materiale liscio inventato" e superficie vera. Due
errori uccidono il realismo: **color space sbagliato** e **niente imperfezioni**.

## Regole

- **Color space**: solo la **Base Color** è sRGB. **Roughness, Metallic, Normal, Height, AO**
  vanno **Non-Color** (altrimenti Blender applica una trasformazione colore sbagliata).
- **ORM** = mappa che impacca AO(R)/Roughness(G)/Metallic(B): separala con un nodo Separate Color.
- **Normal** passa da un nodo **Normal Map** (tangent). **Bump** da nodo Bump. Nessuno dei due
  cambia la silhouette.
- **Displacement, tre livelli**: *Bump* (finto, silhouette piatta) · *Normal* (finto, piatta) ·
  **Vero/Adattivo** (geometria reale, silhouette corretta, pesante). In material Settings →
  Displacement: "Displacement and Bump" (ibrido pratico) o "Displacement Only" (vero).
- **Adaptive Subdivision**: Feature Set = **Experimental**, `use_adaptive_subdivision` sull'oggetto,
  **Dicing Rate ≥ 1** (mai 0.5: esplode la geometria per niente).
- **UDIM** per gli hero (UV su tile 1001+, nome `<UDIM>`).
- **Micro-roughness + imperfection maps** (impronte/polvere/graffi/aloni) = **la leva #1**: quasi
  invisibili da vicino, ma rompono la perfezione CG. Modulano soprattutto la **Roughness**.
- **Anti-tiling**: le texture scannerizzate hanno vera irregolarità ma **si ripetono**; posale
  "a lastre" con orientamento variato per nascondere la ripetizione ([[costruire-o-fotografare]]).

## Set_texture dell'MCP

Il modo rapido: `download_polyhaven_asset(asset_id, "textures", "2k")` poi
`set_texture(object_name, texture_id)` collega base color/roughness/normal/displacement con i
color space giusti in automatico. Usa la ricetta sotto quando vuoi controllo totale (imperfezioni,
mix, UDIM).

## Ricetta bpy — node group PBR completo da una cartella di mappe

```python
import bpy, os

def pbr_material(name, folder, maps, uv_scale=1.0, displacement="hybrid"):
    """maps: dict con chiavi tra 'base','rough','metal','normal','height','ao' -> filename."""
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out  = nt.nodes.new('ShaderNodeOutputMaterial'); out.location=(600,0)
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled'); bsdf.location=(200,0)
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    tc = nt.nodes.new('ShaderNodeTexCoord'); tc.location=(-1000,0)
    mp = nt.nodes.new('ShaderNodeMapping'); mp.location=(-820,0)
    mp.inputs['Scale'].default_value = (uv_scale, uv_scale, uv_scale)
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector'])

    def tex(fn, noncolor, y):
        n = nt.nodes.new('ShaderNodeTexImage'); n.location=(-600, y)
        n.image = bpy.data.images.load(os.path.join(folder, fn), check_existing=True)
        if noncolor:
            n.image.colorspace_settings.name = 'Non-Color'
        nt.links.new(mp.outputs['Vector'], n.inputs['Vector'])
        return n

    if maps.get('base'):
        nt.links.new(tex(maps['base'], False, 300).outputs['Color'], bsdf.inputs['Base Color'])
    if maps.get('metal'):
        nt.links.new(tex(maps['metal'], True, 120).outputs['Color'], bsdf.inputs['Metallic'])
    if maps.get('rough'):
        nt.links.new(tex(maps['rough'], True, -60).outputs['Color'], bsdf.inputs['Roughness'])
    if maps.get('normal'):
        nrm = tex(maps['normal'], True, -260)
        nm = nt.nodes.new('ShaderNodeNormalMap'); nm.location=(-320,-260)
        nt.links.new(nrm.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    if maps.get('height'):
        h = tex(maps['height'], True, -480)
        disp = nt.nodes.new('ShaderNodeDisplacement'); disp.location=(200,-400)
        disp.inputs['Scale'].default_value = 0.02
        nt.links.new(h.outputs['Color'], disp.inputs['Height'])
        nt.links.new(disp.outputs['Displacement'], out.inputs['Displacement'])
        m.cycles.displacement_method = 'BOTH' if displacement=="hybrid" else 'DISPLACEMENT'
    return m

# esempio:
# pbr_material("Asphalt", "//tex/asphalt_2k",
#   {'base':'diff.jpg','rough':'rough.jpg','normal':'nor_gl.jpg','height':'disp.png'}, uv_scale=4.0)
```

## Displacement adattivo (silhouette vera)

```python
import bpy
def enable_adaptive(obj_name, dicing=1.0):
    sc = bpy.context.scene
    sc.cycles.feature_set = 'EXPERIMENTAL'
    sc.cycles.dicing_rate = max(1.0, dicing)      # MAI < 1
    ob = bpy.data.objects[obj_name]
    mod = ob.modifiers.new("Subdiv", 'SUBSURF'); mod.subdivision_type = 'CATMULL_CLARK'
    try: ob.cycles.use_adaptive_subdivision = True
    except Exception: pass
```

## Imperfezione rapida (senza mappe esterne)

Un Noise a scala grande che sposta la roughness di ±0.05, più una maschera di polvere ai bordi
(pointiness → `06-geometry.md`), bastano a togliere l'aspetto "appena uscito di fabbrica".

Torna al metodo: [[blender]]. Materiali: `02-materials-principled.md`.
