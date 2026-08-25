# -*- coding: utf-8 -*-
"""
Genera il sottoinsieme di Recursive per il provino tipografico.

STRATEGIA B (decisione D43): **un file solo**, con `MONO` e il peso entrambi
variabili. Due istanze separate costerebbero di piu' — le curve verrebbero
duplicate — e due richieste di rete invece di una.

ORDINE DELLE OPERAZIONI, e non e' un dettaglio:
si SOTTOINSIEMA prima, si istanzia dopo. Invertendo, `gvar` resta incoerente
col nuovo insieme di glifi e fontTools muore su `space` — un errore che sembra
un font rotto e non lo e'.

Va rieseguito ogni volta che cambia l'insieme dei glifi del sito: il peso
dichiarato altrove vale solo per QUESTO insieme.

    python strumenti/font-recursive.py
"""
import os
import sys
import glob

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.subset import Subsetter, Options

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.dirname(QUI)
USCITA = os.path.join(RADICE, 'public', 'font')

# I glifi che il sito usa davvero: inglese, cifre, segni tecnici.
# Se il copy cambia, questa riga cambia e il peso va rimisurato.
TESTO = (
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    'abcdefghijklmnopqrstuvwxyz'
    '0123456789'
    '.,;:!?\'’"()[]{}—–-/\\|&%°+*=<>@# '
    '·→×≤≥'  # se questa riga cambia, il peso dichiarato altrove non vale piu'
)

# Gli assi che restano variabili, e quelli che si inchiodano.
# CRSV ha default 0,5 — corsivo automatico — e va portato a zero (D44).
FISSI = {'slnt': 0, 'CASL': 0, 'CRSV': 0}


def sorgente():
    p = glob.glob(os.path.join(
        RADICE, 'node_modules', '@fontsource-variable', 'recursive',
        'files', '*latin-full*.woff2'))
    if not p:
        sys.exit('manca @fontsource-variable/recursive: npm install')
    return p[0]


def main():
    src = sorgente()
    os.makedirs(USCITA, exist_ok=True)

    f = TTFont(src)

    # 1 · sottoinsieme
    o = Options()
    o.layout_features = ['kern', 'liga', 'calt', 'frac']
    o.desubroutinize = True
    s = Subsetter(options=o)
    s.populate(text=TESTO)
    s.subset(f)

    # 2 · istanziazione parziale: MONO e wght restano variabili
    f = instancer.instantiateVariableFont(f, FISSI, inplace=True, updateFontNames=False)

    f.flavor = 'woff2'
    fuori = os.path.join(USCITA, 'recursive-var.woff2')
    f.save(fuori)

    n = os.path.getsize(fuori)
    assi = ', '.join(a.axisTag for a in f['fvar'].axes)
    print('  glifi nel sottoinsieme: %d' % len(set(TESTO)))
    print('  assi rimasti variabili: %s' % assi)
    print('  scritto: %s' % os.path.relpath(fuori, RADICE))
    print('  peso:    %.1f KB' % (n / 1024))
    print('  oggi (4 statici Space Grotesk + JetBrains): 67,2 KB')

    if 'MONO' not in assi:
        sys.exit('  ROTTO: l\'asse MONO non e\' sopravvissuto all\'istanziazione')
    if n > 60 * 1024:
        sys.exit('  ROTTO: oltre 60 KB, il vantaggio sul peso sparisce')


if __name__ == '__main__':
    main()
