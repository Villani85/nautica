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
import bpy, bmesh, json, math, sys, os, time
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
    # IL FASCIAME DELLA FONDAZIONE. Porta il materiale dello scafo perche' e'
    # scafo -- ma e' la lamiera che il meccanismo attraversa, e senza di essa i
    # bulloni restano per aria. Vernice nautica: dielettrica, non metallo.
    'carena': verniciato('carena', (0.10, 0.11, 0.12), 0.22),
}

# I materiali che appartengono alla NAVE e non al meccanismo. Non sono vietati:
# entrano se e solo se stanno dentro il volume del meccanismo, e quando entrano
# lo si DICE, perche' un pezzo di scafo dentro un primo piano di macchinario e'
# una decisione, non un incidente.
OSPITE = {'carena', 'coperta', 'scafo'}

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
# three.js ha Y in alto, Blender Z: (x, y, z) -> (x, -z, y)
GIRA = Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))

_dati = json.load(open(SORGENTE, encoding='utf-8'))
# L'esportatore scriveva una lista; adesso scrive anche il piano di sezione.
# Si accettano tutte e due le forme, ma senza il piano il taglio non si applica
# e lo si DICE: un fasciame non tagliato e' una paratia che nella pagina non
# c'e'.
if isinstance(_dati, dict):
    pezzi, SEZIONE = _dati['pezzi'], _dati.get('sezione')
else:
    pezzi, SEZIONE = _dati, None

"""
--- CHI ENTRA NEL RENDER SI DECIDE CON LA GEOMETRIA, NON CON UNA LISTA DI NOMI

Qui c'era `NON_MECCANISMO`, una lista di materiali da saltare: carena, coperta,
acqua, interno, vetro, scafo. Sembrava ragionevole e produceva un difetto che
ho impiegato due render a capire: **i bulloni fluttuavano staccati.**

Misurato pezzo per pezzo, con centro e ingombro di ognuno, la causa e' saltata
fuori. Dentro il gruppo di dritta ci sono due pezzi che portano il materiale
`carena`:

    carena  mesh_11   dim 1,04   in mezzo al meccanismo
    carena  mesh_10   dim 0,40   sotto al meccanismo

Non sono lo scafo: sono **il fasciame che il meccanismo attraversa**, la
lamiera a cui i bulloni sono avvitati. Portano il materiale dello scafo perche'
sono scafo -- ma sono anche il pezzo senza il quale l'immagine non ha senso.
Un meccanismo fotografato senza la lamiera che lo tiene e' un meccanismo per
aria, ed e' esattamente cio' che si vedeva.

Il nome del materiale non poteva distinguerli, perche' e' lo stesso nome. La
posizione si': **stanno dentro il volume del meccanismo.** Quindi:

  1. il SEME sono i pezzi che portano un materiale del meccanismo e stanno dal
     lato scelto -- l'unica cosa di cui si e' certi;
  2. si misura il volume del seme;
  3. entra anche **qualunque pezzo il cui centro cade dentro quel volume**,
     comunque si chiami.

Non e' una soglia scelta a occhio: il volume lo dettano i pezzi stessi. E
separa cio' che la lista sbagliava in tutte e due le direzioni -- tiene dentro
il fasciame della fondazione, e lascia fuori i candelieri di coperta (12
triangoli l'uno, a 1,66 m piu' in alto) che una lista di nomi non nominava e
che entravano perche' nessuno li aveva previsti.
"""


def ingombro(q):
    m = q['m']
    pos = q['pos']
    M = Matrix([[m[c * 4 + r] for c in range(4)] for r in range(4)])   # three e' per colonne
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    vs = []
    for i in range(len(pos) // 3):
        v = GIRA @ (M @ Vector((pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])))
        vs.append(v)
        for a in range(3):
            lo[a] = min(lo[a], v[a])
            hi[a] = max(hi[a], v[a])
    return vs, lo, hi


misure = [ingombro(q) for q in pezzi]

"""
--- IL TAGLIO DELLA PAGINA SI APPLICA ANCHE QUI

Nel sito il guscio e' tagliato da un piano: `normale (0,0,-1)`, costante
lerpata mentre si scorre. E' cosi' che si guarda dentro la nave. Blender non ne
sapeva niente, e il primo render col fasciame dentro mostrava una PARATIA
BIANCA che spaccava l'immagine in due -- un pezzo che sul sito, in quella posa,
e' tagliato via.

Il piano tiene i punti con `n . p + C > 0`. `GIRA` e' una rotazione, quindi
`n . p_sito = (GIRA n) . p_blender`: la condizione si porta di la' ruotando la
normale, senza rifare i conti. Si taglia SOLO cio' che la pagina taglia --
i materiali della nave -- perche' il meccanismo, nella pagina, non e' tagliato.
"""

TAGLIO = None
if SEZIONE:
    N = GIRA @ Vector((SEZIONE['nx'], SEZIONE['ny'], SEZIONE['nz']))
    C = SEZIONE['costante']
    TAGLIO = (N * (-C), -N)
    print('SEZIONE  normale %.0f %.0f %.0f - costante %.3f' % (N[0], N[1], N[2], C))
