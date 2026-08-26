"""
IL SISTEMA VERO: un attuatore di pinna, non uno schema.

    blender -b -P sistema.py -- <cartella> [angolo_pinna_gradi]

─── LA REGOLA CHE TIENE ONESTO IL SITO

**Le quote da cui dipende la fisica non si toccano.** Diametro dell'albero,
apertura e corda della pinna, braccio della leva, punto di attacco sul ginocchio
di carena: sono quelle che `simulazione.js` usa per calcolare la riduzione. Se si
cambiano per far sembrare il pezzo piu' bello, il numero che il sito dichiara
smette di riferirsi a cio' che mostra.

Quello che cambia e' tutto il resto. La geometria del sito e' uno SCHEMA:
distanziata apposta perche' in sezione si capisca chi fa cosa. Alla misura di una
fotografia si legge come pezzi sparsi — motore staccato dal riduttore, albero che
galleggia. Un attuatore vero e' un blocco compatto, imbullonato, con tubazioni e
cavi, dove non si distingue un pezzo dall'altro.

─── LE QUOTE VINCOLATE, da src/scena/nave.js e src/scafo/ordinate.js
"""
import bpy, math, sys, os, time
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
FUORI = argv[0]
ANGOLO = float(argv[1]) if len(argv) > 1 else 0.0

# 1 unita' di scena = 2,5 m
U = 2.5
R_ALBERO = 0.062          # raggio dell'albero — VINCOLATA
L_ALBERO = 0.62           # lunghezza          — VINCOLATA
X_FLANGIA = 0.06          # attraversamento carena — VINCOLATA
X_PREMI = 0.15            # premistoppa            — VINCOLATA
X_RADICE = 0.23           # radice della pinna     — VINCOLATA
X_PINNA = 0.28            # attacco della pinna    — VINCOLATA
APERTURA = 1.30           # apertura della pinna   — VINCOLATA
RL = 0.22                 # braccio della leva     — VINCOLATA
CY, CZ = 0.36, -0.24      # centro manovella       — VINCOLATA
SPIGOLO_X = 1.3457142857  # ginocchio di carena a Z_PINNE — VINCOLATA
SPIGOLO_Y = -0.2621428572

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene


# ─── materiali: la ricetta misurata in riferimenti/blender/LEGGIMI.md ───────
def superficie(nome, colore, base, metallo=1.0, aniso=0.70, verniciato=False):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*colore, 1)
    b.inputs['Metallic'].default_value = metallo
    b.inputs['Roughness'].default_value = base
    if metallo > 0.5 and 'Anisotropic' in b.inputs:
        b.inputs['Anisotropic'].default_value = aniso
        b.inputs['Anisotropic Rotation'].default_value = 0.25
    coord = nt.nodes.new('ShaderNodeTexCoord')
    verso = nt.nodes.new('ShaderNodeMapping')
    # LA VARIAZIONE SEGUE IL VERSO DELLA LAVORAZIONE: isotropa legge come sporco.
    # Su una superficie verniciata invece va isotropa, perche' la vernice non ha
    # un verso: e' colata, non tornita.
    verso.inputs['Scale'].default_value = (3.0, 3.0, 3.0) if verniciato else (0.06, 9.0, 9.0)
    nt.links.new(coord.outputs['Object'], verso.inputs['Vector'])
    ru = nt.nodes.new('ShaderNodeTexNoise')
    ru.inputs['Scale'].default_value = 5.0
    ru.inputs['Detail'].default_value = 4.0
    nt.links.new(verso.outputs['Vector'], ru.inputs['Vector'])
    mp = nt.nodes.new('ShaderNodeMapRange')
    mp.inputs['From Min'].default_value = 0.35
    mp.inputs['From Max'].default_value = 0.65
    mp.inputs['To Min'].default_value = base - (0.06 if verniciato else 0.02)
    mp.inputs['To Max'].default_value = base + (0.06 if verniciato else 0.02)
    nt.links.new(ru.outputs['Fac'], mp.inputs['Value'])
    nt.links.new(mp.outputs['Result'], b.inputs['Roughness'])
    g = nt.nodes.new('ShaderNodeTexNoise')
    g.inputs['Scale'].default_value = 260.0 if verniciato else 900.0
    g.inputs['Detail'].default_value = 2.0
    st = nt.nodes.new('ShaderNodeMapping')
    st.inputs['Scale'].default_value = (1.0, 1.0, 1.0) if verniciato else (1.0, 60.0, 1.0)
    nt.links.new(coord.outputs['Object'], st.inputs['Vector'])
    nt.links.new(st.outputs['Vector'], g.inputs['Vector'])
    bu = nt.nodes.new('ShaderNodeBump')
    bu.inputs['Strength'].default_value = 0.02 if verniciato else 0.006
    nt.links.new(g.outputs['Fac'], bu.inputs['Height'])
    nt.links.new(bu.outputs['Normal'], b.inputs['Normal'])
    return m


