# D2 — Passo 1: rendere ciclabili due ambienti audio (misurato)

Inizio: 2026-08-31T17:16:44+02:00
Fine: vedi ultima riga del referto.

## Cosa c'era

`consegne/audio/manifest.md` (agente A11) dichiara quattro MP3 candidati a loop ambientale, con
quattro WAV master in `uscite/audio/` (non versionati, letti solo in lettura per questo passo).
Il manifest dichiara che nessuno dei quattro e' seamless: il peggiore, `salone-roomtone-loop_v1`,
salta il 27% del picco sul canale destro alla giunzione fine→inizio.

## Metodo di misura (prima e dopo)

Campioni PCM grezzi estratti con ffmpeg (`-f s16le -ar 48000 -ac 2`), poi confrontati gli ultimi
480 campioni (~10 ms a 48 kHz) con i primi 480. Due metriche per canale:

- **SALTO**: `|ultimo campione − primo campione|` in rapporto al picco assoluto del file (per
  canale) — e' la discontinuita' puntuale che si sentirebbe come click al giro del loop.
- **MAD** (mean absolute difference): differenza media assoluta fra i 10 ms di coda e i 10 ms di
  testa, in rapporto al picco — quanto sono "diversi" nel complesso i due bordi (piu' grossolana
  del salto puntuale, ma utile per capire se il contenuto dei due bordi e' compatibile).

In piu', RMS di testa/centro/coda (finestre da 10 ms) per verificare il livello medio e non solo
la discontinuita' istantanea.

```python
#!/usr/bin/env python3
"""Misura la continuita' del giro (fine->inizio) di un file audio.
Estrae i campioni PCM grezzi via ffmpeg (s16le, 48kHz, stereo) e confronta
gli ultimi N campioni con i primi N (N ~ 10 ms = 480 campioni a 48 kHz).
"""
import subprocess
import sys
import numpy as np

FFMPEG = "ffmpeg"

def load_pcm_stereo(path, sr=48000):
    cmd = [FFMPEG, "-v", "error", "-i", path, "-f", "s16le",
           "-acodec", "pcm_s16le", "-ar", str(sr), "-ac", "2", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    data = np.frombuffer(raw, dtype="<i2").astype(np.float64)
    data = data.reshape(-1, 2)  # (n_samples, 2 ch)
    return data

def measure(path, n=480, sr=48000):
    d = load_pcm_stereo(path, sr)
    nsamp = d.shape[0]
    peak = np.abs(d).max(axis=0)  # per canale, picco assoluto sull'intero file
    peak[peak == 0] = 1.0

    head = d[:n]
    tail = d[-n:]

    # SALTO: |ultimo campione - primo campione| in rapporto al picco assoluto, per canale
    jump = np.abs(d[-1] - d[0])
    jump_pct = 100.0 * jump / peak

    # differenza media assoluta fra la coda e la testa sui 10 ms (per canale)
    mad = np.abs(tail - head).mean(axis=0)
    mad_pct = 100.0 * mad / peak

    # RMS di testa/coda (10 ms) e del centro del file, per canale
    def rms(x):
        return np.sqrt((x.astype(np.float64) ** 2).mean(axis=0))
    rms_head = rms(head)
    center = d[nsamp // 2 - n // 2: nsamp // 2 + n // 2]
    rms_center = rms(center)
    rms_tail = rms(tail)

    return {
        "n_samples": nsamp, "peak": peak, "jump_pct": jump_pct, "mad_pct": mad_pct,
        "rms_head": rms_head, "rms_center": rms_center, "rms_tail": rms_tail,
    }

if __name__ == "__main__":
    for path in sys.argv[1:]:
        m = measure(path)
        print(f"\n=== {path} ===")
        print(f"campioni: {m['n_samples']}  picco per canale (L,R): {m['peak']}")
        print(f"SALTO fine->inizio (%% picco) per canale: L={m['jump_pct'][0]:.3f}%  R={m['jump_pct'][1]:.3f}%")
        print(f"MAD coda-testa 10ms (%% picco) per canale: L={m['mad_pct'][0]:.3f}%  R={m['mad_pct'][1]:.3f}%")
        print(f"RMS testa 10ms:   L={m['rms_head'][0]:.1f}  R={m['rms_head'][1]:.1f}")
        print(f"RMS centro 10ms:  L={m['rms_center'][0]:.1f}  R={m['rms_center'][1]:.1f}")
        print(f"RMS coda 10ms:    L={m['rms_tail'][0]:.1f}  R={m['rms_tail'][1]:.1f}")
```

Nota: la misura e' stata fatta direttamente sugli MP3 in `consegne/audio/` (non sui WAV master),
sia PRIMA che DOPO l'incrocio, con lo stesso script — cosi' il confronto e' omogeneo e riflette il
file che verra' davvero usato. I numeri differiscono leggermente da quelli del manifest A11 (che
misurava sui WAV a 24 bit): normale, la lossy compression MP3 altera leggermente i campioni agli
estremi. L'ordine di grandezza e il file peggiore restano confermati (v. sotto).

