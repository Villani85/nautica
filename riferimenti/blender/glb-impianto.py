"""
FASE 8.3 — L'IMPIANTO COMPLETO: dettaglio, materiali veri, mappe.

    blender -b -P glb-impianto.py -- <cartella> [--render]

Sostituisce `glb-grezzo.py`, che serviva alla fase 8.1 e ha fatto il suo lavoro:
portare nodi, pivot e cinematica dentro il sito. Da li' in poi il §12 autorizza
il dettaglio.

Cosa cambia rispetto al grezzo, e ogni voce ha una ragione:

  BULLONERIA VERA         un pezzo si legge come industriale dai fissaggi, non
                          dalla forma. Sono la prima cosa che un tecnico guarda
  NERVATURE               un getto le ha sempre: sono cio' che si legge come
                          «pesante» invece che «stampato»
  PRESSACAVI E CAVI       nessuna macchina a bordo e' senza qualcosa che la
                          raggiunge. Senza, e' un rendering di catalogo
  INTERNO DEL RIDUTTORE   perni, cuscinetti, corona: e' quello che il taglio
                          deve rivelare, e nel grezzo non c'era
  SMUSSI 1-3 mm           uno spigolo matematicamente perfetto e' il secondo
                          indizio di sintetico dopo la rugosita' uniforme
  MATERIALI PBR VERI      §7 di docs/14, con la variazione di rugosita' che e'
                          l'indizio numero uno

─── I MATERIALI VANNO NEL FILE, NON NEL SITO

Un glTF porta metalness e roughness per materiale. Metterli qui invece che in
JavaScript significa che il modello si puo' guardare in qualunque visualizzatore
e sembra lo stesso: e' la differenza fra un asset e un pezzo che funziona solo
dentro un'applicazione.

La variazione di rugosita' invece non e' esprimibile in glTF senza una texture,
e la texture arriva dalla cottura. Finche' non c'e', il valore e' costante e il
pezzo e' piu' sintetico di quanto sara'. E' un debito dichiarato, non nascosto.
"""
import bpy, math, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
FUORI = argv[0]
RENDER = '--render' in argv

# ─── §1.5 · il bersaglio dimensionale, in METRI ───────────────────────────
U_LARG, U_LUNG, U_ALT = 1.105, 0.729, 0.928
APERTURA = 1.50
AREA_PINNA = 2.20
ANG_MAX = 25.0
RAPPORTO = 29
ECCENTRICITA = 0.012
SPESSORE = 0.005

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.unit_settings.system = 'METRIC'


def mat(nome, colore, metallo, rugosita):
    """§7 · i materiali di una sala macchine mantenuta, non di un'officina.
    Il bronzo non e' un codice universale per «acqua marina» e non si mette se
    la funzione del pezzo non lo giustifica."""
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*colore, 1)
    b.inputs['Metallic'].default_value = metallo
    b.inputs['Roughness'].default_value = rugosita
    return m


MAT = {
    # struttura carena: epossidico bianco caldo, §7
    'carena': mat('carena', (0.82, 0.81, 0.78), 0.0, 0.62),
    # carter: vernice tecnica grafite, dielettrica
    'carter': mat('carter', (0.052, 0.062, 0.066), 0.0, 0.42),
    # bordo di sezione: metallo non verniciato, piu' leggibile ma non luminoso
    'sezione': mat('sezione', (0.58, 0.60, 0.62), 1.0, 0.20),
    'acciaio': mat('acciaio', (0.54, 0.56, 0.58), 1.0, 0.28),
    'lucido': mat('lucido', (0.60, 0.62, 0.64), 1.0, 0.16),
    'motore': mat('motore', (0.068, 0.078, 0.082), 0.0, 0.38),
    'tenuta': mat('tenuta', (0.44, 0.42, 0.36), 1.0, 0.34),
    'gomma': mat('gomma', (0.022, 0.022, 0.024), 0.0, 0.86),
    'cavo': mat('cavo', (0.42, 0.20, 0.045), 0.0, 0.68),
}

pezzi_di = {}


def reg(nodo, o):
    pezzi_di.setdefault(nodo, []).append(o)
    return o


