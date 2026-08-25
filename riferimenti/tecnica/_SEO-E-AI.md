# SEO e AI per i siti a canvas

_Ricerca del 13 agosto 2026 — per rispondere all'obiezione: "un sito dentro un canvas e' invisibile a Google e alle AI"._

**Convenzione usata in tutto il documento:**
- **[VERIFICATO]** = l'ho controllato di persona (richiesta HTTP, lettura del sorgente, lettura della fonte primaria). Metodo e dato riportati.
- **[DICHIARATO]** = qualcuno lo afferma (Google, un vendor, un blog). Riportato con la fonte, non come fatto.

---

## 0. La tesi in una riga

Il canvas non e' il problema. Il problema e' **cosa resta quando il canvas non viene disegnato**. Chi vince i premi e viene anche trovato non rinuncia al canvas: gli costruisce accanto un secondo sito, testuale, servito dal server. Sono due prodotti sullo stesso dominio.

---

## 1. Come lo risolvono i siti premiati

Due strategie opposte, entrambe da studi di primissima fascia. Ho scaricato e letto entrambi i siti.

### 1a. basement.studio — il gemello testuale servito dal server

**[VERIFICATO]** Tutto quanto segue con `curl` il 13/08/2026.

**Il canvas c'e', ma il testo non ci vive dentro.** La home HTML servita dal server pesa 223 KB e contiene gia', prima di qualsiasi JavaScript:
- 2.849 caratteri di testo reale (headline, descrizioni progetti, capabilities);
- 29 link interni;
- 10 heading `<h1>`–`<h3>`;
- 3 blocchi JSON-LD: `Organization`, `WebSite`, `ProfessionalService` (con `hasOfferCatalog`, `knowsAbout`, `areaServed`, `foundingDate`, `email`).

Il `<canvas>` WebGL non e' nell'HTML iniziale: viene creato dal client sopra il contenuto. **Il contenuto e' il documento, il canvas e' la pelle.** E' l'inverso dell'errore classico.

**Il gemello in markdown.** Ogni pagina con contenuto strutturato e' servita anche come markdown:

| URL | Esito | Content-Type |
|---|---|---|
| `/index.md` | 200, 4.935 B | `text/markdown` |
| `/services.md` | 200, 1.266 B | `text/markdown` |
| `/people.md` | 200, 5.895 B | `text/markdown` |
| `/showcase.md` | 200, 3.387 B | `text/markdown` |
| `/showcase/vercel-ship-a-home-for-innovation.md` | 200, 1.269 B | `text/markdown` |
| `/contact.md`, `/blog.md`, `/lab.md` | **404** | — |

**Correzione a una voce diffusa:** il gemello **non e' completo**. Le pagine interattive o a indice (`/contact`, `/blog`, `/lab`) non hanno la versione `.md`. E' una scelta coerente, non una dimenticanza — vedi il punto successivo.

**La scoperta non e' lasciata all'indovinello.** Due meccanismi, entrambi verificati:

1. **Header HTTP `Link`**, emesso per-pagina:
   ```
   GET /            → Link: </index.md>; rel="alternate"; type="text/markdown"
   GET /showcase    → Link: </showcase.md>; rel="alternate"; type="text/markdown"
   GET /people      → Link: </people.md>; rel="alternate"; type="text/markdown"
   GET /contact     → (nessun header Link)
   ```
   L'header viene emesso **solo dove il `.md` esiste davvero**. Nessun rimando rotto: un agente che segue l'header non incontra mai un 404. Questo e' il dettaglio che separa l'implementazione seria dalla copia frettolosa.

2. **Content negotiation.** `curl -H "Accept: text/markdown" https://basement.studio/` restituisce `200 · 4.935 B · text/markdown` — cioe' lo stesso corpo di `/index.md`, sull'URL canonico. Un agente puo' quindi ottenere la versione testuale **senza conoscere la convenzione `.md`**.

**La pillola HUMAN / MACHINE.** E' nell'HTML servito dal server, dentro il `<nav>`:
```html
<span>Human</span><a href="/ai" ...>Machine</a>
```
Non e' un vezzo grafico: e' un link crawlabile verso `/ai`, presente su ogni pagina.

**La pagina `/ai` ("Machine view").** 100.856 byte, `<title>Machine view | basement.studio</title>`, **zero `<canvas>`**. Si apre con un logo ASCII-art e la riga:
> `# plain-text mirror of basement.studio for AI agents, crawlers, and humans who prefer it raw.`

Contiene 7.789 caratteri di testo in sezioni a larghezza fissa: `ABOUT`, `CAPABILITIES`, `VENTURES`, `CLIENTS`, `SHOWCASE`, `CONTACT`, con campi allineati stile scheda tecnica (`name`, `founded`, `location`, `services`, `clients`, `knows_about`). Esiste anche `/ai/blog` (200, 55 KB). La `<nav aria-label="Site index">` elenca tutte le sezioni.

**`llms.txt`.** `https://basement.studio/llms.txt` → **200, 1.869 B, `text/plain`**. Formato conforme alla spec: `# H1`, `> blockquote` di sintesi, sezioni `## Key pages`, `## Lab & experiments`, `## Contact`, ciascuna con liste di link annotati. Include esplicitamente la riga:
> `- [Machine view](https://basement.studio/ai): Single-page plain-HTML index of the entire site for agents.`

`/llms-full.txt` **non esiste** (404).

**`robots.txt`.** Elenca **uno per uno e in positivo** i bot AI: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-User`, `Claude-SearchBot`, `PerplexityBot`, `Google-Extended`, poi `*`. Tutti `Allow: /` con `Disallow: /api/` e `/studio` (il CMS). Dichiara `Host` e `Sitemap`. Non e' necessario nominarli — `User-Agent: *` basterebbe — ma e' una **dichiarazione di intenti leggibile**: "vi vogliamo qui".

**Sitemap.** `/sitemap.xml` → 200, `application/xml`, **71 URL**. Include `/ai`. **Non** include i file `.md` — quelli si trovano via header `Link`, via `llms.txt` e via content negotiation. Divisione dei ruoli pulita: la sitemap parla a Google, l'header e llms.txt parlano agli agenti.

**Nessun cloaking.** Richiesta della home con `User-Agent: GPTBot` → stessi 222.978 byte del browser. Contenuto identico per tutti.

### 1b. activetheory.net — lo specchio DOM della scena WebGL, e il prezzo che paga

**[VERIFICATO]** Tutto quanto segue scaricando l'HTML e il bundle JS il 13/08/2026.

**Il lato duro del confronto, prima di tutto.** L'HTML servito dal server e' di **5.952 byte** e il `<body>` contiene **esclusivamente**:
```html
<body>
    <noscript><p ...>Please enable javascript</p></noscript>
