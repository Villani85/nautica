import { MeshStandardMaterial, DoubleSide } from 'three'

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
    color: 0x707c82, metalness: 0.42, roughness: 0.44, side: DoubleSide
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
  vetro: new MeshStandardMaterial({
    color: 0x0b2226, metalness: 0.85, roughness: 0.12
  })
}
