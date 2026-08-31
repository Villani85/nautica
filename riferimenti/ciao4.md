# ciao4 — cosa è cambiato il 31 agosto, e cosa chiedo

**Scritto da:** Claude Opus 5, sessione del 31 agosto 2026
**Ramo:** `main`
**Segue:** `ciao3.md` (che conteneva numeri sbagliati — vedi §1)
**Provino:** `nautica-31ago-sera.mp4`, girato sulla build di questo commit

---

## 0 · LA COSA DA SAPERE PRIMA DI GIUDICARE

**Guarda il sito pubblicato, non i provini vecchi.**

Tre dei tuoi ultimi giri hanno giudicato filmati superati, e hanno prodotto voci
non riproducibili: «Jump to any scene» sulla hero (misurato: compare a q 0,292,
nella seconda scena) e un nudge «Drag the speed» che **non esiste**. Non è colpa
tua: te li ho mandati io.

Se il provino allegato e il sito online divergono, **vale il sito**.

---

## 1 · CORREZIONE A `ciao3.md`: quei numeri erano sbagliati

In `ciao3.md` avevo pubblicato le coordinate per il piazzamento del guscio e
scritto che `p`, `corsaRacconto` e `cimaSezione` **non esistono** su
`__nautica`.

**Esistono.** Le scrive `demo.js:378-393`, aggiunte proprio quando un cancello
si ruppe per questo motivo. Io le avevo cercate in `index.js`.

Conseguenza: i miei due strumenti nuovi si posizionavano in **frazioni di
pagina** — il divieto che questo repo ha già pagato tre volte — e quindi i
numeri di piazzamento che ti ho dato erano **presi nei punti sbagliati del
racconto**. Chi li avesse usati avrebbe inseguito un bersaglio inesistente.

Rimisurati e corretti. Lo scrivo per primo perché è l'errore che ti avrebbe
fatto perdere più tempo.

---

## 2 · COSA È CAMBIATO, in ordine di importanza

### 2.1 · Si parte SPENTI (la tua priorità zero)

Eseguita. La contraddizione era già dentro il repo, a venti file di distanza:

```
  src/scena/simulazione.js:434    stab: false        <- il valore dichiarato
  src/stato.js:117                sim.S.stab = true  <- e chi lo rimetteva
```

Adesso: mare 4, la nave rolla di **16,16 gradi p-p** misurati, l'invito dice
«See what it does», e ad accendere è l'utente.

**Tolta la dimostrazione automatica** che spegneva da sola per 2,6 s e
riaccendeva: partendo spenti, un cronometro su quell'interruttore annullerebbe
l'unica azione causale della visita.

La vecchia argomentazione resta scritta accanto alla nuova, perché non era
debole: *«si entra da dove si sta bene»*. Cede in un punto solo, e vale la pena
nominarlo: **presupponeva che il visitatore sapesse già di stare bene.** Chi
arriva su una nave calma non vede un problema risolto, vede una nave.

**Protetta da `strumenti/collaudo-stato-iniziale.mjs`**, provato rosso e verde.
Legge il **runtime**, non il sorgente — perché `rg "stab = false"` avrebbe
trovato la riga di `simulazione.js` e dichiarato tutto a posto.

### 2.2 · La catena causale dell'atto due si racconta nell'ordine

Misurata senza GPU, ed è la sequenza in cinque battute che avevi chiesto:

```
   0,5 s  11,87 kn  rms 1,13  "The shaft slows. Speed follows."
   4,0 s   9,70 kn  rms 0,92  "The fins are still on. They are losing water."
  17,0 s   5,28 kn  rms 2,57  "Try the gyro"
                              poi silenzio
```

I numeri raccontano la fisica da soli: la velocità cala, le pinne perdono
autorità, il rollio **risale** da 0,92 a 2,57, e solo lì il giroscopio ha senso.

### 2.3 · Il sollievo non lascia più lo schermo coperto

Difetto vero, che sarebbe arrivato agli utenti. La consegna dal sollievo al
ciclo calmo si chiudeva su `requestVideoFrameCallback`, ma il video calmo era
stato messo **in pausa**: se era già sul fotogramma giusto non ne presentava più
nessuno, la richiamata non arrivava mai, e **lo schermo restava coperto dal
fermo immagine. Per sempre.** In CI tre volte su tre, in locale con la GPU mai.

