/**
 * IL FOTOGRAMMA IN CUI IL FILMATO PASSA IL COMANDO AL 3D.
 *
 *     node strumenti/consegna.mjs <filmato.mp4> [cartella-uscita]
 *
 * La cucitura ha due versi, e si sceglie con `VERSO=` (vedi piu' sotto):
 * `ultimo` -- di serie -- e' il filmato che consegna al 3D (`discesa.mp4`);
 * `primo` e' il 3D che consegna al filmato (`traversata.mp4`).
 *
 * ─── PERCHE' ESISTE
 *
 * La discesa dal salone al meccanismo la fa un filmato: a trenta metri la nave
 * in tempo reale non regge il confronto con una fotografia, e il committente
 * l'ha detto senza giri -- «per evitare che si veda quel modellino che sembra
 * plastica». Il 3D riprende il comando sul primo piano del meccanismo.
 *
 * Quel passaggio vive o muore su UN fotogramma: l'ultimo del filmato e il primo
 * del 3D. Se non coincidono, chi guarda vede uno stacco e capisce che finora
 * stava guardando un video -- che e' esattamente cio' che il sito non vuole
 * dire, perche' da li' in poi il 3D e' vero e si comanda.
 *
 * ─── COSA MISURA, E PERCHE' NON UN SOLO NUMERO
 *
 * Un PSNR fra i due fotogrammi non serve: il filmato e' una ricostruzione
 * generativa del mio fotogramma, quindi differisce ovunque di poco e da
 * nessuna parte in modo utile. Un numero solo direbbe «diverso» senza dire in
 * che cosa, e si finirebbe a inseguirlo.
 *
 * Servono le grandezze che l'occhio usa per accorgersi di uno stacco, e sono
 * poche:
 *
 *   1. **la linea d'acqua** -- a quale riga sta, nei due. Se salta, e' la cosa
 *      piu' visibile che esista: l'orizzonte non si sposta mai;
 *   2. **il riquadro della pinna** -- dove sta e quanto e' grande. E' il
 *      soggetto: se cambia scala o posizione, lo stacco e' uno stacco;
 *   3. **i toni** -- quello sotto la linea, dove c'e' l'acqua, e quello sopra.
 *      Un salto di colore si vede anche quando la geometria combacia.
 *
 *      Qui c'era scritto «i TRE toni -- acqua, cielo, scafo». I toni misurati
 *      sono sempre stati due: il terzo non e' mai stato scritto in codice.
 *      Corretto leggendo `linea()`, che restituisce `sopra` e `sotto` e basta.
 *
 * Ognuna si legge nei due fotogrammi con lo stesso codice, e si stampa la
 * differenza. Cosi' quello che va corretto si sa gia' cos'e'.
 */
import { spawn, execFileSync } from 'node:child_process'
import { connect } from 'node:net'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { apriBrowser } from './browser.mjs'

const [filmato, cartella = 'consegna'] = process.argv.slice(2)
/**
 * ─── L'ISTANTE DELLA CONSEGNA E' UNA LEVA, ed e' l'unica onesta
 *
 * La pinna nel filmato e' alta il doppio della mia. Ho provato ad alzare la
 * camera: non si puo', con beccheggio zero alzarsi vuol dire guardare un altro
 * pezzo di nave (misurato, sta scritto in `scena/index.js`). E inclinare la
 * pinna a mano sarebbe una posa che la fisica non produce -- la bugia che
 * questo sito rifiuta.
 *
 * Ma la posa della pinna cambia da sola nel tempo, perche' e' l'uscita di un
 * integratore. Allora la leva e' QUALE ISTANTE si consegna: si spazzolano gli
 * istanti, si misura la pinna in ciascuno, e si prende quello che somiglia al
 * filmato. Nessuna geometria toccata, nessun numero inventato.
 *
 * Serve pero' che il fotogramma sia ripetibile, o si misura il caso: da qui
 * `?fermo=`, che inchioda simulazione, onde, dimostrazione automatica e seme
 * del mare. Vedi `stato.js`.
 */
const ISTANTI = process.env.ISTANTI
  ? process.env.ISTANTI.split(',').map(Number)
  : [12]
/**
 * E LA SECONDA LEVA E' LA DISTANZA, che l'invariante non tocca. Avvicinarsi
 * non inclina niente: il beccheggio resta zero e la linea d'acqua resta sulla
 * mezzeria. Si spazzola con `?raggio=`, di serie il valore spedito.
 */
