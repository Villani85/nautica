/**
 * ALLA FINE DELLA TRAVERSATA IL SALONE DEVE ESSERCI.
 *
 *     node strumenti/collaudo-proiezione.mjs
 *
 * ─── PERCHE' ESISTE, e cosa e' successo prima che esistesse
 *
 * Il guscio del salone e' fatto di otto piani senza immagine. Per giorni gli
 * ultimi otto secondi della traversata sono stati una scatola color crema, e
 * nessun cancello lo diceva: la scena disegnava, la camera arrivava, il filmato
 * partiva. Tutto vero, e il finale era una stanza vuota.
 *
 * Adesso su quel guscio si proietta la fotografia dal punto in cui e' stata
 * scattata (`src/scena/proiezione.js`, decisione D68). E' la cosa piu' fragile
 * che il sito abbia: dipende da una posa, da una matrice, dagli strati, dal
 * rapporto del quadro e da un filmato che deve avere gia' un fotogramma. Ognuna
 * di quelle cose, se si rompe, NON DA' ERRORE: da' una stanza beige, cioe'
 * esattamente com'era prima.
 *
 * ─── COME SI MISURA, e perche' non guarda «se e' bello»
 *
 * Si scatta lo stesso identico fotogramma due volte -- proiezione accesa e
 * `?proiezione=0` -- e si guarda di quanto cambia il quadro su una griglia
 * 32x32 di medie locali. Non e' un giudizio di resa: e' la domanda «la
 * fotografia arriva sul guscio, si' o no».
 *
 * I numeri, dalla corsa del 2 settembre 2026 a 1440x900:
 *
 *     alla fine della traversata (s = 0,95)   198 livelli su 255 nel blocco
 *                                             peggiore, 41,7 di media
 *     due scatti IDENTICI (fondo di rumore)     6 livelli, 1,9 di media
 *
 * Trentatre volte il rumore. La soglia sta a 60, cioe' dieci volte il fondo e
 * un terzo di cio' che si misura: abbastanza alta da non passare se la
 * proiezione si spegne a meta', abbastanza bassa da non diventare rossa perche'
 * il filmato e' un fotogramma piu' avanti.
 *
 * ─── E SI GUARDA ANCHE UN TELEFONO
 *
 * Perche' li' si e' rotta davvero: il rapporto del proiettore veniva da un
 * oggetto che non e' la camera che disegna, e su 390x844 la stanza usciva come
 * un rettangolo sospeso in mezzo al beige. Su un quadro stretto la proiezione
 * copre meno, quindi la soglia e' piu' bassa -- ma il fatto da verificare e' lo
 * stesso: la fotografia c'e' o no.
 */
import { anteprima } from './anteprima.mjs'
import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const MISURE = [
  { nome: 'schermo largo', largo: 1440, alto: 900, s: '0.95', minimo: 60 },
  { nome: 'telefono', largo: 390, alto: 844, s: '0.95', minimo: 30 }
]
/** Due scatti identici non tornano identici: JPEG e scena viva. Misurato: 6. */
const RUMORE_ATTESO = 6

/* l'anteprima la accende il cancello: in CI non c'e' nessuno che serve il sito,
   e uno strumento che si appoggia a una finestra aperta sul mio PC non e' un
   cancello -- e' una comodita' */
const servito = await anteprima()

function scatta (dir, largo, alto, s, parametri) {
  execFileSync(process.execPath, ['strumenti/scatta-traversata.mjs'], {
    env: {
      ...process.env,
      S: s, FUORI: dir, LARGO: String(largo), ALTO: String(alto), PARAMETRI: parametri,
      INDIRIZZO: servito.indirizzo
    },
    stdio: 'ignore'
  })
  return `${dir}/s-${s}.jpg`
}

function scarto (a, b) {
  const g = execFileSync('ffmpeg', ['-loglevel', 'error', '-i', a, '-i', b,
    '-lavfi', 'blend=all_mode=difference,format=gray,scale=32:32:flags=area',
    '-f', 'rawvideo', '-'], { encoding: 'buffer' })
  let somma = 0
  let massimo = 0
  for (const v of g) { somma += v; if (v > massimo) massimo = v }
  return { massimo, media: somma / g.length }
}

console.log('la proiezione del salone: alla fine della traversata la stanza c e?\n')
const guai = []
for (const m of MISURE) {
  const base = mkdtempSync(join(tmpdir(), 'proiezione-'))
  const con = scatta(join(base, 'con'), m.largo, m.alto, m.s, 'proiezione=1')
  const senza = scatta(join(base, 'senza'), m.largo, m.alto, m.s, 'proiezione=0')
  const conDiNuovo = scatta(join(base, 'con2'), m.largo, m.alto, m.s, 'proiezione=1')
  const foto = scarto(con, senza)
  const rumore = scarto(con, conDiNuovo)
  console.log(`  ${m.nome.padEnd(14)} ${m.largo}x${m.alto}  ` +
              `la fotografia cambia ${String(foto.massimo).padStart(3)} livelli (media ${foto.media.toFixed(1)}) · ` +
              `fondo ${rumore.massimo}`)
  if (foto.massimo < m.minimo) {
    guai.push(`"${m.nome}": alla fine della traversata la proiezione cambia solo ${foto.massimo} livelli ` +
              `su 255 (minimo ${m.minimo}). Il guscio del salone e tornato una scatola vuota, ` +
              'e questo non da errore da nessuna altra parte.')
  }
  if (rumore.massimo > RUMORE_ATTESO * 3) {
    guai.push(`"${m.nome}": due scatti identici differiscono di ${rumore.massimo} livelli, ` +
              `contro i ${RUMORE_ATTESO} misurati. Il fondo si e alzato: la misura sopra vale meno di quanto sembra.`)
  }
}

servito.ferma()

if (guai.length) {
  console.error('\nCOLLAUDO PROIEZIONE FALLITO')
  for (const g of guai) console.error('  - ' + g)
  process.exit(1)
}
console.log('\ncollaudo proiezione: passato')