Curato tenendo due strade: la richiamata resta quella buona, `rAF` fa da rete, e
`chiudi` non consegna su una posizione vecchia (fino a 60 fotogrammi d'attesa,
poi consegna comunque — meglio un raccordo impreciso di uno schermo bloccato).

### 2.4 · Sei cancelli riallineati, e nessuno era un difetto del sito

Invertire lo stato iniziale ha fatto cadere sollievo, cinematica e i due del
nudge. In tutti i casi la cura è stata **percorrere la sequenza vera** invece di
zittire il canale reale:

- su una nave che sbatte il sollievo non può partire, e **non deve**;
- un rapporto di trasmissione si misura col sistema **in moto**;
- il nudge del giroscopio racconta «le pinne sono ACCESE e hanno perso acqua»:
  a pinne spente quella contraddizione non esiste;
- le battute maturano su **grandezze diverse** — pinne sulla velocità,
  giroscopio sul rollio RMS — e il cancello le comprimeva in un istante che
  nella visita dura minuti.

---

## 3 · IL GUSCIO: dove sono arrivato, e il muro che ho trovato

### Fatto

- `CAMERA_SORGENTE_SALONE` esportata **come nodo dentro il GLB**: la conversione
  degli assi viaggia col file, e `guscio.js` non ricostruisce più a mano
  matrice, trasposta e mezzo giro attorno a X. **È la tua risposta alla DOMANDA
  1 di `ciao3.md`, ed era migliore della domanda.**
- `strumenti/registro-guscio.mjs`: il registro in **pixel**, non più sei
  schermate da guardare.

### Il metro oscillava più della cosa misurata

Prima ricerca: curva non monotona, e stavo per leggerla come un minimo. Poi la
stessa identica configurazione tre volte: **45,8 · 16,8 · 23,3**.

Non confrontavo due inquadrature, confrontavo due **istanti**: la clip suona, il
mare si muove, la nave rolla. La cura era `?fermo`, che questo repo ha da sempre
e che non avevo usato. Adesso: **26,7 · 26,7 · 26,7**.

### E il residuo NON è un errore di piazzamento

Cinque sondaggi, un parametro alla volta:

```
  convenzione   0 -> 26,7   1 -> 41,0   2 -> 41,0   3 -> 29,0  4 -> 29,0  5 -> 63,4
  quota      -0,15 -> 33,1     0 -> 26,7   +0,15 -> 28,4
  trasversale -0,2 -> 41,7     0 -> 26,7    +0,2 -> 30,6
  distanza    -0,3 -> 30,5     0 -> 26,7    +0,3 -> 25,0
  scala       0,85 -> 28,1   1,0 -> 26,7     1,2 -> 26,4
```

Quota e trasversale hanno un minimo **netto** dov'è adesso. Il piazzamento è in
un minimo locale su tutti e cinque i gradi di libertà, e la convenzione degli
assi è **misurata**, non sperata.

**Il residuo è strutturale:** la lastra è la fotografia ritagliata in un
rettangolo 16:10, il guscio la proietta su geometria che quel rettangolo lo
eccede — pavimento, soffitto, pareti. Il guscio mostra **più stanza**, ed è
esattamente ciò per cui esiste.

Quindi questo metro sa dire «grossolanamente fuori posto» ma **non sa
certificare che sia giusto**: ha un pavimento sopra la soglia dei 10,6.

### Stato onesto, con le tue parole

```
  asset guscio          FATTO
  validazione GLB       FATTA (123 KB, 8 nodi + camera, zero immagini)
  convenzione assi      MISURATA
  piazzamento           in un minimo, NON certificato
  percorso predefinito  ANCORA LASTRA
  difetto percettivo    ANCORA VISIBILE
```

---

## 4 · LE DOMANDE

### ⟶ DOMANDA 1 · Il metro che chiude la questione del guscio

Il mio registro ha un pavimento perché confronta il guscio con la **lastra**, e
le due mostrano legittimamente porzioni diverse di stanza.

Il metro giusto mi sembra un altro: confrontare il guscio col **fotogramma della
clip** dentro il **solo rettangolo del vano** — lì la proiezione è una
tautologia e le due immagini devono coincidere per costruzione, quindi il
pavimento sparisce.

È la strada giusta? E il rettangolo del vano lo prendo da `posa.json`
(`guscio_m.vano`, x −2,1746..0, y 0..1,1449) proiettato, o dalla maschera
`finestrone.png` già spedita?

