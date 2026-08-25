# La presenza pubblica di uno studio creativo, fuori dal proprio sito

Dossier al 13/08/2026. **Le date sono misurate, non stimate.** I post LinkedIn
vengono dal JSON-LD (`datePublished` + `text`) delle pagine aziendali
pubbliche; i dati GitHub dall'API ufficiale; i download da `api.npmjs.org`; i
video dai feed RSS dei canali; gli articoli dai feed RSS.

**Cosa NON e' stato possibile misurare, e lo diciamo prima:** X e Instagram
non espongono piu' nulla senza autenticazione (l'endpoint pubblico di conteggio
follower di X e' spento, l'API web di Instagram risponde vuota). Di quelle due
piattaforme sappiamo **chi ha un profilo e chi lo linka**, non quanto ci
pubblica. Ogni volta che un numero manca, e' scritto che manca.

**Avvertenza sul campione LinkedIn:** la pagina pubblica di un'azienda espone
gli ultimi 5-10 post. Le frequenze qui sotto sono misurate su quella finestra,
che e' il dato reale piu' recente ottenibile senza account.

---

## Indice

1. Dove stanno davvero (e dove hanno un profilo morto)
2. Cosa pubblicano — 65 post classificati uno a uno
3. Con che frequenza, sulle date vere
4. Chi pubblica: lo studio o le persone?
5. Il contenuto tecnico come richiamo: porta lavoro?
6. Le community dove stanno gli sviluppatori creativi
7. Il piano per chi apre da solo

---

## In tre righe

**Il canale non e' quello che sembra.** Nessuno di questi studi vive su
Instagram e nessuno ha un Twitch: vivono su LinkedIn per farsi vedere dai
compratori e su GitHub per farsi vedere dai pari. Il ritmo vero e' **un post
ogni due settimane**, non cinque a settimana. E il contenuto che tutti i manuali
raccomandano — *il processo, il dietro le quinte* — nei fatti e' **il 3% di
quello che pubblicano**.

---

## 1. Dove stanno davvero

Metodo: i profili sono stati presi **dai link che ogni studio mette nel proprio
sito** — e' quello che loro stessi dichiarano di presidiare — e poi ogni
profilo e' stato aperto per verificare se e' vivo.

### Cosa ciascuno linka dal proprio sito (13/08/2026)

| studio | LinkedIn | Instagram | X | GitHub | Behance | Dribbble | YouTube |
|---|---|---|---|---|---|---|---|
| **basement.studio** | si' | si' | si' | **si'** | no | no | no |
| **darkroom.engineering** | si' | si' | si' | **si', 7 link diversi** | no | no | no |
| **Locomotive** | si' | si' | si' | **si'** | si' | no | no |
| **Lusion** | si' | si' | si' | **no** (ma esiste) | no | no | no |
| **Immersive Garden** | no (ma esiste) | si' | si' | no | no | no | no |
| **Hello Monday** | no (ma esiste) | si' | si' | no | no | no | no |
| **Cuberto** | si' | no | no | si' | no | **si'** | si' |
| **by-kin** | no | **si', unico link** | no | no | no | no | no |
| **Active Theory / Obys / Resn** | — | — | — | — | — | — | — |

Le ultime tre righe sono vuote per un motivo che vale come lezione a se':
**il loro sito e' un canvas WebGL e i link sociali non esistono nell'HTML.**
Non li trova un `curl`, quindi non li trova nemmeno un crawler ne' un'AI a cui
un cliente chiede «trovami uno studio che fa siti immersivi». I profili
esistono — Active Theory ha 13.301 follower su LinkedIn — ma **partendo dal
loro sito, una macchina non ci arriva**.

### I numeri, misurati il 13/08/2026

| studio | LinkedIn | dipendenti | GitHub follower | stelle GitHub |
|---|---:|---:|---:|---:|
| **Locomotive** | **23.518** | 45 | 509 | 9.653 |
| Hello Monday / DEPT | 21.272 | — | — | — |
| Active Theory | 13.301 | 38 | 201 | 905 |
| DOGSTUDIO/DEPT | 10.951 | 29 | — | — |
| Cuberto | 10.119 | 12 | — | — |
| Immersive Garden | 9.909 | 26 | — | — |
| Lusion | 8.436 | 9 | 103 | 435 |
| Obys | 7.480 | 15 | — | — |
| basement.studio | 6.504 | 46 | 998 | 5.553 |
| **darkroom.engineering** | **938** | 10 | **1.794** | **18.174** |

