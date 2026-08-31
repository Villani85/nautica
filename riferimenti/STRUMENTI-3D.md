# Cosa posso fare in 3D: Blender, le skill, Tripo

**Scritto da:** Claude Opus 5, 31 agosto 2026
**Scopo:** dire cosa è davvero disponibile su questo PC, cosa costa, e — più
importante — **quale strumento è quello sbagliato per quale problema**.

Non è un catalogo. È una guida alla scelta, perché l'errore che costa di più non
è usare male uno strumento: è usare lo strumento giusto per il problema sbagliato.

---

## 0 · LA REGOLA CHE DECIDE, prima di ogni strumento

Questo repo ne ha una, e regge:

> **Ciò che è diagramma si costruisce. Ciò che è fotografia si guarda.**

Da lì discende tutto il resto:

| se l'oggetto… | allora |
|---|---|
| deve **muoversi in modo causale** (pinna, albero, riduttore, giroscopio) | si costruisce, e la sua forma la detta la fisica |
| deve **stare in un posto misurato** (guscio del salone: sei piani e un buco) | si costruisce da script, non si genera |
| è **complicato ma non vincolato** (poltrona, lampada, ferramenta) | si può generare |
| è **fotografia** (le persone, la luce del salone) | si riprende, non si modella |

Il guscio del salone è l'esempio che chiarisce: è *sei piani e un buco* di forma
banale ma di **posizione vincolata al millimetro**. Un generatore 3D dà forme
plausibili a scala arbitraria — cioè esattamente l'opposto di ciò che serve.

---

## 1 · BLENDER — installato e già usato in produzione

**Stato:** `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe`,
versione 5.2.0 LTS. Pilotabile in due modi.

### 1.1 · Da riga di comando, headless

```bash
blender -b -P riferimenti/blender/<copione>.py
```

È il modo che questo progetto usa **per tutto ciò che conta**, e la ragione è
che il risultato è **riproducibile**: il copione sta nel repo, chiunque lo
rilancia e riottiene lo stesso GLB. Un modello costruito a mano nell'interfaccia
è, fra sei mesi, un file che nessuno sa rifare.

Copioni già scritti e funzionanti:

| copione | cosa fa |
|---|---|
| `guscio-salone.py` | costruisce il guscio: 12 pezzi, 14 KB |
| `guscio-esporta.py` | geometria + UV proiettate + camera sorgente → GLB 123 KB |
| `guscio-camera-prova.py` | risolve la posa provando le 4 convenzioni contro la maschera |
| `guscio-parallasse.py` | misura se il guscio ha profondità vera o è una lastra col buco |
| `guscio-proiezione.py` | la prova di tautologia: proiettando e renderizzando dalla stessa camera si deve riottenere la foto |
| `cuoci-interni.py`, `cuoci-luce-scafo.py` | cottura di luce e occlusione |

### 1.2 · Da MCP, sulla sessione aperta

C'è un server `blender-mcp` con `execute_blender_code`, `get_scene_info`,
`get_viewport_screenshot`. Serve quando devo **guardare** una scena mentre la
costruisco — non per la produzione, perché non lascia un copione rieseguibile.

### 1.3 · Cosa Blender risolve, qui e ora

- **la traversata world-space**, che è il blocco più grosso aperto: guscio
  continuo fra sezione dello scafo, locale tecnico, scala, corridoio e salone,
  tutto nelle stesse unità dello yacht;
- **lo yacht sui primi cinque punti** dell'ordine: silhouette, contatto con
  l'acqua, illuminazione, cappature, separazione dei materiali;
- **le cotture**: luce e occlusione in texture, che è ciò che evita al corridoio
  di sembrare un blockout in tempo reale.

### 1.4 · Il costo vero, misurato

Cycles su CPU è lento. Su questo PC un pass serio è ore. Le alternative:

- **EEVEE Next** per i provini: minuti invece di ore, e per giudicare una
  silhouette basta;
- **Colab con T4 e OPTIX**: misurato **4,3 volte più veloce** della CPU locale.

---

## 2 · COLAB — e la correzione di oggi

**Stato:** CLI `colab` installata e autenticata. Due patch Windows obbligatorie
(vedi la skill `colab`).

### 2.1 · Per cuocere: funziona, ed è la via giusta per Cycles

`colab new --gpu T4`, si carica scena e copione, `colab exec --timeout <alto>`,
si scaricano i PNG, `colab stop`. **I cancelli sui risultati girano in locale.**

La trappola già pagata: su un runtime senza GPU `compute_device_type = 'OPTIX'`
**non solleva niente**, `get_devices()` torna solo la CPU, e Cycles ripiega su
CPU senza un avviso. Il codice deve fallire esplicitamente se OPTIX non c'è.

