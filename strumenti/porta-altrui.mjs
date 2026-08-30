/**
 * SE SULLA PORTA C'E' GIA' QUALCUNO, IL CANCELLO LO DEVE DIRE.
 *
 * ─── IL DIFETTO, che e' costato tre corse e non era nel sito
 *
 * I cancelli col browser si comportano in due modi, e tutti e due hanno lo
 * stesso buco:
 *
 *   · alcuni RIUSANO un server gia' acceso sulla porta -- scelta giusta in CI,
 *     dove piu' collaudi in fila condividono una preview sola;
 *   · altri ne avviano uno alla cieca -- e se la porta e' occupata, Vite ne
 *     sceglie un'altra in silenzio mentre il cancello continua a navigare su
 *     quella che credeva.
 *
 * In tutti e due i casi il cancello finisce per **misurare il `dist` di un
 * altro processo**. Non da' errore: da' un numero.
 *
 * Costato tre corse su `collaudo-nudge`, che bocciava due battute su quattro
 * dicendo che non comparivano. Comparivano benissimo, ma nel `dist` di questa
 * copia di lavoro, mentre la pagina misurata veniva da un `vite preview`
 * rimasto acceso. Il tradimento era un `rms null`: un campo che il bundle
 * vecchio non aveva. Sulla stessa macchina erano occupate SETTE porte di
 * collaudo, e la 5180 -- il predefinito di quattro cancelli -- e' anche quella
 * di `npm run dev`: con un server di sviluppo acceso, quei quattro smettono di
 * provare la build e nessuno se ne accorge.
 *
 * ─── LA CURA, che non e' vietare il riuso
 *
 * Il riuso serve. Si toglie il SILENZIO: se sulla porta risponde gia'
 * qualcuno, il cancello lo stampa in testa al proprio referto, cosi' un
 * verdetto strano si legge per quello che e' invece di mandare a cercare un
 * difetto che non c'e'.
 *
 * E' la regola di questo repo -- *un metro rotto non da' errore, da' un
 * numero* -- applicata allo strumento invece che al sito.
 *
 * Si chiama PRIMA di avviare qualunque cosa: dopo, la risposta sarebbe la
 * propria e l'avviso non direbbe niente.
 */
export async function avvisaSePortaAltrui (porta) {
  let altrui = false
  try {
    const r = await fetch(`http://localhost:${porta}/`, { redirect: 'manual' })
    altrui = r.status < 500
  } catch { /* nessuno risponde: la porta e' libera, ed e' il caso normale */ }
  if (!altrui) return false
  console.log('')
  console.log(`  ATTENZIONE: sulla porta ${porta} rispondeva GIA' un server.`)
  console.log('  Quel server serve il `dist` di CHI LO HA ACCESO, che puo non essere questo:')
  console.log('  quello che segue puo essere la misura di un altro sito.')
  console.log('  Per misurare la propria build: PORTA_COLLAUDO=<porta libera> npm run collaudo')
  console.log('')
  return true
}
