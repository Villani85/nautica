# -*- coding: utf-8 -*-
"""
CORRIDOIO E SCALA — il tratto fisico dal locale tecnico al salone.

    blender -b -P riferimenti/blender/parts/corridor.py

─── COS'E' E COSA NON E'

Un greybox in METRI: pavimento, soffitto, due pareti laterali, i gradini.
Niente arredamento, niente corrimano, niente illuminazione. Il compito e'
`WORLDSPACE-CONTRATTO.md` §3: collegare **fisicamente** il locale tecnico
(agente A3, `parts/mechanism_bay.py`) al salone (agente A5, `parts/saloon.py`)
in modo che la camera possa attraversare il passaggio senza vedere un bordo
del mondo.

Non posso coordinarmi con A3 o A5: lavorano in questo momento su file che mi
sono vietati. Quindi questo script **dichiara le proprie due aperture** come
parametri, con valori di partenza ragionati — non misurati, perche' non esiste
una fotografia o un rilievo del corridoio come esiste per il salone
(`riferimenti/salone/posa.json`). L'integratore sposta/ruota questo pezzo (o
gli altri due) finche' le aperture combaciano.

─── IL SISTEMA DI ASSI LOCALE

Come `guscio-salone.py`: si costruisce nel proprio sistema locale, non nel
world-space finale (quello lo decide l'integratore con l'assemblaggio).

    X   lungo il corridoio, verso il salone. X=0 e' la soglia sul locale
        tecnico, X=LUNGHEZZA_TOTALE e' la soglia sul salone.
    Y   in alto. Y=0 e' il pavimento all'estremita' del locale tecnico.
    Z   trasversale, larghezza del corridoio. Z=0 e' l'asse di mezzeria.

─── LA SCALA: L'UNICA COSA CHE IL FILMATO ATTUALE MOSTRA GIA' BENE

`docs/13-ATTO-DUE.md` etc. e il filmato corrente (`public/filmati/
traversata.mp4`, oggi ancora una texture video e non geometria — vedi
`src/scena/traversata.js`) portano la camera da "sala macchine" a "scala" a
"corridoio" a "salone". Una scala con proporzioni sbagliate si vede a colpo
d'occhio: quindi alzata e pedata sono i due numeri presi da un range edilizio
reale (17-18 cm di alzata, 28-30 cm di pedata), non inventati a caso — vedi
`ALZATA` e `PEDATA` sotto, con la verifica della formula del passo.

─── COSA E' INVENTATO QUI, DICHIARATO UNO PER UNO

Non esiste una misura fotografica del corridoio (a differenza del salone).
Ogni numero sotto che non discende da un vincolo geometrico e' quindi
**inventato**, e lo dichiaro dove lo definisco:

    LARGHEZZA_CORRIDOIO   0,85 m   — passaggio di servizio su imbarcazione,
                                     ordine di grandezza tipico 0,70-0,90 m
    ALTEZZA_LIBERA        2,00 m   — vano di servizio, un po' meno generoso
                                     dei 2,35 m MISURATI nel salone (quelli
                                     sono un ambiente di rappresentanza)
    RISALITA_TOTALE       2,10 m   — 12 gradini x 0,175 m; nessuna misura
                                     lega il piano del locale tecnico a quello
                                     del salone. E' un ordine di grandezza
                                     plausibile per un dislivello di ponte
    PIANO_INFERIORE       1,00 m   — pianerottolo davanti alla soglia tecnica,
                                     minimo ergonomico per aprire una porta
    PIANO_SUPERIORE       1,00 m   — pianerottolo davanti alla soglia salone
    SPESSORE_PARETE       0,12 m   — riuso lo stesso spessore di
                                     `guscio-salone.py` (SPESSORE_MURATA),
                                     per coerenza fra i pezzi del repo
    SPESSORE_SOLAIO       0,08 m   — idem, riuso da `guscio-salone.py`

Nessuno di questi e' spacciato per una misura: sono scelte, motivate, e
il cancello del progetto (`WORLDSPACE-CONTRATTO.md`) chiede esattamente
questo — un numero non misurato va nominato come tale.

─── LE DUE APERTURE

Sono l'interfaccia con A3 e A5. Il corridoio non costruisce pareti di testata
alle due estremita' (X=0 e X=LUNGHEZZA_TOTALE): quelle sezioni restano aperte
apposta, perche' sono il punto di saldatura con gli altri due pezzi. Quello
che dichiaro e' il rettangolo libero (pavimento/soffitto/larghezza) che
l'integratore deve far combaciare con l'apertura corrispondente degli altri
due script.
"""
import bpy
import bmesh
import math
import os
import sys

