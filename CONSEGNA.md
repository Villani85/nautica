# CONSEGNA — briefing per chi continua

Sei un'AI che riprende questo progetto. Questo file è il punto di partenza:
leggilo tutto prima di toccare qualsiasi cosa.

Repository: `https://github.com/Villani85/nautica`
Stato a questa consegna: commit `efcb334`

---

## 0. Le prime tre cose da fare, in ordine

```bash
git clone https://github.com/Villani85/nautica.git && cd nautica
npm install
npx playwright install chromium      # serve a collaudo-impaginato e collaudo-posa
for f in strumenti/collaudo-*.mjs; do echo "$f"; node "$f"; done
```

Poi leggi, in quest'ordine: `STATO.md` · `docs/12-PIANO-E-AVANZAMENTO.md` ·
`docs/13-ATTO-DUE.md` · `feedback/COME-DARE-FEEDBACK.md`.

`riferimenti/` sono 50.000 righe di ricerca: **non leggerle tutte.**
`riferimenti/README.md` dice quale scheda serve per quale problema.

---

## 1. Cos'è il progetto, in dieci righe

Un sito che dimostra un sistema di stabilizzazione a pinne per yacht, costruito
per candidarsi ai premi Awwwards.

**La tesi:** *il pezzo che vale di più è quello che non vedi mai.* Sopra la
linea di galleggiamento due persone stanno comode; sotto, una macchina lavora
perché ci stiano.

**La regola generativa unica: il taglio.** Una linea orizzontale a metà schermo
divide due mondi — sopra carta da disegno e registro umano, sotto acqua profonda
e registro tecnico. Ogni scelta del sito discende da lì.

**Il vincolo tecnico che ne deriva:** la camera guarda l'orizzonte, quindi la
linea d'acqua cade sempre al centro esatto del canvas e lo sfondo CSS può
spaccarsi con un hard stop al 50%. La giunzione fra CSS e canvas è misurata a
**0 px** e non si tocca.

**Cosa non è:** non è un portfolio, non è il sito di un cliente. Lo yacht è
autoprodotto e dichiarato tale. Non esistono clienti, testimonianze o
certificazioni, e non se ne inventano.

---

## 2. I cancelli — e perché qui non c'è una tabella

**Non troverai lo stato dei cancelli scritto in questo file.** Ci stava, con una
tabella che diceva quali erano rossi e quali verdi, ed è stata la causa di un
rilievo sbagliato: una revisione ha riportato due cancelli rossi leggendo la
tabella invece di eseguirli, mentre entrambi erano verdi da ore con codice di
uscita 0.

*Un documento che registra lo stato dei cancelli è una macchina per produrre
bugie:* invecchia in ore e continua a sembrare autorevole. Quindi lo stato non
si legge, **si esegue**:

```bash
npm run collaudo              # fisica, scafo, mare, fantasma, filmati, quote, normali
npm run collaudo:posa         # il salone: la posa reagisce e non lampeggia
npm run collaudo:impaginato   # 5 viewport x 6 battute x 2 stati
```

Tutti escono con errore se qualcosa non va, e stampano il numero che li ha fatti
fallire.

**Non committare con un cancello rosso.** Se ne rompi uno mentre lavori, o lo
ripari o scrivi in `CANTIERE.md` perché resta rosso e per quanto.

**E se due macchine danno esiti diversi**, è un problema più grave dei difetti
che segnalano: `CHROMIUM=1` forza il browser interno di Playwright invece del
Chrome di sistema, così la differenza si riproduce invece di discuterla.

## 3. Le regole del repository — non negoziabili

1. **Si misura il difetto prima di correggerlo.** Mai «ho sistemato X»: sempre
   sintomo, causa, e come l'hai isolato.
2. **Se un difetto può lampeggiare, si campiona nel tempo.** Eseguire un
   cancello una volta sola non dice niente: qui è già successo che due controlli
   sfondassero una volta su dieci ciascuno.
3. **Nessun cancello misura millisecondi.** Misura lavoro, oppure confronta con
   un file versionato. Un tetto in ms misura quanto è carica la macchina: sullo
   stesso codice sono stati misurati 11, 19, 25 e 52 ms.
4. **Nessuna conseguenza cablata a mano.** Se una riga forza un risultato che la
   fisica dovrebbe produrre, va rimossa. È la bugia peggiore possibile in un
   sito la cui tesi è l'onestà tecnica.
5. **Un cancello che non può fallire non è un cancello.** Prima di scriverne
   uno, rompilo apposta e verifica che diventi rosso.