**Le due righe da leggere insieme sono la prima e l'ultima.** Locomotive ha
venticinque volte i follower LinkedIn di darkroom. darkroom ha piu' stelle
GitHub di **tutti gli altri messi insieme** (18.174 contro 16.546). Sono due
strategie opposte e **funzionano entrambe**, perche' parlano a compratori
diversi: Locomotive ai direttori marketing, darkroom agli sviluppatori — che
poi diventano clienti, o li portano.

### Due trappole di identita', pagate durante questa ricerca

Le riporto perche' chiunque rifaccia questo lavoro ci cade.

- **Cercando "Locomotive" su LinkedIn** si arriva a `/company/locomotive`, che
  e' **un'azienda olandese omonima** con 454 follower. Quella vera e'
  `/company/locomotive-mtl`, 23.518. Un errore di cinquanta volte.
- **Cercando "Hello Monday"** si arriva a `/company/hellomonday`, 4.841
  follower — che e' una societa' australiana di *coaching e formazione
  aziendale*. Lo studio digitale e' `/company/hello-monday`, 21.272 follower.
  Le due pagine si distinguono solo leggendo i post: una parla di leadership
  coaching, l'altra di Netflix e NVIDIA.

> **Regola operativa:** non cercare il profilo, **segui il link dal sito
> ufficiale.** Se il sito non linka nulla — caso Active Theory, Obys, Resn —
> allora quel profilo non e' verificabile, e va detto.

### I profili abbandonati

- **Behance**: `behance.net/basementstudio` ha **25 follower e 131
  apprezzamenti** in tutto. Per uno studio con 998 follower su GitHub e 6.504
  su LinkedIn, e' un profilo che non esiste. Behance sopravvive solo dove c'e'
  un reparto di grafica o illustrazione.
- **Dribbble**: qui c'e' l'eccezione enorme. **Cuberto ha 172.712 follower su
  Dribbble** — piu' di quanti ne abbia chiunque altro su qualunque piattaforma
  di questa ricerca, LinkedIn compreso. Ed e' l'unico che lo linka dal sito.
- **Twitch**: **nessuno**. Cercato su tutti, non trovato in nessun sito, in
  nessun profilo. Va tolto dal piano e basta.
- **YouTube**: fra gli studi lo linka solo Cuberto. Sopravvive dove c'e'
  *insegnamento*, non promozione (vedi sezione 5).
- **Medium di Active Theory**: dieci articoli, l'ultimo del **03/11/2022**.
  Fermo da quasi quattro anni.

---

## 2. Cosa pubblicano

**65 post, letti uno per uno** dalle pagine LinkedIn pubbliche di dieci studi,
e classificati per contenuto. Questa e' la parte che ribalta i consigli da
manuale.

