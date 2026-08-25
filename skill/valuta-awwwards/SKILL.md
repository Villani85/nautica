---
name: valuta-awwwards
description: Valutare un sito web per stimarne il punteggio e il tier Awwwards (Nominee / Honorable Mention / Developer Award / Site of the Day) e produrre una fix-list azionabile. Usa questa skill quando serve capire "che voto prenderebbe su Awwwards", giudicare design/UX/creatività/contenuto di una pagina, confrontare un sito col livello SOTD, o iterare "cambio → misuro → faccio valutare → correggo". Contiene il rubric ufficiale con i pesi, le soglie dei premi, i proxy MISURABILI per criterio (Core Web Vitals, contrasto WCAG, FPS scroll, peso/AVIF, reduced-motion, responsive), una scorecard che calcola il totale pesato e il tier, gli esemplari di riferimento e gli anti-pattern, e come ottenere un giudizio esterno severo col Gem hce 3.0. Per registrare e far giudicare da Gemini vedi [[confronto-gemini]]; per costruire da zero a livello SOTD vedi la skill web-design e [[stack-sito-immersivo]].
---

# valuta-awwwards

Stima il **voto Awwwards** di un sito e il **tier** che prenderebbe, con numeri (non a occhio),
e restituisce una fix-list ordinata per impatto. Chiude il ciclo **misuro → valuto → correggo**.

> Il totale pesato è una **stima della media giuria**, non una promessa: il SOTD reale dipende
> anche dai voti PRO e dalla concorrenza del giorno. Riporta un **range + tier**, mai una cifra
> secca. E un solo giudizio non prova niente ([[confronto-gemini-instabile-quattro-round]]).

## Il rubric ufficiale (pesi)

| Criterio | Peso | Cosa pesa |
|---|---|---|
| **Design** | **40%** | art direction, tipografia, layout/ritmo, colore, coerenza |
| **Usability** | **30%** | UX/UI, performance, responsive/mobile, accessibilità, no scroll-jacking |
| **Creativity** | **20%** | concept, micro-interazioni bespoke, motion, tecnica (WebGL/shader) |
| **Content** | **10%** | copy reale, storytelling, gerarchia, SEO/alt |

Voto **0–10 con decimali**. Giuria: min **18 giurati**, il sistema **scarta i 3 voti più lontani
dalla media**, finestra **5 giorni**; premio anticipato con voto alto **+ ≥10 voti PRO**.

## Soglie → tier (mappa la stima)

| Totale pesato stimato | Tier realistico |
|---|---|
| **< 6.5** | **Nominee** (pubblicato ma non premiato) |
| **6.5 – 7.4** | **Honorable Mention** (soglia ufficiale HM = 6.5) |
| **7.5 – 7.9** | HM forte; **Developer Award** se il codice è eccellente (soglia >7) |
| **8.0 +** (SOTD reali nei mid/high 8) | **Site of the Day** in contesa (serve anche ≥10 voti PRO) |

**Mobile Excellence**: gate separato — il sito deve superare **70/100 ai criteri mobile di Google**,
poi la giuria applica gli stessi 4 criteri.

## Come si valuta (metodo)

1. **Cattura** il sito. Regola di casa: si **esplora** col Chrome MCP `claude-in-chrome`, si
   **registra** con Playwright — mai il recorder per esplorare ([[esplora-chrome-registra-playwright]]).
   Guarda desktop **e** mobile (metà giuria testa sul telefono).
2. **Misura** i proxy oggettivi → `references/misure.md` (Core Web Vitals, contrasto WCAG, FPS
   scroll, peso/AVIF, reduced-motion, touch target, responsive). **Non dichiarare un effetto
   scroll senza averlo campionato a due altezze** ([[effetti-scroll-dichiarare-solo-se-misurati]]).
3. **Assegna 0–10 a ciascun criterio** con gli anchor del `references/rubric.md` (cosa è un 5 vs
   7 vs 8.5), incrociando le misure.
4. **Calcola il totale pesato** e mappa al tier (tabelle sopra). Compila la **scorecard**.
5. **(Opzionale) Giudizio esterno severo** col Gem hce 3.0 calibrato su Awwwards →
   `references/giudizio-esterno.md` e [[confronto-gemini]]: **anonimo**, **≥3 round**, riporta
   la **serie** non il numero migliore ([[confronto-gemini-sempre-anonimo]]).

## Scorecard (compila e calcola)

```
Sito: __________________________   Data: __________   Viewport: desktop + mobile

Criterio     Peso   Voto/10   Pesato        Note (misura chiave)
Design       0.40   ____      = 0.40*voto   art direction / type / ritmo
Usability    0.30   ____      = 0.30*voto   LCP __ / INP __ / CLS __ / mobile __
Creativity   0.20   ____      = 0.20*voto   n. momenti bespoke / FPS scroll __
Content      0.10   ____      = 0.10*voto   copy reale? gerarchia? alt?
------------------------------------------------------------
TOTALE PESATO = somma dei pesati  →  ____ / 10   →  TIER: __________
Gate mobile (Google ≥70): ___    |   Developer Award (codice >7): ___
```

Regola d'oro: un voto va **giustificato da una misura ripetibile** (contrasto, LCP, FPS, quota di
schermate mezze vuote, fotogrammi duplicati), non da un'impressione. Le confabulazioni esistono:
**misura il difetto citato prima di correggerlo** ([[confronto-gemini-instabile-quattro-round]]).

## Reference

| file | contenuto |
|---|---|
| `references/rubric.md` | i 4 criteri con gli **anchor 0–10** (cosa è un 5/7/8.5) e il dettaglio di cosa premia/penalizza la giuria |
| `references/misure.md` | **come misurare** i proxy (CWV con chrome-devtools MCP, contrasto, FPS, peso/AVIF, reduced-motion, responsive) |
| `references/esemplari-e-antipattern.md` | gli **esemplari** (il livello) e gli **anti-pattern** che affossano il voto |
| `references/giudizio-esterno.md` | prompt Awwwards-calibrato per hce 3.0, con anonimato e multi-round |

## Una regola di casa da rispettare nel giudizio

Il plugin `modern-web-design` premia **effetti al mouse** (cursore custom, bottoni magnetici,
tilt) — ma la regola di Giuseppe è **[[niente-effetti-al-mouse]]**: l'immersione si guida con
**scroll e tempo**, non col puntatore (metà del pubblico è su telefono e quegli effetti non li
vede nemmeno, e i giurati li leggono come "fatto con un tema"). Quindi in **Creativity** premia
le **micro-interazioni bespoke legate a scroll/stato**, non i gimmick del cursore; nella fix-list
non suggerire mai effetti al mouse come leva di punteggio.

Vedi anche [[confronto-gemini]] (registra e fa giudicare), [[stack-sito-immersivo]] (lo stack del
livello SOTD e i segnali "3k vs 20k"), [[agenzia-siti-creativi]] (l'obiettivo: siti creativi).
