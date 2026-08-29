"""
LE DUE MACCHINE DELL'ATTO DUE — propulsione e giroscopio.

    blender -b -P glb-macchine.py -- <cartella> propulsione
    blender -b -P glb-macchine.py -- <cartella> giroscopio
    blender -b -P glb-macchine.py -- <cartella> entrambe

`docs/13-ATTO-DUE.md` §7 punto 4: «albero, riduttore ed elica non hanno ancora
una rappresentazione Blender collegata a `giriPropulsione`», e il punto 5 chiede
il giroscopio come controesempio della catena del §4. Questo file costruisce le
due macchine e le esporta come GLB separati.

─── PERCHE' UN FILE SOLO PER DUE MACCHINE

Le due macchine non si somigliano, ma gli AIUTI si': cilindri, smussi, anelli,
bulloneria, cavi, il montaggio dei nodi e la guardia sulla gerarchia sono gli
stessi di `glb-impianto.py`. Tenerli in due file avrebbe voluto dire due copie
che divergono — ed e' gia' successo in questo repo con `glb-grezzo.py`. Si
sceglie quale macchina costruire da riga di comando; la scena si azzera fra una
e l'altra.

─── LE TRE COSE CHE QUESTO FILE FA DIVERSAMENTE DALL'IMPIANTO, E PERCHE'

1. GLI SMUSSI SI APPLICANO DAVVERO, NON SI TOLGONO.

   `glb-impianto.py` spedisce la BASSA con i modificatori RIMOSSI: gli smussi
   vivono nella normale cotta, e la geometria in linea e' scarna. E' la scelta
   giusta LI', dove esiste una catena di cottura tarata (`rifai-impianto.sh`).

   Qui non c'e' cottura, quindi togliere i modificatori vorrebbe dire spedire
   spigoli matematici — e senza smussi non c'e' fotorealismo, perche' in natura
   uno spigolo vivo non esiste e la luce non ci si aggrappa. Gli smussi si
   APPLICANO, si paga in triangoli, e il conto e' stampato in fondo.

2. NIENTE TEXTURE, E VA DETTO PERCHE' NON E' UNA RINUNCIA.

   Il vincolo di peso e' duro: i due modelli insieme devono stare sotto i 250 KB
   brotli. Una normale cotta a 512 costa ~33 KB webp A MODELLO e non si comprime
   piu' (brotli su un webp non guadagna niente: e' peso che passa intero),
   mentre la geometria meshopt si comprime ancora ~2,4 volte. Con il budget che
   c'e', gli stessi byte rendono di piu' spesi in smussi veri che in una mappa.

   E' un debito dichiarato: la VARIAZIONE di rugosita' — l'indizio numero uno
   del sintetico — non e' esprimibile in glTF senza texture, quindi qui la
   rugosita' e' costante per materiale. Se un domani si vuole la variazione, la
   strada e' la stessa dell'impianto e c'e' gia' scritta in `rifai-impianto.sh`.

3. GLI EXTRAS SONO SOLO SCALARI, E NON E' PIGNOLERIA.

   `strumenti/comprimi-modello.mjs` verifica che nessun extra sia cambiato con
   `prima.extras[k] !== dopo.extras[k]`. Su un array o un oggetto quel confronto
   e' fra RIFERIMENTI, quindi e' vero sempre: la compressione verrebbe rifiutata
   con «extra alterato» su un dato identico. I nodi che ruotano si dichiarano
   percio' in una stringa separata da virgole, non in una lista.

─── L'ORIGINE DEI NODI CHE GIRANO, CHE E' IL DIFETTO PIU' FACILE

Un nodo che ruota attorno a un'origine fuori asse non gira: descrive un CONO.
Non da' nessun errore — il GLB e' valido, l'animazione parte, il pezzo si
muove — e si vede solo guardando, dove pero' si da' la colpa al modello.

Qui gli assi sono scelti apposta perche' l'origine cada sull'asse per
costruzione, non per aggiustamento:

  PROPULSIONE   l'albero corre lungo la Y di Blender, a x = 0 e z = 0. In glTF
                (`export_yup=True`: glTF x,y,z = Blender x, z, -y) diventa
                l'asse Z, che e' l'asse longitudinale della nave in
                `src/scafo/ordinate.js` (PRUA_Z = -8, POPPA_Z = +8). Il motore
                sta a Blender +Y, cioe' glTF -Z, cioe' verso PRUA: giusto.

  GIROSCOPIO    il rotore gira attorno alla Z di Blender = Y di glTF, cioe' la
                verticale, com'e' in un giroscopio antirollio vero. La culla
                cardanica precede attorno alla X, cioe' l'asse trasversale.

`strumenti/collaudo-glb.mjs` lo verifica misurando: l'ingombro di ogni nodo
rotante, nel piano perpendicolare al suo asse, deve essere centrato sull'origine
del nodo. Se l'origine scappa, l'ingombro si scentra e il cancello si accende.
"""
import bpy, math, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
FUORI = argv[0]
QUALE = argv[1] if len(argv) > 1 else 'entrambe'

# ═════════════════════════════════════════════════════════════════════════
#  LE QUOTE, IN METRI, E DA DOVE VENGONO
# ═════════════════════════════════════════════════════════════════════════
#
# Uno scafo di 40 m dislocante, due linee d'assi. Le quote sono quelle di
# classe: non sono copiate da una scheda tecnica singola, e per questo il
# modello si dichiara `modelClaim = 'illustrative'` come fa l'impianto. Cio'
# che NON e' illustrativo e' la coerenza reciproca: se l'elica cresce, cresce
# l'albero che la regge, e il cancello se ne accorge.

# --- propulsione -------------------------------------------------------
POTENZA_KW = 750.0        # motore elettrico di propulsione, una linea
RAPPORTO = 3.5            # riduttore ad assi paralleli
MOT_R = 0.300             # raggio carcassa motore
MOT_L = 1.500             # lunghezza carcassa
MOT_DZ = 0.220            # quanto l'asse motore sta PIU' IN ALTO dell'albero.
#                           Un riduttore ad assi paralleli esiste per questo:
#                           se i due assi fossero allineati il riduttore non
#                           avrebbe ragione di esserci, e un tecnico lo vede.
RID_X, RID_Y, RID_Z = 0.620, 0.720, 0.680
ALB_R = 0.090             # albero portaelica, diametro 180 mm
ALB_DA = 1.000            # estremo prodiero (giunto col riduttore)
ALB_A = -3.450            # estremo poppiero (cono per l'elica)
AST_RE = 0.150            # astuccio, raggio esterno
AST_RI = 0.108            # raggio interno: 18 mm di parete oltre l'albero
AST_L = 1.350             # lunghezza dell'astuccio
ELICA_D = 1.600           # diametro elica
ELICA_PALE = 4            # QUATTRO pale, e la ragione e' nel cancello: con un
#                           numero pari di pale l'ingombro nel piano
#                           perpendicolare e' esattamente centrato sull'asse,
#                           quindi la verifica dell'origine puo' stringere a
#                           pochi millimetri. Con cinque pale a 72 gradi lo
#                           stesso ingombro e' scentrato del 5,3% per pura
#                           geometria (cos 0 = 1, cos 144 = -0,809), e il
#                           cancello andrebbe allargato fino a non vedere piu'
#                           un difetto vero. Quattro pale su uno yacht sono la
#                           norma: non si e' scelto un modello improbabile per
#                           far tornare un controllo.
ELICA_PASSO = 1.15        # passo / diametro
ELICA_Y = -3.660          # centro del mozzo sull'asse

# --- giroscopio --------------------------------------------------------
ROT_R = 0.430             # volano, diametro 860 mm
ROT_H = 0.160             # altezza della corona
ROT_Z = 0.660             # quota del centro sopra il basamento
SFERA_R = 0.510           # contenitore sigillato, diametro 1020 mm
SFERA_SP = 0.014          # parete 14 mm: e' un ANELLO, non una pelle (§4.1)
BASE_X, BASE_Y = 1.340, 1.180
ROT_GIRI = 4500           # giri/min a regime

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = 'METRIC'


