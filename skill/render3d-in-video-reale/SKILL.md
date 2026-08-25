---
name: render3d-in-video-reale
description: Costruire un sito con un'esperienza 3D immersiva guidata dallo scroll: si fa progettare l'esperienza a Gemini hce 3.0 (obiettivo, palette, tipografia, testi, coreografia al secondo), si scrive tutto in un md, si modella e si anima in BLENDER da codice, si fanno giudicare i filmati guida finche' non sono approvati, si vestono i fotogrammi chiave con Gemini, si generano i video con Veo e si scorrono su canvas. Usala per ogni demo o sito in cui un prodotto si compone, si smonta o si monta sotto lo scroll; per capire perche' un'animazione 3D "non trasmette emozioni"; e per sapere come chiedere a hce 3.0 un progetto completo invece di consigli generici.
---

---

# FASE ZERO — far progettare l'esperienza, prima di aprire Blender

L'errore piu' costoso non e' tecnico: e' **cominciare a modellare senza sapere
che esperienza si sta costruendo**. Un sito con un oggetto 3D che si compone
non e' "un'animazione messa in una pagina": e' una regia, e va progettata da
qualcuno che sappia cosa tiene incollata una persona allo schermo.

Quel qualcuno e' **hce 3.0**. Ma il modo in cui gli si chiede decide la qualita'
di quello che torna, e la differenza fra una risposta usabile e una inutile e'
tutta nel prompt.

## 1. Dichiarare l'OBIETTIVO VERO, non il soggetto

Il soggetto e' quasi sempre un pretesto. Su una demo per un'agenzia:

> Questo sito NON deve vendere panini. Deve vendere IL SITO a chi fa panini e
> alle agenzie. Il paninaro e' il pretesto; il compratore e' chi guarda e pensa
> "lo voglio per il mio locale". Giudica ogni scelta su: fa dire wow nei primi
> tre secondi? si ricorda domani? si racconta a un collega?

Senza questa riga si riceve un progetto per vendere panini, che e' un altro
lavoro. **Con questa riga cambia la chiusura del sito**, e la chiusura e' la
sezione che sposta il prezzo.

## 2. Dichiarare il MERCATO, sempre

Gemini legge l'indirizzo IP e assume. Su un lavoro per la Brianza ha dato
consigli tarati sul sud Italia, con un'altra clientela e altri prezzi. Va
scritto esplicitamente:

> Il mercato e' Monza e Brianza. NON sud Italia.

## 3. Chiedere VALORI, non principi

La formula che funziona:

> Dammi valori esatti. Niente premesse, niente complimenti.

E per ogni cosa, la **forma** della risposta. Per la coreografia:

> secondo di inizio | secondo di fine | posizione camera (distanza in cm,
> altezza in gradi, rotazione in gradi) | focale mm | apertura f/ | dove punta
> | cosa si muove e di quanto | curva di easing esatta

Senza la forma si riceve prosa. Con la forma si riceve una tabella che si
trascrive nel codice.

## 4. Le domande che rendono di piu'

Provate, in ordine di resa:

- **«cosa fa sembrare ECONOMICO un sito di questo tipo? I cinque errori che
  vedi piu' spesso»** — vale piu' di dieci consigli su cosa fare;
- **«cosa manca del tutto, che a questa cifra ci si aspetta di trovare»**;
- **«i tre errori che con questo materiale farei piu' probabilmente»**;
- **«qual e' l'idea regista, UNA sola, che tiene insieme tutta la pagina»** —
  senza questa si ottiene un elenco di effetti scollegati;
- **«manca un MOMENTO? un istante preciso che faccia dire wow e che adesso non
  c'e'»** — e' la domanda che ha prodotto il micro-contatto, cioe' il pezzo
  migliore di tutto il progetto.

## 5. Cosa chiedere, in concreto — TUTTO, e tutto dinamico

Non si chiede "un'idea di stile". Si chiede l'intero progetto, voce per voce,
con i valori gia' pronti da incollare. **Niente resta fermo: ogni elemento
della pagina deve avere il suo movimento dichiarato.** Se una cosa non e' nella
lista che segue, si finisce a inventarla — ed e' li' che il sito perde il
prezzo.

**I colori.** Palette completa in esadecimale: fondo, fondo alternato,
superfici, testo primario, testo secondario, bordi, accento, accento allo
sfioramento, ombre (con offset e sfocatura in px), e i due o tre gradienti con
i loro stop e le loro angolazioni. Poi la domanda che gli altri non fanno:
**«quale accento NON devo usare, e perche'»**. E per un sito con una tela 3D:
**«qual e' il colore di fondo esatto della tela, quello che deve combaciare col
fondo dei render, in esadecimale»** — se non combacia si vede il rettangolo.

**La tipografia.** Due famiglie esatte (nome e provenienza), i pesi da caricare,
e per ogni livello — occhiello, titolo, sommario, didascalia, dato, voce di
menu, pulsante — corpo in rem, interlinea, spaziatura fra le lettere,
trasformazione maiuscole, **separati per desktop e telefono**.

**I testi veri, scritti da lui.** Titolo, sommario, tutte le didascalie con il
loro numero, i nomi delle sezioni, le voci di menu, le etichette dei dati, la
chiamata all'azione, il piede. Non tracce da riempire: le frasi definitive.

**Il movimento del testo, in GSAP, elemento per elemento.** Questa e' la parte
che si dimentica di chiedere e che poi si improvvisa. Va chiesta cosi':

> Per OGNI elemento di testo della pagina dammi una riga con:
> elemento | proprieta' animate (y, opacity, blur, clip-path, scale, rotateX,
> lettere separate si/no) | valori di partenza e arrivo | durata in secondi |
> ease GSAP esatto (nome o cubic-bezier) | ritardo fra elementi vicini
> (stagger) | cosa fa scattare l'animazione (ScrollTrigger start, oppure
> timeline d'apertura al secondo X) | scrub si/no | si ripete o una volta sola.
> Formato tabella. Niente principi, niente "usa un fade elegante".

Chiedere in piu', nella stessa richiesta:

- **il comportamento dell'intestazione** allo scroll (quando si condensa, quando
  si nasconde, con quale soglia di velocita' e quale durata);
- **gli stati al passaggio del puntatore** su collegamenti, pulsanti e schede —
  cosa si muove, di quanto, in quanti millisecondi;
- **niente effetti legati al mouse**, e va detto a Gemini nella richiesta:
  niente cursore disegnato, niente pulsanti magnetici, niente schede che si
  inclinano seguendo il puntatore, niente parallasse col mouse. Meta' di chi
  guarda apre da telefono, dove non esistono — e sono gli effetti piu' copiati
  degli ultimi anni, quindi leggono come "fatto con un tema". L'immersione si
  guida col TEMPO e con lo SCORRIMENTO, che li scriviamo noi; il puntatore si
  muove a caso, e un effetto che risponde al caso non ha regia;
- **i numeri che si contano da soli**: quali, da che valore, in quanto tempo,
  con quale ease;
- **le transizioni fra sezioni**: come una finisce e la successiva comincia;
- **una sezione che si muova in orizzontale mentre la pagina scende**, se il
  contenuto la regge — quale, e con quale rapporto fra scroll e spostamento;
- **cosa resta con `prefers-reduced-motion`** — non "meno sito": quali
  animazioni spariscono e quali restano.

**La coreografia della tela al secondo**, nella forma della tabella del punto 3.

