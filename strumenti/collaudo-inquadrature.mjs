/**
 * OGNI BATTUTA DEVE FAR VEDERE IL PROPRIO SOGGETTO.
 *
 * ─── CHE COSA MISURA DAVVERO, e cosa NON dice
 *
 * Questo cancello **non dice che l'8% di quadro basta a leggere un
 * meccanismo**. Non ho nessuna misura che lo sostenga, e inventarne una
 * sarebbe esattamente cio' che questo repo si e' vietato. Dice una cosa piu'
 * piccola e vera: *oggi* ogni battuta porta il suo soggetto in quadro con
 * questi numeri, misurati, e **non devono peggiorare**.
 *
 * E' un cancello di non-regressione, e la sua identita' e' quella. Il giorno
 * in cui le cinque persone di `?studio=1` diranno quanto quadro serve davvero,
 * queste soglie diventeranno soglie percettive e lo si scrivera' qui.
 *
 * ─── PERCHE' SERVE, e perche' la presenza da sola non bastava
 *
 * Un soggetto puo' occupare lo 0,8% del quadro perche' e' lontano (va bene)
 * oppure perche' e' coperto per un terzo da una paratia (non va bene), e le
 * due cose danno lo STESSO numero. Una revisione ha segnalato «il meccanismo
 * e' nascosto da superfici bianche» e non c'era nessuno strumento capace di
 * dire se fosse vero: `collaudo-varco` misura il CONTRASTO del pezzo sotto il
 * pelo dell'acqua, non quanto ne resta scoperto.
 *
 * Misurato adesso, e la revisione aveva ragione a meta': all'inizio della sua
 * battuta il meccanismo e' lo 0,80% del quadro e coperto al 28,1%; alla fine
 * e' l'8,02% e coperto al 15,9%. Non e' nascosto, **arriva tardi** -- e chi
 * copre non sono superfici estranee, e' la nave stessa (il ramo che porta 75
 * mesh, per il 15,9 punti su 15,9).
 *
 * ─── LE SOGLIE, e da dove vengono
 *
 * Dalla corsa del 30 agosto 2026, 1280x720, cinque campioni per arco, con
 * l'attesa del fatto (la camera ferma) invece di un'attesa a orologio:
 *
 *     battuta      presenza al meglio   occlusione   arco       arco leggibile
 *     salotto            97,2%              2,8%     0-29%          4/5
 *     emerge             17,5%             12,4%    29-37%          5/5
 *     mare               10,2%             10,3%    37-45%          5/5
 *     invito             10,0%             11,8%    46-54%          5/5
 *     calma               9,9%             12,8%    55-65%          5/5
 *     taglio             16,1-17,5%         1,2%    65-78%          5/5
 *     meccanismo          7,87-8,20%       15,0%    78-100%         2-3/5
 *
 * Il minimo di presenza e' 7,87 (meccanismo, su tre corse), il massimo di
 * occlusione 15,3. Le soglie stanno un quarto sotto e un terzo sopra:
 * abbastanza larghe da non diventare rosse per il rumore di un fotogramma,
 * abbastanza strette da prendere una battuta che perde il suo soggetto.
 *
 * ─── E QUELLE TRE CORSE SONO LA RAGIONE PER CUI SI ASPETTA IL FATTO
 *
 * La prima versione aspettava 1,2 secondi a orologio dopo ogni `scrollTo`. La
 * battuta del meccanismo leggeva **8,02% nella diagnosi e 6,40% nel cancello**,
 * a parita' di sito e di posizione: la camera del sito insegue lo scorrimento
 * con un filtro e non aveva finito di avvicinarsi. Uno scarto del 20% fra due
 * corse identiche non e' rumore accettabile sotto una soglia.
 *
 * La cura NON e' abbassare la soglia finche' ci sta dentro -- sarebbe
 * indebolire il cancello per farlo tornare verde. Si aspetta che la camera si
 * fermi (`attendiCameraFerma`), e le tre corse successive leggono 8,20 / 7,87 /
 * 8,20: quattro decimi di scarto invece di un punto e sei.
 *
 * Non si alzano per far tornare un numero. Se una battuta le sfonda, o e'
 * peggiorata l'inquadratura o e' cambiato chi e' il soggetto -- e nel secondo
 * caso si corregge `SOGGETTI`, non la soglia.
 *
 * ─── COSA RESTA DA GUARDARE, e non e' verificato
 *
 * L'ultima colonna, «arco leggibile»: quanti dei cinque campioni stanno sopra
 * il minimo. Il meccanismo ne fa 2 o 3 su 5 -- si legge solo nell'ultima meta'
 * della sua battuta. Il cancello lo STAMPA e non lo verifica, perche' non ho
 * nessuna misura che dica per quanta parte di una battuta il soggetto debba
 * stare in quadro, e una soglia senza misura in questo repo non vale niente.
 * E' il numero da chiudere quando le cinque persone di `?studio=1` diranno la
 * loro.
 */