## Misura PRIMA (tutti e quattro, sui MP3 di `consegne/audio/`)

| File | Salto L | Salto R | MAD L | MAD R | RMS testa (L,R) | RMS centro (L,R) | RMS coda (L,R) |
|---|---|---|---|---|---|---|---|
| scafo-onde-loop_v1 | 6,397% | 2,388% | 5,483% | 6,203% | 302, 290 | 1106, 1085 | 96, 149 |
| scafo-onde-loop_v2 | 3,823% | 2,592% | 8,949% | 8,962% | 597, 598 | 614, 608 | 50, 48 |
| salone-roomtone-loop_v1 | 3,226% | **27,240%** | 23,072% | 24,102% | 53, 51 | 74, 72 | 43, 58 |
| salone-roomtone-loop_v2 | 9,438% | 19,778% | 6,881% | 21,109% | 116, 128 | 123, 164 | 137, 233 |

Confermato indipendentemente il dato del compito: `salone-roomtone-loop_v1` e' il peggiore, con un
salto del 27,240% del picco sul canale destro.

## Scelta dei due candidati (misurata, non presunta)

**Coppia scafo**: v1 ha il salto peggiore sul canale L (6,4% contro 3,8% di v2), ma la MAD
complessiva (quanto sono disomogenei i 10 ms di bordo) e' molto piu' bassa per v1 (5,5/6,2% contro
8,9/9,0% di v2) — v1 e' complessivamente piu' vicino alla continuita' su entrambe le metriche
combinate, e coerente con la raccomandazione del manifest A11. **Scelto: v1.**

**Coppia salone**: v1 ha il salto peggiore in assoluto delle otto misure (27,2% su R); v2, pur non
essendo pulito (salto 9,4%/19,8%), ha un salto massimo molto piu' basso di v1 e nessun canale sopra
il 20%. **Scelto: v2** — evita il rischio di click piu' concreto (quello sul canale destro di v1).

Questi sono gli stessi due candidati indicati nell'incarico (`scafo-onde-loop_v1` e
`salone-roomtone-loop_v2`): la misura indipendente li conferma come i migliori dei quattro.

## La cura: incrocio in dissolvenza di 15 ms

Principio (lo stesso del commit "La clip candidata non e' loop-ready" per il video): si prende la
coda del file (ultimi 15 ms), la si dissolve sopra la testa (primi 15 ms), e si ricompone il file
come `[incrocio] + [corpo centrale]`. Il corpo centrale finisce esattamente dove iniziava
l'incrocio (stesso punto dell'originale, quindi gia' continuo), e l'incrocio sfuma dalla coda verso
la testa cosi' l'ultimo campione e il primo campione dell'originale — prima discontinui — restano
adiacenti mascherati dentro la dissolvenza anziche' tagliati di netto. Il file risultante e' piu'
corto dell'originale della durata dell'incrocio (15 ms).

