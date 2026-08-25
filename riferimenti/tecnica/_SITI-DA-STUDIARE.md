# I siti premiati di cui esiste il codice, catalogati

Non le librerie degli studi (quelle stanno in `_LIBRERIE-DEGLI-STUDI.md` e
`_REPO-CACCIA.md`): **il codice del sito vero**, quello che si scarica e si apre.

## Il verdetto, che va detto subito

**Gli studi premiati quasi non pubblicano mai il sorgente dei siti che vincono.**
Una ricerca sistematica su GitHub con trenta interrogazioni mirate ha restituito
69 repository: **quasi tutti sono cloni fatti da studenti**, non gli originali.

Quindi le strade vere sono tre, in ordine di valore:

1. **I pochi originali pubblicati davvero** — sette, elencati sotto. Sono oro, e
   **tre dei sette hanno una licenza che permette di riusarli**.

> **Trappola sulla licenza, gia' costata due errori qui dentro.** L'API di GitHub
> ha dichiarato `folio-2019` e `folio-2025` senza licenza: **sono MIT**, e il file
> si chiama `license.md` in minuscolo — il rilevatore automatico cerca `LICENSE`
> e non lo vede. Il modo affidabile e senza tetto di richieste e' leggere la
> pagina HTML del repository e cercare `href="#MIT-1-ov-file"` nella barra
> laterale: il pezzo prima di `-1-ov-file` **e'** la licenza, e se il collegamento
> manca allora davvero non ce n'e'. Da sapere anche che il ramo predefinito puo'
> essere `master` e non `main`: `raw.githubusercontent.com/.../main/license.md`
> risponde 404 su `folio-2019` e trova il file su `master`.
2. **La sourcemap dimenticata in produzione** — piu' frequente del repository, e
   restituisce lo stesso identico sorgente. **Quanto piu' frequente e' contestato,
   e la forbice va dichiarata**: due battute indipendenti danno **11%** (72 siti
   su 655) e **4,7%** (7 siti su 149). La seconda e' piu' severa e ha ragione a
   esserlo — vedi la trappola qui sotto. In ogni caso resta molte volte piu'
   produttiva dei sette repository originali.
3. **I bundle non minificati**, che sono la vera strada larga: **il 27,5% dei siti
   premiati ne lascia uno**. Sei volte piu' comuni delle sourcemap, e nessuno li
   cerca.
4. **I cloni** — non l'originale, ma servono a una cosa precisa: vedere come
   qualcun altro ha ricostruito un effetto guardandolo.

> **AGGIORNAMENTO del 13/08/2026, sera.** Una battuta su **2.416 domini premiati**
> ha portato il conto a **57 siti col sorgente completo**, verificati riaprendo
> ogni mappa: sono in **`_SORGENTI-COMPLETI.md`**, con 220 file di shader
> leggibili fra tutti. Il tasso finale e' del **4,8% sui siti vivi**, in linea con
> le due misure severe precedenti — quello che e' cambiato non e' la resa, e' la
> dimensione del campione.

> **La trappola che gonfia tutte le statistiche su questo argomento.** Una prima
> passata su 149 siti dava il 29,8% di sourcemap utili. Riaprendo e leggendo ogni
> mappa a mano, il numero vero e' sceso a **4,7%**. Le quattro cause: sourcemap di
> librerie prese da un CDN (uno `swiper` con cento file *sembra* un bottino);
> librerie auto-ospitate sul dominio del sito; l'asset servito da un host diverso;
> e soprattutto il **runtime di Next.js**, dove `webpack://_N_E/../../src/` e' il
> framework e `webpack://_N_E/./src/` e' l'applicazione — **un carattere di
> differenza**. Chi non apre le mappe una per una pubblica un numero inventato.

> **La regola che vale per tutto il file: senza licenza il codice si STUDIA, non
> si copia.** Pubblicamente leggibile non vuol dire riutilizzabile: senza licenza
> vale il diritto d'autore pieno. Quasi nessuno di questi repository ha licenza.

---

## A. Gli originali. Verificati il 13/08/2026, uno per uno.

