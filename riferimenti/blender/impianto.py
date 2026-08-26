"""
L'IMPIANTO INTERO, IN FILA — dal comando all'acqua.

    blender -b -P impianto.py -- <cartella> [angolo] [--glb]

─── L'IDEA

Tutto uno di seguito all'altro, lungo un asse solo: **quadro → cavo → motore →
riduttore → giunto → supporto → albero → attraversamento → radice → pinna**.
L'occhio segue la catena della causa dal comando fino all'acqua senza saltare, e
questo non e' una scelta di composizione: e' la tesi del sito resa geometria.
Il pezzo che vale sta sotto, e ci si arriva seguendo il filo.

─── LA REGOLA CHE TIENE ONESTO IL SITO

**Le quote da cui dipende la fisica non si toccano** — sono quelle che
`simulazione.js` usa per calcolare la riduzione, e cambiarle vorrebbe dire che il
numero dichiarato non si riferisce piu' a cio' che si mostra. Marcate VINCOLATA.

─── GLI ASSI, scritti perche' il prossimo non li debba dedurre

    X  fuori dallo scafo — la macchina sta a X negativa, la pinna a X positiva
    Y  la lunghezza della nave
    Z  l'alto

Il fasciame e' perpendicolare a X: e' il piano che l'albero attraversa. La prima
stesura lo stendeva LUNGO X, e la pinna non passava attraverso niente.
"""
import bpy, math, sys, os, time
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
FUORI = argv[0]
ANGOLO = float(argv[1]) if len(argv) > 1 and not argv[1].startswith('--') else 0.0
GLB = '--glb' in argv

# ─── quote VINCOLATE, da src/scena/nave.js ────────────────────────────────
R_ALBERO = 0.062
X_FLANGIA = 0.06
X_PREMI = 0.15
X_RADICE = 0.23
X_PINNA = 0.28
APERTURA = 1.30
RL = 0.22

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene


def superficie(nome, colore, base, metallo=1.0, aniso=0.70, verniciato=False):
    """La ricetta misurata: riferimenti/blender/LEGGIMI.md."""
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
    # la variazione segue il verso della lavorazione; la vernice no, perche' e'
    # colata e non ha un verso
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


INOX = superficie('inox', (0.62, 0.64, 0.66), 0.13)
ACCIAIO = superficie('acciaio', (0.52, 0.54, 0.56), 0.22)
BRONZO = superficie('bronzo', (0.66, 0.50, 0.30), 0.28)
GHISA = superficie('ghisa', (0.070, 0.078, 0.084), 0.52, metallo=0.0, verniciato=True)
MINIO = superficie('minio', (0.40, 0.135, 0.055), 0.62, metallo=0.0, verniciato=True)
GOMMA = superficie('gomma', (0.026, 0.026, 0.028), 0.80, metallo=0.0, verniciato=True)
ACCENTO = superficie('accento', (0.10, 0.62, 0.54), 0.30, metallo=0.0, verniciato=True)

pezzi, rotanti = [], []


def cil(r1, r2, h, pos, mat, lati=48, smusso=0.004, ruota=None):
    if abs(r1 - r2) < 1e-9:
        bpy.ops.mesh.primitive_cylinder_add(radius=r1, depth=h, vertices=lati, location=pos)
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=h, vertices=lati, location=pos)
    o = bpy.context.object
    o.rotation_euler = ruota if ruota else (0, math.radians(90), 0)
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


def corona(n, raggio, x, r_bull, h_bull, mat):
    """Una corona di bulloni: e' cio' che dice che due pezzi sono IMBULLONATI
    e non incollati, e da vicino e' la differenza fra un modello e un pezzo."""
    for i in range(n):
        a = i / n * math.pi * 2
        cil(r_bull, r_bull, h_bull, (x, math.cos(a) * raggio, math.sin(a) * raggio),
            mat, lati=6, smusso=0.0015)


