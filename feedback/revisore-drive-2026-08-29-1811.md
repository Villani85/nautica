# Esito della verifica — giro Drive del 29 agosto 2026, 18:11

Settimo giro della giornata, e attacca **il numero piu' importante del sito**:
«Reduction, RMS», quello che porta la rivendicazione «measured, not declared».

Lo attacca con il metodo che `CHIEDO.md` §3.1 chiede da sei giri — *cambia un
parametro di molto e guarda se il risultato si muove* — e trova che **non si
muove mentre la nave si'**.

---

## VOCE 1 — CONFERMATA, ed e' un difetto che ho introdotto io oggi

**L'affermazione.** `S.riduzione` viene da `riduzioneVera`, cioe' da una lettura
della tabella `riduzioni.json`. Quella tabella e' generata da `_riduzioneCruda`,
che chiama la corsa viva con **sei** argomenti: il settimo, `gyro`, resta al suo
default zero. **La tabella e' strutturalmente di sole pinne.**

Ma la nave che si vede il giroscopio ce l'ha: la corsa viva riceve
`S.autoritaGiroscopio` a ogni passo. Quindi il numero descrive una nave diversa
da quella sullo schermo.

**Riprodotto qui, sul modulo spedito, con la definizione che il file stesso da'
della riduzione — RMS viva contro RMS nuda:**

```
mare 5              riduzione REALE   numero MOSTRATO
  pinne @12 kn           90,7%            90,8%
  pinne+gyro @12 kn      91,9%            90,8%
  pinne @ 4 kn            3,2%             3,2%
  pinne+gyro @ 4 kn      58,5%             3,2%
```

**Cinquantacinque punti di scarto** proprio all'andatura che il giroscopio esiste
per raccontare. Un visitatore accende il rotore, **vede** la nave calmarsi, e
legge «3%». Il numero e la scena si contraddicono nello stesso fotogramma.

E la controprova di metodo che il revisore include, e che rende affidabile il
resto: la sua RMS per «solo pinne @12» da' 90,7% contro il 90,8% della tabella
spedita — il suo integratore e la tabella coincidono entro un decimo, quindi le
righe del giroscopio non sono un artefatto del suo script. Le mie misure
coincidono con le sue al decimale.

**E' un difetto mio, di oggi.** Il giroscopio l'ho aggiunto stamattina
(`c96f5b5`) senza chiedermi da dove venisse il numero che lo descrive. Il
sospetto giusto ce l'avevo persino scritto: nel commento della corsa nuda avevo
messo *«se ricevesse il giroscopio, la riduzione misurata smetterebbe di misurare
quello che dichiara»* — e non ho guardato l'altro lato, dove il problema era che
la corsa VIVA lo riceve e la tabella no.

### Cosa ho fatto, e perche' non la cura vera

**Il pannello si spegne quando il giroscopio e' acceso.** La regola esisteva
gia' ed e' giusta: a pinne spente il pannello sparisce, perche' una metrica di
pinne senza pinne non significa niente. Questo e' lo stesso caso visto
dall'altro lato — una metrica di **sole** pinne mentre un secondo stabilizzatore
fa il grosso del lavoro. Estendere quella regola non inventa niente: applica una
decisione gia' presa al caso che le mancava.

**La cura vera e' quella che indica lui, ed e' sul tavolo:** calcolare la
riduzione **dal vivo**, `1 - RMS(viva)/RMS(nuda)`, con `viva` che il giroscopio
ce l'ha gia'. Come nota giustamente, **la macchina per farlo e' gia' li'**: le
due corse girano fianco a fianco a ogni passo, e quel rapporto catturerebbe
entrambi gli stabilizzatori.

Non la faccio stanotte, e la ragione e' documentata nel codice: un rapporto
letto troppo presto **ballava e dichiarava 52% invece di 90** due secondi dopo
l'accensione. Si paga con una finestra di assestamento, non con una riga — ed e'
il genere di cosa che alla settima corsa della CI non si scrive.

Fino ad allora: **meglio nessun numero che un numero che contraddice la nave.**

## VOCE 2 — NON E' UN BERSAGLIO, ed e' il secondo giro di fila che me ne risparmia uno

`riduzioni.json` e' stata scritta l'ultima volta il 26 agosto mentre
`simulazione.js` e' cambiata in otto commit successivi. E' la trappola classica —
modello nuovo, tabella vecchia, numero stantio — e **l'ha verificata prima di
riportarla**.

Non lo e': i commit successivi toccano propulsione, giroscopio e commenti, e
**nessuna delle costanti che entrano in `_riduzioneCruda`**. La prova diretta e'
la sua, e costa tre minuti: `genera-riduzioni.mjs --verifica` rigenera le 126
celle e **corrisponde byte per byte**.

Ma la usa bene: serve a **localizzare** la VOCE 1. Il giroscopio non manca per
una svista di rigenerazione — manca perche' il canale che porta il numero a
schermo non ha un posto dove metterlo. E' esattamente il punto in cui va la cura.

## Una conferma di dominio, non un attacco

Ha misurato di striscio che **la riduzione del giroscopio e' esattamente
indipendente dalla velocita'** — 53,4% a 2, 4, 6, 12 e 20 nodi. E' il
comportamento giusto: la coppia viene dalla massa che gira, non dall'abbrivio.
La fisica del rotore e' onesta; il problema della VOCE 1 non e' la fisica, e'
che quella fisica non arriva al numero.

## Il giudizio visivo: non rifatto, e lo dichiara

Terzo giro di fila che si rifiuta, con la verifica: fra il giro precedente e
questo sono entrati solo la correzione di un commento, due passaggi di CI, il
rientro nel salone e due strumenti — **niente che cambi il primo paint**.

Ma aggiunge un aggancio nuovo che **non viene da una schermata**: se accendi il
giroscopio a bassa andatura e la nave si calma mentre il pannello segna 3%,
quello *e'* un «cosa non si capisce». Ha ragione, ed e' la ragione per cui l'ho
spento invece di lasciarlo.

## Cosa non ho verificato

- **la resa a pixel** di quel preciso istante: lui non ha GPU e non l'ha vista;
  io ho verificato la catena numerica, non ho fotografato lo schermo con
  giroscopio acceso e pannello acceso insieme (adesso quel caso non esiste piu');
- **in quali battute** dell'atto due il pannello sarebbe stato simultaneamente
  acceso col rotore in moto: lo dichiara aperto anche lui;
- **la finestra di assestamento** che servirebbe alla cura vera: non l'ho
  progettata, quindi non so quanto costi davvero;
- **tutto cio' che passa da Cycles**, come nei sei giri precedenti.
