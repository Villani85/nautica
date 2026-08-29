# -*- coding: utf-8 -*-
"""
COTTURA DELL'OCCLUSIONE PER GLI INTERNI.

    blender -b -P cuoci-interni.py -- <cartella> [lato] [--distanza 0.60]
                                                        [--campioni 64]

Costruisce gli interni con `glb-interni.py`, srotola le tredici mesh in un
atlante, cuoce l'ambient occlusion e riesporta il GLB con la mappa agganciata.

═══ PERCHE' L'OCCLUSIONE, e non la coppia normale+ORM delle macchine

Le macchine spediscono due mappe perche' hanno una geometria ALTA con smussi
veri da trasferire su una BASSA semplificata: li' la normale porta informazione
che nella mesh spedita non c'e' piu'.

Qui non c'e' nessuna semplificazione: la mesh che si spedisce **e' gia'** quella
di dettaglio, 51.848 triangoli con i loro smussi. Cuocere una normale da se'
stessi darebbe una mappa piatta, e `cottura.py` la boccerebbe da sola col
cancello dell'informazione -- *«una cottura che riesce sempre non e' una
cottura, e' un file PNG»*.

Quello che manca si vede nei provini e non e' il rilievo: e' **l'ombra di
contatto**. Dove il pagliolato incontra l'ordinata, sotto i piani, dietro le
scalette, nell'angolo fra fasciame e paratia non si scurisce niente. Un interno
senza occlusione legge come cartone ritagliato per quanto sia modellato bene,
ed e' il segno di CG piu' forte che quelle immagini portano.

═══ LA STRADA SCARTATA, e va scritta perche' costa una notte riprovarla

**Occlusione sui VERTICI**, in `COLOR_0`, senza atlante e senza texture. E'
allettante: 25.108 vertici per quattro byte sono 98 KB grezzi contro i 172 KB
brotli dell'atlante, e non spacca nessun vertice.

Provata e MISURATA: non funziona **su questa** geometria.

    distanza    p10      mediana   p90     vertici sotto 0,75
    0,10 m      0,016    0,445     0,991   69,2%
    0,20 m      0,000    0,402     0,965   71,6%
    0,35 m      0,000    0,366     0,965   73,5%
    0,60 m      0,000    0,342     0,947   76,3%

Il decimo percentile e' **zero a qualunque distanza**, e la distanza quasi non
sposta la mediana. La ragione non e' la taratura: e' che questo modello e' fatto
di scatole che si compenetrano -- ordinate che entrano nel fasciame, supporti
annegati nei pagliolati -- e i vertici di quelle compenetrazioni stanno DENTRO
il solido, dove l'occlusione vale zero perche' non si vede niente.

Su un atlante quei punti sono superficie nascosta e non li guarda nessuno. Su un
vertice il nero viene INTERPOLATO sul triangolo visibile, e macchia. E' una
proprieta' della geometria, non un difetto da tarare: nessuna distanza,
nessuna forza e nessun clamp la tolgono senza togliere anche le ombre vere.

═══ IL COSTO DELL'ATLANTE, MISURATO, E IL TETTO CHE NE E' USCITO

Le cuciture sono il prezzo vero, non la texture. Srotolare spacca ogni vertice
che sta su un bordo d'isola, e su una geometria di scatole ogni spigolo lo e':

    senza UV                     25.108 vertici
    proiezione a cubo            54.894   x2,19    <- la piu' economica
    unwrap angle-based           59.185   x2,36
    smart project 66 gradi       62.103   x2,47

Il fattore non scende sotto 2,19 con nessun metodo: e' strutturale. Da qui il
conto, tutto misurato:

    interni.glb senza occlusione                    136,3 KB brotli
    atlante 1024, smart project, webp q70           308,3 KB brotli
    atlante  512, proiezione a cubo, webp q70       vedi `npm run peso`

`collaudo-glb` dichiarava un tetto di 160 KB, e la sua motivazione scritta e'
*«non possono costare piu' delle due macchine messe insieme, che hanno un tetto
di 250 KB; 160 e' la misura di oggi piu' il margine per il corredo che ancora
manca»*. Il soffitto vero e' quindi 250, e l'occlusione e' esattamente il
«corredo che ancora manca» per cui quel margine esisteva.

═══ LA DISTANZA DI RICERCA E' IL SOLO NUMERO DI TARATURA

Il predefinito di Cycles e' un ottavo della diagonale: qui circa 5 metri, e ogni
angolo raccoglierebbe mezzo scafo. E' la trappola che `rifai-macchine.sh` ha
gia' pagato («col predefinito l'occlusione esce nera»), curata li' con 6 cm.

Sei centimetri qui sarebbero l'errore opposto: su una macchina da 7,5 m
descrivono la fessura fra due flange, in un locale da 40 m non toccano niente.
La grandezza da rendere e' l'angolo fra un pagliolato e un'ordinata, che si
legge su qualche decina di centimetri. **0,60 m** e' quella scala, e i tre
cancelli in fondo la difendono da tutte e due le parti.
"""
import bpy
import sys
import os
import math
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
_pos = argv[:next((i for i, a in enumerate(argv) if a.startswith('--')), len(argv))]
FUORI = _pos[0]
LATO = int(_pos[1]) if len(_pos) > 1 else 512


