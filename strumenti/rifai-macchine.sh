#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# RIFA' LE DUE MACCHINE DELL'ATTO DUE: geometria, atlante, cottura, mappe, GLB.
#
#     sh strumenti/rifai-macchine.sh [propulsione|giroscopio]
#
# Stessa catena di `rifai-impianto.sh`, e come quella esiste perche' i numeri
# che la fanno funzionare NON sono predefiniti: ognuno viene da una misura, e
# lasciarli nella cronologia di una shell vuol dire che fra due settimane non
# li sa piu' nessuno e il primo che rigenera i modelli li peggiora.
#
# ─── I NUMERI, E DA DOVE VIENE OGNUNO
#
#   --estrusione 0.0005   il cage. Lo smusso piu' largo dell'assieme e' 3,5 mm
#   --raggio 0.005        MISURATO che qui non conta: spazzando da 0,007 a
#                         0,002 le macchie non si muovono di un millesimo
#                         (0,8546% per tutti). Su questo soggetto il difetto
#                         non e' un raggio che scavalca lo spigolo: e' che uno
#                         smusso da 2 mm su un atlante da 0,50 cm/texel occupa
#                         MENO DI MEZZO TEXEL. Si tiene un valore prudente
#   --campioni 256        come l'impianto. `rifai-impianto.sh` ha misurato che
#                         a 64 e a 512 i numeri sono identici: il campionamento
#                         conta poco, e costa poco lasciarlo alto
#   --max-macchie 0.95    DERIVATA, non scelta, con lo stesso metodo
#                         dell'impianto: media geometrica fra una cottura sana
#                         e una patologica, misurate su QUESTI soggetti.
#                             propulsione   sana 0,7868%   patologica 1,8450%
#                                           -> media geometrica 1,20
#                             giroscopio    sana 0,6204%   patologica 1,4623%
#                                           -> media geometrica 0,95
#                         Si prende la PIU' BASSA delle due, che e' la piu'
#                         severa e passa comunque su entrambe. Il tetto 0,6
#                         dell'impianto qui non e' raggiungibile e non e' un
#                         difetto: quel modello e' 2,6 m, questo 7,5, e a
#                         parita' di atlante la densita' e' un terzo
#   --distanza-ao 0.06    6 cm. Col predefinito (1/8 della diagonale = 99 cm su
#                         questa macchina) l'occlusione esce nera
#
# ─── LA COSA CHE HA FATTO PERDERE PIU' TEMPO, SCRITTA QUI PERCHE' NON TORNI
#
# La prima cottura dava un'occlusione con media 84,5 e MEDIANA 8, contro 194 e
# 255 di quella che l'impianto spedisce — e non rispondeva alla distanza di
# ricerca. La causa era nella SCENA, non nei parametri: in `<quale>-cottura.blend`
# la stessa geometria c'era tre volte (le mesh per nodo, la BASSA che ne e' la
# copia unita, la ALTA), e `cottura.py` toglie ai raggi la sola BASSA. Ogni
# superficie aveva un gemello coincidente a distanza zero.
# Curata in `glb-macchine.py`, che ora toglie le mesh per nodo dal render.
# L'ho trovata da `prop_scafo`: una lastra piatta in aria libera risultava nera
# al 51%, e quel numero e' impossibile. Quando un numero e' impossibile non e'
# la geometria a essere sbagliata: e' la scena in cui la si misura.
set -e
B="${BLENDER:-/c/Program Files/Blender Foundation/Blender 5.2/blender.exe}"
R="$(cd "$(dirname "$0")/.." && pwd -W 2>/dev/null || pwd)"
U="$R/riferimenti/blender/uscite/macchine"
mkdir -p "$U"
MACCHINE="${1:-propulsione giroscopio}"

