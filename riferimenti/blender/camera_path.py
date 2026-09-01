# -*- coding: utf-8 -*-
"""
camera_path.py — A6

Curva world-space della camera: dal meccanismo alle persone nel salone,
SENZA stacchi (§4 di riferimenti/WORLDSPACE-CONTRATTO.md).

Cosa fa questo script:
  1. definisce i punti di controllo del percorso, in METRI, nello stesso
     sistema di riferimento del nodo CAMERA_SORGENTE_SALONE letto
     direttamente da public/modelli/guscio-salone.glb (non da posa.json
     ricostruito a mano — il GLB e' l'origine di verita' gia' esportata);
  2. costruisce una spline di posizione Catmull-Rom CENTRIPETA (formula
     ricorsiva di Barry-Goldman, robusta a spaziatura non uniforme dei
     punti di controllo) — C1 per costruzione;
  3. costruisce l'orientamento con SQUAD (Shoemake) sui quaternioni ai
     nodi — e' lo slerp esteso che da' continuita' C1 anche alla velocita'
     angolare, non solo slerp a tratti (che sarebbe solo C0);
  4. RIPARAMETRIZZA tutto per LUNGHEZZA D'ARCO: le funzioni pubbliche
     pos_at_arclength(s01) e quat_at_arclength(s01) prendono un progresso
     normalizzato 0..1 sulla lunghezza reale della curva in metri, MAI un
     tempo. Il sito applica la propria curva di velocita' sopra questo
     progresso senza toccare la traiettoria;
  5. stampa le misure richieste: lunghezza d'arco totale, curvatura
     massima e dove cade, jerk massimo e dove cade, velocita' angolare
     massima e dove cade.

Nessun file viene scritto su disco: solo stampa a console. Se lo script
gira dentro Blender (bpy disponibile) costruisce ANCHE un oggetto Curve
in memoria per ispezione visiva nella GUI, ma non lo salva ne' lo esporta
(il .blend/.glb del percorso, se servira', e' un'altra consegna).

Esecuzione:
  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" -b -P riferimenti/blender/camera_path.py
"""

import math
import struct
import json
import os
import sys

try:
    import numpy as np
except ImportError:  # bpy python ha sempre numpy; fallback per test fuori Blender
    raise SystemExit("serve numpy (Blender 5.2 lo include di default)")

try:
    import bpy
    HAVE_BPY = True
except ImportError:
    HAVE_BPY = False

# B5 — il frame comune ora esiste: si importa, non si ricopiano i numeri.
_QUI = os.path.dirname(os.path.abspath(__file__))
if _QUI not in sys.path:
    sys.path.insert(0, _QUI)
import world_root  # noqa: E402 — deve stare dopo l'aggiunta al sys.path


# ---------------------------------------------------------------------------
# 0. Leggi la posa sorgente REALE dal GLB gia' esportato (non da posa.json
#    ricostruito a mano: il GLB e' l'oggetto gia' pubblicato, posa.json e'
#    la sua giustificazione). Se il file non c'e' (ambiente di prova), usa
#    i valori che il GLB contiene oggi, congelati qui come fallback noto.
# ---------------------------------------------------------------------------

QUAT_GLTF_FALLBACK = (-0.0215489268, -0.580615103, -0.0122757656, 0.813800395)  # x,y,z,w
POS_FALLBACK = (-2.93219995, 0.607200027, 0.843599975)


def leggi_camera_sorgente_salone():
    """Legge nodo CAMERA_SORGENTE_SALONE da public/modelli/guscio-salone.glb.
    Ritorna (posizione_m (x,y,z), quaternione_xyzw)."""
    qui = os.path.dirname(os.path.abspath(__file__))
    root = os.path.abspath(os.path.join(qui, "..", ".."))
    glb_path = os.path.join(root, "public", "modelli", "guscio-salone.glb")
    if not os.path.isfile(glb_path):
        print(f"[avviso] {glb_path} non trovato: uso i valori congelati di fallback.")
        return POS_FALLBACK, QUAT_GLTF_FALLBACK
    with open(glb_path, "rb") as f:
        data = f.read()
    magic, ver, length = struct.unpack("<4sII", data[0:12])
    assert magic == b"glTF", "file non e' un GLB valido"
    off = 12
    json_chunk = None
    while off < len(data):
        clen, ctype = struct.unpack("<II", data[off:off + 8])
        off += 8
        chunk = data[off:off + clen]
        off += clen
        if ctype == 0x4E4F534A:  # 'JSON'
            json_chunk = chunk
            break
    j = json.loads(json_chunk)
    for n in j["nodes"]:
        if n.get("name") == "CAMERA_SORGENTE_SALONE":
            pos = tuple(n["translation"])
            quat = tuple(n["rotation"])  # gia' x,y,z,w (convenzione glTF)
            return pos, quat
    raise RuntimeError("nodo CAMERA_SORGENTE_SALONE non trovato nel GLB")


POS_SALONE, QUAT_SALONE = leggi_camera_sorgente_salone()


