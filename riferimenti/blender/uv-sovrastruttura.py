"""
PASS PBR · passo 1 — L'ATLANTE UV UNICO DELLA SOVRASTRUTTURA

    "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" -b -P uv-sovrastruttura.py -- <cartella-di-lavoro>

Opzioni (ognuna con accanto il numero che l'ha decisa, nessuna scelta per gusto):

    --atlante N          lato dell'atlante in pixel, per il calcolo dei texel (2048)
    --margine-px P       gutter fra le isole, in pixel di quell'atlante (8)
    --forma F            AABB | CONVEX | CONCAVE, come il packer vede le isole
    --rapporto-max R     il cancello: densita' massima / minima ammessa (10)
    --banda-coperta M    lunghezza in metri delle bande in cui si taglia la
                         coperta (5,0). Perche' si taglia: §5
    --senza-pareggio     NON pareggia la densita' fra le isole: e' il primo
                         tentativo, quello che sfonda. Serve a stampare il
                         difetto, non a passare il cancello
    --senza-priorita     tutti i pesi a 1: la coperta non viene privilegiata
    --coperta-smart      srotola la coperta con smart_project come tutto il
                         resto. Serve a misurare cosa costa NON allinearla
    --senza-corsi        non scrive il secondo canale UV dei corsi del teak
    --senza-raster       salta la misura rasterizzata (piu' veloce)

═══════════════════════════════════════════════════════════════════════════
PERCHE' UN ATLANTE SOLO
═══════════════════════════════════════════════════════════════════════════

Stessa ragione dell'impianto: ogni mappa cotta e' un file da scaricare e una
`fetch` per fotogramma. La sovrastruttura sta in due nodi (`SOVRASTRUTTURA` e
`COPERTA`) ma per chi guarda e' una nave sola.

═══════════════════════════════════════════════════════════════════════════
LA GEOMETRIA NON SI RISCRIVE, SI RIUSA
═══════════════════════════════════════════════════════════════════════════

`glb-sovrastruttura.py` non si tocca: e' lui la verita' sulla forma. Qui se ne
esegue il sorgente in DUE tratti, attorno al montaggio:

    tratto A   dall'inizio fino a `# ═══ MONTAGGIO`       -> 132 pezzi separati
    (qui in mezzo: modificatori, srotolamento, pesi, impacchettamento)
    tratto B   dal montaggio fino alla riga dell'export   -> i due nodi uniti

Il montaggio va rieseguito e non saltato, perche' e' li' che i 132 pezzi
diventano `SOVRASTRUTTURA_MESH` e `COPERTA_MESH`: il .blend che esce ha la
STESSA struttura di nodi del GLB che viaggia, altrimenti la cottura del passo 2
lavorerebbe su un albero che nel sito non esiste.

Ma le misure si prendono PRIMA del montaggio, sui pezzi separati: dopo la
`join` ci sono due mesh sole e «densita' per pezzo» non vorrebbe piu' dire
niente. Che la `join` non abbia perso le UV non si suppone: si misura, §13.

Se una delle due righe di taglio sparisse, questo file si ferma con un errore
invece di srotolare una geometria a caso.

═══════════════════════════════════════════════════════════════════════════
LA DIFFERENZA CON L'IMPIANTO, ED E' TUTTA QUI
═══════════════════════════════════════════════════════════════════════════

L'impianto e' 14 nodi di metallo tornito, tutti guardati da vicino, tutti dello
stesso ordine di grandezza. La sovrastruttura no. Misurato prima di decidere
qualunque cosa (area 3D in metri quadri, spazio del mondo):

    COPERTA_TEAK          508,08 m2   38,4%     1 pezzo   <- meta' e' il sotto
    guscio SOVRA+HARDTOP  437,55 m2   33,0%     5 pezzi
    vetro                 180,67 m2   13,6%     2 pezzi
    MURATA                163,27 m2   12,3%     1 pezzo
    montanti               24,04 m2    1,8%    10 pezzi
    battagliola (inox)      9,17 m2    0,7%   106 pezzi   <- l'80% dei pezzi
    inox sovrastruttura     1,50 m2    0,1%     7 pezzi
    ────────────────────────────────────────────────────
    TOTALE               1324,28 m2           132 pezzi

Un solo numero cambia tutto: **1324 m2 contro il centinaio dell'impianto.** A
parita' di atlante la densita' va con l'inverso della radice dell'area, quindi
qui si parte attorno a 0,4 px/cm dove l'impianto stava a 3,06. E' il vincolo
dentro cui vanno prese tutte le decisioni che seguono: non c'e' nessun modo di
dare a un ponte di 40 metri la risoluzione di un riduttore cicloidale.

═══════════════════════════════════════════════════════════════════════════
§5 · LA COPERTA: PROIEZIONE PIANA, NON SMART_PROJECTION
═══════════════════════════════════════════════════════════════════════════

Il teak e' una superficie grande e piatta con CORSI PARALLELI, e i corsi sono
la sola cosa che ci si mettera' sopra. `smart_project` li tratterebbe come
qualunque altra superficie: sceglie l'orientamento che minimizza la
distorsione, che su un piano e' indifferente — quindi lo sceglie a caso. Un
corso srotolato in diagonale rispetto agli assi UV si scalinetta a ogni mipmap,
e la fuga di calafataggio (nera, 5 mm) diventa una scaletta grigia.

Qui la proiezione si scrive a mano, faccia per faccia, sull'asse dominante
della normale in coordinate di MONDO:

    normale ±Z (il ponte e il suo sotto)   ->  UV = (x, y)
    normale ±X (il bordo della coperta)    ->  UV = (y, z)
    normale ±Y (le teste a prua e a poppa) ->  UV = (x, z)

Con `y` che e' l'asse longitudinale della barca, i corsi restano PARALLELI A V
su tutto il ponte. Non e' `cube_project` di Blender perche' li' l'asse si
sceglie in spazio oggetto e non si controlla il taglio in bande; qui servono
entrambe le cose.

─── E POI LA COPERTA VA TAGLIATA IN BANDE, E NON E' UN GUSTO

Un'isola e' un rettangolo che deve stare dentro l'atlante. Il ponte e' lungo
40 m: a densita' d (px/cm) la sua isola e' lunga 4000·d pixel, quindi

    d_max = 2048 / 4000 = 0,51 px/cm

e non un texel di piu', QUALUNQUE COSA SI CHIEDA AL PACKER. Chiedendo di piu'
il packer non protesta: `scale=True` riscala TUTTE le isole finche' la piu'
lunga entra, cioe' fa pagare a tutta la nave la lunghezza del ponte. Non da'
errore, da' un atlante mediocre.

Quindi le facce ±Z si spezzano in bande da `--banda-coperta` metri lungo Y (5,0
di default: 8 bande su 40 m). Le cuciture che ne vengono attraversano il ponte,
e si vedono solo su cio' che e' COTTO nell'atlante (occlusione, curvatura), non
sui corsi, che vengono dal secondo canale ripetuto e non hanno cuciture. E'
anche il motivo per cui quel canale c'e'.

`ISOLA` in fondo alla tabella stampa il lato piu' lungo della piu' grande, in
pixel: e' il numero che dice se il taglio e' bastato. Misurato, `--coperta-smart`
contro il default:

                                  isola piu' grande      coperta    atlante
    smart_project, nessuna banda   20 x 1830 px (89%)   0,454 px/cm  58,00%
    piana + bande da 5 m          392 x  635 px (31%)   0,784 px/cm  62,52%

Quel `20 x 1830` e' il bordo della coperta — 40 m di lunghezza per 6 cm di
spessore — srotolato intero: una striscia che da sola occupa l'89% del lato
dell'atlante e che, per entrarci, obbliga il packer a rimpicciolire tutta la
nave. Nessun errore, nessun avviso: solo una coperta a 0,454 px/cm invece di
0,784.

═══════════════════════════════════════════════════════════════════════════
§8 · I PESI, E PERCHE' PROPRIO QUESTI
═══════════════════════════════════════════════════════════════════════════

Dopo il pareggio (§7) tutte le isole hanno la stessa densita'. I pesi sono
l'unico posto dove si dichiara che una superficie vale piu' di un'altra, e
ognuno costa a tutti gli altri: l'area d'atlante va col QUADRATO del peso.

    coperta/ponte    2,00   la superficie piu' guardata del modello
    coperta/sotto    0,30   il rovescio, appoggiato sullo scafo (vedi sotto)
    coperta/bordo    1,00
    vetro            0,45   e' uno specchio quasi nero, rugosita' 0,045: una
                            occlusione cotta sopra non la vede nessuno, e sono
                            180,67 m2, il 13,6% del modello
    tutto il resto   1,00

PERCHE' 2,00 E NON 4,00 SUL PONTE. Il ponte e' 251 m2 su 1324: alzarne il peso
alza soprattutto il denominatore. Con A = 251 (il ponte) e B = 1073 (il resto),
la densita' del ponte e' w/sqrt(A·w² + B), relativa a w=1:

    peso 1   1,00        peso 3   2,13
    peso 2   1,95        peso 4   2,20        peso ∞   2,31

Da 2 in su si comprano briciole facendole pagare a tutto il resto, che scala
con 1/sqrt del totale. Due prende l'84% del massimo teorico: non e' un gusto,
e' il punto in cui la curva si piega.

E poi il conto e' stato misurato, perche' un modello che prevede non e' una
misura. `--senza-priorita` contro il default, stessa forma e stesso margine:

                       senza priorita'   con priorita'
    ponte                0,423 px/cm      0,784 px/cm    +85%
    tutto il resto       0,423 px/cm      0,392 px/cm     -7,3%
    vetro                0,423 px/cm      0,176 px/cm    -58%
    sotto la coperta     0,423 px/cm      0,118 px/cm    -72%
    atlante occupato      56,41%           62,52%
    rapporto max/min       1,00             6,67

Il modello diceva +95% e -3%; misurato fa +85% e -7,3%. La differenza e' che
il modello teneva ferma l'occupazione, e l'occupazione invece SALE (56 -> 62%)
perche' un'isola grande e otto isole minuscole si incastrano meglio di nove
medie. Le previsioni restano scritte sopra perche' servono a scegliere l'ordine
di grandezza del peso; il numero che conta e' questo.

PERCHE' 0,30 SOTTO LA COPERTA. Le facce a normale -Z sono 251,39 m2 — il 19%
dell'area di TUTTO il modello — e sono il rovescio di una lastra appoggiata
sullo scafo. Lo scafo pero' in questa scena non c'e' (vive in `src/scafo`),
quindi nessuna misura di visibilita' fatta qui le vedrebbe coperte: e' una
DICHIARAZIONE, ed e' giusto che si legga come tale. 0,30 e non 0 perche' col
taglio del carter una parte di quel rovescio puo' entrare in quadro, e una
superficie senza texel e' peggio di una a bassa risoluzione.

═══════════════════════════════════════════════════════════════════════════
LE BATTAGLIOLE: LA PREMESSA ERA CHE SPRECANO MEZZO ATLANTE. NON E' VERO
═══════════════════════════════════════════════════════════════════════════

106 tubi — 28 candelieri (r 22 mm) e 78 draglie (r 7 mm) — cioe' l'80% dei
pezzi. Srotolati da `smart_project` diventano una striscia lunga e sottile
ciascuno, e la tentazione e' declassarli in blocco per liberare atlante.

SONO 9,17 m2 SU 1324, CIOE' LO 0,7%. Declassarli non restituisce niente:
l'area che occupano e' gia' trascurabile. E non restituisce niente nemmeno in
gutter, perche' il margine si dichiara in FRAZIONE dell'atlante — 8 px per
isola, ASSOLUTI, indipendenti da quanto e' grande l'isola. Rimpicciolire le
isole lascia il gutter dov'e' e peggiora soltanto il rapporto fra i due.

Quello che le battagliole costano davvero e' l'INGOMBRO, non l'area: la colonna
`ingombro%` misura per voce la somma dei rettangoli d'isola gonfiati del
margine — cioe' cio' che il packer deve incastrare davvero — e va letta contro
`uv%`. Misurato:

    draglie      0,22% di area UV,  4,38% di ingombro,  234 isole
    candelieri   0,11% di area UV,  2,69% di ingombro,  168 isole
    ───────────────────────────────────────────────────────────
    battagliola  0,33%              7,07%               402 isole

Sette per cento, non cinquanta. E quel sette per cento e' quasi tutto gutter:
402 volte otto pixel attorno a strisce larghe due. Le si potrebbe pagare solo
rinunciando al margine, cioe' al passo 2.

E c'e' un fatto che nessun peso puo' cambiare, ed e' il vero limite: a 0,4
px/cm la superficie laterale di una draglia srotolata e' larga DUE PIXEL
(circonferenza 4,4 cm). Sotto il blocco di compressione 4x4, sotto il gutter di
8 px. Qualunque cosa ci si cuocia sopra e' rumore. La risposta giusta a una
draglia non e' piu' atlante: e' che una fune d'acciaio liscia da 14 mm non ha
niente da cuocere. Restano a densita' comune perche' costano meno di quanto
costerebbe qualunque trattamento speciale.

═══════════════════════════════════════════════════════════════════════════
IL SECONDO CANALE UV DEL TEAK, E PERCHE' L'ATLANTE DA SOLO NON BASTA
═══════════════════════════════════════════════════════════════════════════

Una fuga di calafataggio e' larga 5 mm. Per leggerla servono ~2 px, cioe'
almeno 4 px/cm. L'atlante da 2048 su questo modello ne da' meno di uno, e non
e' un difetto dell'impacchettamento: 1324 m2 in 2048x2048 fanno ~0,4 px/cm, e
per arrivare a 4 servirebbe un atlante da 20.000 px.

Quindi i corsi NON possono venire dall'atlante — e non e' un problema, perche'
un corso di teak e' un motivo RIPETUTO: gli serve una texture piastrellata, non
un'impronta unica. Il secondo canale `TEAK_CORSI` porta le coordinate in metri
(1 unita' UV = 1 metro; u trasversale, v longitudinale come i corsi), continue
e senza cuciture, cosi' la texture dei corsi si ripete a scala reale mentre
l'atlante resta libero per cio' che e' unico: occlusione, curvatura, normale.

Il canale attivo e da render resta `UVMap`. Dopo la `join` il canale esiste su
tutto il nodo `COPERTA` con valori nulli fuori dal teak (e' Blender a
riempirli): lo usa solo il materiale del teak. Si spegne con `--senza-corsi`.

═══════════════════════════════════════════════════════════════════════════
COSA MISURA, E SU COSA CORRE IL CANCELLO
═══════════════════════════════════════════════════════════════════════════

    px/cm = lato_atlante * sqrt(area_uv / area_3d_in_m2) / 100

Il cancello di `docs/15` e' il rapporto fra densita' massima e minima. Qui non
corre sui 132 oggetti ma sulle VOCI: `COPERTA_TEAK` da sola vale il 38%
dell'area e contiene sia la superficie privilegiata sia quella declassata, e
una media fra le due nasconderebbe esattamente cio' che il cancello deve
vedere. Quindi la coperta si presenta in tre voci (ponte, sotto, bordo) e il
rapporto si calcola su quelle: e' una soglia piu' STRETTA, non piu' larga.
"""
import bpy, sys, os, math, time, shutil, subprocess
from mathutils import Vector

