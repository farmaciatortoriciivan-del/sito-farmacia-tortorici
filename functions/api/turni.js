// Farmacie di turno a Trabia, lette dal sito ufficiale dell'Ordine dei Farmacisti di Palermo.
// Il Worker scarica la pagina, ne estrae le righe che riguardano Trabia e le tiene in cache per 3 ore.
// Le usa l'assistente; /api/turni mostra cosa è stato letto (utile per i controlli).
const URL_TURNI = "https://www.ordinefarmacistipalermo.it/turni.provincia.asp";
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

// Scarica e analizza la pagina ufficiale; salva risultato e diagnostica nel database.
export async function aggiornaTurni(env) {
  const out = { fonte: URL_TURNI, letto: new Date().toISOString(), estratto: "", stato: "non letto" };
  try {
    const r = await fetch(URL_TURNI, { headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36", accept: "text/html,application/xhtml+xml", "accept-language": "it-IT,it;q=0.9" }, redirect: "follow" });
    out.http = r.status; out.url = r.url; out.tipo = r.headers.get("content-type");
    const buf = await r.arrayBuffer();
    let html = new TextDecoder("utf-8").decode(buf);
    if (/charset=(iso-8859-1|windows-1252)/i.test(html + (out.tipo || "")) || html.includes("�")) html = new TextDecoder("windows-1252").decode(buf);
    const righe = testoDaHtml(html);
    out.righeTotali = righe.length;
    out.estratto = estraiTrabia(righe);
    out.modulo = infoModulo(html);
    out.link = [...html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([^<]{0,80})</gi)].map((m) => m[1] + " | " + m[2].trim()).filter((x) => /turn|pdf|trabia|calend/i.test(x)).slice(0, 40);
    out.inizio = righe.join("\n").slice(0, 5000);
    out.stato = r.ok ? (out.estratto ? "ok" : "trabia non trovata") : "http " + r.status;
  } catch (e) { out.stato = "errore: " + (e && e.message); }
  try {
    await env.DB.prepare("INSERT INTO turni_cache (id, dati, quando) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET dati = excluded.dati, quando = excluded.quando")
      .bind(JSON.stringify(out), out.letto).run();
  } catch (e) {}
  return out;
}

// Per l'assistente: usa i dati salvati (aggiornati ogni 30 minuti); se mancano o sono vecchi, li rilegge.
export async function turniTrabia(env, ctx) {
  try {
    const r = await env.DB.prepare("SELECT dati, quando FROM turni_cache WHERE id = 1").first();
    if (r && Date.now() - Date.parse(r.quando) < 6 * 3600 * 1000) return JSON.parse(r.dati);
  } catch (e) {}
  return aggiornaTurni(env);
}

export async function onRequestGet({ env, ctx }) {
  const d = await turniTrabia(env, ctx);
  delete d.inizio; delete d.link;
  return new Response(JSON.stringify(d, null, 1), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
