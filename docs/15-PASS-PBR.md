# 15 — IL PASS PBR

Piano di lavoro, versionato e **aggiornato a ogni passo chiuso**. Chi legge
questo file sa a che punto è il pass, non com'è fatto il sito — quello sta in
`docs/14-FOTOREALISMO.md`, che resta la specifica vincolante.

Legenda: `[ ]` da fare · `[~]` in corso · `[x]` fatto · `[-]` abbandonato, col
perché.

---

## Perché serve, in una riga

Oggi i due modelli non hanno **né UV né texture**: verificato sul file, non a
memoria.

```
impianto.glb        attributi: COLOR_0, NORMAL, POSITION   immagini: 0  texture: 0
sovrastruttura.glb  attributi: NORMAL, POSITION            immagini: 0  texture: 0
```

Quello che sembra materia — fughe del teak, finestre di murata, buccia
d'arancia, striature di tornitura — è **tutto procedurale nello shader**, e
l'occlusione è cotta nei vertici. Regge la media distanza: è il motivo per cui
la nave adesso legge come una nave. Non regge il primo piano, ed è lì che il
sito si gioca tutto, perché la camera arriva a 2,6 unità dal meccanismo.

Due revisioni indipendenti l'hanno chiamato con le stesse parole: *linguaggio
di una buona demo tecnica, non di un oggetto reale fotografato.*

---

## La decisione che regge tutto il pass

**L'alta risoluzione ce l'abbiamo già, e non lo sapevamo.** Il builder genera
la geometria e poi le applica gli smussi come modificatori: 3.528 facce
diventano 44.496 triangoli. Fino a oggi abbiamo esportato *quella*.

Quindi il pass non ha bisogno di scolpire niente. Ha bisogno di **separare le
due che già esistono**:

- **alta** — la mesh con gli smussi applicati, 44.496 triangoli. Non viene
  esportata: serve solo come sorgente della cottura;
- **bassa** — la stessa mesh senza smussi, ~8.000 triangoli. È quella che
  viaggia, e prende dalla cottura la normale che le ridà gli spigoli.

Il guadagno è doppio e va detto perché è controintuitivo: **il pass PBR rende
il file più leggero, non più pesante.** Meno geometria, più dettaglio.

---

## 0 · Il salone deve potersi attraversare `[~]`

**Messo in testa dopo una frase del committente**, e la frase è l'argomento
intero: *«questi devono avere la possibilità di muoversi, altrimenti avrei
fatto un filmato»*.

Ha ragione, e smonta quello che avevo scritto qui sotto tre righe più giù —
che il salone «resta due piani» e che dargli volume «è un lavoro diverso». Non
è un lavoro diverso: **è la ragione per cui il salone sta dentro una scena 3D
invece che dentro un `<video>`.** Un piano fotografico è un filmato con dei
passi in più. Se la camera non ci si può muovere dentro, tanto valeva montarlo.

### Cosa NON si fa

Non si modella il salone. La fotografia è l'asset più forte del sito — legno,
lampada accesa, due persone vere — e sostituirla con mobili costruiti a mano
significherebbe buttare l'unica cosa che oggi *non* sembra CG.

### Cosa si fa: la fotografia proiettata su un volume

Si costruisce il guscio grezzo della stanza — pavimento, soffitto, le due
murate, la paratia di fondo, il vano del finestrone — e ci si **proietta sopra
la clip dalla posizione della camera che l'ha ripresa**. Da quel punto di vista
l'immagine è identica a oggi, pixel per pixel. Spostandosi, ogni superficie si
comporta come la superficie che è: il montante del finestrone copre il divano,
il mare scorre dietro il vano, il pavimento fugge.

È la stessa idea del resto del sito, applicata a un'immagine invece che a una
carena: **cio' che è fotografia si guarda, ma deve stare dove starebbe.**

### Il punto difficile, e come si verifica

La proiezione vale solo se la camera che proietta è nella stessa posa di quella
che ha ripreso. Sbagliarla di poco si vede subito: i bordi del finestrone
proiettato non cadono su quelli modellati.

Quindi **si tara sulle linee della fotografia** — gli spigoli del vano, la
fuga del soffitto, il bordo del pavimento — e il collaudo confronta i due
bordi: quelli dipinti e quelli costruiti. Se scostano più di qualche pixel, la
posa è sbagliata e il volume non regge.

E c'è un secondo cancello, che è quello vero: **muovendo la camera di mezza
unità, le occlusioni devono cambiare.** Un billboard non cambia. Questo si
misura contando i pixel che cambiano fra due pose vicine in una regione dove
un oggetto vicino passa davanti a uno lontano.

