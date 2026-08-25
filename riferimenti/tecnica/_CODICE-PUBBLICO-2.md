# Codice sorgente pubblicamente leggibile — Blocco 2

Dieci studi gia' analizzati: **Basement, Darkroom, TRIONN, Revelatio, 2xA, Zajno, Cuberto, Noomo, by-kin, Mosby's Files**.

Per ognuno quattro strade:
1. **Repository GitHub** del sito o dell'organizzazione;
2. **Sourcemap** (`//# sourceMappingURL=`) con `sourcesContent` — i sorgenti veri;
3. **Bundle non minificati** finiti in produzione;
4. **Librerie e starter** pubblicati dallo studio.

> Metodo: API GitHub e download diretti via `curl`/`urllib`. Nessun browser condiviso.
> Rilevazione: **13 agosto 2026**. Le sourcemap e gli hash dei bundle cambiano a ogni deploy: i percorsi qui sotto vanno riverificati, il *metodo* resta.

---

## Il verdetto in una riga

Tre bottini veri, e sono tre tipi diversi di bottino:

- **Basement** — il repo del sito e' pubblico **e in piu' il sito serve le sourcemap complete in produzione**: 74 file `.tsx/.ts` dell'applicazione ricostruiti, piu' l'inventario esatto delle dipendenze con le versioni. E' la cosa piu' vicina a "aprire il progetto di qualcun altro".
- **Revelatio** — 18 script vanilla in chiaro, commentati, ognuno un effetto isolato e riusabile. E' il bottino piu' *copiabile* subito.
- **Cuberto + Darkroom** — non il sito, ma le officine: 12 librerie web Cuberto e la famiglia Lenis/Tempus/hamo/satus di Darkroom, tutte MIT e utilizzabili in produzione.

