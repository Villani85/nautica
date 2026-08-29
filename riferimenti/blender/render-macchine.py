"""
IL PROVINO DELLE DUE MACCHINE — si rende IL FILE CHE SI SPEDISCE.

    blender -b -P render-macchine.py -- <glb> <uscita.png> [campioni] [larghezza]

Serve a una cosa sola: poter dire quanto sono lontane dal fotorealismo con una
PROVA invece che con un'impressione. Per questo importa il GLB gia' esportato e
non ricostruisce la scena dal codice: se il giudizio si desse su una versione
vestita meglio, non riguarderebbe il file che finisce nel sito.

─── QUELLO CHE QUESTO PROVINO SA E NON SA DIRE

SA dire se la FORMA e i MATERIALI reggono la luce: se gli smussi raccolgono un
filo di luce, se il bronzo si distingue dall'acciaio, se la vernice sembra
verniciata. Sono le tre cose che il GLB porta con se'.

NON sa dire come apparira' nel sito. Il sito rende in WebGL con l'ambiente e
l'occlusione suoi, e ha meno strumenti di Cycles. Un provino bello qui e brutto
li' e' possibile — nell'altra direzione molto meno.

─── LA LUCE, CHE E' LA META' DEL LAVORO

`riferimenti/blender/LEGGIMI.md` ha gia' pagato la lezione, ed e' contro
intuitiva: **e' il riflesso con un BORDO a leggersi come metallo.** Un mondo
uniforme non rende un pezzo lucido, gli da' una tinta. Quindi non un HDRI e
basta: strisce softbox LUNGHE, che sulla superficie disegnano una banda chiara
con due bordi netti, e sono i bordi a raccontare la curvatura.

L'HDRI resta, ma smorzato — la nota di `sistema.py` dice 0,30 — perche' dentro
una carena non entra la luce di un capannone: serve per i RIFLESSI, non per
illuminare. L'illuminazione la danno una plafoniera fredda in alto e un
rimbalzo caldo dal basso, che e' com'e' fatto davvero un locale macchine.

─── UNA COSA MISURATA SU QUESTA MACCHINA, E VA DETTA

Cycles qui gira su CPU. Nel log di Blender si legge
`CUEW initialization failed: Error opening the library` e altrettanto per HIP:
le librerie CUDA e HIP non si caricano, quindi `compute_device_type = 'OPTIX'`
si imposta senza errore ma `prefs.devices` resta VUOTO di schede. E' il caso
peggiore: `cycles.device = 'GPU'` non solleva niente e si rende in CPU
credendo di essere in GPU. Lo script lo STAMPA a ogni esecuzione invece di
assumerlo, e i campioni sono tarati di conseguenza.
"""
import bpy, sys, os, math
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
GLB = argv[0]
USCITA = argv[1]
CAMPIONI = int(argv[2]) if len(argv) > 2 else 220
LARG = int(argv[3]) if len(argv) > 3 else 1280
# I nodi da NON rendere: il sito nasconde il fasciame del modello perche' lo
# scafo vero ce l'ha gia' (`src/scena/impianto.js` fa lo stesso con
# STATIC_HULL_PLATE). Nel provino va tolto per la stessa ragione, e perche'
# altrimenti e' una lastra chiara che occupa mezza inquadratura.
NASCONDI = [x for x in (argv[4].split(',') if len(argv) > 4 else []) if x]

QUI = os.path.dirname(os.path.abspath(__file__))
HDRI = os.path.join(QUI, 'hdri', 'ambiente.hdr')

# ─── NIENTE `read_factory_settings` QUI, E LA RAGIONE E' COSTATA UNA SESSIONE
#
# SINTOMO: pilotando Blender via MCP, la prima chiamata dopo un
# `bpy.ops.wm.read_factory_settings()` funziona, tutte le successive tornano
# «Not connected to Blender».
# CAUSA: quella chiamata ri-registra gli addon e azzera la scena. L'addon
# BlenderMCP legge `bpy.context.scene.blendermcp_use_polyhaven` all'inizio di
# OGNI comando; sulla scena nuova quella proprieta' non c'e' piu', il gestore
# solleva AttributeError, e il thread del server muore.
# COME L'HO ISOLATA: nel log di Blender — l'unico posto dove si vede — c'era
# `AttributeError: 'Scene' object has no attribute 'blendermcp_use_polyhaven'`
# subito prima di «Server thread stopped».
# In esecuzione headless il difetto non si presenta, ma la riga resta scritta:
# questo file si copia-incolla dentro una sessione MCP prima o poi.
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)

