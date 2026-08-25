# Stato del progetto

**Aggiornato:** 2026-08-25 · **Giro:** 3 · **Fase:** il sito esiste.

---

## Cosa contiene questo commit

**Il sito.** Vite 8.2.2 + three 0.185.1 a moduli ES, cinque sezioni, la
dimostrazione portata dal prototipo e i difetti corretti. Il commit precedente
era stato giudicato — giustamente — *"una spiegazione molto ben scritta del
perché il giro 1 non funzionava"*.

### Il peso, misurato sulla compilazione di produzione

| | raw | gzip | brotli |
|---|---|---|---|
| **percorso critico** (HTML + CSS + JS) | 23,1 KB | **7,6 KB** | 6,7 KB |
| font, self-hosted e sottoinsiemati | 67,2 KB | 67,2 KB | 67,2 KB |
| motore 3D, **caricato solo all'occorrenza** | 549,2 KB | 138,9 KB | 114,1 KB |
| JS totale | | **140,4 KB** | (cancello del brief: 250 KB) |

**Da 221,6 KB gzipped tutti insieme a 7,6 KB prima del primo disegno.** Il
motore 3D si carica quando la dimostrazione si avvicina, non prima. È la ragione
vera per cui il porto valeva la pena: misurato, il guadagno di *peso* era sotto
il chilobyte — il guadagno sta nel non avere 139 KB di motore fra chi apre la
pagina e la prima cosa che legge.

### I difetti corretti, tutti verificati prima e dopo

1. **Il taglio del titolo ora esiste.** Era dichiarato nei commenti del
   prototipo e non implementato: nessun `clip-path` in tutto il file. Ora le due
   copie sono ritagliate sulla **quota reale** della linea, misurata sui nodi e
   ricalcolata a ogni ridimensionamento e a font caricati.
2. **Perdita di memoria e rallentamento progressivo** con `prefers-reduced-motion`:
   la finestra dei picchi usa un orologio che avanza sempre, più un tetto rigido
   sui campioni. Due difese indipendenti.
3. **Movimento ridotto onorato dentro l'esperienza**: niente oscillazione
   autonoma, ma i due stati restano confrontabili — la tesi resta dimostrabile.
4. **Modale**: `<dialog>` nativo. Trappola del focus, Escape, inertizzazione e
   ritorno del focus sono del browser, non codice nostro che può sbagliare.
5. **Bersagli tattili 44×44** con il segno visibile che resta sottile.
6. **Parità su mobile**: il richiamo commerciale non è più `display:none`.
7. **Navigazione da tastiera** per il punto di vista (frecce).

### Due difetti nuovi, trovati misurando in esecuzione

8. **Contrasto sotto soglia.** `--inchiostro-tenue:#6A6E72` sulla carta dava
   **4,09:1**, sotto il minimo AA. Corretto a `#5F6367` → **4,82:1**.
9. **Il canvas non combaciava col taglio.** `setSize()` scrive anche lo stile in
   linea, che batte il foglio di stile: il canvas restava alto 730 in un
   contenitore da 678, e il suo centro — dove cade sempre la linea di
   galleggiamento — finiva **26 px sotto** lo stacco del fondo CSS. Si vedeva
   come una cucitura, ed era proprio l'idea del sito che si rompeva. Corretto con
   `setSize(w, h, false)` e un `ResizeObserver` sul contenitore. Verificato:
   scarto fra i centri **0 px**.

### E un difetto nel mio stesso codice di sicurezza

Il blocco che gestiva i guasti mostrava «serve WebGL» qualunque cosa fosse
andata storta. Durante il collaudo un modulo non è arrivato e la pagina ha
dichiarato all'utente che il suo browser non supporta WebGL. Era falso, e
nascondeva a me il guasto vero. Ora i due casi sono distinti e l'eccezione
finisce sempre in console.

---

## Una trappola in cui sono caduto, e che vale la pena leggere

