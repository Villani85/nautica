# -*- coding: utf-8 -*-
"""
QUANTO RECUPERA LA NORMALE — la misura che giustifica di spedire la BASSA.

    blender -b -P confronto-macchine.py -- <cartella> <quale> [campioni]

Rende TRE volte la stessa inquadratura con la stessa luce:

    alta            la geometria con gli smussi veri
    bassa+normale   la geometria che si spedisce, con la mappa che si spedisce
    bassa nuda      la stessa senza mappa

e misura quanta parte dello scarto fra «bassa nuda» e «alta» la mappa
restituisce. E' lo stesso conto di `cuoci-impianto.py confronto`, e la stessa
domanda: **spedire meno geometria piu' una texture conviene, oppure no?**
Senza questo numero e' una convinzione.

─── DUE COSE CHE RENDONO ONESTO IL CONFRONTO

1. Si usa la mappa SPEDITA, non quella cotta. Cuocere a 2048 e misurare a 2048
   direbbe quanto e' brava la cottura; qui interessa quanto e' brava la mappa
   che finisce nel file, dopo il ridimensionamento e dopo il webp.

2. Si buttano le facce enormi. `prop_scafo` ha due facce da 4 m2 l'una: sono
   piatte, la normale non ha niente da dirci sopra, e riempirebbero mezzo
   quadro diluendo la misura con l'unica superficie su cui la mappa non fa
   differenza. E' la stessa esclusione che fa l'impianto col suo fasciame, e
   li' era motivata dall'area allo stesso modo.

La luce non deve essere bella: deve essere IDENTICA nei tre render e radente
abbastanza da far contare gli spigoli, che sono cio' che la mappa recupera.

I percorsi si risolvono PRIMA di aprire il .blend: `open_mainfile` sposta la
directory di lavoro di Blender, e un percorso relativo passato dopo non punta
piu' dove si crede — `images.load` fallisce a meta' del terzo render, quando i
primi due sono gia' costati due minuti. Trappola documentata in
`cuoci-impianto.py`, ripagata qui a costo zero leggendola.
"""
import bpy
import sys
import os
import math
import time
import numpy as np
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
FUORI = argv[0]
QUALE = argv[1]
CAMPIONI = int(argv[2]) if len(argv) > 2 else 96
RADICE = {'propulsione': 'PROPULSIONE', 'giroscopio': 'GIROSCOPIO'}[QUALE]

BLEND = os.path.abspath(os.path.join(FUORI, '%s-cottura.blend' % QUALE))
PNG = os.path.abspath(os.path.join(FUORI, 'cottura-%s' % QUALE, 'spedito',
                                   '%s_bassa-normale.png' % QUALE))
USCITA = os.path.abspath(os.path.join(FUORI, 'confronto-%s' % QUALE))
os.makedirs(USCITA, exist_ok=True)
if not os.path.isfile(PNG):
    raise SystemExit('ERRORE: non trovo la normale spedita in %s' % PNG)


def con_normale(ob, png):
    img = bpy.data.images.load(png, check_existing=True)
    img.colorspace_settings.name = 'Non-Color'
    for m in ob.data.materials:
        if not m or not m.use_nodes:
            continue
        nt = m.node_tree
        b = next((x for x in nt.nodes if x.type == 'BSDF_PRINCIPLED'), None)
        if b is None:
            continue
        t = nt.nodes.new('ShaderNodeTexImage')
        t.image = img
        n = nt.nodes.new('ShaderNodeNormalMap')
        nt.links.new(t.outputs['Color'], n.inputs['Color'])
        nt.links.new(n.outputs['Normal'], b.inputs['Normal'])


