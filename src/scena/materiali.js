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
  interno: new MeshStandardMaterial({
    color: 0x1b2224, metalness: 0.05, roughness: 0.95, side: BackSide
  }),

  accento: new MeshStandardMaterial({
    color: 0x4fe0c4, metalness: 0.55, roughness: 0.28
  }),

  vetro: new MeshStandardMaterial({
    color: 0x0b2226, metalness: 0.85, roughness: 0.12
  })
}
