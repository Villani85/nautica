# 19 — Emendamenti: dove la specifica e le decisioni non dicono la stessa cosa

**Cosa è:** l'istruttoria di tre punti in cui `docs/14-FOTOREALISMO.md` — la
specifica vincolante — e il codice che sta nel prodotto si contraddicono, e in
due casi su tre il codice fa l'opposto perché il committente l'ha chiesto.

**Cosa non è:** una decisione. Nessuna riga di questo documento sceglie. Per
ogni punto ci sono l'argomento della specifica scritto al suo meglio,
l'argomento della decisione contraria con le misure che lo sostengono, e il
**testo esatto** con cui la clausola andrebbe riscritta se il committente
decide di emendarla — o la raccomandazione di non emendarla affatto.

**Perché esiste:** una specifica violata in silenzio non è più una specifica.
Oggi il repository ha tre clausole scritte, un codice che ne fa l'opposto, un
cancello che *impone* l'opposto, e quattro commenti che descrivono la regola
revocata come se fosse ancora in vigore. In quello stato nessuno sa più cosa
sia la regola: chi legge `docs/14` crede una cosa, chi legge `salone3d.js` ne
crede un'altra, e tutti e due hanno una fonte da citare.

**Procedura seguita.** `docs/14` chiude con un'istruzione vincolante per chi
propone modifiche:

> 1. indica la frase esatta di questo documento che il cambiamento sostituisce;
> 2. mostra un fatto del codice, una misura riproducibile o una fonte primaria;
> 3. se il cambiamento non è necessario per produrre il GLB grezzo integrato,
>    rimandalo.

Ogni caso qui sotto rispetta i punti 1 e 2. Il punto 3 non blocca più niente:
il GLB grezzo **è** integrato (`src/scena/impianto.js:108-110, 206`,
`collaudo-glb.mjs` verde), quindi la condizione che imponeva il rinvio è
scaduta.

**Numerazione.** `§5.1`, `§9.7` e simili sono i numeri di clausola usati da
`docs/17-CONFORMITA.md`. In `docs/14` i paragrafi sono numerati fino al secondo
livello; le clausole dentro un paragrafo sono contate nell'ordine in cui
compaiono. `§9.7` è quindi il settimo enunciato di §9: il sesto e ultimo dei
«minimi di accettazione».

**Sola lettura.** Nessun file esistente è stato toccato per scrivere questo
documento. Le verifiche sono state fatte sull'albero di lavoro del 27 agosto
2026.

---

## Le tre in una riga

| # | la specifica dice | il codice fa | raccomandazione |
|---|---|---|---|
| A | nel salone la stanza sta ferma, rolla l'orizzonte | rolla la stanza, l'orizzonte sta fermo | **emendare** §5.1, §8.2 e §11.7 — con tre condizioni |
| B | con `prefers-reduced-motion` niente ciclo continuo obbligatorio | il ciclo gira sempre, e un cancello lo pretende | **emendare** §9.7 — e restituire la via d'uscita che la parola «obbligatorio» proteggeva |
| C | la sequenza torna alle persone | finisce sul meccanismo | **non emendare**: serve il lavoro, ed è più piccolo di quanto sembri |

---

# A · Chi rolla, la stanza o l'orizzonte

## A.1 — Cosa dice la specifica

**`docs/14` §5.1**, sotto il titolo *«Salone — camera solidale allo yacht»*:

> - stanza e cornice restano ferme nell'inquadratura;
> - mare e orizzonte ruotano nel finestrino in verso opposto al rollio;
> - corpi, bicchieri e lampada reagiscono rispetto alla stanza;
> - è esperienza vissuta.

e, subito dopo, l'istruzione operativa:

> Oggi `src/scena/composito.js` usa la convenzione opposta: tiene fermo il mare
> e ruota `stanza` e `tesa`. Per applicare questa decisione, la trasformazione
> di rollio passa al livello `mare`; i livelli della stanza non ruotano.

> Il mare deve avere overscan sufficiente a coprire gli angoli scoperti dalla
> rotazione. Il pivot visivo coincide con l'orizzonte, non col centro casuale
> del video.

**`docs/14` §8.2**, primo punto della fase emotiva:

> - invertire il riferimento del salone: stanza ferma, mare che rolla;

**`docs/14` §11**, settima riga della definizione di finito:

> - [ ] nel salone la stanza resta ferma e l'orizzonte rolla;

Tre punti, la stessa regola, nessuna deroga scritta.

## A.2 — Cosa fa il codice

Il prodotto fa l'opposto, e lo fa in due strati che si annullano a vicenda.

**`src/scena/index.js:485-489`** contro-ruota il gruppo del salone, e lo motiva
con la regola di §5.1 parola per parola:

```js
// la stanza NON rolla: chi e' seduto dentro ha il proprio salotto come
// riferimento, e a inclinarsi e' l'orizzonte. La contro-rotazione
// annulla quella della nave, di cui il gruppo e' figlio per seguirne la
// quota. Vedi `composito.js` §5.1: e' la stessa correzione, in 3D.
salone.gruppo.rotation.z = -nave.rotation.z
```

**`src/scena/salone3d.js:253`** costruisce la lista di ciò che ruota **senza**
la texture del mare:

```js
const RUOTANO = [stanzaTex, mascheraRuota, tesaTex, mascheraTesa].filter(Boolean)
```

`mareTex` nasce a `:207` e non entra mai in quella lista. A `:362-367` ruota
soltanto ciò che sta in `RUOTANO`:

```js
const inclina = MathUtils.degToRad(gradi)
for (const t of RUOTANO) { t.rotation = inclina; t.repeat.set(1 / copre, 1 / copre) }
```

Il commento a `:356-360` lo dichiara: *«IL MARE NON RUOTA PIU'. A ruotare e' la
stanza»*.

