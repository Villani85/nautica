import { Box3, MathUtils, Sphere, Vector3 } from 'three'

/**
 * IL FINALE — le due persone tornano, e le hai inclinate tu.
 *
 * Questo modulo NON e' collegato da nessuno. Lo collega chi lo ha letto: le
 * righe da toccare in `index.js` e in `regia.js` stanno in `docs/20-FINALE.md`,
 * elencate una per una. Finche' nessuno lo importa, il sito e' esattamente
 * quello di prima.
 *
 * ─── COSA FA, IN UNA RIGA
 *
 * Con la lama ferma sul meccanismo, riporta in quadro il salone — lo STESSO
 * gruppo, gli STESSI due video, la STESSA `aggiorna()` — appeso alla camera,
 * nella fascia alta del fotogramma; e toglie il congelamento del rollio, cosi'
 * lo scafo torna a muoversi sotto chi guarda. Poi non fa piu' niente: chi
 * spegne lo stabilizzatore vede la stanza inclinarsi perche' l'integratore
 * diverge, non perche' qui ci sia una riga che lo dice.
 *
 * **Questo modulo non scrive mai l'inclinazione.** Non c'e' nessuna
 * assegnazione a `rotation` che dipenda dal rollio, e non c'e' nessun
 * addolcimento sull'angolo. Se un giorno ce ne fosse una, il cancello del §5
 * di `docs/13` diventerebbe rosso — ed e' l'unico modo in cui puo' diventarlo.
 *
 * ─── PERCHE' UNA LASTRA E NON UNA FINESTRA VERA — misurato, non preferito
 *
 * Il salone sta a `(0, 1.453, 0.6)`, il meccanismo a `(1.346, -0.262, -1.2)`.
 * Tre fatti, tutti verificati sul modello:
 *
 *  1. **Dal primo piano il salone non e' in quadro, e nessun trascinamento ce
 *     lo porta.** A raggio 2,6 e azimut 0,34 il suo rilevamento vero e' 52,6°
 *     a babordo e 48,5° in alto, contro un semicampo di 28,5° x 17,0° su 16:9
 *     e **8,0° x 17,0° su un telefono**. Sull'intera corsa dell'azimut
 *     (±0,92 rad) resta fra 41° e 61° di lato e fra 28° e 76° in alto.
 *  2. **Arretrare costa il meccanismo.** La stazione piu' vicina in cui salone
 *     e meccanismo stanno tutti e due dentro un 16:9 e' a **5,85 unita'**
 *     invece di 2,55: il pezzo diventa 2,3 volte piu' piccolo. Su un telefono
 *     non esiste nessuna stazione, perche' il semicampo orizzontale e' 8,0° e
 *     il salone non scende mai sotto i 41° di lato.
 *  3. **La sezione non puo' contenerli tutti e due.** Il piano di taglio e'
 *     trasversale, `Plane(0,0,-1, C)`, e tiene `z < C`. Il meccanismo si legge
 *     solo quando la lama arriva a `C = -0,65`; a quel punto il salone, che sta
 *     a `z = +0,6`, e' **dentro la fetta che e' stata tolta**. Una lama che
 *     risparmi il salone (`C >= +0,65`) lascia il meccanismo dentro cinque
 *     unita' di scafo intatto. Non e' una scelta di regia: e' il piano.
 *
 * Quindi la posizione non puo' essere vera e la scala nemmeno. Restano vere
 * **l'assetto** e **il contenuto**, e sono le due che contano. Il modulo le
 * tiene vere e dichiara false le altre due, invece di far finta.
 *
 * ─── E IL RILEVAMENTO FINTO E' STATO PROVATO E SCARTATO
 *
 * L'idea di mettere la lastra «nel verso in cui la tuga sta davvero»,
 * comprimendo il rilevamento vero dentro la fascia alta, sembra piu' onesta ed
 * e' peggio: misurando il rilevamento lungo un ciclo di rollio a azimut −0,40
 * passa da −7,5° a −59,4°, e attraversando l'azimut cambia SEGNO (a −0,92 il
 * salone e' a dritta, a 0,00 e' a babordo). Una lastra che segue quel numero
 * scivola per mezzo fotogramma e poi salta da una parte all'altra: si legge
 * come un guasto, non come una direzione. La lastra sta al centro, e il verso
 * non lo rivendica nessuno.
 */

/**
 * LE COSTANTI, E DA DOVE VENGONO. Nessuna e' stata scelta guardando lo
 * schermo — `docs/14 §12.6` lo vieta, e vale anche qui.
 */
