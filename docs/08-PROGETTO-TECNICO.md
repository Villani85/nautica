# Progetto tecnico — la lama

Specifica di costruzione. Ogni numero qui dentro è stato verificato eseguendolo,
non scelto a occhio. Dove non lo è, è scritto.

Bersaglio: **~8,0 complessivo**. Le due pagelle pubbliche dei vincitori 2025 —
Messenger 7,92 e Lando Norris 8,18 — dicono che il massimo premio si prende
intorno all'8, e che il criterio più debole dei vincitori è l'**accessibilità**
(7,00 nel Developer Award di Lando Norris). È il punto più economico del
tabellone, e questo concetto è avvantaggiato: la lama è uno slider vero e le
etichette sono testo DOM.

---

## 1. Scala e geometria

Unità di scena = 2,5 m. Scafo di 40 m: `z ∈ [−8, +8]`.
Semilarghezza 1,62 (≈ 4 m), pescaggio 0,86 (≈ 2,15 m), linea d'acqua a `y = 0`.

Tutto il guscio — carena, coperta, sovrastruttura — nasce da **profili 2D
estrusi lungo Z**. Non è una comodità: è ciò che rende esatti i tappi di
sezione, perché la sezione di un'estrusione a qualunque quota **è la `Shape`
che l'ha generata**. Vale già nel repo per la carena; qui si estende a tutto.

---

## 2. La lama

Una fetta di scafo spessa `2·META = 1,6` (4 m) che scorre lungo Z.

**Il problema:** three.js *incrocia* i piani di taglio. Due piani opposti
tengono l'interno della fetta — l'opposto di quello che serve.

**La soluzione:** il guscio si sdoppia. Stessa geometria, due mesh, due
istanze di materiale, un piano ciascuno.

```js
// three.js tiene i punti dove  normale · p + costante > 0
guscioProra.material.clippingPlanes = [ new Plane(new Vector3(0,0, 1), -(lamaZ + META)) ]
guscioPoppa.material.clippingPlanes = [ new Plane(new Vector3(0,0,-1),   lamaZ - META ) ]
render.localClippingEnabled = true
```

**Verificato** campionando z da −8 a +8 a passo 0,1: dentro la fetta nessuno
dei due tiene, fuori ne tiene sempre esattamente uno. Nessun buco, nessuna
sovrapposizione.

I **sistemi non ricevono piani di taglio**. Sono ciò che resta quando il guscio
se ne va, ed è la tesi del sito resa meccanica.

**Tappi:** due `ShapeGeometry` del profilo corrispondente, a `lamaZ ± META`,
`MeshBasicMaterial` color carta, `DoubleSide`. Uno per ogni profilo attraversato
(carena, coperta, sovrastruttura).

---

## 3. Camera

Regola invariabile, è la spina dorsale del sito: **la camera sta a quota 0 e
guarda a quota 0**, quindi la linea di galleggiamento cade sempre a metà
schermo esatta e il fondo CSS può spaccarsi con un hard stop al 50%.

```js
camera.position.set(Math.sin(azimut)*R, 0, lamaZ + Math.cos(azimut)*R)
camera.lookAt(0, 0, lamaZ)
```

La camera insegue la lama in Z. L'azimut è l'unico grado di libertà concesso,
limitato a ±0,9 rad: non si può rompere la composizione nemmeno volendo.
Niente tone mapping, o la giunzione fra fondo CSS e canvas si vede.

---

## 4. La simulazione del rollio

Non è un'animazione preparata. È un sistema del secondo ordine integrato in
tempo reale, con le fasi del mare estratte a caso a ogni caricamento: **due
visite non danno lo stesso numero**.

```
θ'' + 2ζω·θ' + ω²·θ = M_mare(t) + C·α
α = clamp(−K·θ', ±α_max)
```

Integratore **semi-implicito di Eulero**: prima `ω`, poi `θ` con la `ω` nuova.
È simplettico, e regge.