# ═════════════════════════════════════════════════════════════════════════
#  MATERIALI — §7 di docs/14: metallo pulito ma non perfetto
# ═════════════════════════════════════════════════════════════════════════
#
# La regola del repo e' esplicita: uno yacht di lusso ha «metallo pulito ma non
# perfetto, vernice industriale, bulloneria, cavi ordinati, targhette,
# tubazioni, giunti, supporti antivibranti». Non sporco da videogioco.
#
# La rugosita' viene da `LEGGIMI.md`: acciaio 0,20, bronzo 0,30. Sopra quei
# valori il pezzo legge come sabbiato; sotto, come cromo da concessionario.
def mat(nome, colore, metallo, rugosita):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*colore, 1)
    b.inputs['Metallic'].default_value = metallo
    b.inputs['Roughness'].default_value = rugosita
    return m


MAT = {}


def materiali():
    """Si rifanno a ogni macchina perche' la scena si azzera fra le due."""
    MAT.clear()
    MAT.update({
        # vernice industriale marina: colata, quindi senza verso di lavorazione
        'vernice_motore': mat('vernice_motore', (0.055, 0.075, 0.092), 0.0, 0.40),
        'vernice_riduttore': mat('vernice_riduttore', (0.048, 0.058, 0.062), 0.0, 0.44),
        'vernice_base': mat('vernice_base', (0.072, 0.078, 0.080), 0.0, 0.50),
        'vernice_gyro': mat('vernice_gyro', (0.780, 0.782, 0.775), 0.0, 0.46),
        # acciai: tornito, quindi rugosita' bassa. La variazione direzionale che
        # li farebbe leggere come LAVORATI vuole una texture, e qui non c'e':
        # e' il debito dichiarato in testa al file.
        'acciaio': mat('acciaio', (0.540, 0.560, 0.580), 1.0, 0.24),
        'albero': mat('albero', (0.600, 0.612, 0.620), 1.0, 0.20),
        'inox': mat('inox', (0.620, 0.628, 0.635), 1.0, 0.22),
        'ghisa': mat('ghisa', (0.300, 0.302, 0.305), 1.0, 0.52),
        # bronzo al nichel-alluminio: e' il materiale delle eliche, e si mette
        # perche' la funzione lo giustifica, non come codice per «acqua marina»
        'bronzo': mat('bronzo', (0.560, 0.400, 0.240), 1.0, 0.32),
        'ottone': mat('ottone', (0.620, 0.480, 0.230), 1.0, 0.28),
        # zinco sacrificale: opaco, e un tecnico lo cerca
        'zinco': mat('zinco', (0.500, 0.505, 0.500), 1.0, 0.62),
        'gomma': mat('gomma', (0.022, 0.022, 0.024), 0.0, 0.86),
        'cavo': mat('cavo', (0.420, 0.200, 0.045), 0.0, 0.68),
        'tubo': mat('tubo', (0.140, 0.150, 0.160), 0.0, 0.58),
        'targhetta': mat('targhetta', (0.700, 0.705, 0.710), 1.0, 0.30),
        'carena': mat('carena', (0.820, 0.810, 0.780), 0.0, 0.62),
    })


# ═════════════════════════════════════════════════════════════════════════
#  AIUTI GEOMETRICI
# ═════════════════════════════════════════════════════════════════════════
pezzi_di = {}


def reg(nodo, o):
    pezzi_di.setdefault(nodo, []).append(o)
    return o


def smussa(o, largh=0.0020, seg=2):
    """Smusso 1-3 mm. Il limite ad angolo evita di arrotondare le facce piatte,
    che costerebbe triangoli senza cambiare niente."""
    m = o.modifiers.new('s', 'BEVEL')
    m.width = largh
    m.segments = seg
    m.limit_method = 'ANGLE'
    m.angle_limit = math.radians(35)
    return o


def _orienta(o, asse):
    """Ruota un primitivo nato lungo Z verso l'asse chiesto, e APPLICA solo la
    rotazione.

    TRAPPOLA GIA' PAGATA IN QUESTO REPO (nota di `glb-impianto.py`, riportata
    qui perche' vale identica): `transform_apply` ha i tre argomenti a True per
    difetto, e nominarne uno non spegne gli altri. Se si applica anche la
    posizione, la posizione finisce cotta dentro la mesh, l'oggetto resta a
    (0,0,0), e qualunque rotazione assegnata dopo gira il pezzo attorno
    all'ORIGINE DELLA SCENA invece che attorno a se'. Non da' nessun errore:
    da' un ingombro assurdo.
    """
    if asse == 'X':
        o.rotation_euler = (0, math.radians(90), 0)
    elif asse == 'Y':
        o.rotation_euler = (math.radians(90), 0, 0)
    if asse != 'Z':
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    return o


def cil(r, h, pos, materiale, lati=32, asse='Z', smusso=0.0020):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=lati, location=pos)
    o = bpy.context.object
    _orienta(o, asse)
    o.data.materials.append(MAT[materiale])
    bpy.ops.object.shade_smooth()
    if smusso:
        smussa(o, smusso)
    return o


def cono(r1, r2, h, pos, materiale, lati=32, asse='Z', smusso=0.0020):
    bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=h,
                                    vertices=lati, location=pos)
    o = bpy.context.object
    _orienta(o, asse)
    o.data.materials.append(MAT[materiale])
    bpy.ops.object.shade_smooth()
    if smusso:
        smussa(o, smusso)
    return o


def box(dim, pos, materiale, smusso=0.0025):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    o = bpy.context.object
    o.scale = dim
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(MAT[materiale])
    return smussa(o, smusso)


def anello(r_est, r_int, h, pos, materiale, lati=48, asse='Z', smusso=0.0020):
    """UN ANELLO, non una superficie sottile — §4.1 di docs/14.

    Un guscio senza spessore, tagliato, mostra il rovescio della pelle e non da'
    nessun errore. L'astuccio e la sfera del giroscopio sono i due posti dove
    questo si vedrebbe subito, perche' sono proprio i pezzi che il sito apre.
    """
    est = cil(r_est, h, pos, materiale, lati, asse, smusso=0)
    dentro = cil(r_int, h * 1.6, pos, materiale, lati, asse, smusso=0)
    m = est.modifiers.new('b', 'BOOLEAN')
    m.operation = 'DIFFERENCE'
    m.object = dentro
    bpy.context.view_layer.objects.active = est
    bpy.ops.object.modifier_apply(modifier='b')
    bpy.data.objects.remove(dentro, do_unlink=True)
    return smussa(est, smusso)


def bullone(pos, r=0.009, h=0.016, asse='Z', materiale='inox'):
    """Testa esagonale. Sei lati bastano: un bullone di 18 mm su un modello che
    si guarda da un metro non merita piu' di dodici triangoli di testa, e
    moltiplicati per le decine che ce ne sono la differenza si vede nel peso."""
    return cil(r, h, pos, materiale, 6, asse, smusso=0.0008)


def corona_bulloni(nodo, centro, raggio, quanti, asse='Z', r=0.009, h=0.016,
                   materiale='inox'):
    """La bulloneria e' la prima cosa che un tecnico guarda: e' cio' che
    distingue un pezzo montato da un rendering di catalogo."""
    cx, cy, cz = centro
    for i in range(quanti):
        a = 2 * math.pi * i / quanti
        if asse == 'Z':
            p = (cx + raggio * math.cos(a), cy + raggio * math.sin(a), cz)
        elif asse == 'Y':
            p = (cx + raggio * math.cos(a), cy, cz + raggio * math.sin(a))
        else:
            p = (cx, cy + raggio * math.cos(a), cz + raggio * math.sin(a))
        reg(nodo, bullone(p, r, h, asse, materiale))


def curva(punti, raggio, materiale, nodo, risoluzione=3):
    """Cavi e tubazioni. Nessuna macchina a bordo e' senza qualcosa che la
    raggiunge: senza, e' un rendering di catalogo."""
    d = bpy.data.curves.new('c', 'CURVE')
    d.dimensions = '3D'
    d.bevel_depth = raggio
    d.bevel_resolution = risoluzione
    d.resolution_u = 4
    s = d.splines.new('BEZIER')
    s.bezier_points.add(len(punti) - 1)
    for bp, p in zip(s.bezier_points, punti):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    o = bpy.data.objects.new('cavo', d)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(MAT[materiale])
    return reg(nodo, o)


