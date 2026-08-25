# Hosting e deploy: dove stanno davvero i siti da premio, e quanto costa tenerli su

> Sonda eseguita il **13/08/2026** con `curl` (header HTTP reali), DNS-over-HTTPS
> di Google (`dns.google/resolve`) per CNAME/A, e `ip-api.com` per l'intestatario
> dell'IP. Nessun browser, nessuna pagina di terze parti: **la piattaforma e'
> dedotta dai byte che il server ha risposto a me**. I listini della sezione 3
> vengono dalle pagine ufficiali dei fornitori lette lo stesso giorno.
>
> Convenzione di questo file: **verificato** = l'ho letto in un header, in un
> record DNS o su un listino ufficiale. **Dedotto** = e' un conto o
> un'inferenza che faccio io, e lo dico.

---

## In una riga

Su 40 siti sondati, **Vercel e' la piattaforma piu' usata (9)**, ma **la scelta
che conta non e' quella: e' chi paga la banda**. Un sito immersivo da 40 MB a
visita con 50.000 visite/mese muove **circa 2 TB al mese**, e quel traffico
costa **$0 su Cloudflare, $15 su CloudFront a tariffa piatta, $20 su Bunny, $81
su CloudFront a consumo, $144 su Vercel Pro, $254 su Netlify a crediti e $569 su
un vecchio Netlify Pro**. Stessi byte, **cinquecentonovantasei dollari di
differenza al mese**. Chi vende un sito pesante senza aver fatto questo conto lo
regala.

E la trappola non e' teorica: nel febbraio 2024 un sito **statico, gratuito, con
cento visitatori al mese** ha ricevuto da Netlify una fattura da **$104.500** -
**190 TB in quattro giorni** su un singolo file audio da 3,44 MB. Verificato
(sezione 7.5).

---

## 1. Dove stanno: 40 siti, header per header

Colonna "come l'ho capito" = la prova. Dove ci sono due voci (es. Cloudflare +
Vercel) e' perche' **nella stessa risposta HTTP** compaiono gli header di
entrambi: uno e' il proxy davanti, l'altro e' la piattaforma dietro.

| # | sito | piattaforma | CDN / rete davanti | come l'ho capito |
|---|---|---|---|---|
| 1 | `2xa.studio` | VPS con **Plesk** (PHP 8.3.33) | **Cloudflare** | `Server: cloudflare` + `CF-RAY` + `x-powered-by: PleskLin` |
| 2 | `activetheory.net` | **Firebase Hosting** (Google) | **Fastly** | `X-Served-By: cache-fco2270031-FCO` (formato Fastly); A `199.36.158.100` = IP Firebase Hosting, org "Google LLC" su **AS54113 Fastly**; NS `ns-cloud-b1.googledomains.com` |
| 3 | `aristidebenoist.com` | origin **PHP 8.2.1** | **AWS CloudFront** | `Via: 1.1 ....cloudfront.net (CloudFront)` + `X-Amz-Cf-Id` + `X-Amz-Cf-Pop: FCO50-P2`; NS `awsdns` |
| 4 | `basement.studio` | **Vercel** (Next.js) | Vercel Edge Network | `Server: Vercel` + `X-Vercel-Id: fra1::` + `X-Nextjs-Prerender: 1`; NS `ns1.vercel-dns.com` |
| 5 | `by-kin.com` | **VPS proprio** (nginx 1.24 Ubuntu, Next.js) | **nessuna** | `Server: nginx/1.24.0 (Ubuntu)`, `X-Powered-By: Next.js`, nessun header di CDN; A `138.68.159.222` = **DigitalOcean** |
| 6 | `cuberto.com` | **DigitalOcean Spaces** (bucket S3-compatibile) | **Cloudflare** | `Server: cloudflare` + `cf-cache-status: HIT` + `x-amz-request-id: tx...-006a7db98d-...-fra1c` (firma Ceph/DO Spaces, regione `fra1`); NS `ns1.digitalocean.com` |
| 7 | `darkroom.engineering` | **Vercel** (Next.js) | Vercel | `Server: Vercel`, `X-Vercel-Id: fra1::`; NS `vercel-dns.com` |
| 8 | `dogstudio.co` | origin non esposto | **Cloudflare** | `Server: cloudflare`, `cf-cache-status: DYNAMIC`; NS `chloe.ns.cloudflare.com` |
| 9 | `dontboardme.com` | **VPS proprio** (nginx 1.24 Ubuntu, Nuxt) | **nessuna** | `Server: nginx/1.24.0 (Ubuntu)`, `x-powered-by: Nuxt`; A `77.83.103.45` = Hostprolab su **AS29802 Hivelocity** |
| 10 | `franshalsmuseum.nl` | **Vercel** (Next.js) | Vercel | A `76.76.21.21` (IP Vercel), `Server: Vercel`, catena di 307 con `X-Vercel-Id`; NS TransIP (dominio olandese tenuto altrove) |
| 11 | `hellomonday.com` | **Heroku** | **Cloudflare** | `via: 2.0 heroku-router` + `report-to` con endpoint `nel.heroku.com` + `Server: cloudflare` nella stessa risposta |
| 12 | **`igloo.inc`** | **Vercel** | **Cloudflare davanti** | risposta unica con `Server: cloudflare` + `CF-RAY` **e** `x-vercel-cache: HIT` + `x-vercel-id: fra1::`. Verificato anche sull'asset `/assets/index-2eb69c09.js`: `cf-cache-status: REVALIDATED`, `Age: 180316` |
| 13 | `immersive-g.com` | **Vercel** | Vercel | A `76.76.21.21`, `Server: Vercel`; NS OVH |
| 14 | `kodeclubs.com` | **Google App Engine / Firebase** | Google | `server: Google Frontend` |
| 15 | `kprverse.com` | statico (Nuxt) su **AWS** | **AWS CloudFront** | `Via: ...cloudfront.net`, `X-Amz-Cf-Pop: MXP64-P2`, A `108.138.199.x` = CloudFront. **DNS su Cloudflare ma non proxato** (nessun `CF-RAY`) |
| 16 | `landonorris.com` | **Webflow** | rete **Cloudflare** di Webflow | A `198.202.211.1`, org **"Webflow, Inc"** su AS209242 Cloudflare London; `Server: cloudflare`; 388 riferimenti a `website-files.com` nell'HTML |
| 17 | `locomotive.ca` | origin non esposto | **Cloudflare** | `Server: cloudflare`, `CF-RAY`; NS `aria.ns.cloudflare.com` |
| 18 | `lusion.co` | **Netlify** | Netlify Edge | `Server: Netlify` + `X-Nf-Request-Id: 01KZXJHE9DHV9TF8DRMD9NV7AA` |
| 19 | `matruecannabis.com` -> `ch.maswitzerland.com` | origin non esposto | **Cloudflare** | 301 con `Server: cloudflare`, `CF-RAY` su entrambi gli hop |
| 20 | `eiger-extreme.mammut.com` | **Netlify** (Next.js) | Netlify Edge | CNAME **`mammut.netlifyglobalcdn.com`**, `Server: Netlify`, `Netlify-Vary: cookie=__next_preview_data...` |
| 21 | `manayerbamate.com` | **Shopify** | rete Shopify (su AS Cloudflare) | A `23.227.38.32` = Shopify Inc. |
| 22 | `messenger.abeto.co` | origin non esposto | **Cloudflare** | `CF-Cache-Status: HIT`, `CF-RAY`; NS `ajay.ns.cloudflare.com` |
| 23 | `mosbyfiles.com` | **Vercel** (Nuxt) | Vercel | CNAME `af3ed016ab0d9cd0.vercel-dns-016.com`, `Server: Vercel`, `X-Powered-By: Nuxt` |
| 24 | `noomoagency.com` | **Vercel** | Vercel | `Server: Vercel`, A `216.150.1.1` = Vercel Inc. |
| 25 | `obys.agency` | **VPS proprio** (nginx) | **nessuna** | `Server: nginx/1.24.0 (Ubuntu)`, nessun header di CDN; A `167.71.71.166` = **DigitalOcean** (Amsterdam); NS `inhostedns.com` |
| 26 | `opalcamera.com` | **Vercel** (Next.js) | Vercel | `Server: Vercel`, `X-Nextjs-Prerender: 1`; **DNS su Cloudflare non proxato**; `op.al` e' un redirect Cloudflare |
| 27 | `orano.group` | **Microsoft Azure** | **Barracuda WAF-as-a-Service** | CNAME `app86599.prod.cudawaas.com` -> `trafficmanager.net` -> `...francecentral.cloudapp.azure.com`. **Nessun header identificativo nella risposta** (WAF che li rimuove) |
| 28 | `pangrampangram.com` | **Shopify** | Shopify | A `23.227.38.65` = Shopify; NS Cloudflare |
| 29 | `persepolis.getty.edu` | **AWS S3** | **AWS CloudFront** | `Server: CloudFront`, `x-amz-version-id`, `X-Cache: Hit from cloudfront`. CNAME **`getty-persia-prod-cdn.5d7072te.monks.zone`** = infrastruttura **Media.Monks**, l'agenzia che l'ha fatto |
| 30 | `prometheusfuels.com` -> `.ai` | **DreamHost** (Apache) | Fastly solo sul redirect | il `.com` risponde con `X-Served-By: cache-bgy-lime1210050-BGY` (Fastly) e redirige; il `.ai` e' `Server: Apache`, A `75.119.204.33` = DreamHost |
| 31 | `resn.co.nz` | **AWS S3** | **AWS CloudFront** | `Server: AmazonS3` + `Via: ...cloudfront.net` + `X-Amz-Cf-Pop: MXP63-P7`; NS `awsdns` |
| 32 | `revelatio.studio` | **Webflow** | rete Cloudflare di Webflow | A `198.202.211.1` (**stesso IP di landonorris.com**, org Webflow Inc); `Server: cloudflare`; **150 riferimenti a `cdn.prod.website-files.com`** nell'HTML |
| 33 | `simplychocolate.dk` | **Shopify** | Shopify | CNAME `shops.myshopify.com`, A `23.227.38.74` |
| 34 | `staratlas.com` | **Google Cloud Storage** dietro Cloud Load Balancer | Google | `server: UploadServer` (= GCS), `via: 1.1 google`, A `34.54.226.175` = Google Cloud |
| 35 | `trionn.com` | **VPS Hostinger** (Apache 2.4.52 Ubuntu + Next.js) | **nessuna** | `Server: Apache/2.4.52 (Ubuntu)` + `x-nextjs-cache: HIT`; A `62.72.29.102` = **Hostinger** (AS47583) |
| 36 | `umamiland.withgoogle.com` | **Google** (`gws`) | Google | `server: Google Frontend` sul 301, `Server: gws` sulla destinazione. **Oggi redirige a google.com: il sito e' stato dismesso** |
| 37 | `verostudio.com` | **Vercel** (Next.js) | Vercel | CNAME `bf955624aa0894fc.vercel-dns-016.com`, `Server: Vercel` |
| 38 | `zajno.com` | origin **PHP 8.2.6** | **AWS CloudFront** | `Via: ...cloudfront.net`, `X-Amz-Cf-Pop: YUL62-P1`; NS easyDNS |
| 39 | `minotti.com` (bersaglio Brianza) | origin **ASP.NET** | **Cloudflare** | `Server: cloudflare`, `x-aspnet-version: 4.0.30319`, `CF-RAY` |
| 40 | `porada.it` (bersaglio Brianza) | **Triboo** | **AWS CloudFront** | CNAME `porada.it.address.triboo.it`, `Via: ...cloudfront.net`, `X-Cache-Info: cached` |

