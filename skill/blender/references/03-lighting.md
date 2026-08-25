# 03 — Luce fisica

La luce è il 50% del realismo. Regole: **HDRI nel World** (dà direzione, colore e — decisivo —
qualcosa **DA riflettere**: senza ambiente i materiali sembrano finti), luci in **Watt** con
**dimensione reale** (grande = ombre morbide come un softbox), sole+cielo fisici per esterni.

## HDRI nel World (Poly Haven)

Via MCP: `download_polyhaven_asset(asset_id, asset_type="hdris", resolution="4k")` imposta già il
world. Manuale in bpy:

```python
import bpy
def set_world_hdri(path, strength=1.0, rot_z_deg=0.0):
    w = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputWorld'); out.location = (400,0)
    bg  = nt.nodes.new('ShaderNodeBackground'); bg.location = (200,0)
    env = nt.nodes.new('ShaderNodeTexEnvironment'); env.location = (-100,0)
    env.image = bpy.data.images.load(path, check_existing=True)
    mp  = nt.nodes.new('ShaderNodeMapping'); mp.location = (-350,0)
    tc  = nt.nodes.new('ShaderNodeTexCoord'); tc.location = (-550,0)
    import math; mp.inputs['Rotation'].default_value[2] = math.radians(rot_z_deg)
    nt.links.new(tc.outputs['Generated'], mp.inputs['Vector'])
    nt.links.new(mp.outputs['Vector'], env.inputs['Vector'])
    nt.links.new(env.outputs['Color'], bg.inputs['Color'])
    nt.links.new(bg.outputs['Background'], out.inputs['Surface'])
    bg.inputs['Strength'].default_value = strength
# set_world_hdri("//hdris/studio_small_08_4k.exr", 1.0, 30)
```

## Potenze reali (Watt)

- **Point/Spot/Area** = Watt. **Sun** = W/m² (irradianza) → in Cycles la "Strength" del sole è
  piccola (pochi unità) perché è irradianza.
- Un'area light grande = ombre morbide. Per il **macro** rimpicciolisci **e** indebolisci le luci
  con il soggetto (frazioni di Watt): le luci riusate a scale diverse **bruciano** — trappola già
  pagata in [[render3d-in-video-reale]].

## Area light "softbox" (studio / prodotto / VEICOLI)

```python
import bpy
def softbox(name, loc, size=(2.0,0.6), energy=400.0, rot=(0,0,0), temp_color=(1,1,1)):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.shape = 'RECTANGLE'; ld.size = size[0]; ld.size_y = size[1]
    ld.energy = energy; ld.color = temp_color
    ob = bpy.data.objects.new(name, ld)
    ob.location = loc; ob.rotation_euler = rot
    bpy.context.collection.objects.link(ob)
    return ob
# Per un'AUTO: strisce lunghe che scolpiscono i pannelli (riflessi rettilinei sulla fiancata)
import math
softbox("Strip_L", ( 4, 0, 3.2), size=(6.0,0.25), energy=1200, rot=(math.radians(65),0, math.radians(90)))
softbox("Strip_R", (-4, 0, 3.2), size=(6.0,0.25), energy=1200, rot=(math.radians(65),0, math.radians(90)))
softbox("Fill_Top",( 0, 0, 4.5), size=(6.0,3.0), energy=300, rot=(0,0,0))
```
**Test auto**: i riflessi delle strisce devono correre **dritti** lungo la fiancata; se ondeggiano
ci sono ammaccature o normali sbagliate (→ `06-geometry.md`).

## 3-point (soggetti/personaggi), sopra l'HDRI

```python
import math
key  = softbox("Key",  ( 2.5, -2.5, 2.5), size=(1.2,1.2), energy=500, rot=(math.radians(55), 0, math.radians(45)))
fill = softbox("Fill", (-3.0, -1.0, 1.8), size=(2.0,2.0), energy=120, rot=(math.radians(70), 0, math.radians(-60)))
rim  = softbox("Rim",  ( 0.0,  3.0, 3.0), size=(1.0,0.4), energy=700, rot=(math.radians(120),0, 0))
```

## Sole + cielo Nishita (ESTERNI, solo Cycles)

EEVEE rende il Nishita bianco → per EEVEE usa Preetham/Hosek. In Cycles:

```python
import bpy, math
def sun_sky(elev_deg=25, rot_deg=120, sun_strength=3.0, sun_angle_deg=0.53):
    # cielo fisico nel world
    w = bpy.context.scene.world; w.use_nodes = True
    nt = w.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputWorld'); out.location=(400,0)
    bg  = nt.nodes.new('ShaderNodeBackground'); bg.location=(200,0)
    sky = nt.nodes.new('ShaderNodeTexSky'); sky.location=(-100,0)
    sky.sky_type = 'NISHITA'
    sky.sun_elevation = math.radians(elev_deg)
    sky.sun_rotation  = math.radians(rot_deg)
    try:
        sky.altitude = 300; sky.air_density = 1.0; sky.dust_density = 1.5; sky.ozone_density = 1.0
    except Exception: pass
    nt.links.new(sky.outputs['Color'], bg.inputs['Color'])
    nt.links.new(bg.outputs['Background'], out.inputs['Surface'])
    # un Sun object per le ombre nette + coerenza con il cielo
    sd = bpy.data.lights.new("Sun",'SUN'); sd.energy = sun_strength
    sd.angle = math.radians(sun_angle_deg)   # 0.53° = disco solare reale = ombre nitide
    so = bpy.data.objects.new("Sun", sd); bpy.context.collection.objects.link(so)
    so.rotation_euler = (math.radians(90-elev_deg), 0, math.radians(rot_deg))
    return so
# sun_sky(elev_deg=15, rot_deg=210)   # luce radente da tramonto
```

## Portals (INTERNI: meno rumore dalle finestre)

Metti un'area light nel vano di ogni finestra e marcala come portal: guida i campioni
dall'ambiente verso l'interno.

```python
import bpy
def add_portal(loc, size=(1.2,1.5), rot=(0,0,0)):
    ld = bpy.data.lights.new("Portal",'AREA'); ld.shape='RECTANGLE'
    ld.size=size[0]; ld.size_y=size[1]; ld.energy=0.0
    try: ld.cycles.is_portal = True
    except Exception: pass
    ob = bpy.data.objects.new("Portal", ld); ob.location=loc; ob.rotation_euler=rot
    bpy.context.collection.objects.link(ob); return ob
```

Altre leve interni: **Fast GI** (→ `01`), riflettanza pareti non troppo alta, materiali coerenti.

Torna al metodo: [[blender]]. Camera: `04-camera.md`.