| categoria | post | quota |
|---|---:|---:|
| **Lavori finiti per clienti** | 16 | 24,6% |
| **Premi e nomination** | 15 | 23,1% |
| **Prodotti propri e open source** | 11 | 16,9% |
| **Assunzioni e persone del team** | 8 | 12,3% |
| Varie (identita', cultura, teaser, opinioni) | 6 | 9,2% |
| **Contenuto educativo/commerciale** | 4 | 6,2% |
| **Conferenze e interventi dal palco** | 3 | 4,6% |
| **Processo e dietro le quinte** | 2 | **3,1%** |

**Premi piu' lavori finiti fanno il 47,7%: quasi la meta'.** Il "processo", che
e' il consiglio numero uno di qualunque guida al personal branding, e' **due
post su sessantacinque** — ed entrambi sono di un solo studio.

E il dato che conta di piu' per chi apre: **codice e opinioni sono quasi
assenti**. Un solo post di opinione in 65 (Active Theory, 24/07/2026, una
citazione sull'AI). Nessuno pubblica codice su LinkedIn: chi ha codice lo
pubblica su GitHub e su LinkedIn ne annuncia solo l'esito.

### Chi pubblica cosa, studio per studio

| studio | la sua tesi editoriale, in una riga |
|---|---|
| **Immersive Garden** | **premi e basta**: 7 post su 8 sono premi o nomination (FWA Hall of Fame, SOTD e SOTM per Cartier e per GQ x Audemars Piguet). L'ottavo e' il talk del CEO |
| **Cuberto** | **l'unico che fa contenuto commerciale vero**: 4 post su 6 sono editoriali di vendita — *quanto costa un redesign nel 2026*, un modello di RFP, *come si comincia un redesign*. Zero premi |
| **darkroom.engineering** | **il loro open source E' la loro comunicazione**: 4 post su 7 parlano di chi usa Lenis (Shopify, un sito governativo) e di quanto viene scaricato |
| **Obys** | **campagna monotematica**: 4 post su 5 sono lo stesso progetto autoprodotto (Experiment Space) raccontato a puntate, fino al SOTD |
| **Lusion** | **l'unico con una serie di processo**: 7 puntate dietro le quinte su Oryzo. Piu' 3 post su assunzioni |
| **Locomotive** | **le persone**: promozioni con nome e cognome, annunci di lavoro, colleghi che parlano a convegni. Meta' dei post non riguarda progetti. Bilingue FR/EN |
| **basement.studio** | **prodotti propri**: 2 post su 5 lanciano roba loro (Shader Lab open source, un videogioco). Zero premi |
| **Active Theory** | **lavori, costruiti come una campagna**: teaser, conto alla rovescia, rivelazione. Il progetto Santioni Spirits occupa 3 post su 7 |
| **Hello Monday / DEPT** | **assume**: 3 post su 7 sono offerte di lavoro (Copenaghen, Aarhus) |
| **DOGSTUDIO/DEPT** | **un solo post visibile, del 09/10/2025.** Pagina con 10.951 follower, ferma da dieci mesi |

**Il dettaglio da rubare, ed e' di Cuberto.** I loro post sui lavori non dicono
«guarda che bello»: dicono cosa c'era dentro. *«Abbiamo ricostruito il sito in
tre mesi, oltre 35 pagine su misura, un nuovo CMS aziendale, moduli di
contatto, tracciamento, integrazioni»* (04/08/2026). E' l'unico studio del
gruppo che **mette il perimetro del lavoro nel post** — cioe' che si fa leggere
da chi deve comprare, non da chi deve ammirare.

---

## 3. Con che frequenza, sulle date vere

| studio | post letti | dal | al | un post ogni | ultimo post |
|---|---:|---|---|---:|---|
| **Cuberto** | 6 | 03/08/2026 | 11/08/2026 | **1,6 giorni** | 2 giorni fa |
| Active Theory | 7 | 25/06/2026 | 30/07/2026 | 5,8 giorni | 14 giorni fa |
| Lusion | 10 | 01/04/2026 | 13/07/2026 | 11,4 giorni | 31 giorni fa |
| Obys | 5 | 10/06/2026 | 28/07/2026 | 12,0 giorni | 16 giorni fa |
| Locomotive | 9 | 28/04/2026 | 05/08/2026 | 12,4 giorni | 8 giorni fa |
| Immersive Garden | 8 | 16/05/2026 | 11/08/2026 | 12,4 giorni | **2 giorni fa** |
| basement.studio | 5 | 13/04/2026 | 31/07/2026 | 27,3 giorni | 13 giorni fa |
| Hello Monday / DEPT | 7 | 16/12/2025 | 15/06/2026 | 30,2 giorni | 59 giorni fa |
| **darkroom.engineering** | 7 | 18/08/2025 | 30/06/2026 | **52,7 giorni** | 44 giorni fa |
| DOGSTUDIO/DEPT | 1 | — | 09/10/2025 | — | **308 giorni fa** |

**La mediana e' un post ogni 12,4 giorni.** Cioe' **due o tre al mese**. Se
qualcuno vi dice che servono tre post a settimana per «esistere su LinkedIn»,
gli studi che vincono gli Awwwards stanno facendo un sesto di quel ritmo.

Tre letture che contano:

1. **Cuberto e' l'eccezione, e si spiega.** Un post ogni 1,6 giorni e' il ritmo
   di chi si procura i clienti in entrata: infatti e' l'unico che pubblica
   contenuto di vendita e l'unico con 172.712 follower su Dribbble. Gli altri
   vivono di passaparola e premi, e postano di conseguenza.
2. **darkroom pubblica su LinkedIn una volta ogni due mesi** e ha 938 follower.
   Nello stesso periodo il loro GitHub ha ricevuto push su **18 repository** e
   Lenis e' arrivato a 1,35 milioni di download a settimana. Non e' uno studio
   che pubblica poco: **e' uno studio che pubblica altrove.**
3. **Una pagina da 10.951 follower puo' essere morta.** Dogstudio/DEPT non
   pubblica da dieci mesi. Il numero di follower non dice niente sull'attivita':
   va sempre guardata la data dell'ultimo post.

---

## 4. Chi pubblica: lo studio o le persone?

E' la domanda decisiva per chi apre da solo, e i numeri danno una risposta
netta — ma non quella che ci si aspetta.

### Persona contro studio, sugli stessi follower GitHub

| persona | ruolo | follower | lo studio | follower studio | rapporto |
|---|---|---:|---|---:|---:|
| **Bruno Simon** | da solo | **22.278** | — | — | — |
| **Manoela Ilic** (`crnacura`) | fondatrice Codrops | **7.145** | Codrops | 3.384 | **2,1x la persona** |
| **Luigi De Rosa** (`luruke`) | Interactive Director | **966** | Active Theory | 201 | **4,8x la persona** |
| **Clement Roche** (`clementroche`) | autore di Lenis | 410 | darkroom | 1.794 | 4,4x lo studio |
| **Franco Arza** (`arzafran`) | co-fondatore | 247 | darkroom | 1.794 | 7,3x lo studio |
| Nacho Mandagaran | basement | 70 | basement.studio | 998 | 14x lo studio |
| Alex Bergin | Active Theory | 9 | Active Theory | 201 | 22x lo studio |

### La regola che ne esce, ed e' azionabile

**I follower si accumulano dove sta l'oggetto, non dove sta la persona.**

- Lenis e' depositato sotto l'organizzazione `darkroomengineering`. Risultato:
  l'organizzazione ha 1.794 follower e il suo autore ne ha 410. **Clement Roche
  ha scritto la libreria piu' usata di questa ricerca e vale un quarto del
  proprio studio**, perche' il repository non porta il suo nome.
- Luigi De Rosa non ha depositato niente sotto Active Theory: i suoi 62
  repository sono suoi. Risultato: vale quasi cinque volte lo studio.
- **Bruno Simon e' il caso limite**: 22.278 follower, cioe' **piu' di tutti e
  quattro gli studi di questa tabella messi insieme** (`basementstudio` 998 +
  `darkroomengineering` 1.794 + `locomotivemtl` 509 + `activetheory` 201 =
  3.502). Sei volte tanto. Da solo.

> **Per chi apre da solo, questa e' la decisione da prendere il primo giorno:
> se pubblichi qualcosa, decidi consapevolmente se depositarlo sotto il tuo
> nome o sotto il nome dello studio.** Non e' reversibile a costo zero, e i
> due conti non si sommano. All'inizio, quando lo studio non esiste ancora
> nella testa di nessuno, **il nome proprio raccoglie e il nome dello studio
> disperde.**

**Il contrappeso onesto.** Aristide Benoist ha **1.118 follower su GitHub con
un solo repository pubblico**. La reputazione non arriva necessariamente dal
codice pubblicato: arriva dai lavori, e GitHub la registra comunque. E
Locomotive fa la mossa opposta e altrettanto valida: **usa la pagina aziendale
per dare visibilita' alle persone** — promozioni annunciate con nome e
cognome, dipendenti che vanno a parlare ai convegni. Lo studio presta il
pubblico alle persone invece di prenderselo.

---

## 5. Il contenuto tecnico come richiamo: porta lavoro?

La premessa da cui siamo partiti — *«Basement e Bruno Simon hanno il codice
pubblico, Active Theory scrive articoli approfonditi»* — e' vera solo in parte,
e una meta' va corretta con le date.

### Cosa e' confermato

**darkroom.engineering e' il caso piu' forte, e non e' nemmeno vicino.**

| misura | valore al 13/08/2026 |
|---|---|
| Stelle di `lenis` | **15.396** |
| Download npm a settimana | **1.349.285** |
| Download del vecchio nome `@studio-freight/lenis` | 104.180 (ancora vivi) |
| Repository con push negli ultimi 12 mesi | 18 su 34 |
| GitHub Sponsors | **attivo** |
| Follower LinkedIn | 938 |

Il 03/02/2026 avevano annunciato su LinkedIn di aver toccato **200.000**
download a settimana, definendolo *«from side project to industry standard»*.
Sei mesi dopo sono **1.349.285: 6,7 volte tanto in sei mesi.** E nei loro post
si vede la catena: Shopify che usa Lenis (08/10/2025), un sito governativo
statunitense che usa Lenis (09/01/2026), e nel frattempo il lavoro vero —
l'esperienza Oreo x BTS (30/06/2026), definita *«our most ambitious build
yet»*.

**Lo studio con la presenza LinkedIn piu' debole del gruppo ha la libreria piu'
usata del settore, e i clienti piu' grossi.** Non e' una coincidenza: e' una
scelta di canale.

**Il confronto che smonta un mito.** `locomotive-scroll` ha **8.837 stelle** e
**15.353 download a settimana**. Lenis ha **15.396 stelle** — 1,7 volte tanto —
e **1.349.285 download**, cioe' **88 volte tanti**. Il vantaggio in stelle e'
di uno a due, quello in uso reale e' di uno a ottantotto: **le stelle sono
applausi, i download sono uso, e le due cose divergono di quasi due ordini di
grandezza.** Se si pubblica codice per farsi trovare, la metrica da guardare —
e da citare a un cliente — e' la seconda.

**basement.studio: il codice come lancio di prodotto.** 42 repository, 5.553
stelle, 17 con push negli ultimi dodici mesi. Ma soprattutto: `shader-lab`,
creato il **17/03/2026**, annunciato su LinkedIn il **13/04/2026** (*«like
photoshop but for shaders... OSS package to plug & play»*), e oggi a **663
stelle** — con l'ultimo push del **12/08/2026**, cioe' ieri. E `xmcp`, 1.310
stelle, aperto il 17/05/2025. Loro non pubblicano il codice dei lavori:
**pubblicano attrezzi, e li lanciano come prodotti.**

**Bruno Simon e' l'unica prova di guadagno diretta e verificabile.**
Three.js Journey dichiara sulla propria pagina **50.826 studenti iscritti**, 66
lezioni e **93 ore** di video, a **95 $ IVA inclusa, accesso a vita**. A
listino pieno sono **circa 4,8 milioni di dollari lordi** — e' un tetto, non un
incasso: sconti e promozioni esistono e non sono pubblici. Nel prezzo c'e'
anche **un server Discord privato**, cioe' la community e' parte del prodotto
venduto, non un canale di marketing.

E il suo canale YouTube non promuove: **documenta**. Quindici video
dal 06/01/2025 al 10/07/2026 — un video ogni 37 giorni — e la spina dorsale e'
una serie di **quindici puntate di "devlog" sulla ricostruzione del proprio
portfolio**: *Water & Trees, Weather, Multiplayer, Cookies & Eggs, Lab,
Responsive, Performance, Sound design, The end?*. Il lavoro in corso **e'** il
contenuto. Non c'e' un piano editoriale separato dal mestiere.

### Cosa va corretto

**Active Theory ha smesso di scrivere.** Il loro Medium ha dieci articoli, uno
per progetto (Prometheus, Secret Sky, Sundance, Huluween, Adidas), e **l'ultimo
e' del 03/11/2022**. Sul sito attuale gli articoli esistono ma vivono dentro
una SPA: `activetheory.net/articles` e `activetheory.net/journal` restituiscono
**gli stessi identici 5.952 byte**, cioe' il guscio vuoto. Per un crawler quei
contenuti non ci sono. Il loro GitHub ha **8 repository e un solo push negli
ultimi dodici mesi**.

Restano uno degli studi piu' premiati al mondo. **Quindi: gli articoli tecnici
hanno costruito la loro reputazione fino al 2022, e da allora la reputazione si
sostiene da sola.** E' una fase, non un obbligo perpetuo.

**Lusion e' la prova che si puo' fare a meno di tutto questo.** Due repository
pubblici, 103 follower su GitHub, **e dal loro sito il GitHub non e' nemmeno
linkato**. Lavorano per clienti di primissima fascia. Il contenuto tecnico
**non e' necessario**: e' un moltiplicatore, non un requisito.

### Il verdetto onesto

**Nessuno studio ha mai pubblicato «questo cliente ci ha trovato su GitHub».**
Non esiste una prova diretta di attribuzione, e chiunque la dia per scontata sta
raccontando una storia. Quello che i dati sostengono e' piu' ristretto e piu'
utile:

1. **Prova certa di ricavo diretto: una sola**, ed e' vendere l'insegnamento
   (Bruno Simon). Li' il contenuto tecnico non porta lavoro: **e'** il lavoro.
2. **Prova forte di reputazione fra i pari e di adozione**: Lenis dentro
   Shopify e dentro un sito governativo, con i numeri di download a confermarlo.
3. **Prova forte di reclutamento**: chi ha codice pubblico attira sviluppatori.
   Lusion, che di codice pubblico non ne ha, ha dovuto **comprare** attenzione
   con tre post di assunzione su dieci.
4. **Zero prove che serva per prendere il cliente medio.** Il cliente medio non
   sa cosa sia GitHub.

**Le conferenze, invece, hanno prove datate e visibili.** Immersive Garden ha
mandato il proprio CEO Dilshan Arukatti a **Digital Design Days a Milano**
(post del 16/05/2026); Locomotive ha mandato il direttore creativo Dust Leblanc
a **Interface a Quebec** (26/05/2026) e Lucas Bigot a parlare di motion
d'interfaccia (12/06/2026). Tre interventi in un mese fra due studi: **e' il
canale in cui investono di piu' dopo i premi**, ed e' l'unico dove un solista
puo' stare alla pari fin dal primo giorno.

---

## 6. Le community dove stanno gli sviluppatori creativi

Misure prese il 13/08/2026.

| luogo | dimensione misurata | stato |
|---|---|---|
| **Codrops** (`tympanus.net/codrops`) | **10 articoli dal 30/07 al 12/08/2026** = uno ogni 1,4 giorni | vivissimo |
| **Discord Three.js** | **18.285 membri** | vivo |
| **Discord Poimandres** (React Three Fiber) | **10.536 membri** | vivo |
| **Forum Three.js** (`discourse.threejs.org`) | **1.007 post e 611 utenti attivi in 30 giorni** | vivo ma piccolo |
| **Codrops Collective** (la rassegna/newsletter) | ultimi numeri ~#905, **fermi ad aprile 2025** | **morto** |
| Behance | 25 follower per basement.studio | irrilevante qui |
| Twitch | nessuno studio presente | irrilevante |

### Codrops e' la scoperta operativa di tutta questa ricerca

Guardando **chi firma** gli ultimi dieci articoli, si vede una cosa che cambia
il piano di chiunque apra da solo:

| data | firma | titolo |
|---|---|---|
| 12/08/2026 | Francesco Michelin | Creating an Interactive 3D Cluster with Three.js, TSL... |
| 11/08/2026 | Chiro Visuals | Exploring Procedural Geometry with Three.js and WebGPU |
| 10/08/2026 | **Antinomy** (studio) | From Brand Systems to Cultural Worlds: Inside Antinomy and 27b |
| 08/08/2026 | Nicolas Leuliet | Designing a Flexible Digital Archive for Chems.Studio |
| 07/08/2026 | Lewis Webber | The Department Is Open: Building the PX PUSH Website |
| 06/08/2026 | Frank Reitberger | Garden Anomaly: A Tiny WebGPU and TSL Experiment |
| 05/08/2026 | **`advertiser`** | A Canvas for Individuality... *(spazio a pagamento)* |
| 04/08/2026 | Sujen Phea | Building an Endless Interactive Glass Xylophone |
| 03/08/2026 | **BONHOMME** (studio) | The Story Is in the Interaction: Bonhomme's Digital Experiences |
| 30/07/2026 | Surya Aditya | Building an Infinite GSAP Scroll Gallery |

**Nessuno di questi articoli e' scritto dalla redazione.** Sono tutti autori
esterni: singoli sviluppatori e studi. E **quattro su dieci sono di fatto
ritratti di studio** — "dentro Antinomy", "le esperienze di Bonhomme per il
lusso", "l'archivio di Chems.Studio", "come abbiamo costruito PX PUSH".

E la porta e' dichiarata. La pagina *About* dice: *«Interested in contributing?
We'd love to hear from you and welcome fresh ideas from passionate people in
the community»*, e il modulo di contatto ha un menu con la voce **«I would like
to contribute»** e **«I want to submit a project/website»**.

> **Tradotto: esiste una pubblicazione di settore che esce quasi ogni giorno,
> che e' letta esattamente dal pubblico giusto, che non ha redattori interni e
> che dichiara pubblicamente di cercare autori.** Per uno che apre da solo,
> **un articolo li' vale piu' di sei mesi di Instagram** — e il costo e' un
> pezzo tecnico ben fatto, non un budget.
>
> Nota di igiene: uno dei dieci e' firmato `advertiser`. Lo spazio a pagamento
> esiste e si riconosce, quindi la via editoriale gratuita non e' l'unica —
> ma e' quella con la firma vera.

**Sui Discord, la cautela.** 18.285 e 10.536 membri sono il numero di iscritti,
non di attivi: il forum Three.js, che e' l'unico che espone le statistiche
vere, dichiara **611 utenti che hanno scritto in 30 giorni**. Il rapporto fra
iscritti e attivi in queste comunita' e' dell'ordine del 3-5%. Sono posti dove
si risolvono problemi e si conoscono persone, **non canali di distribuzione**.

**E la newsletter di settore non c'e' piu'.** Il Codrops Collective — la
rassegna di link che per anni e' stata *il* punto di raccolta del web creativo
— si e' fermato attorno al numero 905, ad aprile 2025. Chi pianifica oggi
«farsi ripubblicare dalla newsletter di settore» sta inseguendo una cosa che
non esiste da sedici mesi. Il flusso di articoli, invece, e' piu' vivo che mai.

---

## 7. Il piano per chi apre da solo

Costruito solo su cio' che e' stato misurato sopra. Niente consigli da manuale:
sotto ogni riga c'e' un numero di questa ricerca.

### Dove esserci — e dove no

| canale | verdetto | perche', col dato |
|---|---|---|
| **LinkedIn** | **si', obbligatorio** | l'unico che hanno tutti e dieci gli studi. E' dove i clienti verificano che esisti |
| **GitHub, sotto il TUO nome** | **si'** | i follower vanno dove sta l'oggetto (sez. 4). Bruno Simon da solo vale 6 volte quattro studi |
| **Un articolo su Codrops** | **si', e' la priorita' vera** | esce ogni 1,4 giorni, sempre firmato da esterni, e chiedono autori |
| **Conferenze, anche piccole** | **si', appena possibile** | tre interventi in un mese fra Immersive Garden e Locomotive |
| **Instagram** | tienilo, non investirci | ce l'hanno tutti ma non e' misurabile e non e' dove si compra |
| **X** | tienilo, non investirci | non e' piu' misurabile dall'esterno: non saprai mai se funziona |
| **Dribbble** | **solo se fai UI di prodotto** | Cuberto 172.712 follower. Ma Cuberto vende interfacce, non esperienze |
| **Behance** | **no** | 25 follower per basement.studio |
| **Twitch** | **no** | zero studi su dieci |
| **YouTube** | **solo se insegni** | funziona per Bruno Simon perche' documenta, non perche' promuove |

### Cosa pubblicare

Dalla classificazione dei 65 post, con il correttivo per chi non ha ancora ne'
premi ne' clienti famosi:

1. **Il lavoro finito, col perimetro dentro.** E' la categoria piu' grande
   (24,6%), ma copia il modo di Cuberto, non quello di Immersive Garden:
   *«tre mesi, 35 pagine, CMS, moduli, tracciamento»*. Chi compra legge quello.
2. **Un attrezzo tuo, pubblicato.** E' il 16,9% dei post degli studi, ed e' la
   categoria che uno da solo puo' produrre **senza permesso di nessun cliente**.
   Non il codice del progetto: un pezzo riusabile estratto da un progetto —
   il modello `shader-lab` di basement.
3. **Il processo, ma in serie.** E' il 3,1% degli studi, quindi e' lo spazio
   vuoto. Ed e' l'unica cosa che funziona **prima** di avere un portfolio:
   Lusion l'ha fatto in 7 puntate su Oryzo, Bruno Simon in 15 puntate sul
   proprio portfolio. **Il lavoro in corso e' il contenuto.**
4. **Non pubblicare opinioni.** 1 post su 65. Non e' quello che fa questo
   mestiere.
5. **I premi quando arrivano** (23,1%), e nel frattempo il loro sostituto:
   un numero verificabile del progetto — come gia' detto in `_COME-SI-VENDE.md`,
   *«il caricamento e' passato da 6 a 1,8 secondi»* con il nome del cliente.

### Quanto tempo ci vuole davvero, a settimana

Il ritmo mediano degli studi premiati e' **un post ogni 12,4 giorni**. Non
serve di piu', e provare a fare di piu' e' il modo classico di smettere dopo
sei settimane.

| attivita' | ritmo | tempo |
|---|---|---|
| Post LinkedIn su un lavoro o un avanzamento | 2-3 al mese | **30-45 min** l'uno, materiale gia' esistente |
| Ripulire e pubblicare un attrezzo su GitHub | 3-4 all'anno | 1 giornata, solo su codice gia' scritto per un cliente |
| Un articolo tecnico con demo per Codrops | 1-2 all'anno | 2-3 giornate piene, da mettere a calendario come un progetto |
| Stare nel Discord Three.js / forum | continuo | 15-20 min quando serve, non e' una voce di piano |

**In regime: fra un'ora e mezza e due ore a settimana**, piu' due o tre
"sprint" da due-tre giorni all'anno per gli articoli. Chiunque prometta
risultati con quindici minuti al giorno tutti i giorni non ha guardato le date
reali dei post di chi vince.

### Le tre cose da fare per prime, in ordine

1. **Metti i link sociali nell'HTML del tuo sito.** Costa dieci minuti. Active
   Theory, Obys e Resn — tre studi premiati — sono irraggiungibili da una
   macchina che parta dal loro sito. E' un errore gratuito da non fare.
2. **Decidi sotto quale nome depositi le cose.** All'inizio: il tuo. Lo studio
   non esiste ancora nella testa di nessuno, e i due conti non si sommano.
3. **Scrivi il primo articolo per Codrops.** E' l'unico canale di questa
   ricerca che sia insieme: letto dal pubblico giusto, aperto agli esterni,
   attivo ogni giorno, e gratuito. Gli altri richiedono premi, clienti o anni.

---

## Come sono stati presi i dati (per rifare la misura)

- **Post e follower LinkedIn**: `GET linkedin.com/company/<slug>/`, il blocco
  `application/ld+json` contiene gli oggetti `DiscussionForumPosting` con
  `datePublished`, `text` e `url`. Funziona senza account. Espone gli ultimi
  5-10 post.
- **GitHub**: `api.github.com/users|orgs/<nome>`, `/repos?per_page=100`,
  `/public_members`. Le date usate sono `pushed_at` e `created_at`.
- **Download npm**: `api.npmjs.org/downloads/point/last-week/<pacchetto>`.
- **YouTube**: `youtube.com/feeds/videos.xml?channel_id=<UC...>`, l'id si
  ricava dal campo `externalId` della pagina del canale. Ultimi 15 video.
- **Articoli**: feed RSS (`/feed/` per WordPress, `medium.com/feed/@utente`).
- **Discord**: `discord.com/api/v9/invites/<codice>?with_counts=true` restituisce
  `approximate_member_count`.
- **Forum Discourse**: `/about.json` -> `about.stats`.
- **Non funzionano piu' senza autenticazione**: l'endpoint follower di X
  (`cdn.syndication.twimg.com`), l'API web di Instagram
  (`/api/v1/users/web_profile_info/`), le pagine `/posts/` di LinkedIn e i
  profili personali `/in/`.