def scena(ob):
    """Studio identico per i tre render, tarato sull'ingombro DI RIFERIMENTO.

    ─── LA CAMERA SI CALCOLA UNA VOLTA SOLA, E QUI STA LA TRAPPOLA

    SINTOMO: il giroscopio dava |bassa nuda - alta| = 24,5 livelli e un
    recupero del 7,6%, contro 11,2 livelli e 61,8% della propulsione. Numeri
    incoerenti fra due modelli fatti dallo stesso costruttore.
    CAUSA: la camera veniva inquadrata sull'ingombro dell'oggetto MOSTRATO, e
    la alta e la bassa non hanno lo stesso ingombro — gli smussi mangiano
    2,5 mm per spigolo. Su una macchina da 1,8 m sono lo 0,3% di distanza in
    piu' o in meno: le tre immagini non erano allineate al pixel, e su una
    sfera bianca ad alto contrasto un disallineamento sub-percentuale produce
    differenze enormi sul bordo. Si stava misurando lo spostamento della
    camera, non la mappa.
    COME L'HO ISOLATA: dal confronto fra i due soggetti. Lo stesso codice dava
    61,8% su un modello da 7,5 m e 7,6% su uno da 1,8 — e il rapporto fra le
    due lunghezze e' esattamente il rapporto fra gli errori di inquadratura.
    Un'incoerenza che scala con la TAGLIA del soggetto non viene dal soggetto.

    Adesso il riquadro si prende SEMPRE dalla alta, e i tre render guardano
    lo stesso punto dalla stessa distanza.
    """
    bpy.context.view_layer.update()
    mn = Vector((1e9, 1e9, 1e9))
    mx = Vector((-1e9, -1e9, -1e9))
    for v in RIQUADRO.bound_box:
        p = RIQUADRO.matrix_world @ Vector(v)
        mn = Vector((min(mn[i], p[i]) for i in range(3)))
        mx = Vector((max(mx[i], p[i]) for i in range(3)))
    centro = (mn + mx) / 2
    D = max(mx - mn)

    luci = (('striscia', (centro.x - D * .45, centro.y - D * .30, mx.z + D * .50),
             900, D * 1.2, 0.28),
            ('radente', (centro.x + D * .60, centro.y - D * .10, centro.z + D * .05),
             500, D * 1.0, 0.20),
            ('alto', (centro.x, centro.y + D * .20, mx.z + D * .45),
             600, D * .5, D * .3))
    for nome, pos, watt, dx, dy in luci:
        d = bpy.data.lights.new(nome, 'AREA')
        d.energy = watt * (D / 6.0) ** 2
        d.shape = 'RECTANGLE'
        d.size = dx
        d.size_y = dy
        o = bpy.data.objects.new(nome, d)
        bpy.context.collection.objects.link(o)
        o.location = pos
        verso = (Vector(centro) - Vector(pos)).normalized()
        o.rotation_euler = verso.to_track_quat('-Z', 'Y').to_euler()
        # una softbox e' visibile ai raggi di camera per difetto: sarebbe un
        # pannello bianco in scena, identico nei tre render ma comunque area
        # di quadro sprecata
        o.visible_camera = False

    sc = bpy.context.scene
    sc.world = bpy.data.worlds.new('w')
    sc.world.use_nodes = True
    sc.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.25

    cd = bpy.data.cameras.new('c')
    cd.lens = 50.0
    cd.sensor_width = 36.0
    cd.sensor_fit = 'HORIZONTAL'
    cam = bpy.data.objects.new('c', cd)
    bpy.context.collection.objects.link(cam)
    sc.camera = cam
    az = math.radians(56)
    el = math.radians(19)
    verso = Vector((-math.cos(el) * math.sin(az),
                    math.cos(el) * math.cos(az), -math.sin(el)))
    destra = verso.cross(Vector((0, 0, 1)))
    destra.normalize()
    su = destra.cross(verso)
    su.normalize()
    mh = cd.sensor_width / 2 / cd.lens
    mv = mh / (16.0 / 9.0)
    sh = sv = 0.0
    for k in range(8):
        a = Vector((mx.x if k & 1 else mn.x,
                    mx.y if k & 2 else mn.y,
                    mx.z if k & 4 else mn.z)) - centro
        sh = max(sh, abs(a.dot(destra)))
        sv = max(sv, abs(a.dot(su)))
    cam.location = centro - verso * (max(sh / mh, sv / mv) * 1.10)
    cam.rotation_euler = verso.to_track_quat('-Z', 'Y').to_euler()

    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'          # su questa macchina non c'e' GPU: misurato
    sc.cycles.samples = CAMPIONI
    sc.cycles.use_denoising = True
    sc.render.resolution_x = 1280
    sc.render.resolution_y = 720
    sc.render.film_transparent = True     # l'alfa serve a confrontare solo la materia
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    try:
        sc.view_settings.view_transform = 'AgX'
    except Exception:
        pass


