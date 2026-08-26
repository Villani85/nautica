import {
  Group, Mesh, Shape, ShapeGeometry, ExtrudeGeometry, BoxGeometry, CylinderGeometry,
  EdgesGeometry, LineSegments, LineBasicMaterial, MeshBasicMaterial, DoubleSide
} from 'three'
import { materiali } from './materiali.js'
import { costruisciGuscio, costruisciPonte, tappoA, sezioneA, tDaZ, PRUA_Z, POPPA_Z } from '../scafo/ordinate.js'
import { costruisciAllestimento } from './allestimento.js'

/** L'opacita' dello spigolo dello scafo: dice dove finisce il pezzo. */
const OPACITA_SPIGOLO = 0.22

/** Sezione maestra dello scafo, estrusa lungo Z — che e' l'asse di rollio. */
function sezioneScafo () {
  const p = new Shape()
  p.moveTo(0, -0.86)
  p.bezierCurveTo(0.72, -0.84, 1.24, -0.66, 1.52, -0.24)
  p.lineTo(1.62, 0.06); p.lineTo(1.50, 0.92); p.lineTo(-1.50, 0.92)
  p.lineTo(-1.62, 0.06); p.lineTo(-1.52, -0.24)
  p.bezierCurveTo(-1.24, -0.66, -0.72, -0.84, 0, -0.86)
  return p
}

/* ────────────────────────────────────────────────────────────────
   IL QUADRILATERO ARTICOLATO

   DIFETTO CORRETTO — prima la pinna ruotava con `perno.rotation.z`, cioe'
   attorno all'asse longitudinale: sbatteva su e giu' come un'ala invece di
   cambiare incidenza. E ruotava l'intero gruppo, corpo dell'attuatore
   compreso, che nella realta' e' imbullonato alla culla e sta fermo. La
   biella era decorativa: un braccio che girava di un fattore inventato (2,1)
   senza toccare niente.

   Sono i due errori che l'unico pubblico capace di accorgersene — un tecnico
   di un produttore di stabilizzatori — vede in due secondi.

   Ora: rotazione attorno all'asse di APERTURA, corpo fisso separato dalla
   parte rotante, e manovella risolta per intersezione di cerchi cosi' che la
   biella resti rigida su tutta la corsa invece di allungarsi.
   ──────────────────────────────────────────────────────────────── */


/**
 * Dato il punto della leva, trova il perno di manovella come intersezione fra
 * il cerchio della manovella (raggio RC attorno a C) e quello della biella
 * (raggio LB attorno a P). Il clamp sulla distanza e' una cintura: con questi
 * parametri non scatta mai — verificato su tutta la corsa — ma se domani
 * qualcuno cambia RL o CY senza rifare i conti, il meccanismo si deforma
 * invece di produrre NaN e sparire dalla scena.
 */
function risolviManovella (py, pz) {
  const dy = py - CY
  const dz = pz - CZ
  let d = Math.sqrt(dy * dy + dz * dz)
  d = Math.max(Math.abs(RC - LB) + 1e-4, Math.min(RC + LB - 1e-4, d))
  const a = (RC * RC - LB * LB + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(0, RC * RC - a * a))
  const uy = dy / d
  const uz = dz / d
  return { y: CY + a * uy - h * uz, z: CZ + a * uz + h * uy }
}

/** Ruotando (0,1,0) attorno a X di φ si ottiene (0, cos φ, sin φ):
 *  quindi per collegare due punti del piano YZ basta φ = atan2(dz, dy). */
function orienta (mesh, ay, az, by, bz) {
  const dy = by - ay
  const dz = bz - az
  mesh.position.y = ay
  mesh.position.z = az
  mesh.rotation.x = Math.atan2(dz, dy)
  mesh.scale.y = Math.sqrt(dy * dy + dz * dz)
}

/** Dove stanno gli stabilizzatori lungo la nave: poco a proravia di mezzo. */
export const Z_PINNE = -1.2