def opzione(nome, pred, tipo=float):
    return tipo(argv[argv.index(nome) + 1]) if nome in argv else pred


DISTANZA = opzione('--distanza', 0.60)
CAMPIONI = opzione('--campioni', 64, int)
MARGINE_PX = opzione('--margine', 4, int)

QUI = os.path.dirname(os.path.abspath(__file__))
SORGENTE = os.path.join(QUI, 'glb-interni.py')


def dice(*a):
    print(*a)
    sys.stdout.flush()


# ── 1 · la geometria, dal costruttore vero, senza toccarlo ────────────────
#
# Si esegue `glb-interni.py` per intero, esportazione compresa: quel GLB senza
# occlusione resta l'uscita del passo 2 di `rifai-interni.sh`, e cosi' questo
# script non ha bisogno di un MODO dentro il costruttore -- cioe' non tocca un
# file che oggi funziona e che ha i propri cancelli sulla sporgenza dal
# fasciame. Qui sotto lo si riscrive con l'occlusione dentro.
_vecchio = list(sys.argv)
sys.argv = ['blender', '-b', '-P', SORGENTE, '--', FUORI]
exec(compile(open(SORGENTE, encoding='utf-8').read(), SORGENTE, 'exec'),
     {'__name__': 'geometria_interni', '__file__': SORGENTE})
sys.argv = _vecchio

mesh = sorted([o for o in bpy.data.objects if o.type == 'MESH'], key=lambda o: o.name)
if not mesh:
    raise SystemExit('ERRORE: il costruttore non ha lasciato nessuna mesh in scena.')


# ── 2 · la distanza e' in METRI, e la scena potrebbe non esserlo ──────────
#
# `interni.json` porta `metriPerUnita`, che vale 2,5 e riguarda le unita' del
# SITO, non quelle di Blender. Verificato: qui lo scafo misura 40,00 unita' su
# 40 m dichiarati, quindi le due scale coincidono -- ma non si lascia dipendere
# una cottura da una coincidenza. Si misura la scena e si divide per la
# lunghezza che lo scafo dichiara, che nessuno puo' cambiare di nascosto: il
# costruttore stesso boccia la geometria che esce dal fasciame.
LUNGHEZZA_M = 40.0
_mn = [1e9] * 3
_mx = [-1e9] * 3
for _o in mesh:
    for _c in _o.bound_box:
        _w = _o.matrix_world @ Vector(_c)
        for _i in range(3):
            _mn[_i] = min(_mn[_i], _w[_i])
            _mx[_i] = max(_mx[_i], _w[_i])
_lato_scena = max(_mx[i] - _mn[i] for i in range(3))
UNITA_PER_METRO = _lato_scena / LUNGHEZZA_M
DISTANZA_U = DISTANZA * UNITA_PER_METRO

