# Il peso, i formati, e lo scorrimento del video

Ricerca misurata il **13 agosto 2026**. Nessun browser aperto: solo `curl`,
`ffmpeg 8.1.2` e `Pillow 11.3.0` su questa macchina, piu' la lettura dei
sorgenti dei siti gia' schedati in questa cartella.

**Questo documento serve a due cose diverse.** La prima e' decidere in che
formato servire le immagini e i video di un sito che deve pesare poco e
sembrare caro. La seconda e' operativa: c'e' un progetto in corso con **720
fotogrammi di un orologio (tre sequenze da 240) legati allo scroll**, e la
parte sullo scrubbing (capitoli 5, 6, 7, 8) e' scritta per quello. Il capitolo
9 e' la ricetta, con i comandi.

I file di lavoro stanno in
`C:\Users\Giuseppe\AppData\Local\Temp\claude\C--Users-Giuseppe\af92aa1b-5684-478e-851f-ed41dfd5b5b6\scratchpad`
(`img/` le prove di codifica, `seq/` i 200 fotogrammi Apple scaricati,
`vid/` le codifiche video, `pages/` l'HTML dei 20 siti).

**Documento gemello obbligatorio: `apple-prodotto.md`.** Li' dentro c'e' il
reverse engineering completo del motore di scrub di Apple (modulo `VideoScrub`,
MediaSource, i quattro video di iPhone Air misurati con `ffprobe`, il motore a
sequenza di Vision Pro riscritto in chiaro). Qui non lo ripeto: lo cito e ci
costruisco sopra. Se devi implementare, leggi tutti e due.

---

## 0. Il riassunto, se hai trenta secondi

**Immagini.** Su una foto vera a 1600x1066, a **qualita' pari** (stesso PSNR,
~38,5 dB): JPEG 103 KB, JPEG XL 60 KB, WebP 47 KB, **AVIF 26 KB**. AVIF sta a
**un quarto** del JPEG. Le due misure indipendenti fatte sui CDN veri di due
siti schedati dicono la stessa cosa: stesso file, stesso URL, cambia solo
l'header `Accept` -> Sanity 70.019 / 35.360 / **23.577** byte
(JPEG/WebP/AVIF), Prismic 96.956 / 55.606 / **32.807**. AVIF a **un terzo** del
JPEG in produzione, misurato due volte su due CDN diversi.

**Dove AVIF perde.** Alla qualita' alta. Sulla stessa foto, al livello piu' fine
provato, AVIF fa SSIM 0,9602 con 150.844 byte mentre **JPEG XL fa 0,9822 con
194.852** e il JPEG normale fa 0,9758 con 220.072. AVIF, spinto in alto, smette
di guadagnare e comincia a lisciare il dettaglio. E costa a decodificare: vedi
il capitolo 1.4. **JPEG XL non serve a niente sul web nel 2026** per il motivo
opposto: e' il formato migliore delle prove e non lo apre nessun browser
mainstream (capitolo 1.5).

**Cosa fanno davvero i siti premiati.** Ho contato le estensioni e i
`Content-Type` reali di **20 siti** di questa cartella. Il risultato ribalta i
manuali:

- **`<picture>` con `<source type="image/avif">` o `type="image/webp"`: ZERO su
  20.** Non uno. Il pattern che ogni articolo insegna non lo usa nessuno.
- **`srcset`: 11 su 20 non ce l'hanno affatto.** Chi ce l'ha, ce l'ha perche'
  glielo mette la piattaforma (Webflow, Shopify, Strapi), non per scelta.
- **`fetchpriority`: 6 su 20.** Il resto non dichiara nessuna priorita' sulla
  immagine piu' grande della prima schermata.
- Il modo vero in cui l'AVIF arriva sul telefono e' **il CDN che cambia formato
  in base all'`Accept`**, con l'estensione che resta `.jpg` nel markup.

**Video e scroll.** Le tre tecniche non sono equivalenti: **la sequenza di
immagini e' quella che fa esplodere il telefono**, e il numero che lo dimostra
e' questo -> 240 fotogrammi a 1220x1172 tenuti come `ImageBitmap` decodificati
occupano **1,28 GiB di RAM**. Le tue tre sequenze da 240 ne farebbero **3,8
GiB**. Un iPhone uccide la scheda molto prima.

**Il GOP.** Misurato da me sui 200 fotogrammi veri di Apple, H.264 CRF 20:

| GOP | peso | rispetto a GOP 250 |
|---|---|---|
| 1 (tutto intra) | 9.666.439 B | **2,68x** |
| 2 | 7.497.770 B | 2,08x |
| **4** (quello di Apple) | **5.338.210 B** | **1,48x** |
| 10 | 4.315.457 B | 1,19x |
| 30 | 3.859.649 B | 1,07x |
| 250 (normale) | 3.611.685 B | 1,00x |

**GOP 4 costa il 48% in piu' di un video normale e rende il seek istantaneo.**
Ed e' comunque **5,6 volte piu' leggero** della stessa sequenza in JPEG
(29.897.269 byte). Questo, e non altro, e' il motivo per cui Apple ha buttato le
sequenze di immagini.

**La ricetta per i 720 fotogrammi (capitolo 8): tre video, non 720 file.**
Tre `<video>` H.264 a GOP 4, uno per sequenza, scrubbati con `currentTime`, con
il primo fotogramma come immagine AVIF (che sara' anche l'LCP). Codificando le
tre sequenze alle dimensioni plausibili ho misurato un **tetto** di 9,98 MB su
desktop (1200x1200, CRF 23) e 2,99 MB su telefono (600x600) - ma il materiale di
prova e' molto piu' difficile da comprimere di un orologio su fondo pulito, per
cui l'attesa vera e' **3-5 MB su desktop e 1-1,5 MB su telefono**. La stessa
cosa fatta a immagini pesa **oltre 100 MB** alla qualita' di Apple.

---

## 1. I formati immagine nel 2026

### 1.1 Il metodo, perche' i confronti che si leggono in giro sono sbagliati

Quasi tutte le tabelle che circolano confrontano "JPEG qualita' 80" con "AVIF
qualita' 80". **Non vuol dire niente**: la scala di qualita' di ogni encoder e'
sua e non e' commensurabile con le altre. Un confronto onesto si fa in un modo
solo: si codifica lo stesso master a **molti** livelli, si misura la qualita'
risultante con una metrica oggettiva, e poi si legge il peso **al livello di
qualita' pari**.

Ho fatto cosi'. Master: file PNG senza perdita, ricavati da immagini vere prese
dai siti di questa cartella (non foto di prova sintetiche):

| master | origine | dimensioni | PNG |
|---|---|---|---|
| `m_foto` | fotografia del Frans Hals Museum, dal CDN Sanity, originale 6000x4000 | 1600x1066 | 1.056.727 B |
| `m_arch` | fotografia di architettura dal CDN Storyblok di `mosbyfiles.com` | 1034x1468 | 1.649.185 B |

Encoder: **JPEG** = libjpeg-turbo via Pillow, `optimize=True, progressive=True`;
**WebP** = libwebp `method=6`; **AVIF** = libavif/aom `speed=4`; **JPEG XL** =
`libjxl` via ffmpeg, `-effort 7`, pilotato a `-distance` (0,7 / 1,0 / 1,5 / 2,0
/ 3,0). Metriche: `ffmpeg -lavfi ssim` e `-lavfi psnr` contro il master.

**Avvertenza onesta, da tenere presente su tutti i numeri di questo capitolo:**
il mio JPEG e' libjpeg-turbo, non **mozjpeg**. mozjpeg (che e' quello che usano
imgix, Cloudinary e Sanity) recupera tipicamente il 10-15% a parita' di
qualita'. Quindi i vantaggi di AVIF e WebP che leggi qui sotto sono
**leggermente gonfiati** rispetto a un JPEG servito bene. Le misure sui CDN veri
(1.3) non hanno questo problema, perche' li' il JPEG e' il loro.

### 1.2 La foto: la tabella completa

`m_foto`, 1600x1066, fotografia museale (molto dettaglio, tessuti, volti).

| formato | livello | byte | SSIM | PSNR dB |
|---|---|---|---|---|
| JPEG | q40 | 68.090 | 0,9243 | 36,24 |
| JPEG | q50 | 78.722 | 0,9358 | 37,12 |
| JPEG | q60 | 90.324 | 0,9424 | 37,74 |
| JPEG | q70 | 109.638 | 0,9527 | 38,80 |
| JPEG | q80 | 142.145 | 0,9629 | 40,13 |
| JPEG | q90 | 220.072 | 0,9758 | 42,25 |
| WebP | q40 | 30.320 | 0,9290 | 36,19 |
| WebP | q50 | 34.834 | 0,9324 | 36,78 |
| WebP | q60 | 39.266 | 0,9373 | 37,29 |
| WebP | q70 | 44.158 | 0,9425 | 38,29 |
| WebP | q80 | 59.246 | 0,9500 | 39,56 |
| WebP | q90 | 110.740 | 0,9614 | 41,34 |
| **AVIF** | q40 | **18.655** | 0,9298 | 37,16 |
| **AVIF** | q50 | **26.334** | 0,9376 | 38,55 |
| AVIF | q60 | 39.471 | 0,9440 | 39,94 |
| AVIF | q70 | 52.857 | 0,9468 | 40,75 |
| AVIF | q80 | 75.312 | 0,9512 | 41,58 |
| AVIF | q90 | 150.844 | 0,9602 | 42,95 |
| JPEG XL | d3,0 | 61.534 | 0,9596 | 39,20 |
| JPEG XL | d2,0 | 84.079 | 0,9666 | 40,70 |
| JPEG XL | d1,5 | 104.780 | 0,9708 | 41,84 |
| JPEG XL | d1,0 | 145.767 | 0,9774 | 43,33 |
| JPEG XL | d0,7 | 194.852 | **0,9822** | **44,72** |

**Letta a PSNR pari (~38,5 dB), interpolando fra i punti misurati:**

| formato | byte a ~38,5 dB | rispetto al JPEG |
|---|---|---|
| JPEG | ~103.000 | 100% |
| JPEG XL | ~60.000 | 58% |
| WebP | ~46.600 | 45% |
| **AVIF** | **~26.400** | **26%** |

