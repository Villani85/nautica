import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'

/**
 * COLLAUDO DELLA CINEMATICA — il meccanismo si muove davvero, e col rapporto
 * che dichiara.
 *
 *     node strumenti/collaudo-cinematica.mjs
 *
 * `collaudo-glb.mjs` legge il file. Questo guarda il sito che gira: sono due
 * domande diverse, e la seconda non discende dalla prima. Un GLB perfetto puo'
 * stare fermo in pagina, o muovere il nodo sbagliato, o muoverlo di una
 * quantita' che non si vede.
 *
 * ─── IL GUASTO PER CUI ESISTE
 *
 * L'eccentricita' dei dischi veniva ricavata dal `boundingSphere` del disco,
 * che pero' e' modellato centrato sull'asse: la misura restituiva 0,0005 m
 * invece di 0,012. I dischi orbitavano di mezzo millimetro. Sullo schermo il
 * riduttore sembrava una scatola chiusa — e nel file non c'era niente di
 * sbagliato da trovare.
 *
 * ─── COSA MISURA, E PERCHE' PROPRIO QUESTO
 *
 *   RAPPORTO   quanti gradi fa l'ingresso per ogni grado dell'uscita. E' il
 *              controllo piu' forte, perche' non c'e' modo di superarlo per
 *              caso: 29 esatti oppure il nodo sbagliato si sta muovendo
 *   ORBITA     l'escursione della posizione del disco, confrontata col doppio
 *              dell'eccentricita' dichiarata nel GLB. Il raggio NON va bene:
 *              su un'orbita circolare e' costante per costruzione, quindi la
 *              sua escursione e' zero sia che il disco giri sia che sia fermo.
 *              L'ho misurato cosi' per tre giri, leggendo zero ogni volta, e
 *              concludendo che il meccanismo era fermo mentre girava benissimo
 *   ESCURSIONE che la pinna si muova per davvero, e resti sotto i ±25° di §1.5
 *
 * ─── DOVE SI MISURA, E PERCHE' NON PIU' IN BASSO
 *
 * Il ciclo di disegno e' un `setAnimationLoop` che si **ferma quando la sezione
 * esce di campo**, com'e' giusto. Scorrendo troppo oltre si legge un
 * meccanismo immobile e si crede di aver trovato un guasto: e' successo. Quindi
 * si campiona DENTRO il capitolo, in tre punti, e non oltre.
 *
 * Ogni campione e' una valutazione separata: chiudersi dentro un `evaluate` con
 * un ciclo di `requestAnimationFrame` legge sempre lo stesso fotogramma.
 *
 * Non misura millisecondi.
 */

const PORTA = 5180
const BASE = `http://localhost:${PORTA}/nautica/`
const PUNTI = [0.15, 0.35, 0.60]      // frazioni del capitolo
const CAMPIONI_MINIMI = 20            // abbastanza da vedere un'escursione della pinna
const CAMPIONI_MAX = 160              // tetto: oltre, il meccanismo non gira e va detto
const PASSO_MS = 50

const RAPPORTO_TOLLERANZA = 0.02      // 2%: e' un rapporto esatto, non una stima
const ORBITA_TOLLERANZA = 0.15        // 15%: l'escursione campionata non tocca sempre i due estremi
const PINNA_MINIMA = 3.0              // gradi: sotto, il rapporto e' rumore diviso rumore
const GIRO_INTERO = 380               // gradi d'ingresso: sotto, l'orbita non ha spazzato tutto
const PINNA_MASSIMA = 25.5            // gradi, §1.5 con mezzo grado di margine numerico
const ORBITA_VISIBILE = 0.03          // eccentricita' osservata / raggio del disco

/** Stessa scala degli altri cancelli: Chrome di sistema, poi il ripiego. */
async function apriBrowser () {
  if (process.env.CHROMIUM) return await chromium.launch()
  try { return await chromium.launch({ channel: 'chrome' }) } catch {}
  try { return await chromium.launch() } catch {}
  console.error('nessun browser disponibile: `npx playwright install chromium`')
  process.exit(2)
}

/** Il server di anteprima, se non ce n'e' gia' uno acceso. */
async function serviteci () {
  try {
    const r = await fetch(BASE, { redirect: 'manual' })
    if (r.status < 500) return null
  } catch {}
  const s = spawn('npm', ['run', 'dev'], { shell: true, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    try { await fetch(BASE, { redirect: 'manual' }); return s } catch {}
    await new Promise(r => setTimeout(r, 500))
  }
  s.kill()
  console.error('il server non si e\' alzato')
  process.exit(2)
}

const server = await serviteci()
const browser = await apriBrowser()
const pagina = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  /**
   * SENZA QUESTO SI MISURA UN'ALTRA COSA.
   *
   * Un browser guidato dichiara `prefers-reduced-motion: reduce`, e il sito lo
   * ONORA: in movimento ridotto la pinna sta ferma a zero per progetto (vedi
   * `simulazione.js`). Un cancello che gira cosi' legge zero gradi e accusa il
   * meccanismo di essere fermo. Qui si misura la modalita' piena, e il
   * comportamento ridotto ha il suo interruttore a parte.
   */
  reducedMotion: 'no-preference'
})