| costante | valore | da dove viene |
|---|---|---|
| `W` | `2π/7` ≈ 0,8976 rad/s | periodo di rollio 7 s, tipico per uno scafo da 40 m |
| `ZETA` | 0,045 | carena nuda, smorzamento bassissimo — è il motivo per cui gli stabilizzatori esistono |
| `A1` | 0,01011 | **tarato numericamente** perché mare 4 dia 12,0° a carena nuda |
| `K` | 17,0 | guadagno sulla velocità di rollio |
| `C` | 0,2422 | autorità delle pinne |
| `ALFA_MAX` | 25° | stallo della pinna |

Il guadagno di risonanza della carena nuda è **11,1×**: è il motivo per cui
`A1` va tarato e non scelto. Una forzante scelta a occhio produceva 162° di
rollio, cioè una nave capovolta più volte.

**M_mare** = somma di tre sinusoidi a `0,83ω`, `1,37ω`, `0,51ω` con ampiezze
1 / 0,55 / 0,30 e fasi casuali, il tutto scalato per lo stato del mare.

### Comportamento verificato

| mare | spento | acceso | riduzione | pinna |
|---|---|---|---|---|
| 1 | 3,0° | 0,33° | 89,0% | 4,2° |
| 2 | 6,0° | 0,66° | 89,0% | 8,4° |
| 3 | 9,0° | 0,99° | 89,0% | 12,6° |
| 4 | 12,0° | 1,32° | 89,0% | 16,9° |
| 5 | 15,0° | 1,65° | 89,0% | 21,1° |

Con fasi diverse: 88,9% · 89,0% · 89,5% · 89,5%. **Il numero se lo guadagna,
non è stampato.**

Stabile su 20 minuti simulati a 120, 60, 30 e 20 Hz — nessuna divergenza.

**Difetto noto, da correggere in costruzione:** al mare 5 la pinna arriva a
21,1° e non satura mai, quindi la riduzione resta costante. È irrealistico: con
mare grosso una pinna va in stallo e la riduzione *cala*. Va aggiunto un mare 6
che porti la pinna oltre i 25° e faccia scendere il numero. È esattamente il
genere di cosa che l'unico pubblico capace di accorgersene nota subito.

### La riduzione è misurata, non dichiarata

Girano **due simulazioni in parallelo**, identiche tranne che una ha `C = 0`.
Il numero a schermo è `1 − picco_stabilizzata / picco_nuda`. Costa quindici
righe eseguite due volte e rende il dato onesto per costruzione.

---

## 5. Il contratto dei sistemi

È il pezzo che permette a venti agenti di lavorare senza produrre venti
estetiche. Un file per sistema, stessa forma, nessuno stato condiviso oltre
`stato`.

```js
// src/sistemi/_contratto.js
export default {
  id: 'stabilizzatori',
  nome: 'Stabilizzatori a pinne',
  z: 1.2,                    // posizione lungo lo scafo
  raggio: 2.2,               // entro quanto dalla lama va acceso
  lato: 'sotto',             // 'sotto' | 'sopra' — governa la palette

  costruisci ({ materiali }) { return Group },
  aggiorna (dt, t, stato) {},

  etichette: [{ punto: Vector3, titolo: String, righe: [String] }],
  scrive: ['correzioneRollio']   // dichiarato: chi tocca lo stato lo dice
}
```

**Regole non negoziabili per chi costruisce un sistema:**

1. I materiali arrivano **solo** da `materiali.js`. Nessun agente sceglie un colore.
2. Nessun sistema riceve piani di taglio.
3. Nessun sistema anima con GSAP. L'animazione è `aggiorna(dt, t, stato)`, punto.
4. Ogni geometria ripetuta più di otto volte è `InstancedMesh`.
5. Chi scrive nello stato lo dichiara in `scrive`. Oggi l'unico è lo stabilizzatore.

### Lo stato condiviso

