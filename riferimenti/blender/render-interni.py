"""
IL PROVINO DELLA SEZIONE VERTICALE — il cancello principale degli interni.

    blender -b -P riferimenti/blender/render-interni.py -- <cartella> [pose]

    cartella   dove stanno `interni.json` e `interni.glb`, e dove escono i PNG
    pose       elenco separato da virgole; senza, le fa tutte

    MODELLI=<dir>   dove cercare i GLB delle macchine (predefinito: public/modelli)
    CAMPIONI=<n>    campioni Cycles (predefinito 48)
    PRETENDI_GPU=1  esce con errore se OPTIX non c'e', invece di rendere in CPU

`docs/13` §5 chiude il finale con la SEZIONE VERTICALE COMPLETA: la camera
guarda la nave di traverso e il piano `Plane(1,0,0)` toglie la meta' di dritta.
E' l'unica posa dell'atto due in cui la camera si muove davvero, ed e' quella in
cui gli interni o si leggono o non servono a niente.

Quindi qui non si renderizza per far vedere che il modello esiste: si
renderizza per GUARDARE se dentro si legge qualcosa. Se non si legge, il
risultato di questo lavoro e' che non si legge, e va detto con l'immagine in
mano invece che stimato.

─── LO SCAFO E LE MACCHINE CI SONO, E NON SONO DECORAZIONE

Senza il guscio gli interni fluttuano nel vuoto e sembrano leggibili anche
quando non lo sono; senza le macchine il provino misura meta' della domanda, e
la meta' facile — vuoti che si leggono benissimo perche' non c'e' niente
dentro. Il cancello e' «ponti sovrapposti, macchine sotto, un taglio solo»:
tutte e tre le cose, o non e' quel cancello.

Il guscio nasce dagli STESSI contorni di `interni.json`; le macchine dai GLB
gia' spediti, collocate con le coordinate del sito che `esporta-interni.mjs` ha
letto dai sorgenti e messo nel JSON.

─── QUESTO SCRIPT NON LEGGE `src/`, ED E' DELIBERATO

Gira anche su una macchina remota, dove `src/` non c'e'. Se leggesse i sorgenti
del sito, la' non troverebbe niente e collocherebbe le macchine all'origine: un
provino plausibile e sbagliato, cioe' il difetto peggiore che un provino possa
avere. Tutto quello che serve sta in `interni.json`, prodotto dove i sorgenti
ci sono.

─── LA CAMERA NON BECCHEGGIA

E' l'invariante del sito (D56): una camera livellata proietta il piano
dell'acqua sulla mezzeria del fotogramma da qualunque altezza. Guardare gli
interni «per bene» inclinando in giu' darebbe un provino piu' bello e una
misura falsa, perche' non e' un'inquadratura che il sito puo' produrre.
"""
import bpy, json, math, os, sys, time

argv = sys.argv[sys.argv.index('--') + 1:]
FUORI = argv[0]
QUALI = argv[1].split(',') if len(argv) > 1 else None
MODELLI = os.environ.get('MODELLI') or os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'modelli'))

with open(os.path.join(FUORI, 'interni.json'), encoding='utf-8') as f:
    D = json.load(f)
M = D['metriPerUnita']
PUNTI = D['punti']
PROVINO = D['provino']

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.unit_settings.system = 'METRIC'


def B(x, y, z):
    return (x * M, -z * M, y * M)


# ═══ IL GUSCIO DI BABORDO, dagli stessi contorni ══════════════════════════
verts, faces = [], []
n_pt = len(PUNTI[0]['contorno'])
for p in PUNTI:
    for (x, y) in p['contorno']:
        verts.append(B(x, y, p['z']))
for i in range(len(PUNTI) - 1):
    a = i * n_pt
    b = (i + 1) * n_pt
    for k in range(n_pt - 1):
        faces.append([a + k, a + k + 1, b + k + 1, b + k])
me = bpy.data.meshes.new('guscio')
me.from_pydata(verts, [], faces)
me.validate()
guscio = bpy.data.objects.new('guscio', me)
bpy.context.collection.objects.link(guscio)
sol = guscio.modifiers.new('sp', 'SOLIDIFY')
sol.thickness = 0.045
sol.offset = 0.0