else:
    print('SEZIONE  ASSENTE: il fasciame non viene tagliato. Riesporta con la')
    print('         versione nuova di esporta-meccanismo.mjs.')

LATO = os.environ.get('LATO', 'dritta')
segno = 1.0 if LATO == 'dritta' else -1.0

seme_lo = Vector((1e9, 1e9, 1e9))
seme_hi = Vector((-1e9, -1e9, -1e9))
for q, (vs, lo, hi) in zip(pezzi, misure):
    if q.get('nome') not in MAT:
        continue
    if ((lo[0] + hi[0]) / 2) * segno < 0:
        continue
    for a in range(3):
        seme_lo[a] = min(seme_lo[a], lo[a])
        seme_hi[a] = max(seme_hi[a], hi[a])

if seme_lo[0] > seme_hi[0]:
    raise SystemExit('LATO=%s: nessun pezzo col materiale del meccanismo da quel lato.' % LATO)


def dentro(lo, hi):
    return all(seme_lo[a] <= (lo[a] + hi[a]) / 2 <= seme_hi[a] for a in range(3))


tenuti = 0
fuori_volume = 0
sconosciuti = set()
vertici_tenuti = 0
minimo = Vector((1e9, 1e9, 1e9))
massimo = Vector((-1e9, -1e9, -1e9))
ospiti = []

for k, (q, (vs, lo, hi)) in enumerate(zip(pezzi, misure)):
    if not dentro(lo, hi):
        fuori_volume += 1
        continue
    nome = q.get('nome') or ''
    if nome not in MAT:
        sconosciuti.add(nome or '(pezzo senza materiale)')
        continue
    if nome in OSPITE:
        ospiti.append(nome)
    idx = q['idx']
    n = len(vs)
    fs = [(idx[i], idx[i + 1], idx[i + 2]) for i in range(0, len(idx), 3)] if idx         else [(i, i + 1, i + 2) for i in range(0, n, 3)]
    me = bpy.data.meshes.new('p%d' % k)
    me.from_pydata([tuple(v) for v in vs], [], fs)
    me.update()
    if TAGLIO and nome in OSPITE:
        bm = bmesh.new()
        bm.from_mesh(me)
        bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:],
                               plane_co=TAGLIO[0], plane_no=TAGLIO[1],
                               clear_outer=True)
        bm.to_mesh(me)
        bm.free()
        me.update()
        if not len(me.vertices):
            fuori_volume += 1
            continue
        lo = Vector((1e9, 1e9, 1e9))
        hi = Vector((-1e9, -1e9, -1e9))
        for v in me.vertices:
            for a in range(3):
                lo[a] = min(lo[a], v.co[a])
                hi[a] = max(hi[a], v.co[a])
    ob = bpy.data.objects.new('p%d' % k, me)
    bpy.context.collection.objects.link(ob)
    ob.data.materials.append(MAT[nome])
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.shade_smooth()
    # LO SMUSSO E' LA META' DEL FOTOREALISMO: uno spigolo matematicamente netto
    # non esiste, e un millimetro che raccoglie una luce e' cio' che si legge
    # come pezzo lavorato.
    mo = ob.modifiers.new('smusso', 'BEVEL')
    mo.width = 0.004
    mo.segments = 2
    mo.limit_method = 'ANGLE'
    mo.angle_limit = math.radians(35)
    for a in range(3):
        minimo[a] = min(minimo[a], lo[a])
        massimo[a] = max(massimo[a], hi[a])
    tenuti += 1
    vertici_tenuti += n

if sconosciuti:
    print('MATERIALI SCONOSCIUTI DENTRO IL VOLUME: ' + ', '.join(sorted(sconosciuti)))
    print('Non li salto: un render incompleto che sembra completo e peggio di')
    print('nessun render. Aggiungili a MAT in questo file.')
    raise SystemExit(2)
if not tenuti:
    raise SystemExit('nessun pezzo tenuto: i nomi dei materiali sono cambiati?')

centro = (minimo + massimo) / 2
misura = max(massimo[a] - minimo[a] for a in range(3))
print('LATO %s - %d pezzi dentro il volume, %d fuori' % (LATO, tenuti, fuori_volume))
print('OSPITI (materiale della nave, ma dentro il meccanismo): %s'
      % (', '.join(sorted(set(ospiti))) if ospiti else 'nessuno'))
print('PEZZI %d di %d - ingombro %.2f - centro %.2f %.2f %.2f'
      % (tenuti, len(pezzi), misura, centro[0], centro[1], centro[2]))
print('MATERIA  %d pezzi tenuti (%d vertici)' % (tenuti, vertici_tenuti))


def softbox(pos, rot, energia, misura_luce, y):
    bpy.ops.object.light_add(type='AREA', location=pos)
    o = bpy.context.object
    o.data.shape = 'RECTANGLE'; o.data.size = misura_luce; o.data.size_y = misura_luce * y
    o.data.energy = energia; o.rotation_euler = rot