### Le tre cose che si vedono solo mettendo in fila 40 header

**a) Nessuno degli studi premiati e' su un hosting condiviso italiano.** Zero
Aruba, zero Register, zero SiteGround. Chi non sta su una piattaforma sta su un
**VPS da 5-20 dollari al mese** (DigitalOcean, Hostinger, Hivelocity) - e sono
quattro: by-kin, obys, dontboardme, trionn.

**b) igloo.inc e' l'unico che ha capito il problema economico.** E' l'unico
sito del gruppo con **Cloudflare messo davanti a Vercel**. Non e' un dettaglio
di configurazione: e' la mossa che sposta la banda dal contatore a pagamento di
Vercel a quello **gratuito** di Cloudflare. Su un sito da **17,14 MB a visita**
(misura gia' agli atti in `igloo.md`) e' la differenza fra una bolletta a tre
cifre e zero. Vedi il conto nella sezione 4.

**c) I due Webflow condividono l'IP.** `landonorris.com` (Site of the Year
2025) e `revelatio.studio` (SOTD 2026) rispondono **dallo stesso indirizzo
`198.202.211.1`**, intestato a Webflow Inc. e annunciato da Cloudflare. Il che
significa una cosa commerciale precisa: **si vince Awwwards senza scrivere una
riga di infrastruttura**, e la banda la paga Webflow dentro il canone.

---

## 2. Il conteggio

| piattaforma | siti | quali |
|---|---:|---|
| **Vercel** | **9** | basement, darkroom, frans hals, immersive garden, mosby, noomo, opal, vero, **igloo** (dietro Cloudflare) |
| **Cloudflare** (come rete davanti a un origin proprio) | **8** | 2xa, dogstudio, hello monday (+Heroku), locomotive, ma/maswitzerland, messenger/abeto, cuberto (+DO Spaces), minotti |
| **AWS** (CloudFront/S3) | **6** | aristide benoist, kprverse, persepolis/Getty, resn, zajno, porada |
| **VPS proprio** (nessuna CDN) | **5** | by-kin, obys, don't board me, trionn, prometheus fuels |
| **Google** (Firebase / GCS / App Engine / gws) | **4** | active theory, kode clubs, star atlas, umami land |
| **Shopify** | **3** | mana yerba mate, pangram pangram, simply chocolate |
| **Netlify** | **2** | lusion, mammut eiger extreme |
| **Webflow** | **2** | lando norris, revelatio |
| **Azure** (+ Barracuda WAF) | **1** | orano |
| | **40** | |

**Vercel 9 contro Netlify 2.** Se la memoria collettiva dice "Netlify per i
siti statici", i byte del 2026 dicono un'altra cosa: **Netlify ha perso questo
mercato**. E la ragione economica e' nella sezione 3 - il modello a crediti
introdotto il 4 settembre 2025 fa pagare la banda **dal primo GB**, mentre
Vercel Pro ne regala 1.000.

Nota onesta sul conteggio: **"Cloudflare" nella tabella non e' la stessa cosa
delle altre voci**. Vercel, Netlify e Webflow sono *dove sta il sito*;
Cloudflare in 6 casi su 8 e' *cosa sta davanti al sito*, e l'origin vero non e'
visibile dall'esterno (e' esattamente il suo mestiere). Quando l'origin si vede
l'ho scritto: Heroku per Hello Monday, DigitalOcean Spaces per Cuberto, ASP.NET
per Minotti, Plesk per 2xa.

---

## 3. Quanto costa davvero servirlo: listini 2026 e il conto della banda

### 3.1 I listini, letti il 13/08/2026

**Vercel** - fonte `vercel.com/docs/pricing` (agg. 2026-07-29) e
`/docs/pricing/regional-pricing/fra1` (agg. 2026-02-13).

