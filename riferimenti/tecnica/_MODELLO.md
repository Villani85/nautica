# MODELLO — come si scrive la scheda di un sito

Chi legge questa scheda e' un'altra intelligenza artificiale che il sito non lo
ha mai visto e non puo' navigarci. Deve poterne sapere tutto in una lettura:
cosa vende, come e' fatta l'esperienza, che colori, che caratteri, che testi,
cosa si muove e legato a cosa, e cosa cambia sul telefono.

Quindi: **niente impressioni, solo cose che si possono rimettere in pratica.**

---

## REGOLA SULLA MEMORIA, non negoziabile

Fai quasi tutto con `WebFetch` e `WebSearch`, che non aprono niente.

Se apri una scheda del browser — Chrome MCP o Playwright — **chiudila appena
hai finito con quella pagina**. Mai piu' di una scheda aperta per volta, mai
lasciarne aperte alla fine. Venti agenti che dimenticano una scheda ciascuno
saturano la memoria della macchina.

Alla fine del tuo lavoro verifica di non aver lasciato schede aperte.

---

## REGOLE DI SOSTANZA

- Ogni affermazione non ovvia va con la **fonte** (URL) accanto.
- Ogni voce di stack va marcata **VERIFICATO** (l'hai visto nel codice o in una
  fonte dello studio) o **SUPPOSTO**.
- Se il sito e' una single page application e da fuori si legge solo il guscio,
  **scrivilo**. Non dedurre lo stack dall'aspetto.
- Dove non sai, scrivi `non verificato`. Una scheda con dieci "non verificato"
  onesti vale piu' di una piena di invenzioni.
- Niente aggettivi da recensione. Mai "esperienza immersiva mozzafiato".
- I colori vanno in esadecimale. Se non riesci a leggerli dal CSS, prendili da
  uno screenshot e dichiara che sono stimati.
- I testi vanno **testuali**, nella lingua originale.

---

## PRIMA DI TUTTO: L'ESPERIENZA, NON IL CODICE

Le prime schede della ricerca sono uscite fortissime sul codice e deboli su
quello che conta per un'agenzia: **di cosa parla il sito, che esperienza e'
stata progettata, e a che scopo.** Un elenco di librerie non aiuta a vendere
niente.

Quindi le sezioni da **Cosa vende** a **L'esperienza in ordine di tempo** sono
la parte principale della scheda, non l'introduzione alla parte tecnica. Vanno
scritte come le scriverebbe un progettista, non un programmatore, e devono
rispondere a queste domande:

- **Di cosa tratta il sito.** Che cosa c'e' dentro, in concreto.
- **Qual e' l'obiettivo finale.** Vendere? Far chiedere un preventivo? Far
  candidare qualcuno? Farsi ricordare? Vincere un premio? Spesso l'obiettivo
  dichiarato e quello vero non coincidono: dillo.
- **Che esperienza e' stata progettata.** Cosa vive chi entra, in che ordine,
  con che ritmo. E' un racconto? una visita? un gioco? una vetrina?
- **Che cosa deve fare il visitatore**, passo per passo, e dove lo si porta.
- **Che cosa deve pensare o sentire uscendo**, e con quale singola immagine
  resta in testa.
- **Come e' organizzata la persuasione**: dove sta la promessa, dove la prova,
  dove il prezzo, dove la chiamata all'azione. E quante schermate ci vogliono
  per arrivarci.
- **Cosa succede se uno non scorre fino in fondo**: la maggior parte non lo fa.
  Il messaggio arriva lo stesso?

Se il sito ha un percorso d'acquisto o un modulo di contatto, **descrivilo per
intero**: e' la parte che i clienti veri pagano.

## LA STRUTTURA DELLA SCHEDA

Usa questi titoli, in questo ordine, senza cambiarli.

```
# <nome del sito>

- **URL**:
- **Premio**:
- **Studio**:
- **Anno**:
- **Letto il**: 13/08/2026

## Cosa tratta il sito
Che cosa c'e' dentro, in concreto. Prodotti? lavori? un racconto? una persona?

## Cosa vende, e qual e' l'obiettivo finale
Il prodotto vero, non la categoria. E l'obiettivo: vendere, far chiedere un
preventivo, far candidare qualcuno, farsi ricordare, vincere un premio. Se
l'obiettivo dichiarato e quello vero non coincidono, dillo.

## A chi
Chi e' il compratore, cosa sa gia', cosa teme, e cosa deve pensare uscendo.

## L'esperienza progettata
Cosa vive chi entra, in che ordine, con che ritmo. E' un racconto? una visita?
un gioco? una vetrina? Cosa deve FARE il visitatore, passo per passo, e dove lo
si porta. Con quale singola immagine resta in testa.

## Come e' organizzata la persuasione
Dove sta la promessa, dove la prova, dove il prezzo, dove la chiamata
all'azione — e quante schermate ci vogliono per arrivarci. **E cosa arriva a
chi NON scorre fino in fondo**, che e' la maggioranza.

## Idea regista
UNA riga: la cosa che tiene insieme tutta la pagina.

## Il momento
L'istante che si ricorda. Se e' legato allo scroll o a un video, di' dove cade.
Se non c'e', scrivi che non c'e' - e' un'informazione.

## Struttura, sezione per sezione
| sezione | cosa mostra | cosa fa l'utente | quanto dura (schermate di scroll) |

## L'esperienza in ordine di tempo
Prima i primi dieci secondi, secondo per secondo. Poi il resto a blocchi.

## Animazioni
| elemento | cosa si muove | legato a cosa (scroll / tempo / stato) | curva o inerzia | note |
Se riconosci la libreria dietro un effetto, scrivila.

## Colori
| ruolo | esadecimale | dove si usa |
Fondo, testo, secondario, accento, bordi, superfici, stati.

## Tipografia
| livello | famiglia | peso | corpo | interlinea | note |
Piu': come sono serviti i font (locali, servizio esterno, variabili).

## Testi veri
Titolo, sommario, claim, voci di menu, chiamate all'azione, piede. Testuali.

## Mobile
Cosa SPARISCE, cosa viene SOSTITUITO, cosa RESTA. E' la sezione piu' preziosa
di tutta la scheda: quasi tutti i siti belli sono un altro sito sul telefono.

## Stack
| voce | cosa usa | VERIFICATO / SUPPOSTO | come l'ho capito |
Framework, animazione, scroll, 3D, CMS, hosting, immagini.

## Peso e prestazioni
Numeri veri: peso della pagina, numero di richieste, tempi, punteggi. Se non ne
trovi, scrivilo.

## Tre cose da rubare
La MECCANICA, non l'estetica. Tre voci, concrete, rifacibili.

## Non verificato
Elenco onesto di cosa non sei riuscito a controllare e perche'.
```
