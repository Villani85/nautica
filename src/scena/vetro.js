import { MeshPhysicalMaterial, FrontSide } from 'three'

/**
 * IL VETRO — con uno spessore, un indice di rifrazione, e il conto di cosa
 * costa averli davvero.
 *
 * ─── COSA CURA, E LA PRIMA SPIEGAZIONE ERA SBAGLIATA
 *
 * Oggi il vetro e' un `MeshStandardMaterial` con `metalness: 0.85` e
 * `roughness: 0.12`. Da lontano regge, e non e' un caso: di giorno il vetro di
 * uno yacht **e' uno specchio scuro**.
 *
 * La spiegazione facile — «un metallo non ha il Fresnel di un dielettrico» —
 * l'avevo scritta qui, ed e' FALSA: three applica Schlick anche ai conduttori,
 * e siccome il colore del vetro e' quasi nero, la riflettanza in faccia non e'
 * 0,85, e' quasi zero. Il provino l'ha smentita in due righe, sul banco a tinta
 * unita di `riferimenti/vetro/` (riflettanza a incidenza normale, ambiente noto
 * #808080 = 0,2159 in lineare):
 *
 *   una lastra vera, due facce              7,69%   = 2R/(1+R), con R = 4%
 *   una sola interfaccia (la fisica)        4,00%
 *   vetro leggero, `creaVetroLeggero`       5,56%   due superfici modellate
 *   vetro fisico trasmissivo, `creaVetro`   3,97%   il banco e' tarato
 *   **vetro di oggi**                       **1,94%**   meta' di una faccia sola
 *
 * Il vetro leggero sta FRA le due fisiche, e non per caso: disegna due
 * superfici, come ne ha una lastra. Il trasmissivo di three ne modella una, ed
 * e' il motivo per cui il numero piu' «fisico» dei due non e' il suo.
 *
 * Quindi il difetto vero non e' che manchi il Fresnel: e' che **in faccia il
 * vetro di oggi riflette meno della meta' del dovuto e non lascia vedere
 * niente dietro**. Guardato da vicino non e' una lastra scura: e' un buco
 * scuro, con i bordi accesi. Il resto lo mette la `roughness` a 0,12, che e'
 * quella di una vernice lucida e non di un cristallo lucidato a fuoco, e
 * l'assenza di qualunque spessore.
 *
 * ─── LE DUE STRADE, E QUANTO COSTANO
 *
 * `creaVetro` e' quella fisica: `transmission`, `thickness`, `ior`. three
 * disegna la scena **una seconda volta** in un bersaglio fuori schermo — con
 * MSAA 4x imposto e la catena di mipmap rigenerata a ogni fotogramma — e il
 * vetro ci legge dentro.
 *
 * `creaVetroLeggero` e' quella economica: nessuna trasmissione, riflesso
 * dell'ambiente col Fresnel di un dielettrico, e l'opacita' guidata dallo
 * stesso Fresnel — velata in faccia, specchio di taglio.
 *
 * Costo per fotogramma, 12 pannelli, misurato con i casi alternati fra loro
 * (tre corse indipendenti, mediana; il vetro di oggi = 1):
 *
 *   vetro di oggi        1,00x
 *   vetro leggero        0,85x · 1,90x · 2,22x       stesso ordine
 *   vetro trasmissivo    29,5x · 33,3x · 34,8x       un altro ordine
 *
 * **QUEI NUMERI SONO DI UN RASTERIZZATORE SOFTWARE E NON VANNO PORTATI SU UNA
 * GPU.** Il banco non ha scheda video, e il bersaglio della trasmissione e'
 * fatto delle cose che il software paga carissime e una GPU quasi no:
 * half-float, MSAA 4x, mipmap rifatta ogni fotogramma. Isolato sul banco —
 * stessa scena, senza vetro, disegnata due volte — il solo formato del
 * bersaglio costa **7,9x** un passaggio normale, contro 1,9x di un bersaglio
 * qualunque. Su GPU quel divario si assottiglia moltissimo.
 *
 * Cio' che invece si trasferisce, perche' e' lavoro contato e non tempo:
 *
 *   chiamate di disegno, 12 pannelli   48 (oggi) · 60 (leggero) · 84 (fisico)
 *   il pass e' UNO PER FOTOGRAMMA      a 1 pannello 4 -> 7, a 48 179 -> 310
 *   quanto e' grande                   tutti i pixel del canvas, per la scala
 *
 * Il pass non si moltiplica per il numero di vetri: si paga anche per una
 * finestra sola. E' un costo di soglia, non di quantita'.
 *
 * ─── E LA COSA CHE QUASI NESSUNO DICE
 *
 * Su una lastra PIANA e SOTTILE la trasmissione non deforma niente. Lo scarto
 * di rifrazione che three applica vale grosso modo `spessore * (1 - 1/ior)`:
 * con 12 mm di vetro e ior 1,5 fa **4 mm**, sotto il pixel a qualunque
 * inquadratura di questo sito. Chi «vede la rifrazione» in un provino di
 * solito ha messo `thickness: 0.5` — che a questa scala sono **1,25 metri di
 * vetro pieno**, cioe' un blocco di cristallo, non una finestra.
 *
 * Quello che la trasmissione da' davvero, su una finestra, e' altro e minore:
 * l'assorbimento nel colore (Beer-Lambert su `attenuationColor`), lo sfocato
 * legato alla `roughness` di cio' che sta dietro, e — questo si' importante
 * qui — **la profondita' resta scritta**: il vetro non e' `transparent`, non
 * si mette in coda, non si ordina male contro il piano di sezione e contro le
 * mesh complanari che questo repo ha gia' pagato una volta (vedi il commento
 * di `interno` in `materiali.js`).
 *
 * ─── QUALE DELLE DUE, DETTO CHIARO
 *
 * Per le finestre di questo sito: **la leggera.** Sulla stessa posa ravvicinata
 * riflette in faccia il 5,56% contro il 3,97% del trasmissivo e l'1,94% di
 * oggi — cioe' e' la piu' vicina al 7,69% di una lastra vera a due facce — ha
 * il Fresnel al posto giusto, e costa lo stesso ordine di grandezza del
 * materiale attuale invece di un altro ordine.
 *
 * La fisica resta quella giusta in tre casi, e sono casi veri:
 *   - se dietro il vetro deve vedersi qualcosa di **deformato o assorbito per
 *     spessore** (un cristallo grosso, una lente, l'acqua in un oblo');
 *   - se il vetro sta davanti a geometria che si ordina male: la leggera e'
 *     `transparent`, quindi non scrive profondita' e si ordina per distanza
 *     del centro;
 *   - se la lastra e' **ruvida**: lo sfocato di cio' che sta dietro, la strada
 *     leggera non ce l'ha e non puo' averlo.
 *
 * ─── UNITA'
 *
 * La scena interpreta una sua unita' come 2,5 m (`impianto.js`, e la stessa
 * costante sta in `sovrastruttura.js`). Qui l'API pubblica parla in
 * MILLIMETRI, perche' un vetro si sceglie in millimetri, e la conversione la
 * fa il modulo una volta sola.
 *
 * ─── COME RIMISURARLO
 *
 *   CHROMIUM=1 node riferimenti/vetro/misura.mjs
 *
 * Il provino importa QUESTO file: se si cambia un valore qui, la tabella
 * cambia di conseguenza e nessun numero va ricopiato a mano.
 */

