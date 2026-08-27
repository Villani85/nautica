"""DAL FILMATO GREZZO ALLA MASCHERA DEL FINESTRONE.

    python strumenti/salone-da-filmato.py <filmato.mp4>

--- COSA PRODUCE

  public/salone/finestrone.png   la maschera del vano. Bianco = stanza
                                 (opaca), nero = vetro (bucato): e' quello
                                 che vuole `alphaMap` di three.js.
  public/filmati/salone-largo.mp4  la stanza, ricompressa.

--- COME SI TROVA IL VANO, E PERCHE' NON A OCCHIO

Due segnali, e il vano e' dove sono d'accordo.

Il primo e' il COLORE sulla mediana temporale -- che toglie di mezzo le
persone: l'interno e' l'unica cosa calda del quadro (legno r-b = +23, divano
+79) mentre cielo e mare stanno a -13 e -17, con un salto netto fra il
50esimo percentile (-7) e il 60esimo (+19). La soglia sta li' in mezzo, e non
e' scelta a occhio.

Il secondo e' la GEOMETRIA: il vano ha bordi dritti, quindi al bordo trovato
si adattano delle rette. Sono tre -- la diagonale alta, il montante quasi
verticale, la battuta bassa -- e i due punti di rottura si CERCANO, non si
scelgono: e' la coppia che minimizza l'errore. Sul filmato buono l'errore medio
e' 1,37 px, e le rotture cadono a y=78 e y=552.

Perche' rette e non pixel: il montante scuro e' freddo quanto il mare (r-b =
-13 su entrambi), quindi il colore da solo sborda nel legno. Una retta adattata
su centinaia di righe non se ne accorge nemmeno. Ed e' anche il motivo per cui
lo strumento si rifiuta di scrivere la maschera se l'errore supera i 4 px:
vorrebbe dire che sta mascherando un quadro che non e' questo.

--- COSA NON FA, E PERCHE'

Non raddrizza l'orizzonte del mare girato. La ragione lunga sta piu' sotto, al
punto 2; in breve: nessuno dei filmati ha l'orizzonte fermo, la misura per
raddrizzarlo ha sbagliato due volte senza dare errore, e il mare che si vede
dal vetro adesso e' quello 3D della scena -- che l'orizzonte ce l'ha dove dice
la camera, e risponde alla manopola dello stato del mare.
"""
import json
import math
import subprocess
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

SORGENTE = Path(sys.argv[1] if len(sys.argv) > 1 else '')
if not SORGENTE.is_file():
    sys.exit('  serve il filmato: python strumenti/salone-da-filmato.py <file.mp4>')

RADICE = Path(__file__).resolve().parent.parent
FUORI_FILM = RADICE / 'public' / 'filmati'
FUORI_SAL = RADICE / 'public' / 'salone'

# --- dati del filmato -------------------------------------------------------

def sonda(campi):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                        '-show_entries', campi, '-of', 'csv=p=0:nk=1', str(SORGENTE)],
                       capture_output=True, text=True)
    return r.stdout.strip().split('\n')[0].split(',')

W, H = (int(x) for x in sonda('stream=width,height'))
num, den = (int(x) for x in sonda('stream=r_frame_rate')[0].split('/'))
FPS = num / den
DURATA = float(sonda('format=duration')[0]) if False else float(
    subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                    '-of', 'csv=p=0', str(SORGENTE)], capture_output=True, text=True).stdout.strip())
print('  filmato: %dx%d, %.3f fotogrammi al secondo, %.2f s' % (W, H, FPS, DURATA))


def leggi(vf, w, h, canali=1, pix='gray'):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(SORGENTE), '-vf', vf,
                          '-pix_fmt', pix, '-f', 'rawvideo', '-'],
                         capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, canali).astype(np.float32)


# --- 1 - IL VANO ------------------------------------------------------------

print('\n  1 - il vano del finestrone')
med = np.median(leggi('fps=2,scale=%d:%d' % (W, H), W, H, 3, 'rgb24'), axis=0)
caldo = med[:, :, 0] - med[:, :, 2]
print('     temperatura di colore: 50esimo percentile %+.1f, 60esimo %+.1f  (il salto e li in mezzo)'
      % (np.percentile(caldo, 50), np.percentile(caldo, 60)))

