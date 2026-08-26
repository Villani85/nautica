"""
LA SOVRASTRUTTURA — perche' la nave leggeva come una chiatta.

    node strumenti/esporta-coperta.mjs <cartella>/coperta.json
    blender -b -P glb-sovrastruttura.py -- <cartella>

Nel sito la tuga erano due `BoxGeometry` sovrapposte, alte in tutto 1,8 m su
15,5 m di lunghezza: **un solo livello**. Un quaranta metri a dislocamento ne
ha tre — ponte principale, ponte superiore, flybridge — e la differenza non e'
un dettaglio di stile: e' la ragione per cui la silhouette si legge come yacht
invece che come pontone con una scatola sopra. E' la prima cosa che si vede del
sito, prima di qualunque materiale.

─── IL CAVALLINO NON SI RIDISEGNA QUI

Il ponte e' una curva che vive in `src/scafo/ordinate.js`. Copiarla in Python
sarebbe stata la seconda implementazione della stessa cosa, e non avrebbe dato
errore: la tuga sarebbe stata costruita, valida, e appoggiata a un ponte che non
e' piu' quello disegnato. Si vedrebbe come una fessura di luce sotto la
sovrastruttura e si darebbe la colpa all'ombra.

Quindi arriva da un file, generato da `strumenti/esporta-coperta.mjs`. Se le
ordinate cambiano, si rigenera e la tuga si riappoggia da sola.

─── GLI ASSI, E LA CONVERSIONE

Blender, come per l'impianto:  +X dritta, +Y avanti, +Z alto.
L'esportatore glTF converte in Y-alto:  gx = bx,  gy = bz,  gz = -by.
La scena three.js:  +z e' verso POPPA (PRUA_Z = -8, POPPA_Z = +8), quindi
gz = -by torna: poppa a by negativo, gz positivo.

Con 1 unita' di scena = 2,5 m:  bx = x_scena*2.5,  by = -z_scena*2.5,
bz = y_scena*2.5. Il modello e' in METRI perche' glTF li impone, e il sito lo
scala di 0,4 come fa con l'impianto: una regola sola, non due.

─── COSA C'E' E PERCHE'

  TRE LIVELLI      la silhouette. Senza, e' un pontone
  FINESTRE INCASSATE  una fascia scura appiccicata sopra la parete legge come
                   adesivo. Il vetro sta DENTRO uno scasso vero, con i montanti
  CAVALLINO OVUNQUE  anche i tetti seguono la curva: un tetto orizzontale sopra
                   uno scafo con cavallino e' il secondo indizio di sintetico
  BATTAGLIOLA      candelieri e draglie. Una nave senza niente sul bordo del
                   ponte sembra un rendering di massa
  MURATA A PRUA    il parapetto pieno che a proravia diventa alto: e' la forma
                   che dice «questa naviga», non «questa sta in porto»
  RACCORDI 15-40 mm  uno spigolo vivo su una sovrastruttura verniciata non
                   esiste
"""
import bpy, bmesh, json, math, os, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
FUORI = argv[0]

with open(os.path.join(FUORI, 'coperta.json'), encoding='utf-8') as f:
    COPERTA = json.load(f)

M = COPERTA['metriPerUnita']          # 2,5


def da_scena(z_scena):
    """Interpola la coperta alla stazione voluta. Ingresso in unita' di scena,
    uscita in METRI: (semilarghezza, quota del ponte)."""
    p = COPERTA['punti']
    if z_scena <= p[0]['z']:
        a = b = p[0]
    elif z_scena >= p[-1]['z']:
        a = b = p[-1]
    else:
        i = 0
        while i < len(p) - 2 and p[i + 1]['z'] < z_scena:
            i += 1
        a, b = p[i], p[i + 1]
    u = 0.0 if b['z'] == a['z'] else (z_scena - a['z']) / (b['z'] - a['z'])
    semi = a['semilarg'] + (b['semilarg'] - a['semilarg']) * u
    ponte = a['ponteY'] + (b['ponteY'] - a['ponteY']) * u
    return semi * M, ponte * M


