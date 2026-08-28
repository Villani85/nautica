# -*- coding: utf-8 -*-
"""
LA MACCHINA PER LA COTTURA - normale (tangent space) + ORM impacchettata glTF.

Uso:
  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" -b -P cottura.py --
      <file.blend> <nome_alta> <nome_bassa> <cartella_uscita> [dimensione]

Cuoce dall'oggetto ALTA (con gli smussi) all'oggetto BASSA (senza), e scrive:
  <prefisso>-normale.png   normale in tangent space, +Y in su (OpenGL, come vuole glTF)
  <prefisso>-orm.png       occlusione in R, rugosita' in G, metallicita' in B

NON e' un renderizzatore: `cuoci.py`, che sta accanto, e' un'altra cosa.

LA TRAPPOLA CHE QUESTO SCRIPT ESISTE PER GESTIRE
------------------------------------------------
Se la bassa e l'alta non combaciano abbastanza, il raggio della cottura prende
la superficie sbagliata e la normale esce con MACCHIE. Si governa con due
distanze:
  --estrusione  di quanto il raggio parte FUORI dalla bassa (il cage);
  --raggio      quanto lontano il raggio puo' cercare l'alta.
Troppo poco: il dettaglio non viene raggiunto (la mappa esce piatta).
Troppo: il raggio scavalca lo spigolo e prende la faccia accanto (macchie).

E LO SCRIPT MISURA, non guarda
------------------------------
Alla fine misura la mappa normale ed ESCE CON ERRORE su tre cancelli. Le soglie
non sono scelte a occhio: sono DERIVATE dal banco di `provino-cottura.py`, e
ogni cancello e' stato visto diventare rosso almeno una volta.

  cancello        predefinito   cottura sana   guasto che lo fa scattare
  -------------   -----------   ------------   ---------------------------------
  copertura       98,0%         100,00%        bassa ruotata di 45 gradi: 47,21%
                                               raggio quasi nullo:        97,66%
  macchie         0,05%         0,0005%        fessura + raggio illimitato: 0,0731%
  informazione    1,0%          76,64%         alta identica alla bassa:  0,000%

Una cottura che riesce sempre non e' una cottura, e' un file PNG.

DUE COSE CHE HO SBAGLIATO E CHE VALGONO PIU' DEI CANCELLI
---------------------------------------------------------
1. Con un percorso relativo `img.save()` non ha scritto niente e non ha alzato
   niente: lo script STAMPAVA il nome di un file che non esisteva sul disco.
   Adesso `salva()` ricontrolla che ci sia e che pesi qualcosa.
2. La deviazione standard NON dice se la normale e' viva. Misurata su un
   provino in cui l'alta e' quasi la bassa vale ancora 7,79 livelli, perche'
   e' dominata da pochi texel estremi sul bordo delle isole. Il numero che
   separa i casi e' la FRAZIONE di texel che si scostano dal piatto. La
   deviazione si stampa lo stesso, ma come informazione, non come giudizio.
"""

import sys
import os
import argparse
import numpy as np
import bpy


# ----------------------------------------------------------------- argomenti

