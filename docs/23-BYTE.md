# 23 — I BYTE VERI FINO AL PRIMO FOTOGRAMMA

Una misura sola: **quanti byte scarica il browser prima che la scena disegni.**

**Risposta corta:** il percorso critico dichiarato in pagina — «15.1 KB gzip,
font esclusi» — è **vero per quello che descrive** (il primo testo dipinto),
ed è **134 volte più piccolo** di quello che l'utente paga prima di vedere il
primo fotogramma della scena: **2.074.542 byte, cioè 2,03 MiB sul filo.**

I due filmati del salone **partono PRIMA del primo fotogramma**, non dopo. Su
rete veloce arrivano interi — 1,44 MB — prima che la scena disegni.

---

## 1. Come è stata presa

| voce | valore |
|---|---|
| compilazione | `npm run build`, `dist/` del 27/08 12:37 (`index-CISU3hP8.js`) |
| server | `vite preview` **mio**, porta 5200 — vedi §6 |
| browser | `strumenti/browser.mjs`, `CHROMIUM=1`, headless, 1440×900 |
| indirizzo | `/nautica/?ispeziona=1` |
| conteggio | CDP `Network.dataReceived.encodedDataLength` — **byte sul filo**, cioè già compressi, non decompressi |
| cache | disattivata (`Network.setCacheDisabled`) |
| stop | sentinella `requestAnimationFrame` dentro la pagina, che segna l'istante in cui `window.__nautica.fotogrammi > 1` |

Due corse a piena velocità hanno dato **lo stesso totale al byte** (2.074.542),
con tempi diversi (taglio a 11,0 s e a 3,7 s): il totale è stabile, il tempo no.
Una terza corsa è stata strozzata a 1,5 Mbit/s per vedere l'ordine vero degli
arrivi (§4).

---

## 2. La tabella: byte sul filo al primo fotogramma

Compressi come li manda il server. HTML, JS e CSS viaggiano **gzip**; font,
`.glb`, `.mp4` e PNG viaggiano `identity` perché sono già formati compressi.

| tipo | richieste | **byte sul filo** | (decompressi) |
|---|---:|---:|---:|
| **filmati** `.mp4` | 2 | **1.445.530** | 1.444.846 |
| **modelli** `.glb` | 2 | **376.556** | 376.004 |
| **JS** | 4 | **192.423** | 709.977 |
| **font** `.woff2` | 1 | **40.928** | 40.608 |
| **HTML** | 1 | **8.187** | 20.770 |
| **immagini** `.png` | 1 | **5.773** | 5.456 |
| **CSS** | 1 | **5.145** | 19.302 |
| **TOTALE** | **12** | **2.074.542** | 2.616.963 |

2.074.542 B = **2,03 MiB**. Font esclusi (per confrontare con il numero
pubblicato, che li esclude): **2.033.614 B = 1,94 MiB**.

Il dettaglio, in ordine di partenza (corsa veloce, taglio a 3.664 ms):

| file | filo | codifica | parte a | finisce a |
|---|---:|---|---:|---:|
| `index.html` | 8.187 | gzip | 15 ms | 51 ms |
| `font/recursive-var.woff2` | 40.928 | identity | 15 ms | 463 ms |
| `assets/index-CISU3hP8.js` | 3.326 | gzip | 15 ms | 52 ms |
| `assets/index-BLhjqtQ2.css` | 5.145 | gzip | 15 ms | 52 ms |
| `assets/demo-DqPQbGCr.js` | 38.616 | gzip | subito dopo | prima del taglio |
| `assets/stato-Ba7Gr6tw.js` | 66.694 | gzip | subito dopo | prima del taglio |
| `assets/ambiente-DbWhprY_.js` | 83.787 | gzip | subito dopo | prima del taglio |
| `modelli/impianto.glb` | 317.249 | identity | dopo il motore | prima del taglio |
| `modelli/sovrastruttura.glb` | 59.307 | identity | dopo il motore | prima del taglio |
| `salone/finestrone.png` | 5.773 | identity | dopo il motore | prima del taglio |
| `filmati/salone-largo.mp4` | 853.571 | identity | **prima del taglio** | vedi §4 |
| `filmati/salone-mare.mp4` | 591.959 | identity | **prima del taglio** | vedi §4 |