const RAGGI = process.env.RAGGI ? process.env.RAGGI.split(',').map(Number) : [null]
/**
 * ─── IN CHE VERSO SI CUCE
 *
 * Lo strumento e' nato per `discesa.mp4`, che FINISCE dove il 3D comincia:
 * li' il bersaglio e' l'ULTIMO fotogramma del filmato. `traversata.mp4` fa
 * l'opposto -- e' il 3D che passa il comando al filmato -- quindi il
 * fotogramma che deve combaciare e' il suo PRIMO.
 *
 * Cambia solo QUALE fotogramma si estrae: le tre letture (linea d'acqua,
 * altezza della pinna, toni) sono le stesse, perche' la domanda e' la stessa
 * -- «l'occhio se ne accorge?» -- e non dipende da chi consegna a chi.
 *
 *     VERSO=ultimo   (di serie)  il filmato consegna al sito
 *     VERSO=primo                il sito consegna al filmato
 */
const VERSO = process.env.VERSO === 'primo' ? 'primo' : 'ultimo'
if (!filmato) { console.error('uso: consegna.mjs <filmato.mp4> [cartella]'); process.exit(2) }
mkdirSync(cartella, { recursive: true })

const L = 1280
const A = 720

/* --- il fotogramma del filmato al capo giusto, non uno vicino.
 *
 * ULTIMO: `-sseof -0.05` prende gli ultimi 50 ms; senza, con `-ss` si atterra
 * su un fotogramma qualunque e si confronta con qualcosa che non e' la
 * consegna.
 *
 * PRIMO: nessun `-ss` e nessun `-sseof`. Sono la stessa trappola all'altro
 * capo -- `-ss 0` non e' garantito che cada sul fotogramma zero, perche' la
 * ricerca atterra sul keyframe utile. Si decodifica dall'inizio e si prende il
 * primo fotogramma che esce, che e' il fotogramma zero per costruzione. */
const daFilmato = join(cartella, `filmato-${VERSO}.png`)
execFileSync('ffmpeg', ['-v', 'error', '-y',
  ...(VERSO === 'ultimo' ? ['-sseof', '-0.05'] : []), '-i', filmato,
  '-update', '1', '-frames:v', '1', '-vf', `scale=${L}:${A}`, daFilmato])

/* --- il fotogramma del sito alla battuta del meccanismo */
const PORTA = process.env.PORTA_COLLAUDO || 5233
/**
 * ─── LA PORTA DEV'ESSERE LIBERA, o si misura il sito di qualcun altro
 *
 * SINTOMO: sette istanti diversi hanno dato sette righe IDENTICHE -- stessa
 * linea, stessi toni, stessa pinna fino all'ultimo pixel -- e i fotogrammi
 * salvati non erano il meccanismo, era il salone. Sette misure sbagliate e
 * nessun errore da nessuna parte.
 *
 * CAUSA: due guasti che si tengono per mano. Il primo e' che `preview.kill()`
 * con `shell: true` su Windows ammazza il `cmd.exe`, non il `vite` che ci sta
 * sotto: ogni corsa lascia un server vivo. Il secondo e' che `vite preview`,
 * trovando la porta occupata, NON si ferma -- prende la prima libera e lo dice
 * su uno stdio che qui e' `ignore`. Cosi' lo strumento avviava un server sulla
 * 5255 e poi fotografava la 5251, che e' il server di una corsa di due ore
 * prima.
 *
 * ISOLATA: con `netstat -ano`, che ha mostrato in ascolto la 5251 e la 5252
 * chieste da me, piu' la 5253..5259 che non ho mai chiesto -- cioe' la scia
 * dei ripieghi di vite, una per corsa. Le porte 5223..5244 erano di altri, ed
 * e' esattamente il motivo per cui qui si sceglie una porta a mano.
 *
 * CURA: si guarda PRIMA se qualcuno risponde su quella porta, e se risponde ci
 * si ferma. Non c'e' modo di distinguere il proprio sito da quello di un
 * collega guardando i pixel, quindi non si prova nemmeno: si rifiuta di
 * misurare. E la chiusura passa da `taskkill /T`, che l'albero lo prende tutto.
 */
/* Si prova su TUTTE E DUE le pile: `netstat` mostrava il server in ascolto su
 * `[::1]`, cioe' solo IPv6, e una prova sul solo 127.0.0.1 avrebbe detto
 * «libera» sopra un server vivo. Il browser va su `localhost`, che su Windows
 * risolve ::1 per primo: la prova deve guardare dove guarda lui. */
