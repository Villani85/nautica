# DARK — The Official Guide (Netflix)

> **AVVISO SULL'URL, da leggere prima di tutto.**
> L'indirizzo indicato da Awwwards, `http://darknetflix.io`, **non esiste piu'**: oggi
> risponde `301 Moved Permanently` verso `https://www.netflix.com/` (server CloudFront;
> verificato con `curl` il 13/08/2026).
> **Il sito pero' e' ancora vivo, su un altro dominio: `https://dark.netflix.io/`**, servito
> da nginx/1.18.0, build `version/1653376168543` (maggio 2022).
> Non e' una ricostruzione e non e' una versione diversa: il foglio di stile servito oggi e
> quello archiviato il 30/06/2020 su `darknetflix.io/version/1593525392070/css/app.css`
> sono **byte-identici** (45.023 byte, MD5 `277ed309a98d45555941836c36ca8a13` entrambi).
> Quindi tutto quello che c'e' sotto e' letto **dal sito vero, in produzione**, non dall'archivio.
> `dark.netflix.io` ospitava prima (2017-2019) un sito Gatsby diverso, con rotte tipo
> `/1921/`, `/1953-1954/`, `/1986-1987/` (Wayback CDX): quello e' stato sostituito da questa
> guida, non e' questo progetto.