**Risultato visibile:** il gruppo geometrico è livellato nel mondo, e dentro di
esso la fotografia della stanza gira dell'angolo di rollio mentre il mare resta
piatto. Sullo schermo si vede esattamente ciò che si vedrebbe con una **camera
solidale al mondo**: la stessa convenzione dello scafo esterno
(`index.js:474`), applicata anche da dentro.

**Su istruzione esplicita del committente, due volte**, registrata in
`salone3d.js:216-226`:

> *«per creare il movimento della barca ma l'orizzonte che non si muove»*
>
> *«la barca si deve muovere»*

## A.3 — L'argomento della specifica

Non è un fantoccio. Chi ha scritto §5.1 aveva quattro ragioni, e tre reggono
ancora.

**1 · È la fenomenologia di chi sta a bordo.** Un passeggero seduto ha il corpo
vincolato alla barca: testa, collo e occhi seguono il ponte. L'immagine
retinica del salotto è quasi ferma, e ciò che si inclina è l'orizzonte fuori
dal vetro. Chiunque sia stato su una barca lo riconosce. Il sito rivendica in
pagina di non mentire (`index.html:87`, `:303-310`); una stanza che si inclina
davanti a un passeggero seduto è, letteralmente, un'inquadratura che nessuno a
bordo ha mai visto.

**2 · La differenza fra i due riferimenti *è* l'argomento.** §5.1 non prescrive
una convenzione: ne prescrive **due**, e il salto fra loro è la tesi del
capitolo. Fuori si osserva una nave, dentro si vive una traversata. Se anche il
salone adotta il riferimento del mondo, il sito ha un punto di vista solo, e la
stanza diventa un'altra inquadratura della barca invece di un posto in cui si
sta. La frase di §5.1 — *«è osservazione e dimostrazione»* contro *«è
esperienza vissuta»* — perde il proprio secondo termine.

**3 · Protegge la fotografia, che è l'unica del sito.** Ruotare la stanza
obbliga a ritagliarla: un riquadro 16:9 inclinato ha bisogno di
`cos|a| + (9/16)·sin|a|` volte se stesso per non scoprire gli angoli, cioè
**1,19× a dodici gradi — il 16% del fotogramma buttato** nel caso peggiore. Lo
calcola il codice stesso a `salone3d.js:364`. Il salone è l'unico materiale
ripreso del progetto e l'unico posto in cui si vedono delle persone
(`index.js:481-483` lo dice). Il mare, invece, è una texture: ritagliarlo costa
meno. La specifica mette l'overscan dove il materiale vale meno.

**4 · Costa un accoppiamento in meno.** Con la stanza ferma ruota una texture
sola. Con la stanza che rolla ne ruotano **due** legate allo stesso angolo — la
fotografia e la sua maschera — e il codice lo dichiara come rischio
(`salone3d.js:232-236`): *«se divergono, il vano scivola sotto il ritaglio»*.
È una classe di difetto che la convenzione della specifica non ha.

## A.4 — L'argomento della decisione contraria

**1 · Lo schermo è il riferimento verticale, e non si muove mai.** Questo è il
punto, ed è più forte di come è stato scritto finora nel repository. La testa
di chi guarda **non** è vincolata alla barca: è ferma davanti a un monitor con
quattro bordi rigorosamente verticali e orizzontali. §5.1 descrive
correttamente ciò che vede un passeggero, ma il visitatore non è un passeggero:
è una persona seduta a una scrivania che guarda una finestra rettangolare. In
quella condizione una stanza ferma dentro una cornice ferma legge come «non
succede niente», e l'unico movimento residuo è una linea sottile che si
inclina in fondo a un vano.

**2 · E l'angolo residuo è piccolo, misurato.** `docs/09` §2, sulla clip di
riferimento, lo dice con un numero: *«una nave stabilizzata rolla un grado e
mezzo, e lì dentro l'emozione non ci sarebbe stata»*. Lo stesso documento
registra la conclusione che ne era seguita: *«Il finestrino porta l'emozione,
il rollio porta la prova tecnica»*. Il sito si apre stabilizzato e a mare 4
(`docs/15` §0), e la riduzione misurata è dell'89,1%: 12° di ampiezza nuda
diventano circa 1,3° di rollio vivo. §5.1 assegna tutto il movimento visibile
del capitolo d'apertura a un grado e tre decimi dentro il 55% della larghezza
del quadro (`docs/15` §0-ter). Il committente ha guardato quella schermata e ha
detto che non si muoveva niente.

**3 · Con una camera livellata, la stanza inclinata viene gratis.**
`docs/15` §0-bis, riga 147-151, misurato sulla strada poi abbandonata per altri
motivi:

> Sono uscite due rotazioni scritte a mano — la contro-rotazione che teneva il
> gruppo livellato e la rotazione della texture del mare — e la regola di
> `docs/09` restava vera da sola, perché la camera è livellata e il gruppo del
> salone è figlio della nave. Stanza inclinata, orizzonte piatto, zero righe
> che lo impongano.

È un fatto strutturale, non un'opinione: il gruppo del salone è figlio della
nave (`index.js:299`), la camera non rolla mai, quindi **la convenzione della
decisione contraria è quella che il grafo di scena produce da solo**. Ottenere
§5.1 richiede di scrivere codice che combatte il grafo — ed è esattamente ciò
che oggi succede, con `index.js:489` che annulla e `salone3d.js:365` che
riapplica.

