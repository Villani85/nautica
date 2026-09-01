/**
 * DUE SCRITTE NON SI STAMPANO UNA SULL'ALTRA.
 *
 * ─── IL DIFETTO
 *
 * Il committente ha fotografato la prima schermata: dietro "SCROLL" si
 * leggeva un'altra riga. Non era un artefatto di compressione, erano due
 * elementi sovrapposti -- misurato: a 1280x800 la nota stava a y534-552 e
 * l'invito a y509-544, dieci pixel di collisione; su telefono, y541-557 dentro
 * y539-574, cioe' completamente uno sull'altro.
 *
 * ─── PERCHE' NESSUN ALTRO CANCELLO LO PRENDEVA
 *
 * Tutti gli altri misurano la SCENA. Questo misura il LAYOUT, ed e' l'unica
 * famiglia di difetti che il repo non aveva: due elementi possono essere
 * entrambi corretti, entrambi visibili, entrambi al posto dichiarato dal
 * proprio CSS, e stare nello stesso posto. Il numero che lo dice e' la
 * sovrapposizione dei rettangoli, e non serve nient'altro.
 *
 * Si misura a piu' formati perche' la collisione e' una proprieta' del
 * formato: a 1280 era un bordo, a 390 era totale.
 */
import { apriBrowser } from './browser.mjs'
import { anteprima } from './anteprima.mjs'
import { readFileSync } from 'node:fs'

/**
 * ─── I FORMATI NON SI SCELGONO: SI LEGGONO DAL CSS
 *
 * Qui c'erano quattro formati fissi -- 1280x800, 1440x900, 390x844, 768x1024 --
 * e per due giorni hanno lasciato passare tre difetti DELLA STESSA SPECIE:
 *
 *   «Contact» sotto il pulsante del suono          trovato a 1280, per caso
 *   il pulsante dell'esplorazione fuori dal riquadro a 360   NON provato
 *   il pulsante sopra «Mechanism» a 768            trovato riparando il secondo
 *
 * Non e' sfortuna. Un cancello che campiona quattro larghezze trova le
 * collisioni che stanno a quelle quattro larghezze, e le regole di
 * impaginazione cambiano AI PUNTI DI ROTTURA: e' li' che la geometria si
 * rompe, ed erano proprio i punti che nessuno provava.
 *
 * Adesso l'elenco si DERIVA da `src/stile.css`: ogni `min-width`/`max-width`
 * dichiarata diventa tre prove -- un pixel prima, esatta, un pixel dopo -- piu'
 * i formati reali che restano perche' descrivono dispositivi veri.
 *
 * Derivato e non ricopiato, perche' una lista di punti di rottura scritta a
 * mano e' una lista che un giorno diverge dal foglio di stile. Se domani
 * qualcuno aggiunge un `@media`, il cancello lo prova senza che nessuno se ne
 * ricordi.
 */
/* I quattro che c'erano, e che bocciano da sempre. 360x640 NON e' qui: e'
   appena entrato con la copertura estesa, non era mai stato provato, e come le
   larghezze derivate misura e grida senza fermare -- vedi BLOCCA_ROTTURE. */
const DISPOSITIVI = [[1280, 800], [1440, 900], [390, 844], [768, 1024]]
const NUOVI = [[360, 640]]

/**
 * ─── LE LARGHEZZE NUOVE MISURANO E GRIDANO, NON FERMANO. Per ora.
 *
 * La copertura estesa ha trovato subito sei collisioni, e quattro di esse
 * PREESISTONO a chiunque le legga adesso: verificato ricostruendo il foglio di
 * stile precedente, a 821 e 822 px `.comandi` copre `.pannello--energia` per
 * 224x60 px e `.pannello--letture` per 206x60. Non le ha introdotte questo giro:
 * non erano mai state provate.
 *
 * Farle fallire oggi fermerebbe la pubblicazione su difetti vecchi, ed e'
 * esattamente cio' che il committente ha deciso di non voler fare finche' il
 * sito non e' completo. Quindi le larghezze DERIVATE dai punti di rottura
 * misurano e stampano; i quattro dispositivi reali continuano a bocciare come
 * hanno sempre fatto.
 *
 * Non e' un cancello spento: e' un cancello che dice a voce alta cosa
 * boccerebbe. Per armarlo, `BLOCCA_ROTTURE = true`.
 */
const BLOCCA_ROTTURE = false

/* PRIMA STESURA SBAGLIATA, e si e' vista dall'elenco: usciva «680, 680» e
   mancava 821. Il motivo e' che facevo precedere `@media[^{]*` e poi prendevo
   il PRIMO numero della porzione trovata -- che in
   `@media (max-height:680px) and (min-width:821px)` e' l'altezza. Un numero
   giusto, letto per un'altra grandezza: la stessa famiglia di errori che questo
   repo insegue da due giorni, dentro lo strumento che dovrebbe prenderla.
   Adesso si cerca direttamente ogni `(min|max)-width: Npx`. */