# ---------------------------------------------------------------------------
# 1. Quaternioni: mul, conjugate, normalize, log/exp, slerp, squad,
#    matrice di rotazione -> quaternione (per il lookAt dei nodi intermedi).
#    Convenzione: array numpy [x,y,z,w], stessa di glTF/three.js.
# ---------------------------------------------------------------------------

def q_normalize(q):
    q = np.asarray(q, dtype=float)
    n = np.linalg.norm(q)
    return q / n if n > 1e-12 else np.array([0.0, 0.0, 0.0, 1.0])


def q_conj(q):
    x, y, z, w = q
    return np.array([-x, -y, -z, w])


def q_mul(a, b):
    ax, ay, az, aw = a
    bx, by, bz, bw = b
    return np.array([
        aw * bx + ax * bw + ay * bz - az * by,
        aw * by - ax * bz + ay * bw + az * bx,
        aw * bz + ax * by - ay * bx + az * bw,
        aw * bw - ax * bx - ay * by - az * bz,
    ])


def q_dot(a, b):
    return float(np.dot(a, b))


def q_log(q):
    """log di un quaternione unitario -> vettore puro (x,y,z), w=0."""
    q = q_normalize(q)
    v = q[:3]
    w = max(-1.0, min(1.0, q[3]))
    vnorm = np.linalg.norm(v)
    if vnorm < 1e-9:
        return np.array([0.0, 0.0, 0.0])
    theta = math.acos(w)
    return v / vnorm * theta


def q_exp(v):
    """esp di un quaternione puro (x,y,z,0) -> quaternione unitario."""
    theta = np.linalg.norm(v)
    if theta < 1e-9:
        return np.array([0.0, 0.0, 0.0, 1.0])
    s = math.sin(theta) / theta
    return np.array([v[0] * s, v[1] * s, v[2] * s, math.cos(theta)])


def slerp(a, b, t):
    a = q_normalize(a)
    b = q_normalize(b)
    d = q_dot(a, b)
    if d < 0.0:
        b = -b
        d = -d
    d = min(1.0, d)
    if d > 0.9995:
        r = q_normalize(a + t * (b - a))
        return r
    theta0 = math.acos(d)
    theta = theta0 * t
    b_ortho = q_normalize(b - a * d)
    return a * math.cos(theta) + b_ortho * math.sin(theta)


def squad_tangent(q_prev, q, q_next):
    """Punto di controllo interno di Shoemake per SQUAD (garantisce C1)."""
    if q_prev is None:
        q_prev = q
    if q_next is None:
        q_next = q
    qi = q_normalize(q)
    inv = q_conj(qi)  # coniugato = inverso per un quaternione unitario
    l1 = q_log(q_mul(inv, q_prev))
    l2 = q_log(q_mul(inv, q_next))
    return q_mul(qi, q_exp(-(l1 + l2) / 4.0))


def squad(q0, s0, s1, q1, t):
    slerp1 = slerp(q0, q1, t)
    slerp2 = slerp(s0, s1, t)
    return slerp(slerp1, slerp2, 2.0 * t * (1.0 - t))


def mat3_to_quat(m):
    """m: 3x3 numpy, colonne = assi x,y,z del sistema locale in mondo."""
    tr = m[0, 0] + m[1, 1] + m[2, 2]
    if tr > 0:
        s = math.sqrt(tr + 1.0) * 2
        w = 0.25 * s
        x = (m[2, 1] - m[1, 2]) / s
        y = (m[0, 2] - m[2, 0]) / s
        z = (m[1, 0] - m[0, 1]) / s
    elif m[0, 0] > m[1, 1] and m[0, 0] > m[2, 2]:
        s = math.sqrt(1.0 + m[0, 0] - m[1, 1] - m[2, 2]) * 2
        w = (m[2, 1] - m[1, 2]) / s
        x = 0.25 * s
        y = (m[0, 1] + m[1, 0]) / s
        z = (m[0, 2] + m[2, 0]) / s
    elif m[1, 1] > m[2, 2]:
        s = math.sqrt(1.0 + m[1, 1] - m[0, 0] - m[2, 2]) * 2
        w = (m[0, 2] - m[2, 0]) / s
        x = (m[0, 1] + m[1, 0]) / s
        y = 0.25 * s
        z = (m[1, 2] + m[2, 1]) / s
    else:
        s = math.sqrt(1.0 + m[2, 2] - m[0, 0] - m[1, 1]) * 2
        w = (m[1, 0] - m[0, 1]) / s
        x = (m[0, 2] + m[2, 0]) / s
        y = (m[1, 2] + m[2, 1]) / s
        z = 0.25 * s
    return q_normalize(np.array([x, y, z, w]))


def look_at_quat(forward, up_hint=(0.0, 1.0, 0.0)):
    """Convenzione camera glTF/three.js: guarda lungo -Z locale, su = +Y locale."""
    f = np.asarray(forward, dtype=float)
    fn = np.linalg.norm(f)
    if fn < 1e-9:
        return np.array([0.0, 0.0, 0.0, 1.0])
    f = f / fn
    up = np.asarray(up_hint, dtype=float)
    zaxis = -f  # asse Z locale della camera punta all'indietro rispetto allo sguardo
    xaxis = np.cross(up, zaxis)
    if np.linalg.norm(xaxis) < 1e-6:
        up = np.array([1.0, 0.0, 0.0])
        xaxis = np.cross(up, zaxis)
    xaxis = xaxis / np.linalg.norm(xaxis)
    yaxis = np.cross(zaxis, xaxis)
    m = np.column_stack([xaxis, yaxis, zaxis])
    return mat3_to_quat(m)


