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

## Prese — giro 2, dopo i due contributi esterni

| # | data | decisione | ragione |
|---|---|---|---|
| D13 | 2026-08-25 | **Il metro interno si dichiara interno.** Gli anchor di punteggio 5/8/9,5 restano come scala di lavoro, ma non vengono mai attribuiti ad Awwwards | Awwwards pubblica pesi, quorum e soglia HM, e nient'altro. Attribuire a una fonte inesistente è l'errore più pericoloso: quasi tutto è corretto, quindi nessuno controlla |
| D14 | 2026-08-25 | **Il Developer Award è trattato come premio a valle del SOTD**, non come via alternativa | testo ufficiale: *"All SOTD winning sites are sent to the developer jury"*. La sezione 3 resta contenuto vero ma non è una scorciatoia verso un premio |
| D15 | 2026-08-25 | **Si lavora prima sui difetti verificati, poi sull'estetica.** Porto a Vite, cinque difetti, preview pubblica, misure — poi tipografia | i difetti sono misurati, le preferenze estetiche sono stimate. Indicazione convergente di entrambi i revisori |
| D16 | 2026-08-25 | **Il peso si dichiara sempre in gzip**, e ogni numero pubblicato porta data, condizioni e strumento | il peso su disco usato per parlare di rete è un numero vero adoperato fuori dal suo dominio: è già costato una conclusione sbagliata |
| D17 | 2026-08-25 | **Gli errori si correggono in chiaro**: il documento si riscrive, la versione sbagliata resta nella cronologia git e l'esito della verifica resta in `feedback/` | il repo è pubblico e la cronologia è contenuto; nascondere una correzione toglie proprio la prova che il metodo funziona |
| D18 | 2026-08-25 | **Una preview pubblica esiste prima del prossimo giro di documenti** | *"il repository contiene più prosa che sito"* è la critica più pesante ricevuta, ed è fondata |

---

## Proposte — mie, in attesa che il committente approvi

| # | data | proposta | ragione | costo |
|---|---|---|---|---|
| ~~P01~~ | ~~2026-08-25~~ | ~~**Sostituire Space Grotesk e JetBrains Mono**, come mossa numero uno~~ | ~~il rubric Awwwards cita Space Grotesk fra gli anti-pattern; Design pesa il 40%~~ | ~~quasi nullo~~ |
| **P01-bis** | 2026-08-25 | **Sostituire le due famiglie, ma dopo i difetti verificati e dopo una misura** | la motivazione originale si appoggiava a un rubric che non esiste (vedi D13). Che le due famiglie siano sovraesposte resta una **preferenza di studio sostenibile**, non un requisito di giuria. E il costo non è "quasi nullo": ridisegnare la scala, ritarare tracking e interlinea e rifare i provini è lavoro vero | medio, e da pagare dopo |
| P02 | 2026-08-25 | Portare a **cinque i momenti in cui il taglio agisce** (apertura, dimostrazione, spaccato tecnico, transizioni, menu) | l'anchor 8 chiede 2–4 momenti firma, oggi ce n'è uno; ma sono istanze della stessa regola, non idee nuove — quindi non violano il "niente altre trovate" del brief | medio, è lavoro di regia |
| P03 | 2026-08-25 | `prefers-reduced-motion` **a stati confrontabili** invece del congelamento attuale | oggi la dimostrazione si spegne e chi ha quella preferenza non vede la tesi del sito | basso |
| P04 | 2026-08-25 | Il feedback delle altre AI passa da **file nel repo**, non da GitHub Issues | funziona anche con AI che sanno solo leggere un URL pubblico; e la discussione resta versionata insieme al codice | nullo — già impostato |


## Prese — giro 4, dopo la ricerca sul Sito dell'Anno