T0 = time.time()

# ─── argomenti ────────────────────────────────────────────────────────────
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
QUI = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(QUI, '..', '..'))
USCITE = os.path.join(QUI, 'uscite')


def opz(nome, dflt, tipo=float):
    return tipo(argv[argv.index(nome) + 1]) if nome in argv else dflt


# Le opzioni CON valore vanno dichiarate, altrimenti il valore finisce fra i
# posizionali. Non e' teoria: `-- --forma AABB` ha fatto cercare il cavallino
# in una cartella chiamata `AABB`, e l'errore e' arrivato da `node`, non da
# qui — cioe' dal posto sbagliato per capirlo.
CON_VALORE = {'--atlante', '--margine-px', '--rapporto-max', '--forma', '--banda-coperta'}
posizionali = []
salta = False
for i, a in enumerate(argv):
    if salta:
        salta = False
        continue
    if a.startswith('--'):
        salta = a in CON_VALORE
        continue
    posizionali.append(a)
LAVORO = posizionali[0] if posizionali else os.path.join(USCITE, 'sovrastruttura-lavoro')
ATLANTE = opz('--atlante', 2048, int)
MARGINE_PX = opz('--margine-px', 8.0)
RAPPORTO_MAX = opz('--rapporto-max', 10.0)
FORMA = opz('--forma', 'AABB', str)
BANDA_M = opz('--banda-coperta', 5.0)
PAREGGIO = '--senza-pareggio' not in argv
PRIORITA = '--senza-priorita' not in argv
COPERTA_PIANA = '--coperta-smart' not in argv
CORSI = '--senza-corsi' not in argv
RASTER = '--senza-raster' not in argv

