import { spawn } from 'node:child_process'
import { apriBrowser } from './browser.mjs'
import { avvisaSePortaAltrui } from './porta-altrui.mjs'

/**
 * COLLAUDO DEL TERZO GESTO DELLA COPPIA.
 *
 * Calma e tensione sono stati in loop; il sollievo e' una conseguenza. Questo
 * cancello protegge cinque promesse che il peso e il controllo della camera
 * non possono vedere: il filmato non cicla, resta fermo prima della causa,
 * parte solo dopo tensione + 1,6 s di quiete, arriva alla fine una volta sola
 * e consegna senza salto il proprio ultimo fotogramma al primo frame del ciclo
 * calmo. Il fermo immagine permanente sarebbe un'altra scena mascherata.
 */

const PORTA = Number(process.env.PORTA_COLLAUDO) || 5180
await avvisaSePortaAltrui(PORTA)
const BASE = `http://localhost:${PORTA}/nautica/`

async function serviteci () {
  try {
    const r = await fetch(BASE, { redirect: 'manual' })
    if (r.status < 500) return null
  } catch {}
  const s = spawn('npm', ['run', 'preview', '--', '--port', String(PORTA)], {
    shell: true,
    stdio: 'ignore'
  })
  for (let i = 0; i < 60; i++) {
    try { await fetch(BASE, { redirect: 'manual' }); return s } catch {}
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  s.kill()
  throw new Error('il server non si e alzato')
}

const guai = []
const server = await serviteci()
const browser = await apriBrowser()

try {
  const pagina = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  const errori = []
  pagina.on('pageerror', e => errori.push(String(e)))
  /**
   * ─── LA SIMULAZIONE SI INCHIODA, O E' LEI A DECIDERE L'ESITO
   *
   * La corsa 292 e' morta qui, e il referto diceva tutto:
   *
   *   CI       finale 0.00 s · fermo si   ritorno ... riarmato si
   *   locale   finale 5.00 s · fermo si   ritorno ... riarmato si
   *
   * IL FATTO E' UNO SOLO: la' il video del sollievo resta a zero e fermo, qui
   * arriva in fondo. Non e' un codec -- nello stesso referto la clip calma
   * gira (2,99 s).
   *
   * LA MIA PRIMA SPIEGAZIONE ERA SBAGLIATA, e l'ho scritta qui prima di
   * verificarla: avevo letto «riarmato si» come prova di un'interruzione. Ma
   * «riarmato si» compare ANCHE nella corsa che passa: fa parte della chiusura
   * normale. Non prova niente, e citarlo come causa sarebbe stato costruire una
   * spiegazione sul primo indizio che la confermava.
   *
   * Quello che resta e' un'IPOTESI, e va detta come tale: il ciclo di disegno
   * continua a passare a `salone3d.aggiorna` il rollio VERO della simulazione,
   * che sopra ACCENDE (5,0 gradi) interrompe la sequenza. Sul runner il filmato
   * da cinque secondi impiega piu' tempo REALE ad arrivare in fondo, quindi la
   * simulazione ha piu' occasioni di superare la soglia. Se e' cosi', il sito
   * si comporta correttamente in entrambi i casi -- se il mare torna cattivo,
   * il sollievo DEVE interrompersi -- ed e' il cancello a misurare la lentezza
   * della macchina.
   *
   * Non posso provarlo da qui: qui non fallisce. Quello che posso fare e'
   * TOGLIERE LA VARIABILE, cosi' che se la corsa resta rossa la causa e'
   * un'altra e lo si sa subito.
   *
   * `?fermo=<t>` inchioda la simulazione a un istante. Serve un istante QUIETO,
   * o il rollio inchiodato interromperebbe comunque. Misurati uno per uno:
   *
   *   fermo=24 -> -1,343    fermo=28 -> +1,184    fermo=32 -> +1,599
   *   fermo=29 -> +6,288    fermo=30 -> +7,226    fermo=33 -> -2,165
   *
   * 28 sta sotto CALMO (2,0) e molto sotto ACCENDE (5,0): il ciclo non puo'
   * ne' interrompere ne' azzerare `calmoDa`. Non e' un numero scelto a occhio.
   */
  await pagina.goto(BASE + '?ispeziona=1&fermo=28', { waitUntil: 'load', timeout: 45000 })
  await pagina.waitForFunction(() => window.__nautica?.statoSollievo?.(), null, { timeout: 60000 })
  /**
   * ─── `>= 3`, NON `>= 2`, e la differenza e' tutta qui
   *
   * DIFETTO PRESO IN CI E POI RIPRODOTTO IN LOCALE. `readyState 2` e'
   * HAVE_CURRENT_DATA: c'e' il fotogramma corrente e NON abbastanza dati per
   * proseguire. `3` e' HAVE_FUTURE_DATA: il video puo' andare avanti.
   *
   * Questo cancello misura una CONSEGNA FRA DUE VIDEO -- il sollievo che
   * finisce e la calma che riparte. Con `2` la misura comincia mentre il
   * decodificatore e' ancora in affanno, e su un runner senza decodifica
   * hardware la calma torna a `readyState 1` a meta' prova. La diagnosi
   * stampava «910 fotogrammi presentati, readyState 1», e i tre ROTTO che
   * seguivano erano veri e riguardavano il decodificatore, non il sito.
   *
   * E' la stessa lezione di stasera, applicata al posto giusto: non basta che
   * ci sia un'attesa, deve aspettare LA RISORSA DA CUI IL CANCELLO DIPENDE.
   */
  await pagina.waitForFunction(() => {
    const v = document.querySelector('video[src*="salone-sollievo"]')
    return v?.readyState >= 3 && Number.isFinite(v.duration)
  }, null, { timeout: 60000 })

  /**
   * ─── SI ASPETTA CHE LA CALMA STIA GIRANDO, PRIMA DI MISURARE
   *
   * Il cancello passava da solo e falliva DENTRO LA SUITE, due corse su due,
   * con «la calma non riparte dal raccordo: 0.00 s» -- cioe' il video calmo a
   * zero e in pausa. Non e' il riuso della preview (provato: passa lo stesso)
   * ed e' riproducibile, quindi non e' nemmeno intermittenza: e' il CARICO.
   * Dopo venti cancelli la macchina e' piu' lenta, e i tempi fissi scritti su
   * un'altra macchina non bastano piu'.
   *
   * La cura non e' allungare i timeout: e' quella che questo repo ha gia'
   * scritto -- *non si aspetta un tempo, si aspetta un fatto*. Qui il fatto e'
   * che il ciclo calmo stia davvero girando: e' lo stato da cui il gesto
   * parte, e misurare il raccordo prima che esista significa misurare zero.
   *
   * Non indebolisce niente: le soglie e l'attesa del fotogramma presentato
   * restano quelle. Cambia solo da DOVE parte la misura.
   */
  await pagina.waitForFunction(() => {
    const c = document.querySelector('video[src*="salone-largo"]')
    return c && c.readyState >= 3 && !c.paused && c.currentTime > 0.02
  }, null, { timeout: 60000 })

  const prima = await pagina.evaluate(() => {
    const v = document.querySelector('video[src*="salone-sollievo"]')
    return { ...window.__nautica.statoSollievo(), paused: v.paused, ended: v.ended }
  })
  if (prima.loop !== false) guai.push('il sollievo e in loop')
  if (!prima.paused || prima.tempo > 0.05) guai.push('decodifica prima che esista una causa')
  if (Math.abs(prima.durata - 5) > 0.08) guai.push(`durata ${prima.durata.toFixed(3)} s, attesi 5,00`)

  /**
   * ─── SI ACCENDE LO STABILIZZATORE, PERCHE' E' QUELLO CHE FA L'UTENTE
   *
   * Il salone riceve SOLO il rollio (`salone.aggiorna(sim.S.rollio, dt)`): il
   * sollievo nasce da «la stanza ha smesso di sbattere», da qualunque causa.
   * Questo cancello pero' pompa valori SINTETICI nella stessa funzione che il
   * ciclo di disegno alimenta col rollio VERO, e i due si alternano.
   *
   * Finche' il sito partiva stabilizzato il rollio vero era piccolo e non dava
   * fastidio. Da quando parte SPENTO -- decisione del committente -- e' 16,2
   * gradi picco-picco: il sollievo parte e il rollio vero lo reinterrompe
   * subito. Misurato: «si ferma troppo presto: 0,17 s» su un montaggio che
   * funziona. Difetto latente di QUESTO cancello, non del sito; l'inversione
   * dello stato l'ha solo portato a galla.
   *
   * La cura non e' zittire il canale vero: e' percorrere la sequenza vera. Su
   * una nave che sbatte il sollievo NON puo' partire, e non deve -- l'utente
   * accende, il rollio scende, e solo allora la stanza si distende. Si aspetta
   * quindi che il rollio sia davvero sceso, invece di dare per scontato che
   * un clic basti.
   */
  await pagina.click('#stab-salone').catch(() => pagina.click('#stab').catch(() => {}))
  const calmata = await pagina.waitForFunction(() => {
    const n = window.__nautica
    if (typeof n.passoDichiarato === 'function') n.passoDichiarato(1 / 60, 30)
    return Math.abs(n.stato.rollio) < 1.2
  }, null, { timeout: 20000 }).then(() => true).catch(() => false)
  if (!calmata) guai.push('accendendo lo stabilizzatore il rollio non scende: il sollievo non avrebbe una causa')

  /* Poi il mare obbliga davvero a puntellarsi; poi resta calmo oltre la
     stessa soglia temporale usata dal sito. Il passo e' dichiarato: il test
     non dipende dai fotogrammi al secondo della macchina. */
  await pagina.evaluate(() => {
    for (let i = 0; i < 120; i++) window.__nautica.provaSollievo(8, 1 / 24)
    for (let i = 0; i < 48; i++) window.__nautica.provaSollievo(0, 1 / 24)
  })
  const partito = await pagina.waitForFunction(() => {
    const s = window.__nautica.statoSollievo()
    return s.inMoto && s.tempo > 0.05 && s.opacita > 0
  }, null, { timeout: 5000 }).then(() => true).catch(() => false)
  if (!partito) guai.push('non parte dopo tensione e quiete')

  /**
   * ─── LA CONSEGNA SI FA AVANZARE, NON SI ASPETTA
   *
   * Qui c'era `waitForFunction(..., { timeout: 8000 })`: otto secondi di
   * OROLOGIO per un raccordo che avanza a FOTOGRAMMI. Sulla macchina di chi
   * scrive sono centinaia di fotogrammi e la consegna si chiude; sul runner
   * senza GPU sono cinque, e il cancello leggeva la dissolvenza a meta':
   *
   *   CI       finale 5.00 s · consegnato 1.00   calma 0.00 s · in moto NO
   *   locale   finale 5.00 s · consegnato 0.00   calma 0.01 s · in moto si
   *
   * Due rossi -- «non consegna il fotogramma finale» e «la calma non riparte
   * dal raccordo» -- su un montaggio che funziona. E' la sesta volta in due
   * giorni che un cancello di questo repo misura la macchina invece del sito.
   *
   * L'attrezzo giusto era gia' qui, e questo stesso file lo usa venti righe
   * sopra per la tensione: `provaSollievo(mare, dt)` avanza lo stato a passo
   * DICHIARATO. Il video del sollievo era gia' finito in tutte e due le corse
   * (5,00 s, fermo): mancava solo il raccordo, che ora si fa avanzare invece
   * di aspettarlo.
   *
   * Le soglie non si sono mosse: `concluso`, `!inMoto`, `!inConsegna`,
   * `opacita < 0,01`. Cambia da dove viene il tempo.
   */
  /* PRIMA il video deve finire, e quello va in tempo reale: e' un `<video>`,
     dura cinque secondi e nessun passo dichiarato lo fa correre. Pompare il
     raccordo mentre suona ancora RIAZZERA la sequenza -- provato, e il cancello
     leggeva «si ferma troppo presto: 0,33 s». Trenta secondi bastano a una
     clip da cinque anche su un rasterizzatore software, e non e' un margine
     scelto a caso: e' sei volte la durata dichiarata del filmato. */
  await pagina.waitForFunction(() => {
    const v = document.querySelector('video[src*="salone-sollievo"]')
    return v && (v.ended || v.currentTime > 4.8)
  }, null, { timeout: 30000 }).catch(() => {})

  let concluso = false
  for (let i = 0; i < 240 && !concluso; i++) {
    concluso = await pagina.evaluate(() => {
      const s0 = window.__nautica.statoSollievo()
      if (s0.concluso && !s0.inMoto && !s0.inConsegna && s0.opacita < 0.01) return true
      window.__nautica.provaSollievo(0, 1 / 24)
      const s = window.__nautica.statoSollievo()
      return s.concluso && !s.inMoto && !s.inConsegna && s.opacita < 0.01
    })
  }
  /**
   * SE LA CONSEGNA NON SI CHIUDE, PRIMA SI GUARDA CHI NON HA FATTO IL PROPRIO
   * LAVORO. La chiusura e' appesa a `requestVideoFrameCallback` sul video
   * calmo (`salone3d.js:657`): quella richiamata arriva quando il decoder
   * PRESENTA un fotogramma. Su un rasterizzatore software puo' non arrivare
   * mai -- e allora il cancello starebbe misurando la pipeline video del
   * runner, non il montaggio.
   *
   * Si legge quindi quanti fotogrammi il video calmo ha davvero presentato.
   * Zero non e' un difetto del sito: e' una macchina che non puo' rispondere
   * alla domanda.
   */
  const perche = await pagina.evaluate(() => {
    const c = document.querySelector('video[src*="salone-largo"]')
    const q = c && c.getVideoPlaybackQuality ? c.getVideoPlaybackQuality() : null
    const s = window.__nautica.statoSollievo()
    return {
      presentati: q ? q.totalVideoFrames : null,
      readyState: c ? c.readyState : null,
      inConsegna: s.inConsegna,
      concluso: s.concluso,
      rvfc: 'requestVideoFrameCallback' in HTMLVideoElement.prototype
    }
  })
  if (!concluso) {
    console.log(`  diagnosi  calma: ${perche.presentati} fotogrammi presentati, ` +
                `readyState ${perche.readyState}, rVFC ${perche.rvfc ? 'c e' : 'assente'}, ` +
                `inConsegna ${perche.inConsegna}`)
    guai.push('non consegna il fotogramma finale al ciclo calmo')
  }

  const finale = await pagina.evaluate(() => {
    const v = document.querySelector('video[src*="salone-sollievo"]')
    /**
     * ─── IL SELETTORE PUNTAVA A UN FILE CHE NON ESISTE
     *
     * Qui c'era `video[src*="/filmati/salone.mp4"]`. Nel repo non c'e' nessun
     * `salone.mp4`: la clip calma e' `salone-largo.mp4` (`CALMA` in
     * `salone3d.js`), e `/filmati/salone-largo.mp4` non contiene quella
     * sottostringa. Il selettore non poteva agganciare NIENTE.
     *
     * E il difetto non si presentava come errore. `calma` restava `null`,
     * `?? -1` lo trasformava in un numero, e il cancello stampava «la calma
     * riparte a -1.00 s» -- una misura dall'aria plausibile su un video che
     * non aveva mai trovato. E' la stessa forma di guasto che questo repo ha
     * gia' pagato con `coperturaTraversata`: *un accessore assente non da'
     * errore, da' `undefined`, e `?? 0` lo trasforma in un numero che sembra
     * una misura*.
     *
     * Adesso il nome si prende dalla stessa costante che lo dichiara, e se non
     * trova il video il cancello lo DICE invece di misurare un sentinella.
     */
    const calma = document.querySelector('video[src*="salone-largo"]')
    return {
      ...window.__nautica.statoSollievo(),
      paused: v.paused,
      ended: v.ended,
      calmaTrovata: !!calma,
      calmaTempo: calma ? calma.currentTime : null,
      calmaFerma: calma ? calma.paused : null
    }
  })
  if (!finale.calmaTrovata) guai.push('il video della calma non e in pagina: non misuro il raccordo')
  if (!finale.ended || !finale.paused) guai.push('il decoder non si ferma alla fine')
  if (finale.tempo < 4.8) guai.push(`si ferma troppo presto: ${finale.tempo.toFixed(2)} s`)
  /**
   * SI LEGGE L'ISTANTE DELLA CONSEGNA, non dove sta la calma adesso.
   *
   * `calmaTempo` e' dove il ciclo calmo si trova QUANDO GUARDO, e fra la
   * chiusura della consegna e questa lettura il video ha suonato: su un
   * rasterizzatore software usciva **1,99 s**, e il cancello concludeva che il
   * raccordo era saltato su un montaggio che riparte da zero. Il numero era
   * vero, la conclusione no: misurava il ritardo di chi guarda.
   *
   * `calmaAllaConsegna` lo registra `chiudi()` dentro la scena, nell'istante
   * giusto. La soglia non e' cambiata.
   */
  if (finale.calmaTrovata && finale.calmaFerma) {
    guai.push('il ciclo calmo non riparte dopo la consegna')
  }
  if (finale.calmaAllaConsegna === null) {
    guai.push('la scena non registra l istante della consegna: non misuro il raccordo')
  } else if (finale.calmaAllaConsegna > 0.5) {
    guai.push(`la calma non riparte dal raccordo: ${finale.calmaAllaConsegna.toFixed(2)} s`)
  }

  const ritornaMare = await pagina.evaluate(() => {
    for (let i = 0; i < 12; i++) window.__nautica.provaSollievo(8, 1 / 24)
    return window.__nautica.statoSollievo()
  })
  if (ritornaMare.concluso || ritornaMare.opacita > 0.01) {
    guai.push('il mare difficile non rimette in tensione la coppia')
  }
  if (!ritornaMare.armato) guai.push('un nuovo episodio non riarma il gesto')
  if (errori.length) guai.push('errori di pagina: ' + errori.slice(0, 2).join(' | '))

  console.log(`  prima    fermo ${prima.paused ? 'si' : 'NO'} · loop ${prima.loop}`)
  console.log(`  gesto    ${partito ? 'parte' : 'NON PARTE'} dopo tensione + quiete`)
  console.log(`  finale   ${finale.tempo.toFixed(2)} s · fermo ${finale.paused ? 'si' : 'NO'} · consegnato ${finale.opacita.toFixed(2)}`)
  console.log(`  calma    riparte a ${finale.calmaAllaConsegna === null ? '--' : finale.calmaAllaConsegna.toFixed(2)} s ` +
              `(letta poi a ${finale.calmaTrovata ? finale.calmaTempo.toFixed(2) : '--'}) · in moto ${finale.calmaFerma ? 'NO' : 'si'}`)
  console.log(`  ritorno  opacita ${ritornaMare.opacita.toFixed(2)} · riarmato ${ritornaMare.armato ? 'si' : 'NO'}`)
} finally {
  await browser.close()
  server?.kill()
}

if (guai.length) {
  for (const g of guai) console.error('  ROTTO  ' + g)
  process.exit(1)
}
console.log('  SOLLIEVO IN ORDINE')