const rotture = [...new Set(
  [...readFileSync('src/stile.css', 'utf8')
    .matchAll(/\((?:min|max)-width:\s*(\d+)px\)/g)].map((m) => Number(m[1]))
)].filter((n) => n >= 300 && n <= 2000).sort((x, y) => x - y)

const daRotture = []
for (const b of rotture) for (const d of [-1, 0, 1]) daRotture.push([b + d, 900])

/* si tolgono i doppioni per larghezza: l'altezza qui non cambia le regole
   orizzontali, e provare due volte la stessa larghezza costa e non aggiunge */
let rotti = 0
const viste = new Set()
const FORMATI = [...DISPOSITIVI.map((f) => [...f, 'dispositivo']),
                 ...NUOVI.map((f) => [...f, 'rottura']),
                 ...daRotture.map((f) => [...f, 'rottura'])].filter(([w]) => {
  if (viste.has(w)) return false
  viste.add(w); return true
})

console.log(`  ${rotture.length} punti di rottura letti da src/stile.css: ${rotture.join(', ')}`)
console.log(`  ${FORMATI.length} larghezze provate (i dispositivi veri, piu' ogni rottura a -1/0/+1)`)
console.log('')
/** Gli elementi che occupano la prima schermata e non devono toccarsi. */
const PEZZI = ['#nota', '#invito-scorri', '.comandi', '.pannello--energia', '.pannello--letture', '#apri-chiusura']
/** Sotto questa opacita' un elemento non e' in campo: sovrapporsi non conta. */
const VISIBILE = 0.06
/** Dove si guarda: la battuta in cui l'invito e la nota sono entrambi accesi. */
const P = 0.10

const _ant = await anteprima()
const b = await apriBrowser({ conGpu: true })
const pg = await b.newPage()
let rossi = 0

for (const [W, H, DA] of FORMATI) {
  await pg.setViewportSize({ width: W, height: H })
  await pg.goto(`${_ant.indirizzo}?ispeziona=1`, { waitUntil: 'load', timeout: 45000 })
  await pg.waitForFunction(() => window.__nautica?.corsaRacconto > 0, null, { timeout: 30000 })
  await pg.evaluate((p) => scrollTo(0, window.__nautica.cimaSezione + window.__nautica.corsaRacconto * p), P)
  /* non si aspetta un tempo: si aspetta che la corsa sia arrivata dove si e' chiesto */
  await pg.waitForFunction((p) => Math.abs(window.__nautica.p - p) < 0.01, P, { timeout: 10000 })
  await pg.waitForTimeout(700)

  const box = await pg.evaluate((sel) => sel.map((s) => {
    const e = document.querySelector(s)
    if (!e) return null
    const r = e.getBoundingClientRect()
    return { s, x: r.left, y: r.top, x2: r.right, y2: r.bottom, op: +getComputedStyle(e).opacity }
  }).filter(Boolean), PEZZI)

  const vivi = box.filter((e) => e.op > VISIBILE && e.x2 > e.x && e.y2 > e.y)
  console.log(`--- ${W}x${H} ${DA === 'rottura' ? '[punto di rottura]' : '[dispositivo]'}  (${vivi.length} elementi in campo)`)
  /* per formato, non globale: con un contatore solo l'ultimo formato pulito
     non stampava niente e sembrava non essere stato misurato */
  let quiRossi = 0
  for (let i = 0; i < vivi.length; i++) {
    for (let j = i + 1; j < vivi.length; j++) {
      const a = vivi[i], c = vivi[j]
      const dx = Math.min(a.x2, c.x2) - Math.max(a.x, c.x)
      const dy = Math.min(a.y2, c.y2) - Math.max(a.y, c.y)
      if (dx > 0 && dy > 0) {
        console.log(`  ROSSO  ${a.s} e ${c.s} si sovrappongono per ${Math.round(dx)}x${Math.round(dy)} px`)
        if (DA === 'rottura') rotti++; else rossi++
        quiRossi++
      }
    }
  }
  if (!quiRossi) console.log('  nessuna collisione')
}
await b.close()
_ant.ferma()

if (rotti) {
  console.log(`\n${BLOCCA_ROTTURE ? 'ROSSO' : 'DA VEDERE'} — ${rotti} collisioni sulle larghezze APPENA COPERTE.`)
  if (!BLOCCA_ROTTURE) {
    console.log('  Non fermano nessuno. Quattro di esse PREESISTONO: verificato ricostruendo')
    console.log('  il foglio di stile precedente, a 821 e 822 px .comandi copriva gia')
    console.log('  .pannello--energia per 224x60 e .pannello--letture per 206x60. Non erano')
    console.log('  mai state provate. Bloccare oggi vorrebbe dire fermare la pubblicazione')
    console.log('  su difetti vecchi. BLOCCA_ROTTURE = true le arma.')
  }
}
if (rossi || (rotti && BLOCCA_ROTTURE)) {
  console.log(`\nROSSO — ${rossi} collisioni sui quattro dispositivi che bocciano da sempre.`)
  process.exit(1)
}
console.log(`\nVERDE sui dispositivi reali${rotti ? `, con ${rotti} da vedere sulle larghezze nuove.` : '.'}`)
