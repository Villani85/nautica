import { AMPIEZZA_MARE } from '../scena/simulazione.js'

const grad = (v) => v.toFixed(1).replace('.', ',')

/**
 * Le letture si aggiornano a fotogrammi alterni: sessanta scritture al secondo
 * nel DOM non le legge nessuno e costano layout. Trenta bastano, e la cifra
 * resta stabile abbastanza da poterla leggere davvero.
 */
export function creaLetture (el) {
  let frame = 0
  let ultimoStato = null

  return function aggiorna (S) {
    frame++
    if (frame % 2) return

    el.rollio.textContent = grad(Math.abs(S.rollio))
    el.picco.textContent = grad(S.picco)
    /**
     * ─── UNO STRUMENTO CHE SEGNA ZERO SEMBRA ROTTO, non «poco»
     *
     * Due revisioni indipendenti l'hanno segnalato come la cosa piu' azionabile
     * del sito: «DRAW 0/100 e RECOVERY 0/100 si leggono come strumenti rotti o
     * non ancora avviati». Un fondo scala 100 con l'ago a zero dice guasto.
     *
     * MA LA LORO DIAGNOSI ERA SBAGLIATA, e l'ho misurato prima di correggere.
     * Proponevano di abbassare il fondo scala perche' «il campo vive fra 0 e 6».
     * Vero a 12 nodi -- DRAW arriva a 5,5 -- e FALSO appena si spegne la
     * propulsione: li' arriva a 54,0 su una corsa misurata, perche' a bassa
     * andatura la pinna deve chiedere molta piu' incidenza per la stessa
     * correzione. Il fondo scala serve alla scoperta, ed e' giusto.
     *
     * Il difetto e' un altro: `Math.round` di 0,3 e' ZERO. La lettura non
     * mostrava «poco», mostrava «niente», e per giunta restava ferma mentre il
     * valore si muoveva. E' la stessa ragione per cui la velocita' ha preso il
     * decimo quando e' diventata dinamica: un intero nasconde proprio la
     * grandezza che si vuole far vedere.
     *
     * Sotto 10 si stampa il decimo, sopra l'intero: a 54 il decimo sarebbe
     * telemetria e occuperebbe spazio senza dire niente in piu'.
     */
    const cifra = (v) => (v < 10 ? grad(v) : String(Math.round(v)))
    el.carico.textContent = cifra(S.carico)
    el.recupero.textContent = cifra(S.recupero)
    el.fCarico.style.right = `${100 - S.carico}%`
    el.fRecupero.style.right = `${100 - S.recupero}%`
    /* L'andatura ora decade fisicamente: con un intero resterebbe immobile per
       quasi due secondi dopo il gesto e poi salterebbe di un nodo. Il decimo
       rende visibile l'inerzia senza trasformare il pannello in telemetria. */
    if (el.velocita) el.velocita.textContent = grad(S.velocita)
    /**
     * --- LA RIGA VIVA: COSA STA SUCCEDENDO, ADESSO
     *
     * Guardando la battuta del meccanismo non si capiva cosa stesse facendo il
     * pezzo: c'erano quattro numeri in fondo allo schermo e una macchina che
     * si muoveva, e niente diceva che le due cose fossero la stessa.
     *
     * Questi due numeri lo dicono, e sono gia' nella simulazione: l'angolo
     * della PINNA in questo istante, e il rollio della nave NUDA -- cioe'
     * quanto rollerebbe senza. Il secondo e' il controfattuale, ed e' la tesi
     * del sito detta con i suoi stessi numeri nel momento in cui la si guarda.
     *
     * Niente e' scritto a mano: se la fisica cambia, cambia la frase.
     */
    if (el.pinna) el.pinna.textContent = grad(S.pinna * 180 / Math.PI)
    /**
     * IL PICCO, NON L'ISTANTE. La frase e' «senza, X gradi di rollio», che e'
     * un'affermazione di grandezza; con il valore istantaneo si leggeva
     * «ROLL 16,4» accanto a «without it, 2,8» -- il controfattuale piu'
     * piccolo del fatto, che sembra un errore e non lo era. Le due grandezze
     * oscillano e venivano campionate a fasi diverse. Verificato sulle
     * escursioni: acceso 1,34 contro 14,60, spento 16,48 contro 16,97.
     */
    if (el.nudo) el.nudo.textContent = grad(Math.abs(S.piccoNudo))
    if (el.rollio2) el.rollio2.textContent = grad(Math.abs(S.rollio))

    /**
     * LA RIDUZIONE E' MISURATA, non stampata.
     *
     * Prima qui c'era `Math.round((1 - SMORZAMENTO) * 100)`, cioe' una costante
     * scritta a mano che diceva sempre 89. Ora arriva da `S.riduzione`: il
     * rapporto fra le RMS a regime di due simulazioni parallele — una con le
     * pinne e una senza — mediate su piu' realizzazioni del mare. Il numero se
     * lo guadagna.
     *
     * --- E QUI C'ERA UNA PROMESSA CHE AL PUNTO DI LAVORO NON E' MANTENUTA
     *
     * Diceva: «cambia con il mare e con la velocita' perche' nella realta'
     * cambia». Con la velocita' si', col mare NO -- non all'andatura da cui il
     * sito si apre. Misurato sulla tabella spedita, scarto fra mare 1 e mare 5:
     *
     *      4 nodi   40,6 punti   [43,8  10,9  5,8  4,1  3,2]
     *      8 nodi   63,3         [80,4  80,5  72,9 25,2 17,2]
     *     12 nodi    0,02        [90,8  90,8  90,8 90,8 90,8]   <- il default
     *     20 nodi    0,01        [96,6  96,6  96,6 96,6 96,6]
     *
     * Non e' un difetto del modello: e' cio' che fa un sistema LINEARE. Sotto
     * lo stallo `portanza(a) = a`, l'angolo di pinna e' proporzionale alla
     * velocita' di rollio, quindi raddoppiando il mare raddoppiano sia il
     * rollio sia la correzione e il rapporto resta. Il mare torna a contare
     * solo quando la pinna finisce la corsa, cioe' sotto gli ~11 nodi.
     *
     * Trovato da una revisione esterna, che ha notato la cosa giusta: lo
     * stallo era stato introdotto APPOSTA per rompere quei cinque numeri
     * uguali, e non arriva dove il sito si apre. Curato dicendolo in pagina,
     * non cambiando il modello -- il modello ha ragione.
     *
     * (Questo commento diceva "il rapporto fra i picchi". Era vero per una
     * settimana e poi non piu': il picco su finestra finita non converge.)
     */
    /**
     * ─── E SI SPEGNE ANCHE COL GIROSCOPIO ACCESO, perche' quel numero non lo vede
     *
     * DIFETTO TROVATO DA UNA REVISIONE, misurato e confermato. `S.riduzione`
     * legge `riduzioneVera`, cioe' la tabella `riduzioni.json`, che e' generata
     * da `_riduzioneCruda` -- e quella chiama `viva.passo(...)` con SEI
     * argomenti: il settimo, `gyro`, resta al suo default zero. La tabella e'
     * strutturalmente di sole PINNE.
     *
     * Ma la nave che si vede il giroscopio ce l'ha (`simulazione.js`, la corsa
     * viva riceve `S.autoritaGiroscopio`). Quindi il numero descrive una nave
     * diversa da quella sullo schermo, e a bassa andatura la distanza e'
     * enorme -- misurato, mare 5:
     *
     *     pinne @12 kn        riduzione vera 90,7%   il pannello diceva 90,8%
     *     pinne+gyro @12 kn                  91,9%                       90,8%
     *     pinne @ 4 kn                        3,2%                        3,2%
     *     pinne+gyro @ 4 kn                  58,5%                        3,2%
     *
     * Cinquantacinque punti di scarto proprio all'andatura che il giroscopio
     * esiste per raccontare. Un visitatore accende il rotore, VEDE la nave
     * calmarsi, e legge «3%»: il numero e la scena si contraddicono nello
     * stesso fotogramma.
     *
     * ─── PERCHE' SI SPEGNE INVECE DI CORREGGERSI
     *
     * La regola c'era gia' ed e' giusta: a pinne spente il pannello sparisce,
     * perche' una metrica di pinne senza pinne non significa niente. Qui e' la
     * stessa cosa vista dall'altro lato -- una metrica di SOLE pinne mentre un
     * secondo stabilizzatore fa il grosso del lavoro. Estendere quella regola
     * non inventa niente: applica una decisione gia' presa al caso che le
     * mancava.
     *
     * LA CURA VERA E' UN'ALTRA, e sta sul tavolo: calcolare la riduzione DAL
     * VIVO, `1 - RMS(viva)/RMS(nuda)`, con `viva` che il giroscopio ce l'ha
     * gia'. Le due corse girano fianco a fianco a ogni passo: la macchina per
     * farlo giusto e' li'. Non si fa stanotte perche' ha un costo noto e
     * documentato -- un rapporto letto troppo presto ballava e dichiarava 52%
     * invece di 90 -- e quel costo si paga con una finestra di assestamento,
     * non con una riga.
     *
     * Fino ad allora: meglio nessun numero che un numero che contraddice la
     * nave.
     */
    const soloPinne = !S.giroscopio && (S.giriGiroscopio || 0) < 0.02
    const attiva = S.stab && soloPinne && AMPIEZZA_MARE[S.mare] > 0 && S.riduzione > 0.005
    el.riduzione.textContent = attiva ? String(Math.round(S.riduzione * 100)) : '0'

    const stato = `${attiva}`
    if (stato !== ultimoStato) {
      ultimoStato = stato
      el.dRiduzione.dataset.attiva = attiva ? 'si' : 'no'
    }
  }
}
