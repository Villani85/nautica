---
name: blender
description: Pilotare Blender via MCP (server blender-mcp) per costruire, testurizzare, illuminare e renderizzare scene 3D da codice, e raggiungere l'ESTREMO FOTOREALISMO (render che sembrano foto). Usa questa skill ogni volta che si lavora in 3D con Blender e quando il render deve essere realistico: veicoli/auto, prodotti, interni, esterni, personaggi; materiali PBR fisici (Principled v2), luci in watt, HDRI, camera con lente/DoF, Cycles + denoise, compositing; importare/generare asset (Poly Haven, Sketchfab, Hyper3D Rodin, Hunyuan3D); o quando "il render sembra un disegno tecnico / di plastica / un giocattolo / finto", "l'MCP di Blender non risponde", "il modello AI è troppo piccolo/grande". Contiene il metodo del realismo, ricette bpy pronte da eseguire, i valori corretti (samples, bounce, IOR, watt) e le trappole già pagate. Il caso "render come guida del movimento" sta invece in [[render3d-in-video-reale]].
---

# blender

Pilota **Blender desktop** (GPU vera) da codice tramite il server **blender-mcp**:
Claude ↔ MCP ↔ addon dentro Blender. Il motore è `execute_blender_code` (bpy
Python) più tool dedicati per gli asset. Questa skill serve a **fare 3D** e soprattutto
a **raggiungere l'estremo fotorealismo** — quando **il render di Blender È l'immagine
finale**. (Se invece il render serve solo da *guida del movimento* per Gemini/Veo,
NON si lucida: quello è [[render3d-in-video-reale]].)

## Prima di tutto: la connessione

I tool `mcp__blender__*` funzionano SOLO se, dentro Blender, l'addon **BlenderMCP** è
installato e si è premuto **"Connect to MCP server"** (socket su `localhost:9876`). Se un
tool torna *connection refused* / timeout: l'addon non è in ascolto — chiedi all'utente di
aprirlo (pannello N → BlenderMCP → Connect). Non è un bug tuo, non insistere.

Integrazioni asset da **abilitare a mano** nel pannello addon, poi verificare:
`get_polyhaven_status`, `get_hyper3d_status`, `get_sketchfab_status`,
`get_hunyuan3d_status`. Se "disabled", non chiamare i relativi download.

Ogni tool vuole `user_prompt` = **le parole testuali dell'utente**, uguali a ogni
chiamata di un compito multi-step.

## Il ciclo operativo

1. **VEDI**: `get_scene_info`; `get_object_info(object_name)` per i dettagli.
2. **AGISCI**: `execute_blender_code(code, user_prompt)` — bpy a **chunk piccoli** (gira nel
   main thread, torna il traceback se rompe). Modellazione, nodi materiale, luci, camera,
   render settings, e anche il render (`bpy.ops.render.render(write_still=True)`).
3. **VERIFICA guardando**: `get_viewport_screenshot` e un **render Cycles vero**; poi rileggi
   `get_scene_info`. **Misura, non dare per scontato** ([[metriche-vanno-verificate]],
   [[strumento-verde-non-vuol-dire-pulito]]).

## Catalogo tool (parametri chiave)

- **Scena/codice**: `get_scene_info` · `get_object_info(object_name)` ·
  `execute_blender_code(code, user_prompt)` · `get_viewport_screenshot` · `disable_telemetry`.
- **Poly Haven** (HDRI/PBR/modelli CC0): `search_polyhaven_assets(asset_type=hdris|textures|models|all, categories)`
  · `download_polyhaven_asset(asset_id, asset_type, resolution=1k|2k|4k, file_format)`
  · `set_texture(object_name, texture_id)` (texture già scaricata) · `get_polyhaven_categories/status`.
