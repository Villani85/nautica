import {
  Group, Mesh, PlaneGeometry, MeshBasicMaterial, VideoTexture,
  TextureLoader, SRGBColorSpace, MathUtils, CanvasTexture, Vector3, Quaternion
} from 'three'
import { creaGuscio } from './guscio.js'

/**
 * IL SALONE DENTRO LA SCENA — la stessa nave, senza montaggio.
 *
 * ─── IL RILIEVO CHE CURA, e non era una rifinitura
 *
 * Fino a qui il salone e la dimostrazione erano **due sistemi**: due moduli
 * caricati separatamente, due contenitori, e — con `?sagoma=1` — perfino due
 * `WebGLRenderer`. La continuita' costruita a colpi di CSS li cuciva bene, ma
 * cucire non e' unire: bastava un import lento, un rapporto d'aspetto diverso
 * o un fotogramma perso perche' il passaggio tornasse a leggersi come «nuova
 * scena». Il committente l'ha detto due volte — «non devono essere scene
 * separate», «la continuazione della stessa esperienza» — e una revisione
 * esterna l'ha chiamato difetto bloccante. Aveva ragione tutti e due.
 *
 * Qui il salone diventa geometria della scena della nave: stessi renderer,
 * stessa camera, stesse coordinate, stesso mare, stesso integratore. Non c'e'
 * piu' un passaggio da nascondere perche' non c'e' piu' un secondo posto.
 *
 * ─── E' ANCORA UNA FOTOGRAFIA, E VA DETTO
 *
 * Il salone resta il filmato girato: due piani con la stessa clip, uno
 * mascherato. Non e' una stanza modellata, e non deve esserlo — la regola del
 * sito e' che cio' che e' diagramma si costruisce e cio' che e' fotografia si
 * guarda. La differenza rispetto a prima non e' la natura del materiale: e'
 * che adesso quel materiale sta **dentro il volume della tuga**, alla sua
 * quota vera, e la camera ci passa davanti invece di essere teletrasportata.
 *
 * ─── PERCHE' DUE PIANI E NON UNO
 *
 * E' la forma a cui il capitolo e' arrivato buttando via tutto il resto, e la
 * ragione sta per esteso in `composito.js`. In breve: una clip sola, disegnata
 * due volte.
 *
 *   dietro  la clip INTERA, che ruota col rollio: e' il mare visto dal vetro;
 *   davanti la stessa clip con la maschera del finestrone, ferma: e' la
 *           stanza, e sta ferma perche' chi guarda e' seduto dentro.
 *
 * Ruota il mare, non la stanza. E' la correzione §5.1: da dentro una barca il
 * proprio salotto non si inclina, si inclina l'orizzonte. Se ruotasse la
 * stanza, si vedrebbe una fotografia storta.
 *
 * E il PIVOT sta sull'orizzonte, non al centro: ruotando attorno al centro
 * l'orizzonte si alzerebbe e abbasserebbe mentre gira, invece di limitarsi a
 * inclinarsi.
 *
 * ─── LE DUE SORGENTI SONO LO STESSO FILE
 *
 * Quindi al bordo del vetro grana, colore e artefatti di compressione
 * coincidono per costruzione, non per taratura. Le due decodifiche partono
 * pero' a istanti diversi, e vanno riallineate — non solo all'avvio: un video
 * in pausa e ripreso deriva.
 */

const CALMA = 'filmati/salone-largo.mp4'
/**
 * LA POSA PUNTELLATA E' ACCESA, e il numero che la accende e' lo stesso che
 * l'aveva spenta.
 *
 * ─── PERCHE' ERA SPENTA
 *
 * La vecchia `salone-teso.mp4` veniva da un'altra generazione: una ripresa
 * NOTTURNA col finestrone nero e un'inquadratura diversa, **72 livelli su 255**
 * di differenza media dalla clip calma. Dissolvendo su quella a rollio alto il
 * sito avrebbe mostrato un altro salone, di notte, senza mare, proprio nel
 * momento in cui rivendica che sopra e sotto la linea sono la stessa
 * traversata. Uno strato che mostra un'altra stanza e' peggio di nessuno
 * strato.
 *
 * La regola scritta allora era: *«resta spento finche' non esiste una posa
 * puntellata girata DALLA STESSA ripresa; a quel punto basta rimettere il nome
 * qui»*. Quella posa adesso esiste.
 *
 * ─── E LA MISURA CHE LO PERMETTE, rifatta con lo stesso metro
 *
 *     vecchia posa tesa      72,0 livelli su 255 di differenza media
 *     nuova posa tesa        10,6
 *       meta' sinistra (finestrone e mare)   14,9
 *       meta' destra   (stanza e persone)     6,3
 *
 * Sette volte meno, e la parte che conta e' la ripartizione: la stanza e le
 * persone differiscono di **6,3 livelli** -- stessa luce, stessi mobili, stessi
 * volti, cambia la posa -- mentre i 14,9 di sinistra sono il MARE, che fra due
 * clip indipendenti si muove per forza. E quel mare a schermo non ci arriva:
 * `finestrone.png` lo ritaglia via e dietro il vetro resta `salone-mare.mp4`,
 * cioe' il mare vivo della stessa scena.
 *
 * ─── L'INQUADRATURA E' LA STESSA, e anche questo e' misurato
 *
 * Il montante del finestrone si sposta di **1 pixel** fra la clip calma vecchia
 * e la nuova, l'orizzonte di **3**. `riferimenti/salone/posa.json` dichiara un
 * errore medio di riproiezione di 1,175 px su un tetto di 4: la calibrazione,
 * il vano e la maschera restano validi senza rifarli.
 *
 * ─── IL COSTO, che una revisione aveva chiesto di non dimenticare
 *
 * Si torna a TRE decodificatori invece di due, e su un telefono sono batteria e
 * calore. E' il prezzo dichiarato della conseguenza umana: senza questo strato
 * il finale dice «siamo tornati» invece di «hai risolto qualcosa per loro».
 * Se la misura su un telefono vero dicesse che non si regge, il posto dove
 * intervenire e' sospendere il ciclo calmo mentre il raccordo e' opaco -- non
 * spegnere di nuovo la posa.
 */
const TESA = 'filmati/salone-teso.mp4'
/**
 * IL TERZO GESTO NON E' UN ALTRO STATO IN CICLO.
 *
 * Calma e tensione descrivono condizioni che possono durare; il sollievo e'
 * invece una conseguenza con un prima e un dopo. Parte una volta sola quando
 * la posa e' stata davvero tesa e il rollio resta calmo abbastanza a lungo da
 * convincere gia' l'isteresi qui sotto. Non gira mai in loop.
 */