### ⟶ DOMANDA 2 · Quanta stanza in più è un guadagno, e quanta è un problema

Il guscio mostra più stanza della lastra: pavimento, soffitto, pareti. È il
punto — ma significa anche che **la fotografia viene stirata su superfici che
nella ripresa erano appena visibili o fuori quadro**.

`posa.json` è esplicito su dove smette di misurare: il pavimento è letto con
certezza fino a X = 1,90 m, e il fondo scelto è a 6,00 m su un massimo teorico
di 12,568. Oltre quel punto **la geometria è inventata e la fotografia ci viene
spalmata sopra**.

Guardando il guscio, dove vedi che comincia a mentire? Meglio un guscio corto
che finisce nel buio, o uno lungo con la texture stirata?

### ⟶ DOMANDA 3 · L'ordine, adesso che lo stato iniziale è fatto

Il tuo ordine era: stato iniziale → guscio e supporti rivelati → traversata
world-space → scorrimento e finale → yacht → suono.

Il primo è fatto. Ma il guscio è in un minimo non certificato, e completarlo
può costare una giornata senza garanzia che il salone smetta di leggersi come
una carta.

**Conviene finire il guscio, o spostarsi sui tre bordi** (cavità dietro il
piano, sezioni di scafo senza cappatura a 96-110 s, lastre troncate), che sono
la stessa famiglia di difetto — supporto rivelato — e che tu hai già visto e io
non ho ancora riprodotto?

### ⟶ DOMANDA 4 · Il finale fermo 13,8 s

L'hai misurato con `freezedetect` e non l'ho riprodotto. È **messa in scena** e
non la tocco di mia iniziativa, ma serve una direzione: accorciare la tenuta, o
far coincidere il sollievo visibile con l'arrivo, o tutte e due?

E il contatto che prende venti secondi dopo: è la stessa cosa o un problema
diverso?

---

## 5 · COSA NON HO VERIFICATO, dichiarato

- **i tre bordi** che hai visto: presi come indicazioni, non riprodotti. Il
  protocollo a quattro viewport a 0,25× non l'ho eseguito;
- **`src/ui/suono.js`**: verificato che esista e che la catena passi, **non
  ascoltato**. Il provino allegato non ha traccia audio;
- **il finale fermo 13,8 s** e lo scorrimento a gradino;
- **la traversata**: il codice conferma la lastra a copertura totale
  (`depthTest: false`, `renderOrder = 999`), la cura world-space non è iniziata;
- **lo yacht**: non toccato. L'ordine che hai dato è registrato — silhouette →
  contatto scafo-acqua → illuminazione → cappature → materiali → microdettaglio,
  *«non iniziare dal punto 6»*;
- **tutto ciò che passa da Cycles**, come negli undici giri precedenti.

---

## 6 · NUMERI DI QUESTO COMMIT

- filmati **4,12 MB** su un tetto di 4,2
- JS **210,5 KB** gzip su 250
- percorso critico **58,5 KB** gzip
- `guscio-salone.glb` **123 KB** (8 nodi + camera, 1 materiale, zero immagini)
- catena di collaudo completa: **verde, zero ROTTO**

---

## 7 · UNA NOTA DI METODO, perché è il difetto ricorrente

Oggi ho passato ore su cancelli che diventavano rossi, e **quasi nessuno era un
difetto del sito**. Le forme che ha preso:

| forma | dove |
|---|---|
| campionamento a fotogrammi | manopola: 12 campioni invece di 480, verdetto rovesciato |
| attesa d'orologio al posto di un fatto | varco, sollievo, telefono |
| un timer che non riesce a girare | l'annotazione letta prima che il thread si liberasse |
| un metro che oscilla più della cosa misurata | il registro del guscio, 45,8 · 16,8 · 23,3 |
| **un metro che misura il nulla e lo dichiara perfetto** | il registro leggeva una tela WebGL già scartata: **«scarto 0,0 — il guscio non si distingue dalla lastra»**, su zero pixel confrontati |

L'ultima è la peggiore, ed è capitata **dentro lo strumento scritto per non
ripetere le altre**.

E una che non è tecnica: il sito non si aggiornava da stanotte, e la ragione
ultima non era nessuno di questi difetti — **ogni volta che spingevo il lavoro
consolidato, annullavo la corsa di CI che stavo aspettando.** Cinque volte. Ogni
singola azione era giusta, il risultato no.
