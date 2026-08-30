# 17 · Il test con cinque persone

Questo documento serve a chiudere le sette soglie che in `src/ui/soglie.js`
portano ancora il prefisso `IPOTESI_`. Sono provvisorie per costruzione: nessun
cancello le verifica, perché non sono state misurate su nessuno.

**Cinque sessioni sono un test formativo, non una validazione statistica.**
Possono chiudere ipotesi operative del prototipo. Non producono leggi
sull'utenza. Ogni numero che ne esce va scritto come *osservato su n=5*, mai
come soglia universale — e chi lo trascriverà in `soglie.js` deve togliere il
prefisso `IPOTESI_` **solo** insieme alla riga che dice su quante persone.

---

## 0. Quando si fa, e quando NON si fa

Si fa quando la build è stabile su tre cose insieme: **camera**, **guscio del
salone** e **clip del sollievo**. Prima no.

Testare un'inquadratura che sta per cambiare produce dati che scadono con il
commit successivo, e — peggio — brucia cinque persone che non si possono
riutilizzare: chi ha già visto il sito non è più un utente ignaro, e gli utenti
ignari sono la risorsa scarsa di tutto questo lavoro.

---

## 1. Chi cercare

Cinque persone **estranee al progetto**: non devono aver visto il sito, né i
provini, né sapere che c'è di mezzo uno stabilizzatore.

Non servono esperti di nautica. Serve il contrario: il sito deve funzionare su
chi non sa cosa sia una pinna stabilizzatrice, perché è esattamente il
visitatore che deve capire *perché* le persone stanno comode.

Va bene qualunque età e mestiere. Va evitata una sola cosa: chi lavora in
grafica 3D o web, perché guarda la tecnica invece della storia.

**Ordine dei dispositivi, alternato:** almeno due sessioni telefono-prima e due
desktop-prima. La quinta a scelta, dichiarando quale. Senza alternanza non si
distingue «il sito si capisce» da «il sito si capisce al secondo passaggio».

---

## 2. Che cosa NON dire

Questa è la parte che si sbaglia più facilmente, e una frase di troppo invalida
la sessione.

**Vietato**, prima o durante:

- nominare stabilizzatore, pinne, giroscopio, rollio, propulsione;
- dire che c'è qualcosa da fare, da cliccare o da scoprire;
- dire «prova a…», «hai visto che…», «di solito qui la gente…»;
- rispondere a «cosa devo fare?» con qualcosa di diverso dalla formula sotto;
- reagire con la faccia o con un suono quando la persona trova o non trova
  qualcosa.

**Se chiede cosa fare**, si risponde una volta sola, con queste parole:

> «Fai quello che faresti se ci fossi arrivato da solo.»

E poi si tace.

**Se resta bloccato più di novanta secondi** senza toccare niente, si chiude la
sessione lì e lo si registra come tale. Un blocco è un dato, non un fallimento
da soccorrere: aiutare cancella l'unica misura che quella sessione stava
producendo.

---

## 3. Il protocollo, parola per parola

### 3.1 Prima di aprire (2 minuti)

> «Ti chiedo di guardare un sito per qualche minuto. Non è un esame per te: sto
> misurando il sito, non le tue risposte. Non c'è modo di sbagliare.
>
> Ti chiederò di dire ad alta voce quello che pensi mentre lo guardi — anche
> cose banali, anche "non ho capito". Se stai zitto per un po' ti dirò solo
> "cosa stai pensando?", senza suggerire niente.
>
> Non registro né audio né video, non prendo il tuo nome. Puoi fermarti quando
> vuoi, anche subito.»

Attendere un sì esplicito. Poi aprire la pagina con `?studio=1` e **non toccare
più il dispositivo**.

### 3.2 Durante (libero, fino all'abbandono o alla fine)

Si interviene con **una sola frase**, e solo dopo venti secondi di silenzio:

> «Cosa stai pensando?»

Nient'altro. Non «cosa vedi», che orienta verso il visivo; non «cosa faresti»,
che suggerisce che ci sia qualcosa da fare.

### 3.3 Dopo (5 minuti, nell'ordine)

Le domande vanno fatte **in quest'ordine** e **senza cambiare le parole**.
L'ordine conta: le prime sono aperte, e una domanda specifica messa prima
avvelena tutte quelle dopo.

1. «Cosa pensi sia possibile fare, qui dentro?»
2. «C'è stato un momento in cui è cambiato qualcosa? Cosa è appena cambiato?»
3. «A un certo punto la nave ha ricominciato a muoversi. Perché, secondo te?»
4. «Cosa ha calmato le persone?»
5. «C'è qualcosa che hai provato a fare e non ha funzionato?»
6. «Se dovessi raccontare a un amico di cosa parla questo sito, cosa gli
   diresti?»

Alla 3 e alla 4: **se la persona non ha notato l'evento, si registra "non
notato" e si passa oltre.** Non si racconta cosa è successo. Non si riapre la
pagina per mostrarglielo.

---

## 4. Che cosa si misura

Otto grandezze. Le prime sei le raccoglie il percorso `?studio=1` da solo; le
ultime due le scrive l'osservatore.

