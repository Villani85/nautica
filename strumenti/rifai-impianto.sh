#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# RIFA' L'IMPIANTO DA ZERO: geometria, atlante, cottura, mappe, GLB.
#
#     sh strumenti/rifai-impianto.sh
#
# Esiste perche' la catena giusta ha SEI numeri che non sono predefiniti, e
# ognuno viene da una misura. Lasciarli nella cronologia di una shell voleva
# dire che fra due settimane non li sapeva piu' nessuno, e che il primo che
# rigenerava il modello lo peggiorava senza accorgersene.
#
#   --forma AABB        l'atlante col predefinito CONVEX e' rosso sul modello
#                       corrente: bleed 6 px su 8 chiesti. Non si abbassa la
#                       richiesta, si cambia forma
#   --estrusione 0.0005 il cage: lo smusso piu' largo dell'assieme e' 3 mm
#   --raggio 0.006      due volte lo smusso piu' largo
#   --campioni 256      conta davvero solo da quando il campionamento adattivo
#                       e' spento: a 64 e a 512 i numeri erano IDENTICI
#   --max-macchie 0.6   derivata, non scelta: su questo soggetto la cottura
#                       sana da' 0,18% e una patologica 2,06%. La media
#                       geometrica e' 0,61. Il predefinito 0,05 viene da un
#                       provino a forma di cubo e qui non e' raggiungibile
#   --distanza-ao 0.06  6 cm, come la vecchia cottura sui vertici. Col
#                       predefinito (1/8 della diagonale = 53 cm) l'occlusione
#                       esce NERA: media 0,004 sull'albero, 0,217 sulla pinna
#
# E l'occlusione si spedisce a 512 e a un canale: dei tre canali dell'ORM solo
# R porta informazione nuova, ed e' a bassa frequenza. Il PNG va in RGB, non in
# grigio: Blender non riesce a riesportare un PNG a un canale e salta
# l'immagine con un errore che non ferma l'esportazione.
set -e
B="${BLENDER:-/c/Program Files/Blender Foundation/Blender 5.2/blender.exe}"
R="$(cd "$(dirname "$0")/.." && pwd)"
U="$R/riferimenti/blender/uscite"
C="$U/cottura-nuova"
mkdir -p "$C"

echo "── 1/5  geometria + atlante + alta/bassa"
MSYS_NO_PATHCONV=1 "$B" -b -P "$R/riferimenti/blender/cuoci-impianto.py" -- prepara \
  | grep -E "^UV |SROTOLAMENTO|TOTALE |UNITI"

echo "── 2/5  cottura normale + ORM a 2048"
MSYS_NO_PATHCONV=1 "$B" -b -P "$R/riferimenti/blender/cottura.py" -- \
  "$U/impianto-cottura.blend" IMPIANTO_ALTA IMPIANTO_BASSA "$C" 2048 \
  --estrusione 0.0005 --raggio 0.006 --campioni 256 \
  --max-macchie 0.6 --distanza-ao 0.06 \
  | grep -E "cotta dentro|informazione|macchie \(|ORM |ACCETTATA|RIFIUTATA"

echo "── 3/5  occlusione: solo il canale R, a 512, in RGB"
ffmpeg -y -v error -i "$C/impianto_bassa-orm.png" \
  -vf "extractplanes=r,scale=512:512,format=rgb24" -pix_fmt rgb24 \
  "$C/impianto_bassa-ao.png"

echo "── 4/5  GLB con UV, tangenti e le due mappe"
MSYS_NO_PATHCONV=1 "$B" -b -P "$R/riferimenti/blender/glb-impianto.py" -- "$U" \
  | grep -E "^UV |^BASSA |^TRIANGOLI |^MAPPE |^GLB "

echo "── 5/5  meshopt, con la guardia sul contratto"
node "$R/strumenti/comprimi-modello.mjs" "$U/impianto.glb" "$R/public/modelli/impianto.glb"

echo
echo "FATTO. Adesso: npm run build && npm run collaudo"
