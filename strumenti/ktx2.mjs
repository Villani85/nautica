#!/usr/bin/env node
/**
 * strumenti/ktx2.mjs — compressione KTX2 (Basis) delle mappe PBR.
 *
 * Perche' esiste, in una riga: tre mappe a 2048 in PNG pesano piu' di tutta la
 * geometria del sito, e — la ragione vera — un PNG in memoria video torna a
 * essere RGBA8 non compresso, 16,8 MB a mappa. Il KTX2 resta compresso anche
 * sulla GPU. Sul telefono conta quello, non il trasferimento.
 *
 * Le mappe non si trattano tutte uguali:
 *   - mappe di COLORE (albedo): sRGB. Il colore va visto, non letto.
 *   - mappe di DATO (normale, ORM): LINEARI, mai sRGB. Sbagliare qui non da'
 *     errore: da' una superficie che si spegne. Il comando `danno` lo misura.
 *
 * Comandi:
 *   node strumenti/ktx2.mjs                 → attrezzo + provino + comprimi + verifica
 *   node strumenti/ktx2.mjs attrezzo        → dice solo se l'attrezzo c'e' e dov'e'
 *   node strumenti/ktx2.mjs provino         → genera le texture di prova 2048x2048
 *   node strumenti/ktx2.mjs comprimi <dir>  → comprime una cartella di PNG
 *   node strumenti/ktx2.mjs verifica <dir>  → comprime, decomprime, misura la perdita
 *   node strumenti/ktx2.mjs confronto       → normale e ORM in UASTC vs ETC1S, a confronto
 *   node strumenti/ktx2.mjs danno           → quanto costa etichettare sRGB una normale
 *
 * Opzioni: --out <dir>  --no-mipmap  --colore <etc1s|uastc>  --dato <uastc|etc1s>
 *
 * Codici d'uscita: 0 ok · 2 perdita oltre soglia · 3 attrezzo mancante · 4 uso sbagliato
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const QUI = path.dirname(fileURLToPath(import.meta.url));
const RADICE = path.resolve(QUI, '..');
const CASA = path.join(RADICE, 'riferimenti', 'ktx2');
const PROVINO = path.join(CASA, 'provino');
const USCITA = path.join(CASA, 'uscita');
const TEMP = path.join(CASA, '.tmp');
const ATTREZZO_LOCALE = path.join(CASA, 'attrezzo', 'bin');

const SCARICA = 'https://github.com/KhronosGroup/KTX-Software/releases (pacchetto KTX-Software, dentro c\'e\' ktx.exe e toktx.exe)';

// ─────────────────────────────────────────────────────────────────────────────
// SOGLIE DICHIARATE — se la misura le supera, lo strumento esce con errore.
//
// Non sono numeri di comodo, sono il punto in cui il difetto si vede:
//  · normale, 1,0° medi: sotto questo la superficie non cambia lettura. Il vero
//    guaio delle normali compresse male non e' il rumore, e' la coda: qualche
//    texel che devia di 15-20° spegne uno spigolo intero. Per questo la soglia
//    vera e' il 99° percentile, non la media.
//  · colore, 30 dB: sotto i 30 dB il banding si vede su una superficie tinta
//    piatta, che qui e' meta' della nave.
//  · dato (ORM): i tre canali sono indipendenti, quindi la soglia e' per canale.
//    Uno scivolamento medio di 4/255 su rugosita' e' un cambio di lucentezza
//    che si nota in un riflesso lungo. E anche qui la coda conta piu' della
//    media: misurato, la ORM in ETC1S sta a 35,7 dB — numero rispettabile — e
//    intanto un texel su mille sbaglia la metallicita' di 89/255, cioe' passa
//    da metallo a vernice. 8/255 al 99,9° percentile e' il punto in cui un
//    texel smette di raccontare la stessa superficie dei suoi vicini.
// ─────────────────────────────────────────────────────────────────────────────
const SOGLIE = {
  normale: { gradiMedi: 1.0, gradiP99: 6.0 },
  colore: { psnrMin: 30 },
  dato: { psnrMin: 32, deltaMedioCanale: 4.0, deltaP999Canale: 8 },
};

// ─────────────────────────────────────────────────────────────────────────────
// 1 · L'ATTREZZO
// ─────────────────────────────────────────────────────────────────────────────

function eseguibile(dir, nome) {
  for (const n of [nome + '.exe', nome]) {
    const p = path.join(dir, n);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

function nelPercorso(nome) {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [nome], {
    encoding: 'utf8',
    shell: false,
  });
  if (r.status !== 0 || !r.stdout) return null;
  const primo = r.stdout.split(/\r?\n/).find((s) => s.trim());
  return primo ? primo.trim() : null;
}

function trovaAttrezzo() {
  const posti = [];
  if (process.env.KTX_BIN) posti.push({ dir: process.env.KTX_BIN, come: 'variabile KTX_BIN' });
  posti.push({ dir: ATTREZZO_LOCALE, come: 'copia locale in riferimenti/ktx2/attrezzo/bin' });
  posti.push({ dir: 'C:/Program Files/KTX-Software/bin', come: 'installazione di sistema' });
  posti.push({ dir: '/usr/local/bin', come: 'installazione di sistema' });

  for (const p of posti) {
    if (!p.dir || !fs.existsSync(p.dir)) continue;
    const ktx = eseguibile(p.dir, 'ktx');
    const toktx = eseguibile(p.dir, 'toktx');
    if (ktx || toktx) return { ktx, toktx, basisu: null, origine: `${p.come} (${p.dir})` };
  }

  const ktx = nelPercorso('ktx');
  const toktx = nelPercorso('toktx');
  const basisu = nelPercorso('basisu');
  if (ktx || toktx || basisu)
    return { ktx, toktx, basisu, origine: 'PATH di sistema' };

  return null;
}

function pretendiAttrezzo() {
  const a = trovaAttrezzo();
  if (!a) {
    console.error('');
    console.error('  MANCA L\'ATTREZZO. Non comprimo niente e non installo niente di nascosto.');
    console.error('');
    console.error('  Serve UNO di questi eseguibili:');
    console.error('    ktx      (KTX-Software 4.x, la CLI unificata — e\' quella che uso)');
    console.error('    toktx    (KTX-Software, la CLI vecchia — comprime, ma non sa ri-decodificare)');
    console.error('    basisu   (basis_universal, riconosciuto ma non ancora pilotato da qui)');
    console.error('');
    console.error('  Dove l\'ho cercato:');
    console.error(`    - $KTX_BIN                          ${process.env.KTX_BIN || '(non impostata)'}`);
    console.error(`    - ${ATTREZZO_LOCALE}`);
    console.error('    - C:/Program Files/KTX-Software/bin');
    console.error('    - il PATH');
    console.error('');
    console.error(`  Si scarica da: ${SCARICA}`);
    console.error('  Su Windows la release e\' un installer NSIS: si puo\' anche solo estrarre');
    console.error(`  con 7-Zip e copiare la cartella bin/ in ${ATTREZZO_LOCALE}`);
    console.error('  (serve ktx.dll accanto all\'eseguibile).');
    console.error('');
    process.exit(3);
  }
  if (!a.ktx) {
    console.error('');
    console.error('  Trovato solo un attrezzo parziale.');
    if (a.toktx) console.error(`    toktx  → ${a.toktx}  (comprime, ma non ha "extract": niente verifica di perdita)`);
    if (a.basisu) console.error(`    basisu → ${a.basisu}  (produce .basis/.ktx2 ma con opzioni diverse)`);
    console.error('');
    console.error('  Serve `ktx` (KTX-Software 4.x) per fare anche il giro di ritorno');
    console.error('  compressione → decompressione → confronto, che e\' il punto di questo strumento.');
    console.error(`  Si scarica da: ${SCARICA}`);
    console.error('');
    process.exit(3);
  }
  return a;
}

function versione(a) {
  const r = spawnSync(a.ktx, ['--version'], { encoding: 'utf8' });
  return (r.stdout || r.stderr || '').trim();
}

function corri(exe, argomenti, dove) {
  const r = spawnSync(exe, argomenti, { encoding: 'utf8', cwd: dove || RADICE, maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw new Error(`${path.basename(exe)} non parte: ${r.error.message}`);
  if (r.status !== 0) {
    throw new Error(
      `${path.basename(exe)} ${argomenti.join(' ')}\n  uscito con ${r.status}\n  ${(r.stderr || r.stdout || '').trim()}`
    );
  }
  return (r.stdout || '') + (r.stderr || '');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 · CHI E' COSA — colore contro dato
// ─────────────────────────────────────────────────────────────────────────────

const REGOLE = [
  { prova: /(albedo|basecolor|base_color|colore|diffus|emissi)/i, tipo: 'colore' },
  { prova: /(normal|normale|_nrm|_n\b)/i, tipo: 'normale' },
  { prova: /(orm|arm|rough|metal|_ao\b|occlusion|mask|height|displac|_data)/i, tipo: 'dato' },
];

function classifica(nomeFile) {
  const n = path.basename(nomeFile);
  for (const r of REGOLE) if (r.prova.test(n)) return r.tipo;
  return null;
}

function ricetta(tipo, opz) {
  if (tipo === 'colore') {
    const codec = opz.colore;
    return {
      tipo,
      tf: 'srgb',
      codec,
      // sRGB: il formato porta il suffisso _SRGB e la funzione di trasferimento
      // viene DICHIARATA, non convertita. I byte restano quelli del PNG.
      formatoSuffisso: '_SRGB',
      assignTf: 'srgb',
    };
  }
  return {
    tipo,
    tf: 'linear',
    codec: opz.dato,
    // Lineare. Mai _SRGB su una normale o su una ORM: nessuno da' errore,
    // e la GPU applica un'inversa di gamma su numeri che non sono colori.
    formatoSuffisso: '_UNORM',
    assignTf: 'linear',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 · MEMORIA GPU
// ─────────────────────────────────────────────────────────────────────────────
//
// Un PNG non esiste sulla GPU: viene decodificato e caricato come RGBA8.
// larghezza x altezza x 4 byte, punto. Il KTX2 Basis viene TRANSCODIFICATO a
// un formato a blocchi e resta compresso in memoria video per tutta la vita
// della pagina. Questo e' il numero che conta sul telefono.
//
//   ETC1S senza alfa → BC1 (desktop) / ETC1 (mobile)          4 bit/texel
//   ETC1S con alfa   → BC3 (desktop) / ETC2 RGBA (mobile)     8 bit/texel
//   UASTC            → BC7 (desktop) / ASTC 4x4 (mobile)      8 bit/texel
//
// Le mipmap aggiungono un terzo abbondante: 1 + 1/4 + 1/16 + ... = 4/3.

function bitPerTexel(codec, conAlfa) {
  if (codec === 'uastc') return { bit: 8, bersaglio: 'BC7 (desktop) / ASTC 4x4 (mobile)' };
  return conAlfa
    ? { bit: 8, bersaglio: 'BC3 (desktop) / ETC2 RGBA (mobile)' }
    : { bit: 4, bersaglio: 'BC1 (desktop) / ETC1 (mobile)' };
}

function memoriaGPU(w, h, bit, conMipmap) {
  const base = (w * h * bit) / 8;
  return conMipmap ? base * (4 / 3) : base;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4 · LEGGERE L'INTESTAZIONE DI UN PNG (senza decodificarlo)
// ─────────────────────────────────────────────────────────────────────────────

function intestazionePng(file) {
  const fd = fs.openSync(file, 'r');
  const b = Buffer.alloc(33);
  fs.readSync(fd, b, 0, 33, 0);
  fs.closeSync(fd);
  if (b.readUInt32BE(0) !== 0x89504e47) throw new Error(`${path.basename(file)} non e' un PNG`);
  if (b.toString('latin1', 12, 16) !== 'IHDR') throw new Error(`${path.basename(file)}: IHDR mancante`);
  const larghezza = b.readUInt32BE(16);
  const altezza = b.readUInt32BE(20);
  const profondita = b[24];
  const tipoColore = b[25];
  const canali = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[tipoColore];
  if (tipoColore !== 2 && tipoColore !== 6)
    throw new Error(
      `${path.basename(file)}: tipo colore PNG ${tipoColore} non gestito. Servono RGB (2) o RGBA (6).`
    );
  if (profondita !== 8) throw new Error(`${path.basename(file)}: profondita' ${profondita} bit, ne servono 8`);
  return { larghezza, altezza, canali, conAlfa: tipoColore === 6 };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5 · COMPRIMERE
// ─────────────────────────────────────────────────────────────────────────────

function argomentiCompressione(png, ktx2, r, info, opz) {
  const componenti = info.conAlfa ? 'R8G8B8A8' : 'R8G8B8';
  const a = [
    'create',
    '--format', componenti + r.formatoSuffisso,
    '--assign-tf', r.assignTf,
    // se l'ingresso non dichiara nulla, non voglio conversioni silenziose
    '--no-warn-on-color-conversions',
  ];
  if (opz.mipmap) a.push('--generate-mipmap', '--mipmap-filter', 'lanczos4');
  if (r.codec === 'uastc') {
    a.push('--encode', 'uastc', '--uastc-quality', '3');
    // UASTC e' 8 bit/texel fissi: il file si sgonfia solo con lo zstd sopra,
    // che e' trasparente (si scompatta al caricamento, non in memoria video).
    a.push('--zstd', '18');
  } else {
    a.push('--encode', 'basis-lz', '--clevel', '2', '--qlevel', String(opz.qlevel));
    // Su un dato (normale/ORM) ETC1S senza RDO tiene molto meglio i canali.
    if (r.tipo !== 'colore') a.push('--no-endpoint-rdo', '--no-selector-rdo');
  }
  a.push(png, ktx2);
  return a;
}

/**
 * Il peso del solo livello 0. Serve per essere onesti: il KTX2 porta dentro le
 * mipmap (un terzo in piu'), il PNG no. Confrontare i due file interi
 * gonfierebbe il PNG di un vantaggio che non ha, perche' le mipmap di un
 * formato compresso NON si possono generare a runtime: o stanno nel file, o
 * il materiale aliasa.
 */
