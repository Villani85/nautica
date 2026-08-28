import { Group, MathUtils } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { lavorazione, LAVORAZIONI, campionamento } from './materia.js'

/**
 * L'IMPIANTO — il modello vero, comandato dalla simulazione.
 *
 * Specifica: `docs/14-FOTOREALISMO.md`. Questo file fa le quattro cose che il
 * §2 gli assegna, e nessuna di piu':
 *
 *   1. carica il GLB;
 *   2. applica la conversione di scala al nodo radice;
 *   3. trova i nodi nominati;
 *   4. assegna loro le trasformazioni che vengono dalla simulazione.
 *
 * **Non ricostruisce niente.** Motore, riduttore, albero e pinna sono geometria
 * che arriva dal file: c'e' una sola fonte geometrica, e non si tengono due
 * modelli con un collaudo che tenta di allinearli.
 *
 * ─── LA SCALA E' UNA CONVERSIONE, NON UNA CORREZIONE A OCCHIO
 *
 * Il GLB e' in METRI, perche' la specifica glTF lo impone. La scena nautica
 * interpreta una sua unita' come 2,5 m. Quindi 1/2,5 = 0,4, e quel numero non
 * si tara guardando lo schermo: se il modello sembra sbagliato si cambia il
 * modello, non questa costante. Il §12 lo vieta esplicitamente — «nessuna scala
 * scelta guardando lo schermo».
 *
 * ─── I NOMI DEI NODI SONO UN'API
 *
 * Se un nodo manca, il caricamento fallisce **in modo visibile**: meglio una
 * scena che non parte di una che parte muovendo la cosa sbagliata. E' lo stesso
 * principio dei cancelli — un difetto che non si annuncia e' peggio di uno che
 * ferma tutto.
 */

const METRI_PER_UNITA = 2.5
const UNITA_PER_METRO = 1 / METRI_PER_UNITA     // 0,4

/** §2.1 — il contratto. Questi nomi non si rinominano. */
const RICHIESTI = [
  'STATIC_FOUNDATION', 'STATIC_HULL_PLATE', 'STATIC_SEAL', 'STATIC_MOTOR',
  'HOUSING_FIXED', 'HOUSING_REMOVABLE', 'HOUSING_SECTION',
  'RIG_INPUT', 'RIG_ECCENTRIC', 'RIG_CYCLO_A', 'RIG_CYCLO_B',
  'RIG_OUTPUT', 'RIG_SHAFT', 'RIG_FIN'
]

/**
 * §3.2 — il rapporto e l'eccentricita' vengono dal GLB, non da qui.
 * Sono proprieta' del modello: leggerle da `extras` invece di riscriverle
 * significa che cambiando il modello non resta un numero vecchio in un file JS
 * a raccontare un'altra macchina.
 */
/** Quanto riflette la macchina: sta in sentina, non in coperta. Vedi il traverse. */
const INTENSITA_AMBIENTE = 0.55

/** Quanto si sfila il coperchio, in metri del modello. Vedi `apri()`. */
const CORSA_COPERCHIO = 0.45

