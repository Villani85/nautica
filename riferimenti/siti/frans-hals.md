# Frans Hals Museum

- **URL**: `https://www.franshalsmuseum.nl`
  - **ATTENZIONE, come per Simply Chocolate e Star Atlas: il sito premiato NON
    esiste piu'.** Oggi lo stesso dominio (redirect 307 da `www.` a
    `franshalsmuseum.nl`) serve un sito **Next.js su Vercel** costruito su una
    piattaforma condivisa fra musei olandesi. Non ha nulla in comune con quello
    del 2018: ne' impianto, ne' colori, ne' caratteri, ne' funzioni.
  - Versione premiata, letta dall'Internet Archive:
    `https://web.archive.org/web/20181116044555/https://www.franshalsmuseum.nl/en/`
    (16 novembre 2018) piu' una quindicina di pagine interne fra aprile 2018 e
    luglio 2019.
  - Versione attuale letta il 13/08/2026 direttamente da `curl`.
- **Premio**:
  - **Awwwards Site of the Year 2018.** Confermato: nell'elenco ufficiale dei
    Sites of the Year, il 2018 ha quattro nomi — *Orano, koox, **Frans Hals
    Museum**, Active Theory v4*.
    Fonte: https://www.awwwards.com/websites/sites_of_the_year/
  - **Awwwards Site of the Day 17 aprile 2018** — voto **7.94/10**
    (design 8.22, usabilita' 7.62, creativita' 7.95, contenuto 7.75).
    Voto della comunita' Pro/Chief: 8.30.
    Fonte: https://www.awwwards.com/sites/franshals-museum
  - **Developer Award 7.01/10**, ed e' la parte interessante:
    semantica/SEO 6.50, animazioni 8.00, **accessibilita' 5.50**, WPO 7.25,
    responsive 7.50, markup/metadati 6.75. Il sito piu' istituzionale della
    ricerca e' anche quello con il voto di accessibilita' piu' basso. Ci torno.
  - Il museo ha pubblicato una notizia intitolata *"Museum nominated for
    prestigious Webby Award"*
    (`/en/news/museum-nominated-for-prestigious-webby-award/`). Ho letto il
    titolo, non il corpo: `non verificato` in quale categoria e con che esito.
- **Studio**: **Build in Amsterdam**. Dal colophon del sito stesso:
  - *Design and technical realization* — **Build in Amsterdam**
  - *Identity design* — **KesselsKramer** (l'agenzia che ha fatto l'identita' del
    museo; il sito la mette in pratica, non la inventa)
  - *Online ticketing system* — **Global Tickets**
  - *Texts* — Frans Hals Museum, Annelieke van Halen, Chris Muyres
  - *Translation* — Julia Gorodecky, Alexander Mayhew, Lynne Richards
  - *Photography* — Maarten Nauw (eventi), Gert Jan van Rooij (mostre)
  - Fonte: `/en/colophon/`, snapshot 20190415124311.
  - **Nota**: nel 2026 Build in Amsterdam ha **tolto il caso dal proprio sito**.
    Nessuna pagina `frans-hals` fra i loro casi, ne' oggi ne' negli snapshot
    2023-2024 dell'archivio. Il Site of the Year non c'e' piu' nemmeno nel
    portfolio di chi l'ha vinto.
- **Anno**: 2018. La data non e' un dettaglio: il **29 marzo 2018** il Frans Hals
  Museum "sposa" De Hallen Haarlem e diventa *un museo, due sedi*. Il sito e'
  **lo strumento con cui si annuncia la fusione**, ed e' online da tre settimane
  quando vince il Site of the Day. Dalla `meta description` del 2018: *"One
  museum, two locations. On 29 March 2018, the Frans Hals Museum, with its
  outstanding collection of Old Masters, 'marries' De Hallen Haarlem, the museum
  for contemporary and modern art in Haarlem."*
- **Letto il**: 13/08/2026
- **Come l'ho letto**: solo `curl`. **Nessuna scheda di browser aperta.**
  Materiale scaricato e letto a mano:
  - `w2018_home_en.html` — 355.373 byte, home inglese di novembre 2018
  - `app.min.css` — **3.189.567 byte** (513.075 gzip)
  - `app.min.js` — **2.651.701 byte** (716.831 gzip)
  - il kit tipografico Monotype `fast.fonts.net/cssapi/bc11e4ab-...css`
  - 9 pagine interne: my-trip, calendar, visitor-info, accessibility,
    collection, colophon, event, hals-around-the-world, una scheda opera
  - l'indice completo delle URL archiviate (`cdx`), 560 pagine inglesi
  - la scheda Awwwards e l'elenco dei Sites of the Year
  - la home, la pagina visita e i credits del sito **attuale**

---

## Cosa tratta il sito

Un museo civico olandese a Haarlem, venti minuti da Amsterdam. Dentro ci sono
**due cose che normalmente stanno in due musei diversi**, e il sito esiste
proprio per tenerle insieme:

1. **I maestri antichi.** La piu' grande raccolta al mondo di Frans Hals — i
   grandi ritratti di gruppo delle guardie civiche (*Banquet of the Officers of
   the St George Civic Guard*), le reggenti dell'ospizio dei vecchi, la Malle
   Babbe — piu' Judith Leyster, Jan Steen, Jacob van Ruisdael, Pieter Claesz,
   Cornelis van Haarlem. Sede **Hof**, Groot Heiligland 62.
2. **L'arte contemporanea.** Nicole Eisenman, Tracey Emin, Lubaina Himid,
   Marianna Simnett, Gillian Wearing, Fiona Tan, Erik van Lieshout, Cecile B.
   Evans. Sede **Hal**, Grote Markt 16, a sette minuti a piedi.

Sopra ci sono le funzioni vere di un museo che deve campare: orari delle due
sedi, listino biglietti, calendario di mostre ed eventi, programmi per le
scuole, visite guidate, accessibilita' e parcheggi, affitto degli spazi, negozio
e caffe', ricerca e pubblicazioni, donazioni e tessere di sostegno, richiesta di
prestito delle opere, ufficio stampa.

E sotto — o meglio, *sopra*, come strato che si apre da un pulsante — ci sono
**tre giochi**: una roulette, un generatore di GIF e un Tinder degli artisti.

Questo e' il punto della scheda. Non e' un portfolio di studio creativo dove
l'unica funzione e' `Contact`. E' un cliente con un **listino, un calendario,
degli orari e degli obblighi di legge**, che ha comunque vinto il premio piu'
alto dell'anno.

## Cosa vende, e qual e' l'obiettivo finale

**Vende un biglietto da 16 euro per un pomeriggio a Haarlem.** Non "arte", non
"cultura": una gita.

Il listino, testuale dalla pagina `/en/visit/visitor-info/` (2019):

| voce | prezzo |
|---|---|
| Adults | **€16.00** |
| Groups from 10 p. | €13.00 |
| CJP / Youth 19 - 24 | €8.00 |
| Youth under 19 | **free** |
| Museumcard | free |
| IAmsterdam Card | free |
| Holland Pass | free |
| ICOM Card | free |
| BankGiro Loterij kaart | free |
| Friends of the museum | free |
| Rembrandtkaart | free |
| HaarlemPas | free |

Undici righe su dodici sono "gratis". E' il ritratto esatto del museo olandese:
la maggioranza dei visitatori entra con una tessera, quindi **il sito non deve
tanto incassare 16 euro quanto convincere qualcuno a mettersi il cappotto**. La
metrica vera non e' il carrello, e' la visita.

**L'obiettivo finale, in ordine di importanza commerciale:**

1. **Far venire fisicamente qualcuno a Haarlem**, in una data precisa. Tutto il
   sito e' costruito attorno a un oggetto solo: **il viaggio** (*trip*).
2. **Far capire che i due musei sono uno solo.** E' il problema di
   comunicazione che ha pagato il progetto. Nel 2018 mezza Haarlem chiamava
   ancora "De Hallen" la sede Hal. Il sito ripete *One museum, two locations*
   nel piede di ogni pagina, nel pannello degli orari, nella descrizione SEO.
3. **Vendere il biglietto online**, verso `tickets.franshalsmuseum.nl`
   (Global Tickets), che e' un dominio esterno: il sito **non ha checkout
   proprio**.
4. **Farsi ricordare come un museo che non e' polveroso.** E' l'obiettivo
   dichiarato dal briefing: sull'Awwwards lo studio scrive *"The Frans Hals
   Museum and KesselsKramer commissioned us to create a platform that reflects
   the **contemporary and classic duality** of the Museum."*

