# Esito della verifica — giro Drive del 29 agosto 2026, 06:22

Originale: `nautica_2026-08-29_0622_20fa37f.md`, cartella Drive dei giri
(`14fxoosyhq2Y9FXRNK2UvVESCVoMZd-jK`), doc `1SOFoQNvFAjEf5KO4W-nJ12EIxl2q6fua`.
Non trascritto qui: e' `text/markdown` e si legge dall'originale. Questo file e'
**l'esito**, che secondo `COME-DARE-FEEDBACK.md` andrebbe in coda al file del
revisore — e non ci puo' andare: l'API della cartella non serve quella cartella,
e il connettore sa cambiare solo titolo e genitore, non il contenuto. Quindi
sta qui, e il giro successivo lo trova nel repo.

HEAD del giro: `20fa37f`, cioe' esattamente questo. Il revisore ha lavorato sul
codice spedito, non su uno di due giorni fa.

---

## VOCE 1 — CONFERMATA

**L'affermazione.** Il banco che valida il §3.4.3 forza il sito ad AgX a
esposizione 0,5 per parlare la lingua di Cycles; il sito spedito disegna in
ACES a 1,0. Quindi la riga di `fab0905` — «a schermo (AgX) il sito SOMIGLIA al
render sulla sovrastruttura e sulla coperta **ed e' cio' che vede chi apre il
sito**» — attribuisce al visitatore un fotogramma che non riceve mai.

**Verificata come**, e non su una ricostruzione: sulle righe.

    src/scena/index.js:201   render.toneMapping = ACESFilmicToneMapping
    src/scena/index.js:202   render.toneMappingExposure = 1.0
    src/scena/salone.js:80   idem, stessa curva e stessa esposizione

    strumenti/confronto-cotto.mjs:145   n.render.toneMapping = AGX
    strumenti/confronto-cotto.mjs:146   n.render.toneMappingExposure = 0.5
    riferimenti/blender/cuoci.py:809    view_transform = 'AgX'

Il banco controlla che il sito sia ACES **e poi lo cambia**. Il controllo alla
riga 141 esiste per non usare «una curva a caso»: sorveglia che la sostituzione
parta dal punto giusto, non che il risultato somigli a cio' che si spedisce.

**Il divario, dal referto** (mediana sRGB, fotogramma della nave, `?fermo=12`,
scroll 0,30, 1440x900):

| fascia | ACES@1,0 (spedito) | AgX@0,5 (validato) | scarto |
|---|---|---|---|
| sovrastruttura | 228,9 | 177,2 | **+51,7** |
| murata | 144,4 | 106,3 | +38,1 |
| acqua | 148,3 | 108,2 | +40,1 |
| coperta in ombra | 46,5 | 40,2 | +6,3 |

Un quinto della scala sulla massa piu' grande dell'inquadratura.

**Cosa NON cade, e senza questo l'esito sarebbe piu' allarmante del dovuto.**
I rapporti del §3.4 — scafo 1,370x, sovrastruttura 0,797x — sono presi **in
lineare** da tutte e due le parti, con la curva spenta su entrambi i lati.
Quelli restano in piedi: la voce non li tocca. Cade la lettura rassicurante
tratta dalla colonna AgX, che era un accordo della **curva** e non della
materia — e che `fab0905` stesso, due paragrafi sopra, aveva gia' riconosciuto
per tale prima di trarne la conclusione opposta.

**Perche' non e' pedanteria sulle parole.** E' la forma d'errore che questo
repo caccia, e stanotte l'aveva gia' presa due volte: un numero vero che
certifica la cosa sbagliata. Il verso peggiora la diagnosi invece di salvarla —
ACES satura e alza il contrasto, AgX desatura e allunga la spalla — quindi il
fotogramma spedito e' **piu' lontano** dal riferimento Cycles, non piu' vicino,
proprio sulla sovrastruttura.

## VOCE 2 — PLAUSIBILE, non ancora riprodotta qui

La sovrastruttura nella curva spedita sta a mediana 228,9 con media 197, contro
il tetto 242 che `index.js:186` dichiara per ACES. Una massa bianca grande
addossata al clip legge come vernice di modello: le mezze luci finiscono quasi
tutte nel tratto compresso. AgX a pari esposizione la porta a 204,3, venticinque
livelli piu' in basso e con gradiente.

Non l'ho rimisurata: i riquadri del revisore sono messi a occhio — lo dichiara
lui stesso — e non sono le maschere di fascia esatte. La direzione pero' e' la
stessa della VOCE 1, e la VOCE 1 sta in piedi sulle righe di codice.

**Va detto perche' vale piu' del numero:** il revisore scrive che «sembrava
plastica» e che stava per fermarsi li'. Ha misurato invece, e la causa non e'
una faccia persa ne' un difetto di materia: e' la luminanza assoluta nella
curva spedita. «Plastica» da solo avrebbe mandato a cercare la cosa sbagliata.

## Cosa NON e' stato deciso

La curva non si cambia da qui. Sono due strade e nessuna e' gratis:

- **spedire AgX** e' una riga in due file, e allinea sito e validazione. Il
  prezzo, che il revisore non nasconde: i colori `--acqua` del CSS sono stati
  ricalcolati su ACES (`index.js:198-200`), quindi la giunzione fondo-CSS/tela
  — l'idea meccanica di tutto il sito — va **riderivata**, scegliendo
  l'esposizione perche' tornino insieme giunzione e spalla;
- **tenere ACES** obbliga a riprendere i numeri del §3.4.3 nella curva vera,
  contro un Cycles riportato alla stessa curva. Altrimenti si continua a tarare
  il bilancio ambiente/luci per chiudere un divario misurato in una curva che
  il sito non usa.

E' una decisione di tavolozza, come `0x061412` per il vetro: sta al committente.

**In ogni caso, indipendente dalla scelta:** la riga di `fab0905` ha bisogno
della sua nota. Quell'«a schermo» e' il banco, non il visitatore.

## Cosa il revisore non ha potuto verificare, e resta non attaccato

Blender non e' installato da lui: la murata −14 residua, le due camere a
0,05 px, la normale al 61,7%, la silhouette da 632 px, l'occlusione a 6 cm e lo
scafo 1,37x restano affermazioni in piedi per mancanza di sfidante, non per
prova superata.

Una conferma di dominio che invece arriva, dichiarata come ragionamento e non
come misura: tre sinusoidi danno curtosi bassa (fattore di cresta ~2,2 sul
sigma), un JONSWAP a pari varianza ha code piu' lunghe e picchi piu' alti,
quindi piu' saturazioni dell'attuatore e riduzione reale **leggermente piu'
bassa**. Il verso e' quello sospettato, e l'entita' dipende da gamma e dalla
larghezza di banda — che e' esattamente perche' resta una nota e non un numero.