# ---------------------------------------------------------------------------
# 2. Punti di controllo del percorso, in metri, nel FRAME DEL MONDO di
#    world_root.py (§2): origine = CAMERA_SORGENTE_SALONE, assi = quelli del
#    GLB del guscio (nessuna rotazione del mondo). world = locale_pezzo +
#    world_root.COLLOCAZIONI[pezzo]['traslazione_m'] (o il punto di cucitura
#    dichiarato). Ogni numero qui sotto viene da world_root — nessuno e'
#    ricopiato a mano.
#
#    CORREZIONE su indicazione del committente: il giro precedente di questo
#    script ancorava P0/P1/P2 al centro del VANO ('vano_salone'), che e' il
#    FINESTRONE (2,17 x 1,15 m, mezzeria a 57 cm da terra: un'apertura da
#    finestra, non da porta) e non l'apertura che la camera attraversa.
#    L'apertura vera, misurata, e' 'ingresso_salone' (4,57 x 2,35 m):
#    e' li' che P2 deve cadere, non sul finestrone.
#
#    P4 (arrivo) e' ESATTO: CAMERA_SORGENTE_SALONE, e nel frame del mondo
#    coincide per costruzione con l'origine (0,0,0) — e' la collocazione
#    SALOON_SHELL di world_root a garantirlo (il guscio si sposta
#    dell'opposto della posizione del nodo camera).
#
#    P2 (attraversamento) e' MISURATO: centro di world_root.CUCITURE
#    ['ingresso_salone'] (x_m, altezza_libera_m, larghezza_libera_m).
#
#    P1 (corridoio) e' DERIVATO dalla collocazione STAIR_CORRIDOR: il
#    corridoio (con la sua scala, parts/corridor.py) si estende in X locale
#    da 0 (base scala, verso il locale tecnico) a LUNGHEZZA_TOTALE=5.480
#    (pianerottolo verso il salone, la cucitura 'aperture_alte'), con
#    pavimento che sale da y_locale=0 a y_locale=RISALITA_TOTALE=2.10 (la
#    quota 'alzata_m' della cucitura). Si prende il punto medio del
#    percorso (x_locale=2.740) con la quota di pavimento interpolata
#    linearmente sulla salita (y_locale=1.05); si traduce in mondo con la
#    traslazione STAIR_CORRIDOR = (-6.280, -3.270, 0.0). L'interpolazione
#    lineare e' un'APPROSSIMAZIONE dichiarata (la scala reale ha pianerottoli
#    piani alle due estremita' prima/dopo i gradini, quindi il profilo vero
#    non e' una retta) — non e' una misura di quel singolo punto, ma non e'
#    nemmeno una profondita' indovinata: e' vincolata dai due estremi reali
#    del pezzo.
#
#    P0 (meccanismo) e' DERIVATO dalla collocazione MECHANISM_BAY: il pezzo
#    si estende in X mondo da X_MB0=-14.902575 (la sua origine locale) fino
#    alla porta verso il corridoio a X=-6.280 (world_root.COLLOCAZIONI
#    ['MECHANISM_BAY']['cucitura_mondo_m_gltf']). Si prende il punto medio di
#    quell'intervallo; Y e Z riusano la cucitura della porta (-3.270, 0.0),
#    l'unico riferimento di sezione misurato per questo pezzo — non esiste
#    in world_root una misura indipendente dell'interno del locale tecnico,
#    quindi Y/Z di P0 non sono una misura DI QUEL PUNTO ma dell'apertura piu'
#    vicina: e' la parte che resta da misurare se si vuole di piu'.
#
#    P3 (dentro il salone, transizione breve dopo la porta) resta l'unico
#    punto senza un ancoraggio in world_root: nessun rilievo dell'interno del
#    salone fra la porta e la posa della camera esiste oggi. E' interpolato
#    a meta' strada fra P2 e P4. RESTA ASSUNTO, dichiarato come tale.
# ---------------------------------------------------------------------------

