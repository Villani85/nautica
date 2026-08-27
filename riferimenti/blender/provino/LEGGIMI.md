# Il banco della cottura

I `.blend` qui dentro NON sono il modello: sono i casi con cui `cottura.py`
viene messo alla prova, e si rifanno da zero con `provino-cottura.py`.

| file | come si rifa' | serve a |
|---|---|---|
| `provino.blend` | *(nessuna opzione)* | il caso sano: cubo smussato + scanalatura contro cubo nudo |
| `provino-difficile.blend` | `--fessura 0.45` | fabbrica le macchie: fessura profonda 3,2 volte la sua larghezza |
| `prov-dis45.blend` | `--disallinea 45` | alta e bassa che non combaciano: la copertura crolla |
| `prov-identico.blend` | `--identica` | controllo negativo: non c'e' NIENTE da cuocere |
| `prov-cage.blend` | `--fessura 0.45 --con-cage 0.05` | prova il `--cage` esplicito |

`uscita/` e `riferimento-2048.txt` sono l'ultima corsa buona, tenuta come metro.

## I numeri, cosi' non si rifanno a memoria

Cottura sana, 2048 px, occlusione a 64 campioni:

| | misurato |
|---|---|
| area UV | 3.394.968 texel, 80,94% della texture |
| cotta dentro l'area UV | **100,00%** |
| deviazione standard R / G | **18,06 / 17,39** livelli |
| texel con informazione | **76,66%** |
| macchie | **0,0001%** |
| metallicita' (costante 0,85) | min = max = **216,8**, dev 0,00 |
| rugosita' (0,15-0,55 dal rumore) | 38,2 - 140,2, dev 20,12 |
| occlusione | min 123,5 nell'angolo della scanalatura |
| lunghezza del vettore normale | 0,9956 - 1,0046, zero texel fuori dal 2% |
| convenzione | **+Y in su** (G sale a 254 verso il bordo, mai sotto 128) |

Distanza di ricerca che ha funzionato: **0,1732** su una diagonale di 3,4641,
cioe' il 5% - ed e' il predefinito, derivato dalla diagonale della bassa.
Estrusione 0,0346 (l'1%).

E il cage serve davvero: stesso provino con la fessura e raggio illimitato,
**0,0881% di macchie senza cage contro 0,0063% con**, quattordici volte meno.
