# 01 — Cycles per il realismo

Cycles (path tracer fisico) è il motore del fotorealismo. EEVEE Next solo per l'anteprima
veloce. Valori tarati su **Blender 5.2**.

## Impostazioni chiave (cosa e perché)

| Voce | Valore realismo | Note |
|---|---|---|
| Adaptive Sampling | ON | risparmia 20–40% a parità di resa |
| Noise Threshold | **0.01** prod · 0.05 test | più basso = più pulito e più lento |
| Max Samples | **200–500** · 1024+ per hero (SSS/vetro/volume) | tetto, l'adaptive si ferma prima |
| Min Samples | 0 (auto) o 16–64 | evita rumore nelle zone scure |
| Max Bounces (Totale) | **6–8** | interni 8+; prodotto 6 |
| Diffuse | 2–3 (prodotto) · 4+ (interni) | |
| Glossy | 2–4 | riflessi puliti su auto: 3–4 |
| Transmission | **4–8** · 8–12 vetro impilato | troppo basso = vetro nero |
| Volume | 0–2 | fumo/atmosfera |
| Clamp Direct | **0** | la diretta converge da sola |
| Clamp Indirect | **~10** (3–5 se restano fireflies) | leva anti-firefly n.1 |
| Light Tree | ON | scene con molte luci molto meno rumorose |
| Fast GI | ON per interni | leva di velocità sulla GI |
| Caustics (refl/refr) | OFF | accendi solo se servono i disegni di luce nel vetro/acqua |
| Filter Glossy | ~1.0 | sfoca appena i glossy = meno fireflies |
| Denoiser | **OpenImageDenoise** (qualità) · OptiX (velocità) | |
| Denoise Passes | **Albedo + Normal** | tiene i dettagli |
| Prefilter | **Accurate** | leva di qualità del denoise |
| Persistent Data | ON per animazioni | più veloce, più RAM |
| Device | **GPU OptiX** (RTX) o CUDA | OptiX usa gli RT core |
| View Transform | **AgX** (mai Standard per foto) | rolloff dei bright come pellicola |

**Ordine anti-firefly**: alza samples / abbassa threshold → **Clamp Indirect ~10** → Light Tree
ON → riduci il contrasto estremo di HDRI/emitter → Filter Glossy → poi denoise. Tolti i
fireflies, puoi abbassare i samples.

## Ricetta bpy — preset "photoreal"

```python
import bpy
scene = bpy.context.scene

# --- Motore + GPU ---
scene.render.engine = 'CYCLES'
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    # prova OptiX, poi CUDA, poi HIP/oneAPI/Metal
    for backend in ('OPTIX', 'CUDA', 'HIP', 'ONEAPI', 'METAL'):
        try:
            prefs.compute_device_type = backend
            break
        except TypeError:
            continue
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True                      # abilita GPU (e CPU se presente)
    scene.cycles.device = 'GPU'
except Exception as e:
    print("GPU non configurata, uso CPU:", e)

cy = scene.cycles
# --- Sampling ---
cy.use_adaptive_sampling = True
cy.adaptive_threshold = 0.01             # 0.05 per i test
cy.samples = 300                         # tetto; hero 1024
cy.adaptive_min_samples = 0
# --- Light paths ---
cy.max_bounces = 8
cy.diffuse_bounces = 3
cy.glossy_bounces = 4
cy.transmission_bounces = 8              # 12 per vetro impilato
cy.volume_bounces = 2
cy.transparent_max_bounces = 8
# --- Anti-firefly ---
cy.sample_clamp_direct = 0.0
cy.sample_clamp_indirect = 10.0
cy.blur_glossy = 1.0                     # Filter Glossy
cy.use_light_tree = True
cy.caustics_reflective = False
cy.caustics_refractive = False
# --- Fast GI (utile per interni; commenta per esterni open) ---
try:
    cy.use_fast_gi = True
    cy.ao_bounces_render = 1
except Exception:
    pass
# --- Denoise ---
cy.use_denoising = True
try:
    cy.denoiser = 'OPENIMAGEDENOISE'     # 'OPTIX' per velocità
except TypeError:
    cy.denoiser = 'OPTIX'
try:
    cy.denoising_input_passes = 'RGB_ALBEDO_NORMAL'
    cy.denoising_prefilter = 'ACCURATE'
except Exception:
    pass
# --- Animazione: dati persistenti ---
scene.render.use_persistent_data = True

# --- Color management: AgX (i nomi del Look cambiano tra versioni → cascata) ---
scene.view_settings.view_transform = 'AgX'
for look in ('AgX - Medium High Contrast', 'AgX - Base Contrast', 'AgX - Punchy',
             'Medium High Contrast', 'None'):
    try:
        scene.view_settings.look = look
        break
    except TypeError:
        continue
scene.view_settings.exposure = 0.0       # regola la luminosità QUI, non moltiplicando le luci

# --- Output ---
scene.render.resolution_x = 2560
scene.render.resolution_y = 1440
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_depth = '16'
print("Preset photoreal applicato.")
```

## Rendere e verificare

```python
import bpy
bpy.context.scene.render.filepath = "//render_test.png"
bpy.ops.render.render(write_still=True)   # salva il PNG accanto al .blend
```
Poi giudica su un **render vero** (non sullo stato teorico): highlight non clippati sotto AgX,
riflessi dell'HDRI presenti, niente fireflies. Vedi `08-realism-checklist.md` e
[[metriche-vanno-verificate]].

Torna al metodo: [[blender]].
