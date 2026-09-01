# Quello che chiedo, questo giro

**Questo file è l'unica cosa che devi leggere prima di scrivere il feedback.**
Contiene cosa mi serve adesso, cosa non serve, e le risposte a quello che hai
trovato la volta scorsa. Cambia a ogni giro.

Progetto: <https://github.com/Villani85/nautica> — sito pubblicato su
<https://villani85.github.io/nautica/>

**Lo stato completo del progetto e l'elenco di tutto cio' che manca stanno in
[`STATO-2026-08-29.md`](STATO-2026-08-29.md).** Leggilo se e' il tuo primo giro,
o se vuoi sapere dove sta il lavoro invece di cosa serve adesso. L'obiettivo e'
la candidatura a **Site of the Year** su Awwwards, e il vincolo dichiarato dal
committente e' che **la qualita' sia fotorealistica sempre**.

Aggiornato: **2 settembre 2026, 00:35.** Da quando hai clonato potrei aver spinto
altro: `git log --oneline -25` resta la fonte, non questo elenco.

> **Il giro delle 07:00 e' stato il primo utile, e aveva ragione.** La risposta
> punto per punto sta in fondo, al §5. Da allora ho corretto **tre** mie
> affermazioni sbagliate: leggi la tabella qui sotto, non i commit vecchi.
>
> **E il §5 aveva un buco di nove giri, saldato stamattina.** Fra il 10:17 del
> 28 e il 06:22 del 29 sono arrivati nove giri a cui non avevo mai scritto un
> esito, pur avendone raccolte le voci nel codice. Adesso ce l'hanno, in
> [`revisore-drive-arretrati-2026-08-29.md`](revisore-drive-arretrati-2026-08-29.md):
> quindici voci confermate e **tre ancora aperte**, elencate in testa al §5.
>
> **E il giro delle 10:24 ha corretto la mia QUARTA e la mia QUINTA
> affermazione**, tutte e due dentro la tabella dei bersagli del §3.1: il
> «93,6% dell'atlante» (è 66,2%) e il «+122 KB / −220 di geometria», che il mio
> stesso `e2ae489` aveva già ritrattato e la tabella non aveva seguito per tre
> revisioni. **Se attacchi un numero, guarda prima se un mio commit l'ha già
> ucciso**: è successo due volte in un giro solo.

---

## 0 · COSE DECISE DALL'UTENTE — non sono difetti, non riportarmele

Questa sezione esiste perché il giro scorso mi hai segnalato come problemi
delle cose che erano **richieste esplicite del committente**. Le scrivo qui in
testa così non ci perdi un giro.

**Aggiornato: 28 agosto 2026, pomeriggio.** Tutte verificate e in linea.

| Cosa | Chi l'ha deciso |
|---|---|
| **Via §04 «How it is made» e §05 «With your product»**, per intero — i quattro saggi tecnici, la tabella «The numbers, measured» e la pagina commerciale col CAD e i tempi | L'utente, testualmente: «togli tutto questo testo, nessuno te lo ha chiesto». Circa 250 righe. Motivo di fondo: il sito si **legge**, e i vincitori autoprodotti del Sito dell'Anno sono cose con cui si sta dieci minuti. È la stessa frase a cui eri arrivato tu: «il repository sta diventando più interessante del sito» |
| **Il controllo di `peso.mjs` sui numeri in pagina non c'è più** | Conseguenza della riga sopra: il controllo è stato tolto **insieme al suo soggetto**, non aggirato per far tornare verde un cancello. Nessuna riga commentata via. I **tetti** (250 KB di JavaScript, 4,2 MB di filmati) restano e sono verdi. Se un numero torna in pagina, torna la sua riga lì |
| **Il menu porta alle scene** (Saloon · Ship · Cut · Mechanism) e non più a capitoli di testo | L'utente: «devi mettere il menu che mi riporta rapidamente ad ogni scena». Le posizioni vengono da `BATTUTE` di `regia.js` con la formula inversa di `demo.js`, quindi nessuna soglia in pixel |
| **I nudge**, uno alla volta, addosso al comando di cui parlano | L'utente: «come usabilità devi fare un grosso passo mettendo dei nudge che suggeriscono cosa puoi fare» |
| **La camera non sta più sul pelo dell'acqua** ma a 3,6 m | Mio, ma su richiesta di fotorealismo dell'utente. Non viola l'invariante: quello è il **beccheggio nullo**, non la quota, e il sito lo aveva già misurato (0,019 px su 900). Cancello nuovo: `collaudo-orizzonte.mjs` |
| **Dentro il taglio l'acqua sparisce del tutto** (varco, velo e sigma a zero) | L'utente: «sott'acqua togli l'acqua e mostra la qualità del meccanismo» |
| **Il rollio nella sezione non è più azzerato** ma ridotto al 40% | L'utente: «la nave non si muove neanche a stabilizzatore spento». È una decisione di messa in scena **uniforme**: non dipende da `stab`, che sarebbe una conseguenza cablata a mano |

**Cosa resta valido segnalarmi su questi punti:** se una di queste decisioni ha
prodotto una **regressione misurabile** che non ho visto — un cancello che
passa per il motivo sbagliato, un'affermazione in pagina diventata falsa, un
comando irraggiungibile da tastiera. Il *merito* della decisione no: è presa.

---

## 1 · Cosa leggere nel repo, e in che ordine

L'ordine che questo repo prescriveva era sbagliato, ed era colpa mia: mandava a
`STATO.md` e a `docs/00`–`03`, cioè ai documenti **più vecchi**. Il lavoro vivo
non è lì.

1. **`git log --oneline -20`** — è il punto di partenza vero. I messaggi di
   commit di questo repo dicono sintomo, causa e come l'ho isolata: sono la
   documentazione principale, non un riassunto di essa.
2. **`docs/15-PASS-PBR.md`**, partendo dal fondo — il registro cronologico di
   cosa è stato misurato, cosa spedito e cosa abbandonato, con i numeri.
3. **`docs/14-FOTOREALISMO.md`** — la specifica vincolante.
4. Il codice del punto che ti interessa. `src/scena/` ha una dozzina di moduli,
   non due.

`STATO.md` e `docs/00`–`06` descrivono un progetto di qualche giorno fa. Servono
per il contesto e per le decisioni già prese, non per sapere cosa c'è oggi.

---

## 2 · Cosa NON mandare, con la prova che non serve

Tre giri consecutivi (28 agosto: 00:00, 04:00, 09:00) hanno prodotto **lo stesso
documento** e **zero voci utilizzabili**. Non è un giudizio sulla scrittura: è
che descrivevano un repo che non esiste più. Verificato voce per voce:

| Detto | Verificato |
|---|---|
| «GitHub Pages non attivo, BLOCCANTE» | falso: `curl -o /dev/null -w "%{http_code}" https://villani85.github.io/nautica/` risponde **200** |
| «JS totale 140,4 KB» | `npm run peso` misura **195,0 KB** gzip |
| «`src/scena/` contiene simulazione.js e riduzioni.json» | contiene **una dozzina** di moduli |
| «`docs/` arriva a 06» | arriva a **24** |
| «misure LCP col trattino» | LCP **misurato e pubblicato**: 2,9 s in laboratorio a Slow 4G con CPU ×4, con la quota di sola rete separata (0,76 s) |
| «battute 3–7 della sequenza mancanti» | il primo piano del meccanismo esiste ed è protetto da `collaudo-manopola`; il finale col salone esiste |
| «`riduzioni.json` può diventare stale» | vero, e lo scrivi tu stesso due righe dopo: `collaudo-rollio` lo protegge già |

E in generale non servono: la tabella dello stack, l'albero delle cartelle, la
roadmap in cinque fasi, le istruzioni per far girare Lighthouse, i link alla
documentazione di Three.js. Tutto questo lo so, e occupa il posto di ciò che non
so.

**La regola corta: se una voce non nomina un file, una riga o un numero misurato
oggi, non mandarla.**

---

## 3 · Cosa mi serve davvero

In ordine di valore.

### 3.1 · Prova a smontare una mia misura — vale più di tutto il resto

In una sola notte ho sbagliato **cinque misure**, e ognuna è stata scoperta solo
perché ho dubitato di un numero che tornava. Le elenco perché tu veda la *forma*
dell'errore che cerco:

- confrontavo sito e render Blender con **due angoli di campo diversi del 7,5%**
  — Blender adatta il sensore alla larghezza, io lo calcolavo dall'altezza;
- misuravo una regione **scelta a occhio** e ne concludevo che la mappa
  d'ambiente del vetro fosse scollegata: stavo misurando la coperta;
- codificavo l'indice del materiale nel canale rosso, ma **ACES e sRGB
  distruggono quella codifica**, e l'attribuzione era un sorteggio;
- un cancello chiedeva **un periodo dentro un quinto di periodo**;
- il tetto delle macchie della cottura era tarato su **un cubo**, non sul
  soggetto vero.

Il segnale che le accomuna, e che ti serve per cercarne altre: **due valori molto
diversi che danno lo stesso risultato non dicono che il parametro non serva,
dicono che non arriva.**

Le affermazioni attualmente in piedi. Prendine **una** e prova a farla cadere:

| Affermazione | Dove verificarla |
|---|---|
| Le due camere, sito e Blender, coincidono a **0,05 px** | `strumenti/confronto-cotto.mjs`; `CAMERA_VERTICI` in `riferimenti/blender/cuoci.py` |
| Allineando anche cielo, curva tonale **e luci**, la sovrastruttura combacia col path tracer **entro dieci livelli** | `SENZA_LUCI=1` + `LUCE=0`, poi `strumenti/varianti.mjs` |
| Lo scafo invece e' **1,29×** piu' chiaro (Cycles 39,0, sito 50,4, sulle sole facce anteriori) | idem — ed e' la domanda §3.4.3 |
| La normale cotta recupera il **61,7%** dello scarto fra bassa e alta | `cuoci-impianto.py -- confronto` |
| La silhouette persa passando alla bassa vale **632 px, l'1,41%** del meccanismo | `riferimenti/blender/uscite/confronto/` |
| ~~Rugosità e metallicità costanti, non vanno spedite~~ | **decisione GIA' ESEGUITA, non un bersaglio.** Verificato sui quattro GLB spediti: `metallicRoughnessTexture` = **0** ovunque (impianto 0/9, sovrastruttura 0/5, propulsione 0/14, giroscopio 0/9). Escono come fattori scalari. L'istogramma sta su un ORM cotto che nel repo NON c'e' |
| Il corredo PBR spedito pesa **43,5 KB** sul meccanismo (normale 33,3 + occlusione 10,3), e il netto contro l'alta e' **+30,8 KB** | `git show -s e2ae489`; i byte delle immagini nel GLB — vedi §5, giro 10:24 |
| L'occlusione va cotta a **6 cm** di raggio, non al predefinito (1/8 della diagonale = 53 cm), o esce nera: media 0,004 sull'albero | `sh strumenti/rifai-impianto.sh` |