def smussa(o, largh=0.0018, seg=2):
    """Bevel 1-3 mm, §6. Il limite ad angolo evita di arrotondare le facce
    piatte, che costerebbe triangoli senza cambiare niente."""
    m = o.modifiers.new('s', 'BEVEL')
    m.width = largh; m.segments = seg
    m.limit_method = 'ANGLE'; m.angle_limit = math.radians(35)
    return o


def cil(r, h, pos, materiale, lati=32, asse='X', smusso=0.0018):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=lati, location=pos)
    o = bpy.context.object
    if asse == 'X':
        o.rotation_euler = (0, math.radians(90), 0)
    elif asse == 'Y':
        o.rotation_euler = (math.radians(90), 0, 0)
    # `transform_apply(rotation=True)` applica ANCHE posizione e scala: i tre
    # argomenti hanno tutti il default a True, e nominarne uno non spegne gli
    # altri. La posizione finiva cotta dentro la mesh, l'oggetto restava a
    # (0,0,0), e qualunque rotazione assegnata dopo girava il pezzo attorno
    # all'ORIGINE DELLA SCENA invece che attorno a se'. Le draglie della
    # battagliola sono finite 18 metri sotto la linea d'acqua. Nessun errore:
    # solo un ingombro assurdo, che si vede solo se lo si misura.
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    o.data.materials.append(MAT[materiale])
    bpy.ops.object.shade_smooth()
    if smusso:
        smussa(o, smusso)
    return o


def cono(r1, r2, h, pos, materiale, lati=32, asse='X'):
    bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=h, vertices=lati, location=pos)
    o = bpy.context.object
    if asse == 'X':
        o.rotation_euler = (0, math.radians(90), 0)
    # `transform_apply(rotation=True)` applica ANCHE posizione e scala: i tre
    # argomenti hanno tutti il default a True, e nominarne uno non spegne gli
    # altri. La posizione finiva cotta dentro la mesh, l'oggetto restava a
    # (0,0,0), e qualunque rotazione assegnata dopo girava il pezzo attorno
    # all'ORIGINE DELLA SCENA invece che attorno a se'. Le draglie della
    # battagliola sono finite 18 metri sotto la linea d'acqua. Nessun errore:
    # solo un ingombro assurdo, che si vede solo se lo si misura.
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    o.data.materials.append(MAT[materiale])
    bpy.ops.object.shade_smooth()
    return smussa(o)


def box(dim, pos, materiale, smusso=0.0025):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    o = bpy.context.object
    o.scale = dim
    bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(MAT[materiale])
    return smussa(o, smusso)


def anello(r_est, r_int, h, pos, materiale, lati=64):
    """UN ANELLO, non una superficie sottile — §4.1. Un guscio senza spessore,
    tagliato, mostra il rovescio della pelle e non da' nessun errore."""
    est = cil(r_est, h, pos, materiale, lati, smusso=0)
    dentro = cil(r_int, h * 1.6, pos, materiale, lati, smusso=0)
    m = est.modifiers.new('b', 'BOOLEAN'); m.operation = 'DIFFERENCE'; m.object = dentro
    bpy.context.view_layer.objects.active = est
    bpy.ops.object.modifier_apply(modifier='b')
    bpy.data.objects.remove(dentro, do_unlink=True)
    return smussa(est)


def bulloni(n, raggio, x, r_testa, h_testa, materiale, nodo, dove=None):
    """La bulloneria e' la prima cosa che un tecnico guarda. Esagonali, con la
    rondella: un cilindro liscio non e' un bullone, e' un perno.

    `dove` filtra le posizioni. Serve sul coperchio asportabile, che e' MEZZO
    anello: senza filtro i dieci bulloni facevano cerchio intero e cinque
    restavano sospesi nel vuoto dove il coperchio era stato tagliato via.
    Difetto vero, trovato guardando l'ingombro del nodo — simmetrico su y e z
    quando la meta' tagliata non poteva esserlo."""
    for i in range(n):
        a = i / n * math.pi * 2
        y, z = math.cos(a) * raggio, math.sin(a) * raggio
        if dove and not dove(y, z):
            continue
        reg(nodo, cil(r_testa, h_testa, (x, y, z), materiale, 6, smusso=0.0008))
        reg(nodo, cil(r_testa * 1.35, h_testa * 0.32, (x - h_testa * 0.55, y, z), materiale, 20, smusso=0.0006))


