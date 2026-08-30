"""
LA LUCE RIMBALZATA SULLO SCAFO E SUL PONTE — irradianza diffusa indiretta.

    blender -b -P cuoci-luce-scafo.py -- <meccanismo.json> <uscita.png>

--- PERCHE' ESISTE, E PERCHE' NON E' UN'ALTRA AO

Il divario col render Cycles era gia' misurato, ed e' scritto in
`src/scena/materiali.js`: sui soli pixel sopra l'acqua, con la maschera esatta
del soggetto,

                     media    scarto a sfocatura 2 / 8 / 24
      Cycles         156,3       38,1 / 34,7 / 28,4
      sito           155,7       38,2 / 25,3 / 19,0

L'alta frequenza e' identica -- la buccia d'arancia fa il suo lavoro. A scala
MEDIA e GRANDE il sito e' un terzo piu' piatto. E la diagnosi era gia' scritta
accanto ai numeri: *«la differenza a scala media viene dalla luce RIMBALZATA
fra le superfici, che il tempo reale non ha»*.

Li' pero' ci si era fermati. `scafo-ao.webp` cuoce l'OCCLUSIONE, che e' un
termine che TOGLIE luce nei recessi: aggiunge struttura nella direzione
opposta al divario misurato. Quello che manca e' il complementare -- la luce
che il ponte bianco rimbalza sotto la tuga, quella che l'acqua rimanda sulla
murata bassa, quella che le due fiancate si scambiano attraverso il ponte.

--- COSA SI CUOCE, ESATTAMENTE

`DIFFUSE` con il solo passo INDIRETTO e SENZA colore: irradianza, non
irradianza per albedo. Con il colore acceso si cuocerebbe dentro la mappa la
vernice bianca, e moltiplicandola di nuovo a runtime si avrebbe il bianco due
volte.

In three.js la `lightMap` si SOMMA all'irradianza prima di moltiplicare per il
colore diffuso: e' additiva, che e' esattamente la semantica di un rimbalzo.
L'`aoMap`, che moltiplica, resta dov'e' e fa il suo mestiere opposto.

--- LA LUCE DEV'ESSERE QUELLA DEL SITO, O SI CUOCE UN'ALTRA SCENA

Sole direzionale da (4.5, 7, 6), colore 0xfff6e4, e un ambiente a due tinte --
carta sopra, acqua sotto -- come l'`HemisphereLight(0xe9e5dd, 0x071a1d)` della
scena. Sono copiati da `src/scena/index.js`, non scelti qui: se qualcuno li
cambia la', questa mappa va rifatta, e il commento serve a dirlo.

--- IL CAVEAT, ED E' REALE

Una cottura e' ancorata a una direzione di luce. Il sole del sito e' fisso e
l'ambiente e' una tela statica, quindi la cottura e' legittima. Ma lo scafo
ROLLA: a rollio alto la mappa gira col modello mentre il sole no. Per la
diffusa indiretta l'errore a quegli angoli e' piccolo, pero' va VERIFICATO e
non assunto -- `strumenti/ao-ab.mjs` regge lo stesso schema.
"""

import bpy, json, os, sys
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index('--') + 1:]
SORGENTE, FUORI = argv[0], argv[1]
LATO = int(os.environ.get('LATO_LUCE', '512'))
CAMPIONI = int(os.environ.get('LUCE_CAMPIONI', '256'))

GIRA = Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)

_d = json.load(open(SORGENTE, encoding='utf-8'))
pezzi = _d['pezzi'] if isinstance(_d, dict) else _d

# I DUE BERSAGLI: per ciascun materiale, il pezzo con piu' vertici. Il
# materiale `scafo` lo portano anche i tappi di chiusura, che hanno UV loro
# nello stesso spazio 0-1: cuocerci sopra li farebbe sovrascrivere il guscio.
bersagli = {}
for k, q in enumerate(pezzi):
    n = q.get('nome')
    if n in ('scafo', 'coperta') and q.get('uv'):
        v = len(q['pos']) // 3
        if n not in bersagli or v > bersagli[n][1]:
            bersagli[n] = (k, v)
if len(bersagli) != 2:
    raise SystemExit('trovati %d bersagli su 2: %s' % (len(bersagli), sorted(bersagli)))
