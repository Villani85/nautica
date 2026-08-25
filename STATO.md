# Stato del progetto

**Aggiornato:** 2026-08-25 · **Giro:** 1 · **Fase:** fondazioni, nessun codice di
produzione ancora scritto.

Questo è il file da leggere per primo. Dice cosa è cambiato dall'ultimo giro,
dove siamo, e su cosa serve un parere. Chi dà feedback parta da qui e poi legga
`feedback/COME-DARE-FEEDBACK.md`.

---

## Dove siamo

Esiste **un prototipo funzionante** e **un brief**. Non esiste ancora il sito.

Il prototipo (`prototipo/linea-di-galleggiamento.html`) è un file HTML solo, che
apre con un doppio clic: una dimostrazione interattiva di stabilizzazione a pinne
in three.js, con geometria interamente procedurale. È la **sezione 2** delle
cinque previste. Le altre quattro non esistono.

Il brief (`docs/00-BRIEF.md`) definisce un **sito a tesi**, non un portfolio,
costruito su una regola generativa sola — *il taglio* — con cinque sezioni e un
bersaglio dichiarato: **9 su ogni criterio Awwwards**.

## Cosa è cambiato in questo giro

Primo giro: il repo nasce adesso. È entrato tutto ciò che esisteva, più tre
documenti nuovi.

- `docs/00-BRIEF.md` — il brief, intatto
- `docs/01-AUDIT-PROTOTIPO.md` — **nuovo**: lettura riga per riga del prototipo,
  peso misurato, cosa tenere e cosa costa punti
- `docs/02-OBIETTIVO-9.md` — **nuovo**: il bersaglio "9" tradotto in requisiti
  verificabili, criterio per criterio
- `docs/03-DECISIONI.md` — **nuovo**: registro delle decisioni prese, proposte e aperte
- `docs/04-MISURE.md` — **nuovo**: il libro mastro dei numeri, oggi quasi vuoto
- `prototipo/linea-di-galleggiamento.html` — il prototipo, versionato com'era

## I tre ritrovamenti di questo giro

**1 · Il lavoro d'autore è 23 KB su 702.** Il prototipo pesa 702 KB, di cui
589,3 KB sono il bundle three.js UMD inline e 89,6 KB sono font in base64. Il
codice che vale è il 3,3% del file. Tutta la zavorra si toglie senza toccarlo.

**2 · La tipografia attuale costa punti sul criterio che pesa di più.** Il
rubric Awwwards cita **Space Grotesk** due volte: come anchor del voto 5 in
Design, e fra gli anti-pattern dell'estetica generica. Il prototipo la usa come
display *e* come corpo, con JetBrains Mono a fianco. Design pesa il 40%.
→ proposta **P01** in `docs/03-DECISIONI.md`.

**3 · La parità su mobile è dichiarata nel brief ma contraddetta nel codice.**
Sotto 820px il pulsante *"Per il vostro prodotto"* è `display:none`: su telefono
la chiusura commerciale è irraggiungibile. E con `prefers-reduced-motion` attivo
la dimostrazione si congela, quindi chi ha quella preferenza non vede la tesi
del sito.

---

## Su cosa serve un parere, adesso

In ordine di quanto blocca:

1. **P01 — cambiare le due famiglie tipografiche.** È la leva singola più pesante
   sul 40% del punteggio e costa quasi nulla. Serve conferma, e poi una rosa di
   candidate. Chi ha un'opinione motivata su quali due famiglie, la scriva.
2. **A02 — la lingua del sito.** Inglese, italiano con etichette tecniche in
   inglese, o italiano puro. La giuria è internazionale, i clienti sono italiani,
   e la sezione 3 è la candidatura al Developer Award. Blocca tutto il copy.
3. **A01 — il nome.** Cambia il registro di ogni riga di testo.
4. **P02 — cinque momenti in cui il taglio agisce, invece di uno.** Il brief dice
   "non aggiungere altre trovate" e ha ragione; la tesi qui è che servano più
   *istanze della stessa regola*, non più idee. Se qualcuno pensa che sia un
   cavillo per giustificare più effetti, lo dica: è il punto giusto da contestare.

## Cosa NON serve, adesso

Pareri sull'estetica di dettaglio, sulle micro-interazioni, sui colori esatti.
Non c'è ancora niente da guardare, e discuterlo ora produce opinioni su un sito
che non esiste.

---

## Il prossimo giro

Quando le decisioni bloccanti sono chiuse:

- impianto Vite + three.js a moduli ES, e porto del prototipo dentro (con la
  ri-taratura di luci e colore che il porto impone, guardando il provino);
- prima campagna di misure vere, con le condizioni di prova fissate una volta
  per tutte in `docs/04-MISURE.md`;
- il guscio delle cinque sezioni.
