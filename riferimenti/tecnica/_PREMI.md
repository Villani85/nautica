# Come si vince un premio Awwwards — il meccanismo, non i consigli

Ricerca del **13 agosto 2026**. Tutti i numeri hanno la fonte accanto.
Dove non ho potuto verificare, c'e' scritto **non verificato** e non ho stimato.

Oltre alle pagine ufficiali, ho **scaricato e analizzato i 31 Site of the Day
dal 14 luglio al 13 agosto 2026** (`awwwards.com/websites/sites_of_the_day/`)
ed estratto il punteggio per singolo criterio di ognuno. Le medie che seguono
sono calcolate su quel campione, non citate da terzi.

---

## CORREZIONE ALLA PREMESSA DELLA NOSTRA RICERCA

Nella ricerca precedente abbiamo annotato "usabilita' 7,37 su un sito con
design 8,37". **Quei due numeri non stanno sulla stessa scala dei punteggi
della giuria.** Su ogni scheda Awwwards ci sono due tabelle distinte:

| | Design | Usability | Creativity | Content | Totale |
|---|---:|---:|---:|---:|---:|
| **Giuria** (media 31 SOTD) | 7,36 | 7,12 | 7,47 | 7,31 | **7,30** |
| **Utenti Pro+Chief** (media 31 SOTD) | 8,78 | 8,37 | 8,66 | 8,38 | **8,59** |

Design 8,37 con usabilita' 7,37 e' un profilo da **tabella utenti**, non da
giuria. La differenza e' enorme: **la community vota in media 1,29 punti piu'
alto della giuria**. Confondere le due tabelle porta a credere che servano 8,4
di design per vincere. Non e' cosi': **nessuno dei 31 SOTD del mese ha preso
piu' di 7,69 di design dalla giuria.**

L'altro numero citato, accessibilita' 7,00, e' invece corretto e sta nella
terza tabella (Developer Award). Su quella la media dei vincitori e' **6,70**,
quindi 7,00 e' sopra la media. Vedi sezione 4.

---

## 1. I CRITERI DI VOTO E COME SI COMPONE IL PUNTEGGIO

### I quattro criteri e i pesi