Durante la verifica ho misurato che i pulsanti del mare non c'erano e che lo
stato era sbagliato. Stavo per correggere due difetti — **che non esistevano**.

La scheda del browser era in secondo piano, e Chrome non consegna le callback di
`IntersectionObserver` alle schede nascoste. Lo strumento non dava errore: dava
numeri, plausibili e sbagliati.

Se ne sono usciti tre insegnamenti concreti:
- una misura sul browser va accompagnata da `document.visibilityState`;
- il disallineamento del canvas invece era **vero**, e si è distinto dagli
  artefatti perché due osservazioni indipendenti concordavano: lo scarto nel DOM
  e la cucitura visibile nel provino;
- una prova che fallisce per tutte le varianti (qui: ogni `rootMargin`, incluso
  `0px`) non sta misurando la variante. Sta misurando altro.

---

## Il bersaglio, corretto

Era "9 su ogni criterio". Con i punteggi veri sotto gli occhi, va corretto —
e la correzione rende il progetto **più** ambizioso, non meno.

**Lando Norris** (OFF+BRAND), SOTD 17 nov 2025 e poi **Site of the Year 2025**:
**8,18/10** — Design 8,12 · Usability **7,90** · Creativity 8,71 · Content 8,18.
Bruno Simon, SOTM 2026: **8,11**.

**Il massimo premio dell'anno si prende con 8,2, non con 9.** E il criterio più
debole del sito dell'anno è la **Usability, a 7,90**, su un peso del 30%.

Il **Developer Award ha sei criteri suoi**, che nessun documento aveva: Semantics/SEO
7,40 · Animations 8,60 · **Accessibility 7,00** · WPO 7,60 · Responsive 7,40 ·
Markup 7,40. Il sito dell'anno prende **7,00 in accessibilità**: è il punto più
debole dei vincitori e il meno costoso da superare — ed è esattamente il terreno
di questo commit.

Il percorso completo e il piano stanno in `docs/05-PERCORSO-PREMIO.md`.

## Il prossimo passo: la sequenza d'oro

**Non si costruiscono le altre sezioni adesso.** Prima 20–30 secondi di
esperienza alla qualità finale: la superficie si apre, appare la nave, il mare
sale, l'utente accende il sistema, la nave si calma, il taglio entra nello
scafo, il meccanismo nascosto viene rivelato.

Con una regola che ha un esito possibile negativo: **se quella sequenza non
regge il confronto alla cieca con un Site of the Month, le altre quattro sezioni
non si fanno — si rifà la sequenza.**

---

## Le skill dello studio sono nel repo

`skill/` contiene il know-how con cui questo sito viene costruito e giudicato:
`stack-sito-immersivo`, `valuta-awwwards`, `render3d-in-video-reale`, `blender`.

Chi le usa legga prima `skill/README.md`: gli anchor di punteggio in
`valuta-awwwards` sono **una scala interna di studio, non criteri Awwwards**, e
scambiarli per ufficiali è già costato un giro di lavoro su questo progetto.

---

## Cosa manca ancora

- **La preview pubblica non è ancora attiva.** Il workflow c'è
  (`.github/workflows/pubblica.yml`) ma GitHub Pages va abilitato una volta
  nelle impostazioni del repository, con sorgente **GitHub Actions**.
- **Nessuna misura in esecuzione**: LCP, INP, CLS, FPS su Android reale,
  Lighthouse mobile. La sezione 3 del sito le mostra col trattino, ed è voluto:
  finché non sono misurate restano col trattino.
- **A05, la questione più a rischio**: l'Honorable Mention richiede 6,5 dalla
  giuria **e** 6,5 dagli utenti qualificati. Con rete community pari a zero non
  si prende nemmeno quello, e non si recupera lavorando meglio alla fine.
- **A01 nome** e **A02 lingua** restano aperte. Non bloccano la sequenza d'oro.