def curva(punti, raggio, materiale, nodo):
    cu = bpy.data.curves.new('c', 'CURVE')
    cu.dimensions = '3D'; cu.bevel_depth = raggio; cu.bevel_resolution = 5
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(punti) - 1)
    for i, p in enumerate(punti):
        bp = sp.bezier_points[i]; bp.co = p
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    o = bpy.data.objects.new('cavo', cu)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(MAT[materiale])
    return reg(nodo, o)


# ═══ STATIC_HULL_PLATE ════════════════════════════════════════════════════
reg('STATIC_HULL_PLATE', box((0.012, 2.60, 2.20), (-0.006, 0, 0.30), 'carena'))

# ═══ STATIC_FOUNDATION ════════════════════════════════════════════════════
# la fondazione detta l'ingombro: e' lei a toccare i due estremi
reg('STATIC_FOUNDATION', box((1.005, U_LUNG, 0.020), (-0.4975, 0, -U_ALT / 2 - 0.02), 'carena'))
for y in (-U_LUNG / 2 + 0.012, U_LUNG / 2 - 0.012):
    reg('STATIC_FOUNDATION', box((0.95, 0.014, 0.13), (-0.4975, y, -U_ALT / 2 - 0.085), 'carena'))
# antivibranti: la macchina non e' saldata allo scafo, ci appoggia sopra
for x in (-0.86, -0.16):
    for y in (-0.26, 0.26):
        reg('STATIC_FOUNDATION', cil(0.030, 0.026, (x, y, -U_ALT / 2 - 0.008), 'gomma', 20, asse='Z'))
        reg('STATIC_FOUNDATION', cil(0.011, 0.05, (x, y, -U_ALT / 2 + 0.010), 'acciaio', 6, asse='Z'))

# ═══ STATIC_MOTOR ═════════════════════════════════════════════════════════
reg('STATIC_MOTOR', cil(0.098, 0.28, (-0.855, 0, 0.16), 'motore'))
# alette di raffreddamento: un servomotore chiuso le ha sempre
for i in range(11):
    reg('STATIC_MOTOR', cil(0.112, 0.006, (-0.985 + i * 0.024, 0, 0.16), 'motore', 24, smusso=0))
reg('STATIC_MOTOR', cono(0.062, 0.098, 0.055, (-1.020, 0, 0.16), 'motore'))
reg('STATIC_MOTOR', cil(0.113, 0.016, (-0.712, 0, 0.16), 'motore', 32))
bulloni(4, 0.088, -0.706, 0.008, 0.016, 'acciaio', 'STATIC_MOTOR')
# morsettiera col suo pressacavo
reg('STATIC_MOTOR', box((0.095, 0.085, 0.070), (-0.86, 0.118, 0.215), 'motore'))
reg('STATIC_MOTOR', cil(0.014, 0.030, (-0.86, 0.165, 0.215), 'acciaio', 12, asse='Y'))
curva([(-0.86, 0.180, 0.215), (-0.86, 0.30, 0.34), (-0.70, 0.36, 0.52)], 0.011, 'cavo', 'STATIC_MOTOR')

# ═══ HOUSING_FIXED ════════════════════════════════════════════════════════
reg('HOUSING_FIXED', anello(0.300, 0.300 - SPESSORE, 0.40, (-0.44, 0, 0), 'carter'))
reg('HOUSING_FIXED', anello(0.215, 0.215 - SPESSORE, 0.26, (-0.12, 0, 0), 'carter'))
# nervature: un getto le ha sempre
for i in range(8):
    a = i / 8 * math.pi * 2
    reg('HOUSING_FIXED', box((0.36, 0.014, 0.052),
                             (-0.44, math.cos(a) * 0.31, math.sin(a) * 0.31), 'carter'))
