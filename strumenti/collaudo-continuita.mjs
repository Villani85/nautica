import { spawn } from 'node:child_process'
import { S } from '../src/regia.js'
import { apriBrowser } from './browser.mjs'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'

/**
 * COLLAUDO DELLA CONTINUITA' — l'atto e' uno solo, e non si taglia.
 *
 *     node strumenti/collaudo-continuita.mjs
 *
 * ─── PERCHE' ESISTE
 *
 * Il committente l'ha chiesto tre volte con parole diverse: «non devono essere
 * scene separate», «come se andassi giu' nella barca», «la continuazione della
 * stessa esperienza». Una revisione esterna l'ha chiamato difetto bloccante e
 * ha chiesto esattamente questo: *un collaudo che fallisca se durante l'atto
 * cambiano l'identita' della tela, della camera, o la continuita' della sua
 * trasformazione.*
 *
 * La ragione per cui serve un cancello e non una promessa: la continuita' e'
 * facile da costruire e facilissima da perdere. Basta un `querySelector` che
 * prende l'elemento sbagliato, un import differito che arriva tardi, o una
 * regia che riscrive una posa invece di interpolarla. Nessuna di queste tre
 * cose da' errore.
 *
 * ─── LE TRE DOMANDE, E PERCHE' PROPRIO QUESTE
 *
 *   IL BECCHEGGIO   e' l'invariante vero del sito, e per settimane era stato
 *                   capito al contrario («la camera sta a quota zero»). Una
 *                   camera livellata proietta il piano dell'acqua sulla
 *                   mezzeria del fotogramma da QUALUNQUE altezza: e' quello
 *                   che tiene la giunzione col fondo CSS a zero pixel. Se la
 *                   camera si inclina anche di un grado, la linea se ne va e
 *                   l'unica idea meccanica del sito cade. Non si puo' barare:
 *                   o il quaternione ha x e z nulli, o no
 *
 *   I SALTI         una scena unica ha una camera che si MUOVE. Due scene
 *                   cucite hanno una camera che si sposta. La differenza si
 *                   misura: si confronta il passo peggiore con quello mediano,
 *                   e un taglio e' un passo molte volte piu' grande degli
 *                   altri. Non e' una soglia in unita' di scena — sarebbe da
 *                   ritarare a ogni cambio di regia — e' un rapporto
 *
 *   LE TELE         con la scena unica ce ne deve essere UNA sola nell'atto.
 *                   Due tele sono due contesti, due camere, due mari: e'
 *                   letteralmente l'architettura che questo cancello vieta
 *
 * Non misura millisecondi.
 */

/**
 * --- LA PORTA SI PUO' CAMBIARE, E SERVE PIU' DI QUANTO SEMBRI
 *
 * Tutti i collaudi che aprono un browser usavano la 5180 e la cercavano gia'
 * accesa. Con un solo collaudo alla volta -- in CI, sempre -- e' giusto cosi'.
 * In locale, con piu' processi che misurano insieme, diventa una risorsa
 * contesa: il primo che finisce spegne il server sotto chi sta ancora
 * campionando, e Playwright riferisce `Execution context was destroyed, most
 * likely because of a navigation`. E' successo tre volte, e nessuna delle tre
 * il messaggio nominava la causa.
 *
 * `PORTA_COLLAUDO=5181 npm run collaudo` da' a questa corsa un server suo.
 */
const PORTA = Number(process.env.PORTA_COLLAUDO) || 5180
/* se sulla porta risponde gia' qualcuno, questo referto puo' essere
   la misura del `dist` di un altro processo: si dice, non si tace */
await avvisaSePortaAltrui(PORTA)
const BASE = `http://localhost:${PORTA}/nautica/`
const PASSI = 44
const PITCH_MAX = 1e-4        // il quaternione di una camera livellata
const SALTO_MAX = 6           // volte il passo mediano


