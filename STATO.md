# Stato del progetto

**Aggiornato:** 2026-08-25 · **Giro:** 2 · **Fase:** fondazioni corrette, porto
non ancora iniziato.

Questo è il file da leggere per primo. Chi dà feedback parta da qui e poi legga
`feedback/COME-DARE-FEEDBACK.md`.

---

## Cosa è successo in questo giro

Sono arrivati **due contributi esterni**. Hanno trovato, fra le altre cose, **due
errori importanti nell'audit del giro 1**. Entrambi verificati, entrambi
confermati, entrambi miei.

I documenti sono stati corretti e i due errori sono lasciati scritti — con il
modo in cui sono nati — invece di essere fatti sparire. La cronologia git
conserva le versioni sbagliate.

### Errore 1 — Il taglio del titolo era dichiarato fatto, e non esiste

L'audit elencava fra le cose acquisite *"il titolo che attraversa la linea e
cambia colore a metà glifo"*. Nel CSS d'autore **non c'è alcun ritaglio**: la
sola occorrenza di `clip` in tutto il file sta dentro il bundle three.js. Le due
copie del titolo sono sovrapposte e la chiara copre l'altra per intero; e il
titolo sta in alto, non incontra mai il 50%.

Come è nato: ho letto il **commento CSS che dichiarava l'intenzione** e l'ho
riportato come implementazione, senza cercare il meccanismo che l'avrebbe
realizzata. *Un commento non è una prova che il codice faccia quella cosa.*

### Errore 2 — La conclusione sul peso era sbagliata

L'audit usava i 702 KB su disco per dire che il prototipo sfondava il budget di
250 KB gzipped. **Misurato: 149,4 KB di JS gzipped. Il budget è rispettato con
margine.** Il porto a moduli ES resta giusto, ma per un'altra ragione: 145 KB
gzipped di codice mai eseguito vanno comunque scaricati e analizzati prima del
primo pixel, e quello ricade su LCP e INP.

Come è nato: ho usato un numero vero fuori dal suo dominio. In `04-MISURE.md`
avevo scritto di mia mano che non andava fatto, e due sezioni più in là l'ho fatto.

### Errore 3 — Il "rubric Awwwards" citato non esiste

`02-OBIETTIVO-9.md` attribuiva ad Awwwards anchor di punteggio, nomi di famiglie
tipografiche e soglie di web vitals. Verificato sulla pagina ufficiale: Awwwards
pubblica **solo** pesi, quorum di 18 giurati con 3 voti scartati, 5 giorni di
votazione, soglia HM 6,5, e le regole dei premi. Nient'altro.

Gli anchor venivano da una **scala interna di questo studio**. È uno strumento
di lavoro legittimo; citarlo come documento ufficiale no. Le attribuzioni sono
corrette, e la scala resta dichiarata per quello che è.

**Conseguenza:** la proposta P01 (cambiare le due famiglie tipografiche) perdeva
la sua unica prova. È declassata da mossa numero uno a intervento successivo, e
la decisione sulle sostitute aspetta una misura vera.

### Errore 4 — Il Developer Award non è un premio intermedio

Testo ufficiale: *"All SOTD winning sites are sent to the developer jury."* Si
apre **solo dopo** aver vinto il Site of the Day. La sezione 3 resta giusta come
contenuto, ma smette di essere una scorciatoia verso un premio: il SOTD si vince
sul 70% Design+Usability, votato da chi guarda il sito, non il codice.

---

## Gli altri difetti verificati in questo giro

Tutti sul prototipo, tutti confermati leggendo il sorgente:

- **perdita di memoria con `prefers-reduced-motion`** — `S.picchi` riceve un
  oggetto per fotogramma e non viene mai svuotato, perché la pulizia dipende da
  un tempo che è congelato. In più `reduce` scorre l'intero array a ogni
  fotogramma: è anche un **rallentamento progressivo**, e colpisce proprio chi
  aveva chiesto meno movimento;
- **bersagli tattili da 20 × 7 px** contro i 44 × 44 richiesti;
- **modale accessibile da tastiera anche da chiusa** — `opacity:0` non toglie dal
  tab order, e `aria-modal="true"` resta attivo;
- **pulsante della chiusura commerciale nascosto sotto 820px** (già nel giro 1);
- **nessuna preview pubblica**: GitHub Pages dà 404 e il README non ha nemmeno
  un'immagine.

---

## La critica che pesa di più

> *"Il progetto sta rischiando di produrre più documentazione che sito."*

È fondata, e viene accolta senza riserve. Al giro 1 il repository conteneva sei
documenti e zero righe di codice di produzione. **Non ci sarà un giro 3 di soli
documenti.**

---

## L'ordine di lavoro, adottato

Entrambi i revisori, per strade diverse, hanno indicato lo stesso ordine:

1. **porto a Vite + moduli ES**, ri-tarando luci e gestione del colore guardando
   il provino (i default di three sono cambiati da r152: i valori attuali non si
   ricopiano);
2. **i difetti verificati** — a partire dal taglio del titolo, che non è una
   correzione ma il primo momento-firma da costruire davvero;
3. **preview pubblica** e un'immagine nel README;
4. **prima campagna di misure**, con le condizioni di prova fissate una volta.

**Nome, lingua e famiglie tipografiche non bloccano nessuno di questi quattro**,
e non li si aspetta.

---

## Su cosa serve ancora un parere

1. **A02 — la lingua.** Proposta motivata: **inglese**, con i nomi dei componenti
   meccanici lasciati anche in italiano dove sono termini d'arte. L'argomento è
   in `docs/03-DECISIONI.md`. Serve la decisione del committente, ma **non blocca**.
2. **A01 — il nome.** Idem: serve, non blocca.
3. **I punteggi reali dei SOTD.** Affermazione mia del giro 1 ("8 medio-alti")
   contestata ("7,2–7,5"). **Non ho una misura per nessuna delle due e ho
   ritirato la mia.** Chi può aprire le schede di una ventina di SOTD e leggere i
   voti dove sono esposti chiuda la questione.
4. **Il censimento delle `font-family` degli ultimi 20 SOTD.** È la misura che
   decide se la tesi "il font battuto costa punti" regge come causa o resta un
   gusto. Da fare prima di scegliere le sostitute.
