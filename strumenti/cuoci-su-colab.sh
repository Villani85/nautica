#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# LA COTTURA DELLE MACCHINE SU UNA T4 DI COLAB.
#
#     sh strumenti/cuoci-su-colab.sh [propulsione|giroscopio ...]
#
# Prende i `<quale>-cottura.blend` che `cuoci-macchine.py` ha gia' scritto in
# locale, li cuoce su GPU remota, e riporta a casa i quattro PNG. Da li' in poi
# il lavoro torna in locale: ridimensionamento, GLB, meshopt, cancelli.
#
# ─── PERCHE' ESISTE QUESTO FILE E NON UN NOTEBOOK
#
# Perche' un modo di rigenerare un artefatto che vive solo dentro una sessione
# remota, fra due settimane non lo sa piu' nessuno. La sessione si chiude, la
# VM riparte vuota, e resta un PNG che nessuno sa piu' rifare. Il comandario
# sta qui accanto agli altri script del repo, come `rifai-impianto.sh`.
#
# ─── IL MOTIVO, CON IL NUMERO
#
# Su questo PC Cycles NON ha GPU. La stessa cottura, stessi parametri, stesso
# .blend, stesso Blender 5.2.0:
#
#     propulsione 2048, 256 campioni     CPU locale  185 s     T4  43,5 s
#     giroscopio  2048, 256 campioni                           T4  38,8 s
#
# 4,3 volte, e i cancelli di `cottura.py` danno numeri IDENTICI da una parte e
# dall'altra (macchie 0,7868% e 0,6204%): non e' una cottura diversa, e' la
# stessa cottura piu' in fretta.
#
# ─── SU COLAB CI VA IL CALCOLO, NON IL GIUDIZIO
#
# `collaudo-glb.mjs` e `npm run peso` girano in LOCALE, sui file scaricati.
# Un cancello che gira sulla stessa macchina che ha prodotto il file, dentro
# una sessione che poi sparisce, non e' un cancello: e' un'opinione.
#
# ─── LE TRAPPOLE, TUTTE GIA' PAGATE
#
#  · `MSYS_NO_PATHCONV=1` davanti a ogni comando con un path remoto. Senza,
#    Git Bash traduce `/content/x` in `C:/Program Files/Git/content/x` e il
#    server risponde 500.
#  · path remoti sempre ASSOLUTI sotto `/content`. Un path relativo finisce in
#    `/` mentre il kernel ha cwd `/content`, e poi `open()` non lo trova: il
#    file esiste, si scarica, e il codice remoto dice FileNotFoundError.
#  · `PYTHONIOENCODING=utf-8`, o le barre di avanzamento di apt/wget fanno
#    esplodere stdout su Windows con UnicodeEncodeError. Il lavoro remoto
#    riesce lo stesso: si perde solo l'output, che e' il modo peggiore di
#    perdere qualcosa.
#  · `colab exec` scade a 30 secondi di DEFAULT. Qui si passa `--timeout`
#    alto. Ma il timeout e' solo lato CLIENT: dopo un TimeoutError il kernel
#    remoto CONTINUA. Prima di rilanciare, si guarda `colab ls /content/cotto`.
#  · una sola sessione GPU per volta sul piano gratuito. Un secondo
#    `colab new --gpu` risponde `TooManyAssignmentsError`. Percio' qui la
#    sessione si RIUSA se c'e', e si crea solo se non c'e'.
#  · ogni VM riparte vuota: Blender va installato ogni volta (~41 s misurati).
#    La versione dev'essere la STESSA della locale — 5.2.0 — o il .blend puo'
#    non aprire.
#
# ─── E LA COSA CHE RENDE ONESTO TUTTO IL RESTO
#
# `cottura.py --gpu` non si limita a chiedere la GPU: accende OPTIX, controlla
# che ci sia davvero, e MUORE elencando i device se non c'e'. Serve perche' il
# guasto non passa da un'eccezione — su una macchina senza GPU, Cycles accetta
# `device='GPU'` e ripiega su CPU in silenzio, consegnando gli stessi PNG dopo
# ore. Verificato in ENTRAMBE le direzioni: su T4 stampa «OPTIX acceso su:
# Tesla T4», in locale muore con «Device visti: [('Intel Core 5 120U','CPU')]».
# Se un giorno qualcuno mette un `try/except` attorno a quella `raise`, questo
# script torna a mentire.
set -e
S="${SESSIONE:-cottura}"
R="$(cd "$(dirname "$0")/.." && pwd -W 2>/dev/null || pwd)"
U="$R/riferimenti/blender/uscite/macchine"
MACCHINE="${*:-propulsione giroscopio}"
export PYTHONIOENCODING=utf-8

