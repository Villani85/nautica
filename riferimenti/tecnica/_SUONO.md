# Il suono

Ricerca trasversale sui siti premiati. Tutto quello che sta qui e' stato letto nel
codice di produzione o misurato scaricando i file, il 13 agosto 2026, salvo dove
scritto esplicitamente il contrario.

**Il punto in una riga**: il suono e' l'unico livello di un sito premiato che
*nessuno documenta, nessuno premia e nessuno copia* — e che costa **circa 100 KB
e due giorni di lavoro** se lo fai come lo fanno loro.

---

## 0. Come ho verificato

| cosa | come |
|---|---|
| inventario dei file | `grep` sui bundle di produzione scaricati con `curl` |
| peso | `curl -o /dev/null -w "%{size_download}"` su ogni singolo file |
| durata, canali, bitrate, frequenza | `ffprobe` sui file scaricati davvero |
| logica (quando parte, come sfuma) | lettura del sorgente minificato, e nel caso di Dogstudio del sorgente **non** minificato |

Bundle analizzati:
- `https://messenger.abeto.co/assets/App3D-DwM1eiaC.js` (1,93 MB)
- `https://www.igloo.inc/assets/App3D-f554a111.js` (1,49 MB)
- `https://activetheory.net/assets/js/app.1780406240914.js` (1,82 MB)
- `https://dogstudio.co/app/themes/portfolio-2018/static/js/main.js` (1,69 MB, **non minificato**: e' una build webpack di sviluppo finita in produzione, con i commenti e i nomi originali)
- il bundle di `bruno-simon.com` (4,86 MB)

Per Trionn, Lusion, Resn, Immersive Garden, Hello Monday, Star Atlas e Basement i
dettagli di codice vengono dalle schede gia' fatte in questa cartella
(`trionn.md`, `lusion.md`, `resn.md`, `immersive-garden.md`, `hello-monday.md`,
`star-atlas.md`, `basement.md`); i pesi li ho rimisurati io adesso dove i file
erano ancora raggiungibili.

---

## 1. Chi ce l'ha, e di che tipo

Undici siti su ventuno della cartella hanno del suono. Ma "avere il suono"
significa cinque cose molto diverse, e la differenza di costo fra la prima e
l'ultima e' di due ordini di grandezza.

| sito | musica | ambiente | interazione | voce | libreria |
|---|---|---|---|---|---|
| **messenger.abeto.co** | si', 2 qualita' | 7 letti incrociati | 30+ campioni | si', 7 dialoghi posizionali | Web Audio via `THREE.Audio`, in casa |
| **igloo.inc** | si' | 5 strati | 11 campioni | no | idem — **stesso identico motore** |
| **bruno-simon.com** | si', 3 brani | pioggia, vento, grilli, gufo, lupo, onde | ~34 gruppi, con varianti | no | **Howler** |
| **activetheory.net** | si', 8 brani con playlist | no | si' (SFXController) | no | Web Audio in casa, spaziale |
| **dogstudio.co** | no | **un** file, 55 s | no | no | Web Audio a mano, ~200 righe |
| **trionn.com** | no | rumore bruno sintetizzato | 10 campioni | no | Web Audio a mano |
| **resn.com** | 3 letti | si' | sprite sui rollover | no | **Howler** + SoundJS |
| **immersive-garden.com** | 3 temi (uno per tipo di pagina) | 1 loop | sprite `actions.mp3` | no | **Howler** |
| **lusion.co** | si', `.ogg` | si' | si' | no | in casa — **solo desktop** |
| **star-atlas** (landing) | no | 1 loop 997 KB | no | no | `<audio>` HTML nativo |
| **hello-monday.com** | no | no | 1 file (`stick.mp3`, 11 KB) | no | — |

Non hanno niente: Apple, Obys, Cuberto, Locomotive, Pangram Pangram, Darkroom,
Mosby, Vero, Simply Chocolate, Mana, Zajno, By Kin, Aristide Benoist, Revelatio.
Cioe': **il suono non e' un requisito per vincere**. E' una scelta di genere.

### La scoperta piu' utile: Abeto e Igloo hanno lo stesso motore

Messenger e Igloo condividono, byte per byte, la stessa classe di controllo
audio: stesse stringhe di errore (`"audio context error:"`, `"audio failed to set
volume"`), stessi nomi di evento (`webgl_play_audio`, `webgl_set_audio_volume`,
`webgl_audio_mute_toggle`), stessa firma di `addAudio()` con gli stessi nove
parametri. E' il toolkit interno di Abeto, riusato su due progetti. Se vuoi
copiare un solo pezzo di architettura da questa ricerca, copia quello: e'
**l'unico motore audio in circolazione progettato per essere guidato dallo
scroll**, ed e' spiegato tutto al §4.

---

## 2. Come lo attivano

### La regola del browser, prima di tutto

Non e' una preferenza estetica, e' un vincolo tecnico. I browser bloccano
l'audio finche' l'utente non tocca la pagina.

- **Chrome**: "Muted autoplay is always allowed". L'audio con suono passa solo se
  l'utente ha gia' interagito con il dominio, o se il suo **Media Engagement
  Index** supera la soglia (solo desktop), o se ha installato il sito come PWA.
  Per il Web Audio la frase esatta e': *"If an AudioContext is created before the
  document receives a user gesture, it will be created in the 'suspended' state,
  and you will need to call resume() after the user gesture."*
  Fonte: [developer.chrome.com/blog/autoplay](https://developer.chrome.com/blog/autoplay)
- **Safari**: blocca per impostazione predefinita i media con suono, con un
  "automatic inference engine" per decidere sito per sito. La raccomandazione
  ufficiale agli sviluppatori e' di *"assume any use of `<video>` or `<audio>`
  requires a user gesture click to play"*.
  Fonte: [webkit.org/blog/7734](https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/)

Il MEI ha un effetto perverso che vale la pena conoscere: conta come "consumo"
solo un media **udibile, in scheda attiva, per piu' di 7 secondi**. Un sito che
parte muto non costruira' mai reputazione presso Chrome. Quindi il tuo sito, dal
punto di vista di Chrome, sara' *sempre* un estraneo: progetta sapendo che
l'audio partira' **mai** da solo.

### Cosa fanno, in pratica

**Tutti e cinque i siti seri partono spenti.** Nessuna eccezione.

| sito | stato iniziale | prova nel codice | dov'e' l'interruttore |
|---|---|---|---|
| igloo.inc | **muto** | `{...volume:1, muted:!0}` nel config globale | in basso a sinistra, scritta `Sound:` + stato, **disegnata in WebGL** (testo MSDF, font IBM Plex Mono) |
| messenger.abeto.co | **muto** | `new audioController$1({volume:1, muted:!0})` | icona nella barra laterale; due glifi, `sound` e `sound-muted` |
| trionn.com | **spento** | `title="Enable sound"`, `aria-pressed="false"` (da `trionn.md`) | header, accanto a `let's talk` |
| activetheory.net | **muto**, ma ricorda | `let muted = Storage.get("muted") === true` | comando in nav; per i lettori di schermo c'e' una voce dedicata `Toggle Audio` |
| lusion.co | acceso ma **solo desktop** | `USE_AUDIO = isSupportOgg && !isMobile` (da `lusion.md`) | header; su telefono il pulsante e' `display:none` |
| dogstudio.co | **acceso al primo clic** | `document.addEventListener('click', this._resume)` | pallino in basso a destra, due anelli che pulsano |

**Active Theory e' l'unico che ricorda la scelta.** `Storage.get("muted")` legge
da `localStorage`: se hai acceso l'audio ieri, oggi lo trova acceso. Igloo e
Messenger usano `localStorage` per i progressi delle quest e per gli accessori
dell'avatar, ma **non** per l'audio: ogni visita riparte muta. E' una svista, non
una scelta: costa tre righe.

### Il trucco per non far scattare niente male

Il motore di Abeto non "accende" l'audio quando premi il pulsante. L'audio e'
**gia' in esecuzione dall'inizio**, con il volume master a zero:

```js
this._listener.setMasterVolume(0);              // parte a zero
he.audio.contextReady.then(() => {
    if (muted) events.emit("webgl_audio_mute_toggle");
    this._setVolume(this._globalVolume);
});
```

E il volume non viene mai assegnato, viene sempre *rampato*:

```js
gain.gain.setTargetAtTime(target, Math.max(0.1, ctx.currentTime), 0.35);
```

`setTargetAtTime` con costante di tempo 0,35 s. Non c'e' un solo punto, in tutto
il motore, in cui un volume cambia di colpo. E' il motivo per cui accendere
l'audio su Igloo non fa "toc": il suono **cresce**, non parte.

Dogstudio ottiene lo stesso risultato in modo piu' rozzo ma altrettanto valido:
crea l'`AudioContext` subito, lo lascia sospeso, e registra un listener sul primo
clic qualunque della pagina — non su un pulsante dedicato:

```js
document.addEventListener('click', this._resume);
// ...
resume() {
    if (this.videoPlaying || this.userDisabled) return;   // due veti
    this.ac.resume().then(() => {
        this.gains[this.currentGain].gain.value = 0.8;
        document.removeEventListener('click', this._resume);   // una volta sola
    });
}
```

Da notare i **due veti**: non riprende se c'e' un video in riproduzione nella
pagina, e non riprende se l'utente ha spento a mano. Quella prima condizione
(`videoPlaying`) e' una finezza che non ho visto da nessun'altra parte: guardi lo
showreel, l'ambiente si zittisce da solo, e torna quando chiudi.

Howler (Bruno Simon) fa lo sblocco da solo, con il trucco classico: al primo
`touchstart`/`click` suona un buffer vuoto di un campione, chiama `ctx.resume()`,
e su `onended` marca `_audioUnlocked = true`. Ha anche un auto-sospensione dopo
30 secondi di inattivita' (`_suspendTimer`, `3e4` ms) per non tenere sveglia la
scheda audio.

### La pausa quando cambi scheda

Tutti e tre i motori la fanno, e nessuno la salta:

- **Abeto**: `events.on("visibility_change", ...)` → volume a 0, e al ritorno
  ri-rampa al valore precedente. Non sospende il contesto, abbassa il gain: il
  ritorno e' morbido.
- **Dogstudio**: `visibilitychange` → `this.ac.suspend()` / `this.ac.resume()`,
  con i tre prefissi storici (`msHidden`, `webkitHidden`).
- **Active Theory**: c'e' una proprieta' per suono chiamata `visibilityMuted`.

Se la salti, l'utente apre un'altra scheda e sente la tua musica da sotto. E' il
modo piu' veloce di trasformare un tocco di classe in un fastidio.

### Accessibilita': non e' opzionale

**WCAG 2.1, criterio 1.4.2 "Audio Control", livello A** (il livello minimo):

> "If any audio on a web page plays automatically for more than 3 seconds, either
> a mechanism is available to pause or stop the audio, or a mechanism is
> available to control audio volume independently from the overall system volume
> level."

Fonte: [w3.org/WAI/WCAG21/Understanding/audio-control](https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html)

Il motivo non e' il fastidio: chi usa un lettore di schermo sente la sintesi
vocale **sopra** la tua musica, e nella maggior parte dei casi il lettore di
schermo usa il volume di sistema — quindi non puo' abbassare la tua senza
abbassare anche la propria voce.

Tre soglie: **3 secondi**, **livello A**, **mechanism**. Partire muti risolve il
problema alla radice — non c'e' audio automatico, quindi il criterio non si
applica nemmeno. Active Theory aggiunge la voce `Toggle Audio` riservata ai
lettori di schermo, che e' la risposta giusta se il tuo interruttore e' un
disegno in WebGL e non un `<button>` (il caso di Igloo).

---

## 3. Il peso

### Messenger — l'inventario completo, misurato file per file

54 file `.ogg`, tutti a 48 kHz. Base: `https://messenger.abeto.co/assets/audio/`.

| categoria | file | byte totali |
|---|---:|---:|
| `music/bgmusic-highq.ogg` | 1 | **2.310.818** |
| `ambiances/` (7 letti) | 7 | 609.461 |
| `dialogues/` (voci NPC) | 8 | 299.946 |
| `ui/` (compresi 2 loop di carta) | 13 | 197.999 |
| `character/` | 13 | 107.136 |
| `music/musician.ogg` | 1 | 98.494 |
| `intro/` | 7 | 23.690 |
| `camera/` | 3 | 21.302 |
| **totale desktop** | **53** | **3.668.846** (3,50 MiB) |
| *alternativa mobile* | | `bgmusic-mobile.ogg` 1.144.759 |

Le schede precedenti dicono che Messenger trasferisce 5,60 MB in tutto, di cui
geometria Draco 0,48 MB e texture KTX2 0,55 MB (`messenger-e-bruno-simon.md`).
Quindi, con i numeri verificati:

- **l'audio totale (3,50 MB) pesa 7,3 volte la geometria 3D dell'intero mondo.**
  Questa e' la cifra corretta dietro il "sette volte" di partenza.
- **la sola traccia musicale (2,31 MB) pesa 4,8 volte la geometria**, ed e' da
  sola il **41% di tutto quello che il sito scarica.**

Qualche singolo file, per calibrare l'intuito:

| file | durata | canali | bitrate | byte |
|---|---:|---|---:|---:|
| `music/bgmusic-highq.ogg` | 162,41 s | **stereo** | 114 kbps | 2.310.818 |
| `music/bgmusic-mobile.ogg` | 162,41 s | **mono** | 56 kbps | 1.144.759 |
| `ambiances/forest.ogg` | 15,37 s | mono | 44 kbps | 84.350 |
| `character/footsteps4.ogg` | 6,88 s | mono | 48 kbps | 40.929 |
| `dialogues/male1.ogg` | 6,48 s | mono | 48 kbps | 39.246 |
| `ui/title.ogg` | 7,66 s | mono | 43 kbps | 41.310 |
| `ui/click2.ogg` | **0,347 s** | mono | 49 kbps | 2.114 |
| `intro/rune1.ogg` | **0,348 s** | mono | 41 kbps | 1.777 |
| `ui/hover2.ogg` | **0,161 s** | mono | 56 kbps | **1.124** |

**Il suono dell'hover di Messenger pesa 1,1 KB e dura 161 millisecondi.**

### Le due qualita': non e' quello che pensi

`bgmusic-mobile.ogg` **non e' una traccia piu' corta**. E' esattamente la stessa,
162,414250 s identici. Cambiano due cose:

1. **stereo → mono** (dimezza)
2. **114 kbps → 56 kbps** (dimezza di nuovo)

Risultato: 2,31 MB → 1,14 MB, il 50,5% in meno, **senza toccare il montaggio**.
E' un secondo export dallo stesso progetto, dieci minuti di lavoro.

La selezione avviene su una riga sola:

```js
const url = client.lowMemoryDevice
    ? "music/bgmusic-mobile.ogg"
    : "music/bgmusic-highq.ogg";
```

E poi arriva la parte che conta davvero:

```js
if (client.lowMemoryDevice) {
    this._controller.addAudio({name:"quest-complete", url:"ui/quest-complete.ogg", volume:.25});
    return;                                  // <- esce. Fine.
}
// ...qui sotto gli altri 51 suoni, che su mobile non vengono mai caricati
```

**Su telefono Messenger scarica 2 file audio invece di 53: 1,17 MB invece di 3,67
MB.** Non e' una compressione, e' un'amputazione decisa a tavolino: sul telefono
restano la musica e il suono di "quest completata". Tutto il resto — passi, voci,
interfaccia, ambienti — non esiste. E' la degradazione mobile piu' netta che
abbia visto in questa ricerca, ed e' l'opposto di quello che fa Igloo (vedi
sotto).

### Igloo — 18 file, e una simmetria bellissima

Base: `https://www.igloo.inc/assets/audio/`. Tutti 48 kHz, **tutti mono tranne la
musica**.

| file | durata | canali | byte | ruolo |
|---|---:|---|---:|---|
| `music-highq.ogg` | **115,0639 s** | stereo | 1.527.578 | musica |
| `room.ogg` | **115,0639 s** | mono | 609.688 | letto di stanza |
| `wind.ogg` | **115,0639 s** | mono | 572.916 | vento |
| `igloo.ogg` | 9,74 s | mono | 62.478 | loop dell'igloo |
| `circles.ogg` | 5,01 s | mono | 28.454 | portali |
| `shard.ogg` | 3,84 s | mono | 21.753 | ghiaccio |
| `enter-project.ogg` | 4,34 s | mono | 21.582 | |
| `particles.ogg` | 2,63 s | mono | 16.799 | |
| `leave-project.ogg` | 2,23 s | mono | 11.909 | |
| `project-text.ogg` | 1,15 s | mono | 11.037 | |
| `beeps2.ogg` | 0,93 s | mono | 10.254 | |
| `beeps3.ogg` | 0,93 s | mono | 10.117 | |
| `beeps.ogg` | 0,93 s | mono | 9.765 | |
| `click-project.ogg` | 1,56 s | mono | 6.753 | |
| `manifesto.ogg` | 1,06 s | mono | 6.163 | |
| `logo.ogg` | 1,08 s | mono | 4.855 | |
| `ui-long.ogg` | **0,499 s** | mono | 4.453 | |
| `ui-short.ogg` | **0,307 s** | mono | 3.021 | |
| **totale** | | | **2.939.575** (2,80 MiB) | |

Il totale coincide esattamente con i 2,80 MB annotati in `igloo.md`. Buon segno:
i due rilevamenti sono indipendenti e tornano.

**Guarda le prime tre righe.** `music-highq`, `room` e `wind` durano tutte e tre
**115,063896 secondi**, alla sesta cifra decimale. Non e' un caso: sono tre
strati che girano in loop contemporaneamente e sono stati esportati alla stessa
identica lunghezza **perche' restino in fase per sempre**. Se durassero 115, 97 e
103 secondi, dopo dieci minuti sentiresti combinazioni sempre diverse e il vento
"scivolerebbe" rispetto alla musica. Cosi' invece l'insieme si ripete identico e
non se ne accorge nessuno. E' una decisione di montaggio audio, presa in fase di
export, che non costa niente e che nessuno nota — che e' esattamente la
definizione di sound design fatto bene.

**E ora la cifra che serve al preventivo.** Dei 2,94 MB:

- i **tre loop lunghi** (musica + stanza + vento) pesano **2.710.182 B = il 92%**
- **tutti gli altri quindici suoni insieme** pesano **229.393 B = 224 KiB**
- e le **undici interazioni pure** (beep ×3, click/enter/leave progetto, testo,
  logo, manifesto, ui-long, ui-short) pesano **99.909 B ≈ 98 KiB**

Su Messenger lo stesso conto da' **95.357 B ≈ 93 KiB** per gli 11 suoni di
interfaccia. Due studi diversi, due progetti diversi, stesso ordine di
grandezza.

> **Un intero corredo di suoni di interazione costa circa 100 KB.**
> Meno di una fotografia. Meno del font che stai gia' caricando.

### Igloo non degrada niente su mobile

`igloo.md` lo dice chiaro: 18,39 MB su desktop, 18,39 MB su mobile, identici.
Nessun taglio dell'audio. Igloo scarica 2,94 MB di `.ogg` anche a chi lo apre in
metropolitana, e ne tiene il 92% in tre loop che l'utente sentira' solo se accende
l'audio — cosa che, essendo `muted: true`, la maggioranza non fara' mai.

**Questo e' l'errore da non ripetere.** Messenger carica 1,17 MB su telefono.
Igloo ne carica 2,94. La differenza non e' tecnica, e' che uno ci ha pensato.

### Gli altri

| sito | file | durata | formato | byte |
|---|---|---:|---|---:|
| **dogstudio.co** `ambience.mp3` | 1 | 54,83 s | mp3 **mono, 32 kHz, 48 kbps** | **329.216** |
| **trionn** `thunder.mp3` | | 17,45 s | mp3 stereo 24 kHz, 64 kbps | 140.204 |
| **trionn** `woosh-loop.mp3` | | 4,58 s | mp3 stereo 24 kHz, 161 kbps | 92.205 |
| **trionn** `glass-shatter.mp3` | | 2,78 s | mp3 stereo 24 kHz, 160 kbps | 55.680 |
| **trionn** `join-zoom.mp3` | | 2,62 s | mp3 stereo 24 kHz, 160 kbps | 52.320 |
| **trionn** `hero-spark.mp3` | | 1,13 s | mp3 stereo 48 kHz, 340 kbps | 48.045 |
| **trionn** `hover-beep.mp3` | | **0,08 s** | mp3 stereo 44 kHz | 6.313 |
| **star-atlas** `landing_ambient.mp3` | 1 | — | mp3 | ~997.900 (da `star-atlas.md`) |
| **hello-monday** `stick.mp3` | 1 | — | mp3 | 11.410 (da `hello-monday.md`) |
| **resn** `bg_01/02/03.mp3` | 3 | — | mp3 | 713.000 l'uno (da `resn.md`) |

**Dogstudio e' il caso di scuola dell'economia.** Un solo file, mono, campionato a
32 kHz (non 44,1, non 48), a 48 kbps. 329 KB per 55 secondi di ambiente che gira
in loop su tutto il sito. Non serve altro perche' non c'e' altro da sentire: e'
un letto, non una colonna sonora.

**Trionn e' il caso di scuola dello spreco.** I suoi file sono **stereo a 24 kHz
e 160 kbps**: una combinazione senza senso — 24 kHz butta via tutto sopra i 12
kHz (l'aria, il brillante), ma poi si tiene due canali identici e un bitrate da
musica. `hero-spark.mp3` e' a **340 kbps** per 1,1 secondi. Con la ricetta di
Igloo (mono, 48 kHz, ~48 kbps) gli stessi sei file passerebbero da 395 KB a circa
110 KB, e suonerebbero **meglio**, non peggio.

### Active Theory — la playlist

8 brani MP3, tutti **44,1 kHz stereo a 128 kbps**, con nome d'artista nel titolo.

| brano | durata | byte |
|---|---:|---:|
| Downtown Binary — Other Worlds | 264,0 s | 4.224.774 |
| nuer self — Dusk | 236,2 s | 3.780.901 |
| Flint — Fly up High | 187,5 s | 3.000.990 |
| Hotham — To the Stars | 177,8 s | 2.846.345 |
| BXRDVJA — Ghost Cities | 172,9 s | 2.767.768 |
| Sergey Azbel — Themis | 140,9 s | 2.254.932 |
| Jozeque — Sultans of Streams | 136,1 s | 2.178.446 |
| Magiksolo — Quantum World | 99,4 s | 1.592.049 |
| **totale catalogo** | | **22.646.205** (21,6 MiB) |

22,6 MB sembrano enormi, ma **non si scaricano**: `registerSound(nome, path)`
registra solo il percorso, e il caricamento avviene per brano con `preload()`.
La playlist viene mescolata all'avvio (`SONGS.shuffle()`), quindi ogni visita
sente un brano diverso e ne scarica **uno solo**, in media 2,83 MB. E' un
lettore musicale vero, con `<<` e `>>`, e un ticker che scorre `1. Sergey Azbel —
Themis` — la traccia e' **accreditata all'artista nell'interfaccia**, il che dice
che sono brani in licenza e non musica su misura.

---

## 4. La libreria, e come sincronizzano

### Chi usa cosa

| libreria | chi | verdetto |
|---|---|---|
| **niente, Web Audio a mano** | Dogstudio, Trionn, Active Theory, Lusion | e' la scelta di maggioranza |
| **Web Audio via `THREE.Audio` / `THREE.AudioListener`** | Abeto (Messenger + Igloo) | la scelta piu' intelligente se hai gia' Three.js |
| **Howler** | Bruno Simon, Resn, Immersive Garden | comoda, ma pesa e non sa niente di scroll |
| **`<audio>` HTML nativo** | Star Atlas | basta e avanza per un loop solo |
| **Tone.js** | **nessuno** | zero occorrenze in tutti i bundle esaminati |

Tone.js e' pensato per fare musica nel browser (sequencer, sintesi, tempo). Per
un sito e' l'attrezzo sbagliato, e infatti non lo usa nessuno. Non prenderlo in
considerazione.

Dogstudio scrive il proprio motore in **circa 200 righe** e ci mette dentro
tutto: contesto, filtro, due gain per il crossfade, cache dei buffer, gestione
della visibilita', sblocco al gesto. Se il tuo sito ha un solo ambiente, e'
questa la misura giusta: importare Howler per suonare un mp3 in loop e' come
importare una libreria di grafici per disegnare una linea.

### La struttura che rende tutto possibile: il volume zero

Questo e' **il** concetto. Su Igloo e Messenger nessun suono ambientale viene mai
avviato o fermato. Vengono tutti avviati **una volta sola, all'inizio, in loop, a
volume zero**:

```js
// Igloo
addAudio({name:"wind",      url:"wind.ogg",      volume:0, autoPlay:true, loop:true})
addAudio({name:"igloo",     url:"igloo.ogg",     volume:0, autoPlay:true, loop:true})
addAudio({name:"shard",     url:"shard.ogg",     volume:0, autoPlay:true, loop:true})
addAudio({name:"portals",   url:"circles.ogg",   volume:0, autoPlay:true, loop:true})
addAudio({name:"particles", url:"particles.ogg", volume:0, autoPlay:true, loop:true})

// Messenger: sette ambienti, tutti uguali
addAudio({name:"ambiance-forest", url:"ambiances/forest.ogg", volume:0, autoPlay:true, loop:true})
addAudio({name:"ambiance-city",   url:"ambiances/city.ogg",   volume:0, autoPlay:true, loop:true})
// ...beach, factory, temple, waterfalls, base
```

Da quel momento **l'unica cosa che succede e' che dei numeri si muovono fra 0 e
1**. Niente `play()`, niente `stop()`, niente latenza di decodifica, nessun rischio
di "attacco" udibile. Lo scroll non accende suoni: **apre e chiude rubinetti gia'
aperti.**

E' anche il motivo per cui Igloo si porta dietro 2,7 MB di loop: perche' sono
tutti in memoria dal primo istante. Il costo di quella eleganza e' il peso.

### Sincronizzazione con lo scroll: le formule vere

**Igloo — il vento, con una busta trapezoidale sul progresso di scroll:**

```js
this._windVolume = fit(this.progress, .05, .2, 0, 1)      // entra dal 5% al 20%
                 * fit(this.progress, .75, .95, 1, 0);     // esce dal 75% al 95%
events.emit("webgl_set_audio_volume", "wind", this._windVolume * .4);
```

Due `fit` moltiplicati fra loro: uno che sale, uno che scende. Il vento c'e' solo
nella parte centrale del racconto, e i bordi sono rampe lunghe (il 15% e il 20%
dello scroll), non soglie.

**Igloo — i portali, con la distanza dal piu' vicino:**

```js
let n = Infinity;
[.28, .375, .465].forEach(p => { n = Math.min(n, Math.abs(this.progress - p)) });
this._portalsVolume = ease(fit(n, 0, .04, 1, 0), "power2.out") * .9;
```

Tre portali, a scroll 0,28 / 0,375 / 0,465. Il volume dipende dalla distanza dal
**piu' vicino**, con un alone largo il 4% dello scroll, addolcito da `power2.out`.
Non c'e' nessun `if (progress > x)` da nessuna parte: il suono e' una **funzione
continua della posizione**, ed e' per questo che non "scatta" mai.

**Igloo — il ghiaccio, con attacco e rilascio asimmetrici:**

```js
const r = this.cubes[n].mouseFrost.soundVelocity > this._shardVolume ? .2 : .05;
this._shardVolume = lerpFPS(this._shardVolume, this.cubes[n].mouseFrost.soundVelocity, r);
events.emit("webgl_set_audio_volume", "shard", this._shardVolume * .5);
```

Se il valore sta **salendo** interpola con coefficiente 0,2; se sta **scendendo**,
con 0,05. **Sale quattro volte piu' in fretta di quanto scende.** E' il
comportamento di un compressore audio, ed e' quello che rende il suono "vivo"
invece che elastico.

**Bruno Simon fa esattamente la stessa cosa, in un altro sito, con un'altra
libreria**, per le ruote sul terreno:

```js
const a = s * 0.4 - e.volume;
a > 0 ? e.volume += a * delta * 20      // attacco: 20
      : e.volume += a * delta * 5;      // rilascio: 5
```

Due studi indipendenti, stesso rapporto 4:1. Non e' una coincidenza: e' come
funziona l'orecchio. **Se copi una sola formula da questo documento, copia
questa.**

**Bruno Simon — lo scroll che guida volume *e* intonazione:**

```js
onPlaying: (e) => {
    const r = Math.abs(this.scroller.speed);
    e.volume = remapClamp(r, 0, 6, 0, 0.5);
    e.rate   = remapClamp(r, 0, 6, 0.95, 1.05);
}
```

Il meccanismo che scorre non alza solo il volume: **cambia anche il pitch, del
±5%**. Piu' vai veloce, piu' il suono si alza. E' la differenza fra un loop
riprodotto e un oggetto che si muove.

**Dogstudio — il filtro che si apre sullo scroll:**

```js
setScrollPosition(scroll) {
    if (scroll < 0.5) {
        this.currentQ         = 2 - scroll * 2 * 0.5;
        this.currentFrequency = 400 + scroll * 2 * 600;
        this.filter.Q.setValueAtTime(this.currentQ, this.ac.currentTime);
        this.filter.frequency.setValueAtTime(this.currentFrequency, this.ac.currentTime);
    } else {
        this.withinScroll = false;                       // succede una volta sola
        this.filter.Q.exponentialRampToValueAtTime(0.5,  this.ac.currentTime + 0.5);
        this.filter.frequency.exponentialRampToValueAtTime(4000, this.ac.currentTime + 0.5);
    }
}
```

Un solo `BiquadFilterNode` fra il suono e le casse. Nella prima meta' di schermata
la frequenza va **da 400 a 1000 Hz** in modo continuo e il Q da 2 a 1,5; superata
la meta', `withinScroll` si spegne e parte una rampa esponenziale di **0,5 s fino
a 4000 Hz** con Q 0,5. (Le schede precedenti riportavano "400 → 4000 continuo
sulla prima meta'": **la lettura del sorgente dice altro** — sono due fasi, e la
seconda scatta una volta sola.)

L'effetto percepito: parti come se il suono venisse da un'altra stanza, e appena
scorri **la porta si apre**. Un file, un nodo, quattro righe.

Lo stesso filtro viene richiuso all'apertura del menu — 400 Hz, Q 2, gain 0,8 →
0,6 su 1,2 s — e riaperto alla chiusura. Il menu "attutisce" il mondo dietro.

### Sincronizzazione con l'animazione: il pezzo raro

Il motore di Abeto ha una funzione che non ho trovato in nessun'altra parte.
Ogni suono puo' essere dichiarato `sync: true`, e a quel punto viene **riagganciato
all'orologio globale dell'animazione** se va alla deriva:

```js
// a ogni prerender
const drift = clock.time - ctx.currentTime;
const needsResync = Math.abs(drift - this._lastDrift) > 0.1;   // soglia 100 ms
sounds.forEach(s => {
    if (s && needsResync && s._animationSync) {
        s.pause();
        s._progress = (clock.time + s._animationSyncOffset) * s.playbackRate
                      % (s.duration || s.buffer.duration);
        s.play();
    }
});
```

Su Messenger e' usato per i passi:

```js
addAudio({name:"footsteps",       url:"character/footsteps4.ogg",      volume:0, autoPlay:true, loop:true, sync:true})
addAudio({name:"footsteps-water", url:"character/footsteps-water.ogg", volume:0, autoPlay:true, loop:true, sync:true})
```

Il loop dei passi gira sempre, a volume zero, **in fase con il ciclo di
camminata del personaggio**. Quando il personaggio cammina il volume sale e il
piede tocca terra insieme al suono. Se non ci fosse il riaggancio, `AudioContext`
e `requestAnimationFrame` divergerebbero di qualche decina di millisecondi al
minuto e dopo un po' sentiresti i passi fuori tempo.

L'`AudioListener` viene a sua volta agganciato alla camera con rampe, non con
assegnazioni:

```js
listener.positionX.linearRampToValueAtTime(camera.position.x, t);
listener.forwardX.linearRampToValueAtTime(dir.x, t);
listener.upX.linearRampToValueAtTime(up.x, t);
```

### La nebbia di Trionn, al contrario

Trionn fa il percorso inverso: invece di far guidare il suono dall'immagine, fa
guidare **l'immagine dal suono**. Un `AnalyserNode` legge il livello dell'audio e
il valore entra nello shader della nebbia del footer (da `trionn.md`). E' anche
l'unico sito che **sintetizza** invece di riprodurre: usa uno `ScriptProcessorNode`
per generare rumore bruno in tempo reale, senza nessun file. L'istruzione a
schermo e': *"sound on [icona] Hover the lines."*

---

## 5. Gli effetti sull'interazione

### Quanti, e quanto durano

| sito | suoni di interazione | durata tipica | tecnica |
|---|---:|---|---|
| Bruno Simon | ~34 gruppi, molti con 3–7 varianti | 0,1–2 s | campioni da librerie commerciali |
| Messenger | ~30 (ui + character + intro + camera) | **0,16–0,5 s** | campioni |
| Igloo | 11 | **0,31–1,56 s** | campioni |
| Trionn | 10 | 0,08–2,8 s | campioni + rumore bruno sintetizzato |
| Resn | 8 in **uno sprite unico** | — | sprite Howler |
| Immersive Garden | tutti in `actions.mp3` | — | sprite Howler |
| Hello Monday | 1 (`stick.mp3`) | — | campione |

**Sono tutti campioni.** L'unica sintesi in tutta la ricerca e' il rumore bruno di
Trionn. Nessuno usa oscillatori, nessuno usa Tone.js.

**La durata giusta e' fra 150 e 500 millisecondi.** `ui/hover2.ogg` di Messenger
sta a 161 ms; `ui-short.ogg` di Igloo a 307 ms; `ui-long.ogg` a 499 ms. Sopra il
secondo non e' piu' un feedback, e' un evento.

### Le tre regole per non far venire il mal di testa

Sono le tre cose che separano il suono di interazione fatto bene da quello che
fa chiudere la scheda. Tutti e tre i motori seri le implementano.

**1. Anti-ripetizione (obbligatoria).** Un suono non puo' suonare due volte entro
N millisecondi. Senza questo, passare il mouse veloce su una lista genera una
mitragliatrice.

```js
// Abeto — nel controller
playAudio(name, delay = 0) {
    const s = this._sounds.get(name);
    if (!s || !this._isRunning()) return;
    if (clock.time - s._timeLastPlayed > s._minTimeBetweenPlays) {
        s._timeLastPlayed = clock.time;
        s.stop().play(delay);
    }
}
```

Valori reali: Igloo `minTimeBetweenPlays: 0.4` sui beep. Messenger `0.2` sui
pulsanti dell'intro. Bruno Simon chiama lo stesso parametro `antiSpam`: `0.1`
sugli impatti, `0.15` sul registratore di cassa, `0.2` sulle molle, `1` sul
cigolio della maniglia, e **`7` sui tuoni** (un tuono ogni sette secondi al
massimo).

**2. Varianti a rotazione.** Lo stesso evento non deve mai produrre lo stesso
identico suono. Bruno Simon registra **sette** campioni diversi nel gruppo
`hitDefault` e altrettanti in `hitBrick`; a ogni urto ne pesca uno. Igloo ha
`beeps`, `beeps2`, `beeps3`. Resn ha `menu1..menu4`.

**3. Intonazione casuale.** Anche con le varianti, serve un ultimo velo di
casualita' sul pitch:

```js
o.rate = 0.9 + Math.random() * 0.2;     // ±10%
```

Questa riga compare **decine di volte** nel codice di Bruno Simon, con ampiezze
diverse a seconda di quanto vuoi che l'oggetto sembri "vario": `0.9 + rand*0.2`
per gli impatti, `1 + rand*0.02` (praticamente niente) per l'incudine — un
metallo pesante suona sempre uguale — e `0.7 + rand*1.3` (enorme) per le
esplosioni.

### La forza dell'urto diventa volume

```js
onPlay: (o, velocity, position) => {
    o.positions[0].copy(position);
    const c = remapClamp(velocity, 0, 200, 0, 1);
    o.volume = base * c;
    o.rate   = 0.9 + Math.random() * 0.2;
}
```

Un solo campione, e il volume proporzionale alla velocita' dell'impatto: sfiori
un mattone e senti un tocco, ci vai addosso a tutta e senti una botta. Con lo
stesso file.

E per i tuoni, il pitch dipende dalla **distanza**:

```js
const d = Math.hypot(pos.x - player.x, pos.z - player.y);
s.rate = 1.3 + Math.random() * 0.1 + remapClamp(d, 0, 20, 0, -0.3);
```

Piu' e' lontano, piu' e' grave. Che e' esattamente quello che fa l'aria.

### Le voci di Messenger

Sette dialoghi (`male1-3`, `female1-3`, `wtf`) registrati come **audio
posizionale** con `refDistance: 2`, `rolloffFactor: 1`. Ma la finezza e' un'altra:

```js
onStart: () => {
    npc.add(this.positionals[name]);
    this.positionals[name].offset = Math.random() * this.positionals[name].buffer.duration;
    this._controller.playAudio(name, delay);
}
```

**Il dialogo parte da un punto casuale dentro il file.** Sei personaggi che usano
lo stesso `male1.ogg` non dicono mai la stessa cosa nello stesso momento. E il
volume sale con un tween di 0,2 s invece che di colpo.

Il musicista del villaggio ha un trattamento a parte, con modello di distanza
lineare:

```js
addPositionalAudio({name:"dialogue-music-dave", url:"music/musician.ogg",
    volume:0, loop:true, distanceModel:"linear", refDistance:2.5,
    rolloffFactor:1, maxDistance:12})
```

98 KB di musica che esistono solo entro dodici metri da un personaggio.

### I volumi: sono tutti bassissimi

Vale la pena guardare i numeri veri, perche' sono il contrario di quello che
verrebbe da fare:

| suono | volume |
|---|---:|
| Messenger — musica di sottofondo | **0,10** |
| Messenger — pulsanti | **0,05** |
| Messenger — click3 | 0,05 |
| Messenger — customize | 0,06 |
| Messenger — hover | 0,20 |
| Igloo — musica | **0,20** |
| Igloo — letto di stanza | 0,45 |
| Igloo — interfaccia | 0,30 |
| Active Theory — volume globale a regime | **0,15** |

La musica di Messenger sta a **un decimo** del volume disponibile. Active Theory,
dopo il primo gesto, porta il volume globale da 0 a **0,15** con una rampa di
2000 ms `easeInOutSine` (da `active-theory.md`). Nessuno, mai, si avvicina a 1.

Il suono di un sito premiato **non si sente**: si nota se lo togli.

---

## 6. Serve davvero? Quello che si puo' dimostrare e quello che no

Qui devo essere netto, perche' e' la parte in cui e' facile raccontarsi storie.

### Quello che ho verificato

**Il suono non e' un criterio di giudizio.** I criteri ufficiali di Awwwards sono
quattro: Design 40%, Usability 30%, Creativity 20%, Content 10%. **Audio e sound
design non compaiono**, ne' come criterio ne' come sottocriterio.
Fonte: [awwwards.com/about-evaluation](https://www.awwwards.com/about-evaluation/)

**Il suono non viene nemmeno accreditato.** Ho aperto la scheda Awwwards di Igloo
Inc — un sito con 18 file audio, tre loop sincronizzati al campione e cinque
strati guidati dallo scroll. Nei crediti, nella descrizione dello studio e nei
commenti della giuria **non c'e' una parola su audio, musica o sound design**.
Fonte: [awwwards.com/sites/igloo-inc](https://www.awwwards.com/sites/igloo-inc)

Se ne ricava una cosa scomoda e una utile. La scomoda: **"mettiamo il suono cosi'
vinciamo un premio" non sta in piedi**, non e' quello che viene misurato. L'utile:
lo spazio e' completamente libero. Nessuno lo rivendica, quindi chi lo sa fare
non ha concorrenza nel raccontarlo.

**Chi lo fa, lo fa con materiale di libreria.** I nomi dei file di Bruno Simon
sono i codici catalogo dei pacchetti commerciali:
`Robotic_Lifeforms_2_-_Air_Source_-_Piston_Studio_Chair_07.mp3` (Boom Library),
`ThunderSharpStrikingRumblingCrackling_JMDKp_04.mp3`,
`Gear_SDFIRE0411.mp3`, `Hammers_GENHD1-01372.mp3`, `SIG014001.mp3`,
`soundjay_rain-on-leaves_main-01.mp3`,
`Mountain Audio - Fire Burning in a Wood Stove 1.mp3`.
Nessuna registrazione originale: **abbonamento a una libreria + montaggio**.
Active Theory usa 8 brani in licenza, accreditati per nome nell'interfaccia.
Secondo `igloo.md`, Igloo dichiara di aver montato l'audio in **DaVinci Resolve**
(dichiarazione dello studio riportata nel case study Awwwards — *non l'ho
riverificata in questa sessione*).

### Quello che NON ho potuto verificare — e che nessuno pubblica

**Quanti utenti accendono l'audio: non lo sa nessuno.** Non ho trovato un solo
numero pubblico. Nessuno studio ha pubblicato un tasso di attivazione. Non c'e'
un test A/B pubblicato. Non c'e' un dato di settore.

E si capisce anche perche' sarebbe difficile averlo: su Igloo il pulsante e' un
**testo disegnato in WebGL** in basso a sinistra, senza contrasto, sotto la riga
"Scroll down to discover". Su Messenger e' un'**icona senza etichetta** nella
barra laterale. Non sono progettati per essere trovati: sono progettati per non
disturbare chi non li cerca.

**La statistica "l'85% dei video viene guardato senza audio"** circola da anni in
ambito social. Non sono riuscito a risalire alla fonte originale in questa
sessione (budget di ricerca web esaurito) e **non la uso come argomento**.
Riguarda comunque il video pubblicitario in un feed, che e' un contesto diverso
da un sito che l'utente ha aperto di proposito.

**Non ho trovato critiche documentate** al suono su questi siti specifici. Nessun
articolo, nessuna analisi di usabilita'.

### L'unica prova seria che ho: come si comportano loro

Se il suono acceso di default funzionasse, qualcuno lo terrebbe acceso. **Non lo
fa nessuno.** Cinque studi su cinque, con motori diversi, in anni diversi, hanno
preso la stessa decisione: `muted: true`.

E la seconda prova, ancora piu' eloquente: **Messenger su telefono butta via 51
suoni su 53**. Se lo studio che ha fatto il lavoro di sound design piu' esteso
della ricerca ritiene che su mobile ne valga la pena solo per la musica e per un
suono di conferma, e' un giudizio di valore che dice piu' di qualsiasi statistica.

Quindi la risposta onesta alla domanda "serve?" e':

> Il suono **non porta traffico, non porta premi e non porta conversioni
> misurabili**. Serve a una cosa sola, e la fa meglio di qualunque altro
> elemento: **rendere memorabile ai pochi che lo accendono un sito che gli altri
> hanno gia' trovato bello.** E costa cosi' poco che la domanda "conviene?" e'
> quasi sempre mal posta.

---

## 7. La regola operativa

### Quando metterlo

**Sempre, se il sito ha gia' un mondo 3D o una narrazione a scroll.**
L'infrastruttura c'e' gia' (un ciclo di render, un progresso di scroll, un
contesto), il costo marginale e' ~100 KB e un giorno di lavoro, e il salto di
percezione e' sproporzionato. Igloo, Messenger, Lusion, Bruno Simon.

**Si', in versione minima (un file), se il sito ha un'atmosfera da difendere.**
Il modello e' Dogstudio: 329 KB, un ambiente, un filtro guidato dallo scroll.
Sotto le tre ore di lavoro.

**No, sui suoni di interfaccia da soli.** Un sito senza mondo che fa "click" ai
click non sembra curato, sembra un'app del 2011. Il suono di interazione funziona
**dentro** un ambiente: e' il fatto di stare in un posto che rende sensato che
quel posto risponda.

**Mai** su e-commerce, moduli, dashboard, siti di servizio, qualunque cosa che si
apra al lavoro o in ufficio.

**Mai su telefono senza aver deciso cosa tagliare.** Lusion lo esclude del tutto
(`!browser.isMobile`); Messenger tiene 2 file su 53; Hello Monday perde tutto
insieme al livello WebGL. Igloo non taglia niente, e paga 2,94 MB di audio a chi
non lo sentira' mai. **Non fare come Igloo.**

### Le tredici regole, in ordine di importanza

1. **Parti muto.** `muted: true`. Cinque su cinque. Risolve anche WCAG 1.4.2 alla radice.
2. **Ricorda la scelta** in `localStorage`. Lo fa solo Active Theory. Sono tre righe e nessun altro le ha scritte.
3. **Non fermare e non far ripartire mai i loop.** Avviali tutti all'inizio a `volume: 0` e muovi solo i volumi.
4. **Non assegnare mai un volume: rampalo.** `setTargetAtTime(v, t, 0.35)`, oppure un tween di 0,2–0,5 s. Zero eccezioni.
5. **Attacco e rilascio asimmetrici, rapporto 4:1.** `sale ? 0.2 : 0.05`. Due studi indipendenti ci sono arrivati da soli.
6. **Il volume e' una funzione continua**, mai una soglia. `fit(distanza, 0, 0.04, 1, 0)` con un ease, non `if (progress > 0.3)`.
7. **Anti-ripetizione su ogni suono di interazione.** 0,1 s sugli urti, 0,2 s sui pulsanti, 0,4 s sui beep, 7 s sui tuoni.
8. **Tre varianti minimo** per ogni evento ripetibile, piu' `rate = 0.9 + rand*0.2`.
9. **Durata 150–500 ms** per il feedback. Sopra il secondo non e' piu' feedback.
10. **Volumi bassissimi.** Musica a 0,10–0,20. Interfaccia a 0,05–0,30. Mai vicino a 1.
11. **Mono per tutto tranne la musica**, 48 kHz, 48 kbps, Vorbis/`.ogg`. Igloo e Messenger fanno cosi'. Trionn no, e paga il triplo per un risultato peggiore.
12. **Silenzio quando la scheda va in secondo piano**, e quando parte un video.
13. **Se i loop suonano insieme, esportali della stessa identica lunghezza.** I tre di Igloo durano 115,063896 s tutti e tre.

### La ricetta minima, in ordine di esecuzione

```
1. un letto d'ambiente     mono, 48 kHz, 48 kbps, 50-60 s, in loop     ~300 KB
2. un BiquadFilter fra il letto e le casse, guidato dallo scroll        ~15 righe
3. hover  (~160 ms)                                                     ~1,2 KB
4. click  (~350 ms) x2 varianti                                         ~4 KB
5. transizione (~500 ms)                                                ~4,5 KB
6. interruttore visibile, muto di default, salvato in localStorage      ~20 righe
7. pausa su visibilitychange                                            ~6 righe
                                                              -----------------
                                                       totale  ~310 KB
```

**310 KB.** Meno di una foto d'apertura non ottimizzata. Meno della meta' di
`dog.drc.glb`. Il 2% di quello che scarica Igloo.

### Quanto costa farlo bene

Stima basata su quello che si vede nel codice — **non su preventivi reali, che
non ho**.

| voce | tempo | note |
|---|---|---|
| abbonamento a una libreria di effetti | — | e' quello che usano tutti; nessuno registra |
| scelta e montaggio di 1 letto d'ambiente | mezza giornata | export a due qualita': +10 minuti |
| scelta e montaggio di 5–8 suoni di interazione | mezza giornata | la parte lunga e' scartare, non montare |
| motore audio (contesto, sblocco, mute, visibilita', crossfade) | mezza giornata | ~200 righe, il modello e' `dogstudio/utils/audio.js` |
| aggancio allo scroll + taratura dei volumi | **una giornata** | e' qui che sta il lavoro vero, ed e' tutto a orecchio |
| **totale** | **2,5–3 giorni** | |

La giornata di taratura non e' comprimibile e non e' delegabile: le costanti che
hai letto sopra (0,35 — 0,2/0,05 — 0,04 — 0,10) non si calcolano, si trovano
ascoltando. Chi taglia quella giornata ottiene un sito che ha il suono ma suona
male, che e' peggio di un sito muto.

**Un secondo export mono a meta' bitrate costa dieci minuti e dimezza il peso.**
Se fai una cosa sola oltre al minimo, fai quella.

---

## 8. Cosa resta non verificato

Elenco onesto di quello che questo documento **non** dimostra.

- **Il tasso di attivazione.** Non esiste un dato pubblico. Non l'ho trovato per nessuno dei siti, ne' aggregato di settore.
- **Come suonano.** Ho misurato durate, canali, bitrate e peso di ogni file, e ho letto quando e a che volume vengono riprodotti. **Non li ho ascoltati.** Non so se `ambience.mp3` di Dogstudio sia un drone o una pioggia.
- **La statistica "85% senza audio"**: non risalita alla fonte in questa sessione. Non usata come argomento.
- **Le dichiarazioni degli studi**: la pagina Awwwards di Igloo non contiene niente sull'audio. Il sito di Abeto risponde 403 alle richieste automatiche. La nota su DaVinci Resolve viene da `igloo.md`, non riverificata qui.
- **Trionn, Lusion, Resn, Immersive Garden, Star Atlas, Hello Monday, Basement**: i dettagli di codice vengono dalle schede precedenti. Ho rimisurato io i pesi di Trionn (6 file); gli altri no.
- **Trionn**: quattro file citati in `trionn.md` (`lion-growl`, `curtain`, `hanging-lion`, `work-listing`) rispondono con la pagina SPA e non con l'audio. O il percorso e' cambiato, o quei file non sono piu' in produzione.
- **Basement**: `basement.md` riporta `MusicToggle` e ~5 MB di mp3 in `public/3d/audio`. Non verificato in questa sessione.
- **Se il deploy attuale corrisponde** a quello analizzato nelle schede precedenti: i bundle vengono da build con hash, che possono essere cambiate.

---

## Fonti

**Codice di produzione** (scaricato e letto il 13/08/2026)
- `https://messenger.abeto.co/assets/App3D-DwM1eiaC.js`
- `https://messenger.abeto.co/assets/audio/` — 54 file `.ogg` misurati singolarmente
- `https://www.igloo.inc/assets/App3D-f554a111.js`
- `https://www.igloo.inc/assets/audio/` — 18 file `.ogg` misurati singolarmente
- `https://activetheory.net/assets/js/app.1780406240914.js`
- `https://activetheory.net/assets/music/` — 8 mp3 misurati
- `https://dogstudio.co/app/themes/portfolio-2018/static/js/main.js` (sorgente non minificato)
- `https://dogstudio.co/app/themes/portfolio-2018/static/assets/audios/ambience.mp3`
- `https://trionn.com/assets/*.mp3`, `https://trionn.com/audio/thunder.mp3`
- bundle di `https://bruno-simon.com/`

**Documentazione ufficiale**
- [Autoplay policy in Chrome — developer.chrome.com](https://developer.chrome.com/blog/autoplay)
- [Auto-Play Policy Changes for macOS — webkit.org](https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/)
- [Understanding SC 1.4.2 Audio Control — w3.org](https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html)
- [Evaluation criteria — awwwards.com](https://www.awwwards.com/about-evaluation/)
- [Igloo Inc — awwwards.com](https://www.awwwards.com/sites/igloo-inc)

**Schede precedenti di questa cartella**
`igloo.md`, `messenger-e-bruno-simon.md`, `dogstudio.md`, `active-theory.md`,
`trionn.md`, `lusion.md`, `resn.md`, `immersive-garden.md`, `hello-monday.md`,
`star-atlas.md`, `basement.md`
