"""Registra uno o due siti, li porta a un Gem di Gemini e riporta il giudizio.

Nasce dal lavoro sulla masseria, dove il ciclo "cambio / registro / faccio
valutare / correggo" e' stato ripetuto sei volte a mano. Qui e' un comando.

La lezione che vale piu' del codice: per tre valutazioni di fila il giudizio e'
stato piu' basso del dovuto perche' il filmato mostrava SOLO lo scroll. Le cose
che si aprono con un clic — un calendario, un pannello di dettaglio — non si
vedevano, e chi giudica non puo' premiare quello che non vede. Appena il video
ha mostrato anche quelle, la valutazione e' salita di quattromila euro senza
toccare una riga del sito. Per questo `--interazioni` esiste ed e' acceso di
serie: il materiale con cui mostri il lavoro fa parte del lavoro.

PRIMA VOLTA
    python gemini.py --login          (serve la sessione salvata del browser)

USO
    python confronta.py http://localhost:8891/
    python confronta.py http://localhost:8891/ --contro https://esempio.com/
    python confronta.py http://localhost:8891/ --gem hce --domanda domande.txt
    python confronta.py --solo-video http://localhost:8891/     (registra e basta)

COSA FA
    1. registra il sito con Playwright: apertura intera, poi scroll a passi
       regolari; se richiesto apre anche un pannello e un calendario
    2. comprime il filmato sotto la soglia di caricamento di Gemini
    3. lo carica nel Gem scelto e fa la domanda
    4. stampa la risposta e la salva accanto al video
"""
import argparse, os, re, shutil, subprocess, sys, time
from datetime import datetime

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit("Manca Playwright:  pip install playwright  &&  python -m playwright install chromium")

PROFILO = os.path.join(os.path.expanduser("~"), ".gemini-cli-profile")
QUI = os.path.dirname(os.path.abspath(__file__))
sys.stdout.reconfigure(encoding="utf-8")

# I Gem usati piu' spesso. Il numero e' l'identificativo nell'indirizzo.
GEM = {
    "hce": "43ecc80fda84",
}

CAMPO = 'rich-textarea .ql-editor'
INVIA = 'button[aria-label*="Invia"], button[aria-label*="Send"]'
STOP = '[aria-label*="Interrompi"], [aria-label*="Stop"]'
ALLEGA = 'button[aria-label*="Caricamento e strumenti"], button[aria-label*="Open upload"]'

DOMANDA = """Questa e' la registrazione di un sito. Stessa finestra, nessun taglio, scroll a passi regolari.
Voglio un parere severo, non incoraggiante. 1) La sequenza dall'apertura alla fine dello scroll: dove
perde ritmo, dove un momento arriva troppo presto o troppo tardi, dove manca un passaggio. 2) Composizione,
griglia, tipografia, gerarchia: cosa non regge. 3) Ripetizioni di immagine o cali di qualita' visiva, col
secondo esatto. 4) A quanto lo valuteresti se un cliente lo commissionasse oggi a uno studio, in euro, e
cosa manca precisamente per salire di fascia. Elenca solo interventi di design e interazione realizzabili
senza risorse del cliente. Rispondi in italiano, concreto, con riferimenti ai secondi."""

CONFRONTO = """Due registrazioni di schermo di due siti: sito_A.mp4 e sito_B.mp4. Stessa finestra, stesso
modo di riprendere, nessun taglio. Non ti dico chi li ha fatti ne' quale preferisco: voglio un parere
indipendente e severo. IMPORTANTE: identifica ciascun sito col NOME DEL FILE e col marchio che leggi a
schermo, cosi' non ci sono scambi di etichetta. 1) Quale dei due e' il lavoro migliore, motivando su
sequenza di apertura, ritmo dello scroll, composizione e griglia, tipografia e gerarchia, qualita' e
coerenza delle immagini, movimento e micro-interazioni, chiarezza commerciale e percorso verso l'acquisto.
2) Per ciascuno, a quanto lo valuteresti se commissionato oggi a uno studio, in euro, e cosa giustifica la
differenza. 3) Cosa fa il migliore che l'altro non fa, e viceversa. 4) Ripetizioni di immagine o cali di
ritmo, col secondo esatto. Rispondi in italiano e sii concreto."""


