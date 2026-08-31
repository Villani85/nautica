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

ORIGINE = ("il nodo CAMERA_SORGENTE_SALONE di public/modelli/guscio-salone.glb: "
           "la posa da cui la traversata arriva nel salone")

ORIGINE_POSIZIONE_GLB = (-2.93219995, 0.607200027, 0.843599975)
ORIGINE_QUATERNIONE_GLTF = (-0.0215489268, -0.580615103, -0.0122757656, 0.813800395)
"""
SECONDO RIANCORAGGIO, E IL PRIMO ERA SBAGLIATO IN UN MODO CHE SI POTEVA VEDERE.

Il primo giro ancorava al vano del salone perche' era l'unica cucitura MISURATA.
Il ragionamento reggeva, la scelta no -- e la contraddizione stava DENTRO
QUESTA STESSA TABELLA, a otto righe di distanza:

    vano_salone            dichiara x_m e y_m, e nessun z_m
                           -> un'apertura estesa in X e Y a un solo Z ha la
                              normale lungo Z
    porta_locale_tecnico   dichiara normale '+X'

Farle combaciare era geometricamente impossibile, e non serviva eseguire niente
per accorgersene. La FORMA lo diceva da sola: 2,1746 largo per 1,1449 alto e'
un rettangolo orizzontale quasi due a uno. Una porta e' verticale e alta almeno
1,90. **1,14 m non e' un passaggio per una persona: e' una finestra**, e lo era
gia' quando quel numero e' entrato in tabella come MISURATO.

Sono serviti tre agenti e un'esecuzione in Blender per trovare una cosa che
l'aritmetica diceva prima. La lezione non e' su di loro: e' che il contratto e'
la cosa che tutti gli altri prendono per vera, quindi la prossima ancora si
controlla con i numeri PRIMA di scriverla qui.

--- PERCHE' UN NODO CAMERA, e non un'altra apertura

1. E' MISURATO davvero: letto dal GLB spedito, non ricostruito. Lo legge
   `camera_path.py:74-93`, che apre il binario e cerca il nodo per nome.
2. L'arrivo della traversata resta ESATTO PER COSTRUZIONE, non per tolleranza:
   `camera_path.py:254` scrive che P4 e' esatto proprio perche' E' quel nodo.
   Ancorandoci il mondo, l'errore d'arrivo non si accumula lungo la catena --
   e il punto d'arrivo e' la cosa che tutto questo lavoro deve servire.
3. **Un nodo camera porta posizione E ORIENTAMENTO.** E' esattamente cio' che
   serve a un'origine. Un piano ne porta uno solo, e la sua normale era
   abbastanza ambigua da ingannare il contratto e tre agenti.

--- COSA SI PRENDE E COSA NO

Si prende la POSIZIONE come origine. NON si ruota il mondo sul quaternione: gli
assi restano quelli del GLB del guscio, cioe' quelli della nave. Un mondo che
segue lo sguardo della camera renderebbe «avanti» una direzione che cambia con
l'inquadratura.

Il quaternione si conserva come POSA D'ARRIVO DICHIARATA: e' il dato che rende
esatto P4, e va tenuto dove chiunque lo trova.
"""

# ─────────────────────────────────────────────────────────────────────────────
# 2-ter · IL GUSCIO E APERTO DA UNA PARTE, e la misura mancante era li dentro
# ─────────────────────────────────────────────────────────────────────────────
#
# Avevo scritto che per riderivare il corridoio serviva "una misura che nessuno
# ha fatto: dove sta la porta del salone rispetto al finestrone". Sbagliato di
# nuovo, e nello stesso modo delle altre due volte oggi: la misura ESISTEVA,
# nella geometria gia spedita, e non l avevo guardata.
#
# Il GLB del guscio ha otto maglie con otto nomi. Misurate in Blender 5.2 nel
# frame del mondo, con la permutazione glTF Y-up -> Blender Z-up applicata
# (senza quella i numeri escono sbagliati: e lo stesso inciampo che ad A2 era
# costato il 412% di scarto, e ci sono ricascato al primo tentativo):
#
#   parete del finestrone   Y +0,843..+0,964   davanti, montante, sopra_vano,
#                                              sotto_vano, col buco del vano a
#                                              X 0,758..2,932  Z -0,607..+0,538
#   fondo                   X +8,932..+9,052
#   opposta                 Y -3,851..-3,731
#   pavimento               Z -1,250..-1,170
#   soffitto                Z +1,180..+1,260
#
#   X = -0,800              NIENTE.
#
# Cinque pareti e un estremita APERTA. Non e una dimenticanza: e la regola del
# contratto §3.2 applicata -- il guscio esiste solo dove la fotografia lo
# sostiene, e oltre deve consegnare a una paratia, una porta, un ombra vera.
# Quell estremita E il punto di consegna, ed e li che arriva il corridoio.
#
# Quindi l ingresso del salone non e una porta da disegnare: e un piano
# misurato, X = -0,800, alto 2,350 e largo 4,574. L apertura del corridoio,
# 0,85 x 2,00, ci sta dentro.
#
# LA PROVA CHE LA MISURA E BUONA: il vano misurato per questa via,
# X 0,758..2,932 e Z -0,607..+0,538, combacia con quello che C4 ha consegnato
# eseguendo saloon.py (0,757541..2,932085 e -0,607138..+0,537865). Due strade
# indipendenti, stessi numeri.

