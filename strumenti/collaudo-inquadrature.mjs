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
 * ─── QUELLA TABELLA E' PRESA IN UN'UNITA' CHE L'ARCO NON USA PIU'
 *
 * 2 SETTEMBRE 2026. `trovaArco` scandiva la PAGINA e `vaiA` andava nel
 * RACCONTO (vedi il commento di `trovaArco`): le due unita' si sono separate il
 * 31 agosto e la tabella qui sopra e' di prima. Non e' una tabella sbagliata,
 * e' una tabella di un altro metro -- e i numeri sotto un metro diverso non si
 * confrontano. Rimisurato con le due unita' riunite, due corse di fila:
 *
 *     battuta      presenza al meglio   occlusione        arco (racconto)
 *     salotto            94,93%             5,1%          0,00-0,13
 *     emerge             17,76%            24,0-24,1%     0,15-0,26
 *     mare                9,56%            14,0%          0,26-0,38
 *     invito              9,56%            14,0%          0,38-0,50
 *     calma               9,56%            14,0%          0,50-0,64
 *     taglio             16,22-16,24%       0,7%          0,64-0,82
 *     meccanismo          5,77%            35,8%          0,82-0,93 (tagliato)
 *
 * Fra due corse: quattro centesimi di scarto sul taglio, uno su emerge, zero
 * sul meccanismo. Il metro adesso e' fermo.
 *
 * LE SOGLIE NON LE HO TOCCATE, e il cancello resta ROSSO su due voci. Alzarle
 * per far tornare verde un cancello e' la cosa che questo file si e' vietato
 * per iscritto, e le due voci sono fatti, non rumore:
 *
 *   `meccanismo`  il primo piano culmina a 5,77% di quadro (minimo 6,0) e a
 *                 p 0,930, l'ultimo istante prima che la traversata prenda la
 *                 camera. E' coperto per il 35,8%: 22,3 dal MARE (la pinna sta
 *                 sotto il pelo, ed e' il mestiere di `collaudo-varco`) e 11,1
 *                 dalla nave stessa.
 *   `emerge`      coperto per il 24,0% dal mare, tetto 22. All'istante 12,5,
 *                 che e' fermo: non e' piu' l'oscillazione di tre punti del
 *                 31 agosto, e' un valore che non si muove.
 *
 * Le leve sono tutte di messa in scena -- far arrivare l'avvicinamento piu'
 * vicino, far cominciare la traversata piu' tardi di 0,93, scegliere un altro
 * istante -- e quelle le decide il committente. Stanno scritte come numeri in
 * `feedback/CHIEDO.md`, §3.6.
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
import { SOGGETTI, misuraInPagina, trovaArco, vaiA, attendiCameraFerma, finestra } from './inquadratura-comune.mjs'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'

const PRESENZA_MINIMA = 6.0     // misurato 7,87 al peggio, su tre corse
const OCCLUSIONE_MASSIMA = 22.0 // misurato 15,3 al peggio, su tre corse
const QUANTI = 5
const PORTA = process.env.PORTA_COLLAUDO || 5219
/* se sulla porta risponde gia' qualcuno, questo referto puo' essere
   la misura del `dist` di un altro processo: si dice, non si tace */
await avvisaSePortaAltrui(PORTA)

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
/**
 * ─── E LA SIMULAZIONE SI INCHIODA, o questo cancello misura l'istante
 *
 * DIFETTO DEL CANCELLO, preso in CI e poi riprodotto qui. Due corse IDENTICHE,
 * stessa macchina, stessa scheda, stesso commit:
 *
 *     emerge   19,0% coperto   ->  passa (tetto 22%)
 *     emerge   22,2% coperto   ->  ROSSO
 *
 * Tre punti e due decimi di oscillazione su un tetto che non ne concede
 * nessuno. Non e' rumore di misura: e' che la scena SI MUOVE -- onde, rollio --
 * e `attendiCameraFerma` aspetta la CAMERA, non la simulazione. Fermata la
 * camera, sotto continuano a muoversi il mare e l'inclinazione, e la
 * percentuale di soggetto coperto cambia con loro.
 *
 * Un cancello che oscilla piu' del proprio margine non decide niente: decide il
 * momento in cui e' stato lanciato.
 *
 * `?fermo` esiste apposta, e `stato.js:66` scrive la regola che autorizza
 * questo uso: «serve a misurare un FOTOGRAMMA -- geometria, materiali,
 * inquadratura, grana. Non serve a misurare come si comporta la pagina mentre
 * si scorre». Qui si misura esattamente un'inquadratura.
 *
 * MISURATO DOPO: due corse identiche danno 16,8% e 16,8%. L'oscillazione passa
 * da 3,2 punti a zero.
 */