def antivibrante(nodo, pos, r=0.048, h=0.052):
    """Supporto antivibrante: campana in gomma fra due piatti d'acciaio, con il
    prigioniero centrale. Il brief li chiede per nome, e sono anche l'unico
    pezzo che spiega PERCHE' la macchina non e' imbullonata secca al fasciame."""
    x, y, z = pos
    reg(nodo, cil(r * 1.30, 0.012, (x, y, z - h / 2 - 0.006), 'acciaio', 16))
    reg(nodo, cono(r, r * 0.80, h, (x, y, z), 'gomma', 20))
    reg(nodo, cil(r * 1.10, 0.012, (x, y, z + h / 2 + 0.006), 'acciaio', 16))
    reg(nodo, cil(0.010, 0.040, (x, y, z + h / 2 + 0.026), 'inox', 8))


def targhetta(nodo, dim, pos, materiale='targhetta'):
    """Una targhetta dati non si legge da un metro, ma la sua presenza si vede:
    e' un rettangolo piu' chiaro con quattro rivetti, ed e' un dettaglio che
    non esiste in nessun rendering generato.

    ─── L'ORDINE DEGLI ARGOMENTI E' `dim, pos`, COME IN `box`, E C'E' UN MOTIVO

    SINTOMO: nel provino della propulsione un parallelepipedo chiaro grande
    come mezza macchina stava appoggiato sull'albero fra la tenuta e il
    riduttore. Non somigliava a nessun pezzo del progetto, e l'ho inseguito per
    quattro render: prima l'ho scambiato per una luce vista in camera, poi per
    il fasciame, poi per l'astuccio.
    CAUSA: questa funzione era dichiarata `(nodo, pos, dim)` mentre tutte e
    quattro le chiamate passavano `(nodo, dim, pos)` — l'ordine di `box`, che
    e' quello che viene naturale scrivere. Quindi la POSIZIONE finiva nella
    scala: la targhetta del motore, chiesta di 10 x 180 x 120 mm, usciva di
    0,33 x 2,18 x 0,32 m, cioe' un pannello di due metri, piazzato dove
    sarebbero dovute stare le sue dimensioni.
    COME L'HO ISOLATA: non guardando — guardando si continua a sbagliare
    ipotesi. Stampando l'ingombro di OGNI PEZZO prima del `join` (la spia in
    `monta`), la riga `prop_motore Cube.015 0.33 x 2.18 x 0.32 [targhetta]` da'
    insieme il nome, la taglia e il materiale, e il difetto e' finito li'.

    Nessun errore, in nessun punto: tre numeri sono tre numeri. E' il motivo
    per cui una firma con due terne omogenee va tenuta d'occhio.
    """
    reg(nodo, box(dim, pos, materiale, smusso=0.0008))


# ═════════════════════════════════════════════════════════════════════════
#  MONTAGGIO, ESPORTAZIONE, E LE GUARDIE
# ═════════════════════════════════════════════════════════════════════════
def monta(radice_nome, nodi, gerarchia, origini, extras, nome_file):
    """Costruisce la gerarchia, applica gli smussi, triangola, esporta.

    Le guardie sono le stesse di `glb-impianto.py` e stanno qui per la stessa
    ragione: il guasto che coprono non fa rumore.
    """
    bpy.ops.object.empty_add(location=(0, 0, 0))
    radice = bpy.context.object
    radice.name = radice_nome

    vuoti = {}
    for n in nodi:
        bpy.ops.object.empty_add(location=origini.get(n, (0, 0, 0)))
        v = bpy.context.object
        v.name = n
        v.empty_display_size = 0.04
        vuoti[n] = v
    for n, v in vuoti.items():
        padre = vuoti.get(gerarchia.get(n), radice)
        v.parent = padre
        v.matrix_parent_inverse = padre.matrix_world.inverted()

    # ─── LA SPIA SUI PEZZI GROSSI, PRIMA CHE IL `join` LI CONFONDA ───────
    #
    # Dopo il `join` un nodo e' UNA mesh: se dentro c'e' un pezzo sbagliato,
    # l'unica cosa misurabile e' l'ingombro del nodo intero, e da li' il pezzo
    # non ha piu' un nome. Ho passato quattro render a cercare di capire cosa
    # fosse un volume chiaro grande come mezza macchina: si vedeva, ma non si
    # poteva interrogare.
    # Qui si stampa, PRIMA di fondere, ogni pezzo la cui quota maggiore supera
    # mezzo metro. Su macchine di questa taglia sono pochi e si conoscono a
    # memoria: uno che non ci si aspetta salta all'occhio e ha gia' un nome.
    print('PEZZI GROSSI (quota maggiore oltre 0,50 m)')
    for nodo in sorted(pezzi_di):
        for o in pezzi_di[nodo]:
            if o.type != 'MESH':
                continue
            b = [o.matrix_world @ Vector(v) for v in o.bound_box]
            mn = [min(q[i] for q in b) for i in range(3)]
            mx = [max(q[i] for q in b) for i in range(3)]
            d = [mx[i] - mn[i] for i in range(3)]
            if max(d) > 0.50:
                print('  %-16s %-22s %5.2f x %5.2f x %5.2f   y da %6.2f a %6.2f  [%s]'
                      % (nodo, o.name, d[0], d[1], d[2], mn[1], mx[1],
                         o.data.materials[0].name if o.data.materials else '-'))

    # --- GLI SMUSSI SI APPLICANO PRIMA DEL `join`, E NON E' UN DETTAGLIO ---
    #
    # SINTOMO che si otterrebbe saltando questo passo: il modello esce con gli
    # spigoli vivi, cioe' senza la cosa per cui gli smussi erano stati messi,
    # e nessuno se ne accorge finche' non lo si guarda in luce dura.
    # CAUSA: `bpy.ops.object.join()` tiene i modificatori del solo oggetto
    # ATTIVO e butta quelli di tutti gli altri, in silenzio. Con `export_apply
    # =False` a valle, quei bevel non tornano piu'.
    # COME L'HO ISOLATA: leggendo `glb-impianto.py`, che i modificatori non li
    # applica affatto — li RIMUOVE (`modifiers.remove`) — perche' li' gli
    # smussi vivono nella normale cotta. Qui non c'e' cottura: la stessa riga
    # produrrebbe l'effetto opposto.
    for lista in pezzi_di.values():
        for o in lista:
            if o.type != 'MESH':
                continue
            bpy.ops.object.select_all(action='DESELECT')
            o.select_set(True)
            bpy.context.view_layer.objects.active = o
            for m in list(o.modifiers):
                bpy.ops.object.modifier_apply(modifier=m.name)

    # --- `convert` GUARDA LA SELEZIONE, NON L'OGGETTO ATTIVO ---
    #
    # Trappola gia' pagata in `glb-impianto.py` e riportata qui identica:
    # `bpy.ops.object.convert` lavora su `selected_editable_objects`. Senza
    # selezione non converte niente, non solleva niente, non stampa niente — e
    # una curva non convertita viene scartata dal `join` (che unisce solo lo
    # stesso tipo dell'attivo), resta orfana alla radice della scena, e nel GLB
    # arriva come un nodo fuori dal contratto.
    for nodo, lista in pezzi_di.items():
        for o in list(lista):
            if o.type == 'CURVE':
                bpy.ops.object.select_all(action='DESELECT')
                o.select_set(True)
                bpy.context.view_layer.objects.active = o
                bpy.ops.object.convert(target='MESH')

    # --- SI TRIANGOLA, PRIMA DEL `join` ---
    #
    # Questi pezzi sono cilindri e coni, cioe' pieni di tappi a n-gon. glTF e'
    # comunque triangoli e l'esportatore triangolerebbe da solo: farlo qui
    # serve a poter CONTARE i triangoli spediti prima di spedirli, che e'
    # l'unico modo di rispettare un tetto di peso invece di scoprirlo dopo.
    ngon = 0
    for o in list(bpy.data.objects):
        if o.type != 'MESH':
            continue
        ngon += sum(1 for p in o.data.polygons if len(p.vertices) > 4)
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        t = o.modifiers.new('tri', 'TRIANGULATE')
        t.quad_method = 'SHORTEST_DIAGONAL'
        t.keep_custom_normals = True
        bpy.ops.object.modifier_apply(modifier=t.name)

    for nodo, lista in pezzi_di.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o in lista:
            o.select_set(True)
        bpy.context.view_layer.objects.active = lista[0]
        if len(lista) > 1:
            bpy.ops.object.join()
        unito = bpy.context.object
        unito.name = nodo + '_MESH'
        unito.parent = vuoti[nodo]
        unito.matrix_parent_inverse = vuoti[nodo].matrix_world.inverted()

    fuori = [o.name for o in bpy.data.objects if o.parent is None and o is not radice]
    if fuori:
        raise SystemExit(
            'ERRORE: %d oggetti sono rimasti fuori dalla gerarchia di %s: %s.\n'
            'Sarebbero finiti nel GLB come nodi alla radice della scena, fuori '
            'da ogni nome del contratto.' % (len(fuori), radice_nome, ', '.join(fuori)))
    resta = [o.name for o in bpy.data.objects if o.type == 'CURVE']
    if resta:
        raise SystemExit('ERRORE: %s e\' ancora una CURVE dopo il montaggio.'
                         % ', '.join(resta))

    # --- LE NORMALI SI RICALCOLANO VERSO L'ESTERNO ---
    #
    # `collaudo-glb.mjs` dichiara di NON controllare il verso delle normali, e
    # spiega perche': controllarlo li' vorrebbe dire decodificare le mesh
    # compresse. Dice anche dove sta la difesa vera — «nel builder, che
    # ricalcola le normali verso l'esterno». Questo e' quel posto.
    # Il difetto e' gia' successo sulla sovrastruttura: una faccia al rovescio
    # sparisce per culling e si vede attraverso la nave, e a schermo sembra un
    # pezzo modellato male, non una normale girata.
    for o in bpy.data.objects:
        if o.type != 'MESH':
            continue
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.normals_make_consistent(inside=False)
        bpy.ops.object.mode_set(mode='OBJECT')

    for k, v in extras.items():
        radice[k] = v

    tri = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
    print('TRIANGOLI  %-14s %6d  (%d erano n-gon)' % (radice_nome, tri, ngon))
    for nodo in nodi:
        m = bpy.data.objects.get(nodo + '_MESH')
        if m:
            print('           %-18s %6d' % (nodo, len(m.data.polygons)))

    bpy.ops.object.select_all(action='SELECT')
    percorso = os.path.join(FUORI, nome_file)
    # Niente texture, quindi niente UV e niente tangenti: sarebbero attributi
    # per vertice senza nulla a cui appoggiarsi, cioe' peso puro. `gltfpack`
    # cancellerebbe comunque le UV, visto che nessun materiale usa una texture
    # — meglio non generarle che vederle sparire senza un avviso.
    bpy.ops.export_scene.gltf(filepath=percorso, export_format='GLB',
                              use_selection=True,
                              export_apply=False,
                              export_vertex_color='NONE',
                              export_texcoords=False,
                              export_tangents=False,
                              export_normals=True,
                              export_yup=True, export_extras=True)
    print('GLB  %-16s %7.1f KB' % (nome_file, os.path.getsize(percorso) / 1024))