6. **Un pezzo per commit.** Non mescolare codice, documenti e CSS nello stesso.
7. **Nessuna chiave nel repository.**
8. **Si aggiunge una cosa solo togliendone un'altra**, finché il sito non è
   pubblico e misurato su un telefono vero.

### Il registro delle decisioni

`docs/03-DECISIONI.md` contiene le decisioni prese (`D01`–`D57`) e le questioni
aperte (`A01`, `A03`, `A05`, `A09`).

**Prima di riaprire una questione, leggi il registro.** È già successo di
riprendere una decisione già presa e di assegnare numeri già occupati.
La prossima decisione è `D58`.

---

## 4. Le trappole già pagate — non ripeterle

Cinque metri rotti trovati finora. Sono tutti della **stessa famiglia**: uno
strumento restituisce un numero e non dice che è rotto.

| difetto | cosa succedeva |
|---|---|
| tetto in millisecondi | misurava il carico della macchina, non il codice |
| cancello su un punto caotico | chiedeva un numero ripetibile a mare 3 · 8 nodi, che è il regime saturo |
| picco su finestra finita | non converge: le armoniche a 0,51ω / 0,83ω / 1,37ω hanno periodi incommensurabili. Sostituito con RMS |
| orizzonte come riferimento di camera | l'orizzonte è mare e si muove da solo: fra fotogrammi vicini si separa dalla camera |
| `toBlob` su canvas WebGL | senza `preserveDrawingBuffer` restituisce un buffer vuoto, senza errore |

**Due difetti di geometria, entrambi invisibili ai collaudi numerici:**

- il loft era un **tubo aperto** ai due estremi: con la camera a poppa si vedeva
  l'interno della prua. La geometria era corretta e ogni collaudo passava. Chiuso
  con `tappoA` — prua e specchio *sono* sezioni;
- l'avvolgimento dei triangoli era rovesciato: **544 normali su 544 puntavano
  dentro**. Con un materiale a doppia faccia non si vede niente.

**Il vincolo che li previene entrambi:** superficie e tappo di sezione passano
dalla **stessa funzione**, `sezioneA()` in `src/scafo/ordinate.js`. Se ti trovi
a scrivere una seconda interpolazione, ti sei già sbagliato. Lo scarto è
verificato a 5,9 × 10⁻⁸ — la precisione del float32 — da `collaudo-scafo.mjs`.

---

## 5. Cosa fare, in ordine

### 5.1 — Riparare i due rossi

**`#stab-salone`** — priorità sopra tutto il resto. Non è un difetto di
impaginazione: è l'interruttore con cui si spengono gli stabilizzatori dentro il
capitolo del salone, ed è il **gesto del finale dell'atto due**. Senza, il
momento per cui l'atto due esiste non ha come essere innescato.
*Accettazione:* `node strumenti/collaudo-posa.mjs` verde dieci volte di fila.

**Le 8 sovrapposizioni** — `src/stile.css` ha solo `max-width: 820px` e
`prefers-reduced-motion`. Manca qualsiasi media query su **viewport bassi**: a
1280×720 `.battuta p` copre le etichette `ROLL` e `PEAK`.
*Accettazione:* `node strumenti/collaudo-impaginato.mjs` verde su 5 viewport ×
6 battute × 2 stati.

**Decidere `collaudo-fantasma`** — è verde ma la mossa che sorvegliava (la nave
che si divide) è stata rimossa in `ab605f1`. Misura la simulazione, non la
scena. O torna a verificare che il fantasma sia disegnato, o si toglie con la
sua riga nel registro.

### 5.2 — Il Design, dove si lasciano punti

Il punteggio pesa **Design 40 · Usability 30 · Creativity 20 · Content 10**.

- **`#fattura` e `#offerta` sono colonne di testo con lo schermo mezzo vuoto.**
  Ogni affermazione forte deve comparire due volte: sopra la linea nel registro
  commerciale, sotto in quello tecnico. È la tesi applicata al testo.
- **La linea compare in un posto solo.** Il trattamento `.taglio` è usato una
  volta, nel titolo di apertura. Ogni titolo di sezione deve attraversarla.
  Un sito con un'idea sola deve mostrarla ovunque.
- **Chiudere A04 con Recursive** (OFL-1.1, via Fontsource). Un file solo, assi
  `MONO` e `wght` variabili, sottoinsiemato ai glifi usati: **42,4 KB contro i
  67,2 attuali**, −37% sulla voce dominante del percorso critico. Misurato con
  `gltfpack`/`fontTools`, non stimato.
  Vincoli: bloccare `CRSV` a 0 (default 0,5 = corsivo automatico) e **vietare
  `pnum`** nel CSS, che sostituirebbe le cifre tabulari con quelle proporzionali.
  L'asse `MONO` — proporzionale sopra la linea, monospaziato sotto — è la tesi
  del sito scritta nel sistema tipografico. Usare i **due estremi fermi**: farlo
  scorrere sarebbe un effetto.

