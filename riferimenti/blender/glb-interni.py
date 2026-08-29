"""
GLI INTERNI DELL'ATTO DUE — ponti, paratie, ossatura e corredo, tutti tagliati
sulla forma vera dello scafo.

    node strumenti/esporta-interni.mjs riferimenti/blender/uscite/interni.json
    blender -b -P riferimenti/blender/glb-interni.py -- riferimenti/blender/uscite

─── COSA SI COSTRUISCE, E SOPRATTUTTO COSA NO

`docs/13-ATTO-DUE.md` §3 descrive uno spazio a due assi: quattro stazioni per
tre quote. Non un interno completo, e le tre ragioni per cui e' molto meno sono
verificabili guardando il sito, non opinioni:

1. **SOLO BABORDO.** `src/scena/index.js` taglia con `Plane(1,0,0)` e tiene
   `x < 0`. Cio' che sta a dritta lo ritaglia il renderer e non si vede MAI.
   Costruirlo sarebbe peso spedito per niente -- e il peso qui e' un cancello.

2. **NON SI CAMMINA, SI SCATTA.** L'esplorazione salta fra posizioni note
   (`vaiACella`), e dentro una cella la camera e' solidale alla nave: quando la
   nave rolla ruotano insieme. Quindi non servono soglie percorribili ne'
   continuita' fra spazi che nessuno attraversa: servono le superfici che si
   vedono dalle pose.

3. **TRE CELLE PORTANO L'ARGOMENTO, NOVE SONO VUOTI.** La catena causale del §4
   ha tre sistemi -- propulsione, pinne, giroscopio -- e `src/ui/atto-due.js`
   dichiara in quale cella stanno. Il corredo industriale ricco va solo li'. Le
   altre nove sono stive e sentine, e una sentina E' un vuoto: riempirla sarebbe
   sbagliato prima ancora che lento.

─── LA PROPRIETA' SU CUI STA IN PIEDI TUTTO, E CHE NON E' UN'IPOTESI

Lungo il contorno di mezza sezione, dalla chiglia al trincarino, **y cresce
sempre e |x| cresce sempre**. La mezza sezione e' quindi una funzione a un
valore solo, `x = f(y)`, e ogni pezzo tagliato sullo scafo si costruisce a
FASCE fra due quote note: **nessun booleano in tutto il file**.

Non e' una comodita'. Un booleano su una superficie loftata e' la fabbrica di
facce degeneri e di normali rovesciate, e le normali rovesciate in questo repo
si sono gia' pagate due volte (guscio e ponte, in `ordinate.js`).
`esporta-interni.mjs` VERIFICA la monotonia e si rifiuta di esportare se cade:
il controllo sta la' perche' e' la' che nascono i punti.

─── GLI ASSI

Come per la sovrastruttura: Blender +X dritta, +Y avanti, +Z alto.
L'esportatore glTF converte in Y-alto: gx = bx, gy = bz, gz = -by.
Con 1 unita' di scena = 2,5 m:  bx = x_scena*2,5, by = -z_scena*2,5,
bz = y_scena*2,5. Il modello e' in METRI perche' glTF li impone, e il sito lo
scala di 0,4 come fa con l'impianto e con le macchine: una regola sola.

Babordo e' x_scena <= 0, cioe' **bx <= 0**. C'e' un controllo in fondo che se
ne accerta sui vertici veri.

─── NIENTE TEXTURE IN QUESTO GIRO

Geometria e smussi. La cottura delle mappe e' di un altro, e i materiali qui
servono solo a far leggere la forma nel provino: non sono tarati e questo
commento e' il posto in cui non fingere che lo siano.
"""
import bpy, bmesh, json, math, os, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
FUORI = argv[0]

with open(os.path.join(FUORI, 'interni.json'), encoding='utf-8') as f:
    D = json.load(f)

M = D['metriPerUnita']
PUNTI = D['punti']
PRUA_Z = D['pruaZ']
POPPA_Z = D['poppaZ']


# ═══ LO SCAFO, INTERROGABILE ══════════════════════════════════════════════
#
# Quattro funzioni e nient'altro. Ogni pezzo di questo file passa da qui, come
# nel sito ogni pezzo passa da `sezioneA`. Una seconda strada per sapere dov'e'
# il fasciame sarebbe la seconda implementazione della stessa cosa: il difetto
# che non da' errore.

def _coppia(z):
    """Le due stazioni campionate che circondano z, e il peso fra loro."""
    if z <= PUNTI[0]['z']:
        return PUNTI[0], PUNTI[0], 0.0
    if z >= PUNTI[-1]['z']:
        return PUNTI[-1], PUNTI[-1], 0.0
    i = 0
    while i < len(PUNTI) - 2 and PUNTI[i + 1]['z'] < z:
        i += 1
    a, b = PUNTI[i], PUNTI[i + 1]
    u = 0.0 if b['z'] == a['z'] else (z - a['z']) / (b['z'] - a['z'])
    return a, b, u


def contorno(z):
    """Il contorno di babordo a una z qualsiasi, in unita' di scena.

    Si interpola PUNTO PER PUNTO fra due stazioni campionate, e si puo' perche'
    tutte hanno la stessa lista di campioni parametrici: il punto k di una
    stazione e il punto k della successiva descrivono la stessa linea
    longitudinale dello scafo. E' la griglia con cui `costruisciGuscio` cuce i
    quad, quindi qui non nasce nessuna superficie nuova.
    """
    a, b, u = _coppia(z)
    ca, cb = a['contorno'], b['contorno']
    return [[ca[k][0] + (cb[k][0] - ca[k][0]) * u,
             ca[k][1] + (cb[k][1] - ca[k][1]) * u] for k in range(len(ca))]