**4 · La camera non può davvero essere «solidale allo yacht».** §5.1 intitola
il blocco *«camera solidale allo yacht»*, ma quella camera non può esistere in
questo sito: `strumenti/collaudo-continuita.mjs:258-267` diventa rosso se le
componenti x/z del quaternione della camera superano `1e-4`, perché una camera
inclinata sposta l'orizzonte dalla mezzeria e rompe la giunzione fra fondo CSS
e tela — *«l'unica idea meccanica del sito»*. Una camera che rolla col ponte ha
la componente z del quaternione diversa da zero. Quindi §5.1 non descrive un
cambio di riferimento della camera: descrive una **simulazione** di quel cambio
fatta ruotando degli strati. Il titolo della clausola promette qualcosa che il
sito non può concedere.

**5 · Cosa NON sostiene la decisione contraria, e va detto.** Non esiste nel
repository nessuna misura percettiva — nessun confronto A/B registrato, nessun
provino affiancato — che dimostri che la stanza che rolla si legge meglio. Il
solo numero registrato è in `docs/16`: *«la stanza rolla e l'orizzonte no |
stanza 4,7° = rollio 4,7°, mare 0°»*, e la colonna del cancello è vuota: **è la
verifica che il codice fa ciò che è stato chiesto, non che ciò che è stato
chiesto sia meglio.** L'argomento forte resta quello del punto 1, che è
ragionamento sulla geometria dello sguardo, più l'osservazione diretta del
committente sullo schermo. In questo repository l'occhio ha già battuto un
numero una volta, ed è scritto in `docs/15` §0-bis: *«quando non sono
d'accordo, ha ragione l'occhio finché non trovo il numero che gli dà torto»*.

**6 · Il confronto è già disponibile, e nessuno l'ha guardato.** La versione
conforme a §5.1 esiste ancora nel repository e gira: `src/scena/composito.js`
`:274-296` implementa la clausola alla lettera — commento incluso — e si
raggiunge con `?doppia=1`. Non è un A/B pulito, perché `?doppia=1` cambia anche
l'architettura (salone in DOM, due scene, due contenitori), ma è la stessa
fotografia con la stessa clip e la convenzione opposta. **Mezz'ora di
osservazione affiancata vale più di questa pagina intera.**

## A.5 — Proposta di emendamento

**Raccomandazione: emendare**, ratificando la convenzione del codice — con tre
condizioni, perché due clausole vicine restano scritte per la convenzione
vecchia e oggi non proteggono più niente.

### A.5.1 — Testo che sostituisce il blocco «Salone» di §5.1

Sostituisce, in `docs/14` §5.1, le sette righe che vanno da
*«**Salone — camera solidale allo yacht.**»* fino a *«Il pivot visivo coincide
con l'orizzonte, non col centro casuale del video.»* incluse.

> **Salone — un riferimento solo, quello del mondo.**
>
> Il sito ha una scena sola, una camera sola e nessuno stacco fra il salone e
> l'esterno: il riferimento del rollio non può cambiare a metà di un movimento
> di camera continuo, perché non c'è un taglio dietro cui cambiarlo. E non può
> cambiare nemmeno in linea di principio: la camera resta livellata per tutta
> la durata del sito — `collaudo-continuita.mjs` la rende rossa se si inclina —
> perché è la camera livellata a tenere a zero pixel la giunzione fra fondo CSS
> e tela.
>
> - la fotografia della stanza e la sua maschera ruotano insieme dell'angolo di
>   rollio, con **un solo angolo** applicato a entrambe: se divergono, il vano
>   scivola sotto il ritaglio;
> - il mare nel finestrino resta orizzontale;
> - l'overscan si paga su ciò che ruota, cioè sulla stanza, e si calcola
>   dall'angolo vero a ogni fotogramma (`cos|a| + (9/16)·sin|a|`) invece di
>   restare fermo al caso peggiore: da fermo la fotografia è intera. Il mare,
>   che non ruota, **non ha overscan da pagare** e va mostrato a piena
>   risoluzione;
> - il pivot della rotazione della stanza è dichiarato e misurato, non il
>   centro del video preso perché capitava lì;
> - corpi, bicchieri e lampada stanno dentro la fotografia: la loro reazione è
>   una seconda posa ripresa, non geometria che risponde. Finché quella posa
>   non esiste girata dalla stessa ripresa, la clausola è sospesa e il sito non
>   afferma di averla.
>
> **Perché questa e non l'altra**, e va scritto perché la regola opposta è
> difendibile e il documento l'ha sostenuta per intero: chi guarda non è un
> passeggero. Ha la testa ferma davanti a un rettangolo con quattro bordi che
> non si muovono mai, e sono quelli — non il proprio orecchio interno — a dargli
> la verticale. In quella condizione un orizzonte che si sposta di un grado e
> tre decimi dentro un vano non si vede, mentre una stanza che si inclina dello
> stesso angolo sì. Il costo è dichiarato: si mostra un'inquadratura che a bordo
> nessuno vede. Si paga volentieri, perché il capitolo deve far sentire una
> traversata a una persona seduta a una scrivania.

### A.5.2 — Testo che sostituisce il primo punto di §8.2

Sostituisce: *«- invertire il riferimento del salone: stanza ferma, mare che
rolla;»*

> - il salone e lo scafo esterno usano **lo stesso** riferimento, quello del
>   mondo: ruota la fotografia della stanza con la sua maschera, il mare resta
>   orizzontale, e l'overscan si paga soltanto su ciò che ruota;

### A.5.3 — Testo che sostituisce la settima riga di §11

Sostituisce: *«- [ ] nel salone la stanza resta ferma e l'orizzonte rolla;»*

> - [ ] nel salone la stanza rolla e l'orizzonte resta piatto, con la maschera
>       che segue la fotografia sullo stesso angolo, e il mare mostrato senza
>       ritaglio;

### A.5.4 — Le tre condizioni

Un emendamento che si limitasse a invertire le frasi lascerebbe il documento
peggiore di com'è. Vanno con lui:

1. **Il pivot va riscritto o cade.** §5.1 dice *«il pivot visivo coincide con
   l'orizzonte»*, e nel codice l'orizzonte è il pivot della **sola texture che
   non ruota**: `salone3d.js:208` mette `mareTex.center` sull'orizzonte
   (`ORIZZONTE = 0.539`, misurato), ma `mareTex` non è in `RUOTANO`. Le texture
   che ruotano davvero hanno `center.set(0.5, 0.5)` (`:254`), cioè il centro
   del video — che è precisamente ciò che la clausola vieta. `docs/17` marca la
   clausola 5.1d come rispettata citando le righe 116 e 208: è vero alla
   lettera e vuoto nella sostanza. **La clausola oggi non protegge niente.** O
   si dichiara qual è il pivot giusto per una stanza che rolla — e va scelto
   guardando, non ragionando — o si toglie.

2. **L'ingrandimento del mare va ritirato, e sono 13 punti di dettaglio nel
   vano.** `salone3d.js:209` ritaglia permanentemente la clip del mare a
   `1/1,15`, cioè ne butta il 13%, per coprire angoli che si scoprivano quando
   il mare ruotava. Il mare non ruota più (`:253`) e quel `repeat` non viene
   mai ricalcolato (unica scrittura: riga 209). È un costo pagato a una regola
   revocata. E non è un costo qualunque: il finestrone vuoto è il difetto che
   `docs/15` §0-bis ha inseguito per un capitolo intero — 18,1% di superficie
   piatta contro 67,4% — e recuperare il 13% di risoluzione dietro il vetro va
   esattamente in quella direzione. Da verificare guardando, non applicando.

3. **Quattro commenti descrivono la regola revocata.** Vanno corretti nello
   stesso commit dell'emendamento, o la contraddizione si sposta dal documento
   al codice invece di chiudersi:
   - `src/scena/index.js:485-488` — *«la stanza NON rolla … a inclinarsi e'
     l'orizzonte»*, scritto sopra la contro-rotazione;
   - `src/scena/salone3d.js:39-45` — l'intestazione dello stesso file che poi
     fa l'opposto: *«dietro la clip INTERA, che ruota col rollio … Ruota il
     mare, non la stanza. E' la correzione §5.1»*. **Due commenti opposti nello
     stesso file, a 320 righe di distanza**: `docs/17` aveva visto solo il
     secondo;
   - `src/scena/composito.js:27-28` e `:274-296` — il file si contraddice a sua
     volta (intestazione: *«la stanza si inclina contro un orizzonte che non si
     inclina»*; corpo: la regola §5.1). Vive solo sotto `?doppia=1`, ma è la
     versione conforme e va etichettata come tale, non lasciata come un secondo
     parere anonimo;
   - `docs/15` riga 738 registra *«la stanza rolla e l orizzonte no»* come
     passo chiuso citando `docs/09` invece di `docs/14`. Se l'emendamento passa,
     quella riga diventa corretta e va rilinkata a §5.1 emendato.

### A.5.5 — Se invece si decide di NON emendare

Costo del ritorno a §5.1, per completezza: si toglie
`salone.gruppo.rotation.z = -nave.rotation.z` (`index.js:489`), si sposta
`mareTex` dentro `RUOTANO` e le texture della stanza fuori, si riporta il pivot
di rotazione sull'orizzonte per il mare e si rimette `INGRANDIMENTO` fisso sul
mare. È meno di un'ora di lavoro — **e si riapre il difetto che il committente
ha segnalato due volte.** Se si sceglie questa strada, la specifica va comunque
integrata con la misura che oggi non c'è: un provino affiancato che mostri che
un grado e tre decimi di orizzonte si vedono.

### A.5.6 — Riga per `docs/03-DECISIONI.md`

> | D35 | 2026-08-27 | **PROPOSTA — Nel salone rolla la stanza, non l'orizzonte.** Un riferimento solo per tutto il sito, quello del mondo; emenda `docs/14` §5.1, §8.2 e §11.7 | chi guarda ha la testa ferma davanti a un rettangolo fermo, e sono i bordi dello schermo a dargli la verticale: un orizzonte che si sposta di 1,3° dentro un vano non si vede. Costo dichiarato: è un'inquadratura che a bordo nessuno vede. Con essa cadono il pivot sull'orizzonte (oggi applicato alla sola texture ferma) e l'ingrandimento 1,15 del mare |

---

# B · Cosa fa `prefers-reduced-motion`

## B.1 — Cosa dice la specifica

**`docs/14` §9**, ultimo dei minimi di accettazione (clausola 9.7 nella
numerazione di `docs/17`):

> - `prefers-reduced-motion`: posa leggibile, niente ciclo continuo
>   obbligatorio.

Una riga, due requisiti: una posa che si legga da ferma, e nessun ciclo
continuo **obbligatorio**. La parola «obbligatorio» non è un riempitivo, e
l'emendamento ci gira intorno: la clausola non vieta il movimento, vieta che
non se ne possa uscire.

## B.2 — Cosa fa il codice

**`src/demo.js:61-68`**:

```js
function avviaCiclo () {
  // il ciclo parte SEMPRE: con movimento ridotto la scena e' piu' piccola,
  // non ferma. Un ciclo spento ferma anche il video del salone.
  if (inCorso) return
  inCorso = true
  scena.render.setAnimationLoop(passo)
  scena.accendi?.()
}
```

**`src/demo.js:152-168`**: cambiare la preferenza a sito aperto chiama
`avviaCiclo()`, non `fermaCiclo()`. Il commento a `:156-165` dichiara che il
ramo che fermava è stato tolto.

**`src/scena/simulazione.js:71, 268`**: la preferenza scala la forzante a
`RIDOTTO = 1/3`, e tutto il resto gira identico.

