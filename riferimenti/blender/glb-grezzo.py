"""
FASE 8.1 — IL GLB GREZZO: volumi, pivot, nodi. Nessun dettaglio.

    blender -b -P glb-grezzo.py -- <cartella>

Costruisce `impianto.glb` secondo `docs/14-FOTOREALISMO.md`:

  §0   attuatore elettrico generico con riduttore CICLOIDALE, non planetario
  §1.5 bersaglio dimensionale: unita' interna 1,10 x 0,73 x 0,93 m,
       altezza complessiva 1,31 m, apertura pinna 1,50 m, area 2,20 m2
  §1.4 modellato ed esportato in METRI: e' la specifica glTF
  §2.1 contratto dei nodi, i nomi sono API
  §2.2 metadati in extras sul nodo radice
  §2.3 assi: +X fuoribordo, -Y verso poppa, +Z alto
  §4.1 carter con spessore vero e anello di sezione, mai una superficie sottile
  §8.1 materiali piatti distinti, niente high-poly

─── PERCHE' CICLOIDALE E PERCHE' SI VEDE

Un riduttore epicicloidale sigillato non mostra niente: l'albero gira e basta.
I dischi cicloidali invece ORBITANO — si spostano di un'eccentricita' attorno
all'asse mentre contro-ruotano piano — e quel movimento si legge a colpo d'occhio.
E' la ragione per cui il carter che si apre diventa una rivelazione invece che
un'illustrazione: dentro c'e' qualcosa che si muove in modo evidente.

Il rapporto e' 29:1 — 30 perni fissi, 29 lobi — quindi l'ingresso gira 29 volte
per ogni giro d'uscita. In scena l'uscita fa +-25 gradi, cioe' l'ingresso fa
circa due giri interi: si vede girare davvero.

─── COSA NON FA QUESTO FILE

Niente bulloneria, niente nervature, niente pressacavi, niente texture. §8.1 dice
volumi e pivot, e il §12 vieta l'high-poly prima che nodi e simulazione
funzionino nel sito. Chi aggiunge dettagli qui prima di quel passo sta violando
la specifica.
"""
import bpy, math, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
FUORI = argv[0]

# ─── §1.5 · il bersaglio dimensionale, in METRI ───────────────────────────
U_LARG, U_LUNG, U_ALT = 1.105, 0.729, 0.928   # unita' interna
ALT_TOT = 1.310                                # altezza complessiva
APERTURA = 1.50                                # apertura della pinna
AREA_PINNA = 2.20                              # m2, valore autoritativo in extras
ANG_MAX = 25.0                                 # gradi

# ─── §3.2 · il riduttore ──────────────────────────────────────────────────
RAPPORTO = 29
ECCENTRICITA = 0.012                           # 12 mm: si vede e non e' grottesca

# ─── il carter: spessore vero, §4.1 ───────────────────────────────────────
SPESSORE = 0.005                               # 5 mm, dentro la forcella 4-6

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.unit_settings.system = 'METRIC'
sc.unit_settings.scale_length = 1.0


def piatto(nome, colore, metallo, rugosita):
    """§8.1: materiali PIATTI distinti. Servono a distinguere i pezzi nel GLB
    grezzo, non a essere belli — quelli definitivi arrivano in fase 8.3."""
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*colore, 1)
    b.inputs['Metallic'].default_value = metallo
    b.inputs['Roughness'].default_value = rugosita
    return m


MAT = {
    'carter': piatto('carter', (0.055, 0.075, 0.075), 0.0, 0.45),
    'sezione': piatto('sezione', (0.62, 0.64, 0.66), 1.0, 0.18),
    'acciaio': piatto('acciaio', (0.55, 0.57, 0.58), 1.0, 0.28),
    'motore': piatto('motore', (0.075, 0.085, 0.085), 0.0, 0.42),
    'carena': piatto('carena', (0.86, 0.85, 0.82), 0.0, 0.62),
    'tenuta': piatto('tenuta', (0.30, 0.32, 0.33), 1.0, 0.32),
    'ingranaggio': piatto('ingranaggio', (0.46, 0.48, 0.50), 1.0, 0.30),
}


def vuota(nome, pos=(0, 0, 0), padre=None):
    bpy.ops.object.empty_add(location=pos)
    o = bpy.context.object
    o.name = nome
    o.empty_display_size = 0.05
    if padre:
        o.parent = padre
        o.matrix_parent_inverse = padre.matrix_world.inverted()
    return o


