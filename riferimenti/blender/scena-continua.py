# -*- coding: utf-8 -*-
"""
B6 — L'ASSEMBLATORE. Importa e verifica. NON RICOSTRUISCE NIENTE.

    "/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P riferimenti/blender/scena-continua.py

Se un pezzo non entra, questo script lo dichiara e continua a verificare
quello che PUO' essere verificato col resto. Non aggiusta coordinate, non
sposta pezzi per far tornare un conto, non nasconde un'eccezione in un
try/except silenzioso.
"""
import bpy
import os
import sys
import traceback
import math

QUI = os.path.dirname(os.path.abspath(__file__))
if QUI not in sys.path:
    sys.path.insert(0, QUI)
import world_root  # il contratto — CONGELATO, si importa e basta

PARTS_DIR = os.path.join(QUI, 'parts')

# I pezzi non devono pulire la scena mentre li assemblo: vedi la clausola
# `SOTTO_ASSEMBLATORE` nel contratto. Senza, l'ultimo eseguito cancella i primi
# e l'assemblaggio dichiara «OK» su collezioni vuote.
world_root.SOTTO_ASSEMBLATORE = True

RISULTATI = {}   # nome -> ('OK' | 'FALLITO', dettaglio, namespace_exec_o_None)


def esegui_parte(nome_file):
    """Esegue lo script di un pezzo nel namespace globale corrente (bpy 'vive'
    nella scena aperta di Blender: gli script non tornano un oggetto Python,
    lasciano il loro effetto nella scena stessa, come sono scritti per fare
    quando girano via `blender -b -P`)."""
    path = os.path.join(PARTS_DIR, nome_file)
    with open(path, encoding='utf-8') as f:
        codice = f.read()
    # ─── I PEZZI GIRANO COME SE FOSSERO SOLI, e non e' una scorciatoia
    #
    # Con `__name__` diverso da `__main__` il blocco finale dei pezzi non parte:
    # `mechanism_bay.py` ha la propria costruzione dentro
    # `if __name__ == '__main__'`, quindi l'assemblatore lo eseguiva, otteneva
    # «OK», e la collezione restava VUOTA. Un OK su una collezione vuota e' la
    # forma peggiore di verde.
    #
    # La differenza fra «solo» e «assemblato» resta UNA, ed e' dichiarata nel
    # contratto: chi pulisce la scena. `world_root.SOTTO_ASSEMBLATORE` la
    # governa. Tutto il resto e' lo stesso identico percorso di codice, ed e' il
    # punto: un pezzo che si comporta diversamente sotto l'assemblatore e' un
    # pezzo che non e' stato provato dove conta.
    g = {'__name__': '__main__', '__file__': path}
    try:
        exec(compile(codice, path, 'exec'), g)
        return 'OK', '', g
    except SystemExit as e:
        return 'SYSTEMEXIT', str(e), g
    except Exception:
        return 'FALLITO', traceback.format_exc(), g


bpy.ops.wm.read_homefile(use_empty=True)
world_root.radice()

for nome_col, nome_file in [
    ('SALOON_SHELL', 'saloon.py'),
    ('MECHANISM_BAY/ENGINE_ROOM', 'mechanism_bay.py'),
    ('STAIR_CORRIDOR', 'corridor.py'),
]:
    stato, dettaglio, g = esegui_parte(nome_file)
    RISULTATI[nome_col] = (stato, dettaglio, g, nome_file)
    # ogni script che RIESCE a partire chiama world_root.radice()/collezione()
    # al suo interno, che ritrova invece di ricreare (world_root.py:569-586):
    # non serve e non si deve rifare qui. Si ririchiama radice() solo per
    # assicurare che WORLD_ROOT resti agganciato anche se lo script e' fallito
    # PRIMA di raggiungere quella riga.
    world_root.radice()

