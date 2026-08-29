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
 * ─── LE TRE SOGLIE DEL DITO, e perche' sono ipotesi come le altre due
 *
 * L'atto due su telefono (`src/ui/tocco.js`) muove la posizione a SCATTI fra
 * celle note invece che liberamente, e per farlo ha bisogno di tre numeri:
 * quanto si deve muovere il dito prima che si decida su quale asse sta
 * lavorando, quanti pixel valgono uno scatto, e quanto poco basta perche' un
 * contatto non conti come gesto.
 *
 * Nessuno dei tre si puo' ricavare ragionando. La forchetta si ricava -- sotto
 * i 10 px l'asse si decide sul tremolio della mano, sopra i 30 il gesto sembra
 * incollato -- ma **dentro la forchetta il valore e' una scelta**, esattamente
 * come i 400 ms della quiete. Quindi portano lo stesso prefisso e la stessa
 * regola: nessun cancello puo' verificarli.
 *
 * E' una distinzione che costa poco tenere e molto perdere: il cancello nuovo
 * della copertura (`collaudo-telefono.mjs`, sezione 5) fa uno scatto vero col
 * dito, e per farlo LEGGE questi numeri. Legge, non giudica -- trascina il
 * doppio del passo dichiarato e pretende UNO scatto. Se domani il passo
 * diventa 40 px il cancello resta vero, perche' non ha mai sostenuto che 24
 * fosse il numero giusto.
 *
 * Come si chiudono, ed e' la stessa strada delle altre due: cinque persone che
 * non conoscono il sito, con `?studio=1` acceso. I due segnali da guardare
 * sono gia' registrati -- i tentativi a vuoto (un dito che si muove e non
 * ottiene niente: il passo e' troppo lungo, o l'asse si e' bloccato sul lato
 * sbagliato) e il tempo al primo gesto efficace.
 */

/**
 * Quanto deve viaggiare il dito prima che l'asse si blocchi.
 *
 * **E' UN'IPOTESI.** Sotto, un gesto orizzontale con un filo di tremolio
 * verticale verrebbe letto come verticale; sopra, il primo scatto arriva tardi
 * e il gesto sembra morto proprio nell'istante in cui deve rispondere -- che
 * e' il difetto che `docs/13` §2 chiama per nome.
 */
export const IPOTESI_BLOCCO_ASSE_PX = 12

/**
 * Quanti pixel di viaggio valgono UNO scatto di cella.
 *
 * **E' UN'IPOTESI**, e non e' una velocita': e' una distanza. La scelta di
 * misurare il gesto in spazio invece che in slancio e' deliberata e va
 * riletta prima di cambiare il numero -- uno scatto a inerzia porta dove non
 * si e' deciso di andare, e qui le posizioni sono dodici e note.
 */
export const IPOTESI_PASSO_CELLA_PX = 24

/**
 * Sotto questo viaggio complessivo il contatto non e' un gesto: e' un dito
 * appoggiato, o una mano che si assesta sul telefono.
 *
 * **E' UN'IPOTESI**, ed e' anche il numero con cui `?studio=1` distingue un
 * tentativo a vuoto da un contatto qualunque: senza, la voce «tentativi a
 * vuoto» conterebbe le dita appoggiate e direbbe che l'interfaccia non si
 * capisce. `comandi.js` ne ha uno gemello (`SPOSTAMENTO_VERO`, 8 px) e la
 * ragione e' la stessa; non e' lo stesso numero perche' li' si parla di una
 * rotazione continua e qui di uno scatto.
 */
export const IPOTESI_GESTO_VERO_PX = 8

/**
 * L'ANDATURA SOTTO LA QUALE LE PINNE NON BASTANO PIU'.
 *
 * Serve al nudge del giroscopio: la quinta battuta dell'atto due -- «Try the
 * gyro» -- deve arrivare quando il rollio E' TORNATO, non dopo cinque secondi
 * in cui nessuno tocca niente. E il rollio torna perche' la pinna ha perso
 * acqua, cioe' a una certa andatura.
 *
 * Perche' e' un'IPOTESI e non una soglia. Il numero e' PLAUSIBILE e viene da
 * una misura vera fatta oggi -- a 6,1 kn la pinna e' in stallo l'87,5% del
 * tempo, contro lo 0,0% a 12,0 -- ma quella misura dice quando la pinna
 * satura, NON quando una persona che guarda si accorge che la nave rolla di
 * nuovo. Sono due cose diverse, e la seconda non l'ho misurata su nessuno.
 * Sette nodi cade fra i 10,0 (stallo 71%) e i 6,1 (stallo 87,5%) della
 * tabella; e' una scelta per poter costruire, non un risultato.
 *
 * Si chiude guardando delle persone: a che andatura dicono «sta ricominciando
 * a rollare». Allora cambia nome.
 */
export const IPOTESI_ANDATURA_GYRO_KN = 7.0

/**
 * L'elenco delle ipotesi vive, cosi' chi arriva le trova tutte in un posto
 * invece di scoprirle una alla volta. `strumenti/peso.mjs` non le tocca e
 * nessun cancello le legge: e' un promemoria per le persone, non un contratto
 * per le macchine.
 */
export const IPOTESI_APERTE = [
  { nome: 'IPOTESI_QUIETE_MS', valore: IPOTESI_QUIETE_MS, si_chiude_con: 'cinque persone, ?studio=1' },
  { nome: 'IPOTESI_RAGGIO_SISTEMA', valore: IPOTESI_RAGGIO_SISTEMA, si_chiude_con: 'cinque persone, ?studio=1' },
  { nome: 'IPOTESI_BLOCCO_ASSE_PX', valore: IPOTESI_BLOCCO_ASSE_PX, si_chiude_con: 'cinque persone col dito, ?studio=1: tentativi a vuoto e asse bloccato sul lato sbagliato' },
  { nome: 'IPOTESI_PASSO_CELLA_PX', valore: IPOTESI_PASSO_CELLA_PX, si_chiude_con: 'cinque persone col dito, ?studio=1: scatti chiesti contro scatti ottenuti' },
  { nome: 'IPOTESI_GESTO_VERO_PX', valore: IPOTESI_GESTO_VERO_PX, si_chiude_con: 'cinque persone col dito, ?studio=1: contatti che non producono niente' },
  { nome: 'IPOTESI_ANDATURA_GYRO_KN', valore: IPOTESI_ANDATURA_GYRO_KN, si_chiude_con: 'cinque persone: a che andatura dicono che la nave ricomincia a rollare' }
]
