// Farmacie di turno OGGI a Trabia e nei paesi vicini (entro ~30 km), lette dal sito
// dell'Ordine dei Farmacisti di Palermo come fa già turni.js per Trabia.
// La posizione del visitatore NON arriva qui: la distanza la calcola il suo telefono.
import { leggiSettimana, settimanaIso, lunediDi } from "./turni.js";
import { CALENDARIO } from "./turni-trabia.js";

const BASE = "https://www.ordinefarmacistipalermo.it/";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const VALIDO_MS = 3 * 3600 * 1000;

// Centro approssimativo dei paesi della zona (per calcolare la distanza in linea d'aria)
export const PAESI = {
  "trabia": [38.0040, 13.6500], "san nicola l'arena": [38.0165, 13.6215], "termini imerese": [37.9858, 13.6963],
  "altavilla milicia": [38.0422, 13.5486], "casteldaccia": [38.0550, 13.5300], "bagheria": [38.0800, 13.5100],
  "santa flavia": [38.1050, 13.5340], "ficarazzi": [38.0900, 13.4650], "villabate": [38.0790, 13.4430],
  "caccamo": [37.9330, 13.6680], "ventimiglia di sicilia": [37.9990, 13.5690], "baucina": [37.9260, 13.5370],
  "ciminna": [37.8990, 13.5600], "cerda": [37.9050, 13.8150], "sciara": [37.9150, 13.7630],
  "aliminusa": [37.8650, 13.7810], "montemaggiore belsito": [37.8480, 13.7640], "campofelice di roccella": [38.0290, 13.8770],
  "collesano": [37.9180, 13.9380], "lascari": [38.0000, 13.9420], "misilmeri": [38.0330, 13.4500],
  "bolognetta": [37.9640, 13.4570], "marineo": [37.9510, 13.4170], "villafrati": [37.9100, 13.4860],
  "mezzojuso": [37.8640, 13.4660], "vicari": [37.8240, 13.5670], "roccapalumba": [37.8050, 13.6370],
  "lercara friddi": [37.7470, 13.6040], "castronovo di sicilia": [37.6790, 13.6040], "gratteri": [37.9650, 13.9730],
  "isnello": [37.9430, 14.0060], "porticello": [38.0880, 13.5420], "san giovanni li greci": [37.9070, 13.6650],
  "campofelice di fitalia": [37.8270, 13.4850], "cefala diana": [37.9160, 13.4630], "godrano": [37.9030, 13.4290],
};
const TRABIA = [38.0040, 13.6500];
const distanza = (a, b) => { const r = Math.PI / 180, x = Math.sin((b[0] - a[0]) * r / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin((b[1] - a[1]) * r / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
const NOMI = Object.keys(PAESI).sort((a, b) => b.length - a.length); // prima i nomi più lunghi
const norm = (s) => String(s || "").toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, " ");
const paeseIn = (testo) => { const t = norm(testo); return NOMI.find((n) => t.includes(n)) || null; };
const iso = (d) => d.toISOString().slice(0, 10);
const oggiRoma = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());

// Zone dei turni dal file dati.js dell'Ordine: { zona: "TRABIA", codice: "48", ... }
async function zoneVicine() {
  const r = await fetch(BASE + "dati.js", { headers: { "user-agent": UA } });
  const dj = await r.text();
  const zone = [];
  for (const m of dj.matchAll(/\{[^{}]*\}/g)) {
    const z = m[0].match(/zona\s*:\s*["']([^"']+)["']/i), c = m[0].match(/codice\s*:\s*["']([^"']+)["']/i);
    if (!z || !c) continue;
    const paese = paeseIn(z[1]);
    if (paese) zone.push({ zona: z[1], codice: c[1], paese });
  }
  if (!zone.some((z) => z.paese === "trabia")) zone.push({ zona: "TRABIA", codice: "48", paese: "trabia" });
  return { http: r.status, zone: zone.slice(0, 20) };
}

async function turniZona(z, oggi) {
  const lun = lunediDi(new Date(oggi + "T12:00:00Z"));
  const { anno, w } = settimanaIso(lun);
  const url = `${BASE}newturni/html_pubblico/${z.codice}_${anno}_${String(w).padStart(2, "0")}.html`;
  const r = await fetch(url, { headers: { "user-agent": UA, referer: BASE + "turno.asp?c=" + z.codice } });
  if (!r.ok) { await r.arrayBuffer(); return { http: r.status, turni: [] }; }
  const buf = await r.arrayBuffer();
  let h = new TextDecoder("utf-8").decode(buf);
  if (h.includes("�")) h = new TextDecoder("windows-1252").decode(buf);
  const fine = iso(new Date(lun.getTime() + 6 * 864e5));
  const [aa, mm, gg] = oggi.split("-");
  const turni = leggiSettimana(h).map((t) => ({ ...t, dal: t.dal || iso(lun), al: t.al || fine }))
    .filter((t) => t.dal <= oggi && oggi <= t.al)
    // alcuni turni valgono per un solo giorno, scritto nel titolo ("sabato 14/11/2026 - apertura diurna")
    .filter((t) => { const d = String(t.tipo).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); return !d || (+d[1] === +gg && +d[2] === +mm && d[3] === aa); });
  return { http: r.status, turni };
}