def rendi(percorso):
    bpy.context.scene.render.filepath = percorso
    bpy.ops.render.render(write_still=True)
    im = bpy.data.images.load(percorso, check_existing=False)
    w, h = im.size
    px = np.empty(w * h * 4, dtype=np.float32)
    im.pixels.foreach_get(px)
    return px.reshape(h, w, 4)


esiti = {}
for etichetta in ('alta', 'bassa-normale', 'bassa-nuda'):
    bpy.ops.wm.open_mainfile(filepath=BLEND)
    alta = bpy.data.objects[RADICE + '_ALTA']
    bassa = bpy.data.objects[RADICE + '_BASSA']
    for ob in (alta, bassa):
        via = set(p.index for p in ob.data.polygons if p.area > 2.0)
        if via:
            for p in ob.data.polygons:
                p.select = p.index in via
            bpy.ops.object.select_all(action='DESELECT')
            ob.select_set(True)
            bpy.context.view_layer.objects.active = ob
            bpy.ops.object.mode_set(mode='EDIT')
            bpy.ops.mesh.delete(type='FACE')
            bpy.ops.object.mode_set(mode='OBJECT')
        ob.hide_render = True
    for o in bpy.data.objects:
        if o.name.endswith('_MESH'):
            o.hide_render = True
    mostrato = alta if etichetta == 'alta' else bassa
    mostrato.hide_render = False
    if etichetta == 'bassa-normale':
        con_normale(bassa, PNG)
    globals()['RIQUADRO'] = alta
    scena(mostrato)
    t = time.time()
    esiti[etichetta] = rendi(os.path.join(USCITA, etichetta + '.png'))
    print('RESO  %-14s %d campioni, %.0f s' % (etichetta, CAMPIONI, time.time() - t))
    sys.stdout.flush()

A = esiti['alta']
B = esiti['bassa-normale']
C = esiti['bassa-nuda']


def lum(p):
    return 0.2126 * p[..., 0] + 0.7152 * p[..., 1] + 0.0722 * p[..., 2]


m = (A[..., 3] > 0.5) & (B[..., 3] > 0.5) & (C[..., 3] > 0.5)
la = lum(A)
lb = lum(B)
lc = lum(C)
err_b = float(np.mean(np.abs(lb - la)[m]))
err_c = float(np.mean(np.abs(lc - la)[m]))
print('')
print('CONFRONTO %s' % QUALE)
print('  pixel confrontati: %d (%.1f%% del quadro)'
      % (int(m.sum()), 100.0 * m.sum() / m.size))
print('  |bassa+normale - alta|  media %.3f livelli' % (err_b * 255))
print('  |bassa nuda    - alta|  media %.3f livelli' % (err_c * 255))
print('  |bassa+normale - bassa nuda|  media %.3f livelli  <- quanto FA la mappa'
      % float(np.mean(np.abs(lb - lc)[m]) * 255))
print('  RECUPERO: la normale restituisce il %.1f%% dello scarto fra bassa nuda e alta'
      % (100.0 * (err_c - err_b) / err_c if err_c > 0 else 0.0))
print('  immagini in %s' % USCITA)