| voce | Hobby | Pro | eccedenza (Francoforte `fra1`) |
|---|---|---|---|
| fee | $0 | **$20/mese** (1 seat + $20 di credito) | seat extra $20 |
| Fast Data Transfer | 100 GB | **1 TB** | **$0,15/GB** |
| Edge Requests | 1 M | 10 M | $2,60 / 1 M |
| Fast Origin Transfer | 10 GB | nessuna franchigia | $0,06/GB |
| build | - | nessun minuto incluso | $0,0035 per CPU-minuto |

Due trappole di calcolo che Vercel dichiara nei docs (`/docs/manage-cdn-usage`,
agg. 2026-06-23) e che nessuno legge: la banda si conta *"based on the full size
of each HTTP request and response"* - cioe' **header e URL compresi, in
entrambe le direzioni** - e le richieste si contano **anche per gli asset
statici**. Il GB fatturato e' sempre un po' piu' del peso dei file.

**Netlify** - dal **4 settembre 2025** e' passata a **crediti**. Gli account
nuovi vanno sui crediti; i vecchi restano sul listino legacy, e **il passaggio
e' irreversibile**.

| | crediti/mese | banda coperta | $/GB implicito (calcolo mio) |
|---|---|---|---|
| Free $0 | 300 | **15 GB** | - (hard limit, non si comprano crediti) |
| Personal $9 | 1.000 | 50 GB | $0,18 |
| Pro $20 | 3.000 | 150 GB | $0,133 |
| Pro $63 | 10.000 | 500 GB | $0,126 |
| Pro $126 | 20.000 | **1.000 GB** | $0,126 |

Tariffa: **20 crediti per GB**, 2 crediti ogni 10.000 richieste web, **15
crediti per ogni deploy di produzione**. I build minutes non si contano piu'.
Il **legacy** (solo account pre-09/2025): Pro $19/membro, 1 TB incluso, poi
**$55 ogni 100 GB = $0,55/GB**.

> Il dettaglio velenoso del Free a crediti: 300 crediti al mese, 15 crediti a
> deploy. **Venti deploy in produzione e hai finito il mese senza aver servito
> un byte.**

**Cloudflare** - la banda sugli asset statici **non si paga**, e lo scrivono a
lettere: *"Requests to static assets are free and unlimited"*
(`developers.cloudflare.com/workers/static-assets/billing-and-limitations/`) e
*"There are no additional charges for data transfer (egress) or throughput
(bandwidth)"* (`/workers/platform/pricing/`). Su **R2**: *"Egressing directly
from R2 ... does not incur data transfer (egress) charges and is free."*

| voce | prezzo |
|---|---|
| Workers/Pages Paid | **$5/mese** |
| R2 storage standard | $0,015 per GB-mese (10 GB gratis) |
| R2 Class A / Class B | $4,50 / $0,36 per milione (1 M e 10 M gratis) |
| **banda in uscita** | **$0** |
| Stream storage / delivery | $5 per 1.000 min conservati / **$1 per 1.000 min visti** |

**Il vincolo che decide tutto**: *"The maximum file size for a single Cloudflare
Pages site asset is 25 MiB"*. **Un video da 39 MB non puo' stare su Pages.**
Deve stare su R2 (dove pero' la banda resta zero).

**AWS** - nel 2026 CloudFront ha **due listini**.

| CloudFront a tariffa piatta | $/mese | richieste | traffico incluso |
|---|---|---|---|
| Free | $0 | 1 M | 100 GB |
| **Pro** | **$15** | 10 M | **50 TB** |
| Business | $200 | 125 M | 50 TB |

Testo ufficiale: *"There are no additional overage charges or usage
calculations, even during traffic spikes or attacks"*, e *"Blocked DDoS attacks
and requests blocked by AWS WAF never count against your usage allowance."*

Il **pay-as-you-go** resta: **1 TB/mese gratis in perpetuo** + 10 M richieste,
poi **$0,085/GB** (Europa e Nord America, primi 9 TB), $0,080 sui 40 TB
successivi. S3 -> CloudFront e' gratis. **Amplify Hosting** invece fa pagare
**$0,15 per GB servito** oltre 15 GB: e' il listino peggiore del gruppo.

**Bunny.net** - il listino che nessuno cita e che vince su tutti sugli asset
pesanti (`bunny.net/pricing`, `bunny.net/storage`, `bunny.net/docs/stream-pricing`):

| voce | prezzo |
|---|---|
| CDN Standard (119 PoP) **Europa e Nord America** | **$0,01/GB** |
| CDN Standard Asia/Oceania / Sud America / MEA | $0,03 / $0,045 / $0,06 |
| CDN **Volume** (10 PoP, tariffa piatta globale) | **$0,005/GB** fino a 500 TB |
| richieste | **nessun costo** ("No Request Fees") |
| minimo mensile | **$1** |
| Bunny Storage standard (HDD) | $0,01/GB-mese, una regione |
| Bunny Stream - encoding standard | **gratis**; storage $0,01/GB-mese; delivery alla stessa tariffa del CDN |

**E' dieci-quindici volte piu' economico di Vercel e Netlify sul GB**, senza
costo per richiesta. E soprattutto e' **prepagato** - vedi la sezione 7.6, che
e' il vero motivo per cui va in preventivo.

**Fastly** - 100 GB/mese gratis, poi **$0,12/GB** in Europa e Nord America fino a
10 TB, $0,08 sui 10 TB successivi. **Dodici volte Bunny.** Non e' la scelta
economica. Il minimo mensile non e' pubblicato (la doc dice solo *"at least the
monthly minimum, if applicable"*).

**VPS con banda inclusa** - l'alternativa a costo fisso:

| | banda inclusa | eccedenza |
|---|---|---|
| **Hetzner Cloud** (location europee) | **20 TB** | *"We will charge EUR 1 ($1.20)/TB for overusage"*, a blocchi da 100 MB, con avvisi al 75% e 100% |
| **DigitalOcean** Droplet base **$4/mese** | **500 GiB** (in pool su tutti i Droplet del team) | *"Additional outbound transfer is billed at $0.01 per GiB"* |

**Video: Mux, Cloudinary, Vimeo** - per completezza. **Mux**: delivery da
$0,0008/minuto dopo 100.000 minuti gratis/mese. **Cloudinary**: il piano Plus da
$99/mese da' 225 crediti e 1 credito = 1 GB di banda video, cioe' **~$0,44/GB**
- **quarantaquattro volte Bunny**, il listino piu' caro trovato. **Vimeo OTT**
non e' un CDN, e' un revenue share ($1 per abbonato/mese): inutile per un sito
vetrina.

**GitHub Pages** - da escludere e basta, per due motivi. Limiti dichiarati:
*"Published GitHub Pages sites may be no larger than 1 GB"*, *"a **soft**
bandwidth limit of **100 GB per month**"*. E il divieto: GitHub Pages *"is not
intended for or allowed to be used as a free web-hosting service to run your
online business, e-commerce site, or any other website that is primarily
directed at either facilitating commercial transactions"*. Con 200 MB di asset
sei gia' al 20% del limite di repository, e **100 GB si bruciano con ~2.500
visite** di un sito immersivo.

### 3.2 Il conto: sito immersivo, 200 MB di asset, 50.000 visite/mese

Prima cosa, e non e' un cavillo: **200 MB di asset nel bucket non sono 200 MB a
visita**. Lo storage e' irrilevante (200 MB costano **0,3 centesimi al mese** su
R2, **0,5 su S3**). Quello che si paga e' **quanti byte scendono ad ogni
visita**, e quello dipende da come e' fatto il sito, non da quanto pesa la
cartella.

Tre scenari, tutti e tre presi da misure vere che stanno gia' in questa
cartella:

| scenario | byte a visita | fonte della misura | traffico a 50.000 visite |
|---|---|---|---|
| **S1 - leggero fatto bene** | 5 MB | tipico dei siti senza video (by-kin, mosby) | **250 GB/mese** |
| **S2 - immersivo pesante** | **17,14 MB** | `igloo.md`, `transferSize` misurato | **857 GB/mese** |
| **S3 - video crudo** | **39,1 MB** | `_BERSAGLI-BRIANZA.md`, video Minotti, `Content-Length: 39148092` verificato oggi | **1.957 GB/mese** |

E qui il conto, tutti i numeri sono dedotti applicando i listini della 3.1:

| piattaforma | S1 (250 GB) | S2 (857 GB) | **S3 (1.957 GB)** |
|---|---:|---:|---:|
| **Cloudflare** Pages/Workers + R2 | **$5** | **$5** | **$5** |
| **VPS Hetzner** EU (20 TB inclusi) | costo fisso | costo fisso | **costo fisso** |
| **CloudFront** tariffa piatta Pro | $15 | $15 | **$15** |
| **DigitalOcean** Droplet $4 (500 GiB) | $4 | $7 | **$17** |
| **Bunny** CDN Volume | $1,25 | $4,29 | **$9,79** |
| **Bunny** CDN Standard EU/NA | $2,50 | $8,57 | **$19,57** |
| **CloudFront** pay-as-you-go | ~$0 | ~$0 | **$81** |
| **Vercel** Pro | $20 | $20 | **$144** |
| **Netlify** a crediti | $33-63 | $126 | **~$254** |
| **AWS Amplify** | $35 | $126 | **$291** |
| **Netlify** legacy Pro | $19 | $19 | **$569** |
| **Cloudinary** Plus (solo per confronto) | $110 | $377 | **$861** |

Dettaglio degli estremi, per poterli rifare:
- **Vercel S3**: 1.957 - 1.000 GB inclusi = 957 GB x $0,15 = $143,55. Il credito
  da $20 e' gia' dentro la fee, quindi la fattura e' **$143,55**.
- **Netlify legacy S3**: 957 GB oltre il TB incluso = **10 pacchetti da 100 GB
  a $55** = $550, piu' $19 di piano = **$569**.