```js
stato = {
  mare: 0..5, rollio, velocitaRollio, giri,
  attivi: Set, correzioneRollio,     // scritto dai soli stabilizzatori
  lamaZ, ridotto                     // prefers-reduced-motion
}
```

### Accensione per prossimità

Un sistema si costruisce alla prima volta che `|z − lamaZ| < raggio + META`.
Poi resta costruito ma con `visible = false` e `aggiorna` saltato quando esce.
Ricostruire costa più che tenere.

È così che venti macchine stanno su un telefono.

---

## 6. Lo scorrimento

Dalla skill dello studio, e non si discute: **l'immersione si guida con
scorrimento e tempo, non col puntatore.** La lama avanza con lo scroll; il
trascinamento è la presa diretta sopra, e risincronizza la posizione di scroll.

- **Lenis** solo su desktop. Su touch il sistema operativo ha già la sua inerzia.
- Aggancio dal ticker GSAP: `lenis.on('scroll', ScrollTrigger.update)`,
  `gsap.ticker.add(t => lenis.raf(t*1000))`, `gsap.ticker.lagSmoothing(0)`.
  Niente `autoRaf`, niente `scrollerProxy`.
- `scrub` come **numero**: 0,7 su desktop, 0,1 su telefono.
- `gsap.matchMedia` con **tre** contesti: desktop, telefono, movimento ridotto.
  Il telefono è un progetto a parte, non il desktop rimpicciolito.
- `invalidateOnRefresh: true` su tutto ciò che dipende da una misura.
- Vietati: cursore disegnato, pulsanti magnetici, tilt al puntatore, parallasse
  col mouse.

---

## 7. Etichette e accessibilità

**È qui che si prendono i punti che i vincitori lasciano sul tavolo.**

Le etichette sono **testo DOM**, non pixel nel canvas: posizionate proiettando
il punto di ancoraggio a schermo a ogni fotogramma. Leggibili, selezionabili,
ingrandibili, esposte allo screen reader.

- la lama è un `<input type="range">` vero, stilizzato — non un div con listener;
- frecce ← → : la lama salta al sistema precedente/successivo, e l'etichetta
  prende il fuoco;
- `prefers-reduced-motion`: la lama salta invece di scivolare, il mare si ferma,
  la nave resta ferma alla posizione corrente. Chi chiede meno movimento non
  riceve meno sito;
- gerarchia di heading vera, focus visibili, contrasto verificato su entrambe
  le palette;
- bersagli tattili ≥ 44×44 px. **Non è WCAG AA** — AA chiede 24×24 o spaziatura
  equivalente; 44 è AAA ed è il requisito Apple. Resta l'obiettivo, dichiarato
  per quello che è.

---

## 8. Budget

| voce | tetto | oggi |
|---|---|---|
| JS gzip | 250 KB | 146,6 KB |
| asset 3D | 500 KB | 0 oggi — vedi §12: geometria procedurale + generati Tripo, solo geometria |
| LCP su 4G vera | 2,0 s | non misurato |
| fps desktop | 60 | non misurato |
| pavimento Android medio | 30 | non misurato |
| Lighthouse mobile | ≥ 70 | non misurato |

DPR massimo 1,5 su desktop, 1,0 su telefono. Materiali condivisi (già fatto).
Nessuna dipendenza da CDN, font self-hosted già in `public/font/`.

I tre "non misurato" sono la voce più importante della tabella e nessuno di
quei numeri va sul sito prima di essere stato misurato **due volte in due
sessioni**.

---

## 9. Alberatura