fuori = caldo < 6
visto = np.zeros_like(fuori, bool)
q = deque()
for y in range(H):
    if fuori[y, 0]:
        visto[y, 0] = True
        q.append((y, 0))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < H and 0 <= nx < W and fuori[ny, nx] and not visto[ny, nx]:
            visto[ny, nx] = True
            q.append((ny, nx))

bordo = np.full(H, -1)
for y in range(H):
    xs = np.nonzero(visto[y])[0]
    if len(xs) > 20 and xs.min() == 0:
        salto = np.nonzero(np.diff(xs) > 1)[0]
        bordo[y] = xs[salto[0]] if len(salto) else xs.max()
ys = np.nonzero(bordo > 0)[0]
if len(ys) < H * 0.5:
    sys.exit('     il bordo del vano si legge su meno di meta delle righe: filmato inatteso')


def retta(yy):
    A = np.vstack([yy, np.ones(len(yy))]).T
    sol, *_ = np.linalg.lstsq(A, bordo[yy], rcond=None)
    return sol[0], sol[1], np.abs(A @ sol - bordo[yy]).mean()


best = None
for a in range(int(ys.min()) + 30, H // 2, 4):
    for b in range(max(a + 80, int(H * 0.55)), int(ys.max()) - 40, 4):
        pezzi = (ys[ys <= a], ys[(ys > a) & (ys <= b)], ys[ys > b])
        if min(len(p) for p in pezzi) < 30:
            continue
        f = [retta(p) for p in pezzi]
        e = sum(x[2] * len(p) for x, p in zip(f, pezzi)) / len(ys)
        if best is None or e < best[0]:
            best = (e, a, b, f)

err, ya, yb, rette = best
for nome, (m_, q_, e_) in zip(('diagonale alta', 'montante', 'battuta bassa'), rette):
    print('     %-15s x = %+.4f*y %+8.1f   %+6.2f gradi dalla verticale   errore %.2f px'
          % (nome, m_, q_, math.degrees(math.atan(m_)), e_))
print('     errore medio complessivo: %.2f px   (rotture a y=%d e y=%d)' % (err, ya, yb))
if err > 4:
    sys.exit('     le rette non descrivono questo vano: si sta mascherando la cosa sbagliata')

yy = np.arange(H)[:, None].astype(np.float32)
xx = np.arange(W)[None, :].astype(np.float32)
lim = np.where(yy <= ya, rette[0][0] * yy + rette[0][1],
               np.where(yy <= yb, rette[1][0] * yy + rette[1][1],
                        rette[2][0] * yy + rette[2][1])).astype(np.float32)
# --- IL RIENTRO DELLA MASCHERA, E PERCHE NON E UN NUMERO DI COMODO
#
# La maschera sta ferma; il vano dentro il filmato no, perche nessuna camera
# generata e davvero immobile. Dove la maschera buca OLTRE il vano si apre un
# foro nel legno e ci si vede il mare: si nota subito. Dove resta corta, sopra
# il mare avanza una scheggia del vano filmato, che contiene mare: non si vede.
#
# Il danno e asimmetrico, quindi si sceglie il lato che perdona: la maschera
# RIENTRA. Cosi il difetto visibile non puo accadere, e cio che resta e un
# telaio un po piu spesso.
#
# Il numero viene scritto in `vano.json`, e `collaudo-filmato.mjs` lo LEGGE per
# derivarne il proprio tetto invece di portarsi dietro costanti scelte a mano.
# Due strumenti, un contratto: questo dichiara quanto perdona, quello misura
# quanto scivola. Nessuno dei due si fida di se stesso.
#
# 24 px: la ripresa senza ciclo si muove di piu' di quella precedente -- il
# cancello ha misurato 17,3 px di scivolamento contro i 16 di allora, e ha
# bocciato. Il numero non si alza a occhio: si alza fin sopra la misura, e il
# cancello lo riverifica. Per riferimento, sulla ripresa precedente lo
# scivolamento era -- deriva 3,1 px
# piu (0,48% di scala + 0,34 gradi) per un raggio di 734 px, cioe 11,0 in
# tutto -- con un margine che regge una ripresa un po peggiore.
RIENTRO = 24
vano = np.clip(lim - RIENTRO - xx, 0, 2) / 2.0
FUORI_SAL.mkdir(parents=True, exist_ok=True)
# alphaMap vuole BIANCO dove resta opaco: la stanza. Il vetro va a nero.
Image.fromarray(((1 - vano) * 255).astype(np.uint8)).save(FUORI_SAL / 'finestrone.png')
print('     scritto public/salone/finestrone.png   (vano = %.1f%% del quadro)' % (100 * vano.mean()))
(FUORI_SAL / 'vano.json').write_text(json.dumps({
    'rientro_px': RIENTRO,
    'perche': ('di quanto la maschera rientra rispetto al vano misurato. '
               'collaudo-filmato.mjs ci deriva il proprio tetto: se il vano scivola '
               'di piu di questo, si apre un foro nel legno.')
}, indent=1), encoding='utf-8')
print('     scritto public/salone/vano.json          (rientro %d px)' % RIENTRO)

# --- 2 - E L'ORIZZONTE NON SI MISURA PIU' QUI ------------------------------
#
# Qui c'era un secondo capitolo che misurava l'inclinazione dell'orizzonte per
# raddrizzarlo. E' stato tolto dopo che la misura ha sbagliato DUE VOLTE, in
# modi opposti, e nessuna delle due volte ha dato errore:
#
#   - con una banda di ricerca stretta la linea trovata SBATTE contro il bordo
#     della banda: l'escursione usciva 2,5 gradi, cioe' sottostimata, perche'
#     l'orizzonte vero stava piu' in basso di dove lo cercavo;
#   - allargando la banda, su certi fotogrammi il rilevatore si aggancia a un
#     BORDO DI NUVOLA invece che all'orizzonte, e l'escursione usciva 10,9.
#
# Le due misure differivano di quattro volte sullo stesso file. Se ne e' usciti
# solo disegnando la linea trovata sopra i fotogrammi e guardandola: e' l'unico
# modo in cui un rilevatore geometrico si controlla.
#
# La versione robusta -- mediana fra le colonne e scarto delle dissidenti --
# regge sulla maggior parte dei fotogrammi ma non su tutti, e una stabilizzazione
# che sbaglia su un fotogramma su venti fa sobbalzare l'orizzonte: un difetto
# peggiore di quello che cura.
#
# E soprattutto e' diventata inutile. Misurando TUTTI i filmati disponibili si
# e' visto che nessuno ha l'orizzonte fermo -- 13,5, 14,6, 15,5, 17,5 gradi di
# escursione -- e che chiedere al generatore una "telecamera fissa" non serve:
# i tre file nati da quella richiesta si muovono PIU' degli altri.
#
# Quindi il mare dal finestrone e' quello 3D della scena, che ha l'orizzonte
# dove dice la camera e risponde alla manopola. Il filmato porta la STANZA, che
# e' la cosa che sa fare meglio di qualunque cosa costruita a mano: legno,
# lampada accesa, due persone vere.

# --- 3 - LA STANZA, STABILIZZATA, E NON DA ME -----------------------------
#
# `collaudo-filmato.mjs` ha bocciato la ripresa grezza: 0,34 gradi di
# escursione contro un tetto di 0,30, e una carrellata dello 0,48% contro 0,50.
# Il suo argomento e' quello giusto e non si negozia alzando il tetto: LA
# STANZA NON DEVE RUOTARE DA SOLA, l'inclinazione la da la simulazione --
# altrimenti i due angoli si sommano a caso e l'orizzonte dentro il vetro si
# inclina insieme alla stanza, cioe' il contrario della tesi.
#
# La correzione la fa `vidstab` di ffmpeg, in due passate, e NON un estimatore
# scritto qui. La ragione e' una regola, non pigrizia: CHI CORREGGE E CHI
# VERIFICA DEVONO ESSERE DUE STRUMENTI DIVERSI. Un raddrizzamento scritto da me
# e verificato da un cancello scritto da me codifica due volte la stessa
# ipotesi -- ed e' appena successo, quando la mia misura dell'orizzonte ha
# sbagliato di quattro volte senza dare errore.
#
# `optzoom=1` lascia a vidstab il minimo ingrandimento che evita i bordi neri:
# la correzione e' di un terzo di grado, quindi il ritaglio e' trascurabile.

print()
print('  3 - la stanza')
# Il nome del file delle trasformazioni resta RELATIVO e si lavora dentro la
# radice del repo: nei filtri di ffmpeg i due punti separano le opzioni, quindi
# un percorso windows come `C:/...` fa morire il filtro con un EINVAL che parla
# di argomenti, non di percorsi.
TRX = '_vidstab.trf'


def ff(argomenti):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y'] + argomenti,
                       cwd=str(RADICE), capture_output=True, text=True)
    if r.returncode:
        print('     ffmpeg ha fallito:')
        sys.exit((r.stderr or '(nessun messaggio)')[-800:])


