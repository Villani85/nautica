# -*- coding: utf-8 -*-
"""
INVENTARIO IN COORDINATE MONDO — fonda la scena world-space della traversata.

    blender -b -P riferimenti/blender/inventario.py

Importa ogni GLB di `public/modelli/` cosi' come arriva (nessuna scala
locale arbitraria: l'operatore di import gltf usa i suoi default), e per
ogni oggetto stampa nome, bounding box MONDO, dimensioni, matrice mondo (se
non identita'), vertici e facce. Alla fine verifica sui NUMERI la
conversione dichiarata dal progetto (1 unita' di scena = 2,5 m, cioe' 0,4
unita'/metro) contro l'altezza d'aria del salone misurata in
`riferimenti/salone/posa.json` (2,35 m) — perche' `src/scena/guscio.js` e
`src/scena/macchine.js` dichiarano che i GLB sono autorati in METRI e che la
scena li scala di 1/2,5 = 0,4 a runtime. Se il GLB grezzo non e' gia' in
metri, il conto qui sotto non torna e lo dice con i due numeri.
"""
import bpy
import os
import sys

REPO = os.path.abspath(os.path.join(os.path.dirname(bpy.data.filepath) or os.getcwd(), '..', '..'))
# bpy.data.filepath e' vuoto (nessun .blend aperto): risali dal percorso di
# questo script, che e' l'unico riferimento affidabile in modalita' -b -P.
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
MODELLI = os.path.join(REPO, 'public', 'modelli')

GLB_ATTESI = [
    'scafo.glb',
    'sovrastruttura.glb',
    'impianto.glb',
    'interni.glb',
    'propulsione.glb',
    'giroscopio.glb',
    'guscio-salone.glb',
]

METRI_PER_UNITA_DICHIARATO = 2.5
UNITA_PER_METRO_DICHIARATO = 1.0 / METRI_PER_UNITA_DICHIARATO  # 0.4

RIGA = '-' * 78


def stampa(*a):
    print(*a)
    sys.stdout.flush()


def pulisci_scena():
    """Svuota la scena corrente (oggetti, mesh, ecc.) senza toccare il file."""
    for coll in (bpy.data.objects,):
        for o in list(coll):
            bpy.data.objects.remove(o, do_unlink=True)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.images,
                  bpy.data.armatures, bpy.data.actions):
        for b in list(block):
            if b.users == 0:
                block.remove(b)


def bbox_mondo(obj):
    """Bounding box MONDO di un oggetto mesh: min/max x,y,z dagli 8 corner
    del bound_box locale trasformati per matrix_world."""
    mw = obj.matrix_world
    corners = [mw @ __import__('mathutils').Vector(c) for c in obj.bound_box]
    xs = [c.x for c in corners]
    ys = [c.y for c in corners]
    zs = [c.z for c in corners]
    return (min(xs), min(ys), min(zs)), (max(xs), max(ys), max(zs))


def matrice_identita(mw, eps=1e-6):
    from mathutils import Matrix
    I = Matrix.Identity(4)
    for i in range(4):
        for j in range(4):
            if abs(mw[i][j] - I[i][j]) > eps:
                return False
    return True


def conta_vert_facce(obj):
    if obj.type != 'MESH':
        return 0, 0
    m = obj.data
    return len(m.vertices), len(m.polygons)


stampa(RIGA)
stampa('BLENDER — VERSIONE ESATTA')
stampa(RIGA)
stampa('version_string:', bpy.app.version_string)
stampa('version tuple:', bpy.app.version)
stampa('build_hash:', bpy.app.build_hash.decode('utf-8', 'replace')
       if isinstance(bpy.app.build_hash, bytes) else bpy.app.build_hash)
stampa('build_date/build_time:', bpy.app.build_date.decode() if isinstance(bpy.app.build_date, bytes) else bpy.app.build_date,
       bpy.app.build_time.decode() if isinstance(bpy.app.build_time, bytes) else bpy.app.build_time)
stampa('build_branch:', bpy.app.build_branch.decode() if isinstance(bpy.app.build_branch, bytes) else bpy.app.build_branch)
stampa('')

risultati = {}  # nome_file -> lista di dict per oggetto

