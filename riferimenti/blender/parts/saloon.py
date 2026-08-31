# -*- coding: utf-8 -*-
"""
IL GUSCIO DEL SALONE DENTRO IL SISTEMA WORLD-SPACE.

    blender -b -P riferimenti/blender/parts/saloon.py

QUESTO SCRIPT NON RICOSTRUISCE IL GUSCIO. Il guscio esiste gia',
e' misurato e vale: public/modelli/guscio-salone.glb (123 KB, 8 pezzi,
UV della proiezione gia' cotte, camera sorgente esportata dentro il file).
E' prodotto da riferimenti/blender/guscio-esporta.py, che qui si LEGGE
e non si tocca.

Il compito di questo file e' un altro: importare quel GLB dentro la
collezione SALOON_SHELL sotto WORLD_ROOT (il contratto in
riferimenti/WORLDSPACE-CONTRATTO.md), dichiarare l'apertura verso il
corridoio in coordinate esplicite, e implementare il decadimento oltre
la zona misurata -- non come dissolvenza, come CAUSA MATERIALE.

─── ASSI: cosa succede all'import

guscio-esporta.py autora i pezzi con (x, y, z) Blender = (X lungo la
murata, Y in alto, Z fuori dalla parete) -- la convenzione di
posa.json -- e disabilita export_yup apposta, per non farsi ruotare
i dati dall'esportatore (vedi i commenti in fondo a quel file).

Questo script invece IMPORTA con le impostazioni di default
dell'importatore glTF di Blender, che applica la conversione
standard Y-up (glTF) -> Z-up (Blender). Il file e' correttamente
etichettato Y-up (Y = altezza), quindi la conversione e' quella
giusta e produce:

    Blender X  =  posa.json X   (lungo la murata, l'asse della profondita')
    Blender Z  =  posa.json Y   (l'altezza: pavimento/soffitto)
    Blender Y  = -posa.json Z   (fuori dalla parete: 0 sulla murata del
                                  vano, negativo verso la murata opposta)

Verificato: e' lo stesso mapping che riferimenti/blender/prove/00-inventario.txt
riporta per guscio-salone.glb ("dz Blender = Y posa.json dopo la
rotazione Y-up->Z-up", 2.350143 contro 2.35 dichiarati).

L'asse che conta per il decadimento (la profondita' lungo la murata)
resta l'asse X anche dopo l'import: nessuna conversione da tenere a
mente li'.

─── IL DECADIMENTO, E PERCHE' NON E' UNA DISSOLVENZA

posa.json (guscio_m.profondita_letta_x_m) dice che il pavimento e'
letto con certezza fino a X = 1,90 m. Il fondo del guscio esistente
e' SCELTO a X = 6,00 m (guscio-esporta.py, FONDO_X) su un massimo
teorico di 12,568 m (fine della tuga). Fra 1,9 e 6,0 m la fotografia
proiettata sulle UV esiste ma non e' piu' difendibile: oltre il vano
misurato un pixel vale metri (vedi il righello_di_profondita' in
posa.json), e la texture si stira.

Il contratto (punto 3) impone che oltre 1,9-2,2 m la proiezione
DECADA verso una causa materiale: una paratia, una porta, un'ombra
vera. Qui si fanno ENTRAMBE le cose, sullo stesso guscio importato,
senza toccarne la mesh:

  1. una PARATIA vera, costruita in questo file (non nel guscio
     misurato: e' un elemento nuovo, dichiarato, non un'invenzione
     spacciata per fotografia) a X = 2,20 m, con una porta -- cosi'
     la vista oltre la zona misurata non finisce nel vuoto, finisce
     contro una parete con un'apertura, come ci si aspetta su
     un'imbarcazione fra due locali;
  2. un'OMBRA vera sui pezzi del guscio che attraversano la zona
     1,9-2,2 m (pavimento, soffitto, opposta, fondo): un materiale
     che smorza l'emissione della fotografia verso il nero in
     funzione della posizione X del punto shading, cosi' quello che
     si vede appena prima della paratia e' un ambiente che si
     scurisce, non un'immagine stirata all'infinito.

Ogni oggetto del guscio riceve anche due proprieta' custom
(decadimento_da_m / decadimento_a_m): sono "extras" nel glTF, quindi
sopravvivono a un export successivo e un agente del sito le legge in
object.userData senza dover ricopiare questi numeri a mano.
"""
import bpy
import bmesh
import json
import os

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.abspath(os.path.join(QUI, '..', '..', '..'))
POSA = os.path.join(RADICE, 'riferimenti', 'salone', 'posa.json')
GLB_GUSCIO = os.path.join(RADICE, 'public', 'modelli', 'guscio-salone.glb')

