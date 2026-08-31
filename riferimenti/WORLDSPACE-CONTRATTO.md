# Contratto world-space della traversata

**Ricavato da `ciao.md` §15.4-15.6** il 31 agosto 2026, perché il file originale
sta dentro un pacchetto Drive da 9,4 MB e gli agenti che devono costruirci
contro non possono leggerlo da lì. Se il pacchetto arriva nel repo, **questo
file cede**: l'originale è l'autorità.

---

## 1 · Le collezioni

```
  WORLD_ROOT
  HULL_SECTION
  MECHANISM_BAY
  ENGINE_ROOM
  STAIR_CORRIDOR
  SALOON_SHELL
  CUT_CAPS
  CAMERA_PATH
  LIGHTMAP_RECEIVERS
  OCCLUDERS
```

## 2 · Le unità, e sono la trappola numero uno

**Si costruisce in METRI.** La conversione a unità di scena la applica il sito,
una volta sola, al root: **0,4 unità per metro** (1 unità = 2,5 m). Nessun
fattore nascosto sui sottoalberi.

Verificato da A2 il 31 agosto: i pannelli del guscio del salone misurano
**2,350143** contro i **2,35 m** dichiarati in `riferimenti/salone/posa.json` —
scarto 0,006%. I GLB del progetto sono già in metri.

> Un guscio costruito in unità sbagliate **non dà errore**: dà un modello che non
> combacia. È il modo in cui si perdono tre tentativi.

## 3 · Cosa deve fare la geometria

1. collegare **fisicamente** locale pinne, sala macchine, corridoio/scala e
   salone: non quattro set separati;
2. tenere il guscio **solo dove la fotografia e la geometria sono difendibili**.
   Oltre la zona ricostruita: buio, occlusione motivata o geometria neutra —
   **mai texture stirata spacciata per realtà**;
3. far attraversare alla camera **porte, montanti e piani di taglio reali**;
4. `posa.json` dichiara dove smette di misurare: il pavimento è letto con
   certezza fino a **X = 1,90 m**, il fondo è **scelto** a 6,00 m su un massimo
   teorico di 12,568. Oltre 1,9–2,2 m la proiezione deve **decadere** e
   consegnare a una paratia, una porta, un'ombra vera. Una causa materiale, non
   una dissolvenza nel vuoto.

## 4 · La camera

- curva world-space con continuità **almeno C1**; nei raccordi niente cambi
  bruschi di quaternione né rollio non motivato;
- **la durata non si cuoce nello spazio**: il sito deve poter rimappare il
  progresso di scroll sulla curva senza cambiarne la traiettoria;
- **una sola camera a runtime**. Le camere Blender servono per bake e confronto;
  il GLB esporta il percorso e i riferimenti, non impone un secondo mondo;
- nessun punto del percorso deve mostrare il bordo di un piano video, il retro
  del guscio, una parete aperta o il vuoto oltre il set.

## 5 · Gli otto criteri di accettazione

Il file **non è vero** finché non passano tutti.

| # | criterio |
|---|---|
| 1 | **Identità** — un solo canvas, renderer, `THREE.Scene`, camera e timeline del mare su tutto il percorso |
| 2 | **Spazio** — uscita dal meccanismo e arrivo nel salone verificabili in coordinate mondo; **nessun re-parenting alla camera** |
| 3 | **Scala** — authoring in metri, una sola conversione a 0,4 unità/metro sul root |
| 4 | **Video** — le persone possono restare una proiezione interna, ma il supporto **non deve mai mostrare i bordi** e deve ricevere occlusioni e parallasse dal guscio |
| 5 | **Continuità** — nessun loader intermedio, frame nero, reset del rollio, cambio di esposizione usato per nascondere un taglio |
| 6 | **Fluidità** — p95 del frame time sotto 25 ms, nessun picco oltre 50 ms nella traversata; asset caricati **prima** dell'ingresso, nessuna compilazione shader nel climax |
| 7 | **Esportazione** — GLB riproducibile **dallo script** e diffabile per gerarchia, bounding box e nomi. Il `.blend` da solo non basta |
| 8 | **Prova visiva** — video continuo registrato dalla **build reale**, dall'uscita del meccanismo fino alle persone. Non un render di Blender |

## 6 · Cosa NON conta come completamento

- una bella animazione `traversata.mp4`;
- un salone generato come singolo modello da una piattaforma text-to-3D;
- un `.blend` senza script e senza coordinate misurate;
- un GLB che il sito monta in una **seconda** scena;
- una dissolvenza che nasconde il passaggio;
- quattro render statici senza prova nella build WebGL;
- un risultato «fotorealistico» che non rispetta scala, cinematica o budget.

## 7 · Le consegne, tutte

```
  riferimenti/blender/scena-continua.blend
  riferimenti/blender/scena-continua.py
  public/modelli/traversata-world.glb
  texture/lightmap con licenza e provenienza
  strumenti/collaudo-traversata-world.mjs
  riferimenti/blender/prove/            render prima/dopo e misure
  referto: versione Blender, dimensioni, triangoli, texture, materiali,
           draw call attese, SHA-256 del GLB
```

## 8 · Il criterio che riassume tutto

> **«Un piano appeso alla camera che copre il 100% del quadro è un nuovo film
> anche se vive dentro lo stesso renderer.»**

Da cui il cancello: **in nessun fotogramma un piano camera-space deve coprire
l'intero canvas.**
