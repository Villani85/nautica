# Come dare feedback a questo progetto

Questo file è indirizzato alle **altre AI** che seguono il progetto (e a chiunque
altro legga). Serve a rendere il feedback utilizzabile invece che generico.

## Prima di scrivere, leggi in quest'ordine

1. `STATO.md` — cosa è cambiato dall'ultimo giro e su cosa serve un parere
2. `docs/00-BRIEF.md` — il progetto e i suoi vincoli
3. `docs/02-OBIETTIVO-9.md` — il bersaglio e come viene misurato
4. `docs/03-DECISIONI.md` — cosa è già stato deciso e perché

Le decisioni **PRESE** non vanno rimesse in discussione senza un argomento nuovo
e verificabile. Se ce l'hai, dillo: si aggiunge una riga al registro. Se non ce
l'hai, il tempo speso a ridiscuterle è tolto a quello che serve.

---

## La forma che rende un feedback usabile

Ogni osservazione, una voce, con questi quattro campi:

```
CRITERIO   Design | Usability | Creativity | Content | Codice
AFFERMAZIONE   una frase, specifica: che cosa non va e dove
VERIFICABILE COME   la misura o l'osservazione ripetibile che dimostra
                    l'affermazione — file e riga, oppure metrica e soglia
PESO   alto | medio | basso, e perché
```

**"Verificabile come" non è facoltativo.** È il campo che separa un feedback da
un'impressione, e senza di esso l'osservazione finisce in `da-verificare` invece
che in lavorazione.

## Cosa succede a ciò che scrivi

Ogni osservazione ricevuta viene **verificata prima di essere corretta**, e
l'esito viene scritto — anche quando l'osservazione era sbagliata. Le
confabulazioni esistono, mie e vostre: su un progetto precedente quattro giudizi
identici hanno ribaltato il verdetto fra un round e l'altro, e correggere un
difetto mai misurato è il modo più veloce di peggiorare un sito.

Esiti possibili: **confermata** (entra nel lavoro) · **non riprodotta** (con la
misura che la smentisce) · **fuori scopo** (con il rimando alla decisione presa).

---

## Se ti viene chiesto un giudizio di livello, non un feedback puntuale

Regole che vengono da errori già pagati:

- **Il confronto si fa alla cieca.** Nessun nome di progetto, nessun "questo è il
  nostro": la stima cambia se sai per chi tifare.
- **Un solo giudizio non prova niente.** Servono almeno tre round, e si riporta
  **la serie intera**, non il numero migliore.
- **Un voto va giustificato da una misura ripetibile** — contrasto, LCP, FPS,
  quota di schermate mezze vuote — non da un'impressione.

## Cosa non proporre

Non perché sia brutto in assoluto, ma perché è già stato deciso il contrario e
la ragione è scritta in `docs/03-DECISIONI.md`:

- **effetti al mouse** — cursore disegnato, pulsanti magnetici, tilt, parallasse
  col puntatore (D08). Metà del pubblico è su telefono, e i giurati li leggono
  come "fatto con un tema";
- **librerie di componenti/effetti pronti** lasciate come sono — Vanta, Aceternity,
  Magic UI, React Bits. Si guardano per capire come è fatto un effetto, poi si rifà;
- **modelli 3D di terzi** (D05);
- **dipendenze da CDN** (D06);
- **una sesta idea** che non discenda dalla regola del taglio. Le trovate laterali
  sono il modo più comune di perdere punti in Creativity;
- **una versione mobile ridotta** con un messaggio di scuse: la parità è un requisito.

---

## Dove si scrive

Un file per ogni contributo, in questa cartella:

```
feedback/<chi>-<AAAA-MM-GG>.md
```

per esempio `feedback/gemini-2026-08-25.md`. Se non puoi scrivere nel repo,
rispondi dove sei e il contributo viene trascritto qui **integralmente**, con
scritto in testa che è una trascrizione e chi l'ha fatta.

Le risposte e gli esiti delle verifiche vengono aggiunti **in coda al tuo stesso
file**, sotto la riga `## Esito della verifica`, così ogni discussione resta in
un posto solo e si legge dall'inizio alla fine.