const METRI_PER_UNITA = 2.5

/** millimetri -> unita' di scena */
const mm = (x) => (x / 1000) / METRI_PER_UNITA

/**
 * I VALORI DI RIFERIMENTO, e da dove vengono. Sono la pratica cantieristica,
 * non lo schermo: quando un numero e' scelto a occhio, e' scritto qui che lo e'.
 */
export const VETRO = {
  /**
   * 12 mm. Un cristallo di sovrastruttura su uno yacht di questa taglia sta
   * fra 8 e 15 mm (temperato o stratificato); 12 e' il centro. Vale sia per
   * `thickness` che per lo scostamento del retro nella strada leggera.
   */
  spessoreMm: 12,

  /**
   * 1,5. Vetro sodico-calcico: 1,52 misurato, 1,5 e' il valore che tutti i
   * motori usano e anche il predefinito di three. La differenza fra 1,50 e
   * 1,52 e' 0,0002 di riflettanza normale: invisibile.
   */
  ior: 1.5,

  /**
   * 0,04. Un cristallo temperato e' lucidato a fuoco: e' fra le superfici piu'
   * lisce che esistano su una barca. Il valore di oggi — 0,12 — e' quello di
   * una VERNICE lucida, ed e' parte del motivo per cui il vetro legge come
   * scafo. Non si mette 0: a 0 esatto la specularita' diventa un punto grande
   * come un pixel e sparisce in movimento (e' lo stesso motivo per cui il sole
   * di `ambiente.js` e' un disco e non un punto).
   */
  roughness: 0.04,

  /**
   * Il colore del cristallo in trasparenza. Un vetro nautico e' quasi sempre
   * privacy/solare: verde-azzurro molto scuro. E' la stessa famiglia di
   * `--acqua` del foglio di stile, cosi' la finestra resta dentro la tavolozza
   * del sito invece di portarci un colore nuovo.
   */
  tinta: 0x14312f,

  /**
   * La distanza a cui il colore raggiunge `tinta` (Beer-Lambert). Con 12 mm di
   * spessore e 25 mm di distanza, la trasmissione residua e' e^(-0,48) ~ 62%:
   * scurisce e tinge senza chiudere. E' la manopola del «quanto e' scuro»
   * quella giusta da girare — NON `thickness`, che e' una quota fisica.
   */
  distanzaTintaMm: 25,

  /**
   * Il colore della lastra vista di riflesso. Quasi nero: quello che si vede
   * in faccia e' l'ambiente, non il vetro.
   */
  colore: 0x0b2226,

  /**
   * Il colore della lastra nella strada leggera, ed e' PIU' SCURO di quello
   * della strada fisica. Non e' un gusto: li' il colore fa da diffuso, e un
   * vetro non ha diffuso. Misurato sul banco, il colore chiaro portava la
   * riflettanza in faccia a 5,4% contro il 4,0% della fisica — un vetro
   * lattiginoso. Con questo torna sui 4.
   */
  coloreLeggero: 0x061412,

  /**
   * Quanto e' opaca la lastra in faccia, nella strada leggera. E' la parte NON
   * spiegata dal Fresnel — l'assorbimento del vetro solare — e il resto lo
   * mette l'angolo. Misurato contro il vetro fisico sulla stessa posa: a 0,20
   * lo scarto e' 42,5 e a 0,75 e' 24,4, e continua a scendere, perche' un
   * cristallo solare da yacht di giorno lascia passare poco. 0,6 e' il punto in
   * cui l'interno si intravede ancora.
   */
  velo: 0.6
}

