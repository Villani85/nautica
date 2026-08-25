# Revisione del progetto tecnico — 2026-08-25

Su `docs/08-PROGETTO-TECNICO.md` (la lama). Contributi di due revisori più le
verifiche fatte qui.

---

## Quello che va tenuto senza toccarlo

- **la doppia simulazione**: due corse identiche tranne `C = 0`, e il numero a
  schermo è `1 − picco_stabilizzata / picco_nuda`. È l'idea migliore del
  documento: il dato è onesto **per costruzione**, non per buona volontà.
  Sostituisce una costante `SMORZAMENTO = 0.11` che dichiarava l'89% senza
  averlo mai calcolato;
- **«generato ciò che si guarda, costruito ciò che si muove»** — la linea giusta
  sugli asset, e coincide con la nota già scritta in `riferimenti/tripo/NOTA.md`;
- **il collaudo in scala di grigi**: se un pezzo si riconosce solo grazie alla
  texture, non era un asset, era un'immagine;
- **il §11** che separa verificato da non verificato;
- **i due piani di taglio sdoppiati**. `clippingPlanes` in three è
  un'intersezione: due piani opposti tengono l'*interno* della fetta. Sdoppiare
  il guscio in due mesh con un piano ciascuno è la soluzione corretta, ed è
  stata verificata campionando z.

## Aritmetica ricontrollata

| dichiarato | verificato |
|---|---|
| `W = 2π/7 = 0,8976 rad/s` | ✅ esatto, periodo 7,00 s |
| guadagno di risonanza `11,1×` | ✅ `1/(2ζ) = 11,11` con ζ = 0,045 |
| 20 pezzi × 25 KB = budget intero | ✅ **500 KB su 500: margine zero** |

---

# I rilievi

## 1 — La premessa punta alla gara sbagliata · **CONFERMATO**

Le righe 6–11 fissano il bersaglio leggendo le pagelle del **Developer Award** e
concludono che l'accessibilità è «il punto più economico del tabellone».

Ma quel tabellone **si vede solo dopo aver vinto il Site of the Day**, e il SOTD
non ha una voce accessibilità: ha Design 40, Usability 30, Creativity 20,
Content 10. È l'errore già registrato in **D14**, ricomparso in una forma nuova.

**Una precisazione che sposta la conclusione, però.** L'accessibilità non vive
*solo* nella pagella DEV: è una componente della **Usability**, che pesa il 30%
al SOTD ed è il criterio più debole dei vincitori (Lando Norris **7,90**). Quindi
non è «solo igiene»: è igiene **che alimenta il 30%**.

La formulazione giusta: si fa, si fa bene, e **non la si chiama strategia**. La
strategia sta in Design 40 + Usability 30, e la Usability si vince su
prestazioni, mobile e chiarezza prima che su ARIA.

## 2 — Non c'è direzione artistica · **CONFERMATO, ed è il rilievo più grave**

Quattrocentoventi righe di specifica meccanica — piani di taglio, integratore
simplettico, contratto dei sistemi, pipeline degli asset — e sulla resa visiva
una riga: *«due palette divise dalla linea»*.

Niente tipografia (e la scala del brief è ferma alla decisione **P01-bis**, che
aspetta il censimento delle font dei SOTD), niente sistema di colore oltre le due
palette, nessuna impaginazione, nessun riferimento visivo.

**Design 40 + Usability 30 fanno il 70%, e sono le due voci che questo documento
non specifica.** Tre revisioni indipendenti hanno detto la stessa cosa: il collo
di bottiglia è la resa, non il codice.

Conseguenza operativa: **il documento gemello sulla direzione artistica va
scritto prima di cominciare a costruire**, non dopo. Altrimenti venti agenti
producono venti estetiche e il contratto dei sistemi — che è la difesa giusta —
protegge solo i materiali, non la composizione.

## 3 — La camera a quota zero può diventare una gabbia · **ACCETTATO**

Il rilievo tocca una decisione mia, e ha ragione. Linea di galleggiamento sempre
a metà schermo, azimut ±0,9 rad: per tutta la lunghezza del sito **una sola
inquadratura**. Elegante come regola, monotona come esperienza.

**La sintesi, però, non è rinunciare al vincolo.** Il vincolo serve dove serve:
la quota zero è ciò che tiene la giunzione fra fondo CSS e canvas — misurata a
**0 px** di scarto — e quella giunzione è l'unica idea meccanica del sito.

La regola giusta è più precisa: **la camera è vincolata finché la giunzione è
visibile.** Quando la lama scende sotto la linea e si entra nello scafo, il
fondo CSS può chiudersi sull'acqua profonda e la camera si libera. Il vincolo
diventa allora una *fase*, non una prigione — ed è coerente col taglio: sotto la
linea il mondo è tutto sotto.

**Sul tone mapping** il rilievo è tecnicamente giusto: senza, le alte luci
tagliano di netto. Ma la cura non è accendere ACES e basta, perché sposterebbe
ogni colore e la giunzione si vedrebbe. Le due strade praticabili:
1. tenere i colori del fondo in un intervallo che una curva identitaria nelle
   basse luci non sposta;