**`src/scena/salone3d.js:132, 286-288`**: i due video del salone hanno
`loop = true` e vengono avviati da `accendi()`, cioè dallo stesso ciclo.

**E il cancello pretende esattamente questo.**
`strumenti/collaudo-ridotto.mjs:30-37` dichiara cosa misura, e `:147-170`
diventa rosso se:

| condizione | riga |
|---|---|
| la scena disegna meno di 30 fotogrammi su 90 | `:147` |
| il video del salone avanza meno di 0,4 s in 1,5 s | `:151` |
| l'escursione di rollio è sotto 0,02° — *«è ferma al proprio angolo di picco»* | `:163` |
| l'escursione **non** è ridotta ad almeno l'85% di quella normale | `:167` |

Le prime tre righe sono il contrario di §9.7. La quarta è l'unica parte della
clausola che il cancello difende, ed è quella che nessuno contesta.

**Su istruzione esplicita del committente**, registrata in
`simulazione.js:249-251` e in `collaudo-ridotto.mjs:19-20`:

> *«deve partire su tutti gli schermi anche su chi disattiva le animazioni»*

## B.3 — L'argomento della specifica

**1 · È una promessa di accessibilità, non una preferenza estetica.** Chi
attiva `prefers-reduced-motion` in genere lo fa perché il movimento gli fa male
— disturbi vestibolari, emicrania vestibolare, sindromi post-commozione. La
riduzione a un terzo lascia comunque **cinque gradi di rollio a tutto schermo**
a mare 5 e due video in riproduzione automatica in ciclo continuo. Un terzo di
troppo può restare troppo, e chi ha espresso la preferenza non ha modo di
dirlo.

**2 · «Obbligatorio» chiedeva una via d'uscita, e oggi non c'è.** La clausola
non dice «niente ciclo»: dice «niente ciclo continuo **obbligatorio**». È la
formulazione della norma di accessibilità sul contenuto in movimento che parte
da solo: deve esistere un modo di metterlo in pausa. Verificato: **nel sito non
esiste nessun comando di pausa** — `grep -i "pausa\|pause"` su `index.html`,
`src/ui/` e `src/stile.css` non restituisce nessun controllo, solo prosa. La
preferenza di sistema era l'unico canale con cui una persona poteva dire
«fermati», e il codice l'ha convertito da interruttore in manopola senza
lasciarne un altro.

**3 · «Posa leggibile» è la metà della clausola che nessuno discute.** §9.7
chiede anche che da ferma la scena si capisca. Con il ciclo sempre acceso quel
requisito non viene mai messo alla prova: non esiste uno stato fermo di cui
verificare la leggibilità, e non c'è cancello che lo controlli.

**4 · Una regola scritta e un cancello che la vieta insegnano che il verde non
significa niente.** È la stessa lezione che `CANTIERE.md` §1bis ha già pagato
una volta, sul cancello rimosso: *«Un cancello che protegge qualcosa che non
esiste più è peggio di nessun cancello: passa sempre verde e insegna che verde
non significa niente.»* Qui è peggio: il cancello è verde **mentre** una
clausola vincolante dice il contrario.

## B.4 — L'argomento della decisione contraria

**1 · Il ciclo spento fermava cose che nessuno aveva deciso di fermare, ed è un
fatto del codice.** `collaudo-ridotto.mjs:9-17` elenca il difetto per cui il
cancello esiste. Tre cose si spegnevano insieme e la terza per sbaglio: il ramo
che congelava la nave al proprio angolo di picco, l'orologio della scena e le
onde, e — non deciso da nessuno — il **video del salone**, che vive dentro
quel ciclo. Chi aveva la preferenza attiva non riceveva un sito più calmo:
riceveva una fotografia. Non è un'opinione sul gusto: è un accoppiamento
sbagliato fra la preferenza dell'utente e il ciclo di disegno, e chiudere il
ciclo era il modo sbagliato di onorarla.

**2 · Il difetto vestibolare è l'ampiezza, non l'esistenza del movimento.**
`simulazione.js:255-258`: *«Quindici gradi di rollio a tutto schermo sono un
problema; cinque no. Togliere tutto è la scorciatoia di chi non vuole
progettare la versione ridotta — ed è anche l'unico modo di rendere il
requisito invisibile, perché una pagina ferma non fallisce nessun controllo.»*

**3 · Fermare aveva prodotto un difetto misurato, segnalato da una revisione
esterna.** `feedback/revisore-repo-2026-08-25.md` R2, confermata e aggravata
alla verifica (`:98-116`): con il tempo congelato, `S.picchi` cresceva senza
mai essere svuotato — la rimozione dipendeva proprio dall'avanzamento di `t` —
e `reduce` scorreva l'intero array a ogni fotogramma. **Non solo una perdita di
memoria: un rallentamento progressivo, addosso esattamente agli utenti che
avevano chiesto meno movimento.** La versione ferma non era più accessibile:
era peggio.

**4 · La riduzione è misurata, non dichiarata.** `docs/16`, tabella delle
chiusure recenti: *«il movimento ridotto riduce, non spegne | video +15,4 s in
1,5 s di campione; rollio 0,23° contro 1,67° | `collaudo-ridotto.mjs`»*. Il
rapporto è circa 1 a 7 sull'escursione campionata, e il cancello a `:167`
impedisce che la riduzione smetta di essere vera.

## B.5 — Proposta di emendamento

**Raccomandazione: emendare §9.7** — la decisione contraria ha ragione sul
merito e ha le misure — **ma restituendo la via d'uscita che la parola
«obbligatorio» proteggeva**, che è l'unica parte dell'argomento della specifica
che il codice non ha ancora risposto.

### B.5.1 — Testo che sostituisce la clausola di §9

Sostituisce: *«- `prefers-reduced-motion`: posa leggibile, niente ciclo
continuo obbligatorio.»*

