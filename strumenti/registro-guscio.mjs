/**
 * IL REGISTRO DEL GUSCIO, IN PIXEL.
 *
 *     node strumenti/registro-guscio.mjs
 *     P=0.02 node strumenti/registro-guscio.mjs
 *
 * ─── PERCHE' ESISTE, e perche' e' la cosa che mancava
 *
 * Il guscio del salone e' stato piazzato tre volte e tre volte sbagliato: sopra
 * la tuga, un metro sopra il soffitto, e adesso dentro la stanza ma ruotato.
 * Ogni giro costava sei screenshot da guardare, e guardare non converge: si
 * vede CHE e' sbagliato, non DI QUANTO ne' in che verso.
 *
 * Questo stampa un numero, e il numero ha una proprieta' che gli screenshot non
 * hanno: **si puo' minimizzare**.
 *
 * ─── COSA CONFRONTA, e perche' proprio queste due immagini
 *
 * La lastra E' la fotografia, inquadrata come il sito la vuole. Se il guscio e'
 * piazzato bene, la fotografia proiettata sulla sua geometria e vista dalla
 * camera del sito deve dare **la stessa immagine**: ogni punto torna nel pixel
 * da cui e' stato proiettato.
 *
 * E' la stessa prova di tautologia che `guscio-proiezione.py` fa in Blender --
 * renderizzando dalla camera da cui si proietta si deve riottenere la
 * fotografia -- portata dentro il sito, dove la camera e' quella vera e la
 * catena comprende anche il GLB, meshopt e three.js.
 *
 * Non e' un cancello: non fallisce. Un guscio piazzato male non e' un difetto
 * del sito finche' resta dietro `?guscio=1`, spento. E' uno strumento di
 * convergenza, e lo dichiara.
 *
 * ─── SI MISURA A SCENA INCHIODATA (`?fermo`)
 *
 * Senza, la stessa identica configurazione dava 45,8 · 16,8 · 23,3 in tre
 * corse: il mare si muove, la nave rolla, le clip suonano, e due caricamenti
 * diversi non mostrano mai la stessa cosa. Un metro che oscilla piu' della cosa
 * misurata non serve a cercare, e cercare e' il suo unico scopo.
 *
 * `?fermo=6` inchioda la simulazione a un istante dichiarato -- lo stesso
 * meccanismo che i cancelli della resa usano da sempre per confrontare due
 * fotogrammi. Il valore non conta: conta che sia lo stesso nelle due catture.
 *
 * ─── IL PAVIMENTO DI QUESTA MISURA, e va saputo prima di cercare
 *
 * ─── E I SONDAGGI DI PRIMA ERANO SU UN GUSCIO CIECO
 *
 * DA SAPERE PRIMA DI FIDARSI DEI NUMERI QUI SOTTO. Fino al 2 settembre 2026 il
 * guscio non portava nessuna fotografia: `guscio-salone.glb` non ha `TEXCOORD_0`
 * e con `map` assegnata senza UV WebGL da' zero a ogni vertice, quindi TUTTO il
 * guscio prendeva il colore di un texel. Questi sondaggi confrontavano la lastra
 * con una scatola di tinta piatta: dicevano dove stava la SAGOMA, non dove
 * stava l'immagine. La conclusione «minimo locale su tutti e cinque i gradi di
 * liberta'» valeva per la sagoma.
 *
 * Rifatti con la proiezione che funziona (`proiezione.js`), stessa scena
 * inchiodata, p = 0,02:
 *
 *     convenzione   0 -> 24,3   1 -> 60,0   2 -> 60,0
 *                   3 -> 27,9   4 -> 27,9   5 -> 46,5
 *     scala      0,85 -> 25,8   1,0 -> 24,3   1,15 -> 24,5
 *     distanza   -0,25 -> 28,8     0 -> 24,3  +0,25 -> 23,4
 *                +0,50 -> 24,4  +0,75 -> 28,4  +1,00 -> 45,8
 *
 * La convenzione 0 resta la migliore e adesso lo dice con uno scarto vero (le
 * altre raddoppiano invece di aggiungere il 50%). Distanza e scala restano
 * piatte entro un livello: dentro il rumore di questo metro.
 *
 * ─── I SONDAGGI DI PRIMA (guscio cieco, tenuti per confronto)
 *
 *     convenzione   0 -> 26,7   1 -> 41,0   2 -> 41,0
 *                   3 -> 29,0   4 -> 29,0   5 -> 63,4
 *     quota      -0,15 -> 33,1     0 -> 26,7   +0,15 -> 28,4
 *     trasversale -0,2 -> 41,7     0 -> 26,7    +0,2 -> 30,6
 *     distanza    -0,3 -> 30,5     0 -> 26,7    +0,3 -> 25,0
 *     scala       0,85 -> 28,1   1,0 -> 26,7     1,2 -> 26,4
 *
 * Quota e trasversale hanno un minimo NETTO dov'e' adesso; distanza e scala
 * guadagnano meno di due livelli. Il piazzamento e' in un minimo locale su
 * tutti e cinque i gradi di liberta'.
 *
 * **«Il residuo non e' un errore di piazzamento» ERA SBAGLIATO, e adesso c'e'
 * la misura che lo dice.** Questo paragrafo sosteneva che i 26,7 livelli
 * fossero strutturali -- il guscio mostra piu' stanza della lastra, quindi una
 * parte dello scarto e' cio' per cui il guscio esiste. Ragionamento buono,
 * verifica mancante. Con `MASCHERA=lastra` si contano SOLO i pixel dove la
 * lastra disegna, dove le due immagini devono coincidere per costruzione:
 *
 *     tutti i pixel        24,3
 *     solo dove la lastra disegna   23,9
 *
 * Quattro decimi. La stanza in piu' non spiega niente: **lo scarto e' il
 * piazzamento**. E non e' nemmeno una traslazione -- cercato lo spostamento
 * migliore fra le due immagini su una griglia di 40x30 pixel, il minimo resta a
 * (0,0) con lo stesso 24,3. Guardate una accanto all'altra, la ragione si vede:
 * il guscio mostra la stanza INGRANDITA, col montante del finestrone molto piu'
 * grande e la coppia fuori quadro a destra. E' un errore di posa fra il
 * proiettore e la camera del sito, non di ritaglio.
 *
 * Quindi questo metro sa dire «grossolanamente fuori posto» ma **non sa
 * certificare che sia giusto**: ha un pavimento sopra la soglia dei 10,6. Chi
 * riprende non perda una giornata a minimizzare un numero che non puo'
 * scendere.
 *
 * Il metro che chiuderebbe la domanda e' un altro, e non l'ho costruito:
 * confrontare il guscio col FOTOGRAMMA DELLA CLIP dentro il solo rettangolo
 * del vano, dove le due immagini devono coincidere per costruzione.
 *
 * ─── COME SI LEGGE
 *
 * `scarto medio` in livelli su 255, sui soli pixel dove ALMENO UNA delle due
 * immagini ha qualcosa (fuori dal salone sono entrambe la stessa nave, e
 * includerle diluirebbe l'errore fino a farlo sparire).
 *
 * Il riferimento: due riprese della STESSA stanza in due pose diverse fanno
 * 10,6 livelli (`salone3d.js`, misura della posa tesa). Sotto quella soglia il
 * guscio non e' distinguibile dalla lastra; sopra i 30 si sta guardando
 * un'altra cosa.
 */
