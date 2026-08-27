"""LA POSA DELLA CAMERA CHE HA RIPRESO IL SALONE.

    python riferimenti/salone/calibrazione.py [filmato.mp4]

Senza argomenti legge `public/filmati/salone-largo.mp4`, cioe' la ripresa che
il sito monta davvero. Scrive `riferimenti/salone/posa.json`.

--- A COSA SERVE

`docs/15 §0-octies` vuole un GUSCIO GREZZO -- pavimento, soffitto, due murate,
paratia di fondo, il vano del finestrone -- su cui proiettare la fotografia
dalla posa della camera che l'ha ripresa. Senza quella posa il guscio e' una
scatola qualsiasi e la fotografia ci si spalma sopra storta.

Questo strumento non costruisce il guscio: produce i NUMERI e li verifica.

--- COSA MISURA, E COSA INVECE DICHIARA

Misurato sulla sorgente, a ogni esecuzione, mai copiato da qui:

  - le tre rette del vano (diagonale alta, montante, battuta bassa), col
    metodo del punto 1 di `strumenti/salone-da-filmato.py`;
  - la retta dell'orizzonte del mare, con la sua pendenza;
  - la giunzione murata/moquette e la giunzione murata/soffitto, che sono le
    altre due rette longitudinali della stessa parete.

Dichiarato, e va detto perche' non e' misurabile qui:

  - LA LUNGHEZZA FOCALE. Il filmato non la determina -- vedi §"quello che la
    ripresa non sa". Si prende quella che il sito stesso dichiara: la camera
    di `src/scena/index.js` e' `new PerspectiveCamera(34, ...)`, cioe' 34
    gradi verticali, e `src/scena/salone3d.js` piazza la fotografia perche'
    riempia quel campo. 34 gradi su 720 righe fanno f = 360/tan(17) px;
  - LA SCALA. Tre rette e un rettangolo danno la FORMA, non la distanza: un
    vano piu' grande e piu' lontano proietta identico. La quarta informazione
    e' l'altezza d'aria del salone, che il repo dichiara in due posti:
    `TUGA.alt = 0.94` unita' in `src/scena/nave.js` e `1 unita' = 2,5 m` in
    `src/scafo/ordinate.js:19`. Fa 2,35 m fra moquette e soffitto -- ed e' lo
    stesso numero che nave.js commenta come «da 1,80 m a 2,35 m».

    LA LARGHEZZA DEL VANO NON PUO' FARE DA ANCORA, e questo va detto chiaro:
    il montante di sinistra e' FUORI QUADRO -- a sinistra c'e' solo mare fino
    al bordo. La larghezza del vano non si misura in pixel, quindi non puo'
    fissare la scala: esce come RISULTATO, non come ipotesi.

--- QUELLO CHE LA RIPRESA NON SA, E NESSUNO GLIELO PUO' CHIEDERE

La ripresa e' generata, non girata, e NON E' UNA PROSPETTIVA COERENTE. Non e'
un'opinione, sono quattro misure che si contraddicono (le stampa il punto 5):

  - le rette longitudinali della stanza NON hanno un punto di fuga solo. Il
    vano (diagonale + battuta) ne da uno; la giunzione col pavimento passa una
    decina di pixel piu' in alto, quella col soffitto una ventina;
    l'orizzonte del mare una ventina piu' in basso. Venti pixel a questa
    focale sono un grado;
  - le verticali della stanza NON convergono in modo coerente: le loro
    inclinazioni stanno in meno di un grado e sono sparse a caso invece che a
    ventaglio. Il punto 5 le conta, le stampa, e dice se convergono;
  - le orizzontali del fondo stanza sono quasi parallele fra loro, cioe' il
    loro punto di fuga e' all'infinito -- il che vorrebbe dire asse ottico
    lungo la nave, mentre il punto di fuga del vano sta 406 px fuori centro.

Conseguenza pratica per chi costruisce il guscio: UNA SOLA POSA NON PUO'
COMBACIARE OVUNQUE. Questa combacia sul VANO -- che e' il bordo che si vede,
quello dove il guscio incontra il mare 3D, e l'unico posto in cui un errore
di un grado si legge subito. Sul pavimento e sul soffitto resta lo scarto che
il punto 5 stampa in pixel: e' il prezzo della fotografia, non un difetto del
calcolo.
"""
import json
import math
import subprocess
import sys
from collections import deque
from pathlib import Path

import numpy as np

RADICE = Path(__file__).resolve().parent.parent.parent
SORGENTE = Path(sys.argv[1]) if len(sys.argv) > 1 else RADICE / 'public' / 'filmati' / 'salone-largo.mp4'
if not SORGENTE.is_file():
    sys.exit('  non trovo la sorgente: %s' % SORGENTE)

# ---------------------------------------------------------------------------
# LE DUE DICHIARAZIONI, con la loro provenienza scritta accanto.
# Se domani cambiano nel repo, cambiano qui: sono citazioni, non costanti.
# ---------------------------------------------------------------------------
FOV_V_GRADI = 34.0        # src/scena/index.js:81  new PerspectiveCamera(34, ...)
UNITA_IN_M = 2.5          # src/scafo/ordinate.js:19  «1 = 2,5 m»
TUGA_ALT_U = 0.94         # src/scena/nave.js:53     TUGA = { ..., alt: 0.94, ... }
TUGA_LUNG_U = 6.2         # src/scena/nave.js:53     TUGA = { ..., lung: 6.2, ... }
SEMILARG_TUGA_U = 1.5775  # src/scafo/ordinate.js    sezioneA(tDaZ(0.6)).semilarg
FATT_LARG_TUGA = 1.16     # src/scena/nave.js:187    larghTuga = semilarg * 1.16

ALTEZZA_ARIA_M = TUGA_ALT_U * UNITA_IN_M          # 2,35 m: pavimento -> soffitto
LARGH_TUGA_M = SEMILARG_TUGA_U * FATT_LARG_TUGA * UNITA_IN_M   # 4,57 m di baglio
LUNG_TUGA_M = TUGA_LUNG_U * UNITA_IN_M            # 15,5 m di tuga

# Quanto si tollera. Il primo e' lo stesso spirito del rifiuto di
# `salone-da-filmato.py`: sopra i 4 px non si sta mascherando questo vano.
TETTO_RIPROIEZIONE_PX = 4.0
# Il secondo e' il giro completo posa -> rettangolo 3D -> proiezione -> rette.
# Non e' una verifica indipendente, e' un controllo di catena: se qui esce piu'
# di mezzo pixel c'e' un errore di segno o di convenzione da qualche parte.
TETTO_ANDATA_RITORNO_PX = 0.5
# E I DUE CANCELLI SONO STATI PROVATI, perche' un cancello che non ha mai
# suonato non si sa se suona: storcendo la verticale della stanza di UN SOLO
# grado, la riproiezione passa da 1,17 a 3,07 px medi e il giro completo a
# 7,53 px, e lo strumento esce con errore. Un grado e' il limite: sotto, questa
# fotografia non distingue.