**L'obiettivo dichiarato e quello vero non coincidono in un punto solo**, ed e'
onesto dirlo: i tre giochi non servono a vendere niente. Servono a vincere il
premio e a farsi condividere. Lo studio stesso lo ammette senza pudore nella
descrizione del progetto: *"Protip: Play all games in the 'play' section :)"* —
cioe' *giuria, guarda qui*. Nel sito sono nascosti dietro un pulsantino tondo in
alto a destra, non hanno una voce di menu, e in un pomeriggio di navigazione
normale non li apri mai.

## A chi

Tre compratori diversi, e il sito li tratta diversamente. Lo si vede in modo
letterale: il calendario si filtra **per tipo di persona**, con cinque voci —
`Child`, `Creative`, `Local`, `Friend`, `Tourist`.

1. **Il turista** (probabilmente ad Amsterdam per tre giorni). Non sa chi e'
   Frans Hals. Deve capire in trenta secondi: dov'e', quanto costa, e' aperto
   oggi, quanto ci vuole. Teme di perdere mezza giornata per niente e di
   arrivare a porte chiuse.
2. **Il locale / l'olandese con la Museumkaart.** Entra gratis, quindi non deve
   essere convinto a pagare ma a **tornare**: per lui contano le mostre nuove,
   gli eventi, le conferenze. Teme di aver gia' visto tutto.
3. **La famiglia con bambini.** Sotto i 19 anni e' gratis. Teme la noia dei
   figli. Per lei ci sono i programmi educativi, le visite guidate e — questa e'
   la parte furba — i giochi.

Piu' due compratori istituzionali che portano i soldi grossi e che il sito serve
senza cerimonie: **gruppi e tour operator** (tariffa a 13 euro, pagina
dedicata), e **sponsor, patroni, mecenati** (`Patrons`, `Memberships`, `Donate`,
con quattro livelli di tessera: *Friends, Beminnaers, Roemers, American
Friends*).

**Cosa deve pensare uscendo**: *questo museo e' vivo, non e' un deposito. Vale
un pomeriggio, e so gia' che pomeriggio.*

## L'esperienza progettata

**Non e' un racconto e non e' una vetrina. E' una scrivania.**

Questa e' la differenza piu' utile fra il Frans Hals e tutti gli altri siti
premiati della ricerca. Lusion, Igloo, Active Theory progettano un *percorso*:
tu scorri, loro raccontano, alla fine c'e' un modulo. Qui non c'e' nessun
percorso obbligato. C'e' una **stanza di lavoro** dove tutti gli attrezzi sono
sempre a portata di mano, e tu prendi quello che ti serve.

Gli attrezzi sono **sei icone su una barra nera** sempre presente, in ogni
pagina del sito, che sul desktop e' una colonna verticale larga `4vw` alta
`100vh` e sul telefono e' una barra in basso alta `12vw`. Ogni icona ha il suo
`data-tooltip`, testuale:

| icona | tooltip | cosa fa |
|---|---|---|
| calendario | `view calendar` | apre un pannello con le mostre in corso, ognuna con la sua data e il pulsante "aggiungi al viaggio" |
| valigia | `book a trip` | apre **il tuo viaggio**: cosa hai messo dentro, quante attivita', quante ore |
| biglietto | `buy tickets` | non apre niente: porta fuori, su `tickets.franshalsmuseum.nl` |
| lente | `search` | apre la ricerca |
| pin | `view location` | apre le due sedi con indirizzo e `Get Directions` |
| orologio | `opening hours` | apre gli orari, **con lo stato di oggi calcolato** |

Cinque pannelli che scivolano dentro senza mai cambiare pagina, piu' un link
esterno. **Questo e' il sito.** Il resto — le mostre, la collezione, la ricerca,
le pubblicazioni — e' contenuto che si consuma dentro quella cornice.

**La cosa che il visitatore deve FARE, passo per passo:**

1. Arriva e vede una parola gigante (`Welcome`) e sotto una frase che ruota:
   quattro messaggi che si alternano da soli, fra citazioni di giornale e
   avvisi di servizio.
2. Sotto la parola c'e' **un solo pulsante nero**: `Buy tickets`.
3. Scorre e trova le mostre in corso, ognuna una scheda con una foto quadrata,
   le date, e **un pulsantino "+" in un angolo**.
4. Clicca il "+". La scheda si segna con una spunta, e **il pannello del viaggio
   si apre da solo da destra** mostrando cosa ha appena messo dentro.
5. Ripete su altre due o tre mostre. Il pannello somma: `3 Activities`,
   `Duration ± 3 Hours`.
6. Apre il viaggio e trova: *"We organised your trip. My unique url: [link]
   Copy link. Here is your personalised roadmap. We advised you to keep this
   link and open it on your mobile phone when heading to the Frans Hals
   Museum!"*
7. **Si copia il link e se lo manda sul telefono.** Fine del percorso.
8. Compra il biglietto — che pero' avviene altrove, su un dominio esterno.

**L'immagine che resta in testa**: due mezze parole giganti che si incontrano
al centro dello schermo, su un fondo giallo canarino.

## Come e' organizzata la persuasione

Qui il sito e' molto piu' interessante di quanto sembri, perche' **la promessa e
la prova sono affidate a due voci diverse che si alternano nello stesso posto.**

**Dove sta la promessa** — nella prima schermata, e ha **una parola sola**. Il
titolo della home nel novembre 2018 e' `Welcome`. Non "Il piu' grande museo di
Frans Hals al mondo". Una parola, alta 260px, che occupa tutta la larghezza.

**Dove sta la prova** — subito sotto, nella stessa schermata, in un carosello
che gira da solo. Ecco i quattro messaggi in rotazione, testuali:

1. *"How extensive the Hals-mania was, is brilliantly on display in Frans Hals
   and the Moderns."* **NRC****
2. *Now open: Frans Hals and the Moderns! Hals meets Manet, Singer Sargent, Van
   Gogh*
3. *Please note: on 24 and 25 November, location HOF (Frans Hals and the
   Moderns) is only opened for BankGiro Loterij VIP-cardholders*
4. *"[the paintings] ... prove the influence of Hals on the artistic turnaround
   in the 19th-centrury. The museum tells this story in a convincing way."*
   **Trouw****

**Guardate cosa hanno fatto.** Nello stesso carosello, allo stesso corpo, con lo
stesso peso, ci sono: due recensioni a quattro stelle di giornali nazionali (la
prova sociale), un annuncio commerciale (la promessa), e **un avviso di
chiusura parziale per due giorni specifici** (il servizio). Non hanno tre
componenti diverse per tre tipi di messaggio: ne hanno **una sola, che il
comunicatore del museo riempie ogni settimana**. E' la scelta di progetto piu'
matura di tutto il sito, e costa un decimo di quello che costerebbe farlo
"bene".

**Dove sta il prezzo** — a due clic, mai nella pagina che si sfoglia. Il pulsante
`Buy tickets` e' presente ovunque (nel primo schermo, nell'icona fissa della
barra, su ogni scheda mostra), ma **il numero "16 euro" compare solo dentro
`/en/visit/visitor-info/`**. Il sito non discute mai il prezzo: lo tratta come
un dato amministrativo. Con undici categorie gratuite su dodici, e' la scelta
giusta.

**Dove sta la chiamata all'azione** — ce ne sono **due, e sono in competizione**,
e questa e' la cosa piu' istruttiva del progetto:

- `Buy tickets` — nero su giallo, nel primo schermo, prima di qualunque scroll.
- `add to trip` — il "+" sulle schede, che **non porta a nessuna cassa**.

Due imbuti paralleli: uno che vende oggi, uno che prepara. Il secondo e' molto
piu' curato del primo. E il primo, quello che incassa davvero, **e' un link
esterno con `target="_blank"`**.

**Quante schermate per arrivarci**: zero. Il pulsante `Buy tickets` e' sopra la
piega, dentro il primo schermo, senza scroll.

**Cosa arriva a chi NON scorre — cioe' alla maggioranza.** Qui il sito e'
eccellente, e per una ragione strutturale: **la barra nera dei sei attrezzi non
e' contenuto della pagina, e' cornice.** Chi apre la home e non tocca la rotella
vede comunque, tutto insieme:

- la parola `Welcome`
- una frase che gira (e quindi, entro dieci secondi, sia una recensione sia
  l'annuncio della mostra in corso)
- il pulsante nero `Buy tickets`
- **le sei icone**, cioe' calendario, viaggio, biglietti, ricerca, sedi, orari

E se clicca l'orologio, il pannello risponde con lo stato di oggi calcolato dal
server, testuale: `Open Today!` / `We are waiting for you!` oppure `Closed
Today` / `Sorry, we are closed today!` — e in quel secondo caso il pannello
propone da solo l'alternativa: **`Plan a trip instead`**.

Un museo chiuso che, invece di dire "chiuso", dice *"allora pianifica"*. E' la
riga piu' commerciale del sito ed e' scritta in un pannello di servizio.

## Idea regista

**Ogni pagina e' una stanza dipinta di un colore, e ogni cosa che apri o chiudi
e' una tenda che si tira: due meta' che si incontrano al centro, mai una
dissolvenza.**

## Il momento

**Il titolo che si ricompone al centro dello schermo.**

Non e' legato allo scroll: cade **all'ingresso di ogni pagina**, subito dopo la
tenda. Ecco la meccanica esatta, letta nel CSS.

L'`<h1>` contiene la stessa parola **tre volte**:

```html
<h1 class="home-hero__title" data-component="fittext" data-lines="1">
    <div class="original-title js-original-title">Welcome</div>
    <span class="home-hero__title--half"><span class="js-page-title">Welcome</span></span>
    <span class="home-hero__title--half"><span class="js-page-title">Welcome</span></span>
</h1>
```

La prima copia e' `visibility: hidden` e serve solo a occupare lo spazio giusto.
Le altre due sono due fasce `height: 50%` con `overflow: hidden`, sovrapposte
alla prima: una taglia la parola a meta' altezza e mostra **solo la meta'
superiore delle lettere**, l'altra **solo la meta' inferiore**.

Poi:

- la meta' superiore parte da `translateY(150%)` — cioe' sale dal basso
- la meta' inferiore parte da `translateY(-150%)` — cioe' scende dall'alto
- entrambe tornano a `transform: none` in **0,75 s**, curva
  `cubic-bezier(1, 0, 0, 1)`

Quella curva e' quasi un gradino: ferma, poi tutto in mezzo, poi ferma. Le due
meta' delle lettere si **incontrano sulla linea mediana** e la parola si salda.
Sotto, con `0,25 s` di ritardo, il sottotitolo sale di un quarto della sua
altezza e va da opaco a visibile in `0,75 s`.

E' lo stesso identico congegno usato sui titoli di sezione (`.page-header__title`
con `page-header__half--top` e `--bottom`) e sulle schermate dei giochi. Una
meccanica sola, riusata dieci volte.

**Il secondo momento, quello che nessuno progetta e che qui hanno progettato**:
se **ridimensioni la finestra** del browser, cala una tenda con una frase presa
a caso da questa lista, che ho letto nel codice sorgente:

```js
resizeTexts: ["Repainting artworks",
              "Researching new layouts",
              "Choosing new font sizes",
              "Mixing new colors"]
```

Il sito, mentre ricalcola il layout, ti dice che **sta ridipingendo i quadri**.
Zero valore commerciale, costo di sviluppo vicino a zero, ed e' la cosa che chi
lo visita racconta agli altri.

## Struttura, sezione per sezione

**Premessa**: non e' un sito che scorre. E' una **applicazione a pagine** (rotte
Backbone su WordPress), quindi la colonna "quanto dura" e' indicativa: sono
schermate di una pagina, non tappe di un unico scroll.

### La cornice, presente su OGNI pagina

| sezione | cosa mostra | cosa fa l'utente | quanto dura |
|---|---|---|---|
| Barra attrezzi (`quicklinks-menu`) | 6 icone: calendario, viaggio, biglietti, ricerca, sedi, orari. Fondo `#231f20`, icone `#fce373` | clicca | colonna `4vw` a sinistra su desktop, barra in basso `12vw` su telefono |
| Pannello Calendario | `Calendar` / `See what's going on today` + schede mostra con date, luogo, "+" | scorre le schede, aggiunge al viaggio | pannello a scomparsa |
| Pannello Viaggio | `Your trip` / `Looks like you'll have fun!` + conteggio attivita' e ore | rimuove, apre la pagina viaggio | pannello |
| Pannello Sedi | `Locations And hours` / `One museum two locations` + i due indirizzi | `Get Directions` | pannello |
| Pannello Orari | `Our opening hours` + stato di oggi + `special holiday hours` + `Plan a trip instead` | legge, clicca l'alternativa | pannello |
| Pannello Ricerca | campo + risultati | digita | pannello |
| Menu principale (`header`) | **in basso**, non in alto: 4 voci con tendina colorata | passa sopra | fisso a `bottom: 12vw` (8vw da 768px) |
| Pulsante Play | cerchio in alto a destra, apre i tre giochi | clicca | sovrapposizione a tutto schermo |
| Piede | newsletter, Instagram, due indirizzi, 7 link di servizio | — | fondo `#fce373` |

Il **menu principale** ha quattro voci, ognuna con la sua tendina di un colore
diverso, e ogni sottovoce ha un titolo e un sottotitolo. Testuale:

| voce | sottovoci (titolo — sottotitolo) |
|---|---|
| **Visit** | Visitor Info — *groups & tours* / Calendar — *exhibitions & events* / Tickets — *buy online* |
| **Discover** | Collection — *explore our artworks* / Our buildings — *past, present & future* / New — *what's new* / About — *more about us* |
| **Learn** | Education — *school programmes* / Publications — *books & magazines* / Frans Hals — *life & work* / Research — *knowledge centre* |
| **Support** | Patrons — *funds & sponsors* / Memberships — *friends & patrons* / Donate — *make a gift* |

Quattro verbi. Nessun sostantivo. E il quarto verbo, `Support`, e' li' perche'
un museo civico campa di quello.

### La home

| sezione | cosa mostra | cosa fa l'utente | quanto dura |
|---|---|---|---|
| Preloader | tenda in due meta': sopra `Meet at` + meta' alta del logotipo `FRANS HALS`, sotto meta' bassa + `Haarlem`. Fondo `#cca69a` | aspetta | ~1,5 s |
| Eroe | fondo `#fce373`. `Welcome` gigante + carosello di 4 messaggi + `Buy tickets` nero | clicca o scorre | 1 schermata |
| Mostre in evidenza | fondo `#cca69a`. Schede quadrate con foto, date, "+" ; pulsante `All exhibitions` | aggiunge al viaggio | 1-2 schermate |
| Nuovo | `Explore museum highlights and more` — notizie con data | legge | 1 schermata |
| Instagram | `Instagram highlights` / `Look at our pictures` — 8 post con conteggio like e didascalia vera | clicca | 1 schermata |
| Newsletter | `Frans likes to send you emails` — nome, email, scelta delle liste | compila | mezza schermata |
| Piede | due sedi, 7 link, loghi sponsor | — | 1 schermata |

### Le pagine funzionali (il vero valore per un cliente italiano)

| pagina | cosa mostra |
|---|---|
| `/visit/visitor-info/` | listino 12 righe, orari delle due sedi, festivita' una per una, `Our two locations – Hal and Hof – are a **7-minute scenic walk** from each other`, regole sulle foto, condizioni di visita |
| `/visit/visitor-info/accessibility/` | a piedi (minuti dalla stazione, strada per strada), autobus con i numeri di linea, parcheggi con i nomi, disabili: parcheggio gratuito, sedie a rotelle disponibili **con il numero di telefono da chiamare** |
| `/visit/calendar/` | tutto il programma, filtrato per **What** (All / Exhibition / Event / Collection), **When** (2000→2022, un anno per bottone), **Who** (Child / Creative / Local / Friend / Tourist) |
| `/discover/collection/` | la collezione, filtrata per **Colour**, **Period**, **Medium**, **Artist**, **Search** e **Random** |
| `/my-trip/` | il viaggio salvato, con URL condivisibile |
| `/en/art/<opera>/` | scheda opera: titolo, autore, zoom, e un modulo `Request High resolution` |
| `/learn/frans-hals/hals-around-the-world/` | mappa Mapbox dei quadri di Hals sparsi per il mondo |
| `/faq/`, `/press/`, `/terms/`, `/colophon/`, `/curators/` | le pagine noiose, che ci sono tutte |

**La collezione filtrata per colore** merita una riga a parte. Le opzioni sono
undici bottoni: `Black, White, Grey, Blue, Green, Yellow, Orange, Red, Pink,
Brown, Purple`. E i tag della collezione sono: `animals, cats, faces, flowers,
food, landscape, nudes, weird`.

Un museo di maestri fiamminghi che ti lascia cercare **"gatti"** e **"strano"**
nella propria collezione. Questo, non la roulette, e' il vero *"contemporary and
classic duality"* del briefing.

### I giochi (`play-section`)

Non sono pagine: sono **tre sovrapposizioni presenti nel markup di ogni pagina
del sito**, chiuse, che si aprono dal pulsante tondo. Ognuna ha un `data-url`
proprio per la condivisione e uno schema a passi (`step-1` → `step-4`).

