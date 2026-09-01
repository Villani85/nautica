import {
  Scene, PerspectiveCamera, WebGLRenderer, HemisphereLight, DirectionalLight,
  Box3, Clock, MathUtils, SRGBColorSpace, AgXToneMapping, Plane, Vector3,
  PMREMGenerator, Raycaster, PCFSoftShadowMap, Object3D
} from 'three'
import { costruisciNave, Z_PINNE } from './nave.js'
import { POPPA_Z, PRUA_Z } from '../scafo/ordinate.js'
import { nebbiaAcqua, ACQUA_SIGMA, ACQUA_COLORE, costruisciAcqua, METRI_PER_UNITA } from './acqua.js'
import { creaImpianto } from './impianto.js'
import { creaSovrastruttura } from './sovrastruttura.js'
import { creaSalone3D } from './salone3d.js'
import { creaTraversata } from './traversata.js'
import { creaMondo, vuoleMondo } from './mondo.js'
import { creaMacchine } from './macchine.js'
import { LA_SCENA_E_UNA } from '../regia.js'
import { creaAmbiente, creaAmbienteInterno, telaAmbiente } from './ambiente.js'
import { applicaAmbiente, materiaDelloScafo} from './materiali.js'
import { costruisciFuoribordo } from './fuoribordo.js'
import { avanza, FERMO_A } from '../stato.js'

const RAGGIO = 19.5
/** `?senzaFilmato=1`: vedi `impostaTraversata` in fondo al file. */
const SENZA_FILMATO = new URLSearchParams(location.search).has('senzaFilmato')

const RAGGIO_SEZIONE = 7.2
/**
 * Dove sta il piano longitudinale quando NON taglia. 2,5 e' fuori dallo scafo:
 * la semilarghezza massima e' 1,95, MISURATA sulla scena viva con
 * `strumenti/dove-stanno.mjs` e non dedotta dalle ordinate, perche' fra le
 * ordinate e la mesh in scena ci sono una scala e uno spessore di fasciame.
 * Il margine e' mezza unita': abbastanza da non mordere il fasciame per un
 * errore di arrotondamento, poco da non far perdere corsa all'animazione.
 */
const X_INTERO = 2.5
/** A zero resta esattamente la meta' di babordo. */
const X_MEZZO = 0.0
/** L'ultima battuta: abbastanza vicino da leggere i bulloni della fondazione. */
/**
 * QUANTO SI ALZA LA CAMERA SUL PRIMO PIANO DEL MECCANISMO, in unita' di scena
 * (una unita' = 2,5 m). **Zero**, e non e' un segnaposto: e' il risultato di
 * uno spazzolamento (vedi il commento sulla quota, piu' sotto). La leva resta
 * perche' serve a rifare quella prova in due minuti quando arrivera' il
 * filmato definitivo, non perche' ci sia un numero da trovare qui.
 */
const QUOTA_MECCANISMO = 0
/**
 * QUANTO STA VICINO LA CAMERA AL MECCANISMO. Era 2,6 e ora e' 2,1, e il numero
 * viene da una misura, non dall'occhio.
 *
 * L'ultimo fotogramma del filmato della discesa e' il bersaglio: li' la pinna
 * e' alta **158,5 px** (media su quattro colonne, su una tela 1280x720). A 2,6
 * la mia era alta fra 25 e 94 a seconda della posa -- non e' una differenza di
 * inquadratura, e' una differenza di SCALA, e si vedrebbe come uno stacco nel
 * punto in cui il sito prende il comando.
 *
 * Spazzolati quattro raggi per tre istanti, con la scena inchiodata
 * (`strumenti/consegna.mjs`):
 *
 *     raggio 2,6  ->  93,8 px      raggio 1,7  ->  profilo rotto
 *     raggio 2,1  -> 144,5 px      raggio 1,4  ->  profilo rotto
 *
 * A 1,7 e 1,4 la media si avvicina ancora ma il profilo si sfascia
 * (239 82 77 77): le colonne pescano lo scafo invece della pinna, e la media
 * diventa un numero che risponde a un'altra domanda. Il valore piu' vicino non
 * e' quello giusto: quello giusto e' l'ultimo in cui il metro misura ancora la
 * pinna.
 *
 * ─── POI L'HO RIFATTO FINE, perche' una revisione ha visto il buco
 *
 * Mi ero fermato a 2,1 con una griglia da quattro punti, e 2,1 resta **9%
 * corto** (144,5 contro 158,5). Fra 2,1 e 1,7 non avevo misurato niente, e
 * «2,1 e' l'ultimo onesto» era dedotto da una griglia grossa, non visto. La
 * revisione l'ha detto, e aveva ragione. Rifatto a passo 0,1 su tre istanti:
 *
 *     raggio   9 s      18 s     24 s     profilo
 *       2,1   146,5    125,0    134,0    pulito
 *       2,0   156,5    136,8    146,8    pulito
 *       1,9   169,8    150,0    159,8    pulito
 *       1,8    70,3    162,0     93,5    ROTTO in 2 istanti su 3
 *
 * **2,0**: a 156,5 contro 158,5 lo scarto e' 1,3%, il profilo per colonne e'
 * 164 165 152 145 contro 181 165 152 136 del filmato -- stessa forma -- e
 * restano due passi interi di margine prima che il metro si rompa.
 *
 * 1,9 ha la media migliore sui tre istanti (+1,4 px contro -11,9), ma sta
 * ATTACCATO al valore in cui il profilo si sfascia, e la posa alla consegna non
 * si comanda: nel sito vivo il tempo scorre. Fra un ottimo con un passo di
 * margine e un ottimo con zero, si prende il primo -- e la scelta definitiva
 * si fa quando il filmato sara' montato in pagina, cioe' quando la consegna
 * esistera' davvero e non solo in uno strumento.
 *
 * Avvicinarsi non tocca l'invariante: il beccheggio resta zero e la linea
 * d'acqua resta sulla mezzeria. E' l'unica leva di scala che non mente --
 * inclinare la pinna a mano sarebbe una posa che la fisica non produce, e
 * alzare la camera, provato e misurato, guarda un altro pezzo di nave.
 */
const RAGGIO_MECCANISMO = 2.0
// La decisione «una scena o due» sta in un posto solo, `regia.js`: due
// definizioni della stessa condizione sono due condizioni che un giorno
// divergono, e qui divergerebbero fra la corsa della camera e le battute.
const AZIMUT_MAX = 0.92

/** Dove sta il meccanismo: e' li' che la camera va a finire. */
const MIRA_MECCANISMO = 1.15

/**
 * Quota del piano di sezione LUNGO la nave. Parte da poppa, cioe' fuori da
 * tutto, e arriva poco a poppavia degli stabilizzatori: la fetta che si toglie
 * scopre il locale macchine.
 */
const Z_FUORI = POPPA_Z + 0.4
const Z_DENTRO = Z_PINNE + 0.55

/**
 * Taratura delle luci dopo il porto a three 0.185.
 *
 * Il prototipo girava su r12x, prima che l'illuminazione fisica diventasse
 * l'unica modalita' e prima della gestione del colore. Gli stessi numeri, qui,
 * darebbero una scena piu' scura: i valori sono stati rimoltiplicati e poi
 * corretti GUARDANDO il provino, non ricopiati.
 */
const LUCI = {
  emisfero: 2.7,
  sole: 3.6,
  controluce: 1.4,
  /**
   * ─── LA QUARTA LUCE NON C'E' PIU', ed e' stata tolta perche' non arrivava
   *
   * C'era una `fondale`, puntiforme verde-acqua a y=-9,5, intensita' 3,2,
   * portata 14, decadimento 1,6. Doveva «dare fondo all'acqua profonda».
   *
   * Prima era 12 con portata 22 e illuminava di verde l'INTERNO della carena
   * sezionata -- una cavita' accesa dove doveva esserci buio. Abbassata e
   * spostata in basso, quel difetto e' sparito. Ed e' sparita anche la luce:
   * la stessa correzione l'ha portata sotto la soglia di visibilita' OVUNQUE,
   * compreso il fondo dell'acqua che era il suo mestiere.
   *
   * Segnalato da una revisione esterna e verificato qui, con la scena
   * inchiodata (`?fermo=12`, o il mare in movimento copre tutto con un rumore
   * di 155 livelli e la prova non si puo' fare):
   *
   *     spegnendola      acqua sotto la nave   0,000 di media, massimo 0
   *                      acqua attorno         -0,004, massimo 1
   *                      tutto il fotogramma   -0,001, massimo 2
   *     a 200 volte      tutto il fotogramma   +0,155, massimo 61
   *
   * A duecento volte la sua intensita' si vede appena. Al valore vero non
   * esiste.
   *
   * E costava piu' del niente che dava: la diagnosi sull'impianto, misurata
   * spegnendo TUTTE le luci insieme, contava quattro sorgenti mentre erano
   * tre. Una costante che il render ignora non e' innocua: falsa il conto di
   * chi viene dopo.
   *
   * Il fondo dell'acqua ora lo fa l'estinzione di Beer-Lambert col sigma
   * derivato dal disco di Secchi, che e' fisica invece di una lampada.
   */
}

/**
 * `base` e' l'indirizzo da cui pendono gli asset. Arriva da fuori, come nel
 * salone: il sito vive sotto /nautica/ su GitHub Pages e alla radice in locale,
 * quindi un percorso assoluto scritto qui funzionerebbe in un posto solo.
 */
