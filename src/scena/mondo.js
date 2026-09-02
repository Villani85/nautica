import { Group, MathUtils, Quaternion, Vector3, PointLight, AmbientLight, Mesh, PlaneGeometry, MeshBasicMaterial, Color, DoubleSide, Raycaster, Box3, Matrix4, PerspectiveCamera, VideoTexture, SRGBColorSpace } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { TextureLoader, LinearSRGBColorSpace } from 'three'
import { vestiMondo, preparaMaterie } from './materie-mondo.js'
import { arredaMondo, misuratore } from './arredo-mondo.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { METRI_PER_UNITA } from './acqua.js'
import { sezioneA, PRUA_Z, POPPA_Z } from '../scafo/ordinate.js'
import { innestaProiezione, matriceProiettore } from './proiezione.js'

/**
 * IL MONDO DELLA TRAVERSATA — gli spazi veri, attraversati davvero.
 *
 * ─── COS'E', E COSA SOSTITUISCE
 *
 * `traversata.js` porta la traversata come FILMATO su un piano appeso alla
 * camera. Funziona, e per mesi e' stata la scelta giusta: modellare corridoi,
 * scale e locali tecnici erano settimane, e a quella distanza il tempo reale
 * non reggeva il confronto con una fotografia.
 *
 * Ma il criterio che il progetto si e' dato lo condanna, e lo dice in una riga:
 * *«un piano appeso alla camera che copre il 100% del quadro e' un nuovo film
 * anche se vive dentro lo stesso renderer»*. Chi guarda non attraversa la nave:
 * guarda un video di qualcuno che l'attraversa.
 *
 * Questo modulo carica `traversata-world.glb`, che contiene i quattro ambienti
 * assemblati nel frame comune -- locale tecnico, sala macchine, corridoio,
 * guscio del salone -- e li mette NELLA STESSA SCENA in cui gira tutto il
 * resto. Stessa camera, stesso mare, stesso rollio, stesso integratore.
 *
 * ─── ENTRA SPENTO, ED E' LA REGOLA PIU' IMPORTANTE DI QUESTO FILE
 *
 * Fra il caricamento del mondo e la rimozione dei due piani c'e' una finestra
 * in cui il climax puo' restare NERO: se il mondo non si vede e il filmato non
 * c'e' piu', il sito perde il proprio finale. L'ordine e' AGGIUNGERE,
 * VERIFICARE, POI TOGLIERE -- e finche' la verifica non e' fatta questo modulo
 * vive dietro `?mondo=1` e non tocca niente.
 *
 * Non e' prudenza generica: e' la stessa cautela che il guscio del salone
 * rispetta da giorni dietro `?guscio=1`, per la stessa ragione, e che ha gia'
 * evitato una volta di spedire una cosa non certificata.
 *
 * ─── LA SCALA, che e' la trappola numero uno
 *
 * Il GLB e' in METRI, come tutti i modelli del progetto. La scena vive in unita'
 * dove 1 = 2,5 m. La conversione si applica UNA VOLTA SOLA, qui, al nodo radice
 * -- mai sui sottoalberi, mai due volte. E' l'articolo 3 del contratto
 * world-space, ed e' scritto perche' un guscio costruito in unita' sbagliate
 * non da' errore: da' un modello che non combacia, e si perdono tre tentativi a
 * cercare la causa altrove.
 */

/**
 * Il mondo e' ACCESO di serie. `?mondo=0` (o `no`, o `false`) lo spegne.
 *
 * Era il contrario -- «entra spento e non tocca niente finche' la prova
 * verticale non e' verde». Quella prova adesso e' verde, la giunzione con il
 * filmato del salone combacia entro 0,097 gradi, e il committente ha deciso il
 * 1 settembre 2026 che la traversata diventa 3D.
 *
 * L'interruttore resta perche' serve a MISURARE il sito senza il mondo, non
 * perche' il visitatore debba sceglierlo.
 */
export function vuoleMondo (ricerca = (typeof location === 'undefined' ? '' : location.search)) {
  const v = new URLSearchParams(ricerca).get('mondo')
  if (v === '0' || v === 'no' || v === 'false') return false
  return true
}

/**
 * ─── DOVE STA IL MONDO RISPETTO ALLA NAVE
 *
 * Il frame del mondo ha l'origine sul nodo `CAMERA_SORGENTE_SALONE`, cioe'
 * dentro il salone. La nave del sito ha la propria origine altrove, e l'asse
 * della lunghezza si chiama `z` invece di `x`.
 *
 * Il ponte fra i due lo dichiara il contratto (`world_root.py`, §2-quater):
 *
 *     z_unita_scena = 1,9089 - X_metri_mondo / 2,5
 *
 * cioe' l'asse X del mondo (verso prua, in metri) diventa l'asse z della scena
 * (verso poppa, in unita'), con il segno invertito e l'offset misurato.
 *
 * QUEL PONTE E' `DERIVATO` E NON CONFERMATO, e va detto qui perche' e' qui che
 * si paga: la prova verticale (`strumenti/collaudo-verticale.mjs`) esce ROSSA
 * di 0,609 m -- il soffitto del salone risulterebbe sopra il trincarino. Tre
 * candidati, nessuno ancora escluso: la risalita del corridoio (dichiarata
 * inventata dal file che la porta), l'offset, o l'ipotesi che il pagliolo
 * poggi sulla chiglia.
 *
 * Finche' quella prova e' rossa il mondo NON puo' sostituire il filmato, e
 * questo modulo resta dietro l'interruttore. Caricarlo serve a MISURARLO in
 * scena, che e' l'unico modo di scegliere fra i tre candidati.
 */
const PONTE_OFFSET_Z = 1.9089

/** Riusato dal conto dell'appoggio: allocare un Vector3 per vertice sarebbe
    decine di migliaia di oggetti per un conto che si fa una volta sola. */
const _v = new Vector3()

/**
 * @param {number} ombre  il livello d'ombra scelto dal sito (0, 1024, 2048).
 *   Arriva da `index.js` invece di essere riletto da `?ombre`: due posti che
 *   leggono lo stesso interruttore sono due valori che un giorno divergono, ed
 *   e' il difetto che questo file ha gia' pagato con `mostra`.
 */
