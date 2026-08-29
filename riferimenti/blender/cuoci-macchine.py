# -*- coding: utf-8 -*-
"""
PREPARA LE DUE MACCHINE PER LA COTTURA — ALTA e BASSA nello stesso .blend.

    blender -b -P cuoci-macchine.py -- <cartella> propulsione|giroscopio

Poi tocca a `cottura.py`, che e' generico e non va toccato.

─── PERCHE' NON C'E' LA «RIGA DI TAGLIO» DELL'IMPIANTO

`cuoci-impianto.py` prende la geometria eseguendo `glb-impianto.py` FINO a una
riga stampata che fa da segnaposto, e si ferma se quella riga sparisce. Nasce
cosi' perche' quel costruttore e' lineare: geometria e esportazione sono lo
stesso flusso, e l'unico modo di prendere la prima senza la seconda e' tagliare
il file a meta'.

`glb-macchine.py` non e' lineare: monta e esporta dentro `monta()`. Qui il
taglio e' un MODO — `MODO=cottura` fa costruire tutto e ritornare prima di
esportare. Lo scopo e' identico e la garanzia e' piu' forte: non c'e' nessuna
stringa da non toccare, e la geometria che si cuoce e' eseguita dallo STESSO
codice che la spedisce, non da un suo prefisso.

Resta valida la regola che quella riga proteggeva, ed e' la piu' importante di
tutta la catena: **l'atlante UV si fa in UN POSTO SOLO**, dentro `monta()`.
Due ricette di srotolamento in due file sono una sola finche' qualcuno non ne
tocca una: da li' in poi si cuoce su un atlante e si spedisce l'altro. Le
mappe si applicano, sono nitide, e stanno nel posto sbagliato. Nessun errore.

─── E LA MISURA CHE SERVE PRIMA DI COTTURARE

Stampa la densita' dell'atlante in px/cm, e quanti texel occupa un periodo del
rumore della rugosita' UNA VOLTA SPEDITO a 512. E' il numero che decide se la
variazione di rugosita' sopravvive o diventa sale e pepe: sotto i ~4 texel per
periodo il ricampionamento non la rende piu' fine, la trasforma in rumore ad
alta frequenza — che su un metallo e' esattamente il difetto che `LEGGIMI.md`
chiama «corroso».
"""
import bpy
import sys
import os
import math

argv = sys.argv[sys.argv.index('--') + 1:]
FUORI = argv[0]
QUALE = argv[1] if len(argv) > 1 else 'propulsione'
# I posizionali sono quelli PRIMA della prima opzione: il valore che segue
# un'opzione e' suo, non un posizionale. Preso a filtro su startswith('--'),
# il percorso del PNG finiva in SPEDITO.
_taglio = next((i for i, a in enumerate(argv) if a.startswith('--')), len(argv))
_pos = argv[:_taglio]
SPEDITO = int(_pos[2]) if len(_pos) > 2 else 512

QUI = os.path.dirname(os.path.abspath(__file__))
SORGENTE = os.path.join(QUI, 'glb-macchine.py')
RADICE = {'propulsione': 'PROPULSIONE', 'giroscopio': 'GIROSCOPIO'}[QUALE]


def dice(*a):
    print(*a)
    sys.stdout.flush()


# ── la geometria, dal costruttore, senza modificarlo ──────────────────────
os.environ['MODO'] = 'cottura'
os.environ.pop('MAPPE', None)
_vecchio = list(sys.argv)
sys.argv = ['blender', '-b', '-P', SORGENTE, '--', FUORI, QUALE]
exec(compile(open(SORGENTE, encoding='utf-8').read(), SORGENTE, 'exec'),
     {'__name__': 'geometria_macchine', '__file__': SORGENTE})
sys.argv = _vecchio

alta = bpy.data.objects.get(RADICE + '_ALTA')
bassa = bpy.data.objects.get(RADICE + '_BASSA')
if alta is None or bassa is None:
    raise SystemExit('ERRORE: %s_ALTA o %s_BASSA non esistono dopo la costruzione.'
                     % (RADICE, RADICE))


