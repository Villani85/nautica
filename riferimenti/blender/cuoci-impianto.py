# -*- coding: utf-8 -*-
"""
PASS PBR · passo 2 — LA COTTURA DELL'IMPIANTO, DAVVERO

Le due meta' esistevano gia' e non si erano mai incontrate:
  `uv-impianto.py`  fabbrica l'atlante,
  `cottura.py`      e' il forno, provato su un cubo.
Questo file e' il pezzo che mancava in mezzo, e NON tocca nessuno dei due.

    blender -b -P cuoci-impianto.py -- prepara
    blender -b -P cuoci-impianto.py -- misura   [--normale <png>]
    blender -b -P cuoci-impianto.py -- confronto <cartella-png>

─── PERCHE' NON BASTAVA `impianto-uv.blend`

`uv-impianto.py` applica i modificatori e POI srotola: l'atlante che ha
prodotto sta sulla mesh CON gli smussi. Il suo commento lo dichiara — «i
modificatori vanno applicati prima di srotolare» — ed era giusto finche' la
mesh esportata era quella.

Il passo 2 di `docs/15` capovolge la premessa: adesso quella che viaggia e' la
BASSA, senza smussi, ed e' LEI che deve portare le UV. Un atlante fatto sulla
alta non e' trasferibile alla bassa: gli smussi ci hanno messo in mezzo facce
che sulla bassa non esistono.

Quindi qui l'ordine e' rovesciato: si srotola la BASSA, e la alta si ottiene
duplicandola e applicandole gli smussi. La ricetta UV e' identica a quella di
`uv-impianto.py` (smart_project 66 gradi, area_weight 0 -> average_islands_scale
-> un solo pack CONVEX con margine in FRAZIONE), cosi' i numeri sono
confrontabili con l'atlante gia' misurato.

─── COSA MISURA IN PIU' DI `cottura.py`

`cottura.py` misura la texture INTERA. Su un cubo e' la stessa cosa; su
quattordici pezzi no: un pezzo puo' essere completamente sbagliato e sparire
nella media. Qui la misura si rifa' PER PEZZO, usando la stessa definizione di
macchia e di texel informativo, e la maschera del cotto si ottiene ricuocendo
la normale in un buffer con l'alfa (esattamente come fa `cottura.py` dentro).
Se i totali per pezzo non ricompongono i totali di `cottura.py`, uno dei due
sta misurando male: e' il controllo incrociato.

E misura una cosa che nessuno dei due guardava: le CUCITURE IN PIANO. Una
cucitura su uno spigolo vivo e' gratis, perche' li' la normale e' gia'
discontinua. Una cucitura in mezzo a una superficie liscia — la fiancata di un
cilindro tornito — si vede, perche' spezza in due una rampa continua. Si
riconosce da sola: e' un lato condiviso da due facce quasi complanari le cui UV
non combaciano.
"""
import bpy, sys, os, math, time, json
import numpy as np
from mathutils import Vector

T0 = time.time()
QUI = os.path.dirname(os.path.abspath(__file__))
FUORI = os.path.join(QUI, 'uscite')
BLEND = os.path.join(FUORI, 'impianto-cottura.blend')
PEZZI_JSON = os.path.join(FUORI, 'impianto-pezzi.json')

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
posizionali = [a for a in argv if not a.startswith('--')]
COMANDO = posizionali[0] if posizionali else 'prepara'


def opz(nome, dflt, tipo=float):
    return tipo(argv[argv.index(nome) + 1]) if nome in argv else dflt


ATLANTE = opz('--atlante', 2048, int)
MARGINE_PX = opz('--margine-px', 8.0)
FORMA = opz('--forma', 'CONVEX', str)
RAPPORTO_MAX = opz('--rapporto-max', 10.0)
# Le distanze di ricerca. NON si lasciano derivare dalla diagonale: vedi §B.
ESTRUSIONE = opz('--estrusione', 0.0040)
RAGGIO = opz('--raggio', 0.0080)
SOGLIA_INFO = opz('--soglia-informazione', 8.0)
SOGLIA_MACCHIA = opz('--soglia-macchia', 0.16)
# Un lato e' "in piano" se le due facce che lo condividono stanno entro questo
# angolo: sotto, la superficie continua e una cucitura li' si vede.
ANGOLO_PIANO = opz('--angolo-piano', 20.0)

# Il fasciame e' invisibile nel sito — `impianto.js` lo spegne, e' un doppione
# dello scafo vero — ma nell'atlante c'e' e si prende quasi meta' dei texel.
# Con questa opzione esce, e si misura quanto vale la densita' che libera.
SENZA_FASCIAME = '--senza-fasciame' in argv
if SENZA_FASCIAME:
    BLEND = os.path.join(FUORI, 'impianto-cottura-snello.blend')
    PEZZI_JSON = os.path.join(FUORI, 'impianto-pezzi-snello.json')

NOME_ALTA = 'IMPIANTO_ALTA'
NOME_BASSA = 'IMPIANTO_BASSA'
ATTR_PEZZO = 'pezzo'


def dice(*a):
    print(*a)
    sys.stdout.flush()


# ══════════════════════════════════════════════════════════════════════════
#  §A · la geometria, presa da glb-impianto.py senza modificarlo
# ══════════════════════════════════════════════════════════════════════════
def geometria():
    """Stessa presa di `uv-impianto.py`: si esegue il sorgente FINO al taglio.
    Se la riga di taglio sparisse, ci si ferma invece di srotolare a caso."""
    sorgente_f = os.path.join(QUI, 'glb-impianto.py')
    TAGLIO = "print('COTTURA occlusione ambientale...')"
    src = open(sorgente_f, encoding='utf-8').read()
    if TAGLIO not in src:
        raise SystemExit(
            'ERRORE: in glb-impianto.py non c\'e\' piu\' la riga di taglio %r.' % TAGLIO)
    vecchio = list(sys.argv)
    sys.argv = ['blender', '-b', '-P', sorgente_f, '--', FUORI]
    dice('GEOMETRIA da glb-impianto.py (%d righe su %d)'
         % (src[:src.index(TAGLIO)].count('\n'), src.count('\n')))
    exec(compile(src[:src.index(TAGLIO)], sorgente_f, 'exec'),
         {'__name__': 'geometria_impianto', '__file__': sorgente_f})
    sys.argv = vecchio


# ══════════════════════════════════════════════════════════════════════════
#  §B · misure geometriche
# ══════════════════════════════════════════════════════════════════════════
def area_3d(o):
    M = o.matrix_world
    me = o.data
    tot = 0.0
    for p in me.polygons:
        vs = [M @ me.vertices[i].co for i in p.vertices]
        n = Vector((0.0, 0.0, 0.0))
        for k in range(len(vs)):
            n += vs[k].cross(vs[(k + 1) % len(vs)])
        tot += n.length * 0.5
    return tot


def area_uv(o):
    me = o.data
    uv = me.uv_layers.active.data
    tot = 0.0
    for p in me.polygons:
        ls = p.loop_indices
        n = len(ls)
        s = 0.0
        for k in range(n):
            u1, v1 = uv[ls[k]].uv
            u2, v2 = uv[ls[(k + 1) % n]].uv
            s += u1 * v2 - u2 * v1
        tot += abs(s) * 0.5
    return tot