def azzera():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.unit_settings.system = 'METRIC'
    pezzi_di.clear()
    materiali()


# ═════════════════════════════════════════════════════════════════════════
#  MACCHINA 1 — LA PROPULSIONE
# ═════════════════════════════════════════════════════════════════════════
def costruisci_propulsione():
    azzera()

    # ─── prop_motore ─────────────────────────────────────────────────────
    # Motore elettrico di propulsione, carcassa raffreddata ad aria. Sta a
    # +Y (prua) e con l'asse PIU' ALTO dell'albero: e' quello che giustifica
    # il riduttore ad assi paralleli.
    ym = 2.600
    z0 = MOT_DZ
    reg('prop_motore', cil(MOT_R, MOT_L, (0, ym, z0), 'vernice_motore', 32, 'Y'))
    # scudi di estremita' con le loro flange imbullonate
    for s, yy in ((1, ym + MOT_L / 2), (-1, ym - MOT_L / 2)):
        reg('prop_motore', cil(MOT_R * 0.98, 0.040, (0, yy + s * 0.020, z0),
                               'vernice_motore', 32, 'Y'))
        reg('prop_motore', cil(MOT_R * 0.62, 0.070, (0, yy + s * 0.070, z0),
                               'vernice_motore', 32, 'Y'))
        corona_bulloni('prop_motore', (0, yy + s * 0.042, z0), MOT_R * 0.86, 8,
                       asse='Y', r=0.010, h=0.020)
    # alette di raffreddamento: un motore chiuso le ha, ed e' cio' che lo fa
    # leggere come una macchina invece che come un cilindro verniciato
    for i in range(14):
        a = 2 * math.pi * i / 14
        reg('prop_motore', box((0.012, MOT_L * 0.88, 0.048),
                               ((MOT_R + 0.022) * math.cos(a), ym,
                                z0 + (MOT_R + 0.022) * math.sin(a)),
                               'vernice_motore', smusso=0.0015))
    # morsettiera, pressacavi e i tre cavi di potenza
    reg('prop_motore', box((0.340, 0.300, 0.200), (0, ym + 0.10, z0 + MOT_R + 0.10),
                           'vernice_motore'))
    corona_bulloni('prop_motore', (0, ym + 0.10, z0 + MOT_R + 0.205), 0.150, 4,
                   r=0.008, h=0.014)
    for i, dx in enumerate((-0.10, 0, 0.10)):
        reg('prop_motore', cil(0.026, 0.050, (dx, ym + 0.24, z0 + MOT_R + 0.14),
                               'ottone', 12, 'Y'))
        # ─── UN CAVO CHE FINISCE A MEZZ'ARIA E' PEGGIO DI NESSUN CAVO ───
        #
        # SINTOMO: nel primo provino i tre cavi di potenza uscivano dalla
        # morsettiera e salivano dritti verso l'alto, tre bastoncini color
        # rame sospesi nel vuoto. E l'ingombro di `prop_motore` misurava
        # 4,57 m su un motore da 1,50: erano i cavi a farlo.
        # CAUSA: erano stati instradati "verso il quadro" senza che ci fosse
        # un quadro, cioe' verso una destinazione immaginaria.
        # COME L'HO ISOLATA: dalla stampa dell'ingombro PER PEZZO in
        # `render-macchine.py`. Un motore che misura tre volte se stesso e' un
        # numero che si vede subito; guardando il provino si sarebbe dato la
        # colpa al colore del cavo.
        # Adesso scendono lungo la fiancata e corrono sul paramezzale, che e'
        # dove passano davvero: un cavo si vede dove POGGIA, non dove va.
        curva([(dx, ym + 0.27, z0 + MOT_R + 0.14),
               (dx * 1.4 + 0.34, ym + 0.44, z0 + MOT_R - 0.12),
               (0.395, ym + 0.60, -0.06),
               (0.395, ym + 0.68, -0.26)], 0.019, 'cavo', 'prop_motore')
    # golfare di sollevamento e targhetta dati
    reg('prop_motore', anello(0.052, 0.034, 0.018, (0, ym - 0.30, z0 + MOT_R + 0.05),
                              'acciaio', 20, 'Y'))
    targhetta('prop_motore', (0.010, 0.180, 0.120), (MOT_R + 0.030, ym - 0.42, z0 + 0.10))
    # piedi
    for sy in (-1, 1):
        for sx in (-1, 1):
            reg('prop_motore', box((0.090, 0.120, 0.180),
                                   (sx * (MOT_R - 0.02), ym + sy * 0.52, z0 - MOT_R - 0.06),
                                   'vernice_motore'))

    # ─── prop_riduttore ──────────────────────────────────────────────────
    yr = 1.420
    reg('prop_riduttore', box((RID_X, RID_Y, RID_Z), (0, yr, z0 / 2 - 0.030),
                              'vernice_riduttore', smusso=0.0035))
    # nervature: un getto le ha sempre, ed e' cio' che si legge come «pesante»
    for sx in (-1, 1):
        for dy in (-0.22, 0, 0.22):
            reg('prop_riduttore', box((0.020, 0.090, RID_Z * 0.80),
                                      (sx * (RID_X / 2 + 0.010), yr + dy, z0 / 2 - 0.030),
                                      'vernice_riduttore', smusso=0.0018))
    # linea di chiusura del carter, imbullonata: e' il pezzo che dice che si apre
    reg('prop_riduttore', box((RID_X + 0.040, RID_Y + 0.040, 0.024),
                              (0, yr, z0 / 2 + 0.010), 'vernice_riduttore', smusso=0.0018))
    for i in range(6):
        for sx in (-1, 1):
            reg('prop_riduttore', bullone((sx * (RID_X / 2 + 0.014),
                                           yr - RID_Y / 2 + 0.06 + i * (RID_Y - 0.12) / 5,
                                           z0 / 2 + 0.026), 0.008, 0.016))
    # coperchio d'ispezione: dice che qualcuno ci mette le mani
    reg('prop_riduttore', box((0.240, 0.240, 0.016), (0.12, yr - 0.14, z0 / 2 + 0.335),
                              'vernice_riduttore', smusso=0.0015))
    corona_bulloni('prop_riduttore', (0.12, yr - 0.14, z0 / 2 + 0.343), 0.100, 6,
                   r=0.007, h=0.012)
    # bocchettone dell'olio, astina di livello, tappo di scarico
    reg('prop_riduttore', cil(0.036, 0.070, (-0.16, yr + 0.20, z0 / 2 + 0.375),
                              'ottone', 16))
    reg('prop_riduttore', cil(0.014, 0.130, (-0.16, yr - 0.10, z0 / 2 + 0.400),
                              'inox', 10))
    reg('prop_riduttore', cil(0.026, 0.030, (0, yr, z0 / 2 - RID_Z / 2 - 0.012),
                              'ottone', 12))
    # scambiatore olio-acqua con le sue due manichette
    reg('prop_riduttore', cil(0.062, 0.360, (-(RID_X / 2 + 0.085), yr, z0 / 2 + 0.06),
                              'ottone', 20, 'Y'))
    for sy in (-1, 1):
        # anche le manichette dello scambiatore atterrano sul paramezzale
        curva([(-(RID_X / 2 + 0.085), yr + sy * 0.19, z0 / 2 + 0.06),
               (-(RID_X / 2 + 0.20), yr + sy * 0.30, z0 / 2 - 0.10),
               (-0.335, yr + sy * 0.40, -0.24)],
              0.017, 'tubo', 'prop_riduttore')
    # flangia d'entrata (verso il motore, quota alta) e d'uscita (quota albero)
    reg('prop_riduttore', cil(0.130, 0.060, (0, yr + RID_Y / 2 + 0.030, z0),
                              'vernice_riduttore', 28, 'Y'))
    reg('prop_riduttore', cil(0.150, 0.070, (0, yr - RID_Y / 2 - 0.035, 0),
                              'vernice_riduttore', 28, 'Y'))
    corona_bulloni('prop_riduttore', (0, yr - RID_Y / 2 - 0.035, 0), 0.118, 8,
                   asse='Y', r=0.008, h=0.016)
    targhetta('prop_riduttore', (0.008, 0.150, 0.100), (RID_X / 2 + 0.012, yr + 0.20, z0 / 2 + 0.14))

    # ─── prop_albero ── RUOTA. Asse Y di Blender = Z di glTF, x = z = 0 ───
    #
    # L'origine del nodo sta a (0,0,0): l'asse di rotazione passa esattamente
    # per l'origine, che e' l'unica condizione che impedisce il cono.
    lung = ALB_DA - ALB_A
    reg('prop_albero', cil(ALB_R, lung, (0, (ALB_DA + ALB_A) / 2, 0), 'albero', 32, 'Y'))
    # giunto flangiato all'uscita del riduttore
    reg('prop_albero', cil(0.170, 0.055, (0, ALB_DA - 0.028, 0), 'acciaio', 28, 'Y'))
    corona_bulloni('prop_albero', (0, ALB_DA - 0.028, 0), 0.128, 8, asse='Y',
                   r=0.010, h=0.070, materiale='inox')
    # manicotto e collare della reggispinta
    reg('prop_albero', cil(0.128, 0.200, (0, 0.560, 0), 'acciaio', 28, 'Y'))
    reg('prop_albero', cil(0.150, 0.030, (0, 0.660, 0), 'acciaio', 28, 'Y'))
    # anodo sacrificale sull'albero, con le due fascette: un tecnico lo cerca
    reg('prop_albero', anello(0.116, ALB_R, 0.130, (0, -2.950, 0), 'zinco', 24, 'Y'))
    for dy in (-0.055, 0.055):
        reg('prop_albero', anello(0.120, 0.114, 0.014, (0, -2.950 + dy, 0), 'inox', 24, 'Y'))
    # cono d'estremita' per il mozzo dell'elica
    reg('prop_albero', cono(ALB_R, ALB_R * 0.74, 0.230, (0, ALB_A + 0.115, 0),
                            'albero', 32, 'Y'))

    # ─── prop_astuccio ── il passaggio attraverso lo scafo ────────────────
    #
    # Origine del modello: la faccia interna dell'astuccio, sul piano del
    # fasciame, a y = 0. E' lo stesso criterio con cui `docs/14` §2.2 mette
    # l'origine dell'impianto «sul piano del fasciame»: una quota che si puo'
    # ritrovare sul disegno, non un punto scelto guardando lo schermo.
    reg('prop_astuccio', anello(AST_RE, AST_RI, AST_L, (0, -AST_L / 2, 0),
                                'bronzo', 40, 'Y'))
    # doppiatore: la lamiera si ispessisce dove e' forata, altrimenti si strappa
    reg('prop_astuccio', anello(0.290, AST_RE, 0.030, (0, -0.015, 0), 'acciaio', 40, 'Y'))
    corona_bulloni('prop_astuccio', (0, 0.002, 0), 0.240, 10, asse='Y', r=0.009, h=0.030)
    # tenuta meccanica (premistoppa) all'interno
    reg('prop_astuccio', anello(0.168, 0.098, 0.120, (0, 0.090, 0), 'bronzo', 32, 'Y'))
    reg('prop_astuccio', anello(0.140, 0.098, 0.070, (0, 0.185, 0), 'gomma', 32, 'Y'))
    reg('prop_astuccio', anello(0.128, 0.098, 0.026, (0, 0.232, 0), 'inox', 32, 'Y'))
    corona_bulloni('prop_astuccio', (0, 0.090, 0), 0.140, 6, asse='Y', r=0.008, h=0.130)
    # innesto dell'acqua di lubrificazione, con il suo tubo
    reg('prop_astuccio', cil(0.020, 0.060, (0.150, 0.090, 0.060), 'ottone', 12, 'X'))
    curva([(0.180, 0.090, 0.060), (0.300, 0.240, 0.020), (0.335, 0.430, -0.230)],
          0.014, 'tubo', 'prop_astuccio')
    # boccola autolubrificata all'estremita' poppiera
    reg('prop_astuccio', anello(AST_RE * 0.96, AST_RI, 0.150, (0, -AST_L + 0.075, 0),
                                'gomma', 32, 'Y'))

    # ─── prop_supporti ── ritto, paramezzali, antivibranti ────────────────
    # Il ritto dell'asse: mozzo con la boccola attorno all'albero e due gambe
    # che salgono al fasciame. Senza, l'albero e' un tubo che galleggia.
    ys = -2.400
    reg('prop_supporti', anello(0.155, 0.098, 0.300, (0, ys, 0), 'bronzo', 32, 'Y'))
    for sx in (-1, 1):
        reg('prop_supporti', box((0.034, 0.110, 0.640),
                                 (sx * 0.190, ys, 0.330), 'bronzo', smusso=0.0030))
        reg('prop_supporti', box((0.140, 0.140, 0.030),
                                 (sx * 0.300, ys, 0.640), 'acciaio'))
        corona_bulloni('prop_supporti', (sx * 0.300, ys, 0.652), 0.052, 4, r=0.008, h=0.014)
    # paramezzali: due travi longitudinali sotto la macchina
    for sx in (-1, 1):
        reg('prop_supporti', box((0.030, 2.900, 0.260),
                                 (sx * 0.330, 1.900, -0.310), 'vernice_base', smusso=0.0030))
        reg('prop_supporti', box((0.180, 2.900, 0.024),
                                 (sx * 0.330, 1.900, -0.430), 'vernice_base', smusso=0.0020))
    for dy in (0.60, 1.60, 2.60, 3.30):
        reg('prop_supporti', box((0.700, 0.024, 0.180), (0, dy, -0.330),
                                 'vernice_base', smusso=0.0020))
    # supporti antivibranti: quattro sotto il motore, quattro sotto il riduttore
    for sx in (-1, 1):
        for yy in (ym - 0.52, ym + 0.52):
            antivibrante('prop_supporti', (sx * (MOT_R - 0.02), yy, -0.215))
        for yy in (yr - 0.26, yr + 0.26):
            antivibrante('prop_supporti', (sx * 0.330, yy, -0.215), r=0.042, h=0.046)

    # ─── prop_scafo ── il fasciame forato ────────────────────────────────
    #
    # STA IN UN NODO SUO, e non e' un vezzo: `src/scena/impianto.js` nasconde
    # `STATIC_HULL_PLATE` perche' in scena lo scafo vero c'e' gia'. Se il
    # fasciame fosse dentro `prop_astuccio` il sito dovrebbe scegliere fra
    # perdere l'astuccio o mostrare due scafi sovrapposti.
    piastra = box((2.400, 0.026, 1.700), (0, -0.013, 0.100), 'carena', smusso=0.0030)
    foro = cil(AST_RE + 0.004, 0.200, (0, -0.013, 0), 'carena', 40, 'Y', smusso=0)
    m = piastra.modifiers.new('b', 'BOOLEAN')
    m.operation = 'DIFFERENCE'
    m.object = foro
    bpy.context.view_layer.objects.active = piastra
    bpy.ops.object.modifier_apply(modifier='b')
    bpy.data.objects.remove(foro, do_unlink=True)
    reg('prop_scafo', piastra)

    # ─── prop_elica ── RUOTA. Origine sul mozzo, sull'asse ───────────────
    costruisci_elica()

    NODI = ['prop_motore', 'prop_riduttore', 'prop_albero', 'prop_astuccio',
            'prop_supporti', 'prop_scafo', 'prop_elica']
    monta(
        'PROPULSIONE', NODI,
        # L'ELICA NON E' FIGLIA DELL'ALBERO, ED E' UNA DECISIONE.
        # Fisicamente lo sarebbe: sono calettate insieme. Ma il brief dice che
        # il sito ruotera' ENTRAMBI i nodi leggendo `giriPropulsione`, e se
        # l'elica fosse annidata sotto l'albero riceverebbe la rotazione due
        # volte: girerebbe al doppio dei giri dichiarati. Un difetto che non
        # da' errore e che si legge come «l'elica e' troppo veloce».
        gerarchia={},
        origini={'prop_elica': (0, ELICA_Y, 0)},
        extras={
            'assetRole': 'yacht-shaftline-electric-propulsion',
            'authoringUnit': 'meter',
            'sceneMetersPerUnit': 2.5,
            # glTF, non Blender: e' il riferimento in cui vive il sito
            'spinAxis': 'z',
            'spinNodes': 'prop_albero,prop_elica',
            'motorPowerKW': POTENZA_KW,
            'gearRatio': RAPPORTO,
            'shaftDiameterM': round(ALB_R * 2, 3),
            'propDiameterM': ELICA_D,
            'propBlades': ELICA_PALE,
            'propPitchRatio': ELICA_PASSO,
            'hullPlateNode': 'prop_scafo',
            'modelClaim': 'illustrative',
        },
        nome_file='propulsione.glb')


