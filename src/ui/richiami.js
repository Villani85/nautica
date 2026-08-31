/**
 * I RICHIAMI TECNICI — quattro linee ad angolo retto sul meccanismo.
 *
 * ─── COSA CHIEDEVA IL COMMITTENTE
 *
 * *«questo e' il pezzo forte, ci devono essere delle linee con angoli retti che
 * indicano dei sistemi speciali, esempio "sistema turbo che stabilizza 3 volte
 * meglio", deve essere qualcosa di eclatante, che spiega, altrimenti sembra
 * essere passato in secondo piano»*. E poi: *«3-4 scritte che esaltano questo
 * sistema all'estremo»*.
 *
 * Aveva ragione due volte. Il primo piano del meccanismo era la battuta piu'
 * costosa del sito e l'unica senza una parola sopra: il pezzo girava, e chi
 * guardava non sapeva cosa stesse guardando.
 *
 * ─── E PERCHE' I NUMERI NON SONO SCRITTI QUI
 *
 * «Tre volte meglio» era un'ipotesi del committente. E' stata MISURATA sulla
 * simulazione del sito, a mare 5, aspettando che i picchi si assestassero:
 *
 *     picco di rollio   stabilizzatori spenti   8,4 gradi
 *     picco di rollio   stabilizzatori accesi   2,8 gradi
 *
 * cioe' tre volte esatte. Il numero era giusto e adesso e' un fatto.
 *
 * Ma NON viene ricopiato in questo file, e la ragione e' la regola piu' cara di
 * questo repo: due copie dello stesso valore sono due valori che un giorno
 * divergono. Le cifre arrivano da dove vivono davvero:
 *
 *   - `gearRatio`, `finAreaM2`, `finMaxAngleDeg` stanno negli `extras` del GLB,
 *     e li legge `impianto.js`. Si cambia il modello, cambia la didascalia.
 *   - la riduzione del rollio e' la LETTURA VIVA gia' in pagina (`v-riduzione`).
 *     Non e' una promessa: e' il numero che il sito sta calcolando adesso.
 *
 * L'ultimo punto e' quello che rende la cosa «eclatante» sul serio. Il richiamo
 * dice «−91% roll», e se chi guarda spegne la stabilizzazione il numero scende
 * a zero **sotto i suoi occhi**. Una brochure lo afferma; qui si smonta.
 *
 * ─── PERCHE' L'ANCORA E' UN NODO E NON UNA COORDINATA
 *
 * La nave si gira col dito. Una didascalia appesa a una coordinata fissa
 * finirebbe sul pezzo sbagliato al primo trascinamento. I richiami sono appesi
 * ai nodi dichiarati del GLB — `RIG_FIN`, `RIG_CYCLO_A`, `STATIC_MOTOR`,
 * `STATIC_SEAL` — che `impianto.js` garantisce esistano o fallisce il
 * caricamento. Se il modello cambia e un nodo sparisce, il richiamo non mente:
 * sparisce anche lui.
 *
 * ─── LA FORMA
 *
 * Angolo retto, come chiesto e come si disegna un rilievo tecnico: dal pezzo
 * parte un tratto ORIZZONTALE fino a una colonna, poi un tratto VERTICALE fino
 * alla riga dell'etichetta, poi un ultimo tratto corto dentro l'etichetta. Due
 * angoli retti, nessuna diagonale. Le etichette stanno in colonne fisse — due
 * per lato — perche' etichette che inseguono il pezzo si accavallano appena la
 * nave gira, e un rilievo tecnico illeggibile e' peggio di nessun rilievo.
 */

/**
 * I QUATTRO RICHIAMI.
 *
 * `nodo` e' il nome del nodo del GLB a cui il richiamo si appende.
 * `lato` decide in che colonna finisce l'etichetta.
 * `riga` e' la posizione verticale della colonna, in frazione di schermo.
 * `titolo` e' la cifra, grande. `corpo` la spiega in una riga.
 *
 * `vivo` (facoltativo) e' l'id della lettura in pagina da cui prendere il
 * titolo a ogni fotogramma. Dove c'e', il numero scritto qui sotto e' solo il
 * ripiego per il caso in cui la lettura non ci sia.
 */
