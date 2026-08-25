# La tipografia dei siti da premio, misurata

- **Scritto il**: 13/08/2026
- **Metodo**: per ogni sito ho scaricato con `curl` l'HTML servito e tutti i CSS
  collegati, ho estratto i blocchi `@font-face` (nome della famiglia, `src`,
  `font-display`, `font-weight`) e poi ho **scaricato ogni file font** misurando
  il peso reale in KB (`curl -o /dev/null -w '%{size_download}'`). Niente browser
  condiviso: solo `curl`, WebSearch e WebFetch.
- **Cosa NON e' misurato**: il rendering vero in pagina. Le dimensioni della
  sezione 6 sono lette **dal CSS**, non da `getComputedStyle` su un browser reale,
  quindi dove una regola sta dentro una media query o eredita da un `em` di
  contesto lo dico esplicitamente. Dove non ho potuto verificare, scrivo
  **non verificato**.
- **Un limite onesto**: i siti con font caricati da JavaScript (Igloo, Resn,
  Active Theory in parte) non espongono i `@font-face` nell'HTML servito. Per
  quelli l'estrazione e' parziale e lo segnalo.

---

## 0. Le sette cose da portarsi via

1. **Il budget tipografico mediano di un sito da premio e' 105 KB.** Il quartile
   buono sta **sotto i 65 KB**. Record al ribasso: Obys, **un solo woff2 da 6 KB**.
   Record al rialzo: KPR, **1,2 MB** -- che e' un errore, non una scelta.
2. **Il Site of the Year 2024 (Igloo Inc.) usa un font gratis, e uno solo**:
   IBM Plex Mono, due tagli, 77 KB, licenza OFL, costo zero. Non serve un font
   costoso per vincere.
3. **Nessuno carica piu' di 3 famiglie**, e la coppia che torna piu' spesso e'
   **grotesque neutra + monospaziata** (7 siti su 26), non serif + sans.
4. **Inter, Satoshi e General Sans -- i tre gratis piu' consigliati online -- non
   compaiono in nessuno dei 26 siti misurati.** I gratis che compaiono davvero
   sono altri: IBM Plex Mono, Geist, Manrope, Familjen Grotesk, Martian Mono,
   Rubik, Mona Sans, Space Mono.
5. **Il titolo di home sta fra i 120 e i 380 px a 1920**, con `letter-spacing`
   fino a **-0.08em** e `line-height` fino a **0.672**. Il rapporto titolo/corpo
   va da 10:1 a 24:1. Un sito aziendale normale sta su 3:1: **e' li' la
   differenza visiva**, non nel font.
6. **Una famiglia di fonderia indipendente, desktop + web, per un cliente da
   100.000 visite/mese, costa fra 1.000 e 2.000 USD.** Va intestata al **cliente**
   e messa a preventivo come **voce separata**. (Sezione 3.)
7. **Il testo sta nel DOM, non dentro il WebGL.** Un atlas MSDF con gli accenti
   italiani pesa **321 KB**; un font variabile intero ne pesa **29-47**. Lo fanno
   tutti gli studi misurati, e hanno ragione. (Sezione 5.)

E i due errori che ho trovato davvero, in produzione, su siti premiati:
**un font `*Trial*` servito da Vero** (licenza probabilmente mancante) e
**cinque siti che servono `.ttf`/`.otf` non convertiti** buttando fra i 100 e i
440 KB a testa.

---

## 1. TABELLA -- i font reali dei siti schedati

Peso = file scaricato davvero il 13/08/2026. `n` tagli = numero di file
`@font-face` distinti serviti dallo stesso sito.

| Sito | Famiglia | Fonderia | Formato | Peso woff2 | Tagli | font-display |
|---|---|---|---|---|---|---|
| **Lusion** `lusion.co` | Aeonik | CoType Foundry | woff2 + woff | 30 / 43 / 31 KB | 3 (Regular, Medium, Regular Italic) | `block` |
| | IBM Plex Mono | IBM (OFL, gratis) | woff2 + woff | 38 / 39 KB | 2 (Regular, Medium) | `block` |
| | LusionMono | custom / subset proprio | woff2 | **1 KB** | 1 | `block` |
| **Obys** `obys.agency` | ObysSans4 | custom, marchiata Obys | woff2 | **6 KB** | **1** | `swap` |
| **basement.studio** | Geist + Geist Mono | Vercel (OFL, gratis) | woff2 variabile | 22 / 28 KB | variabile `100 900` | `swap` |
| | flauta | display custom | **ttf** (non convertito) | 42 KB | 1 | `swap` |
| **darkroom.engineering** | Replica LL Web Bold | Lineto | woff2 | 65 KB | 1 | `swap` |
| | Replica Mono LL Web | Lineto | woff2 | 35 KB | 1 | `swap` |
| | AS Therma Bold Condensed | non verificata | woff2 | **2 KB** (subset) | 1 | `swap` |
| | AS Module 2 VF | non verificata, **variabile** | woff2 | 13 KB | 1 (VF) | `swap` |
| **Active Theory** | NB Architekt Std | Neubau (NB), Berlino | woff2 + woff + otf | 18 KB (woff2) | 3 (Light, Regular, Bold) | non dichiarato |
| **Aristide Benoist** | `jw` (nome offuscato) | non verificata | woff2 | **4 KB** | 1 | `swap` |
| | `t` / TNY | non verificata | woff2 | **2 KB** | 1 | `swap` |
| **KIN** `by-kin.com` | Apercu Pro | **Colophon Foundry** | woff2 + woff | 27 KB (Regular) | **5** (Reg, Med, Bold + 3 corsivi) | `swap` |
| | Apercu Mono Pro | Colophon Foundry | woff2 + woff | 39 KB (woff) | 1 | `swap` |
| **Cuberto** | Suisse Int'l | Swiss Typefaces | woff2 + woff | 16 / 17 / 17 / 17 / 5 KB | **5** (Light, Reg, Med, Semibold, Bold) | `swap` |
| | Manrope | Mikhail Sharanda (OFL, gratis) via Google | woff2 **variabile** `200 800` | 2-23 KB per subset | 6 subset unicode | `swap` |
| **Dogstudio** | GT Sectra Display | **Grilli Type** | woff2 + woff | 26 (Reg) / 25 (Bold) KB | 3 (Reg, Med, Bold) | non dichiarato |
| | Gilroy | Radomir Tinkov | woff2 + woff | 20 (Reg) / 21 (Bold) KB | 3 | non dichiarato |
| | Heebo | OFL, gratis (Google) | woff2 + woff | 18 KB per taglio | **5** | non dichiarato |
| **Trionn** | PP Editorial New Ultralight | **Pangram Pangram** | woff2 | 29 KB | 1 | `swap` |
| | Neue Haas Display Roman | Monotype | woff2 | 25 KB | 1 | `swap` |
| | Martian Mono Light | Evil Martians (OFL, gratis) | woff2 | 19 KB | 1 | `swap` |
| | Familjen Grotesk **Variable** | Letters from Sweden (OFL, gratis) | woff2 VF | 23 KB | 1 (VF) | `swap` |
| **Immersive Garden** | Helvetica Neue Light / Regular | Linotype/Monotype | woff2 + woff | 19 / **9** KB (subset spinto) | 2 | `swap` |
| | PS Times | non verificata (plausibile custom) | woff2 + woff | 49 KB | 1 | `swap` |
| **Locomotive** | PP Locomotive New Light | Pangram Pangram (taglio dedicato) | woff2 + woff | **65 KB** | 1 | `swap` |
| | Helvetica Now Display Regular | Monotype | woff2 + woff | 40 KB | 1 | `swap` |
| **Mosby** `mosbyfiles.com` | Signifier Light | **Klim Type Foundry** | woff2 | 52 KB | 1 | `swap` |
| | Founders Grotesk X-Cond. Bold | **Klim Type Foundry** | woff2 | **11 KB** (subset) | 1 | `swap` |
| | IBM Plex Mono | IBM (OFL) | -- | -- | usato solo come `font-family` | -- |
| **Noomo** | Neue Haas Display Roman | Monotype | **ttf** (non convertito) | **98 KB** | 1 | `swap` |
| | Neue Machina Regular | **Pangram Pangram** | **otf** (non convertito) | **57 KB** | 1 | `swap` |
| **Vero** `verostudio.com` | Beausite Classic **WebTrial** | Fatype | woff2 + woff | **7 KB** (Reg e Med) | 2 | `swap` |
| | Louize Display + Italic | Matthieu Cortat / 205TF | woff2 + woff | 49 / 44 KB | 2 | `swap` |
| **Zajno** | `sh` (nome offuscato) | non verificata | woff2 | 31 KB | 1 | `swap` |
| **2XA** `2xa.studio` | Helvetica Pro Roman | Monotype | woff2 | 35 KB | 1 | `swap` |
| | 2XA MONO VF | custom, **variabile** `100 900` | woff | 15 KB | 1 (VF) | `swap` |
| | Geist + Geist Mono | Vercel (OFL) | ttf dichiarati, ma **404** in produzione | -- | 2 | `swap` |
| **Hello Monday** | NB International Pro | Neubau (NB) | woff2 + woff + ttf | **39 KB** x2 | 2 (Light, Regular) | non dichiarato |
| | Clarendon BT WXX Light | Bitstream (via Monotype) | woff2 + woff + ttf | 29 KB | 1 | non dichiarato |
| **Frans Hals Museum** | Rubik | Hubert & Fischer (OFL, gratis) | woff2 | 47 / 48 / 44 / 48 KB | **4** (Reg, Med, Semibold, Bold) | `swap` |
| **KPR** `kprverse.com` | ABC Whyte **Variable** | **ABC Dinamo** | woff2 + woff + ttf, `125 950` | **186 KB** | 1 VF | `swap` |
| | ABC Whyte Plus **Variable** | **ABC Dinamo** | woff2 VF | **244 KB** | 1 VF | `swap` |
| | ABC Whyte Inktrap **Variable** | **ABC Dinamo** | woff2 VF | **196 KB** | 1 VF | `swap` |
| | PP Fraktion Sans | **Pangram Pangram** | **ttf** | 84 / 85 KB | 2 (Medium, Bold) | `swap` |
| | IBM Plex Mono | IBM (OFL) | **ttf** | 109-111 KB **l'uno** | **4** | `swap` |
| | Hexaframe CF Bold | Connary Fagen | otf | 403 (non servito) | 1 | `swap` |
| **Lando Norris** | Brier Bold | non verificata (plausibile custom) | woff2 | 23 KB | 1 | `swap` |
| | Mona Sans **Variable** `wdth,wght` | GitHub (OFL, gratis) | woff2 VF `200 900` | **163 KB** (non subsettato) | 1 (VF) | `swap` |
| **Mana Yerba Mate** | Neue Montreal 2020 Book / Regular / Medium | **Pangram Pangram** | woff2 + woff | 30 / 28 / 18 KB | 3 | `swap` |
| **Simply Chocolate** | Simply Chocolate (+ Condensed, + Ingredients) | custom di marca | **ttf** (nessun woff2!) | 50-57 KB **l'uno** | **8** tagli | `swap` |
| **Star Atlas** | Tabular | **Colophon Foundry** | caricato da JS | non verificato | non verificato | non dichiarato |
| | Orbitron / Space Mono | OFL, gratis | -- | -- | -- | -- |
| **KODE** `kodeclubs.com` | Antique Olive + Antique Olive Compact | Roger Excoffon (Monotype/URW) | woff2 + woff | **12** / 17 KB | 2 | `block` |
| **Don't Board Me** | Neue Montreal Medium | **Pangram Pangram** | **otf** (non convertito) | 40 KB | 1 | `swap` |
| | Bayon | OFL, gratis (Google) | **ttf** | 53 KB | 1 | `swap` |
| **Revelatio** | Neue Haas Grotesk Text Pro 55 | Monotype | **ttf** (CDN Webflow) | **272 KB** (!) | 1 | `swap` |
| **Pangram Pangram** (il sito della fonderia) | PP Neue Montreal Variable | Pangram Pangram | woff2 VF `1 999` | **311 KB** | 1 VF + 16 altre famiglie in vetrina | `block` |
| **Igloo** `igloo.inc` -- **Site of the Year 2024** | **IBM Plex Mono, e basta** | IBM (OFL, **gratis**) | woff2 + woff | **38** (Reg) + **39** (Med) KB | **2** | `swap` |
| **Resn** `resn.co.nz` | non estraibile: HTML 4,3 KB, CSS critico vuoto, font iniettati dal bundle JS. **non verificato** | -- | -- | -- | -- | -- |

