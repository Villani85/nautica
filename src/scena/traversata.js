import { LinearFilter, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, VideoTexture } from 'three'

/**
 * LA TRAVERSATA INTERNA — dal meccanismo alle persone, senza tagli.
 *
 * ─── COS'E', E PERCHE' E' UN FILMATO E NON GEOMETRIA
 *
 * `docs/13` §5 chiude il finale cosi': la camera risale attraverso lo stesso
 * taglio, attraversa gli spazi interni e arriva alle stesse due persone della
 * prima immagine. Corridoi, porte, passaggi verticali e illuminazione continua
 * modellati in Blender sono settimane di lavoro, e — questa e' la parte che
 * conta — a quella distanza il tempo reale non regge il confronto con una
 * fotografia. Il committente l'ha detto una volta e vale ancora: *«per evitare
 * che si veda quel modellino che sembra plastica»*.
 *
 * Quindi la traversata la fa un filmato fotorealistico, ed e' la stessa
 * decisione gia' presa per la discesa. `public/filmati/traversata.mp4`: dieci
 * secondi, meccanismo alla linea d'acqua, attraverso lo scafo, sala macchine,
 * scala, corridoio, salone con le due persone.
 *
 * ─── PERCHE' NON E' UN <video> SULLA PAGINA, ED E' IL VINCOLO PIU' DURO
 *
 * `collaudo-continuita` fallisce se trova anche UN solo elemento `<video>`
 * visibile a schermo, e non e' una pedanteria: e' il cancello che difende la
 * conquista piu' costosa di questo repo — una scena sola, un canvas, una
 * camera, dall'inizio alla fine. Il salone era fatto di video appoggiati sulla
 * pagina, e quella architettura e' stata smontata apposta.
 *
 * Quindi il filmato entra come TESSITURA dentro la stessa scena, su un piano
 * appeso alla camera. Il `<video>` esiste ma sta fuori dal flusso, largo un
 * pixel e trasparente — e' l'unico modo in cui un browser garantisce di
 * consegnare fotogrammi a una `VideoTexture`, ed e' gia' il pattern di
 * `salone3d.js`: qui non si inventa niente, si riusa.
 *
 * E per la stessa ragione **non deve leggersi come un film a schermo pieno**
 * (`docs/13` §10): non e' un'altra architettura che prende il posto della
 * scena, e' materiale visivo dentro la scena che c'era gia'.
 *
 * ─── LA CUCITURA E' L'UNICA COSA CHE PUO' ROMPERLO
 *
 * Il primo fotogramma del filmato e' una ricostruzione generativa del
 * fotogramma di consegna del sito. Se i due non combaciano, chi guarda vede uno
 * stacco e capisce che da li' in poi sta guardando un video — che e'
 * esattamente cio' che il sito non vuole dire.
 *
 * Non si giudica a occhio: la misura la fa `strumenti/consegna.mjs`, che
 * confronta le tre grandezze con cui l'occhio si accorge di uno stacco — la
 * riga della linea d'acqua, il riquadro della pinna, i tre toni. **Questo
 * modulo non dichiara che la cucitura tiene: la dichiara quello strumento.**
 */

/** Dove sta il piano rispetto alla camera. Non e' un gusto: vedi `posiziona`. */
const DISTANZA = 1.0