function livelloZero(a, ktx2) {
  try {
    const t = corri(a.ktx, ['info', ktx2]);
    const m = t.match(/Level0\.byteLength:\s*(\d+)/);
    return m ? Number(m[1]) : null;
  } catch {
    return null;
  }
}

function comprimiUno(a, png, cartellaUscita, opz, tipoForzato) {
  const info = intestazionePng(png);
  const tipo = tipoForzato || classifica(png);
  if (!tipo)
    throw new Error(
      `${path.basename(png)}: non capisco se e' colore o dato dal nome.\n` +
        `  Metti nel nome albedo/basecolor, normal, oppure orm/rough/metal/ao.\n` +
        `  Sbagliare qui non da' errore: da' un materiale storto.`
    );
  const r = ricetta(tipo, opz);
  const uscita = path.join(cartellaUscita, path.basename(png).replace(/\.png$/i, '.ktx2'));
  fs.mkdirSync(cartellaUscita, { recursive: true });
  const t0 = Date.now();
  corri(a.ktx, argomentiCompressione(png, uscita, r, info, opz));
  const secondi = (Date.now() - t0) / 1000;

  const pesoPng = fs.statSync(png).size;
  const pesoKtx = fs.statSync(uscita).size;
  const bpt = bitPerTexel(r.codec, info.conAlfa);
  return {
    png, uscita, info, tipo, ricetta: r, secondi,
    pesoPng, pesoKtx, pesoLivelloZero: livelloZero(a, uscita), livelli: opz.mipmap ? '1+mip' : '1',
    bit: bpt.bit, bersaglio: bpt.bersaglio,
    gpuPng: memoriaGPU(info.larghezza, info.altezza, 32, false),
    gpuKtx: memoriaGPU(info.larghezza, info.altezza, bpt.bit, opz.mipmap),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6 · DECOMPRIMERE E CONFRONTARE
// ─────────────────────────────────────────────────────────────────────────────

/** I pixel del PNG di partenza, letti dallo stesso caricatore che li ha compressi. */
function pixelOriginali(a, png, info) {
  fs.mkdirSync(TEMP, { recursive: true });
  const k = path.join(TEMP, `rif-${process.pid}.ktx2`);
  const g = path.join(TEMP, `rif-${process.pid}.raw`);
  const comp = info.conAlfa ? 'R8G8B8A8_UNORM' : 'R8G8B8_UNORM';
  corri(a.ktx, ['create', '--format', comp, '--assign-tf', 'linear', '--no-warn-on-color-conversions', png, k]);
  corri(a.ktx, ['extract', '--level', '0', '--raw', k, g]);
  const b = fs.readFileSync(g);
  const attesi = info.larghezza * info.altezza * info.canali;
  if (b.length !== attesi)
    throw new Error(`estrazione originale: ${b.length} byte invece di ${attesi}`);
  return b;
}

/** I pixel dopo il giro completo: compressi e ri-decodificati come li vede la GPU. */
function pixelRicostruiti(a, ktx2, info) {
  fs.mkdirSync(TEMP, { recursive: true });
  const g = path.join(TEMP, `ric-${process.pid}.raw`);
  corri(a.ktx, ['extract', '--level', '0', '--transcode', 'rgba8', '--raw', ktx2, g]);
  const b = fs.readFileSync(g);
  const attesi = info.larghezza * info.altezza * 4;
  if (b.length !== attesi)
    throw new Error(`estrazione ricostruita: ${b.length} byte invece di ${attesi}`);
  return b;
}

/**
 * PSNR e coda dell'errore, canale per canale.
 * La media da sola mente su una mappa di dato: la ORM in ETC1S sta a 35 dB —
 * numero rispettabile — e intanto un texel su mille sbaglia la metallicita'
 * di 89 livelli su 255, cioe' passa da metallo a vernice. Per questo qui il
 * numero che decide e' il 99,9° percentile, non la media.
 */
function statistichePerCanale(orig, ric, info) {
  const n = info.larghezza * info.altezza;
  const c = Math.min(info.canali, 3);
  const mse = new Float64Array(c);
  const somma = new Float64Array(c);
  const isto = Array.from({ length: c }, () => new Uint32Array(256));
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < c; k++) {
      const d = orig[i * info.canali + k] - ric[i * 4 + k];
      mse[k] += d * d;
      const ad = d < 0 ? -d : d;
      somma[k] += ad;
      isto[k][ad]++;
    }
  }
  return Array.from({ length: c }, (_, k) => {
    const p = (q) => {
      let acc = 0;
      const b = q * n;
      for (let v = 0; v < 256; v++) { acc += isto[k][v]; if (acc >= b) return v; }
      return 255;
    };
    let max = 0;
    for (let v = 255; v >= 0; v--) if (isto[k][v]) { max = v; break; }
    return {
      mse: mse[k] / n,
      psnr: mse[k] === 0 ? Infinity : 10 * Math.log10((255 * 255) / (mse[k] / n)),
      deltaMedio: somma[k] / n,
      deltaP99: p(0.99),
      deltaP999: p(0.999),
      deltaMax: max,
    };
  });
}