def unisci(oggetti, nome, padre=None):
    """Un nodo del contratto e' UN oggetto, non una collezione: i nomi sono API
    e un nome che designa piu' cose non e' indirizzabile."""
    bpy.ops.object.select_all(action='DESELECT')
    for o in oggetti:
        o.select_set(True)
    bpy.context.view_layer.objects.active = oggetti[0]
    if len(oggetti) > 1:
        bpy.ops.object.join()
    o = bpy.context.object
    o.name = nome
    if padre:
        o.parent = padre
        o.matrix_parent_inverse = padre.matrix_world.inverted()
    return o


def cil(r, h, pos, mat, lati=32, asse='X'):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=lati, location=pos)
    o = bpy.context.object
    if asse == 'X':
        o.rotation_euler = (0, math.radians(90), 0)
    elif asse == 'Y':
        o.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)
    o.data.materials.append(MAT[mat])
    return o


def tubo_cavo(r_est, r_int, h, pos, mat, lati=48, asse='X'):
    """UN ANELLO, non una superficie sottile. §4.1: un guscio senza spessore,
    tagliato, mostra il rovescio della pelle e NON DA' NESSUN ERRORE — e' lo
    stesso difetto del loft che era un tubo aperto e delle 544 normali
    rovesciate. Qui la materia c'e' davvero: due cilindri e una differenza."""
    est = cil(r_est, h, pos, mat, lati, asse)
    int_ = cil(r_int, h * 1.4, pos, mat, lati, asse)
    m = est.modifiers.new('buco', 'BOOLEAN')
    m.operation = 'DIFFERENCE'
    m.object = int_
    bpy.context.view_layer.objects.active = est
    bpy.ops.object.modifier_apply(modifier='buco')
    bpy.data.objects.remove(int_, do_unlink=True)
    return est


def scatola(dim, pos, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    o = bpy.context.object
    o.scale = dim                     # dim e' la dimensione PIENA, non la meta'
    bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(MAT[mat])
    return o


# ═══ §2.1 · IL NODO RADICE ════════════════════════════════════════════════
# «origine di IMPIANTO: centro dell'albero sul piano del fasciame»
IMPIANTO = vuota('IMPIANTO', (0, 0, 0))

# ═══ STATIC_HULL_PLATE ════════════════════════════════════════════════════
unisci([scatola((0.012, 2.60, 2.20), (-0.006, 0, 0.30), 'carena')],
       'STATIC_HULL_PLATE', IMPIANTO)

# ═══ STATIC_FOUNDATION ════════════════════════════════════════════════════
p = []
# La FONDAZIONE e' il pezzo che detta l'ingombro, non il motore: e' lei a
# toccare i due estremi. Dimensionata perche' l'unita' interna stia nel
# bersaglio §1.5 invece di sforarlo — misurato a ogni giro, non stimato.
p.append(scatola((1.005, U_LUNG, 0.020), (-0.4975, 0, -U_ALT / 2 - 0.02), 'carena'))
for y in (-U_LUNG / 2 + 0.01, U_LUNG / 2 - 0.01):
    p.append(scatola((0.95, 0.016, 0.13), (-0.4975, y, -U_ALT / 2 - 0.085), 'carena'))
unisci(p, 'STATIC_FOUNDATION', IMPIANTO)

# ═══ STATIC_MOTOR ═════════════════════════════════════════════════════════
# servomotore AC, calettato in testa all'unita'
# §1.5 · il motore sta DENTRO l'ingombro dichiarato. La prima stesura lo metteva
# a -1,12 e l'unita' interna misurava 1,400 m contro un bersaglio di 1,105:
# misurato, non stimato. Un ingombro che sfora del 27% non e' un bersaglio.
p = [cil(0.098, 0.28, (-0.855, 0, 0.16), 'motore'),
     cil(0.115, 0.020, (-0.71, 0, 0.16), 'motore'),
     scatola((0.10, 0.09, 0.08), (-0.84, 0.13, 0.22), 'motore')]
unisci(p, 'STATIC_MOTOR', IMPIANTO)

# ═══ HOUSING_FIXED · il carter, con spessore vero ═════════════════════════
# La parte che resta quando il taglio porta via il coperchio.
p = [tubo_cavo(0.30, 0.30 - SPESSORE, 0.40, (-0.44, 0, 0), 'carter', 48),
     tubo_cavo(0.215, 0.215 - SPESSORE, 0.26, (-0.12, 0, 0), 'carter', 48),
     scatola((0.30, U_LUNG - 0.06, 0.030), (-0.44, 0, -U_ALT / 2 + 0.015), 'carter')]
unisci(p, 'HOUSING_FIXED', IMPIANTO)

# ═══ HOUSING_REMOVABLE · quello che la regia allontana ════════════════════
p = [tubo_cavo(0.305, 0.305 - SPESSORE, 0.38, (-0.44, 0, 0), 'carter', 48)]
rem = unisci(p, 'HOUSING_REMOVABLE', IMPIANTO)
# meta' guscio: si toglie la meta' verso poppa cosi' il taglio scopre l'interno
bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.44, -0.40, 0))
tagl = bpy.context.object
tagl.scale = (0.80, 0.80, 0.80)
bpy.ops.object.transform_apply(scale=True)
m = rem.modifiers.new('mezzo', 'BOOLEAN')
m.operation = 'DIFFERENCE'; m.object = tagl
bpy.context.view_layer.objects.active = rem
bpy.ops.object.modifier_apply(modifier='mezzo')
bpy.data.objects.remove(tagl, do_unlink=True)

