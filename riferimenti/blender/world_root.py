# -*- coding: utf-8 -*-
"""
IL FRAME COMUNE DELLA TRAVERSATA — origine, assi, unita', cuciture.

─── PERCHE' QUESTO FILE ESISTE PRIMA DELL'ASSEMBLATORE

Il piano diceva: parti da `scena-continua.py`. Sbagliato, e la revisione del
31 agosto l'ha dimostrato con i numeri invece che con un'opinione.

Verificato riga per riga:

  parts/saloon.py:124        crea WORLD_ROOT   (via l'helper `collezione`)
  parts/corridor.py:180      crea WORLD_ROOT   (bpy.data.collections.new)
  parts/mechanism_bay.py     NON lo crea       (righe 202 e 342: solo commenti)
  camera_path.py             NON lo crea       (riga 264: dice che «non e'
                                                ancora eseguito»)

E i due che lo creano lo creano **ciascuno nella propria scena**, senza
un'origine, un'orientazione o un'unita' condivise: stesso nome, due radici
diverse. Peggio: `mechanism_bay.py:220` mette `X_MB0 = 0.0` e l'apertura del
corridoio verso il locale tecnico sta anch'essa a `x = 0.0`. Due sistemi locali
che chiamano zero la **propria** cucitura. Importati insieme senza un frame
comune non si allineano: si sovrappongono.

Scrivere l'assemblatore adesso significherebbe farne il luogo in cui quattro
sistemi di riferimento incompatibili collidono, e passare il tempo a
debuggare li' una cosa che si previene qui in venti minuti.

─── COSA DEFINISCE, E COSA SI RIFIUTA DI DEFINIRE

Definisce cio' che e' **convenzione**: origine, assi, unita', gerarchia delle
collezioni. Su queste non c'e' niente da misurare: vanno solo scelte una volta
e rispettate da tutti.

**NON** sceglie i numeri che sono in conflitto. Li dichiara, ne segna la
provenienza, e fa **fallire** l'import di chi li usa in disaccordo. Un numero
scelto qui da me sarebbe indistinguibile, fra un mese, da un numero misurato --
ed e' esattamente il difetto per cui `Piano.md` ha portato per ore una paratia
a X = 8,6226 che non esiste in nessun file del repo.
"""

# ─────────────────────────────────────────────────────────────────────────────
# 1 · UNITA'
# ─────────────────────────────────────────────────────────────────────────────

UNITA = 'metro'
"""Si costruisce in METRI. E' la trappola numero uno del contratto §2."""

UNITA_SCENA_PER_METRO = 0.4
"""
1 unita' di scena = 2,5 m. La conversione la applica IL SITO, una volta sola,
al nodo radice. Nessun fattore nascosto sui sottoalberi.

Verificato da A2 il 31 agosto: i pannelli del guscio misurano 2,350143 contro i
2,35 m dichiarati in `riferimenti/salone/posa.json` — scarto 0,006%. I GLB del
progetto sono gia' in metri, quindi qui non si converte niente: si dichiara.
"""


# ─────────────────────────────────────────────────────────────────────────────
# 2 · ASSI E ORIGINE
# ─────────────────────────────────────────────────────────────────────────────

ASSI = {
    '+X': 'verso PRUA',
    '+Y': 'verso l\'ALTO',
    '+Z': 'verso DRITTA (tribordo)',
}
"""
Convenzione Blender (Z-up) NON usata: si autora in Y-up, come i GLB del
progetto, che escono con `export_yup=False` proprio per non subire la
rotazione automatica.

DIFETTO GIA' PAGATO DA A2, ed e' scritto qui perche' non si ripaghi: al primo
giro aveva misurato l'asse sbagliato e ottenuto **412% di scarto**, perche'
glTF e' Y-up e Blender ruota a Z-up. Un asse sbagliato non da' errore: da' un
modello che non combacia, e tre tentativi persi a cercare la causa altrove.
"""

ORIGINE = ("il bordo del VANO DEL SALONE a X = 0, sulla mezzeria (Z = 0), "
           "al livello del pavimento del salone (Y = 0)")