> - `prefers-reduced-motion`: **la scena continua a disegnare e i filmati
>   continuano ad avanzare; a ridursi è l'ampiezza del movimento, non la sua
>   esistenza.** Il ciclo di disegno non si spegne, perché dentro quel ciclo
>   vivono anche i video del salone, che nessuno ha deciso di fermare: spegnerlo
>   consegna a chi ha chiesto meno movimento una fotografia, non un sito più
>   calmo. Il difetto vestibolare è l'ampiezza, e l'ampiezza è ciò che scende.
>
>   Minimi verificabili, tutti e quattro nello stesso cancello:
>   1. la scena disegna — il contatore dei fotogrammi avanza;
>   2. il video del salone avanza — `currentTime` cresce;
>   3. la nave oscilla — l'escursione di rollio non è nulla, cioè non è ferma a
>      un angolo di picco;
>   4. l'escursione con la preferenza attiva è **al massimo l'85%** di quella
>      senza: ridurre non è opzionale più di quanto lo sia non spegnere.
>
> - **e chi vuole fermare tutto deve poterlo fare a mano.** La preferenza di
>   sistema regola l'ampiezza; un comando visibile e raggiungibile da tastiera
>   mette in pausa il ciclo e i filmati. Finché quel comando non esiste, la
>   preferenza è l'unico canale con cui una persona può dire «fermati», e questa
>   clausola le sta togliendo l'unico interruttore che aveva.

### B.5.2 — Cosa comporta, e non è un emendamento a costo zero

Il secondo punto è **lavoro nuovo**, non ratifica dell'esistente: un comando di
pausa non c'è. Va detto qui perché l'emendamento non diventi un modo di
chiudere la questione dichiarandola chiusa. Ordine di grandezza: un pulsante,
una classe CSS, `fermaCiclo()`/`avviaCiclo()` già esistono in `demo.js:61-78`,
e `salone3d.js` ha già `ferma()` e `riproduci()`. Il cancello si estende con un
quinto controllo — che il comando esista, sia colpibile e fermi davvero le tre
cose — sullo schema di `collaudo-manopola.mjs`, che quella verifica la sa già
fare.

Se il committente decide che il comando di pausa non si fa, l'emendamento va
approvato **senza** il secondo punto, e allora va scritto in chiaro che il sito
onora `prefers-reduced-motion` riducendo e non offrendo un'uscita. È una
posizione difendibile; quello che non si può fare è tenerla implicita.

### B.5.3 — Riga per `docs/03-DECISIONI.md`

> | D36 | 2026-08-27 | **PROPOSTA — Con `prefers-reduced-motion` il sito riduce, non si spegne**, e un comando di pausa restituisce l'uscita; emenda `docs/14` §9.7 | il ciclo spento fermava anche il video del salone, che nessuno aveva deciso di fermare, e aveva prodotto una perdita di memoria con rallentamento progressivo addosso proprio a quegli utenti (revisione R2, confermata). Il difetto vestibolare è l'ampiezza: misurato 0,23° contro 1,67°. Ma «niente ciclo obbligatorio» chiedeva una via d'uscita, e nel sito non esiste nessun comando di pausa |

---

# C · Dove finisce la sequenza

## C.1 — Cosa dice la specifica

**`docs/14` §5**, nono e ultimo passo della sequenza definitiva:

> 9. torni alle persone: il valore è il benessere, non il motore

e la riga che chiude il paragrafo:

> La scena non termina su una tabella tecnica.

**`docs/14` §8.2**, quarto punto della fase emotiva:

> - verificare il ritorno alle persone dopo la rivelazione.

**`docs/14` §11**, nona riga della definizione di finito:

> - [ ] la rivelazione ritorna alle persone;

**`docs/14` §12**, decimo divieto:

> - nessuna conclusione narrativa dentro la sala macchine.

Quattro clausole in quattro paragrafi diversi. Nessuna ambiguità, nessuna
istruzione contraria del committente registrata da nessuna parte.

## C.2 — Cosa fa il codice

`src/regia.js:115-121`, ultima battuta della sequenza:

```js
{
  id: 'meccanismo',
  da: 0.80, a: 1.01,
  titolo: 'The part you never see',
  testo: 'Servomotor, cycloidal reduction, output carrier, shaft, gland, fin. It costs a fraction of the boat, and it decides whether anyone is comfortable on board.'
}
```

La corsa finisce a `p = 1,01` con la camera a `RAGGIO_MECCANISMO = 2.6` unità
dal pezzo (`src/scena/index.js:21`). Titolo e testo sono una conclusione
narrativa, ed è l'ultima cosa che il capitolo dice: §12.10 vieta esattamente
questo.

Il salone si spegne durante l'uscita e non torna: `index.js:484`

```js
salone.mostra(1 - MathUtils.clamp((uscita - 0.62) / 0.30, 0, 1))
```

vale 0 da `uscita = 0,92` in poi.

**Una precisazione al referto.** `docs/17` §5.9 cita `src/main.js:167`
`salone.remove()` come prova che le persone escono di scena. La riga esiste, ma
rimuove la **sezione DOM del vecchio secondo atto**, non il salone 3D: sotto
`LA_SCENA_E_UNA` quella sezione è un residuo dell'architettura a due scene
(`main.js:145-168`). Il salone vero resta nel grafo — `index.js:299`
`nave.add(salone.gruppo)` — semplicemente sbiadito a zero. **La differenza
conta**, perché sposta il costo del punto C da «rifare un capitolo» a
«riaccendere una cosa che è ancora lì».

## C.3 — L'argomento della specifica

È l'argomento di tutto il progetto, e non ha controparte.