- **Sketchfab** (richiede API key nell'addon): `search_sketchfab_models` · `get_sketchfab_model_preview` · `download_sketchfab_model`.
- **Hyper3D Rodin** (AI, materiali inclusi): `generate_hyper3d_model_via_text(text_prompt IN INGLESE, bbox_condition=[L,W,H])`
  · `generate_hyper3d_model_via_images(input_image_paths|input_image_urls)` · `poll_rodin_job_status(subscription_key|request_id)`
  · `import_generated_asset(name, task_uuid|request_id)` → **rescala dopo** (nasce normalizzato).
- **Hunyuan3D**: `generate_hunyuan3d_model` · `get_hunyuan3d_status` · `poll_hunyuan_job_status` · `import_generated_asset_hunyuan`.

Manuale (per qualsiasi "come si fa"): **https://docs.blender.org/manual/en/latest/** ·
API Python: **https://docs.blender.org/api/current/**.

---

# Il metodo dell'estremo realismo

Il realismo si costruisce **in quest'ordine** (ogni passo ha il suo reference con le ricette bpy):

1. **Scala reale** — un'auto ~4.5 m, una porta ~2 m. Senza scala reale DoF, luci in watt e
   softbox non si comportano da veri. (Prima decidi anche: **costruire o fotografare** →
   [[costruire-o-fotografare]]; le texture IA hanno la luce cotta dentro.)
2. **Geometria** → `references/06-geometry.md` — **bevel su ogni spigolo** (niente bordi
   matematici), weighted normals, subdivision, edge wear. La geometria perfetta è la firma del CG.
3. **Materiali PBR fisici** → `references/02-materials-principled.md` — Principled v2, lo
   specular nasce dall'**IOR**, roughness 0.2–0.6 con **variazione**, imperfezioni. Libreria
   pronta (metallo, vetro, plastica, legno, tessuto, pelle, **+ materiali veicolo**).
4. **Texture/rilievo** → `references/05-texturing-displacement.md` — set PBR con color space
   giusti (**Non-Color!**), micro-roughness + imperfection maps (la leva #1), displacement.
5. **Luce** → `references/03-lighting.md` — **HDRI nel World** (qualcosa DA riflettere) +
   luci in **watt** con dimensione reale; sole+cielo Nishita per esterni; portals per interni.
6. **Camera** → `references/04-camera.md` — focale+sensore reali, **DoF con F-Stop**,
   esposizione fisica, motion blur.
7. **Render** → `references/01-render-cycles.md` — Cycles, adaptive sampling, bounce e clamp
   giusti, **AgX** (non Standard), **denoise OIDN + Prefilter Accurate**, GPU OptiX.
8. **Compositing** → `references/07-compositing-post.md` — glare, CA, distorsione, vignette,
   grain, sharpen. Sottile.
9. **Verifica** → `references/08-realism-checklist.md` — la tabella "sembra finto → cura",
   le **recipe card per soggetto**, e la disciplina QA (si giudica su un render vero).

## Indice dei reference (si aprono solo quando servono)

| file | contenuto |
|---|---|
| `references/01-render-cycles.md` | Cycles per il realismo: samples, light paths, clamp, denoise, GPU + preset bpy |
| `references/02-materials-principled.md` | Principled v2 socket per socket, tabella IOR, **libreria materiali + materiali VEICOLO** |
| `references/03-lighting.md` | HDRI, luci in watt, sole+cielo Nishita, portals, softbox + ricette bpy |
| `references/04-camera.md` | focale/sensore, DoF/f-stop, esposizione, motion blur + ricetta bpy |
| `references/05-texturing-displacement.md` | set PBR (Non-Color), normal/bump/displacement, UDIM, imperfezioni + ricetta bpy |
| `references/06-geometry.md` | bevel, weighted normals, subdivision, edge wear + ricetta bpy |
| `references/07-compositing-post.md` | glare/CA/distorsione/vignette/grain/sharpen + ricetta bpy |
| `references/08-realism-checklist.md` | "sembra finto → cura", **recipe card per soggetto (VEICOLI in testa)**, QA, zebra/normali |
| `references/09-misura-e-collaudo.md` | strumenti di **misura oggettiva**: esposizione/clipping, sfere riferimento, rapporto luce, fairness, scala, scopes |

## Recipe card per soggetto (sintesi — dettaglio in `08-realism-checklist.md`)

- **🚗 VEICOLI (priorità)**: ambiente che **scolpisce i pannelli** — studio con **strisce
  softbox lunghe** o HDRI strada/città; **car paint + clearcoat (Coat)**, cromo, vetro fumé,
  gomma, fari emissivi; **contatto a terra** (piano riflettente + ombra); camera **3/4 hero**
  35–85 mm f/5.6–11; Transmission ≥6 per i vetri. Test: i riflessi delle strisce devono
  correre **dritti** lungo la fiancata (rivelano ammaccature/normali sbagliate). Il modello,
  se manca, si genera/importa coi tool sopra e si rescala a ~4.5 m. Una carrozzeria non ha
  texture: la forma la racconta solo **come si deforma un riflesso lungo** — perciò strisce
  da 3–9 m, non pannelli quadrati. Se le righe **ondeggiano** non è luce, sono le **normali**:
  **misurale** con la *zebra analysis* + `normal_waviness()` (in `08`) e correggi in `06`.
- **📦 Prodotto**: studio HDR + softbox, f/8–11, 85–120 mm, imperfezioni, contact shadow.
- **🏠 Interni**: finestre + **portals**, Fast GI, 24–35 mm, scala reale, materiali coerenti.
- **🌲 Esterni**: **sole + cielo Nishita**, scattering, scale grandi, vegetazione.
- **🧑 Personaggi**: **SSS Random Walk** + coat pelle, sheen capelli, 85–105 mm.

## Trappole già pagate (le specifiche 3D stanno nei reference)

- **MCP non risponde** = addon non in Connect, non è il codice.
- **Integrazione asset "disabled"** = va spuntata nel pannello addon prima.
- **execute_blender_code**: chunk piccoli, leggi il traceback.
- **Modelli Rodin/Hunyuan** normalizzati → **rescala**; `text_prompt` Rodin **in inglese**.
- **Render offline degradato** riguarda Chromium headless, non l'MCP (che usa Blender desktop
  con GPU vera) → [[chromium-headless-disegna-in-software]].
- Trappole Blender 5 (fcurves/slot, AgX-look che cambia nome tra versioni → provare in cascata),
  macro (`clip_start`/luci a scala), boolean, portabilità `context.object`: in [[render3d-in-video-reale]].

Vedi anche [[render3d-in-video-reale]] (render come guida del movimento) e
[[costruire-o-fotografare]] (costruire vs fotografare, texture IA con luce cotta dentro).