/**
 * ═══ §4.2 · LA CORSA DEL COPERCHIO HA UNA DURATA, E QUINDI UNA REGOLA
 *
 * Il §4.2 prescrive che `HOUSING_REMOVABLE` si separi «in 0,9-1,2 s» e che
 * «massa e inerzia si sentano nell'easing, senza rimbalzo elastico». Una
 * durata non e' una decorazione: e' cio' che distingue un pezzo d'acciaio da
 * un cursore. Un coperchio mappato sullo scorrimento segue il dito, e un
 * coperchio che segue il dito non pesa niente — puo' aprirsi in 80 ms o in
 * dieci secondi a seconda di come si gira la rotella, e nessuna delle due
 * cose e' un pezzo meccanico.
 *
 * ─── IL CONFLITTO VERO, che non e' l'easing
 *
 * Il sito ha un contratto forte: **lo scorrimento e' il padrone unico** della
 * posizione del racconto (D27: si puo' tornare indietro, nessun gesto rubato).
 * Un oggetto con una durata propria smette di essere una funzione dello
 * scorrimento e diventa uno STATO. E uno stato, a differenza di una funzione,
 * puo' trovarsi in configurazioni che nessuna posizione di scorrimento
 * giustifica: un coperchio a mezz'aria per sempre, o che sbatte avanti e
 * indietro se l'utente oscilla con la rotella.
 *
 * ─── LA REGOLA SCELTA, in tre righe
 *
 *   1. lo scorrimento non da' piu' la POSIZIONE del coperchio: da' il COMANDO,
 *      e il comando ha due soli valori — chiuso, aperto. Non esiste «aperto al
 *      40%» come destinazione: il 40% e' solo un istante di passaggio;
 *   2. il comando cambia con ISTERESI: apre a `spaccato >= 0,55`, chiude solo
 *      sotto `0,42`; in mezzo resta quello di prima;
 *   3. fra il comando e la posizione c'e' una corsa a durata fissa, con un
 *      profilo monotono che parte da fermo e arriva da fermo.
 *
 * ─── PERCHE' QUESTA, e cosa esclude
 *
 * **Perche' un comando binario e non una posizione.** Se il target potesse
 * essere 0,4, allora 0,4 sarebbe uno stato di equilibrio: il coperchio si
 * fermerebbe li' e ci resterebbe. Con due soli target ogni configurazione
 * intermedia e' per costruzione TRANSITORIA — la corsa continua a integrare
 * fino a un estremo, sempre, comunque si muova lo scorrimento. Lo stato
 * impossibile «a meta' per sempre» non e' improbabile: e' irrapresentabile.
 *
 * **Perche' l'isteresi.** Senza, il comando cambierebbe a ogni attraversamento
 * di una soglia unica, e un utente che assesta l'inquadratura intorno a quel
 * punto — cosa che fa, perche' e' esattamente li' che il taglio arriva al
 * carter e c'e' qualcosa da guardare — otterrebbe un coperchio che oscilla.
 * La banda e' larga 0,13 di `spaccato`, cioe' molto piu' di un colpo di
 * rotella: per richiudere bisogna tornare indietro con INTENZIONE, non
 * sfiorare la soglia. L'apertura resta dove il §4.2 la mette (il taglio ha
 * raggiunto il carter); e' la chiusura ad allontanarsi.
 *
 * **Perche' l'inversione a meta' e' permessa.** L'alternativa — ignorare il
 * comando finche' la corsa non e' finita — non produce stati impossibili ma
 * ne produce uno assurdo: il coperchio che continua ad aprirsi mentre lo
 * scafo si e' gia' richiuso, perche' un'animazione partita un secondo fa deve
 * finire. Il padrone resta lo scorrimento: se torna indietro, il pezzo torna
 * indietro. Torna indietro DA DOVE SI TROVA, non da uno stato speculare, e
 * ci torna passando per una decelerazione (vedi la rampa qui sotto): non
 * sbatte, rallenta e rientra.
 *
 * **Cosa NON e' stato scelto.** Il cricchetto monotono di `regia.js` (il mare
 * che sale e non scende) qui sarebbe rotto: un coperchio che resta sfilato
 * mentre il carter si richiude e' un pezzo a mezz'aria dentro uno scafo
 * intero. E nemmeno una molla smorzata: converge senza rimbalzo, ma la sua
 * durata non e' un numero, e' una soglia scelta a posteriori — mentre il §4.2
 * prescrive proprio un numero.
 *
 * ─── IL PROFILO, che e' una formula e non una taratura a occhio
 *
 *   E(u) = 1 - (1-u)^n · (1 + n·u)        E'(u) = n(n+1) · u · (1-u)^(n-1)
 *
 * Tre proprieta' si leggono nella derivata, non si verificano guardando lo
 * schermo: E'(0) = 0 (parte da fermo: nessuno scatto iniziale), E'(1) = 0 per
 * n > 1 (arriva da fermo), e E' >= 0 ovunque, quindi E e' MONOTONA e non
 * supera mai 1 — il «senza rimbalzo elastico» del §4.2 e' garantito dalla
 * forma della curva, non da un parametro che qualcuno ha smesso di alzare
 * quando l'overshoot non si vedeva piu'.
 *
 * Il picco di velocita' cade a u = 1/n. Con n = 3 il pezzo impiega il primo
 * terzo della corsa a prendere velocita' e gli ultimi due terzi a posarsi:
 * e' l'asimmetria che si legge come massa. Con n = 2 la formula diventa la
 * smoothstep, simmetrica — la stessa `dolce` di `regia.js`, che va benissimo
 * per un progresso e non dice niente su un pezzo di ghisa.
 *
 * Questa famiglia e' la versione a supporto finito della risposta di un
 * secondo ordine criticamente smorzato: stessa forma, stesso «non rimbalza»,
 * ma con una fine che arriva a un istante dichiarato invece che asintotico.
 *
 * ─── LA RAMPA, che serve all'inversione e regala la partenza
 *
 * La fase `u` non viene spinta di colpo a velocita' di regime: la velocita' di
 * fase insegue il suo obiettivo con costante `CORSA_RAMPA`. Senza, invertire
 * il comando a meta' corsa ribalterebbe il segno della velocita' in un
 * fotogramma — un colpo, cioe' accelerazione infinita, cioe' massa zero
 * proprio nel momento in cui la massa dovrebbe sentirsi. Con la rampa
 * l'inversione e' una frenata seguita da una ripartenza, e la partenza da
 * fermo diventa ancora piu' pigra. Il prezzo e' che la durata reale non e'
 * `CORSA_DURATA` ma qualcosa di piu': **e' misurata**, non dedotta, da
 * `riferimenti/carter/corsa.mjs`, ed e' li' che i numeri vanno letti.
 *
 * La rampa vale un settimo della durata. Piu' corta lascia in piedi un
 * gradino di velocita' all'inversione; molto piu' lunga fa un'altra cosa —
 * il profilo smette di essere E(u) e diventa quello del filtro, cioe' la
 * curva scritta qui sopra non descrive piu' il movimento che si vede.
 *
 * ─── UN NUMERO CHE HO MISURATO E UNA SOGLIA CHE AVEVO INVENTATO
 *
 * Invertire il comando a meta' corsa costa ~3,6 volte l'accelerazione di
 * un'apertura pulita, e il primo cancello che avevo scritto bocciava tutto
 * cio' che stesse sopra 2x. Era la mia ipotesi sul difetto travestita da
 * misura: nessuna rampa ragionevole scende sotto 3x, perche' in inversione la
 * velocita' deve cambiare del DOPPIO e per giunta nel punto in cui E'(u) e'
 * massimo. Il rapporto alto non e' il difetto — e' la fisica del gesto.
 *
 * Il cancello vero e' un altro, e non l'ho scelto io: un colpo e' una
 * DISCONTINUITA' di velocita', e una discontinuita' si riconosce perche'
 * l'accelerazione misurata cresce insieme al frame rate. Qui da 60 a 1000 fps
 * cresce del 4% e si ferma: e' un valore finito, cioe' una frenata.
 */
