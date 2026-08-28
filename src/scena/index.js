import {
  Scene, PerspectiveCamera, WebGLRenderer, HemisphereLight, DirectionalLight,
  PointLight, Clock, MathUtils, SRGBColorSpace, ACESFilmicToneMapping, Plane, Vector3,
  PMREMGenerator, Raycaster, PCFSoftShadowMap
} from 'three'
import { costruisciNave, Z_PINNE } from './nave.js'
import { POPPA_Z } from '../scafo/ordinate.js'
import { nebbiaAcqua, ACQUA_SIGMA, ACQUA_COLORE, costruisciAcqua } from './acqua.js'
import { creaImpianto } from './impianto.js'
import { creaSovrastruttura } from './sovrastruttura.js'
import { creaSalone3D } from './salone3d.js'
import { LA_SCENA_E_UNA } from '../regia.js'
import { creaAmbiente, telaAmbiente } from './ambiente.js'
import { applicaAmbiente, materiaDelloScafo} from './materiali.js'
import { costruisciFuoribordo } from './fuoribordo.js'
import { avanza } from '../stato.js'

const RAGGIO = 19.5
const RAGGIO_SEZIONE = 7.2
/** L'ultima battuta: abbastanza vicino da leggere i bulloni della fondazione. */
/**
 * QUANTO SI ALZA LA CAMERA SUL PRIMO PIANO DEL MECCANISMO, in unita' di scena
 * (una unita' = 2,5 m). **Zero**, e non e' un segnaposto: e' il risultato di
 * uno spazzolamento (vedi il commento sulla quota, piu' sotto). La leva resta
 * perche' serve a rifare quella prova in due minuti quando arrivera' il
 * filmato definitivo, non perche' ci sia un numero da trovare qui.
 */
const QUOTA_MECCANISMO = 0
const RAGGIO_MECCANISMO = 2.6
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
   * DIFETTO TROVATO GUARDANDO, E ISOLATO CON UNA PROVA.
   *
   * Questa luce serviva a dare fondo all'acqua profonda. Con lo scafo
   * sezionato pero' si e' trovata DENTRO la carena, e a intensita' 12 con
   * portata 22 ne illuminava l'interno di verde: una cavita' accesa dove
   * doveva esserci buio.
   *
   * Isolata togliendo l'acqua (`?senzaAcqua=1`): il verde restava, quindi non
   * era il mare. Ora e' piu' debole e piu' in basso, e la portata non arriva
   * piu' all'interno dello scafo.
   */
  fondale: 3.2
}

/**
 * `base` e' l'indirizzo da cui pendono gli asset. Arriva da fuori, come nel
 * salone: il sito vive sotto /nautica/ su GitHub Pages e alla radice in locale,
 * quindi un percorso assoluto scritto qui funzionerebbe in un posto solo.
 */
