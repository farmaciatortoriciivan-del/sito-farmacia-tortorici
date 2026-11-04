// Diagnostica temporanea: controlla quali indirizzi di Kodami rispondono e con che formato.
export async function sonda(env) {
  const urls = ["https://www.kodami.it/feed/", "https://www.kodami.it/rss", "https://www.kodami.it/feed", "https://www.kodami.it/rss.xml", "https://www.kodami.it/feed.xml", "https://www.kodami.it/"];
  const q = "INSERT INTO sonda (id, dati, quando) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET dati = excluded.dati, quando = excluded.quando";
  const t = new Date().toISOString();
  for (let i = 0; i < urls.length; i++) {
    let d;
    try {
      const r = await fetch(urls[i], { headers: { "user-agent": "Mozilla/5.0 (compatible; SitoFarmaciaTortorici/1.0)", accept: "application/rss+xml, application/xml, text/xml, text/html" }, redirect: "follow" });
      const txt = await r.text();
      const feeds = [...txt.matchAll(/<link[^>]+type="application\/(rss|atom)\+xml"[^>]*>/gi)].map((m) => m[0]).slice(0, 5);
      const items = (txt.match(/<item[\s>]/gi) || []).length;
      d = { u: urls[i], http: r.status, finale: r.url, tipo: r.headers.get("content-type"), items, feeds, inizio: txt.slice(0, i === urls.length - 1 ? 200 : 1500) };
    } catch (e) { d = { u: urls[i], errore: String(e && e.message) }; }
    try { await env.DB.prepare(q).bind(100 + i, JSON.stringify(d), t).run(); } catch (e) {}
  }
}
