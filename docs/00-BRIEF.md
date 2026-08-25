# LA SEZIONE — brief di progetto

Sito personale con doppia funzione: dimostrazione di capacità tecnica e strumento
di vendita per esperienze 3D interattive di prodotto industriale.

---

## 1. La decisione strutturale

**Non è un portfolio. È un sito a tesi.**

Un portfolio viene giudicato sui lavori che contiene. Oggi c'è un pezzo solo,
autoprodotto. Davanti a una giuria fatta di designer e creative director in
attività, una sezione "works" con un elemento non legge come "agli inizi": legge
come vuota, e trascina giù anche il resto.

Un sito a tesi viene giudicato sull'argomento e sull'esecuzione dell'argomento.
Di entrambi ce n'è abbastanza per riempire un sito intero.

La differenza pratica: non si scrive mai "ecco i miei progetti". Si scrive
un'affermazione, la si dimostra, e si dice cosa costa applicarla al prodotto di
chi guarda.

Man mano che arrivano lavori veri, entrano come prove aggiuntive dentro la stessa
struttura. Non serve rifare il sito: serve aggiungere capitoli. È anche il motivo
per cui il repo pubblico funziona — la cronologia dei commit diventa essa stessa
contenuto.

---

## 2. Tesi e regola generativa

**Tesi:** il pezzo che vale di più è quello che non vedi mai.

**Regola generativa: il taglio.**

Una regola sola che genera tutto: composizione, transizioni, tipografia, 3D.
Ogni elemento del sito o sta sopra il taglio o sta sotto. Niente sta a metà per
caso.

La linea di galleggiamento della demo nautica è l'istanza marina di questa regola,
non la regola stessa. Questo è importante: tenere "il taglio" come principio
astratto permette di aggiungere domande diverse — riduttori, macchine per il
packaging, gruppi termici — senza rifare il linguaggio. Tenere "la linea di
galleggiamento" avrebbe incastrato tutto nella nautica per sempre.

**Applicazioni della regola, sezione per sezione:**

- il piano di taglio come asse compositivo orizzontale, ricorrente ma non identico
- transizioni che aprono, non che dissolvono
- il 3D che si seziona invece di ruotare
- i titoli che attraversano il taglio e cambiano colore a metà glifo
- il menu che si apre come uno spaccato, non che compare

---

## 3. Architettura

Cinque sezioni. Poche e fatte bene battono molte e disomogenee: la giuria vede la
disomogeneità prima di ogni altra cosa.

**1 · Apertura**
L'affermazione, e il taglio che si apre per la prima volta. Nessuna spiegazione.
Deve essere leggibile in tre secondi e finire di caricare prima.

**2 · La dimostrazione**
Lo stabilizzatore a pinne, interattivo, a piena pagina. È il momento — mare 4,
toggle, la nave che si calma. Qui vive il 20% di Creativity.

**3 · Come è fatta**
Lo smontaggio tecnico della dimostrazione: il piano di sezione, il quadrilatero
articolato risolto per intersezione di cerchi, il modello energetico dichiarato
illustrativo, il budget degli asset, i numeri di performance misurati.
Questa è la sezione che vale doppio: è contenuto vero (10%) ed è la candidatura
al Developer Award. Va scritta come si scrive a un pari, non come marketing.