export function costruisciNave () {
  const nave = new Group()
  // Il guscio e' cio' che il piano di sezione taglia via; il meccanismo no —
  // e' quello che resta, ed e' la tesi del sito resa visibile.
  const guscio = []

  /**
   * LO SCAFO E' UN LOFT FRA ORDINATE, non piu' una sezione estrusa.
   * Prua stretta e a V, poppa larga e quasi piatta: una carena vera.
   *
   * Il trucco del tappo esatto sopravvive, e anzi si rafforza: la sezione a
   * una quota qualsiasi e' l'interpolazione fra le due ordinate adiacenti, e
   * `tappoA` la calcola con LA STESSA funzione che genera la superficie.
   * `strumenti/collaudo-scafo.mjs` lo prova a otto quote.
   */
  const geoScafo = costruisciGuscio(72)
  const scafo = new Mesh(geoScafo, materiali.scafo)
  nave.add(scafo); guscio.push(scafo)
  // La faccia interna, disegnata a parte e scura: vedi materiali.interno
  const dentro = new Mesh(geoScafo, materiali.interno)
  nave.add(dentro); guscio.push(dentro)

  /**
   * DIFETTO TROVATO GUARDANDO IL PROVINO: il loft e' un tubo, aperto ai due
   * estremi. Con la camera a +z si guardava dentro lo scafo attraverso lo
   * specchio di poppa e si vedeva l'interno della prua, illuminato dalle sole
   * luci fredde: una macchia verde dove doveva esserci una murata.
   *
   * Le chiusure si generano con la STESSA `tappoA` del piano di sezione. Non
   * e' un espediente: la prua e lo specchio SONO due sezioni, agli estremi.
   */
  for (const z of [PRUA_Z + 0.005, POPPA_Z - 0.005]) {
    const chiusura = new Mesh(tappoA(z), materiali.scafo)
    nave.add(chiusura); guscio.push(chiusura)
  }

  // E il terzo lato aperto: il ponte.
  const ponte = new Mesh(costruisciPonte(72), materiali.coperta)
  nave.add(ponte); guscio.push(ponte)

  // Lo spigolo chiaro e' la stessa idea del taglio applicata al volume:
  // dice dove finisce il pezzo senza aggiungere una luce.
  const geoSpigoli = new EdgesGeometry(geoScafo, 42)
  const spigoli = new LineSegments(
    geoSpigoli,
    new LineBasicMaterial({ color: 0xe9e5dd, transparent: true, opacity: OPACITA_SPIGOLO })
  )
  nave.add(spigoli); guscio.push(spigoli)

  /**
   * ─── QUI C'ERA IL FANTASMA, e l'ha bocciato il committente in una riga:
   * «non mi piace perche' non porta emozioni». Aveva ragione.
   *
   * Era la stessa nave disegnata una seconda volta all'angolo che avrebbe senza
   * pinne: tecnicamente giusto, verificato a zero esatto quando le due corse
   * coincidono, e completamente freddo. **Un fantasma e' un CONFRONTO, e un
   * confronto parla alla testa.** Si guarda una nave da fuori, piccola nel
   * fotogramma: nessuno ha mai avuto il mal di mare guardando una barca dalla
   * riva.
   *
   * E l'errore vero e' stato nella scelta, non nell'esecuzione: ho preso la
   * mossa successiva per ordine del piano invece che per la priorita' dichiarata
   * — prima emozionare, il tecnico dopo.
   *
   * Cosa resta, perche' non era tutto da buttare: S.rollioNudo e
   * strumenti/collaudo-fantasma.mjs. Il numero e' quello che serve al finale
   * dell'atto due, e costa zero perche' la corsa nuda gira comunque.
   *
   * E la versione EMOTIVA della stessa idea esiste, ma non puo' stare qui: e'
   * portare la camera A BORDO, cosi' che a rollare sia il mondo di chi guarda e
   * non un oggetto davanti a lui. Qui e' vietata dalla giunzione — l'orizzonte
   * del canvas deve restare a meta' schermo e orizzontale, altrimenti si stacca
   * dallo sfondo CSS, che e' l'unica idea meccanica del sito. Va sotto la linea,
   * dove D28 dice che il vincolo decade perche' non c'e' piu' giunzione da
   * proteggere.
   */

  /**
   * SOVRASTRUTTURA — appoggiata al ponte, non a una quota scelta a occhio.
   *
   * Col cavallino vero il trincarino sale verso prua di 118 cm su 40 m. Una
   * tuga a quota fissa finisce interrata di 34 cm all'estremita' prodiera e
   * sollevata di 3 a poppa: un difetto misurato, non temuto.
   *
   * Quindi la quota e l'inclinazione si RICAVANO dal ponte alle sue due
   * estremita'. Se domani le ordinate cambiano, o la tuga si allunga verso
   * prua, si riappoggia da sola invece di scollarsi in silenzio.
   */
  const TUGA_Z = 0.6, TUGA_LUNG = 6.2, TUGA_ALT = 0.72
  const zProra = TUGA_Z - TUGA_LUNG / 2
  const zPoppa = TUGA_Z + TUGA_LUNG / 2
  const pontePro = sezioneA(tDaZ(zProra)).ponteY
  const pontePop = sezioneA(tDaZ(zPoppa)).ponteY
  const inclinaz = Math.atan2(pontePro - pontePop, TUGA_LUNG)   // il cavallino sotto la tuga
  const quotaTuga = (pontePro + pontePop) / 2 + TUGA_ALT / 2

  const larghTuga = sezioneA(tDaZ(TUGA_Z)).semilarg * 1.16

  /**
   * IL FINESTRINO E' UN'APERTURA VERA, non una fascia scura dipinta.
   *
   * La regola: cio' che e' diagramma si costruisce, cio' che e' fotografia si
   * vede ATTRAVERSO un'apertura. Perche' la seconda meta' valga, l'apertura
   * deve essere un buco: la tuga si divide in fascia bassa e fascia alta, e
   * fra le due non c'e' niente. Guardando la nave di traverso si passa da un
   * finestrino all'altro e si finisce sull'orizzonte, che sta in coordinate
   * mondo e quindi non rolla con la stanza.
   */
  const H_FIN = 0.26                      // altezza dell'apertura
  const H_BAS = (TUGA_ALT - H_FIN) * 0.42 // parapetto
  const H_ALT = TUGA_ALT - H_FIN - H_BAS  // fascia sopra e tetto

  const basso = new Mesh(new BoxGeometry(larghTuga, H_BAS, TUGA_LUNG), materiali.coperta)
  basso.position.set(0, quotaTuga - TUGA_ALT / 2 + H_BAS / 2, TUGA_Z)
  basso.rotation.x = -inclinaz; nave.add(basso); guscio.push(basso)

  const alto = new Mesh(new BoxGeometry(larghTuga, H_ALT, TUGA_LUNG), materiali.coperta)
  alto.position.set(0, quotaTuga + TUGA_ALT / 2 - H_ALT / 2, TUGA_Z)
  alto.rotation.x = -inclinaz; nave.add(alto); guscio.push(alto)

  /**
   * L'ALLESTIMENTO sta DENTRO la tuga ed e' figlio della nave: rolla con la
   * stanza. L'orizzonte no. Guardando dal finestrino si vedono insieme, ed e'
   * quella differenza la tesi.
   *
   * NON entra nel guscio: il piano di sezione non lo taglia. Se il taglio
   * passasse di li' si vedrebbero due persone sezionate a meta', che e' una
   * cosa che non si fa.
   */
  const allest = costruisciAllestimento(TUGA_Z, quotaTuga - TUGA_ALT / 2, larghTuga)
  allest.gruppo.rotation.x = -inclinaz
  nave.add(allest.gruppo)

  // I montanti: senza, l'apertura legge come una fessura invece che come una
  // vetrata. Sono anche cio' che da' la scala alla sovrastruttura.
  for (let i = -2; i <= 2; i++) {
    const m = new Mesh(new BoxGeometry(larghTuga + 0.01, H_FIN, 0.05), materiali.acciaio)
    m.position.set(0, quotaTuga - TUGA_ALT / 2 + H_BAS + H_FIN / 2, TUGA_Z + i * (TUGA_LUNG / 5.2))
    m.rotation.x = -inclinaz; nave.add(m); guscio.push(m)
  }

  // Nasce con corda in X e apertura in Z; la ruoto una volta sola alla
  // creazione, cosi' l'apertura va fuoribordo e la corda resta longitudinale.
  // Da qui in poi l'unica rotazione che la pinna subisce e' l'incidenza.
  /**
   * ─── IL GRUPPO PINNA NON SI COSTRUISCE PIU' QUI
   *
   * `docs/14-FOTOREALISMO.md` §2: «`impianto.glb` sostituisce completamente il
   * gruppo procedurale». Il quadrilatero manovella-biella-leva e' eliminato: non
   * e' come funziona un attuatore elettrico per pinne, e un tecnico di un
   * costruttore non lo riconoscerebbe. Al suo posto un attuatore elettrico
   * generico con riduttore cicloidale dentro un carter sezionabile.
   *
   * Qui resta soltanto **dove** va agganciato — il ginocchio di carena alla
   * quota delle pinne, interrogando lo scafo invece di scegliere due coordinate
   * a occhio. Se domani le ordinate cambiano, l'aggancio si sposta da solo.
   *
   * Non si mantengono due modelli con un collaudo che tenta di allinearli: e'
   * per questo che il codice se ne va nello stesso commit in cui entra il GLB.
   */
  const sez = sezioneA(tDaZ(Z_PINNE))
  const agganci = [-1, 1].map(lato => ({
    lato,
    posizione: [lato * sez.spigoloX, sez.spigoloY, Z_PINNE]
  }))

  /**
   * LA FACCIA DI SEZIONE, ricalcolata alla quota del piano.
   *
   * Prima era una `Shape` fissa, perche' lo scafo era un'estrusione e la
   * sezione era sempre la stessa. Ora la sezione cambia lungo la nave, quindi
   * il tappo va rigenerato quando il piano si sposta — ma **con la stessa
   * funzione che genera la superficie**, mai con una seconda implementazione.
   *
   * Si rigenera solo oltre una soglia: lo scorrimento arriva decine di volte
   * al secondo e costruire una geometria a ogni evento sarebbe spazzatura.
   */
  const tappo = new Mesh(
    tappoA(POPPA_Z),
    new MeshBasicMaterial({ color: 0xe9e5dd, side: DoubleSide, transparent: true, opacity: 0 })
  )
  tappo.visible = false
  nave.add(tappo)

  let quotaTappo = POPPA_Z
  function spostaTappo (z) {
    const dentro = Math.max(PRUA_Z + 0.01, Math.min(POPPA_Z - 0.01, z))
    if (Math.abs(dentro - quotaTappo) < 0.02) return
    quotaTappo = dentro
    tappo.geometry.dispose()
    tappo.geometry = tappoA(dentro)
  }

  return { nave, agganci, guscio, tappo, spostaTappo }
}