PESO = {
    'COPERTA_TEAK/ponte': 2.00,
    'COPERTA_TEAK/sotto': 0.30,
    'COPERTA_TEAK/bordo': 1.00,
    'VETRO_SUPERIORE': 0.45,
    'VETRO_FLY': 0.45,
} if PRIORITA else {}

# ─── §1 · il cavallino vero, che arriva da JavaScript ─────────────────────
# `glb-sovrastruttura.py` legge `<cartella>/coperta.json` e senza quello non
# costruisce niente. Quel file non si riscrive in Python (il perche' sta in
# testa a `strumenti/esporta-coperta.mjs`): si rigenera.
os.makedirs(LAVORO, exist_ok=True)
COPERTA_JSON = os.path.join(LAVORO, 'coperta.json')
GENERATORE = os.path.join(REPO, 'strumenti', 'esporta-coperta.mjs')
if not os.path.exists(COPERTA_JSON):
    node = shutil.which('node')
    if not node:
        raise SystemExit(
            'ERRORE: manca %s e non trovo `node` per generarlo.\n'
            'Eseguilo a mano:  node strumenti/esporta-coperta.mjs "%s"'
            % (COPERTA_JSON, COPERTA_JSON))
    r = subprocess.run([node, GENERATORE, COPERTA_JSON], cwd=REPO)
    if r.returncode != 0 or not os.path.exists(COPERTA_JSON):
        raise SystemExit('ERRORE: esporta-coperta.mjs non ha prodotto %s' % COPERTA_JSON)
    print('COPERTA   rigenerata da src/scafo/ordinate.js -> %s' % COPERTA_JSON)