/**
 * ─── LA STRADA FISICA
 *
 * Da usare quando dietro il vetro c'e' qualcosa che DEVE vedersi deformato o
 * assorbito, e quando il vetro sta davanti a geometria che si ordina male —
 * perche' questo materiale scrive la profondita' e non e' `transparent`.
 *
 * @param {object} o
 * @param {number}  [o.colore]            tinta della lastra di riflesso
 * @param {number}  [o.spessoreMm]        quota fisica, in millimetri
 * @param {number}  [o.ior]               indice di rifrazione
 * @param {number}  [o.roughness]         lucidatura della superficie
 * @param {number}  [o.trasmissione]      0..1; 1 = vetro pieno
 * @param {number}  [o.tinta]             colore dell'assorbimento nel volume
 * @param {number}  [o.distanzaTintaMm]   a che spessore il colore diventa `tinta`
 * @param {import('three').Texture|null} [o.ambiente]  la mappa di `ambiente.js`
 * @param {number}  [o.intensitaAmbiente]
 * @param {import('three').Plane|null}   [o.pianoSezione]
 * @param {*}       [o.lato]              FrontSide di default
 * @returns {MeshPhysicalMaterial}
 */
export function creaVetro ({
  colore = VETRO.colore,
  spessoreMm = VETRO.spessoreMm,
  ior = VETRO.ior,
  roughness = VETRO.roughness,
  trasmissione = 1,
  tinta = VETRO.tinta,
  distanzaTintaMm = VETRO.distanzaTintaMm,
  ambiente = null,
  intensitaAmbiente = 1,
  pianoSezione = null,
  lato = FrontSide
} = {}) {
  const m = new MeshPhysicalMaterial({
    color: colore,
    /**
     * ZERO, E NON E' UN DETTAGLIO — ma la ragione non e' quella che sembra.
     *
     * Con `metalness` la riflettanza in faccia diventa **il colore stesso**, e
     * il colore di un vetro e' quasi nero: il vetro di oggi riflette l'1,94%
     * dove la fisica dice 4%, misurato. A zero invece la riflettanza la calcola
     * `ior`, e viene 4% esatto — verificato sul banco: 3,97%.
     *
     * Detto altrimenti: il metalness non toglie il Fresnel (three lo applica
     * anche ai conduttori), toglie il PAVIMENTO del Fresnel. Il bordo resta
     * acceso, ma la faccia si svuota.
     */
    metalness: 0,
    roughness,
    ior,
    transmission: trasmissione,
    /**
     * In unita' di scena. Serve a due cose sole: lo scarto di rifrazione
     * (trascurabile su una lastra, vedi in testa al file) e la lunghezza del
     * cammino nel volume per l'assorbimento. NON e' la manopola del «quanto e'
     * scuro»: quella e' `distanzaTintaMm`.
     */
    thickness: mm(spessoreMm),
    attenuationColor: tinta,
    attenuationDistance: mm(distanzaTintaMm),
    /**
     * La riflettanza normale di un dielettrico la calcola three dall'`ior`
     * (0,04 a 1,5). `specularIntensity` la lascia intera: abbassarla vorrebbe
     * dire una lastra con un trattamento antiriflesso, che su uno yacht non
     * c'e' — anzi, li' il riflesso e' meta' dell'effetto.
     */
    specularIntensity: 1,
    side: lato,
    /**
     * NON `transparent`. Un materiale trasmissivo resta nella passata opaca e
     * scrive la profondita': e' cio' che lo tiene fuori dai guai di
     * ordinamento. Metterlo trasparente qui e' un errore comune e silenzioso.
     */
    transparent: false
  })
  if (ambiente) { m.envMap = ambiente; m.envMapIntensity = intensitaAmbiente }
  if (pianoSezione) m.clippingPlanes = [pianoSezione]
  return m
}

