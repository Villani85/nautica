"""
PASS PBR · passo 1 — L'ATLANTE UV UNICO DELL'IMPIANTO

    "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" -b -P uv-impianto.py -- <cartella>

Opzioni (tutte con un valore misurato accanto, nessuna scelta per gusto):

    --atlante N          lato dell'atlante in pixel, per il calcolo dei texel (2048)
    --margine-px P       gutter fra le isole, in pixel di quell'atlante (8)
    --forma F            AABB | CONVEX | CONCAVE, come il packer vede le isole
                         (CONVEX: CONCAVE le fa toccare, misurato al §5)
    --rapporto-max R     il cancello: densita' massima / minima ammessa (10)
    --senza-pareggio     NON pareggia la densita' fra le isole. Serve a far
                         vedere il difetto: e' il primo tentativo, quello che
                         sfonda il cancello. Non e' una via d'uscita
    --priorita           declassa il fasciame a mezza densita' (vedi in fondo)
    --senza-raster       salta la misura rasterizzata del gutter (piu' veloce)

─── PERCHE' UN ATLANTE SOLO

Le mappe cotte (normale, AO, rugosita') sono file: ogni atlante in piu' e' una
`fetch` in piu' per fotogramma e un file in piu' da scaricare. L'impianto sta
in quattordici nodi ma e' UN oggetto solo per chi guarda, e la camera ci arriva
a 2,6 unita': serve densita' di texel dove si vede, non un atlante per pezzo.

─── LA GEOMETRIA NON SI RISCRIVE, SI RIUSA

`glb-impianto.py` non si tocca: e' lui la verita' sulla forma del meccanismo, e
due copie della stessa geometria divergono il giorno dopo. Qui se ne esegue il
sorgente FINO AL TAGLIO — la riga della cottura dell'occlusione — cosi' la mesh
e' bit per bit la stessa che finisce nel sito, senza cuocere niente (la cottura
dell'AO nei vertici e' il passo che queste UV serviranno a SOSTITUIRE).

Se un giorno quella riga sparisse, questo file si ferma con un errore invece di
srotolare una geometria a caso: e' scritto sotto, `TAGLIO`.

─── I MODIFICATORI VANNO APPLICATI PRIMA DI SROTOLARE

Stesso motivo per cui `glb-impianto.py` li applica prima di cuocere: le UV si
scrivono sui loop che ESISTONO. Srotolando prima degli smussi si otterrebbe un
atlante su 3.528 facce e poi 44.000 triangoli senza coordinate.

─── COSA MISURA, E PERCHE' QUELLE MISURE

`docs/15` dichiara il cancello: se un pezzo prende dieci volte piu' texel di un
altro, l'impacchettamento ha sprecato l'atlante su qualcosa che non si vede. La
densita' di texel e' quindi l'unica misura che conta, e si stampa per pezzo:

    px/cm = lato_atlante * sqrt(area_uv / area_3d_in_m2) / 100

Accanto ci vanno il numero di isole (quante cuciture) e l'occupazione — quella
ANALITICA, somma delle aree UV, e quella MISURATA rasterizzando le isole in un
buffer del lato dell'atlante. Le due si controllano a vicenda: se la misurata e'
sensibilmente piu' bassa della analitica, delle isole si sovrappongono e la
cottura scrivera' un pezzo sopra l'altro.
"""
import bpy, sys, os, math, time
from mathutils import Vector

T0 = time.time()

# ─── argomenti ────────────────────────────────────────────────────────────
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
QUI = os.path.dirname(os.path.abspath(__file__))


def opz(nome, dflt, tipo=float):
    return tipo(argv[argv.index(nome) + 1]) if nome in argv else dflt


posizionali = [a for a in argv if not a.startswith('--')]
FUORI = posizionali[0] if posizionali else os.path.join(QUI, 'uscite')
ATLANTE = opz('--atlante', 2048, int)
MARGINE_PX = opz('--margine-px', 8.0)
RAPPORTO_MAX = opz('--rapporto-max', 10.0)
FORMA = opz('--forma', 'CONVEX', str)
PAREGGIO = '--senza-pareggio' not in argv
PRIORITA = '--priorita' in argv
RASTER = '--senza-raster' not in argv