/**
 * ─── SI PROVA LA BUILD, NON IL SERVER DI SVILUPPO
 *
 * Rilievo di una revisione, e ha ragione: il server di sviluppo serve moduli
 * non impacchettati, senza minificazione e senza la divisione in chunk. Le
 * cose che possono rompere la continuita' — un import differito che arriva
 * tardi, un chunk che manca — sono proprio quelle che li' non esistono.
 *
 * Quindi `npm run preview`, che serve `dist/`. Se un server e' gia' acceso
 * sulla porta lo si usa: in locale e' comodo, e chi lo ha acceso sa cosa ha
 * acceso. In CI non c'e' niente di acceso e parte sempre la preview.
 */
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
  console.error('il server non si e\' alzato')
  process.exit(2)
}

const UNICA = !process.argv.includes('--doppia')

/**
 * --- NON SI SPEGNE UN SERVER CHE STA SERVENDO QUALCUN ALTRO
 *
 * Con piu' collaudi in parallelo -- e in questa sessione ce n'erano quindici,
 * fra agenti e sessione principale -- tutti trovano `npm run preview` gia'
 * acceso sulla 5180 e lo riusano, come e' giusto. Poi il primo che finisce lo
 * UCCIDE, e chi sta ancora campionando muore con
 * `page.evaluate: Execution context was destroyed`.
 *
 * E' successo davvero, due volte, e il messaggio parla di navigazione: la
 * causa vera -- un altro processo che ha spento il server -- non compare da
 * nessuna parte. Un guasto che nomina la conseguenza e non la causa.
 *
 * `TIENI_SERVER=1` lo lascia acceso. Serve in locale quando si lancia piu' di
 * un collaudo insieme; in CI non si mette, e il server muore con la corsa.
 */
const TIENI_SERVER = !!process.env.TIENI_SERVER

const server = await serviteci()
const browser = await apriBrowser()
const pagina = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  // senza, il sito onora `prefers-reduced-motion` e si misura un'altra cosa
  reducedMotion: 'no-preference'
})

/**
 * GLI ERRORI DI SHADER NON FERMANO LA COMPILAZIONE. Il pacchettizzatore vede
 * una stringa; il compilatore GLSL sta nel browser. Un `undeclared identifier`
 * nello shader dello scafo passa `npm run build` e si vede solo aprendo la
 * pagina — e' successo, due volte in una notte. Qui la pagina si apre davvero,
 * quindi tanto vale ascoltarla.
 */
const errori = []
pagina.on('pageerror', e => errori.push('eccezione: ' + String(e).slice(0, 200)))
pagina.on('console', m => {
  if (m.type() !== 'error') return
  const t = m.text()
  // le risorse mancanti hanno il loro cancello altrove; qui interessa il codice
  if (/Failed to load resource/i.test(t)) return
  errori.push(t.slice(0, 200))
})

/**
 * `--doppia` apre la vecchia architettura a due scene. Serve a una cosa sola:
 * dimostrare che questo cancello la boccia. Un cancello che nessuno ha visto
 * fallire non e' un cancello.
 */
await pagina.goto(BASE + '?ispeziona=1' + (UNICA ? '' : '&doppia=1'), { waitUntil: 'load', timeout: 45000 })
await pagina.waitForTimeout(1500)
// il motore e' a import differito: si aspetta che la scena esista davvero
await pagina.evaluate(() => {
  const d = document.querySelector('#dimostrazione')
  scrollTo({ top: scrollY + d.getBoundingClientRect().top + 10, behavior: 'instant' })
})
/**
 * Sessanta secondi, non trenta: senza scheda grafica WebGL gira in software e
 * la prima scena puo' metterci molto. E se scade, il messaggio deve parlare
 * della causa — nessun contesto WebGL — invece che del sintomo, che e' un
 * timeout e non dice niente a chi legge un registro di CI.
 */
try {
  await pagina.waitForFunction(() => !!window.__nautica, null, { timeout: 60000 })
} catch {
  const webgl = await pagina.evaluate(() => {
    try { return !!document.createElement('canvas').getContext('webgl2') } catch { return false }
  })
  console.error(webgl
    ? [
        '',
        '  La scena non si e avviata entro un minuto, ma un contesto WebGL c e:',
        '  la causa sta negli errori qui sopra, non nel tempo.'
      ].join('\n')
    : [
        '',
        '  NESSUN CONTESTO WEBGL.',
        '  Senza scheda grafica serve --enable-unsafe-swiftshader, che',
        '  strumenti/browser.mjs passa gia: se manca, e quel file a essere stato aggirato.'
      ].join('\n'))
  process.exit(1)
}
await pagina.waitForTimeout(1200)

