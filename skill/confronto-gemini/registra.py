# -*- coding: utf-8 -*-
"""Registra un sito componendo il filmato dagli screenshot.

Perche' non il registratore di Playwright: con pagine a canvas e scroll
morbido ripeteva lo stesso fotogramma anche per mezzo minuto mentre la pagina
scorreva regolarmente, e su quel filmato i giudizi crollavano. Qui ogni
fotogramma e' uno scatto vero e alla fine si conta quanti sono duplicati: se
non sono quasi zero, il filmato mente e va detto.

Serve Chrome vero (channel=chrome): il Chromium di Playwright non ha i codec
proprietari e un <video> H.264 resterebbe nero.

USO: python registra.py URL nome larghezza altezza [attesa] [--tocco]
"""
import asyncio, io, os, shutil, subprocess, sys
from playwright.async_api import async_playwright
from PIL import Image
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
QUI = os.path.dirname(os.path.abspath(__file__))
URL, NOME = sys.argv[1], sys.argv[2]
LARG, ALT = int(sys.argv[3]), int(sys.argv[4])
ATTESA = float(sys.argv[5]) if len(sys.argv) > 5 and not sys.argv[5].startswith("-") else 5.0
TOCCO = "--tocco" in sys.argv
# secondi di attesa PRIMA di iniziare a riprendere: servono ai siti con un
# preloader lungo. Senza, meta' del filmato del riferimento era la sua barra
# di caricamento (0% -> 35%), e il confronto avrebbe giudicato l'attesa
# invece del disegno. Il tempo di caricamento si misura a parte.
PRIMA = 0.0
for i, a in enumerate(sys.argv):
    if a == "--attendi":
        PRIMA = float(sys.argv[i + 1])
FPS = 12

async def main():
    frames = []
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", args=[
            "--use-gl=angle", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader",
            "--autoplay-policy=no-user-gesture-required"])
        ctx = await b.new_context(
            viewport={"width": LARG, "height": ALT}, device_scale_factor=1,
            is_mobile=TOCCO, has_touch=TOCCO, reduced_motion="no-preference",
            user_agent=("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
                        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 "
                        "Mobile/15E148 Safari/604.1") if TOCCO else None)
        pg = await ctx.new_page()
        await pg.goto(URL, wait_until="commit")
        if PRIMA:
            await pg.wait_for_timeout(int(PRIMA * 1000))
        for _ in range(int(ATTESA * FPS)):
            frames.append(await pg.screenshot(type="jpeg", quality=82))
            await pg.wait_for_timeout(int(1000 / FPS))

        alto = await pg.evaluate("() => document.documentElement.scrollHeight")
        # Eventi rotella VERI, non window.scrollTo.
        # Misurato: con scrollTo il sito di riferimento restava fermo per il
        # 75% dei fotogrammi, perche' il suo scroll morbido intercetta la
        # rotella e ignora lo spostamento programmato. Un filmato cosi' lo
        # farebbe sembrare rotto, e il confronto non varrebbe niente.
        passo = 150
        await pg.mouse.move(LARG // 2, ALT // 2)
        fatti = 0
        while fatti < alto * 2:
            await pg.mouse.wheel(0, passo)
            fatti += passo
            await pg.wait_for_timeout(40)
            frames.append(await pg.screenshot(type="jpeg", quality=82))
            if fatti % (passo * 6) == 0:
                # ci si ferma quando la pagina non scende piu'
                if await pg.evaluate("() => scrollY + innerHeight >= "
                                     "document.documentElement.scrollHeight - 6"):
                    break
        for _ in range(6):
            frames.append(await pg.screenshot(type="jpeg", quality=82))
            await pg.wait_for_timeout(80)
        print(f"    altezza {alto}px")
        await ctx.close(); await b.close()

    piccoli = [np.asarray(Image.open(io.BytesIO(f)).convert("L").resize((72, 128)), dtype=float)
               for f in frames]
    diff = [float(np.abs(a - b).mean()) for a, b in zip(piccoli, piccoli[1:])]
    dupli = sum(1 for d in diff if d < 1.0)
    run = mx = 0
    for d in diff:
        run = run + 1 if d < 1.0 else 0
        mx = max(mx, run)
    print(f"    {len(frames)} fotogrammi · {dupli} identici · fermo piu' lungo {mx/FPS:.1f}s")

    tmp = os.path.join(QUI, "video", "_s_" + NOME)
    shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp, exist_ok=True)
    for i, f in enumerate(frames):
        open(os.path.join(tmp, f"f{i:05d}.jpg"), "wb").write(f)
    out = os.path.join(QUI, "video", NOME + ".mp4")
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                    "-framerate", str(FPS), "-i", os.path.join(tmp, "f%05d.jpg"),
                    "-c:v", "libx264", "-crf", "30", "-preset", "slow",
                    "-pix_fmt", "yuv420p", out], check=True)
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"    {NOME}.mp4  {os.path.getsize(out)/1048576:.1f} MB  ({len(frames)/FPS:.0f}s)")

asyncio.run(main())