| gioco | URL di condivisione | passi | meccanica |
|---|---|---|---|
| **Art roulette** — *Spin to win* | `/en/play/roulette/` | 4 | tre fasce di quadri che girano; puoi **bloccare** (`lock`) la fascia alta o bassa e rilanciare le altre. Canvas `#play-canvas` 800x800 per generare l'immagine da condividere |
| **GIF me Frans** — *And gif him now!* | `/en/play/gif/` | 3 | due meta' di GIF (sopra e sotto) che girano indipendenti; **cursore personalizzato**; si compone un mostro a meta' fra due dipinti |
| **Meet your artist** — *Find your artistic match!* | `/en/play/tinder/` | 4 | **Tinder degli artisti**: schede tonde trascinabili a destra/sinistra, `Like` / `Dislike` |

Il Tinder e' quello scritto meglio. Testi veri, in ordine di apparizione:

- `Drag & drop if you like or dislike it`
- `Go on! Drag me around!`
- `Are you sure?!`
- `I don't like him aswell` (il refuso e' nell'originale)
- `He doesn't like you I'm afraid`
- `It's a match!` → *"You and [nome] have liked each other. **Meet at Frans
  Hals!**"*
- `No matches!` → *"I don't think you're ready for this jelly"* → `Play again`

Il museo che ti dice *"non credo tu sia pronto per questa gelatina"* citando
Beyonce'. Gli artisti in mazzo sono cinque, mescolati apposta: **Frans Hals,
Koos Breukel, Jan van Scorel, Guido van der Werve, Maerten van Heemskerck** —
tre del Cinque-Seicento e due viventi, indistinguibili nella pila. La fusione
dei due musei, spiegata con uno swipe.

Ogni scheda porta il proprio `data-colorset`, per esempio:

```html
<div class="tinder-card" data-colorset='{"bottom": "rgb(111,171,158)", "top": "rgb(248,181,184)"}'
     data-url="..." data-text="Meet at FransHals">
```

Cioe' **ogni artista possiede due colori**, e quando la sua scheda arriva in cima
alla pila lo schermo — diviso in due fasce, `play-section--upper` e
`play-section--lower` — si ridipinge con i suoi.

## L'esperienza in ordine di tempo

### I primi dieci secondi, desktop, novembre 2018

- **0,0 s** — Schermo pieno color **`#cca69a`** (un rosa-terra, colore da
  fondale di ritratto). E' il colore di `html`, quindi c'e' prima ancora che
  arrivi il CSS.
- **0,0-0,8 s** — La tenda del preloader e' in due meta' orizzontali. Sopra:
  una foto tagliata e la scritta **`Meet at`** seguita dalla **meta' superiore
  del logotipo `FRANS HALS`** disegnato in SVG. Sotto: la **meta' inferiore
  dello stesso logotipo** seguita da **`Haarlem`**. Le due meta' sono
  disallineate — la superiore parte a `translateX(-50%)`, la inferiore
  all'opposto — e scivolano l'una verso l'altra finche' il logotipo **non si
  salda**. Le foto dentro le due tende si muovono a `translateX(35%)`, cioe' a
  velocita' diversa: parallasse dentro la tenda.
- **~1,0 s** — Le tende hanno finito. `.preloader.started` porta il fondo a
  `transparent` con una transizione di `0,55 s` e `1 s` di ritardo.
- **1,0-1,3 s** — Compare il giallo. `#fce373`, canarino, pieno schermo.
- **1,3-2,0 s** — **Il momento.** Le due meta' di `Welcome` salgono e scendono
  e si incontrano al centro. 0,75 s, `cubic-bezier(1, 0, 0, 1)`.
- **1,55-2,3 s** — Sotto, il sottotitolo sale da `translateY(-25%)` e diventa
  opaco (ritardo 0,25 s, durata 0,75 s). E' il primo dei quattro messaggi.
- **~1,95 s** — Il pulsante nero **`Buy tickets`** scivola in posizione
  (`transition-delay: .65s` da `.is-ready`).
- **~2,1 s** — Compare a sinistra la **colonna nera** con le sei icone. Ogni
  icona e' in realta' due SVG sovrapposti: uno statico e uno che si **disegna**
  al passaggio del mouse.
- **~2,1 s** — In basso, il menu `Visit / Discover / Learn / Support`.
- **~2,1 s** — In basso la barra dei cookie: *"To enhance your experience on our
  website, we use cookies. In order to do so, we need your consent."* con
  `Accept` e `Decline`.
- **3-10 s** — Il carosello dei messaggi gira da solo (Flickity, `autoPlay`).
  Le due estremita' sono mascherate da due pseudo-elementi larghi `14vw` dello
  stesso giallo: le frasi **entrano ed escono da dietro il nulla**, non da un
  bordo.
- **da subito, in sottofondo** — Dietro il menu c'e' un `<canvas
  class="header-bubbles">` con dei rigonfiamenti vettoriali disegnati in
  **Paper.js**: quando passi su una voce, la tendina non ha un bordo dritto ma
  una **bolla** che si sposta sotto la voce attiva.

### Il resto, a blocchi

1. **Si scorre**, e le sezioni entrano una per volta: ogni blocco marcato
   `js-animate-in-view` parte da `opacity: 0` e `translateY(2em)` e arriva in
   `0,55 s` (`cubic-bezier(0.215, 0.61, 0.355, 1)`), con `0,4 s` di ritardo.
2. **Si passa su una scheda mostra.** L'immagine non si ingrandisce: le cresce
   dentro **una cornice del colore della sezione**, via `box-shadow: inset 0 0 0
   1.2vw currentColor`, in `0,45 s`. Il quadro si incornicia.
3. **Si clicca il "+".** Il pulsante va in `is-loading`, parte una chiamata al
   server, ritorna, il "+" diventa **una spunta**, e il **pannello del viaggio
   si apre da destra da solo**.
4. **Si clicca una voce di menu.** Prima ancora di navigare, il sito legge
   dal link l'attributo `data-page-colorset`, per esempio:
   ```
   data-page-colorset='{"primary":"rgb(154,209,139)","secondary":"rgb(252,227,115)","tertiary":"rgb(204,166,154)"}'
   ```
   Colora **subito** la tenda con il `primary` della pagina di destinazione, la
   chiude (due meta' che scalano da sopra e da sotto, `0,5 s`,
   `cubic-bezier(0.785, 0.135, 0.15, 0.86)`), dopo `500 ms` cambia lo sfondo di
   `html`, poi la riapre. **Non vedi mai il bianco fra due pagine**: vedi il
   colore di dove stai andando.
5. **Si arriva sulla pagina nuova.** Il titolo si ricompone con la stessa
   meccanica delle due meta'.
6. **Si ridimensiona la finestra** e cala la tenda con *"Repainting
   artworks"*.

## Animazioni

Nessun WebGL. Nessuna sequenza di fotogrammi. Il sito e' fatto di **quattro
attrezzi**: transizioni CSS, GSAP, Paper.js e SVG con `stroke-dasharray`.

| elemento | cosa si muove | legato a | curva o inerzia | note |
|---|---|---|---|---|
| Preloader | due meta' di logotipo che si saldano | tempo (caricamento) | `translateX(±50%)` → 0 | le foto dentro vanno a `35%`: parallasse |
| Titolo di pagina | meta' alta sale da `150%`, meta' bassa scende da `-150%` | ingresso pagina | **0,75 s** `cubic-bezier(1, 0, 0, 1)` | la stessa parola scritta 3 volte nel DOM |
| Sottotitolo | `translateY(-25%)` → 0 + opacita' | ingresso pagina | 0,75 s `cubic-bezier(.215,.61,.355,1)`, ritardo **0,25 s** | |
| Tenda fra pagine | due meta' `scaleY(0)` → 1 da sopra e da sotto | clic su un link | **0,5 s** `cubic-bezier(.785,.135,.15,.86)` | il colore arriva dal `data-page-colorset` del **link**, non della pagina |
| Tenda del ridimensionamento | copre lo schermo con una frase a caso | `window.resize` | — | disattivata su `isDevice` |
| Carosello dei messaggi | scorrimento orizzontale automatico | tempo | **Flickity** | mascherato ai lati da due bande di `14vw` |
| Bolle del menu e delle barre laterali | il bordo del pannello si gonfia sotto la voce attiva | passaggio del mouse / voce attiva | **Paper.js**, `Path` con punti di controllo a `±0,065` e `±0,2` di `max(1000, innerWidth)` | e' un `<canvas>`, non un SVG |
| Icone (645 in una sola pagina) | il tratto si **disegna** | passaggio del mouse | `stroke-dasharray` / `stroke-dashoffset` | ogni icona e' due SVG: `static-svg` + `animation-svg` |
| Sottolineature dei link | due trattini larghi **51%** che scalano da sinistra e da destra | passaggio del mouse | **0,4 s** `cubic-bezier(.785,.135,.15,.86)` | 51% e non 50%: si sovrappongono di 1 punto per non lasciare il buco al centro |
| Schede mostra | cornice interna che cresce da 0 a `1,2vw` | passaggio del mouse | 0,45 s `cubic-bezier(.215,.61,.355,1)` | `box-shadow: inset`, del colore della sezione |
| Blocchi in scorrimento | `opacity 0` + `translateY(2em)` → normale | entrata nella vista | 0,55 s, ritardo 0,4 s | classe `js-animate-in-view` → `is-in-view` |
| Icona "aggiungi al viaggio" | "+" → rotellina → spunta | clic + risposta del server | — | tre stati: normale, `is-loading`, `is-in-trip` |
| Pannelli laterali | scivolano da destra | clic sull'icona | — | il fondo si oscura con `#231f20` a `opacity .9` in `0,4 s` |
| Filtri collezione | l'icona scala a `0,9` e prende un alone | passaggio del mouse | 0,65 s `cubic-bezier(0.19, 1, 0.22, 1)` | `box-shadow: 0 0 0 7px #6fab9e` |
| Carte del Tinder | trascinamento con rotazione e rientro elastico | dito / mouse | **GSAP Draggable** + Hammer.js | `box-shadow: 1px 1px 70px rgba(0,0,0,.3)` |
| Roulette | tre fasce che girano, due bloccabili | clic | — | risultato disegnato su canvas 800x800 per la condivisione |
| Menu del telefono | pannello che sale con `translateY(100%)` → 0 | hamburger | 0,3 s `cubic-bezier(0.77, 0, 0.175, 1)` | fondo `#cca69a` |
| Barra attrezzi sul telefono | scende con `translateY(100%)` quando scorri | direzione dello scroll | 0,3 s `cubic-bezier(.215,.61,.355,1)` | classe `is-mobile-hidden` |