Nei sei secondi **dopo** il primo fotogramma non arriva **niente**: zero
richieste nuove, zero byte nuovi. Tutto il traffico del sito, fino a quel
punto della pagina, sta prima della prima immagine disegnata.

---

## 3. I due numeri accanto

Il numero pubblicato non è falso: **descrive un'altra cosa.**

| cosa si misura | byte sul filo, font esclusi |
|---|---:|
| **fino al primo TESTO dipinto** (first-contentful-paint, misurato a 416 ms) | **16.658 B — 16,3 KiB** |
| **fino al primo FOTOGRAMMA disegnato** (`fotogrammi > 1`) | **2.033.614 B — 1,94 MiB** |
| dichiarato in pagina, «Critical path, fonts excluded (gzip)» | **15,1 KB** |

Al first-contentful-paint il browser ha scaricato 57.586 B in tutto, di cui
40.928 sono il font: restano `index.html` 8.187 + JS d'ingresso 3.326 + CSS
5.145 = **16.658 B**. Ricompresso con lo stesso gzip che usa `strumenti/peso.mjs`
(livello 9, sui file su disco) fa **15.617 B = 15,25 KiB**: la riga in pagina
dice 15,1 KB, quindi è **corretta nella sua definizione e vecchia di qualche
centinaio di byte** (la pagina e il CSS sono cresciuti dopo l'ultima scrittura).

**Il problema non è l'accuratezza: è la parola «critical».** Il percorso
critico del testo e il percorso critico dell'esperienza sono due cose diverse
di **due ordini di grandezza**, e la pagina pubblica solo il piccolo.

Due altre righe della stessa tabella, controllate:

| riga pubblicata | misurato sul filo | verdetto |
|---|---:|---|
| «3D models downloaded — 367 KB» | 376.556 B = 367,7 KiB | **giusta** |
| «3D engine, loaded only on demand (gzip) — 181.7 KB» | 189.097 B = 184,7 KiB (i tre pezzi differiti) | giusta come peso, **falsa come "on demand"** — vedi sotto |

Il motore 3D si dichiara *«requested only when the demonstration comes near»*.
Misurato: l'osservatore di `src/main.js` ha `rootMargin: '200% 0px'` e
`#dimostrazione` è la seconda sezione utile, quindi **scatta al caricamento,
senza che nessuno tocchi la rotella**. In tutte e tre le corse i 189 KB del
motore sono partiti da soli, a scroll fermo. È differito nel *codice*, non nel
*conto che paga l'utente*.

**E i filmati non compaiono da nessuna parte.** In tutto `index.html` non
esiste la parola *video*, né *footage*, né un peso in MB. 1,44 MB — **il 70%
di tutto ciò che l'utente scarica prima di vedere qualcosa** — non è in tabella.

---

## 4. I filmati: partono PRIMA, e la domanda vera è quanto ne arriva

`src/scena/salone3d.js` mette `v.preload = 'auto'` e assegna `src` mentre la
scena si costruisce. Non c'è nessun `await` sul video: il primo fotogramma
**non aspetta** i filmati. Ma la richiesta parte comunque prima.

| corsa | i filmati partono | primo fotogramma | filmato scaricato **al taglio** |
|---|---:|---:|---:|
| localhost, piena velocità | 9.852 ms | 11.007 ms | **1.445.530 B su 1.444.846 — tutto e due** |
| localhost, seconda corsa | — | 3.664 ms | **1.445.530 B — tutto e due** |
| strozzata a 1,5 Mbit/s | 9.551 ms | 10.352 ms | **162.692 B su 1.444.846 — l'11%** |

Quindi, in ordine di certezza:

1. **Partono prima del primo fotogramma. Sempre.** Misurato in tutte e tre le
   corse, con un margine fra 0,8 s e 1,2 s. Non è un caso di temporizzazione:
   è la costruzione della scena che assegna gli `src`, e la costruzione della
   scena precede il primo disegno per forza.
2. **Su rete veloce arrivano interi prima del primo fotogramma**: 1,44 MB su
   1,44 MB. Il browser ha tempo perché SwiftShader impiega qualche secondo a
   montare la scena, ma anche nella corsa veloce (taglio a 3,7 s) il totale è
   identico: i filmati erano già dentro.
3. **Su rete lenta ne arriva l'11% al taglio**, e il resto continua subito
   dopo — a quel punto da solo, perché non c'è più niente altro da scaricare.

Al taglio i due elementi `<video>` risultano `readyState = 4` e
`buffered = 13,5 s`, cioè **interamente in memoria**, sulla corsa veloce.

**La battuta del salone è la prima, e i suoi 1,44 MB stanno davanti alla
tenda, non dietro.**

---

## 5. Il costo, in una riga per rete

2.074.542 B sono, a rete piena:

| rete | tempo di solo scaricamento |
|---|---:|
| 1,5 Mbit/s (3G buono) | ~11,1 s |
| 5 Mbit/s (4G medio) | ~3,3 s |
| 25 Mbit/s (fibra) | ~0,7 s |

Il tempo del primo *testo* resta ottimo in tutti i casi: 16,7 KB arrivano
sempre entro mezzo secondo. È l'apertura della scena che si paga.

---

## 6. Cosa NON ho potuto misurare, e perché

- **Il server sulla 5180 non è `preview`: è `dev`.** Risponde con
  `/@vite/client` e `/src/main.js?t=...`, cioè moduli non impacchettati. Su
  quello i byte non hanno alcun rapporto con la produzione. Non l'ho toccato,
  come chiesto, e ho aperto un `vite preview` mio — finito sulla **5200**
  perché anche la 5199 era occupata. **Nessun numero di questo documento viene
  dalla 5180.**
- **Il `dist/` è stato ricompilato da un altro collaudo mentre misuravo.** I
  numeri qui si riferiscono al `dist` con `index-CISU3hP8.js` /
  `demo-DqPQbGCr.js`. Se gli hash in `dist/` sono cambiati, la misura va
  rifatta.
- **`vite preview` comprime con gzip, GitHub Pages pure — ma non allo stesso
  livello.** Il server ha mandato 3.326 B di JS d'ingresso dove `gzip -9` sul
  disco ne fa 2.955. Le cifre sul filo di questo documento sono quindi
  *leggermente pessimistiche* rispetto a Pages su HTML/JS/CSS: parliamo di
  qualche centinaio di byte su due megabyte. Nessuna conclusione cambia.
  **Brotli non è stato provato**: né questo server né la misura lo usano, e
  Pages lo offre — con Brotli i 16,7 KB del testo scenderebbero ancora, i
  2 MB no (filmati, `.glb`, font e PNG sono incomprimibili).
- **Macchina senza GPU, SwiftShader.** I *tempi* (3,7 s vs 11,0 s per lo
  stesso identico traffico) non dicono niente su un telefono o un portatile
  veri. I *byte* sì: sono gli stessi in tutte le corse.
- **Solo desktop 1440×900, e solo il primo schermo.** Non ho misurato cosa
  succede scorrendo oltre la dimostrazione, né una viewport da telefono, dove
  `riduzioni.json` potrebbe far scaricare risorse diverse.
- **`?ispeziona=1` è obbligatorio** perché `window.__nautica` esiste solo lì
  (`src/scena/index.js:710`). Non ho verificato che l'interruttore non cambi
  nient'altro nel traffico; leggendo `src/scena/guasto.js` sembra toccare solo
  annotazioni, ma non è una misura.
- **Non ho misurato Largest Contentful Paint su 4G reale**, che è la riga con
  il trattino nella tabella pubblicata. Resta col trattino.
- **`public/salone/vano.json` non viene mai richiesto** in questo percorso.
  Non ho indagato se sia morto o solo di un altro ramo.

---

## 7. Cosa direbbe una riga onesta in pagina

Non l'ho scritta — questo documento è di sola lettura sul sito. Ma il numero
esiste, ed è questo:

> Bytes downloaded before the first frame of the scene: **2.03 MB**
> — of which footage **1.44 MB**, 3D models **368 KB**, engine **185 KB**.
> Bytes before the first line of text: **16.7 KB**.
