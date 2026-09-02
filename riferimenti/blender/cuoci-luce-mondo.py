# -*- coding: utf-8 -*-
"""
B8b - LA LUCE DELLE STANZE, COTTA.

    blender -b -P riferimenti/blender/cuoci-luce-mondo.py -- [--campioni 512] [--gpu]

--- PERCHE' ESISTE

Le plafoniere della traversata sono luci VERE, e in three il numero di luci
entra nella chiave del programma di ogni materiale: ogni volta che cambia,
tutta la scena si ricompila -- misurato, 5,3 secondi alla giunzione fra
traversata e salone e 1,3 a un terzo della coda -- e finche' restano accese
ogni frammento le paga, 75 ms di fotogramma per luce su GPU software.

Ma le stanze non si muovono e le lampade nemmeno. La loro luce e' un DATO, come
l'occlusione: si cuoce una volta e si moltiplica.

--- COSA CUOCE, E SU CHE COSA

Cuoce DIFFUSE con i passaggi DIRETTO e INDIRETTO e senza COLORE: il risultato
e' la luce che arriva su ogni punto, senza l'albedo del materiale. Il sito la
moltiplica sui propri materiali procedurali (lightMap di three), quindi il
colore resta suo e la luce diventa cotta.

E la cuoce SUL GLB GIA' ESPORTATO -- public/modelli/traversata-world.glb -- non
sulla scena ricostruita. Le UV di quelle stanze sono nate da uno smart_project
dentro la cottura dell'AO: rifare l'assemblaggio le rifarebbe DIVERSE, e la
mappa della luce cadrebbe su un'altra disposizione. Il GLB porta le UV vere del
sito, ed e' l'unico posto dove sono.

--- IL FOTOREALISMO, e le scelte prese qui

  * LAMPADE AD AREA, non punti. La plafoniera del sito e' un rettangolo di
    50x12 cm, e una sorgente estesa da' ombre morbide con la penombra che
    cresce con la distanza: e' la differenza fra una stanza fotografata e una
    renderizzata trent'anni fa.
  * la lampada sta dove il sito la mette -- le posizioni arrivano misurate da
    esporta-luci-mondo.mjs -- e guarda in giu', come il corpo illuminante vero.
  * INDIRETTO ACCESO: il rimbalzo sulle paratie chiare e' quello che riempie le
    ombre, ed e' cio' che il tempo reale non ha.
  * MONDO NERO: sotto coperta non entra cielo.
  * campioni alti e denoise: si cuoce una volta sola.

--- DOVE SI CUOCE, e la trappola gia' pagata

Su Colab, con la T4: 2048 campioni per i tre atlanti in 112 secondi in tutto
(29 + 31 + 45). In locale, sulla CPU di questo PC, 400 campioni ne prendono
223: la GPU non e' un lusso, e' la differenza fra iterare e aspettare.

Il giro e':

    colab new -s luce --gpu T4
    installa Blender 5.2 sulla VM (45 s, la VM riparte vuota ogni volta)
    upload cuoci-luce-mondo.py, luci-mondo.json, traversata-world.glb
    blender -b -P cuoci-luce-mondo.py -- --campioni 2048 --gpu
       --glb /content/traversata-world.glb --luci /content/luci-mondo.json
       --uscita /content/cotto
    download dei tre PNG

E LA TRAPPOLA: su questo PC `colab.exe` non parte -- «un criterio di controllo
dell'applicazione ha bloccato il file», cioe' Smart App Control. Il pacchetto
pero' c'e' e funziona: si chiama il suo `main` dal python del suo ambiente,

    %APPDATA%/uv/tools/google-colab-cli/Scripts/python.exe
        -c "from colab_cli.cli import main; main()" <comando>

Chi riprende non perda mezz'ora a reinstallare: non e' rotto, e' bloccato.

--- COSA NON CUOCE

L'ARREDO -- tubi, staffe, macchine, corrimano -- non e' nel GLB: nasce in JS a
runtime (arredo-mondo.js). Nella cottura non c'e', quindi non fa ombra e non
riceve luce cotta. Il sito continua a illuminarlo con una lampada sola, e
questo file non finge il contrario.
"""
import bpy
import json
import math
import os
import sys

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(os.path.dirname(QUI))
GLB = os.path.join(RADICE, 'public', 'modelli', 'traversata-world.glb')
LUCI = os.path.join(QUI, 'luci-mondo.json')
USCITE = os.path.join(QUI, 'uscite')

# Quali materiali stanno su quale atlante, e quanto e' grande.
# I nomi vengono dal GLB; le misure dai PNG dell'AO, che condividono le UV.
ATLANTI = [
    ('stair_corridor', 512, lambda n: n.startswith('CORRIDOIO')),
    ('engine_room', 640, lambda n: n.startswith('MECH') and 'engine_room' in n),
    ('mechanism_bay', 768, lambda n: n.startswith('MECH') and 'engine_room' not in n),
]


