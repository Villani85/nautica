# -*- coding: utf-8 -*-
"""
IL GUSCIO DEL SALONE — prova di spazio, non arredamento.

    blender -b -P riferimenti/blender/guscio-salone.py

─── PERCHE' NON SERVE IL 3D GENERATIVO, E NEMMENO MODELLARE A MANO

Hyper3D Rodin, Hunyuan3D, Tripo e simili fanno una cosa sola: da un testo o
un'immagine tirano fuori una mesh **normalizzata**, cioe' a scala arbitraria, di
forma plausibile. Sono lo strumento giusto per una poltrona, una lampada, una
scultura: oggetti la cui forma e' complicata e la cui posizione non e' vincolata.

Questo guscio e' il problema opposto. E' **sei piani e un buco**, di forma
banale, ma le loro posizioni devono coincidere con la fotografia entro un paio di
pixel: `posa.json` dichiara 1,175 px di errore medio su un tetto di 4, e sopra
quella cifra poggiano `vano.json`, `finestrone.png` e tutto il compositing. Una
mesh generata arriva senza alcun rapporto con le rette misurate, e portarcela
costerebbe piu' che costruirla esatta.

E non serve nemmeno modellarla a mano, che e' quello che avevo scritto io in
`ciao2.md`: **i numeri ci sono gia' tutti**, misurati, dentro `posa.json` →
`guscio_m`. Un guscio si scrive, non si scolpisce.

Il 3D generativo tornera' utile dopo, per gli arredi — divano, tavolo, lampada —
e `ciao.md` §8 li esclude esplicitamente da questa prima prova.

─── COSA E' MISURATO E COSA NO

Tutto in metri, assi come li dichiara `posa.json`:

    X   lungo la murata di sinistra, verso il fondo della stanza
    Y   in alto
    Z   fuori dalla parete, verso l'interno
    O   spigolo BASSO DESTRO del vano: incrocio fra montante e battuta

MISURATO:
    pavimento        y = -0,5628      soffitto  y = +1,7872   (aria 2,35 m)
    murata col vano  z =  0,0
    vano             x da -2,1746 a 0,   y da 0 a 1,1449

DICHIARATO, NON MISURATO — e il file lo dice da se':
    murata opposta   z = 4,5747   e' il BAGLIO della tuga, non una misura
    x_da del vano    -2,1746 e' dove la parete esce dal bordo sinistro del
                     fotogramma: un MINIMO perche' il guscio copra l'inquadratura,
                     non la larghezza vera (il montante di sinistra e' fuori campo)
    paratia di fondo NULL. Il pavimento e' letto con certezza fino a x = 1,90 m;
                     il solo limite vero e' la fine della tuga, x = 12,568 m.

Per la paratia di fondo questo script SCEGLIE, e lo dichiara: `FONDO_X`. Non e'
una misura e nessun cancello deve trattarla come tale. Sta fra i due estremi
sopra, e cambiarla non tocca niente di cio' che si vede dalla posa sorgente --
il che e' anche il modo di verificarlo.
"""
import bpy
import bmesh
import json
import math
import os
import sys
from mathutils import Matrix, Vector

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.abspath(os.path.join(QUI, '..', '..'))
POSA = os.path.join(RADICE, 'riferimenti', 'salone', 'posa.json')
USCITE = os.path.join(QUI, 'uscite')
os.makedirs(USCITE, exist_ok=True)

with open(POSA, encoding='utf-8') as f:
    posa = json.load(f)

G = posa['guscio_m']
V = G['vano']

PAVIMENTO = G['pavimento_y_m']
SOFFITTO = G['soffitto_y_m']
MURATA_VANO = G['murata_sinistra_z_m']
MURATA_OPPOSTA = G['murata_destra_z_m']

VANO_X0, VANO_X1 = V['x_da_m'], V['x_a_m']
VANO_Y0, VANO_Y1 = V['y_da_m'], V['y_a_m']

