# -*- coding: utf-8 -*-
"""
B8a — L'OCCLUSIONE AMBIENTALE DI UNA COLLEZIONE DELLA TRAVERSATA.

    "/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b \
        -P riferimenti/blender/cuoci-traversata.py -- [--collezione MECHANISM_BAY]

--- COSA FA, E COSA NON FA

Cuoce UNA SOLA mappa: l'occlusione ambientale (`AO`) di UNA collezione, in un
atlante unico condiviso da tutte le sue mesh. NON cuoce la normale: qui non
esiste una coppia ALTA/BASSA — la geometria e' fatta di scatole d'asse generate
da `parts/mechanism_bay.py`, l'alta SAREBBE la bassa, e `cottura.py` lo dice
gia' col suo cancello «la normale e' PIATTA» (`cottura.py:591-596`). Cuocere
una normale da se' stessi e' il modo classico di consegnare una texture grigia
che passa i cancelli.

NON ricostruisce niente: esegue `scena-continua.py` con runpy, esattamente come
fa `esporta-traversata.py:35`. Tutto quello che l'assemblatore ha costruito
resta in scena, e serve: il corridoio e il guscio del salone sono OCCLUDENTI.
E' la lezione di `cuoci-ao-scafo.py:28-32` — un bake fatto sul solo bersaglio
da' una superficie uniforme e sembra funzionare.

NON scrive in `public/modelli/`: il rientro nel GLB e' un giro a parte, e si fa
con `esporta-traversata.py`, che esiste gia'.

--- LE UV: QUI SI CREANO, E VA DETTO PERCHE'

I sei copioni gia' rodati NON usano `smart_project`, e hanno ragione: le loro
UV arrivano dal costruttore o dall'esportatore JS, e srotolarle a caso
cuocerebbe su una mappa diversa da quella che il sito legge
(`cuoci-ao-scafo.py:17-27`).

Qui la ragione non si applica, ed e' l'opposto: `parts/mechanism_bay.py`
costruisce le scatole con `bmesh.ops.create_cube` (riga 186), che **non crea
nessun canale UV**. Verificato prima di cuocere (`grep -n "uv" ` sul file: zero
occorrenze). Non c'e' nessuna mappa da rispettare, perche' non ce n'e' nessuna:
o la si crea qui, o la cottura scrive su un canale che non esiste. Una lightmap
senza UV cuoce nera e non lo dice.

Si crea quindi UN SOLO canale, chiamato `UVMap`, con `smart_project` in
modalita' multi-oggetto: tutte le mesh della collezione entrano nello STESSO
quadrato 0..1 e ci vanno impacchettate senza sovrapporsi. Che non si
sovrappongano non si spera: si MISURA, rasterizzando i triangoli UV in un
contatore (`sovrapposizione()`), perche' due isole sovrapposte non danno
errore, danno una mappa in cui una parete porta l'ombra di un'altra.

Un canale solo, `texCoord 0`: e' quello che l'esportatore glTF dichiara, ed e'
quello che il `GLTFLoader` di three assegna sia a `uv` sia — per
l'`occlusionTexture` — a `uv1`. La trappola dei `uv1` (`src/scafo/ordinate.js:332-351`)
morde le geometrie costruite a mano in JS, non i GLB caricati dal loader.

--- LA RISOLUZIONE NON SI SCEGLIE, SI TARA

`cuoci-macchine.py:108-115` non fissa un lato: lo deriva dalla densita'
texel/cm che si vuole, dalla superficie reale in m2 e dalla frazione di
quadrato UV occupata dalle isole:

    densita' [texel/cm] = lato * sqrt(area_uv / area_3d) / 100

Il riferimento MISURATO su questo repo e' 0,49 texel/cm (propulsione a 384 px,
`strumenti/rifai-macchine.sh:56-72`), accettato. Qui si chiede la stessa
densita' e si legge che lato ne esce, arrotondato alla taglia piu' vicina.
"""

import bpy
import os
import sys
import math
import argparse
import runpy
import numpy as np

QUI = os.path.dirname(os.path.abspath(__file__))
if QUI not in sys.path:
    sys.path.insert(0, QUI)

SCENA_CONTINUA = os.path.join(QUI, 'scena-continua.py')
USCITE = os.path.join(QUI, 'uscite')

TAGLIE = (256, 320, 384, 512, 640, 768, 1024, 2048)


def dice(*a):
    print(*a)
    sys.stdout.flush()