ACCIAIO = superficie('acciaio', (0.54, 0.56, 0.58), 0.20)
INOX = superficie('inox', (0.62, 0.64, 0.66), 0.13)
BRONZO = superficie('bronzo', (0.66, 0.50, 0.30), 0.28)
# il corpo dell'attuatore e' fuso e verniciato: e' l'unica superficie non
# metallica del gruppo, ed e' quella che da' la massa
GHISA = superficie('ghisa', (0.075, 0.085, 0.09), 0.52, metallo=0.0, verniciato=True)
MINIO = superficie('minio', (0.42, 0.14, 0.06), 0.62, metallo=0.0, verniciato=True)
GOMMA = superficie('gomma', (0.028, 0.028, 0.030), 0.78, metallo=0.0, verniciato=True)

pezzi = []
rotanti = []


def cil(r1, r2, h, pos, mat, lati=64, smusso=0.004, asse='X', ruota=None):
    if abs(r1 - r2) < 1e-9:
        bpy.ops.mesh.primitive_cylinder_add(radius=r1, depth=h, vertices=lati, location=pos)
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=h, vertices=lati, location=pos)
    o = bpy.context.object
    o.rotation_euler = ruota if ruota else ((0, math.radians(90), 0) if asse == 'X' else (0, 0, 0))
    o.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    if smusso:
        m = o.modifiers.new('s', 'BEVEL'); m.width = smusso; m.segments = 3
        m.limit_method = 'ANGLE'; m.angle_limit = math.radians(35)
    pezzi.append(o)
    return o