### 5.3 — L'atto due

Specifica completa in `docs/13-ATTO-DUE.md`. Tre pezzi, in quest'ordine:

**Il passaggio di consegne.** Sotto la linea lo scorrimento smette di muovere la
pagina e la lama comincia a rispondere alla mano. Il primo movimento lo fa il
sito, di pochi centimetri. Non misurare la latenza di input — è sempre verde
perché è un `requestAnimationFrame`. Quello che può rompersi è la **durata del
vuoto**, e si guarda addosso a una persona che non conosce il sito.

**La catena causale.** Quattro sistemi: propulsione, stabilizzatori, giroscopio,
timoneria. Quattro perché si tengono per mano.

```
PROPULSIONE spenta → la nave perde abbrivio → la velocità cala
                              │
               C(V) = C0·(V/V_rif)²  →  l'autorità delle pinne
                              │          cala col QUADRATO
                              ▼
              gli STABILIZZATORI muoiono da soli → il rollio torna
                              │
                              ▼
       il GIROSCOPIO è il controesempio: funziona a nave ferma
```

`C(V)` è già in `src/scena/simulazione.js`. La riduzione **deve emergere da lì**.
*Accettazione:* nessun `if (propulsioneSpenta)` nel codice. Se esiste una riga
che forza il risultato, la catena è finta e va rimossa.

**Il finale.** Con la lama ferma sul meccanismo, si spengono gli stabilizzatori
e **sopra, il salone si inclina**. Non un'animazione: la stessa simulazione.
*Accettazione:* inclinazione del salone contro `viva.c.theta`, scarto sotto
0,05° su 200 fotogrammi. Se divergono, è un effetto e va rimosso.

### 5.4 — Il telefono

La Usability vale il 30% ed è il criterio più basso dei vincitori (Messenger
7,46 · Lando Norris 7,90). Il sito **non è mai stato aperto su un dispositivo
reale**: solo emulazione.

Camera libera su touch è un progetto a sé. Da provare, non assumere: la griglia
a due assi diventa una sequenza di celle, trascinamento orizzontale fra stazioni
e verticale fra quote, a scatti fra posizioni note.
*Accettazione:* ogni cosa scopribile da desktop lo è da telefono. Non con lo
stesso gesto — con lo stesso esito.

---

## 6. Bloccato sull'umano — non provare a farlo

**Non hai i permessi e non devi cercarli.**

1. **GitHub → Settings → Pages → Source: GitHub Actions.** Il workflow esiste in
   `.github/workflows/pubblica.yml`. Finché non è acceso, nessuna misura reale è
   possibile e il sito non esiste per nessuno.
2. **Il profilo Awwwards.** Non creare account, non inserire password. Prepara
   il testo pronto da incollare e lascialo a lui.
3. **Aprire il sito da un telefono vero.** Nessuna emulazione lo sostituisce.
4. **Mettere il sito davanti a tre persone che non lo conoscono.** La domanda:
   capiscono cosa fa il sistema in quindici secondi, e quanti minuti ci stanno
   dentro. Quel secondo numero dice se la categoria è cambiata.

Se sei bloccato su una di queste, **scrivilo in coda a `docs/12` e passa
oltre.** Non fingere di averle fatte.

---

## 7. Come lasciare il progetto a chi viene dopo

Ogni sessione aggiorna `docs/12-PIANO-E-AVANZAMENTO.md`:

- ogni voce con uno **stato esplicito**: da fare / in corso / fatta / abbandonata, perché;
- ogni problema con **sintomo, causa e come l'hai isolato** — chi legge deve
  poter *contestare* la diagnosi;
- ogni decisione con **il numero che l'ha decisa**;
- ogni cancello nuovo con **cosa impedisce e come si esegue**;
- in coda, **dove sei bloccato**.

Se scopri che un'affermazione del repository è falsa — inclusa una di questo
file — **correggila e scrivi che era falsa**. È già successo cinque volte, ed è
il motivo per cui il progetto funziona.

---

## 8. La cosa più importante

Questo repository ha **55.000 righe di analisi** e un sito che nessuno ha ancora
aperto. Il rischio numero uno non è costruire male: è **documentare invece di
finire**.

Se il tuo prossimo contributo importante è un altro documento strategico, stai
andando nella direzione sbagliata.
