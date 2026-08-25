# Obiettivo dichiarato: 9 su ogni criterio

Il committente ha fissato il bersaglio: **9**. Questo documento traduce quel
numero in requisiti verificabili, incrociando il brief con il rubric Awwwards.

## Prima cosa, detta chiara

Il rubric pesa **Design 40 · Usability 30 · Creativity 20 · Content 10**, voto
0–10 con decimali, giuria di almeno 18 persone che scarta i 3 voti più lontani
dalla media. Le soglie: **6,5 = Honorable Mention**, **> 7 = Developer Award**,
**~8 = Site of the Day in contesa**.

**I SOTD reali stanno negli 8 medio-alti.** Un totale pesato di 9,0 è sopra
quasi tutto ciò che vince. Il bersaglio quindi non è "fare bene": è il livello
degli anchor 9,5 del rubric, che suonano così —

- Design: *linguaggio visivo originale e coerente dall'inizio alla fine; ogni
  sezione vende senza rompere il sistema*
- Usability: *esperienza impeccabile su ogni device, accessibile, veloce anche
  con 3D/shader*
- Creativity: *idea tecnica originale al servizio del racconto, eseguita in modo
  che sembri inevitabile*
- Content: *il contenuto È parte del design: ogni parola tira, la narrazione
  guida lo scroll*

Non lo scrivo per ridimensionare il bersaglio: lo scrivo perché **da 8 a 9 non
si arriva aggiungendo, si arriva togliendo tutto ciò che non è la regola.** È
esattamente la direzione del brief, e va tenuta anche quando costa.

---

## DESIGN — 40% · il problema più grosso è tipografico

### Il ritrovamento scomodo

Il rubric nomina **Space Grotesk due volte, e nessuna è un complimento**:

- è l'anchor del **voto 5**: *"pulito ma generico; type Inter/Space Grotesk;
  ritmo piatto"*;
- è nella lista degli **anti-pattern** dell'estetica AI generica: *"Inter/Space
  Grotesk come primario"*.

Il prototipo usa **Space Grotesk 300 come display e come corpo**, e **JetBrains
Mono** per etichette e numeri — che è la monospaziata più diffusa in circolazione.
Sono, insieme, la coppia di font più prevedibile del web tecnico 2020-2026.

Il brief scrive "una grottesca **con carattere**": è la richiesta giusta, e
Space Grotesk non la soddisfa — è la grottesca che i giurati vedono ogni giorno.

L'anchor 8 chiede *"type bespoke/variabile con scala modulare"*. La scala
modulare c'è già nel brief (ratio 1.333, tabella completa): **è la metà del
lavoro ed è fatta.** Manca l'altra metà, cioè le due famiglie.

> **Decisione da prendere (bloccante per il CSS):** sostituire entrambe le
> famiglie. La scala tipografica del brief resta intatta — cambiano i disegni,
> non i rapporti. Costo: zero in prestazioni (i font sono self-hosted e da
> sottoinsiemare comunque). Guadagno: è la leva singola più pesante sul 40%.

### Il resto del Design

Già in linea col brief e col prototipo: due palette divise dal taglio, un solo
accento saturo sotto la linea, griglia a 8px senza eccezioni.

Il punto di rottura prevedibile sta nelle **sezioni 4 e 5** (l'offerta e il
contatto). Sono quelle dove i siti a tesi smettono di essere a tesi e diventano
una pagina di servizi con un modulo in fondo. L'anchor 9,5 chiede che *ogni
sezione venda senza rompere il sistema*: quindi anche l'offerta e il contatto
devono **stare sopra o sotto il taglio**, non a metà per comodità.

---

## USABILITY — 30% · è qui che muoiono i siti WebGL

Il brief ha già i numeri giusti. Li riporto come cancelli, non come auspici:

| requisito | soglia | fonte |
|---|---|---|
| LCP | < 2,0 s su 4G reale (rubric: < 2,5 s) | brief, più severo |
| INP | < 200 ms | rubric |
| CLS | < 0,1 | rubric |
| JS totale | < 250 KB gzipped | brief |
| asset 3D | < 500 KB complessivi | brief |
| FPS | 60 desktop, pavimento 30 su Android medio | brief |
| Mobile Excellence | Google mobile ≥ 70/100 | gate Awwwards |
| touch target | ≥ 44 px | rubric |

Oltre ai numeri, per il 9,5 servono le tre cose che il prototipo oggi non ha:

1. **parità vera su mobile** — vedi audit §3.2: il pulsante della chiusura
   commerciale oggi è nascosto sotto 820px;