- **Bunny S3**: 1.957 GB x $0,01 = **$19,57**, e non c'e' costo per richiesta.
- **Hetzner S3**: 1,96 TB su 20 TB inclusi. La banda **non si vede nemmeno in
  fattura**. (Il prezzo mensile del piano non l'ho potuto verificare: la pagina
  prezzi di Hetzner e' generata in JavaScript. Vedi sezione 9.)

### 3.3 Il numero da tenere a mente: il costo di 1.000 visite in piu'

E' il numero che serve in trattativa, perche' il cliente capisce "quanto mi
costa se il sito va bene". Mille visite a **39,1 MB** l'una = **39,1 GB**:

| piattaforma | costo di 1.000 visite marginali |
|---|---:|
| Cloudflare | **$0,00** |
| CloudFront tariffa piatta (fino a 50 TB) | **$0,00** |
| Hetzner EU (entro i 20 TB) | **$0,00** - oltre, ~$0,05 |
| Bunny CDN Volume | $0,20 |
| DigitalOcean (oltre il pool) | $0,36 |
| **Bunny CDN Standard EU/NA** | **$0,39** |
| CloudFront pay-as-you-go | $3,32 |
| Fastly | $4,69 |
| Netlify a crediti | $5,20 |
| **Vercel Pro** | **$5,87** |
| AWS Amplify | $5,87 |
| Cloudinary Plus | $17,20 |
| Netlify legacy | **$21,51** |

> **La riga da ricordare: su Vercel, un sito con un video di apertura da 40 MB
> costa circa mezzo centesimo di dollaro a visitatore.** Sembra niente. A
> 500.000 visite l'anno sono **$2.900**, cioe' piu' di quanto molte agenzie
> italiane fanno pagare l'intero sito.

---

## 4. Il caso limite: igloo.inc e Minotti a 50.000 visite

### 4.1 igloo.inc - 17,14 MB a visita, e la mossa che li salva

Misure agli atti in `igloo.md`, tutte verificate: **17,14 MB di
`transferSize`** (compresso, cioe' esattamente cio' che la CDN fattura),
**18,39 MB** di corpi di risposta, **108 risorse**, **identici su telefono**.

A 50.000 visite/mese = **857 GB**.

| piattaforma | costo/mese | nota |
|---|---:|---|
| Vercel Pro **da solo** | **$20** | 857 GB stanno dentro il TB incluso - ma con **5,4 M di edge requests** (108 x 50.000), dentro i 10 M |
| Vercel Pro a **100.000 visite** | **$122** | 1.714 GB: 714 GB x $0,15 = $107 + $20 di fee. **Ed e' qui che si rompe** |
| Vercel Pro a **200.000 visite** | **$434** | 3.428 GB |
| **Cloudflare davanti a Vercel (quello che fanno davvero)** | **$20 + $0** | Cloudflare serve gli asset dalla sua cache e Vercel non li vede nemmeno passare |

**Il fatto verificato**: sull'asset `/assets/index-2eb69c09.js` la risposta
riporta `cf-cache-status: REVALIDATED` e **`Age: 180316`** - cioe' quel file
sta nella cache di Cloudflare da **oltre due giorni**. Ogni HIT di Cloudflare e'
un GB che Vercel non fattura. Non so se igloo l'abbia fatto per risparmiare o
per altro (**dedotto**), ma l'effetto economico e' quello: **su un sito da
17 MB a visita, il proxy davanti vale centinaia di dollari al mese**.

### 4.2 Minotti - 39,1 MB di video a visita

Verificato oggi con `HEAD` su
`https://www.minotti.com/downloads/1/30042/2026_Pavilion_HP_frame_noquadri.mp4`:

```
HTTP/1.1 200 OK
Content-Type: video/mp4
Content-Length: 39148092
Cache-Control: public, max-age=2592000
Server: cloudflare
cf-cache-status: HIT
```

Sono **39.148.092 byte**, e **arrivano dalla cache di Cloudflare**. A 50.000
visite: **1.957.404.600.000 byte = 1.957 GB = quasi 2 TB al mese, per un solo
file**.

| dove lo metti | costo/mese | perche' |
|---|---:|---|
| **Cloudflare R2** (dove sta di fatto, come byte) | **$0,03** | 0,039 GB di storage + 50.000 GET Class B, tutto dentro il free tier. **Egress zero** |
| **Bunny CDN + Storage** | **$20** | $0,01/GB, nessun costo per richiesta, minimo $1 |
| CloudFront tariffa piatta Pro | $15 | 2 TB su 50 TB inclusi |
| CloudFront pay-as-you-go | $81 | 957 GB oltre il TB gratuito x $0,085 |
| **Cloudflare Stream** | **~$50** | $1 per 1.000 minuti visti; se il video dura ~1 minuto (39 MB a ~5 Mbps, **dedotto**), 50.000 minuti = $50. Ma **in ABR il visitatore medio scarica molto meno di 39 MB** |
| **Bunny Stream** | **~$20** | encoding standard **gratis**, delivery alla tariffa CDN ($0,01/GB), player incluso |
| **Vercel Pro** | **$144** | |
| Netlify a crediti | $254 | |
| **Netlify legacy Pro** | **$569** | dieci pacchetti da $55 |
| AWS Amplify | $291 | |

**Il punto legale che nessuno guarda.** Minotti serve **39 MB di video dalla CDN
Cloudflare**. I *Service-Specific Terms - Application Services* di Cloudflare,
aggiornati al **2 giugno 2026**, dicono testualmente:

> *"Unless you are an Enterprise customer, Cloudflare offers specific Paid
> Services (e.g., the Developer Platform, Images, and Stream) that you must use
> in order to serve video and other large files via the CDN. Cloudflare reserves
> the right to disable or limit your access to or use of the CDN ... if you use
> or are suspected of using the CDN without such Paid Services to serve video or
> a disproportionate percentage of pictures, audio files, or other large
> files."*

La vecchia "sezione 2.8" **non esiste piu' nel Self-Serve Subscription
Agreement** (oggi la sezione 2 arriva a 2.7): la clausola e' stata **spostata**,
non abolita, ed e' **viva**. La novita' buona e' che adesso **nomina la via
d'uscita legittima**: Developer Platform (Workers/Pages/R2 a pagamento), Images,
Stream.

> **Tradotto in italiano da mandare a un cliente:** *se metti i video sulla CDN
> gratuita di Cloudflare, un giorno te li spengono e hanno ragione loro. Se li
> metti su R2 con il piano Workers da $5, e' scritto nel contratto che puoi.*

### 4.3 E se raddoppia? La proporzione, non il prezzo

Il punto che deve entrare nel preventivo non e' "quanto costa oggi", e' **come
cresce**. Un sito da 5 MB a visita non ti fara' mai una brutta sorpresa: su
Vercel resta a $20 fino a **200.000 visite/mese**. Un sito da 40 MB a visita
esce dalla franchigia a **25.600 visite** e da li' in poi ogni raddoppio di
traffico raddoppia la bolletta, in modo lineare e senza tetto.

**Un sito immersivo pesante non e' un problema tecnico, e' un contratto a
consumo che hai firmato per conto del cliente senza dirglielo.**

---

## 5. Cosa si consiglia al cliente, e cosa si mette in preventivo

### 5.1 La regola gia' scritta, e come questo file la conferma

`_RICORRENTE.md` ha gia' la regola, e non la cambio:

> *"L'hosting non e' un prodotto, e' l'ingrediente che rende obbligatorio il
> canone."* - e il corollario: **dominio sempre intestato al cliente, hosting
> sul nostro account**, con la via d'uscita (export, cambio DNS, tempi) scritta
> nel contratto.

Questo file aggiunge il **perche' tecnico**: se l'hosting sta sul tuo account e
il sito e' leggero, il costo marginale del cliente n-esimo e' **zero** (un solo
team Cloudflare Workers Paid a $5 li copre tutti; un solo team Vercel Pro a $20
copre tutti i progetti). Ma se il sito e' **pesante**, il costo marginale non e'
piu' zero: **e' proporzionale al successo del cliente**, e ricade su di te. La
regola va quindi qualificata:

> **La regola qualificata: l'hosting sta sul nostro account e il costo e' dentro
> il canone FINCHE' il sito sta sotto una soglia di traffico dichiarata. Sopra
> quella soglia si rinegozia, e la soglia sta nel contratto in numeri.**

### 5.2 La scelta della piattaforma per tipo di lavoro

| tipo di sito | dove | perche' | costo per noi |
|---|---|---|---|
| vetrina, sito immersivo statico, portfolio | **Cloudflare Pages/Workers + R2** | banda gratis e illimitata sugli asset statici, **DDoS unmetered incluso su tutti i piani**, R2 per i file oltre 25 MiB | **$5/mese per tutti i clienti insieme** |
| sito con Next.js e funzioni server | **Vercel Pro**, ma **con Cloudflare davanti** se ha video o 3D pesante | il DX vale i $20; il proxy toglie la banda dal contatore | $20/mese in tutto + $0 di banda |
| video e file molto grandi, o cliente con picchi imprevedibili | **Bunny** (CDN + Stream) | $0,01/GB, nessun costo per richiesta, encoding gratis, **e soprattutto e' prepagato: il tetto di spesa e' il credito caricato** | ~$20/mese per 2 TB |
| e-commerce | **Shopify** | e' quello che usano mana yerba mate, pangram pangram, simply chocolate | a carico del cliente |
| cliente che vuole modificare da solo senza di noi | **Webflow** | e' il caso di lando norris e revelatio: Site of the Year senza infrastruttura | a carico del cliente |
| **mai** | **Vercel Hobby**, **GitHub Pages** | vietati **per contratto** sul lavoro pagato (sez. 7.1 e 3.1) | - |
| **mai** | Netlify legacy, AWS Amplify, Cloudinary per la banda | $0,55, $0,15 e $0,44 al GB: si paga da 15 a 55 volte Bunny | - |

### 5.3 Le tre righe da mettere nel preventivo

Da incollare in `_PREVENTIVO.md`, sezione costi ricorrenti:

> **Dominio.** Registrato **a nome del Cliente**, con le credenziali consegnate
> al Cliente. Costo a carico del Cliente (EUR 10-40/anno secondo l'estensione).
> Non e' una voce di ricavo e non deve esserlo mai.
>
> **Hosting e distribuzione (CDN).** Compresi nel canone di manutenzione, sul
> nostro account professionale, **fino a [N] visite al mese e [X] GB di
> traffico mensile**. Oltre tale soglia il costo infrastrutturale viene
> riaddebitato al costo, documentato dalla fattura del fornitore, previa
> comunicazione scritta. In caso di cessazione del rapporto consegniamo entro
> [15] giorni l'export completo del sito e assistiamo il trasferimento DNS.
>
> **Peso della pagina.** Il progetto e' consegnato con un tetto dichiarato di
> **[X] MB trasferiti alla prima visita**. Modifiche successive che alzino quel
> tetto (video aggiuntivi, gallerie non compresse) comportano una revisione
> della soglia di traffico di cui sopra.

**Perche' la terza riga esiste**: e' quella che ti protegge dal cliente che sei
mesi dopo carica un video da 400 MB nel CMS e poi ti manda la mail perche' "il
sito e' lento" - e nel frattempo la banda la stai pagando tu.

### 5.4 I numeri per fissare N e X

A **EUR 5** al mese di costo infrastrutturale reale, un canone da **EUR
200/mese** ha un'incidenza del **2,5%**. Sono le proporzioni gia' scritte in
`_RICORRENTE.md` (2-10%). La soglia da scrivere in contratto va calcolata cosi'
(**dedotto**, ma il conto e' banale):

- misura i **MB trasferiti alla prima visita** con il sito finito (e' il numero
  che serve, non il peso della cartella);
- fissa **X = 5% del canone annuo diviso il prezzo del GB della piattaforma**;
- fissa **N = X / MB per visita**.

Esempio: canone EUR 200/mese = EUR 2.400/anno; 5% = EUR 120/anno = EUR 10/mese;
su Vercel a $0,15/GB fa **circa 60 GB/mese oltre la franchigia**, cioe' con la
franchigia da 1 TB **N vale 60.000 visite/mese su un sito da 17 MB**. Su
Cloudflare, dove la banda e' zero, la soglia **non serve** - ed e' l'argomento
piu' forte per sceglierla.

---

## 6. Il deploy: anteprime, staging, e cosa lasciano scoperto gli studi

### 6.1 Come funziona l'anteprima per il cliente

Su **Vercel** e **Netlify** ogni push su un branch genera un URL di anteprima
autonomo. E' il flusso che rende inutile il "ti mando lo zip": il cliente clicca
un link, vede il sito vero, commenta. Su **Cloudflare Pages** esiste
l'equivalente (deploy di preview per branch). Su un **VPS** non esiste niente di
tutto questo e te lo devi costruire - ed e' esattamente il motivo per cui
quattro studi su quaranta stanno su VPS e trentasei no.

Il costo nascosto delle anteprime, ora che l'ho verificato sui listini:
**Netlify a crediti fa pagare 15 crediti ogni deploy di produzione** (i preview
no), e **Vercel fa pagare il build a CPU-minuto** ($0,0035). Sono spiccioli, ma
su un progetto con 200 deploy in tre mesi vanno messi nel conto, e soprattutto
**mangiano il piano Free di Netlify in venti deploy**.

### 6.2 Cosa ho trovato cercando i sottodomini di staging degli studi

Sondaggio DNS + HTTP su 14 domini di studi premiati, il 13/08/2026. Quattro di
loro (`basement.studio`, `darkroom.engineering`, `obys.agency`, `cuberto.com`)
hanno **DNS wildcard**: qualunque sottodominio risolve, quindi il DNS da solo
non prova niente. Ho quindi verificato la risposta HTTP.

| host | stato | cosa e' |
|---|---|---|
| **`staging.trionn.com`** | **200, 152 KB, sito completo** | **Un ambiente di staging reale, pubblicamente raggiungibile, senza autenticazione.** `Server: Apache/2.4.52`, `X-Powered-By: Next.js`. Unica difesa: `robots.txt` con `Disallow: /` |
| `labs.lusion.co` | 200 - "Lusion Labs" | vetrina pubblica di esperimenti, non staging |
| `v2.lusion.co` | 200 - "Lusion" | **una versione precedente del sito ancora online** |
| `six.locomotive.ca` | 200 - "Locomotive Dynasty - 2018 to 2023" | archivio pubblico dichiarato |
| `showcase.noomoagency.com` | 200 - "Noomo Showcase" | vetrina |
| `labs.noomoagency.com` | 200 - "Noomo Labs" | vetrina |
| `storytelling.noomoagency.com` | 200 | micro-sito dedicato |
| `lab.basement.studio` | 200 - "Experiments | basement.studio" | vetrina |
| `cms.by-kin.com` | **502 Bad Gateway** | il CMS headless di by-kin **e' rotto** (coerente con il 502 gia' registrato in `_RICORRENTE.md`) |
| `staging.obys.agency` | 200, 1,05 MB | **falso positivo onesto**: e' il wildcard che serve un micro-sito **Readymag** (`typography-principles.obys.agency` risponde con lo **stesso identico byte count**, 1.050.908) |
| `revelatio.vercel.app` | 404 | il dominio di preview Vercel citato nella scheda oggi non risponde |
| `staging.cuberto.com`, `staging.basement.studio`, `labs.darkroom.engineering` | 404 | wildcard che non serve nulla |

**Le due conclusioni operative:**

1. **Il sottodominio di staging esposto e' la norma, non l'eccezione.**
   `staging.trionn.com` e' un sito completo, pubblico, di uno studio premiato,
   protetto solo da un `robots.txt` - che tiene fuori Google, **non le
   persone**. Se lo apri, vedi il lavoro non ancora pubblicato.
2. **Il rischio non e' teorico ed e' un problema del cliente, non tuo.**
   Un'anteprima raggiungibile e' un annuncio anticipato di prodotto, un prezzo
   non ancora comunicato, una campagna che parte fra due settimane.

### 6.3 Come si fa, allora

- **anteprime cliente**: usa gli URL di preview della piattaforma (Vercel,
  Netlify, Cloudflare Pages) e **mettici sopra la protezione**: password sul
  deployment o header `WWW-Authenticate` sull'edge. Non `robots.txt`: quello e'
  una cortesia verso i crawler, non una serratura.
- **`X-Robots-Tag: noindex`** in aggiunta, su tutto cio' che non e' produzione.
  Vale piu' del `robots.txt` perche' agisce sulla pagina, non sulla richiesta.
- **un sottodominio dedicato sul TUO dominio, non su quello del cliente**
  (`cliente.anteprime.tuostudio.it`): il cliente non deve toccare i suoi DNS
  prima del lancio, e tu spegni tutto in un colpo quando hai finito.
- **niente wildcard DNS** sul dominio dello studio, o ti ritrovi a rispondere
  200 su host che non sai di avere (vedi obys).

---

## 7. Le trappole

### 7.1 Il piano gratuito di Vercel vieta espressamente il tuo lavoro

Testo letterale dalle `Fair Use Guidelines`
(`vercel.com/docs/limits/fair-use-guidelines`, agg. 2026-07-29):

> *"**Hobby teams** are restricted to non-commercial personal use only. All
> commercial usage of the platform requires either a Pro or Enterprise plan.
> Commercial usage is defined as any Deployment that is used for the purpose of
> financial gain of **anyone** involved in **any part of the production** of the
> project, including a paid employee or consultant writing the code. Examples of
> this include, but are not limited to, the following: ... **Receiving payment
> to create, update, or host the site** ..."*

**La riga che decide**: *"receiving payment to create, update, or host the
site"*. Un sito vetrina senza carrello, senza pubblicita' e senza pagamenti e'
**comunque uso commerciale** se tu sei stato pagato per farlo. **Il piano Hobby
non e' un'opzione per nessun lavoro di studio, nemmeno per il sito piu'
piccolo.** E vale anche per l'anteprima che mandi al cliente prima di essere
pagato: e' "any part of the production".

Cosa succede se sfori su Hobby: *"in most cases, if you exceed your usage limits
on the Hobby plan, you will have to wait until 30 days have passed before you
can use the feature again."* Niente fattura a sorpresa, ma **il sito resta giu'
fino a un mese**.

### 7.2 Netlify: nessun divieto commerciale, ma il tier gratuito e' revocabile

Cercato su Terms of Use, Acceptable Use Policy e Self-Serve Subscription
Agreement: **nessun divieto di uso commerciale sul piano gratuito**. E' un
risultato negativo su tre documenti, non una deduzione. Ma:

> *"Netlify's Free Usage Tier is made available by Netlify to allow users to
> experience Netlify's Services, but the Free Usage Tier is offered at Netlify's
> sole discretion."*
>
> *"In case of any delays or performance problems including those caused by a
> malicious attack on a website project, for the Free Usage Tier Netlify will
> resolve the issue by shutting down the affected website projects."*

Tradotto: **un attacco al sito di un cliente sul piano gratuito si risolve
spegnendoglielo.**

### 7.3 Cosa succede davvero quando finisci i crediti / la banda

| piattaforma | comportamento allo sforo |
|---|---|
| **Vercel Hobby** | funzione bloccata **fino a 30 giorni**. Nessuna fattura |
| **Vercel Pro** | **fattura a consumo, senza tetto di default**. Lo `Spend Management` e' **opt-in**: *"Setting a spend amount does not automatically stop usage. If you want to pause all your projects at a certain amount, you must enable the option."* Di default c'e' solo una **notifica a $200** |
| **Netlify Free** | **hard stop**: finiti i 300 crediti **tutti i progetti del team vanno in pausa** con pagina "Site not available". Non si possono nemmeno comprare crediti |
| **Netlify Personal/Pro** | pausa di **tutti** i progetti del team, anche se a consumare e' stato uno solo. L'`auto recharge` e' **OFF di default** e, se lo accendi, **non ha tetto di spesa** |
| **Cloudflare** | la banda non si paga, quindi non c'e' sforo. Il rischio e' un altro: **la clausola CDN sui video** (sezione 4.2), che si risolve con la disattivazione, non con una fattura |
| **CloudFront tariffa piatta** | *"no additional overage charges ... even during traffic spikes or attacks"*. **E' l'unico listino del gruppo con un tetto contrattuale** |

Due dettagli che valgono da soli il paragrafo:

- Vercel dichiara che il blocco per superamento **non e' preciso**: *"This check
  happens every few minutes... projects can keep serving traffic and accruing
  usage for several minutes after you cross the spend amount."* La soglia va
  messa **sotto** il massimo tollerabile.
- Su Vercel il progetto in pausa **non riparte da solo**: *"Projects won't
  automatically unpause if you increase the spend amount."* Va riacceso a mano,
  progetto per progetto. Se succede di sabato notte, il sito del cliente sta
  giu' fino a quando lo vedi.

### 7.4 Il sito finisce su Hacker News: i numeri veri

Qui non servono impressioni, servono log. Ne ho trovati due pubblicati per
intero.

**royalsloth.eu**, due post in prima pagina
(`docs.royalsloth.eu/posts/how-much-traffic-comes-from-the-front-page-of-hackernews/`):
**139.665 richieste in due giorni** (93.275 il primo, 46.390 il secondo),
**68.123 richieste uniche**, picco di **9.354 richieste nell'ora 15:00-16:00
UTC** (2,6 al secondo). Le prime venti ore hanno prodotto ~85.000 richieste dal
solo HN. Provenienza: **59,6% HN, 6,5% Reddit, 4,67% Google**; 51,8% Nord
America, 36,5% Europa. La regola pratica che ne ricava l'autore: **un post in
prima pagina porta circa 20.000 richieste uniche**.

**danielpetrica.com**, post arrivato al numero 16
(`danielpetrica.com/surviving-hacker-news-front-page/`): da 50-100
visualizzazioni al giorno a **+5.000% di visitatori in 24 ore**, ~1.300
visitatori in quattro ore di picco, **194.000 richieste servite in un giorno**,
con il **94% servito dalla cache** Cloudflare su un piccolo server ARM a 4 core
che ospitava 24 siti.

**Il dato che ci riguarda.** Su un sito di solo testo, quel picco ha significato
**circa 6 GB** di banda. Su un sito immersivo con 40 MB a visita, gli stessi
**20.000 visitatori significano 800 GB - centotrenta volte tanto**, in un
giorno.

| piattaforma | costo di quella singola giornata (800 GB) |
|---|---:|
| Cloudflare Pages/Workers | **$0** |
| Hetzner EU | **$0** (dentro i 20 TB) |
| CloudFront tariffa piatta Pro | **$0** |
| DigitalOcean | ~$3 oltre il pool |
| **Bunny** Standard EU/NA | **~$8** |
| CloudFront pay-as-you-go | $0 se il TB e' libero, ~$68 se no |
| Fastly | ~$96 |
| **Netlify a crediti** | **~$104** - oppure **il sito si spegne**, se l'auto recharge e' spento |
| **Vercel Pro** | **~$120** (o $0, se la franchigia da 1 TB era ancora intatta) |

Le due facce del disastro sono opposte e vanno scelte **prima**, non dopo:
**Netlify ti spegne il sito** (danno d'immagine nel momento esatto in cui il
sito serve), **Vercel te lo tiene su e te lo fattura** (danno economico senza
tetto di default). Non esiste una terza opzione, se non **spostare la banda dove
non si paga**.

> **La regola operativa**: se il sito e' pesante e c'e' anche solo la possibilita'
> di un lancio, di un premio o di una campagna, **gli asset stanno su Cloudflare
> R2, su Bunny o dietro CloudFront a tariffa piatta**, punto. Il resto della
> pagina puo' stare dove vuoi.

### 7.5 I $104.500 di Netlify: cosa e' successo davvero

Il caso e' documentato e verificato (thread Hacker News del 27/02/2024,
1.783 punti, `news.ycombinator.com/item?id=39520776`; forum Netlify
`answers.netlify.com/t/netlify-billing-horror-story/113392`).

- Sito **statico**, ospitato **gratis su Netlify da quattro anni**, traffico
  normale **sotto i 10 GB al mese**, circa **cento visitatori al mese**.
- Un DDoS ha martellato **un singolo file audio da 3,44 MB**: **190 TB in
  quattro giorni**.
- Fattura: **$104.500**. Il supporto ha confermato che si trattava di un
  attacco e all'inizio ha offerto **solo uno sconto**, lasciando comunque
  **~$5.000** a carico dell'utente.
- Solo dopo che il post e' finito in cima a HN e Reddit il CEO e' intervenuto:
  *"Our support team has reached out to the user from the thread to let them
  know they're not getting charged for this"*, e la policy dichiarata e' *"to
  not shut down free sites during traffic spikes ... but instead forgiving any
  bills from legitimate mistakes after the fact"*. Netlify ha ammesso che la
  fattura *"should have been flagged by our systems before being sent to this
  user"*.

Il conto torna esattamente: **190.000 GB x $0,55/GB = $104.500** - la vecchia
tariffa di overage Netlify, quella che gli account legacy hanno ancora.

**Non e' un caso isolato.** Il repository pubblico `serverlesshorrors` raccoglie
24 casi documentati, fra cui **Vercel $96.280** (cara.app, esplosione di
funzioni serverless - annullata dal supporto), **Vercel $46.485** (Jmail, 450
milioni di pageview - rimborsata integralmente dopo una colletta della
community), **Firebase ~$100.000** (simmer.io: un attaccante ha trovato un
oggetto non in cache e poi **il bucket di origine, bypassando Cloudflare** -
Google ha rimborsato, ma la piattaforma con 140.000 sviluppatori **ha chiuso**).

> **Lo schema si ripete: le fatture assurde vengono quasi sempre cancellate, ma
> solo dopo che il caso diventa virale.** Il commento piu' votato del thread e'
> la domanda giusta - sarebbe stata annullata **senza** l'attenzione pubblica?
> Non e' una policy su cui costruire un'azienda, e non e' una cosa che puoi
> promettere a un cliente.

Nota tecnica dal caso Firebase, che vale per noi: **mettere Cloudflare davanti
non basta se l'origine resta raggiungibile**. Se l'attaccante trova il bucket,
la CDN e' aggirata. L'origine va chiusa: solo la CDN puo' leggerla.

### 7.6 Ti staccano o ti fatturano? La distinzione che protegge il portafoglio

**Hard cap - ti staccano, nessuna sorpresa in bolletta:**

| | come |
|---|---|
| **Bunny.net** | **prepagato**: i fondi si scalano ogni ora, poi *"the system will automatically suspend your account (and all your pull zones)"*. **Il danno massimo e' il credito che hai caricato.** Per uno studio e' la garanzia strutturale migliore che esista |
| **Netlify a crediti** (2026) | finiti i crediti *"Sites are paused"*. **Auto Recharge spento di default** - e' il cambiamento diretto dopo il caso da $104k |
| **Cloudflare Workers free** | oltre 100.000 richieste/giorno *"further operations of that type will fail with an error"* |
| **Vercel Hobby** | funzione bloccata fino a 30 giorni |
| **GitHub Pages** | limiti soft: *"we may not be able to serve your site"*, o una mail educata |

**Overage billing - ti fatturano:**

| | quanto |
|---|---|
| **Hetzner** | EUR 1/TB. Anche l'attacco da 190 TB del caso Netlify sarebbe costato **~EUR 170** |
| **DigitalOcean** | $0,01/GiB oltre il pool |
| **Fastly** | fattura in arretrato, nessun cap automatico |
| **Vercel Pro, Cloudinary, Mux** | a consumo, nessun tetto di default |
| **Netlify con Auto Recharge acceso** | **nessun tetto di spesa**: ricarica finche' la carta funziona |

> **L'avvertenza che vale il paragrafo**: se accendi l'Auto Recharge su Netlify
> per evitare che il sito del cliente vada offline, **ti rimetti esattamente
> nella condizione del febbraio 2024**. La scelta fra "sito giu'" e "fattura
> senza tetto" e' obbligata, e va fatta **col cliente, per iscritto**.

### 7.7 Protezione DDoS: chi ce l'ha inclusa

- **Cloudflare**: *"Unmetered DDoS Protection"* su **tutti i piani, Free
  compreso**, senza differenze fra Free, Pro e Business. E' il motivo per cui
  meta' del thread HN sul caso Netlify consigliava di migrare li'.
- **CloudFront a tariffa piatta**: *"Blocked DDoS attacks and requests blocked
  by AWS WAF never count against your usage allowance."* Contrattualmente
  fortissimo.
- **Bunny Shield**: esiste un tier **Basic gratuito** (71 regole WAF, 25 M
  richieste/mese). Se il CDN Bunny **senza** Shield includa una protezione DDoS
  di base **non e' dichiarato** sulle pagine lette.
- **Netlify e Vercel**: la domanda posta dall'utente nel caso da $104k era
  esattamente *"Why do serverless platforms like Netlify and Vercel not have
  ddos protection, or at least a spend limit?"*. **Il DDoS e' passato ed e'
  stato fatturato.**

### 7.8 Il limite dei 25 MiB, che ti prende alla consegna

**`developers.cloudflare.com/pages/platform/limits/`: 25 MiB e' la dimensione
massima di un singolo asset su Pages e su Workers Static Assets.** Un video di
apertura da 39 MB **non si carica**, e te ne accorgi al primo deploy. Altri
limiti del Free che vale la pena sapere prima: **500 build al mese**, **1 build
alla volta**, **timeout di 20 minuti**, **20.000 file per sito**.

### 7.9 Il costo che non e' banda: le richieste

Un sito immersivo non fa 10 richieste, ne fa **108** (misura igloo). Su Vercel
Pro le prime **10 milioni** sono incluse: sono **92.000 visite di igloo**. Oltre,
sono **$2,60 per milione**. Non e' la voce che esplode, ma e' la voce che
sorprende quando guardi la fattura e la banda era dentro i limiti.

### 7.10 La domanda da fare al cliente prima di firmare

Una sola, e va fatta al primo incontro:

> *"Quante persone visitano il sito oggi, in un mese?"*

Se la risposta e' "non lo so" - e sara' quella nel 90% dei casi, visto che
`_BERSAGLI-BRIANZA.md` ha trovato **dodici aziende su sessantotto con il tag
Universal Analytics morto dal 2023** - allora la soglia di traffico nel
contratto **non e' una cautela, e' l'unica cosa che ti separa da una fattura che
non hai previsto.**

---

## 8. Le nove righe da tenere

1. **Vercel 9, Cloudflare 8, AWS 6, VPS 5, Google 4, Shopify 3, Netlify 2,
   Webflow 2, Azure 1.** Su 40 siti premiati sondati oggi. **Zero hosting
   condivisi italiani.**
2. **Netlify ha perso questo mercato**, e il modello a crediti del 04/09/2025 -
   che fa pagare la banda dal primo GB - spiega perche'.
3. **igloo.inc mette Cloudflare davanti a Vercel.** E' l'unico dei 40 a farlo,
   ed e' la mossa che su un sito da 17 MB a visita vale centinaia di dollari al
   mese. `Age: 180316` sull'asset principale: verificato.
4. **Il video di Minotti pesa 39.148.092 byte e arriva dalla cache Cloudflare.**
   A 50.000 visite sono **quasi 2 TB al mese per un file solo**: $0 su
   Cloudflare, **$144 su Vercel**, **$569 su Netlify legacy**.
5. **Su Vercel un sito con 40 MB di video costa mezzo centesimo di dollaro a
   visitatore.** A 500.000 visite l'anno sono $2.900: piu' del prezzo del sito.
   **Su Bunny gli stessi byte costano $196 l'anno**, su Cloudflare zero.
6. **Il piano Hobby di Vercel vieta letteralmente il lavoro pagato**, incluso
   *"receiving payment to create, update, or host the site"*. Non e' usabile
   nemmeno per l'anteprima al cliente. **GitHub Pages vieta esplicitamente
   l'"online business"**. Sono divieti contrattuali, non consigli.
7. **$104.500 a un sito statico gratuito con cento visitatori al mese**:
   190 TB in quattro giorni su un file audio da 3,44 MB. Annullata **solo dopo
   1.783 punti su Hacker News**. Lo stesso attacco su Hetzner sarebbe costato
   **EUR 170**, su Cloudflare **zero**.
8. **`staging.trionn.com` e' un sito di staging completo, pubblico, di uno
   studio premiato, protetto solo da `robots.txt`.** L'anteprima va messa dietro
   una password, non dietro una cortesia.
9. **La regola di `_RICORRENTE.md` regge, ma va qualificata**: hosting sul
   nostro account e dentro il canone **fino a una soglia di traffico scritta in
   contratto in numeri**. Sopra, si riaddebita al costo. Con Cloudflare quella
   soglia non serve - ed e' il motivo per cui e' la scelta di default. Con
   **Bunny prepagato** il tetto di spesa e' strutturale: e' il credito caricato.

---

## 9. Cosa NON ho verificato, e va detto

- **L'origin vero dei siti dietro Cloudflare** (dogstudio, locomotive,
  messenger, maswitzerland): il proxy nasconde tutto ed e' il suo mestiere. So
  che c'e' Cloudflare davanti, **non so cosa c'e' dietro**.