# piede di appoggio sulla fondazione
reg('HOUSING_FIXED', box((0.30, U_LUNG - 0.10, 0.028), (-0.44, 0, -U_ALT / 2 + 0.014), 'carter'))
# flangia di accoppiamento col motore, imbullonata
reg('HOUSING_FIXED', cil(0.128, 0.020, (-0.700, 0, 0.16), 'carter', 40))
# coperchio d'ispezione: dice che il pezzo si apre, cioe' che qualcuno ci
# mette le mani. Un carter senza accessi non e' un prodotto, e' una scultura
reg('HOUSING_FIXED', cil(0.105, 0.014, (-0.44, 0, 0.298), 'carter', 40, asse='Z'))
for i in range(6):
    a = i / 6 * math.pi * 2
    reg('HOUSING_FIXED', cil(0.008, 0.020, (-0.44 + math.cos(a) * 0.082, math.sin(a) * 0.082, 0.303),
                             'acciaio', 6, asse='Z', smusso=0.0008))
# targhetta: geometria, non decalcomania — niente marchi, §0
reg('HOUSING_FIXED', box((0.075, 0.002, 0.045), (-0.30, -0.216, 0.10), 'lucido'))

# ═══ HOUSING_REMOVABLE ════════════════════════════════════════════════════
rem = anello(0.306, 0.306 - SPESSORE, 0.38, (-0.44, 0, 0), 'carter')
bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.44, -0.42, 0))
t = bpy.context.object; t.scale = (0.9, 0.8, 0.9)
bpy.ops.object.transform_apply(scale=True)
m = rem.modifiers.new('mezzo', 'BOOLEAN'); m.operation = 'DIFFERENCE'; m.object = t
bpy.context.view_layer.objects.active = rem
bpy.ops.object.modifier_apply(modifier='mezzo')
bpy.data.objects.remove(t, do_unlink=True)
reg('HOUSING_REMOVABLE', rem)
# solo sulla meta' che esiste davvero: il taglio porta via y < -0,02
bulloni(10, 0.322, -0.44, 0.009, 0.018, 'acciaio', 'HOUSING_REMOVABLE',
        dove=lambda y, z: y > -0.02)

# ═══ HOUSING_SECTION · l'anello di materia sul piano di taglio ═══════════
reg('HOUSING_SECTION', anello(0.306, 0.300 - SPESSORE, 0.005, (-0.44, 0, 0), 'sezione'))

# ═══ STATIC_SEAL · la tenuta ═════════════════════════════════════════════
reg('STATIC_SEAL', cil(0.105, 0.045, (0.028, 0, 0), 'tenuta', 40))
bulloni(6, 0.082, 0.028, 0.0075, 0.016, 'acciaio', 'STATIC_SEAL')
reg('STATIC_SEAL', cono(0.070, 0.088, 0.055, (0.078, 0, 0), 'tenuta'))
reg('STATIC_SEAL', cil(0.062, 0.020, (0.112, 0, 0), 'gomma', 32))
# ingrassatore: un dettaglio che nessuno guarda e che dice «questo si manutiene»
reg('STATIC_SEAL', cil(0.005, 0.022, (0.028, 0, 0.108), 'acciaio', 8, asse='Z', smusso=0.0006))

# ═══ RIG_INPUT + RIG_ECCENTRIC ═══════════════════════════════════════════
reg('RIG_INPUT', cil(0.030, 0.30, (-0.68, 0, 0), 'lucido', 24))
reg('RIG_INPUT', cil(0.044, 0.026, (-0.62, 0, 0), 'acciaio', 24))     # calettatura
reg('RIG_ECCENTRIC', cil(0.055, 0.048, (-0.58, ECCENTRICITA, 0), 'acciaio', 28))
reg('RIG_ECCENTRIC', cil(0.055, 0.048, (-0.30, -ECCENTRICITA, 0), 'acciaio', 28))


