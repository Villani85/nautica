# 02 — Materiali: Principled BSDF v2 + libreria (incl. VEICOLO)

Il Principled BSDF v2 (Blender 4.0+) è quasi sempre l'unico shader che serve. **Lo specular
non è più uno slider inventato: nasce dall'IOR.**

## Socket / pannelli v2

Base: **Base Color · Metallic · Roughness · IOR · Alpha · Normal**. Pannelli:
- **Subsurface**: Weight, Radius (RGB), Scale, IOR, Anisotropy, *Method* = **Random Walk** (default moderno; "Random Walk (Skin)" per la pelle).
- **Specular**: **IOR Level** (neutro **0.5** = Fresnel fisico dell'IOR dato; alza solo per barare), Tint, Anisotropic, Anisotropic Rotation.
- **Transmission**: Weight (0–1). Niente roughness separata: usa la Roughness principale.
- **Coat** (clearcoat): Weight, Roughness (bassa 0–0.1), IOR (1.5), Tint, Normal.
- **Sheen** (microfibra/velluto/polvere): Weight, Roughness (~0.3), Tint.
- **Emission**: Color, Strength.
- **Thin Film**: Thickness, IOR (iridescenze: bolle, vernici perlate).

### Tabella IOR (dielettrici)
aria 1.00 · acqua 1.33 · ghiaccio 1.31 · **pelle 1.35–1.4** · cornea 1.376 · plastica/PVC 1.45–1.5 ·
**vetro 1.5** (default) · quarzo 1.54 · zaffiro 1.77 · **diamante 2.42**.
- **Metalli**: `Metallic = 1`, Base Color = reflectance misurata (oro lineare ≈ (1.0, 0.77, 0.34);
  alluminio ≈ (0.91, 0.92, 0.92); rame ≈ (0.95, 0.64, 0.54)), Roughness = finitura.
- **Regole che leggono come vero**: roughness reale **0.2–0.6 con variazione spaziale** (mai 0 o 1
  uniforme); base color non pura (sRGB ~30–240); metallic **binario** (0 o 1, tranne le transizioni
  di ruggine). Le impronte/polvere/graffi modulano la **Roughness** (e un filo lo Specular), non il colore.

> Le mappe di colore generate dall'IA hanno **la luce cotta dentro** → [[costruire-o-fotografare]].
> Preferisci un materiale PBR vero a una texture "già illuminata".

## Helper + libreria (ricette bpy)

Helper riusabile: crea un materiale, prende il Principled, e setta i socket per nome
(tollerante alle differenze di versione).

```python
import bpy

def new_mat(name):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); out.location = (400, 0)
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled'); bsdf.location = (0, 0)
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return m, nt, bsdf, out

def si(bsdf, name, val):
    s = bsdf.inputs.get(name)
    if s is not None:
        try: s.default_value = val
        except Exception: pass

def assign(obj_name, mat):
    ob = bpy.data.objects.get(obj_name)
    if ob is None: return
    ob.data.materials.clear()
    ob.data.materials.append(mat)
    ob.active_material_index = 0
```

### 🚗 Car paint (vernice metallizzata + clearcoat)

```python
m, nt, b, out = new_mat("CarPaint_Metallic")
si(b, "Base Color", (0.015, 0.02, 0.06, 1))   # blu scuro; cambia a piacere
si(b, "Metallic", 0.9)                          # flake metallico
si(b, "Roughness", 0.28)
si(b, "Coat Weight", 1.0)                        # CLEARCOAT
si(b, "Coat Roughness", 0.03)
si(b, "Coat IOR", 1.5)
# micro-flake: Noise -> Bump sul Normal + leggera variazione di roughness
noise = nt.nodes.new('ShaderNodeTexNoise'); noise.location = (-600, -200)
noise.inputs['Scale'].default_value = 900.0
noise.inputs['Detail'].default_value = 2.0
bump = nt.nodes.new('ShaderNodeBump'); bump.location = (-300, -200)
bump.inputs['Strength'].default_value = 0.06
nt.links.new(noise.outputs['Fac'], bump.inputs['Height'])
nt.links.new(bump.outputs['Normal'], b.inputs['Normal'])
# variazione di roughness (rende il flake vivo)
cr = nt.nodes.new('ShaderNodeMapRange'); cr.location = (-300, -420)
cr.inputs['From Min'].default_value = 0.0; cr.inputs['From Max'].default_value = 1.0
cr.inputs['To Min'].default_value = 0.24; cr.inputs['To Max'].default_value = 0.34
nt.links.new(noise.outputs['Fac'], cr.inputs['Value'])
nt.links.new(cr.outputs['Result'], b.inputs['Roughness'])
```
Varianti: **solid** (Metallic 0, Roughness ~0.35, Coat 1); **perlato** (aggiungi Thin Film:
`si(b,"Thin Film Thickness",470); si(b,"Thin Film IOR",1.5)`).

### Cromo / acciaio lucido (paraurti, cerchi, griglia)

```python
m, nt, b, out = new_mat("Chrome")
si(b, "Base Color", (0.91, 0.92, 0.92, 1))      # reflectance alluminio/cromo
si(b, "Metallic", 1.0)
si(b, "Roughness", 0.03)                          # 0.02–0.05
```

### Vetro auto fumé (parabrezza, finestrini)

```python
m, nt, b, out = new_mat("CarGlass_Tinted")
si(b, "Base Color", (0.05, 0.05, 0.06, 1))
si(b, "Transmission Weight", 1.0)
si(b, "Roughness", 0.0)
si(b, "IOR", 1.5)
m.use_screen_refraction = True                    # utile in EEVEE
# modella il vetro con SPESSORE (doppia parete) o alza Transmission bounces (vedi 01)
```

### Gomma pneumatico

```python
m, nt, b, out = new_mat("TireRubber")
si(b, "Base Color", (0.012, 0.012, 0.012, 1))     # nero NON puro
si(b, "Roughness", 0.7)                            # 0.6–0.8
si(b, "Metallic", 0.0)
si(b, "Specular IOR Level", 0.35)
# battistrada: usa una normal map reale (05) o un micro-noise->bump come sopra
```

### Faro / fanale (lente + emissione)

```python
# lente chiara
m, nt, b, out = new_mat("Headlight_Lens")
si(b, "Transmission Weight", 1.0); si(b, "Roughness", 0.0); si(b, "IOR", 1.49)
# elemento luminoso (piano/mesh interna)
m2, nt2, b2, out2 = new_mat("Headlight_Emit")
si(b2, "Emission Color", (1.0, 0.98, 0.92, 1)); si(b2, "Emission Strength", 12.0)
# stop posteriori: rosso
m3, nt3, b3, out3 = new_mat("Taillight_Emit")
si(b3, "Emission Color", (1.0, 0.03, 0.02, 1)); si(b3, "Emission Strength", 8.0)
```

### Materiali generici utili

```python
# Plastica opaca (trim, cruscotto)
m, nt, b, out = new_mat("PlasticMatte")
si(b,"Base Color",(0.02,0.02,0.02,1)); si(b,"Roughness",0.5); si(b,"IOR",1.45)

# Pelle sedili (SSS leggero)
m, nt, b, out = new_mat("Leather")
si(b,"Base Color",(0.06,0.03,0.02,1)); si(b,"Roughness",0.45)
si(b,"Subsurface Weight",0.08); si(b,"Subsurface Radius",(0.06,0.03,0.02))
try: b.subsurface_method = 'RANDOM_WALK'
except Exception: pass

# Tessuto (sheen)
m, nt, b, out = new_mat("Fabric")
si(b,"Base Color",(0.2,0.05,0.05,1)); si(b,"Roughness",0.9)
si(b,"Sheen Weight",0.6); si(b,"Sheen Roughness",0.3)

# Pelle umana (personaggi)
m, nt, b, out = new_mat("Skin")
si(b,"Base Color",(0.8,0.5,0.42,1)); si(b,"Roughness",0.4); si(b,"IOR",1.38)
si(b,"Subsurface Weight",0.25); si(b,"Subsurface Radius",(1.0,0.2,0.1)); si(b,"Subsurface Scale",0.05)
try: b.subsurface_method = 'RANDOM_WALK_SKIN'
except Exception:
    try: b.subsurface_method = 'RANDOM_WALK'
    except Exception: pass
si(b,"Coat Weight",0.1); si(b,"Coat Roughness",0.3)     # film sebo

# Vetro semplice / liquido
m, nt, b, out = new_mat("Glass")
si(b,"Transmission Weight",1.0); si(b,"Roughness",0.0); si(b,"IOR",1.5)
```

## Imperfezioni (la leva di realismo dei materiali)

Sopra il materiale base, aggiungi **variazione di roughness** + maschere di **impronte/polvere/
graffi** (vedi `05-texturing-displacement.md` per collegare mappe reali). Anche solo un Noise a
scala grande che sposta la roughness di ±0.05 toglie l'aspetto "plastica perfetta".

Applica un materiale: `assign("Carrozzeria", bpy.data.materials["CarPaint_Metallic"])`.

Torna al metodo: [[blender]]. Geometria che regge questi materiali: `06-geometry.md`.