def costruisci_elica():
    """Elica a quattro pale, svergolata e con skew.

    Le pale non sono lastre piegate: ogni sezione sta sul cilindro del suo
    raggio, inclinata dell'angolo di passo phi(r) = atan(P / (2 pi r)). E' la
    formula, non un'approssimazione a occhio, e produce da sola la svergolatura
    che si riconosce come elica — molto piu' della forma del contorno.
    """
    R = ELICA_D / 2
    R0 = 0.170                     # raggio di attacco al mozzo
    P = ELICA_PASSO * ELICA_D      # passo, metri
    SEZ = 11
    # profilo di pala normalizzato sulla corda: dorso pieno, faccia quasi
    # piatta. E' un profilo di elica, non un'ala simmetrica.
    prof = [(-0.50, 0.000), (-0.34, 0.030), (-0.16, 0.044), (0.02, 0.045),
            (0.20, 0.038), (0.36, 0.024), (0.50, 0.000),
            (0.36, -0.006), (0.20, -0.010), (0.02, -0.012),
            (-0.16, -0.011), (-0.34, -0.007)]
    npf = len(prof)

    SKEW_PUNTA = math.radians(26.0)          # skew di poppa alla punta, tipico

    for pala in range(ELICA_PALE):
        # ─── LA PUNTA CADE SUGLI ASSI, ED E' UNA SCELTA DEL CANCELLO ─────
        #
        # Si sottrae lo skew di punta dall'angolo di base, cosi' a t = 1 la
        # pala e' tornata esattamente su 0, 90, 180, 270 gradi. Serve a poter
        # STRINGERE la verifica del diametro: `collaudo-glb.mjs` misura
        # l'ingombro, e l'ingombro coincide col diametro solo se una punta
        # guarda lungo un asse della scatola. Senza questa riga la misura
        # darebbe 1,49 m su un'elica da 1,60 (cos 26 gradi = 0,899), il
        # cancello andrebbe allargato al 10% e non vedrebbe piu' un errore
        # vero. Dove la si mette, la linea di riferimento della pala e'
        # convenzione: nessuna elica e' meno realistica per questo.
        # CHI TOGLIE QUESTA RIGA otterra' un rosso sul diametro: e' voluto.
        base = 2 * math.pi * pala / ELICA_PALE - SKEW_PUNTA
        vs, fs = [], []
        for i in range(SEZ):
            t = i / (SEZ - 1)
            r = R0 + t * (R - R0)
            # corda: massima verso il 55% del raggio, chiusa in punta
            corda = 0.46 * R * (0.58 + 0.85 * math.sin(math.pi * (0.15 + 0.80 * t)))
            corda *= (1.0 - 0.55 * t ** 3)
            phi = math.atan2(P, 2 * math.pi * r)
            skew = SKEW_PUNTA * t ** 1.8
            rake = 0.10 * R * t ** 1.4                # rake all'indietro
            th = base + skew
            # versori: radiale, tangenziale, assiale (asse = Y di Blender)
            rx, rz = math.cos(th), math.sin(th)
            tx, tz = -math.sin(th), math.cos(th)
            for (pu, pv) in prof:
                u = pu * corda
                v = pv * corda
                # la corda giace nel piano tangente, inclinata di phi
                ct = u * math.cos(phi) - v * math.sin(phi)
                ca = u * math.sin(phi) + v * math.cos(phi) - rake
                vs.append((r * rx + ct * tx, ELICA_Y + ca, r * rz + ct * tz))
        for i in range(SEZ - 1):
            for k in range(npf):
                j = (k + 1) % npf
                fs.append([i * npf + k, i * npf + j, (i + 1) * npf + j, (i + 1) * npf + k])
        fs.append(list(range(npf))[::-1])
        fs.append([(SEZ - 1) * npf + k for k in range(npf)])
        me = bpy.data.meshes.new('pala')
        me.from_pydata(vs, [], fs)
        me.update()
        o = bpy.data.objects.new('pala', me)
        bpy.context.collection.objects.link(o)
        o.data.materials.append(MAT['bronzo'])
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True)
        bpy.ops.object.shade_smooth()
        smussa(o, 0.0030, 2)
        reg('prop_elica', o)

    # mozzo: tronco di cono, come sono davvero
    reg('prop_elica', cono(0.185, 0.150, 0.420, (0, ELICA_Y, 0), 'bronzo', 40, 'Y'))
    # ogiva di estremita' e anodo del mozzo
    reg('prop_elica', cono(0.150, 0.030, 0.180, (0, ELICA_Y - 0.300, 0), 'bronzo', 32, 'Y'))
    reg('prop_elica', cil(0.052, 0.040, (0, ELICA_Y - 0.405, 0), 'zinco', 20, 'Y'))
    # dado dell'elica con la sua copiglia
    reg('prop_elica', cil(0.110, 0.080, (0, ELICA_Y + 0.240, 0), 'bronzo', 6, 'Y'))