const rispondeSu = (host) => new Promise((esito) => {
  const s = connect({ port: Number(PORTA), host })
  s.on('connect', () => { s.destroy(); esito(true) })
  s.on('error', () => esito(false))
  setTimeout(() => { s.destroy(); esito(false) }, 1500)
})
const occupata = (await Promise.all(['127.0.0.1', '::1'].map(rispondeSu))).some(Boolean)
if (occupata) {
  console.error([
    '', `  LA PORTA ${PORTA} E GIA OCCUPATA.`,
    '  Qualcuno risponde li: puo essere una corsa precedente rimasta viva, o un',
    '  collega. In tutti e due i casi misurerei un sito che non ho avviato io.',
    '  Scegline un altra con PORTA_COLLAUDO=, o chiudi quello che c e.', ''
  ].join('\n'))
  process.exit(2)
}
const preview = spawn('npx', ['vite', 'preview', '--port', PORTA, '--strictPort'], { shell: true, stdio: 'ignore' })
const chiudiPreview = () => {
  if (process.platform === 'win32') {
    try { execFileSync('taskkill', ['/pid', String(preview.pid), '/T', '/F'], { stdio: 'ignore' }) } catch { /* gia morto */ }
  } else preview.kill()
}
const browser = await apriBrowser({ conGpu: true })
const pg = await browser.newPage()
await pg.setViewportSize({ width: L, height: A })
async function allaConsegna (t, raggio) {
  const r = raggio === null ? '' : `&raggio=${raggio}`
  await pg.goto(`http://localhost:${PORTA}/?ispeziona=1&fermo=${t}${r}`, { waitUntil: 'load' })
  await pg.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
  return cerca()
}

/**
 * ─── DOVE STA IL FOTOGRAMMA DI CONSEGNA, e non e' piu' dove stava
 *
 * La battuta si CERCA, non si indovina: la pagina ha gia' cambiato altezza una
 * volta e ogni frazione fissa scritta a mano e' finita su un'altra scena.
 *
 * SINTOMO: spazzolando sei istanti, cinque righe su sei uscivano identiche
 * fino all'ultimo pixel su un fotogramma del SALONE, e la sesta -- una
 * qualunque, diversa a ogni corsa -- dava una pinna di 179 177 165 152 contro
 * i 180 177 165 152 del filmato. Tre colonne su quattro esatte. Un accordo
 * simile fra un render in tempo reale e una ricostruzione generativa non
 * esiste: quel numero era troppo bello, ed e' stato quello a smascherarlo.
 *
 * CAUSA: il sito la traversata CE L'HA GIA'. `scena/traversata.js` la monta
 * come tessitura video su un piano appeso alla camera, e `regia.js` gliela fa
 * prendere il comando nell'ultimo 7% della corsa (`S.traversata = [0.93, 1]`).
 * Questa funzione scandiva dal FONDO della sezione verso l'alto cercando la
 * battuta 'meccanismo': il fondo e' p=1, cioe' dentro la traversata a piena
 * opacita'. Quindi fotografavo il filmato. Le cinque righe uguali erano il
 * filmato a fine corsa -- che finisce sul salone, ed e' per questo che c'erano
 * due persone su un divano -- e la sesta era il filmato al suo primo
 * fotogramma, cioe' il bersaglio confrontato con se stesso.
 *
 * ISOLATA: la battuta diceva 'meccanismo' ed era vero, l'emersione diceva
 * 1.000 ed era vero, la pila degli elementi al centro dello schermo diceva
 * canvas ed era vero, i tre `<video>` erano fuori campo a opacita' zero ed era
 * vero. Tutti i testimoni dicevano di si' perche' nessuno di loro sapeva della
 * traversata. L'ha detta `grep traversata src/`, dopo che il numero troppo
 * bello ha fatto venire il dubbio.
 *
 * CURA: NON qui. La posizione giusta resta questa -- il primo piano in fondo
 * alla corsa, che e' quello da cui il filmato e' stato ricostruito. Ho provato
 * a fermarmi prima, alla posizione in cui la regia dichiara `traversata='no'`:
 * col verso `primo` sembrava sensato, ma col verso `ultimo` il collaudo di
 * controllo su `discesa.mp4` e' crollato da 152 px a 37,8, cioe' misurava una
 * mezza nave. Il posto non era sbagliato: era sbagliato spostarlo.
 *
 * Il guasto vero non era DOVE fotografare, era COSA: sopra il 3D c'era il
 * filmato. Si spegne, e si misura il 3D -- vedi `senzaFilmato`.
 */
const cerca = () => pg.evaluate(async () => {
  const sez = document.querySelector('#dimostrazione')
  const H = document.documentElement.scrollHeight - innerHeight
  const r = sez.getBoundingClientRect()
  const cima = (scrollY + r.top) / H
  const fondo = (scrollY + r.bottom - innerHeight) / H
  for (let f = fondo; f >= cima; f -= 0.002) {
    scrollTo(0, Math.round(H * f))
    await new Promise((y) => requestAnimationFrame(() => requestAnimationFrame(y)))
    const p = sez.querySelector('.palco[data-battuta]')
    const b = p.getBoundingClientRect()
    if (p.dataset.battuta === 'meccanismo' &&
        b.top > -1 && b.bottom > innerHeight - 1) return f
  }
  return null
})