/**
 * ─── LA STRADA LEGGERA, e perche' esiste
 *
 * Stesso `ior`, stesso Fresnel, stesso riflesso d'ambiente: la differenza e'
 * che qui il «dietro» non viene ri-renderizzato — arriva dal fondo gia'
 * disegnato, per fusione. Costa un pass in meno, cioe' **tutto** il costo
 * della trasmissione.
 *
 * IL TRUCCO, in una riga: l'opacita' non e' costante, la guida il Fresnel.
 * In faccia il vetro e' quasi tutto trasparente (si vede dentro), di taglio
 * diventa opaco e riflette. E' la stessa curva che rende «vetro» il vetro
 * fisico, applicata a cio' che qui la puo' portare.
 *
 * COSA PERDE, detto per intero e senza scuse:
 *   - niente assorbimento per cammino: la tinta e' un colore, non un volume;
 *   - niente sfocato di cio' che sta dietro se la lastra e' ruvida;
 *   - **e' `transparent`**, quindi non scrive profondita' e si ordina per
 *     distanza del centro. Fra pannelli che si sovrappongono in profondita'
 *     puo' invertirsi. Se succede, la cura non e' tornare alla trasmissione:
 *     e' `depthWrite` acceso sul solo retro, o separare le mesh.
 *
 * @param {object} o  gli stessi di `creaVetro`, piu':
 * @param {number} [o.velo]      opacita' in faccia, la parte non spiegata dall'angolo
 * @param {number} [o.durezza]   esponente del Fresnel: 5 e' Schlick, sotto 5 il
 *                               bordo si allarga. Non scendere sotto 3: si
 *                               ottiene un alone, non una lastra.
 */
