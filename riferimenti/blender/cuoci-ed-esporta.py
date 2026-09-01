# -*- coding: utf-8 -*-
"""
COTTURA E ESPORTAZIONE IN UNA SOLA SESSIONE.

─── PERCHE' NON SI PUO' FARE IN TRE GIRI SEPARATI

`cuoci-traversata.py` srotola SOLO la collezione che gli si chiede, e per farlo
riassembla il mondo da capo. Eseguito tre volte, il terzo giro cancella gli
oggetti del secondo, che avevano cancellato quelli del primo: alla fine
sopravvive UNA sola serie di UV, e un export porterebbe una mappa su tre --
senza nessun errore, con le altre due che scivolano su coordinate che non sono
le loro.

Qui si assembla una volta, si cuoce tre volte con `--gia-assemblata`, e si
esporta. Le tre serie di UV convivono perche' nessuno ha ricostruito niente in
mezzo.

─── E LE MAPPE RIENTRANO COME `occlusionTexture`

Ogni maglia riceve un nodo immagine collegato all'ingresso di occlusione del
proprio materiale. L'esportatore glTF lo traduce in `occlusionTexture` con
`texCoord 0`, che e' il canale che esiste -- e three.js lo rispetta perche' il
loader dichiara `texture.channel = mapDef.texCoord` (verificato misurando: 117
maglie con aoMap in scena e 2,7655 livelli di scarto portando l'intensita' a
dieci).

─── LA TRAPPOLA DELL'ASSE, gia' pagata due volte

`export_yup=False`, come in `guscio-esporta.py:265-280`. Con la conversione
accesa il guscio era uscito «come una scatola sbagliata sopra la
sovrastruttura», e questa scena e' costruita in Y-up apposta.
"""
import bpy
import os
import sys
import runpy

QUI = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(QUI, '..', '..'))
USCITE = os.path.join(QUI, 'uscite')
CUOCI = os.path.join(QUI, 'cuoci-traversata.py')

COLLEZIONI = ['MECHANISM_BAY', 'ENGINE_ROOM', 'STAIR_CORRIDOR']

# quale collezione ha gia' servito un materiale: vedi «un materiale condiviso
# non puo' portare due mappe»
SERVITI = {}


def dice(*a):
    print(*a)
    sys.stdout.flush()


def cuoci(collezione, prima, campioni, gpu):
    """Esegue `cuoci-traversata.py` nella sessione corrente."""
    argv = ['cuoci-traversata.py', '--', '--collezione', collezione,
            '--campioni', str(campioni)]
    if gpu:
        argv.append('--gpu')
    if not prima:
        argv.append('--gia-assemblata')
    vecchio = sys.argv
    sys.argv = argv
    try:
        runpy.run_path(CUOCI, run_name='__main__')
    finally:
        sys.argv = vecchio


