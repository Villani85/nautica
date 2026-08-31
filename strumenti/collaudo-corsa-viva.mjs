/**
 * DOVE LO SCROLL NON FA NIENTE.
 *
 * ─── LA SEGNALAZIONE
 *
 * Il committente, con due schermate e la barra laterale in mano: *«guarda la
 * barra laterale da qui a qui, lo scroll non fa niente»*.
 *
 * ─── DUE VERSIONI SBAGLIATE PRIMA DI QUELLA GIUSTA, E VALGONO PIU' DEL CODICE
 *
 * **Primo tentativo**: campionare la tela lungo la corsa e misurare quanto
 * cambia. Ha stampato «VERDE» perche' partiva da `cimaSezione`, cioe' DOPO
 * l'antefatto — saltando esattamente il tratto fotografato. Un cancello che da'
 * un verdetto su una zona che non ha guardato non e' un cancello lasco: e' un
 * cancello che mente.
 *
 * **Secondo tentativo**: stessa misura, ma su tutta la pagina. Ancora verde,
 * con numeri fra 18 e 28 livelli su ogni passo. E il numero era GIUSTO: quando
 * la pagina scorre, tutti i pixel si spostano, quindi la differenza fra due
 * schermate e' enorme anche se il racconto e' immobile. Misurava il movimento
 * della PAGINA e lo leggeva come movimento della STORIA.
 *
 * ─── LA MISURA GIUSTA
 *
 * Il racconto ha una sola coordinata, `p`, ed e' quella che la regia consuma.
 * Un tratto in cui si scorre e `p` non cambia e' un tratto in cui chi guarda
 * paga movimento e non riceve niente. Non ci sono pixel di mezzo, non c'e'
 * soglia da scegliere: o `p` avanza o non avanza.
 *
 * ─── DUE TRATTI FERMI HANNO IL DIRITTO DI ESSERLO
 *
 * L'antefatto (in testa) tiene il titolo prima che la nave si muova, e la coda
 * (in fondo) e' dove il filmato finisce da solo e torna la coppia viva — il
 * finale non e' agganciato alla rotella e non deve esserlo. Quindi i due
 * estremi hanno un BUDGET DICHIARATO, e il cancello si arrabbia se lo sforano.
 * Un tratto fermo in MEZZO al racconto non ha nessuna scusa: e' rosso e basta.
 */
import { apriBrowser } from './browser.mjs'

const PASSI = 60
/** Sotto questo avanzamento `p` non si e' mosso: e' zero, con un margine. */
const FERMO = 0.002
/**
 * I due budget, in frazione della corsa della pagina. Misurati il 31 agosto
 * dopo aver portato l'antefatto da 1,0 a 0,5 schermi: testa 7%, coda 21%.
 * Sono tetti, non obiettivi: se un giorno la testa risale sopra il 10% qualcuno
 * ha rimesso schermo morto davanti alla nave senza accorgersene.
 */
const TETTO_TESTA = 0.10
const TETTO_CODA = 0.25

const b = await apriBrowser({ conGpu: true })
const pg = await b.newPage()
await pg.setViewportSize({ width: 1280, height: 800 })
await pg.goto('http://localhost:4173/?ispeziona=1', { waitUntil: 'load', timeout: 45000 })
await pg.waitForFunction(() => window.__nautica && typeof window.__nautica.p === 'number', null, { timeout: 30000 })

const H = await pg.evaluate(() => document.documentElement.scrollHeight - innerHeight)
const letti = []
for (let i = 0; i <= PASSI; i++) {
  const y = Math.round(H * i / PASSI)
  await pg.evaluate((v) => scrollTo(0, v), y)
  /* si aspetta il fatto: che la pagina sia arrivata dove le si e' chiesto */
  await pg.waitForFunction((v) => Math.abs(window.scrollY - v) < 2, y, { timeout: 8000 }).catch(() => {})
  await pg.waitForTimeout(80)
  letti.push({ f: i / PASSI, p: await pg.evaluate(() => window.__nautica.p) })
}
await b.close()

const passi = []
for (let i = 1; i < letti.length; i++) {
  passi.push({ da: letti[i - 1].f, a: letti[i].f, d: letti[i].p - letti[i - 1].p, p: letti[i].p })
}

/** I tratti fermi consecutivi si uniscono: due passi vuoti sono un buco solo. */
const buchi = []
for (const s of passi) {
  const u = buchi[buchi.length - 1]
  if (Math.abs(s.d) < FERMO && u && Math.abs(u.a - s.da) < 1e-6) u.a = s.a
  else if (Math.abs(s.d) < FERMO) buchi.push({ da: s.da, a: s.a })
}

console.log('CORSA VIVA — quanto avanza il racconto a ogni passo di scorrimento')
console.log(`  pagina alta ${H} px (${(H / 800).toFixed(2)} schermi)\n`)
for (const s of passi) {
  const fermo = Math.abs(s.d) < FERMO
  console.log(`  ${(s.da * 100).toFixed(0).padStart(3)}%-${(s.a * 100).toFixed(0).padStart(3)}%   p=${s.p.toFixed(4)}   avanza ${s.d.toFixed(4)}${fermo ? '   << fermo' : ''}`)
}

const testa = buchi.find((h) => h.da < 1e-6)
const coda = buchi.find((h) => h.a > 1 - 1e-6)
const mezzo = buchi.filter((h) => h !== testa && h !== coda)
const lung = (h) => h ? h.a - h.da : 0

console.log('')
console.log(`  testa ferma:  ${(lung(testa) * 100).toFixed(0)}%  (tetto ${(TETTO_TESTA * 100).toFixed(0)}%)   l'antefatto, prima che la nave si muova`)
console.log(`  coda ferma:   ${(lung(coda) * 100).toFixed(0)}%  (tetto ${(TETTO_CODA * 100).toFixed(0)}%)   il filmato che finisce e la coppia che torna`)
console.log(`  buchi in mezzo: ${mezzo.length}`)

let rosso = false
if (lung(testa) > TETTO_TESTA) {
  console.log(`\nROSSO — ${(lung(testa) * 100).toFixed(0)}% di pagina in testa non muove il racconto: si scorre e la nave sta ferma.`)
  rosso = true
}
if (lung(coda) > TETTO_CODA) {
  console.log(`\nROSSO — ${(lung(coda) * 100).toFixed(0)}% di pagina in coda non muove il racconto.`)
  rosso = true
}
for (const h of mezzo) {
  console.log(`\nROSSO — da ${(h.da * 100).toFixed(0)}% a ${(h.a * 100).toFixed(0)}% della pagina il racconto e' fermo, e non e' ne' testa ne' coda: quel tratto non ha nessuna scusa.`)
  rosso = true
}
if (rosso) process.exit(1)
console.log('\nVERDE — il racconto avanza ovunque tranne i due tratti dichiarati.')
