# Esito della verifica — giro Drive del 29 agosto 2026, 16:13

**Primo giro sul lavoro di oggi.** I cinque precedenti hanno rivisto `main` fermo
a `20fa37f`; fra quel giro e questo l'atto due e' entrato in `main` (`5f632d0`,
ventiquattro commit), quindi il fotogramma e' cambiato e la catena causale e'
codice nuovo, mai passato sotto nessun occhio esterno.

E ha trovato subito un numero sbagliato, **scritto da me oggi pomeriggio**.

---

## VOCE 1 — CONFERMATA. Il numero e' falso di un fattore cinque nel tempo

**L'affermazione.** `simulazione.js:202` diceva: *«spegnendo la propulsione la
nave scende a 2,19 kn in quaranta secondi»*. Il revisore sostiene che a 40 s la
nave sta a 6,10 kn, e che a 2,19 ci arriva in circa 200 secondi.

**Riprodotto qui, sul modulo spedito:**

```
velocita a 40 s             6,100 kn      (il commento diceva 2,19)
tempo per arrivare a 2,19   180,5 s       (il commento diceva 40)
```

**Come ci sono arrivato a scriverlo**, perche' la forma dell'errore vale piu'
del numero: i 2,1 kn esistono, ma sono il regime del **controesempio del
giroscopio**, dove `collaudo-catena` lascia planare la nave per centonovanta
secondi prima di accendere il rotore. Ho preso la velocita' di una scena e l'ho
incollata sul titolo di un'altra.

**E lo dicevano gia' due file dello stesso commit.** `collaudo-catena` stampa
«dopo 40 s ... (6.10 kn)» e `docs/12:152` scrive 6,10. Tre punti dello stesso
albero: due d'accordo e uno no — ed era il commento, cioe' **l'unico che nessun
cancello legge**.

E' esattamente il difetto che tre giri fa mi era costato la sovrastruttura
(`84f16ac`, «due documenti si contraddicevano su un numero misurato»), commesso
di nuovo il giorno stesso in cui l'avevo scritto nel registro.

**La nota di equita' del revisore, e va riportata perche' rende la voce piu'
utile e non meno.** A differenza dello stallo a 12 nodi del giro delle 14:10,
qui **la frase qualitativa regge**: la pinna satura davvero. Solo che satura
molto prima, e il numero giusto la rende **piu' forte**:

```
12,0 kn   picco 18,1 gradi   in stallo  0,0%
10,0 kn   picco 25,0 gradi   in stallo 71,0%     dopo ~10 s di planata
 6,1 kn   picco 25,0 gradi   in stallo 87,5%     il punto vero dei 40 s
```

Al **primo** calo di velocita' la pinna e' gia' a fondo corsa i tre quarti del
tempo. Non serve aspettare tre minuti: succede subito. Corretto, con la tabella
dentro il commento.

## VOCE 2 — NON E' UN DIFETTO, ed e' un giro risparmiato

Il picco della pinna a mare 5 / 12 nodi e' scritto due volte nel file con due
valori — 16,0 e 17,7 — e misurato da lui 18,1. Sembra la forma d'errore del
§3.1, e **l'ha verificata prima di riportarla come bersaglio**.

Non lo e': l'intestazione del file dichiara che **il picco su finestra finita
non converge**, perche' le tre armoniche hanno periodi incommensurabili e non
tornano mai in fase. Quindi 16,0 / 17,7 / 18,1 sono tre finestre della stessa
grandezza, non tre numeri in disaccordo — ed e' la ragione per cui la riduzione
pubblicata usa la RMS e non il picco.

Ho aggiunto ai due commenti **su quale finestra** sono misurati, come suggerisce
lui: non per me, ma perche' il prossimo revisore non ci spenda mezzo giro. E' la
stessa cortesia che il giro delle 12:14 aveva fatto con `aoMap`, disinnescando
una trappola «pur non essendo un difetto».