export function creaMondo (base, scena, { ombre = 0, ambienteInterno = null, videoSalone = null } = {}) {
  const gruppo = new Group()
  gruppo.name = 'MONDO_TRAVERSATA'
  gruppo.visible = false

  /**
   * Metri -> unita' di scena, una volta sola, sul nodo radice.
   * `METRI_PER_UNITA` vale 2,5 e vive in `acqua.js`: si importa invece di
   * riscrivere 0,4, perche' due copie di una costante sono due costanti che un
   * giorno divergono.
   */
  gruppo.scale.setScalar(1 / METRI_PER_UNITA)

  /**
   * L'asse X del mondo (metri, verso prua) deve diventare l'asse z della scena
   * (unita', che cresce verso poppa: `PRUA_Z = -8`, `POPPA_Z = +8`).
   *
   * PRIMO TENTATIVO SBAGLIATO, e la misura l'ha detto subito: avevo messo 180
   * gradi. Una rotazione di 180 attorno a Y INVERTE X e Z, non li SCAMBIA -- il
   * mondo restava lungo l'asse X della scena, e il bbox lo diceva: si estendeva
   * da -3,6 a +6,0 in X invece che in z.
   *
   * Servono 90 gradi: (1,0,0) -> (0,0,-1), cioe' il +X del mondo diventa il -z
   * della scena, che e' verso prua. E il +Z del mondo (dritta) diventa il +X
   * della scena.
   *
   * Una rotazione e non uno specchio, perche' uno specchio rovescerebbe le
   * normali e il guscio si illuminerebbe al contrario -- difetto che in questo
   * repo e' gia' costato una giornata ed e' scritto in `index.js:550`.
   */
  gruppo.rotation.y = Math.PI / 2
  gruppo.position.z = PONTE_OFFSET_Z

  /**
   * ─── IL PONTE VERTICALE NON ESISTEVA, e il mondo galleggiava sotto la chiglia
   *
   * Il contratto dichiara il ponte per l'asse della LUNGHEZZA e basta:
   * `z = 1,9089 - X/2,5`. Nessuno aveva mai scritto a che ALTEZZA vada il mondo,
   * e la conseguenza si e' vista alla prima misura in scena: il fondo del
   * pagliolo cadeva a -1,340 unita' mentre la chiglia, alla stessa stazione,
   * sta a -0,6048. Un metro e ottantatre sotto lo scafo.
   *
   * Non era un numero sbagliato: era un numero MANCANTE, e valeva zero perche'
   * nessuno l'aveva messo.
   *
   * Si deriva invece di scriverlo, e la regola e' quella fisica: IL PAVIMENTO
   * POGGIA SU QUALCOSA. Si prende il punto piu' basso del mondo, si guarda dove
   * sta la chiglia a quella stazione -- `sezioneA` di `ordinate.js`, la stessa
   * funzione che disegna lo scafo che il visitatore vede -- e si alza il mondo
   * della differenza. Se il modello cambia, l'offset lo segue da solo.
   *
   * ─── E DICHIARA IL PROPRIO DIFETTO, invece di nasconderlo
   *
   * Appoggiato cosi', il soffitto del salone SFONDA IL PONTE di circa 0,76 m.
   * Non e' una sorpresa: `strumenti/collaudo-verticale.mjs` lo prevedeva a
   * 0,609 m partendo dall'aritmetica delle ordinate, per una strada
   * completamente diversa da questa. Due misure indipendenti che concordano sul
   * SEGNO e sull'ordine di grandezza: il difetto e' reale.
   *
   * I tre candidati restano quelli, e nessuno e' ancora escluso: la risalita del
   * corridoio (2,10 m, che `corridor.py:54` dichiara «nessuna misura»),
   * l'offset longitudinale (DERIVATO, non confermato), o l'ipotesi che il
   * pagliolo poggi sulla chiglia -- che e' proprio quella usata qui, ed e' la
   * piu' generosa possibile: sotto un pagliolo vero ci sono sentina e
   * strutture.
   *
   * Finche' non e' deciso, il mondo resta dietro l'interruttore.
   */
  let sfondamento = null

  /**
   * ─── L'APPOGGIO SULLA CHIGLIA ERA UN CRITERIO, E DOVEVA ESSERE UNA VERIFICA
   *
   * Questa funzione trovava il punto piu' basso del mondo e ce lo appoggiava:
   * `gruppo.position.y = chiglia - piuBasso`. In astratto e' ragionevole. Ma
   * NON E' LA REGOLA DEL CONTRATTO, e la sovrascriveva in silenzio.
   *
   * Il mondo e' ancorato al nodo `CAMERA_SORGENTE_SALONE`, e nell'asset
   * l'ultima posa e' esattamente [0, 0, 0]: verificato, non supposto.
   * L'arrivo doveva essere l'origine PER COSTRUZIONE. Collocando il gruppo per
   * il suo punto piu' basso, la quota la decideva il pavimento del locale
   * tecnico e l'origine finiva dove capitava.
   *
   * Ed e' la causa UNICA di tre misure che sembravano tre difetti:
   *   - l'ultima posa a 3,14 m contro un soffitto del salone a 2,233
   *   - diciotto pose su novantasei sopra il ponte
   *   - margine peggiore -0,337 unita'
   * Sono lo stesso spostamento rigido applicato a tutto il mondo. Non la curva,
   * non i pezzi: la regola di appoggio.
   *
   * Misurato: la camera del sito alla battuta «salotto» sta a
   * (0,0065 · 1,4528 · 1,778); l'origine del mondo stava a (0 · 1,2546 ·
   * 1,9089). Mezzo metro piu' in basso e trentatre centimetri piu' a poppa.
   *
   * Adesso la chiglia NON colloca piu' niente: MISURA. Se dopo l'ancoraggio
   * giusto il pavimento del locale tecnico sfonda la chiglia, quello e' un
   * difetto di geometria vero e va saputo -- prima veniva assorbito in silenzio.
   */
  function misuraFrancoChiglia () {
    let piuBasso = Infinity
    let zDelPiuBasso = 0
    let piuAlto = -Infinity
    let zDelPiuAlto = 0
    gruppo.updateWorldMatrix(true, true)
    gruppo.traverse((o) => {
      if (!o.isMesh || !o.geometry?.attributes?.position) return
      const p = o.geometry.attributes.position
      for (let i = 0; i < p.count; i++) {
        _v.set(p.getX(i), p.getY(i), p.getZ(i))
        o.localToWorld(_v)
        if (_v.y < piuBasso) { piuBasso = _v.y; zDelPiuBasso = _v.z }
        if (_v.y > piuAlto) { piuAlto = _v.y; zDelPiuAlto = _v.z }
      }
    })
    if (!Number.isFinite(piuBasso)) return

    const t = (z) => MathUtils.clamp((z - PRUA_Z) / (POPPA_Z - PRUA_Z), 0, 1)
    /* positivo = il pavimento sta SOPRA la chiglia, cioe' dentro lo scafo */
    francoChiglia = piuBasso - sezioneA(t(zDelPiuBasso)).chiglia
    sfondamento = piuAlto - sezioneA(t(zDelPiuAlto)).ponteY
  }

  /**
   * ─── DOVE VA L'ORIGINE: gliela dice la regia, non la chiglia
   *
   * L'ultima posa e' [0,0,0], quindi collocare l'origine e' collocare
   * l'ARRIVO. E l'arrivo e' la posa da cui il sito guarda il salone --
   * `dentroY`, `tugaZ + dist`, `scarto` in `index.js:1423-1471`. Quei valori
   * arrivano da li', dallo stesso ambito che li usa per la camera, cosi' non
   * esistono due copie che un giorno divergono.
   */
  /**
   * ─── E ANCHE L'ORIENTAMENTO ARRIVA DALLA REGIA
   *
   * L'ancoraggio in posizione non basta, e si vede in un fotogramma. Misurato
   * all'istante della giunzione, con la camera nello stesso punto:
   *
   *   sito, battuta salotto   guarda ( 0,0000 ·  0,0000 · -1,0000)
   *   mondo, ultima posa      guarda (-0,3248 · -0,0493 · -0,9445)
   *   scarto                  19,2 gradi
   *
   * Diciannove gradi bastano a far vedere il ponte al posto della stanza: il
   * filmato del salone e' girato guardando la finestra e le due persone, la
   * camera del mondo arriva guardando altrove. La giunzione che il contratto
   * garantisce e' quella del PUNTO, non della direzione -- l'ultima posa e'
   * [0,0,0], cioe' l'origine, e sull'origine non c'e' scritto dove si guarda.
   *
   * La correzione NON si applica a tutta la curva: ruotare ogni posa di 19
   * gradi vorrebbe dire attraversare il corridoio guardando le pareti. Si
   * innesta sull'ultimo tratto, cosi' la camera converge sulla posa del
   * filmato mentre arriva, e all'istante del taglio le due inquadrature
   * coincidono.
   */
  const INNESTO = 0.15
  let correzione = null
  let diag = null

/**
 * ─── LE LUCI PRATICHE, e perche' sono il primo passo
 *
 * DECISIONE DEL COMMITTENTE, 1 settembre 2026, guardando il provino: «e'
 * bruttissima la traversata ancora». Ha ragione, e il file lo conferma senza
 * ambiguita': 45 maglie, 17 materiali, TRE immagini -- tutte mappe d'ombra --
 * NESSUNA texture di colore, e ZERO LUCI.
 *
 * Un locale tecnico illuminato dal cielo del sito, cioe' dalla stessa luce che
 * illumina il mare, e dipinto di grigio uniforme fra 0,20 e 0,62, non puo' che
 * sembrare una scatola. In un ambiente chiuso e' la LUCE a dire dove sei: prima
 * delle materie, prima dei contenuti.
 *
 * Si parte da qui perche' costa mezz'ora e risponde alla domanda che conta --
 * questa traversata puo' funzionare? Se no, si sono risparmiate le materie e i
 * contenuti.
 *
 * ─── E LE POSIZIONI SI DERIVANO DALLA CURVA, non si scrivono
 *
 * Scrivere coordinate a mano vorrebbe dire ricopiare i numeri del contratto in
 * un terzo posto -- ed e' il difetto che questo repo ha pagato quattro volte in
 * tre giorni. La curva della camera passa DENTRO gli ambienti per costruzione:
 * mettere una plafoniera sopra ogni tratto la mette dove serve, e se domani il
 * percorso cambia le luci lo seguono senza che nessuno se ne ricordi.
 *
 * L'altezza NON e' un numero: era 1,55 m sopra la posa «poco sotto un soffitto
 * che sta a 2,00» -- ma il soffitto sta a 2,00 solo nel corridoio; in sala
 * macchine sta a 3,00 e la posa e' l'occhio, non il pavimento. Adesso si
 * misura, vedi `accendiLuci`.
 */
/**
 * ─── UN INTERRUTTORE ASSENTE NON E' UNO ZERO
 *
 * DIFETTO PRESO IL 2 SETTEMBRE leggendo lo stato vivo delle luci, e vale la
 * pena scriverlo perche' e' silenzioso: `Number(params.get('x'))` su un
 * parametro ASSENTE non da' `NaN`, da' **0** -- `Number(null) === 0`. Un
 * controllo scritto `Number.isFinite(v) && v >= 0 ? v : predefinito` accetta
 * quello zero e il predefinito non si usa MAI.
 *
 * Cosi' `AMBIENTE` valeva 0 in ogni visita: la luce diffusa che serve a far
 * vedere l'occlusione cotta -- il motivo per cui esiste -- era spenta, e il
 * commento qui sotto raccontava una cura che il sito non aveva. `INTENSITA` si
 * era salvata per caso, chiedendo `v > 0`.
 *
 * Qui si guarda la STRINGA: assente o vuota vuol dire «non chiesto».
 */
function numeroDaUrl (nome, predefinito, min, max) {
  if (typeof location === 'undefined') return predefinito
  const grezzo = new URLSearchParams(location.search).get(nome)
  if (grezzo === null || grezzo.trim() === '') return predefinito
  const v = Number(grezzo)
  return Number.isFinite(v) && v >= min && v <= max ? v : predefinito
}

/**
 * ─── QUANTE PLAFONIERE, e cosa costano anche quando non si vedono
 *
 * Il numero di luci della scena entra nel programma di OGNI materiale, quindi
 * si paga a ogni fotogramma della visita e non solo dentro la traversata.
 * Misurato a 2560x1440, fermi sulla nave a p 0,35, dove il mondo non si vede:
 *
 *     sette plafoniere (13 luci in tutto)   24,3 ms per fotogramma
 *     tre                                   24,0
 *     una                                   23,0
 *     `?mondo=0`, nessun mondo               18,0
 *
 * E QUI LA MISURA CORREGGE L'IPOTESI, che era mia: pensavo che il prezzo
 * fossero le lampade, e invece togliendone sei si guadagna UN millisecondo. I
 * sei che separano il mondo dal non-mondo stanno da un'altra parte -- geometria,
 * tessiture, materiali -- e questo commento non dice dove, perche' non l'ho
 * misurato.
 *
 * `?plafoniere=<n>` resta perche' quante lampade illuminano il corridoio e' una
 * scelta di resa, ed e' giusto che si possa guardare. Ma non e' una leva di
 * prestazione: la misura dice di no.
 */
const QUANTE_LUCI = numeroDaUrl('plafoniere', 7, 1, 12)
/**
 * ─── LA PORTATA DICE METRI E VALE UNITA' DI SCENA: 3,6 SONO NOVE METRI
 *
 * DIFETTO DI UNITA', trovato il 2 settembre misurando perche' le ombre non si
 * vedessero. `PointLight.distance` three.js lo usa in coordinate di MONDO, e
 * non lo scala col gruppo che lo contiene: questa lampada vive dentro un gruppo
 * scalato 1/2,5, quindi «3,6» non e' la portata di 3,6 m che il nome promette,
 * sono 3,6 unita' di scena, cioe' **nove metri**.
 *
 * La conseguenza si vede: le sette plafoniere distano un metro e mezzo l'una
 * dall'altra, e con nove metri di portata ILLUMINANO TUTTE LA STESSA STANZA.
 * Il commento di prima diceva «restano i tratti in ombra fra l'una e l'altra»:
 * non ci sono, e l'ombra che una lampada proietta la riempiono le altre sei --
 * misurato, l'ombra cambia al massimo 4 livelli su 255 (con una lampada sola e
 * forte ne cambia 18).
 *
 * NON LA CAMBIO DA SOLO: correggerla vuol dire rifare la luce della traversata,
 * che e' messa in scena, ed e' un numero sul tavolo del committente
 * (`feedback/CHIEDO.md` §3.6). `?portata=<n>` la cambia per guardarla, e il
 * valore di serie resta quello con cui il provino e' stato approvato.
 *
 *     ?portata=3.6   com'e' adesso: nove metri, le lampade si sovrappongono
 *     ?portata=1.44  i 3,6 metri che il nome promette
 */
const PORTATA_M = numeroDaUrl('portata', 3.6, 0.1, 20)
const COLORE_LUCE = 0xffe6c4     // lampada da lavoro, non luce di giorno
/**
 * Intensita' di serie, e `?luce=<n>` la cambia per cercarla guardando -- come
 * `?quota=` e `?raggio=` fanno gia' per l'inquadratura.
 *
 * SEI ERA TROPPO, e non di poco: dentro un corridoio le pareti stanno a mezzo
 * metro da una plafoniera, e col decadimento quadratico l'illuminamento va a
 * quattro volte l'intensita'. Il provino usciva PIU' CHIARO che senza mondo --
 * luminanza media 187 contro 136 -- cioe' le lampade bruciavano la stanza
 * invece di illuminarla. Un ambiente sotto coperta deve essere piu' scuro del
 * mare, non piu' chiaro.
 */
const INTENSITA = numeroDaUrl('luce', 0.35, 0.001, 20)
/**
 * ─── LA COTTURA SI VEDE SOLO CON UNA LUCE DIFFUSA, e non ce n'era
 *
 * Gli ambienti hanno un'occlusione ambientale cotta in Blender (`*-ao.png`,
 * `cuoci-traversata.py`), e nel provino gli spigoli delle stanze non si
 * leggevano: la sala macchine era un gradiente senza angoli. Non era la
 * cottura: in three.js `aoMap` modula SOLO la luce indiretta -- ambiente, sonde,
 * mappa d'ambiente -- e qui erano tutte a zero, di proposito
 * (`isolaDallaLuceDiFuori`: sotto coperta non c'e' cielo). Le plafoniere sono
 * luce diretta, e la diretta l'occlusione non la tocca. Quindi la mappa che si
 * era pagata era moltiplicata per zero, e non lo diceva.
 *
 * Una luce d'ambiente bassa, sullo strato del mondo, e' la cosa che la accende.
 * Il livello e' un numero, e `?ambiente=<n>` lo cambia per guardarlo.
 */
const AMBIENTE = numeroDaUrl('ambiente', 0.22, 0, 4)
/** Quanto sotto il soffitto misurato sta il corpo della plafoniera, e la sua luce. */
/**
 * ─── QUANTE PLAFONIERE PROIETTANO, e perche' non tutte e sette
 *
 * Un'ombra da PointLight in three.js e' una mappa CUBICA: sei rendering della
 * stanza per lampada. Sette lampade sarebbero quarantadue passaggi, e sopra a
 * ogni frammento sette prove d'ombra -- per un corridoio in cui, dalla
 * plafoniera piu' vicina, la terza e' gia' fuori portata (`PORTATA_M` 3,6 m e
 * il passo fra due e' 1,5).
 *
 * Ne proiettano DUE, le piu' vicine alla camera, e il numero resta due per
 * tutta la traversata: e' quello che tiene i programmi compilati una volta
 * sola. Cambiare quante lampade proiettano cambia lo shader di OGNI materiale
 * della scena -- three.js mette il conteggio nella chiave del programma -- e
 * una ricompilazione a meta' movimento e' uno scatto che si vede.
 *
 * E la geometria non si muove: `shadow.autoUpdate` e' SPENTO e la mappa si
 * cuoce quando quella lampada entra fra le due. Sei rendering una volta per
 * lampada in tutta la traversata, invece di quarantadue per fotogramma.
 *
 * ─── MA UNA COTTURA SOLA NON BASTA, e il conto dei passi lo dice
 *
 * Primo tentativo: `needsUpdate = true` nell'istante in cui la lampada entra
 * fra le due. Misurato con `render.info.render.calls`, il passaggio d'ombra NON
 * disegnava niente -- 50 passi con le ombre accese, 50 con le ombre spente, e
 * 155 appena si accendeva `autoUpdate`. La cottura sola c'era stata, ma in un
 * fotogramma in cui non valeva: il mondo si ANCORA (`ancoraA`) dopo essere
 * diventato visibile, e una mappa d'ombra cotta prima dell'ancoraggio descrive
 * la stanza dov'era, non dov'e'.
 *
 * Adesso si cuoce per `RICOTTURE` fotogrammi di fila dopo ogni cambio: tre
 * cotture invece di una, e la terza vede una stanza ferma. Il numero e' piccolo
 * apposta -- se un giorno il mondo si muovesse davvero, questo commento e' il
 * posto dove si scopre perche' le ombre restano indietro.
 */
const RICOTTURE = 3
const OMBRE_QUANTE = 2
/**
 * ─── QUANTO E' NERA UN'OMBRA, o il rimbalzo che questo motore non calcola
 *
 * Con l'ombra a forza piena il pagliolo sotto le macchine va a nero: nel
 * provino a s = 0,05 il quadro sotto la prima stazione misura 6 livelli su 255,
 * cioe' niente. Non e' un difetto delle ombre, e' cio' che manca intorno:
 * three.js illumina in diretta e non calcola nessun rimbalzo, e in una stanza
 * con pareti chiare il rimbalzo e' proprio quello che riempie l'ombra. La
 * mappa cotta non puo' aiutare -- l'AO e' occlusione, toglie luce, non ne
 * aggiunge.
 *
 * `shadow.intensity` toglie all'ombra una frazione: e' l'approssimazione piu'
 * onesta che questo motore permette del rimbalzo mancante, ed e' UN numero, non
 * una luce in piu' da mantenere. `?ombraforza=` lo cambia per guardarlo.
 *
 * MISURATO sul pagliolo in ombra, s = 0,05, riquadro centrale basso:
 *     forza 1,00 -> ...   forza 0,70 -> ...   forza 0,50 -> ...
 * (i numeri li scrive `strumenti/misura-ombra.mjs`, e stanno nel commit)
 */
const OMBRA_FORZA = numeroDaUrl('ombraforza', 0.7, 0, 1)
/** La cubica costa sei facce: 512 per lampada sono gia' 1,5 M di texel. */
const LATO_OMBRA_GRANDE = 512
const LATO_OMBRA_PICCOLO = 256

/**
 * Quanto riflettono le superfici della traversata. `?riflesso=<n>` lo cambia.
 * Non e' una tavolozza: e' quanto della stanza si vede addosso al metallo.
 */
const RIFLESSO = numeroDaUrl('riflesso', 1, 0, 4)

/**
 * ─── IL GUSCIO DEL SALONE NON DEVE RESTARE UNA SCATOLA BEIGE
 *
 * Nel filmato della traversata gli ultimi otto secondi sono una stanza vuota di
 * colore crema: il guscio del salone e' fatto di otto piani (`Mesh_0..7`,
 * materiale `GUSCIO`) e non porta nessuna immagine. E' il difetto piu' visibile
 * di tutta la corsa, e la revisione lo chiede da giorni: «un modo di far reggere
 * una proiezione su un guscio essenziale».
 *
 * La proiezione qui e' possibile per una ragione che non vale in nessun altro
 * punto del sito: **la traversata FINISCE sulla camera sorgente**. L'origine del
 * frame del mondo E' `CAMERA_SORGENTE_SALONE` -- l'ultima posa e' [0,0,0] -- e
 * `riferimenti/salone/posa.json` dichiara che quella fotografia e' montata su
 * una lente da 34 gradi verticali (focale 1177,51 px). Quindi:
 *
 *   · da lontano la proiezione si spalma, ed e' il difetto noto di ogni
 *     proiezione su guscio;
 *   · man mano che la camera si avvicina l'errore si CHIUDE da solo;
 *   · all'arrivo la camera e' NEL fuoco del proiettore e l'immagine e' esatta,
 *     che e' anche l'istante in cui la lastra del filmato prende il comando.
 *
 * Non e' un trucco che regge per caso: regge dove serve e sbaglia dove non si
 * guarda. Per questo la miscela sale con la corsa invece di stare accesa.
 *
 * Il filmato e' lo STESSO della lastra che segue (`salone-largo.mp4`, che
 * `salone3d.js` chiama la calma e presta gia' alla traversata): una seconda
 * `VideoTexture` sullo stesso `<video>` non costa un secondo flusso.
 */
const PROIEZIONE_GRADI = 34
/**
 * Da che punto della corsa la fotografia comincia a comparire sul guscio.
 *
 * Cercato guardando, fra due difetti opposti. Con 0,55 in cima alla scala c'e'
 * un rettangolo bianco: la scala porta in una stanza vuota. Con 0,30 la
 * fotografia comincia troppo presto e si SPALMA sulle pareti del guscio che si
 * vedono di scorcio -- bande verticali calde attraverso tutto il quadro, che e'
 * il difetto noto di ogni proiezione guardata da fuori fuoco.
 *
 * 0,42 e' dove il guscio si vede solo attraverso il vano della porta: li' la
 * proiezione non ha spazio per sbagliare in modo visibile, e in cima alla scala
 * si intravede il mare invece del bianco. Guardato a s = 0,38, 0,45 e 0,52.
 */
const PROIEZIONE_DA = numeroDaUrl('proiezioneda', 0.42, 0, 1)
/** Quanto ne arriva alla fine: `?proiezione=0` spegne tutto e lascia il beige. */
const PROIEZIONE = numeroDaUrl('proiezione', 1, 0, 1)

const PIASTRA_SOTTO_IL_SOFFITTO_M = 0.01
const LUCE_SOTTO_IL_SOFFITTO_M = 0.18
/** Da dove parte il raggio che cerca il soffitto: sopra la posa, sotto l'occhio. */
const SONDA_SOFFITTO_DA_M = 1.0
const SOFFITTO_ENTRO_M = 6.0

let luci = null
/* la camera del sito: serve a toglierle lo strato di fuori mentre si e' dentro.
   La riceve `ancoraA`, che e' l'unico posto in cui il sito si presenta. */
let cameraDelSito = null
/* quante superfici hanno ricevuto una materia: un numero si guarda */
let vestite = 0
/* quanti pezzi d'arredo: tubi, staffe, macchine */
let arredati = 0
/* quanti pezzi del guscio sono stati riportati nel frame della curva */
let riallineati = 0

/**
 * ─── PRIMA DI ACCENDERE, BISOGNA SPEGNERE
 *
 * Messe le sette plafoniere, il provino non e' cambiato di niente: gli ambienti
 * restavano bianchi. La causa non erano le luci, era che NON SERVIVANO -- la
 * scena del sito ha un `HemisphereLight` piu' due direzionali, tarati per una
 * nave vista al largo, e dentro un corridoio quella luce entra da tutte le
 * pareti insieme. Una stanza gia' illuminata a giorno non si illumina.
 *
 * Aggiungere senza togliere e' il modo di lavorare mezz'ora e non vedere
 * differenza, e sarebbe stato facile concludere «le luci non bastano» invece di
 * «le luci non arrivano».
 *
 * Lo strato lo risolve alla radice: three.js accende una maglia solo con le
 * luci il cui strato interseca il suo. Il mondo va su uno strato tutto suo, le
 * plafoniere pure, e le luci del sito -- che restano sullo strato zero -- non lo
 * toccano piu'. La camera abilita entrambi, cosi' continua a vedere tutto.
 *
 * E la nebbia si toglie con `material.fog = false`: e' l'aria fra la camera e
 * la nave, e dentro lo scafo non c'e' aria da attraversare.
 */
const STRATO_MONDO = 1
/** Lo strato dell'arredo: vedi `arredo-mondo.js`, la luce cotta e le lampade. */
const STRATO_ARREDO = 2

/**
 * La luce cotta addosso al materiale: `lightMap` di three, sul canale UV che
 * queste stanze hanno (uno solo, lo stesso dell'occlusione).
 *
 * Le tessiture si caricano una volta sola e si condividono: tre file per
 * diciassette materiali.
 */
const tessitureLuce = new Map()
function vestiDiLuceCotta (m) {
  if (!m || m.__luceCotta || LUCE_COTTA <= 0) return
  const spec = MAPPE_LUCE.find((x) => x.quali(m.name || ''))
  if (!spec) return
  m.__luceCotta = true
  if (!tessitureLuce.has(spec.file)) {
    const t = new TextureLoader().load(base + 'modelli/' + spec.file)
    /* la luce cotta e' un DATO in lineare, non un colore in sRGB: leggerla
       come sRGB la schiarirebbe di una curva che nella cottura non c'era */
    t.colorSpace = LinearSRGBColorSpace
    t.flipY = false          // come le UV del glTF
    t.channel = 0            // queste stanze hanno un canale UV solo
    tessitureLuce.set(spec.file, t)
  }
  m.lightMap = tessitureLuce.get(spec.file)
  m.lightMapIntensity = spec.divisore * LUCE_COTTA
  m.needsUpdate = true
}

function isolaDallaLuceDiFuori (camera) {
  gruppo.traverse((o) => {
    if (!o.isMesh) return
    /* SOLO lo strato del mondo: restando anche sullo zero, le luci del sito
       continuerebbero ad arrivare e non sarebbe cambiato niente */
    o.layers.set(STRATO_MONDO)
    /**
     * ─── LE STANZE RICEVONO L'OMBRA, NON LA PROIETTANO
     *
     * Le pareti sono scatole chiuse con la lampada DENTRO: se proiettassero,
     * ogni parete si farebbe l'ombra da sola sulle proprie facce posteriori --
     * e con `side = DoubleSide` (poche righe piu' giu') il passaggio d'ombra
     * disegna proprio quelle. Il risultato non e' un'ombra, e' una stanza a
     * macchie che si muovono con la camera.
     *
     * A proiettare sono i pezzi dell'arredo -- tubi, staffe, macchine,
     * corrimano -- che e' esattamente cio' che mancava: il contatto fra un
     * oggetto e il pavimento su cui poggia. Le stanze lo ricevono.
     */
    o.receiveShadow = true
    o.castShadow = false
    const mm = Array.isArray(o.material) ? o.material : [o.material]
    for (const m of mm) {
      if (!m) continue
      m.fog = false
      /**
       * ─── E L'AMBIENTE, che gli strati NON fermano
       *
       * Messi gli strati, il provino era ancora identico. Non e' che non
       * funzionassero: `camera.layers.mask` era 3 e le maglie erano sullo
       * strato 1 -- verificato leggendo le maschere, non guardando l'immagine.
       *
       * La luce arrivava da un'altra parte. `scena.environment` illumina OGNI
       * materiale standard e non guarda gli strati: e' una mappa, non una
       * lampada. Il mare e il cielo del sito stavano dentro il corridoio da
       * tutte le pareti insieme, e nessuna plafoniera poteva competere.
       *
       * Zero e' voluto e non e' timidezza: sotto coperta non c'e' cielo. Se un
       * riflesso servira', tornera' da una mappa SUA -- non da quella di fuori.
       */
      /**
       * ─── ZERO E' L'ALTRO ESTREMO: adesso c'e' una mappa DI QUI
       *
       * Vedi `creaAmbienteInterno` in `ambiente.js`. Se il mondo non la
       * riceve (nessun renderer, per esempio nei cancelli che montano la
       * scena senza disegnarla) si resta a zero, che e' il comportamento di
       * prima e non rompe niente.
       */
      if (m.name === 'GUSCIO') preparaProiezione(o)
      vestiDiLuceCotta(m)
      m.envMap = ambienteInterno || null
      m.envMapIntensity = ambienteInterno ? RIFLESSO : 0
      /**
       * ─── E SI VEDONO ANCHE DA DENTRO
       *
       * Con la luce giusta la scala si leggeva, ma ai lati si vedeva IL MARE:
       * le pareti del corridoio non c'erano. Non mancavano -- sono nel file, 45
       * maglie -- erano scartate. Gli ambienti sono modellati come volumi visti
       * da FUORI, con le normali in fuori, e la traversata li attraversa da
       * DENTRO: il taglio delle facce posteriori le fa sparire tutte insieme.
       *
       * `DoubleSide` costa un po' di riempimento e risolve la classe intera. La
       * cura «giusta» sarebbe rivoltare le normali in Blender e ricuocere, che
       * e' mezza giornata per la stessa immagine.
       */
      m.side = DoubleSide
      m.needsUpdate = true
    }
  })
  camera?.layers?.enable(STRATO_MONDO)
  camera?.layers?.enable(STRATO_ARREDO)
}

/**
 * Il lato della mappa d'ombra segue il livello scelto dal sito: dove il sito
 * rinuncia alle ombre (`?ombre=0`, o una macchina che dichiara pochi nuclei)
 * qui non se ne accendono di nuove.
 */
/**
 * ─── E DI SERIE LE OMBRE DEL MONDO SONO SPENTE, con due numeri per dirlo
 *
 * Le ombre delle plafoniere funzionano (ci sono volute due cure: gli strati
 * della camera d'ombra e il frame in cui si sceglie chi proietta). E non si
 * vedono: `strumenti/misura-ombra.mjs` dice **6 livelli su 255** nel blocco che
 * cambia di piu', contro un fondo di rumore di **6**. La ragione e' la portata,
 * che dice metri e vale unita': nove metri, e le sette plafoniere si riempiono
 * l'ombra a vicenda (vedi `PORTATA_M`).
 *
 * Quello che invece si misura e' il costo: alla giunzione fra traversata e
 * salone la nave torna in quadro e i suoi materiali vogliono anche i programmi
 * `distance` per le due lampade che proiettano. Con le ombre accese quel
 * fotogramma dura **2.100 ms**, spente **1.659**. Quattrocentoquaranta
 * millisecondi del climax per un'immagine che non cambia.
 *
 * Quindi spente di serie e `?ombremondo=1` per riaccenderle: il giorno in cui
 * la luce cambia -- e' un numero sul tavolo del committente -- torneranno a
 * valere qualcosa, e il codice e' li'.
 */
const OMBRE_DEL_MONDO = numeroDaUrl('ombremondo', 0, 0, 1) === 1
const LATO_OMBRA = !OMBRE_DEL_MONDO ? 0 : ombre >= 2048 ? LATO_OMBRA_GRANDE : ombre > 0 ? LATO_OMBRA_PICCOLO : 0

/**
 * ─── LE LUCI NASCONO SUBITO E SPENTE, e non stanno dentro il gruppo
 *
 * DIFETTO MISURATO IL 2 SETTEMBRE, ed e' il piu' caro trovato finora: la
 * giunzione fra traversata e salone costava 5.340 ms di quadro fermo, una
 * volta sola -- quella del visitatore, sul climax.
 *
 * La catena: in three il CONTEGGIO delle luci fa parte della chiave del
 * programma di ogni materiale. Le plafoniere nascevano dentro il gruppo del
 * mondo e con lui si accendevano e spegnevano, quindi il conteggio cambiava
 * tre volte durante la visita. La nave, che durante la traversata non si
 * disegna (`soloDentro` spegne lo strato di fuori), alla giunzione torna in
 * quadro con una configurazione di luci che non ha mai visto: diciannove
 * programmi `physical` nuovi, tutti insieme, e il fotogramma dura cinque
 * secondi e mezzo. Misurato con `render.info.programs` e col profilo della CPU
 * (`strumenti/misura-giunzione.mjs` racconta la caccia e le cinque strade che
 * NON hanno funzionato).
 *
 * Adesso le luci esistono da prima del primo disegno, tutte, con intensita'
 * zero: il conteggio e' quello definitivo dal primo fotogramma e non cambia
 * mai piu'. `accendiLuci` non le crea, le SPOSTA e le accende.
 *
 * E vivono nella scena, non nel gruppo: dentro, sparirebbero ogni volta che il
 * mondo si nasconde -- che e' esattamente il difetto. Il gruppo si ancora una
 * volta sola, quindi basta copiargli la posa quando succede.
 */
const luciPronte = []
/** Dove stanno le plafoniere, nel frame del gruppo: la lampada viva le segue. */
const postiPlafoniera = []
/**
 * ─── LA LUCE DELLE STANZE E' COTTA, non calcolata
 *
 * Le stanze non si muovono e le plafoniere nemmeno: la loro luce e' un DATO.
 * `riferimenti/blender/cuoci-luce-mondo.py` la cuoce in Cycles con lampade AD
 * AREA nelle posizioni misurate dal sito stesso (le esporta
 * `strumenti/esporta-luci-mondo.mjs`), diretto PIU' indiretto -- cioe' col
 * rimbalzo, che in tempo reale non c'e'.
 *
 * Il perche' non e' solo la resa. In three il NUMERO di luci entra nella chiave
 * del programma di ogni materiale: dieci lampade accese costano 75 ms di
 * fotogramma ciascuna su GPU software, e ogni volta che il numero cambia tutta
 * la scena si ricompila (5,3 secondi alla giunzione, misurati). Cotta la luce,
 * le stanze non hanno piu' bisogno di nessuna lampada: ne resta UNA, per
 * l'arredo, che nella cottura non c'e' perche' nasce in JS.
 *
 * I divisori vengono dalla cottura (`uscite/luce-divisori.json`): la luce cotta
 * e' HDR, il PNG tiene 0..1, quindi ogni mappa e' stata divisa per il suo
 * novantanovesimo percentile e qui si rimoltiplica. Sono numeri MISURATI, non
 * tarati a occhio: se si ricuoce, si riportano da li'.
 *
 * ─── E LE MAPPE STANNO A META' RISOLUZIONE DELL'AO
 *
 * La luce e' una funzione LENTA: cambia su decine di centimetri, non su un
 * texel. Rimpicciolite a meta' del lato dell'atlante (256, 320, 384) il quadro
 * cambia di DUE livelli su 255 -- cioe' il fondo di rumore di due scatti
 * identici -- e i tre file passano da 157 KB a 19. L'occlusione invece resta
 * grande, perche' li' il dettaglio e' negli spigoli.
 */
const MAPPE_LUCE = [
  { file: 'stair_corridor-luce.webp', divisore: 3.5275, quali: (n) => n.startsWith('CORRIDOIO') },
  { file: 'engine_room-luce.webp', divisore: 1.6408, quali: (n) => n.startsWith('MECH') && n.includes('engine_room') },
  { file: 'mechanism_bay-luce.webp', divisore: 0.3041, quali: (n) => n.startsWith('MECH') && !n.includes('engine_room') }
]
/** Quanto della luce cotta arriva: `?lucecotta=0` la spegne e si torna alle lampade. */
const LUCE_COTTA = numeroDaUrl('lucecotta', 1, 0, 4)
/**
 * Quante lampade restano accese a runtime, per l'arredo che nella cottura non
 * c'e'. Una: e' quella sopra la testa, e segue la camera.
 */
const LUCI_A_RUNTIME = 3

/** Le plafoniere che possono proiettare, in ordine di percorso. */
const plafoniere = []
/** Chi proietta adesso: si tiene per non riassegnare a ogni fotogramma. */
let ombreggianti = []
/** Quante volte ancora ricuocere la mappa dopo un cambio: vedi `RICOTTURE`. */
let daRicuocere = 0

  /**
   * ─── LA PROIEZIONE SUL GUSCIO, e come si aggancia a un materiale esistente
   *
   * Si innesta nello shader del materiale del guscio invece di sostituirlo:
   * cosi' il guscio resta illuminato come il resto della traversata finche' la
   * miscela e' bassa, e diventa fotografia quando sale.
   *
   * L'innesto sta DOPO `colorspace_fragment`, non prima. La lastra del filmato
   * si monta con `toneMapped: false` perche' la fotografia porta gia' la
   * propria curva; mescolare il colore dopo la conversione di spazio fa
   * esattamente la stessa cosa, e i due (guscio e lastra) restano confrontabili
   * invece di stare uno una curva piu' in la' dell'altro.
   */
  const proiettore = new PerspectiveCamera(PROIEZIONE_GRADI, 1.6, 0.05, 60)
  let fotoSalone = null
  const proiezioni = []
  const _matriceProiezione = new Matrix4()
  /**
   * ─── E SI SPEGNE APPENA LA CODA COMINCIA
   *
   * La proiezione e' esatta in UN punto: la posa d'arrivo, che e' la lente
   * della fotografia. Finche' ci si avvicina l'errore si chiude e va bene.
   * Dopo, no: nella coda il mondo resta acceso finche' il filmato e' pronto
   * (`960cf20`), la lastra sta 1,3 unita' davanti -- cioe' DIETRO le pareti del
   * guscio -- e la camera si muove. Nel provino a pCoda 0,03 si vedevano bande
   * e cunei: la stessa stanza disegnata due volte con qualche grado di scarto.
   *
   * Provato anche a proiettare dalla camera VIVA in quel tratto: peggio (43
   * livelli di scarto medio contro 22). E provato a spegnere con la DISTANZA
   * dalla posa d'arrivo: la camera che `ancoraA` riceve non e' quella che
   * percorre la traversata -- il suo `getWorldPosition` dava [1,82 0 0,69]
   * mentre la posa d'arrivo sta a [0,01 1,45 1,91] -- quindi la distanza
   * misurava due cose diverse e la proiezione restava spenta sempre.
   *
   * La coda invece arriva a `mostra` insieme alla corsa, dallo stesso posto e
   * nello stesso istante: e' l'unico numero che non puo' divergere.
   *
   * E il valore non e' scelto: 0,125 e' il punto in cui la lastra e' PIENA
   * (`traversata.js` la sale con `c * 8`, e `index.js` ci appoggia sopra il suo
   * `CODA_CONSEGNATA = 0,13`). Cosi' le due immagini si scambiano invece di
   * sommarsi: il guscio perde la fotografia con la stessa rampa con cui la
   * lastra la prende, e sono la STESSA fotografia. Se quella rampa cambia,
   * questo numero va cambiato con lei -- come gia' avverte il commento di
   * `CODA_CONSEGNATA`.
   */
  const CODA_SPEGNI_PROIEZIONE = 0.125
  /** Dove si spengono le plafoniere: vedi `mostra`. */
  const CODA_SPEGNI_LUCI = 0.35

  function preparaProiezione (mesh) {
    if (!videoSalone) return
    if (!fotoSalone) {
      fotoSalone = new VideoTexture(videoSalone)
      fotoSalone.colorSpace = SRGBColorSpace
    }
    const mm = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const m of mm) {
      const r = innestaProiezione(m, fotoSalone)
      if (r && !proiezioni.includes(r)) proiezioni.push(r)
    }
  }

  /** La miscela segue la corsa: zero lontano, tutta all'arrivo. */
  function aggiornaProiezione (q, coda, rapporto) {
    if (!proiezioni.length) return
    const t = MathUtils.smoothstep(q, PROIEZIONE_DA, 1)
    /**
     * ─── E SI SPEGNE QUANDO LA CAMERA LASCIA LA POSA D'ARRIVO
     *
     * La proiezione e' esatta in UN punto -- la posa d'arrivo, che e' la lente
     * della fotografia -- e sbaglia tanto quanto ci si allontana. Finche' ci si
     * avvicina, l'errore si chiude e va bene cosi'. Dopo, no: nella coda il
     * mondo resta acceso finche' il filmato e' pronto (`960cf20`), la lastra sta
     * 1,3 unita' davanti (cioe' DIETRO le pareti del guscio) e la camera si
     * muove. Nel provino a pCoda 0,03 si vedevano bande e cunei: la stessa
     * stanza disegnata due volte con qualche grado di scarto.
     *
     * Provato anche a proiettare dalla camera VIVA in quel tratto -- il guscio
     * come schermo allineato al quadro -- ed era peggio: 43 livelli di scarto
     * medio contro i 22 di prima, perche' li' il guscio sta gia' sfumando e
     * l'immagine ci passa attraverso.
     *
     * Quindi la miscela si spegne con la DISTANZA dalla posa d'arrivo. Non e'
     * una soglia sul tempo ne' sulla battuta: e' la stessa quantita' che rende
     * la proiezione sbagliata, misurata dove nasce.
     */
    const arrivo = posaA(1)
    if (!arrivo) return
    proiettore.position.copy(arrivo.p)
    proiettore.quaternion.copy(arrivo.q)
    const vicino = 1 - MathUtils.smoothstep(coda, 0, CODA_SPEGNI_PROIEZIONE)
    /**
     * ─── L'APERTURA E' QUELLA DELLA LASTRA, IL RAPPORTO QUELLO DELLO SCHERMO
     *
     * L'obiettivo del proiettore resta a 34 gradi anche mentre quello della
     * camera si apre a 58 per far stare i locali nel quadro (`index.js`,
     * `campoTraversata`): la fotografia e' montata su 34 e non cambia con la
     * lente di chi guarda.
     *
     * Il RAPPORTO invece deve essere quello del quadro, perche' e' cosi' che la
     * lastra lo riempie -- e va passato da chi la camera ce l'ha davvero.
     * Prima lo leggevo da `cameraDelSito`, che e' l'oggetto che `ancoraA`
     * riceve e NON e' la camera che disegna: restava a 1,6 sempre. Su un
     * telefono (390x844, rapporto 0,46) la proiezione usciva come un
     * RETTANGOLO ORIZZONTALE sospeso in mezzo a una stanza beige -- cioe'
     * esattamente la «carta» che il guscio esiste per non far vedere. Preso
     * guardando i provini a 390x844, che nessuno aveva ancora guardato.
     */
    if (rapporto > 0 && proiettore.aspect !== rapporto) {
      proiettore.aspect = rapporto
      proiettore.updateProjectionMatrix()
    }
    matriceProiettore(proiettore, _matriceProiezione)
    for (const r of proiezioni) {
      if (!r.uniformi) continue
      r.uniformi.uMiscela.value = t * vicino * PROIEZIONE
      r.uniformi.uProiezione.value.copy(_matriceProiezione)
    }
  }

  /**
   * Le luci si allocano qui, alla creazione del mondo: spente, senza posizione,
   * ma CONTATE. Vedi il commento di `luciPronte`.
   */
  function preparaLuci () {
    if (luci) return
    luci = new Group()
    luci.name = 'luciPratiche'
    const ambiente = new AmbientLight(0xffffff, 0)
    ambiente.layers.set(STRATO_MONDO)
    /* l'ambiente vale anche per l'arredo, che sta su uno strato suo */
    ambiente.layers.enable(STRATO_ARREDO)
    luci.add(ambiente)
    luciPronte.push(ambiente)
    /**
     * QUANTE. Con la luce COTTA ne basta una: le stanze la portano gia' addosso
     * e a runtime resta solo l'arredo da illuminare, che nella cottura non c'e'.
     * Senza (`?lucecotta=0`) si torna alle nove di prima -- il percorso piu' il
     * salone -- e si vede quanto costavano.
     *
     * Il numero e' fisso e deciso QUI, prima del primo disegno, perche' il
     * conteggio delle luci sta nella chiave del programma di ogni materiale: se
     * cambia dopo, tutta la scena si ricompila.
     */
    const quante = LUCE_COTTA > 0 ? LUCI_A_RUNTIME : QUANTE_LUCI + 2
    for (let i = 0; i < quante; i++) {
      const l = new PointLight(COLORE_LUCE, 0, PORTATA_M, 2)
      /* con la luce cotta la lampada serve SOLO all'arredo: sulle stanze
         sarebbe una seconda illuminazione sopra quella gia' cotta */
      l.layers.set(LUCE_COTTA > 0 ? STRATO_ARREDO : STRATO_MONDO)
      if (LATO_OMBRA > 0 && i < OMBRE_QUANTE) {
        l.castShadow = true
        l.shadow.mapSize.set(LATO_OMBRA, LATO_OMBRA)
        l.shadow.autoUpdate = false
        l.shadow.camera.layers.enable(STRATO_MONDO)
        l.shadow.camera.near = 0.02
        l.shadow.camera.far = PORTATA_M / METRI_PER_UNITA
        l.shadow.normalBias = 0.01
        l.shadow.intensity = OMBRA_FORZA
      }
      luci.add(l)
      luciPronte.push(l)
    }
    scena.add(luci)
  }

  function accendiLuci () {
  if (!grezze || !grezze.length) return
  preparaLuci()
  /* la posa del gruppo si copia una volta: il mondo si ancora e poi sta fermo */
  luci.position.copy(gruppo.position)
  luci.quaternion.copy(gruppo.quaternion)
  luci.scale.copy(gruppo.scale)
  let prossima = 1
  const ambiente = luciPronte[0]
  ambiente.intensity = AMBIENTE
  /* dove stanno le plafoniere: le piastre ci vanno sempre, la lampada viva ci
     passa sopra una alla volta (vedi `seguiLaPlafoniera`) */
  postiPlafoniera.length = 0
  const piastre = new Group()
  piastre.name = 'luciPratiche'
  /**
   * ─── LA PLAFONIERA STA SUL SOFFITTO, non a sei centimetri dall'occhio
   *
   * Prima stava a `posa + 1,55 + 0,06`: l'occhio e' a 1,55 dal pavimento,
   * quindi la piastra passava SEI CENTIMETRI sopra la testa. Nel provino, ogni
   * volta che la camera ci arrivava sotto, una lastra color crema larga
   * mezzo metro riempiva il quadro -- e sulla soglia del corridoio sembrava
   * un tettuccio sospeso nel vuoto. Un corpo illuminante da 50 cm visto da 6
   * cm e' un muro luminoso.
   *
   * Adesso il soffitto si MISURA con un raggio, come fanno i tubi, e la
   * piastra ci sta appoggiata sotto. Dove il raggio non trova soffitto (fuori
   * da ogni stanza, o sopra il cielino del salone, dove l'ultima finiva) la
   * plafoniera non si mette: una lampada senza soffitto e' un altro oggetto
   * che galleggia.
   */
  const misura = misuratore(gruppo)
  const SU = new Vector3(0, 1, 0)
  const n = QUANTE_LUCI
  for (let i = 0; i < n; i++) {
    /* si salta il primo e l'ultimo estremo: agli estremi ci sono le soglie, e
       una plafoniera sulla soglia acceca invece di illuminare */
    const t = (i + 0.5) / n
    const v = grezze[Math.round(t * (grezze.length - 1))]
    const x = v.p[0]
    const z = v.p[2]
    const sonda = new Vector3(x, v.p[1] + SONDA_SOFFITTO_DA_M, z)
    const soffitto = misura(sonda, SU, SOFFITTO_ENTRO_M)
    if (soffitto === null) continue
    const cielino = sonda.y + soffitto

    postiPlafoniera.push(new Vector3(x, cielino - LUCE_SOTTO_IL_SOFFITTO_M, z))
    const l = luciPronte[prossima++]
    if (l) {
      l.intensity = INTENSITA
      l.position.copy(postiPlafoniera[postiPlafoniera.length - 1])
      /* l'ombra e' gia' preparata da `preparaLuci`: qui si dice solo che questa
         lampada e' una di quelle che possono proiettare */
      if (LATO_OMBRA > 0) plafoniere.push(l)
    }

    /* e il corpo illuminante si VEDE: una luce senza sorgente visibile e' una
       stanza illuminata da niente, che l'occhio legge come finta */
    const piastra = new Mesh(
      new PlaneGeometry(0.5, 0.12),
      new MeshBasicMaterial({ color: new Color(COLORE_LUCE), toneMapped: false })
    )
    piastra.position.set(x, cielino - PIASTRA_SOTTO_IL_SOFFITTO_M, z)
    piastra.layers.set(STRATO_MONDO)
    piastra.rotation.x = Math.PI / 2
    /* la PIASTRA e' geometria e sta nel gruppo -- se stesse col resto delle
       luci, che adesso vivono nella scena, resterebbe visibile anche a mondo
       spento: una lastra crema sospesa in mezzo alla nave. Il nodo si chiama
       `luciPratiche` perche' `maglieDelMondo` lo esclude gia' dai raggi. */
    piastre.add(piastra)
  }
  /**
   * ─── E IL SALONE HA UNA LUCE SUA
   *
   * Le sette plafoniere stanno lungo la CURVA, e la curva finisce sulla soglia:
   * il salone e' nove metri di stanza oltre quel punto, e restava al buio --
   * luminanza 7 su 255, cioe' nero. Rimessa a posto la stanza, il difetto e'
   * passato da «non c'e' niente» a «c'e' ma non si vede», che e' un altro
   * difetto e va chiuso a parte.
   *
   * Le posizioni vengono dal GUSCIO, non da numeri scritti: si prende la sua
   * scatola e ci si mettono due sorgenti lungo l'asse, a tre quarti d'altezza.
   * Se domani la stanza cambia, le luci la seguono.
   *
   * Piu' calde e piu' larghe di quelle del corridoio: un salone e' illuminato
   * da lampade e dal finestrone, non da plafoniere da locale tecnico.
   */
  /**
   * LA SCATOLA VA PRESA NEL FRAME DEL GRUPPO, non in quello della scena.
   *
   * Prima stesura: `expandByObject` da' una scatola in coordinate di SCENA,
   * cioe' gia' scalate di 1/2,5 e ruotate. Usarla per posizionare luci che sono
   * FIGLIE del gruppo -- quindi in coordinate locali -- mescola due sistemi, ed
   * e' l'errore che questo repo insegue da giorni. Le lampade finivano a due
   * metri e mezzo dal posto giusto e la portata era sbagliata dello stesso
   * fattore.
   *
   * Si porta la scatola dentro il frame del gruppo con la matrice inversa: cosi'
   * posizione e portata parlano la stessa lingua.
   */
  const scatola = new Box3()
  const _inv = new Matrix4().copy(gruppo.matrixWorld).invert()
  const _m = new Matrix4()
  gruppo.updateWorldMatrix(true, true)
  gruppo.traverse((o) => {
    if (!o.isMesh || !PEZZI_MAGLIA_SALONE.test(o.name || '')) return
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox()
    _m.multiplyMatrices(_inv, o.matrixWorld)
    scatola.union(o.geometry.boundingBox.clone().applyMatrix4(_m))
  })
  if (!scatola.isEmpty()) {
    const c = new Vector3(); scatola.getCenter(c)
    const d = new Vector3(); scatola.getSize(d)
    for (const f of [0.3, 0.72]) {
      const l = luciPronte[prossima++]
      if (!l) continue
      l.color.setHex(0xffdcb0)
      l.intensity = INTENSITA * 2.6
      l.distance = Math.max(d.x, d.z) * 0.9
      l.position.set(
        scatola.min.x + d.x * f,
        scatola.min.y + d.y * 0.78,
        c.z
      )
    }
  }

  gruppo.add(piastre)
}

