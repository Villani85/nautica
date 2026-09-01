"""
LA SVEGLIA — un processo che mi riporta al lavoro quando mi fermo.

    python strumenti/sveglia.py                 # tetto 10 ore, silenzio 20 min
    python strumenti/sveglia.py --silenzio 15 --tetto 480

─── PERCHE' ESISTE, E PERCHE' NON BASTA RICORDARSELO

Il committente, guardando da fuori: «stai andando avanti? a me non risulta».
Aveva ragione, e la causa era esatta: commit fatti e non spinti. Dentro la
sessione stavo lavorando; da fuori il repo era fermo.

Me l'ero scritto come regola -- si spinge a ogni difetto chiuso -- e l'ho
violata il giorno dopo. Una regola che si ricorda a mano e' una regola che un
giorno nessuno ricorda. Questo la rende un FATTO: un processo che sta in
ascolto e torna a bussare.

─── COME SVEGLIA

Non puo' chiamarmi. Ma un comando in secondo piano che ESCE genera una notifica,
e quella mi rientra. Quindi questa aspetta il primo fra sei fatti e poi muore
dicendo quale:

  1. il ramo remoto si e' mosso            -> c'e' una corsa da guardare
  2. la corsa e' finita                    -> verde o rossa, si agisce
  3. il sito servito e' cambiato           -> la pubblicazione e' arrivata
  4. ci sono commit non spinti e nessuna corsa gira  -> spingi
  5. l'HEAD locale e' fermo da N minuti    -> o sei bloccato o non committi
  6. il tetto                              -> per non restare appesa

─── COSA FA DIVERSAMENTE DAL PUNGOLO

Il pungolo (`pungolo.mjs`) guarda tre fatti. Questa ne guarda sei, e i due
aggiunti sono quelli che sono costati di piu':

* LA FINE DELLA CORSA. Il pungolo se ne accorgeva solo quando il remoto si
  muoveva o il sito cambiava, cioe' TARDI: fra la fine di una corsa e il push
  successivo passavano venti minuti in cui non lavoravo perche' stavo
  aspettando. Adesso la fine della corsa e' un fatto suo, e si riparte subito.

* NON SPINGERE DURANTE UNA CORSA. `cancel-in-progress: true` fa si' che ogni
  push UCCIDA la corsa precedente -- le corse 289 e 290 sono morte cosi'. Se una
  corsa gira, la sveglia lo dice invece di suggerire il push.

Nessuna chiave: le API pubbliche di GitHub bastano per lo stato delle corse, e
una sveglia non deve avere credenziali.
"""
import argparse
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request

REPO = "Villani85/nautica"
SITO = "https://villani85.github.io/nautica/"
PASSO_S = 30  # piu' spesso e' rumore


def guscio(cmd):
    """Un comando di shell che non alza: una sveglia non deve morire perche'
    git ha starnutito."""
    try:
        return subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=60
        ).stdout.strip()
    except Exception:
        return ""


def json_da(url):
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json"})
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.load(r)
    except Exception:
        return None


def bundle_servito():
    """Il nome del bundle che il sito PUBBLICATO sta servendo. E' l'unica prova
    che il lavoro sia arrivato a un visitatore: non «la corsa e' verde», il
    nome del file."""
    try:
        req = urllib.request.Request(
            SITO + "?x=" + str(int(time.time())),
            headers={"Cache-Control": "no-cache"},
        )
        with urllib.request.urlopen(req, timeout=20) as r:
            testo = r.read().decode("utf-8", "replace")
        i = testo.find("assets/index-")
        if i < 0:
            return None
        return testo[i : testo.find('"', i)]
    except Exception:
        return None


def corsa_ultima():
    d = json_da(f"https://api.github.com/repos/{REPO}/actions/runs?per_page=1")
    if not d or not d.get("workflow_runs"):
        return None
    r = d["workflow_runs"][0]
    return {
        "numero": r["run_number"],
        "stato": r["status"],
        "esito": r["conclusion"],
        "sha": r["head_sha"][:7],
    }


def testa_locale():
    return guscio("git rev-parse HEAD")


