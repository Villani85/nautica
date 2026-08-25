# Obiettivo dichiarato: 9 su ogni criterio

Il committente ha fissato il bersaglio: **9**. Questo documento lo traduce in
requisiti verificabili.

> **Revisione 2 — 2026-08-25.** La revisione 1 attribuiva ad Awwwards un rubric
> con anchor di punteggio, nomi di font e soglie di web vitals. **Quel documento
> non esiste.** Le attribuzioni sono corrette qui, separando ciò che è ufficiale
> da ciò che è nostro. Dettaglio in `feedback/claude-2026-08-25.md`.

---

## 1. Che cosa dice davvero Awwwards, e che cosa diciamo noi

La distinzione conta, perché la revisione 1 l'aveva persa e su una fonte
inesistente si erano appoggiate due proposte.

### Ufficiale — <https://www.awwwards.com/about-evaluation/>

- **Pesi:** Design 40% · Usability 30% · Creativity 20% · Content 10%.
- **Voto:** minimo 18 giurati; i **3 voti più lontani dalla media** sono
  eliminati automaticamente; la votazione dura **5 giorni**. Un sito può vincere
  il SOTD prima della scadenza se prende un voto alto di giuria **e almeno 10
  utenti PRO**. Contano solo i voti di utenti professionali validati.
- **Honorable Mention:** 6,5 o più.
- **Site of the Day:** *"only the sites scored the highest by the jury"*. Nessuna
  soglia numerica pubblicata.
- **Developer Award:** *"All SOTD winning sites are sent to the developer jury
  to be meticulously evaluated according to the Developer Guidelines, if the
  site is scored higher than a 7 it will be given a Developer Award."*
- **Site of the Month:** gli otto punteggi più alti del mese, rivisti una
  seconda volta.
- Il punteggio di giuria **si vede solo se si vince il SOTD**.

### Da altre fonti, vere ma non Awwwards

- **LCP, INP, CLS** e le loro soglie: Core Web Vitals di **Google**.
- **Bersagli tattili ≥ 44 px**: **WCAG** e Human Interface Guidelines di Apple.
- Non esiste, sulla pagina ufficiale, alcun "gate Mobile Excellence ≥ 70/100".

### Nostro — scala interna di lavoro, dichiarata tale

Gli anchor 5 / 8 / 9,5 usati più sotto vengono da una **scala interna** di questo
studio, costruita per stimare a casa un voto e produrre una fix-list. Servono a
discutere e a darsi un metro comune. **Non sono criteri di giuria e non vanno
citati come tali** — né qui, né sul sito, né parlando con un cliente.

---

## 2. Che cosa significa "9", una volta rimessi i piedi per terra

Un totale pesato di 9,0 è molto alto. Quanto, esattamente, **non lo so**: la
revisione 1 affermava che i SOTD reali stanno "negli 8 medio-alti", una
revisione esterna ha risposto che stanno spesso intorno a 7,2–7,5, e **non ho
una misura per nessuna delle due**. I punteggi non sono esposti nell'elenco
pubblico. **Ritiro la mia affermazione** invece di difenderla; la questione si
chiude aprendo le schede di una ventina di SOTD e leggendo i voti dove sono
esposti, ed è un lavoro da fare.

Quello che resta vero senza bisogno di quel numero:

- il **SOTD si vince sul 70% Design+Usability**, votato da 18+ giurati
  internazionali che guardano il sito, non il codice;
- il **Developer Award è a valle**: si apre solo dopo aver vinto il SOTD. Non è
  una via alternativa più facile;
- di conseguenza **la sezione 3 non è una scorciatoia verso un premio.** Resta
  giusta come contenuto — regge il Content e la credibilità dell'intero sito —
  ma il lavoro che porta al SOTD viene prima nell'ordine di esecuzione.

E la conseguenza di metodo, che vale più di tutte: **da 8 a 9 non si arriva
aggiungendo, si arriva togliendo tutto ciò che non è la regola.**

---

## 3. DESIGN — 40%

L'anchor interno dell'8 chiede tipografia con carattere e scala modulare; quello
del 9,5 chiede un linguaggio visivo coerente dall'inizio alla fine, in cui ogni
sezione vende senza rompere il sistema.

**La scala modulare c'è già** nel brief (ratio 1.333, tabella completa): è metà
del lavoro tipografico, ed è fatta.

**Sulle due famiglie.** Space Grotesk e JetBrains Mono sono, insieme, la coppia
più prevedibile del web tecnico degli ultimi anni, e il brief chiedeva "una
grottesca **con carattere**". Che valga la pena cambiarle è una **preferenza di
studio sostenibile** — non un requisito di giuria, e la revisione 1 sbagliava a
presentarla come tale. Vedi P01 in `docs/03-DECISIONI.md`, che è stata declassata.

Prima di scegliere le sostitute serve una misura, non un'opinione: **censire la
`font-family` effettiva degli ultimi 20 SOTD** e contare quante usano famiglie
battute. Se la quota è alta, la tesi "il font raro fa punteggio" cade come causa,
pur restando legittima come gusto.

**Il punto di rottura prevedibile** sta nelle sezioni 4 e 5 (offerta e contatto):
è lì che i siti a tesi diventano una pagina di servizi con un modulo in fondo.
Devono stare **sopra o sotto il taglio**, non a metà per comodità.

---

## 4. USABILITY — 30% · è qui che muoiono i siti WebGL

I cancelli, con la fonte accanto:

| requisito | soglia | fonte |
|---|---|---|
| LCP | < 2,0 s su 4G reale | brief (Google: < 2,5 s) |
| INP | < 200 ms | Google Core Web Vitals |
| CLS | < 0,1 | Google Core Web Vitals |
| JS totale | < 250 KB gzipped | brief |
| asset 3D | < 500 KB complessivi | brief |
| FPS | 60 desktop, pavimento 30 su Android medio | brief |
| touch target | ≥ 44 px | WCAG / Apple HIG |

**Il budget JS è già rispettato:** 149,4 KB gzipped misurati sul prototipo. Il
porto a moduli ES serve ad accorciare parsing e primo disegno — quindi LCP e
INP — non a rientrare in un limite che non è mai stato sforato.

Restano i difetti **verificati** che oggi impediscono un voto alto:

1. **parità mobile assente** — il pulsante della chiusura commerciale è
   `display:none` sotto 820px;
2. **movimento ridotto che spegne la dimostrazione**, e in più cresce senza
   limite e rallenta progressivamente (`S.picchi` mai svuotato);
3. **bersagli tattili da 20 × 7 px** contro i 44 × 44 richiesti;
4. **modale accessibile da tastiera anche quando è chiusa**, senza focus trap né
   restituzione del focus;
5. **nessuna navigazione da tastiera** per il punto di vista.

E una regola d'igiene che vale punti: **niente scroll-jacking.** Lo scorrimento
inerziale è permesso e desiderabile; rubare lo scroll all'utente no.

---

## 5. CREATIVITY — 20% · la distinzione che decide il voto

Il brief dice **"non aggiungere altre trovate"**, e ha ragione: il modo più
comune di perdere qui è avere sette idee laterali invece di una idea regista.

La tesi di questo documento resta, ed è l'unica cosa della revisione 1 che nessun
revisore ha contestato:

> **Servono più istanze della stessa idea, non più idee.**

Il taglio è la regola. I momenti firma sono i punti in cui il taglio *agisce*, e
il brief li ha già elencati al §2 senza chiamarli così:

1. **l'apertura**, in cui il taglio si apre per la prima volta;
2. **la dimostrazione**, in cui il taglio è la linea di galleggiamento e il
   sistema si accende — **l'unico costruito davvero**;
3. **il titolo che attraversa la linea e cambia colore a metà glifo** —
   dichiarato nei commenti del prototipo ma **mai implementato**: non esiste
   alcun `clip-path`;
4. **lo smontaggio della sezione 3**, in cui il taglio diventa piano di sezione
   e il pezzo si apre invece di ruotare;
5. **le transizioni fra sezioni**, che *aprono* invece di dissolvere;
6. **il menu che si apre come uno spaccato.**

Sono sei applicazioni di una regola sola. Nessuna è una trovata aggiuntiva.
Quello che va rifiutato è la settima idea che non discende dal taglio.

Vincolo di casa, coerente col §6 del brief: **niente effetti al mouse** —
cursore disegnato, pulsanti magnetici, tilt, parallasse col puntatore. Metà del
pubblico è su telefono e non li vede, e si leggono come "fatto con un tema".

---

## 6. CONTENT — 10% · pesa poco e moltiplica tutto

Il progetto parte avvantaggiato: il contenuto è **vero per costruzione**, e il
prototipo ha già il registro giusto — la dichiarazione di modello illustrativo,
i valori normalizzati invece di kW inventati.

Il rischio è uno solo e concreto: **spacciare numeri autorali per misure.** Vale
per il sito e vale per questo repository, dove è già successo due volte in un
giorno. Ogni numero pubblicato porta con sé data, condizioni e strumento.

---

## 7. Il conto, oggi

Stima con la **scala interna**, sul prototipo così com'è, dopo le verifiche:

| criterio | peso | voto | pesato | ragione principale |
|---|---|---|---|---|
| Design | 0,40 | 5,5 | 2,20 | direzione coerente, ma il momento tipografico che la incarnava non è implementato |
| Usability | 0,30 | 4,5 | 1,35 | cinque difetti verificati: mobile, reduced-motion, bersagli, modale, tastiera |
| Creativity | 0,20 | 6,0 | 1,20 | un momento firma reale su sei previsti; tecnica non gratuita |
| Content | 0,10 | 7,5 | 0,75 | copy con voce e onestà dichiarata |
| **totale** | | | **5,50** | |

Stima interna da revisione statica, **non una previsione di voto Awwwards**. Il
peso non compare più fra le ragioni: misurato, è a posto.

Serve a dire una cosa sola, che è vera: **il divario non è nell'idea, è
nell'esecuzione.** L'idea regge; il guscio no, e tre dei sei momenti che
dovrebbero portarla non esistono ancora.

---

## 8. L'ordine di lavoro, corretto dopo i due contributi

La revisione 1 metteva la tipografia al primo posto sulla base del rubric
inesistente. Entrambi i revisori, per strade diverse, hanno indicato lo stesso
ordine, ed è adottato:

1. **Porto a Vite + moduli ES**, ri-tarando luci e gestione del colore
   guardando il provino, non ricopiando i valori.
2. **I cinque difetti verificati**: taglio del titolo da costruire, perdita di
   memoria con movimento ridotto, modale, bersagli tattili, pulsante commerciale
   nascosto su mobile.
3. **Preview pubblica** e un'immagine nel README. Oggi il repository contiene
   più prosa che sito, ed è la critica più pesante ricevuta.
4. **Prima campagna di misure vere**, con le condizioni di prova fissate una
   volta e non più cambiate.
5. **Gli altri momenti in cui il taglio agisce**, uno per volta.
6. **La tipografia**, dopo il censimento delle font dei SOTD.

Nome, lingua e famiglie tipografiche **non bloccano** i primi quattro punti.