**Letta a SSIM pari (~0,950):** JPEG ~103.000, WebP 59.246, AVIF 75.312.
Qui **AVIF perde contro WebP**. Non e' un errore: e' il fenomeno vero. AVIF
guadagna moltissimo nella fascia bassa e media (a 18-26 KB e' imbattibile) e
smette di guadagnare salendo, perche' il suo modo di risparmiare bit e'
**lisciare** - cosa che il PSNR premia e l'SSIM punisce. Se il tuo caso e' "una
foto grande e nitida che deve reggere lo zoom", AVIF non e' automaticamente la
risposta.

### 1.3 La verifica in produzione: due CDN veri, stessa URL, `Accept` diverso

Questa e' la misura piu' importante del capitolo, perche' non e' fatta da me con
i miei encoder: e' fatta dalle pipeline di due CDN veri, su due siti di questa
cartella, sullo stesso file, cambiando **solo** l'header `Accept` della
richiesta.

**Sanity** (il CDN di `franshalsmuseum.nl` e di `basement.studio`), stessa
immagine ridimensionata a `w=1200` con `auto=format`:

```
Accept: */*                          -> image/jpeg   70.019 B
Accept: image/webp,*/*               -> image/webp   35.360 B   (50,5%)
Accept: image/avif,image/webp,*/*    -> image/avif   23.577 B   (33,7%)
```

**Prismic/imgix** (il CDN di `noomoagency.com` e `zajno.com`), stessa immagine a
2400x1260 con `auto=format,compress`:

```
Accept: */*                          -> image/jpeg   96.956 B
Accept: image/webp,*/*               -> image/webp   55.606 B   (57,4%)
Accept: image/avif,image/webp,*/*    -> image/avif   32.807 B   (33,8%)
```

**Due CDN indipendenti, due immagini diverse, stesso verdetto: AVIF sta a un
terzo del JPEG, WebP a poco piu' della meta'.** E il JPEG di partenza qui e' il
loro, ottimizzato bene. Questo e' il numero da usare in un preventivo.

**Shopify** invece si ferma a WebP. `pangrampangram.com`, stesso URL `.jpg`:

```
Accept: */*                          -> image/jpeg   83.632 B
Accept: image/webp,*/*               -> image/webp   39.910 B   (47,7%)
Accept: image/avif,image/webp,*/*    -> image/webp   39.910 B   (nessun AVIF)
```

Al 13/08/2026 il CDN di Shopify **non serve AVIF** nemmeno se il browser lo
chiede. Se un cliente e' su Shopify, l'AVIF non ce l'hai e non e' colpa tua.

**Webflow** e **Strapi** non negoziano affatto: servono il file che c'e', con
l'estensione che ha. `landonorris.com` -> `.webp` sempre, per tutti;
`obys.agency` -> `.webp` sempre, per tutti. **Storyblok** (`mosbyfiles.com`)
idem: se nel CMS c'e' un `.avif`, serve `image/avif` anche a chi non l'ha
chiesto.

### 1.4 Quando AVIF perde: le quattro situazioni

1. **Alla qualita' molto alta** (vedi 1.2): sopra i ~40 dB di PSNR il vantaggio
   si assottiglia e sull'SSIM AVIF finisce dietro a WebP e molto dietro a JPEG
   XL. Foto di prodotto grandi, still di gioielleria, tessuti: verificare a
   occhio prima di dare per scontato il risparmio.
2. **Sulle immagini piccole.** Sotto i ~100x100 px l'intestazione di un AVIF
   (contenitore ISOBMFF: `ftyp`, `meta`, `iloc`, `iprp`...) pesa piu' del
   risparmio. Per icone e avatar minuscoli si resta su PNG o SVG.
3. **Sulla grafica piatta con testo netto e sui tracciati**: li' vince **SVG**,
   e a distanza. Non e' un caso che `basement.studio` abbia **92 SVG** contro 23
   WebP (capitolo 2).
4. **Sul costo di decodifica.** E' il punto che nessuno mette nelle tabelle e
   che conta moltissimo nel caso dei 720 fotogrammi: AVIF si decodifica con un
   decoder AV1, che e' molto piu' pesante di un decoder JPEG. Misurato su questa
   macchina (media di 8 decodifiche complete verso rawvideo, quindi include
   l'avvio del processo - il valore assoluto non e' quello del browser, ma **il
   rapporto fra formati si', ed e' il rapporto che serve**):

   **Decodifica in-process** (Pillow, mediana di 25 decodifiche complete dello
   stesso buffer in memoria, nessun costo di processo):

   | file | dimensioni | byte | decodifica |
   |---|---|---|---|
   | `0100.jpg` (fotogramma vero Apple) | 1220x1172 | 180.438 | **24,37 ms** |
   | stesso fotogramma in AVIF q60 | 1220x1172 | 32.938 | 29,01 ms (1,19x) |
   | stesso fotogramma in WebP q60 | 1220x1172 | 26.880 | 37,54 ms (1,54x) |
   | `foto` JPEG q70 | 1600x1066 | 109.638 | 69,72 ms |
   | `foto` AVIF q50 | 1600x1066 | 26.334 | 78,49 ms |
   | `foto` WebP q80 | 1600x1066 | 59.246 | 168,76 ms |

   **Il JPEG e' il piu' veloce dei tre, sempre.** Non di dieci volte: di 1,2-1,5
   volte rispetto ad AVIF e WebP a parita' di immagine. Ma attenzione, il numero
   che conta davvero e' quello assoluto nella prima riga: **24 ms per
   decodificare un fotogramma da 1220x1172, nel formato piu' veloce che c'e'**.

   Su desktop non te ne accorgi. In una sequenza a 60 fotogrammi al secondo,
   dove hai **16,7 ms** per fotogramma e dentro ci devi anche disegnare, la
   differenza fra decodificare un JPEG e decodificare un AVIF e' la differenza
   fra un'animazione fluida e una a scatti. **Per le sequenze di fotogrammi si
   usa JPEG, non AVIF.** E' anche cio' che fa Apple: i 200 fotogrammi di Vision
   Pro sono `0000.jpg`...`0199.jpg`, e i 1.527 di AirPods Pro erano JPEG
   (`apple-prodotto.md`).

### 1.5 JPEG XL: il migliore che non puoi usare

Nelle mie prove JPEG XL e' il formato con la curva qualita'/peso piu' bella in
assoluto nella fascia alta: **SSIM 0,9822 a 194.852 byte**, dove il JPEG per
arrivare a 0,9758 ne spende 220.072 e l'AVIF si ferma a 0,9602 con 150.844. Ha
anche due proprieta' che nessun altro ha: la **ricompressione senza perdita di
un JPEG esistente** (~20% in meno, reversibile bit a bit) e il vero lossless
progressivo.

**E non lo apre nessun browser che ti serve.** Al 13/08/2026: Safari lo supporta
(da Safari 17, macOS Sonoma / iOS 17); Chrome ha rimosso il supporto
sperimentale nel 2023 e non l'ha rimesso; Firefox lo ha solo dietro flag in
Nightly. Un formato supportato da un solo motore su tre non e' un formato web:
e' un formato d'archivio. **Verdetto: non entra in nessun sito consegnato a un
cliente nel 2026.** Vale la pena conoscerlo per due motivi soltanto: se il
cliente e' un museo o un archivio fotografico (li' il lossless e la
ricompressione JPEG contano davvero), e per sapere che la fine della storia dei
formati non e' AVIF.

> **Da riverificare prima di citarlo a un cliente.** Lo stato del supporto
> browser sopra e' quello che risulta dalla documentazione a mia disposizione;
> non l'ho confermato oggi su `caniuse` perche' in questa sessione non ho aperto
> un browser ne' avuto ricerca web disponibile. **Il resto del capitolo e'
> misurato da me e non dipende da questa nota.**

### 1.6 La regola pratica

| cosa | formato | perche' |
|---|---|---|
| foto, in generale | **AVIF** con fallback **WebP** | un terzo del JPEG, misurato su due CDN |
| foto enormi che devono reggere lo zoom | **WebP q80-85** o JPEG mozjpeg | AVIF liscia il dettaglio (1.2) |
| logo, icone, tracciati, testo | **SVG** | non ha rivali, e si anima |
| trasparenza semplice | **WebP** | AVIF con alfa e' supportato ma piu' fragile |
| **fotogrammi di una sequenza** | **JPEG** | decodifica veloce, e' l'unica cosa che conta (1.4) |
| immagini < 100x100 | PNG o SVG | l'intestazione AVIF costa piu' del risparmio |
| archivio, museo | JPEG XL, ma fuori dal sito | non lo apre Chrome |


---

## 2. Cosa usano davvero i 20 siti gia' schedati

Metodo: `curl -sL` sull'HTML della home dei 20 siti, con `User-Agent` di Chrome
141. Poi estrazione con espressione regolare di ogni URL che finisce in
un'estensione immagine o video, dentro gli attributi **e** dentro il JS inline e
i payload JSON (`__NEXT_DATA__`, Storyblok, Strapi, Prismic). Conteggio delle
occorrenze, non dei file unici. Poi sonda `curl` sul `Content-Type` reale.

**Limite dichiarato subito:** l'HTML iniziale non e' tutto. Su `igloo.inc` (1.410
byte di guscio) e `zajno.com` (10.959 byte) non c'e' quasi niente da contare: il
sito si costruisce in JS e i loro asset veri non sono in questo censimento. Su
questi due i numeri sono per forza sottostimati.

### 2.1 La tabella, sito per sito

Occorrenze per estensione nell'HTML della home.