import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { apriBrowser } from './browser.mjs'

const PORTA = Number(process.env.PORTA_COLLAUDO || 5431)
const BASE = `http://localhost:${PORTA}/nautica/`
const P = Number(process.env.P || 0.02)
const LARG = Number(process.env.LARGHEZZA || 1440)
const ALT = Number(process.env.ALTEZZA || 900)
const FUORI = 'uscite/registro'

async function serviteci () {
  try {
    const r = await fetch(BASE, { redirect: 'manual' })
    if (r.status < 500) return null
  } catch {}
  const s = spawn('npm', ['run', 'preview', '--', '--port', String(PORTA)], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    try { await fetch(BASE, { redirect: 'manual' }); return s } catch {}
    await new Promise(r => setTimeout(r, 500))
  }
  s.kill()
  console.error('  il server non si e alzato')
  process.exit(2)
}

/**
 * Si va a un `p` del RACCONTO e si aspetta che ci sia arrivato. Le frazioni di
 * pagina sono vietate in questo repo da tre cancelli rotti, e io le ho
 * reintrodotte una volta: non succede piu'.
 */
async function vaiA (pg, p) {
  await pg.evaluate((pp) => {
    const n = window.__nautica
    scrollTo(0, n.cimaSezione + pp * n.corsaRacconto)
  }, p)
  return pg.waitForFunction(
    (pp) => Math.abs((window.__nautica.p ?? -1) - pp) < 0.003,
    p, { timeout: 8000 }
  ).then(() => true).catch(() => false)
}