**Librerie riconosciute nel bundle** (conteggio delle occorrenze in
`app.min.js`): `TweenMax` 55, `TweenLite` 29, `Draggable` 16, `TimelineMax` 6,
`SplitText` 5, `ScrollToPlugin` 1 — cioe' **GSAP con licenza a pagamento**
(Draggable e SplitText sono plugin del club). Piu' `Backbone` 50, `flickity` 80,
`select2` 162, `videojs` 29, `Hammer` 5, `paper` (dal `require`), `mapbox` 284 e
`turf-*` (una sessantina di moduli) per la mappa.

## Colori

Il sito ha **un colore per stanza**. Non e' una palette di marca: e' un
inventario, e ogni pagina ne prende uno e ci si dipinge dentro.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| Testo / inchiostro | **`#231f20`** | tutti i testi (`a { color: #231f20 }`), fondo della barra attrezzi, pulsante `Buy tickets`, velo che oscura sotto i pannelli |
| Giallo canarino | **`#fce373`** | fondo della home, **fondo del piede**, icone della barra nera, primo colore di tendina del menu |
| Rosa-terra | **`#cca69a`** | fondo di `html` (quindi il primo colore che si vede), fondo del preloader, fondo del menu sul telefono, colore della **selezione del testo**, colore delle tende fra le pagine |
| Verde | **`#9ad18b`** | seconda tendina del menu, pagina `Donate` |
| Viola | **`#a385bd`** | terza tendina, pagina Calendario |
| Arancio | **`#f9a04e`** | quarta tendina, menu a tendina dei moduli (`select2`), barra dei filtri di ricerca |
| Rosa | **`#f8b5b8`** | Tinder (fascia alta), roulette |
| Verde acqua | **`#6fab9e`** | Tinder (fascia bassa), alone dei filtri della collezione |
| Arancio bruciato | **`#f37449`** | quinta tendina, **selezione del testo dentro il piede** |
| Bianco | `#fff` | testi su fondo scuro |

**Il dettaglio da rubare**: la selezione del testo e' `#cca69a` in tutto il
sito, ma dentro il piede diventa `#f37449`. Hanno cambiato il colore
dell'evidenziazione **in una sola sezione**, perche' su giallo il rosa-terra non
si sarebbe letto. Nessuno se ne accorgera' mai. L'hanno fatto lo stesso.

Nota sulla scheda Awwwards: la palette che il sito dichiara li' e' `#49c5b6`,
`#FF9398`, `#ECD06F` — tre colori vicini ma **non presenti nel CSS**. E'
l'estratto automatico di Awwwards da uno screenshot, non i valori veri. I valori
sopra sono letti dal foglio di stile.

## Tipografia

**Due caratteri, e ognuno fa un mestiere solo.**

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| Titolo home | `raisonne-demibold` | 600 | **260px** + `fittext` | 0.9em | maiuscolo, `letter-spacing: .02em`; il corpo lo ricalcola JS per riempire la riga |
| Titolo di sezione | `raisonne-demibold` | 600 | `3.333vw`, minimo **50px** | 0.9em | maiuscolo, centrato, `hyphens: auto` |
| Voci di menu | `raisonne-demibold` | 600 | `1.667vw`, minimo **25px** | 0.9em | maiuscolo, `letter-spacing: .05em` |
| Sottotitolo / testo corrente | `Twentieth Century W01` | 400 | `1.2vw`, minimo **18px** | 1.1 | |
| Titolo scheda mostra | `Twentieth Century W01` | 600 | `1.4vw`, minimo **21px** | 1em | |
| Etichetta scheda | `Twentieth Century W01` | 400 | `1vw`, minimo **15px** | | |
| Titolo dei pannelli laterali | `Twentieth Century W01` | 400 | `0.867vw`, minimo **13px** | 1em | maiuscolo |

**Come sono serviti i font.**

- **Twentieth Century W01** — Monotype, servito da **`fast.fonts.net`** (il
  servizio a canone di Monotype, oggi Monotype Fonts). Tre pesi: 300, 400, 600.
  Il foglio dichiara le famiglie con un nome che contiene il simbolo di marchio
  registrato: `font-family: "Twentieth Century™ W01"`. E' il Futura di Monotype
  (disegnato da Sol Hess nel 1937): geometrico, la "a" a un occhio, la "O"
  perfettamente tonda.
- **Raisonné** (qui `raisonne-demibold`) — di **Colophon Foundry**, un grottesco
  geometrico con dettagli piu' caldi del Futura. `non verificato` da dove sia
  servito: nel CSS c'e' solo il riferimento alla famiglia, il `@font-face` non e'
  nel foglio principale.
- Entrambi caricati tramite **`webfontloader`** (Google/Typekit), che il bundle
  richiede esplicitamente. Nessun font variabile: e' il 2018.

**La regola tipografica da copiare.** Ogni dichiarazione e' scritta cosi':

```css
.home-hero__subtitle {
  font-size: 18px;      /* prima il valore fisso */
  font-size: 1.2vw;     /* poi lo sovrascrive con il fluido */
}
@media (max-width: 1500px) {
  .home-hero__subtitle { font-size: 18px; }   /* sotto i 1500px torna fisso */
}
```

Cioe': **fluido sopra i 1500px, fisso sotto.** Non un `clamp()` (che nel 2018
non si poteva usare), ma il risultato e' lo stesso e funziona anche su IE. Su
uno schermo grande il sito respira; su un portatile normale i corpi sono quelli
decisi a mano. E' piu' semplice e piu' controllabile di mezze scale fluide che
si vedono oggi.

## Testi veri

**Preloader**
> Meet at
> [FRANS HALS]
> Haarlem

**Home, titolo e messaggi rotanti**
> Welcome
>
> "How extensive the Hals-mania was, is brilliantly on display in Frans Hals and the Moderns." NRC****
> Now open: Frans Hals and the Moderns! Hals meets Manet, Singer Sargent, Van Gogh
> Please note: on 24 and 25 November, location HOF (Frans Hals and the Moderns) is only opened for BankGiro Loterij VIP-cardholders
> "[the paintings] ... prove the influence of Hals on the artistic turnaround in the 19th-centrury. The museum tells this story in a convincing way." Trouw****

**Chiamate all'azione**
> Buy tickets
> All exhibitions
> add to trip
> Plan your visit
> Buy Tickets Online
> Get Directions
> Start liking / Start spinning / Start watching / Play again

**Menu attrezzi (tooltip)**
> view calendar · book a trip · buy tickets · search · view location · opening hours

**Pannello orari**
> Our opening hours
> **We are waiting for you!** / Open Today!
> Tuesday & Saturday 11 a.m. – 5 p.m.
> Sunday and Holidays 12 a.m. – 5 p.m.
> special holiday hours
>
> (quando chiuso:)
> **Sorry, we are closed today!** / Closed Today
> **Plan a trip instead**

**Pannello sedi**
> Locations And hours
> One museum two locations
> Hof — Groot Heiligland 62, 2011 ES Haarlem
> Hal — Grote Markt 16, 2011 RD Haarlem

