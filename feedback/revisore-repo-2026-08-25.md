# Contributo — revisione del repository, 2026-08-25

Contributore non identificato nel testo ricevuto. Ha esaminato l'intero
repository al commit `758102b` e ha misurato il prototipo.

**Giudizio netto del contributore:** *"l'idea è forte, ma l'audit contiene errori
importanti e il progetto sta rischiando di produrre più documentazione che sito."*

**Valutazione data:** idea e direzione 8/10 · qualità organizzativa del repo 8/10
· **affidabilità dell'audit 5,5/10** · sito candidato a premi: non valutabile,
perché il sito non esiste e il prototipo non è pubblicamente eseguibile.

**Indicazione operativa:** non fare un altro giro di piani, non aspettare nome,
lingua e font. Portare il prototipo in Vite, correggere i difetti, pubblicare una
preview e misurare. Nome e tipografia non bloccano quel lavoro.

---

## R1 — Il titolo "tagliato" non funziona

Le due copie sono sovrapposte senza `clip-path` né maschera; quella chiara,
scritta dopo, copre completamente quella scura. Inoltre il titolo sta in alto e
non attraversa la linea al 50%. Il meccanismo che l'audit dichiara già riuscito
non è implementato. Righe 58–64 (CSS) e 177–184 (HTML).

## R2 — Perdita di memoria con `prefers-reduced-motion`

Il tempo `t` è congelato ma `S.picchi` riceve un oggetto a ogni fotogramma; la
rimozione dipende proprio dall'avanzamento di `t`, quindi non avviene mai.
Righe 482–546.

## R3 — Il "rubric Awwwards" è presentato come ufficiale e non lo è

Awwwards conferma pesi, minimo 18 giurati, eliminazione dei tre voti anomali e
soglia HM 6,5. Non pubblica anchor 5/8/9,5 né indica Space Grotesk come
anti-pattern. Il Developer Award sopra 7 arriva solo dopo aver vinto il SOTD.
Anche "i SOTD reali stanno negli 8 medio-alti" è contestato: i vincitori recenti
starebbero spesso intorno a 7,2–7,5.

## R4 — La conclusione sul peso è sbagliata

Misurato dal contributore: file completo 718.877 byte; gzip 227.862 byte;
JavaScript gzip circa 153 KB. Il prototipo è **già sotto** il limite dichiarato
di 250 KB gzip. Passare a Vite e moduli ES resta corretto, ma non si può
sostenere che serva per superare quella soglia.

## R5 — La modale chiusa resta accessibile da tastiera

`opacity:0` e `pointer-events:none` non rimuovono `#chiudi` dal tab order, e
`aria-modal="true"` resta attivo a finestra chiusa. Servono `hidden`/`inert`,
focus trap e restituzione del focus. Righe 133–150.

## R6 — Bersagli tattili da 20 px, e sovrapposizione su mobile

I controlli del mare sono larghi 20 px contro i 44 px dichiarati come requisito.
Su mobile, letture a sinistra ed energia a destra condividono la stessa quota e
rischiano di sovrapporsi. Righe 94–119.

## R7 — Manca una demo pubblica immediata

GitHub Pages restituisce 404 e il README non offre né un'immagine né un video.
Chi apre il repository vede soprattutto prosa: non può sperimentare il lavoro.

---

# Esito della verifica

Verificato da: orchestratore, 2026-08-25, sul file al commit `758102b`.

## R1 — **CONFERMATA. Ed è un errore mio, non del prototipo soltanto.**

Cercata nel file ogni forma di ritaglio:

```
grep -o -E "clip-path|-webkit-mask|mask-image|clip:"  →  1 sola occorrenza
riga 256:  clip:function(t,e,n,i,r=30){const s=t.clone()
```

L'unica occorrenza è **dentro il bundle three.js** (`AnimationUtils.subclip`).
Nel CSS d'autore non esiste alcun ritaglio. `.titolo.sotto` è dipinto dopo
`.titolo.sopra`, stessa posizione assoluta, quindi lo copre per intero: si vede
solo la copia chiara. E `header` sta a `top:0` con `padding:26px`, quindi il
titolo è nella fascia alta e non incontra mai il 50%.

Il difetto grave non è nel prototipo — è nel mio audit. Al §2 avevo scritto che
il titolo che attraversa la linea "è già in piedi e va portato di là così com'è".
Ho letto **il commento CSS che dichiara l'intenzione** (riga 58: *"il titolo
attraversa la linea e cambia colore a metà glifo"*) e ho riportato l'intenzione
come implementazione, senza cercare il meccanismo che l'avrebbe realizzata.

È esattamente l'errore contro cui esiste `docs/04-MISURE.md`: **guardare il
provino, non la dichiarazione.** Un commento nel codice non è una prova che il
codice faccia quella cosa.

Conseguenza: il taglio del titolo passa da "acquisito" a **da costruire**, ed è
il primo dei momenti-firma da implementare davvero.

## R2 — **CONFERMATA, e peggiore di come è descritta**

La logica:

```js
S.picchi.push({v:ass, t:t});
while (S.picchi.length && t - S.picchi[0].t > 10) S.picchi.shift();
var picco = S.picchi.reduce(...);
```