mkdirSync(FUORI, { recursive: true })
const preview = await serviteci()
const browser = await apriBrowser({ conGpu: true })

/** i pixel grezzi della scena a `P`, con o senza guscio */
async function pixel (conGuscio) {
  const pg = await browser.newPage()
  await pg.setViewportSize({ width: LARG, height: ALT })
  const conv = process.env.CONV || '0'
  await pg.goto(BASE + '?ispeziona=1&fermo=6' + (conGuscio ? `&guscio=1&conv=${conv}&dz=${process.env.DZ || 0}&dx=${process.env.DX || 0}` +
      `&dy=${process.env.DY || 0}&ds=${process.env.DS || 1}` : ''), { waitUntil: 'load' })
  await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 45000 })
  /* si aspetta che il video della stanza stia girando: confrontare due
     fotogrammi di cui uno e' ancora nero misurerebbe il caricamento */
  await pg.waitForFunction(() => {
    const v = document.querySelector('video[src*="salone-largo"]')
    return v && v.readyState >= 2 && v.currentTime > 0.05
  }, null, { timeout: 30000 }).catch(() => {})
  await vaiA(pg, P)
  await pg.waitForTimeout(1500)
  /**
   * ─── SI INCHIODA IL FILMATO, o si misura il film invece del piazzamento
   *
   * Le due schermate vengono da due caricamenti diversi, e la clip del salone
   * SUONA: catturano due istanti diversi della stessa stanza. Misurato, e mi
   * stava ingannando: la stessa identica configurazione dava 20,1 e poi 31,5,
   * e una ricerca sulla distanza usciva non monotona -- meno a -0,2, di piu' a
   * 0, meno a +0,2. Stavo per leggere quel disordine come un minimo.
   *
   * Non e' un difetto del sito: e' il metro che oscilla piu' della cosa
   * misurata. Un metro cosi' non serve a cercare, e cercare era il suo unico
   * scopo.
   *
   * Si mette ogni video sullo stesso fotogramma e in pausa. Il valore non
   * conta, conta che sia LO STESSO nelle due catture.
   */
  await pg.evaluate(async () => {
    const vs = [...document.querySelectorAll('video')]
    for (const v of vs) {
      try {
        v.pause()
        if (v.readyState >= 1 && Number.isFinite(v.duration)) {
          v.currentTime = Math.min(1.0, v.duration * 0.2)
        }
      } catch {}
    }
    await new Promise(r => setTimeout(r, 600))
    /* un fotogramma di disegno dopo il seek, o la texture porta ancora il
       fotogramma di prima */
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  })
  await pg.waitForTimeout(400)
  const via = `${FUORI}/${conGuscio ? 'guscio' + [process.env.CONV||0,process.env.DZ||0,process.env.DX||0,process.env.DY||0,process.env.DS||1].join('_') : 'lastra'}-p${String(Math.round(P * 1000)).padStart(4, '0')}.png`
  await pg.screenshot({ path: via })
  /**
   * ─── SI LEGGE LA SCHERMATA, NON LA TELA
   *
   * Il primo tentativo rileggeva la tela WebGL con `drawImage` in un canvas 2D.
   * Senza `preserveDrawingBuffer` quel buffer e' gia' stato scartato: torna
   * NERO. E il nero passava per intero il filtro «dove c'e' qualcosa», quindi
   * il confronto girava su ZERO pixel e stampava «scarto medio 0,0 -- il guscio
   * non si distingue dalla lastra».
   *
   * Cioe' lo strumento nato per non farmi piu' sbagliare il piazzamento mi
   * avrebbe detto che era giusto. E' la forma esatta del difetto che questo
   * repo insegue da tre giorni: un metro rotto non da' errore, da' un numero.
   *
   * La schermata di Playwright passa dal compositore e contiene i pixel veri.
   */
  await pg.close()
  return { via }
}

