# Il percorso, e il bersaglio corretto

**2026-08-25.** Il bersaglio dichiarato all'inizio era "9 su ogni criterio".
Con i punteggi veri sotto gli occhi va corretto, e la correzione rende il
progetto **più** ambizioso, non meno.

## Quanto serve davvero

Dalla scheda pubblica di un vincitore, non da una stima:

**Lando Norris** (OFF+BRAND) — Site of the Day 17 novembre 2025, poi **Site of
the Year 2025**:

| criterio | peso | voto |
|---|---|---|
| Design | 40% | 8,12 |
| Usability | 30% | **7,90** |
| Creativity | 20% | 8,71 |
| Content | 10% | 8,18 |
| **totale** | | **8,18** |

Il portfolio di Bruno Simon, Site of the Month 2026, sta a **8,11**.

**Il massimo premio dell'anno si prende con 8,2.** Un bersaglio di 9 su ogni
criterio è sopra ciò che vince, e ha un costo reale: spinge a rifinire
all'infinito invece di spedire, e a trattare come insufficiente un lavoro che
sarebbe già da premio.

E si legge un'altra cosa: **il criterio più basso del sito dell'anno è la
Usability, a 7,90** — su un peso del 30%. È lì che c'è spazio.

## Il Developer Award ha sei criteri, e nessuno li aveva

Non è una valutazione generica sul codice. Lando Norris ha preso **7,58**:

| criterio | voto |
|---|---|
| Semantics / SEO | 7,40 |
| Animations / Transitions | 8,60 |
| **Accessibility** | **7,00** |
| WPO | 7,60 |
| Responsive Design | 7,40 |
| Markup / Meta-data | 7,40 |

**Il sito dell'anno prende 7,00 in accessibilità.** È il punto più debole dei
vincitori ed è il meno costoso da superare: una tastiera che funziona davvero,
contrasti misurati, `prefers-reduced-motion` onorato dentro l'esperienza,
bersagli tattili veri. Sono tutte cose già fatte in questo commit — e sono la
strada più corta verso un vantaggio misurabile su chi vince.

Vale però il vincolo di ordine: **il Developer Award si apre solo dopo aver
vinto il SOTD.** Il lavoro tecnico non porta punti finché il 70%
Design+Usability non ha portato il sito fino lì.

## La scala del percorso

1. approvazione come Nominee;
2. **Honorable Mention** — 6,5 dalla giuria **e** 6,5 dagli utenti qualificati:
   sono due votazioni separate, vedi A05;
3. **Site of the Day**;
4. valutazione tecnica e **Developer Award** sopra 7;
5. selezione fra gli otto punteggi più alti del mese e **Site of the Month**;
6. candidatura annuale e possibile **Site of the Year**.

---

# La sequenza d'oro

Il rischio del progetto non è tecnico. È che il risultato sembri **una prova
tecnica ben fatta**: un esercizio three.js, un pannello industriale, un
modellino, o una dashboard appoggiata sopra un canvas. A quel punto il voto si
ferma sotto l'8 qualunque sia la qualità del codice.

Perciò **non si costruiscono le altre quattro sezioni adesso.** Prima si produce
un solo pezzo di esperienza, 20–30 secondi, alla qualità finale:

1. la superficie si apre;
2. appare la nave;
3. il mare sale a forza 4;
4. l'utente accende il sistema;
5. la nave si calma;
6. il taglio entra nello scafo;
7. il meccanismo nascosto viene rivelato.

Sette battute, una regola sola: **il taglio**. E il punto 7 è la tesi del sito
resa visibile — *il pezzo che vale di più è quello che non vedi mai*.

## Cosa deve già avere, per essere considerata finita

- modello e materiali definitivi, non il modello generico attuale;
- illuminazione cinematografica, tarata guardando il provino;
- tipografia definitiva o quasi;
- movimento con un ritmo d'autore, non transizioni di comodo;
- passaggio fra DOM e WebGL invisibile;
- resa piena su desktop **e** su telefono;
- il suono si valuta solo dopo che mobile e prestazioni stanno in piedi.

## La regola che rende utile tutto questo

> **Se la sequenza non regge il confronto con un Site of the Month, le altre
> quattro sezioni non si costruiscono: si rifà la sequenza.**

È un esame con un esito che può essere negativo. Senza quello è solo un piano.

## Come si giudica

Confronto **alla cieca**, senza dichiarare quale sia il nostro, contro vincitori
SOTD, SOTM e qualche SOTY recente. Almeno tre round: un giudizio solo non prova
niente, e su un progetto precedente quattro confronti identici hanno ribaltato
il verdetto fra un round e l'altro.

Tre prospettive esterne, non una: un art director, uno sviluppatore creativo, e
qualcuno del settore nautico o industriale.

## Cosa serve rifare, rispetto a oggi

Il modello attuale è geometria pulita ma generica. Per la sequenza d'oro serve:

- qualità geometrica superiore e dettaglio meccanico credibile;
- materiali distinti fra loro, non quattro varianti di grigio;
- profondità interna vera — dentro lo scafo ci deve essere qualcosa;
- camera molto più controllata;
- **un'apertura dello scafo memorabile**: è il fotogramma da cui il sito verrà
  riconosciuto.

## L'asticella finale, quando ci si arriva

Per il massimo premio non basta un picco. Serve **l'assenza di punti deboli**:
nessuna sezione inferiore alle altre, mobile davvero equivalente, caricamento
rapido, accessibilità completa, copy inglese forte, il progetto riconoscibile da
un fotogramma solo, e un momento che il giurato ricordi dopo averne visti altri
venti.

Nessuno può promettere il premio. Si può però evitare che il progetto venga
finito a un livello semplicemente buono.