export function creaTraversata (base, camera, scena) {
  const v = document.createElement('video')
  v.src = base + 'filmati/traversata.mp4'
  v.muted = true
  v.playsInline = true
  v.preload = 'auto'
  v.crossOrigin = 'anonymous'
  /**
   * NON in loop, e non e' una dimenticanza. La discesa e il salone girano in
   * ciclo perche' sono ambienti; questa e' una TRAVERSATA, e una traversata che
   * ricomincia da capo dice che non si e' arrivati da nessuna parte. Finisce
   * sulle persone e resta li'.
   */
  v.loop = false
  v.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px'
  document.body.appendChild(v)

  const tes = new VideoTexture(v)
  tes.colorSpace = SRGBColorSpace
  /**
   * `LinearFilter` esplicito e nessuna mipmap: la tessitura cambia a ogni
   * fotogramma e generare le mipmap costerebbe una ricostruzione al fotogramma
   * su un telefono. E' lo stesso motivo per cui `salone3d.js` non le chiede.
   */
  tes.minFilter = LinearFilter
  tes.magFilter = LinearFilter
  tes.generateMipmaps = false

  const mat = new MeshBasicMaterial({ map: tes, transparent: true, opacity: 0, depthTest: false, depthWrite: false })
  const piano = new Mesh(new PlaneGeometry(1, 1), mat)
  /**
   * Disegnato per ultimo e senza test di profondita': quando la traversata
   * prende il comando, e' lei il fotogramma. Con il test di profondita' acceso
   * lo scafo le passerebbe davanti, ed e' successo — sembrava che il filmato
   * fosse DENTRO la nave invece di sostituirla.
   */
  piano.renderOrder = 999
  piano.frustumCulled = false
  piano.visible = false
  camera.add(piano)
  /**
   * ─── E LA CAMERA VA MESSA NELLA SCENA, o questo piano non esiste
   *
   * DIFETTO PRESO GUARDANDO, non leggendo. Il primo provino mostrava il
   * meccanismo in 3D dove doveva esserci la traversata; il `<video>` era
   * `readyState 4`, arrivato a 10 secondi su 10, quindi decodificava
   * davvero -- semplicemente il suo piano non veniva disegnato.
   *
   * La causa e' una regola di three che non da' nessun errore: `WebGLRenderer`
   * attraversa il grafo a partire dalla SCENA, e la camera di questo sito non
   * ci era mai stata aggiunta -- non serviva, perche' nessuno le aveva mai
   * appeso niente. Un figlio della camera fuori dal grafo viene aggiornato
   * (la sua matrice e' giusta, `visible` e' vero, l'opacita' e' 1) e **non
   * viene mai disegnato**. Nessuna eccezione, nessun avviso: solo un
   * fotogramma in cui manca una cosa.
   *
   * Aggiungere la camera alla scena non cambia niente per il resto: una camera
   * nel grafo non si disegna, si limita a portarsi dietro i propri figli.
   */
  if (scena && camera.parent !== scena) scena.add(camera)

  /**
   * IL PIANO COPRE ESATTAMENTE IL CAMPO, e la misura non e' negoziabile.
   *
   * Un piano largo "quanto basta" lascia una riga di scena lungo un bordo su
   * qualche formato, e quella riga si vede come un difetto di montaggio. Le due
   * dimensioni si ricavano dal campo verticale e dal rapporto della tela:
   *
   *     alt  = 2 * DISTANZA * tan(fov/2)
   *     larg = alt * aspect
   *
   * Il filmato e' 16:9 e la tela quasi mai: si sceglie di RIEMPIRE — meglio
   * perdere gli estremi del fotogramma che mostrare due bande. Gli estremi
   * della traversata sono sacrificabili, il centro porta il soggetto.
   */
  function posiziona () {
    const alt = 2 * DISTANZA * Math.tan(camera.fov * Math.PI / 360)
    const larg = alt * camera.aspect
    const scalaVideo = 16 / 9
    const scalaTela = camera.aspect
    const riempi = scalaTela > scalaVideo ? larg / (alt * scalaVideo) : 1
    piano.scale.set(larg * Math.max(1, riempi), alt * Math.max(1, 1 / riempi), 1)
    piano.position.set(0, 0, -DISTANZA)
  }

  let avviata = false

  /**
   * `q` va da 0 a 1: 0 il 3D comanda, 1 comanda la traversata.
   *
   * La dissolvenza e' corta apposta — un quinto della corsa — perche' una
   * dissolvenza lunga fra due immagini che dovrebbero essere LA STESSA e' il
   * modo piu' rapido di dire che non lo sono. Se la cucitura e' buona non serve
   * quasi niente; se e' cattiva, allungarla non la ripara, la spalma.
   */
  function mostra (q) {
    const a = Math.max(0, Math.min(1, q * 5))
    mat.opacity = a
    piano.visible = a > 0.002
    if (piano.visible) posiziona()
    if (a > 0.002 && !avviata) {
      avviata = true
      v.play().catch(() => { /* rifiutata: resta il primo fotogramma, che e' la posa di consegna */ })
    }
    if (a <= 0.002 && avviata) { avviata = false; v.pause(); v.currentTime = 0 }
  }

  /** Il ciclo di disegno spento non deve lasciare un decodificatore acceso. */
  function spegni () { v.pause() }

  return { mostra, spegni, piano, video: v }
}