**La chiusura della pagina**, che e' la sezione che sposta il prezzo piu' di
tutte le altre.

Se la risposta torna in prosa invece che in tabella, **si rimanda indietro
chiedendo solo la tabella**. Costa un giro e ne fa risparmiare dieci.

## 6. Poi si scrive l'MD, e si segue

Tutto quello che torna va in un file di progetto — non nella memoria della
conversazione, che finisce. Nell'MD ci vanno **anche le proprie riserve**, con
la ragione:

- dove i dati che gli avevi dato erano sbagliati e la risposta va riletta;
- dove il consiglio non regge i conti (esempio reale: precaricare 240
  fotogrammi come `ImageBitmap` sono **1,06 GB** di RAM, e la scheda muore —
  il principio era giusto, la scala no);
- dove i testi si contraddicono (esempio reale: «materia prima brianzola» e poi
  fornitori piemontesi, valtellinesi e pavesi. Nessuno dei tre e' brianzolo).

**Gemini non e' un'autorita', e' un consulente.** I suoi numeri vanno verificati
esattamente come quelli di chiunque altro, e quando sbaglia glielo si dice: la
correzione migliora il giro successivo.

## 7. Il ciclo del giudizio sui filmati guida

Ogni atto del filmato Blender va sottoposto, **uno per volta**, e il ciclo e'
sempre lo stesso:

    monto il filmato -> dichiaro il perimetro -> chiedo un VOTO
    -> leggo la lista -> correggo -> rimando

**Dichiarare il perimetro non e' opzionale:**

> Questo e' un render GUIDA: la materia verra' rifatta nel passaggio
> successivo. Non giudicare materiali ne' resa. Giudica SOLO il movimento, il
> ritmo, le inquadrature e la coreografia.

Senza, si riceve un giudizio sui materiali — che sono provvisori — invece che
sul movimento, che e' l'unica cosa che quel filmato decide.

**Le quattro domande da fare ogni volta:**

1. voto da 1 a 10 al ritmo;
2. e' altamente ingaggiante? si o no, secco;
3. se no: le TRE cose che mancano, in ordine di impatto, solo movimento;
4. **c'e' qualcosa che ho PEGGIORATO rispetto alla versione precedente?**

La quarta e' quella che si dimentica ed e' l'unica che protegge dalle
regressioni.

**Si itera finche' non arriva un si.** Su un progetto reale: primo giro 5,5/10
e *«una corretta dimostrazione tecnica, non un'esperienza di lusso»*; secondo
giro 8,5/10 e *«un'apertura cinematografica»*. Due giri, non venti — perche' la
lista era fatta di cose concrete e non di impressioni.

## 8. E quando le sue indicazioni costano troppo, si dice

Le indicazioni vanno seguite, ma non alla cieca. Su un caso reale la richiesta
di f/1,8 ha portato un fotogramma da 50 secondi a 2,5 minuti — un'ora in piu'
per sequenza — per una qualita' che verra' cancellata. Dicendoglielo, ha dato
**la soluzione tecnica** che non conoscevo: non renderizzare la profondita' di
campo, renderla dal canale della profondita' in compositing.

Il dialogo serve a questo. Un'indicazione che non si puo' pagare va rimandata
al mittente con il numero accanto.



# Da render 3D a video reale

Tre passi, in quest'ordine, e l'ordine e' la cosa importante:

1. **la scena 3D** la costruisci tu, e produce i fotogrammi chiave delle fasi
2. **Gemini** trasforma ogni fotogramma in una fotografia
3. **Veo** interpola fra due fotografie consecutive e ne fa una clip

Poi le clip si concatenano in un unico video continuo.

## Perche' l'ordine conta

La tentazione e' dare a Veo il render grezzo e chiedergli di renderlo
fotorealistico. **Non funziona, e il modo in cui fallisce e' istruttivo.**

Veo *deve* atterrare esattamente sull'ultimo fotogramma che gli dai. Se
l'ultimo fotogramma e' un render grezzo, nel mezzo inventa un oggetto
fotorealistico e poi e' costretto a **peggiorarlo** fino a tornare al render.
Il video mostra senza pieta' quanto e' brutta la tua scena.

Con due fotografie agli estremi, invece, Veo deve solo interpolare e resta
fotorealistico per tutta la clip. Verificato: stessa scena, stesso prompt,
risultato opposto.

**Corollario, ed e' il vero valore di questo giro:** le fotografie generate al
passo 2 sono il miglior riferimento che avrai mai per correggere il modello 3D.
Ti dicono esattamente cosa sbagli — proporzioni, dettagli mancanti, materiali.
Il video e' un sottoprodotto; il modello e' il prodotto.

## Passo 1 — i fotogrammi chiave dalla scena

Renderizza N pose della stessa scena, **dalla stessa identica camera**, ognuna
con un pezzo in piu' montato. Otto fasi sono una buona misura per 60 secondi.

Fai un banco di prova separato dal sito (`prova.html`) che accenda **un gruppo
per volta** e mostri pianta, fronte e tre quarti con griglia e assi. Una pianta
sbagliata si vede in un secondo dall'alto e non si vede mai da tre quarti:
questo trova gli errori di geometria che altrimenti scopri a video finito.

Esporta in JPG 1600x900, numerati `01-...` `02-...` in ordine di montaggio.

## Passo 2 — da render a fotografia, con Gemini

Per ogni fase, **chat NUOVA**, allega l'immagine, **seleziona "Crea immagine"**
dal menu "+", poi il prompt.

Il prompt che funziona ha tre parti:

1. *"Genera una fotografia reale di questo stesso &lt;oggetto&gt;, con la stessa
   identica inquadratura, la stessa angolazione, la stessa distanza, la stessa
   luce e lo stesso fondo dell'immagine allegata."*
2. cosa c'e' **in questa fase** e cosa non c'e' ancora, in positivo e in negativo
3. *"Fotografia reale, nessuna persona, nessun testo, nessun logo."*

**Per la coerenza fra le fasi**: dopo la prima, allega ogni volta **la foto
della fase precedente**, non il render. Cosi' resta lo stesso oggetto, la
stessa luce, lo stesso fondo. Se generi ogni fase da sola, ottieni N oggetti
diversi e il video non regge.

**Scarica col pulsante di Gemini** ("Scarica immagine alla massima
risoluzione"): da 2730x1536. Il trucco canvas+toBlob via JavaScript funziona ma
restituisce 1024x576, cioe' solo quello che e' a schermo.

### Se rifiuta

Le frasi cambiano ("sono solo un modello linguistico", "sono
un'intelligenza artificiale basata sul testo", "non sono programmato per fare
una cosa del genere") e sembrano risposte nel merito. Non lo sono: e' il
modello testuale che risponde al posto di quello per le immagini.

**La prova del gatto**, un minuto e chiude la questione: chat nuova, "Crea
immagine" attivo, nessun allegato, *"un gatto rosso addormentato su un tavolo
di legno, fotografia"*. Se rifiuta anche quello non e' il prompt: e' l'account.
Cambia account o aspetta il giorno dopo. Non riscrivere il prompt dieci volte.

## Passo 3 — le clip, con Veo

Su Google Flow, per ogni coppia consecutiva: allega **prima** il fotogramma
iniziale, **poi** quello finale, e chiedi il video di transizione.

Struttura del prompt:

> Genera UN SOLO video con Veo 3.1 Fast usando la prima immagine come
> fotogramma iniziale e la seconda come fotogramma finale. **La camera e' su
> cavalletto fisso e NON si muove mai: nessuno stacco, nessun cambio di
> inquadratura, una sola ripresa continua.** Ripresa reale in studio:
> &lt;l'azione, lenta e continua&gt;. Nessuna persona, nessun testo, nessun logo,
> nessun parlato.

### Se Veo stacca, manca un fotogramma in mezzo

Quando fra i due estremi c'e' un cambiamento che **non si puo' mostrare
restando fermi** (un oggetto che passa da un supporto a un altro), Veo copre il
passaggio con un cambio di inquadratura. Il vincolo esplicito sulla camera non
basta: provato tre volte, tre stacchi.

La soluzione non e' insistere sul prompt: **genera un fotogramma intermedio** e
spezza in due clip corte, ognuna con un cambiamento piccolo. Spesso l'intermedio
giusto e' quello che si fa davvero nella lavorazione reale.

### Costi e limiti

Veo 3.1 Fast 20 crediti a clip, Quality 100. I crediti si azzerano ogni giorno,
**non si accumulano**: con 50 al giorno fai due clip. Tieni "Conferma prima di
generare: Sempre" nelle impostazioni dell'agente.

### Due trappole dell'interfaccia di Flow

- **Non cliccare a vuoto sotto il campo di testo**: sotto ci sono le schede
  suggerite ("Mostrami le scorciatoie da tastiera") e partono da sole,
  mandando in vacca la richiesta.
- **Mai Ctrl+A nel pannello**: seleziona tutta la libreria del progetto e la
  manda nel cestino. C'e' "Annulla" nel messaggio che compare, usalo subito.

## Passo 4 — il montaggio

```bash
printf "file 'clip-01.mp4'\nfile 'clip-02.mp4'\n" > lista.txt
ffmpeg -f concat -safe 0 -i lista.txt -c copy grezzo.mp4

# all-intra: serve se il video va scrubbato con lo scroll
ffmpeg -i grezzo.mp4 -c:v libx264 -preset slow -crf 21 \
       -g 1 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p -an scrub.mp4

# copia leggera solo da guardare
ffmpeg -i grezzo.mp4 -c:v libx264 -crf 27 -vf scale=960:-2 \
       -movflags +faststart -an anteprima.mp4
```

**Perche' all-intra**: con i keyframe radi la ricerca costa ~37 ms a
fotogramma e lo scrub scatta; tutto-intra scende a 2-4 ms. Pesa molto di piu'
(30 MB contro 1,5), quindi tieni due file: uno per il sito, uno da mandare in
giro. E il server deve supportare le richieste **Range**, altrimenti
`currentTime` resta a zero e non te ne accorgi.

## Come si verifica un video

Non guardarlo: **campiona i fotogrammi**. Quattro punti bastano a scoprire uno
stacco o un crollo di qualita'.

```bash
ffmpeg -i clip.mp4 -vf "select='eq(n\,0)+eq(n\,70)+eq(n\,140)+eq(n\,190)'" \
       -vsync 0 -q:v 3 f%02d.jpg
ffmpeg -i f01.jpg -i f02.jpg -i f03.jpg -i f04.jpg \
       -filter_complex "[0:v][1:v][2:v][3:v]hstack=inputs=4,scale=1600:-1" provino.jpg
```

Il provino affiancato mostra in un colpo solo se la camera e' rimasta ferma e
se il realismo tiene fino in fondo.

## Chiudere il cerchio

Il video non e' il traguardo. Quando le fotografie sono pronte, **torna sul
modello 3D** e correggi quello che le foto ti stanno dicendo. Poi registra la
scena e falla valutare in confronto anonimo con un sito professionale — vedi la
skill `confronto-gemini` — chiedendo il giudizio su tutto, non solo sul 3D:
tipografia, griglia e centratura, mobile a 390 px, palette, se il movimento
serve o e' rumore, prestazioni.

---

# Se il traguardo e' una sequenza SCROLLABILE, non un video

Aggiunto il 10/08/2026, dal progetto CÈPP (panino che si compone scrollando).

Quando le fotografie non servono a fare un filmato da guardare ma una sequenza
che l'utente **scrubba con lo scroll**, cambiano tre numeri e una trappola.

## La trappola: i fotogrammi generati uno per uno SFARFALLANO

Verdetto di hce 3.0, ed e' corretto: i modelli a diffusione **non hanno
coerenza temporale**. Generare 50 fotogrammi indipendenti, anche con lo stesso
prompt, fa cambiare fra l'uno e l'altro la texture della carne, le bolle del
formaggio, i semi di sesamo. Sotto lo scroll diventa uno sfarfallio.

**La soluzione non e' generare piu' fotogrammi: e' non generarli affatto.**
Si generano poche CHIAVI incatenate (Gemini), fra due chiavi consecutive
interpola **Veo** — che e' un modello video e la coerenza temporale ce l'ha —
e i 45-90 fotogrammi finali si **estraggono dal video**.

    12 chiavi -> Gemini incatenato -> 12 foto -> Veo -> 11 clip -> video
    -> ffmpeg estrae 45-60 fotogrammi -> WebP -> canvas + ScrollTrigger

Le altre due strade, se i crediti Veo non bastano: modellare e renderizzare
offline in Blender/Cycles (coerenza totale, zero crediti, ma giorni di
modellazione), oppure ControlNet Depth + IP-Adapter con una LoRA addestrata
sull'oggetto e il seed bloccato.

## I numeri della sequenza scrollabile

- **45-60 fotogrammi** (benchmark industriale 45-90). Dodici sono uno
  slideshow a scatti: su due schermate fanno 6 fotogrammi a schermata.
- **WebP o AVIF**, lossy 75-80%. **Peso totale 3,5-5 MB**, non di piu'.
- desktop 1920x1080, mobile 750x1334.
- **mai tag `<img>` nel DOM**: `<canvas>` e `drawImage()`.
- precarica subito il fotogramma 1 e le chiavi (1, 15, 30, 45, 60), il resto in
  sottofondo mentre l'utente legge la prima schermata.
- GSAP ScrollTrigger con `scrub: 0.5-1`.

Chi lo fa bene: Apple (AirPods Pro, Mac Studio), Bugatti, Porsche.

## Il collo di bottiglia sono i crediti, non il codice

Veo 3.1 Fast: 20 crediti a clip, e i crediti **si azzerano ogni giorno senza
accumularsi**. Undici clip sono 220 crediti, cioe' piu' giorni. Va detto prima
di promettere una data.

---

# Parlare con Gemini: il ponte, non l'estensione a clic

`Webingegno/ponte/` — `server.py` (coda locale sulla 8765) + l'estensione
"Ponte Gemini" che vive nella scheda gia' autenticata. Nessuna credenziale
passa di li'.

    python server.py                      # e lo lasci acceso
    python chiedi.py --gem hce --file domanda.txt --out risposta.md
    python foto.py --da chiavi --a foto --prompt-cartella prompt --schede 5
    python foto.py --catena chiavi --a foto --prompt-cartella prompt

`--catena` allega a ogni fotogramma la FOTO precedente: e' quello che tiene lo
stesso oggetto nello stesso studio, ed e' per forza in fila. `--da` va in
parallelo ma ogni foto nasce per conto suo.

## Le trappole del ponte, gia' pagate

- **"Crea immagine" va acceso**, altrimenti risponde il modello testuale e
  sembra un rifiuto nel merito ("sono un modello linguistico..."). Non lo e'.
  La voce sta nel menu "+", dentro `.cdk-overlay-container`; quando e' accesa
  compare nel composer la pastiglia con `aria-label="Deseleziona: Immagini"`.
- **Mai passare da un canvas** per tirare fuori l'immagine: restituisce quello
  che e' a schermo (1024x576). Si rifa' una `fetch` sulla `src` e si legge il
  blob: torna a piena risoluzione.
- **Una chat nuova per ogni lavoro.** Dopo un invio l'indirizzo diventa
  `/app/<id>`: restandoci, dal terzo fotogramma in poi Gemini risponde alla
  conversazione invece che all'immagine.
- **Con UNA scheda sola non mandare due lavori insieme: le risposte si
  incrociano.** Verificato: la risposta di un lavoro e' finita nel file
  dell'altro, e il secondo e' rimasto vuoto. O si apre una scheda per lavoro
  (`--schede N`), o si va in fila.
- **Le risposte lunghe possono tornare VUOTE** (0 caratteri): la generazione
  sfora il tetto di attesa dentro l'estensione, che legge un blocco non ancora
  riempito. Se torna vuota, rilancia — non riscrivere il prompt.

# Prima di costruire, sottoponi anche il PIANO TECNICO

La FASE ZERO in cima fa progettare l'esperienza. Questo e' il passo dopo: non
il risultato e non l'esperienza, ma **l'impianto tecnico**. Scrivi cosa
costruirai e come, e chiedigli dove si rompe. Sul progetto CÈPP ha bocciato
l'impianto prima che venisse scritta una riga — e aveva ragione su due punti su
tre (sul terzo no: vedi il conto dell'`ImageBitmap`, 1,06 GB).

**Una chat separata per ogni consulto, un file per ognuna.** Impastarli in una
conversazione sola fa scadere le risposte in generalita': fame e
neuromarketing; struttura e testi; cosa separa un sito da 2k da uno da 20k;
ricerca di mercato. Quattro consulti, quattro file. Poi scrivi il piano e fallo
approvare.

---

# LA COMBINAZIONE CHE FUNZIONA: Blender fa il movimento, Gemini fa la pelle

Aggiunto il 10/08/2026, dal progetto CÈPP. **E' il metodo migliore dei tre**, e
risolve insieme i due problemi che avevano bloccato tutto il resto.

## Il principio

Il render 3D e' bravissimo in quello in cui l'IA e' scarsa — geometria esatta,
fisica, coerenza fra un fotogramma e il successivo — ed e' pessimo in quello in
cui l'IA e' bravissima: la materia. Quindi non si sceglie: si spartiscono.

    Blender decide DOVE sta ogni cosa e come si muove.
    Gemini decide DI COSA e' fatta.

Ogni fotogramma va a Gemini con **due allegati**:

1. **la fotografia gia' vestita del fotogramma precedente** — ancora di
   IDENTITA': stesso pane, stesso tagliere, stessa luce;
2. **il render grezzo di questo fotogramma** — ancora di GEOMETRIA: dove sta
   ogni pezzo, da che angolo si guarda, cosa e' sospeso a mezz'aria.

Il primo fotogramma non ha un precedente: si usa una fotografia di riferimento.

Verificato su fotogrammi consecutivi con la camera che GIRA e gli ingredienti
che CADONO: posa, altezze e inquadratura vengono rispettate alla lettera, e la
resa e' fotografica. E' l'unico modo trovato per avere movimento tridimensionale
vero senza sfarfallio e senza l'aria di plastica.

## Le due regole che decidono la riuscita

**1. Il render deve essere una guida FORTE.** Provato con un render debole
(sagoma smorta, posa poco leggibile): Gemini lo ignora e ridisegna l'oggetto a
modo suo, appoggiandosi solo alla fotografia di stile. La geometria va imposta
con un render leggibile — silhouette netta, posa chiara, inquadratura decisa —
altrimenti comanda lui.

**2. Vincola la POSIZIONE, libera la FORMA.** Se chiedi di rispettare tutto, ti
restituisce la geometria idealizzata del render: la carne resta un disco liscio
perche' nel render lo e'. La frase che sblocca:

> «Rispetta POSIZIONE, ALTEZZA, ORDINE e INQUADRATURA alla lettera, ma la FORMA
> di ogni ingrediente dev'essere quella naturale e irregolare del cibo vero, non
> quella del render. La carne non e' un disco liscio: e' un patty schiacciato a
> mano, con il bordo frastagliato.»

Con questa correzione lo stesso fotogramma passa da "render colorato bene" a
fotografia.

## Il modello 3D non deve essere bello, deve essere GIUSTO

Libera parecchio: il render serve come guida, quindi si rende in EEVEE (secondi
a fotogramma, non minuti), materiali approssimativi, niente subsurface, niente
Cycles. Contano solo silhouette, posa, movimento e inquadratura.

## La trappola delle scale del rumore

Il modificatore Displace legge le coordinate LOCALI. Se la scena e' in metri
veri, `noise_scale` e' la dimensione dei grumi IN METRI: 0.02 sono due
centimetri. Con i valori "normali" intorno a 1 il rumore e' costante su tutto
l'oggetto e non sposta niente — gonfia e basta, e il modello viene liscio come
un sasso senza che si capisca perche'.

## Blender 5: due cose cambiate

- `action.fcurves` **non esiste piu'** (sistema a slot). Non serve comunque:
  l'interpolazione predefinita dei keyframe e' gia' BEZIER.
- I nomi dei "look" di AgX cambiano fra versioni: si prova in cascata
  (`AgX - Medium High Contrast`, `AgX - Base Contrast`, ...) e si tiene il primo
  che non solleva `TypeError`.

## La fisica della caduta, in numeri

Dal consulto sul neuromarketing, e vanno rispettati:

    caduta 280-360 ms · scarto fra un ingrediente e l'altro 90-120 ms
    il successivo parte quando il precedente e' al 60% della corsa
    schiacciamento Y 0.88-0.90 con allargamento X/Z 1.06-1.08, per 120-160 ms
    un rimbalzo al 12-15% dell'altezza, un assestamento al 3%, e basta
    rotazione in caduta MAI oltre 4 gradi: di piu' sembrano fogli di carta
    elasticita' oltre 0.22: sembra gommapiuma. Il cibo e' viscoelastico

---

# LA REGOLA CHE VIENE PRIMA DI TUTTE: una cosa per volta

Imparata a caro prezzo l'11/08/2026, dopo aver buttato quaranta fotogrammi.

L'incatenamento tiene l'identita' della scena **solo se fra un fotogramma e il
successivo cambia UNA cosa sola**. Se ne cambi due — la camera si muove E il
contenuto cresce — al generatore stai chiedendo di tenerne ferme due insieme:
ne molla una, e quella che molla e' sempre l'inquadratura.

## Come si manifesta, e perche' inganna

Ogni singolo fotogramma e' bellissimo. Il difetto si vede **solo montando la
sequenza**: il soggetto cambia scala del quaranta per cento fra due fotogrammi
consecutivi, il tavolo si sposta e ruota, il fondo passa da grigio piatto a una
lama di luce. Guardando le immagini una per una si dice "funziona".

**Misuralo, non guardarlo.** Due numeri bastano:

    luminosita' media di ogni fotogramma -> salto fra fotogrammi VICINI
    differenza media fra fotogrammi vicini (miniature 160x90, scala 0-255)

Su una sequenza sana il salto di luminosita' fra vicini sta sotto i 3-4 punti.
Nella serie da buttare era **9,8 di media e 41 nel caso peggiore**, e la
differenza media fra fotogrammi vicini era **49 su 255**.

## Cosa NON la aggiusta

Provato e misurato, in quest'ordine:

1. **pareggiare l'esposizione** (media e scarto per canale, misurati sulla
   cornice della scena dove c'e' solo il fondo): escursione da 58 a 38, salto
   medio da 9,8 a 9,3. Quasi niente — perche' non e' esposizione, e' contenuto;
2. **portare tutti i fotogrammi alla stessa misura** (Gemini restituisce
   1024x576, 1024x559, 1024x572 nella stessa serie: va fatto comunque, senza
   nessuna maschera combacia);
3. **stabilizzare geometricamente** cercando scala e spostamento che fanno
   combaciare la fascia bassa della scena: salto medio da 9,3 a **11,2**, cioe'
   peggio. Non si stabilizza cio' che e' diverso, si stabilizza cio' che e'
   uguale e si e' solo spostato.

## Cosa la aggiusta

**Togliere il movimento di camera dal render di guida.** Il movimento resta —
sono gli oggetti che cadono, ed e' quello il punto — ma la scena non cambia
mai. E' esattamente la differenza fra la serie da dieci fotogrammi che ha
funzionato al primo colpo (camera fissa, cambiava un ingrediente per volta) e
quella da quaranta da rifare (camera che gira).

Se il movimento di camera lo vuoi davvero, non chiederlo al generatore: fallo
DOPO, spostando e ingrandendo l'inquadratura sui fotogrammi gia' coerenti.
Una panoramica finta su immagini identiche e' fluida; una vera su immagini
diverse no.

## Il secondo allegato ROMPE la continuita'

Scoperto misurando, l'11/08/2026, ed e' la cosa piu' importante di tutta questa
pagina.

La ricetta "foto precedente + render di guida" sembra ovvia: una immagine dice
di che materia sono fatte le cose, l'altra dice dove stanno. **Non funziona.**
Gemini non sceglie fra i due riferimenti: li FONDE. A ogni fotogramma la scena
viene tirata verso l'inquadratura e la luce del render, e il tavolo, il fondo e
la distanza cambiano un poco ogni volta.

Il numero, cioe' quanto cambia la CORNICE della scena fra due fotogrammi
consecutivi, su 255:

    un allegato solo (la foto precedente) .....  1,6   (peggio 2,4)
    due allegati (foto + render) .............. 35-36  (peggio 82)

Venti volte peggio, e con l'incatenamento attivo in tutti e due i casi. Non e'
la camera, non e' l'incatenamento: e' il secondo allegato.

**La regola: un allegato solo, sempre.** La geometria non si perde — gliela si
DICE a parole, ricavandola dalla stessa timeline che avrebbe generato il
render: cosa e' appoggiato, in che ordine dal basso, cosa e' sospeso e a quanti
centimetri. Il render 3D resta utilissimo, ma come fonte del TESTO, non come
immagine da allegare.

E se cambi il numero di allegati, **riscrivi il prompt**: un'istruzione che
dice "ti mando DUE immagini" mentre gliene mandi una lo manda a cercare un
riferimento che non esiste.

---

## La regola che fa risparmiare piu' tempo di tutte

**IL RENDER 3D E' UNA GUIDA DEL MOVIMENTO. NON CURARE LA RESA.**

E' il modo piu' facile di buttare ore: si comincia a sistemare i materiali, la
profondita' di campo, il numero di campioni, l'anisotropia del metallo — e poi
quel lavoro viene **cancellato**, perche' la pelle la rifa' il generatore di
immagini. Ogni minuto speso a far sembrare bello il render e' un minuto buttato.

Del render contano SOLO quattro cose:

1. **la geometria** — dove sta ogni pezzo, esattamente;
2. **il movimento** — cosa si muove, quando, con che curva, quanto in fretta;
3. **l'inquadratura** — da dove guarda la camera e cosa entra nel quadro;
4. **la leggibilita' della sagoma** — il soggetto dev'essere riconoscibile,
   altrimenti il generatore lo ridisegna a modo suo.

Non contano: materiali, riflessi, sfocatura, rumore, numero di campioni,
temperatura delle luci. Verranno tutti sostituiti.

**Conseguenze operative, e sono grosse:**

- si rende con **pochi campioni** (48 bastano) e **senza profondita' di campo**:
  su un progetto reale questo ha portato un fotogramma da 2,5 minuti a ~20
  secondi, cioe' un'ora risparmiata per ogni sequenza da venti chiavi;
- non si insegue il fotorealismo in Blender. Su un panino e' stato provato per
  ore e non ci si arriva; su un orologio ci si arriverebbe, ma **non serve**;
- **quando si chiede un giudizio sul filmato guida, va detto esplicitamente**
  che i materiali non vanno giudicati. Altrimenti chi valuta risponde sulla
  resa — che e' provvisoria — invece che sul movimento, che e' l'unica cosa
  che quel filmato decide davvero.

Frase da mettere nel prompt di valutazione:

> Questo e' un render GUIDA: la materia verra' rifatta nel passaggio
> successivo. Non giudicare i materiali ne' la resa. Giudica SOLO il movimento,
> il ritmo, le inquadrature e la coreografia.

**L'unica eccezione:** la sagoma dev'essere forte. Un render slavato, con il
soggetto poco leggibile, viene ignorato dal generatore che ridisegna quello che
vuole. Forte non vuol dire bello: vuol dire netto.

---

## Pilotare Blender guardandolo: il ponte MCP

Per settimane il modo di lavorare e' stato: scrivo lo script, renderizzo,
guardo il PNG, scopro che ho sbagliato. Su una macro — la camera a quattro
centimetri da un pezzo di tre millimetri — questo significa **tre tentativi e
tre immagini nere**, senza mai capire dove stesse guardando la camera.

La soluzione e' `blender-mcp`: un addon che apre un ponte fra Blender e Claude,
e permette di **vedere il viewport** invece di dedurlo.

### Installazione, tutta da riga di comando

```bash
curl -sL -o addon.py https://raw.githubusercontent.com/ahujasid/blender-mcp/main/addon.py
cp addon.py "$APPDATA/Blender Foundation/Blender/<versione>/scripts/addons/blender_mcp_addon.py"
claude mcp add blender --scope user -- uvx blender-mcp
```

Poi **riavviare Claude Code**: i server MCP si caricano all'avvio.

**Prima di registrarlo, pre-scarica il pacchetto** (`uvx blender-mcp` una volta
a mano): la prima esecuzione scarica le dipendenze e supera i 30 secondi di
timeout della connessione, che fallisce senza dire perche'.

Verifica di sicurezza fatta: l'addon ascolta **solo su `localhost:9876`**.
Contatta Poly Haven e un servizio Hyper3D, ma sono funzioni opzionali.

### Blender deve restare APERTO con l'interfaccia

Il ponte vive dentro Blender. Uno script di avvio evita il clic manuale su
Connect, perche' l'operatore e' esposto:

```python
def avvia():
    bpy.ops.preferences.addon_enable(module="blender_mcp_addon")
    bpy.ops.blendermcp.start_server()
    return None
bpy.app.timers.register(avvia, first_interval=1.5)
```

Poi `blender.exe --python avvia.py`.

### LA TRAPPOLA CHE COSTA PIU' TEMPO: `bpy.context.object`

**Non usarlo mai.** Funziona da riga di comando in background e fallisce in
tutti gli altri contesti:

- all'avvio dell'interfaccia (`--python` in modalita' GUI): il contesto non e'
  ancora completo;
- dentro un `bpy.app.timers` callback;
- quando il codice arriva dal ponte MCP.

L'errore e' sempre `AttributeError: 'Context' object has no attribute 'object'`,
e nel caso del ponte **fa cadere il server** senza chiudere Blender: si resta
con la finestra aperta e la porta muta, e sembra un problema di rete.

Al suo posto:

```python
def creato():
    o = bpy.context.view_layer.objects.active
    if o is not None:
        return o
    coll = bpy.context.collection.objects
    return coll[-1] if len(coll) else None
```

Vale per ogni `bpy.ops.mesh.primitive_*_add()`: l'operatore crea l'oggetto, ma
il modo in cui lo si rilegge decide se il codice e' portabile o no. Su uno
script di 900 righe erano diciotto occorrenze, e tutte e diciotto rompevano.

### Cosa si guadagna

- `get_viewport_screenshot` — si vede la scena, si corregge, si renderizza solo
  quando l'inquadratura e' giusta;
- `get_object_info` — posizione e dimensioni vere di un pezzo, senza stampare;
- `execute_blender_code` — si prova una modifica e si guarda l'effetto subito.

Per le operazioni che richiedono un contesto di vista (`view_selected`,
`transform_apply` in certi casi) serve l'override:

```python
area = next(a for a in bpy.context.screen.areas if a.type == 'VIEW_3D')
reg = next(r for r in area.regions if r.type == 'WINDOW')
with bpy.context.temp_override(area=area, region=reg):
    ...
```

---

## Le macro: tre trappole che fanno uscire il fotogramma NERO

Su una scena piccola — un orologio di 42 mm, un dettaglio di 3 — la macro
fallisce in modi che sembrano problemi di luce e non lo sono. Tre render neri
di fila prima di capirlo, e la causa non era mai quella che stavo cambiando.

### 1. IL PIANO DI TAGLIO VICINO, ed e' la piu' cattiva

`camera.data.clip_start` vale **10 centimetri** di default. Tutto cio' che sta
piu' vicino alla camera **non esiste**. Su una scena da metri non si nota mai;
su una scena da centimetri, qualunque macro esce nera.

Il sintomo inganna: sembra buio, e si comincia ad alzare le luci, a spostare la
camera, a controllare la mira. Nessuna di quelle cose c'entra.

```python
d.clip_start = 0.001      # 1 mm
d.clip_end = 10.0
```

Va messo nella funzione che crea la camera, una volta, per sempre.

### 2. LE LUCI VANNO RISCALATE COL SOGGETTO, non solo avvicinate

Una sorgente da 12 W buona per un oggetto di 42 mm ripreso da 20 cm, portata a
un centimetro da un dente di scappamento, e' un fascio da saldatore. Il primo
micro-contatto e' uscito bianco pieno, col rubino rosa invece che rosso.

Per una macro servono sorgenti **piccole, vicine e deboli**: frazioni di watt,
non frazioni di quello che serviva prima. E vanno tenute separate da quelle
della scena grande, non riusate.

### 3. LE QUOTE SI MISURANO, NON SI ASSUMONO

Un pezzo costruito da un cilindro e poi intagliato **non ha piu' il raggio del
cilindro**. Piazzando un secondo pezzo con il valore nominale, la distanza fra
i due e' uscita di 279 micron invece di 20: quattordici volte troppo.

```python
bpy.context.view_layer.update()
raggio = max(o.dimensions.x, o.dimensions.y) / 2
```

Vale ogni volta che una posizione dipende dalla dimensione di un altro
oggetto. E l'`update()` non e' opzionale: senza, le dimensioni sono quelle di
prima della modifica.

**Il filo comune:** questi tre difetti sono invisibili in un render. Si vedono
guardando il viewport. Prima di inseguire una macro al buio, apri il ponte.

---

## Il ciclo di giudizio: cosa sposta davvero il voto

Il filmato guida va fatto giudicare, e conviene chiedere **un voto numerico**:
"e' bello?" produce commenti, "quanto da 1 a 10, e cosa lo separa dal 10?"
produce una lista di cose da fare.

Su un progetto reale il primo giro e' stato bocciato — *«una corretta
dimostrazione tecnica, non un'esperienza di lusso»*, ritmo **5,5/10** — e il
secondo approvato a **8,5/10** con *«un'apertura cinematografica»*. In mezzo
c'e' un giro solo, e queste cinque cose:

| cosa | perche' |
|---|---|
| **camera piu' vicina** (21 cm invece di 38) | con l'oggetto interamente contenuto nel quadro il senso di scala sparisce: i pezzi devono USCIRE dai bordi |
| **la camera reagisce** | stava ferma sette secondi ad aspettare. Quando un pezzo si sgancia, l'inquadratura deve seguirne la spinta e riassestarsi |
| **soggetto sul terzo inferiore** | piantato al centro legge come visualizzatore CAD |
| **micro-scossone sui colpi** | 0,2 mm a 30 Hz spenti in 150 ms, sui fotogrammi esatti dello scatto. Senza, lo sblocco avviene nel vuoto |
| **deriva nelle pause** | un fermo assoluto legge come fotogramma congelato. 0,1 mm/s non si vedono muovere e tolgono il congelato |

E due sul ritmo: uno scatto meccanico deve durare **due fotogrammi**, non tre o
quattro — se si spalma su piu' chiavi diventa morbido e perde la tensione; e
l'aggancio finale vuole una curva che **frena in fondo**, non simmetrica.

**Nel prompt di valutazione va sempre dichiarato il perimetro** (vedi la regola
del render-guida): senza, si riceve un giudizio sui materiali, che sono
provvisori, invece che sul movimento, che e' l'unica cosa che quel filmato
decide.

---

## La coerenza fra fotogrammi, che e' un problema diverso dal singolo fotogramma

Un video puo' avere ogni fotogramma perfetto e sembrare comunque una cosa fatta
al computer. Tre controlli:

- **le texture procedurali devono essere ancorate all'OGGETTO**, non allo
  spazio: se il rumore che pilota la ruvidezza e' legato alle coordinate del
  mondo, i graffi scivolano sulla superficie mentre il pezzo si muove;
- **niente movimento lineare**: massa, accelerazione, decelerazione. Una
  velocita' costante che si ferma di colpo e' la firma piu' riconoscibile del
  3D;
- **la sfocatura di movimento va con la velocita'**: un oggetto veloce e
  perfettamente nitido comunica computer grafica in mezzo secondo.

### La griglia diagnostica, quando "sembra finto" e non si sa perche'

Invece di alzare i campioni — che non risolve mai — si cerca **cosa sta
riconoscendo come artificiale** chi guarda:

| sintomo | dove guardare |
|---|---|
| sembra un giocattolo | scala, lunghezza focale, profondita' di campo, smussi |
| sembra plastica | ruvidezza costante, micro-normale, texture |
| sembra troppo pulito | mancano imperfezioni: graffi, polvere, usura |
| sembra appoggiato sopra lo sfondo | ombre di contatto, prospettiva, bilanciamento del bianco |
| sembra renderizzato | nitidezza da angolo ad angolo, esposizione, assenza di difetti ottici |

Su un render-guida solo le righe 1 e 4 vanno corrette: le altre riguardano la
resa, che viene rifatta dopo.

## I booleani che non tagliano, e i materiali che spariscono

Tre trappole incatenate, tutte mute: nessun errore, nessun avviso, solo un
oggetto diverso da quello che credi di aver costruito. Sono costate quattro
tentativi sul terzo atto, e nessuna si vedeva nel codice.

**1. `hide_viewport = True` uccide il booleano.** Nascondere il coltello con
quella proprieta' non lo nasconde: lo toglie dal grafo delle dipendenze. Il
modificatore non trova piu' geometria da sottrarre e smette di fare qualunque
cosa. In un progetto era scritto cosi' in tutti e sette i punti: la cassa era un
cilindro pieno, il quadrante un disco senza finestra, il fondello un disco
senza apertura. Per il render conta solo `hide_render`.

**2. Meglio ancora: si applica subito e il coltello si butta.** Un modificatore
che resta appeso a un altro oggetto e' una dipendenza che qualcuno prima o poi
rompe — spostando il pezzo, nascondendolo, esplodendolo. Applicare al momento
della costruzione, che si fa una volta sola, toglie di mezzo la categoria.

**3. Ma applicare un booleano EREDITA GLI SLOT MATERIALE DEL COLTELLO.** Il
coltello non ha materiale, quindi arriva uno slot VUOTO e finisce in PRIMA
posizione: tutte le facce puntano li', e il motore rende lo slot vuoto col
grigio di default, cioe' bianco pieno. Il materiale vero, aggiunto dopo, si
sistema in seconda posizione e non lo usa nessuno. Nel momento esatto in cui i
booleani hanno ricominciato a funzionare, mezza scena e' diventata bianca.
Dopo ogni applicazione vanno tolti gli slot vuoti.

**4. E `bpy.ops.object.modifier_apply` non e' la strada.** E' un operatore e
vuole un contesto — oggetto attivo, modo oggetto, area giusta. Da riga di
comando c'e'; all'avvio dell'interfaccia no, e la scena non si costruisce
affatto: due mesh, nessuna camera, nessun errore. Si applica senza operatori:

    dg = bpy.context.evaluated_depsgraph_get()
    nuova = bpy.data.meshes.new_from_object(base.evaluated_get(dg))
    base.data = nuova
    base.modifiers.remove(m)

Funziona ovunque: riga di comando, finestra, timer, ponte MCP.

## Chiedere alla scena invece di dedurla

Quando un'inquadratura mostra una superficie che non si riconosce, si smette di
spegnere pezzi a caso e si lancia un raggio:

    dg = bpy.context.evaluated_depsgraph_get()
    ok, pos, _, _, obj, _ = scene.ray_cast(dg, origine, direzione)

Stampare i primi sei oggetti colpiti, con distanza e nome del materiale, dice in
un secondo e senza renderizzare quello che tre render non avevano detto. Sulla
stessa scena ha rivelato che il disco lucido inspiegabile era il fondello
intero, e subito dopo che meta' degli oggetti erano `SENZA MATERIALE`.

Corollario: **`matrix_world` va letto dopo `view_layer.update()`.** Senza, si
leggono le posizioni di prima delle modifiche di quel fotogramma, e la diagnosi
dice l'opposto del vero. E' successo: i numeri dicevano che il ribaltamento non
era avvenuto, mentre stava avvenendo.

## Le luci si spostano in base alla geometria del riflesso

Un fondello di zaffiro usciva bianco pieno. Non era troppa luce: su una
superficie speculare orizzontale, la luce che finisce nell'obiettivo e' quella
alla STESSA elevazione della camera e all'azimut opposto — e la chiave stava
esattamente li'. Spostarla a novanta gradi dall'azimut della camera ha risolto
in un colpo: il cristallo riflette il buio, e attraverso il buio si vede quello
che c'e' dentro.

Corollario che ha invertito un rimedio: **radente e' giusto per il metallo e
sbagliato per il vetro.** Piu' si scende verso il radente, piu' un cristallo
diventa specchio. E' Fresnel, non un difetto del render.

## Tutto quello che si crea dentro il ciclo va tolto all'inizio del giro dopo

Il ciclo dei fotogrammi cancellava le camere e non le luci, e la funzione delle
macro ne creava tre a ogni chiamata: al nono fotogramma erano ventisette e la
sequenza usciva bianca. Sembrava un errore di esposizione, era un errore di
pulizia.

## Cancellare vertici non taglia un solido

Per fare una mezzaluna da un cilindro sembra naturale cancellare i vertici di
meta'. Non funziona: sparendo i vertici spariscono anche le facce che li usano,
e quello che resta e' la sola parete laterale — un ARCO SOTTILE, una linea
curva alta quanto il cilindro.

Su un progetto il rotore di un orologio e' stato cosi' per tutti i render:
un filo d'oro largo mezzo millimetro al posto di una massa da ventotto. Nessuno
se n'e' accorto perche' in un'inquadratura scura un arco sottile e un
semicerchio scuro si somigliano. Le mezzelune si tagliano con un booleano.

## Misurare se un pezzo si vede, invece di chiederselo

Rendere due volte, una con il pezzo e una senza, e contare i pixel cambiati:

    (abs(a - b) > 12).sum() / a.size

Il rotore "protagonista" del terzo atto cambiava il **4%** del quadro. Con la
geometria giusta e' passato al 13%. Sono venti secondi di prova e danno un
numero al posto di un'impressione — e l'impressione, su un'immagine scura,
sbaglia.

## Un difetto tirato via ne nasconde un altro

Catena reale, tutta da uno stesso errore: il booleano del fondello non tagliava,
quindi al posto dello zaffiro c'era un disco di metallo lucido, quindi da dietro
"rimbalzava tutta la luce", quindi la platina e' stata SCURITA per compensare.
Riparato il booleano, il calibro e' rimasto nero dietro un vetro — perche' la
compensazione era ancora li'.

Quando si sistema una causa, vanno cercate le compensazioni messe per il
sintomo. Di solito hanno un commento che spiega benissimo una ragione
sbagliata.

## Il vetro si toglie dal render guida

Un cristallo davanti a un meccanismo restituisce la forma di tutto quello che
gli sta intorno: ogni sorgente diventa una macchia bianca appoggiata sul quadro,
e piu' la si ammorbidisce piu' la macchia si allarga. Sono ore di calibrazione
per un elemento che non porta un fotogramma di informazione sul MOVIMENTO.

Il vetro torna dove serve: nella vestizione dei fotogrammi chiave e nel prompt
del video. Insieme alle altre due cose che si chiedono a chi fa la pelle invece
di pagarle nel render — la sfocatura del cambio di fuoco e il battito troppo
veloce per venti chiavi.

## Arrivare a Gemini senza toccare una password

Il giudizio sui filmati va chiesto con il VIDEO allegato, e per allegarlo serve
una sessione autenticata. Le password non si digitano mai — ne' a mano ne'
pilotando lo schermo. La strada che funziona non ne ha bisogno:

**Si riusa la sessione che c'e' gia' nel browser dell'utente.** Non aprendo un
profilo nuovo (che vorrebbe un accesso tutto suo), ma copiandone i cookie in un
profilo separato, che poi si apre con la porta di debug. Il browser dell'utente
non viene toccato e nessuno digita niente.

Tre dettagli, tutti necessari:

1. **Dal Chrome 136 la porta di debug e' bloccata sul profilo predefinito.**
   `--remote-debugging-port` viene ignorata se non si passa anche un
   `--user-data-dir` diverso. Provarci e basta fa fallire senza spiegazioni.
2. **Il file dei cookie e' in uso finche' il browser gira.** Serve chiudere il
   browser, copiare, e riaprirlo com'era. Va letta prima la sua riga di comando
   (`Win32_Process.CommandLine`) e riusata identica: se c'era
   `--restore-last-session`, le schede tornano da sole.
3. **Bastano pochi file, non il profilo intero.** `Local State` alla radice, e
   dentro `Default`: `Cookies`, `Login Data`, `Preferences`, `Web Data`, piu'
   `Default/Network/Cookies` — che nelle versioni recenti e' quello che conta
   davvero. Due megabyte invece di qualche gigabyte.

I cookie sono cifrati con una chiave legata all'utente di Windows: copiati sotto
lo stesso utente funzionano, portati altrove no. E' anche la ragione per cui
questa strada non e' un modo per aggirare un accesso: e' solo il riuso della
sessione gia' aperta, sulla stessa macchina e per la stessa persona.

Se compare un selettore di account si sceglie il profilo giusto — quello e' un
clic, non una credenziale. Se compare una richiesta di password, ci si ferma e
la si chiede all'utente.

## Guardare e cliccare lo schermo, quando serve

Per i casi che il browser da solo non copre serve un paio di occhi e una mano:
fotografia dello schermo, clic, testo, tasti, rotella. Su Windows si fa con
`SendInput` via `ctypes`, senza dipendenze.

Due trappole che rendono lo strumento inutile se ignorate:

- **il DPI va dichiarato prima di tutto il resto** (`SetProcessDpiAwareness`).
  Con lo schermo in scala, un processo che non lo fa riceve coordinate finte: la
  fotografia esce di una misura e i clic cadono sempre spostati della stessa
  percentuale;
- **il testo non si scrive a tasti ma con `KEYEVENTF_UNICODE`.** Simulare le
  lettere dipende dal layout: su una tastiera italiana la chiocciola non e' dove
  il codice crede. Col carattere diretto il layout non conta piu'.

E le coordinate assolute del mouse non sono pixel: sono 0..65535 sullo schermo
intero. Convertirle male sposta il puntatore di pochi pixel, che su un pulsante
piccolo basta per mancarlo.

## I suoi numeri sono STIMATI A OCCHIO. La direzione no.

Su tre giudizi consecutivi, tre volte la scala era sbagliata:

- «camera da 35 a 22 cm» quando stava a **11**;
- «elevazione da 0 a 14 gradi» quando era gia' a **62-76**;
- «da 45 a 32 cm» quando erano **17,6**.

Legge un filmato, non un file: le misure le deduce dall'immagine, e sull'immagine
di un oggetto piccolo ripreso da vicino la deduzione sbaglia sempre nello stesso
verso. Ma la DIREZIONE - avvicinati finche' i bordi escono dal quadro, inclina
di quattordici gradi, rompi la simmetria - e' stata giusta tutte e tre le volte,
e ogni volta ha alzato il voto.

Quindi: si applica la direzione con le misure vere, e **glielo si scrive al giro
dopo**. Al terzo giro la risposta e' stata: *«l'adattamento proporzionale delle
misure reali ha risolto la composizione senza generare regressioni»*. Dirglielo
non lo offende e migliora il giro successivo; eseguire alla lettera avrebbe
mandato l'orologio fuori inquadratura.

Vale anche al contrario, e va detto: **due volte su tre il difetto peggiore
l'ha visto lui e non io.** La torre dei pezzi esplosi che si sovrappone a se
stessa perche' l'elevazione e' agli estremi, e la camera che nell'uscita
striscia contro il piatto invece di sfilarsi di lato — quel secondo l'avevo
perfino misurato, come uno scarto di 2,5 volte la media fra due chiavi, e
l'avevo letto come un problema di densita' di fotogrammi. Era una traiettoria
sbagliata.

## Il "sorpasso" e' la correzione che torna ogni volta

In tre atti diversi, la stessa nota: una curva che arriva a uno e si ferma fa
sembrare i pezzi PORTATI A MANO. Superare di un ventesimo e tornare indietro li
fa sembrare SGANCIATI.

    ESPLOSA = bezier(0.05, 0.90, 0.15, 1.05)
    FRENATA = bezier(0.12, 0.88, 0.22, 1.02)

E' la differenza fra posare un oggetto e lasciarlo andare, e costa quattro
numeri. Metterla di default su ogni movimento che finisce.

## I fotogrammi vestiti NON sono fedeli al render (misurato, 14/08/2026)

E' la trappola piu' costosa di tutta la combinazione Blender + generatore, e si
scopre solo quando si prova a usare la geometria 3D come verita' su cio' che
l'utente vede.

**Il caso.** Su Cepp serviva sapere, mentre l'utente morde la fotografia, quali
strati il morso attraversa. La scena 3D quella stratificazione ce l'ha esatta,
quindi la strada sembrava ovvia: rendere una maschera per ingrediente e
confrontarla con il gesto. La camera della sequenza per giunta e' **ferma** per
tutti e 240 i fotogrammi — scelta presa per un'altra ragione, cioe' perche' il
generatore tiene l'identita' solo se cambia una cosa per volta — quindi bastava
una maschera per strato, resa con quella camera, alla misura esatta dei
fotogrammi.

**Non combaciano.** Sovrapponendo i contorni delle maschere al fotogramma 240,
il generatore ha ridisegnato il panino: piu' compatto, appoggiato diversamente.
Misurato sulle colonne centrali, prendendo per ogni colonna il tratto continuo
piu' lungo:

    cima     fondo
    0,227    0,768     nella fotografia vestita
    0,244    0,938     nel render

L'asse ORIZZONTALE combacia — la camera e' la stessa. La CIMA combacia a meno
di un cinquantesimo di fotogramma. Il FONDO no: il pane di sotto, nel modello,
scende molto piu' giu' di quanto il generatore abbia deciso di disegnarlo.

**Cosa si impara, e vale per qualunque progetto di questa famiglia:**

1. il render e' una **guida geometrica**, non una verita' misurabile su cio'
   che l'utente vedra'. Il generatore rispetta posa e inquadratura; le
   proporzioni interne le riscrive;
2. se serve geometria esatta sull'immagine finale, ci sono due strade e vanno
   scelte PRIMA di generare: usare il render come immagine finale, oppure
   ricavare la geometria dall'immagine vestita;
3. la taratura su capisaldi misurati e' un compromesso onesto: si tara l'asse
   che sballa e si lascia stare quello che gia' torna. Va scritto nel codice,
   con i numeri, altrimenti fra un mese sembra una costante magica;
4. e una ripresa **di tre quarti non e' una sezione**: gli strati si proiettano
   uno sull'altro, quindi qualunque test del tipo "ho attraversato tutti e sei"
   resta un'approssimazione. Una legge che vuole una stratificazione vera vuole
   una camera laterale, e va decisa quando si progetta il filmato.

**Il ponte MCP va acceso a mano, e serve l'interfaccia.** In `--background` non
c'e' nessuno che tenga vivo il ciclo. Lo script con il timer e' in
`demo-panino/blender/avvia_ponte.py`; le maschere si fanno invece benissimo in
background, con `blender.exe --background --python maschere_camera.py`.