def dice(*a):
    print(*a)
    sys.stdout.flush()


def morire(m):
    dice('')
    dice('FERMO: ' + m)
    sys.exit(2)


def argomenti():
    import argparse
    argv = sys.argv
    argv = argv[argv.index('--') + 1:] if '--' in argv else []
    p = argparse.ArgumentParser()
    p.add_argument('--campioni', type=int, default=512)
    p.add_argument('--watt', type=float, default=18.0)
    p.add_argument('--watt-salone', type=float, default=90.0, dest='watt_salone')
    p.add_argument('--margine', type=int, default=6)
    p.add_argument('--gpu', action='store_true')
    p.add_argument('--uscita', default=USCITE)
    # su Colab il GLB e le luci non stanno dove stanno qui: si dicono
    p.add_argument('--glb', default=GLB)
    p.add_argument('--luci', default=LUCI)
    return p.parse_args(argv)


def accendi_gpu(scena):
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for tipo in ('OPTIX', 'CUDA', 'HIP', 'ONEAPI'):
        try:
            prefs.compute_device_type = tipo
        except Exception:
            continue
        prefs.get_devices()
        gpu = [d for d in prefs.devices if d.type == tipo]
        if gpu:
            for d in prefs.devices:
                d.use = (d.type == tipo)
            scena.cycles.device = 'GPU'
            dice('  GPU        %s: %s' % (tipo, ', '.join(d.name for d in gpu)))
            return True
    dice('  GPU        nessuna: si cuoce in CPU')
    return False