# --- LE DUE SCELTE, dichiarate qui e in nessun altro posto ---------------
#
# La paratia di fondo non e' misurata. Si sceglie dentro i limiti che il file
# dichiara: oltre il pavimento letto (1,90 m) e sotto la fine della tuga
# (12,568 m). Sei metri lascia profondita' alla parallasse senza inventare
# una stanza lunga il doppio di quella che si vede.
FONDO_X = 6.0
# E la parete davanti alla camera: il vano esce dal quadro a -2,1746, quindi
# il guscio deve arrivare almeno li'. Mezzo metro di margine perche' muovendo
# la camera di lato non compaia il bordo del mondo.
# LA PARETE DAVANTI DEVE STARE DIETRO LA CAMERA
#
# Prima era `VANO_X0 - 0.5` = -2,6746, e la camera sta a -2,9322: il render
# usciva una superficie grigia piatta perche l osservatore era FUORI dalla
# stanza, a guardare il retro di una parete. Un guscio che non contiene la
# propria camera non e un guscio.
DAVANTI_X = min(VANO_X0, posa['camera']['posizione_m']['x_dal_montante']) - 0.8

# --- SPESSORI, che servono a fare imbotti vere e non un buco in un foglio -
#
# Un'imbotte a spessore zero non produce occlusione ne' parallasse: il vano
# tornerebbe una finestra disegnata. Dodici centimetri e' una murata di
# sovrastruttura plausibile e basta a vedersi girare attorno.
SPESSORE_MURATA = 0.12
SPESSORE_SOLAIO = 0.08


def pulisci():
    bpy.ops.wm.read_homefile(use_empty=True)


def materiale(nome, colore, ruvidita=0.55, metallo=0.0):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*colore, 1.0)
    p.inputs['Roughness'].default_value = ruvidita
    p.inputs['Metallic'].default_value = metallo
    return m


def scatola(nome, x0, x1, y0, y1, z0, z1, mat):
    """una scatola d'asse, in metri, con nome stabile"""
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
    ob.select_set(False)
    me.materials.append(mat)
    return ob


pulisci()

MAT_LEGNO = materiale('GUSCIO_legno', (0.075, 0.042, 0.026), 0.42)
MAT_PARETE = materiale('GUSCIO_parete', (0.62, 0.57, 0.50), 0.75)
MAT_VANO = materiale('GUSCIO_imbotte', (0.10, 0.075, 0.055), 0.35)
MAT_PAVIMENTO = materiale('GUSCIO_moquette', (0.52, 0.47, 0.41), 0.92)

radice = bpy.data.objects.new('SALONE_GUSCIO', None)
bpy.context.collection.objects.link(radice)

pezzi = []

# --- pavimento e soffitto, per tutta la stanza --------------------------
pezzi.append(scatola('GUSCIO_pavimento', DAVANTI_X, FONDO_X,
                     PAVIMENTO - SPESSORE_SOLAIO, PAVIMENTO,
                     MURATA_VANO, MURATA_OPPOSTA, MAT_PAVIMENTO))
pezzi.append(scatola('GUSCIO_soffitto', DAVANTI_X, FONDO_X,
                     SOFFITTO, SOFFITTO + SPESSORE_SOLAIO,
                     MURATA_VANO, MURATA_OPPOSTA, MAT_PARETE))

# --- la murata col vano, in quattro pezzi attorno al buco ---------------
#
# Non si fa un buco booleano: quattro scatole danno le stesse facce, hanno
# spessore vero, e non lasciano la n-gon che un boolean si porta dietro.
Z0, Z1 = MURATA_VANO - SPESSORE_MURATA, MURATA_VANO

pezzi.append(scatola('GUSCIO_murata_sotto_vano', VANO_X0, VANO_X1,
                     PAVIMENTO, VANO_Y0, Z0, Z1, MAT_LEGNO))
pezzi.append(scatola('GUSCIO_murata_sopra_vano', VANO_X0, VANO_X1,
                     VANO_Y1, SOFFITTO, Z0, Z1, MAT_LEGNO))
# il montante: il pezzo a destra del vano, dove sta l'origine
pezzi.append(scatola('GUSCIO_montante', VANO_X1, FONDO_X,
                     PAVIMENTO, SOFFITTO, Z0, Z1, MAT_LEGNO))
# e il pezzo a sinistra, che nella fotografia esce dal quadro
pezzi.append(scatola('GUSCIO_murata_davanti', DAVANTI_X, VANO_X0,
                     PAVIMENTO, SOFFITTO, Z0, Z1, MAT_LEGNO))

# --- le imbotti: i quattro ritorni dentro lo spessore del vano ----------
#
# Sono la ragione per cui questo guscio esiste. Girando la camera devono
# scoprirsi e coprirsi: e' la parallasse che una lastra non puo' avere.
pezzi.append(scatola('GUSCIO_imbotte_bassa', VANO_X0, VANO_X1,
                     VANO_Y0 - 0.02, VANO_Y0, Z0, Z1 + 0.001, MAT_VANO))