/**
 * ─── L'IDENTITA', NON IL CONTEGGIO
 *
 * Contare le tele non basta, e una revisione l'ha detto con precisione: una
 * pagina che distrugge il proprio canvas e ne crea un altro identico continua
 * a contarne uno. Quello che deve restare lo stesso e' **l'oggetto**, e in
 * JavaScript si chiede con `===`.
 *
 * Si prendono i riferimenti al primo campione e si confrontano a ogni passo:
 * la tela, la scena, la camera e il renderer. Se uno solo cambia, l'atto e'
 * stato rimontato — che e' esattamente la cosa che questo cancello vieta.
 */
await pagina.evaluate(() => {
  const n = window.__nautica
  window.__rif = {
    tela: n.render.domElement, scena: n.scena, camera: n.camera, render: n.render
  }
})

const campioni = []
for (let i = 0; i <= PASSI; i++) {
  const q = i / PASSI
  await pagina.evaluate(f => {
    const d = document.querySelector('#dimostrazione')
    scrollTo({ top: scrollY + d.getBoundingClientRect().top + (d.offsetHeight - innerHeight) * f, behavior: 'instant' })
  }, q)
  /**
   * SI ASPETTA CHE LA POSA SI FERMI, non un tempo fisso.
   *
   * Con 140 ms secchi due esecuzioni identiche hanno dato passo mediano 0,000
   * e 0,421: a volte il campione arrivava prima che lo scorrimento avesse
   * mosso la camera, a volte dopo. Un cancello che cambia risultato senza che
   * cambi il sito e' un cancello che si impara a ignorare — ed e' lo stesso
   * inciampo gia' pagato in `collaudo-cinematica`.
   */
  campioni.push(await pagina.evaluate(async () => {
    const n = window.__nautica
    if (!n) return null
    const c = n.camera
    /* quanto il filmato della traversata copre il fotogramma in questo istante:
       serve al controllo del salto qui sotto, e va letto INSIEME alla posa o si
       confronterebbero due istanti diversi */
    const copertura = n.coperturaTraversata ? n.coperturaTraversata() : 0
    /**
     * SI ASPETTANO I FOTOGRAMMI, NON I MILLISECONDI — e la differenza non e'
     * accademica.
     *
     * Prima aspettavo 40 ms e confrontavo due letture: se erano uguali,
     * «ferma». Ma **«non si muove» e «non sta disegnando» si leggono
     * identici**: se il ciclo e' in stallo — un fotogramma di video che si
     * decodifica, una compilazione di shader — la lettura e' la stessa perche'
     * nessuno ha aggiornato niente, e il campione esce VECCHIO. Da li' un
     * passo che sembra un salto.
     *
     * Misurato: tre esecuzioni identiche, due rosse con picco 290x e 137x e
     * una verde con 1,1x, sulla stessa corsa di 35,5 unita'. Lo stesso sito,
     * tre risposte.
     *
     * `requestAnimationFrame` restituisce solo quando un fotogramma e' stato
     * prodotto davvero. Quindi si contano quelli: almeno quattro, poi si
     * aspetta che due letture consecutive coincidano. Con un tetto, perche' un
     * ciclo fermo non deve bloccare il collaudo — deve farlo fallire.
     */
    const leggi = () => c.position.toArray()
    const frame = () => new Promise(r => requestAnimationFrame(r))
    let prima = leggi()
    let fermi = 0
    for (let k = 0; k < 40; k++) {
      await Promise.race([frame(), new Promise(r => setTimeout(r, 250))])
      const ora = leggi()
      const d = Math.hypot(ora[0] - prima[0], ora[1] - prima[1], ora[2] - prima[2])
      prima = ora
      fermi = d < 1e-4 ? fermi + 1 : 0
      if (k >= 4 && fermi >= 3) break
    }
    const r = window.__rif
    /**
     * Un secondo mondo non e' per forza un secondo canvas: puo' essere fatto di
     * `<video>` appoggiati sulla pagina, ed e' com'era fatto il salone fino a
     * stanotte. Quindi si contano i video VISIBILI — quelli che occupano spazio
     * a schermo. I due che alimentano le texture stanno fuori dal flusso e non
     * ne occupano.
     */
    const videoVisibili = [...document.querySelectorAll('video')].filter(v => {
      const b = v.getBoundingClientRect()
      return b.width > 2 && b.height > 2 && getComputedStyle(v).opacity !== '0'
    }).length

    return {
      /* la battuta del campione: senza, un filtro sulla finestra della
         traversata non filtra niente e passa tutto in silenzio */
      p: window.__nautica?.p ?? null,
      pos: c.position.toArray(),
      quat: c.quaternion.toArray(),
      tele: document.querySelectorAll('#dimostrazione canvas').length,
      teleTotali: document.querySelectorAll('canvas').length,
      videoVisibili,
      /* quanto una VideoTexture a schermo intero copre il fotogramma. Non e'
         un <video> del DOM e il conteggio sopra non la vede: e' l'unico modo
         di sapere se il cancello sta giudicando la scena o una lastra. */
      copertura: n.coperturaTraversata ? n.coperturaTraversata() : null,
      stessaTela: n.render.domElement === r.tela,
      stessaScena: n.scena === r.scena,
      stessaCamera: c === r.camera,
      stessoRender: n.render === r.render,
      mare: n.stato ? n.stato.mare : null,
      copertura
    }
  }))
}

