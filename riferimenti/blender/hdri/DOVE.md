# L'ambiente della cottura

`ambiente.hdr` **non sta nel repo**: pesa 7 MB, e il sito intero ne pesa 2. E'
un ingresso della cottura offline, non un pezzo spedito al browser — la pagina
non cambia di un byte con o senza.

Si riprende cosi':

```bash
curl -L -o riferimenti/blender/hdri/ambiente.hdr \
  https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/machine_shop_01_2k.hdr
```

**Poly Haven, licenza CC0.** E' un'officina vera con finestre vere: serve
perche' un metallo con `metalness: 1` mostra soltanto cio' che riflette, e
contro un gradiente piatto riflette una tinta sola. Era il motivo per cui il
pezzo usciva verde acqua — il colore del mondo, non del metallo.

Se il file manca, `cuoci.py` non si ferma: ripiega su un gradiente e lo **dice**
(`AMBIENTE gradiente (nessun hdri)`). Un render fatto cosi' e' leggibile ma non
e' una fotografia, e la riga in coda al log e' li' per non farlo dimenticare.