# ── la sessione: si riusa, non si duplica ────────────────────────────────
if colab status -s "$S" 2>&1 | grep -q "Hardware"; then
  echo "SESSIONE  '$S' gia' viva: $(colab status -s "$S" 2>&1 | tail -1)"
else
  echo "SESSIONE  '$S' non c'e', la apro (T4)"
  colab new -s "$S" --gpu T4
fi

# ── Blender: si installa solo se manca, perche' la VM riparte vuota ──────
cat > /tmp/colab-prepara.py <<'PY'
import subprocess, time, os
if os.path.isfile('/content/blender/blender'):
    print('BLENDER  gia installato')
else:
    t = time.time()
    subprocess.run('apt-get -qq update && apt-get -qq install -y libxrender1 '
                   'libxxf86vm1 libxfixes3 libxi6 libxkbcommon0 libsm6 libgl1 libegl1',
                   shell=True, capture_output=True)
    subprocess.run('cd /content && wget -q -O b.tar.xz '
                   'https://download.blender.org/release/Blender5.2/'
                   'blender-5.2.0-linux-x64.tar.xz && tar xf b.tar.xz && '
                   'mv blender-5.2.0-linux-x64 blender && rm b.tar.xz',
                   shell=True, capture_output=True)
    print('BLENDER  installato in %.0f s' % (time.time() - t))
print(subprocess.run('nvidia-smi --query-gpu=name,memory.total,driver_version '
                     '--format=csv,noheader', shell=True, capture_output=True,
                     text=True).stdout.strip())
os.makedirs('/content/cotto', exist_ok=True)
PY
colab exec -s "$S" --timeout 900 < /tmp/colab-prepara.py

# ── su: lo script e le scene ─────────────────────────────────────────────
MSYS_NO_PATHCONV=1 colab upload "$R/riferimenti/blender/cottura.py" /content/cottura.py -s "$S" >/dev/null
for M in $MACCHINE; do
  test -f "$U/$M-cottura.blend" || {
    echo "ERRORE: manca $U/$M-cottura.blend."
    echo "Lo scrive cuoci-macchine.py, ed e' un passo LOCALE: la geometria e"
    echo "l'atlante UV si fanno qui, su Colab ci va solo la cottura."
    exit 1
  }
  MSYS_NO_PATHCONV=1 colab upload "$U/$M-cottura.blend" "/content/$M-cottura.blend" -s "$S" >/dev/null
  echo "SU        $M-cottura.blend"
done

# ── la cottura, con gli stessi parametri della catena locale ─────────────
#
# I numeri sono quelli derivati in `rifai-macchine.sh`, e stanno scritti li'
# con il conto che li ha scelti: qui si RIPETONO, non si reinventano. Se
# divergessero, si cuocerebbe con un tetto e si giudicherebbe con un altro.
cat > /tmp/colab-cuoci.py <<PY
import subprocess, time, json
PAR = ['--estrusione','0.0005','--raggio','0.005','--campioni','256',
       '--max-macchie','0.95','--distanza-ao','0.06','--gpu']
tempi = {}
for m in "$MACCHINE".split():
    rad = m.upper()
    cmd = ['/content/blender/blender','-b','--factory-startup','-P','/content/cottura.py','--',
           '/content/%s-cottura.blend' % m, rad+'_ALTA', rad+'_BASSA',
           '/content/cotto','2048'] + PAR
    t = time.time()
    r = subprocess.run(cmd, capture_output=True, text=True)
    tempi[m] = round(time.time() - t, 1)
    for riga in ((r.stdout or '') + (r.stderr or '')).splitlines():
        if any(k in riga for k in ('OPTIX','ACCETTATA','RIFIUTATA','macchie (',
                                   'ORM ','cotta dentro','informazione')):
            print('  ' + riga.strip())
    if r.returncode != 0:
        raise SystemExit('cottura di %s RIFIUTATA su Colab (rc=%s)' % (m, r.returncode))
    print('T4  %-12s %.1f s' % (m, tempi[m]))
print('TEMPI_T4=' + json.dumps(tempi))
PY
colab exec -s "$S" --timeout 3600 < /tmp/colab-cuoci.py

# ── giu': i PNG, dove la catena locale se li aspetta ─────────────────────
for M in $MACCHINE; do
  mkdir -p "$U/cottura-$M/spedito"
  for T in normale orm; do
    MSYS_NO_PATHCONV=1 colab download "/content/cotto/${M}_bassa-$T.png" \
      "$U/cottura-$M/${M}_bassa-$T.png" -s "$S" >/dev/null
  done
  echo "GIU'      cottura-$M/ (normale + orm a 2048)"
done

echo
echo "FATTO. La VM resta viva per un altro giro: quando hai finito,"
echo "  colab stop -s $S"