const CORSA_DURATA = 0.88      // s di fase nominale; la durata VERA la misura il provino
const CORSA_RAMPA = 0.14       // s, costante della rampa di velocita' di fase
const CORSA_ORDINE = 3         // n: il picco di velocita' cade a 1/n della corsa
const CORSA_APRE = 0.55        // soglia di `spaccato` che comanda l'apertura (§4.2 punto 1)
const CORSA_CHIUDE = 0.42      // e quella, piu' bassa, che comanda la chiusura
const CORSA_DT_MAX = 0.05      // stesso tetto del ciclo di disegno: una scheda nascosta non salta

/** §4.2 · il profilo della corsa. Vedi la nota sopra per il perche' di questa forma. */

export function profiloCorsa (u, n = CORSA_ORDINE) {
  const q = u <= 0 ? 0 : u >= 1 ? 1 : u
  return 1 - Math.pow(1 - q, n) * (1 + n * q)
}

/**
 * La derivata del profilo, in forma chiusa. Non serve alla scena: serve al
 * provino per confrontare la velocita' OSSERVATA con quella che la formula
 * dichiara. Un metro che non si controlla contro niente misura anche quando e'
 * rotto — e qui l'ho gia' pagata una volta, con l'eccentricita'.
 */
export function velocitaProfilo (u, n = CORSA_ORDINE) {
  const q = u <= 0 ? 0 : u >= 1 ? 1 : u
  return n * (n + 1) * q * Math.pow(1 - q, n - 1)
}

