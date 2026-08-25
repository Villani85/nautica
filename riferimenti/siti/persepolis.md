# Persepolis Reimagined

- **URL**: https://persepolis.getty.edu/ (la scheda Awwwards punta a `getty.edu/persepolis`, che fa un 302 su questo host - VERIFICATO con richiesta HTTP)
- **Premio**: Awwwards Site of the Day 01/06/2022 - design 8.11, usability 7.41, creativity 8.36, content 8.23, totale 7.96; Developer Award 8.03. Scheda: https://www.awwwards.com/sites/persepolis-reimagined
- **Studio**: Media.Monks (nei crediti del sito la voce "Production" dice esattamente `Media.Monks`; Awwwards lo elenca come "Monks") per il **J. Paul Getty Museum**
- **Anno**: 2022 (build datata `1659513005297` = 3 agosto 2022; premio giugno 2022)
- **Letto il**: 13/08/2026

---

## Cosa tratta il sito

E' la ricostruzione 3D navigabile di **Persepoli**, la capitale cerimoniale
dell'impero achemenide (Persia), com'era intorno al 480 a.C. sotto il re
**Serse**. Non e' un tour delle rovine: e' la citta' **rimessa in piedi**,
percorsa in prima persona.

Il sito e' il compagno digitale di una mostra fisica del Getty Villa Museum,
*Persia: Ancient Iran and the Classical World*. Gli oggetti veri esposti in
mostra (dal Louvre, dal MFA di Boston, dal British Museum, dalle collezioni
Getty) sono disseminati dentro la ricostruzione, al posto dove starebbero.

Dentro ci sono **sei edifici**, che sono i sei capitoli:

1. **Gate of All Nations** - l'ingresso monumentale
2. **Apadana** - la sala delle udienze
3. **Palace of Xerxes** - il palazzo di Serse
4. **Southeastern Palace** - l'ala residenziale
5. **Royal Treasury** - il tesoro
6. **Hall of 100 Columns** - la seconda grande sala, e il finale

E dentro ogni edificio: rilievi che si spiegano, iscrizioni cuneiformi che
vengono tradotte e lette ad alta voce, oggetti di museo che si aprono in
scheda, e confronti "com'era / com'e' oggi".

Otto lingue: inglese, arabo, spagnolo, **persiano (farsi)**, francese, hindi,
cinese semplificato e tradizionale (VERIFICATO: `i18n/{ar,en_US,es,fa,fr,hi,zh_Hans,zh_Hant}.json`).
La presenza del farsi e dell'arabo non e' un dettaglio: e' il pubblico a cui
quella citta' appartiene.

## Cosa vende, e qual e' l'obiettivo finale

**Non vende niente in pagina.** Non c'e' carrello, non c'e' modulo di contatto,
non c'e' prezzo, non c'e' newsletter. E' un museo pubblico.

L'obiettivo **dichiarato**, leggibile nella sezione "About this Project", e'
divulgativo: far capire cos'era Persepoli e far vedere gli oggetti della
mostra. L'unico invito commerciale sta in fondo, nella scheda About, ed e'
tenuto deliberatamente basso: tre link a `getty.edu/persia` (visita la mostra)
e al catalogo in vendita sullo shop Getty.

L'obiettivo **vero** e' triplo e vale la pena separarlo:

1. **Portare gente alla mostra fisica** a Los Angeles - ma il sito e' in otto
   lingue, quindi la maggioranza dei visitatori non ci andra' mai.
2. **Riposizionare il Getty** come istituzione che sa fare cultura digitale di
   livello, non brochure. Il premio Awwwards e' parte di questo, e va
   considerato un obiettivo, non un effetto collaterale.
3. **Restituire un patrimonio.** Il sito e' in farsi ed e' gratis: chi non
   puo' vedere Persepoli - per distanza, per soldi, per politica - la vede.

Per un'agenzia: questo e' il caso in cui **il prodotto e' l'esperienza
stessa**. Il ritorno non e' una conversione, e' la reputazione del
committente. E' esattamente il modello di lavoro da proporre a fondazioni,
musei, aziende con un archivio storico, distretti industriali.

## A chi

- **Il curioso di storia** (la maggioranza). Sa chi era Alessandro Magno, non
  sa cosa fosse l'Apadana. Teme la noia da museo e i muri di testo. Uscendo
  deve pensare: *ci sono stato*.
- **Il visitatore potenziale della mostra**, a Los Angeles. Deve uscire
  volendo vedere gli originali dal vero.
- **La diaspora iraniana e il pubblico persianofono.** Per loro non e'
  divulgazione, e' identita'. Il farsi in lista lingue e' un messaggio a
  loro.
- **La giuria di Awwwards e il settore.** Un pubblico reale, che il sito
  serve con dettagli visibili solo a chi guarda da vicino.
- **Gli insegnanti.** L'indice delle opere ("Art Index") con schede,
  provenienza e link al museo che le possiede rende il sito citabile.

## L'esperienza progettata

E' una **visita guidata in prima persona**, dove lo scroll fa il lavoro dei
piedi. Il visitatore non guida mai davvero la camera: la camera va dove deve
andare, e lui decide **quando**. E' la scelta che tiene il progetto lontano
dal videogioco, ed e' la lezione principale del sito.

Il visitatore non ha mai piu' di due cose da fare:

- **scrollare** per avanzare lungo il percorso (il testo lo dice: `Scroll to
  explore`, `Scroll to continue`, `Continue for more detail`)
- **trascinare** per guardarsi intorno da fermo (`Drag to Explore`, `Drag to
  rotate`) - e questo e' un giro di testa, non uno spostamento
- occasionalmente **cliccare un punto di interesse** (`Points of interest`),
  che ferma il viaggio, apre una scheda e poi lo rimette in strada

Non c'e' WASD, non c'e' free-roam, non c'e' un mirino. Non si puo' sbagliare
strada. In cambio, non si puo' nemmeno "esplorare" nel senso del videogioco.