Gli altri sei (TRIONN, 2xA, Zajno, Noomo, by-kin, Mosby's) sono **chiusi**: bundle minificati, nessuna sourcemap, nessun repo. Assenza verificata, non presunta.

---

## 1. Le organizzazioni GitHub — quadro d'insieme

| Studio | Org GitHub | Esiste | Repo pubblici | Nota |
|---|---|---|---|---|
| Basement | `basementstudio` | Si | **49** | Il sito attuale e' open source |
| Darkroom | `darkroomengineering` | Si | **50** | Lenis, Tempus, hamo, satus + il vecchio sito |
| Cuberto | `Cuberto` | Si | **28** | 12 librerie web + demo commentate |
| Revelatio | `revelatio` | Si | 11 | Ma e' backend vecchio (2017-2023), **non** il sito |
| Zajno | `Zajno` | Si | 10 | Template e utility interne, nessun sito |
| TRIONN | — | **No** | — | Nessuna org ne' utente con quel nome |
| Noomo | — | **No** | — | `noomoagency` non esiste |
| by-kin | — | **No** | — | `by-kin` non esiste |
| Mosby's Files | — | **No** | — | `mosbyfiles` non esiste |
| 2xA | — | **No** | — | Nessuna org corrispondente |

Nota sulle maiuscole: `Zajno` e `Cuberto` rispondono 404 in minuscolo sull'endpoint `/orgs/`. Vanno cercati con la capitalizzazione giusta o via `/users/`. E' una trappola che fa dichiarare "assente" qualcosa che c'e'.

---

## 2. BASEMENT — il bottino grosso (due strade su quattro)

### 2.1 Repository: `basementstudio/website-2k25`

- **URL**: https://github.com/basementstudio/website-2k25
- **Stelle**: 252 · **fork**: 36
- **Ultimo push**: **2026-08-13** (lo stesso giorno della rilevazione — vivo, non un archivio)
- **Licenza**: **nessuna** — attenzione: "pubblicamente leggibile" non vuol dire "riutilizzabile". Senza licenza vale il diritto d'autore pieno. Si studia, non si copia.
- **Dimensione**: ~62 MB · TypeScript
- **Descrizione**: "The basement.studio website"

Confermato: pubblico e vivo, come da nota di partenza.

### 2.2 SOURCEMAP — la strada che ha reso di piu'

**Il sito serve le sourcemap complete in produzione.** Su 31 chunk analizzati, **30 hanno `//# sourceMappingURL=`** e **tutte le map hanno `sourcesContent` popolato**.

- **Dove**: `https://basement.studio/_next/static/immutable/chunks/<hash>.js` → `<hash>.js.map` nella stessa cartella
- **Peso delle map**: da 8 KB a **1,73 MB** l'una (`2wxsq_ipq07gp.js.map`, 519 sorgenti dentro)
- **Bottino**: **1934 file sorgente unici**, di cui **74 file applicativi** (il resto e' `node_modules`)

Esempio di una singola map:

```
1733962b  sources= 519  sourcesContent=SI 519   2wxsq_ipq07gp.js.map
1050612b  sources= 215  sourcesContent=SI 215   33sxnn-bc_-y9.js.map
 827169b  sources= 258  sourcesContent=SI 258   3k_c7zsim3tu8.js.map
```

**I 74 file applicativi ricostruiti** (i piu' grossi):

| Byte | Percorso |
|---|---|
| 15.738 | `src/components/layout/navbar-content.tsx` |
| 13.845 | `src/lib/audio/index.ts` |
| 12.767 | `src/hooks/use-site-audio.ts` |
| 10.598 | `src/components/contact/contact-screen.tsx` |
| 10.230 | `src/components/navigation-handler/index.tsx` |
| 8.516 | `src/components/layout/shared-sections.tsx` |
| 6.653 | `src/components/layout/stay-connected.tsx` |
| 6.608 | `src/components/layout/mode-toggle.tsx` |
| 5.184 | `src/hooks/use-handle-navigation.ts` |
| 5.147 | `src/hooks/use-preload-assets.ts` |
| 4.843 | `src/components/contact/contact-canvas.tsx` |
| 4.667 | `src/components/custom-cursor/index.tsx` |
| 4.031 | `worker/browser/createWorker.ts` |
| 3.900 | `src/hooks/use-ambience-playlist.ts` |
| 3.287 | `src/components/primitives/image-with-video-overlay.tsx` |
| 3.246 | `src/components/loading/loading-canvas.tsx` |
| 3.040 | `src/components/inspectables/inspectable-viewer.tsx` |

più `contact-store.ts`, `navigation-store.ts`, `use-focus-trap.ts`, `use-mouse.ts`, `use-device-detect.ts`, `posthog-provider.tsx`, `canvas-layer.tsx`, `app-loading-handler.tsx`, `brands-mobile.tsx`, `showcase-image.tsx`, `not-found.tsx`, `global-error.tsx`.

**Tre cose interessanti viste dentro:**

1. **Il motore audio e' scritto a mano su Web Audio API, non e' una libreria.** `src/lib/audio/index.ts` definisce una classe `AudioSource` che gestisce `AudioBufferSourceNode`, un `GainNode` di output per sorgente collegato a un `masterOutput`, e tiene `startedAt`/`pausedAt` per fare pausa/ripresa vera su un buffer source (che di suo non si puo' mettere in pausa). Ha `pitch` via `playbackRate`, `loop`, e flag semantici `isSFX` / `isGameAudio` / `isOverrideSong` — cioe' una gerarchia di priorita' tra musica ambiente e effetti.

2. **Gli effetti sonori sono tipizzati con template literal types**, e il tipo stesso racconta il sito:
   ```ts
   export type SiteAudioSFXKey =
     | "BASKETBALL_THROW" | "BASKETBALL_NET" | "BASKETBALL_THUMP"
     | "TIMEOUT_BUZZER"   | "BASKETBALL_STREAK"
     | `ARCADE_BUTTON_${number}_PRESS`  | `ARCADE_BUTTON_${number}_RELEASE`
     | `ARCADE_STICK_${number}_PRESS`   | `ARCADE_STICK_${number}_RELEASE`
     | `BLOG_LOCKED_DOOR_${number}`     | `BLOG_DOOR_${number}_OPEN`
     | `BLOG_LAMP_${number}_PULL`       | `BLOG_LAMP_${number}_RELEASE`
   ```
   C'e' un canestro giocabile, un arcade con pulsanti e joystick, e porte e lampade nel blog. Il tipo TypeScript e' la mappa dell'esperienza.

3. **Stato globale con zustand, non context.** `use-site-audio.ts` importa `create` da `zustand` e incrocia `useArcadeStore`, `useCurrentScene`, `useIsOnTab` — quest'ultimo per zittire l'audio quando il tab perde il fuoco. Piu' `react-compiler-runtime@1.0.0` tra le dipendenze: usano il React Compiler.

### 2.3 Inventario esatto delle dipendenze (dalle sourcemap, con versioni)

Le map espongono i percorsi `pnpm`, quindi si legge lo stack reale con i numeri di versione:

| Peso nel bundle | File | Pacchetto |
|---|---|---|
| 1.621.452 b | 147 | **next@16.3.0** |
| 903.688 b | 391 | **@sanity/ui@3.2.0** |
| 397.129 b | 178 | **motion-dom@12.42.0** |
| 271.656 b | 237 | @sanity/icons@3.7.4 |
| 214.072 b | 62 | @sanity/visual-editing@5.4.4 |
| 199.410 b | 1 | **valibot@1.3.1** |
| 185.634 b | 69 | rxjs@7.8.2 |
| 162.038 b | 7 | **xstate@5.32.2** |
| 147.955 b | 56 | styled-components@6.4.1 |
| 141.852 b | 58 | **framer-motion@12.42.0** |
| 100.652 b | 42 | @sanity/mutate@0.18.1 |
| 89.513 b | 125 | lodash@4.18.1 |
| 29.954 b | 14 | @sanity/client@7.23.0 |
| 12.430 b | 1 | **react-compiler-runtime@1.0.0** |

45 pacchetti distinti. Da leggere cosi': **Next 16 + Sanity come CMS (con visual editing live) + Motion per le animazioni + xstate per le macchine a stati + valibot per la validazione**. Niente GSAP in questo bundle.

### 2.4 Le librerie pubblicate da Basement

| Repo | Stelle | Ultimo push | Licenza | Cos'e' | Usabile da noi? |
|---|---|---|---|---|---|
| **scrollytelling** | 1629 | 2024-02-22 | NOASSERTION | Animazioni scrollytelling con React + GSAP | Si, ma **fermo da 2 anni** e richiede licenza GSAP per alcuni plugin |
| **xmcp** | 1310 | 2026-07-28 | MIT | Framework TypeScript per MCP | Si — fuori tema web design |
| **shader-lab** | 663 | 2026-08-12 | Apache-2.0 | **Toolkit per creare, impilare e animare shader** | **Si, e' vivo e Apache-2.0** |
| **basement-laboratory** | 367 | 2025-09-11 | nessuna | Il loro laboratorio di esperimenti | Da studiare, non da riusare |
| **basement-grotesque** | 336 | 2023-03-06 | OFL-1.1 | Il loro carattere tipografico | **Si, OFL** |
| **commerce-toolkit** | 288 | 2025-09-24 | MIT | Storefront | Si |
| **next-typescript** | 192 | 2024-09-09 | nessuna | Il loro starter Next | Fermo |
| **next-real-viewport** | 124 | 2023-10-30 | nessuna | Risolve `100vw`/`100vh` su mobile | Utile ma vecchio |
| **ogl-starter** | 14 | 2025-12-15 | nessuna | Starter per progetti OGL | Piccolo, recente |

---

## 3. REVELATIO — 18 script vanilla in chiaro (il bottino piu' copiabile)

**Correzione alla nota di partenza: gli script sono 18, non 17.**

- **Dove**: `https://revelatio.vercel.app/scripts/<nome>.js`
- **Totale scaricato**: **180 KB, 18 file**
- **Salvati in**: `C:\Users\Giuseppe\Webingegno\ricerca-siti\_codice\revelatio-scripts\`
- **Stato**: non minificati, indentati, con commenti — **in portoghese** (studio brasiliano)
- **Perche' esistono**: il sito e' **Webflow**, e Vercel serve gli script custom che Webflow da solo non puo' ospitare. Alcuni file hanno in testa le istruzioni di installazione su Webflow, classe per classe.

### L'elenco completo, con cosa fa ciascuno

| File | Peso | Righe | Cosa fa |
|---|---|---|---|
| `video-ascii.js` | 28.719 b | 747 | **Il pezzo forte.** Effetto ASCII su video in **WebGL puro** (niente librerie): compila vertex/fragment shader a mano, costruisce un *glyph atlas* su canvas 2D (52px, weight 700) e lo passa come texture, piu' uno zoom legato allo scroll e un trail di 24 posizioni |
| `ascii-logo-footer.js` | 28.542 b | 558 | Rende il logo (SVG inline, versione desktop + versione mobile quadrata) come arte ASCII animata nel footer. Ha in testa le istruzioni Webflow: `.footer_logo` a `width:100%, height:10em, position:relative`, con override `[data-ascii-logo]` e `data-ascii-align` |
| `odometer.js` | 13.067 b | 403 | Contatori numerici a rullo con GSAP. Rispetta `prefers-reduced-motion`, usa `IntersectionObserver` invece di ScrollTrigger (commento nel codice: *"more reliable than ScrollTrigger for this case"*), con stagger per elemento (0.1) e per cifra (0.04) |
| `preloader.js` | 10.127 b | 334 | Preloader con blocco totale dello scroll: `history.scrollRestoration = 'manual'`, `forceTop()` su `pageshow` e `load`, e `position:fixed` sul body durante il caricamento |
| `mobile-menu.js` | 9.820 b | 331 | Menu mobile a schermo intero con testo scramble (`^$%#@!&*?+=`), inietta il proprio CSS, guardia anti-doppia-init via `window.__revelatioMobileMenuInit` |
| `testimonials.js` | 7.167 b | 274 | Carosello testimonianze con reveal riga per riga; le immagini entrano con `clip-path: circle(0% → 50%)` |
| `color-inversion.js` | 7.058 b | 282 | Tema chiaro/scuro via variabili CSS (`--tbg`, `--tfg`, `--tline`, piu' varianti a 60% e 40%) iniettate a runtime, con transizione 0.35s su background, color, border, fill e stroke |
| `drag-marquee.js` | 6.403 b | 185 | Marquee infinito trascinabile. **Esplicitamente riscritto senza GSAP**: il commento dice che non dipende da GSAP/ScrollTrigger/Observer perche' *"nao existe corrida de carregamento de libs"* — niente gara di caricamento tra librerie. Aspetta `document.fonts.ready` e le immagini prima di misurare la larghezza |
| `scramble-text.js` | 6.247 b | 254 | Testo scramble su scroll con GSAP `ScrambleTextPlugin` + `SplitText` + `ScrollTrigger` |
| `projects-filter.js` | 6.092 b | 181 | Filtro progetti per tag con transizioni cronometrate (out 340ms, in 520ms, stagger 80ms, gap 70ms) |
| `services-item-entrance.js` | 4.978 b | 165 | Entrata riga per riga delle voci servizi, con offset via custom property `--services-entrance-y` |
| `scramble-cursor.js` | 3.353 b | 110 | Cursore con testo scramble; ha un caso speciale `confidential` in giallo `#ffd166` per i progetti sotto NDA. Scala 0.02 → 1 |
| `circle-cursor.js` | 2.940 b | 85 | Cursore a cerchio che segue il mouse 1:1 **senza smooth**, in `mix-blend-mode: difference`. Si disattiva se `(hover:hover) and (pointer:fine)` non e' soddisfatto |
| `page-transition.js` | 2.637 b | 112 | Transizione tra pagine: copre con `.transition-cover` nero a `z-index 99999`, fade 0.6s `power2.inOut`, esclude i link `target="_blank"` |
| `news-swiper.js` | 2.631 b | 99 | Wrapper su Swiper 11 per la sezione news, con stili per i pulsanti disabilitati |
| `brazil-time.js` | 2.502 b | 100 | Orologio doppio: ora locale del visitatore (da `Intl.DateTimeFormat().resolvedOptions().timeZone`) accanto all'ora di `America/Sao_Paulo` |
| `locations-highlight.js` | 2.041 b | 69 | Prende una lista di citta' separate da virgola, la spezza in `<span>` e ne accende l'opacita' (0.08 → 1) in base allo scroll |
| `image-trail.js` | 1.974 b | 77 | Scia di immagini che seguono il mouse, con clonazione a distanza fissa (mezza larghezza della card) |

### Tre cose interessanti viste dentro

1. **Due volte hanno scelto vanilla contro GSAP, e hanno scritto perche'.** `drag-marquee.js` dichiara in testa che e' stato rifatto senza GSAP per eliminare la corsa al caricamento delle librerie; `odometer.js` scarta ScrollTrigger in favore di `IntersectionObserver` perche' "piu' affidabile in questo caso". E' un promemoria: su Webflow, dove le librerie arrivano da CDN in ordine non garantito, il vanilla e' piu' robusto.

2. **Il pattern di installazione su Webflow e' documentato nel codice stesso.** `ascii-logo-footer.js` apre con un blocco di commento che elenca i passi: che classe usare, che dimensioni darle, dove incollare il tag `<script defer>`. E' il modello esatto di come si vende un effetto a un cliente Webflow senza toccare il suo progetto.

3. **La guardia anti-doppia-init e' sistematica**: `window.__revelatioPreloaderInit`, `__revelatioMobileMenuInit`, `__revelatioServicesItemEntranceInit`, `__revelatioAsciiInit`. Su Webflow gli script possono essere eseguiti due volte (page transition, editor); loro hanno standardizzato la difesa.

### Altre strade per Revelatio

- **GitHub `revelatio`**: esiste ma **non c'entra**. 11 repo di backend/CLI del 2017-2023 (`rvl-pipe`, `rvl-pipe-express`, `rvl-pipe-mongodb`, `revelatio-cli`), massimo 5 stelle. Probabilmente nemmeno lo stesso soggetto. **Nessun codice del sito.**
- **Sourcemap**: assenti. Il resto del sito e' Webflow (`webflow.2e1ed329.*.js` minificato) + GSAP 3.15 da CDN + Swiper 11 + jQuery 3.5.1.
- `https://revelatio.vercel.app/` (la root) risponde **404**: e' un deploy che serve solo la cartella `/scripts/`.

---

## 4. DARKROOM — niente sorgenti del sito, ma l'officina migliore

### 4.1 Il sito: chiuso

- **17 chunk** analizzati su `darkroom.engineering`: Next.js con **turbopack**, tutti minificati (da 1.250 a 251.074 byte), **zero `sourceMappingURL`**.
- I chunk portano `?dpl=dpl_BNxrnRcFkSDLVecrpCqxBcAnC6R6` (identificativo di deploy Vercel).
- **Assenza dichiarata: nessuna sourcemap, nessun bundle leggibile per il sito attuale.**

### 4.2 Ma il sito *precedente* e' open source

- **`darkroomengineering/sf-website`** — https://github.com/darkroomengineering/sf-website
- 139 stelle · 16 fork · **ultimo push 2024-10-11** · **nessuna licenza** · 57 MB
- Descrizione: *"Our website, open source."* — e' il sito di quando si chiamavano **Studio Freight** (homepage dichiarata: `studiofreight.com`).
- Vale come archeologia: e' l'unico modo di leggere il sito di uno studio di questo livello scritto da loro, anche se e' la versione di due anni fa.

### 4.3 Le librerie — verifica, vitalita', usabilita'

| Libreria | Stelle | Fork | Issue aperte | Ultimo push | Licenza | Cos'e' | **Usabile da noi?** |
|---|---|---|---|---|---|---|---|
| **lenis** | **15.396** | 661 | 23 | **2026-08-11** | **MIT** | Smooth scroll. Lo standard di fatto del settore | **Si, senza riserve.** Vivo, MIT, supporto vanilla/react/vue. Homepage: lenis.dev |
| **satus** | **979** | 89 | 1 | **2026-08-12** | **MIT** | Starter Next.js App Router per siti editoriali | **Si.** E' il piu' interessante per noi: topic dichiarati = `nextjs, approuter, gsap, lenis, react-three-fiber, sanity`. E' lo scheletro di un sito da fascia alta, gia' montato |
| **aniso** | 440 | 39 | 7 | 2026-06-04 | **MIT** | Strumento ASCII open source: da immagine ad arte a caratteri, WebGL | **Si.** Vivo, MIT, ha un sito demo (aniso.darkroom.engineering) |
| **tempus** | 327 | 7 | 2 | **2026-07-29** | **MIT** | Un solo `requestAnimationFrame` per tutta l'app | **Si.** Piccolo (689 KB), fa una cosa sola. Da usare insieme a Lenis |
| **hamo** | 312 | 13 | 4 | **2026-07-29** | **MIT** | Raccolta di hook React ("hook, do the math") | **Si**, ma e' comodita', non infrastruttura |
| **elastica** | 52 | 4 | **17** | 2026-07-10 | **MIT** | Motore fisico 2D per corpi rigidi, con binding React | **Con cautela**: 17 issue aperte su 52 stelle e' un rapporto alto. Progetto giovane |
| **react-lenis** | 223 | 12 | 0 | 2024-05-29 | **nessuna** | Wrapper React di Lenis | **No, e' superato**: il supporto React e' stato assorbito dentro `lenis`. Fermo dal 2024 e senza licenza |
| **compono** | 70 | — | — | 2024-01-12 | nessuna | I loro componenti su npm | Fermo |
| **cc-settings** | 42 | — | — | **2026-08-12** | MIT | Configurazione Claude Code (agenti, skill, hook) dello studio | Curiosita' istruttiva: pubblicano anche il loro setup di lavoro con l'AI |

**Lo stack Darkroom da adottare, in ordine**: `lenis` (scroll) + `tempus` (un solo rAF) + `satus` (impalcatura Next). Tutti MIT, tutti aggiornati nell'ultima settimana.

---

## 5. CUBERTO — nessun sorgente del sito, ma 12 librerie web e 9 demo spiegate

### 5.1 Il sito: chiuso

- **Bundle unico**: `https://cuberto.com/assets/js/bundle.js?v=5.6.0b4`
- **283.029 byte su UNA riga** — minificazione completa
- `sourceMappingURL`: **assente** · `bundle.js.map`: **404**
- **Assenza dichiarata.** Interessante solo il versionamento manuale `v=5.6.0b4`: gestiscono la cache a mano, non con hash di build.

### 5.2 Le librerie web (le 16 iOS/Android le salto, non ci servono)

| Repo | Stelle | Ultimo push | Licenza | Cos'e' |
|---|---|---|---|---|
| **mouse-follower** | **822** | 2023-10-23 | **MIT** | Cursori personalizzati e fluidi. La libreria per cui Cuberto e' conosciuto. Solo 70 KB |
| **reeller** | 96 | **2026-05-07** | **MIT** | Blocchi orizzontali scorrevoli (marquee) — l'unica web viva nel 2026 |
| **svg-distortion-effect-demo** | 74 | 2022-03-05 | nessuna | Come usare i filtri SVG Turbulence + Displacement Map |
| **scroll-sequence-demo** | 67 | 2022-07-06 | nessuna | Sequenza di frame legata allo scroll con SmoothScroll + GSAP ScrollTrigger |
| **html-boilerplate** | 51 | 2021-12-06 | nessuna | *"Il boilerplate che usiamo per iniziare tutti i nostri progetti"* |
| **cursor-magnetic-demo** | 51 | 2022-03-05 | nessuna | Cursore follower + effetto magnetico |
| **jellyscroll** | 37 | 2022-03-05 | nessuna | Effetto scroll "gelatina" |
| **headers-hover-demo** | 32 | 2022-03-05 | nessuna | **7 effetti hover** su titoli grandi, raccolti |
| **particles** | 28 | 2022-03-05 | nessuna | Particelle volanti |
| **marquee-effect-demo** | 27 | 2022-03-05 | nessuna | Marquee dinamico, con guida |
| **bglines** | 26 | 2022-03-05 | nessuna | Linee di sfondo dinamiche in **WebGL** |
| **transparentize-video-demo** | 20 | 2022-03-05 | nessuna | Togliere lo sfondo da un video in bianco e nero e comporlo sulla pagina |

**Tre cose interessanti:**

1. **Otto demo pubblicate nello stesso giorno, il 2022-03-05.** Non e' codice che gli e' scappato: e' un rilascio deliberato di materiale didattico, in blocco. Cuberto ha usato il codice come marketing.
2. **Le demo hanno licenza `nessuna`, le librerie hanno MIT.** Distinzione netta e voluta: `mouse-follower` e `reeller` si usano, le demo si leggono. Da rispettare.
3. **`transparentize-video-demo` e' il trucco piu' pratico del gruppo**: un video in bianco e nero usato come maschera alpha evita di dover produrre video con canale alpha (pesanti e mal supportati). E' esattamente il tipo di scorciatoia che fa sembrare costoso un sito che non lo e'.

---

## 6. Gli altri sei — assenza verificata

### TRIONN (trionn.com)
- **GitHub**: nessuna org ne' utente `trionn`. **Assente.**
- **Sourcemap**: 20 chunk unici, 14 scaricati e ispezionati. **Zero `sourceMappingURL`.** Next.js con turbopack, nomi offuscati (`0y3~cortx~or~.js`, `02m2onmcd.l.g.js`).
- **Bundle leggibile**: no. Il piu' "arioso" e' `0.t3mu8kba~-e.js` (58.740 b, ~212 caratteri per riga) — resta minificato, solo con qualche a capo.
- **Verdetto: chiuso.**

### 2xA (2xa.studio)
- **GitHub**: **assente.**
- **Bundle**: `https://2xa.studio/public/dist/assets/main-CzlVfecv.js` — **752.917 byte**, build **Vite** (si riconosce dall'hash e dal blocco `export {}` finale con centinaia di alias a due lettere).
- **Sourcemap**: `sourceMappingURL` **assente nel bundle**; `main-CzlVfecv.js.map` risponde **404**. Verificate entrambe le vie.
- Curiosita': il percorso `/public/dist/assets/` suggerisce che la cartella `public` di Vite sia stata pubblicata cosi' com'e', ma senza le map non serve.
- **Verdetto: chiuso.**

### Zajno (zajno.com)
- **GitHub `Zajno`**: esiste, 10 repo, **ma niente del sito**. Sono template e utility: `common-utils` (7 stelle, MIT, aggiornato 2026-03), `astro-site-template` (2026-04), `static-site-template`, `nextjs-template`, `common-firebase`, `common-mobx`, `rive-pages`, `eslint-config`. Tutti sotto le 10 stelle.
- **Sito**: l'HTML e' minimo (10.959 byte) con il CSS critico inline e **nessun tag `<script src>` verso un bundle proprio** — il codice viene iniettato dopo. Gli unici script esterni sono di terze parti (mixpanel, dash.js, facebook, gtag).
- **Verdetto: chiuso.** Segnalo pero' che `Zajno/astro-site-template` e `rive-pages` dicono qualcosa sul loro stack attuale (Astro + Rive).

### Noomo (noomoagency.com)
- **GitHub**: `noomoagency` **assente.**
- **Bundle**: **Nuxt** — `https://noomoagency.com/_nuxt/entry.1995ac01.js`, **839.921 byte** in un solo file. `sourceMappingURL` assente; `entry.1995ac01.js.map` → **404**.
- **Verdetto: chiuso.**

### by-kin (by-kin.com)
- **GitHub**: `by-kin` **assente.**
- **Sourcemap**: 14 chunk, 12 ispezionati, **zero map**. Next.js con webpack "classico" (hash a 16 cifre tipo `fd9d1056-004e99c214a24b4a.js`), non turbopack. La `.map` indovinata su `app/page-*.js` risponde **307** (redirect all'HTML, non una map).
- Il chunk piu' grosso e' `fd9d1056-004e99c214a24b4a.js` (172.831 b su una riga) — per dimensione e posizione e' quasi certamente **Three.js**.
- **Verdetto: chiuso.**

### Mosby's Files (mosbyfiles.com)
- **GitHub**: `mosbyfiles` **assente.**
- **Bundle**: **Nuxt, un unico file da 3.052.068 byte** (`https://mosbyfiles.com/_nuxt/DwAQhwlc.js`) — 3 MB in un chunk solo. `sourceMappingURL` assente; `.map` → **308**.
- **Verdetto: chiuso.** Nota a margine utile per il nostro lavoro: 3 MB di JavaScript in un chunk unico e' un dato di prestazioni, non di codice — vale la pena incrociarlo con `_PRESTAZIONI.md`.

---

## 7. Tabella finale

| Sito | Git | Sourcemap | Bundle leggibile | **Cosa leggere per primo** |
|---|---|---|---|---|
| **Basement** | **Si** — `basementstudio/website-2k25`, 252★, push 2026-08-13, **senza licenza** | **Si — 30/31 chunk, `sourcesContent` completo, 1934 sorgenti** | Ricostruito dalle map: 74 file `.tsx/.ts` | **`src/lib/audio/index.ts` + `src/hooks/use-site-audio.ts`** — il motore audio Web Audio scritto a mano. Poi `custom-cursor/index.tsx` e `navigation-handler/` |
| **Darkroom** | **Si** — org 50 repo; il **sito vecchio** e' `sf-website` (139★) | No — 17 chunk turbopack, zero map | No | **`satus`** (starter Next+GSAP+Lenis+R3F+Sanity, MIT, 979★) e poi il sorgente di **`lenis`** |
| **Revelatio** | Si ma **irrilevante** (backend 2017-23) | No (sito Webflow) | **Si — 18 script in chiaro, commentati, 180 KB** | **`video-ascii.js`** (ASCII in WebGL puro, 747 righe) e **`drag-marquee.js`** (perche' hanno buttato GSAP) |
| **Cuberto** | **Si** — 28 repo, 12 web | No — bundle su una riga, `.map` 404 | No | **`mouse-follower`** (822★, MIT) e la demo **`headers-hover-demo`** (7 effetti hover su titoli) |
| **Zajno** | Si ma niente sito (10 repo, template) | No | No | `astro-site-template` — solo per capire lo stack |
| **TRIONN** | **No** | **No** | No | — |
| **2xA** | **No** | **No** (`.map` 404 verificata) | No | — |
| **Noomo** | **No** | **No** (`.map` 404 verificata) | No | — |
| **by-kin** | **No** | **No** | No | — |
| **Mosby's Files** | **No** | **No** | No | — |

---

## 8. Cosa ce ne facciamo

**Da usare in produzione, subito e senza problemi legali** (tutto MIT):
`lenis` · `tempus` · `satus` · `aniso` · `Cuberto/mouse-follower` · `Cuberto/reeller` · `basementstudio/shader-lab` (Apache-2.0) · `basement-grotesque` (OFL).

**Da studiare ma NON copiare** (nessuna licenza = diritto d'autore pieno):
`website-2k25` e i sorgenti ricostruiti dalle sourcemap · `sf-website` · le 9 demo Cuberto · gli script Revelatio.
Distinzione da tenere ferma: leggere e capire e' legittimo, incollare no. Le tecniche si riusano, i file no.

**La lezione di metodo più utile:**
Su dieci studi di primo livello, **uno solo** lascia le sourcemap in produzione. Non e' la norma, e' una svista (o una scelta di trasparenza) di Basement. Ma il costo di controllare e' di pochi secondi per sito, e quando va bene si apre l'intero progetto. Vale la pena controllarlo sempre, su ogni sito che ci interessa.

**Per il nostro sito**: se non vogliamo che ci leggano, va disattivata la generazione delle sourcemap in produzione (in Next: `productionBrowserSourceMaps: false`, che e' gia' il default — Basement l'ha attivata apposta o l'ha ereditata da una configurazione turbopack).

---

## Appendice — come rifare la verifica

```bash
# 1. Org GitHub (attenzione alle maiuscole: Zajno, Cuberto)
curl -s "https://api.github.com/orgs/<org>/repos?per_page=100&sort=updated"

# 2. Sourcemap: prendi la home, estrai gli <script src>, scarica ogni chunk,
#    cerca la riga finale //# sourceMappingURL=
curl -s https://<sito>/ | grep -oE 'src="[^"]+\.js"'
curl -s <chunk.js> | grep -o 'sourceMappingURL=.*'

# 3. Se la map c'e': scaricala e controlla che abbia sourcesContent
curl -s <chunk.js.map> | python -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('sourcesContent') or []))"

# 4. Se la map NON e' dichiarata, prova comunque a indovinare l'URL: <chunk>.js.map
#    (404/307/308 = assente davvero)
```

Gli script di lavoro usati per questa ricerca (`hunt.py`, `getmaps.py`, `sum.py`, `scr.py`) sono nello scratchpad di sessione.