Fonte: [awwwards.com/about-evaluation/](https://www.awwwards.com/about-evaluation/)

| Criterio | Peso |
|---|---:|
| Design | **40%** |
| Usability | **30%** |
| Creativity | **20%** |
| Content | **10%** |

### La formula esatta — verificata, non dedotta

```
totale = 0,40 x Design + 0,30 x Usability + 0,20 x Creativity + 0,10 x Content
```

**Verificata su 31 SOTD su 31.** Scarto massimo fra formula e punteggio
pubblicato: **0,006**; scarto medio **0,002**. Non c'e' nessun coefficiente
nascosto, nessun bonus mobile, nessun peso della community dentro il totale
della giuria.

Esempio (Izanami, SOTD): 7,16x0,4 + 7,10x0,3 + 7,34x0,2 + 7,29x0,1 = **7,19**,
esattamente il punteggio pubblicato.

**Conseguenza operativa immediata:** un punto guadagnato su Design vale
**quattro volte** un punto guadagnato su Content. Se stai scegliendo dove
mettere due settimane di lavoro, la matematica ha gia' deciso per te.

### Le soglie

| Premio | Soglia | Fonte |
|---|---|---|
| **Honorable Mention** | **6,5 dalla giuria E 6,5 dagli utenti** (due processi di voto separati, servono entrambi) | [FAQ Awwwards](https://www.awwwards.com/faqs/) |
| **Site of the Day** | Nessuna soglia fissa: *"only the sites scored the highest by the jury"*. Sono 365 all'anno | [about-evaluation](https://www.awwwards.com/about-evaluation/) |
| **SOTD, soglia reale osservata** | **minimo 7,17 — media 7,30 — massimo 7,65** (31 SOTD, 14 lug–13 ago 2026) | misurato da me |
| **Developer Award** | Solo per chi ha gia' vinto SOTD, e con punteggio **superiore a 7** dalla giuria dev | [about-evaluation](https://www.awwwards.com/about-evaluation/) |
| **Site of the Month** | Gli **8 punteggi piu' alti del mese**, rivotati una seconda volta dalla giuria | [about-evaluation](https://www.awwwards.com/about-evaluation/) |
| **Site of the Year** | Tutti i SOTM dell'anno + alcuni preferiti della redazione. Annuncio a **febbraio** dell'anno dopo | [about-evaluation](https://www.awwwards.com/about-evaluation/) |

**Il numero che conta davvero e' 7,2.** L'HM a 6,5 e' documentato, il SOTD no —
ma il campione dice che sotto 7,17 in quel mese non e' passato nessuno.

### Il Developer Award ha un impianto completamente diverso

Sei criteri, tabella separata, **5 giurati dev** (5 su 5 nei 26 casi con Dev
Award del mio campione, contro i ~19 della giuria design):

| Criterio dev | Media 26 vincitori | Min | Max |
|---|---:|---:|---:|
| Semantics / SEO | 7,10 | 6,6 | 7,6 |
| Animations / Transitions | **7,99** | 7,2 | 9,2 |
| **Accessibility** | **6,70** | **6,0** | 7,4 |
| WPO (performance) | 7,43 | 6,8 | 8,2 |
| Responsive Design | 7,41 | 6,8 | 7,8 |
| Markup / Meta-data | 7,15 | 6,6 | 7,6 |
| **Totale** | **7,33** | 7,05 | 7,81 |

Il totale e' **compatibile con la media semplice dei sei criteri** (23 casi su
26 rientrano nell'arrotondamento a 1 decimale dei valori pubblicati; gli altri
3 sbordano di 0,07 al massimo, cioe' ancora dentro l'errore di
arrotondamento). Peso esatto ufficiale: **non verificato** — Awwwards non lo
pubblica. Ma se e' media semplice, **l'accessibilita' pesa quanto le
animazioni**, cioe' 1/6 ciascuna. Questo e' il buco piu' grosso del sistema, e
lo sfruttiamo nella sezione 7.

---

## 2. COME SI CANDIDA UN SITO — COSTI, TEMPI, RITENTATIVI

### Prezzi reali (pagina [/submit/](https://www.awwwards.com/submit/), 13 ago 2026)

| Voce | Prezzo | Note |
|---|---:|---|
| **Standard Submission** | **65 €** | un sito, nessun abbonamento |
| Basic Plan Member | 6 €/mese fatturato annuo = **72 €/anno** | sconto **10%** sulle submission → 58,50 € |
| **Professional Plan** | 12,50 €/mese fatturato annuo = **150 €/anno** | **1 submission gratis/anno** + **30%** di sconto → 45,50 € |
| International Plan | 291,70 €/mese fatturato annuo = **3.500,40 €/anno** | sconto **50%** → 32,50 € |

Prezzi solo in euro sulla pagina; **nessun prezzo in dollari pubblicato**.

### Quando conviene il piano Pro — il calcolo

Standard: `65n`. Pro: `150 + 45,50 x (n-1)` (la prima e' gratis).

| submission/anno | solo Standard | con Pro | conviene |
|---:|---:|---:|---|
| 1 | 65 € | 150 € | Standard |
| 2 | 130 € | 195,50 € | Standard |
| 3 | 195 € | 241 € | Standard |
| 5 | 325 € | 332 € | Standard |
| **6** | 390 € | **377,50 €** | **Pro** |

**Il piano Pro si ripaga sulle sole submission dalla sesta candidatura in
poi.** Sotto quella soglia lo si compra per gli altri benefici (profilo nella
Directory professionale, 75% di sconto sui corsi Academy, "featured" in 3
categorie), non per il risparmio.

### Tempi

| Fase | Durata | Fonte |
|---|---|---|
| Approvazione redazionale (manuale) | **fino a una settimana**, piu' code nei weekend e nei picchi | [FAQ](https://www.awwwards.com/faqs/) |
| Votazione | **5 giorni** | [about-evaluation](https://www.awwwards.com/about-evaluation/) |
| Scorciatoia | SOTD **prima** dei 5 giorni se punteggio alto dalla giuria **e almeno 10 utenti PRO** | [about-evaluation](https://www.awwwards.com/about-evaluation/) |
| **Finestra totale di eleggibilita' SOTD** | **3 mesi dall'approvazione**, poi il sito esce dalla gara | [FAQ](https://www.awwwards.com/faqs/) |

### Ritentativi

**Non esiste una regola pubblicata sul numero di ricandidature dello stesso
sito** — non verificato. Quello che e' documentato:

- ogni submission e' a pagamento, sempre;
- **nessun rimborso**, mai, sulle submission (i rimborsi esistono solo per i
  corsi Academy acquistati singolarmente) — [FAQ, sezione Billing](https://www.awwwards.com/faqs/);
- una volta che la submission passa in review o viene approvata **non si puo'
  piu' modificare nulla**; e' editabile solo finche' e' in bozza;
- il vincolo vero non e' il numero di tentativi ma i **3 mesi** di finestra.

### Requisiti tecnici della candidatura

- thumbnail principale **1600 x 1200 px**;
- si possono aggiungere immagini e video, e Awwwards raccomanda esplicitamente
  i video: *"We highly recommend adding videos to make your submission stand
  out even more"*;
- **i template pre-fatti sono rifiutati.** Accettano il sito-demo di un
  template destinato alla vendita, ma solo se design e sviluppo sono
  interamente dell'autore che candida;
- i collaboratori vanno aggiunti nel campo "Additional credits" al **primo
  passo**; dopo l'approvazione serve scrivere via email.

---

## 3. CHI VOTA E QUANTO PESA

### La giuria

- **minimo 18 membri** per sito ([about-evaluation](https://www.awwwards.com/about-evaluation/));
- nel mio campione i giurati effettivamente elencati sono **da 18 a 23, media
  18,8** per sito;
- **i 3 voti piu' lontani dalla media vengono eliminati automaticamente.**
  Questo e' importante: non si vince con un giurato entusiasta, e non si perde
  per un giurato ostile. Il sistema taglia le code.
- Giuria dev: **5 membri**, identici in tutti i 26 casi osservati.
- Per entrare in giuria serve **aver vinto almeno un SOTD**; per la Young Jury
  serve avere **25 anni o meno** ([FAQ](https://www.awwwards.com/faqs/)).
  Inoltre **i 5 utenti col punteggio piu' alto ogni anno vengono invitati in
  giuria l'anno dopo** ([Status System](https://www.awwwards.com/about-status/)).

### La community

Contano solo gli utenti validati. Qui le fonti Awwwards **si contraddicono**:

- la pagina [about-evaluation](https://www.awwwards.com/about-evaluation/) dice
  "only votes made by Professional users";
- lo [Status System](https://www.awwwards.com/about-status/) dice che contano
  i voti di **Chief** e **Pro** ("their votes count towards SOTD & HM");
- la [FAQ](https://www.awwwards.com/faqs/) sull'HM elenca "Chief, Tribe, Pro,
  International";
- **le schede dei siti** — la prova piu' diretta — intitolano la riga
  aggregata **"Awwwards Users - Pro and Chief"**.

Vale la scheda: **Pro + Chief**. Si diventa Chief con **1 SOTD, 3 HM, oppure
5.000 punti status** (si guadagnano fino a 35 punti al giorno: 5 per voto su
un nominee, 5 per una submission, 30 una tantum per il profilo completo, 1 per
attivita' quotidiana).

### Il peso reale dei due voti

| Premio | Peso giuria | Peso community |
|---|---|---|
| Honorable Mention | soglia 6,5 | soglia 6,5, **indipendente** |
| Site of the Day | decide | acceleratore: 10 utenti PRO + alto punteggio giuria = SOTD anticipato |
| Site of the Month | decide | *"the site which receives the most user votes will carry extra weight in the Jury's final decision"* — **peso numerico non pubblicato, non verificato** |

**Il collo di bottiglia e' sempre la giuria.** Nei 31 SOTD, il punteggio
community piu' basso e' **7,29** — cioe' anche il sito meno amato dalla
community stava comunque 0,79 punti sopra la soglia HM di 6,5. La community
non e' un ostacolo: e' un cronometro (fa vincere prima) e un moltiplicatore
sul SOTM.

---

## 4. DOVE SI PERDONO I PUNTI

### Nella giuria design: l'usabilita'

Medie sui 31 SOTD (siti che hanno **vinto**, quindi questo e' il profilo del
vincitore, non del bocciato):

| Criterio | Peso | Media | Min | Max |
|---|---:|---:|---:|---:|
| Creativity | 20% | **7,47** | 6,97 | 8,13 |
| Design | 40% | 7,36 | 7,08 | 7,69 |
| Content | 10% | 7,31 | 6,84 | 7,66 |
| **Usability** | **30%** | **7,12** | **6,82** | 7,53 |

**L'usabilita' e' il criterio piu' basso, e ha il secondo peso piu' alto.**
E' li' che il campo perde punti in modo sistematico: il 30% del voto viene
assegnato sulla cosa che questi siti fanno peggio. Sette dei 31 vincitori sono
sotto 7,0 di usabilita'; uno e' a **6,82**, cioe' a **0,32 punti dalla soglia
di un semplice Honorable Mention** su quel criterio.

### Nel Developer Award: l'accessibilita'

| Criterio | Media | Min |
|---|---:|---:|
| Animations / Transitions | 7,99 | 7,2 |
| WPO | 7,43 | 6,8 |
| Responsive Design | 7,41 | 6,8 |
| Markup / Meta-data | 7,15 | 6,6 |
| Semantics / SEO | 7,10 | 6,6 |
| **Accessibility** | **6,70** | **6,0** |

**L'accessibilita' e' il punto piu' debole del web premiato, di 1,29 punti
sotto le animazioni.** Il minimo osservato e' **6,0**, cioe' un punto pieno
sotto la soglia di 7 richiesta per il Developer Award. Su 26 vincitori del
Developer Award, l'accessibilita' e' il criterio piu' basso della scheda in
larga maggioranza dei casi.

### Dove si vince davvero: i primi 10 contro gli ultimi 10

Ho diviso i 31 SOTD nei 10 col punteggio piu' alto e i 10 col piu' basso.
**Il divario totale e' solo 0,26 punti** (7,19 contro 7,45): il mese si gioca
su margini minuscoli.

| Criterio | Media 10 piu' bassi | Media 10 piu' alti | Delta | Contributo al totale |
|---|---:|---:|---:|---:|
| Design | 7,25 | 7,48 | +0,23 | **+0,090** |
| **Creativity** | 7,29 | 7,71 | **+0,42** | **+0,084** |
| Usability | 7,03 | 7,25 | +0,23 | +0,069 |
| Content | 7,24 | 7,35 | +0,11 | +0,011 |

Correlazione di ciascun criterio col totale, sui 31 siti:
**Design 0,75 — Creativity 0,69 — Usability 0,64 — Content 0,31.**

Tre letture operative:

1. **Content non muove niente.** Peso 10%, correlazione 0,31, contributo alla
   differenza fra vincere bene e vincere male: **+0,011 punti**. Non e' li'
   che si investe.
2. **Creativity e' la variabile che si muove di piu'** (+0,42 fra i due
   gruppi, e l'unico criterio che nel campione arriva a 8,13). Ma pesa 20%.
3. **Design resta la leva piu' grande** perche' pesa il doppio: sposta di meno
   ma vale di piu'.

---

## 5. QUANTO CONTA COMMERCIALMENTE

**Onestamente: non esistono dati pubblici seri.** Ecco cosa ho e cosa non ho.

### Cosa non c'e'

- **Awwwards non pubblica nessuna statistica di audience.** Ho provato
  `/media-kit/`, `/advertise/`, `/partners/`: tutte **404**. La pagina
  [About Us](https://www.awwwards.com/about-us/) non contiene nessuna cifra su
  visitatori, iscritti alla newsletter o follower.
- **Nessuno studio, ricerca o rapporto di settore** che misuri l'effetto di un
  premio su contatti, preventivi o fatturato di uno studio. Non ne ho trovato
  neanche uno. **Non verificato** e, per quanto ho potuto controllare,
  inesistente.
- L'unico numero di popolazione che Awwwards espone e' la Directory:
  **1.945 professionisti** iscritti (pagina `/directory/`, 13 ago 2026).

### Cosa c'e' (poco, e vecchio)

**Il caso Snipcart, 2013.** L'unica testimonianza quantificata che esiste in
rete e' l'articolo *"Winning the SOTD on Awwwards or how we got 27k of
qualified UV in a week"* — **27.000 visitatori unici in una settimana**.
L'articolo era su `snipcart.com/blog/2013/...`; **oggi restituisce 404** e le
copie archiviate su web.archive.org non erano raggiungibili durante questa
ricerca (503 ripetuti su 6 tentativi + blocco proxy). Resta verificabile
l'esistenza e il titolo tramite l'indice di Hacker News:
[item 6402535](https://news.ycombinator.com/item?id=6402535) (17 set 2013) e
[item 16481972](https://news.ycombinator.com/item?id=16481972) (ripubblicato su
Indie Hackers nel 2018). **Il numero 27k lo riporto come titolo citabile, non
come dato che ho letto e controllato: non verificato.**

Conferma qualitativa dello stesso fondatore, tre mesi dopo la vittoria
([HN item 6900557](https://news.ycombinator.com/item?id=6900557), 13 dic 2013):

> *"we won the site of the day on Awwwards.com back in August and then we have
> a lot of traffic and we are getting new customers everyday"*

Nessuna cifra. E' del 2013: il web, Awwwards e i canali di traffico di allora
non sono quelli di oggi. **Da usare con cautela.**

### Cosa dicono quelli che ci hanno lavorato dentro

Da un dipendente di uno studio che puntava esplicitamente ai premi
([HN item 44222018](https://news.ycombinator.com/item?id=44222018), giu 2025):

> *"I used to work at a studio specifically targeting winning awards with
> awwwards and it's definitely not the same as working on the normal web.
> Flashiness is way more important than performance there, be it in UX,
> conversions or load times."*

E ([HN item 44226381](https://news.ycombinator.com/item?id=44226381), giu 2025):

> *"Awwwards websites are pretty much exclusively web design agency sites.
> These are selling the services of those agencies"*

Questa seconda osservazione e' la piu' utile commercialmente, ed e' coerente
col nostro campione: **il premio e' un canale di vendita rivolto ad altri
addetti ai lavori e a chi cerca uno studio creativo, non un canale di
acquisizione per il cliente finale del cliente.** Cioe': serve a noi per
vendere noi stessi, non al ristorante per vendere coperti.

### Il concorrente che una cifra la dichiara

CSSDA, sulla propria pagina [About](https://www.cssdesignawards.com/about),
sostiene *"tens of thousands of visitors every day"* sia per i vincitori sia
per la sezione sponsorizzazioni. **Autodichiarato, nessuna verifica di terzi:
non verificato.**

### Conclusione della sezione

Chiunque affermi un ROI di un premio Awwwards sta stimando. **La cosa onesta
da dire a un cliente e' che il premio e' prova sociale con un prezzo di
listino noto (65 €) e un ritorno non misurato.** Il valore verificabile e'
strutturale, non di traffico: 1 SOTD o 3 HM danno lo status Chief, che da'
diritto di voto e presenza nella Directory, e 1 SOTD e' il **requisito
d'ingresso per candidarsi alla giuria** — che e' visibilita' ricorrente
gratuita, non uno sprint di una settimana.

---

## 6. LE ALTERNATIVE

| Piattaforma | Costo submission | Meccanismo | Verificato |
|---|---:|---|---|
| **Awwwards** | **65 €** | 4 criteri pesati, ~19 giurati, SOTD ~7,2+, HM 6,5 | si', pagina /submit/ |
| **FWA** | **70,50 £** | punteggio 0–100, tutti partono da 50 | si', dati embedded in thefwa.com |
| **CSS Design Awards** | **50 $** | media giuria >8,00 per WOTD | si', cssdesignawards.com/submit |
| **Godly** | — | **non esiste piu'** (vedi sotto) | si', verificato oggi |
| **SiteInspire** | **gratis** | curation redazionale, nessun premio | si', form di submission |

### FWA — il piu' rigido dei tre

Fonte: dati di configurazione della piattaforma su
[thefwa.com](https://thefwa.com/submit), 13 ago 2026.

- Prezzo: **70,50 £ GBP**.
- Sistema: **da 0 a 100**. *"Each project submitted will enter at 50 and will
  then move up or down, depending on the judges' votes. The initial 50 is an
  entry point, not an actual score."*
- Per vincere l'FOTD (FWA of the Day) servono **due condizioni insieme**:
  **punteggio minimo 70** e **almeno 20 giurati** che hanno votato. A
  mezzanotte GMT il progetto col punteggio piu' alto che soddisfa entrambe
  diventa FOTD.
- Finestra: **14 giorni** in live judging, poi il progetto viene rimosso dal
  sistema. (Awwwards ne da' 90.)
- FOTM: 5 giorni prima di fine mese si prendono i **5 progetti col punteggio
  piu' alto** e ogni giurato ne sceglie uno.
- FOTY: dai **12 FOTM**, annuncio a **gennaio**. In parallelo il **People's
  Choice Award** sugli stessi 12, deciso dal pubblico.
- Il punteggio e' **pubblico e in diretta** sulla pagina Live Judging: si vede
  il progetto salire e scendere. Awwwards invece **mostra il punteggio della
  giuria solo a chi vince SOTD** ([FAQ](https://www.awwwards.com/faqs/)): se
  prendi solo un HM, non saprai mai quanto hai preso.

### CSS Design Awards — il piu' economico e il piu' accessibile

Fonti: [/submit](https://www.cssdesignawards.com/submit) e
[/about](https://www.cssdesignawards.com/about).

- Prezzo: **50 $ USD**, uguale per tutte e tre le categorie.
- Categorie obbligatorie alla candidatura: **Solo** (1 persona + 1
  collaboratore), **Studio** (2–10), **Agency** (10+). Servono a far competere
  simili con simili nel Designer of the Year.
- Una submission entra in **8 premi**: Special Kudos, UI Design, UX Design,
  Innovation, Website of the Day, of the Month, of the Year, Designer of the
  Year.
- **WOTD: media giuria sopra 8,00** — *"this varies depending on quality of the
  sites submitted"*.
- **Special Kudos: media sopra 6** — assegnato a tutti i non-WOTD che superano
  quella soglia. **E' l'unico riconoscimento a soglia bassa e certificato del
  panorama, a 50 $.**
- Public Awards (UI / UX / Innovation): servono **piu' di 20 voti del pubblico**
  in una o piu' categorie **e** media giuria **sopra 6**.
- **Accettano i template** (a differenza di Awwwards), avvisando che le
  probabilita' di vincere dipendono dall'originalita'.

### Godly — attenzione, non esiste piu'

Verificato il 13 agosto 2026: **`godly.website` reindirizza interamente a
`recent.design`** (301 su `godly.website/submit` →
`recent.design/?ref=godly`; anche la home restituisce byte-per-byte lo stesso
contenuto). Il sito si chiama ora **"Recent — Design Inspiration"** e
**non ha nessuna pagina di candidatura**: `/submit` e `/submissions` danno
404. Le uniche pagine commerciali sono le sponsorizzazioni:
**1.000 $/settimana**, **1.250 $/settimana**, **800 $/uscita** della
newsletter ([recent.design/sponsor](https://recent.design/sponsor)).

**Conclusione: Godly non e' piu' una strada di candidatura.** Qualsiasi guida
che lo elenchi fra i premi e' vecchia.

### SiteInspire — gratis, e per questo va fatto subito

Il form di [submission](https://www.siteinspire.com/submissions/new) chiede
solo **URL del sito, profilo e ruoli**. Nessun pagamento, nessun listino.
Non e' un premio: e' una directory curata ("a showcase of the web's finest
design + talent"). **Tasso di accettazione e tempi di revisione: non
verificati** — non li pubblicano.

### Prestigio relativo

**Non verificato in modo quantitativo.** Non esiste nessuna classifica
indipendente del prestigio di queste piattaforme, e diffido di chi la
afferma. Quello che si puo' dire dai meccanismi:

- **FWA e' il piu' selettivo per costruzione**: soglia assoluta di 70/100 e
  minimo 20 giurati, contro il "i piu' alti del giorno" di Awwwards. Su FWA si
  puo' non assegnare il premio; su Awwwards il SOTD viene assegnato tutti i
  giorni per definizione.
- **Awwwards ha il volume e il vocabolario**: "Site of the Day" e' l'unica
  formula che un cliente non del settore riconosce. E' l'unico che genera
  status trasferibile (Chief, Directory, giuria).
- **CSSDA e' il piu' facile e il piu' economico**, e ha una soglia (Special
  Kudos, 6) che un buon primo sito puo' superare.
- **SiteInspire / Recent non sono premi.** Sono distribuzione.

---

## 7. LA STRATEGIA PER CHI APRE ADESSO

Il percorso qui sotto e' costruito sui numeri di sopra, non su buone
intenzioni.

### La realta' aritmetica da cui partire

**365 SOTD all'anno, punteggio di ingresso ~7,2 dalla giuria, 65 € a
tentativo, nessun rimborso, tre mesi di finestra.** Puntare al SOTD col primo
sito e' comprare un biglietto della lotteria a 65 €. Puntare all'Honorable
Mention (6,5) e' un obiettivo raggiungibile, e **3 HM valgono lo stesso status
Chief di 1 SOTD**.

### Fase 1 — Sito 1 e 2: costruire il curriculum a costo quasi zero

1. **SiteInspire, gratis.** Zero rischio, zero costo. Da fare sempre.
2. **CSSDA, 50 $.** Obiettivo dichiarato: **Special Kudos** (media giuria
   sopra 6), non il WOTD (sopra 8,00). E' un certificato ufficiale, sta sul
   sito e nelle proposte commerciali, e costa meno di un'ora del nostro tempo.
3. **Non candidare ancora ad Awwwards.** Un HM mancato costa 65 € e non ti
   dice nemmeno il punteggio: Awwwards mostra il voto della giuria **solo ai
   vincitori SOTD**. Si paga per un risultato binario senza diagnostica. Su
   FWA il punteggio e' invece pubblico e in diretta: **se serve capire dove si
   sta, 70,50 £ su FWA comprano piu' informazione di 65 € su Awwwards.**

### Fase 2 — Il primo sito candidato ad Awwwards: mirare a 6,5, non a 7,2

L'HM richiede **6,5 dalla giuria e 6,5 dagli utenti**. Il secondo non e' un
problema: il peggior SOTD del mese ha preso **7,29** dalla community. **Il
lavoro e' tutto sulla giuria.**

Dove metterlo, in ordine di rendimento per ora spesa:

| Priorita' | Criterio | Perche' |
|---|---|---|
| 1 | **Design (40%)** | Correlazione 0,75 col totale, peso doppio di chiunque altro. Mezzo punto qui vale **+0,20** sul totale |
| 2 | **Usability (30%)** | E' il criterio dove **tutti** perdono: media 7,12 contro 7,47 di creativity. Mezzo punto vale **+0,15**. E' l'unico arbitraggio disponibile: la concorrenza lo sta regalando |
| 3 | Creativity (20%) | Massima varianza del campione (fino a 8,13), ma serve un'idea, non un metodo |
| 4 | Content (10%) | **Correlazione 0,31.** Non muove il punteggio. Farlo decente e passare oltre |

**L'arbitraggio dell'usabilita' e' la tesi centrale di questo documento.** Un
sito che fa tutto quello che fanno gli altri (WebGL, GSAP, scroll guidato) ma
in cui **si riesce a navigare** guadagna 0,15–0,20 punti dove il resto del
campo li perde. Costa disciplina, non talento.

### Fase 3 — Il Developer Award e' il premio piu' economico da guadagnare

Attenzione al vincolo: **non e' una strada indipendente.** Solo i siti che
hanno gia' vinto SOTD vengono mandati alla giuria dev. Ma quando ci arrivi:

- serve **piu' di 7** su una media di sei criteri;
- **l'accessibilita' e' a 6,70 di media, con minimi a 6,0**;
- se pesa 1/6 come sembra, **portare l'accessibilita' da 6,7 a 8,5 alza il
  totale dev di +0,30** — piu' del divario fra il Dev Award medio (7,33) e la
  soglia (7,0).

E l'accessibilita' e' l'unico criterio di tutto l'impianto che si puo'
**verificare prima di pagare**: contrasto, focus visibile, alt, ARIA,
navigazione da tastiera, `prefers-reduced-motion`. Nessun altro criterio si
puo' auditare da soli. **Fra i sei criteri dev e' il piu' economico da
guadagnare e quello che tutti gli altri stanno ignorando.**

### Fase 4 — Lo status, che vale piu' del premio singolo

| Traguardo | Cosa sblocca |
|---|---|
| 3 HM **oppure** 1 SOTD **oppure** 5.000 punti | **Chief**: il tuo voto conta su SOTD e HM, profilo nella Directory |
| 1 SOTD | Requisito per **candidarsi alla giuria** (bando a fine anno) |
| Top 5 utenti dell'anno | **Invito automatico in giuria** l'anno successivo |

I 5.000 punti sono raggiungibili senza vincere niente: **fino a 35 punti al
giorno** (5 per ogni voto su un nominee, 5 per submission, 30 una tantum per
il profilo completo, 1 per l'attivita' quotidiana). E' lento ma e' una strada
alternativa reale. **Entrare in giuria e' il vero obiettivo commerciale**:
e' presenza permanente, non un picco di traffico di una settimana.

### Fase 5 — Quando comprare il piano Pro

**Alla sesta submission dell'anno**, non prima (vedi il calcolo nella sezione
2). Prima di quella soglia il Pro si compra per la Directory e per il 75% di
sconto sull'Academy, non per risparmiare sulle candidature.

### Errori che costano soldi veri

- **Candidare un template.** Rifiuto immediato, 65 € persi, nessun rimborso.
- **Candidare troppo presto.** Da quando e' approvato, il sito ha **3 mesi** e
  poi esce dalla gara per sempre. Il tempo scorre anche se il cliente non ha
  ancora messo i contenuti veri.
- **Rileggere la submission dopo l'invio.** Non si puo': una volta in review o
  approvata **non e' piu' modificabile**. La rilettura si fa in bozza.
- **Confondere la tabella utenti con quella della giuria** quando si studiano
  i vincitori. Sono 1,29 punti di differenza sistematica: si finisce per
  progettare per un obiettivo sbagliato di un punto e mezzo.
- **Contare su Godly.** Non esiste piu'.

---

## APPENDICE — METODO E LIMITI

**Cosa ho misurato io:** 31 Site of the Day dal 14 luglio al 13 agosto 2026,
scaricati da `awwwards.com/websites/sites_of_the_day/` e dalle rispettive
schede. Per ognuno: punteggio totale giuria, quattro criteri, punteggio
aggregato utenti Pro+Chief con i quattro criteri, numero di giurati elencati,
e — dove presente — punteggio Developer Award coi sei criteri (26 siti su 31).

**Verifiche fatte:** la formula 0,4/0,3/0,2/0,1 riproduce il totale pubblicato
in **31 casi su 31** con scarto massimo 0,006. La media semplice dei sei
criteri dev riproduce il totale dev in 23 casi su 26 entro l'arrotondamento.

**Limiti dichiarati:**

- il campione e' **un mese**, non un anno. Le medie possono spostarsi di
  qualche centesimo su finestre diverse;
- sono tutti **vincitori**: non ho i punteggi dei bocciati, che Awwwards non
  pubblica. Quindi so cosa basta per vincere, **non** so cosa non basta;
- il numero totale di membri della giuria 2026 e il numero di candidature
  annue: **non verificati** (la pagina giuria carica 12 schede alla volta e la
  paginazione non risponde da riga di comando);
- il peso esatto dei voti utenti nella decisione SOTM: **non verificato**;
- il numero di Honorable Mention assegnati al giorno: **non verificato**;
- la ricerca e' stata fatta **senza browser**, solo con `curl` e fetch diretti.
  I motori di ricerca (DuckDuckGo, Mojeek, Brave, Ecosia, Startpage, SearxNG)
  hanno tutti risposto con captcha o challenge, e web.archive.org con 503
  ripetuti: **la sezione 5 e' quindi la piu' incompleta**, ed e' probabile che
  qualche testimonianza di studio esista in rete e non sia arrivata fin qui.

---

## LE FONTI

**Awwwards**
- [Evaluation System](https://www.awwwards.com/about-evaluation/) — pesi, formula, processo, soglie
- [Submit](https://www.awwwards.com/submit/) — tutti i prezzi
- [FAQs](https://www.awwwards.com/faqs/) — HM doppia soglia, 3 mesi, no rimborsi, no template, 1600x1200
- [Status System](https://www.awwwards.com/about-status/) — punti, Chief, Pro, giuria
- [Developer Award](https://www.awwwards.com/developer-award/)
- [Sites of the Day](https://www.awwwards.com/websites/sites_of_the_day/) — il campione dei 31
- [Directory](https://www.awwwards.com/directory/) — 1.945 professionisti

**Concorrenti**
- [FWA — Submit](https://thefwa.com/submit) — 70,50 £, sistema 0–100, soglia 70, 20 giurati, 14 giorni
- [CSSDA — Submit](https://www.cssdesignawards.com/submit) — 50 $, tre categorie
- [CSSDA — About](https://www.cssdesignawards.com/about) — soglie 8,00 e 6, public awards
- [Recent (ex Godly) — Sponsor](https://recent.design/sponsor) — nessuna submission, solo sponsorizzazioni
- [SiteInspire — Submission](https://www.siteinspire.com/submissions/new) — gratis

**Testimonianze**
- [HN 6402535](https://news.ycombinator.com/item?id=6402535) — l'articolo Snipcart "27k UV in a week" (2013, oggi 404)
- [HN 6900557](https://news.ycombinator.com/item?id=6900557) — il fondatore Snipcart, tre mesi dopo
- [HN 44222018](https://news.ycombinator.com/item?id=44222018) — da dentro uno studio che punta ai premi
- [HN 44226381](https://news.ycombinator.com/item?id=44226381) — chi sono davvero i siti su Awwwards