def sfondamento_laterale(z, x, y):
    """Quanto un punto sfonda il fasciame DI FIANCO, in unita' di scena.

    ─── DUE METRI ROTTI PRIMA DI QUESTO, E TUTTI E DUE DAVANO UN NUMERO

    1. Il primo confrontava `|x|` con `semi(z, y)` alla quota del vertice.
       Bocciava `int_paratia_avanti_centro` per 28,8 mm su 24,1 di tolleranza, e
       il vertice non sfondava niente: lo smusso lo aveva spostato di 8 mm anche
       VERSO IL BASSO, e vicino alla chiglia -- sul ginocchio di carena -- la
       mezza larghezza cambia cosi' in fretta che otto millimetri di discesa
       valgono venti millimetri di larghezza in meno. Misurava la pendenza dello
       scafo, non uno sconfinamento.

    2. Il secondo prendeva la distanza dalla polilinea di contorno e chiamava
       «fuori» anche cio' che sta sopra il trincarino. Dava 4127 mm su un
       vertice a `|x| = 0,4 mm`, cioe' sulla mezzeria: la polilinea e' il
       FASCIAME, non il ponte, e un punto in coperta e' lontano dal fasciame
       senza per questo sfondarlo.

    La misura giusta fa due cose separate, perche' sono due cose separate: la
    quota si riporta dentro l'intervallo dello scafo, e solo DOPO si guarda se
    la larghezza esce. Cosi' la pendenza non entra nel numero e il ponte non lo
    inquina. Quanto esce in verticale lo misura `fuori_quota`, che e' un altro
    numero con un'altra tolleranza.
    """
    y_c = min(max(y, chiglia(z)), ponte(z))
    if abs(x) <= semi(z, y_c):
        return 0.0
    c = contorno(z)
    p = (-abs(x), y_c)
    d2 = None
    for k in range(len(c) - 1):
        ax, ay = c[k]
        bx, by = c[k + 1]
        vx, vy = bx - ax, by - ay
        L2 = vx * vx + vy * vy
        t = 0.0 if L2 < 1e-12 else max(0.0, min(1.0, ((p[0] - ax) * vx + (p[1] - ay) * vy) / L2))
        q2 = (p[0] - (ax + vx * t)) ** 2 + (p[1] - (ay + vy * t)) ** 2
        if d2 is None or q2 < d2:
            d2 = q2
    return math.sqrt(d2 if d2 is not None else 0.0)


def semi(z, y):
    """Mezza larghezza POSITIVA a quella z e a quella quota, in unita' di
    scena. Zero sotto la chiglia; sopra il trincarino resta la semilarghezza."""
    c = contorno(z)
    if y <= c[0][1]:
        return 0.0
    if y >= c[-1][1]:
        return abs(c[-1][0])
    for k in range(1, len(c)):
        if c[k][1] >= y:
            u = (y - c[k - 1][1]) / ((c[k][1] - c[k - 1][1]) or 1.0)
            return abs(c[k - 1][0] + (c[k][0] - c[k - 1][0]) * u)
    return 0.0


def _interp(z, campo):
    a, b, u = _coppia(z)
    return a[campo] + (b[campo] - a[campo]) * u


def chiglia(z):
    return _interp(z, 'chiglia')


def ponte(z):
    return _interp(z, 'ponteY')


# ═══ LE QUOTE ═════════════════════════════════════════════════════════════
QUOTE = {q['id']: q for q in D['quote']}
ORDINE_QUOTE = [q['id'] for q in D['quote']]      # dall'alto in basso


def pagliolato_y(idq, z):
    """La quota del pagliolato di un livello, a quella z.

    Due dei tre sono ponti veri e stanno orizzontali. Il terzo segue la
    chiglia, e il perche' e' MISURATO in `esporta-interni.mjs`: un piano
    orizzontale alla quota che l'occhio della sentina implica cadrebbe sotto la
    chiglia piu' profonda di questo scafo, e il taglio sulla forma vera lo
    farebbe sparire del tutto -- la cella piu' bassa dell'atto due resterebbe
    senza pavimento, e non ci sarebbe nessun errore da leggere.
    """
    q = QUOTE[idq]
    if q['piano'] is None:
        return chiglia(z) + q['scostamentoChiglia']
    return q['piano']


def soffitto_y(idq, z):
    """Cosa sta sopra un livello: il pagliolato di quello sopra, o il ponte."""
    i = ORDINE_QUOTE.index(idq)
    return ponte(z) if i == 0 else pagliolato_y(ORDINE_QUOTE[i - 1], z)


def sottrai(intervalli, buchi):
    """Toglie una lista di buchi da una lista di intervalli, sull'asse.

    E' l'unico modo in cui in questo file si fa un'apertura: una porta, un
    boccaporto, il passaggio dell'albero. La strada alternativa -- costruire
    pieno e bucare con un booleano -- e' quella che questo file si vieta in
    testa, e questa funzione di sei righe e' cio' che rende il divieto
    praticabile invece che ideologico.
    """
    fuori = list(intervalli)
    for (b0, b1) in buchi:
        nuovi = []
        for (t0, t1) in fuori:
            if b1 <= t0 or b0 >= t1:
                nuovi.append((t0, t1))
                continue
            if t0 < b0:
                nuovi.append((t0, b0))
            if b1 < t1:
                nuovi.append((b1, t1))
        fuori = nuovi
    return fuori


# ═══ IMPIANTO DELLA SCENA ═════════════════════════════════════════════════
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


# Quattro materiali e non venti: qui non si tara niente, si distingue la
# struttura dagli impianti perche' in sezione si legga chi porta e chi passa.
MAT = {
    'struttura': mat('int_struttura', (0.300, 0.310, 0.318), 0.0, 0.62),
    'pagliolo':  mat('int_pagliolo', (0.205, 0.212, 0.220), 0.35, 0.48),
    'impianto':  mat('int_impianto', (0.115, 0.130, 0.145), 0.25, 0.44),
    'chiaro':    mat('int_chiaro', (0.720, 0.712, 0.690), 0.0, 0.40),
}

pezzi = {}


def reg(nodo, o):
    if o is not None:
        pezzi.setdefault(nodo, []).append(o)
    return o