def disco(x, fase, nodo):
    """29 lobi. Non e' un ingranaggio a denti: il profilo cicloidale e' una
    circonferenza deformata. §12 vieta di mostrare un planetario e chiamarlo
    cicloidale. E ha i FORI che i perni del portante attraversano davvero."""
    N, R, amp = 29, 0.135, 0.010
    passi = 220
    vs, fs = [], []
    for k in range(passi):
        t = k / passi * math.pi * 2
        r = R + amp * math.cos(N * t + fase)
        vs.append((x - 0.013, math.cos(t) * r, math.sin(t) * r))
        vs.append((x + 0.013, math.cos(t) * r, math.sin(t) * r))
    for k in range(passi):
        a, b = 2 * k, 2 * k + 1
        c, d = 2 * ((k + 1) % passi), 2 * ((k + 1) % passi) + 1
        fs.append([a, c, d, b])
    fs.append([2 * k for k in range(passi)][::-1])
    fs.append([2 * k + 1 for k in range(passi)])
    me = bpy.data.meshes.new('d')
    me.from_pydata(vs, [], fs); me.update()
    o = bpy.data.objects.new('d', me)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(MAT['acciaio'])
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.shade_smooth()
    # i FORI: il portante ci passa dentro, non ci appoggia sopra
    for i in range(6):
        a = i / 6 * math.pi * 2
        f = cil(0.020, 0.06, (x, math.cos(a) * 0.075, math.sin(a) * 0.075), 'acciaio', 16, smusso=0)
        mm = o.modifiers.new('f%d' % i, 'BOOLEAN'); mm.operation = 'DIFFERENCE'; mm.object = f
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.modifier_apply(modifier='f%d' % i)
        bpy.data.objects.remove(f, do_unlink=True)
    return reg(nodo, smussa(o, 0.0012))


disco(-0.47, 0.0, 'RIG_CYCLO_A')
disco(-0.43, math.pi, 'RIG_CYCLO_B')

# la CORONA di perni fissi: 30, uno piu' dei lobi. E' il pezzo che spiega il
# rapporto 29:1 a chi lo guarda, e nel grezzo mancava
for i in range(30):
    a = i / 30 * math.pi * 2
    reg('HOUSING_FIXED', cil(0.008, 0.040, (-0.45, math.cos(a) * 0.152, math.sin(a) * 0.152),
                             'lucido', 12, smusso=0.0006))

# ═══ RIG_OUTPUT ══════════════════════════════════════════════════════════
reg('RIG_OUTPUT', cil(0.098, 0.040, (-0.335, 0, 0), 'acciaio', 40))
for i in range(6):
    a = i / 6 * math.pi * 2
    reg('RIG_OUTPUT', cil(0.0135, 0.17, (-0.44, math.cos(a) * 0.075, math.sin(a) * 0.075), 'lucido', 14))
reg('RIG_OUTPUT', cil(0.086, 0.030, (-0.245, 0, 0), 'acciaio', 32))    # cuscinetto
reg('RIG_OUTPUT', cil(0.070, 0.024, (-0.205, 0, 0), 'lucido', 32))

# ═══ RIG_SHAFT ═══════════════════════════════════════════════════════════
reg('RIG_SHAFT', cil(0.048, 0.46, (-0.10, 0, 0), 'lucido', 40))
reg('RIG_SHAFT', cil(0.056, 0.020, (-0.16, 0, 0), 'acciaio', 32))

# ═══ RIG_FIN ═════════════════════════════════════════════════════════════
reg('RIG_FIN', cono(0.058, 0.080, 0.060, (0.150, 0, 0), 'acciaio'))    # mozzo di radice
prof = [(-0.42, 0), (-0.34, 0.062), (-0.20, 0.092), (-0.02, 0.100),
        (0.20, 0.072), (0.38, 0.040), (0.52, 0),
        (0.38, -0.040), (0.20, -0.072), (-0.02, -0.100), (-0.20, -0.092), (-0.34, -0.062)]