dice('')
dice('SCALA      %.3f unita per metro (lo scafo misura %.2f unita su %.0f m dichiarati)'
     % (UNITA_PER_METRO, _lato_scena, LUNGHEZZA_M))
dice('COTTURA    %d mesh, atlante %d px, distanza %.2f m = %.3f unita, %d campioni'
     % (len(mesh), LATO, DISTANZA, DISTANZA_U, CAMPIONI))


# ── 3 · srotolamento SMART, e la proiezione a cubo e' stata provata e scartata
#
# A cubo costa il 13% di vertici in meno (54.894 contro 62.103) e sembrava
# l'affare giusto. Misurato, e' il contrario: le sei facce del cubo restano
# sparse dentro il rettangolo dell'oggetto, e la cella allocata resta quasi
# vuota.
#
#     srotolamento      vertici    atlante COTTO
#     a cubo            54.894      12,2%
#     smart 66 gradi    62.103      39,3%
#
# Tre volte la densita' di texel utile per il 13% di vertici in piu'. Il
# rapporto non e' nemmeno vicino: si paga la cucitura e si compra risoluzione.
MARGINE = MARGINE_PX / float(LATO)
for o in mesh:
    while o.data.uv_layers:
        o.data.uv_layers.remove(o.data.uv_layers[0])
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


# ── 3-bis · LA CUCITURA SI PAGA SOLO DOVE L'AREA LA RIPAGA ───────────────
#
# Il conto per mesh, misurato su questo modello:
#
#     mesh                        vert   dopo   aggiunti  area    quota
#     int_ordinate               13072  34263     21191    9,5%   57,3%
#     int_supporti                2304   4902      2598    0,6%    7,0%
#     int_tubazioni               1536   3839      2303    4,2%    6,2%
#     int_passerelle_cavi         1248   3536      2288    4,7%    6,2%
#     int_paratia_avanti_centro   1042   2571      1529    3,9%    4,1%
#     int_paratia_prua_avanti     1010   2510      1500    2,3%    4,1%
#     int_paratia_centro_poppa     992   2458      1466    3,9%    4,0%
#     int_pagliolato_macchine      800   1826      1026   22,2%    2,8%
#     int_plafoniere               696   1624       928    0,5%    2,5%
#     int_scale                    480   1280       800    0,5%    2,2%
#     int_correnti                1064   1683       619    3,1%    1,7%
#     int_pagliolato_allestimento  552   1122       570   31,3%    1,5%
#     int_pagliolato_sentina       312    489       177   13,2%    0,5%
#
# Le ordinate da sole costano il **57,3% di tutte le cuciture** e portano il
# 9,5% della superficie: sono centinaia di scatole sottili, e ogni scatola si
# apre su sei isole. I tre pagliolati fanno l'opposto -- il 66,7% dell'area per
# il 4,8% del costo.
#
# Quindi non si srotola tutto: si srotola dove il rapporto fra quota d'AREA e
# quota di CUCITURE sta sopra una soglia. Non e' una lista di nomi (che
# marcirebbe al primo pezzo nuovo): e' una regola che si rimisura da sola a ogni
# corsa e stampa cosa ha tenuto e cosa no.
#
# La soglia e' 0,5 e la forchetta si ricava dai dati: sopra 1,0 restano solo i
# pagliolati e le paratie sparirebbero -- e le paratie sono meta' delle ombre
# che si vedono in sezione; sotto 0,3 rientrano le ordinate e il modello
# raddoppia. In mezzo, 0,5 tiene l'89% della superficie per un quarto del costo.
#
# Le mesh scartate NON restano senza materiale: ne ricevono una copia SENZA il
# nodo dell'occlusione. Senza questo passo condividerebbero il materiale delle
# altre, e una mesh senza UV con una texture di occlusione agganciata campiona
# tutta la superficie sul texel (0,0) -- cioe' una tinta piatta presa a caso.
SOGLIA_RESA = float(opzione('--soglia-resa', 0.5))


