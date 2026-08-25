# Scala INTERNA di valutazione — anchor 0–10 per criterio

> ## ⚠️ QUESTO NON E' UN DOCUMENTO AWWWARDS
>
> Gli anchor 5 / 8 / 9,5, la lista di anti-pattern e i nomi di famiglie
> tipografiche in questo file sono **una scala di lavoro di questo studio**.
> Awwwards non pubblica anchor di punteggio, non nomina font e non pubblica
> soglie di web vitals.
>
> **Citarli come criteri di giuria e' gia' costato un giro di lavoro** su un
> progetto reale: una proposta di design era finita al primo posto perche'
> "il rubric Awwwards cita Space Grotesk fra gli anti-pattern". Non lo cita.
> Quando usi questo file, dichiara che e' nostro.
>
> **Cosa e' davvero ufficiale** (da https://www.awwwards.com/about-evaluation/,
> verificato 2026-08-25):
> - pesi Design 40 / Usability 30 / Creativity 20 / Content 10;
> - minimo 18 giurati, i 3 voti piu' lontani dalla media eliminati, 5 giorni;
> - SOTD anticipato con voto alto **e almeno 10 utenti PRO**;
> - **HM a 6,5** — ma vedi sotto: servono DUE punteggi;
> - **SOTD**: *"only the sites scored the highest by the jury"*, nessuna soglia
>   numerica pubblicata;
> - **Developer Award: SOLO dopo aver vinto il SOTD.** *"All SOTD winning sites
>   are sent to the developer jury... if the site is scored higher than a 7"*.
>   Non e' un premio intermedio piu' facile, e va tolto dalla lista in ordine
>   crescente di difficolta';
> - Site of the Month: gli otto punteggi piu' alti del mese.
>
> **Tre fatti che cambiano il piano e che non stavano qui:**
> 1. **L'Honorable Mention richiede DUE 6,5**: uno dalla giuria *e* uno dagli
>    utenti con account Chief/Tribe/Pro/International. Con rete community pari
>    a zero non si prende nemmeno l'HM. E' lavoro da cominciare **mesi prima**.
> 2. **Il punteggio si vede solo se si vince il SOTD.** Questa scala non potra'
>    mai essere tarata contro un voto reale: serve a ordinare il lavoro, non a
>    prevedere un risultato.
> 3. **I progetti autoprodotti sono ammessi**, purche' design e sviluppo siano
>    interamente di chi sottomette. Esclusi i siti su template.
>
> **Mobile Excellence esiste** ed e' una **track premio separata** (soglia di
> qualificazione 70/100 ai criteri mobile di Google), non un cancello sul SOTD.
>
> ## I PUNTEGGI VERI — misurati su una scheda pubblica, 2026-08-25
>
> I voti sono pubblici sulla scheda di ogni vincitore SOTD. Non serve indovinare.
>
> **Lando Norris** (OFF+BRAND) — SOTD 17 nov 2025, poi **Site of the Year 2025**:
> **8,18/10**. Design **8,12** · Usability **7,90** · Creativity **8,71** ·
> Content **8,18**. Il portfolio di Bruno Simon, SOTM 2026, sta a **8,11**.
>
> Conseguenza da tenere a mente ogni volta che si fissa un bersaglio:
> **il massimo premio dell'anno si prende con 8,2, non con 9.** Un obiettivo di
> "9 su ogni criterio" e' sopra cio' che vince davvero, e spinge a rifinire
> all'infinito invece di spedire. E il criterio piu' basso del sito dell'anno e'
> la **Usability, a 7,90**: c'e' spazio, ed e' il 30%.
>
> **I giurati votano numeri interi** (7, 8, 9, 10): i decimali nascono dalla
> ponderazione. Una scala interna con decimali finge una precisione che nel
> voto non esiste.
>
> ## IL DEVELOPER AWARD HA SEI CRITERI PROPRI
>
> Non e' una valutazione generica "sul codice": ha una sua griglia, visibile
> sulla stessa scheda. Lando Norris ha preso **7,58** cosi':
>
> | criterio | voto |
> |---|---|
> | Semantics / SEO | 7,40 |
> | Animations / Transitions | 8,60 |
> | **Accessibility** | **7,00** |
> | WPO (web performance optimization) | 7,60 |
> | Responsive Design | 7,40 |
> | Markup / Meta-data | 7,40 |
>
> Da qui si tara il lavoro tecnico, non dagli anchor inventati. E si legge una
> cosa utile: **il sito dell'anno prende 7,00 in accessibilita'**. E' il punto
> piu' debole dei vincitori, ed e' quello che costa meno superare.
>
> **E i 44x44 px non sono WCAG AA.** WCAG 2.2 AA chiede **24x24** o spaziatura
> equivalente; 44x44 e' il livello **AAA**, ed e' il requisito delle linee guida
> Apple. Restano un buon obiettivo: dichiararli per quello che sono.

Vota ogni criterio 0–10 con questi ancoraggi; poi pesa (Design .40 / Usability .30 / Creativity .20
/ Content .10). Soglie ufficiali: **6,5 = HM** (doppia votazione), **SOTD = i piu' alti**,
**Developer Award > 7 ma solo a valle del SOTD**.

---