def coperta_a_y(by):
    """Come sopra ma in coordinate Blender: by e' l'asse longitudinale."""
    return da_scena(-by / M)


PRUA_Y = -COPERTA['pruaZ'] * M        # +20 m
POPPA_Y = -COPERTA['poppaZ'] * M      # -20 m

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = 'METRIC'


def mat(nome, colore, metallo, rugosita):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*colore, 1)
    b.inputs['Metallic'].default_value = metallo
    b.inputs['Roughness'].default_value = rugosita
    return m


MAT = {
    # Gli stessi colori del foglio di stile: la carta sopra la linea. Una
    # sovrastruttura bianco-neve accanto a una pagina color carta stona, e il
    # sito e' costruito sul fatto che le due meta' si incontrino.
    'guscio': mat('sovra_guscio', (0.845, 0.833, 0.800), 0.0, 0.24),
    # Il vetro di uno yacht di giorno e' uno SPECCHIO SCURO: quasi nero, quasi
    # liscio. Trasparente sarebbe sbagliato — si vedrebbe dentro un interno che
    # non c'e', ed e' il difetto piu' comune dei render di barche.
    'vetro': mat('sovra_vetro', (0.017, 0.026, 0.030), 0.0, 0.045),
    'montante': mat('sovra_montante', (0.10, 0.105, 0.108), 0.0, 0.35),
    'teak': mat('sovra_teak', (0.360, 0.276, 0.176), 0.0, 0.52),
    'inox': mat('sovra_inox', (0.560, 0.575, 0.590), 1.0, 0.16),
    'ombra': mat('sovra_ombra', (0.055, 0.060, 0.062), 0.0, 0.55),
}

pezzi = {}


def reg(nodo, o):
    pezzi.setdefault(nodo, []).append(o)
    return o


def smussa(o, largh=0.020, seg=2, angolo=38):
    m = o.modifiers.new('s', 'BEVEL')
    m.width = largh
    m.segments = seg
    m.limit_method = 'ANGLE'
    m.angle_limit = math.radians(angolo)
    return o


def loft(nome, stazioni, materiale, chiudi=True):
    """Solido lungo Y da una sequenza di sezioni rettangolari.

    `stazioni` = [(by, semilarghezza, z_basso, z_alto), ...]. Una scatola
    ordinaria non basterebbe: il fondo deve seguire il cavallino e la larghezza
    deve rastremare verso prua, altrimenti la tuga sta su una nave che non e'
    questa.
    """
    vs, fs = [], []
    for (by, w, z0, z1) in stazioni:
        vs += [(-w, by, z0), (w, by, z0), (w, by, z1), (-w, by, z1)]
    n = len(stazioni)
    for i in range(n - 1):
        a, b = i * 4, (i + 1) * 4
        for k in range(4):
            k2 = (k + 1) % 4
            fs.append([a + k, a + k2, b + k2, b + k])
    if chiudi:
        fs.append([0, 1, 2, 3][::-1])
        fs.append([(n - 1) * 4 + k for k in range(4)])
    me = bpy.data.meshes.new(nome)
    me.from_pydata(vs, [], fs)
    me.update()
    o = bpy.data.objects.new(nome, me)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(MAT[materiale])

    # ─── LE NORMALI VANNO RICALCOLATE, E NON E' UNA FORMALITA'
    #
    # `from_pydata` prende l'avvolgimento che gli do io, e il mio era rivolto
    # DENTRO. Il guasto che ne e' venuto non somigliava a un guasto di normali:
    # dall'esterno le pareti sparivano (culling della faccia frontale) e si
    # vedeva attraverso la sovrastruttura la fascia del fuoribordo, che sta
    # dentro la tuga. A schermo era un rettangolo chiaro sospeso sopra i ponti,
    # e sembrava un pezzo modellato male, non una faccia al rovescio.
    #
    # Trovato interrogando la scena con `?ispeziona=1`: il raggio rispondeva
    # «Mesh senza nome, colore #ffffff, lato 1» — BackSide — a diciannove unita'
    # di distanza. Il nome del colpevole in due secondi, contro un'ora di
    # ipotesi. E' la ragione per cui quello strumento vive in produzione.
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    me.update()
    return o