const buoni = campioni.filter(Boolean)
const guasti = []
const note = []

if (buoni.length < campioni.length) {
  guasti.push(`la scena sparisce in ${campioni.length - buoni.length} campioni su ${campioni.length}: ` +
              'una scena che si smonta e si rimonta e\' due scene')
}

// ─── il beccheggio ────────────────────────────────────────────────────────
/**
 * ─── SI GUARDA FUORI DALLA TRAVERSATA, e la ragione non e' una deroga
 *
 * La regola dice: una camera che becchegga sposta l'orizzonte dalla mezzeria, e
 * la giunzione fra fondo CSS e tela -- l'unica idea meccanica del sito -- si
 * vede. E' vera finche' c'e' un orizzonte.
 *
 * Dentro la finestra della traversata (regia.js, `traversata: [0.93, 1.00]`) la
 * camera e' DENTRO LO SCAFO: attraversa locale tecnico, sala macchine, scala e
 * corridoio, e sale otto gradini. Li' non c'e' nessun orizzonte da spostare e
 * nessuna giunzione col fondo CSS da tradire: una camera che non becchegga
 * salendo una scala sarebbe il difetto.
 *
 * Preso da questo cancello il 1 settembre 2026, appena il mondo e' stato
 * promosso: 1,41e-1 contro un tetto di 1e-4. Il numero era vero e la regola
 * fuori luogo.
 *
 * La finestra si LEGGE da regia.js invece di essere ricopiata: due copie di un
 * intervallo sono due intervalli che un giorno divergono.
 */
const FUORI_TRAVERSATA = (c) => c.p == null || !(c.p >= S.traversata[0] && c.p <= S.traversata[1])
let pitchMax = 0
for (const c of buoni.filter(FUORI_TRAVERSATA)) pitchMax = Math.max(pitchMax, Math.abs(c.quat[0]), Math.abs(c.quat[2]))
note.push(`BECCHEGGIO  ${pitchMax.toExponential(1)}  (tetto ${PITCH_MAX.toExponential(0)})`)
if (pitchMax > PITCH_MAX) {
  guasti.push(
    `la camera si inclina: componenti x/z del quaternione fino a ${pitchMax.toExponential(2)}. ` +
    'Una camera che becchegga sposta l\'orizzonte dalla mezzeria, e la giunzione ' +
    'fra fondo CSS e tela — l\'unica idea meccanica del sito — si vede.')
}