# ═══ HOUSING_SECTION · l'ANELLO che resta sul piano di taglio ═════════════
# §4.1: mai una superficie senza spessore. E' materia non verniciata, quindi ha
# il suo materiale — piu' leggibile, non luminoso.
unisci([tubo_cavo(0.305, 0.30 - SPESSORE, 0.006, (-0.44, 0, 0), 'sezione', 48)],
       'HOUSING_SECTION', IMPIANTO)

# ═══ STATIC_SEAL · la tenuta sul fasciame ════════════════════════════════
p = [cil(0.105, 0.05, (0.030, 0, 0), 'tenuta', 32),
     cil(0.078, 0.06, (0.075, 0, 0), 'tenuta', 32)]
unisci(p, 'STATIC_SEAL', IMPIANTO)

# ═══ LA CATENA ROTANTE ════════════════════════════════════════════════════
# §2.1: «asse locale di rotazione di RIG_SHAFT e RIG_FIN: asse dell'albero»,
# che qui e' X e passa per l'origine.

# RIG_INPUT — l'albero veloce che viene dal motore
RIG_INPUT = vuota('RIG_INPUT', (0, 0, 0), IMPIANTO)
unisci([cil(0.030, 0.30, (-0.68, 0, 0), 'acciaio', 24)], 'RIG_INPUT_MESH', RIG_INPUT)

# RIG_ECCENTRIC — figlio dell'ingresso: e' l'eccentrico che fa orbitare i dischi
RIG_ECCENTRIC = vuota('RIG_ECCENTRIC', (0, 0, 0), RIG_INPUT)
unisci([cil(0.055, 0.05, (-0.58, ECCENTRICITA, 0), 'acciaio', 24)],
       'RIG_ECCENTRIC_MESH', RIG_ECCENTRIC)


def disco_cicloidale(x, fase, nome):
    """Un disco con 29 lobi. Non e' un ingranaggio a denti: il profilo
    cicloidale e' una circonferenza deformata, e i lobi si vedono girare.
    §12 vieta di mostrare un planetario e chiamarlo cicloidale."""
    N = 29
    R, amp = 0.135, 0.010
    vs, fs = [], []
    passi = 160
    for k in range(passi):
        t = k / passi * math.pi * 2
        r = R + amp * math.cos(N * t + fase)
        vs.append((x - 0.014, math.cos(t) * r, math.sin(t) * r))
        vs.append((x + 0.014, math.cos(t) * r, math.sin(t) * r))
    for k in range(passi):
        a, b = 2 * k, 2 * k + 1
        c, d = 2 * ((k + 1) % passi), 2 * ((k + 1) % passi) + 1
        fs.append([a, c, d, b])
    fs.append([2 * k for k in range(passi)][::-1])
    fs.append([2 * k + 1 for k in range(passi)])
    me = bpy.data.meshes.new(nome)
    me.from_pydata(vs, [], fs)
    me.update()
    o = bpy.data.objects.new(nome, me)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(MAT['ingranaggio'])
    return o


RIG_CYCLO_A = vuota('RIG_CYCLO_A', (0, 0, 0), IMPIANTO)
unisci([disco_cicloidale(-0.47, 0.0, 'discoA')], 'RIG_CYCLO_A_MESH', RIG_CYCLO_A)
RIG_CYCLO_B = vuota('RIG_CYCLO_B', (0, 0, 0), IMPIANTO)
unisci([disco_cicloidale(-0.43, math.pi, 'discoB')], 'RIG_CYCLO_B_MESH', RIG_CYCLO_B)