def conta_isole(o):
    me = o.data
    uv = me.uv_layers.active.data
    padre = {}

    def trova(x):
        r = x
        while padre[r] != r:
            r = padre[r]
        while padre[x] != r:
            padre[x], x = r, padre[x]
        return r

    def unisci(a, b):
        ra, rb = trova(a), trova(b)
        if ra != rb:
            padre[ra] = rb

    per_faccia = []
    for p in me.polygons:
        chiavi = []
        for li in p.loop_indices:
            u, v = uv[li].uv
            k = (me.loops[li].vertex_index, round(u, 5), round(v, 5))
            padre.setdefault(k, k)
            chiavi.append(k)
        for k in chiavi[1:]:
            unisci(chiavi[0], k)
        per_faccia.append(chiavi[0])
    return len({trova(k) for k in per_faccia})


def cuciture_in_piano(o, gradi):
    """
    Lati condivisi da DUE facce quasi complanari le cui UV non combaciano.
    Ritorna (numero, lunghezza in mm, lunghezza totale delle cuciture in mm).

    Perche' questo e non "numero di isole": le isole contano le cuciture TUTTE,
    e la stragrande maggioranza cade dove la superficie gia' si spezza. Quelle
    che si vedono sono le altre.
    """
    me = o.data
    M = o.matrix_world
    uv = me.uv_layers.active.data
    facce_di_lato = {}
    for p in me.polygons:
        n = len(p.vertices)
        for k in range(n):
            a, b = p.vertices[k], p.vertices[(k + 1) % n]
            lato = (min(a, b), max(a, b))
            facce_di_lato.setdefault(lato, []).append((p.index, p.loop_start + k, n, k))
    uvv = {}
    for p in me.polygons:
        n = len(p.vertices)
        for k in range(n):
            uvv[(p.index, p.vertices[k])] = tuple(uv[p.loop_start + k].uv)

    normali = {p.index: (M.to_3x3() @ p.normal).normalized() for p in me.polygons}
    soglia = math.cos(math.radians(gradi))
    n_piane = 0
    len_piane = 0.0
    len_tutte = 0.0
    for lato, usi in facce_di_lato.items():
        if len(usi) != 2:
            continue
        f1, f2 = usi[0][0], usi[1][0]
        va, vb = lato
        u1a, u1b = uvv[(f1, va)], uvv[(f1, vb)]
        u2a, u2b = uvv[(f2, va)], uvv[(f2, vb)]
        cucita = (abs(u1a[0] - u2a[0]) > 1e-5 or abs(u1a[1] - u2a[1]) > 1e-5 or
                  abs(u1b[0] - u2b[0]) > 1e-5 or abs(u1b[1] - u2b[1]) > 1e-5)
        if not cucita:
            continue
        L = ((M @ me.vertices[va].co) - (M @ me.vertices[vb].co)).length * 1000.0
        len_tutte += L
        if normali[f1].dot(normali[f2]) >= soglia:
            n_piane += 1
            len_piane += L
    return n_piane, len_piane, len_tutte


# ══════════════════════════════════════════════════════════════════════════
#  §C · rasterizzazione UV etichettata per pezzo
# ══════════════════════════════════════════════════════════════════════════
def etichette_uv(ob, lato, per_faccia):
    """
    Come `maschera_uv` di cottura.py, ma invece di un booleano scrive
    l'etichetta del pezzo. Stesso campionamento (centro del texel), cosi' i
    conti si possono confrontare texel per texel.
    """
    me = ob.data
    me.calc_loop_triangles()
    n_loop = len(me.loops)
    uv = np.empty(n_loop * 2, dtype=np.float64)
    me.uv_layers.active.data.foreach_get('uv', uv)
    uv = uv.reshape(n_loop, 2) * lato
    n_tri = len(me.loop_triangles)
    tri = np.empty(n_tri * 3, dtype=np.int32)
    me.loop_triangles.foreach_get('loops', tri)
    tri = tri.reshape(-1, 3)
    poly = np.empty(n_tri, dtype=np.int32)
    me.loop_triangles.foreach_get('polygon_index', poly)

    lab = np.zeros((lato, lato), dtype=np.int32)
    for i in range(n_tri):
        p = uv[tri[i]]
        ident = int(per_faccia[poly[i]]) + 1
        x0 = max(0, int(np.floor(p[:, 0].min())))
        x1 = min(lato, int(np.ceil(p[:, 0].max())) + 1)
        y0 = max(0, int(np.floor(p[:, 1].min())))
        y1 = min(lato, int(np.ceil(p[:, 1].max())) + 1)
        if x1 <= x0 or y1 <= y0:
            continue
        xs = np.arange(x0, x1) + 0.5
        ys = np.arange(y0, y1) + 0.5
        gx, gy = np.meshgrid(xs, ys)
        (ax, ay), (bx, by), (cx, cy) = p
        den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
        if abs(den) < 1e-12:
            continue
        w0 = ((by - cy) * (gx - cx) + (cx - bx) * (gy - cy)) / den
        w1 = ((cy - ay) * (gx - cx) + (ax - cx) * (gy - cy)) / den
        w2 = 1.0 - w0 - w1
        dentro = (w0 >= -1e-9) & (w1 >= -1e-9) & (w2 >= -1e-9)
        if dentro.any():
            blocco = lab[y0:y1, x0:x1]
            np.copyto(blocco, ident, where=dentro)
    return lab


def bande_spigolo(ob, lato, gradi, per_faccia=None):
    """
    I texel attraversati da uno SPIGOLO VIVO, disegnati nello spazio UV.

    Serve a rispondere alla sola domanda che conta sulle macchie: sono raggi
    che hanno preso la superficie sbagliata, o sono lo smusso stesso? Uno
    smusso da 1,8 mm a 3,02 px/cm e' largo 0,54 texel: NON puo' essere una
    rampa, e un gradino letto dal filtro mediano e' indistinguibile da una
    macchia. Se le macchie stanno sugli spigoli, non sono un guasto della
    cottura: sono la risoluzione dell'atlante.
    """
    me = ob.data
    uv = me.uv_layers.active.data
    facce_di_lato = {}
    for p in me.polygons:
        n = len(p.vertices)
        for k in range(n):
            a, b = p.vertices[k], p.vertices[(k + 1) % n]
            facce_di_lato.setdefault((min(a, b), max(a, b)), []).append(
                (p.index, p.loop_start + k, p.loop_start + (k + 1) % n))
    normali = {p.index: p.normal.copy() for p in me.polygons}
    soglia = math.cos(math.radians(gradi))
    banda = np.zeros((lato, lato), dtype=bool)
    lungh_texel = 0.0
    M = ob.matrix_world
    lungh_mm = 0.0
    for lato_v, usi in facce_di_lato.items():
        if len(usi) != 2:
            vivo = True                      # bordo aperto: e' uno spigolo
        else:
            vivo = normali[usi[0][0]].dot(normali[usi[1][0]]) < soglia
        if not vivo:
            continue
        lungh_mm += ((M @ me.vertices[lato_v[0]].co)
                     - (M @ me.vertices[lato_v[1]].co)).length * 1000.0
        for _, la, lb in usi:
            p0 = np.array(uv[la].uv) * lato
            p1 = np.array(uv[lb].uv) * lato
            n = max(2, int(np.hypot(*(p1 - p0)) * 2) + 1)
            t = np.linspace(0.0, 1.0, n)
            xs = np.clip((p0[0] + (p1[0] - p0[0]) * t).astype(int), 0, lato - 1)
            ys = np.clip((p0[1] + (p1[1] - p0[1]) * t).astype(int), 0, lato - 1)
            banda[ys, xs] = True
            lungh_texel += float(np.hypot(*(p1 - p0)))
    return banda, lungh_texel, lungh_mm


