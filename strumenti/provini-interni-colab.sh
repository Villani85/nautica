#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# I PROVINI DEGLI INTERNI SU COLAB — calcolo remoto, giudizio in locale.
#
#     sh strumenti/provini-interni-colab.sh [pose,separate,da,virgole]
#
#     SESSIONE=nome   la sessione da usare (predefinito: cottura)
#     CAMPIONI=n      campioni Cycles (predefinito 48)
#
# ─── PERCHE' QUESTA RICETTA STA NEL REPO E NON IN UNA SESSIONE
#
# Perche' una sessione Colab e' una VM che sparisce -- ed e' sparita davvero
# mentre scrivevo questo file: `colab sessions` e' passato da «cottura, T4» a
# «No active sessions found», senza che nessuno avesse chiamato `colab stop`.
# Se il modo di rigenerare un artefatto vive solo dentro quella VM, se ne va con
# lei. E' la stessa ragione per cui esiste `rifai-impianto.sh` invece di sei
# comandi in una cronologia di shell.
#
# Percio' questo script **rimonta cio' che gli manca** invece di darlo per
# scontato: se Blender non c'e', lo installa; se la sessione non c'e', lo dice e
# spiega come aprirla. Non la apre da solo: sul piano gratuito ce n'e' UNA sola
# con GPU, e aprirne una a sorpresa vuol dire portarla via a qualcun altro.
#
# ─── IL CONFINE: SU COLAB CI VA IL CALCOLO, NON IL GIUDIZIO
#
# La T4 produce i PNG. Chi decide se dentro si legge qualcosa e' chi guarda le
# immagini QUI, e i cancelli sul modello (`collaudo-glb.mjs`, `npm run peso`)
# girano in locale sul file che si spedisce. Un numero che arriva da «una
# macchina con la T4» si tende a berlo, ed e' esattamente il modo in cui una
# misura sbagliata diventa autorevole.
#
# ─── LE TRAPPOLE DELLA CLI, GIA' PAGATE (skill `colab`)
#
#   MSYS_NO_PATHCONV=1   Git Bash converte gli argomenti che iniziano con `/`:
#                        senza, l'upload torna 500 Internal Server Error
#   ma il path LOCALE    ...con quella variabile attiva resta in forma MSYS
#                        (`/c/Users/...`), che la CLI -- programma Windows --
#                        non sa aprire. Serve `pwd -W`. Il guasto e' MUTO: lo
#                        script moriva su `set -e` senza una riga di errore,
#                        perche' l'uscita dell'upload andava a /dev/null
#   path remoti ASSOLUTI un path relativo finisce in `/`, mentre il kernel ha
#                        cwd `/content` e poi `open()` non lo trova
#   PYTHONIOENCODING     stdout su Windows e' cp1252 e le barre di avanzamento
#                        lo fanno esplodere con UnicodeEncodeError
#
# ─── NIENTE ATTESE CIECHE, E NON E' UNO STILE: E' CHE `exec` MENTE SUL TEMPO
#
# `colab exec` scade lato CLIENT, ma il kernel remoto CONTINUA. Un render lanciato
# in primo piano e andato in TimeoutError lascia una VM che lavora e un terminale
# che crede sia morto -- e chi rilancia paga il lavoro due volte. Qui Blender
# parte STACCATO, scrive un log, e lo si interroga a colpi brevi: ogni controllo
# stampa lo stato invece di stare appeso a un timeout.
#
# ─── E LA COSA CHE DECIDE SE IL RENDER VALE QUALCOSA
#
# Il render gira con `PRETENDI_GPU=1`. Senza, su una macchina senza OPTIX Cycles
# ripiega su CPU **in silenzio** e consegna i file dopo ore senza dire niente:
# non c'e' nessuna eccezione da prendere, quindi il guasto va cercato enumerando
# i dispositivi. Vedi `render-interni.py`, funzione `accendi_gpu`.
set -e
S="${SESSIONE:-cottura}"
# Percorso LOCALE in forma Windows: vedi la trappola qui sopra.
R="$(cd "$(dirname "$0")/.." && pwd -W 2>/dev/null || pwd)"
U="$R/riferimenti/blender/uscite"
POSE="$1"
export PYTHONIOENCODING=utf-8
E="MSYS_NO_PATHCONV=1"

echo "── sessione: $S"
if ! MSYS_NO_PATHCONV=1 colab ls /content -s "$S" > /dev/null 2>&1; then
  echo "   la sessione '$S' non risponde."
  echo "   aprila TU con:  colab new -s $S --gpu T4"
  echo "   (non la apro io: sul piano gratuito ce n'e' una sola con GPU, e"
  echo "    aprirla a sorpresa vuol dire portarla via a chi la stava usando)"
  exit 1
fi

echo "── Blender remoto"
# La stessa versione della locale, o il modello puo' non aprire allo stesso modo.
# Ogni VM riparte vuota: 11 s di apt piu' 35 di scaricamento, da ripagare a ogni
# sessione. Si controlla prima di pagarli.
MSYS_NO_PATHCONV=1 colab exec -s "$S" --timeout 600 <<'PY'
import os, subprocess
if os.path.isfile('/content/blender/blender'):
    print('gia installato:', subprocess.run(['/content/blender/blender', '-v'],
          capture_output=True, text=True).stdout.splitlines()[0])