**Pannello / pagina viaggio**
> Your trip
> Looks like you'll have fun!
> I would love more suggestions !
> My trip details
> **Just tell us who you are!**
> I am adventureous · I am with kids · I am everything at once · I am in love · I am an expert · I am in doubt
> Or do a regular search
>
> (pagina `/my-trip/`:)
> Your Trip
> **We organised your trip**
> My unique url: [ ] Copy link
> Here is your personalised roadmap. We advised you to keep this link and open it on your mobile phone when heading to the Frans Hals Museum!
> Your trip — 0 Activities
> Duration — ± 0 Hours

(Nota il refuso `adventureous` e lo spazio prima del punto esclamativo in
`suggestions !`: sono nell'originale. Un Site of the Year con i refusi in
produzione.)

**Scheda mostra**
> Exhibition
> Frans Hals and the Moderns
> Hals meets Manet, Singer Sargent, Van Gogh
> Location — Hof, Hal
> **Duration — ± 60 minutes**
> add to trip
> Buy Tickets · Plan your visit

**Pagina visita**
> Visitor info
> One museum, two locations
> Our two locations – Hal and Hof – are a 7-minute scenic walk from each other.
> Photography — Frans Hals is happy to allow photography, but only without a flash. To avoid any accidents, tripods may only be used with prior permission. **Frans is very social**, so please feel free to share your favourite photos, especially on social media!

**Accessibilita'**
> Hal: A 13-minute walk from Haarlem railway station.
> Hof: A 7-minute walk from our Hal location on Grote Markt.
> Bus 3: get off at bus stop, Frans Hals Museum.
> The majority of the Frans Hals Museum is wheelchair accessible. We have a number of (standard) wheelchairs available in-house. Please call +31 (0)23 511 5775 and we will happily prepare one for your visit.

**Newsletter (i cinque stati del campo, testuali)**
> Frans likes to send you emails
> Frans is pleased to meet you
> Frans can't accept this email
> Looking good!
> Awesome! You've got mail

**Modulo sul calendario (Gravity Forms)**
> Any good ideas?
> Help us choose the next theme we will cover in our upcoming exhibitions!
> Choose one or more themes that inspire you: *
> The colour red · Cats · Light installations

**Barra dei cookie**
> To enhance your experience on our website, we use cookies. In order to do so, we need your consent. Find out more in our privacystatement.
> Accept — Decline

**Piede**
> One museum two locations
> Press · Terms · About us · FAQ · Contact · Colophon · Curators

**Il filo che tiene insieme tutti i testi**: il museo parla **in prima persona
come se fosse Frans Hals**. *"Frans likes to send you emails"*, *"Frans is
pleased to meet you"*, *"Frans is very social"*, *"Frans loves flowers"*, *"Meet
at Frans Hals!"*. Un pittore morto nel 1666 e' la voce del servizio clienti.
Questa e' l'identita' di KesselsKramer, e il sito la esegue in ogni microtesto —
compresi i messaggi di errore.

## Mobile

**Sotto i 1024px non e' un altro sito: e' lo stesso sito ruotato di 90 gradi.**
E' un caso raro e vale la pena essere precisi, perche' la maggioranza dei siti
premiati sul telefono si amputa. Qui no.

### Cosa RESTA (tutto)

- **Le sei icone.** La colonna nera larga `4vw` alta `100vh` diventa una **barra
  orizzontale in basso alta `12vw`** (`8vw` sopra i 768px e in orizzontale),
  stesso fondo `#231f20`, stesse icone `#fce373`, stesse funzioni.
- **Tutti e cinque i pannelli**: calendario, viaggio, ricerca, sedi, orari.
- **Tutti e tre i giochi.** Il Tinder e' *nato* per il dito: Hammer.js e'
  incluso proprio per quello.
- **Il viaggio**, che anzi sul telefono e' il pezzo forte: la pagina `/my-trip/`
  dice esplicitamente *"open it on your mobile phone when heading to the Frans
  Hals Museum"*. **Il desktop pianifica, il telefono guida.**
- Il preloader, le tende fra pagine, il titolo che si ricompone.

### Cosa viene SOSTITUITO

- **Il menu principale.** Sul desktop e' una riga di quattro voci fissata a
  `bottom: 12vw` con quattro tendine colorate che si aprono al passaggio del
  mouse. Sotto i 1024px diventa `transform: translateY(100%); visibility:
  hidden` — cioe' sparisce sotto lo schermo — e risale solo con la classe
  `menu-is-open`, cioe' col **hamburger**, che sta in mezzo alle sei icone della
  barra. Fondo del pannello: `#cca69a`.
- **Le tendine del menu**: da pannelli sospesi con il bordo a bolla (Paper.js) a
  blocchi pieni impilati, ognuno del suo colore.
- **Le bolle di Paper.js** cambiano orientamento: `initPaper()` legge
  `utils.width < config.breakpoints.medium` e ridisegna il tracciato in
  orizzontale invece che in verticale. Non le spengono: le ruotano.
- **Il cursore personalizzato** del gioco GIF ovviamente non c'e': tutti gli
  effetti al passaggio del mouse sono sotto `.is-desktop`, una classe che il JS
  mette solo se non e' un dispositivo a tocco.
- **La tenda "Repainting artworks"** e' esplicitamente disattivata:
  `if (!this.isResizing && !config.sniff.isDevice)`. Sul telefono la rotazione
  dello schermo non deve far calare nessuna tenda.

### Cosa SPARISCE

- **Quasi niente**, ed e' il punto. Su 22.043 righe di CSS ci sono solo **93
  blocchi** `@media (max-width: 1023px)` e **6** `@media (max-width: 767px)`,
  contro **449** blocchi `@media (min-width: 1024px)`. Il sito e' scritto
  **mobile-first sul serio**: la versione base e' quella del telefono, e il
  desktop e' l'eccezione da 449 regole.
- La barra attrezzi si **nasconde scorrendo** (`is-mobile-hidden`,
  `translateY(100%)`, `0,3 s`) e torna quando risali. Unica funzione tolta.

### Il difetto grave

Nel `<meta viewport>` c'e' scritto:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0,
      user-scalable=no, maximum-scale=1, minimal-ui, shrink-to-fit=no,
      viewport-fit=cover">
