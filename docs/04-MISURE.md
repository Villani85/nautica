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

### Peso del prototipo — 2026-08-25, byte e gzip

| blocco | byte | gzip -9 |
|---|---|---|
| bundle three.js UMD inline (r12x/r13x) | 603.462 | 148.751 (145,3 KB) |
| CSS + font base64 (4 `@font-face`) | 99.783 | 72.291 (70,6 KB) |
| simulazione d'autore | 12.114 | 4.213 (4,1 KB) |
| **file completo** | **718.877** | **226.935 (221,6 KB)** |
| **JS totale** | | **149,4 KB** |

Strumento: `wc -c` per i byte, `gzip -9` per il compresso, blocchi separati con
uno script Python sul sorgente. Condizioni: file su disco, non servito da un
server reale — brotli e la compressione del server daranno numeri diversi.

**Esito: il budget del brief (JS < 250 KB gzipped) è già rispettato**, con
margine. Un revisore esterno ha misurato 227.862 B e ~153 KB con strumenti suoi:
lo scarto rispetto ai miei 226.935 B e 149,4 KB è di implementazione gzip, non
di sostanza.

> **Errore già commesso su questa stessa riga, lasciato scritto perché non si
> ripeta.** Nella revisione 1 questo blocco riportava solo i byte su disco, con
> l'avvertenza — scritta qui sotto, di mia mano — di non usarli per dire quanto
> pesa il sito. Due sezioni più in là, in `01-AUDIT`, li ho usati esattamente
> così, concludendo che il prototipo sfondava un budget che invece rispettava.
> **Scrivere la regola non basta.** Costa attenzione soprattutto quando il numero
> sbagliato conferma quello che si sperava di trovare.

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
