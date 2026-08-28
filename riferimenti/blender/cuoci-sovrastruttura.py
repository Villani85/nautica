# -*- coding: utf-8 -*-
"""
PASS PBR · LA COTTURA DELLA SOVRASTRUTTURA

    blender -b -P cuoci-sovrastruttura.py -- prepara

Fa una cosa sola: prende `sovrastruttura-uv.blend`, che ha gia' la BASSA con
l'atlante, e ne ricava l'ALTA da cui cuocere. Poi salva un blend che
`cottura.py` -- il forno, che e' generico -- puo' mangiare senza modifiche.

═══════════════════════════════════════════════════════════════════════════
PERCHE' LA SOVRASTRUTTURA E NON SOLO IL MECCANISMO
═══════════════════════════════════════════════════════════════════════════

Il meccanismo ha gia' il suo corredo: normale e occlusione su 9 materiali su 9.
La sovrastruttura no. Verificato leggendo il GLB spedito: 5 materiali, tutti
con `occlusionTexture`, NESSUNO con `normalTexture`, e fra gli attributi non
c'e' TANGENT. Ha le UV e l'occlusione, e le manca la normale.

E si vede, perche' e' la massa bianca piu' grande dell'inquadratura: legge come
carta. Due revisioni indipendenti hanno usato la stessa frase per il sito,
"linguaggio di una buona demo tecnica, non di un oggetto reale fotografato", e
la ragione materiale e' questa -- una superficie omogenea a ogni scala.

Uno spigolo vero non e' uno spigolo: e' un raccordo di pochi millimetri che
raccoglie una riga di luce, ed e' quella riga a dire all'occhio che l'oggetto
e' stato fatto e non disegnato.

═══════════════════════════════════════════════════════════════════════════
DA DOVE VIENE L'ALTA, E PERCHE' NON C'ERA
═══════════════════════════════════════════════════════════════════════════

Per l'impianto l'alta si ottiene applicando gli smussi che i pezzi si portano
gia' addosso da `glb-impianto.py`. Qui no: `sovrastruttura-uv.blend` contiene
due mesh gia' unite e senza modificatori, perche' il passo 1 -- l'atlante --
aveva finito il suo lavoro e non serviva altro.

Quindi lo smusso lo mette questo file, e i numeri sono dichiarati:

  --raggio 0.012   dodici millimetri, l'ordine di grandezza dei raccordi veri
                   su una sovrastruttura in alluminio o composito. Sotto i 5 mm
                   la riga di luce non arriva a un pixel alla distanza da cui
                   la camera guarda la nave; sopra i 25 lo spigolo si arrotonda
                   e la nave perde il suo taglio.
  --segmenti 2     due bastano per una riga di luce. Il terzo non si vede e
                   raddoppia le facce dell'alta, che e' quella che si cuoce.
  --angolo 30      solo gli spigoli veri. Sopra i 30 gradi si smussano anche le
                   giunzioni piatte fra pannelli, che un raccordo non ce l'hanno.

═══════════════════════════════════════════════════════════════════════════
LE DUE MESH SI UNISCONO, E NON E' UN DETTAGLIO
═══════════════════════════════════════════════════════════════════════════

`SOVRASTRUTTURA_MESH` e `COPERTA_MESH` condividono UN atlante -- lo dice il
passo 1, ed e' la ragione per cui esiste. Cuocerle separate produrrebbe due
mappe che si contendono lo stesso spazio UV: si uniscono prima del forno.

La coperta porta un SECONDO canale UV, `TEAK_CORSI`, per le fughe del teak. Il
join lo conserva solo se anche l'altra mesh ha un canale con lo stesso nome:
qui si aggiunge vuoto alla sovrastruttura prima di unire, o Blender lo butta in
silenzio. E' un difetto che non da' errore -- solo un teak senza fughe.
"""
import bpy
import os
import sys
import math

ARG = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
AZIONE = ARG[0] if ARG else 'prepara'


def opt(nome, pre):
    if nome in ARG:
        return type(pre)(ARG[ARG.index(nome) + 1])
    return pre


RAGGIO = opt('--raggio', 0.012)
SEGMENTI = opt('--segmenti', 2)
ANGOLO = opt('--angolo', 30.0)

QUI = os.path.dirname(os.path.abspath(__file__))
USCITE = os.path.join(QUI, 'uscite')
SORGENTE = os.path.join(USCITE, 'sovrastruttura-uv.blend')
DESTINAZIONE = os.path.join(USCITE, 'sovrastruttura-cottura.blend')