</body>
```
Zero link (`<a href>`: **0**). Zero heading (`<h1>`–`<h3>`: **0**). Zero testo di contenuto. L'unico testo indicizzabile senza JavaScript e' `<title>`, `<meta description>` e i tag OG.

Peggio: **ogni URL restituisce lo stesso identico documento**.

| URL | HTTP | Byte | `<title>` |
|---|---|---|---|
| `/` | 200 | 5.952 | Active Theory · Creative Digital Experiences |
| `/work` | 200 | 5.952 | idem |
| `/about` | 200 | 5.952 | idem |
| `/qualcosa-che-non-esiste-xyz` | **200** | 5.952 | idem |

Un URL inesistente risponde **200, non 404**. Stesso `title` e stessa `meta description` per ogni pagina. `/sitemap.xml` → restituisce lo shell SPA (`text/html`, 5.952 B): **la sitemap non esiste**. `/llms.txt` → idem, soft-404: **non esiste**. `robots.txt` esiste ma e' `User-agent: * / Disallow:` — vuoto. Con `User-Agent: GPTBot` la risposta e' sempre lo stesso shell da 5.952 byte.

**Conclusione onesta su Active Theory: la loro intera scopribilita' e' scommessa sull'esecuzione del JavaScript.** Chi non renderizza vede un sito di una pagina con un titolo.

**Detto questo, cio' che costruiscono *dopo* il JS e' la cosa piu' interessante del settore.**

**Il livello di accessibilita' `GLA11y` — che loro chiamano internamente GLSEO.** Il CSS e' inline nell'`<head>` della pagina, quindi visibile senza nemmeno scaricare il bundle:
```css
.GLA11y{position:absolute;width:0;height:100%;clip:rect(0 0 0 0);overflow:hidden}
```
Nel bundle (`app.1780406240914.js`, 1.817.616 byte) la classe `GLA11y` ricorre **32 volte**. L'oggetto e' esposto come `window.GLSEO` — il nome che gli danno gli autori dice l'intenzione.

L'API interna, letta dal sorgente:
- `GLA11y.registerPage(scene, "AboutPage")` — registra una scena 3D come "pagina";
- `GLA11y.textNode(group, string)` — aggancia un nodo di testo DOM a un gruppo 3D;
- `GLA11y.objectNode(...)` — idem per elementi interattivi;
- ogni oggetto riceve una proprieta' `seo` con `enabled`, `hidden`, `sortOrder`, `div`.

Il dettaglio architetturale che conta: `sortOrder` e' una property con setter che **riordina fisicamente i `div` nel DOM** (`parent.seo.div.insertBefore(...)`) quando l'ordine visivo cambia. E un `loop()` sincronizza continuamente visibilita' e cancellazione con lo stato della scena (`determineVisible()`, `deleted`). **Non e' un blocco di testo statico nascosto: e' uno specchio vivo dell'albero 3D.**

Ancora piu' importante, il testo **non viene riscritto a mano**: viene estratto dagli oggetti di testo 3D veri.
```js
const getText = text3d => text3d.text.text.string;
GLA11y.registerPage(_this.scene, "AboutPage");
GLA11y.textNode(_this.layers.text.group, getText(_this.layers.text));
GLA11y.textNode(_this.layers.copy.group, getText(_this.layers.copy));
```
**Questa e' la lezione trasferibile:** il testo accessibile ha **una sola sorgente**, condivisa con la geometria. Non puo' divergere dalla scena, perche' e' la scena. Il duplicato mantenuto a mano invecchia in tre settimane; questo no.

Sulla pagina contatti, in chiaro nel bundle:
```js
GLA11y.registerPage(_this.ui.group, "ContactPage");
GLA11y.textNode(_this.contact.group, "Contact Us");
GLA11y.textNode(_this.lax.group, "Los Angeles");
GLA11y.textNode(_this.nyc.group, "New York City");
GLA11y.textNode(_this.ams.group, "Amsterdam");
GLA11y.textNode(_this.email.group, "Email us at hello@activetheory.net");
```

**Gli strumenti per gli agenti AI: `navigator.modelContext`.** Nel bundle ricorre **10 volte**, `registerTool` **9 volte**.

> ⚠ **Correzione, vedi §2a:** `navigator.modelContext` **non e' piu' l'API corrente**. Dal 19/05/2026 la specifica la espone come **`document.modelContext`**. Il codice di Active Theory e' scritto contro una versione superata: la sua feature detection su un browser conforme alla spec attuale non entra mai. **Non copiare questo pattern cosi' com'e'.** Il blocco e' protetto da feature detection e attivato a caricamento finito:
```js
_this.listen("Global/loadFinished", _ => {
    if (!navigator.modelContext) return;
    ...
});
```
I **9 strumenti registrati**, con i nomi esatti dal sorgente:

| Strumento | Cosa fa |
|---|---|
| `get_more_agency_info` | Restituisce una scheda testuale dello studio (fondazione 2012, premi: 126 FWA, 24 Cannes Lions, 15 CLIO, 69 Awwwards, un Golden Globe; sedi Los Angeles, New York, Amsterdam; capabilities) |
| `get_all_projects` | Serializza in JSON tutti i progetti dal CMS (`title`, `subhead`, `description`, `perma`, `clientName`, `tags`, `date`, link, `priority`) |
| `search_projects_by_keywords` | Ricerca substring case-insensitive su titolo, descrizione, copy, tag, cliente |
| `show_projects_with_tag` | Filtra **e ri-mescola le card sulla pagina** (enum dei tag generato dal CMS a runtime) |
| `show_projects_by_permas` | Mostra un set specifico di progetti scelto dall'agente |
| `show_specific_project` | Apre la pagina di un progetto e ne restituisce i dati |
| `scroll_to_page_section` | Scorre a `top` / `about` / `work` / `lab` |
| `scroll_through_projects` | Fa scorrere visivamente la sezione work |
| `open_contact_page` | **Apre la modale contatti** e restituisce l'email |

Due dettagli che rivelano il livello di cura:
- `scroll_through_projects` installa listener di interruzione: se l'utente umano tocca mouse/scroll/tastiera mentre l'agente sta scorrendo, la funzione si ferma e restituisce `"Stopped scrolling because user interaction was detected."` — **l'agente non sequestra il controllo all'umano**;
- gli `enum` degli `inputSchema` (tag e perma) sono **generati a runtime da `window.CMS_DATA`**: l'agente non puo' inventarsi un valore inesistente, e il contratto resta allineato al CMS senza manutenzione.

Nota commerciale: `open_contact_page` significa che **un agente AI puo' portare un lead fino al punto di conversione**. E' il primo caso di "l'AI usa il sito" invece di "l'AI legge il sito".

### 1c. Quanto e' diffuso davvero, tra gli studi premiati

**[VERIFICATO]** Sondaggio `llms.txt` su 14 studi noti, 13/08/2026 (`curl`, distinguendo il `text/plain` vero dal soft-404 `text/html` degli SPA):

| Esito | Studi |
|---|---|
| **llms.txt reale** (3/14) | `basement.studio` (1.869 B), `locomotive.ca` (8.557 B), `14islands.com` (6.611 B) |
| **404 o soft-404** (11/14) | `activetheory.net`, `lusion.co`, `unseen.co`, `dogstudio.co`, `obys.agency`, `immersive-g.com`, `studiofreight.com`, `aristidebenoist.com`, `bruno-simon.com`, `resn.co`, `hello-monday.com` |

I tre file veri sono conformi alla spec (H1, blockquote di sintesi, sezioni H2 con link annotati). Locomotive apre con:
> `> Locomotive is an independent digital-first design agency based in Montréal... seven-time Awwwards Agency of the Year winner (2018–2024).`

**Lettura onesta del dato:** ~21% tra la fascia alta. E' una pratica **emergente e minoritaria**, non uno standard di settore. Chi la adotta lo fa come segnale di posizionamento oltre che come tecnica.

### 1d. La prova che smonta la premessa: canvas e DOM crawlabile convivono

**[VERIFICATO]** 13/08/2026. Ho misurato l'HTML **servito dal server** (nessun JavaScript eseguito) di cinque siti WebGL premiati, contando `<canvas>`, testo, link e heading nello stesso documento:

| Sito | `<canvas>` nell'HTML | Testo SSR | Link | Heading | Verdetto |
|---|---|---|---|---|---|
| **lusion.co** | **3** | 2.152 car. | 26 | 3 | canvas **e** contenuto |
| **locomotive.ca** | **1** | 2.391 car. | 36 | 17 | canvas **e** contenuto |
| **14islands.com** | **1** | 1.755 car. | 57 | 38 | canvas **e** contenuto |
| **basement.studio** | 0 (creato dal client) | 2.849 car. | 29 | 10 | contenuto, canvas sopra |
| **activetheory.net** | 0 (creato dal client) | **0** | **0** | **0** | solo canvas |

Lusion e' uno dei siti WebGL piu' spinti al mondo: **tre elementi `<canvas>` gia' nell'HTML del server**, e nello stesso documento 2.152 caratteri di testo, 26 link e 3 heading.

**Questo e' il dato che chiude la discussione tecnica.** Il `<canvas>` e' un elemento HTML come gli altri: convive nello stesso documento con `<h1>`, `<p>` e `<a>`. Su 5 siti premiati, **4 servono contenuto testuale completo dal server**, canvas o non canvas. L'unico che non lo fa e' Active Theory — e non e' il canvas ad averglielo impedito, e' la scelta di non fare rendering lato server.

> **La frase da tenere:** un sito non e' "dentro un canvas". Il canvas e' *dentro* il sito. Chi perde l'indicizzazione non l'ha persa per il WebGL: l'ha persa per aver spedito un `<body>` vuoto.

### 1e. I due modelli, affiancati

| | **basement.studio** | **activetheory.net** |
|---|---|---|
| Filosofia | Gemello testuale **servito dal server** | Specchio DOM **costruito dal client** |
| Funziona senza JS | **Si'** | **No** |
| Contenuto per pagina | Distinto, SSR | Identico su ogni URL |
| 404 reali | Si' | No (tutto 200) |
| Sitemap | 71 URL | Assente |
| llms.txt | Si', conforme | Assente |
| Markdown per agenti | `.md` + header `Link` + `Accept` | Assente |
| Vetrina della cosa | Pillola HUMAN/MACHINE + `/ai` | Nessuna |
| Dati strutturati | 3 blocchi JSON-LD | Solo OG/Twitter |
| Accessibilita' della scena 3D | n/d (contenuto in DOM reale) | **GLA11y: specchio vivo dell'albero 3D** |
| Strumenti per agenti | No | **9 tool `navigator.modelContext`** |
| Robots verso i bot AI | Allowlist esplicita di 8 bot | Generico vuoto |

**La sintesi da portare in riunione:** basement risolve il problema di **essere trovato**; Active Theory risolve il problema di **essere usato**. Sono complementari, e la ricetta migliore prende da entrambi — la base SSR di basement, l'idea della sorgente unica di Active Theory. Nessuno dei due ha rinunciato al canvas.

---

## 2. WebMCP / `navigator.modelContext` (oggi `document.modelContext`): che cos'e' e chi lo vuole davvero

### 2a. Prima cosa: il nome nel nostro documento e' gia' vecchio

**[VERIFICATO]** 13/08/2026, leggendo la specifica e la cronologia del repo.

Nel bundle di Active Theory (sezione 1b) l'API compare come **`navigator.modelContext`**. Era corretto quando quel codice e' stato scritto, **non lo e' piu'**. La PR [webmachinelearning/webmcp#177 — *"Scope `ModelContext` to `Document`"*](https://github.com/webmachinelearning/webmcp/pull/177), **merged il 19 maggio 2026**, ha spostato l'oggetto da `Navigator` a `Document`.

La [specifica corrente](https://webmachinelearning.github.io/webmcp/) dice, testualmente:
```webidl
partial interface Document {
  [SecureContext, SameObject] readonly attribute ModelContext modelContext;
};