export const COSTANTI = {
  /**
   * Il margine attorno alla lastra, per lato, in frazione della fascia
   * disponibile. Non e' un numero nuovo: e' quello che il salone usa gia' per
   * staccarsi dai bordi della tuga — `salone3d.js` lo dimensiona a
   * `tuga.alt * 0.86`, cioe' 14% di struttura, 7% per lato.
   */
  MARGINE: 0.07,
  /**
   * Con che velocita' si apre. E' la stessa di `salone3d.js` (`VELOCITA = 8`,
   * cioe' una costante di tempo di 125 ms) per una ragione sola: il capitolo
   * non deve avere due dissolvenze di velocita' diverse.
   *
   * SI ADDOLCISCE L'APERTURA, MAI L'INCLINAZIONE. E' la riga che tiene verde
   * il cancello: un `lerp` sull'angolo lo farebbe restare indietro di qualche
   * centesimo di grado, e il cancello del §5 chiede 0,05°.
   */
  VELOCITA_APERTURA: 8,
  /** Sotto questa apertura non si disegna e il gruppo torna alla nave. */
  SOGLIA: 0.002,
  /**
   * Il picco di rollio nudo piu' alto che il sito sappia produrre, MISURATO
   * integrando 200 s a mare 5, 12 nodi, stabilizzatore spento, seme 7:
   * **12,40°** (mare 4: 9,92°, mare 3: 7,44°; con movimento ridotto un terzo).
   * Serve solo a dire quanto il meccanismo scappa dal centro del fotogramma —
   * non entra in nessun calcolo dell'inclinazione.
   */
  ROLLIO_NUDO_MASSIMO: 12.4
}

const clamp01 = (x) => MathUtils.clamp(Number.isFinite(x) ? x : 0, 0, 1)

/**
 * IL CONGELAMENTO DEL ROLLIO SI TOGLIE, e questa e' la funzione che lo dice.
 *
 * Oggi `index.js` scrive `nave.rotation.z = degToRad(rollio) * (1 - spaccato)`,
 * con la nota «non si seziona un oggetto in movimento». La regola vale mentre
 * la lama ENTRA — un disegno tecnico e' fermo — e smette di valere quando il
 * taglio e' fatto e si guarda il pezzo lavorare: li' la nave che non si muove
 * e' l'unica cosa falsa nell'inquadratura.
 *
 * E non e' un vezzo: senza questa riga il cancello e' rosso per costruzione.
 * A `spaccato = 1` lo scafo verrebbe disegnato dritto mentre la stanza sopra
 * si inclina di theta — 12,4 gradi di disaccordo al picco.
 *
 * @param {number} spaccato quanto e' aperta la sezione, 0-1
 * @param {number} f        quanto e' avanti il finale, 0-1
 * @returns {number} il moltiplicatore da applicare al rollio. A `f = 0`
 *   restituisce esattamente `1 - spaccato`, cioe' il comportamento di oggi.
 */
export function fattoreRollio (spaccato, f) {
  return 1 - clamp01(spaccato) * (1 - clamp01(f))
}

/**
 * QUANTO E' VISIBILE IL SALONE, tenendo conto di tutti e due i padroni.
 *
 * `index.js` calcola gia' `1 - clamp((uscita - 0.62) / 0.30, 0, 1)`: e' la
 * dissolvenza dell'uscita, e alla battuta del meccanismo vale zero. Il finale
 * non la sostituisce — la scavalca dal basso. A `f = 0` il risultato e'
 * identico a quello di oggi, bit per bit.
 */
export function visibilitaSalone (daUscita, f) {
  return Math.max(clamp01(daUscita), clamp01(f))
}

/** Un passo di apertura. Puro, cosi' si prova senza un browser. */
export function passoApertura (a, voluta, dt, velocita = COSTANTI.VELOCITA_APERTURA) {
  const k = Math.min(1, Math.max(0, dt) * velocita)
  return clamp01(a) + (clamp01(voluta) - clamp01(a)) * k
}

/**
 * LA FASCIA ALTA — quello che resta sopra il meccanismo.
 *
 * La regola e' una sola e non ha numeri dentro: **la lastra non puo' coprire
 * il meccanismo.** Si proietta l'ingombro dell'impianto, si prende il suo
 * bordo alto, e la lastra vive fra quel bordo e il bordo alto del fotogramma,
 * rientrando del margine.
 *
 * Cosi' la dimensione non si sceglie: cambia da sola con il rapporto dello
 * schermo, con il campo visivo e con la distanza — che e' esattamente cio' che
 * `docs/14 §12.6` chiede quando vieta le scale scelte a occhio.
 *
 * @param {number} mezzoV    semicampo verticale, radianti
 * @param {number} bordoAlto elevazione del bordo alto dell'impianto, radianti,
 *   positiva verso l'alto. Puo' essere negativa: il meccanismo sta sotto.
 * @returns {{eBasso:number, eAlto:number, ampiezza:number}}
 */
