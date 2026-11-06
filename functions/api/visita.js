// Statistiche di visita anonime: nessun cookie, l'indirizzo IP non viene salvato.
// Il visitatore è un'impronta che cambia ogni giorno (il "sale" del giorno viene
// cancellato il giorno dopo), quindi non è possibile riconoscere le persone.
import { sha256 } from "./_util.js";

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp\/|telegram|preview|monitor|curl|wget|python|headless|lighthouse|pingdom|uptime|scan/i;
const PAGINE = new Set(["/", "/index.html", "/recensioni.html", "/privacy.html", "/cookie.html"]);
const AZIONI = new Set(["telefono", "whatsapp", "indicazioni", "email", "facebook", "vicina"]);
// risposte possibili alla domanda facoltativa "Da quale paese ci visiti?"
export const RISPOSTE = ["trabia", "san-nicola", "termini", "altavilla", "casteldaccia", "bagheria", "caccamo", "palermo", "sicilia", "italia", "estero"];
const vuota = () => new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
const corto = (s, n) => String(s || "").slice(0, n);

function oraRoma(d = new Date()) {
  const p = {};
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" })
    .formatToParts(d).forEach((x) => (p[x.type] = x.value));
  return { giorno: `${p.year}-${p.month}-${p.day}`, ora: +p.hour };
}

function provenienza(ref, da, host) {
  if (da) return "Link: " + corto(da, 30).toLowerCase();
  if (!ref) return "Diretto";
  ref = ref.toLowerCase().replace(/^www\./, "");
  if (ref === host.replace(/^www\./, "")) return null; // da un'altra pagina del sito
  if (/google\./.test(ref)) return "Google";
  if (/facebook\.|fb\.|instagram\./.test(ref)) return "Facebook / Instagram";
  if (/bing\.|yahoo\.|duckduckgo\.|ecosia\./.test(ref)) return "Altri motori di ricerca";
  if (/whatsapp|wa\.me/.test(ref)) return "WhatsApp";
  return corto(ref, 60);
}

function dispositivo(ua) {
  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "Telefono";
  return "Computer";
}

// crea le tabelle delle statistiche la prima volta (una volta per avvio del Worker)
let pronte = false;
export async function assicuraTabelle(env) {
  if (pronte) return;
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS visite (id INTEGER PRIMARY KEY AUTOINCREMENT, giorno TEXT NOT NULL, ora INTEGER NOT NULL, tipo TEXT NOT NULL, pagina TEXT, voce TEXT, visitatore TEXT NOT NULL, provenienza TEXT, dispositivo TEXT, citta TEXT, regione TEXT, paese TEXT, lat REAL, lon REAL, lingua TEXT)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_visite_giorno ON visite(giorno, tipo)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS stat_sale (giorno TEXT PRIMARY KEY, sale TEXT NOT NULL)"),
  ]);
  pronte = true;
}

async function saleDelGiorno(env, giorno) {
  await env.DB.prepare("INSERT OR IGNORE INTO stat_sale (giorno, sale) VALUES (?, ?)").bind(giorno, crypto.randomUUID()).run();
  const r = await env.DB.prepare("SELECT sale FROM stat_sale WHERE giorno = ?").bind(giorno).first();
  return r.sale;
}

export async function onRequestPost({ request, env }) {
  const ua = request.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua) || !env.DB) return vuota();
  let b;
  try { b = await request.json(); } catch { return vuota(); }
  if (!b || typeof b !== "object") return vuota();

  const tipo = b.tipo;
  const pagina = PAGINE.has(b.pagina) ? (b.pagina === "/index.html" ? "/" : b.pagina) : null;
  if (!pagina) return vuota();
  let voce = null, prov = null;
  if (tipo === "sezione") { voce = corto(b.voce, 30).replace(/[^a-z0-9-]/gi, ""); if (!voce) return vuota(); }
  else if (tipo === "azione") { if (!AZIONI.has(b.voce)) return vuota(); voce = b.voce; }
  else if (tipo === "paese") { if (!RISPOSTE.includes(b.voce)) return vuota(); voce = b.voce; }
  else if (tipo === "pagina") prov = provenienza(corto(b.ref, 100), b.da, new URL(request.url).hostname);
  else return vuota();

  const cf = request.cf || {};
  const { giorno, ora } = oraRoma();
  try {
    await assicuraTabelle(env);
    const sale = await saleDelGiorno(env, giorno);
    const ip = request.headers.get("cf-connecting-ip") || "";
    const visitatore = (await sha256(sale + "|" + ip + "|" + ua)).slice(0, 16);
    const num = (x) => (x == null || x === "" || isNaN(+x) ? null : Math.round(+x * 100) / 100);
    await env.DB.prepare(
      "INSERT INTO visite (giorno, ora, tipo, pagina, voce, visitatore, provenienza, dispositivo, citta, regione, paese, lat, lon, lingua) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(giorno, ora, tipo, pagina, voce, visitatore, prov, dispositivo(ua),
      corto(cf.city, 60) || null, corto(cf.region, 60) || null, corto(cf.country, 2) || null,
      num(cf.latitude), num(cf.longitude), corto(b.lingua, 5) || null).run();
  } catch (e) {
    console.log("visita: errore", e && e.message);
  }
  return vuota();
}

// pulizia, chiamata dal cron: via i "sali" dei giorni passati e le visite più vecchie di 13 mesi
export async function pulisci(env) {
  if (!env.DB) return;
  const { giorno } = oraRoma();
  const limite = oraRoma(new Date(Date.now() - 396 * 86400000)).giorno;
  await assicuraTabelle(env);
  await env.DB.batch([
    env.DB.prepare("DELETE FROM stat_sale WHERE giorno < ?").bind(giorno),
    env.DB.prepare("DELETE FROM visite WHERE giorno < ?").bind(limite),
  ]);
}