### Il budget tipografico totale per sito (somma misurata dei file che il browser scarica davvero)

Dove il sito dichiara sia `woff2` sia `woff` ho contato **solo il woff2**, perche'
e' quello che ogni browser dal 2020 in poi sceglie. Dove serve `ttf`/`otf` ho
contato quello, perche' non c'e' alternativa.

| # | Sito | Totale font | Note |
|---|---|---|---|
| 1 | **Obys** | **6 KB** | un file, uno solo |
| 2 | **Aristide Benoist** | **6 KB** | due file da 4 e 2 KB |
| 3 | **KODE** | **29 KB** | due tagli, subsettati bene |
| 4 | **Zajno** | **31 KB** | un file |
| 5 | **2XA** | **50 KB** | Helvetica + una mono variabile custom |
| 6 | **Active Theory** | **54 KB** | 3 tagli x 18 KB |
| 7 | **Mosby** | **63 KB** | Klim x2. Founders subsettato a 11 KB |
| 8 | **Igloo Inc.** | **77 KB** | **Site of the Year 2024**, due file, entrambi gratis |
| 8 | **Cuberto** | ~**85 KB** | 5 tagli Suisse + Manrope da Google |
| 9 | **basement.studio** | **92 KB** | 2 variabili + 1 display ttf |
| 10 | **Don't Board Me** | **93 KB** | penalizzato dagli otf/ttf |
| 11 | **Trionn** | **96 KB** | 4 famiglie, un file ciascuna |
| 12 | **Locomotive** | **105 KB** | 2 file, ma pesanti |
| 13 | **Vero** | **107 KB** | Louize da sola fa 93 KB |
| 13 | **Hello Monday** | **107 KB** | 3 file |
| 15 | **darkroom.engineering** | **115 KB** | Replica Bold da solo fa 65 KB |
| 16 | **Noomo** | **155 KB** | **100 KB buttati**: ttf e otf non convertiti |
| 17 | **Lusion** | **182 KB** | 6 tagli, nessun subset aggressivo |
| 18 | **KIN** | ~**184 KB** | 6 tagli di Apercu, nessun variabile disponibile |
| 19 | **Lando Norris** | **186 KB** | 163 KB sono Mona Sans variabile **non subsettato** |
| 20 | **Frans Hals Museum** | **187 KB** | 4 tagli di Rubik da ~47 KB l'uno |
| 21 | **Dogstudio** | ~**227 KB** | 11 tagli su 3 famiglie |
| 22 | **Revelatio** | **272 KB** | **un solo file**, un ttf non convertito su CDN Webflow |
| 23 | **Simply Chocolate** | **421 KB** | 8 ttf, zero woff2 |
| 24 | **KPR** | **~1.230 KB** | tre variabili ABC Dinamo non subsettati (626 KB) + 4 IBM Plex Mono in ttf (439 KB) + 2 PP Fraktion in ttf (169 KB) |

**La mediana e' circa 105 KB.** Il quartile buono sta **sotto i 65 KB**. Tutto
quello che sta sopra i 200 KB e' un errore, non una scelta -- e sono quasi tutti
lo stesso errore: **file non convertiti in woff2 e variabili non subsettati**.

### Righe che valgono da sole

- **Obys serve UN solo file da 6 KB.** Non e' un errore di lettura: `ObysSans4.woff2`,
  6 KB, `font-display: swap`. E' un font disegnato o rimarchiato in casa e
  subsettato ai soli caratteri che il sito usa davvero. Il sito che ha vinto un
  Site of the Day nel maggio 2026 ha un budget tipografico piu' piccolo di
  un'icona PNG.
- **Vero usa un font TRIAL in produzione.** Il file si chiama letteralmente
  `BeausiteClassicWebTrial-Medium.woff2`. Le licenze trial di Fatype (come quelle
  di quasi tutte le fonderie) sono per **mockup e presentazioni interne**, non per
  un sito pubblico. E' uno studio premiato che gira con una licenza che
  probabilmente non copre l'uso. Da non copiare: e' esattamente il tipo di cosa
  per cui una fonderia manda una lettera.
- **Noomo serve `.ttf` e `.otf` grezzi**: 98 KB di Neue Haas + 57 KB di Neue
  Machina = **155 KB** dove due woff2 ne avrebbero fatti circa 55. Sono 100 KB
  buttati per non aver lanciato `woff2_compress`. Stessa cosa Don't Board Me
  (otf), Simply Chocolate (8 file ttf), Revelatio (ttf), KPR (ttf accanto ai
  woff2).
- **Il Site of the Year 2024 usa un font gratis, e uno solo.** Igloo Inc. serve
  esattamente due file: `IBMPlexMono-Regular.woff2` (38 KB) e
  `IBMPlexMono-Medium.woff2` (39 KB). **77 KB in tutto, licenza OFL, costo zero.**
  Tutto il resto del sito e' 3D. Se qualcuno dice che serve un font costoso per
  vincere, questa riga e' la risposta. (Estratto dal bundle
  `https://www.igloo.inc/assets/index-2eb69c09.js`, che contiene i `@font-face`
  iniettati a runtime -- l'HTML servito e' 1,4 KB e non li mostra.)
- **KPR e' il caso limite: 1,2 MB di soli font.** Tre variabili di ABC Dinamo
  (Whyte 186 KB + Whyte Plus 244 KB + Whyte Inktrap 196 KB = **626 KB**) serviti
  interi, senza subset. Piu' quattro tagli di IBM Plex Mono in `.ttf` da
  109-111 KB l'uno (**439 KB** che in woff2 sarebbero stati 150). Piu' due
  PP Fraktion Sans in `.ttf` (169 KB). E' un sito premiato, con un budget
  tipografico dieci volte la mediana, per un risultato visivo che tre file da
  30 KB avrebbero dato uguale.
- **Revelatio serve UN font da 272 KB.** Un solo `.ttf` di Neue Haas Grotesk
  Text Pro, non convertito, dal CDN di Webflow. E' Webflow che si comporta cosi'
  quando carichi un font custom: **non lo converte**. Se costruisci su Webflow,
  converti tu in woff2 prima di caricare.
- **Simply Chocolate carica 8 `.ttf` per 421 KB.** Otto tagli della stessa
  famiglia di marca, zero woff2. Con la conversione starebbero sotto i 180 KB;
  con un variabile, sotto gli 80.
- **Lando Norris carica Mona Sans variabile a 163 KB.** Il file ufficiale GitHub
  con due assi (`wdth` + `wght`) e il set completo. Un `pyftsubset` al latino
  base lo porterebbe intorno ai 40 KB. Anche i gratis vanno subsettati.
- **Immersive Garden ha Helvetica Neue Regular a 9 KB.** Un Helvetica Neue intero
  in woff2 sta sui 50-70 KB. 9 KB vuol dire subset a poche decine di glifi. E' il
  livello di attenzione che separa il sito da premio dal sito normale.
- **Aristide Benoist offusca i nomi**: i file si chiamano `jw.woff2` (4 KB) e
  `t.woff2` (2 KB), famiglie `jws` e `TNY`. Non e' vezzo: rende molto piu' scomodo
  a un terzo capire quale font stai usando e se hai la licenza. Zajno fa lo stesso
  (`sh.woff2`).
