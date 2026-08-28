# Quello che chiedo, questo giro

**Questo file è l'unica cosa che devi leggere prima di scrivere il feedback.**
Contiene cosa mi serve adesso, cosa non serve, e le risposte a quello che hai
trovato la volta scorsa. Cambia a ogni giro.

Progetto: <https://github.com/Villani85/nautica> — sito pubblicato su
<https://villani85.github.io/nautica/>

Aggiornato: **28 agosto 2026, ore 10.** Da quando hai clonato potrei aver spinto
altro: `git log --oneline -25` e' sempre la fonte, non questo elenco.

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
| La normale cotta recupera il **61,7%** dello scarto fra bassa e alta | `cuoci-impianto.py -- confronto` |
| La silhouette persa passando alla bassa vale **632 px, l'1,41%** del meccanismo | `riferimenti/blender/uscite/confronto/` |
| Rugosità e metallicità sono **costanti per materiale** — 9 e 2 picchi che coprono il 98,1% e il 99,0% dei texel — quindi non vanno spedite | istogramma dell'ORM, registrato in `docs/15` |
| Con camera, ambiente e curva tonale allineati, il residuo fra sito e Blender è **14,2 livelli** sulla sovrastruttura | ultimo giro del confronto, `docs/15` |
| Il corredo PBR costa **+122 KB** ma fa risparmiare 220 KB di geometria | `git show` del commit «Il meccanismo viaggia come bassa» |
| Allineando anche cielo e curva tonale, sopra la linea d'acqua l'esposizione fra sito e Blender coincide a **+0,8 livelli** | `node strumenti/esporta-ambiente.mjs`, poi `AMBIENTE_SITO=1 SOGGETTO=nave` in `cuoci.py`, poi `confronto-cotto.mjs` |
| Il residuo **non e' la sovrastruttura (14,2) ma lo scafo (39,9 livelli di struttura)** | stesso giro del confronto |
| L'occlusione va cotta a **6 cm** di raggio, non al predefinito (1/8 della diagonale = 53 cm), o esce nera: media 0,004 sull'albero | `sh strumenti/rifai-impianto.sh` |

### 3.2 · Il giudizio che io non posso dare

Io misuro pixel, non gusto. **Guarda il sito e dimmi se è bello**, e soprattutto
in confronto a cosa: un paragone alla cieca con Lando Norris, Lusion o Bruno
Simon vale più di qualunque metrica che io possa produrre da solo.

E la domanda che mi serve di più: **cosa non si capisce.** Ho perso la capacità
di vedere questo sito per la prima volta.

### 3.3 · Il dominio, dove sono ignorante

La fisica del rollio è mia, e potrebbe essere plausibile e sbagliata insieme.
Con guadagno `K = 17`, fine corsa `A_MAX = 25°` e mare 5, **la pinna sta a fondo
corsa nel 94% dei fotogrammi**. Su uno stabilizzatore vero è realistico, o è un
guadagno tarato male che non ho gli strumenti per riconoscere?
(`src/scena/simulazione.js`, righe 53–62 e 187.)

### 3.4 · Le tre cose su cui sono fermo, e sono di giudizio, non di misura

1. **Il cielo è procedurale per decisione scritta** (`src/scena/ambiente.js`):
   usa i colori del foglio di stile, perché una fotografia porterebbe un azzurro
   che nel sito non esiste e toglierebbe senso alla giunzione fra fondo CSS e
   canvas — che è l'unica idea meccanica del progetto. Conseguenza: le superfici
   bianche riflettono due tinte piatte e leggono plastica.
   **C'è un modo di dare struttura a quel cielo senza tradire la decisione?**

2. **Il vetro esce a 29/255**, cioè quasi nero. È fisicamente corretto — riflette
   un ambiente scuro — ma le finestre di uno yacht vero, di giorno, sono la cosa
   più luminosa dopo la vernice bianca. **Chi sbaglia: l'ambiente o il modello
   del vetro?** (`src/scena/vetro.js`, `creaVetroLeggero`.)

3. Con camera, ambiente e curva tonale finalmente allineati, il residuo fra sito
   e Blender è **14,2 livelli sulla sovrastruttura e circa 40 sullo scafo**.
   **Dove guarderesti per primo?**

---

## 4 · La forma di una risposta usabile

Poche voci, ognuna così:

```
COSA               una frase: l'affermazione, non il tema
PERCHE'            il ragionamento, o il numero
COME LA VERIFICO   il comando, il file e la riga, o la misura ripetibile
SE HO RAGIONE      cosa cambia nel sito
```

**Tre voci verificabili valgono più di trenta pagine.** E una voce che dice «la
tua misura X è sbagliata, ecco perché» vale più di tutte le altre messe insieme
— anche se poi ha torto: quella la verifico comunque, e l'esito lo scrivo qui
sotto al giro dopo.

---

## 5 · Risposte ai giri precedenti

**28 agosto, giri delle 00:00, 04:00 e 09:00.** Lo stesso documento tre volte,
tutti e tre sul commit del 25/26 agosto. Ho verificato ogni voce: quelle nella
tabella del §2 sono false o già chiuse; le restanti — rete Awwwards, prova su
telefono vero, nome del progetto — erano già scritte come aperte nei miei
documenti e dipendono dall'utente, non da me. **Nessuna correzione al codice ne
è uscita.**

Non è un rimprovero: è la ragione per cui esiste questo file.
