# Stato del progetto

**Aggiornato:** 2026-08-26, notte · **Giro:** 5 · **Fase:** fondamenta della sequenza costruite e collaudate.

---

## Cosa contiene questo commit

**Il sito.** Vite 8.2.2 + three 0.185.1 a moduli ES, cinque sezioni, la
dimostrazione portata dal prototipo e i difetti corretti. Il commit precedente
era stato giudicato — giustamente — *"una spiegazione molto ben scritta del
perché il giro 1 non funzionava"*.

### Il peso, misurato sulla compilazione di produzione

| | raw | gzip | brotli |
|---|---|---|---|
| **percorso critico** (HTML + CSS + JS) | 23,1 KB | **7,6 KB** | 6,7 KB |
| font, self-hosted e sottoinsiemati | 67,2 KB | 67,2 KB | 67,2 KB |
| motore 3D, **caricato solo all'occorrenza** | 549,2 KB | 138,9 KB | 114,1 KB |
| JS totale | | **140,4 KB** | (cancello del brief: 250 KB) |

**Da 221,6 KB gzipped tutti insieme a 7,6 KB prima del primo disegno.** Il
motore 3D si carica quando la dimostrazione si avvicina, non prima. È la ragione
vera per cui il porto valeva la pena: misurato, il guadagno di *peso* era sotto
il chilobyte — il guadagno sta nel non avere 139 KB di motore fra chi apre la
pagina e la prima cosa che legge.

### I difetti corretti, tutti verificati prima e dopo

1. **Il taglio del titolo ora esiste.** Era dichiarato nei commenti del
   prototipo e non implementato: nessun `clip-path` in tutto il file. Ora le due
   copie sono ritagliate sulla **quota reale** della linea, misurata sui nodi e
   ricalcolata a ogni ridimensionamento e a font caricati.
2. **Perdita di memoria e rallentamento progressivo** con `prefers-reduced-motion`:
   la finestra dei picchi usa un orologio che avanza sempre, più un tetto rigido
   sui campioni. Due difese indipendenti.
3. **Movimento ridotto onorato dentro l'esperienza**: niente oscillazione
   autonoma, ma i due stati restano confrontabili — la tesi resta dimostrabile.
4. **Modale**: `<dialog>` nativo. Trappola del focus, Escape, inertizzazione e
   ritorno del focus sono del browser, non codice nostro che può sbagliare.
5. **Bersagli tattili 44×44** con il segno visibile che resta sottile.
6. **Parità su mobile**: il richiamo commerciale non è più `display:none`.
7. **Navigazione da tastiera** per il punto di vista (frecce).

### Due difetti nuovi, trovati misurando in esecuzione

8. **Contrasto sotto soglia.** `--inchiostro-tenue:#6A6E72` sulla carta dava
   **4,09:1**, sotto il minimo AA. Corretto a `#5F6367` → **4,82:1**.
9. **Il canvas non combaciava col taglio.** `setSize()` scrive anche lo stile in
   linea, che batte il foglio di stile: il canvas restava alto 730 in un
   contenitore da 678, e il suo centro — dove cade sempre la linea di
   galleggiamento — finiva **26 px sotto** lo stacco del fondo CSS. Si vedeva
   come una cucitura, ed era proprio l'idea del sito che si rompeva. Corretto con
   `setSize(w, h, false)` e un `ResizeObserver` sul contenitore. Verificato:
   scarto fra i centri **0 px**.

### E un difetto nel mio stesso codice di sicurezza

Il blocco che gestiva i guasti mostrava «serve WebGL» qualunque cosa fosse
andata storta. Durante il collaudo un modulo non è arrivato e la pagina ha
dichiarato all'utente che il suo browser non supporta WebGL. Era falso, e
nascondeva a me il guasto vero. Ora i due casi sono distinti e l'eccezione
finisce sempre in console.

---

## Una trappola in cui sono caduto, e che vale la pena leggere

Durante la verifica ho misurato che i pulsanti del mare non c'erano e che lo
stato era sbagliato. Stavo per correggere due difetti — **che non esistevano**.

La scheda del browser era in secondo piano, e Chrome non consegna le callback di
`IntersectionObserver` alle schede nascoste. Lo strumento non dava errore: dava
numeri, plausibili e sbagliati.