- **`font-display`**: su 26 siti con `@font-face` leggibili, **`swap` domina**
  (Obys, basement, darkroom, Trionn, KIN, Cuberto, Immersive Garden, Locomotive,
  Mosby, Noomo, Vero, Zajno, 2XA, Frans Hals, KPR, Lando Norris, Mana, Simply
  Chocolate, Don't Board Me, Revelatio). **`block`** lo usano Lusion, KODE e
  Pangram Pangram -- cioe' i tre che hanno un preloader lungo e possono
  permetterselo perche' tanto il testo non e' visibile durante il caricamento.
  Chi non lo dichiara affatto (Active Theory, Dogstudio, Hello Monday, Star Atlas)
  sta su siti piu' vecchi.

---

## 2. RICORRENZE -- chi torna, e da dove viene

### La classifica misurata (sui siti sopra)

| Fonderia | Quante volte compare | Su quali siti |
|---|---|---|
| **Pangram Pangram** | **5** | Trionn (PP Editorial New), Locomotive (PP Locomotive New), Noomo (Neue Machina), Mana Yerba Mate (Neue Montreal), Don't Board Me (Neue Montreal), KPR (PP Fraktion Sans) |
| **Monotype / Linotype** (Neue Haas, Helvetica Now, Helvetica Neue, Clarendon, Antique Olive) | **7** | Trionn, Noomo, Locomotive, Immersive Garden, Revelatio, 2XA, Hello Monday, KODE |
| **IBM Plex Mono** (gratis, OFL) | **4** | Lusion, Mosby, KPR, **Igloo** (dove e' l'unico font del sito) |
| **Klim Type Foundry** | **1 sito, 2 famiglie** | Mosby (Signifier + Founders Grotesk) |
| **Colophon Foundry** | **2** | KIN (Apercu Pro + Apercu Mono Pro), Star Atlas (Tabular). **Attenzione: dal 25/03/2025 Colophon non vende piu' direttamente, e' passata a Monotype/MyFonts** -- vedi 3.9 |
| **ABC Dinamo** | **1 sito, 3 tagli** | KPR (ABC Whyte, Whyte Plus, Whyte Inktrap -- tutti variabili) |
| **Neubau (NB)** | **2** | Active Theory (NB Architekt), Hello Monday (NB International Pro) |
| **Grilli Type** | **1** | Dogstudio (GT Sectra Display) |
| **Lineto** | **1** | darkroom.engineering (Replica + Replica Mono) |
| **Swiss Typefaces** | **1** | Cuberto (Suisse Int'l) |
| **Vercel / Geist** (gratis, OFL) | **2** | basement.studio, 2XA |
| **Displaay** | **0** | non trovata in nessuno dei 40 siti schedati |
| **Satoshi / General Sans** (Indian Type Foundry via Fontshare) | **0** | non trovati. Sono i gratis piu' citati online ma **nessuno dei siti premiati che ho misurato li usa** |
| **Inter** | **0** | idem. Non compare in nessun `@font-face` misurato |

### Cosa dice davvero questa classifica

- **Pangram Pangram e' la fonderia degli studi immersivi.** Non e' un'impressione:
  compare in 5 dei siti misurati, e in 3 casi (Neue Montreal x2, Neue Machina)
  e' la stessa manciata di caratteri. Vedi la scheda `pangram-pangram.md` per il
  loro modello. Ha senso: prezzi umani, licenza chiara, e i caratteri hanno gia'
  l'aria giusta.
- **Monotype vince per inerzia**, non per scelta: sono le Helvetiche e le Neue
  Haas che i brand hanno gia' in casa. Un cliente aziendale spesso arriva con
  Helvetica Now gia' licenziata dal reparto marketing.
- **Inter, Satoshi e General Sans, i tre gratis che tutti consigliano, non
  compaiono mai.** Questo e' il dato piu' utile del documento per chi vende: se
  metti Inter, il sito legge "prodotto SaaS", non "sito d'autore". I gratis che
  invece **compaiono davvero** sui siti premiati sono altri: **IBM Plex Mono**
  (4 volte), **Geist / Geist Mono** (2), **Manrope**, **Familjen Grotesk**,
  **Martian Mono**, **Rubik**, **Mona Sans**, **Bayon**, **Space Mono**,
  **Orbitron**, **Heebo**. Vedi la sezione 7.
- **Il font custom o rimarchiato e' la firma dello studio maturo**: Obys
  (ObysSans4), Lusion (LusionMono), 2XA (2XA MONO VF), Simply Chocolate (tre
  famiglie di marca), Locomotive (PP Locomotive New = un taglio dedicato).
  Costa, ma e' l'unica cosa che un concorrente non puo' copiare scaricando il CSS.
- **La grotesque neutra e' quasi obbligatoria, ma non e' quasi mai Helvetica
  vera**: e' Neue Haas, Suisse Int'l, Apercu, Aeonik, Replica, NB International,
  ABC Whyte, Founders Grotesk, Beausite. Tutte a pagamento, tutte della stessa
  famiglia di gusto -- svizzera, larga, con la `a` a doppio piano. La differenza
  con Helvetica e' invisibile al cliente e visibilissima a un giudice Awwwards.
- **La grazia (serif) e' l'unica liberta' creativa che si concedono**: Signifier
  (Mosby), Louize (Vero), GT Sectra (Dogstudio), PP Editorial New (Trionn),
  PS Times (Immersive Garden). Quando un sito da premio vuole sembrare
  **costoso** invece che **tecnico**, mette una serif display gigante in home e
  lascia tutto il resto in mono.
- **La coppia che torna piu' spesso e' grotesque neutra + mono**, non
  serif + sans. Lusion (Aeonik + IBM Plex Mono), darkroom (Replica + Replica
  Mono), basement (Geist + Geist Mono), KIN (Apercu + Apercu Mono), 2XA
  (Helvetica + 2XA Mono), Mosby (Founders + IBM Plex Mono), Trionn (Neue Haas +
  Martian Mono). **7 su 26.** La mono e' il segnale "questo sito e' fatto da
  gente che scrive codice". E' un codice visivo, non una necessita'.

---

## 3. LICENZE E COSTI VERI

Dati raccolti il 12-13/08/2026 dai listini ufficiali e dai motori di prezzo che
le fonderie stesse servono al proprio sito. Etichette:
**[VERIFICATO]** = letto sul listino con URL. **[CALCOLATO]** = ottenuto
applicando la formula ufficiale (moltiplicatori e sconti pubblicati) al caso
concreto: la formula e' verificata, il risultato e' aritmetica.
**[NON VERIFICATO]** = non sono riuscito a leggerlo, e non l'ho inventato.

### 3.1 Chi pubblica i prezzi, e con quale metrica

| Fonderia | Prezzi pubblici? | Metrica della licenza web | Durata | Valuta |
|---|---|---|---|---|
| **Klim** | si', calcolatore live | pageview/mese **oppure** utenti unici/mese | **perpetua** | USD |
| **Grilli Type** | si', calcolatore live | visitatori unici/mese | **perpetua** | USD |
| **Pangram Pangram** | si', ma configuratore client-side | pageview/mese | **1 anno** per le aziende, illimitata per i freelance | USD |
| **ABC Dinamo** | si', calcolatore live | **nessuna metrica di traffico**: solo dimensione azienda | perpetua | EUR |
| **Displaay** | si', calcolatore live | **nessuna metrica di traffico**: solo dimensione azienda | perpetua | non verificato |
| **Commercial Type** | solo dietro pannello | visitatori unici/mese aggregati sui domini | perpetua | USD |
| **Lineto** | no: contratto individuale (SUL) | non pubblicata | non pubblicata | non verificato |
| **Swiss Typefaces** | solo "entry price" | **numero di dipendenti** | perpetua | non verificato |
| **Colophon Foundry** | **negozio chiuso** -- vedi 3.7 | n/d | n/d | n/d |
| Adobe Fonts | incluso in Creative Cloud | nessun conteggio | **dura quanto l'abbonamento** | incluso |
| Google Fonts | gratis | nessuna | perpetua (SIL OFL) | 0 |

### 3.2 La trappola prima di ogni preventivo: "100.000 visite" non vuol dire niente

Le fonderie usano **tre metriche diverse e non intercambiabili**:
pageview/mese (Klim, Pangram), visitatori unici/mese (Grilli, Commercial Type),
oppure **niente** -- il prezzo dipende dalla dimensione dell'azienda cliente
(Dinamo, Displaay, Swiss Typefaces).

Un sito da 100.000 **utenti unici** al mese fa tipicamente 250.000-400.000
**pageview**. Prima di quotare, va fissato in analytics **quale** dei due numeri
si dichiara. Sul solo Klim la differenza fra le due letture e' **piu' del
doppio** del prezzo.

### 3.3 Il conto vero per un cliente da 100.000 visite/mese

#### Klim Type Foundry [CALCOLATO su formula VERIFICATA]

Formula ufficiale, estratta dal motore di prezzo che Klim serve al proprio sito
(build del 12/08/2026):

```
prezzo = 60 USD x numero_stili x (1 - sconto_stili) x moltiplicatore_tier
```

- **Prezzo unitario base**: `unitPriceFontStyle: 60`, `baseCurrency: "USD"`.
- **Sconto per numero di stili** nella stessa famiglia: 2 stili -15%, 3 -20%,
  4 -25%, 5 -30%, 6 -35%, 7 -40%, 8 -45%, **9-15 -50%, 16+ -55%**.
- **Moltiplicatori web a pageview/mese**: 20.000 = x1; 40.000 = x1,5;
  80.000 = x2,5; **160.000 = x3,5**; 320.000 = x5; 640.000 = x7,5;
  1.280.000 = x11; 2.600.000 = x16,5; **illimitato = x150**.
- **Moltiplicatori web a utenti unici/mese**: 5.000 = x1; 10.000 = x1,5;
  20.000 = x2,5; 40.000 = x3,5; 80.000 = x5; **160.000 = x7,5**; 320.000 = x11.
- **Sconto multi-licenza**: `crossLicenceDiscountPercentage: 0.3` -> **-30% su
  tutti i sottototali tranne il piu' alto**.

100.000 pageview/mese cadono nel tier **160.000 PV = x3,5**.

| Famiglia (stili) | Base tier 1 | **Web 100k PV** | Desktop 5 utenti | **Desktop + Web insieme** |
|---|---|---|---|---|
| **Soehne** (16 stili) | 432 USD | **1.512 USD** | 432 USD | **1.814,40 USD** |
| **Signifier** (14 stili) -- usato da Mosby | 420 USD | **1.470 USD** | 420 USD | **1.764,00 USD** |
| **Untitled Sans** (10 stili) | 300 USD | **1.050 USD** | 300 USD | **1.260,00 USD** |
| **Un solo stile** | 60 USD | **210 USD** | 60 USD | **252,00 USD** |

**Se invece si dichiarano 100.000 utenti unici** (tier 160.000 utenti, x7,5),
Soehne famiglia intera costa **3.240 USD**: **piu' del doppio**. E' la trappola
numero uno del preventivo.

> **Verifica incrociata mia**: ho scaricato in proprio
> `https://klim.co.nz/page-data/buy/soehne/page-data.json` e ci ho letto
> `unitPrice: 960` per la famiglia Soehne (16 stili) e `3840` per la Soehne
> Collection (64 stili). 960 = 60 x 16 **prima** dello sconto; 960 x 0,45 = 432,
> cioe' esattamente il "base tier 1" della tabella. **La formula regge su due
> estrazioni indipendenti.**

#### Grilli Type [VERIFICATO, listino live]

Grilli pubblica il prezzo **per stile e per livello**, in USD.

| Livello web | Visitatori unici/mese | Prezzo per stile |
|---|---|---|
| 1 | 50.000 | 50 USD |
| **2** | **110.000** | **100 USD** |
| 3 | 180.000 | 150 USD |
| 4 | 260.000 | 200 USD |
| 5 | 350.000 | 250 USD |
| 8 | 1.000.000 | 500 USD |
| 16 | 20.000.000 | 3.500 USD |

Desktop: 1-3 computer = 50 USD/stile; 4-7 = 100; 8-12 = 150; 19-25 = 250.

Le famiglie hanno un **moltiplicatore di pacchetto** che le rende molto piu'
convenienti dei singoli tagli:

| Prodotto | Stili | Moltiplicatore | Stili "effettivi" |
|---|---|---|---|
| **GT America Full Family** | 84 | 0,15 | **12,6** |
| GT America Standard | 14 | 0,60 | 8,4 |
| GT Walsheim Full Family | 16 | 0,60 | 9,6 |
| GT Alpina Full Family | 70 | 0,18 | 12,6 |
| GT Flexa Full Family | 112 | 0,1125 | 12,6 |

100.000 visitatori unici richiedono il **livello 2 (110.000) = 100 USD/stile**.

| Prodotto | **Web 100k** | Desktop 1-3 pc | **Desktop + Web insieme** |
|---|---|---|---|
| **GT America Full Family** (84 stili) | **1.260 USD** | 630 USD | **1.575 USD** |
| **GT Sectra** -- usata da Dogstudio | vedi nota | | |
| GT Walsheim Full Family | 960 USD | 480 USD | 1.200 USD |
| GT Alpina Full Family | 1.260 USD | 630 USD | 1.575 USD |
| Un solo stile | 100 USD | 50 USD | 125 USD |

Sconto multi-licenza Grilli: comprando due tipi di licenza, **la meno costosa e'
scontata del 50%**. Le licenze app sono moltiplicate **x3**. Le versioni "Pro"
(set esteso) hanno un moltiplicatore **x1,5**. Tutti i prezzi in USD; IVA
svizzera 8,1% solo per ordini svizzeri; bonifico sopra i 250 USD.
**"All of our licensing is forever"** -- nessun rinnovo.

#### Le altre, sullo stesso scenario

| Fonderia | Costo per 100.000 visite/mese |
|---|---|
| **Pangram Pangram** | **[NON VERIFICATO]** -- il configuratore dei tier di pageview e' client-side. Verificati: la metrica (pageview mensili), la valuta (USD), la **durata di 1 anno per le aziende** |
| **ABC Dinamo** | **il traffico non conta**: il prezzo dipende solo dalla dimensione dell'azienda intestataria. Cifre **[NON VERIFICATE]** |
| **Displaay** | idem, modello a dimensione azienda. Cifre **[NON VERIFICATE]** |
| **Commercial Type** | metrica verificata (visitatori unici aggregati su tutti i domini), cifre **[NON VERIFICATE]** |
| **Lineto** (Replica, usata da darkroom) | **[NON VERIFICATO]**: non pubblica listini, ogni acquisto genera un contratto individuale ("Specific User Licence") |
| **Swiss Typefaces** (Suisse Int'l, usata da Cuberto) | **[NON VERIFICATO]**: nessun prezzo a listino. Licenza Personal (un utente) contro Company, il cui prezzo d'ingresso copre **fino a 25 dipendenti** |
| Adobe Fonts | **0 EUR aggiuntivi**, incluso nel Creative Cloud gia' pagato |
| Google Fonts | **0 EUR** |

> **L'ordine di grandezza da tenere in testa**: **da 1.000 a 2.000 USD** per
> desktop + web di una famiglia intera di fonderia indipendente, su un sito da
> 100.000 visite/mese. Non 200, non 10.000. E' una cifra che un cliente da
> 15-20k di progetto assorbe senza discutere, **se gliela dici prima**.

### 3.4 Le licenze non sono la stessa cosa, e quasi sempre ne servono due

| Tipo | Cosa copre | File | Metrica tipica |
|---|---|---|---|
| **Desktop / Print** | installare il font sui computer e produrre layout, PDF, stampa, packaging -- **e ogni comp in Figma / Illustrator** | OTF, TTF | postazioni o dipendenti |
| **Web** | `@font-face` sul sito, newsletter HTML incluse | **WOFF2** | pageview o visitatori unici/mese |
| **App / Game** | font **incorporato** dentro un'app mobile/desktop, una web app, un gioco, un POS | TTF/OTF | utenti attivi mensili o download |
| **Video / Broadcast** | motion graphics, spot, YouTube, TV, billboard animati | OTF/TTF | budget di produzione o audience |
| **Social Media** | grafiche per i profili social | OTF/TTF | numero di follower |
| **Logo / Wordmark** | il font dentro il marchio | OTF/TTF | numero di dipendenti |
| **OEM / Device embed** | font dentro un dispositivo venduto | | numero di dispositivi |
| **Enterprise / Unlimited** | tutto, senza limiti | tutti | trattativa |

**La trappola numero due: la licenza web NON copre la progettazione.** Copre solo
i WOFF2 che il browser scarica. Nel momento in cui il designer installa il font
sul Mac per fare il layout in Figma, sta usando una licenza **desktop**. Dinamo
lo scrive nero su bianco, e vale per tutte:

> "Use webfonts for your website. If you're also using Figma then you'll also
> need a desktop/print license."

**Quindi il minimo sindacale per un sito e' desktop + web.** Se c'e' uno spot o
un reel in home, si aggiunge video/broadcast. Se c'e' una web app dietro il
login, puo' servire app.

Il buon lato: quasi tutte premiano l'acquisto congiunto -- **Klim -30%** sui
sottototali tranne il piu' caro, **Grilli -50%** sulla licenza meno costosa.
**Compra desktop e web nello stesso ordine, non in due momenti diversi.**

**Sull'e-pub**: le fonderie indipendenti moderne (Klim, Grilli, Dinamo, Displaay,
Pangram) **non vendono piu' una licenza e-pub separata**. Sopravvive nel mondo
Monotype/MyFonts (**non verificato**: myfonts.com risponde 403).

### 3.5 Chi si intesta la licenza: e' la domanda che fa perdere soldi

**Quasi sempre il cliente finale.** Le clausole, verificate:

| Fonderia | Chi si intesta | Clausola verificata |
|---|---|---|
| **Grilli Type** | **il cliente** | "all of our licenses are for a single organization". L'agenzia **non puo'** condividere la propria licenza col cliente |
| **Pangram Pangram** | **il cliente** | "If the designer is creating something for a client, **only the client** needs to purchase the correct licenses." Appaltatori e agenzie richiedono licenze separate |
| **ABC Dinamo** | si sceglie in carrello | il carrello ha un campo **"License Owner"** con due opzioni: "Yourself" o "[nome del cliente]". **Il prezzo si calcola sulla dimensione dell'organizzazione intestataria** |
| **Displaay** | il cliente | acquistando per conto di un terzo, **i diritti passano a quel terzo, non a chi paga**. I collaboratori possono ricevere i file "for creating visual materials for You" senza licenza propria |
| **Swiss Typefaces** | il cliente, con estensione | se il cliente ha una Company License **con Sharing Extension**, l'agenzia e' automaticamente coperta. Altrimenti l'agenzia deve licenziare per conto suo |
| **Klim** | il titolare, con condivisione limitata | le licenze Web e App permettono di condividere i file "**only with developers or third-party services**" |
| **Lineto** | definito nel contratto | ogni acquisto genera una "Specific User Licence" nominativa |

**Le tre conseguenze pratiche:**

1. **La licenza va intestata al cliente finale e pagata dal cliente finale.**
   Metterla in fattura come "font" a carico dell'agenzia significa comprare una
   licenza intestata all'agenzia, che nella maggior parte degli EULA **non
   autorizza il cliente a usare quel font**. Se domani il cliente cambia agenzia,
   si ritrova senza diritti sul font del proprio sito.
2. **La dimensione che conta e' quella del cliente, non la tua.** Su Dinamo,
   Displaay e Swiss Typefaces un cliente da 800 dipendenti costa molto piu' di
   uno da 8, **a parita' di sito**. Va chiesta prima di quotare.
3. **L'agenzia serve comunque una propria licenza desktop** per progettare, salvo
   il caso Swiss Typefaces (Sharing Extension) o il caso Displaay (collaboratori
   coperti).

**Chiedi sempre due numeri al cliente prima di quotare**: (a) pageview **o**
utenti unici mensili attesi, con la fonte del dato; (b) numero di dipendenti
dell'organizzazione. **Senza questi due numeri non si puo' quotare nessuna delle
fonderie di questo documento.**

### 3.6 Come si mette in preventivo

```
6. Licenze tipografiche                 a carico del Committente
   Da intestare a: [Ragione sociale del Committente]
   - Licenza WEB   : famiglia ___, ___ stili, tier ___ pageview/mese  USD ____
   - Licenza DESKTOP: ___ postazioni                                   USD ____
   - Sconto multi-licenza (acquisto congiunto)                        -USD ____
                                                             TOTALE   USD ____

   Nota 1: l'importo e' calcolato su ___ pageview/mese (fonte: ___) e su
           un'organizzazione di ___ dipendenti. Al superamento della soglia
           la licenza va aggiornata a carico del Committente.
   Nota 2: [se Pangram Pangram] la licenza aziendale ha durata ANNUALE e
           va rinnovata ogni 12 mesi.
   Nota 3: l'acquisto e' effettuato dal Committente. Lo Studio lo esegue per
           conto del Committente solo su mandato scritto, con rimborso a
           pie' di lista.
```

Le regole:
1. **Mai nel forfait.** Voce a parte, "a carico del Committente", con una stima.
   Se la includi e il cliente sceglie una famiglia da 1.800 USD, li paghi tu.
2. **Sempre desktop + web insieme**, per lo sconto.
3. **Sempre la famiglia, mai i singoli pesi**: su Grilli, GT America intera si
   paga come 12,6 stili invece di 84 -- un **-85%** sul prezzo per stile.
4. **Due opzioni in proposta**: una a costo zero (font libero, vedi sezione 7) e
   una a pagamento con la cifra. Il cliente sceglie, e la scelta e' sua.
5. **Progetta con i trial, compra all'approvazione** (vedi sotto).
6. **Scrivi il rinnovo annuale** se il font e' Pangram Pangram e il cliente e'
   un'azienda. E' un costo ricorrente che il cliente deve sapere di avere.
7. **Non convertire i font da solo** e non fare subsetting senza autorizzazione
   scritta. Commercial Type, testuale: "use of .otf files with @font-face and the
   use of any online webfont conversion tools are **strictly prohibited** by our
   EULA"; il subsetting e' permesso ma **richiede autorizzazione scritta** e fa
   decadere il supporto. (Contraddice la sezione 8 di questo documento: la
   soluzione e' **chiedere alla fonderia i file gia' subsettati**, che di norma
   li fornisce.)

### 3.7 Le trial: il modo corretto di lavorare in fase di design

| Fonderia | Trial | Limiti dichiarati |
|---|---|---|
| **Klim** | si', "Test Fonts" con EULA dedicata | "Test fonts can only be used **within your organisation**": internamente si', **presentare al cliente no** |
| **Grilli** | si' | set di caratteri ridotto, niente feature OpenType. **Studenti**: nessun acquisto per progetti scolastici non commerciali |
| **ABC Dinamo** | si' | espressamente ammessi "**for pitching design directions to clients**" |
| **Displaay** | solo su alcune famiglie | uso interno, sketching e **presentazioni al cliente si'**, pubblicazione no |
| **Pangram Pangram** | si' | "free to try for personal use as long as it is **not used in a commercial project**" |

Sono differenze reali. Dinamo autorizza esplicitamente il pitch al cliente, Klim
lo vieta. **Leggere prima di mettere un mockup su Behance.**

E ricordarsi il caso Vero della sezione 1: un `*WebTrial*.woff2` in produzione
non e' una trial usata bene, e' una licenza mancante.

### 3.8 Self-hosting contro CDN della fonderia

**Self-hosting** (Klim, Grilli, Dinamo, Displaay, Pangram, Commercial Type) --
compri i file, li carichi sul tuo server, scrivi `@font-face`. **E' quello che
fanno tutti i siti misurati nella sezione 1**, tranne Cuberto per il solo
Manrope.

- **Controllo**: tuo. Nessuna dipendenza esterna nel percorso critico del render.
- **Performance**: la migliore possibile. `preload` sul WOFF2 critico, stesso
  dominio, nessun handshake in piu'.
- **Privacy/GDPR**: nessun IP dell'utente finale inviato a terzi.
- **Formato**: Klim serve la licenza web **in solo WOFF2**. Pangram fornisce
  OTF, TTF, WOFF, WOFF2.
- **Vincoli**: quasi tutti gli EULA vietano di rendere i file scaricabili in
  chiaro e vietano la conversione fai-da-te.

**CDN della fonderia / abbonamento** (Adobe Fonts, Monotype Fonts) -- incolli un
tag, il font arriva dai loro server.

- **Chi paga**: chi ha l'abbonamento. Con Creative Cloud gia' pagato, zero.
- **Il rischio strutturale, da dichiarare al cliente per iscritto**: **il font
  vive finche' vive l'abbonamento**. Se il cliente disdice Creative Cloud, o se
  il carattere viene rimosso dalla libreria Adobe (succede: i contratti con le
  fonderie scadono), **il sito cambia aspetto da solo**, senza che nessuno abbia
  toccato il codice. Per un sito brand-critical e' inaccettabile.
- **Non e' previsto** scaricare i webfont Adobe e ospitarli in proprio.
- **[NON VERIFICATO]**: adobe.com e helpx.adobe.com non sono risultati
  raggiungibili durante la ricerca. I termini esatti vanno riletti su
  https://helpx.adobe.com/fonts/using/font-licensing.html prima di garantire
  qualcosa per iscritto.

**Google Fonts -- il terzo caso.** Quasi tutta la libreria e' sotto **SIL Open
Font License 1.1**, alcune sotto Apache 2.0. Il testo OFL, letto direttamente:

> "Permission is hereby granted, free of charge, to any person obtaining a copy
> of the Font Software, to use, study, copy, merge, embed, modify, redistribute,
> and sell modified and unmodified copies of the Font Software"

- Uso commerciale: **si'**. Costo: **zero**. Attribuzione: **non richiesta**.
- Self-hosting: si', ed e' la scelta corretta (evita di mandare gli IP degli
  utenti a Google -- dal 2022 in Germania servire da `fonts.gstatic.com` e' stato
  considerato una trasmissione di IP non consentita dal GDPR: Landgericht
  Muenchen I, 20/01/2022, caso 3 O 17493/20).
- Modifica e **subsetting: permessi**.
- **Divieti reali**: non si puo' rivendere il font da solo; i derivati non
  possono usare il **Reserved Font Name** dell'originale e devono restare sotto
  OFL. **Nessuno di questi divieti tocca il sito prodotto con il font.**
- Ogni famiglia ha il proprio file di licenza nella sua cartella su
  https://github.com/google/fonts : **va letto quello**, non si assume.

### 3.9 Notizia da sapere: Colophon Foundry non vende piu' direttamente

[VERIFICATO] `colophon-foundry.org` e' ridotto a una pagina sola:

> "Colophon has moved. As of **March 25, 2025**, Colophon typefaces will no
> longer be sold through colophon-foundry.org. The full Colophon library is
> available as part of a **Monotype Fonts** subscription, and individual
> typefaces can be purchased on **MyFonts**."

Il piede riporta "(c) 2025 Monotype Imaging Inc.".

**Riguarda direttamente due siti di questa ricerca**: KIN (Apercu Pro + Apercu
Mono Pro) e Star Atlas (Tabular). Oggi quei caratteri si comprano su MyFonts o
dentro l'abbonamento Monotype, **con le condizioni Monotype, non piu' con l'EULA
Colophon**. Le licenze vecchie restano valide, ma gli upgrade passano da
Monotype. Se progetti oggi con Apercu, stai comprando da Monotype.

### 3.10 Cosa NON e' verificato (da controllare prima di firmare)

- **Prezzi assoluti di ABC Dinamo, Displaay, Commercial Type, Lineto, Swiss
  Typefaces e Pangram Pangram**: i motori di prezzo caricano i numeri a runtime e
  non sono leggibili da fuori. **Il modo corretto per averli e' aprire il
  configuratore nel browser e generare un quote PDF** -- Dinamo e Grilli lo
  permettono, anche condivisibile via link.
- **MyFonts / Monotype**: HTTP 403 su tutti gli accessi. Tier di pageview e
  prezzo di Neue Haas Grotesk **non verificati**.
- **Adobe Fonts**: sito non raggiungibile durante la ricerca.
- **Le cifre Klim** sono calcolate applicando la formula ufficiale di Klim: la
  formula, i moltiplicatori, gli sconti e il prezzo unitario di 60 USD sono
  verificati su due estrazioni indipendenti dei dati che il loro sito serve, ma
  **la cifra finale non e' stata riletta a schermo sul carrello**. Prima di
  mandare un preventivo, aprire https://klim.co.nz/buy/soehne/ e confermare.

### Fonti della sezione 3

- Klim, tipi di licenza e metriche: https://klim.co.nz/licences/
- Klim, pagina di acquisto: https://klim.co.nz/buy/soehne/
- Grilli Type, licensing, valuta, durata, regola agenzia: https://www.grillitype.com/information
- Grilli Type, catalogo e prezzi: https://www.grillitype.com/typeface/gt-america
- ABC Dinamo, licenze e metrica "dimensione azienda": https://abcdinamo.com/licenses
- Displaay, licenze: https://displaay.net/help/licenses
- Commercial Type, FAQ su licenze e visitatori unici: https://commercialtype.com/faqs
- Lineto, licensing: https://www.lineto.com/licensing
- Swiss Typefaces, licensing: https://www.swisstypefaces.com/licensing/
- Colophon Foundry, avviso di chiusura: https://www.colophon-foundry.org/
- Pangram Pangram, FAQ licenze: https://pangrampangram.com/pages/faq
- Pangram Pangram, EULA: https://pangrampangram.com/pages/eula
- Google Fonts, licenze: https://github.com/google/fonts
- SIL Open Font License 1.1: https://scripts.sil.org/OFL

---

## 4. I FONT VARIABILI

### Chi li usa davvero, fra i siti misurati

| Sito | Font variabile | Assi | Peso woff2 |
|---|---|---|---|
| **basement.studio** | Geist + Geist Mono | `wght 100-900` | 22 e 28 KB |
| **darkroom.engineering** | AS Module 2 VF | non verificato | 13 KB |
| **Cuberto** | Manrope | `wght 200-800` | 2-23 KB per subset unicode |
| **Trionn** | Familjen Grotesk Variable | `wght` | 23 KB |
| **2XA** | 2XA MONO VF (custom) | `wght 100-900` | 15 KB (woff, non woff2) |
| **KPR** | ABC Whyte / Whyte Plus / Whyte Inktrap | `wght 125-950` | **186 / 244 / 196 KB** |
| **Lando Norris** | Mona Sans Variable | `wght 200-900` + `wdth` | **163 KB** |
| **Pangram Pangram** | PP Neue Montreal Variable e 16 altre | `1-999` | **311 KB** (!) |

**Sono 8 su 26. Un terzo.** Non e' la norma, ma non e' piu' una curiosita'.

### Il conto vero, sui numeri misurati qui

- **basement.studio**: Geist variabile, 22 KB, copre **tutto** l'arco da 100 a
  900. I tre tagli statici equivalenti (Regular, Medium, Bold) di una grotesque
  comparabile pesano fra i **27 e i 30 KB l'uno** (vedi Apercu Pro su KIN:
  27+28+27 = 82 KB). **Risparmio reale: circa 60 KB.**
- **KIN** e' l'esempio opposto: 5 tagli statici di Apercu (27+28+27+30+30) +
  1 mono = **circa 180 KB di sola tipografia**. Apercu variabile non esiste, quindi
  non e' una colpa: e' il costo di quel carattere.

### Il break-even, misurato sui file veri

Tutti i pesi sotto sono **misurati il 13/08/2026** scaricando i woff2 reali da
`fonts.gstatic.com` (subset `latin`).

**Inter, i nove pesi statici uno per uno:**

| peso | byte | | |
|---|---|---|---|
| 100 | 23.392 | 600 | 24.452 |
| 200 | 23.920 | 700 | 24.356 |
| 300 | 23.916 | 800 | 24.400 |
| 400 | 23.664 | 900 | 23.900 |
| 500 | 24.272 | | |
| **totale 9 statici** | **211,2 KB** | **Inter variabile 100-900** | **47,1 KB** |

**Il variabile costa il 22% dei nove statici. Risparmio: 164 KB.**

**Il rapporto**: 48.256 / 23.664 = **2,04**. Due tagli statici pesano quanto il
variabile. **Dal terzo taglio in poi il variabile conviene**, e conviene sempre
di piu'.

**Ma il rapporto cambia col subset, e questo quasi nessuno lo dice.** Sul font
**completo** (da rsms.me): `InterVariable.woff2` = **344 KB**;
`Inter-Regular.woff2` completo = **108,7 KB**. Rapporto **3,17** -> sul charset
completo **il break-even sale a 4 tagli**.

> **La formulazione onesta: il break-even sta fra 2 e 4 tagli statici, e dipende
> da quanto e' subsettato il file.** Chi dice "sempre 2" sbaglia sul font
> completo; chi dice "sempre 4" sbaglia sul subset latin.

**Il peso tipico di una grotesque variabile `wght 100-900`, subset latin, woff2**
-- tutti misurati:

| Font | Peso variabile | Statico 400 | rapporto |
|---|---|---|---|
| Public Sans | **26,2 KB** | 14,3 KB | 1,83x |
| Geist | **28,7 KB** | 12,7 KB | 2,27x |
| Instrument Sans | **29,4 KB** | -- | -- |
| Roboto Flex (100-1000) | **33,5 KB** | -- | -- |
| Fraunces | **35,8 KB** | -- | -- |
| Bricolage Grotesque | **40,4 KB** | -- | -- |
| Inter | **47,1 KB** | 23,1 KB | 2,04x |
| Recursive (300-1000) | **54,5 KB** | -- | -- |

**Range da citare in preventivo: 27-48 KB.** Per contesto: la mediana del peso di
un font sul web e' 35-36 KB, il 90esimo percentile 115 KB (Web Almanac 2025,
https://almanac.httparchive.org/en/2025/fonts). Un variabile subsettato **e' in
linea con la mediana**: non e' un file pesante.

### La pipeline di subsetting, con i risultati misurati

Partenza: `Inter[opsz,wght].ttf`, 876.576 B, 2933 glifi, assi `opsz 14-32` e
`wght 100-900`. Tutti i risultati in woff2, `fonttools 4.63.0`.

| Passo | Comando | Risultato |
|---|---|---|
| 0 | tal quale, convertito in woff2 | 350.368 B |
| 1 | `pyftsubset f.ttf --unicodes="U+0000-00FF,U+2000-206F,U+20AC,U+2019,U+201C,U+201D" --layout-features='*' --flavor=woff2` | **97.916 B** |
| 2 | `fonttools varLib.instancer f.ttf opsz=14` poi il subset del passo 1 | **62.932 B** (-36%) |
| 3 | `fonttools varLib.instancer f.ttf opsz=14 wght=400:700` poi subset | **45.808 B** (-53% dal passo 1) |
| 4a | `... wght=400` (statico) poi subset | 28.668 B |
| 4b | `... wght=700` (statico) poi subset | 29.680 B |
| | **somma dei due soli statici** | **58.348 B** |

> **Il risultato che vale l'intera sezione**: il variabile **parziale** 400-700
> (45.808 B) pesa **meno di due soli statici** 400 e 700 (58.348 B), e in cambio
> ti da' tutto il continuo in mezzo. Con l'**instancing parziale** il break-even
> scende **sotto i due tagli**.

L'ordine conta: **prima `instancer`** (pinni gli assi che non usi, restringi
quelli che usi), **poi `pyftsubset`** (tagli i glifi e converti in woff2).
Invertirli funziona ma comprime peggio.
Documentazione: https://fonttools.readthedocs.io/en/latest/varLib/instancer.html