def sonda(campi):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                        '-show_entries', campi, '-of', 'csv=p=0:nk=1', str(SORGENTE)],
                       capture_output=True, text=True)
    return r.stdout.strip().split('\n')[0].split(',')


W, H = (int(x) for x in sonda('stream=width,height'))
print('  sorgente: %s  (%dx%d)' % (SORGENTE.name, W, H))

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(SORGENTE), '-vf', 'fps=2',
                      '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'],
                     capture_output=True).stdout
FOT = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32)
if len(FOT) < 8:
    sys.exit('  la sorgente ha %d fotogrammi: troppo poco per una mediana' % len(FOT))
# LA MEDIANA TEMPORALE toglie di mezzo le persone e le onde: quello che resta
# e' la stanza, che e' l'unica cosa che sta ferma abbastanza da misurarla.
MED = np.median(FOT, axis=0)
GRI = MED.mean(axis=2)
print('  %d fotogrammi, mediana temporale calcolata' % len(FOT))


# ===========================================================================
# 1 - LE TRE RETTE DEL VANO
#
# E' il punto 1 di `strumenti/salone-da-filmato.py`, rifatto qui invece che
# importato: quello script, importato, ESEGUE tutto -- ricomprime i filmati e
# riscrive la maschera. Uno strumento di misura non deve avere effetti.
# I numeri devono uscire uguali; se un giorno divergono, e' un difetto vero.
# ===========================================================================
print('\n  1 - le tre rette del vano')
caldo = MED[:, :, 0] - MED[:, :, 2]
fuori = caldo < 6
visto = np.zeros_like(fuori, bool)
coda = deque()
for y in range(H):
    if fuori[y, 0]:
        visto[y, 0] = True
        coda.append((y, 0))
while coda:
    y, x = coda.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < H and 0 <= nx < W and fuori[ny, nx] and not visto[ny, nx]:
            visto[ny, nx] = True
            coda.append((ny, nx))

BORDO = np.full(H, -1.0)
for y in range(H):
    xs = np.nonzero(visto[y])[0]
    if len(xs) > 20 and xs.min() == 0:
        salto = np.nonzero(np.diff(xs) > 1)[0]
        BORDO[y] = xs[salto[0]] if len(salto) else xs.max()
YS = np.nonzero(BORDO > 0)[0]
if len(YS) < H * 0.5:
    sys.exit('     il bordo del vano si legge su meno di meta delle righe')


def retta(yy):
    A = np.vstack([yy, np.ones(len(yy))]).T
    sol, *_ = np.linalg.lstsq(A, BORDO[yy], rcond=None)
    return sol[0], sol[1], float(np.abs(A @ sol - BORDO[yy]).mean())