pezzi.append(scatola('GUSCIO_imbotte_alta', VANO_X0, VANO_X1,
                     VANO_Y1, VANO_Y1 + 0.02, Z0, Z1 + 0.001, MAT_VANO))
pezzi.append(scatola('GUSCIO_imbotte_montante', VANO_X1 - 0.02, VANO_X1,
                     VANO_Y0, VANO_Y1, Z0, Z1 + 0.001, MAT_VANO))
pezzi.append(scatola('GUSCIO_imbotte_davanti', VANO_X0, VANO_X0 + 0.02,
                     VANO_Y0, VANO_Y1, Z0, Z1 + 0.001, MAT_VANO))

# --- la murata opposta e la paratia di fondo ----------------------------
pezzi.append(scatola('GUSCIO_murata_opposta', DAVANTI_X, FONDO_X,
                     PAVIMENTO, SOFFITTO,
                     MURATA_OPPOSTA, MURATA_OPPOSTA + SPESSORE_MURATA, MAT_PARETE))
pezzi.append(scatola('GUSCIO_paratia_fondo', FONDO_X, FONDO_X + SPESSORE_MURATA,
                     PAVIMENTO, SOFFITTO,
                     MURATA_VANO, MURATA_OPPOSTA, MAT_PARETE))

for p in pezzi:
    p.parent = radice

# --- LA CAMERA SORGENTE, dalla posa misurata ----------------------------
#
# Si usa la MATRICE, non gli angoli di Eulero: `posa.json` porta entrambi, ma
# una matrice non ha convenzioni da indovinare. Gli angoli sono li' per essere
# letti da un umano; la matrice per essere usata.
C = posa['camera']
pos = C['posizione_m']
R = C['rotazione_stanza_verso_camera']

cam_dati = bpy.data.cameras.new('CAM_SORGENTE')
cam = bpy.data.objects.new('CAM_SORGENTE', cam_dati)
bpy.context.collection.objects.link(cam)

larg_px, alt_px = posa['fotogramma_px']
focale_px = posa['dichiarato']['focale_px']
cam_dati.sensor_fit = 'HORIZONTAL'
cam_dati.sensor_width = 36.0
cam_dati.lens = focale_px * 36.0 / larg_px

M = Matrix(((R[0][0], R[0][1], R[0][2]),
            (R[1][0], R[1][1], R[1][2]),
            (R[2][0], R[2][1], R[2][2])))
# la matrice porta dalla stanza alla camera: per orientare l'oggetto serve
# l'inversa, e Blender guarda lungo -Z con Y in alto, come una camera d'immagine
cam.matrix_world = (M.transposed().to_4x4()
                    @ Matrix.Rotation(math.pi, 4, 'X'))
cam.location = Vector((pos['x_dal_montante'],
                       PAVIMENTO + pos['y_sopra_il_pavimento'],
                       pos['z_dalla_parete']))

sc = bpy.context.scene
sc.camera = cam
sc.render.resolution_x = larg_px
sc.render.resolution_y = alt_px
sc.render.film_transparent = False

# --- un GLB in metri, con i nomi stabili --------------------------------
glb = os.path.join(USCITE, 'guscio-salone.glb')
bpy.ops.object.select_all(action='DESELECT')
radice.select_set(True)
for p in pezzi:
    p.select_set(True)
bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB',
                          use_selection=True, export_yup=True,
                          export_apply=True)

peso = os.path.getsize(glb)

# --- LA PROVA: lo stesso guscio, dalla posa sorgente --------------------
#
# Un guscio non verificato non vale niente: il punto di tutto questo e' che il
# vano coincida con quello della fotografia. Si renderizza dalla camera
# misurata e si confronta il bordo del vano col primo fotogramma di
# `salone-largo.mp4`. Se il montante e la battuta cadono dove cadono nella
# ripresa, il guscio e' calibrato; se no, non lo e', e nessuna quantita' di
# arredi lo salva.
#
# Il render e' piatto apposta: qui non si giudica la luce, si misura un bordo.
mondo = bpy.data.worlds.new('prova')
mondo.use_nodes = True
mondo.node_tree.nodes['Background'].inputs[0].default_value = (0.05, 0.05, 0.06, 1)
mondo.node_tree.nodes['Background'].inputs[1].default_value = 1.0
sc.world = mondo

luce_d = bpy.data.lights.new('SOLE', type='SUN')
luce_d.energy = 3.0
luce = bpy.data.objects.new('SOLE', luce_d)
bpy.context.collection.objects.link(luce)
luce.location = (VANO_X0 - 3.0, SOFFITTO + 2.0, -3.0)
luce.rotation_euler = (math.radians(65), 0, math.radians(30))

