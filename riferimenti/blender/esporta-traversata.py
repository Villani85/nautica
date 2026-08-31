# -*- coding: utf-8 -*-
"""
B7 — L'EXPORT. Assembla il mondo (eseguendo scena-continua.py, non lo
ricostruisce) e ne esporta un GLB unico: le quattro collezioni del mondo
sotto WORLD_ROOT, in public/modelli/traversata-world.glb.

    "/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P riferimenti/blender/esporta-traversata.py

Non tocca world_root.py (CONGELATO), non tocca scena-continua.py: lo esegue
via runpy, esattamente come farebbe `blender -b -P scena-continua.py` da
solo, e poi seleziona ed esporta quello che scena-continua.py ha costruito.
Se un pezzo non e' entrato, questo file lo dichiara e continua con quello
che PUO' esportare — non nasconde un buco tacendo la collezione mancante.
"""
import bpy
import os
import sys
import runpy

QUI = os.path.dirname(os.path.abspath(__file__))
if QUI not in sys.path:
    sys.path.insert(0, QUI)

SCENA_CONTINUA = os.path.join(QUI, 'scena-continua.py')
REPO = os.path.dirname(os.path.dirname(QUI))  # riferimenti/blender -> riferimenti -> repo
GLB_OUT = os.path.join(REPO, 'public', 'modelli', 'traversata-world.glb')

COLLEZIONI_MONDO = ['MECHANISM_BAY', 'ENGINE_ROOM', 'STAIR_CORRIDOR', 'SALOON_SHELL']

print('')
print('=' * 78)
print('B7 — ESPORTATORE: eseguo scena-continua.py per assemblare il mondo')
print('=' * 78)

ns = runpy.run_path(SCENA_CONTINUA, run_name='__main__')

RISULTATI = ns.get('RISULTATI', {})

print('')
print('=' * 78)
print('B7 — ESPORTATORE: stato assemblaggio (da scena-continua.py)')
print('=' * 78)
for nome, tupla in RISULTATI.items():
    stato, dettaglio, g, nome_file = tupla
    print(f'  {nome:28s} <- {nome_file:20s} {stato}')

falliti = [n for n, t in RISULTATI.items() if t[0] != 'OK']
if falliti:
    print('')
    print(f'  ATTENZIONE: {len(falliti)} pezzo/i non assemblato/i: {", ".join(falliti)}')
    print('  Il GLB uscira\' incompleto (mancano le collezioni non costruite da questi pezzi).')

# ─── raccolgo gli oggetti da esportare: tutto cio' che vive DENTRO le quattro
#     collezioni del mondo (mesh, camera di riferimento, quel che c'e') ─────
oggetti = []
mancanti = []
senza_materiale = []
conteggio_per_collezione = {}
for nome_col in COLLEZIONI_MONDO:
    col = bpy.data.collections.get(nome_col)
    n = len(col.objects) if col else 0
    conteggio_per_collezione[nome_col] = n
    if col is None or n == 0:
        mancanti.append(nome_col)
        continue
    for ob in col.objects:
        oggetti.append(ob)
        if ob.type == 'MESH' and len(ob.data.materials) == 0:
            senza_materiale.append(f'{nome_col}/{ob.name}')

print('')
print('-' * 78)
print('OGGETTI RACCOLTI PER L\'EXPORT (le quattro collezioni del mondo)')
print('-' * 78)
for nome_col in COLLEZIONI_MONDO:
    print(f'  {nome_col:16s} {conteggio_per_collezione[nome_col]} oggetto/i')
if mancanti:
    print(f'  COLLEZIONI VUOTE O ASSENTI: {", ".join(mancanti)} — NON entrano nel GLB.')
if senza_materiale:
    print(f'  ATTENZIONE — {len(senza_materiale)} mesh senza materiale (uscirebbero di plastica,'
          f' collaudo-gltf le boccia): {", ".join(senza_materiale)}')
else:
    print('  Tutte le mesh raccolte hanno almeno un materiale assegnato.')

if not oggetti:
    print('')
    print('ERRORE FATALE: nessun oggetto da esportare. GLB NON scritto.')
    sys.exit(1)

os.makedirs(os.path.dirname(GLB_OUT), exist_ok=True)

bpy.ops.object.select_all(action='DESELECT')
for ob in oggetti:
    ob.select_set(True)
bpy.context.view_layer.update()

# ─── LA TRAPPOLA GIA' PAGATA UNA VOLTA IN QUESTO REPO ──────────────────────
# guscio-esporta.py:255-271 usa export_yup=False DI PROPOSITO. Il commento
# accanto racconta il prezzo: con la conversione accesa il guscio del salone
# era uscito "come una scatola sbagliata sopra la sovrastruttura".
#
# Il motivo si applica identico qui: la scena assemblata da scena-continua.py
# e' GIA' in Y-up (X lungo la murata, Y in alto, Z fuori dalla parete — la
# convenzione del contratto e dei GLB del progetto). saloon.py riporta
# indietro il guscio importato di -90 gradi su X apposta per restare in
# quella convenzione, non in Z-up standard di Blender. L'esportatore glTF, di
# suo, converte Z-up -> Y-up ruotando di 90 gradi: applicata a una scena GIA'
# in Y-up, quella conversione la ruoterebbe una seconda volta, sballando gli
# assi esattamente come nel guscio. Stesse opzioni dello stesso file, stesso
# motivo: NON si tocca export_yup.
bpy.ops.export_scene.gltf(
    filepath=GLB_OUT,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    # I MATERIALI SI ESPORTANO SEMPRE: collaudo-gltf boccia le primitive
    # senza materiale, e ha ragione (guscio-esporta.py:266-271: senza,
    # three.js ci mette il grigio di riserva e il pezzo esce di plastica,
    # senza nessun errore).
    export_materials='EXPORT',
    export_normals=True,
    export_texcoords=True,
    export_cameras=True,
    export_yup=False,
)

peso = os.path.getsize(GLB_OUT)
print('')
print('=' * 78)
print('B7 — ESPORTATORE: GLB scritto')
print('=' * 78)
print(f'  file       {GLB_OUT}')
print(f'  peso       {peso} byte  ({peso / 1e6:.6f} MB decimali, 10^6)')
print(f'  oggetti esportati (selezionati): {len(oggetti)}')
print('')
print('FINE ESPORTATORE B7')
