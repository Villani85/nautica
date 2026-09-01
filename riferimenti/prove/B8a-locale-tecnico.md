# B8a — Primo giro di cottura: il locale tecnico (MECHANISM_BAY)

`date -Is` inizio: `2026-09-01T03:56:27+02:00`
`date -Is` fine:   *(ultima riga del file)*

**Cambio di rotta ricevuto a meta' giro, dal committente**: la cottura di
qualita' NON si fa su questa macchina (niente GPU CUDA qui — e' la ragione per
cui i sei copioni esistenti usano Cycles CPU). Questo giro consegna quindi:

1. il copione `riferimenti/blender/cuoci-traversata.py`, completo, con il flag
   `--gpu`/OPTIX per Colab;
2. **una prova a campioni bassissimi** (8 e 16) che dimostra che gira e che la
   mappa non e' nera;
3. la lista di cosa serve per portarlo su Colab.

**I numeri di qualita' — campioni veri, tempo di cottura vero, peso vero del
PNG spedibile — SONO DA MISURARE SU COLAB. Non sono stimati qui, e quelli
scritti sotto valgono per 8/16 campioni, non per una cottura buona.**

File scritti in questo giro: `riferimenti/blender/cuoci-traversata.py` (nuovo),
questo referto, e roba sotto `riferimenti/blender/uscite/` (ignorata da git).
Niente in `public/modelli/`, niente in `src/`, nessun commit, nessun push.

---

## 1 · Le due trappole dichiarate: come sono andate

### Trappola 1 — le UV. **Confermata: non c'erano affatto.**

Verificato PRIMA di cuocere, in due modi:

    grep -n "uv\|UV\|smart_project\|cube_project" riferimenti/blender/parts/mechanism_bay.py
    -> zero occorrenze di uv/UV. Le scatole nascono da `bmesh.ops.create_cube`
       (mechanism_bay.py:186), che non crea nessun canale UV.

e poi dal copione stesso, che guarda prima di toccare:

    UV — stato PRIMA di toccare niente
      mesh SENZA nessun canale UV: 12 su 12

Dodici mesh su dodici senza UV. Senza intervento la cottura avrebbe scritto su
un canale inesistente: una lightmap nera che non lo dice.

**Come le ho create, e perche' cosi'.** Un solo canale, `UVMap`, con
`bpy.ops.uv.smart_project(angle_limit=66°, island_margin=0.01)` chiamato in
modalita' **multi-oggetto** (tutte le 12 mesh in edit mode insieme): cosi'
finiscono nello STESSO quadrato 0..1, impacchettate, ed esiste un atlante unico
per la collezione invece di dodici mappe.

I sei copioni esistenti non usano `smart_project`, e hanno ragione: le loro UV
arrivano dal costruttore o dall'esportatore JS, e srotolarle di nuovo
cuocerebbe su una mappa diversa da quella che il sito legge
(`cuoci-ao-scafo.py:17-27`). **Quella ragione qui non si applica, ed e'
l'opposto**: non c'e' nessuna parametrizzazione da rispettare perche' non ce
n'e' nessuna. Non e' una deroga alla convenzione, e' il caso che la convenzione
non copriva.

**Che le isole non si sovrappongano non l'ho sperato: l'ho misurato.** Il
copione rasterizza tutti i triangoli UV in un contatore per texel
(`rasterizza()`) e conta i texel reclamati da piu' di un'isola — due isole
sovrapposte non danno errore, danno una parete che porta l'ombra di un'altra:

    area UV rasterizzata  416.789 texel (70,66% della texture)
    texel coperti da PIU' di un'isola  0  (0,0000% dell'area UV)

Zero. E' anche un cancello: sopra zero il copione muore.

### Trappola 2 — il canale. **Un canale solo, `texCoord 0`.**

`UVMap` e' l'unico canale creato, quindi l'esportatore glTF lo dichiara come
`TEXCOORD_0` e l'`occlusionTexture` avra' `texCoord: 0`. E' esattamente il caso
gia' verificato stanotte (117 maglie con aoMap, `aoMapIntensity` a 10 sposta il
fotogramma di 2,7655 livelli): per i GLB caricati dal `GLTFLoader` il canale lo
dichiara il file e il loader lo rispetta. Non ho creato un secondo canale, e
quindi non c'e' niente da scegliere: **l'occlusione legge `texCoord 0`, cioe'
`UVMap`.**

Nota che resta aperta e non l'ho richiusa: la verifica a runtime (mappa dentro
il GLB e visibile in scena) e' il giro DOPO, quello del rientro.

---

## 2 · Risoluzione, e la densita' che l'ha decisa

La convenzione del repo e' tarare, non fissare (`cuoci-macchine.py:108-115`):

    densita' [texel/cm] = lato * sqrt(area_uv / area_3d) / 100

