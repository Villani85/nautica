# Transizioni di pagina — passare da una pagina all'altra senza che il sito sbatta

Ricerca del 13/08/2026. Supporto browser letto sui **dati grezzi di MDN
browser-compat-data e caniuse**, non su articoli; stato delle librerie letto
sul **registro npm e sui feed di commit di GitHub**; comportamento dei siti
letto nelle **schede gia' presenti in questa cartella**, che a loro volta
riportano codice vero.

Collegati: `_ACCESSIBILITA.md` (focus, annunci, `prefers-reduced-motion`),
`_CANVAS-E-GOOGLE.md` (cosa vede un crawler), `_PATTERN.md` (il quadro sui 16
siti), `_PRELOADER.md` (i primi tre secondi, che e' lo stesso problema al
primo caricamento).

---

## In una riga

**Nessuno dei siti premiati usa la View Transitions API come motore, e non
perche' siano indietro: perche' la transizione che vendono non e' una
dissolvenza.** La strada di gran lunga piu' diffusa e' la piu' banale — una
tendina che copre lo schermo, e sotto **una navigazione vera** oppure un
router che scambia un solo contenitore. Il problema difficile non e' la
transizione: e' **tenere viva la scena WebGL mentre il DOM cambia sotto**, e
si risolve mettendo il canvas fuori dal router, non dentro.

---

# 1. Le quattro strade nel 2026

| strada | supporto reale oggi | costo | cosa si rompe |
|---|---|---|---|
| **View Transitions API** — stesso documento | **90,2%** degli utenti (caniuse). Chrome 111, Safari 18, Firefox 144 | zero KB, ~20 righe di CSS | serve gia' un router: **non fa navigare**, anima soltanto |
| **View Transitions API** — cross-document (`@view-transition`) | **84,54%** pieno + 1,74% parziale. Chrome 126, Safari 18.2, **Firefox no**, **Samsung Internet no** | zero KB, zero JS: 4 righe di CSS | solo same-origin; niente controllo fine; degrada a taglio secco dove manca |
| **barba.js** (`@barba/core`) | libreria: gira ovunque | 705 KB spacchettati, 2 dipendenze | **ferma dal 12/08/2024**; devi riscrivere tu init e distruzione dei componenti |
| **Taxi.js** (`@unseenco/taxi`) | libreria: gira ovunque | 228 KB spacchettati, 1 dipendenza | viva ma minuscola (**1.907 download al mese**): sei da solo se si rompe |
| **router del framework** (Next / Nuxt) + copertura | gira ovunque | il framework | e' la strada dove **il canvas WebGL muore a ogni rotta**, se non lo tiri fuori |

E una quinta che i numeri impongono di aggiungere, perche' e' quella che i
siti premiati usano davvero quando usano una libreria: **Swup**.

---

## 1.1 La View Transitions API

### Cosa e' supportato, esattamente (BCD, letto oggi)

| pezzo | Chrome | Firefox | Safari |
|---|---|---|---|
| `document.startViewTransition()` (stesso documento) | **111** | **144** | **18** |
| `view-transition-name` | 111 | 144 | 18 |
| `view-transition-name: match-element` | 137 | 144 | 18.4 |
| `view-transition-class` | 125 | 144 | 18.2 |
| **`@view-transition { navigation: auto }`** (cross-document) | **126** | **NO** (`bugzil.la/1860854`) | **18.2** |
| `:active-view-transition-type()` (i tipi) | 125 | 147 | 18.2 |
| `pageswap` / `pagereveal` | 124 / 123 | **NO** | 18.2 |
| Navigation API (`navigation`, evento `navigate`) | 102 | **147** | **26.2** |

Copertura d'uso: **90,2%** per la versione a documento singolo, **84,54%**
per quella cross-document (caniuse, `usage_perc_y`). Su cross-document
caniuse segna in piu' **1,74% "parziale"**, che e' Firefox dietro flag.

**Due dettagli che cambiano il preventivo:**

1. **Samsung Internet non supporta il cross-document** (caniuse: `n` fino
   alla 30). Su un sito con traffico Android italiano non e' un dettaglio.
2. **`pageswap` e `pagereveal` non esistono in Firefox.** Sono i due eventi
   con cui si decide *cosa* animare in base a *dove si sta andando* (per
   esempio: assegnare il `view-transition-name` solo alla card cliccata).
   Senza quelli il cross-document sa fare solo la dissolvenza di default.

Il pezzo che serve alle SPA — la **Navigation API**, cioe' poter
intercettare una navigazione in modo pulito invece di mettersi in mezzo ai
click — e' arrivato in Firefox 147 e Safari 26.2 secondo BCD. **E' la novita'
vera del 2026**: fino a ieri era solo Chrome, e per questo tutti i router di
questi siti intercettano i click a mano.

### Cosa costa

Praticamente nulla in byte. Nel caso cross-document sono quattro righe:

```css
@view-transition { navigation: auto; }

::view-transition-old(root) { animation: 0.3s ease-out both fade-out; }
::view-transition-new(root) { animation: 0.3s ease-in  both fade-in; }
```

E funziona su un sito **multipagina statico, senza un byte di JavaScript**.
Per un sito di uno studio con sei pagine (`_SITO-DELLO-STUDIO.md`: mediana 6
pagine, nessuno oltre 10) e' un affare.

### Cosa si rompe — i limiti documentati

- **`view-transition-name` deve essere unico.** Documentazione Chrome:
  *«If two rendered elements have the same `view-transition-name` at the same
  time, the transition will be skipped.»* Non "va male": **salta del tutto**.
  In una griglia di progetti significa che il nome va assegnato **solo alla
  card cliccata**, a runtime.
- **Una sola transizione per volta.** *«If a new view transition starts while
  one is already running, the old transition skips to the end.»* Chi clicca
  due link in fretta vede uno scatto.
- **La pagina e' congelata durante il callback.** *«During this time, the
  page is frozen, so delays here should be kept to a minimum.»* Le fetch si
  fanno **prima** di chiamare `startViewTransition`, mai dentro.
- **Il livello `::view-transition` intercetta i click.** Documentato da
  Vercel/Next: *«While a transition runs, the `::view-transition` overlay
  captures pointer events, so clicks during the animation are lost.»*
  Rimedio, che quasi nessuno scrive:

  ```css
  ::view-transition { pointer-events: none; }
  ```

  E anche cosi', gli elementi con un nome restano fuori dall'hit-testing per
  tutta la durata. **E' l'argomento numero uno per tenere le transizioni
  corte.**
- **Cross-document: solo same-origin.** Documentazione Chrome: *«Cross-document
  view transitions are limited to same-origin navigations only»* — e l'origine
  comprende schema, host **e porta**. Da `sito.it` a `shop.sito.it` non
  funziona.
- **Cross-document: c'e' un tetto di quattro secondi, ed e' documentato.**
  *«If a navigation takes too long — more than four seconds in Chrome's case —
  then the view transition is skipped with a `TimeoutError` `DOMException`.»*
  Su una connessione lenta l'effetto non parte e basta. (Sul ramo a documento
  singolo la documentazione Chrome **non dichiara nessun timeout**: dice solo
  di tenere corto il callback.)
- **`navigation: auto` non copre tutto.** Vale per `traverse` (avanti e
  indietro del browser) e per `push`/`replace` **se non partiti dalla barra
  degli indirizzi**. Ricaricamento e URL digitato a mano sono **esclusi**.
  Questa e' una buona notizia per la sezione 5: **il tasto indietro e' incluso
  gratis**, cosa che nessun router intercettato ti da'.
- **Il pezzo che salva l'effetto sulle connessioni lente:** si puo' bloccare
  il primo rendering finche' certi elementi non esistono —
  `<link rel="expect" blocking="render" href="#hero">` — cosi' la pagina
  d'arrivo non si mostra a meta'. E' l'equivalente dichiarativo del
  preloader.
- **Non rispetta da sola `prefers-reduced-motion`.** Va scritto a mano (vedi
  `_ACCESSIBILITA.md`); la ricetta minima e':

  ```css
  @media (prefers-reduced-motion: reduce) {
    ::view-transition-old(*), ::view-transition-new(*), ::view-transition-group(*) {
      animation-duration: 0s !important; animation-delay: 0s !important;
    }
  }
  ```

  Con durata zero il contenuto si scambia di colpo, che e' il comportamento
  predefinito del browser: nessun danno.