NOME_ALTA = 'SOVRA_ALTA'
NOME_BASSA = 'SOVRA_BASSA'


def dice(s):
    print(s)
    sys.stdout.flush()


def prepara():
    bpy.ops.wm.open_mainfile(filepath=SORGENTE)

    mesh = [o for o in bpy.data.objects if o.type == 'MESH']
    if not mesh:
        raise SystemExit('ERRORE: %s non contiene nessuna mesh' % SORGENTE)
    dice('SORGENTE  %s' % os.path.basename(SORGENTE))
    for o in mesh:
        dice('  %-24s facce %6d  materiali %d  uv %s'
             % (o.name, len(o.data.polygons), len(o.data.materials),
                [l.name for l in o.data.uv_layers]))

    # i canali UV devono coincidere PRIMA del join, o spariscono senza un errore
    canali = set()
    for o in mesh:
        canali |= set(l.name for l in o.data.uv_layers)
    for o in mesh:
        suoi = set(l.name for l in o.data.uv_layers)
        for c in sorted(canali - suoi):
            o.data.uv_layers.new(name=c)
            dice('  canale UV vuoto "%s" aggiunto a %s (o il join lo butterebbe)'
                 % (c, o.name))

    # via i genitori tenendo la posizione: il join li mescolerebbe
    bpy.ops.object.select_all(action='DESELECT')
    for o in mesh:
        o.select_set(True)
    bpy.context.view_layer.objects.active = mesh[0]
    bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
    for v in [o for o in list(bpy.data.objects) if o.type == 'EMPTY']:
        bpy.data.objects.remove(v, do_unlink=True)

    # la BASSA: le due mesh unite
    bpy.ops.object.select_all(action='DESELECT')
    for o in mesh:
        o.select_set(True)
    bpy.context.view_layer.objects.active = mesh[0]
    bpy.ops.object.join()
    bassa = bpy.context.view_layer.objects.active
    bassa.name = NOME_BASSA
    bassa.data.name = NOME_BASSA

    # la ALTA: copia con gli smussi applicati
    alta = bassa.copy()
    alta.data = bassa.data.copy()
    alta.name = NOME_ALTA
    alta.data.name = NOME_ALTA
    bpy.context.collection.objects.link(alta)
    bpy.ops.object.select_all(action='DESELECT')
    alta.select_set(True)
    bpy.context.view_layer.objects.active = alta
    m = alta.modifiers.new(name='smusso', type='BEVEL')
    m.width = RAGGIO
    m.segments = SEGMENTI
    m.limit_method = 'ANGLE'
    m.angle_limit = math.radians(ANGOLO)
    m.harden_normals = True
    bpy.ops.object.shade_smooth()
    bpy.ops.object.modifier_apply(modifier=m.name)

    guadagno = len(alta.data.polygons) / max(1, len(bassa.data.polygons))
    dice('')
    dice('BASSA   %-12s facce %6d  materiali %d  uv %s'
         % (NOME_BASSA, len(bassa.data.polygons), len(bassa.data.materials),
            [l.name for l in bassa.data.uv_layers]))
    dice('ALTA    %-12s facce %6d  (%.2f volte la bassa)'
         % (NOME_ALTA, len(alta.data.polygons), guadagno))
    dice('SMUSSO  raggio %.3f m, %d segmenti, angolo %.0f gradi'
         % (RAGGIO, SEGMENTI, ANGOLO))

    # IL CANCELLO: se l'alta non ha piu' facce della bassa non c'e' niente da
    # cuocere, e la mappa uscirebbe piatta senza dirlo. E' il difetto peggiore
    # possibile qui: una cottura che riesce e non contiene informazione.
    if guadagno < 1.5:
        raise SystemExit(
            'ERRORE: l alta ha solo %.2f volte le facce della bassa. Lo smusso '
            'non ha morso: o l angolo e troppo stretto, o la geometria non ha '
            'spigoli veri. Una cottura cosi darebbe una normale piatta e NON lo '
            'direbbe.' % guadagno)

    bpy.ops.wm.save_as_mainfile(filepath=DESTINAZIONE)
    dice('SCRITTO %s' % os.path.basename(DESTINAZIONE))


if AZIONE == 'prepara':
    prepara()
else:
    raise SystemExit('azione sconosciuta: %s' % AZIONE)