Il ritmo e' scandito da un'alternanza fissa che si ripete sei volte:

**arrivo (cinematico) -> respiro (drag, ti guardi intorno) -> dettaglio
(hotspot, si ferma tutto) -> approfondimento opzionale (pagina editoriale
verticale) -> ripartenza.**

L'approfondimento e' la valvola: chi vuole la storia lunga apre le sezioni
`Editorial` (foto d'archivio, testi, oggetti), che su desktop si sfogliano
**in orizzontale**, come un rilievo che si legge camminandogli accanto; chi non
la vuole scrolla e prosegue senza mai incontrarne il contenuto.

Una precisazione strutturale che conta per chi deve rifarlo: **ogni edificio e'
una rotta a se** (`/experience/gate-of-all-nations`, `/experience/the-apadana`,
e cosi' via). Non e' una pagina unica lunghissima: sono sei esperienze cucite
insieme, ognuna con il suo carico da scaricare. Non a caso l'unico altro
percorso e' `/` (l'intro) e un `/webgl` che e' rimasto dentro dagli sviluppi.

**L'immagine che resta in testa**: le rovine che ridiventano palazzo. Il sito
la usa due volte, in apertura e in chiusura, e in mezzo la ripete in piccolo a
ogni hotspot "past/present". E' un solo trucco, ripetuto con disciplina.

## Come e' organizzata la persuasione

Non c'e' persuasione commerciale, quindi la struttura persuasiva e' quella di
un **documentario**, non di una landing.

- **La promessa** arriva prima di qualsiasi immagine, in tre righe di testo
  sul nero, durante il caricamento: *"Twenty-five hundred years ago, in what is
  now southern Iran, stood an ancient city of awe-inspiring beauty."* La
  promessa e': ti faccio vedere una cosa che non esiste piu'.
- **La prova** e' doppia. Prima archeologica: ogni oggetto mostrato ha una
  didascalia con museo, numero di inventario, datazione e link alla scheda del
  museo proprietario (Louvre `collections.louvre.fr`, MFA Boston
  `collections.mfa.org`). Poi visiva: gli hotspot "past/present" mostrano la
  foto reale della rovina sopra la ricostruzione. Il sito **si smentisce da
  solo**, di continuo, e cosi' si guadagna la fiducia.
- **Il prezzo** non c'e'. Il costo per l'utente e' il tempo e la banda.
- **La chiamata all'azione** e' unica, in fondo, dentro "About this Project":
  `Visit the exhibition` -> getty.edu/persia, e due link al catalogo in
  vendita. Ci vogliono, a conti fatti, **circa 85 schermate di scroll** per
  arrivarci (vedi tabella: 23+21+12+14+5,5+9), piu' l'intro. Praticamente
  nessuno ci arriva.
- La **condivisione** e' l'unica CTA presente lungo il percorso, nel menu
  (`Share`).

**Chi non arriva in fondo** - cioe' quasi tutti - riceve comunque il
messaggio, perche' il messaggio e' consegnato **all'inizio**, non alla fine:
tre righe di testo e la dissolvenza rovine->citta' nei primi venti secondi
dicono gia' tutto. Il resto e' approfondimento. Questa e' la cosa piu' furba
del progetto dal punto di vista di chi progetta: **la tesi sta nel preloader.**

## Idea regista

*Ti faccio camminare dentro una citta' che non c'e' piu', e ogni tanto ti
ricordo che non c'e' piu'.*

## Il momento

**La transizione rovine -> ricostruzione nel preloader.** Tecnicamente e' un
effetto a mappa di profondita': due fotografie (`image_start.jpg` e
`image_end.jpg`) piu' una `depth_map.jpg` in scala di grigi, incrociate in un
canvas WebGL mentre la camera fa un lento carrello - cosi' l'incrocio ha
volume invece di essere una dissolvenza piatta (VERIFICATO: percorsi
`webgl/preloader/{deviceState}/image_start.jpg | image_end.jpg | depth_map.jpg`
letti nel bundle).

Cade **prima** che il sito sia navigabile: e' quello che si guarda durante il
caricamento, con il contatore percentuale in cifra grande al centro. Il tempo
di attesa e' stato convertito nella scena piu' forte del sito. Chi progetta
esperienze pesanti dovrebbe copiare esattamente questo.

Un secondo momento chiude il cerchio, nell'ultimo capitolo: sullo schermo
compare *"No empire lasts forever. Persepolis would eventually fall."*, e da
li' si passa alla Persepoli di oggi.

## Struttura, sezione per sezione

Le "schermate di scroll" sono il valore `scrollHeight` letto nella
configurazione del bundle (VERIFICATO): e' l'altezza di scroll della scena in
multipli di viewport.

| sezione | cosa mostra | cosa fa l'utente | schermate di scroll |
|---|---|---|---|
| Preloader / intro | Nero, tre righe di testo, poi la transizione rovine->citta' con depth map. Contatore 0-100. Firma "presents" | Legge, aspetta, poi preme `Enter` | fisso, no scroll |
| Intro scrollata | Video a schermo pieno (`intro_masked.mp4`) scrubbato dallo scroll, tre didascalie in sequenza. Chiude con *"Imagine you're a dignitary..."* | Scrolla | ~3 (non verificato con precisione) |
| 1. Gate of All Nations | Ingresso, statue di tori, lamassu, iscrizione trilingue di Serse | Scrolla, trascina, apre 2 hotspot past/present, 1 iscrizione, 1 pagina editoriale ("Imperial Iconography") | **23** |
| 2. Apadana | Scalinata, rilievi dei 23 popoli tributari, colonne e capitelli (toro / leone-grifone), iscrizione | Scrolla, trascina per girare il capitello, apre "Tributes & Gift Giving" | **21** |
| 3. Palace of Xerxes | Tre rilievi cliccabili (leone-toro, guardia persiana, portatore di doni), banchetti reali | Clicca i tre rilievi, apre "Royal Feasts" (4 immagini + 4 testi) | **12** |
| 4. Southeastern Palace | Cortili e giardini privati, abito di corte persiano (orecchino, bracciale, placca) | Scrolla, apre le schede dei gioielli | **14** |
| 5. Royal Treasury | Rilievo del tributo, akinakes (pugnale), darico d'oro, sigilli | Clicca l'akinakes, apre "The King's Power" | **5,5** |
| 6. Hall of 100 Columns | La caduta dell'impero, l'incendio di Alessandro, Persepoli oggi | Legge, apre "Persepolis Recovered", vede l'ultimo past/present | **9** |
| Finale / About | Overlay di colore, crediti, curatori, link alla mostra e al catalogo | Clicca `Visit the exhibition` | ~2 |