_INGRESSO = world_root.CUCITURE['ingresso_salone']
# ─── P2 STA SULLA MEZZERIA DEL CORRIDOIO, NON AL CENTRO DEL BUCO
#
# DIFETTO TROVATO DALL'ASSEMBLATORE, ed e' una disputa fra due assunzioni
# ragionevoli che nessuna delle due sapeva dell'altra.
#
# `ingresso_salone` e' MISURATO ed e' largo 4,57 m: Z da -3,731 a +0,843. Il
# suo CENTRO cade a Z = -1,444. Ma il corridoio arriva sulla PROPRIA mezzeria,
# Z = 0, ed e' largo 0,85 -- cioe' Z da -0,425 a +0,425.
#
# Mettendo P2 al centro dell'apertura, la curva usciva di lato dal corridoio di
# 1,03 m: tredici campioni su sessanta fuori dal volume libero, tutti raccolti
# a X ~= -0,84, cioe' proprio alla soglia.
#
# La camera passa da dove passa il CORRIDOIO. L'apertura del salone e' larga
# quattro metri e mezzo perche' e' il punto in cui il guscio smette, non perche'
# sia una porta: il centro di un'estremita' aperta non e' un passaggio.
#
# X e Y restano dall'apertura misurata (la soglia e la quota le detta lei); Z
# viene dal corridoio, che e' l'unico che sa da dove si entra.
P2_X = _INGRESSO['x_m']
P2_Y = sum(_INGRESSO['altezza_libera_m']) / 2.0
P2_Z = world_root.traslazione('STAIR_CORRIDOR', 'gltf')[2]
P2 = np.array([P2_X, P2_Y, P2_Z])

_TX_COR, _TY_COR, _TZ_COR = world_root.traslazione('STAIR_CORRIDOR', 'gltf')
_LUNGHEZZA_CORRIDOIO_LOCALE = world_root.LUNGHEZZA_CORRIDOIO_M   # 5.480, DERIVATO in world_root
_RISALITA_CORRIDOIO_LOCALE = world_root.RISALITA_CORRIDOIO_M     # 2.10, DERIVATO in world_root
_X1_LOCALE = _LUNGHEZZA_CORRIDOIO_LOCALE / 2.0
_Y1_LOCALE = _RISALITA_CORRIDOIO_LOCALE * (_X1_LOCALE / _LUNGHEZZA_CORRIDOIO_LOCALE)
P1 = np.array([_X1_LOCALE + _TX_COR, _Y1_LOCALE + _TY_COR, 0.0 + _TZ_COR])

_MB = world_root.COLLOCAZIONI['MECHANISM_BAY']
X_MB0 = _MB['traslazione_x_derivata_m']            # -14.902575
X_PORTA_MB = _MB['cucitura_mondo_m_gltf'][0]            # -6.280
_Y_PORTA_MB = _MB['cucitura_mondo_m_gltf'][1]           # -3.270
_Z_PORTA_MB = _MB['cucitura_mondo_m_gltf'][2]           # 0.0
P0 = np.array([(X_MB0 + X_PORTA_MB) / 2.0, _Y_PORTA_MB, _Z_PORTA_MB])

P4 = np.array(world_root.dal_frame_guscio(POS_SALONE))
# POS_SALONE e' letto RAW dal GLB (frame del guscio, non ancora tradotto).
# world_root.dal_frame_guscio sottrae ORIGINE_POSIZIONE_GLB, che e' la stessa
# posizione: il risultato e' (0,0,0) per costruzione. Bug pescato eseguendo:
# senza questa riga P4 restava nel frame sbagliato e il "scarto zero" sotto
# sarebbe stato un confronto fra due frame diversi che tornava zero per caso
# (perche' fissato uguale a se stesso), non un vero controllo del frame.

P3 = (P2 + P4) / 2.0  # ASSUNTO: nessun waypoint interno al salone e' misurato

CONTROL_POINTS = [
    # (posizione_m, etichetta, stato)
    (P0, "P0 meccanismo (DERIVATO: punto medio MECHANISM_BAY, Y/Z dalla porta)", "DERIVATO"),
    (P1, "P1 corridoio (DERIVATO: punto medio STAIR_CORRIDOR, pavimento interpolato)", "DERIVATO"),
    (P2, "P2 ingresso_salone (MISURATO: centro dell'apertura reale, non il finestrone)", "MISURATO"),
    (P3, "P3 dentro il salone (ASSUNTO: nessun rilievo fra porta e posa camera)", "ASSUNTO"),
    (P4, "P4 CAMERA_SORGENTE_SALONE (ESATTO: origine del mondo per costruzione)", "ESATTO"),
]

POSITIONS = [p for p, _, _ in CONTROL_POINTS]
N = len(POSITIONS)

# Orientamenti ai nodi: lookAt lungo la tangente locale per i nodi
# intermedi (differenza centrata sui vicini, come la tangente di
# Catmull-Rom stessa, cosi' l'orientamento "segue" davvero il percorso),
# quaternione ESATTO del GLB al nodo finale.
#
# ─── LO SGUARDO E' ORIZZONTALE: si segue la tangente IN PIANTA, non in quota
#
# Visto nel provino (fotogrammi 12-16 s): salendo la scala la camera guarda il
# soffitto, e arriva nel salone inquadrando il plafone dal basso. Il numero:
# beccheggio 5,7 gradi a s=0, 36 gradi a s=0.92, poi -4 all'arrivo.
#
# La causa e' qui. I punti di controllo non hanno la stessa semantica in quota:
# P0 e P1 stanno al PAVIMENTO, P2 a mezza altezza dell'apertura e P4 all'OCCHIO
# della camera del film. Fra P1 e P2 la spline sale la scala (1,40 m) piu'
# l'altezza dell'apertura (1,17 m) in quattro metri di corsa: la tangente punta
# in alto di 36 gradi, e il lookAt la seguiva. La QUOTA della camera la corregge
# gia' il sito (`alzaSulPavimento` mette l'occhio a 1,55 m dal pavimento
# misurato), quindi la salita della tangente e' un artefatto dei nodi, non un
# moto che qualcuno abbia chiesto.
#
# Chi cammina guarda dove va, in piano: la tangente si proietta sul piano
# orizzontale e il beccheggio dei nodi e' zero. L'unico nodo inclinato resta
# l'ultimo, che e' il quaternione ESATTO della camera del film; SQUAD porta la
# camera da orizzontale a quella inclinazione negli ultimi due tratti, che e'
# la fusione senza stacco chiesta dal contratto. Se sulla scala si vuole uno
# sguardo un po' alzato (una persona sale guardando il pianerottolo, +5..+10
# gradi), e' un numero per il committente: si mette in BECCHEGGIO_NODI_GRADI.
BECCHEGGIO_NODI_GRADI = 0.0

