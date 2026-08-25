# Kode Sports Club

- **URL**: `https://www.kodeclubs.com/` — **il sito e' vivo, ed e' ancora
  l'esperienza premiata.** Non e' stato sostituito da un sito "normale": nel
  2026 serve ancora il tour 3D con l'avatar.
  - **Non ho dovuto ricostruire niente da archive.org.** L'ho usato solo per
    confrontare: snapshot `https://web.archive.org/web/20201202222109id_/https://www.kodeclubs.com/`
    (2 dicembre 2020, sei giorni dopo il premio).
  - **La prova che e' la stessa esperienza**: i tre pacchetti di asset 3D pesano
    **esattamente gli stessi byte** nel 2020 e oggi (`canvas.pack` 7.793.181,
    `app.pack` 1.569.264, `about.pack` 342.568). Il modello del club, il
    personaggio, i giochi e le animazioni **non sono mai stati toccati**. Sono
    cambiati solo i testi e i link (vedi *Cosa e' cambiato dal 2020*).
  - Build premiata: `20201124_144630` (24 novembre 2020, **due giorni prima del
    premio**). Build viva oggi: `20250516_134806` (16 maggio 2025). Entrambi i
    valori sono verificati nel campo `timestamp` del JSON di configurazione
    incorporato nella pagina.
- **Premio**:
  - **Awwwards Site of the Year 2020** — **confermato**. Fonte:
    https://www.awwwards.com/websites/sites_of_the_year/ , dove il 2020 elenca
    **due** vincitori: *Kode Sports Club* (Merci Michel) e *Mammut Expedition
    Baikal* (Build in Amsterdam).
  - **Awwwards Site of the Day 26/11/2020**, voto **8.30/10** (design 8.21,
    usabilita' 8.10, creativita' **8.76**, contenuto 8.32; Developer Award 8.25).
    Fonte: https://www.awwwards.com/sites/kode
  - Tag dichiarati su Awwwards: `Sports`, `Animation`, `Fullscreen`, `3D`,
    `Three.js`. Sul sito dello studio i tag sono altri due, e piu' onesti:
    **`Gaming`, `Event`**. Fonte: https://www.merci-michel.com/projects/kode/
- **Studio**: **Merci Michel** (Parigi). Confermato anche dal bucket degli
  asset: `mm-kode.appspot.com` (`mm` = Merci Michel), progetto Google App Engine
  **dello studio**, non del cliente.
- **Cliente**: **Kode Sports Club**, New Cairo (Egitto). Nel piede:
  `Kode by Blue Ribbon, Hassan Allam properties`. Il club sta dentro il
  complesso residenziale **Swan Lake Residences**, Youssef El Sebai, First New
  Cairo.
- **Anno**: 2020. Al momento del premio **il club non esisteva**: apertura
  dichiarata **Q2 2022**, scritta a caratteri cubitali nel preloader. E' il
  fatto piu' importante di tutta la scheda.
- **Letto il**: 13/08/2026
- **Come l'ho letto**: solo `curl` e `WebFetch`. **Nessuna scheda di browser
  aperta, nessuna lasciata aperta.** Ho scaricato l'HTML di oggi (155.230 byte)
  e quello archiviato del 2020 (154.573 byte), i bundle JS
  (`vendors~App` 721.143, `App` 321.062, `Home` 5.186, `runtime` 3.911), il CSS
  (41.727 byte), e ho estratto da entrambe le pagine **tre blob JSON
  incorporati** (`content`, `config`, `manifest`) che contengono **tutti i testi
  dell'esperienza**, **tutte le condizioni commerciali** e **l'elenco completo
  degli asset 3D**. Le meccaniche di gioco le ho lette dentro `App.bundle.js`.
  E' materiale di prima mano: quasi niente in questa scheda e' dedotto
  dall'aspetto.

---

## Cosa tratta il sito

Un **club sportivo privato** di New Cairo. Ma il sito non presenta il club:
**e' un videogioco isometrico in 3D** in cui si visita a piedi un club che
ancora non esiste.

Dentro ci sono, in concreto:

- Una **mappa 3D navigabile** dell'intero complesso (`Park.glb`), con un
  **avatar che cammina** e che il visitatore personalizza prima di partire.
- **Sedici luoghi** con un discorso scritto: Athletic Center, Fitness Complex,
  Sports Performance Center, campo calcio/rugby, tennis e padel, pista di
  corsa, campi da basket e calcio a 5, The Quad, The Hub, Club House, piscina
  olimpica, skatepark, moschea, la sfida della balance board.
- **Due mini-giochi**: **calcio** (piu' gol possibile in 1 minuto) e
  **ciclismo** (piu' strada possibile in 1 minuto).
- **Cinque video**: brand film, video dell'app, e tre interviste ad atleti veri
  (**Raneem El Weleily** squash, **Derek Redmond** atletica, **Dara Torres**
  nuoto).
- **16 achievement**, **3 trofei**, **24 oggetti nascosti** da raccogliere
  (8 borracce, 8 tessere di accessibilita', 8 stelle della connettivita').
- Una **pagina About** che si scorre normalmente, con 5 video.
- Un **imbuto di iscrizione a codice** (`Become a member`), che e' la cassa.

## Cosa vende, e qual e' l'obiettivo finale

Vende **abbonamenti a un club non ancora costruito.**

Questo cambia tutto. Nel 2020 non c'era niente da fotografare: c'era un
cantiere. Un club sportivo normale vende con le foto della piscina e delle sale
pesi — qui le foto non esistevano. Quindi lo studio ha fatto l'unica cosa
possibile: **ha costruito il club in 3D e ci ha fatto camminare dentro la
gente.**

Nel preloader del 2020 c'era scritto, sotto il nome:

> `Kode Sports Club New Cairo`
> **`Opening in Q2 2022`**

Cioe' la prima cosa che vedevi era: *questo posto non c'e' ancora.* Non lo
nascondevano: era la premessa del gioco.

L'obiettivo dichiarato e' `Become a member`. Gli obiettivi veri sono tre:

1. **Prevendere l'appartenenza prima del cemento** — raccogliere i "founding
   members" con un anticipo del 10% e sei rate trimestrali (vedi *Il percorso di
   iscrizione*). Il sito e' uno strumento di prevendita immobiliare-sportiva.
2. **Definire chi e' dentro e chi e' fuori.** L'iscrizione e' **su invito**: ti
   serve un codice, e il codice te lo da' un socio. Il sito non dice "compra":
   chiede *"hai il codice?"*.
3. **Vincere premi.** Un tour 3D con avatar, navmesh e mini-giochi e' molto piu'
   di quanto serva a vendere abbonamenti. Merci Michel ha ospitato il sito sul
   **proprio** bucket: il progetto e' anche il loro portfolio. E ha funzionato:
   Site of the Year.

Nota commerciale che vale piu' di tutte: **il club e' stato costruito davvero**,
il sito e' ancora vivo nel 2026, ha una `Dashboard` e un'app. La scommessa ha
retto.

## A chi

Alla **classe alta del Cairo** che vive o compra a Swan Lake Residences,
sviluppo di Hassan Allam Properties. Non e' un compratore di palestra: e' un
compratore di **status residenziale**.

- **Cosa sa gia'**: conosce Swan Lake, conosce Hassan Allam, sa quanto costa la
  zona. Sa cos'e' un club privato — in Egitto i club sportivi privati sono una
  istituzione sociale, l'iscrizione si eredita.
- **Cosa teme**: di pagare in anticipo per un buco nel terreno; che il club apra
  in ritardo o peggio del promesso; che ci finisca dentro chiunque e l'esclusiva
  svanisca.
- **Come gli si risponde**: al primo timore **facendogli camminare dentro il
  club finito** — il 3D e' la risposta a *"com'e' che sara'?"*; al terzo con il
  codice di invito e la frase *"Together we can make Kode a community not just
  a club."*
- **Cosa deve pensare uscendo**: *"io questo posto l'ho gia' visto, ci sono gia'
  stato, e non ci entra chiunque."*

C'e' un secondo destinatario, piu' silenzioso: **il genitore.** Gran parte dei
testi parla di sviluppo dell'atleta, mentori, nursery, workshop per ragazzi,
psicologia e biomeccanica. Chi paga l'iscrizione di famiglia sta comprando un
percorso per i figli. E lo dicono esplicitamente: la partnership e' **"a
collaborative three-way partnership between the athlete, their family and our
mentors."**

## L'esperienza progettata

E' un **gioco travestito da visita**. Non e' una pagina che si scorre: e' una
mappa in cui si cammina, con un personaggio proprio, in **vista isometrica**
(camera ortografica, verificata nel codice).

Il ritmo e' quello di un'avventura leggera, non quello di un sito:

1. **Preloader** a schermo intero con il titolo in corpo enorme
   (`--font-size-preloader: 10rem`) e un contatore percentuale che parte da `0`,
   poi un pulsante `Enter`. Il caricamento e' pesante — **7,4 MB compressi
   prima di poter giocare** — e non lo nascondono: **lo mettono in scena**.
2. **Il patto.** Un personaggio parla e spiega le regole. Il visitatore risponde
   con pulsanti veri: `Ok, I agree`, `Let's do it!`, `Maybe later`. Non e' un
   tutorial passivo: e' **una conversazione con scelta**, dal primo secondo.
3. **Personalizzazione dell'avatar.** `Customize your character`, con le frecce.
   Le parti intercambiabili sono cinque, verificate nel codice: **Head, Mouth,
   Body, Socks, Shoes**. Prima ancora di vedere il club, il visitatore ha fatto
   **una cosa sua**.
4. **La camminata.** *"Just tap or click the direction you want to walk."*
   Da qui la struttura e' **aperta**: nessun ordine imposto.
5. **Gli incontri.** Arrivando in un'area, un membro dello staff appare e la
   racconta in 4-7 battute, con **fotografie vere del progetto** dentro la
   bolla di dialogo. Ogni discorso finisce quasi sempre con un `Fun fact:`.
6. **Giochi e video** come pause di ritmo, sempre offerti con un dialogo
   (`Let's play!` / `Maybe later, thanks!`), mai imposti.
7. **La raccolta.** Camminando si trovano borracce, tessere e stelle sparse per
   la mappa. Ognuna fa comparire `Achievement unlocked:`.
8. **La Dashboard**, dove achievement e trofei sbloccati stanno accanto a quelli
   ancora chiusi, visibili **sotto un lucchetto** (`lock.png`, piu' le versioni
   `-outline.png` dei tre trofei). Vedere il vuoto e' il motore che ti rimanda
   fuori a camminare.

**Cosa deve fare il visitatore**: personalizzare, camminare, ascoltare, giocare,
raccogliere, completare. E, alla fine, `Become a member`.

**L'immagine che resta**: il proprio omino, visto dall'alto, che attraversa a
piedi un club enorme e colorato, da solo, in una giornata di sole.

## Come e' organizzata la persuasione

E' organizzata **al contrario di come si fa di solito**, ed e' la cosa da
studiare.

- **La promessa non e' scritta, e' giocata.** Non c'e' un titolone "il club piu'
  bello del Cairo". La promessa e' il fatto stesso che tu ci stia camminando
  dentro. L'unica promessa esplicita sta nella About:
  `Welcome to a new kind of sports club`.
- **La prova e' distribuita nel cammino.** Ogni area e' una prova, e sono
  **numeri messi in bocca a un personaggio** invece che in una tabella: otto
  campi da tennis in terra rossa e uno in erba, tre di padel; quattro campi da
  squash; una pista lunga quasi **tre volte** una pista standard; un prato di
  **5.000 mq**; un campo omologato **FIFA e World Rugby**.
- **La prova sociale sono tre atleti veri**, ognuno legato a uno dei tre valori
  del club. Non testimonial generici: campioni del mondo e olimpionici, e uno
  (Raneem El Weleily) e' **egiziana** e torna anche in un `Fun fact` dentro
  l'Athletic Center. Ricorsione voluta.
- **Il prezzo e' dietro un codice.** Non esiste un listino. Il prezzo compare
  solo dopo un codice valido, ed e' **personale**: *"Your exclusive membership
  price is EGP [dynamic number]"*. La scarsita' non e' simulata con un timer:
  **e' strutturale**.
- **La chiamata all'azione e' sempre presente ma mai urlata**: `Become a member`
  sta nel menu, accanto a `Dashboard`, `About us` e `Navigate`. Quattro voci in
  tutto.

**Quante schermate per arrivarci**: zero di scorrimento, perche' non si scorre.
Ma il percorso e' lungo in *tempo*: preloader, patto, avatar, camminata. La CTA
di acquisto e' pero' raggiungibile **dal menu in qualsiasi momento**, ed e'
l'unica scorciatoia che hanno lasciato.

**E chi non arriva in fondo?** Qui sta il rischio grosso, e va detto senza
attenuanti: **chi non gioca non riceve quasi niente.** Non esiste una versione
"pagina" del messaggio. Chi chiude dopo il preloader ha visto un logo e una
barra. Le contromisure sono tre, tutte deboli:

1. La `<meta name="description">` fa il riassunto per chi arriva da Google:
   *"Discover Kode Clubs, a multi-disciplinary sports club located in Swan Lake
   Residence, New Cairo... Take a 3D tour of KODE!"*
2. La **pagina About** e' un sito normale, che si scorre, con testi lunghi, cinque
   video e un PDF: e' li' che sta il contenuto per chi non vuole giocare. Ma ci
   si arriva solo dal menu, e serve un achievement per farci andare la gente
   (`Curious — Visit the about page`).
3. Il menu con `Become a member` sempre in alto.

Detto brutalmente: **hanno accettato di perdere il visitatore frettoloso** in
cambio di un legame fortissimo con quello che resta. Per un club a invito, con
pochi posti e cari, e' un baratto che ha senso. **Per un cliente normale
sarebbe un disastro**, ed e' la prima cosa da spiegare a chi vede questo sito e
lo vuole uguale.

## Idea regista

**Il club non esiste ancora, quindi te lo facciamo visitare a piedi — e mentre
cammini ti mettiamo alla prova sui valori del club, per vedere se sei uno dei
nostri.**

## Il momento

**C'e', ed e' il pezzo piu' intelligente del sito.**

Durante il **mini-gioco del ciclismo**, mentre corri contro il tempo per battere
il tuo record, **incontri un altro ciclista infortunato**. Puoi tirare dritto —
stai cronometrando, e il gioco ti ha appena chiesto di battere il primato —
oppure **fermarti ad aiutarlo**.

Se ti fermi:

> "Wow, you stopped to help in the middle of your lap! *Not everybody would do
> that* – thanks!"

e ti sblocca il trofeo **Virtue Makes Victory**:

> "Very sporting of you! You helped your fellow competitor in the cycling game
> to earn the *Virtue Makes Victory* trophy. You've proved you understand that
> there's more to greatness than chasing lap times."

Cioe': **il club ha preso il proprio valore aziendale e l'ha trasformato in un
dilemma giocabile.** Non te lo dice, **te lo fa fare**.

Nel codice il ciclista infortunato e' **un personaggio a se'**: la classe
imposta `isInjured` e — importante — **lo esclude dallo staff**
(`this.isStaff = !!routes[characterID] && !this.isInjured`). Quindi **non ti
ferma lui**: non parte un dialogo automatico. Ha una `speechBubble` e un
`raycastTarget`, cioe' **devi essere tu a cliccarlo**. Nella scena 3D esiste un
oggetto `Park.glb/InjuredFinalPosition` e fra le 14 animazioni del personaggio
c'e' `Injured`. Lo stato viene salvato (`characters.Injured` → `setFinalState()`):
una volta aiutato, resta aiutato.

**E' un dilemma vero perche' il gioco non lo segnala.** Puoi finire la partita
senza accorgerti di niente.

Non ho potuto verificare a che secondo della gara compaia (`non verificato`): la
meccanica e' ricostruita dal codice e dai testi, non vista.

I tre valori del club — le "tre Kodes" — sono esattamente i tre trofei, e
ognuno ha il suo atleta:

| trofeo | come si prende | atleta che lo incarna |
|---|---|---|
| **Better Beats Best** | migliorare il proprio record | **Derek Redmond** |
| **Virtue Makes Victory** | fermarsi ad aiutare il ciclista | **Raneem El Weleily** |
| **Passion Powers Progress** | sbloccare *tutti* gli achievement | **Dara Torres** |

Derek Redmond e' l'uomo che nel 1992 finisce i 400 metri **zoppicando appoggiato
al padre**. Il valore non e' un poster in palestra: e' una persona che ha fatto
esattamente quella cosa. E il visitatore, nel gioco, deve fare la sua.

## Struttura, sezione per sezione

Non ci sono schermate di scorrimento: e' una mappa. Metto quindi la durata in
**battute di dialogo**, che e' l'unita' di misura vera di questo sito.

| sezione | cosa mostra | cosa fa l'utente | durata (battute) |
|---|---|---|---|
| Preloader | titolo + percentuale + `Enter` | aspetta, poi clicca | — |
| Intro | il patto e le regole | risponde `Ok, I agree` / `Let's do it!` | 5 |
| Customize | avatar, 5 parti scambiabili | sceglie con le frecce, `Let's go` | 1 schermata |
| **Athletic Center** | squash, ginnastica, arti marziali, tribuna | ascolta | 4 |
| **Fitness Complex** | 4 studi, pesi, cardio, spazi esterni | ascolta | 5 |
| **Performance Center** | nutrizione, recupero, psicologia, biomeccanica | ascolta | 4 |
| **Soccer/Rugby Pitch** | campo omologato FIFA e World Rugby | ascolta | 5 |
| **Tennis & Padel** | 8 campi in terra, 1 in erba, 3 di padel | ascolta | 6 |
| **Playground & Track** | pista, scooter elettrici, parco giochi | ascolta | 6 |
| **The Courts** | basket e calcio a 5, campi colorati | ascolta | 4 |
| **The Quad** | prato 5.000 mq, chioschi, frisbee, teqball | ascolta | 6 |
| **The Hub** | coworking, banca, supermercato, nursery, corsi | ascolta | 7 |
| **Club House** | ristoro, biliardo, simulatore di golf | ascolta | 5 |
| **Swimming Pool** | vasca olimpica, 3 jet pool, vasca ludica | ascolta | 5 |
| **Skatepark** | ledge, quarter pipe, rail | ascolta | 4 |
| **Mosque** | aperta ai soci tutti i giorni | ascolta | 1 |
| **Balance Board Challenge** | sfida da filmare e postare | ascolta | 4 |
| **Gioco calcio** | 1 minuto, gol a tempo | **gioca** | 3 + partita |
| **Gioco ciclismo** | 1 minuto, distanza | **gioca, e sceglie** | 4 + partita |
| **Brand film** | il film del marchio | guarda | 3 + video |
| **Video app** | l'app del club | guarda | 2 + video |
| **3 interviste** | Raneem, Derek, Dara | guarda | 3 ciascuna |
| **Ciclista infortunato** | un tizio a terra durante la gara | **clicca (o no)** | 1 |
| **Dashboard** | 16 achievement, 3 trofei, lucchetti | controlla i progressi | — |
| **About** | filosofia, programma, 5 video, PDF | **scorre** (unica parte che si scorre) | 6 blocchi |
| **Become a member** | codice, prezzo, anticipo | **compila e paga** | 2 passi |

## L'esperienza in ordine di tempo

**Primi dieci secondi** (le durate esatte sono `non verificato`: non ho aperto
un browser; il contenuto e' invece verificato):

- **0s** — Fondo pieno. Il nome `Kode` e il titolo in Antique Olive Compact,
  corpo `10rem`. Nel 2020: `Kode Sports Club New Cairo / Opening in Q2 2022`.
  Oggi la seconda riga non c'e' piu'. Sotto, un numero che parte da `0`.
- **0-8s** — Il numero sale. Sta scaricando davvero: **7,37 MB compressi**
  (9,26 MB decompressi) fra modello del parco, personaggio, mappe di occlusione
  e audio. Il caricamento e' un ostacolo reale, e il preloader e' progettato per
  farlo **sopportare**, non per fingere che non esista.
- **~8s** — Compare `Enter`. Nessuna anteprima del club dietro: il primo sguardo
  te lo devi guadagnare con un clic.
- **subito dopo** — Si entra sulla mappa, parte l'audio ambientale
  (`Ambient.m4a`, 499 KB) e il personaggio dell'intro comincia:
  *"Welcome to Kode, a private Sports Club opening in New Cairo."*

**Il resto, a blocchi:**

- **Blocco 1 — il patto (5 battute).** Cos'e': *"On this virtual tour, we'll
  give you a preview of what to expect when we open our doors"*. Cosa ci
  guadagni: *"You can meet staff members, play mini-games, and unlock
  achievements to complete your quest"*. Come si fa: *"Just tap or click the
  direction you want to walk"*. Chiude annunciando la personalizzazione.
- **Blocco 2 — l'avatar.** *"Use the arrows to select accessories and create
  your own gym style!"* Personalizzare **sblocca gia' un achievement**
  (`Stylish`). Primo premio dopo meno di un minuto: e' l'aggancio.
- **Blocco 3 — l'esplorazione libera.** Nessun ordine imposto. La musica cambia
  di stato: `Default.m4a` per la passeggiata, `Game.m4a` durante i mini-giochi,
  `Ambient.m4a` di fondo.
- **Blocco 4 — la raccolta.** Le tre serie da 8 oggetti spingono a passare anche
  dove non c'e' un campo da vedere. E' il meccanismo che **fa coprire tutta la
  mappa**, cioe' fa vedere tutto il club.
- **Blocco 5 — i video.** Piazzati come pause, e dichiarati tali: *"Whew! Let's
  catch our breath for a moment and watch a quick video."* Il sito **sa** di
  essere faticoso e ti concede il riposo.
- **Blocco 6 — la chiusura.** `Passion Powers Progress` arriva solo a chi ha
  sbloccato **tutto**. E' il trofeo del completista, e la ricompensa e' una
  frase: *"practice makes perfect, but passion makes you practice."*

## Il percorso di iscrizione, per intero

E' la parte che i clienti veri pagano, quindi la riporto completa. **Due passi,
due rami.**

**Passo 1 — il codice.**

> **Enter<br>your code**
> "To access the subscription area, you'll need a *unique code*.
> Got a code? Great! Enter it below for access."
> `Next` — `Don't have a code?`

Se il codice e' sbagliato o gia' usato:

> "The code you entered is incorrect or has already been used."

Nota: **"or has already been used"** — ogni codice vale una volta sola. La
scarsita' e' contabilizzata.

**Passo 2, ramo A — hai il codice.**

> **Become a member**
> "We're excited you're here! Your exclusive membership price is *EGP [dynamic
> number]*."
> (opzionale) "This price is only available for our founding members until
> *[date]*."
> "To secure your membership, we require a *[discount]* of the total membership
> price. Once your down payment is done, you will receive an email within one
> week to finalize the rest of your membership process and become an official
> member at KODE."
> (opzionale) "We offer a *2-months cooling-off period*, during which you can
> cancel your membership and receive a full refund, no questions asked."
> "If you'd like to know more, get in touch with a member of our team:
> [contact_email_address]"
> `Become a member today!`

I numeri stanno in un blocco `dynamic` dentro il JSON, cioe' sono **cambiabili
senza ricompilare il sito**:

| campo | 2020 (versione premiata) | oggi (13/08/2026) |
|---|---|---|
| `date` | `November 25th` | `November 25th` |
| `discount` | `10% down payment` | `10% down payment` |
| `periodicity` | `6 quartely installments` *(refuso nell'originale)* | `6 quarterly installments` |
| `cooling_off_period` | **`true`** | **`false`** |

Quindi: **anticipo 10%, saldo in 6 rate trimestrali.** E una cosa che si vede
solo confrontando le due versioni: **nel 2020 il periodo di ripensamento di due
mesi era acceso; oggi e' spento.** Quando dovevi vendere un club inesistente
offrivi il rimborso totale senza domande. Quando il club esiste, non serve piu'.
**La leva di rassicurazione era tarata sul rischio del compratore**, e l'hanno
tolta appena il rischio e' sparito.

Il prezzo non e' nel codice del sito: e' servito in base al codice inserito
(`[dynamic number]` e' un segnaposto). `SUPPOSTO` che ci sia una chiamata al
server.

**Passo 2, ramo B — non hai il codice.**

> **How to<br>get your code**
> "To be eligible for a *Kode membership*, you'll need to be referred by another
> Kode member, then you'll go through a quick and simple process by our trusted
> selection panel. *Together we can make Kode a community not just a club.*"
> "If you know someone with a Kode membership, please *fill in the below form*
> or if you'd like to know more about how referrals work, drop us a line on
> [contact_email_address]"

Il ramo B e' **il vero modulo di contatto del sito**: chi non ha il codice
diventa comunque un contatto in lista. **Il rifiuto e' progettato per
raccogliere, non per respingere.**

E qui c'e' il dettaglio commerciale piu' istruttivo del confronto 2020/oggi:
**nel 2020 il ramo B non aveva nessun modulo.** Diceva solo *"drop us a line on
[email]"*. **Il modulo l'hanno aggiunto dopo.** Cioe': hanno scoperto sul campo
che il traffico che arriva senza codice e' troppo prezioso per lasciarlo andare
via con un indirizzo e-mail, e hanno messo un modulo di raccolta. E' esattamente
la correzione che farebbe qualunque agenzia dopo aver guardato i numeri, e sta
scritta nel diff.

Da notare, con la stessa onesta': i link di iscrizione, termini, WhatsApp e app
sono **accorciatori bit.ly** (`bit.ly/kodemembership`,
`bit.ly/KODETermsConditions`, `bit.ly/KODEWhatsapp`, `bit.ly/KODEApp`). Un Site
of the Year che fa passare la conversione da bit.ly: lo segnalo perche' e'
esattamente il genere di scelta pratica che si vede nei progetti veri e mai nei
portfolio.

## Cosa e' cambiato dal 2020 a oggi

Confronto riga per riga fra il JSON `content` della build premiata
(`20201124_144630`) e quella viva (`20250516_134806`). **Il 3D e' identico al
byte**; e' cambiato solo il testo. Elenco completo:

| cosa | 2020 | oggi |
|---|---|---|
| Preloader | `Kode Sports Club New Cairo<br>Opening in Q2 2022` | `Kode Sports Club New Cairo` |
| Intro | "...opening in New Cairo, **Q2 2022**." | "...opening in New Cairo." |
| About | "making its debut **in Q2 2022** at Swan Lake Residences" | "making its debut at Swan Lake Residences" |
| Telefono | **numero vero**: `+20 12 20 42 55 55`, etichetta `E-mail`/`phone_cta` | link **WhatsApp** (`bit.ly`), etichetta `Chat with us` |
| Social | link **Facebook** (`Kode-Sporting-Club-101063235137838`) | Facebook **rimosso**, aggiunto **link all'app** |
| Menu | voce `code` | voce `join` + `join_link` esterno |
| Legale | `Legals` (parola sbagliata) | `Legal`, con PDF dei termini |
| Pagamento | "The full balance will be split into [periodicity]. Once we have your down payment, **a member of our staff will be in touch**" | "Once your down payment is done, **you will receive an email within one week**" |
| Ripensamento | **attivo** | **spento** |
| Ramo senza codice | solo "drop us a line" | **"please fill in the below form"** |
| Apertura del prezzo | "**Good news!** Your exclusive membership price..." | "**We're excited you're here!** Your exclusive..." |
| Analytics | Universal Analytics `UA-178119121-1` | **GA4** `G-VJ23EMBSVR` |

Traduzione in linguaggio commerciale: **il club e' passato da "apriremo" a
"siamo aperti"**; il contatto e' passato dal telefono a WhatsApp; il pagamento
si e' automatizzato (dalla telefonata di un addetto all'e-mail entro una
settimana); la rassicurazione da rimborso e' stata ritirata; e la raccolta di
contatti e' stata rafforzata. **Sedici modifiche di testo in cinque anni, e
nemmeno un poligono toccato.**

## Animazioni

| elemento | cosa si muove | legato a | curva o inerzia | note |
|---|---|---|---|---|
| Avatar | cammina fino al punto cliccato | **input dell'utente** | percorso su **navmesh** | non e' scroll: e' un gioco |
| Animazioni del personaggio | 14 clip scheletriche | stato del gioco | `AnimationMixer` di three.js | elenco verificato, sotto |
| Camera | isometrica, segue l'avatar | posizione dell'avatar | `non verificato` | **OrthographicCamera** verificata |
| Bersaglio | `Target.svg` compare dove hai cliccato | clic | — | feedback del comando |
| Puntamento | `Hover.svg`, `Arrow.svg` | passaggio del mouse | — | |
| Bolla di dialogo | `Park.glb/SpeechBubble` entra/esce | stato del dialogo | — | `Exclamation.svg` segnala chi puo' parlare |
| Farfalle | `Butterfly.svg` | tempo | `non verificato` | dettaglio d'ambiente |
| Onda | `Park.glb/Wave` | tempo | `non verificato` | probabilmente l'acqua della piscina |
| Palloni | `Park.glb/Ball`, `BallSoccer_001`, `Goal`, `Penalty` | fisica | **cannon.js**, gravita' `50` | il gioco del calcio |
| Oggetti raccoglibili | `Bottle_001`, `Card_001`, `Star_001` | prossimita' / clic | `sparkles.png` all'incasso | 8 per tipo |
| Pulsanti | ruotano e rimpiccioliscono | hover / active | `rotate(-.5deg) scale(.975)`, `rotate(-1deg) scale(.95)` | **verificato nel CSS** |
| Pastiglia dei pulsanti | pseudo-elemento che ruota di 15° | hover / active | `transform .5s var(--ease-out-expo)` e `var(--ease-out-swift)` | **verificato nel CSS** |
| Entrate a cascata | elementi che entrano in sequenza | stato | `--animation-index: 1..4` | ritardo scalato per indice, **CSS puro** |

Le **14 animazioni del personaggio**, estratte da `Character.glb`:
`AirSquat`, `BicycleCrunch`, `Cycling`, `HappyIdle`, `Injured`, `PushUp`,
`RightTurn`, `Running`, `SittingIdle`, `SoccerPenaltyKick`, `Swimming`,
`TreadingWater`, `Walking`, `Waving`.
Da sole raccontano tutto il gioco: si cammina, si corre, si nuota, si pedala, si
tira un rigore, si fanno flessioni — **e c'e' un infortunato.**

Il CSS porta una **libreria di 30 curve** dichiarate come variabili
(`--ease-in-back` … `--ease-out-swift`). Le due di firma, usate sui pulsanti:
`--ease-out-expo: cubic-bezier(.19, 1, .22, 1)` e
`--ease-out-swift: cubic-bezier(.55, 0, .1, 1)`.

**Librerie**: **GSAP / TweenMax** per il movimento dell'interfaccia (trovati
`gsap`, `TweenMax`, `GreenSockGlobals`, `gsapVersions`), **three.js** per il 3D,
**cannon.js** per la fisica.

## Colori

Dalle variabili CSS (**verificato**), piu' la terna dichiarata da Awwwards.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| Bianco | `#fff` | testo su fondi pieni, superfici dei pannelli |
| Nero | `#000` | testo principale (`--color-black`) |
| Grigio | `#333` | testo secondario (`--color-grey`) |
| Blu profondo | `#1c228c` | `--color-blue`, blu di marca |
| Magenta | `#f50359` | `--color-magenta`, accento forte |
| Arancione | `#ff4000` | `--color-orange`, accento caldo |
| Viola | `#7d0e8b` | `--color-purple` |
| Rosa/corallo | `#fe3e6c` | 5 occorrenze, accento ricorrente |
| Viola chiaro | `#8a3796` | 5 occorrenze |
| Giallo | `#eecd02` | accento puntuale |
| Verde | `#6bb78c` | accento puntuale |
| Azzurro | `#5fa2e4` | accento puntuale |
| Blu Facebook | `#3b5998` | pulsante di condivisione |
| Azzurro Twitter | `#00acee` | pulsante di condivisione |

Awwwards dichiara invece `#2779a7`, `#49c5b6`, `#FF9398` — azzurro, verde acqua,
rosa. Sono i colori **della scena 3D** (cielo, prato, campi), non
dell'interfaccia: le due palette convivono perche' descrivono due strati
diversi. Fonte: https://www.awwwards.com/sites/kode

Il colore dei campi e' un tema **esplicito nei testi**: *"These colourful and
unique courts were designed to bring out your inner showboat."* E fra gli asset
del canvas c'e' un file che si chiama `Colors.svg`: la tavolozza della scena e'
un asset a se'.

## Tipografia

Un solo carattere, in due tagli. Nessun servizio esterno: **quattro file
woff/woff2 auto-ospitati** sul bucket dello studio (verificato — nessuna
chiamata a Google Fonts o Typekit).

| livello | famiglia | uso | desktop | mobile |
|---|---|---|---|---|
| Preloader | Antique Olive Compact | titolo di caricamento | `10rem` | `8rem` |
| xxl | Antique Olive Compact | titoli di sezione | `4rem` | `3.5rem` |
| xl | Antique Olive Compact | titoli | `3rem` | `2.5rem` |
| l | — | | `2rem` | `2rem` |
| m | Antique Olive | corpo | `1.4rem` | `1.1rem` |
| s | Antique Olive | testo minore | `1.2rem` | `.9rem` |
| xs | Antique Olive | etichette | `1rem` | `.8rem` |

- `--font-family-default: "Antique Olive"` — il tondo.
- `--font-family-strong: "Antique Olive Compact"` — il taglio stretto e nero,
  quello del logo e dei titoloni.

**Antique Olive** e' un carattere francese di **Roger Excoffon** (1962), per la
Fonderie Olive di Marsiglia. Scelta non banale e molto coerente: e' il carattere
delle insegne sportive francesi degli anni Sessanta — grasso, tondo, allegro,
**non tecnologico**. Un club sportivo raccontato con il carattere dei manifesti
sportivi, non con un grottesco svizzero da agenzia digitale. Ed e' anche un
piccolo omaggio dello studio parigino a se' stesso.

C'e' una **versione bitmap del carattere per il 3D**:
`AntiqueOlive-Compact.json` + `.png` nel pacchetto canvas — un atlante di glifi
per scrivere testo **dentro** la scena WebGL con lo stesso carattere
dell'interfaccia.

Interlinea e crenatura: `non verificato` (non isolate nel CSS minificato).

## Testi veri

**Preloader**
> 2020: `Kode Sports Club New Cairo` / `Opening in Q2 2022`
> oggi: `Kode Sports Club New Cairo`
> `Enter`

**Menu** (quattro voci)
> `Dashboard` · `About us` · `Become a member` · `Navigate`

**Apertura del tour**
> "Welcome to *Kode, a private Sports Club* opening in New Cairo."
> "On this *virtual tour*, we'll give you a preview of what to expect when we
> open our doors."
> "You can meet *staff members*, play *mini-games*, and unlock *achievements* to
> complete your quest."
> "Just *tap or click* the direction you want to walk and you're on your way!"
> "But before you set off on the tour, let's take a moment to *personalize your
> avatar*..."

**Personalizzazione**
> `Customize your character`
> "Use the arrows to select accessories and create your own gym style!"
> `Let's go`

**Pulsanti di dialogo** — scritti come parlato, mai come interfaccia:
> `Tell me more` / `See you later` · `Next` / `Thanks, bye!` · `Ciao`
> `Ok, I agree` · `Let's do it!` / `Maybe later`
> `Let's play!` / `Maybe later, thanks!` / `You're welcome!`
> `Play again` / `Quit the game`

**Fine dei mini-giochi**
> `You scored<br>[x] goals.` — "You best score is [x] goals. Want to play again?"
> `You rode<br>[x] km.` — "You best score is [x] km. Want to play again?"

**Etichette degli oggetti da raccogliere**
> `Reusable bottles` · `Accessibility cards` · `Connectivity Stars`
> `/8 collected`

**I tre pop-up della raccolta** (una frase di marca per ogni oggetto):
> "Congrats, you just found one of our *reusable bottles!* Recycling is
> important to us, so we try to cut down on waste. There are more bottles to
> find in the Club so keep your eyes peeled!"
> "Nice! You just found an *accessibility card.* We want our Club to be as
> accessible as possible to everyone. Keep an eye out for more around the club!"
> "Congrats, you just found a *connectivity star!* At Kode we value the
> importance of staying connected wherever you are."

**About**
> `Welcome to a new kind of sports club`
> "Kode is a multi-disciplinary sports club, making its debut at Swan Lake
> Residences," — `Youssef El Sebai, First New Cairo` — `See brand film`

> **Our philosophy** — `Great sportsmanship comes from great character`
> "Our *sports philosophy* was inspired by the concept of "arete", the notion of
> *excellence and moral virtue.* For us, that means living up to your full
> potential, in life as well as in sport. But while we strive for peak
> performance, we never lose sight of the joy, the creativity and the freedom
> that sports can bring. *Our athletes are driven by more than goals; they're
> powered by passion.*"

> **Sports program** — `Our Holistic Athlete Development Program`
> "Our ground-breaking sports program addresses every aspect of an athlete's
> development; *training the body, disciplining the mind, and building
> character,* all while keeping abreast of the continuous advances in sports
> science and technology."

> **Athlete's performance** — `Performance through partnership`
> "*Every athlete is unique* – that's why we design bespoke performance
> enhancement plans (P.E.P) to maximize each athlete's performance and implement
> them through our *Continuous Improvement Cycle.* We create a collaborative
> three-way partnership between the *athlete, their family and our mentors* as
> we work together towards a shared goal."

> **Sports Performance Center** — `An environment for excellence`
> "Our Sports Performance Center is a *purpose-built facility* where we hone
> every element that makes a great athlete, *from nutrition and recovery to
> psychology and biomechanics.*"

> **Our programs** — `To know more`
> "Download our PDF and find out more about our sports proposition."
> `Our Sports Proposition` — `Download`

> **Piede della About**: "Kode is managed and operated by Blue Ribbon, a
> management holding company conceived with a mission to create inspirational
> communities that harness the positive power of collective good."

**Piede**
> `Kode by Blue Ribbon, Hassan Allam properties`
> `E-mail` → `info@kodeclubs.com` (`Click to copy` → `Copied!`)
> `Chat with us` → WhatsApp · `Legal`

**Cookie**
> "By continuing to use this website, you agree to the use of cookies which
> allow us to measure user behaviour on our site, for more information"
> `view our cookie policy`

**Rotazione del telefono**
> `Please rotate your device`

**Browser vecchio**
> `Sorry`
> "Looks like your browser or device is not up to date. Please try another
> browser or device to access this content."

**Nota di scrittura**: i discorsi finiscono quasi sempre con un `Fun fact:` —
le palline da tennis gialle introdotte nel 1986 per la TV a colori, gli
occhialini da nuoto ricavati da gusci di tartaruga, i 240 milioni di
calciatori, la palla da ping pong a 160 km/h, e **una palestra di 2.300 anni fa
trovata a 80 km dal Cairo**. Sono **regali gratuiti** che ripagano chi si e'
fermato ad ascoltare — e l'ultimo non e' scelto a caso: dice *lo sport qui c'e'
da sempre.*

## Mobile

Il sito **esiste** sul telefono, ma con quattro differenze grosse, tutte
verificate nel codice.

**1. Impone la rotazione in orizzontale.** C'e' una schermata dedicata,
`Please rotate your device`, servita dalla combinazione
`@media only screen and (hover:none) and (pointer:coarse) and (min-width:220px)
and (max-width:1023px)` + `@media (orientation:landscape)`. **Sul telefono il
sito si guarda solo in orizzontale.** Non e' un ripiego: e' una dichiarazione —
*questo e' un gioco, non una pagina.*

**2. Puo' rifiutarsi di partire, e decide guardando la scheda video.** C'e' una
classe che crea un canvas, chiede il contesto `experimental-webgl`, **legge il
modello della GPU** e assegna una qualita'. Il codice, testuale:

| GPU | esito |
|---|---|
| **NVIDIA** con `GTX` nel nome | `High` |
| altre NVIDIA | `Medium` |
| **AMD** con `RX`, o numero di serie > 7 | `High` |
| altre AMD | `Medium` |
| **Intel** (grafica integrata) | **`Low`** |
| **Adreno** (Android Qualcomm) generazione > 4 | `High` |
| altre Adreno | **`Low`** |
| **Apple** generazione > 9 | `High`; > 7 `Medium`; sotto `Low` |
| GPU non riconosciuta | **`Low`** |

Il livello pilota il `pixelRatio` del renderer (`Math.clamp(quality, .5,
devicePixelRatio)`) e la dimensione della mappa d'ombra. E con
`oldBrowserMessage: true` piu' `window.isSupported`, se il dispositivo non regge
il WebGL al posto del club compare `Sorry — Looks like your browser or device is
not up to date`.

**Non c'e' un ripiego in HTML: c'e' un muro.** Per un club che vende iscrizioni
questo e' il rischio piu' serio dell'intero progetto, e va detto senza
attenuanti: **un potenziale socio con un telefono vecchio non vede il club, vede
un messaggio d'errore.**

**3. Il comando cambia da puntatore a dito.** Il CSS separa esplicitamente
`@media (hover:hover)` da `@media (hover:none) and (pointer:coarse)`: gli
effetti al passaggio del mouse esistono **solo** dove c'e' un mouse. Coerente
con il testo dell'intro, che dice `tap or click`, non solo "click".

**4. La tipografia scende di un gradino.** Preloader da `10rem` a `8rem`, xxl da
`4rem` a `3.5rem`, corpo da `1.4rem` a `1.1rem`, etichette da `1rem` a `.8rem`.
E' una riduzione **contenuta**: il carattere resta enorme, il sito resta
"grosso" anche in piccolo.

**Il salto vero e' pero' un altro**: **7,37 MB compressi da scaricare prima di
vedere qualsiasi cosa.** Su una rete mobile egiziana del 2020 e' l'ostacolo
principale, e non lo risolvono alleggerendo: lo risolvono **mettendo in scena
l'attesa**.

**Cosa NON ho verificato sul mobile**: se la mappa 3D sia semplificata oltre al
pixelRatio, se i mini-giochi siano gli stessi, se le aree siano tutte
raggiungibili. Il codice non me lo dice e non ho aperto un browser.

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| Struttura | **SPA**, guscio HTML + 4 bundle | **VERIFICATO** | `<base href="/">`, i dati in `var content`, un router interno (`router.navigate("/dialog/intro")`) |
| Caricatore di script | **loadjs** | **VERIFICATO** | `loadjs=function(){...}` incollata in chiaro nell'`<head>` |
| Impacchettatore | **webpack** | **VERIFICATO** | `runtime.bundle.js`, `vendors~App.bundle.js`, schema classico |
| 3D | **three.js** | **VERIFICATO** | `THREE.WebGLShader`, `THREE.KeyframeTrack`, `THREE.Quaternion`, `AnimationMixer`; dichiarato anche da Awwwards |
| Camera | **OrthographicCamera** (isometrica) | **VERIFICATO** | presente nel bundle app, con `PerspectiveCamera` per altri usi |
| Navigazione | **navmesh con raycaster** | **VERIFICATO** | classe che percorre `Park.glb/Navmesh`, calcola i centroidi delle facce, costruisce celle e bounding box, e fa `containsPoint` |
| Animazione UI | **GSAP / TweenMax** | **VERIFICATO** | `gsap`, `TweenMax`, `GreenSockGlobals`, `gsapVersions` |
| Animazione personaggio | **AnimationMixer + armatura** | **VERIFICATO** | 14 clip in `Character.glb`, armatura potata a `Hips`/`Character` |
| Fisica | **cannon.js** | **VERIFICATO** | `cannon.js.git` nel bundle; parametri `gravity: 50`, `timeScale` |
| Collisioni | `ColliderBox`, `ColliderCylinder` | **VERIFICATO** | oggetti dentro `Park.glb` |
| Geometrie compresse | **Draco** | **VERIFICATO** | `draco_decoder.wasm`, `draco_encoder.js`, versione `gltf/` dedicata |
| Texture compresse | **Basis Universal** | **VERIFICATO** | `basis_transcoder.wasm`, `msc_basis_transcoder.wasm` |
| Illuminazione | **MatCap + env map + AO cotta** + una key light con ombre | **VERIFICATO** | `MatCap.jpg`, `env_map/`, `ao_maps/Blocks_*`, `ao_maps/Other.png`; nel codice `keyLight.shadow.mapSize` |
| Post-produzione | **post-processing attivabile** | **VERIFICATO** | `settings.postProcessing.enabled` nel renderer |
| Nebbia | **fog** | **VERIFICATO** | blocco `fog` nelle impostazioni della scena |
| Modelli | `Park.glb` (club), `Character.glb` (avatar) | **VERIFICATO** | manifest + riferimenti nel codice |
| Testo nel 3D | atlante di glifi | **VERIFICATO** | `AntiqueOlive-Compact.json` + `.png` |
| Audio | 3 tracce `.m4a` a stati | **VERIFICATO** | `Ambient` 499 KB, `Default`, `Game` 540 KB |
| Font | woff + woff2 **auto-ospitati** | **VERIFICATO** | 4 file sul bucket, zero servizi esterni |
| Hosting asset | **Google Cloud Storage / App Engine** | **VERIFICATO** | `storage.googleapis.com/mm-kode.appspot.com`, bucket **dello studio** |
| Statistiche | **GA4** `G-VJ23EMBSVR` (nel 2020: **UA** `UA-178119121-1`) | **VERIFICATO** | campo di configurazione + `window.dataLayer` |
| Tracciamento eventi | mappa route → evento | **VERIFICATO** | `tracker.map = {"dialog/intro":"intro","video/brand-film":"special-content/brand-film", ...}` |
| CMS | **nessuno in tempo reale**; testi compilati nella pagina | **VERIFICATO** | tutto dentro `var content`, zero chiamate API per il contenuto |
| Prezzi | serviti in base al codice | **SUPPOSTO** | segnaposto `[dynamic number]`, `[date]`, `[discount]` |
| Link di conversione | **bit.ly** | **VERIFICATO** | 4 accorciatori nel JSON |
| Versione di three.js | — | `non verificato` | la costante `REVISION` non emerge dal bundle minificato |

**Nota da leggere**: i testi **non** arrivano da un CMS in tempo reale, sono
compilati dentro la pagina. Il blocco `dynamic` (data, anticipo, rate,
ripensamento) e' l'unica valvola per cambiare le condizioni commerciali senza
ricompilare — ed e' esattamente quella che hanno girato in cinque anni. Per un
sito-gioco e' la scelta giusta: zero richieste di rete per il contenuto.

Nel bundle c'e' anche un **pannello di sviluppo** rimasto nella build di
produzione (`development: !0`, controlli con `min`/`max`/`step` per posizione
delle luci, qualita', gravita', scala del tempo, nebbia). Non e' esposto
all'utente, ma dice come lavoravano: **tutta la scena era regolabile a mano dal
vivo.**

## Peso e prestazioni

Numeri veri, misurati oggi sui file reali.

| voce | peso |
|---|---|
| HTML della pagina | **155.230 byte** (2020: 154.573) |
| `vendors~App.bundle.js` | **721.143 byte** |
| `App.bundle.js` | **321.062 byte** |
| `Home.bundle.js` | **5.186 byte** |
| `runtime.bundle.js` | **3.911 byte** |
| `App.bundle.css` | **41.727 byte** grezzi / **7.693** gzip |
| `Home.bundle.css` | **0 byte** (file vuoto lasciato dalla compilazione) |
| **Totale HTML+JS+CSS** | **~1,25 MB** |
| `packs/canvas.pack` | **5.470.383 byte** trasferiti (gzip) → **7.793.181** decompressi, 19 voci |
| `packs/app.pack` | **1.567.919** trasferiti → **1.569.264** decompressi, 5 voci |
| `packs/about.pack` | **329.289** trasferiti → **342.568** decompressi, 10 voci |
| **Totale pacchetti** | **7.367.591 byte trasferiti = 7,03 MB** (9,26 MB decompressi) |
| **Totale prima di poter giocare** | **~8,3 MB trasferiti** |

**I video, a parte, e sono enormi:**

| video | peso |
|---|---|
| `itw-3.mp4` (Dara Torres) | **41.467.594 byte** (39,5 MB) |
| `itw-2.mp4` (Derek Redmond) | **36.386.690** (34,7 MB) |
| `itw-1.mp4` (Raneem El Weleily) | **35.191.883** (33,6 MB) |
| `brand-film.mp4` | **17.885.689** (17,1 MB) |
| `app.mp4` | **14.800.280** (14,1 MB) |
| **totale** | **145.732.136 byte ≈ 139 MB** |

Piu' una seconda copia di ciascuno (`_og.mp4`) e i poster `.jpg`. **Un
visitatore che guarda tutto scarica oltre 150 MB.** Si scaricano solo a
richiesta, ed e' per questo che i video sono offerti con un dialogo (*"why not
find out the story behind Kode?"*) e non partono da soli: **il dialogo e' anche
un consenso al download.**

Altri pesi: `Kode_Program.pdf` 73.183 byte, `map-menu.png` 130.790,
`tutorial.png` 73.579, `Ambient.m4a` 499.296, `Game.m4a` 539.646,
`about_001.mp4` 129.593 (i video della About sono minuscoli: sono anelli
decorativi, non filmati).

**Le contromisure sul peso ci sono tutte**: Draco per le geometrie, Basis per le
texture, occlusione ambientale **cotta** in mappe invece che calcolata,
illuminazione **MatCap** (una texture al posto di luci vere), tre pacchetti
separati caricati a richiesta, e i pacchetti **serviti gia' compressi** dal
bucket (`x-goog-stored-content-encoding: gzip`).

**Punteggi Lighthouse e tempi reali**: `non verificato` — non ho profilato e non
ho aperto un browser. Su un sito che scarica 8 MB e mostra un contatore
percentuale il punteggio non e' comunque l'indicatore giusto: il progetto ha
**scelto** di essere pesante e ha costruito il preloader per reggere la scelta.

## Tre cose da rubare

**1. Il valore aziendale trasformato in una scelta giocabile — e non
segnalata.**
Non "siamo un club che crede nella sportivita'": ti mettono a cronometro, ti
fanno incontrare un ciclista a terra, **non ti avvisano**, e vedono se ti fermi.
Chi si ferma riceve *"Not everybody would do that – thanks!"* e il trofeo. Nel
codice l'infortunato e' escluso dallo staff proprio perche' **non deve fermarti
lui: devi fermarti tu.**
**Rifacibile in piccolo**: qualunque cliente con un "valore" nel chi-siamo puo'
avere **un momento in cui il visitatore sceglie**, e ricevere una risposta
diversa a seconda di come sceglie. Costa una `if` e due righe di testo.

**2. La raccolta di oggetti come mappa di copertura — con tre argomenti noiosi
travestiti da premio.**
Le 8 borracce, le 8 tessere e le 8 stelle non sono decorazione: sono lo
strumento che costringe a passare **anche dove non c'e' un campo da tennis**,
cioe' a vedere tutto il club. E ogni oggetto **e' un messaggio di marca**: la
borraccia dice *riduciamo i rifiuti*, la tessera dice *siamo accessibili a
tutti*, la stella dice *siamo connessi ovunque*. Sono le tre voci piu' noiose di
qualsiasi brochure — sostenibilita', accessibilita', tecnologia — e le hanno
rese **tre cose da trovare**.
Rifacibile senza 3D: in una pagina lunga, tre elementi nascosti che si sbloccano
scorrendo.

**3. Il prezzo dietro un codice, e il rifiuto che raccoglie contatti.**
Nessun listino. C'e' `Enter your code`, e chi non ce l'ha finisce su una seconda
schermata che gli spiega **come meritarselo** e gli fa lasciare i dati. La
scarsita' non e' un finto conto alla rovescia: e' il modo in cui funziona
davvero l'iscrizione, codice monouso compreso (*"or has already been used"*).
E il ramo "non ce l'ho" e' progettato per **convertire comunque** — tanto che
dopo il 2020 ci hanno **aggiunto un modulo**, che nella versione premiata non
c'era.
**Rifacibile domani mattina** per qualunque servizio locale che voglia sembrare
selettivo: preventivo su invito, listino a richiesta, lista d'attesa.

**Bonus, la lezione piu' pratica di tutte**: in cinque anni hanno cambiato
**solo i testi** — sedici stringhe — e non hanno toccato un poligono. Un sito
premiato puo' restare in servizio a lungo **se le cose che invecchiano (date,
prezzi, condizioni, contatti) stanno in un blocco separato dal resto.**

## Non verificato

- **Tutto il movimento vero.** Non ho visto il sito muoversi: nessun browser
  aperto. Animazioni, curve, durate e inerzie del 3D sono dedotte da CSS, nomi
  degli asset e codice. Le voci `non verificato` nella tabella delle animazioni
  sono quelle piu' esposte.
- **A che punto della gara compaia il ciclista infortunato**, e se sia possibile
  incontrarlo fuori dal mini-gioco del ciclismo.
- **Come si muove davvero la camera**: e' ortografica (verificato) ma non so se
  ruoti, se segua con inerzia, ne' quanto zoomi.
- **Se la minimappa sia attiva**: esistono `Minimap.png` e `map-menu.png`
  (130 KB), e una voce di menu `Navigate`. **SUPPOSTO** che `Navigate` apra una
  mappa per saltare da un'area all'altra, ma non l'ho visto.
- **Le opzioni vere di personalizzazione**: so che le parti sono Head, Mouth,
  Body, Socks, Shoes (+ una collana e una medaglia per `Body_Winner`), ma
  `Characters.json` sta dentro un pacchetto binario e il bucket risponde `403`
  ai file sciolti. Quante varianti per parte: `non verificato`.
- **Come funzionano davvero i due mini-giochi**: so che il calcio usa fisica
  (`Ball`, `Goal`, `Penalty`, gravita' 50) e che si gioca "a tempo di clic", ma
  non li ho giocati.
- **Il comportamento vero sul telefono**: se la scena sia alleggerita oltre al
  `pixelRatio`.
- **La versione di three.js.**
- **Interlinea e crenatura** della tipografia.
- **Numero di richieste di rete, tempi di caricamento reali, Lighthouse.**
- **Se il prezzo arrivi da una chiamata al server** e come sia gestito il
  pagamento dell'anticipo (il flusso finisce su un `bit.ly` esterno).
- **La licenza del carattere**: i file si chiamano `AntiqueOlive.woff` e
  `AntiqueOlive-Compact.woff`, ma non ho verificato taglio e licenza presso la
  fonderia.
- **Chi sia "Blue Ribbon"** oltre a quanto dichiara il piede della About.
- **I crediti nominali del progetto** (chi ha fatto cosa dentro Merci Michel):
  la pagina di progetto dello studio non li elenca nella versione che ho letto.
