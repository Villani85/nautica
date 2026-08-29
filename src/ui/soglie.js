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
 * QUANTO ROLLIO UNA PERSONA NOTA. In gradi RMS, non in nodi.
 *
 * E' la soglia piu' importante di questo file, perche' la leggono in due posti
 * che dicono la stessa cosa in due lingue diverse:
 *
 *   - `src/scena/composito.js` — sopra questo valore le due persone del salone
 *     si irrigidiscono;
 *   - `src/ui/nudge.js` — sopra questo valore compare «Try the gyro».
 *
 * Un numero solo, e non e' un'economia: e' la tesi. Il suggerimento del
 * giroscopio arriva **nell'istante in cui la coppia si irrigidisce**, cioe'
 * quando il problema che il giroscopio risolve e' diventato visibile su due
 * facce. Se fossero due numeri, prima o poi divergerebbero e il sito
 * suggerirebbe una cura per un male che nessuno sta vedendo.
 *
 * ─── SOSTITUISCE `IPOTESI_ANDATURA_GYRO_KN`, e la ragione e' una misura
 *
 * Fino a stanotte la condizione era «andatura sotto i 7 nodi»: un SURROGATO
 * del rollio, scelto quando il rollio non era ancora una grandezza leggibile.
 * Misurandolo, il surrogato si e' rivelato sbagliato in tutti e due i versi.
 *
 * Spegnendo la propulsione, tempo a cui il rollio diventa avvertibile contro
 * tempo a cui l'andatura scende sotto i 7 nodi:
 *
 *     mare 3    7 kn a 12,1 s     rollio avvertito a 24,7 s
 *     mare 4    7 kn a 12,1 s     rollio avvertito a 12,8 s
 *     mare 5    7 kn a 12,1 s     rollio avvertito a 11,9 s
 *
 * (La riga di mare 3 non e' il caso del sito: `regia.js` alza il mare a 4 con
 * lo scorrimento, e alla battuta del meccanismo ci si arriva sempre di li'.
 * Sta in tabella perche' e' il caso che smaschera il surrogato -- la colonna
 * dei 7 nodi e' identica su tutti e tre gli stati del mare, che e' il modo piu'
 * chiaro di dire che stava misurando la cosa sbagliata.)
 *
 * A mare 3 il surrogato faceva comparire «Try the gyro» dodici secondi prima
 * che ci fosse qualcosa da calmare: un suggerimento che indica un problema che
 * non si vede e' peggio di nessun suggerimento, perche' insegna che le
 * etichette di questo sito non corrispondono a niente. A mare 5 arrivava tardi.
 *
 * ─── DA DOVE VIENE 1,8, e la separazione non l'ho scelta io
 *
 * Misurato, `rollioRms` a regime sullo stesso mare e alla stessa andatura:
 *
 *     stabilizzatore ACCESO    mare 2  0,14-0,35    mare 5  0,35-0,89 gradi
 *     stabilizzatore SPENTO    mare 2  2,07-3,70    mare 5  5,17-9,24
 *
 * Fra 0,89 e 2,07 c'e' un vuoto largo piu' del doppio, e viene dalla fisica:
 * fra le due condizioni ci sono undici punti di guadagno di risonanza. 1,8 sta
 * dentro quel vuoto con margine da tutte e due le parti.
 *
 * ─── E RESTA UN'IPOTESI, nonostante la misura
 *
 * Quella misura dice dove sta il confine fra le due CONDIZIONI DELLA NAVE. Non
 * dice a che ampiezza una persona seduta in quel salone dice «sta rollando» --
 * e sono due domande diverse, come lo erano per l'andatura. La seconda non l'ho
 * misurata su nessuno.
 *
 * Si chiude cosi': cinque persone, si alza il mare a scatti con
 * `?studio=1` acceso, e si registra a che RMS dicono che la nave si muove.
 * Allora cambia nome, e cambia in DUE posti insieme -- che e' il vantaggio di
 * averla scritta una volta sola.
 */
export const IPOTESI_ROLLIO_AVVERTITO_RMS = 1.8