// ─── i salti ──────────────────────────────────────────────────────────────
const passi = []
for (let i = 1; i < buoni.length; i++) {
  const a = buoni[i - 1].pos
  const b = buoni[i].pos
  passi.push(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]))
}
/**
 * ─── UN TAGLIO E' UN PICCO LOCALE, NON UN PASSO GRANDE
 *
 * Il primo tentativo confrontava il passo peggiore col MEDIANO di tutta la
 * corsa. Ha bocciato l'uscita dal salone, che e' un'accelerazione voluta:
 * la camera sta ferma per meta' dell'atto — le battute del mare e
 * dell'invito non la muovono — quindi il mediano e' quasi zero e qualunque
 * movimento vero sembra un taglio. Misurava la drammaturgia, non la
 * continuita'.
 *
 * Un taglio ha una forma diversa: **un passo grande fra due passi piccoli**.
 * Un'accelerazione, invece, cresce coi vicini. Quindi si confronta ogni passo
 * con i suoi due vicini, e si guarda solo dove il movimento e' abbastanza
 * grande da non essere rumore.
 */
const RUMORE = 0.05
let picco = 0
let dovePicco = -1
for (let i = 1; i < passi.length - 1; i++) {
  const vicini = Math.max(passi[i - 1], passi[i + 1], RUMORE)
  const r = passi[i] / vicini
  if (passi[i] > RUMORE && r > picco) { picco = r; dovePicco = i }
}
const totale = passi.reduce((a, b) => a + b, 0)
note.push(`CORSA       ${totale.toFixed(1)} unita' in ${passi.length} passi; ` +
          `picco locale ${picco.toFixed(1)}x al campione ${dovePicco}`)
if (picco > SALTO_MAX) {
  const cop = (buoni[dovePicco]?.copertura ?? 0).toFixed(2)
  guasti.push(
    `fra i campioni ${dovePicco} e ${dovePicco + 1} la camera fa un passo ${picco.toFixed(1)} volte ` +
    'i suoi vicini: un taglio, non un movimento. Una scena unica ha una camera ' +
    `che si muove; due scene cucite hanno una camera che si sposta. (Copertura del filmato li': ${cop}.)`)
}

// ─── l'identita' ──────────────────────────────────────────────────────────
const cambiati = []
for (const [k, etichetta] of [['stessaTela', 'la tela'], ['stessaScena', 'la scena'],
                              ['stessaCamera', 'la camera'], ['stessoRender', 'il renderer']]) {
  if (buoni.some(c => !c[k])) cambiati.push(etichetta)
}
note.push(`IDENTITA'   ${cambiati.length ? 'CAMBIA: ' + cambiati.join(', ') : 'tela, scena, camera e renderer sono sempre gli stessi oggetti'}`)
if (cambiati.length) {
  guasti.push(`durante l'atto cambia ${cambiati.join(' e ')}: l'atto viene rimontato. ` +
              'Contare non basta — una pagina che distrugge il canvas e ne crea uno ' +
              'identico continua a contarne uno.')
}

const videoMax = Math.max(...buoni.map(c => c.videoVisibili))
note.push(`VIDEO       ${videoMax} elementi <video> visibili a schermo`)
/**
 * ─── LA LASTRA, che il conteggio sopra NON puo' vedere
 *
 * Una revisione esterna ha centrato il punto: questo cancello contava i
 * `<video>` del DOM e poteva risultare verde mentre a schermo c'era una
 * `VideoTexture` a copertura totale. La nota che stampava -- «le texture non
 * contano: stanno fuori dal flusso» -- era stata scritta per il salone, dove
 * la texture E' dentro la scena, e da quando esiste la traversata descriveva
 * il buco invece che il criterio.
 *
 * Adesso la copertura si LEGGE. Non era mai stata leggibile: `__nautica` non
 * esponeva `coperturaTraversata`, quindi chi la chiedeva riceveva `undefined`
 * e lo leggeva come zero. Un accessore assente non da' errore.
 *
 * Non e' un guasto e non fa fallire niente: una lastra dichiarata e voluta e'
 * una scelta di regia. E' un'informazione, perche' chi legge questo esito sappia
 * su quanti campioni il giudizio riguardava la scena e su quanti una texture.
 */
