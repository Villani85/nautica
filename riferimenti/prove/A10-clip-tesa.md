# A10 — Validazione visiva della clip tesa candidato 02: il referto mancante

Agente A10, incarico D3. File scritto: solo questo. Inizio `2026-08-31T17:05:28+02:00`,
fine vedi ultima riga. Tutti i comandi sono stati eseguiti e i numeri sotto sono stati
letti dall'output reale (non copiati dal committente), da
`C:\Users\Giuseppe\Webingegno\nautica`.

## 0 · Perché questo referto esiste

I numeri della clip di apertura (movimento stanza 0,457 / 0,076 / 0,33% carrellata)
vivono in `riferimenti/Piano.md` (righe 59, 183-186, 397-398, 416) ma non c'era un
referto in `riferimenti/prove/` che li rendesse riproducibili — nessun percorso di
file, nessun hash, nessuna ROI in coordinate, nessuno script. Questo documento
colma quel buco per la misura di movimento (non per la carrellata/deriva, non
misurate qui: fuori perimetro di questo incarico).

## 1 · Comando e script, RIESEGUITI

Ritaglio ROI, riduzione a 12 fps e 160×120, scala di grigi, via ffmpeg:

```
ffmpeg -v error -i FILE -vf "crop=in_w*0.42:in_h*0.75:in_w*0.55:in_h*0.2,fps=12,scale=160:120" -f rawvideo -pix_fmt gray -
```

Metrica: media di `|frame[n] - frame[n-1]|` su tutti i pixel della ROI, poi mediata
su tutte le coppie di fotogrammi consecutivi. Script Python usato (letto lo stdout
grezzo di ffmpeg via `subprocess`, nessun file intermedio):

```python
#!/usr/bin/env python3
"""
Misura il movimento medio della ROI "persone" di una clip:
- ritaglia la regione crop=in_w*0.42:in_h*0.75:in_w*0.55:in_h*0.2
- porta a 12 fps, scala 160x120, scala di grigi
- calcola |frame[n] - frame[n-1]| media su tutti i pixel, mediata su tutti i fotogrammi consecutivi
Uso: python misura_movimento.py <file.mp4>
"""
import subprocess
import sys
import numpy as np

W, H = 160, 120
FRAME_BYTES = W * H  # 8-bit gray, 1 byte/pixel

def main():
    path = sys.argv[1]
    cmd = [
        "ffmpeg", "-v", "error", "-i", path,
        "-vf", "crop=in_w*0.42:in_h*0.75:in_w*0.55:in_h*0.2,fps=12,scale=160:120",
        "-f", "rawvideo", "-pix_fmt", "gray", "-",
    ]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if proc.returncode != 0:
        print("ERRORE ffmpeg:", proc.stderr.decode(errors="replace"), file=sys.stderr)
        sys.exit(1)
    raw = proc.stdout
    n_frames = len(raw) // FRAME_BYTES
    resto = len(raw) % FRAME_BYTES
    if n_frames < 2:
        print(f"{path}: solo {n_frames} fotogrammi, impossibile calcolare la differenza")
        sys.exit(1)
    arr = np.frombuffer(raw[: n_frames * FRAME_BYTES], dtype=np.uint8)
    frames = arr.reshape(n_frames, H, W).astype(np.int16)
    diffs = np.abs(frames[1:] - frames[:-1])  # (n_frames-1, H, W)
    per_frame_mean = diffs.mean(axis=(1, 2))  # media sui pixel, per ogni coppia di fotogrammi
    movimento = per_frame_mean.mean()  # media sui fotogrammi
    print(f"file: {path}")
    print(f"fotogrammi ROI estratti: {n_frames} (bytes residui non allineati: {resto})")
    print(f"movimento (media |diff| su 0-255): {movimento:.4f}  (= {movimento/255:.4f} normalizzato 0-1)")

if __name__ == "__main__":
    main()
```

Ambiente verificato prima dell'esecuzione: `ffmpeg 8.1.2-full_build` (gyan.dev),
`ffprobe 8.1.2`, Python 3.12.10, numpy 2.5.0 — tutti già presenti sul PC, nessuna
installazione fatta da questo agente.

## 2 · I quattro filmati, uno per uno

Hash con `certutil -hashfile FILE SHA256` (verificato: 64 caratteri esadecimali per
ciascuno, nessun troncamento da pipe). Peso, durata, fotogrammi e cadenza con
`ffprobe -select_streams v:0 -show_entries stream=... `.

### 2.1 · `public/filmati/salone-teso.mp4` — la clip ATTUALMENTE in produzione

