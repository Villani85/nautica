# La pagina di un caso studio — anatomia misurata

Il documento con cui un'agenzia vende. Ricostruito blocco per blocco su
**122 pagine di caso studio** scaricate da **otto studi premiati**.

Ogni numero e' contato sull'HTML servito (`curl`, nessun browser): tolti
`<script>`, `<style>`, `<svg>`, `<head>`, contate le parole del **testo
editoriale** (esclusi menu, piede, cookie banner) e i nodi `<img>` / `<video>`.

**Il corpus:**

| studio | pagine valide | esempio principale |
|---|---|---|
| Hello Monday | 44 | `/work/bearaby`, `/work/google-most-searched` |
| Locomotive | 32 | `/en/work/scout-motors` |
| Basement | 25 | `/showcase/cursor-ai-powered-growth`, `/showcase/rox-...` |
| Cuberto | 10 | `/projects/cisco/` |
| Trionn | 8 | `/work/8octa` |
| by-kin | 1 | `/work/dentons` |
| Revelatio | 1 | `/project/beuni` |
| Obys | 1 | `/work/porsche-taycan` |

---

## 1. La struttura, blocco per blocco

Cosa mette ognuno, e **in che ordine**. `1` = presente, `-` = assente.

| blocco | by-kin | Locomotive | Revelatio | Basement | Trionn | Hello Monday | Cuberto | Obys |
|---|---|---|---|---|---|---|---|---|
| copertina a piena pagina | 1 | 1 | 1 | 1 | 1 | 1 | 1 | - |
| titolo del progetto | in fondo | in cima | in cima | solo nel menu | in cima | in cima | in cima | in cima |
| **claim / tesi di una riga** | 1 | 1 | nel titolo | 1 (in fondo) | 1 | nel titolo | 1 | - |
| riga metadati | in fondo | in cima | in cima | **in cima** | in cima | **in cima** | - | in cima |
| link al sito vivo | - | 1 (x2) | - | 1 | 1 (Dribbble) | 1 | - | 1 |
| paragrafo sul cliente / contesto | - | 1 | `Context` | 1 | - | 1 | - | - |
| paragrafo sulla sfida | dentro il corpo | dentro `About` | `Challenge` | dentro il 2° | `The challenge` | 1 | `The challenge` | - |
| paragrafo sulla soluzione | - | - | `Solution` | 1 | `Approach` | 1 | 1 | - |
| **esito dichiarato** | - | - | - | 1 su 25 pagine | `Outcome` | - | - | - |
| elenco deliverable / servizi | - | categorie | `Deliverables` | `Type` | 4 tag | `Deliverables` | - | 1 riga |
| sotto-sezioni sul dettaglio | - | - | - | - | `What we did` | **1 (2-8 per pagina)** | 1 (2-4) | - |
| **premi elencati** | 1 campo | **1 blocco `Awards (n)`** | - | - | - | - | - | - |
| **crediti / squadra** | - | **1 (8 ruoli)** | **1 (11 righe)** | - | - | - | - | - |
| **testimonianza del cliente** | - | - | - | - | - | - | **1 (7 su 10)** | - |
| galleria di sole immagini | **11+ schermate** | 1 | 1 | 1 | 1 | intercalata | intercalata | in WebGL |
| progetto successivo | - | `Next Project` | 2 progetti | 2 progetti | Prev/Next | 3 progetti | `Next project` | - |
| invito a contattare | **1** | - | **1 (a 3 stadi)** | newsletter | **modulo intero** | 1 (4 porte) | - | mail |

**Le tre famiglie che escono dai dati:**

1. **La scheda muta** (by-kin, Obys, Locomotive): poche parole, metadati
   secchi, il lavoro parla da solo. 0-135 parole.
