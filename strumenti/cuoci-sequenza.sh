#!/bin/sh
# Cuoce una posa per volta. Ogni fotogramma e' un processo Blender a se': se
# uno muore, gli altri restano, e si riprende da dove si era fermati invece di
# ricominciare.
B="/c/Program Files/Blender Foundation/Blender 5.2/blender.exe"
FUORI="$1"
N="${2:-24}"
i=0
while [ "$i" -lt "$N" ]; do
  f=$(printf '%s/fotogramma-%03d.png' "$FUORI" "$i")
  if [ ! -f "$f" ]; then
    POSA=$i LATO=dritta CUOCI_CPU=1 "$B" -b -P riferimenti/blender/cuoci.py -- meccanismo.json "$FUORI" >/dev/null 2>&1
    [ -f "$f" ] && echo "posa $i fatta" || { echo "posa $i ROTTA"; exit 1; }
  fi
  i=$((i + 1))
done
echo "SEQUENZA COMPLETA: $N fotogrammi"
