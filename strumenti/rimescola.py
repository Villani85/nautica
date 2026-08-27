"""RIMESCOLARE IL SALONE, PERCHE' IL GIRO NON SI RICONOSCA MAI.

    python strumenti/rimescola.py <filmato.mp4> [--durata 180] [--scrivi]

--- IL PROBLEMA, IN UNA RIGA

`public/filmati/salone-largo.mp4` dura 13,50 s e la sua giunzione costa 5,9
volte un fotogramma adiacente. Chi si ferma a provare mare, andatura e
interruttore ci resta dentro minuti: vede la stessa scena tornare cinque o sei
volte, e la vede tornare NELLO STESSO ORDINE. E' l'ordine che si riconosce,
non il singolo fotogramma.

--- LA MISURA, CHE E' LA STESSA DI `salone-da-filmato.py`

Grigio a 320x180, ritaglio del lato STANZA (x oltre il 58%, y fra il 6% e il
92%), costo = differenza assoluta media. Il metro e' il fotogramma adiacente:
la mediana di costo(k, k+1). Non si cambia metro a meta' strada, altrimenti i
numeri di questo file non si possono confrontare con quelli di quello.

--- LA SORPRESA, E PERCHE' RIBALTA IL PIANO SCRITTO IN docs/15 §0-ter

Il piano diceva: la stanza ha 2364 salti che costano meno del doppio di un
fotogramma adiacente, da 117 fotogrammi diversi -- quindi c'e' un grafo ricco
su cui costruire un cammino. Rimisurato qui, quel conteggio e' vero e
inutilizzabile: quei salti sono quasi tutti salti di POCHI FOTOGRAMMI.

    dist >=   2 fotogrammi (0,1 s)   2012 salti sotto 2x   minimo 0,33x
    dist >=  12 fotogrammi (0,5 s)     84 salti sotto 2x   minimo 1,53x
    dist >=  24 fotogrammi (1,0 s)      0 salti sotto 2x   minimo 2,60x
    dist >=  48 fotogrammi (2,0 s)      0 salti sotto 2x   minimo 3,36x
    dist >= 144 fotogrammi (6,0 s)      0 salti sotto 4x   minimo 4,05x

Un salto di due decimi di secondo non rimescola niente: sposta la testina di
due decimi di secondo. Quel conteggio misurava la SOMIGLIANZA FRA FOTOGRAMMI
VICINI, che e' una proprieta' di qualunque ripresa continua -- non la
ricchezza del grafo. Il grafo utile e' quello dei salti LONTANI, e li' il
materiale e' povero: il pavimento e' 3,4x, non 2x.

E' lo stesso ceppo di errore gia' pagato in §0-bis: un numero giusto letto con
la domanda sbagliata. La domanda non era "quanti fotogrammi si somigliano", era
"quanti PUNTI LONTANI si somigliano".

--- CIO' CHE RESTA IN PIEDI, E VALE PIU' DEL PIANO ORIGINALE

Il 5,9x della clip attuale non e' un difetto dello strumento che l'ha
prodotta: e' il MEGLIO POSSIBILE per un giro di dieci secondi o piu' su questo
materiale -- la misura qui sotto lo riproduce da sola. Non c'e' un taglio
migliore da trovare.

Ma un salto a 3,4x costa la META' del giro attuale, e in piu' puo' portarsi
dietro una dissolvenza, che il wrap di un `<video loop>` non ha. Quindi la
strada non e' trovare la giunzione invisibile: e' SPENDERE PIU' SPESSO UNA
GIUNZIONE CHE SI VEDE MENO, e non spenderla mai due volte nello stesso ordine.

--- LA TRAPPOLA, MISURATA E NON TEMUTA

Un cammino casuale su un grafo povero si intrappola: gira su tre nodi e la
ripetizione peggiora invece di sparire. Qui si misura, per ogni politica di
scelta, quanto materiale distinto viene toccato nel primo minuto e dopo quanto
si riconosce un tratto gia' visto. Una politica che si intrappola lo dichiara
da sola: la copertura non sale.
"""
import argparse
import json
import math
import random
import subprocess
import sys
from pathlib import Path

import numpy as np