# ─── L'APERTURA E LA CORDA NON SI SCELGONO: DISCENDONO DAI NUMERI ────────
#
# Qui prima c'era `ap = 0.18 + t * APERTURA` con `CORDA = 0.62` scritta a mano,
# e due numeri dichiarati che la geometria non rispettava:
#
#   apertura   la pinna finiva a x = 1,680 mentre il fasciame e' a x = 0.
#              §2.2 fissa l'origine sul piano del fasciame, quindi l'apertura
#              vera era 1,68 m: il 12% oltre il bersaglio. La riga che la
#              stampava faceva `mx[0] - 0.18` — il massimo X di QUALUNQUE
#              oggetto meno una costante — e restituiva 1,500 per aritmetica.
#              Non era una misura: era una sottrazione che tornava.
#
#   area       `finAreaM2` dichiarava 2,20 m² e la pinna disegnata ne aveva
#              circa 0,7. Tre volte di scarto, su un dato che §2.2 definisce
#              come «descrive il modello mostrato».
#
# Adesso la punta sta dove deve stare e la corda si RICAVA dall'area: si
# integra il profilo sulle stesse stazioni con cui la mesh viene costruita,
# cosi' il valore dichiarato e quello disegnato sono lo stesso numero e non
# possono divergere. Sono le quote della e1500 citata in §1.5 — una pinna larga
# e corta, non una lama: e' cosi' che sono fatte davvero.
SEZ = 8
CORDA_UNITA = max(px for px, _ in prof) - min(px for px, _ in prof)
RADICE_X = 0.120                       # dentro la tenuta, dove l'albero esce
LUNG = APERTURA - RADICE_X             # tratto effettivamente disegnato
_taper = [1.0 - 0.42 * (i / (SEZ - 1)) ** 1.3 for i in range(SEZ)]
_passo = LUNG / (SEZ - 1)
_area_unitaria = sum((_taper[i] + _taper[i + 1]) / 2 * _passo for i in range(SEZ - 1)) * CORDA_UNITA
CORDA = AREA_PINNA / _area_unitaria
AREA_DISEGNATA = _area_unitaria * CORDA

vs, fs = [], []
for i in range(SEZ):
    t = i / (SEZ - 1)
    ap = RADICE_X + t * LUNG
    s = _taper[i] * CORDA
    for (px, py) in prof:
        vs.append((ap, px * s, py * s))
n = len(prof)
for i in range(SEZ - 1):
    for k in range(n):
        j = (k + 1) % n
        fs.append([i * n + k, i * n + j, (i + 1) * n + j, (i + 1) * n + k])
fs.append(list(range(n))[::-1])
fs.append([(SEZ - 1) * n + k for k in range(n)])
me = bpy.data.meshes.new('pinna')
me.from_pydata(vs, [], fs); me.update()
pin = bpy.data.objects.new('pinnaMesh', me)
bpy.context.collection.objects.link(pin)
pin.data.materials.append(MAT['acciaio'])
bpy.context.view_layer.objects.active = pin
bpy.ops.object.shade_smooth()
smussa(pin, 0.003, 3)
reg('RIG_FIN', pin)

# ═══ MONTAGGIO DEI NODI ══════════════════════════════════════════════════
bpy.ops.object.empty_add(location=(0, 0, 0))
IMPIANTO = bpy.context.object
IMPIANTO.name = 'IMPIANTO'

GERARCHIA = {
    'RIG_ECCENTRIC': 'RIG_INPUT',     # l'eccentrico e' figlio dell'ingresso
}

vuoti = {}
for nodo in ['STATIC_FOUNDATION', 'STATIC_HULL_PLATE', 'STATIC_SEAL', 'STATIC_MOTOR',
             'HOUSING_FIXED', 'HOUSING_REMOVABLE', 'HOUSING_SECTION',
             'RIG_INPUT', 'RIG_ECCENTRIC', 'RIG_CYCLO_A', 'RIG_CYCLO_B',
             'RIG_OUTPUT', 'RIG_SHAFT', 'RIG_FIN']:
    bpy.ops.object.empty_add(location=(0, 0, 0))
    v = bpy.context.object
    v.name = nodo
    v.empty_display_size = 0.04
    vuoti[nodo] = v

for nodo, v in vuoti.items():
    padre = vuoti.get(GERARCHIA.get(nodo), IMPIANTO)
    v.parent = padre
    v.matrix_parent_inverse = padre.matrix_world.inverted()

for nodo, lista in pezzi_di.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in lista:
        if o.type == 'CURVE':
            bpy.context.view_layer.objects.active = o
            bpy.ops.object.convert(target='MESH')
    for o in lista:
        o.select_set(True)
    bpy.context.view_layer.objects.active = lista[0]
    if len(lista) > 1:
        bpy.ops.object.join()
    unito = bpy.context.object
    unito.name = nodo + '_MESH'
    unito.parent = vuoti[nodo]
    unito.matrix_parent_inverse = vuoti[nodo].matrix_world.inverted()