- **URL**: **https://dark.netflix.io/** (vivo). Vecchio dominio premiato: `https://darknetflix.io/` → 301 a netflix.com. Rotte con lingua: `/en`, `/en/family-tree`, `/en/event-timeline/jonas-kahnwald`.
- **Premio**: Awwwards **Site of the Day** del **3 novembre 2020** + **Developer Award** (fonte: https://www.awwwards.com/sites/dark-official-netflix-guide). Punteggi: SOTD **7,96/10** (Design 8,17 · Usability 7,29 · Creativity 8,27 · Content 8,48), Developer Award 7,25/10. **Attenzione**: sulla scheda Awwwards **non risulta "Site of the Year 2020"** — risulta solo Site of the Day + Developer Award. Il "Site of the Year" del brief non l'ho potuto confermare da nessuna fonte (vedi *Non verificato*).
- **Studio**: **Monks** (ex MediaMonks, credito "PRO" su Awwwards) con **HAS.WORKS**. Cliente: Netflix.
- **Anno**: online dal **27/06/2020** (data di uscita della stagione 3, scritta nel file di lingua: `prelaunch.date = "2020-06-27T07:00:00.000Z"`); prima di quella data il sito era un conto alla rovescia (esiste ancora la rotta `countdown`). Build attualmente servita: maggio 2022.
- **Letto il**: 13/08/2026

**Metodo.** Nessuna scheda di browser aperta, nessuno screenshot: tutto e' stato letto con
`curl` e `WebFetch` sul guscio HTML (5,3 KB), sul CSS (`css/app.css`, 45 KB), sui due bundle
(`js/vendors.js` 986 KB, `js/app.js` 854 KB non compressi), sui chunk di lingua e sui file
di dati (`static/family-tree/*.json`, immagini). Il sito e' una **single page application
Vue**: da fuori l'HTML e' un guscio vuoto, quindi **tutto quello che segue e' ricavato dal
codice sorgente e dai dati veri**, non da una visita. Le cose che si vedono soltanto
eseguendo il sito (colori percepiti a schermo, fluidita', tempi reali) sono marcate.

---

## Cosa tratta il sito

E' la **guida ufficiale alla serie DARK**: un archivio navigabile di tutto quello che
succede nelle tre stagioni. Non e' un sito promozionale con un trailer e un pulsante: e'
una **base di dati narrativa** messa in scena. I numeri sono contati sui file di produzione:

| cosa | quanto |
|---|---|
| Schede-entita' totali (`whatwhenwho`) | **166** |
| di cui **WHO** (persone) | 116 |
| di cui **WHAT** (oggetti e luoghi) | 41 |
| di cui **WHEN** (epoche) | 9 |
| Mondi paralleli | 3 — A "Adam's World" (84 entita'), B "Eva's World" (52), C "The Original World" (30) |
| Linee temporali (`timelines`) | **134** |
| Eventi | **836** (di cui 707 con testo scritto) |
| Eventi di nascita / di morte | 78 / 34 |
| Arco di anni coperto | **1813 → 2053** |
| Rimandi interni dentro i testi | **2.319**, verso 121 entita' diverse |
| Lunghezza media di una scheda-evento | 272 caratteri |
| Episodi | 26 (10 + 8 + 8) |
| Alberi genealogici pre-calcolati | **19**, uno per episodio-tappa |
| Lingue | 8: en, de, nl, es, pt-BR, pl, tr, **ar** (con impaginazione da destra a sinistra) |

Le epoche sono le nove della serie: 1888, 1920-21, 1953-54, 1986-87, 2019/2020, 2020
(Post-Apocalypse), 2052-53, e le due del mondo B (2019, 2052). Gli oggetti sono quelli che
nella serie fanno da chiave: `god-particle`, `ouroboros-bracelet`, `sic-mundus-creatus-est`,
`the-portable-time-machine`, `emerald-tablet`, `winden-caves`, `the-yellow-barrels`.

## Cosa vende, e qual e' l'obiettivo finale

Il prodotto e' **l'abbonamento Netflix**, ma il sito non lo vende mai: non c'e' un prezzo,
non c'e' una registrazione, non c'e' un modulo. **Non c'e' nemmeno un link per guardare gli
episodi**: nel modello dati ogni episodio ha un campo `url` e **tutti e 26 sono vuoti**
(`{''}`); l'unico rimando a Netflix in tutto il bundle e' il logo nel piede, che porta alla
home `https://www.netflix.com/`, non alla pagina della serie. Questo e' un fatto, non
un'impressione: e' verificabile nel sorgente.

Quindi l'obiettivo dichiarato — *aiutarti a capire la serie* — e quello vero coincidono solo
in parte. L'obiettivo vero e' **la ritenzione**:

1. **Non farti mollare per confusione.** DARK e' la serie che si abbandona perche' non si
   capisce chi e' chi. La guida toglie quell'alibi.
2. **Farti riguardare le stagioni 1 e 2** prima della 3, uscita lo stesso giorno del lancio
   della guida.
3. **Tenere accesa la conversazione fra un episodio e l'altro**: il piede dice
   "Join the Conversation" e manda su **reddit.com/r/DarK**, Twitter, Instagram, Facebook.
   Il traffico non torna a Netflix, va nella community — che e' esattamente il posto dove si
   crea l'attesa.
4. **Farsi ricordare come marchio che tratta bene il suo pubblico** (e, secondariamente,
   vincere premi: il sito e' un pezzo di reputazione per Netflix e per Monks).

## A chi

A chi **ha gia' cominciato la serie**. Il sito non e' progettato per convincere un
non-spettatore: la prima cosa che ti chiede e' *a che episodio sei arrivato*, e se non
rispondi non entri. Il compratore-tipo:

- **Cosa sa gia'**: i nomi principali, che ci sono piu' epoche, che qualcuno viaggia nel tempo.
- **Cosa teme**: di essersi perso qualcosa; e, molto piu' forte, **di beccarsi uno spoiler**.
  La paura dello spoiler e' il vero problema di prodotto, ed e' quella su cui e' costruita
  tutta l'architettura.
- **Cosa deve pensare uscendo**: *ora ho la mappa, posso continuare* — e, in seconda battuta,
  *questa serie e' costruita cosi' bene che meritava un sito cosi'*. Il rispetto per l'opera
  si trasferisce al servizio.

## L'esperienza progettata

Non e' un racconto a scorrimento e non e' una vetrina. E' **una visita in archivio con una
guardiania**: prima ti fanno firmare un patto, poi ti aprono la sala.

Il patto e' il pezzo di design che vale il premio. La prima schermata e' letteralmente il
filtro anti-spoiler (nel codice `HomePage` monta come componente principale `SpoilerFilter`):
*"Select season and episode for a spoiler free experience"*. Scegli stagione, trascini una
manopola sugli episodi, premi *Save & Continue*. Da quel momento **tutto il sito e' potato**:
l'albero genealogico, la ricerca, i testi, perfino le fotografie sono la versione che
conosce solo quello che hai visto tu. La scelta viene salvata in `localStorage` (Vuex
persistito sul solo ramo `user`), quindi il patto vale anche alla visita dopo.

Poi si entra nella sala: **l'albero genealogico**, disegnato in WebGL, che si esplora
trascinando e zoomando. Non c'e' scorrimento di pagina — `html, body { height:100%;
overflow:hidden; touch-action:none }`: **la pagina non scorre mai**, il gesto e' sempre
"muoversi dentro qualcosa".

Cosa deve fare il visitatore, passo per passo:

1. Dichiarare a che punto e' (stagione + episodio).
2. Esplorare l'albero: trascinare, avvicinarsi, passare sopra i ritratti (che rispondono con
   un suono e un'increspatura), cliccarne uno.
3. Leggere la **linea temporale personale** di quel personaggio: un evento per volta, ogni
   evento con la sua fotografia a tutto schermo, l'anno, il mondo (A/B/C), il titolo e un
   paragrafo.
4. Dentro il paragrafo, saltare su un altro personaggio, un oggetto o un'epoca — perche' ogni
   nome citato e' un link. E' qui che la visita diventa una tana di coniglio: 2.319 rimandi.
5. Arrivare in fondo alla linea temporale e trovare il muro: *"End of season 1 Episode 4 — The
   end is the beginning"*, con il pulsante **"Include more episodes?"** che riapre il filtro.
   Cioe': **il limite non e' un errore, e' un invito a guardare altri episodi**.

L'immagine che resta in testa e' **l'albero bianco su nero che cresce**: un grafo di ritratti
e linee ortogonali che, man mano che dichiari di aver visto piu' episodi, si allarga a vista
d'occhio. Numeri veri, letti dai file di layout:

| stato | ritratti | linee di parentela | oggetti totali sul piano |
|---|---|---|---|
| `S1E1.json` (hai visto il primo episodio) | 18 | 25 | 57 |
| `S3E8.json` (hai finito tutto) | **79** | **142** | 280 |
| `c-world.json` (il terzo mondo, sbloccabile) | 32 | 34 | 105 |

L'area del piano passa da circa 1.500 x 1.600 unita' a **3.900 x 2.100**. Il sito, in pratica,
**ti fa vedere quanto e' grande la parte di storia che non conosci ancora**, senza dirti niente
di quella storia.

## Come e' organizzata la persuasione

E' rovesciata rispetto a un sito commerciale. Non c'e' promessa → prova → prezzo → azione.
C'e' **patto → potere → limite → invito**.

- **La promessa** sta in due righe, ed e' l'unica pubblicita' del sito, nei meta e nella
  schermata di conto alla rovescia: *"THE END IS THE BEGINNING"* / *"Discover how everything
  is the same, but different."*
- **La prova** e' il prodotto stesso: 166 schede, 836 eventi, 19 alberi. Non c'e' una sezione
  "perche' fidarsi": la mole e' la prova.
- **Il prezzo** non esiste. **La chiamata all'azione esplicita nemmeno** — e questa e' una
  scelta, non una dimenticanza: i campi per il link all'episodio ci sono e sono stati lasciati
  vuoti.
- **La chiamata all'azione vera e' il muro dello spoiler**: ogni volta che arrivi al confine
  di quello che hai visto, il sito ti dice che c'e' dell'altro e ti offre il bottone per
  ammettere di aver visto di piu'. L'unico modo onesto di premerlo e' andare a guardare la
  serie. E' un CTA travestito da regola del gioco.

**Quante schermate per arrivarci**: una. Il filtro anti-spoiler e' la prima cosa. Non c'e'
"scorrere fino in fondo".

**Cosa arriva a chi non prosegue.** Molto poco, ed e' il punto debole: chi non compila il
filtro non vede niente (le rotte `/family-tree` e `/event-timeline/:slug` hanno una guardia
`beforeEnter` che rimanda alla home se il filtro non copre l'elemento richiesto). Chi arriva
da un link condiviso a un personaggio che non e' ancora "sbloccato" viene rispedito alla
schermata iniziale. E chi non ha JavaScript, o e' un motore di ricerca, vede **soltanto il
guscio**: `/en`, `/en/family-tree` e `/en/event-timeline/jonas-kahnwald` restituiscono tutte
e tre lo stesso HTML da 5,3 KB con un solo titolo, `DARK | The Official Guide | NETFLIX`.
Non c'e' `robots.txt`. Le 707 schede di testo sono **invisibili a Google**. E' un archivio
enorme che non esiste per chi non ci entra dalla porta.

## Idea regista

**Sei tu a dire quanto sai, e il sito ti restituisce esattamente quel mondo — piu' grande a
ogni episodio che ammetti di aver visto.**

## Il momento

Ce ne sono tre, e sono tutti meccanici, non decorativi.

1. **L'albero che si allarga.** Cambi il filtro da S1E4 a S3E8 e il grafo passa da 18 a 79
   ritratti, con le linee che si ridisegnano. Non e' legato allo scorrimento: e' legato a una
   tua dichiarazione. E' il momento in cui capisci che il sito ti stava nascondendo qualcosa.
2. **Le fotografie che si fondono.** Nel modello dati ogni evento ha piu' `heroImages`, ognuna
   con `season`/`episode` e un `imageEffect` che puo' essere `static`, `mirror` o `split`.
   Il caso vero: l'evento `C01E0` (nascita di Jonas) mostra una foto normale finche' sei a
   inizio serie; **da S1E10 in poi lo stesso evento e' servito da `C01C02E0.jpg` con effetto
   `mirror`** (Jonas e The Stranger sono la stessa persona), e **da S2E4 diventa la linea
   `C01C02C03T-1`, con tre immagini specchiate** (Jonas + The Stranger + Adam). Cioe': **tre
   linee temporali separate si fondono in una sola davanti ai tuoi occhi**, quando la storia
   te lo concede. Su 876 immagini-evento, 48 sono in modalita' `mirror`.
3. **L'occhio di Wöller (uovo di Pasqua).** Nella scheda del detective Torben Wöller il testo
   dice, testuale: *"You can't miss the detective's injury to his `<<right eye>>` — what
   happened?"*. La sintassi `<<...>>` compare **una volta sola in tutto il sito** e marca una
   zona cliccabile (`.eye-hit-area`, posizionata al 35% dall'alto, larga il 15%). Cliccandola,
   il componente `EasterEgg` fa partire `showFakeLoader()`: **un caricamento finto**, la
   presa in giro della gag della serie in cui non si scopre mai cosa sia successo a
   quell'occhio. Un designer che ha letto la serie fino in fondo.

## Struttura, sezione per sezione

Il sito ha **tre rotte sole** (`{path:"/"}`, `{path:"/family-tree"}`,
`{path:"/event-timeline/:slug"}`), piu' una `countdown` per il pre-lancio e sovrapposizioni
(overlay) non instradate. La "profondita'" non e' fatta di pagine: e' fatta di stati.

| sezione | cosa mostra | cosa fa l'utente | quanto dura |
|---|---|---|---|
| Preloader (nell'HTML, prima del JS) | Il nodo dell'infinito di DARK disegnato in SVG, tratto bianco 6px su #080808, che si traccia con `stroke-dasharray` su `pathLength=100`, + percentuale numerica | Aspetta | finche' il bundle e i dati non sono pronti |
| Intro logo | Animazione Lottie `logo_dark_intro.json` (39 KB, renderer SVG) | Guarda | pochi secondi, a tempo |
| Cookie policy | Sovrapposizione con testo legale, `Accept` / `Reject` | Sceglie | 1 schermata bloccante |
| **Home = filtro anti-spoiler** (`/`) | "Select season and episode for a spoiler free experience": elenco delle 3 stagioni + manopola trascinabile sugli episodi | Sceglie stagione, trascina l'episodio, preme *Save & Continue* | 1 schermata, obbligatoria |
| **Albero genealogico** (`/family-tree`) | Piano WebGL: ritratti 250x330, linee ortogonali di parentela, simboli di nascita/morte, etichette a sinistra/destra dei nodi | Trascina, zooma, passa sopra, clicca un ritratto | senza fondo: e' un piano, non una pagina |
| Aiuto all'interazione | "Explore the family tree using your mouse or trackpad" / "...using finger gestures" | Legge una volta sola (lo stato `alreadyInteracted` e' salvato) | 1 sovrapposizione |
| **Linea temporale** (`/event-timeline/:slug`) | Un evento per volta: fotografia 2048x1152 a tutto schermo, "Season 1 Episode 4", titolo, paragrafo con i link interni, anno e mondo (Adam's World / Eva's World / The Original World), un asse degli anni laterale | Rotella / frecce / trascinamento verticale per avanzare di un evento; clicca i nomi dentro il testo | tanti passi quanti sono gli eventi ammessi dal filtro |
| Fine linea temporale | "End of season X Episode Y" + "The end is the beginning" + "Include more episodes?" | Riapre il filtro, o torna all'albero | 1 passo |
| Menu (pannello laterale) | Campo di ricerca + risultati raggruppati in Who / What / When (massimo 6 per gruppo) + le voci Families, Language, Episodes, Share | Digita, clicca | pannello fisso, largo al massimo 564px |
| Episodi | Elenco dei 26 episodi con miniatura, titolo e sinossi ufficiale Netflix | Scorre | pannello |
| Lingua | 8 lingue con bandiera | Sceglie | pannello |
| Condivisione | Facebook / Twitter / Whatsapp / "Copy link" → "Link copied!" | Clicca | pannello |
| Piede del menu | "Join the Conversation" + Twitter, Instagram, Facebook, Reddit + logo Netflix + Privacy & Terms, Imprint, "© {year} NETFLIX ALL RIGHTS RESERVED" | Clicca | in fondo al pannello |

## L'esperienza in ordine di tempo

**Primi dieci secondi** (ricostruiti dal codice: la sequenza e' certa, i tempi in secondi
**non sono cronometrati** perche' non ho eseguito il sito).

- **0 s** — Arriva un HTML di 5,3 KB. Prima ancora del CSS, un blocco `<style>` inline mette
  `html { background:#080808 }`: **niente lampo bianco**, mai. Nel corpo c'e' gia', scritto a
  mano, un `<svg>` con il nodo dell'infinito (il logo di DARK), tratto bianco spesso 6,
  `pathLength="100"`, `stroke-dasharray: 0 100`. Il segno del marchio e' l'unica cosa che
  esiste prima del JavaScript.
- **0 s** — Partono in parallelo `js/vendors.js` (300 KB compressi) e `js/app.js` (161 KB),
  piu' il chunk della lingua (80 KB) e Google Tag Manager (`GTM-NQ2BBV3`).
- **~1 s** — Il componente `SitePreloader` **non ricrea** il nodo: fa
  `document.querySelector('.js-site-preloader')` e se lo **sposta dentro di se'** con
  `appendChild`. Il tratto che stava girando continua a girare, senza salti. Accanto compare
  una percentuale: `Math.round(100*(manualProgress+progress)/2)`, cioe' la media fra il
  caricamento vero e un avanzamento finto — il classico trucco per non far vedere una barra
  che si inchioda.
- **~3 s** — Il logo DARK entra come animazione Lottie in SVG (`logo_dark_intro.json`,
  39 KB), `autoplay:false`: parte pilotato dal controller di transizione, non da solo.
- **poi** — Cookie policy: *"Netflix uses cookies for the website to function..."* con
  `Accept` / `Reject`.
- **poi** — Sfondo di tipo `SPOILER_FILTER` in dissolvenza di **2 secondi** (`transition: FADE,
  duration: 2` nel codice della home), e sopra compare la domanda: *"Select season and episode
  for a spoiler free experience"*. Nessun titolo di benvenuto, nessun trailer: **la prima cosa
  che il sito fa e' farti una domanda**.
- L'audio parte **acceso** (`muted: false` nello stato iniziale): un ambiente in loop
  (`Dark_loop_v301`) piu' i suoni di interfaccia. C'e' un pulsante per zittire, con una linea
  che pulsa.

**Poi, a blocchi:**

1. **Scelta** — passi sopra le stagioni (lo stato `hoveredSeason` ridisegna l'elemento),
   trascini la manopola degli episodi (Draggable di GSAP, con suono `Dark_season_selection`
   e `Dark_episode_slider`), premi *Save & Continue*: parte `Dark_continue_v203`, il sito
   carica il file d'albero corrispondente (`$webgl.loadFamilyTree(spoilerFilter, ...)`) e ti
   spinge su `/family-tree`.
2. **Esplorazione** — il piano WebGL. Passando sopra un ritratto parte
   `Dark_rollover_tree_v203` e l'evento interno `PORTRAIT_HOVER`; cliccando, `PORTRAIT_CLICK`
   con `Dark_portrait_v203`. Esiste anche un evento `DARK_MATTER_ENERGY` con due suoni
   dedicati (`Dark_darkmatter1/2`) e uno sfondo di tipo `DARK_MATTER`.
3. **Lettura** — un evento per volta. Il passaggio da un evento all'altro non e' uno
   scorrimento libero: la rotella e' catturata e ridotta a un passo secco
   (`Math.sign(-e.deltaY)`), le frecce e PageUp/PageDown fanno un passo, e c'e' un
   trascinamento verticale con `dragResistance: 0.6`. Ogni volta il testo entra con due
   animazioni dedicate (`MaskTextAnimation`, `BlurredTextAnimation`: il testo si mette a fuoco
   da sfocato) e lo sfondo cambia con una delle transizioni `FADE`, `RIPPLE`, `RIPPLE_UP`,
   `RIPPLE_DOWN`, `RIPPLE_DARK`. Fra un blocco e l'altro entrano **sei "interludi" sonori**
   (`Dark_interlude1..6_v301`).
4. **Deviazione** — clicchi un nome dentro il paragrafo e sei su un'altra linea temporale.
   Media di 3,3 link per scheda: si esce di rado da un testo senza cliccare.
5. **Muro** — fine di quello che ti spetta, e l'offerta di alzare il limite.
6. **Sblocco** — se hai finito le linee di Jonas, The Stranger, Adam o Martha
   (`unlockableCProfiles = ["C01","C02","C03","C40"]`) e le condizioni sono soddisfatte, il
   sito **carica un terzo albero** ("The Original World") e ti sposta d'ufficio su
   `/family-tree` con `hasUnlockedCWorld = true`. Un mondo intero come ricompensa.

## Animazioni

| elemento | cosa si muove | legato a cosa | curva / inerzia | note |
|---|---|---|---|---|
| Nodo dell'infinito del preloader | Tratto SVG che si disegna | avanzamento del caricamento | `stroke-dasharray` su `pathLength=100` | e' nell'HTML, gira prima del JavaScript; poi viene **spostato** nel DOM senza ripartire |
| Logo DARK d'ingresso | Animazione vettoriale | tempo, avviata dal controller | — | **lottie-web**, renderer `svg`, `autoplay:false` |
| Testi di ogni evento | Entrata a maschera e **da sfocato a nitido** | cambio di evento | GSAP | componenti `MaskTextAnimation`, `BlurredTextAnimation`; classi `.split-word`, `.char-wrapper` (testo spezzato per parola/carattere) |
| Sfondo fra un evento e l'altro | Dissolvenza o **increspatura** | cambio di evento | shader | enum verificato: `FADE`, `RIPPLE`, `RIPPLE_UP`, `RIPPLE_DOWN`, `RIPPLE_DARK`; suoni `Dark_ripple1/2` |
| Ritratti dell'albero | Deformazione sotto il puntatore, illuminazione al passaggio | posizione del mouse | uniform di shader | uniform veri nel bundle: `_MouseDistortAmp`, `_MouseDistortRadius`, `_MouseOver`, `_MouseOverDepth`, `_FresnelAmount` |
| Piano dell'albero | Trascinamento e zoom | gesto | inerzia propria del motore WebGL | rotella catturata sul canvas, `Math.sign(-deltaY)` |
| Avanzamento linea temporale | Passo secco fra eventi | rotella / frecce / trascinamento | `gsap.to(this, {scrollProgress, ease: easeOut, duration: 0.6})` | **il passo e' discreto, non continuo**: mai mezzo evento |
| Manopola degli episodi | Trascinamento orizzontale con aggancio | gesto | **GSAP Draggable** (`dragResistance: 0.6`) | `dragger.kill()` alla distruzione |
| Freccia su/giu' | La freccia si **trasforma** da giu' a su | stato | `morphSVG`, `duration: 0.6`, `ease: easeInOut` | **MorphSVGPlugin** di GSAP; i due tracciati sono nel codice: `M.71 1.41l10 10 10-10` ↔ `M.71 11.41l10-10 10 10` |
| Immagini "mirror" | Due o tre ritratti specchiati che diventano lo stesso evento | stato del filtro anti-spoiler | shader (`_FlipX`, `_Mask`, `_Fade`) | 48 immagini su 876 |
| Valori interni del WebGL | Interpolazioni | tempo | ease scritta a mano: `smoothStep01` + `lerp` | non usano GSAP per i valori della scena |
| Pulsante mute | Linea che pulsa | stato | CSS | classe `.pulse` |
| Elenchi lunghi | I bordi sfumano | scorrimento interno | `mask-image: linear-gradient(rgba(0,0,0,.15), #000 133px)` | usato su episodi e testi legali |

Nessuna traccia di ScrollTrigger, Lenis, Locomotive o simili: **non c'e' scorrimento di
pagina da agganciare**. Nessun three.js: il motore 3D e' **scritto in casa** (vedi Stack).

## Colori

Il sito ha **tre colori in tutto**. Nel CSS di 45 KB ci sono esattamente 36 valori esadecimali:
20 volte `#fff`, 12 volte `#000`, 4 volte `#080808`. Nessun accento cromatico, mai.

| ruolo | esadecimale | dove si usa |
|---|---|---|
| Fondo | `#080808` | `html { background }` (anche inline nell'HTML, prima del CSS); fondo del pannello di navigazione; fondo del messaggio di rotazione schermo |
| Testo di base | `hsla(0,0%,100%,.8)` = `rgba(255,255,255,.8)` | colore ereditato da `html`: **il bianco pieno non e' quasi mai usato per il testo**, e' sempre all'80% |
| Bianco pieno | `#ffffff` | tratto del logo/preloader, icone, bordi attivi, stati |
| Nero | `#000000` | maschere a sfumatura, sovrapposizioni |
| Velo sui contenuti | `rgba(0,0,0,.5)` | maschere degli indicatori di scorrimento, pannello di debug |
| Velo sul piano WebGL | `rgba(8,8,8,.5)` | classe `.mask`, il velo che scurisce il piano quando si apre qualcosa sopra |
| Sfumatura dei bordi degli elenchi | `rgba(0,0,0,.15)` | `mask-image` di episodi e pagine di testo |
| Trasparenza | `#080808` con `fill-opacity: .5` | `.active-element` (l'elemento selezionato nel SVG) |

Tutto il resto del colore lo mettono **le fotografie della serie**, che sono desaturate e
verde-blu di loro. Esiste anche un tipo di sfondo `STATIC_BLACK_AND_WHITE`: in alcuni stati
le immagini vengono portate in bianco e nero via shader (uniform `_BlackWhite`).

## Tipografia

Un solo carattere, un solo peso quasi ovunque (**300, Light**), tutto **maiuscolo** per titoli
ed etichette, e **spaziatura fra le lettere enorme** — fino a `0.4em`. E' la firma grafica
della serie tradotta in CSS.

Base: `html { font-size: 10px }`, quindi `1rem = 10px` e tutte le misure in `em` sono relative
al corpo del blocco.

| livello | famiglia | peso | corpo (600px → 1920px) | interlinea | spaziatura | note |
|---|---|---|---|---|---|---|
| `label-xxl` | Open Sans | 300 | **20px → 60px** | 1 | `.3em` | il numero/etichetta piu' grande |
| `heading-l` | Open Sans | 300 | 23,3px → 35px | 1,357em | `.3em` | maiuscolo |
| `heading-s` | Open Sans | 300 | 13,3px → 35px | 1,428em | `.1em` | maiuscolo, l'escursione piu' larga |
| `heading-m` | Open Sans | 300 | 11,7px → 17,5px | — | `.2em` | non maiuscolo |
| `label-xl` | Open Sans | 300 | 16,7px → 25px | 1 | `.3em` | maiuscolo |
| `label-l` | Open Sans | 300 | 13,3px → 20px | 1 | **`.4em`** | le voci di menu |
| `label-m` | Open Sans | 300 | 10px → 16px | 1,667em | `.3em` | maiuscolo |
| `label-xs` | Open Sans | 300 | 6,7px → 11px | — | `.1em` | note di piede |
| `prefix-heading` | Open Sans | 300 | 8,3px → 13px | 2,46em | `.2em` | il "SEASON 1 EPISODE 4" sopra il titolo |
| `copy-l` | Open Sans | 300/400 | 13,3px → 24px | 1,625em | `.08em` | testo lungo |
| `copy-m` | Open Sans | 300/400 | 11,7px → 18px | 1,571em | `.08em` | **giustificato con `hyphens: auto`** |
| `copy-s` | Open Sans | 300/400 | 10px → 15px | 1,5em | `.1em` | — |
| suggerimento di scorrimento | Open Sans | 300 | 6,7px → 10px | — | — | il piu' piccolo del sito |

**Come sono serviti i font**: da Google Fonts, con una sola riga di `@import` dentro
`app.css`, non da un `<link>` nell'HTML:
`https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400&family=Tajawal:wght@300&display=swap`.
Due pesi soli (300 e 400), `display=swap`. **Tajawal 300** e' la sostituzione per l'arabo
(`font-family: Tajawal, Arial` sotto `.locale-ar`), con regole `[dir=rtl]` in tutto il foglio.
Non c'e' nessun font variabile, e — nonostante l'archivio 2020 mostri dei file
`NetflixSans_W_*.woff2` sul vecchio dominio — **il CSS del sito premiato non li dichiara**:
non compare nemmeno una regola `@font-face`. Il sito di Netflix non usa il font di Netflix.

**Scala fluida**, verificata: ogni livello e' una `calc()` a tre stadi —
`font-size: Xpx` fino a 600px di viewport, poi
`calc(Xpx + delta*(100vw - 600px)/1320)` fra 600 e 1920, poi bloccata al valore massimo oltre
1920px. Niente `clamp()`, niente unita' `vw` nude: interpolazione a mano.

## Testi veri

Meta e condivisione:

- `<title>`: `DARK | The Official Guide | NETFLIX`
- `description`: `Discover how everything is the same, but different.`
- `og:title` / `twitter:title`: `THE END IS THE BEGINNING`
- `application-name`: `netflix-dark`

Il patto d'ingresso:

- `Select season and episode for a spoiler free experience`
- `Season` / `Episode` / `Continue` / `Save & Continue`
- `Include more episodes?`

L'albero:

- `Explore the family tree using your mouse or trackpad`
- `Explore the family tree using finger gestures`

La linea temporale:

- `Season {seasonId} Episode {episodeId}`
- `End of season {seasonId} Episode {episodeId}`
- `The end is the beginning`
- Nomi dei mondi: `Adam's World` (A), `Eva's World` (B), `The Original World` (C)

Menu e piede:

- `Who` · `What` · `When` · `Families` · `Language` · `Episodes` · `Share`
- `Join the Conversation`
- `Privacy & Terms` · `Imprint` · `No results`
- `© {year} NETFLIX ALL RIGHTS RESERVED`
- Condivisione: `Facebook` · `Twitter` · `Whatsapp` · `Copy link` → `Link copied!`

Cookie:

- `Netflix uses cookies for the website to function and to collect information about your
  browsing activities which we use to analyse your use of the website.` + `Accept` / `Reject`

Un contenuto vero, per far vedere com'e' scritto un evento (le graffe sono i link interni):

> **Michael Kahnwald** — "On June 21st, {2019:T05}, artist Michael Kahnwald hangs himself in
> the attic of his {home:O27}. He is survived by his wife {Hannah:C05} and son {Jonas:C01}.
> Jonas struggles in the aftermath of his father's suicide and is admitted to a psychiatric
> ward for several months."

> **Torben Wöller** — "Few know his first name, most just call him Wöller. You can't miss the
> detective's injury to his `<<right eye:C34E0>>` — what happened?"

E il conto alla rovescia pre-lancio: `THE END IS THE BEGINNING` /
`Discover how everything is the same, but different.` / data `2020-06-27`.

## Mobile

Questa e' la sezione in cui il sito si comporta meglio della media: **non taglia, sostituisce**.

**Cosa viene SOSTITUITO**

- **Le fotografie sono altre foto, non le stesse rimpicciolite.** Sotto i 768px il codice
  sostituisce il segnaposto `{deviceState}/` con `mobile/`; sopra, con niente. Misurato:
  `image/event/C01E0.jpg` = **2048 x 1152** (139 KB), `image/event/mobile/C01E0.jpg` =
  **886 x 1024** (87 KB). Da orizzontale a **verticale**: e' una ri-inquadratura, cioe' vera
  direzione artistica, non `srcset`.
- **Il formato dei file cambia in base al browser**: `.jpg`/`.png` per Safari e iOS, `.webp`
  per tutti gli altri (`o.a.safari || o.a.ios ? n : n.replace(".jpg",".webp")`). Nel 2020 era
  la scelta giusta; oggi e' un ramo morto che penalizza Safari (108 KB contro 139 KB sulla
  stessa immagine).
- **Il testo di aiuto cambia**: "using your mouse or trackpad" diventa "using finger gestures".
- **La sovrapposizione delle texture nel WebGL cambia**: `0.025/aspect` sotto i 768px contro
  `0.2/aspect` sopra — cioe' le immagini si sovrappongono otto volte meno sul telefono.
- **Il pannello di navigazione** e' largo `max-width: 56.4rem` (564px) su schermo grande e
  `width: 100%` sul telefono: da cassetto laterale a schermata intera.

**Cosa RESTA**

- **L'albero genealogico in WebGL resta**, con i gesti a dita al posto del mouse (Hammer.js
  nel bundle). Non c'e' una versione a elenco di riserva: e' la scelta coraggiosa del progetto.
- Tutta la scala tipografica resta, semplicemente rimpicciolita dalla `calc()` (i valori
  minimi valgono a 600px di viewport).
- Il suono resta acceso.

**Cosa SPARISCE / si blocca**

- **L'orientamento orizzontale e' vietato sui telefoni bassi**: se l'orientamento e' landscape
  **e** `window.innerHeight < 536`, entra il componente `OrientationMessage`, un pannello
  `position: fixed` a tutto schermo su `#080808` che copre tutto finche' non raddrizzi il
  telefono. Il testo non e' nel file di lingua: e' probabilmente solo un'icona.
- L'intestazione smette di seguire lo scorrimento sotto i 768px:
  `gsap.set(header, { y: deviceState >= MEDIUM ? scroll.y : 0 })`.
- `user-scalable=no, maximum-scale=1` nel viewport: **lo zoom a due dita e' disabilitato**
  (necessario per i gesti sul piano, ma e' un problema di accessibilita').

Punti di rottura dichiarati nel codice: `XSMALL ≤479px`, `SMALL ≥480px`, `MEDIUM ≥768px`,
`LARGE ≥1024px`, `XLARGE ≥1440px`, piu' un `SMALL_MIN_HEIGHT ≥680px`. Nel CSS pero' le
soglie che contano davvero sono altre due: **600px e 1920px**, gli estremi della scala
tipografica fluida.

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| Framework | **Vue 2.6.11** + **Vuex** + **vue-router** + **vue-i18n** | VERIFICATO | stringa `"2.6.11"` in `vendors.js`; nomi di componenti Vue in chiaro nel bundle (`name:"HomePage"`, ecc.); `vuex` 8 occorrenze; funzioni `_withStripped` dei template compilati |
| Costruzione | **webpack 4** (chunk numerati `js/<n>.js`, `webpackJsonp`) | VERIFICATO | `r.src = o.p + "version/1653376168543/js/" + e + ".js"` |
| Persistenza stato | vuex + `localStorage`, ridotto al solo ramo `user` | VERIFICATO | `{storage: localStorage, reducer: e => ({user: e.user})}` |
| Animazione | **GSAP 3.2.6 / 3.3.0** + **Draggable** + **MorphSVGPlugin** | VERIFICATO | versioni nel bundle; `morphSVG:` con i due tracciati; `create(dragProxy, {type:"y", dragResistance:.6})` |
| Scorrimento | **nessuna libreria**: `overflow:hidden` sul body, rotella catturata a mano sul canvas | VERIFICATO | `body,html{...overflow:hidden}`; `addEventListener("wheel", ...)` con `Math.sign(-deltaY)` |
| 3D / WebGL | **motore scritto in casa**, WebGL1 con estensioni (`OES_`, `EXT_`, `ANGLE_`), una chiamata `drawArraysInstanced`, shader GLSL inline | VERIFICATO | **nessuna traccia di three.js** (nessun `THREE.`, nessun `REVISION`); uniform con nomenclatura propria: `_ViewProjection`, `_Ripple`, `_Disintegration`, `_MouseDistortRadius`, `_Fresnel`, `_PointSize`, `_GridVisible` |
| Gesti tattili | **Hammer.js 2.0.7** | VERIFICATO | `VERSION="2.0.7"` + riferimenti `hammer.input` |
| Audio | **Howler.js** | VERIFICATO | `window.Howl`, `HowlerGlobal`; 4 canali dichiarati: `ui`, `effects`, `interludes`, `atmosphere`; formati `mp3` e `ogg` |
| Animazione vettoriale | **lottie-web** (renderer `svg`) | VERIFICATO | `loadAnimation({renderer:"svg", loop, autoplay:false})`; `lottie/logo_dark_intro.json` |
| Ricerca | **match-sorter** (soglia `rankings.CONTAINS`) | VERIFICATO | `Object(o.a)(items, search, {keys:["searchName"], threshold: o.a.rankings.CONTAINS})`, con debounce di 300 ms |
| Grafici / geometria | un modulo **d3** (7 occorrenze) | SUPPOSTO | non sono riuscito a isolare quale sotto-pacchetto; il layout dell'albero **non** e' calcolato a runtime (vedi sotto) |
| CMS / dati | **nessun CMS in linea**: i contenuti sono file statici. I dati narrativi (166 entita', 134 linee temporali, 836 eventi) sono **compilati dentro `app.js`** come `JSON.parse('...')`; i testi sono chunk di lingua separati; i layout dell'albero sono 19 file JSON statici | VERIFICATO | estratti e contati uno per uno |
| Hosting | **nginx/1.18.0** su `dark.netflix.io`; il vecchio `darknetflix.io` era su **CloudFront** (AWS, IP e AAAA `2600:1f18:...`) | VERIFICATO | intestazioni HTTP |
| Rendering server | **nessuno**: tutte le rotte restituiscono lo stesso guscio di 5,3 KB | VERIFICATO | `/en`, `/en/family-tree`, `/en/event-timeline/jonas-kahnwald` → stesso HTML |
| Versionamento risorse | cartella `/version/<timestamp>/` + sottocartella `static/` | VERIFICATO | `<base href="https://dark.netflix.io//version/1653376168543/">` (con il doppio slash, che e' un difetto) |
| Analytics | **Google Tag Manager** `GTM-NQ2BBV3`, con `<noscript>` iframe | VERIFICATO | nell'HTML |
| Immagini | jpg/png con gemello **webp**, due tagli d'arte (desktop e mobile), texture portate a **potenza di due** per il WebGL | VERIFICATO | `makePowerOfTwo(...)`, `nextPowerOfTwo` |

**La scelta tecnica piu' interessante**: il layout dell'albero genealogico **non e' calcolato
dal browser**. I 19 file `family-tree/S*.json` contengono gia' le coordinate assolute:
`lines` e' un elenco di segmenti `[x1,y1,x2,y2]` e `objects` e' un elenco di rettangoli con
tipo (`picture`, `labelleft`, `labelright`, `star`, `logo`) e `id` (`C06_TEXT_LEFT`). Il grafo
e' stato **composto a monte** — probabilmente da un designer, o da uno script eseguito una
volta sola — e il sito si limita a disegnarlo. E' la differenza fra un diagramma che "viene
come viene" e uno leggibile.

## Peso e prestazioni

Misurato con `curl` sul sito vivo il 13/08/2026 (**non con Lighthouse**: l'API PageSpeed ha
risposto `429 quota exceeded`).

| risorsa | non compresso | trasferito (gzip) |
|---|---|---|
| HTML | 5,3 KB | 5,3 KB |
| `css/app.css` | 45,0 KB | **45,0 KB — non compresso dal server** |
| `js/vendors.js` | 985,8 KB | 300,5 KB |
| `js/app.js` | 853,9 KB | 160,9 KB |
| chunk lingua (`js/2.js`, inglese) | 258,0 KB | 80,6 KB |
| `lottie/logo_dark_intro.json` | 39,0 KB | (non misurato) |
| **totale percorso critico** | **~2,19 MB** | **~592 KB** |

Poi, a richiesta:

- Layout dell'albero: da **3,9 KB** (`S1E1.json`) a **18,7 KB** (`S3E8.json`); terzo mondo 6,7 KB.
- Ritratto dell'albero: 250x330, **21,4 KB** jpg / **18,6 KB** webp. Con 79 ritratti nell'albero
  completo si arriva a circa **1,5 MB di soli volti**.
- Immagine di un evento: 2048x1152, **139,5 KB** jpg / **107,2 KB** webp; versione telefono
  886x1024, **87,6 KB**.
- Immagine di sfondo di un pannello: `bg-share.jpg` **360,6 KB** (la piu' pesante trovata).

**Osservazioni oneste**: 592 KB compressi prima di poter fare qualunque cosa sono tanti,
e il chunk della lingua da 80 KB e' il prezzo di aver messo 707 schede di testo in un unico
file. Ma il progetto se lo puo' permettere perche' **ha un preloader onesto che dura**, e
perche' dopo quel costo il sito e' un'applicazione che non ricarica piu' niente. Il difetto
vero e' il CSS non compresso (45 KB che potevano essere 8) e il doppio slash nel `<base>`.

**SEO: zero.** Nessun `robots.txt`, nessuna sitemap, nessun rendering server, un solo
`<title>` per tutte le rotte, 707 schede invisibili. Per un sito di contenuto e' la scelta
piu' discutibile del progetto — a meno che la volonta' fosse proprio **non far trovare la
guida a chi cerca "cosa succede in Dark"**, cioe' proteggere gli spoiler anche da Google. In
quel caso e' coerente.

## Tre cose da rubare

1. **Chiedere al visitatore quanto sa, e potare tutto il sito su quella risposta.**
   La meccanica e' semplice e non richiede WebGL: un oggetto `{stagione, episodio}` in
   `localStorage`, un campo `season`/`episode` su ogni contenuto, un filtro
   `getFilteredItems({spoilerFilter})` e una guardia di rotta che rimanda alla home chi prova
   a saltare avanti. Si trasferisce di peso a un catalogo B2B (*a che punto sei del progetto:
   valuti, confronti, hai gia' comprato?*), a una documentazione (*principiante / esperto*),
   a un e-commerce con configuratore. Il guadagno non e' tecnico: **e' che il visitatore ha
   dichiarato qualcosa di se', e da quel momento il sito e' "il suo"**. E ogni volta che
   sbatte contro il confine, il sito ha un motivo legittimo per chiedergli di crescere.

2. **Scrivere i contenuti gia' con i link dentro, con una sintassi propria.**
   Qui e' `{Hannah:C05}` per un rimando interno e `<<right eye:C34E0>>` per una zona speciale;
   il componente li trasforma in link veri e registra i propri `disposableLinks`. Risultato:
   **2.319 collegamenti su 707 testi, 3,3 per scheda, senza che nessuno abbia mai scritto un
   `<a href>`**. Chi scrive pensa alla storia, non all'HTML; e il giorno che cambia lo slug di
   un personaggio non si rompe niente, perche' il legame e' su un identificativo (`C05`) e non
   su un indirizzo. Rifacibile in mezza giornata con una `String.replace` e un componente.

3. **Precalcolare il diagramma invece di lasciarlo calcolare al browser.**
   L'albero non e' un force-directed che si assesta a schermo: sono file JSON con coordinate
   assolute e segmenti ortogonali gia' decisi (`lines: [[-478,-1049,-400,-1049], ...]`), uno
   per ogni stato di avanzamento. Costa lavoro a monte, ma da' tre cose che un layout
   automatico non da' mai: **e' leggibile** (l'ha composto un occhio umano), **e' identico per
   tutti** (quindi si puo' condividere, descrivere, ricordare) e **non costa niente da
   disegnare** (nessun assestamento, nessun jitter, apre gia' fermo). Vale per organigrammi,
   mappe di prodotto, schemi di processo: **il diagramma bello si disegna, non si calcola.**

*Bonus, gratis*: il preloader e' un elemento SVG **unico**, dichiarato nell'HTML prima di ogni
script, che i componenti Vue si passano con `appendChild` invece di ricrearlo. L'animazione
non riparte mai da capo in tutta la sequenza di avvio. Costa tre righe.

## Non verificato

- **"Site of the Year 2020"**: sulla scheda Awwwards del sito risultano **solo** Site of the
  Day (3/11/2020) e Developer Award. Non ho trovato conferma del titolo annuale: la pagina
  `awwwards.com/annual-awards-2020/site-of-the-year` risponde 404, e **il budget di ricerca
  web di questa sessione era esaurito** (200/200 chiamate), quindi non ho potuto cercare
  altrove. Da riverificare.
- **Tutto l'aspetto visivo eseguito**: non ho aperto nessun browser (regola del compito).
  Colori, corpi, spaziature e sequenze sono letti dal CSS e dal codice, quindi sono esatti,
  ma **non ho visto una sola schermata**. Composizione a schermo, densita' percepita,
  fluidita' reale dell'albero: non verificati.
- **Punteggi Lighthouse, tempi reali (FCP, LCP, TBT), numero di richieste di una visita
  completa**: l'API PageSpeed ha risposto `429 quota exceeded`. Nessun numero di runtime.
- **Il case study di Monks**: non esiste piu' su `monks.com` (l'elenco lavori odierno non
  contiene DARK). Non ho quindi ne' il brief, ne' i crediti nominali, ne' risultati dichiarati
  (visite, tempo sulla pagina, iscrizioni).
- **Il ruolo esatto di HAS.WORKS** rispetto a Monks (chi ha fatto il design, chi lo sviluppo):
  non documentato in nessuna fonte raggiunta.
- **Quale modulo d3** sia effettivamente usato, e per cosa (il layout dell'albero e'
  precalcolato, quindi non serve a quello).
- **Il testo del messaggio di rotazione dello schermo**: il componente esiste, ma non c'e'
  nessuna chiave corrispondente nel file di lingua. Probabilmente e' solo un'icona.
- **Le condizioni esatte di sblocco del terzo mondo (C)**: so quali profili lo abilitano
  (`C01`, `C02`, `C03`, `C40` = Jonas, The Stranger, Adam, Martha) e che serve `spoilerFilter`
  a fine serie, ma la condizione completa e' sparsa in piu' punti del bundle minificato.
- **Se nel 2020 esistessero anche italiano e rumeno**: nell'archivio del vecchio dominio
  compaiono le bandierine `it-it.svg` e `ro.svg`, ma il build attuale dichiara 8 lingue e
  nessuna delle due. Non so se siano state tolte o mai attivate.
- **Il conto alla rovescia pre-lancio**: la rotta `countdown` e le stringhe `prelaunch`
  esistono nel codice, ma non ho una cattura di come si presentasse prima del 27/06/2020.