else:
    print('COPERTA   %s (gia\' presente)' % COPERTA_JSON)

# ─── §2 · la geometria, presa da glb-sovrastruttura.py senza modificarlo ──
SORGENTE = os.path.join(QUI, 'glb-sovrastruttura.py')
TAGLIO_MONTAGGIO = '# \u2550\u2550\u2550 MONTAGGIO'
TAGLIO_EXPORT = "percorso = os.path.join(FUORI, 'sovrastruttura.glb')"
sorgente = open(SORGENTE, encoding='utf-8').read()
for t in (TAGLIO_MONTAGGIO, TAGLIO_EXPORT):
    if t not in sorgente:
        raise SystemExit(
            "ERRORE: in glb-sovrastruttura.py non c'e' piu' la riga di taglio %r.\n"
            "Non srotolo una geometria che non so dove finisce: aggiorna i TAGLI." % t)
i_mont = sorgente.index(TAGLIO_MONTAGGIO)
i_exp = sorgente.index(TAGLIO_EXPORT)

GEO = {'__name__': 'geometria_sovrastruttura', '__file__': SORGENTE}
argv_vero = list(sys.argv)
sys.argv = ['blender', '-b', '-P', SORGENTE, '--', LAVORO]
print('GEOMETRIA da glb-sovrastruttura.py, tratto A: righe 1-%d di %d'
      % (sorgente[:i_mont].count('\n'), sorgente.count('\n')))
exec(compile(sorgente[:i_mont], SORGENTE, 'exec'), GEO)
sys.argv = argv_vero

REGISTRO = GEO['pezzi']                      # {nodo: [oggetti]}
pezzi = [o for o in bpy.data.objects if o.type == 'MESH']
pezzi.sort(key=lambda o: o.name)
if not pezzi:
    raise SystemExit('ERRORE: nessuna mesh dopo la costruzione della geometria.')
nodo_di = {}
for nodo, lista in REGISTRO.items():
    for o in lista:
        nodo_di[o.name] = nodo
orfani = [o.name for o in pezzi if o.name not in nodo_di]
if orfani:
    raise SystemExit('ERRORE: %d mesh non registrate in nessun nodo: %s'
                     % (len(orfani), orfani[:5]))