**4 · Cosa succede col vostro prodotto**
L'offerta, concreta. Cosa serve dal cliente (CAD, dati, documentazione tecnica),
cosa esce (sito, presentazione dealer, monitor in fiera, tablet dell'agente),
quali vincoli normativi si portano dietro certi settori. Nessuna poesia.

**5 · Contatto**
Corto. Un indirizzo, il repo, il profilo.

---

## 4. Dove si vincono e si perdono i punti

Il punteggio pesa Design 40%, Usability 30%, Creativity 20%, Content 10%.
Design e Usability da soli sono il 70%. Il WebGL è il 20%.

### Design — 40%

Il punto in cui è già stato perso terreno in passato: nessun sistema tipografico
coerente. Va deciso adesso, per iscritto, prima di scrivere una riga di CSS.

**Scala tipografica** — ratio 1.333 (quarta giusta), base 16px:

| ruolo | dimensione | peso | tracking |
|---|---|---|---|
| display | clamp(40px, 7vw, 96px) | 300 | -0.035em |
| titolo sezione | clamp(28px, 4vw, 48px) | 300 | -0.03em |
| sottotitolo | 24px | 400 | -0.01em |
| corpo | 17px / 1.55 | 300 | 0 |
| etichetta | 10px | 400 | +0.2em, maiuscoletto |
| dato | 11–46px mono | 400 | tabular-nums |

Due famiglie, mai tre. Una grottesca con carattere per display e corpo, una
monospaziata per etichette e numeri. Il mono non è decorazione: è il registro del
disegno tecnico, ed è il motivo per cui il sito sembrerà competente prima ancora
che qualcuno legga.

**Colore.** Due palette divise dal taglio, non una unificata. Sopra: carta da
disegno navale. Sotto: acqua profonda desaturata. Un solo accento saturo, sotto
la linea. Il rischio è reale — due palette possono sembrare due siti — e si governa
tenendo identici ritmo di spaziatura e scala tipografica su entrambi i lati.

**Spaziatura.** Griglia a 8px, senza eccezioni. È la cosa che i giurati leggono
come "controllo" senza saperla nominare.

### Usability — 30%

È qui che muoiono i siti WebGL, ed è il 30%.

- LCP sotto 2,0s su 4G reale, non su localhost
- JS totale sotto 250 KB gzipped — quindi three.js a moduli ES con tree-shaking,
  non il bundle da 590 KB usato nel prototipo
- asset 3D sotto 500 KB complessivi
- 60fps su desktop, pavimento a 30fps su Android di fascia media
- **parità su mobile**: la stessa esperienza, non un messaggio di scuse
- navigazione da tastiera completa, focus visibili, `prefers-reduced-motion`
  rispettato, gerarchia di heading semantica

Ogni numero va misurato e riportato nella sezione 3. Misurarli è metà del lavoro;
pubblicarli è l'altra metà, e vale come contenuto.

### Creativity — 20%

Già coperto dalla dimostrazione. **Non aggiungere altre trovate.** Il modo più
comune di perdere qui è avere sette idee laterali invece di una idea regista.

### Content — 10%

Vale poco in percentuale ma è il moltiplicatore di tutto il resto: è ciò che rende
leggibile il Design e credibile la Creativity. Essendo un sito personale, il
contenuto è vero per costruzione — a patto di non inventare clienti, non gonfiare
il curriculum e non spacciare numeri autorali per misure.

---

## 5. Budget tecnico

- **Stack:** Vite + three.js a moduli ES. Niente framework se non serve.
- **3D:** geometria procedurale dove possibile, come nel prototipo. Zero modelli
  di terzi, zero rischi di licenza.
- **Font:** self-hosted, subset ai soli glifi usati, `font-display: swap`.
- **Zero dipendenze da CDN.** Vale per la produzione quanto valeva per la fiera.
- **Repo pubblico:** README che spiega le decisioni, non solo come si compila.
  Il codice adesso è parte di ciò che viene giudicato.

---

## 6. Cosa non entra

Vale quanto la lista di cosa entra.

Niente configuratore. Niente altre tipologie di pinne. Niente fisica reale.
Niente yacht completo. Niente mare fotorealistico. Niente sezione "servizi" con
tre colonne di icone. Niente blog. Niente preloader che conta fino a cento.
Niente cursore personalizzato.

Il suono si valuta solo quando le cinque sezioni funzionano su mobile.

---

## 7. Decisioni ancora aperte

1. **Il nome del sito.** Nome proprio, oppure un nome di studio. Cambia il registro
   di tutto il testo.
2. **La lingua.** Italiano, inglese, o italiano con etichette tecniche in inglese.
   La giuria è internazionale; i clienti target sono in gran parte italiani.
   Queste due cose tirano in direzioni opposte e va scelto, non rimandato.
3. **Il primo capitolo dopo lo stabilizzatore**, quando esisterà: nautica di nuovo,
   o un secondo settore per dimostrare che il metodo si trasferisce.
