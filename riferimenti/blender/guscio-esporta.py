# -*- coding: utf-8 -*-
"""
IL GUSCIO CHE IL SITO SPEDISCE: geometria piu UV gia proiettate.

    blender -b -P riferimenti/blender/guscio-esporta.py

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

# ─────────────────────────────────────────────────────────────────────────────
#
#  L'ESPORTAZIONE, e perche' le UV vanno COTTE e non calcolate nel browser
#
#  Il sito potrebbe proiettare a runtime, con uno shader che rifa' questa
#  aritmetica su ogni vertice. Sarebbe la stessa matematica in un secondo
#  posto -- e questo repo ha gia' pagato due volte il prezzo di avere due
#  implementazioni della stessa cosa, l'ultima con 56,85 livelli di scarto
#  fra due gradienti che dovevano essere identici.
#
#  Qui le UV sono FISSE: la camera sorgente non si muove mai, quindi la
#  proiezione e' un dato del modello, non un calcolo. Cotte nel GLB, il
#  browser applica una texture video e basta. Nessuno shader, nessuna
#  matrice da tenere sincronizzata, e la stessa aritmetica che ha misurato
#  1,175 px di errore medio contro le rette del vano.
#
#  Il canale UV si chiama `proiettata` in Blender e diventa TEXCOORD_0 nel
#  GLB, che e' quello che three.js legge senza dover sapere niente.

import os

for ob in pezzi:
    me = ob.data
    if me.uv_layers.active is not me.uv_layers['proiettata']:
        me.uv_layers.active = me.uv_layers['proiettata']

#  UN MATERIALE SEMPLICE, SENZA IMMAGINE.
#
#  Esportare il materiale FOTO ci porta dentro anche la fotografia: il GLB
#  passa da 122 a 881 KB compressi, e il validatore Khronos alza
#  IMAGE_FEATURES_UNSUPPORTED. Al sito quell'immagine non serve -- la texture
#  la fornisce lui, ed e' un video.
#
#  Ma esportare SENZA materiali fa cadere `collaudo-gltf`, che ha ragione: una
#  primitiva senza materiale prende il grigio di riserva di three.js e il pezzo
#  esce di plastica, senza un errore. Un GLB deve descriversi da solo.
#
#  Quindi: un materiale c'e', e non porta niente. Chi legge il file vede un
#  grigio dichiarato invece di un buco; chi lo monta ci mette il video.
piano = bpy.data.materials.new('GUSCIO')
piano.use_nodes = True
for ob in pezzi:
    ob.data.materials.clear()
    ob.data.materials.append(piano)

glb = os.path.join(USCITE, 'guscio-salone.glb')
bpy.ops.object.select_all(action='DESELECT')
for ob in pezzi:
    ob.select_set(True)
#  `export_yup=False` NON e' un dettaglio: e' la differenza fra un guscio nel
#  posto giusto e una scatola blu che sbuca dalla tuga.
#
#  Questo copione lavora in **Y in alto** -- `posa.json` dichiara «X lungo la
#  murata, Y in alto, Z fuori dalla parete» -- dentro un Blender che invece e'
#  Z in alto. La convenzione e' coerente perche' tutta l'aritmetica della posa
#  la usa cosi', ma l'esportatore glTF non lo sa: di suo converte da Z-up a
#  Y-up e ruota tutto di novanta gradi attorno a X.
#
#  Il risultato, visto: il guscio caricato nel sito come una scatola sbagliata
#  sopra la sovrastruttura. Con la conversione spenta gli assi del GLB sono
#  quelli di `posa.json`, e la trasformazione calcolata in `guscio.js` combacia.
bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB',
                          use_selection=True,
                          export_apply=True,
                          # I MATERIALI SI ESPORTANO, anche se il sito li
                          # sostituisce. `collaudo-gltf` boccia le primitive
                          # senza materiale, e ha ragione: three.js ci mette il
                          # grigio di riserva e il pezzo esce di plastica --
                          # nessun errore, solo una resa sbagliata. Che QUESTO
                          # sito lo rimpiazzi non lo puo' sapere chi legge il
                          # file. Un GLB deve descriversi da solo.
                          export_materials='EXPORT',
                          export_normals=True,
                          export_texcoords=True,
                          export_yup=False)

print('')
print('  GUSCIO CON LE UV PROIETTATE')
print('  ' + '-' * 60)
print(f'  pezzi        {len(pezzi)}')
print(f'  UV           {dentro} dentro, {fuori} dietro la camera')
print(f'  GLB          {glb}   {os.path.getsize(glb)} byte')
print('')