m = bpy.data.materials.new('scafo')
m.use_nodes = True
b = m.node_tree.nodes['Principled BSDF']
b.inputs['Base Color'].default_value = (0.055, 0.058, 0.062, 1)
b.inputs['Roughness'].default_value = 0.42
guscio.data.materials.append(m)

# ═══ GLI INTERNI ══════════════════════════════════════════════════════════
glb = os.path.join(FUORI, 'interni.glb')
if not os.path.isfile(glb):
    raise SystemExit('manca %s: costruiscilo prima con glb-interni.py' % glb)
bpy.ops.import_scene.gltf(filepath=glb)

# ═══ LE MACCHINE ══════════════════════════════════════════════════════════
#
# I GLB sono in metri e il sito li scala di 0,4 in unita' di scena; qui la scena
# E' in metri, quindi non si scala niente e si traduce solo la posizione con la
# stessa `B()` di tutto il resto. Scalarli sarebbe l'errore da fattore 6,25.
#
# `giro` e' il mezzo giro che `index.js` da' all'unita' di babordo. In three e'
# `rotation.y = PI`, cioe' attorno all'asse alto: qui l'asse alto e' Z, quindi si
# somma a `rotation_euler[2]` DOPO la conversione Y-alto -> Z-alto che
# l'importatore ha gia' messo sulla radice.
for mac in PROVINO['macchine']:
    percorso = os.path.join(MODELLI, mac['file'])
    if not os.path.isfile(percorso):
        print('ATTENZIONE  manca %s: non entra nel provino, e il provino lo dice '
              'invece di fingere' % percorso)
        continue
    prima = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=percorso)
    radici = [o for o in bpy.data.objects if o not in prima and o.parent is None]
    sx, sy, sz = mac['posizione']
    for o in radici:
        o.location = B(sx, sy, sz)
        if mac['giro']:
            o.rotation_euler = (o.rotation_euler[0], o.rotation_euler[1],
                                o.rotation_euler[2] + math.pi)
    print('MACCHINA   %-18s a (%.2f, %.2f, %.2f) unita di scena' % (mac['file'], sx, sy, sz))

# ═══ LUCE ═════════════════════════════════════════════════════════════════
#
# Poca e dichiarata: qui non si tara nessun materiale. Serve a far LEGGERE la
# forma -- una direzionale che entra dal taglio, piu' un ambiente tenue perche'
# dentro una carena chiusa il solo sole lascerebbe nero tutto cio' che sta oltre
# la prima paratia, e il provino direbbe «non si legge» misurando la luce invece
# della geometria.
mondo = bpy.data.worlds.new('w')
mondo.use_nodes = True
mondo.node_tree.nodes['Background'].inputs['Color'].default_value = (0.30, 0.33, 0.37, 1)
mondo.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.55
sc.world = mondo

bpy.ops.object.light_add(type='SUN', location=(40, -10, 25))
sole = bpy.context.object
sole.data.energy = 3.2
sole.rotation_euler = (math.radians(58), 0, math.radians(-28))

bpy.ops.object.light_add(type='AREA', location=(14, 0, 2))
riemp = bpy.context.object
riemp.data.energy = 3000
riemp.data.size = 18
riemp.rotation_euler = (math.radians(90), 0, math.radians(90))

# ═══ LE POSE ══════════════════════════════════════════════════════════════
OCCHIO = {q['id']: q['occhio'] for q in D['quote']}
Z_STAZIONE = {s['id']: s['z'] for s in D['stazioni']}
R_INTERO = PROVINO['raggio']
R_SEZIONE = PROVINO['raggioSezione']

POSE = [
    # nome, raggio (unita' di scena), quota della camera, z del bersaglio
    ('sezione-intera', R_INTERO, 0.20, 0.0),
    ('sezione-vicina', R_SEZIONE, OCCHIO['macchine'], 0.0),
    ('cella-macchine-centro', R_SEZIONE, OCCHIO['macchine'], Z_STAZIONE['centro']),
    ('cella-macchine-poppa', R_SEZIONE, OCCHIO['macchine'], Z_STAZIONE['poppa']),
    ('cella-sentina-centro', R_SEZIONE, OCCHIO['sentina'], Z_STAZIONE['centro']),
    ('cella-allestimento-avanti', R_SEZIONE, OCCHIO['allestimento'], Z_STAZIONE['avanti']),
]
if QUALI:
    nomi = {p[0] for p in POSE}
    ignote = [q for q in QUALI if q not in nomi]
    if ignote:
        raise SystemExit('pose che non esistono: %s. Ci sono: %s.'
                         % (', '.join(ignote), ', '.join(sorted(nomi))))
    POSE = [p for p in POSE if p[0] in QUALI]