## Giudizio visivo — tre punti nuovi, e il fotogramma e' cambiato davvero

Le schermate sono state rifatte **apposta** perche' l'atto due ha cambiato il
pixel, e il revisore lo dichiara: non e' la duplicazione che il §6 vieta.

**Il confronto e' cambiato registro:** dice che il sito e' bello *nel registro
di Lando Norris, non di Bruno Simon* — editoriale e fermo invece che vivo e
giocoso. E che dove perde non e' la bellezza ma **la prontezza**: *«loro dicono
questo e' vivo, gioca entro mezzo secondo; qui il primo mezzo secondo dice sto
caricando»*.

**1 · I comandi si accavallano sul telefono.** «SCROLL» e «DRAG · ROTATE»
cadono una sopra l'altra sull'acqua chiara, e il selettore SEA STATE sta a filo
dei tre interruttori senza leggersi come cliccabile ne' come altezza d'onda.
**Non verificato in questo giro**: `collaudo-impaginato` da' zero
sovrapposizioni, quindi se si tocca e' sotto la soglia del cancello o e' un
problema di leggibilita' e non di geometria. Numero sul tavolo.

**2 · «FOR YOUR PRODUCT» non dice dove porta.** E' l'unico invito commerciale
del sito. Messa in scena: non la tocco.

**3 · Il menu perde CONTACT sul telefono — verificato, e non e' un difetto.**
Misurato con `strumenti/menu-telefono.mjs` (nuovo):

```
desktop 1440x900    Saloon Ship Cut Mechanism Contact      Below spento
telefono 390x844    Saloon Ship Cut Mechanism Below        Contact spento
```

E' una **decisione dichiarata** in `stile.css`: *«la voce Contact esce — e'
l'unica che non e' una scena, e sta in fondo alla pagina dove si arriva
comunque»*. Fuori scopo, col rimando.

**MA la sua giustificazione non regge piu', e questo e' mio da segnalare.** La
regola e' `nav a:not([data-scena]){display:none}` e la ragione era «solo le
scene stanno nel menu». Adesso in quel menu c'e' **`Below`, che non e' una
scena**: e' l'entrata dell'esplorazione, aggiunta oggi. Quindi il menu del
telefono contiene una voce non-scena e ne esclude un'altra con la motivazione di
essere non-scena.

Non la risolvo: quale delle due esca e' messa in scena. **Numero sul tavolo, con
la contraddizione scritta.**

## Risposta a §3.5 che vale la pena tenere

Alla domanda «cosa mettere nei primi tre secondi su telefono» risponde con una
cosa che il sito ha gia' e non usa: **un numero misurato**. La meta' alta del
hero e' crema perche' la crema *e'* la superficie dell'acqua — ma per tre
secondi non promette niente. Mettere li', in tipografia grande, «da **15 gradi**
a **1 grado** di rollio» o il **91%** che la HUD mostra dopo, con una hairline
CSS come linea di galleggiamento: **costa zero byte di rete** e dice, prima che
il 3D arrivi, che c'e' una barca che non rolla e di quanto.

E' la stessa scelta che rende forte «underneath»: una frase, non un asset.
Messa in scena, quindi non la prendo io — ma e' la proposta piu' concreta
ricevuta su quel punto in sei giri.

## Cosa non ho verificato

- **i tre rilievi visivi 1 e 2**: sono giudizio, e il cancello dell'impaginato
  dice zero sovrapposizioni. Se si toccano davvero, e' leggibilita';
- **le curve di resa reali** dietro la sua nota su §3.3 (la transizione a
  gradino invece che a rampa): dichiara lui stesso di avere la direzione e non
  la magnitudine;
- **tutto cio' che passa da Cycles**, come nei cinque giri precedenti;
- **la sua misura del picco a 18,1**: e' un valore di finestra per costruzione,
  e lui lo dice.
