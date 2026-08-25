# Animazione del testo - come si muove il testo nei siti da premio

> **Vincolo del committente, valido per tutto il documento: NIENTE EFFETTI LEGATI AL
> MOUSE.** L'esperienza si guida con lo **scorrimento** e con il **tempo**. Tutto il
> repertorio hover / cursore magnetico / testo che reagisce al puntatore e' fuori
> perimetro e non viene proposto qui, nemmeno quando i siti analizzati lo usano.
> Dove un sito ha un effetto su hover lo cito solo per dire **come l'ha risolto senza
> il mouse altrove** (esempio: Revelatio anima i titoli su `IntersectionObserver` e
> tiene lo scramble sul puntatore - noi teniamo il primo e buttiamo il secondo).
>
> **Metodo.** I numeri della sezione 1 non sono stimati: sono letti nelle schede di
> questa cartella, che a loro volta li hanno letti nel **codice vero** dei siti
> (bundle scaricati con `curl`, sourcemap, CSS in chiaro). Dove la scheda dice
> "non verificato", qui lo ripeto. Le sezioni 2, 3, 4 e 6 citano fonti primarie
> (documentazione GSAP, specifica CSS del W3C, MDN, registro npm, API GitHub),
> interrogate il **13/08/2026**.
>
> **Da leggere prima:** `_LIBRERIE-DEGLI-STUDI.md` (la licenza GSAP),
> `_ACCESSIBILITA.md` (il quadro completo, di cui qui si approfondisce il solo
> capitolo tipografico), `_PATTERN.md` (il pattern P3).

---

## Indice