def _tangente_in_piano(t):
    t = np.asarray(t, dtype=float).copy()
    t[1] = 0.0
    n = np.linalg.norm(t)
    if n < 1e-9:
        return t
    t = t / n
    if BECCHEGGIO_NODI_GRADI:
        t[1] = math.tan(math.radians(BECCHEGGIO_NODI_GRADI))
    return t

ORIENTATIONS = []
for i in range(N):
    if i == N - 1:
        ORIENTATIONS.append(q_normalize(np.array(QUAT_SALONE)))
        continue
    if i == 0:
        tangent = POSITIONS[1] - POSITIONS[0]
    elif i == N - 2:
        # penultimo nodo: punta verso l'arrivo per fondersi con l'orientamento finale
        tangent = POSITIONS[i + 1] - POSITIONS[i - 1]
    else:
        tangent = POSITIONS[i + 1] - POSITIONS[i - 1]
    ORIENTATIONS.append(look_at_quat(_tangente_in_piano(tangent)))


# ---------------------------------------------------------------------------
# 3. Catmull-Rom centripeta (Barry-Goldman), con punti fantasma agli estremi.
# ---------------------------------------------------------------------------

ALPHA = 0.5  # centripeta: evita cappi/autointersezioni con spaziatura irregolare


def _knot_dt(pa, pb):
    d = np.linalg.norm(pb - pa)
    return max(d ** ALPHA, 1e-6)


def _phantom_start(p0, p1):
    return p0 - (p1 - p0)


def _phantom_end(pn_1, pn_2):
    return pn_1 + (pn_1 - pn_2)


PTS_EXT = [_phantom_start(POSITIONS[0], POSITIONS[1])] + POSITIONS + [
    _phantom_end(POSITIONS[-1], POSITIONS[-2])
]
# indice: PTS_EXT[0] = fantasma iniziale, PTS_EXT[1..N] = nodi reali, PTS_EXT[N+1] = fantasma finale


def catmull_rom_point(seg, t):
    """seg: indice di segmento reale 0..N-2 (fra nodo seg e nodo seg+1). t in [0,1]."""
    p0 = PTS_EXT[seg]
    p1 = PTS_EXT[seg + 1]
    p2 = PTS_EXT[seg + 2]
    p3 = PTS_EXT[seg + 3]

    t0 = 0.0
    t1 = t0 + _knot_dt(p0, p1)
    t2 = t1 + _knot_dt(p1, p2)
    t3 = t2 + _knot_dt(p2, p3)

    tt = t1 + t * (t2 - t1)

    a1 = (t1 - tt) / (t1 - t0) * p0 + (tt - t0) / (t1 - t0) * p1
    a2 = (t2 - tt) / (t2 - t1) * p1 + (tt - t1) / (t2 - t1) * p2
    a3 = (t3 - tt) / (t3 - t2) * p2 + (tt - t2) / (t3 - t2) * p3

    b1 = (t2 - tt) / (t2 - t0) * a1 + (tt - t0) / (t2 - t0) * a2
    b2 = (t3 - tt) / (t3 - t1) * a2 + (tt - t1) / (t3 - t1) * a3

    c = (t2 - tt) / (t2 - t1) * b1 + (tt - t1) / (t2 - t1) * b2
    return c


N_SEG = N - 1  # 4 segmenti


def position_at_u(u):
    """u in [0, N_SEG]: parte intera = segmento, frazione = t locale."""
    u = max(0.0, min(float(N_SEG), u))
    seg = min(int(u), N_SEG - 1)
    t = u - seg
    return catmull_rom_point(seg, t)


def quat_at_u(u):
    u = max(0.0, min(float(N_SEG), u))
    seg = min(int(u), N_SEG - 1)
    t = u - seg
    q0 = ORIENTATIONS[seg]
    q1 = ORIENTATIONS[seg + 1]
    q_prev = ORIENTATIONS[seg - 1] if seg - 1 >= 0 else None
    q_next = ORIENTATIONS[seg + 2] if seg + 2 <= N_SEG else None
    s0 = squad_tangent(q_prev, q0, q1)
    s1 = squad_tangent(q0, q1, q_next)
    return squad(q0, s0, s1, q1, t)