sc = bpy.context.scene
sc.unit_settings.system = 'METRIC'
bpy.ops.import_scene.gltf(filepath=GLB)

mesh = [o for o in bpy.data.objects if o.type == 'MESH']
if not mesh:
    raise SystemExit('ERRORE: %s non ha portato dentro nessuna mesh' % GLB)

# ─── SI MISURA, POI SI INQUADRA ──────────────────────────────────────────
# Piazzare la camera a occhio e' esattamente cio' che §12 vieta: la distanza
# giusta dipende dall'ingombro, e l'ingombro si legge, non si stima.
for n in NASCONDI:
    tolti = [o for o in bpy.data.objects if o.name == n or o.name == n + '_MESH']
    for o in tolti:
        for f in list(o.children):
            f.hide_render = True
            f.hide_viewport = True
        o.hide_render = True
        o.hide_viewport = True
    print('NASCOSTO  %s (%d oggetti)' % (n, len(tolti)))
mesh = [o for o in mesh if not o.hide_render]
if not mesh:
    raise SystemExit('ERRORE: nascosto tutto, non resta niente da rendere')

bpy.context.view_layer.update()
mn = Vector((1e9, 1e9, 1e9))
mx = Vector((-1e9, -1e9, -1e9))
tri = 0
for o in mesh:
    tri += len(o.data.polygons)
    for v in o.bound_box:
        p = o.matrix_world @ Vector(v)
        mn = Vector((min(mn[i], p[i]) for i in range(3)))
        mx = Vector((max(mx[i], p[i]) for i in range(3)))
# Il conto per oggetto: guardando un provino non si riconosce sempre COSA sia
# un pezzo, e tirare a indovinare porta a correggere la cosa sbagliata. Con
# nome, ingombro e posizione stampati, un volume che sorprende ha un indirizzo.
for o in sorted(mesh, key=lambda x: x.name):
    b = [o.matrix_world @ Vector(v) for v in o.bound_box]
    a = Vector((min(p[i] for p in b) for i in range(3)))
    z = Vector((max(p[i] for p in b) for i in range(3)))
    print('  PEZZO %-22s %5.2f x %5.2f x %5.2f m   centro (%6.2f,%6.2f,%6.2f)'
          % (o.name, z.x - a.x, z.y - a.y, z.z - a.z,
             (a.x + z.x) / 2, (a.y + z.y) / 2, (a.z + z.z) / 2))

centro = (mn + mx) / 2
dim = mx - mn
D = max(dim)
print('INGOMBRO  %.2f x %.2f x %.2f m, centro (%.2f, %.2f, %.2f), %d triangoli'
      % (dim.x, dim.y, dim.z, centro.x, centro.y, centro.z, tri))

# ─── IL PAGLIOLO ─────────────────────────────────────────────────────────
# Senza un piano d'appoggio si e' in un vuoto, non in un locale macchine, e
# soprattutto manca il CONTATTO A TERRA: l'ombra di contatto e' cio' che dice
# a chi guarda che l'oggetto poggia invece di galleggiare.
bpy.ops.mesh.primitive_plane_add(size=D * 6, location=(centro.x, centro.y, mn.z - 0.02))
pav = bpy.context.object
mp = bpy.data.materials.new('pagliolo')
mp.use_nodes = True
bp = mp.node_tree.nodes['Principled BSDF']
bp.inputs['Base Color'].default_value = (0.045, 0.048, 0.052, 1)
bp.inputs['Roughness'].default_value = 0.42
bp.inputs['Metallic'].default_value = 0.0
pav.data.materials.append(mp)