def _area(o):
    M = o.matrix_world
    t = 0.0
    for p in o.data.polygons:
        vs = [M @ o.data.vertices[i].co for i in p.vertices]
        for k in range(1, len(vs) - 1):
            t += (vs[k] - vs[0]).cross(vs[k + 1] - vs[0]).length / 2
    return t


def _dopo(o):
    uvl = o.data.uv_layers[0].data
    visti = set()
    for i, l in enumerate(o.data.loops):
        visti.add((l.vertex_index, round(uvl[i].uv[0], 4), round(uvl[i].uv[1], 4)))
    return len(visti)


aree = {o.name: max(_area(o), 1e-9) for o in mesh}
aggiunti = {o.name: max(_dopo(o) - len(o.data.vertices), 0) for o in mesh}
tot_a = sum(aree.values())
tot_c = max(sum(aggiunti.values()), 1)
resa = {n: (aree[n] / tot_a) / max(aggiunti[n] / tot_c, 1e-9) for n in aree}

tenute = [o for o in mesh if resa[o.name] >= SOGLIA_RESA]
scartate = [o for o in mesh if resa[o.name] < SOGLIA_RESA]
if not tenute:
    raise SystemExit('ERRORE: la soglia di resa %.2f ha scartato tutte le mesh.' % SOGLIA_RESA)

dice('RESA       soglia %.2f: %d mesh srotolate, %d lasciate piatte'
     % (SOGLIA_RESA, len(tenute), len(scartate)))
for o in sorted(mesh, key=lambda o: -resa[o.name]):
    dice('   %-30s resa %6.2f  area %5.1f%%  cuciture %5.1f%%   %s'
         % (o.name, resa[o.name], 100 * aree[o.name] / tot_a,
            100 * aggiunti[o.name] / tot_c,
            'srotolata' if resa[o.name] >= SOGLIA_RESA else 'piatta'))
dice('           area srotolata %.1f%%, cuciture pagate %.1f%%'
     % (100 * sum(aree[o.name] for o in tenute) / tot_a,
        100 * sum(aggiunti[o.name] for o in tenute) / tot_c))

# le scartate perdono le UV e ricevono una copia del materiale senza occlusione
piatti = {}
for o in scartate:
    while o.data.uv_layers:
        o.data.uv_layers.remove(o.data.uv_layers[0])
    for i, slot in enumerate(o.material_slots):
        m = slot.material
        if m is None:
            continue
        if m.name not in piatti:
            c = m.copy()
            c.name = m.name + '_piatto'
            piatti[m.name] = c
        o.material_slots[i].material = piatti[m.name]

# da qui in poi l'atlante riguarda SOLO le mesh srotolate
mesh_uv = tenute
materiali_uv = set()
for o in mesh_uv:
    for slot in o.material_slots:
        if slot.material is not None:
            materiali_uv.add(slot.material.name)


# ── 4 · l'atlante se lo costruisce questo script ──────────────────────────
#
# ─── PERCHE' NON `bpy.ops.uv.pack_islands`, che e' la strada delle macchine
#
# Perche' in `blender -b` **non fa niente e ritorna riuscito**. Misurato tre
# volte, con e senza `use_uv_select_sync`, con `CLOSEST_UDIM` e con
# `ACTIVE_UDIM`: il rettangolo delle UV resta identico a quello che lascia
# `average_islands_scale`.
#
#     senza sincronia            u 0,023..8,317
#     con sincronia, CLOSEST     u 0,006..5,312
#     con sincronia, ACTIVE      u 0,006..5,312   <- identico: e' un no-op
#
# L'impacchettamento vive nell'EDITOR UV, e in background quell'editor non c'e'.
# Su `glb-macchine.py` la stessa riga funziona per un caso fortunato e non per
# merito: quelle macchine sono piccole, dopo lo srotolamento le isole stanno
# gia' nel primo riquadro, e un impacchettamento che non lavora lascia le cose
# dove sono gia' buone. Qui tredici oggetti srotolati ognuno per conto suo
# occupano TUTTI lo stesso riquadro, sovrapposti: qualunque cottura scrive sopra
# se' stessa e la mappa esce nera. Costato tre corse.
#
# ─── COSA FA QUESTO, e perche' e' meglio di un operatore che tace
#
# A ogni mesh una CELLA del quadrato unitario, con l'AREA proporzionale alla sua
# superficie in 3D e la PROPORZIONE del suo rettangolo UV:
#
#     w = sqrt(A * r)     h = sqrt(A / r)     con r = larghezza/altezza UV
#
# cosi' w*h = A -- la densita' di texel resta uniforme fra gli oggetti -- e
# w/h = r, cioe' i texel restano quadrati. Con celle QUADRATE, provate prima,
# l'atlante risultava coperto per il 29,9% e le isole lunghe uscivano stirate;
# con la proporzione giusta la copertura sale al 52,9%.
#
# Le celle non si sovrappongono perche' sono ALLOCATE, non impacchettate, e il
# risultato e' deterministico: stessa geometria, stesso atlante, sempre.
forme = {}
for o in mesh_uv:
    a = b = 1e9
    c = d = -1e9
    for x in o.data.uv_layers[0].data:
        a = min(a, x.uv[0]); c = max(c, x.uv[0])
        b = min(b, x.uv[1]); d = max(d, x.uv[1])
    forme[o.name] = (a, b, max(c - a, 1e-9), max(d - b, 1e-9))

