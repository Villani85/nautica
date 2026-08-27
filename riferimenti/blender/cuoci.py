"""
CUOCE IL MECCANISMO: dalla geometria del sito a una sequenza fotorealistica.

    blender -b -P cuoci.py -- <meccanismo.json> <cartella> [angolo]

─── PERCHE' NON RICOSTRUISCE, IMPORTA

Il primo tentativo riscriveva il meccanismo a mano dalle quote di `nave.js`.
Funzionava, ma creava **due sorgenti di verita' per la stessa geometria** — e in
un progetto che verifica tutto contro una funzione sola, e' proprio la cosa da
non fare. La seconda stesura legge la geometria ESPORTATA DALLA PAGINA: gli
stessi vertici che il sito disegna, con le stesse matrici.

Cosi' se domani le ordinate cambiano, o il quadrilatero articolato si sposta, la
sequenza cotta segue senza che nessuno la aggiorni. Si riesporta e si ricuoce.

─── E PERCHE' SI CUOCE INVECE DI RENDERIZZARE DAL VIVO

Il tempo reale non arriva al fotorealismo: misurato, non supposto. Cotta offline
la stessa geometria diventa una fotografia, e resta guidata dalla fisica perche'
e' **l'angolo della pinna a scegliere il fotogramma**. Non e' tempo reale, e'
reattivo — che e' cio' che serve: quando l'utente muove l'andatura, la pinna
cambia incidenza e la sequenza segue.
"""
import bpy, json, math, sys, os, time
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index('--') + 1:]
SORGENTE, FUORI = argv[0], argv[1]
UNO = float(argv[2]) if len(argv) > 2 else None

# i tre materiali del meccanismo: acciaio, bronzo, accento della cinematica.
# Tutto il resto — coperta, tessuti, vetro — e' arredamento e qui non serve.
MECCANISMO = {'49555a': 'acciaio', '6e6350': 'bronzo', '4fe0c4': 'accento'}

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene


def metallo(nome, colore, base, aniso=0.70):
    """La ricetta misurata: vedi riferimenti/blender/LEGGIMI.md."""
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*colore, 1)
    b.inputs['Metallic'].default_value = 1.0
    b.inputs['Roughness'].default_value = base
    if 'Anisotropic' in b.inputs:
        b.inputs['Anisotropic'].default_value = aniso
        b.inputs['Anisotropic Rotation'].default_value = 0.25
    coord = nt.nodes.new('ShaderNodeTexCoord')
    verso = nt.nodes.new('ShaderNodeMapping')
    # LA VARIAZIONE SEGUE IL VERSO DELLA LAVORAZIONE: isotropa legge come sporco
    verso.inputs['Scale'].default_value = (0.06, 9.0, 9.0)
    nt.links.new(coord.outputs['Object'], verso.inputs['Vector'])
    ru = nt.nodes.new('ShaderNodeTexNoise')
    ru.inputs['Scale'].default_value = 5.0
    ru.inputs['Detail'].default_value = 3.0
    nt.links.new(verso.outputs['Vector'], ru.inputs['Vector'])
    mp = nt.nodes.new('ShaderNodeMapRange')
    mp.inputs['From Min'].default_value = 0.35
    mp.inputs['From Max'].default_value = 0.65
    mp.inputs['To Min'].default_value = base - 0.02
    mp.inputs['To Max'].default_value = base + 0.02
    nt.links.new(ru.outputs['Fac'], mp.inputs['Value'])
    nt.links.new(mp.outputs['Result'], b.inputs['Roughness'])
    g = nt.nodes.new('ShaderNodeTexNoise')
    g.inputs['Scale'].default_value = 900.0
    g.inputs['Detail'].default_value = 1.0
    st = nt.nodes.new('ShaderNodeMapping')
    st.inputs['Scale'].default_value = (1.0, 60.0, 1.0)
    nt.links.new(coord.outputs['Object'], st.inputs['Vector'])
    nt.links.new(st.outputs['Vector'], g.inputs['Vector'])
    bu = nt.nodes.new('ShaderNodeBump')
    bu.inputs['Strength'].default_value = 0.006
    nt.links.new(g.outputs['Fac'], bu.inputs['Height'])
    nt.links.new(bu.outputs['Normal'], b.inputs['Normal'])
    return m