for nome_file in GLB_ATTESI:
    percorso = os.path.join(MODELLI, nome_file)
    stampa(RIGA)
    stampa('GLB:', nome_file, '->', percorso)
    stampa(RIGA)

    if not os.path.isfile(percorso):
        stampa('ERRORE: file non trovato su disco.')
        risultati[nome_file] = None
        stampa('')
        continue

    dimensione_bytes = os.path.getsize(percorso)
    stampa('dimensione file (byte):', dimensione_bytes)

    pulisci_scena()

    try:
        bpy.ops.import_scene.gltf(filepath=percorso)
    except Exception as e:
        stampa('ERRORE IMPORT:', repr(e))
        risultati[nome_file] = None
        stampa('')
        continue

    importati = list(bpy.data.objects)
    if not importati:
        stampa('ERRORE: import riuscito ma zero oggetti in scena.')
        risultati[nome_file] = None
        stampa('')
        continue

    voci = []
    agg_min = [float('inf')] * 3
    agg_max = [float('-inf')] * 3
    tot_v, tot_f = 0, 0

    for obj in importati:
        stampa('  oggetto:', obj.name, '  tipo:', obj.type)
        mw = obj.matrix_world
        if not matrice_identita(mw):
            stampa('    matrice_mondo (riga per riga):')
            for r in range(4):
                stampa('     ', [round(mw[r][c], 6) for c in range(4)])
        else:
            stampa('    matrice_mondo: identita')

        v, f = conta_vert_facce(obj)
        stampa('    vertici:', v, '  facce:', f)
        tot_v += v
        tot_f += f

        if obj.type == 'MESH' and len(obj.data.vertices) > 0:
            mn, mx = bbox_mondo(obj)
            dim = (mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2])
            stampa('    bbox mondo min (x,y,z):', tuple(round(c, 6) for c in mn))
            stampa('    bbox mondo max (x,y,z):', tuple(round(c, 6) for c in mx))
            stampa('    dimensioni bbox mondo (dx,dy,dz):', tuple(round(c, 6) for c in dim))
            stampa('    obj.dimensions (Blender):', tuple(round(c, 6) for c in obj.dimensions))
            for i in range(3):
                agg_min[i] = min(agg_min[i], mn[i])
                agg_max[i] = max(agg_max[i], mx[i])
            voci.append({'nome': obj.name, 'min': mn, 'max': mx, 'dim': dim, 'v': v, 'f': f})
        else:
            stampa('    (nessuna geometria propria: empty/vuoto, bbox non applicabile)')

    stampa('')
    stampa('  TOTALE FILE', nome_file, ':')
    stampa('    oggetti importati:', len(importati))
    stampa('    vertici totali:', tot_v, '  facce totali:', tot_f)
    if voci:
        agg_dim = (agg_max[0] - agg_min[0], agg_max[1] - agg_min[1], agg_max[2] - agg_min[2])
        stampa('    bbox mondo AGGREGATA min:', tuple(round(c, 6) for c in agg_min))
        stampa('    bbox mondo AGGREGATA max:', tuple(round(c, 6) for c in agg_max))
        stampa('    dimensioni bbox AGGREGATA (dx,dy,dz):', tuple(round(c, 6) for c in agg_dim))
        risultati[nome_file] = {'min': agg_min, 'max': agg_max, 'dim': agg_dim,
                                 'tot_v': tot_v, 'tot_f': tot_f, 'voci': voci}
    else:
        stampa('    nessun oggetto con geometria: bbox aggregata non disponibile.')
        risultati[nome_file] = {'min': None, 'max': None, 'dim': None,
                                 'tot_v': tot_v, 'tot_f': tot_f, 'voci': []}
    stampa('')

# ---------------------------------------------------------------------------
# VERIFICA SUI NUMERI: 1 unita' di scena = 2,5 m dichiarato dal progetto
# (src/scafo/ordinate.js:19, src/scena/guscio.js:68, src/scena/macchine.js:31).
# I GLB sono dichiarati AUTORATI IN METRI, e la scena li scala di 1/2,5=0,4
# a runtime. Se e' vero, il GLB grezzo importato qui (nessuna scala nostra)
# deve gia' mostrare le grandezze note IN METRI, senza bisogno di applicare
# alcun fattore.
# ---------------------------------------------------------------------------
stampa(RIGA)
stampa('VERIFICA SCALA — 1 unita di scena = 2,5 m dichiarato (0,4 unita/metro)')
stampa(RIGA)

ALTEZZA_ARIA_DICHIARATA_M = 2.35  # riferimenti/salone/posa.json: dichiarato.altezza_aria_m