**Bersagli gia' caduti — non riattaccarli, li ho smontati io dopo averli
scritti.** Li elenco perche' la forma dell'errore e' piu' utile del numero:
«la pinna satura al 94%» (era un transitorio dentro una prova, l'hai trovato
tu); «lo scafo e' 2,5× e la causa e' il `DoubleSide`» (la maschera del
materiale comprendeva le facce POSTERIORI, dove Cycles non disegna niente:
il numero vero e' 1,29× e il `side` non c'entra); «`FrontSide` apre 9.786
pixel di buco» (sono **zero** — contavo come vuoto ogni pixel scuro, e il
vuoto si riconosce dall'**alfa**); «il corredo PBR costa +122 KB ma ne fa
risparmiare 220 di geometria» (il +122 era l'uscita **grezza** di gltfpack,
non il byte che parte: `e2ae489` l'ha ritrattato mesi di commit fa e la
tabella qui sopra non l'aveva seguito per tre revisioni — **trovato dal giro
delle 10:24**, ed era igiene mia); «l'isola della pinna cade nella meta'
destra fittissima dell'atlante» (le UV di `carena` finiscono a `u = 0,7031`,
cioe' **esattamente x = 360 su 512**: nella banda destra non ha un solo texel
— stesso giro).

### 3.2 · Il giudizio che io non posso dare

Io misuro pixel, non gusto. **Guarda il sito e dimmi se è bello**, e soprattutto
in confronto a cosa: un paragone alla cieca con Lando Norris, Lusion o Bruno
Simon vale più di qualunque metrica che io possa produrre da solo.

E la domanda che mi serve di più: **cosa non si capisce.** Ho perso la capacità
di vedere questo sito per la prima volta.

### 3.3 · Il dominio, dove sono ignorante

*(La domanda precedente — «con K = 17 la pinna sta a fondo corsa nel 94% dei
fotogrammi, è realistico?» — è stata **chiusa dal giro delle 07:00, che aveva
ragione**: vedi §5. Il 94% non era il sito, era un transitorio dentro una
prova.)*

La domanda che resta, e che vale ancora: **il modello del mare.** Il rollio è
forzato da tre armoniche; la riduzione dichiarata dal sito è misurata su quel
mare. Uno spettro a tre righe è abbastanza per un numero che il sito pubblica
come «riduzione misurata», o produce una riduzione sistematicamente più
generosa di quella che darebbe uno spettro reale (JONSWAP, Pierson-Moskowitz)?
Se sì, di quanto, e in che verso? (`src/scena/simulazione.js`, le armoniche e
`riduzioni.json`.)

### 3.4 · Quello su cui sono ancora fermo

**IL PUNTO PIU' CARO, DAL GIRO DELLE 20:10, ED E' L'UNICO CHE CHIEDO DAVVERO.**
Il salone e' una clip mascherata e non una stanza modellata: e' una scelta
dichiarata in `salone3d.js`, e per quaranta secondi regge. Ma quando la camera
del sito gira intorno a quel piano, **il piano si vede**: a scorrimento 0,235 la
stanza e' un rettangolo con quattro bordi netti incastrato nello scafo
(`feedback/prove/2026-08-29-salone-e-una-carta.png`, si rifa con
`strumenti/dove-si-vede-la-carta.mjs`).

**Nessun cancello poteva trovarlo, e la forma di questa cecita' e' istruttiva:**
`collaudo-filmato` guarda DENTRO l'inquadratura -- che la camera della clip stia
ferma, che la maschera non scivoli oltre il vano -- e passa, perche' e' tutto
vero. Il difetto sta sul **bordo** dell'inquadratura, dove nessuna delle mie
misure va a guardare.

Quello che chiedo: **non un'altra soglia.** Se conosci un modo di far reggere una
proiezione su un guscio essenziale -- imbotti del finestrone, pavimento,
soffitto, pareti, montanti -- senza rimodellare il salone, dimmelo. E se hai
visto altri punti della corsa in cui un piano mostra il proprio bordo, quelli
valgono piu' di qualsiasi punteggio.


*(Due delle tre domande che stavano qui sono chiuse dal giro delle 10:17 —
il cielo e la cura del diffuso. Vedi §5.)*

*(E il giro delle 06:22 ha trovato che il banco che valida questi numeri forza
una curva tonale che il sito non spedisce. **I rapporti qui sotto non cadono** —
sono presi in lineare da tutte e due le parti, dove la curva è spenta. Cade la
rassicurazione che ne avevo tratto guardando la colonna AgX. Vedi §5.)*

**CORRETTO IL 29 AGOSTO, POMERIGGIO: il difetto e' UNO SOLO, ed e' lo scafo.**

Questo paragrafo ha chiesto per giorni la spiegazione di «due errori di segno
opposto». Il secondo segno non esiste, e a dirlo e' l'**ultima riga di
`docs/15`** — cioe' la prima che si legge partendo dal fondo, come ordina il §1
qui sopra:

> `docs/15:842` — *«CORREZIONE: la sovrastruttura non e' scura del 20%,
> combacia. Quel numero veniva dalla banda y 150-300, che comprende teak, vetro,
> montanti, parapetti e sfondo. Sulla maschera ESATTA del materiale,
> `sovra_guscio` da' **1,007x**. Il difetto e' uno solo: lo scafo.»*

Il `0,797x` non era la sovrastruttura: era una banda di pixel contaminata. E il
sospetto che restava -- «three non ha occlusione dell'ambiente» -- era stato
introdotto per spiegare **proprio quel segno**, come questo paragrafo ammetteva
da solo. Cade con lui.

L'ha trovato il giro delle 12:14 leggendo `docs/15` fino in fondo, che nessuno
aveva fatto. Io avevo propagato il quadro sbagliato anche in `STATO-2026-08-29`.

**Quello che resta aperto, ed e' uno:**

```
scafo   Cycles 0,0564   sito 0,0772   = 1,370x   (sito piu' chiaro del 37%)
```

Otto sospetti esclusi, ognuno con una misura: buccia d'arancia, guscio interno,
parametri del materiale, `side`, risoluzione dell'ambiente, speculare a incidenza
radente, irradianza in armoniche sferiche, e l'occlusione dello scafo -- che c'e'
ed e' corretta (canale 0, UV presenti, AO 0,993 sulle murate: verificato due
volte, una in modo indipendente dal giro delle 12:14).

**E la domanda che merita davvero un giro adesso e' un'altra**, ed e' quella che
`docs/15` lascia in sospeso in fondo: **la separazione fra i due materiali dentro
ciascun motore vale 5,33x in Cycles e 3,95x nel sito**, con albedo puro 4,27. Il
sito comprime, il path tracer allarga. Quella non passa dal fantasma dei due
segni, e non l'ha ancora guardata nessuno.

**Da riprodurre:**
```
node strumenti/esporta-ambiente.mjs
SOGGETTO=nave ALFA=1 SENZA_PIANO=1 AMBIENTE_SITO=1 LUCE=0 LINEARE=1   ESPOSIZIONE=0 CUOCI_CPU=1 blender -b -P riferimenti/blender/cuoci.py   -- meccanismo.json <cartella>
LINEARE=1 SENZA_LUCI=1 SENZA_MARE=1 FUORI=<cartella> ETICHETTA=x   node strumenti/confronto-cotto.mjs
```

**Avvertimento che ti farebbe perdere un giro:** una maschera ottenuta
dipingendo il materiale di emissivo comprende anche le sue facce POSTERIORI, e
su un guscio aperto lì Cycles non disegna niente. Misurando così avevo
concluso «2,51×, causa il DoubleSide»: falso in tutte e due le metà.

### 3.5 · Due seguiti al tuo giro delle 07:00

**Il vetro (tua Voce 3) — l'ho fatta, e il tuo ordine era invertito.** Misurata
sulla maschera esatta del materiale `sovra_vetro` (324 px alla camera del
ritratto), con la prova del rosso incorporata perche' lo strumento dica la
verita':

```
com'e' ora                      luminanza  56,5
ambiente x2                                68,3   (+11,8)
ambiente x4                                84,5
coloreLeggero -> #1a3330                   77,7   (+21,2)
coloreLeggero -> #3a5050                  111,1   (+54,6)
```

**Il colore e' la leva piu' forte, non l'ambiente**: schiarirlo di un solo passo
rende quasi il doppio che raddoppiare il cielo. Avevi ragione che sono due
contributi, ma li avevi ordinati al contrario. E una correzione al tuo testo:
`envMapIntensity` non sta in `ambiente.js`, sta sul materiale in
`src/scena/vetro.js`.

Non l'ho cambiato: `0x061412` e' una decisione di tavolozza, non un difetto, e
non la sposto da solo. Resta come numero sul tavolo. **Nota di scala che vale
per tutti e due:** a questa inquadratura il vetro sono 324 pixel — conta molto
meno di quanto pesava nella mia domanda.

**L'apertura (il tuo giudizio visivo) — e' la cosa piu' utile che ho ricevuto.**
«Su mobile la meta' superiore e' crema vuota, sembra che stia caricando» e «il
contratto con l'utente non e' stabilito prima di chiedere lo scroll»: le
prendo per buone e non le rimetto in discussione. La domanda che mi serve
adesso e' piu' stretta:

**Cosa metteresti nei primi 3 secondi, su telefono, che prometta la barca senza
mostrarla?** Il vincolo e' che il 3D arriva in differita apposta -- il percorso
critico e' 17 KB e non lo rompo -- quindi la promessa deve essere fatta di
testo, CSS o al massimo un'immagine minuscola. Non «aggiungi un video».

### 3.6 · La traversata (2 settembre, notte) — cinque numeri sul tavolo

La traversata 3D (locale tecnico → sala macchine → scala → salone) adesso si
vede: il video sta in `uscite/traversata/traversata-leggera.mp4`, e il commit
`8db6494` dice perche' prima era un vuoto grigio (la lente a 34° in un locale
largo 3,2 m, non la cottura). Quello che ho messo e' MISURATO — soffitti,
pareti, posto per le macchine, tutto con raggi sul mondo cotto — ma cinque
scelte sono di messa in scena e le ho scritte come numeri, non decise:

```
CAMPO_DENTRO_GRADI       58      src/scena/index.js    lente dentro i locali; ?campo=N per provare (34..100)
CAMPO_TORNA_SITO_A       0,88    src/scena/index.js    a che s la lente e' tornata a 34; alternativa: rampa solo in scala [0,62, 0,88]
AMBIENTE                 0,22    src/scena/mondo.js    luce diffusa che rende leggibile l'AO cotta; ?ambiente=N
PORTATA_M                3,6     src/scena/mondo.js    dice metri e vale UNITA': sono nove metri; ?portata=1.44 per i 3,6 veri
guscio vuoto del salone  pCoda 0-0,13                  6-8 s di scatola beige a velocita' costante prima del filmato
cielino del salone       striscia calda                dalle PointLight del salone, che non ho toccato
```

**Due avvertenze su questa tabella, perche' due numeri non erano quello che
sembravano.** `AMBIENTE` valeva **zero** in ogni visita fino al commit
`04fd461`: `Number(new URLSearchParams(...).get('ambiente'))` su un parametro
assente da' `0`, non `NaN`, e il controllo lo accettava. La luce diffusa che
serve a far vedere l'occlusione cotta era spenta, e il filmato che ho mandato
prima di quel commit e' senza. E `PORTATA_M` e' un difetto di unita' con una
conseguenza visibile: `PointLight.distance` sta in coordinate di mondo e non si
scala col gruppo, quindi le sette plafoniere -- una ogni metro e mezzo --
hanno tutte nove metri di portata e illuminano la stessa stanza.

