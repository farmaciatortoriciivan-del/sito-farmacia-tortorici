// Farmacie di turno a Trabia, lette dal sito ufficiale dell'Ordine dei Farmacisti di Palermo.
// Il Worker scarica la pagina, ne estrae le righe che riguardano Trabia e le tiene in cache per 3 ore.
// Le usa l'assistente; /api/turni mostra cosa è stato letto (utile per i controlli).
import { CALENDARIO } from "./turni-trabia.js";
const URL_TURNI = "https://www.ordinefarmacistipalermo.it/turno.asp?c=48";
const BASE = "https://www.ordinefarmacistipalermo.it/";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const TTL = 3 * 3600;

const decode = (s) => s
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&([aeiou])grave;/gi, (_, v) => ({ a: "à", e: "è", i: "ì", o: "ò", u: "ù", A: "À", E: "È", I: "Ì", O: "Ò", U: "Ù" }[v]))
  .replace(/&([aeiou])acute;/gi, (_, v) => ({ a: "á", e: "é", i: "í", o: "ó", u: "ú", E: "É" }[v] || v));

export function testoDaHtml(html) {
  return decode(html
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(tr|p|li|div|h\d|table|ul|ol)>/gi, "\n")
    .replace(/<\/t[dh]>/gi, " | ")
    .replace(/<[^>]+>/g, " "))
    .split("\n").map((r) => r.replace(/[ \t]+/g, " ").replace(/(\s*\|\s*)+$/, "").trim()).filter(Boolean);
}

export function estraiTrabia(righe) {
  const tieni = new Set();
  righe.forEach((r, i) => {
    if (/trabia|san nicola l.?arena/i.test(r)) for (let k = Math.max(0, i - 3); k <= Math.min(righe.length - 1, i + 6); k++) tieni.add(k);
  });
  return [...tieni].sort((a, b) => a - b).map((i) => righe[i]).join("\n").slice(0, 3000);
}

function infoModulo(html) {
  const f = html.match(/<form[^>]*>/i);
  const sel = [...html.matchAll(/<select[^>]*name="([^"]+)"/gi)].map((m) => m[1]);
  const opz = [...html.matchAll(/<option[^>]*value="([^"]*)"[^>]*>\s*([^<]*trabia[^<]*)</gi)].map((m) => ({ valore: m[1], testo: m[2].trim() }));
  return { form: f ? f[0].slice(0, 200) : null, select: sel, opzioniTrabia: opz };
}

// Settimana ISO (i cartelli ufficiali sono settimanali: 90019_ANNO_SETTIMANA.html)
export function settimanaIso(d) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const g = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - g);
  const anno = t.getUTCFullYear();
  const w = Math.ceil(((t - Date.UTC(anno, 0, 1)) / 864e5 + 1) / 7);
  return { anno, w };
}
export function lunediDi(d) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() || 7) - 1));
  return t;
}
const iso = (d) => d.toISOString().slice(0, 10);

// Legge un cartello: "TURNO DIURNO E NOTTURNO / FARMACIA ... / VIA ... - TRABIA / 091 ..."
export function leggiCartello(righe) {
  const tipo = righe.find((r) => /turno/i.test(r)) || "";
  const iF = righe.findIndex((r) => /^farmacia\b/i.test(r));
  if (iF < 0) return null;
  const tel = righe.slice(iF + 1).find((r) => /^\+?[\d\s./-]{6,}$/.test(r)) || "";
  const ind = righe.slice(iF + 1).find((r) => r !== tel && /[a-z]/i.test(r)) || "";
  return { tipo: tipo.toLowerCase(), farmacia: righe[iF], indirizzo: ind, telefono: tel };
}