2. **Il modulo compilato** (Basement, Trionn): due o tre paragrafi sempre
   nello stesso ordine, sempre della stessa lunghezza. 52-198 parole.
   **Trionn e' il piu' rigido di tutti: 8 pagine su 8 hanno esattamente 8
   blocchi di testo e stanno fra 155 e 198 parole** — uno scarto del 27% fra
   il piu' corto e il piu' lungo, contro il 1.900% di Hello Monday.
3. **L'articolo** (Hello Monday, Cuberto, Revelatio): sotto-sezioni titolate,
   ognuna che spiega una decisione. 162-1.043 parole.

---

## 2. Quanto testo c'e' davvero

Parole editoriali per pagina, misurate su tutto il corpus.

| studio | pagine | minimo | **mediana** | massimo | immagini (intervallo) |
|---|---|---|---|---|---|
| **Locomotive** | 32 | 43 | **68,5** | 135 | 6-20 `<img>` + 0-10 `<video>` |
| **Basement** | 25 | 52 | **92** | 176 | 7-27 |
| **by-kin** (Dentons) | 1 | — | **91** | — | 35 nodi, ~14 di progetto |
| **Trionn** | 8 | 155 | **181,5** | 198 | 6-12 |
| **Hello Monday** | 44 | 162 | **279,5** | **1.043** | 2-23 + 1-13 `<video>` |
| **Cuberto** | 10 | 196 | **347,5** | 389 | 7-22 |
| **Revelatio** (BeUni) | 1 | — | **348** | — | 42 |
| **Obys** | 1 | — | **0** | — | 0 nell'HTML |

**Il divario e' di quindici volte** fra la mediana di Locomotive (68,5) e
quella di Cuberto (347,5). Non esiste una lunghezza "giusta" di settore:
esistono due mestieri diversi venduti con la stessa parola.

### Il caso limite in un senso: by-kin / Dentons

**91 parole editoriali, 35 nodi `<img>`.** E soprattutto: **il testo sta in
fondo.** Nell'HTML le immagini vengono *prima* del blocco `info`. Chi apre la
pagina trova la copertina, poi **undici schermate consecutive di sole
fotografie senza una parola**, e solo dopo:

- standfirst: *«An award winning office inspired by the natural landscape and
  architecture of Scotland.»* — **13 parole**
- corpo: un solo paragrafo di quattro frasi — **78 parole**
- scheda metadati — 12 parole
- chiusura — 8 parole

**Le didascalie sono finte.** Ci sono 37 `<span>` didascalia per 35 immagini,
ma il contenuto e' **la stessa stringa `alt` ripetuta 31 volte**: *«Award
winning interior design of office space **fro** Dentons in Edinburgh, Scotland
by 'kin interior design, branding and graphic design studio»* — con il refuso
`fro` invece di `for`. Due caption sono rimaste al placeholder del CMS:
`IMAGE CAPTION`.

### Il caso limite nell'altro senso: Obys / Porsche Taycan

**Zero parole editoriali.** L'HTML servito pesa 13.425 byte e contiene 50
parole in tutto, **tutte di contorno**: `Back`, il titolo, due righe di meta
(`Automotive` / `Web Design/Dev`), l'indirizzo email e il paragrafo generico
dello studio — lo stesso su tutte le pagine.

Il contenuto vero non e' nell'HTML: la pagina monta un `<script id="__SEED__">`
con un JSON in **base64 + XOR**, decodificato al volo. L'ho decodificato: dentro
c'e' **solo la configurazione di routing** (`{"cfg":{"v":"?msh4f1r6"},
"rt":{"cur":{"url":"/work/porsche-taycan","pg":"wo"}}}`), nessun testo. La
galleria e' disegnata in WebGL dentro un `#wo-ga` vuoto.

**Un caso studio Obys e' una schermata sola:** titolo, settore, servizio, link
al sito vivo, galleria. Nessuna storia. Nessun premio. Nessun credito.

### Il rapporto parole/immagine — la misura che conta davvero

