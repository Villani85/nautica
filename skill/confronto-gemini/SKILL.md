---
name: confronto-gemini
description: Registra un sito con Playwright, lo carica su un Gem di Gemini (hce 3.0) e ne ricava un giudizio severo, anche in confronto alla cieca con un sito di riferimento. Usala quando serve una valutazione esterna del design, del ritmo dello scroll o del valore commerciale di una pagina, o per iterare "cambio → registro → faccio valutare → correggo".
---

# confronto-gemini

Chiude il ciclo **cambio → registro → faccio valutare → correggo** in un comando.

```bash
python ~/.claude/skills/confronto-gemini/confronta.py http://localhost:8891/
python ~/.claude/skills/confronto-gemini/confronta.py http://localhost:8891/ --contro https://thedamai.codebydennis.com/
```

Prima volta: serve la sessione salvata del browser — `python gemini.py --login`.
Senza, lo script si ferma e lo dice. **Non digitare tu le credenziali al posto
dell'utente.**

## La cosa da non dimenticare

Per tre valutazioni di fila, sul demo della masseria, il giudizio è stato più
basso del dovuto **perché il filmato mostrava solo lo scroll**. Il calendario e
il pannello di dettaglio erano già costruiti, ma non si vedevano: chi giudica
non premia quello che non vede. Appena il video ha mostrato anche le
interazioni, la valutazione è salita di quattromila euro **senza toccare una
riga del sito**.

Per questo lo script apre da solo calendario e schede prima di scorrere, ed è
il comportamento predefinito. `--niente-interazioni` esiste solo per i casi in
cui davvero non servono.

> Il materiale con cui mostri il lavoro fa parte del lavoro.

## Regola non negoziabile: il confronto è anonimo

I file si chiamano `sito_A` / `sito_B` (lo script lo fa già) e **nel prompt non
si dice mai quale sia il nostro, cosa è stato cambiato, né cosa aveva detto il
giro precedente**. Prompt asciutto: cosa guardare, non cosa pensare.

Non è una formalità. Sullo stesso demo, stessi filmati, quattro valutazioni:
quando ho elencato io le correzioni e fornito le mie misure, il giudizio si è
ribaltato a favore (8–10k, «funziona nettamente meglio»); in una chat nuova e
neutra è tornato indietro (2–3k, «perde»). Lo stesso sito ha oscillato **fra
2.000 e 50.000 euro** a seconda di come formulavo la domanda. Il testo intorno
ai file pesa più dei file.

Corollario: **non rilanciare finché non esce il numero che si vuole.** Uscirà —
è già uscito. Ma a quel punto si è scelta la risposta, non verificata.

Il verdetto finale va chiesto in una **chat nuova**, senza la memoria dei giri
precedenti.

## Come leggere il risultato

- **Verifica sempre l'attribuzione.** Nel confronto alla cieca Gemini ha
  invertito le lettere A e B, pur avendo legato le descrizioni ai marchi
  giusti. Se non lo si controlla si riporta un risultato ribaltato. La domanda
  del confronto chiede già di citare il nome del file *e* il marchio letto a
  schermo: se le due cose non tornano, chiedi una verifica secca prima di
  usare il verdetto.
- **Controlla l'intestazione della risposta.** Deve dire `hce 3.0 ha detto`.
  Se dice solo `Gemini ha detto`, sei finito nella chat normale e non nel Gem:
  «Nuova chat» dalla barra laterale porta fuori dal Gem.
- **Le cifre non sono preventivi.** Sono il giudizio di un modello su una
  registrazione compressa. Un sito con fotografia vera e contenuti reali perde
  molto in un filmato a 20 fotogrammi: valutarlo basso lì non significa che
  valga poco. Riporta la cifra come indicazione di distanza relativa, mai come
  prezzo.
- **Distingui i rilievi veri dalle confabulazioni.** Sono arrivate critiche a
  elementi inesistenti (didascalie numerate mai scritte). Prima di correggere,
  vai a guardare il fotogramma al secondo indicato.

## Trappole già pagate

- **Niente a capo nel prompt**: sull'editor di Gemini mandano il messaggio a
  metà e la risposta arriva su un testo monco.
- Il campo per i file **non esiste** finché non si apre il menu degli allegati.
- Dopo il caricamento servono alcuni secondi perché il filmato venga
  trascritto: chiedere subito produce una risposta che ignora il video.
