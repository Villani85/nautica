# KTX2 — la compressione delle mappe PBR

Cosa c'è qui dentro, e cosa dicono i numeri **misurati** il 27 agosto su questa
macchina con `strumenti/ktx2.mjs`.

```
riferimenti/ktx2/
  attrezzo/bin/    ktx.exe, toktx.exe e ktx.dll — KTX-Software 4.4.2, copia LOCALE
  provino/         le tre texture di prova 2048×2048 generate dallo strumento
  uscita/          i .ktx2 prodotti dall'ultima corsa
  .tmp/            scarti del giro di andata e ritorno, si può cancellare
```

---

## L'attrezzo non c'era

Su questa macchina non erano installati né `toktx` né `basisu`, e non c'era
niente in `C:\Program Files\KTX-Software`. Lo strumento **lo dice e si ferma
con codice 3**: non installa niente di nascosto e non comprime a metà.

Quello che c'è adesso in `attrezzo/bin` è la release ufficiale
`KTX-Software-4.4.2-Windows-x64.exe` scaricata da GitHub ed **estratta** con
7-Zip (è un installer NSIS): nessuna installazione di sistema, nessun PATH
toccato, nessun pacchetto npm aggiunto al progetto. Sono ~5,7 MB di binari.

Se un domani si preferisce l'installazione vera, lo strumento la trova da sola:
cerca in `$KTX_BIN`, poi qui, poi in `C:\Program Files\KTX-Software\bin`, poi
nel PATH.

**Da decidere:** se questi binari vanno versionati o ignorati. Vedi in fondo.

---

## La ragione vera non è il peso del file: è la memoria video

Un PNG **sulla GPU non esiste**. Viene decodificato e caricato come RGBA8:
2048 × 2048 × 4 = **16,00 MB a mappa**, sempre, qualunque sia il peso del file.
Tre mappe = 48 MB di memoria video prima ancora di aver disegnato un pixel.

Un KTX2 Basis viene *transcodificato* a un formato a blocchi e **resta
compresso in memoria video** per tutta la vita della pagina.

| mappa | PNG → RGBA8 | KTX2 in VRAM (con mipmap) | bit/texel | formato a runtime |
|---|---|---|---|---|
| albedo, ETC1S | 16,00 MB | **2,67 MB** | 4 | BC1 desktop / ETC1 mobile |
| normale, UASTC | 16,00 MB | **5,33 MB** | 8 | BC7 desktop / ASTC 4×4 mobile |
| ORM, UASTC | 16,00 MB | **5,33 MB** | 8 | BC7 desktop / ASTC 4×4 mobile |
| **totale** | **48,00 MB** | **13,33 MB** | | **3,60×** |

Con ETC1S ovunque il totale in VRAM scende a 8,00 MB (6,00×), ma sui dati non
si può — vedi sotto.

Nota onesta: il numero VRAM del KTX2 include le mipmap (×4/3), quello del PNG
no. Non è un favore al KTX2: **un formato compresso non sa generare le mipmap
a runtime**, o stanno nel file o il materiale aliasa. Il PNG le fa generare a
three.js, e quelle mipmap occupano lo stesso ×4/3 che qui non ho contato. La
tabella, se mai, è pessimistica.

---

## Il peso trasferito: la parte che NON funziona come si racconta

| mappa | PNG | KTX2 liv.0 | rapporto |
|---|---|---|---|
| albedo (ETC1S, sRGB) | 687 KB | 118 KB | **5,82×** |
| normale (UASTC, lineare) | 3,52 MB | 2,33 MB | **1,51×** |
| ORM (UASTC, lineare) | 841 KB | 1016 KB | **0,83×** — *più grande del PNG* |

UASTC è **8 bit/texel fissi**: 4 MB a 2048², e lo zstd sopra recupera solo
quello che c'è di ridondante. Su una ORM sintetica come la mia — metallicità
quasi binaria, rugosità liscia — il PNG vince, perché il PNG è ottimo proprio
sulle immagini a chiazze piatte.

Quindi la frase *«in KTX2 con compressione Basis stanno in una frazione»* è
vera per l'albedo in ETC1S e **falsa per le mappe di dato in UASTC**. Il
guadagno di UASTC è tutto sulla memoria video (3×) e sul non dover decodificare
un PNG sul thread principale. Va detto così, non come un 6× generale.

E c'è un costo fisso da mettere a bilancio: il transcoder Basis del browser,
`basis_transcoder.wasm` + `.js`, sono **260 KB gzip** che prima non si
scaricavano. Sotto le tre mappe si ripaga; su una mappa sola, no.

---

## Colore e dato non si trattano uguale

- **colore** (albedo, emissive) → `_SRGB`, `--assign-tf srgb`, codec **ETC1S**.
- **dato** (normale, ORM, AO, rugosità, metallo) → `_UNORM`, `--assign-tf
  linear`, codec **UASTC**.

La classificazione la fa il nome del file. Se il nome non dice niente, lo
strumento **si rifiuta di indovinare** e si ferma.

### Perché non ETC1S sui dati — misurato

Stessa normale, stessi 2048², solo il codec cambia:

| codec | KTX2 | VRAM | deviazione media | 99° perc. | massimo |
|---|---|---|---|---|---|
| **UASTC** | 3,14 MB | 5,33 MB | **0,504°** | 4,96° | 28,6° |
| ETC1S | 381 KB | 2,67 MB | **2,888°** | **29,98°** | **105,25°** |