# ─── IL MONDO: HDRI SMORZATO, PER I RIFLESSI ─────────────────────────────
sc.world = bpy.data.worlds.new('mondo')
sc.world.use_nodes = True
nt = sc.world.node_tree
sfondo = nt.nodes['Background']
if os.path.isfile(HDRI):
    tex = nt.nodes.new('ShaderNodeTexEnvironment')
    tex.image = bpy.data.images.load(HDRI, check_existing=True)
    nt.links.new(tex.outputs['Color'], sfondo.inputs['Color'])
    sfondo.inputs['Strength'].default_value = 0.30
    print('MONDO     ambiente.hdr a 0,30 — serve per i riflessi, non per illuminare')
else:
    sfondo.inputs['Color'].default_value = (0.035, 0.038, 0.042, 1)
    sfondo.inputs['Strength'].default_value = 1.0
    print('MONDO     HDRI ASSENTE in %s: si rende con un grigio, e i metalli ' % HDRI)
    print('          ne risentiranno. Non e\' il risultato buono.')


def luce(nome, tipo, pos, verso, watt, dim_x, dim_y, colore=(1, 1, 1)):
    """Luci in WATT e con dimensione reale: e' l'unico modo perche' la caduta
    con la distanza e la morbidezza dell'ombra si comportino da vere. La
    dimensione della sorgente e' cio' che decide il bordo dell'ombra, e su un
    modello in metri si puo' scegliere in metri."""
    d = bpy.data.lights.new(nome, 'AREA')
    d.energy = watt
    d.color = colore
    d.shape = 'RECTANGLE'
    d.size = dim_x
    d.size_y = dim_y
    o = bpy.data.objects.new(nome, d)
    bpy.context.collection.objects.link(o)
    o.location = pos
    dz = (Vector(verso) - Vector(pos)).normalized()
    o.rotation_euler = dz.to_track_quat('-Z', 'Y').to_euler()
    # ─── UNA LUCE D'AREA E' VISIBILE ALLA CAMERA, PER DIFETTO ────────────
    #
    # SINTOMO: nel primo provino una lastra bianca piatta occupava mezza
    # inquadratura davanti alla macchina, senza spessore e senza ombra.
    # CAUSA: in Cycles una luce d'area ha la visibilita' ai raggi di CAMERA
    # accesa per difetto. Una softbox da 4 x 2 m messa dietro il soggetto e'
    # letteralmente un pannello bianco IN SCENA, e piu' la si fa lunga per
    # avere il riflesso col bordo — che e' tutto il punto — piu' e' grossa.
    # COME L'HO ISOLATA: stampando l'ingombro di ogni MESH e non trovando
    # nessun pezzo di quelle proporzioni. Il volume che non e' nell'elenco
    # delle mesh non e' una mesh.
    o.visible_camera = False
    return o


# ─── I WATT VANNO IN SCALA COL SOGGETTO ──────────────────────────────────
#
# SINTOMO: isolando un pezzo solo per identificarlo, il provino usciva bianco
# bruciato, tutti i dettagli persi.
# CAUSA: le luci sono piazzate a una frazione di D — cioe' piu' il soggetto e'
# piccolo, piu' sono vicine — ma i watt erano costanti. L'illuminamento va con
# l'inverso del quadrato della distanza: passando da 7,74 m a 1,88 di
# ingombro, la stessa lampada illumina 17 volte di piu'.
# COME L'HO ISOLATA: il pezzo isolato e quello in assieme sono lo STESSO file
# con la stessa luce. Se cambia solo l'esposizione, la variabile e' la
# geometria della posa, non il materiale.
POTENZA = (D / 6.0) ** 2

# LE STRISCE. Lunghe quanto la macchina e strette: e' la forma del riflesso a
# raccontare la superficie, e un pannello quadrato non racconta niente.
luce('striscia_alta', 'AREA', (centro.x - D * 0.45, centro.y - D * 0.30, mx.z + D * 0.55),
     centro, 900 * POTENZA, D * 1.30, 0.28)
luce('striscia_bassa', 'AREA', (centro.x + D * 0.55, centro.y - D * 0.18, centro.z - dim.z * 0.10),
     centro, 420 * POTENZA, D * 1.10, 0.22)
# La plafoniera fredda, che e' l'illuminazione vera di un locale macchine.
luce('plafoniera', 'AREA', (centro.x, centro.y + D * 0.20, mx.z + D * 0.45),
     centro, 700 * POTENZA, D * 0.55, D * 0.30, colore=(0.86, 0.92, 1.0))
