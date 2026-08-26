import { execFileSync } from 'node:child_process'

/**
 * CHIUDE UN FILMATO IN CICLO, dissolvendo la coda sulla testa.
 *
 *     node strumenti/chiudi-ciclo.mjs dentro.mp4 fuori.mp4 [secondi]
 *
 * PERCHE' SERVE. Un modello generativo produce cinque secondi che cominciano e
 * finiscono in due punti diversi: rimesso in ciclo, allo stacco le onde saltano
 * e la posizione dell'orizzonte cambia di qualche pixel. Dentro un finestrino
 * quello scatto si vede, e si vede **ogni cinque secondi** — cioe' nel momento
 * in cui il visitatore dovrebbe smettere di pensare che sta guardando un sito.
 *
 * PERCHE' NON SI FA AVANTI-E-INDIETRO. Sul mare funzionerebbe: un'onda al
 * contrario e' ancora un'onda. **Sulle persone no.** Un gesto che si riavvolge
 * si riconosce subito, ed e' peggio dello stacco che si voleva togliere.
 *
 * Quindi si prende la coda e la si dissolve sulla testa. Il filmato si accorcia
 * della durata della dissolvenza, e in quel tratto convivono due istanti
 * diversi — su un mare non si nota, su un gesto lento nemmeno. Su un movimento
 * ampio si noterebbe, e allora la strada e' generare piu' lungo, non dissolvere
 * di piu'.
 */

const [dentro, fuori, secondiArg] = process.argv.slice(2)
if (!dentro || !fuori) {
  console.error('  uso: node strumenti/chiudi-ciclo.mjs <dentro.mp4> <fuori.mp4> [secondi]')
  process.exit(2)
}
const D = Number(secondiArg || 0.7)

const durata = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
  '-of', 'csv=p=0', dentro]).toString().trim())
const utile = durata - D
console.log(`  durata ${durata.toFixed(2)}s, dissolvenza ${D}s, ciclo risultante ${utile.toFixed(2)}s`)

/**
 * IL VERSO CONTA, e la prima stesura ce l'aveva al contrario.
 *
 * Mescolavo la TESTA dentro la CODA: il filmato finiva con la propria coda
 * originale, quindi allo stacco del ciclo il salto restava esattamente dov'era
 * prima. Misurato confrontando primo e ultimo fotogramma: **10,6 e 17,1 punti
 * di scarto medio su 255**, cioe' nessun miglioramento. Il filtro girava, il
 * file usciva, e non serviva a niente.
 *
 * Il verso giusto: si parte dal filmato spostato in avanti di D, e alla fine
 * gli si dissolve sopra la testa. Cosi' l'ultimo fotogramma E' il primo, per
 * costruzione — e la verifica lo conferma invece di doverlo sperare.
 */
execFileSync('ffmpeg', ['-loglevel', 'error',
  '-i', dentro, '-i', dentro,
  '-filter_complex',
  `[0:v]trim=start=${D}:end=${durata},setpts=PTS-STARTPTS[corpo];` +
  `[1:v]trim=start=0:end=${D},setpts=PTS-STARTPTS[testa];` +
  `[corpo][testa]xfade=transition=fade:duration=${D}:offset=${(durata - 2 * D).toFixed(3)}[v]`,
  '-map', '[v]', '-an', '-c:v', 'libx264', '-crf', '26', '-preset', 'slow',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-y', fuori])

const peso = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=size',
  '-of', 'csv=p=0', fuori]).toString().trim())
console.log(`  scritto ${fuori} — ${(peso / 1024).toFixed(0)} KB`)