Se ne sono usciti tre insegnamenti concreti:
- una misura sul browser va accompagnata da `document.visibilityState`;
- il disallineamento del canvas invece era **vero**, e si è distinto dagli
  artefatti perché due osservazioni indipendenti concordavano: lo scarto nel DOM
  e la cucitura visibile nel provino;
- una prova che fallisce per tutte le varianti (qui: ogni `rootMargin`, incluso
  `0px`) non sta misurando la variante. Sta misurando altro.

---

## Il bersaglio, corretto

Era "9 su ogni criterio". Con i punteggi veri sotto gli occhi, va corretto —
e la correzione rende il progetto **più** ambizioso, non meno.

**Lando Norris** (OFF+BRAND), SOTD 17 nov 2025 e poi **Site of the Year 2025**:
**8,18/10** — Design 8,12 · Usability **7,90** · Creativity 8,71 · Content 8,18.
Bruno Simon, SOTM 2026: **8,11**.

**Il massimo premio dell'anno si prende con 8,2, non con 9.** E il criterio più
debole del sito dell'anno è la **Usability, a 7,90**, su un peso del 30%.

Il **Developer Award ha sei criteri suoi**, che nessun documento aveva: Semantics/SEO
7,40 · Animations 8,60 · **Accessibility 7,00** · WPO 7,60 · Responsive 7,40 ·
Markup 7,40. Il sito dell'anno prende **7,00 in accessibilità**: è il punto più
debole dei vincitori e il meno costoso da superare — ed è esattamente il terreno
di questo commit.

Il piano sta in `docs/06-SEQUENZA-D-ORO.md`; la ricerca sul percorso annuale,
con la verifica, in `docs/05-SITO-DELL-ANNO.md`.

## Il prossimo passo: la sequenza d'oro

**Non si costruiscono le altre sezioni adesso.** Prima 20–30 secondi di
esperienza alla qualità finale: la superficie si apre, appare la nave, il mare
sale, l'utente accende il sistema, la nave si calma, il taglio entra nello
scafo, il meccanismo nascosto viene rivelato.

Con una regola che ha un esito possibile negativo: **se quella sequenza non
regge il confronto alla cieca con un Site of the Month, le altre quattro sezioni
non si fanno — si rifà la sequenza.**

---

## Le skill dello studio sono nel repo

`skill/` contiene il know-how con cui questo sito viene costruito e giudicato:
`stack-sito-immersivo`, `valuta-awwwards`, `render3d-in-video-reale`, `blender`.

Chi le usa legga prima `skill/README.md`: gli anchor di punteggio in
`valuta-awwwards` sono **una scala interna di studio, non criteri Awwwards**, e
scambiarli per ufficiali è già costato un giro di lavoro su questo progetto.

---

## Cosa manca ancora

- **La preview pubblica non è ancora attiva.** Il workflow c'è
  (`.github/workflows/pubblica.yml`) ma GitHub Pages va abilitato una volta
  nelle impostazioni del repository, con sorgente **GitHub Actions**.
- **Nessuna misura in esecuzione**: LCP, INP, CLS, FPS su Android reale,
  Lighthouse mobile. La sezione 3 del sito le mostra col trattino, ed è voluto:
  finché non sono misurate restano col trattino.
- **A05, la questione più a rischio**: l'Honorable Mention richiede 6,5 dalla
  giuria **e** 6,5 dagli utenti qualificati. Con rete community pari a zero non
  si prende nemmeno quello, e non si recupera lavorando meglio alla fine.
- **A01 nome** e **A02 lingua** restano aperte. Non bloccano la sequenza d'oro.

---

## Giro 4 — il bersaglio rifondato

Arrivata una ricerca sui vincitori reali. Verificata sull'elenco ufficiale,
contando le trenta schede in pagina.

### Il fatto che cambia tutto, in meglio

**I siti autoprodotti vincono il Sito dell'Anno, e non per caso.** Nell'elenco
ci sono **quattro nomi di persona** — Bruno Simon, Claudio Guglieri, Louis
Paquet, Zhenya Rynzhuk — piu' i siti che gli studi hanno fatto di se stessi
(Lusion, Noomo, Active Theory, Synchronized Studio, abeto, The First The Last).

La categoria in cui rientra questo progetto non e' un'eccezione nell'elenco: e'
una presenza stabile. Nessuno lo aveva verificato prima.