- SHA-256: `bf17052bd4dcb8da916655230e5190b7bad08b769dac27beb7df00dac41cd95f`
- peso: 663 589 byte
- codec: h264, 1280×720
- durata: 4,125 s · fotogrammi: 99 · cadenza: 24/1 fps
- fotogrammi ROI estratti a 12 fps: 50
- **movimento: 0,6765** (su scala 0-255) = 0,0027 normalizzato 0-1

### 2.2 · `materiali/clip/salone-teso-candidato02.mp4` — il candidato grezzo

- SHA-256: `a99de82fbefa39719e7809b42bd9e25e82080404367f5fad4bb8cbd01f3758dc`
- peso: 652 004 byte
- codec: h264, 1280×720
- durata: 5,000 s · fotogrammi: 120 · cadenza: 24/1 fps
- fotogrammi ROI estratti a 12 fps: 60
- **movimento: 0,5799** (su scala 0-255) = 0,0023 normalizzato 0-1

### 2.3 · `materiali/clip/candidato02-ciclabile.mp4` — la versione resa ciclabile

- SHA-256: `2ce63b3d0f35595d81755a6fedc707830d51e64382ca45e2c9e96d04f942bca0`
- peso: 300 942 byte
- codec: h264, 1280×720
- durata: 3,708 s · fotogrammi: 89 · cadenza: 24/1 fps
- fotogrammi ROI estratti a 12 fps: 45
- **movimento: 0,6330** (su scala 0-255) = 0,0025 normalizzato 0-1

### 2.4 · `uscite/salone-teso-PRECEDENTE.mp4` — la clip precedente

- SHA-256: `57b77fe7f7d291edb7020c36f95995ad8f489de6d94bb7220074fd2816fe83f7`
- peso: 571 155 byte
- codec: h264, 1280×720
- durata: 4,292 s · fotogrammi: 103 · cadenza: 24/1 fps
- fotogrammi ROI estratti a 12 fps: 52
- **movimento: 0,0713** (su scala 0-255) = 0,0003 normalizzato 0-1

## 3 · Confronto con i numeri dati — CONFERMATO, con UNA smentita esplicita

| filmato | numero dato | numero riprodotto | esito |
|---|---|---|---|
| clip precedente | 0,071 | **0,0713** | **CONFERMATO** (scarto 0,0003) |
| candidato 02 grezzo | 0,580 | **0,5799** | **CONFERMATO** (scarto 0,0001) |
| candidato 02 ciclabile | 0,676 | **0,6330** (file `materiali/clip/candidato02-ciclabile.mp4`) | **NON CONFERMATO su quel file** — scarto 0,043 (6,8%) |

Il numero 0,676 dato per "candidato 02 ciclabile" **non corrisponde** al file
`materiali/clip/candidato02-ciclabile.mp4` (che misura 0,6330), ma corrisponde
**quasi esattamente** al file `public/filmati/salone-teso.mp4` — la clip
attualmente in produzione — che misura **0,6765** (scarto 0,0005 dal numero
dato). I timestamp di modifica lo confermano come possibile: `candidato02-ciclabile.mp4`
è delle 16:49, `salone-teso.mp4` (produzione) è delle 16:51, due minuti dopo —
compatibile con una riesportazione successiva finita in produzione ma non
ricopiata (o sovrascritta) in `materiali/clip/`.

**Conclusione esplicita, come richiesto**: dove il mio numero differisce da quello
dato, il mio vince. Per il file `materiali/clip/candidato02-ciclabile.mp4` il
numero misurato e valido è **0,6330**, non 0,676. Il valore 0,676 resta corretto,
ma descrive `public/filmati/salone-teso.mp4` (produzione), non il file nei
materiali. Chi deve decidere sul candidato 02 ciclabile dovrebbe sapere che i due
file — quello nei materiali e quello in produzione — **non sono lo stesso file**
(hash diversi, durate diverse: 3,708 s contro 4,125 s, 89 contro 99 fotogrammi) e
misurano un movimento diverso.

## 4 · La regione di interesse, in coordinate esatte

Su un fotogramma 1280×720 (risoluzione di tutti e quattro i file), il filtro
`crop=in_w*0.42:in_h*0.75:in_w*0.55:in_h*0.2` ritaglia:

- larghezza: 1280×0,42 = 537,6 px (≈538 px)
- altezza: 720×0,75 = 540 px
- origine x: 1280×0,55 = 704 px
- origine y: 720×0,2 = 144 px

