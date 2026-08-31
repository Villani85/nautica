# Manifest audio — candidati ambienti loop (agente A11)

Generati con ElevenLabs `POST /v1/sound-generation` (mai `/v1/music`), tramite
`C:\Users\Giuseppe\.claude\skills\audio-elevenlabs\genera.py sfx ... --influenza 0.35`.
Nessuna voce, nessuna melodia, nessun crescendo, nessun riverbero cinematografico aggiunto.
Ogni MP3 originale e' conservato intatto; il WAV master e' stato prodotto con **un solo**
passaggio ffmpeg dall'MP3 originale (nessuna doppia ricodifica).

Contratto §16 rispettato: `prompt_influence = 0.35` per tutti e quattro i file (valore reale,
non un placeholder). Due candidati per sorgente, stesso prompt per i due di ciascuna coppia.
Non e' stato necessario un terzo candidato: entrambe le generazioni per sorgente sono riuscite
al primo colpo (durata esatta, nessun errore API).

**Credit ElevenLabs spesi: 4 chiamate a `/v1/sound-generation`, ciascuna da 20,0 s di sound-effect
(80,0 s generate in totale).** La dashboard non e' leggibile da questa chiave (scoped, niente
`user_read`), quindi il costo in caratteri/credit non e' verificabile via API — solo il numero
di chiamate e' certo.

---

## 1. `scafo-onde-loop`

**Prompt (identico per v1 e v2):**
> Seamless field-recording loop heard from inside the lower hull of a large luxury motor yacht
> underway in a rough grey sea. Deep water pressure, broad hull resonance, irregular wash and
> restrained structural creaks. Heavy and expensive construction, not a small wooden boat. Steady
> fixed listening position, seamless, no fade-in, no fade-out.

`prompt_influence: 0.35`

### scafo-onde-loop_v1