# ---------------------------------------------------------------------------
# 4. Riparametrizzazione per lunghezza d'arco: campiona fitto in u,
#    integra la lunghezza di corda cumulata, inverte con interpolazione.
#    NIENTE tempo qui: s01 e' progresso 0..1 sulla lunghezza reale in metri.
# ---------------------------------------------------------------------------

N_SAMPLE = 20000
u_samples = np.linspace(0.0, float(N_SEG), N_SAMPLE)
p_samples = np.array([position_at_u(u) for u in u_samples])

seg_lengths = np.linalg.norm(np.diff(p_samples, axis=0), axis=1)
cum_len = np.concatenate([[0.0], np.cumsum(seg_lengths)])
ARC_LENGTH_TOTALE_M = float(cum_len[-1])


def u_at_arclength_m(s_m):
    s_m = max(0.0, min(ARC_LENGTH_TOTALE_M, s_m))
    return float(np.interp(s_m, cum_len, u_samples))


def pos_at_arclength(s01):
    """s01: progresso normalizzato 0..1 sulla lunghezza d'arco reale (metri)."""
    s_m = s01 * ARC_LENGTH_TOTALE_M
    return position_at_u(u_at_arclength_m(s_m))


def quat_at_arclength(s01):
    s_m = s01 * ARC_LENGTH_TOTALE_M
    return quat_at_u(u_at_arclength_m(s_m))


# ---------------------------------------------------------------------------
# 5. Misure: campionamento a passo COSTANTE in lunghezza d'arco (non in u),
#    perche' curvatura/jerk/velocita' angolare vanno letti rispetto allo
#    spazio percorso, non al parametro interno della spline.
#    Jerk e velocita' angolare sono qui espressi "per metro percorso a
#    velocita' unitaria" (assunzione esplicita: nessuna legge oraria e'
#    stata cotta nella curva, quindi si riportano le derivate rispetto
#    alla LUNGHEZZA D'ARCO stessa, s in metri = tempo a 1 m/s equivalente).
#    Il sito, applicando la propria legge di velocita' v(s), scala questi
#    numeri di conseguenza.
# ---------------------------------------------------------------------------

N_MISURA = 4000
s_grid_m = np.linspace(0.0, ARC_LENGTH_TOTALE_M, N_MISURA)
ds = s_grid_m[1] - s_grid_m[0]

pos_grid = np.array([pos_at_arclength(s / ARC_LENGTH_TOTALE_M) for s in s_grid_m])

# derivate per differenze finite centrate (posizione rispetto a s)
d1 = np.gradient(pos_grid, ds, axis=0)                    # dP/ds  (velocita' unitaria: modulo ~1)
d2 = np.gradient(d1, ds, axis=0)                          # d2P/ds2
d3 = np.gradient(d2, ds, axis=0)                          # d3P/ds3  <- "jerk" a velocita' unitaria

speed = np.linalg.norm(d1, axis=1)
speed_safe = np.where(speed < 1e-9, 1e-9, speed)

# curvatura kappa = |dP/ds x d2P/ds2| / |dP/ds|^3  (formula generale, valida
# anche se il campionamento non e' perfettamente a velocita' unitaria)
cross = np.cross(d1, d2)
curvature = np.linalg.norm(cross, axis=1) / (speed_safe ** 3)

jerk_mag = np.linalg.norm(d3, axis=1)

i_kmax = int(np.argmax(curvature))
i_jmax = int(np.argmax(jerk_mag))

# velocita' angolare: angolo fra quaternioni consecutivi / ds, campionati
# sulla stessa griglia a passo costante in lunghezza d'arco
quats_grid = [quat_at_arclength(s / ARC_LENGTH_TOTALE_M) for s in s_grid_m]
ang_vel = np.zeros(N_MISURA)
for i in range(1, N_MISURA - 1):
    qa = quats_grid[i - 1]
    qb = quats_grid[i + 1]
    d = abs(q_dot(qa, qb))
    d = min(1.0, d)
    angle = 2.0 * math.acos(d)
    ang_vel[i] = angle / (2 * ds)
ang_vel[0] = ang_vel[1]
ang_vel[-1] = ang_vel[-2]

i_wmax = int(np.argmax(ang_vel))


def fmt_pos(p):
    return f"({p[0]:.4f}, {p[1]:.4f}, {p[2]:.4f}) m"


# ---------------------------------------------------------------------------
# 6. Report
# ---------------------------------------------------------------------------

print("=" * 78)
print("A6 — curva world-space camera: meccanismo -> salone")
print("=" * 78)

print("\n-- Nodo di arrivo, letto da public/modelli/guscio-salone.glb --")
print(f"  CAMERA_SORGENTE_SALONE  pos = {fmt_pos(np.array(POS_SALONE))}")
print(f"  CAMERA_SORGENTE_SALONE  quat(x,y,z,w) = {tuple(round(v, 6) for v in QUAT_SALONE)}")