| repository | cos'e' | stelle | ultimo push | licenza |
|---|---|---:|---|---|
| [`the-pudding/website`](https://github.com/the-pudding/website) | **il sito premiato completo, 489 MB di Svelte** | 92 | 2026-08-04 | **MIT** |
| [`basementstudio/website-2k25`](https://github.com/basementstudio/website-2k25) | **il sito attuale di Basement**, quello premiato | 252 | 2026-08-13 | **nessuna** |
| [`brunosimon/folio-2019`](https://github.com/brunosimon/folio-2019) | il portfolio con la macchina, FWA e Awwwards | **4.728** | 2024-05-25 | **MIT** |
| [`brunosimon/folio-2025`](https://github.com/brunosimon/folio-2025) | la versione nuova dello stesso portfolio | 1.689 | 2026-04-07 | **MIT** |
| [`darkroomengineering/sf-website`](https://github.com/darkroomengineering/sf-website) | il sito di Studio Freight, oggi Darkroom. Descrizione loro: *"Our website, open source."* | 139 | 2024-10-11 | verificare |
| [`staratlasmeta/sa-landing-page`](https://github.com/staratlasmeta/sa-landing-page) | **il sito di Star Atlas, Site of the Year 2021** | 0 | 2026-07-02 | **nessuna** |
| [`ustwo/ustwo.com-frontend`](https://github.com/ustwo/ustwo.com-frontend) | il sito di ustwo (Monument Valley) | 1.799 | 2022-06-04 | NOASSERTION |

### Come si usano, in concreto

**`the-pudding/website` — l'unico che si puo' anche COPIARE.** E' il solo caso
trovato in tutta la ricerca in cui premio, codice integrale e **licenza
permissiva** stanno insieme: 489 MB di Svelte, MIT, aggiornato il 04/08/2026.
Tutti gli altri di questa tabella si studiano e basta. Se devi partire da una
base legittima invece che da zero, parti da qui.

    git clone --depth 1 https://github.com/the-pudding/website

**`basementstudio/website-2k25` — comincia da qui per il 3D.** E' vivo (l'ultimo push e' di
oggi), e' React, ~62 MB. Da aprire per primi: il layout radice, dove il canvas
WebGL sta *fuori* dal router per sopravvivere ai cambi pagina, e i commenti degli
sviluppatori — in uno spiegano perche' il passaggio Human/Machine e' una
navigazione intera invece che una transizione (*"it comes back as a black
screen"*). E' documentato in `_TRANSIZIONI-DI-PAGINA.md`.

    git clone --depth 1 https://github.com/basementstudio/website-2k25

**`brunosimon/folio-2019` — il piu' letto al mondo.** 4.728 stelle non sono un
caso: e' il codice piu' commentato e piu' leggibile che esista su un sito 3D
premiato. Da aprire: la gestione della fisica, e come tiene i 60 fotogrammi al
secondo con una scena piena di oggetti.

**`staratlasmeta/sa-landing-page` — il caso piu' interessante di tutti.** Il sito
di un Site of the Year serve **gli stessi identici file del repository**: md5
verificato su `index.html` e `src/main.js`. JavaScript non minificato, generatore
statico scritto in casa in 346 righe, **zero dipendenze**. E' la dimostrazione
che si vince senza framework. Dentro ci sono anche 186 MB di video master
committati e un file di configurazione locale dimenticato: si impara anche da
quello.

**`darkroomengineering/sf-website`** e' il sito di chi ha scritto Lenis. Se vuoi
capire come si usa Lenis *nel modo in cui lo intendono gli autori*, e' qui, non
nella documentazione.

**`ustwo/ustwo.com-frontend`** e' fermo dal 2022 e usa React vecchio: non
copiarne l'impianto. Serve per una cosa sola, ed e' rara — e' un sito d'agenzia
vero, completo, con il codice di produzione e la storia dei commit.

---

## B. Siti di produzione veri, aperti, da cui si impara l'architettura

Non sono siti-esperienza, ma sono **codice di produzione vero** — la cosa che ai
portfolio manca.

| repository | cos'e' | stelle | licenza |
|---|---|---:|---|
| [`guardian/frontend`](https://github.com/guardian/frontend) | **il sito del Guardian**, vivo e aggiornato oggi | **5.897** | verificare |
| [`the-pudding`](https://github.com/the-pudding) | 100 repository: **ogni loro articolo interattivo ha il proprio**, es. `song-repetition` | varie | varie |
| [`darkroomengineering/satus`](https://github.com/darkroomengineering/satus) | lo starter con cui Darkroom comincia ogni progetto: Next.js, Lenis, test di accessibilita' | 979 | verificare |
| [`nprapps/app-template`](https://github.com/nprapps/app-template) | l'impianto della squadra visuale di NPR | 1.590 | verificare |

**The Pudding e' il filone che nessuno guarda ed e' il piu' generoso.** Le
redazioni con squadre di grafica interattiva vincono premi digitali e pubblicano
il codice di **ogni singola storia**, perche' il loro mestiere e' la trasparenza.
Il codice e' scritto per essere riletto da un collega, non per stupire: per
imparare vale piu' di un portfolio.

---

## C. Quando il repository non c'e': la sourcemap

E' la strada piu' produttiva di tutte, e restituisce **lo stesso sorgente** che
starebbe nel repository. Quanto e' produttiva, in numeri: una battuta su **655
siti premiati raggiungibili** ha trovato **72 siti da cui il codice si recupera
davvero** — contro i sei repository originali di tutta la categoria A. Il bottino
piu' grosso e' *Into The Amazon* del National Geographic: **483 file sorgente da
una sola sourcemap da 6,5 MB**, con il premio verificato sull'albo (CSSDA Website
of the Day, 26/03/2025). L'elenco completo sta in `_REPO-ALTRI-PREMI.md`.

Risultati gia' ottenuti in questa ricerca:

| sito | cosa si e' recuperato |
|---|---|
| **Basement** | 1.934 file sorgente ricostruiti |
| **Hello Monday** | sourcemap pubblica completa, con `sourcesContent` |
| **Mana Yerba Mate** | 4,2 MB di sourcemap, **94 sorgenti**, 12 file scritti a mano coi commenti originali in francese |
| **Resn** | un bundle da 4 MB **mai passato dal minificatore**, con gli shader della gemma in chiaro |
| **Prometheus Fuels** | **142 shader in un file solo**, con 115 commenti sopravvissuti |
| **Lusion, Lando Norris** | GLSL vero estratto dai bundle: solutore di fluidi, curl noise, sincronizzazione DOM-WebGL |

Il metodo in tre righe:

    curl -s SITO | grep -oE 'src="[^"]+\.js"'          # trova il bundle
    curl -s BUNDLE | tail -c 200 | grep sourceMapping  # cerca il rimando
    curl -s BUNDLE.map | grep -c sourcesContent        # se c'e', c'e' il sorgente

**Prova sempre `BUNDLE.js.map` alla cieca anche quando il commento manca**: su
Mana il commento era stato rimosso, ma il file era rimasto servito. E' cosi' che
si e' recuperato il bottino piu' grosso del gruppo.

**I falsi positivi da scartare subito.** Su 99 sourcemap con sorgenti, solo 72
contenevano codice davvero dello studio. Le altre erano librerie di terzi che
sembrano bottino e non lo sono: **Framer**, `ga.jspm.io`, **core-js** e la
libreria Osmo. Prima di esultare, guarda i percorsi dentro `sources`: se puntano
tutti a `node_modules` o a un dominio di terzi, non hai trovato niente.

**Da quale albo conviene partire.** Il piu' generoso di codice e' **Webby**, e
non per il regolamento ma per chi lo vince: redazioni, musei ed enti pubblici,
che pubblicano per missione o per obbligo di legge, e con licenza vera. Il piu'
comodo da lavorare e' **CSSDA**, l'unico albo scaricabile da riga di comando
(716 vincitori con data e indirizzo), il che permette di *verificare* il premio
invece di darlo per buono. **FWA e' il piu' avaro** — studi commerciali chiusi —
ed e' anche l'unico albo illeggibile: risponde 500 su tutte le pagine di elenco.

Dettaglio completo in `_CODICE-PUBBLICO-1.md`, `-2.md`, `-3.md` e
`_SOURCEMAP-SWEEP.md`.

---

## D. I cloni: cosa valgono davvero

La ricerca su GitHub ha trovato **decine di ricostruzioni** dei siti premiati,
fatte quasi tutte da studenti. Il piu' clonato in assoluto e' **Obys Agency**:
otto repository diversi. Poi Zajno (quattro), Trionn (tre), Simply Chocolate
(cinque, ma sono esercizi di un corso), Igloo (due), Frans Hals (due), Lando
Norris (due).

**A cosa servono davvero.** Nessuno di questi e' l'originale e nessuno ha
licenza. Ma un clone risponde a una domanda che l'originale non risponde: *come
ha fatto una persona normale a rifare quell'effetto guardandolo?* L'originale ti
mostra il risultato di un team con mesi di tempo; il clone ti mostra la scorciatoia.

**Come si riconosce un clone che vale**: ha un `README` che spiega cosa ha
ricostruito, e' recente, e non e' un `create-react-app` con dentro una foto.

**I quattro meno inutili** (per stelle e per attualita'):
`peyush-nuwal/Obys`, `Mausam5055/Obys-Clone-Gsap`,
`Abdulhadi446/activetheory.net` (che e' un *archivio* del sito di Active Theory,
non un clone: caso a se'), `Kaoz625/website-clones` (raccoglie landonorris.com e
altri).

---

## E. Rifare la caccia da soli

Lo script sta in `_codice/` insieme agli altri. Le tre cose da sapere:

1. **La strada buona, trovata per ultima e che rende inutili le altre**:

       curl -H "Accept: application/json" \
            "https://github.com/orgs/NOME/repositories?type=source"

   Restituisce stelle, **licenza**, linguaggio e date **senza consumare la quota
   da 60 richieste all'ora**. E' cosi' che sono stati letti 4.469 repository di
   117 studi senza toccare l'API. Tre avvertenze: anche questa rotta e' sensibile
   alle maiuscole (la capitalizzazione giusta sta nel meta
   `octolytics-dimension-user_login` della pagina); `Not Found` qui significa
   *"non e' un'organizzazione"*, non *"non esiste"*; e **la scheda dei profili
   personali non mostra la licenza** — leggerla come "nessuna licenza" e' un
   errore che ha quasi fatto scartare `three.js`, `three-mesh-bvh`,
   `canvas-sketch` e `curtains.js`, che sono tutti MIT.
2. Le alternative, se quella sopra non basta: l'API ufficiale (60 richieste
   all'ora, **5.000 con un token personale**: quindici minuti di configurazione),
   il sondaggio HTML secco (`curl -o /dev/null -w "%{http_code}"`), e il proxy
   `https://ungh.cc/repos/OWNER/NOME`, che pero' **non riporta la licenza**.
3. **L'endpoint `/orgs/` e' sensibile alle maiuscole** e risponde 404 per
   capitalizzazione sbagliata: si usa `/users/`, che vale sia per le persone sia
   per le organizzazioni. E' l'errore che fa dichiarare assente una cosa che c'e'.
4. **Peggio del 404 c'e' il risultato schiacciato**, ed e' la trappola che inganna
   davvero: se interroghi piu' organizzazioni insieme, GitHub restituisce al
   massimo **cento risultati in totale**, ordinati per stelle — e le
   organizzazioni grandi cancellano le piccole, che sembrano vuote. Vanno
   interrogate **una alla volta**. E' cosi' che `jam3` risultava senza codice: da
   sola, invece, e' un negativo vero.
5. **Attenzione agli omonimi**: `ueno` su GitHub **non e' lo studio Ueno**, e' uno
   sviluppatore giapponese che si occupa di metodi di input. Stessa trappola per
   `huge`, `koto`, `kode`, `teamlab`, `party`, `caffeina`, `vinta` e
   `charlietango`. Prima di scrivere "hanno pubblicato X", guarda che sia davvero
   la stessa gente.
6. **E l'errore opposto, che e' peggio: dichiarare assente chi c'e'.** Due casi
   gia' sbagliati in questa cartella e poi corretti — **Lusion c'e', si chiama
   `lusionltd`** (due repo MIT, `WebGL-Scroll-Sync` a 359 stelle); e **il codice
   di Dogstudio esiste, ma sta sotto `dept`**, perche' DEPT ha comprato lo studio
   (`highway`, 1.417 stelle, MIT). Quando uno studio viene acquisito, il codice
   migra sotto il compratore: e' il primo posto dove guardare.

### Dove ci si ferma

Durante la battuta e' emerso che **`charlesleclerc.com` espone in produzione
l'intera cartella `.git`**: `/.git/HEAD` risponde 200. E' annotato perche' e' il
difetto da controllare sui propri siti prima di consegnarli — non e' un invito.

La regola vale per tutto questo file: **si legge solo cio' che il server offre
pubblicamente.** Una sourcemap servita e' materiale pubblico; forzare, indovinare
credenziali o scaricare dati personali no. E il codice senza licenza si studia e
si riscrive, non si copia.

## F. Cosa NON e' stato fatto

- **Nessuno di questi repository e' stato letto.** Questo e' un catalogo di dove
  sta il codice, non una recensione di cosa contiene.
- **Le licenze di categoria B vanno verificate una per una** prima di riusare
  qualcosa: il proxy non le riporta ed e' un controllo di dieci secondi.
- La ricerca su GitHub ha usato trenta interrogazioni: **e' larga, non
  esaustiva**. Gli albi dei premi contengono migliaia di siti, e ogni nome nuovo
  e' una ricerca nuova.
