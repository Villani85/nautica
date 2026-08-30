/**
 * SE SULLA PORTA C'E' UN ALTRO BUILD, IL CANCELLO LO DEVE DIRE.
 *
 * ─── IL DIFETTO, che è costato tre corse e non era nel sito
 *
 * I cancelli col browser si comportano in due modi, e tutti e due hanno lo
 * stesso buco:
 *
 *   · alcuni RIUSANO un server gia' acceso sulla porta -- scelta giusta, ed e'
 *     quella che permette a `npm run collaudo` di accendere una preview sola
 *     invece di ventidue;
 *   · altri ne avviano uno alla cieca -- e se la porta e' occupata, Vite ne
 *     sceglie un'altra in silenzio mentre il cancello continua a navigare su
 *     quella che credeva.
 *
 * In tutti e due i casi il cancello puo' finire per **misurare il `dist` di un
 * altro processo**. Non da' errore: da' un numero.
 *
 * Costato tre corse su `collaudo-nudge`, che bocciava due battute su quattro
 * dicendo che non comparivano. Comparivano benissimo, ma nel `dist` di questa
 * copia di lavoro, mentre la pagina misurata veniva da un `vite preview`
 * rimasto acceso. Il tradimento era un `rms null`: un campo che il bundle
 * vecchio non aveva. Sulla stessa macchina erano occupate SETTE porte di
 * collaudo, e la 5180 -- il predefinito di quattro cancelli -- e' anche quella
 * di `npm run dev`.
 *
 * ─── E PERCHÉ NON BASTA GUARDARE SE LA PORTA È OCCUPATA
 *
 * DIFETTO DELLA PRIMA VERSIONE DI QUESTO FILE, preso alla prima corsa della
 * suite intera. Avvisava quando la porta rispondeva, e basta. Ma in una suite
 * il primo cancello accende la preview e **tutti gli altri la trovano
 * occupata**: l'avviso compariva ventidue volte su una condizione che e' la
 * norma e che va benissimo.
 *
 * Un cancello che grida al lupo a ogni corsa smette di essere letto, ed e'
 * peggio di uno che tace: e' rumore che copre il segnale vero.
 *
 * La cura non e' abbassare la voce, e' **correggere cosa misura**. La domanda
 * giusta non e' «c'e' qualcuno sulla porta?» ma «quel qualcuno serve IL MIO
 * BUILD?». Si confronta il bundle: il nome del file che `dist/index.html`
 * dichiara, contro quello che il server sta servendo. Uguali, silenzio -- il
 * riuso e' esattamente cio' che deve succedere. Diversi, e allora si parla,
 * perche' quel cancello sta per misurare un altro sito.
 *
 * E' la regola di questo repo -- *un metro rotto non da' errore, da' un
 * numero* -- applicata due volte: una allo strumento, e una a questo avviso.
 *
 * Si chiama PRIMA di avviare qualunque cosa: dopo, la risposta sarebbe la
 * propria e il confronto non direbbe niente.
 */
import { readFileSync, existsSync } from 'node:fs'

/** Il nome del bundle che una pagina dichiara. Null se non se ne trova uno. */
function bundle (html) {
  const m = html.match(/<script[^>]+src="([^"]*assets\/[^"]+\.js)"/)
  return m ? m[1].split('/').pop() : null
}

export async function avvisaSePortaAltrui (porta, { base = '/' } = {}) {
  let servito = null
  try {
    const r = await fetch(`http://localhost:${porta}${base}`, { redirect: 'follow' })
    if (r.status >= 400) return false
    servito = bundle(await r.text())
  } catch {
    /* nessuno risponde: la porta e' libera, ed e' il caso normale */
    return false
  }

  let mio = null
  for (const p of ['dist/index.html', 'dist/nautica/index.html']) {
    if (existsSync(p)) { mio = bundle(readFileSync(p, 'utf8')); if (mio) break }
  }

  /* se non si riesce a stabilire l'identita' di uno dei due, si tace: un
     avviso basato su un confronto che non si e' potuto fare sarebbe la stessa
     cosa che questo file esiste per evitare */
  if (!servito || !mio || servito === mio) return false

  console.log('')
  console.log(`  ATTENZIONE: sulla porta ${porta} risponde un server che serve UN ALTRO BUILD.`)
  console.log(`  lui serve  ${servito}`)
  console.log(`  qui c'e'   ${mio}`)
  console.log('  Quello che segue e la misura di un altro sito, non di questo.')
  console.log('  Per misurare la propria build: PORTA_COLLAUDO=<porta libera> npm run collaudo')
  console.log('')
  return true
}