else:
    subprocess.run('apt-get -qq update && apt-get -qq install -y libxrender1 '
                   'libxxf86vm1 libxfixes3 libxi6 libxkbcommon0 libsm6 libgl1 libegl1',
                   shell=True, check=True, capture_output=True)
    subprocess.run('cd /content && wget -q -O b.tar.xz '
                   'https://download.blender.org/release/Blender5.2/blender-5.2.0-linux-x64.tar.xz '
                   '&& tar xf b.tar.xz && mv blender-5.2.0-linux-x64 blender && rm b.tar.xz',
                   shell=True, check=True)
    print('installato:', subprocess.run(['/content/blender/blender', '-v'],
          capture_output=True, text=True).stdout.splitlines()[0])
PY

echo "── carico scena, macchine e script"
MSYS_NO_PATHCONV=1 colab exec -s "$S" --timeout 120 <<'PY'
import os
for d in ('/content/interni', '/content/interni/modelli'):
    os.makedirs(d, exist_ok=True)
print('cartelle pronte')
PY

for f in interni.json interni.glb; do
  MSYS_NO_PATHCONV=1 colab upload "$U/$f" "/content/interni/$f" -s "$S" > /dev/null
  echo "   $f"
done
# Le macchine servono davvero: il cancello e' «ponti sovrapposti, macchine
# sotto, un taglio solo», e senza di loro il provino misura la meta' facile --
# vuoti che si leggono benissimo perche' non c'e' niente dentro.
for f in propulsione.glb giroscopio.glb impianto.glb; do
  MSYS_NO_PATHCONV=1 colab upload "$R/public/modelli/$f" "/content/interni/modelli/$f" -s "$S" > /dev/null
  echo "   modelli/$f"
done
MSYS_NO_PATHCONV=1 colab upload "$R/riferimenti/blender/render-interni.py" \
  /content/interni/render-interni.py -s "$S" > /dev/null
echo "   render-interni.py"

echo "── avvio il render STACCATO (T4, PRETENDI_GPU=1)"
{
  echo "import subprocess, os"
  # ─── LD_LIBRARY_PATH, e il difetto che l'ha chiesto
  #
  # `import_scene.gltf` su un GLB meshopt moriva con
  #     Failed to load Meshopt decoder library: libmeshoptimizer.so:
  #     cannot open shared object file
  # mentre il file c'e' davvero, in `/content/blender/lib/`. Isolato con un
  # `find` sul Blender remoto: la build Linux la spedisce ma non la mette sul
  # percorso del loader, e su Windows non succede perche' la DLL sta accanto
  # all'eseguibile, che Windows guarda per primo. Quindi il guasto ESISTE SOLO
  # da remoto -- il provino locale passava, e sembrava che il problema fosse
  # Colab.
  #
  # Riguarda le tre MACCHINE (che sono compresse) e non `interni.glb`, che qui
  # si carica in forma grezza: infatti l'import degli interni era gia' andato a
  # buon fine, ed e' quello che ha detto dove guardare.
  echo "env = dict(os.environ, PRETENDI_GPU='1', MODELLI='/content/interni/modelli',"
  echo "           LD_LIBRARY_PATH='/content/blender/lib:' + os.environ.get('LD_LIBRARY_PATH', ''),"
  echo "           CAMPIONI='${CAMPIONI:-48}')"
  echo "cmd = ['/content/blender/blender', '-b', '--factory-startup',"
  echo "       '-P', '/content/interni/render-interni.py', '--', '/content/interni'"
  if [ -n "$POSE" ]; then echo "       , '$POSE'"; fi
  echo "       ]"
  echo "log = open('/content/interni/render.log', 'wb')"
  echo "p = subprocess.Popen(cmd, env=env, stdout=log, stderr=subprocess.STDOUT)"
  echo "open('/content/interni/render.pid', 'w').write(str(p.pid))"
  echo "print('avviato, pid', p.pid)"
} | MSYS_NO_PATHCONV=1 colab exec -s "$S" --timeout 120

echo "── attendo, stampando lo stato (ogni controllo dice come sta, non aspetta al buio)"
i=0
while [ "$i" -lt 60 ]; do
  stato=$(MSYS_NO_PATHCONV=1 colab exec -s "$S" --timeout 120 <<'PY'
import os, glob
vivo = os.path.isdir('/proc/%s' % open('/content/interni/render.pid').read().strip())
righe = [r for r in open('/content/interni/render.log', errors='replace').read().splitlines()
         if r.startswith(('POSA', 'OPTIX', 'CPU:', 'ATTENZIONE', 'Error', 'Traceback'))]
png = len(glob.glob('/content/interni/provino-interni-*.png'))
print('STATO %s png=%d' % ('vivo' if vivo else 'finito', png))
for r in righe[-8:]:
    print('  ' + r)
PY
)
  echo "$stato"
  case "$stato" in *"STATO finito"*) break ;; esac
  i=$((i + 1))
done

echo "── scarico i PNG"
elenco=$(MSYS_NO_PATHCONV=1 colab exec -s "$S" --timeout 120 <<'PY'
import glob, os
print(' '.join(os.path.basename(p) for p in sorted(glob.glob('/content/interni/provino-interni-*.png'))))
PY
)
for n in $elenco; do
  case "$n" in
    provino-interni-*.png)
      MSYS_NO_PATHCONV=1 colab download "/content/interni/$n" "$U/$n" -s "$S" > /dev/null
      echo "   $n"
      ;;
  esac
done

echo
echo "FATTO. La sessione resta accesa: fermarla e' del committente."
echo "E ADESSO GUARDA $U/provino-interni-*.png — il giudizio e' qui, non la'."
