# Umami Land

- **URL**: `https://umamiland.withgoogle.com/en` — **il sito NON esiste piu'**.
  Oggi il dominio risponde `HTTP/1.1 301 Moved Permanently` con
  `location: https://www.google.com/` (verificato con `curl -I` il 13/08/2026;
  header `server: Google Frontend`). Tutto quello che c'e' in questa scheda e'
  **ricostruito da Internet Archive**, non da una visita al sito vivo.
  - Guscio HTML letto da:
    `https://web.archive.org/web/20201217071906id_/https://umamiland.withgoogle.com/en`
  - Bundle e asset letti dalla build `1626783469807`, snapshot del 22/07/2021:
    `.../version/1626783469807/js/app.js`, `js/vendors.js`, `css/app.css`,
    `js/0.js`–`js/3.js` (i quattro file di lingua), le scene WebGL e le
    facce delle cubemap.
  - Elenco completo degli asset archiviati ottenuto dalla CDX API:
    `http://web.archive.org/cdx/search/cdx?url=umamiland.withgoogle.com*` — 453
    URL unici.
- **Premio**: **Awwwards Site of the Day del 1 febbraio 2021**, voto **8.23/10**
  (design 8.49, usabilita' 7.58, creativita' 8.75, contenuto 8.10; Developer
  Award 7.95). Fonte: https://www.awwwards.com/sites/umami-land
  - **Correzione al brief**: nella pagina Awwwards **non compare nessun "Site of
    the Year 2021"**, ne' Site of the Month, ne' Honorable Mention. C'e' solo il
    badge SOTD. Non ho potuto controllare altri albi d'oro (il budget di ricerca
    web della sessione era esaurito): che abbia vinto un Site of the Year e'
    `non verificato` e, per quanto vedo, **probabilmente falso**.
- **Studio**: **Monks** (l'ex MediaMonks; su Awwwards il profilo si chiama
  "Monks", PRO). Cliente: **Google** (il progetto sta su `withgoogle.com`, usa
  Google Sans, il logo Google in alto a sinistra e manda tutte le uscite su
  google.com). L'elenco nominale dei crediti e' `non verificato`: sul sito
  monks.com oggi non esiste una pagina di caso per Umami Land.
- **Anno**: **dicembre 2020** per la messa online. La prima build archiviata e'
  `1608117349803` = 16/12/2020; l'ultima e' `1626783469807` = 20/07/2021.
  Il premio arriva il 1/2/2021.
- **Letto il**: 13/08/2026
- **Come l'ho letto**: solo `curl`, WebFetch e lettura a mano dei file. Nessuna
  scheda di browser aperta. Ho scaricato e decompresso `app.js` (783.481 byte in
  chiaro), `vendors.js` (988.976), `app.css` (81.475), i quattro file di lingua,
  la scena `MainRiceStreet.json` (1.783.769 byte in chiaro) e cinque facce di
  cubemap, che ho convertito e **guardato**. In piu' ho estratto i fotogrammi
  dai due video di anteprima di Awwwards con `ffmpeg`
  (`assets.awwwards.com/awards/external/2021/01/601058505f6c3154881504.mp4`,
  18,7 s, e `...601268c348c9b848625277.mp4`, 14 s) per vedere l'interfaccia in
  movimento.

---

## Cosa tratta il sito

Un **parco divertimenti virtuale fatto di cibo giapponese**, in prima persona,
dentro cinque "mondi" a 360 gradi che si visitano trascinando il mouse.

Non c'e' una sola fotografia di cibo. Il cibo **e' il paesaggio**: le colline
sono onigiri alti come montagne, il terreno e' chicchi di riso, le scogliere
sono fette di sashimi, le lanterne di una sagra notturna sono gyoza con la
faccia, il cielo e' attraversato da ciotole di ramen che volano come dirigibili.
Dentro ogni mondo sono piantati dei **pallini blu con la lente d'ingrandimento**
di Google: sono i piatti. Cliccandone uno si apre una scheda con nome,
descrizione e due pulsanti che portano su Google.

Il contenuto vero e proprio, in numeri (letti nella configurazione dentro
`app.js`):

- **5 mondi**: `Main Rice Street`, `Long Valley`, `Sizzle Yokocho`,
  `Savory Bay`, `Sweet Kingdom`.
- **31 piatti** con scheda: 10 a Main Rice Street, 5 a Savory Bay, 5 a Sweet
  Kingdom, 6 a Sizzle Yokocho, 5 a Long Valley.
- **5 distintivi** da conquistare, uno per mondo, ognuno intitolato a un
  ingrediente umami: `Miso`, `Katsuobushi`, `Meat`, `Green Tea `, `Soy sauce`.
- **1 negozio di regali** con tre articoli comprabili con i distintivi.
- **1 personaggio guida**: Omusubi, una polpetta di riso con il grembiule di
  alga, animata in 3D, che ti segue e ti parla.
- **4 lingue**: inglese, spagnolo, coreano, cinese (`/en`, `/es`, `/ko`, `/cn`).

## Cosa vende, e qual e' l'obiettivo finale

**Non vende niente.** Non c'e' carrello, non c'e' prezzo, non c'e' modulo di
contatto, non c'e' newsletter. Verificato: nel codice non esiste nessuna
chiamata a un backend di commercio, e le uniche URL esterne in `app.js` sono
Facebook, Twitter, Line, un canale Giphy (`giphy.com/channel/umamiland`),
Shadertoy (in un commento dentro uno shader) e **google.com**.

L'obiettivo dichiarato sta nel sommario di Awwwards e nel testo dello splash:
intrattenere e informare in una fase in cui i ristoranti erano chiusi. Testuale
dal file di lingua: *"Enjoy your virtual food trip and go out only once it's
safe!"*.

**L'obiettivo vero e' far fare ricerche su Google**, ed e' scritto nel codice
in modo che non si puo' equivocare. Ogni scheda piatto ha esattamente due
uscite, ed entrambe sono ricerche Google gia' scritte:

- `LEARN MORE` → `https://www.google.com/search?q=what+is+onigiri`
- `NEAR ME` → `https://www.google.com/search?q=onigiri+near+me`

E i cinque eventi che l'applicazione manda a `gtag` sono:
`click_hotspot`, `learnmore`, `nearme`, `badge_unlocked`, `umami_unlocked`.
Due dei cinque sono click in uscita verso la Ricerca. `nearme` in particolare e'
un'intenzione locale: e' la query che vale di piu' per Google Maps e per gli
inserzionisti.

Quindi la catena e': *ti faccio venire fame di una cosa che non conosci* →
*ti do il nome esatto della cosa* → *ti metto sotto il pollice un "near me"
gia' compilato*. Il parco divertimenti e' l'esca per un'abitudine di ricerca.

Il terzo obiettivo, non dichiarato ma evidente, e' **la reputazione tecnica**:
un WebGL da premio con il logo Google in alto a sinistra e' un pezzo di
comunicazione verso l'industria. Il premio Awwwards e' arrivato in otto
settimane.

## A chi

Al pubblico generalista curioso di cibo, non all'appassionato. Si vede da tre
cose:

- Le descrizioni spiegano **da zero**: *"Three words: Deep-fried tofu."*,
  *"Panfried, meat-filled dumplings, eaten while still piping hot."* Nessun
  termine tecnico, nessuna regione, nessun nome di chef.
- Le sfide sono facilissime (*"trova i 2 piatti che non sono pesce"*).
- Il tono e' da cartone animato: *"Nom nom nom."*, *"Now we feast."*

Cosa sa gia': che il sushi e il ramen esistono. Cosa non sa: che esistono
tsukemen, hiyayakko, kakigoori, TKG. **Il valore percepito e' proprio quel
salto**: entri sapendo tre parole, esci sapendone trentuno.

Cosa teme: annoiarsi, e — nel gennaio 2021 — uscire di casa. Il sito disinnesca
entrambe le paure: la seconda in modo esplicito nel testo dello splash, la
prima con il conteggio dei distintivi.

Deve uscire pensando: *la cucina giapponese e' molto piu' grande di quello che
credevo, e ho una lista di cose da provare appena riapre*.

## L'esperienza progettata

E' **una caccia al tesoro in prima persona**, non un racconto e non una vetrina.
Il verbo dominante non e' "scorrere" ma **"guardarsi intorno"**: lo scroll non
esiste, la pagina non e' alta, il mondo e' una sfera e tu sei al centro.

Cosa fa il visitatore, passo per passo:

1. **Aspetta** il caricamento guardando una barra di ricerca disegnata che si
   riempie di tagliatelle (animazione Lottie `preloader-noodles.json` +
   `preloader-searchbar-landscape.json`).
2. **Clicca `Start`** — un gesto necessario anche per sbloccare l'audio.
3. **Ascolta Omusubi** che gli spiega le regole in due fumetti.
4. **Trascina** per girarsi. Il primo messaggio e' letteralmente
   *"Drag to look around and... ooh sushi!"*: la prima istruzione e' insieme la
   prima ricompensa.
5. **Cerca i pallini blu** con la lente. Ce ne sono da 5 a 10 per mondo, e
   alcuni sono nascosti dietro di te o in alto.
6. **Clicca un pallino** → si apre una **barra di ricerca Google al centro dello
   schermo con il nome del piatto gia' scritto dentro** e una barra di
   caricamento blu che corre sul bordo → poi la scheda del piatto.
7. **Legge due righe**, e sceglie: chiudere, `LEARN MORE`, `NEAR ME`, oppure
   mettere il piatto tra i preferiti (icona segnalibro).