const senza = await pixel(false)
const con = await pixel(true)
await browser.close()
preview?.kill()

/**
 * Lo scarto si misura DOVE C'E' QUALCOSA. Fuori dal salone le due immagini sono
 * la stessa nave: contarle diluirebbe l'errore fino a farlo sparire, e un
 * guscio completamente fuori posto darebbe un numero piccolo.
 */
function grigi (via) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', via, '-vf', 'scale=360:225',
                                 '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
                      { maxBuffer: 1 << 26 })
  return r.stdout
}
const A = grigi(senza.via)
const B = grigi(con.via)
if (!A.length || A.length !== B.length) {
  console.error('\n  NON MISURABILE: le due schermate non si leggono o non hanno la stessa forma.\n')
  process.exit(2)
}

/**
 * ─── E SI PUO' GUARDARE SOLO DOVE LA LASTRA HA QUALCOSA (`MASCHERA=lastra`)
 *
 * Il residuo di questo metro e' strutturale, e la testa del file lo dice: il
 * guscio mostra PIU' STANZA della lastra -- pavimento, soffitto, pareti oltre
 * il rettangolo 16:10 -- quindi una parte dello scarto e' esattamente cio' per
 * cui il guscio esiste. Con questa maschera si contano solo i pixel dove la
 * LASTRA disegna: li' le due immagini devono coincidere per costruzione, e il
 * numero smette di contenere la ragione per cui non possono coincidere.
 *
 * Serve a separare due domande che il numero unico confondeva: «il guscio e'
 * piazzato bene?» e «il guscio mostra piu' stanza?».
 */
const SOLO_DOVE_LA_LASTRA_DISEGNA = process.env.MASCHERA === 'lastra'

let somma = 0
let contati = 0
let peggio = 0
for (let i = 0; i < A.length; i++) {
  if (SOLO_DOVE_LA_LASTRA_DISEGNA ? A[i] < 6 : (A[i] < 6 && B[i] < 6)) continue
  const d = Math.abs(A[i] - B[i])
  somma += d
  contati++
  if (d > peggio) peggio = d
}

/**
 * ─── SE NON HA CONFRONTATO NIENTE, NON DA' UN VERDETTO
 *
 * La prima versione girava su zero pixel e stampava «scarto medio 0,0 -- il
 * guscio non si distingue dalla lastra». Un numero perfetto su una misura che
 * non era avvenuta. Adesso il caso ha un nome e un'uscita diversa da zero.
 */
if (contati < A.length * 0.02) {
  console.error(`\n  NON MISURABILE: solo ${contati} pixel su ${A.length} avevano qualcosa.`)
  console.error('  Le due schermate sono quasi tutte nere: non e stato confrontato niente,')
  console.error('  e uno scarto di zero su zero pixel non vuol dire che il guscio sia a posto.\n')
  process.exit(2)
}
const medio = somma / contati

console.log(`\n  REGISTRO DEL GUSCIO   a p ${P.toFixed(3)}, ${LARG}x${ALT}`)
console.log('  ' + '-'.repeat(62))
console.log(`  scarto medio    ${medio.toFixed(1)} livelli su 255   (${contati} pixel confrontati)`)
console.log(`  scarto massimo  ${peggio.toFixed(0)}`)
console.log('')
console.log('  riferimento: due pose DIVERSE della stessa stanza fanno 10,6 livelli.')
if (medio < 10.6) {
  console.log('  → sotto quella soglia: il guscio non si distingue dalla lastra.')
} else if (medio < 30) {
  console.log('  → in registro grossolano: la stanza c e, la posa non combacia ancora.')
} else {
  console.log('  → fuori registro: si sta guardando un altra cosa.')
}
console.log(`\n  ${senza.via}\n  ${con.via}\n`)