RADICE = Path(__file__).resolve().parent.parent
FUORI = RADICE / 'riferimenti' / 'rimescolo'
FUORI.mkdir(parents=True, exist_ok=True)

ap = argparse.ArgumentParser(add_help=True)
ap.add_argument('filmato')
ap.add_argument('--durata', type=float, default=180.0,
                help='secondi del montaggio della strada A')
ap.add_argument('--soglia', type=float, default=4.0,
                help='costo massimo di un salto, in volte un fotogramma adiacente')
ap.add_argument('--salto-min', type=float, default=2.0,
                help='secondi minimi di distanza fra i due capi di un salto')
ap.add_argument('--segmento', type=float, default=2.5,
                help='secondi minimi di riproduzione continua fra due salti')
ap.add_argument('--scrivi', action='store_true',
                help='scrive anche il montaggio mp4 della strada A (lento)')
A = ap.parse_args()

SORGENTE = Path(A.filmato)
if not SORGENTE.is_file():
    sys.exit('  serve il filmato: python strumenti/rimescola.py <file.mp4>')


# --- IL MATERIALE ---------------------------------------------------------

def sonda(campi, fmt=False):
    r = subprocess.run(['ffprobe', '-v', 'error'] +
                       ([] if fmt else ['-select_streams', 'v:0']) +
                       ['-show_entries', campi, '-of', 'csv=p=0:nk=1', str(SORGENTE)],
                       capture_output=True, text=True)
    return r.stdout.strip().split('\n')[0].split(',')


W, H = (int(x) for x in sonda('stream=width,height'))
num, den = (int(x) for x in sonda('stream=r_frame_rate')[0].split('/'))
FPS = num / den
DURATA = float(sonda('format=duration', fmt=True)[0])
PESO = SORGENTE.stat().st_size
print('  filmato: %dx%d, %.3f fotogrammi al secondo, %.2f s, %.0f kB'
      % (W, H, FPS, DURATA, PESO / 1024))

# Le stesse costanti di `salone-da-filmato.py`. Sono ricopiate e non importate
# perche' quello strumento non e' un modulo: al solo essere importato
# rileggerebbe il filmato e riscriverebbe public/. Ricopiare tre numeri e'
# meno pericoloso che eseguire quel file per sbaglio.
w3, h3 = 320, 180
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(SORGENTE),
                      '-vf', 'scale=%d:%d' % (w3, h3),
                      '-pix_fmt', 'gray', '-f', 'rawvideo', '-'],
                     capture_output=True).stdout
G = np.frombuffer(raw, np.uint8).reshape(-1, h3, w3).astype(np.float32)
x0 = int(0.58 * w3)
S = np.ascontiguousarray(G[:, int(h3 * 0.06):int(h3 * 0.92), x0:].reshape(len(G), -1))
N = len(S)

# La matrice completa dei costi, una riga alla volta: in un colpo solo sarebbe
# N per N per ventimila numeri, cioe' decine di gigabyte.
CACHE = FUORI / ('costi-%s-%d.npy' % (SORGENTE.stem[:24], N))
if CACHE.is_file():
    D = np.load(CACHE)
    print('  costi: riletti da %s' % CACHE.name)
else:
    D = np.empty((N, N), np.float32)
    for i in range(N):
        D[i] = np.abs(S - S[i]).mean(1)
    np.save(CACHE, D)
    print('  costi: calcolati su %d fotogrammi e messi in %s' % (N, CACHE.name))

ADIACENTE = float(np.median([D[k, k + 1] for k in range(0, N - 1, 7)]))
print('  un fotogramma adiacente costa %.4f  (e il metro di tutto cio che segue)'
      % ADIACENTE)

dist = np.abs(np.arange(N)[:, None] - np.arange(N)[None, :])


# --- 1 - QUANTO E' POVERO IL GRAFO, E A QUALE DISTANZA ---------------------