def area_3d(o):
    """Area in metri quadri, nello spazio di MONDO.

    `polygon.area` e' nello spazio LOCALE. Su questi oggetti la scala e' gia'
    applicata, quindi i due numeri coincidono — ma farlo dipendere da questo
    vorrebbe dire che il giorno in cui un pezzo arriva con una scala, l'area
    e' sbagliata e la densita' con lei, senza un errore. Si trasforma.
    """
    M = o.matrix_world
    tot = 0.0
    for p in o.data.polygons:
        vs = [M @ o.data.vertices[i].co for i in p.vertices]
        for k in range(1, len(vs) - 1):
            tot += (vs[k] - vs[0]).cross(vs[k + 1] - vs[0]).length / 2.0
    return tot


def area_uv(o):
    """Frazione del quadrato 0..1 effettivamente occupata dalle isole."""
    uv = o.data.uv_layers.active.data
    tot = 0.0
    for p in o.data.polygons:
        q = [uv[i].uv for i in p.loop_indices]
        for k in range(1, len(q) - 1):
            a, b, c = q[0], q[k], q[k + 1]
            tot += abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) / 2.0
    return tot


S = area_3d(bassa)
U = area_uv(bassa)
dice('')
dice('ATLANTE  superficie %.2f m2, isole %.1f%% del quadrato' % (S, U * 100))
for lato in (2048, SPEDITO):
    dens = lato * math.sqrt(U / S) / 100.0          # texel per centimetro
    dice('         a %4d px: %.2f texel/cm  (un texel = %.2f cm)'
         % (lato, dens, 1.0 / dens if dens else 0))

# ── quanti texel vale un periodo del rumore, DOVE conta: a 512 ────────────
#
# Si rilegge la scala dal costruttore invece di riscriverla qui: se qualcuno la
# cambia li', questo numero lo segue. Una costante copiata sarebbe la solita
# bugia che non da' errore.
_src = open(SORGENTE, encoding='utf-8').read()


def _cost(nome, dflt):
    for r in _src.splitlines():
        if r.startswith(nome + ' ='):
            return float(r.split('=')[1].split('#')[0].strip())
    return dflt


SCALA = _cost('SCALA_RUMORE', 14.0)
STIRO = _cost('STIRO', 25.0)
dens_sp = SPEDITO * math.sqrt(U / S) / 100.0
periodo_cm = 100.0 / SCALA
texel_periodo = periodo_cm * dens_sp
dice('')
dice('RUGOSITA  periodo %.1f cm nel verso stretto, %.1f cm in quello della '
     'lavorazione' % (periodo_cm, periodo_cm * STIRO))
dice('          a %d px vale %.1f texel per periodo  (serve >= 4; sotto, la '
     'variazione' % (SPEDITO, texel_periodo))
dice('          non diventa piu\' fine: diventa sale e pepe)')
if texel_periodo < 4.0:
    # SINTOMO: questo consiglio diceva «alza SCALA_RUMORE», ed e' ESATTAMENTE
    # il contrario. CAUSA: SCALA_RUMORE e' in periodi al METRO, quindi alzarla
    # accorcia il periodo e peggiora il rapporto coi texel. COME L'HO ISOLATA:
    # facendo il conto sul primo numero misurato (3,6 texel a scala 14) — per
    # arrivare a 4 servono 8 cm di periodo, cioe' scala 12,5: piu' BASSA.
    # Un cancello che si accende e poi manda dalla parte sbagliata e' peggio
    # di un cancello assente: quello almeno non fa perdere un giro.
    dice('          *** SOTTO SOGLIA: ABBASSA SCALA_RUMORE (serve <= %.1f) ***'
         % (dens_sp * 100.0 / 4.0))

dice('')
dice('FACCE    ALTA %d   BASSA %d   rapporto %.2f'
     % (len(alta.data.polygons), len(bassa.data.polygons),
        len(alta.data.polygons) / max(len(bassa.data.polygons), 1)))