def box(dim, pos, mat, smusso=0.006, ruota=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    o = bpy.context.object
    o.scale = dim
    bpy.ops.object.transform_apply(scale=True)
    if ruota:
        o.rotation_euler = ruota
    o.data.materials.append(mat)
    m = o.modifiers.new('s', 'BEVEL'); m.width = smusso; m.segments = 3
    m.limit_method = 'ANGLE'; m.angle_limit = math.radians(35)
    pezzi.append(o)
    return o


# ═══ IL FASCIAME, che e' cio' che manca allo schema ════════════════════════
# Un attuatore senza la lamiera a cui e' imbullonato non e' installato: e'
# esposto. La piastra e il rinforzo dicono DOVE siamo — dentro una carena.
fasciame = box((3.4, 0.02, 3.0), (0, 0, 0), MINIO, smusso=0.004)
# e un pagliolo sotto: senza un piano d'appoggio si e' in un vuoto, non in un
# locale macchine
box((3.4, 0.02, 1.6), (0, -0.86, -0.80), MINIO, smusso=0.004, ruota=(math.radians(90), 0, 0))
# doppiatore attorno all'attraversamento: la lamiera si ispessisce dove e'
# forata, altrimenti si strappa
cil(0.46, 0.46, 0.035, (0, 0.012, 0), MINIO, asse='Y', ruota=(math.radians(90), 0, 0), smusso=0.006)
# madieri: due profili a L che corrono lungo la murata
for z in (-0.78, 0.78):
    box((3.4, 0.24, 0.026), (0, -0.24, z), MINIO, smusso=0.004)
    box((3.4, 0.026, 0.15), (0, -0.36, z), MINIO, smusso=0.004)

# ═══ FONDAZIONE ═══════════════════════════════════════════════════════════
# saldata ai madieri, non appoggiata: due fazzoletti e un piano
box((0.86, 0.030, 0.46), (-0.62, -0.36, 0), MINIO, smusso=0.004)
for z in (-0.20, 0.20):
    box((0.80, 0.22, 0.022), (-0.62, -0.47, z), MINIO, smusso=0.004)

# ═══ IL CORPO DELL'ATTUATORE: un blocco solo ══════════════════════════════
# E' questo a cambiare tutto. Nello schema erano motore, riduttore e culla
# separati; qui sono UN getto, come nella realta'.
corpo = box((0.62, 0.40, 0.40), (-0.56, -0.14, 0), GHISA, smusso=0.018)
# nervature di irrigidimento: un getto le ha sempre, e sono cio' che si legge
# come "pezzo pesante"
for z in (-0.14, 0.0, 0.14):
    box((0.60, 0.34, 0.020), (-0.56, -0.14, z), GHISA, smusso=0.006)
# flangia di accoppiamento fra corpo e attraversamento
cil(0.24, 0.24, 0.05, (-0.22, 0, 0), GHISA, smusso=0.006)
for b in range(8):
    a = b / 8 * math.pi * 2
    cil(0.022, 0.022, 0.07, (-0.22, math.cos(a) * 0.185, math.sin(a) * 0.185), INOX, lati=6, smusso=0.002)

# coperchio ispezione, con i suoi bulloni: dice che il pezzo si apre
cil(0.13, 0.13, 0.022, (-0.56, 0.075, 0), GHISA, asse='Y', ruota=(math.radians(90), 0, 0), smusso=0.004)
for b in range(6):
    a = b / 6 * math.pi * 2
    cil(0.014, 0.014, 0.03, (-0.56 + math.cos(a) * 0.10, 0.082, math.sin(a) * 0.10),
        INOX, lati=6, asse='Y', ruota=(math.radians(90), 0, 0), smusso=0.002)

# motore elettrico: cilindrico, calettato in testa al corpo
cil(0.145, 0.145, 0.30, (-1.02, -0.14, 0), GHISA, smusso=0.010)
for a in range(9):
    cil(0.168, 0.168, 0.010, (-1.13 + a * 0.026, -0.14, 0), GHISA, smusso=0.002)
cil(0.10, 0.145, 0.07, (-1.19, -0.14, 0), GHISA, smusso=0.006)
# morsettiera: la scatola che ogni motore ha di fianco
box((0.13, 0.09, 0.11), (-1.00, 0.03, 0.10), GHISA, smusso=0.008)

# ═══ ATTRAVERSAMENTO CARENA ═══════════════════════════════════════════════
# flangia imbullonata al doppiatore — quota VINCOLATA
cil(0.20, 0.20, 0.045, (X_FLANGIA, 0, 0), BRONZO, smusso=0.004)
for b in range(8):
    a = b / 8 * math.pi * 2
    cil(0.017, 0.017, 0.075, (X_FLANGIA, math.cos(a) * 0.155, math.sin(a) * 0.155),
        INOX, lati=6, smusso=0.002)
# premistoppa: due pezzi e il suo anello, non un cono liscio — quota VINCOLATA
cil(0.115, 0.135, 0.12, (X_PREMI, 0, 0), BRONZO, smusso=0.004)
cil(0.125, 0.125, 0.028, (X_PREMI + 0.075, 0, 0), BRONZO, smusso=0.003)
cil(0.104, 0.104, 0.05, (X_PREMI + 0.10, 0, 0), GOMMA, smusso=0.003)

# ═══ TUBAZIONI E CAVI ═════════════════════════════════════════════════════
# E' quello che fa la differenza fra un modello e un impianto. Nessuna macchina
# a bordo e' senza qualcosa che la raggiunge.
def tubo(punti, raggio, mat):
    cu = bpy.data.curves.new('t', 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = raggio
    cu.bevel_resolution = 8
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(len(punti) - 1)
    for i, p in enumerate(punti):
        bp = sp.bezier_points[i]
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    o = bpy.data.objects.new('tubo', cu)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(mat)
    pezzi.append(o)
    return o


tubo([(-1.00, 0.09, 0.12), (-0.80, 0.26, 0.22), (-0.30, 0.30, 0.30), (0.20, 0.26, 0.44)], 0.018, GOMMA)
tubo([(-0.56, 0.06, -0.19), (-0.40, 0.20, -0.30), (0.10, 0.24, -0.42)], 0.014, GOMMA)
tubo([(-0.30, -0.34, 0.16), (-0.05, -0.30, 0.34), (0.35, -0.24, 0.50)], 0.011, INOX)

# ═══ PARTE ROTANTE — tutte quote VINCOLATE ════════════════════════════════
def rot(o):
    rotanti.append(o); return o


rot(cil(R_ALBERO, R_ALBERO, L_ALBERO, (0, 0, 0), INOX, smusso=0.003))
rot(cil(0.072, 0.072, 0.09, (-0.22, 0, 0), BRONZO, smusso=0.003))
rot(cil(0.115, 0.145, 0.14, (X_RADICE, 0, 0), INOX, smusso=0.004))
# leva calettata: una forcella, non un parallelepipedo
lev = rot(box((0.055, RL, 0.048), (-0.22, RL / 2, 0), INOX, smusso=0.004))
rot(cil(0.030, 0.030, 0.10, (-0.22, RL, 0), INOX, smusso=0.002))

# la pinna: profilo alare rastremato — apertura e corda VINCOLATE
prof = [(-0.44, 0), (-0.34, 0.088), (-0.10, 0.105), (0.18, 0.075), (0.54, 0),
        (0.18, -0.075), (-0.10, -0.105), (-0.34, -0.088)]
vs, fs = [], []
SEZ = 5
for i in range(SEZ):
    t = i / (SEZ - 1)
    ap = 0.02 + t * APERTURA
    s = 1.0 - 0.45 * t * t          # rastremata verso l'estremita'
    for (px, py) in prof:
        vs.append((X_PINNA + ap, px * s, py * s))
n = len(prof)
for i in range(SEZ - 1):
    for k in range(n):
        j = (k + 1) % n
        fs.append([i * n + k, i * n + j, (i + 1) * n + j, (i + 1) * n + k])
fs.append(list(range(n))[::-1])
fs.append([(SEZ - 1) * n + k for k in range(n)])
me = bpy.data.meshes.new('pinna')
me.from_pydata(vs, [], fs)
me.update()
pin = bpy.data.objects.new('pinna', me)
bpy.context.collection.objects.link(pin)
pin.data.materials.append(INOX)
bpy.context.view_layer.objects.active = pin
bpy.ops.object.shade_smooth()
m = pin.modifiers.new('s', 'BEVEL'); m.width = 0.006; m.segments = 3
m.limit_method = 'ANGLE'; m.angle_limit = math.radians(40)
pezzi.append(pin); rotanti.append(pin)

# tutta la parte rotante gira attorno all'asse dell'albero
bpy.ops.object.empty_add(location=(0, 0, 0))
perno = bpy.context.object
for o in rotanti:
    o.parent = perno
    o.matrix_parent_inverse = perno.matrix_world.inverted()
perno.rotation_euler = (math.radians(ANGOLO), 0, 0)

# ═══ AMBIENTE: dentro una carena, non su un banco ═════════════════════════
sc.world = bpy.data.worlds.new('m'); sc.world.use_nodes = True
wn = sc.world.node_tree
sf = wn.nodes['Background']
HDRI = os.path.join(os.path.dirname(FUORI.rstrip('/\\')), 'hdri', 'ambiente.hdr')
if os.path.exists(HDRI):
    env = wn.nodes.new('ShaderNodeTexEnvironment')
    env.image = bpy.data.images.load(HDRI)
    rt = wn.nodes.new('ShaderNodeMapping')
    rt.inputs['Rotation'].default_value = (0, 0, math.radians(-40))
    cc = wn.nodes.new('ShaderNodeTexCoord')
    wn.links.new(cc.outputs['Generated'], rt.inputs['Vector'])
    wn.links.new(rt.outputs['Vector'], env.inputs['Vector'])
    wn.links.new(env.outputs['Color'], sf.inputs[0])
    # SMORZATO: dentro una carena non entra la luce di un capannone. Serve per i
    # RIFLESSI, non per illuminare — l'illuminazione la danno le lampade.
    sf.inputs[1].default_value = 0.30
    print('AMBIENTE hdri smorzato')
else:
    sf.inputs[0].default_value = (0.03, 0.05, 0.06, 1)
    sf.inputs[1].default_value = 0.5
    print('AMBIENTE nessun hdri')

# lampada da locale macchine: una plafoniera fredda in alto, e un rimbalzo caldo
bpy.ops.object.light_add(type='AREA', location=(-0.30, 1.05, 0.35))
k = bpy.context.object
k.data.shape = 'RECTANGLE'; k.data.size = 0.55; k.data.size_y = 0.14
k.data.energy = 430; k.data.color = (0.86, 0.92, 1.0)
k.rotation_euler = (math.radians(150), 0, math.radians(12))

bpy.ops.object.light_add(type='AREA', location=(0.85, -0.55, -0.75))
r = bpy.context.object
r.data.shape = 'RECTANGLE'; r.data.size = 1.2; r.data.size_y = 0.5
r.data.energy = 70; r.data.color = (1.0, 0.82, 0.62)
r.rotation_euler = (math.radians(56), 0, math.radians(-140))

# SI GUARDA DA DENTRO LA CARENA, non da fuori. Il fasciame sta a x = 0:
# l'attuatore e' a x negativa, la pinna a x positiva. La prima inquadratura era
# dalla parte del mare e mostrava l'attraversamento invece della macchina —
# cioe' proprio il pezzo che il capitolo dice di non vedere mai.
bpy.ops.object.camera_add(location=(-1.95, -2.35, 0.62))
cam = bpy.context.object
cam.data.lens = 42
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = 2.6
cam.data.dof.aperture_fstop = 5.0
mira = Vector((-0.34, -0.10, 0.0))
cam.rotation_euler = (mira - cam.location).to_track_quat('-Z', 'Y').to_euler()
sc.camera = cam

sc.render.engine = 'CYCLES'
try:
    pr = bpy.context.preferences.addons['cycles'].preferences
    pr.get_devices(); pr.compute_device_type = 'OPTIX'
    for d in pr.devices: d.use = True
    sc.cycles.device = 'GPU'
except Exception:
    pass
sc.cycles.use_denoising = True
sc.cycles.samples = 200
sc.render.resolution_x = 1100
sc.render.resolution_y = 690
sc.render.image_settings.file_format = 'PNG'
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Base Contrast'
sc.render.filepath = os.path.join(FUORI, 'sistema%+03d.png' % int(ANGOLO))

t = time.time()
bpy.ops.render.render(write_still=True)
print('RESO %d pezzi in %.1f s' % (len(pezzi), time.time() - t))