### La trappola di metodo, gia' segnata in `_PATTERN.md`

Cercare `view-transition-name` nel CSS di un sito **da falsi positivi**: i
reset moderni (Tailwind v4) contengono `view-transition-name: unset`. E
`startViewTransition` compare nei bundle Nuxt e Next perche' e' codice di
framework. **Bundle non vuol dire uso.**

---

## 1.2 barba.js — verificato: e' ferma

Dati letti oggi sul registro npm e sul feed dei commit:

| voce | valore |
|---|---|
| ultima versione | **2.10.3** |
| data di pubblicazione | **12/08/2024** — due anni oggi |
| ultimo commit sul ramo principale | **12/08/2024** |
| download nell'ultimo mese | **26.818** |
| peso spacchettato | **704.833 byte** |
| dipendenze | `is-promise`, `path-to-regexp` |

**Non e' archiviata, non e' deprecata: e' ferma.** Il che, per una libreria
che fa una cosa sola e la fa da sette anni, non e' automaticamente un difetto
— ma va detto al cliente, perche' quando Chrome cambia qualcosa nel bfcache o
nella Navigation API nessuno la aggiorna.

**Chi la usa nella nostra cartella:** locomotive.ca (`@barba/core` trovato
nella sourcemap, con **tre transizioni proprie** in
`assets/scripts/transitions/` — `default.js`, `workList.js`, `workNext.js`,
prefisso `data-load`, `timeout: 10000`, prefetch acceso).

**E il dato commerciale, da `_BERSAGLI-BRIANZA.md`:** Barba.js e' la libreria
che le web agency locali hanno consegnato ai mobilifici brianzoli. Compare su
Lema, Desalto, Longhi, Zanotta, Bonacina, Tecno. Su siti IIS/ASP.NET con
Universal Analytics del 2018. **Se vedi Barba su un sito italiano, quasi
sempre e' l'unica idea di interazione che c'e', ed e' vecchia.**

### Cosa si rompe con Barba (vale per tutte le librerie di questa famiglia)

Non e' colpa della libreria, e' la natura del meccanismo: **sostituisci un
pezzo di DOM, e tutto quello che era agganciato a quel DOM resta appeso.**

- ScrollTrigger creati sul contenuto vecchio: da uccidere con `kill()`;
- `IntersectionObserver` e `ResizeObserver`: da `disconnect()`;
- `SplitText`: da `revert()`;
- timeline GSAP in `repeat: -1`: continuano a girare su nodi staccati;
- il canvas WebGL: vedi tutta la sezione 3;
- gli script di terze parti (analytics, chat, cookie banner) **non si
  ricaricano**: la pageview va mandata a mano;
- il `<title>`, le `<meta>` e i dati strutturati vanno aggiornati a mano, o
  la condivisione social mostra sempre la home.

Trionn e' l'esempio positivo del cleanup fatto bene: *«ogni `useGSAP` ritorna
una funzione che fa `kill()` di timeline e ScrollTrigger, `unregister()` dal
manager, `disconnect()` di IntersectionObserver e ResizeObserver,
`split.revert()` di SplitText, `renderer.dispose()` + `traverse` con
`geometry.dispose()`/`material.dispose()` per three.js, e
`detachShader`/`deleteProgram`/`deleteBuffer` per il WebGL grezzo»*
(`trionn.md`). **Questa lista e' il vero costo di una navigazione
intercettata**, e non compare in nessun preventivo.

---

## 1.3 Taxi.js — viva, piccolissima

| voce | valore |
|---|---|
| ultima versione | **1.9.1** |
| data di pubblicazione | **01/11/2025** |
| ultimo commit | **01/11/2025** |
| download nell'ultimo mese | **1.907** |
| peso spacchettato | **227.598 byte** (un terzo di Barba) |
| dipendenze | `@unseenco/e` (un event emitter degli stessi autori) |

E' l'erede spirituale di Barba scritta piu' asciutta: `data-taxi` sul
contenitore, `data-taxi-view` su cio' che si sostituisce, classi
`Renderer` per pagina e `Transition` per il passaggio.

**Chi la usa nella nostra cartella: il Site of the Year 2025.** Il sito di
**Lando Norris** (OFF+BRAND) ha `data-taxi` e `data-taxi-view` fra i suoi
data-attribute (`_CODICE-PUBBLICO-3.md`), e `_PRELOADER.md` riporta il codice
di entrata e uscita.

> **Correzione da segnare.** La scheda `lando-norris.md` (riga 122) dice
> *«router: fetch + `pushState` custom (non Barba, non Swup)»*. E' vero che
> non e' Barba ne' Swup, ed e' vero che sotto sono `fetch` + `pushState` —
> ma **e' Taxi.js**, e la prova sono i data-attribute nel markup Webflow.
> Le due schede non si contraddicono sui fatti, solo sulla conclusione.

Il codice, letto da `_PRELOADER.md`, mostra anche il numero che conta:

```js
// USCITA
function TP(page) {
  window.closeNavigation();
  qP(); pageTransitionOut();                       // la copertura si chiude
  setTimeout(() => { uw(); /* cleanup */ }, 1000); // 1000 ms dopo
}
// ENTRATA
function PP(page) {
  setTimeout(() => { pageTransitionIn() }, 500);   // la copertura si apre a 500 ms
  window.scrollTo(0, 0);
  XR(); UK.reinit(); /* ... init immediato ... */
  switch (page) { case PAGES.HOME: _L(); setTimeout(() => { l9(); X7() }, 50); ... }
}
```

**Le animazioni partono a 50 ms, la copertura si apre a 500: 450 ms di
anticipo.** E' la stessa regola del preloader (`_PRELOADER.md`: mediana ~450
ms): la pagina e' gia' viva prima che tu la veda. Nota anche
`window.scrollTo(0, 0)` — ci torniamo nella sezione 5, perche' e' l'errore
del tasto indietro.

**Rischio da dichiarare:** 1.907 download al mese sono pochissimi. Se si
rompe, non c'e' Stack Overflow: c'e' il codice sorgente. Che sono 228 KB e si
legge, ma va messo in conto.

---

## 1.4 Il router del framework + una copertura animata

E' quello che fanno quasi tutti i siti recenti della cartella. Il router c'e'
gia', quindi la transizione e' solo un pannello che copre e si scopre,
sincronizzato con il cambio rotta.

### Next.js (App Router) — nel 2026 non serve piu' nessun flag

Documentazione ufficiale di Next 16.3.0, aggiornata il **07/08/2026**:

> «View transitions work in the App Router **with no configuration**. The App
> Router uses React canary releases, which contain all stable React 19 changes
> as well as newer features like `ViewTransition`. You do not need to install
> `react@canary` yourself.»

Quindi: `import { ViewTransition } from 'react'`, senza il prefisso
`unstable_` e senza `experimental.viewTransition` nel `next.config`. **Ma
attenzione:** su react.dev il componente e' ancora marcato

> «The `<ViewTransition />` API is currently only available in React's Canary
> and Experimental channels.»

Cioe': **e' stabile per chi usa Next, sperimentale per chiunque altro.**

Le trappole documentate da Vercel, tutte utili e tutte poco raccontate:

1. **Il wrapper va in `page.tsx`, non in `layout.tsx`.** *«Layouts persist
   across navigations, so enter and exit never fire there.»* Lo stesso fatto
   che salva il canvas (sezione 3) impedisce l'animazione di uscita.
2. **`default="none"` e' quasi obbligatorio**, altrimenti *«every named
   `<ViewTransition>` animates whenever any transition runs on the page»*.
3. **E il rovescio, che e' un bug silenzioso:** *«With `default="none"` and no
   `share` prop, the pair silently stops morphing.»*
4. **Il morph funziona solo se la destinazione e' gia' in cache.** *«The morph
   plays when the destination content renders in the same commit as the
   navigation, which is the case with prefetched (cached) pages. If the
   destination suspends into a fallback first, no pair forms.»* Tradotto: **su
   una connessione lenta l'effetto che hai venduto non parte.**
5. **Il tasto indietro del browser non porta i tipi di transizione.**
   *«Browser-initiated back navigations (the back button or swipe gestures) do
   not carry a transition type, so the directional slide does not play.»*