def argomenti():
    argv = sys.argv
    argv = argv[argv.index("--") + 1:] if "--" in argv else []
    p = argparse.ArgumentParser(prog="cottura.py", add_help=True)
    p.add_argument("blend", help="file .blend da aprire")
    p.add_argument("alta", help="nome dell'oggetto ad alta risoluzione")
    p.add_argument("bassa", help="nome dell'oggetto a bassa risoluzione (porta le UV)")
    p.add_argument("uscita", help="cartella dove scrivere i PNG")
    p.add_argument("dimensione", nargs="?", type=int, default=2048,
                   help="lato della texture in pixel (predefinito 2048)")
    p.add_argument("--prefisso", default=None,
                   help="prefisso dei file (predefinito: il nome della bassa)")
    # distanza di ricerca / cage
    p.add_argument("--estrusione", type=float, default=None,
                   help="cage_extrusion: quanto il raggio parte fuori dalla bassa")
    p.add_argument("--raggio", type=float, default=None,
                   help="max_ray_distance: quanto lontano cerca l'alta (0 = illimitato)")
    p.add_argument("--cage", default=None,
                   help="nome di un oggetto cage esplicito (ha la precedenza sull'estrusione)")
    # qualita'
    p.add_argument("--campioni", type=int, default=64, help="campioni Cycles per l'occlusione")
    p.add_argument("--distanza-ao", type=float, default=None, dest="distanza_ao",
                   help="raggio di ricerca dell'occlusione (predefinito: 1/8 della diagonale)")
    p.add_argument("--margine", type=int, default=None, help="margine di dilatazione in texel")
    p.add_argument("--gpu", action="store_true", help="prova a cuocere su GPU")
    # cancelli
    p.add_argument("--min-deviazione", type=float, default=2.0, dest="min_deviazione",
                   help="deviazione standard minima di R e G, in livelli 0-255")
    p.add_argument("--soglia-informazione", type=float, default=8.0, dest="soglia_informazione",
                   help="livelli di scostamento da (128,128) oltre i quali un texel "
                        "porta informazione")
    p.add_argument("--min-informazione", type=float, default=1.0, dest="min_informazione",
                   help="percentuale minima di texel che portano informazione. E' questo, "
                        "non la deviazione standard, a distinguere una normale viva da "
                        "una piatta: provino smussato 76,64%%, alta identica alla bassa "
                        "0,000%% esatto.")
    p.add_argument("--soglia-macchia", type=float, default=0.16, dest="soglia_macchia",
                   help="scarto dalla mediana dei vicini oltre il quale un texel e' macchia (0-1)")
    p.add_argument("--max-macchie", type=float, default=0.05, dest="max_macchie",
                   help="percentuale massima di texel macchiati tollerata. Il predefinito "
                        "e' DERIVATO dal provino, non scelto: cottura sana 0,0005%%, "
                        "cottura con la fessura patologica e raggio illimitato 0,0731%%. "
                        "0,05 sta 100 volte sopra il fondo sano e sotto il guasto.")
    p.add_argument("--min-copertura", type=float, default=98.0, dest="min_copertura",
                   help="percentuale minima dell'area UV che la cottura deve raggiungere. "
                        "Provino sano 100,00%%; bassa ruotata di 45 gradi 47,21%%; "
                        "raggio quasi nullo 97,66%%.")
    p.add_argument("--senza-cancelli", action="store_true",
                   help="misura e stampa ma non esce con errore (solo per esplorare)")
    return p.parse_args(argv)


# Le immagini di cottura partono NERE E TRASPARENTI, e non e' indifferente.
# Sul bordo di un'isola UV il texel e' coperto solo in parte, e Blender ci
# scrive  out = copertura * valore + (1 - copertura) * fondo,  segnando la
# copertura nell'alfa. Con un fondo diverso da zero quel fondo COLA nel valore:
# misurato sul provino, la metallicita' - costante 0.85, cioe' 217 - usciva a
# 236 su 4.270 texel, tutti sul bordo delle isole, e il margine poi li spalmava
# verso fuori. Con fondo nero il valore vero si riprende dividendo per l'alfa.
FONDO = (0.0, 0.0, 0.0, 0.0)


def dice(*a):
    print(*a)
    sys.stdout.flush()


def morire(messaggio):
    dice("")
    dice("!! COTTURA RIFIUTATA - " + messaggio)
    sys.exit(1)


# ----------------------------------------------------------------- immagini

def nuova_immagine(nome, lato):
    vecchia = bpy.data.images.get(nome)
    if vecchia:
        bpy.data.images.remove(vecchia)
    # buffer in virgola mobile: la divisione per l'alfa su 8 bit amplificherebbe
    # l'arrotondamento proprio sui texel di bordo, che sono quelli da salvare
    img = bpy.data.images.new(nome, lato, lato, alpha=True, float_buffer=True, is_data=True)
    img.colorspace_settings.name = 'Non-Color'
    img.pixels.foreach_set(np.tile(np.array(FONDO, dtype=np.float32), lato * lato))
    return img