# ══════════════════════════════════════════════════════════════════════════
#  L'OCCLUSIONE, NODO PER NODO
# ══════════════════════════════════════════════════════════════════════════
#
# SINTOMO: la prima cottura di queste macchine ha dato un'occlusione con media
# 84,5 e MEDIANA 8 — il 57% dei texel quasi neri — mentre quella che l'impianto
# spedisce ha media 194 e mediana 255. E la spazzata della distanza di ricerca
# non la muoveva: da 3 a 25 cm la media passava da 70 a 56. Un'occlusione che
# non risponde alla distanza non e' un'occlusione tarata male: e' superficie
# che NON VEDE IL CIELO a nessuna distanza, cioe' area sepolta dentro un altro
# solido.
# COME LA SI ISOLA: non guardando la mappa, che e' un atlante e non dice a chi
# appartiene un texel. Si campiona il PNG nel baricentro UV di ogni faccia e si
# fa la media PESATA SULL'AREA 3D, nodo per nodo. Cosi' il numero ha un nome.
#
#     blender -b -P cuoci-macchine.py -- <cartella> <quale> --occlusione <png>
if '--occlusione' in argv:
    # Il PNG lo legge BLENDER, non PIL: dentro Blender `PIL` non c'e' (provato:
    # ModuleNotFoundError), mentre `numpy` si' — `cottura.py` lo usa gia'.
    # E il colorspace va messo a Non-Color PRIMA di leggere i pixel, o Blender
    # restituisce i valori de-gammati e la media esce piu' scura del vero:
    # si starebbe misurando la propria conversione, non l'occlusione.
    import numpy as np
    png = argv[argv.index('--occlusione') + 1]
    _img = bpy.data.images.load(png, check_existing=False)
    _img.colorspace_settings.name = 'Non-Color'
    W, H = _img.size
    _px = np.empty(W * H * 4, dtype=np.float32)
    _img.pixels.foreach_get(_px)
    # Blender consegna le righe dal BASSO: si capovolge, cosi' il campionamento
    # con (1 - v) qui sotto vale come su un PNG letto dall'alto.
    im = _px.reshape(H, W, 4)[::-1, :, 0] * 255.0
    dice('')
    dice('OCCLUSIONE per nodo (0 = sepolto, 255 = vede il cielo)   da %s'
         % os.path.basename(png))
    dice('%-20s %9s %7s %7s' % ('nodo', 'area m2', 'media', '% < 32'))
    dice('-' * 48)
    tot_a = tot_s = 0.0
    for o in sorted([x for x in bpy.data.objects
                     if x.type == 'MESH' and x.name.endswith('_MESH')],
                    key=lambda x: x.name):
        uv = o.data.uv_layers.active.data
        M = o.matrix_world
        somma = area = scuro = 0.0
        for pgn in o.data.polygons:
            vs = [M @ o.data.vertices[i].co for i in pgn.vertices]
            a = 0.0
            for k in range(1, len(vs) - 1):
                a += (vs[k] - vs[0]).cross(vs[k + 1] - vs[0]).length / 2.0
            q = [uv[i].uv for i in pgn.loop_indices]
            cu = sum(x.x for x in q) / len(q)
            cv = sum(x.y for x in q) / len(q)
            px = im[min(H - 1, max(0, int((1 - cv) * H))), min(W - 1, max(0, int(cu * W)))]
            somma += px * a
            area += a
            if px < 32:
                scuro += a
        if area <= 0:
            continue
        tot_a += area
        tot_s += somma
        dice('%-20s %9.3f %7.1f %6.1f%%'
             % (o.name[:-5], area, somma / area, 100 * scuro / area))
    dice('-' * 48)
    dice('%-20s %9.3f %7.1f' % ('TUTTO', tot_a, tot_s / max(tot_a, 1e-9)))
    raise SystemExit(0)

os.makedirs(FUORI, exist_ok=True)
BLEND = os.path.join(FUORI, '%s-cottura.blend' % QUALE)
bpy.ops.wm.save_as_mainfile(filepath=BLEND)
dice('BLEND    %s  (%.0f KB)' % (BLEND, os.path.getsize(BLEND) / 1024))