def morire(messaggio):
    dice('')
    dice('!! COTTURA RIFIUTATA - ' + messaggio)
    sys.exit(1)


def argomenti():
    argv = sys.argv
    argv = argv[argv.index('--') + 1:] if '--' in argv else []
    p = argparse.ArgumentParser(prog='cuoci-traversata.py', add_help=True)
    p.add_argument('--collezione', default='MECHANISM_BAY',
                   help='collezione bersaglio (le altre restano OCCLUDENTI)')
    p.add_argument('--lato', type=int, default=0,
                   help='lato in px; 0 = taralo sulla densita\' (predefinito)')
    p.add_argument('--densita', type=float, default=0.49,
                   help='texel/cm voluti: 0,49 e\' quella misurata e accettata '
                        'sulla propulsione (strumenti/rifai-macchine.sh:56-72)')
    p.add_argument('--campioni', type=int, default=128,
                   help='campioni Cycles (cuoci-ao-scafo.py:40 ne usa 128)')
    p.add_argument('--margine', type=int, default=None,
                   help='dilatazione in texel (predefinito: max(4, lato//128), '
                        'come cottura.py:476)')
    p.add_argument('--distanza-ao', type=float, default=None, dest='distanza_ao',
                   help='raggio di ricerca dell\'occlusione (predefinito: '
                        'diagonale/8, come cottura.py:477)')
    p.add_argument('--island-margin', type=float, default=0.01, dest='island_margin')
    p.add_argument('--min-escursione', type=float, default=0.10, dest='min_escursione',
                   help='max-min minimo: sotto, l\'occlusione non e\' stata cotta '
                        '(cuoci-ao-scafo.py:140)')
    p.add_argument('--min-copertura', type=float, default=98.0, dest='min_copertura',
                   help='percentuale dell\'area UV che deve risultare cotta')
    p.add_argument('--uscita', default=USCITE)
    p.add_argument("--gia-assemblata", action="store_true", dest="gia_assemblata",
                   help="la scena e gia in memoria: non rieseguire scena-continua.py. "
                        "Serve a cuocere piu collezioni nella STESSA sessione, cosi "
                        "le loro UV convivono e un solo export le porta tutte.")
    p.add_argument('--gpu', action='store_true',
                   help='cuoci su GPU OPTIX (Colab T4). MUORE se OPTIX non c\'e\': '
                        'vedi accendi_gpu()')
    p.add_argument('--senza-cancelli', action='store_true')
    return p.parse_args(argv)


def accendi_gpu(scena):
    """OPTIX acceso, e MORTE se non c'e'. Copiata nella sostanza da
    `cottura.py:359-400`, e il motivo per cui non ha un `try` sta scritto li'
    per esteso: su una macchina senza GPU nessuna di queste righe solleva
    niente — `compute_device_type = 'OPTIX'` viene assegnato, `get_devices()`
    torna il solo processore, `cycles.device = 'GPU'` viene accettato, e Cycles
    RIPIEGA SU CPU SENZA UNA RIGA DI AVVISO. Su Colab questo e' il guasto che
    conta: si paga la T4 e si cuoce in CPU per ore credendo il contrario.
    L'ordine non e' quello intuitivo: prima il backend, poi l'enumerazione."""
    pr = bpy.context.preferences.addons['cycles'].preferences
    pr.compute_device_type = 'OPTIX'
    pr.get_devices()
    optix = [d for d in pr.devices if d.type == 'OPTIX']
    if not optix:
        morire('OPTIX assente: Cycles ripiegherebbe su CPU senza dirlo e '
               'consegnerebbe lo stesso il suo PNG. Device visti: %s'
               % [(d.name, d.type) for d in pr.devices])
    for d in pr.devices:
        d.use = (d.type == 'OPTIX')
    scena.cycles.device = 'GPU'
    dice('  OPTIX acceso su: %s' % ', '.join(d.name for d in optix))


# ------------------------------------------------------------------ misure

def area_3d(o):
    """m2 nello spazio di MONDO (la scala potrebbe non essere applicata:
    non ci si fida, si trasforma — cuoci-macchine.py:79-93)."""
    M = o.matrix_world
    tot = 0.0
    for p in o.data.polygons:
        vs = [M @ o.data.vertices[i].co for i in p.vertices]
        for k in range(1, len(vs) - 1):
            tot += (vs[k] - vs[0]).cross(vs[k + 1] - vs[0]).length / 2.0
    return tot