| Campo | MP3 originale | WAV master |
|---|---|---|
| File | `scafo-onde-loop_v1.mp3` | `scafo-onde-loop_v1.wav` |
| Durata (ffprobe) | 20.000000 s | 20.000000 s |
| Sample rate | 44100 Hz | **48000 Hz** |
| Canali | 2 (stereo, come restituito dall'API) | **1 (mono)** |
| Bit depth | mp3 (compresso) | **PCM 24-bit** (`pcm_s24le`) |
| Dimensione | 321.036 byte | 2.880.102 byte |
| SHA-256 | `a1985327b0f130917e5953183e4a2875272280c21776c24cffea54e9aee21cfd` | `54b6448353bb9b9a2cdb105c3de31c46018e2c91cfbe827345c90d248f24ef1e` |

**Giunzione loop (fine→inizio), misurata sui campioni WAV, non sperata:**
salto tra ultimo e primo campione = 51.454 (0,613% del fondo scala 24 bit; **4,4% del picco locale**
del file). Livello: RMS primi 50 ms = 102.300, RMS ultimi 50 ms = 44.552 (differenza 4,93% del
picco) — la coda e' piu' quieta dell'attacco di circa la meta' in RMS.

**Verdetto:** salto di campione contenuto (sotto il 5% del picco), ma la coda del loop e' sensibilmente
piu' quieta dell'inizio: al giro c'e' un lieve gradino di energia, non solo un click. Rischio di
click puntuale basso-moderato; rischio di "respiro" udibile al loop point moderato. Usabile con
un micro-crossfade di pochi millisecondi in fase di montaggio.

### scafo-onde-loop_v2

| Campo | MP3 originale | WAV master |
|---|---|---|
| File | `scafo-onde-loop_v2.mp3` | `scafo-onde-loop_v2.wav` |
| Durata (ffprobe) | 20.000000 s | 20.000000 s |
| Sample rate | 44100 Hz | **48000 Hz** |
| Canali | 2 (stereo, come restituito dall'API) | **1 (mono)** |
| Bit depth | mp3 (compresso) | **PCM 24-bit** (`pcm_s24le`) |
| Dimensione | 321.036 byte | 2.880.102 byte |
| SHA-256 | `e5a7bbb36e3c9aff8daa37870e45701bf304d8eb2e62ae6f9672f1bb82f58032` | `00ead8adc6655d582ae205f718a52858ae9d7baeda9a55ecb079d29343ab4f03` |

**Giunzione loop:** salto ultimo→primo campione = 37.314 (0,445% fondo scala; 3,2% del picco
locale — piu' piccolo di v1). Ma il livello e' molto piu' disomogeneo: RMS primi 50 ms = 197.231,
RMS ultimi 50 ms = 84.404 — l'inizio e' circa **2,3 volte piu' energico** della coda in RMS
(differenza 9,72% del picco assoluto).

**Verdetto:** il salto di campione puntuale e' piccolo, ma lo squilibrio di energia tra attacco e
coda e' quasi doppio rispetto a v1: al giro il loop "respira" in modo piu' percepibile (l'ascoltatore
sentirebbe l'onda ripartire piu' forte). **Su questo fronte v2 e' peggiore di v1.**

**Raccomandazione per scafo-onde-loop: v1** (differenza di energia ai bordi minore), a parita' di
salto di campione contenuto in entrambi.

---

## 2. `salone-roomtone-loop`

**Prompt scritto per questa sorgente (identico per v1 e v2):**
> Seamless field-recording loop of the inhabited quiet inside the main saloon of a large luxury
> motor yacht at anchor. Distant, steady air-conditioning hum, faint occasional settling creaks
> from wood joinery and fittings, soft ambient room tone, no voices, no music, no footsteps. Calm,
> expensive, still air. Fixed listening position, seamless, no fade-in, no fade-out.

`prompt_influence: 0.35`

Durata scelta: 20,0 s (non imposta dal contratto per questa sorgente; allineata a
`scafo-onde-loop` per coerenza di montaggio e comunque entro il limite di 22 s dell'endpoint SFX).
Canali: conservati **stereo** come restituiti dall'API (il contratto impone MONO solo per
`scafo-onde-loop`; per un room-tone d'ambiente la spazialita' stereo e' ragionevole e non e' stata
forzata a mono).

### salone-roomtone-loop_v1

| Campo | MP3 originale | WAV master |
|---|---|---|
| File | `salone-roomtone-loop_v1.mp3` | `salone-roomtone-loop_v1.wav` |
| Durata (ffprobe) | 20.000000 s | 20.000000 s |
| Sample rate | 44100 Hz | **48000 Hz** |
| Canali | 2 (stereo) | 2 (stereo) |
| Bit depth | mp3 (compresso) | **PCM 24-bit** (`pcm_s24le`) |
| Dimensione | 321.036 byte | 5.760.102 byte |
| SHA-256 | `5ef356258663a40656fa5c94e2235ae10ca0f65d8cce5dc25b804de7de0501ae` | `a5ffabaadbb6b1361826a7185fad5ddc6b1b46bb45807da59ca9d43e0264f6d1` |

**Giunzione loop per canale:**
- ch0 (L): salto = 2.271 campioni (0,027% fondo scala; **3,2% del picco locale**) — piccolo.
- ch1 (R): salto = 19.335 campioni (0,23% fondo scala; **27,0% del picco locale**) — grande.

RMS ai bordi (50 ms): ch0 13.511→17.966 (diff 6,23% del picco), ch1 13.181→18.683 (diff 7,70%
del picco) — entrambi i canali finiscono un po' piu' energici di come iniziano.

**Verdetto:** il canale destro ha un salto di campione pari a piu' di un quarto del suo picco
locale: e' il tipo di discontinuita' che si sente come un click secco al giro del loop, anche in
un materiale povero di transienti come un room tone. **Giunzione a rischio concreto sul canale
destro.**

### salone-roomtone-loop_v2

| Campo | MP3 originale | WAV master |
|---|---|---|
| File | `salone-roomtone-loop_v2.mp3` | `salone-roomtone-loop_v2.wav` |
| Durata (ffprobe) | 20.000000 s | 20.000000 s |
| Sample rate | 44100 Hz | **48000 Hz** |
| Canali | 2 (stereo) | 2 (stereo) |
| Bit depth | mp3 (compresso) | **PCM 24-bit** (`pcm_s24le`) |
| Dimensione | 321.036 byte | 5.760.102 byte |
| SHA-256 | `4d897d0f36221c738472425a9fe155959620fb5ca0b780984d23e5b953a33aa3` | `307d5f76cae7208acb11bb2ce783f7c85e2978ffa7778cb52473fb393e5b1eff` |

**Giunzione loop per canale:**
- ch0 (L): salto = 22.835 campioni (0,272% fondo scala; **9,5% del picco locale**).
- ch1 (R): salto = 45.768 campioni (0,546% fondo scala; **19,9% del picco locale**).

RMS ai bordi (50 ms): ch0 48.074→55.332 (diff 3,01% del picco), ch1 42.447→52.970 (diff 4,57%
del picco) — differenza di livello ai bordi piu' contenuta che in v1.

**Verdetto:** salti di campione piu' equilibrati tra i due canali rispetto a v1 (nessuno sfiora il
27%), ma comunque non trascurabili, in particolare sul destro (quasi 20% del picco). Il vantaggio
di v2 e' la maggiore coerenza di livello RMS ai bordi (diff sotto il 5% su entrambi i canali,
contro 6-8% di v1).

**Raccomandazione per salone-roomtone-loop: v2** (meno rischio di click marcato su un solo
canale, livello piu' coerente ai bordi), ma nessuno dei due e' un loop "pulito" senza intervento:
per l'uso finale conviene comunque un micro-crossfade (10-20 ms) sulla giunzione, su entrambe le
coppie di candidati.

---

## Nota metodologica sulla misura del loop

La giunzione e' stata misurata leggendo i campioni PCM 24-bit grezzi del WAV master (non ascoltata:
l'agente non puo' ascoltare). Due metriche, entrambe riportate sopra:

1. **Salto di campione** — differenza assoluta tra l'ultimo campione del file e il primo, espressa
   sia come % del fondo scala a 24 bit sia come % del picco locale del file (piu' informativa: un
   salto del 25% del fondo scala e' enorme, ma lo stesso salto espresso sul picco locale dice
   quanto e' udibile *in quel materiale*).
2. **Continuita' di livello** — RMS dei primi e degli ultimi 50 ms, per capire se il loop "respira"
   (attacco piu' forte/debole della coda) anche quando il salto di campione puntuale e' piccolo.

Il generatore ignora spesso l'istruzione "seamless" nel prompt: su 4 file, 3 mostrano un salto di
campione sopra il 5% del picco locale su almeno un canale. Nessuno dei quattro e' dichiarato
"loop perfetto" in questo manifest.

## Riepilogo file consegnati

```
uscite/audio/
  scafo-onde-loop_v1.mp3   scafo-onde-loop_v1.wav
  scafo-onde-loop_v2.mp3   scafo-onde-loop_v2.wav
  salone-roomtone-loop_v1.mp3   salone-roomtone-loop_v1.wav
  salone-roomtone-loop_v2.mp3   salone-roomtone-loop_v2.wav
  manifest.md
```