# ─── corridor.py NON si autocolloca ────────────────────────────────────────
# Verificato leggendo il file (comando esplicito nel mandato): scatola() in
# corridor.py e' chiamata con x0,x1,y0,y1,z0,z1 GREZZI (righe 239-283), non
# offsettati da TX_MONDO/TY_MONDO/TZ_MONDO — quelle tre variabili (riga 133)
# servono SOLO al referto stampato (APERTURA_LOCALE_TECNICO/APERTURA_SALONE),
# mai a una geometria. saloon.py invece si autocolloca (asserisce che la
# propria traslazione sia zero, riga 141) e mechanism_bay.py e' scritto per
# autocollocarsi (X_MB0 = MB_AGGANCIO[0], riga 240) ma quella chiave non
# esiste nel contratto oggi — vedi il fallimento qui sotto. Quindi
# l'assemblatore applica la traslazione SOLO a STAIR_CORRIDOR.
if RISULTATI['STAIR_CORRIDOR'][0] == 'OK':
    col = bpy.data.collections.get('STAIR_CORRIDOR')
    tx, ty, tz = world_root.traslazione('STAIR_CORRIDOR', 'gltf')
    for ob in col.objects:
        if ob.parent is None:
            ob.location.x += tx
            ob.location.y += ty
            ob.location.z += tz
    bpy.context.view_layer.update()

print('')
print('=' * 78)
print('B6 — ASSEMBLATORE: esito import dei tre pezzi')
print('=' * 78)
for nome, (stato, dettaglio, g, nome_file) in RISULTATI.items():
    print(f'  {nome:28s} <- {nome_file:20s} {stato}')
    if stato != 'OK':
        ultima_riga = [l for l in dettaglio.strip().splitlines() if l.strip()][-1]
        print(f'    causa: {ultima_riga}')

# ═══════════════════════════════════════════════════════════════════════════
# VERIFICA 1 — LE CUCITURE PASSANO (world_root.verifica_cucitura, non riscritta)
# ═══════════════════════════════════════════════════════════════════════════
print('')
print('-' * 78)
print('VERIFICA 1 — CUCITURE')
print('-' * 78)

esito_cuciture = {}

_, _, g_cor, _ = RISULTATI['STAIR_CORRIDOR']
if RISULTATI['STAIR_CORRIDOR'][0] == 'OK':
    larg_cor = g_cor['LARGHEZZA_CORRIDOIO']
    alt_cor = g_cor['ALTEZZA_LIBERA']
    try:
        world_root.verifica_cucitura('porta_locale_tecnico', 'corridor.py',
                                      larghezza_m=larg_cor, altezza_m=alt_cor)
        esito_cuciture['porta_locale_tecnico'] = ('VERDE', 'nessun conflitto')
        print('  porta_locale_tecnico: VERDE (nessun conflitto dichiarato)')
    except SystemExit as e:
        esito_cuciture['porta_locale_tecnico'] = ('ROSSO DICHIARATO', str(e))
        print('  porta_locale_tecnico: ROSSO DICHIARATO — world_root.verifica_cucitura'
              ' ha alzato SystemExit apposta. Il conflitto e\':')
        for riga in str(e).splitlines():
            print('    ' + riga)
else:
    print('  porta_locale_tecnico: NON VERIFICABILE ORA — corridor.py non e\' andato'
          ' a buon fine, non ho i suoi valori dichiarati.')

print('')
print('  Le altre cuciture dichiarate in world_root.CUCITURE, per stato:')
for nome, c in world_root.CUCITURE.items():
    print(f'    {nome:24s} {c["stato"]}')

# ═══════════════════════════════════════════════════════════════════════════
# VERIFICA 2 — NESSUNA COMPENETRAZIONE FRA COLLEZIONI
# ═══════════════════════════════════════════════════════════════════════════
print('')
print('-' * 78)
print('VERIFICA 2 — COMPENETRAZIONE FRA COLLEZIONI (bbox mondo, tolleranza cucitura)')
print('-' * 78)


def bbox_mondo_collezione(nome_col):
    col = bpy.data.collections.get(nome_col)
    if col is None:
        return None
    pts = []
    for ob in col.objects:
        if ob.type != 'MESH':
            continue
        mw = ob.matrix_world
        pts += [mw @ v.co for v in ob.data.vertices]
    if not pts:
        return None
    mn = tuple(min(p[i] for p in pts) for i in range(3))
    mx = tuple(max(p[i] for p in pts) for i in range(3))
    return mn, mx


