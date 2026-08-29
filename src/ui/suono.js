/**
 * IL SUONO — generato dalla simulazione, non incollato sopra.
 *
 * ─── LA REGOLA CHE DECIDE TUTTO IL FILE
 *
 * Non c'e' nessun file audio. Non c'e' una traccia che parte e va per conto
 * suo. Ogni cosa che si sente e' un parametro di `sim.S` letto dieci volte al
 * secondo: i giri dell'albero, l'andatura, lo stato del mare, il valore
 * efficace del rollio, i giri del rotore del giroscopio.
 *
 * La differenza non e' ideologica, e si sente. Una colonna sonora incollata
 * sopra racconta l'atto due; questa lo SUBISCE. Quando si toglie propulsione,
 * il motore cala perche' sta calando `S.giriPropulsione` -- non perche' un
 * montaggio ha deciso che li' cala. Se domani qualcuno cambia `TAU_GIRI`, il
 * suono cambia da solo e nessuno deve rifare niente. E' la stessa proprieta'
 * per cui in questo sito le pinne perdono autorita' senza che nessun ramo le
 * spenga.
 *
 * E vale anche al contrario, che e' la prova: **il silenzio relativo quando la
 * nave torna stabile non e' programmato**. Nessuna riga dice «alla fine
 * abbassa». Succede perche' a giroscopio inserito il rollio scende, quindi
 * scende lo scricchiolio; perche' senza propulsione l'albero e' fermo, quindi
 * non c'e' motore; perche' l'andatura e' bassa, quindi non c'e' scia. Tre
 * sorgenti che si spengono per conto loro, e resta il mare.
 *
 * ─── NON PARTE MAI DA SOLO, e non e' solo buona educazione
 *
 * `AudioContext` non viene nemmeno COSTRUITO finche' nessuno preme il
 * comando. Non e' un contesto sospeso in attesa: non esiste. Un browser
 * moderno lo sospenderebbe comunque senza un gesto, ma appoggiarsi a quella
 * regola vorrebbe dire che l'intenzione del sito e' partire e che e' il
 * browser a impedirglielo. L'intenzione e' un'altra.
 *
 * Il primo volume sale da zero in due secondi. Un audio che comincia al
 * volume giusto fa saltare, e su un sito che si guarda in ufficio fa chiudere
 * la scheda.
 *
 * ─── IL COMANDO NON SI RITIRA NEL FINALE, ed e' l'unica eccezione
 *
 * Tutto il resto dell'interfaccia sparisce quando la traversata prende il
 * comando (`stile.css`, «l'interfaccia si ritira»): li' la fisica ha gia'
 * risposto e l'unica cosa da fare e' guardare due persone. Questo resta,
 * perche' non e' un comando della nave: e' il modo di far tacere il sito. Un
 * bottone per spegnere l'audio che sparisce proprio mentre l'audio suona
 * sarebbe una trappola, non una ritirata.
 */

/** L'ultimo stato, spinto da chi ce l'ha. Stessa architettura di `nudge.js`. */
let ultimoStato = null
export const segnalaStato = (S) => { ultimoStato = S }

/**
 * ─── I LIVELLI, e perche' sono cosi' bassi
 *
 * Sono guadagni lineari su un master a 0,9. La somma delle cinque sorgenti a
 * pieno regime sta sotto 1: e' il modo di garantire che non ci sia clipping
 * senza mettere un compressore, cioe' senza aggiungere un pezzo che modifica
 * il rapporto fra le sorgenti e quindi il racconto.
 *
 * Il mare e' la base e c'e' sempre. Tutto il resto va e viene.
 */
const LIV = {
  mare: 0.030,        // + 0,020 per stato del mare
  marePasso: 0.020,
  scia: 0.055,        // al punto di servizio, e cala col cubo di v/V_RIF
  scafo: 0.050,       // a rollio pieno
  motore: 0.100,      // a giri pieni
  gyro: 0.028         // a rotore a regime
}

/** Il punto di servizio, per normalizzare l'andatura. Vedi `simulazione.js`. */
const V_RIF = 12

