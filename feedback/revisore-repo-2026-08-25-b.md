# Contributo — seconda revisione del repository, 2026-08-25

Esaminato l'HEAD remoto al commit `c1a4268`.

**Verdetto del contributore:** *"è migliorato molto l'audit, ma non è migliorato
ancora il sito. Il prototipo è identico al commit precedente, byte per byte.
Quindi titolo, perdita di memoria, modale, touch, mobile e assenza di preview
sono ancora presenti: sono stati riconosciuti, non corretti."*

Affidabilità della documentazione: da ~5,5 a **7,5/10**.

**Indicazione operativa:** *"Ora basta documentazione. Il prossimo commit deve
contenere il sito, altrimenti il giro 2 è soltanto una spiegazione molto ben
scritta del perché il giro 1 non funzionava."*

---

## Le cinque correzioni ai documenti

**C1** — In `04-MISURE` compare ancora "Lighthouse ≥70 — gate Mobile Excellence",
mentre `02-OBIETTIVO-9` dice che quel gate non esiste. Contraddizione interna.

**C2** — "Il lavoro d'autore è 4,1 KB" è sbagliato: sono stati contati solo i
4,1 KB gzip della simulazione, ignorando HTML e CSS scritti dall'autore.
Escludendo three.js e i font: circa 23.082 B raw e 7.618 B gzip.

**C3** — "145,3 KB di codice mai eseguito" è impreciso: il bundle viene comunque
analizzato e valutato. Sono API prevalentemente inutilizzate, non codice
completamente ineseguito.

**C4** — Contraddizione numerica: "un momento reale su sei" e subito dopo "tre
dei sei non esistono". Se uno solo esiste, ne mancano cinque. E P02 parla ancora
di cinque momenti mentre `02-OBIETTIVO-9` ne elenca sei.

**C5** — P01-bis rimanda a D14, ma il falso rubric è disciplinato da D13. D14
riguarda il Developer Award.

## Precisazione sui bersagli tattili

44×44 è un ottimo obiettivo ed è richiesto da Apple; in WCAG è il criterio
**avanzato AAA**. Il minimo WCAG 2.2 **AA è 24×24** o spaziatura equivalente.
I controlli da 20×7 px fallivano comunque anche il minimo.

## Autocorrezione del contributore precedente

Il contributore che aveva scritto F1 ha ricontrollato le proprie affermazioni e
ne ha trovata una sbagliata, **sbagliata nello stesso modo di cui accusava il
documento**: aveva scritto "nessun gate Mobile Excellence ≥ 70/100" avendo
controllato una pagina sola.

**Il gate esiste**: Awwwards ha una track Mobile Excellence valutata sui criteri
mobile di Google, con soglia di qualificazione a 70/100, dopo la quale la giuria
applica i quattro criteri. Non sta su `/about-evaluation/`, ma esiste. È una
**track premio separata**, non un cancello sul SOTD.

Il nucleo di F1 regge: gli anchor con i nomi delle famiglie tipografiche non
sono un rubric ufficiale. E l'articolo di terzi più vicino a quelle formulazioni
sostiene che i giurati votano **il sistema tipografico — scala, ritmo, gerarchia
coerenti su ogni breakpoint — non la singola famiglia**: se la fonte è quella,
sostiene F3 e non P01.

## Tre fatti ufficiali che non stavano in nessun documento

**N1 — L'Honorable Mention richiede DUE punteggi da 6,5, non uno.** Serve 6,5 o
più dalla giuria *e* 6,5 o più dagli utenti con account Chief, Tribe, Pro o
International. Due votazioni separate, entrambe necessarie. Con rete community
pari a zero si può prendere 6,5 dalla giuria e non ricevere niente. È lavoro che
va fatto **mesi prima** della submission.

**N2 — Il punteggio della giuria è visibile solo ai vincitori del SOTD.** Se non
si vince non si sa mai su cosa si è perso: nessuna stima interna sarà mai
verificabile contro il voto reale.

**N3 — I progetti autoprodotti sono ammessi, esplicitamente.** Le FAQ escludono
i siti costruiti su template preconfezionati ma accettano i siti dimostrativi
purché design e sviluppo siano interamente di chi sottomette.

Contorno: per entrare nella giuria principale bisogna aver vinto almeno un SOTD.
Chi vota ha già fatto la cosa che si sta provando a fare.

---

# Esito della verifica

## L'indicazione operativa — **ACCOLTA, ED ESEGUITA IN QUESTO COMMIT**

L'osservazione centrale era giusta e non aveva repliche: al commit `c1a4268` il
repository conteneva sette documenti e zero righe di codice di produzione.

Questo commit contiene il sito: Vite 8.2.2 + three 0.185.1 a moduli ES, cinque
sezioni, la dimostrazione portata e i difetti corretti. Il dettaglio sta in
`STATO.md`.