RISALITA_CORRIDOIO_M = 2.10
LUNGHEZZA_CORRIDOIO_M = 5.480

def origine_quaternione(convenzione):
    """
    Il quaternione dell origine, NELLA CONVENZIONE CHIESTA.

    ─── VENTI RIGHE CHE CHIUDONO UN ERRORE CHE NON DA MESSAGGI

    `ORIGINE_QUATERNIONE_GLTF` e nell ordine glTF, (x, y, z, w).
    `mathutils.Quaternion()` di Blender vuole (w, x, y, z). Passare la tupla
    cosi com e:

        letta come glTF      w = +0,8138   ->  rotazione   71,1 gradi
        letta come Blender   w = -0,0215   ->  rotazione  182,5 gradi

    e la NORMA E 1,000000 in tutti e due i casi. Nessun errore, nessun avviso:
    il pezzo esce ruotato di centoundici gradi e sembra un problema di
    modellazione. Si perdono due giri a cercarlo nella geometria.

    Il nome del campo lo dice gia -- ma lo dice a chi sa gia che esiste una
    differenza, cioe a chi non ne ha bisogno. Questa funzione lo dice a tutti,
    e rifiuta chi non dichiara in che convenzione lo vuole.
    """
    x, y, z, w = ORIGINE_QUATERNIONE_GLTF
    if convenzione == "gltf":
        return (x, y, z, w)
    if convenzione == "blender":
        return (w, x, y, z)
    raise ValueError(
        "convenzione «%s» non riconosciuta: usa 'gltf' (x,y,z,w) oppure "
        "'blender' (w,x,y,z). Non c e un valore predefinito, e non deve "
        "esserci: il predefinito sarebbe giusto per meta dei chiamanti e "
        "sbagliato in silenzio per l altra meta." % (convenzione,))


def verifica_nomi(tabella, nome_tabella):
    """
    Rifiuta i valori che non dichiarano la propria unita e il proprio frame.

    ─── LA CURA, E NON E L ATTENZIONE

    Il 31 agosto la stessa specie di errore e passata CINQUE volte in un
    pomeriggio, e nessuna era un errore di calcolo:

      1  assi glTF Y-up letti come Blender Z-up      412% di scarto
      2  frame locale del pezzo letto come mondo     8,7 m di scarto
      3  MiB letti come MB                           verde falso su budget sfondato
      4  un numero cercato come stringa, non come somma  «senza fonte» per un valore giusto
      5  il vano misurato preso per una porta        la curva passa dalla finestra

    Sono tutte GRANDEZZE GIUSTE LETTE IN UN SISTEMA CHE NON ERA IL LORO. Nessuna
    da messaggio: danno un numero plausibile, ed e per questo che passano.
    L attenzione c e stata, ed e costata cinque volte lo stesso.

    Quindi il nome porta il sistema, e chi non lo porta viene RIFIUTATO -- non
    accettato con un avviso. Un avviso lo si legge la prima volta.
    """
    SENZA_SUFFISSO = ("stato", "fonte", "nota", "formula", "decide", "scarto",
                      "valori", "stato_precedente", "normale")
    guai = []
    for chiave, voce in tabella.items():
        if not isinstance(voce, dict):
            continue
        for k in voce:
            if k in SENZA_SUFFISSO:
                continue
            ok = ("_m", "_MB", "_gltf", "_blender", "_locale", "_mondo", "_deg")
            if k.endswith(ok) or "_m_" in k:
                continue
            guai.append("%s.%s.%s" % (nome_tabella, chiave, k))
    if guai:
        raise ValueError(
            "questi valori non dichiarano unita e frame nel proprio nome: %s. "
            "  `x_m` non `x`; `peso_MB` non `peso`; `_gltf`/`_blender` su ogni "
            "terna e ogni quaternione; `_locale`/`_mondo` su ogni coordinata, "
            "anche quando e ovvio -- gli 8,622575 erano ovvi anche loro."
            % ", ".join(guai))
    return True