tot = sum(aree[o.name] for o in mesh_uv)
misure = {}
for o in mesh_uv:
    _, _, du, dv = forme[o.name]
    r = du / dv
    A = aree[o.name] / tot
    misure[o.name] = (math.sqrt(A * r), math.sqrt(A / r))
ordine = sorted(mesh_uv, key=lambda o: -misure[o.name][1])


def scaffali(k):
    """Dispone le celle ridotte di k. Torna le celle, o None se non ci stanno."""
    celle = {}
    x = y = alt = 0.0
    for o in ordine:
        w, h = misure[o.name]
        w *= k; h *= k
        if w + MARGINE > 1.0 or h + MARGINE > 1.0:
            return None
        if x + w + MARGINE > 1.0:
            x = 0.0
            y += alt + MARGINE
            alt = 0.0
        if y + h + MARGINE > 1.0:
            return None
        celle[o.name] = (x, y, w, h)
        x += w + MARGINE
        alt = max(alt, h)
    return celle


k = 1.35
celle = None
for _ in range(60):
    celle = scaffali(k)
    if celle:
        break
    k *= 0.94
if not celle:
    raise SystemExit('ERRORE: non sono riuscito a disporre le %d celle nell atlante.' % len(mesh_uv))

coperto = sum(w * h for (_, _, w, h) in celle.values())
for o in mesh_uv:
    x, y, w, h = celle[o.name]
    u0, v0, du, dv = forme[o.name]
    for d in o.data.uv_layers[0].data:
        d.uv[0] = x + (d.uv[0] - u0) / du * w
        d.uv[1] = y + (d.uv[1] - v0) / dv * h

# ─── E LE UV DEVONO STARE NEL QUADRATO UNITARIO
#
# Il cancello che mancava, e che avrebbe trovato il difetto dell'impacchettatore
# alla prima corsa invece che alla terza: un atlante che deborda non da' nessun
# errore, da' una cottura NERA, e la si scopre guardando il PNG due passi dopo.
u0 = v0 = 1e9
u1 = v1 = -1e9
for o in mesh_uv:
    for x in o.data.uv_layers[0].data:
        u0 = min(u0, x.uv[0]); u1 = max(u1, x.uv[0])
        v0 = min(v0, x.uv[1]); v1 = max(v1, x.uv[1])
dice('UV         %d celle, atlante coperto il %.1f%% (riduzione %.3f, margine %d px)'
     % (len(mesh_uv), 100 * coperto, k, MARGINE_PX))
dice('UV BBOX    u %.4f..%.4f   v %.4f..%.4f' % (u0, u1, v0, v1))
if u0 < -1e-3 or v0 < -1e-3 or u1 > 1.001 or v1 > 1.001:
    raise SystemExit('ATLANTE DEBORDANTE: u %.3f..%.3f, v %.3f..%.3f invece del quadrato '
                     'unitario. Ogni cottura scriverebbe fuori dall immagine e uscirebbe '
                     'NERA.' % (u0, u1, v0, v1))