| # | data | decisione | ragione |
|---|---|---|---|
| D19 | 2026-08-25 | **La geometria procedurale smette di essere un obbligo.** La regola diventa: *asset originali e controllati, nessun modello generico o senza licenza* | D05 era stato preso per licenza e peso, e per quelli resta valido. Ma come vincolo assoluto diventa una prigione: se la qualita' richiesta pretende un modello costruito apposta in Blender, si costruisce. Autore e committente devono coincidere — quello e' il vincolo vero, ed e' anche cio' che rende il progetto ammissibile |
| D20 | 2026-08-25 | **Gli effetti al mouse passano da vietati a non essenziali.** Il desktop puo' avere una risposta piu' ricca; nessun momento o informazione puo' dipendere dal puntatore; il telefono ha un'esperienza equivalente, non impoverita | Lusion e Noomo hanno vinto anche con interazione al cursore. Il divieto assoluto era troppo rigido — ma la ragione che lo aveva generato non era il mouse: era la **dipendenza** dal mouse. La regola nuova conserva la ragione e lascia cadere il divieto |
| D21 | 2026-08-25 | **Tre picchi memorabili, non sei momenti distribuiti**: il taglio, la stabilizzazione, dentro lo scafo. Menu, transizioni, offerta e contatto usano la stessa grammatica ma non competono con i tre | sei momenti equivalenti diluiscono; i vincitori hanno una sequenza che si racconta in una frase |
| D22 | 2026-08-25 | **Il Developer Award e' trattato come requisito, non come premio aggiuntivo** | verificato: 28 vincitori SOTY su 30 lo hanno. Il livello tecnico del SOTY e' quello che supera 7 con una giuria di soli sviluppatori |
| D24 | 2026-08-25 | **Luce volumetrica calda contro l'acqua fredda**, per togliere la freddezza dello schermo | la scena attuale e' grigia e piatta: rilevato indipendentemente da due contributi. E cade sulla regola gia' presa delle due palette divise dal taglio — caldo sopra, freddo sotto |
| D25 | 2026-08-25 | **Scorrimento con inerzia pesante**, tarato per restituire la massa dello scafo | e' motion design con una ragione, non un effetto aggiunto |
| D26 | 2026-08-25 | **Nessuna frizione fabbricata sull'azione di conversione**: niente pulsanti che si bloccano, niente finte esitazioni, niente messaggi che mettono in dubbio chi clicca | e' un dark pattern, lo riconoscono sia i giurati sia l'ufficio tecnico a cui dobbiamo vendere. E si perde su Usability, che pesa il 30% ed e' il criterio piu' debole dei vincitori |
| D27 | 2026-08-25 | **La navigazione resta standard**: niente gesto obbligatorio per avanzare, niente eliminazione dei menu | scroll-jacking e barriera per tastiera e tecnologie assistive. Usability 30%, ed e' il terreno dove possiamo superare un vincitore |
| D23 | 2026-08-25 | **Il lancio fa parte del progetto**, non e' quello che viene dopo: video, clip dei momenti, case study in inglese, scheda Awwwards curata, crediti precisi | il premio annuale non si decide il giorno della candidatura: dipende dal fatto che il sito continui a essere visto |

### I bersagli interni, per competere

Non sono soglie ufficiali: sono il livello a cui progettare. Il riferimento e'
Lando Norris, Site of the Year 2025, che ha totalizzato 8,18.

| area | bersaglio | Lando Norris |
|---|---|---|
| Design | ≥ 8,2 | 8,12 |
| Usability | ≥ 8,0 | 7,90 |
| Creativity | ≥ 8,5 | 8,71 |
| Content | ≥ 8,0 | 8,18 |
| DEV — Animazioni/Transizioni | ≥ 9 | 8,60 |
| DEV — WPO | ≥ 8,5 | 7,60 |
| DEV — Responsive | ≥ 8,5 | 7,40 |
| DEV — Accessibilita' | ≥ 8 | **7,00** |

L'ultima riga e' la piu' interessante: il sito dell'anno prende **7,00 in
accessibilita'**. E' il terreno dove si supera un vincitore con lavoro
ordinario fatto bene, ed e' gia' quasi tutto in piedi.

### Le due mosse che non c'erano

