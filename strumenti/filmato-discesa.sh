#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
#  LA DISCESA: dal salone, fuori dal finestrone, giu' fino al meccanismo.
#
#      sh strumenti/filmato-discesa.sh <sorgente.mp4>
#
#  Perche' e' un filmato e non 3D: a trenta metri la nave in tempo reale non
#  regge il confronto con una fotografia, e il committente l'ha detto senza
#  giri -- «per evitare che si veda quel modellino che sembra plastica». Il 3D
#  riprende il comando sul primo piano del meccanismo, dove e' vero e si comanda.
#
#  ─── I PARAMETRI, E PERCHE' PROPRIO QUESTI
#
#  -g 12  Un keyframe ogni mezzo secondo. NON e' un parametro di qualita': e'
#         cio' che rende il filmato SCORREVOLE ALLO SCORRIMENTO. Un video
#         scrubbato deve poter saltare a un istante qualunque, e senza keyframe
#         fitti il decodificatore deve ripartire dall'ultimo -- si vede come
#         scatti proprio mentre l'utente trascina. Costa: 953 KB contro i 766
#         della stessa qualita' con i keyframe di serie.
#
#  crf 32 Misurato su tre valori: 30 -> 927 KB, 32 -> 766, 34 -> 636 (senza -g).
#         Questa e' la parte fotorealistica del sito, cioe' la ragione per cui
#         il filmato esiste: qui il byte si spende.
#
#  1152x648  Il fotogramma di consegna si confronta a 1280x720 e la differenza
#         non si vede, perche' il video non arriva mai a occupare il pixel
#         nativo: sotto c'e' sempre la pagina che lo scala.
#
#  Il tetto dei filmati e' 4,2 MB e `strumenti/peso.mjs` lo sorveglia.
# ─────────────────────────────────────────────────────────────────────────────
set -e
SORGENTE="$1"
[ -n "$SORGENTE" ] || { echo "uso: sh strumenti/filmato-discesa.sh <sorgente.mp4>"; exit 2; }
USCITA=public/filmati/discesa.mp4

ffmpeg -v error -y -i "$SORGENTE" -an \
  -c:v libx264 -crf 32 -preset veryslow \
  -g 12 -keyint_min 12 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart \
  -vf scale=1152:648 "$USCITA"

echo "scritto $USCITA"
ls -l "$USCITA" | awk '{printf "  %.0f KB\n", $5/1024}'
