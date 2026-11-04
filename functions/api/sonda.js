// Diagnostica temporanea: controlla i feed di 50&Più e del Ministero della Salute.
export async function sonda(env) {
  const urls = ["https://www.50epiu.it/feed/", "https://www.50epiu.it/", "https://www.salute.gov.it/new/it/rss", "https://www.salute.gov.it/new/it/feed", "https://www.salute.gov.it/portale/rss/rssNotizie.jsp", "https://www.salute.gov.it/new/it/"];
  const q = "INSERT INTO sonda (id, dati, quando) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET dati = excluded.dati, quando = excluded.quando";
  const t = new Date().toISOString();
  for (let i = 0; i < urls.length; i++) {
    let d;
    try {
      const r = await fetch(urls[i], { headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36", accept: "application/rss+xml, application/xml, text/xml, text/html" }, redirect: "follow" });
      const txt = await r.text();
      d = { u: urls[i], http: r.status, finale: r.url, tipo: r.headers.get("content-type"), items: (txt.match(/<item[\s>]/gi) || []).length,
        feeds: [...txt.matchAll(/<link[^>]+type="application\/(rss|atom)\+xml"[^>]*>/gi)].map((m) => m[0]).slice(0, 6),
        rss: [...txt.matchAll(/href="([^"]*(rss|feed)[^"]*)"/gi)].map((m) => m[1]).slice(0, 12), inizio: txt.slice(0, 1200) };
    } catch (e) { d = { u: urls[i], errore: String(e && e.message) }; }
    try { await env.DB.prepare(q).bind(100 + i, JSON.stringify(d), t).run(); } catch (e) {}
  }
}