print('\n  1 - il grafo, per distanza fra i due capi del salto')
print('     %-26s %8s %8s %8s %9s' % ('distanza minima', 'minimo', '<=3x', '<=4x', 'nodi<=4x'))
tabella = []
for d in (12, 24, 48, 96, 144, 240):
    M = dist >= d
    if not M.any():
        continue
    riga = dict(fotogrammi=d, secondi=round(d / FPS, 2),
                minimo=round(float(D[M].min()) / ADIACENTE, 2),
                sotto3=int(((D <= 3 * ADIACENTE) & M).sum()),
                sotto4=int(((D <= 4 * ADIACENTE) & M).sum()),
                nodi4=int((((D <= 4 * ADIACENTE) & M).any(1)).sum()))
    tabella.append(riga)
    print('     >= %3d fotogrammi (%4.1f s)    %7.2fx %8d %8d %9d'
          % (d, d / FPS, riga['minimo'], riga['sotto3'], riga['sotto4'], riga['nodi4']))

# Il giro attuale si RICALCOLA invece di fidarsi del numero scritto altrove: se
# questo strumento non riproduce il 5,9x dichiarato, sta misurando un'altra
# cosa e tutto il resto del file e' aria.
GIRO_MIN = int(10.0 * FPS)
if N > GIRO_MIN:
    M = dist >= GIRO_MIN
    print('     un GIRO lungo almeno 10 s costa al minimo %.2fx: e il pavimento, non un difetto'
          % (float(D[M].min()) / ADIACENTE))


# --- 2 - GLI ARCHI CHE SERVONO DAVVERO ------------------------------------

SOGLIA = A.soglia * ADIACENTE
SALTO_MIN = int(round(A.salto_min * FPS))
SEGMENTO = int(round(A.segmento * FPS))

# Un salto e' una coppia (i, j): si mostra fino al fotogramma i e si riprende
# da j. Serve che i due capi siano LONTANI -- altrimenti il salto non
# rimescola -- e che il costo stia sotto la soglia.
ammessi = (D <= SOGLIA) & (dist >= SALTO_MIN)
np.fill_diagonal(ammessi, False)
ARCHI = {}
for i in range(N):
    js = np.nonzero(ammessi[i])[0]
    if len(js):
        ARCHI[i] = [(int(j), float(D[i, j] / ADIACENTE)) for j in js]

print('\n  2 - gli archi utili   soglia %.1fx, capi lontani almeno %.1f s'
      % (A.soglia, A.salto_min))
print('     %d archi da %d fotogrammi diversi (su %d)'
      % (sum(len(v) for v in ARCHI.values()), len(ARCHI), N))
if not ARCHI:
    sys.exit('     nessun salto utile: con questa soglia il rimescolo non e possibile')

# Un grafo puo' avere molti archi e restare spezzato in isolotti: se il cammino
# cade in un isolotto piccolo, gira li' dentro. Si misura PRIMA di camminare.
raggiunti = set()
coda = [min(ARCHI)]
while coda:
    i = coda.pop()
    if i in raggiunti:
        continue
    raggiunti.add(i)
    for j, _c in ARCHI.get(i, []):
        for k in range(j, min(N, j + SEGMENTO * 4)):
            if k in ARCHI and k not in raggiunti:
                coda.append(k)
print('     raggiungibili dal primo nodo: %d' % len(raggiunti))


# --- 3 - IL CAMMINO, E LA TRAPPOLA ----------------------------------------
#
# Tre politiche, e si confrontano MISURANDO. Non si sceglie quella che sembra
# piu' furba: si sceglie quella che copre piu' materiale e ci mette piu' tempo
# a far riconoscere un tratto.
#
#   uniforme     -- un arco a caso fra quelli ammessi;
#   pesata       -- probabilita' che cala con il costo, exp(-costo/sigma): i
#                   salti belli si usano piu' spesso, e sono pochi;
#   tabu         -- pesata, ma con memoria: chi e' stato riprodotto da poco pesa
#                   meno. E' la sola che puo' rompere un ciclo di tre nodi,
#                   perche' e' la sola che SA di averli gia' visti;
#   parsimoniosa -- non salta perche' PUO', salta perche' DEVE: solo a fine
#                   materiale, o quando cio' che sta davanti e' gia' stato
#                   visto. E sceglie dove atterrare guardando quanto materiale
#                   NUOVO c'e' dopo l'atterraggio. E' la politica che tratta il
#                   salto come sostituto del wrap, non come un effetto.
#
# PERCHE' LA PARSIMONIA NON E' PIGRIZIA, ED E' UN LIMITE MATEMATICO:
# il tempo prima che un tratto torni non puo' superare la durata del materiale
# RAGGIUNGIBILE. Ogni salto anticipato spreca materiale ancora da vedere, e
# quindi ANTICIPA la ripetizione invece di rimandarla. Un `<video loop>` e'
# gia' il cammino che percorre tutto prima di ripetere qualunque cosa: su
# quella metrica non si batte, si pareggia. Cio' che il rimescolo puo' togliere
# e' un'altra cosa -- la PERIODICITA', cioe' il sapere gia' cosa viene dopo.
#
# RICONOSCIMENTO: l'occhio non riconosce un fotogramma, riconosce un TRATTO. Si
# conta la striscia di fotogrammi consecutivi appena riprodotti che erano gia'
# stati riprodotti prima; quando arriva a RICONOSCE secondi, e' fatta. Su un
# `<video loop>` questo istante e' la durata del giro piu' RICONOSCE, ed e' il
# numero che questo strumento deve battere.