def box(dim, pos, materiale, smusso=0.012):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    o = bpy.context.object
    o.scale = dim
    bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(MAT[materiale])
    return smussa(o, smusso) if smusso else o


def cil(r, h, pos, materiale, lati=16, asse='Z'):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=lati, location=pos)
    o = bpy.context.object
    if asse == 'X':
        o.rotation_euler = (0, math.radians(90), 0)
    elif asse == 'Y':
        o.rotation_euler = (math.radians(90), 0, 0)
    # `transform_apply(rotation=True)` applica ANCHE posizione e scala: i tre
    # argomenti hanno tutti il default a True, e nominarne uno non spegne gli
    # altri. La posizione finiva cotta dentro la mesh, l'oggetto restava a
    # (0,0,0), e qualunque rotazione assegnata dopo girava il pezzo attorno
    # all'ORIGINE DELLA SCENA invece che attorno a se'. Le draglie della
    # battagliola sono finite 18 metri sotto la linea d'acqua. Nessun errore:
    # solo un ingombro assurdo, che si vede solo se lo si misura.
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    o.data.materials.append(MAT[materiale])
    bpy.ops.object.shade_smooth()
    return o


def sottrai(bersaglio, utensile):
    m = bersaglio.modifiers.new('b', 'BOOLEAN')
    m.operation = 'DIFFERENCE'
    m.object = utensile
    bpy.context.view_layer.objects.active = bersaglio
    bpy.ops.object.modifier_apply(modifier='b')
    bpy.data.objects.remove(utensile, do_unlink=True)
    return bersaglio


# ═══════════════════════════════════════════════════════════════════════════
# I LIVELLI SOPRA LA TUGA
#
# La tuga del ponte principale NON si costruisce qui, e non e' pigrizia: dentro
# ha un'apertura vera, e attraverso quel buco si vedono il salone e l'orizzonte.
# E' la regola del sito — cio' che e' diagramma si costruisce, cio' che e'
# fotografia si guarda attraverso un'apertura. Un vetro scuro modellato la
# chiuderebbe, e chiuderebbe la tesi con lei.
#
# Quindi qui si costruisce cio' che sta SOPRA. E' la parte che mancava del
# tutto: la nave aveva un livello solo, e per questo leggeva come un pontone
# con una scatola sopra invece che come uno yacht.
#
# Le quote non si scelgono guardando lo schermo (§12): un ponte abitabile sta
# fra 2,1 e 2,4 m, e i livelli sommati devono stare in un'altezza d'aria
# plausibile per un quaranta metri, 9-11 m. Il collaudo la stampa.
# ═══════════════════════════════════════════════════════════════════════════
H_SUPERIORE = 2.25
H_FLY = 1.80

T = COPERTA['tuga']
TETTO_PRORA = T['tettoProra'] * M
TETTO_POPPA = T['tettoPoppa'] * M
Z_TUGA_PRORA = T['z'] - T['lung'] / 2
Z_TUGA_POPPA = T['z'] + T['lung'] / 2
SEMI_TUGA = T['semilargh'] * M


def tetto_tuga(by):
    """La quota del tetto della tuga a una data stazione. E' INCLINATO col
    cavallino: appoggiarci sopra un livello a quota costante lascerebbe una
    fessura di luce a prua, e si darebbe la colpa all'ombra."""
    zs = -by / M
    u = (zs - Z_TUGA_PRORA) / (Z_TUGA_POPPA - Z_TUGA_PRORA)
    u = max(0.0, min(1.0, u))
    return TETTO_PRORA + (TETTO_POPPA - TETTO_PRORA) * u


# ─── I RIENTRI, E PERCHE' ERANO TROPPO PICCOLI ────────────────────────────
#
# Prima versione: 1,05 e 1,00 m di rientro, e livelli lunghi quasi quanto la
# tuga. Il risultato si leggeva come la plancia di un rimorchiatore — una torre
# a facce parallele — invece che come uno yacht. La differenza non e' di gusto:
# su una barca i ponti alti **rientrano molto**, in larghezza e ancor piu' in
# lunghezza, perche' ogni livello lascia sotto di se' un ponte scoperto su cui
# si vive. E' quel gradino a dare la linea bassa e lunga.
PASSAGGIO_SUP = 1.55
PASSAGGIO_FLY = 1.35