indici = {v[0] for v in bersagli.values()}
print('BERSAGLI ' + ', '.join('%s pezzo %d con %d vertici' % (k, v[0], v[1])
                              for k, v in sorted(bersagli.items())))

mat_ao = bpy.data.materials.new('luce')
mat_ao.use_nodes = True
img = bpy.data.images.new('luce', LATO, LATO)
nodo = mat_ao.node_tree.nodes.new('ShaderNodeTexImage')
nodo.image = img
nodo.select = True
mat_ao.node_tree.nodes.active = nodo
mat_muto = bpy.data.materials.new('occludente')

# --- I DOPPIONI COINCIDENTI VANNO TOLTI, O SI OCCLUDONO A VICENDA
#
# Nel sito `interno` e' LA STESSA geometria del guscio, disegnata una seconda
# volta col materiale scuro e `side: BackSide`: da dentro la cavita' e' scura,
# da fuori non esiste. In Blender quel concetto non c'e' e diventano due
# superfici sovrapposte a distanza zero, che si fanno ombra l'una all'altra.
#
# Il sintomo era chiarissimo una volta guardato: tutta la murata si scuriva in
# modo UNIFORME -- occlusione media 0,43 su una superficie all'aperto, che
# dovrebbe stare vicino a 1. Non e' occlusione, e' vernice piu' scura.
DOPPIONI = {'interno'}

cotti = []
for k, q in enumerate(pezzi):
    if q.get('nome') in DOPPIONI:
        continue
    pos, idx = q['pos'], q['idx']
    n = len(pos) // 3
    M = Matrix([[q['m'][c * 4 + r] for c in range(4)] for r in range(4)])
    vs = [GIRA @ (M @ Vector((pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]))) for i in range(n)]
    fs = [(idx[i], idx[i + 1], idx[i + 2]) for i in range(0, len(idx), 3)] if idx \
        else [(i, i + 1, i + 2) for i in range(0, n, 3)]
    me = bpy.data.meshes.new('p%d' % k)
    me.from_pydata([tuple(v) for v in vs], [], fs)
    me.update()
    ob = bpy.data.objects.new('p%d' % k, me)
    bpy.context.collection.objects.link(ob)
    if k in indici:
        uv = q['uv']
        strato = me.uv_layers.new(name='UVMap')
        for poli in me.polygons:
            for lo in poli.loop_indices:
                vi = me.loops[lo].vertex_index
                strato.data[lo].uv = (uv[vi * 2], uv[vi * 2 + 1])
        ob.data.materials.append(mat_ao)
        cotti.append(ob)
    else:
        ob.data.materials.append(mat_muto)


# --- LA LUCE DELLA SCENA, copiata da `src/scena/index.js`
mondo = bpy.data.worlds.new('cielo')
mondo.use_nodes = True
nt = mondo.node_tree
for nn in list(nt.nodes):
    nt.nodes.remove(nn)
uscita_m = nt.nodes.new('ShaderNodeOutputWorld')
sfondo = nt.nodes.new('ShaderNodeBackground')
grad = nt.nodes.new('ShaderNodeTexGradient')
grad.gradient_type = 'QUADRATIC_SPHERE'
rampa = nt.nodes.new('ShaderNodeValToRGB')
rampa.color_ramp.elements[0].color = (0.0106, 0.0331, 0.0382, 1)   # 0x071a1d, acqua
rampa.color_ramp.elements[1].color = (0.8069, 0.7605, 0.6867, 1)   # 0xe9e5dd, carta
mappa = nt.nodes.new('ShaderNodeTexCoord')
nt.links.new(mappa.outputs['Generated'], grad.inputs['Vector'])
nt.links.new(grad.outputs['Fac'], rampa.inputs['Fac'])
nt.links.new(rampa.outputs['Color'], sfondo.inputs['Color'])
sfondo.inputs['Strength'].default_value = 2.7 / 3.14159   # l'emisfero della scena
nt.links.new(sfondo.outputs['Background'], uscita_m.inputs['Surface'])
bpy.context.scene.world = mondo