export function creaSuono () {
  const b = document.createElement('button')
  b.type = 'button'
  b.className = 'suono'
  b.setAttribute('aria-pressed', 'false')
  b.innerHTML = '<span class="suono__onde" aria-hidden="true"><i></i><i></i><i></i></span>' +
                '<span class="suono__testo">Sound</span>'
  document.body.appendChild(b)

  let ctx = null
  let master = null
  let voci = null
  let giro = null

  /**
   * ─── IL RUMORE E' UN BUFFER, non un `ScriptProcessorNode`
   *
   * Due secondi di rumore bianco in ciclo. Un generatore per campione
   * girerebbe sul thread principale a 44,1 kHz per produrre una cosa che si
   * ripete comunque: due secondi di ciclo su un rumore filtrato non si
   * sentono, e costano una allocazione sola all'accensione.
   */
  function rumore () {
    const n = Math.floor(ctx.sampleRate * 2)
    const buf = ctx.createBuffer(1, n, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    src.start()
    return src
  }

  /** Una sorgente di rumore filtrata, col suo guadagno. */
  function banda (tipo, freq, q) {
    const f = ctx.createBiquadFilter()
    f.type = tipo
    f.frequency.value = freq
    f.Q.value = q
    const g = ctx.createGain()
    g.gain.value = 0
    rumore().connect(f).connect(g).connect(master)
    return g
  }

  function costruisci () {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    /**
     * IL MOTORE E' UN DENTE DI SEGA FILTRATO, e la fondamentale e' bassissima.
     *
     * A giri pieni sta a 80 Hz: e' un diesel di propulsione visto da dentro lo
     * scafo, non un fuoribordo. Il passa-basso si muove con la frequenza --
     * cinque volte la fondamentale -- cosi' salendo di giri non si aggiunge
     * solo tono, si aggiunge anche BRILLANTEZZA. E' la ragione per cui un
     * motore che accelera si riconosce a occhi chiusi: cambia il timbro, non
     * solo l'altezza.
     */
    const mF = ctx.createBiquadFilter()
    mF.type = 'lowpass'
    mF.frequency.value = 140
    mF.Q.value = 0.9
    const mG = ctx.createGain()
    mG.gain.value = 0
    mF.connect(mG).connect(master)
    const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 26
    const o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = 52
    const o2g = ctx.createGain(); o2g.gain.value = 0.45
    o1.connect(mF); o2.connect(o2g).connect(mF)
    o1.start(); o2.start()

    /** Il giroscopio: una massa che gira sale di tono e non ridiscende. */
    const gO = ctx.createOscillator()
    gO.type = 'triangle'
    gO.frequency.value = 170
    const gG = ctx.createGain()
    gG.gain.value = 0
    gO.connect(gG).connect(master)
    gO.start()

    voci = {
      /* l'onda: larga, bassa, sempre presente */
      mare: banda('lowpass', 420, 0.7),
      /* la scia: il sibilo dell'acqua che scorre lungo la carena. Piu' acuto
         del mare e legato all'andatura, non allo stato del mare */
      scia: banda('bandpass', 1400, 0.8),
      /* lo scafo che lavora: quaranta metri di struttura che si torce */
      scafo: banda('lowpass', 120, 1.4),
      motore: mG, motoreF: o1.frequency, motoreF2: o2.frequency, motoreLp: mF.frequency,
      gyro: gG, gyroF: gO.frequency
    }
  }

  /**
   * DIECI VOLTE AL SECONDO, non sessanta.
   *
   * `setTargetAtTime` interpola nel thread audio, quindi fra un aggiornamento e
   * l'altro il parametro continua a muoversi con continuita': non serve
   * scrivere a ogni fotogramma, e scrivere a ogni fotogramma su un
   * `AudioParam` accumula eventi programmati per niente.
   *
   * Le costanti di tempo sono corte per il motore (0,08 s: deve seguire i giri,
   * che sono gia' lenti di loro per via di `TAU_GIRI`) e lunghe per il mare
   * (0,6 s: non deve pulsare col fotogramma).
   */
  function aggiorna () {
    const S = ultimoStato
    if (!S || !ctx || ctx.state !== 'running') return
    const t = ctx.currentTime
    const v = Math.max(0, S.velocita) / V_RIF
    const giriM = Math.max(0, Math.min(1, S.giriPropulsione))
    const giriG = Math.max(0, Math.min(1, S.giriGiroscopio))
    /* il rollio efficace, normalizzato su un valore alto ma raggiungibile:
       9,2 gradi RMS e' quello misurato a mare 5 senza stabilizzatori */
    const agitata = Math.max(0, Math.min(1, (S.rollioRms || 0) / 9.2))

    voci.mare.gain.setTargetAtTime(LIV.mare + LIV.marePasso * (S.mare - 1), t, 0.6)
    /* la scia va col CUBO dell'andatura: sotto i sei nodi praticamente non c'e'
       piu', ed e' il punto -- la nave che plana e' silenziosa prima ancora di
       essere lenta */
    voci.scia.gain.setTargetAtTime(LIV.scia * v * v * v, t, 0.35)
    voci.scafo.gain.setTargetAtTime(LIV.scafo * agitata, t, 0.5)

    voci.motore.gain.setTargetAtTime(LIV.motore * giriM * giriM, t, 0.12)
    const f = 26 + 54 * giriM
    voci.motoreF.setTargetAtTime(f, t, 0.08)
    voci.motoreF2.setTargetAtTime(f * 2, t, 0.08)
    voci.motoreLp.setTargetAtTime(f * 5, t, 0.08)

    voci.gyro.gain.setTargetAtTime(LIV.gyro * giriG, t, 0.4)
    voci.gyroF.setTargetAtTime(170 + 480 * giriG, t, 0.4)
  }

  function accendi () {
    if (!ctx) costruisci()
    ctx.resume?.()
    /* da zero, in due secondi. Un audio che comincia al volume giusto fa
       saltare, e su un sito che si guarda in ufficio fa chiudere la scheda. */
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2)
    if (!giro) giro = setInterval(aggiorna, 100)
    b.setAttribute('aria-pressed', 'true')
  }

  function spegni () {
    b.setAttribute('aria-pressed', 'false')
    if (!ctx) return
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
    clearInterval(giro); giro = null
    /* si sospende DOPO la dissolvenza, o l'ultimo mezzo secondo diventa un
       taglio netto -- che e' esattamente il rumore che si voleva evitare */
    setTimeout(() => { if (b.getAttribute('aria-pressed') === 'false') ctx.suspend?.() }, 600)
  }

  b.addEventListener('click', () => {
    if (b.getAttribute('aria-pressed') === 'true') spegni()
    else accendi()
  })

  /* Una scheda in secondo piano non deve continuare a suonare. Al ritorno
     riprende solo se era acceso: non e' un'occasione per accendersi da solo. */
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return
    if (document.hidden) ctx.suspend?.()
    else if (b.getAttribute('aria-pressed') === 'true') ctx.resume?.()
  })
}