def area_uv(o):
    """Frazione del quadrato 0..1 occupata dalle isole (cuoci-macchine.py:95-105)."""
    uv = o.data.uv_layers.active.data
    tot = 0.0
    for p in o.data.polygons:
        q = [uv[i].uv for i in p.loop_indices]
        for k in range(1, len(q) - 1):
            a, b, c = q[0], q[k], q[k + 1]
            tot += abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) / 2.0
    return tot


def triangoli_uv(oggetti):
    """Tutti i triangoli UV di tutti gli oggetti, in un array (N,3,2)."""
    tri = []
    for o in oggetti:
        uv = o.data.uv_layers.active.data
        for p in o.data.polygons:
            q = [(uv[i].uv[0], uv[i].uv[1]) for i in p.loop_indices]
            for k in range(1, len(q) - 1):
                tri.append((q[0], q[k], q[k + 1]))
    return np.array(tri, dtype=np.float64)


def rasterizza(tri, lato):
    """Contatore per texel: quante volte un texel e' coperto da un triangolo UV.

    Serve a DUE cose che non si possono sperare:
      - la maschera dell'area UV (per la copertura e per la media «dove conta»);
      - la SOVRAPPOSIZIONE: due isole sullo stesso texel non danno errore,
        danno una parete che porta l'ombra di un'altra.
    Rasterizzazione a scanline sul baricentro del texel: e' la stessa regola
    che usa il bake, quindi i due domini coincidono.
    """
    conta = np.zeros((lato, lato), dtype=np.int32)
    xs = (np.arange(lato) + 0.5) / lato
    for t in tri:
        (x0, y0), (x1, y1), (x2, y2) = t
        det = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
        if abs(det) < 1e-14:
            continue
        j0 = max(0, int(math.floor(min(x0, x1, x2) * lato)))
        j1 = min(lato - 1, int(math.ceil(max(x0, x1, x2) * lato)))
        i0 = max(0, int(math.floor(min(y0, y1, y2) * lato)))
        i1 = min(lato - 1, int(math.ceil(max(y0, y1, y2) * lato)))
        if j1 < j0 or i1 < i0:
            continue
        px = xs[j0:j1 + 1][None, :]
        py = xs[i0:i1 + 1][:, None]
        l0 = ((y1 - y2) * (px - x2) + (x2 - x1) * (py - y2)) / det
        l1 = ((y2 - y0) * (px - x2) + (x0 - x2) * (py - y2)) / det
        l2 = 1.0 - l0 - l1
        dentro = (l0 >= 0) & (l1 >= 0) & (l2 >= 0)
        conta[i0:i1 + 1, j0:j1 + 1] += dentro.astype(np.int32)
    return conta


# ------------------------------------------------------------------ cottura