- **Su quale piano stanno**: nessuno dei 40 espone il proprio piano
  Vercel/Netlify/Cloudflare. Tutte le cifre della sezione 3-4 sono **il costo
  che avrebbero al listino pubblico**, non la loro fattura.
- **Il traffico reale di questi siti**: non lo conosco. Le 50.000 visite/mese
  sono l'ipotesi del brief, uguale per tutti, non una misura.
- **La durata del video Minotti**: non l'ho aperto. Il conto su Cloudflare
  Stream ipotizza ~1 minuto ricavandolo dal bitrate, ed e' **dedotto**.
- **Se Vercel intenda 1 TB come 1.000 o 1.024 GB**: non e' dichiarato da nessuna
  parte. Ho usato 1.000 (ipotesi conservativa: con 1.024 si paga un po' meno).
- **Se attivare un piano CloudFront a tariffa piatta faccia perdere il free tier
  pay-as-you-go** da 1 TB: due numeri contraddittori sulla stessa pagina AWS, e
  non ho trovato la spiegazione ufficiale. **Va chiarito prima di consigliarlo a
  un cliente.**
- **Il prezzo S3 per `eu-south-1` (Milano)**: le tabelle regionali sono
  renderizzate via JavaScript e non le ho lette. Ho usato l'Irlanda.
- **A quale prodotto si applichi** la riga "Data Egress $0,05/GB" che compare su
  `cloudflare.com/plans`: non l'ho stabilito, e quindi non l'ho usata in nessun
  conto.
- **I prezzi mensili dei piani cloud Hetzner** (CX23 e simili): la pagina prezzi
  e' generata in JavaScript e non l'ho letta. I **20 TB inclusi in Europa** sono
  confermati da uno snippet della news ufficiale Hetzner e l'overage a
  **EUR 1/TB** dalla documentazione; **il canone mensile no**. Va verificato sul
  calcolatore prima di metterlo in preventivo.
- **Il minimo mensile di Fastly**: la doc dice solo *"at least the monthly
  minimum, if applicable"*, senza cifra. I $50 che circolano nei blog non li ho
  verificati.
- **Il costo dell'overage per credito su Cloudinary**: non pubblicato. Il
  ~$0,44/GB e' un mio calcolo sul rapporto prezzo/crediti del piano Plus.
- **Se Bunny CDN includa una protezione DDoS di base senza Bunny Shield**: non
  dichiarato sulle pagine lette.
- **Numeri di traffico da una prima pagina di Reddit**: non trovati in forma
  verificabile. I due log della sezione 7.4 sono di Hacker News.
- **`tomhummel.com`** (80.000 pageview in 16 ore) circola come terzo caso: la
  pagina risponde **403** e non l'ho potuta leggere. Non l'ho usata.
- Le citazioni dai documenti legali di Netlify sono passate dal riassunto del
  fetch, **non da una lettura carattere per carattere del PDF**. Se servono in
  un contratto, vanno riprese dall'originale.
- **Il caso Netlify da $104.500 e' invece verificato**: thread HN del
  27/02/2024, forum ufficiale Netlify, e il conto aritmetico che torna al
  centesimo (190.000 GB x $0,55). Quello che **non** ho verificato e' se il
  sito colpito fosse su un piano legacy o su uno gia' a crediti - nel febbraio
  2024 i crediti non esistevano ancora, quindi era legacy (**dedotto**).