# ─── §3 · i modificatori applicati PRIMA di srotolare ─────────────────────
# Le UV si scrivono sui loop che ESISTONO. `glb-sovrastruttura.py` esporta con
# `export_apply=True`, cioe' applica gli smussi al momento dell'export:
# srotolare prima vorrebbe dire dare le UV alle facce grezze e spedirne altre.
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


# ─── §4 · chi e' cosa ─────────────────────────────────────────────────────
# I pezzi costruiti con le primitive di Blender si chiamano `Cube.007`, e una
# tabella di densita' con dentro `Cube.007` non si legge. La classe si deduce
# dal nodo e dal materiale — gli unici due dati che il costruttore dichiara
# davvero — e il raggio distingue le draglie dai candelieri.
def bbox_locale(o):
    xs = [v.co for v in o.data.vertices]
    return sorted((max(c[i] for c in xs) - min(c[i] for c in xs)) for i in range(3))


def classifica(o):
    nodo = nodo_di[o.name]
    m = o.data.materials[0].name if o.data.materials else ''
    d = bbox_locale(o)
    if m == 'sovra_teak':
        return 'COPERTA_TEAK'
    if m == 'sovra_vetro' or o.name.startswith('SOVRA_') or o.name in ('HARDTOP', 'MURATA'):
        return o.name
    if m == 'sovra_montante':
        return 'MONTANTE'
    if m == 'sovra_inox':
        if nodo == 'COPERTA':
            return 'DRAGLIA' if d[0] < 0.030 else 'CANDELIERE'
        return 'ALBERO' if d[0] > 0.10 else 'PUNTONE_HARDTOP'
    return 'ANTENNA'


classe_di = {}
contatore = {}
for o in pezzi:
    c = classifica(o)
    classe_di[o.name] = c
    contatore[c] = contatore.get(c, 0) + 1
print('CLASSI    ' + ', '.join('%s x%d' % (k, v) for k, v in
                               sorted(contatore.items(), key=lambda x: -x[1])))

# ─── §5 · lo srotolamento ─────────────────────────────────────────────────
TEAK = [o for o in pezzi if classe_di[o.name] == 'COPERTA_TEAK']
ALTRI = [o for o in pezzi if classe_di[o.name] != 'COPERTA_TEAK']

voce_di = {}          # (nome oggetto, indice faccia) -> voce


