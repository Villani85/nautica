import { MeshStandardMaterial, DoubleSide, BackSide, FrontSide } from 'three'
import { lavorazione, LAVORAZIONI } from './materia.js'

/**
 * I colori sono scritti in esadecimale e three li interpreta come sRGB
 * (ColorManagement e' attiva per impostazione predefinita da r152).
 * Sono gli stessi valori del foglio di stile: e' quello che tiene insieme
 * la giunzione fra il fondo CSS e il disegno WebGL. Se qui si applicasse un
 * tone mapping, il mare del canvas smetterebbe di combaciare con --acqua-viva
 * e la linea di galleggiamento si vedrebbe come una cucitura.
 */
export const materiali = {
  /**
   * ─── DOPPIA FACCIA, E NON E' UNA RESA: E' L'UNICA CHE DISEGNA LO SCAFO INTERO
   *
   * A faccia singola **la meta' poppiera del guscio non veniva disegnata**: si
   * vedeva la faccia interna, quasi nera, e mezza nave leggeva come una chiatta
   * con la stiva aperta. Il committente l'ha nominato in tre parole, «stiamo
   * parlando di yacht».
   *
   * QUATTRO IPOTESI, QUATTRO MISURE, TUTTE SMENTITE. Non normali invertite
   * (: 0 triangoli girati su 4464). Non un buco nella
   * geometria (lo scafo arriva al trincarino da prua a poppa, verificato riga
   * per riga). Non il piano di sezione (, e il piano sta a 8,4,
   * fuori dallo scafo). Non z-fighting ( non l'ha tolta). Non una
   * scala negativa (determinante della matrice mondo: 1,0000). E il contorno e'
   * antiorario a TUTTE le ordinate, quindi l'avvolgimento e' uniforme.
   *
   * La prova che ha deciso: nascondendo la faccia interna, la poppa **sparisce**
   * — si vede lo sfondo. Quindi le facce esistono e sono scartate. Mettendo la
   * doppia faccia, lo scafo torna intero e grigio.
   *
   * NON SO ANCORA PERCHE'. Lo scrivo invece di inventare una spiegazione: la
   * geometria dice una cosa e la scheda video ne fa un'altra, e finche' non
   * capisco quale delle due mente, la cura e' quella che si vede funzionare.
   *
   *  resta, con il suo  che lo tiene dietro:
   * dentro la sezione la cavita' deve restare scura, perche' dentro una carena
   * e' buio.
   *
   * E LA LEZIONE SUL CANCELLO:  verifica l'algebra delle
   * normali, non cio' che la scheda video scarta. Ha detto zero su un difetto
   * enorme. Un cancello che misura una grandezza vicina a quella che conta non
   * e' un cancello: va sostituito con uno che RENDERIZZA e guarda.
   */
  /**
   * LO SCAFO E' VERNICIATO, NON GREZZO.
   *
   * Qui c'era `metalness: 0.42, roughness: 0.44`: la ricetta di una lamiera
   * d'acciaio non trattata. E' il motivo per cui la nave leggeva come una
   * chiatta grigia anche dopo che la sovrastruttura era diventata uno yacht —
   * un fianco opaco e semimetallico non lo produce nessuna barca finita.
   *
   * Un fianco verniciato ha `metalness: 0` (la vernice non e' un conduttore:
   * un valore intermedio non descrive nessuna materia reale, e' un cursore
   * spinto a meta') e una rugosita' bassa, perche' un fianco di yacht e' quasi
   * uno specchio. La conseguenza e' migliore di quanto mi aspettassi: uno
   * scafo lucido **riflette la linea dell'orizzonte su se stesso**, ed e' la
   * tesi del sito applicata alla carena invece che alla pagina.
   *
   * Il colore non cambia: la tavolozza e' una decisione presa, e questa e' una
   * correzione sulla materia, non sul progetto.
   */
  /**
   * --- SI DISEGNA DA UN LATO SOLO, MA NON PER LA RAGIONE CHE AVEVO SCRITTO
   *
   * Qui c'era `side: DoubleSide` senza una ragione accanto. Lo scafo e' un
   * GUSCIO -- un loft fra le ordinate, spesso zero -- quindi con due lati three
   * ne disegna anche la parete interna e la illumina come se fosse esposta al
   * cielo. L'interno pero' ce l'ha gia' `interno`, una mesh sua in `BackSide`
   * e apposta scura: con due lati la stessa superficie e' disegnata due volte,
   * e vince la piu' chiara. Disegnare l'interno di un guscio illuminato dal
   * cielo e' sbagliato, e questa riga lo toglie.
   *
   * --- MA NON CURA IL 2x, E LA CORREZIONE VALE PIU' DELLA CURA
   *
   * Avevo scritto che questo era la causa dello scafo «2,5 volte piu' luminoso
   * del path tracer». **Non lo e'.** La misura che me lo faceva credere prendeva
   * una maschera del materiale che comprendeva ANCHE i pixel delle facce
   * posteriori: passando a FrontSide quei pixel li prende `interno`, che e'
   * scuro, e la media scendeva. Scendeva perche' cambiava CHI li dipinge, non
   * perche' lo scafo fosse illuminato diversamente.
   *
   * Sui pixel della superficie ESTERNA, misurati sulla stessa maschera prima e
   * dopo la build: **53,07 e 53,09**. Il `side` non li tocca, e il 2x resta.
   *
   * Quello che questa riga fa davvero, misurato: cambia 12.077 pixel nella zona
   * bassa, di cui solo **263** hanno materia anche in Cycles (che per il
   * ritratto della nave salta `interno` apposta). Su quei 263: Cycles 59,0,
   * prima 70,8 (1,20x), dopo 56,7 (0,96x). Un miglioramento piccolo su una base
   * sottile -- si tiene perche' e' fisicamente coerente, non perche' quel
   * numero da solo lo giustifichi.
   *
   * **Da dove venga il 2x sulla superficie esterna resta aperto.** Escluso:
   * la buccia d'arancia (2,62x spegnendola), `interno` (2,51x nascondendolo),
   * i parametri del materiale (identici a quelli che Blender legge dal JSON),
   * e adesso anche il `side`. Il sospetto rimasto e' l'irradianza prefiltrata
   * di three -- PMREM su un equirettangolare di soli 512x256 -- contro il
   * campionamento diretto di Cycles a rugosita' 0,13.
   */
  scafo: new MeshStandardMaterial({
    color: 0x707c82, metalness: 0.0, roughness: 0.13, side: FrontSide
  }),
  coperta: new MeshStandardMaterial({
    color: 0xcfc9bc, metalness: 0.05, roughness: 0.72
  }),
  acciaio: new MeshStandardMaterial({
    color: 0x49555a, metalness: 0.72, roughness: 0.26
  }),
  bronzo: new MeshStandardMaterial({
    color: 0x6e6350, metalness: 0.85, roughness: 0.34
  }),
  /**
   * L'ACCENTO E' RISERVATO ALLA CINEMATICA (D31).
   *
   * Non "un accento saturo sotto la linea", che era la regola piu' debole:
   * l'acquamarina sta SOLO sui pezzi che si muovono — bottone di manovella,
   * teste di biella, tappo del riduttore. Struttura, basamenti, carter e
   * alberi condotti restano acciaio.
   *
   * Cosi' il colore smette di essere decorazione e diventa informazione: si
   * capisce in un colpo d'occhio dove finisce cio' che sostiene e comincia
   * cio' che lavora, senza una didascalia.
   */
  /**
   * L'INTERNO DELLA CARENA.
   *
   * Aprendo la sezione si vede dentro lo scafo. Con un materiale a doppia
   * faccia l'interno prende le stesse luci dell'esterno — che qui sono fredde
   * — e la cavita' legge come un vuoto verde acceso. Dentro una carena e' buio.
   *
   * Si disegna il guscio due volte: la faccia esterna col materiale dello
   * scafo, quella interna con questo. Costa un secondo passaggio su una
   * geometria da 4.000 triangoli, e toglie l'unica cosa che rovinava lo
   * spaccato.
   */
  /**
   * ─── E DEVE PERDERE SEMPRE CONTRO LA FACCIA ESTERNA
   *
   * Il guscio si disegna DUE VOLTE sulla stessa geometria: la faccia esterna
   * con `scafo` in FrontSide, quella interna con questo in BackSide. Due mesh
   * complanari si contendono il buffer di profondita', e chi vince dipende dalla
   * precisione a quella distanza.
   *
   * A schermo si vedeva **la meta' poppiera del fianco nera**, con un confine
   * netto a mezzanave: non era una normale invertita (misurate: zero facce
   * girate), non era un buco nella geometria (misurata: lo scafo arriva al
   * trincarino da prua a poppa), non era il piano di sezione (misurato:
   * spaccato = 0). Era il confine di precisione del buffer: la prua e' piu'
   * lontana e vinceva, la poppa e' piu' vicina e perdeva.
   *
   * Mezzo yacht renderizzato con la faccia interna legge come una chiatta con
   * la stiva aperta — ed e' il difetto che il committente ha nominato in tre
   * parole, «stiamo parlando di yacht». Nessuna texture e nessun ambiente
   * salvano una faccia che non dovrebbe vedersi.
   *
   * IL VERSO DELLO SCOSTAMENTO SI E' ROVESCIATO, e la ragione e' cambiata.
   * Prima lo spingeva INDIETRO, per fargli perdere la contesa con la faccia
   * esterna. Ora lo scafo e' a DOPPIA faccia — e' l'unico modo in cui si
   * disegna intero — quindi dentro la sezione la parete lontana verrebbe
   * disegnata dal materiale dello scafo, grigio chiaro, e la cavita' leggerebbe
   * come una scatola illuminata. Dentro una carena e' buio.
   *
   * Quindi lo scostamento e' NEGATIVO: questa faccia vince, e la cavita' resta
   * scura. Fuori non cambia niente, perche' li' davanti c'e' la faccia esterna
   * vera e propria.
   */
  interno: new MeshStandardMaterial({
    color: 0x1b2224, metalness: 0.05, roughness: 0.95, side: BackSide,
    polygonOffset: true, polygonOffsetFactor: 4, polygonOffsetUnits: 4
  }),

  accento: new MeshStandardMaterial({
    color: 0x4fe0c4, metalness: 0.55, roughness: 0.28
  }),

  vetro: new MeshStandardMaterial({
    color: 0x0b2226, metalness: 0.85, roughness: 0.12
  })
}