export function creaScena (contenitore, base = import.meta.env.BASE_URL) {
  /** L'ultimo stato passato a `disegna`, per `?ispeziona=1`. */
  let ultimoStato = null
  const scena = new Scene()

  /**
   * Il fulcro di tutto il sito: la camera sta a quota zero e guarda
   * l'orizzonte. Cosi' la linea di galleggiamento cade SEMPRE a meta'
   * schermo esatta, e il fondo CSS puo' spaccarsi al 50% combaciando col
   * disegno senza che niente vada sincronizzato.
   */
  const camera = new PerspectiveCamera(34, 1, 0.1, 120)
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
   * La giunzione resta a zero perche' i colori della carta sono stati
   * RICALCOLATI su questa curva e verificati: vedi --acqua in stile.css.
   * Inseguire il render col foglio di stile e' la strada giusta, perche' il
   * render obbedisce alla fisica e il foglio di stile obbedisce a me.
   */
  render.toneMapping = ACESFilmicToneMapping
  render.toneMappingExposure = 1.0
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

  scena.add(new HemisphereLight(0xe9e5dd, 0x071a1d, LUCI.emisfero))
  const sole = new DirectionalLight(0xfff6e4, LUCI.sole)
  sole.position.set(4.5, 7, 6); scena.add(sole)

  /**
   * ─── LE OMBRE, e perche' non c'erano
   *
   * In tutta la scena non esisteva un `castShadow`. Con tre ponti sovrapposti
   * il risultato si legge come **carta ritagliata**: il ponte superiore non si
   * posa su quello sotto, la murata non lascia niente sulla coperta, e il
   * cervello non riceve l'unico segnale che dice «questi volumi stanno uno
   * davanti all'altro». Nessun materiale e nessun riflesso lo sostituisce.
   *
   * Una sola luce le proietta — il sole. Il controluce e la luce di fondale
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
  const controluce = new DirectionalLight(0x9fd8cc, LUCI.controluce)
  controluce.position.set(-6, 2.5, -4); scena.add(controluce)
  const fondale = new PointLight(0x3fbfa8, LUCI.fondale, 14, 1.6)
  fondale.position.set(0, -9.5, 2.5); scena.add(fondale)

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
  for (const m of guscio) m.material.clippingPlanes = [pianoSezione]

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

  function impostaSpaccato (p) {
    spaccato = MathUtils.clamp(p, 0, 1)
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

  function disegna (sim, marca) {
    ultimoStato = sim.S
    const dt = Math.min(orologio.getDelta(), 0.05)
    frame++
    /**
     * L orologio della scena avanza SEMPRE, anche con movimento ridotto: da
     * lui dipendono le onde e, indirettamente, il ciclo di disegno che fa
     * girare il video del salone. Spegnerlo non faceva un sito piu' calmo,
     * faceva una fotografia. Vedi `simulazione.js`: si riduce, non si spegne.
     */
    t += dt

    // Il passo della simulazione non lo fa piu' questa scena: lo fa `stato.js`,
    // che e' l'unico a sapere se qualcun altro l'ha gia' fatto in questo
    // fotogramma. Il `t` locale resta per le onde, che sono roba di scena.
    avanza(dt, marca)

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
    acqua.chiarisci(spaccato)
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
    uniAcqua.sigma.value = ACQUA_SIGMA * (1 - spaccato)
    // Il fuoribordo E' la manopola dello stato del mare, non un commento su di
    // essa: non puo' contraddire cio' che l'utente controlla.
    fuoribordo.impostaMare(sim.S.mare)

    azimut += (azimutTarget - azimut) * Math.min(1, dt * 5)
    /**
     * Due avvicinamenti in fila, e non uno solo piu' lungo: il primo serve a
     * mostrare che il taglio corre lungo TUTTO lo scafo, e per quello ci vuole
     * distanza; il secondo porta sul pezzo. Interpolare in una volta sola da
     * 19,5 a 2,6 farebbe passare la fase del taglio troppo vicino per
     * leggerla.
     */
    const raggio = MathUtils.lerp(
      MathUtils.lerp(RAGGIO, RAGGIO_SEZIONE, spaccato),
      raggioMeccanismo, avvicinamento)
    const miraX = MathUtils.lerp(0, MIRA_MECCANISMO, spaccato)
    // La camera insegue la sezione anche IN LUNGHEZZA: da mezzanave al
    // meccanismo. La quota resta zero — e' quello che tiene la linea a meta'
    // schermo, e quindi la giunzione col fondo CSS a zero pixel.
    const miraZ = MathUtils.lerp(0, Z_PINNE, spaccato)

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
    camera.position.y = dentroY * (1 - spaccato) + quotaMeccanismo * avvicinamento
    camera.position.z = MathUtils.lerp(tugaZ + dist, fuoriZ, uscita)
    camera.lookAt(
      MathUtils.lerp(scarto, miraX, uscita),
      camera.position.y,
      MathUtils.lerp(tugaZ, miraZ, uscita))

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

    render.render(scena, camera)
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
    window.__nautica = {
      scena, camera, render, nave,
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
      chi (u, v) {
        raggio.setFromCamera({ x: u * 2 - 1, y: -(v * 2 - 1) }, camera)
        return raggio.intersectObjects(scena.children, true).slice(0, 10).map((i) => {
          const m = i.object.material
          return {
            nome: i.object.nome || i.object.name || '(senza nome)',
            tipo: i.object.type,
            materiale: m ? (m.name || '(senza nome)') : '?',
            mappe: m ? ['map', 'aoMap', 'normalMap', 'roughnessMap', 'metalnessMap']
              .filter((k) => m[k]).join('+') || '(nessuna)' : '?',
            ruvidita: m && m.roughness !== undefined ? +m.roughness.toFixed(2) : '?',
            metallo: m && m.metalness !== undefined ? +m.metalness.toFixed(2) : '?',
            uv: i.uv ? [+i.uv.x.toFixed(4), +i.uv.y.toFixed(4)] : null,
            colore: m && m.color ? '#' + m.color.getHexString() : '?',
            lato: m ? m.side : '?',
            distanza: +i.distance.toFixed(2),
            punto: [i.point.x, i.point.y, i.point.z].map((x) => +x.toFixed(2))
          }
        })
      }
    }
  }

  impostaEmersione(1)

  return {
    render, camera, ridimensiona, ruota, disegna,
    impostaSpaccato, impostaEmersione, impostaAvvicinamento, impostaUscita,
    /** Il capitolo si accende e si spegne: i video non decodificano fuori schermo. */
    accendi: () => salone?.riproduci(),
    spegni: () => salone?.ferma(),
    tela: render.domElement
  }
}
