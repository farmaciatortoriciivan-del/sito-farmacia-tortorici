// Rubrica "Età d'argento": notizie utili agli anziani e alle loro famiglie,
// dai feed RSS ufficiali di Auser, Federazione Alzheimer Italia e Senior Italia.
// Restituisce titolo, data, immagine, fonte e link: gli articoli si leggono sui siti delle associazioni.
import { CATENE } from "./notizie.js";

const FONTI = [
  { nome: "Auser", feed: "https://www.auser.it/feed/", dominio: /^https:\/\/(www\.)?auser\.it\// },
  { nome: "Alzheimer Italia", feed: "https://www.alzheimer.it/feed/", dominio: /^https:\/\/(www\.)?alzheimer\.it\// },
  { nome: "Senior Italia", feed: "https://www.senioritalia.it/feed/", dominio: /^https:\/\/(www\.)?senioritalia\.it\// },
];
const TTL = 3600;
const MAX = 4;
const MAX_GIORNI = 240; // niente articoli troppo vecchi

const decode = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<[^>]+>/g, " ")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&apos;|&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/\s+/g, " ").trim();
const grezzo = (xml, name) => { const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i")); return m ? m[1] : ""; };

function leggi(xml, fonte) {
  const out = [];
  const limite = Date.now() - MAX_GIORNI * 864e5;
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const it = m[0];
    const titolo = decode(grezzo(it, "title"));
    const link = decode(grezzo(it, "link"));
    if (!titolo || !fonte.dominio.test(link)) continue;
    const d = Date.parse(decode(grezzo(it, "pubDate")));
    if (!isNaN(d) && d < limite) continue;
    const desc = grezzo(it, "description") + grezzo(it, "content:encoded");
    const img = (it.match(/<(?:media:content|media:thumbnail|enclosure)[^>]+url="([^"]+)"/i) || desc.match(/<img[^>]+src="([^"]+)"/i) || [])[1] || null;
    out.push({ titolo, link, fonte: fonte.nome, immagine: img && /^https:\/\//.test(img) ? img.replace(/&amp;/g, "&") : null,
      data: isNaN(d) ? null : new Date(d).toISOString(), sommario: decode(grezzo(it, "description")).slice(0, 220) });
  }
  return out;
}

const ESCLUDI = /bilancio|assemblea|congresso|elezion|nomin|president|tesseramento|5 ?x ?1000|cinque per mille|donazion|raccolta fondi|bando|concorso|lavora con noi|politic|governo|sindacat|ccnl|contratt/i;

async function scegli(env, articoli) {
  articoli = articoli.filter((a) => !CATENE.test(a.titolo + " " + a.sommario));
  if (env && env.AI && articoli.length) {
    try {
      const elenco = articoli.map((a, i) => `${i + 1}. [${a.fonte}] ${a.titolo}${a.sommario ? " — " + a.sommario : ""}`).join("\n");
      const r = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
          { role: "system", content: "Sei il redattore del sito di una farmacia di paese. Scegli SOLO gli articoli utili o interessanti per le persone anziane e per chi se ne prende cura: salute, prevenzione, memoria e demenza, invecchiamento attivo, consigli pratici, servizi e diritti per gli anziani, solitudine e compagnia, sostegno ai familiari. ESCLUDI notizie interne delle associazioni (assemblee, nomine, bilanci, tesseramenti, raccolte fondi, 5x1000), bandi e concorsi, politica, eventi lontani dalla Sicilia senza utilità pratica, pubblicità. Nel dubbio escludi. Rispondi solo con un array JSON dei numeri scelti, per esempio [1,4]. Se nessuno va bene rispondi []." },
          { role: "user", content: elenco },
        ],
        max_tokens: 60, temperature: 0,
      });
      const m = String((r && r.response) || "").match(/\[[\d,\s]*\]/);
      if (m) { const s = new Set(JSON.parse(m[0])); return articoli.filter((_, i) => s.has(i + 1)); }
    } catch (e) { /* regola di riserva */ }
  }
  return articoli.filter((a) => !ESCLUDI.test(a.titolo + " " + a.sommario));
}

async function feed(f) {
  try {
    const r = await fetch(f.feed, { headers: { "user-agent": "Mozilla/5.0 (compatible; SitoFarmaciaTortorici/1.0)", accept: "application/rss+xml, application/xml, text/xml" }, cf: { cacheTtl: TTL } });
    return r.ok ? leggi(await r.text(), f).slice(0, 12) : [];
  } catch (e) { return []; }
}

export async function onRequest({ request, env, ctx }) {
  const cache = caches.default;
  const key = new Request(new URL("/api/anziani?v=1", request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;

  const tutti = (await Promise.all(FONTI.map(feed))).flat();
  let articoli = await scegli(env, tutti);
  articoli = articoli.sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  // al massimo 2 articoli per fonte, così la rubrica resta varia
  const conta = {};
  articoli = articoli.filter((a) => (conta[a.fonte] = (conta[a.fonte] || 0) + 1) <= 2).slice(0, MAX).map(({ sommario, ...a }) => a);

  const res = new Response(JSON.stringify({ fonti: FONTI.map((f) => f.nome), aggiornato: new Date().toISOString(), articoli }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${articoli.length ? TTL : 300}` },
  });
  if (articoli.length) ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}