### E il fatto che alza l'asticella tecnica

**28 vincitori SOTY su 30 hanno anche il Developer Award.** Contati. Siccome il
DEV si assegna solo ai SOTD che superano 7 con una giuria di soli sviluppatori,
il livello tecnico del Sito dell'Anno **e' quello**. La sezione 3 smette di
essere contenuto opzionale — non perche' la giuria la legga, ma perche' il sito
deve *essere* a quel livello.

### Il bersaglio non e' piu' un voto

> Per diventare Sito dell'Anno non basta massimizzare il punteggio: bisogna
> diventare il sito che la giuria **ricorda** e vuole premiare a fine anno.

Opal Tadpole ha vinto il SOTY partendo da 7,52; Noomo da 7,72. Lusion v3 da
8,25. Il voto serve per entrare, non decide il premio annuale.

E il calendario e' lungo: il SOTY 2027 richiede un SOTD nel 2027, poi il SOTM
di quel mese, con annuncio a febbraio 2028. **Un arco da diciotto mesi**, non da
cinque settimane.

### Tre regole di casa che cambiano

- **D19 — la geometria procedurale smette di essere un obbligo.** Diventa: asset
  originali e controllati, nessun modello generico o senza licenza. Se la
  qualita' richiede un modello costruito apposta in Blender, si costruisce.
- **D20 — gli effetti al mouse passano da vietati a non essenziali.** La ragione
  del divieto non era il mouse: era la *dipendenza* dal mouse. La regola nuova
  conserva la ragione — nessun momento puo' dipendere dal puntatore, il telefono
  ha un'esperienza equivalente — e lascia cadere il divieto.
- **D21 — tre picchi, non sei momenti.** Il taglio · la stabilizzazione · dentro
  lo scafo. Tutto il resto usa la stessa grammatica senza competere.

### La tensione da decidere, e non e' mia

I vincitori SOTY autoprodotti **non sono sensati: sono ossessivi.** Bruno Simon
ha buttato via la struttura di un portfolio per tenere una sola idea — niente
sezione servizi, niente elenco clienti.

Il brief attuale disegna un sito sensato, ed e' la struttura giusta per un
Honorable Mention e per contendere un SOTD. Ma **sensato e' la forma che arriva
a 8.** Non e' un argomento per togliere offerta e contatto: e' un argomento per
non lasciarle diventare la parte normale di un sito per il resto ossessivo.
E' la mossa M8, e la decide il committente.

### La rete: il rischio piu' grande, e non e' tecnico

Gli utenti votano a **tre** livelli: 6,5 anche da loro per l'Honorable Mention;
10 utenti PRO per anticipare il SOTD; al SOTM i voti utente pesano di piu'.
Oggi la presenza su Awwwards e' **zero**. E' lavoro di mesi, va avviato in
parallelo, e non si recupera lavorando meglio alla fine. E' la mossa M7.

---

## Il prossimo risultato, e le condizioni per considerarlo riuscito

Non un altro documento, e non un semplice porto. Deve contenere:

1. progetto Vite reale — **fatto**;
2. apertura col taglio funzionante — **fatto**;
3. dimostrazione dello stabilizzatore — **fatto**;
4. **prima apertura dello scafo** — da fare;
5. resa desktop e mobile — parziale, da misurare sul telefono;
6. **link pubblico** — serve che Pages venga abilitato;
7. **video di 20-30 secondi** della sequenza — da fare;
8. nessuno dei difetti gia' individuati — **fatto**.

Poi il confronto **alla cieca** con Lando Norris, Lusion, Messenger e Bruno
Simon. Il criterio non e' piu' *"e' abbastanza bello per vincere qualcosa?"* ma:

> **puo' essere ricordato fra i migliori siti dell'intero anno?**

Se la risposta e' no, non si costruisce il resto del sito: si rifanno art
direction, modello e regia.


---

# Giro 5 — la notte del 25/26 agosto

Lavorato da soli sul piano approvato. Tutto quello che segue e' **collaudato**,
non dichiarato: `node strumenti/collaudo-rollio.mjs` e `collaudo-scafo.mjs`
escono con errore se qualcosa si rompe.

## La riduzione del rollio adesso si guadagna

Era il divario piu' grave fra i documenti e il codice: `simulazione.js` aveva
ancora `SMORZAMENTO = 0.11` **scritto a mano**, e il sito mostrava "89%" senza
averlo mai calcolato.

