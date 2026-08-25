# Documentazione della CLI Tripo

Generazione di modelli 3D da testo o da immagine, via riga di comando. Sta qui
perché un'altra AI possa usarla senza doverla scoprire — **e perché sappia
quando non usarla su questo progetto**, che è la parte più importante di questa
nota.

## Nessuna chiave

Non c'è nessuna chiave API in questi file, e non è un'affermazione a memoria:
è stata passata una ripulitura su tutti e 23 i file e **non ha modificato un
solo byte**, il che dimostra che non c'era niente da rimuovere. I `tsk_...` che
si incontrano sono segnaposto della documentazione.

Per usarla serve la propria chiave, che si ottiene registrandosi al servizio:

```bash
npm install -g tripo-cli
export TRIPO_API_KEY=tsk_…      # la propria, non è inclusa qui
tripo doctor                    # verifica chiave, rete, credito
```

## Provenienza e licenza

**Quindici file sono del fornitore**, copiati alla lettera da `tripo-cli@0.2.0`
(cartella `skill/` del pacchetto npm), verificati byte per byte:

`SKILL.md` · `common-errors.md` · `commands/account.md` · `commands/batch.md` ·
`commands/generate.md` · `commands/make.md` · `commands/process.md` ·
`commands/task.md` · `commands/view.md` · `examples/animation.md` ·
`examples/ar-web.md` · `examples/film.md` · `examples/game-asset.md` ·
`examples/pipes.md` · `examples/print.md`

> `tripo-cli` è distribuito con **licenza MIT**.
> Progetto originale: <https://github.com/vast-enterprise/Tripo-API-CLI>
> Il pacchetto non include un file di licenza: la licenza è dichiarata nel suo
> `package.json`. Sono ridistribuiti qui alle condizioni della MIT, con
> l'attribuzione che quella licenza richiede.

**Il resto è nostro**, scritto lavorando col servizio e non incluso nel
pacchetto: `INDICE.md`, `README-cli.md`, `knowledge-chains.json`,
`knowledge-error-catalog.json`, `knowledge-models.json`,
`knowledge-params.js`, `knowledge-scenarios.json`.

`task_auto_parti.json` è un record di lavorazione vero, preso da un altro
progetto dello studio: serve a mostrare che forma ha davvero la risposta —
`task_id`, stato, parametri d'ingresso — invece di descriverla.

---

## Quando NON usarla su questo progetto

Due ragioni, e la seconda vale più della prima.

**1. Le regole.** La decisione **D19** dice *asset originali e controllati*, e
le regole di candidatura Awwwards accettano i progetti dimostrativi **purché
design e sviluppo siano interamente di chi sottomette**. Un modello uscito da un
servizio terzo, in un progetto che si presenta come autoprodotto, è una zona
grigia che tocca poi spiegare a una giuria.

**2. Il difetto già pagato.** Da
[`../velocity/CARROZZERIA_FAIRNESS.md`](../velocity/CARROZZERIA_FAIRNESS.md),
riga 55:

> *«Le normali della mesh ondeggiano. Il modello nasce da Tripo a partire da
> poche viste»*

Su *velocity* è costato un quad remesh, la misura a zebra delle normali e mezza
notte di lavoro. Su una carrozzeria, che si legge dai riflessi lunghi, quella
battaglia era obbligata.

**Qui no.** Lo scafo di Nautica è **l'estrusione di una curva piana**, ed è
esattamente quella proprietà che permette di generare la faccia del piano di
sezione **esatta** invece che approssimata — è il meccanismo del Momento 3, e
sta in `src/scena/nave.js`. Una mesh generata da IA quella proprietà non ce l'ha:
il taglio tornerebbe ad essere una approssimazione, e si perderebbe la cosa
migliore che il progetto ha.

Per più dettaglio meccanico — il bordo d'uscita piegato di 15–20° descritto nei
brevetti, la tenuta sull'attraversamento carena — servono venti righe di curve.
Costano meno di rimettere a posto una mesh che ondeggia, e restano nostre.

## Quando invece serve davvero

Non è un divieto. È utile per **provini rapidi** e per **studi di forma**
buttati via subito: capire se una proporzione regge prima di scriverla in
codice. Quello che non deve succedere è che un modello generato finisca nella
scena spedita.