"""
SI ANCORA ALL'UNICA CUCITURA MISURATA, e non e' una preferenza.

Delle quattro cuciture, il vano del salone e' la sola MISURATA: X da -2,1746 a
0,0 e Y da 0,0 a 1,1449 -- `guscio-salone.py:40`, `riferimenti/salone/posa.json`,
riscontrata in `prove/00-inventario.txt`. Le altre tre sono derivate, assunte o
senza fonte.

Ancorare il mondo a una cucitura ASSUNTA propagherebbe l'assunzione a tutti i
pezzi: il giorno in cui la si misura si sposta tutto. Ancorandolo alla misurata,
il giorno in cui si misura una delle altre si sposta SOLO QUELLA.

Il primo giro di questo file metteva l'origine sulla paratia del locale tecnico.
Era comodo -- e' la cucitura contesa, quindi il disaccordo si sarebbe letto come
uno scarto da zero -- ma era esattamente quella da non usare come riferimento.

E spiega perche' `X_MB0 = 0.0` (`mechanism_bay.py:220`) e l'apertura del
corridoio a `x = 0.0` (`corridor.py:124`) non erano un buon segno: erano due
zeri che significavano due cose diverse. Da qui zero significa una cosa sola, e
sta nel salone.
"""

RISALITA_CORRIDOIO_M = 2.10
LUNGHEZZA_CORRIDOIO_M = 5.480

COLLOCAZIONI = {
    "STAIR_CORRIDOR": {
        "traslazione_m": (-LUNGHEZZA_CORRIDOIO_M, -RISALITA_CORRIDOIO_M, 0.0),
        "stato": "DERIVATO",
        "formula": ("l'apertura lato salone sta in locale a (5,480 | 2,10) e "
                    "deve mappare sull'origine (0 | 0): X_mondo = X_locale - 5,480, "
                    "Y_mondo = Y_locale - 2,10"),
    },
    "MECHANISM_BAY": {
        "aggancio_m": (-LUNGHEZZA_CORRIDOIO_M, -RISALITA_CORRIDOIO_M, 0.0),
        "stato": "DERIVATO",
        "formula": ("la porta deve cadere dove il corridoio mette la propria "
                    "apertura lato locale tecnico, cioe' l'origine locale del "
                    "corridoio portata nel mondo. Sostituisce X_MB0 = 0.0."),
    },
    "SALOON_SHELL": {
        "traslazione_m": (0.0, 0.0, 0.0),
        "stato": "MISURATO",
        "formula": "e' il riferimento: il vano ci sta gia' sopra per costruzione.",
    },
}
"""
IL NUMERO CHE QUESTO FILE FA NASCERE, e che prima non esisteva.

Il locale tecnico oggi si colloca a X_MB0 = 0.0 nel proprio sistema. Nel mondo
deve stare a -5,480 | -2,10. Non e' una scelta: e' la conseguenza di due valori
gia' scritti nel corridoio -- la sua lunghezza (4,48 + 1,00, riga 113) e la sua
risalita di 2,10 -- piu' l'origine ancorata al vano misurato.

Fino a stamattina i due pezzi si sarebbero sovrapposti all'origine. Adesso c'e'
un numero da verificare, e se e' sbagliato lo dira' un confronto invece di una
compenetrazione da scoprire a occhio in viewport.
"""


# ─────────────────────────────────────────────────────────────────────────────
# 3 · LE COLLEZIONI (contratto §1)
# ─────────────────────────────────────────────────────────────────────────────

COLLEZIONI = [
    'WORLD_ROOT',
    'HULL_SECTION',
    'MECHANISM_BAY',
    'ENGINE_ROOM',
    'STAIR_CORRIDOR',
    'SALOON_SHELL',
    'CUT_CAPS',
    'CAMERA_PATH',
    'LIGHTMAP_RECEIVERS',
    'OCCLUDERS',
]