2. **movimento ridotto onorato dentro l'esperienza** — vedi audit §3.3: oggi
   congela la dimostrazione invece di ridurla;
3. **navigazione da tastiera completa** — oggi la camera si muove solo col
   puntatore, e il foglio modale non trattiene il focus.

E una regola di igiene che vale punti: **niente scroll-jacking.** Lo scorrimento
inerziale (Lenis) è permesso e desiderabile; rubare lo scroll all'utente per
incatenarlo a una sezione è penalizzato.

---

## CREATIVITY — 20% · la distinzione che decide il voto

Il brief dice **"non aggiungere altre trovate"**, e ha ragione: il modo più
comune di perdere qui è avere sette idee laterali invece di una idea regista.

Ma l'anchor 8 chiede **2–4 momenti firma**, e il prototipo oggi ne ha **uno**
(il toggle che calma la nave). La contraddizione è solo apparente, e la
risoluzione è la cosa più importante di questo documento:

> **Servono più istanze della stessa idea, non più idee.**

Il taglio è la regola. I momenti firma sono i punti in cui il taglio *agisce*, e
il brief li ha già elencati al §2 senza chiamarli così:

1. **l'apertura**, in cui il taglio si apre per la prima volta;
2. **la dimostrazione**, in cui il taglio è la linea di galleggiamento e il
   sistema si accende (già costruito);
3. **lo smontaggio della sezione 3**, in cui il taglio diventa piano di sezione
   e il pezzo si apre invece di ruotare;
4. **le transizioni fra sezioni**, che *aprono* invece di dissolvere;
5. **il menu che si apre come uno spaccato.**

Sono cinque applicazioni di una regola sola. Nessuna di esse è una trovata
aggiuntiva; toglierle **non** rende il sito più disciplinato, lo rende più povero.
Quello che va rifiutato è la sesta idea che non discende dal taglio.

Vincolo di casa, non negoziabile e coerente col §6 del brief: **niente effetti al
mouse** — cursore disegnato, pulsanti magnetici, tilt, parallasse col puntatore.
Non contano come creatività, metà giuria è su telefono e non li vede, e i giurati
li leggono come "fatto con un tema".

---

## CONTENT — 10% · pesa poco e moltiplica tutto

Vale il 10% ma è ciò che rende leggibile il Design e credibile la Creativity.

Qui il progetto parte avvantaggiato: il contenuto è **vero per costruzione**, e
il prototipo ha già il registro giusto (la dichiarazione di modello illustrativo,
i valori normalizzati invece di kW inventati). L'anchor 9,5 chiede che la
narrazione **guidi lo scroll**: cioè che l'ordine delle cinque sezioni sia un
argomento, non un indice.

Il rischio unico e concreto: **inventare clienti, gonfiare il curriculum o
spacciare numeri autorali per misure.** Un solo numero non misurato pubblicato
sul sito costa più di quanto renda, perché la sezione 3 è la candidatura al
Developer Award e viene letta da persone che quel mestiere lo fanno.

---

## Il conto, oggi

Stima onesta del prototipo **così com'è**, se fosse pubblicato come sito:

| criterio | peso | voto stimato | pesato | ragione principale |
|---|---|---|---|---|
| Design | 0,40 | 6,0 | 2,40 | direzione coerente ma tipografia da anchor 5 |
| Usability | 0,30 | 4,5 | 1,35 | 702 KB, mobile mutilato, reduced-motion che congela |
| Creativity | 0,20 | 7,0 | 1,40 | un momento firma vero, tecnica non gratuita |
| Content | 0,10 | 7,5 | 0,75 | copy con voce e onestà dichiarata |
| **totale** | | | **5,90** | **Nominee** |

Stima a occhio da revisione statica, non da misura in esecuzione: va rifatta con
i numeri veri appena il sito gira. Serve a dire una cosa sola, che è vera: **il
divario non è nell'idea, è nell'esecuzione e nel peso.** L'idea regge un 9; il
guscio attuale no.

## Le sei mosse che spostano davvero il totale

In ordine di rapporto fra punti guadagnati e lavoro:

1. **Cambiare le due famiglie tipografiche.** Design 40%, costo quasi nullo.
2. **Portare a moduli ES + Vite** e scendere sotto i 250 KB gzipped. Usability 30%.
3. **Parità mobile reale**, chiusura commerciale inclusa. Usability + vendita.
4. **Movimento ridotto dentro l'esperienza**, non al posto dell'esperienza.
5. **Portare a cinque i momenti in cui il taglio agisce**, tutti dalla stessa regola.
6. **Misurare e pubblicare i numeri** — è insieme Usability, Content e la
   candidatura al Developer Award.