/**
 * ─── IL SALONE ERA NEL POSTO SBAGLIATO, e la camera gli finiva fuori
 *
 * Una revisione ha contato i nodi del GLB per prefisso e ha concluso che la
 * stanza d'arrivo non esistesse: `SALOON` zero, `HULL` zero. Il conteggio era
 * giusto e la conclusione no -- il guscio C'E', sotto otto nodi che si chiamano
 * `davanti`, `fondo`, `opposta`, `pavimento`, `soffitto`, `montante`,
 * `sopra_vano`, `sotto_vano`, cioe' i nomi che gli da' `guscio-salone.py`.
 * Cercare per prefisso li ha mancati tutti.
 *
 * Ma il difetto c'era lo stesso, ed e' peggio: LA STANZA E' NEL POSTO
 * SBAGLIATO. Misurato sul file:
 *
 *   guscio    x -0,80 -> 9,05    y -5,30 -> -0,49    z -1,49 -> 1,02
 *   camera                        y  0                z  0
 *
 * In y la camera sta MEZZO METRO FUORI. E il nodo `CAMERA_SORGENTE_SALONE`
 * porta traslazione (0, -1,4508, -0,2364): la curva e' espressa rispetto a quel
 * nodo -- l'ultima posa e' [0,0,0] -- mentre il guscio e' rimasto nel frame
 * originale. Due sistemi, sfalsati di un metro e quarantacinque.
 *
 * Sono i quattro secondi vuoti fra il corridoio e il salone: la camera usciva
 * dal corridoio e si trovava FUORI dalla stanza d'arrivo, a guardare il nulla.
 * Il filmato del salone arrivava a coprire il vuoto, ed e' per questo che
 * nessun cancello l'ha mai segnalato.
 *
 * La correzione non e' un numero scritto a mano: e' la traslazione DEL NODO
 * STESSO, letta dal GLB. Se domani l'export cambia, la correzione cambia con
 * lui. E si applica SOLO al guscio -- corridoio, locale tecnico e sala macchine
 * li ha collocati l'assemblatore nel frame giusto, e spostarli romperebbe le
 * cuciture misurate.
 */