def crea(nome, verts, faces, materiale, spessore=0.0, smusso=0.0):
    """Una mesh da liste, saldata, con spessore e smusso come modificatori.

    ─── LA SALDATURA NON E' RIFINITURA

    Le facce nascono qui una per volta, ognuna coi suoi quattro vertici: fra due
    fasce adiacenti i vertici sono DOPPI e coincidenti. Senza saldarli il
    solidify costruisce due gusci separati che si compenetrano invece di un
    guscio solo, e lo smusso arrotonda il bordo INTERNO di ogni fascia -- cioe'
    produce una griglia di scanalature su un pavimento liscio. Non da' errore:
    da' un pagliolato che sembra fatto di listelli.

    `spessore` e' un solidify SIMMETRICO. Un foglio a spessore zero, in
    sezione, e' una riga che scompare; e con `offset=0` il piano teorico resta
    dov'e'. Crescendo da un lato solo, un pagliolato messo a quota Z si
    troverebbe a Z + spessore e nessuno lo direbbe.
    """
    me = bpy.data.meshes.new(nome)
    me.from_pydata(verts, [], faces)
    me.validate(verbose=False)

    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bm.to_mesh(me)
    bm.free()

    o = bpy.data.objects.new(nome, me)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(materiale)
    if spessore > 0:
        s = o.modifiers.new('sp', 'SOLIDIFY')
        s.thickness = spessore
        s.offset = 0.0
    if smusso > 0:
        b = o.modifiers.new('sm', 'BEVEL')
        b.width = smusso
        b.segments = 1
        b.limit_method = 'ANGLE'
        b.angle_limit = math.radians(35)
        # Senza il clamp uno smusso piu' largo della meta' dello spessore
        # rovescia le facce del solidify: non da' errore, da' un pagliolato
        # con dei buchi.
        b.use_clamp_overlap = True
    return o


def B(x, y, z):
    """Da unita' di scena a Blender, in metri. L'unica conversione del file."""
    return (x * M, -z * M, y * M)


def prisma(nome, a, b, raggio, lati, materiale, smusso=0.0):
    """Un prisma a `lati` facce fra due punti gia' in coordinate Blender.

    Tubi, montanti e pioli sono decine di pezzi identici: una
    `primitive_cylinder_add` per ciascuno costerebbe un operatore per pezzo.
    Qui e' aritmetica.
    """
    a = Vector(a)
    b = Vector(b)
    d = b - a
    L = d.length
    if L < 1e-6:
        return None
    q = d.normalized().to_track_quat('Z', 'Y')
    verts, faces = [], []
    for k in range(lati):
        t = 2 * math.pi * k / lati
        p = Vector((math.cos(t) * raggio, math.sin(t) * raggio, 0))
        verts.append(tuple(a + q @ p))
        verts.append(tuple(a + q @ (p + Vector((0, 0, L)))))
    for k in range(lati):
        j = (k + 1) % lati
        faces.append([k * 2, j * 2, j * 2 + 1, k * 2 + 1])
    faces.append(list(range(0, lati * 2, 2))[::-1])
    faces.append(list(range(1, lati * 2, 2)))
    return crea(nome, verts, faces, materiale, smusso=smusso)


def scatola(nome, centro, mezzi, materiale, smusso=0.0):
    """Una scatola, gia' in coordinate Blender."""
    cx, cy, cz = centro
    hx, hy, hz = mezzi
    v = [(cx + sx * hx, cy + sy * hy, cz + sz * hz)
         for sz in (-1, 1) for sy in (-1, 1) for sx in (-1, 1)]
    f = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1],
         [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]]
    return crea(nome, v, f, materiale, smusso=smusso)


# ═══════════════════════════════════════════════════════════════════════════
# LE MISURE DELLA COSTRUZIONE — tutte in un posto, tutte con la loro ragione
# ═══════════════════════════════════════════════════════════════════════════
#
# ─── LO STACCO DAL FASCIAME NON E' UN MARGINE DI SICUREZZA
#
# Un pagliolato che arriva a filo del fasciame passerebbe DENTRO le ordinate,
# che stanno li'. Lo stacco e' la profondita' dell'anima dell'ordinata: e' dove
# il pavimento finisce davvero, e la fessura che resta e' la fessura che c'e'
# su una nave vera -- e' da li' che scola la sentina.
H_ORDINATA = 0.11 / M            # profondita' dell'anima, in unita' di scena
STACCO = H_ORDINATA
PASSO_PAGLIOLATO = 0.40          # unita' di scena: 1,00 m per fascia
SPESSORE_PIANO = 0.030           # m
SPESSORE_PARATIA = 0.024         # m
MIN_LARGHEZZA = 0.12             # unita': sotto, la fascia e' una scheggia

PORTA_LARGA = 0.80 / M
PORTA_ALTA = 1.70 / M
PORTA_DAL_BORDO = 0.20 / M       # il montante fra la porta e la mezzeria

PASSO_ORDINATE = 0.90            # m fra un'ordinata e l'altra
SPESSORE_ORDINATA = 0.014
INDICI_CORRENTI = [3, 6, 9, 12]  # su 16 punti di contorno
SPESSORE_CORRENTE = 0.012
H_CORRENTE = 0.07 / M

MONTANTE_R = 0.022               # m
PIOLO_R = 0.014
PASSO_PIOLI = 0.28               # m
SCALA_LARGA = 0.44 / M           # interasse dei montanti, unita' di scena
MEZZO_BOCCAPORTO = 0.42 / M

# I boccaporti si riempiono quando le scale vengono collocate, e i pagliolati
# li leggono dopo. E' l'unica dipendenza d'ordine del file, ed e' dichiarata:
# al contrario il pavimento uscirebbe intero e la scaletta ci passerebbe
# dentro, senza nessun errore.
boccaporti = {q: [] for q in ORDINE_QUOTE}