export function fascia (mezzoV, bordoAlto, margine = COSTANTI.MARGINE) {
  const disponibile = Math.max(0, mezzoV - bordoAlto)
  const m = disponibile * margine
  return { eBasso: bordoAlto + m, eAlto: mezzoV - m, ampiezza: Math.max(0, disponibile - 2 * m) }
}

/**
 * LA LASTRA — dove sta e quanto e' grande, in coordinate della camera.
 *
 * Il piano e' perpendicolare all'asse di vista a profondita' `Zc`, quindi un
 * punto ad altezza `y` ha elevazione `atan(y / Zc)`: le due quote della fascia
 * si convertono direttamente in due altezze.
 *
 * `Zc` e' la **distanza vera** del salone dalla camera in quel fotogramma.
 * Prendere la profondita' assiale invece della distanza costa `cos(10,5°)`,
 * cioe' l'1,7%: dichiarato qui invece di essere nascosto.
 *
 * Se la larghezza non ci sta — e su un telefono non ci sta, il semicampo
 * orizzontale e' 8,0° — la lastra si stringe e resta **appesa in alto**: il
 * bordo che si sacrifica e' quello verso il meccanismo, non quello verso il
 * cielo, perche' il primo e' spazio e il secondo e' il bordo del fotogramma.
 *
 * @returns {{y:number, z:number, altezza:number, larghezza:number, scala:number,
 *            stretta:boolean, frazioneAltezza:number, frazioneLarghezza:number}}
 */
export function lastra ({ mezzoV, mezzoH, bordoAlto, distanza, altoSalone, rapporto, margine = COSTANTI.MARGINE }) {
  const Zc = Math.max(1e-3, distanza)
  const f = fascia(mezzoV, bordoAlto, margine)

  let yAlto = Zc * Math.tan(f.eAlto)
  let yBasso = Zc * Math.tan(f.eBasso)
  let altezza = Math.max(0, yAlto - yBasso)
  let larghezza = altezza * rapporto

  const semiHmax = mezzoH * (1 - margine)
  const larghezzaMax = 2 * Zc * Math.tan(semiHmax)
  const stretta = larghezza > larghezzaMax
  if (stretta && larghezza > 1e-6) {
    const k = larghezzaMax / larghezza
    larghezza = larghezzaMax
    altezza *= k
    // si tiene il bordo ALTO: si cede verso il meccanismo, dove c'e' spazio
    yBasso = yAlto - altezza
  }

  return {
    y: (yAlto + yBasso) / 2,
    z: -Zc,
    altezza,
    larghezza,
    scala: altoSalone > 1e-6 ? altezza / altoSalone : 0,
    stretta,
    // a che frazione del fotogramma corrisponde: serve al referto, non al disegno
    frazioneAltezza: mezzoV > 0 ? (Math.atan(yAlto / Zc) - Math.atan(yBasso / Zc)) / (2 * mezzoV) : 0,
    frazioneLarghezza: mezzoH > 0 ? Math.atan(larghezza / 2 / Zc) / mezzoH : 0
  }
}

/**
 * IL FINALE VIVO.
 *
 * @param {object} p
 * @param {object} p.salone   quello che `creaSalone3D` ha restituito: servono
 *   `gruppo`, `alto`, `largo`, `profondita`. Non ne viene creato un secondo —
 *   due decodificatori video in piu' su un telefono sono batteria e calore, e
 *   `salone3d.js` ha gia' pagato quella lezione una volta.
 * @param {import('three').PerspectiveCamera} p.camera
 * @param {import('three').Object3D} p.nave   il gruppo a cui il salone torna
 *   quando il finale si chiude.
 * @param {import('three').Object3D} [p.impianto] il gruppo del meccanismo. Se
 *   manca, la fascia si calcola su un ingombro dichiarato invece che misurato,
 *   e `diagnostica.impiantoMisurato` lo dice.
 */