RICONOSCE = int(round(3.0 * FPS))


def cammina(politica, secondi, seme, sigma=0.8, memoria=12.0):
    rng = random.Random(seme)
    quanti = int(secondi * FPS)
    recente = {}
    visto = np.zeros(N, bool)
    coperti = np.zeros(N, bool)
    pos = rng.choice(sorted(ARCHI))
    t = 0
    striscia = 0
    riconosciuto = None
    ripetizione = None
    a60 = None
    giunzioni = []
    tappe = [pos]
    da_quando = 0
    bloccato = False
    archi_usati = {}
    primo_arco_riusato = None
    coda = []
    while t < quanti:
        coda.append(pos)
        if visto[pos]:
            striscia += 1
            if ripetizione is None:
                ripetizione = t
            if riconosciuto is None and striscia >= RICONOSCE:
                riconosciuto = t
        else:
            striscia = 0
        visto[pos] = True
        coperti[pos] = True
        recente[pos] = t
        t += 1
        if a60 is None and t >= 60 * FPS:
            a60 = int(coperti.sum())
        pos += 1
        deve = pos >= N
        puo = (t - da_quando >= SEGMENTO) and (pos in ARCHI)
        if politica == 'parsimoniosa' and puo and not deve:
            # davanti c'e' ancora roba mai vista? allora non si salta.
            avanti = visto[pos:min(N, pos + SEGMENTO)]
            if len(avanti) and avanti.mean() < 0.9:
                puo = False
        if not (deve or puo):
            continue
        scelte = ARCHI.get(pos, [])
        if deve and not scelte:
            # fine materiale: si torna all'ultimo nodo con archi dentro il
            # segmento appena riprodotto, altrimenti il cammino e' morto.
            for k in range(N - 1, max(0, N - 1 - SEGMENTO), -1):
                if k in ARCHI:
                    scelte, pos = ARCHI[k], k
                    break
        if not scelte:
            if deve:
                bloccato = True
                break
            continue
        if politica == 'uniforme':
            pesi = [1.0] * len(scelte)
        else:
            pesi = [math.exp(-(c - 3.0) / sigma) for _j, c in scelte]
            if politica == 'parsimoniosa':
                # si atterra dove c'e' piu' materiale nuovo davanti: e' la sola
                # scelta che aumenta il tempo prima della ripetizione, perche'
                # il tempo prima della ripetizione E' materiale nuovo.
                oriz = int(8.0 * FPS)
                for k, (j, _c) in enumerate(scelte):
                    davanti = visto[j:min(N, j + oriz)]
                    nuovo = 1.0 - (float(davanti.mean()) if len(davanti) else 1.0)
                    pesi[k] *= 0.05 + 4.0 * nuovo
            if politica == 'tabu':
                for k, (j, _c) in enumerate(scelte):
                    eta = t - recente.get(j, -10 ** 9)
                    if eta < memoria * FPS:
                        pesi[k] *= 0.02 + 0.98 * (eta / (memoria * FPS)) ** 2
        tot = sum(pesi)
        if tot <= 0:
            pesi, tot = [1.0] * len(scelte), float(len(scelte))
        r = rng.random() * tot
        acc = 0.0
        for k, w in enumerate(pesi):
            acc += w
            if r <= acc:
                break
        j, c = scelte[k]
        arco = (pos, j)
        if arco in archi_usati and primo_arco_riusato is None:
            primo_arco_riusato = t
        archi_usati[arco] = archi_usati.get(arco, 0) + 1
        giunzioni.append(c)
        tappe.append((pos, j, c))
        pos = j
        da_quando = t
    # IL CICLO TERMINALE. La copertura totale non basta a dire se il cammino si
    # e' intrappolato: un cammino che tocca tutto e poi si mette a girare su tre
    # nodi ha copertura alta e ripetizione insopportabile. Quello che conta e'
    # quanto materiale distinto tocca NEGLI ULTIMI SESSANTA SECONDI -- cioe' in
    # quello che il visitatore sta guardando adesso.
    ultimi = coda[-int(60 * FPS):]
    return dict(copertura=int(coperti.sum()),
                coda60=len(set(ultimi)),
                copertura60=a60 if a60 is not None else int(coperti.sum()),
                ripetizione=(ripetizione / FPS) if ripetizione is not None else secondi,
                riconosciuto=(riconosciuto / FPS) if riconosciuto is not None else secondi,
                arco_riusato=(primo_arco_riusato / FPS) if primo_arco_riusato is not None else secondi,
                giunzione_media=float(np.mean(giunzioni)) if giunzioni else 0.0,
                giunzione_max=float(np.max(giunzioni)) if giunzioni else 0.0,
                salti=len(giunzioni), bloccato=bloccato, tappe=tappe, durata=t / FPS)