# ═════════════════════════════════════════════════════════════════════════
#  MACCHINA 2 — IL GIROSCOPIO
# ═════════════════════════════════════════════════════════════════════════
def costruisci_giroscopio():
    azzera()

    # ─── gyro_rotore ── RUOTA attorno alla verticale (Z Blender = Y glTF) ──
    #
    # In un giroscopio antirollio il volano gira attorno alla VERTICALE e
    # precede attorno all'asse trasversale: e' la coppia di precessione che
    # raddrizza la barca. Metterlo orizzontale sarebbe un errore che un
    # tecnico riconosce a colpo d'occhio.
    #
    # Il centro sta a (0, 0, ROT_Z): l'asse verticale passa per x = y = 0, e
    # l'origine del nodo e' proprio li'. Nessun cono possibile per costruzione.
    reg('gyro_rotore', anello(ROT_R, ROT_R - 0.075, ROT_H, (0, 0, ROT_Z), 'acciaio', 48))
    reg('gyro_rotore', cil(ROT_R - 0.072, 0.048, (0, 0, ROT_Z), 'acciaio', 48))
    # razze: alleggeriscono il disco e sono cio' che rende VISIBILE la rotazione.
    # Un volano pieno che gira e' indistinguibile da un volano fermo.
    for i in range(8):
        a = 2 * math.pi * i / 8
        razza = box((0.052, ROT_R - 0.14, 0.090),
                    ((ROT_R * 0.52) * math.cos(a), (ROT_R * 0.52) * math.sin(a), ROT_Z),
                    'acciaio', smusso=0.0025)
        razza.rotation_euler = (0, 0, a)
        bpy.context.view_layer.objects.active = razza
        bpy.ops.object.select_all(action='DESELECT')
        razza.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
        reg('gyro_rotore', razza)
    # mozzo e albero del rotore, con i due cuscinetti
    reg('gyro_rotore', cil(0.105, 0.230, (0, 0, ROT_Z), 'acciaio', 32))
    reg('gyro_rotore', cil(0.052, 0.900, (0, 0, ROT_Z), 'inox', 24))
    for dz in (-0.400, 0.400):
        reg('gyro_rotore', anello(0.088, 0.052, 0.070, (0, 0, ROT_Z + dz), 'inox', 28))

    # ─── gyro_sfera ── la meta' inferiore, fissa e sigillata ─────────────
    calotta(inferiore=True, nodo='gyro_sfera')
    # flangia equatoriale: e' la riga che dice «questo si apre e si richiude»
    reg('gyro_sfera', anello(SFERA_R + 0.055, SFERA_R - SFERA_SP, 0.030, (0, 0, ROT_Z),
                             'vernice_gyro', 48))
    corona_bulloni('gyro_sfera', (0, 0, ROT_Z + 0.016), SFERA_R + 0.028, 24,
                   r=0.010, h=0.038)
    # attacco del vuoto, sensore di pressione, targhetta
    reg('gyro_sfera', cil(0.032, 0.090, (SFERA_R * 0.62, -SFERA_R * 0.55, ROT_Z - 0.24),
                          'inox', 14))
    reg('gyro_sfera', cil(0.044, 0.070, (-SFERA_R * 0.60, -SFERA_R * 0.50, ROT_Z - 0.22),
                          'ottone', 16))
    targhetta('gyro_sfera', (0.140, 0.008, 0.090), (0, -SFERA_R - 0.010, ROT_Z - 0.18))
    # serpentina di raffreddamento con i due innesti
    for sx in (-1, 1):
        reg('gyro_sfera', cil(0.026, 0.080, (sx * 0.230, -SFERA_R * 0.80, ROT_Z - 0.34),
                              'ottone', 12, 'Y'))
        curva([(sx * 0.230, -SFERA_R * 0.80 - 0.04, ROT_Z - 0.34),
               (sx * 0.420, -SFERA_R - 0.22, ROT_Z - 0.50),
               (sx * 0.520, -SFERA_R - 0.30, ROT_Z - 0.78)],
              0.018, 'tubo', 'gyro_sfera')

    # ─── gyro_calotta ── la meta' superiore, che il sito puo' togliere ────
    #
    # «Contenitore sigillato» e «si vede il rotore girare» non stanno insieme
    # se il guscio e' un pezzo solo. L'impianto ha gia' risolto lo stesso
    # problema con HOUSING_FIXED / HOUSING_REMOVABLE: qui si fa uguale, e la
    # calotta e' un ANELLO con 14 mm di parete, non una pelle — tolta, si vede
    # lo spessore del taglio e non il rovescio di una superficie.
    calotta(inferiore=False, nodo='gyro_calotta')
    reg('gyro_calotta', anello(SFERA_R + 0.055, SFERA_R - SFERA_SP, 0.028,
                               (0, 0, ROT_Z + 0.029), 'vernice_gyro', 48))
    reg('gyro_calotta', anello(0.070, 0.040, 0.060, (0, 0, ROT_Z + SFERA_R + 0.020),
                               'acciaio', 20))

    # ─── gyro_cardano ── precede attorno all'asse trasversale (X) ─────────
    #
    # Origine a (0, 0, ROT_Z): l'asse dei perni e' la retta y = 0, z = ROT_Z
    # parallela a X, e passa per l'origine del nodo. La sfera, la calotta e il
    # rotore sono SUOI FIGLI, quindi la precessione se li porta dietro senza
    # che il sito debba muoverli uno per uno.
    for sx in (-1, 1):
        # perno, cappello del cuscinetto e la sua bulloneria
        reg('gyro_cardano', cil(0.062, 0.180, (sx * (SFERA_R + 0.115), 0, ROT_Z),
                                'inox', 24, 'X'))
        reg('gyro_cardano', cil(0.115, 0.090, (sx * (SFERA_R + 0.055), 0, ROT_Z),
                                'acciaio', 28, 'X'))
        # braccio che lega il perno al guscio
        reg('gyro_cardano', box((0.150, 0.130, 0.075),
                                (sx * (SFERA_R * 0.72), 0, ROT_Z), 'vernice_gyro'))
        corona_bulloni('gyro_cardano', (sx * (SFERA_R + 0.010), 0, ROT_Z), 0.088, 6,
                       asse='X', r=0.008, h=0.020)
    # freno di precessione: due cilindri idraulici fra la culla e il basamento.
    # Sono la ragione per cui il giroscopio smorza invece di oscillare, e senza
    # di loro la macchina non si spiega.
    for sx in (-1, 1):
        reg('gyro_cardano', cil(0.046, 0.240, (sx * 0.400, 0.330, ROT_Z - 0.20),
                                'inox', 20, 'Y'))
        reg('gyro_cardano', cil(0.022, 0.170, (sx * 0.400, 0.480, ROT_Z - 0.20),
                                'inox', 16, 'Y'))

    # ─── gyro_basamento ── i ritti, il telaio e gli antivibranti ──────────
    for sx in (-1, 1):
        reg('gyro_basamento', box((0.110, 0.230, ROT_Z - 0.010),
                                  (sx * (SFERA_R + 0.055), 0, (ROT_Z - 0.010) / 2),
                                  'vernice_base', smusso=0.0035))
        # nervatura di rinforzo del ritto
        reg('gyro_basamento', box((0.026, 0.090, ROT_Z * 0.70),
                                  (sx * (SFERA_R + 0.055), 0.150, ROT_Z * 0.35),
                                  'vernice_base', smusso=0.0025))
    # ─── TELAIO DI BASE: DUE TRAVERSE E DUE LONGHERONI, CHE SI INCASTRANO ─
    #
    # SINTOMO: nel provino i quattro angoli del telaio erano BLOCCHI NERI, e
    # solo gli angoli. Il resto della trave era grigio chiaro come doveva.
    # CAUSA: traverse e longheroni erano entrambi alti 0,110 e appoggiati a
    # z = 0, quindi negli incroci le facce superiori e inferiori delle due
    # travi erano COMPLANARI. Due facce esattamente alla stessa quota si
    # contendono lo z-buffer: quale delle due vince dipende dall'errore di
    # arrotondamento, cambia da pixel a pixel, e il risultato e' una macchia.
    # COME L'HO ISOLATA: dalla forma del difetto. Era nero SOLO nei quattro
    # incroci — e le uniche facce condivise da due pezzi stanno li'. Se fosse
    # stata luce, o materiale, sarebbe stato nero anche altrove.
    # La cura non e' spostare le travi di un millimetro (nasconde il difetto e
    # lo fa tornare al primo che ritocca una quota): i longheroni si accorciano
    # e ENTRANO nelle traverse. Nessuna faccia in comune, per costruzione.
    for sy in (-1, 1):
        reg('gyro_basamento', box((BASE_X, 0.090, 0.110), (0, sy * (BASE_Y / 2 - 0.045), 0.055),
                                  'vernice_base', smusso=0.0030))
    for sx in (-1, 1):
        reg('gyro_basamento', box((0.090, BASE_Y - 0.160, 0.110),
                                  (sx * (BASE_X / 2 - 0.045), 0, 0.055),
                                  'vernice_base', smusso=0.0030))
    # ancoraggio dei cilindri di freno
    for sx in (-1, 1):
        reg('gyro_basamento', box((0.090, 0.070, 0.140), (sx * 0.400, 0.620, ROT_Z - 0.24),
                                  'vernice_base'))
    # supporti antivibranti alle quattro cantonate
    for sx in (-1, 1):
        for sy in (-1, 1):
            antivibrante('gyro_basamento',
                         (sx * (BASE_X / 2 - 0.075), sy * (BASE_Y / 2 - 0.075), -0.030),
                         r=0.058, h=0.062)
    # quadro di comando, pressacavi e cavi ordinati
    reg('gyro_basamento', box((0.280, 0.160, 0.360), (0, BASE_Y / 2 + 0.010, 0.290),
                              'vernice_base'))
    corona_bulloni('gyro_basamento', (0, BASE_Y / 2 + 0.092, 0.290), 0.110, 4,
                   asse='Y', r=0.007, h=0.012)
    targhetta('gyro_basamento', (0.120, 0.006, 0.080), (0, BASE_Y / 2 + 0.094, 0.380))
    for dx in (-0.075, 0, 0.075):
        reg('gyro_basamento', cil(0.020, 0.045, (dx, BASE_Y / 2 + 0.010, 0.098),
                                  'ottone', 12))
        curva([(dx, BASE_Y / 2 + 0.010, 0.086),
               (dx * 1.4, BASE_Y / 2 + 0.120, -0.010),
               (dx * 1.8, BASE_Y / 2 + 0.400, -0.040)], 0.016, 'cavo', 'gyro_basamento')

    NODI = ['gyro_rotore', 'gyro_sfera', 'gyro_calotta', 'gyro_cardano', 'gyro_basamento']
    monta(
        'GIROSCOPIO', NODI,
        gerarchia={'gyro_sfera': 'gyro_cardano',
                   'gyro_calotta': 'gyro_cardano',
                   'gyro_rotore': 'gyro_cardano'},
        origini={'gyro_rotore': (0, 0, ROT_Z),
                 'gyro_cardano': (0, 0, ROT_Z),
                 'gyro_sfera': (0, 0, ROT_Z),
                 'gyro_calotta': (0, 0, ROT_Z)},
        extras={
            'assetRole': 'yacht-gyro-roll-stabiliser',
            'authoringUnit': 'meter',
            'sceneMetersPerUnit': 2.5,
            'spinAxis': 'y',              # glTF: la verticale
            'spinNodes': 'gyro_rotore',
            'precessAxis': 'x',           # glTF: il trasversale
            'precessNode': 'gyro_cardano',
            'removableNode': 'gyro_calotta',
            'rotorDiameterM': round(ROT_R * 2, 3),
            'rotorRpm': ROT_GIRI,
            'modelClaim': 'illustrative',
        },
        nome_file='giroscopio.glb')