# --- 2-bis - IL PEZZO DA TOGLIERE, E DOVE TAGLIARLO ------------------------
#
# Fra 4,7 e 5,4 secondi l uomo alza il braccio con la mano aperta, in un gesto
# senza motivo che il generatore ha inventato. In una clip che cicla lo si vede
# ogni volta. Il committente ha autorizzato di toglierlo.
#
# Un taglio netto salterebbe: le persone si muovono molto. Ma i due fotogrammi
# ai capi del taglio non devono essere QUALSIASI due -- devono essere i due che
# si somigliano di piu'. Quindi non si sceglie dove tagliare: si CERCA, dentro
# una finestra attorno all intervallo da togliere, la coppia (uscita, entrata)
# che costa meno.
#
# Il costo si misura sul lato STANZA e non su tutto il quadro: dall altra parte
# c e' acqua, che non combacia mai e che coprirebbe il segnale delle persone con
# il proprio rumore. E' la stessa scelta che fa `collaudo-filmato.mjs` quando
# decide su quale meta' misurare.
#
# Poi mezzo secondo di dissolvenza: sopra due pose che gia' combaciano non si
# vede, e perdona l ultimo pixel di differenza.

DA_TOGLIERE = []   # vedi DOPO_IL_DIFETTO: su questa ripresa conviene partire dopo