/** Le maglie del guscio: `guscio-salone.py` non le prefissa, l'export le
 *  chiama Mesh_0..Mesh_7 e i loro padri portano i nomi delle facce. */
const PEZZI_MAGLIA_SALONE = /^Mesh_[0-7]$/

const PEZZI_SALONE = new Set([
  'davanti', 'fondo', 'opposta', 'pavimento', 'soffitto',
  'montante', 'sopra_vano', 'sotto_vano'
])

function riallineaSalone (radice) {
  let nodoCamera = null
  radice.traverse((o) => { if (o.name === 'CAMERA_SORGENTE_SALONE') nodoCamera = o })
  if (!nodoCamera) return 0
  const d = nodoCamera.position
  if (d.lengthSq() < 1e-9) return 0
  let mossi = 0
  radice.traverse((o) => {
    if (!PEZZI_SALONE.has(o.name)) return
    o.position.sub(d)
    o.updateMatrix()
    mossi++
  })
  riallineati = mossi
  return mossi
}

  let ancorato = false
  function ancoraA (x, y, z, guardaCome, camera) {
    gruppo.position.set(x, y, z)
    gruppo.updateWorldMatrix(true, true)
    componiPose()            // dipendono da matrixWorld: vanno rifatte
    alzaSulPavimento()       // e l'occhio va sopra il pavimento, non dentro
    misuraFrancoPose()       // e si MISURA che ci stia, posa per posa
    misuraFrancoChiglia()
    contaPoseSopraPonte()
    /* la correzione porta l'ULTIMA posa esattamente sull'orientamento del sito:
       delta = voluto * attuale^-1, applicato a sinistra */
    if (guardaCome && pose && pose.length) {
      const ultima = pose[pose.length - 1].q
      correzione = guardaCome.clone().multiply(ultima.clone().invert())
      diag = { voluto: [guardaCome.x, guardaCome.y, guardaCome.z, guardaCome.w].map(n=>+n.toFixed(4)), ultima: [ultima.x, ultima.y, ultima.z, ultima.w].map(n=>+n.toFixed(4)) }
    }
    cameraDelSito = camera || null
    const _t = []
    const _segna = (nome, da) => _t.push(nome + ' ' + Math.round(performance.now() - da))
    let _d = performance.now()
    isolaDallaLuceDiFuori(camera)
    _segna('isolamento', _d); _d = performance.now()
    /* le materie DOPO l'isolamento: `isolaDallaLuceDiFuori` chiama
       `needsUpdate`, e vestire prima significherebbe farlo due volte */
    vestite = vestiMondo(gruppo)
    _segna('materie', _d); _d = performance.now()
    /* l'arredo DOPO l'isolamento e le materie: nasce gia' sullo strato giusto e
       con materiali suoi, quindi non va rivestito */
    arredati = arredaMondo(gruppo, grezze || [])
    _segna('arredo', _d); _d = performance.now()
    accendiLuci()
    _segna('luci', _d)
    tempiAncoraggio = _t.join(' · ')
    ancorato = true
  }

  let tempiAncoraggio = ''
  let pronto = false
  let errore = null
  let maglie = 0

  const caricato = new Promise((risolvi) => {
    new GLTFLoader()
      .setMeshoptDecoder(MeshoptDecoder)
      .load(
        base + 'modelli/traversata-world.glb',
        (glb) => {
          glb.scene.traverse((o) => { if (o.isMesh) maglie++ })
          gruppo.add(glb.scene)
          riallineaSalone(glb.scene)
          misuraFrancoChiglia()
          pronto = true
          risolvi(true)
        },
        undefined,
        (e) => {
          /**
           * Un modello che non arriva NON deve spegnere il sito: il filmato e'
           * ancora li' e il finale funziona. Si registra l'errore e si dichiara
           * `pronto` falso -- chi legge decide, e nessuno resta con lo schermo
           * nero perche' una richiesta di rete e' andata storta.
           */
          errore = String(e?.message || e)
          risolvi(false)
        }
      )
  })

  /**
   * ─── LA CURVA, e perche' arriva come tabella e non come animazione
   *
   * `traversata-camera.json` porta 96 pose a passo costante di lunghezza
   * d'arco, in metri, nel frame del mondo. NON e' un'animazione: non contiene
   * nessun tempo. E' l'articolo 4 del contratto -- «la durata non si cuoce
   * nello spazio: il sito deve poter rimappare il progresso di scroll sulla
   * curva senza cambiarne la traiettoria» -- ed e' la ragione per cui la camera
   * NON e' stata messa dentro il GLB, dove si sarebbe portata dietro una legge
   * oraria.
   *
   * Le pose vengono trasformate una volta sola, al caricamento, dallo spazio
   * del mondo a quello della scena: sono poche decine di punti, e farlo a ogni
   * fotogramma sarebbe lavoro ripetuto per un dato che non cambia mai.
   */
  let pose = null
  let lunghezza = 0

  /**
   * ─── LE POSE SI COMPONGONO DOPO, NON APPENA ARRIVANO
   *
   * DIFETTO GRAVE, e mascherato bene. Qui le pose venivano portate nello spazio
   * della scena con `gruppo.matrixWorld` NEL MOMENTO IN CUI ARRIVAVA IL JSON.
   * Ma l'offset verticale del gruppo lo scrive `appoggiaSullaChiglia()`, che
   * gira quando arriva il GLB. Il JSON pesa 16 KB e il GLB 1,67 MB: il piccolo
   * vince sempre, quindi le pose venivano composte con `position.y = 0` e la
   * camera restava UN METRO E VENTICINQUE SOTTO -- fuori dallo scafo,
   * sott'acqua, davanti a lastre grigie.
   *
   * Nessun errore da nessuna parte: due `Promise` che si risolvono, ognuna
   * corretta per conto suo, e in mezzo una dipendenza che il codice non
   * dichiarava. L'ho visto solo guardando un fotogramma, dopo aver acceso la
   * geometria -- finche' il mondo era invisibile, la camera sbagliata non si
   * vedeva.
   *
   * Adesso il JSON si tiene GREZZO, e la composizione avviene una volta sola
   * quando ENTRAMBI sono arrivati. Una dipendenza fra due caricamenti si
   * scrive, non si spera nell'ordine di arrivo.
   */
  let grezze = null