export function creaVetroLeggero ({
  colore = VETRO.coloreLeggero,
  ior = VETRO.ior,
  roughness = VETRO.roughness,
  velo = VETRO.velo,
  durezza = 5,
  ambiente = null,
  intensitaAmbiente = 1,
  pianoSezione = null,
  lato = FrontSide
} = {}) {
  const m = new MeshPhysicalMaterial({
    color: colore,
    metalness: 0,
    roughness,
    ior,
    specularIntensity: 1,
    transparent: true,
    opacity: velo,
    /**
     * La faccia interna la disegna `creaVetroRetro`, non questa: due facce
     * trasparenti nello stesso materiale si fondono l'una sull'altra senza
     * ordine e il bordo diventa sporco.
     */
    side: lato,
    depthWrite: false
  })
  if (ambiente) { m.envMap = ambiente; m.envMapIntensity = intensitaAmbiente }
  if (pianoSezione) m.clippingPlanes = [pianoSezione]

  /**
   * IL FRESNEL SULL'ALPHA.
   *
   * `vViewPosition` in three e' `-mvPosition.xyz`, cioe' il vettore dal punto
   * VERSO la camera in spazio vista, ed e' gia' un varying di questo shader.
   * `normal` a questo punto della catena e' la normale in spazio vista, gia'
   * girata verso la camera sulle facce posteriori. Quindi il coseno
   * dell'angolo di incidenza e' il loro prodotto scalare, e non serve
   * aggiungere ne' varying ne' uniform: **niente ricompilazione di catena, e
   * nessun dato nuovo per vertice.**
   *
   * Si inietta DOPO `normal_fragment_maps` perche' prima la normale non e'
   * ancora quella definitiva, e si scrive su `diffuseColor.a` perche' e' da li'
   * che `opaque_fragment` prende l'alpha finale.
   */
  m.onBeforeCompile = (s) => {
    s.fragmentShader = s.fragmentShader.replace(
      '#include <normal_fragment_maps>',
      [
        '#include <normal_fragment_maps>',
        '{',
        '  float cosI = clamp(abs(dot(normalize(vViewPosition), normal)), 0.0, 1.0);',
        `  float fres = pow(1.0 - cosI, ${durezza.toFixed(1)});`,
        // in faccia resta il velo, di taglio va a specchio pieno
        '  diffuseColor.a = clamp(diffuseColor.a + (1.0 - diffuseColor.a) * fres, 0.0, 1.0);',
        '}'
      ].join('\n')
    ).replace(
      '#include <colorspace_fragment>',
      [
        '#include <colorspace_fragment>',
        /**
         * ─── LA DIVISIONE CHE FA LA DIFFERENZA FRA UN VETRO E UN VELO
         *
         * La fusione normale calcola `colore * alpha + fondo * (1 - alpha)`:
         * dove il vetro e' trasparente il RIFLESSO si spegne insieme a lui. Il
         * provino l'ha fotografato — il pannello leggero mostrava l'interno
         * benissimo e il cielo per niente — e misurato: riflettanza in faccia
         * **0,7%** contro il 4% del vetro fisico.
         *
         * `premultipliedAlpha: true` sembra la cura e NON lo e': three ha gia'
         * un `premultiplied_alpha_fragment` che moltiplica lui, quindi il conto
         * finale e' identico. Provato, misurato, invariato.
         *
         * La cura e' dividere per l'alpha, cosi' il prodotto si semplifica e
         * resta `riflesso + fondo * (1 - alpha)`: il riflesso arriva intero e
         * l'alpha decide solo quanto fondo passa — che e' come si comporta un
         * vetro vero, perche' quanta luce assorbe il cristallo non cambia
         * quanta ne riflette la superficie.
         *
         * ─── E VA DOPO `colorspace_fragment`, NON PRIMA. Costato una misura.
         *
         * Messa prima — dove «sembra giusta», sui valori ancora lineari — la
         * riflettanza in faccia usciva **4,0** invece di 11,6: un terzo. Il
         * motivo e' che **la fusione avviene su valori gia' codificati in
         * sRGB**: la scheda non fonde in lineare, fonde quello che trova nel
         * buffer. Quindi `enc(L/a) * a` non fa `enc(L)` — la codifica non e'
         * lineare, e il conto non si semplifica. Diviso invece DOPO la
         * codifica, si semplifica: `(enc(L)/a) * a = enc(L)`.
         *
         * Il numero previsto a tavolino da questa spiegazione era 4,0e-3
         * contro gli 11,6e-3 attesi, ed e' esattamente quello che il provino
         * aveva stampato: e' cosi' che si e' capito che l'errore era lo spazio
         * colore e non l'algebra.
         */
        '  gl_FragColor.rgb /= max(gl_FragColor.a, 0.004);'
      ].join('\n')
    )
  }
  // due materiali con lo stesso codice sorgente condividono il programma
  // compilato: la chiave deve cambiare quando cambia la durezza, o il secondo
  // vetro riusa lo shader del primo
  m.customProgramCacheKey = () => `vetroLeggero:${durezza}`

  return m
}