# ═══════════════════════════════════════════════════════════════════════════
# 1 · I PASSAGGI VERTICALI — una scaletta, ripetuta
# ═══════════════════════════════════════════════════════════════════════════
#
# Una scala inclinata fra due ponti a due metri occuperebbe tre metri di ponte,
# e con le altezze libere di questo scafo -- misurate in `esporta-interni.mjs`,
# non supposte -- non ci starebbe. Si mette la scaletta verticale, che e' quello
# che c'e' davvero nei locali tecnici di una nave.
#
# Sta a proravia di ogni stazione, cosi' il boccaporto non cade dove la cella ha
# il suo soggetto.
def costruisci_scale():
    fatte = 0
    saltate = []
    for st in D['stazioni']:
        z_sc = max(PRUA_Z + 0.3, min(POPPA_Z - 0.3, st['z'] - 1.30 / M))
        for k in range(len(ORDINE_QUOTE) - 1):
            sopra = ORDINE_QUOTE[k]
            sotto = ORDINE_QUOTE[k + 1]
            y_su = pagliolato_y(sopra, z_sc)
            y_giu = pagliolato_y(sotto, z_sc)
            if y_su - y_giu < 0.40 / M:
                saltate.append('%s %s->%s (dislivello)' % (st['id'], sotto, sopra))
                continue
            # ─── IL MEZZO BAGLIO SI PRENDE IN BASSO, NON A META' ALTEZZA
            #
            # DIFETTO TROVATO DAL CANCELLO DI SPORGENZA, non guardando: la
            # scaletta era collocata sul mezzo baglio a meta' del suo tratto e
            # i montanti bucavano il fasciame di 821 mm in basso, dove lo scafo
            # si stringe. `semi` cresce con la quota, quindi il vincolo sta
            # sempre al piede: e' li' che va misurato.
            s = semi(z_sc, y_giu) - STACCO
            if s < SCALA_LARGA + 0.34 / M:
                saltate.append('%s %s->%s (stretto)' % (st['id'], sotto, sopra))
                continue
            x_c = -(s - SCALA_LARGA / 2 - 0.16 / M)
            for lato in (-1, 1):
                x = x_c + lato * SCALA_LARGA / 2
                reg('int_scale', prisma('sc', B(x, y_giu, z_sc),
                                        B(x, y_su + 0.35 / M, z_sc),
                                        MONTANTE_R, 6, MAT['chiaro']))
            n = max(1, int((y_su - y_giu) * M / PASSO_PIOLI))
            for j in range(1, n + 1):
                y = y_giu + (y_su - y_giu) * j / (n + 1)
                reg('int_scale', prisma('pi', B(x_c - SCALA_LARGA / 2, y, z_sc),
                                        B(x_c + SCALA_LARGA / 2, y, z_sc),
                                        PIOLO_R, 6, MAT['chiaro']))
            boccaporti[sopra].append((z_sc - MEZZO_BOCCAPORTO, z_sc + MEZZO_BOCCAPORTO,
                                      x_c - MEZZO_BOCCAPORTO, x_c + MEZZO_BOCCAPORTO))
            fatte += 1
    return fatte, saltate


# ═══════════════════════════════════════════════════════════════════════════
# 2 · I PAGLIOLATI — tre, tagliati sulla forma dello scafo a ogni stazione
# ═══════════════════════════════════════════════════════════════════════════
#
# A fasce longitudinali: fra due z consecutive una striscia che va dal fasciame
# alla mezzeria. Il bordo esterno segue `semi(z, y)`, cioe' lo scafo vero e non
# un rettangolo -- che e' il vincolo duro del brief.
#
# Le z delle fasce NON sono una suddivisione regolare: sono l'unione fra una
# suddivisione regolare e i BORDI DEI BOCCAPORTI. Con sole righe regolari il
# bordo di un boccaporto cadrebbe fra due fasce e il buco uscirebbe grande
# quanto la fascia piu' vicina -- fino a un metro invece di 84 cm. Nessun
# cancello lo vedrebbe: sarebbe comunque un boccaporto.
def costruisci_pagliolato(idq):
    righe = set()
    z = PRUA_Z
    while z < POPPA_Z - 1e-9:
        righe.add(z)
        z = min(z + PASSO_PAGLIOLATO, POPPA_Z)
    righe.add(POPPA_Z)
    for (z0, z1, _x0, _x1) in boccaporti[idq]:
        righe.add(z0)
        righe.add(z1)
    righe = sorted(r for r in righe if PRUA_Z - 1e-9 <= r <= POPPA_Z + 1e-9)

    verts, faces = [], []
    for k in range(len(righe) - 1):
        z0, z1 = righe[k], righe[k + 1]
        if z1 - z0 < 1e-6:
            continue
        y0 = pagliolato_y(idq, z0)
        y1 = pagliolato_y(idq, z1)
        s0 = semi(z0, y0) - STACCO
        s1 = semi(z1, y1) - STACCO
        if s0 <= MIN_LARGHEZZA or s1 <= MIN_LARGHEZZA:
            continue
        zm = (z0 + z1) / 2
        buchi = [(bx0, bx1) for (bz0, bz1, bx0, bx1) in boccaporti[idq]
                 if bz0 - 1e-9 <= zm <= bz1 + 1e-9]
        smax = max(s0, s1)
        for (t0, t1) in sottrai([(-smax, 0.0)], buchi):
            if t1 - t0 < 1e-4:
                continue
            f0 = min(1.0, -t0 / smax)
            f1 = min(1.0, -t1 / smax)
            i = len(verts)
            verts += [B(-s0 * f1, y0, z0), B(-s0 * f0, y0, z0),
                      B(-s1 * f0, y1, z1), B(-s1 * f1, y1, z1)]
            faces.append([i, i + 1, i + 2, i + 3])
    if not faces:
        raise SystemExit('il pagliolato %s e uscito VUOTO: nessuna fascia larga '
                         'abbastanza. La quota o lo scafo sono cambiati.' % idq)
    return crea('int_pagliolato_' + idq, verts, faces, MAT['pagliolo'],
                spessore=SPESSORE_PIANO, smusso=0.008)