### La sintassi CSS, e i tre modi di sbagliarla

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-var-latin.woff2") format("woff2");
  font-weight: 100 900;      /* il RANGE, non un valore */
  font-stretch: 75% 125%;    /* solo se esiste l'asse wdth */
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, U+2000-206F, U+20AC, U+2019, U+201C, U+201D;
}

h1 { font-weight: 780; }                                  /* preferisci SEMPRE questa */
h1 { font-variation-settings: "wght" 780; }               /* solo per assi NON registrati */
.x { font-variation-settings: "GRAD" -150, "opsz" 28; }   /* assi custom */
```

**Errore 1 -- `font-weight: 400` invece di `font-weight: 100 900`.** Il browser
prende il file come se fosse un peso solo e **sintetizza il grassetto**. Si
riconosce dai contorni sporchi. E' l'errore piu' comune e il piu' silenzioso.

**Errore 2 -- mescolare `font-variation-settings` e `font-weight`.** MDN:
`font-variation-settings` "sovrascrive **sempre** le proprieta' base
corrispondenti, **ovunque** appaia nella cascata". Quindi se li mescoli,
`font-weight` smette di funzionare senza dirti niente.
https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings

**Errore 3 -- contare sull'ereditarieta'.** `font-variation-settings` si eredita
**in blocco**: se il genitore ha `"wght" 700` e il figlio scrive `"opsz" 28`, il
figlio **perde il wght**. Va sempre riscritto tutto.

Assi registrati (usa la proprieta' CSS, non la stringa): `wght` -> `font-weight`,
`wdth` -> `font-stretch`, `slnt` -> `font-style: oblique Ndeg`, `ital` ->
`font-style: italic`, `opsz` -> `font-optical-sizing`.

**Sull'animazione**: anima **`font-weight`**, non `font-variation-settings`, ogni
volta che l'asse e' `wght`. `font-variation-settings` e' interpolabile ma il
browser non puo' ottimizzarla e tende a girare sul main thread. (La differenza in
frame al secondo su un caso reale: **non verificata**, non l'ho misurata.)

### Supporto e adozione, 2026

- **95,85% degli utenti globali** (https://caniuse.com/variable-fonts). Full
  support da Chrome 66, Edge 17, Safari 11, Firefox 62, Safari iOS 11. Fuori
  solo IE e Opera Mini.
- **Adozione reale: 39,4% desktop / 41,3% mobile** dei siti usa almeno un font
  variabile (Web Almanac 2025), contro il 33% del 2024. **+6/7 punti in un anno.**
- Fra i siti di questa ricerca siamo a **8 su 26**, cioe' il 31%: gli studi
  creativi sono **sotto** la media del web. Il motivo e' che i caratteri che
  usano loro (Apercu, Replica, Suisse, Aeonik, Founders) **non hanno una
  versione variabile**.

### Costa di piu' il variabile, dalle fonderie?

**Pangram Pangram: no, e' incluso.** I nomi dei pacchetti nel loro catalogo sono
espliciti: "Editorial New -- Full Family (16 Styles **+ Variables**)", "Neue
Montreal -- Complete Collection (36 Styles **+ Variable** including italics)",
"Right Grotesk -- Full Family (130 Styles **+ Variable Fonts**)". **Il variabile
non e' una SKU separata: e' un contenuto del pacchetto "full family".** Chi compra
un solo taglio, il variabile non ce l'ha.

**ABC Dinamo: non verificato.** Il listino sta dietro a un configuratore
JavaScript; ne' `/licensing` ne' `/buy/whyte` restituiscono prezzi al fetch.

> **L'argomento da portare al cliente non e' "il variabile costa di piu'"**, ma:
> "il variabile e' la ragione per comprare la **famiglia** invece di due tagli --
> e in cambio risparmi 160 KB e ti apri tutta l'animazione tipografica."

### I controesempi: il variabile non subsettato

Un variabile servito intero costa **piu' di tutti i tagli statici che voleva
sostituire**. Tutti questi file sono in produzione oggi:

| File servito in produzione | Peso | Da chi |
|---|---|---|
| `PPNeueMontreal-Variable.woff2` | **311 KB** | Pangram Pangram (il sito della fonderia) |
| `ABCWhytePlusVariable.woff2` | **244 KB** | KPR |
| `PPNeueCorp-NormalVariable.woff2` | **205 KB** | Pangram Pangram |
| `ABCWhyteInktrapVariable.woff2` | **196 KB** | KPR |
| `ABCWhyteVariable.woff2` | **186 KB** | KPR |
| `MonaSans-VariableFont_wdth,wght.woff2` | **163 KB** | Lando Norris |

Contro: `Geist` variabile su basement.studio = **22 KB**, `Familjen Grotesk
Variable` su Trionn = **23 KB**, `2XA MONO VF` = **15 KB**.

**La differenza fra i due gruppi non e' il carattere: e' che il secondo gruppo e'
subsettato e il primo no.** Il comando della tabella qui sopra porta un file da
250 KB sotto i 60.

> **Il variabile non subsettato e' l'errore piu' costoso di tutta questa
> ricerca.** Vale piu' del ttf non convertito, perche' lo commette gente che
> credeva di ottimizzare.

### Il consiglio operativo

Prendi il variabile **solo se**: (a) usi 3+ pesi, oppure (b) animi il peso
(`font-variation-settings` in una transizione), oppure (c) ti serve la larghezza
(`wdth`) per far entrare un titolo. Altrimenti due statici subsettati battono un
variabile intero, sempre.

---

## 4-bis. `font-display` E IL FALLBACK METRICO

Questa e' la coppia di dettagli che separa un sito che "carica bene" da uno che
sobbalza. Costa dieci righe di CSS.

### Le cinque opzioni, e cosa fanno davvero

| Valore | Periodo di blocco | Periodo di scambio | Effetto |
|---|---|---|---|
| `auto` | deciso dal browser | deciso dal browser | in pratica quasi sempre `block` |
| `block` | breve | infinito | testo **invisibile** finche' il font non arriva (FOIT) |
| `swap` | brevissimo | infinito | fallback subito, poi scambia **sempre** (FOUT) |
| `fallback` | brevissimo | breve | fallback subito, scambia solo se il font arriva in tempo |
| `optional` | brevissimo | **nessuno** | se non e' gia' in cache, il font **non viene usato affatto** in questa visita |

Nota: **MDN non pubblica i millisecondi esatti**, li descrive solo come "short" e
"extremely small" (in Firefox sono configurabili via
`gfx.downloadable_fonts.fallback_delay`). I "3 secondi" che girano in ogni
articolo **non sono nella specifica**: non verificati.

### Cosa sceglie il web reale (Web Almanac 2025)

| valore | desktop | mobile |
|---|---|---|
| `swap` | **49,6%** | **50,1%** |
| `block` | 24,7% | 24,9% |
| `auto` | 9,1% | 8,5% |
| `fallback` | 5,1% | 5,1% |
| `optional` | 0,4% | 0,5% |

Dettaglio utile: **circa il 70% dell'uso di `block` viene dagli icon font**, non
dal testo -- dove `block` e' la scelta giusta, perche' un'icona sbagliata e' peggio
di un'icona assente. Quindi il `block` su testo vero e' molto piu' raro di quanto
sembri, e i tre siti che lo usano fra i miei (Lusion, KODE, Pangram Pangram) lo
fanno perche' hanno un preloader che copre l'attesa.

### La divergenza fra il web e chi sa cosa fa

Malte Ubl (ex CTO di Vercel) raccomanda **`optional`, non `swap`**: garantisce
testo immediato in ogni condizione di rete e **azzera il layout shift**, perche'
il font custom appare solo se e' gia' in cache. Sconsiglia anche di accoppiare
`optional` con `preload` (o il font e' gia' in cache e il preload non serve, o
non fara' in tempo comunque) e raccomanda di **self-hostare anche il CSS** dei
font, per togliere una richiesta cross-origin dal percorso critico.
https://www.industrialempathy.com/posts/high-performance-web-font-loading/

**Per un sito di brand la scelta e' fra due, non fra cinque:**
- **`swap` + fallback metrico calibrato** -- il font di brand si vede sempre, e il
  salto e' invisibile perche' le metriche coincidono. **E' la scelta giusta per
  un cliente che ha appena comprato una licenza**: non fargli vedere il suo font
  e' un danno commerciale, non un guadagno di performance.
- **`optional` + fallback metrico** -- CLS a zero garantito, ma alla prima visita
  su rete lenta il font non si vede mai. Difendibile su un sito di contenuto.

### Il fallback metrico -- la tecnica che rende `swap` accettabile

Si dichiara un `@font-face` **finto** che punta a un font di sistema e se ne
correggono le metriche perche' occupi esattamente lo stesso spazio del tuo:

```css
@font-face {
  font-family: poppins-fallback;
  src: local("Arial");
  size-adjust: 60.85099821%;
  ascent-override: 164.3358416%;
  descent-override: 57.51754455%;
  line-gap-override: 16.43358416%;
}
body { font-family: Poppins, poppins-fallback, sans-serif; }
```

- `size-adjust` scala proporzionalmente larghezza e altezza dei glifi
- `ascent-override` / `descent-override` / `line-gap-override` allineano le
  metriche verticali
- formula: `(metrica del webfont) / (UPM del webfont x size-adjust)`

**Versione minima** (Malte Ubl): se hai gia' un `line-height` esplicito -- e tu ce
l'hai, vedi la sezione 6 -- **basta `size-adjust`**, gli override verticali sono
superflui:

```css
@font-face {
  font-family: "CustomFont-fallback";
  size-adjust: 116.19%;
  src: local("Times New Roman");
}
```

**Il risultato citato**: **CLS da 0,14 a 0,08** con il matching automatico
(riportato da Ubl da un commento utente -- verificato come citazione, non come
misura mia). Il Web Almanac non pubblica un delta CLS attribuibile alla tecnica:
**non verificato**.

**Come si calcolano i numeri senza impazzire:**
- **Fallback Font Generator** di Brian Louis Ramirez --
  https://screenspan.net/fallback -- carichi il font (elaborato in locale, non
  sale su nessun server), regoli finche' i box si sovrappongono, copi il CSS.
- **Automatico**: `next/font` in Next.js, `@nuxtjs/fontaine` in Nuxt, la libreria
  **Fontaine**, **Capsize**, il dataset di metric override di Google Fonts.

**E' esattamente questo** che genera le famiglie `Geist Fallback`,
`therma Fallback`, `sauce Fallback`, `__apercupro_Fallback_24e68c` che ho letto
nei CSS di basement.studio, darkroom e KIN. Non le hanno scritte a mano: le
produce `next/font`. Chi non e' su Next lo fa a mano con il generatore sopra.
Fonte della tecnica: https://developer.chrome.com/blog/font-fallbacks

---

## 5. TIPOGRAFIA DENTRO IL WEBGL

Tutte le cifre di questa sezione sono **misurate il 13/08/2026** generando
davvero gli atlas con `msdf-bmfont-xml 2.8.0`, `fonttools 4.63.0` e `three 0.170`,
oppure lette su fonti primarie con URL.

### La regola che seguono tutti gli studi misurati

**Il testo sta nel DOM sopra il canvas, non dentro la scena.** Lusion, darkroom,
basement, Obys, Immersive Garden, Igloo: **tutti** hanno `@font-face` normali e
testo HTML. Nessuno di loro carica `troika`, `msdf` o `bmfont` (verificato con
`grep` sul bundle di Igloo: zero occorrenze di `msdf`, `troika`, `bmfont`,
`sdfGlyph`). Il WebGL fa lo sfondo, gli oggetti, le transizioni -- non le lettere.

### Il numero che decide tutto

**Un atlas MSDF pesa piu' di un font intero.** Misurato su Inter, atlas generati
davvero:

| Configurazione | Dimensione texture | Glifi | PNG | JSON | Totale |
|---|---|---|---|---|---|
| `--font-size 32`, solo ASCII | 222 x 239 | 95 | **64 KB** | 18 KB | 82 KB |
| `--font-size 42` (default), ASCII | 280 x 285 | 95 | **87 KB** | 18 KB | 105 KB |
| `--font-size 64`, ASCII | 402 x 399 | 95 | **142 KB** | 18 KB | 160 KB |
| `--font-size 64`, **latin-1 esteso** | 590 x 595 | **190** | **321 KB** | 35 KB | 355 KB |

Confronto: **Inter variabile in woff2, subset latin = 47 KB** e ti da' tutti i
pesi da 100 a 900. Geist variabile = **29 KB**.

Due conseguenze che vanno dette al cliente prima, non dopo:
- **Gli accenti italiani raddoppiano l'atlas.** Da 95 a 190 glifi il PNG passa da
  142 a 321 KB. Un atlas "ASCII" non contiene `e'` tipografica, `a`, `o`, `u`:
  il tuo titolo in italiano si buca.