---

## 1 · Le UV `[ ]`

**Un atlante solo per l'impianto**, non uno per pezzo e non uno per materiale.
Le ragioni:

- uno per pezzo farebbe quattordici atlanti e quarantadue texture;
- uno per materiale ne farebbe nove, e i pezzi di uno stesso nodo finirebbero
  in file diversi — cioè più cambi di stato per disegnare la stessa vite.

Con un atlante unico i nove materiali condividono le stesse tre mappe e
tengono ognuno il proprio colore di base. Tre texture in tutto.

**Come**: proiezione automatica per pezzo, poi impacchettamento su tutti i
pezzi insieme in modalità multi-oggetto, margine sufficiente a non far
sanguinare le isole quando la mappa viene rimpicciolita dalla compressione.

**Cosa può andare storto, e come me ne accorgo**: la proiezione automatica
taglia dove le capita, e su un cilindro tornito una cucitura in mezzo alla
faccia visibile si vede. Il cancello guarda **densità di texel** — quanti pixel
per centimetro tocca a ogni pezzo — e si arrabbia se un pezzo ne prende dieci
volte più di un altro, perché vuol dire che l'impacchettamento ha sprecato
l'atlante su qualcosa che non si vede.

## 2 · La cottura `[ ]`

Dall'alta alla bassa, tre mappe:

- **normale** — è quella che ridà gli spigoli smussati a una mesh che non ce li
  ha più. È il pezzo che paga la riduzione di triangoli;
- **occlusione** — sostituisce quella cotta nei vertici, che esce nello stesso
  commit. In texture ha la risoluzione dell'atlante invece che della mesh:
  l'ombra sotto la testa di un bullone smette di essere interpolata su un
  triangolo;
- **rugosità** — sostituisce la variazione procedurale di `materia.js`, che
  esce con lei. Cotta, la lavorazione può seguire la forma vera del pezzo
  invece di un disturbo in coordinate oggetto.

Le tre viaggiano in **due file**: la normale da sola, e occlusione + rugosità +
metallicità impacchettate nei tre canali di una texture sola, come vuole glTF.

**Cosa può andare storto**: se la bassa e l'alta non combaciano abbastanza, la
cottura prende la superficie sbagliata e la normale esce con macchie. Si
riconosce a occhio e si cura con la distanza di ricerca, ma va **guardata**, non
data per riuscita.

## 3 · La compressione KTX2 `[ ]`

Tre mappe a 2048 in PNG pesano più di tutta la geometria del sito messa
insieme. In KTX2 con compressione Basis stanno in una frazione, e restano
compresse **anche in memoria video** — che sul telefono conta più del
trasferimento.

Il decodificatore costa come quello di meshopt e si carica una volta sola.

**Il cancello dei numeri della pagina prenderà lo scostamento** appena il peso
cambia: è già successo tre volte stanotte, e ogni volta prima che me ne
accorgessi io.

## 4 · Il vetro `[ ]`

Oggi è uno specchio scuro senza spessore: `metalness 0,85`, nessuna
trasmissione, nessun indice di rifrazione. Da fuori regge, perché di giorno un
vetro di yacht *è* uno specchio scuro. Ma nel passaggio ravvicinato — quando la
camera esce dal salone e passa accanto al finestrino — si vede che è una
superficie sola.

Serve spessore vero e IOR 1,5. Su tre livelli di sovrastruttura è geometria da
aggiungere, non solo materiale.

## 5 · Le imperfezioni `[ ]`

**Controllate**, non sporcizia. §7 lo dice già: *variazione di roughness prima
dello sporco*, *nessuna ruggine*. Quindi:

- sigillature agli spigoli fra pannelli;
- giunti di testa sui corsi di teak, che oggi corrono da prua a poppa senza
  interruzione — ed è la cosa che si nota per prima in una coperta finta;
- tracce d'uso dove le mani e i piedi passano davvero: battagliola, corrimano,
  bordo dei gradini.

Ultimo per una ragione: sono la finitura di una superficie che deve già essere
giusta. Metterle prima vorrebbe dire sporcare un materiale sbagliato.

---

## Cosa NON entra in questo pass

- La **sovrastruttura** riceve le UV e la cottura solo dopo l'impianto. È più
  lontana dalla camera e più grande: costa più atlante e rende meno.
- I **filmati del mare** restano una dipendenza esterna.

---

## Registro

| quando | passo | cosa è successo |
|---|---|---|
| 27 ago, 07:40 | — | piano scritto e versionato |
| 27 ago, 07:50 | 0 | il salone entra nel pass, **in testa**: «altrimenti avrei fatto un filmato» |