# ─────────────────────────────────────────────────────────────────────────────
# 4 · LE CUCITURE, con la loro provenienza
# ─────────────────────────────────────────────────────────────────────────────
#
# `stato` e' la cosa piu' importante di questa tabella, piu' dei numeri:
#
#   MISURATO   ricavato da una fotografia, da un GLB o da un rilievo, e la
#              fonte e' indicata. Si puo' costruirci contro.
#   DERIVATO   somma o differenza di valori misurati, con la formula scritta.
#   ASSUNTO    scelto da qualcuno perche' serviva un numero. NON e' una misura,
#              e chi ci costruisce contro deve saperlo.
#   CONFLITTO  due moduli dichiarano valori diversi per la stessa cucitura.
#              Nessuno dei due e' autorevole finche' non si decide.
#
# Un numero senza `stato` non entra in questa tabella. E' la regola che manca
# oggi a `Piano.md`, che ha portato per ore una paratia a X = 8,6226 -- valore
# che `grep -rn '8.6226'` non trova in NESSUN file del repo, ne' misurato ne'
# derivato: esiste solo nel piano che lo cita.

CUCITURE = {

    'porta_locale_tecnico': {
        'x_m': 0.0,
        'normale': '+X',
        'stato': 'CONFLITTO',
        'valori': {
            'corridor.py': {
                'larghezza_m': 0.85,   # LARGHEZZA_CORRIDOIO, riga 92
                'altezza_m': 2.00,     # ALTEZZA_LIBERA, riga 93
                'fonte': 'corridor.py:92-93 e 122-131',
                'nota': 'il file stesso scrive: «valore di partenza ragionato, '
                        'NON misurato — vedi ciao.md §15»',
            },
            'mechanism_bay.py': {
                'larghezza_m': 0.70,   # PORTA_LARG, riga 126
                'altezza_m': 1.90,     # PORTA_ALT, riga 127
                'fonte': 'mechanism_bay.py:126-128',
                'nota': 'porta stagna',
            },
        },
        'scarto': 'la porta e\' 15 cm piu\' STRETTA e 10 cm piu\' BASSA '
                  'dell\'apertura che il corridoio si aspetta. Assemblati '
                  'cosi\', il corridoio sbuca su una parete con una porta piu\' '
                  'piccola del proprio vano: 7,5 cm di risega per lato e 10 cm '
                  'di architrave.',
        'decide': 'IL COMMITTENTE. Non e\' una svista da correggere al ribasso: '
                  'una porta stagna PUO\' legittimamente essere piu\' piccola '
                  'del corridoio (e su una nave vera spesso lo e\'), oppure il '
                  'corridoio va stretto a 0,70. Sono due navi diverse, e la '
                  'scelta non e\' geometrica.',
    },

    'aperture_alte': {
        'x_m': [0.000, 5.480],
        'alzata_m': 2.10,
        'stato': 'DERIVATO',
        'fonte': 'corridor.py:113 — LUNGHEZZA_TOTALE = 4.48 + 1.00',
    },

    'vano_salone': {
        'x_m': [-2.1746, 0.0],
        'y_m': [0.0, 1.1449],
        'stato': 'MISURATO',
        'fonte': 'guscio-salone.py, e riscontrato in prove/00-inventario.txt',
    },

    'paratia_poppa': {
        'x_m': None,
        'stato': 'SENZA FONTE',
        'fonte': None,
        'nota': 'Piano.md dichiarava X = 8,6226..8,7226. '
                '`grep -rn "8.6226"` su tutto il repo, esclusi i blob JSON di '
                'geometria, non trova NIENTE: ne\' misurato ne\' derivato. '
                'Il numero e\' stato rimosso dalla tabella invece di essere '
                'ricopiato: un valore senza fonte in una tabella di riferimento '
                'diventa, fra un mese, indistinguibile da uno misurato.',
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# 5 · GLI STRUMENTI CHE I QUATTRO MODULI IMPORTANO
# ─────────────────────────────────────────────────────────────────────────────

def collezione(nome, padre=None):
    """
    Crea (o ritrova) una collezione e la aggancia al padre, o alla scena.

    Ritrova invece di ricreare: i quattro moduli si eseguono anche uno per
    volta, per provarli, e alla seconda esecuzione Blender crea
    `WORLD_ROOT.001` senza dire niente. Due radici omonime in una scena sono
    la versione locale dello stesso difetto che questo file esiste per curare.
    """
    import bpy
    c = bpy.data.collections.get(nome)
    if c is None:
        c = bpy.data.collections.new(nome)
    agganciata = any(c.name in p.children for p in bpy.data.collections) \
        or c.name in bpy.context.scene.collection.children
    if not agganciata:
        (padre.children if padre else bpy.context.scene.collection.children).link(c)
    return c


def radice():
    """`WORLD_ROOT` e le sue figlie, gia' agganciate. Una sola per scena."""
    r = collezione('WORLD_ROOT')
    for n in COLLEZIONI[1:]:
        collezione(n, r)
    return r


def verifica_cucitura(nome, modulo, larghezza_m=None, altezza_m=None):
    """
    Chiamata da un modulo per DICHIARARE le proprie quote di cucitura.

    Se la cucitura e' in conflitto e il modulo porta un valore che non e'
    quello registrato per lui, si alza un errore. Non e' pedanteria: e' l'unico
    modo perche' un disaccordo fra due file diventi un ERRORE invece di una
    compenetrazione da scoprire guardando la viewport tre settimane dopo.

    E finche' la cucitura resta `CONFLITTO`, l'errore contiene entrambi i
    numeri e dice chi deve decidere -- perche' la decisione non e' mia.
    """
    c = CUCITURE.get(nome)
    if c is None:
        raise KeyError(
            'cucitura «%s» non dichiarata in world_root.py. '
            'Le cuciture si dichiarano qui, con la loro fonte, prima di usarle.'
            % nome)

    if c['stato'] != 'CONFLITTO':
        return c

    atteso = c['valori'].get(modulo)
    if atteso is None:
        raise KeyError('il modulo «%s» non ha un valore registrato per «%s»' % (modulo, nome))

    for chiave, dato in (('larghezza_m', larghezza_m), ('altezza_m', altezza_m)):
        if dato is None:
            continue
        if abs(dato - atteso[chiave]) > 1e-6:
            raise ValueError(
                '%s dichiara %s = %.4f ma world_root.py ha registrato %.4f per '
                'quel modulo. Se il numero e\' cambiato, aggiorna la tabella e '
                'la sua fonte: non due posti.' % (modulo, chiave, dato, atteso[chiave]))

    altri = {m: v for m, v in c['valori'].items() if m != modulo}
    raise SystemExit(
        '\n  CUCITURA IN CONFLITTO: %s\n'
        '    %s dichiara  %.2f x %.2f m\n'
        '    %s\n'
        '  %s\n'
        '  DECIDE: %s\n'
        '  Finche\' non e\' deciso, l\'assemblaggio si ferma qui invece di '
        'produrre un modello sbagliato.\n'
        % (nome, modulo, atteso['larghezza_m'], atteso['altezza_m'],
           '\n    '.join('%s dichiara  %.2f x %.2f m'
                         % (m, v['larghezza_m'], v['altezza_m'])
                         for m, v in altri.items()),
           c['scarto'], c['decide']))


def riepilogo():
    """Stampa il frame e lo stato delle cuciture. Serve al referto."""
    print('FRAME COMUNE DELLA TRAVERSATA')
    print('  unita\'   : %s  (1 unita\' di scena = %.1f m)' % (UNITA, 1 / UNITA_SCENA_PER_METRO))
    print('  origine  : %s' % ORIGINE)
    for a, v in ASSI.items():
        print('  %s       : %s' % (a, v))
    print('')
    print('COLLOCAZIONI (dove va ciascun pezzo, e da cosa deriva)')
    for nome, c in COLLOCAZIONI.items():
        v = c.get('traslazione_m') or c.get('aggancio_m')
        print('  %-16s %-9s  X %+.3f  Y %+.3f  Z %+.3f'
              % (nome, c['stato'], v[0], v[1], v[2]))
    print('\nCUCITURE')
    for nome, c in CUCITURE.items():
        print('  %-24s %s' % (nome, c['stato']))
        if c['stato'] == 'CONFLITTO':
            for m, v in c['valori'].items():
                print('      %-20s %.2f x %.2f m   (%s)'
                      % (m, v['larghezza_m'], v['altezza_m'], v['fonte']))
        elif c.get('fonte'):
            print('      fonte: %s' % c['fonte'])
        else:
            print('      SENZA FONTE — non costruirci contro')
    aperte = [n for n, c in CUCITURE.items() if c['stato'] in ('CONFLITTO', 'SENZA FONTE')]
    print('\n  %d cuciture su %d non sono utilizzabili: %s'
          % (len(aperte), len(CUCITURE), ', '.join(aperte)))


if __name__ == '__main__':
    riepilogo()
