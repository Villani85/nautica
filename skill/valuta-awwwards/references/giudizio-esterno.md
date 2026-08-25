# Giudizio esterno severo (hce 3.0) calibrato su Awwwards

Oltre alla tua scorecard, puoi far valutare il sito **dall'esterno** dal Gem **hce 3.0** via la
skill [[confronto-gemini]]: registri con Playwright, carichi il video, e chiedi un voto Awwwards.
Serve a togliere il tuo bias, ma i suoi numeri **oscillano**: vanno trattati con disciplina.

## Regole non negoziabili (dalla pratica pagata)
- **Anonimo**: file `sito_A`/`sito_B`; il prompt **non dice** qual è il nostro, cosa è stato
  cambiato, né cosa aveva detto il giro prima. «Il testo intorno ai file pesa più dei file»
  ([[confronto-gemini-sempre-anonimo]]).
- **≥3 round, chat nuova ogni volta**, e si riporta la **serie**, non il numero migliore. Su
  confronti identici lo stesso sito immutato ha oscillato di parecchio e il verdetto si è ribaltato
  ([[confronto-gemini-instabile-quattro-round]]). **Non rilanciare finché non esce la cifra che
  vuoi**: a quel punto l'hai scelta, non misurata.
- **Verifica l'attribuzione** (Gemini scambia A/B) e l'intestazione `hce 3.0 ha detto` (se dice solo
  `Gemini ha detto` sei fuori dal Gem).
- **Misura il difetto citato prima di correggerlo**: sono arrivate critiche a elementi inesistenti.
- La registrazione deve **mostrare anche le interazioni**, non solo lo scroll (il calendario/le
  schede aperte): chi giudica non premia ciò che non vede.

## Il prompt Awwwards-calibrato (una riga sola — niente a capo nell'editor di Gemini)

> Salvalo in un file e passalo con `--domanda`. Deve restare **senza a capo** quando viene digitato
> (un newline invia il messaggio a metà). Esempio d'uso:
> `python ~/.claude/skills/confronto-gemini/confronta.py http://localhost:8891/ --domanda awwwards.txt`

```
Valuta questo sito come un giurato Awwwards, severo e non incoraggiante. Dai un voto da 0 a 10 con un decimale a ciascun criterio col suo peso: Design 40%, Usability 30%, Creativity 20%, Content 10%. Per ogni criterio: 1 frase di motivazione ancorata a qualcosa di visibile nel video (al secondo X), e il voto. Poi calcola il TOTALE PESATO = 0.40*Design + 0.30*Usability + 0.20*Creativity + 0.10*Content, e indica il TIER realistico usando queste soglie: sotto 6.5 = Nominee, 6.5-7.4 = Honorable Mention, oltre 7 con codice eccellente = Developer Award, 8.0 o piu = Site of the Day in contesa. Elenca infine i 3 interventi a piu alto impatto sul punteggio, concreti e misurabili. Non premiare effetti al mouse. Rispondi in italiano, secco.
```

## Come leggere il risultato
- Le **cifre non sono un preventivo**: un sito con foto vera e contenuti reali perde molto in un
  filmato compresso a 20 fps. Riporta il tier come **distanza relativa**, non come voto assoluto.
- Il **verdetto finale** va chiesto in una **chat nuova**, senza memoria dei giri precedenti.
- Incrocia sempre col tuo `rubric.md` + le misure di `misure.md`: se hce 3.0 dice "contrasto basso"
  ma tu hai misurato 8:1, vince la misura.

## Confronto alla cieca col livello SOTD
Per capire "quanto siamo lontani", registra **anche** un esemplare (`esemplari-e-antipattern.md`) e
fai il confronto anonimo A/B (`--contro URL`): stessa velocità in px/s, stesso trattamento. Il Gem
dirà quale regge meglio — ma verifica l'attribuzione prima di fidarti.

Torna al metodo: [[valuta-awwwards]].