def leggi(img):
    """Legge la cottura e la SPACCHETTA: ritorna (rgb vero, maschera)."""
    buf = np.empty(img.size[0] * img.size[1] * 4, dtype=np.float32)
    img.pixels.foreach_get(buf)
    px = buf.reshape(img.size[1], img.size[0], 4)
    alfa = px[..., 3]
    maschera = alfa > (1.0 / 255.0)
    divisore = np.where(maschera, alfa, 1.0)
    rgb = px[..., :3] / divisore[..., None]
    return np.clip(rgb, 0.0, 1.0), maschera


def salva(px, percorso, nome):
    """
    Scrive il PNG e VERIFICA che sia sul disco. Non e' pignoleria: con un
    percorso relativo `img.save()` non ha scritto niente e non ha alzato
    niente - lo script dichiarava un file che non esisteva. Una cottura che
    riesce sempre non e' una cottura.
    """
    percorso = os.path.abspath(percorso)
    lato_y, lato_x = px.shape[0], px.shape[1]
    img = bpy.data.images.get(nome)
    if img:
        bpy.data.images.remove(img)
    img = bpy.data.images.new(nome, lato_x, lato_y, alpha=False, float_buffer=False, is_data=True)
    img.colorspace_settings.name = 'Non-Color'
    fuori = np.ones((lato_y, lato_x, 4), dtype=np.float32)
    fuori[..., :3] = np.clip(px[..., :3], 0.0, 1.0)
    img.pixels.foreach_set(fuori.ravel())
    img.file_format = 'PNG'
    img.filepath_raw = percorso
    img.save()
    if not os.path.isfile(percorso):
        morire("ho creduto di scrivere %s e sul disco non c'e'" % percorso)
    if os.path.getsize(percorso) < 1024:
        morire("%s pesa %d byte: non e' una texture"
               % (percorso, os.path.getsize(percorso)))
    return percorso


# ------------------------------------------------------------------- misura

def _vicini(a):
    """Le 8 traslazioni di un canale (il bordo e' fondo, non ci interessa)."""
    return np.stack([np.roll(np.roll(a, dy, 0), dx, 1)
                     for dy in (-1, 0, 1) for dx in (-1, 0, 1)
                     if not (dy == 0 and dx == 0)], axis=0)


def erodi(m):
    v = _vicini(m)
    return np.all(v, axis=0) & m


def maschera_uv(ob, lato):
    """
    I texel che le UV della bassa OCCUPANO davvero, rasterizzando i triangoli UV.
    Serve come denominatore: "copertura 88%" non vuol dire niente finche' non si
    sa quanto DOVEVA essere. Con questa, "il raggio non ha trovato l'alta"
    diventa un numero derivato dal modello invece che una soglia scelta a mano.
    """
    me = ob.data
    me.calc_loop_triangles()
    n_loop = len(me.loops)
    uv = np.empty(n_loop * 2, dtype=np.float64)
    me.uv_layers.active.data.foreach_get("uv", uv)
    uv = uv.reshape(n_loop, 2) * lato
    tri = np.empty(len(me.loop_triangles) * 3, dtype=np.int32)
    me.loop_triangles.foreach_get("loops", tri)
    tri = tri.reshape(-1, 3)

    m = np.zeros((lato, lato), dtype=bool)
    for t in tri:
        p = uv[t]
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
        m[y0:y1, x0:x1] |= dentro
    return m