export async function aggiornaVicine(env) {
  const oggi = oggiRoma();
  const out = { v: 2, aggiornato: new Date().toISOString(), oggi, farmacie: [], zone: [], stato: "ok" };
  try {
    const { http, zone } = await zoneVicine();
    out.datiJs = http;
    const ris = await Promise.all(zone.map((z) => turniZona(z, oggi).catch((e) => ({ http: "errore", turni: [] }))));
    const visti = new Set();
    zone.forEach((z, i) => {
      out.zone.push({ zona: z.zona, codice: z.codice, http: ris[i].http, n: ris[i].turni.length });
      for (const t of ris[i].turni) {
        const k = norm(t.farmacia + t.indirizzo);
        if (visti.has(k)) continue;
        visti.add(k);
        const paese = paeseIn(t.indirizzo) || z.paese;
        out.farmacie.push({ ...t, paese, lat: PAESI[paese][0], lon: PAESI[paese][1] });
      }
    });
  } catch (e) { out.stato = "errore: " + (e && e.message); }
  // il calendario scritto a mano ha la precedenza per Trabia
  for (const c of CALENDARIO) if (c.dal <= oggi && oggi <= c.al) {
    const paese = paeseIn(c.indirizzo) || "trabia";
    out.farmacie = out.farmacie.filter((f) => f.paese !== "trabia" && f.paese !== "san nicola l'arena");
    out.farmacie.unshift({ ...c, paese, lat: PAESI[paese][0], lon: PAESI[paese][1] });
  }
  // senza la posizione del visitatore l'elenco parte da Trabia
  out.farmacie.sort((a, b) => distanza(TRABIA, [a.lat, a.lon]) - distanza(TRABIA, [b.lat, b.lon]));
  if (!out.farmacie.length && out.stato === "ok") out.stato = "nessun turno letto";
  try {
    await env.DB.prepare("INSERT INTO turni_cache (id, dati, quando) VALUES (2, ?, ?) ON CONFLICT(id) DO UPDATE SET dati = excluded.dati, quando = excluded.quando")
      .bind(JSON.stringify(out), out.aggiornato).run();
  } catch (e) {}
  return out;
}

export async function onRequestGet({ env }) {
  let d = null;
  try {
    const r = await env.DB.prepare("SELECT dati, quando FROM turni_cache WHERE id = 2").first();
    if (r) { const x = JSON.parse(r.dati); if (x.v === 2 && x.oggi === oggiRoma() && Date.now() - Date.parse(r.quando) < VALIDO_MS && x.farmacie.length) d = x; }
  } catch (e) {}
  if (!d) d = await aggiornaVicine(env);
  return new Response(JSON.stringify(d), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