6. Il `<Link>` accetta `transitionTypes={['nav-forward']}`, e `useRouter()`
   lo accetta in `push()`/`replace()`. **Il verso lo decidi tu**, non lo
   deduce il framework.

### Nuxt — ancora sperimentale, e questo va detto

Documentazione ufficiale: `app.pageTransition` e `app.layoutTransition` sono
normali transizioni Vue e sono stabili; la View Transitions API **e' ancora
sotto `experimental`**:

```ts
export default defineNuxtConfig({
  app: { pageTransition: { name: 'page', mode: 'out-in' } },
  experimental: { viewTransition: true },   // 'always' per ignorare reduced-motion
})
```

Con `true` Nuxt rispetta da solo la preferenza di movimento ridotto; con
`'always'` no. Due vincoli documentati:

- **La pagina o il layout da animare deve avere un solo elemento radice.** I
  frammenti *«cannot be animated and may cause navigation errors»*.
- **Se cambia anche il layout, la `pageTransition` non parte**: serve la
  `layoutTransition`.

`mode: 'out-in'` e' la scelta che quasi tutti fanno, ed e' la stessa di
`dont-board-me.com` (Nuxt 3): *«`mode: "in-out"`, uscente su `zIndex: 2`»* —
che e' l'altra meta', e serve quando la copertura deve stare **sopra**.

---

## 1.5 La quinta strada: Swup — l'unica libreria di transizione viva

Non era nell'elenco, ma i dati la impongono.

| voce | Swup | Barba | Taxi | Highway (Dogstudio) |
|---|---:|---:|---:|---:|
| ultima versione | **4.9.2** | 2.10.3 | 1.9.1 | 2.2.1 |
| pubblicata il | **12/06/2026** | 12/08/2024 | 01/11/2025 | **21/04/2020** |
| ultimo commit | **11/08/2026** (due giorni fa) | 12/08/2024 | 01/11/2025 | — |
| download/mese | **168.834** | 26.818 | 1.907 | 2.175 |
| peso spacchettato | 695 KB | 705 KB | 228 KB | 149 KB |

**Swup ha sei volte i download di Barba ed e' stata toccata due giorni fa.**
E' l'unica di questa famiglia che si puo' consigliare senza avvertenze
sull'abbandono.

L'ha usata **2xA Studio** (Developer Award), e la sua configurazione e' il
manuale di come si fa (da `2xa.md`, letta nel bundle, versione `4.8.2`):

```js
this.swup = new Swup({
  containers: ["main"],
  plugins: [ new SwupA11yPlugin, new SwupPreloadPlugin, new SwupHeadPlugin,
             new SwupBodyClassPlugin, new SwupScrollPlugin({ animateScroll: false }) ]
});

this.swup.hooks.replace("animation:out:await", async (visit) => { await this.shader.show(); });
this.swup.hooks.replace("animation:in:await",  async ()      => { this.shader.hide(); });
this.swup.hooks.on("animation:out:end", () => this.destroyComponents());
this.swup.hooks.on("page:view",         () => { /* re-init */ });
```

Tre cose da rubare:

1. **`containers: ["main"]`** — Swup sostituisce **solo** `<main>`. Header,
   `.page-transition`, `.noise` e `.intro` stanno fuori e **non vengono mai
   smontati**. E' cosi' che il canvas della tendina sopravvive a tutta la
   sessione (`let instance = null; function getShader(){ return instance ||=
   new Shader(document.querySelector("[data-fade]")) }`).
2. **L'uscita si aspetta, l'entrata no.** `animation:out:await` fa
   `await shader.show()` (1 s), quindi il DOM viene scambiato **solo a schermo
   coperto**. `animation:in:await` chiama `shader.hide()` **senza `await`**: il
   hook si risolve subito, i componenti si inizializzano e la pagina e' gia'
   interattiva mentre la tendina si sta ancora sciogliendo. La stessa regola
   dei 450 ms di Lando Norris, ottenuta togliendo una parola.
3. **Zero CSS di transizione.** Nel foglio di stile non compare nessuna delle
   classi che Swup aggiunge da solo (`is-changing`, `is-animating`,
   `is-leaving`, `is-rendering`): **0 occorrenze**. Tutta la transizione e'
   nello shader.

E il pezzo piu' istruttivo di tutta questa ricerca:

> **Swup 4 ha un ramo View Transitions nativo, scritto bene, con feature
> detection e una bandiera per singola visita — e 2xA lo tiene spento.**
> Nel bundle: `visit.animation.native && document.startViewTransition ? ... :
> ...`; l'oggetto `defaults` contiene `native: !1`; nel CSS ci sono **zero**
> regole `::view-transition*`.
>
> Il motivo si vede guardando lo shader: **la View Transitions API sa fare
> dissolvenze e morphing di elementi condivisi, non sa fare un bordo a retino
> Bayer 8x8 deformato da rumore simplex.** Li' la transizione non e' un
> passaggio: e' un contenuto.

`Highway.js` — la libreria di Dogstudio, quella con cui il loro stesso sito
premiato naviga — **e' ferma da aprile 2020**. Chi ne trova traccia in un
sito da rifare sa quanti anni ha davanti.

---

# 2. Cosa fanno DAVVERO i siti gia' schedati

Metodo: dedotto dalle schede di questa cartella, che riportano firme di
libreria nei bundle, data-attribute nel markup e chiamate lette nel codice.
La colonna **fonte** dice dove sta la prova.

