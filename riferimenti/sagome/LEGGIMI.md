# Le sagome

Fotogrammi **renderizzati dal sito stesso**, usati come guida per generare gli
asset fotografici. Non sono provini: sono l'**ingresso** della pipeline.

## Perché stanno nel repository

Due ragioni, e la seconda conta di più.

1. Le API di generazione immagine vogliono un URL scaricabile: un data URI viene
   rifiutato (`Failed to download resources: data:image/...`). Un file
   versionato lo si raggiunge da `raw.githubusercontent.com` senza dipendere da
   nessun servizio di appoggio.

2. **La sagoma è ciò che tiene il controllo.** Composizione, camera, posizione
   dei mobili, altezza dell'orizzonte nel finestrino, posa delle persone: sono
   decisi dalla scena, non dal modello generativo. Il modello *veste* una
   struttura che è già nostra. Chi vuole rifare l'asset rigenera la sagoma dal
   sito e ottiene la stessa struttura — è la differenza fra un asset
   riproducibile e un colpo di fortuna.

## Come si rigenera

Si apre il capitolo, si nascondono didascalia, velo sommerso e testata, si
toglie l'ombra della cornice e si ritaglia il riquadro `.apertura`. Lo fa
`strumenti/sagoma.mjs`.