def main():
    a = argomenti()
    dice('=' * 78)
    dice('B8b - COTTURA DELLA LUCE delle stanze')
    dice('=' * 78)

    glb = a.glb
    luci = a.luci
    if not os.path.exists(glb):
        morire('non trovo %s' % glb)
    if not os.path.exists(luci):
        morire('non trovo %s: lancia prima esporta-luci-mondo.mjs' % luci)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb)
    maglie = [o for o in bpy.data.objects if o.type == 'MESH']
    dice('  importate  %d maglie da %s' % (len(maglie), os.path.basename(glb)))
    if not maglie:
        morire('il GLB non porta maglie')

    dati = json.load(open(luci, encoding='utf-8'))
    dice('  lampade    %d dal file, misurate dal sito (%s)'
         % (len(dati['luci']), dati['quando']))
    for i, l in enumerate(dati['luci']):
        x, y, z = l['p']
        # il file e' nel frame del mondo (y in alto); Blender e' Z-up
        bx, by, bz = x, -z, y
        salone = l['portata'] > 5
        d = bpy.data.lights.new('PLAFONIERA_%02d' % i, type='AREA')
        d.shape = 'RECTANGLE'
        d.size = 0.9 if salone else 0.5
        d.size_y = 0.5 if salone else 0.12
        d.energy = a.watt_salone if salone else a.watt
        c = l['colore'].lstrip('#')
        d.color = tuple(int(c[k:k + 2], 16) / 255.0 for k in (0, 2, 4))
        o = bpy.data.objects.new(d.name, d)
        o.location = (bx, by, bz)
        o.rotation_euler = (math.pi, 0, 0)
        bpy.context.collection.objects.link(o)

    sc = bpy.context.scene
    if sc.world is None:
        sc.world = bpy.data.worlds.new('MONDO')
    sc.world.use_nodes = True
    sfondo = sc.world.node_tree.nodes.get('Background')
    if sfondo:
        sfondo.inputs[0].default_value = (0, 0, 0, 1)
        sfondo.inputs[1].default_value = 0.0
    dice('  mondo      nero: sotto coperta non entra cielo')

    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    if a.gpu:
        accendi_gpu(sc)
    sc.cycles.samples = a.campioni
    sc.cycles.use_adaptive_sampling = False
    sc.cycles.use_denoising = True
    # il denoise del BAKE e' un interruttore suo, e non c'e' in tutte le
    # versioni: senza, una cottura a pochi campioni esce granulosa e la grana
    # finisce dritta sulle pareti del sito
    if hasattr(sc.render.bake, 'use_denoising'):
        sc.render.bake.use_denoising = True
        dice('  denoise    acceso anche sul bake')
    else:
        dice('  denoise    il bake di questa versione non lo espone')
    sc.render.bake.use_pass_direct = True
    sc.render.bake.use_pass_indirect = True
    sc.render.bake.use_pass_color = False
    sc.render.bake.use_selected_to_active = False
    sc.render.bake.margin = a.margine
    sc.render.bake.margin_type = 'ADJACENT_FACES'
    sc.render.bake.use_clear = False

    os.makedirs(a.uscita, exist_ok=True)
    import numpy as np
    import time
    guasti = []
    divisori = {}

    for nome, lato, appartiene in ATLANTI:
        bersagli = [o for o in maglie
                    if o.data.materials and o.data.materials[0]
                    and appartiene(o.data.materials[0].name)]
        dice('')
        dice('-' * 78)
        dice('  atlante    %s  %dx%d  -  %d maglie' % (nome, lato, lato, len(bersagli)))
        if not bersagli:
            guasti.append('%s: nessuna maglia' % nome)
            continue
        if not all(o.data.uv_layers for o in bersagli):
            guasti.append('%s: qualche maglia non ha UV' % nome)
            continue

        img = bpy.data.images.new('LUCE_' + nome, lato, lato, alpha=True,
                                  float_buffer=True, is_data=True)
        img.colorspace_settings.name = 'Non-Color'
        img.pixels.foreach_set(
            np.tile(np.array((0.0, 0.0, 0.0, 0.0), dtype=np.float32), lato * lato))

        materiali = []
        for o in bersagli:
            for m in o.data.materials:
                if m is not None and m not in materiali:
                    materiali.append(m)
        for m in materiali:
            if not m.use_nodes:
                m.use_nodes = True
            n = m.node_tree.nodes.new('ShaderNodeTexImage')
            n.name = 'COTTURA_LUCE'
            n.image = img
            for altro in m.node_tree.nodes:
                altro.select = False
            n.select = True
            m.node_tree.nodes.active = n

        bpy.ops.object.select_all(action='DESELECT')
        for o in bersagli:
            o.select_set(True)
        bpy.context.view_layer.objects.active = bersagli[0]

        t0 = time.time()
        esito = bpy.ops.object.bake(type='DIFFUSE', use_selected_to_active=False,
                                    margin=a.margine, margin_type='ADJACENT_FACES',
                                    use_clear=False)
        secondi = time.time() - t0
        if 'FINISHED' not in esito:
            guasti.append('%s: bake ha risposto %s' % (nome, esito))
            continue

        buf = np.empty(lato * lato * 4, dtype=np.float32)
        img.pixels.foreach_get(buf)
        q = buf.reshape(lato, lato, 4)
        alfa = q[..., 3]
        cotti = alfa > (1.0 / 255.0)
        val = q[..., :3][cotti]
        copertura = 100.0 * cotti.sum() / (lato * lato)
        media = float(val.mean()) if val.size else 0.0
        massimo = float(val.max()) if val.size else 0.0
        minimo = float(val.min()) if val.size else 0.0
        dice('  cotto in   %.1f s  -  copertura %.2f%%  -  media %.4f  -  massimo %.4f'
             % (secondi, copertura, media, massimo))

        if media < 1e-4:
            guasti.append('%s: LUCE NERA (media %.5f): le lampade non illuminano niente.'
                          % (nome, media))
        if massimo - minimo < 1e-3:
            guasti.append('%s: LUCE PIATTA: nessuna variazione, non e una cottura.' % nome)
        if copertura < 60:
            guasti.append('%s: solo il %.1f%% dell atlante e stato scritto.' % (nome, copertura))

        # ---- SI NORMALIZZA, e il divisore si scrive accanto ----------------
        #
        # La luce cotta e' HDR: vicino alla plafoniera arriva a 43, sul pagliolo
        # sta a 0,02. Un PNG a otto bit tiene 0..1, quindi senza normalizzare si
        # perderebbe tutto tranne le macchie bianche. Si divide per il 99esimo
        # percentile -- l'uno per cento piu' luminoso si taglia, ed e' il vetro
        # della lampada, non la stanza -- e il divisore va in un file accanto,
        # cosi' il sito puo' rimoltiplicare invece di indovinare un numero.
        p99 = float(np.percentile(val, 99)) if val.size else 1.0
        divisore = max(p99, 1e-6)
        q[..., :3] = np.clip(q[..., :3] / divisore, 0.0, 1.0)
        q[..., 3] = 1.0
        img.pixels.foreach_set(q.reshape(-1))
        dice('  normalizzo p99 %.4f  ->  divisore %.4f' % (p99, divisore))
        divisori[nome] = round(divisore, 6)

        via = os.path.join(a.uscita, '%s-luce.png' % nome)
        img.filepath_raw = via
        img.file_format = 'PNG'
        img.save()
        dice('  scritto    %s' % via)

    if divisori:
        via = os.path.join(a.uscita, 'luce-divisori.json')
        with open(via, 'w', encoding='utf-8') as f:
            json.dump({
                'cosa': 'per cosa e stata divisa ogni mappa di luce prima di salvarla in PNG',
                'watt': a.watt, 'watt_salone': a.watt_salone, 'campioni': a.campioni,
                'divisori': divisori
            }, f, indent=1)
            f.write(chr(10))
        dice('')
        dice('  divisori   %s' % via)

    dice('')
    dice('=' * 78)
    if guasti:
        for g in guasti:
            dice('  GUASTO  ' + g)
        morire('la cottura della luce non e valida')
    dice('  COTTURA DELLA LUCE COMPLETA')


main()