# Il rimbalzo caldo dal basso: un pagliolo verniciato lo restituisce, e senza
# di lui il sottopancia dei pezzi diventa nero morto.
luce('rimbalzo', 'AREA', (centro.x + D * 0.30, centro.y + D * 0.42, mn.z + dim.z * 0.18),
     centro, 260 * POTENZA, D * 0.70, D * 0.25, colore=(1.0, 0.74, 0.48))

# ─── CAMERA: LA DISTANZA SI CALCOLA, NON SI SCEGLIE ──────────────────────
#
# SINTOMO: il primo provino tagliava l'elica in basso a sinistra e il motore a
# destra, e i pezzi in mezzo erano schiacciati l'uno sull'altro al punto che
# non si riconoscevano — guardandolo ho passato tre render a cercare di capire
# quale fosse un volume che non tornava.
# CAUSA: la distanza era `D * 1.55`, una costante, con una lente da 85 mm. Su
# un sensore da 36 mm quella lente inquadra 36/85 della distanza, cioe' 5,1 m
# a dodici metri: meno dei 7,74 della macchina. Il numero non c'entrava con la
# lente, quindi non poteva essere giusto se non per caso.
# COME L'HO ISOLATA: facendo il conto al contrario. Se l'inquadratura e' larga
# 5,1 m e il soggetto 7,74, il taglio non e' un'impressione: e' aritmetica.
#
# Adesso si proiettano gli otto vertici dell'ingombro sui due assi della
# camera e si ricava la distanza che li fa STARE DENTRO, su entrambi. Vale per
# qualunque soggetto e qualunque lente, e se domani la macchina si allunga
# l'inquadratura la segue da sola.
LENTE = float(os.environ.get('LENTE', 50.0))
SENSORE = 36.0
MARGINE = 1.12

cam_d = bpy.data.cameras.new('cam')
cam_d.lens = LENTE
cam_d.sensor_width = SENSORE
cam_d.sensor_fit = 'HORIZONTAL'
cam = bpy.data.objects.new('cam', cam_d)
bpy.context.collection.objects.link(cam)
sc.camera = cam

az = math.radians(float(os.environ.get('AZIMUT', 56.0)))
el = math.radians(float(os.environ.get('ELEVAZIONE', 19.0)))
verso = Vector((-math.cos(el) * math.sin(az), math.cos(el) * math.cos(az), -math.sin(el)))
destra = verso.cross(Vector((0, 0, 1)))
destra.normalize()
su = destra.cross(verso)
su.normalize()

aspetto = 16 / 9
mezzo_h = SENSORE / 2 / LENTE                    # tangente del mezzo campo
mezzo_v = mezzo_h / aspetto
semi_h = semi_v = 0.0
for k in range(8):
    ang = Vector((mx.x if k & 1 else mn.x,
                  mx.y if k & 2 else mn.y,
                  mx.z if k & 4 else mn.z)) - centro
    semi_h = max(semi_h, abs(ang.dot(destra)))
    semi_v = max(semi_v, abs(ang.dot(su)))
dist = max(semi_h / mezzo_h, semi_v / mezzo_v) * MARGINE
cam.location = centro - verso * dist
cam.rotation_euler = verso.to_track_quat('-Z', 'Y').to_euler()
cam_d.dof.use_dof = True
cam_d.dof.focus_distance = dist
cam_d.dof.aperture_fstop = 6.3
print('CAMERA    %.0f mm, azimut %.0f, elevazione %.0f, distanza %.2f m '
      '(semiassi proiettati %.2f x %.2f m)'
      % (LENTE, math.degrees(az), math.degrees(el), dist, semi_h, semi_v))

# ─── RENDER ──────────────────────────────────────────────────────────────
sc.render.engine = 'CYCLES'
prefs = bpy.context.preferences.addons['cycles'].preferences
try:
    prefs.compute_device_type = 'OPTIX'
except Exception:
    pass
prefs.get_devices()
schede = [d.name for d in prefs.devices if d.type != 'CPU']
for d in prefs.devices:
    d.use = (d.type != 'CPU')
