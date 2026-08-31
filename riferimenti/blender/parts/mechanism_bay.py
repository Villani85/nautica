# -*- coding: utf-8 -*-
"""
LOCALE TECNICO — locale pinne + sala macchine, primo tratto della traversata.

    blender -b -P riferimenti/blender/parts/mechanism_bay.py

Attivita' A3 del Piano.md. Greybox: volumi e aperture giuste, non arredamento.
Costruisce due collezioni del contratto (`riferimenti/WORLDSPACE-CONTRATTO.md`):
MECHANISM_BAY (locale pinne) e ENGINE_ROOM (sala macchine), in fila lungo un
asse solo, con un varco fra le due e un'apertura finale verso il corridoio/
scala che un agente futuro (A4, `corridor.py`) deve poter agganciare da un
numero, non da una stima a occhio.

─── PERCHE' QUESTO SCRIPT NON IMPORTA impianto.glb / propulsione.glb

Il compito e' greybox: il vano che ospitera' il meccanismo, non il meccanismo.
`riferimenti/blender/prove/00-inventario.txt` (misurato da A2 poche ore prima
di questo script) da' pero' gli UNICI numeri reali disponibili sull'ingombro
del gruppo pinna e del gruppo propulsione, e questo script li usa come
RIFERIMENTO DI TAGLIA per dimensionare i vani — non come geometria importata,
e non come certezza sull'orientamento: quale dei tre assi del meccanismo
diventera' "in alto" una volta importato nel master non e' misurato qui, e lo
script lo dichiara invece di indovinarlo (vedi VANO_ATTUATORE_* sotto).

─── LA CONVENZIONE DI ASSI, SCELTA QUI, NON MISURATA

Diversamente da `guscio-salone.py` (che eredita gli assi di `posa.json`,
fissati da una fotografia), questo locale non ha una posa sorgente: e' pura
costruzione. La convenzione:

    X   direzione della traversata: 0,0 al fondo chiuso del locale pinne,
        crescente verso la sala macchine e poi verso il passaggio al corridoio
    Y   in alto: 0,0 = pagliolo (piano di calpestio)
    Z   baglio (larghezza): 0,0 = mezzeria, simmetrico

Y-up per coerenza con l'export glTF (`export_yup=True`, come in
`guscio-salone.py`) e con `THREE.Scene` a valle. Un master che importa questo
pezzo puo' traslare/ruotare il risultato in blocco: qui dentro l'origine e il
verso sono dichiarati, non impliciti.

─── TUTTO CIO' CHE E' INVENTATO, DICHIARATO QUI E IN NESSUN ALTRO POSTO

Non c'e' una `posa.json` per il locale tecnico: nessuna fotografia, nessun
disegno d'armo consultabile da questo agente entro il limite di 20 minuti.
Ogni numero sotto che non cita 00-inventario.txt e' INVENTATO per essere
plausibile e verificabile a vista, non misurato:

    BEAM (larghezza libera)      3,2 m   — locale macchine di un'imbarcazione
                                            medio-grande; piu' largo del piu'
                                            grande ingombro laterale misurato
                                            in questo lotto (2,2 m, impianto)
    ALTEZZA_LIBERA               3,0 m   — pagliolo-soffitto; da' 0,1 m di
                                            franco sopra il vano attuatore
                                            (2,9 m, vedi sotto) e supera
                                            l'altezza pinna misurata (2,6 m)
    SPESSORE_PARATIA             0,10 m  — paratia stagna in lega, plausibile
    SPESSORE_PAGLIOLO/SOFFITTO   0,06 / 0,05 m — stessa scala di guscio-salone.py
    MARGINE_SERVIZIO_VANO        0,30 m per asse — spazio per mano d'opera
                                            attorno al meccanismo, non misurato
    CORRIDOIO_SERVIZIO (aisle)   0,5-0,6 m   — larghezza minima di passaggio
    PORTA (larg. x alt.)         0,70 x 1,90 m — porta stagna di dimensione
                                            corrente, non la porta reale di
                                            questo scafo (non misurata da nessuno)
    LUNGHEZZA SALA MACCHINE      motore→astuccio in propulsione.glb misura
                                  2,6 - (-0,675) = 3,275 m fra i pivot (vedi
                                  00-inventario.txt); + 1,0 m di corridoio di
                                  servizio fore/aft, INVENTATO, = lunghezza vano

Un cancello futuro che leggesse questi numeri come misure sbaglierebbe: sono
scelte, fatte per essere sostituite quando arrivera' un disegno vero.
"""
import bpy
import bmesh
import os
from mathutils import Vector

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.abspath(os.path.join(QUI, '..', '..', '..'))
USCITE = os.path.abspath(os.path.join(QUI, '..', 'uscite'))
os.makedirs(USCITE, exist_ok=True)

