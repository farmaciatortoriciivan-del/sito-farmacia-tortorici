// Diagnostica temporanea: controlla quali indirizzi di Kodami rispondono e con che formato.
export async function sonda(env) {
  const urls = ["https://news.google.com/rss/search?q=site:fanpage.it/kodami&hl=it&gl=IT&ceid=IT:it", "https://www.bing.com/news/search?q=site%3Afanpage.it%2Fkodami&format=rss", "https://www.lastampa.it/rss/la-zampa.xml", "https://www.lastampa.it/la-zampa/rss.xml", "https://www.lazampa.it/rss", "https://www.lastampa.it/la-zampa/"];
  const q = "INSERT INTO sonda (id, dati, quando) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET dati = excluded.dati, quando = excluded.quando";
  const t = new Date().toISOString();
  for (let i = 0; i < urls.length; i++) {
    let d;
    try {
      const r = await fetch(urls[i], { headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36", accept: "application/rss+xml, application/xml, text/xml, text/html" }, redirect: "follow" });
      const txt = await r.text();
      const feeds = [...txt.matchAll(/<link[^>]+type="application\/(rss|atom)\+xml"[^>]*>/gi)].map((m) => m[0]).slice(0, 5);
      const items = (txt.match(/<item[\s>]/gi) || []).length;
      d = { u: urls[i], http: r.status, finale: r.url, tipo: r.headers.get("content-type"), items, feeds, inizio: txt.slice(0, 1500), links: [...txt.matchAll(/href="([^"]*(feed|rss)[^"]*)"/gi)].map((m) => m[1]).slice(0, 10) };
    } catch (e) { d = { u: urls[i], errore: String(e && e.message) }; }
    try { await env.DB.prepare(q).bind(100 + i, JSON.stringify(d), t).run(); } catch (e) {}
  }
}