| sito | immagini | video | note sul `Content-Type` reale |
|---|---|---|---|
| `basement.studio` | **svg 92**, webp 23, jpg 16, png 12, gif 4 | mp4 11 | CDN Sanity; i video su `cdn.sanity.io/files/` |
| `darkroom.engineering` | png 10, jpg 4 | mp4 7, webm 2 | Next.js su Vercel |
| `cuberto.com` | svg 22, jpg 20, png 16, webp 4 | mp4 14, webm 1 | `<picture>` x19 ma **solo per il 2x**, mai per il formato |
| `obys.agency` | **webp 200**, png 2, svg 1 | webm 1 | Strapi (`cms.obys.agency`): serve `image/webp` a tutti, sempre |
| `locomotive.ca` | png 10, jpg 9, svg 1 | mp4 1, webm 1 | |
| `lusion.co` | png 5, svg 1, jpg 1 | webm 1 | HTML quasi vuoto, il grosso e' nel bundle |
| `igloo.inc` | png 2, jpg 2 | - | **guscio da 1.410 byte**, non conta |
| `by-kin.com` | **jpg 354**, png 20, svg 2 | mp4 17 | Strapi (`cms.by-kin.com`) |
| `landonorris.com` | **webp 239**, png 98, svg 42 | - | Webflow: **tutto gia' `.webp`**, nessuna negoziazione |
| `mosbyfiles.com` | **avif 101**, png 19, svg 4 | mp4 1 | Storyblok: serve `image/avif` **anche a chi non lo chiede** |
| `revelatio.studio` | **png 128**, webp 10, jpeg 1 | - | Webflow. 128 PNG sono i fotogrammi di un'animazione |
| `2xa.studio` | jpg 10, png 2 | **mp4 8** | Kirby, media dal proprio dominio |
| `trionn.com` | svg 22, png 11, jpg 4 | mp4 4 | |
| `zajno.com` | png 3, webp 2, svg 1 | - | Prismic; HTML da 10.959 byte, non conta |
| `pangrampangram.com` | **jpg 106**, svg 74, webp 24, png 12 | mp4 1, webm 1 | Shopify: `.jpg` nel markup, **`image/webp` sul filo**, mai AVIF |
| `opalcamera.com` | jpg 4, **avif 3** | mp4 2 | `<picture>` vera con art direction; video su **Mux** |
| `manayerbamate.com` | svg 64, jpg 63, png 13, webp 1 | webm 1 | Shopify |
| `franshalsmuseum.nl` | **jpg 839**, svg 19, png 4 | mp4 2 | Sanity con `auto=format`: `.jpg` nel markup, **AVIF sul filo** |
| `noomoagency.com` | png 39, svg 15 | mp4 2 | Prismic/imgix con `auto=format`: **AVIF sul filo** |
| `hellomonday.com` | **mp4 63**, jpg 52, png 21, svg 1 | webm 1 | 63 mp4 in una sola home |

### 2.2 I conteggi aggregati

**Su quanti dei 20 siti compare almeno una volta l'estensione:**

| estensione | siti su 20 |
|---|---|
| `.png` | **19** |
| `.svg` | 15 |
| `.jpg` / `.jpeg` | 15 |
| `.mp4` | 13 |
| `.webp` | 8 |
| `.webm` | 8 |
| **`.avif`** | **2** |
| `.gif` | 1 |
| **`.jxl`** | **0** |

**Occorrenze totali su tutti e venti:**

| estensione | occorrenze |
|---|---|
| `.jpg`/`.jpeg` | **1.485** |
| `.webp` | 503 |
| `.png` | 427 |
| `.svg` | 361 |
| `.mp4` | 133 |
| `.avif` | 104 |
| `.webm` | 9 |
| `.gif` | 4 |
| `.jxl` | **0** |

### 2.3 Le cinque cose che questo censimento dice davvero

**1. L'AVIF nel markup e' raro; l'AVIF sul filo no.** Solo 2 siti su 20 scrivono
`.avif` nell'HTML (`mosbyfiles.com` con 101 occorrenze, `opalcamera.com` con 3).
Ma **`franshalsmuseum.nl` e `noomoagency.com` servono AVIF** a un browser
moderno pur avendo `.jpg` e `.png` nel markup, perche' il CDN lo converte in
base all'`Accept` (misure nel capitolo 1.3). **L'estensione nel sorgente non
dice il formato che arriva.** Chi conta le estensioni e conclude "usano ancora
JPEG" sta sbagliando misura. Il conto onesto: 2 siti dichiarano AVIF, **almeno
altri 2 lo servono senza dichiararlo**, i restanti 16 no.

**2. `<picture>` con `type` non lo usa nessuno.** Zero su venti. Nemmeno i due
che usano `<picture>` lo fanno per il formato: `cuberto.com` ha 19 `<picture>`
ma dentro c'e' `<img src="1.png" srcset="1@2x.png 2x">` - e' per la densita';
`opalcamera.com` ha 1 `<picture>` ed e' per **l'art direction** (immagine diversa
sotto e sopra 1024 px), con AVIF in entrambi i rami. Il pattern
`<picture><source type="image/avif"><source type="image/webp"><img></picture>`
che sta in ogni tutorial e' **assente dal web premiato**. Il motivo e' economico:
e' triplo lavoro in build e triplo storage, e la negoziazione lato CDN ottiene
lo stesso risultato con una URL sola.

**3. Il PNG e' ovunque e non e' un errore.** 19 siti su 20, 427 occorrenze.
Guardando cosa sono: favicon, immagini Open Graph, loghi, sprite di UI, e in un
caso (`revelatio.studio`, 128 PNG) i fotogrammi di un'animazione. Il PNG resta
il formato di servizio.

**4. L'SVG e' il vero formato dei siti premiati.** 361 occorrenze, 15 siti.
`basement.studio` ha **piu' SVG (92) che immagini raster di ogni tipo messe
insieme (55)**. Un sito che sembra caro e' fatto in gran parte di tracciati, non
di fotografie: e i tracciati non pesano e si animano.

**5. Il video vive in `.mp4`, non in `.webm`.** 133 mp4 contro 9 webm, 13 siti
contro 8. Il doppio formato (webm per Chrome + mp4 per Safari) che Apple usa
sugli scrub (`apple-prodotto.md`) e' un lusso da azienda con la propria pipeline
di encoding: gli studi consegnano un mp4 H.264 e via. `hellomonday.com` da solo
ha **63 mp4 nella home**.

---

## 3. srcset, sizes, art direction, priorita' e LCP

### 3.1 Quanti li usano davvero (misurato sui 20 siti)

| attributo | siti su 20 che lo usano | occorrenze totali |
|---|---|---|
| `srcset` | **9** | 259 |
| `sizes` | 9 | 302 |
| `loading="lazy"` | 14 | 517 |
| `fetchpriority` | **6** | 45 |
| `<picture>` | **2** | 20 |

Chi ha piu' `srcset`: `landonorris.com` 95 (glieli mette Webflow),
`franshalsmuseum.nl` 83 (Sanity), `obys.agency` 38 (Strapi),
`pangrampangram.com` 35 (Shopify), `manayerbamate.com` 30 (Shopify),
`by-kin.com` 29 (Strapi). **In tutti e sei i casi e' la piattaforma a farlo, non
lo studio.** Gli studi che scrivono l'HTML a mano - `darkroom.engineering`,
`locomotive.ca`, `lusion.co`, `hellomonday.com`, `mosbyfiles.com`,
`noomoagency.com`, `trionn.com` - hanno **`srcset` zero**.

**Non e' una raccomandazione, e' un dato.** Ma spiega una cosa utile: nel web
premiato la strategia responsive non passa da `srcset`, passa da **due siti
diversi** (Obys, Zajno, Dogstudio, Aristide Benoist servono markup diverso - sta
in `INDICE.md`) o da **una URL sola con parametri di CDN**.

### 3.2 Le regole con i numeri

**`sizes` sbagliato e' peggio che non avere `srcset`.** `sizes` dice al browser
quanto sara' larga l'immagine *prima* che il CSS sia applicato. Se scrivi
`sizes="100vw"` per un'immagine che poi sta in una colonna da 400 px su uno
schermo da 1600, il browser scarica la variante da 1600w: hai peggiorato la
situazione rispetto a un `<img>` semplice. `sizes` deve rispecchiare i
breakpoint veri del CSS, per esempio
`sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`.

**`sizes="auto"` risolve il problema, ma solo con `loading="lazy"`.**
`<img loading="lazy" sizes="auto" srcset="...">` fa calcolare al browser la
larghezza reale dopo il layout. Funziona **solo** su immagini pigre, per
definizione: sull'immagine sopra la piega non e' utilizzabile, ed e' proprio li'
che servirebbe.