import { apriBrowser } from './browser.mjs'
import { spawn } from 'node:child_process'
import { SOGGETTI, misuraInPagina, trovaArco, vaiA, attendiCameraFerma } from './inquadratura-comune.mjs'

const PRESENZA_MINIMA = 6.0     // misurato 7,87 al peggio, su tre corse
const OCCLUSIONE_MASSIMA = 22.0 // misurato 15,3 al peggio, su tre corse
const QUANTI = 5
const PORTA = process.env.PORTA_COLLAUDO || 5219

const preview = spawn('npx', ['vite', 'preview', '--port', PORTA], { shell: true, stdio: 'ignore' })
for (let i = 0; i < 60; i++) {
  try { await fetch(`http://localhost:${PORTA}/`, { redirect: 'manual' }); break } catch {}
  await new Promise(r => setTimeout(r, 500))
}

const browser = await apriBrowser({ conGpu: true })
const pg = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
/**
 * `senzaFilmato=1` come in `collaudo-varco`: dal 93% dello scorrimento la
 * traversata prende il comando e copre tutto, ed e' una funzione, non un
 * difetto. L'interruttore toglie cio' che sta DAVANTI, non cambia cio' che si
 * misura, e si dichiara -- un cancello non puo' spegnere una parte del sito
 * per far tornare un numero, puo' chiedere di guardare sotto dicendolo.
 */
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1&senzaFilmato=1`, { waitUntil: 'load' })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })
await pg.waitForTimeout(2500)

const fotogrammi = () => pg.evaluate(() => window.__nautica.fotogrammi ?? null)
const f0 = await fotogrammi()

console.log('le inquadrature: ogni battuta fa vedere il suo soggetto?')
console.log(`  minimo di presenza ${PRESENZA_MINIMA}% · tetto di occlusione ${OCCLUSIONE_MASSIMA}%\n`)

const guai = []
const referto = []
/* le posizioni in cui la camera non si e' mai fermata: il referto lo deve dire,
   perche' una misura presa su una camera ancora in volo non e' quella misura */
const fermateMancate = []

for (const [battuta, def] of Object.entries(SOGGETTI)) {
  const arco = await trovaArco(pg, battuta)
  if (arco === null) {
    guai.push(`la battuta "${battuta}" non compare in nessun punto dello scorrimento: ` +
              'o e stata rinominata, o la regia non la scrive piu su .palco[data-battuta]')
    continue
  }

  /**
   * Si campiona l'ARCO e si tiene il momento migliore.
   *
   * Prendere il primo fotogramma della battuta sembra innocuo e non lo e': la
   * battuta del meccanismo comincia al 78%, ma l'avvicinamento della camera
   * vive fra l'84% e il 93%. Al primo fotogramma il pezzo legge 0,65% di
   * quadro, e non perche' sia piccolo: perche' la camera non e' arrivata.
   *
   * La domanda giusta e' «c'e' un momento, dentro questa battuta, in cui il
   * soggetto si legge?».
   */
  const punti = []
  for (let k = 0; k < QUANTI; k++) {
    await vaiA(pg, arco.da + (arco.a - arco.da) * (k / (QUANTI - 1)))
    const q = await attendiCameraFerma(pg)
    if (!q.fermo) fermateMancate.push(`${battuta}[${k}]`)
    const m = await pg.evaluate(misuraInPagina, { def, conColpevoli: false })
    if (!m.rotto) punti.push(m)
    else if (!guai.some(g => g.includes(battuta))) guai.push(`"${battuta}": ${m.rotto}`)
  }
  if (!punti.length) continue

  const migliore = punti.reduce((a, b) => (b.visibili > a.visibili ? b : a))
  const iMigliore = punti.indexOf(migliore)
  await vaiA(pg, arco.da + (arco.a - arco.da) * (iMigliore / (QUANTI - 1)))
  await attendiCameraFerma(pg)
  const r = await pg.evaluate(misuraInPagina, { def, conColpevoli: true })

  const presenza = 100 * r.visibili / r.quadro
  const occlusione = r.nudi > 0 ? 100 * (1 - r.visibili / r.nudi) : null
  /**
   * QUANTO DELL'ARCO E' LEGGIBILE. Si stampa e NON si verifica: non ho una
   * misura che dica per quanta parte di una battuta il soggetto debba stare in
   * quadro, e una soglia senza misura in questo repo non vale. E' il numero da
   * guardare quando le cinque persone diranno la loro.
   */
  const sopra = punti.filter(p => 100 * p.visibili / p.quadro >= PRESENZA_MINIMA).length

  referto.push({ battuta, presenza, occlusione, sopra, colpevoli: r.colpevoli })
  const bandiera = (presenza < PRESENZA_MINIMA || (occlusione !== null && occlusione > OCCLUSIONE_MASSIMA)) ? '  <<<' : ''
  console.log(`  ${battuta.padEnd(12)} ${def.cosa.padEnd(30)} ` +
              `${presenza.toFixed(2).padStart(6)}% di quadro · ` +
              `${occlusione === null ? ' n/d ' : occlusione.toFixed(1).padStart(5) + '%'} coperto · ` +
              `${sopra}/${QUANTI} dell'arco sopra il minimo${bandiera}`)
  r.colpevoli.forEach(c => console.log(`               lo copre ${c.ramo} per il ${c.quota}% (${c.mesh} mesh)`))

  if (presenza < PRESENZA_MINIMA) {
    guai.push(`"${battuta}": il soggetto (${def.cosa}) occupa il ${presenza.toFixed(2)}% del quadro ` +
              `nel suo momento migliore, sotto il minimo di ${PRESENZA_MINIMA}%. ` +
              'La battuta parla di una cosa che non si vede.')
  }
  if (occlusione !== null && occlusione > OCCLUSIONE_MASSIMA) {
    const chi = r.colpevoli.length ? ` Lo copre ${r.colpevoli[0].ramo} per il ${r.colpevoli[0].quota}%.` : ''
    guai.push(`"${battuta}": il soggetto (${def.cosa}) e coperto per il ${occlusione.toFixed(1)}%, ` +
              `sopra il tetto di ${OCCLUSIONE_MASSIMA}%.${chi}`)
  }
}

const f1 = await fotogrammi()
const disegnati = (f0 !== null && f1 !== null) ? f1 - f0 : null
console.log(`\n  la scena ha disegnato ${disegnati ?? '?'} fotogrammi durante la misura`)

await browser.close(); preview.kill()

if (guai.length) {
  console.error('\nCOLLAUDO INQUADRATURE FALLITO')
  guai.forEach(g => console.error('  - ' + g))
  /**
   * Se la scena ha disegnato pochissimo, il rosso puo' essere la macchina e
   * non il sito: si dice, invece di lasciare che sembri un difetto del
   * prodotto. E' la stessa cura di `collaudo-varco`.
   */
  if (disegnati !== null && disegnati < 60) {
    console.error(`\n  ATTENZIONE: solo ${disegnati} fotogrammi disegnati in tutta la corsa. ` +
                  'Su una macchina cosi lenta la camera puo non essere arrivata dove la misura ' +
                  'la aspettava: prima di credere a questi numeri, guardare un fotogramma.')
  }
  process.exit(1)
}

console.log('\n  ogni battuta porta il suo soggetto in quadro, e nessuno e coperto oltre il tetto.')
process.exit(0)