# Il fasciame e' una lamiera piatta di 2,6 x 2,2 m: e' il pezzo piu' esteso
# dell'assieme e il meno guardato. `--priorita` lo declassa a mezza densita'
# lineare — un quarto dell'area d'atlante — restando dentro il cancello.
PESO_DENSITA = {'STATIC_HULL_PLATE_MESH': 0.5} if PRIORITA else {}

# ─── §1 · la geometria, presa da glb-impianto.py senza modificarlo ────────
SORGENTE = os.path.join(QUI, 'glb-impianto.py')
TAGLIO = "print('COTTURA occlusione ambientale...')"
sorgente = open(SORGENTE, encoding='utf-8').read()
if TAGLIO not in sorgente:
    raise SystemExit(
        "ERRORE: in glb-impianto.py non c'e' piu' la riga di taglio %r.\n"
        "Non srotolo una geometria che non so dove finisce: aggiorna TAGLIO." % TAGLIO)

argv_vero = list(sys.argv)
sys.argv = ['blender', '-b', '-P', SORGENTE, '--', FUORI]
print('GEOMETRIA da glb-impianto.py (%d righe su %d)'
      % (sorgente[:sorgente.index(TAGLIO)].count('\n'), sorgente.count('\n')))
exec(compile(sorgente[:sorgente.index(TAGLIO)], SORGENTE, 'exec'),
     {'__name__': 'geometria_impianto', '__file__': SORGENTE})
sys.argv = argv_vero

pezzi = [o for o in bpy.data.objects if o.type == 'MESH']
pezzi.sort(key=lambda o: o.name)
if not pezzi:
    raise SystemExit('ERRORE: nessuna mesh dopo la costruzione della geometria.')

# ─── §2 · i modificatori applicati ────────────────────────────────────────
bpy.ops.object.select_all(action='DESELECT')
facce_prima = sum(len(o.data.polygons) for o in pezzi)
for o in pezzi:
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=m.name)
        except RuntimeError:
            o.modifiers.remove(m)
facce = sum(len(o.data.polygons) for o in pezzi)
print('MODIFICATORI applicati: %d facce -> %d facce su %d pezzi'
      % (facce_prima, facce, len(pezzi)))

# ─── §3 · proiezione automatica, un pezzo alla volta ──────────────────────
# `angle_limit` a 66 gradi e' il valore di fabbrica e va bene qui: piu' basso
# spezza i cilindri in fettine, piu' alto stira le calotte.
# `island_margin` a ZERO di proposito: il margine vero lo mette l'unico
# impacchettamento che conta, quello finale. Metterlo anche qui vorrebbe dire
# pagarlo due volte, perche' il pack successivo NON lo ricompatta.
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
print('SROTOLAMENTO fatto su %d pezzi (%.0f s)' % (len(pezzi), time.time() - T0))

# ─── §4 · il pareggio della densita', che e' TUTTO il passo ───────────────
#
# `smart_project` normalizza OGNI oggetto dentro il proprio quadrato unitario.
# Un bullone da 8 mm esce con la stessa area UV del fasciame da 2,6 metri, e
# l'impacchettamento — che scala tutte le isole dello stesso fattore — se la
# porta dietro intatta. E' il difetto che il cancello di `docs/15` descrive:
# non e' il pack ad aver sbagliato, e' che nessuno ha mai detto alle UV quanto
# misurano i pezzi nel mondo.
#
# `average_islands_scale` lo dice: riscala ogni isola perche' abbia la stessa
# area UV per metro quadro di superficie. Da li' in poi il pack puo' solo
# moltiplicare tutto per una costante, e il rapporto fra le densita' resta 1.
#
# `--senza-pareggio` salta questa riga. Serve a stampare il numero del primo
# tentativo, non a passare il cancello.
bpy.ops.object.select_all(action='DESELECT')
for o in pezzi:
    o.select_set(True)
bpy.context.view_layer.objects.active = pezzi[0]
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.select_all(action='SELECT')
if PAREGGIO:
    bpy.ops.uv.average_islands_scale()
    print('PAREGGIO densita\' fra le isole: fatto')
else:
    print('PAREGGIO densita\' fra le isole: SALTATO (--senza-pareggio)')
bpy.ops.object.mode_set(mode='OBJECT')