Curva scelta: `qsin` (quarto di sinusoide, equal-power) invece della `tri` lineare di default, per
non far calare l'energia percepita a meta' dissolvenza quando si sommano due sorgenti di rumore
scorrelate. `amix` con `normalize=0` per non dimezzare il volume (il default di `amix` divide per
il numero di ingressi, che qui avrebbe dimezzato l'ampiezza in modo non voluto).

### Comando ffmpeg esatto (esempio per `scafo-onde-loop_v1.mp3`, 20,000 s → incrocio 0,015 s)

```
ffmpeg -y -v error -i consegne/audio/scafo-onde-loop_v1.mp3 -filter_complex \
"[0:a]atrim=0:0.015,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.015:curve=qsin[head]; \
 [0:a]atrim=19.985:20.000,asetpts=PTS-STARTPTS,afade=t=out:st=0:d=0.015:curve=qsin[tail]; \
 [tail][head]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[seam]; \
 [0:a]atrim=0.015:19.985,asetpts=PTS-STARTPTS[body]; \
 [seam][body]concat=n=2:v=0:a=1[out]" \
-map "[out]" -c:a libmp3lame -q:a 2 consegne/audio/scafo-onde-loop_v1-ciclabile.mp3
```

Stesso comando per `salone-roomtone-loop_v2.mp3` → `salone-roomtone-loop_v2-ciclabile.mp3`
(cambiano solo input e output; i tempi 0/0.015/19.985/20.000 restano identici perche' entrambi i
sorgenti durano 20,000 s esatti).

## Misura DOPO

| File | Salto L | Salto R | Durata | Nota |
|---|---|---|---|---|
| scafo-onde-loop_v1-ciclabile | **0,307%** (era 6,397%) | **0,304%** (era 2,388%) | 19,984989 s | salto quasi azzerato su entrambi i canali |
| salone-roomtone-loop_v2-ciclabile | **1,576%** (era 9,438%) | **2,232%** (era 19,778%) | 19,984989 s | salto ridotto di 6-9 volte |

Il salto puntuale (la metrica che predice il click) crolla su entrambi i file: da valori 2,4-27%
del picco a valori sotto il 2,3%.

Nota onesta sulla MAD: dopo l'incrocio la MAD (differenza media sui 10 ms) risulta piu' alta di
prima su `scafo` (8,9% contro 5,5-6,2%) e molto piu' alta su `salone` (39,6%/19,3% contro
6,9-23,1%). Questo NON e' un peggioramento del loop: la MAD confronta ora i 10 ms di coda del
*corpo* (audio originale non toccato, vicino al vecchio punto di taglio) con i 10 ms di *testa*
(che nell'incrocio e' gia' un miscuglio fra coda e testa originali, quindi contiene energia
proveniente da un punto diverso della registrazione). E' normale che due finestre di contenuto
diverso abbiano una MAD piu' alta pur essendo perfettamente continue campione-per-campione al
punto di giunzione: la metrica che conta per il click e' il SALTO puntuale, non la MAD sull'intera
finestra di 10 ms, e quello e' crollato.

## Verifica RMS (livello medio coda/centro rispetto al centro del file)

| File | RMS testa (L,R) | RMS centro (L,R) | RMS coda (L,R) | Regge? |
|---|---|---|---|---|
| scafo-onde-loop_v1-ciclabile | 264, 261 | 1214, 1192 | 222, 223 | **NO** — testa e coda restano a circa un quinto del centro |
| salone-roomtone-loop_v2-ciclabile | 231, 157 | 185, 187 | 285, 196 | **SI** — testa e coda sono vicine al centro, anzi leggermente piu' energiche |

`salone-roomtone-loop_v2-ciclabile`: l'RMS regge, nessun calo — la dissolvenza non ha portato le
estremita' verso il silenzio, e' un vero loop continuo, non una pausa mascherata.

`scafo-onde-loop_v1-ciclabile`: **difetto, dichiarato**. Il centro del file (~1200 RMS) e' molto
piu' energico dei bordi (~220-260 RMS), un fattore ~5. Questo pero' NON e' introdotto
dall'incrocio: e' lo stesso squilibrio gia' misurato dal manifest A11 sul WAV master originale
("RMS testa 302 vs RMS coda 96, coda circa la meta' dell'attacco" — la mia misura sul MP3 prima
dell'incrocio da' RMS testa 302/290 e RMS coda 96/149, coerente). La sorgente ElevenLabs, nonostante
l'istruzione "no fade-in, no fade-out" nel prompt, applica evidentemente un lieve inviluppo di
attacco/coda su questo file. L'incrocio in dissolvenza risolve la discontinuita' di CAMPIONE (salto
sceso da 6,4%/2,4% a 0,3%/0,3%), ma non puo' correggere un inviluppo di ampiezza gia' presente nella
registrazione: al giro del loop di `scafo-onde-loop_v1-ciclabile` non ci sara' piu' un click, ma
resta un lieve calo di energia percepibile nella zona di giunzione rispetto al resto del file. Se
serve eliminare anche questo, il passo successivo sarebbe correggere l'inviluppo con un piccolo
"gain compensation" sui bordi (fuori scope per questo passo 1).

## File prodotti (in `consegne/audio/`)

| File | SHA-256 |
|---|---|
| `scafo-onde-loop_v1-ciclabile.mp3` | `15f5cc7a9697b5ec9dc73f2ebe58e231faee6c2ad81956dad691a7f0c468315c` |
| `salone-roomtone-loop_v2-ciclabile.mp3` | `234b4ef793b7769921d9f03bb6aef2bc0ed9c9e61111884a41d2d2ffbe6dff91` |

`consegne/audio/manifest.md` aggiornato in coda (nessuna riga precedente rimossa) con questi due
file, i loro SHA-256 e come sono stati prodotti.

## Cosa NON e' stato fatto (fuori scope per il passo 1)

Nessun caricamento nel sito, nessun tocco a `src/ui/suono.js`, `public/`, `package.json` o
`riferimenti/Piano.md`. Nessun commit.

Fine: 2026-08-31T17:21:44+02:00 (durata reale: circa 5 minuti)
