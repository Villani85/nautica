/**
 * L'ANTEPRIMA CHE UN CANCELLO SI PORTA DIETRO.
 *
 * ─── IL DIFETTO CHE HA FATTO ROSSE TRE CORSE
 *
 * `collaudo-finale-vivo`, `collaudo-ingombri` e `collaudo-corsa-viva` -- i tre
 * cancelli scritti il 31 agosto -- aprivano `http://localhost:4173/` dando per
 * scontato che un `vite preview` fosse gia' in ascolto. In locale lo e' sempre:
 * ce l'ho acceso in un'altra finestra da giorni.
 *
 * In CI non c'e' nessuno. E il modo in cui fallisce e' la parte istruttiva:
 * `net::ERR_CONNECTION_REFUSED` torna SUBITO, quindi il passo durava ZERO
 * SECONDI e il referto diceva «fallito». Zero secondi non somiglia a un
 * cancello che misura male: somiglia a un cancello rotto -- e infatti l'ho
 * cercato per tre corse nel posto sbagliato, convinto fosse un tetto o un
 * video.
 *
 * `collaudo-finale.mjs:52` faceva la cosa giusta da sempre: si accende la
 * propria anteprima su una porta sua. Questo modulo prende quella soluzione e
 * la rende comune, invece di ricopiarla in tre file -- dove la quarta copia
 * diverge.
 *
 * ─── E RIUSA QUELLA GIA' ACCESA, SE C'E'
 *
 * In locale accendere una seconda anteprima e' spreco, e su una porta occupata
 * fallisce. Quindi prima si chiede: c'e' gia' qualcuno? Se risponde, si usa
 * quello e non si accende niente -- e `ferma()` non uccide un server che non ha
 * avviato lui, che sarebbe il modo di spegnere la finestra di qualcun altro.
 */
import { spawn } from 'node:child_process'

const PORTA_PREDEFINITA = Number(process.env.PORTA_COLLAUDO || 4173)

const risponde = async (indirizzo) => {
  try {
    const c = new AbortController()
    const t = setTimeout(() => c.abort(), 1500)
    const r = await fetch(indirizzo, { signal: c.signal })
    clearTimeout(t)
    return r.ok
  } catch { return false }
}

/**
 * Garantisce che il sito sia servito, e restituisce come raggiungerlo.
 *
 * @returns {Promise<{indirizzo: string, ferma: () => void, avviata: boolean}>}
 */
export async function anteprima (porta = PORTA_PREDEFINITA) {
  const indirizzo = `http://localhost:${porta}/`

  if (await risponde(indirizzo)) {
    /* c'era gia': non si accende niente e non si spegne niente */
    return { indirizzo, ferma: () => {}, avviata: false }
  }

  const proc = spawn('npx', ['vite', 'preview', '--port', String(porta), '--strictPort'],
    { shell: true, stdio: 'ignore' })

  /**
   * Si aspetta che RISPONDA, non un tempo. Quaranta tentativi da mezzo secondo
   * sono venti secondi di tetto: su un runner lento `vite preview` ci mette
   * qualche secondo, e un'attesa fissa sarebbe o troppo corta la' o sprecata
   * qui.
   */
  let viva = false
  for (let i = 0; i < 40; i++) {
    if (await risponde(indirizzo)) { viva = true; break }
    await new Promise((r) => setTimeout(r, 500))
  }

  if (!viva) {
    try { proc.kill() } catch { /* gia' morto */ }
    throw new Error(
      `l'anteprima non risponde su ${indirizzo} dopo venti secondi. ` +
      'Senza sito servito questo cancello non misura niente: meglio dirlo che ' +
      'accusare la pagina.')
  }

  /**
   * Il `kill` va messo in un `finally` da chi chiama, non sui percorsi
   * previsti: se qualcosa si ferma prima -- un `goto` che non torna, un'attesa
   * scaduta -- il processo figlio resta vivo attaccato al ciclo di eventi e il
   * cancello NON TERMINA MAI. E' la firma di un blocco che non fallisce.
   */
  return { indirizzo, ferma: () => { try { proc.kill() } catch { /* gia' morto */ } }, avviata: true }
}