# I COLORI SONO QUELLI DI UN METALLO, non quelli del CSS del sito.
# Passando i valori del foglio di stile il pezzo usciva quasi nero: quelli sono
# scelti per stare su carta chiara con luci di scena, non per riflettere. Un
# acciaio vero ha riflettanza attorno a 0,56, un bronzo attorno a 0,62.
def verniciato(nome, colore, base):
    """Non tutto il meccanismo e' metallo nudo: carter e motore sono VERNICIATI,
    e la vernice non ha direzione di lavorazione. Dare a tutti la striatura del
    tornito sarebbe il difetto opposto a quello che si sta curando -- un pezzo
    unico invece di un assieme di pezzi diversi."""
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*colore, 1)
    b.inputs['Metallic'].default_value = 0.0
    b.inputs['Roughness'].default_value = base
    if 'Coat Weight' in b.inputs:
        b.inputs['Coat Weight'].default_value = 0.25
        b.inputs['Coat Roughness'].default_value = 0.12
    return m


MAT = {
    'acciaio': metallo('acciaio', (0.54, 0.56, 0.58), 0.20),
    'lucido': metallo('lucido', (0.62, 0.64, 0.66), 0.09),
    'sezione': metallo('sezione', (0.58, 0.60, 0.62), 0.28, aniso=0.35),
    'tenuta': metallo('tenuta', (0.44, 0.40, 0.34), 0.34),
    'carter': verniciato('carter', (0.30, 0.33, 0.35), 0.32),
    'motore': verniciato('motore', (0.14, 0.15, 0.16), 0.38),
    'gomma': verniciato('gomma', (0.05, 0.05, 0.055), 0.72),
    'cavo': verniciato('cavo', (0.07, 0.07, 0.075), 0.55),
    'bronzo': metallo('bronzo', (0.66, 0.50, 0.30), 0.30),
    'accento': metallo('accento', (0.31, 0.88, 0.77), 0.24, aniso=0.4),
}

# --- SI SCEGLIE PER NOME, E UN NOME SCONOSCIUTO E' UN ERRORE
#
# Qui c'era `MECCANISMO = {'49555a': 'acciaio', '6e6350': 'bronzo',
# '4fe0c4': 'accento'}` -- una tabella di COLORI, ereditata da quando il
# meccanismo era costruito a mano nel codice. Adesso arriva da un GLB con i
# suoi materiali, e di quei tre colori ne sopravviveva **uno**.
#
# Misurato: il render teneva **10 pezzi su 73**, cioe' 240 vertici su 45.000 --
# lo 0,5% del pezzo -- e produceva un PNG lo stesso. La guardia esisteva
# (`if not tenuti: raise`) ma scattava solo a ZERO: un cancello che vede il
# guasto totale e non quello parziale.
#
# Due correzioni, e la seconda vale piu' della prima:
#
#   1. si sceglie per NOME. Il colore e' una chiave sbagliata due volte: cambia
#      quando cambia la tinta, e due materiali diversi possono averlo uguale;
#   2. un materiale del meccanismo che questa tabella non conosce **ferma il
#      render**. Aggiungere un pezzo in Blender senza dirlo qui non deve poter
#      produrre un'immagine incompleta che sembra completa.
#
# Cio' che non e' meccanismo si dichiara, cosi' il salto e' una decisione
# scritta e non un buco nella tabella.
NON_MECCANISMO = {'carena', 'coperta', 'acqua', 'interno', 'vetro', 'scafo'}


def del_meccanismo(nome):
    """None = non e' meccanismo (si salta). Altrimenti il nome del materiale."""
    if not nome or nome.startswith('sovra_') or nome in NON_MECCANISMO:
        return None
    return nome

# three.js ha Y in alto, Blender Z: (x, y, z) -> (x, -z, y)
GIRA = Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))

pezzi = json.load(open(SORGENTE, encoding='utf-8'))
tenuti = 0
saltati = 0
sconosciuti = set()
vertici_tenuti = 0
minimo = Vector((1e9, 1e9, 1e9))
massimo = Vector((-1e9, -1e9, -1e9))

for k, p in enumerate(pezzi):
    nome = del_meccanismo(p.get('nome'))
    if nome is None:
        saltati += 1
        continue
    if nome not in MAT:
        sconosciuti.add(nome)
        continue
    pos, idx = p['pos'], p['idx']
    n = len(pos) // 3
    M = Matrix([[p['m'][c * 4 + r] for c in range(4)] for r in range(4)])   # three e' per colonne
    vs = []
    for i in range(n):
        v = M @ Vector((pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]))
        v = GIRA @ v
        vs.append(v)
        for a in range(3):
            minimo[a] = min(minimo[a], v[a]); massimo[a] = max(massimo[a], v[a])
    fs = [(idx[i], idx[i + 1], idx[i + 2]) for i in range(0, len(idx), 3)] if idx \
        else [(i, i + 1, i + 2) for i in range(0, n, 3)]
    me = bpy.data.meshes.new('p%d' % k)
    me.from_pydata([tuple(v) for v in vs], [], fs)
    me.update()
    ob = bpy.data.objects.new('p%d' % k, me)
    bpy.context.collection.objects.link(ob)
    ob.data.materials.append(MAT[nome])
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.shade_smooth()
    # LO SMUSSO E' LA META' DEL FOTOREALISMO: uno spigolo matematicamente netto
    # non esiste, e un millimetro che raccoglie una luce e' cio' che si legge
    # come pezzo lavorato.
    mo = ob.modifiers.new('smusso', 'BEVEL')
    mo.width = 0.004; mo.segments = 2; mo.limit_method = 'ANGLE'; mo.angle_limit = math.radians(35)
    tenuti += 1
    vertici_tenuti += n