const stretta = (x, a, b) => x < a ? a : x > b ? b : x

/**
 * ─── LA CORSA, separata dal modello di proposito
 *
 * Qui dentro non c'e' three, non c'e' il GLB e non c'e' un nodo: c'e' solo la
 * legge che porta uno scorrimento a una posizione fra 0 e 1. E' una funzione
 * pura di (stato, scorrimento, dt), quindi si puo' MISURARE in Node senza
 * aprire un browser, senza caricare 161 KB di modello e senza una scheda
 * grafica che disegni in software raccontando numeri che non sono quelli del
 * sito. Il provino importa questa, non una copia: due copie della stessa legge
 * sono due leggi che un giorno divergono.
 */
export function creaCorsaCoperchio (opzioni = {}) {
  const durata = opzioni.durata ?? CORSA_DURATA
  const rampa = opzioni.rampa ?? CORSA_RAMPA
  const ordine = opzioni.ordine ?? CORSA_ORDINE
  const apre = opzioni.apre ?? CORSA_APRE
  const chiude = opzioni.chiude ?? CORSA_CHIUDE

  let u = 0            // fase temporale della corsa, 0 chiuso, 1 aperto
  let v = 0            // velocita' di fase, 1/s
  let comando = 0      // 0 chiuso, 1 aperto: e' cio' che dice lo scorrimento
  let agganciato = false

  function passo (scorrimento, dt) {
    const s = Number.isFinite(scorrimento) ? scorrimento : 0
    if (s >= apre) comando = 1
    else if (s <= chiude) comando = 0
    // fra le due soglie il comando resta quello di prima: e' l'isteresi

    /**
     * IL PRIMO FOTOGRAMMA NON ANIMA — si aggancia.
     *
     * Ricaricando la pagina con lo scorrimento gia' dentro la fase del taglio
     * (o rientrando in una sessione ripristinata) la corsa partirebbe da
     * chiuso e farebbe un secondo di apertura che nessuno ha chiesto: un
     * movimento che non e' conseguenza di un gesto. E' lo stesso principio per
     * cui la posa del riduttore si riconcilia con l'angolo assoluto invece di
     * integrare da zero.
     */
    if (!agganciato) {
      agganciato = true
      u = comando
      v = 0
      return profiloCorsa(u, ordine)
    }

    const dts = stretta(Number.isFinite(dt) ? dt : 0, 0, CORSA_DT_MAX)
    const obiettivo = (comando ? 1 : -1) / durata
    // rampa esponenziale: indipendente dal frame rate, e non un lerp con un
    // coefficiente per fotogramma, che a 144 Hz farebbe un'altra animazione
    v += (obiettivo - v) * (1 - Math.exp(-dts / rampa))
    u = stretta(u + v * dts, 0, 1)
    // arrivato: si ferma. Se poi il comando inverte, riparte da fermo — che e'
    // anche il motivo per cui non c'e' rimbalzo agli estremi
    if ((u <= 0 && v < 0) || (u >= 1 && v > 0)) v = 0
    return profiloCorsa(u, ordine)
  }

  return {
    passo,
    get q () { return profiloCorsa(u, ordine) },
    get u () { return u },
    get v () { return v },
    get comando () { return comando },
    get inMoto () { return comando ? u < 1 : u > 0 },
    /** Rimette la corsa allo stato di primo fotogramma. Serve al provino. */
    riavvia () { u = 0; v = 0; comando = 0; agganciato = false }
  }
}

const RAPPORTO_DI_SCORTA = 29
const ECCENTRICITA_DI_SCORTA = 0.012