| pagina | parole | immagini | **parole per immagine** |
|---|---|---|---|
| Obys / Porsche Taycan | 0 | galleria WebGL | **0** |
| by-kin / Dentons | 91 | 35 | **2,6** |
| Basement / Cursor | 89 | 17 | **5,2** |
| Locomotive / Scout Motors | 119 | 20 + 3 video | **5,2** |
| Revelatio / BeUni | 348 | 42 | **8,3** |
| Cuberto / Cisco | 196 | 11 | **17,8** |
| Trionn / 8octa | 155 | 12 | **12,9** |
| Hello Monday / Google Most Searched | 249 | 8 + 4 video | **20,8** |

**Sotto le 6 parole per immagine si vende con l'occhio; sopra le 15 si vende
con l'argomento.** In mezzo non c'e' quasi nessuno.

---

## 3. Cosa raccontano

Cinque cose possibili: il problema del cliente, il processo, la tecnica,
l'esito, la tesi. Chi copre cosa.

| studio | problema | processo | tecnica | **esito misurato** | tesi dichiarata |
|---|---|---|---|---|---|
| by-kin | si' (1 frase) | no | no | **no** | si' (lo standfirst) |
| Locomotive | il mandato, non il problema | no | no | **no (0 su 32)** | il claim |
| Revelatio | **si', due blocchi** | accennato | no | **no** | **si', fra virgolette** |
| Basement | si' | no | no | **si', 3 su 25** | si' (riga finale) |
| Trionn | si' (`The challenge`) | si' (`Approach`) | no | **dichiarato ma non misurato** | si' (tagline) |
| Hello Monday | **si', esteso** | si' | **si', per sezioni** | **no (0 su 45)** | il titolo |
| Cuberto | si' | **si', con durate** | si' | **no**, ma **testimonianza** | no |
| Obys | no | no | no | no | no |

### Quanti mostrano numeri veri: **3 su 122 (2,5%)**

Ho cercato in tutto il corpus qualunque cifra accompagnata da linguaggio di
risultato (`increased`, `conversion`, `growth`, `%`, `K/M/B`, `traffic`).

**Locomotive: 0 pagine su 32. Trionn: 0 su 8.**

**Hello Monday: 6 pagine su 44 hanno un numero — ma sono tutti numeri del
cliente, non del lavoro:**
- D.E. Shaw: *«over 1,200 employees and more than $50 billion in investment»*
- Issuu: *«6 billion (!!) page views monthly and 20,000 new publications added
  every single day»*
- OPPO: *«enhance the lives of over 300 million people worldwide»*
- Fingerspelling: *«2 - 3 out of every 1,000 children born in the US are deaf
  or hard-of-hearing. 90% of these children are born to hearing parents»*

Sono **credibilita' presa in prestito**: servono a dire *«il cliente e'
grosso»*, non *«il nostro lavoro ha funzionato»*.

**Basement: 7 pagine su 25 hanno un numero, e la meta' e' presa in prestito
allo stesso modo** ($2,5 mld di valutazione Cursor; $6,6 mld ElevenLabs; da
$300 M a $3,25 mld Black Forest Labs; $230 M World Labs).
**Ma tre sono esiti veri, attribuiti al lavoro:**

> **Rox** — *«Since launch, the impact has been clear: from 9K active users the
> month before launch to 39K the month after.»*
>
> **Geist** — *«The response has been loud: more than 3.5M downloads just on
> Google Fonts.»*
>
> **Ranboo** — *«...handled 70K+ concurrent users without breaking a sweat.»*

**Questi tre paragrafi sono l'unica prova di efficacia in 122 pagine di
portfolio d'elite.**

### Le due sostituzioni che usano al posto del risultato

**(a) La durata e l'ampiezza del lavoro** — Cuberto. Cisco: *«Our team spent
**10 months** redesigning the platform. We completed the development and design
for **18 system sections**, built a full UI kit...»*. Tre pagine su dieci danno
una durata (`10 months`, `4 months`, `3 months`). Non e' un risultato, ma e'
verificabile e da' la scala dell'impegno.