QUI = os.path.dirname(os.path.abspath(__file__))
BLENDER_DIR = os.path.abspath(os.path.join(QUI, '..'))
if BLENDER_DIR not in sys.path:
    sys.path.insert(0, BLENDER_DIR)
import world_root  # il frame comune: origine, assi, collezioni, cuciture

USCITE = os.path.join(BLENDER_DIR, 'uscite')
os.makedirs(USCITE, exist_ok=True)

# ─── PARAMETRI, tutti in metri, tutti dichiarati qui in cima ───────────────

# Sezione libera del corridoio (misure di servizio, INVENTATE — vedi sopra).
LARGHEZZA_CORRIDOIO = 0.85
ALTEZZA_LIBERA = 2.00

# La scala: alzata e pedata dentro il range chiesto (17-18 / 28-30 cm).
ALZATA = 0.175
PEDATA = 0.29
N_GRADINI = 12
RISALITA_TOTALE = round(ALZATA * N_GRADINI, 4)  # 2.10 m

# Pianerottoli piani alle due estremita' (INVENTATI, minimo ergonomico).
PIANO_INFERIORE = 1.00
PIANO_SUPERIORE = 1.00

# Spessori strutturali, RIUSATI da guscio-salone.py per coerenza di repo.
SPESSORE_PARETE = 0.12
SPESSORE_SOLAIO = 0.08

# Geometria derivata (non un parametro libero: discende da quanto sopra).
CORSA_SCALA = round(PEDATA * N_GRADINI, 4)
X_INIZIO_SCALA = PIANO_INFERIORE
X_FINE_SCALA = round(X_INIZIO_SCALA + CORSA_SCALA, 4)
LUNGHEZZA_TOTALE = round(X_FINE_SCALA + PIANO_SUPERIORE, 4)

Y_TOP = round(RISALITA_TOTALE + ALTEZZA_LIBERA, 4)  # soffitto, costante in X
L2 = LARGHEZZA_CORRIDOIO / 2.0

# ─── LE DUE APERTURE — interfaccia dichiarata per l'integratore ───────────
#
# Ognuna e' il rettangolo LIBERO (non il muro: qui non c'e' muro di testata)
# alla rispettiva estremita' del corridoio, nel sistema di assi locale sopra.
#
# Accanto alle quote LOCALI, ciascuna apertura porta anche le proprie
# coordinate ASSOLUTE nel mondo: si applica la traslazione dichiarata in
# `world_root.COLLOCAZIONI['STAIR_CORRIDOR']['traslazione_m']`, presa da li'
# e non ricopiata — due copie dello stesso numero sono due numeri che un
# giorno divergono (world_root.py, sezione 2).
TX_MONDO, TY_MONDO, TZ_MONDO = world_root.traslazione('STAIR_CORRIDOR', 'gltf')