## DESIGN — 40%
*Art direction, tipografia, layout/ritmo, colore, coerenza.*

| Voto | Come si presenta |
|---|---|
| **3** | template riconoscibile; type di sistema; padding uniforme; gradiente viola→rosa; niente idea |
| **5** | pulito ma generico ("hero + 3 card"); type Inter/Space Grotesk; ritmo piatto |
| **6.5** | direzione coerente, un accento, tipografia curata e leggibile; qualche momento memorabile |
| **8** | art direction forte: i **fotogrammi statici sembrano poster**; type bespoke/variabile con scala modulare; layout con tensione (asimmetria/griglia vera); colore disciplinato |
| **9.5** | linguaggio visivo originale e coerente dall'inizio alla fine; ogni sezione "vende" senza rompere il sistema |

**Premia**: concept + esecuzione coerenti, tipografia come motore, whitespace, colore unico.
**Penalizza**: estetica AI generica, incoerenza, testo illeggibile, immagini placeholder.
Misure a supporto: contrasto WCAG, presenza font non-di-sistema, quota schermate mezze vuote.

## USABILITY — 30%
*UX/UI, performance, responsive/mobile, accessibilità.*

| Voto | Come si presenta |
|---|---|
| **3** | lento (LCP >4s), layout che salta (CLS >0.25), mobile rotto, scroll-jacking che combatte l'utente |
| **5** | funziona ma pesante; mobile "adattato" non progettato; focus non visibile |
| **6.5** | **CWV nel verde** (LCP<2.5s, INP<200ms, CLS<0.1), responsive vero, touch target ≥44px |
| **8** | fluido su **mid-range Android**, navigazione ovvia, focus-visible, semantica/landmark, `prefers-reduced-motion` gestito, niente scroll-jacking |
| **9.5** | esperienza impeccabile su ogni device, accessibile, veloce anche con 3D/shader |

**Premia**: 60fps reali, mobile progettato, accessibilità, primo paint rapido.
**Penalizza**: jank, peso, CLS, mobile rotto, scroll-hijack, contrasto/keyboard inaccessibili.
Misure: Lighthouse (mobile!), LCP/INP/CLS, peso pagina, FPS scroll, `prefers-reduced-motion`.
> **Mobile Excellence**: gate a **70/100** ai criteri mobile di Google prima di poter vincere.

## CREATIVITY — 20%
*Concept, micro-interazioni bespoke, motion, tecnica.*

| Voto | Come si presenta |
|---|---|
| **3** | librerie di animazione "pronte" lasciate com'è (Vanta/Aceternity/Magic UI); tutto animato a caso |
| **5** | animazioni corrette ma prevedibili; nessun momento firma |
| **6.5** | 1–2 **momenti bespoke** riconoscibili; timing/easing curati |
| **8** | **2–4 momenti firma** su misura, legati a **scroll/stato/tempo**; motion coerente col concept; tecnica non gratuita (WebGL/shader/variable font/view transitions) che **gira a 60fps** |
| **9.5** | idea tecnica originale al servizio del racconto, eseguita in modo che sembri inevitabile |

**Premia**: micro-interazioni bespoke, timing d'autore, tecnica che spedisce anche su telefono.
**Penalizza**: librerie off-the-shelf, over-animazione, effetti gratuiti.
> **Regola di casa**: NON premiare gli **effetti al mouse** (cursore custom, magnetici, tilt,
> parallasse col puntatore) — [[niente-effetti-al-mouse]]. L'immersione si guida con **scroll e
> tempo**; metà giuria è su mobile e non li vede. Conta i momenti bespoke **scroll/stato**, non i gimmick.
Misure: n. momenti bespoke vs presenza librerie note; FPS scroll sostenuto; drop su mid-range.

## CONTENT — 10%
*Copy reale, storytelling, gerarchia, SEO/alt.*

| Voto | Come si presenta |
|---|---|
| **3** | lorem / "Built for modern teams"; nessuna gerarchia; niente alt |
| **5** | copy plausibile ma generico; struttura piatta |
| **6.5** | messaggio chiaro, gerarchia dei titoli, alt presenti |
| **8** | **storytelling** vero, copy specifico e con voce, SEO di base, immagini con senso |
| **9.5** | il contenuto È parte del design: ogni parola tira, la narrazione guida lo scroll |

**Premia**: copy reale con voce, struttura narrativa, gerarchia, accessibilità del testo.
**Penalizza**: lorem, claim generici, gerarchia assente, niente alt/SEO.

---

## Nota sulla stima finale
- Il totale pesato ≈ **media giuria stimata**. Il **SOTD** reale richiede anche **≥10 voti PRO** e
  batte la concorrenza del giorno: due siti da 8.4 lo stesso giorno → uno solo è SOTD.
- **Developer Award**: valutazione aggiuntiva sul codice (linee guida sviluppatore), soglia **>7**.
- Confronto utile: **CSSDA** pesa UI 40 / UX 30 / Innovation 30 (niente "Content"); **Webby/Lovie**
  su 6 assi (Content, Structure&Navigation, Visual Design, Functionality, Interactivity, Overall).
  Awwwards è l'unico che dà un peso esplicito basso al Content (10%).

Torna al metodo: [[valuta-awwwards]]. Come misurare i proxy: `misure.md`.
