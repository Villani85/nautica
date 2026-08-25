# nautica

Sito a tesi con doppia funzione: dimostrazione di capacità tecnica ed
esperienze 3D interattive di prodotto industriale.

**Tesi:** il pezzo che vale di più è quello che non vedi mai.
**Regola generativa:** il taglio. Ogni elemento sta sopra o sotto — niente sta a
metà per caso.

> **Stato: fondazioni.** Esistono un brief e un prototipo. Il sito non è ancora
> costruito. Comincia da [`STATO.md`](STATO.md).

---

## Perché questo repo è pubblico

Perché il codice è parte di ciò che viene giudicato, e perché la cronologia dei
commit è essa stessa contenuto: un sito a tesi si difende mostrando come è stato
deciso, non solo come è venuto.

Da qui discende una regola che vale per tutto il repo: **le decisioni si scrivono
con la loro ragione**, e i numeri si pubblicano solo dopo essere stati misurati.
Un numero autorale spacciato per misura costa più di quanto rende.

## Come si legge

| file | cosa contiene |
|---|---|
| [`STATO.md`](STATO.md) | dove siamo, cosa è cambiato, su cosa serve un parere |
| [`docs/00-BRIEF.md`](docs/00-BRIEF.md) | il brief di progetto |
| [`docs/01-AUDIT-PROTOTIPO.md`](docs/01-AUDIT-PROTOTIPO.md) | il prototipo letto riga per riga e pesato |
| [`docs/02-OBIETTIVO-9.md`](docs/02-OBIETTIVO-9.md) | il bersaglio tradotto in requisiti verificabili |
| [`docs/03-DECISIONI.md`](docs/03-DECISIONI.md) | registro: decisioni prese, proposte, aperte |
| [`docs/04-MISURE.md`](docs/04-MISURE.md) | il libro mastro dei numeri |
| [`feedback/`](feedback/) | i contributi esterni e l'esito delle verifiche |
| [`prototipo/`](prototipo/) | il punto di partenza, versionato com'era |

## Il prototipo

`prototipo/linea-di-galleggiamento.html` si apre con un doppio clic: nessun
build, nessuna dipendenza da scaricare. Dentro c'è una dimostrazione interattiva
di stabilizzazione a pinne — stato del mare da 0 a 5, sistema che si accende, e
la nave che **si calma invece di spegnersi**.

Geometria interamente procedurale: nessun modello di terzi, nessun rischio di
licenza. Il modello energetico è dichiarato illustrativo sulla pagina stessa —
è un indice 0–100, non kW, perché i moltiplicatori sono autorali e un'unità
fisica mentirebbe.

È la sezione 2 delle cinque previste, e va rifatta a moduli ES: oggi porta con
sé 589 KB di bundle three.js inline che non servono.

## Vincoli tecnici

- **Stack:** Vite + three.js a moduli ES. Niente framework se non serve.
- **3D:** geometria procedurale, zero modelli di terzi.
- **Font:** self-hosted, sottoinsiemati ai soli glifi usati.
- **Zero CDN**, in produzione come in fiera.
- **Cancelli:** JS < 250 KB gzipped · asset 3D < 500 KB · LCP < 2,0 s su 4G reale
  · 60 fps desktop, pavimento 30 fps su Android di fascia media · parità su mobile,
  non un messaggio di scuse.

## Contribuire

Il progetto è seguito anche da altre AI. Il protocollo sta in
[`feedback/COME-DARE-FEEDBACK.md`](feedback/COME-DARE-FEEDBACK.md): in breve,
ogni osservazione dichiara **come si verifica**, e viene verificata prima di
essere corretta — con l'esito scritto anche quando l'osservazione era sbagliata.