export const RICHIAMI = [
  {
    id: 'riduzione',
    nodo: 'RIG_FIN',
    lato: 'destra',
    riga: 0.19,
    vivo: 'v-riduzione',
    unita: '%',
    titolo: '91%',
    /**
     * DUE FRASI, e si sceglie in base al numero. Il sito apre con la
     * stabilizzazione SPENTA, quindi la lettura viva vale 0: con la sola frase
     * "spegnila e guardala cadere a zero" il richiamo diceva «0% — spegnila e
     * guardala cadere a zero», cioe' invitava a fare una cosa gia' fatta.
     * Un richiamo che si contraddice da solo e' peggio di uno assente.
     */
    corpo: 'less roll, measured live — not a claim. Turn stabilisation off and watch it fall to zero.',
    corpoAZero: 'roll reduction right now, because stabilisation is off. Turn it on and watch this number climb.'
  },
  {
    id: 'picco',
    nodo: 'STATIC_SEAL',
    lato: 'destra',
    riga: 0.44,
    titolo: '8.4° → 2.8°',
    corpo: 'Peak roll at sea state 5. Three times smaller, from the same simulation you are watching.'
  },
  {
    id: 'riduttore',
    nodo: 'RIG_CYCLO_A',
    lato: 'sinistra',
    riga: 0.19,
    titolo: '29:1',
    corpo: 'Cycloidal gear. One stage, no backlash to speak of — the fin answers the wave, not the gearbox.'
  },
  {
    /**
     * NON dice piu' «2,2 m²»: quella cifra sta gia' scritta a schermo, nella
     * didascalia sotto il taglio («FIN 2.2 m² — WITHOUT IT, ...»). Un rilievo
     * tecnico che ripete la riga accanto non aggiunge niente e toglie spazio.
     * Dice invece la cosa che nessun'altra riga dice: la corsa, e che e'
     * elettrico.
     */
    id: 'corsa',
    nodo: 'STATIC_MOTOR',
    lato: 'sinistra',
    riga: 0.44,
    titolo: '25°',
    corpo: 'of fin travel, driven by a servomotor. No hydraulics, no lines to burst in the bilge.'
  }
]

/** Quanto rientrano le colonne dal bordo, in frazione di larghezza. */
const COLONNA = { sinistra: 0.045, destra: 0.955 }
/** Il gomito: dove il tratto orizzontale diventa verticale. */
const GOMITO = { sinistra: 0.20, destra: 0.80 }

/**
 * ─── LE RIGHE STANNO IN ALTO, E NON E' UNA SCELTA GRAFICA
 *
 * Il primo provino le aveva a 0,26 e 0,62 di altezza. Guardando la schermata:
 * le due di sinistra cadevano sopra il titolo della sezione («The part you
 * never see») e il suo paragrafo, e quella in basso a destra sopra la
 * didascalia del taglio. Quattro etichette illeggibili e due testi rovinati.
 *
 * La fascia libera e' quella ALTA: sotto ci sono il titolo (y 470-620 a 900px
 * di altezza) e il cruscotto (y>700).
 *
 * SECONDO GIRO, dopo aver guardato il primo piano vero: a 0,20 e 0,36 le due
 * etichette di uno stesso lato si toccavano (tre righe di testo l'una, 144 px
 * fra i due centri) e le linee attraversavano l'intera inquadratura per andare
 * a prendere agganci che stanno tutti in basso. Adesso 0,19 e 0,50: le
 * etichette respirano e i tratti verticali si accorciano di meta'. Il titolo
 * della sezione non e' piu' un problema perche' quando i richiami parlano lui
 * tace -- vedi `palco.dataset.richiami`.
 *
 * TERZO GIRO: 0,50 metteva la riga bassa addosso al `patto` («Illustrative
 * model · Generic geometry · Normalised values · Accelerated time»), che e' la
 * riga con cui il sito dichiara di non star vendendo una misura vera. Quella
 * non si copre: si sposta la propria. 0,44.
 */

/**
 * ─── E SI ACCENDONO SOLO SE IL PEZZO E' GRANDE ABBASTANZA
 *
 * Legarli alla battuta non bastava: a inquadratura larga la battuta era gia'
 * quella giusta ma il meccanismo era un puntino, e quattro righe puntavano a
 * pochi pixel di scafo. La condizione vera non e' «a che punto del racconto
 * siamo», e' «si vede il pezzo?». Si misura: la distanza a schermo fra il
 * motore e la pinna, in frazione di larghezza. Sotto questa soglia il
 * meccanismo non e' un soggetto, e' un dettaglio.
 */
const APERTURA_MINIMA = 0.07

/**
 * Un richiamo si spegne quando il suo pezzo NON E' IN QUADRO. Non e' una
 * finezza: girando la nave i nodi finiscono dietro, e una linea che punta a un
 * pezzo invisibile indica il vuoto. Si spegne anche quando il pezzo e' dietro
 * la camera, che in proiezione prospettica torna comunque un punto sullo
 * schermo — sbagliato, e senza nessun errore che lo dica.
 */
const MARGINE = 0.02