/**
 * Di quanti gradi devia la normale ricostruita.
 * Una normale compressa male non si vede come rumore: si vede come una
 * superficie che si spegne. Quindi non basta la media, serve la coda.
 */
function deviazioneNormali(orig, ric, info) {
  const n = info.larghezza * info.altezza;
  const s = info.canali;
  const BIN = 0.02; // gradi per casella
  const CASELLE = Math.ceil(180 / BIN) + 1;
  const isto = new Uint32Array(CASELLE);
  let somma = 0;
  let contati = 0;
  let massimo = 0;
  let scartati = 0;
  for (let i = 0; i < n; i++) {
    let ax = (orig[i * s] / 255) * 2 - 1;
    let ay = (orig[i * s + 1] / 255) * 2 - 1;
    let az = (orig[i * s + 2] / 255) * 2 - 1;
    const la = Math.hypot(ax, ay, az);
    if (la < 0.2) { scartati++; continue; }
    ax /= la; ay /= la; az /= la;
    let bx = (ric[i * 4] / 255) * 2 - 1;
    let by = (ric[i * 4 + 1] / 255) * 2 - 1;
    let bz = (ric[i * 4 + 2] / 255) * 2 - 1;
    const lb = Math.hypot(bx, by, bz);
    if (lb < 1e-6) { scartati++; continue; }
    bx /= lb; by /= lb; bz /= lb;
    let d = ax * bx + ay * by + az * bz;
    if (d > 1) d = 1; else if (d < -1) d = -1;
    const g = (Math.acos(d) * 180) / Math.PI;
    somma += g;
    contati++;
    if (g > massimo) massimo = g;
    isto[Math.min(CASELLE - 1, Math.round(g / BIN))]++;
  }
  const perc = (q) => {
    let bersaglio = q * contati;
    let acc = 0;
    for (let i = 0; i < CASELLE; i++) {
      acc += isto[i];
      if (acc >= bersaglio) return i * BIN;
    }
    return massimo;
  };
  return {
    medi: somma / contati,
    p50: perc(0.5),
    p95: perc(0.95),
    p99: perc(0.99),
    p999: perc(0.999),
    max: massimo,
    contati,
    scartati,
  };
}