[Exposed=Window, SecureContext]
interface ModelContext : EventTarget {
  Promise<undefined> registerTool(ModelContextTool tool,
                                  optional ModelContextRegisterToolOptions options = {});
  Promise<sequence<RegisteredTool>> getTools(optional ModelContextGetToolOptions options = {});
  attribute EventHandler ontoolchange;
};
```
Nel README della proposta `navigator.modelContext` ricorre **0 volte**, `document.modelContext` **15 volte**.

**Conseguenza pratica, e non e' un dettaglio:** il codice di Active Theory e' scritto contro una versione dell'API che la specifica ha gia' abbandonato. La sua feature detection (`if (!navigator.modelContext) return;`) su un browser che implementa la spec attuale **non entra mai**. Chiunque copi quel pattern oggi scrive codice morto. Se implementiamo, si implementa `document.modelContext` con detection su entrambi.

### 2b. Che cos'e', in una definizione

**[VERIFICATO]** dal [README della proposta](https://github.com/webmachinelearning/webmcp/blob/main/README.md).

WebMCP permette a una pagina di **dichiarare le proprie funzionalita' come "tool"** — o funzioni JavaScript (API imperativa) o elementi `<form>` HTML annotati (API dichiarativa) — con **descrizione in linguaggio naturale** e **schema JSON degli argomenti**, perche' un agente AI li elenchi e li invochi. Esempio dalla proposta:
```js
await document.modelContext.registerTool({
  name: "filter-templates",
  description: "Filters the list of templates based on a natural language visual description.",
  inputSchema: { type: "object", properties: { description: { type: "string", ... } },
                 required: ["description"] },
  execute({ description }) { filterTemplatesInUI(description); }
});
```

**La differenza con MCP "vero" (quello di Anthropic).** MCP classico e' una *backend integration*: l'agente parla con i server del servizio, **scavalcando il sito**. WebMCP e' l'opposto: i tool vivono **nella pagina gia' aperta e gia' autenticata**, riusano il codice client esistente e aggiornano la UI che l'utente sta guardando. Il README lo chiama esplicitamente un rimedio alla **"UI disintermediation"** — cioe' e' anche una mossa difensiva dei siti contro il rischio che l'AI li disintermedi.

**Attenzione al nome, perche' inganna.** La spec **non prescrive MCP** come formato: dice che il browser puo' esporre i tool "via Model Context Protocol, other proprietary 'function calling' methods, or any other way". Non c'e' MCP dentro WebMCP. Lo notano *entrambi* i produttori terzi (vedi sotto).

### 2c. Chi lo propone e in che gruppo sta

**[VERIFICATO]** dalla [TAG design review #1238](https://github.com/w3ctag/design-reviews/issues/1238), campo *"Where and by whom is the work being done"*:

| | |
|---|---|
| **Autori** | Dominic Farolino (**Google**), Brandon Walderman (**Microsoft**) |
| **Organizzazioni che guidano il design** | **Google, Microsoft** |
| **Venue** | [W3C **Web Machine Learning Community Group**](https://www.w3.org/community/webmachinelearning/) — un **CG**, cioe' incubazione, **non** un Working Group: nessun percorso a Raccomandazione, nessun impegno di interoperabilita' |
| **Stato TAG** | review **aperta**, etichettata `Missing: Multi-stakeholder support`; API design, sicurezza, privacy, accessibilita' e i18n tutti ancora `(pending)` |

Che il TAG stesso etichetti la proposta **"Missing: Multi-stakeholder support"** e' il dato piu' compatto sullo stato reale della cosa.

### 2d. Le tre posizioni ufficiali, con i link

**[VERIFICATO]** 13/08/2026, leggendo i tre repository di standards-positions e la pagina di implementation status.

| Produttore | Posizione | Documento |
|---|---|---|
| **Google (Chrome)** | **Proponente e implementatore.** Origin Trial **live in Chrome 149** | [Chrome Status #5117755740913664](https://chromestatus.com/feature/5117755740913664) (stadio: *Proposed*) · [blog developer.chrome.com](https://developer.chrome.com/blog/ai-webmcp-origin-trial) · [Intent to Experiment su blink-dev](https://groups.google.com/a/chromium.org/g/blink-dev/c/gmYffo5WOE8/m/OJxuQRP3AAAJ) |
| **Apple (WebKit/Safari)** | **OPPOSE** — dichiarata il 3 giugno 2026, issue chiusa l'11 giugno 2026 | [WebKit/standards-positions#670](https://github.com/WebKit/standards-positions/issues/670), label `position: oppose` |
| **Mozilla (Firefox)** | **NEUTRAL** — proposta l'1 giugno 2026, issue chiusa il 5 agosto 2026 | [mozilla/standards-positions#1412](https://github.com/mozilla/standards-positions/issues/1412), label `position: neutral` · [Bugzilla 2018306](https://bugzilla.mozilla.org/show_bug.cgi?id=2018306) |

Altri due implementatori, per completezza: **Microsoft Edge** ha un Origin Trial live in **Edge 150**; **Brave** ha supporto sperimentale in Leo AI chat ([brave-browser#55232](https://github.com/brave/brave-browser/issues/55232)). Fonte: [implementation-status.md](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md).

**La conferma del punto lasciato in sospeso: si', Apple si oppone e Mozilla e' neutrale.** Ed e' un allineamento asimmetrico: i due proponenti spediscono codice in Origin Trial, i due terzi non implementano nulla.

### 2e. Le ragioni di Apple, testuali

**[VERIFICATO]** Citazioni letterali dal commento di **Mike Wyrzykowski (Apple)**, [WebKit/standards-positions#670](https://github.com/WebKit/standards-positions/issues/670), 3 giugno 2026. Sono sette obiezioni; qui le cinque che contano per noi, in originale con la resa italiana.

**1. Il buco e' nella semantica della pagina, non manca un'API.**
> *"When a site's actions are hard for an agent to use, that is a gap in the page's own semantics, and the fix, in our opinion, is to close it in the platform's shared layers (HTML and ARIA), where the user, assistive technology, and agents all benefit."*

E la fragilita' non sparisce, si sposta: l'agente sceglie comunque il tool interpretandone nome e descrizione in linguaggio naturale, e la spec stessa ammette che non c'e'
> *"no guarantee that a WebMCP tool's declared intent matches its actual behavior"*.
Apple lo chiude cosi': *"la fragilita' si sposta soltanto dal DOM alle descrizioni dei tool"*.

**2. L'obiezione architetturale, che e' la vera.**
> *"An agent acting on a user's behalf is, in effect, **assistive technology**: it should operate a site as the user would, and the site should not single it out for different treatment. WebMCP does the opposite, making 'an agent is driving' an observable fact."*

Da qui il rischio che Apple chiama, con parole sue, il **"screen-reader-blocking problem" applicato agli agenti AI**: una volta che "c'e' un agente" e' un fatto osservabile e indirizzabile separatamente, un sito puo' dare agli agenti capacita' che nega agli umani (penalizzando chi un agente non ce l'ha) — o negarle agli agenti. E la superficie piu' ricca puo' finire all'agente integrato in un motore *"not every engine ships"*.

**3. Privacy: la pipeline personalizzazione → fingerprinting.** Un sito puo' sovra-parametrizzare un tool cosi' che un agente servizievole lo riempia con dati di personalizzazione che l'utente a quel sito non ha mai dato — e Apple nota che
> *"the spec itself calls [it] a 'personalization-to-fingerprinting' pipeline enabling cross-site tracking."*

Piu' in generale: nuovo percorso di invocazione cross-origin la cui interazione con COOP/COEP/site isolation e' *"unexamined"*; nessun modello di consenso o reversibilita' per le azioni conseguenti (`readOnlyHint` e' solo consultivo, `toolautosubmit` invia senza revisione); e le parti che permetterebbero di giudicare — algoritmo di sintesi degli schemi, analisi di sicurezza cross-origin, hook di consenso — sono
> *"each still a 'TODO.'"*

**4. Non e' MCP, e allora e' un'altra cosa che esiste gia'.**
> *"Despite the name, the spec 'does not prescribe the format in which tools are exposed'... So this is not really an MCP binding: it is a general mechanism for a page to register typed, callable functions for an external caller, not limited to forms or even to AI, and that belongs with the platform's existing messaging and capability mechanisms (`postMessage` and similar), not a parallel one."*

**5. Accessibilita': la biforcazione.** La proposta scrive che WebMCP *"is not designed for ingestion by accessibility technology"*. Apple:
> *"the same fork: richer, actionable semantics reach agents while screen-reader and keyboard users get less."*

E aggiunge un dettaglio i18n che nessuno aveva notato: descrizioni di tool e parametri sono lette dalla macchina **e potenzialmente mostrate nella UI dell'agente**, ma *"carry no language or direction"* — nessun `lang`, nessun `dir`.

**6. Il venue e' sbagliato.**
> *"The gaps WebMCP identifies are in HTML and accessibility semantics, stewarded by WHATWG and the W3C ARIA and Accessible Platform Architectures Working Groups; a group chartered around machine learning is not the place to decide how HTML and ARIA should evolve."*

**Il seguito, che dice quanto e' seria l'opposizione.** Il 17 giugno **Marcos Caceres (Apple)** risponde alle contro-domande di Google rifiutando di entrare nel merito punto per punto:
> *"each one asks us to evaluate a part of WebMCP on the assumption that the rest of the approach is sound, and that assumption is what we're opposed to."*

E mette per iscritto tre invarianti che dichiara **non negoziabili**:
> *"An agent acting on a user's behalf is assistive technology. By design, we should not expose to sites that a user is relying on an agent, and we should minimise any such signal. Some users will not, or cannot, use agents, so the result must benefit all users and must not privilege those who have one."*

La contro-proposta e': **accantonare WebMCP**, aprire un nuovo Community Group sugli "agent-assisted user agents", definire prima il problema senza soluzioni, e portare la cosa a un **W3C Workshop attorno a TPAC 2026 (26-30 ottobre, Dublino)**, instradando poi ogni pezzo alla sua casa (HTML → WHATWG, accessibilita' → ARIA/APA). Non e' un "no" tattico: e' un "ricominciamo da capo, altrove".

### 2f. Le ragioni di Mozilla, testuali

**[VERIFICATO]** Commento di **Ben VanderSloot (Mozilla)**, [mozilla/standards-positions#1412](https://github.com/mozilla/standards-positions/issues/1412), 1 giugno 2026. Mozilla riconosce i benefici e poi si ferma.

Il beneficio, ammesso: l'API crea **"corsie dedicate"** per l'interazione automatica, e questo *"reduces the need for web developers to design a single user interface for both automated browsers and humans"*.

Il rischio, in scenario avversariale:
> *"there is a risk that sites will provide tools that do not match the experience of a user on the page... This may be to tar pit automated browsers, provide prompt injection that is invisible to typical users, collect user data from the inputs of the tools, or otherwise manipulate a user's browsing 'agent' in a way that is to the user's disadvantage."*

Ma — ed e' qui che Mozilla si separa da Apple — aggiunge l'onesta ammissione:
> *"it is not clear to what extent they are exacerbated by this API or if they are inherent to LLMs consuming content from and driving a browser."*

Sul nome, la stessa obiezione di Apple ma piu' brutale:
> *"The name is misleading... **There is no MCP here.** ... Something like Website Tool API, or Agent Capability API, would be better."*

Sull'ecosistema, la richiesta concreta che Mozilla mette sul tavolo: oggi l'invocazione dei tool e' di fatto riservata ai prodotti dei produttori di browser e agli agenti in-page; per un ecosistema aperto servono **integrazioni con WebExtensions e WebDriver BiDi**.

La conclusione, testuale:
> *"WebMCP introduces a potentially valuable abstraction for aligning websites and web browsing agents, but it also opens a surface whose real-world dynamics leave too many open questions to wholeheartedly endorse. Given that, I propose we mark this as **neutral** and be willing to come back to revisit it once there is more evidence of how it will be used by sites."*

**Traduzione operativa: "non lo implementiamo, non lo blocchiamo, richiamateci quando qualcuno lo usa davvero."**

### 2g. Che cosa significa per noi, in pratica

- **Copertura reale oggi:** due motori su tre lo spediscono, e **solo in Origin Trial** (Chrome 149, Edge 150) — cioe' dietro registrazione e con scadenza. **Safari: no e per ragioni di principio. Firefox: no.** Su iOS, dove ogni browser e' WebKit, la copertura e' **zero e destinata a restarci** finche' Apple non cambia posizione.
- **L'API su cui scrivere e' `document.modelContext`**, non `navigator.`.
- **Non e' SEO.** WebMCP non fa indicizzare niente e nessun crawler lo legge: e' un'API di *attuazione* in una pagina gia' aperta, non di *scoperta*. Chi lo vende come "SEO per l'AI" sta vendendo un'altra cosa.
- **Il valore vero e' quello di Active Theory ed e' dimostrativo**: 9 tool che fanno "l'AI *usa* il sito", incluso `open_contact_page`. E' una vetrina, e come vetrina funziona anche se l'API cambia nome domani — perche' e' l'unica parte del lavoro che a un cliente si puo' *mostrare*. Ma va scritta sapendo che **e' un esperimento a scadenza**, non un investimento infrastrutturale.

---

## 3. `llms.txt`: chi l'ha proposto, che formato ha, e chi lo legge davvero

### 3a. Origine — e la notizia che cambia il quadro

**[VERIFICATO]** [llmstxt.org](https://llmstxt.org/), letto il 13/08/2026.

| | |
|---|---|
| **Autore** | **Jeremy Howard** (fast.ai / **Answer.AI**) |
| **Pubblicato** | **3 settembre 2024** |
| **Modificato** | **10 agosto 2026** — cioe' **tre giorni fa** |
| **Stato** | Proposta personale su un sito personale. **Nessun W3C, nessun IETF, nessun RFC.** Non e' uno standard: e' una convenzione |

**La notizia:** la pagina ora si intitola **"The /llms.txt file, v2"**. Howard ha riscritto la proposta *"updated based on what I learned from two years of adoption"*. Chi ha studiato llms.txt prima del 10 agosto 2026 ha in mano la v1. Esiste una [pagina Changes](https://llmstxt.org/changes.html) dedicata.

### 3b. Il formato

La **v1** era solo il file. La **v2 sono tre cose**, e le altre due sono piu' interessanti del file.

**1) Il file `/llms.txt`** — markdown, in ordine fisso:

| Elemento | Obbligatorio |
|---|---|
| BOM | opzionale |
| **`# H1`** — nome del progetto/sito | **l'unica parte obbligatoria** |
| `> blockquote` — sintesi breve | no |
| sezioni markdown libere | no (zero o piu') |
| **sezioni `## H2`** con liste `- [nome](url): nota` | no (zero o piu') |

Convenzione: una sezione chiamata `## Optional` raccoglie *"secondary information: links an agent can skip when a shorter context is needed"*.

Novita' v2: **il file non deve stare per forza in root**. Puo' stare a qualsiasi path e copre le pagine sotto quel path — `/docs/llms.txt` copre tutto `/docs/`.

**2) Il gemello markdown di ogni pagina.** La v2 propone che ogni pagina utile a un agente sia servita anche in markdown pulito **allo stesso URL**, con `.md` aggiunto (`page.html.md`) o sostituito (`page.md`); per gli URL senza nome file, `index.md`.

**3) Le link relation — la parte che ci riguarda direttamente.** Testuale dalla spec:
```
Link: </docs/page.html.md>; rel="alternate"; type="text/markdown", </docs/llms.txt>; rel="describedby"
```
- `rel="alternate" type="text/markdown"` → punta alla versione markdown della pagina;
- `rel="describedby"` → punta all'llms.txt che la descrive.