8. **Completa la sfida del mondo** (es. *"Find the 3 dishes that are cooked on
   a griddle"*), riceve coriandoli, il pannello "You've found it!" e il
   distintivo dell'ingrediente.
9. **Clicca il pannello blu** che indica il sentiero dorato e **attraversa un
   tunnel** per andare nel mondo successivo.
10. Con tutti e 5 i distintivi **sblocca l'UMAMI**, torna a Main Rice Street con
    una festa, e puo' spendere i distintivi nel negozio di regali.

Il ritmo e' **a scatti brevi**: 20–40 secondi per mondo se corri, 3–4 minuti se
cerchi davvero tutti i piatti. Non c'e' nessun momento lungo di sola
contemplazione: ogni 10 secondi succede qualcosa (Omusubi parla, un piatto si
apre, il contatore in alto a destra sale).

L'immagine che resta in testa: **una montagna di riso con la porta di una casa
ricavata dentro un onigiri gigante, e una ciotola di miso grande come un lago.**

## Come e' organizzata la persuasione

Non e' una pagina di vendita, quindi la persuasione e' spostata di livello: non
deve farti comprare, deve **farti cliccare su Google**. La struttura e':

- **La promessa** sta nella schermata zero, dentro una barra di ricerca Google
  disegnata: *"Discover the joy of Japanese cuisine"*. La stessa frase e' anche
  il `<title>` e la `og:description`. Costo: 0 schermate.
- **La prova** e' l'immagine stessa. Non c'e' nessuna prova sociale, nessun
  numero, nessuna recensione, nessun logo di partner: la prova che vale e' che
  il mondo e' bello e che scorre a 60 fps.
- **Il prezzo non esiste.** L'unica valuta e' il distintivo, e i prezzi del
  negozio sono in distintivi (letti in `app.js`): `dishes` 2, `wallpaper` 1,
  `stickerPack` 2. Serve solo per creare la sensazione di guadagnarsi qualcosa.
- **La chiamata all'azione** e' minuscola, ripetuta 31 volte e nascosta dentro
  la ricompensa: i due pulsanti tondi `LEARN MORE` e `NEAR ME` in fondo alla
  scheda del piatto. **Non c'e' nessuna CTA nella pagina principale**: l'unico
  modo di arrivarci e' aver trovato un piatto. La CTA e' il premio, non la
  richiesta.
- **La ritenzione** e' gestita con due meccanismi: il conteggio `1/3` sempre
  visibile in alto a destra, e una **finestra di uscita** che compare quando
  provi ad andartene: *"Don't forget to come back, We have a lot to explore!"*
  con `CANCEL` / `OK, GOT IT`. Lo stato e' salvato in `localStorage`
  (`vuex-persist`, chiave `user`), quindi tornando ti dice *"Welcome back!"*.

**Cosa arriva a chi non va fino in fondo.** Qui la domanda cambia forma: non
c'e' scroll, quindi non esiste "il fondo della pagina". Ma esiste una soglia
molto piu' dura: **il pulsante `Start`**. Chi non lo preme ha visto solo il
logo, il paesaggio sfocato dietro e la frase nella barra di ricerca. Chi lo
preme ma abbandona dopo un minuto ha visto un mondo su cinque e forse due
piatti su trentuno.

Il progetto se ne rende conto e mette **tutto il messaggio nell'immagine di
condivisione** (`images/UmamiLand_EN.jpg`, 1280x640): il paesaggio di riso, il
logo, e la barra di ricerca con la frase dentro. Chi vede solo quella su Twitter
ha gia' capito: *Google + Giappone + cibo + parco giochi*. E' l'unico livello di
comunicazione che funziona senza interazione.

## Idea regista

**Il cibo non e' servito in tavola: e' il paesaggio — e per assaggiarlo si usa
la barra di ricerca di Google.**

## Il momento

Ce ne sono due, e sono di natura diversa.

**Il momento di interfaccia** e' il click su un pallino. Non si apre una scheda:
**si apre una barra di ricerca Google al centro dello schermo, con il nome del
piatto gia' digitato dentro** (`Kakigoori`) e una linea blu di caricamento che
corre lungo il bordo superiore del campo. Solo dopo la barra si trasforma nella
scheda bianca. In un colpo solo dice: *il gesto che stai facendo dentro il gioco
e' lo stesso gesto che farai su Google fra dieci secondi*. Verificato al
fotogramma 3,2 s del video `601268c348c9b848625277.mp4`, e nel codice come
`body-moving/searchbar.json` (Lottie).

**Il momento spettacolare** e' **il tunnel**: quando cambi mondo, la camera
entra in un tunnel di foglie verdi (te matcha / alga) con un **sentiero dorato**
sul fondo e una luce bianca in fondo, e ne esce dentro il mondo nuovo. E'
costruito con una singola texture, `webgl/textures/FlowerTunnelCombined.webp`
(523.474 byte, la texture piu' pesante del sito), su una geometria a tubo, con
la camera che passa da `fov 60` a `fov 40` (`tunnelFov`) per stringere il campo
e dare la sensazione di velocita'. Verificato in `app.js` e ai fotogrammi 8–13 s
del video `601058505f6c3154881504.mp4`.

Il terzo, minore ma piu' simpatico: **Omusubi si puo' punzecchiare**. Il codice
lancia un raggio contro una sfera di raggio 1 attorno al personaggio; se ci
clicchi lui **fa un inchino** (`Bow`); se lo fai piu' di 5 volte in 5 secondi
scatta l'evento `STOP_POKING_ME` e lui dice *"That tickles!"*.

## Struttura, sezione per sezione

Attenzione: **non c'e' scroll**. La colonna della durata e' quindi in
click / secondi, non in schermate.

| sezione | cosa mostra | cosa fa l'utente | quanto dura |
|---|---|---|---|
| Preloader | Fondo animato, logo `UMAMI LAND` + `テーマパーク`, una barra di ricerca disegnata che si riempie di tagliatelle, un'icona di cuffie che pulsa (`headphonePulse`) | aspetta | 5–20 s, dipende dalla rete |
| Splash | Paesaggio di riso vivo dietro, barra di ricerca con `Discover the joy of Japanese cuisine`, sotto `Enjoy your virtual food trip and go out only once it's safe!`, pulsante `Start` | clicca `Start` | 1 click |
| Onboarding | Omusubi entra, due fumetti con le regole e le tre icone (lente, piatto, premio), pulsante `OK, GOT IT` | legge, clicca | ~10 s |
| Mondo (x5) | Cubemap a 360 gradi + oggetti animati + pallini-lente. In alto a sx `Google • Main Rice Street`; in alto a dx contatore `0/3` e freccia a scomparsa; in basso a dx due pulsanti tondi blu (Omusubi, bussola); in basso a sx muto | trascina, clicca i pallini | 30 s – 4 min per mondo |
| Barra di ricerca | Campo Google con il nome del piatto scritto dentro e barra di caricamento blu | niente, guarda | ~0,8 s |
| Scheda piatto | Card bianca: a sinistra l'icona del piatto animata (Lottie) in un cerchio colorato, a destra titolo e 2 righe; sotto due pulsanti tondi `LEARN MORE` (lente) e `NEAR ME` (posate); in alto a dx la X; segnalibro per i preferiti | legge, esce su Google o chiude | ~15 s |
| Sfida completata | Coriandoli su tutto lo schermo, pannello `You've found it!` + `You found 1/3 special dishes of the challenge`, `GOT IT` | clicca | ~5 s |
| Distintivo | Mandala animato (`celebration-mandala.json`), `You've unlocked the {world} badge.`, nome e descrizione dell'ingrediente | clicca | ~8 s |
| Quest overview | Pannello che scende dall'alto: nome del mondo, riga di icone-piatto tonde (le trovate a colori, le mancanti in grigio), badge grande con il lucchetto, `You're here`, `Go explore`, puntini di pagina per gli altri mondi | naviga, sceglie il mondo | a richiesta |
| Tunnel | Tunnel di foglie con sentiero dorato | niente | ~2 s |
| Menu | `Overview`, `Gift shop`, `Your favorite dishes`, `Language`, `Quality` (High/Medium/Low), `Privacy`, `Terms & Conditions` | clicca | a richiesta |
| Gift shop | Tre articoli: `Animated Dishes` (2 distintivi), `Best Moment Wallpaper` (1), `Omusubi Sticker Pack` (2). Se non hai abbastanza: *"This item requires more badges. Keep searching for the special dishes!"* | sblocca, scarica | a richiesta |
| Finale UMAMI | Ritorno a Main Rice Street attraverso il tunnel, festa, 5 fumetti che spiegano cosa e' l'umami | legge | ~20 s |
| Finestra di uscita | `Don't forget to come back, We have a lot to explore!` | `CANCEL` / `OK, GOT IT` | 1 click |

## L'esperienza in ordine di tempo

**I primi dieci secondi** (ricostruiti dalla sequenza dei componenti in `app.js`
e dai video di anteprima; i tempi esatti dipendono dalla rete):

- **0,0 s** — Schermo pieno con il fondo del preloader (Lottie
  `preloader-background.json`). Nessun lampo bianco: il fondo e' gia' colorato.
- **0,3 s** — Il logo `UMAMI LAND` entra: le lettere arancioni e blu con il
  bordo bianco spesso, i due bastoncini e le tagliatelle sopra, e sotto
  `テーマパーク` (parco a tema).
- **0,8 s** — Sotto il logo compare una **barra di ricerca disegnata**. Dentro
  ci scorrono le tagliatelle (`preloader-noodles.json`): la barra di
  avanzamento del caricamento e' fatta di ramen. Il ciclo di attesa e' i
  fotogrammi 60–119 dell'animazione, in loop.
- **1,5 s** — Un'icona di cuffie inizia a pulsare in loop: sta dicendo *metti
  le cuffie*, senza scriverlo.
- **Da 2 s a fine caricamento** — solo l'attesa. Il `progress` e' legato al
  caricamento vero degli asset (`appLoadProgress`).
- **Fine caricamento** — Il fondo del preloader si apre, compare il pulsante
  `Start` e, dietro, **il paesaggio 3D gia' vivo** (le ciotole volano, le
  bandiere sventolano): la promessa e' visibile prima di essere accettata.
- **Click su `Start`** — Il preloader esce, parte la musica
  (`music-main-street.ogg`) e l'ambiente (`main-rice-street-ambience.ogg`) con
  una dissolvenza di 3 secondi. Verificato: `this.$soundManager.play(t.music,
  MUSIC, 1, 3, true)`.
- **+1 s** — Omusubi cammina verso di te (`WalkCycleShort`), si ferma, e passa
  allo stato `TALK`.
- **+2 s** — Primo fumetto: *"Welcome to Umami Land!"*.
- **+5 s** — Secondo fumetto, con tre icone dentro il testo:
  *"Find the [lente]. Discover [piatto] to learn about the flavors of Japan.
  Explore more and get a [premio]!"*.

**Poi, a blocchi:**

- **Main Rice Street, il mondo scuola.** Omusubi dice *"Drag to look around
  and... ooh sushi!"*, poi *"Once you've finished exploring... Click the blue
  panel to follow the golden pathways and discover a new place."*, poi *"Now,
  let's eat!"*. E' l'unico mondo con dieci piatti: e' il piu' generoso, perche'
  e' quello dove si decide se resti. Se dopo l'introduzione hai trovato zero
  piatti, il codice ti manda un aiuto automatico:
  `triggerTunnelTutorial(1, 5)` — evidenzia il passaggio.
- **Il ciclo del piatto** si ripete 31 volte identico: pallino → barra di
  ricerca → scheda → chiudi. E' volutamente ripetitivo: e' il gesto che deve
  diventare abitudine.
- **Il ciclo del mondo**: introduzione parlata → sfida dichiarata → caccia →
  coriandoli → distintivo → tunnel. Cinque volte.
- **Il finale**: cinque fumetti che rivelano la parola:
  *"You've just unlocked the secret taste of the park..."*,
  *"UMAMI — the delicious taste of savory goodness!"*,
  *"This taste is at the heart of most Japanese dishes."*,
  *"Now my tastebuds are tingling!"*. Quattro secondi dopo Omusubi aggiunge:
  *"Don't forget to get your reward in the gift shop"*.

## Animazioni

| elemento | cosa si muove | legato a cosa | curva o inerzia | note |
|---|---|---|---|---|
| Camera del mondo | rotazione su se stessa (yaw/pitch), la posizione non cambia mai | trascinamento del mouse / dito | smorzamento con inerzia (`ON_CAMERA_MOVED` / `ON_CAMERA_STOPPED`) | fov 60. Non e' un movimento libero: sei un treppiede al centro di una cubemap |
| Cambio mondo | camera dentro un tubo con texture di foglie e sentiero dorato | click sul pannello blu | fov 60 → 40 durante il passaggio | `FlowerTunnelCombined.webp`, 523 KB, la texture piu' pesante |
| Pallini-lente | pulsano e ruotano leggermente, si ingrandiscono al passaggio del mouse | stato (hover, trovato/non trovato) | `_highlightHotspotsProgress` | texture `hotspot.webp`, 3,6 KB, dimensione `setHotspotSize(0.05)` |
| Apertura scheda | una **macchia bianca disegnata a mano** si espande su un canvas 2D separato e copre lo schermo, poi si ritira | click sul pallino | `smootherstep` | classe interna con l'errore *"Starting new blob animation before the current animation is ended."* — e' una transizione a inchiostro, non una dissolvenza |
| Sfondo durante la scheda | il mondo 3D si oscura e si **sfoca** | apertura di scheda/menu/negozio | `setBlur(...)`, render su render target | il 3D viene messo in pausa (`$webgl.pause(true)`) quando si apre un pannello |
| Icone dei piatti | 31 animazioni disegnate a mano, una per piatto, in cerchi colorati | apertura della scheda | Lottie | `body-moving/dish/icon_*.json` |
| Coriandoli | pioggia di rettangoli nei 4 colori Google | scoperta di un piatto speciale | tempo | in `app.css` la classe `confetti-layer` |
| Distintivo | mandala che si apre a raggiera | sblocco | Lottie `celebration-mandala.json` | |
| Omusubi | ciclo di camminata, inchino, idle, festa; la **faccia e' uno scambio di sprite** guidato da una curva di animazione (`Math.round(50 * x - 5)` sceglie il fotogramma della faccia) | stato + click dell'utente | animazioni scheletriche esportate da Unity | 455 KB di modello. Reagisce al click con un raggio contro una sfera |
| Oggetti del mondo | ciotole donburi che volano, uccelli di alga (`NoriBird`), bandiere, vapore, ruota panoramica, montagne russe di ramen | tempo, in ciclo infinito | animazioni Unity esportate nel JSON di scena | sono **pochi oggetti veri** dentro una scenografia dipinta |
| Faccia dell'omuricetta | `FaceBlink` / `FaceNormal` | tempo | scambio di visibilita' | tutti gli oggetti "vivi" sbattono le palpebre |
| Antialiasing | jitter della camera con sequenza di Halton + accumulo temporale | ogni fotogramma | — | c'e' un vero `_temporalBlur` (TAA). E' quello che permette di renderizzare a pixel ratio 1 su desktop senza scalettature |
| Interfaccia HTML | entrate/uscite dei pannelli, pulsanti, fumetti | stato Vue | GSAP `Power2.easeOut`, durate tipiche 0,4 s | tutto passa da `AbstractTransitionController` di `vue-transition-component` |

Librerie riconosciute dietro gli effetti: **GSAP** (`TweenLite`, `TweenMax`,
`Power2`, `ThrowPropsPlugin`, `Draggable`, `VelocityTracker`) per l'interfaccia;
**Lottie/bodymovin** (renderer SVG) per tutto il disegnato; **Howler.js** per
l'audio; **motore WebGL interno di MediaMonks** (non three.js) per il 3D.

## Il suono — e' meta' del progetto

Vale una sezione a parte perche' e' la voce di costo piu' grossa del sito:
**72 file `.ogg` per 13,94 MB**, cioe' quasi metà del peso totale.

- **6 musiche**: `music-intro`, `music-main-street`, `music-long-valley`,
  `music-savory-bay`, `music-sizzle-yokocho`, `music-sweet-kingdom`. Una per
  mondo, con dissolvenza incrociata di 3 secondi al cambio.
- **4 ambienti**: `ambience-general-park`, `ambience-long-valley`,
  `ambience-savory-bay`, `ambience-sizzle-yokocho`.
- **Suoni piazzati nello spazio 3D**: nel JSON della scena ci sono nodi che si
  chiamano come i file audio (`main-rice-street-miso-soup`,
  `main-rice-street-flying-bowl-a/b/c`, `sizzle-yokocho-grill`,
  `sizzle-yokocho-gyoza`, `long-valley-waterfall`, `savory-bay-pufferfish`...).
  Il motore manda l'evento `SOUND_CAMERA_ORIENTATION` con i vettori `forward` e
  `up` della camera a ogni movimento: **il suono ruota con la testa**. Se senti
  la griglia sfrigolare a destra, ti giri a destra e trovi il piatto.
  **Il suono e' il segnale che guida la caccia**, non un tappeto.
- **21 suoni del personaggio**: `omusubi-tickle-01/02`, `omusubi-whoa-01/02`,
  `omusubi-scratch-01/02`, `omusubi-snoring`, `omusubi-bow`, `omusubi-idle`,
  `omusubi-bubble-sequence-01..04`.
- **25 suoni di interfaccia**: click, hover, apertura menu, `UI-you-found-it`,
  `UI-unlock-gift`, `UI-go-appears`.

L'audio non parte da solo: si accende dopo il click su `Start` (gesto utente).
Il muto e' un pulsante in basso a sinistra ed e' salvato nello stato.

## Colori

Il sito **non ha una palette unica**: ha una palette di interfaccia (Google) e
cinque palette di scena, una per mondo, che occupano il 100% dello schermo.

**Interfaccia** (letti nel CSS e nel JS, quindi esatti):

| ruolo | esadecimale | dove si usa |
|---|---|---|
| Blu principale | `#3771df` | pallini, pulsanti tondi, `Go explore`, distintivi. 34 occorrenze nel CSS: e' *il* colore del sito |
| Blu Google | `#4285f4` | logo e coriandoli |
| Rosso Google | `#ea4335` | coriandoli, icone dei piatti |
| Giallo Google | `#fbbc05` | coriandoli, icone dei piatti |
| Verde Google | `#34a853` | coriandoli, icone dei piatti |
| Blu scuro premuto | `#3b78e7` | stato attivo dei pulsanti |
| Blu chiaro | `#6192f7` | stati |
| Azzurro carta | `#d7e3f9` / `#c3d4f5` | fondo dei pannelli (quest overview) |
| Testo | `#282828` | tutto il testo delle schede |
| Grigio secondario | `#949494` / `#9aa0a6` | testo minore, elementi disattivati |
| Divisori | `#ededed` | linee e bordi |
| Arancio | `#f19d38` / `#fbcd5d` | cerchi delle icone piatto "gialle" |
| Bianco | `#ffffff` | fondo di tutte le schede |

La terna che Awwwards dichiara per il sito e' `#2779a7`, `#49c5b6`, `#ECD06F`:
non l'ho trovata nel CSS, e' una media presa dagli screenshot.

**I cinque mondi** (campionati da me sulle facce delle cubemap con PIL, quindi
**stimati**, non letti da codice):

| mondo | cielo | terreno | dominanti | idea di luce |
|---|---|---|---|---|
| Main Rice Street | `#81c1ce` | `#e1e3ce` | `#e2e6d1`, `#99c8c9`, `#79bdcf` | mattina chiara, quasi tutto bianco-riso |
| Long Valley | `#90b0a9` | `#d58c46` | `#d2954f`, `#68b8d5`, `#e0d2a6` | brodo: terra ocra e acqua azzurra |
| Sizzle Yokocho | `#805b35` | `#a54e25` | `#a8532a`, `#2a0e13`, `#df974f`, `#fce26b` | **notte**: l'unico mondo buio, illuminato dal cibo |
| Savory Bay | `#a9b0bd` | `#3e66ae` | `#d4615d`, `#6c99d2`, `#ed9f96` | mare blu contro scogliere di sashimi rosa |
| Sweet Kingdom | `#65b5d8` | `#f186b2` | `#f1acc8`, `#ee94b6`, `#67b4d6` | tramonto pastello, tutto rosa e lilla |

La regola dietro: **ogni mondo ha una temperatura e un'ora del giorno diverse**,
e nessuno dei cinque assomiglia a un altro. Il passaggio dal bianco di Main Rice
Street al nero-arancio di Sizzle Yokocho e' uno schiaffo voluto, ammortizzato
dal tunnel verde che sta in mezzo.

## Tipografia

| livello | famiglia | peso | corpo | interlinea | note |
|---|---|---|---|---|---|
| Logo | disegnato (non e' un font) | — | ~1/6 dello schermo | — | lettere con bordo bianco spesso, arancio e blu, dentro un'animazione Lottie |
| Barra di ricerca / promessa | Google Sans | 400 | ~20 px | ~1,4 | e' scritta come una query, non come un titolo |
| Titolo del piatto | Google Sans | 500 | ~20 px | ~1,3 | `Kakigoori` |
| Testo del piatto | Google Sans | 400 | ~13–14 px | ~1,5 | 1–2 frasi, mai di piu' |
| Etichette dei pulsanti | Google Sans | 500 | ~10–11 px | — | **tutte maiuscole**: `LEARN MORE`, `NEAR ME`, `OK, GOT IT`, `GOT IT` |
| Intestazione | Google Sans | 400 | ~14 px | — | `Google • Sweet Kingdom`: il logo Google in grigio, il nome del mondo in bianco |
| Contatore | Google Sans | 400 | ~16 px | — | `1 / 3` in alto a destra |
| Fumetti | Google Sans | 400 | ~13 px | ~1,5 | dentro una nuvoletta disegnata in Lottie |

I corpi sono stimati dai fotogrammi a 918x656 riportati a schermo intero; le
famiglie e i pesi sono **letti nel CSS**.

**Come sono serviti i font**: due `@import` verso il servizio esterno dentro
`app.css`:
`fonts.googleapis.com/css?family=Google+Sans:400,500,700` e
`fonts.googleapis.com/css?family=Roboto:400,500`. Nessun `@font-face` locale,
nessun font variabile, nessun preload. Su un sito Google, `Google Sans` e' un
font proprietario servito solo ai domini Google: **e' una scorciatoia che noi
non possiamo copiare**, e fuori da quel dominio la richiesta ricadrebbe su
Roboto.

## Testi veri

Tutti testuali dal file di lingua inglese (`js/1.js`, decodificato).

**Titolo della pagina e social**
```
Google Umami Land | Discover the joy of Japanese cuisine
Discover the joy of Japanese cuisine
```

**Splash**
```
Discover the joy of Japanese cuisine
Enjoy your virtual food trip <br>and go out only once it's safe!
Start
```

**Onboarding**
```
Welcome to Umami Land!
Find the [lente]. Discover [piatto] to learn about the flavors of Japan.
Explore more and get a [premio]!
```

**Introduzioni dei mondi**
```
Main Rice Street
  Drag to look around and...<br/>ooh sushi!
  Once you've finished exploring...<br/> Click the blue panel to follow the
  golden pathways and discover a new place.
  Now, let's eat!
Long Valley
  Welcome to Long Valley, home of the noodle.
  Find the iconic New Year noodle to unlock more surprises.
Sizzle Yokocho
  You have arrived at Sizzle Yokocho.
  A carnival of color and grilled delicacies.
  Psst... your badge is locked in the high striker.
  Find the 3 dishes that are cooked on a griddle to unlock it!
Savory Bay
  Next stop is Savory Bay.
  Known for its tasty sea creatures and unique species of seaweed.
  To unlock a badge, find the 2 dishes that aren't fish.
Sweet Kingdom
  You are now entering Sweet Kingdom.
  Find the sweet treats that match the designs on the teacups to collect a badge.
```

**Voci di menu**
```
Overview / Gift shop / Your favorite dishes / Language / Quality
(High / Medium / Low) / Privacy / Terms & Conditions
```

**Chiamate all'azione e pulsanti**
```
Learn More        (in codice: global.explore)
Near Me           (in codice: global.taste)
Go explore        Go to        Back        Next        Skip
Ok, got it        Got it       Cancel      Close       Download
Unlock            Already unlocked         Go to the gift shop
You're here
```

**Premi e sfide**
```
You've found it!
You found <em>{amount}/{total} special dishes</em> of the challenge
Congratulations!
You found <em>{amount}/{total} special dishes</em> of the challenge and
unlocked the <strong>{world}</strong> badge.
You've unlocked the {world} badge.
This item requires more <strong>badges</strong>. Keep searching for the
special dishes!
Are you sure you want to <strong>unlock</strong> this item?
```

**Finale**
```
Congratulations!
You've just unlocked the secret taste of the park...
<strong>UMAMI</strong> - the delicious taste of savory goodness!
This taste is at the heart of most Japanese dishes.
Now my tastebuds are tingling!
Well done!
Don't forget to get your reward in <a>the gift shop</a>
```

**Uscita e ritorno**
```
Don't forget to come back, <br/><strong>We have a lot to explore!</strong>
Welcome back!
That tickles!
```

**Distintivi** (nome + descrizione)
```
Miso — Soups, sauces, spreads and marinades. This popular ingredient brings a
rich, savory taste to every dish it's used in.
Katsuobushi — Bonito flakes are one of the most important ingredients in all of
Japan. Used to make soup stock or flavor rice or decorate tofu.
Meat — Grilled, sizzled, stewed, or raw. In ramen, on sushi, dipped in sauce,
or served over rice. You found the meat badge.
Green Tea — So much more than a cup of tea. Go green in your choice of ice
cream, mochi, or cake.
Soy sauce — Without soy sauce, there is no Japanese cuisine. You can find this
salty condiment on almost every table in the country.
```

**Le schede dei piatti — questa e' la parte da studiare**

Sono 31 microtesti da una o due frasi. La regola e' sempre la stessa: **una
sensazione fisica + un invito diretto in seconda persona**. Mai un elenco di
ingredienti, mai una storia, mai un aggettivo da recensione.

```
Onigiri — Snack time! Grab this hand-formed, flavor-filled rice ball when
  you're on the go.
Sushi — Eat it cooked, eat it raw, eat it rolled, eat it pressed. There are
  endless variations of sushi to try. Nom nom nom.
Donburi — Fill your belly with one of these savory bowls, brimming with rice
  and your new favorite toppings.
Japanese curry — Whether spooned on rice or slathered on noodles, this thick,
  rich gravy comes in mild, sweet or spicy varieties, full of meat and
  vegetables.
Tamago Kake Gohan (TKG) — Raw egg for breakfast? I dare you to try this
  flavorful topping on your morning bowl of rice.
Omu-rice — A yellow omelette filled with seasoned rice, topped with ketchup art.
Hiyayakko — Chilled, smooth and silky tofu makes this side dish one of the
  coolest around.
Natto — Start your day the Natto way. While its smell is strong, this sticky
  soybean dish is packed with nutrients.
Miso shiru — This stock-based soup comes in all kinds of tastes and colors.
  How will you slurp yours?
Agedashi Dofu — Three words: Deep-fried tofu.
Saba shioyaki — First the mackerel is salted, then it is grilled to perfection.
  It's that simple.
Fugu — You may have heard of pufferfish. You may also have heard it's risky to
  eat. But when it's prepared by an expert chef, it's pure deliciousness.
Uni don — If you're looking for a unique delicacy and a Hokkaido favorite, try
  sea urchin served over rice.
Anago — For deep-sea flavors, try salt-water eel, simmered and served on rice.
  Or deep-fried.
Ikayaki — Squid, simply marinated in soy sauce, and grilled over charcoal.
  This is how Japan does fast food.
Daifuku — Soft mochi outside, filled with a sweet and creamy filling. 大福
  translates as 'great luck'. You'll understand why when you eat daifuku...
Taiyaki — Cakes shaped like fish, but there is nothing from the sea inside
  these sweet treats. Just red beans or custard.
Kakigoori — Mountains of shaved ice, covered in colorful syrup and sweetener,
  make a refreshing dessert. Eat it before it melts!
Mitarashi Dango — A cousin of mochi, these glazed rice dumplings are served on
  a skewer, perhaps paired with hot tea.
Castella — Originating in Portugal, this fluffy spongecake is a favorite sweet
  from Nagasaki to Nagano.
Yakitori — Delicately grilled cuts of chicken on skewers, cooked over binchotan
  charcoal. Now we feast.
Karaage — Sizzled to a golden brown, with a mouthwatering crunch, this is fried
  chicken, Japan style.
Okonomiyaki — The name means 'as you like it'. Think of this savory pancake as
  a version of pizza - what topping will you try?
Gyoza — Panfried, meat-filled dumplings, eaten while still piping hot.
Yakisoba — Sweet and savory stir-fried noodles topped with meat and vegetables.
  For the veggie version, ask for a yasai yakisoba.
Yakiniku — This is how Japan barbecues. Try bite-sized pieces of meat grilled
  to order, and maybe even the legendary wagyu beef.
Ramen — Served in a meat- or fish-based broth with a world of toppings, these
  noodles are ready to slurp. The louder the better.
Tsukemen — Meet ramen's brother, Tsukemen. Served as a smaller, richer broth
  that you dip noodles into before the slurping begins.
Udon — With chewy noodles and delicate broths, udon is all about maximum mouth
  feels.
Soba — Enjoyed year-round, these buckwheat noodles can be served cold with a
  dipping sauce, or in a hot broth with tempura or slices of meat.
Somen — As thin as thread, these noodles can be served hot or cold, stir-fried
  or dipped in broth.
```

Le parole ricorrenti sono tutte di **temperatura, suono e consistenza**:
`piping hot`, `sizzled`, `crunch`, `chewy`, `silky`, `slurp`, `mouth feels`,
`golden brown`, `brimming`, `melts`. Non c'e' quasi mai un aggettivo di
giudizio ("buono", "eccellente"): c'e' il rumore che fa in bocca.

## Mobile

E' la sezione dove Umami Land e' **piu' onesto e meno spettacolare** di quasi
tutti i siti da premio: sul telefono **non diventa un altro sito**. Resta lo
stesso mondo 3D, con la stessa camera e lo stesso campo visivo. Cambia
l'involucro.

**I punti di rottura**, letti alla lettera dal JSON di configurazione dentro
`app.js`:
```
X_SMALL   (max-width: 479px)
SMALL     (min-width: 600px) and (min-height: 376px)
MEDIUM    (min-width: 960px)
LARGE     (min-width: 1200px) and (min-height: 700px)
XLARGE    (min-width: 1440px) and (min-height: 800px)
XXLARGE   (min-width: 1680px) and (min-height: 900px)
XXXLARGE  (min-width: 1920px) and (min-height: 1080px)
```
Da notare: quasi tutti i punti di rottura hanno anche un **vincolo di altezza**.
`SMALL` chiede `min-height: 376px`: un telefono girato in orizzontale non viene
promosso a "desktop" per il solo fatto di essere largo. E in `app.css` 45 delle
54 regole `@media` sono su `(min-width:600px) and (min-height:376px)`: e'
**il** punto di rottura del sito, gli altri sono rifiniture.

**Cosa viene SOSTITUITO** (non nascosto — proprio ricaricato con un altro file):

- `body-moving/path-landscape.json` ↔ `path-portrait.json` — il pannello del
  sentiero fra i mondi ha due animazioni Lottie diverse, non una ridimensionata.
- `body-moving/preloader-searchbar-landscape.json` ↔ `...-portrait.json` — la
  barra di ricerca del caricamento e' ridisegnata per il verticale.
- `body-moving/quest-overview-background-desktop.json` ↔ senza suffisso — il
  pannello dei piatti ha un fondo disegnato per il desktop e uno per `X_SMALL`.

La scelta e' fatta a runtime con `this.deviceState >= this.DeviceState.SMALL ?
"landscape" : "portrait"`.

**Cosa RESTA identico**: la scena 3D, i pallini, la scheda del piatto, Omusubi,
il tunnel, l'audio, le 31 schede. Il mondo e' una cubemap: girarsi funziona
uguale col dito e col mouse. **Questo e' il vantaggio strutturale di scegliere
un panorama invece di una scena navigabile.**

**Cosa cambia sotto il cofano**, e in modo controintuitivo:

- **Il rapporto di pixel e' invertito rispetto alle abitudini.** Su desktop il
  codice fa `if (!mobile) setPixelRatio(1)`: **il desktop renderizza a 1x**,
  senza retina. Su mobile usa `Math.max(1.5, window.devicePixelRatio)`, quindi
  **almeno 1,5x**. La ragione e' che a schermo piccolo le scalettature sui bordi
  disegnati si vedono di piu', e che sul desktop il `_temporalBlur` (jitter di
  Halton + accumulo) ricuce i bordi gratis.
- **L'antialiasing hardware si spegne su mobile**: il renderer viene costruito
  con `new Renderer(..., !this._mobile)`.
- **Esiste un interruttore di qualita' esplicito nel menu**: `High` (predefinito)
  / `Medium` / `Low`, salvato in `localStorage`. E' l'ammissione onesta che
  28 MB di asset e una cubemap 2048x2048 per faccia non stanno in piedi ovunque.
- `cropPortait()` esiste nel motore e ritaglia il canvas a 9:16 con uno
  scissor, ma e' pilotato da un booleano di dat.GUI (`_portrait`, predefinito
  falso): **e' uno strumento da sviluppo per inquadrare il verticale**, non un
  comportamento di produzione.

**Cosa NON ho potuto verificare**: se ci fosse un blocco "gira il telefono", e
quanto sia effettivamente giocabile su 4G. Con 28 MB di asset totali e ~2,5 MB
per il primo mondo, il preloader su telefono doveva essere lungo.

## Stack

| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
|---|---|---|---|
| Framework | **Vue 2** + vue-router + Vuex | VERIFICATO | i percorsi dei sorgenti nelle sourcemap sono `src/component/**/*.vue`; nel bundle ci sono `vuex`, `Vue.use`, `AbstractTransitionComponent` |
| Impalcatura | **vue-skeleton** di MediaMonks | VERIFICATO | nell'HTML: `<meta name="apple-mobile-web-app-title" content="vue-skeleton">` e `<meta name="application-name" content="vue-skeleton">` |
| Pagina | **single page application**: `<div id="app"></div>` vuoto + 2 script | VERIFICATO | l'HTML archiviato e' un guscio di 3.968 byte, **senza una parola di contenuto**. Da fuori non si legge niente: tutti i testi di questa scheda vengono dai bundle |
| Stato persistente | `vuex-persist` su `localStorage`, riduttore sul solo modulo `user` | VERIFICATO | letto in `app.js` |
| Lingue | **vue-i18n-manager**, 4 file separati caricati a richiesta (`js/0..3.js`) | VERIFICATO | `0.js`=cinese, `1.js`=inglese, `2.js`=spagnolo, `3.js`=coreano |
| Animazione UI | **GSAP** (TweenLite/TweenMax, ThrowPropsPlugin, Draggable, VelocityTracker) | VERIFICATO | `com.greensock`, `easing.*`, `plugins.ThrowPropsPlugin` nel bundle. ThrowProps e Draggable sono plugin **a pagamento** (Club GreenSock) |
| Animazione disegnata | **Lottie / bodymovin**, renderer `svg`, `progressiveLoad: true` | VERIFICATO | 54 file `body-moving/*.json`, 381 KB in totale |
| 3D | **motore WebGL interno di MediaMonks — NON three.js** | VERIFICATO | non c'e' nessuna traccia di three.js (l'unica occorrenza di "THREE" e' `THREE_CHAR_HEX` dentro dat.GUI). Ci sono classi proprie `RendererWebGL1` / `RendererWebGL2`, `Material`, `Shader`, `FloatUniform`, `VertexAttribute`, gestione manuale dei VAO e delle estensioni |
| Post-effetto | anti-aliasing temporale con jitter di Halton | VERIFICATO | `getHaltonSequence`, `_jitter`, `_temporalBlur` |
| Pipeline 3D | **esportazione da Unity** | VERIFICATO | nel JSON di scena: `"shaderName": "Webgl/Unlit"`, `animatorId`, `unityAnimator.playAnimation(...)`, trasformazioni con quaternioni e id interi tipici di Unity |
| Formato del mondo | **cubemap a 6 facce** (`PositiveX/Y/Z`, `NegativeX/Y/Z`) + una manciata di piani animati davanti | VERIFICATO | nel JSON di scena esiste un nodo `CubeMap` con sei figli che si chiamano come le sei facce |
| Audio | **Howler.js** (WebAudio), con orientamento della camera | VERIFICATO | `usingWebAudio`, `masterGain`, `_howls` in `vendors.js`; eventi `SOUND_3D_PLAY` / `SOUND_CAMERA_ORIENTATION` in `app.js` |
| Immagini | **WebP con verifica a runtime** e ripiego su PNG/JPG | VERIFICATO | `getWebpSupported()` prova `canvas.toDataURL('image/webp')`; c'e' una lista `texturesWithPngExtension` per le 12 texture che devono restare PNG |
| Utility | Modernizr, dat.GUI (pannello di debug, si apre con `#ui` nell'indirizzo) | VERIFICATO | letti nel bundle. `isDebugMode` e' rimasto a `true` in produzione |
| Font | Google Sans 400/500/700 + Roboto 400/500 da `fonts.googleapis.com` | VERIFICATO | due `@import` in `app.css` |
| Analisi | **gtag** (Google Analytics) | VERIFICATO | eventi `click_hotspot`, `learnmore`, `nearme`, `badge_unlocked`, `umami_unlocked` |
| Build | webpack, cartelle versionate `/version/<timestamp>/` per invalidare la cache | VERIFICATO | `a.p + "version/1626783469807/js/" + t + ".js"` per i chunk |
| Sicurezza | CSP con `nonce` su ogni script | VERIFICATO | `<script nonce="0VL57WIhIOKY44wluzGSng">` nell'HTML |
| Hosting | infrastruttura Google (`withgoogle.com`, `server: Google Frontend`) | SUPPOSTO | l'header lo dice **oggi**, sul redirect. Che nel 2021 fosse App Engine e' un'ipotesi ragionevole ma `non verificato` |
| CMS | **nessuno** | VERIFICATO | i 31 piatti, i 5 mondi, i prezzi del negozio sono array scritti a mano dentro `app.js`; i testi sono 4 JSON compilati nel bundle |

## Peso e prestazioni

Numeri veri, presi dalle lunghezze registrate da Internet Archive per la build
`1626783469807` (sono le dimensioni **trasferite**, cioe' compresse dove il
server comprimeva). Non ho potuto misurare tempi reali: il sito non esiste piu'.

**Codice**

| file | trasferito | in chiaro |
|---|---|---|
| `js/vendors.js` | 338.944 B | 988.976 B |
| `js/app.js` | 213.845 B | 783.481 B |
| `css/app.css` | 23.319 B | 81.475 B |
| `js/1.js` (lingua inglese) | 5.209 B | 14.700 B |
| **totale codice** | **~581 KB** | **~1,87 MB** |

**Contenuti**

| gruppo | file | peso |
|---|---|---|
| Audio (`.ogg`) | 72 | **13,94 MB** |
| Scena Main Rice Street (cubemap + geometria) | 12 | 1,65 MB |
| Scena Sweet Kingdom | 13 | 1,43 MB |
| Scena Sizzle Yokocho | 15 | 1,40 MB |
| Scena Savory Bay | 10 | 1,35 MB |
| Scena Long Valley | 10 | 1,17 MB |
| Modello di Omusubi | 1 | 0,43 MB |
| Texture condivise (tunnel, uccelli, ecc.) | 13 | 0,72 MB |
| Animazioni Lottie | 54 | 0,36 MB |
| Regali (sfondi, adesivi, zip) | 11 | 3,47 MB |
| **totale `/static/`** | **226** | **28,26 MB** |

Osservazioni che contano piu' dei numeri:

- **Il 49% del peso e' audio.** In un sito di cibo senza fotografie, il suono
  fa il lavoro che di solito fa la fotografia.
- Una singola faccia di cubemap arriva a **363 KB in WebP a 2048x2048**
  (`SavoryBay/PositiveZ.webp`). Sei facce = ~1,2 MB per mondo, ed e' **tutto lo
  sfondo**: nessun poligono, nessuna luce, nessuna ombra da calcolare.
- La geometria vera e' minima e sta dentro un JSON: `MainRiceStreet.json` e'
  1,78 MB in chiaro ma solo 515 KB trasferiti, e contiene appena **43 oggetti**
  e **72 trasformazioni** — nove ciotole, otto foglie della statua, otto
  uccelli, tre bandiere, del vapore. Tutto il resto e' dipinto.
- Il caricamento e' **per mondo**, non tutto insieme: cambiando mondo si
  scaricano le nuove facce e la nuova scena mentre sei dentro il tunnel. **Il
  tunnel e' il preloader**: dura quanto serve.
- Punteggio Awwwards sullo sviluppo: **7,95/10**, il piu' basso dei suoi voti.
  Nessun dato Lighthouse disponibile.

## Tre cose da rubare

Sono meccaniche, e sono tutte e tre rifacibili su un sito di paninoteca senza
un motore WebGL scritto in casa.

**1. Il panorama dipinto al posto della scena 3D — e i tre oggetti veri
davanti.**
Umami Land non modella un mondo: fotografa (renderizza) un mondo una volta
sola, lo appiccica su un cubo e ci mette dentro il visitatore. Quello che si
muove sono **quattro o cinque piani con una texture** (le ciotole che volano,
le bandiere, il vapore, gli uccelli). Il costo di produzione crolla, la resa no.
Per una paninoteca: si costruisce **una** inquadratura del bancone in 3D o in
fotografia a 360 gradi, si esporta a cubemap, e si animano davanti solo tre
cose — il vapore che sale dalla piastra, la fetta di formaggio che cola, il
tovagliolo che si muove. Non serve nemmeno WebGL: `<canvas>` con sei immagini e
una rotazione, o `three.js` in 40 righe. **Il trucco e' decidere cosa NON e'
tridimensionale.**

**2. La CTA come ricompensa, mai come richiesta.**
In tutta la pagina principale di Umami Land **non c'e' una sola chiamata
all'azione**. Le uniche due (`LEARN MORE`, `NEAR ME`) compaiono solo dentro la
scheda di un piatto che hai dovuto **trovare**. Chi ci arriva ha gia' investito
attenzione, e il click ha un tasso di conversione che nessun banner in alto
avrebbe. Per una paninoteca: nascondi `ORDINA` dentro la scheda del panino che
l'utente ha aperto girandosi, non in cima. E fai due pulsanti, non uno:
uno informativo (**cosa c'e' dentro**) e uno di intenzione locale
(**dove lo mangio**). Umami Land traccia i due click con due nomi diversi
proprio perche' valgono cose diverse.

**3. La descrizione di due righe fatta di rumore e temperatura, non di
ingredienti.**
Trentuno schede, tutte con lo stesso stampo: **una sensazione fisica + un
imperativo alla seconda persona**. *"Panfried, meat-filled dumplings, eaten
while still piping hot."* — *"Sizzled to a golden brown, with a mouthwatering
crunch."* — *"These noodles are ready to slurp. The louder the better."* —
*"Three words: Deep-fried tofu."* Mai la lista degli ingredienti, mai
"selezionati con cura", mai un aggettivo di giudizio. Per una paninoteca e' un
esercizio di mezz'ora che si puo' fare oggi su ogni panino del menu, e vale piu'
di un servizio fotografico.

**Bonus, per il suono**: il rumore giusto e' posizionato nello spazio. Umami
Land ha `sizzle-yokocho-grill.ogg` piantato in un punto della scena, e quando ti
giri lo senti spostarsi. Su una pagina normale basta molto meno: **lo sfrigolio
della piastra che parte al passaggio del mouse sulla foto della piastra**, a
volume basso, con un interruttore di muto visibile. Il cervello sente prima di
leggere.

## Non verificato

- **Il premio "Site of the Year 2021" del brief.** Sulla scheda Awwwards c'e'
  solo Site of the Day (1/2/2021, 8.23). Non ho potuto interrogare gli albi
  annuali di Awwwards ne' altri concorsi (FWA, CSSDA, Webby) perche' il budget
  di ricerca web della sessione era esaurito quando ho iniziato.
- **I crediti nominali** (chi ha fatto la direzione artistica, chi le
  illustrazioni, chi il suono, se il suono e' stato commissionato a uno studio
  esterno). Su monks.com oggi non c'e' una pagina di caso per Umami Land.
- **Perche' il sito e' stato spento**, e quando esattamente. L'ultima cattura
  che risponde 200 e' del 2022; oggi e' un 301 su google.com.
- **I tempi reali** (First Contentful Paint, tempo fino al pulsante `Start`,
  fotogrammi al secondo su un telefono medio). Il sito non esiste piu' e
  l'archivio non conserva le prestazioni. Nessun punteggio Lighthouse esistente.
- **La palette dichiarata da Awwwards** (`#2779a7`, `#49c5b6`, `#ECD06F`) non
  corrisponde a nessun colore trovato nel CSS: e' quasi certamente un estratto
  automatico dagli screenshot, non un dato di progetto.
- **I colori dei cinque mondi** che ho messo in tabella sono **campionati da me
  dalle immagini**, non letti da un foglio di stile: nei mondi il colore e'
  dentro le texture, non nel codice.
- **I corpi tipografici in pixel**: stimati dai video a 918x656, non letti dal
  CSS (le classi sono a nomi generati e i valori sono in `rem` dentro regole
  frammentate).
- **Il comportamento reale su telefono**: non ho potuto provarlo. Quello che
  scrivo nella sezione Mobile e' dedotto dal codice (punti di rottura, varianti
  portrait/landscape, rapporto di pixel), non da una prova sul dispositivo.
- **Se ci fosse un avviso "gira il telefono"** o un percorso ridotto sotto una
  certa potenza: non ho trovato traccia nel codice, ma non posso escluderlo.
- **Il contenuto di `static/pdf/washoku-en.pdf`**, presente fra gli asset e mai
  richiamato in modo evidente dall'interfaccia.
- **Il numero di visitatori o qualunque risultato di campagna**: nessun dato
  pubblico trovato.
