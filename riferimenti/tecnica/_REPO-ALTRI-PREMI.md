# Repository pubblici di siti PREMIATI (non Awwwards)

Caccia al codice sorgente pubblico di siti che hanno **vinto** un premio:
FWA, CSS Design Awards, Webby Awards, One Show, D&AD, Cannes Lions (digitale), SiteInspire.
Il perimetro Awwwards e' coperto da un altro documento.

---

## LA REGOLA, prima di tutto

> **SENZA LICENZA SI STUDIA, NON SI COPIA.**

Un repository pubblico su GitHub **non** e' codice libero. Se non c'e' un file
LICENSE, il codice resta protetto dal diritto d'autore dell'autore: puoi
leggerlo, capirlo, imparare la tecnica e riscriverla con parole tue. Non puoi
incollarlo in un progetto di un cliente.

| Marcatura | Cosa vuol dire | Cosa puoi fare |
|---|---|---|
| **MIT** / **Apache-2.0** / **BSD** / **ISC** / **Unlicense** / **CC0** | licenza permissiva vera | USABILE: copia, modifica, vendi. Mantieni l'avviso di copyright. |
| **MPL-2.0** | permissiva ma con copyleft di file | USABILE con attenzione: i file modificati restano MPL. |
| **GPL-3.0** / **AGPL-3.0** | copyleft forte | PERICOLOSO sul lavoro cliente: contamina il progetto. Studia e basta. |
| **OFL-1.1** | licenza per caratteri tipografici | USABILE per i font, con le sue regole. |
| **NOASSERTION** | c'e' un file di licenza ma GitHub non lo riconosce | **LEGGI IL FILE A MANO** prima di toccare niente. |
| **NONE** (senza licenza) | nessun permesso concesso | **SOLO STUDIO.** Leggere si', copiare no. |

Nelle tabelle che seguono la colonna LICENZA e' obbligatoria e sempre compilata.
Sui 5.103 repository raccolti in questa caccia: **42% permissivi** (MIT,
Apache, BSD, ISC, CC0, MPL), **42% senza licenza**, il resto copyleft o da
leggere a mano. Quasi meta' di quello che si trova non si puo' copiare.

### Una nota di onesta' sulla colonna "premio"

Le righe marcate **(*)** hanno un premio di dominio pubblico consolidato, ma in
questo giro **non ho potuto ri-verificare anno e categoria esatti sull'albo
ufficiale**: gli albi di FWA, Webby e One Show sono costruiti in JavaScript e
non si lasciano leggere da riga di comando, e il budget di ricerca web della
sessione si e' esaurito. Prendile come "questo ente/studio e' un vincitore
riconosciuto", non come citazione bibliografica.

Le righe della **Tabella 5** non hanno l'asterisco: quelle sono verificate una
per una, perche' ho scaricato io l'albo dei vincitori CSS Design Awards e ho la
data del premio per ciascuna.

---

## Come ho cercato (e cosa ha reso di piu')

Cinque strade, in ordine di resa reale misurata su questo giro:

1. **Albo premi scaricato a mano, poi sourcemap in produzione.** Ho scaricato
   l'albo dei vincitori CSS Design Awards (Website of the Day) pagina per
   pagina: **716 vincitori verificati fra 2024 e 2026**, con nome, data del
   premio e URL. Su ognuno ho poi cercato la sourcemap. E' la strada che ha
   reso di piu', perche' il premio e' **certo** e il codice e' **quello vero
   del sito premiato**, non una libreria di contorno.
2. **Organizzazioni GitHub di redazioni ed enti non commerciali.** Il filone
   piu' ricco per volume e, soprattutto, per qualita' della licenza.
3. **Organizzazioni GitHub degli studi commerciali.** Rendono poco codice di
   siti e molto codice di librerie.
4. **Bundle non minificato** lasciato in produzione: 67 casi su 716.
5. **`/.git/config` e `package.json`** esposti sulla radice: 2 e 3 casi.

### Le trappole che ho pagato, scritte perche' non si ripaghino

- **L'endpoint GitHub e' sensibile a come si scrive il nome.** `Zajno` e
  `Cuberto` esistono e li ho trovati entrambi (10 e 28 repository), ma vanno
  cercati con la maiuscola giusta. Un 404 cercato male fa dichiarare assente
  una cosa che c'e'.
- **Peggio del 404: il risultato schiacciato.** Interrogando piu'
  organizzazioni insieme (`user:area17+user:jam3+user:mediamonks`) GitHub
  restituisce al massimo 100 risultati **in totale**, ordinati per stelle. Le
  organizzazioni grandi mangiano tutto lo spazio e quelle piccole tornano a
  zero. `jam3` mi e' risultato vuoto per questo motivo al primo giro, non
  perche' fosse vuoto davvero. **Le organizzazioni che contano vanno
  interrogate una per una.** Interrogata da sola, `jam3` risulta davvero a
  zero: quello e' un negativo verificato, l'altro era un artefatto.
- **`ueno` su GitHub non e' lo studio Ueno.** E' uno sviluppatore giapponese di
  metodi di input (58 repository di IBus e SKK). Il nome che sembra giusto non
  basta: va guardato cosa c'e' dentro.
- **`studio-freight` non esiste piu'.** Restituisce errore 422. Lo studio si e'
  rinominato **`darkroomengineering`**, ed e' li' che sta il tesoro.
- **Il limite di richieste e' doppio.** L'API normale di GitHub concede 60
  richieste all'ora senza autenticazione e si esaurisce in pochi minuti; l'API
  di **ricerca** e' un contatore separato e molto piu' generoso (circa 10 al
  minuto). Tutta questa caccia e' stata fatta con la ricerca, non con
  l'endpoint normale. Se il tuo primo tentativo restituisce 403, non e' il
  nome sbagliato: e' il contatore finito.
- **Il README quasi mai dichiara il premio.** Su 27 README controllati, 2
  nominavano un premio. L'abbinamento sito-premio va fatto dall'albo, non dal
  repository.