**(b) La testimonianza firmata** — Cuberto di nuovo, **7 pagine su 10**, con
nome e ruolo veri: Duane Barlow (Principal Engineer, Cisco), Marcos Meson
(Co-Founder e VP Marketing, FlipaClip), Kanad Bahalkar (Founder, Potion),
Andrey Gorsky (CEO, Puntopago), Polina Vorms (Head of Product, Zelt). Due
pagine su dieci firmano solo con un reparto (*«Marketing department of DaoWay»*,
*«Marketing team»*), ed e' visibilmente piu' debole.

> **Cuberto e' l'unico degli otto che mette una voce esterna dentro il caso
> studio.** Costa un'email al cliente e vale piu' di tre schermate di
> fotografie.

### Chi racconta la tecnica

Solo **Hello Monday** spezza il caso studio in sotto-sezioni titolate che
spiegano una decisione alla volta. Su Bearaby: `Logo` (24 parole: *«With its
calm loopy ascenders and repetitive, connected stroke, the Bearaby logo
visualizes the concept of "a good night's sleep"»*) e `Illustrations` (12
parole). Su Google Most Searched: `The Gallery` (20), `Defining American
History` (25), `The Data` (33, con il metodo di selezione dei dati).

**Il blocco `The Data` e' la mossa migliore del gruppo:** spiega *come e' stato
scelto cosa mostrare*. E' l'unico posto in 117 pagine dove uno studio si
espone su un criterio.

**Nessuno degli otto racconta la tecnica di sviluppo.** Zero menzioni di
WebGL, shader, framework, prestazioni in tutte e 122 le pagine. Il caso studio
pubblico e il caso studio tecnico sono due documenti diversi, e il secondo non
esiste. L'unica eccezione parziale e' **Revelatio, che dichiara gli
strumenti** nella riga metadati (`Figma`, `WordPress`) — e sono strumenti di
produzione, non tecniche.

---

## 4. I metadati: chi li mette e come

| campo | by-kin | Locomotive | Revelatio | Basement | Trionn | Hello Monday | Cuberto | Obys |
|---|---|---|---|---|---|---|---|---|
| **cliente** | `client` | `Client` (nei crediti) | nel titolo | **`Client`** | nel titolo | **`Client:`** | H1 | H1 |
| **settore** | `sector` | riga sotto il titolo | riga meta | - | - | - | - | **H2** |
| **anno** | fra parentesi nel titolo | `©2024` | riga meta | **`Year`** | - | - | - | - |
| **servizi / deliverable** | - | `Categories` | **`Deliverables`** (6 voci) | **`Type`** | 4 tag | **`Deliverables:`** | - | **H2** |
| **luogo** | `location` | citta' del cliente | - | - | - | - | - | - |
| **premi** | `awards` (1 riga) | **`Awards (3)`** | - | - | - | - | - | - |
| **link al sito vivo** | - | **due volte** | - | **`Link`** | Dribbble | `Launch project` | - | si' |
| **strumenti usati** | - | - | **`Figma`, `WordPress`** | - | - | - | - | - |
| **ruolo dello studio** | implicito | **esplicito nei crediti** | **esplicito** | *«We partnered with»* | *«TRIONN crafted»* | *«tapped Hello Monday»* | *«Cisco turned to us»* | - |

**Le tre righe di metadati piu' efficienti del gruppo**, per densita':

- **Basement** — `Client: Cursor` · `Year: 2025` · `Type: Websites & Features` ·
  `Link: www.cursor.com`. Quattro campi, quattro parole di valore, sopra la
  piega, identici su tutte e 25 le pagine.
- **Hello Monday** — `Type:` · `Client:` · `Deliverables:` prima ancora del
  titolo. Tre campi.