# --- costanti dichiarate, vedi intestazione per la provenienza di ognuna ---

BEAM = 3.2
Z0, Z1 = -BEAM / 2.0, BEAM / 2.0

PAGLIOLO_Y = 0.0
ALTEZZA_LIBERA = 3.0
SOFFITTO_Y = PAGLIOLO_Y + ALTEZZA_LIBERA

SP_PARATIA = 0.10
SP_PAGLIOLO = 0.06
SP_SOFFITTO = 0.05

# vano dell'attuatore — RIFERIMENTO DI TAGLIA da impianto.glb, bbox aggregata
# misurata in 00-inventario.txt: dx=2.547575  dy=2.600000  dz=2.200073
# (l'asse "dy" li' e' quello che il reimport chiama in alto: non e' garantito
# che coincida con l'alto reale del meccanismo. Per questo il vano qui e' un
# CUBO DI SICUREZZA, piu' grande su ognuno dei tre assi misurati, non un
# incasso a misura di un orientamento assunto.)
IMPIANTO_DX, IMPIANTO_DY, IMPIANTO_DZ = 2.547575, 2.600000, 2.200073
MARGINE_SERVIZIO_VANO = 0.30
VANO_ATT_DX = IMPIANTO_DX + 2 * MARGINE_SERVIZIO_VANO   # 3.147575
VANO_ATT_DY = IMPIANTO_DY + 2 * MARGINE_SERVIZIO_VANO   # 3.2 -- vedi nota sotto
VANO_ATT_DZ = IMPIANTO_DZ + 2 * MARGINE_SERVIZIO_VANO   # 2.800073
# ALTEZZA_LIBERA (3,0) e' minore di VANO_ATT_DY (3,2): il vano non deve quindi
# arrivare al soffitto pieno margine su entrambi i lati verticali, solo
# contenere l'ingombro reale (2,6) col franco library. Si usa min() per non
# sforare mai il locale: il vano poggia sul pagliolo e sale fino al minimo fra
# "ingombro + margine" e "sotto il soffitto con 0,1 m di franco".
VANO_ATT_ALTO = min(VANO_ATT_DY, ALTEZZA_LIBERA - 0.10)

# corridoio di servizio davanti/dietro il vano attuatore, dentro il locale pinne
AISLE_PRUA = 0.5
AISLE_MEDIANA = 0.6

# --- sala macchine: riferimento da propulsione.glb --------------------------
# pivot motore y=2.6, pivot astuccio y=-0.675 (00-inventario.txt): la parte
# del treno di propulsione che sta DENTRO lo scafo, dal motore al tubo
# astuccio, prima che l'albero esca verso l'elica esterna.
SALA_MACCHINE_UTILE = 2.6 - (-0.675)   # 3.275 m
AISLE_MACCHINE = 1.0                    # 0,5 m fore + 0,5 m aft, INVENTATO
LUNGHEZZA_SALA_MACCHINE = SALA_MACCHINE_UTILE + AISLE_MACCHINE

# --- porta stagna / varco -----------------------------------------------
PORTA_LARG = 0.70
PORTA_ALT = 1.90
PORTA_Z0, PORTA_Z1 = -PORTA_LARG / 2.0, PORTA_LARG / 2.0


def pulisci():
    bpy.ops.wm.read_homefile(use_empty=True)


def materiale(nome, colore, ruvidita=0.55, metallo=0.0):
    m = bpy.data.materials.get(nome)
    if m is not None:
        return m
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*colore, 1.0)
    p.inputs['Roughness'].default_value = ruvidita
    p.inputs['Metallic'].default_value = metallo
    return m