# --- IL DIFETTO STA ALL INIZIO, QUINDI NON SI TAGLIA: SI PARTE DOPO
#
# Su `..._noloop.mp4` l unico difetto e' a 1,0-2,1 s, dove le braccia dei due si
# compenetrano. Toglierlo con un taglio in mezzo costava 8,5 volte un fotogramma
# adiacente -- si sarebbe visto. Ma un difetto all inizio non ha bisogno di un
# taglio: basta cominciare dopo.
#
# E gia' che la clip CICLA, i due estremi non si scelgono a caso: si cerca la
# coppia (inizio, fine) che rende invisibile IL GIRO. E' lo stesso criterio dei
# tagli, applicato alla giunzione che l utente vede piu' spesso -- quella che
# torna ogni volta che il video ricomincia.
DOPO_IL_DIFETTO = 2.3     # secondi: l inizio non puo' cadere prima
DURATA_MINIMA = 12.0      # sotto, la ripetizione si riconosce comunque
FINESTRA_TAGLIO = 4.0         # di quanto si puo' spostare ciascun capo. A 0,7 il
                              # taglio migliore costava 7,8 volte un fotogramma
                              # adiacente; a 4,0 ne costa 2,7, perche' trova il
                              # punto in cui la clip torna su se stessa
# La dissolvenza si adatta al costo del taglio, e non e' un trucco: una
# giunzione che costa due volte un fotogramma adiacente e' gia' invisibile e una
# dissolvenza lunga la ammorbidirebbe inutilmente; una che ne costa sette si
# vede, e su un'inquadratura ferma con due persone sedute una dissolvenza lunga
# e' grammatica -- un raccordo -- non un errore nascosto.
def dissolvenza_per (rapporto):
    return min(1.2, max(0.30, 0.30 + (rapporto - 2.0) * 0.16))


