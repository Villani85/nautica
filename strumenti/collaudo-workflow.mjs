/**
 * IL WORKFLOW E' UN FILE, e nessuno lo leggeva.
 *
 * ─── Il difetto che ha pagato questo cancello
 *
 * Cancellando il passo della cinematica da `pubblica.yml` e' rimasto il suo
 * `env:` orfano, attaccato al passo precedente che l'`env:` ce l'aveva gia'.
 * Due chiavi uguali nella stessa mappa: GitHub Actions rifiuta il file INTERO
 * e la corsa parte con **zero job**. Rossa, senza un errore che dica dove.
 *
 * E' la peggiore forma del difetto di questo repo -- «un metro rotto non da'
 * errore, da' un numero» -- portata all'estremo: qui il metro non da' nemmeno
 * quello. Diciotto cancelli scritti per giudicare il sito, e nessuno guardava
 * il file che decide se quei diciotto girano.
 *
 * ─── Perche' gira in LOCALE e non in CI
 *
 * Non e' una svista ed e' il punto: se il workflow e' invalido la CI **non
 * parte**, quindi un cancello dentro la CI non potrebbe mai vederlo. Questo
 * deve fallire sulla macchina di chi scrive, prima della spinta.
 *
 * ─── Cosa NON misura, dichiarato
 *
 * Non e' un parser YAML: e' uno scanner a indentazione che cerca UNA classe di
 * difetto, le chiavi ripetute nella stessa mappa. Non vede gli errori di tipo,
 * i riferimenti a `needs` inesistenti, le espressioni `${{ }}` malformate.
 * Trova quello che e' costato sette corse rosse, e dichiara il resto scoperto.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const CARTELLA = '.github/workflows'
let rotti = 0

for (const nome of readdirSync(CARTELLA).filter(f => /\.ya?ml$/.test(f))) {
  const percorso = join(CARTELLA, nome)
  const righe = readFileSync(percorso, 'utf8').split('\n')

  /* ogni voce e' una mappa aperta: la colonna della sua prima chiave, e i nomi
     gia' visti li' dentro. Un elemento di lista nuovo azzera l'insieme. */
  const pila = []
  const guasti = []

  righe.forEach((riga, i) => {
    if (!riga.trim() || riga.trim().startsWith('#')) return

    /* i blocchi letterali (`run: |`) contengono shell, non YAML: si saltano
       finche' l'indentazione non risale, o si leggerebbero i loro due punti */
    const m = riga.match(/^(\s*)(-\s+)?([A-Za-z_][\w.-]*)\s*:(\s|$)/)
    if (!m) return

    const colonna = m[1].length + (m[2] ? m[2].length : 0)
    const chiave = m[3]
    const nuovaVoce = !!m[2]

    while (pila.length && pila[pila.length - 1].colonna > colonna) pila.pop()

    if (pila.length && pila[pila.length - 1].colonna === colonna) {
      const cima = pila[pila.length - 1]
      if (nuovaVoce) {
        cima.viste.clear()
      } else if (cima.viste.has(chiave)) {
        guasti.push({ riga: i + 1, chiave, prima: cima.dove.get(chiave) })
      }
      cima.viste.add(chiave)
      cima.dove.set(chiave, i + 1)
    } else {
      pila.push({ colonna, viste: new Set([chiave]), dove: new Map([[chiave, i + 1]]) })
    }
  })

  if (guasti.length) {
    rotti++
    console.log(`\n  ROTTO  ${percorso}`)
    for (const g of guasti) {
      console.log(`    riga ${g.riga}: la chiave "${g.chiave}" e' gia' presente alla riga ${g.prima}`)
      console.log(`           GitHub Actions rifiuta il file intero: la corsa parte con zero job.`)
    }
  } else {
    console.log(`  ok     ${percorso}  nessuna chiave ripetuta`)
  }
}

if (rotti) {
  console.log(`\n  ${rotti} workflow non pubblicherebbero niente.\n`)
  process.exit(1)
}
console.log('\n  i workflow sono leggibili da Actions.\n')