| # | mossa | perche' non e' rimandabile |
|---|---|---|
| **M7** | **Costruire la presenza su Awwwards**, da adesso e in parallelo alla costruzione | gli utenti votano a **tre** livelli: 6,5 anche da loro per l'Honorable Mention; 10 utenti PRO per anticipare il SOTD; al SOTM i voti utente pesano di piu'. Oggi la presenza e' zero, ed e' lavoro di mesi che non si recupera lavorando meglio alla fine |
| **M8** | **Decidere quanto il sito puo' permettersi di essere ossessivo** invece che sensato | i vincitori SOTY autoprodotti non sono sensati: Bruno Simon ha buttato la struttura di un portfolio per tenere una sola idea. Un sito sensato arriva a 8. Non e' un argomento per togliere offerta e contatto: e' un argomento per non lasciarle diventare la parte normale di un sito per il resto ossessivo |

---

## Aperte — bloccano del lavoro reale

| # | apre | domanda | cosa blocca | opzioni sul tavolo |
|---|---|---|---|---|
| A01 | brief §7.1 | **Il nome del sito** | il registro di ogni riga di testo, il marchio, il dominio | nome di studio (es. il titolo del brief), oppure nome proprio |
| A02 | brief §7.2 | **La lingua** | tutto il copy, e la leggibilità della sezione 3 da parte della giuria | inglese; italiano con etichette tecniche in inglese; italiano puro |
| A03 | brief §7.3 | **Il primo capitolo dopo lo stabilizzatore** | niente, per ora — ma decide se la struttura deve reggere un secondo settore | ancora nautica, oppure un settore diverso per dimostrare che il metodo si trasferisce |
| A06 | 07-RIFERIMENTI-TECNICI §3.1 | **Le pinne attive non funzionano da ferme**: si aggiunge la velocita' come grandezza visibile, o si dichiara il limite? | la verosimiglianza della dimostrazione davanti a un tecnico del settore | aggiungere la velocita' e' la strada che rafforza la tesi — *la parte invisibile funziona solo se la nave cammina* — ma allunga il lavoro sulla sequenza d'oro |
| A05 | N1 del 2° revisore | **La rete nella community Awwwards** | l'Honorable Mention, quindi tutto il percorso | serve 6,5 **anche** dagli utenti qualificati, oltre che dalla giuria: due votazioni separate. Con rete pari a zero non si prende nemmeno l'HM, ed e' l'unica cosa che non si recupera lavorando meglio alla fine |
| A04 | P01-bis | **Quali due famiglie tipografiche** | il CSS, ma **non** il porto a Vite né i difetti | da decidere **dopo** il censimento delle `font-family` degli ultimi 20 SOTD |

### Su A02, l'argomento è cambiato — e la conclusione si è rafforzata

La revisione 1 motivava l'urgenza così: la sezione 3 è la candidatura al
Developer Award, se è in italiano la giuria la salta e il premio evapora.

**Quell'argomento non regge più**, perché il Developer Award è a valle del SOTD
(D14). Ma la conclusione ne esce più forte, non più debole: se il SOTD viene
prima e lo votano 18+ giurati internazionali che guardano **tutto il sito**,
allora è l'intero sito a dover essere leggibile da loro, non solo la sezione 3.

E il conflitto dichiarato — giuria internazionale contro clienti italiani — è
meno reale di quanto sembrasse: un cliente industriale non viene convinto dal
sito, viene convinto da una conversazione, una mail e una demo aperta davanti a
lui. Al sito serve che sia credibile, e l'inglese non lo rende meno credibile per
un ufficio tecnico italiano. La giuria invece vota solo quello che legge.

**Proposta:** inglese, con i nomi propri dei componenti meccanici lasciati anche
in italiano dove sono termini d'arte. Non è un compromesso, è precisione tecnica.
La decisione resta del committente.

### E su cosa A02 NON blocca

Niente dei primi quattro punti dell'ordine di lavoro: il porto a Vite, i difetti
verificati, la preview pubblica e la prima campagna di misure si fanno senza
sapere nome, lingua né font.