def dilata(m, k):
    for _ in range(k):
        m = np.any(_vicini(m), axis=0) | m
    return m


def _vicini(a):
    return np.stack([np.roll(np.roll(a, dy, 0), dx, 1)
                     for dy in (-1, 0, 1) for dx in (-1, 0, 1)
                     if not (dy == 0 and dx == 0)], axis=0)


def erodi(m):
    return np.all(_vicini(m), axis=0) & m


def misura(px, dominio, soglia_macchia, soglia_info):
    """Le stesse definizioni di cottura.py, applicabili a una maschera qualsiasi."""
    if dominio.sum() == 0:
        return dict(texel=0, dev_r=0.0, dev_g=0.0, info=0.0, macchie=0.0, utili=0)
    r, g = px[..., 0], px[..., 1]
    scost = np.maximum(np.abs(r - 0.5), np.abs(g - 0.5)) * 255.0
    info = 100.0 * float((dominio & (scost > soglia_info)).sum()) / float(dominio.sum())
    med_r = np.median(_vicini(r), axis=0)
    med_g = np.median(_vicini(g), axis=0)
    scarto = np.maximum(np.abs(r - med_r), np.abs(g - med_g))
    interno = erodi(dominio)
    utili = int(interno.sum())
    macchie = 100.0 * int((interno & (scarto > soglia_macchia)).sum()) / utili if utili else 100.0
    return dict(texel=int(dominio.sum()),
                dev_r=float(np.std(r[dominio]) * 255.0),
                dev_g=float(np.std(g[dominio]) * 255.0),
                info=info, macchie=macchie, utili=utili)


# ══════════════════════════════════════════════════════════════════════════
#  §D · cottura di servizio (per la maschera del cotto)
# ══════════════════════════════════════════════════════════════════════════
FONDO = (0.0, 0.0, 0.0, 0.0)


def nuova_immagine(nome, lato):
    v = bpy.data.images.get(nome)
    if v:
        bpy.data.images.remove(v)
    img = bpy.data.images.new(nome, lato, lato, alpha=True, float_buffer=True, is_data=True)
    img.colorspace_settings.name = 'Non-Color'
    img.pixels.foreach_set(np.tile(np.array(FONDO, dtype=np.float32), lato * lato))
    return img


def leggi(img):
    buf = np.empty(img.size[0] * img.size[1] * 4, dtype=np.float32)
    img.pixels.foreach_get(buf)
    px = buf.reshape(img.size[1], img.size[0], 4)
    alfa = px[..., 3]
    m = alfa > (1.0 / 255.0)
    div = np.where(m, alfa, 1.0)
    return np.clip(px[..., :3] / div[..., None], 0.0, 1.0), m


def bersaglio(bassa, img):
    mat = bpy.data.materials.get('SERVIZIO_BERSAGLIO') or \
        bpy.data.materials.new('SERVIZIO_BERSAGLIO')
    mat.use_nodes = True
    nt = mat.node_tree
    nodo = nt.nodes.get('BERSAGLIO')
    if nodo is None:
        nodo = nt.nodes.new('ShaderNodeTexImage')
        nodo.name = 'BERSAGLIO'
    nodo.image = img
    for n in nt.nodes:
        n.select = False
    nodo.select = True
    nt.nodes.active = nodo
    bassa.data.materials.clear()
    bassa.data.materials.append(mat)


def cuoci_normale(alta, bassa, lato, est, raggio, margine):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 1
    sc.cycles.use_denoising = False
    b = sc.render.bake
    b.use_selected_to_active = True
    b.margin_type = 'ADJACENT_FACES'
    b.use_clear = False
    b.normal_space = 'TANGENT'
    b.normal_r, b.normal_g, b.normal_b = 'POS_X', 'POS_Y', 'POS_Z'
    img = nuova_immagine('SERVIZIO_NORMALE', lato)
    materiali = list(bassa.data.materials)
    bersaglio(bassa, img)
    bpy.ops.object.select_all(action='DESELECT')
    alta.select_set(True)
    bassa.select_set(True)
    bpy.context.view_layer.objects.active = bassa
    esito = bpy.ops.object.bake(type='NORMAL', use_selected_to_active=True,
                                cage_extrusion=est, max_ray_distance=raggio,
                                margin=margine, margin_type='ADJACENT_FACES',
                                use_clear=False)
    if 'FINISHED' not in esito:
        raise SystemExit('bake di servizio fallito: %s' % (esito,))
    px, m = leggi(img)
    bassa.data.materials.clear()
    for mt in materiali:
        bassa.data.materials.append(mt)
    return px, m