def tubo(punti, raggio, mat):
    cu = bpy.data.curves.new('t', 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = raggio
    cu.bevel_resolution = 6
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


# ═══ LA CARENA, sezionata ═════════════════════════════════════════════════
# Il taglio si ferma a mezza altezza: sopra il fasciame resta intero, cosi' si
# capisce che e' una PARETE tagliata e non una lamiera che finisce li'.
box((0.022, 3.6, 1.30), (0, 0, 0.80), MINIO, smusso=0.004)
box((0.028, 3.6, 0.014), (0, 0, 0.152), INOX, smusso=0.002)   # il filo del taglio, lucido
for y in (-1.05, 1.05):                                        # madieri
    box((0.26, 0.030, 1.30), (-0.14, y, 0.80), MINIO, smusso=0.004)
    box((0.032, 0.17, 1.30), (-0.27, y, 0.80), MINIO, smusso=0.004)
box((2.9, 3.6, 0.026), (-1.42, 0, -0.92), MINIO, smusso=0.004)  # pagliolo

# ═══ 1 · IL QUADRO, dove comincia la catena ═══════════════════════════════
box((0.13, 0.44, 0.56), (-2.36, 0.55, 0.30), GHISA, smusso=0.012)
box((0.020, 0.40, 0.52), (-2.29, 0.55, 0.30), GHISA, smusso=0.004)   # portello
for z in (0.10, 0.50):
    for y in (0.37, 0.73):
        cil(0.012, 0.012, 0.03, (-2.28, y, z), INOX, lati=6, smusso=0.001, ruota=(0, math.radians(90), 0))
box((0.026, 0.16, 0.05), (-2.28, 0.55, 0.46), ACCENTO, smusso=0.004)  # spia
cil(0.030, 0.030, 0.05, (-2.28, 0.55, 0.16), INOX, lati=24, smusso=0.003, ruota=(0, math.radians(90), 0))

# pressacavi sotto il quadro: un quadro senza pressacavi non e' cablato
for y in (0.44, 0.55, 0.66):
    cil(0.020, 0.020, 0.05, (-2.36, y, 0.00), INOX, lati=12, smusso=0.002, ruota=(math.radians(90), 0, 0))

# ═══ 2 · IL CAVO, che tiene insieme il primo pezzo e il secondo ═══════════
tubo([(-2.36, 0.44, -0.03), (-2.30, 0.36, -0.42), (-1.95, 0.22, -0.60), (-1.62, 0.14, -0.52)], 0.022, GOMMA)
tubo([(-2.36, 0.55, -0.03), (-2.28, 0.44, -0.46), (-1.98, 0.28, -0.64), (-1.66, 0.18, -0.56)], 0.020, GOMMA)
# passacavo a parete
box((0.05, 0.12, 0.05), (-2.10, 0.26, -0.62), INOX, smusso=0.006)

# ═══ 3 · IL MOTORE ════════════════════════════════════════════════════════
cil(0.150, 0.150, 0.34, (-1.36, 0, -0.16), GHISA, smusso=0.010)
for a in range(10):
    cil(0.176, 0.176, 0.010, (-1.51 + a * 0.028, 0, -0.16), GHISA, smusso=0.002)
cil(0.105, 0.150, 0.075, (-1.58, 0, -0.16), GHISA, smusso=0.006)   # calotta ventola
box((0.14, 0.13, 0.10), (-1.34, 0.17, -0.08), GHISA, smusso=0.008)  # morsettiera
cil(0.018, 0.018, 0.04, (-1.34, 0.235, -0.12), INOX, lati=12, smusso=0.002, ruota=(math.radians(90), 0, 0))
# piedi del motore
for y in (-0.13, 0.13):
    box((0.26, 0.05, 0.12), (-1.36, y, -0.33), GHISA, smusso=0.005)

# ═══ 4 · IL RIDUTTORE ═════════════════════════════════════════════════════
box((0.42, 0.40, 0.40), (-0.96, 0, -0.16), GHISA, smusso=0.016)
for y in (-0.14, 0.0, 0.14):
    box((0.40, 0.020, 0.36), (-0.96, y, -0.16), GHISA, smusso=0.006)   # nervature
cil(0.125, 0.125, 0.024, (-0.96, 0, 0.055), GHISA, ruota=(0, 0, 0), smusso=0.004)  # coperchio
corona(6, 0.098, 0, 0.013, 0.03, INOX)   # segnaposto, spostati sotto
for i in range(6):
    a = i / 6 * math.pi * 2
    cil(0.013, 0.013, 0.03, (-0.96 + math.cos(a) * 0.098, math.sin(a) * 0.098, 0.062),
        INOX, lati=6, smusso=0.0015, ruota=(0, 0, 0))
cil(0.026, 0.026, 0.06, (-0.86, 0.19, -0.05), INOX, lati=12, smusso=0.002, ruota=(math.radians(90), 0, 0))  # sfiato
# flangia fra motore e riduttore
cil(0.165, 0.165, 0.030, (-1.18, 0, -0.16), GHISA, smusso=0.004)
corona(6, 0.132, -1.18, 0.014, 0.045, INOX)

# ═══ 5 · GIUNTO E SUPPORTO ════════════════════════════════════════════════
cil(0.098, 0.098, 0.14, (-0.66, 0, -0.16), BRONZO, smusso=0.004)
cil(0.104, 0.104, 0.020, (-0.72, 0, -0.16), INOX, smusso=0.002)
cil(0.104, 0.104, 0.020, (-0.60, 0, -0.16), INOX, smusso=0.002)
# supporto a cuscinetto: una sella imbullonata alla fondazione
box((0.20, 0.30, 0.10), (-0.44, 0, -0.40), GHISA, smusso=0.008)
cil(0.115, 0.115, 0.18, (-0.44, 0, -0.16), GHISA, smusso=0.006)
cil(0.126, 0.126, 0.026, (-0.53, 0, -0.16), GHISA, smusso=0.003)
corona(4, 0.098, -0.53, 0.012, 0.04, INOX)
for y in (-0.11, 0.11):
    cil(0.014, 0.014, 0.07, (-0.44, y, -0.44), INOX, lati=6, smusso=0.0015, ruota=(0, 0, 0))

# ═══ FONDAZIONE, sotto tutta la fila ══════════════════════════════════════
box((1.55, 0.62, 0.030), (-1.00, 0, -0.44), MINIO, smusso=0.004)
for y in (-0.26, 0.26):
    box((1.50, 0.026, 0.26), (-1.00, y, -0.58), MINIO, smusso=0.004)
for x in (-1.60, -1.10, -0.60):
    box((0.030, 0.56, 0.26), (x, 0, -0.58), MINIO, smusso=0.004)

# ═══ 6 · L'ATTRAVERSAMENTO — quote VINCOLATE ══════════════════════════════
cil(0.30, 0.30, 0.040, (-0.030, 0, -0.16), MINIO, smusso=0.005)      # doppiatore
cil(0.20, 0.20, 0.045, (X_FLANGIA, 0, -0.16), BRONZO, smusso=0.004)
corona(8, 0.155, X_FLANGIA, 0.017, 0.08, INOX)
cil(0.115, 0.135, 0.12, (X_PREMI, 0, -0.16), BRONZO, smusso=0.004)   # premistoppa
cil(0.126, 0.126, 0.030, (X_PREMI + 0.078, 0, -0.16), BRONZO, smusso=0.003)
corona(4, 0.100, X_PREMI + 0.078, 0.011, 0.05, INOX)
cil(0.104, 0.104, 0.045, (X_PREMI + 0.105, 0, -0.16), GOMMA, smusso=0.003)

# ═══ 7 · LA PARTE ROTANTE — quote VINCOLATE ═══════════════════════════════
def rot(o):
    rotanti.append(o); return o


rot(cil(R_ALBERO, R_ALBERO, 1.30, (-0.36, 0, -0.16), INOX, smusso=0.003))
rot(cil(0.076, 0.076, 0.09, (-0.30, 0, -0.16), BRONZO, smusso=0.003))   # calettatura
rot(box((0.055, 0.048, RL), (-0.30, 0, -0.16 + RL / 2), INOX, smusso=0.004))  # leva
rot(cil(0.032, 0.032, 0.10, (-0.30, 0, -0.16 + RL), INOX, smusso=0.002, ruota=(math.radians(90), 0, 0)))
rot(cil(0.118, 0.148, 0.14, (X_RADICE, 0, -0.16), INOX, smusso=0.004))  # radice

prof = [(-0.44, 0), (-0.34, 0.088), (-0.10, 0.105), (0.18, 0.075), (0.54, 0),
        (0.18, -0.075), (-0.10, -0.105), (-0.34, -0.088)]
vs, fs = [], []
SEZ = 6
for i in range(SEZ):
    t = i / (SEZ - 1)
    ap = 0.02 + t * APERTURA
    s = 1.0 - 0.42 * t * t
    for (px, py) in prof:
        vs.append((X_PINNA + ap, px * s, -0.16 + py * s))
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
mm = pin.modifiers.new('s', 'BEVEL'); mm.width = 0.006; mm.segments = 3
mm.limit_method = 'ANGLE'; mm.angle_limit = math.radians(40)
pezzi.append(pin); rotanti.append(pin)

# tutta la parte rotante gira attorno all'asse dell'albero, che sta a z = -0,16
bpy.ops.object.empty_add(location=(0, 0, -0.16))
perno = bpy.context.object
perno.name = 'perno'
for o in rotanti:
    o.parent = perno
    o.matrix_parent_inverse = perno.matrix_world.inverted()
perno.rotation_euler = (math.radians(ANGOLO), 0, 0)

print('PEZZI %d · rotanti %d' % (len(pezzi), len(rotanti)))

if GLB:
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=os.path.join(FUORI, 'impianto.glb'),
                              export_format='GLB', use_selection=True,
                              export_apply=True, export_yup=True)
    print('GLB scritto')
    raise SystemExit