**Totale scroll delle sei scene: 84,5 viewport.** E' un sito lungo. La
lunghezza e' distribuita in modo molto disuguale (la prima scena da sola vale
quattro volte il Tesoro): l'ingresso e' generoso perche' e' li' che si decide
se resti, e le scene finali sono corte perche' chi e' arrivato li' e' gia'
conquistato.

Navigazione trasversale, sempre disponibile: menu con **mappa** della citta'
(`View Map`) che segna gli edifici come *Current / Visited / To visit*,
**Art Index** (le opere raggruppate per Coins and Seals, Vessels, Jewelry,
Sculptures, Weapons), selettore lingua, volume audio, e **opzioni di
accessibilita'**.

## L'esperienza in ordine di tempo

**Primi dieci secondi**, secondo per secondo:

- **0s** - Schermo nero (`#252525`). Al centro un numero grande in un serif
  decorativo color sabbia (`#f6cea0`): `0`. E' il caricamento, ma sembra gia'
  un titolo di testa. Sotto, la riga *"Best experienced with sound"*.
- **0-3s** - Compare la prima riga: *"Twenty-five hundred years ago, in what
  is now southern Iran, stood an ancient city of awe-inspiring beauty."* Il
  testo entra spezzato per parole, con una micro-rotazione e uno stagger di
  25 ms per carattere (VERIFICATO nel codice: `SplitText` + rotazione 12 gradi
  in ingresso).
- **3-6s** - La riga esce, entra la seconda: *"Built by powerful kings, it
  served as the ceremonial capital of Achaemenid Persia - the largest empire of
  its time."* Il numero continua a salire.
- **6-9s** - Terza riga: *"Today, we know it as Persepolis."*
- **9-12s** - Firma: *"presents"* + logo Getty. Poi il titolo:
  **Persepolis** / *Reimagined*.
- Quando il caricamento e' completo: la fotografia delle rovine si trasforma
  nella citta' ricostruita (depth map + carrello di camera) e appare il
  pulsante **`Enter`**, con l'istruzione `Click enter to continue` (desktop) o
  `Tap enter to continue` (touch).

**Poi, a blocchi:**

- **Intro scrollata** - Un video a schermo pieno mappato su un quad WebGL
  (VERIFICATO: shader dedicato con `uniform sampler2D _Video` e correzione di
  aspect ratio; il video ruota di 90 gradi in portrait per non tagliare
  troppo). Tre didascalie in sequenza chiudono con la frase che stabilisce il
  ruolo del visitatore: *"Imagine you're a dignitary during this time,
  traveling to the capital to pay respect to the king..."* Da qui in poi non
  sei un utente, sei un ambasciatore.
- **Ogni capitolo** apre con un cartello: numero del capitolo, nome
  dell'edificio, descrizione di due righe, su un fondo fotografico. Poi il
  cartello si dissolve e la camera comincia a muoversi.
- **Dentro il capitolo** - la camera avanza legata allo scroll, ma **non in
  modo lineare**: la configurazione mappa segmenti di scroll a segmenti di
  timeline della camera con rapporti diversi (per la Gate of All Nations:
  scroll 0-0,3 -> camera 0-0,171; scroll 0,34-0,726 -> camera 0,171-0,713;
  scroll 0,78-1 -> camera 0,713-1). Fra un segmento e l'altro c'e' un buco
  (0,3-0,34) in cui **si scrolla e la camera non si muove**: e' li' che si
  legge il pannello. Questa e' la tecnica che rende il viaggio "narrato"
  invece che "guidato".
- **Agli hotspot** il sito **prende il controllo dello scroll**: blocca
  l'input, azzera l'inerzia e porta da solo la pagina al punto giusto in circa
  un secondo, poi restituisce il controllo (VERIFICATO: `isAutoScrollEnabled`,
  `autoScrollDuration: 1000`, `lockScroll` / `setMomentum(0,0)` / `scrollTo`).
  E' la cosa piu' "da regista" del sito: nei momenti che contano, l'utente non
  guida.
- **Le iscrizioni** cuneiformi si evidenziano e vengono tradotte riga per
  riga, con sottotitoli e voce (`Listen to the translation`).
- **Le pagine editoriali** sono un cambio di registro netto: si esce dal 3D e
  si entra in un impaginato da rivista (titolo, foto d'archivio, didascalia con
  data, testo) che su desktop **si sfoglia di lato**, in orizzontale, e sotto i
  920px torna verticale.