- **Revelatio** — `Corporate Swag | 2025` piu' gli **strumenti** (`Figma`,
  `WordPress`): l'unico che dichiara con cosa ha lavorato.

**Il ruolo dello studio si dichiara con il verbo, non con un campo.** Nessuno
dei otto ha un campo `Role`. Lo dicono nella frase: *«We were approached to
refine key elements of the brand identity and design...»* (Locomotive),
*«We partnered with Cursor to craft a website»* (Basement), *«Google Brand
Studio tapped Hello Monday to create...»* (Hello Monday).

**I premi li mette solo chi li conta.** Locomotive scrive il numero nel titolo
di sezione — `Awards (3)` — ed elenca premio + ente: `E-Comm. of the Year`
(Awwwards), `Site of the Day` (Awwwards), `Developer award` (Awwwards).
**Su 32 pagine, 23 hanno il blocco premi, per 75 premi totali.** by-kin mette
un campo `awards` con una riga sola. **Gli altri sei non nominano un premio
dentro il caso studio**, nemmeno quando lo hanno vinto.

---

## 5. Come finisce la pagina

| studio | ultimo blocco | invito |
|---|---|---|
| **by-kin** | `BACK` → **`want to work with us? Get in contact`** | **si', diretto** |
| Locomotive | `Next Project` + `Scroll Down↓` con anno, settore, citta' | no |
| **Revelatio** | 3 stadi (vedi sotto) | **si', a tre porte** |
| Basement | 2 progetti + **iscrizione alla newsletter** (`Roll Me In`) | debole |
| **Trionn** | **modulo di contatto completo** dentro il caso studio | **si', con qualifica** |
| Hello Monday | 3 progetti correlati + **piede a 4 porte** | si', nel piede |
| Cuberto | `Next project` | no |
| Obys | niente: la pagina non scorre oltre | solo la mail |

**Il finale di by-kin e' il piu' forte del gruppo, e non per il testo.**
Sono otto parole — *«want to work with us? Get in contact»* — ma arrivano dopo
undici schermate di silenzio assoluto. **Il silenzio prolungato rende sonora
la domanda finale.**

**Revelatio chiude a tre stadi**, ed e' lo schema piu' completo:
1. `Want to see more work?` → due progetti con una riga di descrizione ciascuno
2. `Want to talk about a project?` → **una persona con nome, ruolo e faccia**:
   Arthur Galvao, Co-founder & CBO
3. `Let's build something together` → tre porte: `Get a quote` / `Join our team`
   / `Just say hello`