APERTURA_LOCALE_TECNICO = {
    'lato': 'locale_tecnico',
    'x': 0.0,
    'y_pavimento': 0.0,
    'y_soffitto': ALTEZZA_LIBERA,
    'z0': -L2,
    'z1': L2,
    'normale_corridoio': '+X',  # il corridoio si sviluppa verso +X da qui
    'x_mondo': round(0.0 + TX_MONDO, 4),
    'y_pavimento_mondo': round(0.0 + TY_MONDO, 4),
    'y_soffitto_mondo': round(ALTEZZA_LIBERA + TY_MONDO, 4),
    'z0_mondo': round(-L2 + TZ_MONDO, 4),
    'z1_mondo': round(L2 + TZ_MONDO, 4),
    'nota': ('stato CONFLITTO — cucitura "porta_locale_tecnico" in '
             'world_root.CUCITURE: qui larghezza x altezza = 0.85 x 2.00 m, '
             'mechanism_bay.py dichiara 0.70 x 1.90 m. La porta risulta 15 cm '
             'piu\' stretta e 10 cm piu\' bassa dell\'apertura che il '
             'corridoio si aspetta. NON risolto qui: decide il committente '
             '(vedi world_root.CUCITURE["porta_locale_tecnico"]["decide"]).'),
}
APERTURA_SALONE = {
    'lato': 'salone',
    'x': LUNGHEZZA_TOTALE,
    'y_pavimento': RISALITA_TOTALE,
    'y_soffitto': RISALITA_TOTALE + ALTEZZA_LIBERA,
    'z0': -L2,
    'z1': L2,
    'normale_corridoio': '-X',  # il corridoio si sviluppa verso -X da qui
    'x_mondo': round(LUNGHEZZA_TOTALE + TX_MONDO, 4),
    'y_pavimento_mondo': round(RISALITA_TOTALE + TY_MONDO, 4),
    'y_soffitto_mondo': round(RISALITA_TOTALE + ALTEZZA_LIBERA + TY_MONDO, 4),
    'z0_mondo': round(-L2 + TZ_MONDO, 4),
    'z1_mondo': round(L2 + TZ_MONDO, 4),
    'nota': ('stato DERIVATO — cucitura "aperture_alte" in '
             'world_root.CUCITURE: la posizione x = LUNGHEZZA_TOTALE = 5.480 m '
             'deriva da 4.48 + 1.00 (corridor.py riga 113); la traslazione al '
             'mondo la riporta esattamente sull\'origine (x_mondo = 0.0).'),
}


def verifica_cuciture_mondo():
    """
    Dichiara le proprie quote alla cucitura 'porta_locale_tecnico' di
    world_root.py. NON e' chiamata all'esecuzione standalone dello script
    (sotto, protetta da NAUTICA_VERIFICA_CUCITURE): la cucitura e' oggi in
    CONFLITTO, quindi `world_root.verifica_cucitura` alza `SystemExit` --
    corretto quando lo richiama l'assemblatore che mette insieme i pezzi, non
    quando si esegue questo file da solo per generare il proprio GLB.
    """
    return world_root.verifica_cucitura(
        'porta_locale_tecnico', 'corridor.py',
        larghezza_m=LARGHEZZA_CORRIDOIO, altezza_m=ALTEZZA_LIBERA)


def pulisci():
    bpy.ops.wm.read_homefile(use_empty=True)


def materiale(nome, colore, ruvidita=0.55, metallo=0.0):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*colore, 1.0)
    p.inputs['Roughness'].default_value = ruvidita
    p.inputs['Metallic'].default_value = metallo
    return m


def scatola(nome, x0, x1, y0, y1, z0, z1, mat, collezione):
    """una scatola d'asse, in metri, con nome stabile — stile guscio-salone.py"""
    me = bpy.data.meshes.new(nome)
    ob = bpy.data.objects.new(nome, me)
    collezione.objects.link(ob)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bm.to_mesh(me)
    bm.free()
    ob.scale = ((x1 - x0), (y1 - y0), (z1 - z0))
    ob.location = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    ob.select_set(False)
    me.materials.append(mat)
    return ob


world_root.pulisci_se_solo(pulisci)

# ─── le due collezioni chieste dal contratto, dal frame comune world_root ──
WORLD_ROOT = world_root.radice()
STAIR_CORRIDOR = world_root.collezione('STAIR_CORRIDOR', WORLD_ROOT)