# ═══ AMBIENTE E LUCE ══════════════════════════════════════════════════════
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
    # dentro una carena non entra la luce di un capannone: serve per i RIFLESSI
    sf.inputs[1].default_value = 0.26
else:
    sf.inputs[0].default_value = (0.03, 0.05, 0.06, 1)
    sf.inputs[1].default_value = 0.5

bpy.ops.object.light_add(type='AREA', location=(-0.90, 0.20, 1.30))
k = bpy.context.object
k.data.shape = 'RECTANGLE'; k.data.size = 2.4; k.data.size_y = 0.30
k.data.energy = 900; k.data.color = (0.88, 0.93, 1.0)
k.rotation_euler = (math.radians(168), 0, 0)

bpy.ops.object.light_add(type='AREA', location=(0.90, -1.40, -0.70))
r = bpy.context.object
r.data.shape = 'RECTANGLE'; r.data.size = 1.6; r.data.size_y = 0.6
r.data.energy = 120; r.data.color = (1.0, 0.80, 0.58)
r.rotation_euler = (math.radians(62), 0, math.radians(-150))

bpy.ops.object.camera_add(location=(-0.35, -4.30, 0.60))
cam = bpy.context.object
cam.data.lens = 55
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = 4.4
cam.data.dof.aperture_fstop = 7.1
mira = Vector((-0.55, 0, -0.18))
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
sc.cycles.samples = 180
sc.render.resolution_x = 1400
sc.render.resolution_y = 620
sc.render.image_settings.file_format = 'PNG'
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Base Contrast'
sc.render.filepath = os.path.join(FUORI, 'impianto%+03d.png' % int(ANGOLO))

t = time.time()
bpy.ops.render.render(write_still=True)
print('RESO in %.1f s' % (time.time() - t))
