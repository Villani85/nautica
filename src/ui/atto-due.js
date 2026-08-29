/**
 * LA MAPPA DELL'ATTO DUE — una sola, letta da tutti.
 *
 * ─── PERCHE' ESISTE, E PERCHE' NON STA DENTRO `tocco.js`
 *
 * `docs/13` §3 descrive lo spazio dell'atto due come una GRIGLIA: quattro
 * stazioni in lunghezza per tre quote, dodici celle. `docs/13` §8 chiede che
 * ogni cosa raggiungibile da desktop lo sia anche da telefono -- «non con lo
 * stesso gesto, con lo stesso esito».
 *
 * Un cancello che verifichi quella parita' ha bisogno di sapere **cosa
 * esiste**, e se lo sapesse dal modulo che costruisce l'interfaccia del
 * telefono verificherebbe che quel modulo e' d'accordo con se' stesso. E'
 * esattamente il difetto che questo repo ha gia' pagato due volte (il cancello
 * delle quote, quello che misurava il carico della macchina): uno strumento
 * costruito sulla stessa congettura che dovrebbe mettere alla prova.
 *
 * Quindi la mappa sta qui, da sola, e la leggono in tre posti diversi:
 *   - `src/ui/tocco.js` per COSTRUIRE la navigazione del telefono;
 *   - `strumenti/collaudo-telefono.mjs` per PRETENDERLA nel DOM vero;
 *   - chi domani costruira' la lama come strumento, per il desktop.
 *
 * Il cancello confronta la dichiarazione con il documento vivo. Se il DOM non
 * consegna quello che qui e' scritto, esce rosso: e' il senso di tenere le due
 * cose separate.
 *
 * ─── COSA C'E' DAVVERO OGGI, E NON E' QUELLO CHE DICE IL DOCUMENTO
 *
 * §3 prevede «sette o otto celle su dodici con qualcosa». Oggi ne esistono
 * **due**: la propulsione e gli stabilizzatori, che sono comandi veri in
 * pagina e macchine vere nella scena.
 *
 * Il giroscopio -- il controesempio del §4, quello che funziona a nave ferma --
 * e' a meta' strada, e la meta' che manca e' quella che conta qui: mentre
 * scrivo, `src/scena/macchine.js` gli ha dato una GEOMETRIA (`giroscopio.glb`,
 * collocato «basso e verso il centro di gravita'»), ma **non ha un comando in
 * pagina e non ha una riga di simulazione**. Non e' in questa tabella.
 *
 * Metterlo qui per completezza sarebbe la bugia piu' facile del repo:
 * l'interfaccia del telefono lo annuncerebbe, il cancello lo troverebbe
 * raggiungibile, e nessuno dei due starebbe guardando qualcosa che esiste.
 * **Questa tabella dichiara cio' che c'e', non cio' che ci sara'.**
 *
 * ─── A CHI LO COSTRUIRA': la stretta di mano e' di due righe
 *
 * Nel momento in cui il giroscopio avra' un comando in pagina, il cancello
 * della copertura (`collaudo-telefono.mjs`, sezione 5) diventa **rosso** --
 * enumera i comandi dal documento vivo e trova qualcosa che questa mappa non
 * conosce. Non e' un dispetto, e' il modo in cui la parita' si accorge di
 * essere stata dimenticata: e il rosso si spegne aggiungendo una riga a
 * `SISTEMI` (con la sua cella e la sua annotazione) e una a `COMANDI_NOTI`.
 * Nessuno deve toccare `tocco.js`: il telefono lo raggiunge da solo.
 */

/**
 * LE QUATTRO STAZIONI, da prua a poppa.
 *
 * L'ordine dell'elenco e' l'ordine sullo schermo e nel gesto: l'indice 0 sta a
 * SINISTRA nello schema, e trascinando il dito verso sinistra si va verso
 * poppa -- lo scafo segue la mano, che e' la stessa convenzione con cui
 * `comandi.js` ha dovuto invertire il segno della rotazione dopo averlo
 * misurato («la x della punta di prua passava da 314 a 41»).
 *
 * `x` e' la posizione longitudinale normalizzata (0 = prua, 1 = poppa) e serve
 * SOLO allo schema: non e' una coordinata di scena, e finche' la lama non e'
 * uno strumento non lo diventa. Chiamarla `metri` avrebbe suggerito una
 * precisione che qui non c'e'.
 */
export const STAZIONI = [
  { id: 'prua', nome: 'Bow', x: 0.12 },
  { id: 'avanti', nome: 'Forward', x: 0.38 },
  { id: 'centro', nome: 'Midship', x: 0.62 },
  { id: 'poppa', nome: 'Aft', x: 0.88 }
]