with open(POSA, encoding='utf-8') as f:
    posa = json.load(f)

G = posa['guscio_m']
V = G['vano']

# ─── i numeri della posa, nel loro sistema originale (X lungo la murata,
#     Y in alto, Z fuori dalla parete) -- servono per costruire la paratia
#     e per stampare il referto
PAVIMENTO_Y, SOFFITTO_Y = G['pavimento_y_m'], G['soffitto_y_m']
MURATA_VANO_Z, MURATA_OPPOSTA_Z = G['murata_sinistra_z_m'], G['murata_destra_z_m']
VANO_X0, VANO_X1 = V['x_da_m'], V['x_a_m']
VANO_Y0, VANO_Y1 = V['y_da_m'], V['y_a_m']
PROFONDITA_CERTA_X = G['profondita_letta_x_m']          # 1.90
FONDO_SCELTO_X = 6.0                                      # da guscio-esporta.py
FONDO_MASSIMO_X = G['paratia_fondo_massimo_x_m']          # 12.568

DECADIMENTO_DA_X = PROFONDITA_CERTA_X                      # 1.90 -- fine del certo
DECADIMENTO_A_X = 2.2                                       # dove la paratia chiude la vista
PARATIA_X = DECADIMENTO_A_X
PARATIA_SPESSORE = 0.08
PORTA_LARGHEZZA = 1.0  # NON misurata: scelta di modellazione, come il verso
                        # della stanza in posa.json.non_determinato


bpy.ops.wm.read_homefile(use_empty=True)

# ─── le collezioni del contratto world-space ────────────────────────────
def collezione(nome, genitore=None):
    col = bpy.data.collections.get(nome)
    if col is None:
        col = bpy.data.collections.new(nome)
        (genitore or bpy.context.scene.collection).children.link(col)
    return col


WORLD_ROOT = collezione('WORLD_ROOT')
SALOON_SHELL = collezione('SALOON_SHELL', WORLD_ROOT)
OCCLUDERS = collezione('OCCLUDERS', WORLD_ROOT)

# ─── import del guscio gia' misurato, cosi' com'e' ──────────────────────
prima = set(bpy.data.objects.keys())
bpy.ops.import_scene.gltf(filepath=GLB_GUSCIO)
importati = [o for o in bpy.data.objects if o.name not in prima]

pezzi_mesh = []
camera_sorgente = None
for ob in importati:
    for col in list(ob.users_collection):
        col.objects.unlink(ob)
    SALOON_SHELL.objects.link(ob)
    if ob.type == 'MESH':
        pezzi_mesh.append(ob)
    elif ob.type == 'CAMERA':
        camera_sorgente = ob
        # e' una camera di bake/confronto (contratto §4): resta nel file
        # come riferimento, non diventa la camera attiva a runtime.

bpy.context.view_layer.update()