```

**`user-scalable=no` e `maximum-scale=1`**: sul telefono **non si puo'
ingrandire la pagina con le dita**. Su un sito di un museo pubblico, che ha una
pagina dedicata all'accessibilita' con le sedie a rotelle e i parcheggi per
disabili, questo e' un autogol. E' quasi certamente la ragione principale del
**5,50/10 in accessibilita'** nel Developer Award. Era prassi diffusa nel 2018;
oggi Safari lo ignora e Lighthouse lo segnala come errore.

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| CMS | **WordPress** | **VERIFICATO** | tutti gli asset stanno in `/wp-content/themes/franshals/`, i media in `/wp-content/uploads/2018/03/`, chiamate ad `admin-ajax` |
| Tema | tema su misura `franshals` | **VERIFICATO** | percorso del tema, `build/app.min.css` + `build/app.min.js` |
| SEO | **Yoast SEO 7.1** | **VERIFICATO** | commento `<!-- This site is optimized with the Yoast SEO plugin v7.1 -->` |
| Moduli | **Gravity Forms** | **VERIFICATO** | `data-component="gravity-form-request"`, e il testo *"This iframe contains the logic required to handle Ajax powered Gravity Forms"* |
| Architettura front-end | **Backbone + Marionette**, con router | **VERIFICATO** | `Marionette.View.extend`, `Backbone.history.navigate`, viste per rotta (`views/home`, `views/artpiece`, `views/calendar`, `views/my-trip`, `views/collection`...) |
| Navigazione | **PJAX**: i clic sono intercettati, il contenuto sostituito | **VERIFICATO** | `onLinkClick` fa `e.preventDefault()` e `Backbone.history.navigate(s, {trigger:true})` |
| Animazione | **GSAP** (TweenMax, TweenLite, TimelineMax) + **Draggable** + **SplitText** + ScrollToPlugin | **VERIFICATO** | nomi presenti nel bundle; Draggable e SplitText sono plugin a pagamento |
| Grafica vettoriale | **Paper.js** | **VERIFICATO** | `t("paper")`, `new PaperScope()`, `paper.Path`, `paper.Point` |
| Gesti | **Hammer.js** | **VERIFICATO** | presente nel bundle e dichiarato su Awwwards |
| Caroselli | **Flickity** | **VERIFICATO** | 80 occorrenze, `flickity-slider` nel CSS |
| Menu a tendina | **select2** | **VERIFICATO** | 162 occorrenze, `.select2-selection` nel CSS |
| Video | **video.js** | **VERIFICATO** | ~90 moduli `./tech/...`, `.vjs-*` nel CSS |
| Audio | **widget SoundCloud** | **VERIFICATO** | `SC.Widget.Events.PLAY_PROGRESS` nel componente audio |
| Mappa | **Mapbox GL JS** + **Turf.js** | **VERIFICATO** | 284 occorrenze `mapbox`, `./lib/vectortile.js`, una sessantina di moduli `turf-*` |
| Scroll | `raf-scroll` + un `lazy-parallax.js` interno | **VERIFICATO** | `t("raf-scroll")`, `./lazy-parallax.js`. **Niente scroll morbido**: nessun Lenis, nessun Locomotive |
| Immagini | lazy loading su misura, tre misure per immagine | **VERIFICATO** | `data-component="lazy"` con `data-imgsrc='[{"width":300,...},{"width":500,...},{"width":700,...}]'` |
| Font | **Monotype fast.fonts.net** + `webfontloader` | **VERIFICATO** | `<link href="//fast.fonts.net/cssapi/bc11e4ab-...">`, `t("webfontloader")` |
| Stato del viaggio | **cookie** `my-trip`, JSON, scadenza **7 giorni** | **VERIFICATO** | `js-cookie`: `Cookies.set("my-trip", JSON.stringify({trip_id, trip_events}), {expires: 7})` |
| Biglietteria | **Global Tickets**, dominio esterno | **VERIFICATO** | colophon + `href="https://tickets.franshalsmuseum.nl/en" target="_blank"` |
| Tracciamento | **Facebook Pixel** (id `242303049728497`) | **VERIFICATO** | script inline in cima al `<body>` |
| Server | **Nginx + Varnish + PHP** | SUPPOSTO | dichiarato nelle etichette di Awwwards; non verificabile dall'archivio |
| 3D / WebGL | **nessuno** | **VERIFICATO** | una sola occorrenza della stringa `WebGL` in 2,6 MB di JS, dentro Mapbox |

**Il dato che conta per un'agenzia**: un Site of the Year, nel 2018, fatto su
**WordPress con Yoast e Gravity Forms**. Cioe' sullo stack piu' banale che
esista in Italia. La differenza non e' la tecnologia: e' il **livello sopra** —
un'applicazione Backbone che intercetta la navigazione e regala transizioni,
colore e continuita' a un CMS che di suo ricarica la pagina.

## Peso e prestazioni

Numeri veri, misurati sui file scaricati dall'archivio:

| file | non compresso | gzip -9 |
|---|---|---|
| `app.min.css` | **3.189.567 B** (3,19 MB) | **513.075 B** (513 KB) |
| `app.min.js` | **2.651.701 B** (2,65 MB) | **716.831 B** (717 KB) |
| home `/en/` (HTML) | 355.373 B | 76.391 B |
| **totale codice** | **6,20 MB** | **1,31 MB** |

A cui si aggiungono i font Monotype, le immagini e le GIF dei giochi.

**Tre cose da dire su questi numeri.**

1. **3,19 MB di CSS non sono un errore di misura.** Il foglio ha 22.043 righe e
   contiene *tutto*: normalize, video.js, select2, Flickity, Mapbox, i tre
   giochi, tutte le pagine. Non c'e' `data:` base64 dentro (solo due minuscoli
   blob, 1.316 byte in tutto): sono regole vere. E **arrivano tutte alla prima
   pagina**, comprese quelle dei giochi che l'utente non aprira' mai.
2. **Un solo CSS e un solo JS.** Zero code splitting. Nel 2018 con HTTP/1.1 era
   una scelta difendibile; oggi non lo sarebbe.
3. Il **WPO 7,25/10** del Developer Award e il **markup 6,75** dicono che la
   giuria se n'era accorta. Il voto di sviluppo (7,01) e' **quasi un punto sotto**
   quello di design (7,94). Ha vinto **nonostante** il codice.

**Il sito attuale, per confronto** (misurato il 13/08/2026):

| | 2018 | 2026 |
|---|---|---|
| HTML della home | 355 KB → **76 KB gzip** | 911 KB → **69 KB gzip** |
| JS | 1 file, 717 KB gzip | ~25 chunk Next.js |
| Hosting | Nginx/Varnish | **Vercel** (`X-Vercel-Id: fra1::...`) |

`non verificato`: Lighthouse, LCP, numero totale di richieste, peso delle
immagini. Non ho aperto un browser, quindi non ho misurato tempi reali —
solo byte.

## Tre cose da rubare

Tutte e tre sono **meccaniche**, tutte e tre si rifanno in un progetto italiano
da fondazione o consorzio, e nessuna richiede WebGL.

### 1. Il carrello che non vende niente: "aggiungi al viaggio"

E' l'idea commerciale piu' trasferibile di tutta la ricerca. Il museo non puo'
avere un carrello (il biglietto e' su un altro dominio, e meta' della gente
entra gratis), quindi **si costruisce un carrello finto che colleziona
intenzioni invece di prodotti**.

Come e' fatto, per intero:

- **Ogni contenuto ha una durata dichiarata.** Sulla scheda mostra c'e' scritto
  `Duration ± 60 minutes`. Non e' decorazione: e' il campo che rende sommabile
  un'esperienza.
- **Ogni contenuto ha un "+"** (`data-component="add-to-trip"
  data-eventid="19031"`).
- Al clic: si scrive un **cookie** `my-trip` con `{trip_id, trip_events}` dove
  `trip_events` e' una lista di id separati da virgola, **scadenza 7 giorni**;
  parte un `POST` a `admin-ajax` con `action: "add_new_event_to_trip"`; la
  risposta e' **HTML gia' pronto** che sostituisce il contenuto del pannello; il
  `<body>` prende la classe `has-trip`; e si emette l'evento
  `sidebar:openTrip`, **che apre il pannello da solo**.
- Il pannello somma: `3 Activities`, `Duration ± 3 Hours`.
- La pagina `/my-trip/` genera **un URL unico da copiare**, con l'istruzione
  esplicita di aprirlo sul telefono il giorno della visita.

**Perche' funziona.** Non chiede nome, non chiede email, non chiede
registrazione — chiede solo un clic. Trasforma la navigazione in **impegno**, e
un impegno preso in sette giorni e' esattamente la finestra di una gita. E il
link condivisibile fa il resto: chi organizza lo manda agli altri, e quel link
e' un invito che parla per il museo.

**Come si rifa' in Italia.** Consorzio di cantine: "aggiungi alla degustazione",
ogni cantina con la sua durata, l'itinerario che si somma e si manda su
WhatsApp. Fondazione culturale: "il tuo weekend", con la stessa meccanica.
Marchio storico con piu' punti vendita o stabilimenti: "il tuo percorso".
Costo: un cookie, una tabella di id, un endpoint che restituisce HTML. Nessun
account, nessun database utenti, nessun GDPR complicato.

### 2. Il colore della pagina di destinazione letto dal link, non dalla pagina

Il problema classico delle transizioni fra pagine e' il lampo bianco. La
soluzione standard e' precaricare la pagina. Qui hanno fatto una cosa piu'
economica e piu' furba: **ogni link porta addosso i colori di dove porta**.

```html
<a href=".../support/donate/"
   data-page-colorset='{"primary":"rgb(154,209,139)",
                        "secondary":"rgb(252,227,115)",
                        "tertiary":"rgb(204,166,154)"}'>