/* ─── LE LETTURE */
const pixel = (f) => execFileSync('ffmpeg', ['-v', 'error', '-i', f,
  '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1e9 })
const lum = (b, x, y) => (0.2126 * b[(y * L + x) * 3] + 0.7152 * b[(y * L + x) * 3 + 1] +
                          0.0722 * b[(y * L + x) * 3 + 2])

/**
 * LA LINEA D'ACQUA: la riga dove la luminanza media crolla di piu'.
 * Non si cerca un colore -- il cielo e' crema in uno e grigio nell'altro --
 * si cerca il SALTO, che c'e' in tutti e due perche' l'acqua e' scura.
 */
function linea (b) {
  const grezza = []
  for (let y = 0; y < A; y++) {
    let s = 0
    for (let x = 0; x < L; x += 4) s += lum(b, x, y)
    grezza.push(s / (L / 4))
  }
  /**
   * ─── UNA RIGA SOLA SPOSTAVA LA LINEA D'ACQUA DI 22 PIXEL
   *
   * SINTOMO: sul fotogramma del sito la linea veniva letta a y=354 con un
   * salto di 154,6 -- il salto piu' grande di tutto il fotogramma, quindi
   * apparentemente il pelo dell'acqua. Ma a y=354 non c'e' nessun pelo: sopra
   * e sotto la media di riga vale 178, piatta, per ventotto righe. Il numero
   * era sbagliato E sicuro di se', che e' il modo in cui un metro rotto mente.
   *
   * CAUSA: in mezzo a quella banda c'e' UNA riga a 24 -- un filo scuro largo
   * un pixel dell'interfaccia. `media[y-6] - media[y+6]` con y=354 pesca
   * media[348]=178 e media[360]=24: il rilevatore misurava lo spessore di un
   * filo, non la superficie del mare.
   *
   * ISOLATA: stampando la media di riga da 336 a 384 sui due fotogrammi. Nel
   * filmato la banda scende in gradiente (121 -> 130 -> 80 -> 58) e non ha
   * righe fuori scala; nel sito e' una lastra piatta a 178 con un solo 24
   * dentro. Poi ordinando tutti i salti: tolto quello, il massimo successivo
   * sta a y=376, cioe' dove la banda finisce davvero.
   *
   * CURA: una mediana su tre righe prima di cercare il salto. Una mediana
   * cancella un valore isolato e lascia intatto un gradiente, che e' proprio
   * la differenza fra il filo e il mare. Sul fotogramma di controllo --
   * l'ultimo di `discesa.mp4`, il bersaglio di taratura agli atti -- la lettura
   * passa da 371 a 372: la correzione non riscrive le misure gia' prese.
   */
  const media = grezza.map((v, y) => {
    const t = [grezza[y - 1] ?? v, v, grezza[y + 1] ?? v].sort((p, q) => p - q)
    return t[1]
  })
  let peggio = 0
  let riga = 0
  for (let y = 8; y < A - 8; y++) {
    const d = media[y - 6] - media[y + 6]
    if (d > peggio) { peggio = d; riga = y }
  }
  return { y: riga, salto: peggio, sopra: media[riga - 20] || 0, sotto: media[riga + 40] || 0 }
}

/**
 * LA PINNA: quanto e' ALTA a schermo, e si misura per colonne.
 *
 * Il rettangolo che contiene tutti i pixel chiari non serve: sott'acqua ci sono
 * anche il martinetto, le staffe, il bordo dello scafo -- e nel fotogramma del
 * sito anche i riquadri dell'interfaccia. Su quattro colonne che cadono in
 * mezzo alla pinna in entrambi i fotogrammi si contano invece i pixel chiari
 * sotto la linea: e' l'altezza proiettata, che e' proprio la grandezza in cui i
 * due fotogrammi differiscono.
 */
const COLONNE = [800, 850, 900, 950]
const X1 = 660
const X2 = 1160
function altezzaPinna (b, y0) {
  const acqua = []
  for (let y = y0 + 12; y < A; y += 3) for (let x = X1; x < X2; x += 3) acqua.push(lum(b, x, y))
  acqua.sort((p, q) => p - q)
  const soglia = acqua[Math.floor(acqua.length / 2)] + 25
  /**
   * ─── E SI CONTA IL TRATTO PIU' LUNGO, non tutti i pixel chiari della colonna
   *
   * SINTOMO: sul fotogramma del sito la colonna x=850 dava 164 px, e la pinna
   * li' e' alta 155. I 9 px in piu' non erano rumore: erano tre pezzi staccati
   * a y=641, y=661..667 e y=687, cioe' il bordo del riquadro PROPULSION e la
   * scritta STABILISATION. Il totale gonfiava di circa 5 px di media, e il
   * segno cambiava il verdetto: col conteggio pieno l'istante 8,5s risultava a
   * 0,5 px dal bersaglio, cioe' PERFETTO, mentre la pinna vera e' corta di 18.
   *
   * CAUSA: la testata di questa funzione dichiara di misurare l'ALTEZZA
   * PROIETTATA della pinna e avverte lei stessa che «nel fotogramma del sito
   * ci sono anche i riquadri dell'interfaccia» -- ma poi sommava tutti i pixel
   * sopra soglia della colonna, interfaccia inclusa. Sul filmato non si vedeva,
   * perche' un filmato l'interfaccia non ce l'ha: il difetto stava tutto e solo
   * dalla parte del sito, cioe' dalla parte che si voleva correggere.
   *
   * ISOLATA: stampando i TRATTI CONTIGUI invece del totale, col colore al loro
   * centro. La pinna e' un tratto solo, lungo e grigio (rgb 81,89,89); i pezzi
   * spuri sono lunghi 1, 2 e 7 px e sono verde acqua (rgb 47,136,122), cioe'
   * il colore dell'interfaccia. Sul filmato i tratti erano gia' uno solo per
   * colonna, tranne 4 px di banda del pelo dell'acqua a x=800.
   *
   * CURA: il tratto contiguo piu' lungo. Sul fotogramma di controllo --
   * l'ultimo di `discesa.mp4` -- le colonne sono gia' tratti unici e la media
   * resta 158,0 contro i 158,5 agli atti: la correzione non tocca il bersaglio
   * di taratura, toglie solo quello che non e' pinna.
   */
  /**
   * ─── E IL TRATTO SCAVALCA I BUCHI FINO A 24 PX, o si dimezza la pinna
   *
   * SINTOMO: sul primo piano del 3D la colonna x=800 dava 84 px dove la pinna
   * e' alta 153. Non gonfiata: DIMEZZATA, cioe' il difetto opposto a quello
   * che il tratto piu' lungo era venuto a chiudere.
   *
   * CAUSA: la pinna del 3D ha una fascia scura addosso -- l'ombra del suo
   * stesso bordo d'uscita -- che a x=800 va da y=538 a y=554. Sotto soglia, il
   * tratto si spezza in due, e il piu' lungo dei due e' meta' della pinna.
   * Nel filmato non succedeva perche' li' la pinna e' illuminata piatta: il
   * difetto e' comparso solo quando ho puntato il metro sul 3D, cioe' quando
   * ho cambiato dominio senza rimisurare.
   *
   * ISOLATA: stampando i tratti contigui con gli estremi. Il buco DENTRO la
   * pinna e' lungo 17 px; il vuoto fra la fine della pinna (y=606) e il primo
   * riquadro dell'interfaccia (y=641) e' lungo 35. Sono due popolazioni
   * separate, e non di poco: c'e' un fattore due fra loro.
   *
   * CURA: si scavalcano i buchi fino a 24 px. Il numero non e' scelto a occhio
   * ed e' l'unica cosa che qui va difesa: sta in mezzo ai due estremi
   * MISURATI, con sette px di margine sotto e undici sopra. Se un giorno una
   * di quelle due distanze cambia, questo numero va rimisurato -- non
   * ritoccato.
   *
   * Cosa costa: nel filmato la banda del pelo dell'acqua a x=800 sta 4 px sopra
   * la pinna e viene inglobata, +8 px su una colonna sola, +2,0 px sulla media.
   * E' un errore noto, in eccesso, e piccolo rispetto ai 69 px che la cura
   * recupera dall'altra parte.
   */
  const PONTE = 24
  const alt = COLONNE.map((x) => {
    let piuLungo = 0
    let inizio = null
    let ultimo = null
    for (let y = y0 + 8; y < A; y++) {
      if (lum(b, x, y) > soglia) {
        if (inizio === null || y - ultimo > PONTE) inizio = y
        ultimo = y
        if (ultimo - inizio + 1 > piuLungo) piuLungo = ultimo - inizio + 1
      }
    }
    return piuLungo
  })
  return { alt, media: alt.reduce((p, q) => p + q, 0) / alt.length }
}

/**
 * ─── SI ASPETTA UN NUMERO, NON UN TEMPO
 *
 * SINTOMO: lo stesso comando, `?fermo=8.5` a raggio spedito, ha dato 149,8 px
 * in una corsa e 33,0 px in quella dopo. Stessi parametri, stessa macchina,
 * quattro volte e mezzo di differenza -- e nessuna delle due corse ha dato il
 * minimo segno che qualcosa fosse andato storto. Il fotogramma sbagliato e' un
 * fotogramma bello: la nave c'e', la pinna c'e', solo che e' slavata.
 *
 * CAUSA: `?fermo=` inchioda la SIMULAZIONE -- tempo, onde, seme del mare -- e
 * questo lo fa bene. Non inchioda il CARICAMENTO: la mappa di occlusione dello
 * scafo (`modelli/scafo-ao.webp`) e i due glb dell'impianto e della
 * sovrastruttura arrivano quando arrivano. Qui si aspettavano 2200 ms fissi
 * dopo lo scorrimento, che a preview calda bastano e a preview fredda no. Una
 * pausa a tempo e' una scommessa sul carico della macchina.
 *
 * ISOLATA: rifotografando la stessa battuta ogni 400 ms e misurando lo scarto
 * medio fra fotogrammi consecutivi in pixel decodificati -- non in byte del
 * png, che sono compressi e cambiano sempre. Lo scarto cala da 4,9 livelli a
 * 0,000 in circa 2,4 s, e poi risale due volte: 0,63 a 4,8 s e 1,43 a 8,4 s.
 * Mappando DOVE cambia, quei due risalti stanno solo su riquadri
 * dell'interfaccia (la fascia dei comandi in basso, un avviso in alto a
 * destra): non toccano ne' la pinna ne' l'acqua. Il guasto vero e' il primo
 * tratto, quello in cui l'ombreggiatura non c'e' ancora.
 *
 * CURA: due cancelli in fila, e nessuno dei due e' un orologio. Prima la rete
 * ferma -- cosi' la mappa di occlusione e i glb sono dentro per forza. Poi
 * l'immagine ferma: si rifotografa finche' due scatti di fila non differiscono
 * di meno di un ventesimo di livello. Il testimone sta dalla parte della cosa
 * misurata, che sono i pixel.
 *
 * E se non si ferma, lo DICE. Un fotogramma non stabilizzato che passa in
 * silenzio e' esattamente il guasto che questa funzione esiste per chiudere.
 */
const QUIETE = 0.05
const SCATTI_MAX = 50
const QUIETI_CHIESTI = 3

/**
 * ─── CHI C'E' DAVANTI ALL'OBIETTIVO, chiesto alla scena e non ai pixel
 *
 * Due testimoni, e sono su due piani diversi apposta: la BATTUTA dice dove sta
 * la pagina, l'EMERSIONE dice dove e' arrivata la scena 3D. Servono tutti e
 * due perche' si sono gia' contraddetti: nella corsa fotografata sul salone la
 * battuta diceva 'meccanismo' -- ed era vero -- mentre sul canvas c'era ancora
 * il salone. Un solo testimone avrebbe detto che andava tutto bene.
 *
 * `emersione` la scrive `disegna` a ogni fotogramma su `#scena`, quindi e' un
 * testimone che sta dalla parte della cosa misurata: se vale 1 e' perche' e'
 * stato disegnato un fotogramma emerso, non perche' qualcuno l'ha promesso.
 */
const chiDavanti = () => pg.evaluate(() => {
  const p = document.querySelector('#dimostrazione .palco[data-battuta]')
  const b = p?.getBoundingClientRect()
  const e = Number(document.querySelector('#scena')?.dataset.emersione)
  return {
    battuta: p?.dataset.battuta,
    emersione: e,
    traversata: p?.dataset.traversata,
    ok: p?.dataset.battuta === 'meccanismo' &&
        !!b && b.top > -1 && b.bottom > innerHeight - 1 && e > 0.999
  }
})

/**
 * ─── SI ASPETTA UN NUMERO, NON UN TEMPO
 *
 * SINTOMO, primo: lo stesso comando, `?fermo=8.5` a raggio spedito, ha dato
 * 149,8 px in una corsa e 33,0 px in quella dopo. Il fotogramma sbagliato e' un
 * fotogramma bello: la nave c'e', la pinna c'e', solo che e' slavata.
 *
 * CAUSA: `?fermo=` inchioda la SIMULAZIONE -- tempo, onde, seme del mare -- e
 * questo lo fa bene. Non inchioda il CARICAMENTO: la mappa di occlusione dello
 * scafo (`modelli/scafo-ao.webp`) e i due glb dell'impianto e della
 * sovrastruttura arrivano quando arrivano. Qui si aspettavano 2200 ms fissi
 * dopo lo scorrimento, che a preview calda bastano e a preview fredda no. Una
 * pausa a tempo e' una scommessa sul carico della macchina.
 *
 * ISOLATA: rifotografando la stessa battuta ogni 400 ms e misurando lo scarto
 * medio fra fotogrammi consecutivi in pixel decodificati -- non in byte del
 * png, che sono compressi e cambiano sempre. Lo scarto cala da 4,9 livelli a
 * 0,000 in circa 2,4 s, e poi risale due volte: 0,63 a 4,8 s e 1,43 a 8,4 s.
 * Mappando DOVE cambia, quei due risalti stanno solo su riquadri
 * dell'interfaccia (la fascia dei comandi in basso, un avviso in alto a
 * destra): non toccano ne' la pinna ne' l'acqua.
 *
 * ─── SINTOMO, SECONDO: E LA QUIETE DA SOLA NON BASTA
 *
 * Col solo cancello sulla quiete, cinque righe su sei di una spazzolata sono
 * uscite identiche fino all'ultimo pixel, e i fotogrammi erano IL SALONE. Una
 * riga sbagliata si discute; cinque righe identiche fra loro sono l'unico
 * indizio che qualcosa non torna, ed e' un indizio che si vede solo se si
 * guardano le righe insieme.
 *
 * CAUSA: subito dopo lo scorrimento il canvas ha ancora il salone e sta FERMO,
 * perche' la scena non ha ancora cominciato ad arrivare al meccanismo. Tre
 * scatti di fila identici li' dentro sono tre scatti quieti, e il cancello --
 * che sapeva solo confrontare pixel con pixel -- diceva «pronto» sul salone.
 * Un cancello che misura la quiete non distingue una scena arrivata da una
 * scena non ancora partita: sono tutte e due immobili.
 *
 * ISOLATA: interrogando la pagina invece dei pixel. La pila degli elementi al
 * centro dello schermo era sempre il canvas, i tre video erano fuori campo a
 * opacita' zero: il salone lo stava disegnando la scena 3D. E leggendo
 * `emersione` e la posizione della camera dopo quattro secondi fissi, erano
 * giuste in tutti i casi -- cioe' la scena ci arrivava, ma DOPO lo scatto.
 *
 * CURA: l'identita' si chiede PRIMA di ogni scatto, e la quiete si conta solo
 * mentre l'identita' regge. Se cambia, il conto riparte da zero. Cosi' il
 * cancello non puo' piu' scambiare «non e' ancora partita» per «e' arrivata».
 * E se non si ferma, o non arriva mai, lo DICE.
 */
/**
 * ─── SI SPEGNE IL FILMATO, o si misura il filmato contro se stesso
 *
 * SINTOMO: spazzolando sei istanti, cinque righe uscivano identiche fino
 * all'ultimo pixel su un fotogramma del SALONE, e la sesta -- una qualunque,
 * diversa a ogni corsa -- dava una pinna di 179 177 165 152 contro i 180 177
 * 165 152 del bersaglio. Tre colonne su quattro ESATTE. Un accordo simile fra
 * un render in tempo reale e una ricostruzione generativa non esiste: e' stato
 * quel numero troppo bello a far venire il dubbio, non un errore.
 *
 * CAUSA: il sito la traversata ce l'ha gia'. `scena/traversata.js` la monta
 * come tessitura video su un piano appeso alla camera e `regia.js` gliela fa
 * prendere il comando nell'ultimo 7% della corsa. Il primo piano in fondo alla
 * corsa -- dove questo strumento va a fotografare -- e' esattamente sotto quel
 * piano, a opacita' piena. Quindi fotografavo il filmato: le cinque righe
 * uguali erano il filmato a fine corsa, che finisce sul salone con due
 * persone, e la sesta era il filmato al suo primo fotogramma, cioe' il
 * bersaglio confrontato con se stesso.
 *
 * ISOLATA: la battuta diceva 'meccanismo' ed era vero, l'emersione diceva
 * 1.000 ed era vero, la pila degli elementi al centro dello schermo diceva
 * canvas ed era vero, i tre `<video>` erano fuori campo a opacita' zero ed era
 * vero. Tutti i testimoni dicevano di si' perche' nessuno sapeva della
 * traversata -- che infatti NON e' un `<video>` a schermo, e' una tessitura
 * dentro la scena. L'ha trovata `grep traversata src/`.
 *
 * CURA: si spegne il piano del filmato e si misura il 3D che ci sta sotto. E'
 * la stessa prova con cui in questo repo si e' scoperto che una luce non
 * arrivava: spegni, e guarda se cambia qualcosa. Il piano si riconosce da
 * quello che E', non da un nome -- l'unico materiale la cui tessitura ha per
 * immagine un elemento `<video>` che punta a `traversata` -- e la funzione
 * torna QUANTI ne ha spenti, cosi' se un giorno non ne trova piu' nessuno il
 * referto lo dice invece di misurare in silenzio la cosa sbagliata.
 */
const senzaFilmato = () => pg.evaluate(() => {
  let n = 0
  window.__nautica.scena.traverse((o) => {
    const m = o.material
    if (m && m.map && m.map.image && m.map.image.tagName === 'VIDEO' &&
        String(m.map.image.src).includes('traversata')) { m.opacity = 0; n++ }
  })
  return n
})

async function scattaFermo (f) {
  try { await pg.waitForLoadState('networkidle', { timeout: 30000 }) } catch { /* la rete non si e' mai fermata: decidono i cancelli sui pixel */ }
  let prec = null
  let quieti = 0
  for (let i = 0; i < SCATTI_MAX; i++) {
    const chi = await chiDavanti()
    if (!chi.ok) { prec = null; quieti = 0; await pg.waitForTimeout(300); continue }
    writeFileSync(f, await pg.screenshot())
    const b = pixel(f)
    if (prec && b.length === prec.length) {
      let s = 0
      for (let k = 0; k < b.length; k++) s += Math.abs(b[k] - prec[k])
      if (s / b.length < QUIETE) {
        /* l'identita' va riletta anche DOPO lo scatto: fra il controllo e il
         * png passa il tempo di una cattura, e il guasto che questo cancello
         * chiude e' fatto proprio di quel tempo li' */
        if (++quieti >= QUIETI_CHIESTI) return (await chiDavanti()).ok
      } else quieti = 0
    }
    prec = b
    await pg.waitForTimeout(300)
  }
  return false
}


const bf = pixel(daFilmato)
const lf = linea(bf)
const pf = altezzaPinna(bf, lf.y)

console.log('')
console.log(`IL BERSAGLIO — il ${VERSO} fotogramma del filmato`)
console.log(`  linea d acqua      riga ${lf.y}   tono sopra ${lf.sopra.toFixed(1)}  sotto ${lf.sotto.toFixed(1)}`)
console.log(`  pinna              altezza per colonna ${pf.alt.join(' ')}   media ${pf.media.toFixed(1)} px`)
console.log('')
console.log('E GLI ISTANTI DEL SITO')
/**
 * ─── E I TONI DEL SITO SI STAMPANO, o la terza grandezza non si legge
 *
 * SINTOMO: la testata dichiara TRE grandezze, la tabella degli istanti ne
 * mostrava DUE -- la riga della linea e l'altezza della pinna. Il tono sopra e
 * il tono sotto si misuravano gia' (`linea()` li restituisce e il bersaglio li
 * stampa) e per il sito si buttavano via: lo stacco di colore non si poteva
 * leggere dal referto, solo indovinare guardando il png.
 *
 * CAUSA: la tabella e' nata per spazzolare la SCALA della pinna, che era il
 * problema del momento; le altre colonne non sono mai state aggiunte.
 *
 * ISOLATA: mettendo a confronto cosa stampa il bersaglio (riga, tono sopra,
 * tono sotto, pinna) con cosa stampava ogni riga del sito (riga, pinna).
 *
 * Da leggere sapendo che i toni qui sono DUE, non tre: il terzo dichiarato in
 * testata -- il tono dello SCAFO -- non e' mai stato scritto in codice. Meglio
 * due numeri misurati che tre di cui uno inventato.
 */
console.log('  istante  raggio   linea   toni sopra/sotto   pinna              media    scarto sul bersaglio')

let migliore = null
for (const raggio of RAGGI) for (const t of ISTANTI) {
  const dove = await allaConsegna(t, raggio)
  if (dove === null) { console.error(`  ${t}s: non trovo la battuta del meccanismo`); continue }
  if (await senzaFilmato() === 0) console.error(`  ${t}s: NON HO TROVATO IL PIANO DELLA TRAVERSATA da spegnere — se il sito ce l ha, sto misurando il filmato`)
  const f = join(cartella, `sito-${t}s-r${raggio ?? 'x'}.png`)
  if (!await scattaFermo(f)) {
    const chi = await chiDavanti()
    console.error(`  ${t}s r${raggio ?? 'spedito'}: NON HO UN FOTOGRAMMA BUONO (battuta "${chi.battuta}", traversata "${chi.traversata}", emersione ${chi.emersione}) — riga saltata`)
    continue
  }
  const b = pixel(f)
  const ls = linea(b)
  const ps = altezzaPinna(b, ls.y)
  const scarto = Math.abs(ps.media - pf.media)
  const toni = `${ls.sopra.toFixed(1)}/${ls.sotto.toFixed(1)}`
  console.log(`  ${String(t).padStart(6)}s  ${String(raggio ?? 'spedito').padStart(7)}   ${String(ls.y).padStart(5)}   ${toni.padStart(16)}   ${ps.alt.join(' ').padEnd(18)} ${ps.media.toFixed(1).padStart(6)}   ${(ps.media - pf.media).toFixed(1).padStart(8)} px`)
  if (!migliore || scarto < migliore.scarto) migliore = { t, raggio, scarto, f, dove }
}
await browser.close()
chiudiPreview()

if (migliore) {
  console.log('')
  console.log(`  il piu' vicino e ${migliore.t}s a raggio ${migliore.raggio ?? 'spedito'}, a ${migliore.scarto.toFixed(1)} px dal bersaglio`)
  /* i due fotogrammi si impilano NELL'ORDINE IN CUI SI VEDONO, cosi' guardare
   * la coppia e' guardare lo stacco: chi consegna sopra, chi riceve sotto. */
  const ordine = VERSO === 'primo' ? [migliore.f, daFilmato] : [daFilmato, migliore.f]
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', ordine[0], '-i', ordine[1],
    '-lavfi', 'vstack', join(cartella, 'affiancati.png')])
  console.log(`  scritti: ${daFilmato}`)
  console.log(`           ${migliore.f}`)
  console.log(`           ${join(cartella, 'affiancati.png')}   (${VERSO === 'primo' ? 'sito sopra, filmato sotto' : 'filmato sopra, sito sotto'})`)
}