| # | misura | come si registra |
|---|---|---|
| 1 | **primo gesto** | secondi dall'apertura al primo clic/tocco intenzionale |
| 2 | **gesti a vuoto** | quanti tocchi su cose che non rispondono, prima del primo che risponde |
| 3 | **scoperta della rotazione** | ha ruotato la vista? a quale secondo? |
| 4 | **catena propulsione → velocità → pinne** | dalla domanda 3: la spiega, la sfiora, o no |
| 5 | **scoperta del giroscopio** | l'ha acceso? spontaneamente o dopo il suggerimento? |
| 6 | **abbandono** | a che punto della corsa ha smesso, se ha smesso |
| 7 | **riconoscimento della tensione** | domanda 4 |
| 8 | **riconoscimento del sollievo** | domanda 4 |

### Il criterio duro, quello che decide

Sulle 7 e 8, il criterio è quello scritto in `ciao.md` e non va ammorbidito:

> **Entro tre secondi dal cambio, almeno quattro persone su cinque devono dire
> spontaneamente che la coppia si è irrigidita o rilassata.**

«Spontaneamente» significa: alla domanda 4, senza che nessuno abbia nominato le
persone prima. Se qualcuno dice «si sono rilassati» solo dopo che l'osservatore
ha chiesto «e le persone?», **quella non conta come riconoscimento**, e la
scheda deve segnarlo come *indotto*.

**Se il criterio non passa, la cura non è un testo né una freccia.** È
rigenerare un gesto più leggibile, mantenendo esattamente camera, identità,
luce e fotogrammi di consegna. Aggiungere una didascalia che dice «guarda le
persone» è la sconfitta travestita da correzione.

---

## 5. La scheda di raccolta

**Nessun nome, nessuna email, nessun audio, nessun video.** Solo un
identificativo progressivo e il dispositivo.

```
sessione       P1 … P5
dispositivo    telefono | desktop        ordine: primo | secondo
data           (solo giorno)

  1  primo gesto                     ____ s
  2  gesti a vuoto                   ____
  3  rotazione scoperta              sì / no      a ____ s
  4  catena propulsione→pinne        spiegata / sfiorata / no
  5  giroscopio                      spontaneo / dopo il nudge / mai
  6  abbandono                       a ____ % della corsa   | arrivato in fondo
  7  tensione riconosciuta           spontanea / indotta / no
  8  sollievo riconosciuto           spontaneo / indotto / no

  citazioni testuali (verbatim, non parafrasate):
  ...

  cosa ha provato a fare e non ha funzionato:
  ...
```

Le citazioni si scrivono **con le parole della persona**, non riassunte. Una
parafrasi è già un'interpretazione, e l'interpretazione la si fa dopo, guardando
cinque schede insieme.

---

## 6. Il percorso `?studio=1`

Cosa deve fare, e cosa non deve fare.

**Deve:**

- registrare le sei misure automatiche in memoria, con un orologio che parte
  al primo fotogramma disegnato e non al `DOMContentLoaded`;
- esporre un pulsante **«Esporta»** che scarica un JSON e un CSV **in locale**;
- funzionare identico al sito normale sotto ogni altro aspetto: `?studio=1` non
  deve cambiare nulla di ciò che la persona vede, altrimenti non stiamo
  misurando il sito.

**Non deve:**

- mandare niente da nessuna parte. Nessuna rete, nessun endpoint, nessun
  identificatore che sopravviva alla scheda del browser;
- mostrare alcunché in pagina durante la sessione: nessun contatore, nessun
  bordo, nessun indicatore. Il pulsante di esportazione compare **solo dopo**
  che l'osservatore ha premuto una combinazione, mai da solo;
- registrare posizioni del mouse continue o testo digitato.

**Cancello suggerito** (`collaudo-studio`): la pagina con `?studio=1` e senza
devono produrre lo **stesso** albero DOM e lo stesso numero di fotogrammi entro
tolleranza. Se `?studio=1` cambia il sito, misura sé stesso.

---

## 7. Come si chiudono le soglie, dopo

Per ciascuna delle sette `IPOTESI_`:

1. si guarda quale delle otto misure la riguarda;
2. se cinque sessioni su cinque cadono dalla stessa parte, la soglia si può
   togliere dal prefisso — **e nello stesso commit** si scrive accanto il numero
   osservato e la dicitura `n=5`;
3. se le sessioni si dividono, la soglia **resta** `IPOTESI_`. Tre su cinque non
   è un risultato, è un pareggio con un arbitro stanco;
4. se una soglia non è toccata da nessuna delle otto misure, allora il test non
   la riguarda e va detto: significa che quella soglia aspetta un'altra prova,
   non questa.

**`IPOTESI_ROLLIO_AVVERTITO_RMS` si tocca in un punto solo.** Quel valore
comanda sia il nudge del giroscopio sia l'irrigidimento della coppia: se il test
suggerisce di spostarlo, si sposta **per tutti e due insieme**. Due numeri
separati prima o poi divergono, e allora il sito suggerisce una cura per un male
che nessuno sta vedendo.

---

## 8. Cosa fare con i risultati brutti

Scriverli.

Il valore di cinque sessioni non sta nel confermare: sta nel far vedere dove il
sito si affida a qualcosa che sa solo chi l'ha costruito. Un risultato che
obbliga a rifare un gesto vale più di cinque conferme, e va registrato con la
stessa cura — **incluse le sessioni in cui l'osservatore ha parlato troppo**,
che vanno marcate come compromesse invece che silenziosamente scartate.