/**
 * ─── UN NUMERO CHE SI MISURA DA UNA COSA CHE NON LO CONTIENE
 *
 * Qui prima c'era una misura, e l'argomento sembrava buono: «l'eccentricita' e'
 * lo spostamento del disco rispetto all'asse, il modello ce l'ha gia' dentro,
 * copiarla a mano vuol dire vederla divergere un giorno». Giusto in generale,
 * falso per questo pezzo.
 *
 * Il disco cicloidale e' modellato **centrato sull'asse**: i suoi 29 lobi
 * girano intorno all'origine del proprio nodo. L'orbita da 12 mm non sta nella
 * geometria — la impone questo file, a ogni fotogramma, muovendo il nodo. Il
 * `boundingSphere` di quel disco non restituiva l'eccentricita': restituiva
 * l'**asimmetria residua dei lobi**, 0,0005 m. Un numero plausibile, mai
 * esattamente zero, quindi il ripiego `|| ECCENTRICITA` non e' mai scattato.
 * Risultato: i dischi orbitavano di mezzo millimetro invece di dodici, cioe'
 * il riduttore si vedeva come una scatola chiusa — e nessun cancello lo diceva,
 * perche' il valore c'era ed era finito.
 *
 * E' la stessa famiglia di guasti gia' incontrata piu' volte: **uno strumento
 * restituisce un numero e non avvisa che e' rotto.** La differenza qui e' che
 * lo strumento ero io.
 *
 * Ora il numero viene da `extras`, come il rapporto, perche' e' una **proprieta'
 * dichiarata della macchina** e non una conseguenza della sua forma. Il timore
 * che divergesse resta valido, ed e' per questo che vive nel GLB accanto al
 * raggio del disco: `collaudo-glb.mjs` li confronta e si arrabbia se l'orbita
 * torna a essere troppo piccola per vedersi.
 */

/**
 * `opzioni` e' in coda e ha un default: le due chiamate che esistono oggi
 * continuano a funzionare senza toccarle. Serve solo per tarare la corsa del
 * coperchio da un provino — nel sito non si passa, e i valori buoni stanno
 * nelle costanti qui sopra.
 */
