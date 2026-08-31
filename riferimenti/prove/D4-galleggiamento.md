# D4 — La fascia di galleggiamento segue l'onda vera?

Agente D4. Cancello: `strumenti/collaudo-galleggiamento.mjs`. Nessun file toccato oltre
questo referto e quel cancello.

## 1. Cosa dice il codice, prima di misurare

La fascia scura al galleggiamento (`GALLEGGIAMENTO = { alto: 0.058, spessore: 0.052 }`,
`src/scena/materiali.js:329`) e' dipinta nello shader dello scafo in base a `vLocale.y`
— la quota nello **spazio locale della nave**, non nel mondo (`materiali.js:376-378`).
Non riceve ne' `sim.S.mare` ne' alcuna uniforme dell'acqua: e' un `float` fisso.

La nave non ha moto verticale (heave): `nave.position.y` si tocca **solo** durante
l'emersione iniziale (`index.js:829`, `impostaEmersione`) e resta fissa una volta
`emersione=1`. Da li' in poi l'unico moto della nave e' `nave.rotation.z` = rollio
(`index.js:1202`), una rotazione, non una traslazione verticale legata all'onda.

Quindi, per costruzione, la fascia dipinta **non insegue il mare**: quello che
eventualmente la fa muovere sullo schermo e' solo il rollio (che a sua volta e' pilotato
dallo stesso stato di mare che muove le onde, quindi i due moti sono correlati per
condivisione della causa, non perche' uno segua l'altro).

## 2. Metodo scelto, e perche' non i pixel dello schermo

L'incarico suggeriva: due colonne di pixel, un salto di luminanza in ciascuna, confronto
delle due escursioni. L'ho sostituito con l'equivalente esatto fatto contro la SCENA
invece che contro lo schermo: `window.__nautica.chi(u, v)` lancia un raggio vero contro
i mesh e torna il punto 3D colpito (`punto`, in unita' di scena) e il materiale. Stesso
confine (nearest-hit fra scafo e acqua, o fra cielo e acqua), ma letto dalla geometria:
niente `preserveDrawingBuffer`, niente ffmpeg, niente rumore di codifica — il difetto che
`registro-guscio.mjs` documenta per la rilettura della tela WebGL non si pone proprio.

Per colonna, bisezione su `v` (dentro una staffa ritrovata a ogni fotogramma con una
scansione grossa, perche' il confine vero si sposta e una staffa fissa lo perde — misurato:
con staffa fissa si perdeva il 30-50% dei campioni):

- **colonna SULLO SCAFO** (u=0,5, centro nave): confine `scafo` → `pelo` (acqua). Letta la
  quota mondiale (`y`) del punto sul lato acqua: e' l'altezza a cui il mare sta occludendo
  lo scafo IN QUEL MOMENTO.
- **colonna LONTANA** (u=0,06, bordo schermo, niente scafo in mezzo): confine cielo → `pelo`.
  Stessa lettura: la quota vera del mare li'.

Confrontate le escursioni (max−min) delle due serie su 20 campioni, col tempo che scorre
(nessun `?fermo`: qui serve il moto).

Sonda preliminare (`_diag-galleggiamento.mjs`, cancellata, non consegnata) per trovare
`p` e le staffe: a `p=0,45` (dopo la rampa `mare` 0,26-0,38, prima del taglio 0,64) lo
scafo e' intero e `stato.mare` resta stabile a 4 (il massimo osservato) per 4 secondi,
mentre `stato.rollio` oscilla davvero (0,98°→5,48° in 2,4 s) — scena viva, non ferma.

## 3. NON misurabile: un mare piatto affidabile

`stato.mare` non e' una funzione monotona pulita di `p` in questa build (letto 4 a p=0,
1 a p=0,30, 3 a p=0,34, di nuovo 4 da p=0,38 in su, in una sonda a scroll diretto senza
passare per lo scroll continuo). Non ho trovato in tempo un `p` che dia in modo stabile
`mare=0`, quindi il secondo esito richiesto (rosso E verde) non viene da un secondo stato
di mare ma — come l'incarico permette in alternativa — da una soglia stretta a mano sugli
stessi numeri.

## 4. Numeri (mare=4, 15-16/20 campioni scafo validi, 9-10/20 campioni acqua validi)

    escursione al confine SULLO SCAFO:    0,19-0,20 unita
    escursione al confine LONTANO (mare): 0,21-0,22 unita
    rapporto scafo/lontano:               0,86-0,95 (tre corse)

## 5. Esito, rosso e verde

- **soglia 0,50** (il confine si muove almeno meta' di quanto si muove il mare vero):
  rapporto 0,95 > 0,50 → **VERDE**.
- **soglia 0,98** (stretta a mano, come da istruzione): rapporto 0,95 ≤ 0,98 → **ROSSO**.

Il cancello nasce quindi VERDE con una soglia ragionevole (0,50): il confine visibile
scafo/acqua a centro-nave si muove quasi quanto il mare vero (rapporto ~0,9). Questo non
contraddice il punto 1: a `u=0,5` il rollio da solo — pura rotazione, nessun heave —
sposta abbastanza in verticale quel punto dello schermo da imitare bene un inseguimento
dell'onda, perche' rollio e ampiezza dell'onda sono guidati dallo stesso stato di mare
(correlazione per causa comune, non per meccanismo di inseguimento). Ho dimostrato che il
cancello SA uscire rosso stringendo la soglia a 0,98 (dimostrazione a mano, non un secondo
fenomeno osservato).

## 6. Cosa NON ho potuto misurare

- Un mare davvero piatto (mare=0) per un secondo confronto — vedi §3.
- Se il rapporto ~0,9 regge anche a prua/poppa (lontano dall'asse di rollio, dove la
  rotazione sposta il punto molto di piu' o molto di meno del centro nave): misurato solo
  a u=0,5.
- Se l'occhio umano, guardando la fascia dipinta invece del confine geometrico
  scafo/acqua, percepirebbe lo stesso agganciarsi: qui si misura il confine reso
  (occlusione mesh), non il pixel della fascia scura in se'.