/**
 * L'ANDATURA A CUI LE PINNE HANNO PERSO IL 30% DELLA LORO AUTORITA'.
 *
 * Serve alla terza battuta dell'atto due -- «The fins are still on. They are
 * losing water.» -- che deve arrivare quando le pinne stanno GIA' perdendo e
 * non quando hanno gia' perso tutto. Se arrivasse insieme al giroscopio, le due
 * frasi direbbero la stessa cosa e la catena avrebbe tre anelli invece di
 * quattro.
 *
 * ─── DA DOVE VIENE IL NUMERO, ed e' meta' derivazione e meta' scelta
 *
 * La parte DERIVATA e' esatta. L'autorita' della pinna e' `C0 * (v/V_RIF)^2`
 * (`autorita()` in `simulazione.js`), quindi «autorita' al 70%» e' esattamente
 * «velocita' a sqrt(0,70) = 83,7% di V_RIF», cioe' 10,04 kn su 12. Qui e'
 * arrotondato a 10,0: la differenza e' quattro centesimi di nodo, che la
 * simulazione attraversa in meno di un decimo di secondo.
 *
 * La parte SCELTA e' il 70%, e viene dalla direzione artistica -- «quando
 * l'autorita' scende sotto circa il 70%». Non l'ho misurata su nessuno:
 * nessuno mi ha ancora detto a che punto della perdita si accorge che le pinne
 * stanno cedendo. Per questo il nome porta `IPOTESI_` come gli altri, anche se
 * la traduzione in nodi e' aritmetica pura.
 *
 * ─── E DIECI NODI NON E' UN NUMERO NUOVO, che e' la ragione per cui regge
 *
 * L'argomento arriva da un lavoro parallelo su `main`, ed e' piu' forte di
 * quello aritmetico: **10,0 e' una RIGA della tabella di stallo misurata**,
 * quella in cui la pinna e' gia' in stallo il 71% del tempo. Cioe' il punto in
 * cui l'autorita' e' persa per tre quarti, che e' esattamente cio' che questa
 * battuta deve nominare. I 7,0 di prima erano un valore scelto FRA due righe
 * misurate; qui se ne usa una.
 *
 * Su `main` quel ragionamento era stato applicato al suggerimento del
 * GIROSCOPIO, spostandone la soglia da 7 a 10 per farlo arrivare prima. La
 * diagnosi era giusta -- il nudge arrivava a 29,5 s e nessuno era piu' li' --
 * ma la cura curava il sintomo: un'andatura resta un SURROGATO del rollio, e
 * misurandolo sbaglia in tutti e due i versi (a mare 3 nomina il giroscopio
 * ventiquattro secondi prima che ci sia qualcosa da calmare). Il giroscopio
 * guarda adesso `IPOTESI_ROLLIO_AVVERTITO_RMS`, cioe' la cosa stessa. Il
 * numero di main resta, e sta qui: e' la soglia giusta per l'anello giusto.
 *
 * Nota che NON e' una soglia di tempo, ed e' il punto: con `ACCEL_RIF` a 0,30
 * la nave ci arrivava in 9,3 s e adesso in 4,3, e questa riga non e' cambiata.
 * Una soglia scritta in fisica sopravvive a un cambio di orologio; una scritta
 * in secondi marcisce in silenzio.
 *
 * Si chiude come le altre: cinque persone, `?studio=1`, e si guarda a che
 * punto della planata dicono che le pinne non ce la fanno piu'.
 */
export const IPOTESI_ANDATURA_PINNE_KN = 10.0

/**
 * IL RITARDO CON CUI UN CORPO RISPONDE AL MOVIMENTO DELLA NAVE.
 *
 * Serve alle due persone del salone (`src/scena/composito.js`). Senza,
 * cambiavano posa nel fotogramma in cui la soglia veniva superata -- cioe'
 * praticamente insieme al clic sull'interruttore -- e a schermo si leggeva
 * come un'animazione innescata da un bottone. E' precisamente la lettura che
 * il sito esiste per smentire: qui non si accende un macchinario, si cambia la
 * condizione fisica di due persone.
 *
 * **E' UN'IPOTESI, e 0,45 non e' un risultato.** La forchetta la si ricava --
 * sotto i 200 ms la reazione torna a sembrare simultanea al gesto, sopra i
 * 700 le due persone sembrano distratte invece che sedute su una nave -- ma
 * dentro la forchetta il valore e' una scelta, esattamente come i 400 ms della
 * quiete. Nessuna letteratura sui tempi di reazione posturale e' stata
 * consultata, e citarne una qui sarebbe la bugia comoda: quello che serve non
 * e' il tempo di reazione di un soggetto in laboratorio, e' il ritardo che
 * **si legge come umano** guardando due persone in un salone.
 *
 * Si chiude guardando: cinque persone a cui si mostra la stessa scena con tre
 * ritardi diversi, e si chiede quale delle tre coppie sta reagendo al mare
 * invece che al bottone. Allora cambia nome.
 */
export const IPOTESI_RITARDO_UMANO_S = 0.45

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
  { nome: 'IPOTESI_ROLLIO_AVVERTITO_RMS', valore: IPOTESI_ROLLIO_AVVERTITO_RMS, si_chiude_con: 'cinque persone, mare alzato a scatti: a che RMS dicono che la nave si muove' },
  { nome: 'IPOTESI_ANDATURA_PINNE_KN', valore: IPOTESI_ANDATURA_PINNE_KN, si_chiude_con: 'cinque persone: a che punto della planata dicono che le pinne non bastano piu' },
  { nome: 'IPOTESI_RITARDO_UMANO_S', valore: IPOTESI_RITARDO_UMANO_S, si_chiude_con: 'cinque persone, tre ritardi a confronto: quale coppia reagisce al mare e non al bottone' }
]