IMPIANTO['assetRole'] = 'generic-electric-fin-actuator'
IMPIANTO['authoringUnit'] = 'meter'
IMPIANTO['sceneMetersPerUnit'] = 2.5
IMPIANTO['finAreaM2'] = round(AREA_DISEGNATA, 4)   # misurata sulle sezioni, non copiata
IMPIANTO['finSpanM'] = APERTURA                    # dal piano del fasciame alla punta
IMPIANTO['finMaxAngleDeg'] = ANG_MAX
IMPIANTO['gearType'] = 'cycloidal'
IMPIANTO['gearRatio'] = RAPPORTO
# L'ECCENTRICITA' SI DICHIARA, PERCHE' NELLA GEOMETRIA NON C'E'.
# Il disco e' modellato CENTRATO sull'asse: l'orbita da 12 mm gliela impone il
# sito a ogni fotogramma. Chi provasse a ricavarla dalla mesh — l'ho fatto —
# ottiene 0,0005 m, che e' l'asimmetria residua dei 29 lobi: un numero
# plausibile, mai nullo, quindi nessun ripiego scatta e i dischi orbitano di
# mezzo millimetro. Invisibile. Il raggio va accanto perche' e' il termine di
# paragone: 12 su 135 e' un movimento che si vede, 0,5 su 135 no.
IMPIANTO['eccentricityM'] = ECCENTRICITA
IMPIANTO['cycloDiscRadiusM'] = 0.135
IMPIANTO['modelClaim'] = 'illustrative'

# ─── l'ingombro, misurato e dichiarato ───────────────────────────────────
mn = Vector((1e9, 1e9, 1e9)); mx = Vector((-1e9, -1e9, -1e9))
ii = Vector((1e9, 1e9, 1e9)); im = Vector((-1e9, -1e9, -1e9))
tri = 0
for o in bpy.data.objects:
    if o.type != 'MESH':
        continue
    tri += len(o.data.polygons)
    for v in o.bound_box:
        w = o.matrix_world @ Vector(v)
        for i in range(3):
            mn[i] = min(mn[i], w[i]); mx[i] = max(mx[i], w[i])
        if not o.name.startswith(('RIG_FIN', 'STATIC_HULL')):
            for i in range(3):
                ii[i] = min(ii[i], w[i]); im[i] = max(im[i], w[i])
print('FACCE %d' % tri)
print('INGOMBRO interna %.3f x %.3f x %.3f m  (bersaglio %.2f x %.2f x %.2f)'
      % (im[0]-ii[0], im[1]-ii[1], im[2]-ii[2], U_LARG, U_LUNG, U_ALT))
# La misura vera: il punto piu' esterno della PINNA, con i modificatori
# applicati, contro il piano del fasciame che sta a x = 0.
# Si guarda l'oggetto UNITO, non `pezzi_di['RIG_FIN']`: il montaggio fonde i
# pezzi con `join()` e le vecchie referenze restano appese a dati rimossi —
# «StructRNA of type Object has been removed», visto succedere qui.
dg = bpy.context.evaluated_depsgraph_get()
punta = -1e9
fin = bpy.data.objects['RIG_FIN_MESH'].evaluated_get(dg)
for v in fin.data.vertices:
    punta = max(punta, (fin.matrix_world @ v.co)[0])
print('PINNA apertura   %.3f m  (bersaglio %.2f)' % (punta, APERTURA))
print('PINNA area       %.3f m2 (bersaglio %.2f), corda radice %.3f m'
      % (AREA_DISEGNATA, AREA_PINNA, CORDA_UNITA * CORDA))

bpy.ops.object.select_all(action='SELECT')
percorso = os.path.join(FUORI, 'impianto.glb')
bpy.ops.export_scene.gltf(filepath=percorso, export_format='GLB',
                          use_selection=True, export_apply=True,
                          export_yup=True, export_extras=True)
print('GLB %.0f KB' % (os.path.getsize(percorso) / 1024))
