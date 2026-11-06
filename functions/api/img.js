// /api/img?u=<indirizzo immagine>: mostra le immagini di anteprima degli articoli passando dal nostro server.
// Alcuni siti (per esempio Alzheimer Italia) non lasciano mostrare le loro immagini dentro altri siti.
// Solo immagini dei siti delle rubriche, tenute in cache per 1 giorno.
const AMMESSI = /^https:\/\/([a-z0-9-]+\.)*(alzheimer\.it|auser\.it|senioritalia\.it|lazampa\.it|lastampa\.it|lastampastatic\.it|gedidigital\.it|gedistatic\.it|repstatic\.it|kataweb\.it|gedi\.it|arcpublishing\.com|wp\.com|runnersworld\.com|menshealth\.com|hearstapps\.com|runlovers\.it|correre\.it|therunningclub\.it|nonsolofitness\.it)\//i;
const TTL = 86400;

export async function onRequest({ request, env, ctx }) {
  const u = new URL(request.url).searchParams.get("u") || "";
  if (!AMMESSI.test(u)) return new Response("Non consentito", { status: 400 });
  const cache = caches.default;
  const key = new Request(new URL("/api/img?u=" + encodeURIComponent(u), request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;
  try {
    const r = await fetch(u, { headers: { "user-agent": "Mozilla/5.0 (compatible; SitoFarmaciaTortorici/1.0)", accept: "image/*" }, cf: { cacheTtl: TTL } });
    const tipo = r.headers.get("content-type") || "";
    if (!r.ok || !/^image\//.test(tipo)) {
      try { await env.DB.prepare("INSERT INTO sonda (id, dati, quando) VALUES (301, ?, ?) ON CONFLICT(id) DO UPDATE SET dati = excluded.dati, quando = excluded.quando").bind(JSON.stringify([u, r.status, tipo]), new Date().toISOString()).run(); } catch (e) {}
      return new Response("Immagine non disponibile", { status: 404 });
    }
    const res = new Response(r.body, { headers: { "content-type": tipo, "cache-control": `public, max-age=${TTL}` } });
    ctx.waitUntil(cache.put(key, res.clone()));
    return res;
  } catch (e) { return new Response("Errore", { status: 502 }); }
}