Entrambe si possono dare come `<link>` in HTML **o come header HTTP** — e la spec nota che la forma header *"can be added in web server or CDN configuration without modifying any pages"*.

**Nota che chiude un cerchio con la sezione 1a: basement.studio faceva gia' esattamente questo, prima che la spec lo scrivesse.** **[VERIFICATO]** 13/08/2026: `curl -I https://basement.studio/` → `Link: </index.md>; rel="alternate"; type="text/markdown"`. Il loro pattern `.md` + header `Link` + content negotiation e' precisamente la v2 di llms.txt, arrivata con mesi di anticipo. **Manca loro un solo pezzo:** il `rel="describedby"` verso `/llms.txt`, che nei loro header non c'e'. E' una riga di configurazione CDN. Se copiamo il modello basement, copiamolo **con** quel pezzo.

**`llms-full.txt` non esiste nella spec.** Non e' mai stato standardizzato: e' una prassi nata dai generatori automatici (Mintlify e simili). Coerentemente, basement.studio non ce l'ha (404).

### 3c. Chi lo legge davvero — la domanda vera

Qui bisogna separare tre cose che vengono continuamente confuse: **chi lo pubblica**, **chi lo controlla**, **chi lo legge per decidere qualcosa**.

#### Google Search: NO, e lo dice esplicitamente