DISSOLVENZA = 0.4             # solo per il calcolo del margine fra due tagli

print()
print('  2-bis - i pezzi da togliere')
w3, h3 = 320, 180
G3 = leggi('scale=%d:%d' % (w3, h3), w3, h3)[:, :, :, 0]
x0 = int(0.58 * w3)
STANZA = [f[int(h3 * 0.06):int(h3 * 0.92), x0:].reshape(-1) for f in G3]


def costo(a, b):
    return float(np.abs(STANZA[a] - STANZA[b]).mean())


adiacente = float(np.median([costo(k, k + 1) for k in range(0, len(STANZA) - 1, 7)]))
raggio = int(FINESTRA_TAGLIO * FPS)
tagli = []
minimo = 0
for (t0, t1) in DA_TOGLIERE:
    ini, fin = int(t0 * FPS), int(t1 * FPS)
    migliore = None
    for a in range(max(minimo, ini - raggio), ini + 1):
        for b in range(fin, min(len(STANZA) - 1, fin + raggio) + 1):
            c = costo(a, b)
            if migliore is None or c < migliore[0]:
                migliore = (c, a, b)
    if migliore is None:
        sys.exit('     nessun taglio possibile per l intervallo %.1f-%.1f s' % (t0, t1))
    c, a, b = migliore
    print('     %.1f-%.1f s  ->  taglio da %.2f a %.2f   costo %.2f, cioe %.1f volte un fotogramma adiacente'
          % (t0, t1, a / FPS, b / FPS, c, c / adiacente))
    if c > adiacente * 6:
        print('        costoso: dissolvenza allungata a %.2f s per raccordarlo'
              % dissolvenza_per(c / adiacente))
    tagli.append((a, b, dissolvenza_per(c / adiacente)))
    minimo = b + int(DISSOLVENZA * FPS) + 2

# --- 2-ter - I DUE ESTREMI, SCELTI PERCHE' IL GIRO NON SI VEDA -------------

print()
print('  2-ter - dove comincia e dove finisce')
migliore = None
dopo = int(DOPO_IL_DIFETTO * FPS)
minlen = int(DURATA_MINIMA * FPS)
for i0 in range(dopo, len(STANZA) - minlen, 2):
    for j0 in range(i0 + minlen, len(STANZA), 2):
        c = costo(i0, j0)
        if migliore is None or c < migliore[0]:
            migliore = (c, i0, j0)
if migliore is None:
    sys.exit('     la ripresa e piu corta della durata minima richiesta')
cGiro, INIZIO, FINE = migliore
print('     da %.2f s a %.2f s  =  %.2f s   giunzione del giro %.2f, cioe %.1f volte un fotogramma adiacente'
      % (INIZIO / FPS, FINE / FPS, (FINE - INIZIO) / FPS, cGiro, cGiro / adiacente))
if cGiro > adiacente * 4:
    print('     ATTENZIONE: il giro si vedra. Serve una ripresa piu lunga o piu calma.')

# --- 3 - LA STANZA, RICOMPRESSA E BASTA
#
# Qui ci sono stati quattro tentativi di stabilizzazione, e OGNUNO ha
# peggiorato la ripresa. I numeri, misurati da `collaudo-filmato.mjs`:
#
#     ripresa grezza                             0,34 gradi   carrellata 0,48%
#     vidstab su tutto il quadro, smoothing 30   0,39                    0,48%
#     vidstab su tutto il quadro, smoothing 0    0,57                    4,92%
#     vidstab rilevato sul solo lato stanza      7,33                    8,20%
#     stimatore mio, sul montante               10,26                    9,31%
#
# Tre cause distinte, tutte istruttive:
#
#   - RILEVARE SU TUTTO IL QUADRO stima il moto del CONTENUTO -- meta' quadro
#     e' acqua che scorre, l'altra meta' ha due persone che gesticolano -- e lo
#     attribuisce alla camera, poi lo "corregge" trascinando il fotogramma;
#   - RILEVARE SU UN RITAGLIO e applicare al quadro intero ruota attorno al
#     centro sbagliato: 0,3 gradi diventano 7;
#   - IL MIO STIMATORE sul montante misurava 2,04 gradi dove la verita' e'
#     0,34, quindi ha iniettato tremolio invece di toglierlo.
#
# La soluzione non era stabilizzare meglio: era smettere di pretendere una
# camera immobile e far PERDONARE il movimento alla maschera. Vedi il rientro,
# sopra, e il tetto derivato in `collaudo-filmato.mjs`.