def proietta_coperta(o, banda):
    """Proiezione ortogonale sugli assi del MONDO, faccia per faccia, con le
    facce del ponte spezzate in bande lungo Y. Il perche' e' in testa al file
    (§5): i corsi devono restare paralleli a V, e un'isola lunga 40 m non entra
    in un atlante da 2048 senza far riscalare tutta la nave."""
    me = o.data
    if not me.uv_layers:
        me.uv_layers.new(name='UVMap')
    uv = me.uv_layers.active.data
    M = o.matrix_world
    R = M.to_3x3()
    co = [M @ v.co for v in me.vertices]
    y0 = min(c.y for c in co)
    gruppi = {}
    for pi, p in enumerate(me.polygons):
        n = (R @ p.normal).normalized()
        ax = max(range(3), key=lambda k: abs(n[k]))
        cy = sum(co[k].y for k in p.vertices) / len(p.vertices)
        banda_i = int((cy - y0) // banda)
        if ax == 2:
            voce = 'COPERTA_TEAK/ponte' if n.z > 0 else 'COPERTA_TEAK/sotto'
        else:
            voce = 'COPERTA_TEAK/bordo'
        # il gruppo separa le isole: due gruppi diversi finiscono in due punti
        # diversi dello spazio UV, quindi il packer li vede come isole distinte
        g = (voce, ax, 1 if n[ax] > 0 else -1, banda_i)
        if g not in gruppi:
            gruppi[g] = len(gruppi)
        ox = gruppi[g] * 200.0
        for li in p.loop_indices:
            c = co[me.loops[li].vertex_index]
            if ax == 2:
                u, v = c.x, c.y
            elif ax == 0:
                u, v = c.y, c.z
            else:
                u, v = c.x, c.z
            uv[li].uv = (u + ox, v)
        voce_di[(o.name, pi)] = voce
    return len(gruppi)


if COPERTA_PIANA:
    for o in TEAK:
        lung = (max(v.co.y for v in o.data.vertices)
                - min(v.co.y for v in o.data.vertices))
        n = proietta_coperta(o, BANDA_M)
        print('COPERTA   proiezione piana allineata ai corsi: %d isole '
              '(bande da %.1f m su %.1f m di nave)' % (n, BANDA_M, lung))
else:
    ALTRI = pezzi
    TEAK = []
    print('COPERTA   srotolata con smart_project come tutto il resto (--coperta-smart)')

# `angle_limit` a 66 gradi e' il valore di fabbrica: piu' basso spezza i tubi
# della battagliola in fettine, piu' alto stira gli smussi.
# `island_margin` a ZERO di proposito: il margine vero lo mette l'unico
# impacchettamento che conta, quello finale. Metterlo anche qui vorrebbe dire
# pagarlo due volte, perche' il pack successivo NON ricompatta.
for o in ALTRI:
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.0,
                             area_weight=0.0, correct_aspect=True,
                             scale_to_bounds=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    for pi in range(len(o.data.polygons)):
        voce_di[(o.name, pi)] = classe_di[o.name]
print('SROTOLAMENTO %d pezzi a proiezione automatica + %d a proiezione piana (%.0f s)'
      % (len(ALTRI), len(TEAK), time.time() - T0))

# ─── §7 · il pareggio della densita' ──────────────────────────────────────
#
# `smart_project` normalizza OGNI oggetto dentro il proprio quadrato unitario:
# una draglia da 7 mm esce con la stessa area UV della coperta da 40 m, e
# l'impacchettamento — che scala tutte le isole dello stesso fattore — se la
# porta dietro intatta. `average_islands_scale` dice alle UV quanto misurano i
# pezzi nel mondo; da li' in poi il pack puo' solo moltiplicare per una
# costante. Le isole della coperta ci arrivano gia' isometriche (una proiezione
# piana di una superficie piana non distorce), quindi la riga non le cambia.
bpy.ops.object.select_all(action='DESELECT')
for o in pezzi:
    o.select_set(True)
bpy.context.view_layer.objects.active = pezzi[0]
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.select_all(action='SELECT')
if PAREGGIO:
    bpy.ops.uv.average_islands_scale()
    print('PAREGGIO  densita\' fra le isole: fatto')
else:
    print('PAREGGIO  densita\' fra le isole: SALTATO (--senza-pareggio)')
bpy.ops.object.mode_set(mode='OBJECT')


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


# ─── §8 · i pesi, applicati per isola ─────────────────────────────────────
# Si scala attorno al baricentro dell'isola e non attorno all'origine: il pack
# ricolloca comunque, ma un'isola spedita lontano dall'origine rende illeggibile
# qualunque cosa si guardi prima del pack.
if PESO:
    toccate = {}
    for o in pezzi:
        _, per_faccia, trova = isole(o)
        uv = o.data.uv_layers.active.data
        gruppi = {}
        for pi, p in enumerate(o.data.polygons):
            gruppi.setdefault(trova(per_faccia[pi]), []).append(pi)
        for r, facce_g in gruppi.items():
            voce = voce_di[(o.name, facce_g[0])]
            k = PESO.get(voce, 1.0)
            if abs(k - 1.0) < 1e-9:
                continue
            loops = set()
            for pi in facce_g:
                loops.update(o.data.polygons[pi].loop_indices)
            cx = sum(uv[li].uv[0] for li in loops) / len(loops)
            cy = sum(uv[li].uv[1] for li in loops) / len(loops)
            for li in loops:
                u, v = uv[li].uv
                uv[li].uv = (cx + (u - cx) * k, cy + (v - cy) * k)
            toccate[voce] = toccate.get(voce, 0) + 1
    for v, n in sorted(toccate.items()):
        print('PRIORITA\' %-22s peso %.2f su %d isole' % (v, PESO[v], n))
else:
    print('PRIORITA\' tutti i pesi a 1 (--senza-priorita)')

# ─── §9 · UN solo impacchettamento, su tutti i pezzi insieme ──────────────
#
# Il margine si dichiara in FRAZIONE dello spazio UV, non in "scaled": in
# "scaled" dipende dalla dimensione dell'isola, e con centinaia di isole
# minuscole come quelle della battagliola meta' finirebbe con mezzo pixel di
# gutter. La compressione e i mipmap sono ciechi alla dimensione dell'isola:
# gli serve una distanza in PIXEL, uguale per tutti.
#
# Otto pixel e non sedici, come sull'impianto e per gli stessi due vincoli: un
# blocco di compressione e' 4x4, quindi due isole non devono condividerne uno
# (>= 4 px); e a mipmap 2 restano 2 px, che e' il raggio di un filtro
# bilineare. Quanto regga davvero lo misura il §11, non questo commento.
#
# ─── AABB E NON CONVEX, CIOE' IL CONTRARIO DELL'IMPIANTO
#
# Sull'impianto `CONVEX` era la scelta giusta: incastra meno di `CONCAVE` ma
# consegnava il margine per intero, e su questo file era il default ereditato.
# Qui il primo giro e' uscito col CANCELLO ROSSO. Misurato sullo stesso
# assieme, cambiando SOLO questa parola:
#
#     forma     atlante   ingombro   ponte         bleed sicuro misurato
#     CONVEX     63,49%    91,06%    0,790 px/cm      6 px   <- rosso
#     AABB       62,52%    89,85%    0,784 px/cm      8 px   <- il margine chiesto
#
# Un punto di occupazione e lo 0,8% di densita' sul ponte, per due pixel di
# gutter: si compra.
#
# La spiegazione probabile — e non l'ho verificata isola per isola, quindi vale
# come ipotesi e non come misura — e' geometrica. `CONVEX` incastra inviluppi
# convessi RUOTATI, quindi due isole possono stare a 16 px euclidei ma in
# diagonale; un bleed pero' si propaga agli 8 vicini, cioe' in distanza di
# Chebyshev, dove quella stessa diagonale misura 16/sqrt(2) = 11,3 px, la meta'
# dei quali fa 6. Non sarebbe il packer a disobbedire: sarebbe la richiesta a
# essere scritta in una metrica diversa da quella in cui il difetto si propaga.
# Con `AABB` i corridoi fra le isole sono paralleli agli assi e le due distanze
# tendono a coincidere. Con 572 isole, di cui 402 di battagliola, l'incastro
# fine non comprava comunque quasi niente.
#
# ─── MA `AABB` NON E' UNA GARANZIA, ED E' IMPORTANTE
#
# Lo stesso `AABB`, con i pesi tolti (`--senza-priorita`), misura 7 px e il
# cancello torna rosso. Cambiando i pesi cambia la disposizione, e con la
# disposizione cambia il gutter reale: NESSUNA scelta di forma promette il
# margine, la promette solo la misura. Per questo il §11 gira a ogni
# esecuzione e non e' un controllo che si salta quando si ha fretta.
margine = MARGINE_PX / ATLANTE
bpy.ops.object.select_all(action='DESELECT')
for o in pezzi:
    o.select_set(True)
bpy.context.view_layer.objects.active = pezzi[0]
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


# ─── §10 · le misure ──────────────────────────────────────────────────────
def area_3d_faccia(o, p):
    """Area in METRI QUADRI nello spazio del MONDO. Non si usa `polygon.area`:
    quella e' in coordinate locali e un oggetto scalato mentirebbe."""
    M = o.matrix_world
    vs = [M @ o.data.vertices[i].co for i in p.vertices]
    n = Vector((0.0, 0.0, 0.0))
    for k in range(len(vs)):
        n += vs[k].cross(vs[(k + 1) % len(vs)])
    return n.length * 0.5


def area_uv_faccia(o, p):
    uv = o.data.uv_layers.active.data
    ls = p.loop_indices
    n = len(ls)
    s = 0.0
    for k in range(n):
        u1, v1 = uv[ls[k]].uv
        u2, v2 = uv[ls[(k + 1) % n]].uv
        s += u1 * v2 - u2 * v1
    return abs(s) * 0.5


conti = {}          # voce -> [area3, area_uv, isole, ingombro]
identita = {}
isola_voce = {}
tot_uv_prima_join = 0.0
piu_grande = (0.0, '', 0.0, 0.0)
for o in pezzi:
    _, per_faccia, trova = isole(o)
    identita[o.name] = (per_faccia, trova)
    uv = o.data.uv_layers.active.data
    bbox = {}
    for pi, p in enumerate(o.data.polygons):
        voce = voce_di[(o.name, pi)]
        c = conti.setdefault(voce, [0.0, 0.0, 0, 0.0])
        c[0] += area_3d_faccia(o, p)
        au = area_uv_faccia(o, p)
        c[1] += au
        tot_uv_prima_join += au
        r = trova(per_faccia[pi])
        isola_voce[(o.name, r)] = voce
        b = bbox.setdefault(r, [9e9, 9e9, -9e9, -9e9])
        for li in p.loop_indices:
            u, v = uv[li].uv
            b[0] = min(b[0], u)
            b[1] = min(b[1], v)
            b[2] = max(b[2], u)
            b[3] = max(b[3], v)
    for r, b in bbox.items():
        voce = isola_voce[(o.name, r)]
        c = conti[voce]
        c[2] += 1
        c[3] += (b[2] - b[0] + 2 * margine) * (b[3] - b[1] + 2 * margine)
        lato = max(b[2] - b[0], b[3] - b[1]) * ATLANTE
        if lato > piu_grande[0]:
            piu_grande = (lato, voce, (b[2] - b[0]) * ATLANTE, (b[3] - b[1]) * ATLANTE)

print('')
print('%-24s %9s %8s %10s %7s %9s' %
      ('voce', 'area m2', 'uv%', 'ingombro%', 'isole', 'px/cm'))
print('-' * 72)
righe = []
tot_uv = tot_3d = tot_ing = 0.0
tot_isole = 0
for voce, (a3, au, ni, ing) in sorted(conti.items(), key=lambda x: -x[1][1]):
    dens = ATLANTE * math.sqrt(au / a3) / 100.0 if a3 > 0 else 0.0
    righe.append((voce, a3, au, ni, dens, ing))
    tot_3d += a3
    tot_uv += au
    tot_ing += ing
    tot_isole += ni
    print('%-24s %9.4f %7.2f%% %9.2f%% %7d %9.3f' % (voce, a3, au * 100, ing * 100, ni, dens))
print('-' * 72)
print('%-24s %9.4f %7.2f%% %9.2f%% %7d' % ('TOTALE', tot_3d, tot_uv * 100, tot_ing * 100, tot_isole))

vive = [r for r in righe if r[4] > 0]
alto = max(vive, key=lambda r: r[4])
basso = min(vive, key=lambda r: r[4])
rapporto = alto[4] / basso[4]
print('')
print('DENSITA\'  max %.3f px/cm  (%s)' % (alto[4], alto[0]))
print('DENSITA\'  min %.3f px/cm  (%s)' % (basso[4], basso[0]))
print('RAPPORTO  %.2f   (tetto %.1f)' % (rapporto, RAPPORTO_MAX))
print('ATLANTE   occupato %.2f%% (analitico), ingombro %.2f%%, %d isole'
      % (tot_uv * 100, tot_ing * 100, tot_isole))
print('ISOLA     la piu\' grande e\' %s: %.0f x %.0f px, cioe\' il %.0f%% del lato'
      % (piu_grande[1], piu_grande[2], piu_grande[3], piu_grande[0] / ATLANTE * 100))
if piu_grande[0] > ATLANTE * 0.9:
    print('          ATTENZIONE: e\' quell\'isola a dettare la scala di tutte le altre.')
    print('          Il packer non lo dice: riscala tutti e tace. Si taglia in bande.')

# ─── §11 · la verifica rasterizzata ───────────────────────────────────────
#
# L'area UV analitica non sa niente delle sovrapposizioni, e il margine e' un
# parametro DICHIARATO: finche' non si disegnano le isole in un buffer grande
# come l'atlante, «8 px di gutter» e' una promessa, non una misura.
bleed = None
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
    # Il gutter vero. NON si misura confrontando il buffer con se stesso
    # spostato in quattro direzioni: due isole distanti (16, 5) non stanno su
    # nessuna di quelle rette e la sonda risponderebbe un numero comodo. Qui
    # ogni isola cresce di un pixel per volta, tutte insieme, finche' due
    # fronti DIVERSI non si contendono lo stesso texel.
    lab = buf.copy()
    DIR = ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1))

    def sposta(a, dx, dy):
        s = np.zeros_like(a)
        s[max(0, dy):N + min(0, dy), max(0, dx):N + min(0, dx)] = \
            a[max(0, -dy):N + min(0, -dy), max(0, -dx):N + min(0, -dx)]
        return s

    urto = 0
    for dx, dy in DIR[:6]:
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
        print('RASTER    bleed sicuro %d px a %d  ->  %.1f a 1024, %.1f a 512'
              % (bleed, N, bleed / (N / 1024), bleed / (N / 512)))

