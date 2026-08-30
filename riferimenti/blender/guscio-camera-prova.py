# -*- coding: utf-8 -*-
"""
DOVE CADE IL MONTANTE DEL GUSCIO? Si misura contro la maschera spedita.

    blender -b -P riferimenti/blender/guscio-camera-prova.py

`posa.json` porta una matrice 3x3 chiamata «rotazione stanza verso camera». Per
piazzarci una camera di Blender servono due cose che quel nome non dice: se la
matrice vada usata dritta o trasposta, e se la sorgente guardasse lungo +Z (uso
di visione artificiale) o lungo -Z (uso di Blender). Sono quattro combinazioni,
e indovinarne una e' esattamente cio' che questo repo ha imparato a non fare.

─── LA VERITA' A TERRA C'ERA GIA', E NON L'AVEVO USATA

`public/salone/finestrone.png` e' la maschera del vano in coordinate immagine,
gia' validata contro la fotografia (`posa.json` dichiara 1,56 px). Misurata:

    il montante sta a x = 703, costante da y = 80 a y = 520

e la retta dichiarata (`x = -0,007573 y + 702,911`) predice 700-702. Maschera e
posa concordano entro un paio di pixel. **Quello e' il numero da colpire.**

─── E SI RENDE IN SILHOUETTE, NON GRIGIO SU GRIGIO

Il primo tentativo rendeva il guscio con un materiale chiaro su fondo chiaro, e
il rilevatore trovava «il gradiente verticale piu' forte», che era un bordo
qualunque della stanza -- dando 652 e 656 con l'aria di misure. Con le pareti
NERE e il fondo BIANCO il vano e' l'unica cosa chiara del fotogramma, e il suo
bordo destro non e' piu' interpretabile.

─── E LA PRIMA VOLTA LA CAMERA ERA FUORI DALLA STANZA

La parete davanti stava a `VANO_X0 - 0.5` = -2,6746 mentre la camera sta a
-2,9322: l'osservatore era fuori, a guardare il retro di un muro, e il render
usciva una superficie piatta. Un guscio che non contiene la propria camera non
e' un guscio.
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
USCITE = os.path.join(QUI, 'uscite', 'camera-prova')
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
C = posa['camera']
pos = C['posizione_m']
R = C['rotazione_stanza_verso_camera']

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

M = Matrix(((R[0][0], R[0][1], R[0][2]),
            (R[1][0], R[1][1], R[1][2]),
            (R[2][0], R[2][1], R[2][2])))
FLIP = Matrix.Rotation(math.pi, 4, 'X')
POSIZIONE = Vector((pos['x_dal_montante'],
                    PAVIMENTO + pos['y_sopra_il_pavimento'],
                    pos['z_dalla_parete']))

candidati = [
    ('trasposta_flip', M.transposed().to_4x4() @ FLIP),
    ('trasposta', M.transposed().to_4x4()),
    ('dritta_flip', M.to_4x4() @ FLIP),
    ('dritta', M.to_4x4()),
]

for nome, R4 in candidati:
    cam.matrix_world = R4
    cam.location = POSIZIONE
    sc.render.filepath = os.path.join(USCITE, 'sil_' + nome + '.png')
    bpy.ops.render.render(write_still=True)
    print('  reso', nome)

print('\n  quattro silhouette in', USCITE)
print('  il vano e la zona CHIARA; il montante e il suo bordo destro.')
print('  atteso: x = 703, costante fra y = 80 e y = 520.\n')