- Si aspetta la **scomparsa del pulsante di interruzione**, non un tempo fisso.
- L'interfaccia a volte si carica vuota: le schede ferme su una conversazione
  reggono, quelle appena navigate no. Se succede, ricaricare e riprovare più
  tardi; non insistere oltre due o tre tentativi.
- Le risposte lunghe si troncano a metà: se il testo finisce spezzato, chiedere
  di riprendere dal punto esatto citando l'ultima parola letta.

## Registrare in modo che il confronto valga qualcosa

Un confronto vale solo se le due registrazioni sono comparabili. Cose imparate
pagandole, tutte misurate:

- **Serve Chrome vero, non il Chromium di Playwright.** Quello di Playwright non
  ha i codec proprietari: un `<video>` H.264 resta nero e si finisce per
  misurare il buio. `p.chromium.launch(channel="chrome")`.
- **`window.scrollTo` non muove i siti con scroll morbido.** Su towerdoors il
  75% dei fotogrammi risultava identico: il loro motore intercetta la rotella e
  ignora lo spostamento programmato. Si usano eventi rotella veri
  (`page.mouse.wheel`), che sono trusted.
- **Aspettare il preloader PRIMA di iniziare a riprendere.** Metà del filmato del
  riferimento era la sua barra di caricamento (0% → 35%), e il confronto avrebbe
  giudicato l'attesa invece del disegno. Si aspetta fuori ripresa e il tempo di
  caricamento si misura a parte, come dato separato.
- **Stessa velocità in pixel al secondo per entrambi**, o vince il più corto.
- **Contare sempre i fotogrammi duplicati** e dirlo. Sopra il 50% il filmato
  mente e il giudizio non vale.

## Quante volte ripetere

Una sola valutazione non prova niente, né in bene né in male. Su sei confronti
identici (stessa domanda, stesso Gem, chat nuova ogni volta) lo stesso sito di
riferimento **immutato** è stato valutato 18–28k tre volte e 12–20k le altre, e
il verdetto si è ribaltato due volte. Servono almeno tre round, e si riporta la
serie, non il numero migliore.

**Prima di correggere un difetto citato, misurarlo.** In due round su sei i
difetti non esistevano: contrasto misurato 11,7:1 descritto come sotto le linee
guida, e un pannello che entra in scena letto come "scroll orizzontale rotto"
(scroll orizzontale del documento misurato a 0 px).

Le correzioni vere si riconoscono perché migliorano una misura ripetibile:
quota di schermate mezze vuote, contrasto, riempimento dei riquadri
fotografici, fotogrammi duplicati, bersagli del dito sotto i 44 px.

## Se il sito ha un video guidato dallo scroll

- **Il server deve rispondere alle richieste Range.** Senza, si assegna
  `video.currentTime` e resta a zero, senza un solo errore in console. Il
  `python -m http.server` normale NON le supporta: serve un handler che
  risponda 206.
- **Ricodificare con ogni fotogramma keyframe** (`-g 1 -keyint_min 1
  -sc_threshold 0`). Misurato su 45 passi di scroll: 37,4 ms di attesa media
  con keyframe radi contro **2,4–3,8 ms** con ogni fotogramma keyframe. Un
  fotogramma a 60 fps dura 16,7 ms: nel primo caso l'immagine arriva due-sei
  fotogrammi dopo il dito, ed è lo scatto che nei giudizi diventa "rendering
  incoerente". Costa circa 8 volte il peso e vale ogni byte.
- 10 s a 30 fps = 300 fotogrammi, più dei 214 di una image-sequence tipica.

## Se il sito ha una scena 3D

- **L'inquadratura si calcola, non si regola a occhio.** Scritta a mano
  l'oggetto usciva dal campo appena la finestra si stringeva, e negli ultimi
  atti la camera finiva dentro l'oggetto. Si misura la **scatola** d'ingombro,
  non la sfera: su 390x844 il campo orizzontale è 18 gradi, e con la sfera un
  divano da 220 cm mandava la camera a sette metri e mezzo, lasciando il
  fotogramma quasi tutto nero.
- **Si misura l'oggetto MONTATO**, non lo stato corrente, o la camera indietreggia
  a ogni pezzo che entra.