- **Finale** - *"No empire lasts forever. Persepolis would eventually fall."*
  Poi la Persepoli di oggi, un overlay di colore, e i crediti.

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| Camera nella scena 3D | posizione e mira lungo una timeline | **scroll**, tramite mappatura a segmenti `cameraScroll` | interpolazione con ease per segmento; sotto c'e' `smooth-scrollbar` con `damping: 0.1` e overscroll elastico (`maxOverscroll: 200`) | la timeline della camera e' **animata in Unity** ed esportata, non scritta in codice |
| Approfondimenti editoriali | il pannello scorre di lato | scroll (rotellina verticale convertita in orizzontale da un plugin scritto in casa) | stesso damping | sotto i 920px torna verticale |
| Selettore toro / leone-grifone | il cursore scatta fra due posizioni | trascinamento **o** clic | `power3.out` 0,4 s allo sgancio; `VinnieInOut` 0,8 s al clic | GSAP Draggable con `snap`; i due pulsanti a fianco sono l'alternativa accessibile |
| Camera, rotazione fine | leggera rotazione della testa | **trascinamento del mouse** + **posizione del mouse** | `setCameraDragRotateAmount` e `setCameraHoverRotateAmount(0.1 + 0.9*t)` | l'ampiezza del "guardarsi intorno" cambia scena per scena: quando devi guardare, ti danno piu' testa |
| Arrivo su hotspot | la pagina si porta da sola al punto | **stato** (entra nel range attivo) | 1000 ms, momentum azzerato prima e dopo | scroll bloccato durante l'animazione |
| Titoli | parole/caratteri entrano con rotazione, scala e spostamento verticale | **stato** (entrata della sezione) | ease custom `JorisInOut` / `JorisOut`, stagger 25 ms per carattere | GSAP `SplitText`; per **arabo, farsi e hindi** viene usata una variante che anima **per righe** invece che per caratteri, per non rompere la scrittura corsiva |
| Corpi di testo | risalita di 1em + fade | stato | `power2.out`, stagger 100 ms | |
| Contorni SVG dei bottoni | il tratto si disegna | stato | `drawSVG` da "50% 70%" a "60% 160%", ease custom `VinnieInOut` | GSAP DrawSVGPlugin |
| Indicatore "scroll" | oscillazione a richiamo | tempo, in loop | `CustomWiggle` a 5 oscillazioni, tipo `anticipate` | GSAP CustomWiggle |
| Torce / fuoco | luce e fiamma nelle sale | tempo + posizione | shader | esiste un componente `torches` che raccoglie tutti i transform con "Torch" nel nome e li rende in instancing |
| Preloader | incrocio fra rovine e ricostruzione con parallasse di profondita' | avanzamento del caricamento | - | due jpg + una depth map, in WebGL |
| Video introduttivo | scrub del filmato | scroll | - | il video e' una texture su un quad, non un `<video>` sopra la pagina |
| Suono ambientale | dissolvenza incrociata dei loop | **range di scroll** | rampa lineare di guadagno su 1 s | Web Audio nativo, canali `ui` / `ambient` / `music`; loop diversi per zona (es. `APADANA_LOOP`, `FIRE_TORCH_AMBIENT`) accesi e spenti in base a dove sei |
| Capitello dell'Apadana | ruota fra toro e leone-grifone | trascinamento | - | `Drag to see Lion capital` / `Drag to see Bull capital` |

## Colori

Letti dal CSS compilato (VERIFICATO). La palette e' cortissima: due colori
fanno il 90% del sito.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| Fondo | `#252525` | fondo di `html`/`body`, preloader, overlay, schede - dichiarato inline nell'HTML per evitare il lampo bianco |
| Accento / testo su scuro | `#f6cea0` | sabbia dorata: numeri, titoli decorativi, contorni dei bottoni, indicatori. E' il colore piu' usato del foglio di stile (53 occorrenze) |
| Testo su chiaro | `#ffffff` | testo di base sul fondo scuro (dichiarato inline) |
| Bruno / secondario | `#79644b` | superfici e bordi secondari |
| Bruno-grigio | `#75635a` | stati e bordi |
| Grigio chiaro | `#c4c4c4` | testo attenuato |
| Grigio medio | `#aeaeae` | testo disattivato |
| Grigio scuro | `#393638` | superfici sovrapposte |
| Blu ardesia | `#314757` | usato raramente, nei riquadri notte / cielo |
| Bianco caldo | `#eae8e5` | fondo delle pagine editoriali chiare |

La logica: **il colore vero lo mettono le pietre**. L'interfaccia e' nera e
sabbia perche' deve sparire dietro il 3D.

## Tipografia

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| Titolo decorativo (numeri del loader, titoli di capitolo) | **Maghfirea** | 400 | fluido, `max(20px, calc(20px + ((1vw - 6.4px) * 0.625)))` sul loader | 1 | serif dal disegno "orientaleggiante", usato pochissimo e grande - e' la firma del progetto |
| Testo serif (corpo delle pagine editoriali) | **Sabon Next** | regular | non verificato | non verificato | serif classico Linotype |
| Testo sans (interfaccia, menu, didascalie) | **Graphik** | Regular e Medium | non verificato | non verificato | grottesca neutra |
| Arabo (`ar`) | **Noto Naskh Arabic** (titoli e serif) | 400 | | | |
| Farsi (`fa`) | **Vazirmatn** (sans) + Noto Naskh | 400 | | | |
| Hindi (`hi`) | **Martel** (titoli/serif) + **Martel Sans** | 400 | | | |
| Cinese semplificato | **Noto Serif SC** + **Noto Sans SC** | 400 | | | |
| Cinese tradizionale | **Noto Serif TC** + **Noto Sans TC** | 400 | | | |

**Come sono serviti** (VERIFICATO):

- Maghfirea, Graphik, Martel, Noto e Vazirmatn sono **file locali** in
  `/version/<build>/font/`, woff2 con fallback woff, `font-display: swap`.
- **Sabon Next** viene invece da **Monotype/fonts.com**
  (`https://fast.fonts.net/t/1.css?apiType=css&projectid=ede4a7ac-...`), quindi
  e' l'unica dipendenza tipografica esterna, ed e' un font a licenza web a
  pageview.
- Il font decorativo Maghfirea e' **precaricato** con `<link rel="preload">` e
  il suo `@font-face` e' scritto **inline nell'head**, insieme allo stile del
  contatore: cosi' il primo frame del preloader e' gia' tipograficamente
  giusto senza aspettare il CSS. Piccolo dettaglio, grande effetto.
- L'intero set tipografico e' cambiato con variabili CSS
  (`--font-heading`, `--font-body-serif`, `--font-body-sans`) riscritte per
  lingua. Non ci sono font variabili.

## Testi veri