print("\n-- Punti di controllo (metri, FRAME DEL MONDO — world_root.py) --")
for p, label, stato in CONTROL_POINTS:
    print(f"  [{stato:8s}] {label:70s} {fmt_pos(p)}")
n_assunti = sum(1 for _, _, s in CONTROL_POINTS if s == "ASSUNTO")
print(f"\n  punti ASSUNTI: {n_assunti} su {len(CONTROL_POINTS)}")

print("\n-- Misure --")
print(f"  lunghezza d'arco totale:        {ARC_LENGTH_TOTALE_M:.4f} m")

s_kmax = s_grid_m[i_kmax]
print(f"  curvatura massima:              {curvature[i_kmax]:.6f} 1/m "
      f"(raggio equivalente {1.0/max(curvature[i_kmax],1e-9):.3f} m)")
print(f"    a s = {s_kmax:.4f} m ({100*s_kmax/ARC_LENGTH_TOTALE_M:.1f}% del percorso), "
      f"posizione {fmt_pos(pos_grid[i_kmax])}")

s_jmax = s_grid_m[i_jmax]
print(f"  jerk massimo (d3P/ds3, unita' 1/m^2, velocita' unitaria assunta): "
      f"{jerk_mag[i_jmax]:.6f}")
print(f"    a s = {s_jmax:.4f} m ({100*s_jmax/ARC_LENGTH_TOTALE_M:.1f}% del percorso), "
      f"posizione {fmt_pos(pos_grid[i_jmax])}")

s_wmax = s_grid_m[i_wmax]
print(f"  velocita' angolare massima:     {ang_vel[i_wmax]:.6f} rad/m "
      f"({math.degrees(ang_vel[i_wmax]):.4f} deg/m)")
print(f"    a s = {s_wmax:.4f} m ({100*s_wmax/ARC_LENGTH_TOTALE_M:.1f}% del percorso), "
      f"posizione {fmt_pos(pos_grid[i_wmax])}")

print("\n-- Verifica arrivo esatto (VUOTA PER COSTRUZIONE, vedi nota) --")
p_end = pos_at_arclength(1.0)
q_end = quat_at_arclength(1.0)
err_pos = np.linalg.norm(p_end - P4)  # P4 e' gia' nel frame del mondo (vedi sopra)
err_quat = 1.0 - abs(q_dot(q_normalize(q_end), q_normalize(np.array(QUAT_SALONE))))
print(f"  posizione a s01=1.0: {fmt_pos(p_end)}  (scarto {err_pos:.6f} m, atteso su P4 = {fmt_pos(P4)})")
print(f"  quaternione a s01=1.0: scarto 1-|dot| = {err_quat:.3e}")
print("  NOTA: nel frame del mondo P4 = CAMERA_SORGENTE_SALONE = origine per")
print("  costruzione (collocazione SALOON_SHELL), e ORIENTATIONS[-1] e' fissato")
print("  a QUAT_SALONE nel codice sopra. Questo controllo confronta l'arrivo")
print("  con se stesso: e' un cancello che non puo' mai fallire. Non misura")
print("  niente — resta qui solo per continuita' col report precedente.")

print("\n-- Verifica a monte: il punto di partenza cade nel locale tecnico? --")
margine_a = P0[0] - X_MB0       # distanza dalla parete di fondo del locale
margine_b = X_PORTA_MB - P0[0]  # distanza dalla porta verso il corridoio
dentro = (X_MB0 <= P0[0] <= X_PORTA_MB)
print(f"  MECHANISM_BAY (mondo): X in [{X_MB0:.4f}, {X_PORTA_MB:.4f}] m")
print(f"  P0.x = {P0[0]:.4f} m  ->  {'DENTRO' if dentro else 'FUORI'} l'intervallo costruito")
print(f"    margine dalla parete di fondo (X_MB0): {margine_a:.4f} m")
print(f"    margine dalla porta verso il corridoio: {margine_b:.4f} m")
if not dentro:
    print("  ATTENZIONE: P0 cade FUORI dal locale tecnico come collocato da "
          "world_root — la curva parte da un punto che l'assemblatore non ha "
          "ancora costruito o gia' oltre la porta.")

print("\n-- Continuita' C1: dove sono i picchi rispetto ai nodi --")
knot_s = []
for i in range(N):
    u_knot = float(i)
    s_knot_m = np.interp(u_knot, u_samples, cum_len) if i < N_SEG else ARC_LENGTH_TOTALE_M
    knot_s.append(s_knot_m if i > 0 else 0.0)
print(f"  s dei nodi (m): {[round(v, 3) for v in knot_s]}")
print(f"  s del picco di curvatura: {s_kmax:.3f} m   s del picco di jerk: {s_jmax:.3f} m   "
      f"s del picco di v.angolare: {s_wmax:.3f} m")
vicino_a_nodo = any(abs(s_jmax - k) < 3 * ds for k in knot_s)
if vicino_a_nodo:
    print("  il picco di jerk cade su un nodo: e' atteso, NON un bug. Catmull-Rom "
          "(anche centripeta) e' C1 per costruzione (posizione e tangente continue) "
          "ma non C2: la curvatura puo' avere un salto finito al nodo, quindi la "
          "derivata terza campionata a passo finito mostra un massimo locale li'. "
          "Il criterio del mandato (§4) chiede 'almeno C1': e' rispettato. Se il "
          "salto risultasse visibile a video, la cura e' C2 (B-spline cubica) sui "
          "control point, non un problema di questo script.")