# ═══════════════════════════════════════════════════════════════════════════
# 3 · LE PARATIE TRASVERSALI — con l'apertura di passaggio
# ═══════════════════════════════════════════════════════════════════════════
#
# Stessa costruzione a fasce, girata di novanta gradi: qui le fasce sono
# ORIZZONTALI, fra due quote, e le aperture si ottengono spezzando la fascia in
# due tratti invece che bucandola dopo.
def aperture_paratia(z):
    """Una porta per livello, appoggiata sul pagliolato di quel livello.

    Dove l'altezza libera non basta per una porta intera, la porta si accorcia
    invece di sfondare il ponte: e' un passo d'uomo, e su una nave i passi
    d'uomo esistono. Se non ci sta nemmeno quello il livello resta chiuso, e lo
    dice la stampa in fondo -- non lo si scopre guardando.
    """
    ap = []
    for idq in ORDINE_QUOTE:
        y0 = pagliolato_y(idq, z) + SPESSORE_PIANO / M / 2
        libera = soffitto_y(idq, z) - y0
        alt = min(PORTA_ALTA, libera - 0.06 / M)
        if alt < 0.50 / M:
            continue
        s = semi(z, y0 + alt / 2)
        x1 = -PORTA_DAL_BORDO
        x0 = x1 - PORTA_LARGA
        # la porta non puo' uscire dal fasciame: se il compartimento e' stretto
        # si stringe la porta, non si sfonda lo scafo
        if -x0 > s - STACCO:
            x0 = -max(0.0, s - STACCO)
        if x1 - x0 < 0.30 / M:
            continue
        ap.append((y0, y0 + alt, x0, x1, idq))
    return ap


def costruisci_paratia(idp, z):
    y_giu = chiglia(z)
    y_su = ponte(z)
    ap = aperture_paratia(z)
    righe = set()
    n = 24
    for k in range(n + 1):
        righe.add(y_giu + (y_su - y_giu) * k / n)
    for (a, b, _x0, _x1, _q) in ap:
        righe.add(a)
        righe.add(b)
    righe = sorted(r for r in righe if y_giu - 1e-9 <= r <= y_su + 1e-9)

    verts, faces = [], []
    for k in range(len(righe) - 1):
        ya, yb = righe[k], righe[k + 1]
        if yb - ya < 1e-6:
            continue
        sa = max(0.0, semi(z, ya))
        sb = max(0.0, semi(z, yb))
        smax = max(sa, sb)
        if smax < 1e-4:
            continue
        ym = (ya + yb) / 2
        buchi = [(x0, x1) for (a, b, x0, x1, _q) in ap if a - 1e-9 <= ym <= b + 1e-9]
        for (t0, t1) in sottrai([(-smax, 0.0)], buchi):
            if t1 - t0 < 1e-4:
                continue
            f0 = min(1.0, -t0 / smax)
            f1 = min(1.0, -t1 / smax)
            i = len(verts)
            verts += [B(-sa * f0, ya, z), B(-sa * f1, ya, z),
                      B(-sb * f1, yb, z), B(-sb * f0, yb, z)]
            faces.append([i, i + 1, i + 2, i + 3])
    if not faces:
        raise SystemExit('la paratia %s e uscita VUOTA.' % idp)
    return crea('int_paratia_' + idp, verts, faces, MAT['struttura'],
                spessore=SPESSORE_PARATIA, smusso=0.008), ap


# ═══════════════════════════════════════════════════════════════════════════
# 4 · L'OSSATURA — ordinate a passo regolare, e i correnti che le legano
# ═══════════════════════════════════════════════════════════════════════════
#
# ─── PERCHE' UN NASTRO E NON UN PROFILATO A L
#
# Un'ordinata vera e' anima piu' piattabanda. Dalla posa che conta -- la sezione
# verticale, che guarda la nave di traverso -- la piattabanda si vede DI TAGLIO:
# una riga di due centimetri dietro l'anima. Costa facce e non si legge. Si
# costruisce l'anima, con lo spessore vero, e si dice qui che la piattabanda non
# c'e' invece di lasciar credere che ci sia.
def costruisci_ordinate():
    verts, faces = [], []
    passo_u = PASSO_ORDINATE / M
    quante = 0
    z = PRUA_Z + passo_u
    while z < POPPA_Z - passo_u / 2:
        c = contorno(z)
        for k in range(len(c) - 1):
            (x0, y0), (x1, y1) = c[k], c[k + 1]
            dx, dy = x1 - x0, y1 - y0
            L = math.hypot(dx, dy)
            if L < 1e-6:
                continue
            # il contorno sale dalla chiglia al trincarino con x che va verso il
            # negativo, quindi (dy, -dx) punta verso la mezzeria: dentro
            nx, ny = dy / L, -dx / L
            # Alla chiglia la normale interna ha una componente verso DRITTA, e
            # l'anima dell'ordinata attraverserebbe la mezzeria di qualche
            # millimetro. Si taglia sulla mezzeria invece di tollerarla: la
            # meta' di dritta non si costruisce, e «qualche millimetro» e' il
            # modo in cui un vincolo diventa una raccomandazione.
            xa = min(0.0, x0 + nx * H_ORDINATA)
            xb = min(0.0, x1 + nx * H_ORDINATA)
            i = len(verts)
            verts += [B(x0, y0, z), B(x1, y1, z),
                      B(xb, y1 + ny * H_ORDINATA, z),
                      B(xa, y0 + ny * H_ORDINATA, z)]
            faces.append([i, i + 1, i + 2, i + 3])
        quante += 1
        z += passo_u
    return crea('int_ordinate', verts, faces, MAT['struttura'],
                spessore=SPESSORE_ORDINATA, smusso=0.004), quante


def _normale_contorno(c, k):
    k0 = max(0, min(len(c) - 2, k - 1))
    dx = c[k0 + 1][0] - c[k0][0]
    dy = c[k0 + 1][1] - c[k0][1]
    L = math.hypot(dx, dy) or 1.0
    return dy / L, -dx / L


# I correnti corrono LUNGO la nave sugli stessi punti parametrici del contorno,
# quindi seguono lo scafo per costruzione: sono le linee longitudinali della
# griglia con cui il sito cuce il guscio, non una curva nuova.
def costruisci_correnti():
    verts, faces = [], []
    passo = 0.5
    for idx in INDICI_CORRENTI:
        z = PRUA_Z
        while z < POPPA_Z - 1e-9:
            z1 = min(z + passo, POPPA_Z)
            ca, cb = contorno(z), contorno(z1)
            if idx >= len(ca):
                break
            xa, ya = ca[idx]
            xb, yb = cb[idx]
            na = _normale_contorno(ca, idx)
            nb = _normale_contorno(cb, idx)
            # A proravia lo scafo si chiude a lama e il punto di contorno dista
            # dalla mezzeria meno della profondita' del corrente: li' il
            # corrente non c'e', e SI SALTA invece di schiacciarlo contro la
            # mezzeria -- un corrente schiacciato e' una faccia degenere, che
            # non da' errore e sporca le normali.
            if (xa + na[0] * H_CORRENTE > -0.004 or
                    xb + nb[0] * H_CORRENTE > -0.004):
                z = z1
                continue
            i = len(verts)
            verts += [B(xa, ya, z), B(xb, yb, z1),
                      B(xb + nb[0] * H_CORRENTE, yb + nb[1] * H_CORRENTE, z1),
                      B(xa + na[0] * H_CORRENTE, ya + na[1] * H_CORRENTE, z)]
            faces.append([i, i + 1, i + 2, i + 3])
            z = z1
    return crea('int_correnti', verts, faces, MAT['struttura'],
                spessore=SPESSORE_CORRENTE, smusso=0.004)