**[DICHIARATO — da Google]** **John Mueller**, Google, nell'episodio **111 di *Search Off the Record*** (giugno 2026), riportato da [Search Engine Journal](https://www.searchenginejournal.com/google-exposes-llms-txt-flaw/579814/):
> *"the idea was really not to create something that makes it easier for search engines or LLM systems to discover all of your content"*

> *"It's basically you're telling these systems, like, I have the best website ever. And here are all of the pages that everyone must go to. And you must buy all of my products or whatever you put in there. So in LLM system, it basically, by design, can't trust what is here as a way of differentiating between different websites."*

> *"optimizing as a way of being discovered, that doesn't make sense"*

Il difetto strutturale che descrive: **e' contenuto auto-dichiarato dal proprietario**, quindi non differenzia, perche' tutti diranno di essere i migliori. E' l'argomento con cui e' morto il meta keywords.

E, prima ancora, il dato empirico che Mueller ha messo per iscritto:
> *"none of the AI services have said they're using LLMs.TXT (and you can tell when you look at your server logs that they don't even check for it)"*

**[VERIFICATO]** — e coerente: `developers.google.com/llms.txt` → **404**; `ai.google.dev/llms.txt` → **404**; `blog.google/llms.txt` → **404**. La documentazione ufficiale dei crawler Google ([google-common-crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers), [overview-google-crawlers](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)) contiene la stringa `llms.txt` **zero volte**.

#### OpenAI, Anthropic, Perplexity: lo **pubblicano**, non risulta che lo **leggano**

**[VERIFICATO]** 13/08/2026, `curl` diretto:

| Sito | `/llms.txt` | Peso |
|---|---|---|
| `developers.openai.com` | **200** `text/plain` | 5.853 B |
| `docs.anthropic.com` / `docs.claude.com` | **200** `text/plain` | 57.481 B |
| `docs.perplexity.ai` | **200** `text/plain` | 42.523 B |
| `ai.google.dev/gemini-api/docs/` | **200** `text/markdown` | 27.957 B |
| `platform.openai.com` | 404 | — |
| `www.anthropic.com` (sito, non docs) | 404 | — |

Su tutti e quattro **e' documentazione per sviluppatori**, non il sito aziendale. Perplexity arriva a mettere un banner in cima ai docs: *"For AI agents: see the complete llms.txt documentation index."* OpenAI in fondo a ogni pagina docs: *"For the complete documentation index, see llms.txt. Markdown versions of documentation pages are available by appending .md to the page URL."*

**Ma questo li rende publisher, non consumer.** La prova sta nella loro documentazione dei crawler. **[VERIFICATO]** conteggio delle occorrenze nel sorgente:

