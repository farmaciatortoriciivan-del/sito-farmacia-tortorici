// Farmacie di turno a Trabia, lette dal sito ufficiale dell'Ordine dei Farmacisti di Palermo.
// Il Worker scarica la pagina, ne estrae le righe che riguardano Trabia e le tiene in cache per 3 ore.
// Le usa l'assistente; /api/turni mostra cosa è stato letto (utile per i controlli).
const URL_TURNI = "https://www.ordinefarmacistipalermo.it/turni.provincia.asp";
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

// Chiede alla pagina ufficiale i turni di un comune (come fa il menu "Seleziona Comune"):
// la risposta contiene l'indirizzo del "cartello" settimanale con i turni, che poi leggiamo.
async function cartelloComune(codice, data, cookie) {
  const r = await fetch(URL_TURNI, {
    method: "POST",
    headers: { "user-agent": UA, "content-type": "application/x-www-form-urlencoded", referer: URL_TURNI, origin: BASE.slice(0, -1), cookie: cookie || "" },
    body: "redirect-from=&comuni-list=" + codice + (data ? "&simula-data=" + encodeURIComponent(data) : ""),
  });
  const html = await r.text();
  const m = html.match(/linknew\s*=\s*"([^"]+)"/);
  if (!m) return { http: r.status, link: null, righe: [], html: "" };
  const c = await fetch(m[1], { headers: { "user-agent": UA, referer: URL_TURNI } });
  const buf = await c.arrayBuffer();
  let h = new TextDecoder("utf-8").decode(buf);
  if (h.includes("�") || /charset=(iso-8859-1|windows-1252)/i.test(h)) h = new TextDecoder("windows-1252").decode(buf);
  return { http: c.status, link: m[1], righe: testoDaHtml(h), html: h };
}

const ddmmyyyy = (d) => [d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCFullYear()].map((n, i) => String(n).padStart(i < 2 ? 2 : 4, "0")).join("/");

// Legge i turni di Trabia e San Nicola L'Arena (settimana corrente e successiva) e li salva nel database.
export async function aggiornaTurni(env) {
  const out = { fonte: URL_TURNI, letto: new Date().toISOString(), estratto: "", stato: "non letto", cartelli: [] };
  try {
    const g = await fetch(URL_TURNI, { headers: { "user-agent": UA, accept: "text/html" } });
    const cookie = (g.headers.get("set-cookie") || "").split(/,(?=\s*[A-Za-z0-9_]+=)/).map((c) => c.split(";")[0].trim()).filter(Boolean).join("; ");
    await g.arrayBuffer();
    const fra7 = ddmmyyyy(new Date(Date.now() + 7 * 864e5));
    const visti = new Set();
    for (const [nome, codice] of [["Trabia", 87], ["San Nicola L'Arena (Trabia)", 88]]) {
      for (const data of [null, fra7]) {
        const t = await cartelloComune(codice, data, cookie);
        if (!t.link || visti.has(t.link)) continue;
        visti.add(t.link);
        out.cartelli.push({ comune: nome, link: t.link, http: t.http, righe: t.righe.slice(0, 120), html: t.html.slice(0, 9000) });
      }
    }
    // diagnostica: altre pubblicazioni dei turni (calendari annuali, PDF)
    out.altro = [];
    try {
      const p43 = await (await fetch(BASE + "default.asp?pageid=43", { headers: { "user-agent": UA } })).text();
      out.altro.push(...[...p43.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]{0,120}?)<\/a>/gi)].map((m) => m[1] + " | " + m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).filter((x) => /trabia|2026|2025|pdf|cartell|turn/i.test(x)).slice(0, 60));
    } catch (e) { out.altro.push("p43 errore " + e.message); }
    for (const u of ["public/cartelli-provincia/trabia/", "public/cartelli-provincia/trabia/html/", "public/cartelli-provincia/trabia/pdf/90019_2026_45.pdf", "public/cartelli-provincia/trabia/90019_2026_45.pdf", "public/cartelli-provincia/trabia/html/90019_2026_44.html", "public/cartelli-provincia/trabia/html/90019_2025_45.html", "public/cartelli-provincia/trabia/html/90019_2026_1.html", "public/cartelli-provincia/termini-imerese/html/90018_2026_45.html", "public/cartelli-provincia/bagheria/html/90011_2026_45.html"]) {
      try { const r = await fetch(BASE + u, { headers: { "user-agent": UA } }); const t = await r.text(); out.altro.push(u + " -> " + r.status + " " + testoDaHtml(t).slice(0, 6).join(" / ").slice(0, 300)); } catch (e) { out.altro.push(u + " errore"); }
    }
    out.estratto = out.cartelli.map((c) => "== " + c.comune + " (" + c.link.split("/").pop() + ") ==\n" + c.righe.join("\n")).join("\n\n").slice(0, 6000);
    out.stato = out.cartelli.some((c) => c.righe.length) ? "ok" : "nessun turno trovato";
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
  (d.cartelli || []).forEach((c) => delete c.html);
  return new Response(JSON.stringify(d, null, 1), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