**1 · Senza ritorno, la tesi resta a metà.** §11 la formula così: chi guarda
deve poter dire da solo *«il mare peggiora → la persona perde stabilità → la
macchina lavora di più → la barca si calma → la vita a bordo riprende»*. Oggi
la catena si ferma al quarto anello. L'ultimo — quello che dà senso a tutti gli
altri — non viene mai mostrato, e resta una frase in una didascalia sopra un
riduttore.

**2 · Il sito rivendica che il valore è il benessere, e finisce sul motore.**
La battuta finale dice che il meccanismo *«decide se qualcuno a bordo sta
comodo»*, e nel momento in cui lo dice non c'è nessuno a bordo nel fotogramma.
Le persone si vedono solo nella prima battuta.

**3 · Un capitolo che finisce sul dettaglio tecnico è una sabbia aperta.**
`docs/13` §5 lo aveva già scritto: *«L'atto due deve finire, o è una sabbia
aperta da cui si esce chiudendo la scheda.»* Ed è precisamente il
comportamento riportato: si esce alla prima battuta e non si torna.

**4 · Il finale è già progettato, con il suo cancello.** `docs/13` §5:

> L'atto due finisce quando si arriva allo stabilizzatore, con la lama ferma sul
> meccanismo — **e lo si spegne.** E sopra, il salone si inclina. Non è
> un'animazione: è **la stessa simulazione.** […] Lì si rimette l'interruttore,
> la nave si calma, e il sito lascia andare.
>
> **Cancello:** l'inclinazione del salone e l'angolo di rollio della corsa viva
> devono coincidere entro 0,05° su 200 fotogrammi.

**5 · E due revisioni esterne hanno chiesto la stessa cosa.** `docs/16` §2:
*«Due revisioni hanno chiesto l'opposto»*, e `CANTIERE.md:203-207` ne riporta
una per esteso: *«esterno → apertura dello scafo → meccanismo → ingresso nel
salone»*, con l'avvertenza che l'uscita non deve diventare definitiva *«per
inerzia tecnica»*, e la risposta dell'autore: *«Ha ragione sul metodo: non
l'ho scelto, l'ho ereditato dall'ordine delle sezioni.»* Specifica e revisori
convergono da strade diverse.

## C.4 — L'argomento della decisione contraria

**Non ce n'è uno.** È la differenza fra questo punto e i due precedenti, e va
detta chiaramente: A e B sono conflitti fra una specifica e una decisione
motivata. C non è un conflitto — è **lavoro non fatto**. Nessuna istruzione del
committente, nessun commento nel codice, nessuna misura sostiene il finale in
sala macchine. `docs/12` riga 138 lo elenca ancora come *«atto due §5 | il
finale, col salone | da fare»*.

Le due cose che si possono dire in difesa dello stato attuale sono onestà, non
argomenti:

- **il costo era stato stimato su una domanda diversa.** `CANTIERE.md:208-209`
  dice *«l'inversione è mezza giornata, non un'ora, perché il salone diventerebbe
  il finale e le battute vanno riscritte»*. Ma quella stima è per **invertire il
  verso della traversata** — la domanda di `docs/16` §2 — non per **tornare** alla
  fine. Sono due lavori diversi, e §5.9 chiede solo il secondo;
- **la questione è stata confusa con un'altra, e questo l'ha tenuta aperta.**
  `docs/16` §2 chiede ai revisori esterni un parere sul verso del racconto
  dichiarando che *«la decisione è del committente e non è stata presa»*. Ma
  `docs/14` §5 quella decisione l'aveva presa, e nessuno ha emendato la
  specifica. Si stanno raccogliendo pareri esterni su una domanda chiusa,
  mentre la clausola che la chiudeva resta violata. `docs/17` lo aveva già
  rilevato ed è il rilievo giusto.

## C.5 — Proposta: NON emendare

**Raccomandazione: nessun emendamento. §5.9, §8.2, §11.9 e §12.10 restano come
sono, e si fa il lavoro.**

Emendare qui vorrebbe dire riscrivere la tesi del sito per farla combaciare con
ciò che si è riusciti a costruire finora, che è l'unico modo davvero grave di
usare questo documento.

### C.5.1 — Perché il lavoro è più piccolo di quanto il referto lasci credere

Verificato sul codice, in sola lettura:

| serve | c'è già | dove |
|---|---|---|
| il salone nel grafo di scena dopo l'uscita | **sì**, mai smontato, solo sbiadito | `index.js:299`, `:484` |
| i filmati ancora vivi | **sì**, fermati solo all'uscita dalla sezione | `salone3d.js:286-288, 311-314` |
| il rollio con lo stabilizzatore spento, per il contrasto | **sì**, `S.rollioNudo`, e ha già un cancello suo | `simulazione.js:273`, `collaudo-fantasma.mjs` |
| l'interruttore raggiungibile sul primo piano del meccanismo | **sì**, ed è stato riaperto apposta | `collaudo-manopola.mjs`, `docs/15` §0 |
| il cancello del finale, già specificato | **scritto**, non implementato | `docs/13` §5 |

Quello che manca è **regia**: una battuta dopo `meccanismo`, la camera che
riesce dal taglio e rientra nella tuga, `salone.mostra()` che risale, e la
battuta finale spostata lì. Nessun asset nuovo, nessun modello, nessun filmato.

### C.5.2 — Il vincolo che va rispettato mentre si fa

`docs/14` §12.10 vieta la conclusione narrativa **dentro** la sala macchine.
Quindi non basta aggiungere una battuta in fondo: titolo e testo di
`regia.js:119-120` vanno **spostati** nella battuta del ritorno, o la
violazione di §12.10 resta anche dopo che §5.9 è soddisfatta. Le due clausole
si chiudono insieme o non si chiudono.

### C.5.3 — La domanda che va comunque decisa, e non è questa