## C1 — **CONFERMATA.** Corretta, ma non come chiedeva il contributore

`04-MISURE` è stato corretto — però la contraddizione andava sciolta **al
contrario** di come sembrava. Non era `04-MISURE` a sbagliare dicendo che il
gate esiste: era `02-OBIETTIVO-9` a sbagliare negandolo (vedi l'autocorrezione
qui sopra, confermata).

La riga resta, con la funzione giusta: Mobile Excellence è una **track premio a
sé**, non un cancello sul SOTD, e la soglia 70/100 è reale.

## C2 — **CONFERMATA. Rimisurata qui, e i numeri coincidono.**

Tutto il file meno il bundle three.js meno i quattro blocchi base64 dei font:

| | raw | gzip |
|---|---|---|
| misura del contributore | 23.082 B | 7.618 B |
| rimisurata qui | 23.647 B | 7.673 B |

Lo scarto è dove si taglia il confine fra i blocchi, non di sostanza. **Il "4,1
KB" contava solo il secondo `<script>` e buttava via HTML e CSS d'autore**, che
sono lavoro quanto il resto — anzi, il taglio del titolo vive proprio nel CSS.

È lo stesso errore di metodo del giro 2 in versione più piccola: un numero vero
(il peso di quel blocco) usato per rispondere a una domanda diversa (quanto vale
il lavoro d'autore).

## C3 — **CONFERMATA**

"Codice mai eseguito" è impreciso e la formulazione è stata cambiata in "API
prevalentemente inutilizzate". La distinzione conta perché è la ragione per cui
la cura non era la scrematura ma il **caricamento differito**: quel codice il
browser lo scarica, lo decomprime e lo analizza comunque, ed è esattamente
quello che ora non fa più finché la dimostrazione non serve.

## C4 — **CONFERMATA su entrambe le contraddizioni**

Il conto giusto è: **sei momenti previsti, uno costruito, cinque mancanti.** La
frase "tre dei sei non esistono" era rimasta dalla revisione precedente, quando
i momenti elencati erano cinque. Corretti sia il conteggio sia P02.

Con questo commit i momenti costruiti diventano **due**: la dimostrazione, e il
taglio del titolo — che ora esiste davvero.

## C5 — **CONFERMATA**

Rimando corretto: P01-bis → **D13** (il metro interno si dichiara interno).

## Bersagli tattili — **CONFERMATA, ed è una correzione che mi riguarda**

Avevo scritto "44×44 px, fonte WCAG / Apple HIG" mettendo insieme due cose
diverse. Il quadro giusto:

- **WCAG 2.2 AA — minimo: 24×24 px** o spaziatura equivalente;
- **WCAG 2.2 AAA — avanzato: 44×44 px**;
- **Apple HIG: 44×44 pt**, che è un requisito della piattaforma, non di WCAG.

I 20×7 px del prototipo fallivano anche il minimo AA, quindi la conclusione non
cambia — ma l'attribuzione sì, ed è il terzo caso in due giorni in cui una
soglia giusta era appesa alla fonte sbagliata. I 44×44 restano l'obiettivo:
sono già implementati, ed è una scelta, non un obbligo.

## N1 — **ACCOLTA. È il fatto più pesante arrivato finora.**

Nessun documento lo diceva, e cambia il piano più di qualunque nota sul
carattere tipografico: **due votazioni separate, entrambe da superare.** Una
rete community pari a zero rende irraggiungibile perfino l'Honorable Mention,
per quanto buono sia il sito.

Non è lavoro di sviluppo, ha tempi lunghi e va cominciato molto prima della
submission. Entra in `docs/03-DECISIONI.md` come questione aperta A05 —
attualmente **la più a rischio di tutte**, perché è l'unica che non si può
recuperare lavorando meglio nelle ultime settimane.

## N2 — **ACCOLTA, con una conseguenza sul metodo**

Se il punteggio si vede solo vincendo, allora la scorecard interna **non potrà
mai essere tarata contro la realtà**. Resta utile per discutere e per ordinare
il lavoro, e va detto ogni volta che compare. Un metro che non si può
confrontare con niente non è un metro: è una convenzione condivisa.

## N3 — **ACCOLTA, e toglie un rischio che nessuno aveva controllato**

Un sito a tesi autoprodotto è ammissibile purché design e sviluppo siano
interamente di chi sottomette. Lo sono: geometria procedurale, zero modelli di
terzi, zero librerie di componenti, zero CDN. Il vincolo D05 del brief, preso
per ragioni di licenza e di peso, risulta anche il vincolo che tiene il progetto
dentro le regole.

## Sul "prototipo identico byte per byte"

Vero e giusto da segnalare. Il prototipo **resta** identico anche dopo questo
commit, ed è voluto: è il reperto di partenza. Il lavoro sta in `src/`, e la
differenza fra i due si legge affiancandoli.