bpy.ops.object.camera_add()
cam = bpy.context.object
cam.data.lens_unit = 'FOV'
# il `fov` di three e' VERTICALE: `angle_x` darebbe un'inquadratura piu' larga di
# quella del sito, e la differenza si leggerebbe come «ci sta di piu'»
cam.data.angle_y = math.radians(PROVINO['fovVerticaleGradi'])
sc.camera = cam

sc.render.engine = 'CYCLES'
sc.cycles.samples = int(os.environ.get('CAMPIONI', '48'))
sc.cycles.use_denoising = True
sc.render.resolution_x = 1600
sc.render.resolution_y = 900
sc.render.film_transparent = False
sc.view_settings.view_transform = 'AgX'      # come il sito: AgXToneMapping


# ═══ LA GPU, E IL MODO IN CUI LA SUA ASSENZA NON DA' ERRORE ═══════════════
#
# Su una macchina senza OPTIX, `cycles.device = 'GPU'` **non solleva niente**:
# Cycles ripiega su CPU in silenzio e consegna il file dopo ore. Un try/except
# li' non e' un except troppo largo, e' un except INUTILE -- non c'e' nessuna
# eccezione da prendere, e il guasto non passa mai di li'. L'unico modo di
# accorgersene e' ENUMERARE i dispositivi e guardare cosa c'e'.
#
# Anche l'ORDINE conta: `get_devices()` prima di `compute_device_type` enumera
# col backend vecchio e non trova OPTIX nemmeno dove c'e'.
#
# `PRETENDI_GPU=1` e' la strada remota: la' una CPU silenziosa e' una VM bruciata
# per niente, quindi si esce con errore. In locale la CPU e' la strada normale, e
# si stampa che lo e' -- il tempo per posa lo dice comunque la riga POSA.
def accendi_gpu():
    add = bpy.context.preferences.addons.get('cycles')
    if add is None:
        return []
    pr = add.preferences
    pr.compute_device_type = 'OPTIX'          # prima il backend
    pr.get_devices()                          # poi l'enumerazione
    optix = [d for d in pr.devices if d.type == 'OPTIX']
    if not optix:
        return [(d.name, d.type) for d in pr.devices]
    for d in pr.devices:
        d.use = (d.type == 'OPTIX')           # solo GPU: la CPU accesa rallenta
    sc.cycles.device = 'GPU'
    print('OPTIX su: %s' % [d.name for d in optix])
    return True


esito = accendi_gpu()
if esito is not True:
    if os.environ.get('PRETENDI_GPU') == '1':
        raise SystemExit('OPTIX assente: Cycles ripiegherebbe su CPU senza dirlo. '
                         'Device visti: %s' % esito)
    sc.cycles.device = 'CPU'
    print('CPU: nessun dispositivo OPTIX (%s). In locale e\' la strada normale, ed '
          'e\' detto invece che scoperto dal tempo.' % esito)

for (nome, raggio, quota, zt) in POSE:
    # di traverso da DRITTA: e' da li' che si guarda dentro il taglio, perche' il
    # piano di sezione toglie proprio la meta' che sta fra la camera e gli interni
    cam.location = (raggio * M, -zt * M, quota * M)
    # beccheggio zero: si guarda orizzontalmente, alla propria quota
    cam.rotation_euler = (math.radians(90), 0, math.radians(90))
    f = os.path.join(FUORI, 'provino-interni-%s.png' % nome)
    sc.render.filepath = f
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    print('POSA %-26s raggio %.1f unita (%.1f m), quota %+.3f, z %+.2f - %.0f s  [%s]'
          % (nome, raggio, raggio * M, quota, zt, time.time() - t0, sc.cycles.device))
