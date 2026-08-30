# -*- coding: utf-8 -*-
"""
LA SECONDA PROVA: il guscio ha parallasse, o e' una lastra con un buco?

    blender -b -P riferimenti/blender/guscio-parallasse.py

`ciao.md` §8 chiede «due still spostando la camera lateralmente e in
profondita', per dimostrare parallasse e imbotti reali». Ma due immagini si
guardano e basta: qui si MISURA la cosa che le distingue.

─── COSA DISTINGUE UN GUSCIO DA UNA LASTRA, in un numero

Una lastra fotografica con un buco, spostando la camera, fa una cosa sola: il
buco trasla. Un vano vero con dodici centimetri di ritorno ne fa due:

  · il bordo VICINO e quello LONTANO dell'imbotte si muovono di quantita'
    DIVERSE, perche' stanno a profondita' diverse -- e' la parallasse;
  · quindi la LARGHEZZA APPARENTE dell'imbotte cambia: spostandosi verso il
    vano si chiude, allontanandosi si apre.

Su una lastra quella larghezza sarebbe costante a zero, perche' l'imbotte non
esiste. Quindi la prova non e' «si vede la parallasse»: e' **di quanti pixel
cambia lo spessore apparente dell'imbotte**, e se il verso e' quello giusto.

Le pose: la sorgente, poi 40 cm a dritta e a sinistra lungo la murata, poi 40 cm
avanti e indietro in profondita'. Cinque render, quattro confronti.
"""
import bpy
import bmesh
import json
import math
import os
from mathutils import Matrix, Vector

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.abspath(os.path.join(QUI, '..', '..'))
POSA = os.path.join(RADICE, 'riferimenti', 'salone', 'posa.json')
USCITE = os.path.join(QUI, 'uscite', 'parallasse')
os.makedirs(USCITE, exist_ok=True)

with open(POSA, encoding='utf-8') as f:
    posa = json.load(f)

G = posa['guscio_m']
V = G['vano']
PAVIMENTO, SOFFITTO = G['pavimento_y_m'], G['soffitto_y_m']
MURATA_VANO, MURATA_OPPOSTA = G['murata_sinistra_z_m'], G['murata_destra_z_m']
VX0, VX1 = V['x_da_m'], V['x_a_m']
VY0, VY1 = V['y_da_m'], V['y_a_m']

larg_px, alt_px = posa['fotogramma_px']
focale_px = posa['dichiarato']['focale_px']
pos = posa['camera']['posizione_m']
R = posa['camera']['rotazione_stanza_verso_camera']

FONDO_X = 6.0
DAVANTI_X = min(VX0, pos['x_dal_montante']) - 0.8
SP = 0.12

bpy.ops.wm.read_homefile(use_empty=True)

nero = bpy.data.materials.new('nero')
nero.use_nodes = True
p = nero.node_tree.nodes['Principled BSDF']
p.inputs['Base Color'].default_value = (0, 0, 0, 1)
p.inputs['Roughness'].default_value = 1.0


def scatola(nome, x0, x1, y0, y1, z0, z1):
    me = bpy.data.meshes.new(nome)
    ob = bpy.data.objects.new(nome, me)
    bpy.context.collection.objects.link(ob)
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); bm.to_mesh(me); bm.free()
    ob.scale = ((x1 - x0), (y1 - y0), (z1 - z0))
    ob.location = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    ob.select_set(False)
    me.materials.append(nero)
    return ob


Z0, Z1 = MURATA_VANO - SP, MURATA_VANO
scatola('pavimento', DAVANTI_X, FONDO_X, PAVIMENTO - 0.08, PAVIMENTO, MURATA_VANO, MURATA_OPPOSTA)
scatola('soffitto', DAVANTI_X, FONDO_X, SOFFITTO, SOFFITTO + 0.08, MURATA_VANO, MURATA_OPPOSTA)
scatola('sotto_vano', VX0, VX1, PAVIMENTO, VY0, Z0, Z1)
scatola('sopra_vano', VX0, VX1, VY1, SOFFITTO, Z0, Z1)
scatola('montante', VX1, FONDO_X, PAVIMENTO, SOFFITTO, Z0, Z1)
scatola('davanti', DAVANTI_X, VX0, PAVIMENTO, SOFFITTO, Z0, Z1)
scatola('opposta', DAVANTI_X, FONDO_X, PAVIMENTO, SOFFITTO, MURATA_OPPOSTA, MURATA_OPPOSTA + SP)
scatola('fondo', FONDO_X, FONDO_X + SP, PAVIMENTO, SOFFITTO, MURATA_VANO, MURATA_OPPOSTA)

cd = bpy.data.cameras.new('C')
cam = bpy.data.objects.new('C', cd)
bpy.context.collection.objects.link(cam)
cd.sensor_fit = 'HORIZONTAL'
cd.sensor_width = 36.0
cd.lens = focale_px * 36.0 / larg_px

sc = bpy.context.scene
sc.camera = cam
sc.render.resolution_x = larg_px
sc.render.resolution_y = alt_px
for motore in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE', 'CYCLES'):
    try:
        sc.render.engine = motore
        break
    except Exception:
        continue
sc.render.image_settings.file_format = 'PNG'
try:
    sc.view_settings.view_transform = 'Standard'
except Exception:
    pass

mondo = bpy.data.worlds.new('w')
mondo.use_nodes = True
b = mondo.node_tree.nodes['Background']
b.inputs[0].default_value = (1, 1, 1, 1)
b.inputs[1].default_value = 6.0
sc.world = mondo

# la convenzione, determinata per misura in `guscio-camera-prova.py`
M = Matrix(((R[0][0], R[0][1], R[0][2]),
            (R[1][0], R[1][1], R[1][2]),
            (R[2][0], R[2][1], R[2][2])))
ORIENT = M.transposed().to_4x4() @ Matrix.Rotation(math.pi, 4, 'X')

BASE = Vector((pos['x_dal_montante'],
               PAVIMENTO + pos['y_sopra_il_pavimento'],
               pos['z_dalla_parete']))

# X e' lungo la murata, Z e' verso l'interno della stanza: quindi lo
# spostamento LATERALE e' lungo X e quello in PROFONDITA' lungo Z.
POSE = [
    ('sorgente', Vector((0, 0, 0))),
    ('lato_piu', Vector((0.40, 0, 0))),
    ('lato_meno', Vector((-0.40, 0, 0))),
    ('vicino', Vector((0, 0, -0.40))),
    ('lontano', Vector((0, 0, 0.40))),
]

for nome, d in POSE:
    cam.matrix_world = ORIENT
    cam.location = BASE + d
    sc.render.filepath = os.path.join(USCITE, nome + '.png')
    bpy.ops.render.render(write_still=True)
    print(f'  reso {nome}   camera {tuple(round(v,4) for v in (BASE + d))}')

print('\n  cinque pose in', USCITE)
print('  misurare da fuori: bordo del bianco (lato lontano dell imbotte),')
print('  bordo della fascia scura (lato vicino), e la loro DISTANZA.')
print('  su una lastra quella distanza sarebbe zero e costante.\n')
