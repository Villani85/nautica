"""
PROVINO 3: quanto dettaglio, misurato invece che indovinato.

Il provino 2 ha aggiunto rugosita' variabile e graffi e ha prodotto metallo
CORROSO: sembrava muffa. L'errore non era l'idea, era la quantita' — facevo
oscillare la rugosita' di 0,24 dove un pezzo tornito varia di 0,02, e il rilievo
dei graffi era grosso come una martellatura.

Qui si rendono TRE intensita' nello stesso giro e si guardano affiancate. E si
aggiunge la cosa che al provino 2 mancava del tutto: l'ANISOTROPIA. Un pezzo
tornito ha i riflessi allungati NEL VERSO DELLA LAVORAZIONE, ed e' quello — piu'
di qualunque graffio — che si legge come acciaio.
"""
import bpy, time, math, sys, os

FUORI = sys.argv[-1]

# (nome, escursione della rugosita', forza del rilievo, anisotropia)
PROVE = [
    ('dir-lieve', 0.04, 0.006, 0.70),
    ('dir-medio', 0.09, 0.012, 0.80),
]


def costruisci(escursione, rilievo, aniso):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene

    def metallo(nome, colore, base):
        m = bpy.data.materials.new(nome)
        m.use_nodes = True
        nt = m.node_tree
        b = nt.nodes['Principled BSDF']
        b.inputs['Base Color'].default_value = (*colore, 1)
        b.inputs['Metallic'].default_value = 1.0
        b.inputs['Roughness'].default_value = base
        # ANISOTROPIA: i riflessi si allungano nel verso della lavorazione
        if 'Anisotropic' in b.inputs:
            b.inputs['Anisotropic'].default_value = aniso
        if 'Anisotropic Rotation' in b.inputs:
            b.inputs['Anisotropic Rotation'].default_value = 0.25

        coord = nt.nodes.new('ShaderNodeTexCoord')
        # rugosita' che respira, di poco
        rumore = nt.nodes.new('ShaderNodeTexNoise')
        rumore.inputs['Scale'].default_value = 5.0
        rumore.inputs['Detail'].default_value = 3.0
        # LA VARIAZIONE SEGUE IL VERSO DELLA LAVORAZIONE. A macchie isotrope si
        # legge come sporco, sempre: schiacciata lungo l'asse del pezzo diventa
        # la traccia dell'utensile.
        versoLav = nt.nodes.new('ShaderNodeMapping')
        versoLav.inputs['Scale'].default_value = (0.06, 9.0, 9.0)
        nt.links.new(coord.outputs['Object'], versoLav.inputs['Vector'])
        nt.links.new(versoLav.outputs['Vector'], rumore.inputs['Vector'])
        mappa = nt.nodes.new('ShaderNodeMapRange')
        mappa.inputs['From Min'].default_value = 0.35
        mappa.inputs['From Max'].default_value = 0.65
        mappa.inputs['To Min'].default_value = base - escursione / 2
        mappa.inputs['To Max'].default_value = base + escursione / 2
        nt.links.new(rumore.outputs['Fac'], mappa.inputs['Value'])
        nt.links.new(mappa.outputs['Result'], b.inputs['Roughness'])

        # microgeometria: finissima e allungata, non una martellatura
        g = nt.nodes.new('ShaderNodeTexNoise')
        g.inputs['Scale'].default_value = 900.0
        g.inputs['Detail'].default_value = 1.0
        st = nt.nodes.new('ShaderNodeMapping')
        st.inputs['Scale'].default_value = (1.0, 60.0, 1.0)
        nt.links.new(coord.outputs['Object'], st.inputs['Vector'])
        nt.links.new(st.outputs['Vector'], g.inputs['Vector'])
        bump = nt.nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = rilievo
        nt.links.new(g.outputs['Fac'], bump.inputs['Height'])
        nt.links.new(bump.outputs['Normal'], b.inputs['Normal'])
        return m

    acciaio = metallo('acciaio', (0.56, 0.57, 0.58), 0.20)
    bronzo = metallo('bronzo', (0.70, 0.55, 0.34), 0.30)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.34, depth=3.2, rotation=(0, math.pi / 2, 0))
    o = bpy.context.object
    o.data.materials.append(acciaio); bpy.ops.object.shade_smooth()
    m = o.modifiers.new('s', 'BEVEL'); m.width = 0.012; m.segments = 3

    bpy.ops.mesh.primitive_cylinder_add(radius=1.05, depth=0.22, location=(0.9, 0, 0),
                                        rotation=(0, math.pi / 2, 0))
    o = bpy.context.object
    o.data.materials.append(bronzo); bpy.ops.object.shade_smooth()
    m = o.modifiers.new('s', 'BEVEL'); m.width = 0.02; m.segments = 3

    for i in range(8):
        a = i * math.pi / 4
        bpy.ops.mesh.primitive_cylinder_add(radius=0.085, depth=0.30, vertices=6,
                                            location=(0.9, math.cos(a) * 0.78, math.sin(a) * 0.78),
                                            rotation=(0, math.pi / 2, 0))
        bpy.context.object.data.materials.append(acciaio)
        m = bpy.context.object.modifiers.new('s', 'BEVEL'); m.width = 0.006; m.segments = 2

    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, -1.4))
    f = bpy.data.materials.new('fondo'); f.use_nodes = True
    fb = f.node_tree.nodes['Principled BSDF']
    fb.inputs['Base Color'].default_value = (0.17, 0.18, 0.19, 1)
    fb.inputs['Roughness'].default_value = 0.42
    bpy.context.object.data.materials.append(f)

    def softbox(pos, rot, energia, misura, y):
        bpy.ops.object.light_add(type='AREA', location=pos)
        o = bpy.context.object
        o.data.shape = 'RECTANGLE'; o.data.size = misura; o.data.size_y = misura * y
        o.data.energy = energia; o.rotation_euler = rot

    softbox((2.6, -4.6, 4.2), (math.radians(46), 0, math.radians(30)), 1500, 5.0, 0.28)
    softbox((-4.4, 2.4, 2.6), (math.radians(72), 0, math.radians(-126)), 700, 4.0, 0.30)
    softbox((0.4, -1.2, 5.6), (0, 0, 0), 400, 7.0, 0.10)

    sc.world = bpy.data.worlds.new('m'); sc.world.use_nodes = True
    wn = sc.world.node_tree
    sf = wn.nodes['Background']
    gr = wn.nodes.new('ShaderNodeTexGradient'); gr.gradient_type = 'EASING'
    cc = wn.nodes.new('ShaderNodeTexCoord')
    mp = wn.nodes.new('ShaderNodeMapping')
    mp.inputs['Rotation'].default_value = (math.radians(90), 0, 0)
    wn.links.new(cc.outputs['Generated'], mp.inputs['Vector'])
    wn.links.new(mp.outputs['Vector'], gr.inputs['Vector'])
    ra = wn.nodes.new('ShaderNodeValToRGB')
    ra.color_ramp.elements[0].color = (0.05, 0.06, 0.07, 1)
    ra.color_ramp.elements[1].color = (0.46, 0.48, 0.50, 1)
    wn.links.new(gr.outputs['Fac'], ra.inputs['Fac'])
    wn.links.new(ra.outputs['Color'], sf.inputs[0])
    sf.inputs[1].default_value = 0.8

    bpy.ops.object.camera_add(location=(4.2, -5.0, 2.1))
    cam = bpy.context.object
    cam.rotation_euler = (math.radians(74), 0, math.radians(40))
    cam.data.lens = 85
    cam.data.dof.use_dof = True
    cam.data.dof.focus_distance = 6.4
    cam.data.dof.aperture_fstop = 3.5
    sc.camera = cam

    sc.render.engine = 'CYCLES'
    try:
        p = bpy.context.preferences.addons['cycles'].preferences
        p.get_devices(); p.compute_device_type = 'OPTIX'
        for d in p.devices: d.use = True
        sc.cycles.device = 'GPU'
    except Exception:
        pass
    sc.cycles.use_denoising = True
    sc.cycles.samples = 130
    sc.render.resolution_x = 760
    sc.render.resolution_y = 470
    sc.render.image_settings.file_format = 'PNG'
    sc.view_settings.view_transform = 'AgX'
    return sc


for nome, esc, ril, ani in PROVE:
    sc = costruisci(esc, ril, ani)
    sc.render.filepath = os.path.join(FUORI, 'p4-' + nome + '.png')
    t = time.time()
    bpy.ops.render.render(write_still=True)
    print('TEMPO %s (rug %.2f rilievo %.3f aniso %.2f): %.1f s' % (nome, esc, ril, ani, time.time() - t))
