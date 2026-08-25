# Esemplari (il livello) e anti-pattern (cosa affossa il voto)

Usali come **metro relativo**: colloca il sito accanto all'esemplare più vicino e chiediti "regge
il confronto?". La cifra Awwwards ha senso solo relativa, non assoluta ([[confronto-gemini-sempre-anonimo]]).

## Il livello — esperienze immersive / WebGL (soffitto SOTD/Developer)
- **Active Theory** — WebGL real-time di produzione, scene complesse che **girano anche su telefono**;
  Developer Site of the Year. Il riferimento del 3D sul web aperto.
- **Resn** — interattivo giocoso, character-driven, artigianato d'interazione.
- **Obys Agency** — art direction editoriale + motion tipografico; Studio of the Year; i fotogrammi
  statici **sembrano poster**.
- **Lusion** — *EverSwap* SOTD + Developer Award (giugno 2026).
- **Immersive Garden · Unseen Studio · Locomotive · Cuberto** — il livello immersivo/WebGL corrente.

## Il livello — product craft (soffitto di pulizia/performance)
linear.app · stripe.com/sessions · vercel.com · raycast.com · resend.com · liveblocks.io ·
studiofreight.com / lusion.co · **igloo.inc** (3D da SOTY) · werkstatt.fyi (brutalismo).

> Copia le **meccaniche** (ritmo, timing, peso, coerenza), non l'estetica: clonare l'aspetto è
> proprio ciò che i giurati leggono come "tema" ([[stack-sito-immersivo]]).

## Anti-pattern che affossano il voto
- **Librerie di animazione/componenti pronte** lasciate com'è (Vanta.js, Aceternity, Magic UI,
  React Bits) → "fatto con un tema".
- **FPS basso / pagina pesante / primo paint lento / CLS** (layout che salta).
- **Mobile rotto o goffo**, **scroll-jacking**, native scroll disabilitato.
- **Estetica AI generica**: gradiente `from-purple-500 to-pink-500`, **Inter/Space Grotesk** come
  primario, "hero + 3 feature card + bottone indaco", `rounded-2xl` ovunque, padding identico a ogni
  sezione, immagini placeholder, lorem, bullet a emoji, badge "Powered by AI".
- **Over-animazione** (animare tutto è a sua volta un tell).
- **Contrasto/keyboard inaccessibili**.
- **Effetti al mouse** come sostanza (cursore custom, magnetici, tilt, parallasse col puntatore):
  oltre a violare [[niente-effetti-al-mouse]], su mobile non esistono e non spostano il voto.

## Come tradurlo in punteggio
- Sito ≈ template con estetica Aui generica e mobile fragile → Design ~5, Usability ~5 → **Nominee**.
- Pulito, CWV verdi, 1–2 momenti curati, mobile ok → ~6.5–7 → **HM**.
- Art direction forte + 2–4 momenti bespoke + 60fps su mid-range + a11y → ~8 → **SOTD in contesa**.
- 3D/shader che spedisce a telefono + codice eccellente → **Developer Award** (>7) oltre al design.

Torna al metodo: [[valuta-awwwards]]. Giudizio esterno: `giudizio-esterno.md`.