# ── 5 · l'immagine, e un nodo attivo per materiale ────────────────────────
#
# `object.bake` scrive nel nodo immagine ATTIVO di ogni materiale coinvolto. Se
# a un materiale manca, la cottura non salta: lascia quelle isole vuote, e la
# mappa esce con buchi bianchi che sembrano luce.
img = bpy.data.images.new('interni_occlusione', width=LATO, height=LATO)
img.colorspace_settings.name = 'Non-Color'

nodi = []
for m in bpy.data.materials:
    # SOLO i materiali delle mesh srotolate: a una mesh senza UV non si aggancia
    # nessuna occlusione, o campionerebbe tutta la superficie sul texel (0,0)
    if m.name not in materiali_uv:
        continue
    nt = getattr(m, 'node_tree', None)
    if nt is None:
        continue
    tn = nt.nodes.new('ShaderNodeTexImage')
    tn.image = img
    tn.location = (-1100, 400)
    for n in nt.nodes:
        n.select = False
    tn.select = True
    nt.nodes.active = tn
    nodi.append((m, tn))
dice('MATERIALI  %d con un nodo di cottura attivo' % len(nodi))


# ── 6 · la cottura ────────────────────────────────────────────────────────
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = CAMPIONI
if sc.world is None:
    sc.world = bpy.data.worlds.new('Mondo')
# LA DISTANZA STA NEL MONDO, non nelle opzioni di cottura: e' la stessa
# `light_settings.distance` dell'occlusione di scena.
sc.world.light_settings.distance = DISTANZA_U
sc.render.bake.target = 'IMAGE_TEXTURES'
sc.render.bake.margin = MARGINE_PX
sc.render.bake.use_clear = True

bpy.ops.object.select_all(action='DESELECT')
for o in mesh_uv:
    o.select_set(True)
bpy.context.view_layer.objects.active = mesh_uv[0]
dice('           cottura in corso (CPU)...')
bpy.ops.object.bake(type='AO')

png = os.path.join(FUORI, 'interni-occlusione.png')
img.filepath_raw = png
img.file_format = 'PNG'
img.save()
if not os.path.exists(png) or os.path.getsize(png) < 1024:
    raise SystemExit('ERRORE: la mappa non e stata scritta su disco (%s).' % png)
dice('MAPPA      %s  %.0f KB' % (os.path.basename(png), os.path.getsize(png) / 1024))


# ── 7 · si MISURA, e tre cancelli la difendono ───────────────────────────
#
# Una cottura che riesce sempre non e' una cottura. I due modi di sbagliare la
# distanza sono opposti e tutti e due lasciano un PNG valido:
#
#   troppo grande   ogni angolo raccoglie mezzo scafo -> mappa quasi nera
#   troppo piccola  nessun raggio incontra niente     -> mappa quasi bianca
#
# I texel a zero secco sono lo SFONDO dell'atlante -- superficie che non c'e' --
# e contarli falserebbe tutto: si misura solo cio' che e' stato cotto.
px = list(img.pixels)
occ = px[0::4]
vivi = sorted(v for v in occ if v > 1e-6)
if not vivi:
    raise SystemExit('ERRORE: la mappa e completamente vuota: nessuna isola e stata cotta.')