export function creaFinale ({ salone, camera, nave, impianto = null }) {
  if (!salone || !salone.gruppo) throw new Error('creaFinale: serve il salone di creaSalone3D')
  if (!camera) throw new Error('creaFinale: serve la camera')
  if (!nave) throw new Error('creaFinale: serve il gruppo della nave')

  const gruppo = salone.gruppo
  /**
   * LA POSA DI PARTENZA SI SALVA, non si ricostruisce. Ricalcolarla al ritorno
   * vorrebbe dire riscrivere `tuga.quota` e `tuga.z` in un secondo posto: due
   * copie dello stesso numero sono due numeri che un giorno divergono.
   */
  const casa = {
    posizione: gruppo.position.clone(),
    quaternione: gruppo.quaternion.clone(),
    scala: gruppo.scale.clone()
  }

  let apertura = 0
  let attaccato = false
  let ultimaLastra = null
  let ingombro = null           // { centro: Vector3, raggio: number }
  const p = new Vector3()
  const mondo = new Vector3()

  /**
   * L'INGOMBRO DELL'IMPIANTO SI MISURA UNA VOLTA, e non al primo fotogramma
   * utile: il GLB arriva quando arriva, e una sfera calcolata su un gruppo
   * vuoto vale zero — cioe' una fascia alta tutto il fotogramma, che e'
   * proprio l'errore che questa funzione serve a evitare.
   *
   * Si ritenta finche' non esce qualcosa di sensato, e si dichiara nel referto
   * se non e' mai uscito.
   */
  function misuraImpianto () {
    if (ingombro || !impianto) return ingombro
    const scatola = new Box3().setFromObject(impianto)
    if (scatola.isEmpty()) return null
    const sfera = scatola.getBoundingSphere(new Sphere())
    if (!(sfera.radius > 1e-4)) return null
    ingombro = { centro: sfera.center.clone(), raggio: sfera.radius }
    return ingombro
  }

  /**
   * Il bordo alto dell'impianto in elevazione, radianti, nel riferimento della
   * camera. Positivo verso l'alto.
   *
   * Se l'impianto non si e' ancora misurato si usa il RIPIEGO DICHIARATO: la
   * mira del primo piano sta a `y = 0` e il meccanismo a `y = -0,34`, con un
   * raggio d'ingombro di 0,45 unita' — a 2,55 unita' di distanza il bordo alto
   * cade a +4,1°. Non e' un numero inventato: e' il valore che la misura da'
   * a nave dritta, e serve solo a non avere una fascia sbagliata nei pochi
   * fotogrammi prima che il modello sia in scena.
   */
  const BORDO_RIPIEGO = MathUtils.degToRad(4.1)
  function bordoAltoImpianto () {
    const i = misuraImpianto()
    if (!i) return BORDO_RIPIEGO
    p.copy(i.centro).applyMatrix4(camera.matrixWorldInverse)
    const profondita = Math.max(1e-3, -p.z)
    const elev = Math.atan2(p.y, profondita)
    const raggioAng = Math.atan(i.raggio / profondita)
    return elev + raggioAng
  }

  /** La distanza VERA del salone dalla camera, con il gruppo dov'e' adesso. */
  function distanzaVera () {
    if (attaccato) {
      // appeso alla camera la distanza vera non esiste piu': si usa quella che
      // il salone AVREBBE nella sua posa di casa, che e' il numero onesto
      mondo.copy(casa.posizione)
      nave.updateMatrixWorld()
      mondo.applyMatrix4(nave.matrixWorld)
    } else {
      gruppo.getWorldPosition(mondo)
    }
    return Math.max(0.05, camera.position.distanceTo(mondo))
  }

  function attacca () {
    if (attaccato) return
    camera.add(gruppo)
    attaccato = true
  }

  function stacca () {
    if (!attaccato) return
    nave.add(gruppo)
    gruppo.position.copy(casa.posizione)
    gruppo.quaternion.copy(casa.quaternione)
    gruppo.scale.copy(casa.scala)
    attaccato = false
    ultimaLastra = null
  }

  /**
   * UN GIRO.
   *
   * @param {object} a
   * @param {number} a.f   quanto e' avanti il finale, 0-1. **Lo possiede lo
   *   scorrimento**, come tutto il resto della posizione: vedi D29. Chi spegne
   *   lo stabilizzatore non tocca questo numero — tocca `S.stab`, e il resto
   *   e' conseguenza dell'integratore.
   * @param {number} a.dt  secondi dall'ultimo giro.
   * @returns {number} l'apertura effettiva, gia' addolcita: chi chiama la
   *   passa a `visibilitaSalone` e a `fattoreRollio`.
   */
  function aggiorna ({ f, dt }) {
    apertura = passoApertura(apertura, f, dt)

    if (apertura <= COSTANTI.SOGLIA) { stacca(); return apertura }
    attacca()

    const d = distanzaVera()
    const mezzoV = MathUtils.degToRad(camera.fov) / 2
    const mezzoH = Math.atan(Math.tan(mezzoV) * camera.aspect)

    const L = lastra({
      mezzoV,
      mezzoH,
      bordoAlto: bordoAltoImpianto(),
      distanza: d,
      altoSalone: salone.alto,
      rapporto: salone.largo / salone.alto
    })
    ultimaLastra = L

    /**
     * SI ENTRA SCENDENDO DAL BORDO ALTO, e non dissolvendo.
     *
     * Una dissolvenza su una fotografia di due persone la fa sembrare un
     * fantasma; e per meta' apertura sarebbe una fotografia semitrasparente
     * davanti a un meccanismo, cioe' due immagini sovrapposte e nessuna
     * leggibile. Scendendo, invece, la lastra e' sempre opaca e quello che
     * cambia e' quanta ne e' entrata — che e' anche cio' che fa una cosa che
     * sta arrivando da sopra.
     *
     * L'opacita' resta di `salone.mostra()`, che chi chiama alimenta con
     * `visibilitaSalone`: qui non si tocca nessun materiale.
     */
    const fuori = L.altezza / 2 + Math.abs(L.z) * Math.tan(mezzoV)
    gruppo.position.set(0, MathUtils.lerp(fuori, L.y, apertura), L.z)
    /**
     * NIENTE ROTAZIONE QUI. Appesa alla camera, che non rolla mai, la lastra e'
     * gia' allineata all'orizzonte dello schermo; a inclinarsi e' l'IMMAGINE
     * dentro di essa, e a farlo e' `salone.aggiorna(sim.S.rollio, dt)` — la
     * stessa chiamata che gira dal primo fotogramma della visita.
     *
     * `index.js` scrive `salone.gruppo.rotation.z = -nave.rotation.z` per
     * annullare il rollio del genitore: mentre il gruppo e' appeso qui quella
     * riga va saltata, e `docs/20-FINALE.md` la elenca.
     */
    gruppo.quaternion.identity()
    gruppo.scale.setScalar(L.scala)

    /**
     * IL MARE DIETRO IL VETRO deve continuare a crescere di quanto e' piu'
     * lontano. `profondita` vuole la distanza VERA della camera, e la lastra ha
     * cambiato scala: la distanza si passa gia' riportata alla scala del
     * gruppo, o il fondale si ingrandirebbe come se la stanza fosse a mezzo
     * metro. E' lo stesso difetto che `index.js` ha gia' corretto una volta
     * passando `dist` al posto della distanza vera.
     */
    if (L.scala > 1e-6) salone.profondita(Math.abs(L.z) / L.scala)

    return apertura
  }

  /**
   * IL REFERTO SI LEGGE DAGLI OGGETTI, non da copie tenute qui.
   *
   * Un modulo che dichiara il proprio stato attesta se stesso: se domani
   * qualcuno addolcisse l'inclinazione, una copia salvata direbbe lo stesso
   * numero di prima e il cancello resterebbe verde mentre lo schermo mente.
   * Qui si rilegge cio' che e' stato DISEGNATO — la rotazione della texture
   * della stanza e la rotazione dello scafo — e nient'altro.
   */
  function inclinazioneDisegnata () {
    for (const figlio of gruppo.children) {
      const m = figlio.material
      // la stanza e' l'unico piano con una maschera: il mare non ne ha
      if (m && m.alphaMap && m.map && typeof m.map.rotation === 'number') return m.map.rotation
    }
    return null
  }

  return {
    aggiorna,
    stacca,
    get attaccato () { return attaccato },
    get apertura () { return apertura },
    /** Il modulo non possiede l'inclinazione, e lo dichiara. */
    scriveInclinazione: false,
    get diagnostica () {
      const inc = inclinazioneDisegnata()
      return {
        apertura,
        attaccato,
        visibile: gruppo.visible,
        /** radianti, LETTI dalla texture disegnata */
        inclinazioneSalone: inc,
        /** radianti, LETTI dal gruppo della nave */
        inclinazioneScafo: nave.rotation.z,
        impiantoMisurato: !!ingombro,
        bordoAltoGradi: MathUtils.radToDeg(bordoAltoImpianto()),
        lastra: ultimaLastra
          ? {
              frazioneAltezza: +ultimaLastra.frazioneAltezza.toFixed(3),
              frazioneLarghezza: +ultimaLastra.frazioneLarghezza.toFixed(3),
              stretta: ultimaLastra.stretta,
              scala: +ultimaLastra.scala.toFixed(3)
            }
          : null
      }
    }
  }
}