/**
 * ─── L'OCCHIO STA SOPRA IL PAVIMENTO, e prima ci passava dentro
 *
 * MISURATO tirando un raggio in avanti da ogni posa e guardando quanto corre
 * prima di incontrare una superficie:
 *
 *   s 0,00  6,79 m libera        s 0,55  0,56 m   CORRIDOIO_gradino_07
 *   s 0,30  3,57 m               s 0,60  0,02 m   CORRIDOIO_gradino_07
 *   s 0,50  1,40 m               s 0,75  0,06 m   CORRIDOIO_gradino_12
 *
 * Per un quarto della traversata la camera guardava l'INTERNO DI UNO SCALINO da
 * due centimetri. Non era un'inquadratura piatta: era una camera dentro la
 * scala. E' anche il motivo per cui i tubi non si vedevano mai -- da li' non si
 * vede niente.
 *
 * La causa sta nel contratto: i nodi della curva mettono la quota «pavimento
 * interpolato», e quando il pavimento diventa una scala il percorso ci va
 * dentro invece che sopra. Con la geometria dritta non si vedeva; con i gradini
 * cotti si', e nessun cancello poteva prenderlo perche' nessuno misura da dove
 * si guarda.
 *
 * LA CURA NON E' UN NUMERO, E' UNA MISURA: da ogni posa si tira un raggio in
 * GIU', si trova il pavimento vero -- gradino compreso -- e ci si mette l'occhio
 * sopra. Cosi' la camera sale la scala come la salirebbe una persona, e se
 * domani i gradini cambiano l'occhio li segue senza che nessuno se ne ricordi.
 *
 * L'ULTIMA POSA NON SI TOCCA. E' l'arrivo, ancorato alla camera del salone: la
 * correzione si spegne sull'ultimo tratto con la stessa dissolvenza
 * dell'orientamento, o si perderebbe una giunzione misurata a 0,097 gradi.
 */