def main():
    a = argomenti()

    dice('=' * 78)
    dice('B8a — COTTURA AO di %s' % a.collezione)
    dice('=' * 78)
    if a.gia_assemblata:
        # ─── LA SCENA C'E' GIA', e riassemblarla cancellerebbe le UV precedenti
        #
        # Ogni cottura srotola SOLO la propria collezione. Rieseguendo
        # l'assemblaggio a ogni giro, le UV del giro prima spariscono con gli
        # oggetti che le portavano: alla fine ne sopravvive una sola, e il
        # rientro nel GLB porterebbe una mappa su tre.
        dice("scena gia assemblata: non rieseguo scena-continua.py")
        risultati = {}
    else:
        dice('assemblo il mondo eseguendo scena-continua.py (non ricostruisco niente)')
        ns = runpy.run_path(SCENA_CONTINUA, run_name='__main__')
        risultati = ns.get('RISULTATI', {})

    dice('')
    dice('-' * 78)
    dice('ESITO ASSEMBLAGGIO (da scena-continua.py)')
    for nome, t in risultati.items():
        dice('  %-28s %s' % (nome, t[0]))

    col = bpy.data.collections.get(a.collezione)
    if col is None:
        morire('la collezione %s non esiste dopo l\'assemblaggio' % a.collezione)
    mesh = [o for o in col.objects if o.type == 'MESH']
    if not mesh:
        morire('%s non contiene nessuna mesh: non c\'e\' niente da cuocere' % a.collezione)

    # occludenti: TUTTO il resto della scena. Si dichiara, non si assume.
    tutte = [o for o in bpy.data.objects if o.type == 'MESH']
    occludenti = [o for o in tutte if o not in mesh]
    dice('')
    dice('  bersagli   %d mesh in %s' % (len(mesh), a.collezione))
    dice('  occludenti %d mesh nel resto della scena (%s)'
         % (len(occludenti),
            ', '.join(sorted({c.name for o in occludenti for c in o.users_collection})) or 'nessuna'))

    # ---- UV: prima si GUARDA se ci sono ---------------------------------
    dice('')
    dice('-' * 78)
    dice('UV — stato PRIMA di toccare niente')
    senza = [o.name for o in mesh if not o.data.uv_layers]
    con = [(o.name, [l.name for l in o.data.uv_layers]) for o in mesh if o.data.uv_layers]
    dice('  mesh SENZA nessun canale UV: %d su %d' % (len(senza), len(mesh)))
    for n, l in con:
        dice('  %s ha gia\' %s' % (n, l))
    if not senza:
        dice('  (nessuna da srotolare: si userebbero quelle che ci sono)')

    for o in mesh:
        while o.data.uv_layers:
            o.data.uv_layers.remove(o.data.uv_layers[0])
        o.data.uv_layers.new(name='UVMap')

    bpy.ops.object.select_all(action='DESELECT')
    for o in mesh:
        o.hide_viewport = False
        o.hide_render = False
        o.hide_set(False)
        o.select_set(True)
    bpy.context.view_layer.objects.active = mesh[0]
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    esito = bpy.ops.uv.smart_project(angle_limit=math.radians(66.0),
                                     island_margin=a.island_margin,
                                     correct_aspect=True, scale_to_bounds=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    if 'FINISHED' not in esito:
        morire('smart_project ha risposto %s' % (esito,))
    dice('  srotolate ORA: un canale solo, `UVMap` -> texCoord 0, multi-oggetto '
         '(stesso quadrato 0..1 per tutte le %d mesh)' % len(mesh))

    S = sum(area_3d(o) for o in mesh)
    U = sum(area_uv(o) for o in mesh)
    dice('')
    dice('-' * 78)
    dice('ATLANTE — la risoluzione si TARA, non si sceglie')
    dice('  superficie reale     %.3f m2' % S)
    dice('  isole                %.1f%% del quadrato UV' % (U * 100.0))
    ideale = 100.0 * a.densita * math.sqrt(S / U) if U > 0 else 0.0
    dice('  lato per %.2f texel/cm: %.0f px -> taglia piu\' vicina fra %s'
         % (a.densita, ideale, TAGLIE))
    if a.lato:
        lato = a.lato
        dice('  lato IMPOSTO a mano: %d px' % lato)
    else:
        lato = min(TAGLIE, key=lambda t: abs(t - ideale))
    dens = lato * math.sqrt(U / S) / 100.0
    dice('  SCELTO %d px  ->  %.3f texel/cm  (un texel = %.2f cm)'
         % (lato, dens, 1.0 / dens if dens else 0.0))

    margine = a.margine if a.margine is not None else max(4, lato // 128)

    # ---- le isole NON devono sovrapporsi: si misura ----------------------
    conta = rasterizza(triangoli_uv(mesh), lato)
    m_uv = conta > 0
    area_texel = int(m_uv.sum())
    sovrapposti = int((conta > 1).sum())
    dice('')
    dice('  area UV rasterizzata  %d texel (%.2f%% della texture)'
         % (area_texel, 100.0 * area_texel / conta.size))
    dice('  texel coperti da PIU\' di un\'isola  %d  (%.4f%% dell\'area UV)'
         % (sovrapposti, 100.0 * sovrapposti / max(area_texel, 1)))
    if sovrapposti > 0 and not a.senza_cancelli:
        morire('%d texel sovrapposti: due pareti scriverebbero sullo stesso posto '
               'e una porterebbe l\'ombra dell\'altra. Alza --island-margin o il lato.'
               % sovrapposti)

    # ---- il bersaglio della cottura --------------------------------------
    # `is_data`/Non-Color: l'occlusione glTF e' un dato, non un colore. Con lo
    # sRGB addosso il PNG uscirebbe con la curva applicata e la media che si
    # misura non sarebbe l'occlusione.
    nome_img = 'AO_%s' % a.collezione
    vecchia = bpy.data.images.get(nome_img)
    if vecchia:
        bpy.data.images.remove(vecchia)
    img = bpy.data.images.new(nome_img, lato, lato, alpha=True,
                              float_buffer=True, is_data=True)
    img.colorspace_settings.name = 'Non-Color'
    # ─── FONDO NERO E TRASPARENTE, e la copertura si legge NELL'ALFA
    #
    # Primo giro sbagliato, e vale la pena scriverlo: avevo messo alfa 1 e
    # contato «cotto» un texel col valore > 0. Ha bocciato la cottura a 89,24%
    # di copertura — ma un texel di AO PUO' essere nero per davvero, perche'
    # completamente occluso: quel cancello confondeva «non scritto» con «in
    # ombra piena», cioe' proprio col caso che l'occlusione esiste per
    # rappresentare. E' cottura.py:113-120 ad avere la risposta: Blender segna
    # la copertura NELL'ALFA e scrive  out = copertura*valore + (1-cop)*fondo.
    # Con fondo nero il valore vero si riprende dividendo per l'alfa, e la
    # maschera del cotto e' l'alfa, non il valore.
    img.pixels.foreach_set(np.tile(np.array((0.0, 0.0, 0.0, 0.0), dtype=np.float32),
                                   lato * lato))

    materiali = []
    for o in mesh:
        if not o.data.materials:
            morire('%s non ha materiale: il bake non saprebbe dove scrivere' % o.name)
        for m in o.data.materials:
            if m is not None and m not in materiali:
                materiali.append(m)
    nodi = []
    for m in materiali:
        if not m.use_nodes:
            m.use_nodes = True
        n = m.node_tree.nodes.new('ShaderNodeTexImage')
        n.name = 'COTTURA_AO_BERSAGLIO'
        n.image = img
        for altro in m.node_tree.nodes:
            altro.select = False
        n.select = True
        m.node_tree.nodes.active = n
        nodi.append((m, n))
    dice('  bersaglio piazzato su %d materiali: %s'
         % (len(materiali), ', '.join(m.name for m in materiali)))

    # diagonale della bbox mondo del bersaglio -> distanza AO
    pts = [o.matrix_world @ v.co for o in mesh for v in o.data.vertices]
    mn = [min(p[i] for p in pts) for i in range(3)]
    mx = [max(p[i] for p in pts) for i in range(3)]
    diag = math.dist(mn, mx)
    dist_ao = a.distanza_ao if a.distanza_ao is not None else round(diag / 8.0, 6)

    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    if a.gpu:
        accendi_gpu(sc)
    sc.cycles.samples = a.campioni
    # adattivo SPENTO: acceso, `--campioni` e' una decorazione (cottura.py:406-417)
    sc.cycles.use_adaptive_sampling = False
    # denoise SOLO sull'occlusione: qui si cuoce solo quella (cottura.py:418-421)
    sc.cycles.use_denoising = True
    if sc.world is None:
        sc.world = bpy.data.worlds.new('MONDO')
    sc.world.light_settings.distance = dist_ao
    sc.render.bake.use_selected_to_active = False
    sc.render.bake.margin = margine
    sc.render.bake.margin_type = 'ADJACENT_FACES'
    sc.render.bake.use_clear = False

    dice('')
    dice('-' * 78)
    dice('COTTURA')
    dice('  motore     Cycles %s, adattivo SPENTO, denoise ACCESO (solo AO)'
         % ('GPU/OPTIX' if a.gpu else 'CPU'))
    dice('  campioni   %d' % a.campioni)
    dice('  texture    %d px, margine %d texel' % (lato, margine))
    dice('  bbox mondo min=%s max=%s' % (tuple(round(c, 3) for c in mn),
                                         tuple(round(c, 3) for c in mx)))
    dice('  diagonale  %.4f m  ->  distanza AO %.4f m' % (diag, dist_ao))

    bpy.ops.object.select_all(action='DESELECT')
    for o in mesh:
        o.select_set(True)
    bpy.context.view_layer.objects.active = mesh[0]

    import time
    t0 = time.time()
    esito = bpy.ops.object.bake(type='AO', use_selected_to_active=False,
                                margin=margine, margin_type='ADJACENT_FACES',
                                use_clear=False)
    secondi = time.time() - t0
    if 'FINISHED' not in esito:
        morire('bpy.ops.object.bake ha risposto %s' % (esito,))
    dice('  TEMPO REALE DI COTTURA  %.1f s' % secondi)

    # ---- misura PRIMA di salvare ----------------------------------------
    buf = np.empty(lato * lato * 4, dtype=np.float32)
    img.pixels.foreach_get(buf)
    quattro = buf.reshape(lato, lato, 4)
    alfa = quattro[..., 3]
    cotti = alfa > (1.0 / 255.0)          # la copertura sta QUI, non nel valore
    divisore = np.where(cotti, alfa, 1.0)
    px = np.clip(quattro[..., 0] / divisore, 0.0, 1.0)

    dominio = m_uv
    copertura = 100.0 * float((cotti & dominio).sum()) / max(area_texel, 1)
    dentro = px[dominio & cotti]
    dice('')
    dice('MISURA (valori lineari 0-255, dentro l\'area UV)')
    dice('  copertura   %.2f%% dell\'area UV ha ricevuto un valore' % copertura)
    dice('  min %.2f  max %.2f  media %.2f  scarto tipo %.2f'
         % (dentro.min() * 255, dentro.max() * 255,
            dentro.mean() * 255, dentro.std() * 255))
    escursione = float(dentro.max() - dentro.min())
    dice('  escursione  %.4f (0-1)' % escursione)

    os.makedirs(a.uscita, exist_ok=True)
    fuori = os.path.abspath(os.path.join(a.uscita, '%s-ao.png' % a.collezione.lower()))
    # Il PNG spedito NON porta l'alfa: l'alfa era la copertura, un attrezzo
    # della cottura. Si scrive il valore GIA' diviso, e fuori dalle isole il
    # fondo dell'occlusione, che e' 1 (nessuna ombra) — come cottura.py:545.
    piano = np.where(cotti, px, 1.0).astype(np.float32)
    nome_out = 'USCITA_AO'
    vecchia = bpy.data.images.get(nome_out)
    if vecchia:
        bpy.data.images.remove(vecchia)
    out = bpy.data.images.new(nome_out, lato, lato, alpha=False,
                              float_buffer=False, is_data=True)
    out.colorspace_settings.name = 'Non-Color'
    rgba = np.ones((lato, lato, 4), dtype=np.float32)
    rgba[..., 0] = piano
    rgba[..., 1] = piano
    rgba[..., 2] = piano
    out.pixels.foreach_set(rgba.ravel())
    out.filepath_raw = fuori
    out.file_format = 'PNG'
    out.save()
    # `salva()` di cottura.py:160-185 esiste per questo: con un percorso
    # relativo `img.save()` non scriveva niente e non alzava niente.
    if not os.path.isfile(fuori):
        morire('ho creduto di scrivere %s e sul disco non c\'e\'' % fuori)
    peso = os.path.getsize(fuori)
    if peso < 1024:
        morire('%s pesa %d byte: non e\' una texture' % (fuori, peso))
    dice('')
    dice('  SCRITTO  %s' % fuori)
    dice('  %d x %d px, %d byte' % (lato, lato, peso))

    blend = os.path.abspath(os.path.join(a.uscita, '%s-cotto.blend' % a.collezione.lower()))
    bpy.ops.wm.save_as_mainfile(filepath=blend)
    dice('  scena con le UV salvata in %s (serve al giro del rientro nel GLB)' % blend)

    if a.senza_cancelli:
        dice('')
        dice('(cancelli disattivati: nessun giudizio)')
        return

    guasti = []
    if escursione < a.min_escursione:
        guasti.append('AO PIATTA: escursione %.4f, minimo %.4f. Gli occludenti non '
                      'c\'erano o le UV non sono quelle cotte: una mappa uniforme '
                      'sembra riuscita e non serve a niente (cuoci-ao-scafo.py:133-141).'
                      % (escursione, a.min_escursione))
    if float(dentro.mean()) < 0.02 and float(dentro.std()) < 0.02:
        guasti.append('AO NERA: media %.4f, scarto %.4f. E\' il modo in cui una '
                      'cottura fallita passa per riuscita.'
                      % (dentro.mean(), dentro.std()))
    if copertura < a.min_copertura:
        guasti.append('copertura %.2f%%, minimo %.2f%%: una parte dell\'area UV non '
                      'e\' stata scritta.' % (copertura, a.min_copertura))

    if guasti:
        marchiato = os.path.join(os.path.dirname(fuori), 'RIFIUTATA-' + os.path.basename(fuori))
        if os.path.exists(marchiato):
            os.remove(marchiato)
        os.rename(fuori, marchiato)
        for g in guasti:
            dice('')
            dice('!! ' + g)
        dice('')
        dice('   il PNG e\' stato rinominato RIFIUTATA-*: guardalo, non spedirlo.')
        morire('%d cancello/i rosso/i' % len(guasti))

    dice('')
    dice('COTTURA ACCETTATA — media %.2f, scarto %.2f, copertura %.2f%%'
         % (dentro.mean() * 255, dentro.std() * 255, copertura))


if __name__ == '__main__':
    main()