**Trionn e' l'unico che mette il modulo intero in fondo a ogni caso studio**, e
il modulo qualifica: campo servizio (7 voci) e **fasce di budget visibili**
(`Under $5K` / `$5K-$15K` / `$15K-$30K` / `$30K-$60K` / `$60K+` / `Not sure
yet`), piu' *«we usually reply within one business day»* e un `Book a
30-minute call`. Chi ha appena finito di leggere un caso studio e' esattamente
la persona a cui chiedere il budget.

**Basement sostituisce l'invito con la newsletter** (*«Ready to tap into the
basement vibe?»* → `Roll Me In`). E' l'unico spreco strutturale del gruppo:
il visitatore piu' caldo del sito viene mandato in una lista email.

---

## 6. Chi cita i collaboratori e chi si prende tutto il merito

**Due studi su otto mettono i crediti. Sei non ne mettono nessuno.**

**Locomotive** — 8 ruoli, 10 nomi propri:
`Client` · `Creative Director` (Dust Leblanc) · `Art director` (Bastien Allard)
· `Technical Director` (Mathieu Ducharme) · `Front-end Developer` (Arnaud
Pinot, Jeremy Minie, Lucas Bigot) · **`Back-end Developer: Scout Motors`** ·
`Account Director` (Jean-Francois Chaine) · `Project manager` (Karine Legault
Mallette).

> **Il dettaglio da rubare: dichiarano che il back-end l'ha fatto il cliente.**
> Ammettere il confine del proprio lavoro rende credibile tutto il resto della
> lista.

**Revelatio** — 11 righe, e **cita lo studio partner per primo, prima di se
stesso**:
`Studios Partnership: Leone Brands (Brand, Verbal, Visual Identity and Motion)
& Revelatio Studio (Brand Architecture and Website)`. Poi Brand Creative
Direction, Research & Brand Strategy, Visual Identity, Brand Architecture,
Motion Graphics, Promotional Video Script, **Voiceover** (Thais Dutra), Website
Creative Direction, Web Design, Development. Tutti con nome e cognome.

**Chi si prende tutto il merito:** by-kin, Basement, Trionn, Hello Monday,
Cuberto, Obys. Zero crediti, zero freelance nominati, zero studi partner —
anche quando il lavoro e' evidentemente diviso (Basement fa `Visual Branding` +
`Marketing Execution` + `Websites & Features` sulla stessa pagina Harvey, senza
dire chi).

**Chi si prende tutto il merito ha sempre l'`About` piu' aggressivo.** Chi
divide il merito (Locomotive, Revelatio) e' anche l'unico che si prende la
briga di scrivere la struttura completa Contesto → Sfida → Soluzione. Non e'
una coincidenza: **chi ha un processo vero ha anche una squadra da nominare.**

---

## 7. Il modello da copiare

Schema di un caso studio che un'agenzia puo' riempire domani. **Totale: 380-450
parole**, cioe' fra Trionn e Cuberto — sopra la scheda muta (che funziona solo
con un portfolio da premio gia' fatto) e sotto l'articolo di Hello Monday (che
costa una giornata di scrittura per pagina).

| # | blocco | **parole** | modello | preso da |
|---|---|---|---|---|
| 1 | **Copertina** a piena pagina, un'immagine sola, nessun testo sopra | **0** | — | tutti |
| 2 | **Titolo-tesi**: cliente + cosa hai cambiato, in una riga | **8-12** | *«BeUni — Branding Latin America's first end-to-end platform for personalized corporate gifting.»* | Revelatio |
| 3 | **Riga metadati**, 5 campi in una riga sola, sopra la piega | **10-14** | `Cliente` · `Anno` · `Settore` · `Servizi` (3-6 voci) · `Sito ↗` | Basement + Hello Monday |
| 4 | **Contesto**: il mercato del cliente e perche' esiste. Nomina i *suoi* clienti | **80-95** | *«...With clients like iFood, Grupo Boticario, and Contabilizei already in their portfolio, the product had proven itself.»* | Revelatio |
| 5 | **Sfida**: la tensione, con le due strade sbagliate | **85-100** | *«too corporate and it loses the energy...; too playful and it fails to earn trust at the enterprise level»* | Revelatio |
| 6 | **Soluzione**: la piattaforma **fra virgolette** + cosa avete costruito | **120-140** | *«The strategic anchor was a reframe: "Think Inside the Box."»* | Revelatio |
| 7 | **Galleria muta**: 8-14 immagini a piena larghezza, **nessuna parola** | **0** | 5-8 schermate consecutive | by-kin |
| 8 | **2-3 sotto-sezioni titolate**, una decisione ciascuna | **20-35 l'una** | `Il logo` / `Le illustrazioni` / **`I dati`** | Hello Monday |
| 9 | **Ampiezza del lavoro**: durata e conteggio | **12-20** | *«10 mesi, 18 sezioni di sistema, un UI kit completo»* | Cuberto |
| 10 | **Esito con un numero vero** | **20-30** | *«from 9K active users the month before launch to 39K the month after»* | **Basement / Rox** |
| 11 | **Testimonianza firmata**: nome, ruolo, azienda | **35-45** | Duane Barlow, Principal Engineer | Cuberto |
| 12 | **Premi**, con il numero nel titolo | **8-12** | `Premi (3)` + premio ed ente per riga | Locomotive |
| 13 | **Crediti**: ruolo → nome, **incluso cio' che ha fatto il cliente** | **30-60** | `Back-end Developer: Scout Motors` | Locomotive + Revelatio |
| 14 | **Progetto successivo**: 1-2, con anno, settore e una riga | **25-55** | — | Locomotive / Revelatio |
| 15 | **Chiusura**: una persona con nome e faccia + 2-3 porte | **20-30** | `Chiedi un preventivo` / `Lavora con noi` / `Scrivici e basta` | Revelatio |

### Le sei regole che escono dai numeri

1. **Metti i metadati sopra la piega, non in fondo.** Basement e Hello Monday
   li mettono prima del titolo. by-kin li mette dopo undici schermate: chi non
   scorre non sa nemmeno chi e' il cliente.
2. **Il blocco 10 vale piu' dei blocchi 1-9 messi insieme.** Su 122 pagine
   d'elite ce ne sono **tre** con un esito misurato. E' il vantaggio piu'
   economico che esista: nessuno lo occupa.
3. **La testimonianza dev'essere firmata da una persona.** *«Marketing
   department of DaoWay»* vale la meta' di *«Andrey Gorsky, CEO»*, e lo si vede
   leggendo le due pagine di Cuberto una dopo l'altra.
4. **La galleria muta funziona solo se e' lunga.** Cinque immagini sono una
   pausa; dodici sono una dichiarazione. Il finale di by-kin funziona perche'
   il silenzio dura undici schermate.
5. **Cita i collaboratori, e cita anche cio' che NON hai fatto tu.** E' l'unica
   mossa del gruppo che aumenta la credibilita' togliendosi del merito.
6. **La pagina finisce con una persona, non con un modulo.** Revelatio mette
   Arthur Galvao con nome, ruolo e foto prima delle tre porte. Trionn mette il
   modulo con le fasce di budget — funziona, ma qualifica invece di sedurre.
   Il migliore le fa entrambe.

### La regola che vale per tutte e tre le famiglie

**Il caso studio non deve dimostrare che sai fare siti: quello lo dimostrano le
immagini da sole.** Deve dimostrare che **hai capito un'azienda**. Contesto e
Sfida — 180 parole in tutto — sono i due blocchi che nessuno degli studi
"muti" scrive, e sono gli unici che un cliente puo' riconoscere come **il
proprio problema**.

---

## Fonti

Tutte le pagine scaricate con `curl` fra il 12 e il 13 agosto 2026.

- `https://by-kin.com/work/dentons` — 253.752 byte
- `https://locomotive.ca/en/work/scout-motors` + le altre 31 di `/en/work/`
- `https://revelatio.studio/project/beuni`
- `https://basement.studio/showcase/` — 25 pagine, incluse
  `cursor-ai-powered-growth`, `rox-designed-to-drive-growth`,
  `geist-strengthening-vercels-visual-identity`,
  `ranboo-one-merch-drop-at-a-time`, `harvey-from-seed-to-series-d`
- `https://trionn.com/work/8octa` + 7 altre (`One.Dot`, `crowd-mouth`, `dfz`,
  `domus`, `enterra-ai`, `finora`, `first-ground-coffee`)
- `https://www.hellomonday.com/work/` — 44 pagine, incluse `bearaby`,
  `google-most-searched`, `nomo`, `issuu`, `deshaw`, `oppo`, `fingerspelling`
- `https://cuberto.com/projects/` — 10 pagine (`cisco`, `daoway`, `find`,
  `flipaclip`, `potion`, `puntopago`, `qvino`, `riyadh`, `sca`, `zelt`)
- `https://obys.agency/work/porsche-taycan` + payload `__SEED__` decodificato

Da leggere insieme a `_COME-SI-VENDE.md` (prezzi, moduli, prove) e
`_PATTERN.md`.