LIVELLI = [
    # nome         da (z_scena)  a (z_scena)  semilarghezza (m)             altezza
    ('SUPERIORE',  -1.60,         2.70,       SEMI_TUGA - PASSAGGIO_SUP,    H_SUPERIORE),
    ('FLY',        -0.30,         1.90,       SEMI_TUGA - PASSAGGIO_SUP - PASSAGGIO_FLY, H_FLY),
]

# La facciata di prua e' INCLINATA. Una parete verticale alta due metri e mezzo
# su una barca non esiste: e' il terzo indizio di sintetico dopo la rugosita'
# uniforme e gli spigoli vivi, e si vede anche da lontano nella silhouette.
RAKE = math.radians(14)

STAZ = 17
quota_sopra = {}


def stazioni_livello(z0, z1, semi, altezza, base_da):
    """Le sezioni del livello. Il fondo appoggia sul livello sotto, e il TETTO
    SEGUE LA STESSA CURVA: un tetto orizzontale sopra uno scafo con cavallino e'
    il secondo indizio di sintetico dopo la rugosita' uniforme.

    La larghezza si restringe verso le estremita' con un coseno: una scatola a
    facce parallele lunga dodici metri non e' una sovrastruttura, e' un
    container."""
    st = []
    for i in range(STAZ):
        u = i / (STAZ - 1)
        zs = z0 + (z1 - z0) * u
        by = -zs * M
        rastrema = 1.0 - 0.16 * (2 * u - 1) ** 4
        w = max(0.35, semi * rastrema)
        basso = base_da(by)
        st.append((by, w, basso - 0.06, basso + altezza))
    return st


def tetto_di(st):
    pares = sorted((s[0], s[3]) for s in st)

    def f(by):
        if by <= pares[0][0]:
            return pares[0][1]
        if by >= pares[-1][0]:
            return pares[-1][1]
        for k in range(len(pares) - 1):
            a, b = pares[k], pares[k + 1]
            if a[0] <= by <= b[0]:
                u = (by - a[0]) / (b[0] - a[0]) if b[0] != a[0] else 0
                return a[1] + (b[1] - a[1]) * u
        return pares[-1][1]
    return f