def scatola(nome, x0, x1, y0, y1, z0, z1, mat, collezione):
    """una scatola d'asse, in metri, con nome stabile — stesso pattern di guscio-salone.py"""
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


def marcatore_vano(nome, x0, x1, y0, y1, z0, z1, collezione):
    """
    Un Empty 'CUBE', non una mesh: segna il volume riservato al meccanismo
    senza spacciare un placeholder per geometria reale (niente facce, niente
    peso). Il master che importera' impianto.glb dovra' farci stare dentro
    l'ingombro vero, qualunque sia il suo orientamento.
    """
    ob = bpy.data.objects.new(nome, None)
    ob.empty_display_type = 'CUBE'
    ob.location = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    ob.scale = ((x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2)
    collezione.objects.link(ob)
    return ob


def paratia_con_porta(nome_base, x0, x1, y0, y1, z0, z1,
                       porta_y1, porta_z0, porta_z1, mat, collezione):
    """
    Paratia trasversale (spessore lungo X) con un varco: architrave sopra
    la porta + due fianchi. Stesso principio delle imbotti di
    guscio-salone.py — quattro/tre scatole invece di un buco booleano, per
    avere spessore vero e niente n-gon.
    """
    pezzi = []
    pezzi.append(scatola(f'{nome_base}_architrave', x0, x1, porta_y1, y1, z0, z1, mat, collezione))
    pezzi.append(scatola(f'{nome_base}_fianco_sx', x0, x1, y0, porta_y1, z0, porta_z0, mat, collezione))
    pezzi.append(scatola(f'{nome_base}_fianco_dx', x0, x1, y0, porta_y1, porta_z1, z1, mat, collezione))
    return pezzi


def costruisci_locale_tecnico():
    """
    Costruisce MECHANISM_BAY e ENGINE_ROOM nelle collezioni del contratto.
    Ritorna (collezione_mechanism_bay, collezione_engine_room, pezzi, info)
    cosi' un master puo' chiamare questa funzione e linkare le collezioni
    sotto il proprio WORLD_ROOT invece di rieseguire l'intero script.
    """
    col_mb = bpy.data.collections.get('MECHANISM_BAY') or bpy.data.collections.new('MECHANISM_BAY')
    if col_mb.name not in bpy.context.scene.collection.children:
        bpy.context.scene.collection.children.link(col_mb)
    col_er = bpy.data.collections.get('ENGINE_ROOM') or bpy.data.collections.new('ENGINE_ROOM')
    if col_er.name not in bpy.context.scene.collection.children:
        bpy.context.scene.collection.children.link(col_er)

    MAT_PARATIA = materiale('MECH_paratia', (0.55, 0.57, 0.60), 0.6, 0.3)
    MAT_PAGLIOLO = materiale('MECH_pagliolo', (0.30, 0.31, 0.33), 0.7, 0.2)
    MAT_SOFFITTO = materiale('MECH_soffitto', (0.62, 0.63, 0.65), 0.65, 0.1)
    MAT_FONDAZIONE = materiale('MECH_fondazione', (0.20, 0.20, 0.22), 0.5, 0.4)

    pezzi = []

    # ═══ MECHANISM_BAY — locale pinne ═══════════════════════════════════
    # X0..X1 del vano attuatore, con corridoio di servizio prima e dopo
    X_MB0 = 0.0
    X_vano0 = X_MB0 + AISLE_PRUA
    X_vano1 = X_vano0 + VANO_ATT_DX
    X_MB1 = X_vano1 + AISLE_MEDIANA   # fine locale pinne / inizio paratia mediana

    # pagliolo e soffitto, per tutto il locale pinne
    pezzi.append(scatola('MB_pagliolo', X_MB0, X_MB1,
                          PAGLIOLO_Y - SP_PAGLIOLO, PAGLIOLO_Y, Z0, Z1, MAT_PAGLIOLO, col_mb))
    pezzi.append(scatola('MB_soffitto', X_MB0, X_MB1,
                          SOFFITTO_Y, SOFFITTO_Y + SP_SOFFITTO, Z0, Z1, MAT_SOFFITTO, col_mb))

    # paratia di prua: fondo CHIUSO, dove comincia la traversata (nessuna
    # apertura: non e' misurato cosa c'e' oltre, e ciao.md non lo chiede qui)
    pezzi.append(scatola('MB_paratia_prua', X_MB0 - SP_PARATIA, X_MB0,
                          PAGLIOLO_Y, SOFFITTO_Y, Z0, Z1, MAT_PARATIA, col_mb))

    # murate laterali (guscio semplificato: pareti verticali, non lo scafo vero)
    pezzi.append(scatola('MB_murata_sx', X_MB0, X_MB1,
                          PAGLIOLO_Y, SOFFITTO_Y, Z0 - SP_PARATIA, Z0, MAT_PARATIA, col_mb))
    pezzi.append(scatola('MB_murata_dx', X_MB0, X_MB1,
                          PAGLIOLO_Y, SOFFITTO_Y, Z1, Z1 + SP_PARATIA, MAT_PARATIA, col_mb))

    # fondazione del meccanismo: un basamento reale (plausibile: STATIC_FOUNDATION
    # in impianto.glb esiste davvero), sotto il marcatore del vano
    FOND_ALT = 0.15
    pezzi.append(scatola('MB_fondazione_attuatore', X_vano0, X_vano1,
                          PAGLIOLO_Y, PAGLIOLO_Y + FOND_ALT,
                          -VANO_ATT_DZ / 2, VANO_ATT_DZ / 2, MAT_FONDAZIONE, col_mb))

    # il vano dell'attuatore vero e proprio: marcatore di volume, non mesh
    vano = marcatore_vano('MB_vano_attuatore_CLEARANCE', X_vano0, X_vano1,
                           PAGLIOLO_Y, PAGLIOLO_Y + VANO_ATT_ALTO,
                           -VANO_ATT_DZ / 2, VANO_ATT_DZ / 2, col_mb)
    pezzi.append(vano)

    # passaggio a scafo: apertura nella murata di dritta, dove il calettamento
    # della pinna uscira' verso l'esterno. Dimensione INVENTATA (0,5 x 0,5 m),
    # centrata sulla fondazione, a meta' della sua altezza utile.
    FORO_SCAFO = 0.5
    foro_y0 = PAGLIOLO_Y + FOND_ALT + 0.3
    foro_y1 = foro_y0 + FORO_SCAFO
    foro_x0 = (X_vano0 + X_vano1) / 2 - FORO_SCAFO / 2
    foro_x1 = foro_x0 + FORO_SCAFO
    # ricostruita la murata_dx sopra come un solo pezzo pieno: qui si sostituisce
    # con 3 pezzi + foro, stesso principio delle porte
    pezzi.append(scatola('MB_murata_dx_sopra_foro', X_MB0, X_MB1,
                          foro_y1, SOFFITTO_Y, Z1, Z1 + SP_PARATIA, MAT_PARATIA, col_mb))
    pezzi.append(scatola('MB_murata_dx_sotto_foro', X_MB0, X_MB1,
                          PAGLIOLO_Y, foro_y0, Z1, Z1 + SP_PARATIA, MAT_PARATIA, col_mb))
    pezzi.append(scatola('MB_murata_dx_prima_foro', X_MB0, foro_x0,
                          foro_y0, foro_y1, Z1, Z1 + SP_PARATIA, MAT_PARATIA, col_mb))
    pezzi.append(scatola('MB_murata_dx_dopo_foro', foro_x1, X_MB1,
                          foro_y0, foro_y1, Z1, Z1 + SP_PARATIA, MAT_PARATIA, col_mb))
    # rimuove il pezzo pieno di sopra sostituito dai 4 sopra: lo si toglie dai
    # dati invece di non crearlo, per tenere l'ordine di lettura del codice
    piena = bpy.data.objects.get('MB_murata_dx')
    if piena is not None:
        pezzi.remove(piena)
        bpy.data.objects.remove(piena, do_unlink=True)

    # ═══ paratia mediana: locale pinne -> sala macchine, con varco ══════
    X_ER0 = X_MB1 + SP_PARATIA
    pezzi += paratia_con_porta('MB_ER_paratia_mediana', X_MB1, X_ER0,
                                PAGLIOLO_Y, SOFFITTO_Y, Z0, Z1,
                                PAGLIOLO_Y + PORTA_ALT, PORTA_Z0, PORTA_Z1,
                                MAT_PARATIA, col_mb)

    # ═══ ENGINE_ROOM — sala macchine ════════════════════════════════════
    X_ER1 = X_ER0 + LUNGHEZZA_SALA_MACCHINE

    pezzi.append(scatola('ER_pagliolo', X_ER0, X_ER1,
                          PAGLIOLO_Y - SP_PAGLIOLO, PAGLIOLO_Y, Z0, Z1, MAT_PAGLIOLO, col_er))
    pezzi.append(scatola('ER_soffitto', X_ER0, X_ER1,
                          SOFFITTO_Y, SOFFITTO_Y + SP_SOFFITTO, Z0, Z1, MAT_SOFFITTO, col_er))
    pezzi.append(scatola('ER_murata_sx', X_ER0, X_ER1,
                          PAGLIOLO_Y, SOFFITTO_Y, Z0 - SP_PARATIA, Z0, MAT_PARATIA, col_er))
    pezzi.append(scatola('ER_murata_dx', X_ER0, X_ER1,
                          PAGLIOLO_Y, SOFFITTO_Y, Z1, Z1 + SP_PARATIA, MAT_PARATIA, col_er))

    # basamento motore: un plinto lungo il pagliolo, plausibile (STATIC_MOTOR
    # e STATIC_FOUNDATION esistono in impianto.glb per la pinna; qui e' lo
    # stesso principio applicato al motore, non una misura)
    BASAMENTO_ALT = 0.20
    BASAMENTO_LARG = 1.4  # INVENTATO, meno del baglio libero (3,2) per lasciare i corridoi
    pezzi.append(scatola('ER_basamento_motore',
                          X_ER0 + AISLE_MACCHINE / 2, X_ER1 - AISLE_MACCHINE / 2,
                          PAGLIOLO_Y, PAGLIOLO_Y + BASAMENTO_ALT,
                          -BASAMENTO_LARG / 2, BASAMENTO_LARG / 2, MAT_FONDAZIONE, col_er))

    # paratia di poppa CON IL PASSAGGIO verso il corridoio/scala — questa e'
    # l'apertura che A4 deve agganciare. Coordinate dichiarate nel referto.
    X_ER_FONDO0 = X_ER1
    X_ER_FONDO1 = X_ER1 + SP_PARATIA
    pezzi += paratia_con_porta('ER_paratia_poppa', X_ER_FONDO0, X_ER_FONDO1,
                                PAGLIOLO_Y, SOFFITTO_Y, Z0, Z1,
                                PAGLIOLO_Y + PORTA_ALT, PORTA_Z0, PORTA_Z1,
                                MAT_PARATIA, col_er)

    varco = {
        'x': (X_ER_FONDO0 + X_ER_FONDO1) / 2.0,   # centro nello spessore della paratia
        'x_da': X_ER_FONDO0, 'x_a': X_ER_FONDO1,
        'y_da': PAGLIOLO_Y, 'y_a': PAGLIOLO_Y + PORTA_ALT,
        'z_da': PORTA_Z0, 'z_a': PORTA_Z1,
        'largh': PORTA_LARG, 'alt': PORTA_ALT,
    }

    info = {
        'X_MB0': X_MB0, 'X_MB1': X_MB1,
        'X_ER0': X_ER0, 'X_ER1': X_ER1,
        'X_ER_FONDO1': X_ER_FONDO1,
        'vano_attuatore': (X_vano0, X_vano1, PAGLIOLO_Y, PAGLIOLO_Y + VANO_ATT_ALTO,
                            -VANO_ATT_DZ / 2, VANO_ATT_DZ / 2),
        'varco_corridoio': varco,
    }
    return col_mb, col_er, pezzi, info


if __name__ == '__main__':
    pulisci()
    col_mb, col_er, pezzi, info = costruisci_locale_tecnico()

    # radice locale per l'export di prova — un master futuro linkera' le due
    # collezioni sotto il proprio WORLD_ROOT invece di usare questa radice
    radice = bpy.data.objects.new('LOCALE_TECNICO_ROOT', None)
    bpy.context.scene.collection.objects.link(radice)
    for p in pezzi:
        p.parent = radice

    # bounding box mondo aggregata, dagli angoli veri trasformati per matrice
    # mondo. NON si puo' usare object.location +/- dimensions/2 per le mesh:
    # scatola() applica transform_apply, che azzera object.location e cuoce
    # la posizione nei vertici. bound_box @ matrix_world resta corretto in
    # ogni caso (per le mesh la matrice e' ormai l'identita', per il
    # marcatore Empty non esiste bound_box: si usa location +/- scale, che e'
    # esattamente come marcatore_vano() lo ha costruito).
    xs, ys, zs = [], [], []
    for o in pezzi:
        if o.type == 'MESH':
            for c in o.bound_box:
                w = o.matrix_world @ Vector(c)
                xs.append(w.x); ys.append(w.y); zs.append(w.z)
        else:
            xs += [o.location.x - o.scale.x, o.location.x + o.scale.x]
            ys += [o.location.y - o.scale.y, o.location.y + o.scale.y]
            zs += [o.location.z - o.scale.z, o.location.z + o.scale.z]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    min_z, max_z = min(zs), max(zs)

    # conteggio facce vero, sulle sole mesh (il marcatore e' un Empty: 0 facce)
    n_facce = sum(len(o.data.polygons) for o in pezzi if o.type == 'MESH')
    n_mesh = sum(1 for o in pezzi if o.type == 'MESH')
    n_empty = sum(1 for o in pezzi if o.type != 'MESH')

    glb = os.path.join(USCITE, 'mechanism_bay.glb')
    bpy.ops.object.select_all(action='DESELECT')
    radice.select_set(True)
    for p in pezzi:
        p.select_set(True)
    bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB',
                               use_selection=True, export_yup=True,
                               export_apply=True)
    peso = os.path.getsize(glb)

    v = info['varco_corridoio']

    print('')
    print('  LOCALE TECNICO — locale pinne + sala macchine')
    print('  ' + '-' * 70)
    print(f'  pezzi totali        {len(pezzi)}   (mesh {n_mesh}, empty/marcatori {n_empty})')
    print(f'  facce totali        {n_facce}')
    print(f'  bbox mondo min      ({min_x:.4f}, {min_y:.4f}, {min_z:.4f})')
    print(f'  bbox mondo max      ({max_x:.4f}, {max_y:.4f}, {max_z:.4f})')
    print(f'  dimensioni bbox     dx={max_x-min_x:.4f}  dy={max_y-min_y:.4f}  dz={max_z-min_z:.4f}')
    print('')
    print(f'  MECHANISM_BAY       X {info["X_MB0"]:.4f} .. {info["X_MB1"]:.4f}   ({info["X_MB1"]-info["X_MB0"]:.3f} m)')
    print(f'  ENGINE_ROOM         X {info["X_ER0"]:.4f} .. {info["X_ER1"]:.4f}   ({info["X_ER1"]-info["X_ER0"]:.3f} m)')
    print(f'  vano attuatore      X {info["vano_attuatore"][0]:.4f}..{info["vano_attuatore"][1]:.4f}'
          f'  Y {info["vano_attuatore"][2]:.4f}..{info["vano_attuatore"][3]:.4f}'
          f'  Z {info["vano_attuatore"][4]:.4f}..{info["vano_attuatore"][5]:.4f}')
    print('')
    print('  VARCO VERSO IL CORRIDOIO/SCALA (per A4, corridor.py):')
    print(f'    centro spessore paratia   X = {v["x"]:.4f} m   (paratia da X={v["x_da"]:.4f} a X={v["x_a"]:.4f})')
    print(f'    vano libero               Y {v["y_da"]:.4f} .. {v["y_a"]:.4f} m   (largh. porta {v["largh"]:.2f} m, alt. {v["alt"]:.2f} m)')
    print(f'    vano libero               Z {v["z_da"]:.4f} .. {v["z_a"]:.4f} m')
    print(f'    soglia (pagliolo)         Y = {PAGLIOLO_Y:.4f} m')
    print(f'    normale del varco         +X  (il corridoio continua verso X crescenti)')
    print('')
    print(f'  GLB                 {glb}   {peso} byte')
    print('')
