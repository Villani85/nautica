"""
L'OCCLUSIONE AMBIENTALE DELLO SCAFO E DEL PONTE.

    blender -b -P cuoci-ao-scafo.py -- <meccanismo.json> <uscita.png>

--- PERCHE' ESISTE

Misurata dalla stessa camera del render Cycles, la coperta AL RIPARO sotto la
tuga era luminosa quanto quella scoperta: rapporto 1,02 dove il render da'
0,83. La luce arrivava da ogni parte uguale, e per questo niente sembrava
stare dentro a niente.

Per la sovrastruttura l'occlusione e' cotta dal suo generatore, che ha la
geometria. Lo scafo no: e' costruito nel BROWSER, da `src/scafo/ordinate.js`,
e in Blender non esiste. Arriva da qui, attraverso l'esportatore.

--- LE UV NON SI INVENTANO, ARRIVANO

`smart_project` srotolerebbe una superficie che ha gia' una parametrizzazione
naturale -- il guscio e' un loft su una griglia regolare, `a` lungo la nave e
`i` lungo il giro -- e soprattutto produrrebbe UV DIVERSE da quelle che il sito
usa a runtime. La texture sarebbe cotta su una mappa e letta su un'altra: un
difetto che non da' errore, da' macchie.

Quindi le UV arrivano dall'esportatore, identiche a quelle del browser. Guscio
nella meta' bassa delle v, ponte in quella alta, con un margine in mezzo.

--- TUTTO IL RESTO E' UN OCCLUDENTE

Si cuoce solo su due oggetti, ma devono esserci tutti: e' la sovrastruttura a
fare l'ombra sul ponte, ed e' il senso di questa mappa. Un bake fatto sul solo
ponte darebbe una superficie uniforme e sembrerebbe funzionare.
"""
import bpy, json, os, sys
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index('--') + 1:]
SORGENTE, FUORI = argv[0], argv[1]
LATO = int(os.environ.get('LATO_AO', '512'))
CAMPIONI = int(os.environ.get('AO_CAMPIONI', '128'))

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

mat_ao = bpy.data.materials.new('ao')
mat_ao.use_nodes = True
img = bpy.data.images.new('ao', LATO, LATO)
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

sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = CAMPIONI
sc.render.bake.use_selected_to_active = False
sc.render.bake.margin = 12

bpy.ops.object.select_all(action='DESELECT')
for ob in cotti:
    ob.select_set(True)
bpy.context.view_layer.objects.active = cotti[0]
print('COTTURA su %d oggetti, %d campioni, %d px' % (len(cotti), CAMPIONI, LATO))
bpy.ops.object.bake(type='AO')

img.filepath_raw = FUORI
img.file_format = 'PNG'
img.save()
print('AO SCRITTA %s' % FUORI)

# Una mappa tutta bianca vuol dire che gli occludenti non c'erano o che le UV
# erano sbagliate: sembra riuscita e non serve a niente.
px = list(img.pixels)
r = px[0::4]
mini, massimo = min(r), max(r)
media = sum(r) / len(r)
print('AO min %.3f  max %.3f  media %.3f' % (mini, massimo, media))
if massimo - mini < 0.10:
    raise SystemExit('AO piatta (escursione %.3f): nessuna occlusione cotta.' % (massimo - mini))