**Preloader**
> "Best experienced with sound"
> "Twenty-five hundred years ago, in what is now southern Iran, stood an ancient city of awe-inspiring beauty."
> "Built by powerful kings, it served as the ceremonial capital of Achaemenid Persia — the largest empire of its time."
> "Today, we know it as Persepolis."
> "presents"
> **Persepolis** *Reimagined*
> `Enter` — "Click enter to continue" / "Tap enter to continue"

**Intro scrollata**
> "Founded by Darius I around 518 BC,"
> "Persepolis was a monument to the power of the Achaemenid Empire — establishing a new visual language that glorified the king."
> "Imagine you're a dignitary during this time, traveling to the capital to pay respect to the king..."

**Istruzioni ricorrenti** (sono l'unica UI testuale del 3D)
> "Scroll to explore" · "Scroll to continue" · "Continue for more detail"
> "Drag to Explore" · "Drag to rotate"
> "Click to reveal present-day view"
> "Points of interest" · "Chapter [number]" · "Back to previous scene"
> "Tap to enlarge image" · "Listen to the translation" · "Discover"

**Voci di menu**
> "Explore Persepolis" · "View Map" · "Art Index" · "About this Project" · "Share"
> "Building overview" — legenda: "Current" / "Visited" / "To visit"
> "You are currently visiting here" · "See it in {scene}" · "Read more" · "Visit"
> "Language:" · "Accessibility options, sound, and language"
> Accessibilita': "Reduce Motion" · "High Contrast" · "Larger Text" · "No Dragging Interactions"

**Descrizioni dei sei capitoli** (testuali)
> **Gate of All Nations** — "This was the main entrance into Persepolis, built by King Xerxes, the son and heir of Darius. The entire citadel stood on a terraced platform, reached by a massive flight of 111 steps."
> **Apadana** — "The most impressive building in Persepolis, this imposing audience hall was raised on a platform overlooking the outlying plain. It was used for large-scale royal receptions, in which representatives from the empire's territories offered mandatory tribute to the king."
> **Palace of Xerxes** — "This building served as a center for ceremonies, religious rituals, and celebrations among the Persian elite. Feasts may have been organized here for the king and his court, with servants bringing in food and drink."
> **Southeastern Palace** — "Seemingly a more private space, the Southeastern Palace was used by the king and his family as a residential area, where they could relax away from the commotion of the audience halls and plazas."
> **Royal Treasury** — "One of the oldest structures at Persepolis, the Treasury served as an armory and storehouse. It was used to safeguard the tribute and goods of conquered nations. For added security, it had only two entrances, whereas most buildings in the citadel had several."
> **Hall of 100 Columns** — "Construction of this immense audience hall, which is nearly as large as the Apadana, was begun by Xerxes and completed by his son and successor, Artaxerxes I. The hall served many purposes, eventually becoming an extension of the Treasury."

**L'iscrizione trilingue, tradotta a sottotitoli** (e' il pezzo di scrittura piu' forte del sito)
> "I am Xerxes, the great king,"
> "king of kings, king of the lands of many people,"
> "king of this great earth far and wide."
> "By [the god] Ahura Mazda's favor I made this Gate of All Nations."
> "Much has been built in this Parsa [Persepolis] which I and my father have built."
> "What now has been built and appears beautiful,"
> "all that we have built by the favor of Ahura Mazda"
> "— King Xerxes"

**Il finale**
> "No empire lasts forever.<br>Persepolis would<br>eventually fall."
> **Present-day Persepolis** — "In 330 BC, the Macedonian king Alexander the Great invaded Persia and set fire to Persepolis. The remains of the city have endured — a reminder of the might of the Persian Empire and the diversity of the nations and cultures once under its rule."
> `Learn about Persepolis Recovered`

**Chiamata all'azione finale (About this Project)**
> "Persepolis Reimagined is the result of a collaboration between historians, creatives, and technologists, in the context of the Getty Villa Museum exhibition, *Persia: Ancient Iran and the Classical World*."
> "Learn More" → `Visit the exhibition` (getty.edu/persia)
> `Buy the exhibition catalogue:` → shop.getty.edu
> "Exhibition curated by: Timothy Potts, Jeffrey Spier, Sara E. Cole"
> "3D Model Adapted from: Demanavision, K. Afhami, and W. Gambke"
> "Consulting Advisor: Ali Mousavi"
> "Production: Media.Monks"

Nota da rubare sui crediti: **il modello 3D non e' loro**. E' adattato da un
lavoro archeologico esistente (Demanavision / K. Afhami / W. Gambke). Media.Monks
ha fatto la regia, non la ricostruzione. Per un'agenzia e' un modello
industriale replicabile: la sostanza la porta il committente o un terzo, tu
porti l'esperienza.

## Mobile

I punti di rottura sono quattro (VERIFICATO dalla configurazione:
`XSMALL max-width 639px`, `SMALL min-width 640px`, `MEDIUM min-width 920px`,
`LARGE min-width 1200px`, piu' un `SMALL_INVERTED max-width 919.9px` e un
`max-height: 820px` per gli schermi bassi).

**Cosa RESTA** (e la lista corta e' notevole: il sito non si arrende sul telefono)

- L'intera esperienza 3D. Non c'e' fallback a immagini, non c'e' un "guarda su
  desktop".
- Tutti e sei i capitoli, tutti gli hotspot, l'Art Index, la mappa, l'audio,
  le otto lingue, le opzioni di accessibilita'.
- Il preloader con la transizione depth map.

**La soglia che conta e' 920px.** Nel codice `isMobile` non e' "e' un telefono",
e' `deviceState < MEDIUM`, cioe' **sotto i 920px**. Tutto quello che segue
scatta li' (VERIFICATO).

**Cosa viene SOSTITUITO**

- **La direzione dello scroll degli approfondimenti.** E' la differenza piu'
  grossa del sito e non si vede da un solo screenshot: le pagine editoriali
  (`Imperial Iconography`, `Tributes & Gift Giving`, `Royal Feasts`, `The
  King's Power`, `Persepolis Recovered`) **su desktop scorrono in orizzontale**
  - si sfoglia di lato come un pannello di rilievi - e **sotto i 920px
  diventano verticali**. Stesso contenuto, due grammatiche di lettura
  (VERIFICATO: `editorialDirection`).
- **Le fotografie "com'era / com'e' oggi"**: ogni hotspot dichiara due file,
  `image.normal` e `image.small`, e sotto i 920px viene servito il piccolo
  (VERIFICATO).
- **Il verso di apertura delle schede opera**: la scheda di dettaglio di un
  oggetto entra **dal basso** su mobile e **dall'alto** su desktop
  (`backgroundOpenDirection: deviceState < MEDIUM ? BOTTOM : TOP`).
- **Le icone del selettore lingua**: `arrow-down` sotto i 920px,
  `chevron-down` sopra. Dettaglio minuscolo, ma dice quanto sono scesi in
  profondita'.
- **Gli asset 3D**. Esistono due set di geometria, `scenes/full/` e
  `scenes/half/`, e due lightmap, `LightMap` e `LightMap2k` (la 2k va con il
  set "half"). E' la leva principale del peso, ed e' una scelta binaria, non
  una scala continua (VERIFICATO nel codice del caricatore di scena).
- **I video**. Il video introduttivo e' codificato per dispositivo:
  `video/{deviceState}/intro_masked.mp4`. In portrait lo shader **ruota le
  UV di 90 gradi** invece di ritagliare il filmato, per non perdere meta'
  inquadratura.
- **Le immagini del preloader**, anch'esse per dispositivo:
  `webgl/preloader/{deviceState}/`.
- **Il formato immagine**: il sito verifica a runtime il supporto di **WebP** e
  **AVIF** con due immagini base64 di prova, e se c'e' WebP serve `.webp` al
  posto di `.jpg`/`.png` - lightmap comprese.
- **Le animazioni del testo**: su `theme: "small"` i titoli vengono animati
  **per righe** invece che per caratteri (VERIFICATO: la stessa scorciatoia
  usata per arabo/farsi/hindi). Meno nodi DOM da animare, meno lavoro per il
  telefono.
- **I microtesti**: `Click enter to continue` diventa `Tap enter to continue`,
  `Tap to enlarge image` compare solo su touch.

**Cosa SPARISCE**

- Il `hover` della camera (la rotazione legata alla posizione del mouse) non
  ha equivalente touch: sul telefono resta solo il trascinamento.
- **Il trascinamento nell'Art Index**: la galleria delle opere e' trascinabile
  solo sopra i 920px (`hasDrag: deviceState > SMALL`). Sotto, si naviga a tocchi.

**E c'e' un caso in piu' che vale la pena rubare**: l'opzione di accessibilita'
**"No Dragging Interactions"**, descritta nel codice come *"Enable this setting
if you have trouble with drag and hold interactions"*. Chi non puo' o non vuole
trascinare la disattiva, e il sito offre l'alternativa a clic - il selettore
toro/leone-grifone dell'Apadana, per esempio, e' un cursore trascinabile
(GSAP Draggable con snap) **affiancato da due pulsanti veri** che fanno la
stessa cosa.

Le quattro opzioni - **Reduce Motion, High Contrast, Larger Text, No Dragging
Interactions** - non partono spente: tre di esse leggono le preferenze di
sistema all'avvio (`(prefers-reduced-motion: reduce)` e `(prefers-contrast:
more)`; "Larger Text" non ha media query e resta manuale). Un pannello di
accessibilita' vero, dentro un'esperienza WebGL - la cosa che tutti dicono che
non si puo' fare. Onesta': gli stili "alto contrasto" nel foglio principale
sono **pochissimi** (in pratica rendono opachi i fondi dei bottoni), quindi
l'opzione e' piu' dichiarata che sostanziale.

## Stack

| voce | cosa usa | stato | come l'ho capito |
|---|---|---|---|
| Struttura HTML | SPA con guscio vuoto: 3,7 KB di HTML, un `<div id="app">` e basta | **VERIFICATO** | scaricato l'HTML: il contenuto non esiste finche' non gira il JS |
| Framework | **Vue 2** (2.6.11 / 2.6.12) con **Vuex** e vue-router | **VERIFICATO** | stringhe di versione nel bundle, mutazioni `app/set...`, `router-link` |
| Impalcatura componenti | **Muban** di Media.Monks (`AbstractTransitionComponent`, `AbstractTransitionController`, `seng-device-state-tracker`) | **VERIFICATO** | classi e nomi nel bundle; sono librerie open source dello studio stesso |
| Build | **Webpack** (bundle `vendors.js` + `app.js` + chunk numerati, cartella versionata `/version/1659513005297/`) | **VERIFICATO** | `webpackJsonp`, `webpackPublicPath` |
| Animazione | **GSAP 3.9.1** con i plugin a pagamento: **SplitText**, **DrawSVG**, **CustomEase**, **CustomWiggle**, **Draggable + InertiaPlugin**, e **Flip** in vendors (non usato in `app.js`) | **VERIFICATO** | `version="3.9.1"`, `CustomEase.create("VinnieInOut", "M0,0 C0.2,0 0,1 1,1")`, `draggable.vars.snap` |
| Contesto WebGL | **WebGL2 se c'e', WebGL1 come ripiego** (due classi di renderer distinte). Contesto creato con `alpha: false`, `stencil: true`, `antialias: false`, `premultipliedAlpha: false`, `powerPreference: "high-performance"` | **VERIFICATO** | `Boolean(canvas.getContext("webgl2", ...)) ? new RendererWebGL2(...) : ...` |
| Scroll | **smooth-scrollbar** (la libreria di idiotWu) con plugin `overscroll`, piu' due plugin scritti in casa: `horizontal` e `forward` (avanti-e-basta). Parametri: `damping: 0.1`, overscroll `damping: 0.15`, `maxOverscroll: 200`, `alwaysShowTracks: false`, `delegateTo: document.body` | **VERIFICATO** | `Scrollbar.init(...)` nel componente `HorizontalPage`; `smooth-scrollbar` e `ScrollbarPlugin` presenti in vendors. **Nessuna traccia di Lenis, Locomotive o ScrollSmoother. ScrollTrigger e' in vendors ma non compare nel codice applicativo (0 occorrenze in `app.js`): le scene NON usano ScrollTrigger** |
| Direzione di scroll | esiste sia `VerticalPage` che `HorizontalPage`: gli approfondimenti editoriali scorrono **in orizzontale su desktop** e **in verticale sotto i 920px** | **VERIFICATO** | `editorialDirection(){ return this.deviceState < MEDIUM ? VERTICAL : HORIZONTAL }` |
| Rotte | `/` (intro col video), `/experience/:slug` (una rotta per edificio), `/webgl` (pagina di sviluppo), `*` → `/` | **VERIFICATO** | definizione del router nel bundle |
| 3D | **motore WebGL proprietario**, non three.js e non Babylon | **VERIFICATO** | i sorgenti GLSL sono nel bundle, con uniform propri (`_Model`, `_ViewProjection`, `_LightMapScaleOffset`, `_ScaleOffset`) e define `LIGHT_MAP` / `SPECULAR` / `USE_NORMAL_MAP` / `UV_SCALE_OFFSET`. Nessun `WebGLRenderer`, `PerspectiveCamera`, `GLTFLoader`, `ShaderMaterial` |
| Autoring 3D | **Unity**, esportato in un formato proprio | **VERIFICATO** | il caricatore di scena parla di `unity`, `unityAnimator`, `unityComponents`, `sceneReferences`, `mainTimeline`, `visibilitySets`, `highlightedItems`; le scene stanno in `webgl/scenes/<Nome>/<Nome>.json` con lightmap accanto |
| Illuminazione | **lightmap precotte** (`LightMap.jpg` / `LightMap2k`, canale UV1 dedicato) + specular opzionale + normal map opzionale | **VERIFICATO** | shader e caricatore |
| Ottimizzazione mesh | **instancing** attivo di default (`useInstancing = true`, `useDynamicInstancing`) + scarico esplicito di texture per scena (`texturesToUnload`) | **VERIFICATO** | codice del caricatore |
| Oggetti museali animati | **video mp4**, non modelli 3D (akinakes, amphoraRhyton, giftBearer, hornedLionGriffin, wineJug) | **VERIFICATO** | percorsi `video/*.mp4` nel bundle |
| Audio | **Web Audio API nativa**, gestita a mano (canali `ui`/`ambient`/`music`, `GainNode`, rampe lineari, fade in/out con GSAP, dissolvenza sui bordi dei loop) | **VERIFICATO** | nessuna traccia di Howler; funzioni di gain e `bufferSource` scritte a mano |
| Immagini | jpg/png con **WebP** servito se supportato, rilevamento a runtime anche di AVIF | **VERIFICATO** | `checkWebpSupported` / `checkAvifSupported` con immagini base64 di prova |
| Font | woff2 locali + **Monotype fonts.com** per Sabon Next | **VERIFICATO** | `@font-face` nel CSS e `fast.fonts.net` |
| CMS | **nessuno**. I testi sono file JSON per lingua, compilati nel bundle come chunk asincroni | **VERIFICATO** | `i18n/en_US.json` esce come chunk webpack numero 1 |
| Hosting | **Amazon S3 + CDN**, dominio dedicato `persepolis.getty.edu`, cartella versionata per build | **VERIFICATO** | gli errori sugli asset tornano XML S3 (`<Code>AccessDenied</Code>`, `RequestId`, `HostId`) |
| Analytics | **Plausible** (`plausible.io`, `data-domain=persepolis.getty.edu`) **e** Google Tag Manager (`GTM-5ZQJW92`), con eventi personalizzati (`page_view`, eventi su `dataLayer`) | **VERIFICATO** | tag nell'HTML e funzione di tracking nel bundle |
| Strumenti di debug lasciati dentro | **dat.GUI** in vendors e caricamento a richiesta di **stats.js** da CDN | **VERIFICATO** | `Vr.externalControl`, `stats.js/build/stats.min.js` iniettato in `document.head` |

## Peso e prestazioni

Numeri veri misurati con richieste HTTP dirette (VERIFICATO):

| risorsa | peso |
|---|---|
| HTML iniziale | **3,7 KB** |
| `css/vendors.css` | 1,9 KB |
| `css/app.css` | **76,4 KB** |
| `js/vendors.js` | **747 KB** (non compresso) |
| `js/app.js` | **802 KB** (non compresso) |
| chunk lingua `en_US` | **61 KB** |
| un font (Graphik Regular woff2) | 36,5 KB |

**JavaScript totale del guscio: circa 1,55 MB non compressi**, piu' 61 KB di
testi per lingua. E' tanto per un sito editoriale e normale per un motore 3D
scritto in casa.

**Il peso vero - le scene 3D, le lightmap, i video, le foto - non l'ho potuto
misurare**: il bucket S3 restituisce `AccessDenied` su qualunque percorso non
indovinato esattamente, e i nomi dei file di scena sono composti a runtime. Per
avere i numeri servirebbe aprire la pagina e leggere il pannello di rete.

Quello che si puo' dire con certezza sulla **strategia** di peso, che e' la
domanda vera:

1. **Una scena per volta.** Ogni edificio e' una rotta a se
   (`/experience/<slug>`), con il suo file di scena e la sua lightmap. Non si
   carica mai Persepoli intera.
2. **Due livelli di dettaglio**, `full` e `half`, con lightmap a risoluzione
   dimezzata sul secondo.
3. **Niente luci in tempo reale.** Tutta l'illuminazione e' cotta in texture.
   E' il motivo per cui una ricostruzione archeologica con migliaia di metri
   quadri di rilievi gira su un telefono.
4. **Scarico esplicito delle texture** non piu' servite, dichiarato scena per
   scena (`texturesToUnload`).
5. **Instancing** per tutto cio' che si ripete - e a Persepoli si ripete
   quasi tutto: colonne, torce, gradini, rilievi.
6. **WebP se c'e'.**
7. **Il tempo di attesa e' contenuto narrativamente**: le tre righe di testo
   piu' la transizione rovine->citta' esistono per rendere accettabile un
   caricamento lungo. Non e' una barra di avanzamento, e' un prologo.
8. **Gli oggetti di museo sono video, non 3D.** Un rhyton che gira e' un mp4 di
   qualche centinaio di kilobyte invece di un modello con texture da
   fotogrammetria.

Punteggi di terze parti: l'usabilita' su Awwwards e' **7,41**, il voto piu'
basso delle quattro voci - coerente con un sito che pesa e che chiede pazienza.
Non ho un Lighthouse: **non verificato**.

## Tre cose da rubare

**1. Il buco nella mappatura scroll->camera.**
La camera non e' agganciata linearmente allo scroll: la configurazione mappa
*segmenti* di scroll a *segmenti* di timeline, e fra un segmento e l'altro
lascia dei vuoti in cui l'utente scrolla e **la camera resta ferma**. Nella
Gate of All Nations: `scroll [0, 0.3] -> camera [0, 0.171]`, poi
`scroll [0.34, 0.726] -> camera [0.171, 0.713]`, poi
`scroll [0.78, 1] -> camera [0.713, 1]`. Quei buchi (0,3-0,34 e 0,726-0,78)
sono le pause del racconto: e' li' che si legge, si guarda, si respira.
Loro non usano ScrollTrigger (l'hanno in pancia ma non lo chiamano): si sono
scritti la mappatura a mano. Noi lo rifaremmo con GSAP ScrollTrigger e una
timeline unica in cui si inseriscono tratti vuoti - il risultato e' lo stesso.
**Senza questo, ogni sito 3D scrollato sembra un carrello di telecamera senza
punteggiatura.**

**2. Il caricamento come primo atto, non come attesa.**
Il numero che sale e' scritto nel font di titolazione, grande, al centro; sopra
ci passano tre frasi che raccontano gia' tutta la tesi del sito; e la barra di
avanzamento e' sostituita da una fotografia di rovine che diventa una citta'.
Il `@font-face` del carattere decorativo e lo stile del contatore sono scritti
**inline nell'head** e il font e' in `preload`, cosi' il primo fotogramma e'
gia' giusto. Costo: due jpg, una depth map, venti righe di CSS. Effetto: il
visitatore che aspetta trenta secondi non se ne accorge. Rifacibile su
qualunque sito pesante, anche senza 3D.

**3. Prendere il controllo dello scroll solo nei momenti che contano.**
Quando si entra in un punto di interesse il sito **blocca l'input, azzera
l'inerzia, porta da solo la pagina alla posizione esatta in un secondo, e poi
restituisce il controllo** (`lockScroll` → `setMomentum(0,0)` → `scrollTo(pos,
1000)` → `unlockScroll`). Non e' scroll-jacking permanente - che infastidisce -
e' scroll-jacking chirurgico, tre secondi ogni venti schermate, sempre per
inquadrare bene una cosa. Il resto del tempo la pagina e' libera. E' la
differenza fra una regia e una gabbia.

*(Bonus, se serve una quarta: l'onesta' come dispositivo narrativo. Gli
hotspot "Click to reveal present-day view" mostrano la foto della rovina sopra
la ricostruzione. Un sito che ricostruisce e poi si smentisce e' piu' credibile
di uno che ricostruisce e basta. Vale per il 3D archeologico come per un
render di prodotto.)*

## Non verificato

- **Non ho aperto il sito in un browser.** Tutta la scheda e' ricavata
  dall'HTML, dai bundle JavaScript, dal CSS compilato e dai file di traduzione
  scaricati direttamente. Quindi: tempi reali di caricamento, fluidita', numero
  di richieste, peso totale della pagina, punteggi Lighthouse - **non
  verificati**.
- **Il peso delle scene 3D, delle lightmap, dei video e delle foto**: il bucket
  S3 nega l'accesso a ogni percorso non esatto e i nomi dei file di scena sono
  composti a runtime. Ho la strategia, non i megabyte.
- **Corpi, interlinee e scale tipografiche precise**: leggibili solo scena per
  scena nel CSS compilato con i nomi di classe offuscati. Ho verificato le
  famiglie e la logica, non i numeri.
- **Il numero esatto di schermate dell'intro scrollata** e della sezione
  finale: stimati. I 23 / 21 / 12 / 14 / 5,5 / 9 delle sei scene invece sono
  letti nel codice.
- **Il layout sotto 920px oltre ai casi elencati**: ho mappato le differenze
  decise dal JavaScript (direzione degli editoriali, immagini piccole, verso
  di apertura delle schede, drag dell'Art Index, icone); le differenze decise
  solo dal CSS, con nomi di classe offuscati, non le ho ricostruite una per
  una.
- **La reale efficacia dell'alto contrasto**: ho trovato una sola regola nel
  foglio principale, non so se ce ne siano altre altrove.
- **La durata reale del caricamento** e se il sito e' ancora online e
  funzionante nel 2026 con lo stesso comportamento (l'HTML risponde 200 e la
  build e' quella del 2022, quindi presumibilmente e' congelato).
- **Il criterio con cui il sito sceglie fra il set `full` e il set `half`**:
  so che i due set esistono e che il flag arriva dall'alto, non ho ricostruito
  chi decide (dimensione dello schermo? benchmark del dispositivo?).
- **Il video introduttivo: DOM o WebGL?** Nel bundle c'e' uno shader per
  texture video, ma la HomePage tiene anche un `videoSrc` proprio. Non ho
  stabilito quale dei due percorsi sia effettivamente usato per l'intro.
- **Se il suono e' voce recitata o solo ambiente**: l'interfaccia dice `Listen
  to the translation` e c'e' un canale `music` oltre a `ambient` e `ui`, ma non
  ho ascoltato i file.
