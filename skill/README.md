# Le skill dello studio

Il know-how con cui questo sito viene costruito e giudicato, messo in chiaro
perché chi collabora al progetto — persone o AI — lavori con lo stesso metro.

Sono documenti **interni**, scritti per uso proprio e non per essere pubblicati.
Si vede: danno del tu, citano progetti che qui non ci sono, e in qualche punto
sono stati sbagliati. Restano com'erano, con le correzioni aggiunte in testa
dove servono.

| cartella | a cosa serve |
|---|---|
| `stack-sito-immersivo/` | lo stack per i siti immersivi: Lenis, GSAP, three.js, e le trappole già pagate. La prima domanda è *serve un build?* |
| `valuta-awwwards/` | come si stima il livello di un sito e come si misurano i proxy oggettivi |
| `render3d-in-video-reale/` | esperienze 3D guidate dallo scroll: progettazione della coreografia, Blender, video scrubbato |
| `blender/` | il 3D offline, per il fotorealismo estremo. Controparte di `stack-sito-immersivo` |

---

## Leggi prima questo, se usi `valuta-awwwards`

**Gli anchor di punteggio 5 / 8 / 9,5, la lista di anti-pattern e i nomi di
famiglie tipografiche sono una scala interna di questo studio. Non sono di
Awwwards.**

Non è una precisazione formale: **citarli come criteri di giuria è già costato
un giro di lavoro su questo progetto**. Una proposta di design era finita al
primo posto della lista perché "il rubric Awwwards cita Space Grotesk fra gli
anti-pattern". Non lo cita. L'errore sta scritto per esteso in
[`feedback/claude-2026-08-25.md`](../feedback/claude-2026-08-25.md).

I file sono stati corretti in testa con quello che è stato **verificato** sulle
pagine ufficiali. In sintesi:

### Il percorso reale dei premi

Nominee → **Honorable Mention** (6,5) → **Site of the Day** → **Developer
Award** (> 7, e *solo* per chi ha già vinto il SOTD) → **Site of the Month**
(gli otto punteggi più alti) → **Site of the Year**.

Il Developer Award non è un premio intermedio più facile: è a valle.

### I punteggi che vincono davvero

Dalla scheda pubblica di un vincitore, non da stime:

**Lando Norris** (OFF+BRAND), SOTD 17 nov 2025 e poi Site of the Year 2025 —
**8,18/10**: Design 8,12 · Usability **7,90** · Creativity 8,71 · Content 8,18.

Il massimo premio dell'anno si prende con **8,2, non con 9**. E il criterio più
debole del sito dell'anno è la Usability, che pesa il 30%.

### Il Developer Award ha sei criteri suoi

Semantics/SEO · Animations/Transitions · **Accessibility** · WPO · Responsive
Design · Markup/Meta-data. Lando Norris ha preso 7,58, con **7,00 in
accessibilità**: è il punto più debole dei vincitori e il meno costoso da
superare.

### Due cose che nessuno aveva controllato

- **L'Honorable Mention richiede due punteggi da 6,5**, uno dalla giuria e uno
  dagli utenti qualificati. Senza rete nella community non si prende nemmeno
  quello, e non è lavoro che si recupera nelle ultime settimane.
- **I progetti autoprodotti sono ammessi**, purché design e sviluppo siano
  interamente di chi sottomette. Sono esclusi i siti su template.

### E i 44×44 px non sono WCAG AA

WCAG 2.2 AA chiede **24×24** o spaziatura equivalente. **44×44 è il livello
AAA**, ed è il requisito delle linee guida Apple. Restano un buon obiettivo:
vanno solo dichiarati per quello che sono.

---

## La regola che attraversa tutte e quattro

> **Un metro rotto non dà errore. Dà un numero.**

`stack-sito-immersivo/references/trappole-misura-3d.md` è il file che vale di
più di tutti: non contiene ricette — quelle si trovano ovunque — ma i modi in
cui **una misura sbagliata sembra giusta**. È stato scritto dopo aver costruito
e buttato sei strumenti di misura su un progetto solo, e le due che davano
numeri *plausibili* sono quelle che hanno fatto perdere più tempo.

Su questo progetto la regola si è già applicata due volte in un giorno:
il peso su disco usato per parlare di traffico di rete, e un commento nel CSS
scambiato per un'implementazione. Entrambi in
[`feedback/`](../feedback/), con l'esito della verifica.