- **Attenzione ai falsi positivi nelle sourcemap.** Molti siti espongono
  sourcemap che contengono solo codice di terzi: i moduli di Framer
  (`framerusercontent.com`), le librerie servite da `ga.jspm.io`, i polyfill
  `core-js`, la libreria di attributi Osmo/Finsweet. Sembrano bottino e non lo
  sono. Il codice **del sito** si riconosce dai percorsi tipo
  `webpack://nomedelsito/./src/...` oppure `../../src/components/...`.
  Su 99 sourcemap con sorgenti, solo **72** contenevano codice davvero proprio.

---

## Tabella 1 - Redazioni giornalistiche premiate

E' il filone piu' ricco, come previsto. Le redazioni pubblicano molto, spesso
con licenza vera, e quello che pubblicano e' il mestiere: come si costruisce
una storia interattiva in produzione, sotto scadenza.

| Sito / progetto | Premio e anno | Ente | Repo | Stelle | Ultimo push | LICENZA | Dim. | Ling. | Cosa si impara |
|---|---|---|---|---|---|---|---|---|---|
| website | Webby, piu' edizioni (*) | The Pudding | [the-pudding/website](https://github.com/the-pudding/website) | 92 | 2026-08-04 | **MIT** | 489 MB | Svelte | Il sito INTERO di una redazione premiata, storia per storia. E' il pezzo piu' vicino a "codice di un sito premiato" che esista in licenza libera. |
| svelte-starter | Webby, piu' edizioni (*) | The Pudding | [the-pudding/svelte-starter](https://github.com/the-pudding/svelte-starter) | 454 | 2026-07-02 | **MIT** | 5 MB | Svelte | Lo scheletro con cui costruiscono ogni pezzo premiato: Svelte, build statica, dati e testi presi da foglio di calcolo. |
| data | Webby, piu' edizioni (*) | The Pudding | [the-pudding/data](https://github.com/the-pudding/data) | 1074 | 2026-08-04 | **MIT** | 160 MB | HTML | I dati grezzi di ogni storia. Serve per rifare un pezzo da zero e capire quanto lavoro sta a monte del bello. |
| censorship | Webby, piu' edizioni (*) | The Pudding | [the-pudding/censorship](https://github.com/the-pudding/censorship) | 44 | 2022-10-13 | **MIT** | 113 MB | Svelte | Una singola storia premiata, completa: dati, componenti Svelte, animazioni allo scroll. |
| how-to-implement-scrollytelling | Webby (*) | The Pudding | [the-pudding/how-to-implement-scrollytelling](https://github.com/the-pudding/how-to-implement-scrollytelling) | 103 | 2017-11-17 | **NONE** | 4 MB | HTML | Sei modi diversi di fare scrollytelling a confronto, con il codice di ognuno. |
| tshirt | Peabody / Emmy (*) | NPR Visuals | [nprapps/tshirt](https://github.com/nprapps/tshirt) | 153 | 2021-10-27 | **NOASSERTION** | 77 MB | JavaScript | "Planet Money Makes A T-Shirt": lo scrollytelling video che ha fondato il genere. Progetto vero, non demo. |
| interactive-template | Webby / ONA (*) | NPR Visuals | [nprapps/interactive-template](https://github.com/nprapps/interactive-template) | 70 | 2025-03-21 | **MIT** | 967 KB | JavaScript | Il telaio con cui NPR sforna news app: build, iframe responsivi, deploy statico. |
| dailygraphics-next | Webby / ONA (*) | NPR Visuals | [nprapps/dailygraphics-next](https://github.com/nprapps/dailygraphics-next) | 72 | 2026-07-24 | **MIT** | 355 KB | JavaScript | La catena di montaggio dei grafici quotidiani. Come si industrializza la grafica interattiva. |
| sidechain | Webby / ONA (*) | NPR Visuals | [nprapps/sidechain](https://github.com/nprapps/sidechain) | 39 | 2023-09-05 | **NONE** | 35 KB | JavaScript | Iframe responsivi moderni: il problema noioso che ogni redazione deve risolvere, risolto. |
| bestpractices | Webby / ONA (*) | NPR Visuals | [nprapps/bestpractices](https://github.com/nprapps/bestpractices) | 299 | 2024-11-19 | **NONE** | 45 KB | - | Le convenzioni interne di una squadra premiata, messe per iscritto. |
| st-methods | European Newspaper Award (*) | NZZ Visuals | [nzzdev/st-methods](https://github.com/nzzdev/st-methods) | 56 | 2026-08-13 | **NONE** | 1.1 GB | Jupyter | Metodi e codice di TUTTE le storie visive della NZZ. Il piu' grande giacimento singolo trovato. |
| Storytelling-Styleguide | European Newspaper Award (*) | NZZ Visuals | [nzzdev/Storytelling-Styleguide](https://github.com/nzzdev/Storytelling-Styleguide) | 14 | 2026-04-30 | **NONE** | 618 MB | HTML | La guida di stile dello storytelling NZZ, con gli esempi dentro. |
| Q-editor | European Newspaper Award (*) | NZZ Visuals | [nzzdev/Q-editor](https://github.com/nzzdev/Q-editor) | 34 | 2025-03-07 | **MIT** | 2 MB | JavaScript | L'editor con cui i giornalisti creano grafiche senza chiamare uno sviluppatore. |
| Q-server | European Newspaper Award (*) | NZZ Visuals | [nzzdev/Q-server](https://github.com/nzzdev/Q-server) | 38 | 2024-09-06 | **NONE** | 7 MB | JavaScript | Il motore che serve quelle grafiche in pagina. |
| weepeople | Pulitzer / Webby (*) | ProPublica | [propublica/weepeople](https://github.com/propublica/weepeople) | 540 | 2022-08-22 | **NOASSERTION** | 2 MB | - | Un carattere tipografico di sagome umane: si disegnano persone al posto dei puntini scrivendo testo. |
| stateface | Pulitzer / Webby (*) | ProPublica | [propublica/stateface](https://github.com/propublica/stateface) | 362 | 2021-08-02 | **MIT** | 3 MB | HTML | Stessa idea per gli stati USA. Trucco di peso: un font al posto di un SVG. |
| guides | Pulitzer / Webby (*) | ProPublica | [propublica/guides](https://github.com/propublica/guides) | 1299 | 2022-04-07 | **NOASSERTION** | 90 KB | - | La guida di stile per news app e dati di una redazione premiata. |
| landline | Pulitzer / Webby (*) | ProPublica | [propublica/landline](https://github.com/propublica/landline) | 166 | 2015-03-10 | **MIT** | 2 MB | HTML | Mappe SVG semplici che funzionano ovunque, senza librerie pesanti. |
| upton | Pulitzer / Webby (*) | ProPublica | [propublica/upton](https://github.com/propublica/upton) | 1597 | 2018-12-26 | **MIT** | 3 MB | HTML | Il telaio con cui raccolgono dati dal web. Da dove nascono le inchieste. |
| ai2html | Malofiej / SND (*) | NYT Interactive News | [newsdev/ai2html](https://github.com/newsdev/ai2html) | 964 | 2025-10-22 | **NOASSERTION** | 205 MB | JavaScript | Converte un disegno Illustrator in HTML responsivo. Usato da mezza stampa mondiale. |
| archieml-js | Malofiej / SND (*) | NYT Interactive News | [newsdev/archieml-js](https://github.com/newsdev/archieml-js) | 214 | 2021-11-12 | **NOASSERTION** | 88 KB | JavaScript | Il formato con cui i giornalisti scrivono contenuti strutturati senza toccare codice. |
| three-story-controls | Emmy / SND (*) | New York Times | [nytimes/three-story-controls](https://github.com/nytimes/three-story-controls) | 270 | 2023-10-06 | **NOASSERTION** | 2 MB | TypeScript | Controlli di camera three.js per raccontare storie in 3D allo scroll. Raro e prezioso. |
| svg-crowbar | SND (*) | New York Times | [nytimes/svg-crowbar](https://github.com/nytimes/svg-crowbar) | 845 | 2017-02-28 | **MIT** | 186 KB | JavaScript | Estrae un SVG dalla pagina con gli stili applicati. Il ponte fra grafico e file consegnabile. |
| text-balancer | SND (*) | New York Times | [nytimes/text-balancer](https://github.com/nytimes/text-balancer) | 391 | 2021-08-26 | **NOASSERTION** | 7 KB | JavaScript | Elimina le vedove tipografiche. Dettaglio da premio, 7 KB. |
| graphics-components | Malofiej / SND (*) | Reuters Graphics | [reuters-graphics/graphics-components](https://github.com/reuters-graphics/graphics-components) | 52 | 2026-08-13 | **NONE** | 275 MB | Svelte | I componenti Svelte con cui Reuters costruisce le sue grafiche. |
| visual-vocabulary | Kantar / SND (*) | Financial Times | [ft-interactive/visual-vocabulary](https://github.com/ft-interactive/visual-vocabulary) | 347 | 2021-08-18 | **NONE** | 107 MB | JavaScript | Il poster che insegna quale grafico usare per quale dato. Riferimento di settore. |
| datashare | Webby / One Show / Pulitzer (*) | ICIJ | [ICIJ/datashare](https://github.com/ICIJ/datashare) | 749 | 2026-08-13 | **AGPL-3.0** | 408 MB | Java | Il motore dietro Panama Papers e Pandora Papers: ricerca su montagne di documenti. |
| extract | Webby / One Show (*) | ICIJ | [ICIJ/extract](https://github.com/ICIJ/extract) | 257 | 2026-08-07 | **MIT** | 74 MB | Java | Estrae testo da milioni di documenti in parallelo. L'infrastruttura invisibile delle grandi inchieste. |
| octosuite | Webby (*) | Bellingcat | [bellingcat/octosuite](https://github.com/bellingcat/octosuite) | 1895 | 2026-02-28 | **MIT** | 5 MB | Python | Indagine su dati pubblici. Il mestiere dell'open source intelligence. |
| EDGAR | Webby (*) | Bellingcat | [bellingcat/EDGAR](https://github.com/bellingcat/EDGAR) | 208 | 2025-05-15 | **GPL-3.0** | 504 KB | Python | Strumenti investigativi open. Copyleft forte: si studia, non si incorpora. |
| klaxon | Webby (*) | The Marshall Project | [themarshallproject/klaxon](https://github.com/themarshallproject/klaxon) | 682 | 2026-08-11 | **MIT** | 3 MB | SCSS | Sorveglia le pagine web e avvisa quando cambiano. Idea semplice, resa premiata. |
| everything | Webby / Pulitzer (*) | BuzzFeed News | [BuzzFeedNews/everything](https://github.com/BuzzFeedNews/everything) | 1334 | 2022-04-27 | **NONE** | 97 KB | - | L'indice di tutte le loro inchieste con dati e codice aperti. |
| Chartbuilder | Webby (*) | Quartz | [Quartz/Chartbuilder](https://github.com/Quartz/Chartbuilder) | 2096 | 2017-09-13 | **MIT** | 21 MB | JavaScript | Il costruttore di grafici che ha definito l'estetica dei grafici da redazione degli anni 2010. |
| meme | Webby (*) | Vox Media | [voxmedia/meme](https://github.com/voxmedia/meme) | 1982 | 2022-03-15 | **BSD-3-Clause** | 4 MB | JavaScript | Generatore di immagini social. Il pezzo noioso che fa girare la distribuzione. |

---

## Tabella 2 - Enti non commerciali: governi, musei, biblioteche, ONG

Come previsto dal brief, questi pubblicano molto di piu' degli studi
commerciali **e con licenza vera**. Qui il rapporto MIT/Apache contro
"senza licenza" e' rovesciato rispetto agli studi.

| Sito / progetto | Premio e anno | Ente | Repo | Stelle | Ultimo push | LICENZA | Dim. | Ling. | Cosa si impara |
|---|---|---|---|---|---|---|---|---|---|
| govuk-frontend | D&AD Black Pencil / Design of the Year (*) | Government Digital Service (UK) | [alphagov/govuk-frontend](https://github.com/alphagov/govuk-frontend) | 1438 | 2026-08-13 | **MIT** | 174 MB | JavaScript | Il front-end di GOV.UK, il sito pubblico piu' premiato di sempre. Componenti accessibili collaudati su milioni di persone. |
| govuk-design-system | D&AD Black Pencil (*) | GDS (UK) | [alphagov/govuk-design-system](https://github.com/alphagov/govuk-design-system) | 658 | 2026-08-12 | **MIT** | 34 MB | Nunjucks | Il sistema di design completo, con accanto le motivazioni di ogni scelta. |
| accessible-autocomplete | D&AD Black Pencil (*) | GDS (UK) | [alphagov/accessible-autocomplete](https://github.com/alphagov/accessible-autocomplete) | 951 | 2025-12-15 | **MIT** | 6 MB | JavaScript | Un campo con suggerimenti fatto accessibile davvero. Il componente che tutti sbagliano. |
| guide-to-wcag | D&AD Black Pencil (*) | GDS (UK) | [alphagov/guide-to-wcag](https://github.com/alphagov/guide-to-wcag) | 149 | 2026-08-11 | **MIT** | 7 MB | HTML | L'accessibilita' spiegata da chi la deve applicare per legge. |
| govuk-prototype-kit | D&AD Black Pencil (*) | GDS (UK) | [alphagov/govuk-prototype-kit](https://github.com/alphagov/govuk-prototype-kit) | 339 | 2026-08-12 | **MIT** | 24 MB | JavaScript | Come si prototipa un servizio in HTML in poche ore per testarlo con le persone. |
| wellcomecollection.org | Webby / D&AD (*) | Wellcome Collection | [wellcomecollection/wellcomecollection.org](https://github.com/wellcomecollection/wellcomecollection.org) | 43 | 2026-08-13 | **MIT** | 110 MB | TypeScript | **Il sito INTERO di un museo premiato**, in TypeScript, aggiornato a oggi. Rarissimo. |
| openlibrary | Webby (*) | Internet Archive | [internetarchive/openlibrary](https://github.com/internetarchive/openlibrary) | 6604 | 2026-08-13 | **AGPL-3.0** | 114 MB | Python | Un servizio pubblico enorme in chiaro, dal database al front-end. Copyleft forte. |
| Signal-Desktop | Webby (*) | Signal Foundation | [signalapp/Signal-Desktop](https://github.com/signalapp/Signal-Desktop) | 16478 | 2026-08-10 | **AGPL-3.0** | 1.1 GB | TypeScript | Prodotto premiato per privacy e design, codice integrale. Copyleft forte. |
| nypl-design-system | Webby (*) | New York Public Library | [NYPL/nypl-design-system](https://github.com/NYPL/nypl-design-system) | 80 | 2026-08-12 | **Apache-2.0** | 231 MB | TypeScript | Sistema di design React con l'accessibilita' come primo criterio, non come ripensamento. |
| web-reader | Webby (*) | New York Public Library | [NYPL/web-reader](https://github.com/NYPL/web-reader) | 47 | 2026-08-11 | **MIT** | 83 MB | HTML | Un lettore di libri digitali nel browser, accessibile. |
| collection (MoMA) | Webby (*) | MoMA | [MuseumofModernArt/collection](https://github.com/MuseumofModernArt/collection) | 1535 | 2026-08-11 | **CC0-1.0** | 37 MB | - | La collezione del MoMA in dati aperti. CC0: zero attriti, si usa e basta. |
| openaccess | Webby (*) | Metropolitan Museum of Art | [metmuseum/openaccess](https://github.com/metmuseum/openaccess) | 1410 | 2024-07-31 | **CC0-1.0** | 125 KB | - | 490.000 opere in dominio pubblico con i dati. Il piu' generoso dei musei. |
| OpenAccess | Webby (*) | Smithsonian Institution | [Smithsonian/OpenAccess](https://github.com/Smithsonian/OpenAccess) | 439 | 2021-12-21 | **CC0-1.0** | 10 KB | - | Milioni di oggetti in CC0. Materia prima per un'esperienza culturale. |
| collection (Cooper Hewitt) | Webby / D&AD (*) | Cooper Hewitt Smithsonian Design Museum | [cooperhewitt/collection](https://github.com/cooperhewitt/collection) | 236 | 2018-01-10 | **NONE** | 1.1 GB | - | La collezione che ha reso possibile il loro sito premiato. |
| label-whisperer | Webby / D&AD (*) | Cooper Hewitt | [cooperhewitt/label-whisperer](https://github.com/cooperhewitt/label-whisperer) | 4 | 2014-11-29 | **BSD-3-Clause** | 335 KB | Python | Legge le targhette dei quadri con OCR. Idea da museo che ragiona da prodotto. |
| analytics.usa.gov | Webby (*) | 18F / GSA (USA) | [18F/analytics.usa.gov](https://github.com/18F/analytics.usa.gov) | 784 | 2026-08-12 | **NOASSERTION** | 56 MB | JavaScript | Il cruscotto pubblico del traffico del governo americano. Dati veri, in chiaro. |
| petitions | Webby (*) | The White House | [WhiteHouse/petitions](https://github.com/WhiteHouse/petitions) | 1148 | 2022-02-03 | **NONE** | 15 MB | JavaScript | Il codice di "We The People", la piattaforma di petizioni della Casa Bianca. |

---

## Tabella 3 - Google Creative Lab

Un caso a parte: e' la squadra che ha vinto piu' FWA, Webby, D&AD e Cannes nel
digitale, e pubblica quasi tutto in **Apache-2.0**, cioe' usabile sul lavoro.
Molti repo sono archiviati (non piu' mantenuti) ma il codice resta leggibile.

| Sito / progetto | Premio e anno | Ente | Repo | Stelle | Ultimo push | LICENZA | Dim. | Ling. | Cosa si impara |
|---|---|---|---|---|---|---|---|---|---|
| chrome-music-lab | Webby / D&AD (*) | Google Creative Lab | [googlecreativelab/chrome-music-lab](https://github.com/googlecreativelab/chrome-music-lab) | 2419 | 2024-02-28 | **Apache-2.0** | 16 MB | JavaScript | Esperimenti sonori con Web Audio. Il riferimento per far suonare un sito senza infastidire. |
| quickdraw-dataset | D&AD / Webby (*) | Google Creative Lab | [googlecreativelab/quickdraw-dataset](https://github.com/googlecreativelab/quickdraw-dataset) | 6800 | 2025-03-11 | **NOASSERTION** | 153 KB | - | "Quick, Draw!": 50 milioni di disegni. Il gioco e il dataset che ne e' uscito. |
| anypixel | FWA / D&AD (*) | Google Creative Lab | [googlecreativelab/anypixel](https://github.com/googlecreativelab/anypixel) | 6439 | 2025-08-18 | **Apache-2.0** | 88 MB | JavaScript | Costruire schermi enormi e strani guidati dal web. Hardware e software insieme. |
| teachable-machine-v1 | Webby (*) | Google Creative Lab | [googlecreativelab/teachable-machine-v1](https://github.com/googlecreativelab/teachable-machine-v1) | 3869 | 2021-09-01 | **Apache-2.0** | 4 MB | JavaScript | Insegnare a una macchina dal browser, senza codice. Interfaccia premiata. |
| teachablemachine-community | Webby (*) | Google Creative Lab | [googlecreativelab/teachablemachine-community](https://github.com/googlecreativelab/teachablemachine-community) | 1728 | 2026-06-19 | **Apache-2.0** | 52 MB | TypeScript | La versione mantenuta, con esempi d'uso. |
| coder | Webby / D&AD (*) | Google Creative Lab | [googlecreativelab/coder](https://github.com/googlecreativelab/coder) | 2423 | 2025-08-18 | **Apache-2.0** | 5 MB | JavaScript | Fare cose web su Raspberry Pi. Progetto educativo premiato. |
| aiexperiments-ai-duet | Webby (*) | Google Creative Lab | [googlecreativelab/aiexperiments-ai-duet](https://github.com/googlecreativelab/aiexperiments-ai-duet) | 1669 | 2025-08-18 | **NONE** | 42 MB | JavaScript | Un pianoforte che risponde. Piccolo, chiaro, memorabile. Senza licenza: solo studio. |
| inside-music | Webby (*) | Google Creative Lab | [googlecreativelab/inside-music](https://github.com/googlecreativelab/inside-music) | 400 | 2018-02-13 | **Apache-2.0** | 44 MB | JavaScript | Entrare dentro una canzone e vederne i pezzi. WebVR + Web Audio. |
| morse-learn | Webby (*) | Google Creative Lab | [googlecreativelab/morse-learn](https://github.com/googlecreativelab/morse-learn) | 337 | 2026-06-28 | **Apache-2.0** | 7 MB | JavaScript | Imparare il Morse giocando. Accessibilita' e gioco nello stesso progetto. |
| creatability-components | Webby / accessibilita' (*) | Google Creative Lab | [googlecreativelab/creatability-components](https://github.com/googlecreativelab/creatability-components) | 300 | 2026-05-12 | **NOASSERTION** | 6 MB | TypeScript | Componenti per rendere accessibili gli strumenti creativi. Poco noti, molto utili. |

---

## Tabella 4 - Studi commerciali premiati (FWA, CSSDA, Cannes, One Show)

Qui il codice dei **siti** e' quasi sempre chiuso. Quello che esce sono le
librerie. Con due eccezioni notevoli, in cima alla tabella.

| Sito / progetto | Premio e anno | Studio | Repo | Stelle | Ultimo push | LICENZA | Dim. | Ling. | Cosa si impara |
|---|---|---|---|---|---|---|---|---|---|
| **sf-website** | FWA / Awwwards (*) | Darkroom (ex Studio Freight) | [darkroomengineering/sf-website](https://github.com/darkroomengineering/sf-website) | 139 | 2024-10-11 | **NONE** | 56 MB | JavaScript | **IL SITO DELLO STUDIO PREMIATO, aperto per intero.** Il pezzo piu' raro della caccia: uno studio commerciale che pubblica il proprio sito da premio. Senza licenza: si studia. |
| **justareflektor** | Cannes Lions / FWA / One Show (*) | UNIT9 + Google | [unit9/justareflektor](https://github.com/unit9/justareflektor) | 207 | 2015-12-21 | **NOASSERTION** | 4 MB | JavaScript | "Just A Reflektor" degli Arcade Fire: il video interattivo a due schermi che ha vinto tutto. Codice del progetto premiato. |
| lenis | FWA / Awwwards (*) | Darkroom | [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) | 15396 | 2026-08-11 | **MIT** | 10 MB | TypeScript | Lo scorrimento morbido che sta sotto meta' dei siti premiati degli ultimi anni. Se se ne studia uno solo, questo. |
| satus | FWA / Awwwards (*) | Darkroom | [darkroomengineering/satus](https://github.com/darkroomengineering/satus) | 979 | 2026-08-13 | **MIT** | 14 MB | TypeScript | Il loro punto di partenza per ogni progetto: Next.js, GSAP, shader, struttura di cartelle. Lo scheletro di uno studio da premio. |
| tempus | FWA / Awwwards (*) | Darkroom | [darkroomengineering/tempus](https://github.com/darkroomengineering/tempus) | 327 | 2026-07-29 | **MIT** | 689 KB | TypeScript | Un solo requestAnimationFrame per tutta l'applicazione. La disciplina che tiene i 60 fotogrammi. |
| hamo | FWA / Awwwards (*) | Darkroom | [darkroomengineering/hamo](https://github.com/darkroomengineering/hamo) | 312 | 2026-07-29 | **MIT** | 41 MB | TypeScript | I loro hook React di uso quotidiano. |
| aniso | FWA / Awwwards (*) | Darkroom | [darkroomengineering/aniso](https://github.com/darkroomengineering/aniso) | 440 | 2026-06-04 | **MIT** | 2 MB | JavaScript | Immagini fatte di caratteri ASCII. Effetto d'autore, codice leggibile. |
| spargo | FWA / Awwwards (*) | Darkroom | [darkroomengineering/spargo](https://github.com/darkroomengineering/spargo) | 11 | 2026-08-03 | **MIT** | 3 MB | TypeScript | Retinatura delle immagini in tempo reale su GPU via WebGL. |
| locomotive-scroll | FWA / Awwwards (*) | Locomotive | [locomotivemtl/locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll) | 8837 | 2026-06-30 | **MIT** | 13 MB | JavaScript | Lo scorrimento con parallasse che ha definito un'epoca. Ancora il riferimento del genere. |
| locomotive-boilerplate | FWA / Awwwards (*) | Locomotive | [locomotivemtl/locomotive-boilerplate](https://github.com/locomotivemtl/locomotive-boilerplate) | 482 | 2025-07-24 | **MIT** | 5 MB | JavaScript | Lo scheletro front-end dello studio, completo di build. |
| astro-boilerplate | FWA / Awwwards (*) | Locomotive | [locomotivemtl/astro-boilerplate](https://github.com/locomotivemtl/astro-boilerplate) | 65 | 2026-07-06 | **MIT** | 2 MB | TypeScript | La versione moderna su Astro. Utile per capire dove si sono spostati. |
| webgl-images | FWA / Awwwards (*) | Locomotive | [locomotivemtl/webgl-images](https://github.com/locomotivemtl/webgl-images) | 52 | 2024-07-05 | **MIT** | 6 MB | JavaScript | Come si sostituisce un'immagine HTML con la stessa immagine disegnata in WebGL, per poterla deformare. |
| charcoal-cms | FWA / Awwwards (*) | Locomotive | [locomotivemtl/charcoal-cms](https://github.com/locomotivemtl/charcoal-cms) | 52 | 2025-11-04 | **MIT** | 16 MB | PHP | Il loro CMS. Come uno studio da premio gestisce i contenuti dei clienti. |
| r3f-scroll-rig | FWA / Awwwards (*) | 14islands | [14islands/r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig) | 961 | 2025-12-17 | **MIT** | 14 MB | TypeScript | Sincronizza oggetti 3D e elementi HTML nello stesso scorrimento. Il problema centrale dei siti immersivi. |
| mouse-follower | FWA / CSSDA (*) | Cuberto | [Cuberto/mouse-follower](https://github.com/Cuberto/mouse-follower) | 822 | 2023-10-23 | **MIT** | 70 KB | JavaScript | Il cursore personalizzato che li ha resi riconoscibili. |
| twill | Webby (*) | AREA 17 | [area17/twill](https://github.com/area17/twill) | 3967 | 2026-07-31 | **Apache-2.0** | 59 MB | PHP | Il CMS su misura di uno studio premiato. Come si da' un pannello decente al cliente senza WordPress. |
| blast | Webby (*) | AREA 17 | [area17/blast](https://github.com/area17/blast) | 316 | 2026-08-09 | **Apache-2.0** | 3 MB | PHP | Storybook per Laravel Blade: vedere i componenti isolati prima di montarli. |
| twill-image | Webby (*) | AREA 17 | [area17/twill-image](https://github.com/area17/twill-image) | 32 | 2025-04-09 | **Apache-2.0** | 334 KB | PHP | Immagini responsive con art direction e caricamento pigro, fatte bene. |
| a17-behaviors | Webby (*) | AREA 17 | [area17/a17-behaviors](https://github.com/area17/a17-behaviors) | 19 | 2025-08-28 | **MIT** | 359 KB | JavaScript | Attaccare comportamenti JavaScript al DOM senza framework. Leggero e ordinato. |
| oz | FWA (*) | UNIT9 + Google | [unit9/oz](https://github.com/unit9/oz) | 16 | 2017-06-06 | **NONE** | 399 MB | CoffeeScript | "Find Your Way to Oz": esperimento Chrome premiato, 400 MB di progetto vero. |
| vivid | FWA (*) | UNIT9 | [unit9/vivid](https://github.com/unit9/vivid) | 10 | 2017-08-29 | **NONE** | 9 MB | JavaScript | Esperimento WebVR. Come si affrontava il 3D nel browser prima che fosse facile. |
| google-io-2013 | FWA / Webby (*) | Instrument | [Instrument/google-io-2013](https://github.com/Instrument/google-io-2013) | 74 | 2015-06-15 | **Apache-2.0** | 48 MB | JavaScript | L'esperimento Google I/O 2013 di uno studio piu' volte premiato. |
| emotobooth | FWA / Webby (*) | Instrument | [Instrument/emotobooth](https://github.com/Instrument/emotobooth) | 41 | 2018-11-16 | **NONE** | 55 MB | JavaScript | Esperienza che legge le emozioni dal volto. |
| cyclops | FWA / Webby (*) | Instrument | [Instrument/cyclops](https://github.com/Instrument/cyclops) | 225 | 2017-06-21 | **MIT** | 814 KB | JavaScript | Esporta le animazioni da After Effects a JavaScript. Il ponte fra motion designer e sviluppatore. |
| fast-image-sequence | FWA / Cannes (*) | Media.Monks | [mediamonks/fast-image-sequence](https://github.com/mediamonks/fast-image-sequence) | 53 | 2026-08-09 | **NONE** | 122 MB | TypeScript | Sequenze di immagini ad alto frame rate: il trucco dietro molti "video" che rispondono allo scorrimento. |
| image-effect-renderer | FWA / Cannes (*) | Media.Monks | [mediamonks/image-effect-renderer](https://github.com/mediamonks/image-effect-renderer) | 28 | 2026-07-12 | **NONE** | 7 MB | TypeScript | Shader su immagini e video HTML, in poche righe. |
| muban | FWA / Cannes (*) | Media.Monks | [mediamonks/muban](https://github.com/mediamonks/muban) | 40 | 2022-12-10 | **NONE** | 7 MB | JavaScript | Migliorare HTML generato dal server senza riscriverlo in un framework. |
| frontend-coding-standards | FWA / Cannes (*) | Media.Monks | [mediamonks/frontend-coding-standards](https://github.com/mediamonks/frontend-coding-standards) | 62 | 2022-04-04 | **NONE** | 324 KB | JavaScript | Gli standard interni di un'agenzia globale premiata. |

---

## Tabella 5 - Sourcemap in produzione sui vincitori CSS Design Awards

**Queste righe sono verificate.** Ho scaricato l'albo CSSDA dei Website of the
Day, 716 vincitori fra 2024 e 2026, e su ognuno ho cercato la sourcemap. La
data accanto e' la data reale del premio, presa dall'albo.

La sourcemap e' il file che il compilatore lascia in produzione per poter
ricostruire il codice originale a partire dal codice compresso. Quando dentro
c'e' il campo `sourcesContent`, **il sorgente e' letteralmente li' dentro**:
componenti, shader, fogli di stile, commenti dello sviluppatore.

Come si prende: apri il bundle JS, cerca in fondo `//# sourceMappingURL=`,
scarica quel file `.map`, e' JSON; i nomi stanno in `sources` e il codice in
`sourcesContent`.

> **Nessuna di queste ha una licenza.** E' codice di produzione lasciato
> esposto per distrazione, non pubblicato di proposito. **Si studia, non si
> copia**, e vale la pena essere ancora piu' prudenti che con un repository
> senza licenza: qui manca perfino l'intenzione di condividere.

| Sito | Premio (verificato) | File sorgente recuperabili | Peso mappa | URL |
|---|---|---|---|---|
| **Into The Amazon** (National Geographic) | CSSDA WOTD, 26 mar 2025 | **483** | 6.671 KB | https://www.nationalgeographic.com/into-the-amazon/ |
| Olha Lazarieva, portfolio | CSSDA WOTD, 18 set 2025 | 430 | 6.108 KB | https://www.olhalazarieva.com/ |
| Phive Clubs | CSSDA WOTD, 15 lug 2025 | 362 | 3.930 KB | https://phive.pt/en |
| DG Velvet (Dolce & Gabbana) | CSSDA WOTD, 7 mag 2025 | 336 | 636 KB | https://beautytools.dolcegabbana.com/en-it/velvet |
| Moti, app | CSSDA WOTD, 26 apr 2025 | 328 | 2.085 KB | https://motiapp.io/ |
| Gucci, La Famiglia | CSSDA WOTD, 5 giu 2026 | 322 | 610 KB | https://gucci-la-famiglia-2026-master.monogrid.io/ |
| Biotech Artlife | CSSDA WOTD, 30 ago 2024 | 278 | 1.348 KB | https://biotech.chipsa.design/ |
| Allen Brau | CSSDA WOTD, 1 set 2025 | 238 | 566 KB | https://allenbrau.ru/ |
| The Tuscan Journey Begins (Monogrid) | CSSDA WOTD, 1 ago 2026 | 204 | 314 KB | https://weekend-mm-2026-pasticcino-bag-master.monogrid.io/en/ |
| dotsandlines, agenzia | CSSDA WOTD, 19 apr 2026 | 143 | 716 KB | https://www.dotsandlines.io/ |
| AKKE Knitwear | CSSDA WOTD, 9 apr 2025 | 135 | 1.548 KB | https://akkeknitwear.com |
| Vaonis | CSSDA WOTD, 13 apr 2025 | 116 | 632 KB | https://vaonis.com/ |
| Banzai Izakaya Experience | CSSDA WOTD, 17 nov 2024 | 109 | 364 KB | https://www.nudolsbanzai.it/ |
| QuatreCentQuatre | CSSDA WOTD, 16 ott 2024 | 101 | 1.156 KB | https://quatrecentquatre.com/ |
| MOLO House | CSSDA WOTD, 16 dic 2024 | 96 | 258 KB | https://www.molohouse.com/ |
| AMANATION | CSSDA WOTD, 8 mag 2025 | 61 | 3.271 KB | https://www.amanation-official.com/ |
| Onto Venture Studio | CSSDA WOTD, 6 set 2024 | 42 | 3.568 KB | https://studio-onto.com/ |
| Hau Studio | CSSDA WOTD, 11 ago 2025 | 42 | 774 KB | https://hau.studio |
| 21 TSI | CSSDA WOTD, 28 mar 2025 | 23 | 144 KB | https://21tsi.com/ |
| Kraemer Academy | CSSDA WOTD, 22 ago 2025 | 14 | 77 KB | https://kraemeracademy.com/en/ |

### Le tre mappe che valgono davvero

- **Into The Amazon di National Geographic.** 483 file, 6,5 MB di mappa. Dentro
  ci sono i percorsi `../../src/data/map-icons/*.ktx2` e `*.svg?react`: e' una
  mappa interattiva con texture compresse KTX2 e icone importate come componenti
  React. E' l'intero impianto di uno speciale giornalistico di prima fascia.
- **QuatreCentQuatre.** 101 file con percorsi
  `webpack://quatrecentquatre/./resources/assets/js/app.js` e
  `barba-navigation.js`: e' un progetto Laravel con navigazione senza ricarico
  di pagina fatta con Barba. Si vede il sito intero, non una libreria.
- **Biotech Artlife.** 278 file sotto `webpack://artlife/./src/js/`, con
  `animations/initial-main-page.ts` e `components/no-loop-sliders.ts`. E' il
  codice di animazione di un sito premiato, in TypeScript, con i nomi veri
  che gli hanno dato gli autori.

---

## Tabella 6 - Configurazione esposta sul dominio

Cercati `/.git/config` e `/package.json` sulla radice dei 716 vincitori.

| Sito | Premio (verificato) | Cosa e' esposto | Dettaglio |
|---|---|---|---|
| charlesleclerc.com | CSSDA WOTD | **`/.git/` intero, leggibile** | `/.git/HEAD` risponde 200 con `ref: refs/heads/main`. Il remoto e' `github.com/Andrea-Serrani/charlesleclerc` (privato). La cartella `.git` e' finita sul server web: **da li' si ricostruisce l'intera storia del repository.** |
| samsy.ninja | CSSDA WOTD | `/.git/config` | Remoto `gitlab.com/Samsy/portfo.git`. Il dominio poi reindirizza, ma il file di configurazione e' uscito. |
| sparkandriot.com | CSSDA WOTD | `package.json` | Rivela la catena di build: `less` + `less-watch-compiler`, e il nome dello studio che l'ha fatto ("De Jongens van Boven"). |
| riadmammadov.com | CSSDA WOTD | `package.json` | Rivela lo stack completo: Alpine.js con sei plugin, Tailwind forms, `@studio-freight/lenis` 1.0.42, axios. |
| parinazkassemi.com | CSSDA WOTD | `package.json` | Minimo, ma conferma un server Node (`./server/index.mjs`). |

Nota deontologica: questi sono errori di configurazione altrui. Servono per
capire con che cosa e' fatto un sito, non per entrarci. Il `package.json` in
particolare e' il modo piu' rapido ed economico per rispondere alla domanda
"con che cosa e' costruito questo sito premiato".

---

## Negativi verificati (per non ricercarli domani)

Vale quanto le trovate: sapere dove **non** c'e' niente fa risparmiare un giro.

- **jam3** - interrogata da sola: **0 repository pubblici**. Chiusa davvero.
- **studio-freight** - non esiste piu' (errore 422). Cerca `darkroomengineering`.
- **berlinermorgenpost** - errore 422, l'organizzazione non risponde a quel nome.
- **revealnews** - esiste ma ha 1 solo repository.
- **metmuseum** - 3 repository, ma uno e' il tesoro (`openaccess`, CC0).
- **MuseumofModernArt** - 5 repository.
- **wellcomecollection** - solo 4 repository, ma uno e' il sito intero.
- Senza repository pubblici fra i nomi provati: `akqa`, `deptagency`,
  `hellomonday`, `dogstudio`, `immersive-garden`, `unseenco`, `work-co`,
  `pitchinteractive`, `nationalgeographic`, `condenast`, `vice`, `spiegel`,
  `elpais`, `aljazeera`, `nbcnews`, `chicagotribune`, `hearst`, `gannett`.
  Gli studi creativi e i grandi gruppi editoriali commerciali **non pubblicano**.
- `tympanus` (Codrops) non si e' risolta in questo giro per il problema del
  risultato schiacciato; l'account `codrops` invece ha reso 70 repository.
  Da riprovare da sola.

---

## Conteggio finale

**Organizzazioni GitHub.**

| | |
|---|---|
| Nomi di organizzazione provati | **232** |
| Con almeno un repository pubblico | **166** (72%) |
| Repository unici raccolti e schedati | **5.103** |
| Di cui con licenza permissiva (MIT, Apache, BSD, ISC, CC0, MPL) | **2.167 (42%)** |
| Di cui **senza licenza** | **2.143 (42%)** |
| Repository selezionati e messi in tabella | **89** |

**Siti premiati sondati in produzione.**

| | |
|---|---|
| Vincitori CSSDA scaricati dall'albo (2024-2026) | **716** |
| Effettivamente raggiungibili | **655** (61 irraggiungibili) |
| Con sourcemap contenente sorgenti | **99** |
| Di cui con codice **davvero proprio** del sito | **72** (11% dei raggiungibili) |
| Con bundle non minificato in produzione | **67** |
| Con `/.git/config` esposto | **2** |
| Con `package.json` esposto | **3** |

**In una riga: aperti 72 su 655 provati per la via della sourcemap (11%), piu'
89 repository selezionati su 5.103 schedati per la via di GitHub.**

---

## Le tre prede migliori

### 1. `the-pudding/website` - il sito premiato completo, in MIT

Il solo caso in cui si ottengono insieme le tre cose che di solito non stanno
mai insieme: un sito **premiato**, il codice **integrale**, e una licenza
**permissiva vera**. 489 MB, Svelte, aggiornato ad agosto 2026, con dentro ogni
singola storia che ha fatto la fama della testata. Accanto ci sono
`svelte-starter` (lo scheletro) e `data` (i dati grezzi): si puo' smontare una
storia premiata dal dato fino all'animazione. **Si puo' anche copiare**, che e'
il punto.

### 2. `darkroomengineering/sf-website` - il sito di uno studio da premio

Il pezzo piu' raro: uno studio commerciale di primissima fascia che pubblica il
proprio sito, quello che gli ha fatto vincere i premi, tutti i 56 MB. Attorno
c'e' l'officina completa in MIT: `lenis` (15.396 stelle), `satus`, `tempus`,
`hamo`. Si vede sia il prodotto finito sia gli attrezzi con cui e' stato fatto.
**Attenzione: `sf-website` non ha licenza. Si studia, non si copia** - mentre
le librerie attorno sono MIT e si usano.

### 3. National Geographic, "Into The Amazon" - 483 file da una sola mappa

Il miglior bottino della via delle sourcemap, e con il premio **verificato**
(CSSDA Website of the Day, 26 marzo 2025). Una sola richiesta HTTP restituisce
6,5 MB di mappa con 483 file sorgente: struttura, texture compresse KTX2,
icone-componente, logica della mappa interattiva. E' lo speciale di una
redazione di prima fascia smontato pezzo per pezzo. **Nessuna licenza:
guardare e imparare, non riusare.**

---

## Quale albo si e' rivelato piu' generoso di codice

In ordine.

1. **Webby Awards - largo distacco.** Non perche' il Webby obblighi a
   pubblicare, ma per **chi lo vince**: redazioni, musei, biblioteche, ONG,
   enti pubblici. Sono organizzazioni che pubblicano codice per missione o per
   obbligo di legge, e lo fanno con licenza vera. Da sole, le organizzazioni
   dell'area Webby hanno prodotto la Tabella 1, la 2 e la 3, cioe' la
   maggioranza delle trovate e quasi tutta la roba **usabile**. Il brief lo
   prevedeva ed e' confermato con i numeri.
2. **CSS Design Awards - il piu' generoso in assoluto se si sa dove guardare.**
   Non da' repository, ma e' l'unico albo che si lascia scaricare per intero da
   riga di comando: 716 vincitori con data e URL in una manciata di richieste.
   E' quello che ha permesso di verificare i premi invece di doverli assumere,
   e da li' sono usciti 72 siti col codice recuperabile.
3. **D&AD** - pochi vincitori, ma pesantissimi: GOV.UK da solo vale una
   biblioteca, tutto in MIT.
4. **One Show / Cannes Lions** - il codice esce solo quando dietro c'e' Google
   come partner tecnico (`justareflektor`, gli esperimenti Chrome). Gli stessi
   premi vinti da agenzie pure non lasciano nulla.
5. **FWA** - il piu' avaro. Premia soprattutto studi commerciali, che tengono
   chiuso. Per giunta e' l'unico albo che non si e' lasciato leggere in nessun
   modo: pagina in JavaScript, API con le rotte non enumerabili, errore 500 su
   tutte le pagine di elenco.
6. **SiteInspire** - non contribuisce: risponde 429 (troppe richieste) gia'
   alla prima chiamata.

**La lezione operativa.** Se cerchi codice di siti premiati, non partire dagli
studi che ammiri: partire dagli **enti che devono pubblicare**. Un museo, una
redazione o un governo che ha vinto un Webby ti da' il sito intero con licenza
MIT; uno studio che ha vinto un FWA, nel migliore dei casi, ti da' la libreria
di scorrimento.