const SOLLIEVO = 'filmati/salone-sollievo.mp4'
/**
 * IL MARE HA UNA CLIP SUA, ed e' la correzione che serviva.
 *
 * Dietro il vetro c era la CLIP DELLA STANZA ingrandita 1,55 volte -- divano,
 * montante e persone compresi. Attraverso il buco si vedeva acqua solo perche'
 * il vano sta a sinistra e a sinistra, nella copia ingrandita, c e' ancora
 * acqua. Ma le onde erano a una scala diversa da quelle del vano, e ruotando
 * ruotava un divano ingrandito dietro il vetro.
 *
 * Il committente: *"il mare devi creare una finestra, altrimenti il movimento
 * e' incoerente rispetto all'attuale movimento del mare"*.
 *
 * `salone-da-filmato.py` ritaglia dalla ripresa la regione che e' solo mare e
 * cielo -- dedotta dalle rette del vano, non scelta -- e la specchia in
 * orizzontale fino a un 16:9 esatto, cosi' non serve nessun riscalamento.
 * Dietro il vetro adesso c e' soltanto mare, alla sua scala.
 */
const MARE = 'filmati/salone-mare.mp4'
const MASCHERA = 'salone/finestrone.png'

/** Quanto sta piu' indietro il mare rispetto alla stanza, in unita' di scena. */
const PROFONDITA = 0.45

/**
 * Quanto la clip del mare eccede il riquadro, per non scoprire gli angoli
 * quando ruota. Prima era 1,55 e serviva a due cose insieme: coprire la
 * rotazione E trovare dell'acqua dentro una clip che era per meta' stanza.
 * Adesso la clip e' gia' tutta mare, quindi resta solo il primo compito, ed e'
 * un calcolo: un riquadro 16:9 ruotato di 12 gradi ha bisogno di
 * cos12 + (9/16)*sin12 = 1,095. Con un po' di margine, 1,15.
 */
const INGRANDIMENTO = 1.15
/**
 * Dove sta l'orizzonte DENTRO `salone-mare.mp4`: e' il perno della rotazione.
 * Lo misura `salone-da-filmato.py` sulla mediana temporale -- dove le onde si
 * annullano e la linea e' pulita -- e lo scrive in `public/salone/vano.json`.
 * Qui e' copiato, e `collaudo-filmato.mjs` verifica che le due copie coincidano:
 * un numero misurato che vive in due posti deve avere qualcuno che li confronta.
 */
const ORIZZONTE = 0.539

/** Sopra questo rollio ci si irrigidisce; sotto CALMO si torna comodi. */
const ACCENDE = 5.0
const CALMO = 2.0
const CONVINCE = 1.6
const VELOCITA = 8

const RIALLINEA = 1 / 24
const OGNI_MS = 2000

function video (src) {
  const v = document.createElement('video')
  v.src = src
  v.muted = true
  v.loop = true
  v.playsInline = true
  v.preload = 'auto'
  v.crossOrigin = 'anonymous'
  // Fuori dal documento non basta in tutti i browser: un video staccato puo'
  // non ricevere fotogrammi. Sta nel documento, invisibile e fuori dal flusso.
  v.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px'
  document.body.appendChild(v)
  return v
}

function tex (v) {
  const t = new VideoTexture(v)
  t.colorSpace = SRGBColorSpace
  return t
}

/**
 * @param {string} base   `import.meta.env.BASE_URL`
 * @param {object} tuga   dove sta la tuga: `{ z, quota, largh, alt }` in unita'
 *                        di scena, calcolate da `nave.js` sulle ordinate vere.
 */
