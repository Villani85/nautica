# -*- coding: utf-8 -*-
"""
QUALE ASPETTO VUOLE `UV Project`? Si misura contro la fotografia stessa.

    blender -b -P riferimenti/blender/guscio-proiezione-aspetto.py

Proiettando la fotografia dalla camera sorgente e renderizzando dalla STESSA
camera, il risultato deve essere la fotografia: ogni punto della geometria
finisce nel pixel da cui e' stato proiettato. Non e' un'opinione, e' una
tautologia -- se non succede, la proiezione e' tarata male.

Al primo tentativo (`aspect_x = 1280, aspect_y = 720`) l'immagine usciva
schiacciata e spostata: differenza media 29,4 livelli su 255, dove la stessa
stanza in due pose diverse ne fa 10,6. Il contenuto era giusto -- coppia,
lampada, legno tutti riconoscibili -- ma la mappatura no.

`UVProjectModifier` ha due campi di aspetto la cui semantica il nome non
chiarisce. Qui si provano i rapporti plausibili e si tiene quello che
**riproduce la fotografia**, misurando la differenza media sui pixel coperti
dal guscio. Il vincitore non e' il piu' bello: e' quello che si avvicina a zero.
"""
import bpy
import bmesh
import json
import math
import os
import subprocess
from mathutils import Matrix, Vector

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.abspath(os.path.join(QUI, '..', '..'))
POSA = os.path.join(RADICE, 'riferimenti', 'salone', 'posa.json')
BASE_U = os.path.join(QUI, 'uscite', 'proiezione')
USCITE = os.path.join(BASE_U, 'aspetto')
FOTO = os.path.join(BASE_U, 'fotogramma0.png')
os.makedirs(USCITE, exist_ok=True)

if not os.path.exists(FOTO):
    os.makedirs(BASE_U, exist_ok=True)
    subprocess.run(['ffmpeg', '-y', '-v', 'error',
                    '-i', os.path.join(RADICE, 'public', 'filmati', 'salone-largo.mp4'),
                    '-frames:v', '1', '-vf', 'scale=1280:720', FOTO], check=True)

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

img = bpy.data.images.load(FOTO)
mat = bpy.data.materials.new('FOTO')
mat.use_nodes = True
nt = mat.node_tree
for n in list(nt.nodes):
    nt.nodes.remove(n)
out = nt.nodes.new('ShaderNodeOutputMaterial')
emi = nt.nodes.new('ShaderNodeEmission')
tex = nt.nodes.new('ShaderNodeTexImage')
tex.image = img
tex.extension = 'CLIP'
nt.links.new(tex.outputs['Color'], emi.inputs['Color'])
nt.links.new(emi.outputs['Emission'], out.inputs['Surface'])

pezzi = []


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
    me.uv_layers.new(name='proiettata')
    me.materials.append(mat)
    pezzi.append(ob)
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

M = Matrix(((R[0][0], R[0][1], R[0][2]),
            (R[1][0], R[1][1], R[1][2]),
            (R[2][0], R[2][1], R[2][2])))
ORIENT = M.transposed().to_4x4() @ Matrix.Rotation(math.pi, 4, 'X')
BASE = Vector((pos['x_dal_montante'],
               PAVIMENTO + pos['y_sopra_il_pavimento'],
               pos['z_dalla_parete']))


def fai_camera(nome):
    cd = bpy.data.cameras.new(nome)
    cd.sensor_fit = 'HORIZONTAL'
    cd.sensor_width = 36.0
    cd.lens = focale_px * 36.0 / larg_px
    ob = bpy.data.objects.new(nome, cd)
    bpy.context.collection.objects.link(ob)
    ob.matrix_world = ORIENT
    ob.location = BASE
    return ob


proiettore = fai_camera('CAM_SORGENTE')
cam = fai_camera('CAM_RIPRESA')

modificatori = []
for ob in pezzi:
    m = ob.modifiers.new('proiezione', 'UV_PROJECT')
    m.uv_layer = 'proiettata'
    m.projector_count = 1
    m.projectors[0].object = proiettore
    modificatori.append(m)

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
mondo.node_tree.nodes['Background'].inputs[0].default_value = (0, 0, 0, 1)
sc.world = mondo

CANDIDATI = [
    ('ax1_ay1', 1.0, 1.0),
    ('ax169_ay1', larg_px / alt_px, 1.0),
    ('ax1_ay169', 1.0, larg_px / alt_px),
    ('ax1280_ay720', float(larg_px), float(alt_px)),
]

for nome, ax, ay in CANDIDATI:
    for m in modificatori:
        m.aspect_x = ax
        m.aspect_y = ay
    sc.render.filepath = os.path.join(USCITE, nome + '.png')
    bpy.ops.render.render(write_still=True)
    print(f'  reso {nome}   aspect {ax:.4f} / {ay:.4f}')

print('\n  quattro aspetti in', USCITE)
print('  misurare da fuori: differenza media contro fotogramma0.png,')
print('  sui pixel coperti dal guscio. Vince chi si avvicina a zero.\n')
