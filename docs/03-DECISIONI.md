# Registro delle decisioni

Ogni riga ha una data, un esito e **una ragione**. Le decisioni si possono
ribaltare: si aggiunge una riga nuova che dice perché, non si riscrive la vecchia.
La cronologia di questo file è parte di ciò che il repo racconta.

Stati: **PRESA** · **PROPOSTA** (in attesa di approvazione) · **APERTA**.

---

## Prese — vengono dal brief

| # | data | decisione | ragione |
|---|---|---|---|
| D01 | 2026-08-25 | Sito **a tesi**, non portfolio | con un lavoro solo, una sezione "works" legge come vuota e trascina giù il resto |
| D02 | 2026-08-25 | Regola generativa unica: **il taglio** | genera composizione, transizioni, tipografia e 3D da un principio solo; tenuto astratto, si trasferisce a settori non nautici |
| D03 | 2026-08-25 | **Cinque sezioni**, non di più | la giuria vede la disomogeneità prima di ogni altra cosa |
| D04 | 2026-08-25 | Stack **Vite + three.js a moduli ES**, niente framework | il sito ha stati e un build serve davvero; il framework no |
| D05 | 2026-08-25 | **Geometria procedurale**, zero modelli di terzi | nessun rischio di licenza, peso sotto controllo, ed è già così nel prototipo |
| D06 | 2026-08-25 | **Zero dipendenze da CDN** | vale in produzione quanto valeva in fiera |
| D07 | 2026-08-25 | **Repo pubblico**, README che spiega le decisioni | il codice è parte di ciò che viene giudicato (Developer Award) |
| D08 | 2026-08-25 | **Niente effetti al mouse** e niente cursore personalizzato | metà del pubblico è su telefono e non li vede; i giurati li leggono come "fatto con un tema"; l'immersione si guida con scroll e tempo |
| D09 | 2026-08-25 | Scala tipografica **ratio 1.333**, base 16px, due famiglie mai tre | i rapporti restano anche se cambiano i disegni |
| D10 | 2026-08-25 | **Due palette divise dal taglio**, un solo accento saturo sotto la linea | è la regola applicata al colore; il rischio "due siti" si governa tenendo identici ritmo e scala |
| D11 | 2026-08-25 | **Griglia 8px senza eccezioni** | i giurati la leggono come controllo senza saperla nominare |
| D12 | 2026-08-25 | Il prototipo entra nel repo **così com'è**, come base di partenza versionata | la differenza fra prima e dopo è essa stessa contenuto |

---

## Proposte — mie, in attesa che il committente approvi

| # | data | proposta | ragione | costo |
|---|---|---|---|---|
| P01 | 2026-08-25 | **Sostituire Space Grotesk e JetBrains Mono** con due famiglie meno battute | il rubric Awwwards cita Space Grotesk sia come anchor del voto 5 sia fra gli anti-pattern dell'estetica generica; Design pesa il 40% | quasi nullo: i font vanno comunque self-hostati e sottoinsiemati |
| P02 | 2026-08-25 | Portare a **cinque i momenti in cui il taglio agisce** (apertura, dimostrazione, spaccato tecnico, transizioni, menu) | l'anchor 8 chiede 2–4 momenti firma, oggi ce n'è uno; ma sono istanze della stessa regola, non idee nuove — quindi non violano il "niente altre trovate" del brief | medio, è lavoro di regia |
| P03 | 2026-08-25 | `prefers-reduced-motion` **a stati confrontabili** invece del congelamento attuale | oggi la dimostrazione si spegne e chi ha quella preferenza non vede la tesi del sito | basso |
| P04 | 2026-08-25 | Il feedback delle altre AI passa da **file nel repo**, non da GitHub Issues | funziona anche con AI che sanno solo leggere un URL pubblico; e la discussione resta versionata insieme al codice | nullo — già impostato |

---

## Aperte — bloccano del lavoro reale

| # | apre | domanda | cosa blocca | opzioni sul tavolo |
|---|---|---|---|---|
| A01 | brief §7.1 | **Il nome del sito** | il registro di ogni riga di testo, il marchio, il dominio | nome di studio (es. il titolo del brief), oppure nome proprio |
| A02 | brief §7.2 | **La lingua** | tutto il copy, e la leggibilità della sezione 3 da parte della giuria | inglese; italiano con etichette tecniche in inglese; italiano puro |
| A03 | brief §7.3 | **Il primo capitolo dopo lo stabilizzatore** | niente, per ora — ma decide se la struttura deve reggere un secondo settore | ancora nautica, oppure un settore diverso per dimostrare che il metodo si trasferisce |
| A04 | P01 | **Quali due famiglie tipografiche** | il CSS, quindi quasi tutto il Design | da proporre in una rosa breve una volta approvata P01 |

### Perché A02 non si può rimandare a lungo

La sezione 3 (*"Come è fatta"*) è prosa tecnica densa ed è la candidatura al
Developer Award. Se è in italiano, gran parte della giuria internazionale la
salta e quel premio evapora. I clienti target sono però italiani. Le due cose
tirano in direzioni opposte e la scelta cambia il testo di tutto il sito, quindi
va fatta **prima** di scrivere il copy, non dopo.