| Pagina | `robots.txt` | `llms.txt` |
|---|---|---|
| [platform.openai.com/docs/bots](https://platform.openai.com/docs/bots) | **11** | 1 — ed e' il footer del loro indice docs, non una regola di crawling |
| [docs.perplexity.ai/guides/bots](https://docs.perplexity.ai/guides/bots) | **3** | 2 — ed e' il banner Mintlify della pagina |
| [Anthropic, "Does Anthropic crawl data from the web?"](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web) | — | **0** |

**Nessuno dei tre documenta che il proprio crawler legga `llms.txt` di terzi.** Il meccanismo che tutti e tre documentano e' `robots.txt`. E l'analisi di Ahrefs citata da [PPC Land](https://ppc.land/llms-txt-adoption-stalls-as-major-ai-platforms-ignore-proposed-standard/) e' netta: *"no major LLM provider currently supports llms.txt. Not OpenAI. Not Anthropic. Not Google."*

#### L'unico consumer verificato al mondo e' un linter di Google — e non lo legge, lo conta

**[VERIFICATO]** 13/08/2026 dal repo `GoogleChrome/lighthouse` e dai docs Chrome. Questa e' la novita' vera del 2026, e va capita bene perche' e' facilissimo venderla per quello che non e'.

Lighthouse ha una **nuova categoria "Agentic Browsing"** con un audit dedicato a `llms.txt`:

| Evento | Data | Riferimento |
|---|---|---|
| `core(config): implement llms.txt check for AI agents` | **merged 20/04/2026** | [PR #16970](https://github.com/GoogleChrome/lighthouse/pull/16970) |
| `core(config): update llms.txt to refine validation logic` | 27/04/2026 | [PR #16986](https://github.com/GoogleChrome/lighthouse/pull/16986) |
| `core(llms-txt): allow leading BOM` | 04/06/2026 | [PR #17055](https://github.com/GoogleChrome/lighthouse/pull/17055) |
| Audit girato in produzione su PageSpeed Insights | 18/06/2026 | [issue #17082](https://github.com/GoogleChrome/lighthouse/issues/17082) — con log CDN che provano il fetch da IP Google |

Documentazione ufficiale: [developer.chrome.com/docs/lighthouse/agentic-browsing/llms-txt](https://developer.chrome.com/docs/lighthouse/agentic-browsing/llms-txt).

**E qui la parte che smonta l'entusiasmo.** Google definisce `llms.txt`
> *"an emerging convention used to provide a machine-readable summary of a website's content, specifically designed for LLMs and AI agents"*

— **"emerging convention"**, non standard — e stabilisce che
> *"If the file is not provided by the server (resulting in a 404), the audit is marked as Not Applicable (N/A), as providing the file is optional at the moment."*

Quindi: **non averlo non e' una penalizzazione, e' un N/A.** L'audit fallisce solo su **errore del server**. E in nessun punto Google afferma che un proprio sistema AI lo legga: il beneficio dichiarato e' condizionale — *"Without this file, agents may spend more time crawling the site"*.

**La sintesi onesta: Lighthouse verifica che il file esista e sia ben formato. Non e' un lettore, e' un controllo ortografico.** Un audit che dice "il file c'e'" non e' la prova che qualcuno lo usi per decidere qualcosa.

### 3d. Verdetto su llms.txt

**Non e' ancora una moda del tutto senza adozione, ma e' molto piu' vicina a quello che a uno standard.**

- **Nessun grande motore o LLM ha mai dichiarato di leggerlo.** Google lo nega esplicitamente, per Search. OpenAI, Anthropic e Perplexity non lo documentano fra i meccanismi che rispettano.
- **Chi lo pubblica sono soprattutto siti di documentazione tecnica** — inclusi i lab AI stessi, per i propri docs — dove il consumatore reale non e' il motore di ricerca ma **l'agente di coding** dell'utente, che lo fetcha durante una sessione. E' un caso d'uso vero, ma e' *quello*, non la SEO.
- Il dato della sezione 1c regge: **3 studi creativi su 14** (~21%). Emergente e minoritario.
- Costa 2 KB e mezz'ora. **Non fa male e nella fascia alta e' un segnale di posizionamento** — come mettere in vetrina che si sa cos'e'.

**Quello che non si puo' fare e' venderlo come SEO.** Se un fornitore mette `llms.txt` in preventivo come voce che "fa trovare il sito dalle AI", sta vendendo una cosa che il produttore piu' importante ha pubblicamente smentito. La formula onesta e': *lo mettiamo perche' costa niente e perche' se domani qualcuno inizia a leggerlo siamo gia' pronti; oggi non porta traffico e nessuno ci ha detto il contrario.*

**La parte della v2 che vale davvero i soldi non e' il file: sono i gemelli `.md` e gli header `Link`.** Quelli non richiedono che qualcuno "adotti llms.txt": sono meccanismi HTTP standard (content negotiation, `rel="alternate"`) che **qualunque** fetcher puo' sfruttare senza sapere niente della convenzione. E' esattamente la ragione per cui l'implementazione di basement.studio funziona anche in un mondo in cui llms.txt non decolla.

---

## 4. Cosa vede davvero Google di un sito dentro un canvas

Qui c'e' una dichiarazione ufficiale che risolve la questione, e quasi nessuno la cita.

### 4a. Google dichiara per iscritto che Googlebot non supporta WebGL

**[VERIFICATO]** 13/08/2026, dalla documentazione ufficiale Google Search Central, pagina [*Fix search-related JavaScript problems*](https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript). Testuale:

> *"Ensure that your application uses feature detection for all critical APIs that it needs and provide a fallback behavior or polyfill where applicable. Some web features may not yet be adopted by all user agents and some may intentionally disable certain features. **For example, if you use WebGL to render photo effects in the browser, feature detection shows that Googlebot doesn't support WebGL.** To fix this, you could skip the photo effect or decide to use server-side rendering to prerender the photo effects, which makes your content accessible to everyone, including Googlebot."*

**Questa e' la frase piu' importante di tutta la ricerca.** Non e' un blog, non e' un'inferenza: e' Google che scrive nella propria documentazione che **il suo renderer non esegue WebGL**.

Conseguenza diretta e non aggirabile: **tutto cio' che esiste soltanto come pixel disegnati da WebGL non esiste per Google.** Non "e' penalizzato": **non c'e'**. Se il titolo, il nome dei progetti o i contatti sono geometria in una scena Three.js, per Googlebot quella scena non e' nemmeno stata disegnata — il contesto WebGL non parte proprio.

**Nota tecnica onesta:** questo riguarda **WebGL** (`<canvas>` con contesto `webgl`/`webgl2`, quindi Three.js, R3F, gli shader — il 95% dei siti di cui parliamo). Il **canvas 2D** e' un discorso diverso: gira in un headless Chrome e i pixel vengono disegnati. Ma non cambia nulla di pratico, per la ragione del punto seguente.

### 4b. Anche se i pixel ci fossero, non diventerebbero ne' testo ne' immagine

**[VERIFICATO]** dalla [documentazione Google Images](https://developers.google.com/search/docs/appearance/google-images) (ultimo aggiornamento dichiarato: 02/03/2026):
> *"Google can find images in `src` attribute of `<img>` element... **Google doesn't index CSS images.**"*

E i formati supportati sono quelli referenziati **nell'attributo `src` di un `<img>`**: BMP, GIF, JPEG, PNG, WebP, SVG, AVIF.

**[INFERENZA DOCUMENTATA — non una dichiarazione esplicita]** Un `<canvas>` non e' un `<img src>` e non e' nemmeno una CSS image: e' un bitmap che vive solo nella memoria del browser, **senza URL**. Se Google dichiara di non indicizzare nemmeno le immagini CSS — che almeno *hanno* un URL — un bitmap senza URL non ha alcun percorso per entrare nell'indice immagini. **Non esiste alcuna dichiarazione di Google secondo cui il contenuto di un canvas venga sottoposto a OCR o indicizzato in qualunque forma.** Chi sostiene il contrario deve produrre la fonte; noi non l'abbiamo trovata.

### 4c. Cosa dice la specifica HTML: il canvas *deve* avere un contenuto alternativo

**[VERIFICATO]** [WHATWG HTML Standard, §4.12.5 The canvas element](https://html.spec.whatwg.org/multipage/canvas.html). Due passaggi normativi:

> *"Authors should not use the `canvas` element in a document when a more suitable element is available. For example, **it is inappropriate to use a `canvas` element to render a page heading**: if the desired presentation of the heading is graphically intense, it should be marked up using appropriate elements (typically `h1`) and then styled using CSS..."*

> *"When authors use the `canvas` element, **they must also provide content that, when presented to the user, conveys essentially the same function or purpose as the canvas's bitmap.** This content may be placed as content of the `canvas` element. The contents of the `canvas` element, if any, are the element's **fallback content**."*

E la regola di sostituzione:
> *"In non-visual media, and in visual media if scripting is disabled for the `canvas` element or if support for `canvas` elements has been disabled, the `canvas` element **represents its fallback content** instead."*

**Cioe': il "gemello testuale" non e' un trucco SEO inventato dalle agenzie. E' un obbligo della specifica HTML** (`must`), che nessuno rispetta. Un canvas senza fallback content e' HTML non conforme prima ancora di essere un problema di indicizzazione. Questo cambia il registro della conversazione col cliente: non stiamo proponendo un extra, stiamo proponendo di rispettare lo standard.

### 4d. Cosa dice Google del modello dati degli **agenti** (non dei crawler)

**[VERIFICATO]** [developer.chrome.com/docs/lighthouse/agentic-browsing](https://developer.chrome.com/docs/lighthouse/agentic-browsing), categoria *Agentic Browsing*:
> *"**Agents rely on the accessibility tree as their primary data model.**"*

> *"Semantic HTML and proper ARIA labeling... are the '**machine-eye view**' of your page."*

Il punto e' che **crawler e agenti guardano due cose diverse, e il canvas le manca entrambe**: il crawler non esegue WebGL e non ha testo; l'agente legge l'albero di accessibilita', e un `<canvas>` senza fallback content contribuisce all'albero **un nodo e basta** — nessun testo, nessun ruolo, nessuna azione. La scena piu' bella del mondo, per l'albero di accessibilita', e' un rettangolo grigio.

E' anche il motivo per cui la soluzione `GLA11y` di Active Theory (sezione 1b) e' concettualmente giusta anche se la loro esecuzione lato server e' sbagliata: costruisce esattamente l'albero che l'agente legge, dalla stessa sorgente della geometria.

### 4e. L'esperimento: cosa ottiene davvero un fetcher AI senza JavaScript

**[VERIFICATO]** 13/08/2026. Ho posto la **stessa domanda** ("cosa fa questo studio, dove ha sede, che progetti ha, come si contatta — rispondi solo da cio' che hai ricevuto") a un fetcher che converte la pagina in testo **senza eseguire JavaScript** — cioe' la condizione in cui si trova qualunque crawler AI che non renderizzi. Tre siti, tutti e tre pieni di WebGL:

| Sito | Cosa ha ottenuto |
|---|---|
| **lusion.co** (3 `<canvas>` nell'HTML del server) | **Tutto.** 9 capability elencate, **10 progetti nominati** (Porsche Dream Machine, Devin AI, Meta Spatial Fusion, Synthetic Human...), sede **Bristol, UK**, due email (`hello@`, `business@`), i social, il link a `labs.lusion.co` |
| **basement.studio** | **Tutto.** Posizionamento, sede **Mar del Plata**, 4 aree di servizio dettagliate, **10 clienti nominati** (Vercel, Linear, Cursor, ElevenLabs, MrBeast...), 4 progetti descritti, i premi, persino il typeface Geist |
| **activetheory.net** | **Niente.** Risposta testuale: *"the page content I received consists only of a header with the company name and a brief tagline. No additional details regarding locations, past work, or contact information were included."* Sedi: nessuna. Progetti: nessuno. Email: nessuna |

**Questo e' l'esperimento che vale mille discussioni.** Tre siti WebGL della stessa fascia. Lusion e' probabilmente il piu' spinto graficamente dei tre, e **ha tre `<canvas>` gia' nell'HTML del server** — eppure un fetcher senza JS ne ricava un brief commerciale completo. Active Theory, con **zero canvas nell'HTML**, non da' niente.

> **Il canvas non ha alcuna correlazione con l'invisibilita'.** La variabile che decide e' una sola: **cosa c'e' nel documento HTML che parte dal server.**

### 4f. Gli altri limiti del renderer di Google, che sui siti immersivi mordono

**[VERIFICATO]** stessa pagina ufficiale Google. Riguardano proprio i siti che facciamo noi:

- **Nessuno stato tra un caricamento e l'altro.** *"WRS does not retain state across page loads: Local Storage and Session Storage data are cleared across page loads. HTTP Cookies are cleared across page loads."* → un sito che tiene "ho gia' visto l'intro" in `localStorage`, per Googlebot **rifa' sempre l'intro**, ogni volta, su ogni pagina.
- **Cache aggressiva che ignora gli header.** *"Googlebot caches aggressively... **WRS may ignore caching headers.** This may lead WRS to use outdated JavaScript or CSS resources."* → rimedio dichiarato: **content fingerprinting** nel nome file (`main.2bb85551.js`). Con i bundler moderni e' gratis, ma va verificato che sia attivo.
- **Solo HTTP.** *"It does not support other types of connections, such as WebSockets or WebRTC."* → contenuto che arriva via WebSocket, per Google non arriva.

---

## 5. Le contromisure: quali funzionano e quali sono leggende

### 5a. Le sette che funzionano davvero

**1. Rendering lato server del contenuto testuale, con il canvas sopra.** [VERIFICATO — e' la raccomandazione di Google stesso]
E' la contromisura, le altre sei sono contorno. Google la scrive nella pagina in cui ammette il limite WebGL: *"decide to use server-side rendering to prerender... which makes your content accessible to everyone, including Googlebot"*. Prova sul campo: 4 siti WebGL premiati su 5 lo fanno (sezione 1d), e l'esperimento della 4e mostra che funziona anche con **tre `<canvas>` nell'HTML** (lusion). Costo: zero, se si sceglie il framework giusto all'inizio. Costo se lo si aggiunge dopo su una SPA: rifacimento.

**2. Testo reale nel DOM, nascosto visivamente — e Google lo autorizza esplicitamente.** [VERIFICATO]
E' il timore numero uno di chi fa questi siti ("mi prendono per spam"). Le [spam policies di Google](https://developers.google.com/search/docs/essentials/spam-policies) elencano gli elementi che **non** violano le regole, e uno e' testuale:
> *"Text that's only accessible to screen readers and is intended to improve the experience for those using screen readers"*

Cioe' **la tecnica `GLA11y` di Active Theory e' legittima per iscritto**. Ma attenzione al confine, che sta nella definizione stessa di abuso: e' hidden text quando il contenuto e' messo *"solely to manipulate search engines and not to be easily viewable by human visitors"*, e fra gli esempi c'e' *"Using CSS to position text off-screen"*. **La differenza e' se lo specchio dice davvero cio' che la scena mostra.** Finche' lo specchio *e'* la scena — una sola sorgente, come nel `getText(text3d)` di Active Theory — si sta dalla parte giusta. Un blocco di testo scollegato, ottimizzato a mano, e' l'altra cosa.

**3. Il gemello markdown con header `Link` e content negotiation.** [VERIFICATO]
`/pagina.md` + `Link: </pagina.md>; rel="alternate"; type="text/markdown"` + risposta a `Accept: text/markdown` sull'URL canonico. Funziona **indipendentemente** dal destino di llms.txt, perche' sono meccanismi HTTP standard che qualunque fetcher puo' usare senza conoscere nessuna convenzione. E' ora anche la raccomandazione formale della spec llms.txt v2 (sezione 3b). Aggiungere il `rel="describedby"` verso `/llms.txt`, che a basement manca.

**4. Le basi noiose che Active Theory sbaglia tutte.** [VERIFICATO]
`<title>` e `<meta description>` **diversi per pagina**; **404 veri** per gli URL inesistenti; **sitemap.xml** reale; URL gestiti con la **History API** — Google lo scrive: *"URL fragments... you can't rely on URL fragments to work with Googlebot. We recommend using the History API"*. Non e' SEO avanzata: e' la differenza tra un sito e un'unica pagina replicata.

**5. Dati strutturati JSON-LD.** [VERIFICATO sul campo]
`Organization`, `WebSite`, `ProfessionalService` con `hasOfferCatalog`, `knowsAbout`, `areaServed`. Tre blocchi in basement.studio, zero in Active Theory. E' il canale che non passa dal rendering: e' testo nel documento, e per una agenzia locale (area servita, servizi, contatti) e' il piu' diretto.

**6. `robots.txt` — il solo meccanismo che i vendor AI documentano davvero.** [VERIFICATO]
OpenAI cita `robots.txt` 11 volte nella pagina dei suoi bot, Perplexity 3; `llms.txt` zero volte come regola. Quindi: allowlist esplicita e in positivo dei bot che vogliamo (`GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-User`, `Claude-SearchBot`, `PerplexityBot`, `Google-Extended`), piu' `Sitemap`. Costo: dieci minuti.

**7. Content fingerprinting nei nomi dei bundle.** [VERIFICATO]
Perche' *"WRS may ignore caching headers"* e puo' servire JS vecchio. `main.2bb85551.js`. Con Vite/Next e' gia' cosi' di default — ma va verificato, non dato per scontato.

### 5b. Le otto leggende

| # | La leggenda | Cosa dice la prova |
|---|---|---|
| 1 | **"`llms.txt` fa trovare il sito dalle AI"** | **Falso.** Nessun grande ha mai dichiarato di leggerlo; Google lo nega esplicitamente (*"optimizing as a way of being discovered, that doesn't make sense"*) e Mueller dice che nei log **non lo chiedono nemmeno**. Va messo perche' costa niente, non venduto perche' porta traffico (sez. 3c) |
| 2 | **"Google non esegue JavaScript"** | **Falso e dannoso**, perche' fa cercare la soluzione dove non serve. Google renderizza. Il problema e' **specificamente WebGL** — che Googlebot dichiara di non supportare — e un `<body>` vuoto. Sono due cose diverse e hanno rimedi diversi |
| 3 | **"Google fa OCR del canvas / prima o poi lo leggera'"** | **Nessuna prova, nessuna dichiarazione.** Google non indicizza nemmeno le immagini CSS, che almeno hanno un URL. Un bitmap di canvas non ha URL. Chi lo afferma produca la fonte |
| 4 | **"Basta il `<noscript>`"** | **No.** Il `<noscript>` non e' cio' che la spec HTML chiede (che chiede il **fallback content dentro il `<canvas>`**), e soprattutto e' un duplicato mantenuto a mano che diverge dal sito in tre settimane. E non risolve il problema vero, che e' l'assenza di contenuto per pagina |
| 5 | **"Facciamo il prerender solo per i bot" (dynamic rendering)** | **Sconsigliato da Google per iscritto:** *"Dynamic rendering **was** a workaround and **not** a long-term solution... Instead, we recommend that you use server-side rendering, static rendering, or hydration."* Inoltre e' costoso e fragile |
| 6 | **"Serviamo una versione diversa ai bot"** | **Rischio cloaking.** Le spam policies definiscono cloaking *"inserting text or keywords into a page only when the user agent that is requesting the page is a search engine, not a human visitor"*. Il modello corretto e' quello di basement: **stessi identici byte a tutti** (verificato: 222.978 B sia al browser sia a `GPTBot`), e la versione testuale a un **URL proprio, pubblico e accessibile a chiunque** |
| 7 | **"WebMCP mi fa indicizzare dalle AI"** | **No: WebMCP non e' scoperta, e' attuazione.** Serve a far *usare* una pagina gia' aperta, non a farla trovare. Nessun crawler lo legge. E oggi vive solo in Origin Trial su due motori, con Safari contrario per principio (sez. 2) |
| 8 | **"Passiamo l'audit Agentic Browsing di Lighthouse e siamo a posto"** | **E' un linter, non un pubblico.** L'audit `llms.txt` da' **N/A** se il file manca (*"providing the file is optional at the moment"*) e fallisce solo su errore server. Verifica la forma, non produce visibilita' |

### 5c. Due avvertenze da tenere per se'

- **[NON VERIFICATO]** Non esiste un tempo massimo pubblicato entro cui Googlebot deve vedere la pagina renderizzata. Chi cita "5 secondi" o simili sta ripetendo una cifra senza fonte. Detto questo, un preloader che tiene il contenuto ostaggio per venti secondi e' un rischio **non misurabile** — ed e' un'ottima ragione per non far dipendere il contenuto dal preloader in primo luogo.
- **[NON VERIFICATO]** Non abbiamo trovato conferma che Google indicizzi il **fallback content dentro `<canvas>`**. Va messo lo stesso, perche' la spec lo impone e perche' serve all'albero di accessibilita' — ma **non ci si appoggia sopra la strategia**. Il contenuto che deve essere trovato sta nel DOM normale, servito dal server.

---

## 6. La risposta da dare al cliente

**La domanda:** *"Se e' tutto dentro un canvas, mi trova Google?"*

**La risposta, cinque righe:**

> Il canvas non c'entra: Google indicizza il testo che gli arriva **dal server**, e il canvas ci convive nella stessa pagina — Lusion ne ha tre nell'HTML e resta leggibile per intero.
> Quello che Google davvero **non** sa fare e' WebGL: lo scrive nella propria documentazione, quindi **cio' che esiste solo come pixel disegnati non esiste**, e la specifica HTML impone gia' oggi di dargli un'alternativa testuale.
> Quindi il suo sito lo costruiamo come due strati sovrapposti: **sotto il contenuto vero in HTML** — titoli, progetti, servizi, contatti, dati strutturati — e **sopra l'esperienza**, che e' cio' che il visitatore vede e ricorda.
> I limiti veri sono tre e glieli dico prima: **non le indicizzeremo mai l'animazione in se'**, la parte che si trova sara' il testo; **le pagine devono essere pagine vere** (URL, titolo e contenuto propri, non un'unica schermata); e se domani vorra' cambiare la scena, va aggiornato anche il testo, per questo lo generiamo **da un'unica sorgente** invece di scriverlo due volte.
> Sulle AI le dico l'unica cosa onesta: **nessuno ha promesso niente** — `llms.txt` lo mettiamo perche' costa mezz'ora, non perche' porti traffico — ma un sito che serve testo pulito dal server viene letto **oggi** da ChatGPT, Claude e Perplexity esattamente come da Google, e questo l'abbiamo misurato.

### 6a. Se il cliente insiste: "ma il concorrente ha fatto tutto in WebGL e va benissimo"

Tre domande, in quest'ordine:
1. **"Va benissimo *dove*?"** Un sito puo' vincere premi e non essere trovato: sono due mercati diversi. Active Theory ha 126 FWA e 69 Awwwards, e un fetcher senza JavaScript **non riesce a dire nemmeno dove ha gli uffici**.
2. **"Da dove le arrivano i clienti?"** Se arrivano da passaparola, referral e premi, l'indicizzazione conta poco e si puo' decidere di sacrificarla — **consapevolmente**. Se arrivano da ricerca, la domanda si e' gia' risposta.
3. **"E se le costasse zero averle tutte e due?"** Perche' e' questo il punto: lusion.co, locomotive.ca, 14islands.com e basement.studio non hanno rinunciato a niente. **La rinuncia non e' il prezzo del canvas, e' il prezzo di una scelta architetturale che si puo' semplicemente non fare.**

### 6b. Le tre righe da mettere in preventivo

- **Contenuto servito dal server** (SSR/SSG), canvas sopra — *incluso, non e' un extra: e' l'architettura*.
- **Specchio testuale a sorgente unica** per la scena 3D, piu' dati strutturati, sitemap, 404 reali, `robots.txt` con allowlist AI.
- **Gemelli markdown + header `Link` + `llms.txt`** — *mezza giornata, con la nota esplicita che oggi nessun grande motore dichiara di leggere `llms.txt`: lo facciamo perche' costa poco ed e' un segnale di livello, non perche' porti traffico*.

---

## 7. Fonti primarie citate

**WebMCP / `document.modelContext`**
- Specifica: https://webmachinelearning.github.io/webmcp/
- Explainer/README: https://github.com/webmachinelearning/webmcp/blob/main/README.md
- Stato implementazioni: https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md
- PR #177, spostamento a `Document`: https://github.com/webmachinelearning/webmcp/pull/177
- **Apple / WebKit — `position: oppose`**: https://github.com/WebKit/standards-positions/issues/670
- **Mozilla — `position: neutral`**: https://github.com/mozilla/standards-positions/issues/1412
- W3C TAG design review (aperta, `Missing: Multi-stakeholder support`): https://github.com/w3ctag/design-reviews/issues/1238
- Chrome Platform Status: https://chromestatus.com/feature/5117755740913664
- Origin Trial Chrome: https://developer.chrome.com/blog/ai-webmcp-origin-trial

**llms.txt**
- Spec v2 (Jeremy Howard, Answer.AI — mod. 10/08/2026): https://llmstxt.org/ · changes: https://llmstxt.org/changes.html
- Audit Lighthouse: https://developer.chrome.com/docs/lighthouse/agentic-browsing/llms-txt
- PR di implementazione: https://github.com/GoogleChrome/lighthouse/pull/16970
- Categoria Agentic Browsing: https://developer.chrome.com/docs/lighthouse/agentic-browsing
- Dichiarazioni Mueller (Search Off the Record ep. 111): https://www.searchenginejournal.com/google-exposes-llms-txt-flaw/579814/ · https://www.searchenginejournal.com/googles-mueller-says-llms-txt-cant-help-llms-differentiate-sites/579304/
- Rassegna non-adozione: https://ppc.land/llms-txt-adoption-stalls-as-major-ai-platforms-ignore-proposed-standard/
- Doc crawler dei vendor: https://platform.openai.com/docs/bots · https://docs.perplexity.ai/guides/bots · https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web

**Canvas, WebGL e Google**
- **"Googlebot doesn't support WebGL"**: https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript
- Basi JavaScript SEO: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Google Images (niente immagini CSS): https://developers.google.com/search/docs/appearance/google-images
- Spam policies (hidden text, cloaking, eccezione screen reader): https://developers.google.com/search/docs/essentials/spam-policies
- Dynamic rendering deprecato: https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering
- WHATWG HTML, elemento `canvas` e fallback content: https://html.spec.whatwg.org/multipage/canvas.html