/**
 * --- OGNI MATERIALE PORTA IL SUO NOME, E LO PRENDE DALLA CHIAVE
 *
 * Nessuno di questi aveva un `name`. Dal browser non si vede: three.js non ne
 * ha bisogno. Si vede da FUORI -- l'esportatore che porta la scena in Blender
 * riceveva ventiquattro materiali chiamati `anonimo_0 ... anonimo_23`, e senza
 * un nome non si puo' decidere niente su di loro: ne' escluderli, ne' dargli
 * una ricetta, ne' accorgersi che ne manca uno.
 *
 * Si scrive qui e non a mano voce per voce, cosi' un materiale aggiunto domani
 * nasce gia' col nome giusto invece di aspettare che qualcuno se ne ricordi.
 * Costa una riga e vale ogni volta che qualcosa esce da questa pagina.
 */
for (const [chiave, m] of Object.entries(materiali)) m.name = chiave

/**
 * ─── L'AMBIENTE SI DA' AI MATERIALI, NON ALLA SCENA
 *
 * `scene.environment` sembra la strada giusta e qui e' sbagliata, per una
 * ragione misurata e non prevista: raggiunge **anche l'acqua**, e la meta' sotto
 * la linea diventa grigio pallido invece del verde del foglio di stile. Il
 * fondo CSS si ferma netto al 50% e incontra il canvas: se il canvas cambia
 * colore li', la giunzione si vede — ed e' l'unica idea meccanica del sito.
 *
 * `envMapIntensity: 0` sul materiale dell'acqua NON basta. L'ho scritto
 * aspettandomi che bastasse, e misurando e' rimasto pallido lo stesso;
 * sostituendo il materiale dell'acqua con uno non illuminato il verde tornava,
 * con l'ambiente ancora acceso. Quindi la strada non e' spegnere l'ambiente
 * dove non deve arrivare: e' **non accenderlo li'**.
 *
 * Cosi' l'ambiente raggiunge esattamente cio' che deve riflettere — scafo,
 * acciaio, bronzo, accento, vetro — e l'acqua resta quello che e': non una
 * superficie da rendere, ma il fondo della pagina prolungato dentro il canvas.
 */