def dal_frame_guscio(p):
    """
    Porta un punto dal frame del GLB del guscio al frame del mondo.

    E' una sola sottrazione perche' il mondo NON ruota rispetto al guscio: vedi
    sopra. Esiste come funzione, e non come tre sottrazioni sparse, perche' il
    riancoraggio di oggi ha invalidato tutte le coordinate assolute consegnate
    stamattina -- e la prossima volta deve costare una riga sola.
    """
    o = ORIGINE_POSIZIONE_GLB
    return (p[0] - o[0], p[1] - o[1], p[2] - o[2])


COLLOCAZIONI = {
    "SALOON_SHELL": {
        "traslazione_m": (-ORIGINE_POSIZIONE_GLB[0],
                          -ORIGINE_POSIZIONE_GLB[1],
                          -ORIGINE_POSIZIONE_GLB[2]),
        "stato": "MISURATO",
        "formula": ("il guscio si sposta dell'opposto della posizione del nodo "
                    "camera, cosi' quel nodo cade sull'origine."),
    },
    "STAIR_CORRIDOR": {
        # apertura lato salone in locale (5,480 | 2,10) -> estremita' aperta del
        # guscio (-0,800 | -1,170). Vedi la nota "il guscio e aperto da una parte".
        "traslazione_m": (-6.280, -3.270, 0.0),
        "stato": "DERIVATO",
        "formula": ("X: -0,800 - 5,480 = -6,280.  Y: -1,170 - 2,10 = -3,270. "
                    "Il primo giro la faceva mappare sul VANO, che e' il "
                    "finestrone: derivazione caduta. La misura giusta e' "
                    "l'estremita' APERTA del guscio, misurata in Blender."),
    },
    "MECHANISM_BAY": {
        # il PUNTO su cui deve cadere ER_paratia_poppa, non una traslazione.
        "cucitura_mondo_m": (-6.280, -3.270, 0.0),
        # e la feature che ci deve cadere sopra, nel sistema locale del pezzo.
        "cucitura_locale_x_m": 8.622575,
        # da cui: X_MB0 = -6,280 - 8,622575 = -14,902575
        "traslazione_x_derivata_m": -14.902575,
        "stato": "DERIVATO",
        "formula": ("il corridoio arriva a X -6,280 (la sua apertura lato locale "
                    "tecnico, locale x=0). Li' deve cadere ER_paratia_poppa, che "
                    "nel sistema del pezzo sta a X_MB0 + 8,622575 -- cioe' il "
                    "numero che Piano.md portava come paratia fantasma. Non era "
                    "inventato e non era senza fonte: era la POSIZIONE DELLA "
                    "PORTA, giusta, nel frame sbagliato. Tradotta: "
                    "X_MB0 = -6,280 - 8,622575 = -14,902575."),
    },
}
"""
LE COORDINATE ASSOLUTE CONSEGNATE STAMATTINA SONO MORTE, e le misure no.

Riancorare invalida i piazzamenti di C2, C3 e C4. Restano invece valide -- e
sono la ragione per cui questo giro non e' sprecato -- tutte le loro MISURE:

  gli scarti del vano sotto il millimetro (0,059 · 0,115 · 0,062 · 0,165)
  gli 855,1 mm fra soffitto del corridoio e bordo del vano
  le normali ortogonali fra le due aperture
  la derivazione 8,622575 = AISLE_PRUA + VANO_ATT_DX + AISLE_MEDIANA
                            + SP_PARATIA + LUNGHEZZA_SALA_MACCHINE

Rifare il piazzamento adesso, con tre pezzi, costa un'ondata. Rifarlo dopo
l'assemblatore costa una giornata.
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

    'ingresso_salone': {
        'x_m': -0.800,
        'altezza_libera_m': [-1.170, 1.180],
        'larghezza_libera_m': [-3.731, 0.843],
        'stato': 'MISURATO',
        'fonte': 'misurato in Blender 5.2 sul GLB spedito: il guscio ha CINQUE '
                 'pareti e nessuna a X = -0,800. Vedi la nota sotto.',
        'stato_precedente': 'CONFLITTO',
        'valori': {
            'corridor.py': {
                'larghezza_m': 0.85,
                'altezza_m': 2.00,
                'fonte': 'apertura lato salone, misurata su esecuzione Blender: '
                         'x 0,000 · y pavimento 0,000 · y soffitto 2,000 · '
                         'z -0,425..0,425 · normale +X',
                'nota': 'una PORTA: si attraversa camminando, normale lungo la '
                        'direzione di marcia',
            },
            'guscio-salone.py': {
                'larghezza_m': 2.174659,
                'altezza_m': 1.145065,
                'fonte': 'il vano misurato, x -2,174659..-0,000115 · '
                         'y 0,000062..1,145065 · normale +Z',
                'nota': 'un FINESTRONE: si guarda attraverso, normale verso la '
                        'murata',
            },
        },
        "scarto": ("il soffitto dichiarato dal corridoio sta 855,1 mm PIU IN ALTO "
                   "del bordo superiore del vano. Ma la quota e il problema minore: "
                   "le due aperture hanno NORMALI ORTOGONALI fra loro, +X contro +Z. "
                   "Non sono la stessa apertura vista in due modi: sono due aperture "
                   "diverse."),
        "decide": ("NESSUNO per ora: e un difetto del contratto, non una scelta. "
                   "Vedi la nota: il vano non e una porta."),
    },

    'vano_salone': {
        # NEL FRAME DEL MONDO, cioe' gia' tradotte dal frame del guscio.
        'x_m': [0.757541, 2.932085],
        'y_m': [-0.607138, 0.537865],
        'x_m_guscio': [-2.174659, -0.000115],
        'y_m_guscio': [0.000062, 1.145065],
        'stato': 'MISURATO',
        'fonte': 'misurato da C4 eseguendo saloon.py in Blender 5.2; concorda '
                 'con posa.json e prove/00-inventario.txt entro 0,165 mm',
        "nota": ("E UNA FINESTRA, NON UNA PORTA: 2,17 largo per 1,15 alto e un "
                 "rettangolo orizzontale quasi due a uno, e la normale corre "
                 "lungo Z. Ci si guarda attraverso, non ci si cammina. Lo diceva "
                 "gia la forma, prima che tre agenti lo trovassero eseguendo."),
    },

    'paratia_poppa': {
        'x_m': None,
        'stato': 'TRADOTTO',
        'fonte': 'AISLE_PRUA + VANO_ATT_DX + AISLE_MEDIANA + SP_PARATIA + '
                 'LUNGHEZZA_SALA_MACCHINE = 8,622575 in mechanism_bay.py',
        "nota": ("IL NUMERO E GIUSTO, E IL FRAME A ESSERE SBAGLIATO -- e la "
                 "distinzione decide la riparazione. Un valore SENZA FONTE si "
                 "abbandona; un valore giusto nel frame sbagliato si TRADUCE. "
                 "Avevo concluso la prima perche un grep della stringa 8.6226 "
                 "non trovava niente: ma quel numero non e scritto da nessuna "
                 "parte, e CALCOLATO dalle costanti del pezzo. Un grep che non "
                 "pesca un calcolo e l immagine speculare di un grep che pesca "
                 "un commento, e oggi mi hanno fatto sbagliare entrambi. "
                 "Piano.md lo dichiarava come paratia di poppa a X = 8,6226: "
                 "va tradotto nel frame del mondo, non ricopiato e non buttato."),
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
        t = c.get('traslazione_m')
        v = t if t is not None else c.get('cucitura_mondo_m')
        if v is None:
            print('  %-16s %-13s  -- da riderivare' % (nome, c['stato']))
            continue
        print('  %-16s %-13s  %-18s X %+.3f  Y %+.3f  Z %+.3f'
              % (nome, c['stato'],
                 'traslazione' if t is not None else 'punto di cucitura',
                 v[0], v[1], v[2]))
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


# Le due tabelle si verificano AL CARICAMENTO, non su richiesta: un controllo
# che bisogna ricordarsi di chiamare e' un controllo che un giorno nessuno
# chiama. Chi importa questo contratto lo importa gia' verificato.
verifica_nomi(CUCITURE, 'CUCITURE')
verifica_nomi(COLLOCAZIONI, 'COLLOCAZIONI')


if __name__ == '__main__':
    riepilogo()