Con `RIDOTTO` attivo `t` resta 0 per sempre, quindi `t - S.picchi[0].t` vale 0 e
la condizione `> 10` non è mai vera: **niente viene mai rimosso.**

Alla crescita di memoria si aggiunge un secondo effetto che il contributore non
nomina: `reduce` scorre **l'intero array a ogni fotogramma**. Il costo per
fotogramma cresce linearmente con il tempo di permanenza sulla pagina. Non è
solo una perdita di memoria: è un **rallentamento progressivo**, e colpisce
esattamente gli utenti che hanno chiesto meno movimento.

## R3 — **CONFERMATA** sul rubric · **NON RISOLTA** sui punteggi

Sul rubric: identica a F1 dell'altro contributo, confermata alla lettera. Sul
Developer Award a valle del SOTD: confermata con citazione, vedi F2.

Sui punteggi dei SOTD **non ho una misura né a sostegno né a smentita**.
L'elenco pubblico non espone i voti nel testo, e la pagina ufficiale dice che il
punteggio di giuria è visibile solo a chi vince il SOTD. Non potendo verificare
né "8 medio-alti" (mia affermazione) né "7,2–7,5" (sua), **ritiro la mia** invece
di difenderla, e la questione resta aperta con un modo per chiuderla: aprire le
schede di una ventina di SOTD e leggere i punteggi dove sono esposti.

## R4 — **CONFERMATA. Misurata di nuovo qui, e i numeri coincidono.**

| blocco | byte | gzip -9 |
|---|---|---|
| file completo | 718.877 | 226.935 (221,6 KB) |
| bundle three.js | 603.462 | 148.751 (145,3 KB) |
| simulazione d'autore | 12.114 | 4.213 (4,1 KB) |
| CSS + font base64 | 99.783 | 72.291 (70,6 KB) |
| **JS totale** | | **149,4 KB** |

Il contributore misurava 227.862 e ~153 KB; io 226.935 e 149,4 KB. Lo scarto è
di implementazione gzip, non di sostanza. **Il prototipo è già sotto i 250 KB
gzipped, con margine.**

L'errore è mio ed è doppiamente sgradevole: in `docs/04-MISURE.md` avevo scritto
di mia mano *"il peso in rete non è ancora stato misurato... non usare questi
numeri per dire quanto pesa il sito"* — e poi ho usato esattamente quei numeri
per dire quanto pesa il sito, in `01-AUDIT §3.1` e nella lista delle sei mosse.
Scrivere la regola non basta: va applicata anche quando conferma quello che si
sperava di trovare.

**La ragione per andare a moduli ES resta, ma è un'altra:** togliere ~145 KB
gzipped di codice mai eseguito accorcia parsing e tempo al primo disegno, e
quello ricade su LCP e INP — che sono da misurare. Non è "rientrare nel budget":
nel budget ci siamo già.

## R5 — **CONFERMATA**

Nel file non compare né `inert` né `hidden` né `visibility` (l'unica
corrispondenza di `hidden` è l'`aria-hidden` sulla copia del titolo). Con
`opacity:0` e `pointer-events:none` il pulsante `#chiudi` resta nel tab order, e
`aria-modal="true"` continua a dichiarare modale una finestra chiusa — quindi
alcuni screen reader nascondono il resto della pagina senza motivo.

Da fare insieme al focus trap e alla restituzione del focus già segnalati
nell'audit §3.5.

## R6 — **CONFERMATA sui bersagli · PLAUSIBILE, DA MISURARE sulla sovrapposizione**

Bersagli: riga 97, `#mare button{width:20px;...}`. Le altezze vanno dal 20% al
100% di un contenitore da 34px, quindi il bersaglio più piccolo è circa
20 × 7 px. Contro i 44 × 44 px del requisito è meno di un sesto dell'area.

Sovrapposizione: `#lettura` e `#energia` condividono `bottom:104px` sotto 820px,
con `#energia` a `width:42vw`. Su 390px di larghezza restano circa 186px per tre
letture numeriche a corpo 28px con etichette — il conto è stretto e la
sovrapposizione è probabile, ma **è una previsione, non una misura**, e va
verificata in esecuzione prima di essere corretta.

## R7 — **CONFERMATA**

Nessuna pubblicazione, nessuna immagine, nessun video. Accolta senza riserve, ed
è la critica che pesa di più fra tutte: **il repository oggi contiene più prosa
che sito.**

## Sull'indicazione operativa

**Accolta.** Converge con F3 dell'altro contributo, arrivata per una strada
diversa: entrambi dicono di non far dipendere il lavoro dalle decisioni aperte.

Ordine adottato per il prossimo giro:

1. porto in Vite + moduli ES, ri-tarando luci e colore guardando il provino;
2. i cinque difetti verificati: taglio del titolo mai implementato (R1), perdita
   di memoria (R2), modale (R5), bersagli tattili (R6), pulsante commerciale
   nascosto su mobile;
3. **preview pubblica** e un'immagine nel README (R7);
4. prima campagna di misure vere, con le condizioni di prova fissate.

Nome, lingua e famiglie tipografiche **non bloccano** nessuno di questi quattro.
