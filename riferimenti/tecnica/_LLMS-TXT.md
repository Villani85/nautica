# llms.txt — lo pubblicano tutti, non lo legge nessuno

Dossier al 13/08/2026. Fonti primarie lette direttamente; le citazioni di
seconda mano sono marcate come tali.

## In una riga
**Formato ben progettato, adozione reale lato pubblicazione, adozione lato
lettura sostanzialmente nulla.** I due fatti convivono.

## Le prove, da quattro studi indipendenti con metodi diversi

**Ahrefs, 15/06/2026** — 137.210 domini, log di maggio 2026, con verifica che
il file fosse markdown vero e non un soft-404:
- 28% dei domini pubblica un `llms.txt` valido;
- **il 97% di quei file ha ricevuto ZERO richieste nel mese**;
- del 3% che riceve traffico: strumenti di audit SEO 21,7%, bot non
  identificati 14,9%, crawler generici 13,1%, profilazione tecnica 11,6%,
  agenti AI 10,5%, crawler di addestramento 5,3%, **bot di recupero AI
  (Perplexity, OAI-Search) 1,1%**;
- conclusione testuale: *«an llms.txt file is largely decoration»*.

**Seekio, 14/04/2026** — 900 domini, 191 giorni, ~45 milioni di richieste di bot
AI: solo **1.227** hanno toccato `llms.txt`, e i richiedenti erano Dataprovider
(794), Chrome (392), crawler di audit. *«Fra i richiedenti non c'era un solo
vero bot AI.»*

**SE Ranking, 07/11/2025** — 300.000 domini: **nessuna correlazione** fra
`llms.txt` e citazioni AI. Togliendo la variabile dal modello, **le predizioni
migliorano** — cioe' aggiunge rumore.

**Search Engine Land, 20/01/2026** — 10 siti, 90 giorni prima/dopo: 8 nessun
cambiamento, 2 in crescita per altre cause, 1 in calo del 19,7%.

## Cosa dicono i produttori

- **OpenAI, Anthropic, Perplexity**: le documentazioni dei loro crawler —
  aggiornate di recente — parlano **solo di robots.txt**. Zero menzioni di
  `llms.txt` come file che leggono. Lo **pubblicano** per le proprie doc, ma
  non dichiarano di leggerlo.
- **Google Search**, doc ufficiale (agg. 10/12/2025): *«You don't need to
  create new machine readable files, AI text files, or markup»*.
- **John Mueller, 17/04/2025**: *«none of the AI services have said they're
  using LLMs.TXT (and you can tell when you look at your server logs that they
  don't even check for it). To me, it's comparable to the keywords meta tag»*.
- **MA Google si contraddice**: Chrome/Lighthouse 13.3 ha aggiunto un **audit
  `llms.txt`** nella categoria "agentic browsing" (agg. 05/05/2026), che ne
  raccomanda esplicitamente la creazione. Search dice no, Chrome dice si'.

**Attenzione all'igiene delle fonti.** Due "citazioni" che tutti danno per
assodate sono di seconda o terza mano: quella attribuita a Gary Illyes passa da
un post LinkedIn che riferiva un intervento dal palco (nessuna trascrizione
ufficiale), e l'aneddoto «OpenAI scarica llms.txt ogni 15 minuti» e' uno
screenshot su X mai verificato ne' replicato. Decine di blog SEO riciclano gli
stessi tre numeri senza citarne l'origine.

## Due cose operative

**1. La specifica v2 e' di tre giorni fa (10/08/2026).** Chiunque generi oggi un
`llms.txt` seguendo una guida trovata in rete sta implementando la v1. Le due
aggiunte da recuperare:
- **link relations**: `rel="alternate" type="text/markdown"` per la versione
  markdown della pagina, `rel="describedby"` per il file che la copre. Anche
  via header HTTP: `Link: </docs/page.md>; rel="alternate";
  type="text/markdown"`;
- `page.md` ora e' ammesso accanto a `page.html.md`.

**2. `llms-full.txt` NON esiste nella specifica**, ne' in v1 ne' in v2
(verificato con grep su entrambe). E' una convenzione di Mintlify. Tutti i blog
che la presentano come parte dello standard sbagliano.

## Il verdetto, e cosa farne

Costa **quindici minuti** e il rischio e' vicino a zero: ecco perche' lo
pubblicano tutti pur sapendo che non lo legge nessuno.

Ma **non e' la risposta al problema dei siti a canvas.** Se il contenuto non
esiste in HTML, `llms.txt` non lo crea: e' un indice, non un sostituto. La cosa
che funziona davvero e' quella di Basement — **un gemello testuale vero**, con
ogni pagina servita anche in markdown — e funziona perche' e' contenuto
raggiungibile, non perche' c'e' un file di indice.

Tre distinzioni da tenere, che quasi tutte le stroncature confondono:
1. **Google Search e Chrome non sono la stessa cosa.** Se gli agenti che
   navigano al posto dell'utente diventano il canale dominante, quell'audit
   conta.
2. **La crescita e' reale**: da 4.088 file a giugno 2025 a 36.120 a luglio 2026
   su tre milioni di siti (8,8x), e 5,4x sul primo diecimila. Misure
   indipendenti fra loro.
3. **Il caso "documentazione tecnica" e' diverso dal caso SEO.** Un agente di
   programmazione scarica quel file perche' **l'utente gli passa l'indirizzo**,
   non perche' lo scopre da solo. La v2 rivendica che «coding agents use them
   reliably», ma senza dati pubblici a supporto.
