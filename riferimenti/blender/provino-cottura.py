# -*- coding: utf-8 -*-
"""
IL PROVINO DELLA COTTURA - costruisce un caso di cui si sa gia' la risposta.

  blender -b -P provino-cottura.py -- <file.blend uscita> [--smusso 0.035] [--scanalatura 0.08]

Fa due oggetti:
  ALTA   cubo con una SCANALATURA scavata sulla faccia +Z e tutti gli spigoli
         SMUSSATI (bevel applicato, ombreggiatura morbida). Ha un materiale con
         rugosita' variabile (rumore) e metallicita' costante: serve all'ORM.
  BASSA  lo stesso cubo, 6 facce piatte, senza scanalatura e senza smussi,
         con UV scritte a mano - 6 isole in una griglia 3x2, niente
         sovrapposizioni, margine dichiarato.

Cosa DEVE succedere quando `cottura.py` lo cuoce:
  - la mappa normale NON e' piatta: gli spigoli smussati e la scanalatura
    ricompaiono come rampe;
  - l'occlusione si scurisce DENTRO la scanalatura e resta chiara sul piano;
  - la rugosita' porta la variazione del rumore, la metallicita' e' costante.
Se non succede, e' rotta la macchina, non il provino.
"""

import sys
import os
import argparse
import bpy


def argomenti():
    argv = sys.argv
    argv = argv[argv.index("--") + 1:] if "--" in argv else []
    p = argparse.ArgumentParser(prog="provino-cottura.py")
    p.add_argument("blend", help="dove salvare il .blend")
    p.add_argument("--smusso", type=float, default=0.035, help="larghezza dello smusso")
    p.add_argument("--segmenti", type=int, default=3)
    p.add_argument("--scanalatura", type=float, default=0.08, help="profondita' della scanalatura")
    p.add_argument("--fessura", type=float, default=0.0,
                   help="profondita' di una fessura STRETTA sulla faccia +X (0 = niente). "
                        "Serve a fabbricare apposta le macchie: dentro una fessura "
                        "profonda il raggio obliquo prende la parete di fronte.")
    p.add_argument("--larghezza-fessura", type=float, default=0.14, dest="larghezza_fessura")
    p.add_argument("--con-cage", type=float, default=0.0, dest="con_cage",
                   help="aggiunge un oggetto CAGE: copia della BASSA gonfiata di questo "
                        "tanto. Un cage esplicito e' l'unico modo di governare la "
                        "direzione dei raggi quando l'estrusione non basta.")
    p.add_argument("--identica", action="store_true",
                   help="l'ALTA e' identica alla BASSA: niente scanalatura, niente smussi. "
                        "E' il controllo negativo - non c'e' NIENTE da cuocere, e la "
                        "macchina deve dirlo invece di consegnare un PNG piatto.")
    p.add_argument("--disallinea", type=float, default=0.0,
                   help="gradi di rotazione della BASSA rispetto all'ALTA. E' il guasto "
                        "che il piano dichiara: se le due non combaciano, il raggio "
                        "prende la superficie sbagliata e la normale esce a macchie.")
    return p.parse_args(argv)


def pulisci():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def cubo(nome):
    bpy.ops.mesh.primitive_cube_add(size=2.0, location=(0, 0, 0))
    ob = bpy.context.active_object
    ob.name = nome
    ob.data.name = nome
    return ob


def uv_a_mano(ob, inset=0.02):
    """
    Sei isole in una griglia 3x2. Scritte a mano apposta: gli operatori di
    unwrap vogliono un'area 3D e in headless non ce n'e' una. Cosi' le UV sono
    deterministiche e il margine e' un numero che conosco.
    """
    me = ob.data
    if not me.uv_layers:
        me.uv_layers.new(name="UVMap")
    uv = me.uv_layers[0].data
    cw, ch = 1.0 / 3.0, 1.0 / 2.0
    for i, poly in enumerate(me.polygons):
        col, row = i % 3, i // 3
        n = [abs(poly.normal[0]), abs(poly.normal[1]), abs(poly.normal[2])]
        ax = n.index(max(n))
        ua, va = [k for k in (0, 1, 2) if k != ax]
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            u = (co[ua] + 1.0) * 0.5
            v = (co[va] + 1.0) * 0.5
            uv[li].uv = (col * cw + inset + u * (cw - 2 * inset),
                         row * ch + inset + v * (ch - 2 * inset))
    return inset


def materiale_alta():
    mat = bpy.data.materials.new("PROVINO_ALTA")
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs['Base Color'].default_value = (0.55, 0.57, 0.60, 1.0)
    bsdf.inputs['Metallic'].default_value = 0.85          # costante: il canale B deve uscire piatto a 217
    rumore = nt.nodes.new("ShaderNodeTexNoise")
    rumore.inputs['Scale'].default_value = 6.0
    rumore.inputs['Detail'].default_value = 2.0
    mappa = nt.nodes.new("ShaderNodeMapRange")
    mappa.inputs['From Min'].default_value = 0.30
    mappa.inputs['From Max'].default_value = 0.70
    mappa.inputs['To Min'].default_value = 0.15           # la rugosita' deve variare: il canale G no
    mappa.inputs['To Max'].default_value = 0.55
    mappa.clamp = True
    nt.links.new(rumore.outputs['Fac'], mappa.inputs['Value'])
    nt.links.new(mappa.outputs['Result'], bsdf.inputs['Roughness'])
    return mat