export function creaScena (contenitore, base = import.meta.env.BASE_URL) {
  /** L'ultimo stato passato a `disegna`, per `?ispeziona=1`. */
  let ultimoStato = null
  /** L'ultima corsa della traversata, per la camera del mondo. Vedi `disegna`. */
  let corsaTraversata = 0
  /* quanto si e' dentro la CODA. Serve al ciclo di disegno per sapere che la
     traversata e' finita: vedi `mostra` qui sotto. */
  let corsaCoda = 0
  /**
   * ─── E IL MONDO NON SE NE VA PRIMA CHE IL SALONE SIA ARRIVATO
   *
   * La consegna alla calma sale con `c * 8` in `traversata.js`, quindi la
   * lastra e' piena a `c = 0,125`. Spegnendo il mondo a 0,002 -- appena la coda
   * comincia -- restava una finestra in cui il salone e' al due per cento e il
   * mondo non c'e' piu': dentro quella finestra si vedrebbe la nave DA FUORI,
   * cioe' un lampo di mare in mezzo a una consegna che deve essere continua.
   *
   * 0,13 e' appena oltre il punto in cui la lastra copre: il mondo resta dietro
   * finche' non serve piu'. Un numero solo, e viene dallo stesso conto della
   * rampa -- se quella cambia, questo va cambiato con lei, e sta scritto qui
   * accanto perche' si trovino insieme.
   */
  const CODA_CONSEGNATA = 0.13
  /**
   * Appoggio per costruire la posa d'arrivo del mondo: vedi `ancoraA`.
   *
   * `isCamera = true` NON e' un trucco, e' la convenzione. `Object3D.lookAt`
   * punta al bersaglio il **+Z** per un oggetto qualunque e il **-Z** per una
   * camera o una luce. Senza questa riga il quaternione usciva [0, 1, 0, 0] --
   * centottanta gradi esatti -- e la correzione diventava 161 invece di 19.
   * Avevo scritto che il bersaglio era sbagliato: era sbagliata la convenzione,
   * e i 180 gradi tondi lo dicevano gia'.
   */
  const _mira = new Object3D()
  _mira.isCamera = true
  /* l'ultima simulazione passata a `disegna`: serve al passo dichiarato, che
     deve poter rientrare in `disegna` senza che il chiamante gliela ripassi */
  let ultimaSim = null
  const scena = new Scene()

  /**
   * ─── DENTRO SI GUARDA CON UNA LENTE PIU' CORTA, e non e' gusto: e' geometria
   *
   * Il campo del sito e' 34 gradi in verticale -- una lente da 60 mm -- ed e'
   * quello giusto per la nave al largo e per la fotografia del salone, che e'
   * stata montata su quell'angolo (`riferimenti/salone/posa.json`). Ma la
   * traversata passa DENTRO stanze da 3,2 m di larghezza e 3,0 di altezza, e
   * a 34 gradi (26 in orizzontale, per lato, su una tela 16:10) le pareti
   * entrano nel quadro solo oltre 3,3 m, il soffitto oltre 4,7 m, il
   * pavimento oltre 5. La sala macchine e' lunga 4,3: a quella lente NON PUO'
   * mostrare ne' soffitto, ne' pavimento, ne' i tubi che le corrono sotto il
   * cielino. Nel provino si vedeva un gradiente grigio con una porta in
   * mezzo, e si era dato la colpa alla cottura, alle luci, all'arredo: era la
   * lente. L'inventario (`strumenti/inventario-mondo.mjs`) diceva che i tubi
   * c'erano, a 1,1 m sopra l'occhio e 1,5 di lato: fuori quadro per
   * costruzione.
   *
   * Quindi dentro il campo si apre e torna a 34 PRIMA che il salone conti: la
   * fotografia esige l'angolo suo, e il guscio e' proiettato su quello. La
   * rampa e' morbida lungo il percorso -- una carrellata in avanti con uno
   * zoom lento verso il teleobiettivo si legge come «ci si avvicina», non come
   * un effetto.
   *
   * IL VALORE APERTO E' UN NUMERO SUL TAVOLO: 58 e' quello che fa entrare le
   * pareti della sala macchine entro 1,6 m e il soffitto entro 2,2. `?campo=<n>`
   * lo cambia per guardarlo; dove finisce la rampa e' `CAMPO_TORNA_SITO_A`.
   */
  const CAMPO_SITO_GRADI = 34
  const CAMPO_DENTRO_GRADI = (() => {
    const v = Number(new URLSearchParams(location.search).get('campo'))
    return Number.isFinite(v) && v >= CAMPO_SITO_GRADI && v <= 100 ? v : 58
  })()
  /* la rampa: da s=0 (campo aperto) a qui (campo del sito), poi resta */
  const CAMPO_TORNA_SITO_A = 0.88
  function campoTraversata (s) {
    const t = MathUtils.smoothstep(s, 0, CAMPO_TORNA_SITO_A)
    return MathUtils.lerp(CAMPO_DENTRO_GRADI, CAMPO_SITO_GRADI, t)
  }
  /* si scrive solo se cambia: la matrice di proiezione non si rifa' per niente */
  function impostaCampo (gradi) {
    if (camera.fov === gradi) return
    camera.fov = gradi
    camera.updateProjectionMatrix()
  }

  /**
   * Il fulcro di tutto il sito: la camera sta a quota zero e guarda
   * l'orizzonte. Cosi' la linea di galleggiamento cade SEMPRE a meta'
   * schermo esatta, e il fondo CSS puo' spaccarsi al 50% combaciando col
   * disegno senza che niente vada sincronizzato.
   */
  const camera = new PerspectiveCamera(CAMPO_SITO_GRADI, 1, 0.1, 120)
  camera.position.set(0, 0, RAGGIO)
  camera.lookAt(0, 0, 0)

  let render
  try {
    render = new WebGLRenderer({ antialias: true, alpha: true })
  } catch (e) {
    return null
  }
  if (!render.getContext()) return null

  render.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  // Il piano di sezione taglia solo i materiali del guscio: quello che resta
  // e' il meccanismo, cioe' la tesi del sito.
  render.localClippingEnabled = true
  render.outputColorSpace = SRGBColorSpace
  /**
   * --- IL TONE MAPPING C'E', E IL FOGLIO DI STILE LO INSEGUE
   *
   * Qui c'era `NoToneMapping`, con la ragione giusta: i colori devono restare
   * quelli della carta, o la giunzione fra fondo CSS e tela si vede. Ma quella
   * ragione risolveva un problema creandone uno piu' grande, e il numero lo
   * dice:
   *
   *     tono      bruciato    max   media  contrasto
   *     senza        8,28%    255   189,4       57,9
   *     ACES         0,00%    242   196,5       53,5
   *
   * L'8,28% dei pixel dello scafo TAGLIA a 255. Senza una curva, ogni alta
   * luce sopra 1,0 diventa bianco piatto -- e un metallo con `metalness` fino
   * a 0,85 le produce a ogni fotogramma. E' il motivo per cui la nave legge
   * come un disegno: le sue parti piu' lucide sono aree bianche senza forma.
   *
   * E il salone, nella stessa pagina, usa ACES da sempre: erano due mondi
   * diversi a due schermate di distanza.
   *
   * ─── E POI ACES SE N'E' ANDATO, PERCHE' HA UN TETTO
   *
   * Il difetto che restava: `RRTAndODTFit` non arriva a 1,0, si ferma a **242**
   * livelli. Non brucia — l'8,28% di prima e' sparito davvero — ma la
   * sovrastruttura, che e' la massa piu' grande dell'inquadratura ed e'
   * verniciata di bianco, ci vive addosso. Misurato da
   * `strumenti/curva-tonale.mjs` sul fotogramma della battuta 0,30, con la
   * maschera presa dai mesh `sovra_*` (54 mila pixel):
   *
   *     curva        mediana   media    max   pixel >=235
   *     ACES @1,0      226,0   185,1    242      1,5%
   *     AgX  @1,0      201,3   168,9    229      0,0%
   *     AgX  @0,8      193,3   160,9    229      0,0%
   *     AgX  @0,7      188,0   155,9    229      0,0%
   *     AgX  @0,5      174,0   142,9    229      0,0%
   *
   * A 226 di mediana contro un tetto di 242 restano SEDICI livelli di corsa:
   * li' la curva non ha piu' pendenza, due radianze diverse escono allo stesso
   * valore e la forma della sovrastruttura si perde. E' il modo in cui un
   * render legge come plastica, ed e' il difetto numero uno del committente.
   * Con AgX ne restano quaranta, e il gradiente torna.
   *
   * ─── E L'ESPOSIZIONE E' 0,7 PER UNA RAGIONE MISURATA, non per gusto
   *
   * Sotto AgX ogni esposizione fra 1,0 e 0,5 toglie il difetto (nessun pixel
   * al tetto). A decidere e' stato il SECONDO vincolo: l'acqua disegnata deve
   * restare dov'era, o il foglio di stile va riscritto in mezza pagina. Colore
   * dell'acqua disegnata a x 900-1200, righe 500-560, scarto da ACES @1,0:
   *
   *     AgX @1,0   +15,9  +10,8  +11,3
   *     AgX @0,8   +10,1   +4,3   +4,8
   *     AgX @0,7    +6,7   +0,5   +1,0   <- il minimo dell'intero sondaggio
   *     AgX @0,6    +3,1   -3,8   -3,2
   *     AgX @0,5    -0,8   -8,7   -8,1
   *
   * A 0,7 il verde e il blu del mare tornano dov'erano a meno di un livello:
   * si muove solo il rosso, di 6,7. Quindi il foglio di stile insegue con una
   * riga sola — `--acqua-viva` — invece che con tutta la tavolozza.
   *
   * E c'e' un ancoraggio esterno: `cuoci.py` rende in AgX a -1EV, cioe'
   * esposizione 0,5, ed e' il riferimento path-traced contro cui si misura il
   * fotorealismo. Da oggi la pagina e il banco condividono la CURVA e
   * differiscono di un terzo di stop, invece di essere due trasferimenti
   * diversi. Prima `confronto-cotto.mjs` forzava AgX@0,5 su un sito che
   * spediva ACES@1,0: ogni referto di somiglianza parlava di un'immagine che
   * nessuno vedeva.
   *
   * La giunzione resta a zero perche' i colori della carta sono stati
   * RICALCOLATI su questa curva e verificati: vedi --acqua in stile.css.
   * Inseguire il render col foglio di stile e' la strada giusta, perche' il
   * render obbedisce alla fisica e il foglio di stile obbedisce a me.
   */
  render.toneMapping = AgXToneMapping
  render.toneMappingExposure = 0.7
  contenitore.appendChild(render.domElement)

  /**
   * ─── L'AMBIENTE, e perche' non c'era
   *
   * In tutta la scena non esisteva nessun `scene.environment`, mentre
   * `materiali.js` arriva a `metalness: 0.85`. **Un metallo senza ambiente non
   * ha niente da riflettere**: viene fuori plastica grigia, e nessuna taratura
   * delle luci lo salva. E' il salto visivo piu' grande disponibile su questa
   * scena, ed era li' da prendere: `ambiente.js` esisteva gia' e completo, ma
   * era collegato solo alla scena del salone — che nel frattempo ha cambiato
   * mestiere ed e' diventata la sorgente delle sagome. Il capitolo che si vede
   * ne era rimasto scoperto.
   *
   * Non e' un HDRI scaricato, e la ragione e' scritta per esteso in
   * `ambiente.js`: pesa 1-2 MB contro un budget di 500 KB, e porterebbe con se'
   * i colori di un cielo vero — lo scafo comincerebbe a riflettere un azzurro
   * che nel sito non esiste. L'ambiente qui e' disegnato coi colori del foglio
   * di stile, carta sopra la linea e acqua sotto: **lo scafo riflette la linea
   * del sito su se stesso**, che non e' un ripiego ma la tesi applicata alla
   * luce.
   */
  // La mappa serve DUE VOLTE: ai materiali del sito per nome, e ai materiali
  // che arrivano dentro il GLB, che nessun elenco per nome puo' conoscere.
  let ambiente = null
  let ambienteSotto = null
  if (!location.search.includes('senzaAmbiente')) {
    ambiente = creaAmbiente(render, PMREMGenerator, 1.0)
    applicaAmbiente(ambiente)
    /**
     * L'IMPIANTO HA UN AMBIENTE SUO, PIU' CHIARO SOTTO LA LINEA.
     *
     * Misurato con `strumenti/maschera-soggetto.mjs`: il meccanismo e'
     * l'unica cosa in scena che l'ambiente muove, e la tavolozza della pagina
     * gli fa riflettere l'ACQUA PROFONDA mentre lui sta un metro sotto il
     * pelo. La pagina non cambia: questo ambiente vale solo per i suoi
     * materiali.
     */
    ambienteSotto = creaAmbiente(render, PMREMGenerator, 1.0,
      Number(new URLSearchParams(location.search).get('sotto') ?? 0.55))
  }

  /**
   * ─── LE LUCI SI POSSONO PROVARE SENZA RICOMPILARE
   *
   *     ?luce=<emisfero>,<sole>,<quota del sole>
   *
   * Serve a tarare l'impianto contro il riferimento invece che a occhio.
   * Misurato accendendo e spegnendo ciascun impianto dalla sua parte, quanto
   * aggiunge la luce a ogni fascia della nave:
   *
   *       fascia            sito     Cycles
   *       sovrastruttura    41,0      2,2
   *       coperta           40,7     43,5
   *       murata            26,1     44,0
   *
   * Sulla coperta i due fanno la stessa cosa; sulle altre due fanno il
   * contrario. Una sovrastruttura illuminata da tutte le parti perde le facce,
   * un fianco che riceve poca luce perde la forma: sono le due cose che fanno
   * leggere una nave come un modellino.
   *
   * Vale solo con `ispeziona`, come le altre leve: in pagina restano i numeri
   * di `LUCI`.
   */
  const _q = new URLSearchParams(location.search).get('luce')
  const _l = _q ? _q.split(',').map(Number) : []
  const EMISFERO = Number.isFinite(_l[0]) ? _l[0] : LUCI.emisfero
  const SOLE = Number.isFinite(_l[1]) ? _l[1] : LUCI.sole
  const SOLE_Y = Number.isFinite(_l[2]) ? _l[2] : 7
  /* anche il controluce, o l'impianto si poteva provare solo a meta' */
  const CONTROLUCE = Number.isFinite(_l[3]) ? _l[3] : LUCI.controluce

  scena.add(new HemisphereLight(0xe9e5dd, 0x071a1d, EMISFERO))
  const sole = new DirectionalLight(0xfff6e4, SOLE)
  sole.position.set(4.5, SOLE_Y, 6); scena.add(sole)

  /**
   * ─── LE OMBRE, e perche' non c'erano
   *
   * In tutta la scena non esisteva un `castShadow`. Con tre ponti sovrapposti
   * il risultato si legge come **carta ritagliata**: il ponte superiore non si
   * posa su quello sotto, la murata non lascia niente sulla coperta, e il
   * cervello non riceve l'unico segnale che dice «questi volumi stanno uno
   * davanti all'altro». Nessun materiale e nessun riflesso lo sostituisce.
   *
   * Una sola luce le proietta — il sole. Il controluce
   * no: due sorgenti che proiettano danno due ombre, e due ombre su una barca
   * ferma al sole sono il primo indizio che la scena e' finta.
   *
   * IL TRONCO E' STRETTO INTORNO ALLA NAVE, e non e' un'ottimizzazione: una
   * mappa d'ombra copre il suo tronco con la stessa risoluzione qualunque sia
   * la sua estensione. Coprire tutta la scena vorrebbe dire sprecare quasi
   * tutti i texel sull'acqua vuota e lasciarne pochissimi alla sovrastruttura,
   * che e' l'unico posto dove l'ombra ha qualcosa da dire.
   *
   * `normalBias` invece di `bias`: su superfici quasi parallele alla luce —
   * il fianco dello scafo, quando il sole e' basso — un bias costante o
   * produce righe (acne) o stacca l'ombra dal piede dell'oggetto. Il bias
   * lungo la normale non ha quel compromesso.
   */
  /**
   * ─── LA MAPPA NON E' LA STESSA PER TUTTI
   *
   * 2048x2048 in virgola mobile e' un quarto di schermo in piu' da riempire a
   * ogni fotogramma, e su un telefono di fascia media si paga in batteria e in
   * temperatura prima che in fotogrammi. Segnalato da una revisione come
   * rischio non misurato, ed e' vero: un Android vero non ce l'ho.
   *
   * Quello che si puo' fare senza misurare e' non pretendere. Il livello si
   * sceglie da due indizi che il browser da' senza mentire troppo: quanti
   * nuclei dichiara la macchina, e quanto e' piccolo il lato corto dello
   * schermo. Non e' una diagnosi — e' una prudenza, e sotto ai 1024 texel su
   * uno schermo da telefono l'ombra si legge lo stesso, perche' e' piu'
   * piccola in pixel.
   *
   * `?ombre=0|1024|2048` la forza, per poterla guardare invece di discuterla.
   */
  /**
   * `?ombre` accetta solo i tre livelli che esistono. Un numero qualunque —
   * `?ombre=37` — produrrebbe una mappa che nessuno ha mai guardato, e un
   * interruttore diagnostico che accetta valori non previsti smette di essere
   * una diagnosi: diventa un altro modo di rompere la scena.
   */
  const LIVELLI_OMBRA = [0, 1024, 2048]
  const chiesta = new URLSearchParams(location.search).get('ombre')
  const forzata = chiesta !== null && LIVELLI_OMBRA.includes(Number(chiesta)) ? chiesta : null
  if (chiesta !== null && forzata === null) {
    console.warn(`[nautica] ?ombre=${chiesta} non e' fra ${LIVELLI_OMBRA.join(', ')}: ignorato`)
  }
  const nuclei = navigator.hardwareConcurrency || 4
  const latoCorto = Math.min(screen.width, screen.height)
  const auto = (nuclei <= 4 || latoCorto < 700) ? 1024 : 2048
  const TESSITURA_OMBRA = forzata !== null ? Number(forzata) : auto

  render.shadowMap.enabled = TESSITURA_OMBRA > 0
  render.shadowMap.type = PCFSoftShadowMap
  sole.castShadow = TESSITURA_OMBRA > 0
  if (TESSITURA_OMBRA > 0) sole.shadow.mapSize.set(TESSITURA_OMBRA, TESSITURA_OMBRA)
  const c = sole.shadow.camera
  c.left = -11; c.right = 11; c.top = 8; c.bottom = -8
  c.near = 0.5; c.far = 34
  c.updateProjectionMatrix()
  sole.shadow.normalBias = 0.03
  const controluce = new DirectionalLight(0x9fd8cc, CONTROLUCE)
  controluce.position.set(-6, 2.5, -4); scena.add(controluce)

  const { nave, agganci, guscio, tappo, spostaTappo, tuga, allestimento } = costruisciNave(base)

  /**
   * ─── CHI FINISCE SOTT'ACQUA SE NE ACCORGE
   *
   * `nebbiaAcqua` spegne il colore in proporzione al cammino nell'acqua, e va
   * dato a OGNI materiale che puo' trovarsi sotto la linea -- lo scafo, la sua
   * faccia interna, il meccanismo, i tappi di sezione. Non all'acqua stessa,
   * che l'acqua non si assorbe addosso.
   *
   * Si riapplica a ogni caricamento perche' sovrastruttura e impianto arrivano
   * in differita: un materiale che arriva dopo, senza questa riga, resterebbe
   * l'unico pezzo luminoso di un fondale scuro -- e si vedrebbe.
   */
  const uniAcqua = {
    colore: { value: new Vector3(...ACQUA_COLORE) },
    sigma: { value: ACQUA_SIGMA },
    attiva: { value: 1 },
    /**
     * La quota della camera, che serve allo shader per sapere quanta parte
     * della linea di vista sta in ARIA. Si aggiorna a ogni fotogramma: in
     * uscita dal salone scende da dentro la tuga fino al pelo, ed e' proprio
     * quel tratto in cui la vecchia formula assorbiva l'84,6% di troppo.
     */
    quotaCamera: { value: 0 }
  }
  const immergi = (radice) => {
    const visti = new Set()
    radice.traverse((o) => {
      const ms = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : [])
      for (const m of ms) {
        if (!m || visti.has(m.uuid)) continue
        if (m.name === 'pelo' || m.name === 'velo') continue
        /**
         * SOLO i materiali ILLUMINATI. `nebbiaAcqua` legge `vViewPosition`,
         * che esiste nello shader di un materiale con luci e NON in quello di
         * una linea o di un `MeshBasicMaterial`. Applicandolo a tutto, il
         * programma di un `LineBasicMaterial` non compilava
         * (`VALIDATE_STATUS false`, «'vViewPosition' undeclared») e la pagina
         * sollevava sei errori -- portandosi dietro anche il caricamento della
         * sovrastruttura, che moriva su un `undefined` a valle. Un difetto in
         * un posto, tre sintomi in altri tre.
         */
        if (!(m.isMeshStandardMaterial || m.isMeshPhysicalMaterial)) continue
        if (m.userData && m.userData.immerso) continue
        visti.add(m.uuid)
        m.userData = m.userData || {}
        m.userData.immerso = true
        nebbiaAcqua(m, uniAcqua)
      }
    })
  }
  /**
   * LA MATERIA DELLO SCAFO VA DOPO `immergi`, e l'ordine e' il punto: la
   * lavorazione si COMPONE con chi ha gia' patchato il materiale, quindi
   * l'assorbimento dell'acqua deve essere gia' li'. Al contrario funzionerebbe
   * lo stesso ma per caso, e il giorno che qualcuno inverte due righe lo scafo
   * smetterebbe di spegnersi sott'acqua senza un errore.
   */
  materiaDelloScafo()

  immergi(nave)
  const tugaQuota = tuga.quota
  const tugaZ = tuga.z
  scena.add(nave)

  /**
   * ─── L'IMPIANTO ARRIVA DA UN FILE, non si costruisce qui
   *
   * `docs/14` §2: una sola fonte geometrica. Questo codice carica, scala,
   * aggancia e comanda — non ricostruisce niente.
   *
   * Il caricamento e' ASINCRONO e non blocca: la scena parte senza, e i due
   * gruppi compaiono quando il file arriva. Il §9 lo richiede — «nessun modello
   * nel percorso critico della prima schermata» — e ha una conseguenza che vale
   * la pena dire: chi guarda il capitolo nei primi istanti vede lo scafo senza
   * pinne. E' preferibile a una schermata che aspetta.
   */
  const impianti = agganci.map(a => {
    const i = creaImpianto(base, ambienteSotto || ambiente)
    i.gruppo.position.set(...a.posizione)
    /**
     * --- PERCHE' IL MECCANISMO E' SCURO, E PERCHE' NON L'HO ANCORA CURATO
     *
     * Alla battuta che dice «The part you never see» il pezzo e' una sagoma:
     * misurato sul provino, gamma 23 su 255 sotto la linea. E' il momento
     * della tesi del sito, ed e' il difetto piu' grosso che ho trovato
     * stanotte.
     *
     * TRE CAUSE CERCATE E SCARTATE, ognuna con un numero:
     *   · non e' l'ambiente -- `envMapIntensity` da 0,55 a 3 sposta la media
     *     da 45,6 a 48,5, cioe' niente;
     *   · non e' il velo dell'acqua -- misurato per nome, scende da 0,72 a
     *     0,12 e a quella battuta e' gia' al minimo;
     *   · non e' il tone mapping -- con e senza ACES nello stesso istante la
     *     gamma passa da 217 a 213.
     *
     *   · e **non e' nemmeno l'ombra dello scafo**, che era la mia ipotesi
     *     migliore: togliendo il meccanismo dai riceventi -- 58 mesh,
     *     `receiveShadow = false` -- cambia lo **0,02% dei pixel**, massimo 10
     *     livelli. L'avevo gia' scritta qui come causa accertata prima di
     *     provarla, ed era falsa.
     *
     * QUINDI LA CAUSA NON LA SO ANCORA, e questo commento serve a non farla
     * ricercare da capo nei quattro posti dove non e'. Il sospetto che resta:
     * materiali metallici scuri con un ambiente che sotto la linea e' quasi
     * nero -- un metallo mostra solo cio' che riflette, e li' non c'e' niente.
     * Ma `envMapIntensity` a 3 non lo smentisce e non lo conferma, perche'
     * sposta di tre livelli.
     *
     * UNA LUCE DI CHIAVE NON HA FUNZIONATO, e le tre strade provate stanno
     * qui perche' chi riprova non le ripaghi:
     *
     *   1. luce sul livello 1, meshes sul livello 1. **Non funziona: in three
     *      i livelli di una luce si confrontano con la CAMERA, non con gli
     *      oggetti.** Non esiste luce per-oggetto. Intensita' 0, 6, 12 e 20
     *      davano lo stesso identico numero;
     *   2. luce puntiforme locale: illumina il pezzo (gamma 23 -> 101) ma
     *      accende anche la faccia di taglio dello scafo -- una colonna bianca
     *      che sbianca le etichette DRAW e RECOVERY. Un'interfaccia
     *      illeggibile e' peggio del difetto che stavo curando;
     *   3. faretto puntato sull'ingombro misurato: nessun effetto a 6, 20 e
     *      60 di intensita'. Non ho capito perche' e non l'ho spacciato per
     *      capito;
     *   4. accorciando la portata la colonna sparisce e il pezzo torna al
     *      buio: **soggetto e superficie molesta stanno alla stessa distanza**,
     *      quindi la luce raggiunge tutti e due o nessuno.
     *
     * Da provare, e non stanotte: dare al meccanismo un ambiente PROPRIO --
     * una piccola mappa chiara che valga solo per lui -- invece di una luce.
     * E' la strada che ha funzionato nel render Cycles, dove il pezzo e'
     * diventato leggibile quando ha avuto un'officina da riflettere e non un
     * gradiente.
     */
    // la fiancata opposta NON si ottiene con una scala negativa: rovescerebbe
    // le normali e la pinna di sinistra si illuminerebbe al contrario
    if (a.lato < 0) i.gruppo.rotation.y = Math.PI
    i.lato = a.lato
    nave.add(i.gruppo)
    i.caricato.catch(e => console.error('[impianto]', e.message))
    return i
  })

  /**
   * Il piano tiene i punti con `normale · p + costante > 0`. Con normale
   * (0,0,-1) tiene `z < costante`: abbassando la costante si toglie la meta'
   * vicina alla camera. Lo scafo va da z = -1,5 a z = +1,5.
   */
  const pianoSezione = new Plane(new Vector3(0, 0, -1), Z_FUORI)
  /**
   * ─── E IL SECONDO TAGLIO, QUELLO CHE GIRA LA LAMA DI NOVANTA GRADI
   *
   * `docs/13` §5 chiude il finale con una SEZIONE VERTICALE COMPLETA:
   * meccanismo sotto, salone e persone sopra, un taglio solo. Il piano
   * trasversale qui sopra non puo' farlo, ed e' misurato in `docs/20`: e'
   * `Plane(0,0,-1)`, tiene `z < C`, e il meccanismo si legge solo da C = -0,65
   * -- a quel punto il salone, che sta a z = +0,6, e' gia' dentro la fetta che
   * e' stata tolta. Nessuna costante di quel piano contiene tutti e due.
   *
   * Quindi si gira la lama. Normale (1,0,0), tiene `x < C`: portando C da 2,5
   * (fuori dallo scafo, che ha semilarghezza MISURATA 1,95) a 0,0 si toglie
   * l'intera meta' di dritta e resta una sezione longitudinale sulla mezzeria.
   *
   * Dentro ci sono tutti e quattro i soggetti, e non per fortuna: l'impianto
   * stabilizzatore e' DOPPIO -- `agganci` lo istanzia per lato, e quello di
   * babordo resta dalla parte che non si toglie. Propulsione e giroscopio
   * stanno sulla mezzeria. Il salone e' centrato e ne resta la meta'. E' la
   * tesi del sito in un fotogramma: sopra la gente sta comoda, sotto le
   * macchine lavorano perche' ci stia.
   *
   * I due piani convivono: three li applica in AND, quindi durante il finale il
   * trasversale resta dov'e' e il longitudinale si aggiunge. Non si sostituisce
   * -- sostituirlo richiuderebbe lo scafo sul meccanismo proprio mentre lo si
   * sta guardando.
   */
  const pianoVerticale = new Plane(new Vector3(1, 0, 0), X_INTERO)
  for (const m of guscio) m.material.clippingPlanes = [pianoSezione, pianoVerticale]

  /**
   * Chi proietta e chi riceve. Lo scafo e la coperta fanno tutti e due: la
   * murata deve lasciare la sua striscia sul teak, ed e' quella striscia a dire
   * che la murata e' alta. Le LINEE no — uno spigolo disegnato non ha volume, e
   * chiedergli un'ombra produce sfarfallio sul filo del ponte.
   */
  for (const m of guscio) {
    if (!m.isMesh) continue      // le linee non hanno volume: vedi sopra
    m.castShadow = true
    m.receiveShadow = true
  }

  /**
   * I DUE PONTI SOPRA LA TUGA arrivano da Blender, e arrivano DOPO — come
   * l'impianto, per la stessa ragione: 58 KB non stanno nel percorso critico
   * della prima schermata. Chi guarda i primi istanti vede la nave a un solo
   * livello, che e' preferibile a una schermata che aspetta.
   *
   * Il piano di sezione e l'ambiente si passano al caricatore invece di essere
   * applicati qui: i materiali del GLB non stanno nell'elenco per nome di
   * `materiali.js`, e senza il piano la sovrastruttura resterebbe intera mentre
   * lo scafo si apre — una nave tagliata a meta' con la tuga intatta sopra.
   */
  /**
   * ─── IL SALONE, DENTRO QUESTA SCENA
   *
   * E' il comportamento predefinito; `?doppia=1` riporta alla vecchia architettura. Il capitolo che oggi vive in
   * DOM diventa geometria di questa nave: stesso renderer, stessa camera,
   * stesso mare, stesso integratore. Non e' un effetto in piu' — e' la
   * risposta al rilievo che le due meta' del sito erano due sistemi diversi.
   *
   * Sta DENTRO la tuga, alla quota che `nave.js` ha calcolato sul cavallino:
   * nessun numero riscritto, nessuna posa scelta a occhio.
   */
  const salone = LA_SCENA_E_UNA ? creaSalone3D(base, tuga) : null
  /**
   * LA TRAVERSATA e' appesa alla CAMERA, non alla scena, ed e' la differenza
   * fra un finale e un'inserzione. Un piano nella scena avrebbe una posizione
   * nel mondo: lo scafo gli passerebbe davanti, il rollio lo inclinerebbe, e
   * ruotando la nave si vedrebbe da dietro. Appeso alla camera e' il
   * fotogramma, e quando prende il comando non c'e' piu' niente davanti.
   */
  /**
   * Il video della calma passa alla traversata perche' il finale possa
   * consegnarle la lastra invece di restare fermo. Vedi `traversata.js`, «il
   * piano della calma». Se il salone non c'e' (`LA_SCENA_E_UNA` spento) la
   * traversata resta com'era: finisce e si ferma.
   */
  const traversata = creaTraversata(base, camera, scena, salone?.videoCalma)

  /**
   * Il mondo della traversata: gli spazi veri, dietro `?mondo=1`. Entra spento
   * e non tocca niente finche' la prova verticale non e' verde -- vedi la
   * testata di `mondo.js`, «entra spento».
   */
  /**
   * ─── IL MONDO E' PROMOSSO, e `?mondo=0` lo spegne
   *
   * DECISIONE DEL COMMITTENTE, 1 settembre 2026: la traversata diventa 3D
   * world-space. Il sito attraversa locale tecnico, sala macchine e corridoio,
   * arriva nel salone, e da li' riprende il FILMATO DEL SALONE, che e' la coda
   * e l'ultima immagine. Si toglie solo `traversata.mp4`; i filmati del salone
   * restano tutti, perche' sono le persone.
   *
   * Promosso dopo che la giunzione e' stata chiusa e non prima: alla fine della
   * traversata la direzione della camera del mondo e quella della camera del
   * sito alla battuta del salone coincidono entro 0,097 gradi, contro una
   * soglia di uno. Era 19,2 prima dell'innesto.
   *
   * IL RIPIEGO ESISTE GIA' e non e' stato scritto per l'occasione:
   * `impostaTraversata` spegne la lastra solo se `mondo.pronto`. Con rete
   * lenta, GLB che non arriva o WebGL che ripiega, `pronto` resta falso e il
   * sito torna da solo al filmato -- senza un ramo in piu' da mantenere.
   *
   * `?mondo=0` resta per misurare il sito com'era: serve ai cancelli, non al
   * visitatore.
   */
  const mondo = vuoleMondo() ? creaMondo(base, scena, { ombre: TESSITURA_OMBRA, ambienteInterno: creaAmbienteInterno(render, PMREMGenerator) }) : null

  /**
   * ─── DUE RAPPRESENTAZIONI DELLA STESSA STANZA NON POSSONO CONVIVERE
   *
   * L'allestimento — divani, tavolo, le due figure — e il fuoribordo — la
   * fascia di mare dentro la tuga — servivano a dare qualcosa da vedere
   * ATTRAVERSO il finestrino quando il salone era altrove, in DOM. Adesso il
   * salone e' li' dentro, ed e' una fotografia: tenerli sarebbe mostrare due
   * volte la stessa stanza, una modellata e una ripresa, nello stesso metro
   * cubo.
   *
   * Si e' visto entrandoci: il raggio ha risposto «#bdb4a3 a un metro» — un
   * divano — e «#ffffff a settantasei centimetri» — la fascia del mare —
   * davanti alla fotografia. Da fuori sembravano a posto; da dentro erano
   * mobili in mezzo al fotogramma.
   */
  if (LA_SCENA_E_UNA) allestimento.visible = false
  // NON si avvia qui: i decodificatori partirebbero al caricamento della scena
  // e continuerebbero fuori schermo. Li accende e li spegne `demo.js` insieme
  // al ciclo di disegno — vedi `ferma()` in `salone3d.js`.
  if (salone) nave.add(salone.gruppo)
  const saloneLargo = salone ? salone.largo : 1
  const saloneAlto = salone ? salone.alto : 1

  const sovra = creaSovrastruttura(base, { ambiente, pianoSezione })
  nave.add(sovra.gruppo)

  /**
   * LE DUE MACCHINE DELL'ATTO DUE, figlie della NAVE e non della scena: devono
   * rollare con lei. Una linea d'assi che resta ferma mentre lo scafo si
   * inclina non e' un dettaglio da poco -- si vede subito, e si legge come
   * l'errore che e'.
   */
  const macchine = creaMacchine(base)
  nave.add(macchine.gruppo)
  /* gli interni obbediscono agli stessi due tagli del guscio: senza, si
     vedrebbero attraverso lo scafo intatto. Le macchine no -- sono il soggetto */
  macchine.caricate.then(() => macchine.taglia([pianoSezione, pianoVerticale]))
    .catch(e => console.error('[macchine]', e.message))
  sovra.caricato
    // il valore si RESTITUISCE: il passo dopo lo destruttura, e con un
    // `then` che torna undefined la sovrastruttura moriva su
    // «Cannot destructure property 'parti' of 'undefined'»
    .then((v) => { immergi(nave); return v })
    .then(({ parti }) => {
      for (const m of parti) { m.castShadow = true; m.receiveShadow = true }
      /**
       * La COPERTA in teak e' pavimento visto da fuori e lastra sospesa vista
       * da dentro: da seduti in salotto attraversava l'inquadratura a
       * mezz'aria. Si spegne con le pareti — sono la stessa cosa, la faccia
       * esterna di un posto in cui si sta.
       */
      const coperta = sovra.gruppo.getObjectByName('COPERTA')
      if (coperta && LA_SCENA_E_UNA) tuga.pareti.push(coperta)
    })
    .catch(e => console.error('[nautica] sovrastruttura non caricata', e))
  /**
   * IL FUORIBORDO sta in coordinate MONDO — non e' figlio della nave — ma
   * fisicamente dentro la tuga, cosi' si vede solo attraverso il finestrino.
   * E' quello che fa arrivare il rollio gratis: la stanza ruota, l'orizzonte
   * no, e la finestra gli passa davanti.
   */
  const fuoribordo = costruisciFuoribordo()
  fuoribordo.gruppo.position.set(0, 1.28, 0.6)   // dentro la sovrastruttura
  if (LA_SCENA_E_UNA) fuoribordo.gruppo.visible = false
  scena.add(fuoribordo.gruppo)

  const acqua = costruisciAcqua()
  /**
   * Interruttore di prova: `?senzaAcqua=1` toglie il mare.
   * Resta in produzione apposta — e' costato un ciclo di compilazione e ha
   * isolato in un colpo un difetto che stavo per attribuire all'acqua.
   * Uno strumento che si puo' rifare quando serve vale piu' di una deduzione.
   */
  if (!location.search.includes('senzaAcqua')) scena.add(acqua.gruppo)

  /**
   * LA NAVE SI SPECCHIA NEL MARE. La sagoma si misura sull'ingombro vero, non
   * si scrive: se lo scafo cambia, il riflesso lo segue. `?senzaRiflesso=1` lo
   * spegne, per misurare il costo e per il banco.
   */
  if (!new URLSearchParams(location.search).has('senzaRiflesso')) {
    nave.updateMatrixWorld(true)
    /* I varchi nel pelo: uno per impianto, misurati sul loro ingombro appena
       il modello e' caricato. */
    // `?senzaVarco=1` non li imposta: serve a rompere apposta
    // `collaudo-varco.mjs`, perche' un cancello che non puo' fallire non e' un
    // cancello.
    if (!new URLSearchParams(location.search).has('senzaVarco')) {
      Promise.all(impianti.map(i => i.caricato.catch(() => null))).then(() => {
        immergi(nave)
        nave.updateMatrixWorld(true)
        acqua.seguiVarchi(impianti.map(i => i.gruppo))
      })
    }
    // I due parametri della sagoma si possono spostare da URL: servono al banco
    // che li sceglie misurando, e costano una riga.
    const q = new URLSearchParams(location.search)
    acqua.seguiNave(nave, {
      // Scelti misurando, non a occhio. Lo scarto fra acqua sotto lo scafo e
      // acqua libera, al crescere dei due:
      //     0    / 0,62   ->   0,0%
      //     0,85 / 0,62   ->  -1,8%
      //     1    / 0,85   ->  -4,5%
      //     1    / 1,00   ->  -5,3%
      // Si ferma a 0,85 perche' li' la curva si appiattisce e oltre la sagoma
      // esce dallo scafo: il riflesso comincerebbe a sporgere dalla nave.
      forza: q.has('rifForza') ? Number(q.get('rifForza')) : 1.0,
      stretta: q.has('rifStretta') ? Number(q.get('rifStretta')) : 0.85
    })
  }

  const orologio = new Clock()
  let t = 0
  let frame = 0
  // Di fronte l'estrusione si legge come una lastra piatta: si parte gia'
  // ruotati, cosi' il volume e' leggibile prima di qualunque interazione.
  let azimut = 0.34
  let azimutTarget = 0.34
  /**
   * ─── DUE NOMI DOVE PRIMA CE N'ERA UNO, e la separazione E' il lavoro
   *
   * `spaccato` faceva due mestieri: comandava la CAMERA (raggio, mira, quota) e
   * comandava il TAGLIO, tutti e due sullo stesso orologio, `p`. Finche' era
   * cosi', i due potevano scollarsi -- e si scollavano. Misurato in
   * `_baseline-pose`: spostando la finestra dell'avvicinamento la camera
   * arrivava vicino a una macchina ancora coperta dallo scafo, e l'occlusione
   * al primo campione passava dal 36,4% al **70,8%**. La conclusione, scritta
   * allora: «finche' il piano di sezione avanza su un orario globale invece
   * che in rapporto alla camera, spostare le finestre non risolve, sposta».
   *
   * Adesso sono due grandezze diverse con due nomi diversi:
   *
   *   `corsaSezione`  quello che la REGIA comanda. Muove la camera.
   *   `spaccato`      quanto lo scafo E' aperto. Si RICAVA da dove la camera
   *                   e' arrivata, in unita' di scena -- non dall'orologio.
   *
   * Il verso della dipendenza e' il punto: la regia muove la camera, e il
   * taglio insegue la camera. Non possono piu' scollarsi, perche' non hanno
   * piu' due padroni.
   */
  let corsaSezione = 0
  let spaccato = 0
  let emersione = 0
  let avvicinamento = 0
  /* Le due leve della consegna, per lo spazzolamento: valgono solo con
     `?ispeziona`, che e' gia' la porta di tutto il resto. */
  const q = new URLSearchParams(location.search)
  const quotaMeccanismo = Number(q.get('quota') ?? QUOTA_MECCANISMO)
  const raggioMeccanismo = Number(q.get('raggio') ?? RAGGIO_MECCANISMO)
  /** Riusato a ogni fotogramma: allocare un vettore per giro e' spazzatura. */
  const dovEilSalone = new Vector3()
  /**
   * QUANTO SI E' USCITI DAL SALONE. 0 = seduti dentro, 1 = l'inquadratura di
   * sempre, la nave intera da 19,5 unita'. Con `?doppia=1` resta fissa a 1.
   */
  let uscita = LA_SCENA_E_UNA ? 0 : 1

  /**
   * L'EMERSIONE — il principio che regge tutta la sequenza (D39).
   *
   * **Non e' la camera a scendere: e' la nave a emergere.** La differenza non
   * e' di gusto. La camera a quota zero e' cio' che tiene la linea di
   * galleggiamento a meta' schermo esatta, e quindi la giunzione fra fondo CSS
   * e canvas a **zero pixel** — l'unica idea meccanica del sito. Muovendo la
   * camera quella giunzione si perde; muovendo la nave, no.
   *
   * A 0 lo scafo e' sotto: si vede solo il mare. A 1 galleggia alla sua quota.
   */
  function impostaEmersione (v) {
    /**
     * CON LA SCENA UNICA LA NAVE NON EMERGE, E NON E' UNA SEMPLIFICAZIONE.
     *
     * L'emersione serviva a far comparire la nave dal nulla all'inizio del
     * capitolo: senza, lo schermo era vuoto. Con il salone dentro la scena il
     * capitolo comincia **seduti dentro quella nave**, e una nave dentro cui si
     * e' seduti non puo' essere sommersa. Lasciandola salire, la camera partiva
     * sotto la linea d'acqua — misurato: il filo del taglio, che sta a quota
     * zero esatta, tagliava l'inquadratura del salone a venticinque centimetri
     * dall'obiettivo.
     *
     * Chi scende adesso e' la camera, non la nave. Ed e' l'inversione giusta:
     * era gia' scritta in D39 al contrario per una ragione che qui decade —
     * «non e' la camera a scendere» valeva finche' la camera doveva restare a
     * quota zero, e non deve: l'invariante e' il beccheggio, non la quota.
     */
    emersione = LA_SCENA_E_UNA ? 1 : MathUtils.clamp(v, 0, 1)
    nave.position.y = MathUtils.lerp(-4.2, 0, emersione)
  }

  /**
   * MOMENTO 3 — il taglio entra nel prodotto.
   *
   * `p` va da 0 (scafo intero) a 1 (sezione aperta sul meccanismo). Guidato
   * dallo scorrimento, quindi dall'utente: non parte da solo, e con movimento
   * ridotto resta comunque disponibile perche' e' una risposta a un gesto, non
   * un'animazione autonoma.
   *
   * La camera **resta a quota zero** anche mentre si avvicina: e' il vincolo
   * che tiene la linea di galleggiamento sempre a meta' schermo, e quindi la
   * giunzione col fondo CSS. Cambia solo dove guarda, in orizzontale. Il
   * meccanismo sta a y = -0,34, cioe' compare appena SOTTO la linea — che e'
   * esattamente la tesi: la parte che vale sta sotto.
   */
  /** §L'ultima battuta porta la camera sul pezzo. Vedi `regia.js`. */
  /** Da dentro il salone alla nave intera, in un movimento solo. */
  function impostaUscita (v) {
    if (!LA_SCENA_E_UNA) return
    uscita = MathUtils.clamp(v, 0, 1)
  }

  function impostaAvvicinamento (v) {
    avvicinamento = MathUtils.clamp(v, 0, 1)
  }

  /**
   * LA SEZIONE VERTICALE: 0 lo scafo e' intero, 1 la meta' di dritta e' via.
   *
   * Si muove con `dolce` in `regia.js`, non qui: questa funzione e' una
   * manopola e non una regia. Se un giorno qualcuno la volesse comandare col
   * dito invece che con lo scorrimento, non c'e' niente da riscrivere.
   */
  /**
   * ─── LA LAMA DIVENTA UNO STRUMENTO — `docs/13` §2 e §7 punto 1
   *
   * Finche' il taglio e' una conseguenza dello scorrimento, il sito si guarda.
   * Da qui in poi la posizione la decide la mano, e il padrone cambia **una
   * volta sola, in un punto dichiarato**: e' la decadenza legittima del
   * contratto D29, scritta come decisione invece che subita come deriva.
   *
   * `esplorando` e' quel punto. Finche' e' acceso, `impostaSpaccato` --
   * l'unica strada per cui lo scorrimento comanda il taglio -- smette di
   * scrivere. Non si disattiva la regia: si toglie a UNA manopola il suo
   * padrone, e tutto il resto (rollio, mare, letture, filmato) continua a
   * girare come prima.
   *
   * ─── LA CONVERSIONE, E PERCHE' NON E' UNA TARATURA
   *
   * `atto-due.js` tiene `x` da 0 (prua) a 1 (poppa) e dichiara di non essere
   * una coordinata di scena. Qui diventa una, e la formula non ha numeri
   * scelti: `PRUA_Z` e `POPPA_Z` sono letti da `ordinate.js` PER NOME, come
   * vuole il §6 di quel documento -- i nomi sopravvivono alle riscritture, i
   * numeri di riga e le costanti ricopiate no.
   *
   * La quota fa lo stesso fra il ponte del salone (1,453, la posa da cui il
   * sito si apre) e la chiglia (-0,94, MISURATA sulla scena viva con
   * `dove-stanno.mjs`, non dedotta).
   */
  let esplorando = false
  const PONTE_Y = 1.453
  const CHIGLIA_Y = -0.94
  let bersaglioZ = null
  let bersaglioY = null

  function vaiACella (x, y) {
    esplorando = true
    bersaglioZ = PRUA_Z + x * (POPPA_Z - PRUA_Z)
    bersaglioY = PONTE_Y + y * (CHIGLIA_Y - PONTE_Y)
  }

  function esciDallEsplorazione () {
    esplorando = false
    bersaglioZ = null
    bersaglioY = null
  }

  let verticaleAperto = 0
  function impostaVerticale (p) {
    const q = MathUtils.clamp(p, 0, 1)
    verticaleAperto = q
    pianoVerticale.constant = MathUtils.lerp(X_INTERO, X_MEZZO, q)
  }

  /**
   * La regia scrive QUI, e questa funzione non tocca piu' il piano: scrive solo
   * la corsa del racconto. Il piano lo muove `seguiLaCamera`, a ogni
   * fotogramma, dopo che si sa dove la camera e' arrivata.
   */
  function impostaSpaccato (p) {
    /* mentre si esplora il taglio ha un altro padrone: vedi `vaiACella` */
    if (esplorando) return
    corsaSezione = MathUtils.clamp(p, 0, 1)
  }

  /**
   * ─── IL TAGLIO SEGUE LA CAMERA, e il numero che lo comanda e' un RAGGIO
   *
   * Il raggio d'orbita e' la grandezza che la coreografia muove davvero, ed e'
   * in unita' di scena: da `RAGGIO` (19,5 = 48,8 m, la nave intera) a
   * `RAGGIO_SEZIONE` (7,2 = 18 m, dove il taglio si legge per tutta la
   * lunghezza), e poi giu' fino a `raggioMeccanismo` col secondo
   * avvicinamento. Lo spaccato e' quanto di quel cammino e' stato fatto.
   *
   * ─── PERCHE' IL RAGGIO E NON LA DISTANZA DAL MECCANISMO
   *
   * Misurato con `_taglio-camera.mjs`, e la distanza NON va bene: all'inizio
   * la camera e' seduta nel salone, dentro la tuga, a 3,66 unita' dal
   * meccanismo -- piu' vicina che a meta' racconto, dove sta in orbita a
   * 20,37. Una legge sulla distanza aprirebbe lo scafo al primo fotogramma.
   * Il raggio d'orbita non ha quel difetto: la fase del salone non e'
   * un'orbita, e finche' `uscita` non l'ha portata fuori il raggio non
   * comanda niente perche' `corsaSezione` e' zero.
   *
   * ─── E COSA CAMBIA DAVVERO
   *
   * A regia ferma questa legge riproduce l'altra: durante il primo
   * avvicinamento `raggio = lerp(RAGGIO, RAGGIO_SEZIONE, corsaSezione)`, e
   * invertirla ridà `corsaSezione`. IDENTICA, non simile.
   *
   * Cambia dove serve: quando il SECONDO avvicinamento tira la camera dentro,
   * il raggio scende sotto `RAGGIO_SEZIONE` e lo spaccato satura a 1. Cioe'
   * **la camera non puo' piu' arrivare addosso a una macchina ancora coperta**:
   * e' la patologia della configurazione B, resa impossibile dalla forma della
   * legge invece che evitata da una finestra tarata a mano.
   */
  function seguiLaCamera (raggioCamera) {
    if (esplorando) return
    spaccato = MathUtils.clamp(
      (RAGGIO - raggioCamera) / (RAGGIO - RAGGIO_SEZIONE), 0, 1)
    pianoSezione.constant = MathUtils.lerp(Z_FUORI, Z_DENTRO, spaccato)
    spostaTappo(pianoSezione.constant)
    tappo.visible = spaccato > 0.002
    tappo.material.opacity = Math.min(1, spaccato * 5)
  }

  /**
   * DIFETTO CORRETTO — misurato, non dedotto.
   *
   * `setSize(w, h)` scrive anche lo stile in linea del canvas, e lo stile in
   * linea batte il foglio di stile: bastava che la misura arrivasse un
   * fotogramma prima che `100svh` si assestasse e il canvas restava alto 730
   * dentro un contenitore da 678. Il centro del canvas finiva 26px sotto il
   * centro della sezione, e siccome la linea di galleggiamento cade sempre
   * al centro del canvas, **il taglio 3D non combaciava piu' con lo stacco
   * del fondo CSS**. Si vedeva come una cucitura, ed e' esattamente il difetto
   * che rovina l'unica idea del sito.
   *
   * Il terzo argomento `false` dice a three di non toccare lo stile: la
   * dimensione visibile resta del CSS, quella del buffer resta di three.
   * E si osserva il CONTENITORE, non la finestra: la sezione puo' cambiare
   * altezza senza che la finestra si ridimensioni (barra dell'indirizzo dei
   * telefoni, comparsa di una barra di scorrimento).
   */
  function ridimensiona () {
    const w = contenitore.clientWidth
    const h = contenitore.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    render.setSize(w, h, false)
  }

  new ResizeObserver(ridimensiona).observe(contenitore)

  function ruota (delta) {
    azimutTarget = MathUtils.clamp(azimutTarget + delta, -AZIMUT_MAX, AZIMUT_MAX)
  }

  /**
   * ─── IL PASSO PUO' ESSERE DICHIARATO, e non e' una comodita' per i cancelli
   *
   * `opz.dt` sostituisce l'orologio; `opz.senzaDisegno` salta `render.render`.
   * Insieme fanno una cosa sola: far avanzare il MECCANISMO a passo dichiarato
   * invece che a fotogrammi.
   *
   * Serve perche' `dt` e' bloccato a `Math.min(getDelta(), 0.05)` -- giusto per
   * la stabilita' dell'integratore, fatale per una misura. Su un rasterizzatore
   * software a mezzo fotogramma al secondo il tempo SIMULATO avanza quaranta
   * volte piu' lento di quello reale: in venti secondi di orologio il
   * meccanismo ne vive mezzo, e un cancello che ne misura l'escursione legge
   * aliasing. Misurato in CI: 12 fotogrammi in 20,5 s, e il verdetto usciva
   * ROVESCIATO -- mare 5 dava meno escursione di mare 2, che e' fisicamente
   * impossibile. Sulla macchina vera, 480 fotogrammi e 3,63 volte nel verso
   * giusto.
   *
   * La regola di questo repo era «nessun cancello misura la velocita' della
   * macchina», e finora si applicava togliendo i cancelli dalla CI. Questa e'
   * l'altra strada, ed e' quella buona: togliere alla misura la dipendenza dal
   * fotogramma. `stato.js` la rende possibile da sola -- `avanza(dt, marca)`
   * con `marca` indefinita fa sempre un passo, senza la guardia del doppio
   * conteggio che serve solo quando due capitoli disegnano insieme.
   */
  /**
   * Chi vuole ricevere le ancore proiettate a ogni fotogramma. Uno solo: i
   * richiami tecnici. `fn.nomi` dichiara a quali nodi del GLB agganciarsi.
   */
  let osservaRichiami = null

  /** Riusati a ogni fotogramma: allocare due Vector3 per richiamo per frame
      e' spazzatura che il raccoglitore paga nel climax. */
  const _mondo = new Vector3()
  const _box = new Box3()

  /**
   * ─── SI PUNTA AL CENTRO DEL PEZZO, NON ALL'ORIGINE DEL NODO
   *
   * DIFETTO PRESO CON UNA MISURA, dopo averlo visto e non capito. I quattro
   * richiami disegnavano i loro puntini uno sopra l'altro: sembrava che ne
   * esistesse uno solo. Il numero l'ha spiegato -- l'apertura massima fra due
   * ancore era lo **0,3% della larghezza dello schermo**, cioe' quattro punti
   * dentro quattro pixel.
   *
   * La causa e' che `STATIC_MOTOR`, `RIG_CYCLO_A`, `RIG_OUTPUT` e `RIG_FIN` non
   * sono quattro oggetti sparsi: sono un RIG ANNIDATO, e i nodi di un rig
   * condividono quasi lo stesso perno. L'origine del nodo dice dove il pezzo
   * RUOTA, non dove il pezzo STA. Per un rilievo tecnico serve la seconda.
   *
   * Il centro dell'ingombro ce l'ha: `Box3.setFromObject` unisce i riquadri
   * delle geometrie figlie, gia' calcolati, quindi non costa un giro sui
   * vertici. E segue il pezzo quando la pinna si inclina, che e' il punto.
   */
  /**
   * ─── E SI CALCOLA UNA VOLTA SOLA, non a ogni fotogramma
   *
   * DIFETTO PRESO DALLA CI, che si e' piantata dove non si piantava mai: il
   * cancello della manopola passa in locale in due minuti e in
   * integrazione e' rimasto fermo dieci sullo stesso passo. Non era rotto:
   * era diventato troppo lento.
   *
   * `Box3.setFromObject` ATTRAVERSA TUTTO IL SOTTOALBERO. Chiamarlo per due
   * impianti piu' quattro nodi vuol dire sei traversate per fotogramma, su un
   * rig che ha decine di maglie. In locale con una scheda vera non si vede; su
   * un rasterizzatore software raddoppia il tempo di fotogramma, e la CI gira
   * su quello. Ma il costo lo pagava anche ogni visitatore, quindi non e' un
   * problema di collaudo: e' un difetto del sito che il collaudo ha rivelato.
   *
   * L'ingombro di un pezzo NEL PROPRIO SISTEMA non cambia mai -- la pinna
   * ruota, ma ruota il suo sistema, non la sua forma. Quindi si misura una
   * volta, si converte in coordinate locali del nodo, e da li' in poi ogni
   * fotogramma costa una moltiplicazione di matrice invece di una traversata.
   */
  const _centriLocali = new Map()

  function centroDi (nodo) {
    let locale = _centriLocali.get(nodo)
    if (locale === undefined) {
      _box.setFromObject(nodo)
      if (_box.isEmpty()) {
        /* niente geometria sotto: si ripiega sull'origine del nodo, e si
           registra `null` per non riprovare la traversata a ogni fotogramma */
        _centriLocali.set(nodo, null)
        locale = null
      } else {
        locale = nodo.worldToLocal(_box.getCenter(new Vector3()))
        _centriLocali.set(nodo, locale)
      }
    }
    if (locale === null) { nodo.getWorldPosition(_mondo); return _mondo }
    return _mondo.copy(locale).applyMatrix4(nodo.matrixWorld)
  }

  /**
   * Proietta i nodi richiesti in pixel di tela.
   *
   * ─── I DUE IMPIANTI, E PERCHE' NON SE NE SCEGLIE UNO A CASO
   *
   * Ce ne sono due, uno per lato. Se i richiami si agganciassero sempre al
   * primo, girando la nave finirebbero sul pezzo dietro lo scafo: linee che
   * indicano un punto dove non c'e' niente. Si sceglie quello il cui nodo di
   * riferimento cade piu' vicino al centro del quadro — cioe' quello che chi
   * guarda sta effettivamente guardando.
   */
  function proiettaAncore (nomi, larg, alt) {
    let scelto = null
    let migliore = Infinity
    for (const i of impianti) {
      const n = i.nodi?.RIG_FIN
      if (!n) continue
      centroDi(n)
      const dietro = _mondo.clone().applyMatrix4(camera.matrixWorldInverse).z >= 0
      if (dietro) continue
      const v = _mondo.clone().project(camera)
      const d = Math.hypot(v.x, v.y)
      if (d < migliore) { migliore = d; scelto = i }
    }
    if (!scelto) return nomi.map(() => null)

    return nomi.map((nome) => {
      const n = scelto.nodi?.[nome]
      if (!n) return null
      centroDi(n)
      /* `project` di un punto DIETRO la camera torna comunque una coordinata
         sullo schermo, ed e' sbagliata senza dare nessun errore: si guarda la
         z nello spazio camera prima di crederci. */
      const davanti = _mondo.clone().applyMatrix4(camera.matrixWorldInverse).z < 0
      const v = _mondo.project(camera)
      return { x: (v.x * 0.5 + 0.5) * larg, y: (-v.y * 0.5 + 0.5) * alt, davanti }
    })
  }

  function disegna (sim, marca, opz) {
    ultimoStato = sim.S
    ultimaSim = sim
    const dichiarato = opz && typeof opz.dt === 'number'
    const dt = dichiarato ? opz.dt : Math.min(orologio.getDelta(), 0.05)
    frame++
    /**
     * L orologio della scena avanza SEMPRE, anche con movimento ridotto: da
     * lui dipendono le onde e, indirettamente, il ciclo di disegno che fa
     * girare il video del salone. Spegnerlo non faceva un sito piu' calmo,
     * faceva una fotografia. Vedi `simulazione.js`: si riduce, non si spegne.
     */
    /* inchiodato, il tempo delle onde e' lo stesso della simulazione: vedi
       `FERMO_A` in `stato.js`, che spiega perche' non basta fermarne uno */
    if (FERMO_A !== null) t = FERMO_A
    else t += dt

    /**
     * La consegna del finale al loop della calma avanza qui, non nella regia:
     * la regia gira sullo scorrimento e chi arriva in fondo si ferma. Vedi
     * `traversata.js`, `avanza`.
     */
    traversata.avanza()

    // Il passo della simulazione non lo fa piu' questa scena: lo fa `stato.js`,
    // che e' l'unico a sapere se qualcun altro l'ha gia' fatto in questo
    // fotogramma. Il `t` locale resta per le onde, che sono roba di scena.
    avanza(dt, dichiarato ? undefined : marca)

    /**
     * ─── DOVE STA LA CAMERA, PRIMA DI TUTTO IL RESTO
     *
     * Due avvicinamenti in fila, e non uno solo piu' lungo: il primo serve a
     * mostrare che il taglio corre lungo TUTTO lo scafo, e per quello ci vuole
     * distanza; il secondo porta sul pezzo. Interpolare in una volta sola da
     * 19,5 a 2,6 farebbe passare la fase del taglio troppo vicino per leggerla.
     *
     * Si calcola QUI, in cima al fotogramma, e non piu' giu' nel blocco della
     * camera, perche' adesso ha due lettori: la camera lo usa per posarsi, e il
     * taglio lo usa per sapere quanto aprirsi. Calcolarlo due volte vorrebbe
     * dire tenerne due copie che prima o poi divergono -- e' lo stesso difetto
     * che il classificatore duplicato di `_baseline-pose` aveva gia' pagato.
     */
    const raggio = MathUtils.lerp(
      MathUtils.lerp(RAGGIO, RAGGIO_SEZIONE, corsaSezione),
      raggioMeccanismo, avvicinamento)
    seguiLaCamera(raggio)

    /**
     * ─── IL ROLLIO NON SI SPEGNE PIU' DEL TUTTO NELLA SEZIONE
     *
     * Qui c'era `* (1 - spaccato)`, con una ragione buona: «non si seziona un
     * oggetto in movimento, un disegno tecnico e' fermo». Ma portava a zero, e
     * a zero il sito perde la cosa che deve dimostrare: alla battuta del
     * meccanismo **spegnere lo stabilizzatore non produceva nessuna
     * conseguenza visibile**. Segnalato dall'utente guardando quella battuta,
     * e vero: misurato, la nave li' si muoveva di 0,00 gradi con l'impianto
     * acceso e 0,00 con l'impianto spento.
     *
     * Che il rollio funzioni e' fuori discussione, e l'ho verificato prima di
     * toccare qualcosa: alla battuta della nave, spegnendo l'interruttore, il
     * rollio passa da 0,83 a 43,8 gradi di escursione. Non era rotto: era
     * spento apposta proprio dove serviva.
     *
     * Adesso resta il 40%: abbastanza perche' l'interruttore abbia una
     * conseguenza sotto gli occhi, poco abbastanza perche' il pezzo non esca
     * dall'inquadratura. E' una decisione di messa in scena, uniforme: NON
     * dipende da `stab`. Legarla allo stato sarebbe una conseguenza cablata a
     * mano, che in questo sito e' la bugia peggiore possibile.
     */
    nave.rotation.z = MathUtils.degToRad(sim.S.rollio) * (1 - 0.6 * spaccato)

    /**
     * L'ALBERO GIRA PERCHE' GIRA IL MOTORE, non perche' scorre il tempo.
     * `S.giriPropulsione` e' l'uscita dell'inerzia della linea d'assi: quando
     * si toglie propulsione, l'elica rallenta prima che la nave perda
     * abbrivio, ed e' quell'ordine a rendere la catena leggibile.
     */
    macchine.gira(sim.S, dt)

    /**
     * ─── IL RIENTRO NEL SALONE, quando il filmato ha finito
     *
     * `uscita` va da 0 (dentro la tuga) a 1 (fuori, nave intera): e' la stessa
     * manopola con cui il sito si apre. Quando la traversata finisce la si
     * riporta verso 0, e la camera **rientra dalla stessa porta da cui era
     * uscita** -- non e' un taglio e non e' una scena nuova, e' la corsa
     * percorsa al contrario.
     *
     * Si scrive qui e non in `regia.js` perche' non dipende dallo scorrimento:
     * dipende dal filmato, che ha un suo tempo. La regia continua a scrivere
     * `uscita` dallo scorrimento e questa riga la tira verso lo zero con un
     * peso che cresce -- quindi le due non litigano, e se qualcuno risale con
     * la rotella il rientro si disfa da solo invece di incastrarsi.
     */
    /**
     * IL TAGLIO SEGUE LA MANO, con un inseguimento del primo ordine invece che
     * di colpo: uno scatto porta il piano a una stazione nuova, e senza
     * ammorbidire si vedrebbe teletrasportare. 8 al secondo e' una costante di
     * tempo di 125 ms -- sotto la soglia in cui un movimento smette di leggersi
     * come continuo, sopra quella in cui sembra un salto.
     */
    if (esplorando && bersaglioZ !== null) {
      const k = Math.min(1, dt * 8)
      pianoSezione.constant = MathUtils.lerp(pianoSezione.constant, bersaglioZ, k)
    }

    /**
     * ─── IL RIENTRO NON LO FA UN TIMER, LO FA LA MANO. Tre tentativi.
     *
     * Volevo che alla fine del filmato la camera tornasse da sola nel salone,
     * cosi' da chiudere il cerchio su una scena VIVA dove il rollio e' vero.
     * L'ho scritto tre volte e ogni volta il cancello della continuita' l'ha
     * bocciato: azzeramento istantaneo (passo 22,9 volte i vicini), poi
     * interpolato su 1,2 s (si vedeva come riavvolgimento), poi su 0,30 s --
     * e a quel punto ho capito che non era una questione di durata.
     *
     * IL DIFETTO ERA STRUTTURALE. Quel rientro era guidato da un TIMER: partiva
     * quando il filmato finiva, dieci secondi dopo essere cominciato, e nel
     * frattempo lo scorrimento poteva essere ovunque. In un sito il cui
     * contratto e' «lo scorrimento e' il padrone unico» una camera che si muove
     * da sola e' l'anomalia, non il cancello che la trova. E infatti il
     * campionatore -- che aspetta i fotogrammi e mette piu' di un secondo fra
     * due letture -- non poteva distinguerlo da un taglio, quale che fosse la
     * durata.
     *
     * COSI' IL FILMATO RESTA. Finisce sulle persone e ci rimane, invece di
     * dissolversi su un meccanismo che dietro e' ancora li' -- che era anche
     * una contraddizione visiva: l'ultima immagine sarebbe stata il pezzo, non
     * la coppia. Chi vuole tornare nella scena viva risale, e risalendo la
     * dissolvenza si apre da sola perche' `mostra()` segue la corsa. Il cerchio
     * si chiude lo stesso, ma lo chiude la mano di chi guarda.
     */

    // L'angolo e' opposto fra dritta e sinistra: due pinne con la stessa
    // incidenza spingerebbero dalla stessa parte invece di raddrizzare.
    if (salone) {
      salone.aggiorna(sim.S.rollio, dt)
      // si spegne mentre si esce, non prima: dentro e' tutto cio' che c'e'
      // e la fotografia resta accesa a lungo: dopo il varco e' cio' che si
      // vede DENTRO il finestrino, ed e' l'unico posto del sito in cui si
      // guardano delle persone. Si spegne solo quando la nave e' lontana.
      salone.mostra(1 - MathUtils.clamp((uscita - 0.62) / 0.30, 0, 1))
      // la stanza NON rolla: chi e' seduto dentro ha il proprio salotto come
      // riferimento, e a inclinarsi e' l'orizzonte. La contro-rotazione
      // annulla quella della nave, di cui il gruppo e' figlio per seguirne la
      // quota. Vedi `composito.js` §5.1: e' la stessa correzione, in 3D.
      salone.gruppo.rotation.z = -nave.rotation.z
    }

    for (const i of impianti) {
      i.aggiorna({ pinna: sim.S.pinna * i.lato })
      // §4.2 · il coperchio si stacca quando il taglio arriva al carter
      i.apri(MathUtils.clamp((spaccato - 0.55) / 0.35, 0, 1))
    }

    // L'onda si spegne DOVE STA L'OBIETTIVO, quindi la posizione della camera
    // le va passata: e' calcolata poche righe piu' sotto, per questo si anima
    // il mare con quella del fotogramma precedente. Uno sfasamento di un
    // fotogramma su un raggio di 5,5 unita' non si vede — la camera si sposta
    // di millesimi per giro.
    acqua.anima(t, sim.S.mare, frame, camera.position.x, camera.position.z, sim.S.velocita)
    // e nel taglio si schiarisce, altrimenti copre proprio il pezzo che il
    // taglio serve a mostrare: la nota sta in acqua.js
    /**
     * ─── L'ACQUA SI SCHIARISCE PER TUTTI E DUE I TAGLI, non solo per uno
     *
     * DIFETTO PRESO GUARDANDO LA SEZIONE VERTICALE. Il principio del sito e'
     * gia' scritto e viene dal committente -- «sott'acqua togli l'acqua e
     * mostra la qualita' del meccanismo» -- ma era legato al solo taglio
     * trasversale. Aprendo lo scafo per il lungo, sopra la linea si vedevano i
     * ponti in sezione e sotto restava un blocco verde: le due macchine, che
     * stanno sotto il galleggiamento, erano dentro l'acqua opaca.
     *
     * Il taglio piu' aperto dei due comanda. Non e' una somma: sono due modi di
     * aprire lo stesso scafo, e l'acqua deve togliersi da quello che e' aperto
     * di piu' -- se si sommassero, due mezzi tagli darebbero acqua limpida su
     * uno scafo ancora chiuso.
     */
    const aperto = Math.max(spaccato, verticaleAperto)
    acqua.chiarisci(aperto)
    /**
     * ─── E ANCHE L'ASSORBIMENTO E' UNA QUOTA, DENTRO IL TAGLIO
     *
     * `chiarisci` fa questo da mesi sul velo, con una ragione scritta li':
     * «dentro il taglio l'acqua e' una QUOTA, non un ambiente: piu' si entra,
     * meno deve pesare», perche' il meccanismo leggeva come una sagoma e non
     * come un pezzo.
     *
     * Da quando sigma e' derivato dal disco di Secchi -- 0,23 al metro, sette
     * volte piu' del valore di prima -- lo stesso problema e' tornato dalla
     * porta di Beer-Lambert: alla battuta del meccanismo la camera sta a
     * qualche metro e resta il 16% della luce, quindi la pinna e' di nuovo una
     * sagoma. Il difetto e' identico, la cura deve essere la stessa.
     *
     * Si dichiara invece di nasconderlo: fuori dal taglio l'acqua e' un mezzo
     * fisico e assorbe come in mare; dentro il taglio e' una notazione, e il
     * sito sta mostrando un pezzo, non una fotografia subacquea.
     *
     * E DENTRO IL TAGLIO L'ACQUA SPARISCE DEL TUTTO, non quasi.
     *
     * Prima lasciavo un 12% di assorbimento e un 12% di velo, per non buttare
     * via l'ambientazione. Misurato all'A/B sulla battuta del meccanismo,
     * spegnendo un pezzo alla volta: togliendo il PELO quella zona guadagna
     * **34,8 livelli**, contro 6,2 della luce di fondale e 1,4 del velo. Non
     * era un velo di troppo: era la superficie dell'acqua davanti al pezzo.
     *
     * Quindi a taglio aperto non resta niente fra chi guarda e il meccanismo.
     * Il sito in quel momento non sta mostrando il mare: sta mostrando un
     * pezzo, e il mare e' gia' stato raccontato due battute prima.
     */
    uniAcqua.sigma.value = ACQUA_SIGMA * (1 - Math.max(spaccato, verticaleAperto))
    // Il fuoribordo E' la manopola dello stato del mare, non un commento su di
    // essa: non puo' contraddire cio' che l'utente controlla.
    fuoribordo.impostaMare(sim.S.mare)

    azimut += (azimutTarget - azimut) * Math.min(1, dt * 5)
    /* `raggio` si calcola in cima al fotogramma: lo leggono in due, la camera
       e il taglio, e una seconda copia divergerebbe. Vedi li' la ragione. */
    const miraX = MathUtils.lerp(0, MIRA_MECCANISMO, corsaSezione)
    // La camera insegue la sezione anche IN LUNGHEZZA: da mezzanave al
    // meccanismo. La quota resta zero — e' quello che tiene la linea a meta'
    // schermo, e quindi la giunzione col fondo CSS a zero pixel.
    const miraZ = MathUtils.lerp(0, Z_PINNE, corsaSezione)

    /**
     * ─── DA DENTRO IL SALONE ALLA NAVE INTERA, IN UN MOVIMENTO SOLO
     *
     * La camera comincia SEDUTA nel salone e ne esce
     * attraversando il fasciame. Non e' un effetto: e' cio' che rende una sola
     * esperienza due capitoli che prima erano due scene.
     *
     * LA CAMERA NON BECCHEGGIA MAI, e da li' discende tutto il resto. Il sito
     * lo scrive gia' in pagina, e per settimane l'avevamo capito al contrario:
     * l'invariante non e' la QUOTA ZERO, e' il beccheggio zero. Una camera
     * livellata proietta il piano dell'acqua sulla mezzeria del fotogramma **da
     * qualunque altezza**. Quindi puo' scendere davvero — dal ponte alla
     * chiglia — e la giunzione col fondo CSS resta a zero pixel per tutta la
     * discesa. Senza questo, il salone dentro la scena sarebbe stato
     * impossibile: sta a un metro e mezzo sopra l'acqua.
     *
     * Percio' il bersaglio si guarda sempre alla QUOTA DELLA CAMERA, mai alla
     * quota dell'oggetto. Guardare il meccanismo «per bene» vorrebbe dire
     * inclinare in giu', e la linea se ne andrebbe al primo grado.
     */
    /**
     * QUANTO STA LONTANA LA CAMERA DAL SALONE: non un numero, un CONTO.
     *
     * Su uno schermo verticale l'inquadratura 16:10 del salone verrebbe
     * tagliata ai lati, e cio' che si perde sono proprio le due cose che
     * contano — il finestrino a sinistra e le persone a destra. Era gia'
     * successo con la versione in DOM, e li' si era curato debordando del 32%.
     *
     * Qui non serve nessun ripiego: la distanza si RICAVA dall'angolo di campo
     * orizzontale vero, che dipende dal rapporto della finestra. Cosi' la
     * larghezza della fotografia riempie il fotogramma e basta, su qualunque
     * schermo, e il capitolo non ha piu' un caso mobile.
     */
    const mezzoV = MathUtils.degToRad(camera.fov) / 2
    const mezzoH = Math.atan(Math.tan(mezzoV) * camera.aspect)
    /**
     * SI RIEMPIE, NON SI CONTIENE — e la differenza si e' vista sul telefono.
     *
     * Prima calcolavo solo la distanza che fa entrare la LARGHEZZA. Su uno
     * schermo verticale quella distanza e' enorme, e la fotografia diventava
     * una striscia alta un quinto dello schermo con due bande vuote sopra e
     * sotto. Misurato a 390x844.
     *
     * Il verso giusto e' quello di `object-fit: cover`: si prende la distanza
     * MINORE fra quella che riempie la larghezza e quella che riempie
     * l'altezza, cosi' l'immagine deborda nell'altra direzione invece di
     * lasciare vuoto. E' la stessa decisione presa per la versione in DOM,
     * dove costava un debordamento del 32%.
     *
     * E DEBORDANDO SI TAGLIA DA UNA PARTE SOLA. La fotografia ha gli estremi
     * sacrificabili — a sinistra mare aperto, a destra il fondo della stanza —
     * ma un ritaglio simmetrico su schermo stretto tagliava fuori la donna,
     * cioe' meta' della coppia. Lo scarto sposta l'inquadratura verso le
     * persone: e' la stessa misura della versione in DOM, l'11% della
     * larghezza, presa allora guardando i fotogrammi.
     */
    const distL = (saloneLargo / 2) / Math.tan(mezzoH)
    const distH = (saloneAlto / 2) / Math.tan(mezzoV)
    /**
     * E LA REGOLA NON E' NE' «CONTIENI» NE' «RIEMPI», ed e' costato due
     * provini scoprirlo. Riempiendo (`min`) su un telefono a 390x844 resta
     * visibile il 29% della larghezza: si perde la coppia, cioe' il soggetto.
     * Contenendo (`distL`) l'immagine diventa una striscia alta un quinto.
     *
     * La versione in DOM aveva gia' risolto questo, e con un numero misurato:
     * l'apertura deborda del 32% e si taglia il 16% per lato — proprio le parti
     * che non raccontano niente, mare aperto a sinistra e fondo della stanza a
     * destra. Qui la stessa decisione diventa una distanza: mai piu' vicina di
     * quella che fa debordare del 32%.
     */
    const DEBORDO = 1.32
    // l'1% di abbondanza: alla distanza esatta il piano e l'inquadratura
    // coincidono, e basta un arrotondamento perche' resti una fessura sul
    // bordo da cui si vede oltre la fotografia. Misurato: 7 mm sopra e sotto
    const dist = Math.max(Math.min(distL, distH), distL / DEBORDO) * 0.99
    // NEGATIVO, e il segno costa un provino: la camera guarda verso -z, quindi
    // la destra dello schermo e' la -x della scena. Con lo scarto positivo il
    // ritaglio verticale si mangiava proprio la donna — lo stesso difetto che
    // la versione in DOM aveva gia' corretto, ripetuto al contrario.
    /**
     * E si sposta verso le PERSONE, che stanno a +x — la destra dello schermo,
     * perche' guardando lungo -z con l'alto in +y la destra della camera e' +x.
     * Il segno l'ho sbagliato due volte in due provini, e la seconda per la
     * ragione peggiore: avevo dedotto dal risultato di un ritaglio troppo
     * stretto invece che dalla geometria.
     *
     * Si sposta solo quando l'immagine e' davvero tagliata ai lati.
     */
    /**
     * E LO SCARTO NON PUO' SUPERARE IL RITAGLIO DISPONIBILE.
     *
     * L'11% viene dal telefono, dove l'immagine deborda del 32% e c'e' molto
     * da tagliare. Su una scrivania deborda del 2%, e spostarsi dell'11%
     * significa portare l'inquadratura OLTRE il bordo della fotografia: si
     * vedeva una seconda copia della donna in una striscia a destra, ed era
     * il piano del mare che continua dietro.
     *
     * Misurato invece che intuito: inquadratura larga 1,268, fotografia 1,293,
     * quindi il margine per lato e' 12 millimetri e mezzo — non 142.
     */
    const largoInquadratura = 2 * dist * Math.tan(mezzoH)
    const margine = Math.max(0, (saloneLargo - largoInquadratura) / 2)
    const scarto = Math.min(0.11 * saloneLargo, margine)

    const dentroY = nave.position.y + tugaQuota
    const fuoriX = miraX + Math.sin(azimut) * raggio
    const fuoriZ = miraZ + Math.cos(azimut) * raggio

    camera.position.x = MathUtils.lerp(scarto, fuoriX, uscita)
    /**
     * ─── LA CAMERA NON SCENDE PIU' A ZERO, E IL MARE E' COMPARSO
     *
     * SINTOMO: sotto la linea d'acqua si vedeva una campitura piatta. Misurata
     * riga per riga alla battuta della nave: **28/255, senza gradiente**. Un
     * mare di scorcio non e' cosi' -- e' chiaro all'orizzonte, dove riflette il
     * cielo di Fresnel, e scuro sotto.
     *
     * CAUSA: la camera stava DENTRO il piano dell'acqua. Da li' il mare si
     * guarda cosi' radente che ogni onda proietta pochi pixel e tutto si media
     * in un tono solo. Lo shader del pelo -- Fresnel, scintille, schiuma,
     * riflesso della nave, scia -- era sano e disegnava; semplicemente non
     * aveva area su cui farsi vedere.
     *
     * COME L'HO ISOLATO, e la strada e' stata piu' storta di cosi'. Prima ho
     * accusato il velo: tolto, 40,5 -> 40,4. Non era lui. Poi ho dipinto il
     * pelo di rosso e contato i pixel rossi: **0,0% sotto la linea**, e ho
     * concluso -- e scritto qui, e detto fuori -- che il mare non veniva
     * disegnato affatto. Era falso: il `pelo` ha uno shader suo che si calcola
     * il colore e di `m.color` non sa che farsene, quindi la vernice non
     * arrivava. La misura onesta e' spegnere il pelo e contare i pixel che
     * cambiano: **98,9%**. Il mare c'era, su quasi tutta la meta' bassa, e non
     * si vedeva lo stesso.
     *
     * Quindi il difetto non era la copertura, era la STRUTTURA: la fascia sotto
     * l'orizzonte aveva scarto tipo 7,8 su 255. Una campitura.
     *
     * CURA. Non si abbassa piu' la camera al pelo: resta alla quota che ha gia'
     * dentro il salone, 3,6 m. L'uscita diventa un volo livellato, il che e'
     * anche piu' continuo -- il racconto non ha nessun motivo per tuffare la
     * camera in acqua.
     *
     * E LA GIUNZIONE REGGE, perche' l'invariante non e' mai stata la quota: e'
     * il BECCHEGGIO nullo (D56, ed e' scritto anche in pagina). Il sito lo
     * aveva gia' misurato e poi non se n'era servito: a camera livellata la
     * linea d'acqua cade al centro del fotogramma **da qualunque quota** --
     * 0,019 px di scarto su una tela da 900. Qui quella misura smette di essere
     * una curiosita' e diventa il permesso di alzare la camera. Verificato
     * dopo: carta fino a y=449, il filo del taglio a 450, mare da 451.
     *
     * RISULTATO, stessa battuta e stesso shader: la struttura della fascia
     * passa da 7,8 a 51,4. Da campitura a immagine.
     *
     * E il commit precedente era il prerequisito: con la camera in aria il
     * cammino nell'acqua non e' piu' la distanza dal frammento, e senza quella
     * correzione lo scafo sommerso sarebbe stato assorbito troppo ovunque,
     * non solo all'apertura.
     *
     * `strumenti/collaudo-orizzonte.mjs` adesso tiene ferme tutte e due le
     * cose, e fallisce se questa riga torna a interpolare verso zero.
     *
     * ─── MA LA QUOTA SCENDE COL TAGLIO, e la prima versione lo sbagliava
     *
     * Tenendola alta per tutto il racconto ho rotto la battuta del meccanismo:
     * la camera restava sopra il ponte e inquadrava la fiancata, col
     * meccanismo fuori campo. Non e' un caso -- quella battuta non ha mai
     * avuto una quota propria, si appoggiava allo zero, ed e' scritto venti
     * righe piu' su: «la camera resta a quota zero anche mentre si avvicina
     * [...] il meccanismo sta a y = -0,34, cioe' compare appena SOTTO la
     * linea». Alzando la camera quel "appena sotto" diventa "molto sotto".
     *
     * Quindi la quota non segue l'uscita dal salone: segue lo SPACCATO. A nave
     * intera sta in alto, dove serve il mare; man mano che la sezione si apre
     * torna sul pelo, dove serve il meccanismo. Ed e' anche il movimento
     * giusto da raccontare: si esce, si guarda il mare, poi si scende.
     */
    /**
     * ─── HO PROVATO AD ALZARLA SUL MECCANISMO, E NON SI PUO'. Misurato.
     *
     * L'ultimo fotogramma del filmato della discesa mostra la pinna larga
     * uguale alla mia e ALTA IL DOPPIO: 158 px di altezza proiettata contro 52.
     * E' una pinna vista da piu' in alto, e qui la camera sta sul pelo -- 0,34
     * unita' sopra il meccanismo su 2,6 di distanza fanno sette gradi e mezzo,
     * e a sette gradi una pinna e' un'asse.
     *
     * Alzare la camera sembrava la leva giusta, e l'invariante lo permette: non
     * e' la quota zero, e' il beccheggio zero. Spazzolate cinque quote da 0 a
     * 1,2 e due raggi, fotografando e misurando: **non funziona**, e la ragione
     * e' geometrica. Con beccheggio zero il bersaglio sta alla QUOTA DELLA
     * CAMERA, quindi alzandosi non si guarda meglio la pinna: si guarda un
     * altro pezzo di nave. A 0,9 unita' l'inquadratura e' gia' sopra la
     * coperta, e a 1,2 la pinna esce dal fotogramma. L'altezza misurata sale a
     * 99 px, ma di un'altra cosa.
     *
     * Se quel fotogramma deve somigliare al filmato, la leva non e' la quota:
     * e' l'assetto della pinna e la distanza. Resta da fare, e le due manopole
     * per provarlo -- `?quota=` e `?raggio=` -- restano qui accese sotto
     * `ispeziona`, coi valori di serie che riproducono l'inquadratura di oggi.
     */
    /* `corsaSezione` e non `spaccato`: la quota e' COREOGRAFIA, la comanda la
       regia. Lo spaccato adesso e' una conseguenza della camera, e farci
       dipendere la camera chiuderebbe l'anello su se stesso. A regia ferma il
       valore e' lo stesso, ed e' il motivo per cui `collaudo-orizzonte` --
       che fallisce apposta se questa riga torna a interpolare verso zero --
       non si muove di un pixel. */
    camera.position.y = dentroY * (1 - corsaSezione) + quotaMeccanismo * avvicinamento
    camera.position.z = MathUtils.lerp(tugaZ + dist, fuoriZ, uscita)
    camera.lookAt(
      MathUtils.lerp(scarto, miraX, uscita),
      camera.position.y,
      MathUtils.lerp(tugaZ, miraZ, uscita))

    /**
     * ─── E SE IL MONDO E' ACCESO, LA CAMERA LO ATTRAVERSA
     *
     * L'inquadratura qui sopra e' quella che il sito ha sempre avuto: la camera
     * guarda la nave da fuori e scende sul meccanismo. Quando `?mondo=1` e' su
     * e la traversata comanda, la camera smette di guardare e comincia ad
     * ATTRAVERSARE: prende posizione e orientamento dalla curva misurata, che
     * porta dal locale tecnico fino alla posa del salone.
     *
     * Si fa QUI, in coda, e non nella regia, per due ragioni. La prima e' che
     * la regia gira sullo scorrimento e questa e' una posa che deve essere
     * giusta a ogni fotogramma. La seconda e' che sovrascrivere in coda lascia
     * intatto tutto il calcolo di sopra: spegnendo l'interruttore il sito torna
     * esattamente com'era, senza un ramo in piu' da mantenere in ogni funzione.
     *
     * `corsaTraversata` e' la stessa `q` che la regia passa a `impostaTraversata`.
     * Zero significa che comanda la scena; uno che comanda la traversata.
     */
    /**
     * ─── L'ANCORAGGIO LO DA' LA REGIA, non la chiglia
     *
     * `mondo.js` collocava il gruppo appoggiando il suo punto piu' basso sulla
     * chiglia. Ragionevole in astratto, ma non e' la regola del contratto: il
     * mondo e' ancorato al nodo della camera del salone, e nell'asset l'ultima
     * posa e' esattamente [0,0,0]. Collocando per il punto piu' basso, la
     * quota la decideva il pavimento del locale tecnico.
     *
     * L'arrivo va dove il sito guarda il salone, e quei tre numeri sono qui
     * sopra -- `scarto`, `dentroY`, `tugaZ + dist` -- calcolati dalla stessa
     * regia che li usa per la camera. Passarli evita la copia che un giorno
     * diverge: e' lo stesso difetto che il contratto ha pagato tre volte.
     *
     * Una volta sola: `ancorato` lo dichiara il mondo.
     */
    if (mondo && mondo.pronto && !mondo.ancorato) {
      /**
       * E L'ORIENTAMENTO SI COSTRUISCE, non si campiona.
       *
       * Avevo passato `camera.quaternion`, cioe' l'orientamento del fotogramma
       * in cui il mondo diventa pronto -- che dipende da dove si trova lo
       * scorrimento in quell'istante, e quindi e' un valore diverso a ogni
       * caricamento. La POSIZIONE si puo' campionare perche' `scarto`,
       * `dentroY` e `tugaZ + dist` non dipendono dalla corsa; l'orientamento
       * no, perche' `lookAt` interpola verso l'uscita.
       *
       * La posa d'arrivo e' quella della battuta del salotto: dal punto
       * d'ancoraggio si guarda il salone, cioe' `(scarto, dentroY, tugaZ)` --
       * gli stessi argomenti che `camera.lookAt` riceve quando `uscita` vale
       * zero. Costruirla e' deterministico; campionarla e' una lotteria.
       */
      /**
       * ─── E L'ORIENTAMENTO D'ARRIVO E' QUELLO DELLA CAMERA DEL SITO
       *
       * MISURATO prima di correggerlo, camera nello stesso punto:
       *   sito, battuta salotto   guarda ( 0,0000 ·  0,0000 · -1,0000)
       *   mondo, ultima posa      guarda (-0,3248 · -0,0493 · -0,9445)
       *   scarto                  19,2 gradi
       *
       * Diciannove gradi bastano a far vedere il ponte al posto della stanza.
       * Il contratto garantisce la giunzione del PUNTO -- l'ultima posa e'
       * [0,0,0], cioe' l'origine -- ma sull'origine non c'e' scritto dove si
       * guarda, e l'orientamento e' arrivato in dote con la posizione senza che
       * nessuno lo confrontasse con niente.
       *
       * E IL BERSAGLIO NON E' IL NODO DEL GLB. Il filmato del salone non ha una
       * camera propria nel sito: e' una texture su una lastra piazzata davanti
       * alla camera del sito. Chi lo inquadra e' la camera del sito, sempre.
       * Quindi la posa che il mondo deve raggiungere e' quella da cui il
       * filmato verra' mostrato un istante dopo. Il nodo dentro il GLB porta
       * l'orientamento della camera che genero' le immagini in Blender: giusto
       * per la posizione, senza ruolo nel passaggio.
       *
       * `salone3d.js:534-546` fa gia' esattamente questo per il guscio -- «in
       * asse, 1,31 unita' davanti alla lastra, rotazione identita'» -- e il
       * guscio e' stato adattato al sito, non il contrario.
       *
       * Costruita e non campionata: `camera.quaternion` qui e' l'orientamento
       * del fotogramma in cui il mondo diventa pronto, che dipende da dove sta
       * lo scorrimento. La posa del salotto e' `lookAt` dal punto d'ancoraggio
       * verso `(scarto, dentroY, tugaZ)`, gli stessi argomenti che
       * `camera.lookAt` riceve quando `uscita` vale zero.
       */
      _mira.position.set(scarto, dentroY, tugaZ + dist)
      _mira.lookAt(scarto, dentroY, tugaZ)
      mondo.ancoraA(scarto, dentroY, tugaZ + dist, _mira.quaternion.clone(), camera)
    }

    if (mondo && mondo.pronto) {
      /* ─── E SI ACCENDE ANCHE LA GEOMETRIA, che prima non si accendeva
       *
       * Qui c'era solo la posa. `mondo.mostra()` esisteva, con la sua soglia, e
       * NON LO CHIAMAVA NESSUNO: `gruppo.visible` restava il `false` di
       * `mondo.js:89` per sempre. Il mondo si scaricava, prestava la propria
       * curva alla camera, e non disegnava un poligono. Un megabyte e sei
       * decimi di peso morto, e nessun errore da nessuna parte -- il sito
       * funzionava, mostrava la nave di prima da una camera nuova.
       *
       * L'ho trovato cercando dove si accendessero le ombre: `castShadow` non
       * c'e' su nessuna maglia del mondo, e cercando chi lo impostasse ho visto
       * che non c'era nemmeno chi lo rendeva visibile.
       *
       * La soglia sta dentro `mostra`, ed e' la stessa della posa: cosi' i due
       * non possono divergere, che e' il difetto pagato tre volte stanotte. */
      /**
       * ─── UN PADRONE SOLO PER `mostra`, e ci sono voluti due tentativi
       *
       * REGRESSIONE PRESA DALLA CORSA 299: «il finale e' una fotografia, 0.000
       * livelli di movimento». Nella coda `corsaTraversata` vale 1, quindi il
       * mondo restava «dentro» e teneva spento lo strato di fuori -- dove vive
       * la lastra del salone. Il filmato con le due persone non era fermo: NON
       * VENIVA DISEGNATO.
       *
       * Il primo rimedio -- chiamare `mostra(0)` da `impostaCoda` -- non ha
       * funzionato, e il perche' vale piu' del rimedio: QUESTA RIGA lo
       * riaccendeva a ogni fotogramma. Due posti che scrivono la stessa cosa
       * sono due valori che divergono, ed e' il difetto che questo repo insegue
       * da giorni; misurato invece che dedotto, la maschera della camera
       * restava 2 e il gruppo `visible`.
       *
       * Adesso decide una sola espressione: la traversata e' finita quando
       * comincia la coda.
       */
      mondo.mostra(corsaCoda > CODA_CONSEGNATA ? 0 : corsaTraversata)
      /* il fuori si spegne solo mentre si attraversa: appena comincia la coda
         il salone deve poter apparire, e vive sullo strato zero */
      mondo.soloDentro(corsaTraversata > 0.002 && corsaCoda <= 0.002)
      /* e il filmato del salone si scalda mentre si attraversa: quando la coda
         comincia deve gia' presentare, o restano due secondi di quadro vuoto */
      if (corsaTraversata > 0.002) traversata.scaldaCalma()
      if (corsaTraversata > 0.002) {
        const s = MathUtils.clamp(corsaTraversata, 0, 1)
        const posa = mondo.posaA(s)
        if (posa) {
          camera.position.copy(posa.p)
          camera.quaternion.copy(posa.q)
        }
        impostaCampo(campoTraversata(s))
      } else {
        impostaCampo(CAMPO_SITO_GRADI)
      }
    }

    /**
     * Quanta della linea di vista sta in aria. La camera non e' figlia di
     * niente, quindi la sua posizione e' gia' in coordinate di mondo e non
     * serve `getWorldPosition` -- che a ogni fotogramma allocherebbe.
     */
    uniAcqua.quotaCamera.value = camera.position.y

    if (salone) {
      // la crescita del piano del mare dipende dalla distanza VERA della
      // camera, che si conosce solo qui: chiamarla piu' su costava un
      // ReferenceError a ogni fotogramma, e lo schermo restava vuoto
      /**
       * ─── LA DISTANZA VERA, NON QUELLA D'INQUADRATURA
       *
       * Qui passavo `dist`, che e' la distanza calcolata per far riempire il
       * fotogramma alla fotografia: dipende da campo visivo e rapporto dello
       * schermo, e **non cambia mai finche' non si ridimensiona la finestra**.
       * Il commento diceva «distanza vera della camera» e l'implementazione
       * non la seguiva: rilievo di una revisione, verificato leggendo le due
       * righe una accanto all'altra.
       *
       * La conseguenza non era teorica. Il fondale e' PROFONDITA piu' indietro
       * della stanza e viene ingrandito di `(d + PROFONDITA) / d` per riempire
       * lo stesso finestrino: con `d` congelato al valore di partenza, uscendo
       * restava ingrandito com'era da seduti — cioe' un fondale teatrale che
       * segue la camera invece di restare dov'e'.
       *
       * Con la distanza VERA il rapporto tende a uno mentre ci si allontana, e
       * il fondale smette da solo di essere corretto: e' quello che fa un
       * orizzonte lontano. Si limita anche da solo — piu' ci si allontana, meno
       * cresce — quindi non puo' piu' sfondare le murate.
       */
      salone.gruppo.getWorldPosition(dovEilSalone)
      salone.profondita(camera.position.distanceTo(dovEilSalone))
      // le pareti della tuga sono la faccia ESTERNA del salone: mentre si e'
      // dentro non ci sono, e tornano proprio quando la stanza diventa finestra
      // Tornano PRESTO — appena la camera ha varcato il piano del finestrino.
      // A 0,42 si usciva e si continuava a vedere il salotto aperto sul fianco,
      // come una casa senza una parete. A 0,20 la stanza diventa finestra nello
      // stesso istante in cui si e' fuori.
      const fuori = uscita > 0.20
      for (const m of tuga.pareti) m.visible = fuori
    }

    /**
     * Lo stato della scena esce nel DOM: i cancelli e le diagnosi lo leggono
     * senza dover entrare nel modulo. E' la stessa cosa che fa il salone con
     * dataset.rollio, ed e' costata due ore di deduzioni sbagliate prima di
     * esistere: guardando una schermata non si distingue una sezione aperta a
     * meta' da un materiale scuro.
     */
    contenitore.dataset.spaccato = spaccato.toFixed(3)
    contenitore.dataset.emersione = emersione.toFixed(3)

    if (!(opz && opz.senzaDisegno)) render.render(scena, camera)

    /**
     * ─── I RICHIAMI TECNICI SI AGGANCIANO QUI, E DOPO IL RENDER
     *
     * Dopo, non prima: le matrici di mondo le aggiorna `render.render`, e
     * chiedere a un nodo dove si trova PRIMA vuol dire leggere la posa del
     * fotogramma scorso. Di un fotogramma non se ne accorgerebbe nessuno finche'
     * la nave sta ferma; appena la si gira col dito, le linee restano indietro
     * rispetto al pezzo che indicano — che e' l'unico difetto che un rilievo
     * tecnico non puo' permettersi.
     *
     * Ogni fotogramma, e non solo allo scorrimento, per la stessa ragione: la
     * nave si gira col dito e la regia non gira a fotogrammi. E' la lezione gia'
     * pagata dalla consegna del finale, poche righe piu' su.
     */
    if (osservaRichiami) {
      const larg = render.domElement.clientWidth
      const alt = render.domElement.clientHeight
      osservaRichiami(proiettaAncore(osservaRichiami.nomi, larg, alt), larg, alt)
    }
  }

  /**
   * ─── UNA FINESTRA SULLA SCENA, e non e' un vezzo da sviluppatore
   *
   * Con `?ispeziona=1` la scena, la camera e il renderer finiscono su
   * `window.__nautica`. Serve a puntare un raggio contro un pixel e farsi dire
   * QUALE oggetto c'e' li'.
   *
   * L'ho aggiunta dopo aver bruciato mezza sessione a dedurre l'identita' di una
   * macchia scura sul fianco della nave: normali invertite (misurate: no), buco
   * nella geometria (misurato: no), piano di sezione (misurato: no), materiale
   * sbagliato (colorato: no). Quattro ipotesi, quattro misure, e la risposta
   * l'avrebbe data un raggio in due secondi.
   *
   * *Quando si guarda un'immagine e ci si chiede COSA sia una cosa, la domanda
   * non e' visiva: e' di identita', e va fatta alla scena.*
   */
  if (location.search.includes('ispeziona')) {
    const raggio = new Raycaster()

    /**
     * ─── IL RAGGIO SI TARA, ALTRIMENTI COLPISCE TUTTO
     *
     * `Raycaster.params.Line.threshold` vale **1 di default**, e in questa
     * scena un'unita' e' 2,5 metri: ogni raggio "colpiva" qualunque
     * `LineSegments` passasse entro DUE METRI E MEZZO dal suo percorso. In
     * una scena che di linee ne ha a decine -- gli spigoli disegnati, le
     * guide, i profili -- il risultato era che al centro del quadro `chi()`
     * riportava otto linee tutte a distanza 0 e la nave non compariva mai.
     *
     * Non e' che lo strumento fosse impreciso: **dava un numero sbagliato
     * senza dare errore**, che e' la forma di guasto che questo repo si
     * ripete addosso. Ha funzionato una volta sola, nella caccia alla grana
     * della pinna, e solo perche' quel punto non aveva linee vicine.
     *
     * Cinque centimetri e' la tolleranza di una linea disegnata: sotto, il
     * raggio deve praticamente passarci sopra.
     */
    const TOLLERANZA_LINEA_M = 0.05
    raggio.params.Line.threshold = TOLLERANZA_LINEA_M / METRI_PER_UNITA
    raggio.params.Points.threshold = TOLLERANZA_LINEA_M / METRI_PER_UNITA
    window.__nautica = {
      scena, camera, render, nave,
      /**
       * LA TRAVERSATA, e perche' e' qui.
       *
       * `coperturaTraversata` esisteva -- con tanto di commento che diceva
       * «perche' quel cancello possa VERIFICARE la copertura invece di
       * fidarsi» -- ma stava SOLO sull'oggetto che il modulo restituisce alla
       * regia, non su `__nautica`, che e' l'unica cosa che uno strumento
       * esterno vede. Quindi `collaudo-continuita` e `dove-salta` leggevano
       * `undefined`, e da li' 0.
       *
       * Un giro di revisione ne aveva concluso che «il cancello e' piu' lento
       * del fenomeno». Non lo era: **leggeva una proprieta' che non c'era**.
       * Un accessore assente non da' errore, da' `undefined` -- e `?? 0` lo
       * trasforma in un numero che sembra una misura.
       */
      coperturaTraversata: () => traversata.copertura,
      /* la `q` che la regia passa a `impostaTraversata`, cioe' la posizione
         DENTRO la finestra della traversata. Serve a leggerla nello stesso
         fotogramma di `p`: senza, «p satura» e «q non avanza» sono due
         affermazioni che nessuno puo' confrontare. */
      corsaTraversata: () => corsaTraversata,
      traversataFinita: () => traversata.finita,
      consegnaCalma: () => traversata.consegnaCalma,
      mondo: () => mondo?.stato ?? null,
      /* quanto e' libera la vista davanti a una posa della traversata: serve a
         capire dove la camera guarda un muro invece del passaggio */
      vistaTraversata: (s) => mondo?.vistaLibera?.(s) ?? null,
      /* la tabella completa del franco, posa per posa: vedi mondo.js misuraFrancoPose */
      francoTraversata: () => mondo?.francoPose?.() ?? null,
      /* cosa il mondo ha messo dentro se stesso (arredo, plafoniere), in metri: vedi mondo.js inventario */
      inventarioMondo: () => mondo?.inventario?.() ?? null,
      statoSollievo: () => salone?.statoSollievo ?? null,
      provaSollievo: (gradi, dt = 1 / 24) => salone?.aggiorna(gradi, dt),
      /**
       * AVANZA IL MECCANISMO A PASSO DICHIARATO, senza disegnare.
       *
       * Un cancello che misura l'escursione dell'albero non ha bisogno dei
       * pixel: ha bisogno che il tempo SIMULATO passi. Cosi' la misura vale
       * uguale su questa macchina e su un runner senza GPU, ed e' la cura che
       * la regola «nessun cancello misura la velocita' della macchina» chiedeva
       * da undici commit di CI rossa.
       *
       * Torna quanti passi ha fatto, cosi' chi chiama non deve fidarsi.
       */
      passoDichiarato: (dt, n) => {
        if (!ultimaSim) return 0
        for (let i = 0; i < n; i++) disegna(ultimaSim, undefined, { dt, senzaDisegno: true })
        return n
      },
      // le uniformi dell'acqua: senza, la prova del rosso sulla nebbia non si
      // puo' fare, e uno shader che non si puo' spegnere non e' verificato
      uniAcqua,
      // Lo STATO, non solo la geometria. Senza, davanti a un meccanismo fermo
      // si finisce a indovinare perche': ridotto? stabilizzatore spento? mare
      // zero? Sono tre cause diverse e si distinguono solo leggendole.
      // La simulazione arriva a `disegna` come parametro, quindi qui si legge
      // l'ultima vista — scritta ogni fotogramma, non catturata alla nascita.
      get stato () { return ultimoStato },
      /**
       * LA TELA DELL'AMBIENTE, per darla a Blender.
       *
       * `cuoci.py` costruiva un gradiente SUO con la stessa idea -- carta
       * sopra la linea, acqua sotto -- e col commento giusto: «cosi' il
       * confronto misura il RENDER e non due mondi diversi». Ma erano due
       * implementazioni della stessa cosa, e la seconda non aveva il disco
       * del sole. Misurato col confronto alla stessa camera, sui pixel in
       * comune: **scarto medio 56,85 livelli**, con lo scafo praticamente
       * nero nella differenza. Non era il tempo reale che perdeva: erano due
       * illuminazioni.
       *
       * Da qui esce la tela VERA, quella che il sito da' in pasto al
       * PMREMGenerator. `strumenti/esporta-ambiente.mjs` la scrive su file e
       * `cuoci.py` la riceve con AMBIENTE_HDR.
       */
      telaAmbiente,
      /**
       * Quanti fotogrammi sono stati DISEGNATI. Serve a distinguere due cose
       * che si leggono identiche: un meccanismo fermo e una scena che non
       * viene piu' aggiornata. E' gia' costato due volte -- l'ultima con un
       * cancello che dava l'albero d'ingresso a zero mentre il palco era
       * uscito dallo schermo, e la simulazione, che intanto girava, faceva da
       * falso testimone di vitalita'.
       *
       * La regola che ne esce: il testimone di vitalita' deve stare DALLA
       * PARTE della cosa misurata. Se si misura cio' che viene disegnato, a
       * dire che si sta disegnando dev'essere il disegno.
       */
      get fotogrammi () { return frame },
      /**
       * IL PIANO DI SEZIONE, perche' il render offline deve applicare LO
       * STESSO taglio della pagina.
       *
       * Il primo render col fasciame dentro mostrava una paratia bianca che
       * tagliava l'immagine in due. Non era un difetto del render: nella
       * pagina quel pezzo di guscio e' TAGLIATO da questo piano, e Blender non
       * ne sapeva niente. Senza esportarlo, il fotogramma cotto mostra una
       * nave diversa da quella che si vede sul sito -- che e' la sola cosa che
       * il fotorealismo non puo' permettersi.
       */
      /** Le uniformi dell'acqua: servono ai banchi che devono cambiare una
       *  grandezza sola a fotogramma fermo. */
      acqua,
      get sezione () {
        return { nx: pianoSezione.normal.x, ny: pianoSezione.normal.y,
                 nz: pianoSezione.normal.z, costante: pianoSezione.constant }
      },
      /**
       * L'AZIMUT VERO, e non si deduce dalla posizione della camera.
       *
       * Provando a misurare l'auto-dimostrazione della rotazione ho calcolato
       * l'angolo come `atan2(camera.position.x, camera.position.z)`. Sbagliato:
       * la camera orbita attorno a una MIRA che si sposta verso il meccanismo,
       * quindi quell'angolo mescola la rotazione con lo spostamento del centro.
       * Usciva 1,13 gradi dove il comando ne chiedeva 5.
       *
       * E' lo stesso errore di due misure fa: dedurre una grandezza da un
       * effetto che ne contiene anche un'altra. Qui si legge alla sorgente.
       */
      get azimut () { return azimut },
      // I numeri dichiarati dal modello, per il collaudo cinematico.
      get impiantoRapporto () { return impianti[0]?.rapporto ?? null },
      get impiantoEccentricita () { return impianti[0]?.eccentricita ?? null },
      get impiantoDati () { return impianti[0]?.dati ?? null },
      tugaPareti: tuga.pareti,
      ombre: TESSITURA_OMBRA,
      /**
       * Chi c'e' a questo punto dello schermo? Coordinate 0-1.
       *
       * ─── E ANCHE: CHE COSA STA PESCANDO LI'
       *
       * Torna il MATERIALE e le UV del punto colpito, non solo il nome
       * dell'oggetto. E' l'aggiunta che ha chiuso una caccia lunga una notte
       * alla grana della pinna: sapere che l'oggetto si chiama X non basta
       * quando il sospetto e' una mappa, perche' la domanda vera e' *quali
       * texel* pesca quel pixel. Con le UV la si va a guardare nell'atlante e
       * si smette di indovinare.
       */
      chi (u, v, opzioni) {
        /**
         * ─── E NON SI STROZZA A DIECI RIGHE PRIMA DI ARRIVARE ALLA NAVE
         *
         * Il taglio `.slice(0, 10)` si applicava PRIMA di qualunque filtro,
         * quindi bastava uno sciame di linee vicine per esaurire il referto
         * senza che una sola superficie ci arrivasse. Adesso si filtra e poi
         * si taglia, e le linee sono fuori di serie: la domanda «cosa c'e'
         * sotto questo pixel» riguarda le SUPERFICI, e chi vuole le linee le
         * chiede (`{ conLinee: true }`).
         */
        const { quante = 12, conLinee = false, ancheInvisibili = false } = opzioni || {}

        /**
         * ─── E SOPRATTUTTO: SI SCARTA CIO' CHE NON VIENE DISEGNATO
         *
         * DIFETTO PIU' GRAVE DELLA SOGLIA DELLE LINEE, e trovato solo dopo
         * averla corretta. **`Raycaster` non salta gli oggetti invisibili.**
         * Colpisce qualunque geometria stia sul percorso, anche se
         * `visible` e' falso, anche se il materiale ha `opacity: 0`.
         *
         * In questa scena c'e' un caso che lo rende letale: il piano della
         * traversata e' appeso alla CAMERA, copre esattamente tutto il campo,
         * e per quasi tutta la corsa e' `visible = false` con `opacity: 0`.
         * Un raggio dal centro dello schermo lo trova sempre, a distanza
         * ZERO, davanti a ogni altra cosa.
         *
         * Quindi un cancello di occlusione costruito su `chi()` avrebbe detto
         * **«il meccanismo e' coperto al 100%»** in ogni battuta -- e sarebbe
         * stato falso, perche' quel piano non viene disegnato. Un numero
         * sbagliato, senza errore, con l'aria di una misura: la stessa forma
         * di guasto del modulo in `collaudo-ridotto`.
         *
         * «Disegnato» qui vuol dire tre cose insieme: nessun antenato
         * invisibile fino alla scena, materiale visibile, e opacita' non
         * nulla quando e' trasparente. Chi vuole vedere anche il resto lo
         * chiede (`{ ancheInvisibili: true }`) -- ed e' cosi' che si controlla
         * se un pezzo c'e' ma e' spento, che e' una domanda diversa da
         * «cosa vedo».
         */
        const disegnato = (o) => {
          for (let p = o; p && p !== scena; p = p.parent) if (p.visible === false) return false
          const m = o.material
          if (!m) return true
          const mm = Array.isArray(m) ? m : [m]
          return mm.some((x) => x.visible !== false && !(x.transparent && x.opacity === 0))
        }

        raggio.setFromCamera({ x: u * 2 - 1, y: -(v * 2 - 1) }, camera)
        let colpiti = raggio.intersectObjects(scena.children, true)
        if (!conLinee) colpiti = colpiti.filter((i) => !/^(Line|Points)/.test(i.object.type))
        if (!ancheInvisibili) colpiti = colpiti.filter((i) => disegnato(i.object))
        return colpiti.slice(0, quante).map((i) => {
          const m = i.object.material
          return {
            nome: i.object.nome || i.object.name || '(senza nome)',
            tipo: i.object.type,
            /**
             * LA CATENA, perche' in questa scena i nomi quasi non ci sono.
             * `(senza nome)` ripetuto dodici volte non e' un referto. Il
             * percorso fino alla scena dice almeno DI CHI e' figlio il pezzo,
             * e con `radice` si puo' filtrare per sottoalbero -- che e' quello
             * che serve a un cancello di inquadratura.
             */
            catena: (() => {
              const c = []
              for (let p = i.object; p && p !== scena; p = p.parent) c.unshift(p.nome || p.name || p.type)
              return c.join(' > ')
            })(),
            disegnato: disegnato(i.object),
            opacita: (() => {
              const m = i.object.material
              if (!m) return '?'
              const x = Array.isArray(m) ? m[0] : m
              return x.opacity !== undefined ? +x.opacity.toFixed(2) : '?'
            })(),
            materiale: m ? (m.name || '(senza nome)') : '?',
            mappe: m ? ['map', 'aoMap', 'normalMap', 'roughnessMap', 'metalnessMap']
              .filter((k) => m[k]).join('+') || '(nessuna)' : '?',
            ruvidita: m && m.roughness !== undefined ? +m.roughness.toFixed(2) : '?',
            metallo: m && m.metalness !== undefined ? +m.metalness.toFixed(2) : '?',
            uv: i.uv ? [+i.uv.x.toFixed(4), +i.uv.y.toFixed(4)] : null,
            colore: m && m.color ? '#' + m.color.getHexString() : '?',
            lato: m ? m.side : '?',
            distanza: +i.distance.toFixed(2),
            metri: +(i.distance * METRI_PER_UNITA).toFixed(2),
            punto: [i.point.x, i.point.y, i.point.z].map((x) => +x.toFixed(2))
          }
        })
      }
    }
  }

  impostaEmersione(1)

  return {
    render, camera, ridimensiona, ruota, disegna,
    impostaSpaccato, impostaVerticale, impostaEmersione, impostaAvvicinamento, impostaUscita,
    vaiACella, esciDallEsplorazione,
    /**
     * `q` da 0 a 1: 0 comanda il 3D, 1 comanda la traversata. La regia la
     * chiama nell'ultima battuta e nessun altro: non e' uno stato del mondo,
     * e' il passaggio di consegne finale.
     */
    /**
     * `?senzaFilmato=1` tiene il piano della traversata spento.
     *
     * ─── PERCHE' ESISTE, e non e' una comodita' da collaudo
     *
     * `collaudo-varco` cerca il meccanismo in quadro scorrendo la corsa, e da
     * quando la traversata prende il comando lo trova coperto: al 91% dello
     * scorrimento davanti c'e' il filmato, non il pezzo. Il cancello usciva
     * rosso dicendo «il meccanismo non e' in quadro», che e' vero e non e' il
     * difetto che cerca.
     *
     * E' la stessa esigenza che `consegna.mjs` ha gia' risolto con
     * `senzaFilmato()`: per misurare il 3D bisogna poter togliere cio' che gli
     * sta davanti. Qui diventa un interruttore dichiarato invece di una
     * funzione interna, perche' serve a piu' di un cancello.
     *
     * Non e' un ripiego: il filmato resta nel sito, e nessun cancello puo'
     * accenderlo o spegnerlo per far tornare un numero. Puo' solo chiedere di
     * misurare cio' che c'e' SOTTO, dichiarandolo nella URL.
     */
    /**
     * ─── LA CODA, e cosa ci suona quando la traversata la fa il mondo
     *
     * DECISIONE DEL COMMITTENTE, 1 settembre 2026: il sito finisce col filmato
     * del SALONE, che e' dove stanno le due persone. Nella coda la camera e'
     * GIA' DENTRO -- la coda non serve all'arrivo, serve alle persone.
     *
     * Con il filmato acceso questa non fa niente: la consegna alla calma la
     * guida gia' il filmato che finisce, ed e' la ragione per cui la coda
     * esiste (demo.js:309). Con il mondo promosso il filmato non c'e', e senza
     * questa riga la coda resterebbe muta.
     */
    impostaCoda: (c) => {
      /**
       * SEMPRE, non solo col mondo pronto -- ed e' cambiato togliendo
       * `traversata.mp4`.
       *
       * L'ordine del committente diceva che il ripiego esisteva gia': se il GLB
       * non arriva, `mondo.pronto` resta falso e il sito «torna da solo al
       * filmato». Vero finche' il filmato c'era. Il passo 5 dello stesso ordine
       * lo cancella, e con lui il ripiego: senza mondo E senza filmato il
       * finale sarebbe uno schermo vuoto.
       *
       * Quindi la coda accende la calma in ogni caso. Con il mondo pronto e' la
       * consegna voluta; senza, e' l'unico finale rimasto -- e resta il finale
       * giusto, perche' e' il filmato del salone con le due persone, che era
       * gia' l'ultima immagine del sito.
       */
      /**
       * ─── E IL MONDO SI FA DA PARTE, o il finale non si vede
       *
       * REGRESSIONE MIA, presa dalla corsa 299: «il finale e' una fotografia,
       * 0.000 livelli di movimento».
       *
       * Nella coda `corsaTraversata` vale 1, quindi il mondo restava «dentro» e
       * teneva spento lo strato di fuori sulla camera -- che e' giusto mentre si
       * attraversa lo scafo, ed e' esattamente cio' che serviva a togliere il
       * mare dai lati del corridoio. Ma la lastra del salone vive su quello
       * strato: spento lui, il filmato con le due persone non veniva disegnato.
       * Non era fermo: NON C'ERA.
       *
       * La traversata finisce quando comincia la coda. Da li' il mondo si
       * spegne e la camera riapre gli occhi sul resto.
       */
      corsaCoda = c
      traversata.mostraCalma(c)
    },
    impostaTraversata: (q) => {
      corsaTraversata = q
      /* col mondo acceso il filmato non serve: la traversata la fa la camera */
      traversata.mostra(SENZA_FILMATO || (mondo && mondo.pronto) ? 0 : q)
      mondo?.mostra(q)
    },
    /**
     * Aggancia i richiami tecnici. `fn.nomi` sono i nodi del GLB a cui puntano;
     * `fn` riceve a ogni fotogramma le loro posizioni in pixel di tela.
     */
    collegaRichiami: (fn) => { osservaRichiami = fn },
    /** La regia lo chiede per far tornare il cruscotto quando il film e' finito. */
    traversataFinita: () => traversata.finita,
    /** Quanto il finale e' passato al loop vivo: 0 fotogramma fermo, 1 stanza viva. */
    consegnaCalma: () => traversata.consegnaCalma,
    /**
     * Quanto il filmato copre il fotogramma, da 0 a 1. Serve a
     * `collaudo-continuita`: la camera puo' fare UN salto -- il rientro nel
     * salone -- e solo mentre e' completamente coperta. Esporlo e' l'unico modo
     * perche' quel cancello possa VERIFICARE la copertura invece di fidarsi.
     */
    coperturaTraversata: () => traversata.copertura,
    /** Il capitolo si accende e si spegne: i video non decodificano fuori schermo. */
    accendi: () => salone?.riproduci(),
    spegni: () => { salone?.ferma(); traversata.spegni() },
    tela: render.domElement
  }
}