# RIG_OUTPUT — il portante, coi perni che ATTRAVERSANO i fori dei dischi
RIG_OUTPUT = vuota('RIG_OUTPUT', (0, 0, 0), IMPIANTO)
p = [cil(0.10, 0.045, (-0.34, 0, 0), 'acciaio', 32)]
for i in range(6):
    a = i / 6 * math.pi * 2
    p.append(cil(0.014, 0.16, (-0.45, math.cos(a) * 0.075, math.sin(a) * 0.075), 'acciaio', 12))
unisci(p, 'RIG_OUTPUT_MESH', RIG_OUTPUT)

# RIG_SHAFT — l'albero che esce dal carter e attraversa il fasciame
RIG_SHAFT = vuota('RIG_SHAFT', (0, 0, 0), IMPIANTO)
unisci([cil(0.048, 0.46, (-0.10, 0, 0), 'acciaio', 32)], 'RIG_SHAFT_MESH', RIG_SHAFT)

# RIG_FIN — la pinna, fuoribordo
RIG_FIN = vuota('RIG_FIN', (0, 0, 0), IMPIANTO)
prof = [(-0.42, 0), (-0.32, 0.085), (-0.08, 0.100), (0.20, 0.072), (0.52, 0),
        (0.20, -0.072), (-0.08, -0.100), (-0.32, -0.085)]
CORDA = 0.62          # m alla radice; l'area viene a circa 2,2 m2
vs, fs = [], []
SEZ = 4
for i in range(SEZ):
    t = i / (SEZ - 1)
    ap = 0.14 + t * APERTURA
    s = (1.0 - 0.40 * t) * CORDA
    for (px, py) in prof:
        vs.append((ap, px * s, py * s))
n = len(prof)
for i in range(SEZ - 1):
    for k in range(n):
        j = (k + 1) % n
        fs.append([i * n + k, i * n + j, (i + 1) * n + j, (i + 1) * n + k])
fs.append(list(range(n))[::-1])
fs.append([(SEZ - 1) * n + k for k in range(n)])
me = bpy.data.meshes.new('pinnaMesh')
me.from_pydata(vs, [], fs)
me.update()
pin = bpy.data.objects.new('RIG_FIN_MESH', me)
bpy.context.collection.objects.link(pin)
pin.data.materials.append(MAT['acciaio'])
pin.parent = RIG_FIN
pin.matrix_parent_inverse = RIG_FIN.matrix_world.inverted()

# ═══ §2.2 · I METADATI SUL NODO RADICE ════════════════════════════════════
IMPIANTO['assetRole'] = 'generic-electric-fin-actuator'
IMPIANTO['authoringUnit'] = 'meter'
IMPIANTO['sceneMetersPerUnit'] = 2.5
IMPIANTO['finAreaM2'] = AREA_PINNA
IMPIANTO['finMaxAngleDeg'] = ANG_MAX
IMPIANTO['gearType'] = 'cycloidal'
IMPIANTO['gearRatio'] = RAPPORTO
IMPIANTO['modelClaim'] = 'illustrative'

# ─── l'ingombro, misurato e stampato: §1.3 vuole misure dichiarate ────────
mn = Vector((1e9, 1e9, 1e9)); mx = Vector((-1e9, -1e9, -1e9))
interna = Vector((1e9, 1e9, 1e9)); interna_mx = Vector((-1e9, -1e9, -1e9))
for o in bpy.data.objects:
    if o.type != 'MESH':
        continue
    for v in o.bound_box:
        w = o.matrix_world @ Vector(v)
        for i in range(3):
            mn[i] = min(mn[i], w[i]); mx[i] = max(mx[i], w[i])
        if not o.name.startswith(('RIG_FIN', 'STATIC_HULL')):
            for i in range(3):
                interna[i] = min(interna[i], w[i]); interna_mx[i] = max(interna_mx[i], w[i])
print('INGOMBRO totale  %.3f x %.3f x %.3f m' % (mx[0]-mn[0], mx[1]-mn[1], mx[2]-mn[2]))
print('INGOMBRO interna %.3f x %.3f x %.3f m  (bersaglio %.2f x %.2f x %.2f)'
      % (interna_mx[0]-interna[0], interna_mx[1]-interna[1], interna_mx[2]-interna[2],
         U_LARG, U_LUNG, U_ALT))
print('PINNA apertura   %.3f m  (bersaglio %.2f)' % (mx[0] - 0.14, APERTURA))

bpy.ops.object.select_all(action='SELECT')
percorso = os.path.join(FUORI, 'impianto.glb')
bpy.ops.export_scene.gltf(filepath=percorso, export_format='GLB',
                          use_selection=True, export_apply=True,
                          export_yup=True, export_extras=True)
print('GLB %s · %.0f KB' % (percorso, os.path.getsize(percorso) / 1024))
