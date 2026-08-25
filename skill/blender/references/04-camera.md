# 04 — Camera come una reflex

Una camera "da CG" (grandangolo su un volto, tutto a fuoco, nessun difetto ottico) è la firma
del finto. Punta a una **coppia focale+sensore reale**, **DoF con F-Stop**, esposizione fisica.

## Scelte

- **Focale** per soggetto: **50 mm** naturale · **18–35 mm** interni/architettura · **35–85 mm**
  auto (3/4 hero) · **85–120 mm** ritratto/prodotto (comprime e lusinga). Grandangolo sui volti =
  effetto "giocattolo".
- **Sensore**: 36 mm (full-frame) di default; la focale legge giusto **solo** rispetto al sensore.
- **DoF / F-Stop**: f/1.2–2.8 cinematico · **f/5.6–11 auto** · f/8–16 profondo (prodotto/architettura).
  Richiede **scala reale** per comportarsi da DSLR.
- **Esposizione**: regola con i **Watt** delle luci e con `view_settings.exposure` (→ `01`), non con
  moltiplicatori arbitrari; lascia che AgX faccia il rolloff dei bright.
- **Motion blur**: in-camera (Render Properties), per ruote/soggetti in movimento; spento se nulla
  si muove. DoF e motion blur sono **in-camera**; glare/CA/distorsione stanno nel compositor (→ `07`).

## Ricetta bpy — camera fotografica con DoF

```python
import bpy, math
from mathutils import Vector

def photo_camera(name="PhotoCam", location=(6,-6,2.2), look_at="Carrozzeria",
                 lens_mm=65, sensor_mm=36, fstop=7.1, motion_blur=False):
    cd = bpy.data.cameras.new(name)
    cd.lens = lens_mm
    cd.sensor_fit = 'HORIZONTAL'; cd.sensor_width = sensor_mm
    cd.dof.use_dof = True
    cd.dof.aperture_fstop = fstop
    cam = bpy.data.objects.new(name, cd)
    cam.location = location
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    # punta al soggetto e mette il fuoco su di esso
    target = bpy.data.objects.get(look_at)
    if target is not None:
        cd.dof.focus_object = target
        direction = target.matrix_world.translation - cam.location
        cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    else:
        cd.dof.focus_distance = (Vector(location)).length
    # motion blur (in-camera)
    sc = bpy.context.scene
    sc.render.use_motion_blur = motion_blur
    if motion_blur:
        sc.render.motion_blur_shutter = 0.5
    return cam

# Auto 3/4 hero:
photo_camera("CarHero", location=(6.5,-6.5,1.8), look_at="Carrozzeria",
             lens_mm=70, fstop=8.0, motion_blur=False)
```

## Inquadratura calcolata, non a occhio

Decidi **dove deve FINIRE** la camera (il tre quarti da catalogo) e torna indietro; misura la
**scatola** d'ingombro del soggetto **montato** (non lo stato corrente), o su verticale l'oggetto
esce dal campo. Su schermo verticale conviene far **sforare** l'oggetto ai lati (si legge come
ingombro), tenendo sempre l'altezza dentro. Regole pagate: [[confronto-gemini-sempre-anonimo]] e
[[render3d-in-video-reale]] (bounding box montata, giro camera scritto al contrario).

```python
# esempio: incornicia un oggetto misurando la sua bounding box mondiale
import bpy
from mathutils import Vector
def bbox_world(obj):
    return [obj.matrix_world @ Vector(c) for c in obj.bound_box]
```

Torna al metodo: [[blender]]. Render: `01-render-cycles.md`.