# ═══════════════════════════════════════════════════════════════════════════
# 5 · IL CORREDO — plafoniere ovunque, il resto SOLO nelle tre celle ricche
# ═══════════════════════════════════════════════════════════════════════════
RICCHE = D['celleRicche']


def e_ricca(idq, z):
    return any(c['quota'] == idq and c['z0'] <= z <= c['z1'] for c in RICCHE)


def costruisci_plafoniere():
    """Una plafoniera stagna sotto il soffitto di ogni livello.

    Vanno anche nelle nove celle vuote, ed e' voluto: una stiva senza una luce
    non e' un vuoto, e' una cosa non finita. Una luce sola dice che qualcuno ci
    entra. Dove la cella e' ricca il passo si infittisce, perche' li' c'e' da
    vedere qualcosa.
    """
    quante = 0
    for idq in ORDINE_QUOTE:
        ricca = any(c['quota'] == idq for c in RICCHE)
        passo = (2.8 if ricca else 5.5) / M
        z = PRUA_Z + passo / 2
        while z < POPPA_Z:
            y = soffitto_y(idq, z) - 0.10 / M
            s = semi(z, y) - STACCO
            libera = soffitto_y(idq, z) - pagliolato_y(idq, z)
            if s > 0.5 / M and libera > 0.7 / M:
                x = -min(s - 0.22 / M, (0.95 if e_ricca(idq, z) else 0.60) / M)
                reg('int_plafoniere', scatola('pf', B(x, y, z),
                                              (0.075, 0.13, 0.05),
                                              MAT['chiaro'], smusso=0.012))
                quante += 1
            z += passo
    return quante


def costruisci_passerelle():
    """Passerelle portacavi: un canale a U con dentro due fasci.

    E' un array lungo la nave, non un pezzo: la sezione ne mostra il taglio a
    ogni ordinata, ed e' quel ritmo -- non il singolo canale -- a dire che li'
    dentro passa un impianto.
    """
    quante = 0
    LARG = 0.13          # m, mezza larghezza del canale
    for c in RICCHE:
        idq = c['quota']
        z = c['z0']
        while z < c['z1'] - 1e-9:
            z1 = min(z + 0.5, c['z1'])
            y = soffitto_y(idq, z) - 0.20 / M
            s = semi(z, y) - STACCO
            if s < 0.9 / M:
                z = z1
                continue
            x = -(s - 0.30 / M)
            zm = (z + z1) / 2
            mezzo_l = (z1 - z) * M / 2
            reg('int_passerelle_cavi', scatola('pc', B(x, y, zm),
                                               (LARG, mezzo_l, 0.006), MAT['impianto']))
            for lato in (-1, 1):
                cx, cy, cz = B(x, y, zm)
                reg('int_passerelle_cavi', scatola(
                    'pc', (cx + lato * LARG, cy, cz + 0.035),
                    (0.006, mezzo_l, 0.035), MAT['impianto']))
            for j, dz in enumerate((0.020, 0.052)):
                ax, ay, az = B(x, y, z)
                bx, by, bz = B(x, y, z1)
                d = -0.055 + j * 0.11
                reg('int_passerelle_cavi', prisma(
                    'cv', (ax + d, ay, az + dz), (bx + d, by, bz + dz),
                    0.026, 6, MAT['impianto']))
            quante += 1
            z = z1
    return quante


def costruisci_tubazioni():
    """Tubazioni con le flange: la flangia e' il dettaglio che dice «tubo» e non
    «cilindro», e costa otto facce."""
    quante = 0
    for c in RICCHE:
        idq = c['quota']
        for (frazione_x, salita, raggio) in ((0.62, 0.30, 0.055),
                                             (0.72, 0.52, 0.038),
                                             (0.50, 0.14, 0.072)):
            passi = []
            z = c['z0']
            while z <= c['z1'] + 1e-9:
                yp = pagliolato_y(idq, z)
                y = yp + (soffitto_y(idq, z) - yp) * salita
                s = semi(z, y) - STACCO
                passi.append(None if s < 0.6 / M else (-s * frazione_x, y, z))
                z += 0.5
            for k in range(len(passi) - 1):
                a, b = passi[k], passi[k + 1]
                if a is None or b is None:
                    continue
                reg('int_tubazioni', prisma('tb', B(*a), B(*b), raggio, 8, MAT['impianto']))
                quante += 1
                if k % 3 == 0:
                    mx_ = (a[0] + b[0]) / 2
                    my_ = (a[1] + b[1]) / 2
                    mz_ = (a[2] + b[2]) / 2
                    reg('int_tubazioni', prisma(
                        'fl', B(mx_, my_, mz_ - 0.012), B(mx_, my_, mz_ + 0.012),
                        raggio * 1.55, 8, MAT['impianto']))
    return quante


