# Esito della verifica — giro Drive del 29 agosto 2026, 08:23

Originale: `nautica_2026-08-29_0823_20fa37f.md`, doc Drive
`17OhlHzZmA8B0Uw9xQp3F3tP7Qb60h7q2`. Stesso HEAD del giro delle 06:22
(`20fa37f`) ma attacca una misura diversa — lo spettro del mare — e dichiara
in testa perche' non ripete il giudizio visivo: a parita' di SHA il fotogramma
e' identico, e ripeterlo sarebbe la voce sprecata che `CHIEDO.md` §2 vieta.
Ha ragione, ed e' la prima volta che un giro si autolimita da solo.

---

## VOCE 1 — PREMESSA CONFERMATA sul codice · MAGNITUDINE NON RIPRODOTTA

**L'affermazione.** Che lo spettro a tre righe renda la riduzione **generosa** —
ragionamento accettato al giro delle 06:22 — cambia **segno** sotto la
normalizzazione giusta. A pari severita' del mare, cioe' a pari rollio a carena
nuda, un JONSWAP da' una riduzione **piu' alta** di quella dichiarata: +5,3
punti sul plateau (mare 5, 12 nodi), non −9.

**Cosa ho verificato, e regge.** La premessa, che e' il perno di tutta la voce:

    src/scena/simulazione.js:46-47
      /** Ampiezza nominale di rollio a carena nuda, in gradi, per stato del mare. */
      export const AMPIEZZA_MARE = [0, 3.0, 6.0, 9.0, 12.0, 15.0]

    src/scena/simulazione.js:56
      const A1 = 0.002851   // forzante, TARATA numericamente

    src/scena/simulazione.js:53
      const W = 2 * Math.PI / 7    // periodo di rollio 7 s

Lo stato del mare, in questo modello, **e' definito dal rollio che produce a
carena nuda** — non da un momento e non da un'energia d'onda. `A1` non e'
un'ampiezza fisica: e' il numero che fa tornare `AMPIEZZA_MARE`, e il commento
lo dice da sempre. Quindi la colonna `[N]` del revisore — riscalare la forzante
perche' i due mari diano lo stesso rollio nudo — **e' la normalizzazione del
modello**, e la colonna `[F]` (pari energia della forzante) assume una cosa che
il modello non fa. Su questo la voce e' solida, ed e' un errore di premessa mio:
al 06:22 avevo accettato «e' generoso» come conferma di dominio senza chiedermi
rispetto a **cosa** i due mari fossero tenuti uguali.

E la risonanza a 7 s e' confermata dalla riga 53, quindi il crossover che la
VOCE 2 misura a 1,2·W — periodo modale ~5,8 s — cade dove deve cadere.

**Cosa NON ho potuto verificare, ed e' la meta' che conta.** Le magnitudini
(+5,3 · +10,5 · +18,7 punti, e la tabella del picco) escono da
`strumenti/spettro-mare.mjs`, che il revisore ha scritto **nel suo clone**: qui
non c'e'. Senza quel file non posso ne' rieseguire la prova di sanita' (che
dichiara Δ 0,0000 contro `_riduzioneCruda`, ed e' il pezzo che rende la sua
macchina la nostra), ne' i numeri. Restano affermazioni in piedi per premessa
verificata, non per misura riprodotta.

**Il revisore dichiara da solo il pezzo debole**, e va scritto perche' e' raro:
non si fida dei numeri del ginocchio (mare 5/10 kn, mare 3/7 kn) — li' la fisica
e' dominata dallo stallo e l'errore di realizzazione e' grande. Tiene il plateau
(ES ±0,06 pt su 60 realizzazioni) e il **segno**, e butta la magnitudine dove
non regge.

## VOCE 2 — COERENTE con la riga 53, non riprodotta

Il segno non lo decide il fattore di cresta ma **dove cade il periodo modale
rispetto ai 7 s del rollio**: sopra ~5,8 s il sito e' conservativo di +4…+6
punti, sotto diventa generoso. La banda γ vale ±1 punto, il picco vale tutto.

Contro-osservazione utile riportata dal revisore: il mare JONSWAP ha picchi
**peggiori** (ω_max 13,98 contro 10,02 °/s) e raddrizza **meglio** lo stesso.
Se fosse il crest factor a comandare, non potrebbe succedere. Non riproducibile
qui per lo stesso motivo della VOCE 1.

## Cosa cambia per il sito

**Niente in pagina, e nessuna decisione presa.** «Measured, not declared» non si
tocca: il numero e' misurato bene, ed e' la sua *interpretazione* che cambia.

Ma una cosa va tolta dal tavolo: **la nota «lo spettro a tre righe e' generoso»
non si scrive**, perche' sotto la definizione di mare del modello e' falsa. Se
un giorno si vuole dire il contrario — «e' conservativo, uno spettro reale
raddrizzerebbe di piu'» — serve prima che lo strumento entri nel repo.

## L'ask che ne esce, e va in CHIEDO

Uno strumento che dimostra una voce e **resta nel clone del revisore** non e'
verificabile: e' la stessa cosa che questo repo si vieta con «un file spedito
che nessuno sa rigenerare». Va chiesto che il codice della prova arrivi dentro
il giro — incollato per intero, non descritto.