def misura_normale(px, m, soglia, soglia_info=8.0):
    """
    Ritorna (dev_r, dev_g, per_cento_macchie, texel_utili).
    Macchia = texel che si stacca dalla MEDIANA dei suoi 8 vicini oltre soglia.
    La mediana e' scelta apposta: una rampa liscia (lo smusso) la attraversa
    indenne, un texel che ha preso la superficie sbagliata no.
    """
    if m.sum() == 0:
        return 0.0, 0.0, 100.0, 0, 0.0
    r, g = px[..., 0], px[..., 1]
    dev_r = float(np.std(r[m]) * 255.0)
    dev_g = float(np.std(g[m]) * 255.0)

    # Quanta INFORMAZIONE c'e' davvero. La deviazione standard da sola non basta:
    # misurata su un provino in cui l'alta E' la bassa vale ancora 7,79 livelli,
    # perche' e' dominata da pochi texel estremi sul bordo delle isole. La
    # frazione di texel che si scostano dal piatto separa i due casi: 5,84% sul
    # provino smussato contro 0,42% su quello senza smussi.
    scost = np.maximum(np.abs(r - 0.5), np.abs(g - 0.5)) * 255.0
    informativi = 100.0 * float((m & (scost > soglia_info)).sum()) / float(m.sum())

    med_r = np.median(_vicini(r), axis=0)
    med_g = np.median(_vicini(g), axis=0)
    scarto = np.maximum(np.abs(r - med_r), np.abs(g - med_g))

    interno = erodi(m)          # il bordo dell'isola non e' una macchia, e' un bordo
    utili = int(interno.sum())
    if utili == 0:
        return dev_r, dev_g, 100.0, 0, informativi
    macchie = int((interno & (scarto > soglia)).sum())
    return dev_r, dev_g, 100.0 * macchie / utili, utili, informativi


# -------------------------------------------------------------------- scena

def diagonale(ob):
    import mathutils
    punti = [ob.matrix_world @ mathutils.Vector(v) for v in ob.bound_box]
    xs = [p.x for p in punti]
    ys = [p.y for p in punti]
    zs = [p.z for p in punti]
    return ((max(xs) - min(xs)) ** 2 + (max(ys) - min(ys)) ** 2 + (max(zs) - min(zs)) ** 2) ** 0.5


def bersaglio(bassa, img):
    """Materiale temporaneo sulla bassa col nodo immagine attivo: e' li' che cuoce."""
    mat = bpy.data.materials.get("COTTURA_BERSAGLIO")
    if mat is None:
        mat = bpy.data.materials.new("COTTURA_BERSAGLIO")
    mat.use_nodes = True
    nt = mat.node_tree
    nodo = nt.nodes.get("BERSAGLIO")
    if nodo is None:
        nodo = nt.nodes.new("ShaderNodeTexImage")
        nodo.name = "BERSAGLIO"
    nodo.image = img
    for n in nt.nodes:
        n.select = False
    nodo.select = True
    nt.nodes.active = nodo
    bassa.data.materials.clear()
    bassa.data.materials.append(mat)
    return mat


def visibilita_raggi(ob, acceso):
    for attr in ("visible_camera", "visible_diffuse", "visible_glossy",
                 "visible_transmission", "visible_volume_scatter", "visible_shadow"):
        if hasattr(ob, attr):
            setattr(ob, attr, acceso)