/**
 * ─── IL RETRO, cioe' lo spessore
 *
 * Un vetro senza retro non ha spessore: e' un foglio. Il retro si ottiene
 * disegnando la STESSA geometria in `BackSide`, piu' scura e piu' ruvida — e'
 * la faccia che si vede attraverso, e attraverso 12 mm di cristallo solare si
 * vede poco.
 *
 * DUE MODI DI USARLO, e la trappola in mezzo:
 *
 *   a) stessa mesh, secondo materiale in `BackSide` — **solo su un guscio
 *      chiuso**, vedi il parametro `lato`. Le due facce sono
 *      complanari e si contendono il buffer di profondita': questo repo ha gia'
 *      pagato quel prezzo per intero sullo scafo (`materiali.js`, `interno`) e
 *      la cura e' la stessa, `polygonOffset` che spinge il retro INDIETRO;
 *   b) mesh clonata e scostata di `spessoreMm` lungo la normale. Piu' onesta —
 *      il bordo mostra due lastre vere — ma la geometria dev'essere una lastra
 *      con una normale sola, e va scostata dove il vetro entra nel telaio.
 *
 * Con (a) lo spessore si legge solo dove la superficie e' curva o inclinata;
 * su un finestrino piano e frontale non si vede, ed e' corretto che non si
 * veda: non si vede nemmeno dal vero.
 */
export function creaVetroRetro ({
  colore = 0x050c0e,
  roughness = 0.14,
  opacita = 0.8,
  ambiente = null,
  intensitaAmbiente = 0.35,
  pianoSezione = null,
  /**
   * ─── E QUESTO PARAMETRO ESISTE PERCHE' IL PROVINO HA TROVATO UN PEZZO DI
   *     CODICE MORTO CHE NESSUNO AVREBBE VISTO
   *
   * (Chi vuole `BackSide` lo importa da three e lo passa qui.)
   *
   * Il retro era scritto in `BackSide`, che e' la scelta giusta su un guscio
   * CHIUSO: li' la faccia interna guarda via dalla camera e la si vede
   * attraverso la parete vicina. Su una falda SOLA — un finestrino, un
   * cristallo di murata — la faccia interna guarda dalla stessa parte di
   * quella esterna, quindi in `BackSide` viene scartata dal culling e non si
   * disegna niente.
   *
   * Come si e' scoperto: scandendo l'opacita' del retro da 0 a 1, la misura
   * non si muoveva **di un decimale**. Un parametro che non sposta niente non
   * e' un parametro tarato bene: e' un pezzo che non viene eseguito. Su una
   * geometria vera nessuno se ne sarebbe accorto, perche' il vetro sarebbe
   * sembrato solo un po' piu' povero.
   */
  lato = FrontSide
} = {}) {
  const m = new MeshPhysicalMaterial({
    color: colore,
    metalness: 0,
    roughness,
    ior: VETRO.ior,
    transparent: true,
    opacity: opacita,
    side: lato,
    depthWrite: false,
    // perde sempre contro la faccia esterna: e' dietro, e deve restare dietro
    polygonOffset: true,
    polygonOffsetFactor: 2,
    polygonOffsetUnits: 2
  })
  if (ambiente) { m.envMap = ambiente; m.envMapIntensity = intensitaAmbiente }
  if (pianoSezione) m.clippingPlanes = [pianoSezione]
  return m
}

/**
 * ─── LA MANOPOLA CHE RENDE LA TRASMISSIONE SOSTENIBILE
 *
 * `transmissionResolutionScale` (three r171+) decide a che risoluzione viene
 * disegnata la copia della scena. E' l'unico parametro che sposta davvero il
 * costo, ed e' quasi gratis in qualita': cio' che si vede attraverso un vetro
 * lucido e sottile e' gia' quasi identico al fondo.
 *
 * MISURATO sul provino, e con una sorpresa che va detta: dimezzare la scala ha
 * tolto solo un terzo del costo (28,4x -> 19,4x rispetto al vetro di oggi), e
 * un quarto di scala ha tolto poco altro (16,3x). Quindi su quel banco **il
 * grosso del costo non e' disegnare la copia della scena**: sta nel resto —
 * il formato del bersaglio e il campionamento della sua mipmap dentro lo
 * shader del vetro, che si pagano per ogni pixel di vetro a schermo.
 *
 * Conseguenza pratica: se la trasmissione va usata, questa manopola serve, ma
 * NON basta a renderla gratis. La manopola che conta di piu' e' quanti pixel
 * di vetro ci sono in quadro.
 *
 * La soglia non e' «telefono si / no» — un telefono recente ha piu' pixel di
 * un portatile. Si guarda quanti pixel si stanno disegnando davvero.
 */
export function regolaTrasmissione (render, { pixel = null, tetto = 1.4e6 } = {}) {
  const p = pixel != null
    ? pixel
    : render.domElement.width * render.domElement.height
  render.transmissionResolutionScale = p > tetto ? 0.5 : 1.0
  return render.transmissionResolutionScale
}
