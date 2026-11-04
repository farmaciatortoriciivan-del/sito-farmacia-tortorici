// Rubrica "Amici a quattro zampe": ultimi articoli de La Zampa (La Stampa) dal feed RSS ufficiale.
// Il Worker legge il feed, tiene solo gli articoli utili a chi ha un animale da compagnia
// e restituisce titolo, data, immagine e link: gli articoli si leggono sul sito della testata.
import { CATENE } from "./notizie.js";
import { anteprima } from "./anziani.js";

const FEED = "https://www.lazampa.it/rss";
const TTL = 3600;
const MAX = 4;
const DOMINIO = /^https:\/\/(www\.)?(lazampa|lastampa)\.it\//;

const decode = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<[^>]+>/g, " ")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&apos;|&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/\s+/g, " ").trim();
const grezzo = (xml, name) => { const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i")); return m ? m[1] : ""; };

function leggi(xml) {
  const out = [];
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const it = m[0];
    const titolo = decode(grezzo(it, "title"));
    const link = decode(grezzo(it, "link"));
    if (!titolo || !DOMINIO.test(link)) continue;
    const desc = grezzo(it, "description");
    const img = (it.match(/<(?:media:content|media:thumbnail|enclosure)[^>]+url="([^"]+)"/i) || desc.match(/<img[^>]+src="([^"]+)"/i) || [])[1] || null;
    const d = Date.parse(decode(grezzo(it, "pubDate")));
    out.push({ titolo, link, immagine: img && /^https:\/\//.test(img) ? img.replace(/&amp;/g, "&") : null, data: isNaN(d) ? null : new Date(d).toISOString(), sommario: decode(desc).slice(0, 220) });
  }
  return out;
}

// Regola di riserva (senza AI): fuori cronaca nera, politica e temi tristi
const ESCLUDI = /maltratt|uccis|ammazz|morto|morta|morti\b|strage|violenz|abbandon.*autostrad|caccia|cacciator|processo|denunc|arrest|condann|sequestr|incidente|tragedi|sbranat|aggredit|attacc|lupi? .*(gregg|pecor)|politic|governo|ministr|legge|decreto|elezion/i;

async function scegli(env, articoli) {
  articoli = articoli.filter((a) => !CATENE.test(a.titolo + " " + a.sommario));
  if (env && env.AI && articoli.length) {
    try {
      const elenco = articoli.map((a, i) => `${i + 1}. ${a.titolo}${a.sommario ? " — " + a.sommario : ""}`).join("\n");
      const r = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [
          { role: "system", content: "Sei il redattore del sito di una farmacia di paese con reparto veterinario. Scegli SOLO gli articoli utili o piacevoli per chi ha un animale da compagnia (cane, gatto, coniglio, uccellini, pesci...): salute, cura, prevenzione, parassiti, alimentazione, comportamento, consigli pratici, stagioni e animali, curiosità serene. ESCLUDI cronaca nera, maltrattamenti, animali morti o feriti, aggressioni, caccia, processi, politica e leggi, animali selvatici o esotici senza consigli per chi ha un animale in casa, pubblicità di negozi o catene. Nel dubbio escludi. Rispondi solo con un array JSON dei numeri scelti, per esempio [1,4]. Se nessuno va bene rispondi []." },
          { role: "user", content: elenco },
        ],
        max_tokens: 60, temperature: 0,
      });
      const m = String((r && r.response) || "").match(/\[[\d,\s]*\]/);
      if (m) { const s = new Set(JSON.parse(m[0])); return articoli.filter((_, i) => s.has(i + 1)); }
    } catch (e) { /* uso la regola di riserva */ }
  }
  return articoli.filter((a) => !ESCLUDI.test(a.titolo + " " + a.sommario));
}

export async function onRequest({ request, env, ctx }) {
  const cache = caches.default;
  const key = new Request(new URL("/api/animali?v=2", request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;

  let articoli = [];
  try {
    const r = await fetch(FEED, { headers: { "user-agent": "Mozilla/5.0 (compatible; SitoFarmaciaTortorici/1.0)", accept: "application/rss+xml, application/xml, text/xml" }, cf: { cacheTtl: TTL } });
    if (r.ok) articoli = await scegli(env, leggi(await r.text()).slice(0, 20));
  } catch (e) {}
  articoli = articoli.sort((a, b) => (b.data || "").localeCompare(a.data || "")).slice(0, MAX).map(({ sommario, ...a }) => a);
  await Promise.all(articoli.map(async (a) => { if (!a.immagine) a.immagine = await anteprima(a.link); }));

  const res = new Response(JSON.stringify({ fonte: "La Zampa", aggiornato: new Date().toISOString(), articoli }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${articoli.length ? TTL : 300}` },
  });
  if (articoli.length) ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}