# ══════════════════════════════════════════════════════════════════════════
#  COMANDO  prepara
# ══════════════════════════════════════════════════════════════════════════
def prepara():
    geometria()
    pezzi = sorted([o for o in bpy.data.objects if o.type == 'MESH'], key=lambda o: o.name)
    if not pezzi:
        raise SystemExit('ERRORE: nessuna mesh.')
    if SENZA_FASCIAME:
        via = [o for o in pezzi if o.name.startswith('STATIC_HULL_PLATE')]
        if not via:
            raise SystemExit('ERRORE: --senza-fasciame ma il fasciame non c\'e\'.')
        pezzi = [o for o in pezzi if o not in via]
        for o in via:
            bpy.data.objects.remove(o, do_unlink=True)
        dice('SENZA FASCIAME: %d pezzi invece di %d' % (len(pezzi), len(pezzi) + len(via)))

    # ─── il censimento dei modificatori, che riserva una sorpresa ─────────
    # `join()` tiene i modificatori del solo oggetto ATTIVO. Ogni nodo esce
    # quindi con UNO smusso — quello del suo primo pezzo — applicato a tutto,
    # e i nodi il cui primo pezzo era `smusso=0` non ne hanno nessuno.
    dice('')
    dice('%-26s %6s %-28s' % ('pezzo', 'facce', 'modificatori'))
    dice('-' * 66)
    senza_smusso = []
    for o in pezzi:
        d = ', '.join('%s w=%.4f s=%d' % (m.type, getattr(m, 'width', 0.0),
                                          getattr(m, 'segments', 0))
                      for m in o.modifiers) or '(NESSUNO)'
        for m in o.modifiers:
            if m.type != 'BEVEL':
                raise SystemExit('ERRORE: %s ha un modificatore %s che non e\' uno '
                                 'smusso: la bassa non e\' piu\' "la stessa senza '
                                 'smussi".' % (o.name, m.type))
        if not o.modifiers:
            senza_smusso.append(o.name)
        dice('%-26s %6d %-28s' % (o.name, len(o.data.polygons), d))

    # ─── via i genitori, tenendo la posizione (il join li mescolerebbe) ───
    bpy.ops.object.select_all(action='DESELECT')
    for o in pezzi:
        o.select_set(True)
    bpy.context.view_layer.objects.active = pezzi[0]
    bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
    for v in [o for o in list(bpy.data.objects) if o.type == 'EMPTY']:
        bpy.data.objects.remove(v, do_unlink=True)

    # ─── §1 · la ALTA: copia + smussi applicati ───────────────────────────
    alte = []
    for o in pezzi:
        a = o.copy()
        a.data = o.data.copy()
        a.name = o.name + '_ALTA'
        bpy.context.collection.objects.link(a)
        bpy.ops.object.select_all(action='DESELECT')
        a.select_set(True)
        bpy.context.view_layer.objects.active = a
        for m in list(a.modifiers):
            try:
                bpy.ops.object.modifier_apply(modifier=m.name)
            except RuntimeError:
                a.modifiers.remove(m)
        alte.append(a)
    facce_alta = sum(len(a.data.polygons) for a in alte)

    # ─── §2 · la BASSA: gli stessi oggetti, senza smussi ──────────────────
    for o in pezzi:
        for m in list(o.modifiers):
            o.modifiers.remove(m)
    facce_bassa = sum(len(o.data.polygons) for o in pezzi)
    dice('')
    dice('ALTA  %d facce   BASSA %d facce   rapporto %.2f'
         % (facce_alta, facce_bassa, facce_alta / max(facce_bassa, 1)))
    if senza_smusso:
        dice('SENZA SMUSSO (alta == bassa, non c\'e\' niente da cuocere): %s'
             % ', '.join(senza_smusso))

    # ─── §3 · le UV, sulla BASSA, con la ricetta di uv-impianto.py ────────
    for o in pezzi:
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.0,
                                 area_weight=0.0, correct_aspect=True,
                                 scale_to_bounds=False)
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT')
    for o in pezzi:
        o.select_set(True)
    bpy.context.view_layer.objects.active = pezzi[0]
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.select_all(action='SELECT')
    bpy.ops.uv.average_islands_scale()
    margine = MARGINE_PX / ATLANTE
    bpy.ops.uv.pack_islands(rotate=True, margin_method='FRACTION', margin=margine,
                            shape_method=FORMA, scale=True, merge_overlap=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    dice('SROTOLAMENTO sulla BASSA + pack unico (forma %s, margine %.1f px su %d)'
         % (FORMA, MARGINE_PX, ATLANTE))

    # ─── §4 · le misure per pezzo ─────────────────────────────────────────
    dice('')
    dice('%-26s %9s %8s %6s %8s %7s %8s' %
         ('pezzo', 'area m2', 'atl.%', 'isole', 'px/cm', 'cuc.pi', 'mm piane'))
    dice('-' * 80)
    righe = []
    tot_uv = tot_3d = 0.0
    for i, o in enumerate(pezzi):
        a3 = area_3d(o)
        au = area_uv(o)
        ni = conta_isole(o)
        npi, lpi, ltot = cuciture_in_piano(o, ANGOLO_PIANO)
        dens = ATLANTE * math.sqrt(au / a3) / 100.0 if a3 > 0 else 0.0
        righe.append(dict(nome=o.name, area=a3, uv=au, isole=ni, dens=dens,
                          cuc_piane=npi, mm_piane=lpi, mm_cuciture=ltot))
        tot_3d += a3
        tot_uv += au
        dice('%-26s %9.4f %7.2f%% %6d %8.2f %7d %8.0f'
             % (o.name, a3, au * 100, ni, dens, npi, lpi))
    dice('-' * 80)
    vive = [r for r in righe if r['dens'] > 0]
    alto = max(vive, key=lambda r: r['dens'])
    basso = min(vive, key=lambda r: r['dens'])
    dice('TOTALE  %.4f m2   atlante %.2f%% analitico   densita\' %.2f - %.2f px/cm '
         '(rapporto %.2f, tetto %.1f)'
         % (tot_3d, tot_uv * 100, basso['dens'], alto['dens'],
            alto['dens'] / basso['dens'], RAPPORTO_MAX))

    # ─── §5 · l'attributo che sopravvive al join ──────────────────────────
    for i, o in enumerate(pezzi):
        me = o.data
        at = me.attributes.get(ATTR_PEZZO)
        if at is None:
            at = me.attributes.new(ATTR_PEZZO, 'INT', 'FACE')
        at.data.foreach_set('value', [i] * len(me.polygons))

    # ─── §6 · si uniscono: un atlante, un oggetto ─────────────────────────
    nomi = [o.name for o in pezzi]
    bpy.ops.object.select_all(action='DESELECT')
    for o in pezzi:
        o.select_set(True)
    bpy.context.view_layer.objects.active = pezzi[0]
    bpy.ops.object.join()
    bassa = bpy.context.object
    bassa.name = NOME_BASSA
    bassa.data.name = NOME_BASSA

    bpy.ops.object.select_all(action='DESELECT')
    for a in alte:
        a.select_set(True)
    bpy.context.view_layer.objects.active = alte[0]
    bpy.ops.object.join()
    alta = bpy.context.object
    alta.name = NOME_ALTA
    alta.data.name = NOME_ALTA

    at = bassa.data.attributes.get(ATTR_PEZZO)
    if at is None:
        raise SystemExit('ERRORE: l\'attributo %r non e\' sopravvissuto al join.' % ATTR_PEZZO)
    vals = np.empty(len(bassa.data.polygons), dtype=np.int32)
    at.data.foreach_get('value', vals)
    distinti = sorted(set(int(v) for v in vals))
    if distinti != list(range(len(nomi))):
        raise SystemExit('ERRORE: dopo il join l\'attributo pezzo vale %s, attesi 0..%d'
                         % (distinti, len(nomi) - 1))
    dice('')
    dice('UNITI   %s %d facce (%d slot materiale)   %s %d facce'
         % (NOME_BASSA, len(bassa.data.polygons), len(bassa.data.materials),
            NOME_ALTA, len(alta.data.polygons)))

    # ─── §7 · l'ingombro, e le distanze che NON vanno derivate da esso ────
    def diag(ob):
        p = [ob.matrix_world @ Vector(v) for v in ob.bound_box]
        xs = [q.x for q in p]; ys = [q.y for q in p]; zs = [q.z for q in p]
        return ((max(xs) - min(xs)) ** 2 + (max(ys) - min(ys)) ** 2
                + (max(zs) - min(zs)) ** 2) ** 0.5
    d = diag(bassa)
    smussi = [m.width for o in bpy.data.objects if o.type == 'MESH' for m in o.modifiers]
    dice('DIAGONALE bassa %.4f m  ->  i predefiniti di cottura.py sarebbero '
         'estrusione %.4f e raggio %.4f' % (d, d * 0.010, d * 0.050))
    dice('SMUSSO   il piu\' largo dell\'assieme e\' 3,0 mm: un raggio di %.0f mm '
         'cerca %0.0f volte piu\' lontano del dislivello che deve trovare.'
         % (d * 50.0, d * 50.0 / 3.0))

    os.makedirs(FUORI, exist_ok=True)
    json.dump(dict(pezzi=nomi, righe=righe, atlante=ATLANTE,
                   margine_px=MARGINE_PX, forma=FORMA,
                   facce_alta=facce_alta, facce_bassa=facce_bassa,
                   senza_smusso=senza_smusso, diagonale=d),
              open(PEZZI_JSON, 'w', encoding='utf-8'), indent=1)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND)
    dice('BLEND   %s  %.0f KB  (%.0f s)'
         % (BLEND, os.path.getsize(BLEND) / 1024, time.time() - T0))
    dice('PEZZI   %s' % PEZZI_JSON)