# --- QUANTO PESANO I SOFTBOX RISPETTO ALL'AMBIENTE
#
# Erano tarati quando il mondo era un gradiente spento e dovevano fare tutta la
# luce. Con un HDRI di officina vero l'ambiente illumina gia', e i softbox si
# SOMMANO: il fasciame, che ha colore base 0,10 -- blu quasi nero -- usciva
# bianco. Un materiale scuro che rende chiaro non e' un problema di materiale.
# Il valore giusto si sceglie misurando, non a occhio: LUCE lo fa variare.
LUCE = float(os.environ.get('LUCE', '1.0'))

"""
--- L'ESPOSIZIONE, SCELTA COL CRITERIO DEI FOTOGRAFI E NON A OCCHIO

La scena non era mai stata esposta. Con l'HDRI dell'officina -- finestre vere,
molto luminose -- il fotogramma bruciava, e a occhio avevo concluso che
"i materiali rendono bianchi". Misurando, la conclusione era sbagliata:

    esposizione   fasciame(0,10)   carter(0,30)   pavimento(0,055)   bruciato
         0            177,5            134,9           112,0          0,44%
        -1,0          145,5             97,6            77,3          0,03%
        -2,0          107,7             66,3            51,1          0,00%
        -3,5           60,2             34,3            25,0          0,00%

Il carter ha albedo 0,30 e rende PIU' SCURO del fasciame che ha 0,10. Se fosse
un errore di materiale l'ordine sarebbe rispettato; non lo e' perche' il
fasciame e' una lamiera larga rivolta all'officina e il carter sta nella sua
ombra. **Geometria, non materiale** -- e quindi nei materiali non c'era niente
da correggere.

Il criterio scelto e' quello che usa chi fotografa: *esporre a destra* -- la
massima esposizione che tiene il bruciato sotto lo 0,1%. Da' **-1,0**. E' una
regola che si puo' rieseguire, non un numero che mi piaceva.
"""
sc.view_settings.exposure = float(os.environ.get('ESPOSIZIONE', '-1.0'))

d = misura
softbox((centro[0] + d, centro[1] - d * 1.4, centro[2] + d * 1.1),
        (math.radians(48), 0, math.radians(30)), 120 * d * d * LUCE, d * 1.6, 0.28)
softbox((centro[0] - d * 1.3, centro[1] + d, centro[2] + d * 0.5),
        (math.radians(74), 0, math.radians(-126)), 45 * d * d * LUCE, d * 1.4, 0.30)

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
# --- DOVE SI CERCA L'AMBIENTE, E PERCHE' NON BASTA UN POSTO SOLO
#
# Qui c'era un percorso solo: accanto al JSON. Su Colab il JSON e lo script
# stanno tutti e due in /content e coincideva; in locale il JSON sta nella
# radice del repo e l'HDRI in riferimenti/blender/hdri, e NON coincideva.
# Il render ripiegava sul gradiente, lo diceva in una riga di log in mezzo a
# cento, e ho misurato per venti minuti una scena diversa da quella che
# credevo di guardare. Adesso i posti sono tre e si STAMPA quello usato.
_dove = [os.environ.get('AMBIENTE_HDR') or '',
         os.path.join(os.path.dirname(os.path.abspath(__file__)), 'hdri', 'ambiente.hdr'),
         os.path.join(os.path.dirname(os.path.abspath(SORGENTE)), 'hdri', 'ambiente.hdr')]
AMBIENTE = next((x for x in _dove if x and os.path.exists(x)), _dove[1])
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
    print('AMBIENTE officina: ' + AMBIENTE)
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
    print('AMBIENTE gradiente (nessun hdri). Cercato in: ' + ' | '.join(x for x in _dove if x))

# Era `misura * 8` e il BORDO del piano cadeva dentro l'inquadratura: una riga
# orizzontale netta a meta' immagine, che sembrava un orizzonte e non lo era.
# A 60 volte l'ingombro il bordo esce dal campo e il pavimento sfuma nell'HDRI.
# UN PIANO D'APPOGGIO. I pezzi galleggiavano nel nulla: una fotografia di
# macchinario e' sempre DA QUALCHE PARTE, e l'ombra di contatto e' cio' che fa
# appoggiare un oggetto invece di farlo levitare.
bpy.ops.mesh.primitive_plane_add(size=misura * 60, location=(centro[0], centro[1], minimo[2] - 0.02))
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
# I CAMPIONI SI ABBASSANO QUANDO SI MISURA, NON QUANDO SI CONSEGNA. Per
# scegliere un'esposizione basta la luminanza media di una toppa, e quella e'
# stabile molto prima che l'immagine sia pulita: 24 campioni bastano e costano
# un sesto. Il fotogramma buono si cuoce a 140.
sc.cycles.samples = int(os.environ.get('CAMPIONI', '140'))
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
