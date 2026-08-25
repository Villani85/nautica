# Mammut Eiger Extreme — Expedition Baikal

- **URL**: `https://eiger-extreme.mammut.com/en`
  - **Attenzione: il sito non e' piu' navigabile.** Il dominio risponde ancora,
    ma con **HTTP 500**. Le intestazioni dicono esattamente cosa e' successo:
    `Server: Netlify`, `X-Powered-By: Next.js`, `X-Nf-Render-Mode: ssr`,
    `Cache-Status: "Netlify Edge"; fwd=miss; fwd-status=500`. Il deploy c'e'
    ancora, ma la funzione di rendering lato server e' morta (probabilmente le
    chiavi Contentful scadute o il runtime Node deprecato). Verificato con
    `curl -I` il 13/08/2026.
  - Il 500 dura da anni: nell'archivio il primo errore e' del **6/02/2021**
    (502) e poi 500 in modo continuo dal 4/03/2021 a oggi. Nel dicembre 2020,
    al momento del premio, il sito era vivo.
  - **Ricostruito dall'archivio.** Fonti primarie usate:
    - `https://web.archive.org/web/20201212170619id_/https://eiger-extreme.mammut.com/en?...`
      (12 dicembre 2020, cinque giorni dopo il Site of the Day) — HTML servito
      dal server, 423 KB.
    - `.../20201204231822id_/.../en/development`, `.../20201204100058id_/.../en/technology`,
      `.../20201204230137id_/.../en/watch` — le altre tre pagine.
    - `.../20220719075818id_/.../_next/data/GrEvCfrs0fRMGzv2tqoRC/en.json` —
      **il payload Contentful completo della homepage, 296 KB una volta
      decompresso**: e' da qui che vengono tutti i testi, i nomi dei blocchi, le
      coordinate dei punti prodotto e i pesi degli originali.
    - CSS: `_next/static/css/94534b5f6f879c3e2f0e.css` (119.393 byte) e
      `ccfaec16e0e83e500e66.css` (28.264 byte).
    - JS: il bundle di pagina `77635add...js` (349.336 byte non compressi),
      `_app-f5a897338e3b2dad3760.js` (21.303), il chunk vendor
      `6b5374856288ff768fe121017c8302d7a8896d40...js` (144.503) e
      `scripts/image.worker.js` (255 byte, letto per intero).
- **Premio**:
  - **Awwwards Site of the Day, 7 dicembre 2020** — voto **7.78/10**
    (design 7.95, usabilita' 7.46, creativita' 7.76, contenuto 8.1).
    Fonte: https://www.awwwards.com/sites/mammut-expedition-baikal
  - **Awwwards Site of the Year 2020** + **Developer Award**. Confermato sul
    profilo dello studio, che dichiara 4 SOTY totali (Mendo 2017, Frans Hals
    Museum 2018, Mammut Expedition Baikal 2020), 2 SOTM, 41 SOTD, 51 menzioni
    d'onore su 54 lavori. Fonte: https://www.awwwards.com/buildinamsterdam/
  - Tag Awwwards: E-Commerce, Fashion, Sports, Typography, **Unusual
    Navigation**, Gallery, **Sound-Audio**, **Storytelling**, Photo & Video,
    Contentful, next.js, CSS, React.
- **Studio**: **Build in Amsterdam** (Amsterdam). Nel codice ne resta la firma:
  la variabile globale che blocca lo scroll si chiama `window.BIA_SCROLL_BLOCK`.
- **Cliente**: Mammut Sports Group AG (Seon, Svizzera). Marchio di alpinismo
  fondato nel 1862; la linea **Eiger Extreme** e' la loro punta tecnica, qui
  alla **quinta generazione**.
- **Anno**: 2020. Le date di creazione delle voci nel CMS vanno dal
  **23/09/2020** al **20/11/2020**; l'ultima modifica della homepage e' del
  **17/11/2020, revisione 58**. Quindi: due mesi di produzione contenuti, online
  a fine novembre, premiato il 7 dicembre.
- **Letto il**: 13/08/2026
- **Come l'ho letto**: solo `curl` e `WebFetch`. **Nessuna scheda di browser
  aperta.** Tutto viene dall'HTML archiviato, dal JSON Contentful, dal CSS e dai
  bundle JS letti a mano.

---

## Cosa tratta il sito

E' il racconto di **una spedizione vera**, raccontata come un documentario che
si scorre. Dani Arnold — alpinista svizzero del Pro Team Mammut, nato il
22/02/1984, in squadra dal 2011 — va sul **lago Bajkal**, in Siberia, d'inverno.
Il lago piu' profondo della Terra, ghiacciato, con temperature dichiarate fino a
**-40 °C** e vento fino a **120 km/h**. Ci va per aprire vie nuove sul ghiaccio e
sulla roccia dell'isola di Ol'chon. Ne apre **dieci**.

Dentro la pagina ci sono, in concreto:

- **137 fotografie e video** presi dalla spedizione (contati nel payload
  Contentful), quasi tutti a piena pagina.
- **Quattro registrazioni audio della voce di Dani Arnold**, in presa diretta,
  che si aprono come piccoli lettori appoggiati sulle foto: *"A new project"*,
  *"A new climbing line"*, *"Climbing with pleasure"*, *"Climbing at night"*.
- **Cinque schede prodotto** raccontate: giacca in piuma Eigerjoch Pro IN, giacca
  hardshell Nordwand Pro HS, casco Nordwand MIPS, scarponi Nordwand Knit High
  GTX, pantaloni Nordwand Pro HS.
- **Strumenti di misura** disegnati come quadranti da spedizione: temperatura
  esterna, colonna d'acqua del tessuto, potere riempitivo della piuma, isolamento
  termico degli scarponi, e sulle foto di arrampicata un pannello dati
  **GPS N64º49'15" / TMP -14 °c / BPM 79** con battito cardiaco animato.