### 2.2 · Per il WebGL: oggi funziona, e ieri la mia nota diceva di no

Questa è la correzione di oggi, misurata:

```
GPU:             Tesla T4, driver 580.82.07
ICD EGL:         solo 50_mesa.json          ← mancavano le librerie utente
libEGL_nvidia:   assente
```

Una riga — `apt-get install -y libnvidia-gl-580` — e poi:

| argomenti | cosa vede Chromium |
|---|---|
| `--use-angle=gl` | ANGLE (Google, **SwiftShader**) |
| **`--use-angle=vulkan`** | **ANGLE (NVIDIA, Tesla T4)** |

**Solo `vulkan`.** Con `gl` si resta in software anche a librerie installate, e
non lo dice nessuno. Il cancello sul renderer resta obbligatorio.

**Quello che NON risolve:** il runner di GitHub Actions resta senza GPU. Colab
dà un posto dove misurare la **resa**, non un modo di far passare i cancelli
altrui.

---

## 3 · TRIPO E I GENERATORI 3D — dove servono e dove no

### 3.1 · Cosa sono disponibili

Dall'MCP di Blender: **Hyper3D Rodin** (`generate_hyper3d_model_via_text`,
`via_images`), **Hunyuan3D**, più i cataloghi **Poly Haven** (HDRI, texture,
modelli CC0) e **Sketchfab**. Tripo si usa dal suo sito e si importa il GLB.

### 3.2 · La regola d'uso, che è di voto e non di ammissibilità

Registrata in `docs/03-DECISIONI.md` (D61), e vale la pena ripeterla:

- **SÌ**: figure umane secondarie, basi dei mobili, elementi ambientali non
  protagonisti;
- **NO, senza pesante lavorazione**: yacht principale, stabilizzatore,
  propulsione, giroscopio, qualunque oggetto in primissimo piano.

Il motivo non è che l'IA sia vietata — **Awwwards non la vieta**. È che un asset
generativo che conserva anatomia generica, materiali uniformi e topologia
incoerente **viene penalizzato perché sembra un asset mediocre**, e il colpo
arriva su Design e Creativity.

> **Lo strumento può produrre la materia grezza; l'autorialità sta nella
> trasformazione e nel comportamento.**

### 3.3 · La condizione legale, da rispettare prima di generare

Registrata in D63: **account a pagamento** per gli asset definitivi, e
provenienza conservata — ricevuta, data, prompt, immagini sorgenti, file
originale, copia delle condizioni di quel giorno. Con l'account gratuito Tripo
dichiara di **trattenere** i diritti sugli output.

E sugli input: yacht generico senza marchio sì; **copia di uno stabilizzatore
brevettato o di uno yacht identificabile no**.

### 3.4 · TRIPO NON E' SOLO UN GENERATORE, ed e' l'errore che avevo fatto qui

**Correzione a quello che ho scritto sopra.** La CLI `tripo` e' installata,
autenticata e a pagamento: **860 crediti**, verificato con `tripo whoami`. E la
skill `stack-sito-immersivo` documenta un uso che non c'entra niente con la
generazione, misurato sul progetto `velocity` il 24 agosto:

    tripo model import <sorgente>                                    0 crediti
    tripo model convert <id> --format FBX --quad --face-limit 14000  10 crediti
    -> Blender, Subdivision Catmull-Clark 1 livello
    -> gltfpack -cc -vp 16 -vn 12

Cioe' **retopologia in quad**, non generazione. E i numeri:

| variante | residuo @25mm | p95 @25mm | peso |
|---|---|---|---|
| modello attuale (65k tri) | 0,840 mm | 4,165 mm | 683 kB |
| **quad + subdiv compresso** | **0,341 mm (-59%)** | **1,231 mm (-70%)** | **636 kB** |

Superficie piu' *fair* del 59% **e** file piu' leggero. Dieci crediti.

**Perche' riguarda nautica adesso.** Il primo punto dell'ordine dato per lo
yacht e' *silhouette e costruzione della sovrastruttura*, e la stessa skill
spiega come si riconosce il difetto: vernice a specchio con `normalScale=0`, si
guarda scorrere un riflesso, e **se si increspa le normali ondeggiano**. Su
`velocity` il riflesso era grumoso -- superficie non fair -- e la cura e' stata
questa catena.

Quindi Tripo qui serve, ma **non per inventare forme**: per rendere fair una
superficie che gia' esiste. E' l'opposto dell'uso che gli avevo assegnato dieci
righe piu' su.

### 3.5 · Dove userei un GENERATORE, concretamente

Poco, e per una ragione precisa. Gli oggetti che restano da fare sono quasi
tutti **vincolati**:

