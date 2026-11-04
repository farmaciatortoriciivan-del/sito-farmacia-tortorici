// Diagnostica temporanea: immagini degli articoli di Alzheimer Italia.
export async function sonda(env) {
  const q = "INSERT INTO sonda (id, dati, quando) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET dati = excluded.dati, quando = excluded.quando";
  const t = new Date().toISOString();
  const UA = { "user-agent": "Mozilla/5.0 (compatible; SitoFarmaciaTortorici/1.0)" };
  const out = {};
  try {
    const x = await (await fetch("https://www.alzheimer.it/feed/", { headers: UA })).text();
    const it = x.match(/<item[\s>][\s\S]*?<\/item>/i)[0];
    out.item = it.slice(0, 3000);
    const link = (it.match(/<link>([^<]+)<\/link>/) || [])[1];
    out.link = link;
    const r = await fetch(link, { headers: { ...UA, accept: "text/html" } });
    const h = await r.text();
    out.pagina = r.status;
    out.meta = [...h.matchAll(/<meta[^>]+(og:image|twitter:image)[^>]*>/gi)].map((m) => m[0]).slice(0, 5);
    out.img = [...h.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]).slice(0, 8);
    const og = (out.meta[0] || "").match(/content=["']([^"']+)["']/);
    if (og) { const ri = await fetch(og[1].replace(/&amp;/g, "&"), { headers: UA }); out.ogStatus = ri.status; out.ogTipo = ri.headers.get("content-type"); }
  } catch (e) { out.errore = String(e && e.message); }
  try { await env.DB.prepare(q).bind(200, JSON.stringify(out), t).run(); } catch (e) {}
}