MAT_PAVIMENTO = materiale('CORRIDOIO_pavimento', (0.30, 0.30, 0.32), 0.70)
MAT_PARETE = materiale('CORRIDOIO_parete', (0.62, 0.60, 0.56), 0.75)
MAT_SOFFITTO = materiale('CORRIDOIO_soffitto', (0.55, 0.55, 0.57), 0.60)
MAT_GRADINO = materiale('CORRIDOIO_gradino', (0.34, 0.32, 0.30), 0.55)

radice = bpy.data.objects.new('STAIR_CORRIDOR_root', None)
STAIR_CORRIDOR.objects.link(radice)

pezzi = []

# --- pianerottolo inferiore (lato locale tecnico) -----------------------
pezzi.append(scatola('CORRIDOIO_piano_basso',
                     0.0, X_INIZIO_SCALA,
                     -SPESSORE_SOLAIO, 0.0,
                     -L2, L2, MAT_PAVIMENTO, STAIR_CORRIDOR))

# --- la scala: N gradini impilati, alzata e pedata dichiarate sopra -----
#
# Ogni gradino e' una scatola piena dalla base del solaio fino alla propria
# pedata: impilate, danno il profilo a scalino senza booleana (stesso motivo
# di guscio-salone.py per il vano — niente n-gon lasciate da un boolean).
for i in range(N_GRADINI):
    x0 = round(X_INIZIO_SCALA + i * PEDATA, 4)
    x1 = round(X_INIZIO_SCALA + (i + 1) * PEDATA, 4)
    y1 = round((i + 1) * ALZATA, 4)
    pezzi.append(scatola(f'CORRIDOIO_gradino_{i+1:02d}',
                         x0, x1, -SPESSORE_SOLAIO, y1,
                         -L2, L2, MAT_GRADINO, STAIR_CORRIDOR))

# --- pianerottolo superiore (lato salone) --------------------------------
pezzi.append(scatola('CORRIDOIO_piano_alto',
                     X_FINE_SCALA, LUNGHEZZA_TOTALE,
                     RISALITA_TOTALE - SPESSORE_SOLAIO, RISALITA_TOTALE,
                     -L2, L2, MAT_PAVIMENTO, STAIR_CORRIDOR))

# --- soffitto, piatto per tutta la lunghezza -----------------------------
#
# Semplificazione dichiarata: un vero controsoffitto di scala segue la
# rampa, qui resta piano a Y_TOP su tutta la corsa. Non e' un errore di
# misura, e' una scelta greybox — garantisce ALTEZZA_LIBERA come minimo
# ovunque (di fatto e' abbondante sopra il pianerottolo basso, esatto sopra
# quello alto) invece di rischiare un punto sotto quota.
pezzi.append(scatola('CORRIDOIO_soffitto',
                     0.0, LUNGHEZZA_TOTALE,
                     Y_TOP, Y_TOP + SPESSORE_SOLAIO,
                     -L2, L2, MAT_SOFFITTO, STAIR_CORRIDOR))

# --- due pareti laterali, verticali per tutta la lunghezza ---------------
pezzi.append(scatola('CORRIDOIO_parete_sinistra',
                     0.0, LUNGHEZZA_TOTALE,
                     -SPESSORE_SOLAIO, Y_TOP + SPESSORE_SOLAIO,
                     -L2 - SPESSORE_PARETE, -L2, MAT_PARETE, STAIR_CORRIDOR))
pezzi.append(scatola('CORRIDOIO_parete_destra',
                     0.0, LUNGHEZZA_TOTALE,
                     -SPESSORE_SOLAIO, Y_TOP + SPESSORE_SOLAIO,
                     L2, L2 + SPESSORE_PARETE, MAT_PARETE, STAIR_CORRIDOR))

for p in pezzi:
    p.parent = radice

# --- un GLB in metri, con i nomi stabili ---------------------------------
glb = os.path.join(USCITE, 'corridor.glb')
bpy.ops.object.select_all(action='DESELECT')
radice.select_set(True)
for p in pezzi:
    p.select_set(True)
bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB',
                          use_selection=True, export_yup=True,
                          export_apply=True)
peso = os.path.getsize(glb)