migliore = None
for a in range(int(YS.min()) + 30, H // 2, 4):
    for b in range(max(a + 80, int(H * 0.55)), int(YS.max()) - 40, 4):
        pezzi = (YS[YS <= a], YS[(YS > a) & (YS <= b)], YS[YS > b])
        if min(len(p) for p in pezzi) < 30:
            continue
        fit = [retta(p) for p in pezzi]
        e = sum(x[2] * len(p) for x, p in zip(fit, pezzi)) / len(YS)
        if migliore is None or e < migliore[0]:
            migliore = (e, a, b, fit)

ERR_RETTE, YA, YB, RETTE = migliore
NOMI = ('diagonale alta', 'montante', 'battuta bassa')
for nome, (m_, q_, e_) in zip(NOMI, RETTE):
    print('     %-15s x = %+.5f*y %+9.2f   %+6.2f gradi dalla verticale   errore %.2f px'
          % (nome, m_, q_, math.degrees(math.atan(m_)), e_))
print('     errore medio: %.2f px   (rotture a y=%d e y=%d)' % (ERR_RETTE, YA, YB))
if ERR_RETTE > TETTO_RIPROIEZIONE_PX:
    sys.exit('     le rette non descrivono questo vano: sorgente sbagliata')

# I tre segmenti, in righe: servono al punto 5 per confrontare SUI PIXEL VERI.
SEGMENTI = (YS[YS <= YA], YS[(YS > YA) & (YS <= YB)], YS[YS > YB])


def da_mq(m, q):
    """La retta x = m*y + q come vettore omogeneo l, con l . (x,y,1) = 0."""
    return np.array([1.0, -m, -q])


L_DIAG, L_MONT, L_BATT = (da_mq(m, q) for m, q, _ in RETTE)

# IL PUNTO DI FUGA DEL VANO: dove svaniscono i due bordi ORIZZONTALI.
vp = np.cross(L_DIAG, L_BATT)
VP_VANO = np.array([vp[0] / vp[2], vp[1] / vp[2]])
print('     punto di fuga dei due bordi orizzontali: (%.1f, %.1f)' % tuple(VP_VANO))


# ===========================================================================
# 2 - L'ORIZZONTE DEL MARE, CON LA SUA PENDENZA
#
# Non serve alla posa -- e questo e' voluto, vedi il punto 4 -- ma e' l'unico
# controllo INDIPENDENTE che questo strumento ha: la posa lo prevede, e qui si
# guarda di quanto sbaglia.
#
# Si misura sulla mediana, dove le onde si annullano e la linea e' pulita, e
# nella sola fascia che e' certamente mare: a sinistra della diagonale alta.
# ===========================================================================
print('\n  2 - l orizzonte del mare')
x_sicuro = int(min(RETTE[0][1], RETTE[2][0] * 400 + RETTE[2][1])) - 60
colonne = np.arange(40, max(80, x_sicuro), 4)
punti = []
for x in colonne:
    col = GRI[200:460, x]
    d = col[:-6] - col[6:]          # cielo chiaro sopra, mare scuro sotto
    punti.append((x, 200 + int(np.argmax(d)) + 3, float(d.max())))
punti = np.array(punti, float)
sel = punti[:, 2] > np.percentile(punti[:, 2], 20)
for _ in range(6):
    A = np.vstack([punti[sel, 0], np.ones(int(sel.sum()))]).T
    sol, *_ = np.linalg.lstsq(A, punti[sel, 1], rcond=None)
    r = np.abs(np.vstack([punti[:, 0], np.ones(len(punti))]).T @ sol - punti[:, 1])
    sel = (r < max(2.0, 2.5 * np.median(r[sel]))) & (punti[:, 2] > np.percentile(punti[:, 2], 20))
A_OR, B_OR = float(sol[0]), float(sol[1])
RMS_OR = float(np.sqrt((r[sel] ** 2).mean()))
L_ORIZZ = np.array([A_OR, -1.0, B_OR])       # y = a*x + b
print('     y = %+.6f*x %+.2f   -> y(%d) = %.2f   inclinazione %+.3f gradi   (%d colonne, rms %.2f px)'
      % (A_OR, B_OR, W // 2, A_OR * W / 2 + B_OR, math.degrees(math.atan(A_OR)), int(sel.sum()), RMS_OR))
if RMS_OR > 3.0:
    sys.exit('     l orizzonte non si legge come una retta: rms %.2f px' % RMS_OR)


# ===========================================================================
# 3 - LE ALTRE DUE RETTE LONGITUDINALI: pavimento e soffitto
#
# Sono sulla STESSA parete del vano e vanno nella STESSA direzione, quindi
# devono svanire nello stesso punto. Non lo fanno (punto 5), ma servono lo
# stesso: sono l'unica cosa che da' al guscio un'altezza in pixel da riempire
# coi 2,35 m dichiarati.
# ===========================================================================
print('\n  3 - pavimento e soffitto della murata di sinistra')


def traccia_giunzione(xa, xb, ya, yb, verso):
    """Per ogni colonna, la riga del salto verticale piu' forte. verso=+1
    chiaro sotto (moquette), -1 chiaro sopra (soffitto)."""
    out = []
    for x in range(xa, xb):
        col = GRI[ya:yb, x]
        d = (col[6:] - col[:-6]) * verso
        i = int(np.argmax(d))
        out.append((x, ya + i + 3, float(d.max())))
    return np.array(out, float)


def retta_per_vp(pt, vp_xy):
    """La retta che passa per il punto di fuga e minimizza lo scarto verticale
    sui punti misurati. Un solo grado di liberta': la pendenza e' obbligata."""
    dx = pt[:, 0] - vp_xy[0]
    dy = pt[:, 1] - vp_xy[1]
    m = float((dx * dy).sum() / (dx * dx).sum())       # y = vpy + m*(x-vpx)
    res = dy - m * dx
    return m, float(np.abs(res).mean()), float(np.abs(res).max())


PAV = traccia_giunzione(725, 826, 540, H, +1)
SOF = traccia_giunzione(830, 921, 0, 320, -1)
for nome, pt in (('pavimento', PAV), ('soffitto ', SOF)):
    A = np.vstack([pt[:, 0], np.ones(len(pt))]).T
    s, *_ = np.linalg.lstsq(A, pt[:, 1], rcond=None)
    e = float(np.abs(A @ s - pt[:, 1]).mean())
    if e > 2.0:
        sys.exit('     la giunzione %s non si legge come una retta (%.2f px)' % (nome, e))
    yv = s[0] * VP_VANO[0] + s[1]
    print('     %s  y = %+.5f*x %+8.2f   err %.2f px   passa a y=%.1f sopra il punto di fuga del vano (scarto %+.1f px)'
          % (nome, s[0], s[1], e, yv, yv - VP_VANO[1]))

# Per il guscio le due rette vengono FORZATE a passare per il punto di fuga del
# vano: e' l'unico modo di avere un guscio con le facce parallele. Lo scarto
# che questo costa si stampa, non si nasconde.
M_PAV, E_PAV, EMAX_PAV = retta_per_vp(PAV, VP_VANO)
M_SOF, E_SOF, EMAX_SOF = retta_per_vp(SOF, VP_VANO)
print('     forzate per il punto di fuga del vano: pavimento %.2f px medi (%.2f max), soffitto %.2f (%.2f)'
      % (E_PAV, EMAX_PAV, E_SOF, EMAX_SOF))
L_PAV = np.array([M_PAV, -1.0, VP_VANO[1] - M_PAV * VP_VANO[0]])
L_SOF = np.array([M_SOF, -1.0, VP_VANO[1] - M_SOF * VP_VANO[0]])


# ===========================================================================
# 4 - LA POSA
#
# Ipotesi dichiarate: pixel quadrati, nessuna distorsione, punto principale al
# centro dell'immagine. Nessuna delle tre e' verificabile su una ripresa
# generata; la prima e la seconda sono innocue, la terza e' la piu' fragile e
# la sua sensibilita' si stampa al punto 6.
#
# --- COME SI COSTRUISCE, E PERCHE' L'ORIZZONTE NON ENTRA
#
# Servono due direzioni ortogonali della stanza. La prima e' data: il punto di
# fuga del vano E' la direzione dei suoi bordi orizzontali. La seconda -- la
# verticale -- si potrebbe prendere in due modi:
#
#   a) dal MONTANTE: la verticale deve stare nel piano che passa per il centro
#      ottico e per il montante, ed essere ortogonale alla prima. Due vincoli
#      lineari su un vettore: la direzione esce univoca;
#   b) dall'ORIZZONTE del mare, di cui la verticale del mondo e' il polo.
#
# Si usa (a). Motivo: la (b) presuppone che il pavimento della stanza sia
# parallelo alla superficie del mare, cioe' che la nave non abbia ne' rollio ne'
# assetto nell'istante ripreso -- e in una ripresa che si vende come una
# traversata mossa e' proprio la cosa che non si puo' dare per buona.
#
# Cosi' l'orizzonte resta LIBERO, e diventa una verifica: al punto 5 si guarda
# di quanto il mare visto dal vano e' inclinato rispetto al pavimento della
# stanza. Il punto 6 dice quanto costerebbe la scelta (b).
# ===========================================================================
print('\n  4 - la posa')
F_PX = (H / 2) / math.tan(math.radians(FOV_V_GRADI) / 2)
CX, CY = W / 2.0, H / 2.0
K = np.array([[F_PX, 0, CX], [0, F_PX, CY], [0, 0, 1.0]])
KT = K.T
KINV = np.linalg.inv(K)
print('     focale DICHIARATA: %.1f px = %.1f mm equivalenti 35mm   (campo %.1f x %.1f gradi)'
      % (F_PX, F_PX / W * 36.0, 2 * math.degrees(math.atan(W / 2 / F_PX)), FOV_V_GRADI))


def norm(v):
    return v / np.linalg.norm(v)


# La direzione lungo la murata: il punto di fuga, riportato indietro.
eX = norm(KINV @ np.array([VP_VANO[0], VP_VANO[1], 1.0]))
if eX[2] < 0:
    eX = -eX                                   # deve andare VERSO il fondo
# La verticale: ortogonale a eX e dentro il piano del montante.
n_mont = KT @ L_MONT
eY = norm(np.cross(eX, n_mont))
if eY[1] > 0:
    eY = -eY                                   # in camera la y cresce verso il basso
eZ = np.cross(eX, eY)
if eZ[2] > 0:
    eZ = -eZ                                   # deve uscire dalla parete VERSO la camera
    eY = np.cross(eZ, eX)
R_SC = np.column_stack([eX, eY, eZ])           # stanza -> camera

# --- DOVE STA L'ORIGINE, cioe' lo spigolo basso del vano (montante x battuta)
#
# Deve stare sul piano del montante E su quello della battuta: e' l'incrocio
# delle due normali. Resta un fattore di scala, ed e' esattamente l'ambiguita'
# che la quarta informazione risolve.
n_batt = KT @ L_BATT
n_diag = KT @ L_DIAG
raggio_O = norm(np.cross(n_mont, n_batt))
if raggio_O[2] < 0:
    raggio_O = -raggio_O


def geometria(scala):
    """Tutta la stanza, data la distanza dell'origine dal centro ottico."""
    O = raggio_O * scala
    def altezza(l):
        n = KT @ l
        return float(-(n @ O) / (n @ eY))
    return O, altezza(L_DIAG), altezza(L_PAV), altezza(L_SOF)


# LA QUARTA INFORMAZIONE: 2,35 m fra moquette e soffitto.
_, _, y_pav1, y_sof1 = geometria(1.0)
SCALA = ALTEZZA_ARIA_M / (y_sof1 - y_pav1)
O_CAM, H_VANO, Y_PAV, Y_SOF = geometria(SCALA)
C_STANZA = -R_SC.T @ O_CAM                     # centro ottico in coordinate stanza
print('     scala fissata sui %.2f m di altezza d aria: origine a %.3f m dal centro ottico'
      % (ALTEZZA_ARIA_M, np.linalg.norm(O_CAM)))
print('     vano: alto %.3f m, davanzale %.3f m sopra il pavimento, architrave %.3f m sotto il soffitto'
      % (H_VANO, -Y_PAV, Y_SOF - H_VANO))

# --- QUANTO E' LARGO IL VANO: non si misura, si DELIMITA.
#
# Il montante di sinistra e' fuori quadro. L'unica cosa vera che si puo' dire e'
# QUANTO DEVE ESSERE LARGO ALMENO perche' il guscio copra il fotogramma: fino
# alla X in cui la parete esce dal bordo sinistro.
def x_al_bordo(y_stanza, u):
    """La X (lungo la murata) in cui il punto (X, y, 0) proietta sulla colonna u."""
    a = eX * 1.0
    p0 = O_CAM + eY * y_stanza
    # u = f*(px)/(pz) + cx  ->  (f*ax - (u-cx)*az) * X = (u-cx)*p0z - f*p0x
    num = (u - CX) * p0[2] - F_PX * p0[0]
    den = F_PX * a[0] - (u - CX) * a[2]
    return float(num / den)


X_BORDO_SX = min(x_al_bordo(0.0, 0.0), x_al_bordo(H_VANO, 0.0))
print('     largo almeno %.3f m per arrivare al bordo sinistro del fotogramma (il montante di sinistra e fuori quadro)'
      % (-X_BORDO_SX))

# --- DOVE LA FOTOGRAFIA SMETTE DI DIRE QUALCOSA
#
# La murata va verso il punto di fuga: piu' avanti si guarda, piu' metri vale un
# pixel. L'ultimo punto in cui il pavimento e' stato misurato davvero e' la
# colonna piu' a destra del punto 3, e li' si ferma il rilievo.
X_ULTIMO_MISURATO = x_al_bordo(Y_PAV, float(PAV[:, 0].max()))
print('     l ultimo punto del pavimento misurato sta a X = %.2f m; oltre, un pixel vale metri:'
      % X_ULTIMO_MISURATO)
RIGHELLO = []
for u in (750.0, 800.0, 850.0, 900.0, 950.0, 1000.0, 1020.0, 1035.0):
    x = x_al_bordo(Y_PAV, u)
    RIGHELLO.append((u, x, float(np.linalg.norm(R_SC @ np.array([x, Y_PAV, 0.0]) + O_CAM))))
print('        colonna  ' + '  '.join('%6.0f' % u for u, _, _ in RIGHELLO))
print('        X (m)    ' + '  '.join('%6.2f' % x for _, x, _ in RIGHELLO))
print('        da camera' + '  '.join('%6.2f' % d for _, _, d in RIGHELLO))

# --- ORIENTAMENTO
#
# Rispetto alla STANZA: X lungo la murata verso il fondo, Y in alto,
# Z fuori dalla parete verso l'interno.
asse = R_SC.T @ np.array([0.0, 0.0, 1.0])      # asse ottico in coordinate stanza
su_cam = R_SC.T @ np.array([0.0, -1.0, 0.0])   # l alto della camera, in stanza
IMBARDATA = math.degrees(math.atan2(asse[2], asse[0]))
BECCHEGGIO = math.degrees(math.asin(max(-1.0, min(1.0, asse[1]))))
destra = norm(np.cross(asse, np.array([0.0, 1.0, 0.0])))
su_piano = norm(np.cross(destra, asse))
ROLLIO = math.degrees(math.atan2(float(su_cam @ destra), float(su_cam @ su_piano)))
print('     orientamento nella stanza: imbardata %+.2f, beccheggio %+.2f, rollio %+.2f gradi'
      % (IMBARDATA, BECCHEGGIO, ROLLIO))
print('     centro ottico: %.3f m dalla parete del vano, %.3f m sopra il pavimento, %.3f m dal montante verso il fondo'
      % (C_STANZA[2], C_STANZA[1] - Y_PAV, C_STANZA[0]))

# --- E COME STA LA STANZA RISPETTO AL MARE (la verifica indipendente)
n_oriz = norm(KT @ L_ORIZZ)                    # normale del piano del mare, in camera
su_mare = -n_oriz if n_oriz[1] > 0 else n_oriz
DISLIVELLO = math.degrees(math.acos(max(-1.0, min(1.0, float(abs(su_mare @ eY))))))
# scomposto nei due assi della stanza: quanto rolla e quanto becheggia
comp_z = math.degrees(math.asin(max(-1.0, min(1.0, float(su_mare @ eZ)))))
comp_x = math.degrees(math.asin(max(-1.0, min(1.0, float(su_mare @ eX)))))
print('     il mare NON e parallelo al pavimento: %.2f gradi in tutto  (%.2f attorno alla murata, %.2f lungo la nave)'
      % (DISLIVELLO, comp_z, comp_x))


# ===========================================================================
# 5 - LA RIPROIEZIONE, CHE E' LA PARTE CHE CONTA
#
# Si prende il rettangolo del vano appena ricavato, lo si proietta con la posa
# appena ricavata, e si confronta col bordo che il punto 1 ha TROVATO NEI
# PIXEL -- non con le rette adattate. Confrontarlo con le rette sarebbe un giro
# a vuoto: le rette sono l'ingresso del calcolo.
# ===========================================================================
print('\n  5 - riproiezione')


def proietta(P):
    p = R_SC @ P + O_CAM
    return np.array([F_PX * p[0] / p[2] + CX, F_PX * p[1] / p[2] + CY])


ANGOLI = {
    'basso_destra': np.array([0.0, 0.0, 0.0]),
    'alto_destra': np.array([0.0, H_VANO, 0.0]),
    'basso_sinistra': np.array([X_BORDO_SX, 0.0, 0.0]),
    'alto_sinistra': np.array([X_BORDO_SX, H_VANO, 0.0]),
}
PROIETTATI = {k: proietta(v) for k, v in ANGOLI.items()}
for k, v in PROIETTATI.items():
    print('     spigolo %-15s -> (%7.1f, %7.1f) px' % (k, v[0], v[1]))


def retta_per_due(a, b):
    l = np.cross(np.array([a[0], a[1], 1.0]), np.array([b[0], b[1], 1.0]))
    return l


BORDI_MODELLO = (
    retta_per_due(PROIETTATI['alto_destra'], PROIETTATI['alto_sinistra']),     # diagonale
    retta_per_due(PROIETTATI['alto_destra'], PROIETTATI['basso_destra']),      # montante
    retta_per_due(PROIETTATI['basso_destra'], PROIETTATI['basso_sinistra']),   # battuta
)


def x_su_retta(l, y):
    return -(l[1] * y + l[2]) / l[0]


scarti_pixel = []
print('     contro il bordo TROVATO NEI PIXEL dal punto 1:')
for nome, l, righe in zip(NOMI, BORDI_MODELLO, SEGMENTI):
    d = np.abs(x_su_retta(l, righe.astype(float)) - BORDO[righe])
    scarti_pixel.append(d)
    print('        %-15s %3d righe   medio %.2f px   massimo %.2f px' % (nome, len(righe), d.mean(), d.max()))
TUTTI = np.concatenate(scarti_pixel)
ERR_RIPROIEZIONE = float(TUTTI.mean())
ERR_RIPROIEZIONE_MAX = float(TUTTI.max())
print('     ERRORE DI RIPROIEZIONE: %.2f px medi, %.2f massimi   (le rette adattate ne facevano %.2f)'
      % (ERR_RIPROIEZIONE, ERR_RIPROIEZIONE_MAX, ERR_RETTE))

# E il giro completo: modello contro rette d'ingresso. Qui il numero DEVE
# essere quasi zero, altrimenti c'e' un errore di convenzione nel calcolo.
andata_ritorno = []
for l, (m_, q_, _), righe in zip(BORDI_MODELLO, RETTE, SEGMENTI):
    yy = righe.astype(float)
    andata_ritorno.append(np.abs(x_su_retta(l, yy) - (m_ * yy + q_)))
ANDATA_RITORNO = float(np.concatenate(andata_ritorno).max())
print('     andata e ritorno (posa -> rettangolo -> proiezione -> rette d ingresso): %.4f px' % ANDATA_RITORNO)

if ANDATA_RITORNO > TETTO_ANDATA_RITORNO_PX:
    sys.exit('     LA CATENA E ROTTA: %.3f px sopra il tetto di %.2f. Un segno o una convenzione sbagliati.'
             % (ANDATA_RITORNO, TETTO_ANDATA_RITORNO_PX))
if ERR_RIPROIEZIONE > TETTO_RIPROIEZIONE_PX:
    sys.exit('     LA POSA NON RIPRODUCE IL VANO: %.2f px medi, tetto %.2f. Non arrotondarla: capire perche.'
             % (ERR_RIPROIEZIONE, TETTO_RIPROIEZIONE_PX))
# E IL TETTO CHE CONTA DAVVERO, perche' quello sopra e' generoso: la posa non
# deve costare NIENTE oltre al rumore con cui il bordo e' stato trovato. Se la
# riproiezione supera l'errore delle rette di mezzo pixel, il rettangolo 3D non
# e' quello che si vede.
if ERR_RIPROIEZIONE > ERR_RETTE + 0.5:
    sys.exit('     LA POSA COSTA %.2f px OLTRE IL RUMORE (%.2f contro %.2f): il rettangolo non e questo.'
             % (ERR_RIPROIEZIONE - ERR_RETTE, ERR_RIPROIEZIONE, ERR_RETTE))

# --- E le due rette che la posa NON usa: quanto sbagliano
print('     le due rette che la posa non ha usato, per sapere quanto scivola il guscio:')
print('        pavimento  %.2f px medi (%.2f max) sui %d punti misurati' % (E_PAV, EMAX_PAV, len(PAV)))
print('        soffitto   %.2f px medi (%.2f max) sui %d punti misurati' % (E_SOF, EMAX_SOF, len(SOF)))
if max(E_PAV, E_SOF) > 8.0:
    sys.exit('     una posa sola non tiene insieme vano e guscio: %.1f px sulle giunzioni.' % max(E_PAV, E_SOF))

# --- E CONTRO QUELLO CHE IL SITO SPEDISCE DAVVERO
#
# `public/salone/finestrone.png` e' la maschera montata in pagina, e
# `vano.json` dichiara di quanto rientra rispetto al vano misurato. Sono due
# artefatti scritti da un ALTRO strumento: se la posa li ritrova, non e' un
# giro a vuoto. Se un giorno la ripresa cambia e la maschera no, qui si vede.
SCARTO_MASCHERA = None
masc = RADICE / 'public' / 'salone' / 'finestrone.png'
vanojson = RADICE / 'public' / 'salone' / 'vano.json'
if masc.is_file() and vanojson.is_file():
    from PIL import Image
    rientro = json.loads(vanojson.read_text(encoding='utf-8'))['rientro_px']
    A = np.asarray(Image.open(masc).convert('L'), np.float32) / 255.0
    if A.shape == (H, W):
        d = []
        for l, righe in zip(BORDI_MODELLO, SEGMENTI):
            for y in righe[::4]:
                riga = A[int(y)]
                sopra = np.nonzero(riga > 0.5)[0]
                if len(sopra) == 0 or sopra.min() == 0:
                    continue
                d.append(abs(float(sopra.min()) - (x_su_retta(l, float(y)) - rientro)))
        SCARTO_MASCHERA = float(np.mean(d))
        print('     contro la maschera spedita (finestrone.png, rientro %d px dichiarato): %.2f px medi su %d righe'
              % (rientro, SCARTO_MASCHERA, len(d)))
        if SCARTO_MASCHERA > TETTO_RIPROIEZIONE_PX + rientro * 0.1:
            sys.exit('     la posa e la maschera spedita non parlano dello stesso vano: %.1f px' % SCARTO_MASCHERA)
    else:
        print('     la maschera spedita e %dx%d, non %dx%d: confronto saltato' % (A.shape[1], A.shape[0], W, H))

# --- LA PROVA CHE LA RIPRESA NON E' UNA PROSPETTIVA COERENTE
#
# Non si dichiara, si misura, perche' e' la cosa piu' importante che questo
# strumento ha da dire a chi costruisce il guscio. Si cercano le altre
# verticali della stanza -- i giunti dei pannelli, gli spigoli dei mobili -- e
# si guarda se hanno un punto di fuga in comune. Se ce l'avessero, la focale si
# potrebbe MISURARE invece che dichiarare.
print('     le altre verticali della stanza, per vedere se la focale si potrebbe misurare:')
GXI = np.zeros_like(GRI)
GXI[:, 1:-1] = GRI[:, 2:] - GRI[:, :-2]


def segui_verticale(y0, x0, segno):
    pt = []
    for verso in (-1, 1):
        x = float(x0)
        righe = range(y0, -1, -1) if verso < 0 else range(y0 + 1, H)
        for y in righe:
            xi0 = int(round(x))
            if xi0 < 3 or xi0 > W - 4:
                break
            f = GXI[y, xi0 - 3:xi0 + 4] * segno
            if f.max() < 6.0:
                break
            xi = xi0 - 3 + int(np.argmax(f))
            a, b, c = (GXI[y, xi - 1] * segno, GXI[y, xi] * segno, GXI[y, xi + 1] * segno)
            den = a - 2 * b + c
            d = (a - c) / (2 * den) if den else 0.0
            pt.append((y, xi + (d if abs(d) <= 1 else 0.0)))
    return np.array(sorted(pt)) if pt else np.zeros((0, 2))


grezze = []
for y0 in range(120, 620, 10):
    riga = GXI[y0]
    for x in range(int(RETTE[1][0] * y0 + RETTE[1][1]) + 10, W - 4):
        v = riga[x]
        if abs(v) > 14 and abs(v) >= abs(riga[x - 1]) and abs(v) > abs(riga[x + 1]):
            p = segui_verticale(y0, x, 1 if v > 0 else -1)
            if len(p) < 150:
                continue
            A = np.vstack([p[:, 0], np.ones(len(p))]).T
            s, *_ = np.linalg.lstsq(A, p[:, 1], rcond=None)
            if np.abs(A @ s - p[:, 1]).mean() > 0.8:
                continue
            grezze.append((float(s[0]), float(s[1]), len(p)))
VERTICALI = []
for t in sorted(grezze, key=lambda t: -t[2]):
    if all(abs(t[1] + t[0] * CY - (v[1] + v[0] * CY)) > 6 for v in VERTICALI):
        VERTICALI.append(t)
VERTICALI.append((RETTE[1][0], RETTE[1][1], len(SEGMENTI[1])))     # e il montante
gradi = [math.degrees(math.atan(m)) for m, _, _ in VERTICALI]
xx = np.array([m * CY + q for m, q, _ in VERTICALI])
mm = np.array([m for m, _, _ in VERTICALI])
# se convergessero, m sarebbe una funzione LINEARE di x: m = (Vx - x)/(Vy - cy)
A = np.vstack([xx, np.ones(len(xx))]).T
coef, resid, *_ = np.linalg.lstsq(A, mm, rcond=None)
sparso = float(np.abs(A @ coef - mm).std())
print('        %d verticali: inclinazioni da %+.2f a %+.2f gradi, sparse di %.4f attorno al ventaglio'
      % (len(VERTICALI), min(gradi), max(gradi), sparso))
if abs(coef[0]) > 1e-9:
    vy = CY + 1.0 / coef[0]
    print('        il ventaglio darebbe un punto di fuga verticale a y=%.0f; la dispersione da sola ne sposta'
          % vy)
    print('        il segno, quindi la focale che se ne ricava NON e un numero: e per questo che si dichiara.')
CONVERGONO = abs(coef[0]) > 3.0 * sparso / max(1.0, xx.std())
print('        convergono in modo utilizzabile? %s' % ('si' if CONVERGONO else 'NO'))

n_pav_stanza = np.cross(eX, eZ)
l_oriz_stanza = np.linalg.inv(KT) @ n_pav_stanza
sc = []
for x in (0.0, W / 2.0, W - 1.0):
    ys = -(l_oriz_stanza[0] * x + l_oriz_stanza[2]) / l_oriz_stanza[1]
    ym = A_OR * x + B_OR
    sc.append(ys - ym)
print('        orizzonte del mare contro orizzonte del pavimento: %+.1f / %+.1f / %+.1f px a sinistra, al centro, a destra'
      % tuple(sc))


# ===========================================================================
# 6 - LA SENSIBILITA'
#
# Un numero senza la sua sensibilita' non serve a chi costruisce il guscio.
# ===========================================================================
print('\n  6 - sensibilita')


def rifai(f_px=None, vp=None, l_mont=None, altezza_m=None):
    f_px = F_PX if f_px is None else f_px
    vp = VP_VANO if vp is None else vp
    l_mont = L_MONT if l_mont is None else l_mont
    altezza_m = ALTEZZA_ARIA_M if altezza_m is None else altezza_m
    k = np.array([[f_px, 0, CX], [0, f_px, CY], [0, 0, 1.0]])
    kt, kinv = k.T, np.linalg.inv(k)
    ex = norm(kinv @ np.array([vp[0], vp[1], 1.0]))
    if ex[2] < 0:
        ex = -ex
    ey = norm(np.cross(ex, kt @ l_mont))
    if ey[1] > 0:
        ey = -ey
    ez = np.cross(ex, ey)
    if ez[2] > 0:
        ez, ey = -ez, np.cross(-ez, ex)
    rO = norm(np.cross(kt @ l_mont, kt @ L_BATT))
    if rO[2] < 0:
        rO = -rO

    def alt(l, O):
        n = kt @ l
        return float(-(n @ O) / (n @ ey))
    O1 = rO
    s = altezza_m / (alt(L_SOF, O1) - alt(L_PAV, O1))
    O = rO * s
    C = -np.column_stack([ex, ey, ez]).T @ O
    a = np.column_stack([ex, ey, ez]).T @ np.array([0.0, 0.0, 1.0])
    # quanto lontano lungo la murata cade l ultima colonna in cui il pavimento
    # e stato misurato davvero: e la profondita del rilievo, ed e la cosa che
    # dipende di piu dalla focale
    u = float(PAV[:, 0].max())
    p0 = O + ey * alt(L_PAV, O)
    x_fondo = float(((u - CX) * p0[2] - f_px * p0[0]) / (f_px * ex[0] - (u - CX) * ex[2]))
    return {
        'f': f_px,
        'vano_alto': alt(L_DIAG, O),
        'dist_parete': float(C[2]),
        'alt_occhio': float(C[1] - alt(L_PAV, O)),
        'x_fondo': x_fondo - float(C[0]),
        'imbardata': math.degrees(math.atan2(a[2], a[0])),
        'beccheggio': math.degrees(math.asin(max(-1.0, min(1.0, a[1])))),
    }


BASE = rifai()
print('     (base) focale %.0f px: vano alto %.3f m, camera a %.3f m dalla parete, occhio a %.3f m, imbardata %+.2f, beccheggio %+.2f'
      % (BASE['f'], BASE['vano_alto'], BASE['dist_parete'], BASE['alt_occhio'], BASE['imbardata'], BASE['beccheggio']))

print('     - se l ORIZZONTE si sposta di 10 px: LA POSA NON CAMBIA DI NIENTE, perche la posa non lo usa.')
d_oriz = math.degrees(math.atan(10.0 / F_PX))
print('       cambia solo il dislivello dichiarato fra mare e pavimento, di %.2f gradi: cioe di quanto il' % d_oriz)
print('       guscio deve inclinare il mare 3D per farlo combaciare con quello della fotografia.')

# E QUANTO COSTEREBBE la scelta (b) del punto 4, cioe' prendere la verticale
# dall'orizzonte invece che dal montante. Si misura dove finisce il montante
# riproiettato, che e' l'unica cosa che si vede.
n_mare = norm(KT @ L_ORIZZ)                    # la verticale del MONDO, in camera
if n_mare[1] > 0:
    n_mare = -n_mare
eY_alt = norm(n_mare - float(n_mare @ eX) * eX)
if eY_alt[1] > 0:
    eY_alt = -eY_alt
ANG_ALT = math.degrees(math.acos(max(-1.0, min(1.0, float(eY_alt @ eY)))))
l_mont_alt = np.linalg.inv(KT) @ np.cross(O_CAM, eY_alt)
righe_m = SEGMENTI[1].astype(float)
SLITT_ALT = float(np.abs(-(l_mont_alt[1] * righe_m + l_mont_alt[2]) / l_mont_alt[0] - BORDO[SEGMENTI[1]]).mean())
print('       e se la verticale la desse l ORIZZONTE (la scelta scartata al punto 4) invece del montante, la')
print('       verticale ruoterebbe di %.2f gradi e il montante riproiettato sbaglierebbe %.1f px medi invece di %.2f.'
      % (ANG_ALT, SLITT_ALT, float(scarti_pixel[1].mean())))

ETICHETTE = (('altezza d aria +10%', {'altezza_m': ALTEZZA_ARIA_M * 1.10}),
             ('altezza d aria -10%', {'altezza_m': ALTEZZA_ARIA_M * 0.90}),
             ('focale +20%', {'f_px': F_PX * 1.20}),
             ('focale -20%', {'f_px': F_PX * 0.80}),
             ('punto di fuga 20 px piu su', {'vp': np.array([VP_VANO[0], VP_VANO[1] - 20])}),
             ('punto di fuga 20 px piu giu', {'vp': np.array([VP_VANO[0], VP_VANO[1] + 20])}))
print('     %-28s %8s %10s %8s %9s %11s %11s' % ('', 'vano', 'parete', 'occhio', 'fondo', 'imbardata', 'beccheggio'))
SENSIBILITA = {}
for etichetta, kw in ETICHETTE:
    v = rifai(**kw)
    riga = (100 * (v['vano_alto'] / BASE['vano_alto'] - 1),
            100 * (v['dist_parete'] / BASE['dist_parete'] - 1),
            100 * (v['alt_occhio'] / BASE['alt_occhio'] - 1),
            100 * (v['x_fondo'] / BASE['x_fondo'] - 1),
            v['imbardata'] - BASE['imbardata'],
            v['beccheggio'] - BASE['beccheggio'])
    SENSIBILITA[etichetta] = {'vano_pc': round(riga[0], 2), 'distanza_parete_pc': round(riga[1], 2),
                              'altezza_occhio_pc': round(riga[2], 2), 'profondita_fondo_pc': round(riga[3], 2),
                              'imbardata_gradi': round(riga[4], 3), 'beccheggio_gradi': round(riga[5], 3)}
    print('     - %-26s %+7.1f%% %+9.1f%% %+7.1f%% %+8.1f%% %+10.2f %+11.2f' % ((etichetta,) + riga))
print('       (vano = altezza del vano, parete = distanza della camera dalla murata, occhio = quota della camera')
print('        sul pavimento, fondo = quanto lontano lungo la murata cade l ultimo punto misurato)')


# ===========================================================================
# 7 - IL FILE
# ===========================================================================
GUSCIO = {
    'assi': ('X lungo la murata di sinistra, verso il fondo della stanza; '
             'Y in alto; Z fuori dalla parete, verso l interno. '
             'Origine sullo spigolo BASSO DESTRO del vano, cioe l incrocio '
             'fra montante e battuta.'),
    'pavimento_y_m': round(Y_PAV, 4),
    'soffitto_y_m': round(Y_SOF, 4),
    'altezza_aria_m': round(ALTEZZA_ARIA_M, 4),
    'murata_sinistra_z_m': 0.0,
    'murata_destra_z_m': round(LARGH_TUGA_M, 4),
    'paratia_fondo_x_m': None,
    'paratia_fondo_perche': ('NON determinata, e non e una pigrizia: la murata corre verso il punto '
                             'di fuga, e li un pixel vale metri. Vedi righello_di_profondita: la '
                             'colonna 900 sta a 4,6 m, la 1000 a 21,7, la 1035 a 103. Il pavimento e '
                             'letto con certezza fino a X = %.2f m; il solo limite superiore vero e '
                             'la fine della tuga, X = %.1f m.'
                             % (X_ULTIMO_MISURATO, LUNG_TUGA_M + C_STANZA[0])),
    'profondita_letta_x_m': round(X_ULTIMO_MISURATO, 3),
    'paratia_fondo_massimo_x_m': round(float(LUNG_TUGA_M + C_STANZA[0]), 3),
    'vano': {
        'z_m': 0.0,
        'x_da_m': round(X_BORDO_SX, 4),
        'x_a_m': 0.0,
        'y_da_m': 0.0,
        'y_a_m': round(H_VANO, 4),
        'nota': ('x_da_m NON e misurato: il montante di sinistra e fuori quadro. '
                 'E la X in cui la parete esce dal bordo sinistro del fotogramma, '
                 'cioe il MINIMO perche il guscio copra l inquadratura.'),
    },
}
POSA = {
    'sorgente': str(SORGENTE.relative_to(RADICE)).replace('\\', '/'),
    'fotogramma_px': [W, H],
    'misurato': {
        'rette_vano': {nome.replace(' ', '_'): {'m': round(m_, 6), 'q': round(q_, 3), 'errore_px': round(e_, 3)}
                       for nome, (m_, q_, e_) in zip(NOMI, RETTE)},
        'errore_medio_rette_px': round(ERR_RETTE, 3),
        'punto_di_fuga_vano_px': [round(VP_VANO[0], 2), round(VP_VANO[1], 2)],
        'orizzonte_mare': {'a': round(A_OR, 6), 'b': round(B_OR, 3),
                           'y_al_centro_px': round(A_OR * W / 2 + B_OR, 2),
                           'inclinazione_gradi': round(math.degrees(math.atan(A_OR)), 3),
                           'rms_px': round(RMS_OR, 3)},
        'giunzione_pavimento_forzata_sul_punto_di_fuga_px': round(E_PAV, 2),
        'giunzione_soffitto_forzata_sul_punto_di_fuga_px': round(E_SOF, 2),
    },
    'dichiarato': {
        'focale_px': round(F_PX, 2),
        'focale_mm_equiv35': round(F_PX / W * 36.0, 2),
        'da_dove': ('src/scena/index.js:81 new PerspectiveCamera(34, ...) — il sito monta la '
                    'fotografia perche riempia quel campo, quindi dichiara di fatto la lente '
                    'della sorgente. IL FILMATO NON LA DETERMINA: vedi la testa dello script.'),
        'punto_principale_px': [CX, CY],
        'scala_da': ('src/scena/nave.js TUGA.alt = 0.94 unita e src/scafo/ordinate.js:19 '
                     '1 unita = 2,5 m -> 2,35 m di altezza d aria fra moquette e soffitto'),
        'altezza_aria_m': round(ALTEZZA_ARIA_M, 4),
        'larghezza_tuga_m': round(LARGH_TUGA_M, 3),
        'lunghezza_tuga_m': LUNG_TUGA_M,
    },
    'camera': {
        'posizione_m': {'x_dal_montante': round(float(C_STANZA[0]), 4),
                        'y_sopra_il_pavimento': round(float(C_STANZA[1] - Y_PAV), 4),
                        'z_dalla_parete': round(float(C_STANZA[2]), 4)},
        'orientamento_gradi': {'imbardata': round(IMBARDATA, 3),
                               'beccheggio': round(BECCHEGGIO, 3),
                               'rollio': round(ROLLIO, 3)},
        'assetto_rispetto_al_mare_gradi': {
            'totale': round(DISLIVELLO, 3),
            'attorno_alla_murata': round(comp_z, 3),
            'lungo_la_nave': round(comp_x, 3),
            'nota': 'il pavimento della stanza e il mare visto dal vano NON sono paralleli in questa ripresa',
        },
        'rotazione_stanza_verso_camera': [[round(float(v), 6) for v in r] for r in R_SC],
    },
    'guscio_m': GUSCIO,
    'riproiezione': {
        'errore_medio_px': round(ERR_RIPROIEZIONE, 3),
        'errore_massimo_px': round(ERR_RIPROIEZIONE_MAX, 3),
        'contro': 'il bordo del vano trovato nei pixel, non le rette adattate',
        'andata_ritorno_px': round(ANDATA_RITORNO, 5),
        'tetto_px': TETTO_RIPROIEZIONE_PX,
        'pavimento_scarto_px': round(E_PAV, 2),
        'soffitto_scarto_px': round(E_SOF, 2),
        'orizzonte_scarto_px': [round(v, 1) for v in sc],
        'contro_la_maschera_spedita_px': None if SCARTO_MASCHERA is None else round(SCARTO_MASCHERA, 2),
    },
    'righello_di_profondita': {
        'cosa_e': ('a quale X lungo la murata corrisponde una colonna del fotogramma, al livello del '
                   'pavimento, e a che distanza dalla camera. Serve a vedere quanto in fretta la '
                   'profondita esplode avvicinandosi al punto di fuga: e li che il guscio smette di '
                   'essere misurato e comincia a essere inventato.'),
        'colonne': [[round(u, 1), round(x, 3), round(dd, 3)] for u, x, dd in RIGHELLO],
    },
    'sensibilita': {
        'orizzonte_10px': ('la posa non cambia: non lo usa. Cambia di %.2f gradi il dislivello '
                           'dichiarato fra mare e pavimento. Prendendo la verticale dall orizzonte '
                           'invece che dal montante, la verticale ruota di %.2f gradi e il montante '
                           'riproiettato passa da %.2f a %.1f px di errore.'
                           % (d_oriz, ANG_ALT, float(scarti_pixel[1].mean()), SLITT_ALT)),
        'variazioni_percentuali': SENSIBILITA,
        'legenda': ('vano = altezza del vano; parete = distanza della camera dalla murata; '
                    'occhio = quota della camera sul pavimento; fondo = quanto lontano lungo la '
                    'murata cade l ultimo punto misurato del pavimento.'),
    },
    'non_determinato': [
        'La LUNGHEZZA FOCALE. La ripresa e generata e non e una prospettiva coerente, e questo '
        'lo MISURA il punto 5: %d verticali della stanza, inclinate fra %+.2f e %+.2f gradi, '
        'sparse invece che a ventaglio -- convergono in modo utilizzabile? %s. Senza una seconda '
        'direzione ortogonale affidabile la focale non si misura: qui e DICHIARATA dal sito. '
        'Tutte le lunghezze in metri e soprattutto la PROFONDITA del rilievo dipendono da lei '
        '(vedi la sensibilita: la focale +/-20%% sposta il fondo del +/-20%%).'
        % (len(VERTICALI), min(gradi), max(gradi), 'si' if CONVERGONO else 'NO'),
        'Le rette longitudinali della stanza NON hanno un punto di fuga solo: il vano ne da uno, '
        'la giunzione col pavimento e quella col soffitto un altro, l orizzonte del mare un terzo. '
        'La posa combacia sul VANO -- il bordo che si vede -- e paga %.1f/%.1f px sulle giunzioni '
        'e %.0f px sull orizzonte. Una posa sola non puo combaciare ovunque su questa fotografia.'
        % (E_PAV, E_SOF, abs(sc[1])),
        'La LARGHEZZA DEL VANO. Il montante di sinistra e fuori quadro.',
        'La PARATIA DI FONDO. La murata si avvicina al punto di fuga: la sua fine cade dove '
        'un pixel vale metri. Il solo limite vero e la lunghezza della tuga, %.1f m.' % LUNG_TUGA_M,
        'IL VERSO. Se la murata col vano sia quella di sinistra e se il fondo sia a prua o a '
        'poppa, la fotografia non lo dice: e una scelta di chi monta il guscio.',
        'La MURATA OPPOSTA e il PAVIMENTO oltre la moquette visibile: fuori quadro. La murata '
        'di dritta qui e messa a %.2f m, che e il baglio della tuga dichiarato, non una misura.' % LARGH_TUGA_M,
    ],
}
FUORI = Path(__file__).resolve().parent / 'posa.json'
FUORI.write_text(json.dumps(POSA, indent=1, ensure_ascii=False), encoding='utf-8', newline='\n')
print('\n  scritto %s' % FUORI.relative_to(RADICE))
print('  errore di riproiezione %.2f px medi: e questo che dice quanto vale la posa, non la parola calibrata.'
      % ERR_RIPROIEZIONE)