/** Quanto e' inclinata la normale di partenza: serve a provare che il provino non e' piatto. */
function ripiditaNormali(orig, info) {
  const n = info.larghezza * info.altezza;
  const s = info.canali;
  let somma = 0, oltre5 = 0, oltre10 = 0, oltre30 = 0, max = 0;
  for (let i = 0; i < n; i++) {
    let x = (orig[i * s] / 255) * 2 - 1;
    let y = (orig[i * s + 1] / 255) * 2 - 1;
    let z = (orig[i * s + 2] / 255) * 2 - 1;
    const l = Math.hypot(x, y, z) || 1;
    let d = z / l;
    if (d > 1) d = 1; else if (d < -1) d = -1;
    const g = (Math.acos(d) * 180) / Math.PI;
    somma += g;
    if (g > 5) oltre5++;
    if (g > 10) oltre10++;
    if (g > 30) oltre30++;
    if (g > max) max = g;
  }
  return { medi: somma / n, oltre5: oltre5 / n, oltre10: oltre10 / n, oltre30: oltre30 / n, max };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7 · IL PROVINO — texture di prova che assomigliano a quelle vere
// ─────────────────────────────────────────────────────────────────────────────
//
// Non rumore bianco: il rumore bianco comprime in modo atipico (male e in modo
// uniforme) e falserebbe ogni numero. Qui c'e' quello che ci sara' davvero:
// pannelli con spigoli smussati, ribattini, buccia d'arancia, fughe.

const LATO = 2048;

function caso(ix, iy, seme) {
  let n = (Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263) ^ Math.imul(seme | 0, 1274126177)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function valore(x, y, seme) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = caso(ix, iy, seme), b = caso(ix + 1, iy, seme);
  const c = caso(ix, iy + 1, seme), d = caso(ix + 1, iy + 1, seme);
  return (a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy;
}

function fbm(x, y, seme, ottave, scala) {
  let v = 0, amp = 1, tot = 0, f = 1 / scala;
  for (let o = 0; o < ottave; o++) {
    v += amp * valore(x * f, y * f, seme + o * 131);
    tot += amp;
    amp *= 0.5;
    f *= 2.03;
  }
  return v / tot;
}

const passo = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const CW = 256; // larghezza pannello
const CH = 341; // altezza pannello (non quadrato: piu' simile a una lamiera vera)

/** distanza dal bordo del pannello, e distanza dal ribattino piu' vicino */
function geometriaPannello(x, y) {
  const lx = x % CW, ly = y % CH;
  const dBordo = Math.min(lx, CW - lx, ly, CH - ly);
  const ryn = Math.round(ly / 48) * 48;
  const dRib = Math.min(Math.hypot(lx - 14, ly - ryn), Math.hypot(lx - (CW - 14), ly - ryn));
  return { dBordo, dRib, px: Math.floor(x / CW), py: Math.floor(y / CH), lx, ly };
}

function generaProvino() {
  fs.mkdirSync(PROVINO, { recursive: true });
  const N = LATO * LATO;

  // ── campo di altezza ──────────────────────────────────────────────────────
  const h = new Float32Array(N);
  const dist = new Float32Array(N);
  for (let y = 0; y < LATO; y++) {
    for (let x = 0; x < LATO; x++) {
      const i = y * LATO + x;
      const g = geometriaPannello(x, y);
      dist[i] = g.dBordo;
      // la fuga fra pannelli, con lo smusso: 3 px di fondo, 11 px di rampa
      let v = passo(3, 14, g.dBordo) * 1.0;
      // il ribattino: calotta sferica
      if (g.dRib < 5.2) v += (Math.sqrt(Math.max(0, 27 - g.dRib * g.dRib)) / 5.2) * 0.42;
      // ondulazione della lamiera fra un rinforzo e l'altro
      v += fbm(x, y, 11, 3, 220) * 0.30;
      // buccia d'arancia della vernice
      v += fbm(x, y, 77, 4, 9) * 0.020;
      h[i] = v;
    }
  }

  // ── normale dal gradiente ─────────────────────────────────────────────────
  const FORZA = 26;
  const nrm = new Uint8Array(N * 3);
  for (let y = 0; y < LATO; y++) {
    const su = ((y - 1 + LATO) % LATO) * LATO;
    const giu = ((y + 1) % LATO) * LATO;
    const qui = y * LATO;
    for (let x = 0; x < LATO; x++) {
      const sx = (x - 1 + LATO) % LATO, dx = (x + 1) % LATO;
      const gx = (h[qui + dx] - h[qui + sx]) * 0.5 * FORZA;
      const gy = (h[giu + x] - h[su + x]) * 0.5 * FORZA;
      let nx = -gx, ny = -gy, nz = 1;
      const l = Math.hypot(nx, ny, nz);
      nx /= l; ny /= l; nz /= l;
      const i = (qui + x) * 3;
      nrm[i] = Math.max(0, Math.min(255, Math.round((nx * 0.5 + 0.5) * 255)));
      nrm[i + 1] = Math.max(0, Math.min(255, Math.round((ny * 0.5 + 0.5) * 255)));
      nrm[i + 2] = Math.max(0, Math.min(255, Math.round((nz * 0.5 + 0.5) * 255)));
    }
  }
  scriviPng(path.join(PROVINO, 'normale.png'), LATO, LATO, 3, nrm);

  // ── ORM: tre canali che non si somigliano ────────────────────────────────
  const orm = new Uint8Array(N * 3);
  for (let y = 0; y < LATO; y++) {
    for (let x = 0; x < LATO; x++) {
      const i = y * LATO + x;
      const g = geometriaPannello(x, y);
      // R = occlusione: buia nelle fughe e sotto i ribattini, larga e morbida
      const ao = 1 - 0.55 * (1 - passo(0, 16, g.dBordo)) - 0.25 * (1 - passo(0, 8, g.dRib));
      // G = rugosita': a chiazze per pannello, con graffi sottili
      const perPannello = caso(g.px, g.py, 909);
      const graffio = passo(0.985, 1.0, fbm(x * 0.15, y * 3.0, 313, 2, 40));
      const rug = 0.28 + perPannello * 0.34 + fbm(x, y, 505, 4, 60) * 0.20 - graffio * 0.22;
      // B = metallicita': quasi binaria, a blocchi netti. Nessuna parentela con
      // gli altri due canali: e' esattamente il caso che ETC1S fatica a tenere.
      const met = caso(g.px, g.py, 4242) > 0.45 ? 1 : 0.04;
      const j = i * 3;
      orm[j] = Math.max(0, Math.min(255, Math.round(ao * 255)));
      orm[j + 1] = Math.max(0, Math.min(255, Math.round(rug * 255)));
      orm[j + 2] = Math.max(0, Math.min(255, Math.round(met * 255)));
    }
  }
  scriviPng(path.join(PROVINO, 'orm.png'), LATO, LATO, 3, orm);

  // ── albedo ────────────────────────────────────────────────────────────────
  const TINTE = [
    [232, 234, 231], [222, 225, 224], [24, 36, 52], [30, 44, 62], [198, 160, 104],
  ];
  const col = new Uint8Array(N * 3);
  for (let y = 0; y < LATO; y++) {
    for (let x = 0; x < LATO; x++) {
      const i = y * LATO + x;
      const g = geometriaPannello(x, y);
      const t = TINTE[Math.floor(caso(g.px, g.py, 1717) * TINTE.length) % TINTE.length];
      // la fascia dipinta che attraversa la fiancata
      const fascia = passo(1180, 1200, y) * (1 - passo(1300, 1320, y));
      // sporco che cola dalle fughe
      const colatura = passo(0.62, 0.95, fbm(x * 0.6, y * 0.08, 606, 3, 30)) * passo(0, 40, g.dBordo);
      const ombraFuga = 0.55 + 0.45 * passo(0, 10, g.dBordo);
      const macchia = 0.94 + fbm(x, y, 808, 4, 90) * 0.12;
      const j = i * 3;
      for (let k = 0; k < 3; k++) {
        let v = t[k];
        v = v * (1 - fascia) + [176, 32, 38][k] * fascia;
        v *= ombraFuga * macchia;
        v = v * (1 - colatura * 0.35) + [86, 74, 58][k] * (colatura * 0.35);
        col[j + k] = Math.max(0, Math.min(255, Math.round(v)));
      }
    }
  }
  scriviPng(path.join(PROVINO, 'albedo.png'), LATO, LATO, 3, col);

  return ['normale.png', 'orm.png', 'albedo.png'].map((f) => path.join(PROVINO, f));
}

// ─────────────────────────────────────────────────────────────────────────────
// 8 · UN CODIFICATORE PNG, per non aggiungere dipendenze al progetto
// ─────────────────────────────────────────────────────────────────────────────

const TAB_CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = TAB_CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function pezzo(tipo, dati) {
  const t = Buffer.from(tipo, 'latin1');
  const testa = Buffer.alloc(4);
  testa.writeUInt32BE(dati.length, 0);
  const coda = Buffer.alloc(4);
  coda.writeUInt32BE(crc32(Buffer.concat([t, dati])), 0);
  return Buffer.concat([testa, t, dati, coda]);
}

const paeth = (a, b, c) => {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

/** PNG a 8 bit, RGB o RGBA, con filtro adattivo per riga come fa un vero esportatore. */
function scriviPng(file, w, h, canali, dati) {
  const passoRiga = w * canali;
  const fuori = Buffer.alloc((passoRiga + 1) * h);
  const cand = [Buffer.alloc(passoRiga), Buffer.alloc(passoRiga), Buffer.alloc(passoRiga), Buffer.alloc(passoRiga), Buffer.alloc(passoRiga)];
  let prec = Buffer.alloc(passoRiga);
  for (let y = 0; y < h; y++) {
    const riga = dati.subarray(y * passoRiga, (y + 1) * passoRiga);
    const punteggio = [0, 0, 0, 0, 0];
    for (let i = 0; i < passoRiga; i++) {
      const a = i >= canali ? riga[i - canali] : 0;
      const b = prec[i];
      const c = i >= canali ? prec[i - canali] : 0;
      const v = riga[i];
      cand[0][i] = v;
      cand[1][i] = (v - a) & 0xff;
      cand[2][i] = (v - b) & 0xff;
      cand[3][i] = (v - ((a + b) >> 1)) & 0xff;
      cand[4][i] = (v - paeth(a, b, c)) & 0xff;
      for (let k = 0; k < 5; k++) {
        const s = cand[k][i];
        punteggio[k] += s < 128 ? s : 256 - s;
      }
    }
    let best = 0;
    for (let k = 1; k < 5; k++) if (punteggio[k] < punteggio[best]) best = k;
    fuori[y * (passoRiga + 1)] = best;
    cand[best].copy(fuori, y * (passoRiga + 1) + 1);
    prec = Buffer.from(riga);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = canali === 4 ? 6 : 2;
  const idat = zlib.deflateSync(fuori, { level: 9 });
  fs.writeFileSync(
    file,
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      pezzo('IHDR', ihdr),
      pezzo('IDAT', idat),
      pezzo('IEND', Buffer.alloc(0)),
    ])
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9 · STAMPA
// ─────────────────────────────────────────────────────────────────────────────

const mb = (b) => (b / 1048576).toFixed(2) + ' MB';
const kb = (b) => (b / 1024).toFixed(0) + ' KB';
const peso = (b) => (b >= 1048576 ? mb(b) : kb(b));

function titolo(t) {
  console.log('');
  console.log('  ' + t);
  console.log('  ' + '─'.repeat(t.length));
}

function tabella(righe) {
  const larghezze = righe[0].map((_, i) => Math.max(...righe.map((r) => String(r[i]).length)));
  righe.forEach((r, y) => {
    console.log(
      '  ' + r.map((c, i) => (i === 0 ? String(c).padEnd(larghezze[i]) : String(c).padStart(larghezze[i]))).join('  ')
    );
    if (y === 0) console.log('  ' + larghezze.map((l) => '─'.repeat(l)).join('  '));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 10 · I COMANDI
// ─────────────────────────────────────────────────────────────────────────────

function pngDiCartella(dir) {
  if (!fs.existsSync(dir)) throw new Error(`cartella inesistente: ${dir}`);
  if (fs.statSync(dir).isFile()) return [dir];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.png$/i.test(f))
    .sort()
    .map((f) => path.join(dir, f));
}

function comandoAttrezzo() {
  const a = pretendiAttrezzo();
  console.log('');
  console.log(`  attrezzo trovato: ${versione(a)}`);
  console.log(`  origine:          ${a.origine}`);
  console.log(`  ktx:              ${a.ktx}`);
  if (a.toktx) console.log(`  toktx:            ${a.toktx}`);
  console.log('');
  return a;
}

function comandoProvino() {
  titolo('provino — texture di prova 2048x2048');
  const t0 = Date.now();
  const file = generaProvino();
  console.log(`  generate in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  const righe = [['file', 'peso PNG', 'canali']];
  for (const f of file) {
    const i = intestazionePng(f);
    righe.push([path.basename(f), peso(fs.statSync(f).size), `${i.larghezza}x${i.altezza}x${i.canali}`]);
  }
  tabella(righe);
  return file;
}

function comandoComprimi(a, sorgente, opz) {
  const file = pngDiCartella(sorgente);
  if (!file.length) throw new Error(`nessun PNG in ${sorgente}`);
  titolo(`compressione — ${file.length} mappe · mipmap ${opz.mipmap ? 'si' : 'no'}`);
  const esiti = file.map((f) => comprimiUno(a, f, opz.out, opz));

  tabella([
    ['mappa', 'tipo', 'tf', 'codec', 'PNG', 'KTX2 tutto', 'KTX2 liv.0', 'x su liv.0', 's'],
    ...esiti.map((e) => [
      path.basename(e.png),
      e.tipo,
      e.ricetta.tf,
      e.ricetta.codec,
      peso(e.pesoPng),
      peso(e.pesoKtx),
      e.pesoLivelloZero ? peso(e.pesoLivelloZero) : '—',
      e.pesoLivelloZero ? (e.pesoPng / e.pesoLivelloZero).toFixed(2) : '—',
      e.secondi.toFixed(1),
    ]),
  ]);
  console.log('');
  console.log('  «KTX2 tutto» include le mipmap, il PNG no: per il confronto onesto guarda «liv.0».');
  console.log('  Le mipmap nel file non sono spreco — un formato compresso non le sa generare a runtime.');

  console.log('');
  console.log('  memoria video — il numero che conta sul telefono');
  console.log('  (il PNG sulla GPU non esiste: torna RGBA8. Il KTX2 resta a blocchi.)');
  console.log('');
  tabella([
    ['mappa', 'PNG → RGBA8', 'KTX2 in VRAM', 'bit/texel', 'x', 'formato a runtime'],
    ...esiti.map((e) => [
      path.basename(e.png),
      peso(e.gpuPng),
      peso(e.gpuKtx),
      String(e.bit),
      (e.gpuPng / e.gpuKtx).toFixed(2),
      e.bersaglio,
    ]),
  ]);

  const tp = esiti.reduce((s, e) => s + e.pesoPng, 0);
  const tk = esiti.reduce((s, e) => s + e.pesoKtx, 0);
  const gp = esiti.reduce((s, e) => s + e.gpuPng, 0);
  const gk = esiti.reduce((s, e) => s + e.gpuKtx, 0);
  console.log('');
  console.log(`  totale trasferito: ${peso(tp)} → ${peso(tk)}   (${(tp / tk).toFixed(2)}x)`);
  console.log(`  totale in VRAM:    ${peso(gp)} → ${peso(gk)}   (${(gp / gk).toFixed(2)}x)`);
  console.log('');
  return esiti;
}

function comandoVerifica(a, esiti) {
  titolo('perdita — compresso, ri-decodificato, confrontato col PNG di partenza');
  let bocciato = false;
  const note = [];

  for (const e of esiti) {
    const orig = pixelOriginali(a, e.png, e.info);
    const ric = pixelRicostruiti(a, e.uscita, e.info);
    const p = statistichePerCanale(orig, ric, e.info);
    console.log('');
    console.log(`  ${path.basename(e.png)}  [${e.tipo} · ${e.ricetta.tf} · ${e.ricetta.codec}]`);

    if (e.tipo === 'normale') {
      const rip = ripiditaNormali(orig, e.info);
      const d = deviazioneNormali(orig, ric, e.info);
      console.log(
        `    il provino non e' piatto: inclinazione media ${rip.medi.toFixed(1)}°, ` +
          `${(rip.oltre10 * 100).toFixed(1)}% dei texel oltre 10°, massimo ${rip.max.toFixed(1)}°`
      );
      tabella([
        ['deviazione del vettore ricostruito', 'gradi', 'soglia'],
        ['media', d.medi.toFixed(3), SOGLIE.normale.gradiMedi.toFixed(2)],
        ['mediana', d.p50.toFixed(3), '—'],
        ['95°  percentile', d.p95.toFixed(3), '—'],
        ['99°  percentile', d.p99.toFixed(3), SOGLIE.normale.gradiP99.toFixed(2)],
        ['99,9° percentile', d.p999.toFixed(3), '—'],
        ['massimo', d.max.toFixed(3), '—'],
      ]);
      if (d.medi > SOGLIE.normale.gradiMedi) {
        bocciato = true;
        note.push(`${path.basename(e.png)}: deviazione media ${d.medi.toFixed(3)}° oltre ${SOGLIE.normale.gradiMedi}°`);
      }
      if (d.p99 > SOGLIE.normale.gradiP99) {
        bocciato = true;
        note.push(`${path.basename(e.png)}: 99° percentile ${d.p99.toFixed(3)}° oltre ${SOGLIE.normale.gradiP99}° — la coda spegne gli spigoli`);
      }
    }

    const nomi = e.tipo === 'dato' ? ['R occlusione', 'G rugosita\'', 'B metallo'] : ['R', 'G', 'B'];
    tabella([
      ['canale', 'PSNR dB', 'delta medio', 'delta p99', 'delta p99,9', 'delta max'],
      ...p.map((c, k) => [
        nomi[k] || 'canale ' + k,
        c.psnr === Infinity ? '∞' : c.psnr.toFixed(2),
        c.deltaMedio.toFixed(2),
        String(c.deltaP99),
        String(c.deltaP999),
        String(c.deltaMax),
      ]),
    ]);

    if (e.tipo === 'colore') {
      const peggio = Math.min(...p.map((c) => c.psnr));
      if (peggio < SOGLIE.colore.psnrMin) {
        bocciato = true;
        note.push(`${path.basename(e.png)}: PSNR peggiore ${peggio.toFixed(2)} dB sotto ${SOGLIE.colore.psnrMin} dB`);
      }
    }
    if (e.tipo === 'dato') {
      const peggio = Math.min(...p.map((c) => c.psnr));
      const dmax = Math.max(...p.map((c) => c.deltaMedio));
      if (peggio < SOGLIE.dato.psnrMin) {
        bocciato = true;
        note.push(`${path.basename(e.png)}: PSNR peggiore ${peggio.toFixed(2)} dB sotto ${SOGLIE.dato.psnrMin} dB`);
      }
      if (dmax > SOGLIE.dato.deltaMedioCanale) {
        bocciato = true;
        note.push(`${path.basename(e.png)}: scivolamento medio ${dmax.toFixed(2)}/255 su un canale, oltre ${SOGLIE.dato.deltaMedioCanale}`);
      }
      const coda = Math.max(...p.map((c) => c.deltaP999));
      if (coda > SOGLIE.dato.deltaP999Canale) {
        bocciato = true;
        note.push(
          `${path.basename(e.png)}: coda a ${coda}/255 al 99,9° percentile, oltre ${SOGLIE.dato.deltaP999Canale}` +
            ` — la media sta buona e intanto un texel su mille cambia materiale`
        );
      }
    }
  }

  console.log('');
  if (bocciato) {
    console.log('  ROSSO — la perdita supera le soglie dichiarate:');
    note.forEach((n) => console.log('    · ' + n));
    console.log('');
    return 2;
  }
  console.log('  VERDE — la perdita sta dentro le soglie dichiarate.');
  console.log('');
  return 0;
}

function comandoConfronto(a, opz) {
  titolo('confronto — lo stesso dato in UASTC e in ETC1S');
  console.log('  Serve a mostrare che la scelta del codec sulle mappe di DATO non e\' di gusto.');
  const file = [path.join(PROVINO, 'normale.png'), path.join(PROVINO, 'orm.png')];
  const righe = [['mappa', 'codec', 'KTX2', 'VRAM', 'bit/texel', 'gradi medi', 'gradi p99', 'PSNR min dB']];
  for (const f of file) {
    for (const codec of ['uastc', 'etc1s']) {
      const e = comprimiUno(a, f, path.join(TEMP, codec), { ...opz, dato: codec, colore: codec });
      const orig = pixelOriginali(a, f, e.info);
      const ric = pixelRicostruiti(a, e.uscita, e.info);
      const p = statistichePerCanale(orig, ric, e.info);
      const nrm = /normale/.test(f) ? deviazioneNormali(orig, ric, e.info) : null;
      righe.push([
        path.basename(f),
        codec,
        peso(e.pesoKtx),
        peso(e.gpuKtx),
        String(e.bit),
        nrm ? nrm.medi.toFixed(3) : '—',
        nrm ? nrm.p99.toFixed(2) : '—',
        Math.min(...p.map((c) => c.psnr)).toFixed(2),
      ]);
    }
  }
  tabella(righe);
  console.log('');
}

function comandoDanno(a) {
  titolo('danno — che succede se una normale viene etichettata sRGB');
  console.log('  Nessuno da\' errore. Il file si scrive, il sito si carica, il materiale');
  console.log('  sembra solo "un po\' storto". Ecco di quanto, in gradi.');
  const f = path.join(PROVINO, 'normale.png');
  if (!fs.existsSync(f)) throw new Error('manca il provino: lancia prima `node strumenti/ktx2.mjs provino`');
  const info = intestazionePng(f);
  const orig = pixelOriginali(a, f, info);

  // Al caricamento, una texture marcata sRGB viene riportata in lineare dalla
  // GPU. Su un colore e' giusto; su una normale sono numeri che non sono colori.
  const n = info.larghezza * info.altezza;
  const s = info.canali;
  const finto = Buffer.alloc(n * 4);
  const daSrgb = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 3; k++) finto[i * 4 + k] = Math.round(daSrgb(orig[i * s + k] / 255) * 255);
    finto[i * 4 + 3] = 255;
  }
  const d = deviazioneNormali(orig, finto, info);
  tabella([
    ['deviazione con l\'etichetta sbagliata', 'gradi'],
    ['media', d.medi.toFixed(2)],
    ['mediana', d.p50.toFixed(2)],
    ['99° percentile', d.p99.toFixed(2)],
    ['massimo', d.max.toFixed(2)],
  ]);
  console.log('');
  console.log(`  Per confronto, la soglia che questo strumento impone alla compressione`);
  console.log(`  e' ${SOGLIE.normale.gradiMedi}° medi. L'errore di etichetta costa ${(d.medi / SOGLIE.normale.gradiMedi).toFixed(0)} volte tanto,`);
  console.log('  e non lo segnala nessuno.');
  console.log('');
}

// ─────────────────────────────────────────────────────────────────────────────
// 11 · AVVIO
// ─────────────────────────────────────────────────────────────────────────────

function leggiArgomenti(argv) {
  const o = { out: USCITA, mipmap: true, colore: 'etc1s', dato: 'uastc', qlevel: 200 };
  const liberi = [];
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--out') o.out = path.resolve(argv[++i]);
    else if (v === '--no-mipmap') o.mipmap = false;
    else if (v === '--colore') o.colore = argv[++i];
    else if (v === '--dato') o.dato = argv[++i];
    else if (v === '--qlevel') o.qlevel = Number(argv[++i]);
    else if (v.startsWith('--')) {
      console.error(`  opzione sconosciuta: ${v}`);
      process.exit(4);
    } else liberi.push(v);
  }
  for (const k of ['colore', 'dato'])
    if (!['etc1s', 'uastc'].includes(o[k])) {
      console.error(`  --${k}: valori ammessi etc1s | uastc`);
      process.exit(4);
    }
  return { opz: o, liberi };
}

function main() {
  const { opz, liberi } = leggiArgomenti(process.argv.slice(2));
  const NOTI = ['attrezzo', 'provino', 'comprimi', 'verifica', 'confronto', 'danno'];
  const comando = NOTI.includes(liberi[0]) ? liberi.shift() : liberi.length ? 'verifica' : 'tutto';
  fs.mkdirSync(TEMP, { recursive: true });

  try {
    if (comando === 'attrezzo') { comandoAttrezzo(); return 0; }
    if (comando === 'provino') { comandoProvino(); return 0; }

    const a = comandoAttrezzo();
    const dir = liberi[0] ? path.resolve(liberi[0]) : PROVINO;

    if (comando === 'comprimi') { comandoComprimi(a, dir, opz); return 0; }
    if (comando === 'confronto') { comandoConfronto(a, opz); return 0; }
    if (comando === 'danno') { comandoDanno(a); return 0; }
    if (comando === 'verifica' || comando === 'tutto') {
      if (dir === PROVINO && !fs.existsSync(path.join(PROVINO, 'normale.png'))) comandoProvino();
      const esiti = comandoComprimi(a, dir, opz);
      return comandoVerifica(a, esiti);
    }
    console.error(`  comando sconosciuto: ${comando}`);
    console.error('  usa: attrezzo | provino | comprimi <dir> | verifica <dir> | confronto | danno');
    return 4;
  } catch (err) {
    console.error('');
    console.error('  ERRORE: ' + err.message);
    console.error('');
    return 1;
  }
}

process.exit(main());