- **Il PNG di un MSDF non si comprime.** E' un dato, non un'immagine: niente
  JPEG, niente WebP lossy. Il JSON invece gzippato scende a 3-6 KB, e' irrilevante.

### Quando il testo entra davvero nella scena

Serve **solo** se il testo deve subire la geometria: dissolversi in particelle,
avvolgersi su una superficie, ricevere luce/rifrazione/displacement, essere
occluso da un oggetto 3D, esistere in VR. Fuori da questi casi e' una
complicazione senza guadagno.

**La regola pratica**: testo che si **legge** (paragrafi, nav, footer, prezzi,
form) -> DOM, sempre. Testo che diventa **materia** -> scena. Il caso ibrido che
funziona: titolo in scena piu' copia nel DOM sopra il canvas.

### MSDF in una riga

Un **signed distance field** salva in ogni pixel della texture la **distanza con
segno dal bordo del glifo** invece del colore, cosi' la GPU ricostruisce il
contorno nitido a qualsiasi ingrandimento. **Multi-channel** (MSDF) distribuisce
la distanza sui tre canali RGB invece del solo alfa e lo shader ne prende la
mediana: e' quello che **salva gli spigoli vivi**, che un SDF a canale singolo
arrotonda. Fonte: https://github.com/Chlumsky/msdfgen