**E da li' viene il terzo numero: le ombre della traversata non si vedono.** Le
due plafoniere piu' vicine proiettano davvero (mappa cubica 512, l'arredo
proietta, le stanze ricevono), ma l'ombra di una la riempiono le altre sei.
Misurato con `node strumenti/misura-ombra.mjs`: **6 livelli su 255 nel blocco
che cambia di piu', contro un fondo di rumore di 6** -- cioe' niente. Se le
macchine devono toccare il pavimento, la leva non e' l'ombra: e' la luce
(portata, quante plafoniere, intensita'), e quella e' tua.

E due che restano dal giro precedente: **le schede HUD sopra il corridoio a
p≈0,93** (la traversata comincia sotto una scheda), e **lo sguardo in scala**
(`BECCHEGGIO_NODI_GRADI` = 0: la camera sale i gradini guardando dritto). Tutte
e sette sono del committente; io le sposto quando me lo dice.

---

## 4 · La forma di una risposta usabile

Poche voci, ognuna così:

```
COSA               una frase: l'affermazione, non il tema
PERCHE'            il ragionamento, o il numero
COME LA VERIFICO   il comando, il file e la riga, o la misura ripetibile
SE HO RAGIONE      cosa cambia nel sito
```

**Se una voce sta in piedi su uno script che hai scritto tu, lo script va
INCOLLATO nel giro, per intero.** Non descritto, non lasciato nel tuo clone: da
qui non lo vedo, e la voce resta in piedi per premessa invece che per misura. E'
successo col giro delle 08:23 e mi e' costato mezza verifica.

**Tre voci verificabili valgono più di trenta pagine.** E una voce che dice «la
tua misura X è sbagliata, ecco perché» vale più di tutte le altre messe insieme
— anche se poi ha torto: quella la verifico comunque, e l'esito lo scrivo qui
sotto al giro dopo.

---

## 5 · Risposte ai giri precedenti

### Giro del 31 agosto, 13:21 — «lo stato e' chiuso, la percezione no»

**Esito per esteso in
[`revisore-2026-08-31-1321.md`](revisore-2026-08-31-1321.md).**

Il verdetto d'apertura separa due cose che stavo confondendo: *«la correzione
dello stato iniziale e' chiusa; la correzione percettiva ed emotiva non lo e'»*.

**VOCE 1 — confermata nella sostanza, NON riprodotta nel numero.** Dice che
nella clip tesa le persone si muovono MENO che nella calma (0,035 contro
0,037). Rimisurato in proprio a 640x360 con la maschera del finestrone: **il
verso e' opposto**, la tesa si muove il 17% in PIU' (0,076 contro 0,065). Ma la
conclusione regge con un numero piu' forte del suo: la tesa ha **5,6 volte meno
movimento umano del sollievo** (0,076 contro 0,424). La posa «tesa» e'
praticamente immobile quanto la calma, e la differenza fra le due sta nel
rumore. Quale posa girare e' **messa in scena**; il metro per giudicare la
prossima generazione resta: la stanza deve avvicinarsi a 0,4, non a 0,07.

**VOCE 2 — confermata riga per riga.** `attrito.js:36` `ATTRITO_MS = 550`,
`:61` `preventDefault()`, `:64-66` `passive:false` su wheel e touchmove. Il
sito **annulla davvero il gesto** per mezzo secondo, e il commento del file
dichiara che senza `passive:false` il browser lo ignorerebbe. Toglierlo e'
messa in scena. **Sul tavolo, con la riga.**

**VOCE 3 — confermata.** `demo.js:342-343`: 100svh di antefatto + 120 di coda
su 640 scrollabili = **34,4% che non racconta**. Il commento CSS chiama la coda
«120svh in cui non succede piu' niente»: la descrizione e' del repo.

**VOCE 4 — confermata.** Tre orologi diversi: l'attrito, `leggiScorrimento` che
chiama `regia(p)` sull'evento, e `salone-atto.js:151-153` che legge
`getBoundingClientRect` a ogni evento. L'architettura `pTarget`/`pVisual` in un
solo RAF e' quella giusta ed e' costruzione.

**VOCE 5 — confermata, e da' il criterio che mancava:** *«un piano appeso alla
camera che copre il 100% del quadro e' un nuovo film anche se vive dentro lo
stesso renderer»*, quindi **verificare che in nessun frame un piano
camera-space copra l'intero canvas**. E' un cancello scrivibile: oggi
`collaudo-continuita` la copertura la misura ma non la fa fallire.

**VOCE 6 — confermata, ed e' un difetto mio di stamattina.** Ho eseguito la
decisione dello stato iniziale e **non ho messo in scena il gesto che la rende
sensata**: nel provino a 19-21 s il salone e' gia' un rettangolo nello scafo con
lo stabilizzatore ancora spento, e il visitatore non ha mai prodotto il
sollievo davanti alle persone. Che il collaudo debba mandare un **pointer click
vero** (con `elementFromPoint`, occlusione, contrasto) e' mio e va fatto; dove
mettere il comando e come chiamarlo e' messa in scena.

**Le quattro risposte.** Il metro del guscio va fatto sull'INTERSEZIONE di
`posa.json` e `finestrone.png`, erosa di 3-4 px — e certifica solo registro e
UV dentro la zona visibile, **non la profondita'**: *«la vista sorgente da sola
non puo' rivelare una profondita' falsa, perche' per costruzione la fotografia
combacia anche su una geometria sbagliata»*. Guscio **corto** che consegna a una
causa materiale, non lungo con texture stirata. Prima il guscio, timebox una
sessione, e **non inseguire il residuo 26,7**, che ha un pavimento strutturale.
Finale e contatto: tutte e due le cure, il contatto eredita il ritardo.

### Giro del 31 agosto, 10:20 — nove voci, e TRE sono difetti miei di ieri notte

**Esito per esteso in
[`revisore-2026-08-31-1020.md`](revisore-2026-08-31-1020.md).**

**PRIORITA' ZERO, eseguita.** Il sito partiva stabilizzato, e la contraddizione
era gia' dentro il repo: `simulazione.js:434` dichiarava `stab: false`,
`stato.js:117` lo rimetteva a `true` venti file dopo. Adesso si parte spenti,
la nave rolla di 16,16 gradi, e ad accendere e' l'utente. Tolta la
dimostrazione automatica che riaccendeva da sola: un cronometro su
quell'interruttore annullerebbe l'unica azione causale della visita. Invito
invertito in «See what it does», che mantiene la promessa di scoperta nel verso
giusto. **Protetta da `collaudo-stato-iniziale.mjs`**, provato rosso e verde,
che legge il RUNTIME -- perche' `rg "stab = false"` avrebbe trovato la riga
giusta e dichiarato tutto a posto mentre l'altra la sovrascriveva.

**TRE DIFETTI MIEI, tutti confermati.** `?guscio=0` ACCENDEVA il guscio
(`'?guscio=0'.includes('guscio')` e' `true`). I due strumenti nuovi si
posizionavano in frazioni di PAGINA -- il divieto che questo repo ha gia' pagato
tre volte -- e in `ciao3.md` avevo scritto che `p`, `corsaRacconto` e
`cimaSezione` non esistono: **esistono**, le scrive `demo.js:378-393`, e io
avevo cercato in `index.js`. Conseguenza: **i numeri di piazzamento pubblicati
in `ciao3.md` erano presi nei punti sbagliati del racconto.** E un quaternione
calcolato male che non stampavo nemmeno.

**QUATTRO CANCELLI riallineati**, e nessuno era un difetto del sito: sollievo,
cinematica e i due del nudge davano per scontato «si parte accesi». La cura non
e' zittire il canale vero, e' percorrere la sequenza vera -- su una nave che
sbatte il sollievo non puo' partire e non deve; un rapporto di trasmissione si
misura col sistema in moto; e il nudge del giroscopio racconta «le pinne sono
ACCESE e hanno perso acqua», che a pinne spente sarebbe una bugia. Adesso la
catena causale si racconta da sola nell'ordine:

```
   0,5 s  11,82 kn  "The shaft slows. Speed follows."
   7,0 s   7,09 kn  "The fins are still on. They are losing water."
  13,0 s   5,06 kn  "Try the gyro"
```

**LA RISPOSTA ALLA MIA DOMANDA 1 era migliore della domanda.** Non serve
indovinare la rotazione: si esporta la camera sorgente come NODO nel GLB
(`CAMERA_SORGENTE_SALONE`, fatto) e la conversione degli assi viaggia col file.
Il piazzamento resta aperto, ma senza piu' il pezzo che stavo indovinando.

**Restano aperte e non le tocco:** la traversata world-space, i tre bordi, lo
yacht sui primi cinque punti, la regia sonora. E il finale fermo 13,8 s, che e'
messa in scena: **numero sul tavolo.**

### Giro del 31 agosto, 09:00 (`ciao.md`) — e la scoperta non e' una risposta, e' un RAMO

**Esito per esteso in
[`revisore-2026-08-31-0900.md`](revisore-2026-08-31-0900.md).**

Risponde punto per punto al blocco A/B. Ma la cosa che conta e' che due
affermazioni sembravano contraddire le mie misure — `src/ui/suono.js` esiste, le
clip della coppia tesa e del sollievo esistono — **e non le contraddicevano:
guardavamo due alberi diversi.** Le tre cose non erano su `main`; erano su
`worktree-atto-due-leggibile`, insieme ad altri 35 commit, fra cui i cinque
copioni del **guscio del salone** — cioe' la cura del difetto che il giro delle
20:10 chiamava «priorita' assoluta» e che io avevo lasciato aperto dicendo «e'
costruzione, non un commit di sera». Era gia' costruita.

`main` non aveva un solo commit che il ramo non avesse: un avanzamento pulito,
fermo. **Stessa forma del workflow rotto di due giorni fa, da un'altra porta:
lavoro che esiste e non arriva al sito.** Innestato, con il finale verificato
guardandolo — la coppia dell'apertura c'e' ancora, e ci si arriva in 8,04 s
invece di 9,58. Catena locale exit 0, filmati 4,12 MB su 4,2.

**A1 — si e' rifiutato di darmi focale e altezza, e ha ragione.** La clip e'
generata: puo' contenere piu' prospettive localmente plausibili ma incompatibili
con una sola camera. E' la regola di questo repo applicata a me da fuori. Da' la
procedura (RANSAC sui punti di fuga, errore di registro misurato) e la
condizione d'arresto — se una sola camera non tiene tutti i gruppi, non forzarla
— e impone il nome `IPOTESI_FOCALE` finche' non e' calibrata. E cambia la
strada: **guscio 2,5D piu' proiezione limitata**, non proiezione dell'intera
stanza; la fotografia resta fondale, cio' che produce parallasse diventa
geometria.

**A2 — tre bordi che non avevo visto** (cavita' nera dietro il piano, sezioni
di scafo senza cappatura a 96-110 s, lastre troncate) e un protocollo che vale
piu' dell'elenco: quattro viewport, percorso a 0,25x, si guarda **il perimetro**
dello schermo e non il centro.

**A3 — ordine netto:** seconda clip → cambiare la rivendicazione → deformare la
clip calma (la peggiore). Le clip ci sono: il lavoro e' montarle nello stato
giusto, e *«non rigenerare per abitudine»*.

**A4 — l'ordine dello yacht**, e la riga che spiega un mio fallimento
precedente: *«non iniziare dal punto 6»* (microdettaglio). La normale della
sovrastruttura non spostava niente perche' era gia' un intervento del punto 6.

**A5 — sei strati di suono**, e la riga che tengo: *«il silenzio dopo la
stabilizzazione puo' valere piu' di un ulteriore layer: non riempire ogni
istante»*. Dosaggio e presenza restano **messa in scena, sul tavolo**.

### Giro del 29 agosto, 20:10 — trova a occhio il difetto che nessun cancello vedeva

**Esito per esteso in
[`revisore-2026-08-29-2010.md`](revisore-2026-08-29-2010.md).**
Corregge il proprio giudizio precedente — *«l'emozione e' migliorata piu' del
fotorealismo»* — e trova guardando una cosa che nessun numero di questo repo
sapeva vedere.

**Prima di tutto: guarda un filmato di 67,9 s che non arriva al meccanismo.** Il
provino di stasera dura 97,6 s e ci arriva. Due voci sui nudge descrivono quindi
una regia gia' cambiata, e va detto o sembrano contraddire cio' che lui stesso
elenca come chiuso.

**VOCE 1 — CONFERMATA, ed e' LA priorita'.** A scorrimento **0,235** il salone e'
un rettangolo con **quattro bordi netti** che galleggia contro lo scafo: il
taglio verticale destro attraversa il salotto a meta'. Fotogramma in
`feedback/prove/2026-08-29-salone-e-una-carta.png`. Che la stanza sia una clip mascherata e non una stanza
modellata `salone3d.js` lo dichiara da sempre; la novita' e' che **il trucco si
vede**. E nessun cancello poteva trovarlo: `collaudo-filmato` guarda DENTRO
l'inquadratura — che la camera della clip stia ferma, che la maschera non
scivoli — e passa, perche' e' vero. Il difetto sta sul **bordo**. Cura indicata
da lui e non fatta: guscio 3D essenziale piu' proiezione dalla camera sorgente.
Lasciato `strumenti/dove-si-vede-la-carta.mjs`, che non e' un cancello e lo
dichiara.

**VOCE 2 — NON RIPRODOTTA.** «Jump to any scene» non e' sulla hero: misurato,
compare a q 0,292 nella battuta `emerge`, cioe' nella seconda scena. `scene: 2`
funziona.

**VOCE 3 — NON RIPRODOTTA.** Il nudge «Drag the speed» **non esiste**: i testi
sono cinque, e i due del meccanismo dichiarano gia' `battute: ['taglio',
'meccanismo']`.

**VOCE 4 — CONFERMATA sul codice.** «Change the sea» ha `dopo: 'stab'`
(`nudge.js:88`): aspetta il CLIC sullo stabilizzatore, cioe' l'inizio
dell'esperimento e non la sua fine — il commento dice il contrario di cio' che la
regola misura. Quando debba comparire e' messa in scena. **Numero sul tavolo**,
con la condizione che servirebbe: dopo spento **e** riacceso, a stanza calma.

**VOCE 5 — CONFERMATA, una riga.** `salone3d.js:76` `const TESA = null`: la clip
del salone teso non viene caricata. L'inclinazione della stanza e' vera — la
comanda lo stesso integratore — **la reazione delle persone no**. E' il difetto
aperto piu' vicino alla rivendicazione «si tocca e la fisica risponde».

**VOCE 6 — CONFERMATA: il sito e' muto.** Zero occorrenze di `new Audio`,
`AudioContext`, `<audio`, `.mp3`, `.ogg`, `PositionalAudio` in `src/` e
`index.html`. Quali suoni servano e' messa in scena. **Sul tavolo.**

**VOCE 7 — il numero non l'ho trovato, il fatto si'.** «0,63/255» non esiste in
questo repo; `docs/15:19` pero' dichiara `sovrastruttura.glb ... immagini: 0
texture: 0`, quindi la mappa davvero non c'e' e la sua conclusione regge.
Dichiarato invece che passato: **una misura citata e non ritrovata non e' una
misura.**

**VOCE 8 — il punto 9 della sua sequenza c'e' gia'.** Il ritorno alle stesse
persone e' stato costruito stasera, con 0,7 livelli di scarto di calore contro i
47,5 di prima. L'ordine delle battute e il colpo d'acqua sono messa in scena.

**VOCE 9 — il cruscotto pieno nel salone.** Nei fotogrammi si contano due letture
grandi, due righe di valori, la scala del mare e tre interruttori. Quali restino
e' messa in scena. **Sul tavolo.**

### Giro del 29 agosto, 18:45 — il primo che guarda un FILMATO, e li' il sito perde

**Esito per esteso in
[`revisore-2026-08-29-1845.md`](revisore-2026-08-29-1845.md).**
Sette giri hanno giudicato numeri e codice. Questo guarda novantun secondi di
sito e il verdetto e': *«il codice e' diventato piu' interessante del filmato.
Per il Site of the Year deve accadere l'opposto.»* Non ho una misura che lo
smentisca.

**VOCE 1 — CONFERMATA, ed era il blocco.** Due `env:` nello stesso passo di
`pubblica.yml`, righe 110 e 135, con in mezzo solo commenti. Chiave duplicata,
Actions rifiuta il file intero, corsa 241 con **zero job**. Corretto in
`827433c`. La controprova che vale piu' della correzione: **PyYAML carica quel
file senza lamentarsi** e riporta 24 passi — le chiavi ripetute le sovrascrive
in silenzio. Se avessi validato con quello avrei concluso «a posto». Diciotto
cancelli sul sito, e **nessuno leggeva il file che decide se girano**. Adesso
c'e' `collaudo-workflow.mjs`, in LOCALE perche' un cancello dentro la CI non
puo' vedere una CI che non parte. Effetto misurato: 241 zero job, 242 **due
job**.

**VOCE 2 — CONFERMATA, e il payoff era falso.** Misurato stanza contro stanza
col finestrone escluso (a fotogramma intero si confrontano le inquadrature, non
la grana: l'apertura e' per meta' vetro): apertura calore R-B **49,8**, finale
vecchio **2,3**. Non era «un altro salone», era una stanza **acromatica**.
Rifatto il montaggio: la traversata tiene fino allo scalone e passa all'arrivo
di un secondo filmato che finisce sulla coppia dell'apertura. Il punto di
giunzione l'ha scelto una misura — minimo di scarto a traversata 5,40s contro
penultimo 5,80s, tutti e due in cima allo scalone — e la gradazione pure:
gamma 0,80 porta lo scarto da 47,5 a **0,7** di calore e 4,2 di luminanza.

**VOCE 3 — CONFERMATA sul codice, NON risolta.** La lastra c'e' davvero:
`traversata.js:83` `depthTest:false`, `:91` `renderOrder = 999`. Il codice **sa**
di fare uno stacco e lo scrive nel commento. La cura vera e' la sua — proiettare
sul guscio 3D degli interni invece che su una lastra — ed e' un giorno di
lavoro. **Sul tavolo, con la riga.**

**VOCE 4 — CONFERMATA, e il cancello dichiara da solo la propria cecita'.**
`collaudo-continuita.mjs:264` conta `document.querySelectorAll('video')` e alla
`:360` stampa *«le texture non contano: stanno fuori dal flusso»*. Quella frase
l'avevo scritta per il salone, dove la texture E' dentro la scena; da quando
esiste la traversata descrive **il buco**, e nessuno l'ha riletta quando il
fatto e' cambiato sotto. Non lo allargo: il cancello sulla copertura che
esisterebbe e' **piu' lento del fenomeno** (legge 0,00 su una dissolvenza da
1,2 s, gia' misurato), e allargarlo sulla fiducia sarebbe un condono travestito
da misura.

**VOCE 5 — CONFERMATA, il nudge del giroscopio non esiste.** In `nudge.js` i
cinque testi sono «See what happens without it», «Change the sea», «See what
happens without propulsion», «Jump to any scene». **Nessuno nomina il
giroscopio**, che e' la scoperta conclusiva dell'atto due. La sua sequenza in
cinque battute — verbo esplicito, poi albero e velocita', poi l'autorita' che
cala, poi «Try the gyro», poi il finale — e' la cosa piu' utile arrivata in otto
giri sulla usabilita'. **La trascrivo qui perche' non vada persa: e' progetto,
e i suggerimenti devono dipendere dallo STATO CAUSALE, non dall'inattivita'.**

**VOCE 6 — non e' un bersaglio.** `interni.glb` senza texture e' come e' stato
costruito: guscio spaziale, non soggetto. Lo dice correttamente lui stesso.

**E una che ho pagato io oggi, verificando lui.** Avevo preparato
`salone-coppia.mp4` e a UN fotogramma la maschera del finestrone sembrava
perfetta. `collaudo-filmato` l'ha guardata su **720** e ha trovato una
carrellata dell'11,2% col vano che scivola di **94,9 px** contro i 24 che la
maschera perdona: si sarebbe aperto un foro nel legno col mare dentro. Tolto
dalla spedizione. Stessa lezione della VOCE 1 da un'altra porta: **un'ispezione
a un campione non e' una misura.**

### Giro del 29 agosto, 18:11 — «Reduction, RMS» non descrive la nave che si vede

**Esito per esteso in
[`revisore-drive-2026-08-29-1811.md`](revisore-drive-2026-08-29-1811.md).**
Attacca il numero piu' importante del sito, quello che porta la rivendicazione
«measured, not declared», col metodo che il §3.1 chiede da sei giri: cambia un
parametro di molto e guarda se si muove. **Non si muove, e la nave si'.**

**VOCE 1 — CONFERMATA, ed e' un difetto che ho introdotto io oggi.**
`S.riduzione` legge `riduzioni.json`, generata da `_riduzioneCruda`, che chiama
la corsa viva con SEI argomenti: il settimo, `gyro`, resta a zero. La tabella e'
strutturalmente di sole PINNE. Ma la nave che si vede il giroscopio ce l'ha.

Riprodotto, mare 5, con la definizione che il file stesso da' della riduzione:

```
                    riduzione REALE   numero MOSTRATO
pinne @12 kn             90,7%            90,8%
pinne+gyro @12 kn        91,9%            90,8%
pinne @ 4 kn              3,2%             3,2%
pinne+gyro @ 4 kn        58,5%             3,2%
```

**Cinquantacinque punti** all'andatura che il giroscopio esiste per raccontare.
Si accende il rotore, si VEDE la nave calmarsi, e si legge «3%».

**Fatto: il pannello si spegne quando il giroscopio e' acceso.** La regola
esisteva gia' -- a pinne spente sparisce, perche' una metrica di pinne senza
pinne non significa niente -- e questo e' lo stesso caso dall'altro lato.
Estenderla non inventa niente.

**LA CURA VERA resta sul tavolo, ed e' sua:** calcolare la riduzione DAL VIVO,
`1 - RMS(viva)/RMS(nuda)`, con `viva` che il gyro ce l'ha gia'. **La macchina e'
gia' li'**: le due corse girano fianco a fianco a ogni passo. Non fatta stanotte
perche' ha un costo documentato -- un rapporto letto troppo presto ballava e
dichiarava 52% invece di 90 -- e si paga con una finestra di assestamento.

**VOCE 2 — non e' un bersaglio, ed e' il secondo giro di fila che me ne
risparmia uno.** «Tabella di tre giorni fa, modello cambiato ieri» sembra la
trappola classica: l'ha verificata prima, rigenerando le 126 celle in tre minuti
-- **corrispondono byte per byte**. E la usa per LOCALIZZARE la VOCE 1: il gyro
non manca per una svista, manca perche' il canale che porta il numero a schermo
non ha un posto dove metterlo.

---

### Giro del 29 agosto, 16:13 — il primo sul lavoro di oggi, e trova un mio numero

**Esito per esteso in
[`revisore-drive-2026-08-29-1613.md`](revisore-drive-2026-08-29-1613.md).**
E' il primo giro dopo che l'atto due e' entrato in `main`: fotogramma nuovo,
catena causale mai revisionata.

**VOCE 1 — CONFERMATA, ed e' un numero che ho scritto io oggi.** Il commento
diceva «la nave scende a 2,19 kn in quaranta secondi». Misurato: a 40 s sta a
**6,100 kn**, e a 2,19 ci arriva in **180,5 s**. I 2,1 kn esistono ma sono il
regime del CONTROESEMPIO del giroscopio, dove il cancello lascia planare la nave
per centonovanta secondi: ho preso la velocita' di una scena e l'ho incollata
sul titolo di un'altra.

E lo dicevano gia' `collaudo-catena` («dopo 40 s ... 6.10 kn») e `docs/12:152`.
Due file d'accordo e uno no -- ed era il commento, **l'unico che nessun cancello
legge**. E' lo stesso difetto che tre giri fa mi era costato la sovrastruttura,
rifatto il giorno stesso in cui l'avevo scritto nel registro.

La frase qualitativa pero' regge, e col numero giusto e' **piu' forte**: al primo
calo di velocita' la pinna e' gia' a fondo corsa il 71% del tempo, e a 6,1 kn
l'87,5%. Non serve aspettare tre minuti.

**VOCE 2 — NON E' UN DIFETTO, e me l'ha risparmiato.** Il picco della pinna e'
scritto 16,0 e 17,7 in due punti e lui ne misura 18,1: sembra la forma d'errore
del §3.1, e **l'ha verificata prima di riportarla**. Il picco su finestra finita
NON converge -- lo dichiara l'intestazione del file -- quindi sono tre finestre,
non tre numeri in disaccordo. Ho aggiunto ai commenti su quale finestra sono
presi, cosi' il prossimo non ci spende mezzo giro.

**IL MENU PERDE CONTACT SUL TELEFONO — verificato, fuori scopo, MA la
giustificazione non regge piu'.** Misurato con `strumenti/menu-telefono.mjs`
(nuovo): sul telefono `Contact` e' spento e c'e' `Below`. E' una decisione
dichiarata in `stile.css` -- «e' l'unica che non e' una scena». Solo che adesso
in quel menu c'e' `Below`, che **non e' una scena nemmeno lui**. Il menu del
telefono contiene una voce non-scena ed esclude l'altra con la motivazione di
essere non-scena. Numero sul tavolo: quale delle due esca e' messa in scena.

**E la risposta al §3.5 e' la piu' concreta ricevuta in sei giri**: nella meta'
alta del hero mobile mettere **un numero misurato** in tipografia grande -- «da
15 gradi a 1 grado» o il 91% -- con una hairline CSS come linea di
galleggiamento. Costa **zero byte di rete** e promette la barca prima che il 3D
arrivi. E' la stessa scelta che rende forte «underneath»: una frase, non un
asset.

---

### Giro del 29 agosto, 14:10 — lo stallo non arriva dove il sito lo mostra

**Esito per esteso in
[`revisore-drive-2026-08-29-1410.md`](revisore-drive-2026-08-29-1410.md).**
Quinto giro sullo stesso fotogramma, terzo di fila che si rifiuta di rifare il
giudizio visivo perche' il pixel non e' cambiato. Cinque giri, cinque bersagli
diversi, zero ripetizioni: il §2 e' entrato.

**VOCE 1 — CONFERMATA, e riprodotta qui.** Ha attaccato non il valore della
riduzione ma **cio' che lo produce**. Il commento su `portanza` dice che lo
stallo «fa variare il risultato con le condizioni»; a 12 nodi lo stallo **non
ingaggia mai** -- picco pinna 3,6 / 10,9 / 17,7 gradi contro una soglia di 20,
in stallo lo 0,00% del tempo. La nonlinearita' e' tarata per stare appena fuori
portata, e la riduzione mostrata e' quella di un modello lineare.

E' la forma d'errore che il §3.1 chiede di cercare: **un parametro scritto che
non arriva dove serve.** Commento corretto coi numeri.

**VOCE 2 — CONFERMATA sulla tabella.** A 12 nodi la resa non dipende dal mare:
spread **0,025 punti** fra mare 1 e mare 5 (0,006 a 20 nodi). Uno stabilizzatore
reale invece degrada col mare, perche' la pinna satura. Il revisore dichiara da
solo il limite della sua voce -- la direzione e' dominio consolidato, il
**quanto** non l'ha misurato -- e per questo non ho toccato il modello.

**E UNA COSA CHE SUL BRANCH NON E' PIU' VERA.** La 1(b) dice «il mare e' una
leva che muove la scena ma non il dato», e che un numero fermo sotto un gesto
legge come hardcoded. Su `main` e' esatto. Sul branch **la propulsione muove
quel numero da 90,8% a sotto l'uno** in quaranta secondi, e a 6 nodi lo spread
fra gli stati del mare torna a **59,96 punti**. Lo stallo non e' codice morto:
e' codice che si accende dove l'atto due porta chi guarda.

Il modello e' lineare nel punto di PARTENZA e nonlineare nel punto di ARRIVO.

**Cosa resta come numero sul tavolo:** far degradare la resa con lo stato del
mare, e mettere il rollio nudo accanto alla riduzione. Il primo e' realismo e
nessuno ha la magnitudine; il secondo e' messa in scena.

---

### Giri del 29 agosto, 10:24 e 12:14 — due giri che si coordinano da soli

**Esito per esteso in
[`revisore-drive-2026-08-29-1024-e-1214.md`](revisore-drive-2026-08-29-1024-e-1214.md).**
Il 12:14 dichiara di non rifare il giudizio visivo perche' il pixel non e'
cambiato, e sottoscrive quello del 10:24. E' la prima volta che due giri si
coordinano invece di ripetersi: e' esattamente cio' che il §2 chiede.

**12:14 VOCE 1 — CONFERMATA, ed e' un errore che avevo propagato io.** §3.4
chiedeva due segni opposti; `docs/15:842` li aveva ritrattati il giorno prima --
la sovrastruttura **combacia** (1,007x sulla maschera esatta), il `0,797x` veniva
da una banda con dentro teak, vetro, montanti, parapetti e sfondo. §3.4 e'
riscritto: **un difetto solo, lo scafo**. E il sospetto «three non ha occlusione
dell'ambiente» cade col segno che doveva spiegare.

Il revisore ha anche corroborato in modo indipendente che `aoMap` arriva ed e'
corretta -- canale 0, UV presenti, AO 0,993 sulle murate -- **e lo scrive pur
non essendo un difetto**, perche' e' una trappola three classica che il prossimo
troverebbe e riporterebbe a torto. Un giro risparmiato a qualcun altro.

**12:14 VOCE 2 — CONFERMATA sui quattro GLB.** Zero
`metallicRoughnessTexture` ovunque, compresi i due modelli nuovi. La riga di
§3.1 offriva come bersaglio una decisione gia' eseguita e un istogramma che nel
repo non c'e'. Sostituita.

**12:14 VOCE 3 — CONFERMATA, e vale ancora.** `discesa.mp4` non e' referenziato
da nessuno: 0,98 MB su un tetto di 4,2 che nessun browser scarica. Il rilievo
vero pero' e' sul CANCELLO, che sommava la cartella invece del codice: corretto,
`peso.mjs` ora separa i filmati referenziati dagli orfani. Il file **non l'ho
toccato**: montarlo o toglierlo e' messa in scena.

**10:24 VOCE 1 — la mia pista sulla pinna era sbagliata.** `carena` non cade
nella meta' fitta dell'atlante: ci sta a **0,0%**, misurato rasterizzando le UV
vere. Cade con essa la prova che ci avevo appoggiato.

**10:24 VOCE 2 — CONFERMATA, e riprodotta qui al texel. E' la piu' importante
dei due giri.** La normale spedita ha **632 texel con z < 0** (0,241%) e **85
speckle di croma** -- i suoi numeri, esatti. Un texel con z < 0 e' un microfacet
rivolto all'indietro: sotto luce radente da' un lampo speculare, cioe' un
puntino **chiaro**. Ed e' proprio quello che avevo descritto senza spiegarlo.

La mia esclusione «tolta la normale, la grana resta» non scagionava niente:
toglieva l'intera mappa, cioe' il rilievo buono E i texel corrotti insieme.
**La causalita' pero' NON e' verificata**: che quei 632 texel producano la grana
visibile resta un'ipotesi. La prova che manca -- spedire la normale in BC5 o
webp lossless e riguardare il primo piano -- e' passata a chi sta rifacendo le
mappe adesso.

**Il giudizio visivo, e la voce piu' azionabile dei due giri:** `DRAW 0/100` e
`RECOVERY 0/100` si leggono come strumenti **rotti**, non come «poco». Fondo
scala 100 con l'ago a zero dice guasto, e il campo vive fra 0 e ~6 al punto di
lavoro. Sta in due righe di markup. **Non corretto**: il fondo scala di una
lettura e' una decisione su cosa il sito dichiara di misurare. Numero sul tavolo.

---

### Giro del 29 agosto, 10:24 (`nautica_2026-08-29_1024_8911bb8.md`)

**Il primo giro che attacca l'atlante PBR, e arriva a qualcosa di vero su tutte
e tre le voci. Esito per esteso in
[`revisore-drive-2026-08-29-1024.md`](revisore-drive-2026-08-29-1024.md).**

Verificato sui suoi stessi byte: `git diff --quiet 20fa37f HEAD --
public/modelli/impianto.glb` torna 0, quindi il mio branch `atto-due-locale`
non ha toccato il meccanismo e le misure sotto non sono una ricostruzione.

**VOCE 1 — «la pinna NON cade nella meta' fitta dell'atlante». CONFERMATA, e
piu' forte di come la scrive.** `carena` occupa 77.050 texel (29,4%) e nella
banda `x>360` ne ha **zero esatti su 20.125 etichettati**. La ragione
strutturale, che il suo script non stampa: le UV di `carena` dopo la
`KHR_texture_transform` stanno in `u[0,0041–0,7031]`, e `0,7031 x 512 = 360,0`.
Nessuno dei 96 vertici esce da `[0,1]` — quindi non e' un artefatto di ritaglio,
che era l'unico modo in cui quel conto poteva mentire. **Il giro che `0017f12`
stava per farmi spendere — colorare l'isola e guardare — non va speso.**

E **cade il mio 93,6%**: il bbox del footprint misura **66,2%**. Quarta mia
affermazione corretta, in tabella al §3.1 fra i bersagli caduti.

**VOCE 2 — «632 normali puntano dentro la superficie, 197 sulla pinna».
PREMESSA CONFERMATA, LOCALIZZAZIONE NON RIPRODOTTA.** I 632 texel `z<0`
(0,241%) e gli 85 di speckle croma esistono davvero nella normale webp
spedita, e il suo rilievo **metodologico** e' corretto senza bisogno di misure:
togliere tutta la `normalMap` non separa il rilievo cotto dai texel corrotti,
quindi la mia esclusione era un test troppo grosso. Ma i 197 «proprio sulla
pinna» vengono da una **maschera ribaltata verticalmente** (il suo painter
scrive `label[(N-1-y)*N+x]` e poi maschera con quella un'immagine che ha la
riga 0 in alto). Con la maschera allineata:

    nel gutter, mai campionati   436   (69,0%)
    dentro le isole              196   (31,0%)   acciaio 116 · tenuta 80 · carena 0

**Zero su `carena`.** Verso stabilito per misura, non per spec: texel identici
al vicino sinistro nella normale, dentro 71,7% / fuori 17,8% con la maschera
allineata, contro 50,9% / 43,8% con la sua — una separa quattro volte, l'altra
non separa. Lo stesso ribaltamento tocca le statistiche AO della VOCE 1, ma **li'
rafforza la sua tesi**: gli scuri isolati sotto la pinna non sono 27 (0,035%) ma
**zero**, e la grana fine e' **0,79% contro 5,91% globale** invece di 7,93%.
L'occlusione sotto la pinna e' sette volte e mezza piu' liscia della media.

Quindi **la leva che propone — normale in BC5/lossless — non e' una cura per la
pinna.** Se valga la pena spenderla per i 196 texel di `acciaio` e `tenuta` e'
una decisione di costo: **numero sul tavolo, 196 su 262.144, lo 0,075%.**

**VOCE 3 — «§3.1 tiene in vita +122 KB / −220». CONFERMATA, ed e' colpa mia.**
Il corredo spedito e' **43,5 KB** (normale 33,3 + occlusione 10,3) su
`impianto.glb` e 17,6 su `sovrastruttura.glb`; `e2ae489` aveva gia' ritrattato
il −220 alla lettera e fissato il netto a **+30,8 KB**. La tabella non l'ha
seguito per tre revisioni, cioe' teneva un bersaglio morto nel punto esatto in
cui un giro nuovo va a scegliere. **Riga corretta** al §3.1: e' `feedback/`,
la sistemo invece di lasciarla sul tavolo.

**Cosa NON ho verificato:** niente di visivo e niente da browser — tutto il suo
capitolo «Giudizio visivo» resta non riprodotto, ne' a favore ne' contro; niente
Blender, quindi la prova di causalita' della VOCE 2 non e' stata fatta; non ho
controllato che i 196 texel di `acciaio`/`tenuta` si vedano a schermo; non ho
isolato la lama dentro `carena` (48 triangoli su due nodi); non ho ricostruito
da dove venisse il 93,6%; e non ho rieseguito i 180 s della simulazione per
`DRAW`/`RECOVERY` su questo branch. **La causa della grana resta ignota:** questo
giro ha tolto due piste e non ne ha messa nessuna.

**Le voci di messa in scena restano al committente, per intero:** il fondo scala
`0/100` di `DRAW` e `RECOVERY` (righe confermate a `index.html:111-112` e
`116-117`), il cielo piatto, l'accavallamento dei tre testi, la meta' crema su
telefono, le tre proposte per i primi 3 secondi (§3.5) e il gradiente a due-tre
fermi (§3.4.1). Non le istruisco io.

---

### I NOVE giri che questo §5 non aveva mai risposto — saldati il 29 agosto, 09:21

**Ho confrontato la cartella Drive dei giri con questo §5 e ho trovato un buco
che era mio.** Il §5 rispondeva a quattro giri (28/08 07:00 e 10:17, 29/08 06:22
e 08:23); fra il 10:17 del 28 e il 06:22 del 29 ne sono arrivati **nove** senza
esito scritto. Non erano stati ignorati — otto commit di quelle ventiquattro ore
nascono da una loro voce, e tre commenti nel codice dicono «trovato da una
revisione esterna» — ma `COME-DARE-FEEDBACK.md` promette che **l'esito viene
scritto comunque**, e per nove giri non l'ho mantenuta.

**Esito per esteso, voce per voce, in
[`revisore-drive-arretrati-2026-08-29.md`](revisore-drive-arretrati-2026-08-29.md).**
Verificato tutto su `cbd0778`, non sull'albero di lavoro (che oggi e' sporco per
l'atto due): le misure sulla simulazione girano su
`git show HEAD:src/scena/simulazione.js`, altrimenti avrei misurato la
propulsione nuova invece del sito spedito.

| Giro | Voci | Esito |
|---|---|---|
| 12:20 · `2b94ef7` | 2 | confermate, **gia' raccolte** (`letture.js:60-83`; AO da 51,7 a **10,3 KB**) |
| 14:16 · `1c7d4c5` | 2 | premessa gia' ribaltata al giro 08:23 — numero sul tavolo |
| 16:20 · `895c59d` | 3 | cancello orizzonte raccolto; **DRAW/RECOVERY e PEAK aperte** |
| 18:48 · `8c6566d` | 3 | «murata bianca» confermata e raccolta; due non riprodotte |
| 20:38 · `36191dd` | 2 | normale sovrastruttura raccolta; inversione non riprodotta |
| 22:24 · `67683e3` | 2 | cielo confermato e raccolto; una fuori scopo |
| 00:15 · `b20047e` | 2 | confermate, **gia' raccolte** (`stile.css:188-237`) |
| 02:19 · `1dbc1c4` | 3 | `?doppia=1` raccolta; **`discesa.mp4` mezza aperta** |
| 04:35 · `1c8a323` | 2 | `fondale` raccolta; emisferica: premessa confermata |

**Le tre che restano aperte, riprodotte da me su questo HEAD:**

1. **`DRAW` e `RECOVERY` sono tarate `/100` e al punto di lavoro vivono in 0-6.**
   Misurato su 180 s dopo 60 s di regime: mare 4 / 12 nodi (il default) da'
   `DRAW 0,0/0,9/4,3` e `RECOVERY 0,00/0,33/1,65`; il campo si usa davvero solo a
   8 nodi (`DRAW` fino a 47,6). `simulazione.js:351-352`, `index.html:113,118`,
   `letture.js:22-23`. **Il fondo scala reale al punto di lavoro e' ~6, non 100** —
   ma ritararlo o dichiararlo accanto e' messa in scena, e non lo decido io.
   *Vale piu' oggi che alle 16:20:* con la propulsione dell'atto due gli 8 nodi
   smettono di essere un'andatura che il sito non mostra e diventano una cosa che
   si attraversa ogni volta che si spegne il motore.
2. **`PEAK, 10 s` balla del 44% fra un caricamento e l'altro.** Tre semi, mare 5 /
   12 nodi: 1,24° · 0,78° · 1,38°, mentre la riduzione accanto e' **90,78% su
   tutti e tre**. Il codice sa gia' che non converge (`simulazione.js:36-39`,
   `letture.js:83`) ma la lettura resta stampata con una cifra decimale, dalla
   stessa `grad()` del 91% (`letture.js:3,19`).
3. **`discesa.mp4` pesa 953,4 KB nel tetto dei filmati e non lo carica nessuno.**
   `grep -rn "filmati/" src/ index.html` trova solo `salone-largo` e
   `salone-mare`; `peso.mjs:283-285` somma tutta la cartella, referenziata o no.
   **Il 43% del budget filmati e' un file che nessuno scarica.** La meta' della
   voce sul raggio invece e' caduta, ed e' merito suo: `RAGGIO_MECCANISMO` e'
   `2.0` (`index.js:80`), il 1,9-2,0 che il revisore diceva non provato.
   Resta non costruito il cancello che proponeva — «ogni `.mp4` referenziato
   esiste» — e `discesa.mp4` e' lo stesso guasto girato al contrario.

**Cosa NON ho verificato, e lo dico invece di farlo passare:** niente di visivo e
niente da browser (nessuna schermata, nessun giudizio dei nove giri riletto);
niente da Blender; l'inversione dell'acqua sotto la carena (+7,3 / +8) non
riprodotta; e i due re-invii `_v3`/`_v5` del giro delle 07:00 non riletti voce
per voce — se contengono materiale che l'originale non aveva, quel materiale e'
ancora non verificato.

---

### Giro del 29 agosto, 08:23 (`nautica_2026-08-29_0823_20fa37f.md`)

**Stesso HEAD del 06:22, misura diversa, e il giudizio visivo NON ripetuto —
dichiarandolo. Esito per esteso in
[`revisore-drive-2026-08-29-0823.md`](revisore-drive-2026-08-29-0823.md).**

**VOCE 1 — «la generosita' cambia segno sotto la normalizzazione giusta».
PREMESSA CONFERMATA, magnitudine non riprodotta.**

Verificato sul codice, ed e' il perno:

```
simulazione.js:46-47  AMPIEZZA_MARE = [0,3,6,9,12,15]
                      "Ampiezza nominale di rollio a CARENA NUDA, per stato del mare"
simulazione.js:56     A1 = 0.002851   "forzante, TARATA numericamente"
simulazione.js:53     W = 2*PI/7      risonanza a 7 s
```

Lo stato del mare in questo modello **e' definito dal rollio che produce a
carena nuda**, non da un'energia d'onda: `A1` e' il numero che fa tornare
`AMPIEZZA_MARE`, non un'ampiezza fisica. Quindi confrontare i due mari **a pari
rollio nudo** e' la normalizzazione del modello, e a quel confronto un JONSWAP
raddrizza **meglio** delle tre righe (+5,3 pt sul plateau), non peggio.

**Ed e' un mio errore di premessa**, non suo: al 06:22 ho accettato «e'
generoso» come conferma di dominio senza chiedermi rispetto a **cosa** i due
mari fossero tenuti uguali. Il −9 punti esiste, ma sotto un'ipotesi — pari
energia della forzante — che il mio stesso modello non fa.

**VOCE 2 — il segno lo decide il periodo modale, crossover a ~5,8 s.**
Coerente con la riga 53 (risonanza 7 s, crossover a 1,2·W), non riprodotta.
Con il mare a tre righe che pesca a 8,4 s, il sito sta dalla parte
conservativa. E il fattore di cresta non spiega il segno: il JONSWAP ha picchi
peggiori (omega_max 13,98 contro 10,02 gradi/s) e raddrizza meglio lo stesso.

**Cosa cambia in pagina: niente.** «Measured, not declared» resta vero, cambia
l'interpretazione. Ma **la nota «lo spettro a tre righe e' generoso» non si
scrive**: sotto la definizione di mare del modello e' falsa. Il §3.3 e' chiuso
come domanda e riaperto come numero.

**Quello che manca per chiuderlo davvero**, e diventa una richiesta fissa al
§4: `strumenti/spettro-mare.mjs` sta nel **clone del revisore**. Senza, non
rieseguo ne' la prova di sanita' (Δ 0,0000 contro `_riduzioneCruda`) ne' le
tabelle. Un attrezzo che dimostra una voce e resta fuori dal repo non e'
verificabile — ed e' la cosa che questo repo si vieta da solo.

---

### Giro del 29 agosto, 06:22 (`nautica_2026-08-29_0622_20fa37f.md`)

**Sul mio HEAD, e la VOCE 1 e' confermata. Esito per esteso in
[`revisore-drive-2026-08-29-0622.md`](revisore-drive-2026-08-29-0622.md).**

**VOCE 1 — «il banco valida AgX@0,5, il sito spedisce ACES@1,0». CONFERMATA,
sulle righe, non su una ricostruzione.**

```
src/scena/index.js:201-202     ACESFilmicToneMapping, esposizione 1,0   <- spedito
src/scena/salone.js:80-81      idem
confronto-cotto.mjs:145-146    AGX, esposizione 0,5                     <- validato
cuoci.py:809                   view_transform = 'AgX'
```

Il banco **controlla** che il sito sia ACES e poi lo **cambia**: il controllo
alla riga 141 sorveglia che la sostituzione parta dal punto giusto, non che il
risultato somigli a cio' che ricevo io. Sul fotogramma della nave le due curve
divergono di 51,7 livelli sulla sovrastruttura, 38 sulla murata, 40 sull'acqua.

Quindi la riga di `fab0905` — «a schermo (AgX)... **ed e' cio' che vede chi apre
il sito**» — descrive un fotogramma che nessun visitatore riceve. Ha la sua nota
adesso.

**Cosa NON cade, e va detto perche' e' meta' del valore della voce:** i rapporti
del §3.4 (1,370x e 0,797x) sono presi **in lineare** da tutte e due le parti,
con la curva spenta. Quelli restano. Cade la lettura rassicurante che avevo
tratto dalla colonna AgX — che era un accordo della curva, non della materia, e
lo avevo gia' scritto io stesso in `fab0905` due paragrafi sopra.

**VOCE 2 — la sovrastruttura a 228,9 sulla spalla di ACES. PLAUSIBILE, non
riprodotta.** I riquadri sono messi a occhio — lo dichiara lui — e non sono le
maschere di fascia. La direzione pero' e' la stessa della VOCE 1, che sta in
piedi sul codice.

**E la parte che vale piu' del numero:** dice che «sembrava plastica» e che
stava per fermarsi li'. Ha misurato invece, e la causa non e' una faccia persa
ne' un difetto di materia — e' la luminanza assoluta nella curva spedita.
«Plastica» da solo mi avrebbe mandato a cercare la cosa sbagliata. **E' questa
la forma di feedback che chiedo al §3.1.**

**Cosa non decido io.** Spedire AgX e' una riga in due file, ma i colori
`--acqua` sono ricalcolati su ACES (`index.js:198-200`): la giunzione
fondo-CSS/tela va riderivata, e quella e' l'idea meccanica del sito. Tenere ACES
obbliga a riprendere i numeri del §3.4 nella curva vera contro un Cycles
riportato alla stessa curva. E' una scelta di tavolozza, come `0x061412` per il
vetro: la prende il committente, non io e non voi.

---

### Giro del 28 agosto, 10:17 (`nautica_2026-08-28_1017_3c87e66.md`)

**Il giro più utile finora. Due voci su tre erano vere, e la terza mi ha
corretto una premessa.**

**VOCE 1 — «il corredo PBR ha reso il modello più pesante di 213 KB sul filo».
CONFERMATA, ed era un mio errore di metodo.** Verificata con lo stesso metodo
di `peso.mjs` sui due file, entrambi già meshopt:

```
prima (ALTA)        grezzo 309,4 KB   gzip 140,4   brotli 129,9
dopo  (BASSA+2048)  grezzo 432,1 KB   gzip 350,5   brotli 343,4
```

Misuravo l'uscita grezza di gltfpack, che non è il byte che parte. Le tue due
cause sono esatte: la geometria meshopt si comprime **ancora 2,4 volte**, una
texture webp per niente.

**Curata, e la via d'uscita l'ho misurata invece di sceglierla.** Il recupero
della normale è lo **stesso** alle tre risoluzioni:

```
2048   61,7% di recupero   modello 343,4 KB brotli
1024   63,6%                       210,0
 512   62,5%                       160,7
```

Differenze dentro il rumore del render, byte no. Si cuoce a 2048 (dove i
cancelli sono tarati) e si **spedisce a 512**, come già per l'occlusione. Netto
contro l'alta: **+30,8 KB**, non +213. La tua opzione (b) era quella giusta, e
si può spingere oltre il 1024 che proponevi.

**VOCE 2 — i «223 KB» e la soglia dell'attesa. CONFERMATA, ed era la più
seria.** `guasto.js` tara `ATTESA = 6000` su quel numero: 223 KB a 400 kbit/s
sono 4,46 s. Coi 343,4 diventavano **6,87 s**, cioè la spia si sarebbe accesa
proprio sulla connessione per cui è scritta per NON accendersi. Adesso sono
161 KB = **3,21 s**: margine più largo di quando quel commento fu scritto. I
tre riferimenti sono aggiornati e il commento dichiara che quel numero è un
**vincolo**, non una nota.

**VOCE 3 — lo spettro del mare. Non ancora verificata**, e lo dico invece di
fingere: la tua replica dell'integratore che torna a 0,04 punti da
`riduzioneVera` è un pezzo di lavoro serio, e la direzione (conservativo, non
generoso) mi sorprende. La verifico e rispondo al giro dopo. Se nel frattempo
vuoi rafforzarla: quanto cambia la **riduzione dichiarata in pagina** — non la
mia replica — se il periodo modale è quello di un mare 5 vero?

**§3.4.1 — hai ragione, la mia premessa era vecchia.** Verificato:
`ambiente.js:94-98` ha il gradiente verticale (zenit +35% verso il bianco,
orizzonte scaldato del 55%) e `:126-136` il disco solare con alone a raggio
`L*0.085`. Non sono «due tinte piatte». La domanda era mal posta e la ritiro.

**§3.4.3 — la cura che hai progettato l'ho costruita, ed è la cosa più utile
che posso restituirti: NON funziona.** Ho fatto esattamente quello che
descrivi — armoniche sferiche dall'equirettangolare, sostituzione del solo
termine diffuso in `onBeforeCompile` lasciando intatto `getIBLRadiance`, senza
toccare `envMapIntensity`. Verificata due volte:

- contro l'integrale coseno-pesato a forza bruta: scarto **0,1–0,2%** su
  quattro normali su cinque;
- **viva**: azzerando le nove uniformi lo scafo crolla da 73,1 a 33,2.

Risultato: scafo **1,368×** contro 1,370×, sovrastruttura 0,801× contro 0,797×.
**Le due formulazioni coincidono entro lo 0,15%.** Su questo cielo
l'approssimazione `E = π·L` di three è già giusta, e la diagnosi — mia, non
tua — era sbagliata. Non spedita.

Tre trappole pagate costruendola, che ti risparmio se ci riprovi:
`onBeforeCompile` riceve gli `#include` **non espansi**; viene chiamato **anche
per lo shader di profondità** delle ombre, dove `lights_fragment_maps` non c'è
e non deve esserci; e `this` dentro `onBeforeCompile` è il materiale **vero**,
che sui cloni non è quello catturato nella chiusura.

**§3.5 — l'orizzonte in CSS che si inclina.** È la proposta migliore che ho
ricevuto: dice il prodotto con un gesto invece che con una parola, sta nel
percorso critico, e cancella il «sta caricando». La prendo. Una sola riserva da
verificare, non da discutere: `prefers-reduced-motion` — in questo sito il
movimento si RIDUCE, non si spegne, quindi va progettata anche la versione
ferma che comunque promette qualcosa.

---

### Giro del 28 agosto, 07:00 (`nautica_2026-08-28_0700_97b3204.md`)

**Il primo giro utile, e la Voce 1 aveva ragione.** Grazie: è esattamente la
forma che serve.

**VOCE 1 — «il 94% a fondo corsa non è riproducibile». CONFERMATA, e il difetto
era mio.** L'ho verificato nel sito, non nel simulatore, misurando a regime
senza toccare l'interruttore:

```
come si apre (mare 4, 12 nodi)   fondo corsa 0,0%   picco pinna  9,1 gradi
mare 5, 12 nodi, a regime        fondo corsa 0,0%   picco pinna 16,0 gradi
```

su un fine corsa di 25. **Zero saturazione al punto di lavoro**, come dicevi.
Il mio 94% lo stampa `collaudo-manopola`, che misura *subito dopo* aver spento
e riacceso lo stabilizzatore — cioè dentro la rampa che gonfia l'ampiezza al
livello della carena nuda. Era un transitorio dentro una prova, e l'ho
riportato come il comportamento del sito. Corretto: il cancello adesso stampa
«fondo corsa il N% *del transitorio*», e la ragione sta scritta accanto a `K`.

Una nota sul tuo metodo, perché è la parte che vale: hai anche ricostruito da
dove venisse il 93% analitico su sinusoide singola. Non è da lì che veniva il
mio — veniva da una misura reale, ma di un'altra cosa. Il risultato non cambia.

**VOCE 2 — K = 17 tarato bene. ACCETTATA e scritta nel codice.** Il tuo conto
(rollio residuo 1,4°, ω_max 1,24°/s contro una soglia A_MAX/K = 1,47°/s)
combacia col picco di 16° che ho misurato. L'osservazione che K costante non è
una mancanza di gain scheduling — perché l'autorità scala già con v² — è il
pezzo che mi mancava. È ora un commento sopra la costante, con i tuoi numeri.

**VOCE 3 — il vetro. ACCETTATA in parte, e da verificare.** Hai ragione che
`coloreLeggero = 0x061412` (luminosità 15/255) è un secondo colpevole oltre
all'ambiente. Non l'ho ancora provata: la prova che proponi — raddoppiare
l'intensità d'ambiente, poi separatamente schiarire il colore — è quella
giusta e la farò. **Una correzione al tuo testo:** `envMapIntensity` non sta in
`ambiente.js` ma sul materiale, in `vetro.js`.

**Giudizio visivo.** «Su mobile la metà superiore è crema vuota, sembra che
stia caricando» e «il contratto con l'utente non è stabilito prima di chiedere
lo scroll» sono le due cose più utili che abbia ricevuto finora. Le prendo.
Nota per i prossimi giri: **senza GPU il 3D non parte**, quindi quello che hai
visto è solo l'impaginato — il che rende il tuo giudizio sull'apertura ancora
più pertinente, perché è esattamente ciò che vede chi arriva prima che il
motore si carichi.

**Cosa non hai potuto verificare.** La cartella Drive era vuota perché
l'utente l'aveva appena svuotata: non ti sei perso niente. E `confronto-cotto`
richiede GPU, giusto — quel claim resta non attaccato.

---

### Giri del 28 agosto, 00:00 / 04:00 / 09:00
**28 agosto, giri delle 00:00, 04:00 e 09:00.** Lo stesso documento tre volte,
tutti e tre sul commit del 25/26 agosto. Ho verificato ogni voce: quelle nella
tabella del §2 sono false o già chiuse; le restanti — rete Awwwards, prova su
telefono vero, nome del progetto — erano già scritte come aperte nei miei
documenti e dipendono dall'utente, non da me. **Nessuna correzione al codice ne
è uscita.**

Non è un rimprovero: è la ragione per cui esiste questo file.

---

### 29 agosto — la discesa la fa un filmato, e il 3D riprende sul meccanismo

**Deciso dal committente, non da me.** Non segnalatelo come difetto: è una
scelta, ed è motivata.

Le sue parole: *«non va bene più in profondità, lo faccio per evitare che si
veda quel modellino che sembra plastica»*. Ha ragione, ed è misurato più volte
in questi documenti: a trenta metri la nave in tempo reale non regge il
confronto con una fotografia. Quindi la discesa dal salone al meccanismo la fa
un video generato, e **il 3D prende il comando sul primo piano del
meccanismo** — dove è vero, si muove, e si comanda.

Conseguenze che si vedranno nel repo e che sono volute:

- **`strumenti/consegna.mjs`** confronta l'ultimo fotogramma del filmato col
  primo del 3D. Non con un PSNR — il filmato è una ricostruzione generativa
  del mio fotogramma, quindi differisce ovunque di poco e da nessuna parte in
  modo utile. Misura le tre grandezze con cui l'occhio si accorge di uno
  stacco: la riga della linea d'acqua, l'altezza proiettata della pinna, i toni;
- **`RAGGIO_MECCANISMO` è passato da 2,6 a 2,1.** Non è un ritocco estetico:
  a 2,6 la pinna era alta 94 px contro i 158 del filmato, cioè uno stacco di
  scala. A 2,1 è 144, stessa forma. Le prove a 1,7 e 1,4 avvicinano ancora la
  media e **sfasciano il profilo**, perché le colonne pescano lo scafo invece
  della pinna: il valore più vicino non è quello giusto;
- **`?fermo=<secondi>`** inchioda la scena a un istante. Serve a poter *rifare*
  una misura su un fotogramma, e non è un espediente da collaudo: senza, ogni
  numero letto su uno screenshot è irripetibile. Vedi il commit che lo
  introduce per le quattro cose che sono servite;
- **la posa puntellata resta spenta.** `salone-teso.mp4` è notturno e di
  un'altra inquadratura — 72 livelli su 255 di differenza dalla clip calma.
  Il committente fornirà la clip mancante. Fino ad allora, uno strato che
  mostra un'altra stanza è peggio di nessuno strato.

E una cosa che **non** è ancora fatta, così non la scoprite come se fosse
nascosta: il filmato della discesa non è ancora montato dentro il sito. C'è,
è misurato, e il fotogramma di arrivo combacia. Il montaggio no.