# --- bounding box mondo, misurata sui pezzi veri (non dichiarata) -------
bb_min = [math.inf, math.inf, math.inf]
bb_max = [-math.inf, -math.inf, -math.inf]
for p in pezzi:
    for corner in p.bound_box:
        wc = p.matrix_world @ __import__('mathutils').Vector(corner)
        for k in range(3):
            bb_min[k] = min(bb_min[k], wc[k])
            bb_max[k] = max(bb_max[k], wc[k])

print('')
print('  CORRIDOIO E SCALA — locale tecnico -> salone')
print('  ' + '-' * 70)
print(f'  pezzi                 {len(pezzi)}  ({N_GRADINI} gradini + pianerottoli + guscio)')
print(f'  lunghezza totale X    {LUNGHEZZA_TOTALE:.3f} m')
print(f'  larghezza libera Z    {LARGHEZZA_CORRIDOIO:.3f} m  (INVENTATA)')
print(f'  altezza libera Y      {ALTEZZA_LIBERA:.3f} m  (INVENTATA)')
print(f'  risalita totale Y     {RISALITA_TOTALE:.3f} m  (INVENTATA, = {N_GRADINI} x alzata)')
print(f'  ALZATA usata          {ALZATA*100:.1f} cm   (range chiesto 17-18)')
print(f'  PEDATA usata          {PEDATA*100:.1f} cm   (range chiesto 28-30)')
print(f'  formula del passo     2*alzata+pedata = {2*ALZATA*100+PEDATA*100:.1f} cm  (ideale ~62-64)')
print('')
print(f'  bbox mondo min        ({bb_min[0]:.4f}, {bb_min[1]:.4f}, {bb_min[2]:.4f})')
print(f'  bbox mondo max        ({bb_max[0]:.4f}, {bb_max[1]:.4f}, {bb_max[2]:.4f})')
print(f'  bbox mondo dimensioni ({bb_max[0]-bb_min[0]:.4f}, {bb_max[1]-bb_min[1]:.4f}, {bb_max[2]-bb_min[2]:.4f})')
print('')
print('  APERTURA lato locale tecnico (X=0, verso -X esce dal corridoio):')
a = APERTURA_LOCALE_TECNICO
print(f'    locale   x={a["x"]:.3f}  y {a["y_pavimento"]:.3f}..{a["y_soffitto"]:.3f}  z {a["z0"]:.3f}..{a["z1"]:.3f}')
print(f'    mondo    x={a["x_mondo"]:.3f}  y {a["y_pavimento_mondo"]:.3f}..{a["y_soffitto_mondo"]:.3f}  z {a["z0_mondo"]:.3f}..{a["z1_mondo"]:.3f}')
print(f'    {a["nota"]}')
print('  APERTURA lato salone (X={:.3f}, verso +X esce dal corridoio):'.format(LUNGHEZZA_TOTALE))
a = APERTURA_SALONE
print(f'    locale   x={a["x"]:.3f}  y {a["y_pavimento"]:.3f}..{a["y_soffitto"]:.3f}  z {a["z0"]:.3f}..{a["z1"]:.3f}')
print(f'    mondo    x={a["x_mondo"]:.3f}  y {a["y_pavimento_mondo"]:.3f}..{a["y_soffitto_mondo"]:.3f}  z {a["z0_mondo"]:.3f}..{a["z1_mondo"]:.3f}')
print(f'    {a["nota"]}')
print('')
print(f'  GLB                   {glb}   {peso} byte')
print('')

# ─── verifica della cucitura verso il locale tecnico, protetta da un flag ──
#
# NON gira in questa esecuzione standalone: la cucitura e' in CONFLITTO e
# world_root.verifica_cucitura alza SystemExit di proposito (registra il
# conflitto, non lo risolve). Chi assembla i pezzi la chiama esplicitamente,
# oppure si puo' provare qui con NAUTICA_VERIFICA_CUCITURE=1.
if os.environ.get('NAUTICA_VERIFICA_CUCITURE'):
    verifica_cuciture_mondo()