// Nuovo sistema dell'Ordine (turno.asp): un file per settimana in /newturni/html_pubblico/{codice}_{anno}_{settimana}.html
const titolo = (t) => t.toLowerCase().replace(/(^|[\s'(-])([a-zà-ù])/g, (m, a, b) => a + b.toUpperCase()).replace(/\bSrl\b/g, "srl").replace(/\bSnc\b/g, "snc").replace(/\bSas\b/g, "sas");
const pulisci = (h) => decode(h.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

export function leggiSettimana(html) {
  const blocchi = html.split(/<h4[^>]*class=['"]tipoturno['"][^>]*>/i).slice(1);
  return blocchi.map((b) => {
    const tipo = pulisci(b.split(/<\/h4>/i)[0]);
    const prendi = (cl) => { const m = b.match(new RegExp("<div[^>]*class=['\"]" + cl + "['\"][^>]*>([\\s\\S]*?)</div>", "i")); return m ? pulisci(m[1]) : ""; };
    const sett = prendi("settimana").match(/(\d{2})\/(\d{2})\/(\d{4}).*?(\d{2})\/(\d{2})\/(\d{4})/);
    const nome = prendi("ragsoc");
    if (!nome) return null;
    return {
      tipo: tipo.toLowerCase(),
      farmacia: "Farmacia " + titolo(nome),
      indirizzo: titolo(prendi("Indirizzo")).replace(/ - /, ", ").replace(/' /g, "'"),
      telefono: prendi("tel"),
      dal: sett ? `${sett[3]}-${sett[2]}-${sett[1]}` : null,
      al: sett ? `${sett[6]}-${sett[5]}-${sett[4]}` : null,
    };
  }).filter(Boolean);
}

async function codiceTrabia() {
  try {
    const dj = await (await fetch(BASE + "dati.js", { headers: { "user-agent": UA } })).text();
    const m = dj.match(/zona\s*:\s*["']TRABIA["'][^}]*codice\s*:\s*["']([^"']+)["']|codice\s*:\s*["']([^"']+)["'][^}]*zona\s*:\s*["']TRABIA["']/i);
    if (m) return m[1] || m[2];
  } catch (e) {}
  return "48";
}

// Legge i turni di Trabia per questa settimana e le 3 successive e li salva nel database.
export async function aggiornaTurni(env) {
  const out = { fonte: URL_TURNI, letto: new Date().toISOString(), stato: "non letto", settimane: [] };
  try {
    const cod = await codiceTrabia();
    out.codice = cod;
    const lun = lunediDi(new Date(Date.now() + 2 * 3600e3));
    for (let k = 0; k < 4; k++) {
      const inizio = new Date(lun.getTime() + k * 7 * 864e5), fine = new Date(inizio.getTime() + 6 * 864e5);
      const { anno, w } = settimanaIso(inizio);
      const ww = String(w).padStart(2, "0");
      const sett = { dal: iso(inizio), al: iso(fine), url: null, http: null, turni: [] };
      for (const a of [...new Set([anno, inizio.getUTCFullYear(), fine.getUTCFullYear()])]) {
        const url = `${BASE}newturni/html_pubblico/${cod}_${a}_${ww}.html`;
        const r = await fetch(url, { headers: { "user-agent": UA, referer: URL_TURNI } });
        sett.url = url; sett.http = r.status;
        if (!r.ok) { await r.arrayBuffer(); continue; }
        const buf = await r.arrayBuffer();
        let h = new TextDecoder("utf-8").decode(buf);
        if (h.includes("\uFFFD")) h = new TextDecoder("windows-1252").decode(buf);
        sett.turni = leggiSettimana(h).map((t) => ({ ...t, dal: t.dal || sett.dal, al: t.al || sett.al }));
        if (sett.turni.length) break;
      }
      sett.turno = sett.turni[0] || null;
      out.settimane.push(sett);
    }
    out.stato = out.settimane.some((s) => s.turni.length) ? "ok" : "turni non pubblicati sul sito ufficiale";
  } catch (e) { out.stato = "errore: " + (e && e.message); }
  try {
    await env.DB.prepare("INSERT INTO turni_cache (id, dati, quando) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET dati = excluded.dati, quando = excluded.quando")
      .bind(JSON.stringify(out), out.letto).run();
  } catch (e) {}
  return out;
}

// Tabella dei turni da mostrare: prima il calendario inserito a mano, poi i cartelli ufficiali.
export async function tabellaTurni(env, ctx) {
  const oggi = iso(new Date());
  const righe = [];
  for (const c of CALENDARIO) if (c.al >= oggi) righe.push({ ...c, fonte: "calendario" });
  if (!righe.length) {
    const d = await turniTrabia(env, ctx);
    for (const s of d.settimane || []) for (const t of s.turni || (s.turno ? [s.turno] : [])) if ((t.al || s.al) >= oggi) righe.push({ dal: s.dal, al: s.al, ...t, fonte: "ordine" });
  }
  return righe.sort((a, b) => a.dal.localeCompare(b.dal)).slice(0, 4);
}

// Per l'assistente: usa i dati salvati (aggiornati ogni 30 minuti); se mancano o sono vecchi, li rilegge.
export async function turniTrabia(env, ctx) {
  try {
    const r = await env.DB.prepare("SELECT dati, quando FROM turni_cache WHERE id = 1").first();
    if (r && Date.now() - Date.parse(r.quando) < 6 * 3600 * 1000) { const d = JSON.parse(r.dati); if (d.settimane) return d; }
  } catch (e) {}
  return aggiornaTurni(env);
}

export async function onRequestGet({ env, ctx }) {
  const d = await turniTrabia(env, ctx);
  d.tabella = await tabellaTurni(env, ctx);
  return new Response(JSON.stringify(d, null, 1), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