| # | sito | navigazione | tecnica | fonte |
|---|---|---|---|---|
| 1 | **Revelatio** (SOTD 2026) | **documento intero** | tendina GSAP 0,6 s poi **`window.location.href`**. `sessionStorage` per far scoprire la pagina d'arrivo. 60 righe su Webflow | `revelatio.md` — *«View Transitions API: non usata, VERIFICATO»* |
| 2 | **2xA Studio** (Dev Award) | intercettata | **Swup 4.8.2** + 5 plugin ufficiali, `containers:["main"]`, tendina a shader Three.js | `2xa.md`, `this.version="4.8.2"` nel bundle |
| 3 | **Lando Norris** (SOTY 2025) | intercettata | **Taxi.js** (`data-taxi`, `data-taxi-view`) su Webflow | `_CODICE-PUBBLICO-3.md`, `_PRELOADER.md` |
| 4 | **Locomotive** | intercettata | **@barba/core**, 3 transizioni proprie, `timeout: 10000`, prefetch. Scramble di tutto il testo visibile in 0,25 s | `locomotive.md`, sourcemap |
| 5 | **Dogstudio** (SOTM 2019) | intercettata | **Highway.js** (libreria loro), `data-router-wrapper` / `data-router-view`, `Highway.Core` con **12 renderer** | `dogstudio.md` — VERIFICATO |
| 6 | **Cuberto** | intercettata | **router interno**, `fetch` + `DOMParser`, aggiorna solo `["title","meta",".cb-navbar","#view-main"]`. Zero taxi/barba/swup/highway | `cuberto.md` — VERIFICATO |
| 7 | **Mana Yerba Mate** (SOTY 2023) | intercettata | **router AJAX a mano**: `XMLHttpRequest` + `DOMParser` + swap del `<main>`, sincronizzato con un **Lottie** (bolle 0->54 in uscita, 54->94 in entrata) | `mana-yerba-mate.md`, classe `Transition` in `global.js` |
| 8 | **Aristide Benoist** | intercettata | `history.pushState` + XHR. **Ma il server serve davvero ogni URL profondo** con il suo `<title>` e la sua `<meta description>` | `aristide-benoist.md`, verificato su `/house-of-gucci` |
| 9 | **Frans Hals Museum** (SOTY 2018) | intercettata (**PJAX**) | **Backbone + Marionette**: `onLinkClick` fa `preventDefault()` + `Backbone.history.navigate(s, {trigger:true})`. Sopra **WordPress** | `frans-hals.md` — VERIFICATO |
| 10 | **Hello Monday** (SOTY 2021) | intercettata | **router client interno**: `TemplateManager` + `LinkParser` + `signalHashChange`. Ma l'HTML server-side e' **completo, 226 KB** | `hello-monday.md` — VERIFICATO |
| 11 | **Zajno** | intercettata | il sito si scarica **tutto in una richiesta** (45 rotte), poi `history.pushState`. Nessun router di libreria, **zero View Transitions** | `zajno.md` — VERIFICATO |
| 12 | **Dark / Netflix** (SOTD 2020) | intercettata | SPA **Vue**; backend PHP che risponde su `/index.php/<rotta>` con `{"data":"<!doctype html>..."}` — **il markup dentro un involucro JSON** | `_CODICE-PUBBLICO-3.md`, risposta 200 `application/json` |
| 13 | **Umami Land** (Monks/Google) | intercettata | **Vue 2 + vue-router + Vuex**, `AbstractTransitionComponent` nel bundle. La transizione e' una **macchia d'inchiostro** su un canvas 2D separato | `umami-land.md` — VERIFICATO |
| 14 | **Orano** (SOTM 2018) | intercettata | router Vue `mode: "history"`, `base: "/experience/innovation/"`. **Una sola scena WebGL mai smontata** sotto tutte le rotte | `orano.md` |
| 15 | **KODE** | intercettata | SPA, guscio HTML + 4 bundle, `<base href="/">`, router interno `router.navigate("/dialog/intro")` | `kode.md` — VERIFICATO |
| 16 | **Resn** (SOTY 2020/2022) | intercettata | SPA a stati con **routing hashbang**: `#!/menu`, `#!/work`, `#!/work/all`, `#!/about`, `#!/contact` | `resn.md` |
| 17 | **Persepolis** (Getty) | intercettata | SPA con guscio vuoto: **3,7 KB di HTML** e un `<div id="app">` | `persepolis.md` — VERIFICATO |
| 18 | **Igloo Inc** (SOTY 2024) | intercettata | rotta client-side `/portfolio/:project` (slug `pudgy-penguins`, `overpass`, `abstract`) | `igloo.md` — VERIFICATO |
| 19 | **basement.studio** | **mista, ed e' la piu' interessante** | router Next.js per il grosso, **ma il passaggio Human<->Machine e' un link normale con navigazione completa**, di proposito | `basement.md` — vedi sezione 3 |
| 20 | **darkroom.engineering** | intercettata | Next.js: `router.push('/backrooms')` dopo 2000 ms; tenda `clip-path: inset(100% 0 0)` -> `inset(0)` in 1,2 s. **Lenis viene fermato** (`lenis.stop()`) e riavviato in `onAfterEnter` | `darkroom.md` |
| 21 | **by-kin** (SOTD + Dev Award) | intercettata | **Next.js App Router**, hosting proprio: il velo copre in **0,35 s**, il router cambia rotta a **0,7 s** | `by-kin.md` |
| 22 | **Trionn** | intercettata | Next.js + GSAP. La "serranda" a 5 fasce e' **la stessa identica cosa** che fa da wipe fra sezioni, da transizione di pagina e da uscita del preloader | `trionn.md` |
| 23 | **Mosby's Files** (SOTD 13/08/2026) | intercettata | **Nuxt**: `NuxtLink` con `prefetch-on="interaction"`, `router.push` dopo 350 ms. La transizione e' una **copertina che gira** (`rotateY: 0 -> -180deg`, `power3.inOut` 1,5 s), CSS 3D puro | `mosby.md` |
| 24 | **Noomo** | intercettata | Nuxt: tendina `#transition` con `clip-path` che sale dal basso, `z-index: 900`, con testo dentro | `noomo.md` |
| 25 | **don't board me** (SOTY 2024) | intercettata | Nuxt 3 in SSR: `clip-path` a tendina + `xPercent: 50` interno, 1 s, `mode: "in-out"`, uscente su `zIndex: 2` | `dont-board-me.md` |
| 26 | **Immersive Garden** (SOTY 2017/18) | intercettata | Nuxt 3 con SSR (il payload contiene i 18 progetti) | `immersive-garden.md` |
| 27 | **Simply Chocolate** (E-comm SOTY 2017) | **mista** | lo shop e' 13 passi dentro la stessa pagina; `About`, `Stores`, `Catalogue`, carrello e checkout WooCommerce sono **pagine normali con navigazione normale** | `simply-chocolate.md` |
| 28 | **Star Atlas** (SOTY 2021) | **nessuna** | pagina unica: *«5 capitoli, senza mai una sezione, un bordo o un cambio pagina»* | `star-atlas.md` |
| 29 | **Lusion** (SOTY 2023) | intercettata | motore proprio: **niente GSAP, Lenis, Barba, React, Vue o Svelte** nel bundle. Anche la transizione e' codice loro | `lusion.md` — cercati tutti i nomi |
| 30 | **Active Theory** | intercettata | framework proprietario **Hydra**, 8 worker. Tutto dentro il canvas | `active-theory.md` |

**Conteggio: 30 siti.** Uno solo (**Revelatio**) fa navigazione a documento
intero come strategia; due sono misti (**basement**, **Simply Chocolate**);
uno non ha pagine (**Star Atlas**); gli altri 26 intercettano.

## Le tre cose che questa tabella dice

**1. La libreria dedicata e' l'eccezione, non la regola.**
Su 30 siti: Swup 1, Taxi 1, Barba 1, Highway 1, Backbone 1. **Cinque.**
Gli altri 25 usano il router del framework (11 fra Next e Nuxt/Vue) oppure
**se lo sono scritto** (Cuberto, Mana, Aristide, Hello Monday, Zajno, KODE,
Resn, Lusion, Active Theory). Un router che scambia un contenitore e aggiorna
`title` e `meta` e' **circa cento righe**, e loro le scrivono.

**2. Zero su trenta usano la View Transitions API come motore.**
Non "poche": zero. E i due casi in cui il ramo nativo era gia' in casa (Swup
su 2xA, Next su by-kin/darkroom/basement/Trionn) sono casi in cui **e' stato
lasciato spento**.

**3. Chi intercetta i click serve comunque l'HTML vero.**
Aristide Benoist serve ogni URL profondo con titolo e descrizione. Hello
Monday serve 226 KB di markup completo. Dark ha un CMS PHP che restituisce il
markup della rotta. **La navigazione intercettata e' un livello sopra un sito
che funziona senza.** Chi salta questo passaggio finisce come igloo.inc:
`<body></body>` (vedi `_CANVAS-E-GOOGLE.md`).

---

# 3. Il problema che nessuno racconta: tenere VIVA la scena WebGL

## Perche' e' il problema vero

Il pattern P1 di `_PATTERN.md` (13 siti su 16) e': **un solo `<canvas>` in
`position: fixed; inset: 0`, mai smontato, con il DOM sopra che fa da
impalcatura.** Gli elementi HTML vengono misurati con
`getBoundingClientRect()` e le loro coordinate pilotano le mesh.

Adesso mettici una navigazione. Due esiti, entrambi cattivi:

- **il canvas si distrugge a ogni pagina** → si perde il precaricamento dei
  modelli, la posizione della camera, lo stato dello shader. Il sito
  "immersivo" ridiventa una sequenza di pagine, e a ogni cambio c'e' un buco
  nero mentre il contesto si ricrea e le texture risalgono in GPU;
- **il canvas non si distrugge mai** → geometrie, materiali, texture e
  programmi della pagina vecchia restano in memoria video, e dopo sei
  progetti visitati il telefono si spegne o il browser butta giu' il contesto
  con `webglcontextlost`.

**Nessuno di questi due estremi e' la risposta.** La risposta e': **il canvas
sta fuori dal router, il contenuto della scena si smonta dentro.**

## Come lo risolvono davvero — quattro soluzioni trovate nel codice

### A) Il canvas nel layout radice, "sticky" — basement.studio

E' il caso meglio documentato della cartella, e viene dal loro **sorgente
pubblico**:

> «Il canvas 3D e' **montato una volta sola nel layout radice** e sopravvive
> alle navigazioni client (`isCanvasInPage` "sticky"). Cambiare pagina non
> ricostruisce il contesto WebGL.»
> — `basement.md`

Funziona perche' in Next App Router **`layout.tsx` non si rimonta** quando
cambia la rotta. Il canvas vive nel layout, le pagine cambiano sotto. E' lo
stesso identico principio del `containers: ["main"]` di Swup.

La camera, per basement, **e' la transizione**: `position + target + fov`
interpolati insieme, `easeInOutCubic`, 1000 ms
(`ANIMATION_DURATION = 1`, verificato in `camera-hooks.tsx`). Non c'e' nessuna
tendina: **si clicca dentro la scena**, e la telecamera ci porta.