```

E il codice, semplificato dal bundle:

```js
toNewPageAnimation: function (link) {
  if (link.hasAttribute('data-page-colorset')) {
    var c = JSON.parse(link.getAttribute('data-page-colorset'));
    curtains.style.color = c.primary;          // la tenda prende il colore
    curtains.classList.add('is-closed');       // si chiude: 0,5 s
    setTimeout(function () {
      document.documentElement.style.background = c.primary;  // poi html
      curtains.classList.remove('is-closed');  // e si riapre
    }, 500);
    vent.trigger('menu:updateColor', c.primary);
  }
}
```

La tenda e' due `div` a `height: 50%`, `transform: scaleY(0)`, con origine
sopra e sotto, che vanno a `scaleY(1)` in `0,5 s` con
`cubic-bezier(.785,.135,.15,.86)`. Chiudono, cambia lo sfondo, riaprono.

**Perche' e' da rubare.** Non serve una libreria di transizioni, non serve
precaricare, non serve conoscere la pagina di destinazione: **basta che il CMS
stampi tre colori nell'attributo di ogni link**. Sono venti righe di JavaScript
e un campo in piu' nel back-end. Il risultato e' che il sito sembra un'unica
superficie continua invece di un CMS che ricarica.

### 3. Un pannello che risponde con lo stato di oggi, e propone l'alternativa

Il pannello degli orari non elenca gli orari: **dice se sei in tempo**.

- Se e' aperto: `Open Today!` + `We are waiting for you!` + gli orari.
- Se e' chiuso: `Closed Today` + `Sorry, we are closed today!` + gli orari +
  **`Plan a trip instead`**.

Piu' un link a parte per le `special holiday hours`, dove ci sono le festivita'
una per una (Natale, Capodanno, Pasquetta, giorno del Re, giorno della
Liberazione, Ascensione, Pentecoste).

**Perche' e' da rubare.** E' la differenza fra un dato e una risposta. Un
elenco di orari costringe il visitatore a fare un calcolo mentale ("oggi e'
martedi', quindi..."); una frase che dice `Open Today!` gli toglie il calcolo di
mano. E soprattutto: **il caso negativo non e' un vicolo cieco.** "Chiuso" e' il
momento in cui la maggior parte dei siti perde il visitatore per sempre; qui
"chiuso" e' il momento in cui parte l'unica proposta commerciale gratuita del
sito. Costo: un `if` sul server e una riga di testo.

Vale per qualunque cliente con orari: ristorante, studio, negozio, museo,
stabilimento visitabile. E in Italia praticamente nessuno lo fa.

## Non verificato

- **Il font Raisonné**: nel CSS c'e' solo la famiglia `raisonne-demibold`. Il
  `@font-face` non e' nel foglio principale e non l'ho trovato nell'archivio.
  Non so da dove fosse servito ne' se avesse una licenza web separata.
- **Tempi reali**: nessun Lighthouse, nessun LCP, nessun conteggio di richieste.
  Ho misurato solo i byte dei file, senza aprire un browser. Il numero totale
  di richieste della home e il peso complessivo delle immagini restano ignoti.
- **Il comportamento dei tre giochi in movimento**: ho letto markup, CSS e nomi
  dei passi, ma non li ho visti girare. La roulette in particolare — cosa
  succede esattamente quando "blocchi" una fascia — l'ho dedotta dalle classi
  `js-lock` / `data-pos="top"` / `js-shuffle`, non osservata.
- **Il `preloader-canvas`**: c'e' un `<canvas id="preloader-canvas">` prima della
  tenda. Non ho isolato il codice che ci disegna sopra. Suppongo bolle Paper.js
  come nel resto del sito, ma **non l'ho verificato**.
- **Il Webby Award**: ho letto solo il titolo della notizia
  (`Museum nominated for prestigious Webby Award`), non il corpo. Categoria,
  anno ed esito sono ignoti.
- **Il dettaglio del checkout**: `tickets.franshalsmuseum.nl` non e' archiviato
  in modo utile. Quanti passi ci vogliono per comprare un biglietto, se c'e' la
  scelta della fascia oraria, se il viaggio salvato viaggia fino alla cassa:
  tutto ignoto. **E' il pezzo che manca**, e sospetto che manchi perche' non
  esisteva: i due imbuti (viaggio e biglietto) sembrano scollegati.
- **La versione olandese**: ho letto quasi tutto in inglese. Il sito ha anche
  `nl`, `de`, `fr` (dichiarate negli `og:locale:alternate`), ma le pagine
  tedesca e francese archiviate sono poche e sembrano ridotte alla sola
  informazione di visita.
- **Il traffico e i risultati commerciali**: nessun dato. Build in Amsterdam ha
  rimosso il caso dal proprio sito, quindi non esiste piu' nemmeno la loro
  versione dei numeri.
- **Perche' la sede Hal non c'e' piu'**: il sito attuale elenca un solo
  indirizzo (Groot Heiligland 62). Quando e perche' sia chiusa la sede di Grote
  Markt: `non verificato`.

---

## Extra: cosa c'e' oggi al posto del Site of the Year

Questa sezione non e' nel modello, ma per un'agenzia che deve vendere a una
fondazione italiana e' la parte piu' utile della scheda. Perche' racconta il
finale.

**Il sito del 2026, misurato il 13/08/2026.**

| voce | cosa usa | come l'ho capito |
|---|---|---|
| Framework | **Next.js** (App Router) | percorsi `/_next/static/chunks/app/[languageCode]/[[...parts]]/page-*.js` |
| Hosting | **Vercel** | intestazione `X-Vercel-Id: fra1::...`, `Server: Vercel` |
| CMS | **Sanity** (progetto `r35o2ddl`) | 12 richieste a `cdn.sanity.io`, percorsi immagine `/images/r35o2ddl/production/...` |
| CDN media | **Bunny** su `museumplatform.b-cdn.net` | 317 richieste |
| Zoom sulle opere | **Micrio** | **440 richieste** a `iiif.micr.io` |
| Errori | **Sentry** | `<meta name="sentry-trace">` |
| Analytics | Google Tag Manager | script |
| Carattere | **Rubik** (400/500/600/700), woff2 locali | quattro `@font-face` inline con `font-display: swap` |
| Biglietteria | **CM.com (Global Ticket)** | pagina `/en/credits` |

E i credits, testuali:

> **TECHNICAL IMPLEMENTATION**
> Q42 based on the **Online Museumplatform**, a shared online platform created
> for and by museums
>
> **Design**
> Janneman (Jan Tijssen)

**Cioe': il museo che ha vinto il Site of the Year e' passato a una piattaforma
condivisa fra musei.** Non un sito su misura: un prodotto, con i suoi token di
tema (`--mp-color-primary`, `--mp-color-surface`, `--mp-color-on-background`),
in cui ogni museo mette i propri colori e i propri contenuti.

La palette attuale, dai token CSS in linea nel `<head>`:

| ruolo | esadecimale |
|---|---|
| `--mp-color-background` | `#FECD8C` (albicocca) |
| `--mp-color-surface` | `#001317` (quasi nero, virato verde) |
| `--mp-color-on-background` | `#001317` |
| `--mp-color-secondary` | `#B9C089` (verde oliva) |
| `--mp-color-primary-variant` | `#FFB655` |
| `--mp-color-error` | `#EDBAA7` |
| `--mp-color-success` | `#2CFF70` |
| `--mp-color-gray300` / `gray200` | `#7D8688` (uguali fra loro) |
| `--mp-color-gray100` | `#FAFAFA` |

**Dettaglio rivelatore**: c'e' un blocco `html.dark { ... }` con la lista
completa dei token — e i valori sono **identici** a quelli chiari. Il tema scuro
e' dichiarato e non implementato. E' la firma di un prodotto multi-cliente: la
funzione esiste nella piattaforma, questo museo non l'ha configurata.

**Cosa e' sopravvissuto e cosa e' morto.**

| del 2018 | oggi |
|---|---|
| Sei attrezzi sempre presenti | menu classico: `Visit · See & Do · Collection · About us` + `Order tickets` |
| **"Add to trip"** con durate sommate e URL condivisibile | **sparito** |
| Collezione filtrata per **colore** e per tag `cats` / `weird` | sparita, resta `Discover our collection` |
| Calendario filtrato per **chi sei** | sparito |
| Tre giochi | spariti (restano attivita' in sede: *Scavenger hunt*, *Dress up as a civic guard*, *Create your own group portrait*) |
| Preloader, tende, titoli che si ricompongono | spariti |
| Twentieth Century + Raisonné | **Rubik** |
| Due sedi, Hof e Hal | **una sola**: Groot Heiligland 62, Tue–Sun 11–17 |
| — | **Micrio**: zoom profondo vero sulle opere, 440 richieste. Nel 2018 non c'era |
| — | *"OUR GUEST BOOK"*: tre recensioni firmate, fra cui *"Great museum," Kelly, 11 years old* |
| — | un blocco FAQ vero in pagina visita, con sei domande aperte |

**La lezione, e vale per ogni cliente italiano che chiede "un sito bello".** Il
sito del 2018 ha vinto tutto e **non e' arrivato a otto anni**. Quello che
l'ha sostituito e' piu' povero da guardare, piu' veloce da aggiornare, e non
richiede uno studio ad Amsterdam per cambiare un orario. Le uniche cose del 2018
che sono **davvero** sopravvissute non sono gli effetti: sono i **contenuti** —
gli orari, le indicazioni a piedi con i minuti, i prezzi, l'accessibilita', le
FAQ. E l'unica cosa nuova che il museo ha guadagnato e' una funzione, non un
effetto: lo zoom sulle opere.

Chi vende un sito a una fondazione deve saperlo e dirlo: **la parte bella e' la
prima a morire, la parte utile e' quella che si porta dietro.** Il modo di
farla durare e' esattamente quello del punto 2 delle "cose da rubare" — mettere
la bellezza dentro **meccaniche generate dal CMS** (un colore in un attributo,
una durata in un campo, uno stato calcolato dal server), non dentro codice a
mano che nessuno sapra' piu' manutenere.