print()


def ff(argomenti):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y'] + argomenti,
                       cwd=str(RADICE), capture_output=True, text=True)
    if r.returncode:
        print('     ffmpeg ha fallito:')
        sys.exit((r.stderr or '(nessun messaggio)')[-800:])


# CRF 30 e non 26: misurato il dettaglio dentro il vano -- che e' l acqua,
# cioe' la cosa che la compressione rovina per prima -- l originale sta a
# 3,972, il crf 26 a 3,795 e il crf 30 a 3,714. Due per cento di dettaglio in
# meno per il 39% di peso in meno: da 3,68 a 2,24 MB sul file piu' pesante del
# sito. Il numero e' misurato, non ereditato da un'abitudine.
# I pezzi che restano, e una dissolvenza a ogni giunzione. `xfade` vuole
# l'offset nel tempo del flusso GIA' concatenato, non della sorgente: dopo ogni
# fusione la durata accumulata cala di `DISSOLVENZA`, e dimenticarlo sposta la
# giunzione di mezzo secondo per ogni taglio.
pezzi = []
prec = INIZIO / FPS
for (a, b, _d) in tagli:
    pezzi.append((prec, a / FPS))
    prec = b / FPS
pezzi.append((prec, FINE / FPS))

filtro = []
for i, (d, f) in enumerate(pezzi):
    taglio = 'trim=%.3f:%.3f' % (d, f)
    filtro.append('[0:v]%s,setpts=PTS-STARTPTS[p%d];' % (taglio, i))
corrente = 'p0'
durata = pezzi[0][1] - pezzi[0][0]
for i in range(1, len(pezzi)):
    esce = 'x%d' % i
    d = tagli[i - 1][2]
    filtro.append('[%s][p%d]xfade=transition=fade:duration=%.3f:offset=%.3f[%s];'
                  % (corrente, i, d, durata - d, esce))
    lung = pezzi[i][1] - pezzi[i][0]
    durata = durata + lung - d
    corrente = esce
print('     restano %.2f s su %.2f' % (durata, DURATA))