**I gradini del `srcset` si scelgono, non si generano tutti.** Gradini di
**circa 1,4x-1,5x** in larghezza (400, 600, 900, 1300, 1900), non ogni 100 px:
il salto piu' piccolo non si vede e moltiplica lo storage. Webflow su
`landonorris.com` usa **2 soli gradini** per immagine (`-p-500.webp 500w` e
l'originale `736w`) e quel sito e' Site of the Year 2025.

**La densita' (`2x`) e la larghezza (`w`) non si mescolano.** O `srcset="a.jpg
1x, b.jpg 2x"` (e allora niente `sizes`), o `srcset="a.jpg 400w, b.jpg 800w"` +
`sizes`. `cuberto.com` usa la prima forma, Webflow la seconda.

**Il DPR: il dato controintuitivo di questa cartella.** `lando-norris.md`
registra un **DPR invertito** - 1,25x su desktop e 2x su telefono - e
`umami-land.md` lo stesso (1x desktop, >=1,5x telefono). Non e' un errore: sul
telefono la superficie e' piccola, quindi il 2x costa pochi byte e si vede
tantissimo; sul desktop il 2x su un'immagine a piena larghezza costa una fortuna
e si vede poco. **Il 2x va speso dove lo schermo e' piccolo.**

### 3.3 Art direction: quando serve davvero `<picture>`

`<picture>` con `media` (non con `type`) ha un solo scopo: **cambiare
inquadratura**, non risoluzione. L'esempio vero, da `opalcamera.com`:

```html
<picture>
  <source media="(min-width: 1024px)" srcset="/images/desktop-first-frame-long-may6.avif">
  <img src="/images/mobile-first-frame-may6.avif" alt="" fetchPriority="high"
       class="absolute inset-0 h-full w-full object-cover z-[2] ...">
</picture>
```

Due file diversi, non due tagli dello stesso: quello desktop e' "long"
(orizzontale, largo), quello mobile e' verticale. Piu' `fetchPriority="high"`
sull'immagine che e' l'LCP. **Questo unico elemento fa tre cose giuste in una
riga** ed e' l'unico `<picture>` sensato trovato in venti siti.

Il caso limite piu' istruttivo della cartella e' `dark-netflix.md`: sul telefono
**le foto sono altre foto**, 886x1024 verticali contro 2048x1152 orizzontali.
Non un ritaglio: un'altra fotografia.

### 3.4 LCP: le regole con i numeri

**La soglia.** LCP "buono" = **<= 2,5 s** al 75esimo percentile degli utenti
reali; "da migliorare" fino a 4,0 s; sopra e' "scarso". Il 75esimo percentile
significa che il tuo utente peggiore su quattro deve stare sotto 2,5 s - non la
media, non il tuo Mac.

**La scomposizione, che e' la cosa utile.** L'LCP si spacca in quattro pezzi, e i
budget di riferimento sono:

| pezzo | budget | cosa lo rovina |
|---|---|---|
| Time to First Byte | ~40% (0,8 s) | server lento, redirect, niente CDN |
| ritardo di **scoperta** della risorsa | **~10% (0,25 s)** | l'immagine trovata tardi |
| caricamento della risorsa | ~40% (1,0 s) | l'immagine pesa troppo |
| ritardo di rendering | ~10% (0,25 s) | JS che blocca, font |

Il pezzo che si sbaglia sempre e' il secondo. Quattro modi di scoprire tardi
l'immagine piu' importante, tutti presenti nei siti di questa cartella:

1. **L'immagine e' uno sfondo CSS.** Il browser la scopre solo dopo aver
   scaricato e applicato il CSS. Se e' l'LCP, va in `<img>`.
2. **L'immagine e' inserita da JavaScript.** Peggio: dopo il bundle.
3. **L'immagine ha `loading="lazy"`.** Errore classico: `lazy` sopra la piega
   **ritarda** il caricamento. 14 siti su 20 usano `lazy`; non ho verificato
   quanti lo mettano anche sulla prima immagine, ma e' l'errore piu' comune del
   mestiere.
4. **C'e' un preloader che copre tutto.** Ed e' il rischio specifico di questo
   genere di siti. `_PRELOADER.md` misura che la pagina parte prima che la
   copertura sia via, mediana **~450 ms**: quei 450 ms escono dal budget.

**Le due contromisure, con la sintassi:**

```html
<!-- 1. dichiarare la priorita' sull'unica immagine che conta -->
<img src="hero.avif" fetchpriority="high" decoding="async" alt="...">

<!-- 2. anticiparne la scoperta, se sta dentro un componente che arriva dopo -->
<link rel="preload" as="image" href="hero.avif"
      imagesrcset="hero-800.avif 800w, hero-1600.avif 1600w"
      imagesizes="100vw" fetchpriority="high">
```

**`fetchpriority="high"` va messo su una sola immagine.** Se lo metti su cinque,
non hai dato priorita' a niente. Sui 20 siti solo 6 lo usano;
`pangrampangram.com` lo usa 23 volte, che e' quasi certamente troppo.

**E la contromisura che nessuno considera: non avere un'immagine LCP.** Il
candidato LCP puo' essere un blocco di testo. Se la prima schermata e' un titolo
enorme in un font gia' precaricato, l'LCP e' quel titolo e arriva in centinaia di
millisecondi. Diversi siti di questa cartella lo fanno per caso; farlo apposta e'
una scelta di progetto legittima e gratis.

**Attenzione al font.** Un titolo LCP con un web font e `font-display: block`
sposta l'LCP alla fine del download del font. `font-display: swap` piu'
`<link rel="preload" as="font" crossorigin>` e' il minimo.

---

## 4. Il video: codec e politiche di riproduzione automatica

### 4.1 I tre codec, e quando conviene ciascuno

| | **H.264 / AVC** | **VP9** | **AV1** |
|---|---|---|---|
| contenitore | `.mp4` | `.webm` | `.mp4` o `.webm` |
| eta' | 2003 | 2013 | 2018 |
| decodifica hardware | **ovunque**, da 15 anni | quasi ovunque su Android; su Apple solo software fino ai chip recenti | **solo su chip recenti** |
| supporto browser | totale | totale tranne casi Safari/iOS | Chrome/Firefox si', Safari dai chip che lo decodificano |
| alfa (trasparenza) | no | **si'** (`alpha_mode=1`) | si', ma poco usato |
| peso a qualita' pari | 100% | ~65-70% | ~50% (rispetto ad H.264) |

I numeri dell'ultima riga sono **noti in letteratura, non misurati qui**: la mia
prova di codifica (capitolo 6) ha usato CRF diversi per codec e un problema di
allineamento dei fotogrammi ha reso il confronto incrociato non valido. Il
confronto **dentro lo stesso codec** (la curva del GOP) invece e' valido, ed e'
quello che serve.

**Quando conviene ciascuno, in pratica:**

- **H.264** e' la scelta di default, e nel web premiato e' quasi l'unica: 133
  `.mp4` contro 9 `.webm` sui 20 siti (capitolo 2.2). Si decodifica in hardware
  su qualunque cosa abbia uno schermo, consuma pochissima batteria, e per un
  video di sfondo da 5-10 secondi la differenza di peso con AV1 non vale la
  complicazione di servire due file.
- **VP9** ha una ragione sola per esistere in questo mestiere, e non e' il peso:
  **e' l'unico che porta la trasparenza in un video**. Se ti serve un video con
  canale alfa su fondo variabile, VP9 in WebM e' la strada su Chrome/Firefox, e
  su Safari serve HEVC in `.mov` con tag `hvc1`. E' esattamente cio' che fa
  Apple sul modulo fotocamera di iPhone Air (`apple-prodotto.md`: `.webm` VP9
  con `alpha_mode=1` per tutti, `.mov` HEVC per Safari).
- **AV1** conviene quando il video e' lungo e pesante e il pubblico e' recente:
  dimezza i byte. **Non conviene per lo scrubbing** e non conviene su un
  pubblico misto, per il motivo del paragrafo seguente.

### 4.2 Il costo di decodifica sul telefono, che e' il punto vero

Un video si decodifica in due modi: **in hardware** (un blocco di silicio
dedicato, consumo bassissimo, non tocca la CPU) o **in software** (la CPU
decodifica fotogramma per fotogramma, con tutto quello che comporta). La
differenza non e' del 20%: e' di **un ordine di grandezza** in consumo, e su un
telefono si manifesta in tre modi - la batteria che cala a vista, il telefono
che scotta, e il sistema che riduce la frequenza della CPU (thermal throttling)
facendo crollare i fotogrammi al secondo di **tutta la pagina**, non solo del
video.

La regola operativa che ne discende:

- **H.264 Baseline/Main/High fino a 1080p: hardware ovunque.** E' l'unica
  garanzia assoluta che esista.
- **VP9: hardware sulla gran parte degli Android**, software su parecchi
  dispositivi Apple. Per un video di 3-4 secondi non e' un problema; per un
  video di sfondo in loop su un telefono, si'.
- **AV1: hardware solo sui chip recenti** (grosso modo Apple A17 Pro / M3 in
  avanti, Snapdragon 8 Gen 2 in avanti, Intel dalla 12a generazione con grafica
  Arc). Su tutto il resto e' **software**. Un AV1 1080p decodificato in software
  su un telefono di fascia media e' il modo piu' rapido di far scaldare un
  dispositivo e mandare l'animazione a 20 fotogrammi al secondo.

> **Verificato / plausibile.** Che i tre codec abbiano questi profili di
> supporto hardware e' consolidato ma **non l'ho misurato in questa sessione**:
> non ho aperto un browser ne' un telefono. Le liste esatte dei chip vanno
> riverificate prima di scriverle in un documento per un cliente. Cio' che e'
> **verificato nei fatti** e' la scelta di Apple: sui quattro video di scrub di
> iPhone Air **non c'e' nessun AV1** (`apple-prodotto.md`, letto nel codice), e
> Apple ha tutte le ragioni economiche per usarlo se fosse conveniente.

**Conseguenza per i 720 fotogrammi: niente AV1.** Un video scrubbato viene
decodificato in continuazione, avanti e indietro, mentre l'utente scorre. E' il
carico peggiore che esista. Si usa H.264, che ha la decodifica hardware ovunque.

### 4.3 La riproduzione automatica nel 2026: cosa serve e cosa non si puo' piu' fare

**La regola generale**, dalla guida MDN sull'autoplay:

> "you can assume that media will be allowed to autoplay only if *at least one*
> of the following is true: The audio is muted or its volume is set to 0; The
> user has interacted with the site (by clicking, tapping, pressing keys, etc.);
> If the site has been allowlisted [...]; If the autoplay Permissions Policy is
> used to grant autoplay support to an `<iframe>`"

E la distinzione che conta:

> "Autoplay blocking is *not* applied to `<video>` elements when the source
> media does not have an audio track, or if the audio track is muted. Media with
> an active audio track are considered to be **audible**, and autoplay blocking
> applies to them. **Inaudible** media are not affected by autoplay blocking."

**Tradotto: un video senza traccia audio non e' soggetto al blocco.** Non
"muto": **senza traccia audio**. Sono due cose diverse e la seconda e' piu'
robusta. Per un video decorativo o di scrub, si toglie l'audio in codifica con
`-an` e il problema non esiste.

**Le politiche WebKit su iOS, testuali** (webkit.org, "New `<video>` Policies
for iOS"):

> "On iPhone, `<video playsinline>` elements will now be allowed to play inline,
> and will not automatically enter fullscreen mode when playback begins."

> "`<video muted>` elements will also be allowed to autoplay without a user
> gesture."

> "If a `<video>` element gains an audio track or becomes un-muted without a
> user gesture, playback will pause."

> "`<video autoplay>` elements will only begin playing when visible on-screen
> such as when they are scrolled into the viewport, made visible through CSS,
> and inserted into the DOM."

> "`<video>` elements will be allowed to `autoplay` without a user gesture if
> their source media contains no audio tracks."

**Il markup minimo che parte da solo, ovunque, nel 2026:**

```html
<video autoplay muted playsinline loop preload="metadata"
       poster="poster.avif" disableRemotePlayback>
  <source src="clip.mp4" type="video/mp4">
</video>
```

Cinque attributi, tutti necessari, ciascuno per un motivo diverso:

- `muted` - senza questo non parte niente, da nessuna parte;
- `playsinline` - **senza questo su iPhone il video va a schermo intero da
  solo**. E' l'errore piu' visibile e piu' comune;
- `autoplay` - ovvio, ma su iOS non basta da solo;
- `loop` - se serve;
- `preload="metadata"` - non `auto`: `auto` scarica tutto il file subito e
  compete con l'LCP. Per lo scrub invece serve `auto` (capitolo 5.2);
- `poster` - l'immagine che si vede prima, ed e' spesso il vero LCP;
- `disableRemotePlayback` - toglie il pulsante AirPlay su un video decorativo.

**Cosa NON si puo' piu' fare nel 2026:**

1. **Far partire un video con l'audio senza che l'utente abbia toccato la
   pagina.** Chiuso ovunque, senza eccezioni tecniche. L'unica via e' partire
   muti e mettere un pulsante di attivazione audio (`_SUONO.md` documenta come
   lo risolvono i siti premiati).
2. **Togliere il muto via JavaScript durante la riproduzione.** WebKit e'
   esplicito: il video **si mette in pausa**. Non e' che l'audio non parte: si
   ferma il video.
3. **Dare per scontato che `play()` funzioni.** Ritorna una Promise che va
   gestita, altrimenti in console resta un rifiuto non catturato e a schermo un
   video fermo:

   ```js
   const p = video.play();
   if (p !== undefined) {
     p.catch(err => {
       if (err.name === "NotAllowedError") mostraPulsantePlay(video);
     });
   }
   ```
4. **Contare sull'autoplay in risparmio energetico.** In Low Power Mode su iOS
   l'autoplay viene negato. La documentazione di `scrolly-video` lo dice in
   chiaro: *"On iOS, ScrollyVideo will not work if battery saver mode is on"*, e
   aggiunge che iOS gestisce video e risparmio energetico in modi che **non si
   possono aggirare**. Va progettato il piano B, non tentato l'aggiramento.
5. **Far partire un video fuori schermo.** WebKit: parte solo quando e'
   visibile. Se il tuo codice presuppone che il video sia gia' avviato quando
   l'utente ci arriva, su iPhone non lo e'.

**Lo strumento per saperlo prima:** `navigator.getAutoplayPolicy("mediaelement")`
restituisce `"allowed"`, `"allowed-muted"` o `"disallowed"`, e permette di
decidere il piano B **prima** di provare invece che dopo il fallimento.

---

## 5. Lo scrubbing: legare un filmato allo scorrimento

Tre tecniche. Non sono equivalenti e non e' una questione di gusto.

### 5.1 Tecnica A - sequenza di fotogrammi su `<canvas>`

L'idea: N immagini, un `<canvas>`, e a ogni evento di scroll si disegna
`drawImage(immagini[i], 0, 0)`.

**E' la tecnica del tutorial classico** (CSS-Tricks, *"Let's Make One of Those
Fancy Scrolling Animations Used on Apple Product Pages"*), che usa **148
fotogrammi JPEG** presi dal CDN di Apple e li precarica cosi':

```js
const preloadImages = () => {
  for (let i = 1; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
  }
};
const updateImage = index => { img.src = currentFrame(index); context.drawImage(img, 0, 0); };
```

Lo stesso autore avverte che *"loading hundreds of images will always result in
a bloated page"*, e cita il caso reale della pagina AirPods Pro: **"1,609
requests, 55.8 megabytes transferred"** con trenta secondi di caricamento.

**I numeri veri, misurati** (fonte: `apple-prodotto.md`, piu' i miei download di
oggi):

| | AirPods Pro 2019 | Vision Pro 2024 | la mia misura di oggi |
|---|---|---|---|
| fotogrammi | **1.527** | 200 | 200 (scaricati uno a uno) |
| formato | JPEG | JPEG `0000.jpg`...`0199.jpg` | JPEG |
| risoluzione | - | 1220x1172 (`large`) | 1220x1172 |
| peso desktop | **66,01 MB** | 28,35 MB | **29.897.269 B** |
| peso telefono | 26,61 MB | 12,27 MB (`small`, 768x736) | - |
| retina 2x | **rinunciato** (`retinaEnabled = false`) | nessuna variante `_2x` | - |
| richieste HTTP | ~1.527 | 200 | 200 |

Ho riscaricato oggi i 200 fotogrammi `large` di Vision Pro dal CDN Apple: **200
file, 29.897.269 byte**, `Last-Modified` gennaio 2024, tutti ancora online.

**Pregi.** Controllo assoluto: puoi disegnarci sopra, comporre due sequenze,
applicare un filtro, andare avanti e indietro senza nessun costo di seek. E'
l'unica tecnica in cui il fotogramma N e' *sempre* immediatamente disponibile
una volta caricato. Funziona identica su ogni browser: non c'e' niente da
supportare, e' `drawImage`.

**Difetti, in ordine di gravita'.**

1. **La memoria.** E' il capitolo 7 e da sola squalifica la tecnica sopra un
   certo numero di fotogrammi.
2. **Il peso.** 5,6 volte il video equivalente (capitolo 6).
3. **Le richieste.** 200-1500 richieste HTTP, che su HTTP/2 sono meno gravi di
   una volta ma non gratis.
4. **Il tempo di decodifica.** Misurato da me sul fotogramma vero: **24,37 ms
   per un JPEG 1220x1172**, nel formato piu' veloce. Se decodifichi al volo
   mentre l'utente scorre, hai un tetto di ~41 fotogrammi al secondo **prima**
   di disegnare qualsiasi cosa. Va tutto pre-decodificato, il che ci riporta al
   punto 1.

**Le due cose da rubare al motore Apple** (riscritte in chiaro in
`apple-prodotto.md`, capitolo "MOTORE B"), che sono la differenza fra una
sequenza usabile e una inguardabile:

- **L'ordine di caricamento a suddivisione binaria.** Non si caricano i
  fotogrammi 0,1,2,3... Si prende sempre l'elemento centrale dell'intervallo
  residuo: prima il fotogramma 100, poi 50 e 150, poi 25/75/125/175, e cosi'
  via. **Dopo sette immagini su duecento** hai gia' un campione uniforme di
  tutta l'animazione: e' gia' percorribile da capo a fondo, solo a scatti, e si
  infittisce mentre l'utente scorre. Caricando in ordine, finche' non sei
  all'80% del download hai solo l'80% iniziale.
- **Il fallback al piu' vicino caricato.** Se il fotogramma richiesto non c'e'
  ancora, si cerca all'indietro il piu' vicino disponibile, e se non c'e' in
  avanti. **Non si lascia mai il canvas vuoto.** Unito al punto precedente,
  l'utente non vede mai un buco.

### 5.2 Tecnica B - un `<video>` normale con `currentTime` forzato

L'idea: un `<video>`, e a ogni scroll si scrive `video.currentTime = durata *
progresso`.

**E' quello che fa Apple oggi**, e il codice ricostruito dal loro bundle e' due
righe (`apple-prodotto.md`):

```js
this.videoEl.currentTime = this.floorDecimal(this.duration * p); // arrotondato a 2 decimali
```

**Un `<video>`, non un canvas, non `<img>`. Niente `drawImage`, niente
`requestVideoFrameCallback`.** Questa e' la sorpresa del reverse engineering:
la casa che ha inventato la tecnica delle sequenze oggi scrive un numero dentro
una proprieta' e basta.

**Perche' funziona per Apple e non per chi ci prova la prima volta.** Perche'
scrivere `currentTime` chiede al decoder di saltare a un punto, e il decoder
**deve ripartire dall'ultimo keyframe precedente e ricostruire tutti i
fotogrammi fino a li'**. Su un video codificato normalmente (GOP 250) un salto
all'indietro puo' costare la ricostruzione di 249 fotogrammi. Ecco perche' il
`currentTime` "e' scattoso": non lo e' la tecnica, lo e' la codifica. **Con GOP
4 il decoder ricostruisce al massimo tre fotogrammi.** Il capitolo 6 e' tutto su
questo.

Le altre cose che servono:

- **`preload="auto"`.** Non puoi scrubbare quello che non hai scaricato.
- **Arrotondare `currentTime`.** Apple tronca a 2 decimali: cosi' due eventi di
  scroll molto vicini non generano due seek. Senza, si accodano richieste di
  seek che il decoder non riesce a smaltire.
- **Non aspettare l'evento `seeked` per disegnare.** Il seek e' asincrono: se
  costruisci una catena "scrivi `currentTime` -> aspetta `seeked` -> scrivi il
  prossimo", introduci un ritardo che si accumula. Si scrive e basta, e si
  lascia che il decoder scarti i seek superati.
- **`requestVideoFrameCallback`** se devi sincronizzare qualcos'altro al
  fotogramma effettivamente mostrato: e' l'unico modo di sapere *quale*
  fotogramma e' a schermo, con i metadati (`mediaTime`). Baseline dall'ottobre
  2024. Per lo scrub puro non serve.

**Dove si rompe.** Su iOS il `<video>` deve avere `playsinline` e `muted`, e in
Low Power Mode il comportamento cambia. Su Android di fascia bassa il seek
continuo su un video ad alta risoluzione puo' comunque saturare il decoder: la
contromisura e' **abbassare la risoluzione sul telefono**, non cambiare tecnica.

**Peso, fluidita', memoria:** peso minimo (e' un video); fluidita' ottima **se e
solo se** il GOP e' corto; memoria bassissima e costante - il browser tiene in
RAM pochi fotogrammi, non tutti. **E' questo il vantaggio decisivo sulla tecnica
A.**

### 5.3 Tecnica C - Media Source Extensions / ManagedMediaSource

L'idea: invece di lasciare che il browser scarichi il video, glielo si passa a
pezzi con `appendBuffer`, cosi' il video **diventa scrubbabile prima di essere
completo**.

Il codice, ricostruito dal bundle Apple (`apple-prodotto.md`):

```js
const ms = new MediaSource();
video.src = URL.createObjectURL(ms);
ms.addEventListener("sourceopen", () => {
  const sb = ms.addSourceBuffer('video/webm;codecs="vp9"');
  // appendBuffer pezzo per pezzo, aspettando onupdateend
});
```

**Su Safari, MSE non c'e' - c'e' ManagedMediaSource.** Il MediaSource classico
non e' mai stato disponibile su iPhone. WebKit ha introdotto
**ManagedMediaSource**, che *"provides the capabilities of Media Source
Extensions (MSE) without its drawbacks"*, gestendo meglio buffer, rete e
consumo. Cronologia: Safari 17.0 su iPad e Mac, **esteso a iPhone in Safari
17.1** (iOS 17). Con una condizione da ricordare: *"ManagedMediaSource support
requires either an AirPlay source alternative or explicitly disabled remote
playback"* - cioe' serve `disableRemotePlayback` sul `<video>`, altrimenti non
funziona.

**Quando serve davvero.** Quasi mai, per un sito. Serve se:
- il video di scrub e' grosso e vuoi che diventi percorribile prima della fine
  del download (il caso Apple: quattro scrub, ~10 MB in totale);
- vuoi cambiare qualita' a meta' strada in base alla banda.

**Quando non serve.** Se il tuo video di scrub pesa 1-2 MB, MSE aggiunge un
sacco di codice, un contenitore frammentato da preparare
(`-movflags frag_keyframe+empty_moov+default_base_is_moof`) e un ramo Safari
diverso, per risparmiare qualche centinaio di millisecondi. **Per i 720
fotogrammi non serve.**

### 5.4 Le librerie esistenti, e cosa dicono i loro autori

**`scrolly-video`** (Daniel Kao, `github.com/dkaoster/scrolly-video`) e' la
libreria di riferimento. Ha **tre strategie di rendering**, che vale la pena
conoscere perche' sono esattamente la mappa del problema:

1. **WebCodecs + canvas.** *"Using the new WebCodecs API we are able to get all
   frames in the video and have them ready to draw to a canvas."* Prestazioni
   ottime, ma richiede tempo di elaborazione prima che l'animazione sia
   disponibile, e la documentazione la da' come funzionante **solo su Chrome**.
2. **`<video>` + `playbackRate`.** *"This method modulates the `playbackRate`
   attribute on the video in order to dynamically mimic a faster or slower
   scroll speed."* Fluidissima in avanti, **inutilizzabile all'indietro** perche'
   `playbackRate` non puo' essere negativo.
3. **`<video>` + `currentTime`.** *"This method requires the video to be encoded
   at keyframe = 1, which causes the video to be a lot larger or the quality to
   drop."* E la nota importante: **su Safari mobile e' questa a comportarsi
   meglio**, nonostante i suoi limiti.

La raccomandazione di codifica della libreria e' esplicita: *"it is still
recommended to encode videos with keyframe = 1, if possible"*. Cioe' **GOP 1**,
tutto intra. Apple usa GOP 4. La differenza fra i due, in byte, e' nel capitolo
6 - e in un caso reale e' il 45% di peso.

Opzioni utili della libreria, che segnalano due problemi veri:
`frameThreshold` (default 0,1 s) = quando fermare l'animazione, e
`transitionSpeed` (default 8) = il tetto di `playbackRate`.

### 5.5 WebCodecs: la quarta tecnica

`VideoDecoder` dell'API WebCodecs permette di decodificare i fotogrammi a mano,
fuori dal `<video>`, e disegnarli su canvas. In teoria e' la soluzione perfetta:
il peso e la decodifica hardware del video, il controllo del canvas.

In pratica, nel 2026, ha due problemi. Il primo e' il supporto: `scrolly-video`
la usa **solo su Chrome**. Il secondo e' che se decodifichi tutti i fotogrammi e
li tieni, sei tornato al problema di memoria della tecnica A: un `VideoFrame`
non decodificato costa poco, uno decodificato costa larghezza x altezza x 4.
`VideoFrame` ha un metodo `close()` e **va chiamato**, altrimenti la pagina
esaurisce la memoria in pochi secondi.

> **Non verificato in questa sessione**: lo stato preciso del supporto WebCodecs
> in Safari 2026. Da controllare prima di costruirci sopra.

---

## 6. Il GOP: la distanza fra keyframe decide tutto

### 6.1 Perche'

Un video compresso ha due tipi di fotogrammi: i **keyframe** (o I-frame), che
contengono un'immagine intera e si decodificano da soli, e tutti gli altri
(P e B), che contengono **solo la differenza** rispetto ai vicini. Il **GOP**
(Group of Pictures) e' la distanza fra due keyframe.

Quando scrivi `video.currentTime = X`, il decoder non puo' saltare al fotogramma
X: **deve trovare l'ultimo keyframe prima di X e ricostruire tutti i fotogrammi
da li' fino a X.** Con GOP 250 puo' voler dire ricostruire 249 fotogrammi per
mostrarne uno. Con GOP 4, tre.

Ecco perche' "il `currentTime` e' scattoso" e' una diagnosi sbagliata. Non e'
scattoso il `currentTime`: e' scattoso **il tuo file**.

### 6.2 La misura, sui 200 fotogrammi veri di Apple

Sorgente: i 200 JPEG `1220x1172` di Vision Pro scaricati oggi. Codifica a 30
fps, stesso CRF dentro ogni codec, cambia **solo** il GOP. Comandi:

```bash
ffmpeg -framerate 30 -i %04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 20 -preset medium \
  -x264-params "keyint=$G:min-keyint=$G:scenecut=0" -an out.mp4
ffmpeg -framerate 30 -i %04d.jpg -c:v libvpx-vp9 -pix_fmt yuv420p -crf 28 -b:v 0 \
  -row-mt 1 -g $G -keyint_min $G -auto-alt-ref 0 -an out.webm
```

| GOP | **H.264** CRF 20 | vs GOP 250 | **VP9** CRF 28 | vs GOP 250 | **AV1** CRF 32 | vs GOP 250 |
|---|---|---|---|---|---|---|
| 1 (tutto intra) | 9.666.439 | **2,68x** | 18.411.872 | **5,18x** | 4.508.862 (*) | 2,46x |
| 2 | 7.497.770 | 2,08x | 10.194.002 | 2,87x | 4.257.177 | 2,33x |
| **4** | **5.338.210** | **1,48x** | **6.396.671** | **1,80x** | **3.052.042** | **1,67x** |
| 10 | 4.315.457 | 1,19x | 4.600.402 | 1,29x | 1.869.382 | 1,02x |
| 30 | 3.859.649 | 1,07x | 3.880.138 | 1,09x | 1.807.451 | 0,99x |
| 250 | 3.611.685 | 1,00x | 3.555.593 | 1,00x | 1.830.849 | 1,00x |

(*) SVT-AV1 **non ha rispettato** `-g 1` (nel log dichiara `gop size 161`):
quella cella non e' attendibile. Le altre righe AV1 hanno il GOP dichiarato
corretto nel log.

**Keyframe contati con `ffprobe` a conferma:** `h264_g4.mp4` = **50 keyframe su
200 fotogrammi** (esattamente uno ogni 4); `h264_g250.mp4` = **1 keyframe su
200**. La codifica ha fatto quello che le ho chiesto.

### 6.3 Come si legge questa tabella

**Il compromesso, in una riga: GOP 4 costa il 48% in piu' di un video normale
(su H.264) e in cambio rende il seek istantaneo.**

Gli altri tre numeri che contano:

1. **GOP 1 (tutto intra), che la documentazione di `scrolly-video` raccomanda,
   costa 2,68x su H.264 e 5,18x su VP9.** Su VP9 e' insostenibile. **GOP 4 di
   Apple e' la scelta giusta**, e la differenza fra GOP 1 e GOP 4 su H.264 e'
   9,67 MB contro 5,34 MB: **il 45% in meno per una fluidita' che a occhio e' la
   stessa** (tre fotogrammi ricostruiti invece di zero, a 30 fps, sono 100 ms di
   video: il decoder li fa in una frazione di millisecondo).
2. **Oltre GOP 10 non si guadagna quasi piu' peso e si perde tutto lo scrub.**
   Da 10 a 250 il file cala solo del 16% su H.264, ma i fotogrammi da
   ricostruire passano da 9 a 249. **Il ginocchio della curva sta fra 4 e 10.**
3. **Un articolo di terzi trova la stessa cosa con numeri diversi**
   (`muffinman.io/blog/scrubbing-videos-using-javascript/`, citato in
   `apple-prodotto.md`): passando da un keyframe ogni 100 a uno ogni 5 il file
   cresce **circa cinque volte** (146 KB -> 845 KB in mp4, 195 KB -> 1038 KB in
   webm). Il fattore e' piu' alto del mio perche' il loro sorgente e' piu'
   statico: **piu' il contenuto e' immobile, piu' i keyframe costano in
   proporzione**. Un orologio che ruota su fondo fisso e' contenuto "statico":
   aspettati un fattore piu' vicino al loro che al mio.

### 6.4 Il confronto che decide la tecnica

| stessa animazione, 200 fotogrammi 1220x1172 | peso |
|---|---|
| sequenza JPEG (quella vera di Apple, `large`) | **29.897.269 B** |
| H.264 GOP 4 CRF 20 | **5.338.210 B** |
| H.264 GOP 1 CRF 20 (tutto intra) | 9.666.439 B |
| H.264 GOP 250 (non scrubbabile) | 3.611.685 B |

**Il video a GOP 4 pesa 5,6 volte meno della sequenza di immagini, e resta
scrubbabile.** Anche nella versione tutto-intra pesa **3,1 volte meno**.

Questo, e non altro, e' il motivo per cui Apple in sette anni e' passata da
1.527 JPEG per 66 MB a quattro video per 10 MB. Nella tabella comparativa di
`apple-prodotto.md`: **un sesto del peso, un terzo dei fotogrammi, quattro
richieste invece di millecinquecento, e in piu' il retina**.

---

## 7. Il conto della memoria: perche' le sequenze fanno esplodere il telefono

### 7.1 La formula

Un'immagine **decodificata** in memoria non pesa quanto il suo file. Pesa:

```
larghezza x altezza x 4 byte     (RGBA, 8 bit per canale)
```

Il file JPEG e' compresso; l'`ImageBitmap`, la texture, il contenuto del canvas
sono **bitmap crude**. La compressione sparisce nel momento in cui il fotogramma
entra in memoria.

### 7.2 I numeri veri, sul caso reale

Fotogramma Apple Vision Pro `large`, **1220x1172**:

| | valore |
|---|---|
| file JPEG sul disco | 180.438 B (~176 KB) |
| **stesso fotogramma decodificato** | 1220 x 1172 x 4 = **5.719.360 B = 5,45 MiB** |
| **rapporto** | **31,7 volte** |

E allora:

| fotogrammi | memoria a 1220x1172 |
|---|---|
| 200 (la sequenza Apple) | **1.090,9 MiB = 1,07 GiB** |
| **240 (una tua sequenza)** | **1.309,1 MiB = 1,28 GiB** |
| **720 (le tue tre sequenze)** | **3.927,2 MiB = 3,84 GiB** |

**3,84 GiB.** Non e' un margine da ottimizzare: e' piu' della RAM totale di
buona parte dei telefoni in circolazione, ed e' molto piu' di quanto un singolo
tab di Safari possa allocare prima di essere terminato.

E anche a risoluzioni piu' modeste il conto non si salva da solo:

| risoluzione | 1 fotogramma | 240 | 720 |
|---|---|---|---|
| 1220x1172 (Apple `large`) | 5,45 MiB | 1.309 MiB | **3.927 MiB** |
| 780x1688 (iPhone 15 a 2x) | 5,02 MiB | 1.205 MiB | 3.616 MiB |
| 900x900 (quadrato) | 3,09 MiB | 742 MiB | 2.225 MiB |
| 750x1334 | 3,82 MiB | 916 MiB | 2.748 MiB |
| 600x600 (quadrato piccolo) | 1,37 MiB | 330 MiB | **989 MiB** |
| 390x844 (iPhone 15 a 1x) | 1,26 MiB | 301 MiB | 904 MiB |

**Anche a 600x600 - che su un telefono e' piccolo - le tre sequenze da 240
costano quasi un giga.** Non esiste una risoluzione accettabile a cui tenere 720
fotogrammi decodificati in memoria.

### 7.3 Cosa succede quando si sfora, su iOS

Safari su iOS ha un limite di memoria per scheda molto piu' rigido di quello di
un browser desktop, e quando lo si supera **non rallenta: uccide la scheda** e
mostra "A problem repeatedly occurred". L'utente non vede un'animazione lenta,
vede il tuo sito che si ricarica da solo - e nel caso peggiore, in ciclo.

> **Verificato / plausibile.** Il comportamento (terminazione della scheda con
> quel messaggio al superamento del limite di memoria) e' noto e ampiamente
> documentato dagli sviluppatori, ma **non l'ho riprodotto in questa sessione**
> e non esiste un numero ufficiale pubblicato da Apple per la soglia. I conti
> della sezione 7.2 sono invece aritmetica sulle dimensioni reali dei
> fotogrammi, e non dipendono da questa nota.

### 7.4 Le sei contromisure, se la sequenza e' obbligatoria

1. **Non tenere `ImageBitmap`, tieni `Blob` o `<img>` con `decoding="async"`.**
   Un `<img>` lascia al browser la liberta' di buttare la bitmap decodificata
   quando serve memoria; un `ImageBitmap` che tieni tu no.
2. **Finestra scorrevole.** Tieni decodificati solo i fotogrammi intorno alla
   posizione corrente - per esempio 30 avanti e 15 indietro - e chiudi gli
   altri. Con `ImageBitmap` significa chiamare **`.close()`**: non e'
   facoltativo, e' l'unico modo di restituire la memoria subito.
3. **Suddivisione binaria** (capitolo 5.1): riduce il numero di fotogrammi che
   devono esistere contemporaneamente perche' l'animazione sia percorribile.
4. **Risoluzione diversa per fascia.** Apple serve `large` / `medium` / `small`
   con **un solo file per fascia, senza `_2x`**. Su un telefono un fotogramma
   768x736 (2,16 MiB decodificato) invece di 1220x1172 (5,45 MiB) e' **2,5 volte
   meno memoria**.
5. **`createImageBitmap` in un Web Worker con `OffscreenCanvas`.** Non riduce la
   memoria, ma toglie la decodifica dal thread principale: l'animazione non si
   inchioda mentre si decodifica. Il trasferimento dell'`ImageBitmap` al thread
   principale e' a costo zero (`transferable`).
6. **Salta i fotogrammi sul telefono.** Se hai 240 fotogrammi, sul telefono
   usane 120 (uno su due). A 30 fps di scroll nessuno vede la differenza, e la
   memoria si dimezza.

**Ma la vera contromisura e' non usare la sequenza.** Un `<video>` scrubbato
tiene in memoria una manciata di fotogrammi, indipendentemente da quanti ne
contenga il file. La memoria non cresce con la lunghezza dell'animazione. **E'
questo, non il peso, il motivo per cui il video vince.**

---

## 8. La ricetta per i 720 fotogrammi dell'orologio

### 8.1 La decisione, e perche'

**Tre video H.264 a GOP 4, uno per sequenza, scrubbati con `currentTime`.**
Non 720 file. Non MediaSource. Non AV1. Non WebCodecs.

Le ragioni, tutte gia' misurate sopra:

| | sequenza di immagini | **tre video GOP 4** |
|---|---|---|
| peso | 5,6x (cap. 6.4) | **1x** |
| richieste HTTP | 720 | **3** |
| memoria a 240 fotogrammi | 1,28 GiB (cap. 7.2) | pochi fotogrammi, costante |
| memoria a 720 fotogrammi | **3,84 GiB** | **invariata** |
| decodifica | 24,37 ms per fotogramma sulla CPU (cap. 1.4) | hardware |
| complessita' del codice | alta (bucket, fallback, cache) | **due righe** |

E soprattutto: **e' quello che fa oggi la casa che ha inventato la tecnica
opposta**. Apple e' passata da 1.527 JPEG (66 MB) a 4 video (10 MB) e nel loro
codice il cuore dello scrub e' `this.videoEl.currentTime = ...`.

### 8.2 I pesi attesi, misurati

Ho codificato i 200 fotogrammi veri di Apple alle tre risoluzioni plausibili per
un orologio, H.264 GOP 4, `preset slow`, ed esteso il conto a tre sequenze:

| fascia | risoluzione | CRF | una sequenza | **tre sequenze** |
|---|---|---|---|---|
| desktop | 1200x1200 | 20 | 5.225.918 B | 15.310 KB (14,9 MB) |
| desktop | 1200x1200 | **23** | 3.488.721 B | **10.220 KB (9,98 MB)** |
| medio | 900x900 | 20 | 3.212.577 B | 9.411 KB |
| medio | 900x900 | **23** | 2.134.080 B | **6.252 KB (6,1 MB)** |
| telefono | 600x600 | 20 | 1.536.837 B | 4.502 KB |
| telefono | 600x600 | **23** | 1.043.675 B | **3.057 KB (2,99 MB)** |

**Questi sono un tetto massimo, non la stima.** Il contenuto di prova e' una
persona che ruota di 360 gradi in un ambiente reale, con sfondo dettagliato: e'
materiale difficile da comprimere. **Un orologio che ruota su fondo pulito o
scuro comprime molto meglio**, perche' gran parte dell'inquadratura e' immobile
e i P-frame diventano quasi vuoti. Aspettati grosso modo **da un terzo alla
meta'** di questi numeri, cioe' realisticamente:

- **desktop: 3-5 MB per tutte e tre le sequenze**
- **telefono: 1-1,5 MB per tutte e tre**

Contro i **25-90 MB** che la stessa cosa peserebbe a immagini (30 MB ogni 200
fotogrammi alla qualita' Apple; 720 fotogrammi sono 3,6 volte tanto).

Da confermare con una prova sul materiale vero appena esiste il primo render:
sono due comandi.

### 8.3 I comandi di codifica

**Dai fotogrammi al video, per fascia.** Da ripetere per ognuna delle tre
sequenze (`s1`, `s2`, `s3`) e per ognuna delle tre fasce:

```bash
# desktop 1200x1200
ffmpeg -framerate 30 -i frames/s1/%04d.png \
  -vf "scale=-2:1200:flags=lanczos,crop=1200:1200" \
  -c:v libx264 -pix_fmt yuv420p -crf 23 -preset slow \
  -x264-params "keyint=4:min-keyint=4:scenecut=0" \
  -movflags +faststart -an s1_1200.mp4

# telefono 600x600
ffmpeg -framerate 30 -i frames/s1/%04d.png \
  -vf "scale=-2:600:flags=lanczos,crop=600:600" \
  -c:v libx264 -pix_fmt yuv420p -crf 23 -preset slow \
  -x264-params "keyint=4:min-keyint=4:scenecut=0" \
  -movflags +faststart -an s1_600.mp4
```

**Le sei cose da non sbagliare in questa riga di comando:**

1. **`keyint=4:min-keyint=4`** - entrambi. Solo `keyint` non basta: senza
   `min-keyint` l'encoder e' libero di distanziare i keyframe.
2. **`scenecut=0`** - spegne l'inserimento automatico di keyframe sui cambi di
   scena. Con GOP 4 non serve e disturba la regolarita'.
3. **`-movflags +faststart`** - sposta l'indice (`moov`) all'inizio del file.
   **Senza questo il video non e' scrubbabile finche' non e' scaricato tutto**,
   perche' il browser non sa dove stanno i fotogrammi. E' l'errore che fa
   sembrare rotta una codifica per il resto perfetta.
4. **`-an`** - nessuna traccia audio. Non e' solo peso: un video **senza traccia
   audio** e' esente dal blocco dell'autoplay (capitolo 4.3), che e' una
   garanzia piu' forte di `muted`.
5. **`-pix_fmt yuv420p`** - obbligatorio per la compatibilita'. `yuv444p` non lo
   riproducono tutti.
6. **`-preset slow`** e non `veryslow`: la differenza in byte e' marginale, il
   tempo di codifica raddoppia. Si codifica una volta sola, ma lo si rifara'
   venti volte durante il progetto.

**Verifica obbligatoria dopo ogni codifica**, che il GOP sia davvero quello:

```bash
ffprobe -v error -select_streams v -show_entries frame=key_frame -of csv=p=0 s1_1200.mp4 | grep -c '^1'
# su 240 fotogrammi deve dare 60. Se da' 1, hai sbagliato i parametri.
```

### 8.4 Il markup

```html
<div class="scrub" data-scrub>
  <video data-scrub-video
         playsinline muted preload="auto" disableRemotePlayback
         poster="s1_first.avif"></video>
</div>
```

Niente `autoplay` e niente `loop`: **il video non deve mai riprodursi da solo**,
lo muove solo lo scroll. `preload="auto"` invece serve, ed e' l'opposto del
consiglio per i video decorativi: non puoi scrubbare quello che non hai.

La sorgente si assegna in JS in base alla fascia, cosi' non si scaricano tutte
e tre le risoluzioni:

```js
const w = window.innerWidth * Math.min(window.devicePixelRatio, 2);
const fascia = w <= 900 ? 600 : (w <= 1400 ? 900 : 1200);
video.src = `/media/s1_${fascia}.mp4`;
```

### 8.5 Il motore, in venti righe

```js
// 1. mappa scroll -> progresso, con ScrollTrigger come solo sensore
//    (il pattern di trionn.com: ScrollTrigger non anima, misura e basta)
let progresso = 0, richiesto = 0, girando = false;

ScrollTrigger.create({
  trigger: ".scrub", start: "top top", end: "+=200%", pin: true, scrub: true,
  onUpdate: self => { richiesto = self.progress; avvia(); }
});

// 2. si scrive currentTime, arrotondato, una volta per fotogramma di schermo
function avvia() { if (!girando) { girando = true; requestAnimationFrame(passo); } }
function passo() {
  progresso += (richiesto - progresso) * 0.15;              // smorzamento
  const t = Math.floor(video.duration * progresso * 100) / 100;  // 2 decimali, come Apple
  if (Math.abs(video.currentTime - t) > 0.008) video.currentTime = t;
  if (Math.abs(richiesto - progresso) > 0.0005) requestAnimationFrame(passo);
  else girando = false;
}
```

Le quattro decisioni dentro queste righe:

- **`Math.floor(... * 100) / 100`**: e' letteralmente quello che fa Apple
  (`floorDecimal(this.duration * p)` a 2 decimali). Serve a non generare due
  seek per due eventi di scroll a un millesimo di distanza.
- **La soglia `0.008`**: non riscrivere `currentTime` se il salto e' piu' piccolo
  di un quarto di fotogramma. Ogni scrittura e' un seek, e i seek inutili sono
  il motivo principale per cui uno scrub sembra scattoso.
- **Lo smorzamento a 0,15**: e' l'inerzia. Puo' anche farlo Lenis a monte
  (`stack-sito-immersivo` e `darkroom.md` per i valori veri), ma un filo di
  smorzamento **anche qui** serve, perche' il decoder gradisce salti piccoli e
  regolari piu' di salti grossi e radi.
- **Non aspettare `seeked`.** Si scrive e si va avanti. Se il decoder e'
  indietro, il seek successivo annulla il precedente ed e' esattamente cio' che
  vogliamo.

**La coreografia fra le tre sequenze.** Da `apple-prodotto.md`: la
decelerazione **non si fa con una curva di easing**, si fa spezzando la mappa
scroll->tempo in tratti a pendenza diversa (Apple: `0 -> 0,87` in 85vh, poi
`0,87 -> 1` in 90vh). Piu' facile da regolare a occhio e piu' facile da
spiegare a un cliente. Per tre sequenze: tre `ScrollTrigger` consecutivi, ognuno
con la sua altezza in `vh`, e le altezze sono il ritmo del racconto.

### 8.6 Il piano B, che e' la parte che nessuno fa

Da `apple-prodotto.md`, la terza cosa da rubare: **un cancello unico, un budget
di tempo, e la causa registrata.**

1. **Una classe sola su `<html>`** decide se la pagina e' animata. Il CSS
   nasconde i contenitori di scrub in sua assenza
   (`.scrub{display:none}` senza la classe), e i componenti non si montano. Cosi'
   non esiste lo stato "meta' vivo".
2. **Un budget di caricamento** - Apple usa 6 secondi. Scaduto, **tutta la
   pagina** torna statica invece di restare a meta'.
3. **Il fotogramma zero come immagine vera.** Il `poster` (`s1_first.avif`) e'
   con ogni probabilita' il tuo LCP: va servito in AVIF, con `fetchpriority`
   alto, ed e' cio' che vede chi ha il risparmio energetico attivo, chi ha
   `prefers-reduced-motion`, e chi ha una connessione lenta.
4. **`prefers-reduced-motion: reduce`** -> nessuno scrub, solo il poster. Non e'
   gentilezza, e' l'European Accessibility Act (`_ACCESSIBILITA.md`).
5. **Registrare la causa** del declassamento (`"reduced motion"`, `"low power"`,
   `"timeout"`, `"viewport"`), cosi' si sa **quanti utenti hanno visto
   l'animazione e perche' gli altri no**. E' la parte che rende la tecnica
   sostenibile nel tempo, ed e' quella che non copia mai nessuno.

### 8.7 La checklist di consegna

- [ ] `ffprobe` conferma 60 keyframe su 240 per ogni file
- [ ] `-movflags +faststart` su tutti i file (verificare che `moov` sia in testa)
- [ ] nessuna traccia audio (`-an`)
- [ ] `playsinline` e `muted` sul `<video>`, niente `autoplay`
- [ ] tre risoluzioni, scelte in JS prima di assegnare `src`
- [ ] poster in AVIF con `fetchpriority="high"`
- [ ] `prefers-reduced-motion` porta al poster statico
- [ ] budget di caricamento con ritorno alla pagina statica
- [ ] provato su un iPhone vero **con il risparmio energetico attivo**
- [ ] provato lo scroll all'indietro veloce (e' li' che si rompe)
- [ ] misurato l'LCP: **il poster, non il video**

---

## 9. Non verificato

Questa parte e' vincolante quanto le altre. Cio' che segue **non e' misurato** e
non va citato a un cliente senza controllarlo.

- **Non ho aperto nessun browser.** Nessun FPS durante lo scrub, nessun
  Lighthouse, nessun LCP/CLS/INP reale, nessun profilo di memoria vero. Tutti i
  numeri di memoria del capitolo 7 sono **aritmetica** su dimensioni reali, non
  letture di un profiler.
- **Non ho provato niente su un telefono.** Il capitolo 4.2 (decodifica hardware
  per codec) e il 7.3 (terminazione della scheda su iOS) sono consolidati nella
  pratica ma **non riprodotti qui**. Le liste di chip con decodifica AV1 in
  hardware vanno riverificate.
- **Il supporto browser di JPEG XL, WebCodecs e `getAutoplayPolicy`** non e'
  stato confermato oggi su `caniuse`: in questa sessione la ricerca web era
  esaurita e non ho aperto un browser. Il verdetto su JPEG XL (capitolo 1.5) e'
  robusto per altre vie, ma le versioni esatte no.
- **Il confronto incrociato fra codec (H.264 vs VP9 vs AV1) non e' valido.** Ho
  usato CRF diversi per codec, e il calcolo di qualita' contro il riferimento
  senza perdita e' risultato incoerente (PSNR 31,7 dB per H.264 e AV1 contro
  48,1 dB per VP9, con lo stesso identico valore per quattro file diversi: e'
  quasi certamente uno sfasamento di un fotogramma nell'allineamento, non una
  differenza di qualita'). **Le curve del GOP dentro ogni singolo codec restano
  valide**, perche' li' cambia solo il GOP. I rapporti di efficienza fra codec
  citati al capitolo 4.1 sono di letteratura, non miei.
- **La codifica AV1 a GOP 1 e' sbagliata**: SVT-AV1 ha ignorato `-g 1` e nel log
  dichiara `gop size 161`. Quella cella della tabella 6.2 va scartata.
- **Il censimento dei 20 siti guarda solo l'HTML iniziale della home.** Non ho
  seguito i bundle JS, quindi su `igloo.inc` e `zajno.com` i conteggi sono per
  forza sottostimati, e su tutti gli altri mancano gli asset caricati in seguito.
  Non ho misurato il **peso totale** di nessuna delle 20 home: solo i
  `Content-Type` e alcuni pesi campione.
- **Non ho verificato quanti dei 14 siti con `loading="lazy"` lo mettano anche
  sopra la piega** (capitolo 3.4, punto 3). E' l'errore piu' comune del
  mestiere, ma qui e' un'affermazione generale, non una misura su questi siti.
- **La stima dei pesi per l'orologio (8.2) e' un'estrapolazione**, non una
  misura sul materiale vero: il contenuto di prova e' piu' difficile da
  comprimere di un orologio su fondo pulito. Va rifatta sul primo render vero.
- **Il valore assoluto dei tempi di decodifica (1.4) e' quello di Pillow su
  questa macchina, non quello di un browser.** libjpeg-turbo, libwebp e
  libavif/aom non sono i decoder di Chrome (che per AVIF usa dav1d, piu'
  veloce). **Il rapporto fra formati e' indicativo; il valore assoluto no.**
  L'unica conclusione che regge senza riserve e' l'ordine di grandezza: decine
  di millisecondi per fotogramma a 1220x1172, cioe' troppo per decodificare al
  volo a 60 fps.
- **`mosbyfiles.com` serve `image/avif` anche a chi non lo chiede**: l'ho
  osservato su due asset. Non ho verificato se sia una regola del CDN Storyblok
  o semplicemente il fatto che nel CMS quei file sono AVIF (che e' la
  spiegazione piu' probabile).