bboxes = {}
for nome_col in ['SALOON_SHELL', 'STAIR_CORRIDOR']:
    b = bbox_mondo_collezione(nome_col)
    bboxes[nome_col] = b
    if b:
        print(f'  {nome_col:16s} bbox mondo (Blender X,Y,Z) reale: min={tuple(round(c,3) for c in b[0])}'
              f'  max={tuple(round(c,3) for c in b[1])}')
    else:
        print(f'  {nome_col:16s} NESSUNA GEOMETRIA REALE — la collezione e\' vuota'
              f' (il pezzo non e\' entrato: vedi esito import sopra).')

for nome_col in ['MECHANISM_BAY', 'ENGINE_ROOM']:
    b = bbox_mondo_collezione(nome_col)
    bboxes[nome_col] = b
    if b:
        print(f'  {nome_col:16s} bbox mondo reale: min={tuple(round(c,3) for c in b[0])}'
              f'  max={tuple(round(c,3) for c in b[1])}')
    else:
        print(f'  {nome_col:16s} NESSUNA GEOMETRIA REALE — la collezione e\' vuota'
              f' (mechanism_bay.py e\' fallito prima di costruire nulla: vedi sopra).')

presenti = {k: v for k, v in bboxes.items() if v is not None}
print('')
if len(presenti) < 2:
    print(f'  SOLO {len(presenti)} collezione/i con geometria REALE in questa sessione'
          f' ({", ".join(presenti.keys()) if presenti else "nessuna"}).')
    print('  Un confronto di compenetrazione richiede ALMENO due bbox reali da'
          ' confrontare: con meno di due non e\' un ESITO, e\' un\'assenza di dato.')
    print('  DICHIARATO: la compenetrazione fra SALOON_SHELL <-> STAIR_CORRIDOR,'
          ' SALOON_SHELL <-> MECHANISM_BAY/ENGINE_ROOM e STAIR_CORRIDOR <->'
          ' MECHANISM_BAY/ENGINE_ROOM NON E\' VERIFICABILE in questa esecuzione:'
          ' due dei tre pezzi non hanno costruito geometria (vedi VERIFICA 1'
          ' e l\'esito import). Non e\' un pass silenzioso: e\' un rosso dichiarato.')
else:
    nomi = list(presenti.keys())
    TOLLERANZA_CUCITURA_M = 0.15  # m — dell'ordine dello spessore parete dei pezzi (0.08-0.12)
    for i in range(len(nomi)):
        for j in range(i + 1, len(nomi)):
            a, b = nomi[i], nomi[j]
            (aMn, aMx), (bMn, bMx) = presenti[a], presenti[b]
            overlap = [min(aMx[k], bMx[k]) - max(aMn[k], bMn[k]) for k in range(3)]
            if all(o > 0 for o in overlap):
                vol_pen = overlap[0] * overlap[1] * overlap[2]
                minimo = min(overlap)
                esito = ('SI TOCCANO (entro tolleranza cucitura %.2f m)' % TOLLERANZA_CUCITURA_M
                          if minimo <= TOLLERANZA_CUCITURA_M else
                          'COMPENETRAZIONE — supera la tolleranza cucitura')
                print(f'  {a} <-> {b}: overlap XYZ = '
                      f'({overlap[0]:.4f}, {overlap[1]:.4f}, {overlap[2]:.4f}) m'
                      f'  min={minimo:.4f} m  ->  {esito}')
            else:
                print(f'  {a} <-> {b}: NESSUNA sovrapposizione bbox (separati)')

# ═══════════════════════════════════════════════════════════════════════════
# VERIFICA 3 — LA CURVA CAMERA NON ATTRAVERSA GEOMETRIA SOLIDA
# ═══════════════════════════════════════════════════════════════════════════
print('')
print('-' * 78)
print('VERIFICA 3 — CURVA CAMERA vs VOLUME LIBERO (controllo DEBOLE, dichiarato)')
print('-' * 78)
print('  NON e\' un test punto-dentro-mesh: non c\'e\' geometria reale sufficiente')
_zone = sum(1 for k in ('STAIR_CORRIDOR','SALOON_SHELL','MECHANISM_BAY') if bboxes.get(k))
print('  Zone con bbox MISURATO in questa sessione: %d su 3.' % _zone)
print('  Si campiona la curva di camera_path.py e si verifica solo che ogni punto')
print('  stia dentro un volume libero DICHIARATO per zona (bbox meno spessori),')
print('  costruito dai numeri del contratto e dei sorgenti letti (non misurato ora).')
print('  COSA NON COPRE: non rileva un oggetto solido reale dentro quel volume')
print('  (una paratia, un gradino, un macchinario) — solo se il PUNTO esce dal')
print('  guscio dichiarato della zona in cui dovrebbe trovarsi.')