def calotta(inferiore, nodo):
    """Mezza sfera con spessore vero, ottenuta per rivoluzione di un arco
    CHIUSO — non con una UV-sphere svuotata da un booleano.

    La ragione e' misurabile: un booleano fra due sfere da 48x24 lascia una
    linea di intersezione con centinaia di vertici in piu' e triangoli lunghi e
    sottili proprio sul bordo, che e' il posto dove lo smusso poi si comporta
    peggio. Un arco chiuso ruotato da' una maglia regolare e costa meno della
    meta' dei triangoli.
    """
    SEG_A = 14          # passi lungo l'arco
    SEG_R = 40          # passi attorno all'asse
    re, ri = SFERA_R, SFERA_R - SFERA_SP
    a0, a1 = (math.pi / 2, math.pi) if inferiore else (0.0, math.pi / 2)
    # sezione: esterno dal polo all'equatore, poi rientro sull'interno
    sez = []
    for i in range(SEG_A + 1):
        a = a0 + (a1 - a0) * i / SEG_A
        sez.append((re * math.sin(a), re * math.cos(a)))
    for i in range(SEG_A + 1):
        a = a1 + (a0 - a1) * i / SEG_A
        sez.append((ri * math.sin(a), ri * math.cos(a)))
    n = len(sez)
    vs, fs = [], []
    for j in range(SEG_R):
        th = 2 * math.pi * j / SEG_R
        c, s = math.cos(th), math.sin(th)
        for (rr, zz) in sez:
            vs.append((rr * c, rr * s, ROT_Z + zz))
    for j in range(SEG_R):
        jn = (j + 1) % SEG_R
        for k in range(n):
            kn = (k + 1) % n
            fs.append([j * n + k, jn * n + k, jn * n + kn, j * n + kn])
    me = bpy.data.meshes.new('calotta')
    me.from_pydata(vs, [], fs)
    me.update()
    o = bpy.data.objects.new('calotta', me)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(MAT['vernice_gyro'])
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.shade_smooth()
    # ─── I POLI VANNO FUSI, O LO SMUSSO CI SI ROMPE SOPRA ────────────────
    #
    # SINTOMO: sulla cima della calotta lo smusso produce una rosetta di
    # triangoli neri, e l'ombreggiatura liscia ci gira attorno male.
    # CAUSA: la sezione ruotata tocca l'asse ai poli. Li' `rr` vale 0, quindi
    # i SEG_R vertici del giro sono lo STESSO punto ripetuto quaranta volte, e
    # le facce che li usano hanno area nulla. Una faccia ad area nulla non e'
    # un errore per Blender — non ha normale, e chi la legge se ne inventa una.
    # COME L'HO ISOLATA: contando i vertici prima e dopo la fusione. Se ai poli
    # non ci fossero duplicati il numero resterebbe identico; qui cala di
    # 2 x (SEG_R - 1) esatti, che e' la firma del difetto.
    prima = len(o.data.vertices)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=1e-5)
    bpy.ops.object.mode_set(mode='OBJECT')
    print('CALOTTA %-14s %d vertici -> %d (poli fusi)'
          % (nodo, prima, len(o.data.vertices)))
    smussa(o, 0.0025, 2)
    return reg(nodo, o)


# ═════════════════════════════════════════════════════════════════════════
if QUALE in ('propulsione', 'entrambe'):
    costruisci_propulsione()
if QUALE in ('giroscopio', 'entrambe'):
    costruisci_giroscopio()