# ══════════════════════════════════════════════════════════════════════════
#  COMANDO  misura   — la stessa misura di cottura.py, ma PER PEZZO
# ══════════════════════════════════════════════════════════════════════════
def comando_misura():
    bpy.ops.wm.open_mainfile(filepath=BLEND)
    dati = json.load(open(PEZZI_JSON, encoding='utf-8'))
    nomi = dati['pezzi']
    alta = bpy.data.objects[NOME_ALTA]
    bassa = bpy.data.objects[NOME_BASSA]
    margine = max(4, ATLANTE // 128)

    at0 = bassa.data.attributes[ATTR_PEZZO]
    v0 = np.empty(len(bassa.data.polygons), dtype=np.int32)
    at0.data.foreach_get('value', v0)
    lab0 = etichette_uv(bassa, ATLANTE, v0)
    m_uv0 = lab0 > 0

    # ─── la spazzata sulla distanza di ricerca ────────────────────────────
    # Se le macchie NON si muovono cambiando il raggio di un fattore 25, non
    # sono raggi che scavalcano: sono qualcos'altro.
    if '--spazzata' in argv or '--spazzata-est' in argv:
        if '--spazzata-est' in argv:
            coppie = [(float(x), RAGGIO)
                      for x in opz('--spazzata-est', '', str).split(',')]
        else:
            coppie = [(min(ESTRUSIONE, float(x) * 0.5), float(x))
                      for x in opz('--spazzata', '', str).split(',')]
        dice('')
        dice('%10s %10s %10s %9s %10s' % ('estrus.', 'raggio', 'copert.%', 'info%', 'macchie%'))
        dice('-' * 54)
        for e, r in coppie:
            p, c = cuoci_normale(alta, bassa, ATLANTE, e, r, margine)
            m = misura(p, c & m_uv0, SOGLIA_MACCHIA, SOGLIA_INFO)
            dice('%10.4f %10.4f %10.2f %9.3f %10.4f'
                 % (e, r, 100.0 * (c & m_uv0).sum() / max(int(m_uv0.sum()), 1),
                    m['info'], m['macchie']))
        dice('-' * 54)

    dice('')
    dice('COTTURA DI SERVIZIO  estrusione %.4f  raggio %.4f  margine %d texel'
         % (ESTRUSIONE, RAGGIO, margine))
    px, cotto = cuoci_normale(alta, bassa, ATLANTE, ESTRUSIONE, RAGGIO, margine)

    at = bassa.data.attributes[ATTR_PEZZO]
    vals = np.empty(len(bassa.data.polygons), dtype=np.int32)
    at.data.foreach_get('value', vals)
    lab = etichette_uv(bassa, ATLANTE, vals)
    m_uv = lab > 0

    tot = misura(px, cotto & m_uv, SOGLIA_MACCHIA, SOGLIA_INFO)
    area_tot = int(m_uv.sum())
    dice('')
    dice('TOTALE   area UV %d texel (%.2f%% della texture), copertura %.2f%%'
         % (area_tot, 100.0 * area_tot / m_uv.size,
            100.0 * (cotto & m_uv).sum() / max(area_tot, 1)))
    dice('         info %.3f%%   macchie %.4f%%   dev R %.2f  G %.2f'
         % (tot['info'], tot['macchie'], tot['dev_r'], tot['dev_g']))

    dice('')
    # ─── dove stanno le macchie: sugli spigoli, o sparse? ─────────────────
    banda, len_texel, len_mm = bande_spigolo(bassa, ATLANTE, 35.0)
    LARGO = opz('--banda', 2, int)
    banda_d = dilata(banda, LARGO)
    r, g = px[..., 0], px[..., 1]
    scarto = np.maximum(np.abs(r - np.median(_vicini(r), axis=0)),
                        np.abs(g - np.median(_vicini(g), axis=0)))
    dom_tot = erodi(cotto & m_uv)
    macchia = dom_tot & (scarto > SOGLIA_MACCHIA)
    n_m = int(macchia.sum())
    dentro = int((macchia & banda_d).sum())
    dice('')
    dice('SPIGOLI VIVI (oltre 35 gradi, lo stesso limite dello smusso)')
    dice('  lunghezza      %.0f mm in 3D  =  %.0f texel a %d px'
         % (len_mm, len_texel, ATLANTE))
    dice('  banda a %d texel per lato: %d texel, %.3f%% dell\'area UV'
         % (LARGO, int(banda_d.sum()), 100.0 * banda_d.sum() / max(int(m_uv.sum()), 1)))
    dice('  smusso 1,8 mm a 3,02 px/cm  =  %.2f texel di larghezza  (2 segmenti: %.2f l\'uno)'
         % (0.18 * 3.02, 0.18 * 3.02 / 3))
    dice('  macchie totali %d;  sulla banda dello spigolo %d (%.1f%%),  '
         'fuori %d (%.4f%% dell\'area utile)'
         % (n_m, dentro, 100.0 * dentro / max(n_m, 1), n_m - dentro,
            100.0 * (n_m - dentro) / max(int(dom_tot.sum()), 1)))

    # ─── e allora dove stanno? nelle FACCE PIU' PICCOLE DI UN TEXEL ───────
    # Una faccia che occupa meno di un texel non ha un texel suo: il texel che
    # la contiene prende UNA delle facce che ci passano sopra, e il vicino ne
    # prende un'altra. Il salto che ne esce e' identico, per il filtro
    # mediano, a un raggio che ha sbagliato superficie. Non e' un guasto della
    # cottura: e' l'atlante che non ha risoluzione per quel pezzo.
    aree = np.empty(len(bassa.data.polygons), dtype=np.float64)
    uvl = bassa.data.uv_layers.active.data
    for p in bassa.data.polygons:
        ls = p.loop_indices
        n = len(ls)
        s = 0.0
        for k in range(n):
            u1, v1 = uvl[ls[k]].uv
            u2, v2 = uvl[ls[(k + 1) % n]].uv
            s += u1 * v2 - u2 * v1
        aree[p.index] = abs(s) * 0.5 * ATLANTE * ATLANTE
    lab_f = etichette_uv(bassa, ATLANTE, np.arange(len(aree), dtype=np.int32))
    mappa_area = np.where(lab_f > 0, aree[np.clip(lab_f - 1, 0, len(aree) - 1)], 1e9)
    dice('')
    dice('FACCE PIU\' PICCOLE DI UN TEXEL (sulla BASSA, %d facce)' % len(aree))
    for k in (1, 4, 16, 64):
        n_f = int((aree < k).sum())
        fitto = dom_tot & (mappa_area < k)
        dice('  area UV < %3d texel2: %5d facce (%.1f%%),  %7.3f%% dei texel utili,  '
             'ci cade il %5.1f%% delle macchie'
             % (k, n_f, 100.0 * n_f / len(aree),
                100.0 * fitto.sum() / max(int(dom_tot.sum()), 1),
                100.0 * int((macchia & fitto).sum()) / max(n_m, 1)))

    dice('')
    dice('%-26s %9s %8s %8s %9s %9s %8s' %
         ('pezzo', 'texel UV', 'copert.%', 'info%', 'macchie%', 'fuoribd%', 'devR'))
    dice('-' * 86)
    fuori = []
    for i, nome in enumerate(nomi):
        d_uv = (lab == i + 1)
        n_uv = int(d_uv.sum())
        if n_uv == 0:
            dice('%-26s %9d  (nessun texel)' % (nome, 0))
            continue
        dom = d_uv & cotto
        cop = 100.0 * int(dom.sum()) / n_uv
        m = misura(px, dom, SOGLIA_MACCHIA, SOGLIA_INFO)
        it = erodi(dom)
        fb = 100.0 * int((it & macchia & ~banda_d).sum()) / max(int(it.sum()), 1)
        dice('%-26s %9d %8.2f %8.3f %9.4f %9.4f %8.2f'
             % (nome, n_uv, cop, m['info'], m['macchie'], fb, m['dev_r']))
        fuori.append(dict(nome=nome, texel=n_uv, copertura=cop, info=m['info'],
                          macchie=m['macchie'], fuori_banda=fb,
                          dev_r=m['dev_r'], utili=m['utili']))
    dice('-' * 86)
    json.dump(fuori, open(os.path.join(FUORI, 'impianto-misura.json'), 'w',
                          encoding='utf-8'), indent=1)

    # ─── quanto e' larga la banda informativa: e' la domanda dei 2048 ─────
    scost = np.maximum(np.abs(px[..., 0] - 0.5), np.abs(px[..., 1] - 0.5)) * 255.0
    dom = cotto & m_uv
    for s in (2, 4, 8, 16, 32, 64):
        dice('  texel oltre %3d livelli da (128,128): %7.3f%%'
             % (s, 100.0 * float((dom & (scost > s)).sum()) / max(int(dom.sum()), 1)))
    dice('  scostamento massimo   %.1f livelli' % float(scost[dom].max() if dom.any() else 0))


# ══════════════════════════════════════════════════════════════════════════
#  COMANDO  confronto — a 2048 la normale restituisce gli smussi, o li perde?
# ══════════════════════════════════════════════════════════════════════════
def scena_render(largh, alt, dist_m, campioni):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = campioni
    sc.cycles.use_denoising = True
    sc.render.resolution_x = largh
    sc.render.resolution_y = alt
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_depth = '8'
    sc.view_settings.view_transform = 'Standard'

    if sc.world is None:
        sc.world = bpy.data.worlds.new('mondo')
    sc.world.use_nodes = True
    sc.world.node_tree.nodes['Background'].inputs[0].default_value = (0.45, 0.48, 0.52, 1)
    sc.world.node_tree.nodes['Background'].inputs[1].default_value = 1.0

    sole = bpy.data.objects.get('SOLE')
    if sole is None:
        d = bpy.data.lights.new('SOLE', 'SUN')
        d.energy = 4.0
        d.angle = math.radians(2.0)
        sole = bpy.data.objects.new('SOLE', d)
        bpy.context.collection.objects.link(sole)
    sole.rotation_euler = (math.radians(52), math.radians(12), math.radians(35))

    # il centro del meccanismo: tutto tranne il fasciame e la pinna, come fa
    # `glb-impianto.py` per l'ingombro "interno"
    bassa = bpy.data.objects[NOME_BASSA]
    dati = json.load(open(PEZZI_JSON, encoding='utf-8'))
    escl = [i for i, n in enumerate(dati['pezzi'])
            if n.startswith(('STATIC_HULL', 'RIG_FIN'))]
    at = bassa.data.attributes[ATTR_PEZZO]
    vals = np.empty(len(bassa.data.polygons), dtype=np.int32)
    at.data.foreach_get('value', vals)
    co = np.empty(len(bassa.data.vertices) * 3, dtype=np.float64)
    bassa.data.vertices.foreach_get('co', co)
    co = co.reshape(-1, 3)
    idx = set()
    for p in bassa.data.polygons:
        if int(vals[p.index]) not in escl:
            idx.update(p.vertices)
    pts = co[sorted(idx)]
    centro = Vector(((pts[:, 0].min() + pts[:, 0].max()) / 2,
                     (pts[:, 1].min() + pts[:, 1].max()) / 2,
                     (pts[:, 2].min() + pts[:, 2].max()) / 2))

    cam = bpy.data.objects.get('CAMERA')
    if cam is None:
        cd = bpy.data.cameras.new('CAMERA')
        cam = bpy.data.objects.new('CAMERA', cd)
        bpy.context.collection.objects.link(cam)
    cam.data.sensor_fit = 'VERTICAL'
    cam.data.angle_y = math.radians(34.0)          # lo stesso fov del sito
    dirz = Vector((0.62, -0.66, 0.42)).normalized()
    cam.location = centro + dirz * dist_m
    q = (centro - cam.location).to_track_quat('-Z', 'Y')
    cam.rotation_euler = q.to_euler()
    sc.camera = cam
    return centro


def con_normale(ob, png):
    """Copia i materiali della bassa e ci innesta la normale cotta."""
    img = bpy.data.images.load(png, check_existing=True)
    img.colorspace_settings.name = 'Non-Color'
    for i, slot in enumerate(ob.material_slots):
        m = slot.material
        if m is None:
            continue
        c = m.copy()
        c.name = m.name + '_NORM'
        slot.material = c
        nt = c.node_tree
        b = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if b is None:
            continue
        tex = nt.nodes.new('ShaderNodeTexImage')
        tex.image = img
        tex.interpolation = 'Linear'
        nm = nt.nodes.new('ShaderNodeNormalMap')
        nm.space = 'TANGENT'
        nt.links.new(tex.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])