1. [Il repertorio misurato - 20 siti, come entra il titolo](#1)
2. [Lo sfasamento: il numero che serve piu' di tutti](#2)
3. [SplitText di GSAP: cosa fa, e la questione della licenza](#3)
4. [Le alternative libere: Splitting.js, Custom Highlight API, fai-da-te](#4)
5. [Il problema di accessibilita' che quasi tutti sbagliano](#5)
6. [Il testo che scorre (marquee), senza JavaScript e con JavaScript](#6)
7. [Il testo che si rivela sullo scorrimento, parola per parola](#7)
8. [Tipografia cinetica pesante: quando conviene il WebGL con MSDF](#8)
9. [`prefers-reduced-motion`: quanti lo rispettano davvero](#9)
10. [Il decalogo, con le durate in millisecondi](#10)

---

<a name="1"></a>
## 1. Il repertorio misurato - 20 siti, come entra il titolo

La domanda operativa e' sempre la stessa: **il titolo si spezza a lettere, a parole
o a righe? Con maschera o senza? Con quanto ritardo fra un pezzo e l'altro? Con
quale durata e quale curva?** Ecco le risposte lette nel codice.

Legenda della colonna "unita'": e' il pezzo che viene animato singolarmente.
Legenda "maschera": si', se il pezzo scorre dietro un contenitore con
`overflow: hidden` / `clip` (cioe' il testo **appare da dietro un bordo**);
no, se entra in opacita', sfocatura, scala o rotazione senza essere ritagliato.

| # | sito | unita' | maschera | sfasamento (stagger) | durata | curva | attrezzo |
|---|---|---|---|---|---|---|---|
| 1 | **Mosby** (SOTD 13/08/2026) | **carattere** | **si** (`mask: "chars"`) | **200 ms per riga**, non per carattere | 900 ms | `power4.out` | GSAP SplitText `type:"chars, words, lines"` |
| 2 | **Mosby**, transizione fra pagine | carattere | si | **25 ms** (35 ms in uscita) | non rilevata | `power2.out` / `power2.inOut` | `.char` da `xPercent: +/-150 -> 0` |
| 3 | **Dogstudio** (SOTD/SOTM 2019) | **carattere** | no (3D: `translate3d + rotateX + rotate + scaleY`) | **25 ms** | 1200 ms | `cubic-bezier(.245,.495,0,.99)` | markup **gia' esploso in `<span class="fx-letter">` lato PHP**, non a runtime |
| 4 | **Persepolis** | **carattere** (parole come contenitore) | no (rotazione 12 gradi + scala + y) | **25 ms** | non rilevata | ease custom `JorisInOut` / `JorisOut` | GSAP SplitText 3.9.1 |
| 5 | **Aristide Benoist** | **carattere** | **si** (`overflow:hidden`, lettera da `translate3d(-101%,0,0)`) | **22-40 ms**, deciso progetto per progetto | **1600 ms** (500 ms per nascondere) | `o6` (esponenziale in uscita), 19 ease scritti a mano | motore proprio, **zero librerie** |
| 6 | **Cuberto** | **parola** | **si** (`mask: "words"`, parola da `y: 120%`) | **`{amount: .6}`** = 600 ms distribuiti su tutte le parole | **1700 ms** | `expo.out` (**l'unico ease di tutto il sito**) | GSAP 3.15.0 SplitText `type:"words", mask:"words", tag:"span"` |
| 7 | **Vero** | **parola**, distinta per stile | **si** solo sulle maiuscole (`overflow:hidden`, `translateY(100% -> 0)`) | **100 ms** (`calc(var(--stagger) * .1s + .55s)`) | **1400 ms** maiuscole / **600 ms** corsivi | out-expo `cubic-bezier(.19,1,.22,1)` / out-sine `cubic-bezier(.61,1,.88,1)` | **splitter proprio** con `Intl.Segmenter`, emette `<span style="--stagger:{i}">`; **CSS puro**, nessuna libreria di animazione sul titolo |
| 8 | **By-Kin** (SOTD + Developer Award) | **parola**, sfalsata **per riga** | si (`y: 100%`) | per riga (valore non rilevato) | **1200 ms** | `power3.out` | **SplitType**, non SplitText |
| 9 | **Obys** (SOTD 2026) | **riga** | si (marcatore `mo-ln` sul contenitore, `.ln_`/`.ln`) | **auto-calcolato**: `stag = clamp(5*durata/numOggetti, 20, durata)` ms | **1600 ms** (600 ms per nascondere) | `o6` in entrata, `i3` in uscita | motore proprio su rAF + **Web Animations API**, zero librerie |
| 10 | **Immersive Garden** (SOTY 2017/2018) | **riga** (paragrafi) / **parola** (baseline) | no (sola opacita') | **100 ms** | 1800 ms opacita', 2000 ms offset del blocco / 1250 ms baseline | `power1.out` / `power2.out` / `sine.inOut` | GSAP SplitText `type:"lines"`, componente `AnimatedParagraph` |
| 11 | **Don't Board Me** (SOTY 2024) | **riga** | **si**, con **doppio SplitText annidato** (prima `lines`, poi di nuovo `lines` dentro un wrapper `overflow:hidden`) | **200 ms** | 800 ms | `power4.out` | GSAP 3.12.2 SplitText; `yPercent: 100 -> 0` **+ `rotate: 30 -> 0`** |
| 12 | **Opal Tadpole** (SOTY 2024) | **riga + carattere** | **si** (righe in `overflow: hidden`) | **`{amount: .4}`** = 400 ms distribuiti | non rilevata | non rilevata | GSAP 3.12.3 SplitText, `yPercent 100 -> 0` |
| 13 | **Trionn** | **carattere** | **no** (entra da `blur(12px)` + `autoAlpha: 0`) | **50 ms**, `from: "random"` | non rilevata | `power2.out` | GSAP SplitText `type:"chars,words,lines"`, `smartWrap: true`; componente `BlurTextReveal` |
| 14 | **Star Atlas** (SOTY 2021) | **carattere** | no (**da sfocato a nitido**, `filter: blur(10px)`) | **100 ms**, `from: "edges"`, `grid: "auto"`, `ease: "power2.inOut"` **dentro lo stagger** | non rilevata | `quad.inOut` | GSAP 3.7.1 SplitText; **due `<h1>` sovrapposti**, uno sfocato e uno nitido, che si scambiano carattere per carattere dai bordi verso il centro |
| 15 | **Revelatio** (SOTD 2026) | **parola** (con caratteri scramblati dentro) | no (scramble: ogni carattere diventa un simbolo casuale) | **10 ms** (h1) / **15 ms** (titoli in pagina) / **90 ms** (righe dei blocchi servizi) | 1200 ms h1, 1400 ms titoli, 600 ms righe | `power2.out` / `power3.out` | GSAP 3.15.0 SplitText + **ScrambleTextPlugin**, poi `revert()`: **il DOM torna pulito** |
| 16 | **Mana Yerba Mate** (SOTY 2023) | **carattere** | no (scala 0.8 -> 1) | **70 ms** | 600 ms | **`elastic.out(2, 0.5)`** | GSAP; il colore non e' una tween ma **7 `setTimeout` da 70 ms** che scambiano classi CSS |
| 17 | **Zajno** | **glifo in WebGL** (6 texture MSDF) | no (comparsa in cascata) | **60 ms** | **1600 ms** | non rilevata | **nessuna libreria**, motore proprio; `hoMsdf: { delay: [1200, 60], d: 1600 }` |
| 18 | **MA** | blocco di testo | no (`translateY 80->0` + `scaleY 1.2->1` + opacita') | **70 ms** (preloader) / **75 ms** (blocchi) | 800 ms | `easeOutExpo` | **anime.js**, `anime.stagger(70, {start: 600})` |
| 19 | **Pangram Pangram** (E-commerce SOTY 2021) | elemento di interfaccia | no | **100 ms** (`calc(.1s * var(--delay-order))`) | 750 ms | out-quint `cubic-bezier(.22,1,.36,1)` | **CSS puro**, ordine scritto come variabile in linea |
| 20 | **Locomotive** | carattere + riga (preloader) | no | **50 ms** (tracciati SVG) / **25 ms** (logo, seconda visita) | non rilevata | `cubic-bezier(0.215, 0.61, 0.355, 1)` | GSAP 3.14.2 + SplitText; **ScrollTrigger non e' nel bundle** |
| 21 | **Simply Chocolate** (E-commerce SOTY 2017) | carattere del nome prodotto | si (entra da dietro l'incarto) | **ritardo calcolato**: `max(0, 100 - 50 * (n - i - 1))` ms | molla | molla (`fromSpring`) | motore proprio |

Fonti riga per riga: `mosby.md` (148-149, 52, 98-102), `dogstudio.md` (112, 149),
`persepolis.md` (215-216, 273-274), `aristide-benoist.md` (35, 87-88, 95),
`cuberto.md` (239-241, 265, 484), `vero.md` (100-101, 133-134, 478, 566-573),
`by-kin.md` (191, 248, 317), `obys.md` (78, 324, 354-355, 604),
`immersive-garden.md` (213, 239, 241), `dont-board-me.md` (72, 75, 94, 105, 110),
`opal-tadpole.md` (161, 179), `trionn.md` (78, 266), `star-atlas.md` (150, 418-421),
`revelatio.md` (328, 345, 398-401, 408), `mana-yerba-mate.md` (61-62, 82),
`zajno.md` (63, 114, 155), `ma.md` (192, 250, 261, 280),
`pangram-pangram.md` (97), `locomotive.md` (260, 263, 290),
`simply-chocolate.md` (176).

### Cosa dice la tabella, prima ancora dei numeri

**a) Si spezza a righe e a parole piu' spesso di quanto si creda.** Sui 20 siti
distinti della tabella: **8 animano il carattere** (Mosby, Dogstudio, Persepolis,
Aristide Benoist, Trionn, Star Atlas, Mana, Simply Chocolate), **4 la parola**
(Cuberto, Vero, By-Kin, Revelatio), **4 la riga** (Obys, Immersive Garden, Don't
Board Me, Opal Tadpole), **1 il glifo in WebGL** (Zajno); i restanti tre animano
blocchi o elementi di interfaccia (MA, Pangram Pangram, Locomotive). **La lettera
non e' la scelta di maggioranza: e' la scelta piu' *fotografata*.**

**b) La maschera e' minoranza, ma e' la firma dei siti piu' costosi.** Nove su
venti usano una maschera (`overflow: hidden` / `clip` / `mask:` di SplitText);
gli altri undici usano opacita', sfocatura, scala o rotazione. Ma i nove con la maschera
sono Mosby, Aristide Benoist, Cuberto, Vero, By-Kin, Obys, Don't Board Me, Opal
Tadpole, Simply Chocolate - cioe' **quasi tutti i lavori di fascia alta**. Il motivo
e' fisico: dietro una maschera il testo puo' partire da fuori del suo posto senza
lasciare traccia; senza maschera devi accontentarti di un cambio di stato sul posto.

**c) Due sole famiglie di curve, e nessuna e' lineare.** `expo.out`, `power4.out`,
`power3.out`, `power2.out`, `o6`, `out-quint`, `out-expo`, `easeOutExpo`: **sono
tutte decelerazioni forti**. Il testo parte veloce e si posa. Le uniche eccezioni
sono Star Atlas (`quad.inOut`, ma li' e' una sfocatura, non uno spostamento) e Mana
(elastico, ma e' un marchio dichiaratamente giocattoloso). **Non esiste un titolo
animato in `linear`** in tutto il campione.

**d) Le durate sono lunghissime rispetto all'interfaccia.** Un pulsante si anima in
150-250 ms. Questi titoli stanno fra **600 e 1800 ms**, mediana **~1200 ms**. E
c'e' un valore che ricorre in modo sospetto: **1600 ms** su Aristide Benoist, Obys
e Zajno - cioe' i tre siti con **motore di animazione scritto in casa**. Chi ha
scritto il proprio motore ha scelto lo stesso numero, indipendentemente.

**e) Il titolo dell'eroe non e' quasi mai innescato dallo scroll.** E' innescato dal
**tempo** (fine del preloader), perche' e' gia' in vista. Sono i titoli *successivi*
a essere innescati dall'ingresso in viewport - e quasi tutti con `once: true`
(Cuberto, Revelatio) o con un `IntersectionObserver` proprio (Revelatio, Immersive
Garden, `ma`). **Nessuno dei titoli riparte se scorri indietro**: si anima una volta
sola. E' una regola non scritta ma unanime.

---

<a name="2"></a>
## 2. Lo sfasamento: il numero che serve piu' di tutti

`_PATTERN.md` (P3) diceva **"stagger 20-60 ms"** su 6 siti. Con 21 misure il quadro
si separa in modo netto: **non esiste un valore unico, esistono due bande**, e sono
due bande **che dicono la stessa cosa**.

### Le due bande

| unita' animata | valori misurati (ms) | mediana | banda |
|---|---|---|---|
| **carattere / lettera** | 15, 22, 25, 25, 25, 30, 35, 40, 50, 70, 100 | **25-30** | **20-40 ms** |
| **parola / riga / elemento** | 60, 60, 70, 75, 90, 100, 100, 100, 100, 100, 200, 200 | **100** | **60-200 ms** |

- **Il valore piu' ricorrente per il carattere e' 25 ms.** Compare identico su
  **Dogstudio, Mosby e Persepolis**, tre studi diversi, tre anni diversi, due
  attrezzi diversi (markup PHP pre-esploso, GSAP SplitText 3.9, GSAP SplitText
  recente). Aristide Benoist dichiara la forchetta `0.022-0.04` - cioe' 25 ms sta
  **al centro del suo intervallo di progetto**.
- **Il valore piu' ricorrente per la riga/parola e' 100 ms.** Compare su Vero
  (`--stagger * .1s`), Immersive Garden, Pangram Pangram
  (`calc(.1s * --delay-order)`), Persepolis (corpi di testo), Revelatio (righe,
  90-120 ms), Star Atlas. Le due eccezioni alte - **200 ms** su Don't Board Me e
  Mosby - sono entrambe **righe di un titolo gigante di 2-3 righe**: pochi pezzi,
  quindi il ritardo puo' permettersi di essere lungo.

### Il numero vero: la durata TOTALE dell'onda, 400-600 ms

Qui c'e' la scoperta che vale piu' delle due bande. **Due studi non scrivono un
ritardo per pezzo: scrivono la durata totale della cascata e la lasciano dividere.**

- **Cuberto**: `stagger: { amount: .6 }` - GSAP distribuisce **600 ms in totale**
  su tutte le parole, quale che sia il loro numero.
- **Opal Tadpole**: `stagger: { amount: .4 }` - **400 ms in totale**.
- **Obys** fa la stessa cosa a mano, ed e' la formula piu' intelligente del
  campione:
  ```
  stag = clamp(5 * durata / numOggetti, 20, durata)   // millisecondi
  ```
  cioe' **lo sfasamento si accorcia da solo quando le righe sono tante**, con un
  pavimento invalicabile a **20 ms**. Con `durata = 1600 ms`: 4 righe -> 2000 ms
  teorici, clampati; 10 righe -> 800 ms; 40 pezzi -> 200 ms; oltre, si ferma a 20 ms
  per pezzo.
- **Simply Chocolate**, nove anni prima, aveva scritto un'idea equivalente:
  `max(0, 100 - 50 * (n - i - 1))` ms, cioe' **un ritardo che si comprime verso la
  fine della parola**.

**Ora fai il conto inverso e guarda cosa succede:**

| caso | pezzi | sfasamento per pezzo | **onda totale** |
|---|---|---|---|
| titolo di 24 caratteri a 25 ms | 24 | 25 ms | **600 ms** |
| titolo di 6 parole a 100 ms | 6 | 100 ms | **600 ms** |
| Cuberto, `amount: .6` | qualunque | ricalcolato | **600 ms** |
| Opal Tadpole, `amount: .4` | qualunque | ricalcolato | **400 ms** |
| titolo di 3 righe a 200 ms | 3 | 200 ms | **600 ms** |
| Obys, 8 righe da 1600 ms | 8 | 1000 ms -> clamp | dipende, ma con pavimento |

**Le due bande sono la stessa banda.** Chi mette 25 ms per lettera e chi mette
100 ms per parola stanno producendo **la stessa velocita' di onda attraverso il
titolo**, perche' una parola italiana o inglese e' lunga in media 4-5 caratteri.
Il numero che tutti stanno inseguendo, consapevolmente o no, e':

> ### La cascata deve attraversare il titolo in 400-600 ms.
> Non 25 ms, non 100 ms: **quelli sono la conseguenza**. Si sceglie l'onda, poi si
> divide per il numero di pezzi.

**Come si scrive in pratica.**

```js
// GSAP: lasci decidere a lui, e non sbagli mai al cambio di lunghezza del titolo
gsap.from(split.words, { yPercent: 100, duration: 1.2, ease: "expo.out",
                         stagger: { amount: 0.5 } });   // 500 ms di onda, sempre
```

```js
// Senza librerie: stessa idea in tre righe
const ONDA = 500;                                  // ms
const passo = Math.max(20, ONDA / pezzi.length);   // il clamp di Obys
pezzi.forEach((p, i) => p.style.transitionDelay = (i * passo) + 'ms');
```

```css
/* Solo CSS, alla Vero / Pangram Pangram: lo splitter scrive --i, il CSS fa il resto */
.pezzo { transition: transform 1.2s var(--out-expo) calc(var(--i) * var(--passo)); }
:root  { --passo: 100ms; }             /* per parola */
h1.a-lettere { --passo: 25ms; }        /* per lettera */
```

### Il verso della cascata

Quasi tutti vanno **da sinistra a destra, dall'alto in basso** (l'ordine naturale
del DOM). Due eccezioni misurate, entrambe interessanti e **nessuna delle due legata
al mouse**:

- **Star Atlas**: `from: "edges"` - la nitidezza arriva **dai bordi verso il centro**,
  con un `ease: "power2.inOut"` applicato **allo stagger stesso** (non alla tween):
  i caratteri centrali si accalcano. E' l'unico uso documentato di un ease
  *sulla distribuzione* invece che *sul movimento*.
- **Trionn**: `from: "random"` - l'ordine e' casuale. Funziona perche' l'effetto e'
  una sfocatura (nessuno spostamento), quindi il disordine non si legge come errore.

---

<a name="3"></a>
## 3. SplitText di GSAP: cosa fa, e la questione della licenza

### Cosa fa, esattamente

SplitText prende un elemento di testo e ne **riscrive l'`innerHTML`** avvolgendo
caratteri, parole e righe in elementi separati, cosi' che si possano animare uno per
uno. Le opzioni, dalla documentazione ufficiale
([gsap.com/docs/v3/Plugins/SplitText](https://gsap.com/docs/v3/Plugins/SplitText/)):

| opzione | default | a cosa serve |
|---|---|---|
| `type` | `"chars,words,lines"` | quali pezzi creare |
| **`mask`** | non impostata | `"lines"` / `"words"` / `"chars"`: **avvolge ogni pezzo in un elemento che ritaglia**. E' la maschera della sezione 1, gratis |
| **`aria`** | **`"auto"`** | `"auto"` mette `aria-label` sul contenitore e `aria-hidden` sui pezzi; `"hidden"` solo `aria-hidden`; `"none"` non tocca nulla. **Vedi sezione 5** |
| **`autoSplit`** | `false` | rifa' lo split quando la larghezza cambia o quando i font finiscono di caricare |
| **`onSplit`** | - | callback dopo ogni split: e' li' che va ricreata la timeline se usi `autoSplit` |
| `linesClass` / `wordsClass` / `charsClass` | - | classi sui pezzi; con `"++"` diventano numerate |
| `propIndex` | `false` | scrive l'indice come **variabile CSS** su ogni pezzo (`--char`, `--word`, `--line`) |
| `smartWrap` | `false` | evita che una parola spezzata in caratteri vada a capo in mezzo |
| `deepSlice` | `true` | gestisce gli elementi annidati che attraversano un a-capo (un `<em>` a cavallo di due righe) |
| `wordDelimiter`, `reduceWhiteSpace`, `prepareText`, `tag` | - | delimitatore di parola, spazi multipli, pre-trattamento del testo, tag usato per i wrapper |
| `revert()` | metodo | **rimette l'`innerHTML` originale**. La documentazione insiste: creare tanti nodi *"can be expensive"* |

Le tre cose che nessun'altra libreria fa insieme: **il `mask` integrato**, il
**`deepSlice`** (l'unico modo pulito per non rompere il markup ricco), e
**`autoSplit` + `onSplit`**, cioe' il ricalcolo delle righe al `resize` e al
caricamento dei font. Quest'ultimo e' il punto in cui i fai-da-te tipicamente
falliscono: **le righe calcolate prima che il font sia pronto sono righe sbagliate**.

Le tre novita' (mask, autoSplit/onSplit, aria) sono arrivate con **GSAP 3.13.0 del
29 aprile 2025**, che ha riscritto il plugin, ne ha dimezzato il peso e ha reso
**gratuiti tutti i plugin del Club** ([gsap.com/blog/3-13](https://gsap.com/blog/3-13/)).
**Prima di quella data SplitText era a pagamento e non toccava l'accessibilita'.**
Vale come datazione: dei siti in tabella, **Don't Board Me (3.12.2), Opal Tadpole
(3.12.3), By-Kin (3.12.5), KPR (3.10.4), Persepolis (3.9.1), Star Atlas (3.7.1),
Frans Hals (era TweenMax)** montano versioni **precedenti**; **Revelatio e Cuberto
(3.15.0), Locomotive (3.14.2), Lando Norris (3.13.0)** montano versioni successive.

### La licenza: gratuito non vuol dire aperto

Questo pezzo e' gia' documentato in `_LIBRERIE-DEGLI-STUDI.md` (sezione "Il punto
che quasi nessuno ha letto") e va ripetuto qui perche' **riguarda esattamente il
pezzo di codice che finisce nell'`<h1>` di ogni sito che consegniamo**.

- **GSAP non e' open source. Non lo e' mai stato e non lo e' diventato.** Il
  repository GitHub `greensock/GSAP` **non contiene nessun file di licenza**
  (verificato via API GitHub il 13/08/2026: campo `license` = `null`, 27.666 stelle).
  Il campo `license` del `package.json` non e' uno SPDX ma una frase:
  `"Standard 'no charge' license: https://gsap.com/standard-license."`
- La licenza in vigore e' una **licenza Webflow in sei articoli**. L'unico divieto
  vero e' costruire strumenti di animazione visuale senza codice in concorrenza con
  Webflow. **La proprieta' intellettuale resta di Webflow**, e **Webflow puo'
  revocare la licenza a propria discrezione e modificarne i termini quando vuole.**
- La tutela pratica e' scritta nella licenza stessa: **le versioni gia' scaricate
  restano utilizzabili alle condizioni di allora.** Da cui la regola operativa:
  **blocca la versione esatta nel `package.json` e conserva una copia del
  pacchetto.** Mai un intervallo aperto (`^3.15.0`) su un progetto di cliente.
- Nel documento di consegna al cliente, GSAP va dichiarato come **licenza
  proprietaria d'uso gratuito concessa da Webflow**, non come software libero. Se un
  cliente industriale chiede l'elenco delle licenze delle dipendenze - e lo chiede -
  quella riga ci distingue da chi non se l'e' mai chiesto.

> **Attenzione a una fonte sbagliata che gira.** Interrogando la pagina della
> documentazione, un riassunto automatico conclude che *"the core library is free
> and open-source"*. **E' falso**, ed e' esattamente l'errore che si propaga: la
> pagina di licenza e il repository dicono il contrario. Verifica sempre sul
> `package.json` e sulla presenza del file `LICENSE`.

**Peso e diffusione, per contesto** (npm, ultimi 30 giorni al 13/08/2026):
`gsap` **17.369.658 scaricamenti al mese**. E' lo standard di fatto; il problema non
e' la qualita', e' la **catena di controllo**.

---

<a name="4"></a>
## 4. Le alternative libere: Splitting.js, Custom Highlight API, fai-da-te

### 4.1 Splitting.js - MIT, viva a meta'

| dato | valore | fonte |
|---|---|---|
| licenza | **MIT** | `package.json` su npm |
| ultima versione | **1.1.0**, pubblicata **31/05/2024** | registro npm |
| scaricamenti | **69.378 / mese** | API npm, 11/07-09/08/2026 |
| stelle GitHub | **1.756**, ultimo push **19/06/2024** | API GitHub `shshaw/Splitting` |
| peso del pacchetto | **37.442 byte** non compressi (9 file, include tutte le varianti) | npm `dist` |

**Cosa fa.** Spezza in `<span>` con classi `.word`, `.char`, `.line`, `.item`,
`.cell`, aggiunge `data-char` / `data-word`, e - questa e' la sua idea buona -
**scrive gli indici come variabili CSS**: `--char-index`, `--word-index`,
`--line-index`, piu' i totali `--char-total`, `--word-total`, `--line-total`
([splitting.js.org/guide](https://splitting.js.org/guide.html)).

Con quelle variabili lo stagger si scrive **in CSS puro**, senza timeline:

```css
.char { transition: transform 1.2s var(--out-expo)
                    calc(var(--char-index) * 25ms); }
/* e l'onda a durata costante della sezione 2, gratis: */
.char { transition-delay: calc(var(--char-index) / var(--char-total) * 500ms); }
```

E' **esattamente lo schema di Vero e di Pangram Pangram**, che se lo sono scritto in
casa (`--stagger`, `--delay-order`). Splitting.js e' quello schema in libreria, MIT.

**I limiti veri, da sapere prima di sceglierla:**
- **Nessuna maschera integrata.** I wrapper `overflow: hidden` te li scrivi tu.
- **Nessun ricalcolo automatico** al `resize` o al caricamento dei font: le righe
  vanno ricalcolate a mano richiamando `Splitting()`.
- **Non tocca l'accessibilita'.** La guida non nomina `aria-hidden` ne'
  `aria-label`: vedi sezione 5, il rimedio e' due righe ma **e' a carico tuo**.
- **Ferma da due anni.** Non e' abbandonata in senso stretto (fa una cosa sola e la
  fa), ma non aspettarti correzioni.

### 4.2 SplitType - il clone piu' usato, e il suo problema

`split-type` fa **275.880 scaricamenti al mese** (npm, 13/08/2026), cioe' **quattro
volte Splitting.js**. E' quello che usa **By-Kin**, premiato con il Developer Award.
Ma: repository `lukePeavey/SplitType`, **727 stelle**, **ultimo push 03/12/2023**, e
soprattutto **campo licenza `null` via API GitHub**. Cioe' e' nella stessa condizione
denunciata in `_LIBRERIE-DEGLI-STUDI.md` per `maath`: tantissimi scaricamenti,
nessuna licenza dichiarabile a un cliente. **Non lo mettiamo in un progetto
industriale.**

### 4.3 `activetheory/split-text` - il regalo di Active Theory

**69 stelle, MIT, ultimo push 05/06/2025** (API GitHub, 13/08/2026). Spezza in
righe/parole/caratteri. E' **l'alternativa gratuita a SplitText scritta da uno studio
che vince premi**, ed e' uno dei quattro pezzi del loro toolset che hanno regalato
(`activeframe`, `svg2msdf`, `split-text`, `ios-silent-bypass` - vedi
`_CODICE-PUBBLICO-1.md`). Poche stelle, ma **licenza pulita e manutenzione recente**:
per un progetto di cliente vale piu' di SplitType.

### 4.4 La CSS Custom Highlight API - quando serve e quando NO

**Cosa e'.** Permette di **colorare porzioni di testo senza toccare il DOM**. Si
creano `Range`, si mettono in un `Highlight`, lo si registra in `CSS.highlights`, e
lo si stila con lo pseudo-elemento `::highlight(nome)`. MDN e' esplicita:
*"without affecting the DOM structure in the page"*
([MDN, CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API)).

```js
const r = new Range();
r.setStart(nodoTesto, 0); r.setEnd(nodoTesto, 12);
CSS.highlights.set("letto", new Highlight(r));
```
```css
::highlight(letto) { color: #fff; background-color: transparent; }
```

**Il vantaggio e' enorme sul piano dell'accessibilita': il testo resta un testo
solo.** Nessuno `<span>`, quindi nessuno dei problemi della sezione 5, nessuna
`aria-label` da inventare, nessun `revert()` da ricordare, nessun costo di layout.

**Il limite e' assoluto e va capito subito.** La specifica CSS
([css-pseudo-4, "Styling Highlights"](https://drafts.csswg.org/css-pseudo-4/#highlight-styling))
elenca le sole proprieta' ammesse sugli pseudo-elementi di evidenziazione:

> `color`, `background-color`, `text-decoration` (e le sue proprieta',
> `text-underline-position`, `text-underline-offset`), `text-shadow`,
> `stroke-color`, `fill-color`, `stroke-width`, `text-emphasis`,
> `forced-color-adjust`, `color-scheme`

e motiva la restrizione: sono proprieta' che *"do not affect layout and can be
applied performantly in a highly dynamic environment"*.

**Tradotto: niente `transform`, niente `opacity`, niente `filter`, niente
`clip-path`.** Quindi:

| effetto | fattibile con Highlight API? |
|---|---|
| testo che si **accende parola per parola** (colore da grigio a bianco) | **si**, ed e' la via migliore |
| **evidenziatore** che avanza sul testo (`background-color`) | **si** |
| testo che **sale da dietro una maschera** | **no** |
| testo che entra **sfocato** (Trionn, Star Atlas) | **no** |
| **scramble** dei caratteri | **no** (cambia il testo, non lo stile) |
| lettere che **volano via** (Trionn `/services`) | **no** |

**Supporto browser** (dati di compatibilita' MDN, 13/08/2026): **Chrome 105**,
**Safari 17.2**, **Firefox 140**. MDN lo classifica **Baseline "newly available"
da giugno 2025** - cioe' e' recentissimo: **serve un ripiego** (il testo semplicemente
nel suo colore finale) per chi ha un browser piu' vecchio, ed e' un ripiego che non
costa nulla perche' lo stato di partenza e' il testo leggibile.

**Il caso vero in cui la useremmo domani:** il paragrafo di Opal Tadpole che si
accende parola per parola (sezione 7). Loro lo fanno con span e `opacity`; con
l'Highlight API sarebbe **lo stesso effetto, senza toccare il DOM e senza rompere
niente per gli screen reader**.

### 4.5 Il fai-da-te - quanto costa davvero

Cinque dei siti in tabella **non usano nessuna libreria di split**: Obys (motore
proprio su Web Animations API), Vero (splitter proprio su `Intl.Segmenter`), Zajno,
Aristide Benoist, Dogstudio (che **esplode il markup lato PHP**, non a runtime).

Uno splitter a parole e caratteri, con maschera e indici CSS, sta in una trentina di
righe:

```js
function spezza(el, {tipo = 'words', maschera = false} = {}) {
  const testo = el.textContent;
  const seg = new Intl.Segmenter('it', { granularity: tipo === 'chars' ? 'grapheme' : 'word' });
  const pezzi = [...seg.segment(testo)].filter(s => tipo === 'chars' || s.isWordLike || s.segment.trim());
  el.setAttribute('aria-label', testo);          // <-- sezione 5, obbligatorio
  el.textContent = '';
  pezzi.forEach((s, i) => {
    const dentro = document.createElement('span');
    dentro.textContent = s.segment;
    dentro.className = 'pezzo';
    let nodo = dentro;
    if (maschera) {
      const fuori = document.createElement('span');
      fuori.className = 'maschera';              // overflow: hidden; display: inline-block
      fuori.appendChild(dentro);
      nodo = fuori;
    }
    nodo.style.setProperty('--i', i);
    nodo.setAttribute('aria-hidden', 'true');    // <-- sezione 5, obbligatorio
    el.appendChild(nodo);
  });
  el.style.setProperty('--n', pezzi.length);
  return () => { el.textContent = testo; el.removeAttribute('aria-label'); };  // il revert
}
```

`Intl.Segmenter` e' la parte che rende il fai-da-te difendibile: **spezza correttamente
gli emoji, gli accenti composti e le scritture non latine**, cosa che un
`testo.split('')` non fa (rompe le coppie surrogate). E' lo stesso attrezzo che ha
scelto **Vero**.

**Quello che il fai-da-te non ti da', e per cui serve una libreria:**

1. **Le righe.** Spezzare a righe significa **misurare dove il browser manda a capo**,
   e rifarlo a ogni `resize` e a ogni font caricato. E' il 90% della complessita' di
   SplitText. Il metodo pulito e' `Range.getClientRects()` sui nodi di testo,
   raggruppando per coordinata `top` - **e' esattamente quello che fanno Trionn e 2xA**
   (`Range.getBoundingClientRect()`, `Range.getClientRects().length > 1`).
2. **`document.fonts.ready`.** Se misuri prima che il carattere sia pronto, le righe
   sono sbagliate. Lo dichiara esplicitamente il `drag-marquee.js` di Revelatio, che
   aspetta `document.fonts.ready` e le immagini **prima di misurare**.
3. **Gli elementi annidati** (`deepSlice`). Un `<em>` a cavallo di due righe rompe
   ogni splitter ingenuo.

> **Regola pratica.** Se ti servono **caratteri o parole**: fai-da-te o Splitting.js,
> e non pensarci piu'. Se ti servono **righe** che reggano il `resize`: SplitText con
> `autoSplit` + `onSplit`, versione bloccata, licenza dichiarata al cliente. Se ti
> serve solo **accendere il testo colore per colore**: Custom Highlight API, e non
> spezzi niente.

---

<a name="5"></a>
## 5. Il problema di accessibilita' che quasi tutti sbagliano

### Il guasto

Un titolo spezzato per lettera diventa questo:

```html
<h1><span>A</span><span>t</span><span>e</span><span>l</span><span>i</span><span>e</span><span>r</span></h1>
```

Un browser vede una parola. **Un lettore di schermo vede sette elementi separati e
li annuncia uno per uno: "A. Ti. E. Elle. I. E. Erre."** Il motivo e' meccanico:
molti screen reader trattano ogni elemento in linea come un confine di enunciato, e
il calcolo del nome accessibile concatena i contenuti dei figli senza sapere che
formavano una parola. Il risultato varia per combinazione motore/browser - alcuni
sillabano tutto, altri solo in modalita' di lettura o di navigazione a frecce - ma
**quando fallisce, il titolo principale del sito diventa incomprensibile**, e il
titolo principale e' proprio la cosa che stiamo curando di piu'.

Lo stesso vale per lo split a parole, in forma piu' lieve (pause innaturali, cadenza
a scatti) e per il **testo scramblato**, che per un attimo *e' davvero* un anagramma
e come tale viene letto.

### La riparazione, in due attributi

```html
<h1 aria-label="Atelier">
  <span aria-hidden="true">A</span><span aria-hidden="true">t</span>...
</h1>
```

- **`aria-label` sul contenitore**: rimpiazza il nome accessibile con il testo vero,
  intero.
- **`aria-hidden="true"` su ogni pezzo**: toglie i frammenti dall'albero
  dell'accessibilita', cosi' non vengono ne' letti ne' concatenati.

**Servono tutti e due.** Solo `aria-label` non basta su tutte le combinazioni,
perche' in modalita' di lettura alcuni screen reader percorrono comunque i figli.
Solo `aria-hidden` non basta perche' cancella il titolo senza sostituirlo.

Tre corollari che quasi nessuno scrive:

1. **Se il pezzo e' cliccabile, `aria-hidden` non si usa.** `aria-hidden` su un
   elemento focalizzabile e' un errore di validazione (elemento raggiungibile col
   Tab ma invisibile all'albero). Su un `<a>` spezzato: `aria-hidden` sui pezzi
   **dentro** il link e `aria-label` **sul link**.
2. **Va rimesso a posto.** Il `revert()` deve togliere anche gli attributi, o resti
   con un `aria-label` fossile che contraddice il testo se il contenuto cambia. E'
   quello che fa **Locomotive** con lo scramble: salva il testo in `aria-label`
   durante l'effetto e **lo rimuove al termine**.
3. **Anche il `title`/`h1` in canvas ha lo stesso problema, peggiore.** Vedi
   sezione 8.

### La verifica sui siti veri: quanti lo fanno bene

Questo e' il dato che vale da solo. Su **34 schede** in questa cartella, cercando
`aria-label`, `aria-hidden` e `aria:` nel codice letto:

| sito | cosa fa | esito |
|---|---|---|
| **Cuberto** | passa esplicitamente **`aria: "auto"`** a `SplitText.create()` su `h1..h6`: il lettore di schermo legge il testo vero e non i frammenti | **corretto, e deliberato** |
| **Locomotive** | lo scramble **salva il testo originale in `aria-label`** durante l'effetto e lo **ripristina** alla fine, cosi' gli screen reader non leggono l'anagramma | **corretto, sul solo scramble** |
| **Revelatio** | usa GSAP **3.15.0**: SplitText applica `aria: "auto"` **per impostazione predefinita**, quindi il beneficio c'e' - ma **non risulta una scelta dichiarata**, e lo scramble (che e' l'effetto principale) non e' coperto | **corretto per eredita' della libreria** |
| **Opal Tadpole** | `<h1 class="sr-only">` col titolo vero, `alt` ovunque, `role="presentation"` sulle icone, `aria-label` sui bottoni - ma GSAP **3.12.3**, cioe' SplitText **senza** gestione aria | **buono altrove, non sul titolo spezzato** |
| **2xA** | `aria-hidden="true"` sulle sonde di misura del canvas (`obs-probe`, `para-probe`) e paragrafo vero conservato in `visibility: hidden` | **corretto, ma e' un altro problema** (testo in canvas) |
| **Active Theory** | non spezza testo: **duplica tutta la pagina** in un `div.GLA11y` largo 0 con link e testi veri in ordine di lettura | **corretto per il caso WebGL** |
| **Don't Board Me, By-Kin, Star Atlas, Persepolis, Frans Hals, KPR** | SplitText/SplitType su versioni **precedenti** all'aprile 2025, o senza gestione aria: **nessun `aria-label`/`aria-hidden` sui pezzi** | **rotto** |
| **Mosby, Trionn, Immersive Garden, Dogstudio, Mana, Zajno, Vero, Aristide Benoist, Obys, Simply Chocolate, MA, Pangram Pangram** | nessuna traccia di gestione aria sul testo spezzato nel codice letto | **rotto o non documentato** |

**Il conto onesto: 2 su 34 lo fanno per scelta** (Cuberto sul titolo, Locomotive
sullo scramble). **Uno lo ottiene gratis** perche' e' su una versione recente della
libreria (Revelatio). **Tutti gli altri no.**

Vale la pena dire chi sono i due: **Cuberto** e **Locomotive** sono, guarda caso,
gli stessi due che compaiono in `_ACCESSIBILITA.md` fra i pochi con gestione del
focus e `:focus-within`. **Non e' un caso isolato: e' una cultura di studio.**

E vale la pena dire il rovescio: **Don't Board Me e Opal Tadpole sono due Site of
the Year, By-Kin ha vinto un Developer Award, Star Atlas era Site of the Year 2021.**
Il premio non passa da qui.

### La riga che ci distingue, e che costa zero

```js
// GSAP >= 3.13: e' gia' cosi'. Non toglierlo, e scrivilo esplicito nel codice
// perche' si veda che e' una scelta e non un caso.
const split = SplitText.create(h1, { type: "words,chars", mask: "words", aria: "auto" });
```

```js
// Senza GSAP: due righe. Non ce n'e' una terza.
el.setAttribute('aria-label', testoOriginale);
pezzi.forEach(p => p.setAttribute('aria-hidden', 'true'));
```

**Prova di collaudo, da fare a mano prima della consegna** (30 secondi, e' l'unico
modo serio): Windows -> avvia **NVDA** (gratuito) e premi Insert+Freccia giu' sul
titolo; macOS -> **VoiceOver** con Cmd+F5 e VO+A. Se senti sillabare, il titolo e'
rotto. Nessun controllo automatico lo segnala in modo affidabile: non e' un errore
di markup, e' un errore di *risultato*.

---

<a name="6"></a>
## 6. Il testo che scorre (marquee), senza JavaScript e con JavaScript

Il nastro di testo che scorre in orizzontale e' l'effetto tipografico piu' diffuso
dopo il reveal, ed e' l'unico che **non ha bisogno di essere innescato**: e' un moto
continuo, guidato dal tempo.

> Nota preliminare: **il tag `<marquee>` non si usa.** E' deprecato da anni e MDN
> ne sconsiglia esplicitamente l'uso. Quello che segue e' il nome dell'effetto, non
> del tag.

### 6.1 Senza JavaScript, 12 righe

Il trucco e' uno solo: **il contenuto e' duplicato**, e la traslazione si ferma
esattamente a meta'. Quando arriva a `-50%` la seconda copia e' nella posizione da
cui era partita la prima, e il salto non si vede.

```html
<div class="nastro" aria-label="Design. Sviluppo. Tipografia.">
  <div class="nastro__pista">
    <span aria-hidden="true">Design &middot; Sviluppo &middot; Tipografia &middot;&nbsp;</span>
    <span aria-hidden="true">Design &middot; Sviluppo &middot; Tipografia &middot;&nbsp;</span>
  </div>
</div>
```

```css
.nastro        { overflow: hidden; }
.nastro__pista { display: flex; width: max-content;
                 animation: scorri 40s linear infinite; }

@keyframes scorri { from { transform: translate3d(0,0,0); }
                    to   { transform: translate3d(-50%,0,0); } }

/* obbligatorio: vedi sezione 9 */
@media (prefers-reduced-motion: reduce) {
  .nastro__pista { animation-play-state: paused; }
}
```

Tre cose da sapere, tutte pagate da qualcun altro:

- **`linear` e' l'unico ease ammesso.** Un `ease` su un loop infinito produce un
  battito visibile a ogni giro. E' anche l'unico posto di tutto questo documento in
  cui `linear` e' giusto.
- **La velocita' si scrive in secondi per giro, non in pixel.** Revelatio: **50 s
  per giro**. Basement: il cursore con testo lungo diventa **un nastro a 7 s
  lineare infinito**. Active Theory: il ticker del brano e' `animation: ticker 9s
  linear infinite` **su due copie affiancate** - cioe' esattamente questo schema.
- **Serve `aria-label` sul contenitore e `aria-hidden` sui duplicati**, altrimenti
  lo screen reader legge il testo due volte. E' lo stesso problema della sezione 5,
  in un'altra forma, e nessuno lo scrive mai.

**La variante moderna, se il progetto puo' permettersela**: le animazioni guidate
dallo scroll di CSS (`animation-timeline: scroll()`) fanno avanzare il nastro con la
pagina invece che col tempo, **senza una riga di JavaScript e senza un
`requestAnimationFrame`**. E' la stessa idea del paragrafo 6.2, a costo zero - ma il
supporto e' piu' stretto della Highlight API, quindi va trattata come miglioramento
progressivo: il nastro deve funzionare in `linear infinite` anche senza.

### 6.2 Con JavaScript: il nastro che sente lo scroll

E' qui che si vede la differenza fra un sito da 3k e uno da 20k. Il nastro **non
scorre a velocita' costante: accelera quando l'utente scorre, e cambia verso quando
si scorre all'indietro.** E' un effetto legato allo scorrimento, non al mouse: dentro
il nostro vincolo.

**La formula di darkroom.engineering** (gli autori di Lenis), letta nel loro sito:

```js
// avanzamento per frame
r = 0.1 * speed * (1 + Math.abs(lenis.velocity) / 5) * deltaTime;
x = modulo(x - r, larghezzaContenuto);
elemento.style.transform = `translate3d(${-x}px,0,0)`;
```

- `modulo(x, larghezza)` (**modulo vero, non `%`**, che in JS va in negativo) e' il
  ciclo infinito senza duplicare all'infinito: loro ripetono il contenuto `repeat: 10`
  volte e riavvolgono.
- **`* deltaTime`, non un valore fisso per frame**: e' la differenza fra un nastro
  che va uguale a 60 e a 144 Hz e uno che raddoppia di velocita' sui monitor veloci.
  Lo stesso errore e' documentato in `_PRELOADER.md`.
- **Si ferma quando esce dal viewport** (`IntersectionObserver`). Un nastro che gira
  invisibile e' consumo di batteria puro.

**La variante di 2xA**, che separa i due contributi:

```js
progress -= dir * 0.0085 * dt / ratio;         // moto proprio, costante
progress -= velocity * dt * 0.005 / ratio;     // spinta dello scroll
```

**Cuberto** usa un modulo interno chiamato "Reeller" con un plugin `scroller`
(`speed: 15, multiplier: .3, reversed: true`), sulle pagine progetto.

**Revelatio ha buttato GSAP proprio qui**, e ha scritto perche' nel commento del
sorgente: `drag-marquee.js`, **6.403 byte, 185 righe**, dichiara di non dipendere da
GSAP/ScrollTrigger/Observer perche' *"nao existe corrida de carregamento de libs"* -
non c'e' gara di caricamento fra librerie. Su un sito Webflow, dove le librerie
arrivano da CDN in ordine non garantito, **il vanilla e' piu' robusto**. E aspetta
`document.fonts.ready` **e le immagini** prima di misurare la larghezza, altrimenti
il punto di riavvolgimento e' sbagliato.

**La regola che li unisce tutti e quattro: un solo `requestAnimationFrame` per tutto
il sito.** darkroom e 2xA usano **Tempus** con `autoRaf: false` su Lenis; Cuberto e
Don't Board Me agganciano Lenis a `gsap.ticker` con `lagSmoothing(0)`. Un nastro che
si apre il proprio loop e' un nastro che compete con lo scroll morbido, e si vede.

**Libreria pronta, se serve**: `reeller` (96 stelle, **MIT**, ultimo push
**07/05/2026** - l'unica ancora viva nel censimento di `_CODICE-PUBBLICO-2.md`).

---

<a name="7"></a>
## 7. Il testo che si rivela sullo scorrimento, parola per parola

E' il pattern piu' redditizio di tutto il documento: **fa leggere**. Un elenco di
funzionalita' viene saltato; lo stesso elenco scritto come frase che si accende
parola per parola **viene letto fino in fondo**, perche' l'unico modo per finirla e'
continuare a scorrere.

### La meccanica canonica - Opal Tadpole, Site of the Year 2024

Dalla scheda (`opal-tadpole.md`, sezione "Tre cose da rubare"):

1. Spezzi il testo in `<span>` (a mano nel markup, o con uno splitter);
2. metti gli span a `opacity: 0`;
3. **blocchi la sezione** con `ScrollTrigger` `pin` + `scrub: 1`;
4. in `onUpdate` calcoli quante parole sono accese:
   ```js
   const i = Math.floor(progress * (n + 1)) - 1;   // n = numero di parole
   ```
   e aggiungi una classe agli span fino a `i`.

**Il pin e' la parte non negoziabile.** Senza pin la frase scorre via mentre si
accende e l'effetto non si legge; con il pin la pagina si ferma, **il tempo diventa
lo scroll**, e la lettura e' obbligata. Opal blocca **due schermate**.

**La parte che fa la differenza**, sempre da Opal: **fra le parole ci sono dei
`<video>` da 80 px** con lo stesso trattamento, che scattano a `scale(1.7)` e partono
in riproduzione quando arriva il loro turno. Quattro animazioni da 15-20 KB l'una,
**0,57 MB in tutto**. Il visitatore *legge* le funzioni invece di scorrere una lista
di icone. Funziona identico per un servizio, non solo per un oggetto.

### La rifinitura che nessuno copia - Revelatio

Revelatio fa la stessa cosa su una sezione "citta'" alta **400vh sticky**, ma
l'opacita' per parola non e' un interruttore: e' una **campana triangolare larga
+/- 1 parola**, con transizione `.12s linear`. Cioe' **tre parole sono
contemporaneamente in transizione**: quella che si accende, quella prima che si sta
gia' spegnendo, quella dopo che sta arrivando. Il risultato e' un fascio di luce che
scorre sul paragrafo, non un cursore a scatti.

E' cinque righe di differenza:

```js
// invece di: acceso = (indice <= i)
const d = Math.abs(indice - posizione);          // posizione = progress * n, con decimali
span.style.opacity = Math.max(0.25, 1 - d);      // campana triangolare, ampiezza 1 parola
```

### Le varianti misurate

| sito | cosa si accende | innesco | nota |
|---|---|---|---|
| **Opal Tadpole** | parole + videini in linea | `pin` + `scrub: 1` su 2 schermate | opacita' 0 -> 1 per classe |
| **Revelatio** | parole | 400vh `sticky` | campana triangolare, `.12s linear` |
| **Trionn** (`.home-about`) | **caratteri** | scrub | componente `FadeOnScroll`: SplitText + colorazione dei caratteri in scrub |
| **Mammut** (SOTY 2020) | frasi intere su `position: sticky` | scroll | **lo zoom cresce con la specificita' della frase**: 1.2 storia, 1.5 materiale, 1.7 prestazione, 1.0 quando arriva il numero |

Il caso Mammut merita una riga in piu' perche' e' l'unico che **lega l'ampiezza del
movimento al contenuto**: piu' la frase e' concreta, piu' la telecamera si avvicina,
e sul dato numerico torna a 1.0. E' fatto **senza GSAP, senza Locomotive, senza
WebGL**: Framer Motion piu' un `requestAnimationFrame` scritto in casa.

### Le due regole, e i due errori

1. **Il testo deve essere leggibile anche a effetto spento.** Lo stato di partenza
   non e' `opacity: 0`, e' `opacity: .25` (o il colore attenuato). Se lo scroll si
   inceppa, se il JS non parte, se l'utente ha il movimento ridotto, **la frase c'e'
   comunque**. Opal parte da 0 ed e' il suo unico difetto in questo punto.
2. **Non piu' di una frase per sezione bloccata.** Il pin sospende lo scorrimento
   della pagina: e' un debito che si paga in fastidio. Una frase da 20 parole su due
   schermate e' il massimo che il campione mostra.

**Errore 1 - accendere una lettera per volta.** Le lettere non si leggono: si legge
per parole. Un reveal per lettera in scrub costringe a scorrere venti volte tanto e
non aggiunge niente. Trionn lo fa e **e' l'unico caso in cui la sua scheda segnala
un attrito**.

**Errore 2 - accendere anche all'indietro.** Se l'effetto si riavvolge scorrendo su,
la frase si spegne mentre la si rilegge. Il rimedio e' un `once` sul progresso
massimo raggiunto: `posizione = Math.max(posizioneMax, progress * n)`.

---

<a name="8"></a>
## 8. Tipografia cinetica pesante: quando conviene il WebGL con MSDF

### Cos'e' l'MSDF, in una riga

Un **campo di distanza multicanale**: il carattere e' un atlante di immagini in cui
i tre canali RGB codificano la distanza dal contorno del glifo, e lo shader
ricostruisce il bordo con `median(r,g,b)` piu' `fwidth` e `smoothstep`. Risultato:
**una texture piccola resta nitida a qualunque ingrandimento**, e il testo diventa un
oggetto 3D come tutti gli altri.

La formula, identica su tre siti diversi del campione:

```glsl
float d = max(min(r,g), min(max(r,g), b)) - 0.5;   // mediana dei tre canali
float a = clamp(d / fwidth(d) + 0.5, 0.0, 1.0);    // antialiasing
```

(Immersive Garden, Zajno, Vero - quest'ultimo con una soglia animata da `0.8` a `0`
**per glifo**, sfalsata da un `uStagger`, mossa da `uTime` con `easeOutCubic`. Cioe':
**lo stagger della sezione 2, ma dentro lo shader.**)

### Chi lo usa, e per cosa

| sito | uso | dato |
|---|---|---|
| **igloo.inc** (SOTY 2024) | **tutto** il testo del sito | atlante `IBMPlexMono-Medium-datatexture.ktx2`, un **worker dedicato** (`msdfworker`), corpo espresso in unita' di scena (`size: .13`), `lineHeight: 0.8` |
| **Immersive Garden** | l'`h1` dell'eroe | **tre** atlanti (`PSTimesBody` 77 KB, `Helvetica-neue` 68 KB, `TimesNowNumbers`); l'`h1` HTML resta `visibility: hidden` **anche a 390 px** |
| **Zajno** | la sola scritta `ZAJNO(R)` | **sei texture 1920x728**, una per lettera; `hoMsdf: { delay: [1200, 60], d: 1600 }` |
| **Vero** | il marchio nell'eroe e nel piede | `font.png` **87 KB**; ripiego su un `<Brand>` SVG se WebGL manca |
| **Lando Norris** (SOTY 2025) | testo in scena | `Brier-Bold-02.webp`, **117 KB** |
| **Messenger / Bruno Simon**, **Prometheus Fuels**, **Star Atlas** | marchi e titoli | worker dedicati |

Otto siti su 34. **Sono tutti Site of the Year o vincitori di Developer Award** -
e sono anche, in gran parte, gli stessi che `_ACCESSIBILITA.md` conta fra i casi di
**testo dentro canvas**, difetto di livello A.

### Quando conviene, e quando no

**Conviene solo se il testo deve fare qualcosa che il DOM non sa fare.** In pratica,
quattro casi:

1. **Il testo vive nello spazio 3D**: si inclina, attraversa la telecamera, entra nel
   fuoco (`depth of field`), riceve luce. Igloo lo fa: il corpo non e' in pixel, e'
   in unita' di scena, quindi **scala con la telecamera**.
2. **L'effetto e' per-pixel**: distorsione da flowmap, dissolvenza a soglia,
   aberrazione. La `_ACCESSIBILITA.md` e la scheda igloo fanno lo stesso ragionamento:
   lo "scramble" fatto in shader e' **uno spostamento di offset sulle coordinate UV**
   - costo sul layout del browser: **zero**.
3. **Il numero di glifi animati e' alto** (centinaia). Sopra qualche centinaio di
   `<span>` animati, il costo non e' il disegno: e' il **layout**. Un
   `translate3d` su 500 span e' 500 elementi promossi a livello; in WebGL e' un
   `drawcall`.
4. **Il carattere e' cosi' grande da vedersi il contorno**: sopra i 200-300 px, un
   `<span>` con `font-size` va benissimo, ma se ci devi applicare uno shader l'MSDF
   ti da' il bordo nitido a costo costante.

**Non conviene, e va detto al cliente, quando:**

- **Il testo e' contenuto.** Un titolo di sezione, un paragrafo, una voce di menu:
  DOM, sempre. Il testo in canvas non lo legge **ne' un lettore di schermo, ne'
  ChatGPT, ne' Google** (`_ACCESSIBILITA.md`, `_SEO-E-AI.md`). igloo.inc, Site of the
  Year 2024, ha **1.410 byte di HTML, 0 caratteri di testo, 0 `<h1>`** e il canvas
  dentro uno **shadow root chiuso**: e' il caso limite, e non e' un modello da
  vendere a un'azienda che vive di ricerche.
- **Il budget non regge il doppio livello.** Se lo fai, lo devi fare come **Active
  Theory**: un `div.GLA11y` largo 0 px con `clip: rect(0 0 0 0)` che contiene link e
  testi veri **in ordine di lettura**, registrati oggetto per oggetto. E' la
  soluzione corretta ed e' **lavoro in piu'**, non un ripiego gratuito.
- **Il carattere e' variabile o cambia in corsa.** L'atlante e' cotto: un peso nuovo
  e' un atlante nuovo.

### La soglia pratica

> **Sotto i ~200 glifi animati contemporaneamente, il DOM vince.** Costa meno,
> e' accessibile, e' indicizzabile, si corregge in CSS. Sopra, o quando il testo deve
> stare **dentro** una scena 3D esistente, si passa a MSDF - **e si scrive nel
> preventivo la riga del doppio livello accessibile.**

Attrezzi: `troika-three-text` (pronto), `msdf-bmfont-xml` (genera l'atlante),
`activetheory/svg2msdf` (**28 stelle, dallo studio, per generare campi di distanza
da SVG**).

E il controesempio che chiude il discorso: **Mosby ha vinto il Site of the Day del
13/08/2026 senza una riga di WebGL** - CSS 3D puro e GSAP Flip, con il titolo
dimensionato come frazione della colonna. **By-Kin** ha vinto il Developer Award con
**zero immagini animate su 31** e una scala tipografica su `html { font-size }`.

---

<a name="9"></a>
## 9. `prefers-reduced-motion`: quanti lo rispettano davvero

Il conto e' gia' fatto in `_ACCESSIBILITA.md` e va riportato qui perche' **le
animazioni di testo sono la prima cosa che deve spegnersi**: sono l'unica categoria
di movimento che ogni visitatore attraversa, sempre, su ogni pagina.

### Il conto

**Su 34 schede, 17 nominano `prefers-reduced-motion`. Di queste 17, la stragrande
maggioranza lo nomina per dire che non c'e'.** Il dettaglio, verificato nel CSS e nel
JS dei bundle:

| sito | cosa fa davvero, sul CSS letto |
|---|---|
| **Apple** | **97 occorrenze** di `ReducedMotion` nel JS, una sola `@media` nel CSS. **Non attenua: elimina.** Con la preferenza attiva `<html>` riceve `no-enhanced` e la pagina diventa statica |
| **Vero** | `@media (prefers-reduced-motion: reduce)` che **azzera tutto a `.01ms`**, piu' la freccia di scroll disattivata. **Ma il titolo di Vero e' CSS puro, quindi qui funziona davvero**; non copre l'`anime.js` pilotato con `timeline.seek()` |
| **Trionn** | **attenua** (la rotazione del simbolo 3D da `0.0042` a `0.0015` per frame) ma **non disattiva** la sequenza scrubbata, l'esplosione del testo, i pin. Il `BlurTextReveal` resta acceso |
| **Revelatio** | **solo gli odometri** lo onorano. Scramble, ASCII shader, marquee, logo che si sbriciola: sempre attivi |
| **2xA** | **una sola regola**, e riguarda la libreria dei cookie |
| **Locomotive** | pannello cookie + un componente. Nel JS **non compare mai**: preloader, scramble, de-pixelate non lo rispettano |
| **Pangram Pangram** | **una sola occorrenza** in tutto il bundle; la parallasse non si spegne |
| **Darkroom** (autori di Lenis) | Lenis ha `respectReducedMotion` (default `true`) **sul ramo main**, ma **non nella 1.3.25 che gira sul loro sito** |
| **By-Kin, Aristide Benoist, Cuberto, Lando Norris, Lusion, Mosby, Opal Tadpole, Zajno, Simply Chocolate** | **zero occorrenze** in CSS e JS |

**Tradotto sul nostro tema: sui 20 siti della tabella della sezione 1, quelli che si
spengono davvero con la preferenza attiva sono uno - Vero - e per un caso fortunato
(il titolo e' in CSS, e il reset globale copre il CSS).** Nessun altro.

Fra questi ci sono **Lusion (SOTY 2023, 44 schermate dentro un tunnel), Opal Tadpole
e Don't Board Me (SOTY 2024), Mosby (SOTD 2026)**. E **2xA ha preso 6,60 in
accessibilita' contro 8,20 in animations/transitions**: e' il ritratto esatto del
problema.

### Come si fa bene sul testo, in concreto

Il reset globale e' il pavimento, non la casa (`_ACCESSIBILITA.md`, 2.1):

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

`0.01ms` e non `0` **perche' con `0` gli eventi `transitionend` e `animationend` non
vengono emessi**, e qualunque JavaScript che li aspetti per proseguire (preloader,
transizioni di pagina) si blocca. E' il tipo di dettaglio che si paga una volta sola.

Ma il reset non tocca GSAP, anime.js, Lottie e le sequenze scrubbate. Per il testo
servono tre cose in piu':

```js
// 1. GSAP: matchMedia, e la timeline del titolo semplicemente non nasce
gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
  const split = SplitText.create(h1, { type: "words", mask: "words", aria: "auto" });
  gsap.from(split.words, { yPercent: 100, duration: 1.2, ease: "expo.out",
                           stagger: { amount: .5 } });
  return () => split.revert();     // con la preferenza attiva: DOM pulito, testo intero
});
```

```js
// 2. Il reveal in scrub: niente pin, tutto acceso subito
const ridotto = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (ridotto) { parole.forEach(p => p.classList.add('acceso')); }
else         { /* pin + scrub */ }
```

```css
/* 3. Il nastro: si ferma, non sparisce */
@media (prefers-reduced-motion: reduce) { .nastro__pista { animation-play-state: paused; } }
```

**La tabella delle decisioni sul testo** (deriva dalla regola generale di
`_ACCESSIBILITA.md`: **cio' che si sposta o cambia scala scatena i disturbi
vestibolari, cio' che cambia solo opacita' o colore no**):

| effetto tipografico | con movimento ridotto |
|---|---|
| lettere/parole che **salgono da una maschera** | **spegnere** - c'e' spostamento |
| testo che entra **sfocato** (Trionn, Star Atlas) | **spegnere** o ridurre a dissolvenza |
| **scramble** dei caratteri | **spegnere**: e' anche un rischio cognitivo, non solo vestibolare |
| **nastro** che scorre | **mettere in pausa** (e comunque serve un comando di pausa: **WCAG 2.2.2 e' livello A**) |
| **reveal parola per parola** in opacita' | **si puo' tenere**, ma **senza pin**: e' il pin il problema, non l'opacita' |
| dissolvenza semplice, cambio di colore | **si puo' tenere** |

Ultima riga, commerciale: `prefers-reduced-motion` in senso stretto e' **WCAG 2.3.3,
livello AAA - facoltativo**. Ma **2.2.2 Pause, Stop, Hide e' livello A**, e riguarda
tutto il movimento che parte da solo e dura piu' di 5 secondi. **Il nastro di testo
in loop e' esattamente quello.** Quindi: il comando di pausa sul marquee **non e'
opzionale**.

---

<a name="10"></a>
## 10. Il decalogo, con le durate in millisecondi

### Le durate, tutte in un posto solo

| cosa | valore | da dove viene |
|---|---|---|
| **onda su un titolo (totale della cascata)** | **400-600 ms** | Cuberto `amount .6`, Opal `amount .4`, e la convergenza calcolata in sezione 2 |
| **sfasamento per carattere** | **25 ms** (banda 20-40) | Dogstudio, Mosby, Persepolis, Aristide 22-40 |
| **sfasamento per parola / riga** | **100 ms** (banda 60-200) | Vero, Immersive Garden, Pangram, Persepolis, Revelatio |
| **sfasamento minimo, mai sotto** | **20 ms** | il `clamp(..., 20, ...)` di Obys |
| **sfasamento per riga di un titolo da 2-3 righe** | **200 ms** | Don't Board Me, Mosby |
| **durata del singolo pezzo, titolo dell'eroe** | **1200-1600 ms** | mediana del campione; 1600 su Aristide, Obys, Zajno |
| **durata del singolo pezzo, titolo in pagina** | **600-900 ms** | Revelatio 600, Mosby 900, Don't Board Me 800, MA 800 |
| **durata di un testo di servizio / interfaccia** | **600-750 ms** | Vero corsivi 600, Pangram 750 |
| **uscita (nascondere) del testo** | **~1/3 dell'entrata**: 400-600 ms | Aristide 500 contro 1600, Obys 600 contro 1600 |
| **ritardo prima che il titolo parta** | **400-550 ms** dopo il preloader | Don't Board Me 400, Vero `+ .55s` |
| **nastro di testo, un giro** | **40-50 s** | Revelatio 50, il valore corrente 40 |
| **reveal parola per parola in scrub** | **una-due schermate di pin**, non di piu' | Opal (2 schermate), Revelatio (400vh) |

### Le curve

| serve | usa | equivalente CSS |
|---|---|---|
| titolo che entra da una maschera | `expo.out` | `cubic-bezier(.19, 1, .22, 1)` |
| titolo che entra con spostamento | `power4.out` / `power3.out` | `cubic-bezier(.22, 1, .36, 1)` (out-quint) |
| testo di servizio, dissolvenza | `power2.out` / out-sine | `cubic-bezier(.61, 1, .88, 1)` |
| nastro in loop | **`linear`, e solo `linear`** | `linear` |
| uscita | `power2.in` / in-cubic | `cubic-bezier(.32, 0, .67, 0)` |

**Un solo ease per tutto il sito e' una scelta legittima e vincente**: Cuberto usa
`expo.out` **ovunque**, con cinque primitive in croce, e la sua scheda conclude che
*"la coerenza non viene dalla varieta': viene dal ripetere le stesse cinque cose"*.

---

### FARE

1. **Scegli l'onda, non il ritardo.** Decidi che la cascata attraversa il titolo in
   **500 ms** e lascia dividere alla libreria (`stagger: {amount: .5}`) o al tuo
   `ONDA / n`. Con un pavimento a **20 ms**. Cosi' il titolo di tre parole e quello
   di quindici hanno lo stesso ritmo, e non devi ritoccare niente quando il cliente
   cambia il testo.
2. **Metti `aria-label` sul contenitore e `aria-hidden` sui pezzi. Sempre.** Con
   GSAP >= 3.13 e' `aria: "auto"` ed e' gia' il default: **scrivilo lo stesso**, in
   chiaro, cosi' si vede che e' una decisione. Senza GSAP sono due righe. **Lo fanno
   2 studi su 34: e' la cosa piu' facile da fare meglio di chi vince i premi.**
3. **Anima con una maschera** (`overflow: hidden` + `translateY(100%)`), quando
   puoi. E' la firma che separa i nove lavori di fascia alta del campione dagli altri,
   e con SplitText costa una parola (`mask: "words"`).
4. **Decelera sempre.** `expo.out`, `power4.out`, out-quint. Nel campione **non
   esiste un titolo animato in `linear`**, tranne i nastri in loop, dove `linear` e'
   invece obbligatorio.
5. **Anima una volta sola.** `once: true`. Nessuno dei 21 casi misurati riavvolge il
   titolo quando si torna indietro.
6. **Spezza a righe o a parole per i testi lunghi, a caratteri solo per i display.**
   Le lettere si leggono bene solo su una-due parole gigantesche. Persepolis lo dice
   in modo definitivo: per **arabo, farsi e hindi** usa una variante **per righe**,
   perche' spezzare a caratteri **rompe la scrittura corsiva**.
7. **Aspetta i font prima di misurare le righe.** `await document.fonts.ready`, e
   ricalcola al `resize` (`autoSplit` + `onSplit` in SplitText). Righe misurate col
   font di ripiego sono righe sbagliate - e' lo stesso motivo per cui il
   `drag-marquee.js` di Revelatio aspetta font **e** immagini.
8. **`revert()` quando hai finito.** La documentazione GSAP lo dice: tenere centinaia
   di nodi in vita *"can be expensive"*. Revelatio fa `SplitText` sull'`h1` e poi
   `revert()`: **il DOM torna pulito**. E il `revert` deve togliere anche gli
   attributi aria.
9. **Un solo `requestAnimationFrame` per tutto il sito.** Nastri, reveal, scroll
   morbido: tutti nello stesso tick (`gsap.ticker` con `lagSmoothing(0)`, o Tempus
   con `autoRaf: false` su Lenis). E' quello che fanno darkroom, 2xA, Cuberto,
   Don't Board Me - ed e' il motivo per cui 2xA prende **8,00 di WPO** con otto
   canvas in pagina.
10. **Blocca la versione di GSAP e dichiarala al cliente** come *licenza proprietaria
    d'uso gratuito concessa da Webflow*. Mai `^`. Tieni una copia del pacchetto.

### NON FARE

1. **Non spezzare un titolo in `<span>` senza gli attributi aria.** E' l'errore
   numero uno di questo documento e lo commettono, misurati, **due Site of the Year e
   un Developer Award**.
2. **Non usare `linear` su un reveal**, e non usare un `ease` su un nastro in loop.
   Sono i due errori simmetrici, e si vedono entrambi al primo colpo d'occhio.
3. **Non far partire il testo da `opacity: 0` se l'effetto e' legato allo scroll.**
   Parti da `.25`. Se il JS non arriva, se lo scroll si inceppa, se il movimento e'
   ridotto, **la frase deve esserci**.
4. **Non mettere il testo in canvas per farlo sembrare costoso.** Sotto ~200 glifi
   animati il DOM vince su tutta la linea. igloo.inc e' Site of the Year 2024 con
   **0 caratteri di testo nel DOM**: e' un caso limite di uno studio che vende
   se stesso, non un modello per un'azienda che vive di ricerche.
5. **Non lasciare un nastro che gira fuori dal viewport.** `IntersectionObserver` e
   si ferma. E **non avanzare di un valore fisso per frame**: `* deltaTime`, sempre,
   o a 144 Hz va al doppio.
6. **Non accendere il testo lettera per lettera in scrub.** Si legge per parole. E
   non farlo riavvolgere all'indietro: `Math.max(posizioneMax, ...)`.
7. **Non bloccare (`pin`) piu' di una frase per sezione.** Il pin sospende lo
   scorrimento: e' un debito che l'utente paga in fastidio.
8. **Non fidarti del reset globale `prefers-reduced-motion` per spegnere il testo.**
   Copre il CSS, non copre GSAP, anime.js, Lottie e gli scrub. Serve `matchMedia` nel
   JS. E' esattamente il buco di **Vero**, che il reset ce l'ha.
9. **Non usare `split-type` su un progetto di cliente** (275.880 scaricamenti al mese,
   **nessuna licenza**, fermo da dicembre 2023). Se serve un'alternativa libera:
   **Splitting.js** (MIT) o **`activetheory/split-text`** (MIT, giugno 2025).
10. **Non trattare GSAP come open source.** Non lo e' mai stato. Nessun file di
    licenza nel repository, proprieta' intellettuale di Webflow, **licenza revocabile
    e modificabile unilateralmente da un concorrente commerciale**.

---

## Fonti

**Interne** (questa cartella, tutte con codice letto): `_PATTERN.md` (P3),
`_ACCESSIBILITA.md` (1.2, 1.4, 2.1-2.3), `_LIBRERIE-DEGLI-STUDI.md` (licenza GSAP),
`_CODICE-PUBBLICO-1.md` (repo Active Theory), `_CODICE-PUBBLICO-2.md`
(`drag-marquee.js`, `reeller`), `_PRELOADER.md` (il `* deltaTime`), `_SEO-E-AI.md`
(testo in canvas e indicizzazione), e le 20 schede citate nella sezione 1
(21 righe di tabella: Mosby compare due volte, per il titolo e per la transizione).

**Esterne**, interrogate il **13/08/2026**:

- GSAP SplitText, documentazione ufficiale: https://gsap.com/docs/v3/Plugins/SplitText/
- GSAP 3.13, note di rilascio (29/04/2025): https://gsap.com/blog/3-13/
- GSAP, licenza standard: https://gsap.com/standard-license
- API GitHub: `greensock/GSAP` (27.666 stelle, **licenza `null`**),
  `shshaw/Splitting` (1.756 stelle, MIT, push 19/06/2024),
  `lukePeavey/SplitType` (727 stelle, **licenza `null`**, push 03/12/2023),
  `activetheory/split-text` (69 stelle, MIT, push 05/06/2025)
- Registro npm e API scaricamenti (11/07-09/08/2026): `gsap` 17.369.658/mese,
  `split-type` 275.880/mese, `splitting` 69.378/mese (v1.1.0 del 31/05/2024,
  MIT, 37.442 byte)
- Splitting.js, guida: https://splitting.js.org/guide.html
- MDN, CSS Custom Highlight API: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API
- MDN browser-compat-data, `api.Highlight`: Chrome **105**, Safari **17.2**,
  Firefox **140**
- W3C, CSS Pseudo-Elements Level 4, "Styling Highlights":
  https://drafts.csswg.org/css-pseudo-4/#highlight-styling
- W3C, Media Queries Level 5, `prefers-reduced-motion`:
  https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion
- W3C WAI, Understanding SC 2.2.2 Pause, Stop, Hide (livello A) e 2.3.3 Animation
  from Interactions (livello AAA)

**Non verificato, e lo dico:** non ho ascoltato personalmente con NVDA/VoiceOver i
titoli spezzati dei siti in tabella; il giudizio della sezione 5 e' basato sulla
**presenza o assenza degli attributi nel codice letto** e sulla versione della
libreria. Le durate marcate "non rilevata" nella tabella della sezione 1 sono quelle
che le schede di origine non riportano. Le versioni GSAP di **Mosby** e **Immersive
Garden** non compaiono nelle rispettive schede, quindi la loro riga nella tabella
della sezione 5 e' un "non documentato", non un "rotto" accertato.