if PESO_DENSITA:
    for o in pezzi:
        k = PESO_DENSITA.get(o.name)
        if not k:
            continue
        for d in o.data.uv_layers.active.data:
            d.uv = (d.uv[0] * k, d.uv[1] * k)
        print('PRIORITA\' %s riscalato a %.2f della densita\' comune' % (o.name, k))

# ─── §5 · UN solo impacchettamento, su tutti i pezzi insieme ──────────────
#
# Il margine si dichiara in FRAZIONE dello spazio UV, non in "scaled": in
# "scaled" dipende dalla dimensione dell'isola, e un'isola piccola finirebbe
# con un gutter di mezzo pixel. La compressione e i mipmap sono ciechi alla
# dimensione dell'isola: gli serve una distanza in PIXEL, uguale per tutti.
#
# ─── OTTO PIXEL, E NON SEDICI: IL MARGINE SI PAGA IN DENSITA'
#
# Il margine non e' gratis, e con mille isole non e' nemmeno poco. Misurato
# sullo stesso assieme, cambiando SOLO questo numero:
#
#     margine   atlante occupato   densita'
#        2 px        74,25%        3,49 px/cm
#        4 px        68,17%        3,34 px/cm
#        8 px        57,01%        3,06 px/cm
#       16 px        30,73%        2,24 px/cm
#
# Sedici pixel costano il 36% della densita' rispetto a quattro: l'isola media
# qui e' larga ~55 px, e un gutter da 16 per lato le raddoppia il lato.
#
# Otto e' il punto in cui i due vincoli veri sono soddisfatti e non uno in
# piu': un blocco di compressione a texture e' 4x4, quindi due isole non
# devono condividerne uno (>= 4 px); e a mipmap 2 — 512 px, la risoluzione
# piu' bassa a cui questo modello viene guardato, visto che la camera arriva a
# 2,6 unita' — restano 2 px, che e' il raggio di un filtro bilineare.
# Sotto i 2 px il filtro pesca nell'isola vicina.
#
# Quanto regge davvero non si deduce da questo commento: lo misura il §7.
#
# ─── E `CONCAVE` NON MANTIENE IL MARGINE CHE GLI SI CHIEDE
#
# La forma di default qui era `CONCAVE`, che incastra le isole nelle rientranze
# le une delle altre: sulla carta e' la piu' densa. Il §7 dice che con quella
# forma DUE ISOLE SI TOCCANO — bleed sicuro 0 px — e sono cinque coppie sole,
# dentro HOUSING_FIXED e HOUSING_REMOVABLE, che nessun avviso segnala.
#
#     forma      atlante   bleed sicuro misurato
#     CONCAVE    57,01%       0 px      <- si toccano
#     CONVEX     55,68%       8 px      <- il margine chiesto, per intero
#     AABB       55,23%       8 px
#
# Si compra l'1,3% di atlante col rischio che una cottura sanguini da un pezzo
# all'altro. Non vale, e `CONVEX` costa 0,04 px/cm di densita'.
margine = MARGINE_PX / ATLANTE
try:
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.select_all(action='SELECT')
    bpy.ops.uv.pack_islands(rotate=True, margin_method='FRACTION', margin=margine,
                            shape_method=FORMA, scale=True, merge_overlap=False)
except TypeError:
    bpy.ops.uv.pack_islands(rotate=True, margin=margine)
finally:
    bpy.ops.object.mode_set(mode='OBJECT')
print('IMPACCHETTAMENTO unico: forma %s, margine %.1f px su %d (frazione %.5f)'
      % (FORMA, MARGINE_PX, ATLANTE, margine))


# ─── §6 · le misure ───────────────────────────────────────────────────────
def area_3d(o):
    """Area in METRI QUADRI, nello spazio del mondo. Non si usa `polygon.area`:
    quella e' in coordinate locali e un oggetto scalato mentirebbe."""
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


def isole(o):
    """Componenti connesse delle facce nello spazio UV. Due facce stanno nella
    stessa isola se condividono un vertice CON LA STESSA coordinata UV: e'
    esattamente la definizione di cucitura."""
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
    return len({trova(k) for k in per_faccia}), per_faccia, trova