MISURATO dal copione sulla geometria vera (non per analogia con le bbox, come
faceva il piano B8 §6):

    superficie reale     169,588 m2      (area_3d in spazio MONDO, 12 mesh)
    isole                70,8% del quadrato UV
    lato per 0,49 texel/cm:  758 px  ->  taglia piu' vicina: 768
    SCELTO 768 px  ->  0,496 texel/cm   (un texel = 2,01 cm)

**0,49 texel/cm** e' il riferimento perche' e' la densita' MISURATA e accettata
sulla propulsione (`strumenti/rifai-macchine.sh:56-72`), non un numero scelto
oggi. Il piano B8 proponeva 384 px per analogia con la bbox: **la misura lo
smentisce**. La bbox del locale tecnico e' simile a quella della propulsione,
ma la superficie sviluppata no — un vano cavo ha pareti dentro e fuori,
169,6 m2 contro un macchinario compatto. A 384 px la densita' sarebbe 0,248
texel/cm, meta' di quella accettata. **La risoluzione da usare su Colab e'
768 px**, e il numero viene dalla geometria, non dall'analogia.

---

## 3 · La prova eseguita (campioni bassissimi — NON e' la cottura buona)

Comando, dalla radice del repo:

    "/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b \
      -P riferimenti/blender/cuoci-traversata.py -- --collezione MECHANISM_BAY --campioni 16