# ---------------------------------------------------------------- registrazione
def registra(pg, url, attesa_apertura, interazioni):
    pg.goto(url, wait_until="load")
    pg.wait_for_timeout(int(attesa_apertura * 1000))

    if interazioni:
        # Le interazioni vanno mostrate PRIMA dello scroll: un giudice che non
        # le vede giudica un sito monco, ed e' esattamente cosi' che si perdono
        # punti senza colpa del sito.
        for sel in ('#cDa', '[data-apre-calendario]', '.maschera button[type=submit]'):
            try:
                if pg.query_selector(sel):
                    pg.click(sel, timeout=2500)
                    pg.wait_for_timeout(1600)
                    scelte = pg.eval_on_selector_all(
                        '.calendario button.g:not([disabled])', 'e => e.map(x => x.dataset.d)')
                    if len(scelte) > 9:
                        pg.click(f'.calendario button.g[data-d="{scelte[4]}"]')
                        pg.wait_for_timeout(800)
                        pg.click(f'.calendario button.g[data-d="{scelte[8]}"]')
                        pg.wait_for_timeout(1700)
                    break
            except Exception:
                pass

    alto = pg.evaluate("() => document.documentElement.scrollHeight")
    print(f"    altezza pagina {alto}px")

    # meta' pagina a passi regolari, come una rotella vera
    meta = alto // 2
    for i in range(61):
        pg.evaluate(f"window.scrollTo({{top:{round(meta * i / 60)}, behavior:'instant'}})")
        pg.wait_for_timeout(175)

    if interazioni:
        # si apre la prima scheda di dettaglio che si trova a schermo
        aperta = pg.evaluate("""() => {
            const c = [...document.querySelectorAll('[data-scheda], [data-dettaglio]')]
              .find(e => { const r = e.getBoundingClientRect();
                           return r.top > 0 && r.bottom < innerHeight; });
            if (!c) return false; c.click(); return true; }""")
        if aperta:
            pg.wait_for_timeout(2600)
            for _ in range(12):
                pg.evaluate("""() => { const p = document.querySelector('.scheda, [role=dialog]');
                                       if (p) p.scrollBy(0, 60); }""")
                pg.wait_for_timeout(170)
            pg.wait_for_timeout(800)
            pg.keyboard.press("Escape")
            pg.wait_for_timeout(1400)

    da = pg.evaluate("() => Math.round(scrollY)")
    for i in range(101):
        pg.evaluate(f"window.scrollTo({{top:{da + round((alto - da) * i / 100)}, behavior:'instant'}})")
        pg.wait_for_timeout(180)
    pg.wait_for_timeout(1500)


def gira(url, nome, cartella, attesa, interazioni, larghezza, altezza):
    grezza = os.path.join(cartella, "_" + nome)
    if os.path.exists(grezza):
        shutil.rmtree(grezza)
    os.makedirs(grezza, exist_ok=True)
    print(f"  registro {nome} da {url}")
    with sync_playwright() as p:
        b = p.chromium.launch(args=[
            "--use-gl=angle", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader",
            "--autoplay-policy=no-user-gesture-required"])
        ctx = b.new_context(viewport={"width": larghezza, "height": altezza},
                            reduced_motion="no-preference",
                            record_video_dir=grezza,
                            record_video_size={"width": larghezza, "height": altezza})
        pg = ctx.new_page()
        errori = []
        pg.on("pageerror", lambda e: errori.append(str(e)))
        try:
            registra(pg, url, attesa, interazioni)
        finally:
            ctx.close()
            b.close()
    if errori:
        print(f"    attenzione, {len(errori)} errori in pagina:", errori[0][:90])

    src = os.path.join(grezza, [f for f in os.listdir(grezza) if f.endswith(".webm")][0])
    out = os.path.join(cartella, nome + ".mp4")
    # 960px e 20 fotogrammi: sotto i 5 MB, che e' il limite pratico del
    # caricamento, e abbastanza nitido perche' si legga la tipografia
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", src,
                    "-an", "-c:v", "libx264", "-crf", "34", "-preset", "slow",
                    "-vf", "scale=960:-2,fps=20", "-pix_fmt", "yuv420p", out], check=True)
    shutil.rmtree(grezza, ignore_errors=True)
    print(f"    {nome}.mp4  {os.path.getsize(out) / 1048576:.1f} MB")
    return out


