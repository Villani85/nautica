# «Se e' tutto dentro un canvas, mi trova Google?»

La risposta da dare al cliente, con le prove. Fonti primarie lette
direttamente; dove e' dichiarato e non verificato, sta scritto.

## In una riga
**Google renderizza il tuo JavaScript ma indicizza il DOM testuale, non i
pixel.** I crawler delle AI stanno un gradino sotto: **non eseguono affatto il
JavaScript**. Un sito tutto dentro un canvas non e' penalizzato — **e'
assente**.

---

## 1. Google renderizza tutto. Non e' quello il problema.

**Vercel + MERJ, luglio 2024**, oltre 100.000 richieste di Googlebot appaiate
con i beacon lato client: **«100% delle pagine HTML ha prodotto un rendering
completo, comprese quelle con interazioni JS complesse»**. Ritardo: mediana
**10 secondi**, 75° percentile 26 s, 90° circa 3 ore.

Quindi il collo di bottiglia non e' il rendering. E' che **dopo aver
renderizzato, il testo e' pixel**.

## 2. Il canvas costa DOPPIO, e questo non lo cita quasi nessuno

Dal blog ufficiale di Google Search Central, **31 marzo 2026**:

> «Rendering pulls in and executes JavaScript and CSS files, and processes XHR
> requests to better understand the page's textual content and structure
> **(it doesn't request images or videos)**.»

**Il servizio di rendering non scarica immagini ne' video.** Su un sito WebGL
significa che **le texture non vengono nemmeno richieste**: la scena, per
Google, si compone su asset mancanti. Nessun testo E nessun asset.

Piu' un limite duro: **2 MB per URL**. Oltre quella soglia i byte «non vengono
recuperati, non vengono renderizzati e non vengono indicizzati».

## 3. Google lo ammette per iscritto — vendendo la soluzione

Dal blog Chrome per sviluppatori (agg. 19/05/2026), che annuncia l'origin trial
dell'API **HTML-in-Canvas**, elencando cio' che risolve:

> «**Indexability and AI agent interfaceable**: Web crawlers and AI agents can
> seamlessly index and read the text rendered into your 2D and 3D scenes.»

> «all the powerful browser features integrated into the DOM **break completely**
> when the UI is trapped inside a static canvas pixel grid.»

E' presentata come **capacita' nuova**, cioe' oggi non esiste. L'ammissione vale
proprio perche' arriva da chi vende il rimedio.

**Nota:** su Search Central la parola «canvas» non compare mai. E il thread
ufficiale della community *«Can google crawl WebGL/Canvas content?»*, aperto nel
**2019**, ha ricevuto in tutta la sua vita **una sola risposta, da un utente
qualunque**. Nessun Googler ha mai risposto.

## 4. I crawler delle AI non eseguono JavaScript. Punto.

**Vercel, dicembre 2024**, misurato sulla rete di produzione:

> «**nessuno dei principali crawler AI oggi renderizza JavaScript**: OpenAI
> (OAI-SearchBot, ChatGPT-User, GPTBot), Anthropic (ClaudeBot), Meta, ByteDance,
> Perplexity.»

E il dettaglio che smonta l'obiezione «ma i file .js li scaricano»: ChatGPT
scarica JavaScript nell'**11,5%** delle richieste, Claude nel **23,8%** — *ma
non lo esegue*. «They can't read client-side rendered content.»

Eccezioni: **Gemini** (eredita l'infrastruttura Google) e **Applebot**.

Un test su dominio dedicato (gennaio 2026) aggiunge: ChatGPT-User *«recupera
l'HTML e si ferma li'»*, con timeout a **5 secondi**; GPTBot esegue in meno
dell'1% dei casi. E **nessuna** delle documentazioni ufficiali di OpenAI,
Anthropic e Perplexity dice una riga sul JavaScript — mentre chi renderizza
(Google, Bing) lo dichiara, perche' e' un argomento di vendita.

Intanto il traffico cresce a tre cifre: **GPTBot +305%**, ChatGPT-User
+2.825% anno su anno (Cloudflare).

## 5. La misura che chiude il discorso

Richiesta dell'HTML grezzo di tre siti WebGL di riferimento, con tre user-agent
diversi:

| sito | byte HTML | testo nel body | `<h1>` |
|---|---|---|---|
| **igloo.inc** (Site of the Year) | 1.410 | **0** | 0 |
| **lusion.co** | 58.527 | **2.152** | 1 |
| **bruno-simon.com** | 58.784 | **3.130** | 0 |

Il body di igloo.inc e' letteralmente `<body></body>`. Tutto quello che un
crawler senza JavaScript vede di quel sito sono **circa 110 caratteri** fra
titolo e meta description.

Due conclusioni:
- **byte identici per Chrome, Googlebot e GPTBot** su tutti e tre: nessuno fa
  rendering dinamico, quello che vedi e' quello che vede il bot;
- **i due piu' bravi al mondo sul WebGL l'HTML testuale ce l'hanno.** Non e' un
  caso. igloo.inc e' il controesempio, non il modello.

## 6. Il testo per i lettori di schermo NON e' spam. C'e' scritto.

Dalle policy antispam di Google (agg. 15/05/2026), elenco testuale di cio' che
**non** e' contenuto nascosto illecito:

> «**Text that's only accessible to screen readers and is intended to improve
> the experience.**»

Quindi `sr-only` e gli attributi ARIA sono coperti da una dichiarazione
esplicita. Non e' interpretazione.

Il discrimine e' **l'intento**, non la tecnica: il cloaking e' definito come
presentare contenuti diversi «with the intent to manipulate search rankings and
mislead users». E Bing lo mette anche piu' chiaro: se fai «a good faith effort
to return the same content to all visitors», non e' cloaking.

**La zona grigia vera, e va detta al cliente.** La tecnica piu' diffusa fra i
professionisti — tenere il DOM completo e metterlo a `color: transparent`
mentre il WebGL disegna **le stesse identiche parole** — sta esattamente in
mezzo: «setting the font size or opacity to 0» e' nell'elenco dei divieti alla
lettera, ma manca l'intento di ingannare. **Nessuno di Google si e' mai
espresso su questo caso.** Rischio basso, non nullo. Chi vuole rischio zero
tiene il testo **visibile** e mette il canvas dietro, oppure fa rendering lato
server e idrata dopo — che e' poi la raccomandazione di Google stessa.

**E il contenuto scritto DENTRO `<canvas>...</canvas>` non serve**: lo mostrano
solo i browser che non supportano canvas, e il servizio di rendering di Google
e' Chromium moderno. Non contarci.

## 7. L'analogia con Flash va rovesciata

Si cita sempre il fatto che nel 2008 Google imparo' a indicizzare dentro i file
Flash. Ma dallo stesso annuncio:

> «**What about non-textual content, such as images?** At present, we are only
> discovering and indexing textual content in Flash files. If your Flash files
> only include images, **we will not recognize or index any text that may appear
> in those images**.»

> «If you prefer Google to ignore your less informative content [...] consider
> **replacing the text within an image, which will make it effectively invisible
> to us**.»

Google leggeva dentro gli SWF per due ragioni contingenti: il formato conteneva
**oggetti testo veri**, e **Adobe consegno' una libreria apposita**. Il canvas
non ha ne' l'una ne' l'altra. Il testo in WebGL e', secondo la definizione di
Google stessa, «testo dentro un'immagine» — cioe' la cosa che loro suggerivano
di usare **per rendersi invisibili**.

---

## LA RISPOSTA AL CLIENTE, in cinque righe

> Google **legge** il sito: esegue tutto il codice, come farebbe un browser. Ma
> indicizza le **parole nel documento**, non quelle disegnate dentro la scena:
> se il testo vive solo nel canvas, per lui non esiste. Peggio ancora fanno i
> crawler di ChatGPT, Claude e Perplexity, che **non eseguono nemmeno il
> codice** e si fermano all'HTML della prima richiesta.
>
> La soluzione non e' rinunciare alla scena: e' **tenere il contenuto vero nel
> documento** — titoli, testi, navigazione — e usare il canvas come strato
> visivo sopra. Lo fanno gia' i due studi migliori al mondo su questa tecnica:
> Lusion ha 2.152 caratteri di testo in HTML, il portfolio di Bruno Simon 3.130.
>
> Costa qualche giorno in piu' in fase di costruzione, e Google dichiara per
> iscritto che il testo destinato ai lettori di schermo **non e' contenuto
> nascosto**. Il sito che ha vinto il premio piu' importante del 2024 ha un
> `<body>` vuoto: e' bellissimo, e non lo trova nessuno.
