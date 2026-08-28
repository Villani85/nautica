import bpy, sys
print("--- OGGETTI ---")
for o in bpy.data.objects:
    n = len(o.data.polygons) if o.type == 'MESH' and o.data else 0
    uv = [l.name for l in o.data.uv_layers] if o.type == 'MESH' and o.data else []
    print("  %-28s %-8s facce %6d  uv %s  mod %s" % (o.name, o.type, n, uv, [m.type for m in o.modifiers]))