# SI INQUADRA UN GRUPPO SOLO. L'ingombro comprende dritta e sinistra, e una
# camera che li tiene entrambi e' una camera che non guarda niente.
# SI INQUADRA IL GRUPPO DI DRITTA, non tutti e due. L'ingombro totale comprende
# dritta e sinistra piu' le pinne: una camera che li tiene tutti e' una camera
# che non guarda niente, e infatti il pezzo usciva minuscolo in mezzo al vuoto.
# Il gruppo di dritta sta fra il riduttore (x minimo positivo) e l'estremita'
# della pinna: si prende quello e basta.
xs = [v for v in (minimo[0], massimo[0])]
centro = (minimo + massimo) / 2
centro[0] = massimo[0] * 0.55
centro[2] = (minimo[2] + massimo[2]) / 2
misura = massimo[0] * 0.95
print('PEZZI %d di %d · ingombro %.2f · centro %.2f %.2f %.2f'
      % (tenuti, len(pezzi), misura, centro[0], centro[1], centro[2]))
if sconosciuti:
    print('MATERIALI SCONOSCIUTI: ' + ', '.join(sorted(sconosciuti)))
    print('Non li salto: un render incompleto che sembra completo e peggio di')
    print('nessun render. Aggiungili a MAT in questo file.')
    raise SystemExit(2)
if not tenuti:
    raise SystemExit('nessun pezzo del meccanismo: i nomi dei materiali sono cambiati?')
print('MATERIA  %d pezzi tenuti (%d vertici), %d saltati perche non meccanismo'
      % (tenuti, vertici_tenuti, saltati))


def softbox(pos, rot, energia, misura_luce, y):
    bpy.ops.object.light_add(type='AREA', location=pos)
    o = bpy.context.object
    o.data.shape = 'RECTANGLE'; o.data.size = misura_luce; o.data.size_y = misura_luce * y
    o.data.energy = energia; o.rotation_euler = rot


d = misura
softbox((centro[0] + d, centro[1] - d * 1.4, centro[2] + d * 1.1),
        (math.radians(48), 0, math.radians(30)), 120 * d * d, d * 1.6, 0.28)
softbox((centro[0] - d * 1.3, centro[1] + d, centro[2] + d * 0.5),
        (math.radians(74), 0, math.radians(-126)), 45 * d * d, d * 1.4, 0.30)

"""
─── L'AMBIENTE E' UN HDRI VERO, e prima l'avevo escluso per una ragione giusta
    applicata al posto sbagliato.

Nel sito un HDRI non si usa: pesa 1-2 MB contro un budget di 500 KB per gli
asset, e porterebbe colori che nella tavolozza non esistono. Vero PER IL WEB.
Qui non si spedisce l'ambiente: si spediscono i FOTOGRAMMI COTTI. L'HDRI resta
sul disco e la pagina non cambia di un byte.

E senza, il pezzo non puo' funzionare. Con `metalness: 1` un metallo mostra
SOLTANTO cio' che riflette: contro un gradiente piatto riflette una tinta —
usciva verde acqua, il colore del mondo. Contro un'officina vera riflette una
stanza, ed e' quello che l'occhio legge come fotografia. Non e' una rifinitura:
e' la differenza fra un render e una foto.
"""
sc.world = bpy.data.worlds.new('m'); sc.world.use_nodes = True
wn = sc.world.node_tree
sf = wn.nodes['Background']
AMBIENTE = os.path.join(os.path.dirname(SORGENTE), 'hdri', 'ambiente.hdr')
if os.path.exists(AMBIENTE):
    env = wn.nodes.new('ShaderNodeTexEnvironment')
    env.image = bpy.data.images.load(AMBIENTE)
    rot = wn.nodes.new('ShaderNodeMapping')
    rot.inputs['Rotation'].default_value = (0, 0, math.radians(-55))
    cc = wn.nodes.new('ShaderNodeTexCoord')
    wn.links.new(cc.outputs['Generated'], rot.inputs['Vector'])
    wn.links.new(rot.outputs['Vector'], env.inputs['Vector'])
    wn.links.new(env.outputs['Color'], sf.inputs[0])
    sf.inputs[1].default_value = 1.0
    print('AMBIENTE officina')