PROVE, LUNGA = 60, 300.0
print('\n  3 - il cammino, e la trappola   (%d esecuzioni da %.0f s ciascuna)' % (PROVE, LUNGA))
print('     %-13s %8s %9s %10s %12s %8s %10s %9s'
      % ('politica', 'copre', 'ciclo fin.', 'ripete a', 'riconosce a', 'giunz.',
         'stesso arco', 'peggiore'))
POLITICHE = ('uniforme', 'pesata', 'tabu', 'parsimoniosa')
riassunto = {}
for pol in POLITICHE:
    esiti = [cammina(pol, LUNGA, s) for s in range(PROVE)]
    med = lambda k: float(np.median([e[k] for e in esiti]))
    riassunto[pol] = dict(
        copertura=med('copertura'), copertura60=med('copertura60'),
        coda60=med('coda60'),
        ripetizione=med('ripetizione'), riconosciuto=med('riconosciuto'),
        arco_riusato=med('arco_riusato'),
        giunzione_media=med('giunzione_media'), giunzione_max=med('giunzione_max'),
        salti=med('salti'),
        bloccati=sum(1 for e in esiti if e['bloccato']),
        riconosce_min=float(np.min([e['riconosciuto'] for e in esiti])))
    r = riassunto[pol]
    print('     %-13s %6.1f s %7.1f s %7.1f s %10.1f s %7.2fx %8.1f s %7.1f s%s'
          % (pol, r['copertura'] / FPS, r['coda60'] / FPS, r['ripetizione'],
             r['riconosciuto'], r['giunzione_media'], r['arco_riusato'],
             r['riconosce_min'], '  BLOCCATI %d' % r['bloccati'] if r['bloccati'] else ''))

print('\n     per confronto, un <video loop> su questo stesso file:')
print('     copre %.1f s, ripete a %.1f s, riconosce a %.1f s, e RIFA LA STESSA GIUNZIONE'
      % (DURATA, DURATA, DURATA + RICONOSCE / FPS))
print('     ogni %.1f s -- taglio netto, perche il wrap di un <video> non ha dissolvenza.' % DURATA)
print('     "copre" e il limite: nessun cammino puo ripetere piu tardi del materiale che tocca,')
print('     e "ciclo fin." dice su quanto materiale il cammino gira NEGLI ULTIMI 60 s.')
print('     Se "ciclo fin." e piccolo, il cammino si e intrappolato: e la trappola, misurata.')

# Si sceglie sul CASO PEGGIORE, non sulla mediana: un visitatore non e' la
# mediana di sessanta visitatori, e' uno solo. Se una politica riconosce a 40 s
# in mediana ma a 14 s nel suo caso peggiore, quel caso capita a qualcuno.
MIGLIORE = max(POLITICHE, key=lambda p: (riassunto[p]['coda60'],
                                         riassunto[p]['riconosce_min']))
