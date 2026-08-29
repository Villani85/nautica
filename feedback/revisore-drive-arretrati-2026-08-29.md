# Esito della verifica — i NOVE giri Drive che il §5 non aveva mai risposto

Data della verifica: **29 agosto 2026, 09:21.** HEAD al momento del giro:
**`cbd0778`**.

## Perche' questo file esiste

Confrontando la cartella Drive dei giri (`14fxoosyhq2Y9FXRNK2UvVESCVoMZd-jK`,
14 documenti) con il §5 di `CHIEDO.md` viene fuori un buco che non avevo visto:
il §5 risponde a **quattro** giri — 28/08 07:00, 28/08 10:17, 29/08 06:22,
29/08 08:23 — e fra il 10:17 del 28 e il 06:22 del 29 ne sono arrivati **nove**
a cui non ho mai scritto un esito.

Non e' che siano stati ignorati: leggendoli si vede il contrario. Otto commit di
quelle ventiquattro ore nascono da una loro voce, e in tre casi il commento nel
codice lo dice esplicitamente («trovato da una revisione esterna»). Ma
`COME-DARE-FEEDBACK.md` promette che **l'esito viene scritto** — anche quando la
voce era sbagliata — e per nove giri quella promessa non e' stata mantenuta.
Questo file la salda.

| Giro | HEAD del giro | Voci | Esito |
|---|---|---|---|
| 28/08 12:20 | `2b94ef7` | 2 | 2 confermate, entrambe gia' raccolte |
| 28/08 14:16 | `1c7d4c5` | 2 | premessa ribaltata al giro 08:23 — numero sul tavolo |
| 28/08 16:20 | `895c59d` | 3 | 1 confermata e raccolta, **2 confermate e APERTE** |
| 28/08 18:48 | `8c6566d` | 3 | 1 confermata e raccolta, 1 superata, 1 non riprodotta |
| 28/08 20:38 | `36191dd` | 2 | 1 confermata e raccolta, 1 non riprodotta |
| 28/08 22:24 | `67683e3` | 2 | 1 confermata e raccolta, 1 fuori dal mio scopo |
| 29/08 00:15 | `b20047e` | 2 | 2 confermate, entrambe gia' raccolte |
| 29/08 02:19 | `1dbc1c4` | 3 | 1 confermata e raccolta, 1 conferma, **1 mezza APERTA** |
| 29/08 04:35 | `1c8a323` | 2 | 1 confermata e raccolta, 1 premessa confermata |

**Restano aperte tre cose**, tutte riprodotte da me su questo HEAD: le due barre
dell'energia tarate `/100` che al punto di lavoro vivono in 0-6, il `PEAK, 10 s`
che balla del 44% fra un caricamento e l'altro, e `discesa.mp4` che pesa 953,4 KB
nel tetto dei filmati senza essere referenziato da nessuna riga.

**Metodo, e il suo limite.** Ho verificato tutto contro **`cbd0778`**, non contro
l'albero di lavoro, che oggi e' sporco su quindici file (il lavoro dell'atto due:
propulsione, giroscopio). Le misure sulla simulazione le ho fatte estraendo
`git show HEAD:src/scena/simulazione.js` in un file temporaneo, poi rimosso —
altrimenti avrei misurato la propulsione nuova invece del sito spedito. Dove
dico «gia' raccolta» ho letto la riga di codice, non il messaggio di commit.

---

## Le tre voci ancora APERTE

### 1 · `DRAW` e `RECOVERY` sono tarate `/100` e vivono in 0-6 — CONFERMATA

Giro delle **16:20, VOCE 2**. Riprodotta esatta su `cbd0778`, integrando la
simulazione per 180 s dopo 60 s di regime:

```
mare 4, 12 kn   DRAW 0,0/0,9/4,3     RECOVERY 0,00/0,33/1,65    <- il DEFAULT
mare 5, 12 kn   DRAW 0,0/1,2/5,8     RECOVERY 0,00/0,44/2,17
mare 5,  8 kn   DRAW 0,0/3,1/47,6    RECOVERY 0,00/1,12/16,87
mare 3,  6 kn   DRAW 0,0/3,1/35,0    RECOVERY 0,00/1,14/13,29
mare 5, 20 kn   DRAW 0,0/0,3/1,6     RECOVERY 0,00/0,13/0,63
```