else:
    gr = wn.nodes.new('ShaderNodeTexGradient'); gr.gradient_type = 'EASING'
    cc = wn.nodes.new('ShaderNodeTexCoord')
    mpp = wn.nodes.new('ShaderNodeMapping')
    mpp.inputs['Rotation'].default_value = (math.radians(90), 0, 0)
    wn.links.new(cc.outputs['Generated'], mpp.inputs['Vector'])
    wn.links.new(mpp.outputs['Vector'], gr.inputs['Vector'])
    ra = wn.nodes.new('ShaderNodeValToRGB')
    ra.color_ramp.elements[0].color = (0.05, 0.13, 0.14, 1)
    ra.color_ramp.elements[1].color = (0.30, 0.52, 0.55, 1)
    wn.links.new(gr.outputs['Fac'], ra.inputs['Fac'])
    wn.links.new(ra.outputs['Color'], sf.inputs[0])
    sf.inputs[1].default_value = 1.6
    print('AMBIENTE gradiente (nessun hdri)')

# UN PIANO D'APPOGGIO. I pezzi galleggiavano nel nulla: una fotografia di
# macchinario e' sempre DA QUALCHE PARTE, e l'ombra di contatto e' cio' che fa
# appoggiare un oggetto invece di farlo levitare.
bpy.ops.mesh.primitive_plane_add(size=misura * 8, location=(centro[0], centro[1], minimo[2] - 0.02))
piano = bpy.context.object
mp = bpy.data.materials.new('piano'); mp.use_nodes = True
pb = mp.node_tree.nodes['Principled BSDF']
pb.inputs['Base Color'].default_value = (0.055, 0.06, 0.065, 1)
pb.inputs['Roughness'].default_value = 0.38
piano.data.materials.append(mp)

bpy.ops.object.camera_add(location=(centro[0] + d * 0.35, centro[1] - d * 2.1, centro[2] + d * 0.30))
cam = bpy.context.object
cam.data.lens = 60
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = d * 2.1
cam.data.dof.aperture_fstop = 5.6
# la camera guarda il centro dell'ingombro: non si sceglie a occhio
dirv = Vector(centro) - cam.location
cam.rotation_euler = dirv.to_track_quat('-Z', 'Y').to_euler()
sc.camera = cam

sc.render.engine = 'CYCLES'

# ─── OPTIX si VERIFICA, non si spera. Qui prima c'era un try/except che non
#     entrava mai: assegnare compute_device_type su una macchina senza scheda
#     NON solleva niente. Assegna, get_devices() torna il solo CPU, e
#     scene.cycles.device = 'GPU' viene pure accettato. Cycles ripiega su CPU
#     in silenzio e il render esce identico, solo dieci volte piu' lento.
#     Non c'era nessun ripiego da intercettare: c'era un guasto che non passa
#     di li'. Lo stesso principio dei materiali sconosciuti, un fotogramma
#     lentissimo che sembra normale e' peggio di un errore.
pr = bpy.context.preferences.addons['cycles'].preferences
pr.compute_device_type = 'OPTIX'   # prima il backend
pr.get_devices()                   # poi l'enumerazione: l'ordine inverso conta
optix = [d for d in pr.devices if d.type == 'OPTIX']
if optix:
    for dev in pr.devices:
        dev.use = (dev.type == 'OPTIX')   # solo GPU: la CPU accesa accanto rallenta
    sc.cycles.device = 'GPU'              # senza questa la scena resta su CPU
    print('OPTIX    %s' % ', '.join(d.name for d in optix))
elif os.environ.get('CUOCI_CPU'):
    sc.cycles.device = 'CPU'
    print('OPTIX assente: render su CPU perche CUOCI_CPU e impostata. Sara lento.')
else:
    print('OPTIX NON DISPONIBILE: Cycles ripiegherebbe su CPU senza dirlo.')
    print('Device visti: %s' % [(d.name, d.type) for d in pr.devices])
    print('Su una macchina con NVIDIA controlla i driver. Per cuocere lo stesso')
    print('su CPU, sapendo che ci mette ore, rilancia con CUOCI_CPU=1.')
    raise SystemExit(2)
sc.cycles.use_denoising = True
sc.cycles.samples = 140
sc.render.resolution_x = 1000
sc.render.resolution_y = 620
sc.render.film_transparent = False
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'
sc.view_settings.view_transform = 'AgX'
sc.render.filepath = os.path.join(FUORI, 'meccanismo.png')

t = time.time()
bpy.ops.render.render(write_still=True)
print('RESO in %.1f s' % (time.time() - t))