def in_emissione(ob, ingresso):
    """
    Blender non sa cuocere la METALLICITA'. La si porta a spasso su un'emissione:
    l'ingresso del Principled (valore o collegamento) diventa il colore di un
    nodo Emission, si cuoce EMIT, e si rimette tutto a posto.
    """
    salvato = []
    for slot in ob.material_slots:
        mat = slot.material
        if not mat or not mat.use_nodes:
            continue
        nt = mat.node_tree
        out = next((n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL' and n.is_active_output), None)
        if out is None:
            continue
        link = next((l for l in nt.links if l.to_node == out and l.to_socket.name == 'Surface'), None)
        origine = link.from_socket if link else None
        bsdf = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        em = nt.nodes.new('ShaderNodeEmission')
        em.name = "COTTURA_EMIT"
        em.inputs['Color'].default_value = (0.0, 0.0, 0.0, 1.0)
        if bsdf is not None and ingresso in bsdf.inputs:
            inp = bsdf.inputs[ingresso]
            if inp.is_linked:
                nt.links.new(inp.links[0].from_socket, em.inputs['Color'])
            else:
                v = inp.default_value
                try:
                    v = float(v)
                    em.inputs['Color'].default_value = (v, v, v, 1.0)
                except TypeError:
                    em.inputs['Color'].default_value = tuple(v)
        nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
        salvato.append((nt, out, origine, em))
    return salvato


def rimetti(salvato):
    for nt, out, origine, em in salvato:
        nt.nodes.remove(em)
        if origine is not None:
            nt.links.new(origine, out.inputs['Surface'])


def cuoci(tipo, alta, bassa, est, raggio, margine, campioni, cage=None):
    scena = bpy.context.scene
    scena.cycles.samples = campioni
    # ─── IL CAMPIONAMENTO ADATTIVO RENDE `--campioni` UNA DECORAZIONE
    #
    # Cycles lo tiene acceso di serie: raggiunta la soglia di rumore si ferma,
    # e il numero di campioni chiesto non conta piu'. Misurato cuocendo
    # l'occlusione a 64 e poi a 512 campioni: **media 213,2 e deviazione 83,33
    # identiche**, e la stessa fascia granulosa sul fianco della pinna.
    #
    # Due valori molto diversi che danno lo stesso risultato non dicono che il
    # parametro non serva -- dicono che non arriva. E' la seconda volta in
    # questa cottura: era gia' successo col raggio, dove pero' il difetto stava
    # altrove davvero.
    scena.cycles.use_adaptive_sampling = False
    # Il denoise SOLO sull'occlusione. Su una normale sarebbe un danno: il
    # denoise inventa continuita' dove la mappa deve avere spigoli, ed e' la
    # ragione per cui questo file lo teneva spento per tutti.
    scena.cycles.use_denoising = (tipo == 'AO')
    b = scena.render.bake
    b.use_selected_to_active = True
    b.margin_type = 'ADJACENT_FACES'
    b.use_clear = False
    if tipo == 'NORMAL':
        b.normal_space = 'TANGENT'
        b.normal_r, b.normal_g, b.normal_b = 'POS_X', 'POS_Y', 'POS_Z'

    bpy.ops.object.select_all(action='DESELECT')
    alta.select_set(True)
    bassa.select_set(True)
    bpy.context.view_layer.objects.active = bassa

    kw = dict(type=tipo, use_selected_to_active=True, cage_extrusion=est,
              max_ray_distance=raggio, margin=margine, margin_type='ADJACENT_FACES',
              use_clear=False)
    if cage is not None:
        kw["use_cage"] = True
        kw["cage_object"] = cage.name
    esito = bpy.ops.object.bake(**kw)
    if 'FINISHED' not in esito:
        morire("bpy.ops.object.bake ha risposto %s cuocendo %s" % (esito, tipo))


# --------------------------------------------------------------- principale

def main():
    a = argomenti()
    if not os.path.isfile(a.blend):
        morire("il file %s non esiste" % a.blend)
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(a.blend))

    alta = bpy.data.objects.get(a.alta)
    bassa = bpy.data.objects.get(a.bassa)
    if alta is None or bassa is None:
        morire("oggetti non trovati: alta=%r bassa=%r; nella scena ci sono %s"
               % (a.alta, a.bassa, [o.name for o in bpy.data.objects]))
    if not bassa.data.uv_layers:
        morire("la bassa '%s' non ha UV: senza UV non c'e' dove cuocere" % a.bassa)

    for ob in (alta, bassa):
        if ob.name not in bpy.context.view_layer.objects:
            morire("l'oggetto '%s' non e' nel view layer" % ob.name)
        ob.hide_viewport = False
        ob.hide_render = False
        ob.hide_set(False)

    cage = bpy.data.objects.get(a.cage) if a.cage else None
    if a.cage and cage is None:
        morire("cage '%s' non trovato" % a.cage)

    d = diagonale(bassa)
    est = a.estrusione if a.estrusione is not None else round(d * 0.010, 6)
    raggio = a.raggio if a.raggio is not None else round(d * 0.050, 6)
    margine = a.margine if a.margine is not None else max(4, a.dimensione // 128)
    dist_ao = a.distanza_ao if a.distanza_ao is not None else round(d / 8.0, 6)
    prefisso = a.prefisso or bassa.name.lower()

    os.makedirs(a.uscita, exist_ok=True)

    scena = bpy.context.scene
    scena.render.engine = 'CYCLES'
    scena.cycles.device = 'GPU' if a.gpu else 'CPU'
    scena.cycles.use_denoising = False
    if scena.world is None:
        scena.world = bpy.data.worlds.new("MONDO")
    try:
        scena.world.light_settings.distance = dist_ao
    except Exception:
        pass

    dice("=" * 70)
    dice("COTTURA  %s  ->  %s" % (alta.name, bassa.name))
    dice("  facce alta %d   facce bassa %d" % (len(alta.data.polygons), len(bassa.data.polygons)))
    dice("  diagonale bassa  %.4f" % d)
    dice("  texture          %d px, margine %d texel" % (a.dimensione, margine))
    dice("  estrusione cage  %.6f   distanza di ricerca %.6f%s"
         % (est, raggio, ("  (cage: %s)" % cage.name) if cage else ""))
    dice("  occlusione       %d campioni, raggio %.4f" % (a.campioni, dist_ao))
    dice("=" * 70)

    materiali_bassa = list(bassa.data.materials)

    # ---- NORMALE ---------------------------------------------------------
    img_n = nuova_immagine("COTTURA_NORMALE", a.dimensione)
    bersaglio(bassa, img_n)
    cuoci('NORMAL', alta, bassa, est, raggio, margine, 1, cage)
    px_n, m_n = leggi(img_n)

    # ---- OCCLUSIONE / RUGOSITA' / METALLICITA' ---------------------------
    canali, maschere = {}, {}
    visibilita_raggi(bassa, False)      # la bassa non deve farsi ombra da sola
    img_o = nuova_immagine("COTTURA_AO", a.dimensione)
    bersaglio(bassa, img_o)
    cuoci('AO', alta, bassa, est, raggio, margine, a.campioni, cage)
    canali['O'], maschere['O'] = leggi(img_o)
    visibilita_raggi(bassa, True)

    img_r = nuova_immagine("COTTURA_RUGOSITA", a.dimensione)
    bersaglio(bassa, img_r)
    cuoci('ROUGHNESS', alta, bassa, est, raggio, margine, 1, cage)
    canali['R'], maschere['R'] = leggi(img_r)

    salvato = in_emissione(alta, 'Metallic')
    img_m = nuova_immagine("COTTURA_METALLO", a.dimensione)
    bersaglio(bassa, img_m)
    cuoci('EMIT', alta, bassa, est, raggio, margine, 1, cage)
    canali['M'], maschere['M'] = leggi(img_m)
    rimetti(salvato)

    bassa.data.materials.clear()
    for m in materiali_bassa:
        bassa.data.materials.append(m)

    # ---- impacchetta ORM come vuole glTF: O in R, R in G, M in B ---------
    # Ogni canale porta la SUA maschera. Le tre cotture non coprono esattamente
    # gli stessi texel (misurato: differiscono di qualche centesimo di per
    # cento sul bordo delle isole), e usarne una sola per tutti fa colare la
    # sentinella magenta dentro il canale sbagliato - si vedeva come un 254
    # nella metallicita' che invece e' costante.
    orm = np.zeros_like(canali['O'])
    for c, chiave, fondo in ((0, 'O', 1.0), (1, 'R', 1.0), (2, 'M', 0.0)):
        orm[..., c] = np.where(maschere[chiave], canali[chiave][..., 0], fondo)
    m_orm = maschere['O'] | maschere['R'] | maschere['M']

    px_out = px_n.copy()
    for c, fondo in ((0, 0.5), (1, 0.5), (2, 1.0)):
        px_out[..., c] = np.where(m_n, px_n[..., c], fondo)

    f_n = salva(px_out, os.path.join(a.uscita, "%s-normale.png" % prefisso), "USCITA_NORMALE")
    f_o = salva(orm, os.path.join(a.uscita, "%s-orm.png" % prefisso), "USCITA_ORM")

    # ---- MISURA ----------------------------------------------------------
    m_uv = maschera_uv(bassa, a.dimensione)
    dominio = m_n & m_uv          # cotto E dentro le UV: il margine dilatato e' ripetizione
    dev_r, dev_g, macchie, utili, informativi = misura_normale(px_n, dominio, a.soglia_macchia, a.soglia_informazione)
    area_uv = int(m_uv.sum())
    copertura = 100.0 * dominio.sum() / max(area_uv, 1)
    dice("")
    dice("MISURA della normale  (%s)" % os.path.basename(f_n))
    dice("  area UV della bassa     %d texel (%.2f%% della texture)"
         % (area_uv, 100.0 * area_uv / m_uv.size))
    dice("  cotta dentro l'area UV  %.2f%%   <- se crolla, il raggio non ha trovato l'alta"
         % copertura)
    dice("  texel utili misurati    %d" % utili)
    dice("  deviazione standard R   %.3f livelli  (piatta = 0)" % dev_r)
    dice("  deviazione standard G   %.3f livelli" % dev_g)
    dice("  texel con informazione  %.3f%%  (scarto da (128,128) oltre %.0f livelli)" % (informativi, a.soglia_informazione))
    dice("  scostamento medio da (128,128)  R %.2f  G %.2f"
         % (abs(float(np.mean(px_n[..., 0][dominio])) * 255 - 127.5),
            abs(float(np.mean(px_n[..., 1][dominio])) * 255 - 127.5)))
    dice("  macchie (scarto dalla mediana dei vicini > %.0f/255)  %.4f%%"
         % (a.soglia_macchia * 255, macchie))
    for nome, chiave in (("occlusione R", 'O'), ("rugosita' G", 'R'), ("metallicita' B", 'M')):
        mk = maschere[chiave] & m_uv
        c = canali[chiave][..., 0][mk]
        dice("  ORM %-15s min %6.1f  media %6.1f  max %6.1f  dev %5.2f  su %.2f%% dell'area UV"
             % (nome, c.min() * 255, c.mean() * 255, c.max() * 255, c.std() * 255,
                100.0 * mk.sum() / max(area_uv, 1)))
    dice("  scritto  %s" % f_o)

    if a.senza_cancelli:
        dice("")
        dice("(cancelli disattivati: nessun giudizio)")
        return

    guasti = []
    if informativi < a.min_informazione:
        guasti.append("la normale e' PIATTA: solo il %.3f%% dei texel si scosta da "
                      "(128,128), minimo richiesto %.3f%% (dev R %.2f, G %.2f). "
                      "O il raggio non ha trovato l'alta - alza --raggio - o l'alta "
                      "non ha niente in piu' della bassa, e allora non c'era da cuocere."
                      % (informativi, a.min_informazione, dev_r, dev_g))
    if dev_r < a.min_deviazione or dev_g < a.min_deviazione:
        guasti.append("la normale e' MORTA: dev R %.3f, G %.3f, minimo richiesto %.3f."
                      % (dev_r, dev_g, a.min_deviazione))
    if macchie > a.max_macchie:
        guasti.append("la normale e' MACCHIATA: %.4f%% dei texel, tetto %.4f%%. "
                      "Il raggio ha preso la superficie sbagliata: abbassa --estrusione "
                      "o --raggio, o passa un --cage." % (macchie, a.max_macchie))
    if copertura < a.min_copertura:
        guasti.append("l'area UV e' cotta solo al %.2f%%, minimo richiesto %.2f%%. "
                      "Il raggio esce dalla bassa e non trova l'alta: le due non "
                      "combaciano, oppure --raggio e' troppo corto."
                      % (copertura, a.min_copertura))

    if guasti:
        # I PNG sono gia' sul disco col nome buono. Una texture bocciata non deve
        # restare li' pronta da raccogliere: la rinomino, cosi' si puo' ancora
        # guardare per capire cos'e' andato storto ma nessuno la spedisce.
        for f in (f_n, f_o):
            marchiato = os.path.join(os.path.dirname(f), "RIFIUTATA-" + os.path.basename(f))
            if os.path.exists(marchiato):
                os.remove(marchiato)
            os.rename(f, marchiato)
        for g in guasti:
            dice("")
            dice("!! " + g)
        dice("")
        dice("   i due PNG sono stati rinominati RIFIUTATA-*: guardali, non spedirli.")
        morire("%d cancello/i rosso/i" % len(guasti))

    dice("")
    dice("COTTURA ACCETTATA - dev R %.2f / G %.2f, macchie %.4f%%, tetto %.2f%%"
         % (dev_r, dev_g, macchie, a.max_macchie))


if __name__ == "__main__":
    main()
