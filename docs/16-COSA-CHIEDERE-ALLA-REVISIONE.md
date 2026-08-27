# 16 — COSA CHIEDERE ALLA REVISIONE

Da incollare a chi legge il repo dall'esterno. Serve a due cose: non far
riportare difetti già chiusi, e far spendere l'ora di lettura dove un parere
esterno vale davvero.

---

## Il brief da incollare

> Rivedi `github.com/Villani85/nautica` all'ultimo commit su `main`.
>
> È un sito a tesi su uno stabilizzatore a pinne per uno yacht di 40 m
> autoprodotto, candidato Awwwards. La tesi è che **i numeri sono misurati, non
> dichiarati**, e che il visitatore *causa* ciò che vede invece di guardarlo.
>
> **Prima di segnalare, verifica sul codice all'ultimo hash.** È già successo
> più volte che una revisione riportasse cose chiuse in un commit che non aveva
> letto. Se un difetto è chiuso, dillo: serve sapere che la chiusura regge.
>
> Leggi `docs/15-PASS-PBR.md` per primo: contiene lo stato di ogni passo, i
> numeri misurati e i motivi degli abbandoni.
>
> Le tre domande su cui il parere esterno vale di più:
>
> 1. **Il salone è ancora un piano.** `docs/15 §0-octies` descrive il volume
>    proiettato e i due cancelli che lo verificano, e le tre rette del vano sono
>    già misurate (errore 1,27 px), quindi la calibrazione è mezza fatta. La
>    domanda non è *se* farlo: è se la strada proposta — guscio grezzo +
>    proiezione dalla posa della camera sorgente — è quella giusta, o se c'è un
>    modo che conserva la fotografia e costa meno.
>
> 2. **Il verso del racconto.** Oggi: salone → esterno → taglio → meccanismo.
>    Due revisioni hanno chiesto l'opposto. La decisione è del committente e non
>    è stata presa: serve l'argomento migliore per entrambe le direzioni, non
>    una preferenza.
>
> 3. **Dove il sito si fa toccare.** La Usability pesa il 30% e il committente
>    stesso, dopo giorni sul proprio sito, ha scoperto solo ora che la nave si
>    può ruotare. Quali affordance mancano, e quali di quelle presenti non si
>    vedono?
>
> Cosa **non** serve rivedere, perché è già misurato e scritto: il peso dei
> chunk, la presenza di `COLOR_0`, la continuità del canvas, i numeri
> pubblicati in pagina. Hanno tutti un cancello che li rompe se smettono di
> essere veri.

---

## Cosa è stato chiuso di recente, con il numero

Chi rivede può usarla come lista di controllo: se una di queste è tornata falsa,
è una regressione e vale più di un difetto nuovo.

| cosa | misura | cancello che lo tiene |
|---|---|---|
| i comandi restano vivi sul primo piano del meccanismo | albero 0,000 → 15,358 rad p-p; ×2,40 da mare 2 a 5 | `collaudo-manopola.mjs` |
| il clic sulla manopola non teletrasporta | da 6,27° a 0,234° per fotogramma, 1,7× la velocità naturale | `collaudo-manopola.mjs` |
| il movimento ridotto riduce, non spegne | video +15,4 s in 1,5 s di campione; rollio 0,23° contro 1,67° | `collaudo-ridotto.mjs` |
| la simulazione parte a regime | rollio iniziale da 0,01° a 0,93° | — |
| la maschera del vano perdona il movimento della ripresa | scivolamento 17,3 px contro 24 di rientro | `collaudo-filmato.mjs`, tetto **derivato** |
| l'occlusione cotta esiste e viene consumata | 28 mesh, valori 0,553–1,000, 28 materiali | `collaudo-cinematica.mjs` |
| i numeri in pagina descrivono la build | 4 righe + la cifra in prosa | `peso.mjs` |
| dal vetro si vede solo mare | ritaglio dedotto dalle rette, 1098×616, nessun riscalamento | — |
| la stanza rolla e l'orizzonte no | stanza 4,7° = rollio 4,7°, mare 0° | — |

---

## Le due cose che restano al committente

Nessuna delle due è lavoro, e nessuna delle due la posso fare io.

1. **GitHub Pages** → Settings → Pages → Source: GitHub Actions. Senza, non
   esistono URL di produzione, LCP reale, né misure su telefono — e un sito che
   non è pubblico non compete in nessuna categoria.
2. **Il profilo Awwwards**, che conta dal giorno in cui esiste.
