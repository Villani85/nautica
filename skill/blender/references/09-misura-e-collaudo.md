# 09 — Misura e collaudo (strumenti oggettivi)

Il realismo si **misura**, non si intuisce ([[metriche-vanno-verificate]]). Oltre alla zebra/normali
(`08`), questi strumenti danno **numeri** su esposizione, luce, forma, scala e qualità di render.

## 1. Metro di esposizione / clipping (highlight bruciati, neri schiacciati)

Il difetto "highlight neon/clippati" si misura: quanti pixel sono a 1.0 (bruciati) o a 0.0
(schiacciati), e la luminanza media. Rendi su file, poi:

```python
import bpy
def measure_exposure(path, stride=7):
    img = bpy.data.images.load(path, check_existing=False)
    w, h = img.size
    px = img.pixels[:]                      # RGBA flat 0..1 (post view-transform se PNG)
    n = w*h; blown=crushed=cnt=0; lum=0.0
    for i in range(0, n, stride):
        r,g,b = px[i*4], px[i*4+1], px[i*4+2]
        L = 0.2126*r+0.7152*g+0.0722*b; lum += L; cnt += 1
        if r>=0.999 and g>=0.999 and b>=0.999: blown += 1
        if r<=0.001 and g<=0.001 and b<=0.001: crushed += 1
    bpy.data.images.remove(img)
    return {"mean_lum": round(lum/cnt,4),
            "blown_%": round(100*blown/cnt,3),
            "crushed_%": round(100*crushed/cnt,3)}
# render prima (01), poi: print(measure_exposure("//render_test.png"))
# Guida: blown_% oltre ~0.5–1% su superfici non-emissive = sovraesposto / manca clamp/AgX.
```

## 2. Sfere di riferimento: grigio 18% + palla cromata

Il metodo VFX per **leggere la luce**: una **sfera grigia** misura l'esposizione (deve rendere al
valore atteso), una **sfera cromata** mostra direzioni, colore e nitidezza dell'ambiente (e se le
strisce softbox staccano). Mettile accanto al soggetto per i test.

```python
import bpy
def add_reference_balls(location=(0,0,0), r=0.12):
    # grigio 18%
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(location[0]-0.3, location[1], location[2]))
    g = bpy.context.active_object; g.name="RefGray"; bpy.ops.object.shade_smooth()
    mg = bpy.data.materials.new("RefGray"); mg.use_nodes=True
    b = mg.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value=(0.18,0.18,0.18,1); b.inputs["Roughness"].default_value=0.5
    b.inputs["Metallic"].default_value=0.0; g.data.materials.append(mg)
    # cromata
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=(location[0]+0.3, location[1], location[2]))
    c = bpy.context.active_object; c.name="RefChrome"; bpy.ops.object.shade_smooth()
    mc = bpy.data.materials.new("RefChrome"); mc.use_nodes=True
    b2 = mc.node_tree.nodes.get("Principled BSDF")
    b2.inputs["Base Color"].default_value=(0.91,0.92,0.92,1); b2.inputs["Metallic"].default_value=1.0
    b2.inputs["Roughness"].default_value=0.02; c.data.materials.append(mc)
    return g, c
```

## 3. Rapporto di luce chiave:riempimento (in stop)

La fotografia si controlla col rapporto key:fill (es. 3:1). Misuralo campionando un rettangolo sul
lato **illuminato** e uno in **ombra** di un oggetto (o della sfera grigia) nel render:

```python
import bpy, math
def patch_mean(path, x0, y0, x1, y1):
    img = bpy.data.images.load(path); w,h = img.size; px = img.pixels[:]
    s=0.0; c=0
    for y in range(int(y0*h), int(y1*h)):
        for x in range(int(x0*w), int(x1*w)):
            i=(y*w+x)*4; s += 0.2126*px[i]+0.7152*px[i+1]+0.0722*px[i+2]; c+=1
    bpy.data.images.remove(img); return s/max(1,c)
def light_ratio(path, lit_box, shadow_box):
    L=patch_mean(path,*lit_box); S=patch_mean(path,*shadow_box)
    ratio=L/max(1e-5,S); stops=math.log2(max(1e-5,ratio))
    return {"lit":round(L,4),"shadow":round(S,4),"ratio":round(ratio,2),"stops":round(stops,2)}
# box in coord normalizzate (0..1): light_ratio("//render_test.png",(0.55,0.4,0.6,0.5),(0.4,0.4,0.45,0.5))
```

## 4. Fairness su più scanline (estende la zebra)

`normal_waviness()` (`08`) su **più altezze** dà una mappa dell'ondulazione, non un solo taglio:

```python
def waviness_map(obj_name, zs=(0.5,0.7,0.9,1.1,1.3), **kw):
    from math import isnan
    rows=[]
    for z in zs:
        r = normal_waviness(obj_name, z=z, **kw)   # definita in ref 08
        rows.append((z, r.get("waviness_rms"), r.get("wiggles"), r.get("worst_x")))
    worst = max((r for r in rows if r[1] is not None), key=lambda r:r[1], default=None)
    return {"rows":rows, "worst_scanline":worst}
```

## 5. Verifica di scala (rompe DoF/luci se sbagliata)

```python
import bpy
def check_scale(obj_name):
    d = bpy.data.objects[obj_name].dimensions
    return {"x_m":round(d.x,3),"y_m":round(d.y,3),"z_m":round(d.z,3)}
# un'auto media ~ (4.5, 1.8, 1.4) m; una porta ~ (0.9, 0.05, 2.1) m
```

## 6. Perdita di dettaglio del denoiser (immagine differenza)

Se OptiX "spalma", confronta un render **denoise ON** e uno **OFF** (o un pass Noise) e guarda la
differenza: dove sparisce dettaglio fine, passa a **OpenImageDenoise + Prefilter Accurate** (`01`)
o alza i samples nelle zone critiche.

## 7. Strumenti interattivi di Blender (non-codice)

- **Image Editor → Sidebar (N) → Scopes**: **Histogram** (esposizione/clipping), **Waveform**
  (distribuzione tonale), **Vectorscope** (dominante colore; la linea "skin" per i volti),
  **Parade** RGB (white balance). Sono il tuo "monitor da colorist".
- **Cryptomatte** (pass) per selezionare oggetti/materiali in compositing con precisione.
- **Noise Threshold** dell'adaptive sampling (`01`) È già una misura di convergenza: il render si
  ferma quando il rumore stimato scende sotto soglia.
- **Statistics overlay / N-panel Dimensions** per leggere misure e conteggi al volo.

## 8. Contatto a terra ("incollato" vs appoggiato)

L'ombra di contatto morbida sotto il soggetto è ciò che lo àncora. Verifica con un **AO pass** o
un render ravvicinato della base: se sotto le ruote/base non c'è occlusione scura ravvicinata, il
soggetto "galleggia". Aggiungi un piano ombra o alza l'AO locale (`03`, `07`).

---

Ordine di collaudo consigliato per un'auto: `check_scale` → sfere di riferimento + render →
`measure_exposure` → zebra + `normal_waviness`/`waviness_map` → `light_ratio` → contatto a terra →
post (`07`). Ogni intervento si **rimisura**: il numero deve scendere, non "sembrare meglio".

Torna al metodo: [[blender]]. Checklist e recipe card: `08-realism-checklist.md`.