print('')
print('%-24s %9s %9s %8s %10s' % ('pezzo', 'area m2', 'atlante%', 'isole', 'px/cm'))
print('-' * 66)
righe = []
tot_uv = tot_3d = tot_isole = 0
identita = {}
for o in pezzi:
    a3 = area_3d(o)
    au = area_uv(o)
    ni, per_faccia, trova = isole(o)
    identita[o.name] = (per_faccia, trova)
    dens = ATLANTE * math.sqrt(au / a3) / 100.0 if a3 > 0 else 0.0
    righe.append((o.name, a3, au, ni, dens))
    tot_3d += a3
    tot_uv += au
    tot_isole += ni
    print('%-24s %9.4f %8.2f%% %8d %10.2f' % (o.name, a3, au * 100, ni, dens))

print('-' * 66)
print('%-24s %9.4f %8.2f%% %8d' % ('TOTALE', tot_3d, tot_uv * 100, tot_isole))

vive = [r for r in righe if r[4] > 0]
alto = max(vive, key=lambda r: r[4])
basso = min(vive, key=lambda r: r[4])
rapporto = alto[4] / basso[4]
print('')
print('DENSITA\'  max %.2f px/cm  (%s)' % (alto[4], alto[0]))
print('DENSITA\'  min %.2f px/cm  (%s)' % (basso[4], basso[0]))
print('RAPPORTO  %.2f   (tetto %.1f)' % (rapporto, RAPPORTO_MAX))
print('ATLANTE   occupato %.2f%% (analitico), %d isole in totale' % (tot_uv * 100, tot_isole))
piu_grosso = max(righe, key=lambda r: r[2])
print('QUOTA     il pezzo piu\' esteso, %s, si prende il %.1f%% dell\'atlante usato'
      % (piu_grosso[0], piu_grosso[2] / tot_uv * 100))

# ─── §7 · la verifica rasterizzata: occupazione vera e gutter vero ────────
#
# L'area UV analitica non sa niente delle sovrapposizioni e il margine e' un
# parametro DICHIARATO: finche' non si disegnano le isole in un buffer grande
# come l'atlante, «16 px di gutter» e' una promessa, non una misura.
if RASTER:
    import numpy as np
    N = ATLANTE
    buf = np.zeros((N, N), dtype=np.int32)
    prossimo = 1
    idisola = {}
    for o in pezzi:
        me = o.data
        uv = me.uv_layers.active.data
        per_faccia, trova = identita[o.name]
        for pi, p in enumerate(me.polygons):
            r = (o.name, trova(per_faccia[pi]))
            if r not in idisola:
                idisola[r] = prossimo
                prossimo += 1
            ident = idisola[r]
            ls = list(p.loop_indices)
            pts = [(uv[li].uv[0] * N, uv[li].uv[1] * N) for li in ls]
            for t in range(1, len(pts) - 1):     # ventaglio
                (x0, y0), (x1, y1), (x2, y2) = pts[0], pts[t], pts[t + 1]
                xa = max(0, int(min(x0, x1, x2)))
                xb = min(N - 1, int(max(x0, x1, x2)) + 1)
                ya = max(0, int(min(y0, y1, y2)))
                yb = min(N - 1, int(max(y0, y1, y2)) + 1)
                if xb < xa or yb < ya:
                    continue
                xs = np.arange(xa, xb + 1) + 0.5
                ys = np.arange(ya, yb + 1) + 0.5
                X = xs[None, :]
                Y = ys[:, None]
                d = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0)
                if abs(d) < 1e-12:
                    continue
                w1 = ((X - x0) * (y2 - y0) - (x2 - x0) * (Y - y0)) / d
                w2 = ((x1 - x0) * (Y - y0) - (X - x0) * (y1 - y0)) / d
                m = (w1 >= 0) & (w2 >= 0) & (w1 + w2 <= 1)
                if m.any():
                    blocco = buf[ya:yb + 1, xa:xb + 1]
                    np.copyto(blocco, ident, where=m)
    coperti = int((buf > 0).sum())
    print('')
    print('RASTER    %d x %d: %.2f%% dei texel coperti (analitico %.2f%%), %d isole disegnate'
          % (N, N, coperti / (N * N) * 100, tot_uv * 100, prossimo - 1))
    # ─── il gutter vero, e come NON si misura
    #
    # Il primo tentativo confrontava il buffer con se stesso spostato di d
    # pixel in quattro direzioni (destra, su, e le due diagonali). Rispondeva
    # «nessun contatto entro 32 px» — cioe' il doppio del margine chiesto, su
    # un atlante che il packer riempie fino a farle toccare. Non era vero: due
    # isole distanti (16, 5) non stanno su nessuna di quelle quattro rette, e
    # la sonda non le vedeva. Un campionamento rado non da' errore, da' un
    # numero comodo.
    #
    # Qui invece si fa crescere ogni isola di un pixel per volta, tutte
    # insieme, finche' due fronti DIVERSI non si contendono lo stesso texel.
    # Il passo in cui succede e' esattamente la domanda che conta: quanti
    # pixel di dilatazione (il bleed che il forno scrive attorno alle isole,
    # e che i mipmap allargano) si possono permettere prima che un'isola
    # sanguini nella vicina.
    lab = buf.copy()
    DIR = ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1))

    def sposta(a, dx, dy):
        s = np.zeros_like(a)
        s[max(0, dy):N + min(0, dy), max(0, dx):N + min(0, dx)] = \
            a[max(0, -dy):N + min(0, -dy), max(0, -dx):N + min(0, -dx)]
        return s

    # contatto a zero passi: due isole gia' attaccate, gutter nullo
    urto = 0
    for dx, dy in DIR[:4] + DIR[4:6]:
        s = sposta(lab, dx, dy)
        if ((lab > 0) & (s > 0) & (lab != s)).any():
            urto = 0
            break
    else:
        urto = None
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
        bleed = 32
        print('RASTER    gutter: oltre 32 px di dilatazione senza contatti (atlante troppo vuoto)')
    else:
        bleed = max(0, urto - 1)
        print('RASTER    bleed sicuro %d px a %d  ->  %.1f a 1024, %.1f a 512, %.1f a 256'
              % (bleed, N, bleed / (N / 1024), bleed / (N / 512), bleed / (N / 256)))