(min/media/max; il revisore riportava 0,0/0,9/4,3 e 0,00/0,33/1,63 al default —
coincide.)

Il fondo scala e' scritto in due posti e in tutti e due dice cento:

    src/scena/simulazione.js:351-352
      const cT = aut > 0 &&  accelera ? Math.min(100, sforzo * 26) : 0
      const rT = aut > 0 && !accelera ? Math.min(100, sforzo * 10) : 0

    index.html:113,118
      <output id="v-carico">0</output><i>/100</i>
      <output id="v-recupero">0</output><i>/100</i>

    src/ui/letture.js:22-23
      el.fCarico.style.right   = `${100 - S.carico}%`
      el.fRecupero.style.right = `${100 - S.recupero}%`

Al default `Math.round(S.recupero)` e' **0 quasi sempre** e la pista si riempie
dell'1-4%: invisibile. La scala usa il suo campo solo a 8 nodi e sotto — cioe'
dove il sito non parte, e dove per la sua stessa tesi le pinne non producono
effetto utile.

**Cosa NON decido io.** Ritarare il fondo scala, o dichiarare accanto che le
barre si riempiono in manovra, e' una scelta di messa in scena. La lascio come
numero sul tavolo: **il fondo scala reale al punto di lavoro e' ~6, non 100.**

*Nota che non cambia l'esito ma cambia l'urgenza:* con la propulsione dell'atto
due la velocita' smette di essere un cursore e diventa uno stato che passa per
8 nodi ogni volta che si spegne il motore. Il campo 0-48 di `DRAW` a 8 nodi
diventa quindi una cosa che il visitatore **attraversa**, non piu' un'andatura
che il sito non mostra mai. La voce e' della 16:20 ma vale piu' oggi di allora.

### 2 · `PEAK, 10 s` oscilla del 44% fra un caricamento e l'altro — CONFERMATA

Giro delle **16:20, VOCE 3**. Tre semi, mare 5 / 12 nodi, 200 s di regime:

```
seme 1   PEAK 1,24°   riduzione 90,78%
seme 2   PEAK 0,78°   riduzione 90,78%
seme 3   PEAK 1,38°   riduzione 90,78%
```

Da 0,78 a 1,38 gradi: **44% fra gli estremi**, sullo stesso mare e alla stessa
andatura. Accanto, la riduzione e' **identica a due decimali su tutti e tre i
semi**. Il rumore e' tutto nel picco.

E il codice lo sa gia': `simulazione.js:36-39` dichiara che «il picco su finestra
finita NON converge», e `letture.js:83` porta la stessa nota. Ma la lettura in
pagina resta stampata con una cifra decimale, dalla stessa funzione e con la
stessa autorita' del 91%:

    src/ui/letture.js:3    const grad = (v) => v.toFixed(1).replace('.', ',')
    src/ui/letture.js:19   el.picco.textContent = grad(S.picco)
    index.html:187-188     <span class="et">Peak, 10 s</span> … <output id="v-picco">

Chi ricarica vede ballare un numero «misurato» accanto a uno che non balla, e
non ha modo di sapere quale dei due e' rumore.

**Cosa NON decido io.** Arrotondare a interi, cambiare l'etichetta, o lasciarlo
com'e': e' una decisione di messa in scena. Il numero sul tavolo e' **±44%
fra realizzazioni contro ±0,00 della riduzione**.

### 3 · `discesa.mp4` pesa 953,4 KB nel tetto e non lo carica nessuno — MEZZA CONFERMATA

Giro delle **02:19, VOCE 1**. La voce aveva due meta'. La prima e' **caduta**,
ed e' merito suo: diceva «e se 2,1 fosse una griglia troppo grossa, un 1,9-2,0
non provato potrebbe chiudere il divario». Su questo HEAD:

    src/scena/index.js:80    const RAGGIO_MECCANISMO = 2.0

La seconda meta' **regge intatta**. Il filmato per cui quella scala esiste non e'
montato in nessun punto del sito:

```
$ grep -rn "filmati/" src/ index.html
  src/scena/composito.js:135   'filmati/salone-largo.mp4'
  src/scena/salone.js:318      'filmati/salone-mare.mp4'
  src/scena/salone3d.js:59     'filmati/salone-largo.mp4'
  src/scena/salone3d.js:94     'filmati/salone-mare.mp4'
```

Nessun riferimento a `discesa.mp4`. Ma il byte parte lo stesso, perche'
`peso.mjs` somma **tutto** quello che sta nella cartella, referenziato o no:

    strumenti/peso.mjs:283-285
      for (const f of readdirSync('public/filmati')) {
        if (!f.endsWith('.mp4')) continue
        const b = statSync('public/filmati/' + f).size

```
$ ls -l public/filmati/
  discesa.mp4        976.258 B  = 953,4 KB   <- non referenziato
  salone-largo.mp4   662.283 B
  salone-mare.mp4    591.617 B
                   2.230.158 B  = 2,23 MB su un tetto di 4,0
```

**Il 43% del budget filmati e' occupato da un file che nessuno scarica**, perche'
niente lo chiede. Non e' un difetto di resa: e' un tetto che misura una cosa
diversa da quella che dichiara di proteggere.

E c'e' un seguito che vale piu' del singolo file. Il revisore proponeva, dopo il
caso `salone-teso.mp4`, «un cancello di build che verifica che ogni `.mp4`
referenziato nel sorgente esista in `public/filmati/`». Quel cancello **non e'
stato costruito** — `strumenti/` ha 25 collaudi e nessuno fa questo controllo —
e il caso `discesa.mp4` e' lo stesso guasto girato al contrario: un file che
esiste e non e' referenziato, invece di un riferimento senza file. Un cancello
che chiude tutte e due le direzioni costa poche righe e avrebbe preso entrambi.

**Cosa NON decido io.** Se `discesa.mp4` vada montato, spostato fuori da
`public/filmati/`, o tenuto li' in attesa: e' messa in scena. Il numero sul
tavolo e' **953,4 KB su 2,23 MB, non raggiungibili**.

---

## Le voci confermate e gia' raccolte

Le elenco con la riga che lo dimostra, perche' «e' gia' a posto» detto senza la
riga e' esattamente il tipo di affermazione che questo repo si vieta.

**12:20 · VOCE 1 — «la riduzione cambia col mare» non e' vera al punto di
lavoro. CONFERMATA, raccolta.** Riprodotta sulla tabella spedita:

```
v= 4  spread 40,57  [43,8 10,9  5,8  4,1  3,2]
v= 8  spread 63,26  [80,4 80,5 72,9 25,2 17,2]
v=12  spread  0,02  [90,8 90,8 90,8 90,8 90,8]   <- il default
v=20  spread  0,01  [96,6 96,6 96,6 96,6 96,6]
```

Curata dicendolo in pagina, non cambiando il modello: `src/ui/letture.js:60-83`
porta la tabella e la spiegazione («e' cio' che fa un sistema LINEARE»), e cita
la revisione esterna. Il modello ha ragione, la promessa nel commento no — ed e'
la promessa che e' stata tolta.

**12:20 · VOCE 2 — l'occlusione dell'impianto e' sovra-codificata. CONFERMATA,
raccolta e superata.** Il revisore misurava 51,7 KB e proponeva q60 → 31,3 KB.
Oggi, parsando il glb spedito:

```
public/modelli/impianto.glb   205,9 KB
  impianto_bassa-normale  33,3 KB
  impianto_bassa-ao       10,3 KB   <- era 51,7
```

Non 31,3: **10,3**. La cura e' andata piu' in la' della proposta.

**16:20 · VOCE 1 — il cancello dell'orizzonte misurava tutta la fascia, nave
compresa. CONFERMATA, raccolta.** `strumenti/collaudo-orizzonte.mjs:99-107` lo
dice per esteso («La prima versione misurava `crop=1400:160`, cioe' l'intera
fascia»), e adesso la struttura si prende come **mediana delle medie di colonna**
scartando le colonne della nave, con `STRUTTURA_MINIMA = 13` invece di 30
(riga 65). E' esattamente la cura che la voce indicava.

**18:48 · VOCE 2 — «il riflesso riflette una murata bianca» non era nello
shader. CONFERMATA, raccolta, e ha prodotto piu' di quanto chiedeva.**
`src/scena/acqua.js:764` ha ancora `envMapIntensity: 0` e il riflesso della nave
era un colore solo. Il commento a `acqua.js:493-517` accredita la smentita — «ed
e' corretto» — ma ne trae la conseguenza opposta e migliore: *una murata bianca
DOVREBBE specchiarsi chiara, e qui non lo faceva*. Da li' `uNaveSopra` e la
transizione sulla quota (`acqua.js:520-521`). La voce aveva ragione sul fatto e
il repo ne ha ricavato il difetto vero.

**20:38 · VOCE 2 — la normale della sovrastruttura, 23,5 KB per 0,55 livelli.
CONFERMATA, raccolta.** Parsando il glb spedito oggi:

```
public/modelli/sovrastruttura.glb   119,2 KB
  sovrastruttura-ao   17,6 KB     <- e basta: la normale non c'e' piu'
```

Una sola immagine, l'occlusione. La normale e' stata tolta (`67683e3`), come la
voce proponeva nella strada (a).

**22:24 · VOCE 1 + 00:15 · VOCI 1 e 2 — il cielo. TUTTE CONFERMATE, tutte
raccolte.** La catena e' la piu' pulita dei nove giri: il 22:24 dice che lo
scarto di colonna certifica «esiste un gradiente», non «esiste un cielo», e che
lo scarto **orizzontale** resta sotto 1; il 00:15 misura che le bande aggiunte
in risposta non dipingono sotto y≈0,36 e che in `vmax` su telefono tornano rampe
a tutta larghezza; il 02:19 verifica che la cura e' arrivata. Il codice oggi:

    src/stile.css:188-203   «I RAGGI SONO IN vw E vh, E PRIMA ERANO IN vmax»
                            con il conto 26-44vmax = 56-95% su 390x844
    src/stile.css:211-215   le cinque bande alte, ora in vw/vh
    src/stile.css:234-237   QUATTRO bande nuove centrate a y 36-42%,
                            cioe' dentro la striscia che incornicia la nave

Tutte e tre le voci sono nel codice, e il commento riporta il conto del revisore
quasi alla lettera.

**02:19 · VOCE 2 — `?doppia=1` chiedeva un filmato cancellato. CONFERMATA,
raccolta.** Era la voce piu' seria dei nove giri: un paracadute che non si apre.

    src/scena/composito.js:139-153   const TESA = null, con la spiegazione
                                     («un file mancante torna 200 con dentro
                                     index.html … trovato da una revisione
                                     esterna che ha guardato la RETE»)
    src/scena/salone.js:309-318      `mare-fuoribordo.mp4` -> `salone-mare.mp4`

Entrambi i rami morti sono chiusi. Resta non costruito il cancello che la voce
proponeva: vedi il punto 3 qui sopra.

**04:35 · VOCE 1 — la quarta luce non arrivava. CONFERMATA, raccolta.**
`src/scena/index.js:110-126`: la `fondale` non c'e' piu', e il commento riporta
la misura di conferma («spegnendola: acqua sotto la nave 0,000 di media»).
`LUCI` ha tre voci, non quattro.

---

## Le voci non riprodotte, o fuori dal mio scopo

**14:16 · VOCI 1 e 2 — lo spettro del mare.** Il giro delle 14:16 e' l'origine
della lettura «la leva e' il periodo modale, non il numero di righe», e su quel
punto e' **coerente con quanto e' stato poi verificato al giro delle 08:23** (§5:
il segno lo decide il periodo modale, crossover a ~5,8 s). La sua VOCE 1 pero'
conclude che il 90,8% sta «sul bordo ottimistico» normalizzando a **varianza
uguale** — ed e' la stessa premessa che il giro delle 08:23 ha smontato: in
questo modello lo stato del mare e' definito dal rollio a carena nuda
(`simulazione.js:46-47`), non da una varianza d'onda. Sotto la normalizzazione
del modello il segno si rovescia. **Non riprodotta come magnitudine**, premessa
gia' ribaltata. La VOCE 2 («tre righe bastano, non arricchire lo spettro») resta
in piedi e concorda con tutto il resto. Legare il periodo modale allo stato del
mare e' una decisione di dominio che non prendo io: resta numero sul tavolo.

**18:48 · VOCE 1 e 20:38 · VOCE 1 — l'ombra della nave sull'acqua.** La 18:48
misurava +7,3 livelli di inversione con la rampa vecchia; la 20:38, dopo la cura,
+8 con la nuova. La rampa e' quella che dice la 20:38:

    src/scena/acqua.js:856   uNaveOmbraRampa: { value: new Vector2(3.5, 0.9) }

Il resto **non l'ho riprodotto**: serve la pagina viva con `?ispeziona=1` e la
lettura dei pixel, e in questo giro non ho aperto il browser. Il numero della
20:38 (inversione dimezzata, non chiusa, e il residuo e' fisica giusta) resta la
misura piu' recente e non la contraddico — ma non la certifico nemmeno.

**18:48 · VOCE 3 — l'ordinamento fra ombra e riflesso e' indifferente.** Stessa
ragione: non riprodotta, serve il build e la misura tonale. Il ragionamento
(`occ ≈ 0,08`, quindi qualunque cosa moltiplichi muove poco) e' coerente con le
righe 464 e 490-521.

**04:35 · VOCE 2 — l'emisferica come causa nominata della sovrastruttura.
PREMESSA CONFERMATA, conseguenza non riprodotta.** Il fatto sta sulle righe:

    src/scena/index.js:106,275    emisfero: 2.7
                                  new HemisphereLight(0xe9e5dd, 0x071a1d, EMISFERO)
    riferimenti/blender/cuoci.py:486-490   due sole softbox AREA
    riferimenti/blender/cuoci.py:507-508   e un HDRI vero come world

Quindi e' vero che l'emisferica e' **l'unico riempimento del sito senza un
corrispettivo in `cuoci.py`**: Cycles ha l'ambiente (HDRI) e due luci ad area,
e nessuna luce che versi il cielo su ogni faccia rivolta in alto senza occludere.
La premessa e' solida. La **conseguenza** — che sia lei a spiegare il 41 contro
2,2 — richiede Cycles e la maschera esatta, che qui non ho, e va comunque ripresa
dopo il rilievo del giro delle 06:22 sulla curva tonale del banco (§5): i 41/2,2
sono stati letti in un confronto che forza AgX@0,5, non nella curva spedita.

**22:24 · VOCE 2 — la meta' superiore su telefono.** Giudizio visivo e proposta
di messa in scena (linea d'acqua CSS inclinata contro foschia). **Fuori dal mio
scopo**: la scelta e' del committente, e il §3.5 di `CHIEDO.md` la sta gia'
trattando.

---

## Cosa NON ho verificato

- **Niente di visivo, e niente che passi da un browser.** Le tre voci aperte e
  tutte le conferme poggiano su file, righe di codice e integrazione della
  simulazione in Node. Non ho aperto la pagina, non ho fatto schermate, non ho
  riletto nessuno dei giudizi visivi dei nove giri.
- **Niente che passi da Blender/Cycles**: i rapporti del §3.4, l'emisferica come
  causa, le camere a 0,05 px. Non li ho toccati.
- **L'inversione dell'acqua sotto la carena** (+7,3 / +8): non riprodotta, vedi
  sopra.
- **I due re-invii del giro delle 07:00** (`nautica_2026-08-28_0700_97b3204_v3.md`
  e `_v5.md`, 24,6 e 40,4 KB) sono revisioni successive di un giro **gia'
  risposto** al §5. Non li ho riletti voce per voce: se contengono materiale che
  la versione originale non aveva, quel materiale e' ancora non verificato, e lo
  dichiaro invece di far finta che il giro sia chiuso.
- **L'albero di lavoro.** Quindici file sono modificati e non commessi (l'atto
  due). Ogni numero qui sopra e' misurato su `cbd0778`; se una di quelle modifiche
  tocca `simulazione.js`, `letture.js` o `index.html` — e le tocca tutte e tre —
  le tre voci aperte vanno rimisurate quando l'atto due sara' commesso.
