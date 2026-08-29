/**
 * LE SOGLIE DELL'ATTO DUE, E IL LORO GRADO DI VERITA'.
 *
 * ─── PERCHE' ESISTE QUESTO FILE
 *
 * Questo repo si e' dato una regola dura -- non si dichiara un numero che non
 * si e' misurato -- e per un giorno intero quella regola ha BLOCCATO il lavoro:
 * l'atto due ha bisogno di soglie di interazione che si possono conoscere solo
 * guardando delle persone usare il sito, e le persone non ci sono ancora.
 *
 * La regola pero' non vieta i valori provvisori. Vieta di **presentarli come
 * dimostrati**. Sono due cose diverse, e confonderle e' costato una giornata.
 *
 * Quindi qui dentro ogni numero porta il suo grado, e il nome lo dice da solo:
 *
 *   IPOTESI_*    valore provvisorio, scelto per poter costruire. Nessun
 *                cancello puo' verificarlo, e nessun documento puo' citarlo
 *                come misura. Si sostituisce con una misura, non si difende.
 *   SOGLIA_*     validata su persone o su uno strumento. Porta accanto la
 *                prova e la data.
 *
 * Un cancello automatico puo' nascere solo dalla seconda specie. Un cancello
 * costruito su un'ipotesi certificherebbe la mia congettura invece del sito --
 * ed e' precisamente il difetto che questo repo ha gia' pagato due volte, con
 * il cancello delle quote e con quello che misurava il carico della macchina.
 *
 * ─── E IL COROLLARIO CHE VALE PIU' DELLA REGOLA
 *
 * **Nessun ritardo artificiale prima che la lama risponda.** L'attrito del
 * passaggio di consegne e' una cosa che si guarda addosso a qualcuno; la
 * prontezza della mano no, quella si da'. Se un giorno qualcuno mettesse qui
 * una `IPOTESI_ATTESA_PRIMA_DEL_CONTROLLO`, sarebbe da cancellare senza
 * discutere: la lama risponde subito, e l'unica cosa da misurare e' quanto ci
 * mette una persona a capire che ce l'ha in mano.
 */

/**
 * Quanto deve stare ferma la lama vicino a un sistema perche' compaia
 * l'annotazione.
 *
 * **E' UN'IPOTESI, e 400 non e' un risultato.** Viene da `docs/13` §3, che la
 * scrive come «da tarare guardando» -- non da una misura fatta qui. Il numero
 * serve solo a poter costruire l'annotazione prima di avere le persone: sotto
 * i 250 ms comparirebbe mentre si sta ancora muovendo, sopra i 700 sembrerebbe
 * rotta. Dentro quella forchetta, 400 e' una scelta e nient'altro.
 *
 * Si sostituisce dopo cinque persone che non conoscono il sito, con il dato di
 * `?studio=1`: la distribuzione delle pause vere e la quota di annotazioni
 * aperte e abbandonate subito. Se quella quota e' alta, la soglia e' troppo
 * bassa e sta interrompendo chi si sta ancora muovendo.
 *
 * Quando diventera' una misura, cambia NOME oltre che valore: `SOGLIA_QUIETE_MS`
 * con accanto la prova e la data. Finche' si chiama `IPOTESI_`, nessun cancello
 * la puo' verificare e nessun documento la puo' citare come numero.
 */
export const IPOTESI_QUIETE_MS = 400

/**
 * Il raggio, in unita' di scena, entro cui la lama e' «vicina» a un sistema.
 * Stessa specie del numero sopra, e la stessa strada per uscirne.
 */
export const IPOTESI_RAGGIO_SISTEMA = 0.9

/**
 * L'elenco delle ipotesi vive, cosi' chi arriva le trova tutte in un posto
 * invece di scoprirle una alla volta. `strumenti/peso.mjs` non le tocca e
 * nessun cancello le legge: e' un promemoria per le persone, non un contratto
 * per le macchine.
 */
export const IPOTESI_APERTE = [
  { nome: 'IPOTESI_QUIETE_MS', valore: IPOTESI_QUIETE_MS, si_chiude_con: 'cinque persone, ?studio=1' },
  { nome: 'IPOTESI_RAGGIO_SISTEMA', valore: IPOTESI_RAGGIO_SISTEMA, si_chiude_con: 'cinque persone, ?studio=1' }
]