for M in $MACCHINE; do
  RAD=$(echo "$M" | tr 'a-z' 'A-Z')
  C="$U/cottura-$M"
  mkdir -p "$C/spedito"

  echo "── 1/5  $M · geometria, alta/bassa, atlante UV"
  MSYS_NO_PATHCONV=1 "$B" -b -P "$R/riferimenti/blender/cuoci-macchine.py" -- "$U" "$M" \
    | grep -E "^UV |^ATLANTE|texel/cm|^RUGOSITA|per periodo|^FACCE|^COTTURA|^BLEND"

  echo "── 2/5  $M · cottura normale + ORM a 2048"
  MSYS_NO_PATHCONV=1 "$B" -b -P "$R/riferimenti/blender/cottura.py" -- \
    "$U/$M-cottura.blend" "${RAD}_ALTA" "${RAD}_BASSA" "$C" 2048 \
    --estrusione 0.0005 --raggio 0.005 --campioni 256 \
    --max-macchie 0.95 --distanza-ao 0.06 \
    | grep -E "cotta dentro|informazione|macchie \(|ORM |ACCETTATA|RIFIUTATA"

  echo "── 3/5  $M · le mappe che SPEDIAMO"
  #
  # ─── LA RISOLUZIONE NON E' LA STESSA PER LE DUE MACCHINE, ED E' IL PUNTO
  #
  # Dare 512 a tutte e due sarebbe stato «uguale» solo in apparenza: la
  # propulsione copre 41,55 m2 e il giroscopio 16,84, cioe' due volte e mezzo.
  # A parita' di lato, il giroscopio avrebbe avuto una densita' di texel
  # MAGGIORE della propulsione — texel spesi dove non servivano, mentre la
  # macchina grande restava povera. Quello che si tiene uguale e' la DENSITA':
  #
  #     propulsione   512 px -> 0,50 texel/cm     (MISURATO)
  #     giroscopio    512 px -> 0,79 texel/cm     (MISURATO)
  #                   320 px -> 0,49 texel/cm     <- la stessa della grande
  #
  # L'ORM sta un gradino sotto la normale in tutte e due, perche' porta roba a
  # bassa frequenza: l'occlusione e' un termine d'ombra, e la rugosita' ha un
  # periodo di 16,7 cm che a 256 px vale ancora 6,6 texel sul giroscopio e a
  # 384 ne vale 6,2 sulla propulsione — sopra la soglia di 4 in entrambi.
  #
  # L'ORM NON si separa in canali, al contrario dell'impianto: li' dei tre solo
  # R portava informazione, perche' la rugosita' era costante per materiale.
  # Qui G varia — e' il lavoro di questo giro — quindi i tre canali servono
  # tutti e viaggiano in UNA texture, che glTF sa usare sia come
  # `occlusionTexture` sia come `metallicRoughnessTexture`.
  #
  # E NON si sogliano i canali: le isole dell'atlante sono per PRIMITIVA, e una
  # primitiva ha un materiale solo — quindi nessun confine fra materiali cade
  # DENTRO un'isola, e il ricampionamento non puo' mescolare metallo e non
  # metallo lungo un bordo.
  case "$M" in
    propulsione) LN=512; LO=384 ;;
    giroscopio)  LN=320; LO=256 ;;
    *)           LN=512; LO=384 ;;
  esac
  echo "        normale ${LN}px, ORM ${LO}px"
  ffmpeg -y -v error -i "$C/${M}_bassa-normale.png" -vf "scale=$LN:$LN" "$C/spedito/${M}_bassa-normale.png"
  ffmpeg -y -v error -i "$C/${M}_bassa-orm.png"     -vf "scale=$LO:$LO" "$C/spedito/${M}_bassa-orm.png"

  echo "── 4/5  $M · GLB della BASSA con UV, tangenti e le due mappe"
  MODO=bassa MAPPE="$C/spedito" MSYS_NO_PATHCONV=1 "$B" -b -P "$R/riferimenti/blender/glb-macchine.py" -- "$U" "$M" \
    | grep -E "^MODO|^UV |^MAPPE|^TRIANGOLI|^GLB "

  echo "── 5/6  $M · le due mappe a qualita DIVERSA, e PRIMA di meshopt"
  #
  # L'esportatore di Blender ha UNA qualita' per tutte le immagini, e le due
  # mappe non tollerano la stessa perdita: la normale codifica una DIREZIONE
  # (un errore diventa un rilievo che non c'e'), l'ORM porta un'ombra
  # moltiplicativa e una rugosita' a bassa frequenza. MISURATO su questo
  # modello: la normale scende da 40,3 a 31,6 KB andando a 80, l'ORM da 45,7 a
  # 27,6 andando a 70, e i 14 KB risparmiati vanno quasi uno a uno sul filo
  # perche' un webp con brotli non guadagna piu' niente.
  #
  # Il passo sta QUI e non dopo, ed e' una trappola gia' pagata sull'impianto:
  # su un glTF gia' passato da meshopt i dati veri di una vista non stanno
  # all'offset della vista ma dentro `EXT_meshopt_compression`, quindi
  # riscrivendo il blob si ricopia altro e il file esce PIU' GRANDE.
  node "$R/strumenti/alleggerisci-mappe.mjs" "$U/$M.glb" normale 80
  node "$R/strumenti/alleggerisci-mappe.mjs" "$U/$M.glb" occlusione 70

  echo "── 6/6  $M · meshopt, con la guardia sul contratto"
  #
  # LE TANGENTI RESTANO, ED E' UNA DECISIONE MISURATA.
  # Spegnerle fa risparmiare 14,3 KB brotli sulla propulsione (geometria da
  # 69,7 a 55,4) — non e' poco su un tetto di 250. Si tengono lo stesso: la
  # normale e' cotta in spazio MikkTSpace, e senza tangenti chi disegna se le
  # inventa, cioe' si perde parte del motivo per cui si spedisce la BASSA. I
  # byte si sono trovati altrove, dove la perdita e' graduale invece che
  # strutturale: nella risoluzione e nella qualita' delle mappe.
  node "$R/strumenti/comprimi-modello.mjs" "$U/$M.glb" "$R/public/modelli/$M.glb"
  echo
done

echo "FATTO. Adesso: node strumenti/collaudo-glb.mjs && npm run peso"