const errori = []
pagina.on('pageerror', e => errori.push(String(e)))

await pagina.goto(BASE + '?ispeziona=1', { waitUntil: 'load' })
await pagina.waitForTimeout(1000)

const guasti = []
const righe = []
let dichiarati = null
let misurabili = 0        // punti dove la pinna si muove abbastanza da misurare il rapporto
let conGiro = 0           // punti dove l'ingresso ha fatto un giro intero

for (const f of PUNTI) {
  await pagina.evaluate(q => {
    const d = document.querySelector('#dimostrazione')
    scrollTo({ top: scrollY + d.getBoundingClientRect().top + d.offsetHeight * q, behavior: 'instant' })
  }, f)
  await pagina.waitForTimeout(4000)

  /**
   * SI CAMPIONA FINCHE' LA PRECONDIZIONE C'E', NON PER UN TEMPO FISSO.
   *
   * Con un numero fisso di campioni, quanti giri fa l'ingresso dipende da dove
   * si trova l'oscillazione quando arrivo: due esecuzioni identiche hanno dato
   * 490° e 194°. Un cancello che passa o fallisce a seconda della fase e'
   * intermittente, e un cancello intermittente si impara a ignorare.
   *
   * Quindi si campiona finche' l'ingresso non ha compiuto un giro intero, con
   * un tetto. Se il tetto si esaurisce, quello e' il risultato — e vuol dire
   * che il meccanismo non gira abbastanza per essere misurato, che e' una cosa
   * vera e non un capriccio del momento in cui ho guardato.
   */
  const serie = []
  const leggi = () => pagina.evaluate(() => {
    const n = window.__nautica
    if (!n) return null
    const q = s => n.scena.getObjectByName(s)
    const fin = q('RIG_FIN'); const cyc = q('RIG_CYCLO_A'); const inp = q('RIG_INPUT')
    if (!fin || !cyc || !inp) return null
    return {
      pinna: fin.rotation.x,
      orbitaY: cyc.position.y,
      orbitaZ: cyc.position.z,
      ingresso: inp.rotation.x,
      ecc: n.impiantoEccentricita ?? null,
      rapporto: n.impiantoRapporto ?? null,
      raggioDisco: n.impiantoDati?.cycloDiscRadiusM ?? null
    }
  })
  for (let i = 0; i < CAMPIONI_MAX; i++) {
    serie.push(await leggi())
    const v = serie.filter(Boolean).map(s => s.ingresso)
    const giro = v.length > 1 ? (Math.max(...v) - Math.min(...v)) * 180 / Math.PI : 0
    if (i >= CAMPIONI_MINIMI && giro >= GIRO_INTERO) break
    await pagina.waitForTimeout(PASSO_MS)
  }

  const buoni = serie.filter(Boolean)
  if (buoni.length < serie.length * 0.8) {
    guasti.push(`al ${(f * 100).toFixed(0)}% del capitolo la scena non e' interrogabile ` +
                `(${buoni.length} campioni su ${serie.length})`)
    continue
  }
  dichiarati ??= { ecc: buoni[0].ecc, rapporto: buoni[0].rapporto }

  const esc = k => {
    const a = buoni.map(v => v[k])
    return Math.max(...a) - Math.min(...a)
  }
  const G = 180 / Math.PI
  const dPinna = esc('pinna') * G
  const dIngresso = esc('ingresso') * G
  const dOrbita = Math.max(esc('orbitaY'), esc('orbitaZ'))
  const rapporto = dPinna > 0.01 ? dIngresso / dPinna : null

  righe.push(`  ${(f * 100).toFixed(0).padStart(3)}%  pinna ${dPinna.toFixed(2).padStart(6)}°  ` +
             `ingresso ${dIngresso.toFixed(0).padStart(4)}°  ` +
             `rapporto ${rapporto ? rapporto.toFixed(2) : '  —'}  ` +
             `orbita ${(dOrbita * 1000).toFixed(2)} mm`)

  /**
   * OGNI CONTROLLO GIRA SOLO DOVE HA SENSO, E QUESTA NON E' UNA CONCESSIONE.
   *
   * Prima versione: soglia secca «la pinna deve muoversi di almeno 3° in ogni
   * punto». Ha bocciato il 15% e il 60% del capitolo, dove la pinna fa 2° e 3°.
   * Ma li' il meccanismo non e' rotto: e' la storia che in quel momento e'
   * quieta — sistema appena acceso, o taglio che entra e rollio che si placa.
   * Un cancello che boccia un momento di calma non misura il meccanismo,
   * misura la drammaturgia, e costringe a truccare la seconda per far tacere
   * il primo.
   *
   * Quindi: le VERIFICHE valgono dove la precondizione c'e', e il cancello
   * pretende che almeno un punto la soddisfi. Se il meccanismo non gira MAI
   * abbastanza da poter essere misurato, quello si' che e' un guasto.
   */
  if (dPinna > PINNA_MASSIMA) {
    guasti.push(`al ${(f * 100).toFixed(0)}% la pinna arriva a ${dPinna.toFixed(2)}° di escursione, ` +
                `oltre i ±${PINNA_MASSIMA}° di §1.5`)
  }

  if (dPinna >= PINNA_MINIMA) {
    misurabili++
    const R = dichiarati.rapporto ?? 29
    if (Math.abs(rapporto - R) > R * RAPPORTO_TOLLERANZA) {
      guasti.push(`al ${(f * 100).toFixed(0)}% il rapporto osservato e' ${rapporto.toFixed(2)} invece di ${R}: ` +
                  'o si sta muovendo il nodo sbagliato, o la cinematica non e\' quella dichiarata')
    }
  }

  /**
   * L'ORBITA SI MISURA SOLO DOPO UN GIRO INTERO DELL'INGRESSO.
   *
   * La componente di un moto circolare spazza `2e` **su un giro completo**;
   * su un sesto di giro spazza molto meno, e confrontarla con `2e` significa
   * accusare di immobilita' un disco che sta girando. Misurato: al 15% del
   * capitolo l'ingresso fa 57° e l'orbita legge 11,3 mm invece di 24. Non era
   * un difetto — era una precondizione che non stavo controllando.
   *
   * Il confronto e' in METRI DEL MODELLO, senza la conversione 0,4: le
   * posizioni dei nodi vivono dentro la radice scalata, quindi si leggono
   * nell'unita' in cui il GLB e' stato scritto. E' anche l'unica unita' in cui
   * ha senso confrontarle con `eccentricityM`.
   */
  if (dIngresso >= GIRO_INTERO) {
    conGiro++
    const attesa = 2 * (dichiarati.ecc ?? 0.012)
    if (Math.abs(dOrbita - attesa) > attesa * ORBITA_TOLLERANZA) {
      guasti.push(
        `al ${(f * 100).toFixed(0)}% i dischi orbitano di ${(dOrbita * 1000).toFixed(2)} mm invece dei ` +
        `${(attesa * 1000).toFixed(2)} che l'eccentricita' dichiarata impone, e l'ingresso ha ` +
        `compiuto ${(dIngresso / 360).toFixed(1)} giri quindi la misura e' valida. ` +
        'Il sito non sta seguendo il modello.')
    }
    /**
     * E QUESTO NON SI APPOGGIA ALLA DICHIARAZIONE.
     *
     * Il controllo qui sopra confronta il moto con `eccentricityM`: se qualcuno
     * riscrive quel numero a 0,0005, il sito lo segue obbediente e il confronto
     * torna. L'ho provato — il cancello e' passato su un riduttore che orbitava
     * di un millimetro. Un controllo che si misura contro la propria fonte non
     * verifica niente: verifica di essere coerente con se stesso.
     *
     * L'unica domanda che non si puo' truccare cosi' e' se il movimento **si
     * veda**, e la si fa contro una grandezza che viene da un'altra parte: il
     * raggio del disco. Dodici millimetri su centotrentacinque sono un
     * meccanismo che gira; mezzo su centotrentacinque e' una scatola chiusa.
     */
    const R = buoni[0].raggioDisco
    if (typeof R === 'number' && dOrbita / 2 / R < ORBITA_VISIBILE) {
      guasti.push(
        `al ${(f * 100).toFixed(0)}% l'orbita dei dischi e' il ` +
        `${(dOrbita / 2 / R * 100).toFixed(2)}% del loro raggio: sotto il ${ORBITA_VISIBILE * 100}% ` +
        'non si vede, e un riduttore cicloidale che non si vede muovere e\' una scatola chiusa. ' +
        'E\' il guasto per cui questo cancello esiste.')
    }
  }
}

if (!misurabili) {
  guasti.push(`in nessuno dei ${PUNTI.length} punti la pinna supera ${PINNA_MINIMA}° di escursione: ` +
              'il meccanismo non si muove mai abbastanza da poter essere misurato, e ' +
              'un meccanismo che non si muove non dimostra niente')
}
if (!conGiro) {
  guasti.push('in nessun punto l\'ingresso compie un giro intero: l\'orbita dei dischi ' +
              'non e\' verificabile, e proprio li\' si nascondeva il guasto di stanotte')
}

console.log('cinematica dell\'impianto, dentro il capitolo della dimostrazione')
for (const r of righe) console.log(r)
if (dichiarati) {
  console.log(`  dichiarati nel GLB: rapporto ${dichiarati.rapporto ?? '(non esposto)'}, ` +
              `eccentricita' ${dichiarati.ecc ?? '(non esposta)'} m`)
}
if (errori.length) console.log('  errori di pagina: ' + errori.slice(0, 3).join(' | '))

await browser.close()
if (server) server.kill()

if (guasti.length) {
  console.error('\nCOLLAUDO CINEMATICA FALLITO')
  for (const g of guasti) console.error('  · ' + g)
  process.exit(1)
}
console.log('\ncollaudo cinematica: passato')
