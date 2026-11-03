// Notizie in primo piano da Quotidiano Sanità (feed RSS pubblico del sito).
// Il Worker legge il feed lato server (niente problemi di CORS nel browser),
// tiene il risultato in cache per 30 minuti e restituisce solo titolo, data e link:
// gli articoli si leggono sul sito della fonte.
const FONTI = [
  "https://www.quotidianosanita.it/feed/",
  "https://www.quotidianosanita.it/?feed=rss2",
];
const TTL = 1800; // secondi
const MAX = 6;

const decode = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;|&#039;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]) : "";
};

export function parseRss(xml) {
  const out = [];
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const it = m[0];
    const titolo = tag(it, "title");
    const link = tag(it, "link");
    if (!titolo || !/^https:\/\/(www\.)?quotidianosanita\.it\//.test(link)) continue;
    const d = Date.parse(tag(it, "pubDate"));
    out.push({ titolo, link, data: isNaN(d) ? null : new Date(d).toISOString(), categoria: tag(it, "category") || null });
    if (out.length >= MAX) break;
  }
  return out;
}

export async function onRequest({ request, ctx }) {
  const cache = caches.default;
  const key = new Request(new URL("/api/notizie?v=1", request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;

  let notizie = [];
  for (const url of FONTI) {
    try {
      const r = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0 (compatible; SitoFarmaciaTortorici/1.0)", accept: "application/rss+xml, application/xml, text/xml" },
        cf: { cacheTtl: TTL, cacheEverything: true },
      });
      if (!r.ok) continue;
      notizie = parseRss(await r.text());
      if (notizie.length) break;
    } catch (e) { /* prova la fonte successiva */ }
  }

  const res = new Response(JSON.stringify({ fonte: "Quotidiano Sanità", aggiornato: new Date().toISOString(), notizie }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${notizie.length ? TTL : 300}`,
    },
  });
  if (notizie.length) ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}