```
src/
  main.js              esiste — non importa three, resta così
  stato.js             ← simulazione condivisa + le due corse parallele
  lama/
    index.js           ← i due piani, i tappi, l'inseguimento camera
    scorrimento.js     ← Lenis + ScrollTrigger + trascinamento + tastiera
  scafo/
    profili.js         ← le Shape: carena, coperta, sovrastruttura
    guscio.js          ← proravia / poppavia / tappi
    materiali.js       esiste
  sistemi/
    index.js           ← registro + accensione per prossimità
    _contratto.js
    propulsione.js
    stabilizzatori.js  ← da estrarre da nave.js, già corretto
    timoneria.js
    giroscopio.js
    allestimento.js    ← le persone sopra la linea, che non si accorgono di niente
  ui/
    etichette.js
    comandi.js         esiste
```

---

## 10. Chi costruisce cosa

**Seriale, una mano sola, prima di tutto il resto:**
`stato.js` · `lama/` · `scafo/` · `sistemi/index.js` e il contratto ·
**due sistemi esemplari** da cui gli altri copiano la forma.

**Parallelo, un sistema per agente, contro il contratto congelato:**
gli altri sistemi. Nessun agente tocca `stato.js`, `materiali.js` o `lama/`.

**Seriale di nuovo, una mano sola:**
passata di coerenza. Ogni deviazione dal contratto o rientra o viene
giustificata per iscritto. E si toglie: quasi sempre il problema è che c'è troppo.

**Umano, non delegabile:**
attivazione di Pages, misura su telefono vero, e tre estranei che devono capire
cosa fa il sistema in quindici secondi.

**Venti sistemi sono l'aspirazione, non il primo traguardo.** Quattro fatti bene
— propulsione, stabilizzatori, timoneria, giroscopio — più l'allestimento sopra
la linea sono già un Site of the Day. Venti mediocri non lo sono.

---

## 11. Cosa è verificato e cosa no

**Verificato eseguendo:** la logica dei due piani di taglio su tutta la
lunghezza; la taratura di `A1` e `C`; la tabella del comportamento ai cinque
stati del mare; la variabilità del risultato con fasi diverse; la stabilità
dell'integratore su 20 minuti da 20 a 120 Hz; il quadrilatero della pinna, che
tiene biella e manovella rigide a 0,30000 e 0,11000 su tutta la corsa.

**Non verificato:** tutto ciò che riguarda le prestazioni, la resa visiva, e il
comportamento su un dispositivo reale. Nessuno di quei numeri esiste ancora.


---

## 12. Asset generati — la pipeline Tripo

### La linea di divisione

> **Generato ciò che si guarda. Costruito ciò che si muove.**

Non è una preferenza, sono due vincoli tecnici.

**Il meccanismo non si genera.** Tutto l'argomento di credibilità è che la
catena cinematica sia corretta: manovella e biella devono restare rigide a
0,11000 e 0,30000 su tutta la corsa, e i pezzi devono muoversi l'uno rispetto
all'altro. Una mesh generata è un blocco unico — niente perni, niente parti
separabili, niente da animare.

**Il guscio non si genera.** Il guscio dev'essere l'estrusione di una `Shape`,
perché è ciò che rende **esatti i tappi di sezione** (§2). Con una mesh generata
la lama taglierebbe un guscio cavo e si vedrebbe l'interno della superficie:
morirebbe l'idea tecnica migliore del progetto.

**Si genera tutto il resto**, ed è la metà che a mano non si fa in una notte:

| destinazione | contenuto |
|---|---|
| `allestimento.js` | persone sedute, divani, tavolini, poltrone di plancia, cuccette |
| locali macchina | tubi, valvole, casse, filtri, passerelle cavi, estintori |
| propulsione | elica, scafi di supporto, cassa acqua |
| ponte | bitte, verricelli, tender, sedute esterne |

L'allestimento sopra la linea è la metà emotiva della tesi — *sopra la gente sta
comoda, sotto venti macchine lavorano perché ci stia*. Senza, il sito è un
disegno tecnico; con, è una nave.

### Quale modello, e con che parametri

**Tripo P1, non 3.1.** P1 è il modello a topologia game-ready con budget
poligonale dichiarabile — l'intervallo utile è dell'ordine delle migliaia di
facce, ed espone un **face limit** richiesto in ingresso. È esattamente la
manopola che serve. Il 3.1 punta a densità e texture PBR, che qui sono peso puro.