print('\n     politica scelta sul caso peggiore: %s' % MIGLIORE)


# --- 4 - LE DUE STRADE ----------------------------------------------------

def dissolvenza_per(rapporto):
    """La curva di `salone-da-filmato.py`: la dissolvenza si adatta al costo,
    perche' due volte un fotogramma adiacente e' gia' invisibile e sette volte
    va raccordato."""
    return min(1.2, max(0.30, 0.30 + (rapporto - 2.0) * 0.16))


print('\n  4 - STRADA A: il montaggio lungo, cotto una volta')
esito = None
for s in range(400):
    e = cammina(MIGLIORE, A.durata, s)
    if e['bloccato']:
        continue
    if esito is None or e['riconosciuto'] > esito['riconosciuto']:
        esito = e
if esito is None:
    sys.exit('     ogni cammino si e bloccato: il grafo non regge un montaggio')

# Il cammino ha registrato le sue tappe come (uscita, ingresso, costo): da li'
# i segmenti si leggono senza doverli ricercare, che e' l'unico modo di non
# sbagliarli.
SEG, DISS = [], []
ini = esito['tappe'][0]
for tappa in esito['tappe'][1:]:
    usc, ing, c = tappa
    SEG.append((ini, usc))
    DISS.append(dissolvenza_per(c))
    ini = ing
SEG.append((ini, min(N - 1, ini + int(4 * FPS))))

dur_A = sum((b - a + 1) for a, b in SEG) / FPS - sum(DISS)
print('     %d segmenti, %d giunzioni, %.1f s netti'
      % (len(SEG), len(SEG) - 1, dur_A))
print('     giunzione media %.2fx, massima %.2fx  (dissolvenza da %.2f a %.2f s)'
      % (esito['giunzione_media'], esito['giunzione_max'], min(DISS), max(DISS)))
print('     riconoscimento a %.1f s (contro %.1f s del giro attuale)'
      % (esito['riconosciuto'], DURATA + RICONOSCE / FPS))
peso_stimato = PESO / DURATA * dur_A
print('     peso al ritmo attuale: %.2f MB stimati, contro %.2f MB di oggi'
      % (peso_stimato / 1e6, PESO / 1e6))

MONTAGGIO = FUORI / 'montaggio.mp4'
peso_A = durata_A_vera = None
if A.scrivi:
    filtro = []
    for i, (a, b) in enumerate(SEG):
        filtro.append('[0:v]trim=%.3f:%.3f,setpts=PTS-STARTPTS[p%d];'
                      % (a / FPS, (b + 1) / FPS, i))
    # `xfade` vuole l'offset nel tempo del flusso GIA' concatenato, non della
    # sorgente: dopo ogni fusione la durata accumulata cala della dissolvenza.
    # Dimenticarlo sposta la giunzione di mezzo secondo per ogni taglio.
    corrente = 'p0'
    accumulata = (SEG[0][1] + 1 - SEG[0][0]) / FPS
    for i in range(1, len(SEG)):
        d = DISS[i - 1]
        esce = 'x%d' % i
        filtro.append('[%s][p%d]xfade=transition=fade:duration=%.3f:offset=%.3f[%s];'
                      % (corrente, i, d, max(0.0, accumulata - d), esce))
        accumulata += (SEG[i][1] + 1 - SEG[i][0]) / FPS - d
        corrente = esce
    fg = ''.join(filtro).rstrip(';')
    print('     cottura in corso (%d giunzioni: e lento)...' % (len(SEG) - 1))
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(SORGENTE),
                        '-filter_complex', fg, '-map', '[%s]' % corrente,
                        '-c:v', 'libx264', '-crf', '30', '-preset', 'medium',
                        '-pix_fmt', 'yuv420p', '-an', str(MONTAGGIO)],
                       capture_output=True, text=True)
    if r.returncode:
        print('     ffmpeg ha fallito: %s' % (r.stderr or '(nessun messaggio)')[-600:])
    else:
        peso_A = MONTAGGIO.stat().st_size
        durata_A_vera = float(subprocess.run(
            ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
             '-of', 'csv=p=0', str(MONTAGGIO)], capture_output=True, text=True).stdout.strip())
        # Il confronto NON si fa con la sorgente, che e' grezza: si fa con il
        # file che il sito serve oggi, alla stessa codifica. Altrimenti si
        # confronta una compressione con un'altra e il numero non dice niente.
        SERVITO = RADICE / 'public' / 'filmati' / 'salone-largo.mp4'
        print('     scritto %s: %.2f s, %.2f MB, cioe %.1f kB al secondo'
              % (MONTAGGIO.name, durata_A_vera, peso_A / 1e6, peso_A / durata_A_vera / 1e3))
        if SERVITO.is_file():
            ps = SERVITO.stat().st_size
            ds = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
                                       'format=duration', '-of', 'csv=p=0', str(SERVITO)],
                                      capture_output=True, text=True).stdout.strip())
            print('     il sito oggi serve %.2f MB per %.2f s (%.1f kB al secondo):'
                  % (ps / 1e6, ds, ps / ds / 1e3))
            print('     il montaggio pesa %.1f VOLTE TANTO, e mostra %.1f s di materiale distinto.'
                  % (peso_A / ps, esito['copertura'] / FPS))