def costruisci_supporti():
    """Supporti antivibranti: coppie di tasselli sul pagliolato, in fila.

    Solo alle quote dei macchinari: e' li' che c'e' una massa da isolare. Sulla
    grigliata di sentina non ci si appoggia niente, e metterceli sarebbe
    decorazione.
    """
    quante = 0
    for c in RICCHE:
        idq = c['quota']
        if QUOTE[idq]['piano'] is None:
            continue
        z = c['z0'] + 0.30
        while z < c['z1'] - 0.20:
            y = pagliolato_y(idq, z) + SPESSORE_PIANO / M / 2
            s = semi(z, y) - STACCO
            if s > 0.8 / M:
                for frazione in (0.30, 0.62):
                    x = -s * frazione
                    reg('int_supporti', prisma('sup', B(x, y, z), B(x, y + 0.13 / M, z),
                                               0.055, 8, MAT['impianto'], smusso=0.006))
                    cx, cy, cz = B(x, y, z)
                    reg('int_supporti', scatola('sup', (cx, cy, cz + 0.145),
                                                (0.09, 0.09, 0.012), MAT['struttura'],
                                                smusso=0.005))
                    quante += 1
            z += 1.2 / M
    return quante


# ═══ COSTRUZIONE ══════════════════════════════════════════════════════════
n_scale, scale_saltate = costruisci_scale()

# ─── I POZZI SULLE MACCHINE, e perche' entrano dalla stessa porta dei
#     boccaporti
#
# Un locale macchine vero non ha un pavimento continuo sopra i motori: ha un
# cofano, con i pagliolati tutt'intorno. Il difetto che l'ha chiesto e' nel
# provino della cella poppa/macchine -- il pagliolato passava ATTRAVERSO il
# motore di propulsione -- e la misura sta in `esporta-interni.mjs`, che legge
# l'ingombro dai GLB delle macchine invece di ricopiarlo.
#
# Qui non c'e' niente di nuovo da scrivere: un pozzo E' un buco nel pagliolato,
# esattamente come un boccaporto, e passa dalla stessa lista e dalla stessa
# `sottrai`. Se fosse stato un secondo meccanismo, sarebbe stato il secondo modo
# di bucare un pavimento -- e due modi divergono.
n_pozzi = 0
for _p in D.get('pozzi', []):
    boccaporti[_p['quota']].append((_p['z0'], _p['z1'], _p['x0'], _p['x1']))
    n_pozzi += 1

for idq in ORDINE_QUOTE:
    reg('int_pagliolato_' + idq, costruisci_pagliolato(idq))

aperture_dette = []
for p in D['paratie']:
    o, ap = costruisci_paratia(p['id'], p['z'])
    reg('int_paratia_' + p['id'], o)
    aperture_dette.append((p['id'], [a[4] for a in ap]))

o, n_ordinate = costruisci_ordinate()
reg('int_ordinate', o)
reg('int_correnti', costruisci_correnti())

n_plafoniere = costruisci_plafoniere()
n_passerelle = costruisci_passerelle()
n_tubi = costruisci_tubazioni()
n_supporti = costruisci_supporti()

# ═══ MONTAGGIO ════════════════════════════════════════════════════════════
bpy.ops.object.empty_add(location=(0, 0, 0))
RADICE = bpy.context.object
RADICE.name = 'INTERNI'

NODI = ([f'int_pagliolato_{q}' for q in ORDINE_QUOTE] +
        [f'int_paratia_{p["id"]}' for p in D['paratie']] +
        ['int_ordinate', 'int_correnti', 'int_scale',
         'int_passerelle_cavi', 'int_tubazioni', 'int_plafoniere', 'int_supporti'])


def applica_modificatori(o):
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    for mo in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=mo.name)


for nodo in NODI:
    lista = [x for x in pezzi.get(nodo, []) if x is not None]
    if not lista:
        raise SystemExit('il nodo %s non ha nemmeno un pezzo: uscirebbe come guscio '
                         'vuoto, e il collaudo lo direbbe a valle invece che qui.' % nodo)
    # ─── I MODIFICATORI SI APPLICANO PRIMA DEL JOIN, E NON E' PIGNOLERIA
    #
    # `bpy.ops.object.join()` fonde le mesh dentro l'oggetto ATTIVO e tiene solo
    # i modificatori di quello: tutti gli altri spariscono. Su `int_scale`, dove
    # ogni piolo e' un oggetto con il suo smusso, vorrebbe dire trentacinque
    # pioli senza smusso e uno smussato. Non da' nessun errore -- da' un modello
    # in cui la rifinitura c'e' su un pezzo solo, e si da' la colpa alla luce.
    for x in lista:
        applica_modificatori(x)
    bpy.ops.object.select_all(action='DESELECT')
    for x in lista:
        x.select_set(True)
    bpy.context.view_layer.objects.active = lista[0]
    if len(lista) > 1:
        bpy.ops.object.join()
    unito = bpy.context.object
    unito.name = nodo
    unito.parent = RADICE

RADICE['assetRole'] = 'yacht-hull-interior-structure-port-half'
RADICE['authoringUnit'] = 'meter'
RADICE['sceneMetersPerUnit'] = M
RADICE['builtSide'] = 'port'
RADICE['deckIds'] = ','.join(ORDINE_QUOTE)
# ─── LE DUE QUOTE CHE ESCONO IN UNITA' DI SCENA, E IL NOME LO DICE
#
# Il modello e' in METRI perche' glTF li impone, ma queste due sono coordinate
# della GRIGLIA dell'atto due, e la griglia vive in unita' di scena: e' li' che
# `vaiACella` porta la camera. Chiamarle `deckY` e basta, dentro un file in
# metri, era un invito a moltiplicarle per 2,5 una seconda volta -- e un ponte
# messo a 1,0 m invece che a 0,40 unita non da' nessun errore.
RADICE['deckYScene'] = ','.join('%.4f' % pagliolato_y(q, 0.0) for q in ORDINE_QUOTE)
RADICE['bulkheadZScene'] = ','.join('%.3f' % p['z'] for p in D['paratie'])
#
# ─── E SI DICE QUALI PONTI SONO PIANI, PERCHE' UNO NON LO E'
#
# `deckYScene` per la sentina e' il valore a z = 0, non una quota costante: quel
# pagliolato SEGUE la chiglia. Un extra che sembra una costante e non lo e' e'
# esattamente il genere di numero su cui qualcuno costruisce, mesi dopo, una
# camera messa alla quota sbagliata a prua e a poppa -- senza nessun errore da
# leggere. Il nome dice che c'e' da guardare.
RADICE['deckFlat'] = ','.join('1' if QUOTE[q]['piano'] is not None else '0'
                              for q in ORDINE_QUOTE)