def main():
    a = argomenti()
    pulisci()

    # ---------------- BASSA: cubo nudo, UV pulite -------------------------
    bassa = cubo("BASSA")
    inset = uv_a_mano(bassa)
    for p in bassa.data.polygons:
        p.use_smooth = False

    # ---------------- ALTA: scanalatura + smussi --------------------------
    alta = cubo("ALTA")
    if a.identica:
        alta.data.materials.clear()
        alta.data.materials.append(materiale_alta())
        percorso = os.path.abspath(a.blend)
        os.makedirs(os.path.dirname(percorso), exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=percorso)
        print("PROVINO IDENTICO scritto in %s  (ALTA %d facce = BASSA %d facce)"
              % (percorso, len(alta.data.polygons), len(bassa.data.polygons)))
        return

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.0, 1.0 + 0.5 - a.scanalatura))
    tagliente = bpy.context.active_object
    tagliente.name = "TAGLIENTE"
    tagliente.scale = (0.5, 1.2, 1.0)

    bpy.context.view_layer.objects.active = alta
    m = alta.modifiers.new("scanalatura", 'BOOLEAN')
    m.operation = 'DIFFERENCE'
    m.object = tagliente
    m.solver = 'EXACT'
    bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.data.objects.remove(tagliente, do_unlink=True)

    if a.fessura > 0.0:
        bpy.ops.mesh.primitive_cube_add(size=1.0,
                                        location=(1.0 + 0.5 - a.fessura, 0.0, 0.0))
        f = bpy.context.active_object
        f.name = "FESSURA"
        f.scale = (1.0, 1.2, a.larghezza_fessura)
        bpy.context.view_layer.objects.active = alta
        m = alta.modifiers.new("fessura", 'BOOLEAN')
        m.operation = 'DIFFERENCE'
        m.object = f
        m.solver = 'EXACT'
        bpy.ops.object.modifier_apply(modifier=m.name)
        bpy.data.objects.remove(f, do_unlink=True)

    bpy.context.view_layer.objects.active = alta
    b = alta.modifiers.new("smusso", 'BEVEL')
    b.width = a.smusso
    b.segments = a.segmenti
    b.limit_method = 'ANGLE'
    b.angle_limit = 0.5236          # 30 gradi
    b.harden_normals = False
    bpy.ops.object.modifier_apply(modifier=b.name)

    bpy.ops.object.select_all(action='DESELECT')
    alta.select_set(True)
    bpy.context.view_layer.objects.active = alta
    try:
        bpy.ops.object.shade_auto_smooth(angle=0.6981)      # 40 gradi
    except Exception:
        for p in alta.data.polygons:
            p.use_smooth = True

    alta.data.materials.clear()
    alta.data.materials.append(materiale_alta())

    if a.con_cage > 0.0:
        gabbia = bassa.copy()
        gabbia.data = bassa.data.copy()
        gabbia.name = "CAGE"
        gabbia.data.name = "CAGE"
        bpy.context.collection.objects.link(gabbia)
        for v in gabbia.data.vertices:      # il cubo e' centrato: gonfiare = spostare lungo le normali
            v.co = v.co * (1.0 + a.con_cage)

    if a.disallinea != 0.0:
        import math
        bassa.rotation_euler = (0.0, 0.0, math.radians(a.disallinea))

    percorso = os.path.abspath(a.blend)
    os.makedirs(os.path.dirname(percorso), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=percorso)

    print("=" * 70)
    print("PROVINO scritto in %s" % percorso)
    print("  ALTA   %d facce  (smusso %.3f x %d segmenti, scanalatura profonda %.3f)"
          % (len(alta.data.polygons), a.smusso, a.segmenti, a.scanalatura))
    print("  BASSA  %d facce  %d UV, margine di isola %.3f in UV" %
          (len(bassa.data.polygons), len(bassa.data.uv_layers), inset))
    print("  sporgenza massima attesa dello smusso sotto la bassa: %.4f"
          % (a.smusso * 0.4142))
    print("  profondita' massima da raggiungere (scanalatura): %.4f" % a.scanalatura)
    if a.fessura > 0.0:
        print("  FESSURA su +X: profonda %.3f, larga %.3f (rapporto %.1f:1) - "
              "e' li' che nascono le macchie"
              % (a.fessura, a.larghezza_fessura, a.fessura / a.larghezza_fessura))
    print("=" * 70)


if __name__ == "__main__":
    main()