def attacca(collezione):
    """
    Collega il PNG cotto all'ingresso di occlusione dei materiali della
    collezione. Ritorna quante maglie sono state servite.
    """
    via = os.path.join(USCITE, '%s-ao.png' % collezione.lower())
    if not os.path.isfile(via):
        raise SystemExit('manca la mappa %s: la cottura non l\'ha scritta' % via)
    img = bpy.data.images.load(via, check_existing=True)
    img.colorspace_settings.name = 'Non-Color'   # una AO non e' un colore

    col = bpy.data.collections.get(collezione)
    if col is None:
        raise SystemExit('collezione %s assente' % collezione)

    fatte = 0
    visti = {}
    for o in col.objects:
        if o.type != 'MESH':
            continue
        for i, slot in enumerate(o.material_slots):
            mat = slot.material
            if mat is None:
                continue
            gia = SERVITI.get(mat.name)
            if gia == collezione:
                continue                       # gia' fatto in questa collezione
            if gia is not None:
                # ─── UN MATERIALE CONDIVISO NON PUO' PORTARE DUE MAPPE
                #
                # DIFETTO TROVATO CONTANDO LE IMMAGINI NEL GLB: due invece di
                # tre. `mechanism_bay.py` costruisce SIA `MECHANISM_BAY` sia
                # `ENGINE_ROOM` e le fa condividere i materiali -- che e'
                # giusto, sono le stesse paratie. Ma le due collezioni hanno
                # UV e mappe DIVERSE: attaccare la seconda al materiale gia'
                # servito sovrascriveva la prima, e una delle due stanze
                # sarebbe uscita con l'ombra di un'altra.
                #
                # Non lo diceva nessuno: il GLB era valido, i materiali
                # c'erano, e l'occlusione era semplicemente quella sbagliata.
                # L'unico segnale era il conteggio delle immagini.
                #
                # Si duplica il materiale per questa collezione. Costa una
                # copia e rende la mappa dichiarabile.
                mat = mat.copy()
                mat.name = '%s_%s' % (mat.name.split('_da_')[0], collezione.lower())
                slot.material = mat
            SERVITI[mat.name] = collezione
            visti[mat.name] = True
            mat.use_nodes = True
            nodi = mat.node_tree.nodes
            legami = mat.node_tree.links
            pr = next((n for n in nodi if n.type == 'BSDF_PRINCIPLED'), None)
            if pr is None:
                continue
            # ─── SI SGOMBRA IL CABLAGGIO VECCHIO PRIMA DI METTERE IL NUOVO
            #
            # DIFETTO TROVATO DAL CONTEGGIO DELLE IMMAGINI, e altrimenti
            # invisibile. `mat.copy()` porta con se' TUTTO il materiale, nodo di
            # occlusione compreso: la copia per ENGINE_ROOM nasceva gia'
            # collegata alla mappa di MECHANISM_BAY. Io ne aggiungevo una
            # seconda, e l'esportatore prendeva la PRIMA.
            #
            # Risultato: la sala macchine usciva con l'ombra del locale tecnico.
            # Il GLB era valido, i materiali c'erano, `collaudo-gltf` passava, e
            # la diagnosi «quale mappa su quale materiale» stampava pure quella
            # giusta -- perche' leggeva l'ultimo nodo immagine, non quello
            # collegato. L'unico segnale erano DUE immagini invece di tre.
            for n in list(nodi):
                if n.type == 'TEX_IMAGE' and n.label == 'AO':
                    nodi.remove(n)
                elif n.type == 'GROUP' and n.node_tree is not None                         and n.node_tree.name == 'glTF Material Output':
                    nodi.remove(n)

            tex = nodi.new('ShaderNodeTexImage')
            tex.image = img
            tex.label = 'AO'
            tex.location = (pr.location.x - 600, pr.location.y - 300)
            """
            ─── L'OCCLUSIONE VA NEL SUO SLOT, non nel colore base

            PRIMO TENTATIVO SBAGLIATO, e il GLB l'ha detto: collegavo la mappa
            alla Base Color attraverso un Mix in moltiplicazione. Si vede lo
            stesso -- l'ombra c'e' -- ma l'esportatore la scrive come
            `baseColorTexture`, e il file usciva con ZERO `occlusionTexture`.

            Cotta nell'albedo, un'occlusione non si puo' piu' regolare a
            runtime e scurisce anche dove la luce batte diretta. E three.js non
            la tratta come occlusione perche' non sa che lo sia.

            L'esportatore glTF di Blender scrive `occlusionTexture` SOLO se la
            mappa arriva all'ingresso `Occlusion` di un gruppo chiamato
            esattamente `glTF Material Output`. Non e' un nodo che si rende: e'
            una convenzione dell'esportatore, e il gruppo puo' restare vuoto.
            """
            grp = bpy.data.node_groups.get('glTF Material Output')
            if grp is None:
                grp = bpy.data.node_groups.new('glTF Material Output', 'ShaderNodeTree')
                grp.interface.new_socket('Occlusion', in_out='INPUT',
                                         socket_type='NodeSocketFloat')
            uscita = nodi.new('ShaderNodeGroup')
            uscita.node_tree = grp
            uscita.location = (pr.location.x - 300, pr.location.y - 500)
            legami.new(tex.outputs['Color'], uscita.inputs['Occlusion'])

            fatte += 1
    return fatte, os.path.getsize(via)