export function applicaAmbiente (mappa) {
  for (const nome of ['scafo', 'coperta', 'acciaio', 'bronzo', 'accento', 'vetro']) {
    materiali[nome].envMap = mappa
    materiali[nome].needsUpdate = true
  }
}

/**
 * ─── LA MATERIA DELLO SCAFO, che non c'era
 *
 * `LAVORAZIONI` aveva una voce `carena` da mesi e non la applicava nessuno: le
 * lavorazioni erano collegate ai soli materiali del meccanismo, che arrivano
 * dal GLB. Lo scafo -- costruito qui in codice -- non aveva nessun trattamento
 * di superficie, e misurato ingrandendo un ritaglio pulito a contrasto sette
 * volte usciva bianco assoluto: zero variazione.
 *
 * Si chiama da fuori e non qui dentro perche' `nebbiaAcqua` deve arrivare
 * PRIMA: la lavorazione si compone con chi c'era, ma solo se chi c'era c'e'
 * gia'. L'ordine lo tiene `index.js`.
 */
export function materiaDelloScafo () {
  if (location.search.includes('materia=0')) return
  for (const nome of ['scafo', 'coperta']) {
    const r = LAVORAZIONI[nome]
    if (r) lavorazione(materiali[nome], r)
  }
}

/**
 * ─── LE FINESTRE E LA FASCIA DI GALLEGGIAMENTO, DIPINTE NEL MATERIALE
 *
 * Il fianco dello scafo era una lastra chiara alta due metri e mezzo su
 * quaranta di lunghezza, senza niente sopra. Su una barca vera quella
 * superficie e' rotta da tre cose, e sono le tre che il cervello usa per
 * darle una scala: **le finestre di murata**, la **fascia scura al
 * galleggiamento** e il bordo del ponte. Senza, resta un pontone: e' cosi' che
 * si leggeva, e nessun materiale piu' lucido lo salvava.
 *
 * ─── PERCHE' NEL MATERIALE E NON IN GEOMETRIA
 *
 * Le alternative erano due, e tutte e due peggiori:
 *
 *   una texture     vorrebbe le UV, e le UV su questo scafo non ci sono
 *                   ancora: arrivano con la cottura delle mappe, che e' un
 *                   altro pezzo di lavoro. Sarebbe stato metterlo in coda a
 *                   qualcosa che non e' cominciato;
 *   dei riquadri    andrebbero appoggiati sulla superficie, e la superficie e'
 *   di geometria    un loft curvo: servirebbe interrogarla punto per punto e
 *                   scostarli di un pelo. Ho gia' pagato una volta il prezzo
 *                   di due pezzi che devono restare allineati fra loro — il
 *                   tappo di sezione — e la regola scritta in `ordinate.js` e'
 *                   che la seconda implementazione non da' errore, diverge in
 *                   silenzio.
 *
 * Qui invece la fonte resta UNA: la posizione nello spazio oggetto dello
 * scafo. Le finestre non possono scollarsi dalla superficie perche' **sono**
 * la superficie.
 *
 * ─── LE QUOTE, E DA DOVE VENGONO
 *
 * `ordinate.js` mette il trincarino fra 0,890 e 1,360 e il ginocchio fra
 * -0,18 e -0,30. Il fianco utile sta quindi fra circa 0 e 0,9. Una finestra di
 * murata su un quaranta metri sta a un metro e mezzo dal mare e non arriva
 * mai al trincarino: 0,60 di quota (1,5 m) e 0,17 di altezza (42 cm).
 *
 * La fascia al galleggiamento e' alta 14 cm — sotto e' antivegetativa, sopra
 * e' smalto — e non e' decorazione: e' l'unica cosa che dice **dove pesca la
 * barca**, e senza di lei lo scafo galleggia a un'altezza qualsiasi.
 */