sc.cycles.device = 'GPU' if schede else 'CPU'
# NON si dichiara la GPU: si stampa cosa si e' trovato. `cycles.device = 'GPU'`
# senza schede non solleva niente e rende in CPU in silenzio.
print('CALCOLO   %s  (schede trovate: %s)'
      % (sc.cycles.device, ', '.join(schede) if schede else 'NESSUNA'))

sc.cycles.samples = CAMPIONI
sc.cycles.use_adaptive_sampling = True
sc.cycles.adaptive_threshold = 0.01
sc.cycles.max_bounces = 12
sc.cycles.diffuse_bounces = 4
sc.cycles.glossy_bounces = 8        # il metallo vive dei rimbalzi speculari
sc.cycles.transmission_bounces = 8
sc.cycles.transparent_max_bounces = 8
sc.cycles.sample_clamp_indirect = 10.0
sc.cycles.use_denoising = True
sc.cycles.denoiser = 'OPENIMAGEDENOISE'
try:
    sc.cycles.denoising_prefilter = 'ACCURATE'
except Exception:
    pass

sc.render.resolution_x = LARG
sc.render.resolution_y = int(LARG * 9 / 16)
sc.render.resolution_percentage = 100
sc.render.film_transparent = False
sc.render.filepath = USCITA
sc.render.image_settings.file_format = 'PNG'

# AgX, non Standard: e' la trasformazione che tiene i bianchi delle luci
# invece di bruciarli, ed e' meta' della differenza fra «render» e «foto».
try:
    sc.view_settings.view_transform = 'AgX'
except Exception:
    sc.view_settings.view_transform = 'Filmic'
sc.view_settings.look = 'None'
sc.view_settings.exposure = 0.0

# ─── COMPOSITING: SOLO IL BAGLIORE, E SOTTILE ────────────────────────────
#
# SINTOMO: `AttributeError: 'Scene' object has no attribute 'node_tree'` su
# Blender 5.2, subito dopo aver acceso `sc.use_nodes`.
# CAUSA: in Blender 5 il compositore non e' piu' appeso alla scena come
# `Scene.node_tree`: e' un gruppo di nodi a se', `Scene.compositing_node_group`.
# Il vecchio `use_nodes` esiste ancora e non da' errore — avvisa solo che
# sparira' in 6.0 — quindi la riga che rompe e' quella DOPO.
# COME L'HO ISOLATA: il traceback la nomina, ma la cosa che vale e' che il
# render andava fatto lo stesso: il bagliore e' una rifinitura, non il
# soggetto. Se l'API non c'e', si stampa e si va avanti — un provino in meno
# non vale una prova non fatta.
def compositing():
    try:
        gruppo = bpy.data.node_groups.new('composito', 'CompositorNodeTree')
        sc.compositing_node_group = gruppo
        cnt = gruppo
    except Exception as e:
        print('COMPOSITO  saltato (%s: %s). Il render esce senza bagliore.'
              % (type(e).__name__, e))
        return
    for n in list(cnt.nodes):
        cnt.nodes.remove(n)
    try:
        rl = cnt.nodes.new('NodeGroupInput')
        gl = cnt.nodes.new('CompositorNodeGlare')
        gl.glare_type = 'FOG_GLOW'
        gl.quality = 'HIGH'
        gl.mix = -0.82
        gl.threshold = 1.0
        out = cnt.nodes.new('NodeGroupOutput')
        cnt.interface.new_socket('Image', in_out='INPUT', socket_type='NodeSocketColor')
        cnt.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
        cnt.links.new(rl.outputs[0], gl.inputs['Image'])
        cnt.links.new(gl.outputs['Image'], out.inputs[0])
        print('COMPOSITO  bagliore FOG_GLOW a -0,82 (sottile)')
    except Exception as e:
        sc.compositing_node_group = None
        print('COMPOSITO  saltato (%s: %s). Il render esce senza bagliore.'
              % (type(e).__name__, e))


compositing()

print('RENDER    %d x %d, %d campioni, AgX, denoise OIDN'
      % (sc.render.resolution_x, sc.render.resolution_y, CAMPIONI))
bpy.ops.render.render(write_still=True)
print('FATTO     %s  (%.0f KB)' % (USCITA, os.path.getsize(USCITA) / 1024))