def main():
    campioni = 128
    gpu = '--gpu' in sys.argv
    fuori = os.path.join(ROOT, 'public', 'modelli', 'traversata-world.glb')

    dice('=' * 78)
    dice('COTTURA E ESPORTAZIONE — una sessione sola, tre collezioni')
    dice('=' * 78)

    for i, c in enumerate(COLLEZIONI):
        dice('')
        dice('--- cottura %d/%d: %s' % (i + 1, len(COLLEZIONI), c))
        cuoci(c, prima=(i == 0), campioni=campioni, gpu=gpu)

    dice('')
    dice('=' * 78)
    dice('RIENTRO DELLE MAPPE NEI MATERIALI')
    dice('=' * 78)
    totale = 0
    for c in COLLEZIONI:
        n, peso = attacca(c)
        dice('  %-16s %2d materiali serviti · mappa %d byte' % (c, n, peso))
        totale += n

    # le UV devono esserci su TUTTE e tre, o una mappa scivola
    dice('')
    for c in COLLEZIONI:
        col = bpy.data.collections.get(c)
        senza = [o.name for o in col.objects
                 if o.type == 'MESH' and not o.data.uv_layers]
        dice('  %-16s maglie senza UV: %d %s' % (c, len(senza), senza[:3] or ''))
        if senza:
            raise SystemExit(
                'ci sono maglie senza UV in %s: la loro mappa non si '
                'allineerebbe, e non lo direbbe nessuno.' % c)

    # ─── CHI PORTA COSA, prima di esportare
    #
    # Il conteggio delle immagini nel GLB dice SE qualcosa e' andato storto;
    # questo dice COSA. Senza, un materiale che porta la mappa di un'altra
    # stanza e' invisibile: il file e' valido, i numeri tornano, e l'ombra e'
    # quella sbagliata.
    dice('')
    dice('MAPPA PER MATERIALE (quello che finira nel GLB)')
    for c in COLLEZIONI:
        col = bpy.data.collections.get(c)
        visto = {}
        for o in col.objects:
            if o.type != 'MESH':
                continue
            for slot in o.material_slots:
                m = slot.material
                if m is None or not m.use_nodes:
                    continue
                img = None
                for n in m.node_tree.nodes:
                    if n.type == 'TEX_IMAGE' and n.image is not None:
                        img = os.path.basename(n.image.filepath or n.image.name)
                visto[m.name] = img
        for k in sorted(visto):
            dice('  %-16s %-28s -> %s' % (c, k, visto[k]))

    dice('')
    dice('=' * 78)
    dice('ESPORTAZIONE')
    dice('=' * 78)
    bpy.ops.object.select_all(action='DESELECT')
    quante = 0
    for c in COLLEZIONI + ['SALOON_SHELL']:
        col = bpy.data.collections.get(c)
        if col is None:
            continue
        for o in col.objects:
            o.select_set(True)
            quante += 1
    dice('  oggetti selezionati: %d' % quante)

    # ─── SI CUOCE IN PNG E SI SPEDISCE IN WEBP
    #
    # E' la convenzione dei sei copioni gia' nel repo, e il motivo si misura:
    # con i PNG dentro, il GLB passa da 113,4 KB a 856,6 KB in brotli. Sette
    # volte e mezza, per tre mappe di occlusione.
    #
    # Il PNG serve alla COTTURA -- e' senza perdita, e una mappa da cui si
    # rifara' un confronto non va compressa. Il WEBP serve alla SPEDIZIONE: una
    # mappa di occlusione e' un grigio morbido senza bordi netti, cioe' il caso
    # in cui una compressione con perdita si vede meno di tutti.
    #
    # Qualita' 85: i copioni esistenti stanno fra 82 e 90.
    bpy.ops.export_scene.gltf(
        filepath=fuori, export_format='GLB', use_selection=True,
        export_apply=True, export_materials='EXPORT', export_normals=True,
        export_texcoords=True, export_cameras=True, export_yup=False,
        export_image_format='WEBP', export_image_quality=85)

    # ─── E SI CONTA QUANTE IMMAGINI SONO USCITE
    #
    # Tre collezioni, tre mappe: se il GLB ne porta meno, una stanza ha
    # l'ombra di un'altra e nessun validatore se ne accorge.
    import struct as _st
    import json as _js
    _d = open(fuori, 'rb').read()
    _off, _json = 12, None
    while _off < len(_d):
        _cl, _ct = _st.unpack('<II', _d[_off:_off + 8])
        _off += 8
        _ch = _d[_off:_off + _cl]
        _off += _cl
        if _ct == 0x4E4F534A:
            _json = _js.loads(_ch)
            break
    _im = len(_json.get('images', []))
    _ao = sum(1 for m in _json.get('materials', []) if 'occlusionTexture' in m)
    dice('  immagini nel GLB: %d (attese %d)' % (_im, len(COLLEZIONI)))
    dice('  materiali con occlusionTexture: %d' % _ao)
    if _im != len(COLLEZIONI):
        raise SystemExit(
            "il GLB porta %d immagini invece di %d: una collezione ha perso la "
            "propria mappa, o ne condivide una con quella di un altra."
            % (_im, len(COLLEZIONI)))

    peso = os.path.getsize(fuori)
    dice('  SCRITTO %s' % fuori)
    dice('  peso %d byte = %.3f MB decimali' % (peso, peso / 1e6))
    dice('  materiali serviti in tutto: %d' % totale)


if __name__ == '__main__':
    main()