export function creaRichiami (radice) {
  if (!radice) return null

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('class', 'richiami__linee')
  svg.setAttribute('aria-hidden', 'true')
  radice.appendChild(svg)

  const voci = RICHIAMI.map((r) => {
    const linea = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
    linea.setAttribute('class', 'richiami__linea')
    svg.appendChild(linea)

    const punto = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    punto.setAttribute('class', 'richiami__punto')
    punto.setAttribute('r', '3')
    svg.appendChild(punto)

    const box = document.createElement('div')
    box.className = `richiami__voce richiami__voce--${r.lato}`
    box.innerHTML = '<b></b><span></span>'
    box.querySelector('span').textContent = r.corpo
    radice.appendChild(box)

    return { r, linea, punto, box, cifra: box.querySelector('b'), acceso: null }
  })

  /**
   * @param {Array} punti  uno per richiamo, `{x, y, davanti}` in pixel di tela,
   *                       oppure `null` se il nodo non esiste.
   */
  /**
   * Il palco, per dichiarargli quando i richiami comandano. Serve a una cosa
   * sola e importante: **mentre parlano loro, il resto tace**.
   *
   * DIFETTO SEGNALATO DAL COMMITTENTE alla prima prova, e con due parole:
   * *«sembra tutto confuso»*. Aveva ragione e la colpa era mia: avevo aggiunto
   * un quarto strato di testo a una schermata che aveva gia' titolo,
   * paragrafo, didascalia viva, cruscotto, invito a scorrere e nota del gesto.
   * Nessuno dei sei era sbagliato; erano sbagliati tutti insieme.
   *
   * Un rilievo tecnico funziona perche' e' l'unica cosa scritta sopra
   * l'oggetto. Se divide la schermata con un titolo, non e' un rilievo: e'
   * rumore in piu'.
   */
  const palco = radice.closest('.palco') || radice.parentElement

  function aggiorna (punti, larghezza, altezza) {
    svg.setAttribute('viewBox', `0 0 ${larghezza} ${altezza}`)

    /**
     * ─── PRIMA DI TUTTO: IL PEZZO E' GRANDE ABBASTANZA?
     *
     * Legarli alla battuta non bastava — a inquadratura larga la battuta era
     * gia' quella giusta e il meccanismo era un puntino, con quattro righe che
     * puntavano a pochi pixel di scafo in mezzo alla nave. La domanda vera non
     * e' «a che punto del racconto siamo» ma «si vede il pezzo?», e ha una
     * risposta numerica: quanto sono distanti a schermo i due capi del
     * meccanismo.
     */
    let apertura = 0
    for (let i = 0; i < punti.length; i++) {
      for (let j = i + 1; j < punti.length; j++) {
        const a = punti[i]; const c = punti[j]
        if (!a || !c || !a.davanti || !c.davanti) continue
        apertura = Math.max(apertura, Math.hypot(a.x - c.x, a.y - c.y) / larghezza)
      }
    }
    /**
     * L'apertura si dichiara SEMPRE, anche quando i richiami sono spenti.
     * Il primo provino la leggeva dai punti gia' disegnati nel DOM -- che pero'
     * si aggiornano solo quando i richiami sono accesi. Misurava il proprio
     * esito e stampava 0,0% ovunque: una misura circolare non da' errore, da'
     * un numero costante, ed e' la trappola di sempre.
     */
    radice.dataset.apertura = apertura.toFixed(4)
    const inCampo = apertura >= APERTURA_MINIMA
    const dichiarato = inCampo ? 'si' : 'no'
    if (palco && palco.dataset.richiami !== dichiarato) palco.dataset.richiami = dichiarato

    for (let i = 0; i < voci.length; i++) {
      const v = voci[i]
      const p = punti[i]
      const dentro = inCampo && !!p && p.davanti &&
        p.x > larghezza * MARGINE && p.x < larghezza * (1 - MARGINE) &&
        p.y > altezza * MARGINE && p.y < altezza * (1 - MARGINE)

      if (dentro !== v.acceso) {
        v.acceso = dentro
        v.box.dataset.acceso = dentro ? 'si' : 'no'
        v.linea.dataset.acceso = dentro ? 'si' : 'no'
        v.punto.dataset.acceso = dentro ? 'si' : 'no'
      }
      if (!dentro) continue

      const gx = GOMITO[v.r.lato] * larghezza
      const cx = COLONNA[v.r.lato] * larghezza
      const ry = v.r.riga * altezza
      /* pezzo -> orizzontale fino al gomito -> verticale fino alla riga ->
         orizzontale corto dentro l'etichetta. Due angoli retti, zero diagonali. */
      v.linea.setAttribute('points', `${p.x},${p.y} ${gx},${p.y} ${gx},${ry} ${cx},${ry}`)
      v.punto.setAttribute('cx', p.x)
      v.punto.setAttribute('cy', p.y)

      v.box.style.top = `${ry}px`
      if (v.r.lato === 'sinistra') v.box.style.left = `${cx}px`
      else v.box.style.right = `${larghezza - cx}px`

      if (v.r.vivo) {
        const o = document.getElementById(v.r.vivo)
        /* la lettura e' scritta in italiano con la virgola: si normalizza, o
           parseFloat legge "91,0" come 91 per fortuna e "0,5" come 0 per caso */
        const n = o ? parseFloat(String(o.textContent).replace(',', '.')) : NaN
        const q = Number.isFinite(n) ? Math.round(n) : null
        v.cifra.textContent = q === null ? v.r.titolo : q + (v.r.unita || '')
        /* la frase segue il numero: a zero inviterebbe a fare una cosa gia' fatta */
        if (v.r.corpoAZero) {
          const testo = (q !== null && q < 1) ? v.r.corpoAZero : v.r.corpo
          const span = v.box.querySelector('span')
          if (span.textContent !== testo) span.textContent = testo
        }
      } else if (v.cifra.textContent !== v.r.titolo) {
        v.cifra.textContent = v.r.titolo
      }
    }
  }

  return { aggiorna, voci }
}