# il nome del motore in tempo reale e cambiato fra le versioni di Blender:
# si prova in cascata invece di indovinarlo, come fa gia il resto del repo
for motore in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE', 'CYCLES'):
    try:
        sc.render.engine = motore
        break
    except Exception:
        continue
try:
    sc.eevee.taa_render_samples = 32
except Exception:
    pass
sc.render.film_transparent = False
sc.render.image_settings.file_format = 'PNG'
png = os.path.join(USCITE, 'guscio-posa-sorgente.png')
sc.render.filepath = png
try:
    bpy.ops.render.render(write_still=True)
    reso = os.path.getsize(png)
except Exception as e:
    reso = 0
    print('  RENDER NON RIUSCITO:', e)


print('')
print('  GUSCIO DEL SALONE — prova di spazio')
print('  ' + '-' * 66)
print(f'  pezzi            {len(pezzi)}')
print(f'  pavimento y      {PAVIMENTO:+.4f} m      soffitto y {SOFFITTO:+.4f} m')
print(f'  aria             {SOFFITTO - PAVIMENTO:.3f} m   (dichiarata 2,350)')
print(f'  murata col vano  z = {MURATA_VANO:.3f}   opposta z = {MURATA_OPPOSTA:.4f}  (BAGLIO, non misurato)')
print(f'  vano             x {VANO_X0:+.4f} .. {VANO_X1:+.4f}   y {VANO_Y0:+.4f} .. {VANO_Y1:+.4f}')
print(f'  fondo SCELTO     x = {FONDO_X:.2f} m   (misurato fino a 1,90; massimo 12,568)')
print(f'  camera           {cam.location.x:+.4f} {cam.location.y:+.4f} {cam.location.z:+.4f} m')
print(f'  lente            {cam_dati.lens:.2f} mm su sensore 36  (focale dichiarata {focale_px:.1f} px)')
print(f'  GLB              {glb}   {peso} byte')
print(f'  PROVA            {png}   {reso} byte')
print('')


# ─── VERIFICATO, e questi sono i numeri
#
# La prova richiesta da `ciao.md` §8 e' «still dalla posa sorgente, per
# verificare che la fotografia non sia peggiorata». Ma guardarlo non basta: si
# confronta dove cade il MONTANTE con dove lo mette la maschera gia' spedita,
# `public/salone/finestrone.png`, che vale 1,56 px contro la fotografia.
#
#     maschera spedita     montante a x = 703, COSTANTE da y = 80 a y = 520
#     guscio renderizzato  montante a x = 698..701
#     scarto mediano       -3 px          tetto dichiarato 4 px
#
# IN REGISTRO. E la convenzione della matrice `rotazione_stanza_verso_camera`,
# che il nome non dichiarava, e' adesso determinata da una misura invece che
# indovinata: **trasposta piu' flip**, M^T x Rx(pi). L'altra candidata
# plausibile fa scivolare il montante da 437 a 663 scendendo nel quadro, mentre
# la maschera lo vede costante: non e' una taratura da aggiustare, e' una
# convenzione sbagliata.
#
# ─── E TRE VOLTE HO MISURATO LA COSA SBAGLIATA PRIMA DI ARRIVARCI
#
#   1. La camera era FUORI dalla stanza: la parete davanti stava a -2,6746 e
#      l'osservatore a -2,9322. Il render era una superficie grigia piatta, e il
#      rilevatore di bordi ci trovava comunque un «montante» a 652.
#   2. Rendendo grigio su grigio, il gradiente verticale piu' forte era un bordo
#      qualunque della stanza: 656, con l'aria di una misura.
#   3. Con la soglia a 128 le pareti grigie contavano come vano, e il
#      «montante» finiva a 921. Il vano e' bianco PURO: la soglia va a 250.
#
# E anche cosi' il primo numero pulito, 656, sembrava sbagliato di 47 px. Non lo
# era: e' il lato LONTANO dell'imbotte, quello che il ritorno di 12 cm lascia
# vedere. Il montante che la maschera misura e' il lato VICINO, cioe' il bordo
# destro della fascia scura. Ricalcolato a mano prima di crederci: (0, 0.6,
# -0.12) proietta a 656, (0, 0.6, 0) a 700. **Tutti e due i numeri erano giusti
# e descrivevano due spigoli diversi.**