Restano due domande distinte, e tenerle separate è metà del lavoro:

1. **il verso della traversata** — salone → esterno → meccanismo, oppure
   l'opposto. Aperta, è la domanda di `docs/16` §2, e la specifica non la
   vincola: §5 fissa la sequenza degli **eventi**, non il verso della camera;
2. **il ritorno alle persone alla fine** — chiusa da `docs/14` §5.9 e §12.10,
   e da fare. **Vale in entrambi i versi**: se la traversata si invertisse, il
   salone diventerebbe il finale e §5.9 sarebbe soddisfatta per costruzione; se
   resta com'è, il ritorno va costruito.

La 2 non aspetta la 1.

### C.5.4 — Riga per `docs/03-DECISIONI.md`

> | D37 | 2026-08-27 | **PROPOSTA — `docs/14` §5.9, §8.2, §11.9 e §12.10 NON si emendano**: la sequenza deve tornare alle persone, e la conclusione narrativa esce dalla sala macchine | non è un conflitto fra la specifica e una decisione, è lavoro non fatto: nessuna istruzione, nessun commento, nessuna misura sostiene il finale sul meccanismo. E costa meno di quanto sembri — il salone è ancora nel grafo (`index.js:299`), i filmati sono vivi, `S.rollioNudo` esiste e il cancello del finale è già scritto in `docs/13` §5. Manca la regia |

---

# Quello che l'audit non aveva visto

Cinque cose emerse verificando i tre punti. Nessuna è una quarta
contraddizione fra specifica e committente; tutte e cinque cambiano il modo in
cui si decidono le prime tre.

**1 · Il pivot di §5.1 sta sulla texture che non ruota.** `docs/17` marca 5.1d
rispettata citando `salone3d.js:116, 208`. È vero alla lettera: `ORIZZONTE` è
misurato e `mareTex.center` ci sta sopra. Ma `mareTex` non è in `RUOTANO`, e le
texture che ruotano davvero hanno `center.set(0.5, 0.5)` (`:254`), cioè il
centro del video — che la clausola vieta con quelle parole. La clausola è
soddisfatta **a vuoto**: vincola una rotazione che non avviene. Vedi A.5.4
punto 1.

**2 · L'ingrandimento 1,15 del mare è un costo pagato a una regola revocata.**
`salone3d.js:209` ritaglia la clip del mare al 13% per coprire angoli che si
scoprivano quando ruotava; non ruota più e il `repeat` non viene mai
ricalcolato. Recuperare quel 13% va nella stessa direzione del capitolo che
`docs/15` §0-bis ha combattuto (18,1% contro 67,4% di superficie piatta nel
vano). Vedi A.5.4 punto 2.

**3 · `salone3d.js` si contraddice da solo, a 320 righe di distanza.**
L'intestazione (`:33-45`) descrive la regola §5.1 come implementata — *«Ruota
il mare, non la stanza. E' la correzione §5.1»* — e `:356-360` dichiara
l'opposto. `docs/17` aveva trovato la contraddizione fra `index.js` e
`salone3d.js`: è anche **dentro** `salone3d.js`. E `composito.js` ha la stessa
frattura fra intestazione (`:27-28`) e corpo (`:274-296`).

**4 · La versione conforme a §5.1 esiste, gira e nessuno l'ha guardata.**
`src/scena/composito.js:274-296` implementa la clausola alla lettera, ed è
raggiungibile con `?doppia=1` (`main.js:166`, `regia.js:32-33`). Non è un A/B
pulito — cambia anche l'architettura — ma è la stessa fotografia con la
convenzione opposta. La decisione A si può prendere **guardando**.

**5 · §5.1 promette un cambio di camera che il sito non può concedere.** Il
titolo *«camera solidale allo yacht»* descrive una camera che rolla col ponte.
`collaudo-continuita.mjs:258-267` diventa rosso se le componenti x/z del
quaternione della camera superano `1e-4`, perché la camera livellata è ciò che
tiene la giunzione CSS/tela a zero pixel — *«l'unica idea meccanica del sito»*.
Quindi §5.1 può essere solo **simulata** ruotando strati, e va riscritta in
quei termini qualunque cosa si decida. Aggiungo un dato di contesto: §5.1 è
stata scritta il 26 agosto contro `composito.js`, cioè contro l'architettura a
due scene; la scena unica è del 27 (`CANTIERE.md` §1quater). La clausola
prescrive due riferimenti di camera per un sito che nel frattempo ha una camera
sola e nessuno stacco in cui cambiarli.

---

# Le tre decisioni, insieme

| | cosa si decide | se sì | se no |
|---|---|---|---|
| **A** | ratificare la stanza che rolla | emendare §5.1, §8.2, §11.7 con A.5.1-A.5.3, più le tre condizioni di A.5.4 (pivot, ingrandimento, quattro commenti) | tornare a §5.1: meno di un'ora di codice (A.5.5), e si riapre il difetto segnalato due volte. Serve comunque il provino che oggi manca |
| **B** | ratificare il ciclo che gira sempre | emendare §9.7 con B.5.1, e costruire il comando di pausa che non esiste | fermare il ciclo: torna la fotografia, torna la perdita di memoria di R2, e `collaudo-ridotto.mjs` va riscritto |
| **C** | — | niente da emendare: fare il ritorno alle persone e spostare la conclusione fuori dalla sala macchine (C.5.1-C.5.2) | emendare qui vuol dire riscrivere la tesi per farla combaciare col costruito |

Le tre sono indipendenti: si possono decidere in qualunque ordine, e A non
vincola C.

**Se una di queste proposte viene approvata, `docs/14` va modificato nello
stesso commit del codice e dei commenti.** Una clausola emendata a metà è
peggio di una clausola violata: la violazione, almeno, un audit la trova.