const OCCHIO_M = 1.55
/** Quanto si sta sotto il soffitto: la testa non sfiora. */
const FRANCO_TESTA = 0.25
const SPEGNI_DA = 0.85
/** Da quanto sopra la posa grezza parte il raggio che cerca il pavimento. */
const SOPRA_LA_POSA_M = 0.30
const _giu = new Vector3(0, -1, 0)
const _su = new Vector3(0, 1, 0)
const _nrm = new Vector3()

/**
 * ─── GLI AMBIENTI, senza quello che ci ho messo dentro io
 *
 * Le maglie contro cui misurare sono quelle del mondo cotto. Nel gruppo ci
 * stanno anche i pannelli delle plafoniere (`luciPratiche`) e l'arredo
 * generato (`arredoMondo`): il raggio del soffitto prendeva un pannello da
 * 50x12 cm per soffitto e ci abbassava l'occhio sotto di 25 cm -- misurato:
 * cinque tratti a franco 0,25 verso «(senza nome)», e un 6 mm a s=0,905 che
 * era un pannello sfiorato, non il corridoio. E `vistaLibera` fermava lo
 * sguardo su un tubo. Un pezzo che ho aggiunto io non e' un muro.
 */
const MIEI = /^(luciPratiche|arredoMondo)$/
function maglieDelMondo () {
  const b = []
  ;(function raccogli (o) {
    if (MIEI.test(o.name)) return
    if (o.isMesh && o.visible) b.push(o)
    for (const c of o.children) raccogli(c)
  })(gruppo)
  return b
}

function alzaSulPavimento () {
  if (!pose || !pose.length) return
  const bersagli = maglieDelMondo()
  if (!bersagli.length) return
  const alto = OCCHIO_M / METRI_PER_UNITA
  for (let i = 0; i < pose.length; i++) {
    const s = i / (pose.length - 1)
    if (s >= 1) break
    /**
     * ─── DA DOVE PARTE IL RAGGIO, e perche' non da 1,55 m sopra la posa
     *
     * Prima stesura: si partiva da posa + altezza d'occhio, per non partire
     * dentro un gradino. Misurato dopo la ricottura a otto gradini: alle
     * ultime dodici pose la camera stava SUL TETTO del corridoio (0,93 m
     * sopra il suo soffitto, s=0,884) e poi scendeva nel salone passando
     * per il soffitto (dentro Mesh_5 a s=0,937).
     *
     * La posa grezza di Blender sta a circa 1,2 m dal pavimento; il corridoio
     * e' alto 2,08. Partendo 1,55 sopra la posa il raggio nasceva SOPRA IL
     * SOFFITTO e ne prendeva il dorso per pavimento. La difesa contro i
     * gradini era diventata il difetto.
     *
     * Trenta centimetri bastano: la posa non sta dentro un gradino se la
     * curva e il mondo vengono dallo stesso world_root -- e se non e' cosi'
     * lo dice misuraFrancoPose(), non questo numero.
     */
    const da = pose[i].p.clone().addScaledVector(_giu, -SOPRA_LA_POSA_M / METRI_PER_UNITA)
    _raggio.set(da, _giu)
    _raggio.far = alto * 3
    /* e anche qui si scartano le facce posteriori: alla porta di poppa della
       sala macchine il raggio partiva DENTRO l'architrave e ne prendeva la
       faccia inferiore per pavimento (misurato: i=33, occhio dentro il blocco
       con 17 mm di franco). Un pavimento si vede da sopra. */
    const colpo = _raggio.intersectObjects(bersagli, false).find((c) => {
      if (!c.face) return true
      _nrm.copy(c.face.normal).transformDirection(c.object.matrixWorld)
      return _nrm.dot(_giu) < 0
    })
    if (!colpo) continue
    const pavimento = colpo.point.y

    /**
     * ─── E IL SOFFITTO, che alla prima stesura ho dimenticato
     *
     * Alzando di 1,55 m sopra il pavimento e basta, il referto e' cambiato di
     * difetto invece che sparire: la camera usciva dai gradini e ANDAVA A
     * SBATTERE IN ALTO -- 0,06 m dall'architrave della paratia di poppa a
     * s=0,35, e 0,97 dal soffitto del corridoio a s=0,80.
     *
     * L'altezza d'occhio giusta non e' un numero: e' un numero DENTRO UN VANO,
     * e il vano qui cambia -- due metri nel corridoio, meno sotto un'architrave.
     * Quindi si misura anche il soffitto e ci si tiene sotto di un franco.
     *
     * Venticinque centimetri: sotto, la testa sfiora e l'inquadratura si
     * schiaccia; sopra, in un vano basso l'occhio scenderebbe piu' del
     * necessario.
     */
    /**
     * ─── E IL RAGGIO PARTE DAL PAVIMENTO, NON DALLA POSA
     *
     * Seconda stesura, dopo una misura vera (misuraFrancoPose): 13 pose su 96
     * stavano DENTRO i gradini 8..12, franco minimo 7 millimetri. Il meccanismo:
     * la posa grezza sta dentro un gradino, il raggio verso l'alto partiva da
     * li' e il primo colpo era la PEDATA DI QUELLO STESSO GRADINO vista da
     * sotto -- una faccia posteriore. La prendevo per soffitto e mettevo
     * l'occhio venticinque centimetri sotto la pedata: dentro lo scalino.
     *
     * Il controllo scritto per non sbattere in alto era quello che teneva la
     * camera dentro la scala. Quindi: si parte da appena sopra il pavimento
     * trovato, e si scartano le facce posteriori -- un soffitto si vede dal
     * di sotto, cioe' con la normale che viene verso il raggio.
     */
    const su = new Vector3(pose[i].p.x, pavimento + 0.01 / METRI_PER_UNITA, pose[i].p.z)
    _raggio.set(su, _su)
    _raggio.far = alto * 3
    const sopra = _raggio.intersectObjects(bersagli, false).find((c) => {
      if (!c.face) return true
      _nrm.copy(c.face.normal).transformDirection(c.object.matrixWorld)
      return _nrm.dot(_su) < 0   // la faccia guarda verso il basso: e' un soffitto
    })
    const tetto = sopra ? sopra.point.y - FRANCO_TESTA / METRI_PER_UNITA : Infinity
    const voluta = Math.min(pavimento + alto, tetto)
    /* si spegne verso l'arrivo: quella posa e' ancorata e non si tocca */
    const peso = s < SPEGNI_DA ? 1 : 1 - (s - SPEGNI_DA) / (1 - SPEGNI_DA)
    pose[i].p.y += (voluta - pose[i].p.y) * peso
  }
}

/**
 * ─── L'OCCHIO STA IN UN VANO O DENTRO UNA MAGLIA? Misurato, non stimato.
 *
 * Il revisore ha contato 13 pose su 96 «dentro un solido». Il conto era fatto
 * sull'asset e con le SCATOLE (AABB) delle maglie: una scatola che avvolge un
 * gradino a sbalzo, o la lamiera di un guscio, e' piena anche dove la maglia
 * e' vuota. Quindi tredici e' un tetto, non un numero -- e vale in un sistema
 * di coordinate in cui le pose non vivono (vedi contaPoseSopraPonte).
 *
 * La misura vera si fa qui, dopo `alzaSulPavimento()`, con la geometria: da
 * ogni posa si tirano sei raggi lungo gli assi e si guarda la faccia piu'
 * vicina. Se la sua normale e' CONCORDE col raggio, il raggio sta USCENDO da
 * quella maglia: l'occhio era dentro. Funziona perche' le maglie sono
 * `DoubleSide` (isolaDallaLuceDiFuori) e il raggio vede le facce posteriori.
 *
 * Due numeri per posa: il franco -- quanto e' vicina la superficie piu' vicina,
 * in metri -- e l'elenco delle maglie da cui un raggio esce. Il franco dice
 * «qui si sfiora», l'elenco dice «qui si e' dentro, e dentro COSA»: un nome
 * come `gradino_5` e' un difetto della curva, `GUSCIO` e' il salone che e'
 * cavo per costruzione e sta attorno all'occhio per mestiere.
 *
 * L'ultima posa non si esclude: e' ancorata alla camera del sito, e se risulta
 * dentro qualcosa e' il salone a essere nel posto sbagliato, non la curva.
 */