### B) Il confine che il canvas non attraversa — sempre basement

E qui c'e' la cosa che nessun articolo racconta, ed e' scritta in un commento
nel loro codice:

> «Il passaggio Human<->Machine e' invece un **link normale, navigazione
> completa**, con un commento che spiega perche': l'albero WebGL non
> sopravvive a smontaggio e rimontaggio attraverso il confine di route group
> (*"it comes back as a black screen"*), mentre **una navigazione vera lo
> recupera dal bfcache**.»
> — `basement.md`

Tre lezioni in tre righe:

1. **Il "canvas persistente" persiste dentro un layout, non attraverso i
   layout.** Cambiare route group in Next rimonta l'albero, e un albero
   React Three Fiber rimontato torna **schermo nero**.
2. **Quando il router non ce la fa, la risposta giusta e' la navigazione
   intera**, non un hack.
3. **Il bfcache e' un alleato, non un residuo.** Una navigazione vera
   conserva l'intero stato della pagina — canvas compreso — e il tasto
   indietro la ripesca com'era. Una SPA quel regalo non ce l'ha: se lo deve
   riscrivere.

Sempre da basement, la rete di sicurezza che va copiata sempre:

> «`ErrorBoundary` attorno al canvas: se WebGL fallisce, il 3D viene rimosso,
> l'errore va a PostHog e **il sito HTML resta in piedi**.»

Stessa filosofia in Lusion: `App.initEngine()` costruisce il motore **solo
dentro `if (properties.isSupported)`**; se il contesto non si ottiene, il
motore non parte, e siccome titoli, testi e link sono HTML vero (58 KB di
markup), **resta un sito leggibile e navigabile senza 3D**.

### C) Il canvas fuori dal router perche' non c'e' router — Orano, 2xA