# ─── §12 · il secondo canale UV dei corsi del teak ────────────────────────
if CORSI and TEAK:
    for o in TEAK:
        me = o.data
        lay = me.uv_layers.get('TEAK_CORSI') or me.uv_layers.new(name='TEAK_CORSI')
        M = o.matrix_world
        d = lay.data
        for p in me.polygons:
            for li in p.loop_indices:
                c = M @ me.vertices[me.loops[li].vertex_index].co
                d[li].uv = (c.x, c.y)          # metri: u trasversale, v = i corsi
        me.uv_layers['UVMap'].active = True
        me.uv_layers['UVMap'].active_render = True
    print('')
    print('CORSI     secondo canale `TEAK_CORSI` sul teak, 1 unita\' UV = 1 metro,')
    print('          continuo e senza cuciture. Serve alla texture RIPETUTA dei corsi:')
    print('          una fuga da 5 mm vuole ~4 px/cm e l\'atlante ne da\' %.2f.' % alto[4])
    print('          Canale attivo e da render: UVMap.')

# ─── §13 · il montaggio, dallo stesso sorgente ────────────────────────────
print('')
print('GEOMETRIA da glb-sovrastruttura.py, tratto B: montaggio dei nodi')
sys.argv = ['blender', '-b', '-P', SORGENTE, '--', LAVORO]
exec(compile('\n' * sorgente[:i_mont].count('\n') + sorgente[i_mont:i_exp],
             SORGENTE, 'exec'), GEO)