export function creaSalone3D (base, tuga) {
  const gruppo = new Group()
  gruppo.name = 'SALONE3D'

  /**
   * LA MISURA VIENE DALLA TUGA, non da un numero scelto guardando lo schermo.
   * L'altezza utile e' quella del ponte meno il parapetto e la fascia alta;
   * la larghezza discende dal rapporto della clip. Se domani la tuga cambia,
   * il salone la segue invece di scollarsi.
   */
  const alt = tuga.alt * 0.86
  const larg = alt * 16 / 10
  if (larg > tuga.largh * 0.96) {
    // Non si taglia in silenzio: se non ci sta, il capitolo va ripensato.
    console.warn('[nautica] il salone non sta nella tuga: ' +
                 `servono ${larg.toFixed(2)} su ${tuga.largh.toFixed(2)} disponibili`)
  }

  const vCalma = video(base + CALMA)
  const vTesa = TESA ? video(base + TESA) : null
  const vSollievo = SOLLIEVO ? video(base + SOLLIEVO) : null
  if (vSollievo) vSollievo.loop = false
  const vMare = video(base + MARE)
  const maschera = new TextureLoader().load(base + MASCHERA)

  const geo = new PlaneGeometry(larg, alt)

  /** 1 · IL MARE — la clip intera, ingrandita, che ruota sull'orizzonte. */
  /**
   * 1 · IL MARE — la stessa clip, dietro, e a ruotare e' l'IMMAGINE.
   *
   * ─── PERCHE' NON RUOTA IL PIANO
   *
   * Prima ruotava la mesh, ingrandita 1,55 volte per coprire gli angoli che
   * l'inclinazione scopre, e una maschera le ritagliava il riquadro della
   * stanza. Funziona finche' la maschera e' ferma — ma la maschera e' una
   * texture del piano, e **ruota col piano**. Inclinandosi, il rettangolo
   * visibile si inclina con lui e i suoi angoli escono dal riquadro della
   * fotografia: oltre il bordo destro comparivano il divano e la donna una
   * seconda volta.
   *
   * L'ho corretto due volte dalla parte sbagliata — prima accorciando la
   * maschera, poi facendola seguire alla scala — e tutte e due le volte e'
   * tornato appena la camera si muoveva. La domanda giusta non era «quanto
   * grande dev'essere il ritaglio», era **chi deve ruotare**.
   *
   * Nel DOM a ritagliare era l'apertura, che sta ferma. Qui l'equivalente e'
   * far ruotare la TEXTURE dentro un piano fermo: `map.rotation` con il centro
   * sull'orizzonte. Il piano ha esattamente la misura della stanza, non ha
   * bisogno di nessuna maschera, e non puo' uscire dal riquadro perche' il
   * riquadro E' il piano.
   *
   * L'ingrandimento di 1,55 resta, ma nello spazio della texture: `repeat`
   * minore di uno mostra una porzione piu' piccola della clip, ingrandita.
   * E' quello che copre gli angoli quando l'immagine gira.
   */
  const mareTex = tex(vMare)
  mareTex.center.set(0.5, 1 - ORIZZONTE)   // il PIVOT E' L'ORIZZONTE
  mareTex.repeat.set(1 / INGRANDIMENTO, 1 / INGRANDIMENTO)

  const mare = new Mesh(geo, new MeshBasicMaterial({ map: mareTex, toneMapped: false, transparent: true }))
  /* stessa cura della stanza, e per lo stesso difetto: durante l'uscita anche
     questo piano mostrava il proprio bordo, ed era il taglio netto in alto che
     restava dopo aver curato la stanza */
  mare.material.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <map_fragment>', `#include <map_fragment>
{
  vec2 b = min(vMapUv, 1.0 - vMapUv);
  diffuseColor.a *= smoothstep(0.0, 0.06, min(b.x, b.y));
}`)
  }
  mare.material.customProgramCacheKey = () => 'salone-mare-bordo-1'
  mare.position.z = -PROFONDITA
  gruppo.add(mare)

  /**
   * 1-bis · IL FONDO DELLA STANZA — quello che toglie i quattro bordi.
   *
   * ═══ IL DIFETTO, FOTOGRAFATO
   *
   * `feedback/prove/2026-08-29-salone-e-una-carta.png`: a scorrimento 0,235 il
   * salone e' un rettangolo con quattro bordi netti che galleggia contro lo
   * scafo. Una revisione l'ha detto per intero -- *«si vede fisicamente che il
   * salone e' un piano: ruotando compaiono zone bianche intorno al rettangolo,
   * il bordo destro appare come il margine di una scheda»* -- ed e' uno dei due
   * difetti che tengono il progetto fuori dal Site of the Year.
   *
   * ═══ E LA CAUSA NON E' IL PIANO. E' CIO' CHE C'E' DIETRO.
   *
   * Un piano non ha bordi visibili se dietro c'e' una stanza; li ha se dietro
   * c'e' il mare. E dietro c'era il mare, letteralmente: `nave.js` costruisce
   * la tuga in due fasce -- parapetto e tetto -- e **fra le due non c'e'
   * niente**, per una ragione buona che va conservata:
   *
   *     «guardando la nave di traverso si passa da un finestrino all'altro e
   *      si finisce sull'orizzonte, che sta in coordinate mondo e quindi non
   *      rolla con la stanza»
   *
   * Quella trasparenza e' la prova che l'orizzonte non rolla, ed e' la tesi
   * §5.1. Ma nel tratto in cui c'e' la fotografia produce il difetto: oltre il
   * bordo della lastra si vede DA PARTE A PARTE, quindi il bordo si stacca
   * contro il cielo e il rettangolo si legge come una scheda appoggiata.
   *
   * ═══ COSA FA QUESTO PIANO, E COSA NON FA
   *
   * Chiude la fascia **solo dietro la fotografia**, con un margine. Il resto
   * della tuga resta passante, quindi la prova dell'orizzonte regge intatta:
   * basta guardare la nave dove la stanza non c'e'.
   *
   * Non e' un guscio modellato e non pretende di esserlo -- quello e' il lavoro
   * di Blender che la direzione chiede al punto 1, con proiezione dalla posa
   * calibrata di `riferimenti/salone/posa.json`. Questo toglie il TELL con la
   * geometria che c'e' gia': da fuori, attraverso il taglio, un salotto
   * illuminato dentro un volume scuro e' esattamente cio' che si vede
   * guardando dentro un ambiente da una fessura.
   *
   * ═══ IL COLORE VIENE DALLA CLIP, non da una tinta scelta a occhio
   *
   * Stessa sorgente della stanza, ingrandita quattro volte -- a
   * quell'ingrandimento non si riconosce piu' niente, resta il TONO -- e
   * moltiplicata per un fattore scuro. Cosi' grana, temperatura e artefatti di
   * compressione coincidono col bordo della fotografia per COSTRUZIONE e non
   * per taratura, che e' la stessa ragione per cui il mare dietro il vetro e'
   * la stessa clip della stanza.
   *
   * Una tinta piatta scelta a mano avrebbe fatto la fine di tutte le tinte
   * scelte a mano di questo repo: giusta sul monitor di chi la sceglie, e uno
   * scalino visibile appena il video cambia.
   */
  /**
   * ─── QUANTO GRANDE, e il conto e' vincolato dalla sfumatura
   *
   * Prima prova: 1,9 x 1,25 con una sfumatura larga 0,24 per lato. Guardata:
   * il fondo spariva PROPRIO dove finisce la fotografia, e il bordo di lei
   * tornava visibile. Il conto lo dice -- il nucleo opaco vale (1 - 2*0,24)
   * cioe' il 52% del piano, e il 52% di 1,9 e' 0,99: appena la larghezza della
   * stanza. Il fondo copriva tutto tranne l'unico posto che doveva coprire.
   *
   * Con 2,4 il nucleo opaco vale 1,44 volte la stanza: la fotografia finisce
   * dentro la parte piena, e il suo bordo sfuma nel buio invece di tagliare.
   *
   * NON PIU' GRANDE DI COSI', e il limite non e' estetico: ogni unita' di
   * fondo e' una fetta di fascia del finestrone che smette di essere passante,
   * e la trasparenza da murata a murata e' la prova che l'orizzonte non rolla
   * (§5.1). A 2,4 la stanza occupa circa meta' della tuga: l'altra meta' resta
   * passante, e la prova si fa li'.
   */
  const FONDO_LARGO = 2.4      // volte la larghezza della stanza
  /* 2,8 e non 1,8: a 1,8 il nucleo opaco valeva 1,08 volte l'altezza della
     stanza e il bordo BASSO della fotografia restava un taglio dritto contro
     lo scafo chiaro -- visto e corretto. Alzarlo non costa niente in
     trasparenza: le due fasce della tuga sono geometria OPACA, quindi il
     disegno le mette prima e il test di profondita' nasconde da solo cio' che
     sporge sopra e sotto. */
  const FONDO_ALTO = 2.8       // volte l'altezza
  const FONDO_INGRANDIMENTO = 4.0
  const fondoTex = tex(vCalma)
  fondoTex.center.set(0.5, 0.5)
  fondoTex.repeat.set(1 / FONDO_INGRANDIMENTO, 1 / FONDO_INGRANDIMENTO)
  const fondo = new Mesh(
    new PlaneGeometry(larg * FONDO_LARGO, alt * FONDO_ALTO),
    new MeshBasicMaterial({ map: fondoTex, color: 0x3a2a1d, toneMapped: false, transparent: true, depthWrite: false })
  )
  /**
   * ─── E ANCHE QUESTO SFUMA, o si e' solo cambiata la carta
   *
   * Prima prova, guardata: il fondo toglieva i bordi della fotografia e ci
   * metteva i PROPRI. Un rettangolo nero netto invece di uno chiaro -- meglio,
   * perche' almeno legge come ombra e non come cielo, ma sempre un rettangolo.
   *
   * La cura e' quella che la stanza e il mare hanno gia': l'alfa si spegne
   * verso il bordo. Qui la fascia e' molto piu' larga -- 0,22 contro 0,06 --
   * perche' i due casi sono diversi: la stanza sfuma per non mostrare il
   * proprio taglio e deve restare nitida quasi ovunque, questo e' uno SFONDO e
   * il suo mestiere e' non finire da nessuna parte.
   */
  /**
   * ─── E LA SFUMATURA SI CALCOLA SULLA UV GREZZA, non su `vMapUv`
   *
   * DIFETTO MIO, preso guardando: la prima stesura copiava la sfumatura del
   * mare, che usa `vMapUv`, e **non sfumava niente**. Il fondo pero' magnifica
   * la clip con `repeat = 1/4` e `center = 0,5`, quindi `vMapUv` corre solo fra
   * 0,375 e 0,625: non si avvicina mai a 0 ne' a 1, `min(b.x, b.y)` vale sempre
   * circa 0,375 e lo smoothstep restituisce 1 dappertutto. Un bordo netto
   * identico a prima, con dentro il codice che avrebbe dovuto toglierlo.
   *
   * Sul mare quella riga funziona perche' li' l'ingrandimento e' 1,55 e la
   * fascia di sfumatura e' 0,06: il margine c'e' comunque. E' il genere di cosa
   * che si copia senza accorgersene, e che non da' nessun errore.
   *
   * Serve la UV del PIANO, che nessuna trasformazione tocca. Si porta con un
   * varying proprio: due righe nel vertice, una nel frammento.
   */
  fondo.material.onBeforeCompile = (sh) => {
    sh.vertexShader = 'varying vec2 vGrezza;\n' + sh.vertexShader
      .replace('#include <uv_vertex>', '#include <uv_vertex>\n  vGrezza = uv;')
    sh.fragmentShader = 'varying vec2 vGrezza;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', `#include <map_fragment>
{
  vec2 b = min(vGrezza, 1.0 - vGrezza);
  diffuseColor.a *= smoothstep(0.0, 0.24, min(b.x, b.y));
}`)
  }
  fondo.material.customProgramCacheKey = () => 'salone-fondo-bordo-2'
  /* dietro il mare, che e' gia' dietro la stanza; `renderOrder` e non la
     distanza, perche' su piani quasi complanari l'ordinamento per distanza dei
     materiali trasparenti e' instabile */
  fondo.position.z = -PROFONDITA - 0.05
  fondo.renderOrder = -1
  gruppo.add(fondo)

  /**
   * 2 · LA STANZA — e adesso e' LEI che rolla.
   *
   * --- ERA AL CONTRARIO, E IL COMMITTENTE L'AVEVA GIA' DETTO
   *
   * Fin qui la stanza stava ferma e a inclinarsi era il mare. Da dentro si
   * vedeva un salotto immobile e un orizzonte che si spostava di un grado:
   * *"la barca si deve muovere"*, e aveva ragione -- non si muoveva niente di
   * cio' che l'occhio usa come riferimento.
   *
   * La regola che aveva chiesto e' l'opposta, e l'aveva scritta prima:
   * *"per creare il movimento della barca ma l'orizzonte che non si muove"*.
   * E' anche quella di `docs/09`: **la stanza rolla, l'orizzonte no.**
   *
   * --- COME, SENZA SCOPRIRE GLI ANGOLI
   *
   * A ruotare non e' il piano ma la TEXTURE dentro un piano fermo -- la stessa
   * soluzione del mare, per la stessa ragione: un piano che ruota porta fuori
   * dal riquadro i propri angoli. Qui pero' ruotano DUE texture insieme, la
   * fotografia e la sua maschera, perche' il buco del vetro appartiene alla
   * stanza e deve inclinarsi con lei. Un solo angolo, applicato a tutte e due:
   * se divergono, il vano scivola sotto il ritaglio.
   *
   * --- E L'INGRANDIMENTO SI CALCOLA A OGNI FOTOGRAMMA
   *
   * Ruotando, un riquadro 16:9 ha bisogno di `cos|a| + (9/16)*sin|a|` volte se
   * stesso per non scoprire gli angoli: 1,00 da fermo, 1,19 a dodici gradi.
   * Tenerlo fisso al massimo vorrebbe dire buttare il 16% della fotografia
   * anche quando il mare e' calmo -- cioe' pagare sempre il prezzo del caso
   * peggiore. Si calcola invece dall'angolo vero, e da fermo la fotografia e'
   * intera.
   */
  const stanzaTex = tex(vCalma)
  const mascheraRuota = maschera.clone()
  mascheraRuota.needsUpdate = true
  const tesaTex = vTesa ? tex(vTesa) : null
  const mascheraTesa = vTesa ? maschera.clone() : null
  if (mascheraTesa) mascheraTesa.needsUpdate = true
  const sollievoTex = vSollievo ? tex(vSollievo) : null
  const mascheraSollievo = vSollievo ? maschera.clone() : null
  if (mascheraSollievo) mascheraSollievo.needsUpdate = true
  const RUOTANO = [
    stanzaTex, mascheraRuota,
    tesaTex, mascheraTesa,
    sollievoTex, mascheraSollievo
  ].filter(Boolean)
  for (const t of RUOTANO) t.center.set(0.5, 0.5)

  const stanza = new Mesh(geo, new MeshBasicMaterial({
    map: stanzaTex, alphaMap: mascheraRuota, transparent: true, toneMapped: false
  }))
  /**
   * Il bordo si spegne negli ultimi 6% della lastra. Sotto il 3% non copre il
   * taglio; sopra il 10% comincia a mangiare il divano, che sta vicino al
   * bordo destro della fotografia.
   *
   * Si moltiplica `diffuseColor.a` DOPO `alphamap_fragment`, o la maschera del
   * finestrone -- che arriva li' -- sovrascriverebbe la sfumatura.
   */
  stanza.material.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <alphamap_fragment>', `#include <alphamap_fragment>
{
  vec2 b = min(vMapUv, 1.0 - vMapUv);
  float bordo = smoothstep(0.0, 0.06, min(b.x, b.y));
  diffuseColor.a *= bordo;
}`)
  }
  stanza.material.customProgramCacheKey = () => 'salone-bordo-1'

  /**
   * ─── L'IMBOTTO DEL FINESTRONE: PROVATO E NON SPEDITO
   *
   * L'idea era dare spessore al montante che separa il vetro dalla stanza --
   * una scatola di 55 cm che sporge verso la camera -- perche' e' l'unico
   * imbotto che esiste davvero: la maschera dice che il finestrone occupa
   * x 0,000-0,551 a tutta altezza, cioe' e' un'apertura a filo, non una
   * finestra incorniciata. Il colore era misurato sul fotogramma (rgb 30,18,12,
   * media della colonna del montante), non scelto.
   *
   * NON LO SPEDISCO perche' non sono riuscito a verificarlo dove conta. Il
   * confronto con e senza, alla battuta del salone, dava due fotogrammi
   * identici: la mia sonda inquadrava un punto in cui il salone non e' ancora
   * in scena. Un pezzo di geometria che entra nel campo visivo di una
   * fotografia puo' rovinarla in modo evidente, e spedirlo senza aver visto la
   * differenza sarebbe la stessa cosa che ho appena rimproverato a me stesso
   * col piano scuro dietro la lastra -- che copriva lo 0,0% dello schermo.
   *
   * Resta qui come nota perche' la strada e' giusta: la revisione chiede
   * imbotti, pavimento, soffitto e montanti che occludano davvero, e questo e'
   * il primo pezzo. Va fatto quando c'e' il tempo di verificarlo, non a fine
   * turno.
   */

  stanza.position.z = 0.004
  gruppo.add(stanza)

  /**
   * ─── IL GUSCIO, DIETRO UN INTERRUTTORE: `?guscio=1`
   *
   * Non entra nel percorso predefinito finche' non e' stato GUARDATO nei punti
   * dove la lastra si rivela -- scorrimento 0,235 e dintorni, su quattro
   * viewport. Metterlo in produzione stanotte significherebbe scambiare un
   * difetto misurato con uno non misurato.
   *
   * Sostituisce la lastra invece di aggiungersi: due geometrie che portano la
   * stessa fotografia si combatterebbero in profondita'. La lastra resta nel
   * documento, spenta, perche' il confronto fra le due si fa a interruttore e
   * non a `git checkout`.
   */
  /**
   * ─── `includes('guscio')` ACCENDEVA ANCHE `?guscio=0`
   *
   * Difetto mio, trovato da una revisione e riprodotto in una riga:
   * `'?guscio=0'.includes('guscio')` e' `true`. Bastava anche un parametro
   * qualsiasi che contenesse quella parola. Un interruttore che si accende
   * quando gli si chiede di spegnersi non e' un interruttore.
   *
   * `URLSearchParams` e valori dichiarati, come `?doppia` in `regia.js`: si
   * accetta la presenza nuda (`?guscio`) o un si' esplicito, e nient'altro.
   */
  let guscio = null
  const vuoleGuscio = () => {
    if (typeof location === 'undefined') return false
    const v = new URLSearchParams(location.search).get('guscio')
    return v !== null && (v === '' || v === '1' || v === 'si' || v === 'true')
  }
  if (vuoleGuscio()) {
    /* il bersaglio: dove sta la camera del sito alla battuta del salone, NEL
       SISTEMA DEL GRUPPO. Misurato con `strumenti/posa-sito.mjs`, non supposto:
       in asse, 1,31 unita' davanti alla lastra, rotazione identita'. */
    const g = creaGuscio(base, stanzaTex, {
      /* `?dz=` sposta il bersaglio lungo l'asse di vista. Serve a CERCARE la
         distanza col registro in pixel invece di indovinarla: la rotazione e'
         gia' risolta per misura, resta la scala apparente. */
      posizione: new Vector3(
        -0.01 + Number(new URLSearchParams(location.search).get('dx') || 0),
        0 + Number(new URLSearchParams(location.search).get('dy') || 0),
        1.3089 + Number(new URLSearchParams(location.search).get('dz') || 0)),
      quaternione: new Quaternion()
    }, larg / alt)
    gruppo.add(g)
    guscio = g
    stanza.visible = false
  }

  /**
   * ─── LA LASTRA NON DEVE FINIRE DI TAGLIO
   *
   * SINTOMO, dal video del sito: durante l'uscita la camera indietreggia, la
   * fotografia rimpicciolisce e il suo RETTANGOLO entra nell'inquadratura --
   * un bordo netto in alto contro la carta della pagina, e i lati che leggono
   * come il margine di una scheda. In quei secondi chi guarda capisce come e'
   * costruito il trucco. Segnalato da una revisione esterna guardando il
   * video, e riprodotto qui: a scorrimento 0,10 il bordo alto sta a meta'
   * schermo con la pagina sopra.
   *
   * PERCHE' `DEBORDO` NON BASTA: quella costante tiene la camera abbastanza
   * vicina da far debordare la fotografia del 32%, ma vale mentre si sta
   * DENTRO. Durante l'uscita la camera va oltre.
   *
   * COSA HO PROVATO PRIMA, e non funziona: un piano scuro molto piu' grande
   * dietro la lastra, a fare da interno dello scafo. Misurato dipingendolo di
   * rosso e contando i pixel: copre lo **0,0% dello schermo**, perche' la
   * geometria della nave sta proprio li' attorno e lo occlude. Un piano
   * dietro non risolve niente, e senza il provino rosso l'avrei spedito
   * credendo di aver curato qualcosa.
   *
   * QUELLO CHE FUNZIONA a prescindere dagli occlusori e' agire sui pixel della
   * lastra stessa: l'alfa si spegne verso il bordo. Non c'e' piu' un taglio --
   * c'e' una stanza che sfuma nel buio, che e' anche cio' che si vede
   * davvero guardando dentro un ambiente da fuori.
   */


  /** 3 · LA POSA PUNTELLATA, sopra la calma quando la stanza rolla davvero. */
  const tesa = vTesa
    ? new Mesh(geo, new MeshBasicMaterial({
      map: tesaTex, alphaMap: mascheraTesa, transparent: true, opacity: 0, toneMapped: false
    }))
    : null
  if (tesa) { tesa.position.z = 0.008; gruppo.add(tesa) }

  /** 4 · IL SOLLIEVO, sopra entrambe le pose e per una corsa soltanto. */
  const sollievo = vSollievo
    ? new Mesh(geo, new MeshBasicMaterial({
      map: sollievoTex,
      alphaMap: mascheraSollievo,
      transparent: true,
      opacity: 0,
      toneMapped: false
    }))
    : null
  if (sollievo) { sollievo.position.z = 0.012; gruppo.add(sollievo) }

  gruppo.position.set(0, tuga.quota, tuga.z)
  // guarda verso poppa: e' da li' che la camera arriva e da li' se ne va
  gruppo.rotation.y = 0

  let q = 0            // quanto e' puntellata la posa
  let calmoDa = 0
  let ultimo = 0
  let sollievoArmato = false
  let sollievoPreparato = false
  let sollievoInMoto = false
  let sollievoInConsegna = false
  let sollievoConcluso = false
  let sollievoDaRiavvolgere = false
  let opacitaSollievo = 0
  /* l'istante del ciclo calmo quando la consegna si e' chiusa: vedi `chiudi` */
  let calmaAllaConsegna = null
  /* quante attese sono servite al seek: vedi `chiudi` */
  let consegnaAttese = null
  let versioneConsegna = 0

  const ARMA_SOLLIEVO = 0.6
  const DISSOLVENZA_ENTRA = 0.28

  function rampa (x, a, b) {
    return MathUtils.clamp((x - a) / Math.max(0.001, b - a), 0, 1)
  }

  /**
   * Decodifica il primo fotogramma mentre le persone sono ancora tese. Non si
   * tiene un quarto video in riproduzione: un seek muto basta a scaldare il
   * decoder prima che il gesto debba comparire.
   */
  function preparaSollievo () {
    if (!vSollievo || sollievoPreparato || vSollievo.readyState < 1) return
    try { vSollievo.currentTime = 0.001 } catch {}
    sollievoPreparato = true
  }

  function avviaSollievo () {
    if (!vSollievo || sollievoInMoto || sollievoInConsegna ||
        sollievoDaRiavvolgere || !sollievoArmato) return
    versioneConsegna++
    sollievoArmato = false
    sollievoInMoto = true
    sollievoInConsegna = false
    sollievoConcluso = false
    opacitaSollievo = 0
    calmaAllaConsegna = null
    try { vSollievo.currentTime = 0 } catch {}
    vSollievo.play().catch(() => {
      sollievoInMoto = false
      opacitaSollievo = 0
    })
  }

  function interrompiSollievo ({ riarma = false, sfuma = false } = {}) {
    if (!vSollievo) return
    versioneConsegna++
    vSollievo.pause()
    sollievoInMoto = false
    sollievoInConsegna = false
    sollievoConcluso = false
    sollievoPreparato = false
    if (riarma) sollievoArmato = true
    /* La consegna mette in pausa il ciclo calmo per cercarne il primo frame.
       Se il mare torna difficile durante quel brevissimo seek, il fondo deve
       ripartire: la posa tesa gli si dissolve sopra, non lo sostituisce. */
    if (riarma) vCalma.play().catch(() => {})
    if (sfuma) {
      /* Il fotogramma non si riavvolge mentre e' ancora visibile: altrimenti
         le persone tornerebbero alla posa iniziale in un solo frame. */
      sollievoDaRiavvolgere = true
      return
    }
    sollievoDaRiavvolgere = false
    opacitaSollievo = 0
    try { vSollievo.currentTime = 0 } catch {}
    if (sollievo) sollievo.material.opacity = 0
  }

  function consegnaAllaCalma () {
    if (!vSollievo) return
    /**
     * L'ULTIMO FOTOGRAMMA E IL PRIMO DELLA CALMA.
     *
     * La clip definitiva e' stata generata fra i due fotogrammi canonici: il
     * frame 0 coincide con la posa tesa e il frame 119 coincide con il frame 0
     * di `salone-largo`. Non serve piu' conservare una fotografia finale ne'
     * dissolvere fra due corpi diversi. Si tiene visibile l'ultimo frame del
     * sollievo soltanto mentre il decoder calmo cerca il proprio frame 0; dopo
     * il `seeked` si nasconde lo strato e il ciclo riparte dalla stessa posa.
     */
    sollievoInMoto = false
    sollievoInConsegna = true
    sollievoConcluso = false
    opacitaSollievo = 1
    if (sollievo) sollievo.material.opacity = 1

    const questa = ++versioneConsegna
    let chiusa = false
    let attese = 0
    const chiudi = () => {
      if (chiusa || questa !== versioneConsegna || !sollievoInConsegna) return
      /**
       * ─── NON SI CONSEGNA SU UNA POSIZIONE VECCHIA
       *
       * La rete `requestAnimationFrame` messa qui accanto puo' scattare PRIMA
       * che il seek a zero abbia fatto effetto: il ciclo calmo riparte da dove
       * stava, e il raccordo salta. Misurato in CI: **la calma riparte a
       * 0,96 s** invece che da zero, cioe' quasi un secondo di stanza saltato
       * nel momento in cui il sito promette che non c'e' nessun salto.
       *
       * E' una regressione che ho introdotto io curando il caso opposto -- la
       * consegna che non si chiudeva mai. Le due cure convivono: si aspetta il
       * fotogramma giusto, ma non all'infinito.
       *
       * Sessanta fotogrammi sono il tetto, non un'attesa: se il seek non arriva
       * nemmeno in sessanta, meglio un raccordo impreciso di uno schermo
       * coperto per sempre. E il numero finisce comunque in
       * `calmaAllaConsegna`, quindi chi misura lo vede invece di subirlo.
       */
      if (vCalma.readyState >= 2 && Math.abs(vCalma.currentTime) > 0.5 && attese < 60) {
        attese++
        requestAnimationFrame(chiudi)
        return
      }
      chiusa = true
      sollievoInConsegna = false
      sollievoConcluso = true
      opacitaSollievo = 0
      if (sollievo) sollievo.material.opacity = 0
      /**
       * DOVE STA LA CALMA ADESSO, non dove stara' fra due secondi.
       *
       * «Il ciclo calmo riparte dal raccordo» e' un'affermazione sull'ISTANTE
       * della consegna. Chi la verifica da fuori legge per forza piu' tardi, e
       * nel frattempo il video ha suonato: su un rasterizzatore software un
       * cancello leggeva **1,99 s** e concludeva che il raccordo era saltato,
       * su un montaggio che invece riparte da zero. Il numero era vero e la
       * conclusione sbagliata, perche' misurava il ritardo di chi guarda.
       */
      calmaAllaConsegna = vCalma.currentTime
      /**
       * ─── E SI REGISTRA ANCHE SE IL TETTO E' STATO ESAURITO
       *
       * Senza questo numero, chi guarda da fuori non puo' distinguere due casi
       * che si somigliano e vogliono giudizi opposti:
       *
       *   la consegna ha chiuso SUBITO su una posizione vecchia   -> difetto
       *   ha aspettato i sessanta fotogrammi e poi ha ceduto      -> il ripiego
       *                                                              dichiarato
       *                                                              qui sopra
       *
       * Il secondo caso e' quello che succede su un rasterizzatore software:
       * sessanta fotogrammi a 2,3 al secondo sono ventisei secondi, il seek non
       * atterra, e il montaggio cede COME PROGETTATO. Un cancello che li
       * confonde accusa il sito di un difetto che il sito ha scelto.
       */
      consegnaAttese = attese
      vCalma.play().catch(() => {})
    }
    /**
     * ─── DUE STRADE VERSO LA STESSA CHIUSURA, e `chiudi` e' idempotente
     *
     * `requestVideoFrameCallback` scatta quando il video PRESENTA un
     * fotogramma. Tre righe sopra il ciclo calmo e' stato messo in PAUSA: se
     * il decoder non presenta piu' niente -- e su un rasterizzatore software
     * capita -- quella richiamata non arriva MAI, la consegna resta aperta e
     * lo schermo resta coperto dal fermo immagine del sollievo. Non per un
     * istante: per sempre.
     *
     * Misurato: in CI tre volte su tre, in locale con la GPU mai. E la
     * diagnosi ha escluso la spiegazione comoda -- il video calmo aveva
     * presentato **207 fotogrammi**, `readyState 4`, la richiamata esisteva.
     * Non era la pipeline video del runner: era una richiamata chiesta a un
     * video fermo.
     *
     * Si tengono tutte e due. La richiamata del video resta la strada buona,
     * perche' e' l'unica che garantisce che il fotogramma sia davvero A
     * SCHERMO; il fotogramma di animazione e' la rete, e costa una riga.
     * `chiudi` si protegge da solo con `chiusa`, quindi chi arriva secondo non
     * fa niente.
     */
    const framePronto = () => {
      if ('requestVideoFrameCallback' in vCalma) vCalma.requestVideoFrameCallback(chiudi)
      requestAnimationFrame(chiudi)
    }

    vCalma.pause()
    vCalma.addEventListener('seeked', framePronto, { once: true })
    try {
      /* Anche se il tempo e' gia' vicino a zero si assegna zero: il browser
         deve presentare QUEL frame prima che lo strato superiore sparisca. */
      vCalma.currentTime = 0
      /**
       * ─── SE IL FOTOGRAMMA C'E' GIA', SI CHIUDE. NON SE NE CHIEDE UN ALTRO.
       *
       * Qui c'era `framePronto()`, che registra
       * `requestVideoFrameCallback`. Ma quella richiamata scatta quando il
       * video PRESENTA un fotogramma nuovo, e tre righe sopra il video calmo
       * e' stato messo in PAUSA: se era gia' sullo zero, di fotogrammi nuovi
       * non ne presenta piu' nessuno. La richiamata non arriva mai, la
       * consegna resta aperta e **lo schermo resta coperto dal fermo immagine
       * del sollievo**.
       *
       * Si vedeva solo a volte, perche' dipende da dove si trova il ciclo
       * calmo quando il sollievo finisce: se stava a meta', l'assegnazione a
       * zero e' un salto vero, presenta un fotogramma e la richiamata scatta.
       * Se stava gia' li', no. In CI e' capitato tre volte su tre, in locale
       * con la GPU mai.
       *
       * Isolato con una diagnosi invece che con un'ipotesi: il video calmo
       * aveva presentato **207 fotogrammi**, `readyState 4`, la richiamata
       * esisteva -- quindi non era la pipeline video del runner, come stavo per
       * concludere.
       *
       * `readyState >= 2` significa che il fotogramma a quella posizione E'
       * gia' disponibile: chiedere di aspettarne un altro non protegge da
       * niente. L'intento del codice -- non scoprire lo strato prima che sotto
       * ci sia l'immagine giusta -- resta soddisfatto.
       */
      if (Math.abs(vCalma.currentTime) < 0.001 && vCalma.readyState >= 2) chiudi()
    } catch {
      chiudi()
    }
  }

  vSollievo?.addEventListener('ended', consegnaAllaCalma)

  /**
   * Il riallineamento non e' solo all'avvio: due decodifiche indipendenti
   * derivano, e una pausa le sfasa. Attraverso il vetro si vedrebbe un mare
   * di qualche fotogramma diverso da quello della clip.
   */
  let sincro = 0

  /**
   * ─── LA POSA TESA NON DECODIFICA MENTRE NESSUNO LA GUARDA
   *
   * REGRESSIONE PRESA DA `collaudo-ridotto` accendendo la posa tesa: con
   * `prefers-reduced-motion` il video del salone e' avanzato di **0,031 s in un
   * secondo e mezzo**, cioe' stava fermo, dove prima ne avanzava uno intero.
   *
   * La causa non e' la preferenza: e' il RIALLINEAMENTO. L'intervallo cercava
   * la deriva fra clip calma e clip tesa e, trovandola, riscriveva
   * `vTesa.currentTime`. Ma la tesa e' invisibile quasi sempre (opacita' zero),
   * quindi non ha nessuna ragione di girare -- e riposizionarla in continuazione
   * mentre il resto decodifica significa chiedere alla pipeline media tre
   * flussi 720p piu' una serie di `seek`. A movimento ridotto, dove il ciclo di
   * disegno gia' non gira, questo bastava a fermare tutto.
   *
   * La cura e' la stessa cosa che una revisione aveva gia' chiesto per la
   * batteria di un telefono: **non si decodifica uno strato che nessuno vede**.
   * La tesa parte in pausa, entra in gioco quando la posa la chiama, e si
   * riallinea SOLO mentre e' in scena -- che e' anche l'unico momento in cui un
   * disallineamento si potrebbe vedere.
   *
   * Guadagno collaterale: fuori dal raccordo i decodificatori tornano due, come
   * erano prima che questa posa esistesse.
   */
  let tesaInMoto = false

  function tesaSegue (q) {
    if (!vTesa) return
    const serve = q > 0.002
    if (serve === tesaInMoto) return
    tesaInMoto = serve
    if (serve) {
      /* si riparte allineati: entrare con qualche fotogramma di scarto e' il
         modo in cui due riprese della stessa stanza si tradiscono */
      try { vTesa.currentTime = vCalma.currentTime % (vTesa.duration || 1) } catch {}
      vTesa.play().catch(() => {})
    } else {
      vTesa.pause()
    }
  }

  function riproduci () {
    vCalma.play().catch(() => {})
    vMare.play().catch(() => {})
    if (!sincro) {
      sincro = setInterval(() => {
        if (vTesa && tesaInMoto && vCalma.readyState > 1 &&
            Math.abs(vCalma.currentTime - vTesa.currentTime % (vTesa.duration || 1)) > RIALLINEA) {
          try { vTesa.currentTime = vCalma.currentTime % (vTesa.duration || 1) } catch {}
        }
      }, OGNI_MS)
    }
  }

  /**
   * ─── FERMARE IL CICLO DI DISEGNO NON FERMA I DECODIFICATORI
   *
   * Segnalato da una revisione, ed e' vero e concreto: due video 1280x720 che
   * continuano a decodificare fuori schermo costano batteria, memoria e
   * temperatura su un telefono — e il ciclo di disegno che si spegne quando la
   * sezione esce di campo non li tocca. `riproduci` c'era e `ferma` non veniva
   * chiamato da nessuno; l'intervallo di riallineamento non veniva mai fermato.
   *
   * Anche l'intervallo va spento: un `setInterval` su un video in pausa scrive
   * `currentTime` all'infinito su qualcosa che non avanza.
   */
  function ferma () {
    vCalma.pause()
    vTesa?.pause()
    vMare.pause()
    interrompiSollievo()
    /* e si dimentica che era in moto: al risveglio deve essere `tesaSegue` a
       ridecidere dalla posa, non un booleano rimasto acceso da prima */
    tesaInMoto = false
    if (sincro) { clearInterval(sincro); sincro = 0 }
  }

  /** Rilascia tutto: texture, video, sorgenti. Per chi smonta la scena. */
  function smonta () {
    ferma()
    for (const m of [mare, stanza, tesa, sollievo].filter(Boolean)) {
      m.material.map?.dispose()
      m.material.alphaMap?.dispose()
      m.material.dispose()
      m.geometry.dispose()
    }
    for (const v of [vCalma, vTesa, vSollievo, vMare].filter(Boolean)) {
      v.removeAttribute('src'); v.load(); v.remove()
    }
  }

  /**
   * @param {number} gradi  il rollio VERO, dallo stesso integratore della nave
   * @param {number} dt     secondi
   */
  /**
   * Il mare arretrato deve riempire lo stesso finestrino: cresce di quanto e'
   * piu' lontano. La distanza VERA la sa solo chi muove la camera — passargli
   * quella d'inquadratura, che cambia solo al ridimensionamento, lasciava il
   * fondale ingrandito com'era da seduti anche dopo essere usciti.
   *
   * E crescendo non puo' piu' uscire dal riquadro, perche' il riquadro e' il
   * piano stesso: e' il guadagno vero di aver tolto la maschera.
   */
  function profondita (distanzaCamera) {
    const k = (distanzaCamera + PROFONDITA) / Math.max(0.01, distanzaCamera)
    mare.scale.setScalar(k)
  }

  function aggiorna (gradi, dt) {
    /* il guscio proietta la stessa fotografia della lastra, e il proiettore
       segue il gruppo: il salone rolla, quindi la posa cambia a ogni
       fotogramma. Una riga qui e nessun secondo padrone. */
    guscio?.aggiornaProiezione?.(1)
    const a = Math.abs(gradi)
    if (a > ACCENDE) {
      calmoDa = 0
      if (sollievoInMoto || sollievoInConsegna || sollievoConcluso) {
        interrompiSollievo({ riarma: true, sfuma: true })
      }
    }
    else if (a < CALMO) calmoDa += dt
    const vuole = calmoDa > CONVINCE ? 0 : (a > ACCENDE ? 1 : q)
    q += (vuole - q) * Math.min(1, dt * VELOCITA)

    if (q >= ARMA_SOLLIEVO) {
      sollievoArmato = true
      preparaSollievo()
    }
    if (vuole === 0 && sollievoArmato && !sollievoInMoto && !sollievoInConsegna) avviaSollievo()

    if (sollievoInMoto && vSollievo) {
      const t = vSollievo.currentTime
      opacitaSollievo = rampa(t, 0, DISSOLVENZA_ENTRA)
    } else if (sollievoInConsegna) {
      opacitaSollievo = 1
    } else if (sollievoConcluso) {
      opacitaSollievo = 0
    } else if (sollievoDaRiavvolgere) {
      opacitaSollievo = Math.max(0, opacitaSollievo - dt / DISSOLVENZA_ENTRA)
      if (opacitaSollievo === 0) {
        sollievoDaRiavvolgere = false
        try { vSollievo.currentTime = 0 } catch {}
      }
    } else opacitaSollievo = 0

    if (tesa) tesa.material.opacity = q * (1 - opacitaSollievo)
    if (sollievo) sollievo.material.opacity = opacitaSollievo
    tesaSegue(q)

    /**
     * IL MARE NON RUOTA PIU'. A ruotare e' la stanza, che e' quello che si
     * vede da dentro una barca: il proprio salotto si inclina, l'orizzonte no.
     * La fotografia e la sua maschera girano insieme, e l'ingrandimento segue
     * l'angolo invece di stare fermo al caso peggiore.
     */
    const inclina = MathUtils.degToRad(gradi)
    const copre = Math.abs(Math.cos(inclina)) + (alt / larg) * Math.abs(Math.sin(inclina))
    for (const t of RUOTANO) {
      t.rotation = inclina
      t.repeat.set(1 / copre, 1 / copre)
    }
    ultimo = gradi
  }

  /** Quanto e' visibile il capitolo. A zero non si disegna affatto. */
  function mostra (v) {
    const o = MathUtils.clamp(v, 0, 1)
    gruppo.visible = o > 0.002
    mare.material.opacity = o
    stanza.material.opacity = o
    mare.material.transparent = o < 0.999
    if (tesa) tesa.material.opacity = q * (1 - opacitaSollievo) * o
    if (sollievo) sollievo.material.opacity = opacitaSollievo * o
  }

  return {
    gruppo, aggiorna, mostra, riproduci, ferma, smonta, profondita,
    /**
     * L'elemento della calma, prestato alla traversata per il finale.
     *
     * NON e' un secondo decodificatore: la traversata gli appende una propria
     * `VideoTexture`, e due tessiture sullo stesso `<video>` costano un solo
     * flusso. Un secondo elemento sarebbe stato mezzo megabyte decodificato due
     * volte per mostrare la stessa stanza.
     */
    videoCalma: vCalma,
    /** La larghezza vera del piano: la camera ci calcola la propria distanza. */
    largo: larg,
    alto: alt,
    get statoSollievo () {
      return {
        armato: sollievoArmato,
        preparato: sollievoPreparato,
        inMoto: sollievoInMoto,
        inConsegna: sollievoInConsegna,
        calmaAllaConsegna,
        concluso: sollievoConcluso,
        daRiavvolgere: sollievoDaRiavvolgere,
        tempo: vSollievo?.currentTime || 0,
        consegnaAttese,
        durata: vSollievo?.duration || 0,
        opacita: opacitaSollievo,
        loop: vSollievo?.loop ?? null
      }
    },
    get rollio () { return ultimo }
  }
}
