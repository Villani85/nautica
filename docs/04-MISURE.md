# Misure

Questo file è il libro mastro dei numeri. Vale una regola sola, e viene da un
progetto in cui sei metri sono stati costruiti e buttati:

> **Un metro rotto non dà errore. Dà un numero.**

Le quattro conseguenze operative, tutte già pagate altrove:

1. **Si aspetta una condizione, non un tempo.** Un misuratore che aspetta "18
   fotogrammi" e fotografa non è ripetibile: con lo scorrimento inerziale quanti
   fotogrammi passano davvero dipende dal carico della macchina.
2. **Guarda il provino, non solo la statistica.** Una mediana `0.0` perfettamente
   formata era una scena interamente nera.
3. **Un guasto deve gridare.** Gli strumenti di misura ascoltano `pageerror` e
   `console.error`, e falliscono invece di restituire una statistica.
4. **Misura il difetto prima di correggerlo.** Vale anche per i difetti che
   segnalo io in questo repo, e per quelli che segnalano le altre AI.

Ogni riga qui sotto va scritta con **data, condizioni e strumento**. Un numero
senza condizioni non è una misura. Nessuno di questi numeri finisce sul sito
prima di essere stato misurato due volte, in due sessioni diverse.

---

## Stato: nessuna misura in esecuzione ancora presa

Il sito non gira: esiste il prototipo, non l'applicazione. Le uniche misure
disponibili oggi sono **statiche sul file**, e sono queste.

### Peso del prototipo — 2026-08-25, misurato sul sorgente

| voce | peso su disco |
|---|---|
| bundle three.js UMD inline (r12x/r13x) | 589,3 KB |
| font base64 nel CSS (4 `@font-face`) | 89,6 KB |
| codice d'autore (CSS + HTML + simulazione) | 23,1 KB |
| **totale** | **702,0 KB** |

Strumento: conteggio byte sul file, non peso trasferito. **Il peso in rete
(gzip/brotli) non è ancora stato misurato** e sarà sensibilmente più basso: non
usare questi numeri per dire "quanto pesa il sito".

---

## Da misurare — la tabella si riempie man mano

| metrica | soglia | valore | data | condizioni | strumento |
|---|---|---|---|---|---|
| LCP desktop | < 2,0 s | — | — | — | — |
| LCP mobile 4G | < 2,0 s | — | — | throttling 4G + CPU 4× | — |
| INP | < 200 ms | — | — | — | — |
| CLS | < 0,1 | — | — | — | — |
| JS trasferito (gzip) | < 250 KB | — | — | — | — |
| asset 3D totali | < 500 KB | — | — | — | — |
| FPS sostenuto desktop | 60 | — | — | — | — |
| FPS minimo Android medio | ≥ 30 | — | — | dispositivo reale, non emulato | — |
| Lighthouse mobile | ≥ 70 | — | — | gate Mobile Excellence | — |
| contrasto corpo sotto la linea | ≥ 4,5:1 | — | — | `#7FA3A5` su `#071A1D` | — |
| contrasto corpo sopra la linea | ≥ 4,5:1 | — | — | — | — |
| touch target sotto 44px | 0 | — | — | 390×844 | — |
| overflow orizzontale | assente | — | — | 390 / 768 / 1440 | — |

## Condizioni di prova da fissare una volta e non cambiare più

Perché due misure siano confrontabili devono nascere uguali. Da decidere e
scrivere qui prima della prima campagna:

- il **dispositivo Android di riferimento** (modello preciso, non "fascia media");
- il **profilo di rete** (4G con quali numeri esatti);
- il **viewport** desktop e mobile di riferimento;
- se il browser gira con accelerazione hardware — **Chromium headless disegna in
  software**, e i provini 3D escono a qualità degradata senza che nessuno lo dica.