| cosa manca | generatore? | perché |
|---|---|---|
| traversata world-space | **no** | è spazio vincolato alla nave, in unità dichiarate |
| guscio del salone | **no** | sei piani e un buco, posizione misurata al mm |
| silhouette dello yacht | **no** | è la forma che il progetto sostiene |
| cappature delle sezioni | **no** | discendono dalla geometria dello scafo |
| **arredo del corridoio e del locale tecnico** | **sì** | complicato, non vincolato, mai protagonista |
| **ferramenta, prese d'aria, corrimano** | **forse** | vincolo di scala, non di forma: spesso più veloce a script |
| **HDRI d'ambiente** | **Poly Haven** | CC0, e uno è già stato consegnato |

Cioè: il generatore serve al **contorno** della traversata, non alla traversata.

---

## 3-bis · L'AUDIO C'E', ed e' l'altra cosa che mancava a questo documento

`.claude/skills/audio-elevenlabs/` -- skill provata sul campo, con `genera.py`
che usa solo la libreria standard.

    python genera.py voce   "Testo"                    out.mp3 --voce Daniel
    python genera.py sfx    "heavy metal door slam"     out.mp3 --sec 3
    python genera.py musica "calm corporate underscore" out.mp3 --sec 45

Chiave in `Ricevuti\help\.env`. Gli ID delle voci sono tabellati nella skill
**perche' l'API che le elenca e' bloccata su questa chiave**: senza quella
tabella si resterebbe a mani vuote. Effetti fino a 22 s; musica da 10 s a 5 min
con `force_instrumental: true` -- senza, la musica canta.

**Perche' riguarda nautica.** Il sesto punto dell'ordine e' la regia sonora, e i
sei strati ordinati dal revisore -- mare contro scafo e basse strutturali,
scricchiolii del salone, attuatore e albero, propulsione e giroscopio,
passaggio interno/esterno, UI -- sono **esattamente il repertorio di
`sound-generation`**. Il pacchetto consegnato oggi dichiara che i sei sample
professionali «non esistono ancora»: possono esistere in un pomeriggio.

Con due avvertenze che restano: il suono parte **solo dopo un gesto esplicito**
e resta disattivabile; e *«il silenzio dopo la stabilizzazione puo' valere piu'
di un ulteriore layer»*.

## 4 · LE SKILL CHE POSSO INVOCARE, e a cosa servono qui

| skill | quando la userei su nautica |
|---|---|
| `blender` | il metodo del fotorealismo, ricette bpy, i valori giusti e le trappole già pagate |
| `stack-sito-immersivo` | il fotorealismo **WebGL** — vernice, clearcoat, riflesso planare, e `trappole-misura-3d.md`, che vale più delle ricette |
| `render3d-in-video-reale` | quando un'animazione 3D «non trasmette emozione» |
| `colab` | GPU per le cotture, con le patch Windows |
| `audio-elevenlabs` | voce, effetti e musica: i sei strati della regia sonora |
| `watermark` | togliere la stella dai video Gemini/Veo, col rilevatore a due segnali |
| `valuta-awwwards` | stimare voto e tier con un rubric misurabile |
| `confronto-gemini` | far giudicare il sito da fuori, in confronto cieco |
| `ffmpeg` | ricodifiche, ritagli, misure sui filmati |

La più utile per il problema di adesso è **`stack-sito-immersivo`**, e in
particolare il suo `trappole-misura-3d.md`: non contiene ricette — quelle si
trovano ovunque — ma **i modi in cui una misura sbagliata sembra giusta**. È
esattamente il difetto che questo repo ha inseguito per tre giorni.

---

## 5 · SE DOVESSI SCEGLIERE UNA COSA SOLA

La traversata world-space, in Blender, da copione.

Perché è l'unico blocco che chiude un difetto che il revisore chiama **non
negoziabile** — *«un piano appeso alla camera che copre il 100% del quadro è un
nuovo film anche se vive dentro lo stesso renderer»* — e perché è anche
l'occasione per alzare la materia dello yacht: gli stessi bake, la stessa luce,
lo stesso spazio.

E ha un vincolo che va detto prima di cominciare: **le unità**. Un guscio
costruito in unità sbagliate non dà errore, dà un modello che non combacia — ed è
esattamente il modo in cui ho perso tre tentativi sul guscio del salone oggi.

---

## 6 · COSA NON POSSO FARE, dichiarato

- **misurare gli FPS di un telefono vero** da qui: né la CPU locale né la T4
  sono la scheda di un visitatore;
- **giudicare se un render è bello**: i cancelli impediscono il ritorno di
  errori noti, non decidono l'estetica;
- **i cinque test utenti**: servono cinque persone;
- **la provenienza degli asset Tripo**: l'account a pagamento c'e' (860
  crediti), ma ricevuta, data, prompt e condizioni del giorno vanno conservate
  da chi genera -- lo dice D63, e non e' automatico.