- **Punti cliccabili sulle fotografie** che aprono il prodotto indossato in quel
  momento (vedi sotto: e' il cuore del meccanismo).
- Altre tre pagine collegate: **Technology** (come funziona il GORE-TEX PRO),
  **Development** (25 anni e 25.000 ore di sviluppo della collezione, con le voci
  di tre persone dell'ufficio prodotto), **Watch** (il documentario intero).

## Cosa vende, e qual e' l'obiettivo finale

Vende **capi tecnici da alpinismo estremo, singolarmente, sullo shop
`mammut.com`**: giacca, pantaloni, casco, scarponi, guanti, imbrago, corda,
zaino, berretto, scaldacollo, moschettone. Prodotti da diverse centinaia di euro
l'uno. Il sito **non ha carrello proprio**: ogni acquisto e' un link in uscita
verso la scheda prodotto del negozio ufficiale, con `target="_blank"`.

Ma il prodotto vero che vende non e' la giacca: e' **la credibilita' della
giacca**. Mammut vende un capo che il 95% dei compratori usera' per andare in
montagna la domenica, non a -40 °C sul Bajkal. Il sito serve a far diventare
quel capo **l'attrezzatura di chi va a -40 °C**. La prova che la giacca funziona
non e' una scheda tecnica: e' un uomo che si arrampica dentro una grotta di
ghiaccio indossandola.

Gli obiettivi, in ordine di verita':

1. **Dichiarato**: far scoprire la quinta generazione di Eiger Extreme e portare
   al negozio. C'e' un pulsante `Shop Jacket` / `Shop Helmet` / `Shop Shoes` per
   ogni prodotto raccontato, piu' una vetrina finale con cinque prodotti.
2. **Reale, primo**: **posizionamento**. Ripulire l'idea che Mammut sia un
   marchio da negozio sportivo e rimetterlo accanto ad Arc'teryx e Norrona nella
   testa di chi compra. E' un lavoro di marchio pagato in scroll.
3. **Reale, secondo**: **vincere un premio**, e con quello farsi vedere dai
   compratori giovani e dalla stampa di settore. Ha funzionato: Site of the Year.
4. **Non dichiarato ma evidente dalla struttura**: **allenare al catalogo**. I
   punti sulle foto insegnano al visitatore che ogni cosa che vede indosso a Dani
   e' comprabile. E' un catalogo travestito da reportage.

Il costo di questa scelta e' altrettanto evidente: **nessun prezzo compare da
nessuna parte**. C'e' una classe CSS `ProductTooltip_price__ygkzG` pronta nel
foglio di stile, ma **nel CMS il campo prezzo non esiste** (zero occorrenze di
`"price"` nel payload). Quindi il prezzo l'hanno progettato e poi tolto: il sito
non vuole che tu pensi ai soldi mentre guardi il ghiaccio.

## A chi

Al **compratore tecnico che pero' compra emotivamente**. Uomo o donna fra i 28 e
i 50, che arrampica o scia o fa alpinismo a livello serio ma non estremo. Sa gia'
cosa sono il GORE-TEX, la colonna d'acqua, il fill power: infatti il sito non
glieli spiega dall'inizio, glieli **misura**, e mette un pulsante `i` accanto a
ogni numero per chi vuole il ripasso (e' l'unica parte didattica, ed e'
nascosta dietro un clic — scelta giusta, perche' chi sa gia' non viene
annoiato).

Cosa teme: **di pagare 700 € una giacca che poi non tiene**. La paura e'
"tradimento del materiale nel momento sbagliato". A quella paura il sito risponde
non con una garanzia ma con un uomo vivo che non e' morto di freddo.

Cosa deve pensare uscendo: *"questa roba e' stata provata in un posto peggiore di
qualunque posto dove andro' io"*. E, secondariamente: *"quelli che l'hanno fatta
ci hanno messo venticinque anni"* (e' esattamente il messaggio della pagina
Development).

Nota commerciale importante: c'e' un **selettore Men / Women su ogni blocco
prodotto**, e la scelta cambia il link di destinazione (`url` contro
`womensUrl`) e la foto del prodotto. Quindi il pubblico e' esplicitamente
bisessuato, anche se l'atleta protagonista e' un uomo. Il casco e' l'unico
prodotto senza variante donna, e in quel caso il selettore non compare.

## L'esperienza progettata

E' **un documentario che si guarda scorrendo**, in cui ogni tanto il documentario
si ferma e ti mostra un oggetto. Non e' una visita e non e' un gioco: e' una
**camminata lineare a fianco di una persona**, con quattro soste tecniche.

La forma esatta e': **una pagina sola, molto lunga, divisa in quattro capitoli**,
con una barra di quattro segmenti fissa in cima allo schermo che dice a che punto
sei. Non c'e' un menu sempre visibile: c'e' `Open menu`. La navigazione e' la
barra, e la barra e' anche la nota di ritmo del racconto.

Il ritmo alterna, in modo regolare e volutamente prevedibile:

1. **Fotografia grande, muta** — respiro.
2. **Didascalia piccola in grigio** che nomina il momento
   (*"Just standing on the glass-like surface was a challenge."*).
3. **Blocco di testo enorme** (70 px a schermo intero) che porta avanti il
   racconto.
4. **Blocco prodotto**: la pagina si blocca, il capo si stacca dal racconto e
   diventa un oggetto che ruota davanti a te con due o tre affermazioni tecniche,
   poi un numero misurato, poi `Shop`.
5. Si riparte con la fotografia.

Cosa deve **fare** il visitatore, passo per passo:

- **Aspettare tre secondi** (l'introduzione arancione non e' saltabile).
- **Scorrere.** E' il 90% dell'interazione: tutto il resto e' facoltativo.
- **Facoltativo ma cercato**: cliccare l'icona a forma di **borsa della spesa**
  che compare in un angolo di certe fotografie. Al clic sulla foto compaiono
  **puntini bianchi con un segno rosso** sui capi indossati; passandoci sopra si
  apre una miniatura con il nome del prodotto; cliccando si esce sul negozio.
- **Facoltativo**: premere `Play sound fragment` e sentire la voce di Dani.
- **Facoltativo**: premere `i` accanto a un numero per capire cosa vuol dire.
- **Facoltativo**: cambiare `Men` / `Women`.
- **Alla fine**: premere `Explore` e passare al capitolo successivo (Technology),
  che a sua volta manda a Development, che manda a Watch, che rimanda a
  Experience. **E' un anello chiuso**: non ti lascia mai senza un passo dopo.

L'immagine che resta in testa e' una sola: **la parola BAIKAL alta un terzo dello
schermo, bianca, con dentro un uomo minuscolo sul ghiaccio.**

## Come e' organizzata la persuasione

**La promessa sta nella prima schermata**, ed e' una promessa di luogo, non di
prodotto: la parola `BAIKAL` gigante e la riga
*"Dani Arnold embarks on an expedition to a place so extreme, few athletes have
dared to explore it."* Nessun prodotto, nessun logo di prodotto, nessun prezzo.

**La prova e' distribuita e ha tre livelli**, in ordine di comparsa:

1. **Prova narrativa** (schermate 2-6): fotografie non ritoccate, didascalie
   sobrie, e i dati di campo (`GPS N64º49'15"`, `TMP -14 °c`, `BPM 79`). Il
   battito cardiaco e' l'elemento piu' furbo: e' l'unico dato che dice
   "qui c'e' un corpo umano sotto sforzo".
2. **Prova umana** (audio): quattro spezzoni della voce dell'atleta. Non sono
   testimonial, sono note vocali. Il credito accanto e' asciutto:
   *"Dani Arnold — Pro climber"*.
3. **Prova tecnica** (blocchi prodotto): un numero solo per prodotto, sempre
   contestualizzato. `Fill power 850 in³`. `28 k mm water column test`.
   `Insulation rating: -30 °C`. E accanto la ragione:
   *"The warmest jacket Mammut offers"*.

**Il prezzo non c'e'.** Deliberatamente. Vedi sopra: la classe CSS esiste, il
campo nel CMS no.

**La chiamata all'azione sta in tre posti diversi, tre livelli di impegno:**

| livello | dove | testo | quanto e' invadente |
|---|---|---|---|
| debole, sempre disponibile | punti sulle foto | il nome del prodotto | quasi invisibile finche' non premi la borsa |
| medio | fine di ogni blocco prodotto | `Shop Jacket`, `Shop Helmet`, `Shop Shoes` | un pulsante dopo 3-5 schermate di racconto |
| forte | in fondo alla pagina | `Dani Arnold took these products with him on the expedition` + cinque schede | una vetrina vera e propria |

**Quante schermate per arrivare alla prima possibilita' di comprare**: la prima
foto con punti prodotto arriva **subito dopo l'introduzione** (le tre coordinate
sulla foto *"Dani Arnold giving a high five"* sono gia' nel primo blocco), ma e'
muta finche' non la cerchi. La prima **chiamata all'azione esplicita**
(`Shop Jacket`) arriva alla **sesta schermata circa**, dopo il ritratto
dell'atleta e il quadrante della temperatura. Non e' poco.

### Il meccanismo che porta dal racconto al prodotto (la parte da studiare)

E' il pezzo che rende questo sito utile a chi vende materia. Sono **tre passaggi
distinti**, e la sequenza conta:

**Passaggio 1 — Il prodotto e' gia' nella foto, ma non lo dici.**
Ogni fotografia grande della spedizione ha, nel CMS, un elenco `linkedItems`:
coppie di **coordinate in pixel sull'immagine originale** piu' un riferimento al
prodotto. Ne ho contate **oltre cinquanta** su tutta la homepage. Esempi
testuali dal payload:

```
img "Dani Arnold walking on ice"     x=744  y=538   -> Eigerjoch Pro IN Hooded jacket
                                     x=727  y=576   -> Trion Nordwand 28 (zaino)
                                     x=770  y=678   -> Nordwand Pro Pants
img "Dani Arnold hacking ice"        x=1646 y=100   -> Nordwand Beanie
                                     x=1869 y=537   -> Eigerjoch Pro IN Hooded Jacket
                                     x=2477 y=914   -> Trion Nordwand 28 set
                                     x=1286 y=1051  -> Eigerjoch Pro Glove
img "Dani Arnold climbing with ice pick"  786/926   -> Eiswand Neck Gaiter
                                     811/1149      -> Nordwand Pro HS Hooded Jacket
                                     1137/1380     -> Nordwand Micro Lock Carabiner
                                     974/1517      -> Nordwand Harness
                                     1017/1980     -> Nordwand Pro HS Pants
                                     820/2451      -> Nordwand Knit High GTX
```

Le coordinate sono in pixel dell'originale e vengono convertite in percentuali
alla resa (`x` diviso larghezza dell'immagine). Cioe': **il redattore tagga la
foto una volta sola, nel CMS, e il tag segue l'immagine a qualunque
dimensione**. Non c'e' nessun lavoro di posizionamento nel codice.

Da notare: **un punto non porta a un prodotto ma a un audio** — sulla foto
*"Dani Arnold walks under icicles"*, coordinata 2032/726, c'e' il frammento
*"The ice cave"*. Cioe' lo stesso meccanismo serve sia a vendere sia a
raccontare, e questo e' proprio il motivo per cui non sembra un catalogo.

**Passaggio 2 — Il prodotto si annuncia solo se lo chiedi.**
I puntini partono invisibili (`opacity:0`, `scale(.5) rotate(180deg)`). Nell'
angolo della foto compare una **piccola icona a borsa** (`RichMedia_bagIcon`)
con accanto il **numero di prodotti presenti in quella foto**
(`RichMedia_productCount`). Solo cliccando quella, i puntini entrano in scena
uno alla volta, ruotando di mezzo giro e crescendo da meta' scala in mezzo
secondo con curva `cubic-bezier(.16, 1, .3, 1)`. Il punto e' bianco, ombra
morbida, e dentro un simbolo **rosso `#e00b25`**: e' l'unico rosso di tutto il
sito, e serve solo a questo.

Il pannellino che si apre e' minimo: **immagine del prodotto, nome troncato a 15
caratteri, e basta**. Nessun prezzo, nessuna descrizione, nessun "aggiungi al
carrello". Al clic si apre `mammut.com` in una scheda nuova.

**Passaggio 3 — Poi, separatamente, il prodotto si prende la scena.**
Quattro volte nella pagina il racconto si ferma davvero. Il blocco prodotto e'
`position: sticky; height: 100vh` su fondo bianco (o `#23293c` in versione
scura): l'immagine del capo resta inchiodata al centro mentre il contenuto
scorre. Le affermazioni arrivano una per volta, ognuna con uno **zoom crescente
sull'immagine** — i valori sono nel CMS, campo `zoomFactor`, e crescono
apposta: 1.3 → 1.7 per la giacca in piuma; 1.2 → 1.5 → 1.7 per gli scarponi.
Cioe' **piu' l'affermazione e' specifica, piu' la fotocamera si avvicina al
tessuto.** L'ultima diapositiva ha sempre `zoomFactor: 1` e
`imagePosition: left`: la fotocamera si stacca, il capo va a sinistra e a destra
si alza il quadrante col numero. Poi il pulsante `Shop`.

La frase che apre ogni blocco prodotto e' scritta per **agganciare il capo al
momento del racconto, non alla categoria merceologica**:

> "At the transition between the ice and rock, Dani Arnold's **Nordwand MIPS
> Helmet** offers exactly the protection he needs."

> "The crunch under the soles of the **Nordwand Knit High GTX®** boots as they
> meet the icy surface. The breathtaking light of the far north at nightfall."

Nel testo il nome del prodotto e' un'entita' a parte (`textExternalLink`), quindi
**il link e' dentro la frase narrativa**, non sotto.

### Cosa arriva a chi NON scorre fino in fondo

Questa e' la debolezza del sito, ed e' onesto dirla.

- **Chi si ferma alla prima schermata** riceve: il nome del lago, il nome
  dell'atleta, il logo Mammut, e la parola `Expedition`. **Non riceve nessun
  prodotto e nessuna categoria merceologica.** Se non conosci Mammut, non capisci
  che vendono vestiti.
- **Chi arriva a due-tre schermate** ha il ritratto dell'atleta e la temperatura:
  ha capito che si parla di freddo estremo. Ancora nessun prodotto.
- **Serve arrivare alla sesta schermata** per vedere il primo `Shop Jacket`.
- La barra a quattro segmenti in cima e' l'unica difesa: fa capire subito che il
  documento e' lungo e diviso, quindi orienta l'aspettativa.

Detto brutalmente: **il sito e' costruito per chi ha gia' deciso di guardare.**
Va benissimo per un marchio con 160 anni di storia, che ha il suo negozio
altrove. Sarebbe un disastro per un marchio sconosciuto senza altro canale.
Chi copia questo schema per un'azienda d'arredo che non ha ancora un nome deve
**anticipare il primo oggetto**: nel modello Mammut il prodotto arriva tardi
perche' la marca lo puo' permettere.

## Idea regista

**La parola sta davanti al ghiaccio e l'uomo sta davanti alla parola**: la
tipografia gigante e' incastrata dentro la fotografia, non sopra — ed e' lo stesso
gesto con cui, piu' avanti, il prodotto viene incastrato dentro il racconto.

## Il momento

**L'aggancio della parola BAIKAL alla fotografia, nei primi cinque secondi.**

Meccanica esatta, ricostruita da JS e CSS:

1. L'introduzione e' un pannello **arancione `#f56905` a schermo intero**
   (`position:fixed`, `z-index: 99999999`), con il logo Mammut in alto e la
   parola `BAIKAL` in bianco, **28vw**, carattere Whyte Inktrap, maiuscolo,
   crenatura strettissima (`letter-spacing: -.06em`). Su uno schermo da 1600 px
   sono **448 px di altezza di carattere**.
2. Il codice **aspetta due cose insieme**: che il font Whyte Inktrap sia
   caricato *e* che tutte e cinque le fotografie dell'introduzione siano
   scaricate. Solo allora parte la sequenza.
3. Poi un ciclo di **sei passi da 500 ms** (3 secondi netti) scambia cinque
   fotografie dietro la parola: primo piano di Dani, arrampicata su ghiaccio,
   parete, stalattiti, il cinque all'amico. La parola non si muove mai.
4. **Al secondo passo** parte la crescita della parola: `scale` da **0.85 a 1**
   in **4,1 secondi**.
5. **All'ultimo passo** il logo Mammut svanisce in 1 secondo.
6. Finito il ciclo: `window.scrollTo(0, 0)` e il pannello arancione viene
   **smontato dal DOM**.

E qui cade il momento. Sotto il pannello c'era gia' la vera prima schermata, che
sta finendo la **stessa** animazione, ma piu' lenta e su piu' strati: la
fotografia di sfondo scala da **1.45 a 1** in **4,3 secondi**, la parola `BAIKAL`
da **0.85 a 1** in **4,1 secondi**. E davanti alla parola c'e' un **PNG ritagliato
di Dani sul ghiaccio** (nel CMS si chiama letteralmente *"Foreground Mask"*).

Quindi, dal punto di vista di chi guarda: l'arancione sparisce e **la parola non
salta** — continua a crescere identica, ma adesso e' **infilata fra il ghiaccio e
l'uomo**. Il pannello di caricamento e la prima schermata sono la stessa
inquadratura. E' un taglio invisibile, come al cinema.

Costa poco copiarlo: due immagini (una JPG di sfondo e una PNG scontornata), un
titolo in mezzo, e la stessa animazione avviata in due punti diversi con la
stessa durata.

## Struttura, sezione per sezione

Numerazione dei blocchi reale, presa dal CMS (`layoutBlock[0]` … `layoutBlock[27]`).
Le durate sono **stimate** dal CSS (i blocchi dichiarano `100vh`, `200vh`,
`44.44vw` ecc.); dove il CSS dice il numero esatto lo scrivo.

| # | blocco (nome nel CMS) | cosa mostra | cosa fa l'utente | durata |
|---|---|---|---|---|
| 0 | `blockIntro` "Baikal" | pannello arancione, `BAIKAL` 28vw, 5 foto che si scambiano | aspetta | 3 s, **0 scroll** |
| 1 | `blurComponent` "Baikal" (isIntro) | sfondo lago + `BAIKAL` + Dani scontornato davanti; sotto, il paragrafo d'apertura; etichetta `Expedition` accanto al logo; selettore `English / Deutsch / Français` | legge, scorre | ~2 schermate |
| 2 | `blockTwoImages` | due foto del ghiaccio affiancate + didascalia | guarda | ~1 |
| 3 | `blockAthleteInfo` | `Dani` / `Arnold` a caratteri grandi + tre dati: ruolo, anno d'ingresso, data di nascita | guarda | ~1 |
| 4 | `blockImageWithMeters` | foto + **quadrante circolare** della temperatura che corre da -50 a +30 e si ferma su **-40 °c** | guarda | ~1 |
| 5 | `blockProduct` **Eigerjoch Pro IN Hooded jacket** | capo bloccato al centro, 3 diapositive (zoom 1.3 → 1.7 → 1), quadrante `Fill power 850 in³`, `Shop Jacket` | scorre; puo' premere `i`, `Men/Women`, `Shop` | ~4 |
| 6 | `blockThreeColumnImageCollage` | collage a tre colonne + **lettore audio "A new project"** | puo' premere `Play sound fragment` | ~1,5 |
| 7 | `blockText` | testo a 70 px allineato a destra: la ricerca del posto dove arrampicare | legge | ~1 |
| 8 | `blockSingleImage` "Dani walks up to the mountain" | foto intera con **3 punti prodotto** (casco, corda, pantaloni) | puo' aprire i punti | ~1 |
| 9 | `blockHorizontalSlider` (fondo **arancione**) | 6 immagini che scorrono in orizzontale | scorre in verticale, la fila va di lato | ~1 |
| 10 | `blockSingleImage` — **capitolo 1** | foto intera | — | ~1 |
| 11 | `blockProduct` **Nordwand Pro HS Hooded** | come il 5, ma con **video di sfondo** dietro le diapositive; quadrante `28 k mm water column test`; `Shop Jacket` | come sopra | ~4 |
| 12 | `blockFullScreenImageFade` | due foto a schermo intero che si dissolvono l'una nell'altra | scorre | ~1 |
| 13 | `blockImageCollage` | video `Dani_Climbing_3.mp4` + 5 foto + pannello dati **GPS/TMP/BPM** + **tracciato della via** disegnato da 0 m a 60 m | guarda | ~2 |
| 14 | `blockText` | testo: *"Ice and rock… Superior GORE-TEX PRO technology"* — con **link interno** alla pagina Technology | puo' cambiare pagina | ~1 |
| 15 | `blurComponent` (verticale) | foto verticale enorme (9,8 MB in originale) con testo sovrapposto sul freddo e sulla fessura nella roccia | legge | ~1,5 |
| 16 | `blockTwoImages` + audio | due foto + **"A new climbing line"** | puo' ascoltare | ~1,5 |
| 17 | `blockProduct` **Nordwand MIPS Helmet** — **capitolo 2** | 2 diapositive (zoom 1.1 → 1.2), sfondo immagine, `Shop Helmet`. **Nessun selettore Men/Women** | scorre | ~3 |
| 18 | `blockFullScreenImageFade` | dissolvenza fra due foto | — | ~1 |
| 19 | `blockImageCollage` | video `Dani_Rock_clumbing_2.mp4`, dati, tracciato che parte **da meta' via** (`startRouteHalfway: true`), audio **"Climbing with pleasure"** | guarda | ~2 |
| 20 | `blockText` | il risultato: *"Ten new routes on the famous cliffs of Olkhon Island."* | legge | ~1 |
| 21 | `blockHorizontalSlider` (fondo **blu `#23293c`**) | 4 immagini in orizzontale | — | ~1 |
| 22 | `blockSingleImage` verticale — **capitolo 3** | foto verticale | — | ~1 |
| 23 | `blockProduct` **Nordwand Knit High GTX®** | 4 diapositive (zoom 1.2 → 1.5 → 1.7 → 1), quadrante `Insulation rating: -30 °C`, `Shop Shoes` | scorre | ~5 |
| 24 | `blockThreeColumnImageCollage` | collage + audio **"Climbing at night"** + didascalia *"A sublime moment in a spectacular setting."* | puo' ascoltare | ~1,5 |
| 25 | `blockSingleImage` | ultima foto della spedizione | — | ~1 |
| 26 | `blockShopMore` | **la vetrina**: titolo scritto lettera per lettera *"Dani Arnold took these products with him on the expedition"*, selettore `Men/Women`, e cinque schede prodotto in fila con frecce | clicca una scheda → esce sul negozio | ~1,5 |
| 27 | `blockNextUp` | `Next up - GORE-TEX PRO` su una foto, pulsante `Explore` verso `/technology` | clicca | 100vh esatte |

**Totale stimato: circa 38-42 schermate di scroll sulla sola homepage.**
`non verificato` con misura diretta, perche' il sito non si apre piu'.

Le altre pagine dell'anello:

| pagina | struttura | durata |
|---|---|---|
| `/en/technology` | apertura con **sequenza di 32 fotogrammi JPG scorrevoli** (`/gore-tex/desktop/gore-tex-0.jpg` … `-31.jpg`) su cui campeggia `GORE-TEX PRO` a **30vw**; poi sei affermazioni con numeri (`Water column: 28.000 mm`, `Tested at wind speeds > 120 km/h`, `Breathability RET < 9 m²Pa/W`), con crediti fotografici (*"Photo by: Anh Nguyen"*, *"Photo by: Henrik Verle"*); chiude con tre prodotti e `Next up - Development of five generations` | media |
| `/en/development` | `Development` / `25.000 hours`, un contatore `00:00`, una **linea del tempo '95 → '06 → 11/12 → 17/18**, e **tre interviste audio interne**: Alfred Stoppacher (Head of Mountain Apparel), Lana of Leanhard (Lead designer), Megan Ashton (Product developer). Chiude verso Watch | media |
| `/en/watch` | la piu' corta: titolo `Expedition / Baikal Documentary`, `To documentary`, `Play documentary`, sequenza di **31 fotogrammi** (`/watch/desktop/watch-0.jpg` … `-30.jpg`), e `Next up – Experience Baikal` → torna alla homepage | breve |

## L'esperienza in ordine di tempo

**Primi dieci secondi, secondo per secondo** (ricostruiti dal codice
dell'introduzione e dalle transizioni CSS; le durate sono quelle dichiarate nel
codice, l'attesa di rete e' stimata):

- **0,0 s** — schermo **arancione `#f56905` pieno**. Nient'altro. Il logo Mammut
  bianco in alto al centro (43×41 px su desktop).
- **0,0 → ~1,5 s** — attesa. Il codice non mostra niente finche' non sono
  arrivati **il font Whyte Inktrap** e **tutte e cinque** le fotografie
  dell'introduzione. Questa e' una scelta, non un caso: preferiscono un secondo
  di arancione muto a una parola che salta quando arriva il font.
- **~1,5 s** — compare `BAIKAL` in bianco, 28vw, e dietro la **prima**
  fotografia (primo piano di Dani).
- **~2,0 s** — seconda fotografia (arrampicata su ghiaccio). **Parte la crescita
  della parola**: scala da 0.85 verso 1, durata dichiarata **4,1 s**.
- **~2,5 s** — terza fotografia (parete verticale).
- **~3,0 s** — quarta fotografia (stalattiti).
- **~3,5 s** — quinta fotografia (il cinque). **Il logo Mammut inizia a
  svanire**, 1 secondo.
- **~4,5 s** — il pannello arancione **viene smontato**. Sotto c'e' la prima
  schermata vera, con la stessa parola alla stessa dimensione che **continua a
  crescere**, la fotografia di sfondo che si sta ancora allargando da 1.45 verso
  1, e **Dani scontornato davanti alla parola**. Scroll riportato a 0.
- **~4,5 → 6,0 s** — l'immagine finisce di respirare. In alto compare la
  **barra a quattro segmenti** e la scritta `Open menu`. Comincia a comparire il
  paragrafo di apertura.
- **~6 → 10 s** — se il visitatore non tocca niente non succede piu' nulla. **Il
  sito non si muove da solo dopo l'introduzione.** Nessun invito a scorrere
  animato, nessuna freccia che rimbalza: `non verificato` che ce ne sia uno, e
  nel CSS non ho trovato nessun componente di tipo "scroll hint".

**Poi, a blocchi:**

- **10 s → 1 minuto** — i primi tre blocchi: il ghiaccio visto da sopra, la
  scheda dell'atleta, il quadrante della temperatura che scende a -40. Qui il
  sito sta ancora solo raccontando: **zero prodotti nominati**.
- **1 → 2 minuti** — **primo blocco prodotto**. Il ritmo cambia di netto: la
  pagina si inchioda, il fondo diventa bianco pieno, e per tre-quattro schermate
  si parla solo di una giacca. E' la prima volta che compare un pulsante che
  porta fuori dal sito.
- **2 → 4 minuti** — il pezzo centrale, quello piu' bello: audio, collage,
  tracciato della via che si disegna, dati di campo. Qui la densita' di prodotti
  scende e sale quella di prove umane.
- **4 → 6 minuti** — casco e scarponi, intervallati dalle ultime fotografie e
  dall'audio notturno.
- **6 → 7 minuti** — la vetrina finale, e il passaggio al capitolo successivo.

Il tempo totale sulla sola homepage e' **fra i sei e i nove minuti**, `stimato`.

## Animazioni

Nessuna libreria di animazione classica: **non c'e' GSAP, non c'e' Locomotive
Scroll, non c'e' ScrollMagic, non c'e' Lenis** (verificato: zero occorrenze in
tutti e tre i bundle). Il lavoro e' diviso fra **Framer Motion** (per gli stati
dei componenti) e **un ciclo `requestAnimationFrame` scritto in casa** (per tutto
cio' che e' legato allo scroll).

Il ciclo fatto in casa e' semplice e vale la pena descriverlo: un `Set` di
funzioni, un solo `requestAnimationFrame` condiviso da tutti i componenti, che
a ogni fotogramma legge `window.pageYOffset` una volta sola, calcola la
direzione (`top` / `down`) e chiama tutti gli iscritti passando `y` e direzione.
Il `rAF` viene **spento quando il `Set` e' vuoto**. In piu' c'e' una funzione di
inseguimento (`lerp` con coefficiente **0.15** e arrotondamento a due decimali,
con soglia di arresto a 0.5) che smorza il valore per i movimenti che devono
sembrare pesanti.

| elemento | cosa si muove | legato a | curva o inerzia | note |
|---|---|---|---|---|
| Introduzione: le 5 foto | si scambiano | **tempo**, 500 ms a passo | nessuna, taglio secco | 6 passi = 3 s |
| Introduzione: `BAIKAL` | `scale` 0.85 → 1 | tempo | durata **4,1 s**, easing personalizzato | continua sotto il pannello |
| Prima schermata: foto di sfondo | `scale` **1.45 → 1** (desktop) / **1.2 → 1** (mobile) | tempo, parte con l'introduzione | **4,3 s** | valori diversi per telefono, presi dal codice |
| Prima schermata: parola + maschera | la parola sta fra sfondo e PNG scontornato | scroll (parallasse) | `lerp .15` | il titolo si sposta con `translate3d` |
| Barra di navigazione (4 segmenti) | `scaleX` da 0 a 1 dentro il segmento attivo | **scroll** | — | barra fissa in cima, alta **4 px**, larga 92vw, colore `#f56905` |
| Blocchi prodotto | immagine `position: sticky` per 100vh; `zoom` a scatti | **scroll** | `zoomFactor` letto dal CMS: 1.1 – 1.7 | il fondo passa a `#23293c` nei blocchi scuri, in `.5s ease` |
| Diapositive prodotto (USPSlide) | testo entra/esce, `isActive` | scroll | — | testo bianco con ombra `0 1px 12px rgba(25,25,25,.25)` |
| Sequenze fotogramma per fotogramma | 32 JPG (`gore-tex`) o 31 JPG (`watch`) scambiati | **scroll**, mappato su **una sola altezza di finestra** | lineare, `clamp` agli estremi | contenitore alto **200vh**; tutti i fotogrammi sono nel DOM, uno solo ha la classe `visible` |
| Punti prodotto | `opacity 0→1`, `scale .5→1`, `rotate 180deg→0` | **stato** (clic sulla borsa) | **0,5 s `cubic-bezier(.16, 1, .3, 1)`** | la curva "expo out" e' quella usata ovunque nel sito |
| Menu | pannello che scende da sopra (`translate3d(0,-100%,0)` → 0) | stato | **0,5 s `cubic-bezier(.16, 1, .3, 1)`** | su telefono sale dal basso |
| Titoli lettera per lettera (`TextType`) | ogni lettera: `translateY(.2em)` → 0, `opacity 0→1` | ingresso nel viewport (`IntersectionObserver`) | **0,15 s `cubic-bezier(.445,.05,.55,.95)`** a lettera, con ritardo a scalare | usato per `GPS/TMP/BPM`, per il titolo della vetrina e per i numeri della pagina Technology |
| Quadrante circolare (temperatura) | l'indicatore corre e il numero conta | scroll (`inView`) | — | va da `startValue -50` a `endValue 30`, si ferma su `value -40`, campo `difficulty: 0.2` |
| Quadranti verticali (colonna d'acqua, isolamento) | barra che sale + numero grande | scroll | — | `difficulty` 0.9 – 1.0 |
| Battito cardiaco (`HeartBeat`) | tracciato SVG che pulsa | tempo | ciclico | accanto a `BPM: 79` |
| Tracciato della via (`MountainRoute`, `RouteIndicator`) | linea SVG che si disegna, ellisse e lettere | scroll | `animatePath` | da `startHeight 0m` a `endHeight 60m`, con `centerHeight 30m` |
| Dissolvenze a schermo intero | seconda immagine che sale in opacita' | scroll | — | `blockFullScreenImageFade` |
| Fila orizzontale (`HorizontalSlider`) | le immagini traslano di lato mentre scorri in verticale | scroll | `lerp` | fondo arancione o blu |
| Immagini in caricamento | rettangolo che **pulsa** in un tono scuro del colore del blocco | stato | `1s infinite alternate` | ogni colore ha un `loadingBackgroundColor` dedicato — vedi la tavolozza |
| Trascinamento e gesti | `wheel`, `pinch`, `drag`, `swipe` | **@use-gesture / react-use-gesture** | — | usato su fila orizzontale, lettore audio (`grabButton`) e video |
| Blocco `Next up` | il titolo ha un piano davanti e uno dietro (`titleBackground` / `titleForeground`) che si separano | scroll | — | stesso gioco di strati della prima schermata: chiude come ha aperto |

Due dettagli meritano una riga a parte:

- **Lottie** e' presente, ma solo dentro `GoreTextSlide` (campo `lottieFile`):
  quindi le animazioni vettoriali sono usate **solo nella pagina Technology**,
  per illustrare la membrana a tre strati. Sul resto del sito non c'e'.
- **Nessun WebGL, nessun `canvas`, nessun three.js.** Verificato: zero
  occorrenze di `webgl`, `OffscreenCanvas`, `createImageBitmap`. Tutto quello che
  sembra tridimensionale e' fotografia e scala CSS. **E' l'informazione piu'
  utile della scheda**: un Site of the Year del 2020 senza una riga di 3D.

## Colori

Il sito ha una **tavolozza dichiarata come tabella nel codice** (un unico oggetto
JavaScript con otto voci). Ogni voce porta tre valori: colore di sfondo, colore
del testo sopra, e **colore del rettangolo di caricamento** che pulsa mentre
l'immagine arriva. Riporto la tabella per intero, com'e' nel bundle:

| nome nel codice | sfondo | testo | fondo di caricamento | dove si usa |
|---|---|---|---|---|
| `orange` | **#F56905** | #fff | #491f01 | pannello d'introduzione, barra dei capitoli, prima fila orizzontale |
| `blue` | **#23293C** | #fff | #7a87b1 | seconda fila orizzontale, blocchi prodotto scuri |
| `grey` | **#F5F5F5** | #000 | #000 | superfici chiare |
| `dark` | **#191919** | #fff | #fff | testo corrente su fondo chiaro |
| `arctic-blue` | **#0079BD** | #fff | #002438 | quadranti tecnici (colonna d'acqua, fill power) |
| `pure-white` | **#FFFFFF** | #000 | #000 | quadrante della temperatura, fondo dei blocchi prodotto |
| `red` | **#E00B25** | #fff | #59040e | **solo** il segno dentro i punti prodotto |
| `dark-green` | **#252920** | #fff | — | usato raramente |

Piu' i colori che stanno solo nel CSS:

| ruolo | esadecimale | dove |
|---|---|---|
| testo corrente | `#191919` | tutti i testi lunghi |
| bianco | `#ffffff` | fondo dominante, titoli sopra le foto |
| **arancione Mammut** | `#f56905` | 22 occorrenze nel CSS: introduzione, indicatore dei capitoli, `fakeBar` del menu |
| grigio didascalie | `#676767` | didascalie sotto le foto, selettore Men/Women non attivo |
| grigi di superficie | `#f0f0f0`, `#f5f5f5`, `#f7f7f7`, `#f8f8f8`, `#efefef`, `#e6e6e6` | segnaposto e riquadri |
| blu profondo | `#23293c` | tema scuro dei blocchi prodotto |
| rosso | `#e00b25` | il puntino prodotto, e nient'altro |
| ombre | `rgba(0,0,0,.1)` … `rgba(0,0,0,.28)`, `rgba(25,25,25,.15)` | schede, lettore audio, punti |

**Nota sui colori dichiarati da Awwwards** (`#2779a7`, `#DF6C4F`, `#ffffff`):
sono estratti automaticamente dallo screenshot, **non sono i colori del sito**.
Il vero arancione e' `#F56905`, non `#DF6C4F`. Chi copia dalla scheda del premio
prende il colore sbagliato.

Fatto da notare: **su tutto il sito ci sono solo due colori di marca (arancione e
blu scuro) e un colore funzionale (il rosso dei punti).** Tutto il resto e'
bianco, nero e grigio. Il colore vero lo mettono le fotografie.

## Tipografia

Due famiglie sole, **entrambe servite dal sito stesso** da `/fonts/`, in tre
formati ciascuna (`woff2`, `woff`, `ttf`/`otf`), tutte con `font-display: swap`.
**Nessun servizio esterno**: niente Google Fonts, niente Typekit, niente
richieste a domini terzi.

| famiglia | pesi presenti | file | uso |
|---|---|---|---|
| **Whyte Inktrap** (Book) | 400 | `WhyteInktrap-Book.woff2` (35.368 B), `.woff` (51.835), `.otf` (50.847) | **solo i titoli giganti**: `BAIKAL`, `GORE-TEX PRO`, `Development` |
| **Helvetica Now Text** | Regular 400, Medium 500, MediumItalic 500, Bold 600 | 4 × woff2 (35.723 / 37.929 / 40.804 / 35.850 B) | tutto il resto |
| Courier (di sistema) | — | — | 12 occorrenze: usato per i dati di campo tipo `GPS` / `TMP` / `BPM` |

**Whyte Inktrap** e' una scelta precisa: e' un carattere con le *inktrap*, le
sgusciature agli angoli interni pensate per la stampa piccola. Usato a 448 px
diventa una scultura, e legge come "attrezzatura industriale, non moda". Costa
(e' di ABC Dinamo, a licenza).

**La scala tipografica** — nota bene come e' costruita, e' la parte
professionale: il valore base e' **in pixel per il telefono**, poi da 1025 px in
su diventa **in `vw`**, e poi viene **ribloccato in pixel agli estremi** (sotto
1125 px e sopra 1500 px). Cioe' il testo respira solo nella fascia utile e non
diventa mai ne' ridicolo ne' illeggibile.

| livello | famiglia | peso | corpo telefono | corpo 769-1024 | corpo ≥1025 | crenatura | interlinea |
|---|---|---|---|---|---|---|---|
| Titolo introduzione / hero | Whyte Inktrap | 400 | **28vw** | 28vw | 28vw | `-.06em` | — |
| Titolo `GORE-TEX PRO` | Whyte Inktrap | 400 | 12vw (12.67vw ≥400px) | — | **30vw** | `-.06em` | `.76em` |
| Testo grande di racconto | Helvetica Now | 400 | **34 px** | 34 px | **4.667vw** (70 px a 1500, bloccato a 52,5 px sotto 1125) | `-.06em` | `1.1em` |
| Testo prodotto | Helvetica Now | 400 | 34 px | 34 px | 4.667vw (70 px) | `-.06em` | `1.1em` |
| Affermazione tecnica (USP) | Helvetica Now | 400 | **25 px** | 34 px | **2.667vw** (40 px) | `-.03em` | `1.09em` |
| Paragrafo sopra foto | Helvetica Now | 400 | 28 px | 34 px | 2.667vw (40 px) | `-.04em` | `1.2em` → `1.3em` |
| Numero del quadrante verticale | Helvetica Now | 400 | 55 px | 90 px | **110 px** (120 px / 8vw ≥1400) | `-.06em` | `.95em` |
| Numero del quadrante circolare | Helvetica Now | 400 | — | — | **5.333vw** (80 px a 1500) | — | — |
| Etichetta sopra il quadrante | Helvetica Now | 400 | — | — | 1.2vw (18 px) | — | — |
| Selettore Men/Women | Helvetica Now | 400 | **17 px** | — | 1.467vw (22 px) | `-.04em` | `1em` |
| Didascalia foto | Helvetica Now | 400 | **13 px** | 11 px | 15-20 px | `-.04em` / `-.05em` | `1.2em` / `1.3em` |
| Titolo scheda prodotto (tooltip) | Helvetica Now | 400 | — | — | 1.333vw (20 px) | — | — |
| Titolo lettore audio | Helvetica Now | 400 | 12 px | — | 1vw (15 px) | — | `1` |

Da rubare: **la crenatura negativa costante** (da `-.03em` a `-.06em`) su tutto,
titoli e corpo. E' quello che fa sembrare tecnico un Helvetica.

## Testi veri

**Navigazione** (identica su tutte e quattro le pagine, in coppie nome/tipo):

```
Experience    — Expedition Baikal
Technology    — Gore-Tex Pro
Discover      — Five Generations
Watch         — The full documentary
Open menu
```

**Lingue**: `English` · `Deutsch` · `Français` (percorsi `/en`, `/de`, `/fr`;
la locale del CMS e' `en-EU`).

**Titolo del documento**: `Experience | Mammut`.
**Descrizione**: `Mammut® Eiger Extreme`. (E' l'unica meta descrizione del sito, e
non dice niente: un sito da Site of the Year con una `<meta description>` di tre
parole.)

**Marchio sopra il titolo**: `Expedition`

**Apertura** (testuale):

> Dani Arnold embarks on an expedition to a place so extreme, few athletes have
> dared to explore it. An adventure to Lake Baikal, the deepest lake on earth,
> with temperatures as low as -40°C. Too cold to climb? See how he transitions to
> the horizontal ice and conquers ten new ice routes.

**Scheda atleta**:
```
Dani / Arnold
Pro Team Mountaineering — One of the top Swiss speed climbers
At Mammut since — 2011
Date of Birth — 22 Feb 1984
```

**Didascalie** (una per collage, sempre brevi e mai promozionali):

> The thick ice covering the deepest lake on earth offers a mesmerizing,
> crystal-clear view into its depths.
> Wind speeds up to 120 km/h on the ice.
> Just standing on the glass-like surface was a challenge.
> Exhilarating routes directly above the deepest lake on the planet.
> Now the climbing is getting trickier.
> A sublime moment in a spectacular setting.

**I tre testi lunghi di racconto**:

> Temperatures are extreme and documentation of the area is scant at best, making
> it difficult to find climbing sites. Finally, the first challenge: a cave. Or
> rather an art installation made of ice. This calls for an outfit change.

> Ice and rock. Cold and moisture. A crucible for outdoor gear. Superior
> GORE-TEX PRO technology offers uncompromising protection in any weather
> conditions as well as maximum durability.

> The biggest challenge is dealing with the cold. The ice contracts to form a
> rock-hard surface, smooth as glass. It takes a lot of strength to drive the
> pick into the ice. Each gripping maneuver is slow and laborious. Dani Arnold
> discovers a vertical crevice in the rock face that he can hardly resist.

> At the beginning of the expedition, it wasn't clear whether there would be any
> opportunities to climb at all. In the end, the expedition was a complete
> success. Ten new routes on the famous cliffs of Olkhon Island.

**Aperture dei blocchi prodotto** (in grassetto la parte che e' un link):

> The **Eigerjoch Pro IN Hooded Jacket** is designed for extremely cold and harsh
> conditions, keeping him warm even when temperatures drop to -40°C.

> The rugged **Nordwand Pro HS Hooded** is perfect for extreme conditions and
> ensures unrestricted freedom of motion. Today, Arnold is pioneering a new route.

> At the transition between the ice and rock, Dani Arnold's **Nordwand MIPS
> Helmet** offers exactly the protection he needs.

> The crunch under the soles of the **Nordwand Knit High GTX®** boots as they
> meet the icy surface. The breathtaking light of the far north at nightfall.
> Pristine routes in an enchanting frosty landscape.

**Affermazioni tecniche** (le parole evidenziate sono entita' separate nel CMS,
tipo `textHighlight`):

```
Ultra-light [Pertex® Quantum Pro]
Treated with an [ultra-thin water-repellent] and insulated with a water-resistant filling.
New [3-layer design] moves with you
The ideal combination of [weather protection] and [maximum durability]
Advanced safety test. Strong enough to withstand side impacts
Reinforced front, back and sides
[Three years] developing the material, specifications and technologies.
[3D knitted textile:] stretchy and form-fitting.
Lighter. Excellent ventilation.
```

**I numeri dei quadranti**, con la riga che li spiega:

```
Outside temperature      -50 → 30, si ferma a -40 °c
Fill power 850 in³       — Water-repellent 90/10 goose down. The warmest jacket Mammut offers
28 k mm water column test — 3-layer GORE-TEX PRO design. The leading technology for waterproof textiles.
Insulation rating: -30°C — High-performance cold insulation
GPS: N64º49'15"   TMP: -14°c   BPM: 79
```

**Testo di una finestra `i`** (esempio, `Fill power`) — e' il registro didattico
del sito:

> The fill power of down or synthetic filling is measured in cubic inches
> (in³/oz). The higher the in³ value, the greater the heat retention per unit of
> volume and weight. Down rated at 800 in³/oz is considered to be of particularly
> high quality. It offers incredible fill power and therefore the best ratio of
> weight to volume as well as thermal rating for demanding expeditions when every
> gram counts.

**Chiamate all'azione**: `Shop Jacket` · `Shop Helmet` · `Shop Shoes` ·
`Explore` · `Play video` · `Play documentary` · `To documentary` ·
`Play sound fragment` · `Men` / `Women`

**Titolo della vetrina finale** (scritto lettera per lettera):

> Dani Arnold took these products with him on the expedition

**Passaggi fra i capitoli**:
```
Next up - GORE-TEX PRO
Next up - Development of five generations
Next up - Watch the full documentary
Next up – Experience Baikal
```

**Frammenti audio** (titolo, con le virgolette tipografiche cosi' come sono nel
CMS): `"A new project"` · `"A new climbing line"` · `"Climbing with pleasure"` ·
`"Climbing at night"` · `"The ice cave"` (quest'ultimo raggiungibile **solo** da
un punto sulla fotografia). Credito costante: `Dani Arnold` / `Pro climber`.

**Dalla pagina Development** — le persone che parlano:
```
'95   About the first collection — Alfred Stoppacher, Head of Mountain Apparel
      Investing time             — Lana of Leanhard, Lead designer
      Athlete tested             — Alfred Stoppacher, Head of Mountain Apparel
      Build to last              — Megan Ashton, Product developer
```
e il testo d'apertura:
> Endless testing. Years of optimization. Not a single detail is left to chance.
> After all, form follows function. And then ultimately you get a product that
> sets only the highest standards.

**Non c'e' un piede.** Nessun footer con contatti, privacy, social o newsletter
sulla homepage: la pagina finisce con `Next up` e ti spinge nel capitolo dopo.
E' una scelta radicale — non c'e' nessuna via d'uscita che non sia il capitolo
successivo o un prodotto.

## Mobile

**Sotto i 1025 px il sito e' un altro sito.** Questa e' la sezione piu' densa di
cose verificate, perche' il codice fa scelte diverse e le dichiara.

### Cosa SPARISCE

- **Le frecce della vetrina finale** (`BlockShopMore_button`): `display:none`.
  Le cinque schede prodotto diventano una fila da spingere col dito.
- **Le sbarrette verticali del menu** (`MenuBar_container:before/:after`, 2 px di
  bianco): `display:none` sotto 1025 px.
- **Il testo evidenziato allineato a `BAIKAL`** (`BlockBlur_highlight` con
  `alignToBaikal` / `highlightTextOut`): `display:none`. Cioe' il gioco
  tipografico piu' raffinato della prima schermata **non esiste sul telefono**.
- **Cinque fotogrammi su trentadue** della sequenza GORE-TEX (vedi sotto).
- **Gli stati `:hover`**: tutto quello che vive dentro
  `@media (hover:hover) and (pointer:fine)` — 15 blocchi nel CSS, fra cui
  l'ombra che si stringe sul lettore audio — sul telefono semplicemente non c'e'.

### Cosa viene SOSTITUITO

- **Le fotografie della prima schermata.** Il CMS ha due gruppi separati:
  `images` (orizzontali, `2798×2265`) e `mobileImages` (**verticali**,
  `2495×3039`, chiamate *"Backgound Image - Portrait"* e *"Foreground Mask -
  Portrait"*). Non e' un ritaglio automatico: **hanno rifotografato l'inquadratura
  in verticale.** E' la differenza fra un sito reattivo e un sito progettato due
  volte.
- **Le sequenze fotogramma per fotogramma.** Il conteggio e' scritto nel codice:
  ```
  desktop: gore-tex = 32 fotogrammi, watch = 31
  mobile:  gore-tex = 27 fotogrammi, watch = 37
  ```
  I percorsi sono `/{pagina}/{desktop|mobile}/{pagina}-{n}.jpg`. Quindi sul
  telefono la sequenza GORE-TEX e' **piu' corta** (27 invece di 32, meno peso) ma
  quella del documentario e' **piu' lunga** (37 invece di 31): non hanno
  semplicemente tagliato, hanno rimontato.
- **Il menu cambia lato.** Su desktop (`≥1025px`) la barra di navigazione scende
  **dall'alto** (`translate3d(0,-100%,0)` → 0). Sotto i 1025 px e' **fissa in
  basso** e il pannello sale **dal basso**. Nasce sotto il pollice.
- **Il lettore audio cambia forma.** Sul telefono e' verticale, larghezza `6em`,
  con l'immagine sopra (`border-radius: 3px 3px 0 0`, altezza `5em`). Da 769 px
  in su diventa **orizzontale** (`display:flex`), con l'immagine come pannello a
  sinistra largo `5.6em` (`border-radius: 3px 0 0 3px`).
- **La scala della prima immagine.** Su desktop parte da `scale 1.45`, su telefono
  da `1.2`. Meno zoom, perche' su schermo piccolo un fattore alto sgranerebbe.
- **`100vh` diventa `calc(var(--vh) * 100)`.** Tutte le altezze piene sono
  riscritte con **due variabili distinte**, calcolate in JavaScript:
  `--vh` (altezza reale) e **`--vh-without-browserbar`** (altezza senza la barra
  del browser che compare e scompare su iOS). I blocchi prodotto e le sequenze
  usano la seconda: cosi' non "saltano" quando Safari nasconde la barra a
  meta' scroll. E' una delle trappole piu' costose del web mobile, ed e' risolta
  in modo esplicito.
- **Il pulsante `Shop` diventa fisso.** `BlockProduct_link.isFixed` prende
  `position: fixed` sotto 1024 px: nel blocco prodotto il pulsante d'acquisto
  resta appiccicato allo schermo mentre scorri.

### Cosa RESTA

- **La struttura intera**: tutti e 28 i blocchi ci sono. Non c'e' una versione
  ridotta del racconto.
- **I punti prodotto sulle fotografie**, con la stessa icona a borsa. Le
  coordinate sono in percentuale, quindi funzionano identiche.
- **La barra a quattro segmenti** in cima (`height: 4px`), con un dettaglio: in
  caricamento va **al centro dello schermo** (`bottom: 40vh`) e poi risale in
  alto — cioe' il caricamento e' anche il segnale di dove guardare.
- **Tutti gli audio**, tutti i quadranti, tutte le sequenze.
- **La tipografia gigante**: `28vw` e' `28vw` ovunque. Su un telefono da 390 px
  fanno **109 px** di altezza di carattere. Non l'hanno rimpicciolita.

### Punti di rottura veri

Il CSS ha **sei soglie**: `399`, `400`, `768`, `1024/1025`, `1125`, `1500`
(piu' `1200`, `1400` e `1700` per casi isolati). Le due che contano sono
**769 px** (da telefono a tablet) e **1025 px** (da tablet a desktop, dove entra
tutta la scala in `vw`). C'e' anche una regola dedicata a
`(min-device-width:768px) and (max-device-width:1024px) and (orientation:landscape)`
— cioe' **l'iPad girato**, trattato a parte sei volte.

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| Framework | **Next.js** (versione dell'epoca, 9.x/10.x) | **VERIFICATO** | `X-Powered-By: Next.js` nell'intestazione HTTP di oggi; `/_next/static/...`, `__NEXT_DATA__`, `_buildManifest.js`, `_ssgManifest.js` nell'HTML archiviato |
| Vista | **React** | **VERIFICATO** | `react-dom`, `createElement` ovunque nei bundle |
| Rotte | pagina dinamica `/[locale]` con sottopagine `technology`, `watch`, `development` | **VERIFICATO** | i chunk si chiamano `pages/%5Blocale%5D-*.js`, `pages/[locale]/technology-*.js`, ecc. |
| Stato globale | **Redux** (`connect`, `appReducer`) | **VERIFICATO** | `e.appReducer.showIntro`, `e.appReducer.introHasStarted`, `Object(B.b)(mapState, mapDispatch)(Component)` |
| Animazione componenti | **Framer Motion** | **VERIFICATO** | `motion.div`, `variants:{open,closed}`, `useAnimation().start({...})`, `transition:{duration, ease:[.16,1,.3,1]}`. La stringa "framer-motion" e' sparita dalla minificazione, ma l'API e' inconfondibile |
| Animazione da scroll | **scritta in casa** su un unico `requestAnimationFrame` condiviso, con `lerp` a 0.15 | **VERIFICATO** | letto il modulo: `Set` di funzioni iscritte, lettura unica di `pageYOffset`, direzione `top`/`down`, `cancelAnimationFrame` quando il `Set` si svuota |
| **Nessuna libreria di scroll** | — | **VERIFICATO** | zero occorrenze di `gsap`, `ScrollTrigger`, `locomotive`, `scrollmagic`, `lenis`, `smooth-scrollbar`, `scrollama` in tutti i bundle |
| Gesti | **react-use-gesture** (oggi `@use-gesture`) | **VERIFICATO** | oggetto di stato condiviso `{hovering, scrolling, wheeling, dragging, pinching, touches, buttons, shiftKey…}`, `wheelShouldRun`, `getWheelValuesFromEvent`, `_isTap`, `swipe` |
| Visibilita' | **react-intersection-observer** | **VERIFICATO** | `useInView({triggerOnce:true, rootMargin:'1500px'})` — il margine di 1500 px e' il pre-caricamento delle immagini |
| Video | **react-player** | **VERIFICATO** | configurazioni per `hlsVersion 0.13.1`, `dashVersion 2.9.2`, `flvVersion 1.5.0`, piu' i moduli Wistia/Mixcloud/DailyMotion che react-player porta con se' (inutilizzati qui: costo netto in peso) |
| Animazioni vettoriali | **Lottie**, solo nella pagina Technology | **VERIFICATO** | campo `lottieFile` nel componente `GoreTextSlide`, classe `GoreTextSlide_lottie__MuqWk` |
| CMS | **Contentful**, spazio `1sddvf4stexr`, ambiente `master`, locale `en-EU` | **VERIFICATO** | SDK `contentful.js` nel chunk vendor; payload completo in `_next/data/.../en.json`; asset su `images.ctfassets.net` e `videos.ctfassets.net` |
| Immagini | `<picture>` + `<img>` con lista di larghezze `[256, 384, 512, 768, 1024, 1280, 1536, 1920, 2080, 2560]`, ridimensionate dall'API immagini di Contentful | **VERIFICATO** | valori di default del componente `ContentfulImage` nel bundle |
| Caricamento immagini | **Web Worker** che scarica l'immagine con `fetch`, ne fa un `blob` e restituisce un `blobURL` al thread principale | **VERIFICATO** | `/scripts/image.worker.js`, 255 byte, letto per intero |
| Punto focale | campo `focalPoint {x, y}` per ogni immagine nel CMS | **VERIFICATO** | presente su tutte le `richImage` (es. `893/301`, `1385/742`) |
| Stili | **CSS Modules** compilati (nessun CSS-in-JS a runtime) | **VERIFICATO** | classi `BlockProduct_stickyContainer__3HOAS`, due soli file `.css` statici |
| Font | **auto-ospitati** in `/fonts/`, woff2 + woff + ttf/otf, `font-display: swap` | **VERIFICATO** | cinque `@font-face` nel CSS, file presenti nell'archivio |
| Hosting | **Netlify**, rendering lato server | **VERIFICATO** | `Server: Netlify`, `X-Nf-Render-Mode: ssr`, `Cache-Status: "Netlify Durable"` |
| Analitica | Google Tag Manager | **SUPPOSTO** | c'e' una richiesta a `/_next/static/chunks/pages/gtm.js` nel registro dell'archivio (404 su quel percorso: probabilmente caricato altrove) |
| Suono | tag `<audio>` gestito da react-player, MP3 su Contentful | **VERIFICATO** | `shouldUseAudio()` sceglie fra `audio` e `video`; i file sono `.mp3` da 552 KB a 1,25 MB |
| 3D / WebGL | **nessuno** | **VERIFICATO** | zero `webgl`, `three`, `OffscreenCanvas`, `createImageBitmap` |
| Firma dello studio | `window.BIA_SCROLL_BLOCK` | **VERIFICATO** | Build In Amsterdam |

## Peso e prestazioni

Numeri veri dove ci sono, con la fonte.

**Codice servito (dimensioni compresse, prese dai registri dell'archivio — sono
le dimensioni sulla rete):**

| file | byte |
|---|---|
| bundle di pagina `77635add…` | 97.032 |
| chunk vendor `6b537485…` | 47.234 |
| `ea88be26…` | 66.097 |
| `framework…` | 41.121 |
| `polyfills…` | 31.742 |
| `05d954cf…` | 21.663 |
| `cfa46648…` | 11.941 |
| `_app…` | 8.158 |
| `main…` | 7.568 |
| `webpack…` | 2.099 |
| `…_CSS…` | 710 |
| **JS totale** | **≈ 335 KB compressi** (≈ 515 KB non compressi) |
| CSS `94534b5f` | 16.808 compressi / **119.393** non compressi |
| CSS `ccfaec16` | 5.552 compressi / **28.264** non compressi |
| **CSS totale** | **≈ 22 KB compressi / 148 KB non compressi** |
| **Font (5 × woff2)** | **185.674 byte ≈ 181 KB** |
| HTML della homepage (servito, gia' con i dati incorporati) | ≈ 45 KB compressi |

**Somma del guscio: circa 590 KB prima di qualunque fotografia.** Per un sito del
2020 con questa densita' visiva e' **ragionevole**, e la ragione e' esattamente
l'assenza di GSAP/three.js.

**Gli originali delle immagini sono enormi.** Contando gli asset citati nel
payload della sola homepage:

- **137 file**
- **222.150.259 byte = 211,9 MB** di originali
- i piu' pesanti: `eiger_dani-arnold_baikal_05753.jpg` **10,2 MB**;
  `Dani_Arnold_walking_in_the_ice.jpg` **9,6 MB** (2999×4000);
  `Dani Arnold walks under icicles.jpg` **7,2 MB**;
  `Cover_Background copy.jpg` (la versione verticale per telefono) **5,6 MB**.

Nessuno di questi arriva mai al browser: Contentful li ridimensiona alla
larghezza richiesta. Ma la scelta racconta il metodo: **hanno caricato i master e
si sono fidati del servizio**, invece di preparare a mano dieci tagli per
immagine.

**Le sequenze fotogramma per fotogramma, invece, sono ottimizzate a mano** e i
pesi si leggono nel registro dell'archivio:

- `gore-tex-*.jpg`: **32 file, fra 16,2 e 18,4 KB l'uno** → **≈ 550 KB per
  l'intera sequenza**.
- `watch-*.jpg`: **31 file, fra 162 e 190 KB l'uno** → **≈ 5,4 MB per l'intera
  sequenza**. Dieci volte tanto, perche' sono fotogrammi del documentario a piena
  risoluzione e non un'illustrazione di membrana.

**Video** (su Contentful): `Mammut_Nordwand_Background.mp4` **563 KB**, versione
telefono **345 KB**; `Dani_Climbing_3.mp4` **1,28 MB**;
`Dani_Rock_clumbing_2.mp4` **1,64 MB`. Sono piccoli: sono spezzoni brevi, in
muto, in ciclo, con `preload="metadata"`.

**Audio**: 4 MP3 da **552 KB**, **1.247 KB**, **731 KB**, **572 KB** — circa
**3 MB**, ma scaricati solo su richiesta.

**Cosa fanno per non affogare:**

- `useInView({ triggerOnce: true, rootMargin: '1500px' })` — le immagini
  cominciano a scaricarsi **1500 px prima** di entrare in schermo.
- Il **Web Worker** scarica l'immagine fuori dal thread principale e la
  restituisce come blob: la decodifica non blocca lo scroll.
- Ogni immagine ha un **segnaposto pulsante** nel colore scuro del blocco, e la
  proporzione e' riservata con `padding-bottom` percentuale: **niente salti di
  impaginazione**.
- Le sequenze tengono **tutti** i fotogrammi nel DOM e cambiano solo la classe
  `visible`: nessuna riassegnazione di `src` durante lo scroll, quindi nessun
  fotogramma bianco.
- `preload` esplicito nell'HTML per i due CSS e per tutti i chunk JS.
- `will-change: transform` messo **solo** sugli elementi con classe `inView`,
  cioe' acceso e spento — non lasciato sempre attivo.

**Punteggi Lighthouse / Core Web Vitals**: `non verificato`. Il sito non si apre
piu' e non ho trovato una misura d'epoca. Sospetto forte, dichiarato come tale:
**LCP pessimo**, perche' l'introduzione non mostra niente finche' non sono
arrivati un font e cinque fotografie da 1-2,8 MB ciascuna. Il voto Awwwards
usabilita' 7.46 (il piu' basso dei quattro) e' coerente.

## Tre cose da rubare

**1. Il tag prodotto vive nel CMS, in coordinate sull'immagine originale.**

La meccanica: ogni fotografia porta un elenco di coppie *(x, y in pixel
dell'originale) → riferimento a un prodotto*. In pagina, `x` viene diviso per la
larghezza dell'immagine e diventa una percentuale, quindi il punto segue
l'immagine a qualunque ritaglio e dimensione. Il redattore tagga una volta, in
un pannello, senza toccare il codice.

Per un marchio d'arredo e' esattamente il problema da risolvere: una fotografia
d'ambiente contiene otto prodotti, e nessuno vuole rifare l'HTML ogni volta che
cambia il divano. **Nascondi i punti dietro un'icona con il numero
(`3` accanto a una borsa)**: chi vuole guardare la stanza guarda la stanza; chi
vuole comprare lo dice con un clic. E lascia che **almeno un punto porti a
qualcosa che non e' un prodotto** — un audio, un dettaglio della lavorazione, il
nome dell'artigiano: e' quello che impedisce alla foto di sembrare un catalogo.

Costo: un campo ripetibile nel CMS con `x`, `y` e un riferimento, un
componente con `position:absolute` in percentuale, e un pannellino con immagine e
nome. Mezza giornata.

**2. Il caricamento e' il primo fotogramma del film, non un'attesa.**

La parola `BAIKAL` cresce **sul pannello arancione** e continua a crescere
**identica** sulla pagina vera quando il pannello sparisce. La stessa animazione
e' avviata in due componenti diversi con la stessa durata (4,1 s) e la stessa
curva. Chi guarda non vede un caricamento che finisce: vede una sola inquadratura
continua.

Ricetta esatta: (a) il pannello aspetta due condizioni — font caricato **e**
immagini caricate; (b) mentre aspetta, un colore pieno e il logo, niente
rotelline; (c) parte una sequenza a tempo fisso (500 ms a passo) che scambia le
foto dietro il titolo; (d) all'ultimo passo il pannello viene **smontato** e
sotto c'e' la stessa parola alla stessa scala che sta finendo la stessa
animazione. Per un marchio d'arredo: il nome del pezzo, o del materiale, o della
collezione, alla stessa dimensione sopra il colore e poi sopra la foto.

**3. Il prodotto entra due volte, con due velocita' diverse.**

Prima **passivamente**, dentro la fotografia, senza nome e senza prezzo — e' solo
un punto che puoi ignorare. Poi **attivamente**, quattro volte in tutta la
pagina, quando lo scroll si inchioda (`position: sticky`, `100vh`), il fondo
diventa pieno e per tre-quattro schermate esiste solo quell'oggetto.

Il dettaglio che fa la differenza: **il fattore di ingrandimento cresce con la
specificita' dell'affermazione**. `zoomFactor` 1.2 sull'affermazione generica
("tre anni di sviluppo"), 1.5 su quella di materiale ("tessuto lavorato in 3D"),
1.7 su quella di prestazione ("piu' leggero, ventilazione eccellente"), e poi
**torna a 1** per l'ultima diapositiva, dove l'oggetto si sposta a lato e a
destra sale il numero misurato. La fotocamera si avvicina finche' l'affermazione
riguarda la materia, e si allontana quando arriva il dato.

Per un marchio d'arredo il ricalco e' immediato: 1.2 sulla storia della bottega,
1.5 sulla trama del tessuto, 1.7 sulla giunzione a coda di rondine, 1.0 sul
numero (`30 anni di garanzia`, `12 mani di olio`, `zero colle`). E il prezzo si
tiene fuori, come qui.

## Non verificato

- **Il sito in movimento.** Non l'ho mai visto girare. Tutte le animazioni sono
  ricostruite leggendo durate, curve e valori nel JavaScript e nel CSS, non
  guardando. Il **numero di schermate di scroll** e' quindi una stima, non una
  misura.
- **I filmati di anteprima di Awwwards** non li ho estratti: la scheda del premio
  non me ne ha restituito gli URL diretti e non ho voluto aprire una scheda del
  browser per cercarli. Sarebbe l'unico modo per vedere davvero il movimento.
- **Punteggi di prestazione** (Lighthouse, Core Web Vitals, tempo al primo
  contenuto): nessuna misura d'epoca trovata, e non e' piu' misurabile.
- **Peso reale della pagina alla prima visita**: ho i pesi dei singoli file, ma
  non so quante immagini vengano effettivamente scaricate prima dell'interazione
  (dipende dal `rootMargin` di 1500 px e dall'altezza della finestra). La cifra
  di 211,9 MB e' quella degli **originali nel CMS**, non del traffico.
- **Prezzi**: la classe `ProductTooltip_price` esiste nel CSS ma non c'e' nessun
  campo prezzo nel CMS. Non so se in una versione precedente il prezzo ci fosse.
- **Il percorso d'acquisto vero e proprio** non e' su questo sito: comincia
  quando si apre `mammut.com` in una scheda nuova. Non l'ho seguito.
- **Le cifre di risultato commerciale** (vendite, conversione, traffico): la
  pagina del caso studio su `buildinamsterdam.com` restituisce 404 su tutti gli
  indirizzi che ho provato (`/work/mammut/`, `/en/cases/mammut`). Non ho numeri.
- **Perche' il sito e' rotto**: il 500 dice che il rendering lato server
  fallisce; l'ipotesi delle chiavi Contentful scadute e' mia, non provata.
- **La sequenza mobile** (`/gore-tex/mobile/...`, `/watch/mobile/...`): i
  conteggi (27 e 37) sono verificati nel codice, ma i file non compaiono
  nell'archivio, quindi non ho potuto verificarne il peso.
- **Google Tag Manager**: dedotto da un percorso nel registro dell'archivio, non
  visto nell'HTML.
- **Il carattere Whyte Inktrap**: identificato dal nome del file, non ho
  verificato la licenza ne' la fonderia (indicata come ABC Dinamo a memoria,
  quindi `non verificato`).
- **Le versioni tedesca e francese**: esistono (`/de`, `/fr`, con payload da 39 KB
  ciascuno) ma non le ho lette. Presumo siano la stessa struttura tradotta.
- Alla fine del lavoro **non ho lasciato nessuna scheda di browser aperta**,
  perche' non ne ho aperta nessuna.