(99,9° percentile: 11,82° in UASTC contro **48,98°** in ETC1S.)

105° di massimo vuol dire una normale che **punta dall'altra parte**. E il
guaio non è la media: è la coda. Il 99° percentile a 30° spegne uno spigolo
intero, ed è esattamente il difetto che si legge come *«la superficie si
spegne»* e non come rumore.

Sulla ORM lo stesso, per canale:

| codec | PSNR peggiore | delta al 99,9° percentile (R / G / B) |
|---|---|---|
| **UASTC** | 57,99 dB | **2 / 2 / 1** su 255 |
| ETC1S | 34,29 dB | **46 / 47 / 89** su 255 |

35,7 dB su un grafico sembra un numero rispettabile. Intanto **un texel su
mille sbaglia la metallicità di 89 livelli su 255**: passa da metallo a
vernice. È il motivo per cui la soglia sui dati è sulla coda e non sulla media
— la media, da sola, stava per dare il via libera.

Provato che il cancello lo prende: `node strumenti/ktx2.mjs verifica --dato
etc1s` esce con **codice 2** e stampa i tre motivi (media della normale, coda
della normale, coda della metallicità). Con i codec giusti esce con **0**.

---

## L'errore che non dà errore: l'etichetta sRGB su una normale

Se una mappa di dato viene marcata sRGB, non succede niente di visibile nel
processo. Il file si scrive, il sito si carica, three.js non protesta. La GPU
però applica l'inversa della gamma a dei numeri che non sono colori.

Misurato su questa stessa normale (`node strumenti/ktx2.mjs danno`):

| | gradi |
|---|---|
| deviazione media | **39,42°** |
| mediana | 39,10° |
| 99° percentile | 45,72° |
| massimo | 49,20° |

Per confronto: la perdita della compressione fatta bene è **0,504°**. L'errore
di etichetta costa **78 volte tanto** e non lo segnala nessuno.

---

## Il provino, e perché non è rumore

Le mappe vere non esistono ancora. Quelle in `provino/` le genera lo strumento,
e **non sono rumore bianco**: il rumore comprime in modo atipico e falserebbe
ogni numero. C'è dentro quello che ci sarà davvero — pannelli con fughe e
spigoli smussati, ribattini, ondulazione della lamiera, buccia d'arancia — e i
tre canali della ORM sono genuinamente diversi fra loro (occlusione morbida,
rugosità a chiazze con graffi, metallicità quasi binaria a blocchi).

Che il provino non sia piatto è **misurato e stampato a ogni corsa**, perché
una normale piatta comprimerebbe benissimo e il verde non vorrebbe dire niente:

```
inclinazione media 11,1° · 16,5% dei texel oltre 10° · massimo 82,6°
```

---

## Provato anche su una cottura vera

Non solo sul provino sintetico: lo strumento è stato passato sulle due mappe
uscite davvero dalla cottura Blender di un altro agente
(`riferimenti/blender/provino/uscita/`, `bassa-normale.png` e `bassa-orm.png`,
2048×2048).

```
bassa-normale.png  UASTC lineare   241 KB → liv.0  286 KB   deviazione media 0,040°, p99 0,60°, max 8,66°
bassa-orm.png      UASTC lineare  1,42 MB → liv.0 1008 KB   PSNR 67,5 / 57,6 / 66,3 dB, coda p99,9 ≤ 2/255
in VRAM            32,00 MB → 10,67 MB (3,00×)              VERDE, codice 0
```

Due cose da leggere bene:

- il **riconoscitore dei nomi funziona sui nomi che escono davvero** dalla
  cottura (`<prefisso>-normale.png`, `<prefisso>-orm.png`);
- la deviazione è **0,040°**, venti volte meglio del provino sintetico, e non
  perché UASTC lì sia più bravo: quella mesh di prova ha grandi superfici
  piatte. È la conferma che il provino sintetico è il caso *difficile*, che è
  esattamente quello che deve essere.

E la conferma dell'altra faccia: **0,76×** sui file interi (0,84× e 1,44× sui
soli livelli 0), cioè in trasferimento il KTX2 di quelle due mappe non guadagna
niente o quasi. Il guadagno resta tutto sulla VRAM: **32,00 → 10,67 MB**.

---

## Cosa resta aperto

1. **Sulle texture finali non è ancora provato.** I numeri principali vengono
   dal provino sintetico e da una cottura di prova, non dalle mappe della nave.
   In particolare il rapporto dell'albedo (5,82×) non è mai stato verificato su
   un albedo vero, perché un albedo vero ancora non c'è.
2. **Il giro dentro il browser non è provato.** Qui la decompressione la fa
   `ktx extract --transcode rgba8`, che usa lo stesso transcoder Basis del
   browser ma non è il browser. Manca il collaudo che carica un `.ktx2` con
   `KTX2Loader` e misura la memoria video vera.
3. **Nessun collaudo lo chiama ancora.** Non l'ho messo in `npm run collaudo`
   per non toccare file che stanno modificando altri.
4. **`basisu` è riconosciuto ma non pilotato.** Se un domani si vuole usare
   quello al posto di `ktx`, va scritto il ramo.
5. **I binari in `attrezzo/bin` (5,7 MB) sono da decidere:** versionarli rende
   il passo riproducibile su qualunque macchina senza scaricare niente;
   ignorarli tiene pulito il repo ma richiede che chi arriva li scarichi.
   Lo strumento funziona in entrambi i casi — se non li trova, lo dice.