def rendi(percorso):
    bpy.context.scene.render.filepath = percorso
    bpy.ops.render.render(write_still=True)
    img = bpy.data.images.load(percorso)
    # Si rilegge come DATO, non come colore: cosi' `pixels` restituisce i
    # livelli che stanno nel file, che e' quello che vede l'occhio. Riletta
    # come sRGB, Blender la converte in lineare e la differenza media
    # finirebbe pesata sulle alte luci.
    img.colorspace_settings.name = 'Non-Color'
    buf = np.empty(img.size[0] * img.size[1] * 4, dtype=np.float32)
    img.pixels.foreach_get(buf)
    px = buf.reshape(img.size[1], img.size[0], 4)
    bpy.data.images.remove(img)
    return px


def gradiente(l, m):
    dy = np.abs(np.diff(l, axis=0))[:, :-1]
    dx = np.abs(np.diff(l, axis=1))[:-1, :]
    mm = m[:-1, :-1]
    if mm.sum() == 0:
        return 0.0
    return float(np.mean(np.hypot(dx, dy)[mm]) * 255.0)


def comando_confronto():
    # I posizionali NON si scandiscono in cerca dell'ultimo: `opz` non toglie
    # dalla lista il valore che segue un'opzione, e `--campioni 96` lasciava
    # "96" fra i posizionali. La cartella si dichiara, o e' quella di serie.
    # ASSOLUTO, non relativo. `open_mainfile` sposta la directory di lavoro di
    # Blender, e un percorso relativo passato dopo non punta piu' dove credi:
    # `images.load` fallisce a meta' del terzo render, quando i primi due sono
    # gia' costati due minuti. E' la stessa trappola che cottura.py documenta
    # per il salvataggio, dall'altro lato.
    cartella = os.path.abspath(opz('--cartella', os.path.join(FUORI, 'cottura'), str))
    png = os.path.join(cartella, '%s-normale.png' % NOME_BASSA.lower())
    if not os.path.isfile(png):
        raise SystemExit('ERRORE: non trovo %s' % png)
    largh = opz('--largh', 1920, int)
    alt = opz('--alt', 1080, int)
    campioni = opz('--campioni', 96, int)
    # 2,6 unita' di scena, e la scena legge una sua unita' come 2,5 m
    dist = opz('--distanza', 2.6 * 2.5)
    fuori = os.path.join(FUORI, 'confronto')
    os.makedirs(fuori, exist_ok=True)

    esiti = {}
    for etichetta in ('alta', 'bassa-normale', 'bassa-nuda'):
        bpy.ops.wm.open_mainfile(filepath=BLEND)
        alta = bpy.data.objects[NOME_ALTA]
        bassa = bpy.data.objects[NOME_BASSA]
        # Il fasciame non si vede nel sito — `impianto.js` lo spegne — e qui
        # riempirebbe meta' quadro di superficie piatta, cioe' diluirebbe la
        # misura con l'unica cosa su cui la normale non ha niente da dire.
        # Si riconosce dall'area: le sue due facce sono 5,7 m2 l'una, la piu'
        # grande di tutto il resto dell'assieme e' 0,73.
        for ob in (alta, bassa):
            via = set(p.index for p in ob.data.polygons if p.area > 2.0)
            if via:
                bpy.context.tool_settings.mesh_select_mode = (False, False, True)
                for p in ob.data.polygons:
                    p.select = p.index in via
                bpy.ops.object.select_all(action='DESELECT')
                ob.select_set(True)
                bpy.context.view_layer.objects.active = ob
                bpy.ops.object.mode_set(mode='EDIT')
                bpy.ops.mesh.delete(type='FACE')
                bpy.ops.object.mode_set(mode='OBJECT')
            ob.hide_render = True
        if etichetta == 'alta':
            alta.hide_render = False
        else:
            bassa.hide_render = False
            if etichetta == 'bassa-normale':
                con_normale(bassa, png)
        scena_render(largh, alt, dist, campioni)
        t = time.time()
        esiti[etichetta] = rendi(os.path.join(fuori, etichetta + '.png'))
        dice('RESO  %-14s %d x %d, %d campioni, %.0f s'
             % (etichetta, largh, alt, campioni, time.time() - t))

    A = esiti['alta']
    B = esiti['bassa-normale']
    C = esiti['bassa-nuda']
    lum = lambda p: 0.2126 * p[..., 0] + 0.7152 * p[..., 1] + 0.0722 * p[..., 2]
    m = (A[..., 3] > 0.5) & (B[..., 3] > 0.5) & (C[..., 3] > 0.5)
    la, lb, lc = lum(A), lum(B), lum(C)
    dice('')
    dice('CONFRONTO  distanza %.2f m (%.1f unita\' di scena), fov 34 verticale, %d x %d'
         % (dist, dist / 2.5, largh, alt))
    dice('  pixel confrontati (dove tutte e tre hanno materia): %d (%.1f%% del quadro)'
         % (int(m.sum()), 100.0 * m.sum() / m.size))
    dice('  |bassa+normale - alta|  media %.3f livelli   massimo %.1f'
         % (float(np.mean(np.abs(lb - la)[m]) * 255), float(np.max(np.abs(lb - la)[m]) * 255)))
    dice('  |bassa nuda    - alta|  media %.3f livelli   massimo %.1f'
         % (float(np.mean(np.abs(lc - la)[m]) * 255), float(np.max(np.abs(lc - la)[m]) * 255)))
    dice('  |bassa+normale - bassa nuda|  media %.3f livelli  <- quanto FA la mappa'
         % float(np.mean(np.abs(lb - lc)[m]) * 255))
    dice('  gradiente locale (dettaglio per pixel): alta %.3f  bassa+normale %.3f  '
         'bassa nuda %.3f' % (gradiente(la, m), gradiente(lb, m), gradiente(lc, m)))
    err_b = float(np.mean(np.abs(lb - la)[m]))
    err_c = float(np.mean(np.abs(lc - la)[m]))
    dice('  la normale recupera il %.1f%% dello scarto fra bassa nuda e alta'
         % (100.0 * (err_c - err_b) / err_c if err_c > 0 else 0.0))
    dice('  immagini in %s' % fuori)


