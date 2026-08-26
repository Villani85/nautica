import { MeshStandardMaterial, DoubleSide, BackSide, FrontSide } from 'three'

/**
 * I colori sono scritti in esadecimale e three li interpreta come sRGB
 * (ColorManagement e' attiva per impostazione predefinita da r152).
 * Sono gli stessi valori del foglio di stile: e' quello che tiene insieme
 * la giunzione fra il fondo CSS e il disegno WebGL. Se qui si applicasse un
 * tone mapping, il mare del canvas smetterebbe di combaciare con --acqua-viva
 * e la linea di galleggiamento si vedrebbe come una cucitura.
 */
export const materiali = {
  scafo: new MeshStandardMaterial({
    color: 0x707c82, metalness: 0.42, roughness: 0.44, side: FrontSide
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
   * `polygonOffset` spinge questa faccia indietro di un filo: coplanare non lo
   * e' piu', e la contesa non c'e' piu'. Dentro la sezione resta visibile
   * esattamente come prima, perche' li' la faccia esterna e' stata tagliata via
   * e non c'e' nessuno con cui contendersi il pixel.
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
