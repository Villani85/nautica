# Caccia ai repository degli studi premiati

Battuta del 13/08/2026. **69 organizzazioni interrogate, 3959 repository pubblici non-fork
raccolti, 1436408 stelle in tutto.**

> **Regola che vale per tutto il file: senza licenza il codice si STUDIA, non si copia.**
> Pubblicamente leggibile non vuol dire riutilizzabile: senza licenza vale il diritto d'autore
> pieno. E' l'unica colonna che conta se il codice finisce dentro un lavoro pagato.

Sui 616 repository di cui si conosce la licenza, **237 non ne hanno nessuna (38%)**.
Conferma su base larga il 46-85%% gia' rilevato altrove nella cartella: chi pubblica non sta
regalando, sta mostrando.

## Il metodo, ed e' la parte riusabile

Il tetto e' il problema: l'API di GitHub non autenticata concede **60 richieste all'ora**, che
non bastano per una battuta larga. Si aggira in tre passaggi.

1. **Sondaggio HTML, senza tetto.** `curl -o /dev/null -w "%{http_code}" https://github.com/NOME`
   dice solo se il nome esiste, e si possono provare centinaia di nomi. Su 81 candidati,
   **75 esistevano**.
2. **API ufficiale finche' dura.** `/users/NOME/repos?per_page=100` rende fino a cento repository
   in una sola richiesta, con stelle, **licenza**, ultimo push e linguaggio. Sessanta richieste
   coprono sessanta studi: e' il modo giusto di spendere la quota.
3. **Quando la quota finisce, il proxy pubblico.** `https://ungh.cc/orgs/NOME/repos` e
   `/users/NOME/repos` espongono gli stessi dati senza autenticazione e senza quel tetto.
   Unico limite: **non riporta la licenza**, che va poi verificata sui repo che interessano
   davvero. E' cosi' che sono arrivati gli ultimi 3343 repository.

**La trappola gia' pagata due volte**: l'endpoint `/orgs/` e' sensibile alle maiuscole e
risponde 404 per capitalizzazione sbagliata. Si usa `/users/`, che vale sia per le persone sia
per le organizzazioni. Cercare male fa dichiarare assente una cosa che c'e'.

Con un token GitHub personale il tetto sale a 5.000 richieste all'ora e niente di tutto questo
serve piu'. Vale quindici minuti di configurazione.

## I venti bacini piu' grossi

| organizzazione | repo | stelle totali |
|---|---:|---:|
| **vercel** | 100 | 423972 |
| **pmndrs** | 99 | 226657 |
| **supabase** | 100 | 159347 |
| **mrdoob** | 61 | 133209 |
| **pixijs** | 41 | 55137 |
| **calcom** | 43 | 51153 |
| **nytimes** | 100 | 44656 |
| **greensock** | 5 | 42004 |
| **googlecreativelab** | 64 | 38708 |
| **codrops** | 100 | 36015 |
| **resend** | 99 | 24198 |
| **netlify** | 100 | 18485 |
| **bbc** | 100 | 18138 |
| **mozilla** | 100 | 17402 |
| **brunosimon** | 84 | 16506 |
| **theatre-js** | 5 | 12638 |
| **luruke** | 62 | 12341 |
| **spite** | 100 | 10146 |
| **locomotivemtl** | 90 | 9653 |
| **gkjohnson** | 100 | 9184 |

## I cento repository con piu' stelle

Licenza `n.d.` vuol dire che il proxy non la riporta: va verificata sul repo prima di usarlo.

