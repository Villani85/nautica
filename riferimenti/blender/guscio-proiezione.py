# -*- coding: utf-8 -*-
"""
LA TERZA PROVA: la fotografia proiettata sul guscio, e la camera che si muove.

    blender -b -P riferimenti/blender/guscio-proiezione.py

Le prime due prove dicono che il guscio e' in registro (-3 px sul montante) e
che ha profondita' vera (lo spessore apparente dell'imbotte varia di 43 px fra
cinque pose). Restano vere anche se il guscio fosse grigio.

Questa e' la prova che conta per il sito: **la fotografia proiettata dalla
camera sorgente resta incollata alla geometria** mentre il punto di vista si
sposta. E ha una verifica che non ammette opinioni: renderizzando dalla STESSA
camera da cui si proietta, il risultato deve ESSERE la fotografia. Ogni punto
finisce nel pixel da cui e' stato proiettato. Se non succede, la proiezione e'
tarata male.

─── LE UV SI CALCOLANO, NON SI DELEGANO A UN MODIFICATORE

Primo tentativo col modificatore `UV Project` di Blender: immagine schiacciata,
73% della geometria fuori dalla texture, differenza media 29,4 livelli su 255
dove la stessa stanza in due pose diverse ne fa 10,6. Provati quattro valori di
aspetto (1:1, 16:9, 9:16, 1280:720): il migliore resta a 29,4. Il modificatore
ha convenzioni che il suo nome non dichiara, ed e' la terza volta stanotte che
inseguo la convenzione di qualcun altro.

Qui la proiezione si calcola a mano, con la stessa aritmetica gia' verificata
contro la maschera spedita: mondo -> spazio camera -> pixel -> UV. Tre righe,
nessuna convenzione da indovinare, e il risultato si misura.
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
USCITE = os.path.join(QUI, 'uscite', 'proiezione')
FOTO = os.path.join(USCITE, 'fotogramma0.png')
FRAMES = os.path.join(USCITE, 'fotogrammi')
os.makedirs(USCITE, exist_ok=True)
os.makedirs(FRAMES, exist_ok=True)

if not os.path.exists(FOTO):
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
cx, cy = posa['dichiarato']['punto_principale_px']
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


def scatola(nome, x0, x1, y0, y1, z0, z1, taglia=0.0):
    """una scatola d'asse; `taglia` suddivide le facce, perche' una proiezione
    prospettica su un quadrilatero grande interpola male fra quattro vertici"""
    me = bpy.data.meshes.new(nome)
    ob = bpy.data.objects.new(nome, me)
    bpy.context.collection.objects.link(ob)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bm.to_mesh(me)
    bm.free()
    ob.scale = ((x1 - x0), (y1 - y0), (z1 - z0))
    ob.location = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if taglia:
        bm = bmesh.new()
        bm.from_mesh(me)
        for _ in range(int(taglia)):
            bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=1, use_grid_fill=True)
        bm.to_mesh(me)
        bm.free()
    ob.select_set(False)
    me.uv_layers.new(name='proiettata')
    me.materials.append(mat)
    pezzi.append(ob)
    return ob


Z0, Z1 = MURATA_VANO - SP, MURATA_VANO
# le superfici grandi si suddividono: la prospettiva non e' lineare nelle UV, e
# su un quadrilatero da sei metri l'interpolazione fra quattro angoli sbaglia
scatola('pavimento', DAVANTI_X, FONDO_X, PAVIMENTO - 0.08, PAVIMENTO, MURATA_VANO, MURATA_OPPOSTA, 5)
scatola('soffitto', DAVANTI_X, FONDO_X, SOFFITTO, SOFFITTO + 0.08, MURATA_VANO, MURATA_OPPOSTA, 5)
scatola('sotto_vano', VX0, VX1, PAVIMENTO, VY0, Z0, Z1, 4)
scatola('sopra_vano', VX0, VX1, VY1, SOFFITTO, Z0, Z1, 4)
scatola('montante', VX1, FONDO_X, PAVIMENTO, SOFFITTO, Z0, Z1, 5)
scatola('davanti', DAVANTI_X, VX0, PAVIMENTO, SOFFITTO, Z0, Z1, 4)
scatola('opposta', DAVANTI_X, FONDO_X, PAVIMENTO, SOFFITTO, MURATA_OPPOSTA, MURATA_OPPOSTA + SP, 5)
scatola('fondo', FONDO_X, FONDO_X + SP, PAVIMENTO, SOFFITTO, MURATA_VANO, MURATA_OPPOSTA, 4)

M = Matrix(((R[0][0], R[0][1], R[0][2]),
            (R[1][0], R[1][1], R[1][2]),
            (R[2][0], R[2][1], R[2][2])))
ORIENT = M.transposed().to_4x4() @ Matrix.Rotation(math.pi, 4, 'X')
BASE = Vector((pos['x_dal_montante'],
               PAVIMENTO + pos['y_sopra_il_pavimento'],
               pos['z_dalla_parete']))

# gli assi della camera sorgente, dalla convenzione determinata per misura
DESTRA = Vector((ORIENT[0][0], ORIENT[1][0], ORIENT[2][0]))
SU = Vector((ORIENT[0][1], ORIENT[1][1], ORIENT[2][1]))
AVANTI = -Vector((ORIENT[0][2], ORIENT[1][2], ORIENT[2][2]))


def proietta():
    """scrive le UV: mondo -> spazio camera -> pixel -> 0..1

    E' la stessa aritmetica con cui ho verificato il montante contro la
    maschera: il punto (0, 0.6, 0) cade a 700 px e la maschera lo mette a 703.
    """
    fuori = 0
    dentro = 0
    for ob in pezzi:
        me = ob.data
        uvl = me.uv_layers['proiettata'].data
        mw = ob.matrix_world
        for poly in me.polygons:
            for li in poly.loop_indices:
                vi = me.loops[li].vertex_index
                p = mw @ me.vertices[vi].co
                d = p - BASE
                prof = d.dot(AVANTI)
                if prof <= 1e-4:
                    uvl[li].uv = (-1.0, -1.0)   # dietro la camera: fuori texture
                    fuori += 1
                    continue
                u_px = cx + focale_px * d.dot(DESTRA) / prof
                v_px = cy - focale_px * d.dot(SU) / prof
                uvl[li].uv = (u_px / larg_px, 1.0 - v_px / alt_px)
                dentro += 1
    return dentro, fuori


dentro, fuori = proietta()
print(f'  UV calcolate: {dentro} dentro, {fuori} dietro la camera')


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


cam = fai_camera('CAM_RIPRESA')
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

cam.location = BASE
sc.render.filepath = os.path.join(USCITE, 'proiettato-sorgente.png')
bpy.ops.render.render(write_still=True)
print('  reso  proiettato-sorgente')

# --- la clip: entra verso il vano e torna, senza tagli -------------------
#
# Andata e ritorno sulla stessa curva, cosi' primo e ultimo fotogramma
# coincidono e la clip si guarda in ciclo senza salto: la stessa regola che
# `collaudo-loop` chiede agli altri filmati.
N = 61
for k in range(N):
    s = math.sin((k / (N - 1)) * math.pi)
    cam.location = BASE + Vector((0.55 * s, 0.10 * s, -0.35 * s))
    sc.render.filepath = os.path.join(FRAMES, f'f{k:03d}.png')
    bpy.ops.render.render(write_still=True)
print(f'  resi {N} fotogrammi')
print('')