2. **calcolare il colore mappato e scriverlo nel CSS**, invertendo la dipendenza:
   è il CSS a inseguire il canvas, non il contrario.

Va deciso, non lasciato implicito. Oggi non è nessuna delle due.

## 4 — L'89,0% ripetuto cinque volte · **CONFERMATO, e il conto dice perché**

Il rilievo dice che cinque stati del mare con lo stesso identico numero leggono
come un dato inventato. È vero, ed è peggio: **non è un difetto della pinna che
non satura, è la struttura del modello.**

Con un sistema lineare e un controllo lineare sulla velocità di rollio:

```
θ'' + (2ζω + C·K)·θ' + ω²·θ = M(t)
ζ_eq = ζ + C·K/(2ω)
```

Il rapporto fra i picchi dipende da `ζ_eq/ζ` e **non dall'ampiezza della
forzante**. Quindi la riduzione è costante a ogni stato del mare *per
costruzione*. Aggiungere un mare 6 che manda la pinna in stallo cura il sintomo
al bordo: sotto restano cinque numeri identici.

**La cura vera è la velocità, e c'è già una fonte.** Le pinne attive producono
portanza solo in moto — Wärtsilä: *«require ship forward motion in order to
develop lift»* — e i sistemi commerciali chiedono tipicamente 6 nodi
(`docs/07-RIFERIMENTI-TECNICI.md`, §3.1, questione aperta **A06**).

La portanza va con `v²`, quindi:

```
C(V) = C₀ · (V / V_rif)²
```

Da questa riga sola escono quattro cose insieme: la riduzione **varia** con
velocità e stato del mare; a nave ferma vale **zero**, come nella realtà; la
saturazione della pinna emerge dal modello invece di essere aggiunta al bordo; e
il sito guadagna un secondo momento da scoprire — *la parte invisibile funziona
solo se la nave cammina*.

**E c'è un secondo problema, indipendente.** L'89% è la cifra migliore del
settore presentata come normale: il riferimento commerciale è **60% o meglio**,
oltre il 90% è militare. Ora che il numero è *misurato*, la taratura di `K` e
`C₀` va scelta perché atterri fra **70% e 80%** alla velocità di servizio.
Altrimenti si è costruito un misuratore onesto puntato su un progetto ottimista.

## 5 — Le persone generate · **CONFERMATO**

Una figura umana a 3.000 facce senza texture è precisamente ciò che **non regge
in scala di grigi**: il collaudo finale che il documento stesso propone la
boccerebbe.

O sono **stilizzate per scelta** — e allora è una decisione di registro, da
prendere nella direzione artistica e non subire dal generatore — oppure non si
generano. Il resto dell'allestimento (divani, tavolini, casse, valvole) regge la
prova; le persone no.

## 6 — Tre padroni sullo stesso valore · **CONFERMATO**

`lamaZ` la scrivono lo scorrimento (Lenis + ScrollTrigger), il trascinamento, e
un `<input type="range">` vero. Il documento non dice chi vince quando due
parlano insieme. È la regola **«un nodo, un padrone»**, già costata quattro
difetti su un altro progetto.

Va nominato **un solo proprietario** — la posizione di scorrimento — e gli altri
due diventano scrittori *di quella*, non di `lamaZ`.

E una trappola vicina, dalla skill dello studio: con `scrub` la lama **insegue**
lo scroll. Il valore da leggere è quello del tween a ogni fotogramma, non la
posizione di scroll: *chi disegna è il tween, non il trigger*. L'accensione per
prossimità usa già `lamaZ`, che è corretto — va solo scritto perché resti così.

## 7 — Mentre qualcuno misura, nessuno scrive · **ACCOLTO**

Con venti agenti in parallelo il rischio di misurare contro un bersaglio che si
muove diventa certezza.

Vale anche qui, ed è successo **due volte in questa sessione**: una misura presa
su una scheda in secondo piano, dove Chrome non consegna `IntersectionObserver`,
stava per farmi correggere due difetti inesistenti; e un collaudo fatto su una
compilazione vecchia rimasta in cache ha prodotto un errore che diceva all'utente
«serve WebGL» mentre il guasto era un altro.

Nel contratto va scritto: **le misure si fanno su una build congelata**, e
mentre una misura è in corso nessuno scrive nei file che la pagina ricarica a caldo.

---

## Un dato da non propagare finché non è verificato

Il documento cita **Messenger 7,92** e **Messenger Usability 7,46**. Non li ho
verificati: ho letto direttamente solo la scheda di **Lando Norris — 8,18**, con
Design 8,12 · Usability 7,90 · Creativity 8,71 · Content 8,18 e la pagella DEV.

In questo repository è già successo tre volte che una cifra giusta viaggiasse
insieme a un dettaglio sbagliato. Prima di scrivere quei due numeri sul sito o
in un altro documento, si apre la scheda.

## Sul «quattro sistemi sono già un Site of the Day»

Sono un buon **candidato**. Il SOTD lo decidono Design e Usability — cioè le due
voci che questo documento, per ora, non specifica.