`orano.md`: *«Struttura in tre livelli, tutti sopra **una sola scena WebGL
continua che non viene mai smontata**»*, con il router Vue in `mode:
"history"` sopra. **Lo scroll della pagina e' la carrellata della telecamera**
(2,7 unita' su `protect`, 43,7 su `investigate`). Cambiare "pagina" e'
spostare la camera: il canvas non ha nessun motivo di smontarsi.

2xA fa la versione minima della stessa idea: il canvas della tendina e' un
**singleton** fuori da `<main>`, quindi fuori da cio' che Swup sostituisce.

```js
let instance = null;
function getShader() {
  return instance ||= new Shader(document.querySelector("[data-fade]"));
}
```

**Se il nodo che contiene il canvas non e' dentro il contenitore che il router
sostituisce, il problema non esiste.** E' una decisione di markup, non di
codice: si prende il primo giorno e non si paga mai piu'.

### D) Distruggere per bene quando si deve — Mana Yerba Mate

E' l'altra meta', ed e' la parte che quasi nessuno scrive:

> «`kill()` su ogni classe di pagina fa **`renderer.dispose()` +
> `forceContextLoss()`** e uccide tutti gli ScrollTrigger: il router AJAX
> **non lascia contesti WebGL orfani**.»
> — `mana-yerba-mate.md`

`renderer.dispose()` libera le risorse di three.js; `forceContextLoss()`
chiede esplicitamente al browser di buttare giu' il contesto WebGL. Senza il
secondo, il contesto resta appeso a un canvas staccato dal DOM finche' il
garbage collector non si degna — e i browser hanno un **tetto al numero di
contesti WebGL vivi** (nell'ordine della dozzina in Chromium): superato
quello, il browser uccide **il piu' vecchio**, cioe' magari quello che stai
guardando.

> **Non verificato:** il numero esatto del tetto. E' comportamento di
> Chromium documentato in modo informale, non nella specifica WebGL. Non
> l'ho letto oggi su una fonte primaria, quindi non lo scrivo come numero.
> Quello che e' certo e' che un tetto esiste e che `forceContextLoss()`
> serve proprio a stare sotto.

E se si sceglie la strada del canvas persistente, la disciplina di
smontaggio non sparisce, **si sposta**: resta il canvas, muoiono i suoi
contenuti. La lista completa e' quella di Trionn citata al punto 1.2:
`geometry.dispose()`, `material.dispose()` su ogni figlio via `traverse`,
`deleteProgram`, `deleteBuffer`, `detachShader`.

### La trappola dichiarata in `_PATTERN.md`, che va ripetuta

> «**Il canvas che non si smonta mai.** La scena vive per tutta la sessione,
> il DOM cambia sotto. **Trappola dichiarata:** durante la transizione i
> plane devono staccarsi dal tracking del DOM, o il render loop sovrascrive
> il tween sessanta volte al secondo.»

Cioe': se le mesh leggono `getBoundingClientRect()` a ogni fotogramma, e a
meta' transizione il DOM viene sostituito, i piani **saltano** dove sono
finiti i nuovi nodi. Va messa una bandiera che sospende il tracking dal
momento in cui la copertura e' chiusa fino al momento in cui il nuovo DOM e'
misurato.

L'attrezzo giusto e' quello di Trionn:

> «Esiste un singleton `getCanvasManager()`: `entries: Map`, metodi
> `register(fn, active, name)`, `unregister(id)`, `setActive(id, bool)`,
> `suspend/resume(id, reason)`. Il loop **non e' `requestAnimationFrame`**:
> e' `gsap.ticker.add(this.tick)`. Il ticker si rimuove da solo quando
> nessuna entry e' attiva, e il tick e' saltato quando `document.hidden`.»

**Venti righe che eliminano la classe di bug piu' comune di questi siti**
(dieci rAF concorrenti che si desincronizzano da Lenis) e che danno gratis il
`suspend` durante la transizione.

## Riassunto operativo della sezione 3

| se... | allora |
|---|---|
| il sito ha **una** scena continua | canvas nel layout radice / fuori dal contenitore del router, camera come transizione (basement, Orano) |
| ogni pagina ha **la sua** scena | canvas persistente + smontaggio dei contenuti; oppure `dispose()` + `forceContextLoss()` a ogni uscita (Mana) |
| devi attraversare un **confine** che rimonta l'albero | **navigazione a documento intero**, e ti riprendi il bfcache (basement, Human<->Machine) |
| sempre | `ErrorBoundary` sul canvas, e il sito deve reggere senza (basement, Lusion) |
| sempre | un solo ticker, con `suspend()` durante la transizione (Trionn) |

---

# 4. La transizione con elemento condiviso, in tre modi

Il caso: **una foto nella griglia del portfolio diventa l'immagine grande
della pagina progetto.** Vercel la chiama *«the most important transition
pattern: shared element morphing»*, e ha ragione sul perche': *«when an object
persists across a cut, it communicates continuity. The viewer understands
they are looking at the same thing, not a replacement.»*

## Modo 1 — Nativo: `view-transition-name`

Il piu' economico. Si da' lo **stesso nome** all'elemento nelle due pagine e
il browser fa il resto.

```css
@view-transition { navigation: auto; }
```

```html
<!-- griglia -->
<a href="/progetti/villa-brianza">
  <img src="..." style="view-transition-name: hero-villa-brianza">
</a>

<!-- pagina progetto -->
<img src="..." style="view-transition-name: hero-villa-brianza">
```

**Il problema che rende tutto meno semplice di com'e' scritto ovunque:** il
nome **deve essere unico nel documento**, e in una griglia di 18 progetti
(`_PORTFOLIO-DA-ZERO.md`: mediana 18 in catalogo) mettere 18 nomi diversi
funziona, ma appena due griglie coesistono, o appena c'e' una lista
"progetti correlati" con la stessa foto, **la transizione salta del tutto**.

La soluzione corretta e' assegnare il nome **solo all'elemento cliccato**, al
momento del click, e toglierlo dopo:

```js
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-progetto]');
  if (!a) return;
  const img = a.querySelector('img');
  img.style.viewTransitionName = 'hero';        // uno solo, sempre
  sessionStorage.setItem('vt-hero', a.dataset.progetto);
});

// nella pagina d'arrivo
const slug = sessionStorage.getItem('vt-hero');
if (slug === document.body.dataset.progetto) {
  document.querySelector('.hero img').style.viewTransitionName = 'hero';
}
sessionStorage.removeItem('vt-hero');
```

Su Chrome e Safari si puo' fare meglio con `pageswap` / `pagereveal`, che
esistono apposta e danno l'URL di destinazione. **Su Firefox no**: quegli
eventi non ci sono, e nemmeno il cross-document. Su Firefox questa
transizione **semplicemente non avviene** — che e' il degrado accettabile,
non un errore, perche' senza transizione la navigazione funziona lo stesso.

**Verdetto:** su un sito multipagina statico o CMS, con 4 righe di CSS e 15
di JS, e' la scelta giusta. Su un sito con una scena WebGL sotto, non serve a
niente (vedi modo 3).

## Modo 2 — GSAP Flip, dentro un router intercettato

Serve che il DOM vecchio e quello nuovo **coesistano per un istante**, quindi
serve una navigazione intercettata (Swup, Taxi, Barba, Next, Nuxt).

```js
// 1. fotografo lo stato PRIMA che il DOM cambi
const state = Flip.getState('.card-cliccata img');

// 2. il router sostituisce il contenitore
await router.swap();

// 3. sposto il nodo dentro la nuova posizione e lo lascio cadere
const hero = document.querySelector('.hero-immagine');
hero.appendChild(document.querySelector('.card-cliccata img'));

Flip.from(state, {
  duration: 0.8,
  ease: 'power3.inOut',
  absolute: true,
  scale: true,
});
```

**Chi lo fa nella cartella:** Lando Norris ha **Flip** fra i plugin GSAP
confermati nel bundle (`_CODICE-PUBBLICO-3.md`), e Mosby's Files fa la
versione CSS 3D dello stesso concetto — la copertina della cartella che gira
di `rotateY: 0 -> -180deg` in `power3.inOut` 1,5 s, con
`backface-visibility: hidden` e la faccia interna a `rotateX(180deg)`.

**Vantaggi su modo 1:** controllo totale della curva, nessun limite di
unicita', funziona su **tutti** i browser, si puo' interrompere.
**Costo:** GSAP + Flip (gratuiti dal 30/04/2025, versione 3.13 — vedi
`_LIBRERIE-DEGLI-STUDI.md`, con l'avvertenza che **non sono open source**), e
il fatto che serve gia' un router intercettato con tutti i suoi oneri.

**La trappola:** `Flip.getState()` fotografa la posizione **rispetto al
viewport**. Se fra la fotografia e il `Flip.from()` lo scroll si muove — e si
muove sempre, perche' la pagina nuova parte in cima — l'animazione parte da
un posto sbagliato. Va fatto con `absolute: true` e con lo scroll **gia'
azzerato prima** di fotografare, oppure compensando a mano.

## Modo 3 — L'elemento condiviso non esiste: e' la camera che si muove

E' la risposta dei siti che hanno gia' una scena WebGL, ed e' la ragione per
cui i modi 1 e 2 non compaiono quasi mai nella cartella.

Se la foto del portfolio **e' gia' un piano nella scena Three.js**, non c'e'
nessun elemento da far volare da una pagina all'altra: c'e' una telecamera da
spostare. E' basement:

> Camera, cambio pagina: `position` + `target` + **`fov`** insieme, stato
> (rotta), `easeInOutCubic`, 1000 ms (`ANIMATION_DURATION = 1`),
> `lerpVectors` su posizione e target, interpolazione lineare sul `fov`.
> VERIFICATO in `camera-hooks.tsx`.

E' Orano, dove *«lo scroll della pagina **e'** la carrellata della
telecamera»*. E' il modello di transizione piu' costoso da costruire e **il
solo che non si puo' imitare con il CSS**: e' quello che si vende.

Variante povera ma efficacissima, per chi non ha una scena: **la transizione
e' un contenuto**, non un passaggio. La tendina a **retino Bayer 8x8 +
rumore simplex** di 2xA (uno `ShaderMaterial` su un quad ortogonale, `uProgress`
in `expo.out`, 1 s in copertura e 3 s in scoperta con `delay: 1`) non anima
nessun elemento condiviso e resta la transizione piu' memorabile del gruppo.

## Confronto secco

| | modo 1 (nativo) | modo 2 (Flip) | modo 3 (camera / shader) |
|---|---|---|---|
| serve un router? | **no** (cross-document) | si' | si' (o nessuna pagina) |
| browser | Chrome/Safari; Firefox no | tutti | tutti (con WebGL) |
| peso | ~0 | GSAP + Flip | la scena |
| unicita' del nome | **vincolo duro** | nessuno | non esiste |
| interrompibile | no (salta alla fine) | si' | si' |
| quando | sito CMS / vetrina / e-commerce | portfolio con router | sito immersivo |

---

# 5. Il tasto INDIETRO e la posizione dello scorrimento

**E' l'errore piu' comune di tutti, e si trova in un sito premiato.**

## L'errore

Da `_PRELOADER.md`, il codice di entrata di **Lando Norris**, Site of the
Year 2025:

```js
function PP(page) {
  setTimeout(() => { pageTransitionIn() }, 500);
  window.scrollTo(0, 0);            // <-- qui
  ...
}
```

`window.scrollTo(0, 0)` a **ogni** entrata di pagina. Il che e' giusto quando
si va avanti (clicchi un progetto: vuoi partire dall'alto) e **sbagliato
quando si torna indietro**: hai scorso fino al dodicesimo progetto, apri,
torni indietro, e sei di nuovo in cima alla griglia. Su un portfolio con 18
lavori e' il modo piu' rapido per far chiudere la scheda.

## Perche' succede, meccanicamente

1. Il browser di suo ha `history.scrollRestoration === 'auto'` e **ripristina
   da solo** la posizione: su una navigazione a documento intero, gratis, e
   con il bfcache anche l'intero stato della pagina.
2. Appena metti un router intercettato, il browser continua a fare il suo
   ripristino — **ma lo fa sul documento vecchio**, perche' il contenuto nuovo
   non c'e' ancora. Risultato: salti a caso.
3. Allora si mette `history.scrollRestoration = 'manual'`, che spegne il
   ripristino automatico. **E qui il 90% dei siti si ferma**, perche' adesso
   "non salta piu'" e sembra a posto: in realta' si e' spento il ripristino e
   non lo si e' riscritto.

## Come si fa bene

```js
// una volta sola
history.scrollRestoration = 'manual';

// PRIMA di lasciare la pagina: salvo la posizione su QUESTA voce di cronologia
function primaDiUscire() {
  const stato = { ...history.state, y: lenis ? lenis.scroll : window.scrollY };
  history.replaceState(stato, '');
}

// DOPO che il nuovo contenuto e' nel DOM e le immagini hanno una dimensione
function dopoEssereEntrato(isPop) {
  const y = isPop ? (history.state?.y ?? 0) : 0;   // indietro = ripristino, avanti = cima
  if (lenis) lenis.scrollTo(y, { immediate: true });
  else window.scrollTo(0, y);
  ScrollTrigger.refresh();                          // e SOLO adesso
}
```

Le quattro cose che vanno nell'ordine giusto:

1. **Salvare su `history.replaceState`, non in una variabile.** Se salvi in
   memoria, tre pagine indietro hai perso tutto. Lo stato di cronologia
   sopravvive anche al ricaricamento e alla condivisione del link.
2. **Distinguere "indietro" da "avanti".** L'unico modo pulito e'
   l'evento `popstate` (o `navigation`, dove c'e'): un click su un link
   azzera lo scroll, un `popstate` lo ripristina. Chi non fa questa
   distinzione o rompe l'indietro o fa aprire i progetti a meta' pagina.
3. **Ripristinare DOPO che il contenuto ha altezza.** Se le immagini non
   hanno `width`/`height` o `aspect-ratio` nel CSS, al momento del ripristino
   il documento e' piu' corto della posizione salvata, il browser tronca a
   `scrollHeight`, e finisci **piu' in alto** di dove eri. **E' la causa
   numero uno dei "quasi giusti".**
4. **`ScrollTrigger.refresh()` alla fine, non prima.** Se lo chiami prima di
   aver ripristinato lo scroll, tutti gli `start`/`end` sono calcolati sulla
   posizione sbagliata e le animazioni partono gia' finite.

E il punto che riguarda **Lenis** (6 siti su 16 di `_PATTERN.md`): impostare
`window.scrollTop` non basta, perche' il valore interpolato di Lenis lo
riscrive al fotogramma dopo. Serve `lenis.scrollTo(y, { immediate: true })`.
`darkroom.engineering` — che Lenis l'ha scritto — durante ogni transizione fa
**`lenis.stop()`** e riavvia in `onAfterEnter`: e' lo stesso problema, risolto
spegnendo il motore mentre il DOM balla.

**Nota su Swup:** il `SwupScrollPlugin` gestisce lo scroll da solo. 2xA lo
istanzia con `{ animateScroll: false }` — cioe' salto secco, niente
scorrimento animato: **la scelta giusta**, perche' un ripristino animato
mentre la tendina si scioglie e' esattamente il "sito che sbatte".

## Come si verifica che funzioni — la prova in otto passaggi

Non si verifica leggendo il codice. Si verifica cosi', ogni volta:

1. Griglia progetti, scorri **fino in fondo**, apri l'ultimo, **Indietro**.
   → devi rivedere l'ultimo progetto **esattamente dov'era**.
2. Ripeti **con la cache svuotata** e la rete a "Slow 4G" nei DevTools. Se le
   immagini arrivano dopo il ripristino, atterri piu' in alto: e' il caso 3
   di sopra.
3. Indietro **tre volte di fila**, veloce. Nessun salto, nessuna transizione
   che si accavalla.
4. **Avanti** (il tasto avanti del browser). Quasi nessuno lo prova, e quasi
   sempre e' rotto.
5. **Ricarica (F5) a meta' pagina**, poi Indietro. Lo stato salvato in memoria
   non c'e' piu': se hai usato `replaceState` funziona lo stesso.
6. **Apri un link in una scheda nuova**, torna sulla prima, Indietro.
7. **Sul telefono**: gesto di scorrimento dal bordo (indietro nativo iOS e
   Android). Su iOS il gesto e' *interattivo*: se la transizione dura 1
   secondo, il dito e' gia' arrivato in fondo. Le transizioni lunghe qui si
   vedono per quello che sono.
8. **bfcache**: DevTools Chrome, pannello *Application → Back/forward cache →
   Test back/forward cache*. Ti dice se la pagina e' idonea e, se non lo e',
   **perche'** (una `unload`, una connessione aperta, un `Cache-Control:
   no-store`). Su una navigazione a documento intero il bfcache **e' la
   transizione all'indietro**: se lo perdi, ricarichi tutto — canvas
   compreso.

## L'argomento piu' forte a favore della navigazione vera

Su una navigazione a documento intero **il ripristino dello scorrimento e il
bfcache sono gratis, corretti e li ha scritti il browser**, non tu. E il
cross-document `@view-transition` copre esplicitamente il caso `traverse`,
cioe' **anche l'indietro e' animato**, senza una riga di JavaScript.

Un router intercettato, per arrivare allo stesso risultato, deve riscrivere a
mano: salvataggio della posizione, distinzione avanti/indietro, attesa
dell'altezza del contenuto, `ScrollTrigger.refresh()` nell'ordine giusto, e
la conservazione dello stato che il bfcache darebbe da solo. **Sono le otto
prove della lista qui sotto, moltiplicate per ogni pagina nuova che il
cliente aggiunge dal CMS.**

**Il caso Revelatio** merita una riga, perche' e' l'unico che nella cartella
ha gestito la cosa per iscritto: il flag della transizione va in
`sessionStorage`, e viene **consumato subito** — *«se non la si cancellasse,
un ricaricamento…»* — piu' un controllo su `pageshow` con `event.persisted`
per riconoscere quando la pagina **non e' stata ricaricata ma ripescata dal
bfcache**. E un controllo che sembra banale e non lo e':

```js
if (link.href === window.location.href) return;   // non coprire lo schermo
                                                  // per ricaricare la stessa pagina
```

---

# 6. Cosa vede Google, cosa sente un lettore di schermo

Dettaglio in `_CANVAS-E-GOOGLE.md` (il crawler) e `_ACCESSIBILITA.md` (focus e
annunci). Qui solo la parte che riguarda il cambio pagina.

## Google

**Il punto e' semplice e non e' negoziabile: se l'URL esiste ed e' servito
dal server con il suo contenuto, la transizione e' irrilevante.** Googlebot
non clicca i tuoi link con il mouse: fa una richiesta HTTP per ogni URL che
trova. Il tuo router non entra mai in funzione.

Quindi **l'unica domanda vera e': cosa risponde il server a `curl` su
`/progetti/villa-brianza`?**

- **Revelatio**: navigazione vera, ogni pagina e' una pagina. Nessun problema.
- **Aristide Benoist**: SPA con `pushState`, **ma** *«il server serve davvero
  ogni URL profondo con il suo `<title>` e la sua `<meta description>`,
  quindi la SEO regge»* (`aristide-benoist.md`).
- **Hello Monday**: 226 KB di markup completo dal server, router client sopra.
- **Persepolis**: **3,7 KB di HTML e un `<div id="app">`.** Il contenuto non
  esiste finche' non gira il JavaScript.

Il terzo caso e' il modello, il quarto e' il rischio. Perche' — da
`_CANVAS-E-GOOGLE.md` — Google **renderizza** (100% delle pagine, mediana 10
secondi di ritardo, 90esimo percentile ~3 ore), ma i **crawler delle AI no**:
ChatGPT, Claude e Perplexity si fermano all'HTML della prima risposta.

Tre regole per una navigazione intercettata:

1. **Ogni rotta deve essere un URL vero servito dal server.** Niente hashbang
   (Resn: `#!/work` — nel 2026 non si fa piu'), niente rotte che esistono solo
   in JavaScript.
2. **Aggiorna `<title>`, `<meta name="description">`, `<link rel="canonical">`
   e l'OpenGraph a ogni cambio rotta.** Il `SwupHeadPlugin` fa esattamente
   questo (2xA lo carica), Cuberto se lo e' scritto
   (`updateSelectors: ["title","meta",...]`). Chi non lo fa condivide sempre
   la home su WhatsApp.
3. **La `<link rel="prefetch">` sull'hover e' gratis e cambia la percezione
   piu' della transizione.** Mosby usa `NuxtLink` con
   `prefetch-on="interaction"`; Barba e Swup hanno il plugin apposta. Se la
   pagina e' gia' in cache quando la tendina finisce, la transizione "e'
   veloce" senza aver accorciato nulla.

## Lettori di schermo

Qui il problema e' reale e non lo risolve nessuna API: **quando il DOM cambia
senza che il documento si ricarichi, il lettore di schermo non se ne accorge.**

Su una navigazione a documento intero il browser fa tutto: annuncia il nuovo
titolo, riporta il focus all'inizio del documento, il fumetto virtuale
riparte. **Su una navigazione intercettata non succede niente**: il focus resta
appeso al link cliccato — che nel frattempo e' stato rimosso dal DOM, e allora
il focus casca su `<body>` — e chi non vede non ha modo di sapere che e'
cambiato qualcosa.

Le tre cose da fare, nell'ordine:

```html
<!-- fisso nel documento, mai sostituito dal router -->
<div id="annuncio-rotta" aria-live="polite" aria-atomic="true" class="sr-only"></div>
```

```js
function dopoIlCambioRotta(nuovoTitolo) {
  document.title = nuovoTitolo;                    // 1. il titolo
  document.getElementById('annuncio-rotta')
          .textContent = `${nuovoTitolo} — pagina caricata`;   // 2. l'annuncio

  const h1 = document.querySelector('main h1');    // 3. il focus
  h1.setAttribute('tabindex', '-1');
  h1.focus({ preventScroll: true });               // preventScroll: obbligatorio
}
```

- Il contenitore `aria-live` **deve stare fuori dal contenitore sostituito**,
  altrimenti lo sostituisci insieme al resto e non annuncia nulla.
- `preventScroll: true` non e' un dettaglio: senza, il `focus()` scrolla la
  pagina e ti distrugge il ripristino della sezione 5.
- Se il router e' Swup, **c'e' gia': lo `SwupA11yPlugin`** fa annuncio e
  focus. 2xA lo carica, ed e' il primo dei cinque plugin nella lista.
  *Questo e' il motivo migliore per scegliere una libreria invece di
  scriversi il router: non l'animazione, l'accessibilita'.*

E il punto che vale per la transizione stessa, da `_ACCESSIBILITA.md` (dove
*«su 34 schede, una sola dichiara strumenti di gestione del focus»* —
Locomotive, con `focus-trap` e `tabbable`):

- **la copertura deve essere `aria-hidden="true"` e `pointer-events: none`**,
  o diventa un ostacolo nell'ordine di lettura;
- **`prefers-reduced-motion` deve accorciare la transizione a zero**, non
  nasconderla: con durata zero il contenuto si scambia di colpo, che e' il
  comportamento nativo. Nuxt lo fa da solo con `viewTransition: true` (e non
  con `'always'`); Next e la View Transitions API **no**, va scritto;
- durante la transizione **il tab non deve entrare nel contenuto vecchio**.
  Se lo smontaggio arriva a fine animazione (2xA:
  `hooks.on("animation:out:end", () => this.destroyComponents())`), per un
  secondo intero ci sono **due pagine nel DOM**, ed entrambe sono tabbabili.

---

# 7. La regola pratica: quando NON vale la pena

**Il criterio.** Una transizione di pagina serve a una cosa sola: **coprire
un'attesa che ci sarebbe comunque, e dirti che il posto in cui stai andando e'
collegato a quello da cui vieni.** Se non c'e' attesa da coprire e non c'e'
niente da collegare, **stai aggiungendo tempo, non togliendolo.**

## Non vale la pena quando:

**1. Il sito ha meno di quattro pagine.** Il lavoro (router, cleanup,
ripristino scroll, annunci, aggiornamento dei meta, i test della sezione 5)
e' fisso; il beneficio scala col numero di navigazioni. Su una landing con
la sezione contatti in fondo, **non serve niente**.

**2. Il collo di bottiglia e' la rete, non il passaggio.** Se la pagina di
destinazione arriva in 2 secondi, la tua tendina da 0,6 s non copre niente:
la vedi finire e poi aspetti. **Prima il prefetch, poi la transizione.** Un
`prefetch` sull'hover fa piu' della piu' bella delle coperture.

**3. E' un e-commerce nella fase di acquisto.** In `_PATTERN.md` e nelle
schede commerciali (`opal-tadpole.md`, `vero.md`, `mana-yerba-mate.md`) il
gesto che porta i soldi e' sempre **immediato**. Opal Tadpole manda al
checkout con `window.location.href = checkoutUrl` — navigazione secca, zero
animazione. Simply Chocolate tiene lo showroom animato e il **checkout
WooCommerce a pagine normali**. Nessuno mette una tendina da un secondo fra
il carrello e il pagamento.

**4. Il pubblico e' su Android di fascia media e la transizione fa girare
WebGL.** Il costo non e' la transizione: e' quello che ci hai messo dentro. La
tendina a shader di 2xA e' un contesto WebGL in piu' che vive per tutta la
sessione. Sul desktop e' gratis, su un telefono con altre due scene attive no.

**5. La navigazione e' il tasto indietro.** Su iOS il gesto dal bordo e'
interattivo e diretto: qualunque transizione di 800 ms lo fa sembrare
inceppato. **Sull'indietro si va secchi, o si va molto piu' corti.** Next per
altro non ti da' scelta: *«browser-initiated back navigations do not carry a
transition type»*.

**6. Il cliente vuole "l'effetto" ma non paga il resto.** Il costo vero non e'
l'animazione — quella e' `revelatio.md`, **60 righe**. Il costo e' tutto
quello che viene dietro: cleanup, `title`/`meta`, annunci ARIA, focus,
ripristino scroll, bfcache, otto test manuali a ogni pagina nuova.
**Se il budget copre solo l'animazione, si fa la navigazione a documento
intero con una copertura CSS. E' quello che ha fatto Revelatio, e ha vinto un
Site of the Day.**

**7. Non c'e' nessuno che poi la mantenga.** Un router intercettato e' un
pezzo di infrastruttura: ogni pagina nuova che il cliente aggiunge dal CMS
deve rispettare il contenitore, i data-attribute e le classi. Da
`_RICORRENTE.md`: dei **dieci guasti in produzione trovati su nove studi
premiati**, quelli di questa famiglia sono i piu' silenziosi — non danno
errore, semplicemente una pagina non si anima piu' e nessuno se ne accorge
per mesi.

## Sempre, invece:

- **il prefetch sull'hover** — costa niente, si sente subito;
- **`prefers-reduced-motion`** — obbligo, non gentilezza (European
  Accessibility Act, `_ACCESSIBILITA.md`);
- **una copertura che non blocchi l'interazione**
  (`::view-transition { pointer-events: none }`, o `pointer-events: none`
  sulla tua tendina);
- **far partire la pagina prima che la copertura sia via** — mediana ~450 ms
  sui siti misurati (`_PRELOADER.md`), ed e' il trucco piu' economico
  dell'intero mestiere.

## La scelta in cinque righe

| situazione | strada |
|---|---|
| vetrina / CMS, 4-10 pagine, nessun canvas | **navigazione vera + `@view-transition`** (4 righe di CSS), oppure la tendina di Revelatio se serve Firefox |
| portfolio con foto che diventa eroe, gia' con GSAP | **Swup + GSAP Flip** |
| gia' su Next 16 App Router | **`<ViewTransition>` di React**, wrapper nelle `page.tsx`, `default="none"` |
| gia' su Nuxt | `app.pageTransition` con `mode: 'out-in'` + tendina, `experimental.viewTransition` solo se accetti il "sperimentale" |
| sito immersivo con scena WebGL continua | **canvas nel layout radice, la camera E' la transizione**; e una navigazione intera dove l'albero non sopravvive |
| e-commerce, dal carrello in poi | **niente** |

---

## Cosa e' verificato e cosa no

**Verificato oggi, su fonte primaria:**
- tutte le versioni di supporto browser (MDN browser-compat-data, ramo `main`,
  file `api/ViewTransition.json`, `css/at-rules/view-transition.json`,
  `css/properties/view-transition-name.json`, `view-transition-class.json`,
  `api/Navigation.json`, `api/Window.json`, `css/selectors/active-view-transition-type.json`);
- le percentuali d'uso (caniuse, `features-json/view-transitions.json`
  → `usage_perc_y: 90.2`; `cross-document-view-transitions.json`
  → `usage_perc_y: 84.54`, `usage_perc_a: 1.74`);
- versioni, date e download di Swup / Barba / Taxi / Highway (registro npm +
  feed `.atom` dei commit GitHub, letti il 13/08/2026);
- le citazioni da nextjs.org (guida "Designing view transitions", versione
  16.3.0, aggiornata 07/08/2026), react.dev (`<ViewTransition>`),
  nuxt.com (transizioni) e developer.chrome.com (view transitions,
  pagine *same-document* e *cross-document*): da quest'ultima vengono il
  vincolo same-origin, il **timeout di quattro secondi**, l'elenco dei tipi
  di navigazione coperti da `navigation: auto` e `<link rel="expect"
  blocking="render">`.

**Preso dalle schede di questa cartella** (che a loro volta dichiarano
VERIFICATO / SUPPOSTO al proprio interno): tutto il capitolo 2, il codice di
2xA, Lando Norris, Revelatio, basement, Trionn, Mana, Cuberto, Frans Hals.
**Non ho riaperto i bundle: mi fido delle schede.**

**Non verificato, e segnalato come tale:**
- il numero massimo di contesti WebGL simultanei in Chromium (esiste un
  tetto, non ho letto oggi il numero su una fonte primaria);
- se Firefox 147 e Safari 26.2 — le versioni che BCD indica per la Navigation
  API — siano effettivamente le versioni stabili distribuite oggi: ho letto i
  numeri di versione, non le date di rilascio;
- il comportamento reale delle transizioni sotto `prefers-reduced-motion` sui
  siti schedati: nella cartella e' rilevato **per assenza della stringa nel
  codice**, non provato nel browser;
- i frammenti di codice delle sezioni 4, 5 e 6 sono **scritti da me** a
  partire dai meccanismi documentati: sono ricette, non estratti da siti
  esistenti. Quelli estratti dai siti sono citati con il file di provenienza.

**Una contraddizione interna alla cartella, da sanare:** `lando-norris.md`
dice *«router: fetch + `pushState` custom (non Barba, non Swup)»*, mentre
`_CODICE-PUBBLICO-3.md` e `_PRELOADER.md` documentano `data-taxi` /
`data-taxi-view`, cioe' **@unseenco/taxi**. La prova piu' forte e' quella dei
data-attribute nel markup: **e' Taxi.js**.