# camera_path.py sta in riferimenti/blender/, non in parts/: percorso diretto.
CAMERA_PATH_FILE = os.path.join(QUI, 'camera_path.py')
with open(CAMERA_PATH_FILE, encoding='utf-8') as f:
    codice_cam = f.read()
g_cam = {'__name__': '__main__', '__file__': CAMERA_PATH_FILE}
try:
    exec(compile(codice_cam, CAMERA_PATH_FILE, 'exec'), g_cam)
    camera_ok = True
except Exception:
    camera_ok = False
    print('  camera_path.py E\' FALLITO ad eseguire:')
    print('    ' + traceback.format_exc().strip().splitlines()[-1])

if camera_ok:
    pos_at = g_cam['pos_at_arclength']
    N_CAMPIONI = 60
    campioni = [pos_at(i / (N_CAMPIONI - 1)) for i in range(N_CAMPIONI)]

    # ─── volumi liberi DICHIARATI per zona, in X mondo, con la loro fonte ───
    # zona MECHANISM_BAY/ENGINE_ROOM: X world_root.COLLOCAZIONI['MECHANISM_BAY']
    #   ['traslazione_x_derivata_m'] .. ['cucitura_mondo_m'][0]  (DERIVATO, contratto)
    # Y/Z: PAGLIOLO_Y/SOFFITTO_Y/BEAM SONO COSTANTI LETTE nel testo di
    #   mechanism_bay.py (righe 96-106), non misurate ora perche' lo script e'
    #   fallito prima di costruire la geometria — DICHIARATO come tale.
    X_MB0 = world_root.COLLOCAZIONI['MECHANISM_BAY']['traslazione_x_derivata_m']
    X_MB1 = world_root.COLLOCAZIONI['MECHANISM_BAY']['cucitura_mondo_m_gltf'][0]
    MB_Y0 = world_root.COLLOCAZIONI['MECHANISM_BAY']['cucitura_mondo_m_gltf'][1]  # PAGLIOLO_Y, -3.270
    MB_Y1 = MB_Y0 + 3.0 - 0.05  # +ALTEZZA_LIBERA (mechanism_bay.py:105) - SP_SOFFITTO margine
    MB_Z0 = world_root.COLLOCAZIONI['MECHANISM_BAY']['cucitura_mondo_m_gltf'][2] - 3.2 / 2 + 0.12
    MB_Z1 = world_root.COLLOCAZIONI['MECHANISM_BAY']['cucitura_mondo_m_gltf'][2] + 3.2 / 2 - 0.12

    # zona STAIR_CORRIDOR: X world -6.280..-0.800 (misurato REALMENTE sopra,
    #   bboxes['STAIR_CORRIDOR'], se disponibile — altrimenti dal contratto).
    if bboxes.get('STAIR_CORRIDOR'):
        cMn, cMx = bboxes['STAIR_CORRIDOR']
        COR_X0, COR_X1 = cMn[0], cMx[0]
        COR_Y0, COR_Y1 = cMn[1] + 0.08, cMx[1] - 0.08  # meno spessore solaio
        COR_Z0, COR_Z1 = cMn[2] + 0.12, cMx[2] - 0.12  # meno spessore parete
        fonte_cor = 'MISURATO in questa sessione (bbox reale, meno spessori dichiarati)'
    else:
        tx, ty, tz = world_root.traslazione('STAIR_CORRIDOR', 'gltf')
        COR_X0, COR_X1 = 0.0 + tx, 5.480 + tx
        COR_Y0, COR_Y1 = 0.0 + ty + 0.08, (2.10 + 2.00) + ty - 0.08
        COR_Z0, COR_Z1 = -0.425 + tz + 0.12, 0.425 + tz - 0.12
        fonte_cor = 'DICHIARATO dal contratto (corridor.py non ha costruito geometria)'

    # zona SALOON_SHELL: dal guscio misurato (world_root.CUCITURE['ingresso_salone']
    #   e ['vano_salone']), non da geometria reale (saloon.py e' fallito).
    SAL_X0 = world_root.CUCITURE['ingresso_salone']['x_m']
    SAL_X1 = 8.0  # 'FONDO_SCELTO_X' in saloon.py:111 (letto, non eseguito)
    SAL_Y0, SAL_Y1 = world_root.CUCITURE['ingresso_salone']['altezza_libera_m']
    SAL_Z0, SAL_Z1 = world_root.CUCITURE['ingresso_salone']['larghezza_libera_m']

    print('')
    print(f'  zona MECHANISM_BAY/ENGINE_ROOM  X [{X_MB0:.3f},{X_MB1:.3f}]'
          f'  Y [{MB_Y0:.3f},{MB_Y1:.3f}]  Z [{MB_Z0:.3f},{MB_Z1:.3f}]  (DICHIARATO)')
    print(f'  zona STAIR_CORRIDOR              X [{COR_X0:.3f},{COR_X1:.3f}]'
          f'  Y [{COR_Y0:.3f},{COR_Y1:.3f}]  Z [{COR_Z0:.3f},{COR_Z1:.3f}]  ({fonte_cor})')
    print(f'  zona SALOON_SHELL                X [{SAL_X0:.3f},{SAL_X1:.3f}]'
          f'  Y [{SAL_Y0:.3f},{SAL_Y1:.3f}]  Z [{SAL_Z0:.3f},{SAL_Z1:.3f}]  (DICHIARATO,'
          f' da world_root.CUCITURE["ingresso_salone"])')

    def zona_di(x):
        if X_MB0 <= x <= X_MB1:
            return 'MECHANISM_BAY', (X_MB0, X_MB1, MB_Y0, MB_Y1, MB_Z0, MB_Z1)
        if COR_X0 <= x <= COR_X1:
            return 'STAIR_CORRIDOR', (COR_X0, COR_X1, COR_Y0, COR_Y1, COR_Z0, COR_Z1)
        if SAL_X0 <= x <= SAL_X1:
            return 'SALOON_SHELL', (SAL_X0, SAL_X1, SAL_Y0, SAL_Y1, SAL_Z0, SAL_Z1)
        return None, None

    n_fuori_zona = 0
    n_fuori_volume = 0
    peggiore = None
    for p in campioni:
        x, y, z = float(p[0]), float(p[1]), float(p[2])
        nome_zona, vol = zona_di(x)
        if nome_zona is None:
            n_fuori_zona += 1
            continue
        x0, x1, y0, y1, z0, z1 = vol
        dentro_y = y0 <= y <= y1
        dentro_z = z0 <= z <= z1
        if not (dentro_y and dentro_z):
            n_fuori_volume += 1
            sc = max(y0 - y, y - y1, 0) + max(z0 - z, z - z1, 0)
            if peggiore is None or sc > peggiore[0]:
                peggiore = (sc, nome_zona, (x, y, z))

    print('')
    print(f'  campioni totali: {N_CAMPIONI}')
    print(f'  fuori da OGNI zona dichiarata (nessun ambiente la copre): {n_fuori_zona}')
    print(f'  dentro una zona ma fuori dal volume libero Y/Z dichiarato: {n_fuori_volume}')
    if peggiore:
        print(f'  peggiore: zona {peggiore[1]}, punto {tuple(round(c,4) for c in peggiore[2])}'
              f' (score fuori-volume {peggiore[0]:.4f} m)')
    if n_fuori_zona == 0 and n_fuori_volume == 0:
        print('  ESITO: VERDE (debole) — nessun campione esce dal volume libero dichiarato.')
    else:
        print('  ESITO: ROSSO — almeno un campione esce dal volume libero dichiarato'
              ' o non e\' coperto da nessuna zona.')

print('')
print('=' * 78)
print('FINE ASSEMBLATORE B6')
print('=' * 78)