print('\n  5 - STRADA B: il salto a runtime')
# La tabella dei salti va data al sito com'e': per ogni fotogramma di uscita,
# gli ingressi possibili e il loro costo. Il sito la percorre con la stessa
# politica, e non paga un byte in piu' del filmato che gia' scarica.
netti = sorted((c, i, j) for i in ARCHI for j, c in ARCHI[i])
print('     %d salti disponibili; il piu economico costa %.2fx, il decimo %.2fx'
      % (len(netti), netti[0][0], netti[min(9, len(netti) - 1)][0]))
print('     peso: %.2f MB, cioe lo stesso di oggi -- nessun byte in piu' % (PESO / 1e6))
print('     giunzione: TAGLIO NETTO. Un solo <video> non sa fare dissolvenze,')
print('     ma anche il taglio piu caro qui costa %.2fx contro i 5,9x del wrap attuale.'
      % netti[min(len(netti) - 1, len(netti) // 2)][0])

SALTI = FUORI / 'salti.json'
SALTI.write_text(json.dumps(dict(
    filmato=SORGENTE.name, fotogrammi=N, fps=FPS, durata=DURATA,
    adiacente=ADIACENTE, soglia_x=A.soglia,
    salto_min_s=A.salto_min, segmento_min_s=A.segmento, politica=MIGLIORE,
    salti=[dict(da=round(i / FPS, 4), a=round(j / FPS, 4), costo_x=round(c, 3))
           for i in sorted(ARCHI) for j, c in ARCHI[i]],
), ensure_ascii=True, indent=1), encoding='ascii')
print('     tabella scritta in %s' % SALTI.relative_to(RADICE).as_posix())

MISURA = FUORI / 'misura.json'
MISURA.write_text(json.dumps(dict(
    filmato=str(SORGENTE), fotogrammi=N, fps=FPS, durata_s=DURATA, peso_byte=PESO,
    adiacente=ADIACENTE, grafo_per_distanza=tabella,
    archi=sum(len(v) for v in ARCHI.values()), nodi=len(ARCHI),
    raggiungibili=len(raggiunti),
    politiche=riassunto, politica_scelta=MIGLIORE,
    strada_A=dict(segmenti=len(SEG), durata_s=dur_A,
                  durata_misurata_s=durata_A_vera,
                  giunzione_media_x=esito['giunzione_media'],
                  giunzione_max_x=esito['giunzione_max'],
                  dissolvenza_min_s=min(DISS), dissolvenza_max_s=max(DISS),
                  riconosce_a_s=esito['riconosciuto'],
                  peso_stimato_byte=peso_stimato, peso_misurato_byte=peso_A),
    strada_B=dict(salti=len(netti), migliore_x=netti[0][0],
                  mediano_x=netti[len(netti) // 2][0],
                  peso_byte=PESO, dissolvenza=False),
    giro_attuale=dict(durata_s=DURATA, riconosce_a_s=DURATA + RICONOSCE / FPS),
), ensure_ascii=True, indent=1), encoding='ascii')
print('\n  misure in %s' % MISURA.relative_to(RADICE).as_posix())