r = risultati.get('guscio-salone.glb')
if r and r['voci']:
    # ATTENZIONE ASSI: glTF e' Y-up, Blender e' Z-up. L'importer di Blender
    # ruota gli assi in import: la Y "in alto" di posa.json diventa la Z del
    # bbox mondo qui in Blender. Non e' un'assunzione: si legge sui numeri,
    # vedi 'dz' dei pannelli pieno-altezza del guscio qui sotto.
    # Prendo la dz PIU GRANDE fra i pannelli del guscio: e' il pannello che
    # attraversa tutta l'aria pavimento-soffitto (i pannelli piu' piccoli sono
    # i riquadri ritagliati intorno al vano, e non coprono l'intera altezza).
    altezza_glb = max(v['dim'][2] for v in r['voci'])
    stampa('guscio-salone.glb — dz (asse Z Blender = Y "in alto" di posa.json dopo la rotazione Y-up->Z-up) per oggetto:')
    for v in r['voci']:
        stampa('   ', v['nome'], 'dz =', round(v['dim'][2], 6))
    stampa('guscio-salone.glb — MASSIMA dz fra i pannelli (altezza piena aria, grezza come importata):', round(altezza_glb, 6), 'unita Blender')
    stampa('altezza aria dichiarata in riferimenti/salone/posa.json:', ALTEZZA_ARIA_DICHIARATA_M, 'm')
    diff = altezza_glb - ALTEZZA_ARIA_DICHIARATA_M
    diff_pc = (diff / ALTEZZA_ARIA_DICHIARATA_M) * 100.0
    stampa('differenza (glb_grezzo - dichiarato_m):', round(diff, 6), '  (', round(diff_pc, 3), '% )')
    stampa('')
    stampa('INTERPRETAZIONE: se il GLB e autorato in METRI (come dichiarano')
    stampa('src/scena/guscio.js e src/scena/macchine.js), l altezza grezza qui')
    stampa('sopra deve combaciare con 2,35 m SENZA applicare alcun fattore 0,4 o 2,5.')
    if abs(diff_pc) < 1.0:
        stampa('ESITO: TORNA. Il GLB grezzo e gia in metri (errore', round(diff_pc, 3), '%).')
    else:
        stampa('ESITO: NON TORNA a metri 1:1. Provo il fattore dichiarato 0,4 unita/metro:')
        convertito_a_metri = altezza_glb * METRI_PER_UNITA_DICHIARATO
        diff2 = convertito_a_metri - ALTEZZA_ARIA_DICHIARATA_M
        diff2_pc = (diff2 / ALTEZZA_ARIA_DICHIARATA_M) * 100.0
        stampa('  se il glb fosse in "unita di scena" (0,4/m), altezza in metri =',
               round(altezza_glb, 6), '*', METRI_PER_UNITA_DICHIARATO, '=', round(convertito_a_metri, 6), 'm')
        stampa('  differenza contro 2,35 m:', round(diff2, 6), '  (', round(diff2_pc, 3), '% )')
        if abs(diff2_pc) < 1.0:
            stampa('ESITO: il GLB e in "unita di scena", non in metri: serve applicare 2,5 per avere metri.')
        else:
            stampa('ESITO: NON TORNA in nessuna delle due ipotesi (ne 1:1 metri, ne 0,4/m). Numeri sopra.')
else:
    stampa('guscio-salone.glb non importato o senza geometria: verifica non eseguibile su questo file.')
    stampa('(vedi sezione GLB: guscio-salone.glb qui sopra per l errore vero)')

stampa('')
r2 = risultati.get('scafo.glb')
if r2 and r2['dim'] is not None:
    lung = r2['dim'][2]  # ordinate.js: scafo lungo Z
    stampa('scafo.glb — lunghezza bbox mondo asse Z (grezzo, come importato):', round(lung, 6))
    stampa('lunghezza scafo dichiarata (src/scafo/ordinate.js: PRUA_Z=-8..POPPA_Z=8, 16 unita * 2,5 m):', 16 * METRI_PER_UNITA_DICHIARATO, 'm')
else:
    stampa('scafo.glb: non presente/non importato in public/modelli — nessun GLB dello scafo da verificare qui.')
    stampa('(lo scafo in questo progetto e procedurale in src/scafo/ordinate.js, non un GLB esportato)')

stampa('')
stampa(RIGA)
stampa('RIEPILOGO CONTEGGI PER FILE (vertici / facce, oggetti importati)')
stampa(RIGA)
for nome_file in GLB_ATTESI:
    r = risultati.get(nome_file)
    if r is None:
        stampa(nome_file, ': FALLITO (vedi errore sopra)')
    else:
        stampa(nome_file, ': oggetti=', len(r['voci']) if r['voci'] is not None else 0,
               ' vertici=', r['tot_v'], ' facce=', r['tot_f'])

stampa(RIGA)
stampa('FINE INVENTARIO')
stampa(RIGA)