Ora e' un sistema del secondo ordine integrato con Eulero semi-implicito, con
**due corse in parallelo** — identiche tranne che una ha autorita' zero. Il
numero a schermo e' il rapporto fra i due picchi.

E due cose che il modello vecchio non aveva:

- **la velocita' comanda.** `C(V) = C0·(V/V_rif)²`, perche' una pinna produce
  portanza solo in moto. A nave ferma la riduzione vale **zero**, misurato.
  Niente soglia artificiale a 6 nodi: il quadrato la produce da sola. Chiude A06;
- **lo stallo.** Oltre i 20 gradi la portanza *cala* invece di essere tagliata.
  Con un semplice `clamp` il sistema resta lineare, e la riduzione esce identica
  a ogni stato del mare — cinque numeri uguali che a schermo leggono come
  inventati anche essendo veri.

Misurato: **88-91% a velocita' di servizio**, che scende a **16,8% al mare 5 con
8 nodi** — pinne sature, efficacia che crolla — e a **0% a nave ferma**.

## Quattro difetti che nessun collaudo numerico poteva vedere

Li ha trovati tutti l'occhio su un provino ingrandito, e tre erano superfici:

1. la **prua e lo specchio** erano aperti: si guardava dentro lo scafo;
2. il **ponte** era aperto: stessa cosa, terza forma;
3. la **luce di fondale**, intensita' 12, si trovava DENTRO la carena sezionata
   e ne illuminava l'interno di verde. Isolata con `?senzaAcqua=1` — una prova,
   non una deduzione: tolto il mare, il verde restava;
4. e il piu' insidioso: **544 normali di murata su 544 puntavano dentro**.
   L'avvolgimento del loft era rovesciato dall'inizio, e con un materiale a
   doppia faccia non si vedeva. E' emerso solo separando esterno e interno.

Il collaudo adesso esce con errore se una sola normale punta dentro.

## E un cancello che mentiva

Il collaudo del rollio passava **tre volte su quattro**. Un cancello che suona a
intermittenza e' peggio di nessun cancello.

La diagnosi vale piu' del difetto: cercavo l'escursione della riduzione fra
stati del mare **a velocita' di servizio**, dove la pinna non satura mai e il
sistema E' lineare. Non sbagliava il modello: sbagliava il regime in cui
misuravo. E spostando la misura a 8 nodi, dove la non linearita' vive, il
sistema e' saturo e caotico — anche l'escursione diventa rumorosa.

La forma giusta della domanda e' statistica: si confronta la varianza **fra**
stati del mare con quella **dentro** uno stesso stato. 27,6 punti contro 6,7,
rapporto 4,12x. Dodici corse su dodici, adesso.

## Il mare fuori dal finestrino

La tuga ha un'apertura vera — fascia bassa, buco, fascia alta, cinque montanti —
e dietro c'e' un orizzonte in **coordinate mondo**, dentro la sovrastruttura.
Quando lo scafo rolla, l'orizzonte resta piatto **da solo**.

Prima stesura sbagliata e lasciata scritta nel file: l'avevo messo su un cilindro
di raggio 34 attorno a tutta la scena. Copriva il fondo e **cancellava il taglio
al 50%** — non un'apertura, un fondale, cioe' esattamente cio' che la regola
vieta.

Il ripiego procedurale funziona gia': cielo, riga netta a meta', mare che si
incupisce e si increspa con lo stato del mare. **Il filmato vero manca**, e
quando arriva va girato con l'orizzonte a meta' fotogramma esatta — altrimenti
nell'inquadratura ce ne sono due.

## Cosa manca, in ordine

1. **le persone** — A08 aperta sul lato della fotografia: il meccanismo
   dell'apertura c'e', l'asset no;
2. **la sequenza a sette battute** (Fase 2 del piano): la regia c'e' a meta',
   il taglio del titolo e la sezione funzionano, il resto no;
3. **il copy in inglese** — A02 decisa, non applicata;
4. **la preview pubblica**: serve un tuo clic. Settings → Pages → Source:
   GitHub Actions;
5. **il mobile**, che non ho potuto verificare davvero: il ridimensionamento
   della finestra non cambia il viewport, e la regola del repo chiede comunque
   un dispositivo reale.