const FINESTRE = {
  quota: 0.60,        // centro della fascia, in unita' di scena
  altezza: 0.17,
  daPoppa: 3.10,      // la prima finestra
  aProra: -3.90,      // l'ultima
  passo: 1.40,        // interasse
  larghezza: 0.92     // quanto e' lunga ciascuna
}
const GALLEGGIAMENTO = { alto: 0.058, spessore: 0.052 }

/**
 * Si scrive dentro lo shader dello Standard invece di sostituirlo: cosi'
 * l'illuminazione, l'ambiente e il piano di sezione restano quelli di three, e
 * l'unica cosa che cambia e' il colore di partenza. Un materiale scritto da
 * zero avrebbe voluto rifare tutto il resto per riguadagnare le stesse cose.
 */
materiali.scafo.onBeforeCompile = (s) => {
  s.vertexShader = s.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vLocale;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\n  vLocale = transformed;')

  s.fragmentShader = s.fragmentShader
    .replace('#include <common>', `#include <common>
varying vec3 vLocale;
// Quanto vetro c'e' su questo pixel. Vive fuori dal blocco perche' serve DUE
// volte, in due punti diversi dello shader: per il colore subito, e per la
// rugosita' piu' avanti. La variabile della rugosita' a quel punto non esiste
// ancora, e il primo tentativo si e' fermato li' con undeclared identifier.
float vetroFin = 0.0;
// una fascia morbida: 1 dentro, 0 fuori, coi bordi sfumati di m
float fascia (float v, float centro, float mezza, float m) {
  return 1.0 - smoothstep(mezza - m, mezza + m, abs(v - centro));
}`)
    .replace('#include <color_fragment>', `#include <color_fragment>
{
  // LA FASCIA AL GALLEGGIAMENTO — dice dove pesca la barca
  float boot = fascia(vLocale.y, ${GALLEGGIAMENTO.alto.toFixed(3)},
                      ${(GALLEGGIAMENTO.spessore / 2).toFixed(3)}, 0.006);
  diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.30, boot);

  // LE FINESTRE DI MURATA — ripetute lungo z, ma NON con un fract():
  // un fract() le farebbe correre fino alla prua e alla poppa, dove lo scafo
  // e' pieno. Si contano, e si fermano dove devono fermarsi.
  float y = fascia(vLocale.y, ${FINESTRE.quota.toFixed(3)},
                   ${(FINESTRE.altezza / 2).toFixed(3)}, 0.010);
  if (y > 0.001) {
    for (int i = 0; i < 6; i++) {
      float z = ${FINESTRE.daPoppa.toFixed(2)} - float(i) * ${FINESTRE.passo.toFixed(2)};
      if (z < ${FINESTRE.aProra.toFixed(2)}) break;
      vetroFin = max(vetroFin, fascia(vLocale.z, z,
                                      ${(FINESTRE.larghezza / 2).toFixed(3)}, 0.018));
    }
    vetroFin *= y;
  }
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.020, 0.028, 0.032), vetroFin);
}`)
    .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
// Un vetro e' piu' liscio della vernice: senza questo la finestra resterebbe
// una macchia scura invece di una superficie che riflette. Sta QUI e non
// insieme al colore perche' la variabile della rugosita' nasce in questa riga:
// scriverla prima da undeclared identifier, ed e' dove si e' fermato il primo
// tentativo.
roughnessFactor = mix(roughnessFactor, 0.045, vetroFin);

// ─── LA BUCCIA D'ARANCIA
//
// Un fianco verniciato non ha una rugosita' uniforme: lo spruzzo lascia
// un'ondulazione larga qualche centimetro, e su quaranta metri di murata e'
// quella che rompe il riflesso e lo fa sembrare vernice invece che vetro
// colato. E' l'indizio numero uno di §7, e sullo scafo mancava: l'avevo dato
// al meccanismo e non alla cosa piu' grande del fotogramma.
//
// Ampiezza piccolissima — cinque centesimi su una rugosita' di 0,13 — perche'
// la buccia d'arancia si vede nel MOVIMENTO del riflesso, non come macchia. A
// piu' di cosi' lo scafo comincia a sembrare sabbiato.
//
// Niente direzione: la vernice non ne ha. Chi ne ha una e' l'acciaio tornito
// del meccanismo, e li' infatti la lavorazione e' allungata lungo l'asse.
{
  // 34 era troppo fitto: a questa distanza si leggeva come puntinatura, non
  // come ondulazione. Una buccia d'arancia vera ha celle di qualche
  // centimetro, che su uno scafo lungo quaranta metri, visto da venti, sono
  // sotto il pixel — quello che si vede e' l'ondulazione LARGA che ne risulta.
  vec3 b = vLocale * 13.0;
  float o = sin(b.x + sin(b.y * 0.7) * 1.7) * sin(b.y * 1.1 + sin(b.z) * 1.3)
          * sin(b.z * 0.9 + b.x * 0.3);
  // solo dove NON c'e' vetro: una finestra non ha buccia d'arancia
  roughnessFactor = clamp(roughnessFactor + o * 0.042 * (1.0 - vetroFin), 0.02, 1.0);

  /* ─── L'ONDULAZIONE LARGA: PROVATA, MISURATA, TOLTA
     Il divario col render Cycles, misurato sui soli pixel sopra l'acqua con la
     maschera esatta del soggetto, non e' l'alta frequenza:

                      media    scarto a sfocatura 2 / 8 / 24
       Cycles         156,3       38,1 / 34,7 / 28,4
       sito           155,7       38,2 / 25,3 / 19,0

     Esposizione identica, alta frequenza identica -- la buccia d'arancia qui
     sopra fa il suo lavoro. A scala MEDIA e GRANDE il sito e' un terzo piu'
     piatto, e l'ipotesi era che mancasse un'ondulazione lenta della vernice.

     Provata, con l'ampiezza esposta come uniforme per poterla confrontare a
     fotogramma fermo. Non funziona: fra ampiezza 0 e 0,045 cambiano **32 pixel
     su 620.000, per un massimo di 4 livelli** -- e questo con la camera
     appoggiata alla murata, dove dovrebbe vedersi di piu'.

     La ragione vale piu' del tentativo: **una variazione di rugosita' si vede
     solo se c'e' qualcosa di STRUTTURATO da riflettere.** L'ambiente del sito
     e' una sfumatura liscia -- carta sopra, acqua sotto -- quindi riflettere
     un po' piu' o un po' meno sfocato da' lo stesso pixel. Nel render la
     differenza a scala media viene dalla luce RIMBALZATA fra le superfici, che
     il tempo reale non ha, e non da una rugosita' disuniforme.

     Non spedisco codice che non fa niente. */
}`)
}
/** Cambiando lo shader a mano, three va avvisato di ricompilare. */
materiali.scafo.customProgramCacheKey = () => 'scafo-finestre-3'