sys.argv = argv_vero

uniti = [o for o in bpy.data.objects if o.type == 'MESH']
tot_uv_dopo = 0.0
for o in uniti:
    if not o.data.uv_layers:
        raise SystemExit('ERRORE: %s e\' uscito dalla join SENZA UV.' % o.name)
    for p in o.data.polygons:
        tot_uv_dopo += area_uv_faccia(o, p)
scarto = abs(tot_uv_dopo - tot_uv_prima_join) / tot_uv_prima_join
print('JOIN      %d pezzi -> %d mesh (%s); area UV %.5f -> %.5f, scarto %.4f%%'
      % (len(pezzi), len(uniti), ', '.join(o.name for o in uniti),
         tot_uv_prima_join, tot_uv_dopo, scarto * 100))
if scarto > 1e-4:
    raise SystemExit('ERRORE: la join ha perso o alterato le UV (scarto %.3f%%).'
                     % (scarto * 100))

# ─── §14 · il file ────────────────────────────────────────────────────────
os.makedirs(USCITE, exist_ok=True)
percorso = os.path.join(USCITE, 'sovrastruttura-uv.blend')
bpy.ops.wm.save_as_mainfile(filepath=percorso)
print('BLEND     %s  %.0f KB  (%.0f s)'
      % (percorso, os.path.getsize(percorso) / 1024, time.time() - T0))

# ─── §15 · i cancelli ─────────────────────────────────────────────────────
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
    print('  piu\' texel del dovuto: %-22s %.3f px/cm (%.2f%% dell\'atlante per %.2f m2)'
          % (alto[0], alto[4], alto[2] * 100, alto[1]))
    print('  affamato:              %-22s %.3f px/cm (%.2f%% dell\'atlante per %.2f m2)'
          % (basso[0], basso[4], basso[2] * 100, basso[1]))
    print('  la soglia NON si alza. Si guarda quale peso del §8 l\'ha aperto: e\'')
    print('  li\' che qualcuno ha dichiarato che una superficie vale dieci volte')
    print('  un\'altra, e quella dichiarazione o si difende con un numero o si toglie.')
    sys.exit(1)

print('')
print('CANCELLO VERDE: rapporto di densita\' %.2f entro %.1f%s'
      % (rapporto, RAPPORTO_MAX,
         (', bleed sicuro %d px >= %.0f chiesti' % (bleed, MARGINE_PX)) if RASTER
         else ', margine NON verificato (--senza-raster)'))