Parametri effettivi:

    motore     Cycles CPU, campionamento adattivo SPENTO, denoise ACCESO
    campioni   16          <- DI PROVA. La cottura buona vuole >= 128.
    texture    768 px, margine 6 texel (max(4, lato//128), come cottura.py:476)
    bbox mondo min=(-15,003, -3,330, -1,700)  max=(-10,555, -0,220, 1,700)
    diagonale  6,4041 m  ->  distanza AO 0,8005 m (diag/8, come cottura.py:477)
    bersagli   12 mesh in MECHANISM_BAY
    occludenti 37 mesh nel resto della scena (ENGINE_ROOM, OCCLUDERS,
               SALOON_SHELL, STAIR_CORRIDOR)

    TEMPO REALE DI COTTURA  2,8 s        <- a 16 campioni, CPU. Non e' un tempo
                                            di produzione: e' il tempo di una prova.
    (a 8 campioni / 256 px: 0,3 s — misurato nel primo giro)

Gli occludenti ci sono e sono dichiarati: e' la lezione di
`cuoci-ao-scafo.py:28-32` — un bake sul solo bersaglio da' una superficie
uniforme e sembra funzionare. Il copione non ricostruisce niente: esegue
`scena-continua.py` con `runpy`, come `esporta-traversata.py:35`, e i tre pezzi
sono entrati (`SALOON_SHELL OK`, `MECHANISM_BAY/ENGINE_ROOM OK`,
`STAIR_CORRIDOR OK`).

### Il PNG prodotto

    percorso   riferimenti/blender/uscite/mechanism_bay-ao.png
    dimensioni 768 x 768 px, rgb24   (ffprobe -show_entries stream=width,height,pix_fmt)
    peso       275.027 byte          (ls -la)

Non porta l'alfa: l'alfa era la copertura, un attrezzo della cottura (vedi §5).

### La prova che NON e' nera

Con ffmpeg, sul piano R del PNG:

    ffmpeg -i mechanism_bay-ao.png -vf "format=gbrp,extractplanes=r,signalstats,metadata=print:file=-" -f null -
      lavfi.signalstats.YMIN=0
      lavfi.signalstats.YAVG=193.408
      lavfi.signalstats.YMAX=255

`signalstats` non da' lo scarto tipo, quindi lo si ricava da E[X^2] con lo
stesso attrezzo (varianza = E[X^2] - media^2), passando il quadrato in un lut:

    ffmpeg -i mechanism_bay-ao.png -vf "format=gbrp,extractplanes=r,lutyuv=y='val*val/255',signalstats,metadata=print:file=-" -f null -
      lavfi.signalstats.YAVG=175.036      ->  E[X^2] = 175,036 * 255 = 44.634,2
      scarto tipo = sqrt(44.634,2 - 193,408^2) = sqrt(7.227,5) = **85,02 livelli**

Controprova (stessa decodifica ffmpeg, conto in numpy): **media 193,4084,
scarto 85,1343**, min 0, max 255, su 589.824 texel. I due scarti concordano a
meno di 0,12 livelli (la differenza e' l'arrotondamento del lut a 8 bit).

**Media 193,4 e scarto 85,0 non sono una mappa nera** (nera = media ~0 e scarto
~0) **e non sono nemmeno una mappa piatta** (piatta = scarto ~0, ed e' il caso
in cui una cottura fallita passa per riuscita). La distribuzione ha corpo:

    istogramma per decili di livello (0..255):
      6.281 | 404 | 1.084 | 2.734 | 1.424 | 5.015 | 3.888 | 4.827 | 4.353 | 35.526
      (misurato sul primo PNG a 256 px; la forma a 768 px e' la stessa)

I 6.281 texel scurissimi sono gli spigoli e le fessure; il picco a 255 e' fatto
del fondo fuori dalle isole (29,3% della texture) piu' le facce ESTERNE delle
scatole del vano, che guardano il vuoto e non hanno niente che le occluda.

Misura interna al copione, ristretta all'area UV (dove la mappa conta davvero):

    copertura   100,00% dell'area UV ha ricevuto un valore
    min 0,00  max 255,00  media 194,19  scarto tipo 86,76
    escursione  1,0000 (0-1)
    COTTURA ACCETTATA

---

## 4 · Cosa serve per girare su COLAB (la consegna piu' utile di questo giro)

### Percorsi assoluti che dipendono da QUESTA macchina

**Nessuno dentro `cuoci-traversata.py`**: tutti i suoi percorsi nascono da
`os.path.dirname(os.path.abspath(__file__))`. L'unico percorso di questa
macchina e' il binario di Blender nella riga di comando
(`/c/Program Files/Blender Foundation/Blender 5.2/blender.exe`), che su Colab
diventa il Blender scaricato li'.

**Ma la struttura relativa delle cartelle NON e' opzionale**: `parts/saloon.py`
calcola `RADICE = parts/../../..` e da li' apre due file del repo. Se si carica
solo la cartella `blender/`, `saloon.py` fallisce e con lui l'occludente del
salone.

### File da caricare (percorsi relativi alla radice del repo, da preservare)

    riferimenti/blender/cuoci-traversata.py     il copione
    riferimenti/blender/scena-continua.py       l'assemblatore, eseguito con runpy
    riferimenti/blender/world_root.py           IL CONTRATTO — obbligatorio (vedi sotto)
    riferimenti/blender/camera_path.py          scena-continua.py lo esegue (VERIFICA 3)
    riferimenti/blender/parts/mechanism_bay.py  il bersaglio
    riferimenti/blender/parts/corridor.py       occludente
    riferimenti/blender/parts/saloon.py         occludente
    riferimenti/salone/posa.json                letto da saloon.py:97
    public/modelli/guscio-salone.glb            importato da saloon.py:163;
                                                letto anche da camera_path.py:81
    riferimenti/blender/uscite/                 cartella SCRIVIBILE: ci scrivono
                                                corridor.py:289 e mechanism_bay.py:425
                                                (esportano il loro GLB quando girano),
                                                e ci finiscono il PNG e il .blend

Non serve `traversata-world.glb`: la scena si costruisce dai sorgenti, non si
importa. Non servono gli altri GLB di `public/modelli/` (impianto, macchine,
sovrastruttura, interni): `mechanism_bay.py:14-27` dichiara di NON importarli.

### Funziona senza `world_root.py` accanto? **NO.**

`scena-continua.py:21` fa `import world_root`, e tutti e tre i `parts/*.py`
pure. Senza quel file il copione non parte affatto — muore all'import, prima di
toccare la geometria. Va copiato, e resta CONGELATO: non si tocca.

### Comando su Colab (con la GPU accesa davvero)

    blender -b -P riferimenti/blender/cuoci-traversata.py -- \
        --collezione MECHANISM_BAY --campioni 128 --gpu

`--gpu` accende OPTIX e **MUORE se OPTIX non c'e'**, con la logica copiata
nella sostanza da `cottura.py:359-400`: su una macchina senza GPU nessuna di
quelle righe solleva niente, `cycles.device = 'GPU'` viene accettato e Cycles
ripiega su CPU **senza una riga di avviso**. Su Colab e' il guasto che conta:
si prenota la T4 e si cuoce in CPU credendo il contrario. Da qui non ho potuto
provare `--gpu` in positivo (non c'e' OPTIX su questo PC): **quello che ho
provato e' il percorso CPU; il ramo `--gpu` va visto accendersi su Colab, ed e'
la prima cosa da guardare nel log** (deve stampare `OPTIX acceso su: ...`).

`numpy` serve al copione ed e' gia' dentro il Python di Blender: nessuna
installazione.

---

## 5 · Un errore fatto e corretto, che vale piu' del risultato

Al primo giro (8 campioni, 256 px) il copione ha BOCCIATO la sua cottura:

    copertura 89,24%, minimo 98,00%: una parte dell'area UV non e' stata scritta.

Il cancello era **mio e sbagliato**. Contavo «cotto» un texel col valore > 0 —
ma un texel di occlusione **puo' essere nero per davvero**, perche' e'
completamente occluso: quel cancello confondeva «non scritto» con «in ombra
piena», cioe' esattamente il caso che l'occlusione esiste per rappresentare. Un
cancello cosi' e' peggio di nessun cancello: boccia le cotture riuscite meglio.

La risposta era gia' pagata in questo repo, `cottura.py:113-120`: Blender segna
la copertura **nell'alfa** e scrive `out = copertura*valore + (1-cop)*fondo`.
Con fondo nero e trasparente il valore vero si riprende dividendo per l'alfa, e
la maschera del cotto **e' l'alfa, non il valore**. Corretto cosi', la copertura
misura 100,00%. Il PNG spedito porta il valore gia' diviso, senza alfa, con
fondo 1 (nessuna ombra) fuori dalle isole — come `cottura.py:545`.

---

## 6 · Cosa NON ho fatto, e perche'

- **La cottura di qualita'.** Ordine del committente arrivato a meta' giro: va
  su Colab, dove c'e' la T4 con OPTIX. Qui ho fatto solo 8 e 16 campioni.
  **Campioni veri, tempo vero e peso vero del PNG restano DA MISURARE, non
  sono stimati in questo referto.**
- **La mappa NORMALE.** Non esiste una coppia ALTA/BASSA: la geometria e' fatta
  di scatole d'asse, l'alta sarebbe identica alla bassa, e `cottura.py` lo dice
  gia' col suo cancello «la normale e' PIATTA» (`cottura.py:591-596`, provino
  con alta identica alla bassa: 0,000% di texel informativi). Cuocere una
  normale da se' stessi consegna una texture grigia che passa i cancelli.
- **ENGINE_ROOM e STAIR_CORRIDOR.** Un pezzo solo, per mandato. Se il primo
  funziona gli altri sono ripetizione; se non funziona, averne cotti tre e'
  tre volte il lavoro da rifare. `--collezione` esiste apposta.
- **SALOON_SHELL.** Escluso per sempre: e' una fotografia su
  `MeshBasicMaterial`, che `aoMap` non lo supporta (piano B8 §4,
  `src/scena/guscio.js:101-115`). Resta in scena come OCCLUDENTE, ed e' giusto
  cosi'.
- **Il rientro nel GLB.** Niente scritto in `public/modelli/`: e' il giro dopo,
  e si fa con `esporta-traversata.py`, che esiste gia'. Per questo il copione
  salva `uscite/mechanism_bay-cotto.blend` con dentro le UV: senza, il giro del
  rientro dovrebbe srotolare di nuovo e otterrebbe un pack DIVERSO, cioe' una
  mappa cotta su UV che non sono quelle spedite.
- **Il WEBP.** La conversione (q88, `glb-macchine.py:962-963`) si fa all'export,
  non qui.
- **La verifica a runtime** che l'`occlusionTexture` si veda davvero in scena.
  E' il buco dichiarato nel piano B8 §3, e resta aperto: si chiude solo col GLB
  in mano, cioe' il giro dopo.
- **Nessun commit, nessun push.**

## 7 · Cosa resta

1. Portare i file di §4 su Colab e rilanciare con `--campioni 128 --gpu` a
   768 px. Guardare che il log dica `OPTIX acceso su: ...`.
2. Misurare li': campioni, tempo reale, peso del PNG, media/scarto con lo
   stesso comando ffmpeg di §3 — e confrontarli con questi.
3. Poi il rientro nel GLB con `esporta-traversata.py`, ripartendo da
   `uscite/mechanism_bay-cotto.blend`, e la verifica a runtime dell'aoMap.
4. Solo dopo: ENGINE_ROOM (stessi parametri, bbox e famiglia geometrica quasi
   identiche) e STAIR_CORRIDOR (ultimo: la sua cucitura e' ancora in
   `CONFLITTO`, `world_root.py:490-519`).

## Comandi eseguiti in questo giro

    date -Is
    grep -n "uv\|UV\|smart_project\|material" riferimenti/blender/parts/mechanism_bay.py
    blender -b -P <sonda smart_project multi-oggetto in background>   (verifica che l'op giri con -b)
    blender -b -P riferimenti/blender/cuoci-traversata.py -- --collezione MECHANISM_BAY --campioni 8 --lato 256
    blender -b -P riferimenti/blender/cuoci-traversata.py -- --collezione MECHANISM_BAY --campioni 16
    ffmpeg -i mechanism_bay-ao.png -vf "format=gbrp,extractplanes=r,signalstats,metadata=print:file=-" -f null -
    ffmpeg -i mechanism_bay-ao.png -vf "format=gbrp,extractplanes=r,lutyuv=y='val*val/255',signalstats,metadata=print:file=-" -f null -
    ffprobe -show_entries stream=width,height,pix_fmt -of csv=p=0 mechanism_bay-ao.png
    ls -la riferimenti/blender/uscite/mechanism_bay-ao.png

`date -Is` fine: `2026-09-01T04:06:24+02:00`  (durata reale ~10 min)