# ══════════════════════════════════════════════════════════════════════════
def comando_bleed():
    """
    Il secondo cancello di `uv-impianto.py`, rifatto sull'atlante NUOVO.
    Il margine e' un parametro dichiarato al packer: su una disposizione
    diversa va rimisurato, non ereditato.
    """
    bpy.ops.wm.open_mainfile(filepath=BLEND)
    bassa = bpy.data.objects[NOME_BASSA]
    alta = bpy.data.objects[NOME_ALTA]
    for ob in (bassa, alta):
        ob.data.calc_loop_triangles()
    dice('TRIANGOLI  alta %d   bassa %d   (facce %d / %d)'
         % (len(alta.data.loop_triangles), len(bassa.data.loop_triangles),
            len(alta.data.polygons), len(bassa.data.polygons)))

    me = bassa.data
    uv = me.uv_layers.active.data
    padre = {}

    def trova(x):
        r = x
        while padre[r] != r:
            r = padre[r]
        while padre[x] != r:
            padre[x], x = r, padre[x]
        return r

    def unisci(a, b):
        ra, rb = trova(a), trova(b)
        if ra != rb:
            padre[ra] = rb

    per_faccia = []
    for p in me.polygons:
        chiavi = []
        for li in p.loop_indices:
            u, v = uv[li].uv
            k = (me.loops[li].vertex_index, round(u, 5), round(v, 5))
            padre.setdefault(k, k)
            chiavi.append(k)
        for k in chiavi[1:]:
            unisci(chiavi[0], k)
        per_faccia.append(chiavi[0])
    radici = {}
    ident = np.empty(len(me.polygons), dtype=np.int32)
    for i, k in enumerate(per_faccia):
        r = trova(k)
        if r not in radici:
            radici[r] = len(radici)
        ident[i] = radici[r]
    dice('ISOLE      %d sull\'atlante unito' % len(radici))

    N = ATLANTE
    lab = etichette_uv(bassa, N, ident)
    dice('RASTER     %.2f%% dei texel coperti, %d isole disegnate'
         % (100.0 * (lab > 0).sum() / (N * N), len(np.unique(lab)) - 1))

    DIR = ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1))

    def sposta(a, dx, dy):
        s = np.zeros_like(a)
        s[max(0, dy):N + min(0, dy), max(0, dx):N + min(0, dx)] = \
            a[max(0, -dy):N + min(0, -dy), max(0, -dx):N + min(0, -dx)]
        return s

    urto = None
    for dx, dy in DIR:
        s = sposta(lab, dx, dy)
        if ((lab > 0) & (s > 0) & (lab != s)).any():
            urto = 0
            break
    if urto is None:
        for k in range(1, 33):
            prop = np.zeros_like(lab)
            vuoto = lab == 0
            scontro = False
            for dx, dy in DIR:
                s = sposta(lab, dx, dy)
                cand = vuoto & (s > 0)
                if (cand & (prop > 0) & (prop != s)).any():
                    scontro = True
                    break
                prop = np.where(cand & (prop == 0), s, prop)
            if scontro:
                urto = k
                break
            lab = np.where(vuoto & (prop > 0), prop, lab)
    if urto is None:
        dice('BLEED      oltre 32 px senza contatti')
    else:
        b = max(0, urto - 1)
        dice('BLEED      sicuro %d px a %d  ->  %.1f a 1024, %.1f a 512'
             % (b, N, b / (N / 1024.0), b / (N / 512.0)))
        if b < MARGINE_PX:
            dice('CANCELLO ROSSO: chiesti %.0f px, misurati %d.' % (MARGINE_PX, b))
        else:
            dice('CANCELLO VERDE: bleed %d px >= %.0f chiesti' % (b, MARGINE_PX))