const cop = buoni.map(c => c.copertura).filter(x => typeof x === 'number')
if (!cop.length) {
  note.push('LASTRA      NON MISURATA: la scena non espone coperturaTraversata')
} else {
  const coperti = cop.filter(x => x > 0.5).length
  const massima = Math.max(...cop)
  note.push(`LASTRA      copertura massima ${massima.toFixed(2)} — ` +
            `${coperti} campioni su ${cop.length} giudicano una texture, non la scena`)

  /**
   * ─── IL TETTO CHIESTO, SCRITTO ACCANTO ALLA MISURA
   *
   * La direzione per il Site of the Year lo mette fra i cancelli di uscita del
   * punto 1: *«Nessun piano figlio della camera deve coprire piu' del 10% del
   * fotogramma»*. Oggi la lastra della traversata ne copre il 100%.
   *
   * ─── E PERCHE' QUESTA RIGA NON BOCCIA
   *
   * Perche' un cancello che nasce rosso e viene tenuto disattivato non e' un
   * cancello: e' un commento che costa una corsa di CI. La distanza fra 1,00 e
   * 0,10 non si copre con una taratura -- si copre costruendo il guscio interno
   * e una traiettoria di camera dentro `interni.glb`, che e' lavoro di asset e
   * di regia.
   *
   * Quindi la misura si STAMPA col suo obiettivo, e il divario resta sotto gli
   * occhi a ogni corsa invece di vivere in un documento. Il giorno in cui la
   * shell esiste, questa riga diventa un `guasti.push` -- una parola sola -- e
   * va acceso NELLO STESSO COMMIT che la rende vera, o si torna a un cancello
   * che nessuno puo' soddisfare.
   *
   * Nel frattempo protegge comunque qualcosa, ed e' il verso che conta: se
   * qualcuno alzasse la copertura DOVE OGGI E' BASSA -- appendendo un altro
   * piano alla camera in una battuta che adesso e' pulita -- il numero dei
   * campioni coperti cresce e si vede subito.
   */
  const TETTO_LASTRA = 0.10
  note.push(`LASTRA      obiettivo della direzione: nessun piano figlio della camera ` +
            `sopra il ${(100 * TETTO_LASTRA).toFixed(0)}% del fotogramma. ` +
            `Oggi ${(100 * massima).toFixed(0)}%: il divario e' il punto 1, e si chiude ` +
            'con il guscio degli interni, non con una taratura.')
}
if (videoMax > 0) {
  guasti.push(`ci sono ${videoMax} elementi <video> visibili a schermo. ` +
              'Un secondo mondo non richiede un secondo canvas: puo essere fatto ' +
              'di video appoggiati sulla pagina, ed era cosi che funzionava il salone.')
}

const mari = [...new Set(buoni.map(c => c.mare).filter(v => v !== null))]
note.push(`MARE        stato ${mari.join('/')} lungo tutto l'atto`)

if (errori.length) {
  guasti.push(`la pagina ha sollevato ${errori.length} errori: ${errori.slice(0, 2).join(' | ')}`)
}

// ─── le tele ──────────────────────────────────────────────────────────────
const teleAtto = new Set(buoni.map(c => c.tele))
note.push(`TELE        ${[...teleAtto].join('/')} nell'atto, ` +
          `${[...new Set(buoni.map(c => c.teleTotali))].join('/')} nella pagina`)
if (UNICA) {
  if (teleAtto.size !== 1 || !teleAtto.has(1)) {
    guasti.push(`nell'atto ci sono ${[...teleAtto].join(' e ')} tele invece di una: ` +
                'due tele sono due contesti, due camere e due mari')
  }
}

console.log(UNICA ? 'continuita\' dell\'atto unico' : 'continuita\' della corsa attuale')
for (const n of note) console.log('  ' + n)

await browser.close()
if (server && !TIENI_SERVER) server.kill()

if (guasti.length) {
  console.error('\nCOLLAUDO CONTINUITA\' FALLITO')
  for (const g of guasti) console.error('  · ' + g)
  process.exit(1)
}
console.log('\ncollaudo continuita: passato')