### Le due strade, con i pesi veri

| | **troika-three-text** | **three-msdf-text-utils** |
|---|---|---|
| Come | genera l'SDF **a runtime nel web worker** dal `.ttf`/`.otf`/`.woff` | atlas **pre-generato** in build (PNG + JSON) |
| Peso libreria | **45 KB gzip** con le 4 dipendenze (32 KB il solo core UMD) | bundle 28,7 KB / webgpu 27,4 KB |
| Versione e stato | 0.52.5 (24/07/2026), **3,9 milioni download/settimana** | 1.5.0 (12/03/2026), 2.430/settimana |
| Pipeline in build | nessuna | serve `msdf-bmfont-xml` |
| WebGPU / TSL | **no** | **si'** (`MSDFTextNodeMaterial`) |
| Quando | testo dinamico, contenuto da CMS, prototipazione | shader su misura, kinetic typography, WebGPU |

**`three-bmfont-text` (Jam3) e' morto**: ultima release 3.0.1 del **02/07/2020**,
sei anni fa. Compare in mille tutorial (incluso il Codrops del 2019) e non va
usato su un progetto nuovo.

### Le trappole di troika, tutte verificate sul readme e sul sorgente

1. **Non legge `woff2`.** Il readme lo dice esplicitamente. Il font che gia'
   servi al DOM in woff2 **non e' riusabile**: va riconvertito in ttf/woff.
   E' il fastidio numero uno in produzione.
2. **Non supporta i font variabili.** Le tabelle `fvar`/`gvar`/`avar` non
   compaiono nel sorgente 0.52.5. Issue **#365 aperta il 20/08/2025, ancora
   senza risposta del maintainer**: https://github.com/protectwise/troika/issues/365
3. **Il primo render e' asincrono.** Serve `sync()` o l'evento `synccomplete`,
   altrimenti vedi frame vuoti. Si mitiga con `preloadFont()` e con
   `characters="..."` per pre-generare i glifi.
4. **Una CSP restrittiva rompe il worker** senza workaround.
5. `fontSize` di default e' `0.1` (unita' di mondo, **non pixel**);
   `sdfGlyphSize` di default 64, deve essere potenza di due.

### Il costo vero: geometria, non draw call

Le draw call **non sono il problema**. troika usa `InstancedBufferGeometry` con
un solo quad instanziato: un blocco di testo = **1 draw call**, e gli attributi
crescono con `5N + 38` invece di `39N` (dal sorgente `GlyphsGeometry.js`). Esiste
anche `BatchedText`, marcata `@experimental`, che rende N oggetti `Text` in una
sola draw call su WebGL2.

Il problema e' la **geometria**, e qui il confronto e' brutale -- stessa frase di
65 caratteri, misurata su three 0.170:

| Tecnica | Vertici | Triangoli |
|---|---|---|
| `TextGeometry`, curveSegments 12, con bevel | **377.400** | 125.800 |
| `TextGeometry`, curveSegments 12, no bevel | 93.900 | 31.300 |
| `TextGeometry`, curveSegments 4, no bevel | 33.516 | 11.172 |
| **MSDF / SDF (1 quad per glifo)** | **228** | **114** |