/**
 * LE TRE QUOTE, dall'alto in basso -- l'indice 0 e' la piu' alta.
 *
 * Sono quelle del §3: allestimento, locale macchine, sentina. `y` e' la quota
 * normalizzata dentro lo schema (0 = ponte, 1 = chiglia), e vale la stessa
 * avvertenza di `x`.
 */
export const QUOTE = [
  { id: 'allestimento', nome: 'Accommodation', y: 0.18 },
  { id: 'macchine', nome: 'Machinery', y: 0.52 },
  { id: 'sentina', nome: 'Bilge', y: 0.84 }
]

/**
 * I SISTEMI CHE ESISTONO, con la cella in cui stanno e il comando che li
 * governa.
 *
 * `comando` e' il selettore dell'ELEMENTO CANONICO gia' in pagina, non di una
 * copia. Il telefono non tiene stato: inoltra il clic a quel nodo e rilegge da
 * li' `aria-pressed`. E' la lezione scritta in `comandi.js` -- «lo stato
 * iniziale era scritto in due posti, il markup e stato.js, e nessuno dei due
 * sapeva dell'altro» -- applicata prima di ripagarla.
 *
 * `annotazione` e' cio' che compare **per quiete**, non per clic (§3: i punti
 * caldi «sono la morte»). Dice una cosa che il sito sostiene con il proprio
 * codice, non una didascalia di brochure: la caduta col quadrato della
 * velocita' e' `autorita()` in `simulazione.js`, e la si vede succedere.
 */
export const SISTEMI = [
  {
    id: 'propulsione',
    nome: 'Propulsion',
    stazione: 'poppa',
    quota: 'macchine',
    comando: '#propulsione',
    annotazione: 'Shaft, reduction, propeller. Take it away and the ship keeps ' +
                 'moving for a while — then it does not.'
  },
  {
    id: 'stabilizzatori',
    nome: 'Fin stabilisers',
    stazione: 'centro',
    quota: 'sentina',
    comando: '#stab',
    annotazione: 'Two fins, one per side. Their authority falls with the square ' +
                 'of speed, so the propulsion decides how well they work.'
  }
]

/**
 * I COMANDI CHE IL DESKTOP OFFRE, e dove il telefono li ritrova.
 *
 * ─── A COSA SERVE DAVVERO QUESTA TABELLA
 *
 * Il cancello della copertura enumera i comandi del desktop **dal documento
 * vivo**, non da qui. Poi chiede a questa tabella se li conosce. Un comando
 * che comparisse in pagina senza una riga qui esce ROSSO -- ed e' il caso che
 * la parita' deve prendere: qualcuno aggiunge una superficie al desktop e il
 * telefono non se ne accorge.
 *
 * `dentroLaGriglia: false` non e' un condono. Dice che quella cosa non sta
 * dentro lo scafo e quindi non ha una cella: lo stato del mare e' una
 * condizione del mondo, non una macchina a una quota. Resta raggiungibile dal
 * telefono nello stato normale della pagina -- dove i comandi ci sono e il
 * collaudo li misura gia' -- e il cancello continua a pretenderlo.
 */
export const COMANDI_NOTI = [
  { sel: '#mare', dentroLaGriglia: false, nome: 'Sea state' },
  { sel: '#propulsione', dentroLaGriglia: true, sistema: 'propulsione', nome: 'Propulsion' },
  { sel: '#stab', dentroLaGriglia: true, sistema: 'stabilizzatori', nome: 'Fin stabilisers' }
]

/** Le dodici celle, nell'ordine in cui le percorre un ciclo di prova. */
export const CELLE = QUOTE.flatMap((q, iq) =>
  STAZIONI.map((s, is) => ({ is, iq, stazione: s.id, quota: q.id, id: `${s.id}/${q.id}` })))

/** Cosa sta in una cella. Zero, uno o piu' di uno. */
export function sistemiIn (is, iq) {
  const s = STAZIONI[is]
  const q = QUOTE[iq]
  if (!s || !q) return []
  return SISTEMI.filter(x => x.stazione === s.id && x.quota === q.id)
}

/** In quale cella sta un sistema, per indici. `null` se non e' dichiarato. */
export function cellaDi (idSistema) {
  const x = SISTEMI.find(s => s.id === idSistema)
  if (!x) return null
  const is = STAZIONI.findIndex(s => s.id === x.stazione)
  const iq = QUOTE.findIndex(q => q.id === x.quota)
  return (is < 0 || iq < 0) ? null : { is, iq }
}

/**
 * Il nome della cella, come lo sente chi non la vede. Posizione e quota, e
 * nient'altro: cosa ci sia dentro lo si scopre arrivandoci e fermandosi, che
 * e' la regola del §3 e vale anche per un lettore di schermo.
 */
export function nomeCella (is, iq) {
  const s = STAZIONI[is]
  const q = QUOTE[iq]
  if (!s || !q) return ''
  return `${s.nome}, ${q.nome.toLowerCase()}`
}