Quindi la ROI copre il rettangolo **x: [704, 1242] px, y: [144, 684] px** — cioè
dal 55% al 97% della larghezza del fotogramma, dal 20% al 95% della sua altezza
(angolo in basso a destra dell'inquadratura). Dopo il ritaglio la ROI viene
ricampionata a 12 fps e scalata a 160×120 prima del calcolo: la misura di
movimento gira quindi su una griglia di 19 200 pixel per fotogramma, non sulla
risoluzione nativa.

## 5 · Cosa cade DAVVERO dentro il ritaglio — verificato guardando un fotogramma estratto

Comando usato per estrarre il fotogramma n=20 (indice fotogramma, non tempo) sia
in ROI che a quadro intero, per ciascuno dei quattro file:

```
ffmpeg -i FILE -vf "crop=in_w*0.42:in_h*0.75:in_w*0.55:in_h*0.2,select=eq(n\,20)" -frames:v 1 roi.png
ffmpeg -i FILE -vf "select=eq(n\,20)" -frames:v 1 full.png
```

Guardando gli otto PNG risultanti (quattro ROI + quattro quadri interi, salvati
in scratchpad e non nel repo): l'inquadratura è **identica nei quattro file**
(stesso salone, stessa coppia, stessa posa — cambia solo l'istante/il rendering).
Descrizione a parole di cosa contiene la ROI:

- **le due persone** (uomo a sinistra in camicia scura, donna a destra in camicia
  chiara), sedute su un divano beige, occupano la fascia centrale — circa dal 15%
  al 100% della larghezza della ROI e dal 25% all'85% della sua altezza. Sono la
  parte dominante del ritaglio, ma **non tutto il ritaglio**.
- **striscia di legno scuro** (bordo/parete boiserie) lungo il margine sinistro
  della ROI, circa il 10-15% della larghezza — non è persona, è arredo/parete.
- **sfondo con lampada, mobile a specchio/vetrina illuminata e uno scorcio di
  schermo blu (TV/monitor)** nella fascia alta della ROI, sopra le teste delle
  persone, circa il 25-30% superiore dell'altezza — non è persona, è stanza.
- **angolo di un tavolino in legno** nell'angolo in basso a destra della ROI,
  circa il 20-25% dell'area in basso a destra — non è persona, è arredo.
- **striscia di tappeto/pavimento chiaro** sotto il divano, ultimo 10-15%
  dell'altezza della ROI — non è persona, è pavimento.

**Giudizio onesto**: la ROI è a maggioranza persone (corpo, viso, vestiti,
braccia) ma contiene stabilmente anche parete, lampada, vetrina, tavolino e
pavimento — porzioni della STANZA che possono muoversi o restare ferme
indipendentemente dalle persone (es. un riflesso nella vetrina, un flicker della
lampada) e che quindi contaminano la misura. Non è "il quadro intero" (il cielo,
il mare fuori dal vetro e il resto della cabina sono esclusi) ma non è nemmeno
"solo le persone": è **persone + una cornice di stanza attorno a loro**, a
occhio circa 55-65% persone e 35-45% stanza/arredo per superficie di pixel — stima
qualitativa da un fotogramma, non una segmentazione misurata pixel per pixel.

## 6 · Limiti dichiarati esplicitamente

- **La ROI è stata scelta a occhio** guardando uno screenshot (probabilmente lo
  stesso schema usato per la misura originale in `Piano.md`, dato che i numeri
  precedente/grezzo tornano quasi esatti). Non c'è garanzia che contenga solo le
  persone — la §5 sopra lo dimostra: contiene anche legno, lampada, vetrina,
  tavolino e pavimento.
- **La metrica non distingue la fonte del movimento**: un respiro, un gesto
  della mano, un riflesso nella vetrina alle spalle o un cambio di illuminazione
  generale contano tutti allo stesso modo nella media dei pixel.
- **fps=12 e scala 160×120 sono una sottocampionatura pesante** (da 1280×720@24fps
  a 160×120@12fps): micro-movimenti veloci o piccoli possono sparire; non è
  stata verificata la sensibilità della metrica a questi due parametri (nessun
  confronto con altre cadenze/risoluzioni fatto qui).
- **fotogramma n=20 è un solo campione**: la descrizione della §5 vale per quel
  fotogramma nei quattro file; non è stato verificato che l'inquadratura resti
  identica per tutta la durata dei clip (in particolare `candidato02-ciclabile.mp4`
  e `salone-teso.mp4` hanno durate diverse, quindi contenuto diverso oltre il
  fotogramma comune).
- **Il file `uscite/salone-teso-PRECEDENTE.mp4` esisteva** (il caso "se esiste"
  del compito) ed è stato incluso.
- Non ho misurato qui la carrellata (0,33%) né la deriva (1,2 px) citate in
  `Piano.md` righe 183-186: fuori dal perimetro "movimento" di questo referto.
- Il giudizio di credibilità della clip resta del committente (`Piano.md`
  riga 74): questo referto rende i numeri riproducibili, non sostituisce
  quel giudizio.

Fine: `2026-08-31T17:09:30+02:00` circa (entro il limite di 15 minuti).