base = tetto_tuga
for (nome, z0, z1, semi, altezza) in LIVELLI:
    st = stazioni_livello(z0, z1, semi, altezza, base)
    corpo = loft('SOVRA_' + nome, st, 'guscio')

    # ─── LE FINESTRE, INCASSATE PER DAVVERO ────────────────────────────────
    # Una fascia scura appoggiata sopra la parete legge come un adesivo. Qui si
    # scava uno scasso con un loft piu' largo del corpo, e il vetro va dentro:
    # e' la differenza fra una finestra e il disegno di una finestra.
    alto_vetro = altezza * 0.44
    piede = altezza * 0.32
    scasso = [(by, w + 0.30, z0b + piede, z0b + piede + alto_vetro)
              for (by, w, z0b, z1b) in st]
    corpo = sottrai(corpo, loft('utensile', scasso[1:-1], 'guscio'))

    # l'inclinazione della facciata: un cuneo che taglia via lo spigolo alto
    # di prua. Il taglio e' vero, non un'apparenza di ombreggiatura.
    by_pr, w_pr, z0_pr, z1_pr = st[0] if st[0][0] > st[-1][0] else st[-1]
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, by_pr + 3.0, z1_pr))
    cuneo = bpy.context.object
    cuneo.scale = (semi * 3, 6.0, 6.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    cuneo.rotation_euler = (RAKE, 0, 0)
    cuneo.data.materials.append(MAT['guscio'])
    corpo = sottrai(corpo, cuneo)

    smussa(corpo, 0.028, 2)
    reg('SOVRASTRUTTURA', corpo)

    vetro = [(by, w - 0.055, z0b + piede + 0.012, z0b + piede + alto_vetro - 0.012)
             for (by, w, z0b, z1b) in st]
    reg('SOVRASTRUTTURA', loft('VETRO_' + nome, vetro[1:-1], 'vetro'))

    # i MONTANTI: senza, il vetro e' un nastro continuo di dieci metri, che su
    # una barca vera non esiste
    for i in range(2, STAZ - 2, 3):
        by, w, z0b, z1b = st[i]
        reg('SOVRASTRUTTURA', box((w + 0.02, 0.055, alto_vetro / 2),
                                  (0, by, z0b + piede + alto_vetro / 2), 'montante', 0.006))

    quota_sopra[nome] = st
    base = tetto_di(st)

# ═══ IL TETTO DEL FLY: un hard-top su montanti, non una lastra ═════════════
st_fly = quota_sopra['FLY']
for (bx, seg) in [(-1, 1), (1, 1)]:
    for i in (2, STAZ // 2, STAZ - 3):
        by, w, z0b, z1b = st_fly[i]
        reg('SOVRASTRUTTURA', cil(0.038, 0.55, (bx * (w - 0.12), by, z1b + 0.275), 'inox', 12))
tetto = [(by, w + 0.16, z1b + 0.55, z1b + 0.68) for (by, w, z0b, z1b) in st_fly]
reg('SOVRASTRUTTURA', smussa(loft('HARDTOP', tetto, 'guscio'), 0.030, 2))

# ═══ L'ALBERO E IL RADAR ══════════════════════════════════════════════════
by_a = st_fly[STAZ // 2][0]
z_a = st_fly[STAZ // 2][3] + 0.68
# L'albero e' alto quanto serve perche' l'altezza d'aria resti nella forbice
# di un quaranta metri. Con 2,30 m il totale usciva a 11,99: fuori.
ALBERO = 1.35
reg('SOVRASTRUTTURA', cil(0.075, ALBERO, (0, by_a - 0.6, z_a + ALBERO / 2), 'inox', 14))
reg('SOVRASTRUTTURA', box((0.62, 0.16, 0.075), (0, by_a - 0.6, z_a + ALBERO * 0.78), 'guscio', 0.010))
reg('SOVRASTRUTTURA', cil(0.30, 0.16, (0, by_a - 0.6, z_a + ALBERO), 'guscio', 20))

# ═══ LA COPERTA IN TEAK ═══════════════════════════════════════════════════
# Un piano al livello del ponte, largo quanto lo scafo meno il parapetto. Non
# ha le fughe fra i corsi — servirebbe una texture, e la texture arriva dalla
# cottura: e' un debito dichiarato, non nascosto (vedi glb-impianto.py).
st_ponte = []
for i in range(41):
    zs = COPERTA['pruaZ'] + (COPERTA['poppaZ'] - COPERTA['pruaZ']) * i / 40
    by = -zs * M
    semi, ponte = da_scena(zs)
    st_ponte.append((by, max(0.05, semi - 0.10), ponte - 0.06, ponte))
reg('COPERTA', loft('COPERTA_TEAK', st_ponte, 'teak'))

# ═══ LA BATTAGLIOLA E LA MURATA ═══════════════════════════════════════════
# A proravia il parapetto e' PIENO e alto: e' la forma che dice «questa
# naviga». Verso poppa diventa candelieri e draglie, perche' li' si vive.
Z_MURATA = -1.8         # a proravia di questa stazione il parapetto e' pieno
st_mur = []
for i in range(21):
    zs = COPERTA['pruaZ'] + (Z_MURATA - COPERTA['pruaZ']) * i / 20
    by = -zs * M
    semi, ponte = da_scena(zs)
    h = 1.15 - 0.45 * (i / 20) ** 1.4
    st_mur.append((by, semi - 0.02, ponte, ponte + h))
reg('COPERTA', smussa(loft('MURATA', st_mur, 'guscio'), 0.018, 2))

for i in range(14):
    zs = Z_MURATA + (COPERTA['poppaZ'] - 0.25 - Z_MURATA) * i / 13
    by = -zs * M
    semi, ponte = da_scena(zs)
    for s in (-1, 1):
        reg('COPERTA', cil(0.022, 0.80, (s * (semi - 0.06), by, ponte + 0.40), 'inox', 10))
    if i:
        zs0 = Z_MURATA + (COPERTA['poppaZ'] - 0.25 - Z_MURATA) * (i - 1) / 13
        by0 = -zs0 * M
        semi0, ponte0 = da_scena(zs0)
        for s in (-1, 1):
            for q in (0.34, 0.58, 0.78):
                y0, y1 = by0, by
                x0, x1 = s * (semi0 - 0.06), s * (semi - 0.06)
                z0d, z1d = ponte0 + q * 0.80, ponte + q * 0.80
                # ORIENTARE A MANO CON DUE atan2 E' SBAGLIATO, e non da'
                # errore: la draglia viene costruita, e finisce da un'altra
                # parte. Misurato — l'ingombro scendeva a 3,34 m SOTTO la linea
                # d'acqua, cioe' dei cavi d'acciaio erano finiti in chiglia.
                # `to_track_quat` allinea l'asse a un vettore e basta.
                a = Vector((x0, y0, z0d))
                b = Vector((x1, y1, z1d))
                dvec = b - a
                d = cil(0.007, dvec.length, tuple((a + b) / 2), 'inox', 6)
                d.rotation_euler = dvec.to_track_quat('Z', 'Y').to_euler()
                reg('COPERTA', d)

# ═══ MONTAGGIO ════════════════════════════════════════════════════════════
bpy.ops.object.empty_add(location=(0, 0, 0))
RADICE = bpy.context.object
RADICE.name = 'SOVRASTRUTTURA_NAVE'

vuoti = {}
for nodo in ['SOVRASTRUTTURA', 'COPERTA']:
    bpy.ops.object.empty_add(location=(0, 0, 0))
    v = bpy.context.object
    v.name = nodo
    v.parent = RADICE
    vuoti[nodo] = v
    lista = pezzi.get(nodo, [])
    if not lista:
        continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in lista:
        o.select_set(True)
    bpy.context.view_layer.objects.active = lista[0]
    if len(lista) > 1:
        bpy.ops.object.join()
    unito = bpy.context.object
    unito.name = nodo + '_MESH'
    unito.parent = v

RADICE['assetRole'] = 'generic-40m-motoryacht-superstructure'
RADICE['authoringUnit'] = 'meter'
RADICE['sceneMetersPerUnit'] = M
RADICE['deckLevels'] = len(LIVELLI)
RADICE['modelClaim'] = 'illustrative'

# ─── misure dichiarate ────────────────────────────────────────────────────
mn = Vector((1e9, 1e9, 1e9))
mx = Vector((-1e9, -1e9, -1e9))
tri = 0
for o in bpy.data.objects:
    if o.type != 'MESH':
        continue
    tri += len(o.data.polygons)
    for v in o.bound_box:
        w = o.matrix_world @ Vector(v)
        for i in range(3):
            mn[i] = min(mn[i], w[i])
            mx[i] = max(mx[i], w[i])

RADICE['airDraftM'] = round(mx[2], 3)
print('FACCE %d' % tri)
print('ALTEZZA D\'ARIA  %.2f m sopra la linea d\'acqua (atteso 9-11 per un 40 m)' % mx[2])
print('INGOMBRO        %.2f larg x %.2f lung x %.2f alt m' % (mx[0]-mn[0], mx[1]-mn[1], mx[2]-mn[2]))
print('LIVELLI SOPRA LA TUGA  %d  (%.2f + %.2f m); la tuga resta nel sito, ha un buco vero'
      % (len(LIVELLI), H_SUPERIORE, H_FLY))

bpy.ops.object.select_all(action='SELECT')
percorso = os.path.join(FUORI, 'sovrastruttura.glb')
bpy.ops.export_scene.gltf(filepath=percorso, export_format='GLB',
                          use_selection=True, export_apply=True,
                          export_yup=True, export_extras=True)
print('GLB %.0f KB' % (os.path.getsize(percorso) / 1024))