# ─── il decadimento: materiale che smorza l'emissione verso il nero ─────
def materiale_decadimento(base):
    """prende il materiale importato (la 'GUSCIO' vuota di guscio-esporta.py,
    dove il sito innesta la texture video via TEXCOORD_0) e aggiunge, a
    valle, uno smorzamento verso il nero guidato dalla posizione X mondo.
    Non sostituisce niente di quello che il sito innesta: lo attenua."""
    if base is None:
        return
    base.use_nodes = True
    nt = base.node_tree
    out = next((n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'), None)
    if out is None or not out.inputs['Surface'].links:
        return
    sorgente = out.inputs['Surface'].links[0].from_socket

    geo = nt.nodes.new('ShaderNodeNewGeometry')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    rng = nt.nodes.new('ShaderNodeMapRange')
    rng.inputs['From Min'].default_value = DECADIMENTO_DA_X
    rng.inputs['From Max'].default_value = DECADIMENTO_A_X
    rng.inputs['To Min'].default_value = 0.0
    rng.inputs['To Max'].default_value = 1.0
    rng.clamp = True
    ombra = nt.nodes.new('ShaderNodeBsdfDiffuse')
    ombra.inputs['Color'].default_value = (0.01, 0.01, 0.012, 1.0)
    mix = nt.nodes.new('ShaderNodeMixShader')

    nt.links.new(geo.outputs['Position'], sep.inputs['Vector'])
    nt.links.new(sep.outputs['X'], rng.inputs['Value'])
    nt.links.new(rng.outputs['Result'], mix.inputs['Fac'])
    nt.links.new(sorgente, mix.inputs[1])       # 0 = fotografia
    nt.links.new(ombra.outputs['BSDF'], mix.inputs[2])  # 1 = ombra vera
    nt.links.new(mix.outputs['Shader'], out.inputs['Surface'])


materiali_visti = set()
for ob in pezzi_mesh:
    for slot in ob.material_slots:
        if slot.material and slot.material.name not in materiali_visti:
            materiali_visti.add(slot.material.name)
            materiale_decadimento(slot.material)
    # extras leggibili dal sito dopo un export (node.userData in three.js)
    ob['decadimento_da_m'] = DECADIMENTO_DA_X
    ob['decadimento_a_m'] = DECADIMENTO_A_X
    ob['paratia_decadimento_x_m'] = PARATIA_X

# vertex-attribute float col decadimento gia' cotto (0=certo, 1=in ombra):
# un downstream che non vuole rifare Map Range in tempo reale legge questo.
for ob in pezzi_mesh:
    me = ob.data
    attr = me.color_attributes.get('decadimento')
    if attr is None:
        attr = me.color_attributes.new('decadimento', 'FLOAT_COLOR', 'POINT')
    mw = ob.matrix_world
    for i, v in enumerate(me.vertices):
        x = (mw @ v.co).x
        t = max(0.0, min(1.0, (x - DECADIMENTO_DA_X) / (DECADIMENTO_A_X - DECADIMENTO_DA_X)))
        attr.data[i].color = (t, t, t, 1.0)


# ─── la paratia: la causa materiale a fine decadimento ───────────────────
def scatola(nome, x0, x1, y0, y1, z0, z1, collezione_dest):
    me = bpy.data.meshes.new(nome)
    ob = bpy.data.objects.new(nome, me)
    collezione_dest.objects.link(ob)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bm.to_mesh(me)
    bm.free()
    ob.scale = (x1 - x0, y1 - y0, z1 - z0)
    ob.location = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    ob.select_set(False)
    return ob


mat_paratia = bpy.data.materials.new('PARATIA_DECADIMENTO')
mat_paratia.use_nodes = True
bsdf = mat_paratia.node_tree.nodes.get('Principled BSDF')
if bsdf:
    bsdf.inputs['Base Color'].default_value = (0.05, 0.05, 0.06, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.85

# stessa geometria della murata (Y = pavimento..soffitto, Z = tutta la
# larghezza), spessore lungo X a PARATIA_X. La porta e' centrata sulla
# larghezza; y_da/y_a della porta riusano quelle del vano d'ingresso
# (V['y_da_m']..V['y_a_m']), NON misurate qui: e' una scelta dichiarata,
# come da commento in testa al file.
centro_z = (MURATA_VANO_Z + MURATA_OPPOSTA_Z) / 2
porta_z0 = centro_z - PORTA_LARGHEZZA / 2
porta_z1 = centro_z + PORTA_LARGHEZZA / 2

pezzi_paratia = [
    scatola('paratia_sinistra', PARATIA_X, PARATIA_X + PARATIA_SPESSORE,
            PAVIMENTO_Y, SOFFITTO_Y, MURATA_VANO_Z, porta_z0, OCCLUDERS),
    scatola('paratia_destra', PARATIA_X, PARATIA_X + PARATIA_SPESSORE,
            PAVIMENTO_Y, SOFFITTO_Y, porta_z1, MURATA_OPPOSTA_Z, OCCLUDERS),
    scatola('paratia_sotto_porta', PARATIA_X, PARATIA_X + PARATIA_SPESSORE,
            PAVIMENTO_Y, VANO_Y0, porta_z0, porta_z1, OCCLUDERS),
    scatola('paratia_sopra_porta', PARATIA_X, PARATIA_X + PARATIA_SPESSORE,
            VANO_Y1, SOFFITTO_Y, porta_z0, porta_z1, OCCLUDERS),
]
for ob in pezzi_paratia:
    ob.data.materials.append(mat_paratia)
    ob['causa_decadimento'] = 'paratia con porta, non fotografata: chiude la vista oltre X=%.2f m' % PARATIA_X


# ─── il referto ───────────────────────────────────────────────────────────
def bbox_mondo(oggetti):
    pts = []
    for ob in oggetti:
        if ob.type != 'MESH':
            continue
        mw = ob.matrix_world
        pts += [mw @ v.co for v in ob.data.vertices]
    if not pts:
        return None
    mn = [min(p[i] for p in pts) for i in range(3)]
    mx = [max(p[i] for p in pts) for i in range(3)]
    return mn, mx


print('')
print('=' * 78)
print('  GUSCIO DEL SALONE NEL SISTEMA WORLD-SPACE')
print('=' * 78)
print(f'  sorgente riusata : {GLB_GUSCIO}')
print(f'  collezioni       : WORLD_ROOT > SALOON_SHELL ({len(pezzi_mesh)} pezzi mesh'
      + (', + camera di riferimento' if camera_sorgente else '') + ')')
print(f'                     WORLD_ROOT > OCCLUDERS ({len(pezzi_paratia)} pezzi paratia)')
print('')
print('  pezzi del guscio importato:')
for ob in pezzi_mesh:
    mn, mx = bbox_mondo([ob])
    print(f'    {ob.name:14s} bbox mondo (Blender) min={tuple(round(c,3) for c in mn)}'
          f'  max={tuple(round(c,3) for c in mx)}')

mn, mx = bbox_mondo(pezzi_mesh)
print('')
print(f'  bbox mondo SALOON_SHELL (Blender X,Y,Z): min={tuple(round(c,3) for c in mn)}'
      f'  max={tuple(round(c,3) for c in mx)}')
print('  (nota: questo bbox aggregato include lo spessore dei pannelli di'
      ' pavimento/soffitto, non solo l\'aria fra loro)')
# verifica indipendente: fra i pezzi importati, quello la cui estensione in
# Z (Blender) = Y (posa.json) combacia meglio con l'altezza aria dichiarata
# e' un pannello a tutta altezza (montante/davanti/opposta/sotto+sopra vano);
# i nomi degli oggetti nel GLB sono generici (Mesh_0..Mesh_7), quindi si
# trova per misura, non per nome
migliore = min(pezzi_mesh, key=lambda ob: abs((bbox_mondo([ob])[1][2] - bbox_mondo([ob])[0][2]) - G['altezza_aria_m']))
mn2, mx2 = bbox_mondo([migliore])
print(f'  altezza aria verificata su un pezzo a tutta altezza ({migliore.name}):'
      f' {round(mx2[2]-mn2[2],4)} m   (dichiarata in posa.json: {G["altezza_aria_m"]} m)')

print('')
print('  APERTURA VERSO IL CORRIDOIO (per l\'agente che ci attacca la scala)')
print('  ' + '-' * 74)
print('  origine del guscio = spigolo BASSO DESTRO del vano (incrocio montante/battuta).')
print('  SALOON_SHELL e\' importato a trasformazione identita\' sotto WORLD_ROOT:')
print('  world = locale, nessun offset applicato in questo script.')
print('')
print('  in coordinate posa.json (X lungo la murata, Y in alto, Z fuori parete):')
print(f'    X: {VANO_X0} m (NON misurato, minimo) .. {VANO_X1} m   (larghezza >= {abs(VANO_X0-VANO_X1):.4f} m)')
print(f'    Y: {VANO_Y0} m (soglia) .. {VANO_Y1} m   (altezza libera {VANO_Y1-VANO_Y0:.4f} m)')
print(f'    Z: {MURATA_VANO_Z} m   (piano della murata col vano)')
print('  stesse coordinate in Blender world (X invariato, Z=Y posa, Y=-Z posa):')
print(f'    X: {VANO_X0} .. {VANO_X1}')
print(f'    Z: {VANO_Y0} .. {VANO_Y1}')
print(f'    Y: {-MURATA_VANO_Z}')
print('')
print('  IL DECADIMENTO')
print('  ' + '-' * 74)
print(f'    misurato con certezza fino a X = {DECADIMENTO_DA_X} m (posa.json.profondita_letta_x_m)')
print(f'    smorzamento verso il nero (Map Range su Geometry.Position.X) fra'
      f' X = {DECADIMENTO_DA_X} m e X = {DECADIMENTO_A_X} m')
print(f'    causa materiale a X = {PARATIA_X} m: paratia con porta larga {PORTA_LARGHEZZA} m'
      f' (collezione OCCLUDERS, {len(pezzi_paratia)} pezzi)')
print(f'    il guscio importato continua fisicamente fino a X = {FONDO_SCELTO_X} m'
      f' (scelto in guscio-esporta.py, max teorico {FONDO_MASSIMO_X} m):'
      f' oltre la paratia quei pezzi restano ma il materiale li tiene in ombra piena (t=1).')
print('')
print('  NON MISURATO (da posa.json.non_determinato, riportato qui perche\' conta')
print('  per chi allunga il guscio oltre questo file):')
for voce in posa['non_determinato']:
    print('    - ' + voce.split('.')[0] + ('.' if not voce.endswith('.') else ''))
print('    - larghezza e posizione della porta nella paratia di decadimento: qui'
      ' scelte (1,0 m, centrata), non misurate.')
print('=' * 78)