**Tre ordini di grandezza.** E' questo il numero da mostrare a chi propone il
testo 3D estruso.

### Perche' nessuno usa TextGeometry in produzione

1. 377.400 vertici per una frase, ricostruiti da zero a ogni cambio di stringa.
2. **Serve il formato `typeface.json`, non un TTF.** Misurato:
   `helvetiker_regular.typeface.json` = 63 KB per 208 glifi;
   `gentilis_regular` = **628 KB** per 704 glifi; `droid_sans_regular` = 320 KB.
   E' un formato morto che **nessuna fonderia produce**: il font di brand va
   convertito, e la conversione perde kerning e feature OpenType.
3. Niente word wrap, niente allineamento, niente interlinea: li scrivi tu.
4. Esteticamente e' "il 3D del 2009". La documentazione three.js stessa
   suggerisce di "considerare il rendering testuale basato su texture per le
   applicazioni performance-critical".

Resta legittimo per una parola-logo, un numero grande, un'insegna: cose generate
una volta sola che non cambiano.

### Font variabili dentro WebGL: no

**Non si puo', ed e' verificato.** troika non legge gli assi (issue #365); e un
atlas MSDF e' per costruzione un'immagine di forme gia' fissate -- un asse
continuo non e' rappresentabile.

Il costo, misurato pinnando Inter a quattro pesi con `fonttools varLib.instancer`
e generando un atlas per ciascuno (`-s 48`, ASCII):

| `wght` | PNG dell'atlas |
|---|---|
| 100 | 84,6 KB |
| 400 | 104,7 KB |
| 700 | 109,9 KB |
| 900 | 107,9 KB |
| **totale 4 tagli** | **397 KB** |

Contro **61 KB** del woff2 variabile equivalente, che nel DOM ti da' **tutti** i
valori da 100 a 900 in continuo e li anima con una riga di CSS.

**E' l'argomento tecnico piu' forte di tutta questa sezione**: il testo che deve
*variare* sta nel DOM; nella scena ci va solo quello che deve *deformarsi
geometricamente*.

### Il fallback per l'accessibilita' -- non e' opzionale

MDN, testuale, sulla pagina di `<canvas>`:

> "Canvas content is not exposed to accessibility tools as semantic HTML is.
> **In general, you should avoid using canvas in an accessible website or app.**"

Testo in canvas = non selezionabile, non copiabile, non trovabile con Ctrl+F,
invisibile allo screen reader, invisibile ai crawler che non eseguono JS. **Ne'
troika ne' drei documentano una soluzione**: nelle due documentazioni la parola
"accessibility" non compare affatto.

La soluzione e' un pattern, non una funzione di libreria: **il titolo vive due
volte**, una come mesh e una come `<h1>` reale nascosto visivamente ma non
semanticamente -- `clip-path: inset(50%)` o la classe `.sr-only`, **mai**
`display:none` ne' `visibility:hidden`, che lo tolgono anche allo screen reader.

**Mettilo a budget.** E' lavoro in piu' su **ogni** testo che sposti nella scena,
ed e' il motivo migliore per spostarne pochi. Vedi `_ACCESSIBILITA.md`.

---

## 6. LE DIMENSIONI -- quanto e' grande davvero un titolo

Misure lette **dal CSS**, non da un browser. `vw` convertito a mano: a 1920px
`1vw = 19,2px`; a 390px `1vw = 3,9px`.

| Sito | Regola nel CSS | A 1920px | A 390px |
|---|---|---|---|
| **Trionn** | `clamp(5rem, 9.164vw, 10rem)` | **160 px** (il max taglia: 9.164vw = 176px) | **80 px** (il min taglia: 9.164vw = 35,7px) |
| **Trionn** (h2) | `clamp(3.75rem, 6.614vw, 6.25rem)` | **100 px** (max) | **60 px** (min) |
| **Trionn** (h3) | `clamp(2.5rem, 6.283vw, 5.938rem)` | **95 px** (max) | **40 px** (min) |
| **Mosby** | `clamp(4rem, 2.25rem + 5.833vw, 7.5rem)` | **120 px** (max; il calcolo darebbe 148px) | **64 px** (min; il calcolo darebbe 58,7px) |
| **Mosby** (h2) | `clamp(2.66rem, 1.49rem + 3.9vw, 5rem)` | **80 px** (max) | **42,6 px** (min) |
| **Lusion** (hero) | `clamp(7em, 8vw, 20em)` | 8vw = **153,6 px**, se il contesto e' 16px | il min `7em` domina -- dipende dal contesto, **non verificato** |
| **Lusion** (display max) | `font-size: 20vw` | **384 px** | **78 px** |
| **2XA** | `15vw` / `12vw` / `10vw` | **288 / 230 / 192 px** | **58,5 / 46,8 / 39 px** |
| **KPR** | `19vw` | **364,8 px** | **74 px** |
| **darkroom** | `17,43vw` (desktop) | **334,7 px** | -- |
| **darkroom** (mobile) | `26,67vw` | -- | **104 px** |
| **Locomotive** | `8vw` / `6,5vw` | **153,6 / 124,8 px** | **31,2 / 25,4 px** |
| **Immersive Garden** | `3,06vw` (il piu' grande in CSS) | **58,7 px** | **11,9 px** |

### Cosa se ne ricava

1. **Il titolo di home di un sito da premio sta fra i 120 e i 380 px a 1920.**
   Non 48. Non 64. Il salto di scala e' la cosa piu' facile da copiare e la piu'
   sistematicamente sbagliata dai siti normali. Se il tuo h1 e' sotto i 100px a
   desktop, non stai giocando lo stesso gioco.
2. **Due scuole opposte, entrambe premiate**:
   - **`vw` puro** (Lusion, 2XA, KPR, darkroom, Locomotive): il titolo scala
     linearmente sempre, senza limiti. Diventa enorme a 2560px e minuscolo a
     320px. E' la scelta "il layout e' un disegno, non un documento".
     Richiede una media query separata per mobile, che infatti darkroom ha
     (17,43vw desktop -> 26,67vw mobile: **il mobile ha un vw piu' alto**, perche'
     altrimenti il titolo sparirebbe).
   - **`clamp()`** (Trionn, Mosby, Lusion per il corpo): due paletti e una
     crescita fluida in mezzo. Piu' sicuro, meno spettacolare.
   La scelta pratica: **`clamp()` per il testo che si legge, `vw` per il testo che
   si guarda.**
3. **Il corpo del testo, invece, quasi nessuno lo scala in `vw`.** Lusion lo tiene
   in `clamp(.875rem, 1vw, 1.75rem)`, cioe' fra 14 e 28px. Mosby in
   `clamp(1rem, .875rem + .417vw, 1.25rem)` = fra 16 e 20px. **Il corpo resta un
   documento, il titolo diventa un'immagine.** Questa e' la vera lezione.
4. **Il rapporto titolo/corpo**: Trionn 160/16 = **10:1**. Lusion 384/16 = **24:1**.
   Un sito aziendale normale sta su 3:1. Il contrasto di scala e' il 70% di quello
   che fa "sembrare un sito da 20k".
5. **Attenzione al `vw` su schermi larghissimi**: `20vw` a 3440px sono 688px.
   Chi usa `vw` puro deve avere un `max-width` sul contenitore oppure una media
   query sopra i 1920, altrimenti su un ultrawide il titolo esce dallo schermo.

### La scala tipografica di partenza (proposta operativa)

Non serve inventarla. Questa e' ricavata dalle misure sopra e funziona:

```css
:root {
  /* corpo: resta leggibile, cresce poco */
  --fs-body:   clamp(1rem,    0.94rem + 0.31vw, 1.25rem);  /* 16 -> 20 px */
  --fs-lead:   clamp(1.25rem, 1.13rem + 0.63vw, 1.75rem);  /* 20 -> 28 px */

  /* titoli: crescono molto */
  --fs-h3:     clamp(1.75rem, 1.29rem + 2.34vw, 3.5rem);   /* 28 -> 56 px */
  --fs-h2:     clamp(2.5rem,  1.52rem + 5.00vw, 6.25rem);  /* 40 -> 100 px */
  --fs-h1:     clamp(3.5rem,  1.86rem + 8.44vw, 10rem);    /* 56 -> 160 px */

  /* display: si guarda, non si legge */
  --fs-hero:   16vw;   /* 62 px a 390, 307 px a 1920 */
}
```

### `letter-spacing` e `line-height`: i valori veri, estratti dai CSS

Non sono consigli: sono i numeri che stanno nei fogli di stile di quei siti.

| Sito | `letter-spacing` usati | `line-height` usati |
|---|---|---|
| **basement.studio** | `-.02em`, `-.03em`, `-.04em`, `-2.16px`, `-2.24px`, `+.05em` | **0.89**, 1.25, 1.5 |
| **Trionn** | `-.02`, `-.04`, `-.06`, **`-.08em`**, `+.2em`, `+.5em` | **0.672**, 1, 1.1, 1.5 |
| **KPR** | `-.005`, `-.01`, `-.02`, `-.03`, `-.04`, `-.05em` | **0.7**, 0.84, 0.85, 0.87 |
| **darkroom** | `-.01`, `-.02`, `-.03`, `-.05em` | non dichiarato nei CSS letti |
| **Lusion** | `-.01`, `-.02em`; `+.0975em`, `+.125em` per le etichette | **0.75em**, 0.9, 0.95 |
| **Mosby** | non dichiarato | **0.8**, 0.92, 1.15, 1.16 |
| **2XA** | `-.015em` | 0.9, 1.1, 1.15 |
| **Immersive Garden** | `-.01em` / `+.01em` (molto conservativo) | 1.1, 1.2 |

**Le tre regole che si leggono dai numeri:**

1. **La crenatura negativa cresce con la dimensione.** Nessuno usa un valore
   solo: ne hanno una scala. `-0.02em` per il testo grande normale, `-0.03/-0.04em`
   per i titoli, fino a **`-0.08em`** su Trionn per il display piu' grande. Un
   carattere disegnato per 16px, portato a 200px, e' sparpagliato: va richiuso.
2. **La crenatura POSITIVA e' riservata alle etichette piccole in maiuscolo.**
   Lusion `+.0975em` e `+.125em`, Trionn `+.2em` e `+.5em`, basement `+.05em`.
   Quel `+0.5em` di Trionn e' una etichetta larghissima, il tipo di dettaglio che
   fa "studio" e costa una riga di CSS.
3. **Il `line-height` dei display sta SOTTO 1.** Trionn arriva a **0.672**,
   KPR a **0.7**, Lusion a **0.75**, Mosby a **0.8**, basement a **0.89**. Un
   titolo su tre righe con `line-height: 1` ha gia' troppa aria e sembra un
   documento Word. Il corpo, invece, resta a 1.5 dappertutto.

**La conclusione operativa**: se prendi il font giusto, la dimensione giusta e
poi lasci `letter-spacing: normal; line-height: 1.5`, il sito continuera' a
sembrare un template. Sono queste due proprieta' a fare la differenza visiva
finale, e costano zero.

---

## 7. I GRATIS CHE NON SEMBRANO GRATIS

La lista corta, scelta con un criterio unico: **compaiono davvero su siti
premiati** (misurati nella sezione 1) oppure hanno il disegno per starci.

### Verificati sui siti misurati

| Font | Chi lo fa | Licenza | Dove l'ho trovato | Perche' funziona |
|---|---|---|---|---|
| **IBM Plex Mono** | IBM / Bold Monday | OFL | **Igloo (Site of the Year 2024, unico font del sito), Lusion, Mosby, KPR** | La mono piu' usata dai siti da premio. Ha carattere senza essere buffa. 38 KB |
| **Geist + Geist Mono** | Vercel **insieme a basement.studio** | OFL | **basement.studio, 2XA** | Grotesque neutra moderna, **variabile** `100-900` a **28,7 KB** (22 KB nel taglio servito da basement). Il miglior rapporto qualita'/peso in circolazione. L'ha disegnata uno degli studi di questa ricerca: https://basement.studio/post/the-birth-of-geist-a-typeface-crafted-for-the-web |
| **Familjen Grotesk** | Letters from Sweden | OFL | **Trionn** | Variabile, 23 KB. Grotesque con un po' di stranezza nelle terminazioni |
| **Manrope** | Mikhail Sharanda | OFL | **Cuberto** | Variabile `200-800`, geometrica calda. Il gratis piu' "premium" fra le sans |
| **Mona Sans** | GitHub | OFL | **Lando Norris** | Variabile con **due assi** (`wght` + `wdth`). Il `wdth` e' raro nei gratis e serve per far entrare i titoli |
| **Martian Mono** | Evil Martians | OFL | **Trionn** | Mono larga e tecnica. 19 KB |
| **Space Mono** | **Colophon Foundry** per Google | OFL | Star Atlas | Disegnata da una fonderia vera, regalata. Personalita' molto forte |
| **Rubik** | Hubert & Fischer | OFL | **Frans Hals Museum** | Angoli arrotondati, amichevole senza essere infantile. Museo nazionale olandese |
| **Bayon** | Google (Khmer) | OFL | Don't Board Me | Display condensata, usata come titolo |

### Da aggiungere alla lista corta (non trovati sui siti misurati, ma reggono)

| Font | Chi | Peso variabile misurato | Perche' |
|---|---|---|---|
| **Instrument Sans / Instrument Serif** | Instrument (studio) | **29,4 KB** (`wght 400-700` + `wdth`) | La Serif e' la cosa piu' vicina a una display costosa che si trovi gratis. Un titolo in Instrument Serif a 200px non sembra un font gratis |
| **Bricolage Grotesque** | Mathieu Triay | **40,4 KB** (`wght 200-800`, `wdth`, `opsz`) | Ha una faccia. Rischia di diventare riconoscibile perche' e' di moda |
| **Fraunces** | Undercase Type | **35,8 KB** (`wght 100-900`, `SOFT`, `WONK`, `opsz`) | Serif variabile con l'asse **WONK**. Per i progetti caldi |
| **Recursive** | Arrow Type | **54,5 KB** (`wght 300-1000`, `CASL`, `MONO`, `slnt`, `CRSV`) | Una famiglia sola che fa sans, mono e display. Il piu' "di carattere" del gruppo |
| **Public Sans** | USWDS | **26,2 KB** (`wght 100-900`) -- **il piu' leggero** | Neutrale al punto da essere invisibile. Utile come font di interfaccia sotto una display forte |
| **Roboto Flex** | Google | **33,5 KB** (`wght 100-1000` + `GRAD`, `opsz`, `wdth`...) | Il piu' ricco di assi in assoluto. Se ti serve giocare con `GRAD` senza pagare, e' questo |
| **Redaction** | Titus Kaphar / Forest Young | Serif in sette gradi di degrado. Una scelta d'autore che nessuno si aspetta sia gratis |
| **Cabinet Grotesk / Clash Display** (Fontshare, Indian Type Foundry) | ITF | Gratis con licenza propria (**non** OFL: leggere i termini). Clash Display regge un titolo da 300px |

### Le tre da NON usare se vuoi sembrare uno studio

- **Inter** -- non compare in **nessuno** dei siti misurati. Legge "dashboard".
- **Satoshi** e **General Sans** -- idem, zero occorrenze. Sono i gratis piu'
  raccomandati dai video su YouTube, e questo e' esattamente il problema: chi
  guarda molti siti li riconosce come "il font del tutorial".
- **Poppins / Montserrat / Lato** -- non serve nemmeno la misurazione.

### La combinazione a costo zero che funziona subito

```
Titolo   : Instrument Serif  (display, 200px+)   oppure  Clash Display
Corpo    : Geist             (variabile, 22 KB)
Dettagli : Geist Mono  oppure  IBM Plex Mono     (etichette, numeri, crediti)
```

Tre file, sotto i 70 KB in tutto, licenza libera, e nessuno dei tre e' il font
che usano tutti. E' il punto di partenza con cui si apre un progetto senza budget
tipografico e senza sembrare senza budget.

---

## 8. LA CHECKLIST OPERATIVA

Da spuntare su ogni progetto, prima di consegnare.

- [ ] **Solo `woff2`.** Il `woff` di scorta serviva a IE11 e a Safari 9. Nel 2026
      e' peso morto: Lusion, KIN, Cuberto, Immersive Garden lo servono ancora e
      stanno pagando byte per niente.
- [ ] **Mai `.ttf` o `.otf` in produzione.** Noomo perde 100 KB cosi'. Converti
      con `woff2_compress` o `fonttools`.
- [ ] **Subset. Sempre, anche i gratis, anche i variabili.** E' l'errore piu'
      costoso di tutta la ricerca: KPR (626 KB di variabili interi), Lando Norris
      (163 KB di Mona Sans), Pangram Pangram (311 KB). Immersive Garden ha un
      Helvetica Neue a **9 KB** perche' l'ha fatto. Il comando, nell'ordine giusto:
      ```
      fonttools varLib.instancer font.ttf opsz=14 wght=400:700 -o slim.ttf
      pyftsubset slim.ttf --unicodes="U+0000-00FF,U+2000-206F,U+20AC,U+2019,U+201C,U+201D" \
                 --layout-features='*' --flavor=woff2 --output-file=font.woff2
      ```
- [ ] **`font-display: swap`** salvo che tu abbia un preloader lungo; in quel
      caso `block` (Lusion, KODE).
- [ ] **`<link rel="preload" as="font" type="font/woff2" crossorigin>`** sui font
      che compaiono nella prima schermata. Senza `crossorigin` il preload viene
      scaricato **due volte**.
- [ ] **Fallback metrico**: `size-adjust` (basta quello se hai un `line-height`
      esplicito) su un `@font-face` locale Arial/Helvetica, per non far saltare il
      layout durante lo swap. basement.studio, darkroom e KIN lo fanno, e infatti
      nei loro CSS compaiono famiglie chiamate `Geist Fallback`, `therma Fallback`,
      `sauce Fallback`, `__apercupro_Fallback_24e68c` -- le genera `next/font`.
      Fuori da Next: https://screenspan.net/fallback
- [ ] **Se usi font variabili, controlla la dichiarazione `font-weight: 100 900`
      con due valori.** Con un valore solo il browser sintetizza il grassetto e
      non te lo dice.
- [ ] **Se metti testo dentro il WebGL**, budget doppio: l'atlas MSDF **e** il
      `<h1>` nascosto per screen reader e Ctrl+F. E ricordati gli accenti
      italiani nel charset (raddoppiano l'atlas).
- [ ] **Massimo 3 famiglie, massimo 5 file.** Media misurata sui siti da premio.
- [ ] **`letter-spacing` negativo** sui titoli sopra i 48px.
- [ ] **Licenza**: web + desktop, intestata al cliente, voce separata in
      preventivo. Mai un file `*Trial*` in produzione (vedi Vero).
- [ ] **Nome del file**: se usi un font costoso, non lasciarlo chiamare
      `SuisseIntl-Regular.woff2`. Aristide Benoist e Zajno lo rinominano a una
      lettera. E' una cortesia verso te stesso.

---

## FONTI E METODO

### Cosa ho misurato io, e come

**Sezioni 1, 2, 6 e le tabelle `letter-spacing`/`line-height`** vengono dal
codice servito dai siti, scaricato il 13/08/2026. Pipeline riproducibile:

```bash
curl -sL "$URL" -o index.html                       # HTML servito
grep -oiE 'href="[^"]+\.css[^"]*"' index.html       # i fogli di stile
curl -sL "$CSS" >> all.css                          # ogni CSS
grep -oiE '@font-face|font-display:[a-z]+|font-weight: *[0-9]+ +[0-9]+' all.css
grep -oiE '[^"'"'"'()  ,]+\.(woff2|woff|otf|ttf)' all.css   # i file font
curl -sL "$FONT" -o /dev/null -w '%{size_download} %{http_code}'  # il peso VERO
```

Per Igloo, che non espone i `@font-face` nell'HTML (1,4 KB servito), ho scaricato
e ispezionato il bundle `https://www.igloo.inc/assets/index-2eb69c09.js`.
Per Klim ho estratto i dati di prezzo da
`https://klim.co.nz/page-data/buy/soehne/page-data.json` e dal bundle
`app-46bed9d9a212c74d259e.js`.

**Sezioni 4, 4-bis e 5**: atlas MSDF generati davvero con `msdf-bmfont-xml 2.8.0`,
subsetting con `fonttools 4.63.0`, conteggi di geometria su `three 0.170`, pesi
woff2 scaricati da `fonts.gstatic.com` e `rsms.me`.

**Sezione 3**: listini ufficiali e motori di prezzo serviti dai siti delle
fonderie, 12-13/08/2026. Ogni cifra e' etichettata [VERIFICATO], [CALCOLATO] o
[NON VERIFICATO].

### I limiti dichiarati

- **Nessuna misura fatta in un browser reale.** Le dimensioni della sezione 6
  sono lette dal CSS e convertite a mano, non da `getComputedStyle`. Dove una
  regola puo' stare dentro una media query lo dico.
- **Resn** non e' estraibile: font iniettati dal bundle JS, non li ho trovati.
- **Non ho trovato nessun post pubblicato** di darkroom, Lusion o Active Theory
  che spieghi la scelta DOM-contro-canvas per il testo. L'unica citazione solida
  su quel tema e' l'articolo Codrops del 28/01/2026.
- **Prezzi assoluti** di Dinamo, Displaay, Commercial Type, Lineto, Swiss
  Typefaces e Pangram Pangram: non leggibili da fuori, vanno presi aprendo il
  configuratore nel browser.
- Le fonderie di alcuni font restano **non verificate**: `AS Therma` /
  `AS Module 2 VF` (darkroom), `PS Times` (Immersive Garden), `Brier`
  (Lando Norris), `jws` / `TNY` (Aristide Benoist), `sh` (Zajno).

### Fonti esterne principali

- Klim https://klim.co.nz/licences/
- Grilli Type https://www.grillitype.com/information
- ABC Dinamo https://abcdinamo.com/licenses
- Displaay https://displaay.net/help/licenses
- Commercial Type https://commercialtype.com/faqs
- Colophon https://www.colophon-foundry.org/
- Pangram Pangram https://pangrampangram.com/pages/eula
- SIL OFL https://scripts.sil.org/OFL
- Web Almanac 2025 https://almanac.httparchive.org/en/2025/fonts
- caniuse https://caniuse.com/variable-fonts
- MDN font-display https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display
- MDN font-variation-settings https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings
- MDN canvas https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas
- fonttools instancer https://fonttools.readthedocs.io/en/latest/varLib/instancer.html
- Katie Hempenius https://developer.chrome.com/blog/font-fallbacks
- Malte Ubl https://www.industrialempathy.com/posts/high-performance-web-font-loading/
- Fallback Font Generator https://screenspan.net/fallback
- msdfgen https://github.com/Chlumsky/msdfgen
- msdf-bmfont-xml https://github.com/soimy/msdf-bmfont-xml
- troika-three-text https://protectwise.github.io/troika/troika-three-text/
- troika issue #365 https://github.com/protectwise/troika/issues/365
- three-msdf-text-utils https://github.com/leochocolat/three-msdf-text-utils
- Codrops MSDF/WebGPU https://tympanus.net/codrops/2026/01/28/webgpu-gommage-effect-dissolving-msdf-text-into-dust-and-petals-with-three-js-tsl/
- Geist https://basement.studio/post/the-birth-of-geist-a-typeface-crafted-for-the-web

### Documenti collegati nella stessa cartella

- Schede dei siti: `lusion.md`, `obys.md`, `basement.md`, `darkroom.md`,
  `trionn.md`, `by-kin.md`, `cuberto.md`, `mosby.md`, `noomo.md`, `vero.md`,
  `2xa.md`, `hello-monday.md`, `frans-hals.md`, `kpr.md`, `locomotive.md`,
  `immersive-garden.md`, `igloo.md`, `pangram-pangram.md`.
- `_ACCESSIBILITA.md` -- testo in canvas e screen reader
- `_PREVENTIVO.md` -- dove va la voce licenza
- `_PRESTAZIONI.md` -- budget in KB
- `_LIBRERIE-DEGLI-STUDI.md` -- cosa carica ogni studio