# ─── §8 · il file ─────────────────────────────────────────────────────────
os.makedirs(FUORI, exist_ok=True)
percorso = os.path.join(FUORI, 'impianto-uv.blend')
bpy.ops.wm.save_as_mainfile(filepath=percorso)
print('')
print('BLEND     %s  %.0f KB  (%.0f s)'
      % (percorso, os.path.getsize(percorso) / 1024, time.time() - T0))

# ─── §9 · i cancelli ──────────────────────────────────────────────────────
#
# Il secondo cancello non era nel piano e lo ha chiesto una misura: il margine
# e' un PARAMETRO che si passa al packer, e il packer puo' non rispettarlo
# (vedi `CONCAVE` al §5). «Margine sufficiente» va quindi verificato sul
# disegno, non sulla riga che lo chiede.
if RASTER and bleed < MARGINE_PX:
    print('')
    print('CANCELLO ROSSO: chiesti %.0f px di margine, misurati %d di bleed sicuro.'
          % (MARGINE_PX, bleed))
    print('  Il packer non ha rispettato il margine: due isole si toccano prima')
    print('  di quanto dichiarato, e una cottura sanguinera\' da un pezzo all\'altro.')
    print('  Non si abbassa la richiesta: si cambia `--forma` o si toglie cio\'')
    print('  che ha stretto la disposizione.')
    sys.exit(2)

if rapporto > RAPPORTO_MAX:
    print('')
    print('CANCELLO ROSSO: rapporto di densita\' %.2f oltre il tetto di %.1f.'
          % (rapporto, RAPPORTO_MAX))
    print('  piu\' texel del dovuto: %s  %.2f px/cm  (%.2f%% dell\'atlante per %.4f m2)'
          % (alto[0], alto[4], alto[2] * 100, alto[1]))
    print('  affamato:              %s  %.2f px/cm  (%.2f%% dell\'atlante per %.4f m2)'
          % (basso[0], basso[4], basso[2] * 100, basso[1]))
    print('  la soglia NON si alza: si pareggia la densita\' delle isole prima')
    print('  di impacchettare (§4), altrimenti l\'atlante lo mangia il pezzo')
    print('  piu\' piccolo invece del pezzo piu\' grande.')
    sys.exit(1)

print('CANCELLO VERDE: rapporto di densita\' %.2f entro %.1f%s'
      % (rapporto, RAPPORTO_MAX,
         (', bleed sicuro %d px >= %.0f chiesti' % (bleed, MARGINE_PX)) if RASTER
         else ', margine NON verificato (--senza-raster)'))
