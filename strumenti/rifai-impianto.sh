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
# Percorso in forma WINDOWS. Blender riceve `-P` come argomento, e con la
# forma MSYS (/c/Users/...) lo legge come RELATIVO: cercava
# "...nautica/c/Users/.../cuoci-impianto.py" e si fermava. `pwd -W` da la
# forma che Blender capisce.
R="$(cd "$(dirname "$0")/.." && pwd -W 2>/dev/null || pwd)"
U="$R/riferimenti/blender/uscite"
C="$U/cottura-nuova"
mkdir -p "$C"

echo "── 1/6  geometria + atlante + alta/bassa"
MSYS_NO_PATHCONV=1 "$B" -b -P "$R/riferimenti/blender/cuoci-impianto.py" -- prepara \
  | grep -E "^UV |SROTOLAMENTO|TOTALE |UNITI"

echo "── 2/6  cottura normale + ORM a 2048"
MSYS_NO_PATHCONV=1 "$B" -b -P "$R/riferimenti/blender/cottura.py" -- \
  "$U/impianto-cottura.blend" IMPIANTO_ALTA IMPIANTO_BASSA "$C" 2048 \
  --estrusione 0.0005 --raggio 0.006 --campioni 256 \
  --max-macchie 0.6 --distanza-ao 0.06 \
  | grep -E "cotta dentro|informazione|macchie \(|ORM |ACCETTATA|RIFIUTATA"

echo "── 3/6  le mappe che SPEDIAMO: 512, non 2048"
#
# Si cuoce a 2048 -- dove i cancelli di `cottura.py` sono tarati e verdi -- e si
# spedisce a 512. Non e' un compromesso, e' una misura: il recupero della
# normale, cioe' quanto della resa dell'alta riporta indietro, e' lo STESSO alle
# tre risoluzioni.
#
#     normale 2048   61,7% di recupero   modello 343,4 KB brotli
#     normale 1024   63,6%                        210,0
#     normale  512   62,5%                        160,7
#
# Le differenze sono dentro il rumore del render; i byte no. E sul filo contano
# davvero: la geometria meshopt si comprime ancora 2,4 volte con brotli, una
# texture webp per niente -- quindi una mappa grande e' peso che passa intero.
mkdir -p "$C/spedito"
ffmpeg -y -v error -i "$C/impianto_bassa-orm.png" -vf "extractplanes=r,scale=512:512,format=rgb24" -pix_fmt rgb24 "$C/spedito/impianto_bassa-ao.png"
ffmpeg -y -v error -i "$C/impianto_bassa-normale.png" -vf "scale=512:512" "$C/spedito/impianto_bassa-normale.png"

echo "── 4/6  GLB con UV, tangenti e le due mappe"
MAPPE="$C/spedito" MSYS_NO_PATHCONV=1 "$B" -b -P "$R/riferimenti/blender/glb-impianto.py" -- "$U" \
  | grep -E "^UV |^BASSA |^TRIANGOLI |^MAPPE |^GLB "

echo "── 5/6  l'occlusione a qualita ridotta -- e PRIMA di meshopt"
#
# L'esportatore di Blender ha UNA qualita' per tutte le immagini, e le due mappe
# non tollerano la stessa perdita: la normale codifica una direzione (un errore
# diventa un rilievo che non c'e'), l'occlusione e' un termine moltiplicativo
# d'ombra a bassa frequenza. Segnalato da fuori, coi numeri: l'AO pesava 51,7 KB
# contro i 33,3 della normale, il blocco piu' grosso del file.
#
# Il passo sta QUI e non dopo, ed e' una trappola che ho pagato: su un glTF gia'
# passato da meshopt i dati veri di una vista non stanno all'offset della vista
# ma dentro `EXT_meshopt_compression`, quindi riscrivendo il blob si ricopia
# altro e il file esce PIU' GRANDE. Misurato: dopo meshopt 160,7 -> 191,1 KB di
# brotli (con l'AO comunque scesa: un guadagno vero dentro una perdita piu'
# grossa). Prima di meshopt, 160,7 -> 139,4.
node "$R/strumenti/alleggerisci-mappe.mjs" "$U/impianto.glb" occlusione 60

echo "── 6/6  meshopt, con la guardia sul contratto"
node "$R/strumenti/comprimi-modello.mjs" "$U/impianto.glb" "$R/public/modelli/impianto.glb"

echo
echo "FATTO. Adesso: npm run build && npm run collaudo"
