#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# RIFA' GLI INTERNI DELL'ATTO DUE: griglia, geometria, compressione, provino.
#
#     sh strumenti/rifai-interni.sh            tutto
#     sh strumenti/rifai-interni.sh --senza-provino    solo il modello
#
# ─── PERCHE' ESISTE UNO SCRIPT E NON TRE COMANDI IN UNA CHAT
#
# Perche' i tre passi hanno un ORDINE che non e' evidente e una dipendenza che
# non da' errore se la si sbaglia: `glb-interni.py` legge `interni.json`, e se
# quel file e' vecchio costruisce interni giusti su uno scafo che non c'e' piu'.
# Nessun cancello lo direbbe -- il modello sarebbe valido, i nomi ci sarebbero
# tutti, il peso starebbe nel tetto. Si vedrebbe come un pagliolato che passa
# attraverso il fasciame, e si darebbe la colpa al modello.
#
# ─── I NUMERI CHE NON SONO PREDEFINITI, E DA DOVE VENGONO
#
#   81 stazioni campionate   50 cm di passo su 40 m. Sotto, il taglio dei
#                            pagliolati sulla forma dello scafo si vede a
#                            gradini vicino alla prua, dove la sezione cambia
#                            in fretta
#   passo ordinate 0,90 m    e' il passo di ossatura di un quaranta metri, ed e'
#                            anche il ritmo che in sezione dice «nave» invece
#                            che «scatola». A 1,5 m il fianco legge vuoto
#   occhio 1,55 m            la distanza fra l'occhio di `vaiACella` e il
#                            pagliolato. Non e' l'altezza d'occhio di una
#                            persona in piedi: e' quella che, MISURATA contro
#                            questo scafo, tiene tutti e tre i piani dentro il
#                            guscio. `esporta-interni.mjs` stampa l'altezza
#                            libera che ne risulta, stazione per stazione
#
# ─── LA COMPRESSIONE E' LA STESSA DEGLI ALTRI, E NON PER UNIFORMITA'
#
# `comprimi-modello.mjs` non comprime e basta: riapre il file d'uscita e
# verifica che ogni nome e ogni extra dell'ingresso siano sopravvissuti. Su
# questo modello sono tredici nomi piu' la radice, e gltfpack li cancella tutti
# se si scorda `-kn`. Misurato qui: 2658 KB -> 384 KB, 134,0 KB brotli.
set -e
B="${BLENDER:-/c/Program Files/Blender Foundation/Blender 5.2/blender.exe}"
# Percorso in forma WINDOWS: con la forma MSYS (/c/Users/...) Blender legge il
# `-P` come RELATIVO e cerca lo script dentro la cartella corrente. E' la stessa
# trappola gia' pagata in `rifai-impianto.sh`.
R="$(cd "$(dirname "$0")/.." && pwd -W 2>/dev/null || pwd)"
U="$R/riferimenti/blender/uscite"
mkdir -p "$U"

echo "── 1/4  la griglia e la forma dello scafo, lette dalle sorgenti vive"
node "$R/strumenti/esporta-interni.mjs" "$U/interni.json"

echo
echo "── 2/4  geometria: pagliolati, paratie, ossatura, scale, corredo"
MSYS_NO_PATHCONV=1 "$B" -b -P "$R/riferimenti/blender/glb-interni.py" -- "$U" \
  | grep -E "^SPORGENZA|^ +su |^MEZZERIA|^FUORI|^NODI|^TRIANGOLI|^INGOMBRO|^POZZI|^SCALE|^ORDINATE|^CORREDO|^APERTURE|^GLB"

echo
echo "── 3/4  meshopt, con la guardia sul contratto"
node "$R/strumenti/comprimi-modello.mjs" "$U/interni.glb" "$R/public/modelli/interni.glb"

# ─── 4/4  I PROVINI NON SI FANNO QUI
#
# Ordine del committente, e c'e' un numero che lo sostiene: su Cycles la parte
# di campionamento sulla T4 e' circa tredici volte piu' rapida della CPU di
# questa macchina (misurato: a 256 campioni, 92 s in locale contro 35 su T4).
# Sotto i 32 campioni il guadagno e' ZERO -- 28-29 s in locale contro 30 -- e la
# ragione e' che a quel punto il tempo e' quasi tutto costo fisso: costruzione
# della scena, import di quattro GLB, BVH, denoise.
#
# Quindi: provini leggeri qui se serve, e per tutto il resto
#
#     sh strumenti/provini-interni-colab.sh [pose]
#
# Se proprio serve in locale, il comando e' quello -- e stampa da solo che sta
# rendendo in CPU, invece di lasciarlo scoprire dal tempo:
#
#     CAMPIONI=32 blender -b -P riferimenti/blender/render-interni.py -- #       riferimenti/blender/uscite sezione-vicina
#
echo
echo "FATTO. Adesso: node strumenti/collaudo-glb.mjs && npm run build && npm run peso"
echo "E GUARDA $U/provino-interni-*.png"