# ---------------------------------------------------------------------- giudizio
def chiedi(video, domanda, gem, vedi, attesa_risposta):
    if not os.path.isdir(PROFILO):
        sys.exit("Nessuna sessione salvata. Esegui prima:  python gemini.py --login")
    indirizzo = (f"https://gemini.google.com/u/1/gem/{GEM.get(gem, gem)}"
                 if gem else "https://gemini.google.com/u/1/app")

    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=PROFILO, headless=not vedi,
            viewport={"width": 1440, "height": 900}, accept_downloads=True,
            args=["--disable-blink-features=AutomationControlled"])
        pg = ctx.pages[0] if ctx.pages else ctx.new_page()
        pg.goto(indirizzo, wait_until="domcontentloaded")
        pg.wait_for_selector(CAMPO, timeout=45000, state="visible")
        pg.wait_for_timeout(2500)

        # il campo per i file compare solo dopo aver aperto il menu degli allegati
        pg.click(ALLEGA)
        pg.wait_for_timeout(1800)
        pg.set_input_files('input[type=file]', video)
        # i filmati vanno caricati e trascritti prima di poter chiedere
        pg.wait_for_timeout(2000 + 3000 * len(video))

        pg.click(CAMPO)
        # NIENTE a capo nel testo: sull'editor di Gemini mandano il messaggio
        # a meta', e la risposta arriva su un prompt monco
        pg.keyboard.insert_text(" ".join(domanda.split()))
        pg.wait_for_timeout(700)
        pg.click(INVIA)

        # si aspetta che smetta di scrivere, non un tempo fisso
        t0 = time.time()
        try:
            pg.wait_for_selector(STOP, timeout=25000)
        except Exception:
            pass
        while time.time() - t0 < attesa_risposta and pg.query_selector(STOP):
            pg.wait_for_timeout(1200)
        pg.wait_for_timeout(2500)

        risposta = pg.evaluate("""() => {
            const r = [...document.querySelectorAll('model-response')];
            return r.length ? r[r.length - 1].innerText : ''; }""")
        pagina = pg.url
        ctx.close()
    return risposta, pagina


def main():
    a = argparse.ArgumentParser(description="Registra un sito e lo fa giudicare da un Gem di Gemini")
    a.add_argument("url", help="indirizzo del sito da registrare")
    a.add_argument("--contro", help="secondo sito, per il confronto alla cieca")
    a.add_argument("--gem", default="hce", help="scorciatoia o identificativo del Gem (vuoto = Gemini normale)")
    a.add_argument("--domanda", help="file di testo con la domanda da porre")
    a.add_argument("--out", default=os.path.join(QUI, "giudizi"), help="dove finiscono video e risposta")
    a.add_argument("--attesa", type=float, default=9, help="secondi di apertura da riprendere")
    a.add_argument("--attesa-risposta", type=int, default=300, help="secondi massimi per la risposta")
    a.add_argument("--larghezza", type=int, default=1440)
    a.add_argument("--altezza", type=int, default=810)
    a.add_argument("--niente-interazioni", action="store_true",
                   help="registra il solo scroll (sconsigliato: il giudizio ne risente)")
    a.add_argument("--solo-video", action="store_true", help="registra e basta, non chiede niente")
    a.add_argument("--vedi", action="store_true", help="mostra la finestra di Gemini")
    o = a.parse_args()

    os.makedirs(o.out, exist_ok=True)
    interazioni = not o.niente_interazioni

    if o.contro:
        # nomi neutri: il confronto e' alla cieca, e i nomi dei file la
        # rovinerebbero prima ancora di cominciare
        video = [gira(o.contro, "sito_A", o.out, o.attesa, interazioni, o.larghezza, o.altezza),
                 gira(o.url, "sito_B", o.out, o.attesa, interazioni, o.larghezza, o.altezza)]
        domanda = CONFRONTO
    else:
        video = [gira(o.url, "sito", o.out, o.attesa, interazioni, o.larghezza, o.altezza)]
        domanda = DOMANDA

    if o.domanda:
        domanda = open(o.domanda, encoding="utf-8").read()
    if o.solo_video:
        print("\nsolo video, come richiesto.")
        return

    print(f"\n  chiedo a {o.gem or 'Gemini'}...")
    risposta, pagina = chiedi(video, domanda, o.gem, o.vedi, o.attesa_risposta)
    if not risposta.strip():
        sys.exit("Nessuna risposta letta. Riprova con --vedi per guardare cosa succede.")

    quando = datetime.now().strftime("%Y%m%d-%H%M")
    dove = os.path.join(o.out, f"giudizio-{quando}.md")
    with open(dove, "w", encoding="utf-8") as f:
        f.write(f"# Giudizio {quando}\n\nSito: {o.url}\n")
        if o.contro:
            f.write(f"Confronto con: {o.contro}  (sito_A = confronto, sito_B = {o.url})\n")
        f.write(f"Gem: {o.gem or 'Gemini'}\nConversazione: {pagina}\n\n---\n\n{risposta}\n")

    print("\n" + "=" * 72)
    print(risposta)
    print("=" * 72)
    print(f"\nsalvato in {dove}")
    # le cifre saltano all'occhio: e' la prima cosa che si cerca
    cifre = re.findall(r"\d{1,3}(?:[.\s]\d{3})+\s*(?:€|euro)", risposta)
    if cifre:
        print("cifre citate:", ", ".join(dict.fromkeys(cifre)))


if __name__ == "__main__":
    main()