const _ASSI = [
  new Vector3(1, 0, 0), new Vector3(-1, 0, 0),
  new Vector3(0, 1, 0), new Vector3(0, -1, 0),
  new Vector3(0, 0, 1), new Vector3(0, 0, -1)
]
const _n = new Vector3()
let francoPose = null
let francoRiassunto = null

function misuraFrancoPose () {
  if (!pose || !pose.length) { francoPose = null; francoRiassunto = null; return }
  /* solo gli AMBIENTI: l'arredo generato sta lungo la curva per costruzione e
     un tubo a trenta centimetri dall'asse non e' un difetto della curva */
  const bersagli = maglieDelMondo()
  if (!bersagli.length) return
  francoPose = pose.map((v, i) => {
    let franco = Infinity
    let cosa = null
    const dentro = new Set()
    const assi = []
    for (const d of _ASSI) {
      _raggio.set(v.p, d)
      _raggio.far = 12 / METRI_PER_UNITA
      const colpi = _raggio.intersectObjects(bersagli, false)
      if (!colpi.length) { assi.push(null); continue }
      const c = colpi[0]
      const m = c.distance * METRI_PER_UNITA
      const nome = c.object.name || '(senza nome)'
      let dietro = false
      if (c.face) {
        _n.copy(c.face.normal).transformDirection(c.object.matrixWorld)
        dietro = _n.dot(d) > 0
      }
      if (m < franco) { franco = m; cosa = nome }
      if (dietro) dentro.add(nome)
      assi.push({ m: +m.toFixed(3), cosa: nome, dietro })
    }
    return {
      i,
      s: +(i / (pose.length - 1)).toFixed(3),
      p: [v.p.x, v.p.y, v.p.z].map((n) => +(n * METRI_PER_UNITA).toFixed(3)),
      franco: Number.isFinite(franco) ? +franco.toFixed(3) : null,
      cosa,
      dentro: [...dentro],
      /* i sei raggi in ordine +x -x +y -y +z -z, per chi deve capire PERCHE' */
      assi
    }
  })
  /* il riassunto per lo stato: quante pose stanno dentro qualcosa che non sia
     il guscio del salone, quale e' il franco piu' stretto e dove */
  const sospette = francoPose.filter((f) => f.dentro.some((n) => !/GUSCIO|Mesh_[0-7]$/.test(n)))
  const stretta = francoPose.reduce((a, f) => (f.franco !== null && (a === null || f.franco < a.franco) ? f : a), null)
  francoRiassunto = {
    poseDentroSolido: sospette.length,
    quali: sospette.map((f) => ({ i: f.i, s: f.s, dentro: f.dentro })),
    francoMinimo: stretta ? { m: stretta.franco, i: stretta.i, s: stretta.s, cosa: stretta.cosa } : null
  }
}

  function componiPose () {
    if (!grezze) return
    gruppo.updateWorldMatrix(true, false)
    pose = grezze.map((v) => {
      const p = new Vector3(v.p[0], v.p[1], v.p[2]).applyMatrix4(gruppo.matrixWorld)
      /* il quaternione arriva in ordine glTF (x,y,z,w), che e' anche quello
         del costruttore di three: si passa diretto. Poi si compone con la
         rotazione del gruppo, o la camera guarderebbe dove guardava nel
         frame del mondo invece che in quello della scena. */
      const q = new Quaternion(v.q_gltf[0], v.q_gltf[1], v.q_gltf[2], v.q_gltf[3])
      return { s: v.s, p, q: gruppo.quaternion.clone().multiply(q) }
    })
  }

  const curva = fetch(base + 'modelli/traversata-camera.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
    .then((d) => {
      lunghezza = d.lunghezza_m || 0
      grezze = d.pose
      return true
    })
    .catch((e) => { errore = errore || ('curva: ' + e.message); return false })

  /**
   * La posa a `s` (0..1 sulla lunghezza d'arco), gia' nello spazio della scena.
   * Interpola linearmente fra i due campioni piu' vicini per la posizione e
   * `slerp` per l'orientamento -- che e' l'unico modo di interpolare una
   * rotazione senza passare per pose che nessuno ha chiesto.
   */
  /**
   * ─── QUANTE POSE STANNO SOPRA IL PONTE, misurato QUI e non altrove
   *
   * Una revisione aveva risposto «zero pose sopra il ponte» contando su
   * `traversata-camera.json`. Il conto era giusto e la risposta non valeva: il
   * JSON e' l'ASSET, e le pose che il sito usa passano per una scala 1/2,5, una
   * rotazione di 90 gradi, un offset in z e -- soprattutto -- un `position.y`
   * calcolato a runtime da `appoggiaSullaChiglia()`. Misurare sull'asset
   * significa rispondere in un sistema di coordinate in cui la domanda non vive.
   *
   * E' la stessa famiglia del difetto che questo file ha appena pagato, dove le
   * pose venivano composte prima che quell'offset esistesse.
   *
   * Quindi il conto si fa dove le due cose sono nello stesso spazio: qui, dopo
   * `componiPose()`, con `sezioneA` a portata di mano. Chi guarda da fuori
   * legge un numero invece di rifare una trasformazione -- e rifarla e'
   * esattamente il modo in cui si sbaglia.
   *
   * ─── MA ATTENZIONE A COSA VUOL DIRE, che me lo sono chiarito dopo
   *
   * `ponteY` e' il PONTE PRINCIPALE. Il salone non ci sta sopra per errore: ci
   * sta sopra per costruzione, perche' e' dentro la TUGA. La regia stessa mette
   * la camera del salotto a `nave.position.y + tugaQuota` = 1,4528, mentre il
   * ponte a quella stazione e' a 0,936: mezzo metro piu' in basso.
   *
   * Quindi «pose sopra il ponte» NON e' un elenco di difetti. E' un numero
   * onesto su una domanda che, per l'ultimo tratto, e' quella sbagliata: la
   * traversata FINISCE nella tuga, e li' stare sopra il ponte principale e'
   * giusto. Il numero serve per il tratto BASSO -- locale tecnico e corridoio,
   * che sotto coperta ci devono stare -- e li' va guardato.
   *
   * Lo si tiene perche' misura qualcosa di vero, non perche' giudichi. Il
   * giudizio richiederebbe la superficie visibile di scafo e tuga, che questo
   * modulo non ha.
   */
  let francoChiglia = null
  let poseSopraPonte = null
  let campionePonte = null
  let margineMinimoPonte = null

  function contaPoseSopraPonte () {
    if (!pose || !pose.length) return
    let sopra = 0
    let peggiore = Infinity
    for (const v of pose) {
      const t = MathUtils.clamp((v.p.z - PRUA_Z) / (POPPA_Z - PRUA_Z), 0, 1)
      const margine = sezioneA(t).ponteY - v.p.y   // positivo = la camera sta SOTTO
      if (margine < 0) sopra++
      if (margine < peggiore) peggiore = margine
    }
    poseSopraPonte = sopra
    margineMinimoPonte = peggiore
    /* per chi deve capire se il numero e' plausibile: qualche riga in chiaro */
    campionePonte = [0, 24, 48, 72, 95].map((i) => {
      const v = pose[Math.min(i, pose.length - 1)]
      const t = MathUtils.clamp((v.p.z - PRUA_Z) / (POPPA_Z - PRUA_Z), 0, 1)
      const sez = sezioneA(t)
      return { i, z: +v.p.z.toFixed(3), camY: +v.p.y.toFixed(3),
               ponteY: +sez.ponteY.toFixed(3), chiglia: +sez.chiglia.toFixed(3) }
    })
  }

/**
 * ─── QUANTO E' LIBERA LA VISTA DAVANTI, posa per posa
 *
 * Guardando il provino: dentro il corridoio l'inquadratura e' piatta, in alcuni
 * tratti la camera guarda una PARETE invece di guardare lungo il passaggio, e i
 * tubi non si vedono mai perche' ci passa sotto senza inquadrarli.
 *
 * Luci, materie e 327 pezzi d'arredo valgono zero se la camera li tiene fuori
 * quadro: la curva decide se il lavoro si vede.
 *
 * «Piatta» pero' e' un'impressione, e un'impressione non si corregge. Questa la
 * trasforma in un numero: da ogni posa si tira un raggio nella direzione dello
 * sguardo e si misura quanto corre prima di incontrare una superficie. Dove la
 * distanza crolla, li' la camera sta guardando un muro -- e si sa QUALE muro e
 * a che punto della corsa.
 *
 * Serve agli strumenti, non alla pagina: e' un accessore che si legge, non un
 * comportamento che cambia.
 */
const _raggio = new Raycaster()
/**
 * ─── E IL RAGGIO DEVE GUARDARE LO STRATO DEL MONDO
 *
 * Prima stesura: TUTTE le pose risultavano «vista libera», cioe' nessun colpo,
 * dentro un corridoio largo ottantacinque centimetri. Impossibile, e infatti
 * era il metro.
 *
 * `Raycaster` ha i propri strati e di serie guarda solo lo zero. Ma le maglie
 * del mondo stanno sullo strato 1 da quando le ho isolate dalla luce di fuori:
 * il raggio le attraversava senza vederle. Lo stesso meccanismo che ha risolto
 * l'illuminazione ha rotto la misura, in silenzio -- e senza il numero
 * impossibile non me ne sarei accorto.
 */
_raggio.layers.enable(STRATO_MONDO)
const _dir = new Vector3()

function vistaLibera (s) {
  const posa = posaA(s)
  if (!posa) return null
  _dir.set(0, 0, -1).applyQuaternion(posa.q).normalize()
  _raggio.set(posa.p, _dir)
  _raggio.far = 40
  const colpi = _raggio.intersectObjects(maglieDelMondo(), false)
  if (!colpi.length) return { m: null, cosa: null }
  /* in metri del mondo: la scena e' scalata 1/METRI_PER_UNITA */
  return { m: +(colpi[0].distance * METRI_PER_UNITA).toFixed(2), cosa: colpi[0].object.name || '(senza nome)' }
}

  const _pa = new Vector3()
  const _qa = new Quaternion()
  const _qc = new Quaternion()
  function posaA (s) {
    if (!pose || pose.length < 2) return null
    const x = MathUtils.clamp(s, 0, 1) * (pose.length - 1)
    const i = Math.min(pose.length - 2, Math.floor(x))
    const f = x - i
    _pa.copy(pose[i].p).lerp(pose[i + 1].p, f)
    _qa.copy(pose[i].q).slerp(pose[i + 1].q, f)
    if (correzione) {
      /* si innesta solo sull'ultimo tratto, e in modo continuo: a s = 1-INNESTO
         la correzione e' nulla, a s = 1 e' intera */
      const t = Math.max(0, (MathUtils.clamp(s, 0, 1) - (1 - INNESTO)) / INNESTO)
      if (t > 0) {
        _qc.identity().slerp(correzione, t)
        _qa.premultiply(_qc)
      }
    }
    return { p: _pa, q: _qa }
  }

  /**
   * ─── CHI PROIETTA LO DECIDE LA POSA, e non un secondo padrone
   *
   * ─── E LA DISTANZA SI MISURA NELLO STESSO SISTEMA, o non e' una distanza
   *
   * Primo tentativo, e il provino non e' cambiato di un pixel: confrontavo la
   * `x` della posa con la `x` della lampada. La posa che `posaA` restituisce e'
   * gia' in coordinate di SCENA -- serve a `camera.position.copy` -- mentre le
   * lampade sono figlie del gruppo, cioe' in METRI del mondo, su un asse che il
   * gruppo per giunta ruota (la x del mondo diventa la z della scena). Due
   * numeri con lo stesso nome e due significati: a s = 0,05, con la camera a
   * -9,5 m, proiettavano le due lampade del SALONE.
   *
   * Adesso la posa si riporta dentro il gruppo con `worldToLocal`, e li' le due
   * x sono la stessa x.
   *
   * Le mappe si cuociono quando una lampada ENTRA fra le due: `needsUpdate` una
   * volta, e poi mai piu' -- ne' la stanza ne' la lampada si muovono.
   */
  /**
   * ─── LA LAMPADA VIVA SEGUE QUELLA PIU' VICINA
   *
   * Con la luce cotta le stanze non hanno piu' bisogno di lampade, ma l'arredo
   * si': tubi, staffe, macchine e corrimano nascono in JS e nella cottura non
   * ci sono. Invece di tenerne nove accese -- che e' il prezzo che questo file
   * ha appena finito di misurare -- ne resta UNA, e si sposta sulla plafoniera
   * piu' vicina alla camera. Sopra la testa c'e' sempre una lampada, e le altre
   * si vedono come piastre luminose: il quadro non cambia, il conto si'.
   */
  const _viva = new Vector3()
  function seguiLaPlafoniera (dovePerLaScena) {
    if (LUCE_COTTA <= 0 || !postiPlafoniera.length) return
    const dove = gruppo.worldToLocal(_viva.copy(dovePerLaScena))
    /* le tre plafoniere piu' vicine alla camera: sono quelle che l'arredo
       davanti agli occhi vede davvero, e le altre non arriverebbero */
    const vicine = postiPlafoniera
      .map((p) => ({ p, d: Math.abs(p.x - dove.x) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, LUCI_A_RUNTIME)
    for (let i = 0; i < LUCI_A_RUNTIME; i++) {
      const l = luciPronte[1 + i]
      if (l && vicine[i]) l.position.copy(vicine[i].p)
    }
  }

  const _dentro = new Vector3()
  function scegliChiProietta (dovePerLaScena) {
    if (!plafoniere.length) return
    const dove = gruppo.worldToLocal(_dentro.copy(dovePerLaScena))
    const vicine = plafoniere
      .map((l) => ({ l, d: Math.abs(l.position.x - dove.x) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, OMBRE_QUANTE)
      .map((v) => v.l)
    if (!ombreggianti.length) ombreggianti = plafoniere.filter((l) => l.castShadow)
    const uguali = vicine.length === ombreggianti.length && vicine.every((l, i) => l === ombreggianti[i])
    if (!uguali) {
      for (const l of ombreggianti) if (!vicine.includes(l)) l.castShadow = false
      for (const l of vicine) l.castShadow = true
      ombreggianti = vicine
      daRicuocere = RICOTTURE
    }
    if (daRicuocere > 0) {
      for (const l of ombreggianti) l.shadow.needsUpdate = true
      daRicuocere--
    }
  }

  /**
   * ─── E LE LUCI SI ALLOCANO SUBITO, prima del primo disegno
   *
   * MISURATO: con le luci create all'arrivo del GLB, il fotogramma in cui
   * nascono dura SEI SECONDI -- il conteggio delle luci passa da tre a tredici
   * e ogni materiale gia' compilato ne vuole uno nuovo. Allocandole qui, alla
   * creazione della scena, il primo programma di ogni materiale nasce gia' con
   * il conteggio definitivo: la compilazione si paga una volta, distribuita
   * come sempre su cio' che entra in quadro.
   *
   * Sono spente (intensita' zero) finche' `accendiLuci` non le mette al loro
   * posto: una luce spenta non illumina, ma CONTA.
   */
  preparaLuci()
  /* le tele procedurali si generano adesso, mentre il GLB e' ancora in volo:
     costano 756 ms e non dipendono da lui. Vedi `preparaMaterie`. */
  preparaMaterie()
  scena.add(gruppo)

  return {
    gruppo,
    caricato: Promise.all([caricato, curva]).then((v) => {
      /* qui, e solo qui, il gruppo e' appoggiato sulla chiglia E le pose
         esistono: e' l'unico istante in cui comporle e' corretto */
      if (v[0] && v[1]) { componiPose(); misuraFrancoChiglia(); contaPoseSopraPonte(); accendiLuci() }
      return v[0] && v[1]
    }),
    posaA,
    vistaLibera,
    /** La tabella completa, posa per posa -- vedi misuraFrancoPose(). */
    francoPose: () => francoPose,
    /**
     * L'inventario di quello che questo modulo ha MESSO nel mondo -- arredo e
     * plafoniere -- come scatole nel frame del gruppo, cioe' in metri. Serve a
     * rispondere «ma i tubi ci sono?» con un numero invece che scrutando un
     * fotogramma grigio: nel provino non si vedevano, e non si poteva dire se
     * mancassero o se fossero solo fuori quadro.
     */
    inventario: () => {
      gruppo.updateWorldMatrix(true, true)
      const inv = new Matrix4().copy(gruppo.matrixWorld).invert()
      const b = new Box3()
      const m = new Matrix4()
      const out = []
      for (const radice of [gruppo.getObjectByName('arredoMondo'), gruppo.getObjectByName('luciPratiche')]) {
        if (!radice) continue
        radice.traverse((o) => {
          if (!o.isMesh || o === radice) return
          if (!o.geometry.boundingBox) o.geometry.computeBoundingBox()
          m.multiplyMatrices(inv, o.matrixWorld)
          b.copy(o.geometry.boundingBox).applyMatrix4(m)
          const f = (v) => [v.x, v.y, v.z].map((n) => +n.toFixed(2))
          out.push({ in: radice.name, tipo: o.geometry.type, min: f(b.min), max: f(b.max) })
        })
      }
      return out
    },
    ancoraA,
    get ancorato () { return ancorato },
    get lunghezza () { return lunghezza },
    get pose () { return pose ? pose.length : 0 },
    /* «pronto» vuol dire USABILE, non «il GLB e' arrivato». Senza le pose
       composte la camera non viene spostata, e accendere la geometria vista
       dalla camera del sito mostrerebbe le stanze da fuori per qualche
       fotogramma. Una sola condizione, cosi' chi la legge non deve saperne due. */
    get pronto () { return pronto && !!pose },
    get errore () { return errore },
    get maglie () { return maglie },
    /** `q` da 0 a 1: quanto il mondo e' in campo. Per ora acceso/spento. */
    /**
     * ─── E DENTRO LO SCAFO NON SI VEDE IL MARE
     *
     * Con la luce giusta la scala si leggeva, ma ai lati compariva il mare e
     * una riga orizzontale tagliava il quadro a meta' -- la stessa che si vede
     * nel provino, anche sopra le due persone del finale.
     *
     * NON ERANO LE NORMALI. L'ipotesi ovvia -- volumi modellati da fuori, facce
     * posteriori scartate -- l'ho provata con `DoubleSide` e non e' cambiato
     * niente. Misurato invece di indovinato: le pareti ci sono e sono visibili,
     * x da -0,21 a +0,22 e y da 0,11 a 1,82, e la camera sta a
     * (0,01 · 0,52 · 3,93), cioe' DENTRO in tutte e tre le direzioni.
     *
     * Quello che si vedeva era il MARE DEL SITO disegnato sopra: la camera
     * durante la traversata sta sulla linea d'acqua, e il piano del mare
     * attraversa il corridoio.
     *
     * Gli strati risolvono anche questo, e in una riga: mentre si e' dentro, la
     * camera smette di guardare lo strato zero -- mare, cielo, scafo, tutto
     * cio' che sta fuori. Restano solo gli ambienti e le loro plafoniere, che
     * e' esattamente cio' che si vede stando sotto coperta.
     *
     * Si riaccende uscendo, perche' il resto del racconto e' tutto la' fuori.
     */
    /**
     * `q` accende la GEOMETRIA. Lo strato di fuori lo governa `soloDentro`, ed
     * e' una cosa diversa: vedi li' sotto il perche' averle unite fosse un
     * difetto.
     */
    mostra (q, coda = 0, rapporto = 0) {
      gruppo.visible = pronto && q > 0.002
      /**
       * ─── E LE LUCI SI SPENGONO TARDI, non alla giunzione
       *
       * Tenerle accese per sempre costa: sono nove punti luce nella chiave del
       * programma di ogni materiale, e su una GPU software (la CI, e i telefoni
       * peggiori) un fotogramma passa da 749 a 1.434 ms. La corsa 308 e' morta
       * proprio li': `page.screenshot` scaduto nel finale.
       *
       * Spegnerle costa una ricompilazione -- e' la stessa cosa che alla
       * giunzione costava 5,3 secondi. Ma DOVE la si paga cambia tutto: alla
       * giunzione il visitatore sta guardando il salone che arriva; a un terzo
       * della coda la lastra copre gia' tutto il quadro da un pezzo, e dietro
       * non c'e' piu' niente da guardare.
       *
       * Quindi le luci restano finche' la lastra non ha finito il suo lavoro, e
       * si spengono li'. Il numero non e' scelto a occhio: `CODA_CONSEGNATA` di
       * `index.js` vale 0,13 ed e' dove la lastra e' piena; 0,35 e' ben oltre.
       */
      if (luci) luci.visible = !(pronto && coda > CODA_SPEGNI_LUCI)
      /* chi proietta lo decide chi si vede: `mostra` e' l'unico che sa se la
         stanza e' in scena, e riceve la stessa corsa della posa */
      if (gruppo.visible) {
        const p = posaA(q)
        if (p) { scegliChiProietta(p.p); seguiLaPlafoniera(p.p) }
        aggiornaProiezione(q, coda, rapporto)
      }
    },

    /**
     * ─── ESSERE DENTRO E SPEGNERE IL FUORI SONO DUE COSE DIVERSE
     *
     * Erano una sola, e produceva un BUCO NERO fra il corridoio e il salone.
     * Misurato lungo la consegna:
     *
     *   f 0,45   copertura 0,207   maschera 2
     *   f 0,55   copertura 0,822   maschera 2
     *   f 0,62   copertura 1,000   maschera 3
     *
     * La copertura saliva -- la lastra del salone c'era e si stava aprendo --
     * ma la maschera era 2, cioe' lo strato zero spento, e la lastra vive
     * proprio li'. Il numero DICHIARAVA una consegna che il fotogramma non
     * disegnava: per un terzo della consegna lo schermo restava vuoto.
     *
     * E' la stessa bugia che `coperturaTraversata` raccontava sul filmato
     * tolto, in un altro punto: una copertura e' un'opacita', non una prova che
     * qualcosa si veda.
     *
     * Lo strato di fuori si spegne SOLO mentre si attraversa davvero. Appena
     * comincia la coda si riaccende, cosi' il salone puo' aprirsi sopra il
     * mondo che e' ancora li' dietro -- ed e' proprio la sovrapposizione che
     * rende la consegna continua invece di uno stacco.
     */
    soloDentro (si) {
      if (!cameraDelSito) return
      if (si && pronto) cameraDelSito.layers.disable(0)
      else cameraDelSito.layers.enable(0)
    },
    /**
     * Dove stanno le plafoniere, nel frame del MONDO (metri).
     *
     * Serve alla cottura: le posizioni le decide un raggio che misura il
     * soffitto a runtime, quindi in Blender non si possono ricalcolare a mano
     * senza rifare lo stesso conto e rischiare che i due divergano. Si
     * misurano qui, dove nascono, e si esportano.
     */
    luciPratiche: () => {
      if (!luci) return []
      gruppo.updateWorldMatrix(true, true)
      const inv = new Matrix4().copy(gruppo.matrixWorld).invert()
      const p = new Vector3()
      return luci.children
        .filter((o) => o.isPointLight && o.intensity > 0)
        .map((o) => {
          o.getWorldPosition(p)
          p.applyMatrix4(inv)
          return {
            p: [+p.x.toFixed(4), +p.y.toFixed(4), +p.z.toFixed(4)],
            intensita: +o.intensity.toFixed(4),
            portata: +o.distance.toFixed(4),
            colore: '#' + o.color.getHexString()
          }
        })
    },

    /**
     * Il nodo del mondo, per chi deve FARLO COMPILARE PRIMA.
     *
     * Le stanze si disegnano solo quando entrano nel tronco di visione, quindi
     * i loro programmi nascono quando la camera ci arriva -- e il guscio del
     * salone e' l'ultimo, cioe' proprio alla giunzione. Chi ha il renderer puo'
     * chiedere di compilarli in anticipo: `compile` traversa anche gli oggetti
     * che non si vedono.
     */
    get nodo () { return gruppo },

    /** Lo stato, per i cancelli: cosi' misurano invece di fidarsi. */
    get stato () {
      return {
        pronto,
        errore,
        maglie,
        visibile: gruppo.visible,
        scala: gruppo.scale.x,
        offsetZ: gruppo.position.z,
        offsetY: gruppo.position.y,
        sfondamentoPonte: sfondamento,
        francoChiglia,
        ancorato,
        tempiAncoraggio,
        luci: luci ? luci.children.filter((c) => c.isLight).length : 0,
        /* la proiezione sul guscio: quanto ne arriva adesso e quanto siamo
           lontani dalla posa in cui e' esatta. Un cancello (o io in un
           provino) deve poterlo LEGGERE invece di dedurlo dal colore */
        proiezione: proiezioni.length && proiezioni[0].uniformi
          ? { miscela: +(proiezioni[0].uniformi.uMiscela.value.toFixed(3)), pezzi: proiezioni.length, arrivo: [+proiettore.position.x.toFixed(3), +proiettore.position.y.toFixed(3), +proiettore.position.z.toFixed(3)] }
          : null,
        vestite,
        arredati,
        riallineati,
        diag,
        correzioneGradi: correzione ? +(2 * Math.acos(Math.min(1, Math.abs(correzione.w))) * 180 / Math.PI).toFixed(2) : null,
        /* misurati nello spazio della scena, non sull'asset -- vedi
           contaPoseSopraPonte() e la nota che la accompagna */
        poseSopraPonte,
        margineMinimoPonte,
        campionePonte,
        /* intersezione vera maglia-contro-posa, sei raggi per posa -- vedi
           misuraFrancoPose(). Il conto AABB del revisore (13) e' un tetto. */
        franco: francoRiassunto,
        pose: pose ? pose.length : 0,
        lunghezzaCurva: lunghezza,
        ponte: 'DERIVATO, non confermato — vedi collaudo-verticale.mjs'
      }
    }
  }
}