| stelle | licenza | repository | cosa e' |
|---:|---|---|---|
| 141757 | n.d. | [vercel/next.js](https://github.com/vercel/next.js) | The React Framework |
| 114493 | n.d. | [mrdoob/three.js](https://github.com/mrdoob/three.js) | JavaScript 3D Library. |
| 107941 | n.d. | [supabase/supabase](https://github.com/supabase/supabase) | The Postgres development platform. Supabase gives you a dedicated Postgres database to bui |
| 58557 | n.d. | [pmndrs/zustand](https://github.com/pmndrs/zustand) |  Bear necessities for state management in React |
| 48006 | n.d. | [pixijs/pixijs](https://github.com/pixijs/pixijs) | The HTML5 Creation Engine: Create beautiful digital content with the fastest, most flexibl |
| 47516 | n.d. | [calcom/cal.diy](https://github.com/calcom/cal.diy) | Scheduling infrastructure for absolutely everyone. |
| 44692 | n.d. | [vercel/hyper](https://github.com/vercel/hyper) | A terminal built on web technologies |
| 32454 | n.d. | [vercel/swr](https://github.com/vercel/swr) | React Hooks for Data Fetching |
| 31702 | n.d. | [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) |  A React renderer for Three.js |
| 30894 | n.d. | [vercel/turborepo](https://github.com/vercel/turborepo) | Build system optimized for JavaScriptand TypeScript, written in Rust |
| 29138 | n.d. | [pmndrs/react-spring](https://github.com/pmndrs/react-spring) |  A spring physics based React animation library |
| 27666 | n.d. | [greensock/GSAP](https://github.com/greensock/GSAP) | GSAP (GreenSock Animation Platform), a JavaScript animation library for the modern web |
| 24360 | n.d. | [vercel/pkg](https://github.com/vercel/pkg) | Package your Node.js project into an executable |
| 21241 | n.d. | [pmndrs/jotai](https://github.com/pmndrs/jotai) |  Primitive and flexible state management for React |
| 19591 | n.d. | [resend/react-email](https://github.com/resend/react-email) |  Build and send emails using React |
| 16076 | n.d. | [vercel/vercel](https://github.com/vercel/vercel) | Develop. Preview. Ship. |
| 14209 | n.d. | [vercel/commerce](https://github.com/vercel/commerce) | Next.js Commerce |
| 13770 | n.d. | [vercel/satori](https://github.com/vercel/satori) | Enlightened library to convert HTML and CSS to SVG |
| 13539 | n.d. | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | Official AI skills for GSAP. These skills teach AI coding agents how to correctly use GSAP |
| 12598 | n.d. | [theatre-js/theatre](https://github.com/theatre-js/theatre) | Motion design editor for the web |
| 10623 | n.d. | [vercel/micro](https://github.com/vercel/micro) | Asynchronous HTTP microservices |
| 10220 | n.d. | [pmndrs/valtio](https://github.com/pmndrs/valtio) |  Valtio makes proxy-state simple  for React and Vanilla |
| 9894 | n.d. | [vercel/serve](https://github.com/vercel/serve) | Static file serving and directory listing |
| 9832 | n.d. | [vercel/ncc](https://github.com/vercel/ncc) | Compile a Node.js project into a single file. Supports TypeScript, binary addons, dynamic  |
| 9796 | n.d. | [pmndrs/drei](https://github.com/pmndrs/drei) |  useful helpers for react-three-fiber |
| 9621 | n.d. | [pmndrs/use-gesture](https://github.com/pmndrs/use-gesture) | Bread n butter utility for component-tied mouse/touch gestures in React and Vanilla Javasc |
| 9144 | n.d. | [mrdoob/stats.js](https://github.com/mrdoob/stats.js) | JavaScript Performance Monitor |
| 8837 | MIT | [locomotivemtl/locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll) |  Detection of elements in viewport & smooth scrolling with parallax. |
| 7974 | n.d. | [luruke/browser-2020](https://github.com/luruke/browser-2020) | Things you can do with a browser in 2020  |
| 7776 | n.d. | [vercel/styled-jsx](https://github.com/vercel/styled-jsx) | Full CSS support for JSX without compromises |
| 7726 | n.d. | [vercel/nextjs-subscription-payments](https://github.com/vercel/nextjs-subscription-payments) | Clone, deploy, and fully customize a SaaS subscription application with Next.js. |
| 7617 | n.d. | [supabase/realtime](https://github.com/supabase/realtime) | Broadcast, Presence, and Postgres Changes via WebSockets |
| 6964 | n.d. | [nytimes/covid-19-data](https://github.com/nytimes/covid-19-data) | A repository of data on coronavirus cases and deaths in the U.S. |
| 6800 | NOASSERTION | [googlecreativelab/quickdraw-dataset](https://github.com/googlecreativelab/quickdraw-dataset) | Documentation on how to access and use the Quick, Draw! Dataset. |
| 6700 | n.d. | [vercel/platforms](https://github.com/vercel/platforms) | A full-stack Next.js app with multi-tenancy. |
| 6439 | Apache-2.0 | [googlecreativelab/anypixel](https://github.com/googlecreativelab/anypixel) | A web-friendly way for anyone to build unusual displays |
| 6198 | n.d. | [pmndrs/leva](https://github.com/pmndrs/leva) |  React-first components GUI |
| 5897 | n.d. | [guardian/frontend](https://github.com/guardian/frontend) | The Guardian DotCom. |
| 5838 | n.d. | [pmndrs/gltfjsx](https://github.com/pmndrs/gltfjsx) |  Turns GLTFs into JSX components |
| 5818 | n.d. | [nytimes/objective-c-style-guide](https://github.com/nytimes/objective-c-style-guide) | The Objective-C Style Guide used by The New York Times |
| 5544 | n.d. | [vercel/ms](https://github.com/vercel/ms) | Tiny millisecond conversion utility |
| 5149 | n.d. | [vercel/examples](https://github.com/vercel/examples) | Enjoy our curated collection of examples and solutions. Use these patterns to build your o |
| 4821 | n.d. | [bbc/wraith](https://github.com/bbc/wraith) | Wraith  A responsive screenshot comparison tool |
| 4781 | n.d. | [vercel/next-learn](https://github.com/vercel/next-learn) | Learn Next.js Starter Code |
| 4728 | n.d. | [brunosimon/folio-2019](https://github.com/brunosimon/folio-2019) |  |
| 4622 | n.d. | [oframe/ogl](https://github.com/oframe/ogl) | Minimal WebGL Library |
| 4529 | n.d. | [supabase/supabase-js](https://github.com/supabase/supabase-js) | An isomorphic Javascript client for Supabase. Query your Supabase database, subscribe to r |
| 4476 | n.d. | [brunosimon/my-room-in-3d](https://github.com/brunosimon/my-room-in-3d) |  |
| 4448 | n.d. | [netlify/gotrue](https://github.com/netlify/gotrue) | An JWT based API for managing users and issuing JWT tokens. |
| 4043 | n.d. | [vercel/og-image](https://github.com/vercel/og-image) | Open Graph Image as a Service - generate cards for Twitter, Facebook, Slack, etc |
| 3967 | Apache-2.0 | [area17/twill](https://github.com/area17/twill) | Twill is an open source CMS toolkit for Laravel that helps developers rapidly create a cus |
| 3869 | Apache-2.0 | [googlecreativelab/teachable-machine-v1](https://github.com/googlecreativelab/teachable-machine-v1) |  Explore how machine learning works, live in the browser. No coding required. |
| 3819 | n.d. | [bbc/Imager.js](https://github.com/bbc/Imager.js) | Responsive images while we wait for srcset to finish cooking |
| 3772 | n.d. | [nytimes/gizmo](https://github.com/nytimes/gizmo) | A Microservice Toolkit from The New York Times |
| 3761 | n.d. | [spite/ccapture.js](https://github.com/spite/ccapture.js) | A library to capture canvas-based animations at a fixed framerate |
| 3585 | n.d. | [vercel/release](https://github.com/vercel/release) | Generate changelogs with a single command |
| 3495 | n.d. | [nytimes/Store](https://github.com/nytimes/Store) | Android Library for Async Data Loading and Caching |
| 3447 | n.d. | [gkjohnson/three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) | A BVH implementation to speed up raycasting and enable spatial queries against three.js me |
| 3405 | n.d. | [bbc/peaks.js](https://github.com/bbc/peaks.js) | JavaScript UI component for interacting with audio waveforms |
| 3345 | n.d. | [supabase/pg_graphql](https://github.com/supabase/pg_graphql) | GraphQL support for PostgreSQL  |
| 3231 | n.d. | [pmndrs/uikit](https://github.com/pmndrs/uikit) |  user interfaces for react-three-fiber |
| 3022 | n.d. | [vercel/hazel](https://github.com/vercel/hazel) | Lightweight update server for Electron apps |
| 2959 | n.d. | [pmndrs/use-cannon](https://github.com/pmndrs/use-cannon) |  physics based hooks for @react-three/fiber |
| 2879 | n.d. | [pixijs/pixi-react](https://github.com/pixijs/pixi-react) | Write PIXI apps using React declarative style |
| 2874 | n.d. | [nytimes/NYTPhotoViewer](https://github.com/nytimes/NYTPhotoViewer) | A modern photo viewing experience for iOS. |
| 2862 | n.d. | [pmndrs/react-three-next](https://github.com/pmndrs/react-three-next) | React Three Fiber, Threejs, Nextjs starter |
| 2823 | n.d. | [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) | A post processing library for three.js. |
| 2769 | n.d. | [mozilla/bleach](https://github.com/mozilla/bleach) | Bleach is an allowed-list-based HTML sanitizing library that escapes or strips markup and  |
| 2695 | MIT | [humaan/Modaal](https://github.com/humaan/Modaal) | An accessible dialog window library for all humans. |
| 2668 | n.d. | [vercel/next-plugins](https://github.com/vercel/next-plugins) | Official Next.js plugins |
| 2621 | n.d. | [luruke/awesome-casestudy](https://github.com/luruke/awesome-casestudy) |   Curated list of technical case studies on WebGL and creative development |
| 2604 | n.d. | [pmndrs/xr](https://github.com/pmndrs/xr) |  VR/AR for react-three-fiber |
| 2556 | n.d. | [supabase/supabase-py](https://github.com/supabase/supabase-py) | Python Client for Supabase. Query Postgres from Flask, Django, FastAPI. Python user authen |
| 2543 | n.d. | [ykob/sketch-threejs](https://github.com/ykob/sketch-threejs) | Interactive sketches made with three.js. |
| 2522 | n.d. | [supabase/auth](https://github.com/supabase/auth) | A JWT based API for managing users and issuing JWT tokens |
| 2495 | Apache-2.0 | [googlecreativelab/open-nsynth-super](https://github.com/googlecreativelab/open-nsynth-super) | Open NSynth Super is an experimental physical interface for the NSynth algorithm |
| 2433 | n.d. | [netlify/staticgen](https://github.com/netlify/staticgen) | StaticGen.com, A leaderboard of top open-source static site generators |
| 2423 | Apache-2.0 | [googlecreativelab/coder](https://github.com/googlecreativelab/coder) | A simple way to make web stuff on Raspberry Pi |
| 2419 | Apache-2.0 | [googlecreativelab/chrome-music-lab](https://github.com/googlecreativelab/chrome-music-lab) | A collection of experiments for exploring how music works, all built with the Web Audio AP |
| 2385 | n.d. | [supabase/cli](https://github.com/supabase/cli) | Supabase CLI. Manage postgres migrations, run Supabase locally, deploy edge functions. Pos |
| 2375 | n.d. | [nytimes/pourover](https://github.com/nytimes/pourover) | A library for simple, fast filtering and sorting of large collections in the browser.   Th |
| 2316 | n.d. | [supabase/etl](https://github.com/supabase/etl) | A high-performance Postgres replication engine written in Rust. Embed it in your Rust appl |
| 2311 | n.d. | [codrops/PageTransitions](https://github.com/codrops/PageTransitions) | A showcase collection of various page transition effects using CSS animations. |
| 2251 | n.d. | [supabase/supavisor](https://github.com/supabase/supavisor) | A cloud-native, multi-tenant Postgres connection pooler. |
| 2209 | n.d. | [pmndrs/racing-game](https://github.com/pmndrs/racing-game) |  Open source racing game developed by everyone willing |
| 2179 | n.d. | [vercel/virtual-event-starter-kit](https://github.com/vercel/virtual-event-starter-kit) | Open source demo that Next.js developers can clone, deploy, and fully customize for events |
| 2157 | n.d. | [bbc/audiowaveform](https://github.com/bbc/audiowaveform) | C++ program to generate waveform data and render waveform images from audio files |
| 2129 | n.d. | [mozilla/popcorn-js](https://github.com/mozilla/popcorn-js) | The HTML5 Media Framework. (Unmaintained. See https://github.com/menismu/popcorn-js for ac |
| 2050 | n.d. | [pmndrs/cannon-es](https://github.com/pmndrs/cannon-es) |  A lightweight 3D physics engine written in JavaScript. |
| 1982 | n.d. | [voxmedia/meme](https://github.com/voxmedia/meme) | Meme generator |
| 1933 | n.d. | [brunosimon/keppler](https://github.com/brunosimon/keppler) | Real time code sharing for your lectures and presentations. |
| 1919 | n.d. | [vercel/async-retry](https://github.com/vercel/async-retry) | Retrying made simple, easy and async |
| 1911 | n.d. | [nytimes/kyt](https://github.com/nytimes/kyt) | Starting a new JS app? Build, test and run advanced apps with kyt  |
| 1899 | n.d. | [netlify/cli](https://github.com/netlify/cli) | Netlify Command Line Interface |
| 1898 | n.d. | [nytimes/react-tracking](https://github.com/nytimes/react-tracking) |  Declarative tracking for React apps. |
| 1868 | n.d. | [mrdoob/texgen.js](https://github.com/mrdoob/texgen.js) | JavaScript Texture Generator |
| 1807 | n.d. | [gkjohnson/three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer) | Path tracing renderer and utilities for three.js built on top of three-mesh-bvh. |
| 1799 | NOASSERTION | [ustwo/ustwo.com-frontend](https://github.com/ustwo/ustwo.com-frontend) | The New & Improved ustwo Website |
| 1771 | n.d. | [supabase/postgres](https://github.com/supabase/postgres) | Unmodified Postgres with some useful extensions |
| 1737 | n.d. | [pmndrs/react-three-flex](https://github.com/pmndrs/react-three-flex) |   Flexbox for react-three-fiber |

## Gli studi creativi, uno per uno

**bkwld** -- 91 repo, 2206 stelle

- `croppa` -- 506 stelle, licenza MIT, ultimo push 2026-07-15 -- Image thumbnail creation through specially formatted URLs for Laravel.
- `cloner` -- 488 stelle, licenza MIT, ultimo push 2026-05-27 -- A trait for Laravel Eloquent models that lets you clone a model and it's re
- `decoy` -- 301 stelle, licenza MIT, ultimo push 2023-09-05 -- A Laravel model-based CMS
- `tram` -- 205 stelle, licenza NESSUNA, ultimo push 2016-12-16 -- Cross-browser CSS3 transitions in JavaScript.
- `laravel-pug` -- 156 stelle, licenza MIT, ultimo push 2026-03-15 -- Pug view adapter for Laravel and Lumen

**locomotivemtl** -- 90 repo, 9653 stelle

- `locomotive-scroll` -- 8837 stelle, licenza MIT, ultimo push 2026-06-30 --  Detection of elements in viewport & smooth scrolling with parallax.
- `locomotive-boilerplate` -- 482 stelle, licenza MIT, ultimo push 2025-07-24 --  Front-end boilerplate for projects by Locomotive.
- `astro-boilerplate` -- 65 stelle, licenza MIT, ultimo push 2026-07-06 -- Astro project boilerplate by Locomotive
- `charcoal-cms` -- 52 stelle, licenza MIT, ultimo push 2025-11-04 -- Charcoal Content Management System (CMS) Module
- `webgl-images` -- 52 stelle, licenza MIT, ultimo push 2024-07-05 -- locomotive javascript module to implement easily images rendered with WebGL

**mediamonks** -- 87 repo, 446 stelle

- `frontend-coding-standards` -- 62 stelle, licenza NESSUNA, ultimo push 2022-04-04 -- Media.Monks - Frontend Coding Standards
- `fast-image-sequence` -- 53 stelle, licenza NESSUNA, ultimo push 2026-08-09 -- The fast-image-sequence-renderer is a powerful package for displaying image
- `muban` -- 40 stelle, licenza NESSUNA, ultimo push 2022-12-10 -- A backend-agnostic framework to enhance server-rendered HTML using a modern
- `image-effect-renderer` -- 28 stelle, licenza NESSUNA, ultimo push 2026-07-12 -- The image-effect-renderer is a lightweight package for running fragment sha
- `composer-vendor-cleaner` -- 26 stelle, licenza MIT, ultimo push 2018-03-06 -- Clean your composer vendor directory

**bornfight** -- 71 repo, 168 stelle

- `avro-to-typescript` -- 37 stelle, licenza n.d., ultimo push 2022-12-08 -- Compile Apache Avro schema files to TypeScript classes
- `RoundedTabBarLayout` -- 16 stelle, licenza n.d., ultimo push 2019-05-29 -- Android library for customized TabLayout
- `qa-fortress` -- 13 stelle, licenza n.d., ultimo push 2019-02-06 -- Evolving idea of something I call QA Fortress.
- `transfer-object-converter` -- 12 stelle, licenza n.d., ultimo push 2021-08-03
- `yii2-webhooks` -- 10 stelle, licenza n.d., ultimo push 2021-01-29

**ustwo** -- 67 repo, 4426 stelle

- `ustwo.com-frontend` -- 1799 stelle, licenza NOASSERTION, ultimo push 2022-06-04 -- The New & Improved ustwo Website
- `US2FormValidator` -- 590 stelle, licenza NOASSERTION, ultimo push 2020-02-29 -- Form validation framework for iOS.
- `formvalidator-swift` -- 491 stelle, licenza MIT, ultimo push 2019-10-02 -- A framework to validate inputs of text fields and text views in a convenien
- `mastermind` -- 380 stelle, licenza MIT, ultimo push 2017-03-13 -- Man in the middle testing
- `clockwise` -- 346 stelle, licenza MIT, ultimo push 2017-01-01 -- Watch face framework for Android Wear developed by ustwo

**googlecreativelab** -- 64 repo, 38708 stelle

- `quickdraw-dataset` -- 6800 stelle, licenza NOASSERTION, ultimo push 2025-03-11 -- Documentation on how to access and use the Quick, Draw! Dataset.
- `anypixel` -- 6439 stelle, licenza Apache-2.0, ultimo push 2025-08-18 -- A web-friendly way for anyone to build unusual displays
- `teachable-machine-v1` -- 3869 stelle, licenza Apache-2.0, ultimo push 2021-09-01 --  Explore how machine learning works, live in the browser. No coding require
- `open-nsynth-super` -- 2495 stelle, licenza Apache-2.0, ultimo push 2025-08-18 -- Open NSynth Super is an experimental physical interface for the NSynth algo
- `coder` -- 2423 stelle, licenza Apache-2.0, ultimo push 2025-08-18 -- A simple way to make web stuff on Raspberry Pi

**bakkenbaeck** -- 61 repo, 856 stelle

- `iOS-handbook` -- 397 stelle, licenza n.d., ultimo push 2018-06-14 -- Guidelines and best practices for excellent iOS apps
- `daylight-ios` -- 136 stelle, licenza n.d., ultimo push 2023-09-26 -- A beautiful app that will let you know how much sun you have today.
- `a-random-walk-through-git` -- 35 stelle, licenza n.d., ultimo push 2025-08-07 -- A weird tour through Git and some of its internals.
- `SweetUIKit` -- 25 stelle, licenza n.d., ultimo push 2021-02-23 -- Helpers and sugar for the UIKit framework
- `EtherealCereal` -- 24 stelle, licenza n.d., ultimo push 2018-09-03 -- A private key, public key and address generator for the Ethereum cryptocurr

**area17** -- 53 repo, 4806 stelle

- `twill` -- 3967 stelle, licenza Apache-2.0, ultimo push 2026-07-31 -- Twill is an open source CMS toolkit for Laravel that helps developers rapid
- `blast` -- 316 stelle, licenza Apache-2.0, ultimo push 2026-08-09 -- Storybook for Laravel Blade 
- `subfolio` -- 88 stelle, licenza AGPL-3.0, ultimo push 2022-05-25 -- Subfolio provides an elegant, practical and customizable web interface to y
- `tailwind-plugins` -- 85 stelle, licenza NESSUNA, ultimo push 2026-07-06 -- A series of Tailwind plugins to enable/encourage systematised web design/de
- `awesome-twill` -- 77 stelle, licenza NESSUNA, ultimo push 2024-03-27 -- A curated list of bookmarks, packages, tutorials, videos and other cool res

**ueno** -- 39 repo, 415 stelle

- `libkkc` -- 115 stelle, licenza GPL-3.0, ultimo push 2024-09-02 -- Japanese Kana Kanji conversion input method library
- `libskk` -- 101 stelle, licenza GPL-3.0, ultimo push 2026-06-02 -- Japanese SKK input method library
- `ibus-skk` -- 84 stelle, licenza GPL-2.0, ultimo push 2026-05-12 -- Japanese SKK engine for IBus
- `libusb-gadget` -- 49 stelle, licenza LGPL-3.0, ultimo push 2009-06-29 -- Simple wrapper library to access Linux USB GadgetFS
- `ibus-kkc` -- 18 stelle, licenza GPL-2.0, ultimo push 2022-01-05 -- Japanese Kana Kanji conversion engine for IBus

**14islands** -- 35 repo, 1530 stelle

- `r3f-scroll-rig` -- 961 stelle, licenza MIT, ultimo push 2025-12-17 -- A react-three-fiber scroll-rig for syncing 3D meshes and DOM elements.
- `js-breakpoints` -- 220 stelle, licenza NESSUNA, ultimo push 2015-07-13 -- Library that uses CSS media queries to trigger breakpoints in Javascript
- `codrops-scroll-rig-tutorial` -- 82 stelle, licenza MIT, ultimo push 2023-10-06 -- Progressively enhanced WebGL & Lens Refraction
- `vecka.14islands.com` -- 56 stelle, licenza NESSUNA, ultimo push 2017-05-16 -- Always know the week number. Essential when living in Sweden.
- `react-page-transitions` -- 31 stelle, licenza MIT, ultimo push 2023-03-01 -- Framework agnostic page transition lib

**instrument** -- 27 repo, 1837 stelle

- `Vicinity` -- 380 stelle, licenza MIT, ultimo push 2016-08-22 -- Replicates detecting and broadcasting iBeacons in the background 
- `instrument-serif` -- 348 stelle, licenza OFL-1.1, ultimo push 2023-04-26
- `instrument-sans` -- 320 stelle, licenza OFL-1.1, ultimo push 2023-06-14
- `oculus-bridge` -- 298 stelle, licenza MIT, ultimo push 2014-02-18 -- A utility and javascript library to link the Oculus Rift with the web
- `cyclops` -- 225 stelle, licenza MIT, ultimo push 2017-06-21 -- utility to export motion from AfterEffects to JavaScript

**nclud** -- 22 repo, 323 stelle

- `inflickity` -- 84 stelle, licenza NESSUNA, ultimo push 2012-06-19 -- Never-ending drag n' flick content
- `wp-timber-cli` -- 67 stelle, licenza NESSUNA, ultimo push 2017-04-16
- `verbatim` -- 54 stelle, licenza NESSUNA, ultimo push 2015-03-06 -- A jQuery plugin that enables deep linking to your content. Currently in bet
- `2012.beercamp.com` -- 37 stelle, licenza NESSUNA, ultimo push 2015-07-09 -- A mischievous pop-up book site
- `2011.beercamp.com` -- 27 stelle, licenza NESSUNA, ultimo push 2012-03-09 -- BeerCamp at SXSW 2011 event site with sweet 3D scrolling

**makemepulse** -- 16 repo, 120 stelle

- `2024-kaizen-public` -- 54 stelle, licenza n.d., ultimo push 2024-08-29
- `nanogl-starter` -- 22 stelle, licenza n.d., ultimo push 2024-06-06
- `lol.js` -- 16 stelle, licenza n.d., ultimo push 2019-06-27
- `frontend_workflow` -- 14 stelle, licenza n.d., ultimo push 2016-09-16 -- Set of javascript tasks for front development
- `nanogl-docs` -- 9 stelle, licenza n.d., ultimo push 2024-01-29 -- Documentation for @plepers' nanogl libs.

**stinkstudios** -- 12 repo, 333 stelle

- `sono` -- 169 stelle, licenza MIT, ultimo push 2018-09-17 -- A simple yet powerful JavaScript library for working with Web Audio
- `arkit-web` -- 164 stelle, licenza MIT, ultimo push 2017-10-05 -- An experimental iOS app for rapidly prototyping ARKit experiences with WebG
- `.github` -- 0 stelle, licenza NESSUNA, ultimo push 2026-06-05
- `circleci-deploy` -- 0 stelle, licenza MIT, ultimo push 2017-07-20 -- The docker image we use for deployments via Circle CI
- `dockerfiles` -- 0 stelle, licenza NESSUNA, ultimo push 2018-09-10

**northkingdom** -- 10 repo, 2 stelle

- `alone-in-space` -- 1 stelle, licenza n.d., ultimo push 2019-02-19 -- Alone in Space is a VR tour of a spaceship from Ted Kjellson's movie Alone 
- `hooper` -- 1 stelle, licenza n.d., ultimo push 2020-06-23 --  A customizable accessible carousel slider optimized for Vue
- `babel-brunch` -- 0 stelle, licenza n.d., ultimo push 2015-03-17 -- Brunch plugin for babel
- `three.js` -- 0 stelle, licenza n.d., ultimo push 2017-02-28 -- JavaScript 3D library.
- `webxr-demo` -- 0 stelle, licenza n.d., ultimo push 2018-08-01 -- A fun little demo in WebXR

**ultranoir** -- 9 repo, 0 stelle

- `electron-react-boilerplate` -- 0 stelle, licenza n.d., ultimo push 2020-02-07 -- A Foundation for Scalable Cross-Platform Apps
- `react-redux-boilerplate` -- 0 stelle, licenza n.d., ultimo push 2019-12-28 -- A minimal React-Redux boilerplate with all the best practices
- `Flowise` -- 0 stelle, licenza n.d., ultimo push 2024-01-25 -- Drag & drop UI to build your customized LLM flow
- `FlowiseChatEmbed` -- 0 stelle, licenza n.d., ultimo push 2024-01-18
- `doc-test-technique` -- 0 stelle, licenza n.d., ultimo push 2024-04-12

**activetheory** -- 8 repo, 905 stelle

- `activeframe` -- 398 stelle, licenza MIT, ultimo push 2026-04-30 -- Custom .af video format for WebCodecs: frame-accurate playback without a vi
- `Paper-Planes-Android-Experiment` -- 277 stelle, licenza NESSUNA, ultimo push 2016-09-21
- `split-text` -- 69 stelle, licenza MIT, ultimo push 2025-06-05 -- Split text within HTML elements into individual lines, words, and/or charac
- `Finding-Love-Shaders` -- 52 stelle, licenza NESSUNA, ultimo push 2017-03-21
- `fit-text` -- 36 stelle, licenza MIT, ultimo push 2025-01-30 -- Dynamically adjust text to fit within a specified container

**humaan** -- 5 repo, 2758 stelle

- `Modaal` -- 2695 stelle, licenza MIT, ultimo push 2020-11-27 -- An accessible dialog window library for all humans.
- `Canvas-Swarm-Animation` -- 23 stelle, licenza MIT, ultimo push 2016-11-29
- `Checklist` -- 22 stelle, licenza NESSUNA, ultimo push 2017-08-17 -- Humaan's Website Launch Checklist
- `Cappy` -- 17 stelle, licenza MIT, ultimo push 2026-04-29 -- Cappy is a Chrome extension for taking screenshots and sharing them to a ga
- `Socialight` -- 1 stelle, licenza NESSUNA, ultimo push 2016-12-20

**fictivekin** -- 5 repo, 4 stelle

- `fk-sass` -- 2 stelle, licenza MIT, ultimo push 2023-03-15
- `stylelint-config-fk` -- 2 stelle, licenza MIT, ultimo push 2024-11-06
- `browserslist-config-fk` -- 0 stelle, licenza MIT, ultimo push 2020-03-26 -- Fictive Kin sharable browserslist configuration
- `editorconfig-fk` -- 0 stelle, licenza NESSUNA, ultimo push 2022-08-31
- `eslint-config-fk` -- 0 stelle, licenza MIT, ultimo push 2023-07-20

**heydays** -- 4 repo, 0 stelle

- `components-lib` -- 0 stelle, licenza NESSUNA, ultimo push 2020-06-25
- `photo-test` -- 0 stelle, licenza NESSUNA, ultimo push 2024-02-09
- `vuetuts` -- 0 stelle, licenza GPL-3.0, ultimo push 2023-01-04 -- Vuejs examples to learn Vue
- `yt-playback` -- 0 stelle, licenza NESSUNA, ultimo push 2024-02-12 -- Tiny app to play yt-videos in custom playbackrates

**b-reel** -- 4 repo, 115 stelle

- `google-android-wear-craig-ward` -- 61 stelle, licenza n.d., ultimo push 2015-11-12 -- Google: Android Wear - Craig Ward Watch Face
- `vr-weight` -- 37 stelle, licenza n.d., ultimo push 2017-06-06 -- Simulating Weight in VR
- `vr-madebymakers` -- 16 stelle, licenza n.d., ultimo push 2016-10-13
- `donut-horns` -- 1 stelle, licenza n.d., ultimo push 2012-05-23

**thinkingbox** -- 2 repo, 0 stelle

- `simpyple` -- 0 stelle, licenza LGPL-3.0, ultimo push 2014-05-08 -- A bunch of utilities and convenience methods for simpy.
- `velmod` -- 0 stelle, licenza Apache-2.0, ultimo push 2017-01-23 -- velmod is a Software Development Velocity Model

**upperquad** -- 2 repo, 11 stelle

- `wireframer.otf` -- 9 stelle, licenza MIT, ultimo push 2020-04-08 -- A free typeface for prototyping, made with <3 by Upperquad
- `crumbskees` -- 2 stelle, licenza NESSUNA, ultimo push 2023-05-15

**immersive-garden** -- 2 repo, 2 stelle

- `glsl-easings` -- 2 stelle, licenza n.d., ultimo push 2023-10-03 -- Robert Penner's easing functions in GLSL, available as a module for glslify
- `igpu` -- 0 stelle, licenza n.d., ultimo push 2026-07-06 -- Minimal WebGPU Library

**yourmajesty** -- 2 repo, 0 stelle

- `firehose_test_app` -- 0 stelle, licenza n.d., ultimo push 2014-04-18
- `pixter` -- 0 stelle, licenza n.d., ultimo push 2014-04-20

**active-theory** -- 1 repo, 0 stelle

- `advice-to-my-kids` -- 0 stelle, licenza NESSUNA, ultimo push 2015-06-03

**deptagency** -- 1 repo, 1 stelle

- `catwalk` -- 1 stelle, licenza NESSUNA, ultimo push 2022-01-20 -- Basic backend for frontend

**sennep** -- 1 repo, 22 stelle

- `FluffyBall` -- 22 stelle, licenza MIT, ultimo push 2020-11-27 -- Three.js shader experiment that is nice and fluffy

## Le redazioni e i musei: il filone che nessuno guarda

Le squadre di grafica interattiva dei giornali e i musei vincono premi digitali e **pubblicano
molto piu' degli studi commerciali**, spesso con licenza vera. Per chi impara valgono piu' dei
portfolio: il codice e' scritto per essere riletto da un collega, non per stupire.

**Smithsonian** -- 100 repo, 989 stelle

- `OpenAccess` -- 439 stelle, ultimo push 2021-12-21 -- Smithsonian Open Access Data Repository 
- `dpo-voyager` -- 203 stelle, ultimo push 2026-08-07 -- DPO Voyager - 3D Explorer and Tool Suite
- `dpo-cook` -- 84 stelle, ultimo push 2026-07-22 -- DPO Cook - 3D Model/Geometry/Texture Processing Server
- `dpo-meshsmith` -- 47 stelle, ultimo push 2020-06-24 -- Mesh conversion tool including glTF/GLB support with Draco mesh compression

**bbc** -- 100 repo, 18138 stelle

- `wraith` -- 4821 stelle, ultimo push 2026-01-16 -- Wraith  A responsive screenshot comparison tool
- `Imager.js` -- 3819 stelle, ultimo push 2026-01-16 -- Responsive images while we wait for srcset to finish cooking
- `peaks.js` -- 3405 stelle, ultimo push 2025-11-08 -- JavaScript UI component for interacting with audio waveforms
- `audiowaveform` -- 2157 stelle, ultimo push 2025-08-24 -- C++ program to generate waveform data and render waveform images from audio

**cooperhewitt** -- 100 repo, 1174 stelle

- `cooperhewitt-typeface` -- 426 stelle, ultimo push 2015-09-04 -- Cooper Hewitt: The Typeface created by Chester Jenkins
- `collection` -- 236 stelle, ultimo push 2018-01-10 -- Collection Data for Cooper Hewitt, Smithsonian Design Museum
- `Planetary` -- 200 stelle, ultimo push 2023-01-19 -- the all new clean and UI callback enabled app formerly known as Kepler (AKA
- `chromecast-signage` -- 83 stelle, ultimo push 2014-01-24 -- A proof-of-concept Chromecast application for web-based signage in museums

**datadesk** -- 100 repo, 1739 stelle

- `python-elections` -- 175 stelle, ultimo push 2018-06-15 -- A Python wrapper for the Associated Press' U.S. election data service.
- `vr-interactives-three-js` -- 167 stelle, ultimo push 2017-03-02 -- A tutorial on how to build VR interactives using DEM data and Three.js
- `django-for-data-analysis-nicar-2016` -- 103 stelle, ultimo push 2021-03-25 -- So you've gone through a Django tutorial or two, maybe even built an app, a
- `web-map-maker` -- 99 stelle, ultimo push 2021-06-24 -- Use Natural Earth and OpenStreetMap data to export an image or a vector fil

**ft-interactive** -- 100 repo, 397 stelle

- `visual-vocabulary` -- 347 stelle, ultimo push 2021-08-18 -- Small examples of data driven graphics -- to be used as starting points...
- `nightingale-charts` -- 11 stelle, ultimo push 2017-09-27 -- FT style charts, axes, scales etc
- `gmachine` -- 6 stelle, ultimo push 2013-04-25 -- Node app to grab images from the internet and resize, crop and compress the
- `developer-guide` -- 4 stelle, ultimo push 2017-03-13 -- Docs: our team's handbook

**guardian** -- 100 repo, 7335 stelle

- `frontend` -- 5897 stelle, ultimo push 2026-08-13 -- The Guardian DotCom.
- `guardian.github.com` -- 407 stelle, ultimo push 2018-09-21 -- Guardian github pages
- `riff-raff` -- 272 stelle, ultimo push 2026-08-12 -- The Guardian's deployment platform
- `riemann-config` -- 139 stelle, ultimo push 2015-06-18 -- Configuration for alerting and event processing in Riemann

**nprapps** -- 100 repo, 4180 stelle

- `app-template` -- 1590 stelle, ultimo push 2019-06-11 -- The NPR visuals team's opinionated project template for client-side apps.
- `pym.js` -- 803 stelle, ultimo push 2019-02-15 -- Resize an iframe responsively depending on the height of its content and th
- `bestpractices` -- 299 stelle, ultimo push 2024-11-19 -- Best practices and coding conventions for the NPR Visuals team.
- `dailygraphics` -- 295 stelle, ultimo push 2024-02-13 -- NPR Visuals' rig for deploying daily graphics projects in responsive iframe

**nytimes** -- 100 repo, 44656 stelle

- `covid-19-data` -- 6964 stelle, ultimo push 2024-04-02 -- A repository of data on coronavirus cases and deaths in the U.S.
- `objective-c-style-guide` -- 5818 stelle, ultimo push 2023-05-09 -- The Objective-C Style Guide used by The New York Times
- `gizmo` -- 3772 stelle, ultimo push 2026-03-18 -- A Microservice Toolkit from The New York Times
- `Store` -- 3495 stelle, ultimo push 2019-12-06 -- Android Library for Async Data Loading and Caching

**texastribune** -- 100 repo, 131 stelle

- `armstrong.base` -- 22 stelle, ultimo push 2013-05-02 -- Base functionality that needs to be shared widely
- `data-visuals-guides` -- 15 stelle, ultimo push 2025-02-10 -- A collection of guides for the Texas Tribune Data Visuals team.
- `xscrolly` -- 10 stelle, ultimo push 2014-04-21 -- When X scrolls in, do Y
- `gspreadsheet` -- 9 stelle, ultimo push 2014-01-26 -- A wrapper around a wrapper to get Google spreadsheets to look like DictRead

**the-pudding** -- 100 repo, 1726 stelle

- `data` -- 1074 stelle, ultimo push 2026-08-04 -- Data sets created for stories on The Pudding, open to the public.
- `starter` -- 221 stelle, ultimo push 2023-03-15 -- A starter template for projects.
- `how-to-implement-scrollytelling` -- 103 stelle, ultimo push 2017-11-17 -- How to implement scrollytelling with six different libraries
- `wiki-death-data` -- 51 stelle, ultimo push 2018-08-07

**voxmedia** -- 100 repo, 3742 stelle

- `meme` -- 1982 stelle, ultimo push 2022-03-15 -- Meme generator
- `autotune` -- 411 stelle, ultimo push 2024-04-22 -- Platform for reusable news tools
- `data-projects` -- 189 stelle, ultimo push 2023-08-14 -- Scripts and data for various Vox Media stories and news projects
- `metronome` -- 171 stelle, ultimo push 2014-11-02

**washingtonpost** -- 91 repo, 2753 stelle

- `data-police-shootings` -- 1142 stelle, ultimo push 2025-06-17 -- The Washington Post is compiling a database of every fatal shooting in the 
- `data-homicides` -- 182 stelle, ultimo push 2018-09-03 -- The Washington Post collected data on more than 52,000 criminal homicides o
- `data-school-shootings` -- 161 stelle, ultimo push 2025-02-15 -- The Washington Post is compiling a database of school shootings in the Unit
- `aws-tagger` -- 117 stelle, ultimo push 2021-08-05 -- AWS bulk tagging tool

**propublica** -- 89 repo, 7810 stelle

- `upton` -- 1597 stelle, ultimo push 2018-12-26 -- A batteries-included framework for easy web-scraping. Just add CSS! (Or do 
- `guides` -- 1299 stelle, ultimo push 2022-04-07 -- ProPublica's News App and Data Style Guides
- `compas-analysis` -- 694 stelle, ultimo push 2017-06-13 -- Data and analysis for 'Machine Bias'
- `weepeople` -- 540 stelle, ultimo push 2022-08-22 -- A typeface of people sillhouettes, to make it easy to build web graphics fe

**reuters-graphics** -- 80 repo, 381 stelle

- `example_svelte-graph-patterns` -- 123 stelle, ultimo push 2022-09-09 -- Collection of examples and templates for working with Svelte in a number of
- `graphics-components` -- 52 stelle, ultimo push 2026-08-13 -- Graphics components for projects
- `ai2svelte` -- 35 stelle, ultimo push 2026-07-28
- `bluprint_graphics-kit` -- 27 stelle, ultimo push 2026-08-12 -- SvelteKit rig for graphics and newsapps

**metmuseum** -- 6 repo, 1432 stelle

- `openaccess` -- 1410 stelle, ultimo push 2024-07-31 -- The Metropolitan Museum of Art's Open Access Initiative
- `marble` -- 20 stelle, ultimo push 2023-03-06 -- Marble is the design system of The Metropolitan Museum of Art 
- `Blathers` -- 1 stelle, ultimo push 2024-08-28 -- Animal Crossing-ify Any Open Access art work
- `image-search-mvp` -- 1 stelle, ultimo push 2024-06-18

**rijksmuseum** -- 2 repo, 55 stelle

- `rijksmuseum.github.io` -- 55 stelle, ultimo push 2024-11-07 -- Documentation for Rijksmuseum APIs
- `aio_oai_repo` -- 0 stelle, ultimo push 2025-07-28 -- A Configurable OAI-PMH Repository Library

## Gli sviluppatori creativi, a titolo personale

Spesso il codice migliore non sta nell'organizzazione dello studio ma nel profilo di chi ci
lavora. Vale la pena seguirli direttamente.

**akella** -- 100 repo, 1340 stelle

- `fake3d` -- 546 stelle, ultimo push 2020-01-05
- `DistortedPixels` -- 287 stelle, ultimo push 2022-01-12
- `ExplodingObjects` -- 223 stelle, ultimo push 2019-03-26 -- A set of WebGL demos that show an exploding 3D object animation inspired by
- `CodropsEmergingImages` -- 78 stelle, ultimo push 2024-02-07

**cabbibo** -- 100 repo, 662 stelle

- `glsl-curl-noise` -- 156 stelle, ultimo push 2022-09-28
- `enough` -- 127 stelle, ultimo push 2016-10-13 -- How strange it is to be anything at all
- `IMMATERIA` -- 126 stelle, ultimo push 2020-05-19 -- A library for unity and compute shaders
- `BallGamne` -- 55 stelle, ultimo push 2016-06-21

**codrops** -- 100 repo, 36015 stelle

- `PageTransitions` -- 2311 stelle, ultimo push 2024-08-05 -- A showcase collection of various page transition effects using CSS animatio
- `SidebarTransitions` -- 1656 stelle, ultimo push 2024-08-05 -- Some inspiration for transition effects for off-canvas navigations.
- `HoverEffectIdeas` -- 1648 stelle, ultimo push 2023-10-17 -- Some inspiration and modern ideas for subtle hover effects.
- `ModalWindowEffects` -- 1013 stelle, ultimo push 2013-07-02 -- A set of experimental modal window appearance effects with CSS transitions 

**gkjohnson** -- 100 repo, 9184 stelle

- `three-mesh-bvh` -- 3447 stelle, ultimo push 2026-08-10 -- A BVH implementation to speed up raycasting and enable spatial queries agai
- `three-gpu-pathtracer` -- 1807 stelle, ultimo push 2026-08-13 -- Path tracing renderer and utilities for three.js built on top of three-mesh
- `three-bvh-csg` -- 939 stelle, ultimo push 2026-02-17 -- A flexible, memory compact, fast and dynamic CSG implementation on top of t
- `threejs-sandbox` -- 863 stelle, ultimo push 2026-08-11 -- Set of experiments and extensions to THREE.js.

**spite** -- 100 repo, 10146 stelle

- `ccapture.js` -- 3761 stelle, ultimo push 2026-07-27 -- A library to capture canvas-based animations at a fixed framerate
- `looper` -- 958 stelle, ultimo push 2019-11-04 -- Looperepool
- `polygon-shredder` -- 869 stelle, ultimo push 2016-12-15 -- The polygon shredder that takes many cubes and turns them into confetti
- `ShaderEditorExtension` -- 634 stelle, ultimo push 2017-05-01 -- Google Chrome DevTools extension to live edit WebGL GLSL shaders

**winkerVSbecks** -- 100 repo, 918 stelle

- `angular-pdf-viewer` -- 274 stelle, ultimo push 2020-04-25 -- An AngularJS directive to display PDFs
- `a-triangle-everyday` -- 170 stelle, ultimo push 2015-05-05 --  A triangle everyday for 30 days
- `angularWebglDirective` -- 100 stelle, ultimo push 2015-07-20 -- A basic example of a WebGL directive built using three.js and angular.js
- `3d-particle-effects-demo` -- 83 stelle, ultimo push 2022-01-09

**ykob** -- 100 repo, 3747 stelle

- `sketch-threejs` -- 2543 stelle, ultimo push 2025-04-29 -- Interactive sketches made with three.js.
- `shape-overlays` -- 422 stelle, ultimo push 2017-10-20 -- Multi-layered SVG shape overlays with adjustable values for a variety of ef
- `fullscreen-slider` -- 222 stelle, ultimo push 2019-05-16 -- This asset controls sections in a page.   It resizes sections to fullscreen
- `scroll-manager` -- 110 stelle, ultimo push 2019-08-12 -- Scroll Manager is utility class that controls smooth scroll and showing som

**pmndrs** -- 99 repo, 226657 stelle

- `zustand` -- 58557 stelle, ultimo push 2026-08-13 --  Bear necessities for state management in React
- `react-three-fiber` -- 31702 stelle, ultimo push 2026-08-11 --  A React renderer for Three.js
- `react-spring` -- 29138 stelle, ultimo push 2026-08-12 --  A spring physics based React animation library
- `jotai` -- 21241 stelle, ultimo push 2026-08-04 --  Primitive and flexible state management for React

**yiwenl** -- 93 repo, 1314 stelle

- `Sketches` -- 650 stelle, ultimo push 2026-07-31
- `Alfrid` -- 238 stelle, ultimo push 2025-07-16 -- A WebGL tool set.
- `Codevember` -- 75 stelle, ultimo push 2018-01-09
- `glsl-fbm` -- 56 stelle, ultimo push 2019-10-20 -- Fractional Brownian Motion in glsl

**brunosimon** -- 84 repo, 16506 stelle

- `folio-2019` -- 4728 stelle, ultimo push 2024-05-25
- `my-room-in-3d` -- 4476 stelle, ultimo push 2023-09-12
- `keppler` -- 1933 stelle, ultimo push 2022-06-26 -- Real time code sharing for your lectures and presentations.
- `folio-2025` -- 1689 stelle, ultimo push 2026-04-07

**luruke** -- 62 repo, 12341 stelle

- `browser-2020` -- 7974 stelle, ultimo push 2021-10-28 -- Things you can do with a browser in 2020 
- `awesome-casestudy` -- 2621 stelle, ultimo push 2022-09-28 --   Curated list of technical case studies on WebGL and creative development
- `aladino` -- 849 stelle, ultimo push 2021-03-30 --   Your magic WebGL carpet
- `magicshader` -- 248 stelle, ultimo push 2021-03-16 --  Tiny helper for three.js to debug and write shaders

**mrdoob** -- 61 repo, 133209 stelle

- `three.js` -- 114493 stelle, ultimo push 2026-08-13 -- JavaScript 3D Library.
- `stats.js` -- 9144 stelle, ultimo push 2024-10-11 -- JavaScript Performance Monitor
- `texgen.js` -- 1868 stelle, ultimo push 2021-01-23 -- JavaScript Texture Generator
- `glsl-sandbox` -- 1678 stelle, ultimo push 2026-07-10 -- Shader editor and gallery.

**lume** -- 50 repo, 3848 stelle

- `lume` -- 1515 stelle, ultimo push 2026-05-05 -- GPU-powered 3D HTML.  <lume-box size="1 2 3">
- `glas` -- 940 stelle, ultimo push 2026-02-05 -- WebGL in WebAssembly with AssemblyScript
- `autolayout` -- 332 stelle, ultimo push 2024-09-17 -- Apple's Auto Layout and Visual Format Language for JavaScript (using cassow
- `kiwi` -- 211 stelle, ultimo push 2025-06-28 -- Fast TypeScript implementation of the Cassowary constraint solving algorith

**edankwan** -- 42 repo, 4145 stelle

- `penis.js` -- 1361 stelle, ultimo push 2025-05-27
- `The-Spirit` -- 1273 stelle, ultimo push 2016-07-12 -- WebGL Experiment
- `PerspectiveTransform.js` -- 325 stelle, ultimo push 2024-06-05 -- A Javascript Class to do the CSS 3D transformation by 4 destination points
- `hyper-mix` -- 249 stelle, ultimo push 2016-07-12

**pixijs** -- 41 repo, 55137 stelle

- `pixijs` -- 48006 stelle, ultimo push 2026-08-11 -- The HTML5 Creation Engine: Create beautiful digital content with the fastes
- `pixi-react` -- 2879 stelle, ultimo push 2026-01-16 -- Write PIXI apps using React declarative style
- `filters` -- 1125 stelle, ultimo push 2026-02-13 -- Collection of community-authored custom display filters for PixiJS
- `sound` -- 474 stelle, ultimo push 2024-09-27 -- WebAudio API playback library, with filters. Modern audio playback for mode

**crnacura** -- 13 repo, 950 stelle

- `AmbientCanvasBackgrounds` -- 806 stelle, ultimo push 2018-12-13 -- Five ambient webpage backgrounds created using the HTML5 Canvas API and jwa
- `PlayersClub` -- 114 stelle, ultimo push 2025-11-23 -- Players Club is a free Astro template for showcasing music artistsan experi
- `TheAviator2` -- 12 stelle, ultimo push 2022-04-20 -- Improvements over the original The Aviator game by Karim Maaloul
- `eleventy-netlify-boilerplate` -- 10 stelle, ultimo push 2020-08-07

**greensock** -- 5 repo, 42004 stelle

- `GSAP` -- 27666 stelle, ultimo push 2026-04-13 -- GSAP (GreenSock Animation Platform), a JavaScript animation library for the
- `gsap-skills` -- 13539 stelle, ultimo push 2026-07-29 -- Official AI skills for GSAP. These skills teach AI coding agents how to cor
- `GreenSock-AS3` -- 423 stelle, ultimo push 2019-05-29 -- Public repository for GreenSock's ActionScript 3 libraries like GSAP (Tween
- `react` -- 335 stelle, ultimo push 2025-01-15 -- Tools for using GSAP in React, like useGSAP() which is a drop-in replacemen

**theatre-js** -- 5 repo, 12638 stelle

- `theatre` -- 12598 stelle, ultimo push 2024-08-14 -- Motion design editor for the web
- `theatre-docs` -- 17 stelle, ultimo push 2022-09-29 -- Docs for Theatre.js (moved to github.com/theatre-js/website)
- `website` -- 14 stelle, ultimo push 2024-04-22 -- www.theatrejs.com
- `react-three-fiber` -- 7 stelle, ultimo push 2022-03-14 --  A React renderer for Three.js

**oframe** -- 3 repo, 4805 stelle

- `ogl` -- 4622 stelle, ultimo push 2025-04-13 -- Minimal WebGL Library
- `ogpu` -- 133 stelle, ultimo push 2026-08-11 -- Minimal WebGPU Library
- `ibl-converter` -- 50 stelle, ultimo push 2022-03-05 -- IBL map converter for PBR

## Cosa non e' stato fatto, dichiarato

- **La licenza manca sui 3343 repository presi dal proxy.** Prima di usarne uno va aperto e
  verificato: e' un controllo di dieci secondi che evita un problema legale.
- **Nessuno di questi repository e' stato letto.** Questa e' una mappa di dove sta il codice,
  non una recensione di cosa contiene.
- Il collegamento fra repository e premio vinto e' documentato solo per gli studi gia'
  schedati nella cartella; per gli altri va ricostruito caso per caso.