export function creaImpianto (base, ambiente = null, opzioni = {}) {
  const gruppo = new Group()
  const nodi = {}
  let rapporto = RAPPORTO_DI_SCORTA
  let dati = {}
  let eccentricita = ECCENTRICITA_DI_SCORTA
  let pronto = false
  /** §4.2 — la corsa del coperchio: uno stato per impianto, non uno globale. */
  const corsa = creaCorsaCoperchio(opzioni.corsa)

  const caricato = new Promise((risolvi, rifiuta) => {
    /**
     * MESHOPT — il modello viaggia compresso: 921 KB diventano 247, e 161
     * una volta che il server applica brotli.
     * Il decodificatore e' un modulo ES da 28 KB che entra nel pacchetto, non un
     * file da servire a parte: e' la ragione per cui ha battuto Draco, che
     * comprimeva quasi uguale ma chiedeva 251 KB di wasm serviti a mano.
     * Le misure stanno in `strumenti/comprimi-modello.mjs`.
     */
    new GLTFLoader()
      .setMeshoptDecoder(MeshoptDecoder)
      .load(base + 'modelli/impianto.glb', (glb) => {
      const radice = glb.scene
      radice.updateMatrixWorld(true)
      radice.traverse(o => { if (o.name) nodi[o.name] = o })

      const mancanti = RICHIESTI.filter(n => !nodi[n])
      if (mancanti.length) {
        rifiuta(new Error(
          `impianto.glb: mancano i nodi ${mancanti.join(', ')}. ` +
          'I nomi sono il contratto di docs/14 §2.1 e non si rinominano.'))
        return
      }

      const extra = nodi.IMPIANTO?.userData ?? {}
      dati = extra
      if (extra.authoringUnit && extra.authoringUnit !== 'meter') {
        rifiuta(new Error(
          `impianto.glb: authoringUnit e' "${extra.authoringUnit}", non "meter". ` +
          'La conversione 0,4 vale solo per un modello in metri.'))
        return
      }
      if (typeof extra.gearRatio === 'number') rapporto = extra.gearRatio

      if (typeof extra.eccentricityM === 'number') eccentricita = extra.eccentricityM

      /**
       * IL FASCIAME DEL MODELLO NON SI MOSTRA IN SCENA.
       *
       * `STATIC_HULL_PLATE` e' una lastra 2,6 x 2,2 m: serve quando il GLB si
       * rende da solo, per dire dove sta la macchina e per dare al taglio
       * qualcosa da attraversare. Nel sito lo scafo c'e' gia', ed e' quello
       * vero, con le sue ordinate — quindi qui la lastra e' un doppione che
       * copre mezza inquadratura. Visto succedere: sembrava che il meccanismo
       * fosse a mezz'aria sopra la coperta.
       *
       * Resta nel file invece di sparire, perche' il modello deve poter essere
       * guardato anche fuori dal sito: e' la stessa ragione per cui la scena 3D
       * del salone e' rimasta come sorgente delle sagome.
       */
      nodi.STATIC_HULL_PLATE.visible = false

      /**
       * ─── L'AMBIENTE VA DATO A QUESTI MATERIALI, UNO PER UNO
       *
       * `applicaAmbiente` in `materiali.js` serve i materiali del sito per
       * nome. I materiali del GLB non sono fra quelli: arrivano dal file, si
       * chiamano carena, carter, acciaio, lucido, motore, tenuta, gomma, cavo.
       * Senza mappa, un `metalness: 1` non ha NIENTE da riflettere e viene
       * fuori plastica grigia — che e' esattamente come si vedeva il
       * meccanismo piu' dettagliato del sito, mentre lo scafo intorno
       * rifletteva.
       *
       * NON si usa `scena.environment`: il §12 lo vieta su questa scena,
       * perche' illuminerebbe anche l'acqua e il fondo, che hanno il loro
       * colore e non devono prenderlo da altrove. Per materiale e' la strada
       * sanzionata, ed e' anche l'unica che permette di dosare l'intensita'
       * pezzo per pezzo.
       *
       * L'intensita' e' meno di uno perche' questa roba sta DENTRO uno scafo:
       * un riduttore in sentina non riflette il cielo come una prua. Il valore
       * pieno l'ho guardato e legge come cromatura da concessionaria.
       */
      /**
       * ─── LA MATERIA, prima dell'ambiente
       *
       * §7 mette in cima alle regole di resa la variazione di rugosita', e il
       * GLB la porta costante — debito dichiarato nel builder, in attesa della
       * cottura delle mappe. Nel frattempo il capitolo fa un primo piano vero,
       * a 2,6 unita', e li' una rugosita' uniforme e' l'indizio numero uno di
       * sintetico. Si applica per NOME, perche' non tutti i pezzi sono torniti:
       * vedi `materia.js`.
       */
      radice.traverse(o => {
        const m = o.material
        if (!m) return
        for (const mat of Array.isArray(m) ? m : [m]) {
          // `?materia=0` la spegne: serve a poterla CONFRONTARE invece che
          // dichiararla, ed e' cosi' che si e' misurato che fa qualcosa
          const ricetta = LAVORAZIONI[mat.name]
          if (ricetta && !location.search.includes('materia=0')) lavorazione(mat, ricetta)
          campionamento(mat)
        }
      })

      if (ambiente) {
        radice.traverse(o => {
          const m = o.material
          if (!m) return
          for (const mat of Array.isArray(m) ? m : [m]) {
            if (!('envMap' in mat)) continue
            mat.envMap = ambiente
            mat.envMapIntensity = INTENSITA_AMBIENTE
            mat.needsUpdate = true
          }
        })
      }

      radice.scale.setScalar(UNITA_PER_METRO)
      gruppo.add(radice)
      pronto = true
      risolvi({ nodi, rapporto, eccentricita })
    }, undefined, rifiuta)
  })

  /**
   * ─── IL MOVIMENTO VIENE DALLA FISICA, NON DA UN'ANIMAZIONE
   *
   * `S.pinna` e' l'angolo autoritativo dell'uscita, gia' in radianti. Tutto il
   * resto discende da li' con la cinematica vera del riduttore: l'ingresso gira
   * `rapporto` volte piu' in fretta e nel verso opposto, i dischi orbitano
   * sfasati di 180 gradi.
   *
   * Si usa l'angolo ASSOLUTO e non l'integrazione di `S.pinnaVel`: una velocita'
   * non e' un angolo, e integrarla accumula deriva. Con l'angolo assoluto la
   * posa e' sempre riconciliata con lo stato vero, anche rientrando nella scena.
   */
  function aggiorna (S) {
    if (!pronto) return
    const uscita = S.pinna
    const ingresso = -rapporto * uscita

    nodi.RIG_FIN.rotation.x = uscita
    nodi.RIG_SHAFT.rotation.x = uscita
    nodi.RIG_OUTPUT.rotation.x = uscita
    nodi.RIG_INPUT.rotation.x = ingresso

    // i dischi ORBITANO — e' il movimento che rende visibile la catena — e
    // contro-ruotano piano con l'uscita
    const e = eccentricita
    nodi.RIG_CYCLO_A.position.set(0, e * Math.cos(ingresso), e * Math.sin(ingresso))
    nodi.RIG_CYCLO_B.position.set(0, e * Math.cos(ingresso + Math.PI), e * Math.sin(ingresso + Math.PI))
    nodi.RIG_CYCLO_A.rotation.x = uscita
    nodi.RIG_CYCLO_B.rotation.x = uscita
  }

  /**
   * §4.2 — IL COPERCHIO SI ALLONTANA LUNGO LA NORMALE DEL TAGLIO, E LA NORMALE
   * NON E' QUELLA CHE SEMBRA.
   *
   * Prima: `position.y`. Sbagliato, e in un modo che a schermo si legge male
   * senza sapere perche' — il coperchio SCENDEVA attraverso la parte fissa
   * invece di sfilarsi, come una saracinesca dentro il proprio telaio.
   *
   * Il taglio, in Blender, e' un piano Y: il parallelepipedo che scava la meta'
   * sta in `(-0.44, -0.42, 0)` e porta via tutto cio' che ha y < -0,02. Ma
   * l'esportatore glTF converte in Y-alto, quindi la Y di Blender diventa la
   * **-Z di glTF**. Misurato invece che dedotto: il centroide della meta'
   * tagliata sta a y = +0,161 in Blender e a z = -0,143 dopo l'esportazione.
   *
   * La corsa e' 0,45 m — poco piu' del raggio esterno del carter (0,306), cioe'
   * quanto basta perche' il pezzo sia libero e si legga staccato. I 0,9 di
   * prima lo mandavano tre diametri lontano, fuori da ogni inquadratura utile.
   */
  function apri (quanto) {
    if (!pronto) return
    const q = MathUtils.clamp(quanto, 0, 1)
    nodi.HOUSING_REMOVABLE.position.z = -q * CORSA_COPERCHIO
    nodi.HOUSING_REMOVABLE.visible = q < 0.999
  }

  /**
   * §4.2 · LA CORSA, collegata al ciclo di disegno.
   *
   * Questa e' la funzione che il ciclo deve chiamare al posto di
   * `apri(mappa(spaccato))`. Riceve lo scorrimento GREZZO — lo stesso
   * `spaccato` di prima, non una rampa gia' costruita fuori — perche' la legge
   * che porta dallo scorrimento alla posizione e' una sola e sta qui: se la
   * soglia vive in un file e la durata in un altro, un giorno raccontano due
   * macchine diverse.
   *
   * `apri()` resta esattamente com'era e non e' deprecata: e' il
   * posizionamento diretto, quello che serve a un provino, a un collaudo o a
   * un fotogramma di riferimento che vuole il coperchio a un'apertura decisa
   * da lui. La corsa lo usa, non lo sostituisce.
   */
  function avanzaCoperchio (scorrimento, dt) {
    const q = corsa.passo(scorrimento, dt)
    apri(q)
    return q
  }

  return {
    gruppo,
    caricato,
    aggiorna,
    apri,
    avanzaCoperchio,
    /** Lo stato della corsa, per i cancelli e per il provino. Sola lettura. */
    get coperchio () {
      return { q: corsa.q, u: corsa.u, v: corsa.v, comando: corsa.comando, inMoto: corsa.inMoto }
    },
    get pronto () { return pronto },
    // Esposti perche' `collaudo-cinematica.mjs` confronti il moto osservato
    // con cio' che il GLB dichiara, invece di riscrivere qui i numeri: due
    // copie dello stesso valore sono due valori che un giorno divergono.
    get rapporto () { return rapporto },
    get eccentricita () { return eccentricita },
    get dati () { return dati }
  }
}