- **Su schermo verticale conviene far uscire l'oggetto dai lati**: un oggetto
  intero perso nel nero si legge come vuoto, uno che sfora ai bordi si legge
  come ingombro. L'altezza invece deve starci sempre.
- **Il giro della camera si scrive al contrario**: si decide dove deve FINIRE —
  il tre quarti anteriore, l'inquadratura da catalogo — e si torna indietro.
  Scritto in avanti finiva a 200 gradi, cioè dietro l'oggetto, e l'ultimo
  fotogramma (quello che vende) mostrava lo schienale.
- **Senza mappa d'ambiente e tone mapping un render Three.js sembra un disegno
  tecnico colorato.** Le tre righe che cambiano tutto: `outputColorSpace`,
  `ACESFilmicToneMapping`, e una `PMREMGenerator` cotta da una scenetta di
  piani colorati (pavimento scuro, cielo caldo, due softbox) — zero byte
  scaricati. I materiali fisici hanno bisogno di qualcosa DA RIFLETTERE.
- **Contare i pezzi visibili risalendo ai genitori**: `traverse()` visita anche i
  figli di un gruppo spento e i loro flag restano `visible:true`, quindi il
  contatore arrivava al totale mentre a schermo mancavano due atti.
- **Le primitive fanno casse.** Vanno bene per telai, listelli, profili, pannelli;
  non per oggetti morbidi. Un divano finito costruito con box resta una
  cassapanca per quanto lo si illumini: il fotorealismo va portato da altro.

## Un blocco solo, una funzione sola

Due tratti pinnati con due grilletti separati si sovrappongono. Durante il
ricalcolo GSAP **smonta i blocchi**, quindi un grilletto creato dopo misura la
pagina più corta di tutto lo spazio dei pin che stanno sopra: misurato uno
scarto di esattamente 4200 px, cioè la lunghezza del blocco precedente, con il
video finale che girava mentre l'oggetto si stava ancora montando.

Non bastano né `refreshPriority` né `start`/`end` come funzioni. La cosa che
funziona è **un blocco solo**, con una sola funzione `applica(progresso)` da cui
discendono tutti gli atti. È anche più facile da leggere.

## Regole CSS larghe che ribaltano quelle strette

Ripetuto quattro volte su due progetti: una regola generica scritta PRIMA vince
su una specifica scritta DOPO, perché ha più peso.

- `.maschera button{background:var(--oro)}` ribaltava `.riassunto{background:...}`
  perché `.riassunto` è un `<button>` (0,1,1 contro 0,1,0).
- `.micro` non azzerava il fondo predefinito del browser: **tutti** i pulsanti-testo
  mostravano il rettangolo grigio ButtonFace. Nelle sezioni chiare non si notava,
  nel piede scuro era un rettangolo vuoto con dentro una scritta invisibile.
- Una regola per il telefono `.media.pieno{height:56svh}` tagliava anche la
  fotografia di copertina, a 473 px su 844: sotto restava mezzo schermo nero.

Quando un elemento non si comporta come dice la sua regola, cercare **tutte** le
regole che lo toccano prima di riscrivere la sua.

## Opzioni utili

| | |
|---|---|
| `--contro URL` | confronto alla cieca; i file diventano `sito_A` e `sito_B` |
| `--gem hce` | Gem da usare (predefinito). Vuoto = Gemini normale |
| `--domanda file.txt` | sostituisce la domanda predefinita |
| `--solo-video` | registra e basta |
| `--vedi` | mostra la finestra, per capire dove si inceppa |
| `--attesa 9` | secondi di apertura da riprendere per intero |

## Gli attrezzi accanto allo script

| file | a cosa serve |
|---|---|
| `confronta.py` | il ciclo completo: registra, carica, chiede, riporta |
| `registra.py` | registra un sito componendo il filmato dagli screenshot, con rotella vera e attesa del preloader: `python registra.py URL nome 390 844 2 --tocco --attendi 30` |
| `servi_range.py` | server minimo che risponde alle richieste Range: senza, un video guidato dallo scroll non si muove — `python servi_range.py 8893 cartella` |

Video e risposta finiscono in `giudizi/`, con la data e il collegamento alla
conversazione.

Vedi anche [[esplora-chrome-registra-playwright]]: esplorare col browser,
registrare con Playwright.