# --- E IL MARE, SENZA IL QUALE LA MURATA NON RICEVE NIENTE
#
# DIFETTO MISURATO nella prima cottura di questo script, e vale anche per
# `cuoci-ao-scafo.py`, che ce l'ha da sempre. Cotta senz'acqua, la mappa esce
# spaccata in due:
#
#     scafo-ao.webp    guscio  media 253,3  (99,1% sopra 250)   BIANCA
#                      ponte   media  45,9  dev 72,0
#     prima luce       guscio  media   0,3  (98,2% sotto 5)     VUOTA
#                      ponte   media  23,8  dev 39,9
#
# Non e' un bake fallito: e' un bake CORRETTO di una scena sbagliata. Una
# murata sospesa sul nulla non ha niente che la occluda ne' che le rimandi
# luce, quindi AO = 1 e indiretta = 0 sono le risposte giuste alla domanda
# posta male. Il ponte funziona perche' la sovrastruttura, li', c'e'.
#
# La luce che manca alla murata bassa e' quella che l'ACQUA le rimanda. Il
# piano qui sotto e' un rimbalzante, non un'immagine: albedo presa dal colore
# di terra dell'`HemisphereLight` del sito (0x071a1d), che nel modello del sito
# E' gia' «la luce che viene da sotto».
me_mare = bpy.data.meshes.new('mare')
me_mare.from_pydata([(-60, -60, 0), (60, -60, 0), (60, 60, 0), (-60, 60, 0)], [], [(0, 1, 2, 3)])
me_mare.update()
ob_mare = bpy.data.objects.new('mare', me_mare)
bpy.context.collection.objects.link(ob_mare)
mat_mare = bpy.data.materials.new('acqua')
mat_mare.use_nodes = True
bsdf = mat_mare.node_tree.nodes.get('Principled BSDF')
if bsdf:
    bsdf.inputs['Base Color'].default_value = (0.0106, 0.0331, 0.0382, 1)
    if 'Roughness' in bsdf.inputs:
        bsdf.inputs['Roughness'].default_value = 0.22
ob_mare.data.materials.append(mat_mare)
print('MARE 120x120 unita a quota zero, come rimbalzante')

dati_sole = bpy.data.lights.new('sole', type='SUN')
dati_sole.energy = 3.6
dati_sole.color = (1.0, 0.9294, 0.8039)                   # 0xfff6e4
dati_sole.angle = 0.02
ob_sole = bpy.data.objects.new('sole', dati_sole)
bpy.context.collection.objects.link(ob_sole)
# la direzione e' quella del sito, portata nel sistema di Blender da GIRA
d = (GIRA @ Vector((4.5, 7.0, 6.0))).normalized()
ob_sole.rotation_mode = 'QUATERNION'
ob_sole.rotation_quaternion = Vector((0, 0, -1)).rotation_difference(-d)
print('SOLE verso %.3f %.3f %.3f' % (d.x, d.y, d.z))

sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = CAMPIONI
sc.render.bake.use_selected_to_active = False
sc.render.bake.margin = 12
sc.cycles.max_bounces = 4
sc.cycles.diffuse_bounces = 4
sc.render.bake.use_pass_direct = False      # il diretto ce l'ha gia' il sito
sc.render.bake.use_pass_indirect = True     # il rimbalzo, che e' cio' che manca
sc.render.bake.use_pass_color = False       # irradianza, non irradianza x albedo

bpy.ops.object.select_all(action='DESELECT')
for ob in cotti:
    ob.select_set(True)
bpy.context.view_layer.objects.active = cotti[0]
print('COTTURA su %d oggetti, %d campioni, %d px' % (len(cotti), CAMPIONI, LATO))
bpy.ops.object.bake(type='DIFFUSE')

img.filepath_raw = FUORI
img.file_format = 'PNG'
img.save()
print('LUCE SCRITTA %s' % FUORI)

# Una mappa tutta bianca vuol dire che gli occludenti non c'erano o che le UV
# erano sbagliate: sembra riuscita e non serve a niente.
px = list(img.pixels)
r = px[0::4]
mini, massimo = min(r), max(r)
media = sum(r) / len(r)
print('LUCE min %.3f  max %.3f  media %.3f' % (mini, massimo, media))
# Una mappa piatta vuol dire che non c'e' stato nessun rimbalzo: o mancano gli
# occludenti, o le UV sono sbagliate, o la luce non e' arrivata. Sembra
# riuscita e non serve a niente -- lo stesso controllo dell'AO, altro termine.
if massimo - mini < 0.02:
    raise SystemExit('LUCE piatta (escursione %.4f): nessun rimbalzo cotto.' % (massimo - mini))