mediana = vivi[len(vivi) // 2]
media = sum(vivi) / len(vivi)
scuri = sum(1 for v in vivi if v < 0.75) / float(len(vivi))
copertura = len(vivi) / float(len(occ))
dice('OCCLUSIONE mediana %.3f, media %.3f, texel sotto 0,75 il %.1f%%, atlante cotto il %.1f%%'
     % (mediana, media, 100 * scuri, 100 * copertura))

if mediana > 0.97:
    raise SystemExit('COTTURA PIATTA: mediana %.3f. La distanza di ricerca (%.2f m) e troppo '
                     'corta: nessun raggio incontra niente e la mappa non porta ombre di '
                     'contatto. E un PNG, non una cottura.' % (mediana, DISTANZA))
if mediana < 0.55:
    raise SystemExit('COTTURA BUIA: mediana %.3f. La distanza di ricerca (%.2f m) e troppo '
                     'lunga: ogni angolo raccoglie mezzo scafo e l occlusione diventa una '
                     'tinta, non un ombra.' % (mediana, DISTANZA))
# Il tetto della copertura NON e' una misura di qualita': un atlante non e' mai
# pieno, e quanto si riempie dipende da come lo srotolamento dispone le isole
# dentro le celle (a cubo il 12,2%, smart il 39,3%). Serve a prendere il caso in
# cui non si sia cotto quasi NIENTE, che vuol dire che le UV sono finite altrove.
if copertura < 0.08:
    raise SystemExit('ATLANTE QUASI VUOTO: solo il %.1f%% dei texel e superficie cotta. '
                     'Le UV non stanno dove la cottura le cerca.' % (100 * copertura))


# ── 8 · si aggancia, e in glTF l'occlusione NON passa dal Principled ──────
#
# L'esportatore la cerca in un gruppo di nodi chiamato ESATTAMENTE
# «glTF Material Output», ingresso «Occlusion». Se quel nome cambia, sparisce
# zitta -- e' scritto in `glb-macchine.py` e vale identico qui.
g = bpy.data.node_groups.get('glTF Material Output')
if g is None:
    g = bpy.data.node_groups.new('glTF Material Output', 'ShaderNodeTree')
    g.interface.new_socket('Occlusion', in_out='INPUT', socket_type='NodeSocketFloat')
    g.nodes.new('NodeGroupInput')

for m, tn in nodi:
    nt = m.node_tree
    tn.location = (-700, -400)
    gr = nt.nodes.new('ShaderNodeGroup')
    gr.node_tree = g
    gr.location = (-420, -400)
    nt.links.new(tn.outputs['Color'], gr.inputs['Occlusion'])
dice('AGGANCIO   occlusione su %d materiali' % len(nodi))


# ── 9 · si riesporta sopra lo stesso file ─────────────────────────────────
#
# Stesse opzioni del costruttore, `export_extras` compreso: i quattordici nomi e
# i loro extra sono un contratto che `comprimi-modello.mjs` verifica riaprendo
# il file d'uscita, e perderli qui vorrebbe dire scoprirlo due passi dopo.
bpy.ops.object.select_all(action='SELECT')
percorso = os.path.join(FUORI, 'interni.glb')
# ─── LE IMMAGINI ESCONO GIA' IN WEBP, e non e' un'ottimizzazione
#
# DIFETTO PRESO DAL VALIDATORE KHRONOS, con due errori su interni.glb:
#
#     IMAGE_NON_ENABLED_MIME_TYPE  'image/webp' richiede un'estensione
#     IMAGE_MIME_TYPE_INVALID      'image/webp' non combacia con 'image/png'
#
# La causa sta a valle: `alleggerisci-mappe.mjs` riscrive i BYTE dell'immagine
# in webp ma lascia il `mimeType` che trova, e non dichiara `EXT_texture_webp`.
# Sulle macchine non si vede perche' `glb-macchine.py` esporta gia' in webp e
# lo strumento sostituisce webp con webp; qui l'esportazione era PNG e il file
# usciva a dichiarare una cosa e a contenerne un'altra -- valido a occhio,
# rotto per il validatore.
#
# Si allinea qui invece di toccare lo strumento condiviso: `export_image_format`
# e' un parametro dell'esportazione, non un ripiego, e cosi' le due catene --
# macchine e interni -- passano dalla stessa porta.
bpy.ops.export_scene.gltf(filepath=percorso, export_format='GLB',
                          use_selection=True, export_apply=True,
                          export_yup=True, export_extras=True,
                          export_image_format='WEBP', export_image_quality=88)
dice('GLB        %.0f KB con la mappa dentro' % (os.path.getsize(percorso) / 1024))