**Le due impostazioni che decidono tutto:**

1. **Texture disattivate alla generazione.** Non generate-e-poi-spogliate: la
   generazione senza texture è un'opzione esplicita, costa meno e restituisce
   solo geometria. Le texture sono il grosso del peso di un GLB, e comunque
   andrebbero buttate — il materiale viene riassegnato da `materiali.js`, che è
   la regola per cui nessun agente sceglie un colore.
2. **Face limit basso in ingresso**, non decimazione a valle. Chiedere 3.000
   facce è più pulito che chiederne 200.000 e ridurle in Blender.

**Immagine → 3D, non testo → 3D**, per tutto ciò che è tecnico. Su una valvola
o un verricello una foto di riferimento dà una fedeltà che il prompt non
raggiunge. Dove servono più viste, l'ingresso multi-vista accetta 2–4 foto e
ricostruisce molta più struttura.

*Da verificare sulla documentazione ufficiale prima di scrivere il client: i
nomi esatti dei parametri. Le fonti trovate sono in buona parte rivenditori che
incapsulano l'API, e i nomi possono non coincidere. Esiste un SDK Python
ufficiale (`tripo3d`) con generazione asincrona e polling.*

### Il contratto della pipeline

Nessun GLB entra nel repo senza passare di qui.

```
1  genera        P1 · texture OFF · face_limit 3000 · seed registrato
2  normalizza    Blender: origine sul punto di ancoraggio, scala reale in metri,
                 asse Z longitudinale, materiali rimossi
3  comprimi      meshopt (gltfpack -cc)
4  verifica      ≤ 3.000 triangoli · ≤ 25 KB compresso · 1 sola mesh · 0 materiali
5  registra      riga nel manifesto
```

**Soglia dura: 3.000 triangoli e 25 KB compressi per pezzo.** Sopra, il pezzo
non entra. Venti pezzi a 25 KB fanno 500 KB, che è il budget intero di §8 — e
significa che venti è anche il **tetto**, non solo l'aspirazione.

### Il manifesto

`asset/MANIFESTO.md`, una riga per pezzo, obbligatoria:

| file | origine | prompt o immagine | seed | tri | KB |
|---|---|---|---|---|---|

Serve a tre cose: rigenerare identico un pezzo mesi dopo; sapere cosa è
generato e cosa no quando si scrive la sezione tecnica del sito; e non
dichiarare in giro un lavoro di modellazione che non è stato fatto.

### Cosa resta a Blender

Non la modellazione: la **normalizzazione**. Un GLB generato arriva con origine
arbitraria, scala arbitraria e orientamento arbitrario. La skill `blender/` del
repo copre già geometria, materiali e collaudo; qui serve solo lo script che
mette origine, scala e assi al loro posto, uguale per tutti i pezzi.

### I due rischi, e colpiscono i criteri già deboli

**Il peso attacca l'Usability**, che vale il 30% ed è il voto più basso sia di
Messenger (7,46) sia di Lando Norris (7,90). Un GLB Tripo con texture PBR sta
fra i 5 e i 20 MB. Venti di quelli sono quaranta volte il budget. Il rimedio è
il punto 1 del contratto, e non è negoziabile.

**Le texture generate attaccano il Design**, che vale il 40% e si vota sulla
coerenza. Venti asset con la propria palette fanno a pezzi le due palette
divise dalla linea. Il rimedio è lo stesso: **dalla generazione si prende solo
la geometria.**

### Il collaudo che dice se è andata

Aprire la scena e guardare i pezzi generati **in scala di grigi**, con i soli
materiali di `materiali.js`. Se un pezzo si riconosce ancora per cos'è, la
geometria regge. Se si riconosceva solo grazie alla texture, non era un asset:
era un'immagine.