def comando_cuciture():
    """
    LE CUCITURE IN MEZZO ALLA FACCIA VISIBILE.

    Un cilindro tornito va tagliato per essere steso: la cucitura c'e' per
    forza. La domanda non e' se c'e', e' DOVE cade. Una cucitura sul fondo di
    una gola, o dentro il carter, non la vede nessuno; una sulla generatrice
    esposta di un albero si vede, perche' spezza in due una rampa continua
    proprio dove la luce scorre.

    "Esposta" non si giudica a occhio: si legge nell'occlusione gia' cotta.
    Un texel con AO alta e' un texel che vede il cielo, cioe' che si guarda.
    """
    bpy.ops.wm.open_mainfile(filepath=BLEND)
    dati = json.load(open(PEZZI_JSON, encoding='utf-8'))
    nomi = dati['pezzi']
    bassa = bpy.data.objects[NOME_BASSA]
    cartella = os.path.abspath(opz('--cartella', os.path.join(FUORI, 'cottura'), str))
    orm_f = os.path.join(cartella, '%s-orm.png' % NOME_BASSA.lower())
    if not os.path.isfile(orm_f):
        raise SystemExit('ERRORE: non trovo %s' % orm_f)
    img = bpy.data.images.load(orm_f)
    img.colorspace_settings.name = 'Non-Color'
    buf = np.empty(img.size[0] * img.size[1] * 4, dtype=np.float32)
    img.pixels.foreach_get(buf)
    ao = buf.reshape(img.size[1], img.size[0], 4)[..., 0]
    N = img.size[0]

    me = bassa.data
    M = bassa.matrix_world
    uv = me.uv_layers.active.data
    at = me.attributes[ATTR_PEZZO]
    pez = np.empty(len(me.polygons), dtype=np.int32)
    at.data.foreach_get('value', pez)

    facce_di_lato = {}
    for p in me.polygons:
        n = len(p.vertices)
        for k in range(n):
            a, b = p.vertices[k], p.vertices[(k + 1) % n]
            facce_di_lato.setdefault((min(a, b), max(a, b)), []).append(
                (p.index, p.loop_start + k, p.loop_start + (k + 1) % n))
    normali = {p.index: p.normal.copy() for p in me.polygons}
    soglia = math.cos(math.radians(ANGOLO_PIANO))
    SOGLIA_AO = opz('--soglia-ao', 0.85)

    tot = {}
    for lato_v, usi in facce_di_lato.items():
        if len(usi) != 2:
            continue
        f1, f2 = usi[0][0], usi[1][0]
        u1 = tuple(uv[usi[0][1]].uv) + tuple(uv[usi[0][2]].uv)
        u2 = tuple(uv[usi[1][1]].uv) + tuple(uv[usi[1][2]].uv)
        # i due lati vanno confrontati anche a versi scambiati
        cucita = not (max(abs(a - b) for a, b in zip(u1, u2)) < 1e-5 or
                      max(abs(a - b) for a, b in zip(u1, u2[2:] + u2[:2])) < 1e-5)
        if not cucita:
            continue
        if normali[f1].dot(normali[f2]) < soglia:
            continue                      # spigolo vivo: la cucitura e' gratis
        L = ((M @ me.vertices[lato_v[0]].co)
             - (M @ me.vertices[lato_v[1]].co)).length * 1000.0
        # l'occlusione media lungo la cucitura, campionata su entrambi i lembi
        campioni = []
        for _, la, lb in usi:
            p0 = np.array(uv[la].uv) * N
            p1 = np.array(uv[lb].uv) * N
            n = max(2, int(np.hypot(*(p1 - p0))) + 1)
            t = np.linspace(0.08, 0.92, n)
            xs = np.clip((p0[0] + (p1[0] - p0[0]) * t).astype(int), 0, N - 1)
            ys = np.clip((p0[1] + (p1[1] - p0[1]) * t).astype(int), 0, N - 1)
            campioni.append(ao[ys, xs].mean())
        occ = float(np.mean(campioni))
        k = int(pez[f1])
        r = tot.setdefault(k, [0, 0.0, 0, 0.0])
        r[0] += 1
        r[1] += L
        if occ >= SOGLIA_AO:
            r[2] += 1
            r[3] += L

    dice('')
    dice('CUCITURE IN PIANO (facce entro %.0f gradi), esposte = occlusione media >= %.2f'
         % (ANGOLO_PIANO, SOGLIA_AO))
    dice('%-26s %8s %10s %9s %11s' % ('pezzo', 'cuc.', 'mm', 'esposte', 'mm esposti'))
    dice('-' * 70)
    tn = tl = en = el = 0
    for i, nome in enumerate(nomi):
        r = tot.get(i, [0, 0.0, 0, 0.0])
        dice('%-26s %8d %10.0f %9d %11.0f' % (nome, r[0], r[1], r[2], r[3]))
        tn += r[0]; tl += r[1]; en += r[2]; el += r[3]
    dice('-' * 70)
    dice('%-26s %8d %10.0f %9d %11.0f  (%.0f%% della lunghezza)'
         % ('TOTALE', tn, tl, en, el, 100.0 * el / max(tl, 1e-9)))


if COMANDO == 'cuciture':
    comando_cuciture()
elif COMANDO == 'bleed':
    comando_bleed()
elif COMANDO == 'prepara':
    prepara()
elif COMANDO == 'misura':
    comando_misura()
elif COMANDO == 'confronto':
    comando_confronto()
else:
    raise SystemExit('comando sconosciuto: %r (prepara | misura | confronto)' % COMANDO)