const ISTANTE = 12.5
/**
 * ─── `domcontentloaded`, NON `load`, e non e' una micro-ottimizzazione
 *
 * DIFETTO CHE HA TENUTO FERMA LA CI QUARANTA MINUTI. `waitUntil: 'load'`
 * aspetta TUTTE le risorse della pagina, video compresi. In locale, con la
 * decodifica hardware, arrivano subito; su un runner senza GPU e senza
 * decodifica hardware un mp4 puo' tenere l'evento `load` sospeso a tempo
 * indefinito -- e il passo non fallisce, resta appeso, perche' un `goto` senza
 * tetto non si arrende.
 *
 * Cinquanta secondi qui, quaranta minuti la', e nessun messaggio: la firma
 * esatta di un'attesa senza tetto.
 *
 * Si aspetta invece il FATTO che serve davvero -- che la maniglia di ispezione
 * esista -- che e' cio' che questo cancello usa. E' lo stesso schema di
 * `collaudo-finale-vivo.mjs:66`, che infatti in CI non si e' mai piantato.
 */
await pg.goto(`http://localhost:${PORTA}/?ispeziona=1&senzaFilmato=1&fermo=${ISTANTE}`,
  { waitUntil: 'domcontentloaded', timeout: 30000 })
pg.setDefaultTimeout(20000)
await pg.waitForFunction(() => !!document.querySelector('canvas'), null, { timeout: 30000 })
await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 30000 })
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

/**
 * ─── DOVE LA TRAVERSATA HA LA CAMERA, QUESTO CANCELLO NON MISURA -- e lo dice
 *
 * Dalla promozione della traversata (`8fbfe5d`) l'ultimo tratto del racconto e'
 * un movimento DENTRO la nave: locale tecnico, sala macchine, scala, salone.
 * Li' il soggetto di ogni battuta -- che e' sempre la nave vista da fuori -- non
 * e' in quadro per COSTRUZIONE, non per un difetto di inquadratura: la camera
 * sta dentro lo scafo. La battuta scritta su `.palco` resta «meccanismo» fino
 * in fondo, quindi l'arco trovato ci finisce dentro e due campioni su cinque
 * leggono zero -- e trascinano il «migliore» via dal culmine.
 *
 * L'intervallo NON e' una tacca scelta qui: e' `S.traversata` della regia, la
 * stessa che muove la camera. Un'esclusione dichiarata da chi comanda il
 * movimento non e' la «cura per esclusioni» contro cui mette in guardia il
 * commento di `inquadratura-comune`: quella e' un criterio inventato dal
 * cancello, questa e' una domanda alla regia. E si STAMPA, cosi' nessuno
 * scambia un arco tagliato per l'arco intero.
 *
 * Quel tratto ha i cancelli suoi: `collaudo-traversata-world`, `collaudo-varco`
 * per il pelo dell'acqua, e i provini della traversata.
 */
const [DENTRO_DA] = finestra('traversata')

for (const [battuta, def] of Object.entries(SOGGETTI)) {
  const trovato = await trovaArco(pg, battuta)
  if (trovato === null) {
    guai.push(`la battuta "${battuta}" non compare in nessun punto dello scorrimento: ` +
              'o e stata rinominata, o la regia non la scrive piu su .palco[data-battuta]')
    continue
  }
  const arco = { da: trovato.da, a: Math.min(trovato.a, DENTRO_DA) }
  const tagliato = arco.a < trovato.a - 1e-9
  if (arco.a <= arco.da) {
    guai.push(`la battuta "${battuta}" vive tutta dentro la traversata ` +
              `(${trovato.da.toFixed(2)}-${trovato.a.toFixed(2)}, la traversata comincia a ${DENTRO_DA}): ` +
              'qui il soggetto non puo esserci, e questo cancello non e quello giusto per misurarla')
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
  console.log(`               arco ${arco.da.toFixed(2)}-${arco.a.toFixed(2)} del racconto` +
              (tagliato ? `, tagliato a ${DENTRO_DA} dove la traversata prende la camera (finiva a ${trovato.a.toFixed(2)})` : ''))
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