ff(['-i', str(SORGENTE), '-an', '-filter_complex',
    ''.join(filtro).rstrip(';'), '-map', '[' + corrente + ']',
    '-c:v', 'libx264', '-crf', '30', '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    'public/filmati/salone-largo.mp4'])
peso = (FUORI_FILM / 'salone-largo.mp4').stat().st_size
print('     scritta: public/filmati/salone-largo.mp4  (%.2f MB)' % (peso / 1e6))

# --- 4 - UNA FINESTRA DI SOLO MARE ----------------------------------------
#
# Dietro il vetro c era la CLIP INTERA ingrandita 1,55 volte: divano, montante
# e persone compresi. Attraverso il buco si vedeva acqua solo perche' il vano
# sta a sinistra e a sinistra, nella copia ingrandita, c e' ancora acqua. Ma le
# onde erano a una scala diversa da quelle del vano, e ruotando ruotava un
# divano ingrandito dietro il vetro.
#
# Il committente l ha detto cosi': "il mare devi creare una finestra, altrimenti
# il movimento e' incoerente rispetto all attuale movimento del mare".
#
# --- IL RITAGLIO SI DEDUCE DALLE RETTE, NON SI SCEGLIE
#
# Il punto 1 ha gia' misurato i tre bordi del vano. La regione che e' SOLO mare
# e cielo per ogni riga e' quella a sinistra del bordo piu' stretto:
#
#   in alto la diagonale parte da x = q0 (a y=0);
#   in basso la battuta arriva a x = q0 alla riga y = (q2 - q0) / -m2.
#
# Sotto quella riga il legno entrerebbe nel ritaglio. Quindi il rettangolo e'
# x in [0, q0], y in [0, quella riga] -- dedotto, non stimato.
#
# --- E POI SI ALLARGA A SPECCHIO
#
# Il rettangolo e' alto e stretto; il piano da riempire e' 16:9. Ingrandirlo
# per forza vorrebbe dire onde due volte e mezzo piu' grandi di quelle del vano,
# cioe' lo stesso difetto di prima al contrario. Si specchia invece in
# orizzontale: l acqua e' statisticamente simmetrica, l orizzonte specchiato
# resta un orizzonte, e l ingrandimento residuo scende a circa 1,17.

print()
print('  4 - la finestra di solo mare')
X_MARE = int(rette[0][1])                       # dove la diagonale alta taglia y=0
Y_MARE = int((rette[2][1] - X_MARE) / -rette[2][0])   # dove la battuta bassa arriva a X_MARE
Y_MARE = min(Y_MARE, H)
print('     regione di solo mare: x 0..%d, y 0..%d  (dedotta dalle rette del vano)' % (X_MARE, Y_MARE))

# l orizzonte dentro il ritaglio, misurato sulla mediana dove le onde si annullano
banda = med[:Y_MARE, 40:min(X_MARE - 40, 400)].mean(axis=(1, 2))
gr = banda[:-8] - banda[8:]
y_oriz = int(np.argmax(gr)) + 4
print('     orizzonte a y=%d, cioe %.3f dall alto del ritaglio  (contrasto %.1f)'
      % (y_oriz, y_oriz / Y_MARE, gr.max()))

# Il ritaglio specchiato e' largo 2*X_MARE. Lo si taglia in altezza fino a
# renderlo 16:9 ESATTO, cosi' non serve nessun riscalamento: nessuna perdita di
# nitidezza, nessuna deformazione delle onde, e un file piu' leggero. L altezza
# tolta e' in fondo, dove c e' solo acqua.
LARGO_MARE = 2 * X_MARE
ALTO_MARE = (LARGO_MARE * H // W) & ~1
if ALTO_MARE > Y_MARE:
    sys.exit('     il ritaglio di mare e piu basso di quanto serva per un 16:9: '
             'la ripresa non ha abbastanza acqua sotto l orizzonte')
print('     ritaglio specchiato: %dx%d, 16:9 esatto, nessun riscalamento'
      % (LARGO_MARE, ALTO_MARE))
y_oriz_frazione = y_oriz / ALTO_MARE

ff(['-i', str(SORGENTE), '-an',
    '-filter_complex',
    # STESSI ESTREMI DELLA STANZA: due clip che ciclano a tempi diversi si
    # sfasano, e dopo qualche giro il mare dietro il vetro non appartiene piu'
    # al momento della stanza davanti. Restano due file perche' hanno due
    # ritagli diversi, ma sono la stessa fetta di traversata.
    ('[0:v]trim=%.3f:%.3f,setpts=PTS-STARTPTS,crop=%d:%d:0:0,'
     'split=2[a][b];[b]hflip[m];[a][m]hstack=2'
     % (INIZIO / FPS, FINE / FPS, X_MARE, ALTO_MARE)),
    '-c:v', 'libx264', '-crf', '30', '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    'public/filmati/salone-mare.mp4'])
pesoM = (FUORI_FILM / 'salone-mare.mp4').stat().st_size
print('     scritta: public/filmati/salone-mare.mp4  (%.2f MB)' % (pesoM / 1e6))

(FUORI_SAL / 'vano.json').write_text(json.dumps({
    'rientro_px': RIENTRO,
    'orizzonte_mare': round(y_oriz_frazione, 4),
    'perche': ('rientro_px: di quanto la maschera rientra rispetto al vano misurato; '
               'collaudo-filmato.mjs ci deriva il proprio tetto. '
               'orizzonte_mare: dove sta l orizzonte dentro salone-mare.mp4, '
               'frazione dall alto; e il perno attorno a cui il salone lo ruota.')
}, indent=1), encoding='utf-8')
print('     aggiornato public/salone/vano.json')

print()
print('  fatto: maschera, rientro dichiarato e stanza ricompressa.')