RADICE['frameSpacingM'] = PASSO_ORDINATE
RADICE['richCells'] = ','.join('%s/%s' % (c['stazione'], c['quota']) for c in RICCHE)
RADICE['modelClaim'] = 'illustrative'

# ═══════════════════════════════════════════════════════════════════════════
# I CONTROLLI, QUI E NON A VALLE
# ═══════════════════════════════════════════════════════════════════════════
#
# ─── NIENTE DEVE SPORGERE OLTRE LO SCAFO, E VA MISURATO SUI VERTICI VERI
#
# Il vincolo e' duro e non e' verificabile guardando: la meta' di dritta la
# ritaglia il renderer, quindi un pezzo che buca il fasciame a babordo si
# vedrebbe solo dal lato che si guarda, e uno che buca a dritta non si vedrebbe
# MAI -- e resterebbe nel file, come peso.
#
# La tolleranza non e' zero e non puo' esserlo: lo smusso e la meta' dello
# spessore spostano i vertici verso l'esterno di quantita' NOTE. Si dichiara
# quella quantita' e si stampa lo scarto peggiore, invece di far passare
# qualunque cosa con un margine generoso.
TOLL_M = SPESSORE_PARATIA / 2 + 0.012 + 1e-4      # meta' spessore + smusso

peggiore = 0.0
dove = None
oltre_mezzeria = -1e9
oltre_chi = None
fuori_quota = 0.0
quota_chi = None
fuori_lungo = 0.0
for o in bpy.data.objects:
    if o.type != 'MESH':
        continue
    mw = o.matrix_world
    for v in o.data.vertices:
        w = mw @ v.co
        xs, ys, zs = w.x / M, w.z / M, -w.y / M
        if xs > oltre_mezzeria:
            oltre_mezzeria = xs
            oltre_chi = o.name
        fuori_lungo = max(fuori_lungo, PRUA_Z - zs, zs - POPPA_Z)
        fq = max(chiglia(zs) - ys, ys - ponte(zs))
        if fq > fuori_quota:
            fuori_quota = fq
            quota_chi = o.name
        d = sfondamento_laterale(zs, xs, ys)
        if d > peggiore:
            peggiore = d
            dove = (o.name, xs, ys, zs, semi(zs, ys))

print('SPORGENZA  peggiore %.1f mm oltre il fasciame, tolleranza %.1f mm'
      % (peggiore * M * 1000, TOLL_M * 1000))
if dove:
    print('           su %s a z=%.2f y=%.2f: |x| %.4f contro un mezzo baglio di %.4f'
          % (dove[0], dove[3], dove[2], -dove[1], dove[4]))
print('MEZZERIA   il vertice piu a dritta sta a x = %.5f unita (%.1f mm) su %s'
      % (oltre_mezzeria, oltre_mezzeria * M * 1000, oltre_chi))
print('FUORI QUOTA  %.1f mm sopra il ponte o sotto la chiglia, su %s'
      % (fuori_quota * M * 1000, quota_chi))
if peggiore * M > TOLL_M:
    raise SystemExit('SPORGE dal fasciame di %.1f mm: il vincolo duro del brief e '
                     'violato e il modello NON si spedisce.' % (peggiore * M * 1000))
# La mezzeria ha la STESSA tolleranza del fasciame, e per la stessa ragione: lo
# smusso sposta i vertici di una quantita' nota. Zero secco boccerebbe uno
# smusso, non un errore -- e un cancello che boccia la rifinitura insegna a
# ignorarlo. Oltre quella soglia invece e' geometria costruita a dritta, che il
# piano di sezione toglie dallo schermo ma non dal file.
if oltre_mezzeria * M > TOLL_M:
    raise SystemExit('c e geometria a DRITTA (x=%.4f): il piano di sezione la '
                     'toglierebbe dallo schermo ma non dal file, e sarebbe peso '
                     'spedito per niente.' % oltre_mezzeria)
if fuori_quota * M > TOLL_M:
    raise SystemExit('esce dallo scafo in ALTEZZA di %.1f mm.' % (fuori_quota * M * 1000))
print('FUORI LUNG   %.1f mm oltre la prua o lo specchio' % (fuori_lungo * M * 1000))
if fuori_lungo * M > TOLL_M:
    raise SystemExit('c e geometria fuori dallo scafo in lunghezza di %.1f mm.'
                     % (fuori_lungo * M * 1000))

tri = 0
mn = Vector((1e9, 1e9, 1e9))
mx = Vector((-1e9, -1e9, -1e9))
for o in bpy.data.objects:
    if o.type != 'MESH':
        continue
    o.data.calc_loop_triangles()
    tri += len(o.data.loop_triangles)
    for c in o.bound_box:
        w = o.matrix_world @ Vector(c)
        for i in range(3):
            mn[i] = min(mn[i], w[i])
            mx[i] = max(mx[i], w[i])

print('NODI       %d' % len(NODI))
print('TRIANGOLI  %d' % tri)
print('INGOMBRO   %.2f larg x %.2f lung x %.2f alt m' % (mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]))
print('POZZI      %d aperture sulle macchine, misurate sui loro GLB' % n_pozzi)
print('SCALE      %d scalette%s' % (n_scale, ('; saltate: ' + '; '.join(scale_saltate))
                                    if scale_saltate else ''))
print('ORDINATE   %d a passo %.2f m' % (n_ordinate, PASSO_ORDINATE))
print('CORREDO    %d plafoniere, %d tratti di passerella, %d tratti di tubo, %d supporti'
      % (n_plafoniere, n_passerelle, n_tubi, n_supporti))
for (idp, quali) in aperture_dette:
    print('APERTURE   %s: %s' % (idp, ', '.join(quali) if quali else 'NESSUNA'))

bpy.ops.object.select_all(action='SELECT')
percorso = os.path.join(FUORI, 'interni.glb')
bpy.ops.export_scene.gltf(filepath=percorso, export_format='GLB',
                          use_selection=True, export_apply=True,
                          export_yup=True, export_extras=True)
print('GLB %.0f KB' % (os.path.getsize(percorso) / 1024))