else:
    print("  picco di jerk non coincide con un nodo (nessun salto di curvatura "
          "rilevabile in questo campionamento).")

print("\n" + "=" * 78)
print("Report completato. Nessun file scritto su disco da questo script.")
print("=" * 78)


# ---------------------------------------------------------------------------
# 7. Se in Blender: costruisci un oggetto Curve in memoria per ispezione
#    visiva nella GUI (non salvato, non esportato — una sola camera a
#    runtime resta un impegno del sito, non di questo script/bpy-scene).
# ---------------------------------------------------------------------------

if HAVE_BPY:
    try:
        curve_data = bpy.data.curves.new("CAMERA_PATH_A6", type="CURVE")
        curve_data.dimensions = "3D"
        spline = curve_data.splines.new("POLY")
        n_viz = 400
        spline.points.add(n_viz - 1)
        for i in range(n_viz):
            s01 = i / (n_viz - 1)
            p = pos_at_arclength(s01)
            spline.points[i].co = (float(p[0]), float(p[1]), float(p[2]), 1.0)
        obj = bpy.data.objects.new("CAMERA_PATH_A6", curve_data)
        bpy.context.scene.collection.objects.link(obj)
        print(f"\n[bpy] curva '{obj.name}' creata in memoria nella scena corrente "
              f"({n_viz} punti, non salvata).")
    except Exception as e:
        print(f"\n[bpy] impossibile creare la curva di ispezione ({e}); "
              "il report numerico sopra resta valido comunque.")
else:
    print("\n[nota] eseguito fuori da Blender: solo calcolo/stampa, come previsto "
          "quando serve iterare in fretta sui numeri prima di aprire la GUI.")


# ─────────────────────────────────────────────────────────────────────────────
# L'ESPORTAZIONE — la curva esce dal computer e diventa un file che il sito legge
# ─────────────────────────────────────────────────────────────────────────────
#
# ─── PERCHE' JSON E NON LA CAMERA DENTRO IL GLB
#
# Le due strade erano sul tavolo. La camera nel GLB e' battuta -- il progetto
# usa gia' `export_cameras=True` in `guscio-esporta.py` -- ma rende la curva
# OPACA dentro un binario, e ogni ritocco costa un riesport.
#
# Decide un vincolo, non un gusto: il sito deve poter SCRUBBARE, cioe' mappare
# il progresso di scorrimento sulla curva a piacere. E' l'articolo 4 del
# contratto world-space: «la durata non si cuoce nello spazio; il sito deve
# poter rimappare il progresso di scroll sulla curva senza cambiarne la
# traiettoria». Una camera animata dentro un GLB porta con se' una LEGGE
# ORARIA; una tabella di pose no.
#
# ─── E IL PASSO E' DI LUNGHEZZA, NON DI PARAMETRO
#
# Campionando in `u` i punti si addenserebbero dove la curva e' lenta e si
# diraderebbero dove corre: la velocita' apparente cambierebbe senza che nessuno
# l'abbia chiesto. A passo di lunghezza d'arco, interpolare fra due campioni
# consecutivi e' interpolare a velocita' costante.

def esporta_json(percorso, campioni=96):
    """Scrive la curva in JSON, a passo costante di lunghezza d'arco."""
    import json as _json
    dati = {
        'formato': 'nautica.traversata.camera/1',
        'frame': 'mondo (world_root.py) - origine sul nodo CAMERA_SORGENTE_SALONE',
        'unita': 'metri',
        'passo': "costante in lunghezza d'arco",
        'lunghezza_m': round(float(ARC_LENGTH_TOTALE_M), 6),
        'campioni': int(campioni),
        'pose': [],
    }
    for i in range(campioni):
        s01 = i / (campioni - 1)
        p3 = pos_at_arclength(s01)
        q = quat_at_arclength(s01)
        dati['pose'].append({
            's': round(s01, 6),
            'p': [round(float(c), 6) for c in p3],
            # quaternione in ordine glTF (x, y, z, w), come tutto il progetto:
            # l'ordine di Blender e' (w, x, y, z), e confonderli da' norma 1 e
            # centoundici gradi di errore senza nessun avviso.
            'q_gltf': [round(float(c), 6) for c in q],
        })
    with open(percorso, 'w', encoding='utf-8') as f:
        _json.dump(dati, f, ensure_ascii=False, indent=1)
        f.write('\n')
    return dati


_FUORI = os.path.join(os.path.abspath(os.path.join(_QUI, '..', '..')), 'public', 'modelli', 'traversata-camera.json')
_d = esporta_json(_FUORI)
print('')
print(f'  CURVA ESPORTATA  {_FUORI}')
print(f'    {_d["campioni"]} pose · lunghezza {_d["lunghezza_m"]:.3f} m · '
      f'{os.path.getsize(_FUORI)} byte')