def testa_remota():
    """Si fa `fetch`, o si legge una copia ferma.

    `git rev-parse origin/main` legge il riferimento LOCALE al remoto, che si
    aggiorna solo con fetch o push. Senza, la sveglia potrebbe non accorgersi
    mai che il remoto e' cambiato -- e una sveglia che non vede il fatto per cui
    esiste e' peggio di nessuna sveglia."""
    guscio("git fetch -q origin main")
    return guscio("git rev-parse origin/main")


def non_spinti():
    n = guscio("git rev-list --count origin/main..HEAD")
    return int(n) if n.isdigit() else 0


def chiudi(motivo):
    print("")
    print("SVEGLIA — " + motivo)
    sys.exit(0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--silenzio", type=int, default=20, help="minuti di HEAD fermo prima di bussare")
    ap.add_argument("--tetto", type=int, default=600, help="minuti oltre i quali si spegne da sola")
    a = ap.parse_args()

    t0 = time.time()
    loc0 = testa_locale()
    rem0 = testa_remota()
    servito0 = bundle_servito()
    corsa0 = corsa_ultima()

    print(f"sveglia accesa · silenzio {a.silenzio} min · tetto {a.tetto} min")
    print(f"  locale  {loc0[:7]}")
    print(f"  remoto  {rem0[:7]}")
    print(f"  servito {servito0 or '?'}")
    if corsa0:
        print(f"  corsa   {corsa0['numero']} {corsa0['stato']} {corsa0['esito'] or ''}")
    sys.stdout.flush()

    ultimo_cambio = time.time()
    precedente = loc0

    while True:
        time.sleep(PASSO_S)

        loc = testa_locale()
        if loc and loc != precedente:
            precedente = loc
            ultimo_cambio = time.time()

        servito = bundle_servito()
        if servito and servito0 and servito != servito0:
            chiudi(
                f"IL SITO E CAMBIATO: {servito0} -> {servito}. "
                "La pubblicazione e arrivata: verifica cosa e uscito e dillo."
            )

        rem = testa_remota()
        if rem and rem != rem0:
            chiudi(
                f"il ramo remoto si e mosso: {rem0[:7]} -> {rem[:7]}. Controlla la corsa."
            )

        corsa = corsa_ultima()
        if corsa and corsa0:
            finita_ora = corsa0["stato"] != "completed" and corsa["stato"] == "completed"
            nuova = corsa["numero"] != corsa0["numero"]
            if finita_ora or (nuova and corsa["stato"] == "completed"):
                chiudi(
                    f"LA CORSA {corsa['numero']} E FINITA: {corsa['esito']} su {corsa['sha']}. "
                    + (
                        "Verde: spingi il lotto se ne hai, poi guarda il bundle servito."
                        if corsa["esito"] == "success"
                        else "Rossa: leggi il referto del passo fallito PRIMA di cambiare codice."
                    )
                )
            if nuova:
                corsa0 = corsa

        fermo_min = (time.time() - ultimo_cambio) / 60
        da_spingere = non_spinti()

        if da_spingere > 0 and fermo_min > 3:
            in_volo = corsa and corsa["stato"] != "completed"
            if in_volo:
                chiudi(
                    f"hai {da_spingere} commit non spinti, MA LA CORSA {corsa['numero']} "
                    f"({corsa['sha']}) STA GIRANDO. NON spingere: ogni push la annulla "
                    "(cancel-in-progress), ed e cosi che sono morte la 289 e la 290. "
                    "Aspetta che chiuda e spingi il lotto in una volta."
                )
            chiudi(
                f"HAI {da_spingere} COMMIT NON SPINTI da {fermo_min:.0f} minuti, e nessuna "
                "corsa sta girando. Da fuori il lavoro non esiste: spingi."
            )

        if fermo_min >= a.silenzio:
            chiudi(
                f"HEAD locale fermo da {fermo_min:.0f} minuti su {loc[:7]}. O sei bloccato, "
                "o stai lavorando senza committare: in entrambi i casi chiudi qualcosa "
                "e committala."
            )

        if (time.time() - t0) / 60 >= a.tetto:
            chiudi(f"tetto di {a.tetto} minuti raggiunto. Riaccendimi se serve.")


if __name__ == "__main__":
    main()
